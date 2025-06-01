<script lang="ts">
  import { settings } from "../svelte/stores.svelte";

  import Blanket from "./Blanket.svelte";
  import { type Device, getMidiDevices } from "$lib/midi";
  import { routes } from "../routes";

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
    if (settings.current.midiDeviceId === null && midiDevices.length > 0) {
      settings.current.midiDeviceId = midiDevices[0].id;
    }
  });
</script>

<Blanket bind:open title="Settings" classes="flex flex-col w-full justify-between p-4 gap-10">
  <div class="flex flex-col gap-2">
    <h3 class="font-bold">MIDI</h3>
    <label for="midiDeviceId" class="label">Selected Device</label>
    <div class="flex items-center gap-2">
      <select id="midiDeviceId" class="select" bind:value={settings.current.midiDeviceId}>
        <option disabled value={null}>- please choose a device -</option>
        {#each midiDevices as device}
          <option value={device.id}>{device.name}</option>
        {/each}
      </select>
      <button class="btn preset-outlined-surface-500" onclick={refreshDevices}>
        Refresh devices
      </button>
    </div>
    <a href={routes.midiDebug} class="flex items-center justify-end">
      <button class="btn btn-sm preset-outlined-surface-500" onclick={() => (open = false)}>
        Open MIDI tester
      </button>
    </a>
  </div>

  <div class="flex flex-col">
    <button class="btn preset-outlined-surface-500 mt-10" onclick={() => settings.reset()}>
      Reset all settings and caches
    </button>
    <div class="text-surface-500 flex items-center justify-center">
      {import.meta.env.VITE_BUILD_VERSION
        ? `Version: ${import.meta.env.VITE_BUILD_VERSION}`
        : "Version: development"}
    </div>
  </div>
</Blanket>
