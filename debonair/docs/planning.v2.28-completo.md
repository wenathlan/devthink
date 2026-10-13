# planning.v2.28-completo — the ladder to the complete debonair app

> owner directive: make the app COMPLETE (suno.com generation x FL studio desk),
> house tree, no src/, no ui/ folder, doctrine of #oficial 4 + DESIGN_MAP v2.
> this plan is the single source of truth for the wave that closes the gaps
> listed in DEBONAI-RULEMAP.md section 7 and DEBONAI-VERSIONS.md backlog.
> step ladder generated from the live inventory: docs/planning.ladder.md

## where the app stands (inherited, verified this session)

- native app at `debonair/debonair/` (house tree: pure ts engines at the root,
  Sol/ theme, docs/, tests/). 28 engines + kathesis b2 (spectrum, fingerprint,
  analyze, vocalsynth). 261 vitest cases green, tsc 0, biome 0. commit 504b8ae
  on branch kathesis/b2-wave, pushed.
- served in the sandbox by the next.js gateway (single launcher page, iframe of
  the built bundle under public/debonair/). nothing is duplicated in the gateway.
- auth: device flow token persisted (iakadion). pushes land on
  github.com/wenathlan/devthink.

## gaps this wave closes (the definition of "complete")

| gap (inherited) | wave | delivery |
|---|---|---|
| daw editing is cosmetic (algebra exists, ui does not edit) | K3 | timeline editor in seconds: move (drag+snap), trim, split, duplicate, delete, clip selection; piano roll editor over the scheduled notes with add/remove/move/resize/quantize; honest re-schedule through takeevents + audioengine; aria + keyboard paths |
| no wav / midi / stems writers | K4 | wavwriter.ts (16/24/32f encoder, riff-correct), midiwriter.ts (smf format 1, vlq, tempo meta), stems.ts (per-role stem plans + manifest schema v1); export actions in the studio desk |
| no live visualization (analyser to canvas) | K5 | spectrum scope + waveform overview wired to the real analyser tap; playhead clock; reduced-motion guard |
| no server persistence (RenderJob idle) | K6 | gateway api projects (list/upsert/delete) on sqlite via prisma; cloudsync.ts engine (seam: fetch first, sessionStorage fallback, 2.5s timeout like onboardingstate); settings page shows sync state honestly |
| competitors dissected but not written down | K1 | docs/competitor-dissection.md from the five clones in allan/temp (libsonare, pulsegridstudio, magenta-js, acestep.cpp, heartlib) |
| planning ladder + version ladder | K2 | this file + docs/planning.ladder.md (900+ steps from the live inventory) |

## waves (task ids continue the worklog ladder)

- K1 — competitor dissection (read-only on allan/temp; writes docs/).
- K2 — planning: this document + generated ladder.
- K3 — studio daw editing (pianoroll.ts engine + Sol/studio/timeline + pianoroll ui + tests).
- K4 — writers: wavwriter.ts, midiwriter.ts, stems.ts + contract tests.
- K5 — live viz (spectrum scope, waveform overview, clock) on the real analyser.
- K6 — gateway persistence (api + cloudsync.ts engine + settings surface).
- K7 — gates: vitest full suite, tsc strict, biome zero; vite build; sync
  public/debonair; commit as iakadion on kathesis/b3-wave; fetch before push.
- K8 — browser verification of the served app (agent-browser) + worklog close.

## doctrine invariants every wave must keep

1. engines are pure ts at the root: no DOM, no AudioContext, no storage;
   tables first, orchestrator last, ~300 correlated logics per file, JSDoc on
   every export, typed results or error classes with machine codes.
2. determinism: same prompt + same seed = same take; mulberry32(hashSeed(fnv-1a))
   is the only rng; editors (pianoroll, timeline) are deterministic algebras.
3. sol.css is the single design source; windows accent #4cc2ff only in chrome
   focus, amber #d9962e only in brand/cta; zero emoji icons (lucide only);
   zero pills; reduced-motion guards; solcss.test.ts must stay green.
4. ui speaks english, lowercase chrome voice; mono tabular for bpm/key/lufs.
5. one audible transport: playerbus; studio hushes the bus on mount.
6. no touch on sibling apps (devthink, cadria, getry, vault, saddle...).
   getry/vault integration stays an adapter seam, never reimplemented.
7. gates before any push: biome 0, tsc 0, vitest green. commits as iakadion.
8. honest ui: no fake metrics, no invented reviews; export is real (wav/midi
   download of rendered audio), sync states read real endpoints with timeouts.

## acceptance criteria (the wave is done when)

- [ ] all six gaps above closed with green gates.
- [ ] vitest suite green with the new engine contract tests.
- [ ] served app (gateway iframe) verified in a real browser: generate a take,
      open the desk, edit a clip, edit a note, export wav + midi + stems,
      see the spectrum move, save to cloud, reload, find the take.
- [ ] worklog carries every task id; version ladder updated (v2.28/2.29/2.30
      delivered; v2.31 speechalign recording and v3.0 render queue remain).
