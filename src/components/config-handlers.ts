import {getRangeLimits} from "../model/config/widget-schema"
import {isEpidemicModelType, type EpidemicModelType} from "../model/simulation/epidemic-models"
import type {SimulationConfig} from "../model/simulation/types"

export function parseRangeInput(event: Event): number {
  const target = (event.currentTarget ?? event.target) as ({value?: string | number} & EventTarget) | null
  return target?.value !== undefined ? Number(target.value) : 0
}

export function parseSwitch(event: Event): boolean {
  const target = (event.currentTarget ?? event.target) as ({checked?: boolean} & EventTarget) | null
  return target?.checked ?? false
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

export type ConfigHandlerHost = {
  getPopulation: () => number
  setPopulation: (population: number) => void
  getModelType: () => EpidemicModelType
  setModelType: (modelType: EpidemicModelType) => void
  update: <K extends keyof SimulationConfig>(key: K, value: SimulationConfig[K]) => void
}

/** The input handlers of the learner menu; each turns an input event into a setting change. */
export function createConfigHandlers(host: ConfigHandlerHost) {
  const fromRange = <K extends keyof SimulationConfig>(key: K) =>
    (event: Event) => host.update(key, parseRangeInput(event) as SimulationConfig[K])
  const fromSwitch = <K extends keyof SimulationConfig>(key: K) =>
    (event: Event) => host.update(key, parseSwitch(event) as SimulationConfig[K])
  const fromRoundedRange = (key: "hotspotMaxAgents" | "hotspotSize") => (event: Event) => {
    const range = getRangeLimits(key)
    host.update(key, clamp(Math.round(parseRangeInput(event)), range.min, range.max))
  }
  return {
    onModelTypeChange: (event: Event): void => {
      const target = (event.currentTarget ?? event.target) as ({value?: string} & EventTarget) | null
      const value = target?.value
      if (!value || !isEpidemicModelType(value) || value === host.getModelType()) {
        return
      }
      host.setModelType(value)
    },
    onIncubationDurationInput: fromRange("incubationDuration"),
    onImmunityDurationInput: fromRange("immunityDuration"),
    onMortalityProbabilityInput: fromRange("mortalityProbability"),
    onPopulationInput: (event: Event): void => {
      const range = getRangeLimits("population")
      const nextPopulation = clamp(
        Math.round(parseRangeInput(event) / range.step) * range.step,
        range.min,
        range.max,
      )
      if (nextPopulation === host.getPopulation()) {
        return
      }
      host.setPopulation(nextPopulation)
    },
    onSpeedInput: fromRange("speed"),
    onInfectionRadiusInput: fromRange("infectionRadius"),
    onInfectionProbabilityInput: fromRange("infectionProbability"),
    onRecoveryDurationInput: fromRange("recoveryDuration"),
    onSimulationDurationInput: fromRange("simulationDuration"),
    onQuarantineEnabled: fromSwitch("quarantineEnabled"),
    onQuarantineProbabilityInput: fromRange("quarantineProbability"),
    onQuarantineDurationInput: fromRange("quarantineDuration"),
    onHotspotsEnabled: fromSwitch("hotspotsEnabled"),
    onHotspotVisitProbabilityInput: fromRange("hotspotVisitProbability"),
    onHotspotStayDurationInput: fromRange("hotspotStayDuration"),
    onHotspotMaxAgentsInput: fromRoundedRange("hotspotMaxAgents"),
    onHotspotSizeInput: fromRoundedRange("hotspotSize"),
    onCommunitiesEnabled: fromSwitch("communitiesEnabled"),
    onCommunityLeaveProbabilityInput: fromRange("communityLeaveProbability"),
  }
}
