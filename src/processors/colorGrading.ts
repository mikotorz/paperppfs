import type { AdjustmentParams } from '../types'

function clamp(v: number): number {
  return v < 0 ? 0 : v > 255 ? 255 : v
}

function hue2rgb(p: number, q: number, t: number): number {
  if (t < 0) t += 1
  if (t > 1) t -= 1
  if (t < 1 / 6) return p + (q - p) * 6 * t
  if (t < 1 / 2) return q
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
  return p
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) {
    const v = Math.round(l * 255)
    return [v, v, v]
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  return [
    Math.round(hue2rgb(p, q, h / 360 + 1 / 3) * 255),
    Math.round(hue2rgb(p, q, h / 360) * 255),
    Math.round(hue2rgb(p, q, h / 360 - 1 / 3) * 255),
  ]
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return [0, 0, l]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
  else if (max === g) h = ((b - r) / d + 2) / 6
  else h = ((r - g) / d + 4) / 6
  return [h * 360, s, l]
}

export function applyColorGrading(data: Uint8ClampedArray, _w: number, _h: number, params: AdjustmentParams): Uint8ClampedArray {
  const d = new Uint8ClampedArray(data)

  const hueShift = params.hueRotation
  const rShift = (params.redBalance / 100) * 50
  const gShift = (params.greenBalance / 100) * 50
  const bShift = (params.blueBalance / 100) * 50

  const [shadowH, shadowS, shadowStr] = params.shadowTint
  const [highlightH, highlightS, highlightStr] = params.highlightTint
  const hasShadow = shadowStr > 0
  const hasHighlight = highlightStr > 0

  let shadowRgb: [number, number, number] = [0, 0, 0]
  let highlightRgb: [number, number, number] = [0, 0, 0]
  if (hasShadow) shadowRgb = hslToRgb(shadowH, shadowS / 100, 0.5)
  if (hasHighlight) highlightRgb = hslToRgb(highlightH, highlightS / 100, 0.5)

  const needsHue = hueShift !== 0
  const needsBalance = rShift !== 0 || gShift !== 0 || bShift !== 0
  const needsTone = hasShadow || hasHighlight

  for (let i = 0; i < d.length; i += 4) {
    let r = d[i], g = d[i + 1], b = d[i + 2]

    if (needsHue) {
      const [h, s, l] = rgbToHsl(r, g, b)
      const [nr, ng, nb] = hslToRgb((h + hueShift) % 360, s, l)
      r = nr; g = ng; b = nb
    }

    if (needsBalance) {
      r = clamp(r + rShift)
      g = clamp(g + gShift)
      b = clamp(b + bShift)
    }

    if (needsTone) {
      const luma = 0.299 * r + 0.587 * g + 0.114 * b
      let sw = 0, hw = 0
      if (luma < 80) sw = 1
      else if (luma > 175) hw = 1
      else {
        sw = (175 - luma) / 95
        hw = 1 - sw
      }

      const tintScale = 0.003
      if (hasShadow && sw > 0) {
        const str = sw * shadowStr * tintScale
        r = clamp(r + (shadowRgb[0] - 128) * str)
        g = clamp(g + (shadowRgb[1] - 128) * str)
        b = clamp(b + (shadowRgb[2] - 128) * str)
      }
      if (hasHighlight && hw > 0) {
        const str = hw * highlightStr * tintScale
        r = clamp(r + (highlightRgb[0] - 128) * str)
        g = clamp(g + (highlightRgb[1] - 128) * str)
        b = clamp(b + (highlightRgb[2] - 128) * str)
      }
    }

    d[i] = r; d[i + 1] = g; d[i + 2] = b
  }

  return d
}
