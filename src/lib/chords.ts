import { SvelteMap } from "svelte/reactivity";

type ChordNotesKey = string;

export const createChordMapKey = (notes: Iterable<number>): ChordNotesKey => {
  return Array.from(
    new Set(
      Array.from(notes)
        .map((n) => n % 12)
        .sort((a, b) => a - b),
    ),
  ).join(",");
};

export enum ChordKind {
  Major,
  Minor,
  Diminished,
  Augmented,
  Dominant7,
  Major7,
  Minor7,
  Diminished7,
  HalfDiminished7,
  Augmented7,
  Major6,
}

export const ChordNames: Record<ChordKind, [string, string]> = {
  [ChordKind.Major]: ["Major", ""],
  [ChordKind.Minor]: ["Minor", "m"],
  [ChordKind.Diminished]: ["Diminished", "dim"],
  [ChordKind.Augmented]: ["Augmented", "aug"],
  [ChordKind.Dominant7]: ["Dominant 7", "7"],
  [ChordKind.Major7]: ["Major 7", "maj7"],
  [ChordKind.Minor7]: ["Minor 7", "m7"],
  [ChordKind.Diminished7]: ["Diminished 7", "dim7"],
  [ChordKind.HalfDiminished7]: ["Half Diminished 7", "-7"],
  [ChordKind.Augmented7]: ["Augmented 7", "aug7"],
  [ChordKind.Major6]: ["Major 6", "6"],
};

const NOTE_NAMES = {
  flats: ["C", "D♭", "D", "E♭", "E", "F", "G♭", "G", "A♭", "A", "B♭", "B"],
  sharps: ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"],
};

export interface NoteNameOptions {
  sharps?: boolean;
  withNumber?: boolean;
  ascii?: boolean;
}

export function isMidiNumberBlackNote(n: number): boolean {
  const offset = n % 12;
  return (offset + (offset >= 5 ? 1 : 0)) % 2 === 1;
}

export function midiNumberToNoteName(
  n: number,
  { ascii, sharps, withNumber }: NoteNameOptions = {},
): string {
  if (n < 0 || n > 127) {
    return "?";
  }

  const names = sharps ? NOTE_NAMES.sharps : NOTE_NAMES.flats;
  let noteName = names[n % 12];
  if (ascii) {
    noteName = noteName.replace("♭", "b").replace("♯", "#");
  }

  if (!withNumber) {
    return noteName;
  }

  const number = Math.floor(n / 12) - 1; // MIDI note numbers start at C-1 (MIDI number 0)
  return `${noteName}${number}`;
}

export class Chord {
  constructor(
    public readonly root: number,
    private readonly notes: number[],
    public readonly kind: ChordKind,
  ) {}

  private getNoteNames({ sharps }: NoteNameOptions = { sharps: false }): string[] {
    // HACK: a work around for making sure we don't generate invalid note names.
    // This doesn't work for every case (and should fix this properly)...
    if (this.intervals().includes(11)) {
      return isMidiNumberBlackNote(this.root) ? NOTE_NAMES.flats : NOTE_NAMES.sharps;
    }

    return sharps ? NOTE_NAMES.sharps : NOTE_NAMES.flats;
  }

  /** Long name of chord */
  name(options?: NoteNameOptions): string {
    return `${this.getNoteNames(options)[this.root]} ${ChordNames[this.kind][0]}`;
  }

  /** short name of chord */
  shortName(options?: NoteNameOptions): string {
    return `${this.getNoteNames(options)[this.root]}${ChordNames[this.kind][1]}`;
  }

  /** list of intervals starting from root */
  intervals(): number[] {
    return this.rootPosition().map((n) => n - this.root);
  }

  /** note numbers in root position (starting from first octave) */
  rootPosition(): number[] {
    return this.notes.slice();
  }
}

export const chordsByName = new SvelteMap<string, Chord>();
export const chordsByNotes = new SvelteMap<ChordNotesKey, Chord[]>();

export function chordsByKinds(kinds: Iterable<ChordKind>): Chord[] {
  const all = Array.from(kinds);
  return Array.from(chordsByName.values()).filter((chord) => all.includes(chord.kind));
}

const add = (chord: Chord) => {
  const mapKey = createChordMapKey(chord.rootPosition());

  chordsByName.set(chord.name(), chord);
  const bucket =
    chordsByNotes.get(mapKey) ??
    (() => {
      const bucket: Chord[] = [];
      chordsByNotes.set(mapKey, bucket);
      return bucket;
    })();
  bucket.push(chord);
};

for (let root = 0; root < 12; root++) {
  const makeChord = (arr: number[]) => arr.map((n) => n + root);

  add(new Chord(root, makeChord([0, 4, 8]), ChordKind.Augmented));
  add(new Chord(root, makeChord([0, 4, 7]), ChordKind.Major));
  add(new Chord(root, makeChord([0, 3, 7]), ChordKind.Minor));
  add(new Chord(root, makeChord([0, 3, 6]), ChordKind.Diminished));

  add(new Chord(root, makeChord([0, 4, 7, 10]), ChordKind.Dominant7));
  add(new Chord(root, makeChord([0, 4, 7, 11]), ChordKind.Major7));
  add(new Chord(root, makeChord([0, 3, 7, 10]), ChordKind.Minor7));
  add(new Chord(root, makeChord([0, 4, 8, 11]), ChordKind.Augmented7));
  add(new Chord(root, makeChord([0, 3, 6, 9]), ChordKind.Diminished7));
  add(new Chord(root, makeChord([0, 3, 6, 10]), ChordKind.HalfDiminished7));

  add(new Chord(root, makeChord([0, 4, 7, 9]), ChordKind.Major6));
}
