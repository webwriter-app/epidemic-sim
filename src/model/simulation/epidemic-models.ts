export type EpidemicModelType = "sir" | "sirs" | "seir" | "sird" | "seird"

export const EPIDEMIC_MODEL_TYPES: readonly EpidemicModelType[] = ["sir", "sirs", "seir", "sird", "seird"] as const

export type ChartCompartment = "susceptible" | "exposed" | "infected" | "recovered" | "dead"

export function isEpidemicModelType(value: string): value is EpidemicModelType {
  return (EPIDEMIC_MODEL_TYPES as readonly string[]).includes(value)
}

export function getChartCompartments(modelType: EpidemicModelType): ChartCompartment[] {
  if (modelType === "seir") {
    return ["susceptible", "exposed", "infected", "recovered"]
  }
  if (modelType === "sird") {
    return ["susceptible", "infected", "recovered", "dead"]
  }
  if (modelType === "seird") {
    return ["susceptible", "exposed", "infected", "recovered", "dead"]
  }
  return ["susceptible", "infected", "recovered"]
}

export interface ModelSpecificDefaults {
  incubationDuration: number
  immunityDuration: number
  mortalityProbability: number
}

export const DEFAULT_MODEL_SPECIFIC_DEFAULTS: ModelSpecificDefaults = {
  incubationDuration: 120,
  immunityDuration: 1200,
  mortalityProbability: 0.02,
}
