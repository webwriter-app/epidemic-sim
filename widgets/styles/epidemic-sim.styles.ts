import {css} from "lit"

export const epidemicSimStyles = css`
  :host {
    display: block;
    box-sizing: border-box;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    color: #1a1a1a;
  }

  *,
  *::before,
  *::after {
    box-sizing: inherit;
  }

  .layout {
    display: grid;
    gap: 12px;
    grid-template-columns: minmax(260px, 1fr) minmax(420px, 1.6fr);
    grid-template-areas:
      "chart simulation"
      "controls simulation";
    align-items: stretch;
    min-width: 0;
  }

  .panel {
    border: 1px solid #d6dce4;
    background: #fff;
    padding: 12px;
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 260px;
  }

  .panel--simulation {
    grid-area: simulation;
  }

  .panel--chart {
    grid-area: chart;
  }

  .panel--controls {
    grid-area: controls;
  }

  .panel p {
    margin: 0;
    color: #4d5b6a;
    font-size: 0.88rem;
    line-height: 1.4;
  }

  canvas {
    width: 100%;
    height: 220px;
    border: 1px solid #d6dce4;
    background: #fcfdff;
  }

  .panel--simulation canvas {
    height: 360px;
  }

  .status {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin: 8px 0 0 0;
    font-size: 0.9rem;
    font-variant-numeric: tabular-nums;
  }

  .status-item {
    padding: 2px 8px;
    color: #fff;
    font-weight: 600;
  }

  .status-item--susceptible {
    background: #2563eb;
  }

  .status-item--infected {
    background: #dc2626;
  }

  .status-item--recovered {
    background: #16a34a;
  }

  .controls {
    display: grid;
    gap: 10px;
    margin-top: 4px;
  }

  .control {
    display: grid;
    gap: 4px;
  }

  .control-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 8px;
    font-size: 0.9rem;
  }

  .control-value {
    color: #334155;
    font-variant-numeric: tabular-nums;
    font-size: 0.86rem;
  }

  input[type="range"] {
    width: 100%;
    margin: 0;
  }

  .actions {
    margin-top: auto;
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding-top: 6px;
  }

  .simulation-actions {
    justify-content: flex-start;
  }

  button {
    border: none;
    background: #f7fafc;
    color: #0f172a;
    font: inherit;
    padding: 6px 12px;
    cursor: pointer;
  }

  button:hover {
    background: #f0f5fa;
  }

  @media (max-width: 600px) {
    .layout {
      grid-template-columns: 1fr;
      grid-template-areas:
        "simulation"
        "chart"
        "controls";
    }

    .panel {
      min-height: 240px;
    }

    .panel--simulation canvas {
      height: 280px;
    }
  }
`
