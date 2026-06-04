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

  // Extract source ImageData when image changes
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
  }, [sourceImage])

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

  useEffect(() => {
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(render)
    return () => cancelAnimationFrame(rafRef.current)
  }, [render])
}
