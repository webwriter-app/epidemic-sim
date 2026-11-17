import type {HotspotEditingController} from "./hotspot-editing-controller"
import {
  getPersistedStateBlock,
  parsePersistedState,
  readPersistedState,
  writePersistedState,
} from "./persisted-state"
import type {SnapshotService} from "./snapshot-service"

type WidgetStateSyncHost = {
  element: HTMLElement
  hotspotEditing: HotspotEditingController
  snapshotService: SnapshotService
  hasCanvas: () => boolean
  restartSimulation: (options: {clearPointer: boolean}) => void
  requestUpdate: () => void
}

/**
 * Keeps the data block of the widget (hotspots and snapshots) and the live state in step:
 * writes changes to the block after a short delay and applies outside changes to the block.
 */
export class WidgetStateSync {
  private timer: number | null = null
  private applying = false
  private lastWritten = ""

  constructor(private readonly host: WidgetStateSyncHost) {}

  /** Remember the block as it is now, so that it counts as already applied. */
  markCurrent(): void {
    this.lastWritten = this.blockText()
  }

  apply(persisted: ReturnType<typeof readPersistedState>, options: {restartSimulation: boolean}): void {
    if (this.applying) {
      return
    }
    const {hotspotEditing, snapshotService} = this.host
    const state = persisted ?? {
      hotspots: [],
      nextHotspotId: hotspotEditing.getPersistedSnapshot().nextHotspotId,
      snapshots: [],
      nextSnapshotId: snapshotService.getPersistedMeta().nextSnapshotId,
    }
    this.applying = true
    try {
      hotspotEditing.hydrate(state.hotspots, state.nextHotspotId)
      snapshotService.hydrate(state.snapshots, state.nextSnapshotId)
      if (options.restartSimulation && this.host.hasCanvas()) {
        this.host.restartSimulation({clearPointer: true})
      }
      this.host.requestUpdate()
    } finally {
      this.applying = false
    }
  }

  /** Read the initial state from the block. */
  load(options: {restartSimulation: boolean}): void {
    this.markCurrent()
    this.apply(readPersistedState(this.host.element), options)
  }

  /** Apply the block if it changed since the last write. */
  sync(): void {
    const text = this.blockText()
    if (text === this.lastWritten) return
    this.clearTimer()
    this.lastWritten = text
    this.apply(parsePersistedState(text), {restartSimulation: true})
  }

  schedule(): void {
    this.clearTimer()
    this.timer = window.setTimeout(() => {
      this.timer = null
      this.flush()
    }, 120)
  }

  /** Write a pending change right away, for example when the widget is removed. */
  flushPending(): void {
    if (this.timer !== null) {
      this.clearTimer()
      this.flush()
    }
  }

  flush(): void {
    if (this.applying) {
      return
    }
    if (this.blockText() !== this.lastWritten) {
      this.sync()
      return
    }
    const hotspotMeta = this.host.hotspotEditing.getPersistedSnapshot()
    const snapshotMeta = this.host.snapshotService.getPersistedMeta()
    const state = {
      version: 1 as const,
      hotspots: hotspotMeta.hotspots,
      nextHotspotId: hotspotMeta.nextHotspotId,
      snapshots: snapshotMeta.snapshots,
      nextSnapshotId: snapshotMeta.nextSnapshotId,
    }
    this.applying = true
    try {
      writePersistedState(this.host.element, state)
      this.lastWritten = this.blockText()
    } finally {
      this.applying = false
    }
  }

  private blockText(): string {
    return getPersistedStateBlock(this.host.element)?.textContent ?? ""
  }

  private clearTimer(): void {
    if (this.timer !== null) {
      window.clearTimeout(this.timer)
      this.timer = null
    }
  }
}
