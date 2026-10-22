import type {EpidemicModelType} from "./epidemic-models"

export type AgentState = "susceptible" | "exposed" | "infected" | "recovered" | "dead"
export type AgentZone = "main" | "quarantine"
export type AgentTransition = "none" | "toQuarantine" | "toMain" | "toHotspot" | "toCommunity"

export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

export interface SimulationAreas {
  main: Rect
  quarantine: Rect | null
  communities: CommunityCell[]
  hotspots: Hotspot[]
}

export interface Hotspot {
  id: number
  rect: Rect
  communityId: number | null
}

export interface CommunityCell {
  id: number
  rect: Rect
}

export interface Agent {
  x: number
  y: number
  vx: number
  vy: number
  state: AgentState
  stateEnteredAt: number
  zone: AgentZone
  transition: AgentTransition
  targetX: number
  targetY: number
  quarantineUntilFrame: number
  hotspotUntilFrame: number
  activeHotspotId: number
  communityId: number
  pendingCommunityId: number
}

export interface SimulationConfig {
  modelType: EpidemicModelType
  incubationDuration: number
  immunityDuration: number
  mortalityProbability: number
  population: number
  speed: number
  infectionRadius: number
  infectionProbability: number
  recoveryDuration: number
  simulationDuration: number
  quarantineEnabled: boolean
  quarantineProbability: number
  quarantineDuration: number
  hotspotsEnabled: boolean
  hotspotCount: number
  hotspotVisitProbability: number
  hotspotStayDuration: number
  hotspotMaxAgents: number
  hotspotSize: number
  communitiesEnabled: boolean
  communityLeaveProbability: number
}

export interface EpidemicCounts {
  susceptible: number
  exposed: number
  infected: number
  recovered: number
  dead: number
}

export interface SimulationSnapshot {
  id: string
  label: string
  createdAt: number
  estimatedR0: number | null
  config: SimulationConfig
  frameIndex: number
  epidemicEnded: boolean
  susceptibleCount: number
  exposedCount: number
  infectedCount: number
  recoveredCount: number
  deadCount: number
  susceptibleHistory: number[]
  exposedHistory: number[]
  infectedHistory: number[]
  recoveredHistory: number[]
  deadHistory: number[]
  userHotspots: Hotspot[]
}
