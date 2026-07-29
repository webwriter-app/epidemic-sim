export function parseRangeInput(event: Event): number {
  const target = (event.currentTarget ?? event.target) as ({value?: string | number} & EventTarget) | null
  return target?.value !== undefined ? Number(target.value) : 0
}

export function parseSwitch(event: Event): boolean {
  const target = (event.currentTarget ?? event.target) as ({checked?: boolean} & EventTarget) | null
  return target?.checked ?? false
}
