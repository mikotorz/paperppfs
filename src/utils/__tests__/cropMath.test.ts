import { describe, it, expect } from 'vitest'
import { clampRegion, snapToAspectRatio, displayToImage, hitTest, buildRegion } from '../cropMath'
import type { CropRegion } from '../../types'

function region(x: number, y: number, width: number, height: number): CropRegion {
  return { x, y, width, height }
}

function mockCanvas(left: number, top: number, width: number, height: number): HTMLCanvasElement {
  return {
    getBoundingClientRect: () => ({ left, top, width, height, right: left + width, bottom: top + height, x: left, y: top, toJSON: () => ({}) }),
  } as unknown as HTMLCanvasElement
}

// ─── snapToAspectRatio ──────────────────────────────────────────────────────

describe('snapToAspectRatio', () => {
  it('1:1 ratio sets height equal to width', () => {
    const out = snapToAspectRatio(region(0, 0, 300, 999), 1)
    expect(out.height).toBe(300)
  })

  it('4:3 ratio sets height to width * 3/4', () => {
    const out = snapToAspectRatio(region(0, 0, 400, 999), 4 / 3)
    expect(out.height).toBeCloseTo(300)
  })

  it('16:9 ratio sets height to width * 9/16', () => {
    const out = snapToAspectRatio(region(0, 0, 1600, 999), 16 / 9)
    expect(out.height).toBeCloseTo(900)
  })

  it('x, y, and width are preserved unchanged', () => {
    const out = snapToAspectRatio(region(10, 20, 200, 999), 1)
    expect(out.x).toBe(10)
    expect(out.y).toBe(20)
    expect(out.width).toBe(200)
  })
})

// ─── displayToImage ─────────────────────────────────────────────────────────

describe('displayToImage', () => {
  it('center of displayed canvas maps to image center', () => {
    // Canvas displayed at (0,0), 500×400; image is 1000×800
    const canvas = mockCanvas(0, 0, 500, 400)
    const pt = displayToImage(250, 200, canvas, 1000, 800)
    expect(pt.x).toBeCloseTo(500)
    expect(pt.y).toBeCloseTo(400)
  })

  it('top-left of canvas maps to (0, 0)', () => {
    const canvas = mockCanvas(0, 0, 500, 400)
    const pt = displayToImage(0, 0, canvas, 1000, 800)
    expect(pt.x).toBe(0)
    expect(pt.y).toBe(0)
  })

  it('applies display-to-image scale when canvas is CSS-scaled', () => {
    // Canvas element starts at (100, 50), displayed 200×100; image is 800×600
    const canvas = mockCanvas(100, 50, 200, 100)
    const pt = displayToImage(200, 100, canvas, 800, 600)
    // (200-100)/200 * 800 = 400, (100-50)/100 * 600 = 300
    expect(pt.x).toBeCloseTo(400)
    expect(pt.y).toBeCloseTo(300)
  })

  it('pointer outside canvas is clamped to image bounds', () => {
    const canvas = mockCanvas(0, 0, 500, 400)
    const beyond = displayToImage(9999, 9999, canvas, 1000, 800)
    expect(beyond.x).toBe(1000)
    expect(beyond.y).toBe(800)
    const before = displayToImage(-100, -100, canvas, 1000, 800)
    expect(before.x).toBe(0)
    expect(before.y).toBe(0)
  })
})

// ─── clampRegion ────────────────────────────────────────────────────────────

describe('clampRegion', () => {
  it('region fully inside bounds is unchanged', () => {
    const r = region(10, 20, 50, 40)
    expect(clampRegion(r, 200, 200)).toEqual(r)
  })

  it('negative x and y are clamped to 0', () => {
    const out = clampRegion(region(-10, -5, 50, 40), 200, 200)
    expect(out.x).toBe(0)
    expect(out.y).toBe(0)
  })

  it('region extending past right/bottom edge is trimmed', () => {
    const out = clampRegion(region(160, 170, 80, 60), 200, 200)
    expect(out.width).toBe(40)
    expect(out.height).toBe(30)
  })

  it('width and height are floored at 1', () => {
    const out = clampRegion(region(0, 0, 0, -5), 200, 200)
    expect(out.width).toBeGreaterThanOrEqual(1)
    expect(out.height).toBeGreaterThanOrEqual(1)
  })
})

// ─── hitTest ────────────────────────────────────────────────────────────────

describe('hitTest', () => {
  it('point inside region returns true', () => {
    expect(hitTest(50, 50, region(10, 10, 100, 100))).toBe(true)
  })

  it('point at top-left corner returns true', () => {
    expect(hitTest(10, 10, region(10, 10, 100, 100))).toBe(true)
  })

  it('point at bottom-right corner returns true', () => {
    expect(hitTest(110, 110, region(10, 10, 100, 100))).toBe(true)
  })

  it('point outside region returns false', () => {
    expect(hitTest(5, 50, region(10, 10, 100, 100))).toBe(false)
    expect(hitTest(50, 5, region(10, 10, 100, 100))).toBe(false)
    expect(hitTest(111, 50, region(10, 10, 100, 100))).toBe(false)
    expect(hitTest(50, 111, region(10, 10, 100, 100))).toBe(false)
  })
})

// ─── buildRegion ────────────────────────────────────────────────────────────

describe('buildRegion', () => {
  it('returns null when resulting region is too small', () => {
    expect(buildRegion(0, 0, 3, 3, null, 500, 500)).toBeNull()
  })

  it('normalises inverted drag (end before start)', () => {
    const r = buildRegion(100, 100, 10, 10, null, 500, 500)
    expect(r).not.toBeNull()
    expect(r!.x).toBe(10)
    expect(r!.y).toBe(10)
    expect(r!.width).toBe(90)
    expect(r!.height).toBe(90)
  })

  it('applies aspect ratio when provided', () => {
    const r = buildRegion(0, 0, 100, 999, 2, 500, 500)
    expect(r).not.toBeNull()
    expect(r!.height).toBeCloseTo(50)  // width=100, ratio=2 → height=50
  })

  it('clamps result to image bounds', () => {
    const r = buildRegion(480, 480, 600, 600, null, 500, 500)
    expect(r).not.toBeNull()
    expect(r!.x + r!.width).toBeLessThanOrEqual(500)
    expect(r!.y + r!.height).toBeLessThanOrEqual(500)
  })

  it('free ratio (null) uses raw height from drag', () => {
    const r = buildRegion(0, 0, 80, 60, null, 500, 500)
    expect(r).not.toBeNull()
    expect(r!.width).toBe(80)
    expect(r!.height).toBe(60)
  })
})
