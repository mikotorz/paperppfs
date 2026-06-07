import { useState, useCallback, useEffect } from 'react'
import { clsx } from 'clsx'
import type { AdjustmentParams, AnimatedEffect, AnimatedEffectState } from '../types'
import { useImageProcessor } from '../hooks/useImageProcessor'
import { AnimatedOverlay } from './AnimatedOverlay'
import { WebGLOverlay } from './WebGLOverlay'
import { WEBGL_EFFECTS } from '../processors/glslShaders'

interface CanvasProps {
  sourceImage: HTMLImageElement
  params: AdjustmentParams
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  cropOverlay?: React.ReactNode
  animatedEffect: AnimatedEffect
  tilt3D: boolean
  theaterMode: boolean
  onAnimatedStateChange: (partial: Partial<AnimatedEffectState>) => void
}

export function Canvas({
  sourceImage, params, canvasRef, cropOverlay,
  animatedEffect, tilt3D, theaterMode, onAnimatedStateChange,
}: CanvasProps) {
  useImageProcessor(sourceImage, params, canvasRef)

  const [tilt, setTilt] = useState({ x: 0, y: 0 })

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!tilt3D) return
    const rect = e.currentTarget.getBoundingClientRect()
    const nx = (e.clientX - rect.left) / rect.width - 0.5
    const ny = (e.clientY - rect.top) / rect.height - 0.5
    setTilt({ x: nx * 12, y: ny * 12 })
  }, [tilt3D])

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 })
  }, [])

  // Escape key exits theater mode
  useEffect(() => {
    if (!theaterMode) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onAnimatedStateChange({ theaterMode: false })
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [theaterMode, onAnimatedStateChange])

  const showTheaterButton = animatedEffect !== 'none' || theaterMode

  return (
    <div
      className={clsx(
        'flex items-center justify-center p-4 overflow-hidden',
        theaterMode
          ? 'fixed inset-0 z-50 bg-black'
          : 'relative h-full w-full',
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <canvas
        ref={canvasRef as React.RefObject<HTMLCanvasElement>}
        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
        style={{
          imageRendering: 'auto',
          // Only tilt the canvas when no overlay is covering it; when an overlay is
          // active the canvas is hidden and the overlay receives the tilt instead.
          transform: tilt3D && animatedEffect === 'none'
            ? `perspective(800px) rotateY(${tilt.x}deg) rotateX(${-tilt.y}deg)`
            : 'none',
          transition: 'transform 0.05s linear',
          visibility: animatedEffect !== 'none' ? 'hidden' : 'visible',
        }}
      />
      {animatedEffect !== 'none' && !WEBGL_EFFECTS.has(animatedEffect) && (
        <AnimatedOverlay effect={animatedEffect} mainCanvasRef={canvasRef} tilt3D={tilt3D} tilt={tilt} />
      )}
      {WEBGL_EFFECTS.has(animatedEffect) && (
        <WebGLOverlay effect={animatedEffect} mainCanvasRef={canvasRef} tilt3D={tilt3D} tilt={tilt} />
      )}
      {showTheaterButton && (
        <button
          onClick={() => onAnimatedStateChange({ theaterMode: !theaterMode })}
          title={theaterMode ? 'Exit theater mode (Esc)' : 'Theater mode'}
          className="absolute top-2 right-2 z-10 rounded p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          {theaterMode ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2H2v4M10 2h4v4M6 14H2v-4M10 14h4v-4"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4"/>
            </svg>
          )}
        </button>
      )}
      {cropOverlay}
    </div>
  )
}
