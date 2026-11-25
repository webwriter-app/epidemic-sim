import type {ReactiveControllerHost} from "lit"

type PrintCanvases = {chart: HTMLCanvasElement | null; map: HTMLCanvasElement | null}

/**
 * Canvases can print blank, so the print view shows pictures of them. The pictures are taken when the browser
 * announces printing and dropped afterwards; an empty string means the canvas had no size.
 */
export class PrintImages {
  images: {chart: string; map: string} | null = null

  constructor(
    private readonly host: ReactiveControllerHost,
    private readonly callbacks: {getCanvases: () => PrintCanvases; drawMap: () => void; drawChart: () => void},
  ) {}

  listen(signal: AbortSignal): void {
    window.addEventListener("beforeprint", this.capture, {signal})
    window.addEventListener("afterprint", this.release, {signal})
    window.matchMedia("print").addEventListener("change", this.onMediaChange, {signal})
  }

  /** WebWriter marks the host with a class while it prints. */
  syncWithHostClass(printing: boolean): void {
    if (printing) {
      if (!this.images) {
        this.capture()
      }
    } else if (this.images && !window.matchMedia("print").matches) {
      this.release()
    }
  }

  private capture = (): void => {
    const {chart, map} = this.callbacks.getCanvases()
    if (!chart || !map) {
      return
    }
    const picture = (canvas: HTMLCanvasElement) => (canvas.width > 0 && canvas.height > 0 ? canvas.toDataURL("image/png") : "")
    try {
      this.callbacks.drawMap()
      this.images = {chart: picture(chart), map: picture(map)}
    } catch {
      this.images = null
    }
    this.host.requestUpdate()
  }

  private release = (): void => {
    this.images = null
    this.host.requestUpdate()
  }

  private onMediaChange = (event: MediaQueryListEvent): void => {
    if (event.matches) {
      this.capture()
      this.callbacks.drawChart()
    } else {
      this.release()
    }
  }
}
