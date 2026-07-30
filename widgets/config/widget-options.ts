import type {OptionDeclaration} from "@webwriter/lit"
import {CONFIG_SCHEMA} from "./widget-schema"

type OptionMap = Record<string, OptionDeclaration>

const general: Record<string, string> = {en: "General", de: "Allgemein"}
const model: Record<string, string> = {en: "Model", de: "Modell"}
const specific: Record<string, string> = {en: "Specific settings", de: "Spezifische Einstellungen"}

function rangeOption(
  key: keyof typeof CONFIG_SCHEMA,
  category: Record<string, string>,
  label: Record<string, string>,
): OptionDeclaration {
  const schema = CONFIG_SCHEMA[key]
  if (schema.kind !== "range") {
    throw new Error(`Expected range schema for ${key}`)
  }
  return {type: "number", min: schema.min, max: schema.max, step: schema.step, category, label}
}

function booleanOption(category: Record<string, string>, label: Record<string, string>): OptionDeclaration {
  return {type: "boolean", category, label}
}

export const WIDGET_OPTIONS: OptionMap = {
  modelType: {
    type: "select",
    category: model,
    label: {en: "Model type", de: "Modelltyp"},
    options: [
      {value: "sir", label: {en: "SIR", de: "SIR"}},
      {value: "sirs", label: {en: "SIRS", de: "SIRS"}},
      {value: "seir", label: {en: "SEIR", de: "SEIR"}},
      {value: "sird", label: {en: "SIRD", de: "SIRD"}},
      {value: "seird", label: {en: "SEIRD", de: "SEIRD"}},
    ],
  },
  allowModelTypeControl: booleanOption(model, {
    en: "Students can change: model type",
    de: "Schüler dürfen ändern: Modelltyp",
  }),
  incubationDuration: rangeOption("incubationDuration", model, {
    en: "Incubation duration (days)",
    de: "Inkubationsdauer (Tage)",
  }),
  allowIncubationDurationControl: booleanOption(model, {
    en: "Students can change: incubation duration",
    de: "Schüler dürfen ändern: Inkubationsdauer",
  }),
  immunityDuration: rangeOption("immunityDuration", model, {
    en: "Immunity duration (days)",
    de: "Immunitätsdauer (Tage)",
  }),
  allowImmunityDurationControl: booleanOption(model, {
    en: "Students can change: immunity duration",
    de: "Schüler dürfen ändern: Immunitätsdauer",
  }),
  mortalityProbability: rangeOption("mortalityProbability", model, {
    en: "Mortality probability",
    de: "Sterblichkeitswahrscheinlichkeit",
  }),
  allowMortalityProbabilityControl: booleanOption(model, {
    en: "Students can change: mortality probability",
    de: "Schüler dürfen ändern: Sterblichkeitswahrscheinlichkeit",
  }),
  population: rangeOption("population", general, {en: "Population", de: "Bevölkerung"}),
  allowPopulationControl: booleanOption(general, {
    en: "Students can change: population",
    de: "Schüler dürfen ändern: Bevölkerung",
  }),
  speed: rangeOption("speed", general, {en: "Speed", de: "Geschwindigkeit"}),
  allowSpeedControl: booleanOption(general, {
    en: "Students can change: speed",
    de: "Schüler dürfen ändern: Geschwindigkeit",
  }),
  infectionRadius: rangeOption("infectionRadius", general, {
    en: "Infection radius",
    de: "Infektionsradius",
  }),
  allowInfectionRadiusControl: booleanOption(general, {
    en: "Students can change: infection radius",
    de: "Schüler dürfen ändern: Infektionsradius",
  }),
  infectionProbability: rangeOption("infectionProbability", general, {
    en: "Infection probability",
    de: "Infektionswahrscheinlichkeit",
  }),
  allowInfectionProbabilityControl: booleanOption(general, {
    en: "Students can change: infection probability",
    de: "Schüler dürfen ändern: Infektionswahrscheinlichkeit",
  }),
  recoveryDuration: rangeOption("recoveryDuration", general, {
    en: "Recovery duration (days)",
    de: "Genesungsdauer (Tage)",
  }),
  allowRecoveryDurationControl: booleanOption(general, {
    en: "Students can change: recovery duration",
    de: "Schüler dürfen ändern: Genesungsdauer",
  }),
  quarantineEnabled: booleanOption(specific, {en: "Quarantine enabled", de: "Quarantäne aktiv"}),
  allowQuarantineEnabledControl: booleanOption(specific, {
    en: "Students can change: quarantine enabled",
    de: "Schüler dürfen ändern: Quarantäne aktiv",
  }),
  quarantineProbability: rangeOption("quarantineProbability", specific, {
    en: "Quarantine probability",
    de: "Quarantänewahrscheinlichkeit",
  }),
  allowQuarantineProbabilityControl: booleanOption(specific, {
    en: "Students can change: quarantine probability",
    de: "Schüler dürfen ändern: Quarantänewahrscheinlichkeit",
  }),
  quarantineDuration: rangeOption("quarantineDuration", specific, {
    en: "Quarantine duration (days)",
    de: "Quarantänedauer (Tage)",
  }),
  allowQuarantineDurationControl: booleanOption(specific, {
    en: "Students can change: quarantine duration",
    de: "Schüler dürfen ändern: Quarantänedauer",
  }),
  hotspotsEnabled: booleanOption(specific, {en: "Hotspots enabled", de: "Hotspots aktiv"}),
  allowHotspotsEnabledControl: booleanOption(specific, {
    en: "Students can change: hotspots enabled",
    de: "Schüler dürfen ändern: Hotspots aktiv",
  }),
  hotspotVisitProbability: rangeOption("hotspotVisitProbability", specific, {
    en: "Hotspot visit probability",
    de: "Hotspot-Besuchswahrscheinlichkeit",
  }),
  allowHotspotVisitProbabilityControl: booleanOption(specific, {
    en: "Students can change: hotspot visit probability",
    de: "Schüler dürfen ändern: Hotspot-Besuchswahrscheinlichkeit",
  }),
  hotspotStayDuration: rangeOption("hotspotStayDuration", specific, {
    en: "Hotspot stay duration (days)",
    de: "Hotspot-Aufenthaltsdauer (Tage)",
  }),
  allowHotspotStayDurationControl: booleanOption(specific, {
    en: "Students can change: hotspot stay duration",
    de: "Schüler dürfen ändern: Hotspot-Aufenthaltsdauer",
  }),
  hotspotMaxAgents: rangeOption("hotspotMaxAgents", specific, {
    en: "Hotspot max agents",
    de: "Hotspot max. Agenten",
  }),
  allowHotspotMaxAgentsControl: booleanOption(specific, {
    en: "Students can change: hotspot max agents",
    de: "Schüler dürfen ändern: Hotspot max. Agenten",
  }),
  hotspotSize: rangeOption("hotspotSize", specific, {en: "Hotspot size", de: "Hotspot-Größe"}),
  allowHotspotSizeControl: booleanOption(specific, {
    en: "Students can change: hotspot size",
    de: "Schüler dürfen ändern: Hotspot-Größe",
  }),
  communitiesEnabled: booleanOption(specific, {
    en: "Communities enabled",
    de: "Gemeinschaften aktiv",
  }),
  allowCommunitiesEnabledControl: booleanOption(specific, {
    en: "Students can change: communities enabled",
    de: "Schüler dürfen ändern: Gemeinschaften aktiv",
  }),
  communityLeaveProbability: rangeOption("communityLeaveProbability", specific, {
    en: "Community leave probability",
    de: "Austrittswahrscheinlichkeit aus Gemeinschaft",
  }),
  allowCommunityLeaveProbabilityControl: booleanOption(specific, {
    en: "Students can change: community leave probability",
    de: "Schüler dürfen ändern: Austrittswahrscheinlichkeit",
  }),
}
