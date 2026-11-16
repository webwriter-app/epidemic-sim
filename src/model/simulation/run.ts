import {getEpidemicCounts, initializeAgents, stepSimulation} from "./engine"
import type {Agent, EpidemicCounts, SimulationAreas, SimulationConfig} from "./types"

/** The agents of one simulation, the current frame and how many agents are in each state. */
export class SimulationRun {
  agents: Agent[] = []
  frameIndex = 0
  counts: EpidemicCounts = {susceptible: 0, exposed: 0, infected: 0, recovered: 0, dead: 0}

  /** Place new agents; the infection starts at `infectedAtFrame`. */
  initialize(config: SimulationConfig, areas: SimulationAreas, infectedAtFrame: number): void {
    this.agents = initializeAgents(config, areas, infectedAtFrame)
  }

  clear(): void {
    this.agents = []
  }

  step(config: SimulationConfig, areas: SimulationAreas): void {
    this.frameIndex = stepSimulation(this.agents, this.frameIndex, config, areas)
  }

  updateCounts(): void {
    this.counts = getEpidemicCounts(this.agents)
  }

  hasActiveInfection(): boolean {
    return this.counts.infected > 0 || this.counts.exposed > 0
  }

  isWaveFinished(config: SimulationConfig): boolean {
    if (this.frameIndex >= config.simulationDuration) {
      return true
    }
    if (this.hasActiveInfection()) {
      return false
    }
    if (config.modelType === "sirs") {
      return this.counts.recovered === 0
    }
    return true
  }
}
