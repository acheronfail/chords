import { base } from "$app/paths";

export const routes = {
  home: `${base}/`,
  leadSheet: `${base}/lead-sheet`,
  midiDebug: `${base}/midi-debug`,
} as const;
