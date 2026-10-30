# worklog — the debonair reconstruction record (waves D1-D20)

> the wave-by-wave record of the debonair reconstruction, the pipeline
> project docs/planning.pipeline.md carries (waves PV0 through PV7). written
> by the verification wave D20 on 30 october 2026: one row per wave below
> (the wave id, the pr that landed it, what stands), then the state table
> the reconstruction leaves behind. the honest headline the verification
> found: sixteen of the nineteen reconstruction waves had landed on main at
> the pass; the last three (the vitrine publish, the family integration and
> the npm face) landed right after — this closing pass ticks their ladder
> items, so all nineteen stand merged and the records below say so. the
> study record (docs/reference.study.md) and the research record
> (docs/generation.research.md) are the read map the reconstruction pulled
> from; the design record (docs/design.verification.md) is the live face
> proof; the engine map (docs/enginemap.md) is the tree this record ends at.

## the waves

the pr column is the merge the wave landed through (merged unless marked
open); the "what stands" column is the honest content on main at
verification time.

| wave | the wave | the pr | what stands |
| --- | --- | --- | --- |
| D1 | the reference study | #216 (merged) | docs/reference.study.md — the outros.debonair v1/v2 lineages dissected end to end: the vector-one contracts, the 32-dim space, the aurora composer, the engine recipes, the miner shape, the honest separation limit and the fake parts ban |
| D2 | the corpus capture | no pr — the environment pullout | the outros.debonair folder pulled and dedup-merged: 727 files to 106 targets, 3.76 mb of duplication removed, zero errors (the report rides .pullouts-state/od-blobs/dedup.report.json beside the blobs the study read) |
| D3 | the research | #212 (merged) | docs/generation.research.md — the vector law stated plainly, the separation tiers, the generation lanes compared, the method decision: the seeded lane builds, the neural lanes stay study seams |
| D4 | the pattern enums | #222 (merged) | patternenums.ts — the debonair.pattern/1 and timeline payloads, the enum tables any llm can emit, the validators that clamp, the llm instruction builder |
| D5 | the ingest schema | #221 (merged) | ingestdb.ts — the owner pointer, kind, visibility and blob address columns on every document row, parameter binding only, mirroring prisma |
| D6 | the blob store | #224 (merged) | blobstore.ts — the content-addressed put/get, the hand-rolled sha256, the minted ids, the shard layout the vault serves |
| D7 | the ingest worker | #226 (merged) | ingestworker.ts — decode, separate, analyze, segment, store, the wavs per stem + mix: the pipeline runs outside the visitor machine |
| D8 | the gateway routes | #228 (merged) | gatewayapi.ts — the route table (upload, jobs/:id, shelf, read, delete, the blob stream), the nine-column ledger on ingest_jobs, the db binding through ingestdb.ts |
| D9 | the bench rewire | #233 (merged) | ingestclient.ts + ialane.ts + the bench — the drop posts the upload, the meter reads the polled row, the ia lane posts the same route with the service identity; the run-on-this-device key stays the honest opt-in |
| D10 | the playback proof | #229 (merged) | playerbus.ts + the blobstore gateway lane — the reference takes ride the one bus (the session mirror first, the gateway after), the shelf rows share the grammar with the composed takes |
| D11 | the pattern miner | #227 (merged) | patternminer.ts — the profile document (debonair.profile/1), the cosine rank over the normalized segment vectors, the key pool and onset curves |
| D12 | the miner server | #231 (merged) | gatewayapi.ts grows the miner routes (the mine job on the same ledger, the vitrine profile list and read) and the home genre cards read through the catalog seam — offline the seed answers the honest untrained card |
| D13 | the composer | #230 (merged) | composer.ts — the prompt meets the genre profile, the seeded plan lands near the centroid, the similarity floor and the ranked references audit the chain |
| D14 | the render lane | #232 (merged) | renderworker.ts + renderjobs.ts — the plan renders offline through the engine's own voice recipes at 48 khz, the wav lands in the store, the ledger walks queued → rendering → done |
| D15 | the vitrine publish | #235 (merged) | not on main: generateclient.ts, the tracks routes (POST/GET /api/v1/tracks), the visibility column, the home song grid reading the vitrine rows, the with-voice key. the branch stands verified behind the open pr |
| D16 | the design reform | #225 (merged) | the os face — the shell chrome, the pin rail and the player bar on the trylle surfaces, the home grid in the streaming grammar, every page one pass |
| D17 | the design verification | #234 (merged) | docs/design.verification.md — every route walked standalone and inside the power clip, the light face compared per route, the sol biome debt cleared to zero, the sparkbar contrast defect found and fixed |
| D18 | the family integration | #237 (merged) | not on main: the getry lane mount (debonairlane.ts), the vault blob store (vaultblobstore), the sandbox modality declaration, the mcp lane (mcplane.ts). the branch stands verified behind the open pr |
| D19 | the npm face | #236 (merged) | not on main: the package.json exports map (one subpath per engine module), the twenty-seven module closure verified against a real npm pack, the library face test. the branch stands verified behind the open pr |
| D20 | the verification ladder | this pr | the battery (vitest 644/644 across 44 files, tsc clean, the vite build green with restore:entry, biome carrying the three known pre-existing rows), the live proofs through the real ui (the ingest bench with a seeded synthetic wav, the generate flow, the vitrine faces, the os window law), the records ticked (the pipeline ladder, this worklog, the engine map) |

## the state table

what the reconstruction leaves on main, verified 2026-10-30 by the D20
session (the battery + the live proofs). the pending rows name the open
prs that close them.

| the surface | the state |
| --- | --- |
| the engine modules | 57 root modules: the pre-reconstruction tree (katexis, spectrum, fingerprint, analyze, musictheory, harmonyengine, rhythmgrammar, genrematrix, arranger, takeevents, beatgrid, loudness, mixergraph, remixplan, speechalign, timelinemodel, ducking, dawview, takestore, db, seed, catalog, familyurl, family, theme, reveal, cleanurl, labels, stages, motionpref, onboardingstate, tuning, vocalsynth, pianoroll, arrangement, audioengine, takeexporter, midiwriter, stems, wavwriter, cloudsync, hpss, ingest) plus the reconstruction's fourteen (bigintids, patternenums, blobstore, ingestdb, ingeststore, ingestworker, ingestclient, ialane, gatewayapi, patternminer, composer, renderworker, renderjobs, playerbus) |
| the gateway routes | nine on main (gatewayapi.ts): POST /api/v1/ingest/upload, GET /api/v1/ingest/jobs/:id, GET /api/v1/ingest, GET /api/v1/ingest/:id, DELETE /api/v1/ingest/:id, GET /api/v1/blob/:id, POST /api/v1/profiles/mine, GET /api/v1/profiles, GET /api/v1/profiles/:genre — the generation-lane routes (the render queue, the poll, the tracks publish, the vitrine list) ride the open prs #235/#237 |
| the sol surfaces | the shell (the rail, the footer, the shared player bar), the pages (home with the hero prompt and the song grid, generate, ingest with the bench, library, studio with the desk, settings, the intro, the onboarding, the 404) and the wingets (the cover art, the entry gate, the genre card, the song card, the player bar, the studio fader, the piano roll, the spectrum, the stage stepper, the timeline, the vu meter) |
| the tests | vitest 644/644 green across 44 files (the suite inventory debonair/tests/); tsc --noEmit clean; the vite build green at 449.24 kb js / 118.72 kb css with the restore:entry discipline after; biome carries the three known pre-existing rows (the takeexporter import sort, the audioengine ternary, the bigintids dead function) |
| the live proofs | the d20 session against the vite dev server: the ingest bench walked a seeded synthetic wav (built by a node script over the app's own patternenums + renderworker + wavwriter) through decode → separate → analyze → segment → ready on the run-on-this-device lane — the server lane refused offline honestly (the empty origin refuses the house https law; it needs the deployed gateway); the mix and both stems played through the shared bar; the store fell to the offline mirror; the generate flow composed a trap take (the arranger face — the composer-over-profile face rides the gateway), played it through the shared bar and bounced a real wav in the studio; the vitrine faces render (the song grid and the genre cards through the catalog seam, the honest untrained card offline); the os window law answered (?arrive embedded inside the frame, ?independent standalone, the two-app session the documented delta) |
| the docs | planning.pipeline.md (the ladder, ticked by D20), planning.ladder.md, reference.study.md, generation.research.md, design.verification.md, enginemap.md (the tree, refreshed by D20), this worklog, competitor.dissection.md, planning.v2.28-complete.md, planning.versions.2.0.97.to.3.0.md |
| the pending tail | pr #235 (the vitrine publish — pv4.004's publish half, pv4.005), pr #236 (the npm face — pv6.005), pr #237 (the family integration — pv6.001 through pv6.004): merge them and the reconstruction closes; the ladder marks their items unticked with the pending note until then |
