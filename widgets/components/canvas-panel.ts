import {html} from "lit"
import type {TemplateResult} from "lit"
import {msg} from "@lit/localize"
import {renderPauseIcon, renderPlayIcon, renderResetIcon, renderSnapshotsIcon} from "../rendering/action-icons"

type CanvasPanelInput = {
  canvasDropActive: boolean
  hotspotsEnabled: boolean
  showHotspotToolbox: boolean
  isRunning: boolean
  onCanvasDragOver: (event: DragEvent) => void
  onCanvasDragLeave: () => void
  onCanvasDrop: (event: DragEvent) => void
  onCanvasPointerDown: (event: PointerEvent) => void
  onCanvasContextMenu: (event: MouseEvent) => void
  onHotspotTokenDragStart: (event: DragEvent) => void
  onHotspotTokenDragEnd: () => void
  onToggleSimulation: () => void
  onResetSimulation: () => void
  onOpenSnapshots: () => void
}

export function renderCanvasPanel(input: CanvasPanelInput): TemplateResult {
  return html`
    <sl-card class="panel panel--simulation">
      <canvas
        id="simulation-canvas"
        width="600"
        height="360"
        class=${input.canvasDropActive ? "drop-active" : ""}
        @dragover=${input.onCanvasDragOver}
        @dragleave=${input.onCanvasDragLeave}
        @drop=${input.onCanvasDrop}
        @pointerdown=${input.onCanvasPointerDown}
        @contextmenu=${input.onCanvasContextMenu}
      ></canvas>
      ${input.hotspotsEnabled && input.showHotspotToolbox
        ? html`
            <div class="hotspot-toolbox--map">
              <sl-button class="hotspot-toolbox__token" draggable="true" size="small" variant="default" @dragstart=${input.onHotspotTokenDragStart} @dragend=${input.onHotspotTokenDragEnd}>
                ${msg("H")}
              </sl-button>
              <sl-tag class="hotspot-toolbox__notice" variant="primary">${msg("Drag this hotspot into the simulation map.")}</sl-tag>
            </div>
          `
        : null}
      <div class="actions simulation-actions">
        <button type="button" class="simulation-actions__icon-button" title=${input.isRunning ? msg("Pause") : msg("Start")} aria-label=${input.isRunning ? msg("Pause") : msg("Start")} @click=${input.onToggleSimulation}>
          ${input.isRunning ? renderPauseIcon() : renderPlayIcon()}
        </button>
        <button type="button" class="simulation-actions__icon-button" title=${msg("Reset simulation")} aria-label=${msg("Reset simulation")} @click=${input.onResetSimulation}>
          ${renderResetIcon()}
        </button>
        <button type="button" class="simulation-actions__icon-button" title=${msg("Snapshots")} aria-label=${msg("Snapshots")} @click=${input.onOpenSnapshots}>
          ${renderSnapshotsIcon()}
        </button>
      </div>
    </sl-card>
  `
}
