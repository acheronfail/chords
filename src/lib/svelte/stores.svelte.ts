import { z } from "zod/v4";
import { PersistentState } from "$lib/svelte/persistent-state.svelte";
import { ChordKind } from "../chords";

// NOTE: when this is incremented, then users will lose their stored values
// as the data will be migrated to a new key
const SETTINGS_VERSION = 0;

const getStorageKey = (version: number) => `settings_v${SETTINGS_VERSION}`;
export function cleanUpPreviousSettings() {
  let version = SETTINGS_VERSION;

  window.localStorage.removeItem("settings"); // legacy
  while (version > 0) {
    window.localStorage.removeItem(getStorageKey(version));
  }
}

const C4 = 60;
export const settings = new PersistentState({
  key: getStorageKey(SETTINGS_VERSION),
  storageType: "localStorage",
  schema: z.object({
    midiDeviceId: z.string().nullable(),

    pianoRollMinKey: z.number(),
    pianoRollMaxKey: z.number(),

    practice: z.object({
      chordCount: z.number(),
      chordKinds: z.enum(ChordKind).array(),
      randomInversions: z.boolean(),
      showPianoRoll: z.boolean(),
      showPianoRollNotes: z.boolean(),
      timerDuration: z.number(),
      timerEnabled: z.boolean(),
    }),
  }),
  initialise: () => ({
    midiDeviceId: null,

    pianoRollMinKey: C4 - 24,
    pianoRollMaxKey: C4 + 24,

    practice: {
      chordCount: 12,
      chordKinds: [ChordKind.Major],
      randomInversions: false,
      showPianoRoll: false,
      showPianoRollNotes: true,
      timerDuration: 5_000,
      timerEnabled: true,
    },
  }),
});
