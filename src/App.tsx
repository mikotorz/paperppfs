import { useCallback, useRef, useState } from 'react'
import type { ActiveTab, AdjustmentParams, AnimatedEffectState, AspectRatioPreset, CropRegion, PresetName } from './types'
import { DEFAULT_PARAMS } from './constants/defaults'
import { PRESETS } from './constants/presets'
import { ASPECT_RATIO_PRESETS, FLIP_MAP } from './constants/cropPresets'
import { snapToAspectRatio } from './utils/cropMath'
import { DropZone } from './components/DropZone'
import { Canvas } from './components/Canvas'
import { CropOverlay } from './components/CropOverlay'
import { Toolbar } from './components/Toolbar'
import { TabBar } from './components/ui/TabBar'
import { AdjustmentsPanel } from './components/panels/AdjustmentsPanel'
import { FiltersPanel } from './components/panels/FiltersPanel'
import { ColorGradingPanel } from './components/panels/ColorGradingPanel'
import { EffectsPanel } from './components/panels/EffectsPanel'
import { AnimationsPanel } from './components/panels/AnimationsPanel'
import { CropPanel } from './components/panels/CropPanel'

const TABS = [
  { id: 'adjustments', label: 'Adjust' },
  { id: 'filters', label: 'Filters' },
  { id: 'grading', label: 'Color' },
  { id: 'effects', label: 'Effects' },
  { id: 'animate', label: 'Animate' },
]

export default function App() {
  const [sourceImage, setSourceImage] = useState<HTMLImageElement | null>(null)
  const [filename, setFilename] = useState('untitled')
  const [params, setParams] = useState<AdjustmentParams>(DEFAULT_PARAMS)
  const [activePreset, setActivePreset] = useState<PresetName>('none')
  const [activeTab, setActiveTab] = useState<ActiveTab>('adjustments')
  const [isCropMode, setIsCropMode] = useState(false)
  const [cropRegion, setCropRegion] = useState<CropRegion | null>(null)
  const [aspectRatio, setAspectRatio] = useState<AspectRatioPreset>('free')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [animatedState, setAnimatedState] = useState<AnimatedEffectState>({
    effect: 'none',
    tilt3D: false,
  })

  const handleAnimatedStateChange = useCallback((partial: Partial<AnimatedEffectState>) => {
    setAnimatedState(prev => ({ ...prev, ...partial }))
  }, [])

  const handleImageLoaded = useCallback((img: HTMLImageElement, name: string) => {
    setSourceImage(img)
    setFilename(name)
    setParams(DEFAULT_PARAMS)
    setActivePreset('none')
    setIsCropMode(false)
    setCropRegion(null)
    setAspectRatio('free')
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

  const handleEnterCrop = useCallback(() => {
    setIsCropMode(true)
    setCropRegion(null)
    setAspectRatio('free')
  }, [])

  const handleCancelCrop = useCallback(() => {
    setIsCropMode(false)
    setCropRegion(null)
  }, [])

  const handleApplyCrop = useCallback(() => {
    if (!cropRegion) return
    const srcCanvas = canvasRef.current
    if (!srcCanvas) return
    const w = Math.round(cropRegion.width)
    const h = Math.round(cropRegion.height)
    if (w < 1 || h < 1) return
    const tmp = document.createElement('canvas')
    tmp.width = w
    tmp.height = h
    const ctx = tmp.getContext('2d')
    if (!ctx) return
    ctx.drawImage(srcCanvas, cropRegion.x, cropRegion.y, cropRegion.width, cropRegion.height, 0, 0, w, h)
    tmp.toBlob(blob => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const img = new Image()
      img.onload = () => {
        handleImageLoaded(img, filename)
        URL.revokeObjectURL(url)
      }
      img.src = url
    }, 'image/png')
  }, [cropRegion, canvasRef, filename, handleImageLoaded])

  const handleAspectChange = useCallback((ratio: AspectRatioPreset) => {
    setAspectRatio(ratio)
    if (ratio !== 'free') {
      const preset = ASPECT_RATIO_PRESETS.find(p => p.id === ratio)
      if (preset?.ratio != null) {
        setCropRegion(prev => prev ? snapToAspectRatio(prev, preset.ratio!) : null)
      }
    }
  }, [])

  const handleFlipRatio = useCallback(() => {
    const flipped = FLIP_MAP[aspectRatio]
    if (flipped) handleAspectChange(flipped)
  }, [aspectRatio, handleAspectChange])

  if (!sourceImage) {
    return (
      <div className="h-full w-full bg-zinc-950 flex flex-col items-center justify-center">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">paperppfs</h1>
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
        <Canvas
          sourceImage={sourceImage}
          params={params}
          canvasRef={canvasRef}
          animatedEffect={animatedState.effect}
          tilt3D={animatedState.tilt3D}
          cropOverlay={
            isCropMode ? (
              <CropOverlay
                imageWidth={sourceImage.naturalWidth}
                imageHeight={sourceImage.naturalHeight}
                canvasRef={canvasRef}
                cropRegion={cropRegion}
                aspectRatio={aspectRatio}
                onCropChange={setCropRegion}
              />
            ) : undefined
          }
        />
      </div>

      {/* Sidebar */}
      <div className="w-full md:w-80 flex flex-col bg-zinc-900 border-t md:border-t-0 md:border-l border-zinc-700 min-h-0">
        <Toolbar
          filename={filename}
          canvasRef={canvasRef}
          isCropMode={isCropMode}
          onReset={handleReset}
          onCrop={handleEnterCrop}
          onNewImage={handleImageLoaded}
        />
        {isCropMode ? (
          <CropPanel
            aspectRatio={aspectRatio}
            cropRegion={cropRegion}
            onAspectChange={handleAspectChange}
            onFlip={handleFlipRatio}
            onApply={handleApplyCrop}
            onCancel={handleCancelCrop}
          />
        ) : (
          <>
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
                <EffectsPanel
                  params={params}
                  onChange={handleParamChange}
                />
              )}
              {activeTab === 'animate' && (
                <AnimationsPanel
                  animatedState={animatedState}
                  onAnimatedStateChange={handleAnimatedStateChange}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
