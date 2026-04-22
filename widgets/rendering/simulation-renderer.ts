import type {Agent} from "../simulation/types"

export function drawSimulation(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, agents: Agent[]): void {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = "#fcfdff"
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let i = 0; i < agents.length; i += 1) {
    const agent = agents[i]
    if (agent.state === "susceptible") {
      ctx.fillStyle = "#2563eb"
    } else if (agent.state === "infected") {
      ctx.fillStyle = "#dc2626"
    } else {
      ctx.fillStyle = "#16a34a"
    }
    ctx.beginPath()
    ctx.arc(agent.x, agent.y, 3, 0, Math.PI * 2)
    ctx.fill()
  }
}
