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

  // Glitch slices
  if (params.glitchSlices >= 1 && params.glitchOffset >= 1) {
    d = applyGlitch(d, w, h, params)
  }

  // Scanlines
  if (params.scanlines > 0) {
    d = applyScanlines(d, w, h, params)
  }

  // Cross-process
  if (params.crossProcessStrength > 0) {
    d = applyCrossProcess(d, w, h, params.crossProcessStrength)
  }

  // Duotone
  if (params.duotoneStrength > 0) {
    d = applyDuotone(d, w, h, params)
  }

  // Light leak
  if (params.lightLeakStrength > 0) {
    d = applyLightLeak(d, w, h, params.lightLeakStrength)
  }

  // Halftone
  if (params.halftoneSize >= 2) {
    d = applyHalftone(d, w, h, params)
  }

  // Bloom
  if (params.bloomStrength > 0) {
    d = applyBloom(d, w, h, params)
  }

  return d
}

function seededRand(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return s / 0xFFFFFFFF
  }
}

function applyGlitch(d: Uint8ClampedArray, w: number, h: number, params: AdjustmentParams): Uint8ClampedArray {
  const out = new Uint8ClampedArray(d)
  const rand = seededRand(params.glitchSlices * 1000 + params.glitchOffset)
  const n = Math.round(params.glitchSlices)
  for (let i = 0; i < n; i++) {
    const y0 = Math.floor(rand() * h)
    const sh = Math.floor(rand() * 8) + 2
    const dx = Math.floor((rand() * 2 - 1) * params.glitchOffset)
    for (let y = y0; y < Math.min(y0 + sh, h); y++) {
      for (let x = 0; x < w; x++) {
        const srcX = Math.min(Math.max(x - dx, 0), w - 1)
        const oi = (y * w + x) * 4
        const si = (y * w + srcX) * 4
        out[oi] = d[si]
        out[oi + 1] = d[si + 1]
        out[oi + 2] = d[si + 2]
      }
    }
  }
  return out
}

function applyScanlines(d: Uint8ClampedArray, w: number, h: number, params: AdjustmentParams): Uint8ClampedArray {
  const out = new Uint8ClampedArray(d)
  const factor = (params.scanlines / 100) * 0.85
  for (let y = 0; y < h; y += 2) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      out[i] = clamp(out[i] * (1 - factor))
      out[i + 1] = clamp(out[i + 1] * (1 - factor))
      out[i + 2] = clamp(out[i + 2] * (1 - factor))
    }
  }
  return out
}

function applyCrossProcess(d: Uint8ClampedArray, w: number, h: number, strength: number): Uint8ClampedArray {
  const s = strength / 100
  // Build per-channel LUTs via S-curves with distinct tensions
  const redLUT = new Uint8Array(256)
  const greenLUT = new Uint8Array(256)
  const blueLUT = new Uint8Array(256)
  for (let v = 0; v < 256; v++) {
    const t = v / 255
    // Red: warm push in midtones
    redLUT[v] = clamp(255 * (t + 0.25 * t * (1 - t) * (2 * t - 1) + 0.08))
    // Green: slight compression
    greenLUT[v] = clamp(255 * (t - 0.15 * t * (1 - t) * (2 * t - 1)))
    // Blue: shadow crush, highlight lift
    blueLUT[v] = clamp(255 * (t + 0.3 * t * (1 - t) * (2 * t - 1) - 0.06))
  }
  const out = new Uint8ClampedArray(d)
  const n = w * h * 4
  for (let i = 0; i < n; i += 4) {
    out[i]     = clamp(d[i]     + s * (redLUT[d[i]]     - d[i]))
    out[i + 1] = clamp(d[i + 1] + s * (greenLUT[d[i + 1]] - d[i + 1]))
    out[i + 2] = clamp(d[i + 2] + s * (blueLUT[d[i + 2]] - d[i + 2]))
  }
  return out
}

function applyDuotone(d: Uint8ClampedArray, w: number, h: number, params: AdjustmentParams): Uint8ClampedArray {
  const s = params.duotoneStrength / 100
  const [sr, sg, sb] = params.duotoneShadowColor
  const [hr, hg, hb] = params.duotoneHighlightColor
  const out = new Uint8ClampedArray(d)
  const n = w * h * 4
  for (let i = 0; i < n; i += 4) {
    const t = (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]) / 255
    const r = sr + (hr - sr) * t
    const g = sg + (hg - sg) * t
    const b = sb + (hb - sb) * t
    out[i]     = clamp(d[i]     + s * (r - d[i]))
    out[i + 1] = clamp(d[i + 1] + s * (g - d[i + 1]))
    out[i + 2] = clamp(d[i + 2] + s * (b - d[i + 2]))
  }
  return out
}

const LEAK_BLOBS: Array<{ x: number; y: number; r: number; rgb: [number, number, number] }> = [
  { x: 0.05, y: 0.08, r: 0.55, rgb: [255, 120, 30] },
  { x: 0.92, y: 0.88, r: 0.40, rgb: [255, 60, 80] },
]

function applyLightLeak(d: Uint8ClampedArray, w: number, h: number, strength: number): Uint8ClampedArray {
  const s = strength / 100
  const out = new Uint8ClampedArray(d)
  const n = w * h * 4
  for (let idx = 0; idx < n; idx += 4) {
    const px = ((idx / 4) % w) / w
    const py = Math.floor(idx / 4 / w) / h
    let addR = 0, addG = 0, addB = 0
    for (const blob of LEAK_BLOBS) {
      const dx = px - blob.x
      const dy = py - blob.y
      const dist = Math.sqrt(dx * dx + dy * dy) / blob.r
      const falloff = Math.max(0, 1 - dist) ** 2
      addR += falloff * blob.rgb[0]
      addG += falloff * blob.rgb[1]
      addB += falloff * blob.rgb[2]
    }
    out[idx]     = clamp(d[idx]     + s * addR)
    out[idx + 1] = clamp(d[idx + 1] + s * addG)
    out[idx + 2] = clamp(d[idx + 2] + s * addB)
  }
  return out
}

function makeGaussianKernel(radius: number): number[] {
  const size = radius * 2 + 1
  const sigma = radius / 3
  const kernel: number[] = []
  let sum = 0
  for (let i = 0; i < size; i++) {
    const x = i - radius
    const v = Math.exp(-(x * x) / (2 * sigma * sigma))
    kernel.push(v)
    sum += v
  }
  return kernel.map(v => v / sum)
}

function separableBlur(src: Uint8ClampedArray, w: number, h: number, radius: number): Uint8ClampedArray {
  const kernel = makeGaussianKernel(radius)
  const r = radius
  const tmp = new Uint8ClampedArray(src.length)
  const out = new Uint8ClampedArray(src.length)
  // Horizontal pass
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let R = 0, G = 0, B = 0
      for (let k = -r; k <= r; k++) {
        const sx = Math.min(Math.max(x + k, 0), w - 1)
        const si = (y * w + sx) * 4
        const kv = kernel[k + r]
        R += src[si] * kv
        G += src[si + 1] * kv
        B += src[si + 2] * kv
      }
      const di = (y * w + x) * 4
      tmp[di] = R; tmp[di + 1] = G; tmp[di + 2] = B; tmp[di + 3] = src[di + 3]
    }
  }
  // Vertical pass
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let R = 0, G = 0, B = 0
      for (let k = -r; k <= r; k++) {
        const sy = Math.min(Math.max(y + k, 0), h - 1)
        const si = (sy * w + x) * 4
        const kv = kernel[k + r]
        R += tmp[si] * kv
        G += tmp[si + 1] * kv
        B += tmp[si + 2] * kv
      }
      const di = (y * w + x) * 4
      out[di] = R; out[di + 1] = G; out[di + 2] = B; out[di + 3] = tmp[di + 3]
    }
  }
  return out
}

function applyBloom(d: Uint8ClampedArray, w: number, h: number, params: AdjustmentParams): Uint8ClampedArray {
  const s = params.bloomStrength / 100
  const thresh = params.bloomThreshold
  const radius = Math.max(1, Math.round(params.bloomRadius))
  // Extract highlights mask
  const mask = new Uint8ClampedArray(d.length)
  const n = w * h * 4
  for (let i = 0; i < n; i += 4) {
    const luma = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]
    if (luma > thresh) {
      mask[i] = d[i]; mask[i + 1] = d[i + 1]; mask[i + 2] = d[i + 2]; mask[i + 3] = 255
    }
  }
  const blurred = separableBlur(mask, w, h, radius)
  const out = new Uint8ClampedArray(d)
  for (let i = 0; i < n; i += 4) {
    out[i]     = clamp(d[i]     + blurred[i]     * s)
    out[i + 1] = clamp(d[i + 1] + blurred[i + 1] * s)
    out[i + 2] = clamp(d[i + 2] + blurred[i + 2] * s)
  }
  return out
}

function applyHalftone(d: Uint8ClampedArray, w: number, h: number, params: AdjustmentParams): Uint8ClampedArray {
  const bs = Math.round(params.halftoneSize)
  if (params.halftoneCMYK) {
    return applyHalftoneCMYK(d, w, h, bs)
  }
  return applyHalftoneBW(d, w, h, bs, params.halftoneAngle)
}

function applyHalftoneBW(
  d: Uint8ClampedArray,
  w: number,
  h: number,
  bs: number,
  angleDeg: number,
): Uint8ClampedArray {
  const out = new Uint8ClampedArray(w * h * 4)
  for (let i = 3; i < out.length; i += 4) out[i] = 255  // alpha
  const angleRad = (angleDeg * Math.PI) / 180
  const cos = Math.cos(-angleRad)
  const sin = Math.sin(-angleRad)
  const cx = w / 2
  const cy = h / 2

  // For each output pixel, determine which halftone cell it belongs to
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      // Rotate pixel coords
      const rx = cos * (x - cx) - sin * (y - cy)
      const ry = sin * (x - cx) + cos * (y - cy)
      // Cell index in rotated grid
      const cellX = Math.floor(rx / bs)
      const cellY = Math.floor(ry / bs)
      // Cell center in rotated grid
      const cellCX = (cellX + 0.5) * bs
      const cellCY = (cellY + 0.5) * bs
      // Distance from pixel to cell center in rotated space
      const dist = Math.sqrt((rx - cellCX) ** 2 + (ry - cellCY) ** 2)
      // Sample source luma for this cell (un-rotate cell center back to image)
      const imgCX = cos * cellCX + sin * cellCY + cx
      const imgCY = -sin * cellCX + cos * cellCY + cy
      const sx = Math.min(Math.max(Math.round(imgCX), 0), w - 1)
      const sy = Math.min(Math.max(Math.round(imgCY), 0), h - 1)
      let luma = 0
      let count = 0
      for (let dy = -Math.ceil(bs / 2); dy <= Math.ceil(bs / 2); dy++) {
        for (let dx2 = -Math.ceil(bs / 2); dx2 <= Math.ceil(bs / 2); dx2++) {
          const qx = Math.min(Math.max(sx + dx2, 0), w - 1)
          const qy = Math.min(Math.max(sy + dy, 0), h - 1)
          const qi = (qy * w + qx) * 4
          luma += 0.299 * d[qi] + 0.587 * d[qi + 1] + 0.114 * d[qi + 2]
          count++
        }
      }
      luma = count > 0 ? luma / count : 128
      // Dot radius: darker = bigger dot
      const dotRadius = (bs / 2) * (1 - luma / 255)
      const oi = (y * w + x) * 4
      const inside = dist <= dotRadius
      out[oi] = inside ? 0 : 255
      out[oi + 1] = inside ? 0 : 255
      out[oi + 2] = inside ? 0 : 255
    }
  }
  return out
}

function applyHalftoneCMYK(
  d: Uint8ClampedArray,
  w: number,
  h: number,
  bs: number,
): Uint8ClampedArray {
  // Standard CMYK screen angles
  const angles = [15, 75, 0, 45] // C, M, Y, K in degrees
  const out = new Uint8ClampedArray(d.length)
  for (let i = 3; i < out.length; i += 4) out[i] = 255

  // Decompose to CMYK and halftone each channel
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const oi = (y * w + x) * 4
      // Accumulate contributions from C, M, Y, K dot patterns
      let outR = 255, outG = 255, outB = 255  // start white (subtractive)

      const channelDefs = [
        { angle: angles[0], getVal: (i: number) => 1 - d[i] / 255 },           // C from R
        { angle: angles[1], getVal: (i: number) => 1 - d[i + 1] / 255 },       // M from G
        { angle: angles[2], getVal: (i: number) => 1 - d[i + 2] / 255 },       // Y from B
        { angle: angles[3], getVal: (i: number) => {                            // K = min channel
          const r = d[i] / 255, g = d[i + 1] / 255, b = d[i + 2] / 255
          return 1 - Math.max(r, g, b)
        }},
      ]

      for (let ch = 0; ch < 4; ch++) {
        const angleRad = (channelDefs[ch].angle * Math.PI) / 180
        const cos = Math.cos(-angleRad)
        const sin = Math.sin(-angleRad)
        const cx = w / 2, cy = h / 2
        const rx = cos * (x - cx) - sin * (y - cy)
        const ry = sin * (x - cx) + cos * (y - cy)
        const cellX = Math.floor(rx / bs)
        const cellY = Math.floor(ry / bs)
        const cellCX = (cellX + 0.5) * bs
        const cellCY = (cellY + 0.5) * bs
        const dist = Math.sqrt((rx - cellCX) ** 2 + (ry - cellCY) ** 2)
        // Sample cell centre in image space
        const imgCX = cos * cellCX + sin * cellCY + cx
        const imgCY = -sin * cellCX + cos * cellCY + cy
        const sx = Math.min(Math.max(Math.round(imgCX), 0), w - 1)
        const sy = Math.min(Math.max(Math.round(imgCY), 0), h - 1)
        let val = 0, count = 0
        for (let dy = -Math.ceil(bs / 2); dy <= Math.ceil(bs / 2); dy++) {
          for (let dx2 = -Math.ceil(bs / 2); dx2 <= Math.ceil(bs / 2); dx2++) {
            const qx = Math.min(Math.max(sx + dx2, 0), w - 1)
            const qy = Math.min(Math.max(sy + dy, 0), h - 1)
            const qi = (qy * w + qx) * 4
            val += channelDefs[ch].getVal(qi)
            count++
          }
        }
        val = count > 0 ? val / count : 0
        const dotRadius = (bs / 2) * val
        if (dist <= dotRadius) {
          // Subtractive: this channel's ink is present
          if (ch === 0) { outR -= 255; outG -= 255 }           // C removes R+G
          else if (ch === 1) { outR -= 255; outB -= 255 }      // M removes R+B
          else if (ch === 2) { outG -= 255; outB -= 255 }      // Y removes G+B
          else { outR -= 255; outG -= 255; outB -= 255 }       // K removes all
        }
      }
      out[oi]     = clamp(outR)
      out[oi + 1] = clamp(outG)
      out[oi + 2] = clamp(outB)
    }
  }
  return out
}
