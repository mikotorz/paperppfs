import { describe, it, expect } from 'vitest'
import { applyArtisticEffects } from '../artisticEffects'
import { DEFAULT_PARAMS } from '../../constants/defaults'
import type { AdjustmentParams } from '../../types'

function params(overrides: Partial<AdjustmentParams> = {}): AdjustmentParams {
  return { ...DEFAULT_PARAMS, ...overrides }
}

// Build an NxN pixel buffer from flat RGBA values
function makeGrid(pixels: number[]): Uint8ClampedArray {
  return new Uint8ClampedArray(pixels)
}

describe('applyArtisticEffects', () => {
  describe('identity', () => {
    it('all-neutral params do not change pixels', () => {
      const input = makeGrid([100, 150, 200, 255, 50, 80, 120, 255])
      const out = applyArtisticEffects(input, 2, 1, params())
      expect(Array.from(out)).toEqual([100, 150, 200, 255, 50, 80, 120, 255])
    })
  })

  describe('pixelate', () => {
    it('pixelate=1 (default) does not change pixels', () => {
      const input = makeGrid([10, 20, 30, 255, 40, 50, 60, 255])
      const out = applyArtisticEffects(input, 2, 1, params({ pixelate: 1 }))
      expect(Array.from(out)).toEqual([10, 20, 30, 255, 40, 50, 60, 255])
    })

    it('pixelate=2 averages all pixels in a 2x2 block', () => {
      // 2x2 grid: pixels (0,0,0) (4,4,4) / (0,0,0) (4,4,4) → avg = (2,2,2)
      const input = makeGrid([
        0, 0, 0, 255,   4, 4, 4, 255,
        0, 0, 0, 255,   4, 4, 4, 255,
      ])
      const out = applyArtisticEffects(input, 2, 2, params({ pixelate: 2 }))
      expect(out[0]).toBe(2)
      expect(out[4]).toBe(2)
      expect(out[8]).toBe(2)
      expect(out[12]).toBe(2)
    })

    it('pixelate=2 on a uniform block leaves it unchanged', () => {
      const input = makeGrid([
        100, 100, 100, 255,  100, 100, 100, 255,
        100, 100, 100, 255,  100, 100, 100, 255,
      ])
      const out = applyArtisticEffects(input, 2, 2, params({ pixelate: 2 }))
      expect(out[0]).toBe(100)
      expect(out[4]).toBe(100)
      expect(out[8]).toBe(100)
      expect(out[12]).toBe(100)
    })
  })

  describe('vignette', () => {
    it('vignette=0 does not change pixels', () => {
      const input = makeGrid([200, 200, 200, 255])
      const out = applyArtisticEffects(input, 1, 1, params({ vignette: 0 }))
      expect(Array.from(out)).toEqual([200, 200, 200, 255])
    })

    it('vignette > 0 darkens corner pixels more than center', () => {
      // 3x3 grid of uniform gray — center stays lighter, corners darken
      const size = 3
      const gray = 200
      const pixels: number[] = []
      for (let i = 0; i < size * size; i++) pixels.push(gray, gray, gray, 255)
      const input = makeGrid(pixels)
      const out = applyArtisticEffects(input, size, size, params({ vignette: 100 }))

      const centerIdx = (1 * size + 1) * 4  // center pixel
      const cornerIdx = 0                    // top-left corner

      expect(out[centerIdx]).toBeGreaterThan(out[cornerIdx])
    })

    it('vignette preserves alpha channel', () => {
      const input = makeGrid([200, 200, 200, 128])
      const out = applyArtisticEffects(input, 1, 1, params({ vignette: 100 }))
      expect(out[3]).toBe(128)
    })
  })

  describe('grain', () => {
    it('grain=0 does not change pixels', () => {
      const input = makeGrid([100, 100, 100, 255])
      const out = applyArtisticEffects(input, 1, 1, params({ grain: 0 }))
      expect(Array.from(out)).toEqual([100, 100, 100, 255])
    })

    it('grain > 0 produces deterministic per-pixel noise', () => {
      // Run twice on the same input — output must be identical (no random seed)
      const input = makeGrid([128, 128, 128, 255, 128, 128, 128, 255])
      const out1 = applyArtisticEffects(input, 2, 1, params({ grain: 50 }))
      const out2 = applyArtisticEffects(input, 2, 1, params({ grain: 50 }))
      expect(Array.from(out1)).toEqual(Array.from(out2))
    })
  })
})
