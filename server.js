import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import OpenAI from 'openai';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024, files: 1 }, fileFilter: (_req, file, done) => {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) return done(new Error('Please send a JPEG, PNG, or WebP image.'));
  done(null, true);
} });
const port = Number(process.env.PORT || 3000);
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 45000, maxRetries: 1 }) : null;
const dirname = path.dirname(fileURLToPath(import.meta.url));

app.get('/api/health', (_req, res) => res.json({ ok: true, configured: Boolean(openai) }));
app.post('/api/vision', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image was received. Please capture again.' });
    if (!openai) return res.status(503).json({ error: 'AI is not configured yet. Add OPENAI_API_KEY to the .env file, then restart the server.' });
    const question = typeof req.body.question === 'string' ? req.body.question.slice(0, 500) : '';
    const image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    const prompt = question
      ? `Answer the user's question using only what is clearly visible in this single photograph: "${question}". Be concise and speak naturally. State uncertainty when needed. Do not infer safety, distance, motion, or anything outside the image.`
      : 'Describe this single photograph for a blind or low-vision user in two or three concise sentences. Prioritize useful objects, people, readable text, and approximate positions. Mention uncertainty. Do not claim to know what is outside the photograph, whether a path is safe, or whether anything is moving.';
    const result = await openai.chat.completions.create({
      model: process.env.OPENAI_VISION_MODEL || 'gpt-4o-mini',
      max_tokens: 180,
      messages: [{ role: 'user', content: [{ type: 'text', text: prompt }, { type: 'image_url', image_url: { url: image, detail: 'low' } }] }],
    });
    const answer = result.choices?.[0]?.message?.content?.trim();
    if (!answer) return res.status(502).json({ error: 'The AI did not return a description. Please try again.' });
    res.json({ answer });
  } catch (error) { next(error); }
});

app.use((error, _req, res, _next) => {
  if (error instanceof multer.MulterError) return res.status(413).json({ error: error.code === 'LIMIT_FILE_SIZE' ? 'Image is too large. Try again with a smaller image.' : 'Please send one image at a time.' });
  if (error.message?.startsWith('Please send')) return res.status(400).json({ error: error.message });
  const status = error.status || error.statusCode;
  if (status === 401) return res.status(503).json({ error: 'The AI service rejected its API key. Check OPENAI_API_KEY in .env.' });
  if (status === 429) return res.status(503).json({ error: 'The AI service is busy or its usage limit was reached. Please try again shortly.' });
  console.error('Vision request failed:', error.message);
  res.status(502).json({ error: 'The AI service could not analyze this image. Check your connection and try again.' });
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(dirname, 'dist')));
  app.get('*', (_req, res) => res.sendFile(path.join(dirname, 'dist', 'index.html')));
}

app.listen(port, () => console.log(`AURA AI server listening on http://localhost:${port} (AI ${openai ? 'configured' : 'not configured'})`));
