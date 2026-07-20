import type {EpidemicModelType} from "../simulation/epidemic-models"

export type AllowControlKey =
  | "allowModelTypeControl"
  | "allowIncubationDurationControl"
  | "allowImmunityDurationControl"
  | "allowMortalityProbabilityControl"
  | "allowPopulationControl"
  | "allowSpeedControl"
  | "allowInfectionRadiusControl"
  | "allowInfectionProbabilityControl"
  | "allowRecoveryDurationControl"
  | "allowQuarantineEnabledControl"
  | "allowHotspotsEnabledControl"
  | "allowCommunitiesEnabledControl"
  | "allowQuarantineProbabilityControl"
  | "allowQuarantineDurationControl"
  | "allowHotspotVisitProbabilityControl"
  | "allowHotspotStayDurationControl"
  | "allowHotspotMaxAgentsControl"
  | "allowHotspotSizeControl"
  | "allowCommunityLeaveProbabilityControl"

export type WidgetSchema = {
  modelType: EpidemicModelType
  incubationDuration: number
  immunityDuration: number
  mortalityProbability: number
  population: number
  speed: number
  infectionRadius: number
  infectionProbability: number
  recoveryDuration: number
  quarantineEnabled: boolean
  quarantineProbability: number
  quarantineDuration: number
  hotspotsEnabled: boolean
  hotspotVisitProbability: number
  hotspotStayDuration: number
  hotspotMaxAgents: number
  hotspotSize: number
  communitiesEnabled: boolean
  communityLeaveProbability: number
} & Record<AllowControlKey, boolean>
