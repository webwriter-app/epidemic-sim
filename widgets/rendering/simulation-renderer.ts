import {msg} from "@lit/localize"
import type {Agent, AgentState, Rect, SimulationAreas} from "../simulation/types"
import {getHotspotLabel} from "../utils/hotspot-interaction"

const AGENT_RADIUS = 3
const AGENT_COLORS: Record<AgentState, string> = {
  susceptible: "#56B4E9",
  exposed: "#E69F00",
  infected: "#d55e00",
  recovered: "#009E73",
  dead: "#666666",
}

export function drawSimulation(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  agents: Agent[],
  areas: SimulationAreas,
  options?: {removalHotspotId?: number | null; selectedHotspotId?: number | null},
): void {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = "#fcfdff"
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  drawZones(ctx, areas)

  for (let i = 0; i < agents.length; i += 1) {
    const agent = agents[i]
    ctx.fillStyle = AGENT_COLORS[agent.state]
    ctx.beginPath()
    ctx.arc(agent.x, agent.y, AGENT_RADIUS, 0, Math.PI * 2)
    ctx.fill()
  }

  drawHotspots(ctx, areas, options?.removalHotspotId ?? null, options?.selectedHotspotId ?? null)
}

const HOTSPOT_HANDLE_SIZE = 8

function drawZones(ctx: CanvasRenderingContext2D, areas: SimulationAreas): void {
  ctx.save()
  ctx.strokeStyle = "#cbd5e1"
  ctx.lineWidth = 1
  ctx.strokeRect(areas.main.x, areas.main.y, areas.main.width, areas.main.height)

  if (areas.quarantine) {
    ctx.strokeStyle = "#f59e0b"
    ctx.strokeRect(areas.quarantine.x, areas.quarantine.y, areas.quarantine.width, areas.quarantine.height)
    ctx.fillStyle = "#f59e0b"
    ctx.font = '12px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    ctx.fillText(msg("Quarantine"), areas.quarantine.x + 6, areas.quarantine.y + 14)
  }

  for (let i = 0; i < areas.communities.length; i += 1) {
    const community = areas.communities[i]
    ctx.strokeStyle = "#94a3b8"
    ctx.strokeRect(community.rect.x, community.rect.y, community.rect.width, community.rect.height)
  }

  ctx.restore()
}

function drawHotspots(
  ctx: CanvasRenderingContext2D,
  areas: SimulationAreas,
  removalHotspotId: number | null,
  selectedHotspotId: number | null,
): void {
  ctx.save()
  for (let i = 0; i < areas.hotspots.length; i += 1) {
    const hotspot = areas.hotspots[i]
    const removalPending = hotspot.id === removalHotspotId
    const selected = hotspot.id === selectedHotspotId
    const hotspotColor = removalPending ? "#dc2626" : "#7c3aed"
    ctx.strokeStyle = hotspotColor
    ctx.lineWidth = selected ? 3 : 2
    ctx.setLineDash(removalPending ? [5, 4] : [])
    ctx.strokeRect(hotspot.rect.x, hotspot.rect.y, hotspot.rect.width, hotspot.rect.height)
    ctx.setLineDash([])
    ctx.lineWidth = 1
    if (selected && !removalPending) {
      drawHotspotHandles(ctx, hotspot.rect, hotspotColor)
    }
    const label = getHotspotLabel(hotspot, i)
    ctx.font = 'bold 12px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    ctx.lineJoin = "round"
    ctx.lineWidth = 3
    ctx.strokeStyle = "#ffffff"
    ctx.strokeText(label, hotspot.rect.x + 5, hotspot.rect.y + 14)
    ctx.fillStyle = hotspotColor
    ctx.fillText(label, hotspot.rect.x + 5, hotspot.rect.y + 14)
  }
  ctx.restore()
}

function drawHotspotHandles(ctx: CanvasRenderingContext2D, rect: Rect, color: string): void {
  const corners = [
    {x: rect.x, y: rect.y},
    {x: rect.x + rect.width, y: rect.y},
    {x: rect.x, y: rect.y + rect.height},
    {x: rect.x + rect.width, y: rect.y + rect.height},
  ]
  ctx.fillStyle = "#ffffff"
  ctx.strokeStyle = color
  for (let i = 0; i < corners.length; i += 1) {
    const x = corners[i].x - HOTSPOT_HANDLE_SIZE / 2
    const y = corners[i].y - HOTSPOT_HANDLE_SIZE / 2
    ctx.fillRect(x, y, HOTSPOT_HANDLE_SIZE, HOTSPOT_HANDLE_SIZE)
    ctx.lineWidth = 1.5
    ctx.strokeRect(x, y, HOTSPOT_HANDLE_SIZE, HOTSPOT_HANDLE_SIZE)
  }
}
