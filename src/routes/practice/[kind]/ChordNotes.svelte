<script lang="ts">
  import { EasyScore, Factory, System } from "vexflow";
  import { chordsByName, midiNumberToNoteName, type Chord } from "$lib/chords";
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
    const indices = [currentChordIndex];
    updateChord(
      indices.map((index) => {
        const notes = chordsToPlay[index].rootPosition();
        return notes.map((n) =>
          midiNumberToNoteName(n + 60, {
            sharps: chordOptions[index].sharps,
            withNumber: true,
            ascii: true,
          }),
        );
      }),
    );
  });

  // easy way for dark mode is to invert, but could look at
  // https://github.com/0xfe/vexflow/wiki/Coloring-&-Styling-Notes for more options
  //
  // see https://github.com/0xfe/vexflow/blob/master/tests/bach_tests.ts
  // for a good example of how to build bars
  let div: HTMLDivElement;

  function updateChord(chordNotes: string[][]) {
    const box = div.getBoundingClientRect();
    div.innerHTML = "";

    const factory = new Factory({ renderer: { elementId: div.id, width: box.width, height: 150 } });
    const system = factory.System({ width: box.width - box.left - 40 });
    const score = factory.EasyScore();
    score.set({ time: "2/4" });

    system
      .addStave({
        voices: chordNotes.map((notes) =>
          score.voice(score.notes(`(${notes.join(" ")})/2`, { stem: "up" })),
        ),
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
