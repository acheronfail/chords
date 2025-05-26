import { SvelteMap } from "svelte/reactivity";

type ChordKey = string;
interface Chord {
  notes: number[];
  name: string;
}

export const createKey = (notes: number[]): ChordKey => {
  return Array.from(new Set(notes.sort((a, b) => a - b))).join(",");
};

export const chords = new SvelteMap<ChordKey, Chord>();

const add = (chord: Chord) => {
  chords.set(createKey(chord.notes), chord);
};

const noteNames = ["C", "D♭", "D", "E♭", "E", "F", "G♭", "G", "A♭", "A", "B♭", "B"];
for (let root = 0; root < 12; root++) {
  const makeChord = (arr: number[]) => arr.map((n) => (n + root) % 12);

  add({ name: `${noteNames[root]} Augmented`, notes: makeChord([0, 4, 8]) });
  add({ name: `${noteNames[root]} Major`, notes: makeChord([0, 4, 7]) });
  add({ name: `${noteNames[root]} Minor`, notes: makeChord([0, 3, 7]) });
  add({ name: `${noteNames[root]} Diminished`, notes: makeChord([0, 3, 6]) });

  add({ name: `${noteNames[root]} 7`, notes: makeChord([0, 4, 7, 10]) });
  add({ name: `${noteNames[root]} Major 7`, notes: makeChord([0, 4, 7, 11]) });
  add({ name: `${noteNames[root]} Minor 7`, notes: makeChord([0, 3, 7, 10]) });
  add({ name: `${noteNames[root]} Augmented 7`, notes: makeChord([0, 4, 8, 11]) });
  add({ name: `${noteNames[root]} Diminished 7`, notes: makeChord([0, 3, 6, 9]) });
}
console.log(chords);
