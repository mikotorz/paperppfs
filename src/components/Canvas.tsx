import { useState, useCallback } from 'react'
import type { AdjustmentParams, AnimatedEffect } from '../types'
import { useImageProcessor } from '../hooks/useImageProcessor'
import { AnimatedOverlay } from './AnimatedOverlay'

interface CanvasProps {
  sourceImage: HTMLImageElement
  params: AdjustmentParams
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  cropOverlay?: React.ReactNode
  animatedEffect: AnimatedEffect
  tilt3D: boolean
}

export function Canvas({ sourceImage, params, canvasRef, cropOverlay, animatedEffect, tilt3D }: CanvasProps) {
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

  return (
    <div
      className="relative flex h-full w-full items-center justify-center p-4 overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <canvas
        ref={canvasRef as React.RefObject<HTMLCanvasElement>}
        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
        style={{
          imageRendering: 'auto',
          transform: tilt3D
            ? `perspective(800px) rotateY(${tilt.x}deg) rotateX(${-tilt.y}deg)`
            : 'none',
          transition: 'transform 0.05s linear',
        }}
      />
      {animatedEffect !== 'none' && (
        <AnimatedOverlay effect={animatedEffect} mainCanvasRef={canvasRef} />
      )}
      {cropOverlay}
    </div>
  )
}
