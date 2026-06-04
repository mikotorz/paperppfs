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

export interface Preset {
  name: PresetName
  label: string
  params: AdjustmentParams
}

export type ActiveTab = 'adjustments' | 'filters' | 'grading' | 'effects'
