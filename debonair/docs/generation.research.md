# generation.research — the vector law of music and audio generation

> the wave the owner ordered: pesquisar sobre a questão de gerador de áudio, de
> música. this document answers the research question once and completely — the
> owner's method stated plainly, the state of separation (what math can split
> and what it mathematically cannot), the vector document contract (the json
> that reconstructs a song and that any llm can emit), the pattern matrix (the
> mathematical core the miner owns), the generation lanes of the industry
> compared lane by lane, the classification seats, the 24/7 automation
> architecture, and the method decision the reconstruction rides. sources: the
> reference blobs of the owner's v1/v2 method (schema, embedding, generator,
> dsp, analysis), the five-competitor dissection with file:line refs, the corpus
> clones (audiocraft, stableaudiotools, the suno wire capture, the strudel
> stub, pulsegridstudio) and the method papers (musicgen, stable audio open,
> htdemucs, ace-step, yue). companion of docs/planning.pipeline.md (the wave
> ladder this research feeds) and docs/competitor.dissection.md (the import
> queue with the file:line evidence).

## 1 — the owner's method stated plainly

the law is the vector law: a real track enters the house, the engine decomposes
it into streams, each stream is dissected into a parametrized vector document —
one json that carries the numbers a renderer needs to reconstruct the song —
the reference documents of a genre feed the pattern miner, the miner answers
the genre profile, the composer writes a similar vector json seeded from that
profile, the engine renders real audio from the json server side, and the take
publishes to the vitrine. the visitor's machine never computes: the browser
asks and plays, the gateway jobs do the work. nothing in this chain is a
prompt-to-mp3 black box — every stage is math the house owns, every artifact is
a document the house can store, diff, mine and re-render.

the vector law exists because of what it buys. first, honesty: a song reduced
to per-second frames, twelve-bin chroma, sixteen-step drum lanes and a 32-dim
embedding is a song the engine can verify — the schema signature rejects a
malformed generation at the door instead of rendering garbage. second,
provenance: the pattern matrix is mined from the owner's own reference library
(the ingested documents with the owner id and the blob pointers), never from a
dataset the house cannot name. third, determinism: same prompt and same seed
produce the same take, the same json, the same rendered bytes — the
reconstruction claim is a test, not a hope. fourth, the llm seam: because the
export is a schema-signed json of bounded plain fields, any language model can
write a song for the house — the llm emits the document, the deterministic
engine renders it, and the two responsibilities never blur. the planning ladder
already carries this as waves pv0 through pv7; pv0 stands verified (hpss
separation with conservation at 2.3e-7 over the whole signal, the
debonair.ingest/1 document, the ingest store, the bench, the battery green).

| stage | what happens | the artifact |
| --- | --- | --- |
| ingest | a real track uploads through the gateway job lane | the job id, the stored blob |
| separate | hpss splits the harmonic and percussive streams, band lanes refine | stem wavs in the blob store |
| dissect | every stem analyzed second by second | the vector document (debonair.ingest/1) |
| mine | the genre references feed the pattern miner | the genre profile (debonair.profile/1) |
| compose | a seeded composer writes from the profile | a similar vector json (the project document) |
| render | the offline engine renders the json to real audio | the wav in the blob store, the track row |
| publish | the take streams from the vitrine | the shelf row the visitor plays |

## 2 — the state of separation

the tier-1 floor is median-filter hpss (fitzgerald 2010, driedger and müller
2014), the implementation the house already owns: one real stft of the mono
pcm, a median filter across time on the magnitude (the harmonic ridge, which
persists frame to frame), a median filter across frequency (the percussive
broadband, which spreads across bins), two soft wiener masks that always sum to
one, and one istft per stem with the original phases — the conservation law
measured at 2.3e-7 over the whole signal. the split never invents energy and
never loses it: harmonic plus percussive equals the input, provably, and the
stems are audible proof (the pv2 plan plays them side by side). the band-lane
approach stacks on top: the vocal, bass and drum questions ride band filters
over the two hpss stems (mid/side decomposition, centered moving averages, rbj
bandpasses — the b3 plan), because a kick lives under 250 hz, a snare body
around 1.7 khz, hats above 7.8 khz, and a six-lane biquad bank is what the
reference v1 proved in the browser.

the honest limit the reference stated and this research confirms: elements
sharing the spectral range and the pan position are mathematically inseparable
without a trained model. a centered bass and a centered kick in the same octave
are one signal to any linear filter; no mask can tell a hat from a bright pad
when both occupy the same bins at the same instant from the same direction.
this is not an engineering shortfall but an information-theoretic one — the
filter bank has no prior for what a source is. that is exactly where the neural
tier begins. htdemucs (demucs v4, meta mit) is the reference: a hybrid
temporal/spectral bi-u-net whose innermost layers are a cross-domain
transformer — self-attention within one domain, cross-attention across domains
— reaching 9.00 db sdr on the musdb18-hq test set and 9.20 db with sparse
attention kernels and per-source fine-tuning, at roughly 80 mb per checkpoint
for the four-source vocals/drums/bass/other model. spleeter (deezer, mit) is
the lightweight veteran: a tensorflow spectrogram-masking u-net with
pretrained 2/4/5-stem models, tens of mb, separation of 4 stems at 100x faster
than real time on a gpu and serviceable on cpu — state of the art at its 2019
release, still the cheapest honest lane. open-unmix is the sigsep benchmark
implementation: pytorch, per-source models with wiener-filter post-processing,
hundreds of mb across sources, the research baseline the papers measure
against. the onnx runtime lane is how any of them enters the house: the graph
exported to onnx, quantized, executed by onnxruntime inside the sandbox worker
(the ml/onnx.ts seam of the engine map, session cache, gated behind the b3
quality targets) — torch never ships, the weights live in the blob store, and
the stage loads and unloads them per job.

| method | quality | weight | runtime lane |
| --- | --- | --- | --- |
| median hpss (tier 1, built) | two stems, energy-exact by construction, no ghost notes | zero weights, pure ts | every lane: browser, worker, saddle |
| band lanes over hpss (tier 1, built) | 4–6 role lanes, approximate but honest | zero weights, pure ts | every lane |
| spleeter 2/4/5 stems (tier 2 candidate) | good at release, weak on dense mixes | tens of mb | onnx export, sandbox worker |
| open-unmix (tier 2 candidate) | benchmark-grade, wiener filtered | hundreds of mb across sources | onnx export, sandbox worker |
| htdemucs (tier 2 target) | 9.00–9.20 db sdr on musdb, the open state of the art | ~80 mb per checkpoint | onnx export, sandbox worker, per-job load |
| a third-party separation api | unknown, unauditable | not ours | never — outside the house law |

## 3 — the vector document

the atom of the contract is the per-second frame. every second of every stem
answers its own numbers: rms and peak (loudness), zero-crossing rate and
spectral centroid and flatness (timbre), the strongest rms rise (beat
strength), the onset count, the band energy fractions, the dominant note, and
the twelve-bin chroma. the reference timeline contract (vector-one/timeline@5.0)
adds the spectral flux, the frame events — transients classified by band
energy into kick, hat and hit, each with onset offset, velocity and confidence,
plus the dominant pitch as a note event carrying hz, midi, name and velocity —
and the 32-dim embedding vector. the local engine mirrors this as
debonair.ingest/1: the mix plus the harmonic and percussive stems, each with
its full analysis report, its per-second segments, its onset list and its
fnv-1a pcm hash, with the stems' bounce manifest riding debonair.stems/1. the
shared 32-dim layout is the bridge between everything symbolic and everything
acoustic: dims 0–11 the chroma distribution, 12–15 the band and pitch energy
shape (centroid, rolloff, flatness, zcr), 16–19 the rhythm (onset density,
onset strength, duration density, syncopation), 20–23 the dynamics (rms mean
and spread, velocity mean and spread), 24–27 the register (pitch mean, spread,
min, max), 28–31 the temporal (bpm, log frame count, low band, high band). a
symbolic project and an imported second embed into the same space, so cosine
similarity ranks a generated take against an imported reference without any
translation layer.

the project document (vector-one/project@5.0 in the reference,
debonair.project/1 in the ladder) is the other half: the symbolic score the
studio edits, the scheduler plays and the renderer bounces — bpm, root, scale,
bars, mood, prompt, four sixteen-step drum lanes, the note events with step,
pitch, velocity, duration and voice, and the embedding. this is the export the
owner demands, for five reasons. one: every field is a bounded plain number —
bpm 40–240, root 0–11, pitch 0–127, velocity 0–1, sixteen 0/1 steps per drum
lane — which is exactly the shape an llm can emit reliably, unlike pcm or
opaque tensors. two: the schema signature throws on drift, so a bad generation
is rejected at parse, never rendered. three: the same contract serves the
editor, the miner and the renderer — one grammar end to end. four: the document
is small — a three-minute song is roughly 180 frames plus a few hundred notes —
so it fits any context window and any db row. five: determinism — the same
document renders the same bytes, which makes the reconstruction claim a
repeatable test. the fake parts of the reference are named and never repeated:
the ~200 decorative id and hash fields per second (constants and xor
cosmetics), the checksum claim that never validated, the hex semantic
signatures — the new contract carries only fields the renderer or the miner
actually reads.

| payload field | type | what it carries | who reads it |
| --- | --- | --- | --- |
| s | int | the second index of the frame | miner, timeline ui |
| rms / peak | 0..1 | loudness of the second | miner, meters |
| centroid / flat / zcr | hz, 0..1, rate | timbre shape of the second | miner, classifier |
| flux | 0..1 | spectral change, the onset fuel | onset detector, miner |
| beat / onsets | 0..1, count | local beat strength and onset density | pattern miner |
| bands | [lo, mid, hi] | energy fractions, the lane classifier | miner, classifier |
| chroma | 12 × 0..1 | the pitch-class distribution | key detector, miner |
| note | string | the dominant pitch class of the second | timeline, miner |
| events | list | transients (kick/hat/hit) and the dominant note, with onset, velocity, confidence | groove learner, timeline |
| embedding | 32 × number | the frame vector in the shared space | similarity, profiles |
| (timeline) bpm, seconds, source | number, enum | the song header, import/generated/variation | everything |
| (project) drums, notes, root, scale, bars, prompt, mood | tables | the symbolic score | scheduler, renderer, studio |
| pcmhash | fnv-1a int | the stem fidelity id (the v1 reconstruction proof) | render checksum, dedup |

## 4 — the pattern matrix

the matrix is the mathematical core of the house method: what the miner
extracts from the reference documents and what the composer samples from. six
components, all learned from the owner's own library, all deterministic. the
note bigram is a first-order markov chain over melody pitches — pitch to pitch
to count — sampled by the composer with a +0.5 weight bias for candidates
within three semitones of the current pitch, so generated melodies walk
stepwise the way the references walk; without training the sampler falls back
to the nearest-candidate pool and the chain stays dormant. the drum histogram
is per lane a sixteen-step probability table; the adoption threshold keeps it
honest — a learned kick step enters the pattern only when its probability
exceeds 0.55 and the model has seen at least three references (trainedOn >= 3),
so one noisy import cannot rewrite a genre's groove. the centroid is the
32-dim mean of the reference embeddings; cosine similarity between a document
embedding and the profile centroid ranks the nearest references and answers
the prompt-to-genre match, and linear blending in the embedding space is the
variation engine — interpolate a document toward a target and drift it there.
the bpm histogram and the scale affinity are the seeding tables: the composer
picks bpm inside the genre's observed distribution and the scale from the
observed affinity, not from a hardcoded table. around these the pv3 profile
document (debonair.profile/1) wraps the genre-level answers — bpm distribution,
key pool, chord ladder frequency, onset density curves, band balance, loudness
targets — with the reference ids that fed it, the pointer chain audit-ready.

the composition itself is the deterministic seeded lane. the reference
composer (aurora) derives its entire rng from the prompt string — same prompt,
same salt, same take, every note and every velocity bit-identical — and the
local engine upgrades the same law with the seeded mulberry32 hash. the prompt
parse answers the style, bpm, scale, root, register and intensity; the drums
come from the style's exact sixteen-step lanes blended with the learned
histogram; the melody is locked to the style groove template (main pattern per
bar, fill every fourth, accent steps carry the chord tones) while pitches walk
the markov chain and resolve to the chord root at each bar end; the bass is
locked to the kick onsets in the chord root — the one rule professional rhythm
sections never break; long form chains sections where each section is a
diatonic drift variation of the previous one under the drift and energy
cycles, the build/drop architecture, up to 128 bars from 30 to 190 seconds.
nothing in the chain needs a gpu, a checkpoint or a network — the matrix is a
few kilobytes of json and the composer is pure typescript running in
milliseconds.

| matrix component | representation | role in the method |
| --- | --- | --- |
| noteBigram | pitch → pitch → count | the melodic walk: markov sampling with the ±3 semitone stepwise bias |
| drumHistogram | lane → 16 probabilities | the groove: steps adopted above 0.55 after trainedOn >= 3 |
| centroid | 32-dim mean vector | the genre anchor: cosine ranking and the variation target |
| scaleAffinity | scale → score | the key seeding of the composer |
| bpmHistogram | bucket → count | the tempo seeding inside the genre's observed range |
| profile document | debonair.profile/1 | the genre answer: key pool, chord ladder, onset curves, band balance, loudness targets, the reference ids |

## 5 — the generation lanes compared

the symbolic seeded composer (the aurora lane, the owner's own code) is the
core: a 48-scale harmony library spanning the modes, the harmonic and melodic
families, the pentatonics and blues forms, the symmetric and world scales, and
nine style presets with exact drum lanes — trap kick [0,6,10] snare [4,12]
sixteenth hats clap [4,12] swing 0.12, drill, lofi, house, phonk, techno,
afro, synthwave, jazz — each with its bpm range, register, lead voice,
progression degrees and groove template. it consumes the pattern matrix, emits
the project json, and the render proof rides the engine's voice recipes (kick
pitch envelope 165 to 52 to 40 hz with the noise click, snare noise bandpass
1750 with the dual triangle body, hat highpass 7800, clap four bursts 9.5 ms
apart, the 808 pitch snap through the drive shaper, supersaw lead, pad with
the 0.28 hz lfo, the master tanh waveshaper into the compressor, the
offline render mirror to wav 16-bit). zero weights, zero downloads,
millisecond composition, deterministic bytes — the lane the house builds.

the language model lane is musicgen (audiocraft, meta): a single-stage
autoregressive transformer over the encodec tokenizer — 32 khz, four
codebooks at 50 hz — where a small delay between codebooks lets the model
predict them in parallel, one autoregressive step per token frame, fifty
steps per second of audio. text conditioning rides classifier-free guidance
over a text encoder; the melody checkpoints condition on the chromagram of a
reference (with demucs extracting the melody stem upstream). trained on 20k
hours of licensed music (10k internal tracks plus shutterstock and pond5),
checkpoints at 300m, 1.5b and 3.3b parameters, medium inference wanting a
16 gb gpu. the posture fact that decides everything: code mit, weights
cc-by-nc 4.0 — the house studies the architecture, the weights never ship.

the diffusion lane is stable audio open (stability ai): latent diffusion
conditioned by cross-attention over text, the training and inference code in
stable-audio-tools (model types from autoencoder through diffusion-cond to
lm, all json-configured), the open 1.0 checkpoint of roughly a billion
parameters trained on creative-commons data, stereo at 44.1 khz, variable
length up to 47 seconds — samples and sound design, not long-form song
structure. code mit, weights under the stability community license (free
commercial use below the revenue threshold, gated on the hub). the lane the
house studies for its conditioning mechanics and its config-driven training
surface.

the hybrid lyric models close the vocal gap. ace-step pairs a deep
compression autoencoder with a lightweight linear transformer, aligning the
latent space to semantic representations during training (repa, over mert and
m-hubert), generating four minutes of music in twenty seconds on an a100; the
1.5 release turns the language model into a planner that emits metadata,
lyrics and captions via chain-of-thought to guide a diffusion transformer
decoding through a vae to 48 khz stereo, running under 4 gb of vram with lora
personalization from a few songs — and the corpus dissection already mined its
ggml port for the constrained metadata fsm, the apg guidance and the cover
mode. yue scales the lyrics-to-song problem on the llama2 architecture:
track-decoupled next-token prediction (vocals and accompaniment predicted as
separate token streams to beat the dense-mixture problem), structural
progressive conditioning for lyric alignment, up to five minutes of coherent
song, style transfer through a redesigned in-context learning. ace-step code
apache-2.0, yue code apache-2.0 with weights cc-by-nc 4.0 — study, never
ship.

the live coding lane is strudel: the tidalcycles pattern algebra in the
browser, music as declarative code, the mini-notation, patterns as composable
functions over the web audio clock. the corpus clone is the moved-to-codeberg
stub and the license is agpl-3.0 — the concept (a pattern language where the
pattern is the document) is exactly what the vector document already
formalizes as json; the code is never copied. the browser daw lane is
pulsegridstudio (mit, from the dissection): one dsp module shared by the
worklet, the export worker and node tests, the offline render in 128-sample
blocks without offlineaudiocontext, latency-prefix discard, tails through
releases, validate-and-clamp project loading — the render discipline the
house takes.

| lane | input | output | weights | license posture | what debonair takes |
| --- | --- | --- | --- | --- | --- |
| symbolic seeded composer (aurora, ours) | prompt + seed + matrix | project json → wav | zero | the owner's code | the core — it is the method |
| musicgen / audiocraft (lm) | text, optional melody | tokens → audio | 300m–3.3b | code mit, weights cc-by-nc 4.0 | the delay-pattern token lesson, melody conditioning by chroma |
| stable audio open (diffusion) | text | latent → audio ≤ 47 s | ~1 b | code mit, weights community license | the config-driven model surface, cc-data discipline |
| ace-step (hybrid) | tags + lyrics | planned codes → dit → 48 khz | ~2–4 b | code apache-2.0 | the metadata fsm, apg guidance, cover mode, the lm-planner shape |
| yue (hybrid lm) | lyrics + style | track-decoupled tokens → song | ~7 b class | code apache-2.0, weights cc-by-nc 4.0 | track-decoupled generation, structural conditioning, the vocal lane study |
| strudel (live coding) | pattern code | scheduled web audio | zero | agpl-3.0 | the pattern-as-document concept only, never the code |
| pulsegridstudio (browser daw) | project edits | wav offline render | zero | mit | the offline render discipline, the tail law, validate-then-clamp |

## 6 — the classification

the genre question is answered from the vector document by two seats that
meet in the same 32-dim space. the prompt side is genrematrix, the
fifteen-genre style dictionary — bpm range, swing default, pattern family,
scale biases, progression set, lufs target, timbre hints — one pure table,
validated against the sibling engine tables, every pick running on the seeded
rng. the document side is the profile per genre the miner answers: the
observed bpm distribution, the key pool, the chord ladder frequency, the onset
density curves, the band balance, the loudness targets, all folded into the
profile document with the centroid of its references. classification is then
one cosine similarity: the document embedding against the profile centroids,
the nearest profile answers the label, and the same ranking answers the
nearest references — the similarity lane of pv3. because the embedding space
is shared between symbolic and acoustic documents, the classifier labels
generated takes, imported references and rendered bounces with one code path,
and the vitrine genre cards come from these db rows, never hardcoded.

the fingerprint identity lane is the second seat: constellation peaks per
band, pairwise landmark hashes (frequency to frequency to delta-time), the
fingerprint db with add and vote-based search — the answer to is this take a
re-render of that reference, and the dedup seat for the library. it rides the
same spectral kernel as the analysis chain (no second dsp), with the
chromaprint wrapper planned for the day a binary tool is allowed in the lane.
the classification table below names the seats.

| lane | representation | the question it answers |
| --- | --- | --- |
| genrematrix (the dictionary) | the 15-genre table: bpm, swing, pattern, scales, progressions, lufs | which style does this prompt mean |
| genre profile (the miner) | debonair.profile/1 with the 32-dim centroid | which genre do these references observe |
| embedding similarity | cosine over the shared 32-dim space | which references are nearest, which take matches which genre |
| fingerprint (the identity) | constellation landmark hashes, vote search | is this the same audio as that, dedup, re-render detection |

## 7 — the 24/7 automation architecture

the automation is four gateway job lanes and one law: the heavy stages run
server side, in the sandbox modalities, and the visitor machine only plays.
the upload lane takes the multipart post, streams the bytes to the job store
and answers the job id; the ledger table (ingest_jobs) carries owner, state,
progress, error and the document pointer. the analyze lane is the worker —
decode, hpss separate, analyze, segment, store — reporting the phase progress
the bench meter reads. the mine lane runs the pattern miner over a genre's
reference documents and writes the profile. the render lane drives
render_jobs from queued through rendering to done, the wav landing in the
blob store and the row in tracks. the blob store contract is the vault law:
put a stream, get back the pointer (id, bytes, sha256, kind); get by id
returns the stream; git-lfs friendly so the storage app can own the engine
while the gateway serves it; every document row stamps the owner id (the
time-ordered 64-bit pointers of the id mint), so the pointer chain from take
to profile to reference is audit-ready.

the sandbox modalities are the compute answer at scale: the saddle avm lanes
already execute the heavy stages inside the session jail (node, python, the
polyglot exec lane, the onnx runtime when the tier-2 separation lands), the
worker lane declares its modality per deploy, and the browser keeps an
explicit opt-in run-on-this-device key for the local path only. the mcp
automation lane closes the loop for the 24/7 operation: an external agent
with its own service identity posts the same upload route and the same
generate route through the same gateway — the reference library grows without
a human, the ia generation stamps the same owner pointer chain, and the
automation is indistinguishable from a user to every contract except the
identity. zero visitor compute holds on every lane.

| stage | lane | who computes |
| --- | --- | --- |
| upload | POST /api/v1/ingest/upload → job store | the gateway |
| analyze (decode, separate, segment, store) | the ingest worker, job progress | the sandbox modality (saddle) |
| mine (profile per genre) | the pattern miner job | the sandbox modality (saddle) |
| render (json → wav) | render_jobs worker, offline engine | the sandbox modality (saddle) |
| blob storage (sha256 pointers) | the vault blob store, git-lfs backed | the storage engine |
| generate (prompt → json) | the composer (pure ts, milliseconds) | the gateway in-process |
| play / browse | the vitrine streams, the visitor listens | the visitor machine only decodes audio |

## 8 — the method decision

the verdict of this research: debonair builds the vectorized seeded lane as
the core and treats every neural lane as an upgrade behind a seam, never as
the foundation. the core owns the whole chain — tier-1 hpss separation with
the conservation proof, the band lanes over it, the per-second vector
document with the schema signature, the pattern matrix miner with its six
components and the genre profiles, the seeded symbolic composer over the
48-scale library and the style presets, the offline render with the voice
recipes, the vitrine publish — all deterministic, all pure ts, all
server-side, zero weights. the neural separation is the tier-2 onnx upgrade,
htdemucs first (the 9 db sdr class), exported, quantized and jailed in the
saddle worker, gated behind the b3 quality targets and loaded per job. the
neural generation lanes are study material and optional future seams — the
license posture of the weights (cc-by-nc on musicgen and yue, the gated
community license on stable audio open) settles the question by itself: the
house never ships weights it cannot license, and the vector document is the
better product answer anyway, because it is editable, auditable,
deterministic and llm-writable. the studies continue (the prompt grammar of
the suno-likes, the frame quanta, the eos stop law, the constrained metadata
fsm, the apg guidance, the track-decoupled vocal prediction, the cadence
hmm, the product grammar of the suno capture — the create page, the feed,
the shelves, the play counts). the never-copy list is permanent: model
weights with non-commercial clauses, agpl code, demo songs and brand chrome,
third-party generation apis in the chain, and every decorative id/hash
cosmetic the reference carried.

| decision | what | why |
| --- | --- | --- |
| build (the core) | the vectorized seeded lane: hpss tier-1, the vector document, the pattern matrix, the seeded composer, the offline render, the vitrine | deterministic, license-clean, zero weights, llm-writable, verifiable end to end |
| build (the upgrade) | neural separation as tier-2 onnx (htdemucs first) in the sandbox worker | the inseparability limit is real; the 9 db sdr class earns the seam, the jail keeps the house clean |
| study | musicgen, stable audio open, ace-step, yue, strudel, pulsegrid, the suno capture | the contracts and the product grammar, with file:line evidence in the dissection |
| never copy | model weights under cc-by-nc or gated licenses, agpl code, demo content, brand chrome, generation api dependencies | the house law: the engine is owned math, the library is owned provenance, the visitor computes nothing |

*end of the generation research — wave d3 of the debonair reconstruction. the
ladder (planning.pipeline.md) carries the waves this verdict feeds.*
