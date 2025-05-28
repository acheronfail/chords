import { PersistentState } from "$lib/persistent-state.svelte";

const C4 = 60;

const settingsDefaults = () => ({
  pianoRollMinKey: C4 - 24,
  pianoRollMaxKey: C4 + 24,
  chordNotationUsesSharps: true,
});

export function settingsReset() {
  settings.current = settingsDefaults();
}

export const settings = new PersistentState("settings", settingsDefaults(), "localStorage");

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
