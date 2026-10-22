import {msg} from "@lit/localize"
import {destroyChart, drawChart} from "../rendering/chart-renderer"
import {buildChartDayLabels, buildChartSeries} from "./chart-runtime"
import type {Hotspot, SimulationConfig, SimulationSnapshot} from "../simulation/types"

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
}

function cloneHotspots(hotspots: Hotspot[]): Hotspot[] {
  return hotspots.map((hotspot) => ({
    ...hotspot,
    rect: {...hotspot.rect},
  }))
}

export function drawSnapshotChart(
  canvas: HTMLCanvasElement,
  snapshot: SimulationSnapshot,
  options?: {showLegend?: boolean},
): void {
  const series = buildChartSeries(snapshot.config.modelType, snapshot)
  drawChart(canvas, snapshot.config.population, series, {
    showLegend: options?.showLegend ?? false,
    labels: buildChartDayLabels(series),
    xAxisTitle: msg("Time (days)"),
  })
}

export function renderSnapshotChartPng(container: Node, snapshot: SimulationSnapshot): string | null {
  const wrapper = document.createElement("div")
  wrapper.style.cssText = "position: fixed; left: -10000px; top: 0; width: 1200px; height: 600px;"
  const canvas = document.createElement("canvas")
  wrapper.appendChild(canvas)
  container.appendChild(wrapper)
  try {
    drawSnapshotChart(canvas, snapshot, {showLegend: true})
    const exportCanvas = document.createElement("canvas")
    exportCanvas.width = canvas.width
    exportCanvas.height = canvas.height
    const exportContext = exportCanvas.getContext("2d")
    if (!exportContext) {
      return null
    }
    exportContext.fillStyle = "#ffffff"
    exportContext.fillRect(0, 0, exportCanvas.width, exportCanvas.height)
    exportContext.drawImage(canvas, 0, 0)
    return exportCanvas.toDataURL("image/png")
  } catch {
    return null
  } finally {
    destroyChart(canvas)
    wrapper.remove()
  }
}

function escapeCsvValue(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

export function buildSnapshotCsv(snapshot: SimulationSnapshot): string {
  const series = buildChartSeries(snapshot.config.modelType, snapshot)
  const dayLabels = buildChartDayLabels(series)
  const header = [msg("Day"), ...series.map((entry) => entry.label)]
  const rows = dayLabels.map((day, dayIndex) => [day, ...series.map((entry) => String(entry.values[dayIndex] ?? ""))])
  return [header, ...rows].map((row) => row.map(escapeCsvValue).join(",")).join("\n")
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
