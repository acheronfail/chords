<script lang="ts">
  import { SvelteSet } from "svelte/reactivity";
  import { getMidiDevices, getMidiDevice } from "$lib/midi";
  import { chords, createKey } from "$lib/chords";
  import { settings as s, cachedSettings as c } from "$lib/stores.svelte";
  import PianoRoll from "$lib/PianoRoll.svelte";

  let midiDevices = $state<{ name: string; id: string }[]>([]);
  let pressedKeys = new SvelteSet<number>();

  let chordKey = $derived(createKey(Array.from(pressedKeys).map((k) => k % 12)));
  let chord = $derived(chords.get(chordKey));
  let nameOptions = $derived({ sharps: s.current.chordNotationUsesSharps });

  refreshDevices().then(() => {
    if (c.current.midiDeviceId === null && midiDevices.length > 0) {
      c.current.midiDeviceId = midiDevices[0].id;
    }
  });

  async function refreshDevices() {
    midiDevices = await getMidiDevices();
  }

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

<header>
  <button class="rounded border p-2" onclick={refreshDevices}>refresh devices</button>
  <select bind:value={c.current.midiDeviceId}>
    {#each midiDevices as device}
      <option value={device.id}>{device.name}</option>
    {/each}
  </select>
  <label>
    <input type="checkbox" bind:checked={s.current.chordNotationUsesSharps} />
    Use sharps
  </label>
</header>

<main>
  <PianoRoll {pressedKeys} />
  <div>
    <p>Pressed keys: {Array.from(pressedKeys).join(", ") ?? "-"}</p>
    <p>Chord Key: {chordKey}</p>
    <p>
      Chord: {chord ? `${chord.shortName(nameOptions)} (${chord.name(nameOptions)})` : "-"}
    </p>
  </div>
</main>

<footer></footer>
