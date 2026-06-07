import { describe, it, expect } from 'vitest'
import { PRESETS } from '../presets'
import { DEFAULT_PARAMS } from '../defaults'
import type { AdjustmentParams } from '../../types'

const REQUIRED_KEYS = Object.keys(DEFAULT_PARAMS) as (keyof AdjustmentParams)[]

describe('presets', () => {
  it('every preset has a non-empty name and label', () => {
    for (const preset of PRESETS) {
      expect(preset.name.length).toBeGreaterThan(0)
      expect(preset.label.length).toBeGreaterThan(0)
    }
  })

  it('preset names are unique', () => {
    const names = PRESETS.map(p => p.name)
    expect(new Set(names).size).toBe(names.length)
  })

  it('every preset params contains all AdjustmentParams keys', () => {
    for (const preset of PRESETS) {
      for (const key of REQUIRED_KEYS) {
        expect(
          Object.prototype.hasOwnProperty.call(preset.params, key),
          `preset "${preset.name}" is missing key "${key}"`,
        ).toBe(true)
      }
    }
  })

  it('no preset param has a NaN value in numeric fields', () => {
    const numericKeys = REQUIRED_KEYS.filter(k => typeof DEFAULT_PARAMS[k] === 'number') as (keyof AdjustmentParams)[]
    for (const preset of PRESETS) {
      for (const key of numericKeys) {
        const v = preset.params[key] as number
        expect(Number.isNaN(v), `preset "${preset.name}" has NaN for "${key}"`).toBe(false)
      }
    }
  })

  it('the "none" preset params equal DEFAULT_PARAMS exactly', () => {
    const none = PRESETS.find(p => p.name === 'none')
    expect(none).toBeDefined()
    expect(none!.params).toEqual(DEFAULT_PARAMS)
  })

  it('tint and duotone array params have exactly 3 elements in every preset', () => {
    const arrayKeys = ['shadowTint', 'highlightTint', 'duotoneShadowColor', 'duotoneHighlightColor'] as const
    for (const preset of PRESETS) {
      for (const key of arrayKeys) {
        expect(
          (preset.params[key] as unknown[]).length,
          `preset "${preset.name}" "${key}" should have 3 elements`,
        ).toBe(3)
      }
    }
  })
})
