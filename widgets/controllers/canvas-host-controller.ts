import type {ReactiveController, ReactiveControllerHost} from "lit"

type CanvasHost = ReactiveControllerHost & {shadowRoot: ShadowRoot | null}

export class CanvasHostController implements ReactiveController {
  private host: CanvasHost

  constructor(host: CanvasHost) {
    this.host = host
    host.addController(this)
  }

  queryCanvas(selector: string): HTMLCanvasElement | null {
    return this.host.shadowRoot?.querySelector<HTMLCanvasElement>(selector) ?? null
  }

  queryContext(selector: string): CanvasRenderingContext2D | null {
    return this.queryCanvas(selector)?.getContext("2d") ?? null
  }
}
