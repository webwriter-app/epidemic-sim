import type {Agent, SimulationAreas} from "../simulation/types"

const AGENT_RADIUS = 3
const AGENT_COLORS = {
  susceptible: "#2563eb",
  infected: "#dc2626",
  recovered: "#16a34a",
} as const

export function drawSimulation(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  agents: Agent[],
  areas: SimulationAreas,
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
}

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
    ctx.fillText("Quarantine", areas.quarantine.x + 6, areas.quarantine.y + 14)
  }

  for (let i = 0; i < areas.communities.length; i += 1) {
    const community = areas.communities[i]
    ctx.strokeStyle = "#94a3b8"
    ctx.strokeRect(community.rect.x, community.rect.y, community.rect.width, community.rect.height)
  }

  for (let i = 0; i < areas.hotspots.length; i += 1) {
    const hotspot = areas.hotspots[i]
    ctx.strokeStyle = "#7c3aed"
    ctx.strokeRect(hotspot.rect.x, hotspot.rect.y, hotspot.rect.width, hotspot.rect.height)
    ctx.fillStyle = "#7c3aed"
    ctx.font = '11px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    const label = hotspot.communityId === null ? `H${i + 1}` : `C${hotspot.communityId + 1}`
    ctx.fillText(label, hotspot.rect.x + 4, hotspot.rect.y + 12)
  }
  ctx.restore()
}
