import type {Agent, Hotspot, SimulationConfig} from "./types"

export function shouldReturnFromQuarantine(
  agent: Agent,
  config: SimulationConfig,
  frameIndex: number,
): boolean {
  return (
    config.quarantineEnabled &&
    agent.zone === "quarantine" &&
    agent.transition === "none" &&
    frameIndex >= agent.quarantineUntilFrame
  )
}

export function shouldStartHotspotVisit(
  agent: Agent,
  config: SimulationConfig,
  hotspotCount: number,
): boolean {
  return (
    config.hotspotsEnabled &&
    agent.zone === "main" &&
    agent.transition === "none" &&
    agent.activeHotspotId === -1 &&
    hotspotCount > 0 &&
    Math.random() < config.hotspotVisitProbability
  )
}

export function shouldStartCommunitySwitch(
  agent: Agent,
  config: SimulationConfig,
  communityCount: number,
): boolean {
  return (
    config.communitiesEnabled &&
    agent.zone === "main" &&
    agent.transition === "none" &&
    agent.activeHotspotId === -1 &&
    communityCount > 1 &&
    Math.random() < config.communityLeaveProbability
  )
}

export function getAvailableHotspotsForAgent(
  agent: Agent,
  config: SimulationConfig,
  hotspots: Hotspot[],
): Hotspot[] {
  if (!config.communitiesEnabled) {
    return hotspots
  }
  const filtered: Hotspot[] = []
  for (let i = 0; i < hotspots.length; i += 1) {
    if (hotspots[i].communityId === agent.communityId) {
      filtered.push(hotspots[i])
    }
  }
  return filtered
}

export function pickHotspotByDistance(agent: Agent, hotspots: Hotspot[]): Hotspot | null {
  if (hotspots.length === 0) {
    return null
  }
  const epsilon = 8
  const exponent = 1.35
  const weights: number[] = []
  let totalWeight = 0
  for (let i = 0; i < hotspots.length; i += 1) {
    const hotspot = hotspots[i]
    const centerX = hotspot.rect.x + hotspot.rect.width * 0.5
    const centerY = hotspot.rect.y + hotspot.rect.height * 0.5
    const distance = Math.hypot(agent.x - centerX, agent.y - centerY)
    const weight = 1 / Math.pow(distance + epsilon, exponent)
    const safeWeight = Number.isFinite(weight) && weight > 0 ? weight : 0
    weights.push(safeWeight)
    totalWeight += safeWeight
  }
  if (totalWeight <= 0) {
    return hotspots[Math.floor(Math.random() * hotspots.length)]
  }
  let threshold = Math.random() * totalWeight
  for (let i = 0; i < hotspots.length; i += 1) {
    threshold -= weights[i]
    if (threshold <= 0) {
      return hotspots[i]
    }
  }
  return hotspots[hotspots.length - 1]
}

export function getNonFullHotspots(hotspots: Hotspot[], agents: Agent[], hotspotMaxAgents: number): Hotspot[] {
  if (hotspots.length === 0) {
    return hotspots
  }
  const available: Hotspot[] = []
  for (let i = 0; i < hotspots.length; i += 1) {
    const hotspot = hotspots[i]
    const occupancy = getHotspotOccupancy(agents, hotspot.id)
    if (occupancy < hotspotMaxAgents) {
      available.push(hotspot)
    }
  }
  return available
}

function getHotspotOccupancy(agents: Agent[], hotspotId: number): number {
  let occupancy = 0
  for (let i = 0; i < agents.length; i += 1) {
    const agent = agents[i]
    if (agent.activeHotspotId !== hotspotId) {
      continue
    }
    if (agent.transition === "toHotspot" || (agent.zone === "main" && agent.transition === "none")) {
      occupancy += 1
    }
  }
  return occupancy
}
