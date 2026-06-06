import { clsx } from 'clsx'
import { Slider } from '../ui/Slider'
import type { AdjustmentParams } from '../../types'

interface Props {
  params: AdjustmentParams
  onChange: (partial: Partial<AdjustmentParams>) => void
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff]
}

function rgbToHex(rgb: [number, number, number]): string {
  return '#' + rgb.map(v => v.toString(16).padStart(2, '0')).join('')
}

export function EffectsPanel({ params, onChange }: Props) {
  return (
    <div className="flex flex-col gap-4 p-3">
      <Slider label="Vignette" min={0} max={100} step={1} value={params.vignette} onChange={v => onChange({ vignette: v })} />
      <Slider label="Film Grain" min={0} max={100} step={1} value={params.grain} onChange={v => onChange({ grain: v })} />
      <Slider label="Chromatic Aberration" min={0} max={20} step={0.5} value={params.chromaticAberration} onChange={v => onChange({ chromaticAberration: v })} unit="px" />
      <Slider label="Pixelate" min={1} max={50} step={1} value={params.pixelate} onChange={v => onChange({ pixelate: v })} unit="px" />
      <Slider label="Emboss" min={0} max={100} step={1} value={params.emboss} onChange={v => onChange({ emboss: v })} />

      <div className="pt-1 border-t border-zinc-700/50">
        <p className="text-xs text-zinc-500 mb-3 uppercase tracking-wider">Glitch</p>
        <div className="flex flex-col gap-4">
          <Slider label="Slices" min={0} max={20} step={1} value={params.glitchSlices} onChange={v => onChange({ glitchSlices: v })} />
          <Slider label="Offset" min={0} max={50} step={1} value={params.glitchOffset} onChange={v => onChange({ glitchOffset: v })} unit="px" />
          <Slider label="Scanlines" min={0} max={100} step={1} value={params.scanlines} onChange={v => onChange({ scanlines: v })} />
        </div>
      </div>

      <div className="pt-1 border-t border-zinc-700/50">
        <p className="text-xs text-zinc-500 mb-3 uppercase tracking-wider">Print</p>
        <div className="flex flex-col gap-4">
          <Slider label="Halftone Size" min={0} max={20} step={1} value={params.halftoneSize} onChange={v => onChange({ halftoneSize: v })} unit="px" />
          <Slider label="Halftone Angle" min={0} max={90} step={1} value={params.halftoneAngle} onChange={v => onChange({ halftoneAngle: v })} unit="°" />
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-300">CMYK Mode</span>
            <button
              onClick={() => onChange({ halftoneCMYK: !params.halftoneCMYK })}
              className={clsx(
                'text-xs px-3 py-1 rounded transition-colors',
                params.halftoneCMYK
                  ? 'bg-violet-600 text-white'
                  : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600',
              )}
            >
              {params.halftoneCMYK ? 'CMYK' : 'B&W'}
            </button>
          </div>
        </div>
      </div>

      <div className="pt-1 border-t border-zinc-700/50">
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
