<script lang="ts">
  import { cachedSettings, settings } from "./stores.svelte";

  import Blanket from "$lib/Blanket.svelte";
  import { type Device, getMidiDevices } from "$lib/midi";
  import { Switch } from "@skeletonlabs/skeleton-svelte";

  let {
    open = $bindable(),
    midiDevices = $bindable([]),
  }: {
    open: boolean;
    midiDevices?: Device[];
  } = $props();

  async function refreshDevices() {
    midiDevices = await getMidiDevices();
  }

  refreshDevices().then(() => {
    if (cachedSettings.current.midiDeviceId === null && midiDevices.length > 0) {
      cachedSettings.current.midiDeviceId = midiDevices[0].id;
    }
  });
</script>

<Blanket bind:open title="Settings">
  <div class="flex flex-col gap-2">
    <div class="flex items-center gap-2">
      <select class="select" bind:value={cachedSettings.current.midiDeviceId}>
        {#each midiDevices as device}
          <option value={device.id}>{device.name}</option>
        {/each}
      </select>
      <button class="btn preset-outlined-surface-500" onclick={refreshDevices}>
        refresh devices
      </button>
    </div>
    <div class="flex items-center justify-between gap-4">
      <label class="select-none" for="chordNotationUsesSharps">
        Use sharps instead of flats when notating chords (i.e., G♯ instead of A♭)
      </label>
      <Switch
        ids={{ hiddenInput: "chordNotationUsesSharps" }}
        checked={settings.current.chordNotationUsesSharps}
        onCheckedChange={(e) => (settings.current.chordNotationUsesSharps = e.checked)}
      />
    </div>
  </div>
</Blanket>
