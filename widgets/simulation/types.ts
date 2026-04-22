export type AgentState = "susceptible" | "infected" | "recovered"

export interface Agent {
  x: number
  y: number
  vx: number
  vy: number
  state: AgentState
  infectedAt: number
}

export interface SimulationConfig {
  population: number
  speed: number
  infectionRadius: number
  infectionProbability: number
  recoveryDuration: number
}

export interface SirCounts {
  susceptible: number
  infected: number
  recovered: number
}
