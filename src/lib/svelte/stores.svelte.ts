import { z } from "zod/v4";
import { PersistentState } from "$lib/svelte/persistent-state.svelte";
import { ChordKind } from "../chords";

const C4 = 60;

export const settings = new PersistentState({
  key: "settings",
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
