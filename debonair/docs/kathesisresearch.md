# kathesis.research — the v1/v2/v3 ingest payload pattern, the references and the sandbox target

> the deep-research record of the kathesis engine ingest lane (wave T4-E,
> PR17). the owner's rule (regras.md row 53, verbatim): debonair is the
> kathesis engine, complete daw and sound ai infrastructure, competing
> with suno.com, google flow music, fl studio mobile and youtube —
> "research in the outros.debonair blobs the versions v1/v2/v3, where the
> ingest converted the complete music into a detailed structured json
> payload like v1, and the reverse ingest reconstructed and played it,
> today using the sandbox without touching the browser or the gpu. the
> valid v1 pattern is improved with deep research, documented and
> organized in md." this document is that research: what the corpus
> proves, what the references do, what devthink owns, and the payload
> lane this wave lands. companion of docs/referencestudy.md (the full
> outros.debonair dissection of wave D1), docs/generationresearch.md (the
> generation lanes), docs/enginemap.md (the module map) and
> docs/competitordissection.md (the external engines).

---

## 1. the corpus evidence — where the v1/v2/v3 pattern lives

the owner keeps the reference material in the allan repository
(github.com/iakadion/allan, the sparse clone at /home/z/allan). every
claim below cites the blob it came from; nothing is invented.

| evidence | blob | what it proves |
| --- | --- | --- |
| the dedup manifest | organizado/json/debonair.json | the outros.debonair folder (c:\allan\docs\neodocs\outros.debonair) held 727 files collapsing to 106 targets, 5.63 mb to 1.86 mb, zero errors — a copy cascade of one product |
| the v2 tree inventory | the same manifest, the 210 alvo paths | the surviving tree is the v2 studio: `src/lib/audio/{schema,analysis,dsp,embedding,engine,generator}.ts`, `src/app/api/{analyze,generate,similar,model,health,dependencies}/route.ts`, the studio components (sequencer, panels), the drizzle db pair |
| the full dissection | docs/referencestudy.md (wave D1, this repo) | the vector-one product end to end: contracts, 32-dim embedding, the aurora composer, the web audio engine, the miner, the v1 playback ladder, the fake-parts ban, the honest separation limit |
| the v1 proof | organizado/md/conversa.md row 5926 | "the audio reconstruction in json with vector values, decomposed second by second and identified by the dsp channel, proved that the audio is reconstructed with quality from an arbitrary print of the json" — the v1 result this lane engineers |
| the analyze order | organizado/md/conversa.md row 5932 | "analyze outros.debonair, outros.devthink/cjs and the v1 folders, which reconstructed music from pcm, and discard the old approaches with jalamendo, honks and previously trained models" |
| the pre-training law | organizado/md/conversa.md row 5934 | "ingest real music separating voice and drum stems, decomposing into json with vector parameters and storing in the db as reference per genre" — the ingest document feeds the miner and the composer |
| the engine name | organizado/md/conversa.md row 5936 | "develop the catesis engine and the kathesis1.0 in the panel to ingest music, break it down into json and save in the db as the pre-training base of the next songs" |
| the reconstruction ladder | organizado/md/conversa.md row 5938 | the priority chain: indexeddb hex stream first, convergent synthesis second with 72+ cross-constraint parameters, and the truth funnel of zcr, flatness, centroid, skewness, kurtosis and checksum |
| the master json law | organizado/md/conversa.md rows 3513, 2433, 2459, 2467, 2449 | the second is the main node, layers listed inside each second, header and stems sharing the same structure by symmetric inheritance, pcm float32 as the definitive interchange, base64 payloads banned, pcm traveling as state hashes or seed ids and never as open arrays, 82 distinct parameters (76 header, 66 layer, 4 correlation), dpcm as the only honest embed (four hex chars per diff sample, 54 percent below base64), fft and mfcc computed once per second and shared by all layers, the priority ladder memory cache, indexeddb, inline json, additive synthesis from the seed, pattern synthesis |
| the bans | organizado/md/conversa.md row 2477 | the ~200 decorative id/hash fields per second, the seed checksum that never validates, the hex semantic signatures (0xKICK_SUB_HEAVY) and the empty scaffolds are registered as fake and never repeated |
| the sandbox shift | organizado/md/regras.md row 53 | the same sentence that opens this document: the reverse ingest "today uses the sandbox without touching the browser or the gpu" — the compute moved off the visitor machine |
| the site lineage | .devthink/web/devthinkv1.txt, devthinkv2.txt, devthinkv3.txt | the marketing face of the platform carried the debonair preview in three generations: v1 with the three-tab studio (streaming, the "kathesis ai song generator", the "kathesis multi-track stem mixer"), v2 unifying the vinyl deck with the real-time stem toggles ("interactive real-time stem toggles — kathesis engine": vocals, bass, synth, drums), v3 polishing the same unified deck ("music & ai vocal daw", the ai stem tags) |

### 1.1 the version genealogy, honestly read

the evidence answers the v1/v2/v3 question with two lineages that must
not be conflated:

- **outros.debonair v1** — the single-page predecessor. a six-layer
  biquad separation cascade, a pcm store keyed by session, second and
  track, and the priority playback ladder (stored pcm first, then hex
  inline, then seed synthesis, then pattern synthesis) scheduled on the
  audio buffer source clock over a strict one-second-per-cell grid. this
  is the generation that proved the reconstruction: the payload's
  per-second vectors, read back from an arbitrary print of the json,
  rebuilt playable audio.
- **outros.debonair v2** — the studio. the typed vector-one contracts
  (timeline@5.0 — one frame per second with rms, centroid, flux, chroma,
  embedding, events and tags; project@5.0 — the symbolic score; the
  model state), the 32-dim embedding space shared by scores and analyzed
  seconds (cosine similarity, linear-blend variation), the aurora
  composer (48 scales, nine style presets, groove templates, pt/en
  prompt parsing), the hand-built web audio engine (eight melodic
  voices, four drum machines, the drive-compressor master, the generated
  plate reverb), and the api routes over an orm/postgres store with the
  in-memory fallback.
- **the v3 question** — no separate v3 folder survives the dedup: the
  manifest's 106 targets all live under `v2\`, and the copy cascade
  preserved the generations *inside* the merged files as ordered
  sections under fonte markers (the reference study reads five
  generator generations this way — the vary engine, the mood composer,
  the style system, the harmony expansion and the current groove lock).
  the honest reading: the "v3" era is the newest cascade generation of
  the v2 tree (the groove lock: melody locked to the style groove, the
  six-voice lead family, the eight-voice schema), plus the devthink site
  v3 face that carried the unified kathesis deck. the pattern the owner
  charges as valid is v1's — the detailed per-second decomposition
  payload and the reverse ingest — improved, not the v2 studio chrome.
- **the mjs lane** — a node decode sidecar (an analyser and an ffmpeg
  wrapper) that turned files into per-second vectors outside the
  browser; the reference study registers its bpm octave-fold bug as the
  cautionary tale (devthink's analyze answers the octave law).

### 1.2 the v1 pattern distilled — the payload law

stripped of the copy cascade, the valid v1 pattern is a two-direction
contract:

```text
forward ingest (the decomposition):
  bytes → container probe → pcm decode → hpss stems → per-second vectors
        → the structured json payload (versioned, deterministic, one grammar
          for import and generation, hash for identity, zero raw pcm arrays)

reverse ingest (the reconstruction):
  payload → seeded synthesis from the vectors (per-second chroma partials,
        band-shaped noise, onset bursts, the energy envelope)
        → wav bytes (the real riff container) → playback
```

the laws the corpus pins on both directions: the second is the node; the
document is deterministic (same bytes in, same payload out); every field
is a measurement or a decision the engine can recompute; the hash is
identity, never a verification claim; the reconstruction is honest
vector synthesis, never a bit-exact claim; the compute runs in the
sandbox, never on the visitor machine.

---

## 2. what the references do (the neo.temp corpus)

the corpus clone carries the reference engines under neo.temp (the
suno-clone order of conversa.md rows 5928-5930: "clone suno.com in temp
and analyze the files to understand the music creation flow"). what was
read in the clone versus what the corpus only names is marked honestly —
three of the readme blobs are missing from the sparse clone (the partial
fetch refuses on the full disk), and their rows below carry the corpus
citation instead of a local read.

| reference | read | architecture | what kathesis takes from it |
| --- | --- | --- | --- |
| demucs (facebookresearch) | readme read in the clone | the 4th-generation hybrid transformer demucs: a u-net over both the waveform and the spectrogram domains with a cross-domain transformer encoder between them (self-attention within each domain, cross-attention across), separating drums, bass, vocals and the rest of the accompaniment at 9.00 db sdr on musdb-hq (9.20 with sparse attention and per-source fine-tuning); an experimental six-source model adds guitar and piano | the honest ceiling statement: real four-stem separation is a trained-model tier, sandbox opt-in — never a biquad cascade (the v1 fake) and never claimed from pure math |
| open-unmix | named by the corpus, blob missing locally | spectrogram-domain unmixing with wiener-like post-filtering, the pytorch reference implementation family | the same tier verdict — the model lane stays a declared seam, the pure lane answers hpss |
| spleeter (deezer) | named by the corpus, blob missing locally | the 2/4/5-stem separatrix: tf/onnx models shipped for offline and streaming separation, the industry's lightweight default | the packaging lesson: a separation product ships model weights per stem count with an honest quality table — the future sandbox tier's shape |
| ACE-Step | named by the corpus, blob missing locally | the open-source text-to-music generator of the suno class: a 3.5b-parameter diffusion/flow-matching transformer over a variational audio autoencoder, generating full songs (with lyrics) in seconds, checkpoint-licensed for community training | the generation lane's frontier shape — the neural lane devthink's planning keeps as a study seam while the seeded engine builds (the generationresearch decision) |
| YuE / YuE2 | readme read in the clone | "unifying symbolic and audio music generation at frontier quality — compose in symbols, create in sound": the yue2 lineage generates songs from lyrics through a language model over discrete music tokens, with the original yue preserved on a dedicated v1 branch; the family ships mert2 (music understanding) and sheetsage2 (symbolic transcription) beside the generator | the two-representation law: the symbolic score and the audio stream are one grammar round-tripped through tokens — exactly the vector-one contract shape (timeline and project in one family) |
| magenta (google brain) | readme read in the clone | the tensorflow research project for ml in art and music: models for generation (melody rnn, performance rnn, groovae...), notequence as the symbolic interchange, and magenta.js for the browser | the notequence lesson: one symbolic interchange document every model reads and writes — the debonair counterpart is the payload grammar this wave extends |
| suno.com (the competitor order) | the corpus order, conversa.md row 5928 | the clone order: dissect the internal/v1 and graphql flows to understand the creation pipeline before building | the product law the whole lane serves: ingest real music as reference, generate similar, play — the loop the vector-one product proved and devthink rebuilds honestly |

the tier table the references jointly prove, which this lane keeps:

| tier | separation | cost | where it runs |
| --- | --- | --- | --- |
| hpss (median-filter, pure math) | the harmonic/percussive pair, conserved 2.3e-7 | milliseconds, pure ts | anywhere — the visitor sandbox or the server, no gpu |
| band masks over hpss | heuristic vocal/bass/drum lanes, honestly labeled | milliseconds | anywhere |
| trained models (demucs-class) | real stems, 9+ db sdr | a gpu or heavy cpu, seconds to minutes | the sandbox worker tier only, opt-in per deploy |

---

## 3. the devthink target — the sandbox, never the visitor machine

the corpus law is absolute (features.md, the cross-family laws): the
interface never touches the browser, gpu, cpu, disk, camera, location or
wallet of the visitor — all compute rides the sandbox engine. the
ingest/reconstruction lane lands on that law through the seats the repo
already owns:

- **ingestworker.ts** (wave D7) — the server pipeline decode → separate
  → analyze → segment → store, the wavs per stem plus the mix, the
  pointer chain into the blob store; it declares its modality through
  `INGEST_WORKER_MODALITY` and the sandboxmodality vocabulary ("local"
  by default, opt-in onto "runner-node", "container-docker" or
  "microvm-firecracker" through `DEBONAIR_WORKER_MODALITY`) — the
  worker functions never spawn anything themselves, the deploy resolves
  the sandbox.
- **blobstore.ts** (D6) — the content-addressed store (the hand-rolled
  sha256, the minted ids, the shard layout) the payloads and the
  reconstructed wavs land in.
- **playerbus.ts** (D10) — when a human plays, the reference takes ride
  the one shared bus and stream the stored bytes through the fetch seam;
  playback is the visitor's choice, compute never is.
- **renderworker.ts / renderjobs.ts** (D14) — the offline render lane
  the generated takes ride; the reconstruction lane answers the same
  shape (bytes out of vectors, no audio context involved).

what the engine already owns (verified at this wave: tsc exit 0, the
vitest suite green): the wav byte walk (audioformat.ts — riff parse,
chunk walk, 8/16/24/32 decode), the decode dsp (audiodecode.ts —
downmix, resample, normalize), the hpss separator with the conservation
proof, the analysis chain (analyze.ts — rhythm, key, loudness, bands,
structure), the beat grid (beatgrid.ts), the ingest document
(debonair.ingest/1 with the per-second vector frames and the fnv-1a pcm
hash), the pattern miner, the composer, the wav writer (16/24/32f), and
62 test files pinning all of it.

the gaps this wave closes (the owner's charge, restated as deltas):

| gap | the v1 pattern | the landing |
| --- | --- | --- |
| container probing beyond wav | v1/v2 decoded in the browser (web audio) or via ffmpeg sidecars | the pure-node container probe: the wav walk full, mp3 and ogg headers parsed by hand, the honest refusal where no codec exists server-side |
| the detailed structured payload | the v1 timeline document (per-second frames, events, tags) | debonair.soundpayload/1: the source facts (format, rate, channels, depth, bytes, sha256), the track summary (duration, bpm, key, loudness, stems, structure), the 100 ms energy chunks, the beats/onsets, the metadata, and the embedded debonair.ingest/1 document |
| the reverse ingest | the v1 playback ladder (stored pcm → hex → seed synth → pattern synth) | reconstructwav: the payload → the seeded per-second synthesis (chroma partials, band noise, onset bursts, the energy envelope, the stem roles) → real wav bytes — the sandbox lane, zero audio context |
| the research record | scattered across the corpus | this document |

---

## 4. the payload lane implementation (this wave)

the lane lands as one root logic beside the ingest family, pure
typescript, zero dependencies, zero dom, zero audio context:

- **ingestpayload.ts** — the structured payload lane:
  - `probesound(bytes)` — the container probe: the wav walk (riff facts,
    decodable), the mp3 frame-header walk (id3v2 skip, mpeg version,
    layer iii, the bitrate and rate tables, the channel mode, the cbr
    duration estimate — an estimate, labeled as one), the ogg page walk
    (the vorbis/opus identification header, the granule scan for the
    duration), and the honest unknown-format refusal.
  - `energychunks(pcm, rate)` — the 100 ms energy envelope (rms + peak
    per chunk), the sub-second resolution the one-second frames do not
    carry.
  - `ingestPayload(bytes, options)` — the forward ingest: probe, decode
    (wav only — the pure-node truth), the v1 decomposition through
    ingest.ts's own `ingestPcm` (never duplicated), and the
    debonair.soundpayload/1 document; mp3/ogg answer the honest
    container-only payload (real header facts, `analysis:
    "container-only"`, zero fake vectors).
  - `reconstructWav(payload, options)` — the reverse ingest: the seeded
    synthesis from the payload vectors (the harmonic stem's chroma
    partials, the percussive stem's band-shaped onset bursts, the mix
    energy envelope), the stem sum mirroring the hpss conservation, the
    pcm hash of the result, and the measured per-second fidelity —
    measured, never claimed. answers real wav bytes through the
    wavwriter at the source's own rate.
- **tests/ingestpayload.test.ts** — the round-trip contract: the probe
  facts, the payload shape and determinism (the same bytes answer the
  same payload), the container-only honesty, the reconstruction parsing
  back through two independent wav readers, the energy correlation
  against the source, and the sandbox playback shape (valid wav bytes,
  the right duration, non-silent, the player lane's grammar).

the design decisions the corpus laws forced, and where each law is
honored:

| the corpus law | the landing |
| --- | --- |
| the second is the main node | the payload embeds the per-second document; the energy chunks subdivide the second without replacing it |
| no base64, no open pcm arrays | the payload carries vectors, counts and hashes only; the reconstruction synthesizes, never re-encodes |
| the hash is identity, never verification | the sha256 of the source bytes and the fnv-1a pcm hash ride as identity fields; the fidelity is measured, never inferred from a hash |
| deterministic ingest | the same bytes answer the same payload (the tests pin the serialized bytes); the synthesis rides the engine's own mulberry32/hashSeed seat |
| the fake-parts ban | zero decorative id fields, zero semantic hex signatures, zero checksum claims; every number is a measurement or a decision the engine recomputes |
| the sandbox, never the browser | the lane declares the same worker modality vocabulary (the sandboxmodality mirror), spawns nothing, touches no audio context, no gpu — the bytes in and out are pure data |
| the honest limits | mp3/ogg decode is not available in pure node (no codec): the probe answers header facts and the payload answers container-only, and the module documents the limit in code and tests |

---

## 5. the honest limits register

- **mp3/ogg analysis depth** — the pure-node lane reads headers (rate,
  channels, the estimated duration) but cannot decode compressed pcm
  without a codec; the payload says `analysis: "container-only"` and
  carries zero analysis vectors. the browser lane (decodeaudiodata) and
  the sandbox tier (a bundled decoder) remain the full-analysis seats.
- **the reconstruction is vector synthesis** — the v1 proof quality
  bar (a listenable, structurally faithful rebuild from the json), not
  bit-exact reproduction; the payload's hashes identify the source, the
  measured fidelity reports the gap honestly.
- **the mono analysis lane** — the decomposition analyzes the mono
  downmix (the channel-average law the worker rides); the container
  facts keep the source channel count and depth.
- **per-second granularity** — the vector frames are one per second
  (the v1 node), the energy chunks 100 ms; sub-100 ms transients live in
  the onset lists, not the frame vectors.

---

*end of the kathesis research record. written by the T4-E wave; read-only
research over the allan blobs plus the implementation the wave lands at
the debonair root. the dissection of the reference blobs itself lives in
docs/referencestudy.md; this document is the payload-lane research and
design record that PR17 cites.*
