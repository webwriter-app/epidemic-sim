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
import shoelaceLightStyles from "@shoelace-style/shoelace/dist/themes/light.styles.js"
import LOCALIZE from "../localization/generated"

import {epidemicSimStyles} from "./styles/epidemic-sim.styles"
import {hasVisibleMenuControls, renderMenu, sideMenuStyles} from "./rendering/menu-renderer"
import {renderCanvasPanel} from "./components/canvas-panel"
import {renderChartOverlay} from "./components/chart-overlay"
import {type ChartInsightData} from "./components/chart-insights-view"
import {renderSnapshotsOverlay} from "./components/snapshots-overlay"
import {
  booleanAttributeConverter,
  modelTypeAttributeConverter,
  numberAttributeConverter,
} from "./config/attribute-converters"
import {buildSimulationConfig} from "./config/build-simulation-config"
import {buildStudentMenuInput} from "./config/build-student-menu-input"
import {buildTeacherOptionsInput} from "./config/build-teacher-options-input"
import {buildMenuAllowFlags, type WidgetConfigValues} from "./config/menu-allow-flags"
import type {AllowControlKey} from "./config/widget-schema"
import {
  buildSimulationAreas,
  getDefaultHotspotSize,
  resolveHotspotCommunityId,
} from "./geometry/simulation-areas"
import {
  buildApproximationSeries,
  computeChartInsights,
  estimateBasicReproductionNumber,
  formatApprox,
  formatFrameCountAsDays,
  formatPercent,
} from "./analytics/chart-insights"
import {AnimationLoop} from "./utils/animation-loop"
import {
  clampHotspotPosition,
  clampHotspotRect,
  getCanvasPoint,
} from "./utils/canvas-coordinates"
import {
  findHotspotById,
  findTopmostHotspotAtPoint,
  getHotspotCornerAtPoint,
  getOppositeCornerPoint,
  getResizedHotspotRect,
} from "./utils/hotspot-interaction"
import {renderTeacherOptions, teacherOptionsStyles} from "./rendering/teacher-options-renderer"
import {destroyChart, drawChart, resetChart} from "./rendering/chart-renderer"
import type {ChartSeries} from "./rendering/chart-renderer"
import {drawSimulation} from "./rendering/simulation-renderer"
import {getEpidemicCounts, initializeAgents, stepSimulation} from "./simulation/engine"
import {
  DEFAULT_MODEL_SPECIFIC_DEFAULTS,
  getChartCompartments,
  isEpidemicModelType,
  type ChartCompartment,
  type EpidemicModelType,
} from "./simulation/epidemic-models"
import {pushHistoryValue, resetHistory} from "./simulation/history"
import type {Agent, Hotspot, Rect, SimulationConfig, SimulationSnapshot} from "./simulation/types"

const FRAMES_PER_DAY = 24

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
  static styles = [shoelaceLightStyles, ...epidemicSimStyles, sideMenuStyles, teacherOptionsStyles]

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
    return buildSimulationConfig(this.getWidgetConfigValues())
  }

  private simulationCanvas: HTMLCanvasElement | null = null
  private simulationCtx: CanvasRenderingContext2D | null = null
  private chartCanvas: HTMLCanvasElement | null = null
  private enlargedChartCanvas: HTMLCanvasElement | null = null
  private animationLoop = new AnimationLoop()
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
    return buildMenuAllowFlags(this.getWidgetConfigValues())
  }

  private getWidgetConfigValues(): WidgetConfigValues {
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
      hotspotVisitProbability: this.hotspotVisitProbability,
      hotspotStayDuration: this.hotspotStayDuration,
      hotspotMaxAgents: this.hotspotMaxAgents,
      hotspotSize: this.hotspotSize,
      communitiesEnabled: this.communitiesEnabled,
      communityLeaveProbability: this.communityLeaveProbability,
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
    if (this.animationLoop.running) {
      return
    }
    this.isRunning = true
    this.animationLoop.start(() => {
      if (!this.isRunning) {
        return false
      }
      this.stepSimulation()
      this.drawSimulation()
      if (this.isRunning) {
        this.drawChart()
        if (this.chartOverlayOpen) {
          this.requestUpdate()
        }
      }
      return this.isRunning
    })
    this.requestUpdate()
  }

  private stopLoop(): void {
    this.animationLoop.stop()
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
    drawSimulation(ctx, canvas, this.agents, this.getSimulationAreas())
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
    const fit = buildApproximationSeries({
      infectedHistory: this.infectedHistory,
      susceptibleHistory: this.susceptibleHistory,
      recoveredHistory: this.recoveredHistory,
      population: this.config.population,
      recoveryDuration: this.config.recoveryDuration,
      estimatedR0: this.estimateBasicReproductionNumber(),
    })
    if (!fit) {
      return []
    }
    return [
      {label: msg("Susceptible (fit)"), values: fit.susceptible, color: "#60a5fa", dash: [6, 4], lineWidth: 1.5},
      {label: msg("Infected (fit)"), values: fit.infected, color: "#f87171", dash: [6, 4], lineWidth: 1.5},
      {label: msg("Recovered (fit)"), values: fit.recovered, color: "#4ade80", dash: [6, 4], lineWidth: 1.5},
    ]
  }

  private estimateBasicReproductionNumber(): number | null {
    return estimateBasicReproductionNumber(this.infectedHistory, this.config.recoveryDuration)
  }

  private computeChartInsights() {
    return computeChartInsights({
      infectedHistory: this.infectedHistory,
      frameIndex: this.frameIndex,
      population: this.config.population,
      recoveryDuration: this.config.recoveryDuration,
      epidemicEnded: this.epidemicEnded,
      susceptibleCount: this.susceptibleCount,
      exposedCount: this.exposedCount,
      infectedCount: this.infectedCount,
      recoveredCount: this.recoveredCount,
      deadCount: this.deadCount,
    })
  }

  private getInsightsOverlayTitle(): string {
    if (this.config.modelType === "seir") {
      return msg("SEIR insights")
    }
    if (this.config.modelType === "seird") {
      return msg("SEIRD insights")
    }
    if (this.config.modelType === "sirs") {
      return msg("SIRS insights")
    }
    if (this.config.modelType === "sird") {
      return msg("SIRD insights")
    }
    return msg("SIR insights")
  }

  private buildChartInsightViewData(): ChartInsightData {
    const insights = this.computeChartInsights()
    const population = Math.max(1, this.config.population)
    const peakShare = insights.peakInfected / population
    const herdThresholdLabel =
      insights.herdImmunityThreshold === null ? "–" : formatPercent(insights.herdImmunityThreshold)
    return {
      elapsedTime: formatFrameCountAsDays(insights.currentFrame),
      estimatedR0: formatApprox(insights.estimatedR0),
      herdImmunityThreshold: herdThresholdLabel,
      currentSusceptible: `${Math.round(insights.currentSusceptible)} (${formatPercent(insights.currentSusceptibleShare)})`,
      currentExposed:
        this.config.modelType === "seir" || this.config.modelType === "seird"
          ? `${Math.round(insights.currentExposed)} (${formatPercent(insights.currentExposedShare)})`
          : undefined,
      currentInfected: `${Math.round(insights.currentInfected)} (${formatPercent(insights.currentInfectedShare)})`,
      currentRecovered: `${Math.round(insights.currentRecovered)} (${formatPercent(insights.currentRecoveredShare)})`,
      currentDead:
        this.config.modelType === "sird" || this.config.modelType === "seird"
          ? `${Math.round(insights.currentDead)} (${formatPercent(insights.currentDeadShare)})`
          : undefined,
      finalRecoveredShare: insights.finalRecoveredShare === null ? "–" : formatPercent(insights.finalRecoveredShare),
      peakInfected: `${Math.round(insights.peakInfected)} (${formatPercent(peakShare)})`,
      peakTime: formatFrameCountAsDays(insights.peakFrame),
    }
  }

  private renderSnapshotsOverlay(): TemplateResult | null {
    return renderSnapshotsOverlay({
      open: this.snapshotsOverlayOpen,
      snapshots: this.snapshots,
      onBackdropClick: this.onSnapshotsOverlayBackdropClick,
      onCreateSnapshot: this.createSnapshot,
      onClose: this.closeSnapshotsOverlay,
      context: {
        modelTypeLabel: this.getModelTypeLabel.bind(this),
        formatDays: formatFrameCountAsDays,
        formatApprox,
        onDelete: this.deleteSnapshot.bind(this),
      },
    })
  }

  private getSimulationAreas() {
    const canvas = this.simulationCanvas
    if (!canvas) {
      return buildSimulationAreas({
        canvasWidth: 600,
        canvasHeight: 360,
        config: this.config,
        userHotspots: this.userHotspots,
      })
    }
    return buildSimulationAreas({
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
      config: this.config,
      userHotspots: this.userHotspots,
    })
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
    const point = this.toCanvasPoint(event.clientX, event.clientY)
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
    const point = this.toCanvasPoint(event.clientX, event.clientY)
    if (!point) {
      return
    }
    const areas = this.getSimulationAreas()
    for (let i = areas.hotspots.length - 1; i >= 0; i -= 1) {
      const hotspot = areas.hotspots[i]
      const rect = hotspot.rect
      const corner = getHotspotCornerAtPoint(point.x, point.y, rect)
      if (corner) {
        const anchor = getOppositeCornerPoint(rect, corner)
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
    const point = this.toCanvasPoint(event.clientX, event.clientY)
    if (!point) {
      return
    }
    const areas = this.getSimulationAreas()
    const hotspot = findTopmostHotspotAtPoint(point.x, point.y, areas.hotspots)
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
    const point = this.toCanvasPoint(event.clientX, event.clientY, true)
    if (!point) {
      return
    }
    const areas = this.getSimulationAreas()
    if (this.draggingHotspotId !== null) {
      const hotspot = findHotspotById(areas.hotspots, this.draggingHotspotId)
      if (!hotspot) {
        return
      }
      const nextX = point.x - this.hotspotDragOffset.x
      const nextY = point.y - this.hotspotDragOffset.y
      const clamped = clampHotspotPosition(nextX, nextY, hotspot.rect.width, areas.main)
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
    const resizedRect = getResizedHotspotRect(point.x, point.y, this.hotspotResizeAnchor, this.resizingCorner)
    const clampedRect = clampHotspotRect(resizedRect, areas.main)
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

  private toCanvasPoint(clientX: number, clientY: number, clampToCanvas = false): {x: number; y: number} | null {
    return getCanvasPoint(this.simulationCanvas, clientX, clientY, clampToCanvas)
  }

  private addHotspotAtPoint(x: number, y: number): void {
    const areas = this.getSimulationAreas()
    const size = getDefaultHotspotSize(areas.main, this.config.hotspotSize)
    const clamped = clampHotspotPosition(x - size * 0.5, y - size * 0.5, size, areas.main)
    const hotspot: Hotspot = {
      id: this.nextHotspotId,
      communityId: resolveHotspotCommunityId(
        clamped.x,
        clamped.y,
        size,
        size,
        areas.communities,
        this.config.communitiesEnabled,
      ),
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






  private getModelTypeOptions(): Array<{value: EpidemicModelType; label: string}> {
    return [
      {value: "sir", label: msg("SIR")},
      {value: "sirs", label: msg("SIRS")},
      {value: "seir", label: msg("SEIR")},
      {value: "sird", label: msg("SIRD")},
      {value: "seird", label: msg("SEIRD")},
    ]
  }

  private getModelTypeLabel(modelType: EpidemicModelType): string {
    const option = this.getModelTypeOptions().find((entry) => entry.value === modelType)
    return option?.label ?? modelType.toUpperCase()
  }

  private setAllowControl(key: AllowControlKey, event: Event): void {
    this[key] = this.parseSwitch(event)
  }

  private getTeacherOptionsContext() {
    return {
      modelType: this.modelType,
      modelTypeOptions: this.getModelTypeOptions(),
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
      hotspotVisitProbability: this.hotspotVisitProbability,
      hotspotStayDuration: this.hotspotStayDuration,
      hotspotMaxAgents: this.hotspotMaxAgents,
      hotspotSize: this.hotspotSize,
      communitiesEnabled: this.communitiesEnabled,
      communityLeaveProbability: this.communityLeaveProbability,
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
      allowQuarantineProbabilityControl: this.allowQuarantineProbabilityControl,
      allowQuarantineDurationControl: this.allowQuarantineDurationControl,
      allowHotspotsEnabledControl: this.allowHotspotsEnabledControl,
      allowHotspotVisitProbabilityControl: this.allowHotspotVisitProbabilityControl,
      allowHotspotStayDurationControl: this.allowHotspotStayDurationControl,
      allowHotspotMaxAgentsControl: this.allowHotspotMaxAgentsControl,
      allowHotspotSizeControl: this.allowHotspotSizeControl,
      allowCommunitiesEnabledControl: this.allowCommunitiesEnabledControl,
      allowCommunityLeaveProbabilityControl: this.allowCommunityLeaveProbabilityControl,
      formatDays: formatFrameCountAsDays,
      onModelTypeChange: this.updateModelType,
      onIncubationDurationInput: this.updateIncubationDuration,
      onImmunityDurationInput: this.updateImmunityDuration,
      onMortalityProbabilityInput: this.updateMortalityProbability,
      onPopulationInput: this.updatePopulation,
      onSpeedInput: this.updateSpeed,
      onInfectionRadiusInput: this.updateInfectionRadius,
      onInfectionProbabilityInput: this.updateInfectionProbability,
      onRecoveryDurationInput: this.updateRecoveryDuration,
      onQuarantineEnabled: this.updateQuarantineEnabled,
      onQuarantineProbabilityInput: this.updateQuarantineProbability,
      onQuarantineDurationInput: this.updateQuarantineDuration,
      onHotspotsEnabled: this.updateHotspotsEnabled,
      onHotspotVisitProbabilityInput: this.updateHotspotVisitProbability,
      onHotspotStayDurationInput: this.updateHotspotStayDuration,
      onHotspotMaxAgentsInput: this.updateHotspotMaxAgents,
      onHotspotSizeInput: this.updateHotspotSize,
      onCommunitiesEnabled: this.updateCommunitiesEnabled,
      onCommunityLeaveProbabilityInput: this.updateCommunityLeaveProbability,
      onAllowChange: this.setAllowControl.bind(this),
    }
  }

  render() {
    return html`
      <div part="options" class="teacher-options-shell author-only">
        ${renderTeacherOptions(buildTeacherOptionsInput(this.getTeacherOptionsContext()))}
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

            ${renderCanvasPanel({
              canvasDropActive: this.canvasDropActive,
              hotspotsEnabled: this.hotspotsEnabled,
              showHotspotToolbox: this.isEditMode || this.allowHotspotsEnabledControl,
              isRunning: this.isRunning,
              onCanvasDragOver: this.onCanvasDragOver,
              onCanvasDragLeave: this.onCanvasDragLeave,
              onCanvasDrop: this.onCanvasDrop,
              onCanvasPointerDown: this.onCanvasPointerDown,
              onCanvasContextMenu: this.onCanvasContextMenu,
              onHotspotTokenDragStart: this.onHotspotTokenDragStart,
              onHotspotTokenDragEnd: this.onHotspotTokenDragEnd,
              onToggleSimulation: this.toggleSimulation,
              onResetSimulation: this.resetSimulation,
              onOpenSnapshots: this.openSnapshotsOverlay,
            })}
          </section>
        </section>

        ${
          this.hasVisibleMenuControls
            ? renderMenu(
                buildStudentMenuInput(this.getWidgetConfigValues(), this.userHotspots.length, this.getModelTypeOptions(), {
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
                }),
              )
            : null
        }

        ${this.renderSnapshotsOverlay()}

        ${renderChartOverlay({
          open: this.chartOverlayOpen,
          title: this.getInsightsOverlayTitle(),
          showFitToggle: this.config.modelType === "sir",
          showApproximateFitOverlay: this.showApproximateFitOverlay,
          insights: this.buildChartInsightViewData(),
          onBackdropClick: this.onChartOverlayBackdropClick,
          onCreateSnapshot: this.createSnapshot,
          onClose: this.closeChartOverlay,
          onApproximateFitChange: this.updateApproximateFitOverlay,
        })}
      </section>
    `
  }
}
