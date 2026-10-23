# AURA AI — Your Eyes, Your Freedom

A small hackathon MVP that captures one photo, asks a vision model to describe it or answer one question, and reads the response aloud. The goal is to demonstrate the central idea with a short setup and one backend service.

## What works

- Rear-camera photo capture in a browser, with permission and failure handling.
- AI-generated scene descriptions and image-grounded questions through the OpenAI API.
- Spoken answers, repeat and stop controls, browser speech input, and typed question fallback.
- English/Hindi speech preference and adjustable speech speed.
- A compact accessibility-first screen and an honest safety note.

This MVP does not include OCR, currency classification, continuous obstacle monitoring, authentication, a database, or spatial alerts. A single photo cannot establish that a path is clear or detect motion. Keep using a cane, guide dog, or other mobility aids.

## Run on Windows

Prerequisite: Node.js 20 or newer.

In PowerShell, from the project directory:

```powershell
npm install
Copy-Item .env.example .env
notepad .env
```

Set `OPENAI_API_KEY` in `.env` to an API key from the OpenAI platform. The key stays on the server and is never sent to the browser. You may set `OPENAI_VISION_MODEL` to another compatible vision model.

Start the backend in one terminal:

```powershell
npm start
```

Start the frontend in a second terminal:

```powershell
npm run dev
```

Open the Vite URL shown in the second terminal, usually `http://localhost:5173`. Allow camera access. Tap **TAP TO UNDERSTAND** or ask a voice question. The backend health check is `http://localhost:3000/api/health`.

## Notes

- Camera access requires localhost during development or HTTPS when deployed.
- Speech recognition support varies by browser; use the question text field if voice input is unavailable. Speech output depends on device voices.
- The app sends the captured photo to the configured AI provider for the request and does not save it to disk or a database.
- Without an API key, the app starts but returns a clear setup message when analysis is requested.
- For a production deployment, serve the built app over HTTPS and keep the API key only in the backend environment. Do not commit `.env`.
