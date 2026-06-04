import type { AdjustmentParams } from '../types'
import { useImageProcessor } from '../hooks/useImageProcessor'

interface CanvasProps {
  sourceImage: HTMLImageElement
  params: AdjustmentParams
  canvasRef: React.RefObject<HTMLCanvasElement | null>
}

export function Canvas({ sourceImage, params, canvasRef }: CanvasProps) {
  useImageProcessor(sourceImage, params, canvasRef)

  return (
    <div className="flex h-full w-full items-center justify-center p-4 overflow-hidden">
      <canvas
        ref={canvasRef as React.RefObject<HTMLCanvasElement>}
        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
        style={{ imageRendering: 'auto' }}
      />
    </div>
  )
}
