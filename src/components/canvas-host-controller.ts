import type {ReactiveController, ReactiveControllerHost} from "lit"

type CanvasHost = ReactiveControllerHost & {shadowRoot: ShadowRoot | null}

export class CanvasHostController implements ReactiveController {
  private host: CanvasHost

  constructor(host: CanvasHost) {
    this.host = host
    host.addController(this)
  }

  hostConnected(): void {
    // no-op, required by ReactiveController interface
  }

  hostDisconnected(): void {
    // no-op, required by ReactiveController interface
  }

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
