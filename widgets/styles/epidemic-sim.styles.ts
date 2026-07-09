import {css} from "lit"

export const epidemicSimStyles = css`
  :host {
    display: block;
    width: 100%;
    max-width: 100%;
    min-width: 0;
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

  .panel::part(base) {
    border: 1px solid #d6dce4;
    background: #fff;
    min-height: inherit;
  }

  .panel::part(body) {
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 0;
    min-height: inherit;
  }

  .panel--simulation {
    min-height: 0;
  }

  .panel--simulation::part(body) {
    flex: 1;
    min-height: 0;
  }

  .panel--simulation canvas {
    flex: 1;
    min-height: 360px;
    height: auto;
  }

  .panel--chart {
    align-self: start;
    min-height: auto;
  }

  .panel--chart::part(base) {
    min-height: auto;
  }

  .panel--chart::part(body) {
    min-height: auto;
  }

  .panel p {
    margin: 0;
    color: #4d5b6a;
    font-size: 0.88rem;
    line-height: 1.4;
  }

  .chart-wrap {
    position: relative;
    width: 100%;
    height: 220px;
    min-height: 220px;
    max-height: 220px;
    flex: 0 0 auto;
    border: 1px solid #d6dce4;
    background: #fcfdff;
  }

  .chart-wrap--interactive {
    cursor: zoom-in;
  }

  .chart-context-menu {
    position: fixed;
    z-index: 28;
    background: #ffffff;
    border: 1px solid #d6dce4;
    border-radius: 8px;
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.16);
    padding: 6px;
    min-width: 170px;
  }

  .chart-context-menu__item {
    width: 100%;
  }

  .chart-context-menu__item::part(base) {
    width: 100%;
    justify-content: flex-start;
    text-align: left;
    color: #0f172a;
    border-radius: 6px;
    padding: 7px 8px;
  }

  .chart-context-menu__item::part(base):hover {
    background: #f1f5f9;
  }

  .chart-wrap canvas {
    display: block;
    width: 100% !important;
    height: 100% !important;
  }

  canvas {
    width: 100%;
    border: 1px solid #d6dce4;
    background: #fcfdff;
  }

  .panel--simulation canvas {
    height: 360px;
    cursor: grab;
  }

  .hotspot-toolbox__notice::part(base) {
    font-size: 0.8rem;
    font-weight: 500;
  }

  .hotspot-toolbox__token {
    user-select: none;
    cursor: grab;
    width: max-content;
  }

  .hotspot-toolbox__token::part(base) {
    min-width: 34px;
    min-height: 34px;
    border-width: 2px;
    border-color: #7c3aed;
    color: #7c3aed;
    font-weight: 700;
    text-transform: uppercase;
  }

  sl-range {
    width: 100%;
  }

  .actions {
    margin-top: auto;
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding-top: 6px;
  }

  .simulation-actions {
    justify-content: center;
    flex-wrap: wrap;
    gap: 14px;
    width: 100%;
    padding-top: 10px;
    padding-bottom: 4px;
  }

  .simulation-actions__icon-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    padding: 0;
    border: 1px solid #d6dce4;
    border-radius: 50%;
    color: #334155;
    background: #ffffff;
    cursor: pointer;
    line-height: 1;
  }

  .simulation-actions__icon-button:hover {
    background: #f8fafc;
  }

  .simulation-actions__icon-button:focus-visible {
    outline: 2px solid #7c3aed;
    outline-offset: 2px;
  }

  .hotspot-toolbox--map {
    margin-top: 8px;
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .chart-overlay__fit-switch {
    font-size: 0.92rem;
  }

  .chart-overlay__fit-switch::part(form-control) {
    margin-bottom: 0;
  }

  .panel--simulation canvas.drop-active {
    outline: 2px dashed #7c3aed;
    outline-offset: -4px;
    background: #f5f3ff;
  }

  .actions sl-button:not(.simulation-actions__icon-button)::part(base) {
    min-width: 112px;
  }

  .hotspot-toolbox__token:active {
    cursor: grabbing;
  }

  .chart-overlay {
    position: absolute;
    inset: 0;
    background: rgba(15, 23, 42, 0.56);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    z-index: 30;
  }

  .chart-overlay__dialog {
    width: min(1020px, 100%);
    max-height: 100%;
    overflow: auto;
    border: 1px solid #d6dce4;
    background: #ffffff;
    border-radius: 10px;
    box-shadow: 0 16px 40px rgba(15, 23, 42, 0.3);
    padding: 14px;
    display: grid;
    gap: 12px;
  }

  .chart-overlay__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .chart-overlay__header h3 {
    margin: 0;
    font-size: 1.05rem;
  }

  .chart-overlay__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: flex-end;
  }

  .chart-overlay__controls {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .chart-overlay__chart-wrap {
    position: relative;
    width: 100%;
    height: min(52vh, 420px);
    min-height: 260px;
    border: 1px solid #d6dce4;
    background: #fcfdff;
  }

  .chart-overlay__chart-wrap canvas {
    display: block;
    width: 100% !important;
    height: 100% !important;
  }

  .chart-overlay__insights {
    display: grid;
    gap: 8px;
  }

  .chart-overlay__insights-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 8px;
  }

  .chart-overlay__insight-item {
    border: 1px solid #e2e8f0;
    background: #f8fafc;
    border-radius: 8px;
    padding: 8px 10px;
    display: grid;
    gap: 2px;
  }

  .chart-overlay__insight-item span {
    font-size: 0.78rem;
    color: #475569;
  }

  .chart-overlay__insight-item strong {
    font-size: 0.94rem;
    color: #0f172a;
    font-variant-numeric: tabular-nums;
  }

  .snapshots-overlay {
    position: absolute;
    inset: 0;
    background: rgba(15, 23, 42, 0.56);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    z-index: 30;
  }

  .snapshots-overlay__dialog {
    width: min(1040px, 100%);
    max-height: 100%;
    overflow: auto;
    border: 1px solid #d6dce4;
    background: #ffffff;
    border-radius: 10px;
    box-shadow: 0 16px 40px rgba(15, 23, 42, 0.3);
    padding: 14px;
    display: grid;
    gap: 12px;
  }

  .snapshots-overlay__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .snapshots-overlay__header h3 {
    margin: 0;
    font-size: 1.05rem;
  }

  .snapshots-overlay__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: flex-end;
  }

  .snapshots-overlay__empty {
    border: 1px dashed #cbd5e1;
    border-radius: 10px;
    background: #f8fafc;
    color: #334155;
    padding: 12px;
    font-size: 0.9rem;
  }

  .snapshots-overlay__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    align-content: start;
  }

  .snapshots-overlay__snapshot-card {
    border: 1px solid #d6dce4;
    border-radius: 10px;
    padding: 10px;
    display: grid;
    gap: 8px;
    background: #ffffff;
  }

  .snapshots-overlay__snapshot-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 8px;
  }

  .snapshots-overlay__snapshot-meta {
    display: grid;
    gap: 2px;
    min-width: 0;
  }

  .snapshots-overlay__snapshot-title {
    font-weight: 600;
    color: #0f172a;
  }

  .snapshots-overlay__snapshot-time {
    color: #475569;
    font-size: 0.8rem;
  }

  .snapshots-overlay__delete-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    width: 28px;
    height: 28px;
    padding: 0;
    border: 1px solid #fecaca;
    border-radius: 6px;
    color: #dc2626;
    background: #ffffff;
    cursor: pointer;
    line-height: 1;
  }

  .snapshots-overlay__delete-button:hover {
    background: #fef2f2;
  }

  .snapshots-overlay__delete-button:focus-visible {
    outline: 2px solid #dc2626;
    outline-offset: 2px;
  }

  .snapshots-overlay__snapshot-image {
    width: 100%;
    height: min(20vh, 190px);
    min-height: 140px;
    border: 1px solid #d6dce4;
    border-radius: 8px;
    object-fit: contain;
    background: #f8fafc;
  }

  .snapshots-overlay__snapshot-details {
    border-top: 1px solid #e2e8f0;
    padding-top: 6px;
  }

  .snapshots-overlay__snapshot-details::part(base) {
    border: none;
    border-radius: 0;
    padding: 0;
  }

  .snapshots-overlay__snapshot-details::part(header) {
    padding: 0 0 6px 0;
    color: #334155;
    font-size: 0.82rem;
  }

  .snapshots-overlay__snapshot-details::part(content) {
    padding: 0;
  }

  .snapshots-overlay__snapshot-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 6px 10px;
    font-size: 0.82rem;
    color: #334155;
    font-variant-numeric: tabular-nums;
  }

  .snapshots-overlay__snapshot-grid strong {
    color: #0f172a;
  }

  @media (max-width: 600px) {
    .layout {
      grid-template-rows: auto minmax(280px, 1fr);
    }

    .panel {
      min-height: 240px;
    }

    .panel--simulation canvas {
      height: 280px;
    }

    .chart-overlay {
      padding: 8px;
    }

    .chart-overlay__dialog {
      padding: 10px;
      border-radius: 8px;
    }

    .chart-overlay__chart-wrap {
      height: min(48vh, 320px);
      min-height: 220px;
    }

    .snapshots-overlay {
      padding: 8px;
    }

    .snapshots-overlay__dialog {
      padding: 10px;
      border-radius: 8px;
    }

    .snapshots-overlay__snapshot-image {
      height: min(18vh, 150px);
      min-height: 120px;
    }
  }
`
