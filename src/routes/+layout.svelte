<script lang="ts">
  import "../app.css";

  import { AppBar } from "@skeletonlabs/skeleton-svelte";
  import { ArrowLeftIcon, SettingsIcon } from "@lucide/svelte";
  import { page } from "$app/state";

  import Settings from "$lib/Settings.svelte";
  import { base } from "$app/paths";

  let { children } = $props();
  let settingsOpen = $state(false);

  let path = $derived(page.url.pathname.replace(base, ""));
  let title = $derived.by(() => {
    switch (path) {
      case "/":
        return "Home";
      case "/quiz":
        return "Quiz!";
      default:
        return path;
    }
  });
</script>

<svelte:head>
  <title>Chords | {title}</title>
</svelte:head>

<AppBar>
  {#snippet lead()}
    {#if path !== "/"}
      <a href={base} class="btn preset-filled">
        <ArrowLeftIcon />
        <span>exit</span>
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
