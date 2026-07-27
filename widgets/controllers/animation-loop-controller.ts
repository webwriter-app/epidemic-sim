import type {ReactiveController, ReactiveControllerHost} from "lit"

export class AnimationLoopController implements ReactiveController {
  private host: ReactiveControllerHost
  private frame: number | null = null
  private running = false
  private onTick: () => boolean

  constructor(host: ReactiveControllerHost, onTick: () => boolean) {
    this.host = host
    this.onTick = onTick
    host.addController(this)
  }

  get isRunning(): boolean {
    return this.running
  }

  start(): void {
    if (this.running) {
      return
    }
    this.running = true
    const tick = () => {
      if (!this.running) {
        this.frame = null
        return
      }
      const keepRunning = this.onTick()
      if (!keepRunning) {
        this.running = false
        this.frame = null
        this.host.requestUpdate()
        return
      }
      this.frame = requestAnimationFrame(tick)
    }
    this.frame = requestAnimationFrame(tick)
    this.host.requestUpdate()
  }

  stop(): void {
    this.running = false
    if (this.frame !== null) {
      cancelAnimationFrame(this.frame)
      this.frame = null
    }
    this.host.requestUpdate()
  }

  hostDisconnected(): void {
    this.stop()
  }
}
