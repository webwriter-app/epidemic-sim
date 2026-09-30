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
  | "allowSimulationDurationControl"
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

export type RangeSchema = {
  kind: "range"
  min: number
  max: number
  step: number
  defaultValue: number
}

export type ToggleSchema = {
  kind: "toggle"
  defaultValue: boolean
}

export type SelectSchema<TValue extends string> = {
  kind: "select"
  defaultValue: TValue
}

export const HOTSPOT_COUNT = 3

export const CONFIG_SCHEMA = {
  modelType: {kind: "select", defaultValue: "sir"} as SelectSchema<EpidemicModelType>,
  incubationDuration: {kind: "range", min: 30, max: 1200, step: 30, defaultValue: 120} as RangeSchema,
  immunityDuration: {kind: "range", min: 120, max: 4800, step: 60, defaultValue: 1200} as RangeSchema,
  mortalityProbability: {kind: "range", min: 0.001, max: 0.5, step: 0.001, defaultValue: 0.02} as RangeSchema,
  population: {kind: "range", min: 50, max: 800, step: 10, defaultValue: 240} as RangeSchema,
  speed: {kind: "range", min: 0.2, max: 4, step: 0.1, defaultValue: 1.6} as RangeSchema,
  infectionRadius: {kind: "range", min: 4, max: 40, step: 1, defaultValue: 10} as RangeSchema,
  infectionProbability: {kind: "range", min: 0.01, max: 1, step: 0.01, defaultValue: 0.2} as RangeSchema,
  recoveryDuration: {kind: "range", min: 60, max: 2400, step: 30, defaultValue: 600} as RangeSchema,
  simulationDuration: {kind: "range", min: 24, max: 8544, step: 24, defaultValue: 1440} as RangeSchema,
  quarantineEnabled: {kind: "toggle", defaultValue: false} as ToggleSchema,
  quarantineProbability: {kind: "range", min: 0.01, max: 1, step: 0.01, defaultValue: 0.7} as RangeSchema,
  quarantineDuration: {kind: "range", min: 30, max: 2400, step: 30, defaultValue: 450} as RangeSchema,
  hotspotsEnabled: {kind: "toggle", defaultValue: false} as ToggleSchema,
  hotspotVisitProbability: {kind: "range", min: 0.001, max: 0.2, step: 0.001, defaultValue: 0.02} as RangeSchema,
  hotspotStayDuration: {kind: "range", min: 30, max: 1800, step: 30, defaultValue: 240} as RangeSchema,
  hotspotMaxAgents: {kind: "range", min: 1, max: 120, step: 1, defaultValue: 30} as RangeSchema,
  hotspotSize: {kind: "range", min: 24, max: 110, step: 2, defaultValue: 56} as RangeSchema,
  communitiesEnabled: {kind: "toggle", defaultValue: false} as ToggleSchema,
  communityLeaveProbability: {kind: "range", min: 0.0001, max: 0.01, step: 0.0001, defaultValue: 0.0004} as RangeSchema,
} as const

export type ConfigSchemaKey = keyof typeof CONFIG_SCHEMA

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
  simulationDuration: number
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

export type RangeLimits = {min: number; max: number; step: number}

export function getRangeLimits(key: ConfigSchemaKey): RangeLimits {
  const schema = CONFIG_SCHEMA[key]
  if (schema.kind !== "range") {
    throw new Error(`Expected range schema for ${key}`)
  }
  return {min: schema.min, max: schema.max, step: schema.step}
}

export const MENU_RANGE_LIMITS = {
  incubationDuration: getRangeLimits("incubationDuration"),
  immunityDuration: getRangeLimits("immunityDuration"),
  mortalityProbability: getRangeLimits("mortalityProbability"),
  population: getRangeLimits("population"),
  speed: getRangeLimits("speed"),
  infectionRadius: getRangeLimits("infectionRadius"),
  infectionProbability: getRangeLimits("infectionProbability"),
  recoveryDuration: getRangeLimits("recoveryDuration"),
  simulationDuration: getRangeLimits("simulationDuration"),
  quarantineProbability: getRangeLimits("quarantineProbability"),
  quarantineDuration: getRangeLimits("quarantineDuration"),
  hotspotVisitProbability: getRangeLimits("hotspotVisitProbability"),
  hotspotStayDuration: getRangeLimits("hotspotStayDuration"),
  hotspotMaxAgents: getRangeLimits("hotspotMaxAgents"),
  hotspotSize: getRangeLimits("hotspotSize"),
  communityLeaveProbability: getRangeLimits("communityLeaveProbability"),
} as const
