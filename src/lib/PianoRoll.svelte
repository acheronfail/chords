<script lang="ts">
  import { settings } from "./stores.svelte";

  interface Key {
    key: number;
    octave: number;
    inOctave: number;
    isBlack: boolean;
    x: number;
    width: number;
  }

  let { pressedKeys }: { pressedKeys: Set<number> } = $props();

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

<svg version="1.1" viewBox="0 0 {SVG_WIDTH} {svgHeight}" role="graphics-object">
  <g>
    {#each keys as key}
      {#if !key.isBlack}
        <rect
          x={(key.x - minX) * svgFactor}
          y={0}
          width={key.width * svgFactor}
          height={KEY_HEIGHT_WHITE / totalX}
          fill={pressedKeys.has(key.key) ? "red" : "white"}
          stroke="black"
          stroke-width={0.1}
        />
      {/if}
    {/each}
    {#each keys as key}
      {#if key.isBlack}
        <rect
          x={(key.x - minX) * svgFactor}
          y={0}
          width={key.width * svgFactor}
          height={KEY_HEIGHT_BLACK / totalX}
          fill={pressedKeys.has(key.key) ? "red" : "black"}
          stroke="black"
          stroke-width={0.1}
        />
      {/if}
    {/each}
  </g>
</svg>
