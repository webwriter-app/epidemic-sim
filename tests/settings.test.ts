/// <reference types="mocha" />
import "mocha/mocha.js"
import "mocha/mocha.css"
import {getMochaConfig} from "@webwriter/build/test"
import {assert} from "chai"
import "../src/widgets/webwriter-epidemic-sim"

import {cleanup, mount, until, snippet, root, resetButton} from "./helpers"

mocha.setup(getMochaConfig())

describe("<webwriter-epidemic-sim> settings and language", function () {
  this.timeout(30000)
  afterEach(cleanup)

  it("turns authored attributes into typed properties", async function () {
    const widget = await mount(snippet)
    assert.deepEqual([widget.modelType, widget.population, widget.speed, widget.infectionProbability], ["seird", 300, 1.6, 0.06])
    assert.deepEqual([widget.allowSpeedControl, widget.allowPopulationControl, widget.quarantineEnabled], [true, false, false])
    assert.isTrue(widget.getAttribute("population") === "300" && widget.hasAttribute("allow-speed-control"), "authored attributes are kept")
  })

  it("clamps a value outside the limits and falls back for an unknown model", async function () {
    const widget = await mount(`population="5" model-type="nonsense" infection-probability="x"`)
    assert.deepEqual([widget.population, widget.modelType, widget.infectionProbability], [50, "sir", 0.2])
    assert.strictEqual(widget.getAttribute("population"), "5", "the authored attribute is not rewritten")
  })

  it("reflects a property write and removes the attribute at the default", async function () {
    const widget = await mount(snippet)
    widget.speed = 2.5
    widget.allowPopulationControl = true
    await widget.updateComplete
    assert.deepEqual([widget.getAttribute("speed"), widget.hasAttribute("allow-population-control")], ["2.5", true])
    widget.speed = 1.6
    widget.allowPopulationControl = false
    await widget.updateComplete
    assert.deepEqual([widget.hasAttribute("speed"), widget.hasAttribute("allow-population-control")], [false, false])
  })

  it("gives the editor options with group, limits and label that follow the model", async function () {
    const widget = await mount(`model-type="sir"`)
    const events: string[] = []
    widget.addEventListener("optionschange", () => events.push("optionschange"))
    let options = widget.options as any
    assert.lengthOf(Object.keys(options), 40)
    assert.deepEqual([options.population.group, options.population.min, options.population.max, options.population.step, options.population.control], ["general", 50, 800, 10, "range"])
    assert.deepEqual([options.population.attribute, options.allowPopulationControl.attribute, options.allowPopulationControl.group], ["population", "allow-population-control", "controls"])
    assert.strictEqual(options.population.label, "Population")
    assert.isTrue(options.incubationDuration.hidden === true && options.allowIncubationDurationControl.hidden === true, "SEIR-only options are hidden for SIR")
    assert.deepEqual(options.modelType.options.map((entry: any) => entry.value), ["sir", "sirs", "seir", "sird", "seird"])
    widget.modelType = "seir"
    await widget.updateComplete
    options = widget.options
    assert.isTrue(options.incubationDuration.hidden === false && options.immunityDuration.hidden === true, "SEIR shows the incubation duration")
    assert.isAtLeast(events.length, 1, "the editor is told that the options changed")
  })

  it("follows its lang attribute and the editor labels follow it", async function () {
    const widget = await mount(snippet)
    assert.strictEqual(widget.msg("Reset simulation"), "Reset simulation", "source language first")
    widget.setAttribute("lang", "de")
    await until(() => widget.msg("Reset simulation") !== "Reset simulation", "the German catalog")
    assert.strictEqual(widget.localize.getLocale(), "de")
    await widget.updateComplete
    assert.strictEqual(resetButton(widget).getAttribute("aria-label"), widget.msg("Reset simulation"), "the template is rendered in German")
    assert.notStrictEqual((widget.options as any).population.label, "Population", "drawer labels are German")
    widget.removeAttribute("lang")
    await until(() => widget.msg("Reset simulation") === "Reset simulation", "the source language again")
  })

  it("inherits the language from an ancestor", async function () {
    const container = document.createElement("div")
    container.setAttribute("lang", "fr")
    const widget = await mount(snippet, container)
    await until(() => widget.localize.getLocale() === "fr", "French")
    container.removeAttribute("lang")
    await until(() => widget.localize.getLocale() === "en", "English again")
  })

  it("writes the learner menu settings back to the attributes", async function () {
    const widget = await mount(`allow-speed-control allow-population-control allow-quarantine-enabled-control speed="1.6" population="300"`)
    const ranges = [...root(widget).querySelectorAll<any>(".side-menu sl-range")]
    assert.lengthOf(ranges, 2, "two learner sliders")
    const speed = ranges.find(range => range.getAttribute("max") === "4")
    speed.value = 3; speed.dispatchEvent(new CustomEvent("sl-input", {bubbles: true, composed: true}))
    await widget.updateComplete
    assert.deepEqual([widget.speed, widget.getAttribute("speed")], [3, "3"])
    const population = ranges.find(range => range !== speed)
    population.value = 447; population.dispatchEvent(new CustomEvent("sl-input", {bubbles: true, composed: true}))
    await widget.updateComplete
    assert.deepEqual([widget.population, widget.getAttribute("population")], [450, "450"], "rounded to the step")
    const toggle = root(widget).querySelector<any>(".side-menu sl-switch")
    toggle.checked = true; toggle.dispatchEvent(new CustomEvent("sl-change", {bubbles: true, composed: true}))
    await widget.updateComplete
    assert.deepEqual([widget.quarantineEnabled, widget.hasAttribute("quarantine-enabled")], [true, true])
    await until(() => widget.run.agents.length === 450, "the population was reseeded")
  })
})

mocha.run()
