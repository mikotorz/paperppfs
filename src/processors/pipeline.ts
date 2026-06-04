import type { AdjustmentParams } from '../types'
import { applyAdjustments } from './adjustments'
import { applyColorGrading } from './colorGrading'
import { applyArtisticEffects } from './artisticEffects'

export function runPipeline(
  sourceData: ImageData,
  params: AdjustmentParams,
  outputCtx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
): void {
  const { width: w, height: h } = sourceData

  let pixels = new Uint8ClampedArray(sourceData.data)
  pixels = applyAdjustments(pixels, w, h, params)
  pixels = applyColorGrading(pixels, w, h, params)
  pixels = applyArtisticEffects(pixels, w, h, params)

  const outImageData = new ImageData(pixels, w, h)
  outputCtx.putImageData(outImageData, 0, 0)
}
