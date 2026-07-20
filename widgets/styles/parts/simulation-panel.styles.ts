import {css} from "lit"

export const simulationPanelStyles = css`
  canvas { width: 100%; border: 1px solid #d6dce4; background: #fcfdff; }
  .panel--simulation canvas { height: 360px; cursor: grab; }
  .panel--simulation canvas.drop-active {
    outline: 2px dashed #7c3aed;
    outline-offset: -4px;
    background: #f5f3ff;
  }
  .hotspot-toolbox__notice::part(base) { font-size: 0.8rem; font-weight: 500; }
  .hotspot-toolbox__token { user-select: none; cursor: grab; width: max-content; }
  .hotspot-toolbox__token::part(base) {
    min-width: 34px;
    min-height: 34px;
    border-width: 2px;
    border-color: #7c3aed;
    color: #7c3aed;
    font-weight: 700;
    text-transform: uppercase;
  }
  .hotspot-toolbox__token:active { cursor: grabbing; }
  .hotspot-toolbox--map { margin-top: 8px; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  sl-range { width: 100%; }
  .actions { margin-top: auto; display: flex; justify-content: flex-end; gap: 8px; padding-top: 6px; }
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
  .simulation-actions__icon-button:hover { background: #f8fafc; }
  .simulation-actions__icon-button:focus-visible { outline: 2px solid #7c3aed; outline-offset: 2px; }
  .actions sl-button:not(.simulation-actions__icon-button)::part(base) { min-width: 112px; }
`
