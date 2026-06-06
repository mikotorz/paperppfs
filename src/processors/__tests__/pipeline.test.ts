import { describe, it, expect } from 'vitest'
import { processPipeline } from '../pipeline'
import { DEFAULT_PARAMS } from '../../constants/defaults'
import type { AdjustmentParams } from '../../types'

function params(overrides: Partial<AdjustmentParams> = {}): AdjustmentParams {
  return { ...DEFAULT_PARAMS, ...overrides }
}

function px(...rgba: number[]): Uint8ClampedArray {
  return new Uint8ClampedArray(rgba)
}

describe('processPipeline', () => {
  it('identity: default params leave pixels unchanged', () => {
    const input = px(100, 150, 200, 255)
    const out = processPipeline(input, 1, 1, params())
    expect(Array.from(out)).toEqual([100, 150, 200, 255])
  })

  it('adjustments stage runs: brightness=100 turns any pixel white', () => {
    const input = px(10, 20, 30, 255)
    const out = processPipeline(input, 1, 1, params({ brightness: 100 }))
    expect(out[0]).toBe(255)
    expect(out[1]).toBe(255)
    expect(out[2]).toBe(255)
  })

  it('color grading stage runs: hueRotation=180 turns pure red into cyan', () => {
    const input = px(255, 0, 0, 255)
    const out = processPipeline(input, 1, 1, params({ hueRotation: 180 }))
    expect(out[0]).toBe(0)
    expect(out[1]).toBe(255)
    expect(out[2]).toBe(255)
  })

  it('artistic effects stage runs: vignette darkens corner pixels on a 3×3 image', () => {
    const size = 3
    const input = new Uint8ClampedArray(size * size * 4).fill(200)
    // set alpha for each pixel
    for (let i = 3; i < input.length; i += 4) input[i] = 255

    const out = processPipeline(input, size, size, params({ vignette: 100 }))
    const center = (1 * size + 1) * 4
    const corner = 0
    expect(out[center]).toBeGreaterThan(out[corner])
  })

  it('stages chain: adjustments feed into subsequent stages', () => {
    // brightness=-100 forces all channels to 0 (black) regardless of color grading input
    const input = px(255, 0, 0, 255)
    const out = processPipeline(input, 1, 1, params({ brightness: -100, redBalance: 100 }))
    // adjustments (brightness -100) zeroes everything first; color grading adds back
    // red shift = +50; so red channel = clamp(0 + 50) = 50, not 255
    expect(out[0]).toBe(50)
    expect(out[1]).toBe(0)
    expect(out[2]).toBe(0)
  })
})
