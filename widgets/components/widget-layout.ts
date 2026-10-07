import {html} from "lit"
import type {TemplateResult} from "lit"
import {msg} from "@lit/localize"
import {renderCanvasPanel, type SelectedHotspotInput} from "./canvas-panel"
import {renderChartOverlay, type InsightsOverlayView} from "./chart-overlay"
import type {ChartInsightData} from "./chart-insights-view"
import {renderSnapshotsOverlay} from "./snapshots-overlay"
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
  onChartPanelDoubleClick: () => void
  onSimulationPanelDoubleClick: () => void
  onChartContextMenu: (event: MouseEvent) => void
  onCreateSnapshot: () => void
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
  onHotspotTokenDragStart: (event: DragEvent) => void
  onHotspotTokenDragEnd: () => void
  onHotspotTokenClick: () => void
  onToggleSimulation: () => void
  onResetSimulation: () => void
  onOpenSnapshots: () => void
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
  chartOverlayOpen: boolean
  chartOverlayTitle: string
  insightsView: InsightsOverlayView
  modelTabLabel: string
  chartInsights: ChartInsightData
  onInsightsViewChange: (view: InsightsOverlayView) => void
  onChartBackdropClick: (event: MouseEvent) => void
  onCloseChartOverlay: () => void
}

export function renderWidgetLayout(input: WidgetLayoutInput): TemplateResult {
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
    <section class="widget-shell ${input.hasVisibleMenuControls ? "has-menu" : ""}">
      <p class="print-hint">${msg("Printed snapshot of the epidemic simulation. Author options and interactive controls are omitted.")}</p>
      <section class="main-content" @click=${input.onMainContentClick}>
        <section class="layout">
          <sl-card class="panel panel--chart">
            <div
              class="chart-wrap chart-wrap--interactive"
              @dblclick=${input.onChartPanelDoubleClick}
              @contextmenu=${input.onChartContextMenu}
              title=${msg("Double-click to enlarge")}
            >
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
            onCanvasDoubleClick: input.onSimulationPanelDoubleClick,
            onHotspotTokenDragStart: input.onHotspotTokenDragStart,
            onHotspotTokenDragEnd: input.onHotspotTokenDragEnd,
            onHotspotTokenClick: input.onHotspotTokenClick,
            onToggleSimulation: input.onToggleSimulation,
            onResetSimulation: input.onResetSimulation,
            onOpenSnapshots: input.onOpenSnapshots,
          })}
        </section>
      </section>

      ${input.studentMenu ? renderMenu(input.studentMenu) : null}

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

      ${renderChartOverlay({
        open: input.chartOverlayOpen,
        title: input.chartOverlayTitle,
        view: input.insightsView,
        modelTabLabel: input.modelTabLabel,
        insights: input.chartInsights,
        onViewChange: input.onInsightsViewChange,
        onBackdropClick: input.onChartBackdropClick,
        onCreateSnapshot: input.onCreateSnapshot,
        onClose: input.onCloseChartOverlay,
      })}
    </section>
  `
}
