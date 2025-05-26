<script lang="ts">
  import { SvelteSet } from "svelte/reactivity";
  import { getMidiDevices, getMidiDevice } from "$lib/midi";
  import PianoRoll from "$lib/PianoRoll.svelte";
  import { chords, createKey } from "../lib/chords";

  let midiDevices = $state<{ name: string; id: string }[]>([]);
  let selectedDeviceId = $state<string | null>(null);
  let pressedKeys = new SvelteSet<number>();

  let chordKey = $derived(createKey(Array.from(pressedKeys).map((k) => k % 12)));
  let chord = $derived(chords.get(chordKey));

  refreshDevices().then(() => {
    if (midiDevices.length > 0) {
      selectedDeviceId = midiDevices[0].id;
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
      default:
        console.log(
          `MIDI: device=${input.name} command=${command} note=${note} velocity=${velocity}`,
        );
        break;
    }
  };

  $effect(() => {
    let unsubscribe = () => {};
    let cleanedUp = false;

    if (selectedDeviceId) {
      getMidiDevice(selectedDeviceId, (input) => {
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
  <select bind:value={selectedDeviceId}>
    {#each midiDevices as device}
      <option value={device.id}>{device.name}</option>
    {/each}
  </select>
</header>

<main>
  <PianoRoll {pressedKeys} />
  <div>
    <p>Pressed keys: {Array.from(pressedKeys).join(", ") ?? "-"}</p>
    <p>Chord Key: {chordKey}</p>
    <p>Chord: {chord ? chord.name : "-"}</p>
  </div>
</main>

<footer></footer>
