import type { AdjustmentParams } from '../types'
import { applyAdjustments } from './adjustments'
import { applyColorGrading } from './colorGrading'
import { applyArtisticEffects } from './artisticEffects'

// Each entry wraps its processor so the registry is typed uniformly on
// AdjustmentParams (a structural superset of every narrow param type).
type ProcessorFn = (
  data: Uint8ClampedArray,
  w: number,
  h: number,
  params: AdjustmentParams,
) => Uint8ClampedArray

const PROCESSORS: ProcessorFn[] = [
  (d, w, h, p) => applyAdjustments(d, w, h, p),
  (d, w, h, p) => applyColorGrading(d, w, h, p),
  (d, w, h, p) => applyArtisticEffects(d, w, h, p),
]

export function processPipeline(
  data: Uint8ClampedArray,
  w: number,
  h: number,
  params: AdjustmentParams,
): Uint8ClampedArray {
  let pixels = new Uint8ClampedArray(data)
  for (const apply of PROCESSORS) {
    pixels = apply(pixels, w, h, params)
  }
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
