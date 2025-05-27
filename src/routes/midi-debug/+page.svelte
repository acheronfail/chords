<script lang="ts">
  import { SvelteSet } from "svelte/reactivity";

  import { getMidiDevice } from "$lib/midi";
  import { chordsByNotes, createKey, midiNumberToNoteName } from "$lib/chords";
  import { settings as s, cachedSettings as c } from "$lib/stores.svelte";
  import PianoRoll from "$lib/PianoRoll.svelte";
  import { Switch } from "@skeletonlabs/skeleton-svelte";

  let pressedKeys = new SvelteSet<number>();
  let showNames = $state(true);

  let chordKey = $derived(createKey(Array.from(pressedKeys).map((k) => k % 12)));
  let possibleChords = $derived(chordsByNotes.get(chordKey));
  let nameOptions = $derived({ sharps: s.current.chordNotationUsesSharps });

  let possibleChordShortNames = $derived(
    possibleChords?.map((chord) => `${chord.shortName(nameOptions)}`).join(", "),
  );
  let possibleChordLongNames = $derived(
    possibleChords?.map((chord) => `${chord.name(nameOptions)}`).join(", "),
  );
  let pressedKeyNames = $derived(
    Array.from(pressedKeys)
      .map((key) => midiNumberToNoteName(key, { sharps: s.current.chordNotationUsesSharps }))
      .join(", "),
  );

  const createMessageHandler = (input: MIDIInput) => (message: MIDIMessageEvent) => {
    if (!message.data) return;
    const [command, note, velocity] = message.data;
    switch (command) {
      case 144:
        pressedKeys.add(note);
        break;
      case 128:
        pressedKeys.delete(note);
        break;
      case 248: // timing
        break;
      default:
        console.log(
          `MIDI: device=${input.name} command=${command} note=${note} velocity=${velocity}`,
        );
        break;
    }
  };

  // when selected device id changes
  $effect(() => {
    let unsubscribe = () => {};
    let cleanedUp = false;

    if (c.current.midiDeviceId) {
      getMidiDevice(c.current.midiDeviceId, (input) => {
        if (cleanedUp) return;
        const handler = createMessageHandler(input);
        input.addEventListener("midimessage", handler);
        unsubscribe = () => input.removeEventListener("midimessage", handler);
      });
    }

    return () => {
      cleanedUp = true;
      unsubscribe();
    };
  });
</script>

<main>
  <PianoRoll {pressedKeys} bind:showNames />

  <div class="table-wrap">
    <table class="table">
      <tbody>
        <tr>
          <th scope="row">
            <label for="showNoteNames" class="label cursor-pointer">Show Note Names?</label>
          </th>
          <td class="!text-right">
            <Switch
              ids={{ hiddenInput: "showNoteNames" }}
              checked={showNames}
              onCheckedChange={() => (showNames = !showNames)}
            />
          </td>
        </tr>
        <tr>
          <th scope="row" class="text-surface-300">Pressed Keys</th>
          <td class="!text-right">{pressedKeyNames}</td>
        </tr>
        <tr>
          <th scope="row" class="text-surface-300">Possible Chords (short)</th>
          <td class="!text-right">{possibleChordShortNames}</td>
        </tr>
        <tr>
          <th scope="row" class="text-surface-300">Possible Chords (long)</th>
          <td class="!text-right">{possibleChordLongNames}</td>
        </tr>
      </tbody>
    </table>
  </div>
</main>
