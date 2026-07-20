import type {MenuAllowFlags} from "../rendering/menu-renderer"
import type {WidgetSchema} from "./widget-schema"

/** Snapshot of widget property values used to build menus and simulation config. */
export type WidgetConfigValues = WidgetSchema

export function buildMenuAllowFlags(values: WidgetConfigValues): MenuAllowFlags {
  return {
    allowModelTypeControl: values.allowModelTypeControl,
    allowIncubationDurationControl: values.allowIncubationDurationControl,
    allowImmunityDurationControl: values.allowImmunityDurationControl,
    allowMortalityProbabilityControl: values.allowMortalityProbabilityControl,
    allowPopulationControl: values.allowPopulationControl,
    allowSpeedControl: values.allowSpeedControl,
    allowInfectionRadiusControl: values.allowInfectionRadiusControl,
    allowInfectionProbabilityControl: values.allowInfectionProbabilityControl,
    allowRecoveryDurationControl: values.allowRecoveryDurationControl,
    allowQuarantineEnabledControl: values.allowQuarantineEnabledControl,
    allowHotspotsEnabledControl: values.allowHotspotsEnabledControl,
    allowCommunitiesEnabledControl: values.allowCommunitiesEnabledControl,
    allowQuarantineProbabilityControl: values.allowQuarantineProbabilityControl,
    allowQuarantineDurationControl: values.allowQuarantineDurationControl,
    allowHotspotVisitProbabilityControl: values.allowHotspotVisitProbabilityControl,
    allowHotspotStayDurationControl: values.allowHotspotStayDurationControl,
    allowHotspotMaxAgentsControl: values.allowHotspotMaxAgentsControl,
    allowHotspotSizeControl: values.allowHotspotSizeControl,
    allowCommunityLeaveProbabilityControl: values.allowCommunityLeaveProbabilityControl,
  }
}
