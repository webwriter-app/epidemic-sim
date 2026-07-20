import type {Hotspot, Rect} from "../simulation/types"

export type HotspotCorner = "nw" | "ne" | "sw" | "se"

export function findHotspotById(hotspots: Hotspot[], hotspotId: number): Hotspot | null {
  for (let i = 0; i < hotspots.length; i += 1) {
    if (hotspots[i].id === hotspotId) {
      return hotspots[i]
    }
  }
  return null
}

export function findTopmostHotspotAtPoint(x: number, y: number, hotspots: Hotspot[]): Hotspot | null {
  for (let i = hotspots.length - 1; i >= 0; i -= 1) {
    const rect = hotspots[i].rect
    const inside = x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height
    if (inside) {
      return hotspots[i]
    }
  }
  return null
}

export function getHotspotCornerAtPoint(x: number, y: number, rect: Rect): HotspotCorner | null {
  const handleRadius = 7
  const corners = [
    {key: "nw" as const, x: rect.x, y: rect.y},
    {key: "ne" as const, x: rect.x + rect.width, y: rect.y},
    {key: "sw" as const, x: rect.x, y: rect.y + rect.height},
    {key: "se" as const, x: rect.x + rect.width, y: rect.y + rect.height},
  ]
  for (let i = 0; i < corners.length; i += 1) {
    const dx = x - corners[i].x
    const dy = y - corners[i].y
    if (Math.hypot(dx, dy) <= handleRadius) {
      return corners[i].key
    }
  }
  return null
}

export function getOppositeCornerPoint(rect: Rect, corner: HotspotCorner): {x: number; y: number} {
  if (corner === "nw") {
    return {x: rect.x + rect.width, y: rect.y + rect.height}
  }
  if (corner === "ne") {
    return {x: rect.x, y: rect.y + rect.height}
  }
  if (corner === "sw") {
    return {x: rect.x + rect.width, y: rect.y}
  }
  return {x: rect.x, y: rect.y}
}

export function getResizedHotspotRect(
  pointX: number,
  pointY: number,
  anchor: {x: number; y: number},
  corner: HotspotCorner,
): Rect {
  if (corner === "nw") {
    return {x: Math.min(pointX, anchor.x), y: Math.min(pointY, anchor.y), width: Math.abs(anchor.x - pointX), height: Math.abs(anchor.y - pointY)}
  }
  if (corner === "ne") {
    return {x: Math.min(anchor.x, pointX), y: Math.min(pointY, anchor.y), width: Math.abs(pointX - anchor.x), height: Math.abs(anchor.y - pointY)}
  }
  if (corner === "sw") {
    return {x: Math.min(pointX, anchor.x), y: Math.min(anchor.y, pointY), width: Math.abs(anchor.x - pointX), height: Math.abs(pointY - anchor.y)}
  }
  return {x: Math.min(anchor.x, pointX), y: Math.min(anchor.y, pointY), width: Math.abs(pointX - anchor.x), height: Math.abs(pointY - anchor.y)}
}
