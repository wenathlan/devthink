# Competitor Dissection — inputs for the kathesis engine

> Task K1. Read-only study of five competitor clones already downloaded to
> `allan/temp/`. Goal: extract concrete, importable logic (algorithms, data
> structures, render/export strategies, DAW-UI patterns) for the kathesis
> engines at the debonair root. Every claim carries a `file:line` reference
> against the clone as of this dissection. Nothing here was copied verbatim
> into the codebase — this document is the queue, not the implementation.

Sources dissected (with license, which gates what may be reused):

| Repo | What it is | License |
| --- | --- | --- |
| `libsonare` | C++17 audio engine (analysis → mastering → mixing → MIDI → DAW runtime) shipped as WASM/Python/Node/C++ | Apache-2.0 |
| `pulsegridstudio` | Dependency-free browser DAW: one JS DSP module shared by AudioWorklet, export Worker and Node tests | MIT |
| `magenta-js` | TensorFlow.js music library (NoteSequence, quantization, melody/chord encodings, RNN/VAE models) | Apache-2.0 |
| `acestep.cpp` | GGML port of ACE-Step 1.5: prompt+lyrics → 48 kHz stereo music (LM + DiT + VAE) | MIT |
| `heartlib` | HeartMuLa family: 12.5 Hz music LM conditioned on tags+lyrics, HeartCodec tokenizer | Apache-2.0 |

kathesis baseline for comparison: pure-TS engines at the debonair root
(`musictheory`, `harmonyengine`, `rhythmgrammar`, `genrematrix`, `arranger`,
`takeevents`, `loudness` EBU R128, `ducking`, `mixergraph`, `speechalign`,
`beatgrid`, `remixplan`, `timelinemodel`, `playerbus`, `spectrum`
fft/hann/chroma, `fingerprint` landmarks, `analyze`, `vocalsynth` formants)
driven by the pipeline prompt+seed → planTake → scheduleTake → TakeEngine
(WebAudio 48 kHz).

---

## 1. libsonare — the analysis/mastering/mixing library

### What it is

A C++17 engine ("turns audio into data and data back into audio") with a C
API, WASM build for the browser, Python and Node bindings, plus a CLI
(`README.md:5-11`). ~95 named mastering processors, mixing scenes with buses
and sends, offline bounce of compiled timelines, realtime allocation-free
playback, analysis (BPM/key/chords/sections matching librosa defaults).
Zero GPL code, no model weights (`README.md:9-11`). The submodules that
matter to kathesis: `src/analysis/*`, `src/mastering/*`, `src/engine/*`,
`src/c_api/project_bounce.cpp`, `src/graph/*`.

### Pipeline

Analysis is a constellation of focused analyzers over one shared frontend:
`bpm_analyzer` (onset envelope → autocorrelation + Fourier tempogram),
`key_analyzer` (chroma × rotated key profiles), `chord_analyzer` (chroma
templates → **HMM Viterbi** decode), `section_analyzer` (section descriptors
→ self-similarity → repeats), plus meter/downbeat/timbre/melody analyzers
(`src/analysis/`, 24 files, ~9.5k lines). The master side is a named-processor
registry (`src/mastering/api/named_processor_registry.cpp`,
`insert_factory.cpp` 2.6k lines) whose parameters self-describe, surfaced
through a generated capability catalog (`tools/capability-catalog.json`,
top-level keys: `abi`, `chain`, `masteringPresets`, `presets`,
`processors`, `version`). The DAW side compiles a project into an
`arr::CompiledTimeline` and bounces it offline with instruments + mixer
(`src/c_api/project_bounce.cpp`).

### Concrete logics to import

1. **Cadence-graded chord HMM (Viterbi with beam).** Chord decoding as a
   HMM where transition log-probabilities are graded by cadence strength —
   `None/Weak/Full/Dominant` (V7→I with the tritone present outranks
   plain V→I, which outranks weak-quality cadences, which are floored so a
   weak cadence never scores below a related transition) — then a 2-row
   Viterbi over beam-limited candidates with backpointers
   (`src/analysis/chord_hmm.cpp:34-118`, floor at `:154-161`, Viterbi at
   `:181-263`). This is the missing piece in `harmonyengine`'s chord
   selection: kathesis currently picks chords by template/genre tables; the
   cadence grading turns any such table into a progression-aware decoder.
2. **Swappable key profiles behind one rotation function.** Key detection
   parameterized over Krumhansl-Schmuckler / Temperley / Shaath /
   Bellman-Budge / Faraldo EDM profiles with a single
   `rotate_profile(profile, semitones)` primitive
   (`src/analysis/key_profiles.cpp:9-56`). `analyze.ts` currently hardcodes
   one profile; making it a parameter costs one array-of-arrays and lets the
   report state agreement across profiles as confidence.
3. **BPM: autocorrelation + parabolic peak refinement + Fourier tempogram
   fallback.** FFT-based autocorrelation of the onset envelope, parabolic
   interpolation of lag peaks, a librosa-compatible Fourier tempogram, and a
   merge when either fails (`src/analysis/bpm_analyzer.cpp:244-283`,
   `:319-353`, `:447-457`). Complements kathesis `beatgrid` onset-flux with
   the tempogram path for fractional-BPM material.
4. **Section self-similarity with a confidence floor.** Build 12-chroma +
   energy + vocal-likelihood descriptors per detected section, cosine
   self-similarity matrix, count repeats per section, and *refuse to assert
   a semantic label below a confidence floor* — emit the segment without the
   label instead (`src/analysis/section_analyzer.cpp:513-529`,
   floor at `:640-660`). Direct upgrade for `analyze.ts` structure and
   `remixplan` arrangement proposals.
5. **Streaming loudness preview per platform.** For each platform table
   entry (Spotify −14 LUFS/−1 dBTP, Apple Music −16/−1, YouTube −14/−1),
   compute the normalization gain and a boolean ceiling-risk flag; the header
   documents the BS.1770 channel-sum pitfall (a 0.5·(L+R) downmix reads ~6 dB
   low on decorrelated stereo)
   (`src/mastering/maximizer/streaming_preview.h:13-51`,
   computation at `streaming_preview.cpp:14-29`). Trivially portable to
   `loudness.ts` as a pure function — a natural "mastering targets" panel
   for the debonair studio.
6. **Auto-derived bounce length + instrument tail probe.** Bounce end = max
   over clips of `start+length` and last event frame; when the caller omits
   the length, replay scheduled events through the instrument in render order
   and ask it for its release tail (`materialize_tail_probe`), so MIDI-only
   arrangements still include tails
   (`src/c_api/project_bounce.cpp:46-68`, `:74-110`, contract note at
   `:146-155`). Mirrors the kathesis need to compute take length + tail at
   `scheduleTake`/export time instead of hardcoding a bar count.
7. **Coherent multichannel phase-vocoder stretch.** Bake time-stretch per
   segment where all channels share a reference polarity aligned per bin by
   correlation with channel 0 (anti-phase channels reinforce instead of
   cancelling, `src/engine/tempo_sync.cpp:132-145`) and apply the reference
   rotation `synthesis_phase − analysis_phase` to each channel's own analysis
   phase, preserving inter-channel phase exactly
   (`:174-186`); segment joins are smoothed by a crossfade anchored on the
   first sample after the boundary (`:215-232`). This is the correct recipe
   when `remixplan`/`beatgrid` need to warp imported audio to a tempo map.
8. **Self-describing parameter descriptors → generated UI.** Every processor
   and synth engine declares its own parameters (range, default, unit,
   display scale, cross-parameter bounds) and the host builds controls from
   `capabilityCatalog()` instead of a hand-written table
   (`README.md:39-41`; schema in `tools/capability-catalog.json`; enum shape
   in `include/sonare/sonare_c_types_functions.h:190-333`). Pattern for
   kathesis: one `paramDescriptors()` per engine feeding both the studio UI
   and validation.
9. **Scene schema with role-resolved master.** Buses carry a `role` string
   ("master" wins over id "master" when resolving the output bus; scene
   default role is "aux")
   (`src/mixing/api/scene.h:132-141`, resolution in
   `project_bounce.cpp:115-132`). A cleaner extension point than a hardcoded
   master id in `mixergraph`.
10. **Serialization guardrails.** Bounce results are cleared before any
    rejected call so a later query can never report diagnostics from a
    bounce that never happened (`project_bounce.cpp:134-167`), and every
    allocation is bounded by `checked_size_product` before it happens
    (`tempo_sync.cpp:58-78`). Worth adopting as conventions in the
    take/render path.

### What not to copy

- **`tools/gs/` (Roland GS tables, classic overlays, address censuses).**
  The GS insertion-effect tables are reverse-engineered from Roland's
  SC-88 material; GS is a Roland trademark. Study the *architecture* (SysEx
  reception, two realisations of an insert), never ship the derived tables.
- **Brand and product chrome:** "sonare studio", libsonare docs/demos site,
  audition harness, voice-match corpora (Bach excerpts).
- **Internal QA machinery** (`tools/parity/`, `tools/conformance/`,
  `benchmarks/`, ABI tooling ~100 files): process scaffolding, not engine
  logic; kathesis has its own gates.
- **Code as code:** Apache-2.0 permits use, but kathesis doctrine wants
  pure-TS re-implementations; take the algorithms, write the TS, keep the
  attribution note in the doc.

---

## 2. pulsegridstudio — the dependency-free DAW

### What it is

A single-page DAW in plain JS (725 lines total): polyphonic synth, bass,
pluck, procedural drums, PCM sampler, TPT filter, saturation, tempo-synced
stereo delay, lookahead compressor, session/arrangement clips, piano roll,
volume automation, Web MIDI/keyboard overdub, IndexedDB autosave, and WAV
export — all sharing **one** DSP implementation used unchanged by the
AudioWorklet, the export Worker and Node tests (`README.md:5-9`,
`engine/dsp.js:1-4`). The layout is Ableton-inspired, explicitly declared as
independent (`README.md:11-12`).

### Pipeline

`AudioWorkletProcessor` owns a `PulseEngine` (worklet thread); the main
thread talks to it through a command port (`project`, `param`, `note`,
`launch`, `capture-*`) and receives one packed telemetry object at ~24 Hz
(`engine/worklet.js:37`). Export does **not** use `OfflineAudioContext`:
`renderProject` instantiates the same engine on a Worker and renders in
128-sample blocks, inserting a pause exactly at the musical endpoint so
releases/delay tails continue through the requested tail
(`engine/offline.js:14-21`), then `encodeWav` writes RIFF PCM 16/24-bit
(`engine/wav.js`).

### Concrete logics to import

1. **Offline render without OfflineAudioContext, with latency-prefix
   discard.** Fixed 128-sample blocks; render total = musical frames +
   tail + known internal latency; write each block at `dest = at +
   i − maxLatency` so only the *known* latency prefix is discarded, never
   musical signal; `engine.pause()` exactly at the musical endpoint to
   carry release tails into the tail region
   (`engine/offline.js:14-21`). This is the pattern for a kathesis
   deterministic WAV export (Node/CI-safe, bit-comparable across block
   sizes — they test exactly that).
2. **TakeEngine-grade scheduler details:**
   - Clip launch quantization: a pending launch stores
     `pendingBeat = ceil((beat + step/2) / quantum) * quantum` and flips at
     a half-sample-resolution guard (`engine/dsp.js:57`, flip at `:62`).
   - **Note chase on seek**: when a cursor jumps into the middle of a clip,
     retrigger only notes still sounding at the seek position, with exact
     remaining duration, restarting oscillator phase rather than faking
     past DSP state (`engine/dsp.js:73-79`).
   - Sorted-note cursor + half-step windows for event scheduling
     (`engine/dsp.js:86`), loop detection by `cycle` + position regression
     (`:70-73`).
   These map 1:1 onto `takeevents.ts` schedule/seek fixes.
3. **Cross-track latency alignment.** Compressor look-aheads create
   per-track latency; the engine computes `maxLatency` over all tracks and
   gives every track `compensate = maxLatency − lookahead`, aligning all
   tracks to the slowest (`engine/dsp.js:44`, delay lines at `:129-131`).
   kathesis `playerbus` should apply the same rule when any node introduces
   latency.
4. **Voice pool + steal-by-lowest-envelope.** Fixed 24 voices, steal the
   quietest (`env` minimum) when full — no allocation in the render loop
   (`engine/dsp.js:31`, `newVoice` at `:9`). Plus the **signature-diff
   pattern**: musical data (clips/arrangement) is only re-sorted and
   re-indexed when a JSON signature changes, while compact parameter
   messages mutate coefficients in place (`:14-21`, `:45-52`).
5. **polyBLEP antialiasing in three lines.** `blep(t,dt)` correction applied
   to square/saw only (`engine/dsp.js:7-8`) — good enough for a lightweight
   oscillator upgrade in `vocalsynth`/`takeevents` synth voices.
6. **TPT SVF coefficients from a single `tan` call.** Topology-preserving
   state-variable filter with `g = tan(π·fc/sr)`, `k = 1/Q`, stable at
   audio rate, four state vars per channel (`engine/dsp.js:23-26`, tick at
   `:125-126`) — a pure-TS filter kathesis can adopt for per-track cutoff.
7. **Master safety as bounded soft clip, plus smoothed faders + peak/RMS
   telemetry.** `|x|>0.9 → sign·(0.9+0.1·tanh((|x|−0.9)·10))` — explicitly
   "not a brickwall" (`engine/dsp.js:139-141`); per-sample 0.002-lerp toward
   target volume/pan avoids zipper noise (`:132`); decaying peak/RMS meters
   (`:135`) feed the UI. TakeEngine polish items.
8. **Live event ring buffer with drop accounting.** 512-slot pre-allocated
   event ring; writer drops (and counts) when full; notes carry a
   `contextFrame` translated into worklet time `engine.frame +
   (contextFrame − currentFrame)` for latency-corrected live input
   (`engine/dsp.js:42,59-60`, translation in `engine/worklet.js:27`).
9. **Capture block pool with transferable recycle.** 8 pre-allocated 8192-
   frame stereo blocks; the worklet posts them zero-copy and the main thread
   copies then returns the buffers via transfer list (`capture-return`)
   (`engine/audio.js:21-23`, pool in `engine/worklet.js:5-7,39`).
   Memory-stable recording without GC churn.
10. **Project validate-and-clamp loader + labeled undo history.**
    `validateProject` throws on structural violations (version, ids unique,
    counts, ranges) and *clamps* every numeric to an explicit ranges table
    (`engine/model.js`, ranges at the `ranges={...}` literal), returning a
    normalized object; `History` keeps ≤80 labeled whole-state snapshots for
    undo/redo (`engine/model.js` `class History`). The `.pulse` container
    serializes PCM as base64 with a 256 MB budget and per-sample finiteness
    checks (`engine/storage.js` `serialize`/`deserialize`).

### What not to copy

- **Any Ableton Live reference in copy/UI claims** (`README.md:11-12` shows
  their own disclaimer — kathesis ships its own FL-informed design and must
  phrase inspiration the same way).
- **The demo song content** ("After Hours", clip names, note patterns in
  `engine/model.js` `demoProject`) — someone's authored musical data.
- **WebGPU visual pipeline** (`engine/visual.js`) — outside kathesis scope
  and duplicate of the Sol design system.
- **Brand bits**: the "Pulsegrid" name, `COLORS` palette, `.pulse` extension
  (take the *validate-then-clamp* idea, not the format identity).

---

## 3. magenta-js — the interchange & encoding library

### What it is

Google's TensorFlow.js music library (`music/src`): the `NoteSequence`
proto as the central interchange schema, quantization utilities, melody and
chord encoders, conditioning controls, MIDI I/O, player/visualizer, and
model wrappers (MusicRNN, MusicVAE, CoConet, GANSynth, DDSP, Onsets &
Frames, Piano Genie, SPICE). License Apache-2.0. The parts relevant to
kathesis are the **pure data-structure** modules (`core/sequences.ts`,
`core/melodies.ts`, `core/chords.ts`, `core/constants.ts`,
`core/aux_inputs.ts`) — not the tfjs model stack.

### Pipeline

MIDI/audio in → `NoteSequence` (`music/src/protobuf`) →
`quantizeNoteSequence` (snap seconds→steps, validate single tempo /
power-of-2 time signature) → model-specific encodings (melody grid, chord
one-hots, drum pitch classes) → model → decode → player/visualizer. The
encoding layer is the reusable part: every model just consumes tensors
produced from the same quantized sequence.

### Concrete logics to import

1. **Quantize-to-step with an adjustable cutoff.**
   `quantizeToStep(s, sps, cutoff=0.5) = floor(s·sps + (1−cutoff))` — the
   cutoff is a *fraction of a step* that decides whether early notes round
   up or down (`music/src/core/sequences.ts:27-36,101-106`). A quantize
   knob for the debonair piano roll ("tight ↔ humanized") for free.
2. **Minimum-1-step note repair + negative-time rejection.** Quantized end
   == quantized start → end+=1; negative times throw
   (`sequences.ts:130-146`). Prevents zero-length note degeneracies kathesis
   currently tolerates.
3. **Melody event-grid encoding.** `Int32Array` per step: `NO_EVENT(−1)`,
   `NOTE_OFF(−2)`, else `pitch − minPitch + FIRST_PITCH`; built from a
   sequence sorted by start then **pitch descending** so polyphony collapses
   to the top voice when `ignorePolyphony`
   (`music/src/core/melodies.ts:69-104`; constants `:1-55`). The canonical
   compact form for `rhythmgrammar`/`arranger` leads.
4. **Conditioning controls: onset rhythm + Parsons contour.** `MelodyRhythm`
   emits a depth-1 onset indicator; `MelodyShape` emits a depth-3
   up/same/down one-hot Parsons contour that propagates the *first* direction
   backwards through rests and continues the last direction to the end
   (`melodies.ts:156-254`). Exactly the shape of control signal kathesis
   needs to steer `arranger`/`rhythmgrammar` from a reference motif.
5. **Chord encoders with a NO_CHORD slot.** `MajorMinor` (1+2·12 one-hot),
   `Triad` (1+4·12), `PitchChord` (root one-hot ⊕ pitch-class bitmap ⊕ bass
   one-hot), all indexed by `quality·12 + root` with `N.C.` at 0
   (`music/src/core/chords.ts:167-258`, quality from interval sets at
   `:28-34`). Drop-in conditioning vocabulary for `harmonyengine` ↔
   `genrematrix` handoffs.
6. **GM drum taxonomy as 9 pitch-class buckets.**
   `DEFAULT_DRUM_PITCH_CLASSES` groups all GM drum notes into bass/snare/
   closed-hat/open-hat/toms×3/crash/ride (`music/src/core/constants.ts:28-52`).
   `rhythmgrammar` currently models kick/snare/hat only; this bucket table
   covers arbitrary GM drums and maps neatly onto pulsegrid's procedural
   drum ranges.
7. **Sustain-pedal CC64 → note extension, and consecutive-note merging.**
   `applySustainControlChanges` folds pedal events into note lengths;
   `mergeConsecutiveNotes` joins same-pitch neighbors
   (`sequences.ts:578,504`). Both are needed before any quantized editing in
   kathesis is honest about MIDI input.
8. **Sequence algebra: concatenate / trim / split-chunks.** Chunk a long
   sequence into model-sized windows and reassemble, with relative-time
   rewrites (`sequences.ts:743,788,873`). The pattern for chunked
   generation of long takes.
9. **BinaryCounter auxiliary input.** A step counter encoded as −1/1 bits,
   LSB first, as an auxiliary model input (`core/aux_inputs.ts:53-71`) — a
   cheap positional feature for any step-conditioned generator in kathesis.
10. **Exception taxonomy per contract.** Dedicated error classes
    (`MultipleTempoException`, `BadTimeSignatureException`,
    `NegativeTimeException`, `QuantizationStatusException` —
    `sequences.ts:38-74`) make failure modes part of the API surface;
    mirrors how kathesis engines should throw typed errors.

### What not to copy

- **The TensorFlow.js dependency and all model wrappers**
  (`music/src/music_vae`, `music_rnn`, `gansynth`, `ddsp`, `coconet`,
  `transcription`, `piano_genie`, `spice`) + checkpoints: conflicts with
  kathesis pure-TS doctrine, bundle budget, and the "no ML runtime" line
  drawn in the engine docs; revisit only behind a worker/ONNX seam.
- **The protobuf stack** (`music/src/protobuf/proto.js` generated code):
  replace with plain TS interfaces + the existing `takeevents` model.
- **tonal.js as a dependency** (used in `chords.ts:26`): kathesis'
  `musictheory` already owns this; port the *encodings* only.
- **Demos, visualizer styling, brand** ("Magenta" name, demo HTMLs).

---

## 4. acestep.cpp — prompt+lyrics → 48 kHz via GGML

### What it is

Portable C++17 GGML implementation of ACE-Step 1.5: Qwen3 text encoder +
Qwen3 LM (0.6B/1.7B/4B) that plans metadata + FSQ audio codes at 5 Hz, a
DiT (2B/4B) with flow-matching denoising at 25 Hz latents, and an
AutoencoderOobleck VAE decoding to stereo 48 kHz; HTTP server + browser UI
(`docs/ARCHITECTURE.md:1-9,38-58`). MIT licensed. Notable engineering: a
VRAM policy where exactly one GPU module is resident at a time
(`ARCHITECTURE.md:96-106`), GGUF bundling tokenizer+config (`:73-88`),
and cancel-aware generation.

### Pipeline

`AceRequest{caption, lyrics, bpm, duration, keyscale, timesignature,
vocal_language, seed, lm_*, inference_steps, guidance_scale, shift,
audio_cover_strength…}` (`src/request.h:11-64`) → prompt building + CoT
parsing (`src/prompt.h:14-55`) → **constrained decoding** of metadata
(PrefixTree + MetadataFSM) → LM emits audio codes (V=65536 compacted
sampling: temperature → top-k via `nth_element` → top-p nucleus →
multinomial; `src/sampling.h:14-60`) → FSQ codes → DiT context; DiT
denoises 25 Hz latents with APG guidance; VAE decodes tiled to 48 kHz
(`src/vae.h:456,561`).

### Concrete logics to import

1. **APG guidance for any cond/uncond generator.** Momentum-smoothed
   difference `cond − uncond` (running average with momentum −0.75),
   per-channel L2 norm clip to 2.5, decomposition into the component
   parallel/orthogonal to the conditional prediction, and
   `result = pred_cond + (scale−1)·orthogonal`
   (`src/dit-sampler.h:21-123`; projection `:45-65`, forward `:74-123`).
   This is a *portable* guidance improvement over plain CFG for the future
   kathesis generation backend (only meaningful when a neural generator
   lands, but the math is 80 lines).
2. **Batched CFG in one forward.** cond+uncond denoise in a single batched
   forward pass, halving model compute per step; when memory-bound, two
   forwards instead (`src/dit-sampler.h:170-171`). Same trick heartlib uses.
3. **Cover mode = timed context switching.** Generation can start from a
   source context and switch to silence/text2music context after
   `cover_steps`, with `audio_cover_strength` as the fraction of DiT steps
   that keep source context (`src/dit-sampler.h:145-146,422-424`;
   `src/request.h:64`). The conceptual skeleton for kathesis "remix/cover
   from reference" (`remixplan`), even in a non-neural form: run N steps of
   source-faithful planning then fade the planner to the target brief.
4. **Constrained decoding of structured metadata (PrefixTree FSM).** A
   prefix tree of valid token sequences plus a state machine over
   `bpm/duration/key:scale/time-signature/language` fields so an LM *cannot*
   emit invalid YAML metadata (`src/metadata-fsm.h:10-58`). kathesis
   `katexis.planTake` should validate/repair prompt→plan fields with the
   same FSM mindset (enumerate legal field values, reject or repair).
5. **Compacted-logit sampling.** For code tokens, compact the vocab to the
   legal subset (EOS + audio codes ≈65k) before top-k/top-p;
   `nth_element` O(V) for top-k; sort only survivors for top-p
   (`src/sampling.h:14-60`). Generalizes to "sample only from genre-legal
   chords/scales" in any kathesis sampler.
6. **Pluggable solver registry with NFE accounting.** Solver interface with
   `VelocityRecord` state, registry of euler/dpm/sde/stork with
   `nfe`/order metadata and graceful fallback to euler on unknown names
   (`src/solvers/solver-*.h`, dispatch+warning at
   `src/dit-sampler.h:396-411`). The naming/structure to copy for any
   step-wise kathesis generator ("solver" as strategy object, steps =
   NFE).
7. **Philox seeded noise per sample.** Deterministic Philox counter-based
   RNG for initial noise, seeds stored as int64 but consumed as low-32-bits
   to match the reference (`src/philox.h`, `src/request.h:26-29`). Matches
   kathesis mulberry32 determinism doctrine — Philox is the upgrade path if
   array-level parallel noise is needed.
8. **Cancel callback threaded through generation.** `bool (*cancel)(void*)`
   checked every step, with logged "Cancelled at step k/N"
   (`src/dit-sampler.h:147-148,415-418`). kathesis take generation (which
   can be slow) deserves the same first-class cancellation seam.
9. **Auto inference config per model tier.** `inference_steps 0 → auto
   (turbo: 8, sft/base: 50)`, `guidance_scale 0 → auto`, `shift 0 → auto`
   (`src/request.h:48-50`) — defaults resolved by model capability, so the
   API surface stays minimal. Same idea for kathesis genre→quality
   presets.
10. **Beat-frame hygiene at the request schema level.** `AceRequest` keeps
    `duration`/`bpm` as *unset-able* (0/"" = unset) and lets the pipeline
    derive them — the same unset-vs-explicit discipline kathesis plans
    should adopt (`src/request.h:13-21`).

### What not to copy

- **Model weights/GGUFs** (HuggingFace `Serveurperso/ACE-Step-1.5-GGUF`),
  the ACE-Step brand, and the browser UI chrome (screenshots in README).
- **The GGML/vendored tree** (`ggml/`, `vendor/`) — kathesis never ships a C
  runtime.
- **Server plumbing** (`server.sh/cmd`, `model-store`, HTTP layer): the
  debonair pipeline is in-app, not a local server product.
- License permits MIT reuse, but again: re-implement in TS where it lands.

---

## 5. heartlib — tags+lyrics music LM (HeartMuLa)

### What it is

Python/PyTorch package for the HeartMuLa family (Apache-2.0): HeartMuLa
music LM (llama3.2-torchtune backbones 300M→7B) over HeartCodec (12.5 Hz
causal codec, 48 kHz), conditioned on multilingual tags and lyrics; plus
HeartTranscriptor (whisper-tuned lyric transcription) and HeartCLAP
alignment (`README.md:13-21`). Their internal 7B is claimed Suno-adjacent
(`README.md:29-30`) — the direct architectural reference for what the
debonair "Suno-like" pipeline is really like under the hood.

### Pipeline

`HeartMuLaGenPipeline` (`src/heartlib/pipelines/music_generation.py`):
preprocess wraps tags in literal `<tag>…</tag>` tokens and adds BOS/EOS
(`:222-233`), builds a `[prompt_len, 8+1]` token matrix — one channel per
RVQ codebook plus a text channel — with the tags in the last channel and
the MUQ reference-embedding slot between tags and lyrics
(`:258-263`); CFG duplicates the batch with an unconditional mask
(`:268-282`). Forward: `generate_frame` per 80 ms frame with a KV-cached
backbone, top-k sampling, and per-frame EOS check against
`audio_eos_id` (`:297-353`); `max_audio_frames = ms // 80` caps length.
Postprocess: codec detokenize → save 48 kHz (`:355-359`). Lazy
load/unload purges CUDA cache between stages (`:171-198`).

The model core (`src/heartlib/heartmula/modeling_heartmula.py`): backbone
predicts codebook-0 token from the merged embedding sum; a small
**decoder LM** then predicts codebooks 1..8 conditioned on the backbone's
last hidden + c0 embedding (`generate_frame`, `:181-270`) — the MusicGen
two-stage RVQ pattern; CFG applies `uncond + (cond−uncond)·scale` on both
stages (`:226-231,255-262`). HeartCodec itself: SQ (single-quantizer,
causal) codec with Snake activations, downsample factors
`[3,4,4,4,5]` → 12.5 Hz, 8 codebooks @ 8192, plus a DiT/flow-matching
latent estimator in the same config
(`src/heartlib/heartcodec/configuration_heartcodec.py:6-55`,
`models/sq_codec.py`, `models/flow_matching.py:16-60`).

### Concrete logics to import

1. **The tags/lyrics prompt contract.** `<tag>…</tag>` + BOS/EOS framing
   with a reserved embedding slot between tags and lyrics for a reference
   audio embedding (`music_generation.py:222-263`) — this is, concretely,
   the prompt grammar a Suno-like competitor uses; kathesis `planTake`
   prompt schema should reserve the same three regions (style tags |
   reference | lyrics) even before any neural consumer exists.
2. **80 ms frame quantum end-to-end.** 12.5 Hz codec ⇒ 80 ms per token
   frame; generation length is `ms // 80` and every loop iterates a frame
   (`music_generation.py:331-350`). kathesis `timelinemodel` benefits from
   choosing one irreducible audio quantum for plans/schedules instead of
   mixing seconds/frames/steps.
3. **Frame-level EOS stop check.** Stop the whole track when any codebook
   emits `≥ audio_eos_id` (`:348-349`) — the stopping rule kathesis
   generators lack today (takes run to a bar count instead of a musical
   stop signal).
4. **Two-stage RVQ decoding split.** Big LM predicts coarse codebook 0;
   small decoder fills remaining codebooks from the coarse hidden
   (`modeling_heartmula.py:232-262`). As a *pure-TS analogy*: plan coarse
   structure with the full engine, fill detail voices with a cheap
   secondary pass reading only the coarse state — the layering kathesis
   `arranger` → per-track voices should formalize.
5. **CFG via duplicated batch + learned unconditional embedding.** Where no
   uncond text exists, a learned `unconditional_text_embedding` replaces
   the condition under a boolean mask (`:196-229`) — portable to any
   conditional kathesis generator (condition = plan; uncond = learned
   null-plan vector).
6. **Preprocess/forward/postprocess pipeline shape with parameter
   sanitization.** `_sanitize_parameters` splits kwargs into
   preprocess/forward/postprocess groups with explicit defaults (cfg 1.5,
   120 s cap, top-k 50) (`:200-211`) — the same three-phase contract the
   kathesis take pipeline already wants; adopt the *defaults table*.
7. **Lazy load + stage-scoped unload.** Models load on first use and are
   dropped (with cache purge) after their stage (`:114-198`) — the
   memory-discipline analog for kathesis workers: load analysis or
   synthesis resources per stage, never hold all engines live at once.
8. **Codec config as one file of numbers.** `HeartCodecConfig` enumerates
   every rate that matters (48 kHz, 12.5 Hz latent, codebook size, down/
   upsample factors) in one typed config (`configuration_heartcodec.py:6-55`)
   — keep kathesis audio constants in one engine-level config object.

### What not to copy

- **Weights and HF checkpoints** (HeartMuLa-oss-3B, HeartCodec encoder) —
  both out of bundle budget and license-adjacent concerns are nil (Apache)
  but kathesis ships no model binaries.
- **`models/feature_extractors.py` frontend**: adapted from MusicFM
  (ByteDance MIT notice at `:1-21`) and depends on Whisper/WavLM/torch
  transformers — study, don't embed; keep attribution if ideas cross over.
- **Brand assets** (logo, Discord, demo page, "Suno-adjacent" marketing),
  `assets/*.mp3`, MuLaCover weights.
- PyTorch/torchaudio dependency style: kathesis stays pure TS; the pipeline
  *contract* is what gets imported.

---

## kathesis import queue (prioritized top 10)

Each item names the kathesis engine file at the debonair root that would
receive it. Order = value/effort for the current P1-P7 lineage (pure-TS,
48 kHz, deterministic).

| # | Logic (source) | Lands in |
| --- | --- | --- |
| 1 | Note chase on seek + launch quantization `pendingBeat = ceil((beat+step/2)/quantum)·quantum` (pulsegrid `dsp.js:57,62,73-86`) | `takeevents.ts` |
| 2 | Offline render block-loop without OfflineAudioContext: pause-at-musical-end, tail through releases, discard only known latency prefix; RIFF WAV 16/24-bit encoder (pulsegrid `offline.js:14-21`, `wav.js`) | `playerbus.ts` (+ export path in `takeevents.ts`) |
| 3 | Cadence-graded chord HMM (Viterbi + beam, Weak-floor rule) (libsonare `chord_hmm.cpp:34-118,143-166,181-263`) | `harmonyengine.ts` |
| 4 | Streaming loudness preview: platform table {Spotify −14/−1, Apple −16/−1, YouTube −14/−1} → gain + ceiling-risk flag (libsonare `streaming_preview.h:13-51`, `streaming_preview.cpp:14-29`) | `loudness.ts` |
| 5 | Quantize-to-step with cutoff + min-1-step repair + sustain-CC64 fold + consecutive-note merge (magenta `sequences.ts:27-36,101-157,504,578`) | `timelinemodel.ts` (quantize) + `takeevents.ts` |
| 6 | Melody event-grid (NO_EVENT/NOTE_OFF) + Parsons contour & onset-rhythm conditioning controls + GM drum pitch-class buckets (magenta `melodies.ts:69-104,156-254`, `constants.ts:28-52`) | `rhythmgrammar.ts` + `arranger.ts` |
| 7 | Section self-similarity labeling with confidence floor (libsonare `section_analyzer.cpp:513-529,640-660`) | `analyze.ts` |
| 8 | Cross-track latency alignment `compensate = maxLatency − lookahead` + fixed voice pool steal-by-lowest-env + signature-diff table rebuild (pulsegrid `dsp.js:14-21,31,44,45-52`) | `playerbus.ts` + `takeevents.ts` |
| 9 | Constrained metadata FSM / prefix tree for plan fields (unset-vs-explicit request schema) (acestep.cpp `metadata-fsm.h:10-58`, `request.h:13-64`) | `katexis.ts` (planTake) |
| 10 | TPT SVF coefficients from `tan` + polyBLEP oscillators + smoothed faders/pan + bounded tanh master guard (pulsegrid `dsp.js:7-8,23-26,125-141`) | `takeevents.ts` (TakeEngine voices) |

Runners-up (kept visible, not queued now): multichannel coherent phase
vococoder stretch + segment-join fades (libsonare `tempo_sync.cpp:132-232`)
→ future `spectrum.ts` stretch util for `remixplan`; APG guidance +
batched CFG (acestep.cpp `dit-sampler.h:21-123,170-171`) → future neural
generation seam; key-profile menu (libsonare `key_profiles.cpp:9-56`) →
`analyze.ts`; frame-level EOS stop + tags|reference|lyrics prompt grammar
(heartlib `music_generation.py:222-263,348-349`) → `katexis.ts`/future
generation; self-describing parameter descriptors (libsonare
`capability-catalog.json`) → all engines' UI seam.

---

*End of dissection. Written by the K1 agent; read-only study, no app code
touched.*
