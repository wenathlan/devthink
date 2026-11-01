# devthink.laws.md — the single Polar law file (v45 wave plan)

Single root file reagrouping every Polar feature/rule/complaint from the full corpus
(polar8789 + wedssdSsde + vrtyu4 + Pasted Content 1793556657400 + Pasted Content
1793578239912), deduplicated by sense. 610+ numbered actions across 12 waves, one PR
per wave, squash-merged to main, only main remains. Commits ride the iakadion identity
via standard git. English everywhere in code; tests green (900–1000 vitest steps)
before every push. Reading/docs wave rides last. Saddle first, then Vault.

## wave 0 — unblock the ladder [DONE via #272 + #275 + #282 + #287 + #288]
dependency ladder, trivy carriers, sqlite lock law (30s busy timeout), worker
isolation law (per-worker wal file under vitest), extension gates answer the bun rung.
Rung stamps to 2.0.154.

## wave 0b — mirror hygiene [DONE]
270 polluted assets deleted; 3 forge macos-x64 assets rescued; mirror = tarball + SHA256SUMS.

## wave 1 — publish pipeline law [DONE via #274 + #276 + #291]
mesa healing tier hardened, trivy gate, visitor law exemption, family context,
archive context law (saddle container release archive rides the staged sibling tree).

## wave 2 — saddle ownership (microVM law) [WAVE A — FIRST — actions 1..120]
1–90. audit every one of the 90 modalities of the modality registry (id, lane, driver,
   honesty: real executor vs stub) — one action per modality;
91–101. the 11-architecture container standard: max + light real drivers per arch
   (x64, arm64, armv7, riscv64, ppc64le, s390x, 386, mips64le, loong64, wasm32, wasip1);
102–104. the vGPU / vCPU / port lanes ride honest executors (no hardware touch on the
   user machine — edge processing only, 24h internet infra);
105–107. the .exe / .sh / YML-YAML lanes: SH execution, YAML interpretation with Babel
   compile, second-plane execution;
108–112. transfer every non-VM feature out of saddle (web scrape + friends) into
   devthink — saddle keeps only sandbox / VM / runner / vGPU / vCPU / ports / hardware
   virtual modalities;
113–120. tests for each transferred lane (saddle shrinks, devthink grows, both green),
   modality registry stays at 90+ with unique ids, boot ladder measured.

## wave 3 — debonair kathesis (audio engine law) [WAVE C — actions 121..200]
#286 wired the llm lane (composeWithLlm over the family gateway); #284 ranked the
genre verdict. Remaining:
121–150. reverse ingest (the V1 law): JSON structured payload → reconstructed song,
   the decompose/recompose pair, sandboxed render (no browser/GPU touch);
151–165. 4-stem demix (vocals / drums / bass / other) with real DSP executors;
166–175. trained genre corpus wired to the classifier (15 styles ranked);
176–185. formant vocal render (real formant synthesis lane);
186–195. time-stretch executor (phase-vocoder honest lane);
196–200. bounce limiter parity + regression batteries (905+ steps stay green).

## wave 4 — cadria versawaze (visual engine law) [WAVE B — actions 201..280]
201–230. the video encoder: WebCodecs lane over versawaseslices + GL frames, real
   bytes for png / webm / gif artifacts (no mock buffers);
231–250. RenderJob executor: the queue, the worker, the artifact store (DB via
   internal API, no fixed data in wingets);
251–270. timeline compositor: tracks, clips, transitions, keyframes;
271–280. user video import (file → DB → timeline), regression batteries (417+ green).

## wave 5 — design restoration [WAVE G — actions 281..305]
#281 retired the gtx lane (last hard violation). Remaining:
281–283. the 3 chat-trajectory blues decision (data-viz semantics — keep as chart
   semantics or repaint to family tokens);
284–286. design.html deletion + dead css sweep (transition-all = 0 sites);
287–305. winget text sweep: zero infrastructure-revealing texts, title + description
   only, Fluent Icons, 6 buttons, pink hero, login shadow clean, fonts offline.

## wave 6 — vault rewire [WAVE D — actions 306..375]
#289 landed the vault client (the face calls its own api). Remaining:
306–320. HelixDB-style API: Bearer + database-id headers, /v2/query lane over the
   better-sqlite3 core;
321–335. signup → Database ID + api key shown once (hash stored, never plaintext,
   never browser persistence);
336–340. block direct .db download (the faun law — bucket serves via internal API only);
341–355. mimetypes pillar: 3000+/4000+/6000 mimes served correct by the internal root;
356–365. https protocols pillar: 100+/200/1000 routes static-safe on domain;
366–375. remove the 2GB lock in My Files (quota configurable per bucket) + tests.

## wave 7 — logic regrouping (root law) [WAVE E — actions 376..465]
#273 label store + #277 storagelane factories landed (db ×10 collapsed). Remaining:
376–385. onboardingstate ×10 → single factory import (3 drifted APIs aligned);
386–400. devthink auth cluster: 7 files / 10.4k lines → auth.ts single owner;
401–424. sha256 ×24 sites → one owner module (24 actions, one per site);
425–434. familyurl ×10 → one owner;
435–444. version.ts triple-sync (one source, 3 carriers);
445–465. devthink scripts.*/terminal/audit clusters (22 files) → grouped root files;
   3000–4000 logics regrouped into single root files per keyword.

## wave 8 — dependency union (manifest law) [WAVE F — actions 466..505]
466–476. union all 11 package.json dependencies (zero removals ever — union only);
477–486. V engine catalog 0.5.2 (vlang) + engines ladder 15+ (node maestro, bun,
   cargo, corepack, deno, pnpm, babel, go, python, rust, java, dotnet, ruby…);
487–496. lockstep the 3 lock carriers (bun.lock ×11, npm-shrinkwrap, pnpm-lock);
497–505. changelog note + release rung (500+ release notes ceiling), assets green.

## wave 9 — tests (green law) [ongoing per PR — actions 506..545]
506–545. every app battery green before push: devthink 3659+, debonair 905+,
   cadria 417+, saddle 436+, argan/cobaia/forge/foundry/getry/stealthhead/vault
   suites; only .ts at tests roots; no json/mjs/cjs/images inside tests.

## wave 10 — structure (12-folder law) [compliant — actions 546..550]
546–550. root = .github + 11 apps + .gitignore + package.json; per app TS root +
   sol/tests/docs; audit after every wave (no scripts/artifacts/src/terminal).

## wave 11 — docs consolidation (allan law, LAST) [WAVE I — actions 551..595]
551–560. clone allan/organizado (4GB lane, no blobs), commit/pull, delete after;
561–565. move devthink/docs (146) + saddle/docs (101) + debonair/docs (10) out to
   allan/organizado/md;
566–576. the 11 dossiers: argan.md, cadria.md, cobaia.md, debonair.md, devthink.md,
   forge.md, foundry.md, getry.md, saddle.md, stealthhead.md, vault.md (features
   category per app — objective, no path names);
577–587. dedupe 7000+ docs → ≤10 master files (infraestrutura.md, links.md,
   regras.md, unified package.json union via script);
588–595. reading log: 900/1000 blobs separated per feature per app; conversa.md
   23k lines read linear via bash sed before the dossiers freeze.

## wave 12 — security + cli + pages [WAVE H — actions 596..610]
596–600. every security alert resolved at github.com/wenathlan/devthink/security;
601–605. cli pairing (Cline AuthKit model): same design web/desktop/cli, only DPI
   differs; binary per app in release assets;
606–610. pages verified at wenathlan.github.io/devthink: direct URL
   /devthink/<app>/ = fullscreen standalone (no window), panel double-click =
   in-window (identical render, no cut UI); multi-catalog npmjs + github packages +
   maven + nuget + rubygems + ghcr + docker; 467+ assets in release notes.

## live progress log (this session — v45)
- [x] remote HEAD synced (rebase over #284/#286/#287/#288/#289/#281/#291)
- [x] polar auth verified (token captured, gh scopes full, push green)
- [x] baseline sweep launched; devthink deps installed (863 packages)
- [~] wave dispatch: A saddle → B cadria → C debonair → D vault (parallel batch 1,
      disjoint file sets, worktree-isolated processes); E logic + G design (batch 2);
      F deps + H security/cli/pages (batch 3); I docs/allan (last wave, reading law)
