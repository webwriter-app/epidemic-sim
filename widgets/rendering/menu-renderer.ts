import {css, html} from "lit"
import type {CSSResult, TemplateResult} from "lit"
import {msg} from "@lit/localize"
import type {EpidemicModelType} from "../simulation/epidemic-models"

const FRAMES_PER_DAY = 24

export const sideMenuStyles: CSSResult = css`
  .widget-shell {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 0;
    --side-menu-width: 260px;
    overflow: hidden;
  }

  .main-content {
    width: 100%;
    height: 100%;
    min-width: 0;
    min-height: 0;
  }

  .widget-shell.has-menu .main-content {
    padding-right: var(--side-menu-width);
  }

  .side-menu {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: var(--side-menu-width);
    border-left: 1px solid #d6dce4;
    background: #ffffff;
    display: flex;
    flex-direction: column;
    padding: 10px;
    overflow-y: auto;
    z-index: 8;
    box-shadow: -4px 0 12px rgba(15, 23, 42, 0.1);
  }

  .side-menu__title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin: 0 0 10px 0;
  }

  .side-menu__title {
    margin: 0;
    font-size: 1rem;
    flex: 1;
    min-width: 0;
  }

  .side-menu__title-switch {
    flex-shrink: 0;
  }

  .side-menu__title-switch::part(base) {
    --width: 36px;
    --height: 20px;
  }

  .side-menu__section {
    display: grid;
    gap: 8px;
    border-top: 1px solid #e5e7eb;
    padding-top: 10px;
    margin-top: 10px;
  }

  .side-menu__section:first-of-type {
    border-top: none;
    padding-top: 0;
    margin-top: 0;
  }

  .side-menu__controls {
    display: grid;
    gap: 8px;
  }

  .side-menu__control {
    display: grid;
    gap: 4px;
  }

  .side-menu__control-head {
    display: flex;
    justify-content: space-between;
    gap: 6px;
    align-items: baseline;
    font-size: 0.82rem;
    line-height: 1.25;
  }

  .side-menu__control-value {
    color: #334155;
    font-size: 0.78rem;
    font-variant-numeric: tabular-nums;
    flex-shrink: 0;
  }

  .side-menu sl-range {
    width: 100%;
  }

  .side-menu sl-select {
    width: 100%;
  }

  .side-menu sl-select::part(combobox) {
    width: 100%;
  }
`

export type MenuAllowFlags = {
  allowModelTypeControl: boolean
  allowIncubationDurationControl: boolean
  allowImmunityDurationControl: boolean
  allowMortalityProbabilityControl: boolean
  allowPopulationControl: boolean
  allowSpeedControl: boolean
  allowInfectionRadiusControl: boolean
  allowInfectionProbabilityControl: boolean
  allowRecoveryDurationControl: boolean
  allowQuarantineEnabledControl: boolean
  allowHotspotsEnabledControl: boolean
  allowCommunitiesEnabledControl: boolean
  allowQuarantineProbabilityControl: boolean
  allowQuarantineDurationControl: boolean
  allowHotspotVisitProbabilityControl: boolean
  allowHotspotStayDurationControl: boolean
  allowHotspotMaxAgentsControl: boolean
  allowHotspotSizeControl: boolean
  allowCommunityLeaveProbabilityControl: boolean
}

export function hasVisibleMenuControls(flags: MenuAllowFlags): boolean {
  return Object.values(flags).some(Boolean)
}

type ModelTypeOption = {
  value: EpidemicModelType
  label: string
}

type RenderMenuOptions = MenuAllowFlags & {
  modelType: EpidemicModelType
  modelTypeOptions: ModelTypeOption[]
  incubationDuration: number
  immunityDuration: number
  mortalityProbability: number
  population: number
  speed: number
  infectionRadius: number
  infectionProbability: number
  recoveryDuration: number
  quarantineEnabled: boolean
  quarantineProbability: number
  quarantineDuration: number
  hotspotsEnabled: boolean
  placedHotspotCount: number
  hotspotVisitProbability: number
  hotspotStayDuration: number
  hotspotMaxAgents: number
  hotspotSize: number
  communitiesEnabled: boolean
  communityLeaveProbability: number
  onModelTypeChange: (event: Event) => void
  onIncubationDurationInput: (event: Event) => void
  onImmunityDurationInput: (event: Event) => void
  onMortalityProbabilityInput: (event: Event) => void
  onPopulationInput: (event: Event) => void
  onSpeedInput: (event: Event) => void
  onInfectionRadiusInput: (event: Event) => void
  onInfectionProbabilityInput: (event: Event) => void
  onRecoveryDurationInput: (event: Event) => void
  onToggleQuarantine: (event: Event) => void
  onQuarantineProbabilityInput: (event: Event) => void
  onQuarantineDurationInput: (event: Event) => void
  onToggleHotspots: (event: Event) => void
  onHotspotVisitProbabilityInput: (event: Event) => void
  onHotspotStayDurationInput: (event: Event) => void
  onHotspotMaxAgentsInput: (event: Event) => void
  onHotspotSizeInput: (event: Event) => void
  onToggleCommunities: (event: Event) => void
  onCommunityLeaveProbabilityInput: (event: Event) => void
}

function hasModelMenuControls(flags: MenuAllowFlags): boolean {
  return (
    flags.allowModelTypeControl ||
    flags.allowIncubationDurationControl ||
    flags.allowImmunityDurationControl ||
    flags.allowMortalityProbabilityControl
  )
}

function hasGeneralMenuControls(flags: MenuAllowFlags): boolean {
  return (
    flags.allowPopulationControl ||
    flags.allowSpeedControl ||
    flags.allowInfectionRadiusControl ||
    flags.allowInfectionProbabilityControl ||
    flags.allowRecoveryDurationControl
  )
}

function hasQuarantineMenuControls(flags: MenuAllowFlags): boolean {
  return (
    flags.allowQuarantineEnabledControl ||
    flags.allowQuarantineProbabilityControl ||
    flags.allowQuarantineDurationControl
  )
}

function hasHotspotsMenuControls(flags: MenuAllowFlags): boolean {
  return (
    flags.allowHotspotsEnabledControl ||
    flags.allowHotspotVisitProbabilityControl ||
    flags.allowHotspotStayDurationControl ||
    flags.allowHotspotMaxAgentsControl ||
    flags.allowHotspotSizeControl
  )
}

function hasCommunitiesMenuControls(flags: MenuAllowFlags): boolean {
  return flags.allowCommunitiesEnabledControl || flags.allowCommunityLeaveProbabilityControl
}

type MenuSectionHeaderSwitch = {
  checked: boolean
  onChange: (event: Event) => void
}

function renderMenuSection(
  title: string,
  controls: TemplateResult,
  headerSwitch?: MenuSectionHeaderSwitch,
): TemplateResult {
  return html`
    <div class="side-menu__section">
      <div class="side-menu__title-row">
        <h3 class="side-menu__title">${title}</h3>
        ${
          headerSwitch
            ? html`
                <sl-switch
                  class="side-menu__title-switch"
                  ?checked=${headerSwitch.checked}
                  @sl-change=${headerSwitch.onChange}
                ></sl-switch>
              `
            : null
        }
      </div>
      <div class="side-menu__controls">${controls}</div>
    </div>
  `
}

function renderModelControls(options: RenderMenuOptions): TemplateResult {
  return html`
    ${
      options.allowModelTypeControl
        ? html`
            <label class="side-menu__control">
              <span class="side-menu__control-head">
                <span>${msg("Model type")}</span>
              </span>
              <sl-select .value=${options.modelType} @sl-change=${options.onModelTypeChange}>
                ${options.modelTypeOptions.map(
                  (option) => html`<sl-option value=${option.value}>${option.label}</sl-option>`,
                )}
              </sl-select>
            </label>
          `
        : null
    }

    ${
      options.allowIncubationDurationControl &&
      (options.modelType === "seir" || options.modelType === "seird")
        ? html`
            <label class="side-menu__control">
              <span class="side-menu__control-head">
                <span>${msg("Incubation duration")}</span>
                <span class="side-menu__control-value"
                  >${formatFrameCountAsDays(options.incubationDuration)}</span
                >
              </span>
              <sl-range
                min="30"
                max="1200"
                step="30"
                .value=${String(options.incubationDuration)}
                @sl-input=${options.onIncubationDurationInput}
              ></sl-range>
            </label>
          `
        : null
    }

    ${
      options.allowImmunityDurationControl && options.modelType === "sirs"
        ? html`
            <label class="side-menu__control">
              <span class="side-menu__control-head">
                <span>${msg("Immunity duration")}</span>
                <span class="side-menu__control-value"
                  >${formatFrameCountAsDays(options.immunityDuration)}</span
                >
              </span>
              <sl-range
                min="120"
                max="4800"
                step="60"
                .value=${String(options.immunityDuration)}
                @sl-input=${options.onImmunityDurationInput}
              ></sl-range>
            </label>
          `
        : null
    }

    ${
      options.allowMortalityProbabilityControl &&
      (options.modelType === "sird" || options.modelType === "seird")
        ? html`
            <label class="side-menu__control">
              <span class="side-menu__control-head">
                <span>${msg("Mortality probability")}</span>
                <span class="side-menu__control-value"
                  >${Math.round(options.mortalityProbability * 100)}%</span
                >
              </span>
              <sl-range
                min="0.001"
                max="0.5"
                step="0.001"
                .value=${String(options.mortalityProbability)}
                @sl-input=${options.onMortalityProbabilityInput}
              ></sl-range>
            </label>
          `
        : null
    }
  `
}

function renderGeneralControls(options: RenderMenuOptions): TemplateResult {
  return html`
    ${
      options.allowPopulationControl
        ? html`
            <label class="side-menu__control">
              <span class="side-menu__control-head">
                <span>${msg("Population")}</span>
                <span class="side-menu__control-value">${options.population}</span>
              </span>
              <sl-range
                min="50"
                max="800"
                step="10"
                .value=${String(options.population)}
                @sl-input=${options.onPopulationInput}
              ></sl-range>
            </label>
          `
        : null
    }

    ${
      options.allowSpeedControl
        ? html`
            <label class="side-menu__control">
              <span class="side-menu__control-head">
                <span>${msg("Speed")}</span>
                <span class="side-menu__control-value">${options.speed.toFixed(1)}</span>
              </span>
              <sl-range
                min="0.2"
                max="4"
                step="0.1"
                .value=${String(options.speed)}
                @sl-input=${options.onSpeedInput}
              ></sl-range>
            </label>
          `
        : null
    }

    ${
      options.allowInfectionRadiusControl
        ? html`
            <label class="side-menu__control">
              <span class="side-menu__control-head">
                <span>${msg("Infection radius")}</span>
                <span class="side-menu__control-value">${options.infectionRadius}</span>
              </span>
              <sl-range
                min="4"
                max="40"
                step="1"
                .value=${String(options.infectionRadius)}
                @sl-input=${options.onInfectionRadiusInput}
              ></sl-range>
            </label>
          `
        : null
    }

    ${
      options.allowInfectionProbabilityControl
        ? html`
            <label class="side-menu__control">
              <span class="side-menu__control-head">
                <span>${msg("Infection probability")}</span>
                <span class="side-menu__control-value"
                  >${Math.round(options.infectionProbability * 100)}%</span
                >
              </span>
              <sl-range
                min="0.01"
                max="1"
                step="0.01"
                .value=${String(options.infectionProbability)}
                @sl-input=${options.onInfectionProbabilityInput}
              ></sl-range>
            </label>
          `
        : null
    }

    ${
      options.allowRecoveryDurationControl
        ? html`
            <label class="side-menu__control">
              <span class="side-menu__control-head">
                <span>${msg("Recovery duration")}</span>
                <span class="side-menu__control-value"
                  >${formatFrameCountAsDays(options.recoveryDuration)}</span
                >
              </span>
              <sl-range
                min="60"
                max="2400"
                step="30"
                .value=${String(options.recoveryDuration)}
                @sl-input=${options.onRecoveryDurationInput}
              ></sl-range>
            </label>
          `
        : null
    }
  `
}

function renderQuarantineControls(options: RenderMenuOptions): TemplateResult {
  return html`
    ${
      options.allowQuarantineProbabilityControl
              ? html`
                  <label class="side-menu__control">
                    <span class="side-menu__control-head">
                      <span>${msg("Quarantine probability")}</span>
                      <span class="side-menu__control-value"
                        >${Math.round(options.quarantineProbability * 100)}%</span
                      >
                    </span>
                    <sl-range
                      min="0.01"
                      max="1"
                      step="0.01"
                      .value=${String(options.quarantineProbability)}
                      ?disabled=${!options.quarantineEnabled}
                      @sl-input=${options.onQuarantineProbabilityInput}
                    ></sl-range>
                  </label>
                `
        : null
    }

    ${
      options.allowQuarantineDurationControl
              ? html`
                  <label class="side-menu__control">
                    <span class="side-menu__control-head">
                      <span>${msg("Quarantine duration")}</span>
                      <span class="side-menu__control-value"
                        >${formatFrameCountAsDays(options.quarantineDuration)}</span
                      >
                    </span>
                    <sl-range
                      min="30"
                      max="2400"
                      step="30"
                      .value=${String(options.quarantineDuration)}
                      ?disabled=${!options.quarantineEnabled}
                      @sl-input=${options.onQuarantineDurationInput}
                    ></sl-range>
                  </label>
                `
        : null
    }
  `
}

function renderHotspotsControls(options: RenderMenuOptions): TemplateResult {
  return html`
    ${
      options.allowHotspotVisitProbabilityControl
              ? html`
                  <label class="side-menu__control">
                    <span class="side-menu__control-head">
                      <span>${msg("Hotspot visit probability")}</span>
                      <span class="side-menu__control-value"
                        >${Math.round(options.hotspotVisitProbability * 100)}%</span
                      >
                    </span>
                    <sl-range
                      min="0.001"
                      max="0.04"
                      step="0.001"
                      .value=${String(options.hotspotVisitProbability)}
                      ?disabled=${!options.hotspotsEnabled}
                      @sl-input=${options.onHotspotVisitProbabilityInput}
                    ></sl-range>
                  </label>
                `
        : null
    }

    ${
      options.allowHotspotStayDurationControl
              ? html`
                  <label class="side-menu__control">
                    <span class="side-menu__control-head">
                      <span>${msg("Hotspot stay duration")}</span>
                      <span class="side-menu__control-value"
                        >${formatFrameCountAsDays(options.hotspotStayDuration)}</span
                      >
                    </span>
                    <sl-range
                      min="30"
                      max="1800"
                      step="30"
                      .value=${String(options.hotspotStayDuration)}
                      ?disabled=${!options.hotspotsEnabled}
                      @sl-input=${options.onHotspotStayDurationInput}
                    ></sl-range>
                  </label>
                `
        : null
    }

    ${
      options.allowHotspotMaxAgentsControl
              ? html`
                  <label class="side-menu__control">
                    <span class="side-menu__control-head">
                      <span>${msg("Hotspot max agents")}</span>
                      <span class="side-menu__control-value">${options.hotspotMaxAgents}</span>
                    </span>
                    <sl-range
                      min="1"
                      max="120"
                      step="1"
                      .value=${String(options.hotspotMaxAgents)}
                      ?disabled=${!options.hotspotsEnabled}
                      @sl-input=${options.onHotspotMaxAgentsInput}
                    ></sl-range>
                  </label>
                `
        : null
    }

    ${
      options.allowHotspotSizeControl
              ? html`
                  <label class="side-menu__control">
                    <span class="side-menu__control-head">
                      <span>${msg("Hotspot size")}</span>
                      <span class="side-menu__control-value">${options.hotspotSize}</span>
                    </span>
                    <sl-range
                      min="24"
                      max="110"
                      step="2"
                      .value=${String(options.hotspotSize)}
                      ?disabled=${!options.hotspotsEnabled}
                      @sl-input=${options.onHotspotSizeInput}
                    ></sl-range>
                  </label>
                `
        : null
    }

    ${
      options.allowHotspotsEnabledControl ||
      options.allowHotspotVisitProbabilityControl ||
      options.allowHotspotStayDurationControl ||
      options.allowHotspotMaxAgentsControl ||
      options.allowHotspotSizeControl
        ? html`
            <div class="side-menu__control">
              <span class="side-menu__control-head">
                <span>${msg("Placed hotspots")}</span>
                <span class="side-menu__control-value">${options.placedHotspotCount}</span>
              </span>
            </div>
          `
        : null
    }
  `
}

function renderCommunitiesControls(options: RenderMenuOptions): TemplateResult {
  return html`
    ${
      options.allowCommunityLeaveProbabilityControl
              ? html`
                  <label class="side-menu__control">
                    <span class="side-menu__control-head">
                      <span>${msg("Community leave probability")}</span>
                      <span class="side-menu__control-value"
                        >${Math.round(options.communityLeaveProbability * 1000) / 10}%</span
                      >
                    </span>
                    <sl-range
                      min="0.0001"
                      max="0.01"
                      step="0.0001"
                      .value=${String(options.communityLeaveProbability)}
                      ?disabled=${!options.communitiesEnabled}
                      @sl-input=${options.onCommunityLeaveProbabilityInput}
                    ></sl-range>
                  </label>
                `
        : null
    }
  `
}

export function renderMenu(options: RenderMenuOptions): TemplateResult {
  return html`
    <aside class="side-menu">
      ${
        hasModelMenuControls(options)
          ? renderMenuSection(msg("Model"), renderModelControls(options))
          : null
      }
      ${
        hasGeneralMenuControls(options)
          ? renderMenuSection(msg("General"), renderGeneralControls(options))
          : null
      }
      ${
        hasQuarantineMenuControls(options)
          ? renderMenuSection(
              msg("Quarantine"),
              renderQuarantineControls(options),
              options.allowQuarantineEnabledControl
                ? {
                    checked: options.quarantineEnabled,
                    onChange: options.onToggleQuarantine,
                  }
                : undefined,
            )
          : null
      }
      ${
        hasHotspotsMenuControls(options)
          ? renderMenuSection(
              msg("Hotspots"),
              renderHotspotsControls(options),
              options.allowHotspotsEnabledControl
                ? {
                    checked: options.hotspotsEnabled,
                    onChange: options.onToggleHotspots,
                  }
                : undefined,
            )
          : null
      }
      ${
        hasCommunitiesMenuControls(options)
          ? renderMenuSection(
              msg("Communities"),
              renderCommunitiesControls(options),
              options.allowCommunitiesEnabledControl
                ? {
                    checked: options.communitiesEnabled,
                    onChange: options.onToggleCommunities,
                  }
                : undefined,
            )
          : null
      }
    </aside>
  `
}

function formatFrameCountAsDays(frameCount: number): string {
  return `${(frameCount / FRAMES_PER_DAY).toFixed(2)} d`
}
