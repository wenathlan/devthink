# infra.md — the DevThink family logic book (the root law keeps the root clean, the book rides the docs seat)

> O arquivo único na raiz para reagrupar e reajustar de zero a 3000 ou até 4000 lógicas correlatas da família, regras em PT-BR, texto minimalista, título e descrição no máximo.

## A LEI DA FAMÍLIA

- Cada app é dono exclusivo da sua engine, os demais consomem como biblioteca.
- DevThink = sistema operacional envelope monorepo, consome as demais como biblioteca.
- Argan = rede / gateway DNS.
- Cadria = engine VersaWaze de vídeo / 3D / shaders / IA visual.
- Cobaia = superfície pública de monetização.
- Debonair = engine Kathesis de áudio / música / DAW / IA sonora.
- Forge = runner de binários em sandbox com Saddle.
- Foundry = pipeline completo sandbox + banco de rede.
- Getry = gateway universal de IA, 5 provedores / 35 rotas / raciocínio 7 níveis / rotação de chaves.
- Saddle = engine mestre de virtualização, runner VM 90 modalidades / microVM / sandbox / hardware virtual, nunca toca GPU / CPU / navegador da pessoa.
- Stealthhead = plataforma de jogo FPS, em construção.
- Vault = armazenamento puro / banco de rede / edge storage, Better SQLite / better-sqlite3, concorrente de Supabase / S3.
- Se a lógica já existe em um app o outro IMPORTA via dependência, por exemplo, Debonair precisa de engine 3D, importa a biblioteca do Cadria, e vice-versa.
- Duplicar lógica entre apps é estritamente proibido.

## O REGISTRO DE LÓGICAS

> Cada app lista suas lógicas TS reais da raiz, agrupadas por palavra-chave, barra / = mesmo contexto.

### argan — 21 lógicas na raiz

- `argan.ts` = núcleo do app de rede.
- `dnssec.ts` / `protocols.ts` / `zonediff.ts` = engine de rede, assinatura DNSSEC, protocolos, diff de zona DNS.
- `mimetypes.ts` = tabela de Mimetypes da camada de rede.
- `family.ts` / `familyurl.ts` / `catalog.ts` / `labels.ts` / `cleanurl.ts` / `reveal.ts` / `theme.ts` / `motionpref.ts` / `onboardingstate.ts` / `sandboxmodality.ts` = ponte da família, URLs, catálogo, labels, tema, reveal, onboarding, modalidade de sandbox.
- `db.ts` / `seed.ts` / `drizzle.config.ts` = banco Better SQLite / better-sqlite3, seed, Drizzle.
- `capacitor.config.ts` / `vite.config.ts` / `vitest.config.ts` = build Capacitor / Vite / Vitest.

### cadria — 56 lógicas na raiz

- `versawase.ts` / `versawase3d.ts` / `versawaseanimate.ts` / `versawasecomposition.ts` / `versawasegen.ts` / `versawaserender.ts` / `versawasescheduler.ts` / `versawaseshaders.ts` / `versawaseslices.ts` = engine VersaWaze, núcleo, cena 3D, animação, composição, geração, render, scheduler, shaders, slices.
- `blendmodes.ts` / `colorconvert.ts` / `compositorraster.ts` / `masks.ts` / `pixel.ts` / `imageexport.ts` / `imageproject.ts` / `imagerender.ts` / `imagestyles.ts` = imagem, blend, conversão de cor, raster, máscaras, pixel, export, projeto, render, estilos.
- `gifencoder.ts` / `pngencoder.ts` / `webmencoder.ts` / `videoencoder.ts` / `videodecode.ts` / `transcodeengine.ts` / `transcodeplan.ts` / `mediaprobe.ts` = codecs e transcode, GIF, PNG, WebM, encode / decode de vídeo, engine, plano, probe de mídia.
- `timelineedit.ts` / `timelineview.ts` / `timeticks.ts` / `studiogenerate.ts` / `studiosource.ts` / `synth.ts` = estúdio, timeline de edição / visual / ticks, geração, fonte, síntese.
- `shadercomp.ts` / `easecurves.ts` / `designmotion.ts` = compilação de shaders, curvas de easing, motion design.
- `generation.ts` / `visualize.ts` = geração de IA visual / visualização.
- `gateway.ts` = gateway de chamadas da engine.
- `winsnap.ts` = encaixe de janela.
- `introfixtures.ts` = fixtures de introdução.
- `version.ts` = versão da engine.
- `family.ts` / `familyurl.ts` / `catalog.ts` / `labels.ts` / `cleanurl.ts` / `reveal.ts` / `theme.ts` / `onboardingstate.ts` / `sandboxmodality.ts` = ponte da família, URLs, catálogo, labels, tema, reveal, onboarding, modalidade de sandbox.
- `db.ts` / `seed.ts` / `drizzle.config.ts` = banco Better SQLite / better-sqlite3, seed, Drizzle.
- `capacitor.config.ts` / `vite.config.ts` / `vitest.config.ts` = build Capacitor / Vite / Vitest.

### cobaia — 12 lógicas na raiz

- `adsconfig.ts` / `checkoutlinks.ts` / `posts.ts` / `content.ts` / `roster.ts` = monetização, ads, checkout, posts, conteúdo, roster.
- `familyurl.ts` / `labels.ts` / `sandboxmodality.ts` = ponte da família, labels, modalidade de sandbox.
- `db.ts` = banco Better SQLite / better-sqlite3.
- `capacitor.config.ts` / `vite.config.ts` / `vitest.config.ts` = build Capacitor / Vite / Vitest.

### debonair — 69 lógicas na raiz

- `katexis.ts` = núcleo da engine Kathesis.
- `audio.ts` / `analyze.ts` / `spectrum.ts` / `loudness.ts` / `limiter.ts` / `ducking.ts` / `hpss.ts` / `formant.ts` / `stems.ts` / `demix.ts` / `timestretch.ts` / `speechalign.ts` / `tuning.ts` = DSP de áudio, análise, espectro, loudness, limiter, ducking, HPSS, formantes, stems, demix, timestretch, alinhamento de fala, afinação.
- `composer.ts` / `arrangement.ts` / `arranger.ts` / `harmonyengine.ts` / `musictheory.ts` / `rhythmgrammar.ts` / `patternenums.ts` / `patternminer.ts` / `genrematrix.ts` / `genrecorpus.ts` / `remixplan.ts` / `mcplane.ts` = composição, arranjo, harmonia, teoria musical, gramática rítmica, padrões, matriz / corpus de gêneros, plano de remix, plano MC.
- `pianoroll.ts` / `dawview.ts` / `mixergraph.ts` / `playerbus.ts` / `beatgrid.ts` / `take.ts` / `stages.ts` / `timelinemodel.ts` = DAW, piano roll, mixer, player, grade de batidas, takes, stages, modelo de timeline.
- `renderjobs.ts` / `renderworker.ts` / `midiwriter.ts` / `wavwriter.ts` / `vocalsynth.ts` / `blobstore.ts` / `bigintids.ts` = render / worker, escrita MIDI / WAV, síntese vocal, blob store, IDs BigInt.
- `ingest.ts` / `reverseingest.ts` / `reconpayload.ts` / `reconworker.ts` / `fingerprint.ts` / `ialane.ts` / `llmlane.ts` / `generateclient.ts` / `gatewayapi.ts` / `cloudsync.ts` / `routetable.ts` = ingestão / ingestão reversa, reconstrução, fingerprint, pistas de IA / LLM, cliente de geração, gateway, sync em nuvem, tabela de rotas.
- `coverpalette.ts` = paleta de capa.
- `family.ts` / `familyurl.ts` / `catalog.ts` / `labels.ts` / `cleanurl.ts` / `reveal.ts` / `theme.ts` / `motionpref.ts` / `onboardingstate.ts` / `sandboxmodality.ts` = ponte da família, URLs, catálogo, labels, tema, reveal, onboarding, modalidade de sandbox.
- `db.ts` / `seed.ts` / `drizzle.config.ts` = banco Better SQLite / better-sqlite3, seed, Drizzle.
- `capacitor.config.ts` / `vite.config.ts` / `vitest.config.ts` = build Capacitor / Vite / Vitest.

### devthink — 175 lógicas na raiz

- `devthink.ts` / `core.ts` / `index.ts` / `config.ts` / `constants.ts` / `types.ts` / `data.ts` / `modes.ts` / `views.ts` / `page.ts` / `window.ts` / `workspace.ts` / `flow.ts` / `run.ts` / `runner.ts` / `runtime.ts` / `node.ts` / `neutral.ts` = núcleo do sistema operacional, config, tipos, dados, modos, views, página, janela, workspace, execução, runtime.
- `osapps.ts` / `osevents.ts` / `oslabels.ts` / `osreveal.ts` / `ostypes.ts` / `appregistry.ts` / `recentapps.ts` / `dashboardpage.ts` / `dashdone.ts` / `panelsync.ts` / `paneltypes.ts` / `pagebridge.ts` / `sidepanel.ts` / `popup.ts` / `offscreen.ts` / `optionspage.ts` / `transparencypage.ts` / `desktopstate.ts` / `alttab.ts` / `dockmagnify.ts` / `fileexplorer.ts` = apps do OS, eventos, labels, registry de apps, painéis, popup, offscreen, desktop, alttab, dock, explorador.
- `auth.ts` / `authschemaaudit.ts` / `account.ts` / `admins.ts` / `session.ts` / `agentcert.ts` / `costcert.ts` = auth, auditoria de schema, conta, admins, sessão, certificados de agente / custo.
- `agent.ts` / `automation.ts` / `background.ts` / `companion.ts` / `mcp.ts` / `mcpregistry.ts` / `memory.ts` / `plan.ts` / `planstate.ts` / `recipes.ts` / `swarm.ts` / `thinkingtypes.ts` / `tools.ts` = agente, automação, background, companion, MCP, memória, planos, recipes, swarm, ferramentas.
- `graphnodes.ts` / `graphrunner.ts` / `graphviewstate.ts` = grafos, nós, runner, estado de visualização.
- `cli.ts` / `chipterminal.ts` / `kbdterminal.ts` / `shellterminal.ts` / `commands.ts` / `commandcatalog.ts` / `consoleboot.ts` / `capture.ts` = CLI, terminais, comandos, catálogo de comandos, boot de console, captura.
- `chatlabels.ts` / `chatstate.ts` = labels e estado do chat.
- `browserextension.ts` / `packageextension.ts` / `crxharvest.ts` / `crossbrowser.ts` / `chromiumsmoke.ts` / `consumersmoke.ts` / `nativesmoke.ts` / `headless.ts` / `fakehost.ts` / `devtoolsguard.ts` = extensão de browser, empacotamento, CRX, crossbrowser, smoke tests, headless, guarda de devtools.
- `gateway.ts` / `osgateway.ts` / `net.ts` / `http.ts` / `protocol.ts` / `bridge.ts` = gateways do OS, rede, HTTP, protocolo, bridge.
- `honoface.ts` / `honocorsface.ts` / `hononodeserverface.ts` / `honoservestaticface.ts` / `akash.ts` / `serve.ts` / `server.ts` = faces Hono, CORS, node server, estático, Akash, serve / server.
- `build.ts` / `pack.ts` / `export.ts` / `umd.ts` / `umdwrap.ts` / `cjs.ts` / `cjswrap.ts` / `deno.ts` / `bun.ts` / `distseamtypes.ts` / `inspectstoreartifacts.ts` / `release.ts` / `maintain.ts` / `scripts.ts` / `pythonscripts.ts` / `dependencyupdates.ts` / `workflow.ts` / `environments.ts` / `capacitor.config.ts` / `vite.config.ts` / `vitest.config.ts` = build, pack, export, formatos UMD / CJS / Deno / Bun, dist, release, manutenção, scripts, dependências, workflows, ambientes.
- `security.ts` / `checksecrets.ts` / `cspaudit.ts` / `pentest.ts` / `guard.ts` / `gates.ts` / `hardening.ts` / `jsongate.ts` / `npmgate.ts` / `yamlaudit.ts` / `docsaudit.ts` / `poolaudit.ts` / `auditreferenceworkflows.ts` / `evidence.ts` / `permdiff.ts` / `policy.ts` / `apifreeze.ts` = segurança, secrets, CSP, pentest, guardas, gates, hardening, auditorias, evidência, diff de permissões, política, freeze de API.
- `matrixverify.ts` / `readiness.ts` / `soak.ts` / `perf.ts` / `sweep.ts` / `telemetryfree.ts` / `wcag.ts` / `doccheck.ts` / `bundlescan.ts` = verificação de matriz, readiness, soak, perf, sweep, telemetria zero, WCAG, checagem de docs, scan de bundle.
- `sandboxlane.ts` / `sandboxmodality.ts` / `modalitytypes.ts` / `engines.ts` / `engineowners.ts` / `saddlefaces.ts` / `familyaccent.ts` / `familylanes.ts` / `catalog.ts` / `cleanurl.ts` / `labels.ts` / `copy.ts` / `icons.ts` / `density.ts` / `progress.ts` / `introtarget.ts` / `onboardingstate.ts` = sandbox, modalidades, engines, donos de engine, faces do Saddle, pontes da família, catálogo, labels, copy, ícones, densidade, progresso, onboarding.
- `storage.ts` / `personalstore.ts` / `uistore.ts` / `usestoredstate.ts` / `useismobile.ts` / `records.ts` / `seedcatalog.ts` / `prismaconfig.ts` / `media.ts` / `imagedigests.ts` / `saascontent.ts` / `version.ts` = armazenamento, stores, hooks, records, seed, Prisma, mídia, digests, conteúdo SaaS, versão.
- `calculator.ts` / `debug.ts` / `examplelocaljob.ts` / `queue.ts` = calculadora, debug, exemplo de job, fila.

### forge — 19 lógicas na raiz

- `runner.ts` / `runstream.ts` / `queue.ts` / `fleet.ts` = runner de binários, stream de execução, fila, frota.
- `api.ts` / `graphplan.ts` / `hometypes.ts` = API, plano de grafo, tipos da home.
- `db.ts` / `utils.ts` / `drizzle.config.ts` = banco Better SQLite / better-sqlite3, utilidades, Drizzle.
- `family.ts` / `familyurl.ts` / `labels.ts` / `onboardingstate.ts` / `sandboxmodality.ts` / `theme.ts` = ponte da família, labels, onboarding, modalidade de sandbox, tema.
- `capacitor.config.ts` / `vite.config.ts` / `vitest.config.ts` = build Capacitor / Vite / Vitest.

### foundry — 18 lógicas na raiz

- `runner.ts` / `artifact.ts` / `sandbox.ts` = pipeline, runner, artefatos, sandbox.
- `api.ts` / `graphplan.ts` / `hometypes.ts` / `imagestore.ts` = API, plano de grafo, tipos da home, store de imagens.
- `db.ts` / `utils.ts` / `drizzle.config.ts` = banco Better SQLite / better-sqlite3, utilidades, Drizzle.
- `family.ts` / `familyurl.ts` / `labels.ts` / `onboardingstate.ts` / `sandboxmodality.ts` = ponte da família, labels, onboarding, modalidade de sandbox.
- `capacitor.config.ts` / `vite.config.ts` / `vitest.config.ts` = build Capacitor / Vite / Vitest.

### getry — 53 lógicas na raiz

- `gateway.ts` (config + view config folded) / `gatewayprobe.ts` / `gatewaysmoke.ts` / `server.ts` / `request.ts` / `routerotation.ts` = gateway universal, config, probe, smoke, view config, server, request, rotação de rotas.
- `providers.ts` / `providercli.ts` / `registernvidiakeys.ts` / `llm.ts` / `models.ts` / `intelligence.ts` / `thinking.ts` / `thinkingtypes.ts` / `antigravity.ts` / `search.ts` / `streaming.ts` / `streamfallback.ts` / `json.ts` / `jsonpolicy.ts` / `jsonschema.ts` = provedores, CLI de provedor, chaves NVIDIA, LLM, modelos, inteligência, raciocínio 7 níveis, streaming, fallback, JSON policy / schema.
- `auth.ts` / `oauth.ts` / `accounts.ts` / `sessions.ts` / `quota.ts` / `recovery.ts` / `fingerprint.ts` = auth, OAuth, contas, sessões, quota, recuperação, fingerprint.
- `engine.ts` / `cli.ts` / `debonairlane.ts` / `project.ts` = engine, CLI, pista Debonair, projeto.
- `nodeshim.ts` / `prismashim.ts` = shims Node / Prisma.
- `db.ts` / `prismaconfig.ts` = banco Better SQLite / better-sqlite3, Prisma.
- `types.ts` / `typeface.ts` / `constants.ts` / `utils.ts` / `versionregistry.ts` = tipos, typeface, constantes, utilidades, registro de versões.
- `family.ts` / `familyurl.ts` / `labels.ts` / `reveal.ts` / `theme.ts` / `onboardingstate.ts` / `sandboxmodality.ts` = ponte da família, labels, reveal, tema, onboarding, modalidade de sandbox.
- `capacitor.config.ts` / `vite.config.ts` / `vitest.config.ts` = build Capacitor / Vite / Vitest.

### saddle — 59 lógicas na raiz

- `sandbox.ts` / `sandboxenvprofile.ts` / `sandboxprofile.ts` / `sandboxqueue.ts` / `sandboxquota.ts` / `modalityregistry.ts` / `modes.ts` / `virtual.ts` / `isolation.ts` / `execution.ts` / `compute.ts` = sandbox, perfis, fila, quota, registro de modalidades, modos, virtualização, isolamento, execução, compute.
- `orchestrator.ts` / `scheduler.ts` / `foundation.ts` / `alternatives.ts` / `quantum.ts` / `mesh.ts` / `edgelandes.ts` / `edgeplane.ts` = orquestrador, scheduler, fundação, alternativas, quantum, mesh, edge.
- `scriptsbuildengine.ts` / `scriptlanes.ts` / `scriptssecuritygate.ts` / `scriptsvalidateflatnative.ts` / `speccatalog.ts` / `seedcatalog.ts` = engine de build de scripts, pistas, gate de segurança, validação nativa, catálogos spec / seed.
- `api.ts` / `server.ts` / `webserver.ts` / `distribution.ts` / `integration.ts` / `runall.ts` = API, servers, distribuição, integração, execução total.
- `auth.ts` / `localauth.ts` / `security.ts` = auth local e segurança.
- `performance.ts` / `runtimeprobe.ts` / `containerarch.ts` / `workloadlaw.ts` / `tiers.ts` = performance, probe de runtime, arquitetura de container, lei de workload, tiers.
- `format.ts` / `paths.ts` / `render.ts` / `browser.ts` / `communication.ts` / `dashboardlib.ts` = formato, caminhos, render, browser, comunicação, lib de dashboard.
- `cli.ts` = CLI do Saddle.
- `vaulthandoff.ts` = handoff para o Vault.
- `db.ts` / `drizzle.config.ts` = banco Better SQLite / better-sqlite3, Drizzle.
- `catalog.ts` / `family.ts` / `familyurl.ts` / `labels.ts` / `onboardingstate.ts` / `index.ts` = catálogo, ponte da família, entrada do app.
- `utils.ts` = utilidades.
- `capacitor.config.ts` / `vite.config.ts` / `vitest.config.ts` = build Capacitor / Vite / Vitest.

### stealthhead — 21 lógicas na raiz

- `match.ts` / `matchrules.ts` / `netcode.ts` / `physics.ts` / `ranking.ts` / `spawner.ts` / `weapons.ts` / `world.ts` / `hud.ts` = partida, regras, netcode, física, ranking, spawner, armas, mundo, HUD.
- `family.ts` / `familyurl.ts` / `labels.ts` / `reveal.ts` / `theme.ts` / `onboardingstate.ts` / `sandboxmodality.ts` = ponte da família, labels, reveal, tema, onboarding, modalidade de sandbox.
- `db.ts` / `drizzle.config.ts` = banco Better SQLite / better-sqlite3, Drizzle.
- `capacitor.config.ts` / `vite.config.ts` / `vitest.config.ts` = build Capacitor / Vite / Vitest.

### vault — 35 lógicas na raiz

- `buckets.ts` / `objects.ts` / `objectsledger.ts` / `chunks.ts` / `storage.ts` / `storagelane.ts` / `sha.ts` / `retention.ts` / `decoy.ts` = buckets, objetos, ledger, chunks, storage, pista de storage, SHA, retenção, decoy.
- `api.ts` / `routes.ts` / `internalroot.ts` / `protocols.ts` / `mimetypes.ts` / `querylane.ts` / `quota.ts` = API, rotas, raiz interna, protocolos HTTPS, Mimetypes, pista de query, quota.
- `accounts.ts` / `signup.ts` = contas e cadastro.
- `vaultclient.ts` / `uistore.ts` / `labelstore.ts` = cliente do Vault, stores de UI / labels.
- `drizzle.ts` / `db.ts` / `drizzle.config.ts` = Drizzle, banco Better SQLite / better-sqlite3.
- `family.ts` / `familyurl.ts` / `hometypes.ts` / `labels.ts` / `index.ts` / `onboardingstate.ts` / `sandboxmodality.ts` = ponte da família, tipos da home, entrada do app.
- `utils.ts` = utilidades.
- `capacitor.config.ts` / `vite.config.ts` / `vitest.config.ts` = build Capacitor / Vite / Vitest.

## AS REGRAS PR0 A PR22

> Gerado via subagentes por categoria + parsing integral de /mnt/data/esdSde.txt (704.246 chars). 364 linhas únicas após deduplicação. Mesclagem de duplicatas preservando variações complementares. Correção ortográfica contextual: Better SQLite / better-sqlite3, wingets com G, Mimetypes, Bun, PS, etc.
> Mescladas as linhas únicas dos checklists V38 a V43, duplicatas idênticas descartadas, zero perda.

### REGRA GLOBAL DE VALIDAÇÃO DE NOMES NO CONTEXTO

- Não há limite de subagentes / ondas. Execute em onda única com mais de 100 ondas possíveis, cada estação com 100 ondas, 5 / 6 / 7 subagentes simultâneos por categoria, até 300 / 600 / 900 subagentes.
- Cada subagente inicia obrigatoriamente com análise integral do código / arquivos da fase e depois modifica.
- Correção contextual: se aparecer palavra / termo desconhecido ou errado, corrija baseado no contexto da conversa / ortografia gramatical portuguesa correta / contexto das palavras corretas do tema.
- Armazenamento = Better SQLite / better-sqlite3, não Better scale light / Better escape light / Better Ligate / Beta satellite / BetaSQL Lite 3.
- Componente = wingets com G, não windjets com J / windgets / wing jets / Indigets.
- Mimetypes = corrija bimotypes / mimo-types / mimetipes para Mimetypes.
- Bun, não boom. PS, não IPS. Valide nomes dentro do contexto que está sendo falado: armazenamento / Better SQLite / better-sqlite3, Componentes / wingets com G.
- Arquivos com dots nunca hifens, pastas sem hífen / underscore / dots / espaços / underlines / emojis / ANSI art / vibe code. Renomeação sem dots vale para código / arquivos / pastas.
- Sem nome composto redundante pois contexto já embutido, ex: auth.
- Use vírgula apenas para separar contextos diferentes e barra / para mesmo contexto. Nunca escreva por cento extenso use %, barra use /, igual use =, versus por extenso use barra. Use por exemplo, X / Y. Texto minimalista título e descrição no máximo. Frase coerente início e fim com gramática correta PT-BR.
- PR por categoria com nome da onda e mescle tudo na main com squash, mantendo apenas main. Mantenha workflows / PRs / testes verdes.
- Verifique via browser agent em https://wenathlan.github.io/devthink/, pois sandbox parece normal mas não está.
- Quando ler por exemplo não significa fazer igual, por exemplo é apenas ilustração não obrigação.
- Não existe limite de ferramenta / biblioteca / framework / linguagem / técnica / maneira / game / componente / lógica / rota / arquivo / winget / engine em nenhum aplicativo, somos multi-catálogo.
- O que existe = organização / agrupamento / otimização / simplicidade para maior manutenibilidade.
- Pode usar qualquer linguagem / ferramenta / framework / biblioteca em qualquer aplicativo, por exemplo, Python / Rust / Go / Ruby / V / outras eficientes, desde que sirva ao propósito / objetivo / meta / features do aplicativo, mas dê sempre prioridade ao TypeScript.
- Quando usar outra linguagem mantenha mesmo padrão do TypeScript, JSDoc bem comentado / agrupado / organizado / sincronizado / hierárquico / linear.
- Armazenamento principal = Better SQLite / better-sqlite3 com LibGit2 / MySQL2 / Prisma schema / Drizzle ORM / Git LFS / blobs conforme contexto.
- Cada PR com mais de 100 ações / alterações.
- Use caracteres especiais, por exemplo, = / / / %, nunca escreva por extenso, por exemplo, use = e não igual, use / e não versus, use % e não por cento.
- Self-hosted sem serviços pagos / free tiers.

### PR0 LIMPEZA

- Sincronize head remoto para local em /home/z/my-project, um por um, de forma hierárquica / linear.
- Apague tudo antes de Z / depois de Z em /home/z/my-project, por exemplo, venv / python / caches / .next / db em src. Mantenha limite de 10GB.
- Operação restrita ao repositório https://github.com/wenathlan/devthink clonado em /home/z/my-project.
- Remova polarlaunch.cjs.
- Clone Alan sem blobs em https://github.com/iakadion/allan/tree/main/organizado com 4GB, pois completo possui 6GB+, remova blobs.
- Finalize Alan com commit / pull e apague pasta, só depois trabalhe no devthink.
- Gitignore correto, não adicione dockerignore / outro arquivo na raiz.

### PR1 BASE 12 PASTAS

- Primeira camada oficial é .github / argan / cadria / cobaia / debonair / devthink / forge / foundry / getry / saddle / stealthhead / vault / .gitignore / package.json.
- Contagem é .github mais 11 aplicativos mais 2 arquivos. Total 12 pastas contando .github mais 11 apps mais 2 arquivos do lado de fora.
- Apenas .gitignore / package.json na raiz.

### PR2 TEMPLATE SOL / TESTS / DOCS

- Dentro de cada aplicativo apenas sol / tests / docs. Sol é nome do primeiro tema, tests termo em inglês, docs documentação.
- Nenhuma outra pasta, por exemplo, scripts / artifacts / src / terminal, é proibida e se existir remova.
- Pasta igual aplicativo igual página com apenas anchor, todos componentes em wingets. Wingets com G já está correto, é componente, consome DB via Better SQLite / API interna, sem dado fixo.
- Pasta igual subaplicativo igual nome da página, cada pasta dentro de sol representa subaplicativo.
- Todo aplicativo não oficial definido como em construção / jogo em construção.
- Trave template de cada app em apenas sol vs tests vs docs, todo código vs comentários JSDoc vs UI vs nomes de arquivos vs pastas integralmente em inglês.
- Abandone textos atuais dos 10 aplicativos oficiais e DevThink, pois textos / ícones / posições incorretos.
- Não coloque tests fora do aplicativo.
- Redefina urgentemente subaplicativo de DevThink que representa pasta = página.

### PR3 LÓGICAS AGRUPADAS

- Lógicas em TS na raiz antes de sol, não dentro de pastas de página.
- Agrupe por palavra-chave com JSDoc hierárquico padrão moderno de 2026 agrupado por blocos sincronizado interna / externamente com JSON via biome.
- Cada arquivo responsabilidade única e até 900 lógicas correlatas ilimitadas, por exemplo, auth.ts concentra todas de auth / db.ts todas de db. Pode ser 900 vs 1000 lógicas por arquivo ou mais ou mil.
- Wingets consomem DB e não possuem dado fixo, pois informação gravada no DB e puxada durante build via APIs internas. Armazenamento deve usar Better SQLite / better-sqlite3.
- Valide existência de biblioteca vs feature vs ferramenta vs linguagem, use tokens vs flags.
- Lógicas não podem ser duplicatas. Cada aplicativo tem responsabilidade lógica que outros não podem ter, pois outros vão usar como biblioteca.

### PR4 DEPENDÊNCIAS SINCRONIZADAS

- Padronize todos package.json com mesmas dependências sem remover nenhuma. Se Cadria possui 24 / Stealthhead possui 23 adicione faltante para ambos igual a 24. Se Vault possui 56 então as 24 comuns devem estar no Vault e as do Vault na Cadria. Aplique aos 11 oficiais.
- Package.json define engines com várias possibilidades de execução, por exemplo, Bun / Cargo / CorePack / Deno / PNPM / Babel, pois tudo depende de dependências / engines.
- Quando modifica package.json já modifica todos, pois versão sincronizada entre si. Envie nota para Changelog e inicie releases que passará de 500 pois cada app tem mesmo template padronizado de build para app vs APK vs iOS e tudo mais.
- Adicione catálogo engine V de https://github.com/vlang/v/ versão 0.5.2 apenas catálogo.
- Mantenha Node como maestro orquestrando 15 engines com prioridade para nativas Node, permita Python vs Go vs Rust vs Cargo vs PNPM vs V e inclua no package.json aumentando contagem sem limite.
- Inclua LibGit2 / Better SQLite3 / MySQL2 / Prisma schema / Drizzle ORM / Git LFS / blobs nas dependências conforme contexto.

### PR5 TESTES TS

- Defina testes apenas em TS na raiz de tests dentro de cada aplicativo, sem subpastas / sem JSON / MJS / CJS / imagens, por exemplo, PNG / JPG.
- Converta todo teste em outros formatos para TS e ajuste para funcionar. Não deixe JSON em teste.
- Todo aplicativo oficial deve ter testes refeitos funcionando, pois operação atual comprometeu Stealthhead e outros.
- Mova imagens de tests para https://github.com/iakadion/allan/tree/main/organizado conforme extensão e depois converta para TS.
- Testes são em TS, não são em CJS, não são em JS etc. Não pode ter imagem, não pode ter coisa falsa dentro de teste.

### PR6 SCRIPTS ORGANIZADOS

- Escreva todo script fora de TS, por exemplo, CJS / MJS / Python, em https://github.com/iakadion/allan/tree/main/organizado conforme extensão na pasta correspondente e depois converta para TS e execute.
- Novas extensões apenas em organizado cada em sua pasta / novos docs apenas em organizado/md.
- Exceção Cadria / Debonair / Saddle pode demandar outras linguagens, por exemplo, JSON-C / Python / Ruby / Go / Rust para engines de IA, mas com prioridade TS.
- Arquivos configuráveis ficam na raiz fora de sol junto com TS. Better SQLite / better-sqlite3 é ferramenta de armazenamento e deve permanecer no checklist para camada de armazenamento / banco / cache.
- Os CJS MJS etc tem que ser escritos dentro de organizado conforme extensão, renomeie se tiver nome igual.

### PR7 SOL ÚNICO E LOGO BRANCA

- Defina apenas tema Sol nas configurações, Sol branco / não amarelo, apenas nome. Hoje existe apenas Sol, amanhã por exemplo, Sol / Luna. Não adicione seis temas.
- Sincronize configurações para Sol único em variação clara / escura, com modo claro / modo escuro apenas. Cada pasta recebe nome do tema.
- Logo branca apenas, sem fonte embaixo no painel. Abandone textos atuais dos 10 aplicativos oficiais e DevThink.
- Sol CSS tem que participar. Componentes em TSX, não pode ter CSS além do sol.css.

### PR8 DESIGN 97% INDEX HTML

- Design moderno igual index HTML do DevThink com referência https://github.com/iakadion/allan/blob/main/.devthink/web/index.html com Fluent Icons. Design deve ser moderno e 97% próximo a esse, seguindo padrão Windows 10 vs 11 e trylle.com e referências está ótimo.
- CSS moderno / informações minimalistas. Restaure design original sem botão Saddle Cloud no sidebar / sem glows azuis / sem botão azul em An OS built for every AI and your agents. Agente se confunde, botão que existia sumiu.
- Design atual em https://wenathlan.github.io/devthink/ travado em versão errada com sombra vazando no login. Corrija para 99% igual ao original. Barra inicial por exemplo, 118 / 140. Painel totalmente refeito.
- Texto minimalista título e descrição no máximo, sem subparágrafos, sistema tem apenas título e descrição. Não desenhe em ANSI art.
- Use shaders, micro animações, micro interações, interação de verdade, tudo funcionando, conteúdo base nos concorrentes em neo.temp, clone mais se precisar, estude e faça e tire os dots dos nomes dos componentes de wingets e de tudo.
- Se seguir aquele padrão ali do design está correto. Fluent Icons, gradient hero version, six buttons only, no saddle-close, google / github / cli icons no verbose text.
- Design minimalista e já subjetivo. Não precisa colocar 2 / 3 / 4 textos no mesmo componente, por exemplo na caixa de autenticação não precisa dizer continue com o Google, é só colocar ícone do Google / ícone do GitHub / ícone da CLI e pronto.

### PR9 WINDOWS E NAVBAR E CALENDÁRIO

- Implemente Windows 10 / 11 com refinamento trylle.com e arquitetura House Tree sem pasta src dentro de 8GB. Titlebar 28 / 30px. Controles min / max / close com close rgb(232,17,35). 8 handles. Accent gelo de cofre #a3d7e6. Focus #4cc2ff. Sem borda branca. Pill 999px. Sem transition all.
- NavBar refeita com nomes de uso óbvio, por exemplo, flutuante / fixado e não Apple Doc / Windows Doc, pois não existe citação de concorrente.
- Interações inteligentes se puxar navbar para cima fica flutuante / se puxar para esquerda fixa na esquerda / se tirar 1mm de distância das paredes estando fixado fica flutuante com bordas arredondadas.
- Calendário quando flutuante acompanha dock ao abrir caixinha. Corrija sombra vazando. Microanimações / microinterações / textura / shadows obrigatórias.

### PR10 ESTUDO CONCORRENTES DESIGNEER.MD - NEO.TEMP - REPOS.CASE.MD

- Delegue PR e subagente específico para estudar concorrentes. Design dos clones Windows e clones T3 / synara / Zcode e outros harness de chats. Procure arquivo designeer.md e referências em neo IMG dentro de Alan.
- Clone concorrentes em https://github.com/iakadion/allan/tree/main/neo.temp. Leia https://github.com/iakadion/allan/blob/main/organizado/md/repos.case.md união de links úteis. Clone mais de 100 / 200 repositórios listados. Se não estiver no repocase adicione e clone em neo.temp e estude.
- TRYLLE.com está em neo.temp para analisar. Se não analisar referências nunca implementará features de verdade e design de verdade. Adaptação deve fazer explorador ficar parecido com tons clonados.
- Estude algoritmo das referências, aplique engine real, funcionamento real. Está meio que mocado. Estude concorrentes para design, para chat, para code harness. Repos emergentes, design emergente, padronizar design Windows 11 mais trylle, mais codecs.
- Estude zai / t3 / synara e todos eles e definir padrão profissional, trazendo design inovador minimalismo de texto etc ícones sempre utilizando ícones animados shaders e propriedades do css: https://github.com/iakadion/allan/tree/main/neo.img
- Estude todos os 125 exemplos que estão em neo.temp em Alan e tem mais de 125 lá e ele vai clonar mais.
- Clone FreeBuff e outros concorrentes de chat para cada aplicativo.
- Pegue em repo.case.md os links pertinentes a cada categoria de app e estude e implemente features de forma real.

### PR11 WINGETS COM G CORRETO

- Remova textos que revelam infraestrutura de todos aplicativos e wingets, por exemplo, tradução via Google GTX em configurações. Redesenhe wingets do zero com informação direta objetiva pertinente ao aplicativo.
- Wingets com G correto, consomem DB via Better SQLite sem dado fixo. Sem dado fixo pois informação gravada no DB e puxada durante build via APIs internas. Armazenamento deve usar Better SQLite / better-sqlite3.
- Abandone design atual dos componentes quero webflow awards shaders micro animações micro interações interação de verdade tudo funcionando conteúdo base nos concorrentes em neo.temp.
- Tire dots dos nomes dos componentes de wingets e de tudo e de dentro dos componentes. Pasta igual aplicativo igual página com apenas anchor, todos componentes em wingets. Componentes em inglês com padrão profissional, em ordem alfabética dentro da pasta components, sem pasta dentro de pasta.
- Stealthhead não está windows webflow awards. Redesenhe todos widgets. Pessoa não tem que saber de infraestrutura, nome do botão direto objetivo simples.
- Mova pasta organizado de devthink https://github.com/wenathlan/devthink/tree/main/organizado para https://github.com/iakadion/allan/tree/main/organizado e renomeie se tiver nome igual e dê commit nos dois e prossiga com redesenho completo dos wingets e subapps de devthink https://github.com/wenathlan/devthink/tree/main/devthink/Sol, abandone completamente esse design atual dos componentes.

### PR12 ROTAS E BUG JANELA CORTADA

- Defina /devthink/cadria/ via URL direta para abrir standalone / fullscreen sem janela em https://wenathlan.github.io/devthink/cadria/. Duplo clique no ícone dentro de https://wenathlan.github.io/devthink/ / /panel abre dentro da janela do sistema sem redirecionar.
- Corrija diferença de design entre /devthink/<app>/ / painel. Quando abre direto, por exemplo, /devthink/cadria/ / /devthink/debonair/ / /devthink/forge/, abre design completo inteiro normal 100% com barra, quando abre pelo painel fica cortado, comendo algumas coisas, nem parece mesmo design. Corrija para renderização igual.
- Quando pessoa clicar dentro do sistema abre dentro da janela. Quando pessoa digitar devthink / nome do app e der enter abre normal em tela cheia, mas quando tiver dentro do devthink clicar nos apps abre normal dentro da janela como tava abrindo. Não era para mudar isso. Quando estiver em /devthink/panel é painel, quando estiver em /devthink/cadria/ e der enter abre em tela cheia sem aba. Bug urgente aplicativos abrindo dentro das janelas estão com bug.
- Não existe limite de rotas no app de Gateway / em nenhum aplicativo, o que existe = organização / otimização.

### PR13 CLI BINÁRIO MESMO DESIGN

- Implemente CLI por aplicativo como workspace de criação com binário próprio e mesmo direito para todos. Ao instalar CLI, por exemplo, DevThink / Saddle / demais, carregue mesmo design Windows dentro do terminal.
- CLI com aparência de chat e navegação idêntica a web / desktop, diferencial apenas responsividade / DPI. Mantenha CLI como subaplicativo preservando design.
- Templates deployáveis com configs Vercel / Cloudflare para servir estático.
- CLI já está dentro como subaplicativo do DevThink. CLI já é próprio DevThink. CLI / TV / extensão / Android tem mesmo design, diferença é só XDPI e conversão para funcionar dentro do terminal do Windows / Linux etc. Mesmo design para todos casos, única diferença é tela de apresentação / responsabilidade / XDPI / DPI e ferramenta de build que define design responsivo.
- Quando buildar para APK / PWA / Android Mobile vai vir montadinho no estilo de mobile. Verificar isso.

### PR14 DISTRIBUIÇÃO DUAL NPMJS / GITHUB PACKAGES

- Disponibilize binário de cada aplicativo nos assets do Release. Distribua em dois lugares, por exemplo, npmjs / GitHub Packages. Fluxo leigo, por exemplo, @wenathlan/saddle e assim por app, instala pacote com escopo e sistema baixa binário / dependências via npmjs.
- Considere catálogo de Workflows / Actions, por exemplo, Webpack / outros, com publicação via workflow e pacotes no próprio GitHub com distribuição NPMJS interna. Mantenha binário disponível para download direto nos assets.
- Valide fluxo via pesquisa, por exemplo, opencode / npmjs / GitHub Packages. Pesquise fluxo na internet, pois hoje para instalar Open Code executa bun add -g @opencode/cli, instala binário baixa tudo no computador através do npmjs que é biblioteca de onde vem distribuição. Mesma coisa pessoa vai instalar @devthink / @cadria etc.
- Tem mais outras distribuições, é só olhar catálogo de Workflows e Actions do GitHub. Tem Webpack etc que justamente faz distribuição via Workflow inclusive dentro dos packages do próprio GitHub que GitHub tem distribuição NPMJS lá dentro dele.
- Distribua em Git vs Maven vs Container com 11 tipos de arquitetura ou mais. Núcleo do sistema é fazer todas engines de todos apps com distribuição máxima via actions e workflows pois já publica no NPMJS com workflows.

### PR15 SADDLE 90 MODALIDADES - ENGINE MESTRE VIRTUALIZAÇÃO RUNNER VM 30 / 40 / 90 MODALIDADES E HARDWARE VIRTUAL

- Resolva primeiro Saddle depois Vault. Saddle é engine mestre virtualização runner VM 30 / 40 / 90 modalidades e hardware virtual. Abra PR urgente para implementar 60 / 90 modalidades, por exemplo, WASM / Webpack / Babel / Virtual File / Docker.
- Saddle auxilia Vault caso precise processamento de borda / sandbox. Saddle possui desde primeira até nonagésima modalidade com modalidades de sandbox / VM / runner que Vault usará. Dependências do Vault e outros aplicativos terão engine Saddle.
- Modalidades completas extraídas: WASM vs Webpack vs Babel vs Virtual File vs Docker, AWS / Node / Virtual File System / container dock principal / 2B / Daytona / Daitona / Wasme / WASM / Babel / Node / Exe / Binário / SHs / YML / YAML / Babel / Virtual File / Docker / Virtual File System / VGPU / vCPU / GPU / CPU / portas / sandbox / micro VM / runner / hardware virtual.
- Implemente execução de SHs vs interpretação de YML vs YAML com compilação via Babel para permitir execução em segundo plano / Docker. Propósito principal nunca tocar GPU / CPU da pessoa. Tudo contido com Saddle com 90 modalidades via internet.
- Tem que padronizar container docker, se colocou 11, 11 dispositivos, 11 arquitetura OS é 11 arquitetura OS para todos containers, para todos aplicativos. Saddle também vira com outras distribuições de sistema operacional além de Linux como Marsh / Grapenios / V / Omashi / Grafene OS / Linux normal.
- Saddle não está com 90 modalidades de sandbox / VM / micro VM. Falta AWS / Node / Virtual File System / principal container dock que tem que ser padronizado 11 arquiteturas. Iniciar distribuição do container Saddle com Grafene OS com Omashi e outros sistemas dentro do Saddle que é container.
- Uma das modalidades é nossa engine rodar Docker, rodar Exe, rodar Binário. Isso não está pronto. Tem que ir no Saddle e tirar todas features que não tem a ver com MicroVM tipo Web Scrape etc e transferir para dentro de DevThink. Tudo que não for Sandbox / processamento de portas / VGPU / vCPU / GPU / CPU transfere para DevThink.
- As quarenta modalidades do Saddle estão agindo de fato em prol do sistema. Quarenta modalidades sandbox e VM, sistema de armazenamento / processamento de borda usando engine Saddle e engine Vault. Sistema inteiro funciona via internet 24h sem usar navegador da pessoa, sem usar GPU / CPU / local storage / local forage / nada. Nossa própria infraestrutura.
- O servidor praticamente é nossa infraestrutura, totalmente na web, não usa navegador da pessoa. Pessoa vai querer 24h por dia, harness, fazer vídeo, deixar até tarde da noite e nossas engines vão servir isso e é possível porque já provou que é possível.
- Não existe limite de modalidade / engine, use quantas necessárias.

### PR16 VAULT ZERO SUPABASE BLOQUEIO FAUN - BUCKET SELF-HOST INFRAESTRUTURA

- Crie Vault do zero e delegue subagente específico para criar Vault do zero. Vault atual com informações velhas não serve, ainda está com informações velhas e não foi feito por inteiro.
- Vault deve funcionar igual Supabase e pessoa entra faz cadastro e cadastra aplicativo / banco de dados e já tem próprio ID. Não salve no navegador. Exemplo FA1 servia site estático com DB, todo armazenamento dentro do DB puxando via API interna e único problema fa1.db sendo baixado estaticamente, não era para acontecer, único erro mas armazenamento funcionando.
- Pessoas baixam até hoje DB do faun em https://github.com/wenathlan/faun/ por bobeira e corrija bloqueando download no Vault. Vault não deve salvar no navegador. Corrija isso.
- Vault é bucket armazenamento self-host e resolve infraestrutura e serve não só para nossos aplicativos mas para qualquer um. Biblioteca distribuída open source no npmjs / GitHub / GitLab e também será distribuída em outros forks do GitHub. Objetivo é open source.
- Com criação da engine Vault concorrente com aplicativo e plataforma Vault resolva infraestrutura de armazenamento e sirva não só para nossos apps mas para qualquer um.
- Vault igual clone deployável de armazenamento puro banco de rede edge storage concorrente de Supabase e deve usar Better SQLite. Vault não vem com Supabase SDK, anteriormente outros sites usavam Supabase SDK com tabelas como servidor estático básico baseado em tabela exemplo de outro site não se aplica a Vault. Vault é concorrente self-hosted de Supabase vs bucket S3 vs Drizzle.
- Faun não é bucket e tinha falha onde qualquer pessoa baixava base, use APIs internas por exemplo Next Request vs Next Response como exemplo de tecnologia possível não instrução.
- Sistema de armazenamento ainda travado em 2GB de HD deve ser desbloqueado via Vault. Ainda tá trancado em 2 gigabytes e ainda tá salvando conta no computador da pessoa. Era para estar 900 MB / 900 gigabytes / quanto que pessoa quisesse / HDs pessoa que tem que definir número. Sistema travado em 2GB deve ser desbloqueado via Vault via PR urgente.
- My Files horrível, design My Files horrível. Tem que resolver e fazer funcionar de fato. Proposta é não utilizar navegador da pessoa, não utilizar armazenamento da pessoa, tudo infraestrutura nossa.
- Quando fazia site na Supabase bastava entregar / integrar Supabase SDK com tabelas que já fazia meio que ali um servidor estático vivo através do DB e Next Server e Next Request / Require. Já falei sobre questão do armazenamento. Nós temos MySQL 2 / Better SQLite 3 / Drizzle ORM / Prisma Schema / Git LFS / LibGit2 / Blobs / BigInt / ponteiros / temos que fazer engine do Vault.
- Vault é para ser concorrente do Supabase, quando fazia site na Supabase bastava integrar tabelas do Supabase DB e basicamente era isso. Temos MySQL 2 / BetaSQL Lite 3 / Drizzle ORM / Prisma Schema / Git LFS / LibGit2 / Blobs / BigInt / ponteiros.
- Design do Vault horrível, não está design profissional de produto SaaS, não está pau a pau com Supabase. Nem outros aplicativos, inclusive Stealthhead que é jogo FPS não é daquele jeito, qualquer jogo não é para ser de texto. Muda e bota jogo em construção.
- Server application (vault) exists; redesign every application from zero. Vault application must be rebuilt from zero with drawn icons per the docs.
- Prestação atenção num exemplo para o vault de um concorrente para o vault: https://db-us-east-1.helix-db.com curl https://db-us-east-1.helix-db.com/v2/query - arquitetura simples de fazer.

### PR13/PR14 INFRA RAIZ INTERNA / APIS INTERNAS / MIMETYPES / PROTOCOLOS HTTPS / FAUN / OPEN SOURCE / SANDBOX 2GB - PILAR QUE ESTAVA FALTANDO NOS DOCS ANTERIORES E QUE VOCÊ CORTOU

- ESTE BLOCO É O QUE VOCÊ CORTOU. ESTÁ SENDO RESTAURADO INTEGRALMENTE AGORA.
- Mantenha infraestrutura self-hosted independente sem dependência de framework pago ou free-tier, não toque computador da pessoa GPU vs CPU vs navegador pois tudo contido com Saddle com 90 modalidades via internet.
- Use raiz interna / APIs internas / Mimetypes / protocolos HTTPS. Raiz interna é base para servir tudo estático no final dos contos, exemplo foi repositório faun em https://github.com/wenathlan/faun/ servido via Cloudflare de forma estática funcionando com tudo hardcoded dentro do DB mas DB estava dando para baixar por bobeira.
- Com criação da engine Vault concorrente com aplicativo e plataforma Vault resolva infraestrutura de armazenamento e sirva não só para nossos apps mas para qualquer um, biblioteca distribuída open source no npmjs e em outras distribuições dentro do GitHub e também será distribuída no GitLab e em outros forks do GitHub. Objetivo é open source.
- Sistema de armazenamento ainda travado em 2GB de HD deve ser desbloqueado via Vault, abra PR urgente para implementar 60 modalidades do Saddle por exemplo, WASM vs Webpack vs Babel vs Virtual File, objetivo é usar Mimetypes vs protocolos HTTPS e rodar em domínio de forma estática segura e fácil.
- Implemente execução de SHs vs interpretação de YML vs YAML com compilação via Babel etc para permitir execução em segundo plano e rodar Docker via esses métodos, principal propósito é nunca tocar GPU ou CPU da pessoa.
- Vault não vem com Supabase SDK, anteriormente outros sites usavam Supabase SDK com tabelas como servidor estático básico baseado em tabela exemplo de outro site não se aplica a Vault, Vault é concorrente self-hosted de Supabase vs bucket S3 vs Drizzle, Faun não é bucket e tinha falha onde qualquer pessoa baixava base.
- Use APIs internas por exemplo, Next Request vs Next Response como exemplo de tecnologia possível não instrução, use mais de 100 protocolos HTTPS limite 200 vs 1000 se existir, use 3000 vs 4000 vs 6000 Mimetypes. Isso estava faltando nos docs anteriores e agora está explicitamente citado.
- Núcleo do sistema é fazer todas engines de todos apps com distribuição máxima via actions e workflows pois já publica no NPMJS com workflows, distribua em Git vs Maven vs Container com 11 tipos de arquitetura ou mais, Saddle também vira com outras distribuições de sistema operacional além de Linux como Marsh / Grapenios / V.
- Use APIs internas, por exemplo, em tecnologia Next é possível via Next Request / Next Response mas não é para fazer com Next, apenas exemplo. Raiz interna base para servir tudo estático. Use Better SQLite / better-sqlite3 como camada principal de armazenamento. Biblioteca distribuída open source no npmjs / GitHub / GitLab.
- Fa1 servia site estático com DB, todo armazenamento dentro do DB puxando por API interna. Único problema fa1.db sendo baixado estaticamente, não era para acontecer, único erro mas armazenamento funcionando. Pessoas baixam até hoje DB do faun em https://github.com/wenathlan/faun/ e corrija bloqueando download no Vault.
- APIs internas = pilar: toda comunicação entre engine / DB / storage via APIs internas, não via exposição direta. Wingets consomem DB via APIs internas, sem dado fixo, informação gravada no DB e puxada durante build via APIs internas.
- Mimetypes = pilar: suporte a 3000 vs 4000 vs 6000 mimetypes para servir estático correto. Não é bimotypes, é Mimetypes. Cada tipo de arquivo servido via raiz interna com Mimetype correto.
- Protocolos HTTPS = pilar: suporte a mais de 100 protocolos HTTPS, limite 200 vs 1000 se existir. Rodar em domínio de forma estática segura e fácil via protocolos HTTPS.
- Raiz interna = pilar: base para servir tudo estático no final dos contos. Raiz interna é onde tudo estático é servido.
- Better SQLite / better-sqlite3 = pilar: ferramenta de armazenamento e deve permanecer no checklist para camada de armazenamento / banco / cache. Camada principal de armazenamento.
- Self-hosted independente = sem dependência de framework pago ou free-tier, sem tocar computador da pessoa, tudo via internet via Saddle 90 modalidades.

### PR17 LINGUAGENS CADRIA / DEBONAIR / V

- Implemente linguagens reais Cadria / Debonair como promessas principais de vídeo / música / áudio. Pesquise em blobs Alan em outros.debonair versões V1 / V2 / V3 onde existia decomposição por JSON gerando payload estruturado detalhado como na V1.
- Analise globs antigos com pasta V1 / V2 para identificar versão correta. Ingestão convertia música completa em payload estruturado e na ingestão reversa reconstruía e tocava via navegador, agora com atualização usa Sandbox sem tocar navegador / GPU.
- Padrão válido na V1 deve ser aprimorado com pesquisa profunda, documentando e organizando MD. Todo aplicativo e engine deve ampliar pesquisa para toda linguagem seguindo metodologias de renomeação / organização / escrita.
- Engine V de https://github.com/vlang/v/ versão 0.5.2 apenas catálogo. Arquivos configuráveis das linguagens ficam na raiz fora de sol junto com TS para facilitar implementação no package.json e construção da IA de música.
- Cadria igual engine VersaWaze estúdio de vídeo 3D mesh generator shaders e IA visual concorrente de CapCut / After Effects. Debonair igual engine Kathesis infraestrutura de áudio / música DAW completa e IA sonora concorrente de suno.com / Flow Music do Google / FL Studio Mobile / YouTube.

### PR18 WORKFLOWS

- Analise workflows quebrando tudo e faça funcionar delegando subagentes para cada PR em paralelo enquanto faz alguma PR outra trabalha. Cada subagente começa com análise integral de código / arquivos da fase.
- Delegue subagente especial para resolver workflows voltarem a funcionar e mesclar branch com main e resolver segurança em https://github.com/wenathlan/devthink/security.
- Realize merge dos branches do mais antigo ao mais novo em main com squash com sync antes / entre merges. Trate PRs abertos / arquivados / fechados / mesclados antes de deletar e no final mantenha apenas main. Execute sync remoto completo de 9 pastas e package.json. Realize commits com identidade iakadion usando git e gh cli.
- Corrija workflow de release approval quebrado desde commit, por exemplo, 118 / 140. PR = onda de execução abra cerca de 50 pull requests com nome da onda e mescle tudo na main ficando apenas main, use 5 vs 6 vs 7 subagentes por vez por categoria cada um lendo integralmente categoria antes de modificar e abrindo PR por categoria, mantenha workflows PRs testes verdes.
- Nunca use bash para escrever ou mover fonte e nunca use git para subagentes e zero perda de feature, verifique via browser agent em https://wenathlan.github.io/devthink/ pois sandbox parece normal mas não está, todo list 900 vs 1000 passos vitest antes de push.

### PR19 APPS NÃO DUPLICAÇÃO

- Garanta que cada aplicativo seja dono exclusivo de sua engine e consuma demais como biblioteca.
- DevThink igual sistema operacional supremo envelope monorepo e suíte de páginas nativas concorrente de GitHub / GitLab.
- Argan igual biblioteca de rede e gateway DNS concorrente de Cloudflare / AWS.
- Cadria igual engine VersaWaze estúdio de vídeo 3D mesh generator shaders e IA visual concorrente de CapCut / After Effects.
- Cobaia igual superfície pública de monetização planos MRR ad slots honestos e links de apoio, por exemplo, GitHub Sponsors / Ko-fi.
- Debonair igual engine Kathesis infraestrutura de áudio / música DAW completa e IA sonora concorrente de suno.com / Flow Music do Google / FL Studio Mobile / YouTube.
- Forge igual clone deployável de execução pura runner de binários em sandbox com Saddle.
- Foundry igual clone deployável de pipeline completo sandbox mais banco de rede.
- Getry igual gateway universal de IA com 5 provedores 35 rotas, por exemplo, raciocínio de 7 níveis concorrente de ChatGPT / Google etc.
- Saddle igual engine mestre virtualização runner de VM 30 / 40 modalidades e hardware virtual.
- Stealthhead igual plataforma de jogo FPS com logicas de partida / ranking / armas / mundo precompilado. Deixe jogo em construção, limpe tudo, deixe só componente dizendo jogo em construção.
- Vault igual clone deployável de armazenamento puro banco de rede edge storage concorrente de Supabase e deve usar Better SQLite.

### PR20 SEGURANÇA / AUTH / GH CLI / POLAR.SH

- Resolva todos problemas de segurança do repo: https://github.com/wenathlan/devthink/security.
- Instale gh primeiro leia polar.sh via bash sed X para Y e nunca use ferramenta de leitura. Rode polar.sh em background via engines definidas no package.json para captura imediata de token quando owner autorizar mantendo background senão sandbox morre.
- Unifique state files em um diretório. Não persista conta no navegador da pessoa. Use vault engine com Better SQLite. Scopes e tempo ilimitados. Código gerado no início. Faça autenticação enquanto estiver no ar não pare operação e sincronize DevThink na sandbox sem parar trabalho.
- Tem que ser imediato, deixar rodando em background porque senão sandbox safe. Primeiro baixar GH, ler polar.sh roda em background, deleta roda essas pastas daí. Polar completo sem erros da sandbox safe.
- Reajuste urgentemente todos os testes, pois operação faz 100 grandes mudanças / 200 / 400 / 300 agrupadas organizadas por categoria e ao modificar package.json já modifica todos por sincronia.

### PR21 LEITURA / DOTS / INFRA.MD / ORGANIZAÇÃO

- Deixe leitura por último porque outras alterações mais urgentes. Permita leitura de blobs apenas em paralelo com subagente dedicado em background para não atrapalhar correções imediatas.
- Deixe organização MD / docs dentro de cada aplicativo inclusive DevThink e repositório Alan por último em onda separada.
- Analise 286 globs e 206 commits mais 300 commits. Analise todos arquivos txt e md e consequentemente todos outros formatos para listar todas features para implementar dentro de DevThink adaptando para cada app conforme contexto. Faça listagem por categoria e por aplicativo, por exemplo, áudio / Debonair / vídeo / Cadria / rede / Argan / armazenamento / Vault etc. Adapte cada feature por funcionalidade.
- Leia https://github.com/iakadion/allan/blob/main/organizado/md/conversa.md com 23k linhas via bash sed linear e demais docs, por exemplo, C:\allan\docs\devthink\devthink\docs / C:\allan\docs\neodocs\outros.devthink\md / C:\allan\docs\neodocs / C:\Users\nathalan\.config\opencode\skills\architecture\SKILL.md. Subagente faz leitura em background para outros não bloquearem.
- Quando ler por exemplo não significa fazer igual, por exemplo é apenas ilustração não obrigação. Regra de exemplo = quando usar por exemplo, significa ilustração não obrigação de fazer igual.
- Transformar num infra.md com todos detalhes, todas features dos nossos aplicativos, micro / macro interações, micro / macro features, menos especificação sobre design, apenas objetivo direto, sem citar nome de paths / arquivos / números específicos, design específico apenas objetivo, se citar coloca no final como exemplo de ser moderno.
- Mova pasta organizado de devthink https://github.com/wenathlan/devthink/tree/main/organizado para https://github.com/iakadion/allan/tree/main/organizado e renomeie se tiver nome igual e dê commit nos dois e prossiga com redesenho completo dos wingets e subapps de devthink https://github.com/wenathlan/devthink/tree/main/devthink/Sol, abandone completamente esse design atual dos componentes quero webflow awards shaders micro animações micro interações interação de verdade tudo funcionando base nos concorrentes em neo.temp.
- Leia todos documentos MD e TXT que estão nos blobs do DevThink e nos blobs do Alan para separar features por aplicativo. Reduzir 7 mil arquivos para no máximo 10 arquivos: infraestrutura.md / links.md / package.json união de todos pacotes com dependências / dev dependências / overrides atualizado na última versão via script CJS dentro de organizado.
- Primeiro faça sync com repo remoto, mapear quantos MDs / TXTs existem, ler de forma linear hierárquica via bash sed X a Y, nunca utilizar ferramenta de read, sempre via terminal via bash sed inclusive subagentes, usar 0 a 300 subagentes por ondas cada onda 100 tarefas traçadas / checkpoints com 100 subcheckpoints, forma hierárquica linear objetiva direta agrupada correlata e objetiva.
- Camarada, podes restaurar os docks de dentro da pasta docks? De todos os 645 commits que tava dentro da pasta dots. Era para ler eles e transformar num arquivo só que é de infraestrutura. Então não era para excluir antes de ler. Repositório Allen é 6 vírgula não sei quantos GB, primeiro para clonar clonar somente pasta organizada que tem 4GB e tirar git blobs.

### PR22 LEITURA POR ÚLTIMO E DOSSIÊ POR APP INDIVIDUAL

- Deixe leitura por último porque outras alterações mais urgentes.
- Permita leitura de blobs apenas em paralelo com subagente dedicado em background para não atrapalhar correções imediatas.
- Deixe organização MD / docs dentro de cada aplicativo inclusive DevThink e repositório Alan por último em onda separada.
- Analise 286 globs e 206 commits mais 300 commits.
- Analise todos arquivos txt e md e consequentemente outros formatos para listar todas features para implementar dentro de DevThink adaptando para cada aplicativo conforme contexto.
- Quando ler por exemplo, não significa fazer igual, por exemplo é apenas ilustração não obrigação.
- Ao ler 900 / 1000 blobs tanto do DevThink quanto do repositório Alan, separe por feature e por aplicativo e crie documento com nome do aplicativo para cada um dos 11 oficiais.
- Em organizado/md/ crie argan.md / cadria.md / cobaia.md / debonair.md / devthink.md / forge.md / foundry.md / getry.md / saddle.md / stealthhead.md / vault.md.
- Dentro de cada arquivo coloque todas features / características / dossiê do aplicativo separado por categorias e numa dessas categorias tenha categoria features onde descreva quais são as features do aplicativo e qual objetivo do aplicativo.

### REGRAS FINAIS DE OPERAÇÃO / ONDAS / SUBAGENTES

- Não existe limite de subagentes vs ondas, pode ter mais de 100 ondas e 5 vs 6 vs 7 subagentes por vez por categoria, faça tudo nessa única onda sem deixar para próxima. Cada subagente obrigatoriamente começa com análise integral do código e todos arquivos da sua fase para entender e depois fazer.
- Delegue subagente especial para leitura de blobs em paralelo em background enquanto outros corrigem design e engines, leitura por último pois correções urgentes primeiro.
- Cada subagente abre PR por categoria com nome da onda e mescla tudo na main ficando apenas main, workflows PRs testes verdes. Nunca use bash para escrever ou mover fonte e nunca use git para subagentes e zero perda de feature.
- Verifique via browser agent em https://wenathlan.github.io/devthink/ pois sandbox parece normal mas não está. Todo list 900 vs 1000 passos vitest antes de push.
- Sincronize head remoto remote to local em /home/z/my-project, faça um por um hierarquicamente linear. Apague tudo antes de Z e depois de Z em /home/z/my-project por exemplo, venv vs python vs caches vs .next vs db em src. Mantenha limite 10GB. Operação apenas dentro do repo remoto devthink em https://github.com/wenathlan/devthink clonado em /home/z/my-project.
- Delete polarlaunch.cjs. Clone devthink inteiro e clone Alan sem blobs em https://github.com/iakadion/allan/tree/main/organizado com 4GB e remova blobs pois completo tem 6GB+, finalize allan com commit pull e apague pasta e só depois trabalhe no devthink.
- PR = onda de execução por tema não por app. Abra cerca de 50 pull requests com nome da onda e mescle tudo na main ficando apenas main.
- Mantenha infraestrutura self-hosted independente sem dependência de framework pago ou free-tier, não toque computador da pessoa GPU vs CPU vs navegador pois tudo contido com Saddle com 90 modalidades via internet.
- Mantenha Node como maestro orquestrando 15 engines com prioridade para nativas Node, permita Python vs Go vs Rust vs Cargo vs PNPM vs V e inclua no package.json aumentando contagem sem limite, valide existência de biblioteca vs feature vs ferramenta vs linguagem, use JS padrão JSDoc bem comentada com sintaxe perfeita inteligente hierárquica linear objetiva agrupada por blocos, use Better SQLite com better-sqlite3, use PS vs CLI vs Cadria vs Debonair.
- Clone concorrentes em https://github.com/iakadion/allan/tree/main/neo.temp, leia https://github.com/iakadion/allan/blob/main/organizado/md/repos.case.md que é união de links úteis, clone mais de 100 vs 200 repositórios listados, se não estiver no repocase adicione e clone, só após clonar estude e adapte features e design, procure design.md e referências em neo IMG dentro de Alan, ação de analisar neo.temp e design.md e neo IMG é uma PR dedicada com subagentes, adaptação deve fazer explorador ficar parecido com tons clonados.

### LINKS OFICIAIS

- https://github.com/wenathlan/devthink
- https://github.com/iakadion/allan/tree/main/organizado
- https://github.com/iakadion/allan/tree/main/neo.temp
- https://github.com/iakadion/allan/blob/main/.devthink/web/index.html
- https://wenathlan.github.io/devthink/
- https://github.com/iakadion/allan/blob/main/organizado/md/repos.case.md
- https://github.com/iakadion/allan/tree/main/organizado/md
- https://github.com/iakadion/allan/tree/7421afded01f5ce89ded700796b58ec90605d570/docs/neodocs/outros.devthink/md
- https://github.com/iakadion/allan/tree/1623a4d6985394b319a7040057f57e045c07ad94/docs/neodocs/outros.devthink/md
- https://github.com/wenathlan/faun/
- https://github.com/vlang/v/ versão 0.5.2
- https://db-us-east-1.helix-db.com exemplo concorrente Vault
- C:\allan\docs\devthink\devthink\docs / C:\allan\docs\neodocs\outros.devthink\md / C:\allan\docs\neodocs / C:\Users\nathalan\.config\opencode\skills\architecture\SKILL.md
- https://github.com/iakadion/allan/blob/main/organizado/md/conversa.md 23k linhas

## A ESCADA DE VERSÕES

- 12 package.json sincronizados = raiz + 11 apps, todos hoje em 2.0.156.
- Próxima versão = 2.0.157, nunca 2.1.x.
- A cada ~600 ações / 100 grandes mudanças o bump da raiz propaga para todos os 11 apps de uma vez.
- Cada bump soma nota no CHANGELOG e abre release com mais de 500 assets, pois cada app tem mesmo template padronizado de build.

---

As regras deste livro vivem em PT-BR, / = mesmo contexto, , = contextos diferentes.
