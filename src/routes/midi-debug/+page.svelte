<script lang="ts">
  import { Switch } from "@skeletonlabs/skeleton-svelte";

  import { chordsByNotes, createChordMapKey, midiNumberToNoteName } from "$lib/chords";
  import PianoRoll from "$lib/components/PianoRoll.svelte";
  import { getMidiContext } from "$lib/context/midi.svelte";
  import { settings } from "$lib/svelte/stores.svelte";

  const availableKeys = new Array(128).fill(0).map((_, i) => i);

  let { pressedKeys } = getMidiContext();
  let showNames = $state(true);
  let showSharps = $state(true);
  let pianoRollShowNames = $derived<boolean | "withNumbers">(showNames ? "withNumbers" : false);

  let chordKey = $derived(createChordMapKey(pressedKeys));
  let possibleChords = $derived(chordsByNotes.get(chordKey));
  let nameOptions = $derived({ sharps: showSharps });

  let possibleChordShortNames = $derived(
    possibleChords?.map((chord) => `${chord.shortName(nameOptions)}`).join(", "),
  );
  let possibleChordLongNames = $derived(
    possibleChords?.map((chord) => `${chord.name(nameOptions)}`).join(", "),
  );
  let pressedKeyNames = $derived(
    Array.from(pressedKeys)
      .map((key) => midiNumberToNoteName(key, { sharps: showSharps }))
      .join(", "),
  );
</script>

<main>
  <PianoRoll {pressedKeys} {showSharps} showNames={pianoRollShowNames} />

  <div class="table-wrap">
    <table class="table">
      <tbody>
        <tr>
          <th scope="row" class="text-surface-300 bg-surface-900" colspan="2">
            <span class="text-md font-bold underline">Options</span>
          </th>
        </tr>

        <tr>
          <th scope="row">
            <label for="showNoteNames" class="label cursor-pointer">First key on Piano Roll</label>
          </th>
          <td class="w-1/2">
            <select
              id="pianoRollMinKey"
              class="select bg-primary-950"
              bind:value={settings.current.pianoRollMinKey}
            >
              {#each availableKeys.slice(0, settings.current.pianoRollMaxKey - 12 + 1) as key}
                <option value={key}
                  >{midiNumberToNoteName(key, { sharps: showSharps, withNumber: true })}</option
                >
              {/each}
            </select>
          </td>
        </tr>

        <tr>
          <th scope="row">
            <label for="showNoteNames" class="label cursor-pointer">Last key on Piano Roll</label>
          </th>
          <td>
            <select
              id="pianoRollMaxKey"
              class="select bg-primary-950"
              bind:value={settings.current.pianoRollMaxKey}
            >
              {#each availableKeys.slice(settings.current.pianoRollMinKey + 12) as key}
                <option value={key}
                  >{midiNumberToNoteName(key, { sharps: showSharps, withNumber: true })}</option
                >
              {/each}
            </select>
          </td>
        </tr>

        <tr>
          <th scope="row">
            <label for="showNoteNames" class="label cursor-pointer">Show Note Names?</label>
          </th>
          <td class="text-right">
            <Switch
              ids={{ hiddenInput: "showNoteNames" }}
              checked={showNames}
              onCheckedChange={() => (showNames = !showNames)}
            />
          </td>
        </tr>

        <tr>
          <th scope="row">
            <label
              for="chordNotationUsesSharps"
              class="label cursor-pointer"
              class:text-surface-300={!showNames}
              class:line-through={!showNames}
            >
              Sharps instead of flats?
            </label>
          </th>
          <td class="text-right">
            <Switch
              ids={{ hiddenInput: "chordNotationUsesSharps" }}
              disabled={!showNames}
              checked={showSharps}
              onCheckedChange={(e) => (showSharps = e.checked)}
            />
          </td>
        </tr>

        <tr>
          <th scope="row" class="text-surface-300 bg-surface-900" colspan="2">
            <span class="text-md font-bold underline">Info</span>
          </th>
        </tr>
        <tr class="font-mono">
          <th scope="row" class="text-surface-300">Pressed Keys</th>
          <td class="text-right">{pressedKeyNames}</td>
        </tr>
        <tr class="font-mono">
          <th scope="row" class="text-surface-300">Possible Chords (short)</th>
          <td class="text-right">{possibleChordShortNames}</td>
        </tr>
        <tr class="font-mono">
          <th scope="row" class="text-surface-300">Possible Chords (long)</th>
          <td class="text-right">{possibleChordLongNames}</td>
        </tr>
      </tbody>
    </table>
  </div>
</main>
