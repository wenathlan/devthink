# reference.study — the outros.debonair blobs dissected for the reconstruction waves

> wave D1. the full read of the owner's reference folder "outros.debonair"
> (the dedup-merged blobs of the vector-one music app, v1 and v2 lineages).
> this document is the complete version of the digest that lives inside
> docs/planningpipeline.md — every part of the reference is named, what it
> does, which lineage generation it belongs to, and which debonair wave
> imports it. nothing here was copied verbatim into the codebase; this is
> the map, not the implementation. companion of docs/competitordissection.md
> (same study discipline, external sources) and docs/enginemap.md (the
> debonair side that receives the imports).

study material read in full, top to bottom: the dedup-merged schema.ts,
analysis.ts, embedding.ts, dsp.ts, generator.ts, engine.ts, studio-repo.ts
and studio-store.ts of the v2 tree, plus the dedup report of the whole
folder. the v1 page and the node decode lane (documented in the digest of
planningpipeline.md) are cited where the blobs do not carry them.

---

## 1. what the reference is

outros.debonair is a folder the owner filled with cascading copies of a
self-contained music generation product called vector-one: an app that
dissects imported audio into per-second vector documents, composes new
songs from natural-language prompts (pt/en), renders them through a
hand-built web audio engine, exports wav/mp3/midi/json, and learns the
user's own style from every saved project. the folder holds two app
generations plus a node lane:

- v2 — the studio, built twice over in the copy cascade (a next.js
  app-router tree and a vite/react entry coexist): a typed json contract
  family (the vector-one documents), a browser-side audio dissector, a
  prompt-driven composer with style presets, a web audio engine with
  eight melodic voices and four drum machines, an orm/postgres
  persistence layer with an in-memory fallback, and api routes for
  generate, analyze, projects, model, similar, health and dependencies.
- v1 — the single-page predecessor the digest records: a six-layer
  biquad separation, a pcm store keyed by session, second and track, and
  a priority playback ladder (stored pcm, then hex inline, then seed
  synth, then pattern synth) scheduled on the audio buffer source clock
  over a strict one-second-per-cell grid.
- mjs — a node decode lane (an analyser and an ffmpeg wrapper) that
  turned files into per-second vectors outside the browser, with known
  bpm octave-fold bugs the debonair analyze already handles.

the folder arrived as an unmanaged copy cascade — the same file saved
again and again with os duplicate suffixes. the dedup report (two
concatenated passes over the folder) gives the verdict:

| measure | before | after | verdict |
| --- | --- | --- | --- |
| files | 727 | 106 | 621 copies removed (85.4 percent of the file count) |
| bytes | 5,625,430 | 1,863,811 | 3,761,619 bytes of duplication removed (66.9 percent) |
| groups | — | 106 | one target per unique file, zero errors |
| identical members | — | 529 | byte-equal copies deleted outright |
| merged members | — | 92 | copies whose unique blocks were appended under fonte markers |
| second pass | — | 0 groups | the real pass found nothing left to collapse (43 ms) |

the duplication was not uniform. every file of the audio library existed
in fourteen copies (the base plus thirteen numbered); package.json and
tsconfig.json existed in twenty. the heaviest merged groups are the api
routes — the analyze route carried 46,760 bytes across its fourteen
copies and collapsed to 3,344. the 106 surviving targets break down as
follows, and the breakdown is the scope map of this study:

| target family | files | role in the reference |
| --- | --- | --- |
| audio library | 6 | the contracts, the dsp core, the dissector, the embedding space, the composer, the engine — the import material |
| api routes | 8 | generate, analyze, projects, model, similar, health, dependencies — the server lane the digest documents |
| studio components | 3 | the sequencer, the panels, the studio shell |
| persistence | 5 | the db runtime and schema, the repository, the studio store |
| motors library | 24 | a file-workspace ide that lived beside the studio — not audio |
| workspace modals | 30 | archive viewer, hex view, merge conflict, sandbox, security, splitter, docks — not audio |
| pages and shell | 8 | the app pages, layouts and entries |
| config | 22 | build configs, locks, readme — inventory only |

two caveats the reconstruction must know: the dedup report covers only
the v2 tree (v1 and mjs are known from the digest, not from the report),
and the blob set shipped for this study includes one false positive — an
unrelated game hud engine file pulled in beside the audio blobs; it is
not part of the reference and this study ignores its content. the
non-audio half of the v2 tree (the motors library and the thirty modal
components) is deduplicated inventory, not audio logic; the debonair
waves import none of it.

## 2. the lineage — five generator generations

the dedup merge preserved the copy cascade as ordered sections: the
newest generation on top, older ones below under fonte markers. the
audio lineage reads cleanly from the content, and the schema file
carries the same story (an early five-scale enum with three voices
versus the current free scale string with eight voices). oldest to
newest:

| generation | what it is | what it added over its predecessor |
| --- | --- | --- |
| 13 (oldest) | the vary engine | variation as interpolation in the 32-dim embedding space: the blended vector's chroma weights pick candidate pitch classes, the markov chain re-voices the lead, fills land on empty strong beats, drums mutate by probability |
| 11 | the mood composer | prompt → mood taxonomy (seven moods), a progression table per mood, melody as a per-16th probability grid, drums sampled from the learned histogram after two trained projects, long-form section chaining with drift and energy cycles, mid-song groove evolution |
| 5 | the style system | eight professional style presets (trap, drill, lofi, house, phonk, techno, afro, synthwave) with bpm ranges, one scale each from a five-scale library, exact drum lanes and swing; a six-cell rhythm library; the bass-locked-to-kick law; the markov stepwise bias; intensity-trimmed phrases; root resolution at bar ends |
| 3 | the harmony expansion | the 48-scale library replacing the five-scale enum; a ninth style (jazz); per-style scale pools, registers, lead voices and swing; prompt keyword scale detection with ambient and oriental overrides and accidental-aware root notes; octave-jump contour; the salt parameter for fresh takes per click; bass moved down to the true 808 octave |
| current | the groove lock | per-style groove templates (main pattern, fill pattern, accent steps as step-duration pairs) — melody onsets, durations and velocities now come locked from the style groove, with a fill bar every fourth bar; the six-voice lead family; diatonic drift variation; energy-shaped section chaining; composeLong returns the style swing for the transport |

the engine tells the same story in parallel: the oldest generation has a
saw-plus-square lead, a plain compressor master and a 1.6-second noise
reverb; the next adds the three-saw supersaw lead and a drive shaper;
the next wires swing and seek into the transport; the current engine
carries the eight melodic voices, the sub-tail kick, the
darkening-impulse reverb and the offline render mirror. the studio store
grew in step (no swing, then swing and seek, then the salt and the
duration-aware note drawing).

the lineage value for debonair is the ordering law it proves: the
composer's musicality came from structure added in stages — style
presets first, then harmony breadth, then the rhythm lock — and every
stage is independently importable.

## 3. the vector-one contracts

three zod-signed json documents define the whole data surface. the
timeline is what the dissector produces from audio; the project is the
symbolic score the studio edits, schedules and renders; the model state
is what the local learner accumulates. both schema generations share the
same frame; the difference is the voice list (three voices early, eight
now) and the scale field (enum early, free string now).

### timeline — vector-one/timeline@5.0

the dissected audio, one frame per second:

| field | type | meaning |
| --- | --- | --- |
| schema | literal | the version tag of the timeline document |
| source | enum | import, generated or variation — where the timeline came from |
| bpm | number 30–300 | tempo estimate from the onset intervals |
| seconds | number | source duration |
| embedding | number[32] | song-level vector (mean of frames with spread and duration folded in) |
| frames | frame[] | one row per second of audio |

| frame field | type | meaning |
| --- | --- | --- |
| s | int | second index |
| rms | 0–1 | loudness of the second |
| centroid | number | spectral centroid in hz |
| flux | number | spectral flux level |
| chroma | number[12] | normalized pitch-class energy |
| embedding | number[32] | the frame's vector in the shared space |
| events | event[] | onsets and the dominant note inside the second |
| tags | string[] | per-second labels (rhythmic, melodic, low-heavy, energetic — in pt) |

| event field | type | meaning |
| --- | --- | --- |
| kind | enum | note or transient |
| note | string? | note name for notes, kick/hat/hit classification for transients |
| pitch | 0–127? | midi pitch, cents precision |
| onset | 0–1 | seconds offset inside the one-second cell |
| velocity | 0–1 | strength derived from onset strength and rms |
| confidence | 0–1 | strength relative to the file's mean flux |
| hz | number? | fundamental in hertz |

### project — vector-one/project@5.0

the symbolic score:

| field | type | meaning |
| --- | --- | --- |
| schema | literal | the version tag of the project document |
| bpm | 40–240 | tempo |
| root | int 0–11 | pitch class of the tonic |
| scale | string | scale name from the 48-entry library (free string for forward compatibility; enum of five in the older schema) |
| bars | int 1–128 | length in bars |
| mood | string | label derived from the prompt |
| prompt | string | the originating prompt text |
| drums | lanes | four 16-step binary lanes: kick, snare, hat, clap |
| notes | note[] | the melodic events |
| embedding | number[32] | the score's vector in the shared space |

| note field | type | meaning |
| --- | --- | --- |
| step | int | 16th-note index, may exceed 16 in multi-bar songs |
| pitch | 0–127 | midi pitch |
| vel | 0–1 | velocity |
| dur | 0.25–16 | duration in steps |
| voice | enum | one of lead, pluck, keys, bell, arp, flute, bass, pad (three voices — lead, bass, pad — in the older schema) |

### model state — the local learner

| field | type | meaning |
| --- | --- | --- |
| version | int | schema version counter, incremented on every training pass |
| trainedOn | int | number of projects the model has seen — the gate for learned influence |
| noteBigram | record of record of number | pitch → pitch → count, first-order markov over the lead melody |
| drumHistogram | record of number[16] | lane → per-step probability, a running mean clamped at 0.95 |
| centroid | number[32] | running mean of all project embeddings |
| scaleAffinity | record of number | scale name → usage count |
| bpmHistogram | record of number | tempo bucket (rounded to tens) → count |
| updatedAt | string | iso timestamp of the last pass |

the contract family is the reference's strongest idea: import, generate
and vary all produce documents in one grammar, so similarity search and
the learner work over everything the user owns. debonair's ingest
document already follows the same law (one vector frame per second,
versioned, signed); the profile and plan documents of the pv waves
extend it.

## 4. the 32-dim embedding space

one vector layout serves both worlds — the symbolic score and the
analyzed second — so a composed project and an imported track are
comparable by cosine similarity. the layout is documented in the dsp
core:

| dims | name | contents |
| --- | --- | --- |
| 0–11 | chroma | the pitch-class distribution (harmonic fingerprint) |
| 12–15 | band shape | centroid, rolloff, flatness, zero-crossing rate — normalized |
| 16–19 | rhythm | onset density, onset strength, duration density, syncopation |
| 20–23 | dynamics | rms mean, rms spread, velocity mean, velocity spread |
| 24–27 | register | pitch mean, pitch spread, pitch min, pitch max — scaled to the midi range |
| 28–31 | temporal | tempo, event-count log, low-band ratio, high-band ratio |

three builders fill the space. the project embedder turns a score into a
vector: chroma from velocity-and-duration-weighted note pitch classes;
band shape from lead pitch, hat density and pad presence; rhythm from
lead density, drum density, note duration and the offbeat ratio;
dynamics from velocity statistics; register from lead pitch statistics;
temporal from bpm, note count, bass density and hat density. the frame
embedder turns one analyzed second into the same layout from acoustic
features (centroid over 8 khz, rolloff over 12 khz, onset count over
three, rms over 2.4, the dominant pitch as midi, the band ratios), with
a few slots pinned to constants where the acoustic side has no measure.
the song embedder is the mean over frames with the rms spread folded
into the dynamics slots, tempo and duration overwriting the temporal
slots. the meyda mfcc enrichment of the dissector squeezes one cepstral
coefficient into a register slot the symbolic side leaves to pitch
spread — a documented asymmetry, not a bug.

two laws ride on top of the space. similarity is cosine over the
32 dims, with null and nan guarded to zero. variation is linear
interpolation — the source vector blended toward a target (the model
centroid or an explicit vector) by a t parameter; the blended vector
steers the variation's density and pitch-class choices. one honesty
note the reconstruction should keep: the space's "normalize" step is a
range clamp (zero to 1.5 with a finite guard), not a unit-norm
projection — scale invariance belongs entirely to the cosine; and the
layout comment states the tempo slot as bpm over 200 while the builders
divide by 220, a stale doc number the clamp absorbs.

## 5. the aurora composer

the composer is a seeded, deterministic prompt-to-score engine: same
prompt and salt, same take. its parts:

### the 48-scale library

a named interval-set library grouped by family:

| family | count | members |
| --- | --- | --- |
| majors and modes | 7 | major, dorian, phrygian, lydian, mixolydian, minor, locrian |
| harmonic and melodic | 9 | harmonic/melodic minor and major, dorian b2, lydian augmented and dominant, mixolydian b6, locrian nat2, super locrian |
| pentatonic and blues | 6 | minor and major pentatonic, minor and major blues, bebop dominant and major |
| symmetric and exotic | 5 | whole tone, both diminished, augmented, chromatic be-bop |
| world and cinematic | 18 | phrygian dominant, hijaz, double harmonic, enigmatic, hungarian minor and major, persian, spanish eight-tone, prometheus, tritone, insen, iwato, kumoi, in-scale, yo, gypsy major, both neapolitans |
| lo-fi and soul staples | 3 | maj7, min9, acoustic |

unknown names fall back to the minor pentatonic. the count is exported
as a constant so the callers (and the tests) can assert the library
never silently drifts.

### the nine style presets

| style | bpm | lead | register | swing | kick steps | character |
| --- | --- | --- | --- | --- | --- | --- |
| dark trap | 88–100 | pluck | 60–84 | 0.12 | 0, 6, 10 | minor-pentatonic and harmonic pools, sparse hats, claps on 4 and 12 |
| uk drill | 138–146 | bell | 62–86 | 0.18 | 0, 3, 6, 11, 14 | hijaz and phrygian dominant pools, dense syncopated hats |
| lofi chill | 72–80 | keys | 55–79 | 0.34 | 0, 10 | dorian and major-pentatonic pools, eighth hats, no claps |
| house groove | 122–126 | keys | 58–82 | 0.08 | 0, 4, 8, 12 | four-on-the-floor, offbeat hats, claps on 4 and 12 |
| phonk | 124–132 | bell | 65–88 | 0.10 | 0, 4, 8, 12, 15 | phrygian and hijaz pools, dense hats |
| melodic techno | 120–126 | arp | 60–84 | 0.05 | 0, 4, 8, 12 | odd-step hats, prometheus pool |
| afro house | 118–122 | flute | 62–86 | 0.20 | 0, 3, 6, 8, 11, 14 | major and lydian pools, syncopated snare |
| synthwave | 96–104 | arp | 58–82 | 0.06 | 0, 4, 8, 12, 14 | minor and lydian pools, eighth hats |
| jazz keys | 78–96 | keys | 55–81 | 0.30 | 0, 11 | bebop and blues pools, swung eighths |

each preset also carries a snare lane, a hat lane, a clap lane, a
four-degree chord loop (one degree per half-bar, cycling), an intensity
scalar and a groove template. the prompt parser can override the preset:
an ambient keyword set swaps in a dreamy ambient variant (slower,
flute-led, near-zero swing, a lydian/whole-tone/insen pool) and an
oriental keyword set replaces the scale pool with the hijaz family.

### prompt parsing (pt/en)

style from keywords (with lo-fi, chill, retrowave, rhodes and bebop
aliases); mood suffixes from bright/dark words; bpm from an explicit
number-with-unit match, clamped 60–200, otherwise a seeded pick inside
the style range; scale from an explicit keyword first (fourteen
patterns from dorian to bebop), then major/minor words, otherwise a
seeded pick from the style pool; root from an isolated note letter with
sharp or flat, otherwise a seeded pick from the four trap tonal
centers; intensity from the style with seeded jitter; the prng seed is
the prompt text itself, plus an optional salt for fresh takes.

### the musicality laws

- bass locked to kick: every kick onset gets a bass stab on the chord
  root in the 808 octave, velocity near max, unless a bass note already
  sits there — the rhythm-section rule the ci verifies.
- melody locked to groove: lead onsets, durations and velocities come
  from the style's rhythm template (main pattern per bar, fill pattern
  every fourth bar, accent steps), trimmed at low intensity to the
  strong steps.
- chord resolution: each bar takes its degree from the style loop; the
  candidate pool is the scale around the chord, chord tones preferred
  on accented and final steps; the last note of the bar resolves to the
  chord root; occasional octave jumps add contour.
- markov with a stepwise bias: when the model has bigram rows, the next
  pitch is a weighted pick over the candidates with a bonus for moves
  within three semitones; without a model, near candidates only.
- pads follow the harmony: root and third in the mid register each bar,
  quiet and long.
- humanization: velocities jitter inside a small band, accents louder,
  all clamped sane.

### long form, drift and energy

the two-bar base section is chained into a full song: target bars from
the requested seconds (clamped 30–190 seconds, 2–128 bars), sections of
two bars, each later section a variation of the previous one — the
manual vary button, automated. the drift cycle (six values around 0.16
to 0.5, plus seeded jitter) sets how far each variation walks; the
energy cycle (six values around 0.84 to 1.08) scales velocities into a
build-and-drop arch. vary itself preserves the rhythm skeleton, the
bass-kick lock and the pads; lead pitches move by scale steps through
the 48-scale library (nearest-tone snap, then a walk of one or two
steps), weak-step notes thin out as t grows, register can wander an
octave, phrase-end fills appear on empty bar ends, hats evolve subtly,
and the embedding is the blend toward the target — the document carries
its own drift vector.

## 6. the audio engine

a single web audio graph, hand-built from oscillators, noise, filters
and envelopes — no samples. the voice recipes:

| voice | recipe |
| --- | --- |
| kick | sine body with a two-stage pitch envelope (165 → 52 hz in 55 ms, settling to 40 hz), a separate 50 hz sub tail starting 20 ms later, and a high-passed noise click; pan slightly left |
| snare | noise through a bandpass at 1750 hz over a dual-triangle body (187 and 330 hz), medium wet |
| hat | noise through a highpass at 7800 hz, closed 38 ms or open 240 ms |
| clap | four noise bursts 9.5 ms apart, each bandpass tuned slightly higher than the last, the final burst carrying the tail |
| pluck lead | triangle body plus a quiet sine octave sparkle, a lowpass that opens with velocity and settles, vibrato only on held notes |
| 808 bass | sub sine that snaps from double frequency down in 45 ms, a driven mid saw through a lowpass at 480 hz, a shaper for warmth |
| pad | two detuned saws and a triangle through a lowpass whose cutoff breathes on a 0.28 hz lfo, long attack and release, heavily wet |
| keys | sine warmth with a soft detuned partial, a slow tremolo on the gain — the rhodes slot |
| bell | three inharmonic sine partials (ratios 1, 2.76, 5.4) with staggered long decays — the drill and phonk staple |
| arp | bright square with a saw octave, a snappy resonant lowpass sweep |
| flute | sine with vibrato on the frequency plus band-passed air noise tuned to the second harmonic |

every voice exits through a shared helper: gain, stereo pan, master,
plus wet sends — reverb at the wet level, delay at 65 percent of it.
the master chain is a gain (0.8) into a tanh-style soft-clip waveshaper
(curve k 3.2, 2x oversampled, with a slight edge lift) into a
compressor (threshold −13, knee 18, ratio 4.5, attack 3 ms, release
160 ms) into an analyser (fft 2048, smoothing 0.82) into the
destination. two send effects live beside it: a tempo feedback delay
(0.27 s, feedback 0.34, a lowpass damper at 2800 hz with a highpass at
400 hz inside the loop, wet out 0.34) and a generated plate reverb — a
two-second stereo impulse of white noise darkening through a one-pole
lowpass whose cutoff rises over the tail, with a power-curve envelope
(exponent 2.2) — wet out 0.26. a one-second white noise buffer feeds
every noise voice.

the transport schedules the 16th-note grid on the audio clock: a 28 ms
interval loop with a 140 ms look-ahead, swing applied to odd steps as a
fraction of the step duration (up to 0.6), seek from any step, looping
over the full bar count, per-lane drum velocities (hats accented on the
offbeat), and a step callback for the ui. the playhead is derived from
the context clock against the start time, so it survives tempo math.

the offline render mirrors the graph in an offline context at 44.1 khz
stereo: a light master (gain, shaper at a hotter curve, compressor),
per-voice simplified recipes that follow the live ones (the kick's
pitch envelope and click, the snare's noise and body, detuned pads,
partial bells, the bass snap), scheduled over the full step count plus
a 1.4 second tail. from the rendered buffer, two encoders run fully
client-side: a 16-bit pcm wav writer with the riff header built by
hand, and an mp3 encoder (lamejs) at 128 kbps stereo in 1152-sample
blocks. the studio store adds a midi exporter (tonejs) — tempo header,
ppq-quantized steps, named notes, and a gm drum track (kick 36, snare
38, hat 42, clap 39) unrolled across the bars — and a json export of
the document itself.

## 7. the pattern miner shape

the learner is deliberately small and local — no gradients, just
counting. it trains on every saved project and conditions the next
generation:

| part | mechanism |
| --- | --- |
| note bigrams | consecutive lead pitches (steps sorted) counted into a pitch → pitch map; consumed by the composer as a weighted pick with a stepwise bias |
| drum histograms | per-lane 16-step running probability — the new observation averaged with the history weighted by the training count, clamped at 0.95 |
| adoption threshold | the composer adopts a learned kick step only after at least three trained projects, only where the histogram exceeds 0.55, only on even steps, and only on a coin flip — style first, learning as seasoning |
| centroid | running mean of the 32-dim embeddings; the variation target when no explicit vector is given |
| scale affinity and bpm histogram | usage counts per scale name and per tempo bucket (rounded to tens) |
| similarity | cosine over the stored 32-dim embeddings, self excluded, top five |
| retrain | a full pass that empties the model, replays every parseable stored project, then recomputes the centroid defensively as the plain mean of all embeddings |

the miner's persistence mirrors the shape: a postgres store through an
orm with a resilient in-memory fallback on any failure, project rows
carrying the document plus its embedding, a kind tag (generated,
variation or import) and a parent pointer that chains a variation to
its source, per-second segment rows capped at twenty thousand per save,
and a single-row model state. the api routes wrap the same functions
server-side — the digest names analyze, generate, model, projects,
similar and health; the studio store calls them with a local fallback
to the identical client-side functions when the network fails, so the
product works offline.

## 8. timelineToProject — the audio to score converter

the converter turns a dissected timeline into a playable, in-tune
project template — the bridge that makes an imported track a starting
point for new work. its pipeline, in order:

1. key detection from the song-level chroma: the strongest pitch class
   is the root; the minor third wins unless the major third is more
   than about a fifth stronger (the 0.82 tolerance), deciding the scale
   between major and minor.
2. pitch conditioning: per-second dominant pitches (silence-gated by an
   rms floor) become midi numbers; a global median anchors the
   register; each pitch is folded to within a tritone of that median
   (killing octave jumps), clamped to a three-octave band (midi 48–84),
   then snapped to the detected scale — the nearest tone within two
   semitones.
3. smoothing: a three-window median over the raw midis before
   quantization, so single-second outliers cannot survive.
4. phrasing: at most one lead note per step; consecutive identical
   pitches merge into longer notes (duration extended, velocity kept at
   the max) — musical phrases instead of machine-gun sixteenths;
   velocity from the second's rms.
5. accompaniment: bass on the tonal center every two bars, root and
   third pads every four.
6. groove learning: per 16th step, the seconds whose bass, snare and hat
   hits landed on that step are counted; a lane step is adopted when
   its share of the song's seconds exceeds 0.22; the clap rides the
   snare lane where the snare share exceeds 0.30; an empty kick lane
   gets a safety downbeat.
7. full length: bars scale with the source duration up to 96 bars —
   the document states it explicitly: nothing is truncated or folded
   into a loop anymore (the earliest generations folded everything
   into two bars).

the honest reading: the converter is a template generator, not a
transcription — one pitch per second, quantized to the detected key, is
a sketch of the melody, and the groove loop is a statistical summary of
the percussion, not a beat-quantized extraction. that honesty is
exactly what debonair's similar-json lane wants: a similar plan, not a
fake score.

## 9. the fake parts never to repeat

the reference carries decorations the reconstruction must never import.
the digest of the v1 page documents them and the reconstruction waves
repeat the ban:

| fake | what it claims | why it is fake |
| --- | --- | --- |
| ~200 id/hash fields per second | per-second documents bristling with identifier and hash fields | constants and xor cosmetics — derived from the same few numbers, no information content, pure payload bloat |
| the seed checksum | a checksum that proves an expansion from a seed reproduces the pcm | the checksum never validates — synthesis from a seed cannot reproduce recorded pcm; the claim is unfalsifiable inside the app |
| hex semantic signatures | magic constants naming perceptual meaning (the kick-sub-heavy style) | a label dressed as a measurement; no dsp backs the name |
| empty scaffolds | prisma schemas, db layers, mini-services folders | directories and configs with no runtime behind them |
| the removed model dependency | model-based classification claims (the yamnet removal the digest names) | the dependency was removed from the tree mid-history; the claims around it stayed |

the law underneath: every field in a debonair document must be a
measurement or a decision the engine can recompute — the ingest
document already obeys it (real features, one fnv-1a pcm hash that is
presented as identity, never as verification).

## 10. the honest separation limits

the reference states its own limit, and the reconstruction inherits the
statement in spirit: elements that share the spectral range
and the pan position are mathematically inseparable without a trained
model. the consequences, as the reference and the debonair hpss work
agree:

| claim | verdict |
| --- | --- |
| six clean layers (vocals, bass, drums, more) from a biquad cascade | not achievable by band filters alone — overlapping spectra and centered pans defeat them |
| the harmonic/percussive pair (hpss) | the proven floor — median filtering in time and frequency separates sustained from transient energy honestly, with a conservation check |
| vocal, bass and drum lanes on top | band filters riding the hpss floor — useful heuristic lanes, honestly labeled as such, never sold as separation |
| trained-model separation | the only path past the floor; the reference removed its attempt, debonair keeps it behind a future opt-in tier |

debonair already owns the honest floor: the pv0 hpss with centered
framing, the conjugate ifft law and the f64 overlap-add, conserved to
2.3e-7 over the whole signal, plus the ingest document that stores the
mix and both stems with one vector frame per second. the reference's
contribution is the statement, not the math.

## 11. the import verdict

what each reference part feeds, wave by wave — the queue the
reconstruction pulls from, and what debonair already owns so nothing is
imported twice:

| reference part | lands in | what debonair already owns |
| --- | --- | --- |
| the vector-one contracts (timeline, project, model state) — versioned, signed, one grammar for import and generation | pv1 (the schema upgrade of ingest documents: owner id, kind, visibility, blob pointers, sha256, bigint pointers) and pv3 (the profile document shape) | the ingest document debonair.ingest/1 with its per-second frames, and the versioned report schema of analyze |
| the 32-dim embedding space (layout, three builders, cosine, blending) | pv3 (similarity: cosine over normalized segment vectors) and pv4 (the seeded vector plan similar to the references; the blend law for variation) | the cadria audioattributes 32-dim summary with the fnv-1a seed — the same shape family, already at the seam |
| the pattern miner (bigrams, histograms, centroid, bpm buckets, the 0.55 adoption gate after three projects, top-5 cosine search) | pv3 (patternminer reading the ingested documents of a genre, answering the profile; similarity ranking) | nothing yet — the miner is the pv3 deliverable; the debonair db and ingest store already give it the substrate |
| the aurora composer (48 scales, nine styles, groove templates, prompt parsing pt/en, bass-kick lock, chord resolution, drift and energy cycles, vary) | pv4 (the composer: prompt → genre match → profile → seeded plan; the render) and the pattern enums wave (the 16-step lane vocabulary and the voice list for rhythmgrammar and takeevents) | musictheory (scales, chords), harmonyengine (progressions), rhythmgrammar (the 16-step grid, genre glyph tables), genrematrix (the fifteen-genre dictionary), arranger (the deterministic plan take) — the reference contributes the style-groove lock, the scale-pool breadth check, the drift/energy section chaining and the pt/en prompt grammar |
| the audio engine (eleven voice recipes, master chain, delay and generated reverb, swing/seek transport with look-ahead, offline render, wav/mp3/midi encoders) | pv2 (playback: the ingested mix and stems stream and play through the shared bar) and pv4 (the offline render of the plan through the existing render lane) | sol/studio/audioengine.ts with the wave-b2 voices (808 kick, noise snare and hats, detuned pad, vibrato lead) and mixergraph — the reference adds the bell, arp, flute, keys and pluck voices, the drive-compressor-analyser chain, both send effects, the sub-tail kick, the transport's swing and seek, and both encoders |
| timelineToProject (key detection, register folding, scale quantization, phrase merging, groove learning by threshold, full length to 96 bars) | pv4 (the similar-json step: a reference document becomes a plan the engine renders) and pv3 (the profile's key pool and groove summary read the same way) | analyze (key from chroma, the octave-law tempo) and beatgrid (dp tracking, quantize, swing) — the reference adds the register-folding and phrase-merge passes and the honest template framing |
| the v1 pcm store and the priority playback ladder (stored pcm, hex inline, seed synth, pattern synth, one-second grid) | pv2 (the playerbus learns reference takes; the stored-first ladder becomes blob-first streaming) | the playerbus and the blob store law of pv1 — the ladder's idea survives as stored-blob → stream, with the fake hex rungs dropped |
| the mjs decode lane (node decode, stft, per-second vectors, the bpm octave-fold bug) | pv1 (the server worker decode lane — decode, separate, analyze, segment, store, all server-side) | debonair's own decode and analyze with the octave law already fixed; the reference lane is the cautionary tale, not the import |
| the studio surfaces (sequencer, panels, piano roll, drum grid, transport bar) | pv5 (the design reform — the bench and studio pages in the os face) and the design waves | the sol design system and the studio pages of the 5-b closure — the reference informs layout patterns (step grid, lane toggles, seek), never the face |
| the fake parts (id/hash fields, seed checksum, hex signatures, empty scaffolds) | nothing — the ban list every wave obeys | the honest-document law already in the ingest document |
| the separation limits (the spectral+pan inseparability statement) | nothing to import — the statement to keep | the pv0 hpss (the proven floor, conserved) and the ingest stems |

the one-line verdict the waves carry forward: the reference proves the
product loop — import to vectors, learn from what is saved, compose
similar and in-key, render real audio, play and export — and debonair
already owns the honest halves of that loop (the separation, the
analysis, the theory, the plan, the transport); the reconstruction
imports the reference's contracts, its miner, its style-groove
composer, its voice recipes and its encoders, and leaves the
decorations in the folder where the dedup already buried them.

---

*end of the reference study. written by the D1 agent; read-only study of
the outros.debonair blobs, no app code touched. the digest inside
docs/planningpipeline.md remains the short version; this document is
the full dissection the pv waves cite.*
