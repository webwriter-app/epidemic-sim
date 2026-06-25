import {css, html} from "lit"
import type {CSSResult, TemplateResult} from "lit"

export const teacherOptionsStyles: CSSResult = css`
  :host(:not([contenteditable="true"]):not([contenteditable=""])) .author-only {
    display: none;
  }

  :host {
    display: block;
    width: 100%;
    max-width: 100%;
    min-width: 0;
  }

  .teacher-options-shell {
    display: block;
    width: 100%;
    max-width: 100%;
    min-width: 0;
    box-sizing: border-box;
  }

  .teacher-options {
    display: grid;
    gap: 8px;
    width: 100%;
    max-width: 100%;
    min-width: 0;
    box-sizing: border-box;
    font-size: 0.88rem;
  }

  .teacher-options sl-details {
    display: block;
    width: 100%;
    max-width: 100%;
    min-width: 0;
  }

  .teacher-options sl-details::part(base) {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    border: 1px solid #d6dce4;
    border-radius: 8px;
    background: #fff;
  }

  .teacher-options sl-details::part(header) {
    padding: 8px 10px;
    font-weight: 600;
    font-size: 0.9rem;
    white-space: normal;
    align-items: center;
    line-height: 1;
  }

  .teacher-options sl-details::part(summary) {
    align-items: center;
    line-height: 1;
    min-height: 0;
  }

  .teacher-options sl-details::part(summary-icon) {
    align-self: center;
    line-height: 0;
  }

  .teacher-options sl-details::part(content) {
    padding: 0 10px 10px;
    min-width: 0;
  }

  .teacher-options__summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    width: 100%;
    min-width: 0;
  }

  .teacher-options__summary-title {
    flex: 1;
    min-width: 0;
  }

  .teacher-options__summary-enable {
    --width: 36px;
    --height: 20px;
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    align-self: center;
    margin: 0;
  }

  .teacher-options__summary-enable::part(base) {
    margin: 0;
    line-height: 0;
  }

  .teacher-options__summary-enable::part(label) {
    display: none;
    margin: 0;
  }

  .teacher-options__boolean-value sl-switch,
  .teacher-options__visibility {
    --width: 36px;
    --height: 20px;
    display: inline-flex;
    align-items: center;
    margin: 0;
  }

  .teacher-options__boolean-value sl-switch::part(label),
  .teacher-options__visibility::part(label) {
    display: none;
    margin: 0;
  }

  .teacher-options__boolean-value {
    display: flex;
    align-items: center;
  }

  .teacher-options__rows {
    display: grid;
    gap: 10px;
    width: 100%;
    min-width: 0;
  }

  .teacher-options__row {
    display: grid;
    gap: 6px;
    width: 100%;
    min-width: 0;
    padding-bottom: 8px;
    border-bottom: 1px solid #f1f5f9;
  }

  .teacher-options__row:last-child {
    padding-bottom: 0;
    border-bottom: none;
  }

  .teacher-options__row-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    width: 100%;
    min-width: 0;
  }

  .teacher-options__label {
    flex: 1;
    min-width: 0;
    color: #334155;
    line-height: 1.35;
    font-size: 0.9rem;
    word-break: break-word;
  }

  .teacher-options__visibility {
    flex-shrink: 0;
  }

  .teacher-options__value-text {
    color: #64748b;
    font-size: 0.82rem;
    font-variant-numeric: tabular-nums;
    text-align: right;
  }

  .teacher-options sl-range {
    display: block;
    width: 100%;
    max-width: 100%;
    min-width: 0;
  }

  .teacher-options sl-range::part(form-control),
  .teacher-options sl-range::part(base) {
    width: 100%;
    max-width: 100%;
    min-width: 0;
  }

  .teacher-options sl-select {
    display: block;
    width: 100%;
    max-width: 100%;
    min-width: 0;
  }

  .teacher-options sl-select::part(combobox) {
    width: 100%;
    max-width: 100%;
    min-width: 0;
  }
`

type RangeRow = {
  kind: "range"
  label: string
  value: number
  min: number
  max: number
  step: number
  allow: boolean
  formatValue?: (value: number) => string
  onInput: (event: Event) => void
  onAllowChange: (event: Event) => void
}

type BooleanRow = {
  kind: "boolean"
  label: string
  value: boolean
  allow: boolean
  onValueChange: (event: Event) => void
  onAllowChange: (event: Event) => void
}

type ShowRow = {
  kind: "show"
  label: string
  value: boolean
  onValueChange: (event: Event) => void
}

type SelectOption = {
  value: string
  label: string
}

type SelectRow = {
  kind: "select"
  label: string
  value: string
  options: SelectOption[]
  allow: boolean
  onChange: (event: Event) => void
  onAllowChange: (event: Event) => void
}

type TeacherOptionRow = RangeRow | BooleanRow | ShowRow | SelectRow

type TeacherOptionsSection = {
  title: string
  open?: boolean
  enabled?: boolean
  onEnabledChange?: (event: Event) => void
  rows: TeacherOptionRow[]
}

export type RenderTeacherOptionsInput = {
  sections: TeacherOptionsSection[]
}

function renderRowHead(label: string, allow: boolean, onAllowChange: (event: Event) => void): TemplateResult {
  return html`
    <div class="teacher-options__row-head">
      <div class="teacher-options__label">${label}</div>
      <sl-switch class="teacher-options__visibility" ?checked=${allow} @sl-change=${onAllowChange}></sl-switch>
    </div>
  `
}

function renderRow(row: TeacherOptionRow): TemplateResult {
  if (row.kind === "show") {
    return html`
      <div class="teacher-options__row">
        <div class="teacher-options__row-head">
          <div class="teacher-options__label">${row.label}</div>
        </div>
        <div class="teacher-options__boolean-value">
          <sl-switch ?checked=${row.value} @sl-change=${row.onValueChange}></sl-switch>
        </div>
      </div>
    `
  }

  if (row.kind === "select") {
    return html`
      <div class="teacher-options__row">
        ${renderRowHead(row.label, row.allow, row.onAllowChange)}
        <sl-select .value=${row.value} @sl-change=${row.onChange}>
          ${row.options.map(
            (option) => html`<sl-option value=${option.value}>${option.label}</sl-option>`,
          )}
        </sl-select>
      </div>
    `
  }

  if (row.kind === "range") {
    const displayValue = row.formatValue ? row.formatValue(row.value) : String(row.value)
    return html`
      <div class="teacher-options__row">
        ${renderRowHead(row.label, row.allow, row.onAllowChange)}
        <div class="teacher-options__value-text">${displayValue}</div>
        <sl-range
          min=${String(row.min)}
          max=${String(row.max)}
          step=${String(row.step)}
          .value=${String(row.value)}
          @sl-input=${row.onInput}
        ></sl-range>
      </div>
    `
  }

  return html`
    <div class="teacher-options__row">
      ${renderRowHead(row.label, row.allow, row.onAllowChange)}
      <div class="teacher-options__boolean-value">
        <sl-switch ?checked=${row.value} @sl-change=${row.onValueChange}></sl-switch>
      </div>
    </div>
  `
}

export function renderTeacherOptions(input: RenderTeacherOptionsInput): TemplateResult {
  return html`
    <div class="teacher-options">
      ${input.sections.map(
        (section) => html`
          <sl-details ?open=${section.open ?? false}>
            <div slot="summary" class="teacher-options__summary">
              <span class="teacher-options__summary-title">${section.title}</span>
              ${
                section.onEnabledChange
                  ? html`
                      <sl-switch
                        class="teacher-options__summary-enable"
                        ?checked=${section.enabled ?? false}
                        @click=${(event: Event) => event.stopPropagation()}
                        @sl-change=${section.onEnabledChange}
                      ></sl-switch>
                    `
                  : null
              }
            </div>
            <div class="teacher-options__rows">${section.rows.map((row) => renderRow(row))}</div>
          </sl-details>
        `,
      )}
    </div>
  `
}
