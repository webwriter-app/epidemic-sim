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
  .insights { display: grid; gap: 8px; }
  .insights__row { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 8px; }
  .insights__item {
    border: 1px solid #e2e8f0;
    background: #f8fafc;
    border-radius: 8px;
    padding: 8px 10px;
    display: grid;
    gap: 2px;
  }
  .insights__item span { font-size: 0.78rem; color: #475569; }
  .insights__item strong { font-size: 0.94rem; color: #0f172a; font-variant-numeric: tabular-nums; }
`
