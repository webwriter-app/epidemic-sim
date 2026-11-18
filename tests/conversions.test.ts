/// <reference types="mocha" />
import "mocha/mocha.js"
import "mocha/mocha.css"
import {getMochaConfig} from "@webwriter/build/test"
import {assert} from "chai"
import "../src/widgets/webwriter-epidemic-sim"
import valid from "./fixtures/parameters.json"
import invalid from "./fixtures/parameters-invalid.json"

import {cleanup, mount, until, frame, type Widget} from "./helpers"

mocha.setup(getMochaConfig())

type Handler<Result, Args extends unknown[] = []> = (this: unknown, ...args: Args) => Result
type Conversions = {
  clearSnapshots(): void
  removeHotspots(): void
  signals: {infected: {get(): number}; ended: {get(): boolean}; history: {get(): {columns: string[]; rows: unknown[][]}}}
  snapshotActions: {create(): void}
  snapshotService: {snapshots: unknown[]}
}
// The conversions run with the widget as `this`, as the editor calls them.
const maps = (widget: Widget) => widget.constructor as unknown as {
  convertFrom: {".json": Handler<Promise<() => void>, [File]>}
  convertTo: {"text/csv": Handler<File | null>; ".json": Handler<File>; table: Handler<HTMLTableElement | null>}
}
const api = (widget: Widget) => Object.assign(widget as unknown as Widget & Conversions, {
  exportHistoryCsv: () => maps(widget).convertTo["text/csv"].call(widget),
  exportParameters: () => maps(widget).convertTo[".json"].call(widget),
  toTable: () => maps(widget).convertTo.table.call(widget),
  importParameters: (file: File) => maps(widget).convertFrom[".json"].call(widget, file),
})
const json = (value: unknown) => new File([JSON.stringify(value)], "parameters.json", {type: "application/json"})

describe("<webwriter-epidemic-sim> data and integration", function () {
  this.timeout(30000)
  afterEach(cleanup)

  it("exports the curves as CSV and as a native table", async function () {
    const widget = api(await mount(""))
    await until(() => widget.signals.history.get().rows.length >= 2, "two days of history")
    const file = widget.exportHistoryCsv()!
    assert.equal(file.name, "epidemic-history.csv")
    assert.equal(file.type, "text/csv")
    const text = (await file.text()).replace("﻿", "")
    const [header, first] = text.split("\n")
    assert.equal(header, "Day,Susceptible,Infected,Recovered")
    assert.match(first, /^0,\d+,\d+,\d+$/)
    const table = widget.toTable()!
    assert.equal(table.tagName, "TABLE")
    assert.deepEqual([...table.querySelectorAll("thead th")].map(cell => cell.textContent), header.split(","))
    assert.isAtLeast(table.querySelectorAll("tbody tr").length, 2)
  })

  it("imports a parameter file and ignores unknown keys", async function () {
    const widget = api(await mount(""))
    const apply = await widget.importParameters(json(valid))
    assert.notEqual(widget.population, 300, "nothing changes before the apply function runs")
    apply()
    await widget.updateComplete
    assert.equal(widget.modelType, "seird")
    assert.equal(widget.population, 300)
    assert.equal(widget.getAttribute("population"), "300")
    assert.isTrue(widget.quarantineEnabled)
  })

  it("rejects invalid parameter files without changing the widget", async function () {
    const widget = api(await mount(""))
    for (const file of [json(invalid), json({}), json([1]), new File(["{"], "broken.json")]) {
      let message = ""
      await widget.importParameters(file).catch((error: Error) => { message = error.message })
      assert.isNotEmpty(message)
    }
    assert.equal(widget.population, 240)
    assert.equal(widget.modelType, "sir")
  })

  it("round trips the parameters", async function () {
    const source = api(await mount(`model-type="sird" population="320" speed="2.5" hotspots-enabled`))
    const file = source.exportParameters()
    assert.equal(file.name, "epidemic-parameters.json")
    const target = api(await mount(""))
    ;(await target.importParameters(file))()
    await target.updateComplete
    const keys = Object.keys(JSON.parse(await file.text())) as (keyof Widget)[]
    assert.isAtLeast(keys.length, 15, "every parameter is exported")
    for (const key of keys) {
      assert.equal(JSON.parse(await file.text())[key], source[key], `export of ${key}`)
      assert.equal(target[key], source[key], `import of ${key}`)
    }
  })

  it("publishes the signals", async function () {
    const widget = api(await mount("population=\"100\""))
    const {infected, ended, history} = widget.signals
    assert.isNumber(infected.get())
    assert.isBoolean(ended.get())
    await until(() => history.get().rows.length >= 2, "history")
    assert.deepEqual(history.get().columns, ["Day", "Susceptible", "Infected", "Recovered"])
    assert.strictEqual(widget.signals.history, history, "stable instance")
    widget.setAttribute("model-type", "seir")
    await until(() => history.get().columns.includes("Exposed"), "columns of the new model")
  })

  it("clears snapshots and hotspots with its actions", async function () {
    const widget = api(await mount("hotspots-enabled"))
    widget.snapshotActions.create()
    ;(widget.hotspotEditing as unknown as {addHotspotAtPoint(x: number, y: number): void}).addHotspotAtPoint(200, 150)
    await frame()
    assert.lengthOf(widget.snapshotService.snapshots, 1)
    assert.lengthOf(widget.hotspotEditing.userHotspots, 1)
    widget.clearSnapshots()
    widget.removeHotspots()
    assert.lengthOf(widget.snapshotService.snapshots, 0)
    assert.lengthOf(widget.hotspotEditing.userHotspots, 0)
  })
})

mocha.run()
