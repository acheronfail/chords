<script lang="ts">
  import { getPressedKeys } from "$lib/context-midi";
  import { chordsByNotes, createChordKey } from "$lib/chords";

  // TODO: line with chord symbols; make them turn green as you do them and move along
  // TODO: progress bar ?
  // TODO: fun effects ?
  // TODO: score ?
  // TODO: settings for the quiz? (how hard, which key, which chord types, etc.)

  let pressedKeys = getPressedKeys();

  let selectedChord = $state("C Major");

  let chordKey = $derived(createChordKey(pressedKeys));
  let possibleChords = $derived(chordsByNotes.get(chordKey));
  let chordMatches = $derived(
    possibleChords?.map((chord) => chord.name({ sharps: true }))?.includes(selectedChord) ??
      (pressedKeys.size > 0 ? false : undefined),
  );
</script>

Are you playing {selectedChord}?: {chordMatches}
