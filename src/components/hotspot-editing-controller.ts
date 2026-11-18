import type {DragCommitDetail} from "@webwriter/lit/drag"
import {
  buildSimulationAreas,
  getDefaultHotspotSize,
  resolveHotspotCommunityId,
} from "../model/geometry/simulation-areas"
import type {Hotspot, Rect, SimulationAreas, SimulationConfig} from "../model/simulation/types"
import {SIMULATION_CANVAS_HEIGHT, SIMULATION_CANVAS_WIDTH} from "../model/simulation/canvas-dimensions"
import {clampHotspotPosition} from "./canvas-coordinates"

export type DragCommitEvent = CustomEvent<DragCommitDetail>

type HotspotEditingCallbacks = {
  getCanvas: () => HTMLCanvasElement | null
  getConfig: () => SimulationConfig
  enableHotspots: () => void
  onHotspotsChanged: () => void
  onRestartPreservingHotspots: () => void
  isPointerDragging: (hotspotId: number) => boolean
  clearPointer: () => void
  persistHotspots: () => void
}

export class HotspotEditingController {
  private callbacks: HotspotEditingCallbacks
  userHotspots: Hotspot[] = []
  private nextHotspotId = 0

  constructor(callbacks: HotspotEditingCallbacks) {
    this.callbacks = callbacks
  }

  hydrate(hotspots: Hotspot[], nextHotspotId: number): void {
    this.userHotspots = hotspots.map((hotspot) => ({
      ...hotspot,
      rect: {...hotspot.rect},
    }))
    this.nextHotspotId = nextHotspotId
  }

  getPersistedSnapshot(): {hotspots: Hotspot[]; nextHotspotId: number} {
    return {
      hotspots: this.userHotspots,
      nextHotspotId: this.nextHotspotId,
    }
  }

  private persist(): void {
    this.callbacks.persistHotspots()
  }

  getAreas(config: SimulationConfig): SimulationAreas {
    return buildSimulationAreas({
      canvasWidth: SIMULATION_CANVAS_WIDTH,
      canvasHeight: SIMULATION_CANVAS_HEIGHT,
      config,
      userHotspots: this.userHotspots,
    })
  }

  /** A hotspot token was dropped on the canvas: the hotspot is centred on the token. */
  onCanvasDragCommit = (event: DragCommitEvent): void => {
    const canvas = this.callbacks.getCanvas()
    const {item, x, y} = event.detail
    if (!canvas || x === null || y === null || canvas.clientWidth === 0 || canvas.clientHeight === 0) {
      return
    }
    if (!this.callbacks.getConfig().hotspotsEnabled) {
      this.callbacks.enableHotspots()
    }
    this.addHotspotAtPoint(
      ((x + item.offsetWidth / 2) * SIMULATION_CANVAS_WIDTH) / canvas.clientWidth,
      ((y + item.offsetHeight / 2) * SIMULATION_CANVAS_HEIGHT) / canvas.clientHeight,
    )
  }

  addHotspotAtPoint(x: number, y: number): void {
    const config = this.callbacks.getConfig()
    const areas = this.getAreas(config)
    const size = getDefaultHotspotSize(areas.main, config.hotspotSize)
    const clamped = clampHotspotPosition(x - size * 0.5, y - size * 0.5, size, areas.main)
    const hotspot: Hotspot = {
      id: this.nextHotspotId,
      communityId: resolveHotspotCommunityId(
        clamped.x,
        clamped.y,
        size,
        size,
        areas.communities,
        config.communitiesEnabled,
      ),
      rect: {x: clamped.x, y: clamped.y, width: size, height: size},
    }
    this.nextHotspotId += 1
    this.userHotspots = [...this.userHotspots, hotspot]
    this.persist()
    this.callbacks.onRestartPreservingHotspots()
  }

  updateHotspotRect(hotspotId: number, rect: Rect): void {
    let updated = false
    this.userHotspots = this.userHotspots.map((hotspot) => {
      if (hotspot.id !== hotspotId) {
        return hotspot
      }
      updated = true
      return {...hotspot, rect}
    })
    if (updated) {
      this.persist()
      this.callbacks.onHotspotsChanged()
    }
  }

  removeAll(): void {
    if (this.userHotspots.length === 0) {
      return
    }
    this.callbacks.clearPointer()
    this.userHotspots = []
    this.persist()
    this.callbacks.onHotspotsChanged()
  }

  removeHotspot(hotspotId: number): void {
    const hasHotspot = this.userHotspots.some((hotspot) => hotspot.id === hotspotId)
    if (!hasHotspot) {
      return
    }
    if (this.callbacks.isPointerDragging(hotspotId)) {
      this.callbacks.clearPointer()
    }
    this.userHotspots = this.userHotspots.filter((hotspot) => hotspot.id !== hotspotId)
    this.persist()
    this.callbacks.onHotspotsChanged()
  }
}
