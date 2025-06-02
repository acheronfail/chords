<script lang="ts">
  import "../app.css";

  import { getMidiContext, initMidiContext } from "$lib/context/midi.svelte";
  import { getMidiDevice } from "$lib/midi";
  import { cleanUpPreviousSettings, settings } from "$lib/svelte/stores.svelte";

  import Header from "./Header.svelte";
  import Sidebar from "./Sidebar.svelte";

  cleanUpPreviousSettings();
  initMidiContext();

  let { children } = $props();

  let { pressedKeys } = getMidiContext();

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

    if (settings.current.midiDeviceId) {
      getMidiDevice(settings.current.midiDeviceId, (err, input) => {
        if (cleanedUp) return;

        if (err || !input) {
          console.error(err);
          settings.current.midiDeviceId = null;
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
  <Header
    bind:sidebarCollapsed={settings.current.sidebarCollapsed}
    classes="border-b-1 border-b-surface-800"
  />

  <div class="grid h-full grid-cols-1 md:grid-cols-[auto_1fr]">
    <div class="h-full">
      <Sidebar bind:collapsed={settings.current.sidebarCollapsed} />
    </div>

    <main class="relative grow">
      {@render children()}
    </main>
  </div>
</div>
