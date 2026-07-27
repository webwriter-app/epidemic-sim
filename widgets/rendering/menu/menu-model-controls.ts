import {html} from "lit"
import type {TemplateResult} from "lit"
import {msg} from "@lit/localize"
import {MENU_RANGE_LIMITS} from "../../config/widget-schema"
import {formatFrameCountAsDays} from "./format-days"
import type {RenderMenuOptions} from "./menu-types"

const R = MENU_RANGE_LIMITS

export function renderModelControls(options: RenderMenuOptions): TemplateResult {
  return html`
    ${
      options.allowModelTypeControl
        ? html`
            <label class="side-menu__control">
              <span class="side-menu__control-head">
                <span>${msg("Model type")}</span>
              </span>
              <sl-select .value=${options.modelType} @sl-change=${options.onModelTypeChange}>
                ${options.modelTypeOptions.map(
                  (option) => html`<sl-option value=${option.value}>${option.label}</sl-option>`,
                )}
              </sl-select>
            </label>
          `
        : null
    }
    ${
      options.allowIncubationDurationControl &&
      (options.modelType === "seir" || options.modelType === "seird")
        ? html`
            <label class="side-menu__control">
              <span class="side-menu__control-head">
                <span>${msg("Incubation duration")}</span>
                <span class="side-menu__control-value">${formatFrameCountAsDays(options.incubationDuration)}</span>
              </span>
              <sl-range min=${String(R.incubationDuration.min)} max=${String(R.incubationDuration.max)} step=${String(R.incubationDuration.step)} .value=${String(options.incubationDuration)} @sl-input=${options.onIncubationDurationInput}></sl-range>
            </label>
          `
        : null
    }
    ${
      options.allowImmunityDurationControl && options.modelType === "sirs"
        ? html`
            <label class="side-menu__control">
              <span class="side-menu__control-head">
                <span>${msg("Immunity duration")}</span>
                <span class="side-menu__control-value">${formatFrameCountAsDays(options.immunityDuration)}</span>
              </span>
              <sl-range min=${String(R.immunityDuration.min)} max=${String(R.immunityDuration.max)} step=${String(R.immunityDuration.step)} .value=${String(options.immunityDuration)} @sl-input=${options.onImmunityDurationInput}></sl-range>
            </label>
          `
        : null
    }
    ${
      options.allowMortalityProbabilityControl &&
      (options.modelType === "sird" || options.modelType === "seird")
        ? html`
            <label class="side-menu__control">
              <span class="side-menu__control-head">
                <span>${msg("Mortality probability")}</span>
                <span class="side-menu__control-value">${Math.round(options.mortalityProbability * 100)}%</span>
              </span>
              <sl-range min=${String(R.mortalityProbability.min)} max=${String(R.mortalityProbability.max)} step=${String(R.mortalityProbability.step)} .value=${String(options.mortalityProbability)} @sl-input=${options.onMortalityProbabilityInput}></sl-range>
            </label>
          `
        : null
    }
  `
}
