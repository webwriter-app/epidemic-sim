import {html} from "lit"
import type {TemplateResult} from "lit"
import {msg} from "@lit/localize"
import {
  renderDeleteIcon,
  renderPauseIcon,
  renderPlayIcon,
  renderResetIcon,
  renderSnapshotsIcon,
} from "../rendering/action-icons"
import {SIMULATION_CANVAS_HEIGHT, SIMULATION_CANVAS_WIDTH} from "../simulation/canvas-dimensions"

export type SelectedHotspotInput = {
  label: string
  size: number
  min: number
  max: number
  step: number
  onSizeInput: (event: Event) => void
  onDelete: () => void
}

type CanvasPanelInput = {
  canvasDropActive: boolean
  hotspotPlacementActive: boolean
  selectedHotspot: SelectedHotspotInput | null
  hotspotsEnabled: boolean
  showHotspotToolbox: boolean
  isRunning: boolean
  onCanvasDragOver: (event: DragEvent) => void
  onCanvasDragLeave: () => void
  onCanvasDrop: (event: DragEvent) => void
  onCanvasPointerDown: (event: PointerEvent) => void
  onCanvasContextMenu: (event: MouseEvent) => void
  onCanvasDoubleClick: () => void
  onHotspotTokenDragStart: (event: DragEvent) => void
  onHotspotTokenDragEnd: () => void
  onHotspotTokenClick: () => void
  onToggleSimulation: () => void
  onResetSimulation: () => void
  onOpenSnapshots: () => void
}

function renderSelectedHotspot(selected: SelectedHotspotInput): TemplateResult {
  return html`
    <div class="hotspot-selection">
      <sl-range
        class="hotspot-selection__size"
        label=${`${selected.label} · ${msg("Hotspot size")}`}
        tooltip="none"
        min=${String(selected.min)}
        max=${String(selected.max)}
        step=${String(selected.step)}
        .value=${selected.size}
        @sl-input=${selected.onSizeInput}
      ></sl-range>
      <sl-button class="hotspot-selection__delete" size="small" @click=${selected.onDelete}>
        <span slot="prefix">${renderDeleteIcon()}</span>
        ${msg("Delete")}
      </sl-button>
    </div>
  `
}

function getCanvasClass(input: CanvasPanelInput): string {
  return [
    input.canvasDropActive ? "drop-active" : "",
    input.hotspotsEnabled ? "hotspots-editable" : "",
    input.hotspotPlacementActive ? "placing-hotspot" : "",
  ]
    .filter(Boolean)
    .join(" ")
}

export function renderCanvasPanel(input: CanvasPanelInput): TemplateResult {
  return html`
    <sl-card class="panel panel--simulation">
      <div class="simulation-stage" title=${msg("Double-click to enlarge")}>
        <canvas
          id="simulation-canvas"
          width=${SIMULATION_CANVAS_WIDTH}
          height=${SIMULATION_CANVAS_HEIGHT}
          class=${getCanvasClass(input)}
          @dragover=${input.onCanvasDragOver}
          @dragleave=${input.onCanvasDragLeave}
          @drop=${input.onCanvasDrop}
          @pointerdown=${input.onCanvasPointerDown}
          @contextmenu=${input.onCanvasContextMenu}
          @dblclick=${input.onCanvasDoubleClick}
        ></canvas>
        <div class="actions simulation-actions">
          <button type="button" class="simulation-actions__icon-button simulation-actions__icon-button--play-pause" title=${input.isRunning ? msg("Pause") : msg("Start")} aria-label=${input.isRunning ? msg("Pause") : msg("Start")} @click=${input.onToggleSimulation}>
            ${input.isRunning ? renderPauseIcon() : renderPlayIcon()}
          </button>
          <button type="button" class="simulation-actions__icon-button" title=${msg("Reset simulation")} aria-label=${msg("Reset simulation")} @click=${input.onResetSimulation}>
            ${renderResetIcon()}
          </button>
          <button type="button" class="simulation-actions__icon-button" title=${msg("Snapshots")} aria-label=${msg("Snapshots")} @click=${input.onOpenSnapshots}>
            ${renderSnapshotsIcon()}
          </button>
        </div>
      </div>
      ${input.hotspotsEnabled && input.showHotspotToolbox
        ? html`
            <div class="hotspot-toolbox--map">
              <sl-button
                class=${input.hotspotPlacementActive ? "hotspot-toolbox__token hotspot-toolbox__token--active" : "hotspot-toolbox__token"}
                draggable="true"
                size="small"
                variant="default"
                @dragstart=${input.onHotspotTokenDragStart}
                @dragend=${input.onHotspotTokenDragEnd}
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
      ${input.hotspotsEnabled && input.selectedHotspot ? renderSelectedHotspot(input.selectedHotspot) : null}
    </sl-card>
  `
}
