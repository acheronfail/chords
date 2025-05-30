<script lang="ts">
  import autoAnimate from "@formkit/auto-animate";
  import type { Chord } from "$lib/chords";
  import type { ChordOptions, Result } from "./common";

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

  let carouselItems = $derived<number[]>([
    currentChordIndex - 1,
    currentChordIndex,
    currentChordIndex + 1,
  ]);

  // used to make sure we don't transition too quickly...
  let transitionCounter = $state(0);
</script>

<div
  use:autoAnimate={{ duration: 100 }}
  ontransitionstart={() => transitionCounter++}
  ontransitionend={() => transitionCounter--}
  class="m-auto flex h-[200px] w-2/3 flex-row items-center justify-between gap-10"
>
  {#each carouselItems as index (index)}
    <div class="min-w-[10em] text-center">
      <div
        class="flex items-center justify-center font-bold whitespace-nowrap transition-all duration-100"
        class:text-error-500={chordResults[index] === "missed"}
        class:text-success-500={chordResults[index] === "correct"}
        class:text-surface-500={index > currentChordIndex}
        class:text-4xl={index === currentChordIndex}
      >
        {#if chordsToPlay[index]}
          {chordsToPlay[index].shortName({ sharps: chordOptions[index].sharps })}
        {:else if index === chordsToPlay.length}
          🎉
        {/if}
      </div>
    </div>
  {/each}
</div>
