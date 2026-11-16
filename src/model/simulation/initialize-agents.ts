import {findCommunityIdForPoint, randomPointInRect} from "./spatial-helpers"
import {randomSpeedScale} from "./agent-physics"
import type {Agent, SimulationAreas, SimulationConfig} from "./types"

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
      stateEnteredAt: infected ? infectedAtFrame : -1,
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
