import { describe, it, expect } from 'vitest'
import { hexToRgb, rgbToHex } from '../colorConvert'

describe('rgbToHex', () => {
  it('converts pure red to #ff0000', () => {
    expect(rgbToHex([255, 0, 0])).toBe('#ff0000')
  })

  it('converts black [0,0,0] to #000000 (zero-pads all channels)', () => {
    expect(rgbToHex([0, 0, 0])).toBe('#000000')
  })

  it('converts white [255,255,255] to #ffffff', () => {
    expect(rgbToHex([255, 255, 255])).toBe('#ffffff')
  })

  it('zero-pads single-digit hex channel values', () => {
    // r=0 → "00", g=15 → "0f", b=1 → "01"
    expect(rgbToHex([0, 15, 1])).toBe('#000f01')
  })

  it('converts mixed values correctly', () => {
    expect(rgbToHex([0x1a, 0x2b, 0x3c])).toBe('#1a2b3c')
  })
})

describe('round-trip', () => {
  it('hexToRgb ∘ rgbToHex is identity for [r,g,b]', () => {
    const cases: [number, number, number][] = [
      [0, 0, 0],
      [255, 255, 255],
      [128, 64, 32],
      [0, 15, 1],
    ]
    for (const rgb of cases) {
      expect(hexToRgb(rgbToHex(rgb))).toEqual(rgb)
    }
  })

  it('rgbToHex ∘ hexToRgb is identity for hex strings', () => {
    const cases = ['#000000', '#ffffff', '#ff0000', '#1a2b3c', '#000f01']
    for (const hex of cases) {
      expect(rgbToHex(hexToRgb(hex))).toBe(hex)
    }
  })
})

describe('hexToRgb', () => {
  it('parses a pure-red hex string', () => {
    expect(hexToRgb('#ff0000')).toEqual([255, 0, 0])
  })

  it('parses black (#000000) as [0,0,0]', () => {
    expect(hexToRgb('#000000')).toEqual([0, 0, 0])
  })

  it('parses white (#ffffff) as [255,255,255]', () => {
    expect(hexToRgb('#ffffff')).toEqual([255, 255, 255])
  })

  it('parses mixed channel values correctly', () => {
    expect(hexToRgb('#1a2b3c')).toEqual([0x1a, 0x2b, 0x3c])
  })

  it('parses a value where one channel needs zero-padding in reverse', () => {
    // #000f01 → r=0, g=15, b=1
    expect(hexToRgb('#000f01')).toEqual([0, 15, 1])
  })
})
