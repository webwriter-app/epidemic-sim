import iconSnapshots from "@tabler/icons/outline/photo.svg"
import iconInsights from "@tabler/icons/outline/chart-bar.svg"
import iconFullscreen from "@tabler/icons/outline/maximize.svg"
import iconExitFullscreen from "@tabler/icons/outline/minimize.svg"
import { sourceMsg } from "../../localization/localizer";
import type { MsgFn } from "@lit/localize";
import {html} from "lit"
import type {TemplateResult} from "lit"
import type {DragCommitEvent} from "./hotspot-editing-controller"
import {renderCanvasPanel, type SelectedHotspotInput} from "./canvas-panel"
import {renderInsights, type ChartInsightData} from "./chart-insights-view"
import {renderSnapshotsOverlay} from "./snapshots-overlay"
import {renderMenu} from "./rendering/menu-renderer"
import type {RenderMenuOptions} from "./rendering/menu-renderer"
import type {SimulationSnapshot} from "../model/simulation/types"
import type {EpidemicModelType} from "../model/simulation/epidemic-models"

type WidgetLayoutInput = {
  hasVisibleMenuControls: boolean
  chartContextMenuOpen: boolean
  chartContextMenuPosition: {x: number; y: number}
  onMainContentClick: () => void
  onChartContextMenu: (event: MouseEvent) => void
  onCreateSnapshot: () => void
  hotspotPlacementActive: boolean
  selectedHotspot: SelectedHotspotInput | null
  hotspotsEnabled: boolean
  showHotspotToolbox: boolean
  isRunning: boolean
  isFullscreen: boolean
  onCanvasDragCommit: (event: DragCommitEvent) => void
  onCanvasPointerDown: (event: PointerEvent) => void
  onCanvasPointerMove: (event: PointerEvent) => void
  onCanvasContextMenu: (event: MouseEvent) => void
  onCanvasKeyDown: (event: KeyboardEvent) => void
  printImages: {chart: string; map: string} | null
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

export function renderWidgetLayout(input: WidgetLayoutInput, msg: MsgFn = sourceMsg): TemplateResult {
  const showSidebarInsights = input.insightsOpen && !input.isFullscreen
  return html`
    <section class="widget-shell ${input.hasVisibleMenuControls || showSidebarInsights ? "has-menu" : ""}">
      <p class="print-hint">${msg("Printed snapshot of the epidemic simulation. Author options and interactive controls are omitted.")}</p>
      <section class="main-content" @click=${input.onMainContentClick}>
        <section class="layout ${input.hotspotsEnabled ? "layout--hotspots" : ""}">
          <sl-card class="panel panel--chart" part="chart">
            <div class="chart-wrap" @contextmenu=${input.onChartContextMenu}>
              <canvas id="chart-canvas"></canvas>
              ${input.printImages?.chart ? html`<img class="print-image" alt="" src=${input.printImages.chart}>` : null}
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
            hotspotPlacementActive: input.hotspotPlacementActive,
            selectedHotspot: input.selectedHotspot,
            hotspotsEnabled: input.hotspotsEnabled,
            showHotspotToolbox: input.showHotspotToolbox,
            isRunning: input.isRunning,
            onCanvasDragCommit: input.onCanvasDragCommit,
            onCanvasPointerDown: input.onCanvasPointerDown,
            onCanvasPointerMove: input.onCanvasPointerMove,
            onCanvasContextMenu: input.onCanvasContextMenu,
            onCanvasKeyDown: input.onCanvasKeyDown,
            printImage: input.printImages?.map ?? null,
            onHotspotTokenClick: input.onHotspotTokenClick,
            onToggleSimulation: input.onToggleSimulation,
            onResetSimulation: input.onResetSimulation,
          }, msg)}
        </section>
        ${
          input.isFullscreen
            ? html`
                <section class="fullscreen-insights">
                  <h3 class="fullscreen-insights__title">${input.insightsTitle}</h3>
                  ${renderInsights(input.chartInsights, msg)}
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
                    ${renderInsights(input.chartInsights, msg)}
                  </div>
                </aside>
              `
            : input.studentMenu
              ? renderMenu(input.studentMenu, msg)
              : null
        }

        <div class="widget-top-actions">
          <button
            type="button"
            class="simulation-actions__icon-button"
            aria-label=${msg("Snapshots")}
            @click=${input.onOpenSnapshots}
          >
            <sl-icon src=${iconSnapshots}></sl-icon>
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
                    <sl-icon src=${iconInsights}></sl-icon>
                  </button>
                `
          }
          <button
            type="button"
            class="simulation-actions__icon-button"
            aria-label=${input.isFullscreen ? msg("Exit fullscreen") : msg("Fullscreen")}
            @click=${input.onToggleFullscreen}
          >
            <sl-icon src=${input.isFullscreen ? iconExitFullscreen : iconFullscreen}></sl-icon>
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
      }, msg)}
    </section>
  `
}
