import { useCallback, useRef, useState } from 'react'
import type { ActiveTab, AdjustmentParams, PresetName } from './types'
import { DEFAULT_PARAMS } from './constants/defaults'
import { PRESETS } from './constants/presets'
import { DropZone } from './components/DropZone'
import { Canvas } from './components/Canvas'
import { Toolbar } from './components/Toolbar'
import { TabBar } from './components/ui/TabBar'
import { AdjustmentsPanel } from './components/panels/AdjustmentsPanel'
import { FiltersPanel } from './components/panels/FiltersPanel'
import { ColorGradingPanel } from './components/panels/ColorGradingPanel'
import { EffectsPanel } from './components/panels/EffectsPanel'

const TABS = [
  { id: 'adjustments', label: 'Adjust' },
  { id: 'filters', label: 'Filters' },
  { id: 'grading', label: 'Color' },
  { id: 'effects', label: 'Effects' },
]

export default function App() {
  const [sourceImage, setSourceImage] = useState<HTMLImageElement | null>(null)
  const [filename, setFilename] = useState('untitled')
  const [params, setParams] = useState<AdjustmentParams>(DEFAULT_PARAMS)
  const [activePreset, setActivePreset] = useState<PresetName>('none')
  const [activeTab, setActiveTab] = useState<ActiveTab>('adjustments')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleImageLoaded = useCallback((img: HTMLImageElement, name: string) => {
    setSourceImage(img)
    setFilename(name)
    setParams(DEFAULT_PARAMS)
    setActivePreset('none')
  }, [])

  const handleParamChange = useCallback((partial: Partial<AdjustmentParams>) => {
    setActivePreset('none')
    setParams(prev => ({ ...prev, ...partial }))
  }, [])

  const handlePresetSelect = useCallback((name: PresetName) => {
    const preset = PRESETS.find(p => p.name === name)
    if (!preset) return
    setActivePreset(name)
    setParams(preset.params)
  }, [])

  const handleReset = useCallback(() => {
    setParams(DEFAULT_PARAMS)
    setActivePreset('none')
  }, [])

  if (!sourceImage) {
    return (
      <div className="h-full w-full bg-zinc-950 flex flex-col items-center justify-center">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">Photo Editor</h1>
          <p className="text-zinc-500 text-sm mt-1">All processing happens in your browser</p>
        </div>
        <DropZone onImageLoaded={handleImageLoaded} />
      </div>
    )
  }

  return (
    <div className="h-full w-full bg-zinc-950 flex flex-col md:flex-row overflow-hidden">
      {/* Canvas area */}
      <div className="flex-1 min-h-0 bg-zinc-950">
        <Canvas sourceImage={sourceImage} params={params} canvasRef={canvasRef} />
      </div>

      {/* Sidebar */}
      <div className="w-full md:w-80 flex flex-col bg-zinc-900 border-t md:border-t-0 md:border-l border-zinc-700 min-h-0">
        <Toolbar
          filename={filename}
          canvasRef={canvasRef}
          onReset={handleReset}
          onNewImage={handleImageLoaded}
        />
        <TabBar
          tabs={TABS}
          active={activeTab}
          onChange={id => setActiveTab(id as ActiveTab)}
        />
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'adjustments' && (
            <AdjustmentsPanel params={params} onChange={handleParamChange} />
          )}
          {activeTab === 'filters' && (
            <FiltersPanel activePreset={activePreset} onSelect={handlePresetSelect} />
          )}
          {activeTab === 'grading' && (
            <ColorGradingPanel params={params} onChange={handleParamChange} />
          )}
          {activeTab === 'effects' && (
            <EffectsPanel params={params} onChange={handleParamChange} />
          )}
        </div>
      </div>
    </div>
  )
}
