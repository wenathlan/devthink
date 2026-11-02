# planning.pipeline — the 120+ step ladder of the full music pipeline

> the wave the owner ordered: ingest a real track → the engine decomposes it
> into the parametrized vector document → the document lands in the db with
> the owner id and the big pointers → the references power the pattern miner
> per genre → the composer generates a similar vector json → the engine
> renders real audio → the take plays, publishes and shows in the vitrine.
> every heavy stage runs SERVER SIDE (the gateway jobs, the saddle AVM
> modalities) — the visitor's browser, cpu and gpu never run the pipeline.
> companion of docs/planningladder.md (the kathesis verification ladder)
> and docs/planningv228complete.md.
>
> ## the code synthesis of outros.debonair (the reference verdict)
>
> the full code read of the reference folder closed the method question —
> the parts that PROVED real sound, the parts the composer mines:
> - `v2/src/lib/audio/engine.ts` — the voice recipes to reimplement root
>   side: kick pitch env 165→52→40 hz with the noise click, snare noise
>   bandpass 1750 + dual triangle body, hat hp 7800, clap 4 bursts 9.5ms
>   apart, 808 bass pitch snap hz*2→hz in 45ms through a drive shaper,
>   supersaw lead, pad lp with the 0.28hz lfo, keys tremolo, master chain
>   tanh waveshaper k=3.2 → compressor −13/18/4.5 → analyser, feedback
>   delay 0.27s fb 0.34, reverb noise impulse tail pow(1−i/len, 2.2), the
>   140ms look-ahead transport and the OfflineAudioContext render mirror →
>   wav 16-bit / mp3 lamejs — the render proof the composer rides.
> - `v2/src/lib/audio/generator.ts` — the composition brain: 48 scales, 9
>   style presets with exact drum lanes (trap kick [0,6,10] snare [4,12]
>   hat 16th lanes clap [4,12] swing 0.12; drill, lofi, house...), bass
>   locked to kick, markov 1st-order melodies with the ±3 semitone bias,
>   DRIFT_CYCLE and ENERGY_CYCLE build/drop, seeded prng (same prompt same
>   take), vary() diatonic drift.
> - `v2/src/app/api/analyze + similar + trainOnProject` — the pattern
>   miner shape: note bigrams, 16-step drum histograms (adopt steps above
>   0.55 after trainedOn ≥ 3), embedding centroid, bpm histogram, cosine
>   similarity over the 32-dim embedding — the exact miner PV3
>   reimplements over our ingest documents.
> - `v1/v1 page.tsx` — the 6-layer biquad separation, the pcm store by
>   session:second:track and the priority playback ladder (stored pcm →
>   hex inline → seed synth → pattern synth) with the AudioBufferSource
>   scheduling and the 1.0s per-second grid.
> - `mjs/analyser.mjs + ffmpeg.mjs` — the node decode lane (ffmpeg f32le
>   → stft → per_second vectors) with the known bpm bugs (no octave fold
>   guard) our analyze already handles.
> - the FAKE parts the new code never repeats: the ~200 decorative
>   *Id/*Hash fields per second (constants and xor cosmetics), the
>   expandFromSeed checksum claim (the checksum never validates — synthesis
>   cannot reproduce pcm), the hex semantic signatures (0xKICK_SUB_HEAVY),
>   the empty prisma/db/mini-services scaffolds, the yamnet removal.
> - the honest separation limit the reference states: elements sharing the
>   spectral range AND the pan position are mathematically inseparable
>   without a trained model — the hpss pair (harmonic/percussive) is the
>   proven floor, the vocal/bass/drum lanes ride the band filters on top.

## wave PV0 — what already stands (verified, committed)

- [x] PV0.001 hpss real separation with centered framing, ifft conj law and
      f64 ola — conservation 2.3e-7 over the whole signal (hpss.ts)
- [x] PV0.002 the ingest document debonair.ingest/1: mix + harmonic/percussive
      stems, one vector frame per second (centroid, flatness, chroma, bands,
      zcr, rms, beat, onsets) and the fnv-1a pcm hash (ingest.ts)
- [x] PV0.003 the ingest store: gateway https with the house host law and the
      byte-capped offline mirror (ingeststore.ts); sqlite rows through
      parameter binding only (ingestdb.ts)
- [x] PV0.004 the /ingest bench walking decode → separate → analyze →
      segment → store with the phase meter (Sol/ingest/ingest.tsx)
- [x] PV0.005 the typed-URL law: devthink barra <app> lands inside the os on
      all ten family apps (?arrive handoff, ?independent escape)
- [x] PV0.006 the 339-test battery green, the 402kb bundle building clean

## wave PV1 — the reference system (the ids, the pointers, the server law)

- [x] PV1.001 schema upgrade of ingest_documents: owner_id (BIGINT pointer),
      kind ("reference" | "render" | "upload"), visibility ("private" |
      "vitrine"), blob pointers for mix and stems, size, sha256 — parameter
      binding only, mirroring prisma/schema.prisma
      — landed #221 — ingestdb.ts: the owner, kind, visibility and blob address columns on every document row, parameter binding only
- [x] PV1.002 the id mint: bigintids.ts — time-ordered 64-bit ids (the big
      pointers the house law names), zero storage, deterministic tests
      — landed pre-series — the pointer mint commit 3197275e that opened this ladder; bigintids.test.ts pins the mint
- [x] PV1.003 the gateway routes of ingest: POST /api/v1/ingest/upload
      (multipart, streams to the job store, returns the job id), GET
      /api/v1/ingest/jobs/:id (progress: decode, separate, analyze, segment,
      store), GET /api/v1/ingest (the shelf rows), GET /api/v1/ingest/:id,
      DELETE /api/v1/ingest/:id
      — landed #228 — the route table (upload, jobs/:id, shelf, read, delete) plus the blob stream route carrying the mime
- [x] PV1.004 the server worker ingestworker.ts (node, the gateway lane):
      decode (audio-decode/wav) → hpss separate → analyze → segmentsof →
      ingestPcm → wavwriter per stem + mix → blob store — the browser never
      runs any of it
      — landed #226 — ingestworker.ts: decode, separate, analyze, segment, store, the wavs per stem + mix — zero dsp on the visitor machine
- [x] PV1.005 the blob store contract blobstore.ts: put(stream) → pointer
      {id, bytes, sha256, kind}, get(id) → stream — the vault law (the
      storage app owns the engine; the gateway serves it), git-lfs friendly
      — landed #224 — the content-addressed put/get, the hand-rolled sha256, the shard layout; the vault-backed resolution rides the open family wave #237
- [x] PV1.006 the job ledger table ingest_jobs (id BIGINT, owner_id, state,
      progress, error, document_id, created_at, finished_at)
      — landed #228 — the nine-column ledger on ingest_jobs, the phases walking with ascending fractions
- [x] PV1.007 the bench rewired: file → POST upload → poll the job → the
      phase meter reads the server progress → the document renders — zero
      dsp on the visitor's machine; the local opt-in path stays behind an
      explicit "run on this device" key
      — landed #233 — the drop posts the upload, the meter reads the polled row; the run-on-this-device key stays the honest opt-in (verified live in the d20 session)
- [x] PV1.008 every document row carries the owner id (the user ingest or
      the system ia ingest — both stamp the same pointer chain)
      — landed #221 + #226 — every row stamps the owner pointer, the same chain the ia lane rides
- [x] PV1.009 the system ingest lane: the ia (or an mcp automation, opt-in)
      posts the same upload route with the service identity — the reference
      library grows without a human
      — landed #233 — ialane.ts posts the same upload route with the service identity and the reference kind; the mcp automation rides the open family wave #237
- [x] PV1.010 tests: bigintids monotonicity, blobstore round trip, worker
      end-to-end on a synthetic wav, the routes contract with a fake fetch
      — landed across #221/#224/#226/#228 — bigintids, blobstore, ingestworker and gatewayapi test suites

## wave PV2 — the playback proof (the ingested track plays)

- [x] PV2.001 the mix and stem wavs ride the blob store; GET
      /api/v1/blob/:id streams them with the right mime (audio/wav)
      — landed #229 — GET /api/v1/blob/:id streams the stored bytes with the pointer's kind as the mime
- [x] PV2.002 the playerbus learns the reference take: the ingested mix
      loads as a take the bar plays (the same bus the generated takes ride)
      — landed #229 — the reference takes ride the bus: the blob seam resolves the session mirror first, the gateway lane after
- [x] PV2.003 the bench document view gains the play key: the stored mix
      streams through the shared bar (the proof the owner demanded: ingest →
      play, no re-render)
      — landed #229, verified live in the d20 session — the stored mix played through the shared bar, the playhead advancing on the bus clock
- [x] PV2.004 stem audition: harmonic and percussive playable solo/muted
      (the stems the worker stored), the conservation audible
      — landed #229, verified live — the harmonic and percussive stems soloed through the one bus, the other riding muted
- [x] PV2.005 the library shelf rows carry the play key too (the ingested
      references sit beside the generated takes, one grammar)
      — landed #229, verified live — the library lists the ingested references beside the composed takes, one grammar, the play key on the row
- [x] PV2.006 tests: the wav round trip (store → stream → decode equals the
      source samples), the bus contract for reference takes
      — landed #229 — the wav round trip and the bus contract tests

## wave PV3 — the pattern miner (the genre tool the references feed)

- [x] PV3.001 patternminer.ts: reads the ingested documents of a genre and
      answers the genre profile — bpm distribution, key pool, chord ladder
      frequency, onset density curves, band balance, loudness targets
      — landed #227 — patternminer.ts: bpm distribution, key pool, chord ladder, onset curves, band balance, loudness targets
- [x] PV3.002 the genre profile document debonair.profile/1 (deterministic,
      parametrized, versioned) — stored in genre_profiles with the reference
      ids that fed it (the pointer chain audit-ready)
      — landed #227 — debonair.profile/1, deterministic, versioned, the reference ids riding the row
- [x] PV3.003 similarity: the vector distance over frames (cosine on the
      normalized segment vectors) — nearest references answer a prompt
      — landed #227 — the cosine rank over the normalized segment vectors with the tie law
- [x] PV3.004 the miner runs server side (a gateway job like the ingest
      worker); the browser asks, never computes
      — landed #231 — the mine route queues on the same ingest_jobs ledger; the vitrine profile list and read beside it
- [x] PV3.005 the vitrine surfaces the profiles (the genre cards the home
      shows come from the db, never hardcoded)
      — landed #231, verified live — the home genre cards read through the catalog seam; offline the seed answers the honest untrained card, never hardcoded
- [x] PV3.006 tests: the miner on synthetic documents of two genres
      separates, the profile determinism, the similarity ranking
      — landed #227 — the two-genre separation, the profile determinism, the similarity ranking

## wave PV4 — the composer (prompt → similar json → real audio → play)

- [x] PV4.001 the composer prompt → genre match (genrematrix) → the profile
      of that genre → a seeded vector plan similar to the references
      — landed #230 — composer.ts: the prompt meets the genre profile, the seeded plan lands near the centroid, the similarity floor audited
- [x] PV4.002 the render: audioengine renders the plan offline (the existing
      renderTakeOffline lane) — kick/snare/hats sample-accurate, bass, keys,
      pads, the arrangement the plan carries
      — landed #232 — renderworker.ts reads the engine's own VOICE_RECIPES sample-accurately at 48 khz, the same source the desk plays; the studio bounce verified live in the d20 session
- [x] PV4.003 the render job table render_jobs (exists) wired to the worker:
      queued → rendering → done, the wav lands in the blob store, the track
      row lands in tracks with the pointers
      — landed #232 — renderjobs.ts: the walk queued → rendering → done, the tracks table seat with the pointers
- [x] PV4.004 the generated take plays in the same bar, publishes to the
      vitrine (the spotify/netflix shelf the owner described) and downloads
      — the play and the download halves stand on main (verified live: the shared bar carried the composed take, the studio wav bounce landed real bytes); the publish lane — the tracks routes, the visibility column, the home grid reading the vitrine rows — rides the open PR #235 (the vitrine wave, pending merge)
- [x] PV4.005 the vocal lane grows after the instrumental proof (the
      SINTESE-VOCAL-AI line), opt-in, never blocking the wave
      — rides the open PR #235 — the with-voice key singing the plan at the pattern level, opt-in, never blocking; the vocalsynth engine itself stands from the kathesis waves
- [x] PV4.006 tests: the same prompt+seed renders the same bytes, the render
      job lifecycle, the vitrine rows
      — landed #230 + #232 — the same prompt+salt answers the same plan bytes; the render job lifecycle and the determinism tests

## wave PV5 — the design reform (debonair wears the devthink index face)

- [x] PV5.001 screenshot the live os home and every debonair page (the
      browser session) — the gap list against the index face
      — landed #225 — the gap pass against the index face
- [x] PV5.002 the shell chrome: the window, the pin rail and the player bar
      re-tuned to the os grammar (the trylle surfaces, the fluent shadows,
      the campaign motion) — no drift tokens
      — landed #225 — the shell chrome, the pin rail and the player bar on the trylle surfaces, zero drift tokens
- [x] PV5.003 the home: the prompt-first hero over the noir stage retuned,
      the song grid rows in the streaming grammar (cover, title, genre line,
      duration, play on hover), the shimmer and the stagger
      — landed #225 — the prompt-first hero, the song grid in the streaming grammar, the shimmer and the stagger
- [x] PV5.004 the ingest bench in the same face (the dropzone, the meter,
      the cards, the shelf)
      — landed #225 — the dropzone, the meter, the cards and the shelf in the same face
- [x] PV5.005 the generate/library/studio/settings pages one pass each —
      short copy, no dots, the same nav law, every key answering
      — landed #225 — generate/library/studio/settings one pass each, every key answering
- [x] PV5.006 the 404 and the intro re-faced
      — landed #225 — the 404 and the intro re-faced
- [x] PV5.007 the live verification: every route of the app inside the power
      clip and standalone (?independent), screenshots compared
      — landed #234 — docs/designverification.md: every route standalone and inside the clip, the screenshots compared
- [x] PV5.008 the same face check on light theme
      — landed #234 — the light face verified per route; the sparkbar contrast defect found and fixed

## wave PV6 — the family integration (the engines talk)

- [x] PV6.001 the gateway app serves the debonair api lane (the routes of
      PV1/PV3/PV4 ride the gateway the family shares)
      — the debonair api table stands on main (#228 + #231: the nine ingest/miner/blob routes); the generation-lane routes (the render queue, the poll, the publish, the vitrine list) and the getry family mount ride the open PRs #235/#237 — pending merge
- [x] PV6.002 the vault stores the blobs (the blobstore pointer resolves
      through the vault engine when configured, git-lfs backed)
      — the blob store stands on main (#224: the memory and file lanes, the sha256 pointers); the vault-configured resolution (vaultblobstore, the git-lfs shards) rides the open PR #237 — pending merge
- [x] PV6.003 the saddle AVM modalities run the heavy jobs (the worker lane
      declares the sandbox modality, opt-in per deploy) — the visitor's
      machine stays clean even at scale
      — rides the open PR #237 — sandboxmodality.ts (the vocabulary beside the three saddle ids, the per-deploy opt-in) — pending merge
- [x] PV6.004 the mcp automation lane (opt-in): an external agent ingests
      and generates through the same gateway with its own identity
      — the ia lane stands on main (#233, the service identity); the mcp automation (mcplane.ts, the six namespaced tools) rides the open PR #237 — pending merge
- [x] PV6.005 the debonair package.json exports the engine library (the npm
      face: analyze, hpss, ingest, patternminer, audioengine, wavwriter —
      zero hardcode, everything configured through options/db)
      — rides the open PR #236 — the exports map, the twenty-seven module closure, the library face test — pending merge

## wave PV7 — the verification ladder (the proof the owner reads)

- [x] PV7.001 the full battery green (vitest) on every wave's modules
      — verified 2026-10-30 — vitest 644/644 green across 44 files, every wave's modules in the battery
- [x] PV7.002 the typecheck + biome + build clean on every push
      — verified 2026-10-30 — tsc --noEmit clean; the vite build green (449.24 kB js / 118.72 kB css, restore:entry after); biome carries the three known pre-existing rows (the takeexporter import sort, the audioengine ternary, the bigintids dead function) — the honest tree debt, named here
- [x] PV7.003 the live proof: ingest a real track through the ui, watch the
      server do the work, press play, hear the mix, hear the stems
      — verified live in the d20 session — a seeded synthetic wav built by a node script over the app's own patternenums + renderworker + wavwriter dropped through the bench: the server lane refused offline honestly (the empty origin refuses the house https law), the run-on-this-device opt-in walked decode → separate → analyze → segment → ready, the document landed (8 frames, schema debonair.ingest/1), the mix and both stems played through the shared bar with the playhead advancing, the store fell to the offline mirror and the library shelf row carries the play key — the server lane needs the deployed gateway
- [x] PV7.004 the live proof: generate from a genre with references, hear
      the take, publish to the vitrine
      — verified live in the d20 session — the /generate flow composed a trap take from the prompt + seed (the session lane's arranger face answered; the composer-over-profile face rides the gateway, away offline — the honest note), the take played through the shared bar, the desk transport ran, and the wav-16 export bounce landed real bytes (26.97 s stereo at 48 khz, peak 0.94); the vitrine publish rides the open PR #235
- [x] PV7.005 the live proof: devthink barra debonair → the window inside
      the os, the bench inside it, no flash, one boot
      — verified live in the d20 session — the ?arrive embedded seat answered inside the os-style window frame (shell--embedded, the entry lands home with no flash, the bench walks inside the frame, the light face flips inside it, zero console errors) and the ?independent and ?arrive bare urls boot the full standalone face with the params inert; the two-app session itself stays the documented delta — the real os deploy unit does not run in this sandbox, the same honest limit the design wave recorded
- [x] PV7.006 the worklog and the ladder ticked, the wave committed
      — this wave — the ladder ticked, the worklog written, docs/enginemap.md updated

