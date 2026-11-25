type CanvasHost = {shadowRoot: ShadowRoot | null}

/** Looks up canvases in the shadow root of the widget. */
export class CanvasHostController {
  constructor(private readonly host: CanvasHost) {}

  queryCanvas(selector: string): HTMLCanvasElement | null {
    return this.host.shadowRoot?.querySelector<HTMLCanvasElement>(selector) ?? null
  }

  queryCanvases(selector: string): HTMLCanvasElement[] {
    return Array.from(this.host.shadowRoot?.querySelectorAll<HTMLCanvasElement>(selector) ?? [])
  }

  queryContext(selector: string): CanvasRenderingContext2D | null {
    return this.queryCanvas(selector)?.getContext("2d") ?? null
  }
}
