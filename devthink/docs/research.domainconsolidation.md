# research.domainconsolidation.md — Mapeamento da ressincronização por domínio (frente reagrupamento)

**Tarefa 12-a · somente pesquisa · nenhum arquivo de app foi modificado.**
Monorepo `/home/z/my-project` · 11 apps · inventário coletado com `wc -l`/`rg` sobre os arquivos `.ts/.tsx` da **raiz** de cada app (excluídos `sol/`, `test/`, `docs/`), classificação por palavras-chave de domínio e verificação de conteúdo (cabeçalho + imports + exports) de **todos** os suspeitos.

Domínio oficial de cada app (fonte: `devthink/logics.ts` → `DOMAIN_OF_APP`):

| app | domínio | app | domínio |
|---|---|---|---|
| devthink | os (envelope) | foundry | pipeline (+banco) |
| argan | network (DNS) | getry | aigateway (IA/LLM) |
| cadria | video3d (vídeo/imagem/3D) | saddle | virtualization (VM/sandbox) |
| cobaia | monetization | stealthhead | game (FPS) |
| debonair | audio | vault | storage |
| forge | runner (execução pura) | | |

---

## (a) Inventário por app

Resumo geral (arquivos `.ts/.tsx` na raiz):

| app | arquivos raiz | linhas totais | arquivos >500 l |
|---|---:|---:|---:|
| devthink | 153 | 173.520 | 71 |
| argan | 21 | 6.631 | 2 |
| cadria | 50 | 19.864 | 12 |
| cobaia | 15 | 2.030 | 0 |
| debonair | 72 | 36.823 | 16 |
| forge | 22 | 2.047 | 0 |
| foundry | 21 | 3.423 | 2 |
| getry | 51 | 47.450 | 22 |
| saddle | 58 | 60.760 | 26 |
| stealthhead | 24 | 4.337 | 1 |
| vault | 39 | 10.767 | 4 |

### devthink — os (dono: envelope/OS) — 153 arquivos, 173.520 linhas, 71 arquivos >500 l

Maiores (todos domínio **os/próprio** — VERDE; suspeitos verificados um a um, ver §b):

`background.ts` 16.848 · `policy.ts` 12.962 · `types.ts` 9.122 · `page.ts` 8.800 · `sidepanel.ts` 7.941 · `memory.ts` 7.293 · `security.ts` 6.586 · `workflow.ts` 5.014 · `apifreeze.ts` 4.790 · `protocol.ts` 4.186 · `cli.ts` 3.500 · `config.ts` 3.210 · `scripts.ts` 3.185 · `build.ts` 2.408 · `agent.ts` 2.331 · `views.ts` 2.155 · `run.ts` 2.135 · `http.ts` 2.110 · `bridge.ts` 2.080 · `os.ts` 2.025 · `storage.ts` 1.948 · `recipes.ts` 1.920 · `mcp.ts` 1.849 · `account.ts` 1.713 · `popup.ts` 1.651 · `capture.ts` 1.614 · `core.ts` 1.483 · `commands.ts` 1.466 · `dashboard.ts` 1.380 · `gateway.ts` 1.326 · `progress.ts` 1.308 · `sandboxlane.ts` 1.292 · `runtime.ts` 1.223 · `net.ts` 1.213 · `flow.ts` 1.190 · `session.ts` 1.162 · `server.ts` 1.147 · `soak.ts` 1.092 · `data.ts` 1.071 · `queue.ts` 1.070 · `graph.ts` 1.061 · `agentcert.ts` 1.058 · `environments.ts` 1.005 · `pack.ts` 973 · `pentest.ts` 966 · `perf.ts` 957 · `release.ts` 903 · `export.ts` 889 · `swarm.ts` 884 · `logics.ts` 871 · `debug.ts` 850 · `costcert.ts` 838 · `devthink.ts` 819 · `catalog.ts` 819 · `wcag.ts` 807 · `uistore.ts` 805 · `tools.ts` 734 · `sweep.ts` 730 · `plan.ts` 691 · `optionspage.ts` 691 · `vite.config.ts` 667 · `browserextension.ts` 658 · `evidence.ts` 643 · `auth.ts` 642 · `saascontent.ts` 607 · `dashboardpage.ts` 552 · `automation.ts` 552 · `chatstate.ts` 546 · `transparencypage.ts` 541 · `labels.ts` 541 · `familylanes.ts` 526.

Restantes (82 arquivos <500 l): famílias de gates/smoke (chromiumsmoke 378, consumersmoke 185, nativesmoke 128, doccheck 410, docsaudit 140, schemaaudit 111, maintain 308, gates 307, hardening 191, matrixverify 482, poolaudit 439…), terminais (shellterminal 92, kbdterminal 35, chipterminal 35), runtimes (deno 27, node 26, bun 26, cjs 9, umd 9, cjswrap 17, umdwrap 16…), portas (`media.ts` 48 → re-exporta `@wenathlan/cadria/transcode`; `routerbase.ts` 51 dono da família), stores (`usestoredstate.ts` 114, `planstore.ts` 215, `personalstore.ts` dono do theme) e nanomódulos.

### argan — network (dono: DNS/rede) — 21 arquivos, 6.631 linhas

>500 l: `mimetypes.ts` 3.474 (catálogo MIME da família + engine de corpus — **dono por lei dedup #10**; os hits de áudio/vídeo são *linhas de tipos MIME* `audio/*`, `video/*`, não lógica de engine) · `dns.ts` 1.121 (engine DNS: DNSSEC, RrSig/DnsKey/DsRecord, parseZoneRecords, diffZones — **dono**).
Restantes: `seed.ts` 332, `db.ts` 297 (monta sobre `@wenathlan/vault/storage`), `labels.ts` 262, `onboardingstate.ts` 210, `cli.ts` 159, `sandboxmodality.ts` 131 (seat sobre `../saddle/workloadlaw.ts`), `argan.ts` 129, `catalog.ts` 128, `App.tsx` 90, `family.ts` 89, configs e portas (`theme.ts` 4, `cleanurl` dono dentro de `dns.ts`, `motionpref.ts` 27 porta de debonair, `reveal.ts` 3 porta de devthink, `routerbase.ts` 1 porta).

### cadria — video3d (dono: vídeo/imagem/3D) — 50 arquivos, 19.864 linhas

>500 l (12): `versawase.ts` 2.974 (**a engine 3D/vídeo/imagem/animação da família** — ver §d) · `image.ts` 1.865 · `transcode.ts` 1.534 · `synth.ts` 1.249 (síntese de imagem a partir de `AudioDescriptor` **importado de `@wenathlan/debonair/audio`**) · `mesh.ts` 850 (malha 3D — dono) · `versa.ts` 697 · `compositorraster.ts` 615 · `visualize.ts` 610 · `gateway.ts` 595 (server hono próprio; `/api/analyze` chama `analyzeWavBytes/analyzePcm` **de `@wenathlan/debonair/audio`**) · `video.ts` 592 · `labels.ts` 583 (manifest de dados sobre engine `@wenathlan/vault/labelstore`) · `timeline.ts` 553.
Restantes: família encoders (`webmencoder` 487, `shaders` 497, `gifencoder` 389, `shadercomp` 368, `pngencoder` 361), cor (`masks` 298, `colorconvert` 277, `pixel` 252, `blendmodes` 259), motion (`timeticks` 275, `easecurves` 258, `designmotion` 79), `visualai.ts` 394 ("honest generative seat": matemática procedural, sem LLM), `mediaprobe.ts` 388, `studio.ts` 462, `renderjob.ts` 281, `generation.ts` 304 (persiste rows de análise; `sampleRate` é coluna de dado, não DSP), `db.ts` 279, `seed.ts` 208, portas e configs.

### cobaia — monetization (dono: pay/plan) — 15 arquivos, 2.030 linhas

Nenhum arquivo >500 l. `content.ts` 425 (rows de conteúdo; menções a "dnssec" são *strings de marketing* da família), `labels.ts` 313, `db.ts` 298 (sobre lane vault), `monetization.ts` 248, `onboardingstate.ts` 211, `cli.ts` 159, `sandboxmodality.ts` 124, configs/portas. **VERDE** — app pequeno e no próprio domínio.

### debonair — audio (dono: DAW/áudio) — 72 arquivos, 36.823 linhas

>500 l (16): `audio.ts` 4.141 (engine de áudio; exportada como `@wenathlan/debonair/audio` e consumida pelo cadria) · `ingest.ts` 4.122 · `pattern.ts` 2.130 · `recon.ts` 2.020 · `gatewayapi.ts` 1.983 (19 rotas HTTP do gateway *próprio* de áudio — não é gateway IA) · `kathesis.ts` 1.966 ("engine seat e dsp core" — debonair **É** a engine kathesis) · `blobstore.ts` 1.577 (4 backends: memory/file/gateway/**vault** — ver §b) · `composer.ts` 1.466 · `playerbus.ts` 1.237 · `renderengine.ts` 940 (render de **áudio**: masterização, wav encoder) · `generateclient.ts` 935 (cliente tipado do gateway próprio) · `mcplane.ts` 833 (automação MCP `debonair.*`) · `render.ts` 566 (ledger de render) · `take.ts` 546 · `reverseingest.ts` 536 · `labels.ts` 533.
Restantes: folhas DSP (formant 468, wavwriter 403, midiwriter 408, ducking 322, speechalign 308, genrematrix 308, vocalsynth 301, demix 297, loudness 295, limiter 287, hpss 269, timestretch 267, mixergraph 277, spectrum 156, stems 228…), teoria musical (genre 455, musictheory 382, beatgrid 341, rhythmgrammar 285, harmonyengine 248, tuning 20, patternenums 14), `llmlane.ts` 194 (**cliente fino do gateway getry** via `VITE_GETRY_URL`, fetch injetável), `ialane.ts` 131 (ingest por IA/mcp), `fingerprint.ts` 185 (landmark de áudio, tipo Shazam), `katexis.ts` 221 (vocabulário do site), portas/configs.

### forge — runner (execução pura) — 22 arquivos, 2.047 linhas

Nenhum >500 l. `labels.ts` 310, `db.ts` 231 (sobre `@wenathlan/vault`), `onboardingstate.ts` 225, `fleet.ts` 225, `cli.ts` 159, `queue.ts` 135, `runstream.ts` 124, `sandboxmodality.ts` 117, `graphplan.ts` 106 (**porta** sobre a engine de planos em `foundry/pipeline.ts`), `runner.ts` 12, `api.ts`/`utils.ts` 6, `hometypes.ts` 3 (**porta** sobre `foundry/hometypes.ts`). **VERDE** — menor app, tudo porta ou lógica própria.

### foundry — pipeline (+banco) — 21 arquivos, 3.423 linhas

>500 l: `pipeline.ts` 907 (arquivo-chave: fundiu 6 módulos — artifact/graphplan/**imagestore** (formato de *imagem de disco/containers*, não fotos)/runner/sandboxmodality; **importa `@wenathlan/saddle/sandbox`**) · `readiness.ts` 646.
Restantes: `bundlescan.ts` 397, `labels.ts` 306, `db.ts` 228, `onboardingstate.ts` 210, `cli.ts` 159, `dependencyupdates.ts` 73, `npmgate.ts` 53, portas. **VERDE** — consome saddle e vault como biblioteca.

### getry — aigateway (dono: IA/LLM) — 51 arquivos, 47.450 linhas

>500 l (22 — todos do domínio aigateway/próprio): `request.ts` 4.496 · `streaming.ts` 4.398 (parser SSE — os hits "chunk" são de *streaming*, não storage) · `models.ts` 4.017 · `providers.ts` 3.238 · `llm.ts` 2.709 · `recovery.ts` 2.434 · `oauth.ts` 2.201 (OAuth de *providers* IA/Antigravity) · `antigravity.ts` 2.171 · `accounts.ts` 2.087 · `quota.ts` 1.891 · `search.ts` 1.761 · `engine.ts` 1.535 · `fingerprint.ts` 1.461 (anti-detecção de provider) · `versionregistry.ts` 1.325 · `gateway.ts` 1.306 · `project.ts` 1.293 · `cli.ts` 1.040 · `constants.ts` 950 · `json.ts` 932 · `db.ts` 814 (sobre `@wenathlan/vault/storage` + `onboardingstore`) · `types.ts` 809 · `server.ts` 766 (transporte do gateway — **movido verbatim de devthink/server.ts** na wave ownership.gateway).
Restantes: `thinking.ts` 416, `debonairlane.ts` 367 (espelho do `llmlane` do debonair), `auth.ts` 265, `nodeshim.ts` 265, `utils.ts` 263, `routerotation.ts` 232, `intelligence.ts` 169, `sessions.ts` 167, `gatewaycheck.ts` 142, `honoshim.ts` 65, `validate.ts` 61, `typeface.ts` 25 (ambient de declarações), `prismashim.ts` 40, `prismaconfig.ts` 38, portas/configs.

### saddle — virtualization (dono: VM/sandbox/microVM) — 58 arquivos, 60.760 linhas

>500 l (26): `virtual.ts` 7.528 · `edgelandes.ts` 5.899 · `orchestrator.ts` 5.499 · `modalities.ts` 5.025 · `sandbox.ts` 3.285 · `compute.ts` 3.144 · `webserver.ts` 3.087 · `tiers.ts` 2.885 (camadas de memória do VM — **trecho cinzento**, ver §b) · `quantum.ts` 2.393 (simulador quântico clássico — virtualização) · `scheduler.ts` 1.600 · `index.ts` 1.482 · `db.ts` 1.482 (sobre `../vault/onboardingstore.ts` + storage) · `security.ts` 1.449 · `render.ts` 1.325 (stack gráfica **software do VM** — mesa/llvmpipe, spoof de GPU — não é vídeo cadria) · `alternatives.ts` 1.218 · `containerarch.ts` 1.057 · `scripts.ts` 1.052 · `performance.ts` 1.049 · `labels.ts` 844 · `distribution.ts` 744 · `execution.ts` 677 · `auth.ts` 615 · `workloadlaw.ts` 592 (**dono do motor de lane-seating** que os 10 seats da família montam) · `vmcore.ts` 581 · `vaulthandoff.ts` 578 (seam declarado: "saddle owns processing, vault owns storage") · `mesh.ts` 567 (**web-mesh** HMAC nó-a-nó — colisão de *nome* com cadria/mesh.ts, não de lógica).
Restantes: `browser.ts` 482, `communication.ts` 455, `edgeplane.ts` 435, `modalityregistry.ts` 344, `osprofiles.ts` 315, `foundation.ts` 314, `engineplans.ts` 288, `api.ts` 258, `integration.ts` 221, `localauth.ts` 213, `dashboardlib.ts` 199, `modes.ts` 170, `isolation.ts` 84, `seedcatalog.ts` 56, `server.ts` 52, `format.ts` 49, `runall.ts` 46, `paths.ts` 16, `runtimeprobe.ts` 10, `utils.ts` 6, + `virtualhardware.c/.json`, `virtualizationcore.cpp`, `gpumonitor.cpp` (C/C++ da virtualização).

### stealthhead — game (FPS) — 24 arquivos, 4.337 linhas

>500 l: `match.ts` 527. Restantes: `weapons.ts` 470, `ranking.ts` 433, `db.ts` 429 (sobre lane vault), `netcode.ts` 299, `physics.ts` 298, `labels.ts` 286, `spawner.ts` 284, `hud.ts` 258, `onboardingstate.ts` 210, `world.ts` 200 ("renders through the versawase engine imported from @wenathlan/cadria; **stealthhead owns no engine code**"), `cli.ts` 159, `sandboxmodality.ts` 131, portas/configs. **VERDE exemplar** — só lógica de jogo; 3D vem de cadria, áudio de debonair.

### vault — storage (dono: armazenamento) — 39 arquivos, 10.767 linhas

>500 l (4): `account.ts` 2.898 (contas do storage) · `vaultclient.ts` 1.128 · `objects.ts` 761 (engine: pipeline de chunks 256KB, manifests sha-256, quotas) · `imagestore.ts` 502 (depósito de imagens — **camada cinzenta**, ver §b).
Restantes: `uistore.ts` 467 (engine uicopy — **gêmea quase idêntica da devthink/uistore.ts**, ver §c), `drizzle.ts` 366, `querylane.ts` 344, `storage.ts` 315 (**dono de `SqlParam` + `openStorageLane`** — consumido pelos db.ts da família), `objectface.ts` 295, `labels.ts` 287, `db.ts` 257, `onboardingstate.ts` 240, `quota.ts` 206, `pillars.ts` 205, `protocols.ts` 203, `internalroot.ts` 203, `labelstore.ts` 199 (**dono de `createLabelStore`**), `chunks.ts` 193, `decoy.ts` 172, `mimetypes.ts` 161 (**importa `@wenathlan/argan/mimetypes`** — consumidor), `onboardingstore.ts` 158 (**dono de `createOnboardingStore`**), `retention.ts` 122, `buckets.ts` 122, `index.ts` 101, `storageface.ts` 98, `sha.ts` 74, `routes.ts` 25, portas/configs.

---

## (b) Violações de domínio (cruzamento da Lei da Família)

**Resultado geral: nenhuma violação "dura" de engine.** As ondas anteriores de ownership já moveram os motores para os donos (evidência explícita: `devthink/gateway.ts` §8 — "the provider wire trio … moved to the getry owner with the ownership wave"; `getry/server.ts` — "moved verbatim from devthink/server.ts"). Encontram-se **3 casos cinzentos**, listados por severidade:

| # | arquivo | domínio detectado | app dono correto | severidade | detalhe |
|---|---|---|---|---|---|
| 1 | `saddle/tiers.ts` (2.885 l) | storage/bucket/chunk (L3: kvstore `node:sqlite` WAL próprio, npm chunk planner, codec zip, GitHub REST; L4: clientes de buckets r2/storj/turso/hf/kaggle/terabox) | **vault** | média | Motivação é virtualização ("everything is VRAM" — usar tiers gratuitos como RAM do VM), mas mecanicamente reimplementa a família chunk/bucket que `vault/objects.ts`+`vault/chunks.ts` detêm. `saddle/vaulthandoff.ts` já declara a lei ("saddle owns processing, vault owns storage") — porém abre sqlite próprio em vez de chamar a biblioteca vault. |
| 2 | `vault/imagestore.ts` (502 l) | imagem (camada "standardizer": sharp — conversão webp, thumbnails, leitura de DPI/pHYs/JFIF) | **cadria** | baixa | Enquadrado como padronização de depósitos do ledger (validadores mime/density puros + `putObject` no pipeline real). O processamento de imagem *com codecs* é domínio cadria; hoje vault usa `sharp` direto. |
| 3 | `debonair/blobstore.ts` (1.577 l) | storage (backends locais memory + **file lane git-lfs próprio** + gateway fetch, além do vault lane) | **vault** (parcial) | baixa/informativa | O header declara a lei ("the vault law: the storage app owns the engine, the gateway serves it") e o backend vault existe (wave PV6.002, testado em `test/vaultblobstore.test.ts`); os backends locais são seats offline/teste. File lane duplica layout de shard/manifest que vault detém. |

**Falsos positivos de palavra-chave descartados com verificação de conteúdo** (registrados para não virar "problema inventado"):

- `argan/mimetypes.ts` — hits áudio/vídeo são **linhas da tabela MIME** (catálogo IANA), não engine. Dono por lei dedup #10. VERDE.
- `cadria/gateway.ts` / `debonair/gatewayapi.ts` / `devthink/gateway.ts` — "gateway" é o **server/cliente HTTP próprio** de cada app; gateway **IA** só existe em getry (`gateway.ts`, `engine.ts`, `llm.ts`). VERDE.
- `cadria/synth.ts` — síntese de **imagem** a partir de `AudioDescriptor` importado de `@wenathlan/debonair/audio`. VERDE (consome como biblioteca).
- `debonair/render.ts`/`renderengine.ts` — render de **áudio**; `saddle/render.ts` — stack gráfica **software do VM** (mesa/llvmpipe). "render" é polissêmico. VERDE.
- `saddle/mesh.ts` — **web-mesh** de nós (HMAC-SHA256, anti-replay), não malha 3D. Colisão de nome com `cadria/mesh.ts`. VERDE.
- `getry/streaming.ts` — "chunk" = quadros SSE, não storage. VERDE.
- `devthink/sidepanel.ts`/`popup.ts` — hits "render/video" são React/strings de catálogo; **zero** ocorrências de three/webgl/mesh/raster. VERDE.
- `saddle/workloadlaw.ts` ("dnssec-validate") e `cobaia/content.ts` ("dnssec") — nome de *lane* e *string de marketing*. VERDE.

**Conformidades verificadas (VERDE) nos pontos de maior risco:**

- `devthink/os.ts` (`gatewayChat`/`gatewayChatStream`) — cliente HTTP fino (`/v1/chat/completions`), sem credencial/provider; a família "queue" (retry/backoff/SSE) é **engine root do devthink** por manifesto (`package.json` → engines). 12 arquivos do devthink importam `@wenathlan/getry/*`.
- `devthink/sandboxlane.ts` — importa `@wenathlan/saddle/workloadlaw` (lane-seating do dono). `foundry/pipeline.ts` — importa `@wenathlan/saddle/sandbox`.
- `devthink/media.ts` — porta pura para `@wenathlan/cadria/transcode` ("the transcode engine moved to its owner").
- `debonair/llmlane.ts` ↔ `getry/debonairlane.ts` — par cliente/espelho entre debonair e o gateway IA getry.
- `devthink/account.ts` (oauthrow: google/github/gitlab do *site*) ≠ `getry/oauth.ts` (OAuth de *providers* IA/Antigravity) — contratos distintos, não duplicação.
- Todos os `db.ts` da família montam sobre `openStorageLane`/`SqlParam` de `@wenathlan/vault/storage`.

---

## (c) Duplicações entre apps

O catálogo `devthink/logics.ts` (491 entradas de arquivo, ~12.063 símbolos exportados, 20 domínios, 127 arestas de import entre apps) já registra 11 famílias. Estado verificado **na árvore atual**:

**Famílias consolidadas com portas (VERDE — nada a fazer):**

1. `routerbase.ts` — 10 portas de 1 linha → `devthink/routerbase.ts` (51 l). Exemplar.
2. `theme.ts` — 6 portas (argan, cadria, debonair, forge, getry, stealthhead) → `devthink/personalstore.ts`.
3. `reveal.ts` — dono devthink; 5 portas (argan, cadria, debonair, getry, stealthhead).
4. `cleanurl.ts` — dono argan (dentro de `argan/dns.ts`); cadria e debonair são shims de 3 linhas; devthink importa os 3 símbolos-base e mantém 5 exports os-only.
5. `motionpref.ts` — dono debonair (`createMotionPref`); argan é porta (27 l).
6. `labelstore` — engine `vault/labelstore.ts`; os 10 `labels.ts` por-app só carregam manifest de dados sobre a engine (importam `createLabelStore`). Dado por-app é a lei. VERDE.
7. `sandboxmodality` — motor `saddle/workloadlaw.ts` (`laneseating`); seats por-app: **8 arquivos** (argan, cadria, cobaia, debonair, forge, getry, stealthhead, vault) + `devthink/sandboxlane.ts` + seção dentro de `foundry/pipeline.ts` = 10 seats. VERDE. *(Nota de drift: o catálogo diz "nove sandboxmodality.ts"; a contagem real é 8.)*
8. `db.ts` (11 apps) — glue por-app sobre a lane vault; engine única. VERDE por design (família #9).
9. `server.ts` — devthink (1.147 l) × getry (766 l): **não é duplicação** — o transporte do gateway foi movido verbatim para getry e devthink ficou só com `startServer` (loopback); sobreposição de exports = 0.

**Duplicações remanescentes (reais ou quase):**

| família | cópias | dono correto | estado |
|---|---|---|---|
| `onboardingstate.ts` | **11 apps** (2.467 l somadas); `hostallowed` + `mergeStage` duplicados em 6 apps cada (cobaia, debonair, getry, saddle, stealthhead, vault); `readOnboardingState/markIntroSeen/markOnboardingSeen` triplicados (argan, forge, foundry) | vault (`onboardingstore.ts` já é a factory — forge/getry/saddle db.ts já consomem) | **incompleta** (catálogo: "deferred") |
| `family.ts` (FAMILY_SLUGS/FamilyMember/FAMILY_ACCENTS/familyrow) | **9 apps** (568 l) | devthink (`familylanes.ts`+`familyaccent.ts`+`appregistry.ts`) | **bloqueada** por drift real: ordem do rail difere (forge vs argan), accents 8 vs 10 membros, regex `familyurl` `/{1,64}` vs `/+` |
| `uistore.ts` | devthink (805 l) × vault (467 l) — headers quase idênticos, mesma tabela `uicopy`, mesmo endpoint `/api/v1/ui/copy`, mesmo padrão de seed | vault (storage de ui-copy) ou devthink | **não catalogada** — achado novo desta pesquisa |
| `mimetypes` | argan (3.474 l, dono) × vault (`mimetypes.ts` 161 l + corpus `mime.types` ao lado) | argan | quase-fechada: vault já importa `@wenathlan/argan/mimetypes`, mas ainda embarca corpus próprio |
| `three`/`@types/three` em package.json | **11/11 apps** declaram; uso real em 3 (cadria, devthink, vault) | cadria (engine) | declaração fantasma em 8 apps (ver §d) |

**Colisões de nome (não de lógica) — aceitáveis, mas vale registrar:** `mesh.ts` (cadria 3D × saddle web-mesh), `fingerprint.ts` (debonair áudio × getry provider), `auth.ts` (devthink 642 × getry 265 × saddle 615 + `localauth` 213), `oauth` (devthink site × getry provider), `accounts/account` (getry provider × vault storage), `quota.ts` (getry LLM 1.891 × vault storage 206), `render` (debonair áudio × saddle GPU-VM × cadria renderjob), `gateway` (4 apps, servidores próprios).

---

## (d) Estado da biblioteca 3D

- **Onde vive:** `cadria/versawase.ts` (2.974 l) — "the image, video, animation and 3D engine of the family", consolidada de 8 braços (versawase3d, versawaseanimate, versawasecomposition, versawasegen, versawaserender, versawasescheduler, versawaseshaders, versawaseslices) na wave logicfold2. É o **único arquivo raiz da família que importa `three` estaticamente** (`import * as THREE from "three"`, linha 236).
- **Como é publicada:** pacote `@wenathlan/cadria` com múltiplos subpath-exports (`./versawase`, `./versawase3d`, `./versawaseanimate`, `./versawaserender`, `./versawasescheduler`, `./versawaseslices`…) todos apontando para `versawase.ts`. O manifesto engines do devthink chama a engine de "**versawaze**" (`library: "@wenathlan/versawaze"`, owner cadria) e a de áudio de "**kathesis**" (`@wenathlan/kathesis`, owner debonair) — são *nomes de engine/papel* do manifesto, **não pacotes instalados** (não resolvem em node_modules; os specifiers reais são `@wenathlan/cadria` e `@wenathlan/debonair`).
- **Quem importa:** `stealthhead` — `world.ts` renderiza via `@wenathlan/cadria` ("stealthhead owns no engine code"; dependência `~2.0.167`); `devthink` — `media.ts` re-exporta `@wenathlan/cadria/transcode` (porta). `cadria/synth.ts`/`studio.ts` importam o contrato de áudio de `@wenathlan/debonair/audio` para o pipeline áudio→imagem.
- **`three` ^0.187.0:** declarado em **todos os 11 package.json** (junto com `@types/three`), porém importado de fato apenas em: `cadria/versawase.ts` (estático), `devthink/sol/wingets/IntroShaderhero.tsx` (dinâmico `import("three")`), `vault/sol/wingets/HomeHalo.tsx` (dinâmico) e testes (`cadria/test/versawase3d.test.ts`, `versawaserender.test.ts`, `devthink/test/entryface.test.ts`, `vault/test/vaultface.test.ts`). Em código de **raiz**, só cadria usa.
- **Oportunidade:** remover a declaração de `three`/`@types/three` de 8 apps (argan, cobaia, debonair, forge, foundry, getry, saddle, stealthhead) e, no limite, trocar os imports dinâmicos dos wingets (devthink/vault) por uma face da engine cadria — consolidando TODO uso 3D no dono.

---

## (e) Oportunidades de consolidação — ranqueadas do mais simples ao mais complexo

Consolidadores que **já existem** por app (as "palavras-chave abrangentes"): devthink (`storage.ts`, `gateway.ts`, `account.ts`, `data.ts`, `sandboxlane.ts`, `os.ts`, `logics.ts`, `auth.ts`, `mcp.ts`+`mcpregistry.ts`, `appregistry.ts`), argan (`dns.ts`, `mimetypes.ts`), cadria (`versawase.ts`, `synth.ts`, `studio.ts`, `image.ts`, `video.ts`, `mesh.ts`, `transcode.ts`), cobaia (`monetization.ts`, `content.ts`), debonair (`audio.ts`, `kathesis.ts`, `ingest.ts`, `pattern.ts`, `recon.ts`, `gatewayapi.ts`, `composer.ts`), forge (`queue.ts`, `fleet.ts`, `runstream.ts`), foundry (`pipeline.ts`, `readiness.ts`), getry (`llm.ts`, `providers.ts`, `models.ts`, `request.ts`, `streaming.ts`, `gateway.ts`, `engine.ts`, `server.ts`), saddle (`virtual.ts`, `orchestrator.ts`, `modalities.ts`, `sandbox.ts`, `compute.ts`, `webserver.ts`, `tiers.ts`), vault (`objects.ts`, `storage.ts`, `account.ts`, `vaultclient.ts`, `labelstore.ts`, `onboardingstore.ts`, `uistore.ts`). stealthhead não precisa de consolidador (só lógica de jogo).

Ranking (simples → complexo), com contagens concretas:

1. **Remover `three`+`@types/three` de 8 package.json** (argan, cobaia, debonair, forge, foundry, getry, saddle, stealthhead). 8 edições de manifest, zero código, zero risco de runtime (nenhum import nesses apps). *Simplicidade máxima.*
2. **Porta `uistore`** — unificar `devthink/uistore.ts` (805 l) e `vault/uistore.ts` (467 l) num dono (recomenda-se vault: é a engine de ui-copy persistida) com porta de 3–4 linhas no outro. ~1.272 l → ~750 l. Achado novo, fora do catálogo.
3. **Fechar `mimetypes`** — vault já importa `@wenathlan/argan/mimetypes`; falta desfazer do corpus duplicado ao lado (`vault/mimetypes.ts` 161 l + `mime.types` com 6.625 entradas). 1 app, 2 arquivos.
4. **Completar `onboardingstate`** (era "deferred") — extrair `hostallowed`+`mergeStage` (duplicados em 6 apps) para o dono (vault/onboardingstore ou devthink) e reduzir os 11 arquivos (2.467 l) a glue mínimo por-app. 11 arquivos, mecânico, baterias `onboardingstate.test.ts` já existem por app.
5. **Desbloquear `family.ts`** — resolver o drift (ordem do rail, accents 8 vs 10, regex familyurl) fundindo os 9 arquivos (568 l) em `devthink/familylanes.ts` + portas. Exige decisão de produto sobre a ordem canônica do rail (é o motivo do bloqueio).
6. **cadria — família encoders/cor/motion:** 10 arquivos pequenos ~2.935 l → 3 arquivos-chave: `pngencoder` 361 + `gifencoder` 389 + `webmencoder` 487 (encoders, 1.237 l); `colorconvert` 277 + `blendmodes` 259 + `pixel` 252 + `masks` 298 (cor, 1.086 l); `easecurves` 258 + `timeticks` 275 + `designmotion` 79 (motion, 612 l). Opcionalmente dobrar em `versawase.ts` (padrão "one keyed file per family" já usado pelo app).
7. **debonair — família teoria musical:** `musictheory` 382 + `genre` 455 + `genrematrix` 308 + `tuning` 20 + `patternenums` 14 + `harmonyengine` 248 + `rhythmgrammar` 285 + `beatgrid` 341 = 8 arquivos, 2.053 l → 1 arquivo-chave (`theory.ts`) ou assento no `kathesis.ts` (que já é o "engine seat/dsp core").
8. **debonair — folhas DSP:** `spectrum` 156 + `formant` 468 + `hpss` 269 + `timestretch` 267 + `limiter` 287 + `loudness` 295 + `ducking` 322 + `stems` 228 + `demix` 297 + `vocalsynth` 301 = 10 arquivos, 2.890 l → dobrar no `kathesis.ts` (mantendo `wavwriter`+`midiwriter` como família writers, 811 l). Baterias por folha já existem em `test/`.
9. **saddle — famílias pequenas:** `auth.ts` 615 + `localauth.ts` 213 (828 l → 1); `modalityregistry.ts` 344 + `modes.ts` 170 → dobrar em `modalities.ts`; `paths` 16 + `runtimeprobe` 10 + `utils` 6 + `format` 49 + `runall` 46 (127 l em 5 nano-arquivos → 1); `api.ts` 258 + `integration.ts` 221 + `foundation.ts` 314 → 1 seam.
10. **getry — shims:** `nodeshim` 265 + `prismashim` 40 + `prismaconfig` 38 = 343 l em 3 → 1 `shims.ts`. (getry já está bem organizado; baixa prioridade.)
11. **saddle/tiers L3/L4 → vault** — extrair kvstore/chunk-farm/clientes-de-bucket para `@wenathlan/vault` (dono storage), mantendo em saddle só a política de tiering; aproveitar para rotear `vaulthandoff.ts` pela biblioteca em vez de sqlite local. Toca 2 apps + testes (`tiers`, `virtualmemory`, `vaulthandoff`). *Caso cinzento §b-1.*
12. **vault/imagestore — camada sharp → cadria (ou exceção documentada)** — mover conversão webp/thumbnails para a engine de imagem do dono, deixando em vault só validadores + `putObject`; alternativa: registrar exceção da lei no docs do vault. *Caso cinzento §b-2.*
13. **debonair/blobstore — reduzir a 2 backends** (memory de teste + vault) quando o deploy permitir, eliminando o file lane git-lfs local. *Caso cinzento §b-3.*
14. **devthink — reagrupamento interno** (o mais extenso): 153 arquivos raiz (71 >500 l; 173.520 l). Famílias já visíveis: gates/smoke (`soak` 1.092, `pentest` 966, `perf` 957, `sweep` 730, `evidence` 643, `matrixverify` 482, `poolaudit` 439, `chromiumsmoke` 378, `doccheck` 410, `maintain` 308, `gates` 307, `hardening` 191, `consumersmoke` 185, `docsaudit` 140, `schemaaudit` 111, `nativesmoke` 128 ≈ **7.467 l em 16 arquivos** → 1 `gates.ts`); terminais (`shellterminal` 92 + `kbdterminal` 35 + `chipterminal` 35 → 1); runtimes (`deno` 27 + `node` 26 + `bun` 26 + `cjs` 9 + `umd` 9 + `cjswrap` 17 + `umdwrap` 16 + `babelcoreface` 32 + `distseamtypes` 11 = 173 l em 9 → 1). Segue o padrão "one keyed file per family" que o próprio devthink já aplicou em `storage.ts`/`gateway.ts`/`account.ts`.

**Notas de infra (não são violações):**
- Estilo de import misto: specifiers publicados (`@wenathlan/vault/storage`) convivem com caminhos relativos (`../vault/onboardingstore.ts` em saddle, `../saddle/workloadlaw.ts` nos seats, `../devthink/personalstore.ts` nas portas de theme). Ambos consomem como biblioteca dentro do repo; o specifier é a face publicada.
- Drift de instalação: `devthink/package.json` declara `@wenathlan/cobaia`, mas nenhum `node_modules` tem o link cobaia (devthink tem 7 links: argan, cadria, debonair, devthink, getry, saddle, vault).
- Drift de contagem no catálogo: `logics.ts` diz "nove app sandboxmodality.ts seats" (real: 8 arquivos + sandboxlane + seção foundry) e lista onboarding em 10 apps (real: 11, incluindo cobaia).

---

## Síntese

A Lei da Família está **largamente cumprida**: engines nos donos, portas de 1–3 linhas nos consumidores, consumo via `package.json` (`@wenathlan/*`), e um catálogo vivo (`devthink/logics.ts`) que registra as 11 famílias de dedup com vereditos. Os 3 pontos cinzentos (saddle/tiers, vault/imagestore, debonair/blobstore-file-lane) são heranças justificadas por design, não cópias clandestinas. As duplicações remanescentes com trabalho real são 4 (`onboardingstate`, `family.ts`, `uistore` devthink×vault, corpus mime do vault) e a declaracao fantasma de `three` em 8 manifests. As maiores alavancas de consolidação por domínio estão nos **aglomerados de folhas pequenas** de cadria (10 arquivos/2.935 l), debonair (18 arquivos/4.943 l), saddle (famílias pequenas) e devthink (gates/smoke: 16 arquivos/7.467 l).
