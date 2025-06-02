<script lang="ts">
  import { slide } from "svelte/transition";
  import { getLocalTimeZone, parseDate, today } from "@internationalized/date";

  import Calendar from "$lib/components/Calendar.svelte";
  import { user } from "$lib/svelte/stores.svelte";

  let {
    collapsed = $bindable(false),
  }: {
    collapsed?: boolean;
  } = $props();

  let selectedDate = $state(today(getLocalTimeZone()));

  let totalDays = $derived(user.current.daysPracticed.length);
  let { longestStreak, longestStreakStart } = $derived.by(() => {
    let maxCount = 0;
    let maxStart: string | undefined;
    let currentCount = 0;
    let currentStart: string | undefined;

    const update = () => {
      if (currentCount > maxCount) {
        maxCount = currentCount;
        maxStart = currentStart;
      }
    };

    for (let i = 0; i < user.current.daysPracticed.length; ++i) {
      const curr = user.current.daysPracticed[i];
      const next = user.current.daysPracticed[i + 1];

      if (!currentStart) currentStart = curr;

      const currDate = parseDate(curr);
      const nextDate = next && parseDate(next);
      if (!nextDate || currDate.add({ days: 1 }).compare(nextDate) === 0) {
        currentCount++;
      } else {
        update();
        currentCount = 0;
        currentStart = undefined;
      }
    }

    update();
    return { longestStreak: maxCount, longestStreakStart: maxStart };
  });

  // TODO: when parent grid breakpoint is hit the X axis transition doesn't make sense
  const axis = "x";
</script>

{#snippet titleAndInfo(title: string, info: string, alt?: string)}
  <div class="flex flex-col items-center justify-center gap-2">
    <h3 class="text-sm font-bold whitespace-nowrap">{title}</h3>
    <span class="text-sm" title={alt}>{info}</span>
  </div>
{/snippet}

{#if !collapsed}
  <aside
    transition:slide={{ axis }}
    class="bg-surface-900 border-r-surface-800 flex h-full flex-col justify-between border-r-1 p-2"
  >
    <div class="flex flex-col items-center justify-center gap-2">
      <Calendar bind:selectedDate />
      {@render titleAndInfo("Total Days Practised", totalDays.toString())}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="hover:text-surface-800-200 cursor-pointer"
        onclick={() => {
          if (longestStreakStart) {
            selectedDate = parseDate(longestStreakStart);
          }
        }}
      >
        {@render titleAndInfo("Longest Streak", `${longestStreak}`, longestStreakStart)}
      </div>
    </div>

    <div class="text-surface-700-300 text-center text-xs whitespace-nowrap">
      all data stored locally in your browser
    </div>
  </aside>
{/if}
