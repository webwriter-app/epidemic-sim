import {html} from "lit"
import type {TemplateResult} from "lit"
import {msg} from "@lit/localize"
import {renderChartOverlayInsights, type ChartInsightData} from "./chart-insights-view"

type ChartOverlayInput = {
  open: boolean
  title: string
  showFitToggle: boolean
  showApproximateFitOverlay: boolean
  insights: ChartInsightData
  onBackdropClick: (event: MouseEvent) => void
  onCreateSnapshot: () => void
  onClose: () => void
  onApproximateFitChange: (event: Event) => void
}

export function renderChartOverlay(input: ChartOverlayInput): TemplateResult | null {
  if (!input.open) {
    return null
  }
  return html`
    <section class="chart-overlay" @click=${input.onBackdropClick}>
      <article class="chart-overlay__dialog" role="dialog" aria-modal="true" @click=${(event: Event) => event.stopPropagation()}>
        <header class="chart-overlay__header">
          <h3>${input.title}</h3>
          <div class="chart-overlay__actions">
            <sl-button size="small" @click=${input.onCreateSnapshot}>${msg("Create snapshot")}</sl-button>
            <sl-button size="small" @click=${input.onClose}>${msg("Close")}</sl-button>
          </div>
        </header>
        ${input.showFitToggle
          ? html`
              <div class="chart-overlay__controls">
                <sl-switch class="chart-overlay__fit-switch" ?checked=${input.showApproximateFitOverlay} @sl-change=${input.onApproximateFitChange}>
                  ${msg("Show fit overlay")}
                </sl-switch>
              </div>
            `
          : null}
        <div class="chart-overlay__chart-wrap">
          <canvas id="chart-canvas-enlarged"></canvas>
        </div>
        ${renderChartOverlayInsights(input.insights)}
      </article>
    </section>
  `
}
