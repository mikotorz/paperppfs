import { useEffect, useRef } from 'react'
import type { AnimatedEffect } from '../types'
import { drawHolographic, drawCRT, drawVHS, drawFilmReel, drawNeonPulse, drawRGBJitter } from '../processors/animatedEffects'

interface AnimatedOverlayProps {
  effect: AnimatedEffect
  mainCanvasRef: React.RefObject<HTMLCanvasElement | null>
  tilt3D: boolean
  tilt: { x: number; y: number }
}

export function AnimatedOverlay({ effect, mainCanvasRef, tilt3D, tilt }: AnimatedOverlayProps) {
  const overlayRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const startTimeRef = useRef<number>(performance.now())

  useEffect(() => {
    const canvas = overlayRef.current
    if (!canvas) return

    if (effect === 'none') {
      const ctx = canvas.getContext('2d')
      ctx?.clearRect(0, 0, canvas.width, canvas.height)
      return
    }

    const tick = (now: number) => {
      const mainCanvas = mainCanvasRef.current
      if (!mainCanvas) { rafRef.current = requestAnimationFrame(tick); return }

      const mainRect = mainCanvas.getBoundingClientRect()
      const parentRect = canvas.parentElement!.getBoundingClientRect()
      const left = mainRect.left - parentRect.left
      const top = mainRect.top - parentRect.top
      const w = Math.round(mainRect.width)
      const h = Math.round(mainRect.height)
      if (canvas.width !== w) canvas.width = w
      if (canvas.height !== h) canvas.height = h
      canvas.style.left = `${left}px`
      canvas.style.top = `${top}px`
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`

      const ctx = canvas.getContext('2d')
      if (!ctx) { rafRef.current = requestAnimationFrame(tick); return }

      ctx.clearRect(0, 0, w, h)
      ctx.drawImage(mainCanvas, 0, 0, w, h)
      const t = (now - startTimeRef.current) / 1000

      if (effect === 'holographic') drawHolographic(ctx, w, h, t)
      else if (effect === 'crt') drawCRT(ctx, w, h, t)
      else if (effect === 'vhs') drawVHS(ctx, w, h, t)
      else if (effect === 'filmreel') drawFilmReel(ctx, w, h, t)
      else if (effect === 'neonpulse') drawNeonPulse(ctx, w, h, t)
      else if (effect === 'rgbjitter') drawRGBJitter(ctx, w, h, t)

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [effect, mainCanvasRef])

  return (
    <canvas
      ref={overlayRef}
      style={{
        position: 'absolute',
        pointerEvents: 'none',
        transform: tilt3D
          ? `perspective(800px) rotateY(${tilt.x}deg) rotateX(${-tilt.y}deg)`
          : 'none',
        transition: 'transform 0.05s linear',
      }}
    />
  )
}
