<script lang="ts">
  import { EasyScore, Factory, System } from "vexflow";
  import { midiNumberToNoteName, type Chord } from "$lib/chords";
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

  function updateChord(noteNames: string[]) {
    const box = div.getBoundingClientRect();
    div.innerHTML = "";

    const factory = new Factory({ renderer: { elementId: div.id, width: box.width, height: 150 } });
    const system = factory.System({ width: box.width - box.left - 40 });
    const score = factory.EasyScore();
    score.set({ time: "2/4" });

    system
      .addStave({
        voices: [score.voice(score.notes(`(${noteNames.join(" ")})/2`, { stem: "up" }))],
      })
      .addClef("treble");

    system.addConnector("singleRight");
    system.addConnector("singleLeft");

    factory.draw();
  }
</script>

<div class="relative p-4">
  <div
    class=" card preset-filled-surface-900-100 border-surface-200 w-full border p-[16px] invert"
    id="staff"
    bind:this={div}
  ></div>
</div>
