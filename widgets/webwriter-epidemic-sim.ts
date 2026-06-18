import {html} from "lit"
import type {PropertyValues, TemplateResult} from "lit"
import {LitElementWw} from "@webwriter/lit"
import {customElement, property} from "lit/decorators.js"
import {msg} from "@lit/localize"
import SlButton from "@shoelace-style/shoelace/dist/components/button/button.component.js"
import SlCard from "@shoelace-style/shoelace/dist/components/card/card.component.js"
import SlDetails from "@shoelace-style/shoelace/dist/components/details/details.component.js"
import SlRange from "@shoelace-style/shoelace/dist/components/range/range.component.js"
import SlSwitch from "@shoelace-style/shoelace/dist/components/switch/switch.component.js"
import SlTag from "@shoelace-style/shoelace/dist/components/tag/tag.component.js"
import SlSelect from "@shoelace-style/shoelace/dist/components/select/select.component.js"
import SlOption from "@shoelace-style/shoelace/dist/components/option/option.component.js"
import LOCALIZE from "../localization/generated"

import {epidemicSimStyles} from "./styles/epidemic-sim.styles"
import {hasVisibleMenuControls, renderMenu, sideMenuStyles} from "./rendering/menu-renderer"
import {renderTeacherOptions, teacherOptionsStyles, type RenderTeacherOptionsInput} from "./rendering/teacher-options-renderer"
import {destroyChart, drawChart, resetChart} from "./rendering/chart-renderer"
import type {ChartSeries} from "./rendering/chart-renderer"
import {drawSimulation as renderSimulation} from "./rendering/simulation-renderer"
import {getEpidemicCounts, initializeAgents, stepSimulation} from "./simulation/engine"
import {
  DEFAULT_MODEL_SPECIFIC_DEFAULTS,
  getChartCompartments,
  isEpidemicModelType,
  type ChartCompartment,
  type EpidemicModelType,
} from "./simulation/epidemic-models"
import {pushHistoryValue, resetHistory} from "./simulation/history"
import type {
  Agent,
  CommunityCell,
  Hotspot,
  Rect,
  SimulationAreas,
  SimulationConfig,
  SimulationSnapshot,
} from "./simulation/types"

const FRAMES_PER_DAY = 24

const booleanAttributeConverter = {
  fromAttribute: (value: string | null): boolean => value !== null && value.toLowerCase() !== "false",
  toAttribute: (value: boolean): string | null => (value ? "" : null),
}

const numberAttributeConverter = {
  fromAttribute: (value: string | null): number => {
    if (value === null || value === "") {
      return NaN
    }
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : NaN
  },
  toAttribute: (value: number): string | null => (Number.isFinite(value) ? String(value) : null),
}

const modelTypeAttributeConverter = {
  fromAttribute: (value: string | null): EpidemicModelType => {
    if (value && isEpidemicModelType(value)) {
      return value
    }
    return "sir"
  },
  toAttribute: (value: EpidemicModelType): string => value,
}

@customElement("webwriter-epidemic-sim")
export class WebwriterEpidemicSim extends LitElementWw {
  localize = LOCALIZE

  static options = {}

  static scopedElements = {
    "sl-button": SlButton,
    "sl-card": SlCard,
    "sl-details": SlDetails,
    "sl-range": SlRange,
    "sl-switch": SlSwitch,
    "sl-tag": SlTag,
    "sl-select": SlSelect,
    "sl-option": SlOption,
  }
  static styles = [epidemicSimStyles, sideMenuStyles, teacherOptionsStyles]

  @property({
    type: String,
    attribute: "model-type",
    reflect: true,
    converter: modelTypeAttributeConverter,
  })
  accessor modelType: EpidemicModelType = "sir"

  @property({type: Boolean, attribute: true, reflect: true, converter: booleanAttributeConverter})
  accessor allowModelTypeControl = false

  @property({type: Number, attribute: true, reflect: true, converter: numberAttributeConverter})
  accessor incubationDuration = DEFAULT_MODEL_SPECIFIC_DEFAULTS.incubationDuration

  @property({type: Boolean, attribute: true, reflect: true, converter: booleanAttributeConverter})
  accessor allowIncubationDurationControl = false

  @property({type: Number, attribute: true, reflect: true, converter: numberAttributeConverter})
  accessor immunityDuration = DEFAULT_MODEL_SPECIFIC_DEFAULTS.immunityDuration

  @property({type: Boolean, attribute: true, reflect: true, converter: booleanAttributeConverter})
  accessor allowImmunityDurationControl = false

  @property({type: Number, attribute: true, reflect: true, converter: numberAttributeConverter})
  accessor mortalityProbability = DEFAULT_MODEL_SPECIFIC_DEFAULTS.mortalityProbability

  @property({type: Boolean, attribute: true, reflect: true, converter: booleanAttributeConverter})
  accessor allowMortalityProbabilityControl = false

  @property({type: Number, attribute: true, reflect: true, converter: numberAttributeConverter})
  accessor population = 240

  @property({type: Boolean, attribute: true, reflect: true, converter: booleanAttributeConverter})
  accessor allowPopulationControl = false

  @property({type: Number, attribute: true, reflect: true, converter: numberAttributeConverter})
  accessor speed = 1.6

  @property({type: Boolean, attribute: true, reflect: true, converter: booleanAttributeConverter})
  accessor allowSpeedControl = false

  @property({type: Number, attribute: true, reflect: true, converter: numberAttributeConverter})
  accessor infectionRadius = 10

  @property({type: Boolean, attribute: true, reflect: true, converter: booleanAttributeConverter})
  accessor allowInfectionRadiusControl = false

  @property({type: Number, attribute: true, reflect: true, converter: numberAttributeConverter})
  accessor infectionProbability = 0.2

  @property({type: Boolean, attribute: true, reflect: true, converter: booleanAttributeConverter})
  accessor allowInfectionProbabilityControl = false

  @property({type: Number, attribute: true, reflect: true, converter: numberAttributeConverter})
  accessor recoveryDuration = 600

  @property({type: Boolean, attribute: true, reflect: true, converter: booleanAttributeConverter})
  accessor allowRecoveryDurationControl = false

  @property({type: Boolean, attribute: true, reflect: true, converter: booleanAttributeConverter})
  accessor quarantineEnabled = false

  @property({type: Boolean, attribute: true, reflect: true, converter: booleanAttributeConverter})
  accessor allowQuarantineEnabledControl = false

  @property({type: Number, attribute: true, reflect: true, converter: numberAttributeConverter})
  accessor quarantineProbability = 0.7

  @property({type: Boolean, attribute: true, reflect: true, converter: booleanAttributeConverter})
  accessor allowQuarantineProbabilityControl = false

  @property({type: Number, attribute: true, reflect: true, converter: numberAttributeConverter})
  accessor quarantineDuration = 450

  @property({type: Boolean, attribute: true, reflect: true, converter: booleanAttributeConverter})
  accessor allowQuarantineDurationControl = false

  @property({type: Boolean, attribute: true, reflect: true, converter: booleanAttributeConverter})
  accessor hotspotsEnabled = false

  @property({type: Boolean, attribute: true, reflect: true, converter: booleanAttributeConverter})
  accessor allowHotspotsEnabledControl = false

  @property({type: Number, attribute: true, reflect: true, converter: numberAttributeConverter})
  accessor hotspotVisitProbability = 0.004

  @property({type: Boolean, attribute: true, reflect: true, converter: booleanAttributeConverter})
  accessor allowHotspotVisitProbabilityControl = false

  @property({type: Number, attribute: true, reflect: true, converter: numberAttributeConverter})
  accessor hotspotStayDuration = 240

  @property({type: Boolean, attribute: true, reflect: true, converter: booleanAttributeConverter})
  accessor allowHotspotStayDurationControl = false

  @property({type: Number, attribute: true, reflect: true, converter: numberAttributeConverter})
  accessor hotspotMaxAgents = 30

  @property({type: Boolean, attribute: true, reflect: true, converter: booleanAttributeConverter})
  accessor allowHotspotMaxAgentsControl = false

  @property({type: Number, attribute: true, reflect: true, converter: numberAttributeConverter})
  accessor hotspotSize = 56

  @property({type: Boolean, attribute: true, reflect: true, converter: booleanAttributeConverter})
  accessor allowHotspotSizeControl = false

  @property({type: Boolean, attribute: true, reflect: true, converter: booleanAttributeConverter})
  accessor communitiesEnabled = false

  @property({type: Boolean, attribute: true, reflect: true, converter: booleanAttributeConverter})
  accessor allowCommunitiesEnabledControl = false

  @property({type: Number, attribute: true, reflect: true, converter: numberAttributeConverter})
  accessor communityLeaveProbability = 0.0004

  @property({type: Boolean, attribute: true, reflect: true, converter: booleanAttributeConverter})
  accessor allowCommunityLeaveProbabilityControl = false

  private get config(): SimulationConfig {
    return {
      modelType: this.modelType,
      incubationDuration: this.incubationDuration,
      immunityDuration: this.immunityDuration,
      mortalityProbability: this.mortalityProbability,
      population: this.population,
      speed: this.speed,
      infectionRadius: this.infectionRadius,
      infectionProbability: this.infectionProbability,
      recoveryDuration: this.recoveryDuration,
      quarantineEnabled: this.quarantineEnabled,
      quarantineProbability: this.quarantineProbability,
      quarantineDuration: this.quarantineDuration,
      hotspotsEnabled: this.hotspotsEnabled,
      hotspotCount: 3,
      hotspotVisitProbability: this.hotspotVisitProbability,
      hotspotStayDuration: this.hotspotStayDuration,
      hotspotMaxAgents: this.hotspotMaxAgents,
      hotspotSize: this.hotspotSize,
      communitiesEnabled: this.communitiesEnabled,
      communityLeaveProbability: this.communityLeaveProbability,
    }
  }

  private simulationCanvas: HTMLCanvasElement | null = null
  private simulationCtx: CanvasRenderingContext2D | null = null
  private chartCanvas: HTMLCanvasElement | null = null
  private enlargedChartCanvas: HTMLCanvasElement | null = null
  private animationFrame: number | null = null
  private isRunning = false
  private chartOverlayOpen = false
  private snapshotsOverlayOpen = false
  private showApproximateFitOverlay = false
  private snapshots: SimulationSnapshot[] = []
  private nextSnapshotId = 1
  private chartContextMenuOpen = false
  private chartContextMenuPosition = {x: 0, y: 0}

  private frameIndex = 0
  private agents: Agent[] = []
  private susceptibleCount = 0
  private exposedCount = 0
  private infectedCount = 0
  private recoveredCount = 0
  private deadCount = 0
  private readonly chartHistoryLimit = 2000
  private susceptibleHistory: number[] = []
  private exposedHistory: number[] = []
  private infectedHistory: number[] = []
  private recoveredHistory: number[] = []
  private deadHistory: number[] = []
  private epidemicEnded = false
  private hadInfection = false
  private userHotspots: Hotspot[] = []
  private nextHotspotId = 0
  private draggingHotspotId: number | null = null
  private resizingHotspotId: number | null = null
  private resizingCorner: "nw" | "ne" | "sw" | "se" | null = null
  private hotspotResizeAnchor = {x: 0, y: 0}
  private hotspotDragOffset = {x: 0, y: 0}
  private canvasDropActive = false
  private isCreatingHotspotDrag = false

  connectedCallback(): void {
    super.connectedCallback()
    window.addEventListener("keydown", this.onWindowKeyDown)
    if (this.simulationCanvas) {
      this.startLoop()
    }
  }

  protected updated(changed: PropertyValues<this>): void {
    if (changed.has("population") && changed.get("population") !== undefined) {
      this.reseedPopulation()
      return
    }
    if (changed.has("modelType") && changed.get("modelType") !== undefined) {
      this.resetSimulation()
      return
    }
    if (
      changed.has("quarantineEnabled") ||
      changed.has("hotspotsEnabled") ||
      changed.has("communitiesEnabled") ||
      changed.has("infectionRadius") ||
      changed.has("hotspotSize")
    ) {
      this.redrawSimulationWhenPaused()
    }
  }

  disconnectedCallback(): void {
    this.stopLoop()
    this.onWindowPointerUp()
    destroyChart(this.chartCanvas)
    destroyChart(this.enlargedChartCanvas)
    window.removeEventListener("keydown", this.onWindowKeyDown)
    super.disconnectedCallback()
  }

  firstUpdated(): void {
    this.simulationCanvas = this.shadowRoot?.querySelector<HTMLCanvasElement>("#simulation-canvas") ?? null
    this.simulationCtx = this.simulationCanvas?.getContext("2d") ?? null
    this.chartCanvas = this.shadowRoot?.querySelector<HTMLCanvasElement>("#chart-canvas") ?? null
    this.resetSimulation()
    this.startLoop()
  }

  private resetSimulation = (): void => {
    this.onWindowPointerUp()
    this.frameIndex = 0
    this.canvasDropActive = false
    this.isCreatingHotspotDrag = false
    this.epidemicEnded = false
    this.hadInfection = false
    resetChart(this.chartCanvas)
    this.resetChartHistory()
    this.initializeAgents(0)
    this.updateEpidemicCounts()
    this.drawChart()
    this.requestUpdateAndRedrawSimulationWhenPaused()
  }

  private initializeAgents(infectedAtFrame: number): void {
    const canvas = this.simulationCanvas
    if (!canvas) {
      this.agents = []
      return
    }
    const areas = this.getSimulationAreas()
    this.agents = initializeAgents(
      this.config,
      areas,
      infectedAtFrame,
    )
  }

  private parseRangeInput(event: Event): number {
    const target = (event.currentTarget ?? event.target) as ({value?: string | number} & EventTarget) | null
    return target?.value !== undefined ? Number(target.value) : 0
  }

  private parseSwitch(event: Event): boolean {
    const target = (event.currentTarget ?? event.target) as ({checked?: boolean} & EventTarget) | null
    return target?.checked ?? false
  }

  private get isEditMode(): boolean {
    return this.contentEditable === "true" || this.contentEditable === ""
  }

  private get hasVisibleMenuControls(): boolean {
    return hasVisibleMenuControls(this.getMenuAllowFlags())
  }

  private getMenuAllowFlags() {
    return {
      allowModelTypeControl: this.allowModelTypeControl,
      allowIncubationDurationControl: this.allowIncubationDurationControl,
      allowImmunityDurationControl: this.allowImmunityDurationControl,
      allowMortalityProbabilityControl: this.allowMortalityProbabilityControl,
      allowPopulationControl: this.allowPopulationControl,
      allowSpeedControl: this.allowSpeedControl,
      allowInfectionRadiusControl: this.allowInfectionRadiusControl,
      allowInfectionProbabilityControl: this.allowInfectionProbabilityControl,
      allowRecoveryDurationControl: this.allowRecoveryDurationControl,
      allowQuarantineEnabledControl: this.allowQuarantineEnabledControl,
      allowHotspotsEnabledControl: this.allowHotspotsEnabledControl,
      allowCommunitiesEnabledControl: this.allowCommunitiesEnabledControl,
      allowQuarantineProbabilityControl: this.allowQuarantineProbabilityControl,
      allowQuarantineDurationControl: this.allowQuarantineDurationControl,
      allowHotspotVisitProbabilityControl: this.allowHotspotVisitProbabilityControl,
      allowHotspotStayDurationControl: this.allowHotspotStayDurationControl,
      allowHotspotMaxAgentsControl: this.allowHotspotMaxAgentsControl,
      allowHotspotSizeControl: this.allowHotspotSizeControl,
      allowCommunityLeaveProbabilityControl: this.allowCommunityLeaveProbabilityControl,
    }
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value))
  }

  private redrawSimulationWhenPaused(): void {
    if (!this.isRunning) {
      this.drawSimulation()
    }
  }

  private requestUpdateAndRedrawSimulationWhenPaused(): void {
    this.requestUpdate()
    this.redrawSimulationWhenPaused()
  }

  private updateConfig<K extends keyof SimulationConfig>(key: K, value: SimulationConfig[K]): void {
    if (key === "hotspotCount") {
      return
    }
    ;(this as unknown as Record<string, SimulationConfig[K]>)[key as string] = value
    this.requestUpdateAndRedrawSimulationWhenPaused()
  }

  private updateConfigFromRange<K extends keyof SimulationConfig>(event: Event, key: K): void {
    this.updateConfig(key, this.parseRangeInput(event) as SimulationConfig[K])
  }

  private updateModelType(event: Event): void {
    const target = (event.currentTarget ?? event.target) as ({value?: string} & EventTarget) | null
    const value = target?.value
    if (!value || !isEpidemicModelType(value) || value === this.modelType) {
      return
    }
    this.modelType = value
  }

  private hasActiveInfection(): boolean {
    return this.infectedCount > 0 || this.exposedCount > 0
  }

  private updateIncubationDuration(event: Event): void {
    this.updateConfigFromRange(event, "incubationDuration")
  }

  private updateImmunityDuration(event: Event): void {
    this.updateConfigFromRange(event, "immunityDuration")
  }

  private updateMortalityProbability(event: Event): void {
    this.updateConfigFromRange(event, "mortalityProbability")
  }

  private updatePopulation(event: Event): void {
    const nextPopulation = this.clamp(Math.round(this.parseRangeInput(event) / 10) * 10, 50, 800)
    if (nextPopulation === this.population) {
      return
    }
    this.population = nextPopulation
  }

  private updateSpeed(event: Event): void {
    this.updateConfigFromRange(event, "speed")
  }

  private updateInfectionRadius(event: Event): void {
    this.updateConfigFromRange(event, "infectionRadius")
  }

  private updateInfectionProbability(event: Event): void {
    this.updateConfigFromRange(event, "infectionProbability")
  }

  private updateRecoveryDuration(event: Event): void {
    this.updateConfigFromRange(event, "recoveryDuration")
  }

  private updateQuarantineEnabled(event: Event): void {
    this.updateConfig("quarantineEnabled", this.parseSwitch(event))
  }

  private updateQuarantineProbability(event: Event): void {
    this.updateConfigFromRange(event, "quarantineProbability")
  }

  private updateQuarantineDuration(event: Event): void {
    this.updateConfigFromRange(event, "quarantineDuration")
  }

  private updateHotspotsEnabled(event: Event): void {
    this.updateConfig("hotspotsEnabled", this.parseSwitch(event))
  }

  private updateHotspotVisitProbability(event: Event): void {
    this.updateConfigFromRange(event, "hotspotVisitProbability")
  }

  private updateHotspotStayDuration(event: Event): void {
    this.updateConfigFromRange(event, "hotspotStayDuration")
  }

  private updateHotspotMaxAgents(event: Event): void {
    const maxAgents = this.clamp(Math.round(this.parseRangeInput(event)), 1, 120)
    this.updateConfig("hotspotMaxAgents", maxAgents)
  }

  private updateHotspotSize(event: Event): void {
    const size = this.clamp(Math.round(this.parseRangeInput(event)), 24, 110)
    this.updateConfig("hotspotSize", size)
  }

  private updateCommunitiesEnabled(event: Event): void {
    this.updateConfig("communitiesEnabled", this.parseSwitch(event))
  }

  private updateCommunityLeaveProbability(event: Event): void {
    this.updateConfigFromRange(event, "communityLeaveProbability")
  }

  private reseedPopulation(): void {
    this.epidemicEnded = false
    this.hadInfection = false
    resetChart(this.chartCanvas)
    this.resetChartHistory()
    this.initializeAgents(this.frameIndex)
    this.updateEpidemicCounts()
    this.drawChart()
    this.redrawSimulationWhenPaused()
  }

  private startLoop(): void {
    if (this.animationFrame !== null) {
      return
    }
    this.isRunning = true
    const tick = () => {
      if (!this.isRunning) {
        this.animationFrame = null
        return
      }
      this.stepSimulation()
      this.drawSimulation()
      if (this.isRunning) {
        this.drawChart()
        if (this.chartOverlayOpen) {
          this.requestUpdate()
        }
      }
      if (this.isRunning) {
        this.animationFrame = requestAnimationFrame(tick)
      } else {
        this.animationFrame = null
      }
    }
    this.animationFrame = requestAnimationFrame(tick)
    this.requestUpdate()
  }

  private stopLoop(): void {
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame)
      this.animationFrame = null
    }
    if (this.isRunning) {
      this.isRunning = false
      this.requestUpdate()
    }
  }

  private toggleSimulation = (): void => {
    if (this.isRunning) {
      this.stopLoop()
    } else {
      if (!this.hasActiveInfection()) {
        this.restartSimulationPreservingHotspots()
      }
      this.startLoop()
    }
    this.requestUpdate()
  }

  private onMainContentClick = (): void => {
    this.closeChartContextMenu()
  }

  private cloneHotspots(hotspots: Hotspot[]): Hotspot[] {
    return hotspots.map((hotspot) => ({
      ...hotspot,
      rect: {...hotspot.rect},
    }))
  }

  private captureChartSnapshotImage(): string | null {
    const sourceCanvas = this.chartOverlayOpen && this.enlargedChartCanvas ? this.enlargedChartCanvas : this.chartCanvas
    if (!sourceCanvas) {
      return null
    }
    const includeApproximation = sourceCanvas === this.enlargedChartCanvas && this.showApproximateFitOverlay
    const series = this.buildChartSeries(includeApproximation)
    const labels = this.buildChartDayLabels(series)
    const xAxisTitle = msg("Time (days)")
    try {
      drawChart(sourceCanvas, this.config.population, series, {showLegend: false, labels, xAxisTitle})
      const exportCanvas = document.createElement("canvas")
      exportCanvas.width = sourceCanvas.width
      exportCanvas.height = sourceCanvas.height
      const exportContext = exportCanvas.getContext("2d")
      if (!exportContext) {
        drawChart(sourceCanvas, this.config.population, series, {showLegend: true, labels, xAxisTitle})
        return null
      }
      exportContext.fillStyle = "#ffffff"
      exportContext.fillRect(0, 0, exportCanvas.width, exportCanvas.height)
      exportContext.drawImage(sourceCanvas, 0, 0)
      const jpeg = exportCanvas.toDataURL("image/jpeg", 0.9)
      drawChart(sourceCanvas, this.config.population, series, {showLegend: true, labels, xAxisTitle})
      return jpeg
    } catch {
      drawChart(sourceCanvas, this.config.population, series, {showLegend: true, labels, xAxisTitle})
      return null
    }
  }

  private createSnapshot = (): void => {
    const snapshotId = `snapshot-${this.nextSnapshotId}`
    this.nextSnapshotId += 1
    this.drawChart()
    const snapshot: SimulationSnapshot = {
      id: snapshotId,
      label: `${msg("Snapshot")} ${this.nextSnapshotId - 1}`,
      createdAt: Date.now(),
      chartImageJpeg: this.captureChartSnapshotImage(),
      estimatedR0: this.estimateBasicReproductionNumber(),
      config: {...this.config},
      frameIndex: this.frameIndex,
      epidemicEnded: this.epidemicEnded,
      susceptibleCount: this.susceptibleCount,
      exposedCount: this.exposedCount,
      infectedCount: this.infectedCount,
      recoveredCount: this.recoveredCount,
      deadCount: this.deadCount,
      susceptibleHistory: [...this.susceptibleHistory],
      exposedHistory: [...this.exposedHistory],
      infectedHistory: [...this.infectedHistory],
      recoveredHistory: [...this.recoveredHistory],
      deadHistory: [...this.deadHistory],
      userHotspots: this.cloneHotspots(this.userHotspots),
    }
    this.snapshots = [snapshot, ...this.snapshots]
    this.closeChartContextMenu()
    this.requestUpdate()
  }

  private deleteSnapshot = (snapshotId: string): void => {
    this.snapshots = this.snapshots.filter((snapshot) => snapshot.id !== snapshotId)
    this.requestUpdate()
  }

  private onWindowKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== "Escape") {
      return
    }
    if (this.chartContextMenuOpen) {
      this.closeChartContextMenu()
      return
    }
    if (this.snapshotsOverlayOpen) {
      this.closeSnapshotsOverlay()
      return
    }
    if (!this.chartOverlayOpen) {
      return
    }
    this.closeChartOverlay()
  }

  private openChartOverlay = async (): Promise<void> => {
    if (this.chartOverlayOpen) {
      return
    }
    this.closeSnapshotsOverlay()
    this.chartOverlayOpen = true
    this.closeChartContextMenu()
    this.requestUpdate()
    await this.updateComplete
    this.enlargedChartCanvas = this.shadowRoot?.querySelector<HTMLCanvasElement>("#chart-canvas-enlarged") ?? null
    this.drawChart()
  }

  private closeChartOverlay = (): void => {
    if (!this.chartOverlayOpen) {
      return
    }
    this.chartOverlayOpen = false
    destroyChart(this.enlargedChartCanvas)
    this.enlargedChartCanvas = null
    this.requestUpdate()
  }

  private openSnapshotsOverlay = (): void => {
    if (this.snapshotsOverlayOpen) {
      return
    }
    this.closeChartOverlay()
    this.closeChartContextMenu()
    this.snapshotsOverlayOpen = true
    this.requestUpdate()
  }

  private closeSnapshotsOverlay = (): void => {
    if (!this.snapshotsOverlayOpen) {
      return
    }
    this.snapshotsOverlayOpen = false
    this.requestUpdate()
  }

  private onSnapshotsOverlayBackdropClick = (event: MouseEvent): void => {
    if (event.target !== event.currentTarget) {
      return
    }
    this.closeSnapshotsOverlay()
  }

  private onChartOverlayBackdropClick = (event: MouseEvent): void => {
    if (event.target !== event.currentTarget) {
      return
    }
    this.closeChartOverlay()
  }

  private onChartPanelDoubleClick = (): void => {
    void this.openChartOverlay()
  }

  private onChartContextMenu = (event: MouseEvent): void => {
    event.preventDefault()
    event.stopPropagation()
    this.chartContextMenuPosition = {x: event.clientX, y: event.clientY}
    this.chartContextMenuOpen = true
    this.requestUpdate()
  }

  private closeChartContextMenu = (): void => {
    if (!this.chartContextMenuOpen) {
      return
    }
    this.chartContextMenuOpen = false
    this.requestUpdate()
  }

  private updateApproximateFitOverlay = (event: Event): void => {
    this.showApproximateFitOverlay = this.parseSwitch(event)
    this.drawChart()
  }

  private stepSimulation(): void {
    if (!this.simulationCanvas || this.agents.length === 0) {
      return
    }
    const areas = this.getSimulationAreas()
    this.frameIndex = stepSimulation(
      this.agents,
      this.frameIndex,
      this.config,
      areas,
    )
    this.updateEpidemicCounts()
    if (!this.hasActiveInfection() && this.isRunning && this.hadInfection && this.config.modelType !== "sirs") {
      this.stopLoop()
      this.drawChart()
      this.requestUpdate()
    }
  }

  private updateEpidemicCounts(): void {
    const counts = getEpidemicCounts(this.agents)
    this.susceptibleCount = counts.susceptible
    this.exposedCount = counts.exposed
    this.infectedCount = counts.infected
    this.recoveredCount = counts.recovered
    this.deadCount = counts.dead
    this.recordChartPoint()
  }

  private resetChartHistory(): void {
    this.susceptibleHistory = resetHistory()
    this.exposedHistory = resetHistory()
    this.infectedHistory = resetHistory()
    this.recoveredHistory = resetHistory()
    this.deadHistory = resetHistory()
  }

  private recordChartPoint(): void {
    const activeInfection = this.hasActiveInfection()
    if (activeInfection) {
      this.hadInfection = true
      if (this.config.modelType === "sirs") {
        this.epidemicEnded = false
      }
    }

    if (this.epidemicEnded) {
      return
    }

    const waveEnded = this.hadInfection && !activeInfection
    const isFullDayCheckpoint = this.frameIndex % FRAMES_PER_DAY === 0
    if (!isFullDayCheckpoint) {
      if (waveEnded && this.config.modelType !== "sirs") {
        this.epidemicEnded = true
      }
      return
    }

    pushHistoryValue(this.susceptibleHistory, this.susceptibleCount, this.chartHistoryLimit)
    pushHistoryValue(this.exposedHistory, this.exposedCount, this.chartHistoryLimit)
    pushHistoryValue(this.infectedHistory, this.infectedCount, this.chartHistoryLimit)
    pushHistoryValue(this.recoveredHistory, this.recoveredCount, this.chartHistoryLimit)
    pushHistoryValue(this.deadHistory, this.deadCount, this.chartHistoryLimit)
    if (waveEnded && this.config.modelType !== "sirs") {
      this.epidemicEnded = true
    }
  }

  private drawSimulation(): void {
    const ctx = this.simulationCtx
    const canvas = this.simulationCanvas
    if (!ctx || !canvas) {
      return
    }
    renderSimulation(ctx, canvas, this.agents, this.getSimulationAreas())
  }

  private drawChart(): void {
    const compactCanvas = this.chartCanvas
    const compactSeries = this.buildChartSeries(false)
    const compactLabels = this.buildChartDayLabels(compactSeries)
    const xAxisTitle = msg("Time (days)")
    if (compactCanvas) {
      drawChart(compactCanvas, this.config.population, compactSeries, {
        labels: compactLabels,
        xAxisTitle,
      })
    }
    if (this.chartOverlayOpen && this.enlargedChartCanvas) {
      const enlargedSeries = this.buildChartSeries(this.showApproximateFitOverlay)
      drawChart(this.enlargedChartCanvas, this.config.population, enlargedSeries, {
        labels: this.buildChartDayLabels(enlargedSeries),
        xAxisTitle,
      })
    }
  }

  private buildChartDayLabels(series: ChartSeries[]): string[] {
    const length = series.reduce((maxLength, entry) => Math.max(maxLength, entry.values.length), 0)
    return Array.from({length}, (_, dayIndex) => String(dayIndex))
  }

  private buildChartSeries(includeApproximation: boolean): ChartSeries[] {
    const compartmentSeries: Record<ChartCompartment, ChartSeries> = {
      susceptible: {label: msg("Susceptible"), values: this.susceptibleHistory, color: "#2563eb"},
      exposed: {label: msg("Exposed"), values: this.exposedHistory, color: "#f59e0b"},
      infected: {label: msg("Infected"), values: this.infectedHistory, color: "#dc2626"},
      recovered: {label: msg("Recovered"), values: this.recoveredHistory, color: "#16a34a"},
      dead: {label: msg("Dead"), values: this.deadHistory, color: "#64748b"},
    }
    const baseSeries = getChartCompartments(this.config.modelType).map((compartment) => compartmentSeries[compartment])
    if (!includeApproximation || this.config.modelType !== "sir") {
      return baseSeries
    }
    return [...baseSeries, ...this.buildApproximationSeries()]
  }

  private buildApproximationSeries(): ChartSeries[] {
    const length = this.infectedHistory.length
    if (length < 2) {
      return []
    }
    const estimatedR0 = this.estimateBasicReproductionNumber()
    if (estimatedR0 === null || estimatedR0 <= 0) {
      return []
    }
    const population = Math.max(1, this.config.population)
    const gamma = FRAMES_PER_DAY / Math.max(1, this.config.recoveryDuration)
    const beta = estimatedR0 * gamma
    let susceptible = this.susceptibleHistory[0] ?? population
    let infected = this.infectedHistory[0] ?? 0
    let recovered = this.recoveredHistory[0] ?? 0
    const susceptibleFit = [susceptible]
    const infectedFit = [infected]
    const recoveredFit = [recovered]
    for (let i = 1; i < length; i += 1) {
      const newInfections = beta * susceptible * infected / population
      const newRecoveries = gamma * infected
      susceptible = this.clamp(susceptible - newInfections, 0, population)
      infected = this.clamp(infected + newInfections - newRecoveries, 0, population)
      recovered = this.clamp(population - susceptible - infected, 0, population)
      susceptibleFit.push(susceptible)
      infectedFit.push(infected)
      recoveredFit.push(recovered)
    }
    return [
      {label: msg("Susceptible (fit)"), values: susceptibleFit, color: "#60a5fa", dash: [6, 4], lineWidth: 1.5},
      {label: msg("Infected (fit)"), values: infectedFit, color: "#f87171", dash: [6, 4], lineWidth: 1.5},
      {label: msg("Recovered (fit)"), values: recoveredFit, color: "#4ade80", dash: [6, 4], lineWidth: 1.5},
    ]
  }

  private estimateBasicReproductionNumber(): number | null {
    const infected = this.infectedHistory
    const length = infected.length
    if (length < 5) {
      return null
    }
    let peakIndex = 0
    let peakValue = -1
    for (let i = 0; i < length; i += 1) {
      if (infected[i] > peakValue) {
        peakValue = infected[i]
        peakIndex = i
      }
    }
    if (peakValue <= 0 || peakIndex < 2) {
      return null
    }
    let sumLogGrowth = 0
    let sampleCount = 0
    const growthWindowEnd = Math.min(peakIndex, 80)
    for (let i = 1; i <= growthWindowEnd; i += 1) {
      const previous = infected[i - 1]
      const current = infected[i]
      if (previous <= 0 || current <= previous) {
        continue
      }
      sumLogGrowth += Math.log(current / previous)
      sampleCount += 1
    }
    if (sampleCount < 3) {
      return null
    }
    const averageLogGrowth = sumLogGrowth / sampleCount
    const gamma = FRAMES_PER_DAY / Math.max(1, this.config.recoveryDuration)
    const estimatedR0 = 1 + averageLogGrowth / gamma
    if (!Number.isFinite(estimatedR0) || estimatedR0 <= 0) {
      return null
    }
    return estimatedR0
  }

  private computeChartInsights(): {
    peakInfected: number
    peakFrame: number
    currentFrame: number
    currentSusceptible: number
    currentExposed: number
    currentInfected: number
    currentRecovered: number
    currentDead: number
    currentSusceptibleShare: number
    currentExposedShare: number
    currentInfectedShare: number
    currentRecoveredShare: number
    currentDeadShare: number
    finalRecoveredShare: number | null
    estimatedR0: number | null
    herdImmunityThreshold: number | null
  } {
    const infected = this.infectedHistory
    let peakInfected = 0
    let peakFrame = 0
    for (let i = 0; i < infected.length; i += 1) {
      if (infected[i] > peakInfected) {
        peakInfected = infected[i]
        peakFrame = i * FRAMES_PER_DAY
      }
    }
    const population = Math.max(1, this.config.population)
    const currentSusceptible = this.susceptibleCount
    const currentExposed = this.exposedCount
    const currentInfected = this.infectedCount
    const currentRecovered = this.recoveredCount
    const currentDead = this.deadCount
    const currentSusceptibleShare = currentSusceptible / population
    const currentExposedShare = currentExposed / population
    const currentInfectedShare = currentInfected / population
    const currentRecoveredShare = currentRecovered / population
    const currentDeadShare = currentDead / population
    const finalRecoveredShare = this.epidemicEnded ? currentRecoveredShare : null
    const estimatedR0 = this.estimateBasicReproductionNumber()
    const herdImmunityThreshold = estimatedR0 !== null && estimatedR0 > 1 ? 1 - 1 / estimatedR0 : null
    return {
      peakInfected,
      peakFrame,
      currentFrame: this.frameIndex,
      currentSusceptible,
      currentExposed,
      currentInfected,
      currentRecovered,
      currentDead,
      currentSusceptibleShare,
      currentExposedShare,
      currentInfectedShare,
      currentRecoveredShare,
      currentDeadShare,
      finalRecoveredShare,
      estimatedR0,
      herdImmunityThreshold,
    }
  }

  private formatPercent(value: number): string {
    return `${(value * 100).toFixed(1)}%`
  }

  private formatApprox(value: number | null, digits = 2): string {
    if (value === null || !Number.isFinite(value)) {
      return "–"
    }
    return value.toFixed(digits)
  }

  private formatFrameCountAsDays(frameCount: number): string {
    return `${(frameCount / FRAMES_PER_DAY).toFixed(2)} d`
  }

  private getInsightsOverlayTitle(): string {
    if (this.config.modelType === "seir") {
      return msg("SEIR insights")
    }
    if (this.config.modelType === "sirs") {
      return msg("SIRS insights")
    }
    if (this.config.modelType === "sird") {
      return msg("SIRD insights")
    }
    return msg("SIR insights")
  }

  private renderChartOverlayInsights(): TemplateResult {
    const insights = this.computeChartInsights()
    const population = Math.max(1, this.config.population)
    const peakShare = insights.peakInfected / population
    const herdThresholdLabel =
      insights.herdImmunityThreshold === null ? "–" : this.formatPercent(insights.herdImmunityThreshold)
    return html`
      <div class="chart-overlay__insights">
        <div class="chart-overlay__insight-item">
          <span>${msg("Elapsed time")}</span>
          <strong>${this.formatFrameCountAsDays(insights.currentFrame)}</strong>
        </div>
        <div class="chart-overlay__insight-item">
          <span>${msg("Current susceptible")}</span>
          <strong>${Math.round(insights.currentSusceptible)} (${this.formatPercent(insights.currentSusceptibleShare)})</strong>
        </div>
        ${
          this.config.modelType === "seir"
            ? html`
                <div class="chart-overlay__insight-item">
                  <span>${msg("Current exposed")}</span>
                  <strong>${Math.round(insights.currentExposed)} (${this.formatPercent(insights.currentExposedShare)})</strong>
                </div>
              `
            : null
        }
        <div class="chart-overlay__insight-item">
          <span>${msg("Current infected")}</span>
          <strong>${Math.round(insights.currentInfected)} (${this.formatPercent(insights.currentInfectedShare)})</strong>
        </div>
        <div class="chart-overlay__insight-item">
          <span>${msg("Current recovered")}</span>
          <strong>${Math.round(insights.currentRecovered)} (${this.formatPercent(insights.currentRecoveredShare)})</strong>
        </div>
        ${
          this.config.modelType === "sird"
            ? html`
                <div class="chart-overlay__insight-item">
                  <span>${msg("Current dead")}</span>
                  <strong>${Math.round(insights.currentDead)} (${this.formatPercent(insights.currentDeadShare)})</strong>
                </div>
              `
            : null
        }
        <div class="chart-overlay__insight-item">
          <span>${msg("Final recovered share")}</span>
          <strong>
            ${insights.finalRecoveredShare === null ? "–" : this.formatPercent(insights.finalRecoveredShare)}
          </strong>
        </div>
        <div class="chart-overlay__insight-item">
          <span>${msg("Peak infected")}</span>
          <strong>${Math.round(insights.peakInfected)} (${this.formatPercent(peakShare)})</strong>
        </div>
        <div class="chart-overlay__insight-item">
          <span>${msg("Peak time")}</span>
          <strong>${this.formatFrameCountAsDays(insights.peakFrame)}</strong>
        </div>
        <div class="chart-overlay__insight-item">
          <span>${msg("R0 (approx)")}</span>
          <strong>${this.formatApprox(insights.estimatedR0)}</strong>
        </div>
        <div class="chart-overlay__insight-item">
          <span>${msg("Herd immunity threshold")}</span>
          <strong>${herdThresholdLabel}</strong>
        </div>
      </div>
    `
  }

  private renderSnapshotCard(snapshot: SimulationSnapshot): TemplateResult {
    return html`
      <article class="snapshots-overlay__snapshot-card">
        <div class="snapshots-overlay__snapshot-head">
          <span class="snapshots-overlay__snapshot-title">${snapshot.label}</span>
          <span class="snapshots-overlay__snapshot-time"
            >${msg("Time")} ${this.formatFrameCountAsDays(snapshot.frameIndex)} ·
            ${new Date(snapshot.createdAt).toLocaleTimeString([], {hour: "2-digit", minute: "2-digit", second: "2-digit"})}</span
          >
        </div>
        ${
          snapshot.chartImageJpeg
            ? html`<img
                class="snapshots-overlay__snapshot-image"
                src=${snapshot.chartImageJpeg}
                alt=${msg("SIR chart snapshot")}
                loading="lazy"
              />`
            : null
        }
        <sl-details class="snapshots-overlay__snapshot-details" summary=${msg("Details")}>
          <div class="snapshots-overlay__snapshot-grid">
            <span>${msg("Model type")}: <strong>${this.getModelTypeLabel(snapshot.config.modelType)}</strong></span>
            <span>${msg("Population")}: <strong>${snapshot.config.population}</strong></span>
            <span>${msg("Speed")}: <strong>${snapshot.config.speed.toFixed(1)}</strong></span>
            <span
              >${msg("Infection probability")}: <strong
                >${Math.round(snapshot.config.infectionProbability * 100)}%</strong
              ></span
            >
            <span
              >${msg("Recovery duration")}: <strong>${this.formatFrameCountAsDays(snapshot.config.recoveryDuration)}</strong></span
            >
            ${
              snapshot.config.modelType === "seir"
                ? html`<span
                    >${msg("Incubation duration")}: <strong
                      >${this.formatFrameCountAsDays(snapshot.config.incubationDuration)}</strong
                    ></span
                  >`
                : null
            }
            ${
              snapshot.config.modelType === "sirs"
                ? html`<span
                    >${msg("Immunity duration")}: <strong
                      >${this.formatFrameCountAsDays(snapshot.config.immunityDuration)}</strong
                    ></span
                  >`
                : null
            }
            ${
              snapshot.config.modelType === "sird"
                ? html`<span
                    >${msg("Mortality probability")}: <strong
                      >${Math.round(snapshot.config.mortalityProbability * 1000) / 10}%</strong
                    ></span
                  >`
                : null
            }
            ${
              snapshot.config.modelType === "seir"
                ? html`<span>${msg("Exposed")}: <strong>${snapshot.exposedCount}</strong></span>`
                : null
            }
            ${
              snapshot.config.modelType === "sird"
                ? html`<span>${msg("Dead")}: <strong>${snapshot.deadCount}</strong></span>`
                : null
            }
            <span
              >${msg("Quarantine enabled")}: <strong>${snapshot.config.quarantineEnabled ? msg("yes") : msg("no")}</strong></span
            >
            <span
              >${msg("Hotspots enabled")}: <strong>${snapshot.config.hotspotsEnabled ? msg("yes") : msg("no")}</strong></span
            >
            <span
              >${msg("Communities enabled")}: <strong>${snapshot.config.communitiesEnabled ? msg("yes") : msg("no")}</strong></span
            >
            <span>${msg("R0 (approx)")}: <strong>${this.formatApprox(snapshot.estimatedR0)}</strong></span>
            <span>${msg("Frame")}: <strong>${snapshot.frameIndex}</strong></span>
          </div>
        </sl-details>
        <div class="snapshots-overlay__snapshot-icon-actions">
          <sl-button
            class="snapshots-overlay__icon-button"
            aria-label=${msg("Expand details")}
            @click=${(event: Event) => {
              const card = (event.currentTarget as HTMLElement).closest(".snapshots-overlay__snapshot-card")
              const details = card?.querySelector<SlDetails>(".snapshots-overlay__snapshot-details")
              if (details) {
                details.open = !details.open
              }
            }}
          >
            ▾
          </sl-button>
          <sl-button
            class="snapshots-overlay__icon-button snapshots-overlay__icon-button--danger"
            aria-label=${msg("Delete")}
            variant="danger"
            @click=${() => this.deleteSnapshot(snapshot.id)}
          >
            X
          </sl-button>
        </div>
      </article>
    `
  }

  private renderSnapshotsOverlay(): TemplateResult | null {
    if (!this.snapshotsOverlayOpen) {
      return null
    }
    return html`
      <section class="snapshots-overlay" @click=${this.onSnapshotsOverlayBackdropClick}>
        <article class="snapshots-overlay__dialog" role="dialog" aria-modal="true">
          <header class="snapshots-overlay__header">
            <h3>${msg("Snapshots gallery")}</h3>
            <div class="snapshots-overlay__actions">
              <sl-button size="small" @click=${this.createSnapshot}>${msg("Create snapshot")}</sl-button>
              <sl-button size="small" @click=${this.closeSnapshotsOverlay}>${msg("Close")}</sl-button>
            </div>
          </header>
          ${
            this.snapshots.length === 0
              ? html`<div class="snapshots-overlay__empty">
                  ${msg("No snapshots yet.")}
                </div>`
              : html`<div class="snapshots-overlay__grid">
                  ${this.snapshots.map((snapshot) => this.renderSnapshotCard(snapshot))}
                </div>`
          }
        </article>
      </section>
    `
  }

  private getSimulationAreas(): SimulationAreas {
    const canvas = this.simulationCanvas
    if (!canvas) {
      return {
        main: {x: 0, y: 0, width: 600, height: 360},
        quarantine: null,
        communities: [],
        hotspots: [],
      }
    }

    const width = canvas.width
    const height = canvas.height
    const communitiesEnabled = this.config.communitiesEnabled

    if (!this.config.quarantineEnabled) {
      const mainRect: Rect = {x: 0, y: 0, width, height}
      const communities = communitiesEnabled ? this.createCommunities(mainRect) : []
      return {
        main: mainRect,
        quarantine: null,
        communities,
        hotspots: this.resolveUserHotspots(mainRect, communities),
      }
    }

    const margin = 10
    const quarantineWidth = Math.max(120, Math.round(width * 0.24))
    const quarantineHeight = Math.max(90, Math.round(height * 0.3))
    const quarantineRect: Rect = {
      x: width - quarantineWidth - margin,
      y: margin,
      width: quarantineWidth,
      height: quarantineHeight,
    }
    const mainRect: Rect = {x: 0, y: 0, width: Math.max(120, quarantineRect.x - margin), height}
    const communities = communitiesEnabled ? this.createCommunities(mainRect) : []
    return {
      main: mainRect,
      quarantine: quarantineRect,
      communities,
      hotspots: this.resolveUserHotspots(mainRect, communities),
    }
  }

  private createCommunities(mainRect: Rect): CommunityCell[] {
    const communities: CommunityCell[] = []
    const cols = 3
    const rows = 3
    const baseWidth = Math.floor(mainRect.width / cols)
    const baseHeight = Math.floor(mainRect.height / rows)
    let id = 0
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const cellX = mainRect.x + col * baseWidth
        const cellY = mainRect.y + row * baseHeight
        const cellWidth = col === cols - 1 ? mainRect.width - baseWidth * (cols - 1) : baseWidth
        const cellHeight = row === rows - 1 ? mainRect.height - baseHeight * (rows - 1) : baseHeight
        communities.push({
          id,
          rect: {x: cellX, y: cellY, width: cellWidth, height: cellHeight},
        })
        id += 1
      }
    }
    return communities
  }

  private resolveUserHotspots(mainRect: Rect, communities: CommunityCell[]): Hotspot[] {
    if (!this.config.hotspotsEnabled) {
      return []
    }
    const resolved: Hotspot[] = []
    for (let i = 0; i < this.userHotspots.length; i += 1) {
      const hotspot = this.userHotspots[i]
      const clampedRect = this.clampHotspotRect(hotspot.rect, mainRect)
      const communityId = this.resolveHotspotCommunityId(
        clampedRect.x,
        clampedRect.y,
        clampedRect.width,
        clampedRect.height,
        communities,
      )
      resolved.push({
        id: hotspot.id,
        communityId,
        rect: clampedRect,
      })
    }
    return resolved
  }

  private getDefaultHotspotSize(mainRect: Rect): number {
    const rawSize = Math.max(24, Math.min(110, this.config.hotspotSize))
    const maxHorizontal = Math.max(18, mainRect.width - 8)
    const maxVertical = Math.max(18, mainRect.height - 8)
    return Math.min(rawSize, maxHorizontal, maxVertical)
  }

  private clampHotspotPosition(x: number, y: number, size: number, mainRect: Rect): {x: number; y: number} {
    const minX = mainRect.x
    const minY = mainRect.y
    const maxX = mainRect.x + Math.max(0, mainRect.width - size)
    const maxY = mainRect.y + Math.max(0, mainRect.height - size)
    return {
      x: this.clamp(x, minX, maxX),
      y: this.clamp(y, minY, maxY),
    }
  }

  private clampHotspotRect(rect: Rect, mainRect: Rect): Rect {
    const minWidth = Math.min(18, mainRect.width)
    const minHeight = Math.min(18, mainRect.height)
    const width = this.clamp(rect.width, minWidth, mainRect.width)
    const height = this.clamp(rect.height, minHeight, mainRect.height)
    const minX = mainRect.x
    const minY = mainRect.y
    const maxX = mainRect.x + Math.max(0, mainRect.width - width)
    const maxY = mainRect.y + Math.max(0, mainRect.height - height)
    return {
      x: this.clamp(rect.x, minX, maxX),
      y: this.clamp(rect.y, minY, maxY),
      width,
      height,
    }
  }

  private resolveHotspotCommunityId(
    hotspotX: number,
    hotspotY: number,
    hotspotWidth: number,
    hotspotHeight: number,
    communities: CommunityCell[],
  ): number | null {
    if (!this.config.communitiesEnabled || communities.length === 0) {
      return null
    }
    const centerX = hotspotX + hotspotWidth * 0.5
    const centerY = hotspotY + hotspotHeight * 0.5
    for (let i = 0; i < communities.length; i += 1) {
      const rect = communities[i].rect
      const maxX = rect.x + rect.width
      const maxY = rect.y + rect.height
      if (centerX >= rect.x && centerX <= maxX && centerY >= rect.y && centerY <= maxY) {
        return communities[i].id
      }
    }
    return null
  }

  private onHotspotTokenDragStart = (event: DragEvent): void => {
    if (!event.dataTransfer) {
      return
    }
    this.isCreatingHotspotDrag = true
    event.dataTransfer.effectAllowed = "copy"
    event.dataTransfer.setData("application/x-epidemic-hotspot", "new-hotspot")
    event.dataTransfer.setData("text/plain", "new-hotspot")
  }

  private onHotspotTokenDragEnd = (): void => {
    this.isCreatingHotspotDrag = false
    if (!this.canvasDropActive) {
      return
    }
    this.canvasDropActive = false
    this.requestUpdate()
  }

  private onCanvasDragOver = (event: DragEvent): void => {
    if (!this.isCreatingHotspotDrag || !event.dataTransfer) {
      return
    }
    event.preventDefault()
    event.dataTransfer.dropEffect = "copy"
    if (!this.canvasDropActive) {
      this.canvasDropActive = true
      this.requestUpdate()
    }
  }

  private onCanvasDragLeave = (): void => {
    if (!this.canvasDropActive) {
      return
    }
    this.canvasDropActive = false
    this.requestUpdate()
  }

  private onCanvasDrop = (event: DragEvent): void => {
    event.preventDefault()
    this.canvasDropActive = false
    const wasCreatingHotspotDrag = this.isCreatingHotspotDrag
    this.isCreatingHotspotDrag = false
    if (!this.simulationCanvas || !event.dataTransfer) {
      this.requestUpdate()
      return
    }
    const hotspotMime = event.dataTransfer.getData("application/x-epidemic-hotspot")
    const textMime = event.dataTransfer.getData("text/plain")
    const isHotspotDrop = wasCreatingHotspotDrag || hotspotMime === "new-hotspot" || textMime === "new-hotspot"
    if (!isHotspotDrop) {
      this.requestUpdate()
      return
    }
    if (!this.config.hotspotsEnabled) {
      this.hotspotsEnabled = true
    }
    const point = this.getCanvasPoint(event.clientX, event.clientY)
    if (!point) {
      this.requestUpdate()
      return
    }
    this.addHotspotAtPoint(point.x, point.y)
  }

  private onCanvasPointerDown = (event: PointerEvent): void => {
    if (!this.config.hotspotsEnabled) {
      return
    }
    const point = this.getCanvasPoint(event.clientX, event.clientY)
    if (!point) {
      return
    }
    const areas = this.getSimulationAreas()
    for (let i = areas.hotspots.length - 1; i >= 0; i -= 1) {
      const hotspot = areas.hotspots[i]
      const rect = hotspot.rect
      const corner = this.getHotspotCornerAtPoint(point.x, point.y, rect)
      if (corner) {
        const anchor = this.getOppositeCornerPoint(rect, corner)
        this.resizingHotspotId = hotspot.id
        this.resizingCorner = corner
        this.hotspotResizeAnchor = anchor
        window.addEventListener("pointermove", this.onWindowPointerMove)
        window.addEventListener("pointerup", this.onWindowPointerUp)
        if (this.simulationCanvas) {
          this.simulationCanvas.style.cursor = corner === "nw" || corner === "se" ? "nwse-resize" : "nesw-resize"
        }
        event.preventDefault()
        return
      }
      const inside =
        point.x >= rect.x &&
        point.x <= rect.x + rect.width &&
        point.y >= rect.y &&
        point.y <= rect.y + rect.height
      if (!inside) {
        continue
      }
      this.draggingHotspotId = hotspot.id
      this.hotspotDragOffset = {x: point.x - rect.x, y: point.y - rect.y}
      window.addEventListener("pointermove", this.onWindowPointerMove)
      window.addEventListener("pointerup", this.onWindowPointerUp)
      if (this.simulationCanvas) {
        this.simulationCanvas.style.cursor = "grabbing"
      }
      event.preventDefault()
      return
    }
  }

  private onCanvasContextMenu = (event: MouseEvent): void => {
    if (!this.config.hotspotsEnabled) {
      return
    }
    const point = this.getCanvasPoint(event.clientX, event.clientY)
    if (!point) {
      return
    }
    const areas = this.getSimulationAreas()
    const hotspot = this.findTopmostHotspotAtPoint(point.x, point.y, areas.hotspots)
    if (!hotspot) {
      return
    }
    event.preventDefault()
    this.removeHotspot(hotspot.id)
  }

  private onWindowPointerMove = (event: PointerEvent): void => {
    if (this.draggingHotspotId === null && this.resizingHotspotId === null) {
      return
    }
    const point = this.getCanvasPoint(event.clientX, event.clientY, true)
    if (!point) {
      return
    }
    const areas = this.getSimulationAreas()
    if (this.draggingHotspotId !== null) {
      const hotspot = this.findHotspotById(areas.hotspots, this.draggingHotspotId)
      if (!hotspot) {
        return
      }
      const nextX = point.x - this.hotspotDragOffset.x
      const nextY = point.y - this.hotspotDragOffset.y
      const clamped = this.clampHotspotPosition(nextX, nextY, hotspot.rect.width, areas.main)
      this.updateUserHotspotRect(this.draggingHotspotId, {
        x: clamped.x,
        y: clamped.y,
        width: hotspot.rect.width,
        height: hotspot.rect.height,
      })
      return
    }
    if (this.resizingHotspotId === null || !this.resizingCorner) {
      return
    }
    const resizedRect = this.getResizedHotspotRect(point.x, point.y, this.hotspotResizeAnchor, this.resizingCorner)
    const clampedRect = this.clampHotspotRect(resizedRect, areas.main)
    this.updateUserHotspotRect(this.resizingHotspotId, clampedRect)
  }

  private onWindowPointerUp = (): void => {
    if (this.draggingHotspotId === null && this.resizingHotspotId === null) {
      return
    }
    this.draggingHotspotId = null
    this.resizingHotspotId = null
    this.resizingCorner = null
    window.removeEventListener("pointermove", this.onWindowPointerMove)
    window.removeEventListener("pointerup", this.onWindowPointerUp)
    if (this.simulationCanvas) {
      this.simulationCanvas.style.cursor = ""
    }
  }

  private getCanvasPoint(clientX: number, clientY: number, clampToCanvas = false): {x: number; y: number} | null {
    const canvas = this.simulationCanvas
    if (!canvas) {
      return null
    }
    const bounds = canvas.getBoundingClientRect()
    let normalizedX = (clientX - bounds.left) * (canvas.width / Math.max(1, bounds.width))
    let normalizedY = (clientY - bounds.top) * (canvas.height / Math.max(1, bounds.height))
    if (clampToCanvas) {
      normalizedX = this.clamp(normalizedX, 0, canvas.width)
      normalizedY = this.clamp(normalizedY, 0, canvas.height)
      return {x: normalizedX, y: normalizedY}
    }
    if (normalizedX < 0 || normalizedY < 0 || normalizedX > canvas.width || normalizedY > canvas.height) {
      return null
    }
    return {x: normalizedX, y: normalizedY}
  }

  private addHotspotAtPoint(x: number, y: number): void {
    const areas = this.getSimulationAreas()
    const size = this.getDefaultHotspotSize(areas.main)
    const clamped = this.clampHotspotPosition(x - size * 0.5, y - size * 0.5, size, areas.main)
    const hotspot: Hotspot = {
      id: this.nextHotspotId,
      communityId: this.resolveHotspotCommunityId(clamped.x, clamped.y, size, size, areas.communities),
      rect: {x: clamped.x, y: clamped.y, width: size, height: size},
    }
    this.nextHotspotId += 1
    this.userHotspots = [...this.userHotspots, hotspot]
    this.restartSimulationPreservingHotspots()
  }

  private restartSimulationPreservingHotspots(): void {
    this.frameIndex = 0
    this.epidemicEnded = false
    this.hadInfection = false
    resetChart(this.chartCanvas)
    this.resetChartHistory()
    this.initializeAgents(0)
    this.updateEpidemicCounts()
    this.drawChart()
    this.requestUpdateAndRedrawSimulationWhenPaused()
  }

  private updateUserHotspotRect(hotspotId: number, rect: Rect): void {
    let updated = false
    this.userHotspots = this.userHotspots.map((hotspot) => {
      if (hotspot.id !== hotspotId) {
        return hotspot
      }
      updated = true
      return {...hotspot, rect}
    })
    if (updated) {
      this.requestUpdateAndRedrawSimulationWhenPaused()
    }
  }

  private removeHotspot(hotspotId: number): void {
    const hasHotspot = this.userHotspots.some((hotspot) => hotspot.id === hotspotId)
    if (!hasHotspot) {
      return
    }
    if (this.draggingHotspotId === hotspotId || this.resizingHotspotId === hotspotId) {
      this.onWindowPointerUp()
    }
    this.userHotspots = this.userHotspots.filter((hotspot) => hotspot.id !== hotspotId)
    this.requestUpdateAndRedrawSimulationWhenPaused()
  }

  private findHotspotById(hotspots: Hotspot[], hotspotId: number): Hotspot | null {
    for (let i = 0; i < hotspots.length; i += 1) {
      if (hotspots[i].id === hotspotId) {
        return hotspots[i]
      }
    }
    return null
  }

  private findTopmostHotspotAtPoint(x: number, y: number, hotspots: Hotspot[]): Hotspot | null {
    for (let i = hotspots.length - 1; i >= 0; i -= 1) {
      const rect = hotspots[i].rect
      const inside = x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height
      if (inside) {
        return hotspots[i]
      }
    }
    return null
  }

  private getHotspotCornerAtPoint(
    x: number,
    y: number,
    rect: Rect,
  ): "nw" | "ne" | "sw" | "se" | null {
    const handleRadius = 7
    const corners = [
      {key: "nw" as const, x: rect.x, y: rect.y},
      {key: "ne" as const, x: rect.x + rect.width, y: rect.y},
      {key: "sw" as const, x: rect.x, y: rect.y + rect.height},
      {key: "se" as const, x: rect.x + rect.width, y: rect.y + rect.height},
    ]
    for (let i = 0; i < corners.length; i += 1) {
      const dx = x - corners[i].x
      const dy = y - corners[i].y
      if (Math.hypot(dx, dy) <= handleRadius) {
        return corners[i].key
      }
    }
    return null
  }

  private getOppositeCornerPoint(rect: Rect, corner: "nw" | "ne" | "sw" | "se"): {x: number; y: number} {
    if (corner === "nw") {
      return {x: rect.x + rect.width, y: rect.y + rect.height}
    }
    if (corner === "ne") {
      return {x: rect.x, y: rect.y + rect.height}
    }
    if (corner === "sw") {
      return {x: rect.x + rect.width, y: rect.y}
    }
    return {x: rect.x, y: rect.y}
  }

  private getResizedHotspotRect(
    pointX: number,
    pointY: number,
    anchor: {x: number; y: number},
    corner: "nw" | "ne" | "sw" | "se",
  ): Rect {
    if (corner === "nw") {
      return {
        x: Math.min(pointX, anchor.x),
        y: Math.min(pointY, anchor.y),
        width: Math.abs(anchor.x - pointX),
        height: Math.abs(anchor.y - pointY),
      }
    }
    if (corner === "ne") {
      return {
        x: Math.min(anchor.x, pointX),
        y: Math.min(pointY, anchor.y),
        width: Math.abs(pointX - anchor.x),
        height: Math.abs(anchor.y - pointY),
      }
    }
    if (corner === "sw") {
      return {
        x: Math.min(pointX, anchor.x),
        y: Math.min(anchor.y, pointY),
        width: Math.abs(anchor.x - pointX),
        height: Math.abs(pointY - anchor.y),
      }
    }
    return {
      x: Math.min(anchor.x, pointX),
      y: Math.min(anchor.y, pointY),
      width: Math.abs(pointX - anchor.x),
      height: Math.abs(pointY - anchor.y),
    }
  }

  private getModelTypeOptions(): Array<{value: EpidemicModelType; label: string}> {
    return [
      {value: "sir", label: msg("SIR")},
      {value: "sirs", label: msg("SIRS")},
      {value: "seir", label: msg("SEIR")},
      {value: "sird", label: msg("SIRD")},
    ]
  }

  private getModelTypeLabel(modelType: EpidemicModelType): string {
    const option = this.getModelTypeOptions().find((entry) => entry.value === modelType)
    return option?.label ?? modelType.toUpperCase()
  }

  private getModelSpecificTeacherRows(): RenderTeacherOptionsInput["sections"][number]["rows"] {
    if (this.modelType === "seir") {
      return [
        {
          kind: "range",
          label: msg("Incubation duration"),
          value: this.incubationDuration,
          min: 30,
          max: 1200,
          step: 30,
          allow: this.allowIncubationDurationControl,
          formatValue: (value) => this.formatFrameCountAsDays(value),
          onInput: this.updateIncubationDuration,
          onAllowChange: (event) => this.setAllowControl("allowIncubationDurationControl", event),
        },
      ]
    }

    if (this.modelType === "sirs") {
      return [
        {
          kind: "range",
          label: msg("Immunity duration"),
          value: this.immunityDuration,
          min: 120,
          max: 4800,
          step: 60,
          allow: this.allowImmunityDurationControl,
          formatValue: (value) => this.formatFrameCountAsDays(value),
          onInput: this.updateImmunityDuration,
          onAllowChange: (event) => this.setAllowControl("allowImmunityDurationControl", event),
        },
      ]
    }

    if (this.modelType === "sird") {
      return [
        {
          kind: "range",
          label: msg("Mortality probability"),
          value: this.mortalityProbability,
          min: 0.001,
          max: 0.5,
          step: 0.001,
          allow: this.allowMortalityProbabilityControl,
          formatValue: (value) => `${Math.round(value * 1000) / 10}%`,
          onInput: this.updateMortalityProbability,
          onAllowChange: (event) => this.setAllowControl("allowMortalityProbabilityControl", event),
        },
      ]
    }

    return []
  }

  private setAllowControl(
    key:
      | "allowModelTypeControl"
      | "allowIncubationDurationControl"
      | "allowImmunityDurationControl"
      | "allowMortalityProbabilityControl"
      | "allowPopulationControl"
      | "allowSpeedControl"
      | "allowInfectionRadiusControl"
      | "allowInfectionProbabilityControl"
      | "allowRecoveryDurationControl"
      | "allowQuarantineEnabledControl"
      | "allowQuarantineProbabilityControl"
      | "allowQuarantineDurationControl"
      | "allowHotspotsEnabledControl"
      | "allowHotspotVisitProbabilityControl"
      | "allowHotspotStayDurationControl"
      | "allowHotspotMaxAgentsControl"
      | "allowHotspotSizeControl"
      | "allowCommunitiesEnabledControl"
      | "allowCommunityLeaveProbabilityControl",
    event: Event,
  ): void {
    this[key] = this.parseSwitch(event)
  }

  private getTeacherOptionsInput(): RenderTeacherOptionsInput {
    return {
      sections: [
        {
          title: msg("Model"),
          open: true,
          rows: [
            {
              kind: "select",
              label: msg("Model type"),
              value: this.modelType,
              options: this.getModelTypeOptions(),
              allow: this.allowModelTypeControl,
              onChange: this.updateModelType,
              onAllowChange: (event) => this.setAllowControl("allowModelTypeControl", event),
            },
            ...this.getModelSpecificTeacherRows(),
          ],
        },
        {
          title: msg("General"),
          open: true,
          rows: [
            {
              kind: "range",
              label: msg("Population"),
              value: this.population,
              min: 50,
              max: 800,
              step: 10,
              allow: this.allowPopulationControl,
              onInput: this.updatePopulation,
              onAllowChange: (event) => this.setAllowControl("allowPopulationControl", event),
            },
            {
              kind: "range",
              label: msg("Speed"),
              value: this.speed,
              min: 0.2,
              max: 4,
              step: 0.1,
              allow: this.allowSpeedControl,
              formatValue: (value) => value.toFixed(1),
              onInput: this.updateSpeed,
              onAllowChange: (event) => this.setAllowControl("allowSpeedControl", event),
            },
            {
              kind: "range",
              label: msg("Infection radius"),
              value: this.infectionRadius,
              min: 4,
              max: 40,
              step: 1,
              allow: this.allowInfectionRadiusControl,
              onInput: this.updateInfectionRadius,
              onAllowChange: (event) => this.setAllowControl("allowInfectionRadiusControl", event),
            },
            {
              kind: "range",
              label: msg("Infection probability"),
              value: this.infectionProbability,
              min: 0.01,
              max: 1,
              step: 0.01,
              allow: this.allowInfectionProbabilityControl,
              formatValue: (value) => `${Math.round(value * 100)}%`,
              onInput: this.updateInfectionProbability,
              onAllowChange: (event) => this.setAllowControl("allowInfectionProbabilityControl", event),
            },
            {
              kind: "range",
              label: msg("Recovery duration"),
              value: this.recoveryDuration,
              min: 60,
              max: 2400,
              step: 30,
              allow: this.allowRecoveryDurationControl,
              formatValue: (value) => this.formatFrameCountAsDays(value),
              onInput: this.updateRecoveryDuration,
              onAllowChange: (event) => this.setAllowControl("allowRecoveryDurationControl", event),
            },
          ],
        },
        {
          title: msg("Quarantine"),
          enabled: this.quarantineEnabled,
          onEnabledChange: this.updateQuarantineEnabled,
          rows: [
            {
              kind: "show",
              label: msg("Show"),
              value: this.allowQuarantineEnabledControl,
              onValueChange: (event) => this.setAllowControl("allowQuarantineEnabledControl", event),
            },
            {
              kind: "range",
              label: msg("Quarantine probability"),
              value: this.quarantineProbability,
              min: 0.01,
              max: 1,
              step: 0.01,
              allow: this.allowQuarantineProbabilityControl,
              formatValue: (value) => `${Math.round(value * 100)}%`,
              onInput: this.updateQuarantineProbability,
              onAllowChange: (event) => this.setAllowControl("allowQuarantineProbabilityControl", event),
            },
            {
              kind: "range",
              label: msg("Quarantine duration"),
              value: this.quarantineDuration,
              min: 30,
              max: 2400,
              step: 30,
              allow: this.allowQuarantineDurationControl,
              formatValue: (value) => this.formatFrameCountAsDays(value),
              onInput: this.updateQuarantineDuration,
              onAllowChange: (event) => this.setAllowControl("allowQuarantineDurationControl", event),
            },
          ],
        },
        {
          title: msg("Hotspots"),
          enabled: this.hotspotsEnabled,
          onEnabledChange: this.updateHotspotsEnabled,
          rows: [
            {
              kind: "show",
              label: msg("Show"),
              value: this.allowHotspotsEnabledControl,
              onValueChange: (event) => this.setAllowControl("allowHotspotsEnabledControl", event),
            },
            {
              kind: "range",
              label: msg("Hotspot visit probability"),
              value: this.hotspotVisitProbability,
              min: 0.001,
              max: 0.04,
              step: 0.001,
              allow: this.allowHotspotVisitProbabilityControl,
              formatValue: (value) => `${Math.round(value * 1000) / 10}%`,
              onInput: this.updateHotspotVisitProbability,
              onAllowChange: (event) => this.setAllowControl("allowHotspotVisitProbabilityControl", event),
            },
            {
              kind: "range",
              label: msg("Hotspot stay duration"),
              value: this.hotspotStayDuration,
              min: 30,
              max: 1800,
              step: 30,
              allow: this.allowHotspotStayDurationControl,
              formatValue: (value) => this.formatFrameCountAsDays(value),
              onInput: this.updateHotspotStayDuration,
              onAllowChange: (event) => this.setAllowControl("allowHotspotStayDurationControl", event),
            },
            {
              kind: "range",
              label: msg("Hotspot max agents"),
              value: this.hotspotMaxAgents,
              min: 1,
              max: 120,
              step: 1,
              allow: this.allowHotspotMaxAgentsControl,
              onInput: this.updateHotspotMaxAgents,
              onAllowChange: (event) => this.setAllowControl("allowHotspotMaxAgentsControl", event),
            },
            {
              kind: "range",
              label: msg("Hotspot size"),
              value: this.hotspotSize,
              min: 24,
              max: 110,
              step: 2,
              allow: this.allowHotspotSizeControl,
              onInput: this.updateHotspotSize,
              onAllowChange: (event) => this.setAllowControl("allowHotspotSizeControl", event),
            },
          ],
        },
        {
          title: msg("Communities"),
          enabled: this.communitiesEnabled,
          onEnabledChange: this.updateCommunitiesEnabled,
          rows: [
            {
              kind: "show",
              label: msg("Show"),
              value: this.allowCommunitiesEnabledControl,
              onValueChange: (event) => this.setAllowControl("allowCommunitiesEnabledControl", event),
            },
            {
              kind: "range",
              label: msg("Community leave probability"),
              value: this.communityLeaveProbability,
              min: 0.0001,
              max: 0.01,
              step: 0.0001,
              allow: this.allowCommunityLeaveProbabilityControl,
              formatValue: (value) => `${Math.round(value * 1000) / 10}%`,
              onInput: this.updateCommunityLeaveProbability,
              onAllowChange: (event) => this.setAllowControl("allowCommunityLeaveProbabilityControl", event),
            },
          ],
        },
      ],
    }
  }

  render() {
    return html`
      <div part="options" class="teacher-options-shell">
        ${renderTeacherOptions(this.getTeacherOptionsInput())}
      </div>
      <section class="widget-shell ${this.hasVisibleMenuControls ? "has-menu" : ""}">
        <section class="main-content" @click=${this.onMainContentClick}>
          <section class="layout">
            <sl-card class="panel panel--chart">
              <div
                class="chart-wrap chart-wrap--interactive"
                @dblclick=${this.onChartPanelDoubleClick}
                @contextmenu=${this.onChartContextMenu}
                title=${msg("Double-click to enlarge")}
              >
                <canvas id="chart-canvas"></canvas>
              </div>
            </sl-card>
            ${
              this.chartContextMenuOpen
                ? html`
                    <div
                      class="chart-context-menu"
                      style=${`left: ${this.chartContextMenuPosition.x}px; top: ${this.chartContextMenuPosition.y}px;`}
                      @click=${(event: Event) => event.stopPropagation()}
                    >
                      <sl-button class="chart-context-menu__item" variant="text" size="small" @click=${this.createSnapshot}>
                        ${msg("Create snapshot")}
                      </sl-button>
                    </div>
                  `
                : null
            }

            <sl-card class="panel panel--simulation">
              <canvas
                id="simulation-canvas"
                width="600"
                height="360"
                class=${this.canvasDropActive ? "drop-active" : ""}
                @dragover=${this.onCanvasDragOver}
                @dragleave=${this.onCanvasDragLeave}
                @drop=${this.onCanvasDrop}
                @pointerdown=${this.onCanvasPointerDown}
                @contextmenu=${this.onCanvasContextMenu}
              ></canvas>
              ${
                this.hotspotsEnabled && (this.isEditMode || this.allowHotspotsEnabledControl)
                  ? html`
                      <div class="hotspot-toolbox--map">
                        <sl-button
                          class="hotspot-toolbox__token"
                          draggable="true"
                          size="small"
                          variant="default"
                          @dragstart=${this.onHotspotTokenDragStart}
                          @dragend=${this.onHotspotTokenDragEnd}
                        >
                          ${msg("H")}
                        </sl-button>
                        <sl-tag class="hotspot-toolbox__notice" variant="primary">
                          ${msg("Drag this hotspot into the simulation map.")}
                        </sl-tag>
                      </div>
                    `
                  : null
              }
              <div class="actions simulation-actions">
                <sl-button @click=${this.toggleSimulation}>
                  ${this.isRunning ? msg("Pause") : msg("Start")}
                </sl-button>
                <sl-button @click=${this.resetSimulation}>${msg("Reset simulation")}</sl-button>
                <sl-button @click=${this.openSnapshotsOverlay}>${msg("Snapshots")}</sl-button>
              </div>
            </sl-card>
          </section>
        </section>

        ${
          this.hasVisibleMenuControls
            ? renderMenu({
                ...this.getMenuAllowFlags(),
                modelType: this.config.modelType,
                modelTypeOptions: this.getModelTypeOptions(),
                incubationDuration: this.config.incubationDuration,
                immunityDuration: this.config.immunityDuration,
                mortalityProbability: this.config.mortalityProbability,
                population: this.config.population,
                speed: this.config.speed,
                infectionRadius: this.config.infectionRadius,
                infectionProbability: this.config.infectionProbability,
                recoveryDuration: this.config.recoveryDuration,
                quarantineEnabled: this.config.quarantineEnabled,
                quarantineProbability: this.config.quarantineProbability,
                quarantineDuration: this.config.quarantineDuration,
                hotspotsEnabled: this.config.hotspotsEnabled,
                placedHotspotCount: this.userHotspots.length,
                hotspotVisitProbability: this.config.hotspotVisitProbability,
                hotspotStayDuration: this.config.hotspotStayDuration,
                hotspotMaxAgents: this.config.hotspotMaxAgents,
                hotspotSize: this.config.hotspotSize,
                communitiesEnabled: this.config.communitiesEnabled,
                communityLeaveProbability: this.config.communityLeaveProbability,
                onModelTypeChange: this.updateModelType,
                onIncubationDurationInput: this.updateIncubationDuration,
                onImmunityDurationInput: this.updateImmunityDuration,
                onMortalityProbabilityInput: this.updateMortalityProbability,
                onPopulationInput: this.updatePopulation,
                onSpeedInput: this.updateSpeed,
                onInfectionRadiusInput: this.updateInfectionRadius,
                onInfectionProbabilityInput: this.updateInfectionProbability,
                onRecoveryDurationInput: this.updateRecoveryDuration,
                onToggleQuarantine: this.updateQuarantineEnabled,
                onQuarantineProbabilityInput: this.updateQuarantineProbability,
                onQuarantineDurationInput: this.updateQuarantineDuration,
                onToggleHotspots: this.updateHotspotsEnabled,
                onHotspotVisitProbabilityInput: this.updateHotspotVisitProbability,
                onHotspotStayDurationInput: this.updateHotspotStayDuration,
                onHotspotMaxAgentsInput: this.updateHotspotMaxAgents,
                onHotspotSizeInput: this.updateHotspotSize,
                onToggleCommunities: this.updateCommunitiesEnabled,
                onCommunityLeaveProbabilityInput: this.updateCommunityLeaveProbability,
              })
            : null
        }

        ${this.renderSnapshotsOverlay()}

        ${
          this.chartOverlayOpen
            ? html`
                <section class="chart-overlay" @click=${this.onChartOverlayBackdropClick}>
                  <article class="chart-overlay__dialog" role="dialog" aria-modal="true">
                    <header class="chart-overlay__header">
                      <h3>${this.getInsightsOverlayTitle()}</h3>
                      <div class="chart-overlay__actions">
                        <sl-button size="small" @click=${this.createSnapshot}>${msg("Create snapshot")}</sl-button>
                        <sl-button size="small" @click=${this.closeChartOverlay}>${msg("Close")}</sl-button>
                      </div>
                    </header>
                    ${
                      this.config.modelType === "sir"
                        ? html`
                            <div class="chart-overlay__controls">
                              <sl-switch
                                class="chart-overlay__fit-switch"
                                ?checked=${this.showApproximateFitOverlay}
                                @sl-change=${this.updateApproximateFitOverlay}
                              >
                                ${msg("Show fit overlay")}
                              </sl-switch>
                            </div>
                          `
                        : null
                    }
                    <div class="chart-overlay__chart-wrap">
                      <canvas id="chart-canvas-enlarged"></canvas>
                    </div>
                    ${this.renderChartOverlayInsights()}
                  </article>
                </section>
              `
            : null
        }
      </section>
    `
  }
}
