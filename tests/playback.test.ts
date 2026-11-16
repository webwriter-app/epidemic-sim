/// <reference types="mocha" />
import "mocha/mocha.js"
import "mocha/mocha.css"
import {getMochaConfig} from "@webwriter/build/test"
import {assert} from "chai"
import "../src/widgets/webwriter-epidemic-sim"

import {cleanup, mount, until, frame, snippet, playButton, resetButton} from "./helpers"

mocha.setup(getMochaConfig())

describe("<webwriter-epidemic-sim> playback", function () {
  this.timeout(30000)
  afterEach(cleanup)

  it("starts by itself and advances its frames", async function () {
    const widget = await mount(snippet)
    await until(() => widget.isRunning, "running")
    const start = widget.run.frameIndex
    await until(() => widget.run.frameIndex > start + 3, "frames")
    assert.strictEqual(playButton(widget).getAttribute("aria-label"), widget.msg("Pause"))
  })

  it("pauses and resumes with the toggle button", async function () {
    const widget = await mount(snippet)
    await until(() => widget.isRunning && widget.run.frameIndex > 2, "running")
    playButton(widget).click()
    await widget.updateComplete
    assert.isFalse(widget.isRunning, "paused")
    assert.strictEqual(playButton(widget).getAttribute("aria-label"), widget.msg("Start"), "button says Start")
    const held = widget.run.frameIndex
    for (let i = 0; i < 6; i++) await frame()
    assert.strictEqual(widget.run.frameIndex, held, "no frames while paused")
    playButton(widget).click()
    await until(() => widget.run.frameIndex > held + 2, "frames after resume")
    assert.isTrue(widget.isRunning)
  })

  it("restarts the run on reset and keeps it running", async function () {
    const widget = await mount(snippet)
    await until(() => widget.run.frameIndex > 20, "some frames")
    resetButton(widget).click()
    assert.isBelow(widget.run.frameIndex, 20, "back near the start")
    assert.isTrue(widget.isRunning, "still running")
    await until(() => widget.run.frameIndex > 3, "frames after reset")
  })

  it("restarts a finished run with the toggle", async function () {
    const widget = await mount(`simulation-duration="24" population="60"`)
    await until(() => !widget.isRunning, "the run to end")
    assert.isAtLeast(widget.run.frameIndex, 24)
    playButton(widget).click()
    await until(() => widget.isRunning && widget.run.frameIndex > 0 && widget.run.frameIndex < 24, "a fresh run")
  })

  it("runs nothing while the widget is off screen", async function () {
    const widget = await mount(snippet)
    await until(() => widget.run.frameIndex > 2, "running")
    widget.style.cssText = "position: fixed; left: -5000px; top: 0; width: 600px"
    for (let i = 0; i < 5; i++) await frame()
    const held = widget.run.frameIndex
    for (let i = 0; i < 8; i++) await frame()
    assert.strictEqual(widget.run.frameIndex, held, "no frames off screen")
    widget.style.cssText = ""
    await until(() => widget.run.frameIndex > held + 2, "frames when shown again")
  })

  it("stops for print and ends the loop on disconnect", async function () {
    const widget = await mount(snippet)
    await until(() => widget.run.frameIndex > 2, "running")
    widget.classList.add("ww-beforeprint")
    await until(() => !widget.isRunning, "stop for print")
    widget.classList.remove("ww-beforeprint")
    playButton(widget).click()
    await until(() => widget.isRunning, "running again")
    const parent = widget.parentElement!
    widget.remove()
    const held = widget.run.frameIndex
    for (let i = 0; i < 6; i++) await frame()
    assert.strictEqual(widget.run.frameIndex, held, "no frames while disconnected")
    parent.append(widget)
    await until(() => widget.run.frameIndex > held + 2, "frames after reconnect")
  })
})

mocha.run()
