import type { AnimatedEffect } from '../types'

export type WebGLEffect = 'plasma' | 'aurora' | 'ripple' | 'starfield'

export const WEBGL_EFFECTS = new Set<AnimatedEffect>(['plasma', 'aurora', 'ripple', 'starfield'])

export const VERTEX_SHADER = `
  attribute vec2 aPosition;
  varying vec2 vUv;
  void main() {
    vUv = aPosition * 0.5 + 0.5;
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`

const PLASMA_FRAG = `
  precision mediump float;
  uniform sampler2D uImage;
  uniform float uTime;
  varying vec2 vUv;

  vec3 hsv2rgb(float h, float s, float v) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(vec3(h) + K.xyz) * 6.0 - K.www);
    return v * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), s);
  }

  void main() {
    vec4 base = texture2D(uImage, vUv);
    float v = sin(vUv.x * 10.0 + uTime)
            + sin(vUv.y * 8.0 + uTime * 0.7)
            + sin((vUv.x + vUv.y) * 6.0 + uTime * 1.3)
            + sin(length(vUv - 0.5) * 14.0 - uTime * 1.6);
    float hue = mod(v * 0.125 + 0.5 + uTime * 0.08, 1.0);
    vec3 plasma = hsv2rgb(hue, 0.9, 0.75) * 0.45;
    vec3 col = 1.0 - (1.0 - base.rgb) * (1.0 - plasma);
    gl_FragColor = vec4(col, 1.0);
  }
`

const AURORA_FRAG = `
  precision mediump float;
  uniform sampler2D uImage;
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    vec4 base = texture2D(uImage, vUv);
    float wave = sin(vUv.x * 3.5 + uTime * 0.5) * 0.12
               + sin(vUv.x * 7.0 - uTime * 0.3) * 0.05;
    float band = smoothstep(0.55, 0.75, vUv.y + wave)
               * smoothstep(1.0, 0.75, vUv.y + wave);
    float band2 = smoothstep(0.35, 0.52, vUv.y + wave * 1.4)
                * smoothstep(0.65, 0.52, vUv.y + wave * 1.4);

    float hue1 = 0.38 + sin(vUv.x * 2.0 + uTime * 0.25) * 0.08;
    float hue2 = 0.55 + sin(vUv.x * 3.0 - uTime * 0.2) * 0.06;

    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p1 = abs(fract(vec3(hue1) + K.xyz) * 6.0 - K.www);
    vec3 col1 = 0.8 * mix(K.xxx, clamp(p1 - K.xxx, 0.0, 1.0), 0.85);
    vec3 p2 = abs(fract(vec3(hue2) + K.xyz) * 6.0 - K.www);
    vec3 col2 = 0.7 * mix(K.xxx, clamp(p2 - K.xxx, 0.0, 1.0), 0.9);

    float shimmer = 0.85 + sin(vUv.x * 20.0 + uTime * 2.0) * 0.15;
    vec3 aurora = col1 * band * shimmer + col2 * band2 * shimmer;
    vec3 col = 1.0 - (1.0 - base.rgb) * (1.0 - aurora * 0.8);
    gl_FragColor = vec4(col, 1.0);
  }
`

const RIPPLE_FRAG = `
  precision mediump float;
  uniform sampler2D uImage;
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    vec2 center = vUv - 0.5;
    float dist = length(center);
    float ripple = sin(dist * 38.0 - uTime * 3.5) * 0.012 * (1.0 - dist * 1.6);
    vec2 dir = dist > 0.001 ? normalize(center) : vec2(0.0);
    vec2 displaced = clamp(vUv + dir * ripple, 0.0, 1.0);
    gl_FragColor = texture2D(uImage, displaced);
  }
`

const STARFIELD_FRAG = `
  precision mediump float;
  uniform sampler2D uImage;
  uniform float uTime;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    vec4 base = texture2D(uImage, vUv);
    vec2 grid = floor(vUv * 60.0);
    float h = hash(grid);
    float h2 = hash(grid + 17.3);
    float h3 = hash(grid + 53.1);

    vec2 cell = fract(vUv * 60.0) - 0.5;
    float starSize = mix(0.04, 0.12, h3);
    float dist = length(cell);
    float star = smoothstep(starSize, starSize * 0.3, dist);

    float twinkle = sin(uTime * (h2 * 3.0 + 1.0) + h * 6.2832) * 0.5 + 0.5;
    float brightness = smoothstep(0.6, 1.0, h) * twinkle;

    float hue = h * 0.25 + 0.55;
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(vec3(hue) + K.xyz) * 6.0 - K.www);
    vec3 starColor = mix(vec3(1.0), clamp(p - K.xxx, 0.0, 1.0), 0.3);

    float alpha = star * brightness;
    vec3 col = clamp(base.rgb + starColor * alpha * 1.5, 0.0, 1.0);
    gl_FragColor = vec4(col, 1.0);
  }
`

export const FRAGMENT_SHADERS: Record<WebGLEffect, string> = {
  plasma: PLASMA_FRAG,
  aurora: AURORA_FRAG,
  ripple: RIPPLE_FRAG,
  starfield: STARFIELD_FRAG,
}
