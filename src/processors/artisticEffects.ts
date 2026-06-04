import type { AdjustmentParams } from '../types'

function clamp(v: number): number {
  return v < 0 ? 0 : v > 255 ? 255 : v
}

export function applyArtisticEffects(data: Uint8ClampedArray, w: number, h: number, params: AdjustmentParams): Uint8ClampedArray {
  let d = new Uint8ClampedArray(data)

  // Emboss
  if (params.emboss > 0) {
    const kernel = [-2, -1, 0, -1, 1, 1, 0, 1, 2]
    const src = new Uint8ClampedArray(d)
    const blend = params.emboss / 100
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let val = 0
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const sy = Math.min(Math.max(y + ky, 0), h - 1)
            const sx = Math.min(Math.max(x + kx, 0), w - 1)
            const si = (sy * w + sx) * 4
            const luma = 0.299 * src[si] + 0.587 * src[si + 1] + 0.114 * src[si + 2]
            val += luma * kernel[(ky + 1) * 3 + (kx + 1)]
          }
        }
        const embossed = clamp(val + 128)
        const i = (y * w + x) * 4
        d[i] = clamp(d[i] + blend * (embossed - d[i]))
        d[i + 1] = clamp(d[i + 1] + blend * (embossed - d[i + 1]))
        d[i + 2] = clamp(d[i + 2] + blend * (embossed - d[i + 2]))
      }
    }
  }

  // Pixelate
  if (params.pixelate > 1) {
    const bs = Math.round(params.pixelate)
    for (let by = 0; by < h; by += bs) {
      for (let bx = 0; bx < w; bx += bs) {
        let r = 0, g = 0, b = 0, count = 0
        for (let py = by; py < Math.min(by + bs, h); py++) {
          for (let px = bx; px < Math.min(bx + bs, w); px++) {
            const i = (py * w + px) * 4
            r += d[i]; g += d[i + 1]; b += d[i + 2]; count++
          }
        }
        r = Math.round(r / count)
        g = Math.round(g / count)
        b = Math.round(b / count)
        for (let py = by; py < Math.min(by + bs, h); py++) {
          for (let px = bx; px < Math.min(bx + bs, w); px++) {
            const i = (py * w + px) * 4
            d[i] = r; d[i + 1] = g; d[i + 2] = b
          }
        }
      }
    }
  }

  // Chromatic Aberration
  if (params.chromaticAberration > 0) {
    const offset = Math.round(params.chromaticAberration)
    const src = new Uint8ClampedArray(d)
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4
        const rSrcX = Math.min(Math.max(x - offset, 0), w - 1)
        const bSrcX = Math.min(Math.max(x + offset, 0), w - 1)
        d[i] = src[(y * w + rSrcX) * 4]
        d[i + 2] = src[(y * w + bSrcX) * 4 + 2]
      }
    }
  }

  // Film Grain
  if (params.grain > 0) {
    const amount = (params.grain / 100) * 60
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const seed = ((x * 1664525 + y * 1013904223) >>> 0)
        const noise = ((seed >> 16) & 0xFF) - 128
        const add = (noise * amount) / 128
        const i = (y * w + x) * 4
        d[i] = clamp(d[i] + add)
        d[i + 1] = clamp(d[i + 1] + add)
        d[i + 2] = clamp(d[i + 2] + add)
      }
    }
  }

  // Vignette
  if (params.vignette > 0) {
    const strength = (params.vignette / 100) * 1.5
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const dx = x / w - 0.5
        const dy = y / h - 0.5
        const dist = Math.sqrt(dx * dx + dy * dy) / 0.7071
        const darkening = dist * dist * strength
        const i = (y * w + x) * 4
        d[i] = clamp(d[i] * (1 - darkening))
        d[i + 1] = clamp(d[i + 1] * (1 - darkening))
        d[i + 2] = clamp(d[i + 2] * (1 - darkening))
      }
    }
  }

  return d
}
