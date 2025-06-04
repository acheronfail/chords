import { getContext, setContext } from "svelte";
import { SvelteSet } from "svelte/reactivity";
import { Chord, chordsByNotes, createChordMapKey } from "$lib/chords";
import { getToaster } from "./toast";
import { intervals, keysMatch } from "../midi";

export type MidiHandler = (shortcut: MidiShortcut) => void;
export type Unsubscribe = () => void;
export interface Context {
  pressedKeys: Set<number>;
  onMidiShortcut: (fn: MidiHandler) => Unsubscribe;
  onChord: (chord: Chord, inversion: number | undefined, fn: () => void) => Unsubscribe;
}

const key = {};

export function initMidiContext() {
  const ctx = getContext(key);
  if (ctx === undefined) {
    const midiShortcutListeners = new Set<MidiHandler>();
    const chordListeners = new Set<{
      chord: Chord;
      inversion: number | undefined;
      fn: () => void;
    }>();

    const context: Context = {
      pressedKeys: new SvelteSet<number>(),
      onChord: (chord, inversion, fn) => {
        const val = { chord, inversion, fn };
        chordListeners.add(val);
        return () => chordListeners.delete(val);
      },
      onMidiShortcut: (fn) => {
        midiShortcutListeners.add(fn);
        return () => midiShortcutListeners.delete(fn);
      },
    };

    setContext(key, context);

    const pressedShortcuts = new Set<MidiShortcut>();
    $effect(() => {
      const chordKey = createChordMapKey(context.pressedKeys);

      // detect midi shortcuts on pressed keys
      Object.entries(MidiShortcuts).forEach(([shortcut, key]) => {
        if (chordKey === key) {
          pressedShortcuts.add(shortcut as MidiShortcut);
        }
      });

      chordListeners.forEach(({ chord, inversion, fn }) => {
        const chordPlayed = chordsByNotes.get(chordKey)?.includes(chord);
        if (inversion === undefined) {
          if (chordPlayed) {
            fn();
          }

          return;
        }

        // check for specific inversion
        const keyIntervals = intervals(Array.from(context.pressedKeys).sort((a, b) => a - b));
        const targetKeyIntervals = intervals(chord.inversion(inversion));
        if (keysMatch(keyIntervals, targetKeyIntervals)) {
          return fn();
        }
      });

      // fire listeners for midi shortcuts when all keys are released
      if (context.pressedKeys.size === 0) {
        const values = Array.from(pressedShortcuts.values());
        pressedShortcuts.clear();
        values.forEach((shortcut) => midiShortcutListeners.forEach((fn) => fn(shortcut)));
      }
    });

    // allow using keyboard for midi input in dev mode
    if (import.meta.env.DEV) enableKeyboardMidiInput(context);
  }
}

export function getMidiContext(): Context {
  return getContext(key);
}

export type MidiShortcut = keyof typeof MidiShortcuts;
export const MidiShortcuts = {
  skip: createChordMapKey([0, 1, 3]),
} as const;

function enableKeyboardMidiInput(context: Context) {
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
