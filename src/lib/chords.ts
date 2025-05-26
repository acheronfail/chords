import { SvelteMap } from "svelte/reactivity";

type ChordKey = string;

export const createKey = (notes: number[]): ChordKey => {
  return Array.from(new Set(notes.sort((a, b) => a - b))).join(",");
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
  Augmented7,
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
  [ChordKind.Augmented7]: ["Augmented 7", "aug7"],
};

class Chord {
  static noteNames = {
    flats: ["C", "D♭", "D", "E♭", "E", "F", "G♭", "G", "A♭", "A", "B♭", "B"],
    sharps: ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"],
  };

  constructor(
    private readonly root: number,
    public readonly notes: number[],
    private readonly kind: ChordKind,
  ) {}

  name({ sharps }: { sharps: boolean } = { sharps: false }): string {
    const names = sharps ? Chord.noteNames.sharps : Chord.noteNames.flats;
    return `${names[this.root]} ${ChordNames[this.kind][0]}`;
  }

  shortName({ sharps }: { sharps: boolean } = { sharps: false }): string {
    const names = sharps ? Chord.noteNames.sharps : Chord.noteNames.flats;
    return `${names[this.root]}${ChordNames[this.kind][1]}`;
  }
}

export const chords = new SvelteMap<ChordKey, Chord>();

const add = (chord: Chord) => {
  chords.set(createKey(chord.notes), chord);
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
}
