export function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff]
}

export function rgbToHex(rgb: [number, number, number]): string {
  return '#' + rgb.map(v => v.toString(16).padStart(2, '0')).join('')
}
