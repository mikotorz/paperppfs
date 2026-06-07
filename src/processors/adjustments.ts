import type { AdjustParams } from '../types'

function clamp(v: number): number {
  return v < 0 ? 0 : v > 255 ? 255 : v
}

function makeGaussianKernel(radius: number): number[] {
  const size = radius * 2 + 1
  const sigma = radius / 2
  const kernel: number[] = new Array(size)
  let sum = 0
  for (let i = 0; i < size; i++) {
    const x = i - radius
    kernel[i] = Math.exp(-(x * x) / (2 * sigma * sigma))
    sum += kernel[i]
  }
  for (let i = 0; i < size; i++) kernel[i] /= sum
  return kernel
}

function separableBlur(src: Uint8ClampedArray, w: number, h: number, radius: number): Uint8ClampedArray {
  if (radius < 1) return src
  const kernel = makeGaussianKernel(radius)
  const tmp = new Uint8ClampedArray(src.length)
  const dst = new Uint8ClampedArray(src.length)

  // Horizontal pass: src → tmp
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let r = 0, g = 0, b = 0
      for (let k = -radius; k <= radius; k++) {
        const sx = Math.min(Math.max(x + k, 0), w - 1)
        const idx = (y * w + sx) * 4
        const kv = kernel[k + radius]
        r += src[idx] * kv
        g += src[idx + 1] * kv
        b += src[idx + 2] * kv
      }
      const i = (y * w + x) * 4
      tmp[i] = r; tmp[i + 1] = g; tmp[i + 2] = b; tmp[i + 3] = src[i + 3]
    }
  }

  // Vertical pass: tmp → dst
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let r = 0, g = 0, b = 0
      for (let k = -radius; k <= radius; k++) {
        const sy = Math.min(Math.max(y + k, 0), h - 1)
        const idx = (sy * w + x) * 4
        const kv = kernel[k + radius]
        r += tmp[idx] * kv
        g += tmp[idx + 1] * kv
        b += tmp[idx + 2] * kv
      }
      const i = (y * w + x) * 4
      dst[i] = r; dst[i + 1] = g; dst[i + 2] = b; dst[i + 3] = tmp[i + 3]
    }
  }

  return dst
}

export function applyAdjustments(data: Uint8ClampedArray, w: number, h: number, params: AdjustParams): Uint8ClampedArray {
  let d = new Uint8ClampedArray(data)

  // Brightness
  if (params.brightness !== 0) {
    const add = (params.brightness / 100) * 255
    for (let i = 0; i < d.length; i += 4) {
      d[i] = clamp(d[i] + add)
      d[i + 1] = clamp(d[i + 1] + add)
      d[i + 2] = clamp(d[i + 2] + add)
    }
  }

  // Contrast
  if (params.contrast !== 0) {
    const c = (params.contrast / 100) * 255
    const factor = (259 * (c + 255)) / (255 * (259 - c))
    for (let i = 0; i < d.length; i += 4) {
      d[i] = clamp(factor * (d[i] - 128) + 128)
      d[i + 1] = clamp(factor * (d[i + 1] - 128) + 128)
      d[i + 2] = clamp(factor * (d[i + 2] - 128) + 128)
    }
  }

  // Saturation
  if (params.saturation !== 0) {
    const t = 1 + params.saturation / 100
    for (let i = 0; i < d.length; i += 4) {
      const luma = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]
      d[i] = clamp(luma + t * (d[i] - luma))
      d[i + 1] = clamp(luma + t * (d[i + 1] - luma))
      d[i + 2] = clamp(luma + t * (d[i + 2] - luma))
    }
  }

  // Blur
  if (params.blur > 0) {
    const radius = Math.round(params.blur)
    d = separableBlur(d, w, h, radius)
  }

  // Sharpness (unsharp mask)
  if (params.sharpness > 0) {
    const blurred = separableBlur(d, w, h, 2)
    const strength = (params.sharpness / 100) * 1.5
    for (let i = 0; i < d.length; i += 4) {
      d[i] = clamp(d[i] + strength * (d[i] - blurred[i]))
      d[i + 1] = clamp(d[i + 1] + strength * (d[i + 1] - blurred[i + 1]))
      d[i + 2] = clamp(d[i + 2] + strength * (d[i + 2] - blurred[i + 2]))
    }
  }

  return d
}
