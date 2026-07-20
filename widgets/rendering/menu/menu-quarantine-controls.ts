import {html} from "lit"
import type {TemplateResult} from "lit"
import {msg} from "@lit/localize"
import {formatFrameCountAsDays} from "./format-days"
import type {RenderMenuOptions} from "./menu-types"

export function renderQuarantineControls(options: RenderMenuOptions): TemplateResult {
  return html`
    ${
      options.allowQuarantineProbabilityControl
        ? html`
            <label class="side-menu__control">
              <span class="side-menu__control-head">
                <span>${msg("Quarantine probability")}</span>
                <span class="side-menu__control-value">${Math.round(options.quarantineProbability * 100)}%</span>
              </span>
              <sl-range min="0.01" max="1" step="0.01" .value=${String(options.quarantineProbability)} ?disabled=${!options.quarantineEnabled} @sl-input=${options.onQuarantineProbabilityInput}></sl-range>
            </label>
          `
        : null
    }
    ${
      options.allowQuarantineDurationControl
        ? html`
            <label class="side-menu__control">
              <span class="side-menu__control-head">
                <span>${msg("Quarantine duration")}</span>
                <span class="side-menu__control-value">${formatFrameCountAsDays(options.quarantineDuration)}</span>
              </span>
              <sl-range min="30" max="2400" step="30" .value=${String(options.quarantineDuration)} ?disabled=${!options.quarantineEnabled} @sl-input=${options.onQuarantineDurationInput}></sl-range>
            </label>
          `
        : null
    }
  `
}
