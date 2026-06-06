> **AI-Generated Disclaimer**
>
> This project — including all source code, architecture, pixel-manipulation algorithms, component structure, and this README — was generated entirely by [Claude](https://claude.ai) (Anthropic), an AI assistant. It was produced via [Claude Code](https://claude.ai/code) in response to natural-language prompts.
>
> The code has been reviewed for correctness and type-checks cleanly, but has not been audited for production security or exhaustively tested across all browsers and image sizes. Use at your own discretion.

# paperppfs

A browser-based photo editing tool with filters, effects, color grading, and crop. All image processing happens entirely on your device — no uploads, no server, no data leaves your browser.

## Features

- **Crop** — Free-draw or constrained by aspect ratio (1:1, 4:3, 16:9, 2:3, 5:7 and portrait flips); drag to reposition the selection
- **Basic Adjustments** — Brightness, contrast, saturation, sharpness, and Gaussian blur
- **Filter Presets** — One-click presets: Vintage, Noir, Vivid, Faded, Warm, Cool, Matte, Chrome, Fade
- **Color Grading** — Hue rotation, per-channel RGB balance, shadow/highlight split-tone
- **Artistic Effects** — Vignette, film grain, chromatic aberration, pixelate, emboss, glitch, scanlines, cross-process, duotone, light leak, halftone, bloom
- **Animated Overlays** — Holographic, CRT, VHS, Film Reel, Neon Pulse, RGB Jitter (preview only, not exported)
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
- Web Worker for non-blocking full-resolution rendering

## How It Works

Every adjustment runs a pixel pipeline entirely in the browser:

1. Source pixels are extracted from the uploaded image once and kept immutable
2. On each slider change, a **downsampled preview** (≤ 1200px) is rendered immediately via `requestAnimationFrame` — fast enough to stay smooth during drags
3. After edits settle (~300 ms), the full-resolution pipeline runs in a **Web Worker** so the main thread is never blocked
4. All three stages — adjustments → color grading → artistic effects — are applied to the pixel buffer without touching any server
5. Crop replaces the source image with the selected region, resetting the pipeline to the cropped pixels
