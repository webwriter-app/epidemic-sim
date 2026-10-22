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
    grid-template-rows: auto auto;
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

  :host(.ww-fullscreen),
  :host(:fullscreen) {
    height: 100%;
    min-height: 0;
    padding: 16px;
    overflow: hidden;
    background: #ffffff;
  }
  :host(.ww-fullscreen) .widget-shell,
  :host(:fullscreen) .widget-shell {
    height: 100%;
    min-height: 0;
  }
  :host(.ww-fullscreen) .main-content,
  :host(:fullscreen) .main-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 12px;
    container: fullscreen-main / size;
  }
  :host(.ww-fullscreen) .layout,
  :host(:fullscreen) .layout {
    --fs-panel-chrome: 26px;
    --fs-map-extras: 0px;
    --fs-content-height: calc(100vh - 32px - 12px - 112px);
    --fs-box-width: min(
      calc((100cqw - 12px) / 2 - var(--fs-panel-chrome)),
      calc((var(--fs-content-height) - var(--fs-panel-chrome) - var(--fs-map-extras)) * 5 / 3)
    );
    container-type: inline-size;
    flex: none;
    height: auto;
    min-height: 0;
    grid-template-columns: repeat(2, auto);
    grid-template-rows: auto;
    justify-content: center;
    align-items: start;
  }
  @container fullscreen-main (max-aspect-ratio: 6 / 5) {
    :host(.ww-fullscreen) .layout,
    :host(:fullscreen) .layout {
      --fs-box-width: min(
        calc(100cqw - var(--fs-panel-chrome)),
        calc(((var(--fs-content-height) - 12px) / 2 - var(--fs-panel-chrome) - var(--fs-map-extras) / 2) * 5 / 3)
      );
      grid-template-columns: auto;
    }
  }
  :host(.ww-fullscreen) .layout.layout--hotspots,
  :host(:fullscreen) .layout.layout--hotspots {
    --fs-map-extras: 84px;
  }
  :host(.ww-fullscreen) .panel,
  :host(:fullscreen) .panel {
    min-height: 0;
  }
  :host(.ww-fullscreen) .chart-wrap,
  :host(:fullscreen) .chart-wrap {
    width: var(--fs-box-width);
    height: auto;
    min-height: 0;
    max-height: none;
    aspect-ratio: 5 / 3;
  }
  :host(.ww-fullscreen) .simulation-stage,
  :host(:fullscreen) .simulation-stage {
    flex: none;
    min-height: 0;
  }
  :host(.ww-fullscreen) .panel--simulation canvas,
  :host(:fullscreen) .panel--simulation canvas {
    flex: none;
    width: var(--fs-box-width);
    height: auto;
    min-height: 0;
    aspect-ratio: 5 / 3;
  }
  :host(.ww-fullscreen) .hotspot-toolbox--map,
  :host(:fullscreen) .hotspot-toolbox--map {
    flex-wrap: nowrap;
  }
  .fullscreen-insights { flex: none; }
  .fullscreen-insights__title { margin: 0 0 8px; font-size: 1rem; font-weight: 600; color: #0f172a; }
  .fullscreen-insights .insights { grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); }
  .fullscreen-insights .insights__row { display: contents; }

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
  :host(.ww-beforeprint) .hotspot-selection,
  :host(.ww-beforeprint) .simulation-actions,
  :host(.ww-beforeprint) .widget-top-actions,
  :host(.ww-beforeprint) .snapshots-overlay,
  :host(.ww-printable) .teacher-options-shell,
  :host(.ww-printable) .author-only,
  :host(.ww-printable) .chart-context-menu,
  :host(.ww-printable) .hotspot-toolbox--map,
  :host(.ww-printable) .hotspot-selection,
  :host(.ww-printable) .simulation-actions,
  :host(.ww-printable) .widget-top-actions,
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
  :host(.ww-beforeprint) .panel--simulation canvas,
  :host(.ww-printable) .panel--simulation canvas {
    width: auto;
    max-width: 100%;
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
    .hotspot-selection,
    .simulation-actions,
    .widget-top-actions,
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
    .panel--simulation canvas {
      width: auto;
      max-width: 100%;
      height: 240px;
    }
  }

  @media (max-width: 600px) {
    :host, .widget-shell { min-height: 440px; }
    .panel { min-height: 240px; }
  }
`
