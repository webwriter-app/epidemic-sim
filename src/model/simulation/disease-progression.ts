import type {Agent, SimulationConfig} from "./types"

export function updateDiseaseStates(agents: Agent[], frameIndex: number, config: SimulationConfig): void {
  for (let i = 0; i < agents.length; i += 1) {
    const agent = agents[i]
    if (agent.state === "dead") {
      continue
    }

    if ((config.modelType === "seir" || config.modelType === "seird") && agent.state === "exposed") {
      if (agent.stateEnteredAt >= 0 && frameIndex - agent.stateEnteredAt >= config.incubationDuration) {
        agent.state = "infected"
        agent.stateEnteredAt = frameIndex
      }
      continue
    }

    if (agent.state === "infected" && agent.stateEnteredAt >= 0) {
      if (frameIndex - agent.stateEnteredAt < config.recoveryDuration) {
        continue
      }
      if (
        (config.modelType === "sird" || config.modelType === "seird") &&
        Math.random() < config.mortalityProbability
      ) {
        agent.state = "dead"
      } else {
        agent.state = "recovered"
      }
      agent.stateEnteredAt = frameIndex
      continue
    }

    if (config.modelType === "sirs" && agent.state === "recovered") {
      if (agent.stateEnteredAt >= 0 && frameIndex - agent.stateEnteredAt >= config.immunityDuration) {
        agent.state = "susceptible"
        agent.stateEnteredAt = -1
      }
    }
  }
}
