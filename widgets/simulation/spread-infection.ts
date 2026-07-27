import {beginTransitionToQuarantine} from "./zone-transitions"
import type {Agent, SimulationAreas, SimulationConfig} from "./types"

type SpreadContext = {
  radiusSq: number
  maxNewInfectionsPerSource: number
  useExposedState: boolean
  frameIndex: number
  config: SimulationConfig
  areas: SimulationAreas
}

function tryInfectTarget(source: Agent, target: Agent, ctx: SpreadContext): boolean {
  if (target.state !== "susceptible" || target.transition !== "none") {
    return false
  }
  if (source.zone !== target.zone) {
    return false
  }
  if (ctx.config.communitiesEnabled && source.zone === "main" && source.communityId !== target.communityId) {
    return false
  }
  const dx = source.x - target.x
  const dy = source.y - target.y
  const distSq = dx * dx + dy * dy
  if (distSq > ctx.radiusSq) {
    return false
  }
  const proximityFactor = 1 - distSq / Math.max(1, ctx.radiusSq)
  const transmissionChance = ctx.config.infectionProbability * Math.max(0.15, proximityFactor)
  if (Math.random() < transmissionChance) {
    if (ctx.useExposedState) {
      target.state = "exposed"
    } else {
      target.state = "infected"
    }
    target.stateEnteredAt = ctx.frameIndex
    if (ctx.config.quarantineEnabled && ctx.areas.quarantine && Math.random() < ctx.config.quarantineProbability) {
      beginTransitionToQuarantine(target, ctx.areas.quarantine, ctx.frameIndex + ctx.config.quarantineDuration)
    }
    return true
  }
  return false
}

function createSpreadContext(frameIndex: number, config: SimulationConfig, areas: SimulationAreas): SpreadContext {
  return {
    radiusSq: config.infectionRadius * config.infectionRadius,
    maxNewInfectionsPerSource: 2,
    useExposedState: config.modelType === "seir" || config.modelType === "seird",
    frameIndex,
    config,
    areas,
  }
}

function buildSusceptibleGrid(agents: Agent[], cellSize: number): Map<string, number[]> {
  const grid = new Map<string, number[]>()
  for (let index = 0; index < agents.length; index += 1) {
    const agent = agents[index]
    if (agent.state !== "susceptible" || agent.transition !== "none") {
      continue
    }
    const cellX = Math.floor(agent.x / cellSize)
    const cellY = Math.floor(agent.y / cellSize)
    const key = `${cellX},${cellY}`
    const bucket = grid.get(key)
    if (bucket) {
      bucket.push(index)
    } else {
      grid.set(key, [index])
    }
  }
  return grid
}

function collectNeighborIndices(
  grid: Map<string, number[]>,
  sourceX: number,
  sourceY: number,
  cellSize: number,
): number[] {
  const sourceCellX = Math.floor(sourceX / cellSize)
  const sourceCellY = Math.floor(sourceY / cellSize)
  const candidates: number[] = []
  for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
    for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
      const bucket = grid.get(`${sourceCellX + offsetX},${sourceCellY + offsetY}`)
      if (!bucket) {
        continue
      }
      candidates.push(...bucket)
    }
  }
  candidates.sort((left, right) => left - right)
  return candidates
}

/** Brute-force neighbor search; used for parity tests only. */
export function spreadInfectionBruteForce(
  agents: Agent[],
  frameIndex: number,
  config: SimulationConfig,
  areas: SimulationAreas,
): void {
  const ctx = createSpreadContext(frameIndex, config, areas)
  for (let sourceIndex = 0; sourceIndex < agents.length; sourceIndex += 1) {
    const source = agents[sourceIndex]
    if (source.state !== "infected" || source.transition !== "none") {
      continue
    }
    let infectionsFromSource = 0
    for (let targetIndex = 0; targetIndex < agents.length; targetIndex += 1) {
      if (infectionsFromSource >= ctx.maxNewInfectionsPerSource) {
        break
      }
      if (tryInfectTarget(source, agents[targetIndex], ctx)) {
        infectionsFromSource += 1
      }
    }
  }
}

export function spreadInfection(
  agents: Agent[],
  frameIndex: number,
  config: SimulationConfig,
  areas: SimulationAreas,
): void {
  const ctx = createSpreadContext(frameIndex, config, areas)
  const cellSize = Math.max(1, config.infectionRadius)
  const grid = buildSusceptibleGrid(agents, cellSize)

  for (let sourceIndex = 0; sourceIndex < agents.length; sourceIndex += 1) {
    const source = agents[sourceIndex]
    if (source.state !== "infected" || source.transition !== "none") {
      continue
    }
    let infectionsFromSource = 0
    const neighborIndices = collectNeighborIndices(grid, source.x, source.y, cellSize)
    for (let candidateIndex = 0; candidateIndex < neighborIndices.length; candidateIndex += 1) {
      if (infectionsFromSource >= ctx.maxNewInfectionsPerSource) {
        break
      }
      const targetIndex = neighborIndices[candidateIndex]
      if (tryInfectTarget(source, agents[targetIndex], ctx)) {
        infectionsFromSource += 1
      }
    }
  }
}
