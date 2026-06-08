import { useState } from 'react'
import type { AdjustmentParams, PresetName } from '../../types'
import { TabBar } from '../ui/TabBar'
import { FiltersPanel } from './FiltersPanel'
import { AdjustmentsPanel } from './AdjustmentsPanel'
import { ColorGradingPanel } from './ColorGradingPanel'

const EDIT_TABS = [
  { id: 'presets', label: 'Presets' },
  { id: 'adjust',  label: 'Adjust'  },
  { id: 'color',   label: 'Color'   },
]

type EditSubTab = 'presets' | 'adjust' | 'color'

interface Props {
  params: AdjustmentParams
  activePreset: PresetName
  onChange: (partial: Partial<AdjustmentParams>) => void
  onPresetSelect: (name: PresetName) => void
}

export function EditPanel({ params, activePreset, onChange, onPresetSelect }: Props) {
  const [subTab, setSubTab] = useState<EditSubTab>('presets')

  return (
    <div className="flex flex-col h-full">
      <TabBar
        tabs={EDIT_TABS}
        active={subTab}
        onChange={id => setSubTab(id as EditSubTab)}
      />
      <div className="flex-1 overflow-y-auto">
        {subTab === 'presets' && (
          <FiltersPanel activePreset={activePreset} onSelect={onPresetSelect} />
        )}
        {subTab === 'adjust' && (
          <AdjustmentsPanel params={params} onChange={onChange} />
        )}
        {subTab === 'color' && (
          <ColorGradingPanel params={params} onChange={onChange} />
        )}
      </div>
    </div>
  )
}
