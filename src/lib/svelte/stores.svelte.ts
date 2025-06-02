import { z } from "zod/v4";
import { PersistentState } from "$lib/svelte/persistent-state.svelte";
import { ChordKind, Clef } from "../chords";

const getStorageKey = (name: string, version: number) => `${name}_v${version}`;
export function cleanUpPreviousSettings() {
  const clean = (name: string, currentVersion: number) => {
    while (currentVersion > 0) {
      window.localStorage.removeItem(getStorageKey(name, currentVersion));
      currentVersion--;
    }
  };

  window.localStorage.removeItem("settings"); // legacy
  clean(SETTINGS_NAME, SETTINGS_VERSION);
  clean(USER_NAME, USER_VERSION);
}

// NOTE: if we ever move to a server-backed setup, then this will need to be
// moved into a database rather than stored locally
const USER_VERSION = 0;
const USER_NAME = "user";

export const user = new PersistentState({
  key: getStorageKey(USER_NAME, USER_VERSION),
  storageType: "localStorage",
  schema: z.object({
    daysPracticed: z.iso.date().array(),
  }),
  initialise: () => ({
    daysPracticed: [],
  }),
});

// NOTE: when this is incremented, then users will lose their stored values
// as the data will be migrated to a new key
const SETTINGS_VERSION = 0;
const SETTINGS_NAME = "settings";

const C4 = 60;
export const settings = new PersistentState({
  key: getStorageKey(SETTINGS_NAME, SETTINGS_VERSION),
  storageType: "localStorage",
  schema: z.object({
    midiDeviceId: z.string().nullable(),

    sidebarCollapsed: z.boolean(),

    pianoRollMinKey: z.number(),
    pianoRollMaxKey: z.number(),

    practice: z.object({
      chordCount: z.number(),
      chordKinds: z.enum(ChordKind).array(),
      clef: z.enum(Clef),
      randomInversions: z.boolean(),
      showPianoRoll: z.boolean(),
      showPianoRollNotes: z.boolean(),
      timerDuration: z.number(),
      timerEnabled: z.boolean(),
    }),
  }),
  initialise: () => ({
    midiDeviceId: null,

    sidebarCollapsed: false,

    pianoRollMinKey: C4 - 24,
    pianoRollMaxKey: C4 + 24,

    practice: {
      chordCount: 12,
      chordKinds: [ChordKind.Major],
      clef: Clef.Treble,
      randomInversions: false,
      showPianoRoll: false,
      showPianoRollNotes: true,
      timerDuration: 5_000,
      timerEnabled: true,
    },
  }),
});
