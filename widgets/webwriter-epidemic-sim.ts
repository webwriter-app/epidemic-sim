import {html} from "lit"
import {LitElementWw} from "@webwriter/lit"
import {customElement} from "lit/decorators.js"
import {msg} from "@lit/localize"
import LOCALIZE from "../localization/generated"

import {epidemicSimStyles} from "./styles/epidemic-sim.styles"
import {drawChart} from "./rendering/chart-renderer"
import {drawSimulation as renderSimulation} from "./rendering/simulation-renderer"
import {getSirCounts, initializeAgents, stepSimulation} from "./simulation/engine"
import {pushHistoryValue, resetHistory} from "./simulation/history"
import type { Agent, SimulationConfig } from "./simulation/types"
import {renderMenu, sideMenuStyles} from "./rendering/menu-renderer"

@customElement("webwriter-epidemic-sim")
export class WebwriterEpidemicSim extends LitElementWw {
  localize = LOCALIZE

  static scopedElements = {}
  static styles = [epidemicSimStyles, sideMenuStyles]

  private config: SimulationConfig = {
    population: 240,
    speed: 1.6,
    infectionRadius: 12,
    infectionProbability: 0.3,
    recoveryDuration: 600,
  }

  private simulationCanvas: HTMLCanvasElement | null = null
  private simulationCtx: CanvasRenderingContext2D | null = null
  private chartCanvas: HTMLCanvasElement | null = null
  private chartCtx: CanvasRenderingContext2D | null = null
  private animationFrame: number | null = null
  private isRunning = false
  private menuOpen = false

  private frameIndex = 0
  private agents: Agent[] = []
  private susceptibleCount = 0
  private infectedCount = 0
  private recoveredCount = 0
  private readonly chartHistoryLimit = 2000
  private susceptibleHistory: number[] = []
  private infectedHistory: number[] = []
  private recoveredHistory: number[] = []

  connectedCallback(): void {
    super.connectedCallback()
    if (this.simulationCanvas) {
      this.startLoop()
    }
  }

  disconnectedCallback(): void {
    this.stopLoop()
    super.disconnectedCallback()
  }

  firstUpdated(): void {
    this.simulationCanvas = this.shadowRoot?.querySelector<HTMLCanvasElement>("#simulation-canvas") ?? null
    this.simulationCtx = this.simulationCanvas?.getContext("2d") ?? null
    this.chartCanvas = this.shadowRoot?.querySelector<HTMLCanvasElement>("#chart-canvas") ?? null
    this.chartCtx = this.chartCanvas?.getContext("2d") ?? null
    this.resetSimulation()
    this.startLoop()
  }

  private resetSimulation = (): void => {
    this.frameIndex = 0
    this.resetChartHistory()
    this.initializeAgents(0)
    this.updateSirCounts()
  }

  private initializeAgents(infectedAtFrame: number): void {
    const canvas = this.simulationCanvas
    if (!canvas) {
      this.agents = []
      return
    }
    this.agents = initializeAgents(
      this.config,
      {width: canvas.width, height: canvas.height},
      infectedAtFrame,
    )
  }

  private parseRangeInput(event: Event): number {
    const target = event.target as HTMLInputElement | null
    return target ? Number(target.value) : 0
  }

  private updatePopulation(event: Event): void {
    const nextPopulation = Math.max(50, Math.min(800, Math.round(this.parseRangeInput(event) / 10) * 10))
    if (nextPopulation === this.config.population) {
      return
    }
    this.config = {...this.config, population: nextPopulation}
    this.reseedPopulation()
    this.requestUpdate()
  }

  private updateSpeed(event: Event): void {
    this.config = {...this.config, speed: this.parseRangeInput(event)}
    this.requestUpdate()
  }

  private updateInfectionRadius(event: Event): void {
    this.config = {...this.config, infectionRadius: this.parseRangeInput(event)}
    this.requestUpdate()
  }

  private updateInfectionProbability(event: Event): void {
    this.config = {...this.config, infectionProbability: this.parseRangeInput(event)}
    this.requestUpdate()
  }

  private updateRecoveryDuration(event: Event): void {
    this.config = {...this.config, recoveryDuration: this.parseRangeInput(event)}
    this.requestUpdate()
  }

  private reseedPopulation(): void {
    this.resetChartHistory()
    this.initializeAgents(this.frameIndex)
    this.updateSirCounts()
  }

  private startLoop(): void {
    if (this.animationFrame !== null) {
      return
    }
    this.isRunning = true
    const tick = () => {
      this.stepSimulation()
      this.drawSimulation()
      this.drawChart()
      this.animationFrame = requestAnimationFrame(tick)
    }
    this.animationFrame = requestAnimationFrame(tick)
  }

  private stopLoop(): void {
    if (this.animationFrame === null) {
      return
    }
    cancelAnimationFrame(this.animationFrame)
    this.animationFrame = null
    this.isRunning = false
  }

  private toggleSimulation = (): void => {
    if (this.isRunning) {
      this.stopLoop()
    } else {
      this.startLoop()
    }
    this.requestUpdate()
  }

  private toggleMenu = (): void => {
    this.menuOpen = !this.menuOpen
    this.requestUpdate()
  }

  private stepSimulation(): void {
    if (!this.simulationCanvas || this.agents.length === 0) {
      return
    }
    this.frameIndex = stepSimulation(
      this.agents,
      this.frameIndex,
      this.config,
      {width: this.simulationCanvas.width, height: this.simulationCanvas.height},
    )
    this.updateSirCounts()
  }

  private updateSirCounts(): void {
    const counts = getSirCounts(this.agents)
    this.susceptibleCount = counts.susceptible
    this.infectedCount = counts.infected
    this.recoveredCount = counts.recovered
    this.recordChartPoint()
  }

  private resetChartHistory(): void {
    this.susceptibleHistory = resetHistory()
    this.infectedHistory = resetHistory()
    this.recoveredHistory = resetHistory()
  }

  private recordChartPoint(): void {
    pushHistoryValue(this.susceptibleHistory, this.susceptibleCount, this.chartHistoryLimit)
    pushHistoryValue(this.infectedHistory, this.infectedCount, this.chartHistoryLimit)
    pushHistoryValue(this.recoveredHistory, this.recoveredCount, this.chartHistoryLimit)
  }

  private drawSimulation(): void {
    const ctx = this.simulationCtx
    const canvas = this.simulationCanvas
    if (!ctx || !canvas) {
      return
    }
    renderSimulation(ctx, canvas, this.agents)
  }

  private drawChart(): void {
    const ctx = this.chartCtx
    const canvas = this.chartCanvas
    if (!ctx || !canvas) {
      return
    }
    drawChart(ctx, canvas, this.config.population, [
      {values: this.susceptibleHistory, color: "#2563eb"},
      {values: this.infectedHistory, color: "#dc2626"},
      {values: this.recoveredHistory, color: "#16a34a"},
    ])
  }

  render() {
    return html`
      <section class="widget-shell ${this.menuOpen ? "menu-open" : ""}">
        <section class="main-content">
          <section class="layout" aria-label=${msg("Epidemic simulation layout")}>
            <article class="panel panel--chart">
              <canvas
                id="chart-canvas"
                width="600"
                height="360"
                aria-label=${msg("SIR line chart canvas")}
              ></canvas>
            </article>

            <article class="panel panel--controls">
              <div class="controls">
                <label class="control">
                  <span class="control-head">
                    <span>${msg("Population")}</span>
                    <span class="control-value">${this.config.population}</span>
                  </span>
                  <input
                    type="range"
                    min="50"
                    max="800"
                    step="10"
                    .value=${String(this.config.population)}
                    @input=${this.updatePopulation}
                  />
                </label>

                <label class="control">
                  <span class="control-head">
                    <span>${msg("Speed")}</span>
                    <span class="control-value">${this.config.speed.toFixed(1)}</span>
                  </span>
                  <input
                    type="range"
                    min="0.2"
                    max="4"
                    step="0.1"
                    .value=${String(this.config.speed)}
                    @input=${this.updateSpeed}
                  />
                </label>

                <label class="control">
                  <span class="control-head">
                    <span>${msg("Infection radius")}</span>
                    <span class="control-value">${this.config.infectionRadius}</span>
                  </span>
                  <input
                    type="range"
                    min="4"
                    max="40"
                    step="1"
                    .value=${String(this.config.infectionRadius)}
                    @input=${this.updateInfectionRadius}
                  />
                </label>

                <label class="control">
                  <span class="control-head">
                    <span>${msg("Infection probability")}</span>
                    <span class="control-value">${Math.round(this.config.infectionProbability * 100)}%</span>
                  </span>
                  <input
                    type="range"
                    min="0.01"
                    max="1"
                    step="0.01"
                    .value=${String(this.config.infectionProbability)}
                    @input=${this.updateInfectionProbability}
                  />
                </label>

                <label class="control">
                  <span class="control-head">
                    <span>${msg("Recovery duration")}</span>
                    <span class="control-value">${this.config.recoveryDuration}f</span>
                  </span>
                  <input
                    type="range"
                    min="60"
                    max="2400"
                    step="30"
                    .value=${String(this.config.recoveryDuration)}
                    @input=${this.updateRecoveryDuration}
                  />
                </label>
              </div>
            </article>

            <article class="panel panel--simulation">
              <canvas
                id="simulation-canvas"
                width="600"
                height="360"
                aria-label=${msg("Agent simulation canvas")}
              ></canvas>
              <div class="actions simulation-actions">
                <button type="button" @click=${this.toggleSimulation}>
                  ${this.isRunning ? msg("Pause") : msg("Start")}
                </button>
                <button type="button" @click=${this.resetSimulation}>${msg("Reset simulation")}</button>
              </div>
            </article>
          </section>
        </section>

        ${renderMenu({
          menuOpen: this.menuOpen,
          susceptibleCount: this.susceptibleCount,
          infectedCount: this.infectedCount,
          recoveredCount: this.recoveredCount,
        })}

        <button class="menu-toggle-button" type="button" @click=${this.toggleMenu}>
          ${this.menuOpen ? msg("Hide menu") : msg("Show menu")}
        </button>
      </section>
    `
  }
}
