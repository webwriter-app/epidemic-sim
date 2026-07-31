import {msg} from "@lit/localize"
import {drawChart} from "../rendering/chart-renderer"
import type {ChartSeries} from "../rendering/chart-renderer"
import type {Hotspot, SimulationConfig, SimulationSnapshot} from "../simulation/types"

export type SnapshotCaptureContext = {
  chartOverlayOpen: boolean
  enlargedChartCanvas: HTMLCanvasElement | null
  chartCanvas: HTMLCanvasElement | null
  population: number
  buildSeries: () => ChartSeries[]
  buildDayLabels: (series: ChartSeries[]) => string[]
}

export type SnapshotCreateInput = {
  config: SimulationConfig
  frameIndex: number
  epidemicEnded: boolean
  susceptibleCount: number
  exposedCount: number
  infectedCount: number
  recoveredCount: number
  deadCount: number
  susceptibleHistory: number[]
  exposedHistory: number[]
  infectedHistory: number[]
  recoveredHistory: number[]
  deadHistory: number[]
  userHotspots: Hotspot[]
  estimatedR0: number | null
  chartImageJpeg: string | null
}

function cloneHotspots(hotspots: Hotspot[]): Hotspot[] {
  return hotspots.map((hotspot) => ({
    ...hotspot,
    rect: {...hotspot.rect},
  }))
}

export function captureChartSnapshotImage(ctx: SnapshotCaptureContext): string | null {
  const sourceCanvas = ctx.chartOverlayOpen && ctx.enlargedChartCanvas ? ctx.enlargedChartCanvas : ctx.chartCanvas
  if (!sourceCanvas) {
    return null
  }
  const series = ctx.buildSeries()
  const labels = ctx.buildDayLabels(series)
  const xAxisTitle = msg("Time (days)")
  try {
    drawChart(sourceCanvas, ctx.population, series, {showLegend: false, labels, xAxisTitle})
    const exportCanvas = document.createElement("canvas")
    exportCanvas.width = sourceCanvas.width
    exportCanvas.height = sourceCanvas.height
    const exportContext = exportCanvas.getContext("2d")
    if (!exportContext) {
      drawChart(sourceCanvas, ctx.population, series, {showLegend: true, labels, xAxisTitle})
      return null
    }
    exportContext.fillStyle = "#ffffff"
    exportContext.fillRect(0, 0, exportCanvas.width, exportCanvas.height)
    exportContext.drawImage(sourceCanvas, 0, 0)
    const jpeg = exportCanvas.toDataURL("image/jpeg", 0.9)
    drawChart(sourceCanvas, ctx.population, series, {showLegend: true, labels, xAxisTitle})
    return jpeg
  } catch {
    drawChart(sourceCanvas, ctx.population, series, {showLegend: true, labels, xAxisTitle})
    return null
  }
}

export class SnapshotService {
  private nextSnapshotId = 1
  snapshots: SimulationSnapshot[] = []

  hydrate(snapshots: SimulationSnapshot[], nextSnapshotId: number): void {
    this.snapshots = snapshots.map((snapshot) => ({
      ...snapshot,
      config: {...snapshot.config},
      susceptibleHistory: [...snapshot.susceptibleHistory],
      exposedHistory: [...snapshot.exposedHistory],
      infectedHistory: [...snapshot.infectedHistory],
      recoveredHistory: [...snapshot.recoveredHistory],
      deadHistory: [...snapshot.deadHistory],
      userHotspots: cloneHotspots(snapshot.userHotspots),
      chartImageJpeg: snapshot.chartImageJpeg ?? null,
    }))
    this.nextSnapshotId = nextSnapshotId
  }

  getPersistedMeta(): {snapshots: SimulationSnapshot[]; nextSnapshotId: number} {
    return {
      snapshots: this.snapshots,
      nextSnapshotId: this.nextSnapshotId,
    }
  }

  create(input: SnapshotCreateInput): SimulationSnapshot {
    const snapshotId = `snapshot-${this.nextSnapshotId}`
    this.nextSnapshotId += 1
    const snapshot: SimulationSnapshot = {
      id: snapshotId,
      label: `${msg("Snapshot")} ${this.nextSnapshotId - 1}`,
      createdAt: Date.now(),
      chartImageJpeg: input.chartImageJpeg,
      estimatedR0: input.estimatedR0,
      config: {...input.config},
      frameIndex: input.frameIndex,
      epidemicEnded: input.epidemicEnded,
      susceptibleCount: input.susceptibleCount,
      exposedCount: input.exposedCount,
      infectedCount: input.infectedCount,
      recoveredCount: input.recoveredCount,
      deadCount: input.deadCount,
      susceptibleHistory: [...input.susceptibleHistory],
      exposedHistory: [...input.exposedHistory],
      infectedHistory: [...input.infectedHistory],
      recoveredHistory: [...input.recoveredHistory],
      deadHistory: [...input.deadHistory],
      userHotspots: cloneHotspots(input.userHotspots),
    }
    this.snapshots = [snapshot, ...this.snapshots]
    return snapshot
  }

  delete(snapshotId: string): void {
    this.snapshots = this.snapshots.filter((snapshot) => snapshot.id !== snapshotId)
  }
}
