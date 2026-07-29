import {msg} from "@lit/localize"
import type {ChartInsightData} from "../components/chart-insights-view"
import {
  computeChartInsights,
  estimateBasicReproductionNumber,
  formatApprox,
  formatPercent,
} from "../analytics/chart-insights"
import {drawChart} from "../rendering/chart-renderer"
import type {ChartSeries} from "../rendering/chart-renderer"
import {getChartCompartments, type ChartCompartment, type EpidemicModelType} from "../simulation/epidemic-models"
import {pushHistoryValue, resetHistory} from "../simulation/history"
import {FRAMES_PER_DAY, formatFrameCountAsDays} from "../simulation/time"
import type {SimulationConfig} from "../simulation/types"

export type ChartRuntimeCounts = {
  susceptible: number
  exposed: number
  infected: number
  recovered: number
  dead: number
}

export class ChartRuntime {
  private readonly historyLimit = 2000
  susceptibleHistory: number[] = []
  exposedHistory: number[] = []
  infectedHistory: number[] = []
  recoveredHistory: number[] = []
  deadHistory: number[] = []
  epidemicEnded = false
  hadInfection = false

  reset(): void {
    this.susceptibleHistory = resetHistory()
    this.exposedHistory = resetHistory()
    this.infectedHistory = resetHistory()
    this.recoveredHistory = resetHistory()
    this.deadHistory = resetHistory()
    this.epidemicEnded = false
    this.hadInfection = false
  }

  recordPoint(
    frameIndex: number,
    counts: ChartRuntimeCounts,
    hasActiveInfection: boolean,
    waveFinished: boolean,
  ): void {
    if (hasActiveInfection) {
      this.hadInfection = true
    }

    if (this.epidemicEnded) {
      return
    }

    const waveEnded = this.hadInfection && waveFinished
    const isFullDayCheckpoint = frameIndex % FRAMES_PER_DAY === 0
    if (!isFullDayCheckpoint) {
      if (waveEnded) {
        this.epidemicEnded = true
      }
      return
    }

    pushHistoryValue(this.susceptibleHistory, counts.susceptible, this.historyLimit)
    pushHistoryValue(this.exposedHistory, counts.exposed, this.historyLimit)
    pushHistoryValue(this.infectedHistory, counts.infected, this.historyLimit)
    pushHistoryValue(this.recoveredHistory, counts.recovered, this.historyLimit)
    pushHistoryValue(this.deadHistory, counts.dead, this.historyLimit)
    if (waveEnded) {
      this.epidemicEnded = true
    }
  }

  estimateR0(recoveryDuration: number): number | null {
    return estimateBasicReproductionNumber(this.infectedHistory, recoveryDuration)
  }

  buildDayLabels(series: ChartSeries[]): string[] {
    const length = series.reduce((maxLength, entry) => Math.max(maxLength, entry.values.length), 0)
    return Array.from({length}, (_, dayIndex) => String(dayIndex))
  }

  buildSeries(config: SimulationConfig): ChartSeries[] {
    const compartmentSeries: Record<ChartCompartment, ChartSeries> = {
      susceptible: {label: msg("Susceptible"), values: this.susceptibleHistory, color: "#2563eb"},
      exposed: {label: msg("Exposed"), values: this.exposedHistory, color: "#f59e0b"},
      infected: {label: msg("Infected"), values: this.infectedHistory, color: "#dc2626"},
      recovered: {label: msg("Recovered"), values: this.recoveredHistory, color: "#16a34a"},
      dead: {label: msg("Dead"), values: this.deadHistory, color: "#64748b"},
    }
    return getChartCompartments(config.modelType).map((compartment) => compartmentSeries[compartment])
  }

  draw(
    config: SimulationConfig,
    compactCanvas: HTMLCanvasElement | null,
    enlargedCanvas: HTMLCanvasElement | null,
    chartOverlayOpen: boolean,
  ): void {
    const xAxisTitle = msg("Time (days)")
    if (compactCanvas) {
      const compactSeries = this.buildSeries(config)
      drawChart(compactCanvas, config.population, compactSeries, {
        labels: this.buildDayLabels(compactSeries),
        xAxisTitle,
      })
    }
    if (chartOverlayOpen && enlargedCanvas) {
      const enlargedSeries = this.buildSeries(config)
      drawChart(enlargedCanvas, config.population, enlargedSeries, {
        labels: this.buildDayLabels(enlargedSeries),
        xAxisTitle,
      })
    }
  }

  getInsightsOverlayTitle(modelType: EpidemicModelType): string {
    if (modelType === "seir") {
      return msg("SEIR insights")
    }
    if (modelType === "seird") {
      return msg("SEIRD insights")
    }
    if (modelType === "sirs") {
      return msg("SIRS insights")
    }
    if (modelType === "sird") {
      return msg("SIRD insights")
    }
    return msg("SIR insights")
  }

  buildInsightViewData(frameIndex: number, counts: ChartRuntimeCounts, config: SimulationConfig): ChartInsightData {
    const insights = computeChartInsights({
      infectedHistory: this.infectedHistory,
      frameIndex,
      population: config.population,
      recoveryDuration: config.recoveryDuration,
      epidemicEnded: this.epidemicEnded,
      susceptibleCount: counts.susceptible,
      exposedCount: counts.exposed,
      infectedCount: counts.infected,
      recoveredCount: counts.recovered,
      deadCount: counts.dead,
    })
    const population = Math.max(1, config.population)
    const peakShare = insights.peakInfected / population
    const herdThresholdLabel =
      insights.herdImmunityThreshold === null ? "–" : formatPercent(insights.herdImmunityThreshold)
    return {
      elapsedTime: formatFrameCountAsDays(insights.currentFrame),
      estimatedR0: formatApprox(insights.estimatedR0),
      herdImmunityThreshold: herdThresholdLabel,
      currentSusceptible: `${Math.round(insights.currentSusceptible)} (${formatPercent(insights.currentSusceptibleShare)})`,
      currentExposed:
        config.modelType === "seir" || config.modelType === "seird"
          ? `${Math.round(insights.currentExposed)} (${formatPercent(insights.currentExposedShare)})`
          : undefined,
      currentInfected: `${Math.round(insights.currentInfected)} (${formatPercent(insights.currentInfectedShare)})`,
      currentRecovered: `${Math.round(insights.currentRecovered)} (${formatPercent(insights.currentRecoveredShare)})`,
      currentDead:
        config.modelType === "sird" || config.modelType === "seird"
          ? `${Math.round(insights.currentDead)} (${formatPercent(insights.currentDeadShare)})`
          : undefined,
      finalRecoveredShare: insights.finalRecoveredShare === null ? "–" : formatPercent(insights.finalRecoveredShare),
      peakInfected: `${Math.round(insights.peakInfected)} (${formatPercent(peakShare)})`,
      peakTime: formatFrameCountAsDays(insights.peakFrame),
    }
  }
}
