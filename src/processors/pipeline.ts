import type { AdjustmentParams } from '../types'
import { applyAdjustments } from './adjustments'
import { applyColorGrading } from './colorGrading'
import { applyArtisticEffects } from './artisticEffects'

export function processPipeline(
  data: Uint8ClampedArray,
  w: number,
  h: number,
  params: AdjustmentParams,
): Uint8ClampedArray {
  let pixels = new Uint8ClampedArray(data)
  pixels = applyAdjustments(pixels, w, h, params)
  pixels = applyColorGrading(pixels, w, h, params)
  pixels = applyArtisticEffects(pixels, w, h, params)
  return pixels
}

export function runPipeline(
  sourceData: ImageData,
  params: AdjustmentParams,
  outputCtx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
): void {
  const { width: w, height: h } = sourceData
  const pixels = processPipeline(sourceData.data, w, h, params)
  outputCtx.putImageData(new ImageData(pixels, w, h), 0, 0)
}
