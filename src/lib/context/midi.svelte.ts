import { getContext, setContext } from "svelte";
import { SvelteSet } from "svelte/reactivity";
import { createChordMapKey } from "$lib/chords";
import { getToaster } from "./toast";

export type Unsubscribe = () => void;
export interface Context {
  pressedKeys: Set<number>;
  onMidiShortcut: (fn: (shortcut: MidiShortcut) => void) => Unsubscribe;
}

const key = {};

export function initMidiContext() {
  const ctx = getContext(key);
  if (ctx === undefined) {
    const listeners = new Set<(shortcut: MidiShortcut) => void>();

    const context: Context = {
      pressedKeys: new SvelteSet<number>(),
      onMidiShortcut: (fn) => {
        listeners.add(fn);
        return () => listeners.delete(fn);
      },
    };

    setContext(key, context);

    const pressedShortcuts = new Set<MidiShortcut>();
    $effect(() => {
      // detect shortcuts on pressed keys
      for (const [shortcut, key] of Object.entries(MidiShortcuts)) {
        if (createChordMapKey(context.pressedKeys) === key) {
          pressedShortcuts.add(shortcut as MidiShortcut);
        }
      }

      // fire listeners for shortcuts when all keys are released
      if (context.pressedKeys.size === 0) {
        const values = Array.from(pressedShortcuts.values());
        pressedShortcuts.clear();
        values.forEach((shortcut) => listeners.forEach((fn) => fn(shortcut)));
      }
    });

    // allow using keyboard for midi input in dev mode
    if (import.meta.env.DEV) {
      const { toaster } = getToaster();

      let isToggling = false;
      const toggle = (n: number) =>
        context.pressedKeys.has(n) ? context.pressedKeys.delete(n) : context.pressedKeys.add(n);

      const midiKeys = "awsedftgyhujkolp;'";

      window.addEventListener("keydown", (e) => {
        const n = midiKeys.indexOf(e.key);
        if (n === -1) return;
        isToggling ? toggle(n) : context.pressedKeys.add(n);
        e.preventDefault();
      });

      window.addEventListener("keyup", (e) => {
        if (e.key === "z") {
          isToggling = !isToggling;
          toaster.info({
            title: "midi keyboard",
            description: `sticky keys ${isToggling ? "enabled" : "disabled"}`,
          });
        }

        if (isToggling) return;
        const n = midiKeys.indexOf(e.key);
        if (n === -1) return;
        isToggling ? toggle(n) : context.pressedKeys.delete(n);
        e.preventDefault();
      });
    }
  }
}

export function getMidiContext(): Context {
  return getContext(key);
}

export type MidiShortcut = keyof typeof MidiShortcuts;
export const MidiShortcuts = {
  skip: createChordMapKey([0, 1, 3]),
} as const;
