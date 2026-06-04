import type { CropRegion } from '../types'

export function displayToImage(
  clientX: number,
  clientY: number,
  imageCanvas: HTMLCanvasElement,
  imgW: number,
  imgH: number,
): { x: number; y: number } {
  const rect = imageCanvas.getBoundingClientRect()
  const x = ((clientX - rect.left) / rect.width) * imgW
  const y = ((clientY - rect.top) / rect.height) * imgH
  return {
    x: Math.max(0, Math.min(imgW, x)),
    y: Math.max(0, Math.min(imgH, y)),
  }
}

export function imageToOverlay(
  ix: number,
  iy: number,
  imageCanvas: HTMLCanvasElement,
  overlayCanvas: HTMLCanvasElement,
  imgW: number,
  imgH: number,
  dpr = (typeof window !== 'undefined' ? window.devicePixelRatio : 1) || 1,
): { x: number; y: number } {
  const imgRect = imageCanvas.getBoundingClientRect()
  const ovRect = overlayCanvas.getBoundingClientRect()
  const scaleX = (imgRect.width / imgW) * dpr
  const scaleY = (imgRect.height / imgH) * dpr
  const offsetX = (imgRect.left - ovRect.left) * dpr
  const offsetY = (imgRect.top - ovRect.top) * dpr
  return {
    x: offsetX + ix * scaleX,
    y: offsetY + iy * scaleY,
  }
}

export function clampRegion(region: CropRegion, imgW: number, imgH: number): CropRegion {
  const x = Math.max(0, Math.min(imgW - 1, region.x))
  const y = Math.max(0, Math.min(imgH - 1, region.y))
  const width = Math.max(1, Math.min(imgW - x, region.width))
  const height = Math.max(1, Math.min(imgH - y, region.height))
  return { x, y, width, height }
}

export function snapToAspectRatio(region: CropRegion, ratio: number): CropRegion {
  return { ...region, height: region.width / ratio }
}
