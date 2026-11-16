import type {WebwriterEpidemicSim} from "../src/widgets/webwriter-epidemic-sim"
import type {Hotspot} from "../src/model/simulation/types"

// The tests reach into controllers that the class keeps private
export type Widget = Omit<WebwriterEpidemicSim, "run" | "isRunning" | "hotspotEditing" | "hotspotSelection"> & {
  run: {frameIndex: number, agents: unknown[]}
  isRunning: boolean
  hotspotEditing: {userHotspots: Hotspot[]}
  hotspotSelection: {placementActive: boolean}
}

export const frame = () => new Promise<void>(resolve => requestAnimationFrame(() => resolve()))

export async function until(condition: () => unknown, message = "condition", limit = 20000) {
  const start = performance.now()
  while (!condition()) {
    if (performance.now() - start > limit) throw new Error(`timed out waiting for ${message}`)
    await frame()
  }
}

/** Mounts a widget in a fresh container and waits for its first render. */
export async function mount(attributes = "", container: HTMLElement = document.createElement("div")): Promise<Widget> {
  if (!container.isConnected) document.body.append(container)
  container.innerHTML = `<webwriter-epidemic-sim ${attributes}></webwriter-epidemic-sim>`
  const widget = container.firstElementChild as unknown as Widget
  await widget.updateComplete
  await until(() => widget.shadowRoot!.querySelector("#simulation-canvas") && widget.run.frameIndex !== undefined, "first render")
  return widget
}

/** Removes everything a test mounted and leaves the document out of edit mode. */
export function cleanup() {
  document.designMode = "off"
  document.querySelectorAll("webwriter-epidemic-sim").forEach(widget => widget.parentElement?.remove())
}

export const root = (widget: Widget) => widget.shadowRoot!
export const playButton = (widget: Widget) => root(widget).querySelector(".simulation-actions__icon-button--play-pause") as HTMLElement
export const resetButton = (widget: Widget) => root(widget).querySelectorAll(".simulation-actions .simulation-actions__icon-button")[1] as HTMLElement

export function edit(widget: Widget, on: boolean) {
  document.designMode = on ? "on" : "off"
  if (on) widget.setAttribute("contenteditable", "")
  else widget.removeAttribute("contenteditable")
}

export const snippet = `model-type="seird" incubation-duration="120" population="300" speed="1.6" infection-probability="0.06"
    allow-speed-control allow-quarantine-enabled-control allow-hotspots-enabled-control`

export const center = (element: Element) => {
  const r = element.getBoundingClientRect()
  return {x: r.left + r.width / 2, y: r.top + r.height / 2}
}

type Point = {x: number, y: number}

export const fire = (target: EventTarget, type: string, at: Point, init: PointerEventInit = {}) =>
  target.dispatchEvent(new PointerEvent(type, {bubbles: true, composed: true, cancelable: true, pointerId: 7, button: 0, isPrimary: true, clientX: at.x, clientY: at.y, ...init}))

export const hotspots = (widget: Widget) => widget.hotspotEditing.userHotspots
export const tokenOf = (widget: Widget) => root(widget).querySelector(".hotspot-toolbox__token") as HTMLElement

export async function dragToken(widget: Widget, to: Point | ((box: DOMRect) => Point), {cancel = false} = {}) {
  const token = tokenOf(widget)
  token.scrollIntoView({block: "center"})
  await frame()
  const from = center(token)
  fire(token, "pointerdown", from)
  fire(token, "pointermove", {x: from.x + 8, y: from.y + 8})
  await frame(); await frame()
  const lifted = token.hasAttribute("data-ww-dragging")
  // the page may have scrolled: the destination is measured after the pick-up
  const destination = typeof to === "function" ? to(root(widget).querySelector("#simulation-canvas")!.getBoundingClientRect()) : to
  fire(token, "pointermove", destination)
  await frame(); await frame()
  const over = root(widget).querySelector("#simulation-canvas")!.hasAttribute("data-ww-drop-over")
  if (cancel) window.dispatchEvent(new KeyboardEvent("keydown", {key: "Escape"}))
  else fire(token, "pointerup", destination)
  await frame(); await frame(); await widget.updateComplete
  return {lifted, over}
}
