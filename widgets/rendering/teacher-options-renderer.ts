import {html} from "lit"
import type {TemplateResult} from "lit"
export {teacherOptionsStyles} from "../styles/teacher-options.styles"

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
  description?: string
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
      <sl-switch
        class="teacher-options__visibility"
        ?checked=${allow}
        @click=${(event: Event) => event.stopPropagation()}
        @sl-change=${(event: Event) => {
          event.stopPropagation()
          onAllowChange(event)
        }}
      ></sl-switch>
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
        <sl-select placement="bottom" hoist .value=${row.value} @sl-change=${row.onChange}>
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
        ${row.description ? html`<div class="teacher-options__description">${row.description}</div>` : null}
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
