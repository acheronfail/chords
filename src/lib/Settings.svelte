<script lang="ts">
  import { cachedSettings, settings, settingsReset } from "./stores.svelte";

  import Blanket from "$lib/Blanket.svelte";
  import { type Device, getMidiDevices } from "$lib/midi";
  import { Switch } from "@skeletonlabs/skeleton-svelte";
  import { midiNumberToNoteName } from "./chords";

  let {
    open = $bindable(),
    midiDevices = $bindable([]),
  }: {
    open: boolean;
    midiDevices?: Device[];
  } = $props();

  const availableKeys = new Array(128).fill(0).map((_, i) => i);

  async function refreshDevices() {
    midiDevices = await getMidiDevices();
  }

  refreshDevices().then(() => {
    if (cachedSettings.current.midiDeviceId === null && midiDevices.length > 0) {
      cachedSettings.current.midiDeviceId = midiDevices[0].id;
    }
  });
</script>

<Blanket bind:open title="Settings" classes="flex flex-col w-full justify-between p-4 gap-10">
  <div class="flex flex-col">
    <h3 class="font-bold">MIDI</h3>
    <label for="midiDeviceId" class="label">Selected Device</label>
    <div class="flex items-center gap-2">
      <select id="midiDeviceId" class="select" bind:value={cachedSettings.current.midiDeviceId}>
        {#each midiDevices as device}
          <option value={device.id}>{device.name}</option>
        {/each}
      </select>
      <button class="btn preset-outlined-surface-500" onclick={refreshDevices}>
        Refresh devices
      </button>
    </div>
  </div>

  <div class="flex flex-col">
    <h3 class="font-bold">Piano Roll</h3>
    <div class="flex items-center gap-2">
      <label for="pianoRollMinKey" class="label">
        <span class="label-text">First key on piano roll</span>
        <select id="pianoRollMinKey" class="select" bind:value={settings.current.pianoRollMinKey}>
          {#each availableKeys.slice(0, settings.current.pianoRollMaxKey - 12 + 1) as key}
            <option value={key}
              >{midiNumberToNoteName(key, {
                sharps: settings.current.chordNotationUsesSharps,
              })}</option
            >
          {/each}
        </select>
      </label>
      <label for="pianoRollMaxKey" class="label">
        <span class="label-text">Last key on piano roll</span>
        <select id="pianoRollMaxKey" class="select" bind:value={settings.current.pianoRollMaxKey}>
          {#each availableKeys.slice(settings.current.pianoRollMinKey + 12) as key}
            <option value={key}
              >{midiNumberToNoteName(key, {
                sharps: settings.current.chordNotationUsesSharps,
              })}</option
            >
          {/each}
        </select>
      </label>
    </div>
  </div>

  <div class="flex flex-col">
    <h3 class="font-bold">Miscellaneous</h3>
    <div class="flex items-center justify-between gap-4">
      <label class="label cursor-pointer select-none" for="chordNotationUsesSharps">
        Use sharps instead of flats when notating chords (i.e., G♯ instead of A♭)
      </label>
      <Switch
        ids={{ hiddenInput: "chordNotationUsesSharps" }}
        checked={settings.current.chordNotationUsesSharps}
        onCheckedChange={(e) => (settings.current.chordNotationUsesSharps = e.checked)}
      />
    </div>
  </div>

  <div class="flex flex-col">
    <button class="btn preset-outlined-surface-500 mt-10" onclick={settingsReset}>
      Reset all settings to defaults
    </button>
    <div class="text-surface-500 flex items-center justify-center">
      {import.meta.env.VITE_BUILD_VERSION
        ? `Version: ${import.meta.env.VITE_BUILD_VERSION}`
        : "Version: development"}
    </div>
  </div>
</Blanket>
