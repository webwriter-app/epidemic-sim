import type {Agent, SimulationConfig, SirCounts} from "./types"

interface WorldBounds {
  width: number
  height: number
}

export function initializeAgents(
  config: SimulationConfig,
  world: WorldBounds,
  infectedAtFrame: number,
): Agent[] {
  const infectedSeeds = Math.min(3, Math.max(1, Math.floor(config.population * 0.01)))
  const agents: Agent[] = []

  for (let i = 0; i < config.population; i += 1) {
    const speedScale = randomSpeedScale()
    const angle = Math.random() * Math.PI * 2
    const infected = i < infectedSeeds
    agents.push({
      x: Math.random() * world.width,
      y: Math.random() * world.height,
      vx: Math.cos(angle) * config.speed * speedScale,
      vy: Math.sin(angle) * config.speed * speedScale,
      state: infected ? "infected" : "susceptible",
      infectedAt: infected ? infectedAtFrame : -1,
    })
  }

  return agents
}

export function stepSimulation(
  agents: Agent[],
  frameIndex: number,
  config: SimulationConfig,
  world: WorldBounds,
): number {
  const nextFrame = frameIndex + 1
  moveAgents(agents, config.speed, world, nextFrame, config.recoveryDuration)
  spreadInfection(agents, nextFrame, config.infectionRadius, config.infectionProbability)
  return nextFrame
}

export function getSirCounts(agents: Agent[]): SirCounts {
  let susceptible = 0
  let infected = 0
  let recovered = 0

  for (let i = 0; i < agents.length; i += 1) {
    const state = agents[i].state
    if (state === "susceptible") {
      susceptible += 1
    } else if (state === "infected") {
      infected += 1
    } else {
      recovered += 1
    }
  }

  return {susceptible, infected, recovered}
}

function moveAgents(
  agents: Agent[],
  speed: number,
  world: WorldBounds,
  frameIndex: number,
  recoveryDuration: number,
): void {
  for (let i = 0; i < agents.length; i += 1) {
    const agent = agents[i]
    applyRandomWalk(agent, speed)
    agent.x += agent.vx
    agent.y += agent.vy

    if (agent.x <= 0 || agent.x >= world.width) {
      agent.vx *= -1
      agent.x = Math.min(world.width, Math.max(0, agent.x))
    }
    if (agent.y <= 0 || agent.y >= world.height) {
      agent.vy *= -1
      agent.y = Math.min(world.height, Math.max(0, agent.y))
    }

    if (agent.state === "infected" && frameIndex - agent.infectedAt >= recoveryDuration) {
      agent.state = "recovered"
    }
  }
}

function spreadInfection(
  agents: Agent[],
  frameIndex: number,
  infectionRadius: number,
  infectionProbability: number,
): void {
  const radiusSq = infectionRadius * infectionRadius

  for (let i = 0; i < agents.length; i += 1) {
    const source = agents[i]
    if (source.state !== "infected") {
      continue
    }
    for (let j = 0; j < agents.length; j += 1) {
      const target = agents[j]
      if (target.state !== "susceptible") {
        continue
      }
      const dx = source.x - target.x
      const dy = source.y - target.y
      const distSq = dx * dx + dy * dy
      if (distSq <= radiusSq && Math.random() < infectionProbability) {
        target.state = "infected"
        target.infectedAt = frameIndex
      }
    }
  }
}

function applyRandomWalk(agent: Agent, speed: number): void {
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

function randomSpeedScale(): number {
  return 0.75 + Math.random() * 0.5
}
