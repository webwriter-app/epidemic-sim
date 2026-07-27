import type {SimulationConfig} from "../simulation/types"
import {HOTSPOT_COUNT} from "./widget-schema"
import type {WidgetConfigValues} from "./menu-allow-flags"

export function buildSimulationConfig(options: WidgetConfigValues): SimulationConfig {
  return {
    modelType: options.modelType,
    incubationDuration: options.incubationDuration,
    immunityDuration: options.immunityDuration,
    mortalityProbability: options.mortalityProbability,
    population: options.population,
    speed: options.speed,
    infectionRadius: options.infectionRadius,
    infectionProbability: options.infectionProbability,
    recoveryDuration: options.recoveryDuration,
    quarantineEnabled: options.quarantineEnabled,
    quarantineProbability: options.quarantineProbability,
    quarantineDuration: options.quarantineDuration,
    hotspotsEnabled: options.hotspotsEnabled,
    hotspotCount: HOTSPOT_COUNT,
    hotspotVisitProbability: options.hotspotVisitProbability,
    hotspotStayDuration: options.hotspotStayDuration,
    hotspotMaxAgents: options.hotspotMaxAgents,
    hotspotSize: options.hotspotSize,
    communitiesEnabled: options.communitiesEnabled,
    communityLeaveProbability: options.communityLeaveProbability,
  }
}
