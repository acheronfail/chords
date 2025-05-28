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
    autoContinue = $bindable(false),
    chordsToPlay = $bindable([]),
    timerDuration = $bindable(5000),
    onStart,
  }: {
    autoContinue: boolean;
    chordCount?: number;
    chordsToPlay?: Chord[];
    open?: boolean;
    timerDuration: number;
    onStart: () => void;
  } = $props();

  let kinds = new SvelteSet<ChordKind>([ChordKind.Major]);

  let countValid = $derived(chordCount >= 5);
  let timerValid = $derived(timerDuration >= 100);
  let kindsValid = $derived(kinds.size > 0);
  let valid = $derived(countValid && kindsValid);

  const begin = () => {
    open = false;

    const pool = chordsByKinds(kinds);
    chordsToPlay = [];
    while (chordsToPlay.length < chordCount) {
      chordsToPlay.push(...pool);
    }
    chordsToPlay = shuffle(chordsToPlay);

    onStart();
  };
</script>

<form class="m-auto flex w-full max-w-3xl flex-col justify-between gap-10 p-10">
  <h1 class="text-xl font-bold underline">Lead Sheet Options</h1>

  <div class="flex flex-col gap-1">
    <h3 class="font-bold">Chord Kinds</h3>
    {#each Object.entries(ChordNames) as [kind, [name]]}
      {@const k = parseInt(kind)}
      <div class="flex items-center justify-between gap-4">
        <label class="label cursor-pointer select-none" for="kind-{kind}">
          <Switch
            ids={{ hiddenInput: `kind-${kind}` }}
            checked={kinds.has(k)}
            onCheckedChange={() => (kinds.has(k) ? kinds.delete(k) : kinds.add(k))}
          />
          {name}
        </label>
      </div>
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
    <h3 class="font-bold">Other Options</h3>

    <div class="flex items-center justify-between gap-4">
      <label class="label cursor-pointer select-none" for="autoContinue">
        Automatically continue to next chord
      </label>
      <Switch
        ids={{ hiddenInput: "autoContinue" }}
        checked={autoContinue}
        onCheckedChange={(e) => (autoContinue = e.checked)}
      />
    </div>

    <label class="label">
      <span class="label-text">Time per chord (milliseconds)</span>
      <input
        type="number"
        class="input"
        name="timer"
        min="100"
        required
        bind:value={timerDuration}
      />
      {#if !timerValid}
        <span class="text-error-500 text-xs">Must be at least 100</span>
      {/if}
    </label>
  </div>

  <div class="flex flex-col">
    <button type="submit" class="btn preset-filled-primary-500" disabled={!valid} onclick={begin}>
      Begin!
    </button>
  </div>
</form>
