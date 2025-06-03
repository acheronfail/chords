<script lang="ts">
  import { slide } from "svelte/transition";
  import { CalendarDate, getLocalTimeZone, parseDate, today } from "@internationalized/date";

  import Calendar from "$lib/components/Calendar.svelte";
  import { user } from "$lib/svelte/stores.svelte";

  let {
    collapsed = $bindable(false),
  }: {
    collapsed?: boolean;
  } = $props();

  let selectedDate = $state(today(getLocalTimeZone()));

  let totalDays = $derived(user.current.daysPracticed.length);
  let { longestStreak, longestStreakDate, daysSinceLastPractice, lastPracticeDate } = $derived.by(
    () => {
      let maxCount = 0;
      let maxStart: CalendarDate | undefined;
      let currentCount = 0;
      let currentStart: CalendarDate | undefined;
      let mostRecent: CalendarDate | undefined;

      const update = () => {
        if (currentCount > maxCount) {
          maxCount = currentCount;
          maxStart = currentStart;
        }
      };

      const dates = user.current.daysPracticed.map((d) => parseDate(d));
      for (let i = 0; i < dates.length; ++i) {
        const curr = dates[i];
        const next = dates[i + 1];

        if (!currentStart) currentStart = curr;

        if (!next || curr.add({ days: 1 }).compare(next) === 0) {
          currentCount++;
        } else {
          update();
          currentCount = 0;
          currentStart = undefined;
        }

        if (!mostRecent || curr.compare(mostRecent) > 0) {
          mostRecent = curr;
        }
      }

      update();
      return {
        longestStreak: maxCount,
        longestStreakDate: maxStart,
        daysSinceLastPractice: mostRecent ? today(getLocalTimeZone()).compare(mostRecent) : 0,
        lastPracticeDate: mostRecent,
      };
    },
  );

  // TODO: when parent grid breakpoint is hit the X axis transition doesn't make sense
  const axis = "x";
</script>

{#snippet titleAndInfo(title: string, info: string, date?: CalendarDate)}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="flex flex-col items-center justify-center gap-2"
    class:cursor-pointer={!!date}
    class:hover:text-surface-800-200={!!date}
    title={date?.toString()}
    onclick={date ? () => (selectedDate = date) : undefined}
  >
    <h3 class="text-sm font-bold whitespace-nowrap">{title}</h3>
    <span class="text-sm">{info}</span>
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
      {@render titleAndInfo("Longest Streak", `${longestStreak}`, longestStreakDate)}
      {@render titleAndInfo(
        "Days Since Last Practice",
        `${daysSinceLastPractice}`,
        lastPracticeDate,
      )}
    </div>

    <div class="text-surface-700-300 text-center text-xs whitespace-nowrap">
      all data stored locally in your browser
    </div>
  </aside>
{/if}
