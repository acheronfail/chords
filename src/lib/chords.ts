import { SvelteMap } from "svelte/reactivity";

type ChordNotesKey = string;

export const createChordKey = (notes: Iterable<number>): ChordNotesKey => {
  return Array.from(
    new Set(
      Array.from(notes)
        .map((n) => n % 12)
        .sort((a, b) => a - b),
    ),
  ).join(",");
};

enum ChordKind {
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
const ChordNames: Record<ChordKind, [string, string]> = {
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
}

export function midiNumberToNoteName(
  n: number,
  { sharps }: NoteNameOptions = { sharps: false },
): string {
  if (n < 0 || n > 127) {
    return "?";
  }

  const names = sharps ? NOTE_NAMES.sharps : NOTE_NAMES.flats;
  const note = names[n % 12];
  const number = Math.floor(n / 12) - 1; // MIDI note numbers start at C-1 (MIDI number 0)
  return `${note}${number}`;
}

class Chord {
  constructor(
    private readonly root: number,
    public readonly notes: number[],
    private readonly kind: ChordKind,
  ) {}

  name({ sharps }: NoteNameOptions = { sharps: false }): string {
    const names = sharps ? NOTE_NAMES.sharps : NOTE_NAMES.flats;
    return `${names[this.root]} ${ChordNames[this.kind][0]}`;
  }

  shortName({ sharps }: NoteNameOptions = { sharps: false }): string {
    const names = sharps ? NOTE_NAMES.sharps : NOTE_NAMES.flats;
    return `${names[this.root]}${ChordNames[this.kind][1]}`;
  }
}

export const chordsByName = new SvelteMap<string, Chord>();
export const chordsByNotes = new SvelteMap<ChordNotesKey, Chord[]>();

const add = (chord: Chord) => {
  chordsByName.set(chord.name(), chord);
  const bucket =
    chordsByNotes.get(createChordKey(chord.notes)) ??
    (() => {
      const bucket: Chord[] = [];
      chordsByNotes.set(createChordKey(chord.notes), bucket);
      return bucket;
    })();
  bucket.push(chord);
};

// FIXME: augmented chorts collide - CAug == AbAug
for (let root = 0; root < 12; root++) {
  const makeChord = (arr: number[]) => arr.map((n) => (n + root) % 12);

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
