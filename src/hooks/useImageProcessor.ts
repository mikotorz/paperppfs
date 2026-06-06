import { useCallback, useEffect, useRef } from 'react'
import type { AdjustmentParams } from '../types'
import { runPipeline } from '../processors/pipeline'
import { createPreviewData } from '../utils/downsample'
import PipelineWorker from '../processors/pipeline.worker.ts?worker'

const PREVIEW_MAX = 1200
const COMMIT_DELAY_MS = 300

export function useImageProcessor(
  sourceImage: HTMLImageElement | null,
  params: AdjustmentParams,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
) {
  const sourceDataRef = useRef<ImageData | null>(null)
  const previewDataRef = useRef<ImageData | null>(null)
  const rafRef = useRef<number>(0)
  const commitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const workerRef = useRef<Worker | null>(null)
  const genRef = useRef(0)

  const renderWith = useCallback((data: ImageData) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    if (canvas.width !== data.width) canvas.width = data.width
    if (canvas.height !== data.height) canvas.height = data.height
    runPipeline(data, params, ctx)
  }, [canvasRef, params])

  // Stable ref so RAF callbacks and timers always use the latest render function
  const renderWithRef = useRef(renderWith)
  renderWithRef.current = renderWith

  // Stable ref so the debounce closure always posts the latest params
  const paramsRef = useRef(params)
  paramsRef.current = params

  // Create the worker once and wire up its message handler
  useEffect(() => {
    const worker = new PipelineWorker()
    workerRef.current = worker
    worker.onmessage = (e) => {
      if (e.data.gen !== genRef.current) return  // stale result, discard
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      const { pixels, width, height } = e.data
      if (canvas.width !== width) canvas.width = width
      if (canvas.height !== height) canvas.height = height
      ctx.putImageData(new ImageData(new Uint8ClampedArray(pixels), width, height), 0, 0)
    }
    return () => worker.terminate()
  }, [canvasRef])

  // Extract source ImageData when image changes, then force a repaint.
  useEffect(() => {
    if (!sourceImage) {
      sourceDataRef.current = null
      previewDataRef.current = null
      return
    }
    const tmp = document.createElement('canvas')
    tmp.width = sourceImage.naturalWidth
    tmp.height = sourceImage.naturalHeight
    const ctx = tmp.getContext('2d')!
    ctx.drawImage(sourceImage, 0, 0)
    const full = ctx.getImageData(0, 0, tmp.width, tmp.height)
    sourceDataRef.current = full
    previewDataRef.current = createPreviewData(full, PREVIEW_MAX)
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() =>
      renderWithRef.current(previewDataRef.current ?? sourceDataRef.current!)
    )
  }, [sourceImage])

  // Re-render when params change: immediate preview on main thread, full-res via worker.
  useEffect(() => {
    const preview = previewDataRef.current
    const full = sourceDataRef.current
    if (!preview && !full) return

    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() =>
      renderWithRef.current(preview ?? full!)
    )

    if (commitTimerRef.current) clearTimeout(commitTimerRef.current)
    if (full && preview !== full && workerRef.current) {
      const gen = ++genRef.current
      commitTimerRef.current = setTimeout(() => {
        const buf = full.data.buffer.slice(0)  // copy so source buffer stays usable
        workerRef.current!.postMessage(
          { gen, pixels: buf, width: full.width, height: full.height, params: paramsRef.current },
          [buf],
        )
      }, COMMIT_DELAY_MS)
    }

    return () => {
      cancelAnimationFrame(rafRef.current)
      if (commitTimerRef.current) clearTimeout(commitTimerRef.current)
    }
  }, [renderWith])
}
