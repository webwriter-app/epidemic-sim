import {msg} from "@lit/localize"

export const FRAMES_PER_DAY = 24

export function formatFrameCountAsDays(frameCount: number): string {
  return `${(frameCount / FRAMES_PER_DAY).toFixed(2)} ${msg("d", {desc: "Unit abbreviation for days, shown after a number"})}`
}
