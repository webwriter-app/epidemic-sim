/** Reads a theme color for canvas drawing, which cannot use CSS variables. The value is refreshed every 30 reads. */
export class ThemeAccent {
  #value = ""
  #reads = 0

  constructor(
    private readonly element: Element,
    private readonly property: string,
    private readonly fallback: string,
  ) {}

  color(): string {
    if (this.#reads++ % 30 === 0) {
      this.#value = getComputedStyle(this.element).getPropertyValue(this.property).trim()
    }
    return this.#value || this.fallback
  }
}
