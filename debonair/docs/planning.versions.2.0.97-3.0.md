# planning.versions — the 2.0.97 → 3.0 ladder of debonair

> the document the previous operation died creating (session corte at L2485-2495 of
> the context corpus). the ladder runs in houses of ~200-300: each house closes a
> capability block, ships green (biome 0/0 · tsc 0 · vitest green) and bumps the
> lockstep version. tree wins; the engine is the debonair root; the family imports
> the published `@wenathlan/debonair` library — never a path, never a bundle.

## where the house stands (verified 2026-10-12)

- `667c20a` head · katexis b1 + sol v2 trylle foundation · 240 tests green
- wave b2 (kathesis) landed in this operation: `spectrum.ts`, `fingerprint.ts`,
  `analyze.ts`, `vocalsynth.ts` + 4 suites → **261 tests green** (26 files)

## the ladder

### house 2.0.97 → 2.0.150 — the kathesis analysis core (this wave, b2)
- [x] spectrum kernel (fft · hann · chroma · kk correlation)
- [x] fingerprint identity (constellation · landmarks · db)
- [x] analyze pipeline (flux tempo · octave law · key · lufs · structure · report.schema v1)
- [x] formant voice (vowel table · seeded vibrato · syllable grid · level law)
- [x] enginemap honest refresh
- [ ] `report.schema.ts` — the json/txt formatters the corpus docs 12/26 prescribe
- [ ] `restage.ts` — the reference→analysis→plan loop (doc 14→16): a real track's
      report feeds the arranger so the take follows the reference structure

### house 2.0.150 → 2.0.200 — the daw body
- [ ] timeline editing for real: drag/split/trim wired to `timelinemodel` on the studio page
- [ ] piano roll page (`#oficial4` APP-0491..0735: Onboarding/Login/Mixer/Timeline/PianoRoll/Library/Master/Settings)
- [ ] wav/midi writers (export seam, `<50MB` validation before export)
- [ ] speechalign → vocal recording with ducking (the mic leg)

### house 2.0.200 → 2.1.0 — the ai acoustics seam
- [ ] onnxruntime-node seat for the foundation embeddings (clap/beats, int8)
- [ ] fpcalc/olaf binary orchestration via the saddle contract (node executes, binaries in `tools/bin/`)
- [ ] whisper.cpp transcription of the vocal stem → the lyricist reads, "A SONORIDADE É INTOCÁVEL"
- [ ] fingerprint dedup on every render job before the library accepts it

### house 2.1.0 → 3.0 — the family contract
- [ ] publish `@wenathlan/debonair` (npm/ghcr) — the engine leaves the house
- [ ] devthink music/musicstudio imports the published engine (no duplication)
- [ ] cadria/getry/vault consume the audio primitives through the same library
- [ ] 44.1k/48k master spec locked: −14 lufs streaming · −1 dbtp · anti-nan · pre-export validation

## the laws this ladder obeys
1. tree wins · 2. one domain per file ≤300 lines · 3. tables at the top, orchestrator last
4. seeded determinism in everything generated · 5. zero hardcode, zero consumer data in the engine
6. gates green before any bump · 7. commits as iakadion · 8. actions by tag, never sha
