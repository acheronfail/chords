<script lang="ts">
  import { onMount, untrack } from "svelte";
  import { TriangleAlertIcon } from "@lucide/svelte";
  import { Progress } from "@skeletonlabs/skeleton-svelte";
  import { base } from "$app/paths";
  import { page } from "$app/state";

  import { getMidiContext } from "$lib/context/midi.svelte";
  import { Chord, chordsByNotes, createChordMapKey } from "$lib/chords";
  import { settings, user } from "$lib/svelte/stores.svelte";
  import PianoRoll from "$lib/components/PianoRoll.svelte";

  import LeadSheetSettings from "./PracticeSettings.svelte";
  import ChordSymbols from "./ChordSymbols.svelte";
  import ChordNotes from "./ChordNotes.svelte";
  import type { ChordOptions, Result } from "./common";
  import { getLocalTimeZone, today } from "@internationalized/date";

  let { pressedKeys, onMidiShortcut, onChord } = getMidiContext();

  let chordsToPlay = $state<Chord[]>([]);
  let chordResults = $state<Result[]>([]);
  let currentChordIndex = $state(0);
  let settingsOpen = $state(true);

  let chordOptions = $derived<ChordOptions[]>(
    chordsToPlay.map((chord) =>
      untrack(() => ({
        sharps: Math.random() < 0.5,
        inversion:
          page.params.kind === "notes" && settings.current.practice.randomInversions
            ? Math.floor(Math.random() * chord.intervals().length)
            : undefined,
      })),
    ),
  );

  // TODO: rather than a timer, keep track of time and apply a score (logarithmic)
  // which increases the shorter time between notes? set this as the score?
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

  const cleanUpMidiHandler = onMidiShortcut((shortcut) => {
    if (import.meta.env.DEV && shortcut === "skip") {
      nextChord();
    }
  });

  onMount(() => () => {
    cancelAnimationFrame(frame);
    cleanUpMidiHandler();
  });

  const nextChord = () => {
    currentChordIndex = Math.min(chordsToPlay.length, currentChordIndex + 1);
    timerElapsed = 0;
    timerStopped = currentChordIndex === chordsToPlay.length;
  };

  $effect(() => {
    const idx = currentChordIndex;
    const removeListener = onChord(chordsToPlay[idx], chordOptions[idx]?.inversion, () => {
      if (chordResults[idx] === undefined) {
        chordResults[idx] = "correct";
      }

      nextChord();
    });

    return () => removeListener();
  });

  // check if timed out
  $effect(() => {
    if (timerDuration !== null && timerElapsed >= timerDuration) {
      chordResults[currentChordIndex] = "missed";
    }
  });

  // check if complete
  $effect(() => {
    if (!settingsOpen && currentChordIndex === chordsToPlay.length) {
      // TODO: pop up modal or something with stats
      console.log("complete!");
      // TODO: convert to/from set somewhere to avoid duplicates
      const date = today(getLocalTimeZone()).toString();
      if (!user.current.daysPracticed.includes(date)) {
        user.current.daysPracticed.push(date);
      }

      timerStopped = true;
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
  <div class="relative flex h-full max-h-full flex-col justify-between gap-4">
    <div class="max-h-full min-h-0 max-w-full min-w-0">
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
                Try going back to <a class="text-primary-500 underline" href={base}>the homepage</a
                >?
              </p>
            </div>
          </div>
        </div>
      {/if}
    </div>

    <div class="m-auto flex w-2/3 flex-col gap-4 p-8 text-center">
      <div class="flex items-center justify-center">
        {#if chordResults[currentChordIndex] === "missed"}
          Ahh, better luck next time! Play the chord to continue.
        {:else if currentChordIndex === chordsToPlay.length}
          Complete!
        {:else}
          <span class="font-bold">Play this chord...</span>
        {/if}
      </div>

      {#if settings.current.practice.timerEnabled}
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
          {chordResults.filter((x) => x === "correct").length} correct
        </span>
        <span class="text-surface-500">|</span>
        <span class="text-error-500">
          {chordResults.filter((x) => x === "missed").length} missed
        </span>
      </div>
    </div>

    {#if settings.current.practice.showPianoRoll || (chordResults[currentChordIndex] === "missed" && chordsToPlay[currentChordIndex])}
      {@const chord = chordsToPlay[currentChordIndex]}
      {@const options = chordOptions[currentChordIndex]}
      <div class="relative flex max-h-2/5 items-center justify-center">
        <PianoRoll
          class="h-full"
          showSharps={options?.sharps}
          showNames={settings.current.practice.showPianoRollNotes}
          highlightedKeys={new Set(chord?.inversion(options?.inversion ?? 0))}
          pressedKeys={new Set(pressedKeys.values().map((x) => x % 24))}
          minKey={0}
          maxKey={24}
        />
      </div>
    {/if}
  </div>
{/if}
