<script lang="ts">
  import { Progress } from "@skeletonlabs/skeleton-svelte";
  import autoAnimate from "@formkit/auto-animate";

  import { getPressedKeys, isMidiShortcut } from "$lib/context-midi";
  import { ChordKind, chordsByKind, chordsByNotes, createChordKey } from "$lib/chords";
  import { shuffle } from "$lib/array";

  // TODO: generate according to settings
  const chordsToPlay = shuffle(chordsByKind(ChordKind.Major));

  let pressedKeys = getPressedKeys();

  type Result = "missed" | "correct" | undefined;
  let chordResults = $state<Result[]>(new Array(chordsToPlay.length));
  let currentChordIndex = $state(0);

  let chordKey = $derived(createChordKey(pressedKeys));
  let possibleChords = $derived(chordsByNotes.get(chordKey));
  let chordMatches = $derived(
    possibleChords?.includes(chordsToPlay[currentChordIndex]) ??
      (pressedKeys.size > 0 ? false : undefined),
  );
  let allKeysOff = $derived(pressedKeys.size === 0);

  let carouselItems = $derived<number[]>([
    currentChordIndex - 1,
    currentChordIndex,
    currentChordIndex + 1,
  ]);

  // used to make sure we don't transition too quickly...
  let transitionCounter = $state(0);

  const next = () => (currentChordIndex = Math.min(chordsToPlay.length, currentChordIndex + 1));

  // check if chord matches
  $effect(() => {
    if (chordMatches) {
      chordResults[currentChordIndex] = "correct";
    }
  });

  // check if able to go next
  let ableToGoNext = $state(false);
  $effect(() => {
    if (chordResults[currentChordIndex] === "correct" && allKeysOff) {
      ableToGoNext = true;
    }
  });

  // go next
  $effect(() => {
    if (ableToGoNext && pressedKeys.size !== 0) {
      ableToGoNext = false;
      next();
    }
  });

  // check if complete
  $effect(() => {
    if (currentChordIndex === chordsToPlay.length) {
      // TODO: pop up modal or something with stats
      console.log("complete!");
    }
  });

  // check for skip
  let skip = $state(false);
  $effect(() => {
    if (isMidiShortcut("skip")) {
      skip = true;
    }
    if (skip && pressedKeys.size === 0) {
      skip = false;
      next();
    }
  });
</script>

<div class="flex flex-col gap-4">
  <div
    use:autoAnimate={{ duration: 100 }}
    ontransitionstart={() => transitionCounter++}
    ontransitionend={() => transitionCounter--}
    class="m-auto flex h-[200px] w-2/3 flex-row items-center justify-between gap-10"
  >
    {#each carouselItems as index (index)}
      <div class="min-w-[10em] text-center">
        <div
          class="flex items-center justify-center whitespace-nowrap transition-all duration-100"
          class:text-success-500={chordResults[index] === "correct"}
          class:text-surface-500={index > currentChordIndex}
          class:text-4xl={index === currentChordIndex}
        >
          {#if chordsToPlay[index]}
            {chordsToPlay[index].shortName()}
          {:else if index === chordsToPlay.length}
            🎉
          {/if}
        </div>
      </div>
    {/each}
  </div>

  <div class="flex items-center justify-center">
    {#if chordResults[currentChordIndex] === "correct"}
      Nice work! Press any note to continue!
    {:else}
      Play this chord...
    {/if}
  </div>

  <div class="p- m-auto w-2/3 p-8 text-center">
    <Progress value={currentChordIndex} max={chordsToPlay.length} meterBg="bg-primary-500">
      {((currentChordIndex / chordsToPlay.length) * 100).toFixed(0)}%
    </Progress>
  </div>
</div>
