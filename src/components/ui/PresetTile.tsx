import clsx from 'clsx'
import type { Preset } from '../../types'

interface PresetTileProps {
  preset: Preset
  isActive: boolean
  onClick: () => void
}

const SWATCH_COLORS: Record<string, string> = {
  none: 'bg-zinc-500',
  vintage: 'bg-amber-700',
  noir: 'bg-zinc-800',
  vivid: 'bg-pink-500',
  faded: 'bg-zinc-400',
  warm: 'bg-orange-500',
  cool: 'bg-sky-500',
  matte: 'bg-stone-500',
  chrome: 'bg-blue-300',
  fade: 'bg-zinc-300',
}

export function PresetTile({ preset, isActive, onClick }: PresetTileProps) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'flex flex-col items-center gap-1.5 p-2 rounded-lg transition-all',
        isActive
          ? 'ring-2 ring-violet-500 bg-zinc-800'
          : 'bg-zinc-800/50 hover:bg-zinc-800',
      )}
    >
      <div className={clsx('w-12 h-12 rounded-md', SWATCH_COLORS[preset.name] ?? 'bg-zinc-600')} />
      <span className="text-xs text-zinc-300 leading-none">{preset.label}</span>
    </button>
  )
}
