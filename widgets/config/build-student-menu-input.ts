import type {EpidemicModelType} from "../simulation/epidemic-models"
import type {RenderMenuOptions} from "../rendering/menu-renderer"
import type {WidgetConfigValues} from "./menu-allow-flags"

type MenuHandlers = Pick<
  RenderMenuOptions,
  | "onModelTypeChange"
  | "onIncubationDurationInput"
  | "onImmunityDurationInput"
  | "onMortalityProbabilityInput"
  | "onPopulationInput"
  | "onSpeedInput"
  | "onInfectionRadiusInput"
  | "onInfectionProbabilityInput"
  | "onRecoveryDurationInput"
  | "onQuarantineEnabled"
  | "onQuarantineProbabilityInput"
  | "onQuarantineDurationInput"
  | "onHotspotsEnabled"
  | "onHotspotVisitProbabilityInput"
  | "onHotspotStayDurationInput"
  | "onHotspotMaxAgentsInput"
  | "onHotspotSizeInput"
  | "onCommunitiesEnabled"
  | "onCommunityLeaveProbabilityInput"
>

type ModelTypeOption = {value: EpidemicModelType; label: string}

export function buildStudentMenuInput(
  options: WidgetConfigValues,
  placedHotspotCount: number,
  modelTypeOptions: ModelTypeOption[],
  handlers: MenuHandlers,
): RenderMenuOptions {
  return {
    modelType: options.modelType,
    modelTypeOptions,
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
    placedHotspotCount,
    hotspotVisitProbability: options.hotspotVisitProbability,
    hotspotStayDuration: options.hotspotStayDuration,
    hotspotMaxAgents: options.hotspotMaxAgents,
    hotspotSize: options.hotspotSize,
    communitiesEnabled: options.communitiesEnabled,
    communityLeaveProbability: options.communityLeaveProbability,
    allowModelTypeControl: options.allowModelTypeControl,
    allowIncubationDurationControl: options.allowIncubationDurationControl,
    allowImmunityDurationControl: options.allowImmunityDurationControl,
    allowMortalityProbabilityControl: options.allowMortalityProbabilityControl,
    allowPopulationControl: options.allowPopulationControl,
    allowSpeedControl: options.allowSpeedControl,
    allowInfectionRadiusControl: options.allowInfectionRadiusControl,
    allowInfectionProbabilityControl: options.allowInfectionProbabilityControl,
    allowRecoveryDurationControl: options.allowRecoveryDurationControl,
    allowQuarantineEnabledControl: options.allowQuarantineEnabledControl,
    allowHotspotsEnabledControl: options.allowHotspotsEnabledControl,
    allowCommunitiesEnabledControl: options.allowCommunitiesEnabledControl,
    allowQuarantineProbabilityControl: options.allowQuarantineProbabilityControl,
    allowQuarantineDurationControl: options.allowQuarantineDurationControl,
    allowHotspotVisitProbabilityControl: options.allowHotspotVisitProbabilityControl,
    allowHotspotStayDurationControl: options.allowHotspotStayDurationControl,
    allowHotspotMaxAgentsControl: options.allowHotspotMaxAgentsControl,
    allowHotspotSizeControl: options.allowHotspotSizeControl,
    allowCommunityLeaveProbabilityControl: options.allowCommunityLeaveProbabilityControl,
    ...handlers,
  }
}
