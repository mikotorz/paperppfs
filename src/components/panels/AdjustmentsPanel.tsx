import { Slider } from '../ui/Slider'
import type { AdjustmentParams } from '../../types'

interface Props {
  params: AdjustmentParams
  onChange: (partial: Partial<AdjustmentParams>) => void
}

export function AdjustmentsPanel({ params, onChange }: Props) {
  return (
    <div className="flex flex-col gap-4 p-3">
      <Slider label="Brightness" min={-100} max={100} step={1} value={params.brightness} onChange={v => onChange({ brightness: v })} />
      <Slider label="Contrast" min={-100} max={100} step={1} value={params.contrast} onChange={v => onChange({ contrast: v })} />
      <Slider label="Saturation" min={-100} max={100} step={1} value={params.saturation} onChange={v => onChange({ saturation: v })} />
      <Slider label="Sharpness" min={0} max={100} step={1} value={params.sharpness} onChange={v => onChange({ sharpness: v })} />
      <Slider label="Blur" min={0} max={20} step={0.5} value={params.blur} onChange={v => onChange({ blur: v })} unit="px" />
    </div>
  )
}
