<script lang="ts">
  import { Progress } from "@skeletonlabs/skeleton-svelte";
  import autoAnimate from "@formkit/auto-animate";

  import { getPressedKeys, isMidiShortcut } from "$lib/context-midi";
  import { Chord, chordsByNotes, createChordKey } from "$lib/chords";
  import { onMount } from "svelte";
  import LeadSheetSettings from "./LeadSheetSettings.svelte";
  import PianoRoll from "../../lib/components/PianoRoll.svelte";

  let pressedKeys = getPressedKeys();
  let chordsToPlay = $state<Chord[]>([]);
  let autoContinue = $state(false);

  type Result = "missed" | "correct" | undefined;
  let chordResults = $state<Result[]>([]);
  let currentChordIndex = $state(0);
  let settingsOpen = $state(true);
  let showPianoRoll = $state(true);

  let chordKey = $derived(createChordKey(pressedKeys));
  let possibleChords = $derived(chordsByNotes.get(chordKey));
  let chordMatches = $derived(
    possibleChords?.includes(chordsToPlay[currentChordIndex]) ??
      (pressedKeys.size > 0 ? false : undefined),
  );
  let allKeysOff = $derived(pressedKeys.size === 0);

  let timerElapsed = $state(0);
  let timerDuration = $state<number | null>(5_000);
  let timerStopped = $state(true);
  onMount(() => {
    let last_time = performance.now();

    let frame = requestAnimationFrame(function update(time) {
      if (timerDuration === null) {
        return;
      }

      frame = requestAnimationFrame(update);

      if (!timerStopped) {
        timerElapsed += Math.min(time - last_time, timerDuration - timerElapsed);
      }
      last_time = time;
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  });

  let carouselItems = $derived<number[]>([
    currentChordIndex - 1,
    currentChordIndex,
    currentChordIndex + 1,
  ]);

  // used to make sure we don't transition too quickly...
  let transitionCounter = $state(0);

  const next = () => {
    currentChordIndex = Math.min(chordsToPlay.length, currentChordIndex + 1);
    timerElapsed = 0;
    timerStopped = currentChordIndex === chordsToPlay.length;
  };

  // check if chord matches
  $effect(() => {
    if (chordResults[currentChordIndex] === undefined && chordMatches) {
      chordResults[currentChordIndex] = "correct";
      timerElapsed = 0;
      timerStopped = true;
      if (autoContinue) {
        next();
      }
    }
  });

  // check if timed out
  $effect(() => {
    if (timerDuration !== null && timerElapsed >= timerDuration) {
      chordResults[currentChordIndex] = "missed";
      if (autoContinue) {
        next();
      }
    }
  });

  // check if able to go next
  let ableToGoNext = $state(false);
  $effect(() => {
    if (chordResults[currentChordIndex] === "correct" && allKeysOff) {
      ableToGoNext = true;
    } else if (chordResults[currentChordIndex] === "missed" && chordMatches) {
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
    if (!settingsOpen && currentChordIndex === chordsToPlay.length) {
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

  const onStart = () => {
    timerStopped = false;
    settingsOpen = false;
  };
</script>

{#if settingsOpen}
  <LeadSheetSettings
    bind:chordsToPlay
    bind:autoContinue
    bind:timerDuration
    bind:showPianoRoll
    {onStart}
  />
{:else}
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
            class="flex items-center justify-center font-bold whitespace-nowrap transition-all duration-100"
            class:text-error-500={chordResults[index] === "missed"}
            class:text-success-500={chordResults[index] === "correct"}
            class:text-surface-500={index > currentChordIndex}
            class:text-4xl={index === currentChordIndex}
          >
            {#if chordsToPlay[index]}
              {chordsToPlay[index].shortName({ sharps: Math.random() < 0.5 })}
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
      {:else if chordResults[currentChordIndex] === "missed"}
        Ahh, better luck next time! Play the chord to continue.
      {:else if currentChordIndex === chordsToPlay.length}
        Complete!
      {:else}
        Play this chord...
      {/if}
    </div>

    <div class="m-auto flex w-2/3 flex-col gap-4 p-8 text-center">
      <div>
        <span class="text-success-500">
          {Array.from(chordResults.values().filter((x) => x === "correct")).length}
        </span>
        <span class="text-surface-500">
          / {chordsToPlay.length}
        </span>
      </div>

      {#if timerDuration !== null}
        <label class="label flex flex-row items-center gap-2 whitespace-nowrap">
          Time remaining:
          <progress
            class="progress [&::-webkit-progress-value]:bg-error-500 [&::-moz-progress-bar]:bg-error-500"
            value={timerStopped ? 0 : timerDuration - timerElapsed}
            max={timerDuration}
          ></progress>
        </label>
      {/if}

      <Progress
        value={currentChordIndex}
        max={chordsToPlay.length}
        meterBg={currentChordIndex === chordsToPlay.length ? "bg-success-500" : "bg-primary-500"}
      >
        Progress: {((currentChordIndex / chordsToPlay.length) * 100).toFixed(0)}%
      </Progress>
    </div>

    {#if showPianoRoll || (chordResults[currentChordIndex] === "missed" && chordsToPlay[currentChordIndex])}
      <PianoRoll
        highlightedKeys={new Set(chordsToPlay[currentChordIndex].firstInversion())}
        pressedKeys={new Set(pressedKeys.values().map((x) => x % 24))}
        minKey={0}
        maxKey={24}
      />
    {/if}
  </div>
{/if}
