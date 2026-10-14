import {html} from "lit"
import type {TemplateResult} from "lit"
import {msg} from "@lit/localize"

export type ChartInsightData = {
  elapsedTime: string
  estimatedR0: string
  herdImmunityThreshold: string
  currentSusceptible: string
  currentExposed?: string
  currentInfected: string
  currentRecovered: string
  currentDead?: string
  finalRecoveredShare: string
  peakInfected: string
  peakTime: string
}

export function renderInsights(insights: ChartInsightData): TemplateResult {
  return html`
    <div class="insights">
      <div class="insights__row">
        <div class="insights__item"><span>${msg("Elapsed time")}</span><strong>${insights.elapsedTime}</strong></div>
        <div class="insights__item"><span>${msg("R0 (approx)")}</span><strong>${insights.estimatedR0}</strong></div>
        <div class="insights__item"><span>${msg("Herd immunity threshold")}</span><strong>${insights.herdImmunityThreshold}</strong></div>
      </div>
      <div class="insights__row">
        <div class="insights__item"><span>${msg("Current susceptible")}</span><strong>${insights.currentSusceptible}</strong></div>
        ${insights.currentExposed ? html`<div class="insights__item"><span>${msg("Current exposed")}</span><strong>${insights.currentExposed}</strong></div>` : null}
        <div class="insights__item"><span>${msg("Current infected")}</span><strong>${insights.currentInfected}</strong></div>
        <div class="insights__item"><span>${msg("Current recovered")}</span><strong>${insights.currentRecovered}</strong></div>
        ${insights.currentDead ? html`<div class="insights__item"><span>${msg("Current dead")}</span><strong>${insights.currentDead}</strong></div>` : null}
      </div>
      <div class="insights__row">
        <div class="insights__item"><span>${msg("Final recovered share")}</span><strong>${insights.finalRecoveredShare}</strong></div>
        <div class="insights__item"><span>${msg("Peak infected")}</span><strong>${insights.peakInfected}</strong></div>
        <div class="insights__item"><span>${msg("Peak time")}</span><strong>${insights.peakTime}</strong></div>
      </div>
    </div>
  `
}
