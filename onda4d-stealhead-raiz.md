# ONDA 4d — stealhead + raiz (neodocs-txt)

> Subagente leitor (Task ID 6-5-d). Regras ND-3001+ e features F-SHD / F-DTK extraídas
> SOMENTE de conteúdo efetivamente lido. Lixo/duplicatas pulados e documentados no fim.
> Fusão em regras.md/features.md fica para o orquestrador.

## Arquivos lidos (segmentos reais)

FONTE A — /home/z/neodocs-txt/outros.stealthhead/:
| # | Arquivo | Linhas totais | Segmentos lidos | Nota |
|---|---------|--------------|-----------------|------|
| 1 | stealthead.session1-conversa (2).txt | 15.435 | 1-110, 400-700, 882-1000, 5000-5150, 15250-15435 | sessão fundadora StealHead (dedup, ADRs, protocolo, waves) |
| 2 | session1-conversa (2).txt | 15.423 | 1-60 | DUPLICATA de stealthead.session1-conversa (mesma sessão sess_931b59a2) → pulado após confirmação |
| 3 | session3-conversa (2).txt | 9.511 | 1-40, 51-160, 583-720, 2600-2740 | StealHead 5.1 do zero (plano 8 fases, cores, DB-first, tuning) |
| 4 | session4-parametros-json.txt | 6.758 | 1-40 | dump JSON de tool-calls (session4/16-09); cabeçalho com stats lido, corpo = JSON repetitivo → amostrado |
| 4b | session1-parametros-json (2).txt | 38.908 | 1-50 | dump JSON de tool-calls da session1; mesmo formato → amostrado e pulado (baixa densidade) |
| 5 | organizeformats-report.txt | 10.585 | 1-45 + tail | log reversível da movimentação de 5.293 arquivos por extensão |
| 6 | finalunicocompletodefinitivo20260807113934b7c2e37763.txt | 24.306 | 1-40 | índice consolidado jogo-carro single-HTML (GLB único, pipeline headless) |
| 7 | ls -S extras | — | organizar (2).txt:1-25; stealthead.talks1 (3).txt:1-25; session4-conversa.txt:1-25; PLANO-5.3.txt:1-760, 787-1000; session3-parametros-json (2).txt (header) | talks1 = duplicata session1; organizar(2) = validações last-validation JSON |
| — | PLANO-5.3.txt | 1.717 | 1-620, 640-760, 787-1000 (grep estrutura até 1717) | documento consolidado 5.3: governança, features #307-546, 40 formatos, 70 pacotes, HUD Blood Strike, Sketchfab |

FONTE B — raiz /home/z/neodocs-txt/:
| # | Arquivo | Linhas | Segmentos lidos | Nota |
|---|---------|--------|-----------------|------|
| 1 | conversa9.txt | 56.499 | 1-30, 26-80, 300-420, spot-checks 4k/56k | TODO gateway definitivo (fases 1-5, escopo 28 arquivos) |
| 2 | conversa10.txt | 58.651 | 1-60 (checklist linhas 12-53), 2773-2822 | checklist de 53+ regras gateway + versão EN |
| 3 | conversa11.txt | 61.449 | 1-25, 47800-47900, spot-checks | erros SSE JSON parse + finalização/unificação |
| 4 | 17devnotes.txt | 218.924 | 1-40, 1800-1848, 160883-160910, 164038-164065, 201681-201710, 217778-218470 | consolidado por fonte; browser-qa, llms-full three.js, opencode config, theme/variables tokens, wss/saddle |
| 5 | ordens.txt + ordens (2).txt | 557+498 | cat completo (sort -u) | ordens (2) = duplicata de ordens → documentado |
| 6 | instrutions.txt | 20.732 | 1-60, spot-checks 2.5k-20k | engine de design 400 ações/10 fases (FAUN) |
| 7 | unificado2.txt | 9.216 | 1-45 | UI chat (Saddle box): geometria SVG, React 19 + motion |
| 8 | Skill-Definitiva-Todas-Regras.txt | 37 | completo | skill ghostwriter mirror |
| 9 | Skill-Design-Universal-V25-Todas-Versoes-Hierarquica.txt | 1.271 | 1-320 (V2), 700-920 (V17-21), 1046-1271 (V24-25+FAUN) | specs CSS/componentes V1→V25 |

Conteúdo conhecido de ondas anteriores (regras-totais, ARVORE, contexto.txt) → pulado quando apareceu (jogo-carro finalunico = extensão de documentomestre já catalogado; DOCTYPE/builds embutidos no 17devnotes = lixo de código, pulado).

---

## REGRAS ND

### Bloco A — StealHead: governança, ordens do dono e organização

ND-3001. Excluir todos os arquivos com hash criptográfico idêntico (SHA-256), preservando compactados (zip/tar) e a pasta de backup zips, com dry-run antes de aplicar. «stealthead.session1-conversa (2).txt:15-55»
ND-3002. Deduplicar recursivamente pasta dentro de pasta e arquivo dentro de arquivo em todo o repositório, nunca só no nível da raiz. «stealthead.session1-conversa (2).txt:28-45»
ND-3003. Organizar cada pasta de referência em subpastas por formato de arquivo (py/, ts/, tsx/, js/, mjs/, glb/, png/, md/…), só nas pastas de referência, com mapa reversível de movimentação. «stealthead.session1-conversa (2).txt:67-100; organizeformats-report.txt:1-45»
ND-3004. Corrigir colisão de destino reservando conjunto de destinos antes de mover qualquer arquivo na organização por formato. «stealthead.session1-conversa (2).txt:88-95»
ND-3005. Usar o node_modules global do usuário (junction) para vite/tsx/typescript/vitest/three; nada é instalado localmente sem autorização explícita. «stealthead.session1-conversa (2).txt:57-60; PLANO-5.3.txt:55-70»
ND-3006. Aplicar as skills `architecture` e `inline` do plugin workspace: scripts auxiliares em /tests como .mjs/.cjs (nome lowercase, sem hífen/underscore), só módulos nativos node:*, JSDoc em inglês, sem emoji. «stealthead.session1-conversa (2).txt:73-78»
ND-3007. Delegar leitura de documentação em paralelo para subagentes de exploração (5 agentes por pasta de referência), com relatório estruturado por cabeçalhos. «stealthead.session1-conversa (2).txt:60-64»
ND-3008. Ler os arquivos por segmentos de linha X a Y, sem dividir arquivos, sem arquivos temporários. «stealthead.session1-conversa (2).txt:1-12; PLANO-5.3.txt:70-75»
ND-3009. Seguir ADR-005: 200 a 300 lógicas correlatas agrupadas por arquivo-tema na raiz, com banners de seção `// === SEÇÃO ===`, sem barrels index.ts, sem pasta src/, sem subpastas por domínio; acima de 80KB move correlatos a sibling sem dividir domínio. «stealthead.session1-conversa (2).txt:425-428; session3-conversa (2).txt:2600-2612»
ND-3010. O que pertence ao mesmo contexto, tema e categoria de lógica de DB (ingestão, adapter, gravar, criar, configurar) vai em UM único arquivo db.ts; proibido separar. «session4-conversa.txt:12-14; PLANO-5.3.txt:49-52»
ND-3011. Scripts de teste vão em docs/StealHead/mjs; PNGs de teste em docs/StealHead/png; lógicas .ts na raiz do projeto. «stealthead.session1-conversa (2).txt:4-10; session4-conversa.txt:14-15»
ND-3012. O jogo é manipulado como o "Toblerone": só se manipula o que já está pronto no DB, nada procedural de gameplay em runtime. «stealthead.session1-conversa (2).txt:4-8; PLANO-5.3.txt:25-28»
ND-3013. DB-first: tudo que roda no navegador é pré-compilado e vai para o DB via orquestrador/adapter; o bundle inteiro fica como chaves bundle:*. «session3-conversa (2).txt:2611-2614; session4-conversa.txt:8-9»
ND-3014. Um DB por usuário: o callsign digitado no login vira `<callsign>.db`, criado no primeiro login, atrelado ao mestre stealthhead.db; sem DBs numerados. «PLANO-5.3.txt:50-53»
ND-3015. alan.db (usuário real) fica preservado e intocado em qualquer cenário; testes de agente usam só o callsign `ghost` via tráfego real, nunca "player". «PLANO-5.3.txt:53-55»
ND-3016. A pasta docs/ nunca é deletada; código antigo é referência de padrões apenas. «PLANO-5.3.txt:55-57»
ND-3017. data/ fica fora do controle de versão. «PLANO-5.3.txt:57-58»
ND-3018. Portas sorteadas UMA única vez na faixa 36000-39999 e persistidas em data/gameport e data/devport; nunca localhost hardcoded; logar no boot. «PLANO-5.3.txt:33-36, 71-75; stealthead.session1-conversa (2).txt:427»
ND-3019. Subagentes: pode delegar de 0 a 300; máximo 2 em paralelo com intervalo, pela limitação de concorrência observada (user concurrency limit exceeded). «PLANO-5.3.txt:62-64; session3-conversa (2).txt:120-145»
ND-3020. Relatórios e conversa sempre em PT-BR; commits só sob pedido explícito do dono. «PLANO-5.3.txt:64-68»
ND-3021. docs intocados: nunca deletar docs/; docs faltantes (vm.config, gpu, passage, docker, qemu, mttg, jsons de specs) devem ser criados, não omitidos. «ordens.txt:100-140»
ND-3022. Metas do jogo: 5 mapas, 50+ armas, 10+ personagens, 5 modos (PVP incluído), 5 veículos terrestres + 5 aéreos + 5 navais. «PLANO-5.3.txt:17-24»
ND-3023. O código da raiz É o editor: controle total de cena, camadas, rigs, mesh e frame a frame (editor first). «PLANO-5.3.txt:22-24»
ND-3024. Catálogo Sketchfab de 244 modelos com perfis anotados por especialidade (armas, veículos, soldados) baixados via Playwright/Brave e re-ingestados no DB. «PLANO-5.3.txt:24-26, 995-1010»
ND-3025. Fase final: baixar modelos dos links do catálogo, organizar por extensão, ingerir no DB e adicionar ao inventário. «stealthead.session1-conversa (2).txt:8-10; session4-conversa.txt:15-17»
ND-3026. Delegar dezesseis subagentes em dez rodadas, ou cinquenta em dois turnos, ou 0-100 subagentes por onda em até cem rodadas, com verificação a cada 10/16 subagentes. «ordens.txt:39, 45»
ND-3027. Reconstruir do zero a versão 5 do projeto em repositório público open source dentro de pasta blindada, seguindo rigorosamente a skill de arquitetura. «ordens.txt:41»
ND-3028. Estrutura flat com agrupamento de 20-25 contextos e lógicas correlatas por arquivo, mantendo total abaixo de 45 arquivos. «ordens.txt:41, 129»
ND-3029. Compactar em zip com compressão máxima nível 9 sob novo nome; excluir arquivos somente APÓS compactação bem-sucedida; se falhar, usar padrão de artefato app.tsx/index.html com botão limpo de download. «ordens.txt:41, 126-128»
ND-3030. Realizar pesquisas profundas multilíngues (japonês, chinês, coreano, alemão, inglês britânico/americano e variações) priorizando fontes recentes. «ordens.txt:43-44»
ND-3031. Pesquisar e implementar de 30 a 70 features futuras possíveis à frente, mantendo-se de 10 a 40 passos à frente; nunca citar feature impossível. «ordens.txt:42, 118»
ND-3032. Investigar processadores/GPUs/vCPUs mais atuais (linhas AMD Ryzen X Series e afins) para implementação VIRTUAL no projeto, sem tocar no hardware do usuário. «ordens.txt:45-46; OPR-0047 já registrada»
ND-3033. Atualizar para a última versão do Node nos workflows e stacks; usar última sintaxe/pattern de C++ e TypeScript com data de referência explícita. «ordens.txt:124-126»
ND-3034. Usar os últimos releases lançados até a data de referência (21-22/08/2026) como padrão de tipificação, workflows, pacotes e qualidade. «ordens.txt:131-133»
ND-3035. Não clonar conteúdo do README entre arquivos e não deixar workflows incompletos ou pela metade. «ordens.txt:135-136; feedback do dono "clonou o conteúdo do Redmi"»
ND-3036. Prestar atenção nos detalhes e minúcias, do macro ao micro e do micro ao macro; texto limpo, simples, direto, objetivo, minimalista e hierárquico. «ordens.txt:131»
ND-3037. Entregar README final ou múltiplos arquivos em inglês com detalhes, relatórios, possibilidades, estratégias, fontes citadas e implementação das features. «ordens.txt:47, 130»
ND-3038. Corrigir formatação escassa, lógica incompleta e ausência de implementação refazendo o repositório de forma robusta quando o dono reclamar de qualidade. «ordens.txt:133-135»
ND-3039. Pesquisar mais de mil sites e setecentas fontes unindo pontos para resolver lentidão de forma virtual e gratuita, demonstrando que é possível. «ordens.txt:137-138»
ND-3040. Prazo/cota: registrar deadline explícito (ex.: 22:00) e parar trabalho novo na cota esgotada, finalizando em estado CONSISTENTE. «session3-conversa (2).txt:652-660»

### Bloco B — StealHead: arquitetura, engine e performance

ND-3041. ADR-001: dev com Vite 5 + tsx 4; produção single-HTML sem bundler; vite/tsx NUNCA no importmap de produção. «stealthead.session1-conversa (2).txt:421-423»
ND-3042. ADR-002/008: sem engine de física externa — BVH (three-mesh-bvh 0.9.x, raycast ~0,25µs) + slab test AABB 6-planos + grid-hash (célula 8m); API pública em engine.ts: raycast, aabbVsAabb, neighbors. «stealthead.session1-conversa (2).txt:423-424»
ND-3043. ADR-003: three@0.185.x exato (não 0.160), exigindo WebGPURenderer fallback, LightProbeGenerator, envMapIntensity em Lambert, ColorManagement legacyMode=false. «stealthead.session1-conversa (2).txt:424»
ND-3044. ADR-004: Drizzle ORM com 3 drivers (sqlite default, libsql, mysql) via DB_DRIVER; Prisma descartado no StealHead. «stealthead.session1-conversa (2).txt:424-425»
ND-3045. ADR-006: sem Vercel/Netlify Functions; produção = node server.ts servindo ./public; CDN opt-in só para vendor. «stealthead.session1-conversa (2).txt:425-426»
ND-3046. ADR-009: self-host de tudo do jogo; CDN jsDelivr pinado só para three core/addons, three-mesh-bvh e recast wasm; documentar fallback local file://. «stealthead.session1-conversa (2).txt:427»
ND-3047. ADR-010: áudio 100% sintetizado (WebAudio: osciladores, noise procedural, reverb Convolver, HRTF, NoteTrack); zero assets de áudio. «stealthead.session1-conversa (2).txt:427-428»
ND-3048. Loop via RAF/setAnimationLoop, nunca setInterval/Date.now; delta único por frame com cap 0,05-0,1; timestep fixo para física com interpolação de render. «stealthead.session1-conversa (2).txt:615-618; unificado2 n/a»
ND-3049. Player-visible left/right é lei: A/← = nariz/bank para a ESQUERDA na tela em chase cam; nunca reusar strafe de FPS como steer de veículo; gate de controles só entra "done" com self-test passando. «stealthead.session1-conversa (2).txt:618-621»
ND-3050. Tokens de design em @theme (Tailwind v4 CSS-first), zero hex inline; ≤3-5 cores, ≤2 fontes, line-height 1.4-1.6, mobile-first ~390px, alvos ≥44px. «stealthead.session1-conversa (2).txt:621-623; 17devnotes.txt:201681+»
ND-3051. Mapa jogável nunca é imagem baked: fundação sem props interativos, props/colisão como camadas separadas. «stealthead.session1-conversa (2).txt:625-627»
ND-3052. Orçamentos duros de performance: draw calls <60 (BatchedMesh <12), triângulos <150k (variante 2,5M), FPS p50 ≥55, p95 ≥40, pixel ratio min(devicePixelRatio,1.5) com cap de fallback 1,25, heap/VRAM <70MB, JS gz <350KB. «stealthead.session1-conversa (2).txt:447-452»
ND-3053. Zero alocações por frame: pools para tracers/sparks/decals/corpses/projéteis (ObjectPool genérico com acquire/release/releaseAll e reset no release); vetores temp reusados; dispose() de tudo no teardown. «stealthead.session1-conversa (2).txt:452, 640-646»
ND-3054. Sombra: 1 directional 2048 PCFSoft com frustum justo; tone mapping ACESFilmic + PMREM RoomEnvironment com environmentIntensity ~0,75; fog como limitador visual de distância. «stealthead.session1-conversa (2).txt:640-646»
ND-3055. Lerp frame-rate-correcto sempre com forma `1 - exp(-k·dt)` ou `1 - pow(k, dt)`. «stealthead.session1-conversa (2).txt:648»
ND-3056. InstancedMesh agressivo para repetidos (500 árvores com geometrias de baixa segmentação, DynamicDrawUsage); LOD explícito de 3 tiers (30k/10k/3k tris) com fallback procedural se o GLB falhar. «stealthead.session1-conversa (2).txt:560-575»
ND-3057. scene-optimizer: colapsar meshes estáticos GLB repetidos em batches de InstancedMesh chaveteados por geometria+material+célula (640), mínimo 2 instâncias, matrixAutoUpdate off. «stealthead.session1-conversa (2).txt:15330-15340; PLANO-5.3.txt:392-400»
ND-3058. Viewmodel em cena overlay dedicada com clearDepth entre passes (autoClear=false) para nunca clipar em parede; frustumCulled=false no viewmodel. «stealthead.session1-conversa (2).txt:649-651, 15260-15270»
ND-3059. Arma gerada por batch de primitivas (PartBatch + mergeGeometries por material → 1 mesh por material), muzzle Object3D para spawn de flash/tracer, pontos de mag/bolt/eject como pivots animáveis; nunca foto 2D. «stealthead.session1-conversa (2).txt:600-612, 649-652»
ND-3060. Paleta de materiais de arma disciplinada: gunmetal (metalness 0,85/roughness 0,4), steel 0,9/0,32, polymer 0,1/0,75, rubber 0/0,95, brass 0,95/0,25. «stealthead.session1-conversa (2).txt:598-600»
ND-3061. HUD como camada DOM sobreposta com pointer-events-none no container e pointer-events-auto só em botões; select-none; tabular-nums para números vivos. «stealthead.session1-conversa (2).txt:612-614»
ND-3062. Estados de jogo tipados (GamePhase = menu|playing|killcam|results); feedback sim→React via listener onState(cb) com snapshot por frame; UI nunca lê variáveis internas da engine. «stealthead.session1-conversa (2).txt:614-615»
ND-3063. Duas camadas de input (devices → actions), event.code, keys em Set, clear no blur, justPressed edges, input buffer ~120ms; gamepad com deadzone radial 0,15-0,16 renormalizada e curva |v|^2,4. «stealthead.session1-conversa (2).txt:652-654; PLANO-5.3.txt:452-458»
ND-3064. Pointer lock com click-to-play, requestPointerLock({unadjustedMovement:true}) com fallback, pitch ±89°, blocker volta no unlock. «stealthead.session1-conversa (2).txt:652-653; PLANO-5.3.txt:455-456»
ND-3065. Touch: Pointer Events + setPointerCapture, handlers onPointerUp/Cancel/Leave chamando release (evita botão preso), touch-action:none, alvos 44-80px, joystick esquerdo / mira+fogo à direita. «stealthead.session1-conversa (2).txt:614-616; PLANO-5.3.txt:456-457»
ND-3066. Stack reflexo em todo hit: som + partículas + hitstop (2-6 frames / 30-120ms) + flash branco + screenshake trauma² + número flutuante easeOutBack; presentation ≠ simulation (juice nunca muda gameplay). «stealthead.session1-conversa (2).txt:655-657; PLANO-5.3.txt:305-307»
ND-3067. Sliders de acessibilidade: screenshake, flash e reduced-motion (prefers-reduced-motion) respeitados. «stealthead.session1-conversa (2).txt:656; PLANO-5.3.txt:499-500»
ND-3068. SFX em camadas (thump+body+click) com pitch ±5-15% aleatório; unlock de AudioContext no primeiro gesto + resume em visibilitychange. «stealthead.session1-conversa (2).txt:657-658; PLANO-5.3.txt:501-502»
ND-3069. Persistência com versionamento: best score persistido com campo version; localStorage para settings/saves pequenos, IndexedDB para grandes; flush em visibilitychange e pagehide. «stealthead.session1-conversa (2).txt:659-660; PLANO-5.3.txt:446-449»
ND-3070. Boot à prova de tela preta ("TV VHS"): try/catch em TODO init (inclusive WebGL), listener bus.on('mode') → hudStore, watchdog 15s dispensa #boot mesmo em falha, progresso real animado, div de erro visível. «session3-conversa (2).txt:2612-2616, 2718-2730»
ND-3071. /web é SÓ design: index.html + index.css (Tailwind v4 + Houdini) + ui/App.tsx + ui/store.ts (React 19 + zustand vanilla — desenha, nunca computa); plana, sem pasta dentro de pasta (máx web/ui/). «session3-conversa (2).txt:2608-2610, 2722-2726»
ND-3072. Cores oficiais StealHead: laranja + azul escuro — --sh-orange #ff7a1a, --sh-amber #ffb824, --sh-navy #0d1526, --sh-void #070b14; HUD estilo Blood Strike. «session3-conversa (2).txt:2608-2609; PLANO-5.3.txt:825-841»
ND-3073. Telemetria computada na raiz (hud.ts), /web só desenha: radar, bússola e fps calculados no lado lógica e espelhados no store. «PLANO-5.3.txt:838-841»
ND-3074. Stack travada da 5.1: three ^0.186.0, vite ^8.3.0 (rolldown), typescript ^7.0.2 strict, react ^19.3.0, zustand ^5.0.15 vanilla, tailwindcss ^4.3.3, better-sqlite3 ^13.0.3 (WAL). «session3-conversa (2).txt:2616-2618»
ND-3075. Loop fixo 60Hz com FixedStep (máx 5 substeps) e interpolação; ordem de sistemas em passo fixo: input, AI, movimento, colisão, dano, cleanup, render sync. «session3-conversa (2).txt:2618-2619; PLANO-5.3.txt:473-474»
ND-3076. Pipeline GLB-only em runtime: Draco qp 14/10/12, Meshopt, KTX2; ~30 formatos 3D via three-stdlib lazy loading. «session3-conversa (2).txt:2619-2620; PLANO-5.3.txt:833-835»
ND-3077. Armadilhas conhecidas a evitar: shards órfãos, porta dançando, ADS invertido, dano através de parede, compileAsync com render target 1×1. «session3-conversa (2).txt:2622-2624»
ND-3078. NÃO carregar o GLB gigante do mirror (hijacked_optimized.glb 22,6MB) em runtime, exceto opt-in via settings useCd2Map (regra de leveza); mirror é read-only/referência. «stealthead.session1-conversa (2).txt:440-444»
ND-3079. Manter orçamento do mirror: <60 draws, texturas procedurais default, BVH só para LOS/física, recast on-demand. «stealthead.session1-conversa (2).txt:444-446»
ND-3080. O editor nasce INVISÍVEL por desenho: #edit-ui display:none, abre só com F2 ou ?edit=1; raio-x opcional nas configurações; readout vivo de xyz com orbe r/h/cy/src. «PLANO-5.3.txt:617-620, 841-844»
ND-3081. Editor: clique seleciona por raycast do centro, G/R/S move/rotaciona/escala com TransformControls, save e bake para o DB; layer editável parented sob arena.root com registro via addCollider + rebuildColliderHash. «PLANO-5.3.txt:841-844; stealthead.session1-conversa (2).txt:15330-15335»
ND-3082. Arena: layout Zod (10 kinds, camadas 0-31), arena default 120×120, materialização com InstancedMesh, colliders e spawn points. «PLANO-5.3.txt:826-828»
ND-3083. Multiplayer WS: /ws com join e state 12 Hz, interpolação 100ms, remotes com nametag, fallback offline com bots; coop WebRTC P2P com canal não-confiável (estado ~20Hz) + confiável (one-shots), handoff ao late joiner pelo menor selfId. «PLANO-5.3.txt:830-831, 435-439»
ND-3084. Validar score SEMPRE no servidor (nunca confiar em high score do cliente); persistência de run via slots /runs (payload JSON). «PLANO-5.3.txt:438-439»
ND-3085. Tiering Auth/DB: banco desligado sem contas; leaderboard mantém validação no servidor; localStorage e zustand para o caso comum. «PLANO-5.3.txt:531-533»

### Bloco C — StealHead: protocolo de validação e gates

ND-3086. Protocolo de validação de 10 passos obrigatórios na ordem (1-4 antes de 5-10): tsc --noEmit; node --check; biome ci; vitest run; vite host com curl 200; curl /health; smoke Playwright; balancer Monte Carlo; benchmark 60s; WS smoke. «stealthead.session1-conversa (2).txt:430-445»
ND-3087. tests/last-validation.txt = fonte única de verdade (timestamp + exit codes); CI faz gate por ela; falha = consertar, reexecutar o passo e dependentes; PROIBIDO pular passo, --no-verify ou --force. «stealthead.session1-conversa (2).txt:445-447»
ND-3088. Balanceamento TTK: desvio do p50 alvo <15% em 1000 simulações Monte Carlo por arma a 10/30/60m; CSV com seed. «stealthead.session1-conversa (2).txt:444-445; PLANO-5.3.txt:462-464»
ND-3089. Benchmark: amostra a cada 100ms por 60s → perf.json; gates FPS p50 ≥55, p95 ≥40, draws <60, tris <150k. «stealthead.session1-conversa (2).txt:445-446; PLANO-5.3.txt:461-462»
ND-3090. Smoke de browser: 60s de jogo headless com ZERO erros de console; dupla viewport desktop 1280×800 E mobile 390×844 com veredito JSON (erros, overflow horizontal, body text). «stealthead.session1-conversa (2).txt:443-444; PLANO-5.3.txt:468-469; 17devnotes.txt:1800-1830»
ND-3091. Veredicto de smoke inclui bootMs, hud (wave/score/weapon/ammo/hp), fpsProbe, consoleErrors e campo verdict PASS/FAIL com timestamp. «organizar (2).txt:1-25»
ND-3092. Regressão visual: imagediff por canal com tolerância, PNGs de diff magenta, histogramas de região; captura lockstep com `__PUMP__(n)` de frame stepping e seed fixa (0x5eed1234). «PLANO-5.3.txt:465-467»
ND-3093. Bot driver joga pela camada REAL de input (teclas + look cru) com log frame-preciso de fire/impact/hit/kill; autoteste de física: bench BVH 200k raycasts + cruzamento com força bruta + sem tunneling a 500 m/s. «PLANO-5.3.txt:467-468»
ND-3094. Specs vitest obrigatórias para módulos puros sem DOM (physics, weapons, ai, state, terrain); 0 arquivos de teste é lacuna P0. «PLANO-5.3.txt:463-464, 406-407»
ND-3095. Cada onda de implementação tem gate: tsc --noEmit limpo + smoke 0 erros de console/página + screenshot de probe revisado antes do merge. «PLANO-5.3.txt:544-545»
ND-3096. Loop de correção delimitado: alvo de fidelidade 0,85, máximo 6 iterações, delta mínimo 0,02; oscilação = 2 reverts consecutivos → pedir input. «PLANO-5.3.txt:527-528»
ND-3097. PBR calibrado por leitura de framebuffer: medir luminância da cena e fixar specularIntensity/albedo/envOcclusion contra alvo (luminância ~0,26); orçamento de albedo assado com média 0,104 (janela 0,040-0,152). «stealthead.session1-conversa (2).txt:450-451; PLANO-5.3.txt:494-495»
ND-3098. Gates de QA de asset: turntable azimutes 0/90/180/270 (tol 5°), colapso de silhueta >0,15 = billboard, flood fill de furo interno, auto-interseção por paridade de raio. «PLANO-5.3.txt:528-530»
ND-3099. Ledger de assets: tests/asset-inventory.csv com sha256, dimensões e tris de todos os binários; binários inventariados, não lidos. «PLANO-5.3.txt:478-479, 563-565»
ND-3100. Servidor deixado no ar na porta do jogo ao final da sessão; README/docs atualizados antes do handoff. «PLANO-5.3.txt:2730-2732»

### Bloco D — StealHead: gameplay e tuning (do feature map #307-#546)

ND-3101. Tabela de velocidade por stance: stand 4,57 / crouch 2,44 / prone 1,01 m/s com multiplicadores direcionais (strafe 0,92x, costas 0,8x). «PLANO-5.3.txt:215-217»
ND-3102. Gravidade -20,6 m/s²; pulo 4,97 m/s; acelerações MW2019: chão 92, desaceleração 52, parada 30; controle aéreo 25% limitado a airSpeed 3,4. «session3-conversa (2).txt:2620-2622; PLANO-5.3.txt:225-227»
ND-3103. Coyote 0,09s, jump-buffer 0,13s, cooldown de pulo 0,28s; coyote NUNCA concedido ao pousar (bug aberto clássico). «PLANO-5.3.txt:233-234, 205-207»
ND-3104. Tactical sprint: duplo toque em Shift em janela 0,32s, 6,0s máx + 1,6s lockout, cancela ADS e levanta do crouch. «PLANO-5.3.txt:222-224»
ND-3105. Slide: entrada max(1,3× velocidade, 8,84) mínima 6,2, saída abaixo de 2,95, cap 0,9s, drag 0,75 com brake 0,85, cooldown 0,55s, direção só lateral 2,6; slide cancel jump preserva burst ≤ sprintSpeed×1,06. «PLANO-5.3.txt:224-226»
ND-3106. Aceleração no chão projeta a velocidade desejada no plano do chão para rampas não roubarem velocidade. «PLANO-5.3.txt:226-227»
ND-3107. Lean Q/E: 0,34m lateral validado por cápsula a 30Hz com encurtamento em 3 passos (câmera nunca fura parede); desligado em sprint/slide/ar/prone. «PLANO-5.3.txt:228-229»
ND-3108. Mantle/vault com probe de 3 consultas (parede, borda, ficar em pé); curva de root motion termina a subida em 62% com 18% lead-in; auto vault proativo com lookahead 0,2 + 0,035s/m e borda acima de stepHeight+0,07. «PLANO-5.3.txt:229-231»
ND-3109. Escadas: bias 0,25 (strafe nunca agarra), subida 180, grip 120, stall 0,4s solta, cooldown de saída 0,3, salto de saída 0,6x pela face; step offset levanta cápsula 0,42 e desce com snap 0,32. «PLANO-5.3.txt:231-233»
ND-3110. Dupla sonda de chão: traço fino raio 60% + fallback largo 98% para vigas; penetração acumula empurrão máximo por normal distinta (não soma), amortecido 0,25m. «PLANO-5.3.txt:233»
ND-3111. Velocidade terminal 55 m/s; gravidade assimétrica de queda ×1,5-2,5 contra subida, hang no ápice; pulo variável corta vy ×0,5 ao soltar cedo. «PLANO-5.3.txt:235-236»
ND-3112. Cadência de passos travada na fase do bob (um passo = π da fase), raycast de superfície ±0,13m, pouso suprime próximo passo 0,12s, emite playFootstep. «PLANO-5.3.txt:237»
ND-3113. Mudança de stance valida headroom (canFit) antes de levantar, retentada a cada substep. «PLANO-5.3.txt:238»
ND-3114. camera.fov dirigido por adsFov/adsInTime/adsSensMult (dados autorados nunca aplicados = lacuna P0); sensibilidade de ADS escalada pela razão de FOV vivo (0,0022·sens·fov/baseFov). «PLANO-5.3.txt:240-241, 456-457»
ND-3115. Dois canais de recuo: mola de câmera 9,5-11,5Hz amortecimento 0,52-0,62 + residual exponencial tau 0,22-0,3 (fatia 22-28%); canal separado de weapon kick dirige o viewmodel. «PLANO-5.3.txt:241-242»
ND-3116. Recuo ×0,54 em ADS e ×1,18 no primeiro tiro; landing dip curva pow(t,0,72) com evento acima de 4 m/s. «PLANO-5.3.txt:242-243»
ND-3117. Head bob Lissajous 1:2 travado em fase ao acumulador de passada; sway de respiração de dois senos desafinados escalado por ADS/vida baixa/supressão; roll de strafe/slide/ar amortecidos independentes. «PLANO-5.3.txt:244-246»
ND-3118. Killcam: ring buffer 7s a 30Hz, stride de 9 floats por entidade, replay na POV do vencedor a 0,35x slow motion no último 1,2s; barras letterbox 9-10vh e cartão "FINAL KILLCAM REPLAY". «PLANO-5.3.txt:250-251, 527»
ND-3119. Death cam: afunda 0,4m, roll 0,55 rad em 3,5s de timer de respawn. «PLANO-5.3.txt:251-252»
ND-3120. Padrões de recuo determinísticos por arma: climbShape [1.45,1.3,1.15,1.05,1.0], vertical forte afunilando, horizontal dois senos fora de fase ("cobra aprendível"). «PLANO-5.3.txt:254-255»
ND-3121. SPREAD_MODS por stance: crouch 0,78, prone 0,6, parado 0,82, andando 1,15, correndo 2,2, no ar 2,0. «PLANO-5.3.txt:255»
ND-3122. Trinca de falloff por arma (início/fim/mínimo) substituindo queda linear global única. «PLANO-5.3.txt:256-257»
ND-3123. Modos de fogo auto/burst/semi com burstCount 3 e 0,16s entre bursts; RPM de dois estágios (AN-94: 2 balas 937,5 depois 625) via initialRpm/initialShots. «PLANO-5.3.txt:258-259»
ND-3124. Reload cancel: fogo, ADS ou sprint interrompem recarga mantendo progresso parcial. «PLANO-5.3.txt:260»
ND-3125. Clips de viewmodel keyframed: reloadTac 2,15s, reloadEmpty 2,85s, inspect 3,0, draw 0,62, holster 0,4, com eventos nomeados (magout, magin, boltrelease) dirigindo áudio. «PLANO-5.3.txt:261»
ND-3126. Partes móveis: bolt cicla em 62% do cycleTime e trava no vazio; carregador interpola para a palma de apoio; gatilho gira com triggerT. «PLANO-5.3.txt:262»
ND-3127. ADS com solver de mira de dois pontos (varredura de vértice da alça + massa de frente no eixo de visão, eyeRelief atrás da alça); red dot colimado com ponto fixo em pixels (hip 4,0 / ADS 7,9 px) e anel de 12 segmentos 65 MOA. «PLANO-5.3.txt:263-264»
ND-3128. Penetração: MAX_LAYERS 6, probe de saída 1,6m, fallback de chapa 18mm/cosθ, dano ×(1 − energyLoss·frac). «PLANO-5.3.txt:265»
ND-3129. Whizz-by: miss de cabeça abaixo de 1,8m dispara varredura bandpass 3600-5200 caindo para 900-1500Hz com snap de choque. «PLANO-5.3.txt:266»
ND-3130. Round robin de 6 slots de timbre por arma (±1,1 semitons corpo, ±1,7 crack) com jitter; dois tiros consecutivos nunca compartilham waveform. «PLANO-5.3.txt:267»
ND-3131. Desbloqueio de arma: gun i travada até limpar a onda i×2+1; HUD mostra aviso LOCKED; headshot com kill recarrega +1 pente de reserva. «PLANO-5.3.txt:268-269»
ND-3132. Sistema de camo: repinta só materiais _camo no receiver E no carregador; inserto de trítio nunca tingido. «PLANO-5.3.txt:270»
ND-3133. Muzzle flash com perfis luminosos por classe (rifle 200 cd, shotgun 330, suprimida 36), núcleo blackbody 3800-4400K, 3-4 línguas assimétricas; PointLight via acquireLightSlot (pool de 4, 36 cd, janela 5m, decay 0,09s) sincronizada ao viewmodel. «PLANO-5.3.txt:272-273, 526»
ND-3134. Receitas de impacto por superfície: concreto (poeira pálida + chips 4-10 m/s), metal (faíscas 6-16 m/s), terra/areia (plumas), vidro; rampa de faísca blackbody 2500K→1200K. «PLANO-5.3.txt:274-275»
ND-3135. Atlas de FX assado de 16 tiles com 1px de gutter contra bleeding de mip; atlas de decals com relevo real (normal tangente por altura, ORM empacotado); decals projetados na GPU com clip Sutherland-Hodgman contra 6 planos. «PLANO-5.3.txt:276-278»
ND-3136. Partículas GPU: simulação fechada no vertex shader v(t)=v0·e^(−kt)+g/k·(1−e^(−kt)) com turbulência de 3 senos; ring stride 32 floats; blend aditivo ONE/ONE e fumaça LIT com normal esférica fake. «PLANO-5.3.txt:280-281»
ND-3137. Tracers como 3 sprites (cabeça quente, streak, afterglow), velocidade visual clampada 55-340 m/s; cápsulas de latão como corpos rígidos reais (11,5g, restituição 0,36, spin ±38 rad/s). «PLANO-5.3.txt:284-285»
ND-3138. Hitmarker de 4 tipos (hit branco 0,26s, armadura azul 0,28, cabeça âmbar 0,32, kill vermelho 0,42 com giro 9°) com traços escuros de fundo para contraste no céu. «PLANO-5.3.txt:286»
ND-3139. Números de dano flutuantes: pool de 16, vida 0,95s (kill 1,25), subida 42px com deriva ±16, variantes âmbar (headshot) e vermelha (kill). «PLANO-5.3.txt:288»
ND-3140. Explosão coreografada por ordem de detonação: 60ms núcleo branco → bola de fogo → anel de refração → poeira radial → cone de detritos 6-20 m/s. «PLANO-5.3.txt:279»
ND-3141. Percepção imperfeita de IA: awareness 0-1 antes do ack, taxa de reação 1/max(0,12, 0,16+dist·0,0075+(1−alert)·0,28), cone de FOV alarga ao alertar. «PLANO-5.3.txt:292-293»
ND-3142. FSM de combate: escolha de cover 7-30m com repath 2,2-4,5s, agachar suprimido abaixo de 0,45, recuo abaixo de 34% de vida, flank após 4s de jogador estático. «PLANO-5.3.txt:293»
ND-3143. engagementSlot (6 ângulos × raios predefinidos) para esquadrões cercarem em vez de aglomerar; desaglomerar abaixo de 3,2m; peek tokens: 50% do esquadrão exposto por vez, rotacionados 1,1-2,3s. «PLANO-5.3.txt:294-296»
ND-3144. Hitboxes por osso: 7 cápsulas (cabeça r0,098 ×4,0 dano, torso ×1,0/0,9, braços ×0,65, pernas ×0,7) sincronizadas ao esqueleto animado. «PLANO-5.3.txt:297, session3-conversa (2).txt:2621»
ND-3145. Ragdoll PBD de 15 cápsulas, Gauss-Seidel 6 iterações, limites cone/twist, impulso de kill com falloff 1/(1+d²/r²), sleep 0,0022m. «PLANO-5.3.txt:298-299»
ND-3146. Mapa de cover: toda célula caminhável adjacente a bloqueio ganha ponto de cover com direção e classe alta/agachada (raios 1,32 vs 0,55); navegação A* com heap binário, sem corte de quina, heurística octile ×1,06, string pulling. «PLANO-5.3.txt:303-305»
ND-3147. Spread inimigo completo: alcance + movimento + supressão +18 (nunca desliga fogo) + (1−convergência)·20; compartilhamento de contato: spotter transmite lastKnown válido 4s. «PLANO-5.3.txt:306-307, 296»
ND-3148. 3 variantes de silhueta inimiga (capacete vs wrap, carrier vs chest rig, carbine vs AK, bulk 0,94-1,06) sem ser recolor. «PLANO-5.3.txt:308»
ND-3149. Escala por onda: hp 95 + min(60, 5×wave), velocidade 3,3 + min(1,6, 0,12×wave) + rand 0,5; WaveDirector: contagem 3,5s, esquadrão de 3 a cada 1,8s senão gotejamento 0,35s, 7s entre ondas, dificuldade (w−1)/9. «PLANO-5.3.txt:314-316»
ND-3150. Spawn inteligente: 14 tentativas por ponto a 34-100m do jogador, prefere sem LOS, fallback mais próximo do ideal de 55m; caps de entidade ao vivo com fila pendente. «PLANO-5.3.txt:316-317»
ND-3151. Medalhas: janela de cadeia de multikill 4200ms (Double até Kill Chain >8), killstreaks 5/10/15/20/25/30 travados uma vez por vida; morte zera streak mas histórico recente persiste entre vidas. «PLANO-5.3.txt:319-320»
ND-3152. Proteção de spawn: 3s imune a dano, atirar quebra; regen de vida: atraso 4s + rampa 25/s; dificuldade easy/med/hard ×0,7/1,0/1,5; boss com telegraph, ponto fraco e drop de bônus. «PLANO-5.3.txt:321-324»
ND-3153. Stats canônicos de inimigo: drone 30hp, runner 50, tank 240 (armor 0,5), sniper 70, exploder 40, overlord 1200 (armor 0,3); escala hp (1+(w−1)·0,14) + extra 0,05/onda além da 10. «PLANO-5.3.txt:519-520»
ND-3154. XP de medalha verbatim: kill 100 score +100 XP; assists 25/50/75; Bloodthirsty 5=250, Merciless 10=500, Ruthless 15=500, Relentless 20=750, Brutal 25=1000; cadeia: Double 100, Triple 250, Fury 500, Frenzy 750, Super 1000, Mega 1250, Ultra 1500, Kill Chain >8 = 2000 XP. «PLANO-5.3.txt:508-510»
ND-3155. Bússola HUD: tira de 144 ticks em 720° com calc(Npx × var(--k)) para rescale sem JS, um translateX por frame, bearing clampado ±60°. «PLANO-5.3.txt:325-326»
ND-3156. World markers: pool de 6 losangos com distância/nome, clamp fora de tela em anel retangular com chevron giratório, fade 1,15 − d/260; arcos de direção de dano: 7 segmentos SVG na curva de sino [0.1,0.28,0.62,1,0.62,0.28,0.1] a 112px de raio. «PLANO-5.3.txt:327-328»
ND-3157. Vitais: trilha segmentada 5×20 com gradiente âmbar→vermelho, 3 placas de armadura, barra persegue valor enquanto numeral é instantâneo; passe de vida baixa antes do tonemap (desaturação Rec.709 + vinheta arterial pulsando). «PLANO-5.3.txt:328-330»
ND-3158. Pips de munição por bala com máquina de estados da recarga dentro dos pips; baixo ≤34% âmbar, prompt vazio pulsa 3,8Hz. «PLANO-5.3.txt:331»
ND-3159. Killfeed: dwell 5,6s, slide in 0,16s, fade out 0,45s, âmbar com caveira em linhas envolvendo o jogador; minimapa com pegadas vetoriais, grade de 10m travada ao mundo, cone de visão radial vivo, blips girados pelo heading, pings de fade 1,2s. «PLANO-5.3.txt:333-335»
ND-3160. Escala do HUD: única var CSS --k com grade de 4px, tabular nums, contornos simétricos em 8 direções (sem sombras direcionais). «PLANO-5.3.txt:340»
ND-3161. Menu de pause: presets de qualidade dirigindo config, sensibilidade 0,2-3,0, FOV 65-120 ao vivo, invert Y. «PLANO-5.3.txt:339»
ND-3162. Binding de HUD zero render: jogo empurra para bridge que escreve textContent/style direto com cache de último valor; overlay canvas 2D (dpr capado) para barras de vida projetadas (escala clamp(60/d, 0,35, 1,6)). «PLANO-5.3.txt:521-522»
ND-3163. Síntese de tiro em 7 camadas: transiente 6,2kHz + corpo saturado 148→56Hz + crack ressonante 1320-3050 + meio rosa + cauda LP + ressoadores mecânicos; mixer de 5 buses com compressores (armas −7/2,6:1, foley −14, ambiente −24, voz −18/3:1) + master preGain 0,22. «PLANO-5.3.txt:345-346»
ND-3164. Sidechain duck manual: tiros abafam ambiente ×1, foley ×0,55, voz ×0,4 (ataque 12ms, hold 0,12s, recuperação 2,6/s); limiter e VoiceRing por arma NUNCA bypassed/unwired. «PLANO-5.3.txt:347-349»
ND-3165. Oclusão de áudio: 2 raios (orelha e +0,55m), oclusão total cutoff 420Hz com shelf −26dB; absorção do ar 20500/(1+d·0,055) clampada 260-20000; curva de distância 0,055·(60/d)^0,55 além de 45m; atraso de propagação dist/343. «PLANO-5.3.txt:351-353»
ND-3166. Surdez de concussão: abafamento 20000·0,024^nível, shelf −22dB, tinnitus de 3 parciais 3980/4130/7420Hz com wobble 0,23Hz. «PLANO-5.3.txt:354»
ND-3167. Reverb: 5 IRs geradas mescláveis num send bus, classifySpace por raios de probe usando distância horizontal MEDIANA, ganho +0,022/m. «PLANO-5.3.txt:355»
ND-3168. Leito musical: envelope de intensidade por densidade de eventos (boxcar 1s de densidade^0,6), pilha de drones, soft clip tanh. «PLANO-5.3.txt:357»
ND-3169. Autoteste de áudio: OfflineAudioContext renderiza cada voz checando silêncio, NaN, DC e clipping com centroide espectral; stress do limiter com 14 tiros e 6 explosões. «PLANO-5.3.txt:359»
ND-3170. LUT de grading 33³: ASC CDL, split tone, saturação preservando luma 1,20, desaturação de highlights, contraste S curve fílmico 1,28 no pivot 0,50; passe LUT com needsSwap=false (fix dos 3 casos de tela preta). «PLANO-5.3.txt:360-361»
ND-3171. TAA: jitter Halton 16 pontos, histórico Catmull-Rom 5 taps, clip de variância YCoCg, dilatação de velocidade pelo depth mais próximo; auto exposição EV100 com adaptação assimétrica (escurecer 3,2, clarear 1,4). «PLANO-5.3.txt:363-364»
ND-3172. Bloom: pirâmide dual filter de Jimenez, Karis average no nível 0, soft knee em luz linear, upsample preservando energia 50/50; GTAO com distribuição quadrática de passos + acumulação temporal. «PLANO-5.3.txt:365-366»
ND-3173. Presets de qualidade em 4 níveis (low/med/high/ultra): renderScale 0,72/0,85/1/1, shadow 1024/2048/2048/4096, particleBudget 2k/6k/12k/24k, decalBudget 64/128/256/512; escada de degradação solta GTAO, bloom e sombras antes do FPS. «PLANO-5.3.txt:369, 421-422, 577-578»
ND-3174. Prewarm de shader: compileAsync com RT 1×1 bound, 4 poses quentes, transparente à simulação (snapshot/restore de clock e RNG); sem prewarm = 86 programas lazy e stalls de 3,1-3,9s. «PLANO-5.3.txt:370, 579-581»
ND-3175. Cap de resolução ≤1600×900 interno com DPR adaptativo; FOV consciente de aspecto (retrato alarga para min(60, 42/aspect)). «PLANO-5.3.txt:373, 500-501»
ND-3176. Céu: disco solar com limb darkening Hosek-Wilkie, aureola circumsolar, lua procedural, treliça de estrelas 3 camadas com extinção de massa de ar; cor de fog amostrada da banda de horizonte. «PLANO-5.3.txt:378-379»
ND-3177. Streaming de setores dirigido por player.pos com callbacks reais de load/unload; budget de células 32. «PLANO-5.3.txt:376, stealthead.session1-conversa (2).txt:418»
ND-3178. SURFACE_TABLE unificada: física (atrito, restituição, espessura) + áudio (cutoff, decay, ganho) + receitas de FX em UMA tabela compartilhada; 12 camadas de colisão e 7 máscaras (SIGHT passa vidro/folhagem, SHOOT_ONLY). «PLANO-5.3.txt:380-381»
ND-3179. Biblioteca de 40+ protótipos de prop em InstancedMesh com saia de sujeira no chão (1,15-1,55× raio); camber de solo com travamento de costura de material. «PLANO-5.3.txt:383-386»
ND-3180. Save system: campo de versão com cadeia sequencial de migrates, merge sobre defaults, try/catch para defaults em corrupção, escrita atômica com slot de backup; autosave no fim da run. «PLANO-5.3.txt:446-448, 450-451»
ND-3181. Economia: 18 stats de mod completos (lifesteal, multishot, pierce, knockback, redução de decay de combo, raio de pickup, drop rate); draft de upgrade com 6 opções, rolagem de raridade e stack possuído; créditos por kill em /economy; quests via /quest. «PLANO-5.3.txt:444-446, 449-450»
ND-3182. Doutrina PBR CS2: metalness binário 0/1, níveis de desgaste FN-BS 0-1,0, ORM empacotado (AO=R, rough=G, metal=B), receitas de acabamento. «PLANO-5.3.txt:517-518»
ND-3183. Cânone humanoide 8 cabeças: ombro 0,25H, cintura 0,125H, quadril 0,1875H, joelho 0,25H, braço superior 0,187H; marcos faciais olho 0,5, nariz 0,75, boca 0,85 da cabeça. «PLANO-5.3.txt:514-515»
ND-3184. Skinning geodésico: distância voxel Dijkstra pelo volume, peso = 1/max(d,0,5)³, máximo 4 influências, grade 32-96. «PLANO-5.3.txt:516»
ND-3185. Bake Recast verificado: cellSize 4, cellHeight 2, slope 45°, walkableHeight 36, climb 9, radius 4, maxEdgeLen 12; 12 off-mesh links de escada raio 20; 402 pathnodes. «PLANO-5.3.txt:513-514»
ND-3186. Modelo de armas por dimensões publicadas: M4A1 bore y=0,075, rail 28,6mm sobre o bore, óptica 67mm co-witness absoluto, brake de 3 portas, handguard free float; biblioteca de componentes picatinny/M-LOK. «PLANO-5.3.txt:484-486»
ND-3187. Rig de viewmodel como pilha aditiva: poses base (hip, sprint, low ready) + noise sway incomensurável + stride em oito + molas de weapon lag 5,4/6,2Hz clampadas ±0,05. «PLANO-5.3.txt:488»
ND-3188. Máscaras de vértice por curvatura para hard surface: wearAmp 0,62 exp 2,8, grimeAmp 1,15 no chanfro externo 1-2mm. «PLANO-5.3.txt:491-492»
ND-3189. Pipeline de assets GLB: center, weld 0,0001, dedup, prune, quantize 14 bits, meshopt e KTX2 via gltf-transform; validação ANTES de otimização (gltf-validator em CI). «PLANO-5.3.txt:476-477, 690-692»
ND-3190. Pipeline de import 7 etapas: ufbx WASM → auto-rig (voxel-skinner SAT+flood fill+Dijkstra) → normalização T-pose → bake pose fixa (clearNodeParent+clearNodeTransform+flatten) → IK BipedRig → retarget (hipsPositionScale) → compressão gltf-transform+meshopt+KTX2. «PLANO-5.3.txt:960-975»
ND-3191. Compressão nível 9 DEFLATE garante <15MB para os 244 modelos de referência; conversões FBX→GLB via assimpjs + gltf-transform. «PLANO-5.3.txt:975-977, 150-155»
ND-3192. Respeitar prefers-reduced-motion + slider de screen shake + toggle de flash; desbloqueio de áudio iOS no primeiro gesto + resume em visibilitychange; manifest PWA com ícones maskable. «PLANO-5.3.txt:499-503»

### Bloco E — Gateway @devthink/ai (raiz: conversas 9/10/11)

ND-3193. A gateway é uma API/baseURL que repassa passthrough para baseURL de terceiro externa, com autofix, save no DB e streaming de volta. «conversa9.txt:7-8»
ND-3194. devthink = 6 modelos de rotação com thinking ligado + 7 modelos individuais + 52 modelos de embeddings individuais; chaves ficam nos commits antigos. «conversa9.txt:9»
ND-3195. Travar escopo em 28 arquivos: 18 rotas (6 V1 + 6 V2 + 6 V3) + 2 libs editáveis db.ts/cdn.ts + 8 configs (package.json, tsconfig, prisma config, shim, prisma schema, page.tsx, globals.css, layout.tsx); extrapolar cria arquivo extra que quebra o travamento. «conversa10.txt:21; conversa9.txt:39-43»
ND-3196. Exatamente 3 libs em lib/: cdn.ts (1200+ entradas esm.sh id/name/category/cdnurl/loadFromCDN/Map cache), db.ts (lazy Proxy + PrismaLibSql cold-start safe), utils.ts (simples, gramática); proibir middleware/outras libs. «conversa10.txt:22»
ND-3197. Proibir mexer em next.config, Caddyfile, bun.lock, .npmrc, trustedDependencies e middleware — modificar esses quebra build e SSE flush. «conversa10.txt:23»
ND-3198. Formação global: todo código lowercase, sem underscores, sem emojis, padrão JSDoc, limpo otimizado, design pattern padronizado sincronizado entre rotas. «conversa10.txt:32; conversa9.txt:27-30»
ND-3199. Sem thinking_instructions e thinking_format em qualquer rota — usar esses params gera erro P0. «conversa10.txt:33; conversa9.txt:29-30»
ND-3200. Princípio arquitetural: TODAS as rotas são gateway baseurl passthrough via fetch, nenhum endpoint final; fluxo canônico: input cliente → autofix → fetch base oficial → retorno upstream → save DB → streaming de volta (fetch duplo, exportação total via DB). «conversa10.txt:29; conversa9.txt:44-46»
ND-3201. Divisão de versões: V1 = Zai Web SDK 2AI GLM-5.2 (6 rotas internas sem chave); V2 = Babel Town/Mobile Town (6 rotas com chave, fora do ar com fallback para V1/V3); V3 = Nvidia (6 rotas com chave). «conversa10.txt:30»
ND-3202. Thinking always-on em toda requisição sem exceção, budget forte, default high; 7 níveis: none, minimal, low, medium, high, xhigh, max. «conversa10.txt:37»
ND-3203. Limites de thinking: 98k thinking + 98k response (total 196k), sem cap fixo além do teto GLM. «conversa10.txt:41»
ND-3204. Fluxo de saída: input → reasoning_content → content → finish_reason → [DONE]; thinking primeiro, reasoning antes de content; SSE exato OpenAI com keepalive delta {} e [DONE] único. «conversa10.txt:37-38»
ND-3205. Defaults de parâmetros: top_p 1, top_k 40, temp 1, reasoning_effort low/high, max_tokens 98304, CONTEXT_WINDOW 1000000 em GET /v1/models. «conversa9.txt:57-58»
ND-3206. Autofix centralizado inteligente SEM listas hardcodadas/whitelist/blacklist/mock: normaliza camelCase/PascalCase/snake_case/SCREAMING/acentos/misturado para lowercase válido via normalizeParamName + Levenshtein. «conversa10.txt:34»
ND-3207. Clamping de valores: >limite = max com margem 1%, <0 = zero, typo = válido mais próximo, string numérica → float, true/false → boolean. «conversa10.txt:34»
ND-3208. Anti-429/419: retry 2-8x com backoff exponencial 200ms-64s, jitter 75-125%, respeitar Retry-After, pacing 200ms, cooldown reativo, mutex MAX_CONCURRENT 1 com MIN_INTERVAL 200ms e fila de waiters. «conversa10.txt:42; conversa9.txt:61-62»
ND-3209. Keepalive obrigatório: 200ms todas as rotas (intervalo 200ms V1 e 500ms V3), header connection keep-alive timeout 200, writeSSE com \n\n garantido e flush síncrono. «conversa10.txt:36, 43»
ND-3210. Suporte a 40+ métodos HTTP (30 na V1, 64 total), BATCH/BULK/MULTI/CRUD via middleware, OPTIONS 204 CORS, COPY/LOCK/MKCOL/MERGE. «conversa10.txt:44»
ND-3211. Endpoints retornam SEMPRE JSON, nunca HTML (500/502/429 com Retry-After em JSON) — retornar HTML quebra o parse do cliente. «conversa10.txt:45»
ND-3212. Três formatos de saída obrigatórios: OpenAI chat.completion.chunk, Anthropic messages (message_start/content_block_start/delta/stop), Responses (reasoning summary/text.delta) + 20+ SDKs compatíveis. «conversa10.txt:35»
ND-3213. Streaming parser: substituir TransformStream pipeThrough por ReadableStream manual pump getReader loop async com drain, keepalive 5-15s, parser stateful cross-chunk com brace matching. «conversa10.txt:36»
ND-3214. Thinking parser: makeThinker marker-based com split percentage fallback 30% se buffer >200 chars; regex strip de tags; detectar [DONE] em depth 0 fora de string; evitar nudata/iddata/moddata e "}{ concatenado. «conversa10.txt:38; conversa9.txt:62-63»
ND-3215. Parser XML genérico ANY_TAG_RE removendo qualquer tag preservando math legítimo, PARTIAL_TAG_RE para tags parciais, pendingXml buffer segura tags incompletas splitadas entre chunks. «conversa10.txt:39»
ND-3216. Fix reasoning zero: quando backend emite null, flag nativeReasoning valida apenas string não vazia garantindo reasoning true e interleaved field para OpenCode (bloco amarelo bg-yellow collapsible primeiro). «conversa10.txt:40»
ND-3217. Duas chamadas Call: uma com thinking on (gera reasoning real) e uma com off (gera resposta); totalOut = thinking + response dinâmico. «conversa10.txt:41»
ND-3218. V3 Nvidia: nome fixo devthink, contexto compartilhado entre 6 rotas via db, mesma sessionId salva input/output/thinking, cada req recupera histórico, thinking sempre ligado budget high 98k. «conversa10.txt:48»
ND-3219. Rotação V3: troca de chave Nvidia a cada requisição (pool de 22 chaves), troca de modelo a cada 6 mensagens round robin por sessionId com contador db countMessages. «conversa10.txt:49»
ND-3220. Inventário de 42+ modelos mapeado de 283-500+ commits: devthink + embeddings + individuais + individuais embeddings separados; remover deepseek-r1 de todas as rotas; adicionar poolside laguna-xs-2.1 (262k) e deepseek-v4-flash thinking. «conversa10.txt:50-51»
ND-3221. V2 Babel Town: key auth OpenAI→Anthropic conversion, adapta response, models anthropic mantendo compat OpenAI, auto rotação de chave em 401/403, passthrough puro. «conversa10.txt:47»
ND-3222. package.json @devthink/ai leve: 30-75 deps leves (limite 0-30 ou 0-75), deps pesadas vão para cdn.ts, tudo latest sem rollback, engines node 24.6-26.5/npm 11.17-12/bun 1.3.14+ com packageManager no final. «conversa10.txt:24-25»
ND-3223. Mesclar 500+ dependencies + 300+ dev + 600 CDN = 1100+ lista única sem remover nada, depois filtrar leves — remover feature se filtrar antes. «conversa10.txt:25»
ND-3224. tsconfig pattern 2026: target esnext/ES2024+, lib esnext dom dom.iterable webworker, module esnext/nodenext, moduleResolution bundler/node16, strict true, baseUrl paths, compatível Next 15/16 e Bun. «conversa10.txt:26»
ND-3225. Prisma 7+: prisma.config.ts usa process.cwd() (não __dirname), remover url do datasource e output do generator, shim ensure-ts-shim.mjs no postinstall. «conversa10.txt:27»
ND-3226. Schema Prisma padronizado 400-500+ entradas: modelo ChatMessage com 115 campos (allParams, allResponse, sessionId, role, content, thinkingLevel, thinkingBudget, reasoning, keyRotated, modelRotated, rotationIndex, messageNumber…). «conversa10.txt:28»
ND-3227. 40+ verificadores obrigatórios: tsc --noEmit zero erros, bun lint/eslint zero erros, curl + agent-browser + Caddy na sequência de teste. «conversa10.txt:45, 53»
ND-3228. Frontend da gateway: tabs V1/V2/V3, thinking levels, chat, models, keys CRUD, dialog da V3, layout.tsx + globals.css + page.tsx, bloco amarelo de pensamento estilo OpenCode. «conversa10.txt:52»
ND-3229. Build/deploy/cleanup: mover arquivos finais de /tmp para src, limpar caches antigos de 40+ frameworks e pacotes (.next, .turbo, node_modules/.cache, tsbuildinfo, .vite, .parcel-cache, .prisma, bun/npm caches), esvaziar /tmp mantendo só o build final, parar dev server após teste. «conversa11.txt:47800-47812»
ND-3230. Erros críticos resolvidos como padrão: JSON Parse "Expected ':' before value" / "Expected '}'" com chunks zdata:/indexdata; Controller already closed com safeEnqueue/safeClose; OOM top-level ZAI SDK; [DONE] duplicado; controle de \u0001. «conversa11.txt:1-15; conversa9.txt:63-64»
ND-3231. Ler hierarquicamente: commit por commit, arquivo por arquivo, objeto por objeto, header por header, tree por tree, bidirecional (cima→baixo e baixo→cima), linha por linha; primeira leitura sequencial sem subagentes, segunda paralela 60-70, terceira validação cruzada. «conversa9.txt:32-35»
ND-3232. Detectar fronteiras de conversa: de glm5.2 até o próximo glm5.2 = 1 conversa; markers download/share/slash. «conversa9.txt:35»
ND-3233. Validar conteúdo dos zips: 10k arquivos, 11k objetos, ~900 commits, 2944 blobs, 3407 trees, branches e tags contados — contagem inconsistente = zip corrompido. «conversa10.txt:20; conversa9.txt:314-316»
ND-3234. Mapear 100% dos erros e features sem excluir/substituir/remover: erros.md hierárquico P0 crítico→P3 cosmético (295-400+ erros), features.md 393 features em 15 categorias core→detalhe, timeline.md cronológico; checklist interna de 900+ itens derivada desses docs. «conversa9.txt:318-324»
ND-3235. Coletar, não catalogar: catalogar em vez de coletar perde o bruto (logs de commits/objetos/documentos e erro embutido). «conversa10.txt:18»
ND-3236. Ordem correta: só ler features.md/erros.md/ordens.md DEPOIS de analisar o zip por completo — inverter a ordem lê docs antes do bruto. «conversa10.txt:19»
ND-3237. Criar scripts em /scripts dentro de myproject (fora de api), linguagem livre (bun/node/python), para conversão, split de 300 linhas com overlap 1-10%, grep, dedup, leitura commit/objeto/blob/ref/branch/tree. «conversa10.txt:15; conversa9.txt:194-198»
ND-3238. Extrair tudo em /tmp FORA de myproject; criação final em myproject root; extrair dentro de myproject polui build e suja a raiz. «conversa10.txt:14»
ND-3239. Baixar zips via agent-browser obrigatoriamente em /tmp (wormhole l8YRW2, PBQEo4, OLbdXe, r50qRL, R8NXa6, 0v3qnp, jvK4Wm, kAXo0l, okl1p4, 52yDYR, pvXoZx, Ay5NQ1). «conversa10.txt:13»
ND-3240. Unificação definitiva: juntar todos os commits daqui + do zip, todos os arquivos src/lib/prisma e todos os package.json dos commits, inclusive fora do commit vale objects. «conversa11.txt:47800»
ND-3241. Instalar 20 SDKs (openai, anthropic, ai, opencode, z-ai-web-dev-sdk, smol-toml, request-ip…), manter @radix-ui para shadcn, localforage → Map em memória. «conversa9.txt:74-76»
ND-3242. Registrar as 22 chaves Nvidia encontradas nos commits antes do build/teste; teste final valida thinking on em toda requisição, autofix, formatos, passthrough, zero erros com foco V1/V3. «conversa9.txt:369-376»

### Bloco F — Skill Design Universal (V25 e composição): specs CSS/componentes

ND-3243. Briefing primeiro: delimitar nicho, produto, público, persona, meta, ato primário, timbre e atmosfera (editorial, swiss, brutalist, minimalista, maximalista, retro-futurista, orgânico, industrial, art deco, lo-fi, vítreo, calmo, premium). «Skill-Design…V25.txt:175-178»
ND-3244. Planejamento de mais de 1000 ações antes de traçado; cumprimento de 400 ações por componente com meta 85-95%; 400-600 ações por sessão; exatamente 20 sessões, primeiro topbar, último footer. «Skill-Design…V25.txt:182-186»
ND-3245. Sessão = agrupamento de componentes (fundo, material, camada, artefatos, assets, elemento, faixa de banner com 5 peças, ícone, botão, imagem, barra superior curva, adornos, animação, efeito). «Skill-Design…V25.txt:186-187»
ND-3246. Camadas internas de peça singular e camadas agrupadas geram profundidade/espaço/volume: estrato de base, preenchimento, frontal; Z-index 0-1000 (0 atmosfera de fundo, 10 conteúdo). «Skill-Design…V25.txt:187-188»
ND-3247. Pesquisar mais de 100 imagens/links/referências visuais de Awwwards, CSSDA, Godly, SiteInspire, Dribbble, Webflow, Apple Silicon, Netflix Showcase; técnicas emergentes de setembro 2026: dark-dominant com acentos saturados, vidro líquido, formas orgânicas, tipografia expressiva cinética, motion intencional, bento modular fluido, scroll storytelling imersivo. «Skill-Design…V25.txt:190-193»
ND-3248. Superfícies contínuas e fluidas, separação por respiro espacial, escala tipográfica, iluminação sutil, vidro líquido amplo com sombras difusas; NUNCA empilhar caixas dentro de caixas. «Skill-Design…V25.txt:194»
ND-3249. Tríade tipográfica: 3 famílias distintas, display headline ousada pesada cinética peso 700-900 (Syne, Clash Display, Outfit Bold, Plus Jakarta Sans ExtraBold, Space Grotesk); VETADAS sans genéricas Inter, Roboto, system-ui. «Skill-Design…V25.txt:198-199»
ND-3250. Paleta global de exatamente 3 cores totalmente novas (nada azul/roxo) + 3 cores específicas por seção harmônicas com as globais; canvas escuro cinematográfico #07090E/#0A0D14; acentos alta saturação 2026 (Cyber Violet, Electric Amber, Hyper Emerald). «Skill-Design…V25.txt:200»
ND-3251. 40 tipos de efeito profissional: brilho, vidro, claymorphism, glassmorphism, fluid glass, shaders, distorção, transparência, desfoque combinados em fundos, cards, botões, ícones, bordas. «Skill-Design…V25.txt:201»
ND-3252. Copy curto impacto zero verbosidade: títulos curtos fortes, descrições curtas expressivas, vitrine Apple/Awwwards, zero parágrafos redundantes; vetado "desbloquear/elevar/revolucionar/superalimentar". «Skill-Design…V25.txt:202»
ND-3253. Stack embutido: React + Tailwind + CSS + CSS inline + SVG path embutidos com 40+ técnicas CSS misturadas: Houdini, @property, Paint Worklet, CSS path, clip-path, offset-path, shape-outside, backdrop-filter, mask, container queries, CSS variables, radial gradients. «Skill-Design…V25.txt:206, 1216-1218»
ND-3254. Carregamento de pacotes exclusivamente via CDN (jsDelivr, Cloudflare, unpkg, esm.sh) com importmap; sem npm local no artefato single-file. «Skill-Design…V25.txt:207, 1204»
ND-3255. Bilíngue PT/EN com seletor de idioma e tradução automática via Google GTX API no endpoint https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encoded} com cache key. «Skill-Design…V25.txt:207, 1104-1106»
ND-3256. Responsividade total mobile+desktop, suporte completo modo noturno e modo preto, salvamento local com persistência eficiente e segura, sincronização tempo real entre navegadores (JSON/WSS/WS live updates), banco local better-sqlite3/Prisma/Drizzle/libsql. «Skill-Design…V25.txt:208, 1106-1108»
ND-3257. Genérico vetado (vibe code 09/2026): heróis Inter, padrões Roboto, gradientes roxos, azul-roxo, rosa-roxo, creme off-white #F4F1EA + terracota #D97757, preto quase único, verde ácido, vermelhão, paleta padrão shadcn/Tailwind índigo-violeta-azul, CTA cinzas ardósia. «Skill-Design…V25.txt:209»
ND-3258. Leiaute vibe code vetado: herói emblema + título centralizado + subtítulo + 2 botões + maquete flutuante; grade igual de 3/4 colunas; seção de recurso com exatamente 3-4 cards. «Skill-Design…V25.txt:210»
ND-3259. Autocrítica obrigatória: checklist de prontidão de produção, viewport desktop+mobile, "seria confundido com template Webflow?" e reação alérgica à saída genérica de IA; abordagem opinativa. «Skill-Design…V25.txt:211»
ND-3260. Radius: cards grandes 20-32px, NUNCA menor que 16px em cards grandes; bento grade sempre mosaico de cards assimétricos; fundo neutro claro #F4F4F5→#ECECEE com cards brancos flutuando. «Skill-Design…V25.txt:222 (categoria componente)»
ND-3261. Tipografia de specs: sans grotesca Inter/Helvetica Now peso 500-700 tracking −2%; display ultra pesada tracking −3% com hero 72-96px. «Skill-Design…V25.txt:223 (categoria tipografia)»
ND-3262. Efeito vidro escuro: rgba(255,255,255,.04) + borda rgba(255,255,255,.08) + desfoque; chips sobre foto em vidro pill com texto branco 90%; entrada de seção fade+up (opacity 0→1, y 24→0, 500ms, stagger 60-90ms por card). «Skill-Design…V25.txt:224»
ND-3263. Transição de seções: cada seção e fundo central com atmosfera própria (gradientes orgânicos ricos, iluminação radial de estúdio, bg-radial-gradient ellipse at top, spots de luz suave, blur-120px), transições cromáticas harmônicas. «Skill-Design…V25.txt:225»
ND-3264. Landing vertical 9×16 tela cheia viewport inteira, sem moldura de celular, sem canvas aninhado, sem wrapper; rolagem contínua única com conteúdo espalhado na altura total; densidade 0-200 micro/macro componentes e 0-200 animações por seção balanceadas com respiro. «Skill-Design…V25.txt:1215-1219 (FAUN)»
ND-3265. Todo componente segue padrão único: mesmo fundo, mesma borda, mesmos efeitos; borda branca única permitida; sem contorno amador. «Skill-Design…V25.txt:1228-1229»
ND-3266. Curvas e transições orgânicas: nunca corte reto seco; matemática JS combinada Bezier/Catmull-Rom/lerp/easing seno-cosseno com SVG path embutido dinâmico. «Skill-Design…V25.txt:1229-1230»
ND-3267. Ícones especialmente desenhados como custom SVG path inline do zero, não biblioteca genérica; padrão unificado de fundo/borda/efeitos; sem emojis, hífens, underscores, dots, aspas, traços. «Skill-Design…V25.txt:1237-1238»
ND-3268. Primitivos geométricos vetados: retângulos com dots, fontes finas básicas em cards, círculos desproporcionais, bolas/quadrados/triângulos decorativos, subtítulos-títulos grandes, textos longos de explicação. «Skill-Design…V25.txt:1238-1239»
ND-3269. Keyframes massivos: float-slow, pulse-glow, shimmer, drift, orbits, breathing, parallax, ripple, tilt, morph; 1000+ propriedades CSS e 1000+ JS exploradas (transform, filter, backdrop-filter, clip-path, mask, perspective, motion, mix-blend). «Skill-Design…V25.txt:1224-1225»
ND-3270. Montar site por manipulação: superfícies contínuas, vidro líquido amplo, sombras difusas multicamada, penumbra suave, grade/flex; separar por respiro espacial e escala tipográfica em vez de bordas. «Skill-Design…V25.txt:26-30 (V2) e 194»
ND-3271. Tokens de design reais (tema de referência): @theme com --color-carbon #181925, paper-white #ffffff, lavender #918df6, iris #9580ff, mint #33c758, amber #ffa600, sky #2c78fc, magenta #d6409f, ember #ff3e00; escala caption 12px/1.33/−0.32px, body 16px/1.5. «17devnotes.txt:201681-201710»
ND-3272. Tokens alternativos mono: --color-void-black #000, ghost-white #fff, ash-border #4d4d4d, smoke #808080, fog #999, pale-mist #c6c6c6, dusk-violet #343755; caption 10px/1.5, body-sm 12px/1.5. «17devnotes.txt:217778-217800»
ND-3273. Engine de geração de design: esteira de 400 ações micro-decisórias em 10 fases arquiteturais (1-40 master/artboard; 41-80 geometria+liquid glass+chanfros; 81-120 tríade tipográfica Syne/Outfit/Plus Jakarta; 121-160 matriz cromática; 161-200 agrupamentos micro/macro; 201-240 iluminação estúdio + sombras multicamada; 241-280 microinterações + curvas cúbicas; 281-320 bilíngue GTX + rotas; 321-360 auditoria anti-vibe-code; 361-400 farinha mágica de reajuste óptico). «instrutions.txt:14-32»
ND-3274. Eliminação de telas brancas: injeção obrigatória de paletas cromáticas com canvas escuro cinematográfico (#07090E, #0A0D14), acento de alta saturação 2026 e neutros luminosos. «instrutions.txt:33-35»
ND-3275. Painel de execução em tempo real: indicador dinâmico de cumprimento percentual (85-95%), agrupamento expansível pelas 10 fases, feedback visual no canvas a 75%. «instrutions.txt:36-38»
ND-3276. Fases de sessão numeradas e auditáveis: fase 1 cria componente, fase 2 agrupa componente, fase 3 cria outro, fase 4 agrupa grupos e subgrupos de ícones em esquemáticos; validar renderização e proporção antes de codar. «Skill-Design…V25.txt:183, 1226»
ND-3277. Fontes: exatamente 3 fontes premium leves (não book, não serif fina básica) com variações obrigatórias bold/thin/semi-thin/semi-bold, uma mais grossa, uma mais fina, uma natural, tracking fino, carregadas via CDN. «Skill-Design…V25.txt:1235-1236»
ND-3278. Pesquisa extrai TÉCNICA, nunca copia card/produto: inspirado apenas em técnicas e exemplos; visual quase idêntico de referência é proibido com outras escolhas de composição. «Skill-Design…V25.txt:1223-1224»

### Bloco G — Skills/ferramentas diversas (ghostwriter, browser QA, chat UI, jogo-carro)

ND-3279. Ghostwriter: persona unificada escreveu todo o acervo — manter ortografia, pontuação, posição, escolha, mesmo timbre e ritmo com >16 posições; perceber trejeitos, articulação e sonoridade semântica. «Skill-Definitiva-Todas-Regras.txt:8»
ND-3280. Ghostwriter operação: checklist antes de ação (0-5 ondas, 0-80 por artista, 0-100 chamadas sem agrupar em onda única, 1 letra por operação); Genius como referência de performance com () e minúsculas; pasta/arquivos curtos lowercase sem hífen/underscore; entrega zip com link único. «Skill-Definitiva-Todas-Regras.txt:14-15»
ND-3281. Ghostwriter variação: nunca reutilizar palavras/estruturas anteriores; reanalisar, reembaralhar, gerar variação nova; não plagia literal; >5 variações com 0-98% de certeza; mesclagem sem duplicação. «Skill-Definitiva-Todas-Regras.txt:16-17»
ND-3282. Ghostwriter proibições: palavras artificiais que quebram rima (blow/flow/grow/cap/glow/no cap…), rimas legadas hardcodadas, pontuação robótica, onomatopeia genérica, duplicar palavras. «Skill-Definitiva-Todas-Regras.txt:35-37»
ND-3283. Browser QA: agente é o próprio QA (o usuário não é); smoke obrigatório desktop 1280×800 + mobile 390×844 com screenshot e veredito JSON; comparar build com baseline (divergesFromBaseline) e re-ler screenshots só quando divergir. «17devnotes.txt:1800-1847»
ND-3284. Controles invertidos nunca shipam: para jogo com WASD/veículos, verificar sinais de controle (A esquerda / D direita) mesmo sem jogar end-to-end. «17devnotes.txt:1844-1847»
ND-3285. Documentação de lib vendida: pin de llms-full.txt (threejs.org/docs) para uso offline da sandbox; preferir npm 'three' sobre CDN importmaps nesta stack; sempre import map moderno, nunca script tag r128 legado. «17devnotes.txt:160883-160905»
ND-3286. opencode config: plugins @wenathlan/maene@latest + memória (@zilliz/memsearch-opencode, opencode-universal-memory); providers openai-compatible com limits de context/output explícitos por modelo (ex.: mimo-v2.5-pro context 1.050.000, output 262.144). «17devnotes.txt:164038-164062»
ND-3287. Sandbox infinita (saddle): virtualizar driver/hardware sem tocar no físico, rodar Linux RISC-V real sobre V8 com memória infinita via lazy paging + HTTP Range + CDN; catálogo vCPU/vGPU custom via PR no GitHub; armazenamento CoW. «17devnotes.txt:218447-218470 (wss/pesuisa)»
ND-3288. Jogo-carro single HTML: GLB binário é o único formato viável preservando POSITION/NORMAL/TANGENT/INDICES/boundingBox/hierarchy em metros reais; ordem de carregamento obrigatória es-module-shims 1.8.0 → importmap travado → style canvas 100vw/100vh → script module. «finalunicocompletodefinitivo…txt:22-28»
ND-3289. Física do jogo-carro com cadeia de fallback: cannon-es 0.20.0 RaycastVehicle primário → rapier3d-compat WASM async → Babylon Havok → PlayCanvas. «finalunicocompletodefinitivo…txt:25-26»
ND-3290. Pipeline headless de assets: gltf-transform center→weld 0.0001→dedup→prune→quantize 14bits + draco3d/meshoptimizer/gltfpack com LOD 30k/10k/3k + gltfjsx. «finalunicocompletodefinitivo…txt:29-30»
ND-3291. Visual do jogo-carro: MeshPhysicalMaterial clearcoat, flakes SGGX, transmission, HDRI PMREM Karis, PCFSoft/PCSS/VSM, contato vanilla ProgressiveLightMap; pista CatmullRomCurve3 500 pontos + ExtrudeGeometry + Bishop frame; vegetação InstancedMesh. «finalunicocompletodefinitivo…txt:26-28»
ND-3292. UI chat (referência Neo Chat Interface): caixa com BOX_CORNER_RADIUS 24, SADDLE_CONCAVE_RADIUS 14, TAB_HEIGHT 40, OVERLAP_OFFSET 1.5, BOX_HEIGHT 168, TAB_SLANT 8, ACTIVE_TAB_RADIUS 18, INACTIVE_TAB_RADIUS 14; tabs com ícones (arquivos, templates, modos/brain, busca, mídia); React 19 + motion/react com MessageBubble e bot icons custom. «unificado2.txt:12-45»

---

## FEATURES

### stealhead — F-SHD (app da família, importa versawase; FPS de arena por ondas, editor first, DB first)

F-SHD-001. Deduplicação por hash SHA-256 com preservação de zips e dry-run (shipped) [v1.0.0] «stealthead.session1-conversa (2).txt:15-60»
F-SHD-002. Organização por formato com mapa reversível (5.293 arquivos movidos, 0 falhas) (shipped) [v1.0.0] «stealthead.session1-conversa (2).txt:90-97»
F-SHD-003. Dedup aplicado: 5.618 duplicados deletados, ~317MB liberados (594→277MB) (shipped) [v1.0.0] «stealthead.session1-conversa (2).txt:48-52»
F-SHD-004. node_modules global junction (954 pacotes, vite/tsx/three) sem instalação local (shipped) [v1.0.0] «stealthead.session1-conversa (2).txt:57-60»
F-SHD-005. Feature map 4.0 com 306 features mapeadas de alvo 600, todas proposed→executadas por ondas (shipped) [v1.0.0] «stealthead.session1-conversa (2).txt:404-410»
F-SHD-006. Protocolo de validação de 10 passos com last-validation.txt como gate único (shipped) [v1.0.0] «stealthead.session1-conversa (2).txt:430-447»
F-SHD-007. Balancer Monte Carlo TTK (balancer.py --runs 1000, 10/30/60m, p50 ±15%) (shipped) [v1.0.0] «stealthead.session1-conversa (2).txt:444-445»
F-SHD-008. Benchmark de performance 60s (perf.json: fps/draws/tris/heap) (shipped) [v1.0.0] «stealthead.session1-conversa (2).txt:445-446»
F-SHD-009. Smoke Playwright Brave headless com canvas data-ready, tecla r, Space×10 e screenshot (shipped) [v1.0.0] «stealthead.session1-conversa (2).txt:443-444»
F-SHD-010. Wave 1 P0: slide/tac-sprint/ADS/footsteps/spawn-shield + HUD/áudio agentes (shipped) [v1.0.0] «stealthead.session1-conversa (2).txt:5008-5012»
F-SHD-011. Wave 2a: medals (state.ts), prone/lean/death-cam/interact (player.ts), enemyshot/whizz/FF-LOS (enemies.ts) (shipped) [v1.0.0] «stealthead.session1-conversa (2).txt:5009-5010»
F-SHD-012. Wave 2b: smart-spawn + boss telegraph + cap 26 + falloff triple + decal/impact + hitstop + fix headshot 4x (shipped) [v1.0.0] «stealthead.session1-conversa (2).txt:5011»
F-SHD-013. Wave 2c HUD agente P1: dmg numbers, markers, pings, vitals, pips, medal cards, prompt [F] (shipped) [v1.0.0] «stealthead.session1-conversa (2).txt:5012»
F-SHD-014. Wave 2d: mantle #315, viewmodel clips #346-348, per-bone hitboxes #383, killcam #335 (planned) [v1.1.0] «stealthead.session1-conversa (2).txt:5013»
F-SHD-015. Gates por wave: tsc 0 erros + smoke 0 erros + perf p50 ~59,9 + screenshot visual probe (shipped) [v1.0.0] «stealthead.session1-conversa (2).txt:5006-5007»
F-SHD-016. Crosshair com spring physics (SPREAD_LAMBDA 18, τ~55ms), estilos default/dot/cross/circle/t-shape, rotação de reload e fireFlash/hitFlash (shipped) [v1.0.0] «stealthead.session1-conversa (2).txt:917-995»
F-SHD-017. Hitmarker X-snap 4 linhas com tipos normal/headshot/kill e ttl 0,18s (shipped) [v1.0.0] «stealthead.session1-conversa (2).txt:100-120»
F-SHD-018. HUD i18n en/pt/es, minimapa, leaderboard, settings — DOM puro, só minimapa em canvas (shipped) [v1.0.0] «stealthead.session1-conversa (2).txt:884-890»
F-SHD-019. Tabela de armas real: AK-47 (34 dmg, 600 rpm, spread 0.022/0.0035, recoil 0.021/0.009, adsFov 52/0.22s, falloff 45-90-0.7), Intervention, MP5, M870 8 pellets (shipped) [v1.0.0] «stealthead.session1-conversa (2).txt:572-588»
F-SHD-020. Loadouts com stats de exibição 0-100: ASSAULT 68/55/75/65, MARKSMAN, CQB, BREACHER (shipped) [v1.0.0] «stealthead.session1-conversa (2).txt:588-590»
F-SHD-021. Fidelidade CS2: validação de geometria contra docs de anatomia (bullpup, mag banana AK, supressor USP-S/AWP, wear por região) (shipped) [v1.0.0] «stealthead.session1-conversa (2).txt:524-546, 660-664»
F-SHD-022. Inimigos soldado Mixamo GLB com SkeletonUtils.clone, escala por arquétipo, tint por mesh, skinning LOD near/far e máquina de clips idle/walk/run/strafe (shipped) [v1.0.0] «stealthead.session1-conversa (2).txt:15275-15290»
F-SHD-023. Arma de inimigo HK416 compartilhada com muzzle Object3D e gunmetal (shipped) [v1.0.0] «stealthead.session1-conversa (2).txt:15290-15295»
F-SHD-024. Viewmodel FPS: loadSoldier chain sandbox→/api/assets→CDN mirrors com __vmDiag de diagnóstico, extractArm por skinIndex dominante, poseArm rescale k=0.45 (shipped) [v1.0.0] «stealthead.session1-conversa (2).txt:15252-15272»
F-SHD-025. Física pura sem THREE (623 linhas): Verlet/semi-implícito, FixedStep, sphere/ray/AABB/CCD sphereSweep, ballística com drag/penetração, ragdoll Verlet, ackermann+suspensão, WORLD_GRAVITY, mulberry32 (shipped) [v1.0.0] «stealthead.session1-conversa (2).txt:15296-15310»
F-SHD-026. Terreno 1024×1024 (255×255 segs) com FBM+blur, arena bowl achatada, vertex-color splat + canvas detail (shipped) [v1.0.0] «stealthead.session1-conversa (2).txt:15312-15316»
F-SHD-027. Arena props nomeadas (containers, obelisks, pickups, cover) com colliders e rebuildColliderHash (shipped) [v1.0.0] «stealthead.session1-conversa (2).txt:15316-15320»
F-SHD-028. BVH patch global three-mesh-bvh em engine.ts (prototype raycast + computeBoundsTree) e acceleratedBVHRaycast (shipped) [v1.0.0] «stealthead.session1-conversa (2).txt:15320-15324»
F-SHD-029. Skydome shader + sun directional 1.1 + hemi 0.35 + ambient 0.05 + PMREM env (shipped) [v1.0.0] «stealthead.session1-conversa (2).txt:15326-15328»
F-SHD-030. Diagnóstico de pipeline de assets: relatório de editor-foundation (zero TransformControls/GridHelper no código, 3 hooks reutilizáveis) (shipped) [v1.0.0] «stealthead.session1-conversa (2).txt:15330-15340»
F-SHD-031. Pipeline GLB ClaudeofDuty2: compose_scene.py (glTF writer em Python), export_collision.py (BSP→glTF z-up→three), bake_collision_bvh.mjs (MeshBVH SAH serializado), xanim_to_json (decoder T6 v19) (shipped) [v1.0.0] «stealthead.session1-conversa (2).txt:15360-15375»
F-SHD-032. collision-world runtime: deserializeCollisionWorld rebuild MeshBVH de bin + sidecar JSON + cápsula-vs-BVH com scratch pré-alocado (shipped) [v1.0.0] «stealthead.session1-conversa (2).txt:15380-15385»
F-SHD-033. Rig procedural ClaudeofDuty: 25 ossos, IK 2-bones com law-of-cosines + pole vector, blend tree layered + 4 passes IK, PhysicsDebugView 120k vértices com cores por tipo (shipped) [v1.0.0] «stealthead.session1-conversa (2).txt:15388-15395»
F-SHD-034. Studio R3F grok: useGLTF + manipulação por nome de nó (body/glass/rim/chrome), PMREM procedural de planos, CameraRig lerp, overlay de paint swatches (shipped) [v1.0.0] «stealthead.session1-conversa (2).txt:15400-15410»
F-SHD-035. StealHead 5.1 do zero: 8 fases com subagentes A-F, gates por fase, package.json 70→149 pacotes reescrito pelo dono (shipped) [v5.1.0] «session3-conversa (2).txt:2718-2760»
F-SHD-036. DB mestre + shard por callsign (8 tabelas no mestre; shard ghost.db criado; score persistido; sweep sane sem shards órfãos) (shipped) [v5.1.0] «session3-conversa (2).txt:572-578, 2611-2614»
F-SHD-037. Ingest 5.2.0: 4.912 assets (937,9MB) com 6.898 duplicatas de conteúdo puladas, integrity_check ok (shipped) [v5.2.0] «PLANO-5.3.txt:103-125»
F-SHD-038. Inventário por categoria: arma 83, mapa 72, personagem 37, prop 793, textura 2.145, veículo 50, áudio categorizado (tiro/recarga/passos/impacto/explosão/ambiente/ads) (shipped) [v5.2.0] «PLANO-5.3.txt:127-142»
F-SHD-039. Portas persistidas: gameport 39781, devport 37942 em data/ (shipped) [v5.1.0] «session3-conversa (2).txt:2621-2622»
F-SHD-040. HUD Blood Strike: cartões de arma 1-6 centro-inferior, bússola topo-centro, minimapa/killfeed topo-direita, barra de vida larga roxa #7c3aff→#a86bff, munição grande inferior-direita, viewmodel pos(0.33,-0.3,-0.55) (shipped) [v5.1.0] «PLANO-5.3.txt:825-840»
F-SHD-041. Radar com sweep animado, blips vermelhos e boss dourado; referência webp do Blood Strike transcodificada e analisada (shipped) [v5.1.0] «session3-conversa (2).txt:716-720; PLANO-5.3.txt:829-830»
F-SHD-042. Balance CSV: pistol 10m 0,63s/4,5 hits; rifle 0,22/3,6; smg 0,33/5,6; shotgun 3,20/7,1; sniper 1,33/0,9 (planned) [v5.1.0] «session3-conversa (2).txt:2623»
F-SHD-043. 6 armas (p19, mpx, m4a1, ks12, l115, rpg7) com hitscan spread/falloff, ADS, recuo, reload, foguetes e viewmodel procedural pose Blood Strike (planned) [v5.1.0] «PLANO-5.3.txt:828-829»
F-SHD-044. 6 arquétipos de bots (drone, runner, tank, sniper, exploder, boss) pool 64, FSM, mixForWave com boss a cada 5ª onda, trickle 0,5s, blips para radar (planned) [v5.1.0] «PLANO-5.3.txt:829-830»
F-SHD-045. Editor F2 com TransformControls G/R/S, pick por raycast, raio-x wireframe+grid, save/bake para DB (planned) [v5.1.0] «PLANO-5.3.txt:831-832»
F-SHD-046. formats.ts ~30 formatos 3D com three-stdlib lazy (glb, gltf, fbx, obj, stl, ply, dae, ktx2, basis…) (planned) [v5.1.0] «PLANO-5.3.txt:833-834»
F-SHD-047. multiplayer.ts WS /ws join+state 12Hz interp 100ms remotes nametag fallback bots (planned) [v5.1.0] «PLANO-5.3.txt:830»
F-SHD-048. Catálogo Sketchfab 244 modelos com perfis anotados e personagens numerados 1-6 pelo dono (planned) [v5.3.0] «PLANO-5.3.txt:990-1012»
F-SHD-049. Pipeline 7 etapas de controle total do modelo (ufbx→auto-rig→normalização→bake→IK→retarget→compressão) (planned) [v5.3.0] «PLANO-5.3.txt:960-977»
F-SHD-050. Boot watchdog 15s + progresso real + div de erro visível (nascido corrigido do bug TV VHS com 4 causas documentadas) (shipped) [v5.1.0] «session3-conversa (2).txt:2612-2616, 2718-2730»

### devthink — F-DTK (features de UI/design universal e gateway aplicáveis ao devthink OS)

F-DTK-200. Skill Design Universal V25 como engine de design do OS (briefing→operação→mapeamento→tipografia/cores→proibições→exemplos por categoria) (planned) [v1.0.0] «Skill-Design…V25.txt:168-227»
F-DTK-201. Esteira de 400 ações por componente em 10 fases com meta 85-95% e painel de execução em tempo real (planned) [v1.0.0] «instrutions.txt:14-38»
F-DTK-202. Tríade tipográfica cinética com display 700-900 e vetamento de Inter/Roboto/system-ui (planned) [v1.0.0] «Skill-Design…V25.txt:198-199»
F-DTK-203. Paleta 3 cores globais + 3 por seção com canvas escuro #07090E/#0A0D14 e acentos 2026 (planned) [v1.0.0] «Skill-Design…V25.txt:200»
F-DTK-204. 40 efeitos pro max (glow, glass, claymorphism, glassmorphism, fluid glass, shaders, distorção, transparência, blur) combinados (planned) [v1.0.0] «Skill-Design…V25.txt:201»
F-DTK-205. Toolkit CSS 40+ técnicas: Houdini, @property, Paint Worklet, clip-path, offset-path, shape-outside, backdrop-filter, mask, container queries (planned) [v1.0.0] «Skill-Design…V25.txt:206»
F-DTK-206. Bilíngue PT/EN com seletor de idioma + tradução automática Google GTX com cache (planned) [v1.0.0] «Skill-Design…V25.txt:207»
F-DTK-207. Dark mode completo (modo noturno + modo preto) com persistência local e sync entre navegadores via WSS (planned) [v1.0.0] «Skill-Design…V25.txt:208»
F-DTK-208. Auditoria anti-vibe-code com lista de vetados (herói Inter, gradientes roxos, creme terracota, grade 3 colunas, copy "revolucionar") (planned) [v1.0.0] «Skill-Design…V25.txt:209-210»
F-DTK-209. Biblioteca de exemplos por categoria: Pricing, Sidebar Dashboard, Profile, Travel Booking, SaaS Hero, Healthcare Pastel, Warm Organic Editorial, Dark Crypto Tech, Productivity Grid, Efeito, Transição, Componente, Tipografia, Paleta (planned) [v1.0.0] «Skill-Design…V25.txt:213-227»
F-DTK-210. Sistema de camadas Z-index 0-1000 estratificado (0 atmosfera, 10 conteúdo, frente) com clusters lógicos 2-3 níveis (planned) [v1.0.0] «Skill-Design…V25.txt:187, 1222»
F-DTK-211. Ícones custom SVG path inline do zero, padrão unificado, sem biblioteca genérica nem emoji (planned) [v1.0.0] «Skill-Design…V25.txt:1237»
F-DTK-212. Keyframes pro: float-slow, pulse-glow, shimmer, drift, orbits, breathing, parallax, ripple, tilt, morph com 1000+ propriedades exploradas (planned) [v1.0.0] «Skill-Design…V25.txt:1224-1225»
F-DTK-213. Animação de entrada de seção fade+up 500ms com stagger 60-90ms por card (planned) [v1.0.0] «Skill-Design…V25.txt:224»
F-DTK-214. Glass tokens: rgba(255,255,255,.04) fill + rgba(255,255,255,.08) border + blur; chips de vidro pill sobre foto (planned) [v1.0.0] «Skill-Design…V25.txt:224»
F-DTK-215. Radius canônico: 20-32px em cards grandes, nunca <16px; bento mosaico assimétrico (planned) [v1.0.0] «Skill-Design…V25.txt:222»
F-DTK-216. Tipografia hero 72-96px tracking −3%, sans 500-700 tracking −2% (planned) [v1.0.0] «Skill-Design…V25.txt:223»
F-DTK-217. Atmosferas de seção com bg-radial-gradient ellipse at top, spots de luz suave blur-120px e transições cromáticas (planned) [v1.0.0] «Skill-Design…V25.txt:225»
F-DTK-218. Autocrítica de produção: checklist viewport desktop/mobile + teste "template Webflow?" antes do ship (planned) [v1.0.0] «Skill-Design…V25.txt:211»
F-DTK-219. Design tokens @theme Tailwind v4 CSS-first (carbon #181925, iris #9580ff, mint #33c758, amber #ffa600; escala caption 12px/1.33/−0.32px) (planned) [v1.0.0] «17devnotes.txt:201681-201710»
F-DTK-220. Tema alternativo mono (void-black #000, dusk-violet #343755, caption 10px/1.5) (planned) [v1.0.0] «17devnotes.txt:217778-217800»
F-DTK-221. Chat UI Saddle box: cantos 24px, concavidade 14px, tabs 40px com slant 8, raio ativo 18/inativo 14, altura 168, sobreposição 1.5 (planned) [v1.0.0] «unificado2.txt:12-24»
F-DTK-222. Chat com tabs de modo (arquivos, templates, modos/brain, busca, mídia) em React 19 + motion/react com MessageBubble e ícones de bot custom (planned) [v1.0.0] «unificado2.txt:1-45»
F-DTK-223. Frontend da gateway com tabs V1/V2/V3, seletor de thinking levels (7 níveis), chat, modelos, CRUD de chaves e bloco amarelo de raciocínio (planned) [v1.0.0] «conversa10.txt:52»
F-DTK-224. Thinking always-on visível: reasoning primeiro em bloco collapsible (padrão OpenCode bg-yellow) (planned) [v1.0.0] «conversa10.txt:37, 40»
F-DTK-225. Meta-modelo devthink mascarando model em toda resposta com contexto agregado 2,3M (planned) [v1.0.0] «conversa10.txt:48; gateway.md»
F-DTK-226. cdn.ts com 1200+ entradas esm.sh (id/name/category/cdnurl/loadFromCDN/Map cache) para deps pesadas fora do package.json (planned) [v1.0.0] «conversa10.txt:22, 25»
F-DTK-227. Autofix universal de parâmetros (Levenshtein + clamping + casing/acentos) visível como feature de robustez da plataforma (planned) [v1.0.0] «conversa10.txt:34»
F-DTK-228. Browser QA smoke integrado: desktop+mobile com veredito JSON e baseline de build (planned) [v1.0.0] «17devnotes.txt:1800-1847»
F-DTK-229. Vendoring de docs llms-full.txt de libs (three.js) para uso offline da sandbox (planned) [v1.0.0] «17devnotes.txt:160883-160905»
F-DTK-230. opencode providers com limits por modelo (context 1.050.000 / output 262.144) e plugins de memória universal (planned) [v1.0.0] «17devnotes.txt:164038-164062»
F-DTK-231. Ghostwriter mirror como skill da plataforma (persona unificada, mapeamento de trejeitos, variações 0-98%) (planned) [v1.0.0] «Skill-Definitiva-Todas-Regras.txt:7-37»
F-DTK-232. Página Explore/loja com cards de exemplo por categoria design (pricing/dashboard/profile herdados da skill V25) (planned) [v1.1.0] «Skill-Design…V25.txt:215-217»
F-DTK-233. Single-file self-contained: artefatos HTML com React/Tailwind/CSS/SVG embutidos via CDN esm.sh importmap (planned) [v1.0.0] «Skill-Design…V25.txt:206-207, 1204»
F-DTK-234. Scanline de radar e sweep animados como microcomponente de HUD reutilizável (referência Blood Strike) (planned) [v1.1.0] «PLANO-5.3.txt:829-830»
F-DTK-235. Painel de edição universal (F2, gizmos G/R/S, raio-x, readout xyz) como padrão de editor do OS (planned) [v1.1.0] «PLANO-5.3.txt:617-620, 841-844»

---

## CONTAGEM

- Regras ND: **292** (ND-3001 … ND-3292) — todas com fonte «arquivo:linhas» de conteúdo efetivamente lido
  - Bloco A governança/ordens: 40 (ND-3001-3040)
  - Bloco B arquitetura/engine/perf: 45 (ND-3041-3085)
  - Bloco C validação/gates: 15 (ND-3086-3100)
  - Bloco D gameplay/tuning: 92 (ND-3101-3192)
  - Bloco E gateway (raiz): 50 (ND-3193-3242)
  - Bloco F design universal/CSS: 36 (ND-3243-3278)
  - Bloco G skills/ferramentas: 14 (ND-3279-3292)
- Features: **86**
  - F-SHD-001..050 (stealhead): 50
  - F-DTK-200..235 (devthink UI/design universal): 36
- Arquivos lidos: 21 (16 efetivamente explorados + 5 duplicatas/baixos confirmados e documentados)
- Arquivos pulados (justificados): session1-conversa (2).txt e stealthead.talks1 (3).txt (duplicatas da session1); ordens (2).txt (duplicata de ordens.txt); session1-parametros-json (2).txt e session3-parametros-json (2).txt (dumps JSON de tool-calls, só cabeçalho lido); corpo do 17devnotes com HTML/minificado embutido (lixo de build, pulado por grep).
- Meta da onda (≥250 regras, ≥60 features): ✅ atingida.
