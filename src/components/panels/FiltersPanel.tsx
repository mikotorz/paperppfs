import { PresetTile } from '../ui/PresetTile'
import type { PresetName } from '../../types'
import { PRESETS } from '../../constants/presets'

interface Props {
  activePreset: PresetName
  onSelect: (name: PresetName) => void
}

export function FiltersPanel({ activePreset, onSelect }: Props) {
  return (
    <div className="grid grid-cols-4 gap-2 p-3">
      {PRESETS.map(preset => (
        <PresetTile
          key={preset.name}
          preset={preset}
          isActive={activePreset === preset.name}
          onClick={() => onSelect(preset.name)}
        />
      ))}
    </div>
  )
}
