# foundry features

real features from the code, grouped by category. Every entry names the module that carries it.

## pipeline

- canonical plan — `PIPELINE` ("foundry-pipeline"): provision → pull → run → collect → store, one wire per hand-off (`graphplan.ts`).
- step kinds — every plan step wears a role: stage, gate, tool or sink (`graphplan.ts`).
- topological staging — `planstages` layers the plan into stable waves (one per stage column); `plandepth` counts them (`graphplan.ts`).
- plan validation — `planvalid` answers the problem codes duplicateid, selfwire, unknownstep, cycle@N; an empty array is a valid plan (`graphplan.ts`).
- graph projection — `plangraphof` projects the plan plus a state map into nodes and edges, pending when the map stays silent (`graphplan.ts`).
- layout geometry — `planpositions` (default column 208, row 72) and `planbounds` (card 176×56, padding 20) give the svg box the panel draws — nothing improvises geometry (`graphplan.ts`).
- deterministic rehearsal — `planrehearsal(plan, seed, tick)`: done prefix, running cursor, pending rest; the same seed and tick always answer the same map (`graphplan.ts`).
- seeded red rung — `planfailindex`: one roll in five rides red; the red step keeps its failure record, the rest strand skipped; a reseed rolls again (`graphplan.ts`).
- progress and tally — `planprogress` (the done share, 0–100) and `plantally` (the state histogram) (`graphplan.ts`).
- open steps — `planopensteps` lists the unsettled prefix the manifest page narrates (`graphplan.ts`).
- stage graph widget — `GraphPanel` draws the plan as an svg map: one card per step riding its topological stage, hairline bezier wires, the windows accent #4cc2ff on running, the windows close red rgb(232 17 35) on failed — every state is a dot plus text (`sol/wingets/ArtifactsGraphpanel.tsx`).

## sandbox

- three-state ladder — cold (built, not booted), warm (booted, keeping its working set), hot (executing) — owned by `@wenathlan/saddle/sandbox`, bound in `sandbox.ts`.
- guarded transitions — `canTransition` allows cold→warm, warm→hot|cold, hot→warm|cold; every other move is refused (`sandbox.ts`).
- honest refusals — `refusalFor` answers a string per refused move, e.g. "a cold sandbox cannot execute — warm it first"; the page surfaces it on the readout (`sandbox.ts`).
- machine actions — `drive` applies warm (boots+1, steps reset), heat, cool (steps down to warm, the working set kept) and freeze (cold, boots and steps reset) — pure, the input never mutates (`sandbox.ts`).
- step counting — `step` records one executed step on a hot sandbox only; anything colder refuses (`sandbox.ts`).
- seeded herd — `seedHerd(seed, 7)`: deterministic ids (`fdy-…-NN`), state rolls (< 0.4 cold, < 0.75 warm, else hot), the image rolls from five herd images (base.tzst … pack.tzst), boots 1–6, steps 1–40 (`sandbox.ts`).
- herd census — `herdCensus`: total, by-state histogram, warm share ((warm + hot) / total) (`sandbox.ts`).
- mulberry32 — the shared deterministic prng every family engine rolls (`sandbox.ts`, `graphplan.ts`, `artifact.ts`, `imagestore.ts`).
- workload lanes — `WORKLOADLANES`: pipeline-graph (the plan walk) and image-artifact (the format plans, checksum seals and shelf records) — process isolation, boot budget 25, no gpu, no network, app-lane today (`sandboxmodality.ts`).
- lane seat — `FOUNDRY_SANDBOX_LANE`: absent / blank or "local" (the deploy's own process), "join" (the platform's join resolver), or a pinned modality id the platform validates at dispatch (`sandboxmodality.ts`).

## artifacts

- fnv-1a checksums — `fnv1aHex` over the identity string, 8 hex; the same bytes in node and in the browser, pinned byte for byte by the tests (`artifact.ts`).
- identity string — `artifactIdentity`: `[name, ext, bytes, payload].join(" · ")` — the exact string the checksum digests (`artifact.ts`).
- sealing — `sealArtifact` builds the record from the identity and the checksum (`art-…` id); pure, nothing is written anywhere (`artifact.ts`).
- verification — `verifyArtifact` re-seals and compares; the page marks rows intact or mismatch (`artifact.ts`).
- line and manifest — `artifactLine` and `manifest` render the shelf verbatim, one line per artifact in stable order; the footnote renders the same line (`artifact.ts`).
- seeded line — `seedArtifacts`: one artifact per herd format (base / toolchain / runtime), bytes (30 + roll×700) MB (`artifact.ts`).
- seal-a-draft form — name and payload digest inputs (each ≤ 40 chars, an honest default name when empty) seal a draft as tzst with bytes `4096 + payload.length`; a live preview shows the line and the fnv-1a digest (`sol/manifest/manifest.tsx`).
- line summary — count, all-sealed verdict, digest (fnv-1a · 8 hex), identity format (name · ext · bytes · payload) (`sol/manifest/manifest.tsx`).
- walk and rerun — one advance walks the shelf and the stage graph together (one run, two views of the same rehearsal); a rerun reseeds the line (`sol/manifest/manifest.tsx`).

## images

- three herd formats — `.tzst` (the quick herd, tar over zstd), `.tar.gz` (the pack herd, tar over gzip), `.tar.xz` (the release herd, tar over xz) — `FORMATS` in floor order (`imagestore.ts`).
- conversion plans — `convertPlan`: unpack the source layer down to the tar stream, recompress into the target, seal the converted herd with sha-256; a same-format ask answers a one-line no-op — never a direct byte-to-byte lie (`imagestore.ts`).
- size estimates — `estimateSize`: the compressed share of the tar stream — tzst 0.32, targz 0.38, tarxz 0.26 (`imagestore.ts`).
- pour order — `pourOrder`: the lead herd first, the order the shelf presents (`imagestore.ts`).
- seeded shelf — `seedImages(seed, 6)`: tar streams (40 + roll×900) MB, formats round-robin, names base / toolchain / runtime / pack / release (`imagestore.ts`).
- byte formatting — `formatBytes`: tabular, one unit (B / KB / MB / GB / TB) (`imagestore.ts`).
- format lookup — `formatOf` and `formatFromExt` answer specs by id or extension; unknowns are refused honestly (`imagestore.ts`).
- conversion plan panel — from / to chip selectors (default tzst → tarxz) with the honest step list and the estimates on a 1 GB tar stream (`sol/images/images.tsx`).

## ui

- anchor architecture — App → Sol theme anchor → page anchors → wingets; nothing is imported outside the chain (`App.tsx`, `sol/Sol.tsx`).
- wouter routes — /intro, /onboarding, /, /sandboxes, /images, /manifest, /404 and the catch-all; the base rides the build declaration, never the runtime path (`App.tsx`, `sol/Sol.tsx`).
- error boundary — the theme boundary renders the boundary copy, the stack and a reload button (`App.tsx`).
- standalone window — full-bleed at the app url; the window chrome exists only inside the devthink os power clip, the same surface tree in both seats (`sol/shell/Shell.tsx`).
- page rail — the pins home / sandboxes / images / manifest with the accent ladder on the active entry (`sol/shell/Shell.tsx`).
- family foot — the nine siblings link out via `familyurl` (`../slug/`), one spec §12 accent dot per unit; the row links out, never back (`sol/shell/Shell.tsx`, `family.ts`, `familyurl.ts`).
- theme flip — light default, `data-theme` dark / light, in memory per document lifetime (`sol/shell/Shell.tsx`).
- entry gate — `EntryGate` resolves the first-run state: intro unseen → /intro, onboarding unseen → /onboarding, else home; renders null while resolving (`sol/wingets/HomeEntrygate.tsx`).
- intro splash — the brand mark holds ~1.6 s, slides up over 0.8 s, hands directly to /onboarding; click, any key or reduced motion skips (`sol/intro/intro.tsx`).
- onboarding walk — three beats (is / does / enter) on 250 ms entries; the finish and the skip both mark onboarding seen — the flow is never forced again (`sol/onboarding/onboarding.tsx`).
- copy law — every interface string rides `labels.ts` (revision 3, english source of truth); `labelfill` fills the {token} slots with runtime values; translated rows stay protected from the seed overwrite (`labels.ts`).
- forge console — the landing prompt drafts a herd name and picks a clone format; the readout stays a draft — the staging surface stores nothing (`sol/home/home.tsx`).
- jump links — the anchor chips to the floor section and the family repository (`sol/wingets/HomeTabs.tsx`).
- boot readout — the entry strip of the landing: state, body and note (`sol/wingets/HomeEntry.tsx`).
- empty states — `EmptyState` with per-page copy and the reseed / rerun action (`sol/wingets/ShellEmptystate.tsx`).
- accessibility — aria labels on every region, `role="alert"` refusals, `role="status"` readouts, dot plus text states, never color alone (all pages).

## Dependencies

- synchronized dependency union — the eleven family apps share one dependency tree: identical `dependencies`, `devDependencies` and `peerDependencies` (same keys, same versions, nothing removed, highest semver wins on conflicts) and one `engines` catalog with node as maestro and the V 0.5.2 seat as catalog annotation (@family wave/depssync).
