import {html} from "lit"
import type {TemplateResult} from "lit"
import {msg} from "@lit/localize"
import type {RenderMenuOptions} from "./menu-types"

export function renderCommunitiesControls(options: RenderMenuOptions): TemplateResult {
  return html`
    ${
      options.allowCommunityLeaveProbabilityControl
        ? html`
            <label class="side-menu__control">
              <span class="side-menu__control-head">
                <span>${msg("Community leave probability")}</span>
                <span class="side-menu__control-value">${Math.round(options.communityLeaveProbability * 1000) / 10}%</span>
              </span>
              <sl-range min="0.0001" max="0.01" step="0.0001" .value=${String(options.communityLeaveProbability)} ?disabled=${!options.communitiesEnabled} @sl-input=${options.onCommunityLeaveProbabilityInput}></sl-range>
            </label>
          `
        : null
    }
  `
}
