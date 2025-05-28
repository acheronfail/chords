import { getContext, setContext } from "svelte";
import { SvelteSet } from "svelte/reactivity";
import { createChordKey } from "./chords";

const key = {};

export function initPressedKeys() {
  const ctx = getContext(key);
  if (ctx === undefined) {
    setContext(key, new SvelteSet<number>());
  }
}

export function getPressedKeys(): Set<number> {
  return getContext(key);
}

export const MidiShortcuts = {
  skip: createChordKey([0, 1, 3]),
} as const;

export function isMidiShortcut(shortcut: keyof typeof MidiShortcuts) {
  return createChordKey(getPressedKeys()) === MidiShortcuts[shortcut];
}
