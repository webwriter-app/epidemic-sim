export function resetHistory(): number[] {
  return []
}

export function pushHistoryValue(history: number[], value: number, limit: number): void {
  history.push(value)
  if (history.length > limit) {
    history.shift()
  }
}
