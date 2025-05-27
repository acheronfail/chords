<script lang="ts">
  import { Progress } from "@skeletonlabs/skeleton-svelte";
  import autoAnimate from "@formkit/auto-animate";

  import { getPressedKeys } from "$lib/context-midi";
  import { chordsByNotes, createChordKey } from "$lib/chords";

  // TODO: line with chord symbols; make them turn green as you do them and move along
  // TODO: progress bar ?
  // TODO: fun effects ?
  // TODO: score ?
  // TODO: settings for the quiz? (how hard, which key, which chord types, etc.)

  let pressedKeys = getPressedKeys();

  let selectedChord = $state("C Major");

  let chordKey = $derived(createChordKey(pressedKeys));
  let possibleChords = $derived(chordsByNotes.get(chordKey));
  let chordMatches = $derived(
    possibleChords?.map((chord) => chord.name())?.includes(selectedChord) ??
      (pressedKeys.size > 0 ? false : undefined),
  );

  // TODO: generate
  const chordsToPlay = ["C Major", "G Major", "C Major", "G Major", "C Major", "G Major"];
  let currentChordIndex = $state(0);

  let current = $derived<number[]>([
    currentChordIndex - 1,
    currentChordIndex,
    currentChordIndex + 1,
  ]);
</script>

<div
  use:autoAnimate={{ duration: 100 }}
  class="m-auto flex w-2/3 flex-row items-center justify-between gap-10"
>
  {#each current as index (index)}
    <div class="min-w-[10em] border text-center">
      {#if chordsToPlay[index]}
        {chordsToPlay[index]}: {index}
      {/if}
    </div>
  {/each}
</div>

<div class="p- m-auto w-2/3 p-8 text-center">
  <Progress value={currentChordIndex} max={chordsToPlay.length} meterBg="bg-primary-500">
    {((currentChordIndex / chordsToPlay.length) * 100).toFixed(0)}%
  </Progress>
  <p>
    Are you playing {selectedChord}?: {chordMatches}
  </p>
  <button
    class="btn preset-outlined"
    onclick={() => (currentChordIndex = Math.max(0, currentChordIndex - 1))}
  >
    prev
  </button>
  <button
    class="btn preset-outlined"
    onclick={() => (currentChordIndex = Math.min(chordsToPlay.length, currentChordIndex + 1))}
  >
    next
  </button>
</div>
