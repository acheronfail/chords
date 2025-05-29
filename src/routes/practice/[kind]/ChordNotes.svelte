<script lang="ts">
  import { EasyScore, Factory, System } from "vexflow";
  import {
    chordsByName,
    isMidiNumberBlackNote,
    midiNumberToNoteName,
    type Chord,
  } from "$lib/chords";
  import type { ChordOptions, Result } from "./types";

  let {
    currentChordIndex,
    chordsToPlay,
    chordResults,
    chordOptions,
  }: {
    currentChordIndex: number;
    chordsToPlay: Chord[];
    chordResults: Result[];
    chordOptions: ChordOptions[];
  } = $props();

  // TODO: show upcoming (and past) chords
  $effect(() => {
    renderMusic([currentChordIndex - 1, currentChordIndex, currentChordIndex + 1]);
  });

  // easy way for dark mode is to invert, but could look at
  // https://github.com/0xfe/vexflow/wiki/Coloring-&-Styling-Notes for more options
  //
  // see https://github.com/0xfe/vexflow/blob/master/tests/bach_tests.ts
  // for a good example of how to build bars
  let div: HTMLDivElement;

  const makeTransparent = (cssStyle: string, pct: number) =>
    `color-mix(in srgb, ${cssStyle} ${pct}%, transparent)`;
  const connectorStyle = { fillStyle: "var(--color-surface-300)" };
  const staveStyle = {
    fillStyle: makeTransparent("var(--color-surface-50)", 70),
    strokeStyle: makeTransparent("var(--color-surface-300)", 70),
  };

  const noteStyle = (index: number) => {
    const result = chordResults[index];

    let style = "var(--color-surface-50)";
    if (result === "correct") {
      style = "var(--color-success-100)";
    }
    if (result === "missed") {
      style = "var(--color-error-500)";
    }
    if (index === currentChordIndex && !result) {
      style = "var(--color-secondary-300)";
    }

    if (index !== currentChordIndex) {
      style = makeTransparent(style, 50);
    }

    return { fillStyle: style, strokeStyle: style };
  };

  function renderMusic(indices: number[]) {
    const box = div.getBoundingClientRect();
    div.innerHTML = "";

    const factory = new Factory({ renderer: { elementId: div.id, width: box.width, height: 150 } });
    const system = factory.System({ width: box.width - box.left - 40 });
    const score = factory.EasyScore();

    // set time signature to allow enough space for all chords in bar
    const noteDuration = 4;
    const totalChords = indices.length;
    const timeSpec = `${totalChords}/${noteDuration}`;
    score.set({ time: timeSpec });

    const chordNotes = indices.map((index) => {
      if (!chordsToPlay[index]) {
        return null;
      }

      const chord = chordsToPlay[index];
      // HACK: a work around for making sure we don't generate invalid note names.
      // This doesn't work for every case (and should fix this properly)...
      const has11Interval = chord.intervals().includes(11);
      return chord.inversion(0).map((n) =>
        midiNumberToNoteName(n + 60, {
          sharps: has11Interval ? !isMidiNumberBlackNote(chord.root) : chordOptions[index].sharps,
          withNumber: true,
          ascii: true,
        }),
      );
    });

    const noteSpec = chordNotes
      .map((notes) => (notes ? `(${notes.join(" ")})/${noteDuration}` : `B4/${noteDuration}/r`))
      .join(", ");

    console.log({ noteSpec, timeSpec });

    // create notes
    const notes = score.notes(noteSpec, { stem: "up" });
    notes.forEach((note, i) => note.setStyle(noteStyle(indices[i])));

    // create the stave
    const stave = system.addStave({ voices: [score.voice(notes)] }).addClef("treble");
    stave.setStyle(staveStyle);
    stave.setDefaultLedgerLineStyle(staveStyle);

    // close off either side of the bar
    system.addConnector("singleRight").setStyle(connectorStyle);
    system.addConnector("singleLeft").setStyle(connectorStyle);

    factory.draw();
  }
</script>

<div class="relative p-4">
  <div
    class=" card preset-filled-surface-100-900 border-surface-700 w-full border p-[16px]"
    id="staff"
    bind:this={div}
  ></div>
</div>
