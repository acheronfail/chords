import { z } from "zod/v4";
import { PersistentState } from "$lib/svelte/persistent-state.svelte";

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
      randomInversions: z.boolean(),
      showPianoRoll: z.boolean(),
      showPianoRollNotes: z.boolean(),
      timerDuration: z.number().nullable(),
    }),
  }),
  initialise: () => ({
    midiDeviceId: null,

    pianoRollMinKey: C4 - 24,
    pianoRollMaxKey: C4 + 24,

    practice: {
      chordCount: 12,
      randomInversions: false,
      showPianoRoll: false,
      showPianoRollNotes: true,
      timerDuration: null,
    },
  }),
});
