<script lang="ts">
  import { midiNumberToNoteName } from "../chords";
  import { settings } from "../stores.svelte";

  interface Key {
    key: number;
    octave: number;
    inOctave: number;
    isBlack: boolean;
    x: number;
    width: number;
  }

  let {
    pressedKeys,
    showNames = $bindable(false),
  }: { pressedKeys: Set<number>; showNames?: boolean } = $props();

  const SVG_WIDTH = 100;
  const KEY_OFFSETS = [0, 0.6, 1, 1.8, 2, 3, 3.6, 4, 4.7, 5, 5.8, 6];
  const KEY_WIDTH_WHITE = 1;
  const KEY_WIDTH_BLACK = 0.6;
  const KEY_HEIGHT_WHITE = 500;
  const KEY_HEIGHT_BLACK = 350;
  const OCTAVE_WIDTH = KEY_WIDTH_WHITE * 7;

  const keys = $derived.by(() => {
    const minKey = settings.current.pianoRollMinKey;
    const maxKey = settings.current.pianoRollMaxKey;
    return [...Array(maxKey - minKey + 1)].map((_, i): Key => {
      const key = minKey + i;
      const octave = Math.floor((i + minKey) / 12);
      const inOctave = (i + minKey) % 12;
      const isBlack = (inOctave + (inOctave >= 5 ? 1 : 0)) % 2 === 1;
      const x = octave * OCTAVE_WIDTH + KEY_OFFSETS[inOctave];
      const width = isBlack ? KEY_WIDTH_BLACK : KEY_WIDTH_WHITE;
      return { key, octave, inOctave, isBlack, x, width };
    });
  });

  let minX = $derived(keys[0].x);
  let lastKey = $derived(keys[keys.length - 1]);
  let maxX = $derived(lastKey.x + lastKey.width);
  let totalX = $derived(maxX - minX);
  let svgFactor = $derived(SVG_WIDTH / totalX);
  let svgHeight = $derived(KEY_HEIGHT_WHITE / totalX);
</script>

{#snippet renderKey(key: Key)}
  {@const x = (key.x - minX) * svgFactor}
  {@const y = 0}
  {@const width = key.width * svgFactor}
  {@const height = (key.isBlack ? KEY_HEIGHT_BLACK : KEY_HEIGHT_WHITE) / totalX}
  {@const isPressed = pressedKeys.has(key.key)}
  {@const fill = isPressed
    ? "fill-primary-500"
    : key.isBlack
      ? "fill-surface-950"
      : "fill-surface-50"}

  <g>
    <rect {x} {y} {width} {height} class={fill} stroke="black" stroke-width={0.1} />
    {#if showNames}
      {@const textSize = width / 2}
      {@const textY = height - textSize}
      {@const textFill = isPressed
        ? "fill-surface-50"
        : key.isBlack
          ? "fill-surface-50"
          : "fill-surface-950"}

      <text x={x + width / 2} y={textY} font-size={textSize} class={textFill} text-anchor="middle">
        {midiNumberToNoteName(key.key, { sharps: settings.current.chordNotationUsesSharps })}
      </text>
    {/if}
  </g>
{/snippet}

<svg version="1.1" viewBox="0 0 {SVG_WIDTH} {svgHeight}" role="graphics-object">
  <g>
    {#each keys as key}
      {#if !key.isBlack}
        {@render renderKey(key)}
      {/if}
    {/each}
    {#each keys as key}
      {#if key.isBlack}
        {@render renderKey(key)}
      {/if}
    {/each}
  </g>
</svg>
