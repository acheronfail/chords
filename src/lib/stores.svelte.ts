// new.svelte.ts / js
import { PersistentState } from "$lib/persistent-state.svelte";

export const settings = new PersistentState(
  "settings",
  {
    chordNotationUsesSharps: false,
  },
  "localStorage",
);

interface CachedSettings {
  midiDeviceId: string | null;
}

export const cachedSettings = new PersistentState<CachedSettings>(
  "caches",
  {
    midiDeviceId: null,
  },
  "localStorage",
);
