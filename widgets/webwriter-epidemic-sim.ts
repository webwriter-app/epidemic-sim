import {LitElementWw} from "@webwriter/lit"
import {customElement, property, state} from "lit/decorators.js"
import type {PropertyValues} from "lit"
import {msg} from "@lit/localize"
import SlButton from "@shoelace-style/shoelace/dist/components/button/button.component.js"
import SlCard from "@shoelace-style/shoelace/dist/components/card/card.component.js"
import SlDetails from "@shoelace-style/shoelace/dist/components/details/details.component.js"
import SlDropdown from "@shoelace-style/shoelace/dist/components/dropdown/dropdown.component.js"
import SlMenu from "@shoelace-style/shoelace/dist/components/menu/menu.component.js"
import SlMenuItem from "@shoelace-style/shoelace/dist/components/menu-item/menu-item.component.js"
import SlRange from "@shoelace-style/shoelace/dist/components/range/range.component.js"
import SlSwitch from "@shoelace-style/shoelace/dist/components/switch/switch.component.js"
import SlTag from "@shoelace-style/shoelace/dist/components/tag/tag.component.js"
import SlSelect from "@shoelace-style/shoelace/dist/components/select/select.component.js"
import SlOption from "@shoelace-style/shoelace/dist/components/option/option.component.js"
import shoelaceLightStyles from "@shoelace-style/shoelace/dist/themes/light.styles.js"
import LOCALIZE from "../localization/generated"

import {formatApprox} from "./analytics/chart-insights"
import type {SelectedHotspotInput} from "./components/canvas-panel"
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
import {
  readPersistedState,
  writePersistedState,
  STATE_ATTRIBUTE,
  parsePersistedState,
  encodePersistedState,
} from "./orchestration/persisted-state"
import {buildSnapshotCsv, drawSnapshotChart, renderSnapshotChartPng, SnapshotService} from "./orchestration/snapshot-service"
import {hasVisibleMenuControls, sideMenuStyles} from "./rendering/menu-renderer"
import {destroyChart, resetChart} from "./rendering/chart-renderer"
import {drawSimulation} from "./rendering/simulation-renderer"
import {teacherOptionsStyles} from "./rendering/teacher-options-renderer"
import {getEpidemicCounts, initializeAgents, stepSimulation} from "./simulation/engine"
import {isEpidemicModelType, type EpidemicModelType} from "./simulation/epidemic-models"
import {formatFrameCountAsDays} from "./simulation/time"
import type {Agent, SimulationAreas, SimulationConfig} from "./simulation/types"
import {epidemicSimStyles} from "./styles/epidemic-sim.styles"
import {findTopmostHotspotAtPoint, getHotspotLabel} from "./utils/hotspot-interaction"
import {fitCanvasToDisplaySize, getCanvasPoint} from "./utils/canvas-coordinates"

@customElement("webwriter-epidemic-sim")
export class WebwriterEpidemicSim extends LitElementWw {
  protected localize = LOCALIZE as {
    getLocale: () => string
    setLocale: (locale: string) => Promise<void>
  }

  static scopedElements = {
    "sl-button": SlButton,
    "sl-card": SlCard,
    "sl-details": SlDetails,
    "sl-dropdown": SlDropdown,
    "sl-menu": SlMenu,
    "sl-menu-item": SlMenuItem,
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

  @property({
    type: Boolean,
    attribute: "allow-model-type-control",
    reflect: true,
    converter: booleanAttributeConverter,
  })
  accessor allowModelTypeControl = false

  @property({
    type: Number,
    attribute: "incubation-duration",
    reflect: true,
    converter: numberAttributeConverter,
  })
  accessor incubationDuration = CONFIG_SCHEMA.incubationDuration.defaultValue

  @property({
    type: Boolean,
    attribute: "allow-incubation-duration-control",
    reflect: true,
    converter: booleanAttributeConverter,
  })
  accessor allowIncubationDurationControl = false

  @property({
    type: Number,
    attribute: "immunity-duration",
    reflect: true,
    converter: numberAttributeConverter,
  })
  accessor immunityDuration = CONFIG_SCHEMA.immunityDuration.defaultValue

  @property({
    type: Boolean,
    attribute: "allow-immunity-duration-control",
    reflect: true,
    converter: booleanAttributeConverter,
  })
  accessor allowImmunityDurationControl = false

  @property({
    type: Number,
    attribute: "mortality-probability",
    reflect: true,
    converter: numberAttributeConverter,
  })
  accessor mortalityProbability = CONFIG_SCHEMA.mortalityProbability.defaultValue

  @property({
    type: Boolean,
    attribute: "allow-mortality-probability-control",
    reflect: true,
    converter: booleanAttributeConverter,
  })
  accessor allowMortalityProbabilityControl = false

  @property({type: Number, attribute: "population", reflect: true, converter: numberAttributeConverter})
  accessor population = CONFIG_SCHEMA.population.defaultValue

  @property({
    type: Boolean,
    attribute: "allow-population-control",
    reflect: true,
    converter: booleanAttributeConverter,
  })
  accessor allowPopulationControl = false

  @property({type: Number, attribute: "speed", reflect: true, converter: numberAttributeConverter})
  accessor speed = CONFIG_SCHEMA.speed.defaultValue

  @property({
    type: Boolean,
    attribute: "allow-speed-control",
    reflect: true,
    converter: booleanAttributeConverter,
  })
  accessor allowSpeedControl = false

  @property({
    type: Number,
    attribute: "infection-radius",
    reflect: true,
    converter: numberAttributeConverter,
  })
  accessor infectionRadius = CONFIG_SCHEMA.infectionRadius.defaultValue

  @property({
    type: Boolean,
    attribute: "allow-infection-radius-control",
    reflect: true,
    converter: booleanAttributeConverter,
  })
  accessor allowInfectionRadiusControl = false

  @property({
    type: Number,
    attribute: "infection-probability",
    reflect: true,
    converter: numberAttributeConverter,
  })
  accessor infectionProbability = CONFIG_SCHEMA.infectionProbability.defaultValue

  @property({
    type: Boolean,
    attribute: "allow-infection-probability-control",
    reflect: true,
    converter: booleanAttributeConverter,
  })
  accessor allowInfectionProbabilityControl = false

  @property({
    type: Number,
    attribute: "recovery-duration",
    reflect: true,
    converter: numberAttributeConverter,
  })
  accessor recoveryDuration = CONFIG_SCHEMA.recoveryDuration.defaultValue

  @property({
    type: Boolean,
    attribute: "allow-recovery-duration-control",
    reflect: true,
    converter: booleanAttributeConverter,
  })
  accessor allowRecoveryDurationControl = false

  @property({
    type: Number,
    attribute: "simulation-duration",
    reflect: true,
    converter: numberAttributeConverter,
  })
  accessor simulationDuration = CONFIG_SCHEMA.simulationDuration.defaultValue

  @property({
    type: Boolean,
    attribute: "allow-simulation-duration-control",
    reflect: true,
    converter: booleanAttributeConverter,
  })
  accessor allowSimulationDurationControl = false

  @property({
    type: Boolean,
    attribute: "quarantine-enabled",
    reflect: true,
    converter: booleanAttributeConverter,
  })
  accessor quarantineEnabled = CONFIG_SCHEMA.quarantineEnabled.defaultValue

  @property({
    type: Boolean,
    attribute: "allow-quarantine-enabled-control",
    reflect: true,
    converter: booleanAttributeConverter,
  })
  accessor allowQuarantineEnabledControl = false

  @property({
    type: Number,
    attribute: "quarantine-probability",
    reflect: true,
    converter: numberAttributeConverter,
  })
  accessor quarantineProbability = CONFIG_SCHEMA.quarantineProbability.defaultValue

  @property({
    type: Boolean,
    attribute: "allow-quarantine-probability-control",
    reflect: true,
    converter: booleanAttributeConverter,
  })
  accessor allowQuarantineProbabilityControl = false

  @property({
    type: Number,
    attribute: "quarantine-duration",
    reflect: true,
    converter: numberAttributeConverter,
  })
  accessor quarantineDuration = CONFIG_SCHEMA.quarantineDuration.defaultValue

  @property({
    type: Boolean,
    attribute: "allow-quarantine-duration-control",
    reflect: true,
    converter: booleanAttributeConverter,
  })
  accessor allowQuarantineDurationControl = false

  @property({
    type: Boolean,
    attribute: "hotspots-enabled",
    reflect: true,
    converter: booleanAttributeConverter,
  })
  accessor hotspotsEnabled = CONFIG_SCHEMA.hotspotsEnabled.defaultValue

  @property({
    type: Boolean,
    attribute: "allow-hotspots-enabled-control",
    reflect: true,
    converter: booleanAttributeConverter,
  })
  accessor allowHotspotsEnabledControl = false

  @property({
    type: Number,
    attribute: "hotspot-visit-probability",
    reflect: true,
    converter: numberAttributeConverter,
  })
  accessor hotspotVisitProbability = CONFIG_SCHEMA.hotspotVisitProbability.defaultValue

  @property({
    type: Boolean,
    attribute: "allow-hotspot-visit-probability-control",
    reflect: true,
    converter: booleanAttributeConverter,
  })
  accessor allowHotspotVisitProbabilityControl = false

  @property({
    type: Number,
    attribute: "hotspot-stay-duration",
    reflect: true,
    converter: numberAttributeConverter,
  })
  accessor hotspotStayDuration = CONFIG_SCHEMA.hotspotStayDuration.defaultValue

  @property({
    type: Boolean,
    attribute: "allow-hotspot-stay-duration-control",
    reflect: true,
    converter: booleanAttributeConverter,
  })
  accessor allowHotspotStayDurationControl = false

  @property({
    type: Number,
    attribute: "hotspot-max-agents",
    reflect: true,
    converter: numberAttributeConverter,
  })
  accessor hotspotMaxAgents = CONFIG_SCHEMA.hotspotMaxAgents.defaultValue

  @property({
    type: Boolean,
    attribute: "allow-hotspot-max-agents-control",
    reflect: true,
    converter: booleanAttributeConverter,
  })
  accessor allowHotspotMaxAgentsControl = false

  @property({type: Number, attribute: "hotspot-size", reflect: true, converter: numberAttributeConverter})
  accessor hotspotSize = CONFIG_SCHEMA.hotspotSize.defaultValue

  @property({
    type: Boolean,
    attribute: "allow-hotspot-size-control",
    reflect: true,
    converter: booleanAttributeConverter,
  })
  accessor allowHotspotSizeControl = false

  @property({
    type: Boolean,
    attribute: "communities-enabled",
    reflect: true,
    converter: booleanAttributeConverter,
  })
  accessor communitiesEnabled = CONFIG_SCHEMA.communitiesEnabled.defaultValue

  @property({
    type: Boolean,
    attribute: "allow-communities-enabled-control",
    reflect: true,
    converter: booleanAttributeConverter,
  })
  accessor allowCommunitiesEnabledControl = false

  @property({
    type: Number,
    attribute: "community-leave-probability",
    reflect: true,
    converter: numberAttributeConverter,
  })
  accessor communityLeaveProbability = CONFIG_SCHEMA.communityLeaveProbability.defaultValue

  @property({
    type: Boolean,
    attribute: "allow-community-leave-probability-control",
    reflect: true,
    converter: booleanAttributeConverter,
  })
  accessor allowCommunityLeaveProbabilityControl = false

  @property({attribute: STATE_ATTRIBUTE, reflect: true})
  accessor widgetState = ""

  private get config(): SimulationConfig {
    return buildSimulationConfig(this.getWidgetConfigValues())
  }

  private simulationCanvas: HTMLCanvasElement | null = null
  private simulationCtx: CanvasRenderingContext2D | null = null
  private chartCanvas: HTMLCanvasElement | null = null
  private snapshotChartIds = new Map<HTMLCanvasElement, string>()
  private readonly canvasHost = new CanvasHostController(this)
  private readonly chartRuntime = new ChartRuntime()
  private readonly snapshotService = new SnapshotService()
  private readonly hotspotEditing: HotspotEditingController = new HotspotEditingController(this, {
    getCanvas: () => this.simulationCanvas,
    getConfig: () => this.config,
    enableHotspots: () => {
      this.hotspotsEnabled = true
    },
    onHotspotsChanged: () => {
      this.schedulePersistWidgetState()
      this.requestUpdateAndRedrawSimulationWhenPaused()
    },
    onRestartPreservingHotspots: () => {
      this.schedulePersistWidgetState()
      this.restartSimulation()
    },
    isPointerDragging: (hotspotId: number): boolean => this.hotspotPointer.isDragging(hotspotId),
    clearPointer: () => this.hotspotPointer.clear(),
    persistHotspots: () => {
      this.schedulePersistWidgetState()
    },
  })
  private readonly hotspotPointer: HotspotPointerController = new HotspotPointerController(this, {
    getCanvas: () => this.simulationCanvas,
    getAreas: (): SimulationAreas => this.hotspotEditing.getAreas(this.config),
    updateHotspotRect: (hotspotId: number, rect) => this.hotspotEditing.updateHotspotRect(hotspotId, rect),
    removeHotspot: (hotspotId: number) => this.hotspotEditing.removeHotspot(hotspotId),
    onRemovalPendingChange: () => this.requestUpdateAndRedrawSimulationWhenPaused(),
  })
  private persistStateTimer: number | null = null
  private applyingPersistedState = false
  private lastWrittenWidgetState = ""
  private readonly animationLoop = new AnimationLoopController(this, () => {
    if (this.classList.contains("ww-beforeprint")) {
      this.stopLoop()
      return false
    }
    if (!this.isRunning) {
      return false
    }
    this.stepSimulation()
    this.drawSimulation()
    if (this.isRunning) {
      this.drawChart()
    }
    if (this.insightsOpen || this.isFullscreen) {
      this.requestUpdate()
    }
    return this.isRunning
  })

  @state() accessor isRunning = false
  @state() accessor insightsOpen = false
  @state() accessor isFullscreen = false
  @state() accessor snapshotsOverlayOpen = false
  @state() accessor chartContextMenuOpen = false
  @state() accessor chartContextMenuPosition = {x: 0, y: 0}
  @state() accessor isPrintPreparing = false
  @state() accessor selectedHotspotId: number | null = null
  @state() accessor hotspotPlacementActive = false

  private frameIndex = 0
  private agents: Agent[] = []
  private susceptibleCount = 0
  private exposedCount = 0
  private infectedCount = 0
  private recoveredCount = 0
  private deadCount = 0
  private printClassObserver: MutationObserver | null = null
  private canvasResizeObserver: ResizeObserver | null = null

  connectedCallback(): void {
    super.connectedCallback()
    window.addEventListener("keydown", this.onWindowKeyDown)
    this.ownerDocument.addEventListener("fullscreenchange", this.syncFullscreenState)
    this.printClassObserver = new MutationObserver(() => {
      const next =
        this.classList.contains("ww-beforeprint") || this.classList.contains("ww-printable")
      if (next !== this.isPrintPreparing) {
        this.isPrintPreparing = next
      }
      this.syncFullscreenState()
    })
    this.printClassObserver.observe(this, {attributes: true, attributeFilter: ["class"]})
    this.isPrintPreparing =
      this.classList.contains("ww-beforeprint") || this.classList.contains("ww-printable")
    if (this.simulationCanvas) {
      this.observeCanvasSize()
      this.startLoop()
    }
  }

  protected updated(changed: PropertyValues<this>): void {
    if (changed.has("widgetState")) {
      if (this.widgetState !== this.lastWrittenWidgetState) {
        this.lastWrittenWidgetState = this.widgetState
        this.applyPersistedState(parsePersistedState(this.widgetState), {restartSimulation: true})
      }
    }
    if (this.snapshotsOverlayOpen || changed.has("snapshotsOverlayOpen")) {
      this.drawSnapshotCharts()
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
    this.printClassObserver?.disconnect()
    this.printClassObserver = null
    this.canvasResizeObserver?.disconnect()
    this.canvasResizeObserver = null
    if (this.persistStateTimer !== null) {
      window.clearTimeout(this.persistStateTimer)
      this.persistStateTimer = null
      this.flushPersistWidgetState()
    }
    this.stopLoop()
    this.hotspotPointer.clear()
    destroyChart(this.chartCanvas)
    this.destroySnapshotCharts()
    window.removeEventListener("keydown", this.onWindowKeyDown)
    this.ownerDocument.removeEventListener("fullscreenchange", this.syncFullscreenState)
    super.disconnectedCallback()
  }

  firstUpdated(): void {
    this.simulationCanvas = this.canvasHost.queryCanvas("#simulation-canvas")
    this.simulationCtx = this.canvasHost.queryContext("#simulation-canvas")
    this.chartCanvas = this.canvasHost.queryCanvas("#chart-canvas")
    this.observeCanvasSize()
    this.applyPersistedState(readPersistedState(this), {restartSimulation: false})
    this.resetSimulation()
    this.startLoop()
  }

  private schedulePersistWidgetState(): void {
    if (this.persistStateTimer !== null) {
      window.clearTimeout(this.persistStateTimer)
    }
    this.persistStateTimer = window.setTimeout(() => {
      this.persistStateTimer = null
      this.flushPersistWidgetState()
    }, 120)
  }

  private flushPersistWidgetState(): void {
    if (this.applyingPersistedState) {
      return
    }
    const hotspotMeta = this.hotspotEditing.getPersistedSnapshot()
    const snapshotMeta = this.snapshotService.getPersistedMeta()
    const state = {
      version: 1 as const,
      hotspots: hotspotMeta.hotspots,
      nextHotspotId: hotspotMeta.nextHotspotId,
      snapshots: snapshotMeta.snapshots,
      nextSnapshotId: snapshotMeta.nextSnapshotId,
    }
    const encoded = encodePersistedState(state)
    this.applyingPersistedState = true
    try {
      this.lastWrittenWidgetState = encoded
      if (this.widgetState !== encoded) {
        this.widgetState = encoded
      }
      writePersistedState(this, state)
    } finally {
      this.applyingPersistedState = false
    }
  }

  private applyPersistedState(
    persisted: ReturnType<typeof readPersistedState>,
    options: {restartSimulation: boolean},
  ): void {
    if (!persisted || this.applyingPersistedState) {
      return
    }
    this.applyingPersistedState = true
    try {
      this.hotspotEditing.hydrate(persisted.hotspots, persisted.nextHotspotId)
      this.snapshotService.hydrate(persisted.snapshots, persisted.nextSnapshotId)
      if (options.restartSimulation && this.simulationCanvas) {
        this.restartSimulation({clearPointer: true})
      }
      this.requestUpdate()
    } finally {
      this.applyingPersistedState = false
    }
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
      simulationDuration: this.simulationDuration,
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
      allowSimulationDurationControl: this.allowSimulationDurationControl,
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

  private observeCanvasSize(): void {
    if (!this.simulationCanvas || this.canvasResizeObserver) {
      return
    }
    this.canvasResizeObserver = new ResizeObserver(() => this.redrawSimulationWhenPaused())
    this.canvasResizeObserver.observe(this.simulationCanvas)
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

  private isEpidemicWaveFinished(): boolean {
    if (this.frameIndex >= this.config.simulationDuration) {
      return true
    }
    if (this.hasActiveInfection()) {
      return false
    }
    if (this.config.modelType === "sirs") {
      return this.recoveredCount === 0
    }
    return true
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
    onSimulationDurationInput: (event: Event) => this.updateConfigFromRange(event, "simulationDuration"),
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
      if (this.isEpidemicWaveFinished()) {
        this.restartSimulation()
      }
      this.startLoop()
    }
  }

  private onMainContentClick = (): void => {
    this.closeChartContextMenu()
  }

  private createSnapshot = (): void => {
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
    })
    this.flushPersistWidgetState()
    this.requestUpdate()
    this.closeChartContextMenu()
  }

  private downloadSnapshotImage = (snapshotId: string): void => {
    const snapshot = this.snapshotService.snapshots.find((entry) => entry.id === snapshotId)
    if (!snapshot || !this.shadowRoot) {
      return
    }
    const png = renderSnapshotChartPng(this.shadowRoot, snapshot)
    if (!png) {
      return
    }
    this.triggerDownload(png, `${snapshot.label}.png`)
  }

  private downloadSnapshotTable = (snapshotId: string): void => {
    const snapshot = this.snapshotService.snapshots.find((entry) => entry.id === snapshotId)
    if (!snapshot) {
      return
    }
    const csv = new Blob(["\ufeff", buildSnapshotCsv(snapshot)], {type: "text/csv;charset=utf-8"})
    const url = URL.createObjectURL(csv)
    this.triggerDownload(url, `${snapshot.label}.csv`)
    window.setTimeout(() => URL.revokeObjectURL(url), 0)
  }

  private triggerDownload(href: string, fileName: string): void {
    const link = document.createElement("a")
    link.href = href
    link.download = fileName
    link.click()
  }

  private deleteSnapshot = (snapshotId: string): void => {
    this.snapshotService.delete(snapshotId)
    this.flushPersistWidgetState()
    this.requestUpdate()
  }

  private onWindowKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== "Escape") {
      return
    }
    if (this.hotspotPlacementActive) {
      this.hotspotPlacementActive = false
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
    if (this.insightsOpen) {
      this.insightsOpen = false
      return
    }
    if (this.isFullscreen) {
      void this.toggleFullscreen()
    }
  }

  private toggleInsights = (): void => {
    this.closeChartContextMenu()
    this.insightsOpen = !this.insightsOpen
  }

  private syncFullscreenState = (): void => {
    const next = this.ownerDocument.fullscreenElement === this || this.classList.contains("ww-fullscreen")
    if (next !== this.isFullscreen) {
      this.isFullscreen = next
    }
  }

  private toggleFullscreen = async (): Promise<void> => {
    try {
      if (this.isFullscreen) {
        await this.ownerDocument.exitFullscreen()
      } else {
        await this.requestFullscreen()
      }
    } catch {
      // the browser may reject fullscreen, e.g. without a user gesture
    }
    this.syncFullscreenState()
  }

  private openSnapshotsOverlay = (): void => {
    if (this.snapshotsOverlayOpen) {
      return
    }
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
    if (
      this.isEpidemicWaveFinished() &&
      this.isRunning &&
      (this.chartRuntime.hadInfection || this.frameIndex >= this.config.simulationDuration)
    ) {
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
    this.chartRuntime.recordPoint(
      this.frameIndex,
      this.getCounts(),
      this.hasActiveInfection(),
      this.isEpidemicWaveFinished(),
      this.frameIndex >= this.config.simulationDuration,
    )
  }

  private drawSimulation(): void {
    const areas = this.hotspotEditing.getAreas(this.config)
    const ctx = this.simulationCtx
    const canvas = this.simulationCanvas
    if (ctx && canvas) {
      fitCanvasToDisplaySize(canvas)
      drawSimulation(ctx, canvas, this.agents, areas, {
        removalHotspotId: this.hotspotPointer.getRemovalPendingHotspotId(),
        selectedHotspotId: this.selectedHotspotId,
      })
    }
  }

  private drawChart(): void {
    this.chartRuntime.draw(this.config, this.chartCanvas)
  }

  private drawSnapshotCharts(): void {
    const canvases = this.canvasHost.queryCanvases(".snapshots-overlay__snapshot-chart canvas")
    for (const canvas of this.snapshotChartIds.keys()) {
      if (!canvases.includes(canvas)) {
        destroyChart(canvas)
        this.snapshotChartIds.delete(canvas)
      }
    }
    for (const canvas of canvases) {
      const snapshotId = canvas.dataset.snapshotId
      if (!snapshotId || this.snapshotChartIds.get(canvas) === snapshotId) {
        continue
      }
      const snapshot = this.snapshotService.snapshots.find((entry) => entry.id === snapshotId)
      if (!snapshot) {
        continue
      }
      drawSnapshotChart(canvas, snapshot)
      this.snapshotChartIds.set(canvas, snapshotId)
    }
  }

  private destroySnapshotCharts(): void {
    for (const canvas of this.snapshotChartIds.keys()) {
      destroyChart(canvas)
    }
    this.snapshotChartIds.clear()
  }

  private onCanvasPointerDown = (event: PointerEvent): void => {
    if (!this.config.hotspotsEnabled) {
      return
    }
    const point = getCanvasPoint(this.simulationCanvas, event.clientX, event.clientY)
    if (this.hotspotPlacementActive) {
      this.hotspotPlacementActive = false
      if (!point) {
        return
      }
      event.preventDefault()
      this.hotspotEditing.addHotspotAtPoint(point.x, point.y)
      this.selectHotspot(this.hotspotEditing.userHotspots.at(-1)?.id ?? null)
      return
    }
    const areas = this.hotspotEditing.getAreas(this.config)
    const hotspot = point ? findTopmostHotspotAtPoint(point.x, point.y, areas.hotspots) : null
    const handled = this.hotspotPointer.handlePointerDown(event, areas.hotspots)
    this.selectHotspot(hotspot?.id ?? (handled ? this.selectedHotspotId : null))
  }

  private onHotspotTokenClick = (): void => {
    this.hotspotPlacementActive = !this.hotspotPlacementActive
  }

  private selectHotspot(hotspotId: number | null): void {
    if (this.selectedHotspotId === hotspotId) {
      return
    }
    this.selectedHotspotId = hotspotId
    this.redrawSimulationWhenPaused()
  }

  private getSelectedHotspotInput(): SelectedHotspotInput | null {
    const index = this.hotspotEditing.userHotspots.findIndex((hotspot) => hotspot.id === this.selectedHotspotId)
    if (index < 0) {
      return null
    }
    return {
      label: getHotspotLabel(this.hotspotEditing.userHotspots[index], index),
      onDelete: this.deleteSelectedHotspot,
    }
  }

  private deleteSelectedHotspot = (): void => {
    if (this.selectedHotspotId === null) {
      return
    }
    this.hotspotEditing.removeHotspot(this.selectedHotspotId)
    this.selectedHotspotId = null
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
      showTeacherOptions: !this.isPrintPreparing,
      teacherOptions: buildTeacherOptionsInput(this.getTeacherOptionsContext()),
      chartContextMenuOpen: this.chartContextMenuOpen,
      chartContextMenuPosition: this.chartContextMenuPosition,
      onMainContentClick: this.onMainContentClick,
      onChartContextMenu: this.onChartContextMenu,
      onCreateSnapshot: this.createSnapshot,
      canvasDropActive: this.hotspotEditing.canvasDropActive,
      hotspotPlacementActive: this.hotspotPlacementActive,
      selectedHotspot: this.getSelectedHotspotInput(),
      hotspotsEnabled: this.hotspotsEnabled,
      showHotspotToolbox: this.isEditMode || this.allowHotspotsEnabledControl,
      isRunning: this.isRunning,
      isFullscreen: this.isFullscreen,
      onCanvasDragOver: this.hotspotEditing.onCanvasDragOver,
      onCanvasDragLeave: this.hotspotEditing.onCanvasDragLeave,
      onCanvasDrop: this.hotspotEditing.onCanvasDrop,
      onCanvasPointerDown: this.onCanvasPointerDown,
      onCanvasContextMenu: this.onCanvasContextMenu,
      onHotspotTokenDragStart: this.hotspotEditing.onTokenDragStart,
      onHotspotTokenDragEnd: this.hotspotEditing.onTokenDragEnd,
      onHotspotTokenClick: this.onHotspotTokenClick,
      onToggleSimulation: this.toggleSimulation,
      onResetSimulation: this.resetSimulation,
      onOpenSnapshots: this.openSnapshotsOverlay,
      onToggleInsights: this.toggleInsights,
      onToggleFullscreen: this.toggleFullscreen,
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
      onDownloadSnapshotImage: this.downloadSnapshotImage,
      onDownloadSnapshotTable: this.downloadSnapshotTable,
      insightsOpen: this.insightsOpen,
      insightsTitle: this.chartRuntime.getInsightsOverlayTitle(this.config.modelType),
      chartInsights: this.chartRuntime.buildInsightViewData(this.frameIndex, this.getCounts(), this.config),
    })
  }
}
