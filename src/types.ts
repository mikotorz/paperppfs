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

export type AnimatedEffect =
  | 'none' | 'holographic' | 'crt' | 'vhs' | 'filmreel' | 'neonpulse' | 'rgbjitter'
  | 'plasma' | 'aurora' | 'ripple' | 'starfield'

export interface AnimatedEffectState {
  effect: AnimatedEffect
  tilt3D: boolean
  theaterMode: boolean
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

// Narrow param slices — each processor declares only the fields it reads.
// AdjustmentParams structurally satisfies all of these (superset), so call
// sites passing the full params object never need to change.
export type AdjustParams = Pick<AdjustmentParams,
  'brightness' | 'contrast' | 'saturation' | 'sharpness' | 'blur'
>

export type GradingParams = Pick<AdjustmentParams,
  'hueRotation' | 'redBalance' | 'greenBalance' | 'blueBalance' | 'shadowTint' | 'highlightTint'
>

export type EffectsParams = Pick<AdjustmentParams,
  | 'vignette' | 'grain' | 'chromaticAberration' | 'pixelate' | 'emboss'
  | 'glitchSlices' | 'glitchOffset' | 'scanlines'
  | 'halftoneSize' | 'halftoneAngle' | 'halftoneCMYK'
  | 'crossProcessStrength' | 'lightLeakStrength'
  | 'bloomStrength' | 'bloomRadius' | 'bloomThreshold'
  | 'duotoneStrength' | 'duotoneShadowColor' | 'duotoneHighlightColor'
>

export type ActiveTab = 'film' | 'digital' | 'print' | 'animate' | 'edit'

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
