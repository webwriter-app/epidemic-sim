const FRAMES_PER_DAY = 24

export function formatFrameCountAsDays(frameCount: number): string {
  return `${(frameCount / FRAMES_PER_DAY).toFixed(2)} d`
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}

export function formatApprox(value: number | null, digits = 2): string {
  if (value === null || !Number.isFinite(value)) {
    return "–"
  }
  return value.toFixed(digits)
}

export function estimateBasicReproductionNumber(
  infectedHistory: number[],
  recoveryDuration: number,
): number | null {
  const length = infectedHistory.length
  if (length < 5) {
    return null
  }
  let peakIndex = 0
  let peakValue = -1
  for (let i = 0; i < length; i += 1) {
    if (infectedHistory[i] > peakValue) {
      peakValue = infectedHistory[i]
      peakIndex = i
    }
  }
  if (peakValue <= 0 || peakIndex < 2) {
    return null
  }
  let sumLogGrowth = 0
  let sampleCount = 0
  const growthWindowEnd = Math.min(peakIndex, 80)
  for (let i = 1; i <= growthWindowEnd; i += 1) {
    const previous = infectedHistory[i - 1]
    const current = infectedHistory[i]
    if (previous <= 0 || current <= previous) {
      continue
    }
    sumLogGrowth += Math.log(current / previous)
    sampleCount += 1
  }
  if (sampleCount < 3) {
    return null
  }
  const averageLogGrowth = sumLogGrowth / sampleCount
  const gamma = FRAMES_PER_DAY / Math.max(1, recoveryDuration)
  const estimatedR0 = 1 + averageLogGrowth / gamma
  if (!Number.isFinite(estimatedR0) || estimatedR0 <= 0) {
    return null
  }
  return estimatedR0
}

export type ChartInsights = {
  peakInfected: number
  peakFrame: number
  currentFrame: number
  currentSusceptible: number
  currentExposed: number
  currentInfected: number
  currentRecovered: number
  currentDead: number
  currentSusceptibleShare: number
  currentExposedShare: number
  currentInfectedShare: number
  currentRecoveredShare: number
  currentDeadShare: number
  finalRecoveredShare: number | null
  estimatedR0: number | null
  herdImmunityThreshold: number | null
}

export function computeChartInsights(input: {
  infectedHistory: number[]
  frameIndex: number
  population: number
  recoveryDuration: number
  epidemicEnded: boolean
  susceptibleCount: number
  exposedCount: number
  infectedCount: number
  recoveredCount: number
  deadCount: number
}): ChartInsights {
  const infected = input.infectedHistory
  let peakInfected = 0
  let peakFrame = 0
  for (let i = 0; i < infected.length; i += 1) {
    if (infected[i] > peakInfected) {
      peakInfected = infected[i]
      peakFrame = i * FRAMES_PER_DAY
    }
  }
  const population = Math.max(1, input.population)
  const estimatedR0 = estimateBasicReproductionNumber(infected, input.recoveryDuration)
  const herdImmunityThreshold = estimatedR0 !== null && estimatedR0 > 1 ? 1 - 1 / estimatedR0 : null
  const currentRecoveredShare = input.recoveredCount / population
  return {
    peakInfected,
    peakFrame,
    currentFrame: input.frameIndex,
    currentSusceptible: input.susceptibleCount,
    currentExposed: input.exposedCount,
    currentInfected: input.infectedCount,
    currentRecovered: input.recoveredCount,
    currentDead: input.deadCount,
    currentSusceptibleShare: input.susceptibleCount / population,
    currentExposedShare: input.exposedCount / population,
    currentInfectedShare: input.infectedCount / population,
    currentRecoveredShare,
    currentDeadShare: input.deadCount / population,
    finalRecoveredShare: input.epidemicEnded ? currentRecoveredShare : null,
    estimatedR0,
    herdImmunityThreshold,
  }
}

export function buildApproximationSeries(input: {
  infectedHistory: number[]
  susceptibleHistory: number[]
  recoveredHistory: number[]
  population: number
  recoveryDuration: number
  estimatedR0: number | null
}): {susceptible: number[]; infected: number[]; recovered: number[]} | null {
  const length = input.infectedHistory.length
  if (length < 2 || input.estimatedR0 === null || input.estimatedR0 <= 0) {
    return null
  }
  const population = Math.max(1, input.population)
  const gamma = FRAMES_PER_DAY / Math.max(1, input.recoveryDuration)
  const beta = input.estimatedR0 * gamma
  let susceptible = input.susceptibleHistory[0] ?? population
  let infected = input.infectedHistory[0] ?? 0
  let recovered = input.recoveredHistory[0] ?? 0
  const susceptibleFit = [susceptible]
  const infectedFit = [infected]
  const recoveredFit = [recovered]
  const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))
  for (let i = 1; i < length; i += 1) {
    const newInfections = beta * susceptible * infected / population
    const newRecoveries = gamma * infected
    susceptible = clamp(susceptible - newInfections, 0, population)
    infected = clamp(infected + newInfections - newRecoveries, 0, population)
    recovered = clamp(population - susceptible - infected, 0, population)
    susceptibleFit.push(susceptible)
    infectedFit.push(infected)
    recoveredFit.push(recovered)
  }
  return {susceptible: susceptibleFit, infected: infectedFit, recovered: recoveredFit}
}
