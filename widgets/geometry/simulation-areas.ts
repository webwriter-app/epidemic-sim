import type {CommunityCell, Hotspot, Rect, SimulationAreas, SimulationConfig} from "../simulation/types"

type AreaBuilderInput = {
  canvasWidth: number
  canvasHeight: number
  config: SimulationConfig
  userHotspots: Hotspot[]
}

export function buildSimulationAreas(input: AreaBuilderInput): SimulationAreas {
  const {canvasWidth: width, canvasHeight: height, config} = input
  const communitiesEnabled = config.communitiesEnabled

  if (!config.quarantineEnabled) {
    const mainRect: Rect = {x: 0, y: 0, width, height}
    const communities = communitiesEnabled ? createCommunities(mainRect) : []
    return {
      main: mainRect,
      quarantine: null,
      communities,
      hotspots: resolveUserHotspots(input, mainRect, communities),
    }
  }

  const margin = 10
  const quarantineWidth = Math.max(120, Math.round(width * 0.24))
  const quarantineHeight = Math.max(90, Math.round(height * 0.3))
  const quarantineRect: Rect = {
    x: width - quarantineWidth - margin,
    y: margin,
    width: quarantineWidth,
    height: quarantineHeight,
  }
  const mainRect: Rect = {x: 0, y: 0, width: Math.max(120, quarantineRect.x - margin), height}
  const communities = communitiesEnabled ? createCommunities(mainRect) : []
  return {
    main: mainRect,
    quarantine: quarantineRect,
    communities,
    hotspots: resolveUserHotspots(input, mainRect, communities),
  }
}

export function createCommunities(mainRect: Rect): CommunityCell[] {
  const communities: CommunityCell[] = []
  const cols = 3
  const rows = 3
  const baseWidth = Math.floor(mainRect.width / cols)
  const baseHeight = Math.floor(mainRect.height / rows)
  let id = 0
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const cellX = mainRect.x + col * baseWidth
      const cellY = mainRect.y + row * baseHeight
      const cellWidth = col === cols - 1 ? mainRect.width - baseWidth * (cols - 1) : baseWidth
      const cellHeight = row === rows - 1 ? mainRect.height - baseHeight * (rows - 1) : baseHeight
      communities.push({
        id,
        rect: {x: cellX, y: cellY, width: cellWidth, height: cellHeight},
      })
      id += 1
    }
  }
  return communities
}

function resolveUserHotspots(
  input: AreaBuilderInput,
  mainRect: Rect,
  communities: CommunityCell[],
): Hotspot[] {
  if (!input.config.hotspotsEnabled) {
    return []
  }
  const resolved: Hotspot[] = []
  for (let i = 0; i < input.userHotspots.length; i += 1) {
    const hotspot = input.userHotspots[i]
    const clampedRect = clampHotspotRect(hotspot.rect, mainRect)
    const communityId = resolveHotspotCommunityId(
      clampedRect.x,
      clampedRect.y,
      clampedRect.width,
      clampedRect.height,
      communities,
      input.config.communitiesEnabled,
    )
    resolved.push({id: hotspot.id, communityId, rect: clampedRect})
  }
  return resolved
}

export function getDefaultHotspotSize(mainRect: Rect, hotspotSize: number): number {
  const rawSize = Math.max(24, Math.min(110, hotspotSize))
  const maxHorizontal = Math.max(18, mainRect.width - 8)
  const maxVertical = Math.max(18, mainRect.height - 8)
  return Math.min(rawSize, maxHorizontal, maxVertical)
}

export function clampHotspotRect(rect: Rect, mainRect: Rect): Rect {
  const minWidth = Math.min(18, mainRect.width)
  const minHeight = Math.min(18, mainRect.height)
  const width = clamp(rect.width, minWidth, mainRect.width)
  const height = clamp(rect.height, minHeight, mainRect.height)
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

export function resolveHotspotCommunityId(
  hotspotX: number,
  hotspotY: number,
  hotspotWidth: number,
  hotspotHeight: number,
  communities: CommunityCell[],
  communitiesEnabled: boolean,
): number | null {
  if (!communitiesEnabled || communities.length === 0) {
    return null
  }
  const centerX = hotspotX + hotspotWidth * 0.5
  const centerY = hotspotY + hotspotHeight * 0.5
  for (let i = 0; i < communities.length; i += 1) {
    const rect = communities[i].rect
    const maxX = rect.x + rect.width
    const maxY = rect.y + rect.height
    if (centerX >= rect.x && centerX <= maxX && centerY >= rect.y && centerY <= maxY) {
      return communities[i].id
    }
  }
  return null
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}
