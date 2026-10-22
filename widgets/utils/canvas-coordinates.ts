import {getRangeLimits} from "../config/widget-schema"
import {SIMULATION_CANVAS_HEIGHT, SIMULATION_CANVAS_WIDTH} from "../simulation/canvas-dimensions"
import type {Rect} from "../simulation/types"

export function getCanvasPoint(
  canvas: HTMLCanvasElement | null,
  clientX: number,
  clientY: number,
  clampToCanvas = false,
): {x: number; y: number} | null {
  if (!canvas) {
    return null
  }
  const bounds = canvas.getBoundingClientRect()
  let normalizedX = (clientX - bounds.left) * (SIMULATION_CANVAS_WIDTH / Math.max(1, bounds.width))
  let normalizedY = (clientY - bounds.top) * (SIMULATION_CANVAS_HEIGHT / Math.max(1, bounds.height))
  if (clampToCanvas) {
    normalizedX = clamp(normalizedX, 0, SIMULATION_CANVAS_WIDTH)
    normalizedY = clamp(normalizedY, 0, SIMULATION_CANVAS_HEIGHT)
    return {x: normalizedX, y: normalizedY}
  }
  if (
    normalizedX < 0 ||
    normalizedY < 0 ||
    normalizedX > SIMULATION_CANVAS_WIDTH ||
    normalizedY > SIMULATION_CANVAS_HEIGHT
  ) {
    return null
  }
  return {x: normalizedX, y: normalizedY}
}

export function fitCanvasToDisplaySize(canvas: HTMLCanvasElement): void {
  const pixelRatio = window.devicePixelRatio || 1
  const width = Math.round(canvas.clientWidth * pixelRatio)
  const height = Math.round(canvas.clientHeight * pixelRatio)
  if (width <= 0 || height <= 0) {
    return
  }
  if (Math.abs(canvas.width - width) > 1 || Math.abs(canvas.height - height) > 1) {
    canvas.width = width
    canvas.height = height
  }
}

export function clampHotspotPosition(x: number, y: number, size: number, mainRect: Rect): {x: number; y: number} {
  const minX = mainRect.x
  const minY = mainRect.y
  const maxX = mainRect.x + Math.max(0, mainRect.width - size)
  const maxY = mainRect.y + Math.max(0, mainRect.height - size)
  return {
    x: clamp(x, minX, maxX),
    y: clamp(y, minY, maxY),
  }
}

export function clampHotspotRect(rect: Rect, mainRect: Rect): Rect {
  const sizeLimits = getRangeLimits("hotspotSize")
  const maxWidth = Math.min(sizeLimits.max, mainRect.width)
  const maxHeight = Math.min(sizeLimits.max, mainRect.height)
  const width = clamp(rect.width, Math.min(sizeLimits.min, maxWidth), maxWidth)
  const height = clamp(rect.height, Math.min(sizeLimits.min, maxHeight), maxHeight)
  const minX = mainRect.x
  const minY = mainRect.y
  const maxX = mainRect.x + Math.max(0, mainRect.width - width)
  const maxY = mainRect.y + Math.max(0, mainRect.height - height)
  return {
    x: clamp(rect.x, minX, maxX),
    y: clamp(rect.y, minY, maxY),
    width,
    height,
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}
