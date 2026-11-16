/// <reference types="mocha" />
import "mocha/mocha.js"
import "mocha/mocha.css"
import {getMochaConfig} from "@webwriter/build/test"
import {assert} from "chai"
import "../src/widgets/webwriter-epidemic-sim"

import {cleanup, mount, until, frame, edit, root, fire, hotspots, tokenOf, dragToken} from "./helpers"

mocha.setup(getMochaConfig())

const controlled = `hotspots-enabled allow-hotspots-enabled-control`

describe("<webwriter-epidemic-sim> hotspots", function () {
  this.timeout(30000)
  afterEach(cleanup)

  it("shows the toolbox to authors, and to readers only with the learner control", async function () {
    const toolbox = (widget: Awaited<ReturnType<typeof mount>>) => root(widget).querySelector(".hotspot-toolbox--map")
    let widget = await mount("hotspots-enabled")
    assert.isNull(toolbox(widget), "hidden for a reader without the control")
    edit(widget, true)
    await until(() => toolbox(widget), "toolbox in edit mode")
    edit(widget, false)
    await until(() => !toolbox(widget), "toolbox hidden again in read mode")
    widget = await mount(`hotspots-enabled allow-hotspots-enabled-control`)
    assert.isNotNull(toolbox(widget), "shown for a reader with the control")
  })

  describe("dragging the token", function () {
    it("creates a hotspot centred where it is dropped on the map", async function () {
      const widget = await mount(controlled)
      const canvas = root(widget).querySelector("#simulation-canvas")!
      assert.isOk(tokenOf(widget), "the token is shown")
      assert.isFalse(tokenOf(widget).hasAttribute("draggable"), "no HTML5 dragging any more")
      const target = (box: DOMRect) => ({x: box.left + box.width * 0.5, y: box.top + box.height * 0.5})
      const seen: string[] = []
      widget.addEventListener("ww-transactionstart", () => seen.push("start"), true)
      widget.addEventListener("ww-transactionend", () => seen.push("end"), true)
      const state = await dragToken(widget, target)
      assert.isTrue(state.lifted && state.over, `the token is lifted and the map is marked (${JSON.stringify(state)})`)
      assert.lengthOf(hotspots(widget), 1, "one hotspot")
      const rect = hotspots(widget)[0].rect
      const cx = rect.x + rect.width / 2, cy = rect.y + rect.height / 2
      assert.isTrue(Math.abs(cx - 300) < 30 && Math.abs(cy - 180) < 30, `hotspot centred near the drop point, centre ${cx},${cy}`)
      assert.isFalse(canvas.hasAttribute("data-ww-drop-over"), "the marker is gone")
      await until(() => widget.querySelector(':scope > script[type="application/json"][slot="data"]'), "the hotspot in the data block")
      assert.isTrue(seen.length === 0 || seen.join() === "start,end", "at most one undo step: " + seen.join())
    })

    it("creates nothing on Escape or a release outside the map", async function () {
      const widget = await mount(controlled)
      await dragToken(widget, box => ({x: box.left + box.width * 0.4, y: box.top + box.height * 0.4}), {cancel: true})
      assert.lengthOf(hotspots(widget), 0, "cancelled")
      await dragToken(widget, box => ({x: box.left - 20, y: box.top - 20}))
      assert.lengthOf(hotspots(widget), 0, "released outside")
    })

    it("keeps the hotspot on the map for a drop near the edge", async function () {
      const widget = await mount(controlled)
      await dragToken(widget, box => ({x: box.right - 1, y: box.bottom - 1}))
      assert.lengthOf(hotspots(widget), 1)
      const {x, y, width, height} = hotspots(widget)[0].rect
      assert.isTrue(x >= 0 && y >= 0 && x + width <= 600 + 0.5 && y + height <= 360 + 0.5, `inside the map: ${x},${y},${width},${height}`)
    })

    it("also works by keyboard, and an existing hotspot can be moved with the pointer", async function () {
      const widget = await mount(controlled)
      const token = tokenOf(widget)
      token.focus()
      token.dispatchEvent(new KeyboardEvent("keydown", {key: "Enter", bubbles: true, composed: true, cancelable: true}))
      await frame(); await frame()
      const picked = widget.hasAttribute("x") || token.hasAttribute("data-ww-dragging") || root(widget).querySelector("[data-ww-drop-candidate]")
      for (const name of ["Tab", "ArrowRight", "Enter"]) {
        const active = (document.activeElement?.shadowRoot?.activeElement ?? token) as Element
        active.dispatchEvent(new KeyboardEvent("keydown", {key: name, bubbles: true, composed: true, cancelable: true}))
        await frame(); await frame()
      }
      await widget.updateComplete
      assert.isOk(picked, "the keyboard picks the token up")
      assert.lengthOf(hotspots(widget), 1, "the keyboard drop creates a hotspot")
      const before = hotspots(widget).length
      await dragToken(widget, box => ({x: box.left + box.width * 0.3, y: box.top + box.height * 0.3}))
      assert.lengthOf(hotspots(widget), before + 1)
      const box = root(widget).querySelector("#simulation-canvas")!.getBoundingClientRect()
      // move the new hotspot with the canvas pointer handling, which the module does not own
      const spot = hotspots(widget).at(-1)!.rect
      const scale = box.width / 600
      const at = {x: box.left + (spot.x + spot.width / 2) * scale, y: box.top + (spot.y + spot.height / 2) * scale}
      const canvas = root(widget).querySelector("#simulation-canvas")!
      fire(canvas, "pointerdown", at)
      fire(window, "pointermove", {x: at.x + 60, y: at.y + 30})
      fire(window, "pointerup", {x: at.x + 60, y: at.y + 30})
      await widget.updateComplete
      const moved = hotspots(widget).at(-1)!.rect
      assert.isAbove(moved.x, spot.x + 20, `the hotspot moved by the pointer: ${spot.x} -> ${moved.x}`)
    })
  })

  it("still creates exactly one hotspot with tap-to-place", async function () {
    const widget = await mount(controlled)
    const canvas = root(widget).querySelector("#simulation-canvas")!
    tokenOf(widget).click()
    await widget.updateComplete; await frame()
    assert.isTrue(widget.hotspotSelection.placementActive, "placement mode is on")
    assert.isFalse(canvas.hasAttribute("data-ww-drop-candidate"), "the drag module did not also pick the token up")
    canvas.scrollIntoView({block: "center"}); await frame()
    const box = canvas.getBoundingClientRect()
    const at = {x: box.left + box.width * 0.6, y: box.top + box.height * 0.6}
    fire(canvas, "pointerdown", at)
    fire(canvas, "pointerup", at)
    canvas.dispatchEvent(new MouseEvent("click", {bubbles: true, composed: true, clientX: at.x, clientY: at.y}))
    await frame(); await frame(); await widget.updateComplete
    assert.lengthOf(hotspots(widget), 1, "one hotspot from one tap")
    assert.isFalse(widget.hotspotSelection.placementActive, "placement mode is off")
  })
})

mocha.run()
