import type {CommunityCell, Hotspot, Rect} from "./types"

export function randomPointInRect(rect: Rect): {x: number; y: number} {
  const padding = 8
  const minX = rect.x + padding
  const maxX = rect.x + Math.max(padding, rect.width - padding)
  const minY = rect.y + padding
  const maxY = rect.y + Math.max(padding, rect.height - padding)
  const x = minX + Math.random() * Math.max(1, maxX - minX)
  const y = minY + Math.random() * Math.max(1, maxY - minY)
  return {x, y}
}

export function findHotspotById(hotspots: Hotspot[], hotspotId: number): Hotspot | null {
  for (let i = 0; i < hotspots.length; i += 1) {
    if (hotspots[i].id === hotspotId) {
      return hotspots[i]
    }
  }
  return null
}

export function findCommunityById(communities: CommunityCell[], communityId: number): CommunityCell | null {
  for (let i = 0; i < communities.length; i += 1) {
    if (communities[i].id === communityId) {
      return communities[i]
    }
  }
  return null
}

export function pickDifferentCommunity(communities: CommunityCell[], currentId: number): CommunityCell | null {
  if (communities.length <= 1) {
    return null
  }
  const candidates: CommunityCell[] = []
  for (let i = 0; i < communities.length; i += 1) {
    if (communities[i].id !== currentId) {
      candidates.push(communities[i])
    }
  }
  if (candidates.length === 0) {
    return null
  }
  return candidates[Math.floor(Math.random() * candidates.length)]
}

export function findCommunityIdForPoint(x: number, y: number, communities: CommunityCell[]): number {
  for (let i = 0; i < communities.length; i += 1) {
    const rect = communities[i].rect
    const maxX = rect.x + rect.width
    const maxY = rect.y + rect.height
    if (x >= rect.x && x <= maxX && y >= rect.y && y <= maxY) {
      return communities[i].id
    }
  }
  return -1
}
