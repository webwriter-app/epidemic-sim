import type {ReactiveController, ReactiveControllerHost} from "lit"
import type {Hotspot, Rect, SimulationAreas} from "../simulation/types"
import {clampHotspotPosition, clampHotspotRect, getCanvasPoint} from "../utils/canvas-coordinates"
import {
  findHotspotById,
  getHotspotCornerAtPoint,
  getOppositeCornerPoint,
  getResizedHotspotRect,
  type HotspotCorner,
} from "../utils/hotspot-interaction"

const TOUCH_HANDLE_RADIUS = 18

export type HotspotPointerCallbacks = {
  getCanvas: () => HTMLCanvasElement | null
  getAreas: () => SimulationAreas
  updateHotspotRect: (hotspotId: number, rect: Rect) => void
  removeHotspot: (hotspotId: number) => void
  onRemovalPendingChange: () => void
}

export class HotspotPointerController implements ReactiveController {
  private host: ReactiveControllerHost
  private callbacks: HotspotPointerCallbacks
  private draggingHotspotId: number | null = null
  private resizingHotspotId: number | null = null
  private resizingCorner: HotspotCorner | null = null
  private resizeAnchor = {x: 0, y: 0}
  private dragOffset = {x: 0, y: 0}
  private dragOutsideCanvas = false

  private onWindowPointerMove = (event: PointerEvent): void => {
    if (this.draggingHotspotId === null && this.resizingHotspotId === null) {
      return
    }
    const canvas = this.callbacks.getCanvas()
    const point = getCanvasPoint(canvas, event.clientX, event.clientY, true)
    if (!point) {
      return
    }
    const areas = this.callbacks.getAreas()
    if (this.draggingHotspotId !== null) {
      const outsideCanvas = getCanvasPoint(canvas, event.clientX, event.clientY) === null
      if (outsideCanvas !== this.dragOutsideCanvas) {
        this.dragOutsideCanvas = outsideCanvas
        this.callbacks.onRemovalPendingChange()
      }
      const hotspot = findHotspotById(areas.hotspots, this.draggingHotspotId)
      if (!hotspot) {
        return
      }
      const nextX = point.x - this.dragOffset.x
      const nextY = point.y - this.dragOffset.y
      const clamped = clampHotspotPosition(nextX, nextY, hotspot.rect.width, areas.main)
      this.callbacks.updateHotspotRect(this.draggingHotspotId, {
        x: clamped.x,
        y: clamped.y,
        width: hotspot.rect.width,
        height: hotspot.rect.height,
      })
      return
    }
    if (this.resizingHotspotId === null || !this.resizingCorner) {
      return
    }
    const resizedRect = getResizedHotspotRect(point.x, point.y, this.resizeAnchor, this.resizingCorner)
    const clampedRect = clampHotspotRect(resizedRect, areas.main)
    this.callbacks.updateHotspotRect(this.resizingHotspotId, clampedRect)
  }

  private onWindowPointerUp = (): void => {
    if (this.draggingHotspotId === null && this.resizingHotspotId === null) {
      return
    }
    const removalHotspotId = this.getRemovalPendingHotspotId()
    this.clear()
    if (removalHotspotId !== null) {
      this.callbacks.removeHotspot(removalHotspotId)
    }
  }

  private onWindowPointerCancel = (): void => {
    this.clear()
  }

  constructor(host: ReactiveControllerHost, callbacks: HotspotPointerCallbacks) {
    this.host = host
    this.callbacks = callbacks
    host.addController(this)
  }

  isActive(): boolean {
    return this.draggingHotspotId !== null || this.resizingHotspotId !== null
  }

  isDragging(hotspotId: number): boolean {
    return this.draggingHotspotId === hotspotId || this.resizingHotspotId === hotspotId
  }

  getRemovalPendingHotspotId(): number | null {
    return this.dragOutsideCanvas ? this.draggingHotspotId : null
  }

  handlePointerDown(event: PointerEvent, hotspots: Hotspot[]): boolean {
    const canvas = this.callbacks.getCanvas()
    const point = getCanvasPoint(canvas, event.clientX, event.clientY)
    if (!point) {
      return false
    }
    for (let i = hotspots.length - 1; i >= 0; i -= 1) {
      const hotspot = hotspots[i]
      const rect = hotspot.rect
      const handleRadius = event.pointerType === "touch" ? TOUCH_HANDLE_RADIUS : undefined
      const corner = getHotspotCornerAtPoint(point.x, point.y, rect, handleRadius)
      if (corner) {
        const anchor = getOppositeCornerPoint(rect, corner)
        this.resizingHotspotId = hotspot.id
        this.resizingCorner = corner
        this.resizeAnchor = anchor
        window.addEventListener("pointermove", this.onWindowPointerMove)
        window.addEventListener("pointerup", this.onWindowPointerUp)
        window.addEventListener("pointercancel", this.onWindowPointerCancel)
        if (canvas) {
          canvas.style.cursor = corner === "nw" || corner === "se" ? "nwse-resize" : "nesw-resize"
        }
        event.preventDefault()
        return true
      }
      const inside =
        point.x >= rect.x &&
        point.x <= rect.x + rect.width &&
        point.y >= rect.y &&
        point.y <= rect.y + rect.height
      if (!inside) {
        continue
      }
      this.draggingHotspotId = hotspot.id
      this.dragOffset = {x: point.x - rect.x, y: point.y - rect.y}
      window.addEventListener("pointermove", this.onWindowPointerMove)
      window.addEventListener("pointerup", this.onWindowPointerUp)
      window.addEventListener("pointercancel", this.onWindowPointerCancel)
      if (canvas) {
        canvas.style.cursor = "grabbing"
      }
      event.preventDefault()
      return true
    }
    return false
  }

  updateHoverCursor(event: PointerEvent, hotspots: Hotspot[]): void {
    const canvas = this.callbacks.getCanvas()
    if (!canvas || this.isActive()) {
      return
    }
    const point = getCanvasPoint(canvas, event.clientX, event.clientY)
    let cursor = ""
    for (let i = hotspots.length - 1; point && i >= 0; i -= 1) {
      const rect = hotspots[i].rect
      const corner = getHotspotCornerAtPoint(point.x, point.y, rect)
      if (corner) {
        cursor = corner === "nw" || corner === "se" ? "nwse-resize" : "nesw-resize"
        break
      }
      const inside =
        point.x >= rect.x &&
        point.x <= rect.x + rect.width &&
        point.y >= rect.y &&
        point.y <= rect.y + rect.height
      if (inside) {
        cursor = "pointer"
        break
      }
    }
    canvas.style.cursor = cursor
  }

  clear(): void {
    const hadInteraction = this.draggingHotspotId !== null || this.resizingHotspotId !== null
    this.draggingHotspotId = null
    this.resizingHotspotId = null
    this.resizingCorner = null
    this.dragOutsideCanvas = false
    window.removeEventListener("pointermove", this.onWindowPointerMove)
    window.removeEventListener("pointerup", this.onWindowPointerUp)
    window.removeEventListener("pointercancel", this.onWindowPointerCancel)
    const canvas = this.callbacks.getCanvas()
    if (canvas) {
      canvas.style.cursor = ""
    }
    if (hadInteraction) {
      this.host.requestUpdate()
    }
  }

  hostDisconnected(): void {
    this.clear()
  }
}
