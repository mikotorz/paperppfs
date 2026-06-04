import { useFileLoader } from '../hooks/useFileLoader'

interface ToolbarProps {
  filename: string
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  isCropMode: boolean
  onReset: () => void
  onCrop: () => void
  onNewImage: (img: HTMLImageElement, name: string) => void
}

export function Toolbar({ filename, canvasRef, isCropMode, onReset, onCrop, onNewImage }: ToolbarProps) {
  const { inputRef, openPicker, onInputChange } = useFileLoader(onNewImage)

  function download() {
    const canvas = canvasRef.current
    if (!canvas) return
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    const base = filename.replace(/\.[^.]+$/, '')
    a.download = `${base}-edited.png`
    a.click()
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2.5 border-b border-zinc-700">
      <span className="text-xs font-semibold text-zinc-100 tracking-tight shrink-0">paperppfs</span>
      <span className="flex-1 text-xs text-zinc-500 truncate min-w-0" title={filename}>{filename}</span>
      <button
        onClick={openPicker}
        className="text-xs px-2.5 py-1.5 rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-200 transition-colors"
      >
        Open
      </button>
      <button
        onClick={onReset}
        className="text-xs px-2.5 py-1.5 rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-200 transition-colors"
      >
        Reset
      </button>
      {!isCropMode && (
        <button
          onClick={onCrop}
          className="text-xs px-2.5 py-1.5 rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-200 transition-colors"
        >
          Crop
        </button>
      )}
      <button
        onClick={download}
        className="text-xs px-2.5 py-1.5 rounded bg-violet-600 hover:bg-violet-500 text-white transition-colors font-medium"
      >
        Export
      </button>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onInputChange} />
    </div>
  )
}
