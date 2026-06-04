import { Slider } from '../ui/Slider'
import type { AdjustmentParams } from '../../types'

interface Props {
  params: AdjustmentParams
  onChange: (partial: Partial<AdjustmentParams>) => void
}

export function ColorGradingPanel({ params, onChange }: Props) {
  return (
    <div className="flex flex-col gap-4 p-3">
      <Slider label="Hue Rotation" min={0} max={360} step={1} value={params.hueRotation} onChange={v => onChange({ hueRotation: v })} unit="°" />
      <div className="pt-1">
        <p className="text-xs text-zinc-500 mb-3 uppercase tracking-wider">Color Balance</p>
        <div className="flex flex-col gap-4">
          <Slider label="Red" min={-100} max={100} step={1} value={params.redBalance} onChange={v => onChange({ redBalance: v })} />
          <Slider label="Green" min={-100} max={100} step={1} value={params.greenBalance} onChange={v => onChange({ greenBalance: v })} />
          <Slider label="Blue" min={-100} max={100} step={1} value={params.blueBalance} onChange={v => onChange({ blueBalance: v })} />
        </div>
      </div>
      <div className="pt-1">
        <p className="text-xs text-zinc-500 mb-3 uppercase tracking-wider">Split Tone</p>
        <div className="flex flex-col gap-4">
          <Slider label="Shadow Hue" min={0} max={360} step={1} value={params.shadowTint[0]} onChange={v => onChange({ shadowTint: [v, params.shadowTint[1], params.shadowTint[2]] })} unit="°" />
          <Slider label="Shadow Strength" min={0} max={100} step={1} value={params.shadowTint[2]} onChange={v => onChange({ shadowTint: [params.shadowTint[0], params.shadowTint[1], v] })} />
          <Slider label="Highlight Hue" min={0} max={360} step={1} value={params.highlightTint[0]} onChange={v => onChange({ highlightTint: [v, params.highlightTint[1], params.highlightTint[2]] })} unit="°" />
          <Slider label="Highlight Strength" min={0} max={100} step={1} value={params.highlightTint[2]} onChange={v => onChange({ highlightTint: [params.highlightTint[0], params.highlightTint[1], v] })} />
        </div>
      </div>
    </div>
  )
}
