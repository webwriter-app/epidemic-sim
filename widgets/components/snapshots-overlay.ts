import {html} from "lit"
import type {TemplateResult} from "lit"
import {msg} from "@lit/localize"
import {renderDeleteIcon, renderDownloadIcon} from "../rendering/action-icons"
import type {EpidemicModelType} from "../simulation/epidemic-models"
import type {SimulationSnapshot} from "../simulation/types"

type SnapshotRenderContext = {
  modelTypeLabel: (modelType: EpidemicModelType) => string
  formatDays: (frameCount: number) => string
  formatApprox: (value: number | null, digits?: number) => string
  onDelete: (id: string) => void
  onDownloadImage: (id: string) => void
  onDownloadTable: (id: string) => void
}

function renderSnapshotCard(snapshot: SimulationSnapshot, ctx: SnapshotRenderContext): TemplateResult {
  return html`
    <article class="snapshots-overlay__snapshot-card">
      <div class="snapshots-overlay__snapshot-head">
        <div class="snapshots-overlay__snapshot-meta">
          <span class="snapshots-overlay__snapshot-title">${snapshot.label}</span>
          <span class="snapshots-overlay__snapshot-time"
            >${msg("Time")} ${ctx.formatDays(snapshot.frameIndex)} ·
            ${new Date(snapshot.createdAt).toLocaleString([], {day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit"})}</span
          >
        </div>
        <div class="snapshots-overlay__snapshot-actions">
          <sl-dropdown placement="bottom-end" hoist>
            <button
              slot="trigger"
              type="button"
              class="snapshots-overlay__download-button"
              aria-label=${msg("Download")}
            >
              ${renderDownloadIcon()}
            </button>
            <sl-menu
              @sl-select=${(event: CustomEvent<{item: {value: string}}>) =>
                event.detail.item.value === "csv" ? ctx.onDownloadTable(snapshot.id) : ctx.onDownloadImage(snapshot.id)}
            >
              <sl-menu-item value="png">${msg("Image (PNG)")}</sl-menu-item>
              <sl-menu-item value="csv">${msg("Table (CSV)")}</sl-menu-item>
            </sl-menu>
          </sl-dropdown>
          <button
            type="button"
            class="snapshots-overlay__delete-button"
            aria-label=${msg("Delete")}
            @click=${() => ctx.onDelete(snapshot.id)}
          >
            ${renderDeleteIcon()}
          </button>
        </div>
      </div>
      <div class="snapshots-overlay__snapshot-chart">
        <canvas data-snapshot-id=${snapshot.id} role="img" aria-label=${msg("SIR chart snapshot")}></canvas>
      </div>
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
  onBackdropClick: (event: MouseEvent) => void
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
