import { base } from "$app/paths";

export const routes = {
  home: `${base}/`,
  practiceSymbols: `${base}/practice/symbols`,
  practiceNotes: `${base}/practice/notes`,
  midiDebug: `${base}/midi-debug`,
} as const;
