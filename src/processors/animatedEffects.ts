function seededRand(seed: number): () => number {
  let s = (seed >>> 0) || 1
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return s / 0xFFFFFFFF
  }
}

export function drawHolographic(ctx: CanvasRenderingContext2D, w: number, h: number, t: number): void {
  const pos = (t * 0.4) % 1.0
  const hue = (t * 60) % 360
  const grad = ctx.createLinearGradient(0, 0, w, h)
  const p0 = Math.max(0, pos - 0.15)
  const p1 = Math.min(1, pos + 0.15)
  grad.addColorStop(p0, 'rgba(0,0,0,0)')
  grad.addColorStop(pos, `hsla(${hue}, 100%, 70%, 0.30)`)
  grad.addColorStop(p1, 'rgba(0,0,0,0)')
  ctx.globalCompositeOperation = 'screen'
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)
  ctx.globalCompositeOperation = 'source-over'
}

export function drawCRT(ctx: CanvasRenderingContext2D, w: number, h: number, t: number): void {
  const bandY = ((t * 0.3) % 1.0) * h
  const bandGrad = ctx.createLinearGradient(0, bandY - 15, 0, bandY + 15)
  bandGrad.addColorStop(0, 'rgba(255,255,255,0)')
  bandGrad.addColorStop(0.5, 'rgba(255,255,255,0.06)')
  bandGrad.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = bandGrad
  ctx.fillRect(0, bandY - 15, w, 30)

  const flicker = Math.sin(t * 7.3) * 0.015 + Math.sin(t * 13.7) * 0.008
  const alpha = Math.max(0, Math.min(0.04, -flicker + 0.02))
  ctx.fillStyle = `rgba(0,0,0,${alpha})`
  ctx.fillRect(0, 0, w, h)
}

export function drawVHS(ctx: CanvasRenderingContext2D, w: number, h: number, t: number): void {
  const frameIdx = Math.floor(t * 24)
  const rand = seededRand(frameIdx * 7919 + 3)

  // Chromatic haze bands (red/blue offset pairs)
  ctx.globalCompositeOperation = 'screen'
  const numBands = 2 + Math.floor(rand() * 3)
  for (let i = 0; i < numBands; i++) {
    const y = Math.floor(rand() * h)
    const bh = 2 + Math.floor(rand() * 8)
    ctx.fillStyle = `rgba(255,0,0,0.04)`
    ctx.fillRect(-2, y, w + 2, bh)
    ctx.fillStyle = `rgba(0,0,255,0.04)`
    ctx.fillRect(2, y, w - 2, bh)
  }
  ctx.globalCompositeOperation = 'source-over'

  // Random head-switching white lines
  if (rand() < 0.08) {
    const gy = Math.floor(rand() * h)
    const gh = 1 + Math.floor(rand() * 3)
    ctx.fillStyle = `rgba(255,255,255,0.15)`
    ctx.fillRect(0, gy, w, gh)
  }

  // Slow-rolling dark bar
  const barY = ((t * 0.15) % 1.0) * (h + 40) - 20
  const barGrad = ctx.createLinearGradient(0, barY - 20, 0, barY + 20)
  barGrad.addColorStop(0, 'rgba(0,0,0,0)')
  barGrad.addColorStop(0.5, 'rgba(0,0,0,0.12)')
  barGrad.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = barGrad
  ctx.fillRect(0, barY - 20, w, 40)
}

export function drawFilmReel(ctx: CanvasRenderingContext2D, w: number, h: number, t: number): void {
  const frameIdx = Math.floor(t * 18)
  const rand = seededRand(frameIdx * 6271 + 17)

  // Vertical scratch lines
  const numScratches = Math.floor(rand() * 2) + 1
  ctx.lineWidth = 1
  for (let i = 0; i < numScratches; i++) {
    const sx = Math.floor(rand() * w)
    const alpha = 0.05 + rand() * 0.2
    const thick = rand() < 0.25 ? 2 : 1
    ctx.strokeStyle = `rgba(255,255,255,${alpha})`
    ctx.lineWidth = thick
    const y0 = Math.floor(rand() * h * 0.3)
    const y1 = Math.min(h, Math.floor(y0 + rand() * h * 0.7 + h * 0.1))
    ctx.beginPath()
    ctx.moveTo(sx, y0)
    ctx.lineTo(sx + (rand() - 0.5) * 3, y1)
    ctx.stroke()
  }

  // Dust spots
  const numDust = Math.floor(rand() * 4)
  for (let i = 0; i < numDust; i++) {
    const dx = Math.floor(rand() * w)
    const dy = Math.floor(rand() * h)
    const dr = 1 + rand() * 2.5
    ctx.beginPath()
    ctx.arc(dx, dy, dr, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(255,255,255,${0.25 + rand() * 0.45})`
    ctx.fill()
  }

  // Frame jump flash every ~8 seconds
  const jumpCycle = Math.floor(t / 8)
  const jumpRand = seededRand(jumpCycle * 9901 + 7)
  const jumpT = (t % 8) / 8
  if (jumpT < 0.04 && jumpRand() > 0.5) {
    const fadeOut = 1 - jumpT / 0.04
    ctx.fillStyle = `rgba(255,255,255,${0.3 * fadeOut})`
    ctx.fillRect(0, 0, w, h)
  }
}

export function drawNeonPulse(ctx: CanvasRenderingContext2D, w: number, h: number, t: number): void {
  const pulse = Math.sin(t * 2.5) * 0.5 + 0.5
  const hue = (t * 40) % 360
  const minDim = Math.min(w, h)

  ctx.globalCompositeOperation = 'screen'

  // Radial glow from edges
  const edgeGrad = ctx.createRadialGradient(w / 2, h / 2, minDim * 0.25, w / 2, h / 2, minDim * 0.75)
  edgeGrad.addColorStop(0, 'rgba(0,0,0,0)')
  edgeGrad.addColorStop(1, `hsla(${hue}, 100%, 60%, ${0.07 + pulse * 0.11})`)
  ctx.fillStyle = edgeGrad
  ctx.fillRect(0, 0, w, h)

  // Moving horizontal scan-glow
  const scanY = ((t * 0.8 + Math.sin(t * 0.3) * 0.1) % 1.0) * h
  const scanGrad = ctx.createLinearGradient(0, scanY - 4, 0, scanY + 4)
  scanGrad.addColorStop(0, 'rgba(0,0,0,0)')
  scanGrad.addColorStop(0.5, `hsla(${(hue + 60) % 360}, 100%, 80%, ${0.14 + pulse * 0.1})`)
  scanGrad.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = scanGrad
  ctx.fillRect(0, scanY - 4, w, 8)

  ctx.globalCompositeOperation = 'source-over'
}

export function drawLightning(ctx: CanvasRenderingContext2D, w: number, h: number, t: number): void {
  ctx.globalCompositeOperation = 'screen'

  // Always-visible background corona
  const corona = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.min(w, h) * 0.7)
  corona.addColorStop(0, 'rgba(0,0,0,0)')
  corona.addColorStop(1, `rgba(100,120,255,${0.04 + 0.02 * Math.sin(t * 8)})`)
  ctx.fillStyle = corona
  ctx.fillRect(0, 0, w, h)

  const frameIdx = Math.floor(t * 15)
  const rand = seededRand(frameIdx * 8191 + 3)

  if (rand() > 0.978) {
    const x0 = rand() * w
    drawLightningBranch(ctx, x0, 0, x0 + (rand() - 0.5) * 60, h * (0.4 + rand() * 0.4), 3, rand)
  }

  ctx.globalCompositeOperation = 'source-over'
}

function drawLightningBranch(
  ctx: CanvasRenderingContext2D,
  x1: number, y1: number,
  x2: number, y2: number,
  depth: number,
  rand: () => number,
): void {
  const midX = (x1 + x2) / 2 + (rand() - 0.5) * Math.abs(y2 - y1) * 0.5
  const midY = (y1 + y2) / 2

  // Glow pass
  ctx.strokeStyle = `rgba(180,200,255,${0.15 * depth})`
  ctx.lineWidth = depth * 0.8 + 0.5
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(midX, midY); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(midX, midY); ctx.lineTo(x2, y2); ctx.stroke()

  // Core pass
  ctx.strokeStyle = 'rgba(255,255,255,0.9)'
  ctx.lineWidth = 0.5
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(midX, midY); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(midX, midY); ctx.lineTo(x2, y2); ctx.stroke()

  if (depth > 1) {
    drawLightningBranch(ctx, x1, y1, midX, midY, depth - 1, rand)
    drawLightningBranch(ctx, midX, midY, x2, y2, depth - 1, rand)
    if (rand() > 0.7) {
      drawLightningBranch(ctx, midX, midY, midX + (rand() - 0.5) * 80, midY + rand() * 100, depth - 1, rand)
    }
  }
}

export function drawRain(ctx: CanvasRenderingContext2D, w: number, h: number, t: number): void {
  ctx.globalCompositeOperation = 'screen'
  const N = 200
  for (let i = 0; i < N; i++) {
    const rand = seededRand(i * 2311 + 7)
    const xBase = rand() * w
    const speed = 0.08 + rand() * 0.12
    const phase = rand()
    const len = (0.02 + rand() * 0.04) * h
    const alpha = 0.05 + rand() * 0.12
    const lineW = 0.5 + rand() * 0.5

    const y = ((phase + speed * t) % 1.0) * h

    const grad = ctx.createLinearGradient(xBase, y, xBase, y + len)
    grad.addColorStop(0, 'rgba(180,210,255,0)')
    grad.addColorStop(0.5, `rgba(200,225,255,${alpha})`)
    grad.addColorStop(1, 'rgba(180,210,255,0)')
    ctx.strokeStyle = grad
    ctx.lineWidth = lineW
    ctx.beginPath()
    ctx.moveTo(xBase, y)
    ctx.lineTo(xBase, y + len)
    ctx.stroke()
  }
  ctx.globalCompositeOperation = 'source-over'
}

export function drawFire(ctx: CanvasRenderingContext2D, w: number, h: number, t: number): void {
  ctx.globalCompositeOperation = 'screen'
  const N = 300
  for (let i = 0; i < N; i++) {
    const rand = seededRand(i * 3571 + 13)
    const xBase = w * (0.05 + rand() * 0.9)
    const phase = rand()
    const lifespan = 0.4 + rand() * 0.8
    const age = ((t + phase) % lifespan) / lifespan

    if (age > 0.9) continue

    const y = h - age * h * 0.6
    const x = xBase + Math.sin(t * 3.0 + i) * 15 * age
    const frac = Math.min(age / 0.5, 1.0)
    const r = Math.round(255 + frac * (200 - 255))
    const g = Math.round(120 + frac * (30 - 120))
    const alpha = (1.0 - age / 0.9) * 0.35
    const size = (1.0 - age) * 4 + 1

    ctx.beginPath()
    ctx.arc(x, y, size, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(${r},${g},0,${alpha})`
    ctx.fill()
  }
  ctx.globalCompositeOperation = 'source-over'
}

const MATRIX_CHARS = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン'

export function drawMatrix(ctx: CanvasRenderingContext2D, w: number, h: number, t: number): void {
  ctx.globalCompositeOperation = 'screen'
  const CHAR_SIZE = 14
  const cols = Math.floor(w / CHAR_SIZE)
  ctx.font = `${CHAR_SIZE}px monospace`

  for (let c = 0; c < cols; c++) {
    const rand = seededRand(c * 7919 + 31)
    const speed = 40 + rand() * 80
    const phaseOffset = rand() * (h + 200)

    const headY = ((t * speed + phaseOffset) % (h + 200)) - 200

    for (let row = 0; row < 20; row++) {
      const y = headY - row * CHAR_SIZE
      if (y < -CHAR_SIZE || y > h) continue

      if (row === 0) {
        ctx.fillStyle = 'rgba(220,255,220,0.9)'
      } else {
        const alpha = Math.max(0, (1 - row / 20) * 0.6)
        ctx.fillStyle = `rgba(0,255,60,${alpha})`
      }

      const charIdx = Math.floor(rand() * MATRIX_CHARS.length + t * 2 + row * 3) % MATRIX_CHARS.length
      ctx.fillText(MATRIX_CHARS[Math.abs(charIdx)], c * CHAR_SIZE, y)
    }
  }
  ctx.globalCompositeOperation = 'source-over'
}

export function drawRGBJitter(ctx: CanvasRenderingContext2D, w: number, h: number, t: number): void {
  // Mostly calm — only glitches occasionally
  const isGlitch = Math.sin(t * 3.7) > 0.6
  if (!isGlitch) return

  const frameIdx = Math.floor(t * 30)
  const rand = seededRand(frameIdx * 4337 + 11)
  if (rand() > 0.7) return  // thin out further

  const offsetX = (rand() * 2 - 1) * 10
  const offsetY = (rand() * 2 - 1) * 3
  const alpha = 0.05 + rand() * 0.09

  ctx.globalCompositeOperation = 'screen'
  ctx.fillStyle = `rgba(255,0,0,${alpha})`
  ctx.fillRect(offsetX, offsetY, w, h)
  ctx.fillStyle = `rgba(0,0,255,${alpha})`
  ctx.fillRect(-offsetX, -offsetY, w, h)
  ctx.globalCompositeOperation = 'source-over'
}
