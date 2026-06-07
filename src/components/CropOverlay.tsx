import { useCallback, useEffect, useRef, useState } from 'react'
import type { AspectRatioPreset, CropRegion } from '../types'
import { ASPECT_RATIO_PRESETS } from '../constants/cropPresets'
import { clampRegion, displayToImage, hitTest, buildRegion, imageToOverlay } from '../utils/cropMath'

interface CropOverlayProps {
  imageWidth: number
  imageHeight: number
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  cropRegion: CropRegion | null
  aspectRatio: AspectRatioPreset
  onCropChange: (region: CropRegion | null) => void
}

type DragMode = 'draw' | 'move'

export function CropOverlay({
  imageWidth,
  imageHeight,
  canvasRef,
  cropRegion,
  aspectRatio,
  onCropChange,
}: CropOverlayProps) {
  const overlayRef = useRef<HTMLCanvasElement>(null)
  const dragMode = useRef<DragMode>('draw')
  const dragStart = useRef<{ x: number; y: number } | null>(null)
  const moveOffset = useRef<{ x: number; y: number } | null>(null)
  const dragSnapshot = useRef<CropRegion | null>(null)
  const isDraggingRef = useRef(false)
  const [isDragging, setIsDragging] = useState(false)
  const [cursor, setCursor] = useState<string>('crosshair')

  const getAspectRatio = useCallback(() => {
    const preset = ASPECT_RATIO_PRESETS.find(p => p.id === aspectRatio)
    return preset?.ratio ?? null
  }, [aspectRatio])

  const paint = useCallback(() => {
    const overlay = overlayRef.current
    const imageCanvas = canvasRef.current
    if (!overlay || !imageCanvas) return

    const dpr = window.devicePixelRatio || 1
    const displayW = overlay.clientWidth
    const displayH = overlay.clientHeight
    overlay.width = displayW * dpr
    overlay.height = displayH * dpr

    const ctx = overlay.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, overlay.width, overlay.height)

    if (!cropRegion) {
      ctx.fillStyle = 'rgba(0,0,0,0.25)'
      ctx.fillRect(0, 0, overlay.width, overlay.height)
      return
    }

    const tl = imageToOverlay(cropRegion.x, cropRegion.y, imageCanvas, overlay, imageWidth, imageHeight)
    const br = imageToOverlay(cropRegion.x + cropRegion.width, cropRegion.y + cropRegion.height, imageCanvas, overlay, imageWidth, imageHeight)
    const boxW = br.x - tl.x
    const boxH = br.y - tl.y

    ctx.fillStyle = 'rgba(0,0,0,0.55)'
    ctx.fillRect(0, 0, overlay.width, tl.y)
    ctx.fillRect(0, br.y, overlay.width, overlay.height - br.y)
    ctx.fillRect(0, tl.y, tl.x, boxH)
    ctx.fillRect(br.x, tl.y, overlay.width - br.x, boxH)

    ctx.strokeStyle = 'rgba(255,255,255,0.3)'
    ctx.lineWidth = 1
    for (let i = 1; i < 3; i++) {
      const x = tl.x + (boxW * i) / 3
      ctx.beginPath(); ctx.moveTo(x, tl.y); ctx.lineTo(x, br.y); ctx.stroke()
      const y = tl.y + (boxH * i) / 3
      ctx.beginPath(); ctx.moveTo(tl.x, y); ctx.lineTo(br.x, y); ctx.stroke()
    }

    ctx.strokeStyle = 'rgba(255,255,255,0.9)'
    ctx.lineWidth = 1.5
    ctx.strokeRect(tl.x, tl.y, boxW, boxH)

    const hs = 8
    ctx.fillStyle = 'rgba(255,255,255,0.95)'
    for (const [cx, cy] of [[tl.x, tl.y], [br.x - hs, tl.y], [tl.x, br.y - hs], [br.x - hs, br.y - hs]] as [number, number][]) {
      ctx.fillRect(cx, cy, hs, hs)
    }
  }, [cropRegion, imageWidth, imageHeight, canvasRef])

  useEffect(() => { paint() }, [paint])

  useEffect(() => {
    const handleResize = () => paint()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [paint])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDraggingRef.current) return
    const imageCanvas = canvasRef.current
    if (!imageCanvas) return
    const { x, y } = displayToImage(e.clientX, e.clientY, imageCanvas, imageWidth, imageHeight)
    setCursor(cropRegion && hitTest(x, y, cropRegion) ? 'move' : 'crosshair')
  }, [canvasRef, imageWidth, imageHeight, cropRegion])

  const onMouseLeave = useCallback(() => {
    if (!isDraggingRef.current) setCursor('crosshair')
  }, [])

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    const imageCanvas = canvasRef.current
    if (!imageCanvas) return
    const { x, y } = displayToImage(e.clientX, e.clientY, imageCanvas, imageWidth, imageHeight)

    if (cropRegion && hitTest(x, y, cropRegion)) {
      dragMode.current = 'move'
      moveOffset.current = { x: x - cropRegion.x, y: y - cropRegion.y }
      dragSnapshot.current = { ...cropRegion }
    } else {
      dragMode.current = 'draw'
      dragStart.current = { x, y }
      dragSnapshot.current = null
      onCropChange(null)
    }
    isDraggingRef.current = true
    setIsDragging(true)
  }, [canvasRef, imageWidth, imageHeight, cropRegion, onCropChange])

  useEffect(() => {
    if (!isDragging) return

    const onMove = (e: MouseEvent) => {
      const imageCanvas = canvasRef.current
      if (!imageCanvas) return
      const { x: ex, y: ey } = displayToImage(e.clientX, e.clientY, imageCanvas, imageWidth, imageHeight)

      if (dragMode.current === 'move' && moveOffset.current && dragSnapshot.current) {
        const snap = dragSnapshot.current
        const nx = Math.max(0, Math.min(imageWidth - snap.width, ex - moveOffset.current.x))
        const ny = Math.max(0, Math.min(imageHeight - snap.height, ey - moveOffset.current.y))
        onCropChange({ ...snap, x: nx, y: ny })
      } else if (dragMode.current === 'draw' && dragStart.current) {
        onCropChange(buildRegion(dragStart.current.x, dragStart.current.y, ex, ey, getAspectRatio(), imageWidth, imageHeight))
      }
    }

    const onUp = (e: MouseEvent) => {
      const imageCanvas = canvasRef.current
      if (!imageCanvas) return
      const { x: ex, y: ey } = displayToImage(e.clientX, e.clientY, imageCanvas, imageWidth, imageHeight)

      if (dragMode.current === 'move' && moveOffset.current && dragSnapshot.current) {
        const snap = dragSnapshot.current
        const nx = Math.max(0, Math.min(imageWidth - snap.width, ex - moveOffset.current.x))
        const ny = Math.max(0, Math.min(imageHeight - snap.height, ey - moveOffset.current.y))
        onCropChange({ ...snap, x: nx, y: ny })
      } else if (dragMode.current === 'draw' && dragStart.current) {
        onCropChange(buildRegion(dragStart.current.x, dragStart.current.y, ex, ey, getAspectRatio(), imageWidth, imageHeight))
      }

      dragStart.current = null
      moveOffset.current = null
      dragSnapshot.current = null
      isDraggingRef.current = false
      setIsDragging(false)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [isDragging, getAspectRatio, canvasRef, imageWidth, imageHeight, onCropChange])

  return (
    <canvas
      ref={overlayRef}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        cursor,
        touchAction: 'none',
      }}
    />
  )
}
