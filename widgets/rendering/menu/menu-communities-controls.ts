import {html} from "lit"
import type {TemplateResult} from "lit"
import {msg} from "@lit/localize"
import {MENU_RANGE_LIMITS} from "../../config/widget-schema"
import type {RenderMenuOptions} from "./menu-types"

const R = MENU_RANGE_LIMITS

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
              <sl-range min=${String(R.communityLeaveProbability.min)} max=${String(R.communityLeaveProbability.max)} step=${String(R.communityLeaveProbability.step)} .value=${String(options.communityLeaveProbability)} ?disabled=${!options.communitiesEnabled} @sl-input=${options.onCommunityLeaveProbabilityInput}></sl-range>
            </label>
          `
        : null
    }
  `
}
