import {sourceMsg} from "../../localization/localizer"
import type {MsgFn} from "@lit/localize"
import {FRAMES_PER_DAY} from "../model/simulation/time"

export function formatFrameCountAsDays(frameCount: number, msg: MsgFn = sourceMsg): string {
  return `${(frameCount / FRAMES_PER_DAY).toFixed(2)} ${msg("d", {desc: "Unit abbreviation for days, shown after a number"})}`
}
