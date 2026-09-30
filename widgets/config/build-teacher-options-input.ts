import {msg} from "@lit/localize"
import type {AllowControlKey, ConfigSchemaKey} from "./widget-schema"
import {getRangeLimits} from "./widget-schema"
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
  allowModelTypeControl: boolean
  allowIncubationDurationControl: boolean
  allowImmunityDurationControl: boolean
  allowMortalityProbabilityControl: boolean
  allowPopulationControl: boolean
  allowSpeedControl: boolean
  allowInfectionRadiusControl: boolean
  allowInfectionProbabilityControl: boolean
  allowRecoveryDurationControl: boolean
  allowSimulationDurationControl: boolean
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
  onSimulationDurationInput: (event: Event) => void
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

function rangeRow(
  key: ConfigSchemaKey,
  label: string,
  value: number,
  allow: boolean,
  onInput: (event: Event) => void,
  onAllowChange: (event: Event) => void,
  formatValue?: (value: number) => string,
  description?: string,
) {
  const limits = getRangeLimits(key)
  return {
    kind: "range" as const,
    label,
    value,
    min: limits.min,
    max: limits.max,
    step: limits.step,
    allow,
    formatValue,
    description,
    onInput,
    onAllowChange,
  }
}

function getModelSpecificRows(ctx: TeacherOptionsContext): RenderTeacherOptionsInput["sections"][number]["rows"] {
  if (ctx.modelType === "seir") {
    return [
      rangeRow(
        "incubationDuration",
        msg("Incubation duration"),
        ctx.incubationDuration,
        ctx.allowIncubationDurationControl,
        ctx.onIncubationDurationInput,
        (e) => ctx.onAllowChange("allowIncubationDurationControl", e),
        ctx.formatDays,
      ),
    ]
  }
  if (ctx.modelType === "sirs") {
    return [
      rangeRow(
        "immunityDuration",
        msg("Immunity duration"),
        ctx.immunityDuration,
        ctx.allowImmunityDurationControl,
        ctx.onImmunityDurationInput,
        (e) => ctx.onAllowChange("allowImmunityDurationControl", e),
        ctx.formatDays,
      ),
    ]
  }
  if (ctx.modelType === "sird") {
    return [
      rangeRow(
        "mortalityProbability",
        msg("Mortality probability"),
        ctx.mortalityProbability,
        ctx.allowMortalityProbabilityControl,
        ctx.onMortalityProbabilityInput,
        (e) => ctx.onAllowChange("allowMortalityProbabilityControl", e),
        (v) => `${Math.round(v * 1000) / 10}%`,
      ),
    ]
  }
  if (ctx.modelType === "seird") {
    return [
      rangeRow(
        "incubationDuration",
        msg("Incubation duration"),
        ctx.incubationDuration,
        ctx.allowIncubationDurationControl,
        ctx.onIncubationDurationInput,
        (e) => ctx.onAllowChange("allowIncubationDurationControl", e),
        ctx.formatDays,
      ),
      rangeRow(
        "mortalityProbability",
        msg("Mortality probability"),
        ctx.mortalityProbability,
        ctx.allowMortalityProbabilityControl,
        ctx.onMortalityProbabilityInput,
        (e) => ctx.onAllowChange("allowMortalityProbabilityControl", e),
        (v) => `${Math.round(v * 1000) / 10}%`,
      ),
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
          rangeRow("population", msg("Population"), ctx.population, ctx.allowPopulationControl, ctx.onPopulationInput, (e) => ctx.onAllowChange("allowPopulationControl", e)),
          rangeRow("speed", msg("Speed"), ctx.speed, ctx.allowSpeedControl, ctx.onSpeedInput, (e) => ctx.onAllowChange("allowSpeedControl", e), (v) => v.toFixed(1)),
          rangeRow("infectionRadius", msg("Infection radius"), ctx.infectionRadius, ctx.allowInfectionRadiusControl, ctx.onInfectionRadiusInput, (e) => ctx.onAllowChange("allowInfectionRadiusControl", e)),
          rangeRow("infectionProbability", msg("Infection probability"), ctx.infectionProbability, ctx.allowInfectionProbabilityControl, ctx.onInfectionProbabilityInput, (e) => ctx.onAllowChange("allowInfectionProbabilityControl", e), (v) => `${Math.round(v * 100)}%`),
          rangeRow("recoveryDuration", msg("Recovery duration"), ctx.recoveryDuration, ctx.allowRecoveryDurationControl, ctx.onRecoveryDurationInput, (e) => ctx.onAllowChange("allowRecoveryDurationControl", e), ctx.formatDays),
          rangeRow(
            "simulationDuration",
            msg("Simulation duration"),
            ctx.simulationDuration,
            ctx.allowSimulationDurationControl,
            ctx.onSimulationDurationInput,
            (e) => ctx.onAllowChange("allowSimulationDurationControl", e),
            ctx.formatDays,
            msg("The simulation may end earlier when the epidemic is over"),
          ),
        ],
      },
      {
        title: msg("Quarantine"),
        enabled: ctx.quarantineEnabled,
        onEnabledChange: ctx.onQuarantineEnabled,
        rows: [
          {kind: "show", label: msg("Show"), value: ctx.allowQuarantineEnabledControl, onValueChange: (e) => ctx.onAllowChange("allowQuarantineEnabledControl", e)},
          rangeRow("quarantineProbability", msg("Quarantine probability"), ctx.quarantineProbability, ctx.allowQuarantineProbabilityControl, ctx.onQuarantineProbabilityInput, (e) => ctx.onAllowChange("allowQuarantineProbabilityControl", e), (v) => `${Math.round(v * 100)}%`),
          rangeRow("quarantineDuration", msg("Quarantine duration"), ctx.quarantineDuration, ctx.allowQuarantineDurationControl, ctx.onQuarantineDurationInput, (e) => ctx.onAllowChange("allowQuarantineDurationControl", e), ctx.formatDays),
        ],
      },
      {
        title: msg("Hotspots"),
        enabled: ctx.hotspotsEnabled,
        onEnabledChange: ctx.onHotspotsEnabled,
        rows: [
          {kind: "show", label: msg("Show"), value: ctx.allowHotspotsEnabledControl, onValueChange: (e) => ctx.onAllowChange("allowHotspotsEnabledControl", e)},
          rangeRow("hotspotVisitProbability", msg("Hotspot visit probability"), ctx.hotspotVisitProbability, ctx.allowHotspotVisitProbabilityControl, ctx.onHotspotVisitProbabilityInput, (e) => ctx.onAllowChange("allowHotspotVisitProbabilityControl", e), (v) => `${Math.round(v * 1000) / 10}%`),
          rangeRow("hotspotStayDuration", msg("Hotspot stay duration"), ctx.hotspotStayDuration, ctx.allowHotspotStayDurationControl, ctx.onHotspotStayDurationInput, (e) => ctx.onAllowChange("allowHotspotStayDurationControl", e), ctx.formatDays),
          rangeRow("hotspotMaxAgents", msg("Hotspot max agents"), ctx.hotspotMaxAgents, ctx.allowHotspotMaxAgentsControl, ctx.onHotspotMaxAgentsInput, (e) => ctx.onAllowChange("allowHotspotMaxAgentsControl", e)),
          rangeRow("hotspotSize", msg("Hotspot size"), ctx.hotspotSize, ctx.allowHotspotSizeControl, ctx.onHotspotSizeInput, (e) => ctx.onAllowChange("allowHotspotSizeControl", e)),
        ],
      },
      {
        title: msg("Communities"),
        enabled: ctx.communitiesEnabled,
        onEnabledChange: ctx.onCommunitiesEnabled,
        rows: [
          {kind: "show", label: msg("Show"), value: ctx.allowCommunitiesEnabledControl, onValueChange: (e) => ctx.onAllowChange("allowCommunitiesEnabledControl", e)},
          rangeRow("communityLeaveProbability", msg("Community leave probability"), ctx.communityLeaveProbability, ctx.allowCommunityLeaveProbabilityControl, ctx.onCommunityLeaveProbabilityInput, (e) => ctx.onAllowChange("allowCommunityLeaveProbabilityControl", e), (v) => `${Math.round(v * 1000) / 10}%`),
        ],
      },
    ],
  }
}
