import type {EpidemicModelType} from "../../simulation/epidemic-models"

export type MenuAllowFlags = {
  allowModelTypeControl: boolean
  allowIncubationDurationControl: boolean
  allowImmunityDurationControl: boolean
  allowMortalityProbabilityControl: boolean
  allowPopulationControl: boolean
  allowSpeedControl: boolean
  allowInfectionRadiusControl: boolean
  allowInfectionProbabilityControl: boolean
  allowRecoveryDurationControl: boolean
  allowQuarantineEnabledControl: boolean
  allowHotspotsEnabledControl: boolean
  allowCommunitiesEnabledControl: boolean
  allowQuarantineProbabilityControl: boolean
  allowQuarantineDurationControl: boolean
  allowHotspotVisitProbabilityControl: boolean
  allowHotspotStayDurationControl: boolean
  allowHotspotMaxAgentsControl: boolean
  allowHotspotSizeControl: boolean
  allowCommunityLeaveProbabilityControl: boolean
}

export function hasVisibleMenuControls(flags: MenuAllowFlags): boolean {
  return Object.values(flags).some(Boolean)
}

type ModelTypeOption = {
  value: EpidemicModelType
  label: string
}

export type RenderMenuOptions = MenuAllowFlags & {
  modelType: EpidemicModelType
  modelTypeOptions: ModelTypeOption[]
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
  placedHotspotCount: number
  hotspotVisitProbability: number
  hotspotStayDuration: number
  hotspotMaxAgents: number
  hotspotSize: number
  communitiesEnabled: boolean
  communityLeaveProbability: number
  onModelTypeChange: (event: Event) => void
  onIncubationDurationInput: (event: Event) => void
  onImmunityDurationInput: (event: Event) => void
  onMortalityProbabilityInput: (event: Event) => void
  onPopulationInput: (event: Event) => void
  onSpeedInput: (event: Event) => void
  onInfectionRadiusInput: (event: Event) => void
  onInfectionProbabilityInput: (event: Event) => void
  onRecoveryDurationInput: (event: Event) => void
  onToggleQuarantine: (event: Event) => void
  onQuarantineProbabilityInput: (event: Event) => void
  onQuarantineDurationInput: (event: Event) => void
  onToggleHotspots: (event: Event) => void
  onHotspotVisitProbabilityInput: (event: Event) => void
  onHotspotStayDurationInput: (event: Event) => void
  onHotspotMaxAgentsInput: (event: Event) => void
  onHotspotSizeInput: (event: Event) => void
  onToggleCommunities: (event: Event) => void
  onCommunityLeaveProbabilityInput: (event: Event) => void
}

export function hasModelMenuControls(flags: MenuAllowFlags): boolean {
  return (
    flags.allowModelTypeControl ||
    flags.allowIncubationDurationControl ||
    flags.allowImmunityDurationControl ||
    flags.allowMortalityProbabilityControl
  )
}

export function hasGeneralMenuControls(flags: MenuAllowFlags): boolean {
  return (
    flags.allowPopulationControl ||
    flags.allowSpeedControl ||
    flags.allowInfectionRadiusControl ||
    flags.allowInfectionProbabilityControl ||
    flags.allowRecoveryDurationControl
  )
}

export function hasQuarantineMenuControls(flags: MenuAllowFlags): boolean {
  return (
    flags.allowQuarantineEnabledControl ||
    flags.allowQuarantineProbabilityControl ||
    flags.allowQuarantineDurationControl
  )
}

export function hasHotspotsMenuControls(flags: MenuAllowFlags): boolean {
  return (
    flags.allowHotspotsEnabledControl ||
    flags.allowHotspotVisitProbabilityControl ||
    flags.allowHotspotStayDurationControl ||
    flags.allowHotspotMaxAgentsControl ||
    flags.allowHotspotSizeControl
  )
}

export function hasCommunitiesMenuControls(flags: MenuAllowFlags): boolean {
  return flags.allowCommunitiesEnabledControl || flags.allowCommunityLeaveProbabilityControl
}
