import { Slider } from '../ui/Slider'
import { hexToRgb, rgbToHex } from '../../utils/colorConvert'
import type { AdjustmentParams } from '../../types'

type Props = {
  params: Pick<AdjustmentParams,
    'crossProcessStrength' | 'lightLeakStrength' |
    'bloomStrength' | 'bloomRadius' | 'bloomThreshold' |
    'duotoneStrength' | 'duotoneShadowColor' | 'duotoneHighlightColor'
  >
  onChange: (partial: Partial<AdjustmentParams>) => void
}

export function FilmEffectsPanel({ params, onChange }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-xs text-zinc-500 mb-3 uppercase tracking-wider">Film</p>
        <div className="flex flex-col gap-4">
          <Slider label="Cross-Process" min={0} max={100} step={1} value={params.crossProcessStrength} onChange={v => onChange({ crossProcessStrength: v })} />
          <Slider label="Light Leak" min={0} max={100} step={1} value={params.lightLeakStrength} onChange={v => onChange({ lightLeakStrength: v })} />
        </div>
      </div>
      <div className="pt-1 border-t border-zinc-700/50">
        <p className="text-xs text-zinc-500 mb-3 uppercase tracking-wider">Cinematic</p>
        <div className="flex flex-col gap-4">
          <Slider label="Bloom" min={0} max={100} step={1} value={params.bloomStrength} onChange={v => onChange({ bloomStrength: v })} />
          <Slider label="Bloom Radius" min={1} max={20} step={1} value={params.bloomRadius} onChange={v => onChange({ bloomRadius: v })} unit="px" />
          <Slider label="Bloom Threshold" min={0} max={255} step={1} value={params.bloomThreshold} onChange={v => onChange({ bloomThreshold: v })} />
        </div>
      </div>
      <div className="pt-1 border-t border-zinc-700/50">
        <p className="text-xs text-zinc-500 mb-3 uppercase tracking-wider">Duotone</p>
        <div className="flex flex-col gap-4">
          <Slider label="Strength" min={0} max={100} step={1} value={params.duotoneStrength} onChange={v => onChange({ duotoneStrength: v })} />
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-300">Shadow Color</span>
            <input
              type="color"
              value={rgbToHex(params.duotoneShadowColor)}
              onChange={e => onChange({ duotoneShadowColor: hexToRgb(e.target.value) })}
              className="w-8 h-6 rounded cursor-pointer border-0 bg-transparent"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-300">Highlight Color</span>
            <input
              type="color"
              value={rgbToHex(params.duotoneHighlightColor)}
              onChange={e => onChange({ duotoneHighlightColor: hexToRgb(e.target.value) })}
              className="w-8 h-6 rounded cursor-pointer border-0 bg-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
