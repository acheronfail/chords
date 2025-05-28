<script lang="ts">
  import type { Snippet } from "svelte";
  import { slide } from "svelte/transition";
  import { AppBar } from "@skeletonlabs/skeleton-svelte";
  import { X } from "@lucide/svelte";

  let {
    open = $bindable(),
    title,
    classes = "",
    children,
    onClose = () => (open = false),
  }: {
    open: boolean;
    onClose?: () => void;
    title: string;
    classes?: string;
    children: Snippet;
  } = $props();
</script>

{#if open}
  <div transition:slide={{ axis: "x" }} class="bg-surface-900 fixed inset-0 z-50 p-10">
    <div class="m-auto max-w-3xl min-w-3xl">
      <AppBar>
        {#snippet lead()}
          <h1 class="text-xl font-bold underline">{title}</h1>
        {/snippet}
        {#snippet trail()}
          <button type="button" class="btn-icon preset-outlined-surface-500" onclick={onClose}>
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
