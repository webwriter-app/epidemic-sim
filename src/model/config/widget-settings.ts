import {CONFIG_SCHEMA, type ConfigSchemaKey} from "./widget-schema"
import {EPIDEMIC_MODEL_TYPES} from "../simulation/epidemic-models"

// What a label function needs of the widget: its catalog.
type Host = {msg: (text: string) => string}

type RangeKey = {[K in ConfigSchemaKey]: (typeof CONFIG_SCHEMA)[K] extends {kind: "range"} ? K : never}[ConfigSchemaKey]
type ToggleKey = {[K in ConfigSchemaKey]: (typeof CONFIG_SCHEMA)[K] extends {kind: "toggle"} ? K : never}[ConfigSchemaKey]

const LABELS = {
  modelType: (widget: Host) => widget.msg("Model type"),
  incubationDuration: (widget: Host) => widget.msg("Incubation duration"),
  immunityDuration: (widget: Host) => widget.msg("Immunity duration"),
  mortalityProbability: (widget: Host) => widget.msg("Mortality probability"),
  population: (widget: Host) => widget.msg("Population"),
  speed: (widget: Host) => widget.msg("Speed"),
  infectionRadius: (widget: Host) => widget.msg("Infection radius"),
  infectionProbability: (widget: Host) => widget.msg("Infection probability"),
  recoveryDuration: (widget: Host) => widget.msg("Recovery duration"),
  simulationDuration: (widget: Host) => widget.msg("Simulation duration"),
  quarantineEnabled: (widget: Host) => widget.msg("Enable quarantine"),
  quarantineProbability: (widget: Host) => widget.msg("Quarantine probability"),
  quarantineDuration: (widget: Host) => widget.msg("Quarantine duration"),
  hotspotsEnabled: (widget: Host) => widget.msg("Enable hotspots"),
  hotspotVisitProbability: (widget: Host) => widget.msg("Hotspot visit probability"),
  hotspotStayDuration: (widget: Host) => widget.msg("Hotspot stay duration"),
  hotspotMaxAgents: (widget: Host) => widget.msg("Maximum agents in a hotspot"),
  hotspotSize: (widget: Host) => widget.msg("Hotspot size"),
  communitiesEnabled: (widget: Host) => widget.msg("Enable communities"),
  communityLeaveProbability: (widget: Host) => widget.msg("Probability of leaving the community"),
} as const

export const MODEL_TYPE_LABELS = {
  sir: (widget: Host) => widget.msg("SIR"),
  sirs: (widget: Host) => widget.msg("SIRS"),
  seir: (widget: Host) => widget.msg("SEIR"),
  sird: (widget: Host) => widget.msg("SIRD"),
  seird: (widget: Host) => widget.msg("SEIRD"),
} as const

const range = <K extends RangeKey & keyof typeof LABELS>(key: K, group: string) => {
  const {min, max, step, defaultValue} = CONFIG_SCHEMA[key]
  return {type: Number, default: defaultValue, min, max, step, control: "range", group, label: LABELS[key]} as const
}

const toggle = <K extends ToggleKey & keyof typeof LABELS>(key: K, group: string) =>
  ({type: Boolean, default: CONFIG_SCHEMA[key].defaultValue, group, label: LABELS[key]}) as const

// A learner control: the author lets learners change the setting of the same name.
const allow = (key: keyof typeof LABELS) => ({type: Boolean, group: "controls", label: LABELS[key]}) as const

/**
 * The author's settings of the widget, one declaration each. The attribute of a setting is its name in kebab case
 * (`model-type`, `allow-model-type-control`), as it always was. Their visibility depends on the model and is added in `options`.
 */
export const SETTINGS = {
  modelType: {
    type: "select",
    default: CONFIG_SCHEMA.modelType.defaultValue,
    group: "model",
    options: EPIDEMIC_MODEL_TYPES.map((value) => ({value, label: MODEL_TYPE_LABELS[value]})),
    label: LABELS.modelType,
  },
  incubationDuration: range("incubationDuration", "model"),
  immunityDuration: range("immunityDuration", "model"),
  mortalityProbability: range("mortalityProbability", "model"),
  population: range("population", "general"),
  speed: range("speed", "general"),
  infectionRadius: range("infectionRadius", "general"),
  infectionProbability: range("infectionProbability", "general"),
  recoveryDuration: range("recoveryDuration", "general"),
  simulationDuration: range("simulationDuration", "general"),
  quarantineEnabled: toggle("quarantineEnabled", "quarantine"),
  quarantineProbability: range("quarantineProbability", "quarantine"),
  quarantineDuration: range("quarantineDuration", "quarantine"),
  hotspotsEnabled: toggle("hotspotsEnabled", "hotspots"),
  hotspotVisitProbability: range("hotspotVisitProbability", "hotspots"),
  hotspotStayDuration: range("hotspotStayDuration", "hotspots"),
  hotspotMaxAgents: range("hotspotMaxAgents", "hotspots"),
  hotspotSize: range("hotspotSize", "hotspots"),
  communitiesEnabled: toggle("communitiesEnabled", "communities"),
  communityLeaveProbability: range("communityLeaveProbability", "communities"),
  allowModelTypeControl: allow("modelType"),
  allowIncubationDurationControl: allow("incubationDuration"),
  allowImmunityDurationControl: allow("immunityDuration"),
  allowMortalityProbabilityControl: allow("mortalityProbability"),
  allowPopulationControl: allow("population"),
  allowSpeedControl: allow("speed"),
  allowInfectionRadiusControl: allow("infectionRadius"),
  allowInfectionProbabilityControl: allow("infectionProbability"),
  allowRecoveryDurationControl: allow("recoveryDuration"),
  allowSimulationDurationControl: allow("simulationDuration"),
  allowQuarantineEnabledControl: allow("quarantineEnabled"),
  allowHotspotsEnabledControl: allow("hotspotsEnabled"),
  allowCommunitiesEnabledControl: allow("communitiesEnabled"),
  allowQuarantineProbabilityControl: allow("quarantineProbability"),
  allowQuarantineDurationControl: allow("quarantineDuration"),
  allowHotspotVisitProbabilityControl: allow("hotspotVisitProbability"),
  allowHotspotStayDurationControl: allow("hotspotStayDuration"),
  allowHotspotMaxAgentsControl: allow("hotspotMaxAgents"),
  allowHotspotSizeControl: allow("hotspotSize"),
  allowCommunityLeaveProbabilityControl: allow("communityLeaveProbability"),
} as const
