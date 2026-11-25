/// <reference types="mocha" />
import "mocha/mocha.js"
import "mocha/mocha.css"
import {getMochaConfig} from "@webwriter/build/test"
import {assert} from "chai"
import "../src/widgets/webwriter-epidemic-sim"

import {cleanup, mount, until, frame, edit, root, fire, hotspots, tokenOf} from "./helpers"

mocha.setup(getMochaConfig())

const controlled = `hotspots-enabled allow-hotspots-enabled-control`
const key = (target: Element, name: string, init: KeyboardEventInit = {}) =>
  target.dispatchEvent(new KeyboardEvent("keydown", {key: name, bubbles: true, composed: true, cancelable: true, ...init}))

describe("<webwriter-epidemic-sim> input and presentation", function () {
  this.timeout(30000)
  afterEach(cleanup)

  it("places a hotspot with a touch tap on the token and the map", async function () {
    const widget = await mount(controlled)
    const canvas = root(widget).querySelector("#simulation-canvas")!
    tokenOf(widget).click()
    await widget.updateComplete
    canvas.scrollIntoView({block: "center"}); await frame()
    const box = canvas.getBoundingClientRect()
    const at = {x: box.left + box.width * 0.5, y: box.top + box.height * 0.5}
    fire(canvas, "pointerdown", at, {pointerType: "touch"})
    fire(canvas, "pointerup", at, {pointerType: "touch"})
    await frame(); await widget.updateComplete
    assert.lengthOf(hotspots(widget), 1)
  })

  it("selects, moves and deletes a hotspot with the keyboard", async function () {
    const widget = await mount(controlled)
    const canvas = root(widget).querySelector("#simulation-canvas") as HTMLCanvasElement
    assert.equal(canvas.getAttribute("tabindex"), "0", "the map is a tab stop when hotspots are editable")
    tokenOf(widget).click()
    await widget.updateComplete
    canvas.scrollIntoView({block: "center"}); await frame()
    const box = canvas.getBoundingClientRect()
    const at = {x: box.left + box.width * 0.5, y: box.top + box.height * 0.5}
    fire(canvas, "pointerdown", at); fire(canvas, "pointerup", at)
    await widget.updateComplete
    assert.lengthOf(hotspots(widget), 1)
    key(canvas, "Enter")
    key(canvas, "Enter")
    const x = hotspots(widget)[0].rect.x
    key(canvas, "ArrowRight")
    assert.equal(hotspots(widget)[0].rect.x, x + 30, "moved by one step")
    key(canvas, "Delete")
    assert.lengthOf(hotspots(widget), 0, "deleted")
  })

  it("has no keyboard stop on the map without hotspots", async function () {
    const widget = await mount("")
    assert.isFalse(root(widget).querySelector("#simulation-canvas")!.hasAttribute("tabindex"))
  })

  it("follows the theme properties", async function () {
    const wrapper = document.createElement("div")
    wrapper.style.cssText = "--ww-text-color: rgb(10, 20, 30); --ww-font-family: Georgia, serif; --ww-theme-accent-1: rgb(1, 2, 3)"
    document.body.append(wrapper)
    const widget = await mount(controlled, wrapper)
    edit(widget, true)
    await until(() => tokenOf(widget), "token")
    assert.equal(getComputedStyle(widget).color, "rgb(10, 20, 30)")
    assert.include(getComputedStyle(widget).fontFamily, "Georgia")
    assert.equal(getComputedStyle(tokenOf(widget).shadowRoot!.querySelector("[part~=base]")!).color, "rgb(1, 2, 3)")
    assert.isOk(root(widget).querySelector('[part="chart"]') && root(widget).querySelector('[part="map"]'), "named parts")
  })

  it("prints pictures of the canvases and removes them afterwards", async function () {
    const widget = await mount("")
    window.dispatchEvent(new Event("beforeprint"))
    await until(() => root(widget).querySelectorAll("img.print-image").length >= 1, "print images")
    const chart = root(widget).querySelector("#chart-canvas") as HTMLCanvasElement
    const sources = [...root(widget).querySelectorAll("img.print-image")].map(image => (image as HTMLImageElement).src.slice(0, 30)).join() + ` chart ${chart.width}x${chart.height}`
    assert.match(sources, /data:image\/png/, sources)
    window.dispatchEvent(new Event("afterprint"))
    await until(() => root(widget).querySelectorAll("img.print-image").length === 0, "images removed")
  })

  it("keeps the widget between 300 and 2100 px", async function () {
    const widget = await mount("")
    assert.equal(getComputedStyle(widget).minWidth, "300px")
    assert.equal(getComputedStyle(widget).maxWidth, "2100px")
  })
})

mocha.run()
