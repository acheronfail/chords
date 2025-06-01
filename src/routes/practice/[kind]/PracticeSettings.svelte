<script lang="ts">
  import { Switch } from "@skeletonlabs/skeleton-svelte";
  import { SvelteSet } from "svelte/reactivity";
  import { Chord, ChordKind, ChordNames, chordsByKinds, Clef } from "$lib/chords";
  import { shuffle } from "$lib/array";
  import { page } from "$app/state";
  import { settings } from "../../../lib/svelte/stores.svelte";
  import { untrack } from "svelte";

  let {
    chordsToPlay = $bindable([]),
    open = $bindable(true),
    onSubmit,
  }: {
    chordsToPlay?: Chord[];
    open?: boolean;
    onSubmit: () => void;
  } = $props();

  let kinds = new SvelteSet<ChordKind>(settings.current.practice.chordKinds);
  $effect(() => {
    const chordKinds = Array.from(kinds.values());
    untrack(() => {
      settings.current.practice.chordKinds = chordKinds;
    });
  });

  let kindsValid = $derived(kinds.size > 0);
  let countValid = $derived(settings.current.practice.chordCount >= 5);
  let timerValid = $derived(settings.current.practice.timerDuration >= 100);
  let valid = $derived(countValid && kindsValid && timerValid);

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

  const submit = () => {
    open = false;

    // generate chords
    const pool = chordsByKinds(kinds);
    chordsToPlay = [];
    while (chordsToPlay.length < settings.current.practice.chordCount) {
      chordsToPlay.push(...pool);
    }
    chordsToPlay = shuffle(chordsToPlay).slice(0, settings.current.practice.chordCount);

    onSubmit();
  };
</script>

<form class="m-auto flex w-full max-w-3xl flex-col justify-between gap-10 p-10">
  <div class="flex flex-col gap-2">
    <h3 class="font-bold">Chords</h3>

    <div class="flex flex-col gap-1">
      <div class="flex flex-row items-center justify-between gap-4">
        <span>Which chords should be included?</span>
        <div>
          <button class="btn preset-outlined-surface-500" onclick={allChords}>all</button>
          <button class="btn preset-outlined-surface-500" onclick={randomiseChords}>random</button>
          <button class="btn preset-outlined-surface-500" onclick={noChords}>none</button>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-1">
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
      </div>
      {#if !kindsValid}
        <span class="text-error-500 text-xs">Must select at least one chord kind</span>
      {/if}
    </div>

    {#if page.params.kind === "notes"}
      <div class="flex items-center justify-between gap-4">
        <label class="label cursor-pointer select-none" for="randomInversions">
          Randomise chord inversions?
        </label>
        <Switch
          ids={{ hiddenInput: "randomInversions" }}
          checked={settings.current.practice.randomInversions}
          onCheckedChange={(e) => (settings.current.practice.randomInversions = e.checked)}
        />
      </div>
      <div class="flex items-center justify-between gap-4">
        <label class="label cursor-pointer select-none" for="randomInversions"> Clef </label>
        <select class="select" bind:value={settings.current.practice.clef}>
          {#each Object.values(Clef) as clef}
            <option value={clef}>{clef}</option>
          {/each}
        </select>
      </div>
    {/if}
  </div>

  <div class="flex flex-col">
    <label class="label">
      <h3 class="font-bold">Number of chords to practice</h3>
      <input
        type="number"
        class="input"
        name="count"
        oninput={(e) => (settings.current.practice.chordCount = parseInt(e.currentTarget.value))}
        value={settings.current.practice.chordCount}
      />
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
        checked={settings.current.practice.timerEnabled}
        onCheckedChange={(e) => (settings.current.practice.timerEnabled = e.checked)}
      />
    </div>

    <label class="label">
      <span class="label-text">Time per chord (milliseconds)</span>
      <input
        type="number"
        class="input"
        name="timer"
        min="100"
        disabled={!settings.current.practice.timerEnabled}
        oninput={(e) => (settings.current.practice.timerDuration = parseInt(e.currentTarget.value))}
        value={settings.current.practice.timerDuration}
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
        checked={settings.current.practice.showPianoRollNotes}
        onCheckedChange={(e) => (settings.current.practice.showPianoRollNotes = e.checked)}
      />
    </div>

    <div class="flex items-center justify-between gap-4">
      <label class="label cursor-pointer select-none" for="showPianoRoll">
        Always show piano roll
      </label>
      <Switch
        ids={{ hiddenInput: "showPianoRoll" }}
        checked={settings.current.practice.showPianoRoll}
        onCheckedChange={(e) => (settings.current.practice.showPianoRoll = e.checked)}
      />
    </div>
  </div>

  <div class="flex flex-col">
    <button type="submit" class="btn preset-filled-primary-500" disabled={!valid} onclick={submit}>
      Begin!
    </button>
  </div>
</form>
