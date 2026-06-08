import { Slider } from '../ui/Slider'
import type { AdjustmentParams } from '../../types'

type Props = {
  params: Pick<AdjustmentParams,
    'vignette' | 'grain' | 'chromaticAberration' | 'pixelate' | 'emboss' |
    'glitchSlices' | 'glitchOffset' | 'scanlines' |
    'sepiaStrength' | 'posterizeStrength' | 'neonEdgesStrength' | 'comicStrength'
  >
  onChange: (partial: Partial<AdjustmentParams>) => void
}

export function DigitalEffectsPanel({ params, onChange }: Props) {
  return (
    <div className="flex flex-col gap-4">
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
        <p className="text-xs text-zinc-500 mb-3 uppercase tracking-wider">Artistic</p>
        <div className="flex flex-col gap-4">
          <Slider label="Sepia" min={0} max={100} step={1} value={params.sepiaStrength} onChange={v => onChange({ sepiaStrength: v })} />
          <Slider label="Posterize" min={0} max={100} step={1} value={params.posterizeStrength} onChange={v => onChange({ posterizeStrength: v })} />
          <Slider label="Neon Edges" min={0} max={100} step={1} value={params.neonEdgesStrength} onChange={v => onChange({ neonEdgesStrength: v })} />
          <Slider label="Comic" min={0} max={100} step={1} value={params.comicStrength} onChange={v => onChange({ comicStrength: v })} />
        </div>
      </div>
    </div>
  )
}
