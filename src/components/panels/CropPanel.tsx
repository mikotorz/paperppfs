import { clsx } from 'clsx'
import type { AspectRatioPreset, CropRegion } from '../../types'
import { ASPECT_RATIO_PRESETS, FLIP_MAP } from '../../constants/cropPresets'

interface CropPanelProps {
  aspectRatio: AspectRatioPreset
  cropRegion: CropRegion | null
  onAspectChange: (ratio: AspectRatioPreset) => void
  onFlip: () => void
  onApply: () => void
  onCancel: () => void
}

export function CropPanel({ aspectRatio, cropRegion, onAspectChange, onFlip, onApply, onCancel }: CropPanelProps) {
  const canFlip = aspectRatio in FLIP_MAP

  return (
    <div className="flex flex-col gap-4 p-3 flex-1 overflow-y-auto">
      <p className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Aspect Ratio</p>

      <div className="grid grid-cols-2 gap-1.5">
        {ASPECT_RATIO_PRESETS.map(preset => (
          <button
            key={preset.id}
            onClick={() => onAspectChange(preset.id)}
            className={clsx(
              'text-xs py-1.5 px-2 rounded transition-colors font-medium',
              aspectRatio === preset.id
                ? 'bg-violet-600 text-white ring-2 ring-violet-400'
                : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-200',
            )}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <button
        onClick={onFlip}
        disabled={!canFlip}
        className={clsx(
          'flex items-center justify-center gap-1.5 text-xs py-1.5 px-3 rounded transition-colors',
          canFlip
            ? 'bg-zinc-700 hover:bg-zinc-600 text-zinc-200'
            : 'bg-zinc-800 text-zinc-600 cursor-not-allowed',
        )}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0">
          <path d="M2 4L5 1M5 1L8 4M5 1V8M10 8L7 11M7 11L4 8M7 11V4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Flip orientation
      </button>

      <div className="text-xs text-zinc-400 text-center py-1">
        {cropRegion
          ? `${Math.round(cropRegion.width)} × ${Math.round(cropRegion.height)} px`
          : 'Draw a crop region on the image'}
      </div>

      <div className="flex gap-2 mt-auto">
        <button
          onClick={onCancel}
          className="flex-1 text-xs py-2 rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-200 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onApply}
          disabled={!cropRegion}
          className={clsx(
            'flex-1 text-xs py-2 rounded font-medium transition-colors',
            cropRegion
              ? 'bg-violet-600 hover:bg-violet-500 text-white'
              : 'bg-zinc-800 text-zinc-600 cursor-not-allowed',
          )}
        >
          Apply
        </button>
      </div>
    </div>
  )
}
