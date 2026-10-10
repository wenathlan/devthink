# enginemap — the katexis engine module map of debonair

the engine of the family's audio app lives at the debonair root (the app houses the engine; the other apps import the published library). this map is the honest state of the house: what exists today with its one-line contract, what the parallel waves owe, and the seam where cadria's published audio primitives enter. requirement source: `/tmp/allan/digests/debonair-engine-digest.md` · gap verdicts: `/tmp/allan/digests/debonair-gapmap.md`.

rule of the map: one domain per file, pure functions first, tables at the top, orchestrator last, ~300 lines, errors by typed result or machine-coded error, zero consumer data in the engine, seeded determinism in everything generated.

## the tree (current, verified 2026-10-10 · tsc exit 0 · vitest 88 green)

```text
debonair/
├─ katexis.ts              # engine domain types + mastering spec — badge/genre/timeline/mixer types, MASTERING (48khz, tp −1 dbtp, −14/−16/−9 lufs targets), prompt helpers (seed, name, duration); the ui contract, not a generator
├─ beatgrid.ts             # beat grid + tempo map — time-domain onset envelope, autocorrelation tempo (50–200 bpm, log-gaussian prior), dp beat tracking, quantize/swing/subdivide, tempo anchors with hold/linear/exponential curves and beatsElapsed/timeAtBeat
├─ loudness.ts             # ebu r128 metering + normalization — k-weighting bs.1770-4 (shelf+rlb), 400ms gating blocks, two-stage gate, lra (ebu 3342), momentary/short-term series, sample/true peak (4x linear estimate), gainToTarget + applyGain
├─ mixergraph.ts           # mixing graph state — channels, sends, mute/solo, master bus; effective gains and every routing path resolved as a pure acyclic tree (solo wins over mute, gains chain in db)
├─ remixplan.ts            # remix planner — per-beat chroma+cepstra similarity (60/40), self-similarity matrix, joint scoring on the diagonals, cut plan with equal-power crossfades; features arrive as parameters, dsp stays out
├─ speechalign.ts          # speech-to-grid alignment — rms frames, percentile noise floor, margin threshold, phrase bridging/trimming, slot fit with clamped stretch ratios and per-phrase offsets
├─ timelinemodel.ts        # arrangement timeline state — clips on tracks in seconds, snap/split/trim/move, overlap validation, minimum duration; the daw edit algebra, zero render
├─ ducking.ts              # sidechain auto-duck — rms envelope over prefix sums, activity regions with bridge/min rules, soft-knee compressor curve, attack/release follower, volume keyframes for the offline render
├─ db.ts                   # self-hosted sqlite runtime — better-sqlite3 wal, prepared parameterized statements only, schema mirroring prisma, content rows + render jobs; the site's storage, the future pattern db seat
├─ seed.ts                 # first-run content tables — genres, timeline tracks, mixer strips, readouts, library rows, stage cards, badges, locale choices (the offline answer of the static build)
├─ catalog.ts              # typed content accessor for the sol pages — https api when VITE_CATALOG_URL is set, in-memory seed otherwise, memoized promises, write-free
├─ familyurl.ts            # family link resolver — one level up, into the sibling deploy unit, slash-terminated; the cross-app link the chrome builds (verbatim family contract body)
├─ theme.ts                # sol dark/light on the document only — session scope, zero storage
├─ reveal.ts               # riseIn on scroll — one shared intersection observer at 12% visibility, mutation-watched, rescanned per route
├─ cleanurl.ts             # clean url bar — hash routes to paths, index.html and duplicate slashes out, campaign trackers stripped with replaceState, canonical + og:url in sync
└─ tests/                  # vitest — beatgrid 9 · loudness 11 · mixergraph 15 · remixplan 9 · speechalign 11 · timelinemodel 20 · ducking 9 · familyurl 4 (88 total)
```

## the seam (imported, never forked)

the official rule: the engine lives in one app and the others import the published library. cadria is the family's owner of the audio primitives; katexis imports them and owns everything daw-specific on top. no relative path between apps ever appears — the seam is the published package (`@wenathlan/cadria` subpath exports).

```text
@wenathlan/cadria (published library — the import seam)
├─ ./audiodecode        # decodeWav/downmix/resample/normalizePeak/fromAudioBufferLike → AudioFrames (float32 interleaved + sampleRate + channels); katexis never walks wav bytes itself
├─ ./audiofft           # radix-2 fft 256..16384, periodic hann/hamming/blackman, stft with exact frame count; every spectral katexis module reads its magnitudes here
├─ ./audiospectrum      # melbands, centroid, rolloff, flatness, flux, the 7 fixed bands (sub→brilliance), spectrogram decimator — the feature feed of remixplan and the b4 visualizer
├─ ./audiorhythm        # spectral-flux onset envelope, adaptive onset peaks, rhythm stats; replaces beatgrid's time-domain stand-in envelope
├─ ./audiorhythmbeat    # estimateBpm with comb refinement, canonicalTempo (half-time fold), downbeat grid, swing read, bpmOverTime — tempo facts katexis arranges into its tempo map
├─ ./audiotonality      # chromagram, krumhansl-schmuckler key, keyName, harmonic stats; audiotonalitychords adds the 7-quality chord timeline — remixplan's chroma producer
├─ ./audiotimbre        # 26-mel mfcc (dct-ii), slope/noisiness/warmth/brightness; audiotimbreenv adds rms envelope, dynamics, zcr — remixplan's cepstra producer
└─ ./audioattributes    # the shared summary shapes the fusion descriptor reads (32-dim + fnv-1a seed, optional for katexis)
```

kept in debonair on purpose (no cadria counterpart exists): loudness, ducking, mixergraph, timelinemodel, remixplan, speechalign, beatgrid's dp tracking + tempo curves. kept apart: cadria's timelineedit/timeticks solve video time in bigint ticks — the daw stays in float seconds until a wave decides otherwise.

## the waves (planned — contracts to honor)

```text
wave b1 (in flight — parallel agent 10-1-a, katexis theory core)
├─ musictheory.ts        # scales, chords, keys, intervals, modes + seeded rng — the deterministic vocabulary every generator reads; > 95% valid notes/chords
├─ harmonyengine.ts      # progressions, voice leading, inversions, substitutions — chord plans per genre and per bar
├─ rhythmgrammar.ts      # drum patterns per genre, swing, humanize, fills — 16th-grid events with velocity, seed-reproducible
└─ genrematrix.ts        # the 15-genre table (bpm, scales, drum feel, mix recipe pointers) — the single place a genre is named

wave b2 (synthesis + assembly + export)
├─ assembler.ts          # pattern db → markov order-n + csp with compatibility rules — an arrangement plan the synthesizer can run
├─ synthesis.ts          # sample-accurate recipe voices (kick808 pitch env, snare noise+body, hihat decay, pad saw harmonics, lead square+vibrato, bass sine+sub) — float32 stems out
├─ vocal.ts              # formant synthesizer (f1/f2/f3 per vowel) + pitch envelope + vibrato — a honest synthetic voice, not an sv claim
├─ layering.ts           # 10–15 sub-layers per genre with eq carving and panning plans — the mix bus the renderer applies
├─ patternstore.ts       # sqlite tables for features/patterns/fingerprints ("pre-chewed data") beside db.ts — prepared statements only
└─ export/               # midi writer (midi-file), wav writer (48khz float→pcm), the bounces the library rows promise — deterministic bytes for a given plan+seed

wave b3 (fingerprint + loudness completion)
├─ fingerprint/constellation.ts   # stft → landmark peaks → hash pairs (f1:f2:Δt) — pure js, indexed lookups (no o(n×m) scan)
├─ fingerprint/chromaprint.ts     # fpcalc wrapper under tools/bin (execFileSync, stderr, timeout) — the industry format when a binary is allowed
├─ loudness/limiter.ts            # true-peak limiter with a certified polyphase oversampler replacing the 4x linear estimate — tp < −1 dbtp actually guaranteed
└─ separation/hpss.ts             # tier-1 stem split (mid/side + centered moving average + rbj bandpasses) with cross-correlation quality report — dsp before any ml

wave b4 (realtime + viz)
├─ viz/waveform.ts       # min/max per bucket for canvas draw — the honest waveform under the playhead
├─ viz/spectrogram.ts    # stft frames → grayscale/color bitmap (cadria's decimator reused) — the waterfall the studio lacks
├─ viz/realtime.ts       # analysernode/worklet adapters over the same feature calls — the meters go live
└─ ml/onnx.ts            # onnxruntime wrapper (session cache, quantized models) — the tier-2 upgrade path for separation/classification, gated behind wave b3 quality targets
```

quality targets inherited from the digest: import < 5s per 3min · features < 10s · pattern generation < 10ms · wav export 3min < 5s · theory > 95% valid · lufs target −14 / tp < −1 dbtp · core bundle < 300kb.

## the honest gaps (top of the b2 backlog)

decode/fft/features are built but not yet imported (the seam above is specified, not wired); synthesis recipes, pattern store, midi/wav export, fingerprint, the tp limiter and realtime viz do not exist anywhere in the family yet. the full verdict table lives in `/tmp/allan/digests/debonair-gapmap.md`.
