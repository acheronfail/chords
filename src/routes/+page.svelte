<script lang="ts">
  import { SvelteSet } from "svelte/reactivity";
  import { AppBar } from "@skeletonlabs/skeleton-svelte";
  import { PianoIcon, SettingsIcon } from "@lucide/svelte";

  import { getMidiDevice } from "$lib/midi";
  import { chords, createKey, midiNumberToNoteName } from "$lib/chords";
  import { settings as s, cachedSettings as c } from "$lib/stores.svelte";
  import PianoRoll from "$lib/PianoRoll.svelte";
  import Settings from "../lib/Settings.svelte";

  let pressedKeys = new SvelteSet<number>();
  let settingsOpen = $state(false);

  let chordKey = $derived(createKey(Array.from(pressedKeys).map((k) => k % 12)));
  let chord = $derived(chords.get(chordKey));
  let nameOptions = $derived({ sharps: s.current.chordNotationUsesSharps });

  const createMessageHandler = (input: MIDIInput) => (message: MIDIMessageEvent) => {
    if (!message.data) return;
    const [command, note, velocity] = message.data;
    switch (command) {
      case 144:
        pressedKeys.add(note);
        break;
      case 128:
        pressedKeys.delete(note);
        break;
      case 248: // timing
        break;
      default:
        console.log(
          `MIDI: device=${input.name} command=${command} note=${note} velocity=${velocity}`,
        );
        break;
    }
  };

  // when selected device id changes
  $effect(() => {
    let unsubscribe = () => {};
    let cleanedUp = false;

    if (c.current.midiDeviceId) {
      getMidiDevice(c.current.midiDeviceId, (input) => {
        if (cleanedUp) return;
        const handler = createMessageHandler(input);
        input.addEventListener("midimessage", handler);
        unsubscribe = () => input.removeEventListener("midimessage", handler);
      });
    }

    return () => {
      cleanedUp = true;
      unsubscribe();
    };
  });
</script>

<AppBar>
  {#snippet lead()}
    <PianoIcon size={24} />
  {/snippet}
  {#snippet trail()}
    <button type="button" class="btn-icon preset-filled" onclick={() => (settingsOpen = true)}>
      <SettingsIcon size={24} />
    </button>
  {/snippet}
  <h1>Chords</h1>
</AppBar>

<main>
  <PianoRoll {pressedKeys} />
  <div>
    <p>
      Pressed keys: {Array.from(pressedKeys)
        .map((key) => midiNumberToNoteName(key, { sharps: s.current.chordNotationUsesSharps }))
        .join(", ") ?? "-"}
    </p>
    <p>Chord Key: {chordKey}</p>
    <p>
      Chord: {chord ? `${chord.shortName(nameOptions)} (${chord.name(nameOptions)})` : "-"}
    </p>
  </div>
</main>

<Settings bind:open={settingsOpen} />
