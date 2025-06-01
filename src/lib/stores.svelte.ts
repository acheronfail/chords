import { z } from "zod/v4";
import { PersistentState } from "$lib/persistent-state.svelte";

const C4 = 60;

const SettingsSchema = z.object({
  pianoRollMinKey: z.number(),
  pianoRollMaxKey: z.number(),
});

type ZSettings = z.infer<typeof SettingsSchema>;

const settingsDefaults = (): ZSettings => ({
  pianoRollMinKey: C4 - 24,
  pianoRollMaxKey: C4 + 24,
});

export const settings = new PersistentState({
  key: "settings",
  initial: settingsDefaults,
  storageType: "localStorage",
});

interface CachedSettings {
  midiDeviceId: string | null;
}

export const cachedSettings = new PersistentState<CachedSettings>({
  key: "caches",
  initial: () => ({ midiDeviceId: null }),
  storageType: "localStorage",
});
