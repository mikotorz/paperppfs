import { clsx } from 'clsx'
import type { AnimatedEffect, AnimatedEffectState } from '../../types'

interface Props {
  animatedState: AnimatedEffectState
  onAnimatedStateChange: (partial: Partial<AnimatedEffectState>) => void
}

const ANIMATED_EFFECTS: { id: AnimatedEffect; label: string }[] = [
  { id: 'none', label: 'Off' },
  { id: 'holographic', label: 'Holo' },
  { id: 'crt', label: 'CRT' },
  { id: 'vhs', label: 'VHS' },
  { id: 'filmreel', label: 'Film' },
  { id: 'neonpulse', label: 'Neon' },
  { id: 'rgbjitter', label: 'RGB' },
]

export function AnimationsPanel({ animatedState, onAnimatedStateChange }: Props) {
  return (
    <div className="flex flex-col gap-4 p-3">
      <p className="text-xs text-zinc-500 uppercase tracking-wider">
        Animate <span className="normal-case">(preview only — not exported)</span>
      </p>


      <div className="grid grid-cols-3 gap-1.5">
        {ANIMATED_EFFECTS.map(({ id, label }) => (
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
        ))}
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
