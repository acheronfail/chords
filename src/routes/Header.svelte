<script lang="ts">
  import { base } from "$app/paths";
  import { page } from "$app/state";
  import { ArrowLeftIcon, SettingsIcon } from "@lucide/svelte";
  import { AppBar } from "@skeletonlabs/skeleton-svelte";
  import { routes } from "$lib/routes";
  import Settings from "$lib/Settings.svelte";

  let settingsOpen = $state(false);

  let title = $derived.by(() => {
    switch (page.url.pathname) {
      case routes.home:
        return "Home";
      case routes.leadSheet:
        return "Practice - Lead Sheet";
      case routes.midiDebug:
        return "MIDI Debugger";
      default: {
        const parts = page.url.pathname.split("/");
        return parts[parts.length - 1];
      }
    }
  });
</script>

<svelte:head>
  <title>Chords | {title}</title>
</svelte:head>

<AppBar>
  {#snippet lead()}
    {#if page.url.pathname !== routes.home}
      <a href={base} class="btn preset-outlined-surface-500">
        <ArrowLeftIcon />
        <span>back</span>
      </a>
    {/if}
  {/snippet}
  {#snippet trail()}
    <button
      type="button"
      class="btn-icon preset-outlined-surface-500"
      onclick={() => (settingsOpen = true)}
    >
      <SettingsIcon />
    </button>
  {/snippet}
  <h1>{title}</h1>
</AppBar>

<Settings bind:open={settingsOpen} />
