import type { MsgFn, MsgOptions, TemplateLike } from "@lit/localize";
import { runtimeMsg } from "@lit/localize/internal/runtime-msg.js";

// The message function for code that runs outside a widget instance: the source language.
export const sourceMsg = ((template: TemplateLike, options?: MsgOptions) =>
  runtimeMsg(undefined, template, options)) as MsgFn;
