import { describe, it, expect } from 'vitest'
import { applyColorGrading } from '../colorGrading'
import { DEFAULT_PARAMS } from '../../constants/defaults'
import type { AdjustmentParams } from '../../types'

function params(overrides: Partial<AdjustmentParams> = {}): AdjustmentParams {
  return { ...DEFAULT_PARAMS, ...overrides }
}

function px(r: number, g: number, b: number, a = 255): Uint8ClampedArray {
  return new Uint8ClampedArray([r, g, b, a])
}

describe('applyColorGrading', () => {
  describe('identity', () => {
    it('all-neutral params do not change pixels', () => {
      const input = px(100, 150, 200)
      const out = applyColorGrading(input, 1, 1, params())
      expect(Array.from(out)).toEqual([100, 150, 200, 255])
    })

    it('alpha channel is preserved', () => {
      const input = px(100, 100, 100, 64)
      const out = applyColorGrading(input, 1, 1, params({ hueRotation: 90 }))
      expect(out[3]).toBe(64)
    })
  })

  describe('color balance', () => {
    it('redBalance=100 increases the red channel', () => {
      // rShift = (100/100)*50 = 50
      const input = px(100, 100, 100)
      const out = applyColorGrading(input, 1, 1, params({ redBalance: 100 }))
      expect(out[0]).toBe(150)
      expect(out[1]).toBe(100)
      expect(out[2]).toBe(100)
    })

    it('greenBalance=100 increases the green channel', () => {
      const input = px(100, 100, 100)
      const out = applyColorGrading(input, 1, 1, params({ greenBalance: 100 }))
      expect(out[0]).toBe(100)
      expect(out[1]).toBe(150)
      expect(out[2]).toBe(100)
    })

    it('blueBalance=-100 decreases the blue channel', () => {
      // bShift = (-100/100)*50 = -50
      const input = px(100, 100, 100)
      const out = applyColorGrading(input, 1, 1, params({ blueBalance: -100 }))
      expect(out[0]).toBe(100)
      expect(out[1]).toBe(100)
      expect(out[2]).toBe(50)
    })
  })

  describe('hue rotation', () => {
    it('hueRotation=0 does not change a colored pixel', () => {
      const input = px(255, 0, 0)
      const out = applyColorGrading(input, 1, 1, params({ hueRotation: 0 }))
      expect(Array.from(out)).toEqual([255, 0, 0, 255])
    })

    it('hueRotation=180 turns pure red into cyan', () => {
      // red hsl(0,1,0.5) → hsl(180,1,0.5) = cyan (0,255,255)
      const input = px(255, 0, 0)
      const out = applyColorGrading(input, 1, 1, params({ hueRotation: 180 }))
      expect(out[0]).toBe(0)
      expect(out[1]).toBe(255)
      expect(out[2]).toBe(255)
    })

    it('hueRotation=360 returns to the original color', () => {
      const input = px(200, 80, 40)
      const out = applyColorGrading(input, 1, 1, params({ hueRotation: 360 }))
      // 360 mod 360 = 0, so same hue
      expect(out[0]).toBe(input[0])
      expect(out[1]).toBe(input[1])
      expect(out[2]).toBe(input[2])
    })
  })
})
