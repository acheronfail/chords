<script lang="ts">
  import { EasyScore, Factory, System } from "vexflow";
  import { midiNumberToNoteName, type Chord } from "$lib/chords";
  import type { ChordOptions, Result } from "./types";

  // TODO: support bass clef
  // TODO: support key signatures (`stave.setKeySignature`; but will have to adjust
  // the note names to be in the right key)

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

  $effect(() => {
    const notes = chordsToPlay[currentChordIndex].firstInversion();
    const noteNames = notes.map((n) =>
      midiNumberToNoteName(n + 60, {
        sharps: chordOptions[currentChordIndex].sharps,
        withNumber: true,
        ascii: true,
      }),
    );
    updateChord(noteNames);
  });

  // easy way for dark mode is to invert, but could look at
  // https://github.com/0xfe/vexflow/wiki/Coloring-&-Styling-Notes for more options
  //
  // see https://github.com/0xfe/vexflow/blob/master/tests/bach_tests.ts
  // for a good example of how to build bars
  let div: HTMLDivElement;
  let f: Factory;
  let sys: System;
  let score: EasyScore;

  function updateChord(noteNames: string[]) {
    const box = div.getBoundingClientRect();

    f = new Factory({ renderer: { elementId: div.id, width: box.width, height: 150 } });
    sys = f.System({ width: box.width - box.left - 40 });
    score = f.EasyScore();
    score.set({ time: "2/4" });

    sys
      .addStave({
        voices: [score.voice(score.notes(`(${noteNames.join(" ")})/2`, { stem: "up" }))],
      })
      .addClef("treble");

    sys.addConnector("singleRight");
    sys.addConnector("singleLeft");

    f.draw();
  }
</script>

<div class="relative p-4">
  <div
    class=" card preset-filled-surface-900-100 border-surface-200 w-full border p-[16px] invert"
    id="staff"
    bind:this={div}
  ></div>
</div>
