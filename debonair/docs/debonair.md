# debonair — the dossier

The audio and music app of the family. Debonair houses the Kathesis engine at the folder root: the complete DAW, the sonic AI and the ingest doctrine.

## Identity

- Category: audio / music DAW.
- Engine: Kathesis (audio infrastructure, synthesis, sonic AI).
- Competitor space: suno.com, Google Flow Music, FL Studio Mobile.
- Consumer law: audio logic lives here; siblings import debonair as a library.

## Objective

Make every audio action real: songs decompose into structured payloads, the payloads reconstruct into playable audio inside the sandbox, and the DAW answers a complete studio — never touching the visitor GPU or browser.

## Features

- Music studio: mixer, effects rack, transport, sampler.
- The V1/V2/V3 payload doctrine: forward ingest decomposes whole songs into structured JSON payloads; the reverse door reconstructs the whole-song payload (the soundpayload seat) with roundtrip verification and digest determinism.
- Synthesis seats: chroma partials, noise beds, onset bursts, envelope folding — pure TypeScript math, deterministic.
- Voice, synthesis, mixing, mastering seats.
- Beatgrid and arrangement surfaces.
- Demix and analyze lanes (the audio forensics).
- Cover palette extraction from the audio seat.

## Interactions

- DAW surfaces: timeline, mixer, transport, effects rack.
- Library face with the reverse ingest ladder (reconstruct and play from the payload).
- CLI console with the family chat design.

## Doctrine

- The sandbox law: playback and reconstruction run server-side, the visitor browser never executes the engine.
- The reconstruction is verifiable: same payload, bit-identical bytes, digest pinned.
