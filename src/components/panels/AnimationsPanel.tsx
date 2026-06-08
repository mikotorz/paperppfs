import { clsx } from 'clsx'
import type { AnimatedEffect, AnimatedEffectState } from '../../types'

interface Props {
  animatedState: AnimatedEffectState
  onAnimatedStateChange: (partial: Partial<AnimatedEffectState>) => void
}

type EffectEntry = { id: AnimatedEffect; label: string } | { divider: true; label: string }

const ANIMATED_EFFECTS: EffectEntry[] = [
  { id: 'none', label: 'Off' },
  { id: 'holographic', label: 'Holo' },
  { id: 'crt', label: 'CRT' },
  { id: 'vhs', label: 'VHS' },
  { id: 'filmreel', label: 'Film' },
  { id: 'neonpulse', label: 'Neon' },
  { id: 'rgbjitter', label: 'RGB' },
  { divider: true, label: 'GLSL' },
  { id: 'plasma', label: 'Plasma' },
  { id: 'aurora', label: 'Aurora' },
  { id: 'ripple', label: 'Ripple' },
  { id: 'starfield', label: 'Stars' },
  { id: 'liquid', label: 'Liquid' },
  { id: 'vortex', label: 'Vortex' },
  { id: 'infrared', label: 'Infrared' },
  { id: 'glitchdrop', label: 'Glitch Drop' },
  { id: 'crystal', label: 'Crystal' },
  { divider: true, label: 'FX' },
  { id: 'lightning', label: 'Lightning' },
  { id: 'rain', label: 'Rain' },
  { id: 'fire', label: 'Fire' },
  { id: 'matrix', label: 'Matrix' },
]

export function AnimationsPanel({ animatedState, onAnimatedStateChange }: Props) {
  return (
    <div className="flex flex-col gap-4 p-3">
      <p className="text-xs text-zinc-500 uppercase tracking-wider">
        Animate <span className="normal-case">(preview only — not exported)</span>
      </p>


      <div className="grid grid-cols-3 gap-1.5">
        {ANIMATED_EFFECTS.map((entry) => {
          if ('divider' in entry) {
            return (
              <div key={entry.label} className="col-span-3 text-xs text-zinc-500 uppercase tracking-wider mt-1">
                {entry.label}
              </div>
            )
          }
          const { id, label } = entry
          return (
            <button
              key={id}
              onClick={() => onAnimatedStateChange({ effect: id })}
              className={clsx(
                'text-xs py-2 rounded transition-colors',
                animatedState.effect === id
                  ? 'bg-violet-600 text-white'
                  : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600',
              )}
            >
              {label}
            </button>
          )
        })}
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={animatedState.tilt3D}
          onChange={e => onAnimatedStateChange({ tilt3D: e.target.checked })}
          className="accent-violet-500"
        />
        <span className="text-xs text-zinc-300">3D Tilt (mouse parallax)</span>
      </label>
    </div>
  )
}
