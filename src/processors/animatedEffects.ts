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
