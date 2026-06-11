export type AgentState = "susceptible" | "infected" | "recovered"
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
  infectedAt: number
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
  population: number
  speed: number
  infectionRadius: number
  infectionProbability: number
  recoveryDuration: number
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

export interface SirCounts {
  susceptible: number
  infected: number
  recovered: number
}

export interface SimulationSnapshot {
  id: string
  label: string
  createdAt: number
  chartImageJpeg: string | null
  estimatedR0: number | null
  config: SimulationConfig
  frameIndex: number
  epidemicEnded: boolean
  susceptibleCount: number
  infectedCount: number
  recoveredCount: number
  susceptibleHistory: number[]
  infectedHistory: number[]
  recoveredHistory: number[]
  userHotspots: Hotspot[]
}
