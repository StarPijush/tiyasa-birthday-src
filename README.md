# 💗 Happy Birthday Tiyasa

A romantic, cinematic birthday surprise website built with React + Vite.

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:5173 and share with Tiyasa ❤️

## Build for deployment

```bash
npm run build
npm run preview
```

The `dist/` folder can be deployed to Netlify, Vercel, or any static host.

## Pages

| Route | Page |
|-------|------|
| `/` | Landing — floating petals, "Hey Tiyasa…" |
| `/message` | Typewriter love letter |
| `/chats` | Chat memory bubbles |
| `/story` | Your story in sections |
| `/cake` | Drag to cut the birthday cake 🎂 |
| `/chocolate` | Tap chocolates for messages 🍫 |
| `/lotus` | Cinematic lotus bloom finale 🌸 |
| `/final` | "Check your WhatsApp ❤️" |

## Customisation

- Edit `src/pages/Message.jsx` → `MESSAGE_LINES[]` for the typewriter letter
- Edit `src/pages/Chats.jsx` → `chatSections[]` for chat memories
- Edit `src/pages/Story.jsx` → `storySections[]` for your story
- Edit `src/pages/Chocolate.jsx` → `CHOCOLATES[]` for chocolate messages
- Edit `src/pages/Lotus.jsx` → `FINAL_LINES[]` for the finale message

## Stack

- React 18 + Vite 5
- Framer Motion (animations)
- React Router v6 (navigation)
- Howler.js / Web Audio API (sounds)
- canvas-confetti (cake cutting confetti)
