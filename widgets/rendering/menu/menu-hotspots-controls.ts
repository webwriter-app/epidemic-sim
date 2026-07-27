import {html} from "lit"
import type {TemplateResult} from "lit"
import {msg} from "@lit/localize"
import {MENU_RANGE_LIMITS} from "../../config/widget-schema"
import {formatFrameCountAsDays} from "./format-days"
import type {RenderMenuOptions} from "./menu-types"

const R = MENU_RANGE_LIMITS

export function renderHotspotsControls(options: RenderMenuOptions): TemplateResult {
  return html`
    ${
      options.allowHotspotVisitProbabilityControl
        ? html`
            <label class="side-menu__control">
              <span class="side-menu__control-head">
                <span>${msg("Hotspot visit probability")}</span>
                <span class="side-menu__control-value">${Math.round(options.hotspotVisitProbability * 100)}%</span>
              </span>
              <sl-range min=${String(R.hotspotVisitProbability.min)} max=${String(R.hotspotVisitProbability.max)} step=${String(R.hotspotVisitProbability.step)} .value=${String(options.hotspotVisitProbability)} ?disabled=${!options.hotspotsEnabled} @sl-input=${options.onHotspotVisitProbabilityInput}></sl-range>
            </label>
          `
        : null
    }
    ${
      options.allowHotspotStayDurationControl
        ? html`
            <label class="side-menu__control">
              <span class="side-menu__control-head">
                <span>${msg("Hotspot stay duration")}</span>
                <span class="side-menu__control-value">${formatFrameCountAsDays(options.hotspotStayDuration)}</span>
              </span>
              <sl-range min=${String(R.hotspotStayDuration.min)} max=${String(R.hotspotStayDuration.max)} step=${String(R.hotspotStayDuration.step)} .value=${String(options.hotspotStayDuration)} ?disabled=${!options.hotspotsEnabled} @sl-input=${options.onHotspotStayDurationInput}></sl-range>
            </label>
          `
        : null
    }
    ${
      options.allowHotspotMaxAgentsControl
        ? html`
            <label class="side-menu__control">
              <span class="side-menu__control-head">
                <span>${msg("Hotspot max agents")}</span>
                <span class="side-menu__control-value">${options.hotspotMaxAgents}</span>
              </span>
              <sl-range min=${String(R.hotspotMaxAgents.min)} max=${String(R.hotspotMaxAgents.max)} step=${String(R.hotspotMaxAgents.step)} .value=${String(options.hotspotMaxAgents)} ?disabled=${!options.hotspotsEnabled} @sl-input=${options.onHotspotMaxAgentsInput}></sl-range>
            </label>
          `
        : null
    }
    ${
      options.allowHotspotSizeControl
        ? html`
            <label class="side-menu__control">
              <span class="side-menu__control-head">
                <span>${msg("Hotspot size")}</span>
                <span class="side-menu__control-value">${options.hotspotSize}</span>
              </span>
              <sl-range min=${String(R.hotspotSize.min)} max=${String(R.hotspotSize.max)} step=${String(R.hotspotSize.step)} .value=${String(options.hotspotSize)} ?disabled=${!options.hotspotsEnabled} @sl-input=${options.onHotspotSizeInput}></sl-range>
            </label>
          `
        : null
    }
    ${
      options.allowHotspotsEnabledControl ||
      options.allowHotspotVisitProbabilityControl ||
      options.allowHotspotStayDurationControl ||
      options.allowHotspotMaxAgentsControl ||
      options.allowHotspotSizeControl
        ? html`
            <div class="side-menu__control">
              <span class="side-menu__control-head">
                <span>${msg("Placed hotspots")}</span>
                <span class="side-menu__control-value">${options.placedHotspotCount}</span>
              </span>
            </div>
          `
        : null
    }
  `
}
