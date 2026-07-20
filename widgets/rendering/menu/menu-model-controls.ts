import {html} from "lit"
import type {TemplateResult} from "lit"
import {msg} from "@lit/localize"
import {formatFrameCountAsDays} from "./format-days"
import type {RenderMenuOptions} from "./menu-types"

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
              <sl-range min="30" max="1200" step="30" .value=${String(options.incubationDuration)} @sl-input=${options.onIncubationDurationInput}></sl-range>
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
              <sl-range min="120" max="4800" step="60" .value=${String(options.immunityDuration)} @sl-input=${options.onImmunityDurationInput}></sl-range>
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
              <sl-range min="0.001" max="0.5" step="0.001" .value=${String(options.mortalityProbability)} @sl-input=${options.onMortalityProbabilityInput}></sl-range>
            </label>
          `
        : null
    }
  `
}
