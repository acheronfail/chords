<script lang="ts">
  import Calendar from "$lib/components/Calendar.svelte";
  import { slide } from "svelte/transition";

  let {
    collapsed = $bindable(false),
  }: {
    collapsed?: boolean;
  } = $props();

  // TODO: when parent grid breakpoint is hit the X axis transition doesn't make sense
  const axis = "x";
</script>

{#if !collapsed}
  <aside
    transition:slide={{ axis }}
    class="bg-surface-900 border-r-surface-800 h-full border-r-1 p-2"
  >
    <div class="flex flex-col items-center justify-center gap-2">
      <h2 class="text-md font-bold whitespace-nowrap">Practise Calendar</h2>
      <Calendar />
      <!-- TODO: show longest streak (how many days, how many days ago, etc) -->
      <!-- TODO: hover dates for more info on what was practised maybe? -->
    </div>
  </aside>
{/if}
