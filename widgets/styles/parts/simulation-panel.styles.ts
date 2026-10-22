import {css} from "lit"

export const simulationPanelStyles = css`
  canvas { width: 100%; border: 1px solid #d6dce4; background: #fcfdff; }
  .simulation-stage {
    position: relative;
    display: flex;
    flex-direction: column;
  }
  .panel--simulation canvas {
    width: 100%;
    height: auto;
    aspect-ratio: 5 / 3;
    display: block;
  }
  .panel--simulation canvas.drop-active {
    outline: 2px dashed #7c3aed;
    outline-offset: -4px;
    background: #f5f3ff;
  }
  .panel--simulation canvas.hotspots-editable { touch-action: none; }
  .panel--simulation canvas.placing-hotspot { cursor: crosshair; }
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
  .hotspot-toolbox__token--active::part(base) { background: #7c3aed; color: #ffffff; }
  .hotspot-toolbox--map {
    margin-top: 8px;
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }
  .hotspot-selection {
    margin-top: 8px;
    display: flex;
    align-items: flex-end;
    gap: 10px;
    flex-wrap: wrap;
  }
  .hotspot-selection__delete::part(base) { color: #dc2626; border-color: #fecaca; }
  .hotspot-selection__delete-icon { display: inline-flex; align-items: center; }
  sl-range { width: 100%; }
  .actions { display: flex; justify-content: flex-end; gap: 8px; }
  .simulation-actions {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 10px;
    z-index: 1;
    justify-content: center;
    flex-wrap: wrap;
    gap: 14px;
    width: 100%;
    margin: 0;
    padding: 0;
    pointer-events: none;
  }
  .simulation-actions > * { pointer-events: auto; }
  .simulation-actions__icon-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 35px;
    height: 35px;
    padding: 0;
    border: 1px solid #d6dce4;
    border-radius: 50%;
    color: #666666;
    background: rgba(255, 255, 255, 0.92);
    box-shadow: 0 1px 4px rgba(15, 23, 42, 0.12);
    cursor: pointer;
    line-height: 1;
  }
  .simulation-actions__icon-button:hover { background: #ffffff; }
  .simulation-actions__icon-button svg { width: 16px; height: 16px; }
  .actions sl-button:not(.simulation-actions__icon-button)::part(base) { min-width: 112px; }
`
