import {css} from "lit"

export const layoutStyles = css`
  :host {
    display: block;
    width: 100%;
    max-width: 100%;
    min-width: 0;
    box-sizing: border-box;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    color: #1a1a1a;
  }
  *, *::before, *::after { box-sizing: inherit; }
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
  .panel--simulation canvas { flex: 1; min-height: 360px; height: auto; }
  .panel--chart { align-self: start; min-height: auto; }
  .panel--chart::part(base), .panel--chart::part(body) { min-height: auto; }
  .panel p { margin: 0; color: #4d5b6a; font-size: 0.88rem; line-height: 1.4; }
  @media (max-width: 600px) {
    .layout { grid-template-rows: auto minmax(280px, 1fr); }
    .panel { min-height: 240px; }
    .panel--simulation canvas { height: 280px; }
  }
`
