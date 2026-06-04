import clsx from 'clsx'
import { useFileLoader } from '../hooks/useFileLoader'

interface DropZoneProps {
  onImageLoaded: (img: HTMLImageElement, name: string) => void
}

export function DropZone({ onImageLoaded }: DropZoneProps) {
  const { isDragging, inputRef, onDrop, onDragOver, onDragLeave, openPicker, onInputChange } =
    useFileLoader(onImageLoaded)

  return (
    <div
      className="flex h-full w-full items-center justify-center p-8"
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
    >
      <div
        className={clsx(
          'flex flex-col items-center justify-center gap-4 w-full max-w-md h-64 rounded-2xl border-2 border-dashed transition-colors cursor-pointer',
          isDragging
            ? 'border-violet-500 bg-violet-500/10'
            : 'border-zinc-600 hover:border-zinc-500 bg-zinc-900/50',
        )}
        onClick={openPicker}
      >
        <svg className="w-12 h-12 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <div className="text-center">
          <p className="text-zinc-300 font-medium">Drop an image here</p>
          <p className="text-zinc-500 text-sm mt-1">or click to browse</p>
        </div>
        <p className="text-zinc-600 text-xs">JPEG, PNG, WebP, GIF supported</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onInputChange}
      />
    </div>
  )
}
