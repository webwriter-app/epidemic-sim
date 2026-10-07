import type {Hotspot, SimulationSnapshot} from "../simulation/types"

export const STATE_SCRIPT_TYPE = "application/json"
export const STATE_ATTRIBUTE = "widget-state"

export type PersistedSnapshot = SimulationSnapshot

export type PersistedWidgetState = {
  version: 1
  hotspots: Hotspot[]
  nextHotspotId: number
  snapshots: PersistedSnapshot[]
  nextSnapshotId: number
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value)
}

function parseHotspot(value: unknown): Hotspot | null {
  if (!value || typeof value !== "object") {
    return null
  }
  const entry = value as Partial<Hotspot> & {rect?: Partial<Hotspot["rect"]>}
  if (
    !isFiniteNumber(entry.id) ||
    !entry.rect ||
    !isFiniteNumber(entry.rect.x) ||
    !isFiniteNumber(entry.rect.y) ||
    !isFiniteNumber(entry.rect.width) ||
    !isFiniteNumber(entry.rect.height)
  ) {
    return null
  }
  const communityId =
    entry.communityId === null || entry.communityId === undefined
      ? null
      : isFiniteNumber(entry.communityId)
        ? entry.communityId
        : null
  return {
    id: entry.id,
    communityId,
    rect: {
      x: entry.rect.x,
      y: entry.rect.y,
      width: entry.rect.width,
      height: entry.rect.height,
    },
  }
}

function parseSnapshot(value: unknown): PersistedSnapshot | null {
  if (!value || typeof value !== "object") {
    return null
  }
  const entry = value as Partial<PersistedSnapshot>
  if (typeof entry.id !== "string" || typeof entry.label !== "string" || !entry.config) {
    return null
  }
  if (
    !isFiniteNumber(entry.createdAt) ||
    !isFiniteNumber(entry.frameIndex) ||
    !Array.isArray(entry.susceptibleHistory) ||
    !Array.isArray(entry.infectedHistory)
  ) {
    return null
  }
  return {
    id: entry.id,
    label: entry.label,
    createdAt: entry.createdAt,
    estimatedR0: entry.estimatedR0 ?? null,
    config: entry.config,
    frameIndex: entry.frameIndex,
    epidemicEnded: Boolean(entry.epidemicEnded),
    susceptibleCount: entry.susceptibleCount ?? 0,
    exposedCount: entry.exposedCount ?? 0,
    infectedCount: entry.infectedCount ?? 0,
    recoveredCount: entry.recoveredCount ?? 0,
    deadCount: entry.deadCount ?? 0,
    susceptibleHistory: [...entry.susceptibleHistory],
    exposedHistory: Array.isArray(entry.exposedHistory) ? [...entry.exposedHistory] : [],
    infectedHistory: [...entry.infectedHistory],
    recoveredHistory: Array.isArray(entry.recoveredHistory) ? [...entry.recoveredHistory] : [],
    deadHistory: Array.isArray(entry.deadHistory) ? [...entry.deadHistory] : [],
    userHotspots: Array.isArray(entry.userHotspots)
      ? entry.userHotspots.map(parseHotspot).filter((hotspot): hotspot is Hotspot => hotspot !== null)
      : [],
  }
}

export function parsePersistedState(raw: string | null | undefined): PersistedWidgetState | null {
  if (!raw?.trim()) {
    return null
  }
  try {
    const parsed = JSON.parse(raw) as Partial<PersistedWidgetState>
    if (parsed.version !== 1 || !Array.isArray(parsed.hotspots)) {
      return null
    }
    const hotspots = parsed.hotspots.map(parseHotspot).filter((hotspot): hotspot is Hotspot => hotspot !== null)
    const maxHotspotId = hotspots.reduce((max, hotspot) => Math.max(max, hotspot.id), -1)
    const nextHotspotId = isFiniteNumber(parsed.nextHotspotId)
      ? Math.max(parsed.nextHotspotId, maxHotspotId + 1)
      : maxHotspotId + 1
    const snapshots = Array.isArray(parsed.snapshots)
      ? parsed.snapshots.map(parseSnapshot).filter((snapshot): snapshot is PersistedSnapshot => snapshot !== null)
      : []
    let maxSnapshotOrdinal = 0
    for (const snapshot of snapshots) {
      const match = /^snapshot-(\d+)$/.exec(snapshot.id)
      if (match) {
        maxSnapshotOrdinal = Math.max(maxSnapshotOrdinal, Number(match[1]))
      }
    }
    const nextSnapshotId = isFiniteNumber(parsed.nextSnapshotId)
      ? Math.max(parsed.nextSnapshotId, maxSnapshotOrdinal + 1)
      : maxSnapshotOrdinal + 1
    return {version: 1, hotspots, nextHotspotId, snapshots, nextSnapshotId}
  } catch {
    return null
  }
}

export function encodePersistedState(state: PersistedWidgetState): string {
  return JSON.stringify({
    version: 1,
    hotspots: state.hotspots,
    nextHotspotId: state.nextHotspotId,
    nextSnapshotId: state.nextSnapshotId,
    snapshots: state.snapshots,
  })
}

export function readPersistedState(host: HTMLElement): PersistedWidgetState | null {
  const fromAttribute = parsePersistedState(host.getAttribute(STATE_ATTRIBUTE))
  if (fromAttribute) {
    return fromAttribute
  }
  const script = host.querySelector(`:scope > script[type="${STATE_SCRIPT_TYPE}"]`)
  return parsePersistedState(script?.textContent)
}

export function writePersistedState(host: HTMLElement, state: PersistedWidgetState): void {
  const encoded = encodePersistedState(state)
  if (host.getAttribute(STATE_ATTRIBUTE) !== encoded) {
    host.setAttribute(STATE_ATTRIBUTE, encoded)
  }

  let script = host.querySelector(`:scope > script[type="${STATE_SCRIPT_TYPE}"]`) as HTMLScriptElement | null
  if (!script) {
    script = document.createElement("script")
    script.type = STATE_SCRIPT_TYPE
    host.appendChild(script)
  }
  if (script.textContent !== encoded) {
    script.textContent = encoded
  }
}
