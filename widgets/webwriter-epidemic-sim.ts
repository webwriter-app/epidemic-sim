import {LitElementWw} from "@webwriter/lit"
import {customElement, property, state} from "lit/decorators.js"
import type {PropertyValues} from "lit"
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

import {formatApprox} from "./analytics/chart-insights"
import {renderWidgetLayout} from "./components/widget-layout"
import {
  booleanAttributeConverter,
  modelTypeAttributeConverter,
  numberAttributeConverter,
} from "./config/attribute-converters"
import {buildSimulationConfig} from "./config/build-simulation-config"
import {buildStudentMenuInput} from "./config/build-student-menu-input"
import {buildTeacherOptionsInput} from "./config/build-teacher-options-input"
import {buildMenuAllowFlags, type WidgetConfigValues} from "./config/menu-allow-flags"
import {CONFIG_SCHEMA, getRangeLimits, type AllowControlKey} from "./config/widget-schema"
import {AnimationLoopController} from "./controllers/animation-loop-controller"
import {CanvasHostController} from "./controllers/canvas-host-controller"
import {HotspotEditingController} from "./controllers/hotspot-editing-controller"
import {HotspotPointerController} from "./controllers/hotspot-pointer-controller"
import {ChartRuntime, type ChartRuntimeCounts} from "./orchestration/chart-runtime"
import {captureChartSnapshotImage, SnapshotService} from "./orchestration/snapshot-service"
import {hasVisibleMenuControls, sideMenuStyles} from "./rendering/menu-renderer"
import {destroyChart, resetChart} from "./rendering/chart-renderer"
import {drawSimulation} from "./rendering/simulation-renderer"
import {teacherOptionsStyles} from "./rendering/teacher-options-renderer"
import {getEpidemicCounts, initializeAgents, stepSimulation} from "./simulation/engine"
import {isEpidemicModelType, type EpidemicModelType} from "./simulation/epidemic-models"
import {formatFrameCountAsDays} from "./simulation/time"
import type {Agent, SimulationConfig} from "./simulation/types"
import {epidemicSimStyles} from "./styles/epidemic-sim.styles"
import {findTopmostHotspotAtPoint} from "./utils/hotspot-interaction"
import {getCanvasPoint} from "./utils/canvas-coordinates"

@customElement("webwriter-epidemic-sim")
export class WebwriterEpidemicSim extends LitElementWw {
  localize = LOCALIZE

  // Author controls use part="options" (renderTeacherOptions). Keep static options
  // empty so WebWriter does not also render auto-generated WIDGET_OPTIONS fields.
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
  accessor modelType: EpidemicModelType = CONFIG_SCHEMA.modelType.defaultValue

  @property({type: Boolean, attribute: true, reflect: true, converter: booleanAttributeConverter})
  accessor allowModelTypeControl = false

  @property({type: Number, attribute: true, reflect: true, converter: numberAttributeConverter})
  accessor incubationDuration = CONFIG_SCHEMA.incubationDuration.defaultValue

  @property({type: Boolean, attribute: true, reflect: true, converter: booleanAttributeConverter})
  accessor allowIncubationDurationControl = false

  @property({type: Number, attribute: true, reflect: true, converter: numberAttributeConverter})
  accessor immunityDuration = CONFIG_SCHEMA.immunityDuration.defaultValue

  @property({type: Boolean, attribute: true, reflect: true, converter: booleanAttributeConverter})
  accessor allowImmunityDurationControl = false

  @property({type: Number, attribute: true, reflect: true, converter: numberAttributeConverter})
  accessor mortalityProbability = CONFIG_SCHEMA.mortalityProbability.defaultValue

  @property({type: Boolean, attribute: true, reflect: true, converter: booleanAttributeConverter})
  accessor allowMortalityProbabilityControl = false

  @property({type: Number, attribute: true, reflect: true, converter: numberAttributeConverter})
  accessor population = CONFIG_SCHEMA.population.defaultValue

  @property({type: Boolean, attribute: true, reflect: true, converter: booleanAttributeConverter})
  accessor allowPopulationControl = false

  @property({type: Number, attribute: true, reflect: true, converter: numberAttributeConverter})
  accessor speed = CONFIG_SCHEMA.speed.defaultValue

  @property({type: Boolean, attribute: true, reflect: true, converter: booleanAttributeConverter})
  accessor allowSpeedControl = false

  @property({type: Number, attribute: true, reflect: true, converter: numberAttributeConverter})
  accessor infectionRadius = CONFIG_SCHEMA.infectionRadius.defaultValue

  @property({type: Boolean, attribute: true, reflect: true, converter: booleanAttributeConverter})
  accessor allowInfectionRadiusControl = false

  @property({type: Number, attribute: true, reflect: true, converter: numberAttributeConverter})
  accessor infectionProbability = CONFIG_SCHEMA.infectionProbability.defaultValue

  @property({type: Boolean, attribute: true, reflect: true, converter: booleanAttributeConverter})
  accessor allowInfectionProbabilityControl = false

  @property({type: Number, attribute: true, reflect: true, converter: numberAttributeConverter})
  accessor recoveryDuration = CONFIG_SCHEMA.recoveryDuration.defaultValue

  @property({type: Boolean, attribute: true, reflect: true, converter: booleanAttributeConverter})
  accessor allowRecoveryDurationControl = false

  @property({type: Boolean, attribute: true, reflect: true, converter: booleanAttributeConverter})
  accessor quarantineEnabled = CONFIG_SCHEMA.quarantineEnabled.defaultValue

  @property({type: Boolean, attribute: true, reflect: true, converter: booleanAttributeConverter})
  accessor allowQuarantineEnabledControl = false

  @property({type: Number, attribute: true, reflect: true, converter: numberAttributeConverter})
  accessor quarantineProbability = CONFIG_SCHEMA.quarantineProbability.defaultValue

  @property({type: Boolean, attribute: true, reflect: true, converter: booleanAttributeConverter})
  accessor allowQuarantineProbabilityControl = false

  @property({type: Number, attribute: true, reflect: true, converter: numberAttributeConverter})
  accessor quarantineDuration = CONFIG_SCHEMA.quarantineDuration.defaultValue

  @property({type: Boolean, attribute: true, reflect: true, converter: booleanAttributeConverter})
  accessor allowQuarantineDurationControl = false

  @property({type: Boolean, attribute: true, reflect: true, converter: booleanAttributeConverter})
  accessor hotspotsEnabled = CONFIG_SCHEMA.hotspotsEnabled.defaultValue

  @property({type: Boolean, attribute: true, reflect: true, converter: booleanAttributeConverter})
  accessor allowHotspotsEnabledControl = false

  @property({type: Number, attribute: true, reflect: true, converter: numberAttributeConverter})
  accessor hotspotVisitProbability = CONFIG_SCHEMA.hotspotVisitProbability.defaultValue

  @property({type: Boolean, attribute: true, reflect: true, converter: booleanAttributeConverter})
  accessor allowHotspotVisitProbabilityControl = false

  @property({type: Number, attribute: true, reflect: true, converter: numberAttributeConverter})
  accessor hotspotStayDuration = CONFIG_SCHEMA.hotspotStayDuration.defaultValue

  @property({type: Boolean, attribute: true, reflect: true, converter: booleanAttributeConverter})
  accessor allowHotspotStayDurationControl = false

  @property({type: Number, attribute: true, reflect: true, converter: numberAttributeConverter})
  accessor hotspotMaxAgents = CONFIG_SCHEMA.hotspotMaxAgents.defaultValue

  @property({type: Boolean, attribute: true, reflect: true, converter: booleanAttributeConverter})
  accessor allowHotspotMaxAgentsControl = false

  @property({type: Number, attribute: true, reflect: true, converter: numberAttributeConverter})
  accessor hotspotSize = CONFIG_SCHEMA.hotspotSize.defaultValue

  @property({type: Boolean, attribute: true, reflect: true, converter: booleanAttributeConverter})
  accessor allowHotspotSizeControl = false

  @property({type: Boolean, attribute: true, reflect: true, converter: booleanAttributeConverter})
  accessor communitiesEnabled = CONFIG_SCHEMA.communitiesEnabled.defaultValue

  @property({type: Boolean, attribute: true, reflect: true, converter: booleanAttributeConverter})
  accessor allowCommunitiesEnabledControl = false

  @property({type: Number, attribute: true, reflect: true, converter: numberAttributeConverter})
  accessor communityLeaveProbability = CONFIG_SCHEMA.communityLeaveProbability.defaultValue

  @property({type: Boolean, attribute: true, reflect: true, converter: booleanAttributeConverter})
  accessor allowCommunityLeaveProbabilityControl = false

  private get config(): SimulationConfig {
    return buildSimulationConfig(this.getWidgetConfigValues())
  }

  private simulationCanvas: HTMLCanvasElement | null = null
  private simulationCtx: CanvasRenderingContext2D | null = null
  private chartCanvas: HTMLCanvasElement | null = null
  private enlargedChartCanvas: HTMLCanvasElement | null = null
  private readonly canvasHost = new CanvasHostController(this)
  private readonly chartRuntime = new ChartRuntime()
  private readonly snapshotService = new SnapshotService()
  private readonly hotspotEditing = new HotspotEditingController(this, {
    getCanvas: () => this.simulationCanvas,
    getConfig: () => this.config,
    enableHotspots: () => {
      this.hotspotsEnabled = true
    },
    onHotspotsChanged: () => this.requestUpdateAndRedrawSimulationWhenPaused(),
    onRestartPreservingHotspots: () => this.restartSimulation(),
    isPointerDragging: (hotspotId) => this.hotspotPointer.isDragging(hotspotId),
    clearPointer: () => this.hotspotPointer.clear(),
  })
  private readonly hotspotPointer = new HotspotPointerController(this, {
    getCanvas: () => this.simulationCanvas,
    getAreas: () => this.hotspotEditing.getAreas(this.config),
    updateHotspotRect: (hotspotId, rect) => this.hotspotEditing.updateHotspotRect(hotspotId, rect),
  })
  private readonly animationLoop = new AnimationLoopController(this, () => {
    if (!this.isRunning) {
      return false
    }
    this.stepSimulation()
    this.drawSimulation()
    if (this.isRunning) {
      this.drawChart()
    }
    return this.isRunning
  })

  @state() accessor isRunning = false
  @state() accessor chartOverlayOpen = false
  @state() accessor snapshotsOverlayOpen = false
  @state() accessor showApproximateFitOverlay = false
  @state() accessor chartContextMenuOpen = false
  @state() accessor chartContextMenuPosition = {x: 0, y: 0}

  private frameIndex = 0
  private agents: Agent[] = []
  private susceptibleCount = 0
  private exposedCount = 0
  private infectedCount = 0
  private recoveredCount = 0
  private deadCount = 0

  connectedCallback(): void {
    super.connectedCallback()
    window.addEventListener("keydown", this.onWindowKeyDown)
    if (this.simulationCanvas) {
      this.startLoop()
    }
  }

  protected updated(changed: PropertyValues<this>): void {
    if (changed.has("chartOverlayOpen")) {
      if (this.chartOverlayOpen) {
        this.enlargedChartCanvas = this.canvasHost.queryCanvas("#chart-canvas-enlarged")
        this.drawChart()
      } else if (changed.get("chartOverlayOpen")) {
        destroyChart(this.enlargedChartCanvas)
        this.enlargedChartCanvas = null
      }
    }
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
    this.hotspotPointer.clear()
    destroyChart(this.chartCanvas)
    destroyChart(this.enlargedChartCanvas)
    window.removeEventListener("keydown", this.onWindowKeyDown)
    super.disconnectedCallback()
  }

  firstUpdated(): void {
    this.simulationCanvas = this.canvasHost.queryCanvas("#simulation-canvas")
    this.simulationCtx = this.canvasHost.queryContext("#simulation-canvas")
    this.chartCanvas = this.canvasHost.queryCanvas("#chart-canvas")
    this.resetSimulation()
    this.startLoop()
  }

  private resetSimulation = (): void => {
    this.restartSimulation({clearPointer: true, resetInteractionFlags: true})
  }

  private restartSimulation(options?: {clearPointer?: boolean; resetInteractionFlags?: boolean}): void {
    if (options?.clearPointer) {
      this.hotspotPointer.clear()
    }
    if (options?.resetInteractionFlags) {
      this.hotspotEditing.resetInteractionFlags()
    }
    this.frameIndex = 0
    this.chartRuntime.reset()
    resetChart(this.chartCanvas)
    this.initializeAgents(0)
    this.updateEpidemicCounts()
    this.drawChart()
    this.requestUpdateAndRedrawSimulationWhenPaused()
  }

  private parseRangeInput(event: Event): number {
    const target = (event.currentTarget ?? event.target) as ({value?: string | number} & EventTarget) | null
    return target?.value !== undefined ? Number(target.value) : 0
  }

  private parseSwitch(event: Event): boolean {
    const target = (event.currentTarget ?? event.target) as ({checked?: boolean} & EventTarget) | null
    return target?.checked ?? false
  }

  private initializeAgents(infectedAtFrame: number): void {
    const canvas = this.simulationCanvas
    if (!canvas) {
      this.agents = []
      return
    }
    this.agents = initializeAgents(this.config, this.hotspotEditing.getAreas(this.config), infectedAtFrame)
  }

  private get isEditMode(): boolean {
    return this.contentEditable === "true" || this.contentEditable === ""
  }

  private get hasVisibleMenuControls(): boolean {
    return hasVisibleMenuControls(this.getMenuAllowFlags(), this.modelType)
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

  private updateModelType = (event: Event): void => {
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

  private getCounts(): ChartRuntimeCounts {
    return {
      susceptible: this.susceptibleCount,
      exposed: this.exposedCount,
      infected: this.infectedCount,
      recovered: this.recoveredCount,
      dead: this.deadCount,
    }
  }

  private readonly configHandlers = {
    onModelTypeChange: this.updateModelType,
    onIncubationDurationInput: (event: Event) => this.updateConfigFromRange(event, "incubationDuration"),
    onImmunityDurationInput: (event: Event) => this.updateConfigFromRange(event, "immunityDuration"),
    onMortalityProbabilityInput: (event: Event) => this.updateConfigFromRange(event, "mortalityProbability"),
    onPopulationInput: (event: Event) => {
      const range = getRangeLimits("population")
      const nextPopulation = this.clamp(
        Math.round(this.parseRangeInput(event) / range.step) * range.step,
        range.min,
        range.max,
      )
      if (nextPopulation === this.population) {
        return
      }
      this.population = nextPopulation
    },
    onSpeedInput: (event: Event) => this.updateConfigFromRange(event, "speed"),
    onInfectionRadiusInput: (event: Event) => this.updateConfigFromRange(event, "infectionRadius"),
    onInfectionProbabilityInput: (event: Event) => this.updateConfigFromRange(event, "infectionProbability"),
    onRecoveryDurationInput: (event: Event) => this.updateConfigFromRange(event, "recoveryDuration"),
    onQuarantineEnabled: (event: Event) => this.updateConfig("quarantineEnabled", this.parseSwitch(event)),
    onQuarantineProbabilityInput: (event: Event) => this.updateConfigFromRange(event, "quarantineProbability"),
    onQuarantineDurationInput: (event: Event) => this.updateConfigFromRange(event, "quarantineDuration"),
    onHotspotsEnabled: (event: Event) => this.updateConfig("hotspotsEnabled", this.parseSwitch(event)),
    onHotspotVisitProbabilityInput: (event: Event) => this.updateConfigFromRange(event, "hotspotVisitProbability"),
    onHotspotStayDurationInput: (event: Event) => this.updateConfigFromRange(event, "hotspotStayDuration"),
    onHotspotMaxAgentsInput: (event: Event) => {
      const range = getRangeLimits("hotspotMaxAgents")
      const maxAgents = this.clamp(Math.round(this.parseRangeInput(event)), range.min, range.max)
      this.updateConfig("hotspotMaxAgents", maxAgents)
    },
    onHotspotSizeInput: (event: Event) => {
      const range = getRangeLimits("hotspotSize")
      const size = this.clamp(Math.round(this.parseRangeInput(event)), range.min, range.max)
      this.updateConfig("hotspotSize", size)
    },
    onCommunitiesEnabled: (event: Event) => this.updateConfig("communitiesEnabled", this.parseSwitch(event)),
    onCommunityLeaveProbabilityInput: (event: Event) =>
      this.updateConfigFromRange(event, "communityLeaveProbability"),
  }

  private reseedPopulation(): void {
    resetChart(this.chartCanvas)
    this.chartRuntime.reset()
    this.initializeAgents(this.frameIndex)
    this.updateEpidemicCounts()
    this.drawChart()
    this.redrawSimulationWhenPaused()
  }

  private startLoop(): void {
    if (this.isRunning) {
      return
    }
    this.isRunning = true
    this.animationLoop.start()
  }

  private stopLoop(): void {
    if (this.isRunning) {
      this.isRunning = false
      this.animationLoop.stop()
    }
  }

  private toggleSimulation = (): void => {
    if (this.isRunning) {
      this.stopLoop()
    } else {
      if (!this.hasActiveInfection()) {
        this.restartSimulation()
      }
      this.startLoop()
    }
  }

  private onMainContentClick = (): void => {
    this.closeChartContextMenu()
  }

  private createSnapshot = (): void => {
    this.drawChart()
    const counts = this.getCounts()
    this.snapshotService.create({
      config: this.config,
      frameIndex: this.frameIndex,
      epidemicEnded: this.chartRuntime.epidemicEnded,
      susceptibleCount: counts.susceptible,
      exposedCount: counts.exposed,
      infectedCount: counts.infected,
      recoveredCount: counts.recovered,
      deadCount: counts.dead,
      susceptibleHistory: [...this.chartRuntime.susceptibleHistory],
      exposedHistory: [...this.chartRuntime.exposedHistory],
      infectedHistory: [...this.chartRuntime.infectedHistory],
      recoveredHistory: [...this.chartRuntime.recoveredHistory],
      deadHistory: [...this.chartRuntime.deadHistory],
      userHotspots: this.hotspotEditing.userHotspots,
      estimatedR0: this.chartRuntime.estimateR0(this.config.recoveryDuration),
      chartImageJpeg: captureChartSnapshotImage({
        chartOverlayOpen: this.chartOverlayOpen,
        enlargedChartCanvas: this.enlargedChartCanvas,
        chartCanvas: this.chartCanvas,
        showApproximateFitOverlay: this.showApproximateFitOverlay,
        population: this.config.population,
        buildSeries: (includeApproximation) => this.chartRuntime.buildSeries(this.config, includeApproximation),
        buildDayLabels: (series) => this.chartRuntime.buildDayLabels(series),
      }),
    })
    this.requestUpdate()
    this.closeChartContextMenu()
  }

  private deleteSnapshot = (snapshotId: string): void => {
    this.snapshotService.delete(snapshotId)
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
    await this.updateComplete
  }

  private closeChartOverlay = (): void => {
    if (!this.chartOverlayOpen) {
      return
    }
    this.chartOverlayOpen = false
  }

  private openSnapshotsOverlay = (): void => {
    if (this.snapshotsOverlayOpen) {
      return
    }
    this.closeChartOverlay()
    this.closeChartContextMenu()
    this.snapshotsOverlayOpen = true
  }

  private closeSnapshotsOverlay = (): void => {
    if (!this.snapshotsOverlayOpen) {
      return
    }
    this.snapshotsOverlayOpen = false
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
  }

  private closeChartContextMenu = (): void => {
    if (!this.chartContextMenuOpen) {
      return
    }
    this.chartContextMenuOpen = false
  }

  private updateApproximateFitOverlay = (event: Event): void => {
    this.showApproximateFitOverlay = this.parseSwitch(event)
    this.drawChart()
  }

  private stepSimulation(): void {
    if (!this.simulationCanvas || this.agents.length === 0) {
      return
    }
    this.frameIndex = stepSimulation(
      this.agents,
      this.frameIndex,
      this.config,
      this.hotspotEditing.getAreas(this.config),
    )
    this.updateEpidemicCounts()
    if (!this.hasActiveInfection() && this.isRunning && this.chartRuntime.hadInfection && this.config.modelType !== "sirs") {
      this.stopLoop()
      this.drawChart()
    }
  }

  private updateEpidemicCounts(): void {
    const counts = getEpidemicCounts(this.agents)
    this.susceptibleCount = counts.susceptible
    this.exposedCount = counts.exposed
    this.infectedCount = counts.infected
    this.recoveredCount = counts.recovered
    this.deadCount = counts.dead
    this.chartRuntime.recordPoint(this.frameIndex, this.getCounts(), this.config.modelType, this.hasActiveInfection())
  }

  private drawSimulation(): void {
    const ctx = this.simulationCtx
    const canvas = this.simulationCanvas
    if (!ctx || !canvas) {
      return
    }
    drawSimulation(ctx, canvas, this.agents, this.hotspotEditing.getAreas(this.config))
  }

  private drawChart(): void {
    if (this.chartOverlayOpen) {
      const enlargedCanvas =
        this.enlargedChartCanvas ?? this.canvasHost.queryCanvas("#chart-canvas-enlarged")
      if (enlargedCanvas) {
        this.enlargedChartCanvas = enlargedCanvas
      }
    }
    this.chartRuntime.draw(
      this.config,
      this.chartCanvas,
      this.enlargedChartCanvas,
      this.chartOverlayOpen,
      this.showApproximateFitOverlay,
    )
  }

  private onCanvasPointerDown = (event: PointerEvent): void => {
    if (!this.config.hotspotsEnabled) {
      return
    }
    const areas = this.hotspotEditing.getAreas(this.config)
    this.hotspotPointer.handlePointerDown(event, areas.hotspots)
  }

  private onCanvasContextMenu = (event: MouseEvent): void => {
    if (!this.config.hotspotsEnabled) {
      return
    }
    const point = getCanvasPoint(this.simulationCanvas, event.clientX, event.clientY)
    if (!point) {
      return
    }
    const areas = this.hotspotEditing.getAreas(this.config)
    const hotspot = findTopmostHotspotAtPoint(point.x, point.y, areas.hotspots)
    if (!hotspot) {
      return
    }
    event.preventDefault()
    this.hotspotEditing.removeHotspot(hotspot.id)
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

  private getModelTypeLabel = (modelType: EpidemicModelType): string => {
    const option = this.getModelTypeOptions().find((entry) => entry.value === modelType)
    return option?.label ?? modelType.toUpperCase()
  }

  private setAllowControl = (key: AllowControlKey, event: Event): void => {
    this[key] = this.parseSwitch(event)
  }

  private getTeacherOptionsContext() {
    return {
      ...this.getWidgetConfigValues(),
      modelTypeOptions: this.getModelTypeOptions(),
      formatDays: formatFrameCountAsDays,
      ...this.configHandlers,
      onAllowChange: this.setAllowControl,
    }
  }

  render() {
    return renderWidgetLayout({
      hasVisibleMenuControls: this.hasVisibleMenuControls,
      teacherOptions: buildTeacherOptionsInput(this.getTeacherOptionsContext()),
      chartContextMenuOpen: this.chartContextMenuOpen,
      chartContextMenuPosition: this.chartContextMenuPosition,
      onMainContentClick: this.onMainContentClick,
      onChartPanelDoubleClick: this.onChartPanelDoubleClick,
      onChartContextMenu: this.onChartContextMenu,
      onCreateSnapshot: this.createSnapshot,
      canvasDropActive: this.hotspotEditing.canvasDropActive,
      hotspotsEnabled: this.hotspotsEnabled,
      showHotspotToolbox: this.isEditMode || this.allowHotspotsEnabledControl,
      isRunning: this.isRunning,
      onCanvasDragOver: this.hotspotEditing.onCanvasDragOver,
      onCanvasDragLeave: this.hotspotEditing.onCanvasDragLeave,
      onCanvasDrop: this.hotspotEditing.onCanvasDrop,
      onCanvasPointerDown: this.onCanvasPointerDown,
      onCanvasContextMenu: this.onCanvasContextMenu,
      onHotspotTokenDragStart: this.hotspotEditing.onTokenDragStart,
      onHotspotTokenDragEnd: this.hotspotEditing.onTokenDragEnd,
      onToggleSimulation: this.toggleSimulation,
      onResetSimulation: this.resetSimulation,
      onOpenSnapshots: this.openSnapshotsOverlay,
      studentMenu: this.hasVisibleMenuControls
        ? buildStudentMenuInput(
            this.getWidgetConfigValues(),
            this.hotspotEditing.userHotspots.length,
            this.getModelTypeOptions(),
            this.configHandlers,
          )
        : null,
      snapshotsOverlayOpen: this.snapshotsOverlayOpen,
      snapshots: this.snapshotService.snapshots,
      onSnapshotsBackdropClick: this.onSnapshotsOverlayBackdropClick,
      onCloseSnapshots: this.closeSnapshotsOverlay,
      getModelTypeLabel: this.getModelTypeLabel,
      formatDays: formatFrameCountAsDays,
      formatApprox,
      onDeleteSnapshot: this.deleteSnapshot,
      chartOverlayOpen: this.chartOverlayOpen,
      chartOverlayTitle: this.chartRuntime.getInsightsOverlayTitle(this.config.modelType),
      showFitToggle: this.config.modelType === "sir",
      showApproximateFitOverlay: this.showApproximateFitOverlay,
      chartInsights: this.chartRuntime.buildInsightViewData(this.frameIndex, this.getCounts(), this.config),
      onChartBackdropClick: this.onChartOverlayBackdropClick,
      onCloseChartOverlay: this.closeChartOverlay,
      onApproximateFitChange: this.updateApproximateFitOverlay,
    })
  }
}
