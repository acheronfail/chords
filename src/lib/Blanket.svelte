<script lang="ts">
  import { AppBar } from "@skeletonlabs/skeleton-svelte";
  import { X } from "@lucide/svelte";
  import type { Snippet } from "svelte";
  import { fade, slide } from "svelte/transition";

  let {
    open = $bindable(),
    title,
    classes = "",
    children,
  }: { open: boolean; title: string; classes?: string; children: Snippet } = $props();
</script>

{#if open}
  <div transition:slide={{ axis: "x" }} class="bg-surface-900 fixed inset-0 z-50 p-10">
    <div class="m-auto max-w-3xl min-w-3xl">
      <AppBar>
        {#snippet lead()}
          <h1 class="text-xl font-bold underline">{title}</h1>
        {/snippet}
        {#snippet trail()}
          <button
            type="button"
            class="btn-icon preset-outlined-surface-500"
            onclick={() => (open = false)}
          >
            <X size={24} />
          </button>
        {/snippet}
      </AppBar>
      <div class={classes}>
        {@render children()}
      </div>
    </div>
  </div>
{/if}
