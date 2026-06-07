import { useEffect, useRef } from 'react'
import type { AnimatedEffect } from '../types'
import { WEBGL_EFFECTS, VERTEX_SHADER, FRAGMENT_SHADERS, type WebGLEffect } from '../processors/glslShaders'
import { createProgram, createQuadBuffer } from '../processors/webglUtils'

interface WebGLOverlayProps {
  effect: AnimatedEffect
  mainCanvasRef: React.RefObject<HTMLCanvasElement | null>
}

export function WebGLOverlay({ effect, mainCanvasRef }: WebGLOverlayProps) {
  const overlayRef = useRef<HTMLCanvasElement>(null)
  const glRef = useRef<WebGLRenderingContext | null>(null)
  const programCacheRef = useRef<Map<WebGLEffect, WebGLProgram>>(new Map())
  const quadBufferRef = useRef<WebGLBuffer | null>(null)
  const textureRef = useRef<WebGLTexture | null>(null)
  const rafRef = useRef<number>(0)
  const startTimeRef = useRef<number>(performance.now())

  useEffect(() => {
    const canvas = overlayRef.current
    if (!canvas) return
    const gl = (
      canvas.getContext('webgl', { premultipliedAlpha: false, alpha: false }) ??
      canvas.getContext('experimental-webgl', { premultipliedAlpha: false, alpha: false })
    ) as WebGLRenderingContext | null
    if (!gl) return
    glRef.current = gl

    quadBufferRef.current = createQuadBuffer(gl)

    // Create reusable image texture
    const tex = gl.createTexture()
    if (tex) {
      gl.bindTexture(gl.TEXTURE_2D, tex)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      textureRef.current = tex
    }

    const handleContextLost = (e: Event) => {
      e.preventDefault()
      cancelAnimationFrame(rafRef.current)
    }
    const handleContextRestored = () => {
      const restoredGl = (
        canvas.getContext('webgl', { premultipliedAlpha: false, alpha: false }) ??
        canvas.getContext('experimental-webgl', { premultipliedAlpha: false, alpha: false })
      ) as WebGLRenderingContext | null
      if (!restoredGl) return
      glRef.current = restoredGl
      programCacheRef.current.clear()
      quadBufferRef.current = createQuadBuffer(restoredGl)
      const newTex = restoredGl.createTexture()
      if (newTex) {
        restoredGl.bindTexture(restoredGl.TEXTURE_2D, newTex)
        restoredGl.texParameteri(restoredGl.TEXTURE_2D, restoredGl.TEXTURE_MIN_FILTER, restoredGl.LINEAR)
        restoredGl.texParameteri(restoredGl.TEXTURE_2D, restoredGl.TEXTURE_MAG_FILTER, restoredGl.LINEAR)
        restoredGl.texParameteri(restoredGl.TEXTURE_2D, restoredGl.TEXTURE_WRAP_S, restoredGl.CLAMP_TO_EDGE)
        restoredGl.texParameteri(restoredGl.TEXTURE_2D, restoredGl.TEXTURE_WRAP_T, restoredGl.CLAMP_TO_EDGE)
        textureRef.current = newTex
      }
    }
    canvas.addEventListener('webglcontextlost', handleContextLost)
    canvas.addEventListener('webglcontextrestored', handleContextRestored)

    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost)
      canvas.removeEventListener('webglcontextrestored', handleContextRestored)
      cancelAnimationFrame(rafRef.current)
      if (textureRef.current) gl.deleteTexture(textureRef.current)
      if (quadBufferRef.current) gl.deleteBuffer(quadBufferRef.current)
      for (const prog of programCacheRef.current.values()) gl.deleteProgram(prog)
    }
  }, [])

  useEffect(() => {
    if (!WEBGL_EFFECTS.has(effect)) return
    const glEffect = effect as WebGLEffect

    const tick = (now: number) => {
      const gl = glRef.current
      const mainCanvas = mainCanvasRef.current
      const canvas = overlayRef.current
      if (!gl || !mainCanvas || !canvas || gl.isContextLost()) {
        rafRef.current = requestAnimationFrame(tick)
        return
      }

      const mainRect = mainCanvas.getBoundingClientRect()
      const parentRect = canvas.parentElement!.getBoundingClientRect()
      const left = mainRect.left - parentRect.left
      const top = mainRect.top - parentRect.top
      const w = Math.round(mainRect.width)
      const h = Math.round(mainRect.height)
      if (canvas.width !== w) canvas.width = w
      if (canvas.height !== h) canvas.height = h
      canvas.style.left = `${left}px`
      canvas.style.top = `${top}px`
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      gl.viewport(0, 0, w, h)

      // Lazy compile program
      if (!programCacheRef.current.has(glEffect)) {
        try {
          const prog = createProgram(gl, VERTEX_SHADER, FRAGMENT_SHADERS[glEffect])
          programCacheRef.current.set(glEffect, prog)
        } catch {
          rafRef.current = requestAnimationFrame(tick)
          return
        }
      }
      const program = programCacheRef.current.get(glEffect)!

      // Upload main canvas as image texture (flip Y to match WebGL UV convention)
      const texture = textureRef.current
      if (texture) {
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, mainCanvas)
      }

      gl.clearColor(0, 0, 0, 1)
      gl.clear(gl.COLOR_BUFFER_BIT)

      gl.useProgram(program)

      // Bind quad
      const buf = quadBufferRef.current
      if (!buf) { rafRef.current = requestAnimationFrame(tick); return }
      gl.bindBuffer(gl.ARRAY_BUFFER, buf)
      const posLoc = gl.getAttribLocation(program, 'aPosition')
      gl.enableVertexAttribArray(posLoc)
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)

      // Set uniforms
      const t = (now - startTimeRef.current) / 1000
      const timeLoc = gl.getUniformLocation(program, 'uTime')
      const resLoc = gl.getUniformLocation(program, 'uResolution')
      const imgLoc = gl.getUniformLocation(program, 'uImage')
      if (timeLoc) gl.uniform1f(timeLoc, t)
      if (resLoc) gl.uniform2f(resLoc, w, h)
      if (imgLoc && texture) {
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.uniform1i(imgLoc, 0)
      }

      gl.drawArrays(gl.TRIANGLES, 0, 6)

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [effect, mainCanvasRef])

  return (
    <canvas
      ref={overlayRef}
      style={{
        position: 'absolute',
        pointerEvents: 'none',
      }}
    />
  )
}
