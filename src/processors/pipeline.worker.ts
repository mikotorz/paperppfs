import { processPipeline } from './pipeline'
import type { AdjustmentParams } from '../types'

self.onmessage = (e: MessageEvent) => {
  const { gen, pixels, width, height, params } = e.data as {
    gen: number
    pixels: ArrayBuffer
    width: number
    height: number
    params: AdjustmentParams
  }
  const result = processPipeline(new Uint8ClampedArray(pixels), width, height, params)
  self.postMessage({ gen, pixels: result.buffer, width, height }, [result.buffer])
}
