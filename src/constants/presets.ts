import type { Preset } from '../types'
import { DEFAULT_PARAMS } from './defaults'

const p = DEFAULT_PARAMS

export const PRESETS: Preset[] = [
  {
    name: 'none',
    label: 'Original',
    params: { ...p },
  },
  {
    name: 'vintage',
    label: 'Vintage',
    params: {
      ...p,
      brightness: -10,
      contrast: 15,
      saturation: -30,
      hueRotation: 10,
      redBalance: 20,
      blueBalance: -20,
      vignette: 40,
      grain: 25,
    },
  },
  {
    name: 'noir',
    label: 'Noir',
    params: {
      ...p,
      brightness: -5,
      contrast: 30,
      saturation: -100,
      vignette: 50,
      grain: 20,
    },
  },
  {
    name: 'vivid',
    label: 'Vivid',
    params: {
      ...p,
      brightness: 10,
      contrast: 25,
      saturation: 60,
    },
  },
  {
    name: 'faded',
    label: 'Faded',
    params: {
      ...p,
      brightness: -5,
      contrast: -20,
      saturation: -25,
      blueBalance: 10,
      vignette: 10,
      grain: 10,
    },
  },
  {
    name: 'warm',
    label: 'Warm',
    params: {
      ...p,
      brightness: 5,
      contrast: 5,
      saturation: 10,
      redBalance: 30,
      blueBalance: -25,
    },
  },
  {
    name: 'cool',
    label: 'Cool',
    params: {
      ...p,
      contrast: 5,
      saturation: 5,
      redBalance: -20,
      blueBalance: 30,
    },
  },
  {
    name: 'matte',
    label: 'Matte',
    params: {
      ...p,
      brightness: -10,
      contrast: -15,
      saturation: -15,
      redBalance: 10,
      blueBalance: 5,
      vignette: 20,
      grain: 15,
    },
  },
  {
    name: 'chrome',
    label: 'Chrome',
    params: {
      ...p,
      brightness: 15,
      contrast: 35,
      saturation: 20,
      blueBalance: -10,
    },
  },
  {
    name: 'fade',
    label: 'Fade',
    params: {
      ...p,
      contrast: -30,
      saturation: -40,
      grain: 5,
    },
  },
]
