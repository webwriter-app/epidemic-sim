import type {MsgFn} from "@lit/localize"
import type {SimulationRun} from "../model/simulation/run"
import type {SimulationConfig, SimulationSnapshot} from "../model/simulation/types"
import type {CanvasHostController} from "./canvas-host-controller"
import type {ChartRuntime} from "./chart-runtime"
import {destroyChart} from "./rendering/chart-renderer"
import {buildSnapshotCsv, drawSnapshotChart, renderSnapshotChartPng, type SnapshotService} from "./snapshot-service"

export type SnapshotActionsHost = {
  msg: MsgFn
  service: SnapshotService
  canvasHost: CanvasHostController
  getRoot: () => ShadowRoot | null
  run: SimulationRun
  chartRuntime: ChartRuntime
  getConfig: () => SimulationConfig
  getHotspots: () => SimulationSnapshot["userHotspots"]
  /** Called after the stored snapshots changed: persist them and render again. */
  onChanged: () => void
}

/** Creating, deleting, exporting and drawing the saved snapshots. */
export class SnapshotActions {
  private chartIds = new Map<HTMLCanvasElement, string>()

  constructor(private readonly host: SnapshotActionsHost) {}

  create(): void {
    const {run, chartRuntime} = this.host
    const config = this.host.getConfig()
    this.host.service.create({
      config,
      frameIndex: run.frameIndex,
      epidemicEnded: chartRuntime.epidemicEnded,
      susceptibleCount: run.counts.susceptible,
      exposedCount: run.counts.exposed,
      infectedCount: run.counts.infected,
      recoveredCount: run.counts.recovered,
      deadCount: run.counts.dead,
      susceptibleHistory: [...chartRuntime.susceptibleHistory],
      exposedHistory: [...chartRuntime.exposedHistory],
      infectedHistory: [...chartRuntime.infectedHistory],
      recoveredHistory: [...chartRuntime.recoveredHistory],
      deadHistory: [...chartRuntime.deadHistory],
      userHotspots: this.host.getHotspots(),
      estimatedR0: chartRuntime.estimateR0(config.recoveryDuration),
    })
    this.host.onChanged()
  }

  delete(snapshotId: string): void {
    this.host.service.delete(snapshotId)
    this.host.onChanged()
  }

  downloadImage(snapshotId: string): void {
    const snapshot = this.find(snapshotId)
    const root = this.host.getRoot()
    if (!snapshot || !root) {
      return
    }
    const png = renderSnapshotChartPng(root, snapshot, this.host.msg)
    if (!png) {
      return
    }
    this.triggerDownload(png, `${snapshot.label}.png`)
  }

  downloadTable(snapshotId: string): void {
    const snapshot = this.find(snapshotId)
    if (!snapshot) {
      return
    }
    const csv = new Blob(["﻿", buildSnapshotCsv(snapshot, this.host.msg)], {type: "text/csv;charset=utf-8"})
    const url = URL.createObjectURL(csv)
    this.triggerDownload(url, `${snapshot.label}.csv`)
    window.setTimeout(() => URL.revokeObjectURL(url), 0)
  }

  drawCharts(): void {
    const canvases = this.host.canvasHost.queryCanvases(".snapshots-overlay__snapshot-chart canvas")
    for (const canvas of this.chartIds.keys()) {
      if (!canvases.includes(canvas)) {
        destroyChart(canvas)
        this.chartIds.delete(canvas)
      }
    }
    for (const canvas of canvases) {
      const snapshotId = canvas.dataset.snapshotId
      if (!snapshotId || this.chartIds.get(canvas) === snapshotId) {
        continue
      }
      const snapshot = this.find(snapshotId)
      if (!snapshot) {
        continue
      }
      drawSnapshotChart(canvas, snapshot, undefined, this.host.msg)
      this.chartIds.set(canvas, snapshotId)
    }
  }

  destroyCharts(): void {
    for (const canvas of this.chartIds.keys()) {
      destroyChart(canvas)
    }
    this.chartIds.clear()
  }

  private find(snapshotId: string): SimulationSnapshot | undefined {
    return this.host.service.snapshots.find((entry) => entry.id === snapshotId)
  }

  private triggerDownload(href: string, fileName: string): void {
    const link = document.createElement("a")
    link.href = href
    link.download = fileName
    link.click()
  }
}
