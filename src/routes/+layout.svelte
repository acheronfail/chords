<script lang="ts">
  import "../app.css";

  import { getPressedKeys, initPressedKeys } from "$lib/context/midi";
  import { getMidiDevice } from "$lib/midi";
  import { cachedSettings } from "$lib/svelte/stores.svelte";
  import Header from "./Header.svelte";

  initPressedKeys();

  let { children } = $props();
  let pressedKeys = getPressedKeys();

  const createMessageHandler = (input: MIDIInput) => (message: MIDIMessageEvent) => {
    if (!message.data) return;
    const [command, note, velocity] = message.data;
    switch (command) {
      case 144: // note down
        pressedKeys.add(note);
        break;
      case 128: // note up
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

    if (cachedSettings.current.midiDeviceId) {
      getMidiDevice(cachedSettings.current.midiDeviceId, (err, input) => {
        if (cleanedUp) return;

        if (err || !input) {
          console.error(err);
          cachedSettings.current.midiDeviceId = null;
          return;
        }

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

<div class="flex h-screen flex-col">
  <Header classes="" />

  <main class="relative grow">
    {@render children()}
  </main>
</div>
