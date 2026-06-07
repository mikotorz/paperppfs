export function createShader(gl: WebGLRenderingContext, type: number, src: string): WebGLShader {
  const shader = gl.createShader(type)
  if (!shader) throw new Error('Failed to create WebGL shader object')
  gl.shaderSource(shader, src)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader) ?? 'unknown error'
    gl.deleteShader(shader)
    throw new Error(`Shader compile error: ${log}`)
  }
  return shader
}

export function createProgram(gl: WebGLRenderingContext, vert: string, frag: string): WebGLProgram {
  const vs = createShader(gl, gl.VERTEX_SHADER, vert)
  const fs = createShader(gl, gl.FRAGMENT_SHADER, frag)
  const program = gl.createProgram()
  if (!program) throw new Error('Failed to create WebGL program object')
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)
  gl.deleteShader(vs)
  gl.deleteShader(fs)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program) ?? 'unknown error'
    gl.deleteProgram(program)
    throw new Error(`Program link error: ${log}`)
  }
  return program
}

export function createQuadBuffer(gl: WebGLRenderingContext): WebGLBuffer {
  const buf = gl.createBuffer()
  if (!buf) throw new Error('Failed to create WebGL buffer')
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  // Two triangles covering NDC [-1,1]x[-1,1]
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1,  1, -1,  -1,  1,
    -1,  1,  1, -1,   1,  1,
  ]), gl.STATIC_DRAW)
  return buf
}
