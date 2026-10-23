import { useEffect, useRef, useState } from 'react';
import { Aperture, Camera, CircleHelp, Mic, RotateCcw, Settings2, VolumeX, X } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function App() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recognitionRef = useRef(null);
  const [status, setStatus] = useState('Ready');
  const [busy, setBusy] = useState(false);
  const [answer, setAnswer] = useState('Tap the large button to describe what the camera sees.');
  const [question, setQuestion] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [language, setLanguage] = useState('en-US');
  const [rate, setRate] = useState(1);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [error, setError] = useState('');

  const speak = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = Number(rate);
    utterance.onstart = () => setStatus('Speaking');
    utterance.onend = () => setStatus('Ready');
    window.speechSynthesis.speak(utterance);
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraOpen(false);
  };

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    window.speechSynthesis?.cancel();
    recognitionRef.current?.abort();
  }, []);

  const getFrame = async () => {
    setError('');
    if (!navigator.mediaDevices?.getUserMedia) throw new Error('Camera access is unavailable. Open this app on localhost or a secure HTTPS connection.');
    setStatus('Starting camera');
    speak('Camera starting');
    let stream = streamRef.current;
    if (!stream) {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 960 } }, audio: false });
      } catch {
        throw new Error('I could not open the camera. Check camera permission and try again.');
      }
      streamRef.current = stream;
    }
    const video = videoRef.current;
    video.srcObject = stream;
    setCameraOpen(true);
    await video.play();
    if (!video.videoWidth) await new Promise((resolve) => { video.onloadedmetadata = resolve; });
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.82));
    if (!blob) throw new Error('I could not capture an image. Please try again.');
    stopCamera();
    return blob;
  };

  const analyze = async (userQuestion = '') => {
    if (busy) return;
    setBusy(true);
    setStatus('Capturing image');
    try {
      const image = await getFrame();
      setStatus('Analyzing image');
      speak('Analyzing the image');
      const form = new FormData();
      form.append('image', image, 'capture.jpg');
      if (userQuestion) form.append('question', userQuestion);
      const response = await fetch(`${API_BASE}/api/vision`, { method: 'POST', body: form });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'The image could not be analyzed. Check your setup and try again.');
      setAnswer(data.answer);
      speak(data.answer);
    } catch (err) {
      const message = err.message || 'Something went wrong. Please try again.';
      setError(message);
      setAnswer(message);
      speak(message);
    } finally {
      setBusy(false);
      stopCamera();
    }
  };

  const ask = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatus('Type a question');
      speak('Voice input is not available in this browser. Type your question in the question box.');
      document.getElementById('question-input')?.focus();
      return;
    }
    window.speechSynthesis?.cancel();
    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;
    setStatus('Listening');
    speak('I am listening. Ask your question.');
    recognition.onresult = (event) => {
      const spokenQuestion = event.results[0][0].transcript;
      setQuestion(spokenQuestion);
      analyze(spokenQuestion);
    };
    recognition.onerror = () => { setStatus('Ready'); setError('I could not hear that. Try again or type your question.'); };
    recognition.onend = () => { if (!busy) setStatus('Ready'); };
    recognition.start();
  };

  const submitTypedQuestion = (event) => {
    event.preventDefault();
    if (question.trim()) analyze(question.trim());
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#home" aria-label="AURA AI home"><span className="brand-mark"><Aperture size={25} strokeWidth={1.8} /></span><span><strong>AURA <em>AI</em></strong><small>Your Eyes, Your Freedom</small></span></a>
        <button className="icon-button" aria-label="Open settings" onClick={() => setSettingsOpen(true)}><Settings2 size={21} /></button>
      </header>

      <section className="hero" id="home" aria-labelledby="welcome">
        <p className="eyebrow"><span className="live-dot" /> YOUR PERSONAL VISION ASSISTANT</p>
        <h1 id="welcome">Understand what’s<br /><span>around you.</span></h1>
        <p className="intro">Point your camera. Ask a question. Hear what matters.</p>
        <button className={`primary-action ${busy ? 'is-busy' : ''}`} onClick={() => analyze()} disabled={busy} aria-label="Capture a photo and hear a description of what is visible">
          <span className="action-icon"><Camera size={27} /></span><span className="action-title">{busy ? 'PLEASE WAIT' : 'TAP TO UNDERSTAND'}</span><span className="action-hint">{busy ? status.toUpperCase() : 'Capture and describe'}</span>
        </button>
        <div className="secondary-actions">
          <button className="secondary-button" onClick={ask} disabled={busy}><Mic size={19} /><span>ASK A QUESTION</span></button>
          <button className="secondary-button" onClick={() => answer && speak(answer)} disabled={!answer}><RotateCcw size={18} /><span>REPEAT</span></button>
          <button className="secondary-button stop-button" onClick={() => { window.speechSynthesis?.cancel(); recognitionRef.current?.abort(); stopCamera(); setBusy(false); setStatus('Ready'); }}><VolumeX size={18} /><span>STOP</span></button>
        </div>
        <form className="typed-question" onSubmit={submitTypedQuestion}>
          <label className="sr-only" htmlFor="question-input">Type a question about the camera view</label>
          <input id="question-input" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Or type a question…" />
          <button type="submit" disabled={busy || !question.trim()}>Ask</button>
        </form>
      </section>

      <section className="response" aria-live="polite" aria-atomic="true">
        <div className="response-heading"><span className="response-symbol"><CircleHelp size={17} /></span><span>WHAT I HEAR</span><span className="status-pill">{status}</span></div>
        <p>{answer}</p>
        {error && <p className="error-text">{error}</p>}
      </section>

      <footer className="safety-note"><span className="note-bar" />AURA AI is an assistive tool. It may miss hazards. Use your usual mobility aids and stay aware of your surroundings.</footer>

      <video ref={videoRef} className="camera-video" playsInline muted aria-hidden="true" />

      {settingsOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setSettingsOpen(false); }}><section className="settings-modal" role="dialog" aria-modal="true" aria-labelledby="settings-title">
        <div className="modal-heading"><div><p className="eyebrow">PREFERENCES</p><h2 id="settings-title">Settings</h2></div><button className="icon-button" aria-label="Close settings" onClick={() => setSettingsOpen(false)}><X size={20} /></button></div>
        <label className="setting-label" htmlFor="language">Spoken language<select id="language" value={language} onChange={(e) => setLanguage(e.target.value)}><option value="en-US">English</option><option value="hi-IN">Hindi</option></select></label>
        <label className="setting-label" htmlFor="rate">Speech speed <span>{Number(rate).toFixed(1)}×</span><input id="rate" type="range" min="0.7" max="1.3" step="0.1" value={rate} onChange={(e) => setRate(e.target.value)} /></label>
        <p className="setting-caption">Voice availability depends on your browser and device.</p>
        <button className="secondary-button modal-done" onClick={() => setSettingsOpen(false)}>DONE</button>
      </section></div>}
    </main>
  );
}
