<script lang="ts">
  import "../app.css";

  import { AppBar } from "@skeletonlabs/skeleton-svelte";
  import { ArrowLeftIcon, SettingsIcon } from "@lucide/svelte";
  import { page } from "$app/state";

  import Settings from "$lib/Settings.svelte";
  import { base } from "$app/paths";
  import { routes } from "../lib/routes";

  let { children } = $props();
  let settingsOpen = $state(false);

  let title = $derived.by(() => {
    switch (page.url.pathname) {
      case routes.home:
        return "Home";
      case routes.leadSheet:
        return "Practice - Lead Sheet";
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
      <a href={base} class="btn preset-filled">
        <ArrowLeftIcon />
        <span>back</span>
      </a>
    {/if}
  {/snippet}
  {#snippet trail()}
    <button type="button" class="btn-icon preset-filled" onclick={() => (settingsOpen = true)}>
      <SettingsIcon />
    </button>
  {/snippet}
  <h1>{title}</h1>
</AppBar>

<Settings bind:open={settingsOpen} />

{@render children()}
