<script lang="ts">
  import { Progress } from "@skeletonlabs/skeleton-svelte";

  import { getPressedKeys, isMidiShortcut } from "$lib/context-midi";
  import { Chord, chordsByNotes, createChordMapKey } from "$lib/chords";
  import { onMount } from "svelte";
  import LeadSheetSettings from "./PracticeSettings.svelte";
  import PianoRoll from "../../../lib/components/PianoRoll.svelte";
  import ChordSymbols from "./ChordSymbols.svelte";
  import { page } from "$app/state";
  import ChordNotes from "./ChordNotes.svelte";
  import { TriangleAlertIcon } from "@lucide/svelte";
  import { base } from "$app/paths";

  let pressedKeys = getPressedKeys();
  let chordsToPlay = $state<Chord[]>([]);
  let chordOptions = $derived(chordsToPlay.map(() => ({ sharps: Math.random() < 0.5 })));

  type Result = "missed" | "correct" | undefined;
  let chordResults = $state<Result[]>([]);
  let currentChordIndex = $state(0);
  let settingsOpen = $state(true);
  let showPianoRoll = $state(false);
  let showPianoRollNotes = $state(true);

  let chordKey = $derived(createChordMapKey(pressedKeys));
  let possibleChords = $derived(chordsByNotes.get(chordKey));
  let chordMatches = $derived(
    possibleChords?.includes(chordsToPlay[currentChordIndex]) ??
      (pressedKeys.size > 0 ? false : undefined),
  );

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
      next();
    }
  });

  // check if timed out
  $effect(() => {
    if (timerDuration !== null && timerElapsed >= timerDuration) {
      chordResults[currentChordIndex] = "missed";
    }
  });

  // check if able to go next
  let ableToGoNext = $state(false);
  $effect(() => {
    if (chordResults[currentChordIndex] === "missed" && chordMatches) {
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
  <LeadSheetSettings bind:chordsToPlay bind:timerDuration bind:showPianoRoll {onStart} />
{:else}
  <div class="flex flex-col gap-4">
    {#if page.params.kind === "symbols"}
      <ChordSymbols {currentChordIndex} {chordsToPlay} {chordResults} {chordOptions} />
    {:else if page.params.kind === "notes"}
      <ChordNotes {currentChordIndex} {chordsToPlay} {chordResults} {chordOptions} />
    {:else}
      <div class="p-4">
        <div
          class="card preset-outlined-error-500 grid grid-cols-1 items-center gap-4 p-4 lg:grid-cols-[auto_1fr_auto]"
        >
          <TriangleAlertIcon />
          <div>
            <p class="font-bold">Something went wrong!</p>
            <p class="text-xs opacity-60">
              Try going back to <a class="text-primary-500 underline" href={base}>the homepage</a>?
            </p>
          </div>
        </div>
      </div>
    {/if}

    <div class="flex items-center justify-center">
      {#if chordResults[currentChordIndex] === "missed"}
        Ahh, better luck next time! Play the chord to continue.
      {:else if currentChordIndex === chordsToPlay.length}
        Complete!
      {:else}
        Play this chord...
      {/if}
    </div>

    <div class="m-auto flex w-2/3 flex-col gap-4 p-8 text-center">
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

      <div class="flex flex-row items-center justify-center gap-2 text-xs">
        <span class="text-success-500">
          {Array.from(chordResults.values().filter((x) => x === "correct")).length} correct
        </span>
        <span class="text-surface-500">|</span>
        <span class="text-error-500">
          {Array.from(chordResults.values().filter((x) => x === "missed")).length} missed
        </span>
      </div>
    </div>

    {#if showPianoRoll || (chordResults[currentChordIndex] === "missed" && chordsToPlay[currentChordIndex])}
      <PianoRoll
        showSharps={chordOptions[currentChordIndex]?.sharps}
        showNames={showPianoRollNotes}
        highlightedKeys={new Set(chordsToPlay[currentChordIndex].rootPosition())}
        pressedKeys={new Set(pressedKeys.values().map((x) => x % 24))}
        minKey={0}
        maxKey={24}
      />
    {/if}
  </div>
{/if}
