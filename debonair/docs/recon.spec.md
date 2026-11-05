# recon.spec — the RECON-V3 payload law of the katexis engine

> the reconstruction contract of debonair, frozen at **RECON-V3** (research
> iteration 17 — the source of truth this document records). the contract
> lives in code at `reconpayload.ts` (the schema, the dictionaries, the
> validator, the canonical serializer) and the descriptor lane at
> `ingestrecon.ts` (the measurements that fill the seats). this file is the
> law both answer to: read it before touching either.

## 1. the lineage (V1 → V8, and why V3 is the truth)

the recon payload iterated eight times inside the owner's research before
this freeze. the lineage, honestly:

| iteration | the shape | the verdict |
| --- | --- | --- |
| V1 | raw float vectors, no schema, arrays everywhere | proved per-second vectors carry the music; died on unbounded size |
| V2 | per-second frames with named keys | proved the frame is the right node; died on free text leaking everywhere |
| **V3** | **the 82-law: 76 header + 66 layer + 4 correlations, one number per parameter, text whitelisted, dictionaries bidirectional** | **the truth — frozen here** |
| V4 | base64 payloads inside the json | banned: the json grew megabytes, the checksums lied about fidelity |
| V5 | open PCM arrays inline | banned: PCM belongs in the blob lane, never in the document |
| V6 | decorative `*Id`/`*Hash` fields padded to look thorough | banned: every field must be a measurement or a decision the engine recomputes |
| V7 | global single bpm + fixed globalScale | banned: the header statistics must be computed modes and per-second facts, never one pinned global |
| V8 | wrapper sub-objects around every value | banned: the frames are flat, the keys carry the structure |

the historical maximum across all iterations was **170 unique metrics**;
V3 deliberately keeps **82** — every seat is a measurement or a decision the
engine recomputes, nothing decorative survives.

## 2. the law of one number (the 82)

- **82 distinct parameters**: **76 header** + **66 per layer/second** + **4
  correlations**. the header and the frame share **64 analytic keys** (the
  symmetric inheritance — the same key names at both granularities), so the
  union is 76 + 66 − 64 = 78, plus the 4 correlations = **82**.
- **every parameter is ONE total number.** the only text allowed anywhere in
  the document: `name`, `mimeType`, `encoding`, `timeSignature`,
  `instrumentName`, `instrumentFamily` — plus the `schema` literal itself.
  every other seat is a number, and the validator rejects any string that
  shows up outside the whitelist.
- **the second is the main node.** the document is `header` + `frames` (one
  per whole second) + `correlations`; each frame carries the 66 numeric seats
  plus a `layers` list (the per-track exception, §4).
- **no long open arrays.** chroma (12) and MFCC (13) seat as individual
  keys; the 32-window envelope reduces to statistics; every stream that
  would be long (the spectral peaks stream, the midi notes) folds into an
  FNV-1a 32-bit hash seat, with the short per-second remainder living in the
  layer lane.
- **no wrapper sub-objects** (no `{ stats: { … } }` around values), **no
  `Total` suffixes** on keys, **strictly camelCase** (`^[a-z][a-zA-Z0-9]*$`).

## 3. the bidirectional dictionary (text ↔ number)

every string the system can name has a numeric twin **in the dictionary**
(the constant tables in `reconpayload.ts`) — the payload never carries both
sides of the same fact (the duplicate ban). the analytic tonality seats are
numeric-only (`scaleRoot` 0..11, `scaleType` 0..47, `mostUsedKeyId`,
`mostUsedScaleId`); the dictionary answers their names:

| table | seats | ids |
| --- | --- | --- |
| the 48 scales | `PATTERN_SCALE_NAMES` from `patternenums.ts` (one source of truth — "phrygian-dom" ↔ 27) | 0..47 |
| the 12 roots | `NOTE_NAMES` | 0..11 |
| instruments | `mix` + the eight pattern voices (`PATTERN_VOICES`) | 0..8 |
| families | bass, guitar, vocal, keys, lead, drums, percussion, pad | 0..7 |
| time signatures | 4/4, 3/4, 2/4, 6/8, 5/4, 7/8, 9/8, 12/8 | 0..7 |
| encodings | pcm16, pcm24, pcm32f (the wavwriter depths) | 0..2 |
| mime types | audio/wav (the lane the decode reads) | 0 |
| layers | harmonic, percussive (the hpss detection) | 0..1 |

the tonal families — bass, guitar, vocal — are the layers the YIN note lane
serves: monophonic voices where one f0 is an honest fact.

## 4. the header statistics and the track-only exception

- `mostUsedScale`/`mostUsedKey` are **statistical modes** over the per-second
  scale seats — never a fixed globalScale. `bpm` seats **per second**; the
  header carries the median (`bpmMedian`) and the mean (the shared `bpm`
  aggregate), never one global value.
- the shared `scaleRoot`/`scaleType` header seats carry the **opening
  sounding second's** tonality (the establishing key) — a different fact from
  the mode, not a duplicate of it.
- **track-only exception**: `spectralPeaksStream` and `midiNotes` live **per
  track** (the `layers` list inside each frame — the hpss harmonic and
  percussive stems); every other seat is the **single total value** (the mix
  total for that second). the mix's own top-5 peaks seat in the frame keys
  (`peakHz0..4`/`peakMag0..4`).
- **clamp 0..1 on every normalized parameter** of the data layer (the
  normalized seat list is frozen in `RECON_NORMALIZED_FRAME_KEYS`); the
  validator clamps tolerantly, never invents.
- the per-frame `pcmhash` is the FNV-1a identity of that second's pcm; the
  header `pcmhash` is the identity of the whole analyzed pcm. the stream
  hashes (`spectralPeaksHash`, `midiNotesHash`) identify the per-track
  streams at both granularities.

## 5. the four anti-base64 strategies

audio never rides the json. when a consumer must rebuild sound from a recon
document, one of the four honest strategies applies — each is a real
reconstruction lane, none needs base64:

1. **ISTFT magnitude + phase** — the blob lane stores the stft magnitude and
   phase frames; the inverse transform rebuilds the signal the analysis saw.
2. **PCM float32 downsampled** — the blob lane stores float32 pcm
   (downsampled when the seat allows); the payload points at it by hash, the
   bytes never inline.
3. **additive synthesis from the seed** — the descriptor vector seeds the
   engine's voice recipes; the synthesis rebuilds a take *in the spirit of*
   the analysis, honestly labeled as a rebuild.
4. **MIDI events** — the YIN note lane (midi, onset, velocity) feeds the
   pattern synth through `midiwriter`; notes are events, never samples.

**DPCM is the one documented exception**: differential PCM may ride the blob
lane (delta coding of the float32 pcm) — it is a compression of the bytes in
the blob store, never an inline payload, and it is the only near-PCM
encoding the law tolerates.

## 6. the reconstruction ladder (the future wave)

the escada the recon document feeds, bottom to top:

```text
memória → blob/PCM → payload inline → síntese aditiva seed → pattern synth
```

each rung rebuilds more from less: the memory lane replays the stored
reference; the blob lane answers the PCM bytes by hash; the payload lane
carries the 82 numbers (this contract); the additive-seed lane synthesizes
from the descriptor vector; the pattern-synth lane composes new material in
the measured style. the ladder climbs only when the rung below is verified —
this wave freezes the payload rung.

## 7. the ban list (the fake-parts law)

- **base64** in the json — banned.
- **open PCM arrays** in the json — banned (the blob lane owns the bytes).
- **duplicates text=number** — the same fact never seats twice (a text seat
  beside its numeric twin, "120" beside 120); the dictionary is the only
  place both live.
- **removing parameters** from the ingest document — banned; the converter
  reorganizes into the canonical recon format and the `debonair.ingest/1`
  document keeps every fact it always had (the recon/3 is the new canonical
  format, not a replacement of the stored record).
- **decorative `*Id`/`*Hash` fields without function** — banned; the frozen
  seat lists are the audit: every id seats a dictionary lookup, every hash
  seats an identity the checksum lane verifies.
- **globalScale / one global bpm** — banned (§4).
- **lossless claims** — a checksum **identifies**, it never alleges
  reproduction. `pcmhash` is the identity of the analyzed bytes; two
  documents with the same pcmhash are the same take, nothing more.

## 8. the sample-rate law

- **recon analyzes at 44100 Hz (CD quality)** — `RECON_SAMPLE_RATE`. the
  converter resamples the source to 44100 before the descriptors run, and
  the header stamps the canon rate. the identity hash is the hash of the
  44100 canon.
- **the render master stays at 48 kHz** — the `MASTERING` table in
  `katexis.ts` owns the render lane; the recon document describes what was
  analyzed, the render lane owns what is synthesized. the two rates never
  silently swap.

## 9. the determinism law

- every descriptor is pure math over the pcm: the same bytes always analyze
  to the same document, whatever the platform.
- the canonical serializer orders every key (the frozen seat order) and
  rounds every float to four decimals — the same document always serializes
  to the same bytes.
- every generative consumer of the recon document draws its randomness from
  **`mulberry32(hashSeed(seed))`** — the engine's canonical seeded rng
  (`hashSeed` is the FNV-1a of `harmonyengine.ts`); a synthesis seeded by
  the document hash is reproducible forever.
- the YIN lane (window 80 ms, hop 40 ms) and the 48-scale fit (capture-minus-
  leak scoring, lowest-id tie-break) are deterministic by construction — no
  rng, no platform drift.

## 10. the seat tables (frozen in `reconpayload.ts`)

the 76 header seats, the 66 frame seats and the 4 correlations are frozen as
const arrays (`RECON_HEADER_KEYS`, `RECON_FRAME_KEYS`,
`RECON_CORRELATION_KEYS`) with one comment per seat — the what and the why.
the counts are pinned by the test battery
(`tests/reconpayload.test.ts`): 76, 66, 4, 82. the four correlations, by
their exact names:

| correlation | the measurement |
| --- | --- |
| `tempoFluctuationIndex` | the relative drift of the per-second bpm series (std/mean, clamped 0..1) |
| `spectralTransitionConfidence` | the mean per-second flux over the series maximum — how strongly the seconds assert their spectral changes |
| `harmonicDistortionStateHash` | the FNV-1a identity of the per-second distortion trajectory (flatness, peak, warmth) |
| `pitchTrajectorySlope` | the least-squares slope of the per-second mean midi — semitones per second |
