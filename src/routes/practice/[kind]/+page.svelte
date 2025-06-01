<script lang="ts">
  import { Progress } from "@skeletonlabs/skeleton-svelte";

  import { getPressedKeys, isMidiShortcut } from "$lib/context/midi";
  import { Chord, chordsByNotes, createChordMapKey } from "$lib/chords";
  import { onMount } from "svelte";
  import LeadSheetSettings from "./PracticeSettings.svelte";
  import PianoRoll from "../../../lib/components/PianoRoll.svelte";
  import ChordSymbols from "./ChordSymbols.svelte";
  import { page } from "$app/state";
  import ChordNotes from "./ChordNotes.svelte";
  import { TriangleAlertIcon } from "@lucide/svelte";
  import { base } from "$app/paths";
  import type { ChordOptions, Result } from "./common";
  import { settings } from "../../../lib/svelte/stores.svelte";

  let pressedKeys = getPressedKeys();
  let chordsToPlay = $state<Chord[]>([]);

  let chordResults = $state<Result[]>([]);
  let currentChordIndex = $state(0);
  let settingsOpen = $state(true);

  let chordKey = $derived(createChordMapKey(pressedKeys));
  let possibleChords = $derived(chordsByNotes.get(chordKey));
  let chordOptions = $derived<ChordOptions[]>(
    chordsToPlay.map((chord) => ({
      sharps: Math.random() < 0.5,
      inversion:
        page.params.kind === "notes" && settings.current.practice.randomInversions
          ? Math.floor(Math.random() * chord.intervals().length)
          : undefined,
    })),
  );

  function intervals(keys: number[]) {
    const min = Math.min(...keys);
    return keys.map((n) => n - min);
  }

  function keysMatch(a: number[], b: number[]) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) return false;
    }

    return true;
  }

  let chordMatches = $derived.by(() => {
    const currentChord = chordsToPlay[currentChordIndex];
    const options = chordOptions[currentChordIndex];
    const chordPlayed = possibleChords?.includes(currentChord);

    // verify inversions
    if (chordPlayed && options?.inversion !== undefined) {
      const keyIntervals = intervals(Array.from(pressedKeys.values()).sort());
      const targetKeyIntervals = intervals(currentChord.inversion(options.inversion));

      return keysMatch(keyIntervals, targetKeyIntervals);
    }

    return chordPlayed ?? false;
  });

  let frame: number;
  let timerElapsed = $state(0);
  let timerStopped = $state(true);
  let timerDuration = $derived(settings.current.practice.timerDuration);
  const startTimer = () => {
    let last_time = performance.now();

    frame = requestAnimationFrame(function update(time) {
      frame = requestAnimationFrame(update);

      if (!timerStopped) {
        timerElapsed += Math.min(time - last_time, timerDuration - timerElapsed);
      }
      last_time = time;
    });
  };

  onMount(() => () => cancelAnimationFrame(frame));

  const nextChord = () => {
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
      nextChord();
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
      nextChord();
    }
  });

  // check if complete
  $effect(() => {
    if (!settingsOpen && currentChordIndex === chordsToPlay.length) {
      // TODO: pop up modal or something with stats
      console.log("complete!");
      timerStopped = true;
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
      nextChord();
    }
  });

  const onStart = () => {
    timerStopped = false;
    settingsOpen = false;
    if (settings.current.practice.timerEnabled) {
      startTimer();
    }
  };
</script>

{#if settingsOpen}
  <LeadSheetSettings bind:chordsToPlay onSubmit={onStart} />
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
        <span class="font-bold">Play this chord...</span>
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

    {#if settings.current.practice.showPianoRoll || (chordResults[currentChordIndex] === "missed" && chordsToPlay[currentChordIndex])}
      {@const options = chordOptions[currentChordIndex]}
      <PianoRoll
        showSharps={options?.sharps}
        showNames={settings.current.practice.showPianoRollNotes}
        highlightedKeys={new Set(
          chordsToPlay[currentChordIndex].inversion(options?.inversion ?? 0),
        )}
        pressedKeys={new Set(pressedKeys.values().map((x) => x % 24))}
        minKey={0}
        maxKey={24}
      />
    {/if}
  </div>
{/if}
