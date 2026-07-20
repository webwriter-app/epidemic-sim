import type {Agent, Rect} from "./types"

export function randomSpeedScale(): number {
  return 0.75 + Math.random() * 0.5
}

export function applyRandomWalk(agent: Agent, speed: number): void {
  const jitter = 0.25
  agent.vx += (Math.random() - 0.5) * jitter
  agent.vy += (Math.random() - 0.5) * jitter
  const velocity = Math.hypot(agent.vx, agent.vy)
  if (velocity === 0) {
    const angle = Math.random() * Math.PI * 2
    agent.vx = Math.cos(angle) * speed
    agent.vy = Math.sin(angle) * speed
    return
  }
  const speedScale = speed / velocity
  agent.vx *= speedScale
  agent.vy *= speedScale
}

export function seedVelocity(agent: Agent, speed: number): void {
  const angle = Math.random() * Math.PI * 2
  agent.vx = Math.cos(angle) * speed
  agent.vy = Math.sin(angle) * speed
}

export function moveInsideBounds(agent: Agent, speed: number, bounds: Rect): void {
  applyRandomWalk(agent, speed)
  agent.x += agent.vx
  agent.y += agent.vy

  const minX = bounds.x
  const maxX = bounds.x + bounds.width
  const minY = bounds.y
  const maxY = bounds.y + bounds.height

  if (agent.x <= minX || agent.x >= maxX) {
    agent.vx *= -1
    agent.x = Math.min(maxX, Math.max(minX, agent.x))
  }
  if (agent.y <= minY || agent.y >= maxY) {
    agent.vy *= -1
    agent.y = Math.min(maxY, Math.max(minY, agent.y))
  }
}
