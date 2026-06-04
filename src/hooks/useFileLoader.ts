import { useCallback, useRef, useState } from 'react'

export function useFileLoader(onLoaded: (img: HTMLImageElement, name: string) => void) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const loadFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      onLoaded(img, file.name)
      URL.revokeObjectURL(url)
    }
    img.src = url
  }, [onLoaded])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) loadFile(file)
  }, [loadFile])

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const onDragLeave = useCallback(() => setIsDragging(false), [])

  const openPicker = useCallback(() => inputRef.current?.click(), [])

  const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) loadFile(file)
    e.target.value = ''
  }, [loadFile])

  return { isDragging, inputRef, onDrop, onDragOver, onDragLeave, openPicker, onInputChange }
}
