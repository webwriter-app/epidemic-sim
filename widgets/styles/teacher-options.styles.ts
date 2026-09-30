import {css} from "lit"
import type {CSSResult} from "lit"

export const teacherOptionsStyles: CSSResult = css`
  :host(:not([contenteditable="true"]):not([contenteditable=""])) .author-only { display: none; }
  :host(.ww-beforeprint) .author-only,
  :host(.ww-beforeprint) .teacher-options-shell,
  :host(.ww-printable) .author-only,
  :host(.ww-printable) .teacher-options-shell { display: none !important; }
  @media print {
    .author-only,
    .teacher-options-shell { display: none !important; }
  }
  :host { display: block; width: 100%; max-width: 100%; min-width: 0; }
  .teacher-options-shell { display: block; width: 100%; max-width: 100%; min-width: 0; box-sizing: border-box; }
  .teacher-options { display: grid; gap: 8px; width: 100%; max-width: 100%; min-width: 0; box-sizing: border-box; font-size: 0.88rem; }
  .teacher-options sl-details { display: block; width: 100%; max-width: 100%; min-width: 0; }
  .teacher-options sl-details::part(base) { width: 100%; max-width: 100%; min-width: 0; border: 1px solid #d6dce4; border-radius: 8px; background: #fff; }
  .teacher-options sl-details::part(header) { padding: 8px 10px; font-weight: 600; font-size: 0.9rem; white-space: normal; align-items: center; line-height: 1; }
  .teacher-options sl-details::part(summary) { align-items: center; line-height: 1; min-height: 0; }
  .teacher-options sl-details::part(summary-icon) { align-self: center; line-height: 0; }
  .teacher-options sl-details::part(content) { padding: 0 10px 10px; min-width: 0; }
  .teacher-options__summary { display: flex; align-items: center; justify-content: space-between; gap: 10px; width: 100%; min-width: 0; }
  .teacher-options__summary-title { flex: 1; min-width: 0; }
  .teacher-options__summary-enable, .teacher-options__boolean-value sl-switch, .teacher-options__visibility { --width: 36px; --height: 20px; display: inline-flex; align-items: center; margin: 0; }
  .teacher-options__summary-enable { flex-shrink: 0; align-self: center; }
  .teacher-options__summary-enable::part(base) { margin: 0; line-height: 0; }
  .teacher-options__summary-enable::part(label), .teacher-options__boolean-value sl-switch::part(label), .teacher-options__visibility::part(label) { display: none; margin: 0; }
  .teacher-options__boolean-value { display: flex; align-items: center; }
  .teacher-options__rows { display: grid; gap: 10px; width: 100%; min-width: 0; }
  .teacher-options__row { display: grid; gap: 6px; width: 100%; min-width: 0; padding-bottom: 8px; border-bottom: 1px solid #f1f5f9; }
  .teacher-options__row:last-child { padding-bottom: 0; border-bottom: none; }
  .teacher-options__row-head { display: flex; justify-content: space-between; align-items: center; gap: 8px; width: 100%; min-width: 0; }
  .teacher-options__label { flex: 1; min-width: 0; color: #334155; line-height: 1.35; font-size: 0.9rem; word-break: break-word; }
  .teacher-options__visibility { flex-shrink: 0; }
  .teacher-options__value-text { color: #64748b; font-size: 0.82rem; font-variant-numeric: tabular-nums; text-align: right; }
  .teacher-options__description { color: #64748b; font-size: 0.78rem; line-height: 1.3; }
  .teacher-options sl-range { display: block; width: 100%; max-width: 100%; min-width: 0; }
  .teacher-options sl-range::part(form-control), .teacher-options sl-range::part(base) { width: 100%; max-width: 100%; min-width: 0; }
  .teacher-options sl-select { display: block; width: 100%; max-width: 100%; min-width: 0; }
  .teacher-options sl-select::part(combobox) { width: 100%; max-width: 100%; min-width: 0; }
`
