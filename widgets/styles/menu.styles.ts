import {css} from "lit"
import type {CSSResult} from "lit"

export const sideMenuStyles: CSSResult = css`
  .widget-shell { position: relative; width: 100%; height: 100%; min-height: 0; --side-menu-width: 260px; overflow: hidden; }
  .main-content { width: 100%; height: 100%; min-width: 0; min-height: 0; }
  .widget-shell.has-menu .main-content { padding-right: var(--side-menu-width); }
  .side-menu { position: absolute; top: 0; right: 0; bottom: 0; width: var(--side-menu-width); border-left: 1px solid #d6dce4; background: #ffffff; display: flex; flex-direction: column; padding: 10px; overflow-y: auto; z-index: 8; box-shadow: -4px 0 12px rgba(15, 23, 42, 0.1); }
  .side-menu__title-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin: 0 0 10px 0; }
  .side-menu__title { margin: 0; font-size: 1rem; flex: 1; min-width: 0; }
  .side-menu__title-switch { --width: 36px; --height: 20px; flex-shrink: 0; display: inline-flex; align-items: center; align-self: center; margin: 0; }
  .side-menu__title-switch::part(base) { margin: 0; line-height: 0; }
  .side-menu__title-switch::part(label) { display: none; margin: 0; }
  .side-menu__section { display: grid; gap: 8px; border-top: 1px solid #e5e7eb; padding-top: 10px; margin-top: 10px; }
  .side-menu__section:first-of-type { border-top: none; padding-top: 0; margin-top: 0; }
  .side-menu__controls { display: grid; gap: 8px; }
  .side-menu__control { display: grid; gap: 4px; }
  .side-menu__control-head { display: flex; justify-content: space-between; gap: 6px; align-items: baseline; font-size: 0.82rem; line-height: 1.25; }
  .side-menu__control-value { color: #334155; font-size: 0.78rem; font-variant-numeric: tabular-nums; flex-shrink: 0; }
  .side-menu sl-range { width: 100%; }
  .side-menu sl-select { width: 100%; }
  .side-menu sl-select::part(combobox) { width: 100%; }

  :host(.ww-beforeprint) .widget-shell.has-menu,
  :host(.ww-printable) .widget-shell.has-menu {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 220px;
    grid-template-rows: auto auto;
    column-gap: 8px;
    align-items: start;
    overflow: visible;
    --side-menu-width: 220px;
  }
  :host(.ww-beforeprint) .widget-shell.has-menu .print-hint,
  :host(.ww-printable) .widget-shell.has-menu .print-hint {
    grid-column: 1 / -1;
  }
  :host(.ww-beforeprint) .widget-shell.has-menu .main-content,
  :host(.ww-printable) .widget-shell.has-menu .main-content {
    padding-right: 0;
    grid-column: 1;
    height: auto;
  }
  :host(.ww-beforeprint) .side-menu,
  :host(.ww-printable) .side-menu {
    position: static;
    width: auto;
    height: auto;
    max-height: none;
    overflow: visible;
    box-shadow: none;
    padding: 6px 8px;
    font-size: 0.75rem;
    grid-column: 2;
    grid-row: 2;
  }
  :host(.ww-beforeprint) .side-menu__title,
  :host(.ww-printable) .side-menu__title {
    font-size: 0.85rem;
  }
  :host(.ww-beforeprint) .side-menu__section,
  :host(.ww-printable) .side-menu__section {
    gap: 4px;
    padding-top: 6px;
    margin-top: 6px;
  }
  :host(.ww-beforeprint) .side-menu__control-head,
  :host(.ww-printable) .side-menu__control-head {
    font-size: 0.72rem;
  }

  @media print {
    .widget-shell.has-menu {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 220px;
      grid-template-rows: auto auto;
      column-gap: 8px;
      align-items: start;
      overflow: visible;
      --side-menu-width: 220px;
    }
    .widget-shell.has-menu .print-hint {
      grid-column: 1 / -1;
    }
    .widget-shell.has-menu .main-content {
      padding-right: 0;
      grid-column: 1;
      height: auto;
    }
    .side-menu {
      position: static;
      width: auto;
      height: auto;
      max-height: none;
      overflow: visible;
      box-shadow: none;
      padding: 6px 8px;
      font-size: 0.75rem;
      grid-column: 2;
      grid-row: 2;
    }
    .side-menu__title {
      font-size: 0.85rem;
    }
    .side-menu__section {
      gap: 4px;
      padding-top: 6px;
      margin-top: 6px;
    }
    .side-menu__control-head {
      font-size: 0.72rem;
    }
  }
`
