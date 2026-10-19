# planning.pipeline — the 120+ step ladder of the full music pipeline

> the wave the owner ordered: ingest a real track → the engine decomposes it
> into the parametrized vector document → the document lands in the db with
> the owner id and the big pointers → the references power the pattern miner
> per genre → the composer generates a similar vector json → the engine
> renders real audio → the take plays, publishes and shows in the vitrine.
> every heavy stage runs SERVER SIDE (the gateway jobs, the saddle AVM
> modalities) — the visitor's browser, cpu and gpu never run the pipeline.
> companion of docs/planning.ladder.md (the kathesis verification ladder)
> and docs/planning.v2.28-completo.md.

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

- [ ] PV1.001 schema upgrade of ingest_documents: owner_id (BIGINT pointer),
      kind ("reference" | "render" | "upload"), visibility ("private" |
      "vitrine"), blob pointers for mix and stems, size, sha256 — parameter
      binding only, mirroring prisma/schema.prisma
- [ ] PV1.002 the id mint: bigintids.ts — time-ordered 64-bit ids (the big
      pointers the house law names), zero storage, deterministic tests
- [ ] PV1.003 the gateway routes of ingest: POST /api/v1/ingest/upload
      (multipart, streams to the job store, returns the job id), GET
      /api/v1/ingest/jobs/:id (progress: decode, separate, analyze, segment,
      store), GET /api/v1/ingest (the shelf rows), GET /api/v1/ingest/:id,
      DELETE /api/v1/ingest/:id
- [ ] PV1.004 the server worker ingestworker.ts (node, the gateway lane):
      decode (audio-decode/wav) → hpss separate → analyze → segmentsof →
      ingestPcm → wavwriter per stem + mix → blob store — the browser never
      runs any of it
- [ ] PV1.005 the blob store contract blobstore.ts: put(stream) → pointer
      {id, bytes, sha256, kind}, get(id) → stream — the vault law (the
      storage app owns the engine; the gateway serves it), git-lfs friendly
- [ ] PV1.006 the job ledger table ingest_jobs (id BIGINT, owner_id, state,
      progress, error, document_id, created_at, finished_at)
- [ ] PV1.007 the bench rewired: file → POST upload → poll the job → the
      phase meter reads the server progress → the document renders — zero
      dsp on the visitor's machine; the local opt-in path stays behind an
      explicit "run on this device" key
- [ ] PV1.008 every document row carries the owner id (the user ingest or
      the system ia ingest — both stamp the same pointer chain)
- [ ] PV1.009 the system ingest lane: the ia (or an mcp automation, opt-in)
      posts the same upload route with the service identity — the reference
      library grows without a human
- [ ] PV1.010 tests: bigintids monotonicity, blobstore round trip, worker
      end-to-end on a synthetic wav, the routes contract with a fake fetch

## wave PV2 — the playback proof (the ingested track plays)

- [ ] PV2.001 the mix and stem wavs ride the blob store; GET
      /api/v1/blob/:id streams them with the right mime (audio/wav)
- [ ] PV2.002 the playerbus learns the reference take: the ingested mix
      loads as a take the bar plays (the same bus the generated takes ride)
- [ ] PV2.003 the bench document view gains the play key: the stored mix
      streams through the shared bar (the proof the owner demanded: ingest →
      play, no re-render)
- [ ] PV2.004 stem audition: harmonic and percussive playable solo/muted
      (the stems the worker stored), the conservation audible
- [ ] PV2.005 the library shelf rows carry the play key too (the ingested
      references sit beside the generated takes, one grammar)
- [ ] PV2.006 tests: the wav round trip (store → stream → decode equals the
      source samples), the bus contract for reference takes

## wave PV3 — the pattern miner (the genre tool the references feed)

- [ ] PV3.001 patternminer.ts: reads the ingested documents of a genre and
      answers the genre profile — bpm distribution, key pool, chord ladder
      frequency, onset density curves, band balance, loudness targets
- [ ] PV3.002 the genre profile document debonair.profile/1 (deterministic,
      parametrized, versioned) — stored in genre_profiles with the reference
      ids that fed it (the pointer chain audit-ready)
- [ ] PV3.003 similarity: the vector distance over frames (cosine on the
      normalized segment vectors) — nearest references answer a prompt
- [ ] PV3.004 the miner runs server side (a gateway job like the ingest
      worker); the browser asks, never computes
- [ ] PV3.005 the vitrine surfaces the profiles (the genre cards the home
      shows come from the db, never hardcoded)
- [ ] PV3.006 tests: the miner on synthetic documents of two genres
      separates, the profile determinism, the similarity ranking

## wave PV4 — the composer (prompt → similar json → real audio → play)

- [ ] PV4.001 the composer prompt → genre match (genrematrix) → the profile
      of that genre → a seeded vector plan similar to the references
- [ ] PV4.002 the render: audioengine renders the plan offline (the existing
      renderTakeOffline lane) — kick/snare/hats sample-accurate, bass, keys,
      pads, the arrangement the plan carries
- [ ] PV4.003 the render job table render_jobs (exists) wired to the worker:
      queued → rendering → done, the wav lands in the blob store, the track
      row lands in tracks with the pointers
- [ ] PV4.004 the generated take plays in the same bar, publishes to the
      vitrine (the spotify/netflix shelf the owner described) and downloads
- [ ] PV4.005 the vocal lane grows after the instrumental proof (the
      SINTESE-VOCAL-AI line), opt-in, never blocking the wave
- [ ] PV4.006 tests: the same prompt+seed renders the same bytes, the render
      job lifecycle, the vitrine rows

## wave PV5 — the design reform (debonair wears the devthink index face)

- [ ] PV5.001 screenshot the live os home and every debonair page (the
      browser session) — the gap list against the index face
- [ ] PV5.002 the shell chrome: the window, the pin rail and the player bar
      re-tuned to the os grammar (the trylle surfaces, the fluent shadows,
      the campaign motion) — no drift tokens
- [ ] PV5.003 the home: the prompt-first hero over the noir stage retuned,
      the song grid rows in the streaming grammar (cover, title, genre line,
      duration, play on hover), the shimmer and the stagger
- [ ] PV5.004 the ingest bench in the same face (the dropzone, the meter,
      the cards, the shelf)
- [ ] PV5.005 the generate/library/studio/settings pages one pass each —
      short copy, no dots, the same nav law, every key answering
- [ ] PV5.006 the 404 and the intro re-faced
- [ ] PV5.007 the live verification: every route of the app inside the power
      clip and standalone (?independent), screenshots compared
- [ ] PV5.008 the same face check on light theme

## wave PV6 — the family integration (the engines talk)

- [ ] PV6.001 the gateway app serves the debonair api lane (the routes of
      PV1/PV3/PV4 ride the gateway the family shares)
- [ ] PV6.002 the vault stores the blobs (the blobstore pointer resolves
      through the vault engine when configured, git-lfs backed)
- [ ] PV6.003 the saddle AVM modalities run the heavy jobs (the worker lane
      declares the sandbox modality, opt-in per deploy) — the visitor's
      machine stays clean even at scale
- [ ] PV6.004 the mcp automation lane (opt-in): an external agent ingests
      and generates through the same gateway with its own identity
- [ ] PV6.005 the debonair package.json exports the engine library (the npm
      face: analyze, hpss, ingest, patternminer, audioengine, wavwriter —
      zero hardcode, everything configured through options/db)

## wave PV7 — the verification ladder (the proof the owner reads)

- [ ] PV7.001 the full battery green (vitest) on every wave's modules
- [ ] PV7.002 the typecheck + biome + build clean on every push
- [ ] PV7.003 the live proof: ingest a real track through the ui, watch the
      server do the work, press play, hear the mix, hear the stems
- [ ] PV7.004 the live proof: generate from a genre with references, hear
      the take, publish to the vitrine
- [ ] PV7.005 the live proof: devthink barra debonair → the window inside
      the os, the bench inside it, no flash, one boot
- [ ] PV7.006 the worklog and the ladder ticked, the wave committed
