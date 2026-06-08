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

  describe('chromatic aberration', () => {
    it('chromaticAberration=0 does not change pixels', () => {
      const input = makeGrid([255, 0, 0, 255, 0, 255, 0, 255])
      const out = applyArtisticEffects(input, 2, 1, params({ chromaticAberration: 0 }))
      expect(Array.from(out)).toEqual([255, 0, 0, 255, 0, 255, 0, 255])
    })

    it('chromaticAberration > 0 offsets the red channel left relative to the blue channel', () => {
      // 3-pixel row: red=255 | red=0 | red=0
      // With offset=1, red channel shifts left by 1 so pixel[1].red takes pixel[0].red = 255
      const input = makeGrid([
        255, 128, 50, 255,
        0,   128, 50, 255,
        0,   128, 50, 255,
      ])
      const out = applyArtisticEffects(input, 3, 1, params({ chromaticAberration: 1 }))
      // pixel[1] red should now come from pixel[0] original = 255
      expect(out[4]).toBe(255)
      // blue channel shifts right: pixel[1] blue takes pixel[2] original = 50
      expect(out[6]).toBe(50)
      // green channel is unchanged
      expect(out[5]).toBe(128)
    })
  })

  describe('new artistic effects identity', () => {
    it('sepiaStrength=0 does not change pixels', () => {
      const input = makeGrid([100, 150, 200, 255])
      const out = applyArtisticEffects(input, 1, 1, params({ sepiaStrength: 0 }))
      expect(Array.from(out)).toEqual([100, 150, 200, 255])
    })

    it('posterizeStrength=0 does not change pixels', () => {
      const input = makeGrid([80, 120, 200, 255])
      const out = applyArtisticEffects(input, 1, 1, params({ posterizeStrength: 0 }))
      expect(Array.from(out)).toEqual([80, 120, 200, 255])
    })

    it('neonEdgesStrength=0 does not change pixels', () => {
      const input = makeGrid([100, 150, 200, 255])
      const out = applyArtisticEffects(input, 1, 1, params({ neonEdgesStrength: 0 }))
      expect(Array.from(out)).toEqual([100, 150, 200, 255])
    })

    it('comicStrength=0 does not change pixels', () => {
      const input = makeGrid([100, 150, 200, 255])
      const out = applyArtisticEffects(input, 1, 1, params({ comicStrength: 0 }))
      expect(Array.from(out)).toEqual([100, 150, 200, 255])
    })
  })

  describe('sepia', () => {
    it('sepia=100 warm-tones a gray pixel: R > G > B', () => {
      const input = makeGrid([128, 128, 128, 255])
      const out = applyArtisticEffects(input, 1, 1, params({ sepiaStrength: 100 }))
      expect(out[0]).toBeGreaterThan(out[1])  // R > G
      expect(out[1]).toBeGreaterThan(out[2])  // G > B
    })

    it('sepia=100 matches expected matrix output for gray(128)', () => {
      const input = makeGrid([128, 128, 128, 255])
      const out = applyArtisticEffects(input, 1, 1, params({ sepiaStrength: 100 }))
      // 1.351*128=172.928 → Uint8ClampedArray rounds to 173
      expect(out[0]).toBe(173)
      // 1.203*128=153.984 → 154
      expect(out[1]).toBe(154)
      // 0.937*128=119.936 → 120
      expect(out[2]).toBe(120)
    })

    it('sepia scales linearly: strength=50 gives half the shift', () => {
      const input = makeGrid([128, 128, 128, 255])
      const at100 = applyArtisticEffects(input, 1, 1, params({ sepiaStrength: 100 }))
      const at50  = applyArtisticEffects(input, 1, 1, params({ sepiaStrength: 50 }))
      // At 50%, R shift is half of the full shift from 128 → 172
      expect(at50[0]).toBe(150)  // 128 + 0.5*(172-128) = 150
    })

    it('sepia preserves alpha', () => {
      const input = makeGrid([128, 128, 128, 200])
      const out = applyArtisticEffects(input, 1, 1, params({ sepiaStrength: 100 }))
      expect(out[3]).toBe(200)
    })
  })

  describe('posterize', () => {
    it('same-band values produce the same output at full strength', () => {
      // At strength=100: levels=8, step=32. Band 3 covers [96,127].
      // Both 100 and 110 → band 3 → same quantized output.
      const pxA = makeGrid([100, 100, 100, 255])
      const pxB = makeGrid([110, 110, 110, 255])
      const outA = applyArtisticEffects(pxA, 1, 1, params({ posterizeStrength: 100 }))
      const outB = applyArtisticEffects(pxB, 1, 1, params({ posterizeStrength: 100 }))
      expect(outA[0]).toBe(outB[0])
      expect(outA[1]).toBe(outB[1])
      expect(outA[2]).toBe(outB[2])
    })

    it('cross-band-boundary values produce different outputs at full strength', () => {
      // Band 2 = [64,95], Band 3 = [96,127]. Values 95 and 96 are in different bands.
      const pxA = makeGrid([95, 95, 95, 255])
      const pxB = makeGrid([96, 96, 96, 255])
      const outA = applyArtisticEffects(pxA, 1, 1, params({ posterizeStrength: 100 }))
      const outB = applyArtisticEffects(pxB, 1, 1, params({ posterizeStrength: 100 }))
      expect(outA[0]).not.toBe(outB[0])
    })

    it('posterize does not change alpha', () => {
      const input = makeGrid([100, 100, 100, 200])
      const out = applyArtisticEffects(input, 1, 1, params({ posterizeStrength: 100 }))
      expect(out[3]).toBe(200)
    })
  })

  describe('neonEdges', () => {
    it('darkens a uniform (edge-free) image at full strength', () => {
      // Sobel = 0 on all border pixels; dark = original * (1 - 0.85) = 15%
      const size = 3
      const pixels: number[] = []
      for (let i = 0; i < size * size; i++) pixels.push(200, 200, 200, 255)
      const input = makeGrid(pixels)
      const out = applyArtisticEffects(input, size, size, params({ neonEdgesStrength: 100 }))
      // Center pixel (1,1): Sobel = 0 on uniform → output = 200 * 0.15 = 30
      const centerR = out[(1 * size + 1) * 4]
      expect(centerR).toBeLessThan(100)
      expect(centerR).toBeGreaterThan(0)
    })

    it('preserves alpha channel', () => {
      const size = 3
      const pixels: number[] = []
      for (let i = 0; i < size * size; i++) pixels.push(200, 200, 200, 128)
      const input = makeGrid(pixels)
      const out = applyArtisticEffects(input, size, size, params({ neonEdgesStrength: 100 }))
      // Check center pixel alpha
      expect(out[(1 * size + 1) * 4 + 3]).toBe(128)
    })
  })

  describe('comic', () => {
    it('comic=100 on uniform image shifts pixels toward the posterized value', () => {
      // Internal posterize uses strength=30 → 4 levels, step=64
      // v=200: floor(200/64)=3, pv=3*(255/3)=255, posterized=200+0.3*(255-200)=216
      // With no edges: outline=0, out = 200 + 1.0*(216-200) = 216
      const size = 3
      const pixels: number[] = []
      for (let i = 0; i < size * size; i++) pixels.push(200, 200, 200, 255)
      const input = makeGrid(pixels)
      const out = applyArtisticEffects(input, size, size, params({ comicStrength: 100 }))
      const centerR = out[(1 * size + 1) * 4]
      expect(centerR).toBeGreaterThan(200)  // shifted up toward band ceiling
    })

    it('comic output is darker at sharp color boundaries than at flat regions', () => {
      // Row of alternating black/white creates a strong Sobel edge
      // The boundary region should be darker than the flat region at equal distance from center
      const w = 5, h = 3
      const pixels: number[] = []
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const v = x < 2 ? 0 : 255  // hard edge between x=1 and x=2
          pixels.push(v, v, v, 255)
        }
      }
      const input = makeGrid(pixels)
      const out = applyArtisticEffects(input, w, h, params({ comicStrength: 100 }))
      // pixel at (2,1) is near the hard edge → darker due to outline
      // pixel at (4,1) is far from any edge → brighter
      const edgeR  = out[(1 * w + 2) * 4]
      const flatR  = out[(1 * w + 4) * 4]
      expect(edgeR).toBeLessThan(flatR)
    })

    it('comic preserves alpha channel', () => {
      const size = 3
      const pixels: number[] = []
      for (let i = 0; i < size * size; i++) pixels.push(200, 200, 200, 77)
      const input = makeGrid(pixels)
      const out = applyArtisticEffects(input, size, size, params({ comicStrength: 100 }))
      expect(out[(1 * size + 1) * 4 + 3]).toBe(77)
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
