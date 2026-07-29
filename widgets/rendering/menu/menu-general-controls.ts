import {html} from "lit"
import type {TemplateResult} from "lit"
import {msg} from "@lit/localize"
import {MENU_RANGE_LIMITS} from "../../config/widget-schema"
import {formatFrameCountAsDays} from "../../simulation/time"
import type {RenderMenuOptions} from "./menu-types"

const R = MENU_RANGE_LIMITS

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
              <sl-range min=${String(R.population.min)} max=${String(R.population.max)} step=${String(R.population.step)} .value=${String(options.population)} @sl-input=${options.onPopulationInput}></sl-range>
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
              <sl-range min=${String(R.speed.min)} max=${String(R.speed.max)} step=${String(R.speed.step)} .value=${String(options.speed)} @sl-input=${options.onSpeedInput}></sl-range>
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
              <sl-range min=${String(R.infectionRadius.min)} max=${String(R.infectionRadius.max)} step=${String(R.infectionRadius.step)} .value=${String(options.infectionRadius)} @sl-input=${options.onInfectionRadiusInput}></sl-range>
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
              <sl-range min=${String(R.infectionProbability.min)} max=${String(R.infectionProbability.max)} step=${String(R.infectionProbability.step)} .value=${String(options.infectionProbability)} @sl-input=${options.onInfectionProbabilityInput}></sl-range>
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
              <sl-range min=${String(R.recoveryDuration.min)} max=${String(R.recoveryDuration.max)} step=${String(R.recoveryDuration.step)} .value=${String(options.recoveryDuration)} @sl-input=${options.onRecoveryDurationInput}></sl-range>
            </label>
          `
        : null
    }
  `
}
