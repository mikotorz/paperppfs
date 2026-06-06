import { describe, it, expect } from 'vitest'
import { applyAdjustments } from '../adjustments'
import { DEFAULT_PARAMS } from '../../constants/defaults'
import type { AdjustmentParams } from '../../types'

function params(overrides: Partial<AdjustmentParams> = {}): AdjustmentParams {
  return { ...DEFAULT_PARAMS, ...overrides }
}

function px(r: number, g: number, b: number, a = 255): Uint8ClampedArray {
  return new Uint8ClampedArray([r, g, b, a])
}

describe('applyAdjustments', () => {
  describe('brightness', () => {
    it('brightness=0 does not change pixels', () => {
      const input = px(100, 150, 200)
      const out = applyAdjustments(input, 1, 1, params())
      expect(Array.from(out)).toEqual([100, 150, 200, 255])
    })

    it('brightness=100 clamps all channels to 255', () => {
      const input = px(10, 20, 30)
      const out = applyAdjustments(input, 1, 1, params({ brightness: 100 }))
      expect(out[0]).toBe(255)
      expect(out[1]).toBe(255)
      expect(out[2]).toBe(255)
    })

    it('brightness=-100 clamps all channels to 0', () => {
      const input = px(200, 150, 100)
      const out = applyAdjustments(input, 1, 1, params({ brightness: -100 }))
      expect(out[0]).toBe(0)
      expect(out[1]).toBe(0)
      expect(out[2]).toBe(0)
    })

    it('alpha channel is preserved regardless of brightness', () => {
      const input = px(100, 100, 100, 128)
      const outPos = applyAdjustments(input, 1, 1, params({ brightness: 50 }))
      const outNeg = applyAdjustments(input, 1, 1, params({ brightness: -50 }))
      expect(outPos[3]).toBe(128)
      expect(outNeg[3]).toBe(128)
    })
  })

  describe('contrast', () => {
    it('contrast=0 does not change pixels', () => {
      const input = px(80, 120, 200)
      const out = applyAdjustments(input, 1, 1, params({ contrast: 0 }))
      expect(Array.from(out)).toEqual([80, 120, 200, 255])
    })

    it('contrast > 0 pushes values away from 128', () => {
      // A value above 128 should increase; below 128 should decrease
      const light = px(200, 200, 200)
      const dark = px(50, 50, 50)
      const outLight = applyAdjustments(light, 1, 1, params({ contrast: 50 }))
      const outDark = applyAdjustments(dark, 1, 1, params({ contrast: 50 }))
      expect(outLight[0]).toBeGreaterThan(200)
      expect(outDark[0]).toBeLessThan(50)
    })
  })

  describe('saturation', () => {
    it('saturation=0 does not change pixels', () => {
      const input = px(100, 150, 200)
      const out = applyAdjustments(input, 1, 1, params({ saturation: 0 }))
      expect(Array.from(out)).toEqual([100, 150, 200, 255])
    })

    it('saturation=-100 converts pixel to grayscale (all channels equal luma)', () => {
      const input = px(255, 0, 0)
      const out = applyAdjustments(input, 1, 1, params({ saturation: -100 }))
      // luma = 0.299*255 + 0.587*0 + 0.114*0 = 76.245 → 76
      expect(out[0]).toBe(out[1])
      expect(out[1]).toBe(out[2])
    })

    it('saturation=100 increases color distance from gray', () => {
      // A slightly saturated pixel should become more vivid
      const input = px(200, 128, 100)
      const neutral = applyAdjustments(input, 1, 1, params({ saturation: 0 }))
      const boosted = applyAdjustments(input, 1, 1, params({ saturation: 50 }))
      const rangeNeutral = Math.max(neutral[0], neutral[1], neutral[2]) - Math.min(neutral[0], neutral[1], neutral[2])
      const rangeBoosted = Math.max(boosted[0], boosted[1], boosted[2]) - Math.min(boosted[0], boosted[1], boosted[2])
      expect(rangeBoosted).toBeGreaterThan(rangeNeutral)
    })
  })

  describe('blur', () => {
    it('blur=0 does not change pixels', () => {
      const input = new Uint8ClampedArray([100, 150, 200, 255, 50, 80, 120, 255])
      const out = applyAdjustments(input, 2, 1, params({ blur: 0 }))
      expect(Array.from(out)).toEqual([100, 150, 200, 255, 50, 80, 120, 255])
    })
  })

  describe('sharpness', () => {
    it('sharpness=0 does not change pixels', () => {
      const input = new Uint8ClampedArray([100, 150, 200, 255, 50, 80, 120, 255])
      const out = applyAdjustments(input, 2, 1, params({ sharpness: 0 }))
      expect(Array.from(out)).toEqual([100, 150, 200, 255, 50, 80, 120, 255])
    })

    it('sharpness > 0 increases the difference between a bright pixel and its darker neighbour', () => {
      // 3-pixel row: dark | bright | dark  — sharpening pushes bright higher, darks lower
      const input = new Uint8ClampedArray([
        50, 50, 50, 255,
        200, 200, 200, 255,
        50, 50, 50, 255,
      ])
      const base = applyAdjustments(input, 3, 1, params({ sharpness: 0 }))
      const sharp = applyAdjustments(input, 3, 1, params({ sharpness: 100 }))
      // centre pixel should be boosted (brighter than the already-bright value)
      expect(sharp[4]).toBeGreaterThan(base[4])
      // edge pixels should be pulled down (darker than the dark value)
      expect(sharp[0]).toBeLessThan(base[0])
    })

    it('sharpness preserves alpha', () => {
      const input = new Uint8ClampedArray([200, 200, 200, 128, 50, 50, 50, 128])
      const out = applyAdjustments(input, 2, 1, params({ sharpness: 100 }))
      expect(out[3]).toBe(128)
      expect(out[7]).toBe(128)
    })
  })
})
