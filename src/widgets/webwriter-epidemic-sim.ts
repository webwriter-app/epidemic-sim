import type { MsgFn } from "@lit/localize";
import { sourceLocale, targetLocales } from "../../localization/generated/locale-codes.js";
import {LitElementWw} from "@webwriter/lit"
import {localizer} from "@webwriter/lit/localize"
import {Drag} from "@webwriter/lit/drag"
import {Permissions} from "@webwriter/lit/permissions"
import {Playback} from "@webwriter/lit/playback"
import {Settings} from "@webwriter/lit/settings"
import {customElement, state} from "lit/decorators.js"
import type {PropertyValues} from "lit"
import SlButton from "@shoelace-style/shoelace/dist/components/button/button.component.js"
import SlCard from "@shoelace-style/shoelace/dist/components/card/card.component.js"
import SlDetails from "@shoelace-style/shoelace/dist/components/details/details.component.js"
import SlDropdown from "@shoelace-style/shoelace/dist/components/dropdown/dropdown.component.js"
import SlIcon from "@shoelace-style/shoelace/dist/components/icon/icon.component.js"
import SlMenu from "@shoelace-style/shoelace/dist/components/menu/menu.component.js"
import SlMenuItem from "@shoelace-style/shoelace/dist/components/menu-item/menu-item.component.js"
import SlRange from "@shoelace-style/shoelace/dist/components/range/range.component.js"
import SlSwitch from "@shoelace-style/shoelace/dist/components/switch/switch.component.js"
import SlTag from "@shoelace-style/shoelace/dist/components/tag/tag.component.js"
import SlSelect from "@shoelace-style/shoelace/dist/components/select/select.component.js"
import SlOption from "@shoelace-style/shoelace/dist/components/option/option.component.js"
import shoelaceLightStyles from "@shoelace-style/shoelace/dist/themes/light.styles.js"

import {formatApprox} from "../model/analytics/chart-insights"
import {renderWidgetLayout} from "../components/widget-layout"
import {buildSimulationConfig} from "../model/config/build-simulation-config"
import {buildStudentMenuInput} from "../model/config/build-student-menu-input"
import {buildMenuAllowFlags, type WidgetConfigValues} from "../model/config/menu-allow-flags"
import {MODEL_TYPE_LABELS, SETTINGS} from "../model/config/widget-settings"
import {CanvasHostController} from "../components/canvas-host-controller"
import {HotspotEditingController} from "../components/hotspot-editing-controller"
import {HotspotPointerController} from "../components/hotspot-pointer-controller"
import {ChartRuntime} from "../components/chart-runtime"
import {SnapshotService} from "../components/snapshot-service"
import {HotspotSelection} from "../components/hotspot-selection"
import {SimulationRun} from "../model/simulation/run"
import {SnapshotActions} from "../components/snapshot-actions"
import {WidgetStateSync} from "../components/widget-state-sync"
import {createConfigHandlers} from "../components/config-handlers"
import {hasVisibleMenuControls, sideMenuStyles} from "../components/rendering/menu-renderer"
import {destroyChart, resetChart} from "../components/rendering/chart-renderer"
import {drawSimulation} from "../components/rendering/simulation-renderer"
import {EPIDEMIC_MODEL_TYPES, type EpidemicModelType} from "../model/simulation/epidemic-models"
import {formatFrameCountAsDays} from "../components/format-days"
import type {SimulationAreas, SimulationConfig} from "../model/simulation/types"
import {epidemicSimStyles} from "../components/epidemic-sim.styles"
import {fitCanvasToDisplaySize} from "../components/canvas-coordinates"

/**
 * Agent-based epidemic simulation with a live chart, a simulation map and optional interventions.
 *
 * People are dots on a map; an infected dot within the infection radius of a susceptible one may infect it.
 * The model (SIR, SIRS, SEIR, SIRD, SEIRD) decides which states exist. Learners can switch on quarantine,
 * hotspots (places where people gather) and communities, save snapshots of the curves and read key figures
 * such as R0 in the insights panel. Authors set the parameters in the options panel; each has an
 * `allow-...-control` attribute that shows it in the learners' sidebar.
 *
 * The simulation runs 24 frames per day. Durations are stored in frames and shown in days (120 frames are 5 days).
 * Settings are attributes. Hotspots and snapshots are JSON in a direct data block (`<script slot="data">`);
 * snapshots hold only the curve data, so documents stay small.
 */
@customElement("webwriter-epidemic-sim")
export class WebwriterEpidemicSim extends Settings(LitElementWw, SETTINGS) {
  static styles = [shoelaceLightStyles, ...epidemicSimStyles, sideMenuStyles]

  static scopedElements = {
    "sl-button": SlButton,
    "sl-card": SlCard,
    "sl-details": SlDetails,
    "sl-dropdown": SlDropdown,
    "sl-icon": SlIcon,
    "sl-menu": SlMenu,
    "sl-menu-item": SlMenuItem,
    "sl-range": SlRange,
    "sl-switch": SlSwitch,
    "sl-tag": SlTag,
    "sl-select": SlSelect,
    "sl-option": SlOption,
  }

  static optionGroups = {
    model: {label: (widget: {msg: MsgFn}) => widget.msg("Model"), collapsible: true},
    general: {label: (widget: {msg: MsgFn}) => widget.msg("General"), collapsible: true},
    quarantine: {label: (widget: {msg: MsgFn}) => widget.msg("Quarantine"), advanced: true},
    hotspots: {label: (widget: {msg: MsgFn}) => widget.msg("Hotspots"), advanced: true},
    communities: {label: (widget: {msg: MsgFn}) => widget.msg("Communities"), advanced: true},
    controls: {label: (widget: {msg: MsgFn}) => widget.msg("Learner controls"), advanced: true},
  }

  // Which settings apply depends on the model; the labels come from the settings.
  override get options() {
    const options = {...super.options}
    const model = this.modelType
    const visible: Record<string, boolean> = {
      incubationDuration: model === "seir" || model === "seird",
      immunityDuration: model === "sirs",
      mortalityProbability: model === "sird" || model === "seird",
    }
    for (const [key, shown] of Object.entries(visible)) {
      const control = `allow${key[0].toUpperCase()}${key.slice(1)}Control`
      options[key] = {...options[key], hidden: !shown}
      options[control] = {...options[control], hidden: !shown}
    }
    return options
  }

  localize = localizer(this, {
    sourceLocale,
    targetLocales,
    load: (locale) => import(`../../localization/generated/${locale}.ts`),
    drawer: true,
  })
  public readonly msg = this.localize.msg;
  #permissions = new Permissions(this)
  #drag = new Drag(this)

  private readonly run = new SimulationRun()
  private readonly canvasHost = new CanvasHostController(this)
  private readonly chartRuntime = new ChartRuntime(this.msg)
  private readonly snapshotService = new SnapshotService(this.msg)
  private readonly snapshotActions = new SnapshotActions({
    msg: this.msg,
    service: this.snapshotService,
    canvasHost: this.canvasHost,
    getRoot: () => this.shadowRoot,
    run: this.run,
    chartRuntime: this.chartRuntime,
    getConfig: () => this.config,
    getHotspots: () => this.hotspotEditing.userHotspots,
    onChanged: () => {
      this.stateSync.flush()
      this.requestUpdate()
    },
  })
  private readonly hotspotEditing: HotspotEditingController = new HotspotEditingController({
    getCanvas: () => this.simulationCanvas,
    getConfig: () => this.config,
    enableHotspots: () => {
      this.hotspotsEnabled = true
    },
    onHotspotsChanged: () => {
      this.stateSync.schedule()
      this.requestUpdateAndRedrawSimulationWhenPaused()
    },
    onRestartPreservingHotspots: () => {
      this.stateSync.schedule()
      this.restartSimulation()
    },
    isPointerDragging: (hotspotId: number): boolean => this.hotspotPointer.isDragging(hotspotId),
    clearPointer: () => this.hotspotPointer.clear(),
    persistHotspots: () => {
      this.stateSync.schedule()
    },
  })
  private readonly hotspotPointer: HotspotPointerController = new HotspotPointerController(this, {
    getCanvas: () => this.simulationCanvas,
    getAreas: (): SimulationAreas => this.hotspotEditing.getAreas(this.config),
    updateHotspotRect: (hotspotId: number, rect) => this.hotspotEditing.updateHotspotRect(hotspotId, rect),
    removeHotspot: (hotspotId: number) => this.hotspotEditing.removeHotspot(hotspotId),
    onRemovalPendingChange: () => this.requestUpdateAndRedrawSimulationWhenPaused(),
  })
  private readonly hotspotSelection = new HotspotSelection({
    msg: this.msg,
    editing: this.hotspotEditing,
    pointer: this.hotspotPointer,
    getCanvas: () => this.simulationCanvas,
    getConfig: () => this.config,
    onSelectionChange: () => this.redrawSimulationWhenPaused(),
    requestUpdate: () => this.requestUpdate(),
  })
  private readonly stateSync = new WidgetStateSync({
    element: this,
    hotspotEditing: this.hotspotEditing,
    snapshotService: this.snapshotService,
    hasCanvas: () => this.simulationCanvas !== null,
    restartSimulation: (options) => this.restartSimulation(options),
    requestUpdate: () => this.requestUpdate(),
  })
  private readonly configHandlers = createConfigHandlers({
    getPopulation: () => this.population,
    setPopulation: (population) => {
      this.population = population
    },
    getModelType: () => this.modelType,
    setModelType: (modelType) => {
      this.modelType = modelType
    },
    update: (key, value) => this.updateConfig(key, value),
  })
  // A fixed timestep of 1/60 s: one simulation step per frame at 60 Hz.
  #playback = new Playback(this, {
    interval: 1 / 60,
    step: () => {
      if (this.classList.contains("ww-beforeprint")) {
        this.stopLoop()
      }
      if (!this.isRunning) {
        return
      }
      this.stepSimulation()
    },
    draw: () => {
      this.drawSimulation()
      if (this.isRunning && this.chartRuntime.takeUndrawnPoint()) {
        this.drawChart()
      }
      if (this.insightsOpen || this.isFullscreen) {
        this.requestUpdate()
      }
    },
  })

  private simulationCanvas: HTMLCanvasElement | null = null
  private simulationCtx: CanvasRenderingContext2D | null = null
  private chartCanvas: HTMLCanvasElement | null = null
  private stateObserver = new MutationObserver(() => this.stateSync.sync())
  private shownLocale: string = sourceLocale
  private listeners: AbortController | null = null
  private classObserver: MutationObserver | null = null
  private canvasResizeObserver: ResizeObserver | null = null

  @state() accessor insightsOpen = false
  @state() accessor isFullscreen = false
  @state() accessor snapshotsOverlayOpen = false
  @state() accessor chartContextMenuOpen = false
  @state() accessor chartContextMenuPosition = {x: 0, y: 0}

  connectedCallback(): void {
    super.connectedCallback()
    this.stateObserver.observe(this, {childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["slot", "type", "src"]})
    if (this.hasUpdated) this.stateSync.sync()
    this.listeners = new AbortController()
    window.addEventListener("keydown", this.onWindowKeyDown, {signal: this.listeners.signal})
    this.ownerDocument.addEventListener("fullscreenchange", this.syncFullscreenState, {signal: this.listeners.signal})
    this.classObserver = new MutationObserver(this.syncFullscreenState)
    this.classObserver.observe(this, {attributes: true, attributeFilter: ["class"]})
    this.observeCanvasSize()
  }

  protected updated(changed: PropertyValues<this>): void {
    if (changed.has("modelType")) {
      this.dispatchEvent(new Event("optionschange", {bubbles: true}))
    }
    const locale = this.localize.getLocale()
    if (locale !== this.shownLocale) {
      this.shownLocale = locale
      this.drawChart()
      this.redrawSimulationWhenPaused()
    }
    if (this.snapshotsOverlayOpen || changed.has("snapshotsOverlayOpen")) {
      this.snapshotActions.drawCharts()
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
    this.stateObserver.disconnect()
    this.classObserver?.disconnect()
    this.classObserver = null
    this.canvasResizeObserver?.disconnect()
    this.canvasResizeObserver = null
    this.stateSync.flushPending()
    this.hotspotPointer.clear()
    destroyChart(this.chartCanvas)
    this.snapshotActions.destroyCharts()
    this.listeners?.abort()
    this.listeners = null
    super.disconnectedCallback()
  }

  firstUpdated(): void {
    this.simulationCanvas = this.canvasHost.queryCanvas("#simulation-canvas")
    this.simulationCtx = this.canvasHost.queryContext("#simulation-canvas")
    this.chartCanvas = this.canvasHost.queryCanvas("#chart-canvas")
    this.observeCanvasSize()
    this.stateSync.load({restartSimulation: false})
    this.resetSimulation()
    this.startLoop()
  }

  private get config(): SimulationConfig {
    return buildSimulationConfig(this.getWidgetConfigValues())
  }

  private get isRunning(): boolean {
    return !this.#playback.paused
  }

  private resetSimulation = (): void => {
    this.restartSimulation({clearPointer: true})
  }

  private restartSimulation(options?: {clearPointer?: boolean}): void {
    if (options?.clearPointer) {
      this.hotspotPointer.clear()
    }
    this.run.frameIndex = 0
    this.chartRuntime.reset()
    resetChart(this.chartCanvas)
    this.initializeAgents(0)
    this.updateEpidemicCounts()
    this.drawChart()
    this.requestUpdateAndRedrawSimulationWhenPaused()
  }

  private initializeAgents(infectedAtFrame: number): void {
    if (!this.simulationCanvas) {
      this.run.clear()
      return
    }
    this.run.initialize(this.config, this.hotspotEditing.getAreas(this.config), infectedAtFrame)
  }

  private get hasVisibleMenuControls(): boolean {
    return hasVisibleMenuControls(this.getMenuAllowFlags(), this.modelType)
  }

  private getMenuAllowFlags() {
    return buildMenuAllowFlags(this.getWidgetConfigValues())
  }

  private getWidgetConfigValues(): WidgetConfigValues {
    return this
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

  private reseedPopulation(): void {
    resetChart(this.chartCanvas)
    this.chartRuntime.reset()
    this.initializeAgents(this.run.frameIndex)
    this.updateEpidemicCounts()
    this.drawChart()
    this.redrawSimulationWhenPaused()
  }

  private startLoop(): void { void this.#playback.play() }

  private stopLoop(): void { this.#playback.pause() }

  private toggleSimulation = (): void => {
    if (this.isRunning) {
      this.stopLoop()
    } else {
      if (this.run.isWaveFinished(this.config)) {
        this.restartSimulation()
      }
      this.startLoop()
    }
  }

  private onMainContentClick = (): void => this.closeChartContextMenu()

  private createSnapshot = (): void => {
    this.snapshotActions.create()
    this.closeChartContextMenu()
  }

  private onWindowKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== "Escape") {
      return
    }
    if (this.hotspotSelection.placementActive) {
      this.hotspotSelection.placementActive = false
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
    if (this.snapshotsOverlayOpen) return
    this.closeChartContextMenu()
    this.snapshotsOverlayOpen = true
  }

  private closeSnapshotsOverlay = (): void => {
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
    this.chartContextMenuOpen = false
  }

  private stepSimulation(): void {
    if (!this.simulationCanvas || this.run.agents.length === 0) {
      return
    }
    this.run.step(this.config, this.hotspotEditing.getAreas(this.config))
    this.updateEpidemicCounts()
    if (
      this.run.isWaveFinished(this.config) &&
      this.isRunning &&
      (this.chartRuntime.hadInfection || this.run.frameIndex >= this.config.simulationDuration)
    ) {
      this.stopLoop()
      this.drawChart()
    }
  }

  private updateEpidemicCounts(): void {
    this.run.updateCounts()
    this.chartRuntime.recordPoint(
      this.run.frameIndex,
      this.run.counts,
      this.run.hasActiveInfection(),
      this.run.isWaveFinished(this.config),
      this.run.frameIndex >= this.config.simulationDuration,
    )
  }

  private drawSimulation(): void {
    const areas = this.hotspotEditing.getAreas(this.config)
    const ctx = this.simulationCtx
    const canvas = this.simulationCanvas
    if (ctx && canvas) {
      fitCanvasToDisplaySize(canvas)
      drawSimulation(ctx, canvas, this.run.agents, areas, {
        removalHotspotId: this.hotspotPointer.getRemovalPendingHotspotId(),
        selectedHotspotId: this.hotspotSelection.selectedId,
      }, this.msg)
    }
  }

  private drawChart(): void {
    this.chartRuntime.draw(this.config, this.chartCanvas)
  }

  private getModelTypeOptions(): Array<{value: EpidemicModelType; label: string}> {
    return EPIDEMIC_MODEL_TYPES.map((value) => ({value, label: MODEL_TYPE_LABELS[value](this)}))
  }

  private getModelTypeLabel = (modelType: EpidemicModelType): string => MODEL_TYPE_LABELS[modelType](this)

  render() {
    return renderWidgetLayout({
      hasVisibleMenuControls: this.hasVisibleMenuControls,
      chartContextMenuOpen: this.chartContextMenuOpen,
      chartContextMenuPosition: this.chartContextMenuPosition,
      onMainContentClick: this.onMainContentClick,
      onChartContextMenu: this.onChartContextMenu,
      onCreateSnapshot: this.createSnapshot,
      hotspotPlacementActive: this.hotspotSelection.placementActive,
      selectedHotspot: this.hotspotSelection.getSelectedInput(),
      hotspotsEnabled: this.hotspotsEnabled,
      showHotspotToolbox: this.#permissions.editing || this.allowHotspotsEnabledControl,
      isRunning: this.isRunning,
      isFullscreen: this.isFullscreen,
      onCanvasDragCommit: this.hotspotEditing.onCanvasDragCommit,
      onCanvasPointerDown: this.hotspotSelection.onCanvasPointerDown,
      onCanvasContextMenu: this.hotspotSelection.onCanvasContextMenu,
      onHotspotTokenClick: this.hotspotSelection.onTokenClick,
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
      onDeleteSnapshot: (id: string) => this.snapshotActions.delete(id),
      onDownloadSnapshotImage: (id: string) => this.snapshotActions.downloadImage(id),
      onDownloadSnapshotTable: (id: string) => this.snapshotActions.downloadTable(id),
      insightsOpen: this.insightsOpen,
      insightsTitle: this.chartRuntime.getInsightsOverlayTitle(this.config.modelType),
      chartInsights: this.chartRuntime.buildInsightViewData(this.run.frameIndex, this.run.counts, this.config),
    }, this.msg)
  }
}
