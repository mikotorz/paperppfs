export interface AdjustmentParams {
  brightness: number
  contrast: number
  saturation: number
  sharpness: number
  blur: number
  hueRotation: number
  redBalance: number
  greenBalance: number
  blueBalance: number
  shadowTint: [number, number, number]
  highlightTint: [number, number, number]
  vignette: number
  grain: number
  chromaticAberration: number
  pixelate: number
  emboss: number
  glitchSlices: number
  glitchOffset: number
  scanlines: number
  // Print
  halftoneSize: number
  halftoneAngle: number
  halftoneCMYK: boolean
  // Film
  crossProcessStrength: number
  lightLeakStrength: number
  // Cinematic
  bloomStrength: number
  bloomRadius: number
  bloomThreshold: number
  // Tone
  duotoneStrength: number
  duotoneShadowColor: [number, number, number]
  duotoneHighlightColor: [number, number, number]
}

export type AnimatedEffect = 'none' | 'holographic' | 'crt' | 'vhs' | 'filmreel' | 'neonpulse' | 'rgbjitter'

export interface AnimatedEffectState {
  effect: AnimatedEffect
  tilt3D: boolean
}

export type PresetName =
  | 'none'
  | 'vintage'
  | 'noir'
  | 'vivid'
  | 'faded'
  | 'warm'
  | 'cool'
  | 'matte'
  | 'chrome'
  | 'fade'
  | 'newsprint'
  | 'crossx'
  | 'cineglow'

export interface Preset {
  name: PresetName
  label: string
  params: AdjustmentParams
}

export type ActiveTab = 'adjustments' | 'filters' | 'grading' | 'effects' | 'animate'

export interface CropRegion {
  x: number
  y: number
  width: number
  height: number
}

export type AspectRatioPreset =
  | 'free'
  | '1:1'
  | '4:3'
  | '3:4'
  | '16:9'
  | '9:16'
  | '2:3'
  | '3:2'
  | '5:7'
  | '7:5'
