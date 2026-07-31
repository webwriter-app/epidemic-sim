import {css} from "lit"

export const chartStyles = css`
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
  .chart-wrap--interactive { cursor: zoom-in; }
  .chart-wrap canvas { display: block; width: 100% !important; height: 100% !important; }
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
  .chart-context-menu__item { width: 100%; }
  .chart-context-menu__item::part(base) {
    width: 100%;
    justify-content: flex-start;
    text-align: left;
    color: #0f172a;
    border-radius: 6px;
    padding: 7px 8px;
  }
  .chart-context-menu__item::part(base):hover { background: #f1f5f9; }
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
  .chart-overlay__header { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
  .chart-overlay__header-main { display: grid; gap: 8px; min-width: 0; }
  .chart-overlay__header h3 { margin: 0; font-size: 1.05rem; }
  .chart-overlay__tabs { display: flex; flex-wrap: wrap; gap: 6px; }
  .chart-overlay__tab {
    appearance: none;
    border: 1px solid #d6dce4;
    background: #ffffff;
    color: #334155;
    border-radius: 999px;
    padding: 5px 12px;
    font: inherit;
    font-size: 0.86rem;
    cursor: pointer;
  }
  .chart-overlay__tab:hover { background: #f8fafc; }
  .chart-overlay__tab.is-active {
    border-color: #7c3aed;
    background: #f5f3ff;
    color: #5b21b6;
    font-weight: 600;
  }
  .chart-overlay__actions { display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-end; }
  .chart-overlay__chart-wrap,
  .chart-overlay__simulation-wrap {
    position: relative;
    width: 100%;
    height: min(52vh, 420px);
    min-height: 260px;
    border: 1px solid #d6dce4;
    background: #fcfdff;
  }
  .chart-overlay__chart-wrap canvas,
  .chart-overlay__simulation-wrap canvas {
    display: block;
    width: 100% !important;
    height: 100% !important;
  }
  .chart-overlay__insights { display: grid; gap: 8px; }
  .chart-overlay__insights-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 8px; }
  .chart-overlay__insight-item {
    border: 1px solid #e2e8f0;
    background: #f8fafc;
    border-radius: 8px;
    padding: 8px 10px;
    display: grid;
    gap: 2px;
  }
  .chart-overlay__insight-item span { font-size: 0.78rem; color: #475569; }
  .chart-overlay__insight-item strong { font-size: 0.94rem; color: #0f172a; font-variant-numeric: tabular-nums; }
  @media (max-width: 600px) {
    .chart-overlay { padding: 8px; }
    .chart-overlay__dialog { padding: 10px; border-radius: 8px; }
    .chart-overlay__chart-wrap,
    .chart-overlay__simulation-wrap { height: min(48vh, 320px); min-height: 220px; }
  }
`
