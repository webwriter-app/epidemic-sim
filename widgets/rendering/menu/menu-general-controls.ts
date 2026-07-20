import {html} from "lit"
import type {TemplateResult} from "lit"
import {msg} from "@lit/localize"
import {formatFrameCountAsDays} from "./format-days"
import type {RenderMenuOptions} from "./menu-types"

export function renderGeneralControls(options: RenderMenuOptions): TemplateResult {
  return html`
    ${
      options.allowPopulationControl
        ? html`
            <label class="side-menu__control">
              <span class="side-menu__control-head">
                <span>${msg("Population")}</span>
                <span class="side-menu__control-value">${options.population}</span>
              </span>
              <sl-range min="50" max="800" step="10" .value=${String(options.population)} @sl-input=${options.onPopulationInput}></sl-range>
            </label>
          `
        : null
    }
    ${
      options.allowSpeedControl
        ? html`
            <label class="side-menu__control">
              <span class="side-menu__control-head">
                <span>${msg("Speed")}</span>
                <span class="side-menu__control-value">${options.speed.toFixed(1)}</span>
              </span>
              <sl-range min="0.2" max="4" step="0.1" .value=${String(options.speed)} @sl-input=${options.onSpeedInput}></sl-range>
            </label>
          `
        : null
    }
    ${
      options.allowInfectionRadiusControl
        ? html`
            <label class="side-menu__control">
              <span class="side-menu__control-head">
                <span>${msg("Infection radius")}</span>
                <span class="side-menu__control-value">${options.infectionRadius}</span>
              </span>
              <sl-range min="4" max="40" step="1" .value=${String(options.infectionRadius)} @sl-input=${options.onInfectionRadiusInput}></sl-range>
            </label>
          `
        : null
    }
    ${
      options.allowInfectionProbabilityControl
        ? html`
            <label class="side-menu__control">
              <span class="side-menu__control-head">
                <span>${msg("Infection probability")}</span>
                <span class="side-menu__control-value">${Math.round(options.infectionProbability * 100)}%</span>
              </span>
              <sl-range min="0.01" max="1" step="0.01" .value=${String(options.infectionProbability)} @sl-input=${options.onInfectionProbabilityInput}></sl-range>
            </label>
          `
        : null
    }
    ${
      options.allowRecoveryDurationControl
        ? html`
            <label class="side-menu__control">
              <span class="side-menu__control-head">
                <span>${msg("Recovery duration")}</span>
                <span class="side-menu__control-value">${formatFrameCountAsDays(options.recoveryDuration)}</span>
              </span>
              <sl-range min="60" max="2400" step="30" .value=${String(options.recoveryDuration)} @sl-input=${options.onRecoveryDurationInput}></sl-range>
            </label>
          `
        : null
    }
  `
}
