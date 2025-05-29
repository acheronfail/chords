<script lang="ts">
  import Blanket from "../../lib/components/Blanket.svelte";
  import { Chord, ChordKind, ChordNames, chordsByKinds } from "$lib/chords";
  import { Switch } from "@skeletonlabs/skeleton-svelte";
  import { SvelteSet } from "svelte/reactivity";
  import { shuffle } from "../../lib/array";

  // TODO: endless mode

  let {
    open = $bindable(true),
    chordCount = 12,
    chordsToPlay = $bindable([]),
    timerDuration = $bindable(5000),
    showPianoRoll = $bindable(false),
    showPianoRollNotes = $bindable(false),
    onStart,
  }: {
    chordCount?: number;
    chordsToPlay?: Chord[];
    open?: boolean;
    showPianoRoll?: boolean;
    showPianoRollNotes?: boolean;
    timerDuration: number | null;
    onStart: () => void;
  } = $props();

  let kinds = new SvelteSet<ChordKind>([ChordKind.Major]);
  let timerEnabled = $state(false);

  let countValid = $derived(chordCount >= 5);
  let timerValid = $derived(timerDuration !== null ? timerDuration >= 100 : true);
  let kindsValid = $derived(kinds.size > 0);
  let valid = $derived(countValid && kindsValid);

  const noChords = () => kinds.clear();
  const allChords = () => Object.values(ChordKind).forEach((kind) => kinds.add(kind as ChordKind));
  const randomiseChords = () => {
    const values = Object.values(ChordKind).filter((v) => typeof v === "number");
    kinds.clear();
    const n = Math.floor(Math.random() * values.length) + 1;
    while (kinds.size < n) {
      const randomKind = values[Math.floor(Math.random() * values.length)];
      kinds.add(randomKind as ChordKind);
    }
  };

  const begin = () => {
    open = false;

    // generate chords
    const pool = chordsByKinds(kinds);
    chordsToPlay = [];
    while (chordsToPlay.length < chordCount) {
      chordsToPlay.push(...pool);
    }
    chordsToPlay = shuffle(chordsToPlay).slice(0, chordCount);

    // set timer
    if (!timerEnabled) {
      timerDuration = null;
    }

    onStart();
  };
</script>

<form class="m-auto flex w-full max-w-3xl flex-col justify-between gap-10 p-10">
  <h1 class="text-xl font-bold underline">Lead Sheet Options</h1>

  <div class="flex flex-col gap-1">
    <div class="flex flex-row items-center justify-between gap-4">
      <h3 class="font-bold">Chord Kinds</h3>
      <div>
        <button class="btn preset-outlined-surface-500" onclick={randomiseChords}>randomise</button>
        <button class="btn preset-outlined-surface-500" onclick={allChords}>all</button>
        <button class="btn preset-outlined-surface-500" onclick={noChords}>none</button>
      </div>
    </div>
    {#each Object.entries(ChordNames) as [kind, [name]]}
      {@const k = parseInt(kind)}
      <label
        class="label flex cursor-pointer items-center justify-start gap-2 select-none"
        for="kind-{kind}"
      >
        <Switch
          ids={{ hiddenInput: `kind-${kind}` }}
          checked={kinds.has(k)}
          onCheckedChange={() => (kinds.has(k) ? kinds.delete(k) : kinds.add(k))}
        />
        {name}
      </label>
    {/each}
    {#if !kindsValid}
      <span class="text-error-500 text-xs">Must select at least one chord kind</span>
    {/if}
  </div>

  <div class="flex flex-col">
    <label class="label">
      <h3 class="font-bold">Number of chords to practice</h3>
      <input type="number" class="input" name="count" min="5" required bind:value={chordCount} />
      {#if !countValid}
        <span class="text-error-500 text-xs">Must be at least 5</span>
      {/if}
    </label>
  </div>

  <div class="flex flex-col gap-2">
    <h3 class="font-bold">Timer Options</h3>

    <div class="flex items-center justify-between gap-4">
      <label class="label cursor-pointer select-none" for="timerEnabled">
        Enable timer (must play chords within a time limit)
      </label>
      <Switch
        ids={{ hiddenInput: "timerEnabled" }}
        checked={timerEnabled}
        onCheckedChange={(e) => (timerEnabled = e.checked)}
      />
    </div>

    <label class="label">
      <span class="label-text">Time per chord (milliseconds)</span>
      <input
        type="number"
        class="input"
        name="timer"
        min="100"
        disabled={!timerEnabled}
        bind:value={timerDuration}
      />
      {#if !timerValid}
        <span class="text-error-500 text-xs">Must be at least 100</span>
      {/if}
    </label>
  </div>

  <div class="flex flex-col gap-2">
    <h3 class="font-bold">Other Options</h3>

    <div class="flex items-center justify-between gap-4">
      <label class="label cursor-pointer select-none" for="showPianoRollNotes">
        Show Notes on Piano Roll
      </label>
      <Switch
        ids={{ hiddenInput: "showPianoRollNotes" }}
        checked={showPianoRollNotes}
        onCheckedChange={(e) => (showPianoRollNotes = e.checked)}
      />
    </div>

    <div class="flex items-center justify-between gap-4">
      <label class="label cursor-pointer select-none" for="showPianoRoll">
        Always show piano roll
      </label>
      <Switch
        ids={{ hiddenInput: "showPianoRoll" }}
        checked={showPianoRoll}
        onCheckedChange={(e) => (showPianoRoll = e.checked)}
      />
    </div>
  </div>

  <div class="flex flex-col">
    <button type="submit" class="btn preset-filled-primary-500" disabled={!valid} onclick={begin}>
      Begin!
    </button>
  </div>
</form>
