# enginemap — the katexis engine module map of debonair

the engine of the family's audio app lives at the debonair root (the app houses the engine; the other apps import the published library). this map is the honest state of the house: what exists today with its one-line contract, what the parallel waves owe, and the seam where cadria's published audio primitives enter. requirement source: `/tmp/allan/digests/debonair-engine-digest.md` · gap verdicts: `/tmp/allan/digests/debonair-gapmap.md`.

rule of the map: one domain per file, pure functions first, tables at the top, orchestrator last, ~300 lines, errors by typed result or machine-coded error, zero consumer data in the engine, seeded determinism in everything generated.

## the tree (current, verified after the wave 16a recon pass · vitest 960 green / 64 files · tsc carries the three pre-existing rows the family tree owns)

```text
debonair/
├─ katexis.ts              # engine domain types + mastering spec — badge/genre/timeline/mixer types, MASTERING (48khz, tp −1 dbtp, −14/−16/−9 lufs targets), prompt helpers (seed, name, duration); the ui contract, not a generator
├─ spectrum.ts            # spectral kernel — radix-2 fft, hann framing, magnitude spectra, chroma folding, krumhansl-kessler key correlation (wave b2 · kathesis)
├─ fingerprint.ts          # audio identity — constellation peaks per band, pairwise landmark hashes (f1:f2:Δt), FingerprintDB add/search by votes; the dedup/identify seat (wave b2 · kathesis)
├─ analyze.ts              # the analysis pipeline — decode-side pure: frame features, spectral flux, fractional-lag tempo with the octave law, key from chroma, ebu loudness reuse, band ladder, structure sections → report.schema v1 (wave b2 · kathesis)
├─ vocalsynth.ts           # the formant voice — glottal saw + three-formant bandpass bank over the documented vowel table, seeded vibrato, consonant bursts, syllable grid from lyric lines (wave b2 · kathesis)
├─ musictheory.ts          # theory kernel — scales, interval math, chord vocabulary over twelve roots, roman numerals, voice leading (wave b1)
├─ harmonyengine.ts        # progression grammar — documented sets, cadence detection, tension, seeded progression generator, reharmonisation passes (wave b1)
├─ rhythmgrammar.ts        # drum-pattern grammar — the 16-step grid, eight genre families as glyph tables, swing offsets, accent curves, seeded fills (wave b1)
├─ genrematrix.ts          # the fifteen-genre style dictionary — bpm ranges, swing, pattern family, scale biases, progression set, lufs target, timbre hints (wave b1)
├─ arranger.ts             # the composer — prompt+seed → the whole TakePlan (genre match, seeded bpm/key, chord timeline, accented+swung grid, section voicing, timelinemodel clips, mixer strips); deterministic (5-b)
├─ takeevents.ts           # the event scheduler — plan → the flat time-ascending note list (drums+bass+keys+lead, fills, energy), window slices, grid position (5-b)
├─ beatgrid.ts             # beat grid + tempo map — time-domain onset envelope, autocorrelation tempo (50–200 bpm, log-gaussian prior), dp beat tracking, quantize/swing/subdivide, tempo anchors with hold/linear/exponential curves and beatsElapsed/timeAtBeat
├─ loudness.ts             # ebu r128 metering + normalization — k-weighting bs.1770-4 (shelf+rlb), 400ms gating blocks, two-stage gate, lra (ebu 3342), momentary/short-term series, sample/true peak (4x linear estimate), gainToTarget + applyGain
├─ mixergraph.ts           # mixing graph state — channels, sends, mute/solo, master bus; effective gains and every routing path resolved as a pure acyclic tree (solo wins over mute, gains chain in db)
├─ remixplan.ts            # remix planner — per-beat chroma+cepstra similarity (60/40), self-similarity matrix, joint scoring on the diagonals, cut plan with equal-power crossfades; features arrive as parameters, dsp stays out
├─ speechalign.ts          # speech-to-grid alignment — rms frames, percentile noise floor, margin threshold, phrase bridging/trimming, slot fit with clamped stretch ratios and per-phrase offsets
├─ timelinemodel.ts        # arrangement timeline state — clips on tracks in seconds, snap/split/trim/move, overlap validation, minimum duration; the daw edit algebra, zero render
├─ ducking.ts              # sidechain auto-duck — rms envelope over prefix sums, activity regions with bridge/min rules, soft-knee compressor curve, attack/release follower, volume keyframes for the offline render
├─ dawview.ts              # the pure view math — clock format, clip geometry, fader travel (−60..+6 db), meter percent, playhead percent (5-b)
├─ takestore.ts            # the session take shelf — takestore + studio hand-off keys over an injectable storage seam (session storage, memory fallback) (5-b)
├─ db.ts                   # self-hosted sqlite runtime — better-sqlite3 wal, prepared parameterized statements only, schema mirroring prisma, content rows + render jobs; the site's storage, the future pattern db seat
├─ seed.ts                 # first-run content tables — genres, timeline tracks, mixer strips, readouts, library rows, stage cards, badges, locale choices (the offline answer of the static build)
├─ catalog.ts              # typed content accessor for the sol pages — https api when VITE_CATALOG_URL is set, in-memory seed otherwise, memoized promises, write-free
├─ familyurl.ts            # family link resolver — one level up, into the sibling deploy unit, slash-terminated; the cross-app link the chrome builds (verbatim family contract body) — USED by the shell rail foot and the landing footer since 5-b
├─ theme.ts                # sol dark/light on the document only — session scope, zero storage
├─ reveal.ts               # riseIn on scroll — one shared intersection observer at 12% visibility, mutation-watched, rescanned per route
├─ cleanurl.ts             # clean url bar — hash routes to paths, index.html and duplicate slashes out, campaign trackers stripped with replaceState, canonical + og:url in sync
├─ labels.ts               # the copy law — every interface string lives in the label store, the typed accessor the wingets and the anchors read (the family template law)
├─ family.ts               # the family table — the sibling rows the surfaces render, beside familyurl.ts
├─ stages.ts               # the studio stage table — the six stages the desk stepper walks
├─ motionpref.ts           # the motion preference — reduced motion on the document, the family unit
├─ onboardingstate.ts      # the ONE writer of the first-run flags — the entry-flow contract (intro → onboarding → the platform) and the hostallowed https gate every lane rides
├─ tuning.ts               # the midi-to-hertz helper of the transport — the frequency law every voice reads
├─ arrangement.ts          # the clip binding — the edited clips re-slice the take's material by duration share, one law, fully deterministic (kathesis b3)
├─ pianoroll.ts            # the note editor — flat events to editable notes and back, the overlap policy, snap/quantize, validate with machine codes (kathesis b3)
├─ midiwriter.ts           # the standard midi file writer — ppq-quantized tracks, the gm drum map, validate-then-write (kathesis b3)
├─ wavwriter.ts            # the riff writer — 16/24/32f headers by hand, the parse-back law every bounce test rides (kathesis b3)
├─ stems.ts                # the stem planner — per-role stems from the schedule, the bounce manifest schema v1 (kathesis b3)
├─ cloudsync.ts            # the gateway persistence seam — /api/projects, the typed errors (offline/timeout/refused), the local shelf fallback (kathesis b3)
├─ takeexporter.ts         # the bounce desk of the studio — wav 16/24, midi, stems: every export a real render, no fake progress (5-b, moved to root)
├─ audioengine.ts          # the browser transport (root logic, moved from Sol/studio) — the WebAudio graph per take, the wave-b2 recipes, the lookahead scheduler, the offline render mirror (5-b · v2.28)
├─ hpss.ts                 # the tier-1 separator — median-filter hpss, centered framing, conjugate ifft, f64 ola, conservation 2.3e-7 over the whole signal (pv0)
├─ ingest.ts               # the decomposition pipeline — the debonair.ingest/1 document: mix + harmonic/percussive stems, per-second vector frames, the fnv-1a pcm hash (pv0)
├─ ingestrecon.ts          # the recon descriptor lane — wraps the ingest pipeline and seats the recon/3 descriptors: the 13-seat mfcc (the timbre library's dct-ii, imported), the 32-window envelope statistics, the top-5 peaks with the noise-floor guard, the yin f0 notes (window 80 ms hop 40 ms, the tonal harmonic stem only), the per-second flux/krumhansl-root/48-scale-fit/bpm, the ingest/1 → recon/3 converters (wave 16a · pr17)
├─ reconpayload.ts         # the reconstruction contract — the debonair.recon/3 document over the frozen 82-seat law (76 header, 66 layer, 4 correlations, the shared 64), the bidirectional dictionaries (48 scales, 12 roots, instruments, families, meters, encodings, mimes), the text whitelist, the duplicate-key scanner, the canonical serializer — the law itself lives in docs/recon.spec.md (wave 16a · pr17)
├─ ingeststore.ts          # the ONE writer of the ingest records (browser) — the gateway first under the https house law, the byte-capped offline mirror the honest fallback (pv0)
├─ playerbus.ts            # the shared playback host — ONE take engine for the whole app: the generated plans and the ingested references ride the same bus (pv2 · #229)
├─ bigintids.ts            # the id mint — time-ordered 64-bit decimal ids (clock in the high bits), the owner/service stamp every row rides (pv1 · the pointer mint)
├─ patternenums.ts         # the llm payload contract — the debonair.pattern/1 + timeline documents over the enum tables (48 scales, 8 voices, the lane keys), the validators that clamp, the instruction builder (pv d4 · #222)
├─ blobstore.ts            # the content-addressed blob store — put/get streams, the hand-rolled sha256, the minted ids, the shard layout the vault serves (pv1 · #224)
├─ ingestdb.ts             # the node/sqlite half — the reference columns (owner, kind, visibility, blob addresses), the job ledger, parameter binding only (pv1 · #221/#228)
├─ ingestworker.ts         # the server ingest worker — decode → separate → analyze → segment → store, the wavs per stem + mix: the pipeline outside the visitor machine (pv1 · #226)
├─ ingestclient.ts         # the typed client of the ingest lane — ok/err with machine codes, the https house law before any byte leaves, the owner identity seat (pv1 · #233)
├─ ialane.ts               # the system ia ingest lane — the service identity, the reference kind, the vitrine visibility: the library grows without a human (pv1 · #233)
├─ gatewayapi.ts           # the http route table — the nine routes (the ingest upload/jobs/shelf/read/delete, the blob stream, the miner mine/list/read), the nine-column ledger, the visibility law (pv1/pv3 · #228/#231)
├─ patternminer.ts         # the pattern miner — the genre profile document (debonair.profile/1), the cosine rank over the normalized segment vectors, the key pool and onset curves (pv3 · #227)
├─ composer.ts             # the composer — the prompt meets the genre profile, the seeded plan lands near the centroid, the similarity floor and the ranked references audit the chain (pv4 · #230)
├─ renderworker.ts         # the server render job — the engine's own voice recipes sample-accurate at 48 khz, mono pcm 16, determinism total (pv4 · #232)
├─ renderjobs.ts           # the render ledger + the tracks table seat — the walk queued → rendering → done, the pointer chain (pv4 · #232)
├─ Sol/                    # the surface tree — the shell (the rail, the footer, the shared player bar), the pages (home, generate, ingest, library, studio, settings, intro, onboarding, 404), the wingets (the cover art, the entry gate, the genre card, the song card, the player bar, the studio fader/piano roll/spectrum/stage stepper/timeline/vu meter) and sol.css — the os face of the design reform, the embedded/standalone seat law (pv5 · #225)
└─ tests/                  # vitest — 64 files, 960 tests green: the battery the wave 16a recon pass recorded (the suite inventory in debonair/tests/ — the recon contract 27 rows, the recon descriptors 18, the pattern enums, the blob store, the gateway contract, the miner, the composer, the render lane, the player bus, the sol css pin, the family battery)
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

## the waves (the landed record — refreshed 2026-10-30 by the D20 pass)

```text
kathesis b1 (landed)       # musictheory, harmonyengine, rhythmgrammar, genrematrix — the theory core, every table the generators read
kathesis b2 + 5-b (landed) # spectrum, fingerprint, analyze, vocalsynth, arranger, takeevents, the sol surfaces, the studio desk and the session shelf
kathesis b3 (landed)       # pianoroll, arrangement, timelinemodel edits, wavwriter, midiwriter, stems, cloudsync, db — the daw editing desk, the writers, the live viz, the gateway persistence
pv0 (landed)               # hpss, ingest, ingeststore, the /ingest bench — the decomposition pipeline and the debonair.ingest/1 document
pv1-pv4 (landed)           # bigintids, patternenums, blobstore, ingestdb, ingeststore, ingestworker, ingestclient, ialane, gatewayapi, patternminer, composer, renderworker, renderjobs, playerbus — the reconstruction's fourteen (the ingest lane, the miner, the composer, the render lane)
pv5 (landed)               # the design reform (the os face) + the design verification (docs/designverification.md — every route walked, the sol debt cleared)
wave 16a (this branch)     # the recon contract law — reconpayload.ts + ingestrecon.ts + docs/recon.spec.md: the RECON-V3 freeze (the 82-seat law, the bidirectional dictionaries, the four anti-base64 strategies, the reconstruction ladder), the descriptor lane (mfcc/envelope32/peaks/yin/flux/scale/bpm) and the ingest/1 → recon/3 converter — pr17
b4 backlog (open)          # viz/waveform, viz/spectrogram, viz/realtime, ml/onnx — the realtime and tier-2 upgrade path, gated behind the quality targets
recon ladder (open)        # the rungs above the payload (the blob/pcm identity seat, the additive-seed synthesis, the pattern-synth rung) wait on the wave 16a freeze merging — docs/recon.spec.md §6 carries the ladder
pv tail (open prs)         # #235 the vitrine publish (generateclient, the tracks routes, the visibility column, the with-voice key), #236 the npm face (the exports map, the module closure), #237 the family integration (the getry lane mount, vaultblobstore, sandboxmodality, mcplane) — pending merge, the state docs/worklog.md records
```

## the honest gaps (refreshed by the wave 16a recon pass)

the reconstruction closed the pipeline loop the planning ladder drew: ingest (the bench, the worker, the store), separate (hpss conserved), analyze (the vector document), mine (the profile), compose (the seeded plan), render (the offline wav), play (the shared bus) — and the wave 16a recon pass froze the canonical analysis contract on top (debonair.recon/3, the 82-seat law) with the descriptor lane that fills it; the battery pins it at 960 green. what stays open, honestly: the analysis seam of the map above answers locally — the engine-ownership law moved the audio analysis family under the debonair root, so katexis reads its siblings as root modules while the published-library seam (the @wenathlan/cadria specifier pattern coverpalette.ts already rides for the palette) waits for the audio half; the recon ladder's upper rungs (the blob/pcm identity seat wired to the recon hash, the additive-seed synthesis, the pattern-synth rung) are specified in docs/recon.spec.md §6 and wait on their own waves; the server lanes need the deployed gateway — on a dev server the app answers through the honest offline seams (the store falls to the session mirror, the typed clients refuse the empty origin under the https house law, the vitrine cards answer the honest untrained seed); the b4 backlog (the realtime worklet, the certified tp limiter, the tier-2 onnx separation) waits behind the quality targets; and the vitrine publish, the npm face and the family mount ride the open prs #235/#236/#237 — merge them and the reconstruction closes.
