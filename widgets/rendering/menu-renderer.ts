import {css, html} from "lit"
import type {CSSResult, TemplateResult} from "lit"
import {msg} from "@lit/localize"

export const sideMenuStyles: CSSResult = css`
  .widget-shell {
    position: relative;
    display: flex;
    width: 100%;
    height: 100%;
    min-height: 0;
    --side-menu-width: 320px;
  }

  .main-content {
    flex: 1;
    min-width: 0;
    min-height: 0;
  }

  .side-menu {
    width: var(--side-menu-width);
    height: 100%;
    border-left: 1px solid #d6dce4;
    background: #ffffff;
    display: flex;
    flex-direction: column;
    padding: 12px;
    overflow-y: auto;
  }

  .side-menu.hidden {
    display: none;
  }

  .side-menu__title {
    margin: 0 0 10px 0;
    font-size: 1rem;
  }

  .side-menu__section {
    display: grid;
    gap: 8px;
    border-top: 1px solid #e5e7eb;
    padding-top: 10px;
    margin-top: 10px;
  }

  .side-menu__section:first-of-type {
    border-top: none;
    padding-top: 0;
    margin-top: 0;
  }

  .menu-toggle-button {
    position: absolute;
    right: 10px;
    bottom: 10px;
    border: 1px solid #d0d7e0;
    background: #ffffff;
    color: #0f172a;
    font: inherit;
    padding: 6px 12px;
    cursor: pointer;
  }

  .widget-shell.menu-open .menu-toggle-button {
    right: calc(var(--side-menu-width) + 10px);
  }
`

type RenderMenuOptions = {
  menuOpen: boolean
  susceptibleCount: number
  infectedCount: number
  recoveredCount: number
}

export function renderMenu(options: RenderMenuOptions): TemplateResult {
  return html`
    <aside class="side-menu ${options.menuOpen ? "" : "hidden"}" aria-label=${msg("Side menu")}>
      <h3 class="side-menu__title">${msg("Simulation menu")}</h3>
      <div class="side-menu__section">
        <p>${msg("Place additional settings for the simulation here.")}</p>
      </div>
      <div class="side-menu__section">
        <p>${msg("Susceptible")}: ${options.susceptibleCount}</p>
        <p>${msg("Infected")}: ${options.infectedCount}</p>
        <p>${msg("Recovered")}: ${options.recoveredCount}</p>
      </div>
    </aside>
  `
}