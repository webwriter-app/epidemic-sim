import {html} from "lit"
import type {TemplateResult} from "lit"
import {msg} from "@lit/localize"
import {formatFrameCountAsDays} from "./format-days"
import type {RenderMenuOptions} from "./menu-types"

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
              <sl-range min="0.001" max="0.04" step="0.001" .value=${String(options.hotspotVisitProbability)} ?disabled=${!options.hotspotsEnabled} @sl-input=${options.onHotspotVisitProbabilityInput}></sl-range>
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
              <sl-range min="30" max="1800" step="30" .value=${String(options.hotspotStayDuration)} ?disabled=${!options.hotspotsEnabled} @sl-input=${options.onHotspotStayDurationInput}></sl-range>
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
              <sl-range min="1" max="120" step="1" .value=${String(options.hotspotMaxAgents)} ?disabled=${!options.hotspotsEnabled} @sl-input=${options.onHotspotMaxAgentsInput}></sl-range>
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
              <sl-range min="24" max="110" step="2" .value=${String(options.hotspotSize)} ?disabled=${!options.hotspotsEnabled} @sl-input=${options.onHotspotSizeInput}></sl-range>
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
