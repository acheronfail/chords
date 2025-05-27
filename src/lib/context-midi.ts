import { getContext, setContext } from "svelte";
import { SvelteSet } from "svelte/reactivity";

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
