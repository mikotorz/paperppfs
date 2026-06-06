export function createPreviewData(source: ImageData, maxDim: number): ImageData {
  const { width: w, height: h } = source
  if (w <= maxDim && h <= maxDim) return source
  const scale = maxDim / Math.max(w, h)
  const pw = Math.round(w * scale)
  const ph = Math.round(h * scale)
  const srcCanvas = document.createElement('canvas')
  srcCanvas.width = w
  srcCanvas.height = h
  srcCanvas.getContext('2d')!.putImageData(source, 0, 0)
  const dst = document.createElement('canvas')
  dst.width = pw
  dst.height = ph
  dst.getContext('2d')!.drawImage(srcCanvas, 0, 0, pw, ph)
  return dst.getContext('2d')!.getImageData(0, 0, pw, ph)
}
