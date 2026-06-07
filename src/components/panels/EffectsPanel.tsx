import type { AdjustmentParams } from '../../types'
import { DigitalEffectsPanel } from './DigitalEffectsPanel'
import { PrintEffectsPanel } from './PrintEffectsPanel'
import { FilmEffectsPanel } from './FilmEffectsPanel'

interface Props {
  params: AdjustmentParams
  onChange: (partial: Partial<AdjustmentParams>) => void
}

export function EffectsPanel({ params, onChange }: Props) {
  return (
    <div className="flex flex-col gap-4 p-3">
      <DigitalEffectsPanel params={params} onChange={onChange} />
      <div className="border-t border-zinc-700/50 pt-4">
        <PrintEffectsPanel params={params} onChange={onChange} />
      </div>
      <div className="border-t border-zinc-700/50 pt-4">
        <FilmEffectsPanel params={params} onChange={onChange} />
      </div>
    </div>
  )
}
