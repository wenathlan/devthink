// # musictheory.test — honest unit tests for the theory kernel (scale table,
// intervals, the chord vocabulary over all twelve roots, roman-numeral
// parsing, voice-leading helpers), runnable with the vitest runner:
//   pnpm test
// Every fixture is a constant table — no randomness anywhere.
import { describe, expect, it } from "vitest";
import {
  CHORD_SHAPES,
  CHORD_SUFFIX,
  INTERVAL_NAMES,
  SCALE_NAMES,
  SCALE_STEPS,
  chordNotes,
  chordPcs,
  chordSymbol,
  commonTones,
  degreeToPc,
  diatonicTriad,
  intervalBetween,
  intervalName,
  makeChord,
  nearestInversion,
  noteName,
  noteToPc,
  parseChord,
  parseRoman,
  romanOf,
  scalePcs,
  transposePc,
  voiceLeadDistance,
} from "../musictheory.ts";

const C = { tonic: 0, mode: "major" } as const;
const Am = { tonic: 9, mode: "aeolian" } as const;

describe("scale table", () => {
  it("carries the thirteen documented scales", () => {
    expect(SCALE_NAMES.length).toBe(13);
    for (const name of SCALE_NAMES) {
      const steps = SCALE_STEPS[name];
      expect(steps[0], `${name} starts on the tonic`).toBe(0);
      steps.forEach((step, i) => expect(i === 0 || step > steps[i - 1], `${name} ascends strictly`).toBe(true));
      expect(steps[steps.length - 1] <= 11, `${name} stays inside the octave`).toBe(true);
    }
    expect(SCALE_STEPS.major).toEqual([0, 2, 4, 5, 7, 9, 11]);
    expect(SCALE_STEPS["pentatonic-major"].length).toBe(5);
    expect(SCALE_STEPS.blues.length).toBe(6);
  });

  it("answers relative keys with the same pitch classes", () => {
    expect(scalePcs(C)).toEqual([0, 2, 4, 5, 7, 9, 11]);
    expect([...scalePcs(Am)].sort((a, b) => a - b)).toEqual(scalePcs(C));
    expect(scalePcs({ tonic: 0, mode: "phrygian" }).includes(1), "phrygian carries the flat second").toBe(true);
  });

  it("resolves degrees and accidentals", () => {
    expect(degreeToPc(C, 3)).toBe(4);
    expect(degreeToPc(C, 3, -1), "bIII of C major").toBe(3);
    expect(degreeToPc(C, 4, 1), "#IV of C major").toBe(6);
    expect(transposePc(11, 2)).toBe(1);
    expect(transposePc(0, -1)).toBe(11);
  });
});

describe("note names and intervals", () => {
  it("spells all twelve classes both ways", () => {
    for (let pc = 0; pc < 12; pc++) {
      expect(noteToPc(noteName(pc))).toBe(pc);
      expect(noteToPc(noteName(pc, true))).toBe(pc);
    }
    expect(noteToPc("Eb")).toBe(3);
    expect(noteToPc("H")).toBeNull();
    expect(noteToPc("")).toBeNull();
  });

  it("names the twelve intervals and reads them between classes", () => {
    expect(INTERVAL_NAMES.length).toBe(12);
    expect(intervalName(0)).toBe("unison");
    expect(intervalName(6)).toBe("tritone");
    expect(intervalName(7)).toBe("perfect fifth");
    expect(intervalName(11)).toBe("major seventh");
    expect(intervalBetween(0, 4)).toBe("major third");
    expect(intervalBetween(4, 0)).toBe("minor sixth");
  });
});

describe("chord vocabulary", () => {
  it("keeps every shape ascending from the root", () => {
    for (const [quality, shape] of Object.entries(CHORD_SHAPES)) {
      expect(shape[0], `${quality} roots on 0`).toBe(0);
      shape.forEach((step, i) => expect(i === 0 || step > shape[i - 1], `${quality} ascends`).toBe(true));
      expect(shape[shape.length - 1] <= 14, `${quality} stays inside two octaves`).toBe(true);
    }
    for (const quality of Object.keys(CHORD_SUFFIX) as (keyof typeof CHORD_SUFFIX)[])
      expect(CHORD_SHAPES[quality], `${quality} has a shape`).toBeTruthy();
    for (const quality of Object.keys(CHORD_SHAPES))
      expect(typeof CHORD_SUFFIX[quality as keyof typeof CHORD_SUFFIX]).toBe("string");
  });

  it("spells, stacks and voices chords", () => {
    const cmaj7 = parseChord("Cmaj7");
    expect(cmaj7).toBeTruthy();
    expect(chordPcs(cmaj7!)).toEqual([0, 4, 7, 11]);
    expect(chordNotes(cmaj7!)).toEqual([60, 64, 67, 71]);
    const slash = parseChord("Am7/G");
    expect(slash).toBeTruthy();
    expect(chordPcs(slash!), "the slash bass comes first").toEqual([7, 9, 0, 4, 7]);
    expect(chordSymbol(slash!)).toBe("Am7/G");
  });

  it("builds every quality over all twelve roots and round-trips the symbol", () => {
    const qualities = ["maj", "min7", "dim", "sus4", "maj9"] as const;
    for (let root = 0; root < 12; root++) {
      for (const quality of qualities) {
        const chord = makeChord(root, quality);
        expect(chord.root).toBe(root);
        const back = parseChord(chordSymbol(chord));
        expect(back, `symbol ${chordSymbol(chord)} parses`).toBeTruthy();
        expect(back!.root).toBe(root);
        expect(back!.quality).toBe(quality);
      }
    }
  });

  it("parses the lead-sheet tokens and refuses the malformed ones", () => {
    expect(parseChord("F#m7b5")?.quality).toBe("halfdim");
    expect(parseChord("Db9")?.root).toBe(1);
    expect(parseChord("C/E")?.bass).toBe(4);
    expect(parseChord("Csus4")?.quality).toBe("sus4");
    expect(parseChord("H")).toBeNull();
    expect(parseChord("Cq")).toBeNull();
    expect(parseChord("C/")).toBeNull();
  });
});

describe("roman numerals", () => {
  it("parses the documented table in C major", () => {
    const symbolOf = (token: string) => chordSymbol(parseRoman(token, C)!);
    expect(symbolOf("I")).toBe("C");
    expect(symbolOf("IV")).toBe("F");
    expect(symbolOf("V7")).toBe("G7");
    expect(symbolOf("vi")).toBe("Am");
    expect(symbolOf("viio")).toBe("Bdim");
    expect(symbolOf("bIII")).toBe("D#");
    expect(symbolOf("#iv")).toBe("F#m");
    expect(symbolOf("v7")).toBe("Gm7");
    expect(symbolOf("VImaj7")).toBe("Amaj7");
    expect(symbolOf("ii")).toBe("Dm");
  });

  it("parses against the key's own scale (A aeolian)", () => {
    const symbolOf = (token: string) => chordSymbol(parseRoman(token, Am)!);
    expect(symbolOf("i")).toBe("Am");
    expect(symbolOf("VII")).toBe("G");
    expect(symbolOf("III")).toBe("C");
    expect(symbolOf("iv7")).toBe("Dm7");
    expect(symbolOf("V"), "the upper case overrides the mode's minor fifth").toBe("E");
    expect(parseRoman("IX", C)).toBeNull();
    expect(parseRoman("x", C)).toBeNull();
    expect(parseRoman("IVmaj", C)).toBeNull();
  });

  it("reads the diatonic triads of the seven-note scales", () => {
    expect(
      [1, 2, 3, 4, 5, 6, 7].map((d) => diatonicTriad(C, d)?.quality),
    ).toEqual(["maj", "min", "min", "maj", "maj", "min", "dim"]);
    expect(
      [1, 2, 3, 4, 5, 6, 7].map((d) => diatonicTriad(Am, d)?.quality),
    ).toEqual(["min", "dim", "maj", "min", "min", "maj", "maj"]);
    expect(diatonicTriad({ tonic: 0, mode: "blues" }, 1), "short scales carry no triads").toBeNull();
  });

  it("serialises numerals back from chords (romanOf round-trips)", () => {
    for (const [key, tokens] of [
      [C, ["I", "ii", "iii", "IV", "V", "vi", "viio", "V7"]],
      [Am, ["i", "iio", "III", "iv", "v", "VI", "VII", "V7"]],
    ] as const) {
      for (const token of tokens) {
        const chord = parseRoman(token, key)!;
        const numeral = romanOf(chord, key);
        expect(numeral, `${token} re-annotates`).toBeTruthy();
        const back = parseRoman(numeral!, key)!;
        expect(back.root, `${token} -> ${numeral} keeps the root`).toBe(chord.root);
        expect(back.quality, `${token} -> ${numeral} keeps the quality`).toBe(chord.quality);
      }
    }
  });
});

describe("voice-leading helpers", () => {
  it("counts common tones and nearest movement", () => {
    const c = chordPcs(parseChord("C")!);
    const am = chordPcs(parseChord("Am")!);
    expect(commonTones(c, am)).toBe(2);
    expect(voiceLeadDistance(c, am), "G->A and B->A cost two semitones").toBe(2);
    expect(voiceLeadDistance(c, c)).toBe(0);
    expect(voiceLeadDistance(c, chordPcs(parseChord("F#dim7")!))).toBeGreaterThan(0);
  });

  it("picks the inversion whose bass sits nearest the reference", () => {
    const c = parseChord("C")!;
    const fromG = nearestInversion(c, 55);
    expect(fromG.inversion, "G sits a fifth below middle C").toBe(2);
    expect(fromG.notes).toEqual([55, 60, 64]);
    const fromC = nearestInversion(c, 60);
    expect(fromC.inversion).toBe(0);
    expect(fromC.notes).toEqual([60, 64, 67]);
    const fromE = nearestInversion(c, 52);
    expect(fromE.inversion).toBe(1);
    expect(fromE.notes, "E G C stacks ascending from the reference").toEqual([52, 55, 60]);
  });
});
