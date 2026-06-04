import { useCallback, useEffect, useRef } from 'react'
import type { AdjustmentParams } from '../types'
import { runPipeline } from '../processors/pipeline'

export function useImageProcessor(
  sourceImage: HTMLImageElement | null,
  params: AdjustmentParams,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
) {
  const sourceDataRef = useRef<ImageData | null>(null)
  const rafRef = useRef<number>(0)

  const render = useCallback(() => {
    const sourceData = sourceDataRef.current
    const canvas = canvasRef.current
    if (!sourceData || !canvas) return

    canvas.width = sourceData.width
    canvas.height = sourceData.height
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    runPipeline(sourceData, params, ctx)
  }, [canvasRef, params])

  // Always keep a stable ref to the latest render so the source-extraction
  // effect can schedule a repaint without taking render as a dependency
  // (which would cause unnecessary re-extractions on every param change).
  const renderRef = useRef(render)
  renderRef.current = render

  // Extract source ImageData when image changes, then force a repaint.
  // This effect intentionally does NOT depend on `render` — we read it via
  // renderRef so that changing params alone doesn't re-extract source data.
  useEffect(() => {
    if (!sourceImage) {
      sourceDataRef.current = null
      return
    }
    const tmp = document.createElement('canvas')
    tmp.width = sourceImage.naturalWidth
    tmp.height = sourceImage.naturalHeight
    const ctx = tmp.getContext('2d')!
    ctx.drawImage(sourceImage, 0, 0)
    sourceDataRef.current = ctx.getImageData(0, 0, tmp.width, tmp.height)
    // Source changed — schedule a render so the canvas reflects the new image.
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => renderRef.current())
  }, [sourceImage])

  // Re-render when params or canvasRef change (adjustments, effects, etc.)
  useEffect(() => {
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(render)
    return () => cancelAnimationFrame(rafRef.current)
  }, [render])
}
