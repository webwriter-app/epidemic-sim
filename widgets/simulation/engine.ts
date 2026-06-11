import type {Agent, CommunityCell, Hotspot, Rect, SimulationAreas, SimulationConfig, SirCounts} from "./types"

export function initializeAgents(
  config: SimulationConfig,
  areas: SimulationAreas,
  infectedAtFrame: number,
): Agent[] {
  const infectedSeeds = Math.min(3, Math.max(1, Math.floor(config.population * 0.01)))
  const agents: Agent[] = []

  for (let i = 0; i < config.population; i += 1) {
    const speedScale = randomSpeedScale()
    const angle = Math.random() * Math.PI * 2
    const infected = i < infectedSeeds
    const spawn = randomPointInRect(areas.main)
    const communityId = findCommunityIdForPoint(spawn.x, spawn.y, areas.communities)
    agents.push({
      x: spawn.x,
      y: spawn.y,
      vx: Math.cos(angle) * config.speed * speedScale,
      vy: Math.sin(angle) * config.speed * speedScale,
      state: infected ? "infected" : "susceptible",
      infectedAt: infected ? infectedAtFrame : -1,
      zone: "main",
      transition: "none",
      targetX: spawn.x,
      targetY: spawn.y,
      quarantineUntilFrame: -1,
      hotspotUntilFrame: -1,
      activeHotspotId: -1,
      communityId,
      pendingCommunityId: -1,
    })
  }

  return agents
}

export function stepSimulation(
  agents: Agent[],
  frameIndex: number,
  config: SimulationConfig,
  areas: SimulationAreas,
): number {
  const nextFrame = frameIndex + 1
  moveAgents(agents, config, areas, nextFrame)
  spreadInfection(agents, nextFrame, config, areas)
  return nextFrame
}

export function getSirCounts(agents: Agent[]): SirCounts {
  let susceptible = 0
  let infected = 0
  let recovered = 0

  for (let i = 0; i < agents.length; i += 1) {
    const state = agents[i].state
    if (state === "susceptible") {
      susceptible += 1
    } else if (state === "infected") {
      infected += 1
    } else {
      recovered += 1
    }
  }

  return {susceptible, infected, recovered}
}

function moveAgents(
  agents: Agent[],
  config: SimulationConfig,
  areas: SimulationAreas,
  frameIndex: number,
): void {
  const hotspotMaxAgents = Math.max(1, Math.floor(config.hotspotMaxAgents))
  for (let i = 0; i < agents.length; i += 1) {
    const agent = agents[i]
    if (!config.communitiesEnabled && agent.communityId !== -1) {
      agent.communityId = -1
      agent.pendingCommunityId = -1
    }
    if (config.communitiesEnabled && agent.zone === "main" && agent.communityId === -1) {
      agent.communityId = findCommunityIdForPoint(agent.x, agent.y, areas.communities)
    }
    if (agent.state === "infected" && frameIndex - agent.infectedAt >= config.recoveryDuration) {
      agent.state = "recovered"
    }

    if (!config.quarantineEnabled && agent.transition === "toQuarantine") {
      beginTransitionToMain(agent, areas)
    }

    if (!config.quarantineEnabled && agent.zone !== "main" && agent.transition === "none") {
      beginTransitionToMain(agent, areas)
    }

    if (shouldReturnFromQuarantine(agent, config, frameIndex)) {
      beginTransitionToMain(agent, areas)
    }

    if (shouldStartCommunitySwitch(agent, config, areas.communities.length)) {
      beginTransitionToCommunity(agent, areas.communities)
    }

    if (!config.hotspotsEnabled && agent.activeHotspotId >= 0) {
      clearHotspotVisit(agent)
    }

    const availableHotspots = getAvailableHotspotsForAgent(agent, config, areas.hotspots)
    const nonFullHotspots = getNonFullHotspots(availableHotspots, agents, hotspotMaxAgents)
    if (shouldStartHotspotVisit(agent, config, nonFullHotspots.length)) {
      const hotspot = pickHotspotByDistance(agent, nonFullHotspots)
      if (hotspot) {
        beginTransitionToHotspot(agent, hotspot)
      }
    }

    if (agent.transition !== "none") {
      moveTransitioningAgent(agent, config.speed, areas, frameIndex, config.hotspotStayDuration)
      continue
    }

    if (agent.activeHotspotId >= 0 && agent.zone === "main") {
      const hotspot = findHotspotById(areas.hotspots, agent.activeHotspotId)
      if (!hotspot) {
        clearHotspotVisit(agent)
      } else if (config.communitiesEnabled && hotspot.communityId !== agent.communityId) {
        clearHotspotVisit(agent)
      } else if (agent.hotspotUntilFrame === -1 || frameIndex < agent.hotspotUntilFrame) {
        moveInsideBounds(agent, config.speed, hotspot.rect)
        continue
      } else {
        clearHotspotVisit(agent)
      }
    }

    const zoneBounds = getAgentMovementBounds(agent, areas)
    moveInsideBounds(agent, config.speed, zoneBounds)
  }
}

function shouldReturnFromQuarantine(
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

function shouldStartHotspotVisit(
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

function shouldStartCommunitySwitch(
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

function getAvailableHotspotsForAgent(
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

function pickHotspotByDistance(agent: Agent, hotspots: Hotspot[]): Hotspot | null {
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

function getNonFullHotspots(hotspots: Hotspot[], agents: Agent[], hotspotMaxAgents: number): Hotspot[] {
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

function getAgentMovementBounds(agent: Agent, areas: SimulationAreas): Rect {
  if (agent.zone === "quarantine" && areas.quarantine) {
    return areas.quarantine
  }
  const community = findCommunityById(areas.communities, agent.communityId)
  if (community) {
    return community.rect
  }
  return areas.main
}

function spreadInfection(
  agents: Agent[],
  frameIndex: number,
  config: SimulationConfig,
  areas: SimulationAreas,
): void {
  const radiusSq = config.infectionRadius * config.infectionRadius
  const maxNewInfectionsPerSource = 2

  for (let i = 0; i < agents.length; i += 1) {
    const source = agents[i]
    if (source.state !== "infected" || source.transition !== "none") {
      continue
    }
    let infectionsFromSource = 0
    for (let j = 0; j < agents.length; j += 1) {
      if (infectionsFromSource >= maxNewInfectionsPerSource) {
        break
      }
      const target = agents[j]
      if (target.state !== "susceptible" || target.transition !== "none") {
        continue
      }
      if (source.zone !== target.zone) {
        continue
      }
      if (config.communitiesEnabled && source.zone === "main" && source.communityId !== target.communityId) {
        continue
      }
      const dx = source.x - target.x
      const dy = source.y - target.y
      const distSq = dx * dx + dy * dy
      if (distSq > radiusSq) {
        continue
      }
      const proximityFactor = 1 - distSq / Math.max(1, radiusSq)
      const transmissionChance = config.infectionProbability * Math.max(0.15, proximityFactor)
      if (Math.random() < transmissionChance) {
        target.state = "infected"
        target.infectedAt = frameIndex
        infectionsFromSource += 1
        if (config.quarantineEnabled && areas.quarantine && Math.random() < config.quarantineProbability) {
          beginTransitionToQuarantine(target, areas.quarantine, frameIndex + config.quarantineDuration)
        }
      }
    }
  }
}

function moveInsideBounds(agent: Agent, speed: number, bounds: Rect): void {
  applyRandomWalk(agent, speed)
  agent.x += agent.vx
  agent.y += agent.vy

  const minX = bounds.x
  const maxX = bounds.x + bounds.width
  const minY = bounds.y
  const maxY = bounds.y + bounds.height

  if (agent.x <= minX || agent.x >= maxX) {
    agent.vx *= -1
    agent.x = Math.min(maxX, Math.max(minX, agent.x))
  }
  if (agent.y <= minY || agent.y >= maxY) {
    agent.vy *= -1
    agent.y = Math.min(maxY, Math.max(minY, agent.y))
  }
}

function moveTransitioningAgent(
  agent: Agent,
  speed: number,
  areas: SimulationAreas,
  frameIndex: number,
  hotspotStayDuration: number,
): void {
  if (agent.transition === "toQuarantine" && !areas.quarantine) {
    beginTransitionToMain(agent, areas)
  }

  const dx = agent.targetX - agent.x
  const dy = agent.targetY - agent.y
  const distance = Math.hypot(dx, dy)
  const arrivalThreshold = Math.max(2, speed * 2)
  if (distance <= arrivalThreshold || distance === 0) {
    agent.x = agent.targetX
    agent.y = agent.targetY
    completeTransition(agent, speed, frameIndex, hotspotStayDuration)
    return
  }

  const transitionSpeed = speed * 2.6
  const step = Math.min(transitionSpeed, distance)
  const nx = dx / distance
  const ny = dy / distance
  agent.vx = nx * transitionSpeed
  agent.vy = ny * transitionSpeed
  agent.x += nx * step
  agent.y += ny * step
}

function beginTransitionToQuarantine(agent: Agent, quarantineBounds: Rect, quarantineUntilFrame: number): void {
  clearHotspotVisit(agent)
  agent.pendingCommunityId = -1
  const target = randomPointInRect(quarantineBounds)
  agent.transition = "toQuarantine"
  agent.targetX = target.x
  agent.targetY = target.y
  agent.quarantineUntilFrame = quarantineUntilFrame
}

function beginTransitionToMain(agent: Agent, areas: SimulationAreas): void {
  clearHotspotVisit(agent)
  agent.pendingCommunityId = -1
  const targetBounds = getAgentMovementBounds(agent, areas)
  const target = randomPointInRect(targetBounds)
  agent.transition = "toMain"
  agent.targetX = target.x
  agent.targetY = target.y
}

function beginTransitionToCommunity(agent: Agent, communities: CommunityCell[]): void {
  const destination = pickDifferentCommunity(communities, agent.communityId)
  if (!destination) {
    return
  }
  clearHotspotVisit(agent)
  agent.transition = "toCommunity"
  agent.pendingCommunityId = destination.id
  const target = randomPointInRect(destination.rect)
  agent.targetX = target.x
  agent.targetY = target.y
}

function beginTransitionToHotspot(agent: Agent, hotspot: Hotspot): void {
  const target = randomPointInRect(hotspot.rect)
  agent.transition = "toHotspot"
  agent.targetX = target.x
  agent.targetY = target.y
  agent.activeHotspotId = hotspot.id
  agent.hotspotUntilFrame = -1
}

function completeTransition(agent: Agent, speed: number, frameIndex: number, hotspotStayDuration: number): void {
  if (agent.transition === "toQuarantine") {
    agent.zone = "quarantine"
    clearHotspotVisit(agent)
  } else if (agent.transition === "toHotspot") {
    agent.zone = "main"
    agent.hotspotUntilFrame = frameIndex + hotspotStayDuration
  } else if (agent.transition === "toCommunity") {
    agent.zone = "main"
    agent.communityId = agent.pendingCommunityId
    agent.pendingCommunityId = -1
  } else if (agent.transition === "toMain") {
    agent.zone = "main"
    agent.quarantineUntilFrame = -1
    agent.pendingCommunityId = -1
  }
  agent.transition = "none"
  seedVelocity(agent, speed)
}

function applyRandomWalk(agent: Agent, speed: number): void {
  const jitter = 0.25
  agent.vx += (Math.random() - 0.5) * jitter
  agent.vy += (Math.random() - 0.5) * jitter
  const velocity = Math.hypot(agent.vx, agent.vy)
  if (velocity === 0) {
    const angle = Math.random() * Math.PI * 2
    agent.vx = Math.cos(angle) * speed
    agent.vy = Math.sin(angle) * speed
    return
  }
  const speedScale = speed / velocity
  agent.vx *= speedScale
  agent.vy *= speedScale
}

function seedVelocity(agent: Agent, speed: number): void {
  const angle = Math.random() * Math.PI * 2
  agent.vx = Math.cos(angle) * speed
  agent.vy = Math.sin(angle) * speed
}

function randomSpeedScale(): number {
  return 0.75 + Math.random() * 0.5
}

function clearHotspotVisit(agent: Agent): void {
  agent.activeHotspotId = -1
  agent.hotspotUntilFrame = -1
}

function findHotspotById(hotspots: Hotspot[], hotspotId: number): Hotspot | null {
  for (let i = 0; i < hotspots.length; i += 1) {
    if (hotspots[i].id === hotspotId) {
      return hotspots[i]
    }
  }
  return null
}

function findCommunityById(communities: CommunityCell[], communityId: number): CommunityCell | null {
  for (let i = 0; i < communities.length; i += 1) {
    if (communities[i].id === communityId) {
      return communities[i]
    }
  }
  return null
}

function pickDifferentCommunity(communities: CommunityCell[], currentId: number): CommunityCell | null {
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

function findCommunityIdForPoint(x: number, y: number, communities: CommunityCell[]): number {
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

function randomPointInRect(rect: Rect): {x: number; y: number} {
  const padding = 8
  const minX = rect.x + padding
  const maxX = rect.x + Math.max(padding, rect.width - padding)
  const minY = rect.y + padding
  const maxY = rect.y + Math.max(padding, rect.height - padding)
  const x = minX + Math.random() * Math.max(1, maxX - minX)
  const y = minY + Math.random() * Math.max(1, maxY - minY)
  return {x, y}
}
