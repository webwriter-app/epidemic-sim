import {findCommunityById, pickDifferentCommunity, randomPointInRect} from "./spatial-helpers"
import {seedVelocity} from "./agent-physics"
import type {Agent, CommunityCell, Hotspot, Rect, SimulationAreas} from "./types"

export function clearHotspotVisit(agent: Agent): void {
  agent.activeHotspotId = -1
  agent.hotspotUntilFrame = -1
}

export function getAgentMovementBounds(agent: Agent, areas: SimulationAreas): Rect {
  if (agent.zone === "quarantine" && areas.quarantine) {
    return areas.quarantine
  }
  const community = findCommunityById(areas.communities, agent.communityId)
  if (community) {
    return community.rect
  }
  return areas.main
}

export function beginTransitionToQuarantine(agent: Agent, quarantineBounds: Rect, quarantineUntilFrame: number): void {
  clearHotspotVisit(agent)
  agent.pendingCommunityId = -1
  const target = randomPointInRect(quarantineBounds)
  agent.transition = "toQuarantine"
  agent.targetX = target.x
  agent.targetY = target.y
  agent.quarantineUntilFrame = quarantineUntilFrame
}

export function beginTransitionToMain(agent: Agent, areas: SimulationAreas): void {
  clearHotspotVisit(agent)
  agent.pendingCommunityId = -1
  const targetBounds = getAgentMovementBounds(agent, areas)
  const target = randomPointInRect(targetBounds)
  agent.transition = "toMain"
  agent.targetX = target.x
  agent.targetY = target.y
}

export function beginTransitionToCommunity(agent: Agent, communities: CommunityCell[]): void {
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

export function beginTransitionToHotspot(agent: Agent, hotspot: Hotspot): void {
  const target = randomPointInRect(hotspot.rect)
  agent.transition = "toHotspot"
  agent.targetX = target.x
  agent.targetY = target.y
  agent.activeHotspotId = hotspot.id
  agent.hotspotUntilFrame = -1
}

export function completeTransition(agent: Agent, speed: number, frameIndex: number, hotspotStayDuration: number): void {
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

export function moveTransitioningAgent(
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

  const transitionSpeed = speed * 5
  const step = Math.min(transitionSpeed, distance)
  const nx = dx / distance
  const ny = dy / distance
  agent.vx = nx * transitionSpeed
  agent.vy = ny * transitionSpeed
  agent.x += nx * step
  agent.y += ny * step
}
