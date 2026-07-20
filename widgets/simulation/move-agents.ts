import {updateDiseaseStates} from "./disease-progression"
import {findHotspotById, findCommunityIdForPoint} from "./spatial-helpers"
import {
  getAvailableHotspotsForAgent,
  getNonFullHotspots,
  pickHotspotByDistance,
  shouldReturnFromQuarantine,
  shouldStartCommunitySwitch,
  shouldStartHotspotVisit,
} from "./hotspot-visits"
import {moveInsideBounds} from "./agent-physics"
import {
  beginTransitionToCommunity,
  beginTransitionToHotspot,
  beginTransitionToMain,
  clearHotspotVisit,
  getAgentMovementBounds,
  moveTransitioningAgent,
} from "./zone-transitions"
import type {Agent, SimulationAreas, SimulationConfig} from "./types"

export function moveAgents(
  agents: Agent[],
  config: SimulationConfig,
  areas: SimulationAreas,
  frameIndex: number,
): void {
  updateDiseaseStates(agents, frameIndex, config)
  const hotspotMaxAgents = Math.max(1, Math.floor(config.hotspotMaxAgents))
  for (let i = 0; i < agents.length; i += 1) {
    const agent = agents[i]
    if (agent.state === "dead") {
      continue
    }
    if (!config.communitiesEnabled && agent.communityId !== -1) {
      agent.communityId = -1
      agent.pendingCommunityId = -1
    }
    if (config.communitiesEnabled && agent.zone === "main" && agent.communityId === -1) {
      agent.communityId = findCommunityIdForPoint(agent.x, agent.y, areas.communities)
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
