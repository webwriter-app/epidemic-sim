import {html} from "lit"
import type {TemplateResult} from "lit"

export type MenuSectionHeaderSwitch = {
  checked: boolean
  onChange: (event: Event) => void
}

export function renderMenuSection(
  title: string,
  controls: TemplateResult,
  headerSwitch?: MenuSectionHeaderSwitch,
): TemplateResult {
  return html`
    <div class="side-menu__section">
      <div class="side-menu__title-row">
        <h3 class="side-menu__title">${title}</h3>
        ${
          headerSwitch
            ? html`
                <sl-switch
                  class="side-menu__title-switch"
                  ?checked=${headerSwitch.checked}
                  @sl-change=${headerSwitch.onChange}
                ></sl-switch>
              `
            : null
        }
      </div>
      <div class="side-menu__controls">${controls}</div>
    </div>
  `
}
