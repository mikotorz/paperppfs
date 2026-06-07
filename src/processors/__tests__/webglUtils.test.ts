import { describe, it, expect, vi } from 'vitest'
import { createShader, createProgram, createQuadBuffer } from '../webglUtils'

function makeGl(overrides: Partial<Record<string, unknown>> = {}): WebGLRenderingContext {
  const fakeShader = { _type: 'shader' }
  const fakeProgram = { _type: 'program' }
  const fakeBuf = { _type: 'buffer' }
  return {
    VERTEX_SHADER: 35633,
    FRAGMENT_SHADER: 35632,
    COMPILE_STATUS: 35713,
    LINK_STATUS: 35714,
    ARRAY_BUFFER: 34962,
    STATIC_DRAW: 35044,
    createShader: vi.fn(() => fakeShader),
    shaderSource: vi.fn(),
    compileShader: vi.fn(),
    getShaderParameter: vi.fn(() => true),
    getShaderInfoLog: vi.fn(() => 'some error'),
    deleteShader: vi.fn(),
    createProgram: vi.fn(() => fakeProgram),
    attachShader: vi.fn(),
    linkProgram: vi.fn(),
    getProgramParameter: vi.fn(() => true),
    getProgramInfoLog: vi.fn(() => 'link error'),
    deleteProgram: vi.fn(),
    createBuffer: vi.fn(() => fakeBuf),
    bindBuffer: vi.fn(),
    bufferData: vi.fn(),
    ...overrides,
  } as unknown as WebGLRenderingContext
}

describe('createShader', () => {
  it('returns shader on successful compile', () => {
    const gl = makeGl()
    const result = createShader(gl, gl.VERTEX_SHADER, 'void main(){}')
    expect(result).toBeDefined()
    expect(gl.compileShader).toHaveBeenCalled()
  })

  it('throws with info log on compile failure', () => {
    const gl = makeGl({ getShaderParameter: vi.fn(() => false) })
    expect(() => createShader(gl, gl.VERTEX_SHADER, 'bad glsl'))
      .toThrow('Shader compile error: some error')
    expect(gl.deleteShader).toHaveBeenCalled()
  })

  it('throws when createShader returns null', () => {
    const gl = makeGl({ createShader: vi.fn(() => null) })
    expect(() => createShader(gl, gl.VERTEX_SHADER, ''))
      .toThrow('Failed to create WebGL shader object')
  })
})

describe('createProgram', () => {
  it('returns program on successful link', () => {
    const gl = makeGl()
    const result = createProgram(gl, 'void main(){}', 'void main(){}')
    expect(result).toBeDefined()
    expect(gl.linkProgram).toHaveBeenCalled()
    expect(gl.attachShader).toHaveBeenCalledTimes(2)
  })

  it('throws with info log on link failure', () => {
    const gl = makeGl({
      getProgramParameter: vi.fn(() => false),
    })
    expect(() => createProgram(gl, '', ''))
      .toThrow('Program link error: link error')
    expect(gl.deleteProgram).toHaveBeenCalled()
  })

  it('throws when createProgram returns null', () => {
    const gl = makeGl({ createProgram: vi.fn(() => null) })
    expect(() => createProgram(gl, '', '')).toThrow('Failed to create WebGL program object')
  })
})

describe('createQuadBuffer', () => {
  it('creates and populates a buffer with 12 floats', () => {
    const gl = makeGl()
    const buf = createQuadBuffer(gl)
    expect(buf).toBeDefined()
    expect(gl.bindBuffer).toHaveBeenCalled()
    const callArgs = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls[0]
    const data = callArgs[1] as Float32Array
    expect(data).toHaveLength(12)
  })

  it('throws when createBuffer returns null', () => {
    const gl = makeGl({ createBuffer: vi.fn(() => null) })
    expect(() => createQuadBuffer(gl)).toThrow('Failed to create WebGL buffer')
  })
})
