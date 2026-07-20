import {html} from "lit"
import type {TemplateResult} from "lit"
import {msg} from "@lit/localize"
import {renderCommunitiesControls} from "./menu/menu-communities-controls"
import {renderGeneralControls} from "./menu/menu-general-controls"
import {renderHotspotsControls} from "./menu/menu-hotspots-controls"
import {renderModelControls} from "./menu/menu-model-controls"
import {renderQuarantineControls} from "./menu/menu-quarantine-controls"
import {renderMenuSection} from "./menu/menu-section"
import {
  hasCommunitiesMenuControls,
  hasGeneralMenuControls,
  hasHotspotsMenuControls,
  hasModelMenuControls,
  hasQuarantineMenuControls,
  hasVisibleMenuControls,
  type MenuAllowFlags,
  type RenderMenuOptions,
} from "./menu/menu-types"

export {sideMenuStyles} from "../styles/menu.styles"
export type {MenuAllowFlags, RenderMenuOptions} from "./menu/menu-types"
export {hasVisibleMenuControls}

export function renderMenu(options: RenderMenuOptions): TemplateResult {
  return html`
    <aside class="side-menu">
      ${hasModelMenuControls(options) ? renderMenuSection(msg("Model"), renderModelControls(options)) : null}
      ${hasGeneralMenuControls(options) ? renderMenuSection(msg("General"), renderGeneralControls(options)) : null}
      ${
        hasQuarantineMenuControls(options)
          ? renderMenuSection(
              msg("Quarantine"),
              renderQuarantineControls(options),
              options.allowQuarantineEnabledControl
                ? {checked: options.quarantineEnabled, onChange: options.onToggleQuarantine}
                : undefined,
            )
          : null
      }
      ${
        hasHotspotsMenuControls(options)
          ? renderMenuSection(
              msg("Hotspots"),
              renderHotspotsControls(options),
              options.allowHotspotsEnabledControl
                ? {checked: options.hotspotsEnabled, onChange: options.onToggleHotspots}
                : undefined,
            )
          : null
      }
      ${
        hasCommunitiesMenuControls(options)
          ? renderMenuSection(
              msg("Communities"),
              renderCommunitiesControls(options),
              options.allowCommunitiesEnabledControl
                ? {checked: options.communitiesEnabled, onChange: options.onToggleCommunities}
                : undefined,
            )
          : null
      }
    </aside>
  `
}
