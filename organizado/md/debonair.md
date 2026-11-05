# debonair

## Objective

Debonair is the audio workstation (DAW) of the family and the isolated marketing app for the operating system: it houses the katexis audio and music engine at its root and imports the gateway, AI and workflow surfaces from the OS and the 3D engine from the video studio. The studio plays a real WebAudio transport over real composed plans — no mock anywhere — and the engine answers the family ownership law as a published library with one subpath per module.

## Features

- Studio (DAW) — the workstation view drives the real transport, the take scheduler and the timeline model; nothing is a mock.
- Generate — the prompt-to-plan generation lane composes seeded plans near the profile centroid and renders them offline.
- Library — the song and take catalog with cover art, genre cards and the player bar.
- Ingest — uploaded audio walks the decomposition pipeline (decode, separate, analyze, segment, store) and reverse ingest reconstructs the plan documents.
- Analysis chain — one analysis answers bpm, key, bands, loudness and structure in a versioned report.
- Stem work — per-role stem bounces with a conservation invariant, harmonic/percussive separation and the four-stem demix (vocals, drums, bass, other) as real PCM.
- Composition brain — prompt parsing, profile-based composition and similarity composition answer seeded plans from the ingested references.
- Pattern mining — genre mining, similarity ranking and genre-profile validation over the ingested corpus; the genre matrix answers the deterministic style dictionary.
- Music theory — harmony engine, rhythm grammar, tuning, beatgrid and the pattern vocabulary (scales, voices, drum lanes) with plan and timeline validators.
- Voice — vocal synthesis, formant analysis and speech alignment.
- Remix — remix planning and time stretching over the shared kernels.
- Mixing — mixer graph, ducking, limiter and loudness over the render engine.
- Export — WAV encoder (deterministic riff bytes), MIDI writer, stems manifest, take bounce and download.
- Fingerprints and covers — audio fingerprinting and cover palette generation.
- Server jobs — ingest, render and miner jobs run server-side over injected seats; nine gateway routes dispatch them.
- AI lane — the generation lane asks the family AI gateway for pattern answers parsed onto the plan document; the MCP automation lane exposes the engine tools to external agents with consent metadata.
- Persistence — cloud sync persists takes through the project endpoint with typed results and a local-shelf fallback; a content-addressed blob store (memory, file and gateway backends) holds the bytes.
- Library face — the published package answers one subpath per engine module (analysis, separation, decomposition, mining, pattern vocabulary, composer, audio domain, take domain, wav encoder, blob store, ingest worker, render worker, gateway routes), pinned by its own test.

## Audio

- Analysis family — descriptors, wav walk, decode, FFT, rhythm pair, spectrum, structure, timbre pair, tonality pair, fusion and the audio pipeline, all on one shared STFT kernel.
- Separation — harmonic/percussive median-filter masks over the centered framing; the four-stem demix walks the existing DSP lanes with zero new kernels.
- Music brain — harmony, rhythm grammar, genre matrix, music theory and the arrangement/arranger seats compose the plans the studio plays.
- Voice bank and take engine — the browser transport schedules voices and takes; offline render bounces the same plans to WAV bytes.
- DSP desks — time stretching, speech alignment, formant, loudness, limiter, ducking and the mixer graph.
- Metering — spectrum and vu-meter widgets read the live transport.

## Interactions

- Route tree — intro, onboarding, home, library, generate, studio, ingest, settings and the 404 page.
- Studio widgets — stage stepper, timeline, piano roll, spectrum, vu meter and fader drive the workstation.
- Shell — player bar, toast, entry gate and family rail carry the chrome.
- Generate page — prompt entry walks the composition lane to a rendered take.
- Ingest page — upload walks the decomposition pipeline and reports the documents.
- Settings — theme, motion preference and the family preference surfaces.

## Data

- SQLite store through the shared storage lane; onboarding flags, labels, take records and session events persist server-side.
- Take store — session takes load and save through the take domain; the event stream feeds the timeline model.
- Blob store — put/get pointer contract over memory, file and gateway backends.

## Engine role

Audio engine of the family: the OS studio seat, the video studio and every audio consumer import the katexis surface through the published package.

Padrão: seguir o padrão moderno.
