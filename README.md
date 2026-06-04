# Photo Editor

A browser-based photo editing tool with filters, effects, and color grading. All image processing happens entirely on your device — no uploads, no server, no data leaves your browser.

## Features

- **Basic Adjustments** — Brightness, contrast, saturation, sharpness, and Gaussian blur
- **Filter Presets** — 10 one-click presets: Vintage, Noir, Vivid, Faded, Warm, Cool, Matte, Chrome, Fade
- **Color Grading** — Hue rotation, per-channel RGB balance, shadow/highlight split-tone
- **Artistic Effects** — Vignette, film grain, chromatic aberration, pixelate, emboss
- **Export** — Download the edited image as a lossless PNG

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173), drop in a photo, and start editing.

## Build

```bash
npm run build
```

Produces a `dist/` folder that works as a fully static site — open `dist/index.html` directly in a browser or deploy to any static host (Netlify, Vercel, GitHub Pages).

## Tech Stack

- [React 18](https://react.dev/) + TypeScript
- [Vite](https://vite.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- Canvas 2D API for pixel-level image processing

## How It Works

Every adjustment runs a pixel pipeline entirely in the browser using the [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API):

1. Source pixels are extracted from the uploaded image once and kept immutable
2. On each slider change, the full pipeline re-runs from the source: adjustments → color grading → artistic effects
3. Output is written to a `<canvas>` element via `requestAnimationFrame` (debounced, so rapid drags never block the UI)

---

> **AI-Generated Disclaimer**
>
> This project — including all source code, architecture, pixel-manipulation algorithms, component structure, and this README — was generated entirely by [Claude](https://claude.ai) (Anthropic), an AI assistant. It was produced in a single session via [Claude Code](https://claude.ai/code) in response to a natural-language prompt requesting a client-side photo editing tool.
>
> The code has been reviewed for correctness and type-checks cleanly, but has not been audited for production security or exhaustively tested across all browsers and image sizes. Use at your own discretion.
