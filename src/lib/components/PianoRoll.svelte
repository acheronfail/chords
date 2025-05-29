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
    highlightedKeys = new Set<number>(),
    showNames = $bindable(false),
    minKey,
    maxKey,
  }: {
    pressedKeys: Set<number>;
    highlightedKeys?: Set<number>;
    showNames?: boolean;
    minKey?: number;
    maxKey?: number;
  } = $props();

  const SVG_WIDTH = 100;
  const KEY_OFFSETS = [0, 0.6, 1, 1.8, 2, 3, 3.6, 4, 4.7, 5, 5.8, 6];
  const KEY_WIDTH_WHITE = 1;
  const KEY_WIDTH_BLACK = 0.6;
  const KEY_HEIGHT_WHITE = 500;
  const KEY_HEIGHT_BLACK = 350;
  const OCTAVE_WIDTH = KEY_WIDTH_WHITE * 7;

  const pianoRollMinKey = $derived(minKey ?? settings.current.pianoRollMinKey);
  const pianoRollMaxKey = $derived(maxKey ?? settings.current.pianoRollMaxKey);

  const keys = $derived.by(() => {
    return [...Array(pianoRollMaxKey - pianoRollMinKey + 1)].map((_, i): Key => {
      const key = pianoRollMinKey + i;
      const octave = Math.floor((i + pianoRollMinKey) / 12);
      const inOctave = (i + pianoRollMinKey) % 12;
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

  // record: isBlack -> isPressed -> isHighlighted
  const colors = {
    // black
    true: {
      // black, pressed
      true: {
        // black, pressed, highlighted
        true: "fill-success-500",
        // black, pressed, !highlighted
        false: "fill-primary-500",
      },
      // black, !pressed
      false: {
        // black, !pressed, highlighted
        true: "fill-secondary-500",
        // black, !pressed, !highlighted
        false: "fill-surface-950",
      },
    },
    // !black
    false: {
      // !black, pressed
      true: {
        // !black, pressed, highlighted
        true: "fill-success-500",
        // !black, pressed, !highlighted
        false: "fill-primary-500",
      },
      // !black, !pressed
      false: {
        // !black, !pressed, highlighted
        true: "fill-secondary-500",
        // !black, !pressed, !highlighted
        false: "fill-surface-50",
      },
    },
  };

  const getKeyFill = (key: Key) => {
    // @ts-expect-error probably a better way to do this
    return colors[key.isBlack][pressedKeys.has(key.key)][highlightedKeys.has(key.key)];
  };

  const getTextFill = (key: Key) => {
    return pressedKeys.has(key.key)
      ? "fill-surface-50"
      : key.isBlack
        ? "fill-surface-50"
        : "fill-surface-950";
  };
</script>

{#snippet renderKey(key: Key)}
  {@const x = (key.x - minX) * svgFactor}
  {@const y = 0}
  {@const width = key.width * svgFactor}
  {@const height = (key.isBlack ? KEY_HEIGHT_BLACK : KEY_HEIGHT_WHITE) / totalX}

  <g>
    <rect {x} {y} {width} {height} class={getKeyFill(key)} stroke="black" stroke-width={0.1} />
    {#if showNames}
      {@const textSize = width / 2}
      {@const textY = height - textSize}

      <text
        x={x + width / 2}
        y={textY}
        font-size={textSize}
        class={getTextFill(key)}
        text-anchor="middle"
      >
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
