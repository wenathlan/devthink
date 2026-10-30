# debonair

Audio and DAW. Isolated marketing app for the operating system. Houses the katexis engine at the root; imports gateway, AI and workflow from devthink and versawase from cadria. This folder receives the debonair application per the complete tree.

---

# The Sol theme

# Debonair Sol

Debonair is the audio workstation (DAW) of the DevThink family, running on the katexis engine. This Sol theme is the workstation's web surface — a Vite + React SPA whose library, generate, studio and settings routes drive real engine plans (no mock anywhere: the studio plays the WebAudio transport of `Sol/studio/audioengine.ts` over the plans `arranger.ts` composes).

```bash
pnpm install
pnpm dev
```

## The contract (campaign 5-b)

- **test** — `pnpm test` runs `vitest run` over `tests/` (223+ cases across 20 files, node environment). `bun test` answers green on the same suite (bun aliases the vitest API).
- **typecheck** — `pnpm typecheck` (`tsc --noEmit`) must exit 0.
- **lint** — `npx biome check .` must answer 0 errors and 0 warnings.
- **restore:entry** — the vite build emits hashed bundles beside the sources and rewrites `index.html` to the hashed face. `pnpm restore:entry` restores the source face from HEAD, with two guards: it REFUSES (exit 1, nothing touched) while HEAD itself is not the source face (`script … App.tsx`), and it REFUSES while the HEAD face still carries the Google Fonts CDN link (the type triad self-hosts via `@fontsource`, imported by `App.tsx` — the face must never ride a font CDN again).
- **build hygiene** — `.gitignore` bars every hashed emit (`/index-*.js|css`, `/favicon-*.svg|png|ico`, `/manifest-*.webmanifest`, `/icon-*.png`, `/apple-touch-icon*.png`, `/registerSW-*.js`, `/sw.js`, `/*.woff2`); the pages workflow rebuilds per deploy, so only the canonical unhashed faces stay tracked. After a local build, run `pnpm restore:entry` to put `index.html` back on the source face. NEVER build twice without the source face back on disk: the build entry is the root `index.html`, so a second build over the hashed face compiles the previous emit (the double-hash signature — `favicon-XXXX-XXXX.svg` — the legacy tree carried).

## The family contract

The chrome links the sibling deploy units through `familyurl.ts` (the verbatim family body) over the one accent table of `family.ts` (spec §12) — the rail foot, the landing footer and `tests/family.test.ts` read the same table, so the row cannot drift.

## The library face (the npm exports)

Debonair owns the katexis engine, and the engine answers the family ownership law as a published library: any consumer — a sibling app, an embedder, a script — imports the engine through `@wenathlan/debonair` subpaths instead of ever reaching across app folders. The package.json exports map answers one subpath per engine module with the family publish shape (the `types`/`import`/`default` conditions over the root source files, the same source doctrine `@wenathlan/getry/thinking` rides — no build step, the source is the library), the npm files array packs every exported module with its local import closure, and `tests/libraryface.test.ts` pins the whole contract: the map shape, the tarball seats and the named runtime surface of every subpath, imported through the package specifier itself (the embedder's own path). Zero hardcode: every lane answers the options and the injected seats the caller hands it.

| Subpath | What it answers |
| --- | --- |
| `@wenathlan/debonair/analyze` | the analysis chain — `analyze(mono, samplerate)` answers the report.schema v1 (bpm, key, bands, loudness, structure) |
| `@wenathlan/debonair/hpss` | the harmonic/percussive separation — `separate(mono)` answers the conservation-law stem pair over the shared stft kernel |
| `@wenathlan/debonair/ingest` | the decomposition pipeline — `ingestPcm` and `decompose` answer the `debonair.ingest/1` document the miner and the composer consume |
| `@wenathlan/debonair/patternminer` | the genre tool — `mineGenre`, `similarityRank` and `validateGenreProfile` answer the `debonair.profile/1` document from the ingested references |
| `@wenathlan/debonair/patternenums` | the pattern vocabulary — the scale, voice and drum-lane tables plus the `debonair.pattern/1` and `debonair.timeline/1` validators and the canonical serializer |
| `@wenathlan/debonair/composer` | the prompt-to-plan brain — `parseComposerPrompt`, `composeFromProfile` and `composeSimilar` answer the seeded plan near the profile centroid |
| `@wenathlan/debonair/audioengine` | the voice recipes and the transport — the pure `VOICE_RECIPES` tables with `VoiceBank`, `TakeEngine` and `renderTakeOffline` (the WebAudio seats, browser-hosted) |
| `@wenathlan/debonair/wavwriter` | the wav encoder — `encodeWav`, `writeWav16` and `wavInfo` answer deterministic riff/wave bytes, pure on every runtime |
| `@wenathlan/debonair/blobstore` | the content-addressed store — `memoryblobstore`, `fileblobstore` and `gatewayblobstore` answer the put/get pointer contract |
| `@wenathlan/debonair/ingestworker` | the server ingest job — `parseWav`, `downmixmono` and `runIngestJob` walk decode, separate, analyze, segment, store over injected seats |
| `@wenathlan/debonair/renderworker` | the server render job — `schedulePattern`, `renderPatternMix`, `renderPlan` and `startRenderJob` bounce the composed plan into wav bytes offline |
| `@wenathlan/debonair/gatewayapi` | the http route table — `routes`, `matchroute`, `dispatch`, `startJob` and `startMinerJob` answer the nine gateway routes over an injected environment |
