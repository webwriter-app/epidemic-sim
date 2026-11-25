import {computed, signal} from "@webwriter/lit"
import {historyTableToCsv, type HistoryTable} from "../model/simulation/history-table"
import {buildParametersJson, parseParametersJson} from "../model/config/parameters-file"

export type ParameterValues = Parameters<typeof buildParametersJson>[0]

/** What the conversions need of the widget; they run with the widget as `this`. */
type ExchangeHost = HTMLElement & {
  msg: (text: string) => string
  historyTable(): HistoryTable
  parameterValues(): ParameterValues
}

/** The CSV file of the curves, with a byte order mark so that spreadsheets read the umlauts right. */
export function exportHistoryCsv(this: ExchangeHost): File | null {
  const table = this.historyTable()
  if (table.rows.length === 0) return null
  return new File(["\ufeff", historyTableToCsv(table)], "epidemic-history.csv", {type: "text/csv"})
}

export function exportHistoryTable(this: ExchangeHost): HTMLTableElement | null {
  const {columns, rows} = this.historyTable()
  if (rows.length === 0) return null
  const doc = this.ownerDocument
  const table = doc.createElement("table")
  const cell = (tag: "th" | "td", text: string) => Object.assign(doc.createElement(tag), {textContent: text})
  table.createTHead().insertRow().append(...columns.map((column) => cell("th", column)))
  const body = table.createTBody()
  for (const row of rows) body.insertRow().append(...row.map((value) => cell("td", value === null ? "" : String(value))))
  return table
}

export function exportParameters(this: ExchangeHost): File {
  return new File([buildParametersJson(this.parameterValues())], "epidemic-parameters.json", {type: "application/json"})
}

/** Reads the whole file first; the returned function applies it. */
export async function importParameters(this: ExchangeHost, file: File): Promise<() => void> {
  const parameters = parseParametersJson(await file.text(), this.msg)
  return () => void Object.assign(this, parameters)
}

type Counts = {infected: number}

/** The values other widgets can read: stable read-only signals that are set only when a value changed. */
export class PublishedSignals {
  #infected = signal(0)
  #ended = signal(false)
  #history = signal<HistoryTable>({columns: [], rows: []})
  #revision = -1
  readonly signals = {
    infected: computed(() => this.#infected.get()),
    ended: computed(() => this.#ended.get()),
    history: computed(() => this.#history.get()),
  }

  /** The table is built (by `table`) only when `revision` shows that a day was added. */
  publish(counts: Counts, ended: boolean, revision: number, table: () => HistoryTable): void {
    this.#infected.set(counts.infected)
    this.#ended.set(ended)
    if (revision !== this.#revision) {
      this.#revision = revision
      this.#history.set(table())
    }
  }
}
