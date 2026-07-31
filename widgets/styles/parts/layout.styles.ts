import {css} from "lit"

export const layoutStyles = css`
  :host {
    display: block;
    width: 100%;
    max-width: 100%;
    min-width: 0;
    min-height: 520px;
    box-sizing: border-box;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    color: #1a1a1a;
  }
  *, *::before, *::after { box-sizing: inherit; }
  .widget-shell {
    min-height: 520px;
  }
  .layout {
    display: grid;
    gap: 12px;
    grid-template-columns: 1fr;
    grid-template-rows: auto minmax(360px, 1fr);
    height: 100%;
    min-width: 0;
    min-height: 0;
  }
  .panel {
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 260px;
  }
  .panel::part(base) { border: 1px solid #d6dce4; background: #fff; min-height: inherit; }
  .panel::part(body) { padding: 12px; display: flex; flex-direction: column; gap: 0; min-height: inherit; }
  .panel--simulation { min-height: 0; }
  .panel--simulation::part(body) { flex: 1; min-height: 0; }
  .panel--chart { align-self: start; min-height: auto; }
  .panel--chart::part(base), .panel--chart::part(body) { min-height: auto; }
  .panel p { margin: 0; color: #4d5b6a; font-size: 0.88rem; line-height: 1.4; }
  .print-hint { display: none; }

  :host(.ww-beforeprint),
  :host(.ww-printable) {
    min-height: 0;
    break-inside: avoid;
    page-break-inside: avoid;
  }
  :host(.ww-beforeprint) .teacher-options-shell,
  :host(.ww-beforeprint) .author-only,
  :host(.ww-beforeprint) .chart-context-menu,
  :host(.ww-beforeprint) .hotspot-toolbox--map,
  :host(.ww-beforeprint) .simulation-actions,
  :host(.ww-beforeprint) .chart-overlay,
  :host(.ww-beforeprint) .snapshots-overlay,
  :host(.ww-printable) .teacher-options-shell,
  :host(.ww-printable) .author-only,
  :host(.ww-printable) .chart-context-menu,
  :host(.ww-printable) .hotspot-toolbox--map,
  :host(.ww-printable) .simulation-actions,
  :host(.ww-printable) .chart-overlay,
  :host(.ww-printable) .snapshots-overlay {
    display: none !important;
  }
  :host(.ww-beforeprint) .widget-shell,
  :host(.ww-printable) .widget-shell {
    min-height: 0;
    height: auto;
    overflow: visible;
  }
  :host(.ww-beforeprint) .print-hint,
  :host(.ww-printable) .print-hint {
    display: block;
    margin: 0 0 6px;
    color: #334155;
    font-size: 0.8rem;
  }
  :host(.ww-beforeprint) .layout,
  :host(.ww-printable) .layout {
    gap: 8px;
    grid-template-rows: auto auto;
    height: auto;
  }
  :host(.ww-beforeprint) .panel,
  :host(.ww-printable) .panel {
    min-height: 0;
    break-inside: avoid;
    page-break-inside: avoid;
  }
  :host(.ww-beforeprint) .panel::part(body),
  :host(.ww-printable) .panel::part(body) {
    padding: 8px;
  }
  :host(.ww-beforeprint) .panel--chart canvas,
  :host(.ww-printable) .panel--chart canvas {
    max-height: 140px;
    border: 1px solid #94a3b8;
  }
  :host(.ww-beforeprint) .simulation-stage,
  :host(.ww-beforeprint) .panel--simulation canvas,
  :host(.ww-printable) .simulation-stage,
  :host(.ww-printable) .panel--simulation canvas {
    min-height: 0;
    max-height: 240px;
    height: 240px;
    border: 1px solid #94a3b8;
  }

  @media print {
    :host {
      min-height: 0;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .teacher-options-shell,
    .author-only,
    .chart-context-menu,
    .hotspot-toolbox--map,
    .simulation-actions,
    .chart-overlay,
    .snapshots-overlay {
      display: none !important;
    }
    .widget-shell {
      min-height: 0;
      height: auto;
      overflow: visible;
    }
    .print-hint {
      display: block;
      margin: 0 0 6px;
      font-size: 0.8rem;
    }
    .layout {
      gap: 8px;
      grid-template-rows: auto auto;
      height: auto;
    }
    .panel {
      min-height: 0;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .panel--chart canvas {
      max-height: 140px;
    }
    .simulation-stage,
    .panel--simulation canvas {
      min-height: 0;
      max-height: 240px;
      height: 240px;
    }
  }

  @media (max-width: 600px) {
    :host, .widget-shell { min-height: 440px; }
    .layout { grid-template-rows: auto minmax(280px, 1fr); }
    .panel { min-height: 240px; }
    .simulation-stage, .panel--simulation canvas { min-height: 280px; }
  }
`
