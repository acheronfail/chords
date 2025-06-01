import { z } from "zod/v4";
import { PersistentState } from "$lib/svelte/persistent-state.svelte";

const C4 = 60;

export const settings = new PersistentState({
  key: "settings",
  initial: () => ({
    pianoRollMinKey: C4 - 24,
    pianoRollMaxKey: C4 + 24,
  }),
  schema: z.object({
    pianoRollMinKey: z.number(),
    pianoRollMaxKey: z.number(),
  }),
  storageType: "localStorage",
});

export const cachedSettings = new PersistentState({
  key: "caches",
  initial: () => ({ midiDeviceId: null }),
  schema: z.object({
    midiDeviceId: z.string().nullable(),
  }),
  storageType: "localStorage",
});
