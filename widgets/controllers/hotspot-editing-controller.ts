import type {ReactiveController, ReactiveControllerHost} from "lit"
import {
  buildSimulationAreas,
  getDefaultHotspotSize,
  resolveHotspotCommunityId,
} from "../geometry/simulation-areas"
import type {Hotspot, Rect, SimulationAreas, SimulationConfig} from "../simulation/types"
import {SIMULATION_CANVAS_HEIGHT, SIMULATION_CANVAS_WIDTH} from "../simulation/canvas-dimensions"
import {clampHotspotPosition, getCanvasPoint} from "../utils/canvas-coordinates"

export type HotspotEditingCallbacks = {
  getCanvas: () => HTMLCanvasElement | null
  getConfig: () => SimulationConfig
  enableHotspots: () => void
  onHotspotsChanged: () => void
  onRestartPreservingHotspots: () => void
  isPointerDragging: (hotspotId: number) => boolean
  clearPointer: () => void
  persistHotspots: () => void
}

export class HotspotEditingController implements ReactiveController {
  private host: ReactiveControllerHost
  private callbacks: HotspotEditingCallbacks
  userHotspots: Hotspot[] = []
  private nextHotspotId = 0
  canvasDropActive = false
  isCreatingHotspotDrag = false

  constructor(host: ReactiveControllerHost, callbacks: HotspotEditingCallbacks) {
    this.host = host
    this.callbacks = callbacks
    host.addController(this)
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

  resetInteractionFlags(): void {
    this.canvasDropActive = false
    this.isCreatingHotspotDrag = false
  }

  getAreas(config: SimulationConfig): SimulationAreas {
    return buildSimulationAreas({
      canvasWidth: SIMULATION_CANVAS_WIDTH,
      canvasHeight: SIMULATION_CANVAS_HEIGHT,
      config,
      userHotspots: this.userHotspots,
    })
  }

  onTokenDragStart = (event: DragEvent): void => {
    if (!event.dataTransfer) {
      return
    }
    this.isCreatingHotspotDrag = true
    event.dataTransfer.effectAllowed = "copy"
    event.dataTransfer.setData("application/x-epidemic-hotspot", "new-hotspot")
    event.dataTransfer.setData("text/plain", "new-hotspot")
  }

  onTokenDragEnd = (): void => {
    this.isCreatingHotspotDrag = false
    if (!this.canvasDropActive) {
      return
    }
    this.canvasDropActive = false
    this.host.requestUpdate()
  }

  onCanvasDragOver = (event: DragEvent): void => {
    if (!this.isCreatingHotspotDrag || !event.dataTransfer) {
      return
    }
    event.preventDefault()
    event.dataTransfer.dropEffect = "copy"
    if (!this.canvasDropActive) {
      this.canvasDropActive = true
      this.host.requestUpdate()
    }
  }

  onCanvasDragLeave = (): void => {
    if (!this.canvasDropActive) {
      return
    }
    this.canvasDropActive = false
    this.host.requestUpdate()
  }

  onCanvasDrop = (event: DragEvent): void => {
    event.preventDefault()
    this.canvasDropActive = false
    const wasCreatingHotspotDrag = this.isCreatingHotspotDrag
    this.isCreatingHotspotDrag = false
    const canvas = this.callbacks.getCanvas()
    if (!canvas || !event.dataTransfer) {
      this.host.requestUpdate()
      return
    }
    const hotspotMime = event.dataTransfer.getData("application/x-epidemic-hotspot")
    const textMime = event.dataTransfer.getData("text/plain")
    const isHotspotDrop = wasCreatingHotspotDrag || hotspotMime === "new-hotspot" || textMime === "new-hotspot"
    if (!isHotspotDrop) {
      this.host.requestUpdate()
      return
    }
    const config = this.callbacks.getConfig()
    if (!config.hotspotsEnabled) {
      this.callbacks.enableHotspots()
    }
    const point = getCanvasPoint(canvas, event.clientX, event.clientY)
    if (!point) {
      this.host.requestUpdate()
      return
    }
    this.addHotspotAtPoint(point.x, point.y)
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

  hostDisconnected(): void {
    this.resetInteractionFlags()
  }
}
