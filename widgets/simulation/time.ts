import { sourceMsg } from "../../localization/localizer";
import type { MsgFn } from "@lit/localize";

export const FRAMES_PER_DAY = 24

export function formatFrameCountAsDays(frameCount: number, msg: MsgFn = sourceMsg): string {
  return `${(frameCount / FRAMES_PER_DAY).toFixed(2)} ${msg("d", {desc: "Unit abbreviation for days, shown after a number"})}`
}
