/** The curves of a run as a table: a day column and one column per compartment. */
export type HistoryTable = {columns: string[]; rows: (string | number | null)[][]}

type NamedValues = {label: string; values: number[]}

export function buildHistoryTable(dayLabel: string, series: NamedValues[]): HistoryTable {
  const days = series.reduce((longest, entry) => Math.max(longest, entry.values.length), 0)
  return {
    columns: [dayLabel, ...series.map((entry) => entry.label)],
    rows: Array.from({length: days}, (_, day) => [day, ...series.map((entry) => entry.values[day] ?? null)]),
  }
}

function escapeCsvValue(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

export function historyTableToCsv(table: HistoryTable): string {
  const cells = (row: (string | number | null)[]) => row.map((value) => escapeCsvValue(value === null ? "" : String(value))).join(",")
  return [table.columns, ...table.rows].map(cells).join("\n")
}
