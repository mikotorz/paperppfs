interface Props {
  onAcknowledge: () => void
}

export function AnimateWarningGate({ onAcknowledge }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 p-6 h-full text-center">
      <div className="text-4xl">⚠️</div>
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold text-amber-400">Photosensitivity Warning</p>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Animated effects contain flashing lights and rapid visual changes that may trigger
          seizures or other reactions in people with photosensitive epilepsy.
        </p>
      </div>
      <button
        onClick={onAcknowledge}
        className="text-xs px-4 py-2 rounded bg-amber-500 hover:bg-amber-400 text-zinc-900 font-semibold transition-colors"
      >
        I understand the risk
      </button>
    </div>
  )
}
