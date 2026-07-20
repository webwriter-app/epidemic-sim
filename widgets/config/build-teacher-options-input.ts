import {msg} from "@lit/localize"
import type {AllowControlKey} from "./widget-schema"
import type {RenderTeacherOptionsInput} from "../rendering/teacher-options-renderer"
import type {EpidemicModelType} from "../simulation/epidemic-models"

export type TeacherOptionsContext = {
  modelType: EpidemicModelType
  modelTypeOptions: Array<{value: EpidemicModelType; label: string}>
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
  allowQuarantineProbabilityControl: boolean
  allowQuarantineDurationControl: boolean
  allowHotspotsEnabledControl: boolean
  allowHotspotVisitProbabilityControl: boolean
  allowHotspotStayDurationControl: boolean
  allowHotspotMaxAgentsControl: boolean
  allowHotspotSizeControl: boolean
  allowCommunitiesEnabledControl: boolean
  allowCommunityLeaveProbabilityControl: boolean
  formatDays: (frameCount: number) => string
  onModelTypeChange: (event: Event) => void
  onIncubationDurationInput: (event: Event) => void
  onImmunityDurationInput: (event: Event) => void
  onMortalityProbabilityInput: (event: Event) => void
  onPopulationInput: (event: Event) => void
  onSpeedInput: (event: Event) => void
  onInfectionRadiusInput: (event: Event) => void
  onInfectionProbabilityInput: (event: Event) => void
  onRecoveryDurationInput: (event: Event) => void
  onQuarantineEnabled: (event: Event) => void
  onQuarantineProbabilityInput: (event: Event) => void
  onQuarantineDurationInput: (event: Event) => void
  onHotspotsEnabled: (event: Event) => void
  onHotspotVisitProbabilityInput: (event: Event) => void
  onHotspotStayDurationInput: (event: Event) => void
  onHotspotMaxAgentsInput: (event: Event) => void
  onHotspotSizeInput: (event: Event) => void
  onCommunitiesEnabled: (event: Event) => void
  onCommunityLeaveProbabilityInput: (event: Event) => void
  onAllowChange: (key: AllowControlKey, event: Event) => void
}

function getModelSpecificRows(ctx: TeacherOptionsContext): RenderTeacherOptionsInput["sections"][number]["rows"] {
  if (ctx.modelType === "seir") {
    return [{
      kind: "range",
      label: msg("Incubation duration"),
      value: ctx.incubationDuration,
      min: 30, max: 1200, step: 30,
      allow: ctx.allowIncubationDurationControl,
      formatValue: ctx.formatDays,
      onInput: ctx.onIncubationDurationInput,
      onAllowChange: (e) => ctx.onAllowChange("allowIncubationDurationControl", e),
    }]
  }
  if (ctx.modelType === "sirs") {
    return [{
      kind: "range",
      label: msg("Immunity duration"),
      value: ctx.immunityDuration,
      min: 120, max: 4800, step: 60,
      allow: ctx.allowImmunityDurationControl,
      formatValue: ctx.formatDays,
      onInput: ctx.onImmunityDurationInput,
      onAllowChange: (e) => ctx.onAllowChange("allowImmunityDurationControl", e),
    }]
  }
  if (ctx.modelType === "sird") {
    return [{
      kind: "range",
      label: msg("Mortality probability"),
      value: ctx.mortalityProbability,
      min: 0.001, max: 0.5, step: 0.001,
      allow: ctx.allowMortalityProbabilityControl,
      formatValue: (v) => `${Math.round(v * 1000) / 10}%`,
      onInput: ctx.onMortalityProbabilityInput,
      onAllowChange: (e) => ctx.onAllowChange("allowMortalityProbabilityControl", e),
    }]
  }
  if (ctx.modelType === "seird") {
    return [
      {
        kind: "range",
        label: msg("Incubation duration"),
        value: ctx.incubationDuration,
        min: 30, max: 1200, step: 30,
        allow: ctx.allowIncubationDurationControl,
        formatValue: ctx.formatDays,
        onInput: ctx.onIncubationDurationInput,
        onAllowChange: (e) => ctx.onAllowChange("allowIncubationDurationControl", e),
      },
      {
        kind: "range",
        label: msg("Mortality probability"),
        value: ctx.mortalityProbability,
        min: 0.001, max: 0.5, step: 0.001,
        allow: ctx.allowMortalityProbabilityControl,
        formatValue: (v) => `${Math.round(v * 1000) / 10}%`,
        onInput: ctx.onMortalityProbabilityInput,
        onAllowChange: (e) => ctx.onAllowChange("allowMortalityProbabilityControl", e),
      },
    ]
  }
  return []
}

export function buildTeacherOptionsInput(ctx: TeacherOptionsContext): RenderTeacherOptionsInput {
  return {
    sections: [
      {
        title: msg("Model"),
        open: true,
        rows: [
          {
            kind: "select",
            label: msg("Model type"),
            value: ctx.modelType,
            options: ctx.modelTypeOptions,
            allow: ctx.allowModelTypeControl,
            onChange: ctx.onModelTypeChange,
            onAllowChange: (e) => ctx.onAllowChange("allowModelTypeControl", e),
          },
          ...getModelSpecificRows(ctx),
        ],
      },
      {
        title: msg("General"),
        open: true,
        rows: [
          {kind: "range", label: msg("Population"), value: ctx.population, min: 50, max: 800, step: 10, allow: ctx.allowPopulationControl, onInput: ctx.onPopulationInput, onAllowChange: (e) => ctx.onAllowChange("allowPopulationControl", e)},
          {kind: "range", label: msg("Speed"), value: ctx.speed, min: 0.2, max: 4, step: 0.1, allow: ctx.allowSpeedControl, formatValue: (v) => v.toFixed(1), onInput: ctx.onSpeedInput, onAllowChange: (e) => ctx.onAllowChange("allowSpeedControl", e)},
          {kind: "range", label: msg("Infection radius"), value: ctx.infectionRadius, min: 4, max: 40, step: 1, allow: ctx.allowInfectionRadiusControl, onInput: ctx.onInfectionRadiusInput, onAllowChange: (e) => ctx.onAllowChange("allowInfectionRadiusControl", e)},
          {kind: "range", label: msg("Infection probability"), value: ctx.infectionProbability, min: 0.01, max: 1, step: 0.01, allow: ctx.allowInfectionProbabilityControl, formatValue: (v) => `${Math.round(v * 100)}%`, onInput: ctx.onInfectionProbabilityInput, onAllowChange: (e) => ctx.onAllowChange("allowInfectionProbabilityControl", e)},
          {kind: "range", label: msg("Recovery duration"), value: ctx.recoveryDuration, min: 60, max: 2400, step: 30, allow: ctx.allowRecoveryDurationControl, formatValue: ctx.formatDays, onInput: ctx.onRecoveryDurationInput, onAllowChange: (e) => ctx.onAllowChange("allowRecoveryDurationControl", e)},
        ],
      },
      {
        title: msg("Quarantine"),
        enabled: ctx.quarantineEnabled,
        onEnabledChange: ctx.onQuarantineEnabled,
        rows: [
          {kind: "show", label: msg("Show"), value: ctx.allowQuarantineEnabledControl, onValueChange: (e) => ctx.onAllowChange("allowQuarantineEnabledControl", e)},
          {kind: "range", label: msg("Quarantine probability"), value: ctx.quarantineProbability, min: 0.01, max: 1, step: 0.01, allow: ctx.allowQuarantineProbabilityControl, formatValue: (v) => `${Math.round(v * 100)}%`, onInput: ctx.onQuarantineProbabilityInput, onAllowChange: (e) => ctx.onAllowChange("allowQuarantineProbabilityControl", e)},
          {kind: "range", label: msg("Quarantine duration"), value: ctx.quarantineDuration, min: 30, max: 2400, step: 30, allow: ctx.allowQuarantineDurationControl, formatValue: ctx.formatDays, onInput: ctx.onQuarantineDurationInput, onAllowChange: (e) => ctx.onAllowChange("allowQuarantineDurationControl", e)},
        ],
      },
      {
        title: msg("Hotspots"),
        enabled: ctx.hotspotsEnabled,
        onEnabledChange: ctx.onHotspotsEnabled,
        rows: [
          {kind: "show", label: msg("Show"), value: ctx.allowHotspotsEnabledControl, onValueChange: (e) => ctx.onAllowChange("allowHotspotsEnabledControl", e)},
          {kind: "range", label: msg("Hotspot visit probability"), value: ctx.hotspotVisitProbability, min: 0.001, max: 0.04, step: 0.001, allow: ctx.allowHotspotVisitProbabilityControl, formatValue: (v) => `${Math.round(v * 1000) / 10}%`, onInput: ctx.onHotspotVisitProbabilityInput, onAllowChange: (e) => ctx.onAllowChange("allowHotspotVisitProbabilityControl", e)},
          {kind: "range", label: msg("Hotspot stay duration"), value: ctx.hotspotStayDuration, min: 30, max: 1800, step: 30, allow: ctx.allowHotspotStayDurationControl, formatValue: ctx.formatDays, onInput: ctx.onHotspotStayDurationInput, onAllowChange: (e) => ctx.onAllowChange("allowHotspotStayDurationControl", e)},
          {kind: "range", label: msg("Hotspot max agents"), value: ctx.hotspotMaxAgents, min: 1, max: 120, step: 1, allow: ctx.allowHotspotMaxAgentsControl, onInput: ctx.onHotspotMaxAgentsInput, onAllowChange: (e) => ctx.onAllowChange("allowHotspotMaxAgentsControl", e)},
          {kind: "range", label: msg("Hotspot size"), value: ctx.hotspotSize, min: 24, max: 110, step: 2, allow: ctx.allowHotspotSizeControl, onInput: ctx.onHotspotSizeInput, onAllowChange: (e) => ctx.onAllowChange("allowHotspotSizeControl", e)},
        ],
      },
      {
        title: msg("Communities"),
        enabled: ctx.communitiesEnabled,
        onEnabledChange: ctx.onCommunitiesEnabled,
        rows: [
          {kind: "show", label: msg("Show"), value: ctx.allowCommunitiesEnabledControl, onValueChange: (e) => ctx.onAllowChange("allowCommunitiesEnabledControl", e)},
          {kind: "range", label: msg("Community leave probability"), value: ctx.communityLeaveProbability, min: 0.0001, max: 0.01, step: 0.0001, allow: ctx.allowCommunityLeaveProbabilityControl, formatValue: (v) => `${Math.round(v * 1000) / 10}%`, onInput: ctx.onCommunityLeaveProbabilityInput, onAllowChange: (e) => ctx.onAllowChange("allowCommunityLeaveProbabilityControl", e)},
        ],
      },
    ],
  }
}
