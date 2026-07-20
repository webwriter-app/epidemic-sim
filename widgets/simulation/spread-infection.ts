import {beginTransitionToQuarantine} from "./zone-transitions"
import type {Agent, SimulationAreas, SimulationConfig} from "./types"

export function spreadInfection(
  agents: Agent[],
  frameIndex: number,
  config: SimulationConfig,
  areas: SimulationAreas,
): void {
  const radiusSq = config.infectionRadius * config.infectionRadius
  const maxNewInfectionsPerSource = 2
  const useExposedState = config.modelType === "seir" || config.modelType === "seird"

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
        if (useExposedState) {
          target.state = "exposed"
        } else {
          target.state = "infected"
        }
        target.stateEnteredAt = frameIndex
        infectionsFromSource += 1
        if (config.quarantineEnabled && areas.quarantine && Math.random() < config.quarantineProbability) {
          beginTransitionToQuarantine(target, areas.quarantine, frameIndex + config.quarantineDuration)
        }
      }
    }
  }
}
