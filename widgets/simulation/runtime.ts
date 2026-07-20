import {getEpidemicCounts, initializeAgents, stepSimulation} from "./engine"
import type {Agent, EpidemicCounts, SimulationAreas, SimulationConfig} from "./types"

export type SimulationRuntimeState = {
  frameIndex: number
  agents: Agent[]
}

export function createSimulationRuntime(
  config: SimulationConfig,
  areas: SimulationAreas,
  infectedAtFrame = 0,
): SimulationRuntimeState {
  return {
    frameIndex: 0,
    agents: initializeAgents(config, areas, infectedAtFrame),
  }
}

export function stepSimulationRuntime(
  state: SimulationRuntimeState,
  config: SimulationConfig,
  areas: SimulationAreas,
): EpidemicCounts {
  state.frameIndex = stepSimulation(state.agents, state.frameIndex, config, areas)
  return getEpidemicCounts(state.agents)
}
