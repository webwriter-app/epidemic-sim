import {html} from "lit"
import type {TemplateResult} from "lit"
import {msg} from "@lit/localize"
import {renderDeleteIcon} from "../rendering/action-icons"
import type {EpidemicModelType} from "../simulation/epidemic-models"
import type {SimulationSnapshot} from "../simulation/types"

type SnapshotRenderContext = {
  modelTypeLabel: (modelType: EpidemicModelType) => string
  formatDays: (frameCount: number) => string
  formatApprox: (value: number | null, digits?: number) => string
  onDelete: (id: string) => void
}

function renderSnapshotCard(snapshot: SimulationSnapshot, ctx: SnapshotRenderContext): TemplateResult {
  return html`
    <article class="snapshots-overlay__snapshot-card">
      <div class="snapshots-overlay__snapshot-head">
        <div class="snapshots-overlay__snapshot-meta">
          <span class="snapshots-overlay__snapshot-title">${snapshot.label}</span>
          <span class="snapshots-overlay__snapshot-time"
            >${msg("Time")} ${ctx.formatDays(snapshot.frameIndex)} ·
            ${new Date(snapshot.createdAt).toLocaleTimeString([], {hour: "2-digit", minute: "2-digit", second: "2-digit"})}</span
          >
        </div>
        <button
          type="button"
          class="snapshots-overlay__delete-button"
          title=${msg("Delete")}
          aria-label=${msg("Delete")}
          @click=${() => ctx.onDelete(snapshot.id)}
        >
          ${renderDeleteIcon()}
        </button>
      </div>
      ${snapshot.chartImageJpeg ? html`<img class="snapshots-overlay__snapshot-image" src=${snapshot.chartImageJpeg} alt=${msg("SIR chart snapshot")} loading="lazy" />` : null}
      <sl-details class="snapshots-overlay__snapshot-details" summary=${msg("Details")}>
        <div class="snapshots-overlay__snapshot-grid">
          <span>${msg("Model type")}: <strong>${ctx.modelTypeLabel(snapshot.config.modelType)}</strong></span>
          <span>${msg("Population")}: <strong>${snapshot.config.population}</strong></span>
          <span>${msg("Speed")}: <strong>${snapshot.config.speed.toFixed(1)}</strong></span>
          <span>${msg("Infection probability")}: <strong>${Math.round(snapshot.config.infectionProbability * 100)}%</strong></span>
          <span>${msg("Recovery duration")}: <strong>${ctx.formatDays(snapshot.config.recoveryDuration)}</strong></span>
          <span>${msg("R0 (approx)")}: <strong>${ctx.formatApprox(snapshot.estimatedR0)}</strong></span>
          <span>${msg("Time")}: <strong>${ctx.formatDays(snapshot.frameIndex)}</strong></span>
        </div>
      </sl-details>
    </article>
  `
}

type SnapshotsOverlayInput = {
  open: boolean
  snapshots: SimulationSnapshot[]
  onBackdropClick: (event: Event) => void
  onCreateSnapshot: () => void
  onClose: () => void
  context: SnapshotRenderContext
}

export function renderSnapshotsOverlay(input: SnapshotsOverlayInput): TemplateResult | null {
  if (!input.open) {
    return null
  }
  return html`
    <section class="snapshots-overlay" @click=${input.onBackdropClick}>
      <article class="snapshots-overlay__dialog" role="dialog" aria-modal="true">
        <header class="snapshots-overlay__header">
          <h3>${msg("Snapshots gallery")}</h3>
          <div class="snapshots-overlay__actions">
            <sl-button size="small" @click=${input.onCreateSnapshot}>${msg("Create snapshot")}</sl-button>
            <sl-button size="small" @click=${input.onClose}>${msg("Close")}</sl-button>
          </div>
        </header>
        ${input.snapshots.length === 0
          ? html`<div class="snapshots-overlay__empty">${msg("No snapshots yet.")}</div>`
          : html`<div class="snapshots-overlay__grid">${input.snapshots.map((snapshot) => renderSnapshotCard(snapshot, input.context))}</div>`}
      </article>
    </section>
  `
}
