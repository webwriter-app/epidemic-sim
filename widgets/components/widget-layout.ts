import {html} from "lit"
import type {TemplateResult} from "lit"
import {msg} from "@lit/localize"
import {renderCanvasPanel, type SelectedHotspotInput} from "./canvas-panel"
import {renderInsights, type ChartInsightData} from "./chart-insights-view"
import {renderSnapshotsOverlay} from "./snapshots-overlay"
import {
  renderExitFullscreenIcon,
  renderFullscreenIcon,
  renderInsightsIcon,
  renderSnapshotsIcon,
} from "../rendering/action-icons"
import {renderMenu} from "../rendering/menu-renderer"
import type {RenderMenuOptions} from "../rendering/menu-renderer"
import {renderTeacherOptions} from "../rendering/teacher-options-renderer"
import type {RenderTeacherOptionsInput} from "../rendering/teacher-options-renderer"
import type {SimulationSnapshot} from "../simulation/types"
import type {EpidemicModelType} from "../simulation/epidemic-models"

export type WidgetLayoutInput = {
  hasVisibleMenuControls: boolean
  showTeacherOptions: boolean
  teacherOptions: RenderTeacherOptionsInput
  chartContextMenuOpen: boolean
  chartContextMenuPosition: {x: number; y: number}
  onMainContentClick: () => void
  onChartContextMenu: (event: MouseEvent) => void
  onCreateSnapshot: () => void
  canvasDropActive: boolean
  hotspotPlacementActive: boolean
  selectedHotspot: SelectedHotspotInput | null
  hotspotsEnabled: boolean
  showHotspotToolbox: boolean
  isRunning: boolean
  isFullscreen: boolean
  onCanvasDragOver: (event: DragEvent) => void
  onCanvasDragLeave: () => void
  onCanvasDrop: (event: DragEvent) => void
  onCanvasPointerDown: (event: PointerEvent) => void
  onCanvasContextMenu: (event: MouseEvent) => void
  onHotspotTokenDragStart: (event: DragEvent) => void
  onHotspotTokenDragEnd: () => void
  onHotspotTokenClick: () => void
  onToggleSimulation: () => void
  onResetSimulation: () => void
  onOpenSnapshots: () => void
  onToggleInsights: () => void
  onToggleFullscreen: () => void
  studentMenu: RenderMenuOptions | null
  snapshotsOverlayOpen: boolean
  snapshots: SimulationSnapshot[]
  onSnapshotsBackdropClick: (event: MouseEvent) => void
  onCloseSnapshots: () => void
  getModelTypeLabel: (modelType: EpidemicModelType) => string
  formatDays: (frameCount: number) => string
  formatApprox: (value: number | null, digits?: number) => string
  onDeleteSnapshot: (snapshotId: string) => void
  onDownloadSnapshotImage: (snapshotId: string) => void
  onDownloadSnapshotTable: (snapshotId: string) => void
  insightsOpen: boolean
  insightsTitle: string
  chartInsights: ChartInsightData
}

export function renderWidgetLayout(input: WidgetLayoutInput): TemplateResult {
  const showSidebarInsights = input.insightsOpen && !input.isFullscreen
  return html`
    ${
      input.showTeacherOptions
        ? html`
            <div part="options" class="teacher-options-shell author-only">
              ${renderTeacherOptions(input.teacherOptions)}
            </div>
          `
        : null
    }
    <section class="widget-shell ${input.hasVisibleMenuControls || showSidebarInsights ? "has-menu" : ""}">
      <p class="print-hint">${msg("Printed snapshot of the epidemic simulation. Author options and interactive controls are omitted.")}</p>
      <section class="main-content" @click=${input.onMainContentClick}>
        <section class="layout ${input.hotspotsEnabled ? "layout--hotspots" : ""}">
          <sl-card class="panel panel--chart">
            <div class="chart-wrap" @contextmenu=${input.onChartContextMenu}>
              <canvas id="chart-canvas"></canvas>
            </div>
          </sl-card>
          ${
            input.chartContextMenuOpen
              ? html`
                  <div
                    class="chart-context-menu"
                    style=${`left: ${input.chartContextMenuPosition.x}px; top: ${input.chartContextMenuPosition.y}px;`}
                    @click=${(event: Event) => event.stopPropagation()}
                  >
                    <sl-button class="chart-context-menu__item" variant="text" size="small" @click=${input.onCreateSnapshot}>
                      ${msg("Create snapshot")}
                    </sl-button>
                  </div>
                `
              : null
          }

          ${renderCanvasPanel({
            canvasDropActive: input.canvasDropActive,
            hotspotPlacementActive: input.hotspotPlacementActive,
            selectedHotspot: input.selectedHotspot,
            hotspotsEnabled: input.hotspotsEnabled,
            showHotspotToolbox: input.showHotspotToolbox,
            isRunning: input.isRunning,
            onCanvasDragOver: input.onCanvasDragOver,
            onCanvasDragLeave: input.onCanvasDragLeave,
            onCanvasDrop: input.onCanvasDrop,
            onCanvasPointerDown: input.onCanvasPointerDown,
            onCanvasContextMenu: input.onCanvasContextMenu,
            onHotspotTokenDragStart: input.onHotspotTokenDragStart,
            onHotspotTokenDragEnd: input.onHotspotTokenDragEnd,
            onHotspotTokenClick: input.onHotspotTokenClick,
            onToggleSimulation: input.onToggleSimulation,
            onResetSimulation: input.onResetSimulation,
          })}
        </section>
        ${
          input.isFullscreen
            ? html`
                <section class="fullscreen-insights">
                  <h3 class="fullscreen-insights__title">${input.insightsTitle}</h3>
                  ${renderInsights(input.chartInsights)}
                </section>
              `
            : null
        }
      </section>

      <div class="side-panel">
        ${
          showSidebarInsights
            ? html`
                <aside class="side-menu side-menu--insights">
                  <div class="side-menu__section">
                    <div class="side-menu__title-row">
                      <h3 class="side-menu__title">${input.insightsTitle}</h3>
                    </div>
                    ${renderInsights(input.chartInsights)}
                  </div>
                </aside>
              `
            : input.studentMenu
              ? renderMenu(input.studentMenu)
              : null
        }

        <div class="widget-top-actions">
          <button
            type="button"
            class="simulation-actions__icon-button"
            aria-label=${msg("Snapshots")}
            @click=${input.onOpenSnapshots}
          >
            ${renderSnapshotsIcon()}
          </button>
          ${
            input.isFullscreen
              ? null
              : html`
                  <button
                    type="button"
                    class="simulation-actions__icon-button ${input.insightsOpen ? "is-active" : ""}"
                    aria-label=${msg("Insights")}
                    aria-pressed=${input.insightsOpen ? "true" : "false"}
                    @click=${input.onToggleInsights}
                  >
                    ${renderInsightsIcon()}
                  </button>
                `
          }
          <button
            type="button"
            class="simulation-actions__icon-button"
            aria-label=${input.isFullscreen ? msg("Exit fullscreen") : msg("Fullscreen")}
            @click=${input.onToggleFullscreen}
          >
            ${input.isFullscreen ? renderExitFullscreenIcon() : renderFullscreenIcon()}
          </button>
        </div>
      </div>

      ${renderSnapshotsOverlay({
        open: input.snapshotsOverlayOpen,
        snapshots: input.snapshots,
        onBackdropClick: input.onSnapshotsBackdropClick,
        onCreateSnapshot: input.onCreateSnapshot,
        onClose: input.onCloseSnapshots,
        context: {
          modelTypeLabel: input.getModelTypeLabel,
          formatDays: input.formatDays,
          formatApprox: input.formatApprox,
          onDelete: input.onDeleteSnapshot,
          onDownloadImage: input.onDownloadSnapshotImage,
          onDownloadTable: input.onDownloadSnapshotTable,
        },
      })}
    </section>
  `
}
