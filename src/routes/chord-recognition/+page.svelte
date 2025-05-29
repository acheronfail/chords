<script lang="ts">
  // TODO: build chords
  // TODO: verify chords
  // TODO: (same as lead sheet) show piano roll
  // TODO: look into deduplicating stuff with lead sheet
  //
  // easy way for dark mode is to invert, but could look at

  import { Factory } from "vexflow";

  function renderStaff(element: HTMLElement) {
    const vf = new Factory({
      renderer: { elementId: element.id, width: 1000, height: 220 },
    });

    let x = 0;
    let y = 0;
    function appendSystem(width: number) {
      const system = vf.System({ x, y, width, spaceBetweenStaves: 10 });
      x += width;
      return system;
    }

    const score = vf.EasyScore();

    let system = appendSystem(220);
    score.set({ time: "3/4" });
    system
      .addStave({
        voices: [
          score.voice([
            ...score.notes('D5/q[id="m1a"]'),
            ...score.beam(score.notes("G4/8, A4, B4, C5", { stem: "up" })),
          ]),
          score.voice([vf.TextDynamics({ text: "p", duration: "h", dots: 1, line: 9 })]),
        ],
      })
      .addClef("treble")
      .addKeySignature("G")
      .addTimeSignature("3/4")
      .setTempo({ name: "Allegretto", duration: "h", dots: 1, bpm: 66 }, -30);
    system
      .addStave({ voices: [score.voice(score.notes("(G3 B3 D4)/h, A3/q", { clef: "bass" }))] })
      .addClef("bass")
      .addKeySignature("G")
      .addTimeSignature("3/4");
    system.addConnector("brace");
    system.addConnector("singleRight");
    system.addConnector("singleLeft");

    system = appendSystem(150);
    system.addStave({
      voices: [score.voice(score.notes('D5/q[id="m2a"], G4[id="m2b"], G4[id="m2c"]'))],
    });
    system.addStave({ voices: [score.voice(score.notes("B3/h.", { clef: "bass" }))] });
    system.addConnector("singleRight");

    vf.draw();
  }
</script>

<div class="relative p-4">
  <div
    class=" card preset-filled-surface-900-100 border-surface-200 w-full border p-4 invert"
    id="staff"
    use:renderStaff
  ></div>
</div>
