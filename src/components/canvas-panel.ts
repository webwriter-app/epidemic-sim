import iconPlay from "@tabler/icons/outline/player-play.svg"
import iconPause from "@tabler/icons/outline/player-pause.svg"
import iconReset from "@tabler/icons/outline/refresh.svg"
import iconDelete from "@tabler/icons/outline/trash.svg"
import { sourceMsg } from "../../localization/localizer";
import type { MsgFn } from "@lit/localize";
import {html, nothing} from "lit"
import type {TemplateResult} from "lit"
import type {DragCommitEvent} from "./hotspot-editing-controller"
import {SIMULATION_CANVAS_HEIGHT, SIMULATION_CANVAS_WIDTH} from "../model/simulation/canvas-dimensions"

export type SelectedHotspotInput = {
  label: string
  onDelete: () => void
}

type CanvasPanelInput = {
  hotspotPlacementActive: boolean
  selectedHotspot: SelectedHotspotInput | null
  hotspotsEnabled: boolean
  showHotspotToolbox: boolean
  isRunning: boolean
  onCanvasDragCommit: (event: DragCommitEvent) => void
  onCanvasPointerDown: (event: PointerEvent) => void
  onCanvasPointerMove: (event: PointerEvent) => void
  onCanvasContextMenu: (event: MouseEvent) => void
  onCanvasKeyDown: (event: KeyboardEvent) => void
  printImage: string | null
  onHotspotTokenClick: () => void
  onToggleSimulation: () => void
  onResetSimulation: () => void
}

function renderSelectedHotspot(selected: SelectedHotspotInput, msg: MsgFn = sourceMsg): TemplateResult {
  return html`
    <div class="hotspot-selection">
      <sl-button class="hotspot-selection__delete" size="small" @click=${selected.onDelete}>
        <span slot="prefix" class="hotspot-selection__delete-icon"><sl-icon src=${iconDelete}></sl-icon></span>
        ${msg("Delete")} ${selected.label}
      </sl-button>
    </div>
  `
}

function getCanvasClass(input: CanvasPanelInput): string {
  return [
    input.hotspotsEnabled ? "hotspots-editable" : "",
    input.hotspotPlacementActive ? "placing-hotspot" : "",
  ]
    .filter(Boolean)
    .join(" ")
}

export function renderCanvasPanel(input: CanvasPanelInput, msg: MsgFn = sourceMsg): TemplateResult {
  return html`
    <sl-card class="panel panel--simulation" part="map">
      <div class="simulation-stage">
        <canvas
          id="simulation-canvas"
          width=${SIMULATION_CANVAS_WIDTH}
          height=${SIMULATION_CANVAS_HEIGHT}
          class=${getCanvasClass(input)}
          tabindex=${input.hotspotsEnabled && input.showHotspotToolbox ? "0" : nothing}
          role=${input.hotspotsEnabled && input.showHotspotToolbox ? "application" : nothing}
          aria-label=${input.hotspotsEnabled && input.showHotspotToolbox ? msg("Simulation map. Enter selects the next hotspot, arrow keys move it, Delete removes it.") : nothing}
          @keydown=${input.onCanvasKeyDown}
          data-ww-drop="hotspot"
          data-ww-drop-position="point"
          @ww-dragcommit=${input.onCanvasDragCommit}
          @pointerdown=${input.onCanvasPointerDown}
          @pointermove=${input.onCanvasPointerMove}
          @contextmenu=${input.onCanvasContextMenu}
        ></canvas>
        ${input.printImage ? html`<img class="print-image" alt="" src=${input.printImage}>` : null}
        <div class="actions simulation-actions">
          <button type="button" class="simulation-actions__icon-button simulation-actions__icon-button--play-pause" aria-label=${input.isRunning ? msg("Pause") : msg("Start")} @click=${input.onToggleSimulation}>
            <sl-icon src=${input.isRunning ? iconPause : iconPlay}></sl-icon>
          </button>
          <button type="button" class="simulation-actions__icon-button" aria-label=${msg("Reset simulation")} @click=${input.onResetSimulation}>
            <sl-icon src=${iconReset}></sl-icon>
          </button>
        </div>
      </div>
      ${input.hotspotsEnabled && input.showHotspotToolbox
        ? html`
            <div class="hotspot-toolbox--map">
              <sl-button
                class=${input.hotspotPlacementActive ? "hotspot-toolbox__token hotspot-toolbox__token--active" : "hotspot-toolbox__token"}
                data-ww-drag="hotspot"
                data-ww-drag-effect="copy"
                data-ww-key="new-hotspot"
                data-ww-label=${msg("H")}
                size="small"
                variant="default"
                @click=${input.onHotspotTokenClick}
              >
                ${msg("H")}
              </sl-button>
              <sl-tag class="hotspot-toolbox__notice" variant="primary">
                ${input.hotspotPlacementActive
                  ? msg("Tap the simulation map to place the hotspot.")
                  : msg("Drag this hotspot into the simulation map.")}
              </sl-tag>
            </div>
          `
        : null}
      ${input.hotspotsEnabled && input.selectedHotspot ? renderSelectedHotspot(input.selectedHotspot, msg) : null}
    </sl-card>
  `
}
