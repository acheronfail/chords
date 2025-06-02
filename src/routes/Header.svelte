<script lang="ts">
  import { base } from "$app/paths";
  import { page } from "$app/state";
  import {
    ArrowLeftIcon,
    PanelRightCloseIcon,
    PanelRightOpenIcon,
    SettingsIcon,
  } from "@lucide/svelte";
  import { AppBar } from "@skeletonlabs/skeleton-svelte";

  import { routes } from "$lib/routes";
  import Settings from "../lib/components/Settings.svelte";

  let {
    classes = "",
    sidebarCollapsed = $bindable(),
  }: {
    classes?: string;
    sidebarCollapsed: boolean;
  } = $props();

  let settingsOpen = $state(false);

  let title = $derived.by(() => {
    switch (page.url.pathname) {
      case routes.home:
        return "Chords";
      case routes.practiceSymbols:
        return "Practice - Chord Symbols";
      case routes.practiceNotes:
        return "Practice - Sheet Music";
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

<Settings bind:open={settingsOpen} />

<AppBar classes="sticky top-0 z-40 {classes}">
  {#snippet lead()}
    <div class="flex items-center gap-2">
      <button
        class="btn-icon preset-outlined-surface-500"
        onclick={() => (sidebarCollapsed = !sidebarCollapsed)}
      >
        {#if sidebarCollapsed}
          <PanelRightCloseIcon />
        {:else}
          <PanelRightOpenIcon />
        {/if}
      </button>
      {#if page.url.pathname !== routes.home}
        <a href={base} class="btn preset-outlined-surface-500">
          <ArrowLeftIcon />
          <span>back</span>
        </a>
      {/if}
    </div>
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
  <div class="flex h-full items-center justify-center">
    <h1 class="text-lg font-bold">{title}</h1>
  </div>
</AppBar>
