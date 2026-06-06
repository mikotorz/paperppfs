import { clsx } from 'clsx'
import { Slider } from '../ui/Slider'
import type { AdjustmentParams, AnimatedEffect, AnimatedEffectState } from '../../types'

interface Props {
  params: AdjustmentParams
  onChange: (partial: Partial<AdjustmentParams>) => void
  animatedState: AnimatedEffectState
  onAnimatedStateChange: (partial: Partial<AnimatedEffectState>) => void
}

const ANIMATED_EFFECTS: { id: AnimatedEffect; label: string }[] = [
  { id: 'none', label: 'Off' },
  { id: 'holographic', label: 'Holo' },
  { id: 'crt', label: 'CRT' },
]

export function EffectsPanel({ params, onChange, animatedState, onAnimatedStateChange }: Props) {
  return (
    <div className="flex flex-col gap-4 p-3">
      <Slider label="Vignette" min={0} max={100} step={1} value={params.vignette} onChange={v => onChange({ vignette: v })} />
      <Slider label="Film Grain" min={0} max={100} step={1} value={params.grain} onChange={v => onChange({ grain: v })} />
      <Slider label="Chromatic Aberration" min={0} max={20} step={0.5} value={params.chromaticAberration} onChange={v => onChange({ chromaticAberration: v })} unit="px" />
      <Slider label="Pixelate" min={1} max={50} step={1} value={params.pixelate} onChange={v => onChange({ pixelate: v })} unit="px" />
      <Slider label="Emboss" min={0} max={100} step={1} value={params.emboss} onChange={v => onChange({ emboss: v })} />

      <div className="pt-1 border-t border-zinc-700/50">
        <p className="text-xs text-zinc-500 mb-3 uppercase tracking-wider">Glitch</p>
        <div className="flex flex-col gap-4">
          <Slider label="Slices" min={0} max={20} step={1} value={params.glitchSlices} onChange={v => onChange({ glitchSlices: v })} />
          <Slider label="Offset" min={0} max={50} step={1} value={params.glitchOffset} onChange={v => onChange({ glitchOffset: v })} unit="px" />
          <Slider label="Scanlines" min={0} max={100} step={1} value={params.scanlines} onChange={v => onChange({ scanlines: v })} />
        </div>
      </div>

      <div className="pt-1 border-t border-zinc-700/50">
        <p className="text-xs text-zinc-500 mb-3 uppercase tracking-wider">Animate <span className="normal-case">(preview only)</span></p>
        <div className="flex flex-col gap-3">
          <div className="flex gap-1">
            {ANIMATED_EFFECTS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => onAnimatedStateChange({ effect: id })}
                className={clsx(
                  'flex-1 text-xs py-1.5 rounded transition-colors',
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
      </div>
    </div>
  )
}
