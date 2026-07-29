import {html} from "lit"
import type {TemplateResult} from "lit"
import {msg} from "@lit/localize"
import {MENU_RANGE_LIMITS} from "../../config/widget-schema"
import {formatFrameCountAsDays} from "../../simulation/time"
import type {RenderMenuOptions} from "./menu-types"

const R = MENU_RANGE_LIMITS

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
              <sl-range min=${String(R.quarantineProbability.min)} max=${String(R.quarantineProbability.max)} step=${String(R.quarantineProbability.step)} .value=${String(options.quarantineProbability)} ?disabled=${!options.quarantineEnabled} @sl-input=${options.onQuarantineProbabilityInput}></sl-range>
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
              <sl-range min=${String(R.quarantineDuration.min)} max=${String(R.quarantineDuration.max)} step=${String(R.quarantineDuration.step)} .value=${String(options.quarantineDuration)} ?disabled=${!options.quarantineEnabled} @sl-input=${options.onQuarantineDurationInput}></sl-range>
            </label>
          `
        : null
    }
  `
}
