import type {ReactiveController, ReactiveControllerHost} from "lit"

const TARGET_FRAME_MS = 1000 / 60
const MAX_STEPS_PER_TICK = 2

export class AnimationLoopController implements ReactiveController {
  private host: ReactiveControllerHost
  private frame: number | null = null
  private running = false
  private onTick: () => boolean
  private lastTimestamp = 0
  private accumulatorMs = 0

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
    this.lastTimestamp = 0
    this.accumulatorMs = 0
    const tick = (timestamp: number) => {
      if (!this.running) {
        this.frame = null
        return
      }
      if (this.lastTimestamp === 0) {
        this.lastTimestamp = timestamp
      }
      const elapsedMs = Math.min(timestamp - this.lastTimestamp, TARGET_FRAME_MS * MAX_STEPS_PER_TICK)
      this.lastTimestamp = timestamp
      this.accumulatorMs += elapsedMs

      let keepRunning = true
      let steps = 0
      while (this.accumulatorMs >= TARGET_FRAME_MS && steps < MAX_STEPS_PER_TICK) {
        this.accumulatorMs -= TARGET_FRAME_MS
        keepRunning = this.onTick()
        steps += 1
        if (!keepRunning) {
          break
        }
      }

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
    this.lastTimestamp = 0
    this.accumulatorMs = 0
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
