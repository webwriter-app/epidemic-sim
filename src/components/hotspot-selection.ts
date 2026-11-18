import type {MsgFn} from "@lit/localize"
import type {SimulationAreas, SimulationConfig} from "../model/simulation/types"
import type {SelectedHotspotInput} from "./canvas-panel"
import {clampHotspotPosition, getCanvasPoint} from "./canvas-coordinates"
import type {HotspotEditingController} from "./hotspot-editing-controller"
import {findTopmostHotspotAtPoint, getHotspotLabel} from "./hotspot-interaction"
import type {HotspotPointerController} from "./hotspot-pointer-controller"

type HotspotSelectionHost = {
  msg: MsgFn
  editing: HotspotEditingController
  pointer: HotspotPointerController
  getCanvas: () => HTMLCanvasElement | null
  getConfig: () => SimulationConfig
  /** The selection changed: draw the map again if it is paused. */
  onSelectionChange: () => void
  requestUpdate: () => void
}

/** The hotspot the author selected, placing a new hotspot and the pointer and context menu handling of the map. */
export class HotspotSelection {
  selectedId: number | null = null
  #placementActive = false

  constructor(private readonly host: HotspotSelectionHost) {}

  get placementActive(): boolean {
    return this.#placementActive
  }

  set placementActive(active: boolean) {
    if (active === this.#placementActive) {
      return
    }
    this.#placementActive = active
    this.host.requestUpdate()
  }

  onCanvasPointerDown = (event: PointerEvent): void => {
    const {editing, pointer} = this.host
    const config = this.host.getConfig()
    if (!config.hotspotsEnabled) {
      return
    }
    const point = getCanvasPoint(this.host.getCanvas(), event.clientX, event.clientY)
    if (this.placementActive) {
      this.placementActive = false
      if (!point) {
        return
      }
      event.preventDefault()
      editing.addHotspotAtPoint(point.x, point.y)
      this.select(editing.userHotspots.at(-1)?.id ?? null)
      return
    }
    const areas: SimulationAreas = editing.getAreas(config)
    const hotspot = point ? findTopmostHotspotAtPoint(point.x, point.y, areas.hotspots) : null
    const handled = pointer.handlePointerDown(event, areas.hotspots)
    this.select(hotspot?.id ?? (handled ? this.selectedId : null))
  }

  onCanvasContextMenu = (event: MouseEvent): void => {
    const config = this.host.getConfig()
    if (!config.hotspotsEnabled) {
      return
    }
    const point = getCanvasPoint(this.host.getCanvas(), event.clientX, event.clientY)
    if (!point) {
      return
    }
    const hotspot = findTopmostHotspotAtPoint(point.x, point.y, this.host.editing.getAreas(config).hotspots)
    if (!hotspot) {
      return
    }
    event.preventDefault()
    this.host.editing.removeHotspot(hotspot.id)
  }

  onTokenClick = (): void => {
    this.placementActive = !this.placementActive
  }

  /** Keyboard path for the map: Enter selects the next hotspot, arrows move it, Delete removes it. */
  onCanvasKeyDown = (event: KeyboardEvent): void => {
    if (!this.host.getConfig().hotspotsEnabled || event.altKey || event.ctrlKey || event.metaKey) {
      return
    }
    const hotspots = this.host.editing.userHotspots
    const step = event.shiftKey ? 10 : 30
    const arrows: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step],
    }
    if (event.key === "Enter" && hotspots.length > 0) {
      const index = hotspots.findIndex((hotspot) => hotspot.id === this.selectedId)
      const next = (index + (event.shiftKey ? -1 : 1) + hotspots.length) % hotspots.length
      this.select(hotspots[index < 0 && event.shiftKey ? hotspots.length - 1 : index < 0 ? 0 : next].id)
    } else if (event.key in arrows && this.selectedId !== null) {
      const hotspot = hotspots.find((entry) => entry.id === this.selectedId)
      if (!hotspot) {
        return
      }
      const [dx, dy] = arrows[event.key]
      const main = this.host.editing.getAreas(this.host.getConfig()).main
      const moved = clampHotspotPosition(hotspot.rect.x + dx, hotspot.rect.y + dy, hotspot.rect.width, main)
      this.host.editing.updateHotspotRect(hotspot.id, {...hotspot.rect, ...moved})
    } else if ((event.key === "Delete" || event.key === "Backspace") && this.selectedId !== null) {
      this.deleteSelected()
    } else {
      return
    }
    event.preventDefault()
  }

  getSelectedInput(): SelectedHotspotInput | null {
    const hotspots = this.host.editing.userHotspots
    const index = hotspots.findIndex((hotspot) => hotspot.id === this.selectedId)
    if (index < 0) {
      return null
    }
    return {
      label: getHotspotLabel(hotspots[index], index, this.host.msg),
      onDelete: this.deleteSelected,
    }
  }

  deleteSelected = (): void => {
    if (this.selectedId === null) {
      return
    }
    this.host.editing.removeHotspot(this.selectedId)
    this.selectedId = null
    this.host.requestUpdate()
  }

  private select(hotspotId: number | null): void {
    if (this.selectedId === hotspotId) {
      return
    }
    this.selectedId = hotspotId
    this.host.requestUpdate()
    this.host.onSelectionChange()
  }
}
