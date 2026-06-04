import type { AspectRatioPreset } from '../types'

export const ASPECT_RATIO_PRESETS: Array<{
  id: AspectRatioPreset
  label: string
  ratio: number | null
}> = [
  { id: 'free',  label: 'Free',  ratio: null },
  { id: '1:1',   label: '1:1',   ratio: 1 },
  { id: '4:3',   label: '4:3',   ratio: 4 / 3 },
  { id: '3:4',   label: '3:4',   ratio: 3 / 4 },
  { id: '16:9',  label: '16:9',  ratio: 16 / 9 },
  { id: '9:16',  label: '9:16',  ratio: 9 / 16 },
  { id: '2:3',   label: '2:3',   ratio: 2 / 3 },
  { id: '3:2',   label: '3:2',   ratio: 3 / 2 },
  { id: '5:7',   label: '5:7',   ratio: 5 / 7 },
  { id: '7:5',   label: '7:5',   ratio: 7 / 5 },
]

export const FLIP_MAP: Partial<Record<AspectRatioPreset, AspectRatioPreset>> = {
  '4:3':  '3:4',
  '3:4':  '4:3',
  '16:9': '9:16',
  '9:16': '16:9',
  '2:3':  '3:2',
  '3:2':  '2:3',
  '5:7':  '7:5',
  '7:5':  '5:7',
}
