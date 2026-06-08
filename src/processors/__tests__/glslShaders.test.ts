import { describe, it, expect } from 'vitest'
import { WEBGL_EFFECTS, FRAGMENT_SHADERS, VERTEX_SHADER } from '../glslShaders'

const GLSL_EFFECTS = ['plasma', 'aurora', 'ripple', 'starfield', 'liquid', 'vortex', 'infrared', 'glitchdrop', 'crystal'] as const
type GlslEffect = typeof GLSL_EFFECTS[number]
const CANVAS2D_EFFECTS = ['holographic', 'crt', 'vhs', 'filmreel', 'neonpulse', 'rgbjitter'] as const

describe('FRAGMENT_SHADERS', () => {
  it('has exactly one entry per WEBGL_EFFECTS member', () => {
    const shaderKeys = Object.keys(FRAGMENT_SHADERS) as GlslEffect[]
    expect(shaderKeys).toHaveLength(WEBGL_EFFECTS.size)
    for (const key of shaderKeys) expect(WEBGL_EFFECTS.has(key)).toBe(true)
  })

  it('each shader is a non-empty string', () => {
    for (const src of Object.values(FRAGMENT_SHADERS)) {
      expect(typeof src).toBe('string')
      expect(src.length).toBeGreaterThan(0)
    }
  })

  it('each fragment shader declares uImage, uTime, and main', () => {
    for (const [name, src] of Object.entries(FRAGMENT_SHADERS)) {
      expect(src, `${name}: missing uImage`).toContain('uImage')
      expect(src, `${name}: missing uTime`).toContain('uTime')
      expect(src, `${name}: missing main`).toContain('main')
    }
  })
})

describe('VERTEX_SHADER', () => {
  it('declares aPosition attribute and vUv varying', () => {
    expect(VERTEX_SHADER).toContain('aPosition')
    expect(VERTEX_SHADER).toContain('vUv')
    expect(VERTEX_SHADER).toContain('main')
  })
})

describe('WEBGL_EFFECTS', () => {
  it('contains all nine GLSL shader effects', () => {
    for (const e of GLSL_EFFECTS) expect(WEBGL_EFFECTS.has(e)).toBe(true)
  })

  it('contains exactly 9 effects', () => {
    expect(WEBGL_EFFECTS.size).toBe(9)
  })

  it('does not contain canvas-2D effects', () => {
    for (const e of CANVAS2D_EFFECTS) expect(WEBGL_EFFECTS.has(e)).toBe(false)
  })

  it('does not contain "none"', () => {
    expect(WEBGL_EFFECTS.has('none')).toBe(false)
  })
})
