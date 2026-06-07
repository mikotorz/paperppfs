import { clsx } from 'clsx'
import { Slider } from '../ui/Slider'
import type { AdjustmentParams } from '../../types'

type Props = {
  params: Pick<AdjustmentParams, 'halftoneSize' | 'halftoneAngle' | 'halftoneCMYK'>
  onChange: (partial: Partial<AdjustmentParams>) => void
}

export function PrintEffectsPanel({ params, onChange }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-zinc-500 uppercase tracking-wider">Print</p>
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
  )
}
