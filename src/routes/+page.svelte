<script lang="ts">
  import { PianoIcon } from "@lucide/svelte";

  interface CardProps {
    href: string;
    kind: string;
    title: string;
    description: string;
    highestScore?: number;
    lastPlayed?: Date;
  }

  let cards: CardProps[] = [
    {
      href: "lead-sheet",
      kind: "Practice",
      title: "Lead Sheet",
      description:
        "Practice your ability to recognise and play chords from Chord Symbols; things like Cmaj7, Dm7, G7, etc.",
    },
  ];
</script>

{#snippet card({ kind, title, href, description, highestScore, lastPlayed }: CardProps)}
  <a
    {href}
    class="card preset-filled-surface-100-900 border-surface-200-800 card-hover divide-surface-200-800 block max-w-md divide-y overflow-hidden border-[1px]"
  >
    <header>
      <div class="flex w-full items-center justify-center p-4">
        <PianoIcon size={48} />
      </div>
    </header>

    <article class="space-y-4 p-4">
      <div>
        <h2 class="h6">{kind}</h2>
        <h3 class="h3">{title}</h3>
      </div>
      <p class="text-surface-300">{description}</p>
    </article>

    <footer class="flex items-center justify-between gap-4 p-4">
      <small class="text-surface-300">High Score: {highestScore ?? "-"}</small>
      <small class="text-surface-300"
        >Last Played: {lastPlayed?.toLocaleDateString() ?? "never"}</small
      >
    </footer>
  </a>
{/snippet}

<main class="grid w-full grid-cols-2 items-center justify-items-center gap-4 p-4">
  {#each cards as props}
    {@render card(props)}
  {/each}
</main>
