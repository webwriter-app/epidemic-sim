import {html} from "lit"
import type {TemplateResult} from "lit"
import {msg} from "@lit/localize"
import {SIMULATION_CANVAS_HEIGHT, SIMULATION_CANVAS_WIDTH} from "../simulation/canvas-dimensions"
import {renderChartOverlayInsights, type ChartInsightData} from "./chart-insights-view"

export type InsightsOverlayView = "model" | "simulation"

type ChartOverlayInput = {
  open: boolean
  title: string
  view: InsightsOverlayView
  modelTabLabel: string
  insights: ChartInsightData
  onViewChange: (view: InsightsOverlayView) => void
  onBackdropClick: (event: MouseEvent) => void
  onCreateSnapshot: () => void
  onClose: () => void
}

export function renderChartOverlay(input: ChartOverlayInput): TemplateResult | null {
  if (!input.open) {
    return null
  }
  const isModelView = input.view === "model"
  return html`
    <section class="chart-overlay" @click=${input.onBackdropClick}>
      <article class="chart-overlay__dialog" role="dialog" aria-modal="true" @click=${(event: Event) => event.stopPropagation()}>
        <header class="chart-overlay__header">
          <div class="chart-overlay__header-main">
            <h3>${input.title}</h3>
            <div class="chart-overlay__tabs" role="tablist">
              <button
                type="button"
                class="chart-overlay__tab ${isModelView ? "is-active" : ""}"
                role="tab"
                aria-selected=${isModelView}
                @click=${() => input.onViewChange("model")}
              >
                ${input.modelTabLabel}
              </button>
              <button
                type="button"
                class="chart-overlay__tab ${!isModelView ? "is-active" : ""}"
                role="tab"
                aria-selected=${!isModelView}
                @click=${() => input.onViewChange("simulation")}
              >
                ${msg("Simulation")}
              </button>
            </div>
          </div>
          <div class="chart-overlay__actions">
            <sl-button size="small" @click=${input.onCreateSnapshot}>${msg("Create snapshot")}</sl-button>
            <sl-button size="small" @click=${input.onClose}>${msg("Close")}</sl-button>
          </div>
        </header>
        ${
          isModelView
            ? html`
                <div class="chart-overlay__chart-wrap">
                  <canvas id="chart-canvas-enlarged"></canvas>
                </div>
              `
            : html`
                <div class="chart-overlay__simulation-wrap">
                  <canvas
                    id="simulation-canvas-enlarged"
                    width=${SIMULATION_CANVAS_WIDTH}
                    height=${SIMULATION_CANVAS_HEIGHT}
                  ></canvas>
                </div>
              `
        }
        ${renderChartOverlayInsights(input.insights)}
      </article>
    </section>
  `
}
