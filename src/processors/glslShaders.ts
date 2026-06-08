import type { AnimatedEffect } from '../types'

export type WebGLEffect = 'plasma' | 'aurora' | 'ripple' | 'starfield'
  | 'liquid' | 'vortex' | 'infrared' | 'glitchdrop' | 'crystal'

export const WEBGL_EFFECTS = new Set<AnimatedEffect>([
  'plasma', 'aurora', 'ripple', 'starfield',
  'liquid', 'vortex', 'infrared', 'glitchdrop', 'crystal',
])

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

const LIQUID_FRAG = `
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
    float wx = sin(vUv.y * 8.0 + uTime * 1.2) * 0.018
             + sin(vUv.y * 14.0 - uTime * 0.8) * 0.009
             + sin(vUv.x * 6.0 + uTime * 0.5) * 0.012;
    float wy = sin(vUv.x * 9.0 + uTime * 0.9) * 0.015
             + sin(vUv.x * 13.0 - uTime * 1.1) * 0.007
             + sin(vUv.y * 5.0 + uTime * 0.6) * 0.010;

    vec2 distorted = clamp(vUv + vec2(wx, wy), 0.0, 1.0);
    vec4 base = texture2D(uImage, distorted);

    float intensity = (sin(vUv.x * 10.0 + vUv.y * 8.0 + uTime * 2.0) + 1.0) * 0.5;
    float hue = mod(intensity * 0.7 + uTime * 0.1, 1.0);
    vec3 iridescent = hsv2rgb(hue, 0.85, 0.7) * intensity * 0.35;

    vec3 col = 1.0 - (1.0 - base.rgb) * (1.0 - iridescent);
    gl_FragColor = vec4(col, 1.0);
  }
`

const VORTEX_FRAG = `
  precision mediump float;
  uniform sampler2D uImage;
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    vec2 centered = vUv - 0.5;
    float dist = length(centered);
    float angle = atan(centered.y, centered.x);
    float spinAmount = 0.8 * sin(uTime * 0.7) / (dist * 4.0 + 0.4);
    float newAngle = angle + spinAmount;
    vec2 rotated = vec2(cos(newAngle), sin(newAngle)) * dist + 0.5;
    vec2 clamped = clamp(rotated, 0.001, 0.999);
    gl_FragColor = texture2D(uImage, clamped);
  }
`

const INFRARED_FRAG = `
  precision mediump float;
  uniform sampler2D uImage;
  uniform float uTime;
  varying vec2 vUv;

  vec3 thermalGradient(float t) {
    if (t < 0.25) return mix(vec3(0.0, 0.0, 1.0), vec3(0.0, 1.0, 1.0), t / 0.25);
    if (t < 0.5)  return mix(vec3(0.0, 1.0, 1.0), vec3(0.0, 1.0, 0.0), (t - 0.25) / 0.25);
    if (t < 0.75) return mix(vec3(0.0, 1.0, 0.0), vec3(1.0, 1.0, 0.0), (t - 0.5)  / 0.25);
    return mix(vec3(1.0, 1.0, 0.0), vec3(1.0, 0.0, 0.0), (t - 0.75) / 0.25);
  }

  void main() {
    vec4 base = texture2D(uImage, vUv);
    float luma = dot(base.rgb, vec3(0.299, 0.587, 0.114));
    float shimmer = sin(luma * 12.0 - uTime * 2.0) * 0.03;
    float t = clamp(luma + shimmer, 0.0, 1.0);
    vec3 thermal = thermalGradient(t);
    vec3 col = mix(base.rgb, thermal, 0.70);
    gl_FragColor = vec4(col, 1.0);
  }
`

const GLITCHDROP_FRAG = `
  precision mediump float;
  uniform sampler2D uImage;
  uniform float uTime;
  varying vec2 vUv;

  float hash(float n) { return fract(sin(n) * 43758.5453); }

  void main() {
    float frame = floor(uTime * 20.0);
    float col = floor(vUv.x * 40.0);
    float sliceActive = step(0.85, hash(col + frame * 0.3));
    float sliceOffset = (hash(col * 3.7 + frame) * 2.0 - 1.0) * 0.06 * sliceActive;

    float blockTime = floor(uTime / 0.15);
    float blockActive = step(0.92, hash(blockTime));
    float blockY = hash(blockTime * 1.7);
    float inBlock = step(abs(vUv.y - blockY), 0.04) * blockActive;
    float blockOffset = (hash(blockTime * 2.3) * 2.0 - 1.0) * 0.08 * inBlock;

    float totalOffset = sliceOffset + blockOffset;

    vec2 uvR = clamp(vec2(vUv.x, vUv.y + totalOffset + sliceActive * 0.008), 0.0, 1.0);
    vec2 uvG = clamp(vec2(vUv.x, vUv.y + totalOffset), 0.0, 1.0);
    vec2 uvB = clamp(vec2(vUv.x, vUv.y + totalOffset - sliceActive * 0.008), 0.0, 1.0);

    float r = texture2D(uImage, uvR).r;
    float g = texture2D(uImage, uvG).g;
    float b = texture2D(uImage, uvB).b;
    gl_FragColor = vec4(r, g, b, 1.0);
  }
`

const CRYSTAL_FRAG = `
  precision mediump float;
  uniform sampler2D uImage;
  uniform float uTime;
  varying vec2 vUv;

  float hash1(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  vec2 hash2(vec2 p) {
    return fract(sin(vec2(
      dot(p, vec2(127.1, 311.7)),
      dot(p, vec2(269.5, 183.3))
    )) * 43758.5453);
  }

  void main() {
    vec4 base = texture2D(uImage, vUv);
    float CELLS = 8.0;
    vec2 scaled = vUv * CELLS;
    vec2 cell = floor(scaled);

    float minDist = 9999.0;
    vec2 closestCell = cell;

    for (int dy = -1; dy <= 1; dy++) {
      for (int dx = -1; dx <= 1; dx++) {
        vec2 neighbor = cell + vec2(float(dx), float(dy));
        vec2 point = neighbor + hash2(neighbor) * 0.7 + 0.15;
        float d = length(scaled - point);
        if (d < minDist) { minDist = d; closestCell = neighbor; }
      }
    }

    float cellId = hash1(closestCell);
    float shimmer = sin(uTime * 1.5 + cellId * 6.2832) * 0.5 + 0.5;
    float hue = mod(cellId + shimmer * 0.08, 1.0);

    vec3 K = vec3(1.0, 2.0 / 3.0, 1.0 / 3.0);
    vec3 p = abs(fract(vec3(hue) + K) * 6.0 - 3.0);
    vec3 tint = mix(vec3(1.0), clamp(p - 1.0, 0.0, 1.0), 0.4);

    float edge = smoothstep(0.05, 0.12, minDist);
    vec3 col = base.rgb * tint * (0.85 + edge * 0.15);
    gl_FragColor = vec4(col, 1.0);
  }
`

export const FRAGMENT_SHADERS: Record<WebGLEffect, string> = {
  plasma: PLASMA_FRAG,
  aurora: AURORA_FRAG,
  ripple: RIPPLE_FRAG,
  starfield: STARFIELD_FRAG,
  liquid: LIQUID_FRAG,
  vortex: VORTEX_FRAG,
  infrared: INFRARED_FRAG,
  glitchdrop: GLITCHDROP_FRAG,
  crystal: CRYSTAL_FRAG,
}
