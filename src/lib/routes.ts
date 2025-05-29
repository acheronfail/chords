import { base } from "$app/paths";

export const routes = {
  home: `${base}/`,
  leadSheet: `${base}/lead-sheet`,
  chordRecognition: `${base}/chord-recognition`,
  midiDebug: `${base}/midi-debug`,
} as const;
