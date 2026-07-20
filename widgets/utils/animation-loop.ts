export class AnimationLoop {
  private animationFrame: number | null = null

  get running(): boolean {
    return this.animationFrame !== null
  }

  start(tick: () => boolean): void {
    if (this.animationFrame !== null) {
      return
    }
    const runTick = () => {
      const keepRunning = tick()
      if (!keepRunning) {
        this.animationFrame = null
        return
      }
      this.animationFrame = requestAnimationFrame(runTick)
    }
    this.animationFrame = requestAnimationFrame(runTick)
  }

  stop(): void {
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame)
      this.animationFrame = null
    }
  }
}
