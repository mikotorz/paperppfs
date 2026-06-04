import { Slider } from '../ui/Slider'
import type { AdjustmentParams } from '../../types'

interface Props {
  params: AdjustmentParams
  onChange: (partial: Partial<AdjustmentParams>) => void
}

export function EffectsPanel({ params, onChange }: Props) {
  return (
    <div className="flex flex-col gap-4 p-3">
      <Slider label="Vignette" min={0} max={100} step={1} value={params.vignette} onChange={v => onChange({ vignette: v })} />
      <Slider label="Film Grain" min={0} max={100} step={1} value={params.grain} onChange={v => onChange({ grain: v })} />
      <Slider label="Chromatic Aberration" min={0} max={20} step={0.5} value={params.chromaticAberration} onChange={v => onChange({ chromaticAberration: v })} unit="px" />
      <Slider label="Pixelate" min={1} max={50} step={1} value={params.pixelate} onChange={v => onChange({ pixelate: v })} unit="px" />
      <Slider label="Emboss" min={0} max={100} step={1} value={params.emboss} onChange={v => onChange({ emboss: v })} />
    </div>
  )
}
