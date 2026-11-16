import {spreadInfection} from "./spread-infection"
import {moveAgents} from "./move-agents"
import type {Agent, EpidemicCounts, SimulationAreas, SimulationConfig} from "./types"

export {initializeAgents} from "./initialize-agents"

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

export function getEpidemicCounts(agents: Agent[]): EpidemicCounts {
  let susceptible = 0
  let exposed = 0
  let infected = 0
  let recovered = 0
  let dead = 0

  for (let i = 0; i < agents.length; i += 1) {
    const state = agents[i].state
    if (state === "susceptible") {
      susceptible += 1
    } else if (state === "exposed") {
      exposed += 1
    } else if (state === "infected") {
      infected += 1
    } else if (state === "recovered") {
      recovered += 1
    } else {
      dead += 1
    }
  }

  return {susceptible, exposed, infected, recovered, dead}
}
