# ONDA 4b — saddle profundo (neodocs-txt/outros.saddle)

Operação DevThink — Task ID 6-5-b (subagente leitor-onda4b). Extração de REGRAS e FEATURES REAIS
do acervo `outros.saddle` (projeto Saddle/AetherForge — `@wenathlan/saddle` v1.8.5→1.8.21, VM/DevThink,
sandbox engine, scraper, packager, storage→RAM bridge). Nada inventado; toda entrada cita `«arquivo:X-Y»`.

## Arquivos e segmentos lidos

| Arquivo | Linhas totais | Segmentos lidos |
|---|---|---|
| sites.txt | 31.322 | 1–60 (metodologia), 5.600–6.300 (delegação/formato), 14.000–14.400 (catálogo URLs); resto = catálogo de URLs de forges (amostrado, não integral) |
| repo-analysis-1.8.21.txt | 2.617 | 1–120 (estrutura JSON, 60 repos) + grep de fullName/categories (60 entradas mapeadas) |
| readme1.txt | 2.033 | 1–1040 INTEGRAL (Master Consolidated Documentation + # Saddle); 1040–2033 = DUPLICATA do README reconstruído + artefatos de edição → descartados |
| README.txt | 592 | 1–592 INTEGRAL (@wenathlan/saddle v1.8.18, 584 linhas úteis) |
| platforms.txt | 2.887 | 1–140, 239–307, 1.740–1.834, 2.259–2.745, 2.850–2.887 + mapa dos 74 cabeçalhos `##` |
| todo.txt | 708 | 1–175 integral (checklist engine 1.0→1.7.0); 175–708 mapeado por cabeçalhos |
| todo-1.8.15.txt | 483 | 1–300 (governance, storage pool, memory tiers, WASM/binary, provider chain, delivery/PWA, matriz cross-domain) |
| todo-1.8.16.txt | 735 | 1–60, 450–735 (completion rule, governance, synthesis, implementation families, 1.8.17/18) |
| repo-research-1.8.16.txt | 439 | 1–270 integral (evidence log por categoria + dispositions) |
| repo-synthesis/-selected 1.8.21 | — | cabeçalhos/contagens via readme1:160-174 (60 entradas, 43 selecionadas, 130 candidatos) |
| 22.research.universal.runtime.txt | 944 | 1–130 (WinterTC/ECMA-429, APIs universais/não-universais, compliance runtimes) |
| 24.research.memory.persistence.txt | 1.979 | estrutura completa (grep) + regras extraídas do README/readme1 que a sintetizam |
| 18.research.content.extraction.txt | 1.952 | estrutura completa (grep) — JSON-LD/Microdata/OG/RSS/Readability/API-interception |
| 15.research.retry.rate.limit.txt | 1.958 | 1–30 (mapa), 1.113–1.160 (status codes retry/não-retry) |
| 14.research.proxy.txt | 1.495 | mapa de seções + §6 Health Checking (695–930) |
| 21.research.batch.concurrency.txt | 1.888 | mapa de seções (autoscale/adaptive/graceful) |
| 17.research.caching.txt / 16.research.crawling.txt / 19.research.errors.events.txt / 20.research.zod.validation.txt / 23.research.ai.integration.txt | ~8.2k | mapas de seções (sínteses já incorporadas em README.txt/readme1.txt) |
| featureaudit.txt | 63 | 1–63 integral |
| talks10/ (pasta) | 1.455 arquivos / 6.5MB | 001-user, 002–005-assistant, 056-user, 066-assistant, amostras 700 e 1.400 (log de sessão do build do engine) |

Descartados como lixo/duplicata: readme1.txt 1.040–2.033 (README repetido 2× com artefatos de edição e erros
de Write capturados); sites.txt 630–31.322 (catálogo de URLs repetitivo de pesquisa multilíngue — amostrado);
entries `_(sem link)_` de platforms.txt (3.700+ linhas sem conteúdo).

---

## REGRAS ND

Formato: `ND-NNNN. <regra imperativa PT-BR>. «arquivo:X-Y»`. Range da onda 4b: ND-1001 em diante.

### Identidade, pacote e versionamento

ND-1001. Publique o pacote como `@wenathlan/saddle` no npm público e no GitHub Packages (scope `wenathlan` + token autorizado para consumidores do GH Packages). «readme1.txt:1-15»
ND-1002. Mantenha a identidade canônica do pacote alinhada em npm, GitHub Packages, GHCR, Maven, NuGet, RubyGems e OCI. «readme1.txt:1-15»
ND-1003. Derive a versão de release e os nomes de artefatos da TAG de release — nunca hardcode a versão. «readme1.txt:1-15»
ND-1004. Use licença GPL-3.0-only no package.json e alinhe todo metadata de registro/release a essa versão. «readme1.txt:1-15; README.txt:1-3»
ND-1005. Distribua entry root como JavaScript compilado com declarações TypeScript geradas, cross-runtime safe no contrato core testado. «readme1.txt:1-15»
ND-1006. Registre o namespace transferido ao owner `wenathlan` com `iakadion` retido como admin; canonical publicado é `@wenathlan/saddle`. «readme1.txt:681-697»
ND-1007. Resolva o conflito histórico de licenças (MIT no README vs GPL-3.0-only no package.json vs Proprietary-View-Only v1.0) para UMA licença antes de publicar. «readme1.txt:681-697»
ND-1008. Faça `npm version patch|minor|major` + `git push --follow-tags`; patch=bugfix, minor=compatível, major=breaking. «readme1.txt:768-786»
ND-1009. Mantenha `bin: {"saddle": "bin/saddle.js"}` e entry dupla `import`/`require` (ESM+CJS). «readme1.txt:768-786»
ND-1010. Não introduza chave de export com espaço em branco na string do subpath (bug histórico `"./ captcha"`). «readme1.txt:768-786»
ND-1011. Fixe `engines.node >=26.7.0`, `npm >=10.9.2`, `packageManager npm@12.0.2`, `sideEffects: false` no manifest ativo. «readme1.txt:768-786; README.txt:496-530»
ND-1012. Deixe Playwright como peer opcional `^1.62.1` via subpath `./browser-playwright`; root permanece vendor-neutral. «readme1.txt:768-786»
ND-1013. Declare quatro classes de referência de versão: manifests ativos → release ativa; docs de release → evidência imutável; fixtures → versões de fixture que não selecionam nada; escopo do README → preservado com staleness registrado. «README.txt:601-620»
ND-1014. Atualize todos os manifests ativos juntos; mantenha docs de releases concluídas imutáveis; adicione claim de capability só após implementação + validação observada independente. «README.txt:601-620»
ND-1015. Declare versões mortas do ciclo: fetch polyfills, undici-as-polyfill, buffer, path-browserify, process e stream-browserify shims. «README.txt:34-37»

### Governança e arquitetura

ND-1016. Construa SEMPRE como biblioteca primeiro, convertida para cada alvo (~30 modos); memória interna é prioridade; nunca vincule a um runtime só. «readme1.txt:210-233»
ND-1017. Rejeite Netlify Functions e Vercel Functions; o core não acopla host/porta/db; o adapter de servidor recebe host/porta como parâmetros. «readme1.txt:210-233; README.txt:11-33»
ND-1018. Infra aberta: sorteie e depois trave host e porta; nunca localhost; 100% de escolha do usuário; qualquer provider livremente trocável. «readme1.txt:210-233»
ND-1019. Estrutura root-first: SEM `/src`; arquivos na raiz; subpastas só por modo (web, docs, tests, desktop, android, ios, cli, extension). «readme1.txt:210-233»
ND-1020. Agrupe lógica em três camadas; máximo 20 lógicas por arquivo; um arquivo por contexto. «readme1.txt:210-233»
ND-1021. Centralize versões de dependência em catálogo (NBIT — Build Independence); dependência mais simples e robusta; misture opções internas/externas. «readme1.txt:210-233»
ND-1022. Prefira built-ins `node:*` antes de dependências externas; externa só se nenhuma nativa cobre a necessidade. «readme1.txt:210-233»
ND-1023. Execução inline primeiro: `node -e` / import por CDN antes de arquivo; scripts auxiliares em `/tests`; só CWD. «readme1.txt:210-233»
ND-1024. Tom de voz: observador, terceira pessoa, direto, otimizado; SEM emoji; error catcher embutido. «readme1.txt:210-233»
ND-1025. Cumpra WinterTC/ECMA-429 (API cross-runtime), RFC 9309 (robots) e Zod v4 (`z.strictObject`) nos limites. «readme1.txt:210-233»
ND-1026. Aplique a doutrina de duas frentes: construir biblioteca/protocolo próprio E usar libs/repos de terceiros prontos, num único repo aberto + pacote npm, com o mesmo storage de terceiro servindo hosting e RAM virtual. «readme1.txt:210-233; README.txt:1-3»
ND-1027. Não use API fora da tabela WinterTC sem adapter: `fs`, `process`, `Buffer`, `path`, `child_process`, `require`, `__dirname` são proibidos no core — troque por adapters, Uint8Array, URL e import.meta.url. «README.txt:11-33; 22.research.universal.runtime.txt:1-130»
ND-1028. Detecção de runtime na ordem Deno → Bun → Node → browser; conditional exports com `types` primeiro, resolva `browser` antes de `import`. «README.txt:34-37»
ND-1029. Valide a correção de exports com export-lint, type-checker por condição e scanner de dependência circular. «README.txt:34-37»
ND-1030. Todo execution deve produzir receipt auditável; rotule latência como RAM/VRAM apenas quando for. «README.txt:11-33»
ND-1031. Toda declaração de pesquisa carrega data de observação; claims expiram em vez de apodrecer silenciosamente. «README.txt:11-33»
ND-1032. Nunca represente storage remoto como RAM, VRAM, runner sempre-ligado ou ambiente executável quando latência física e política do provider tornem a afirmação falsa. «todo-1.8.15.txt:12-43»
ND-1033. Mantenha execução binária opt-in, isolada, capability-negotiated e DENIED BY DEFAULT quando o runtime não prova a fronteira pedida. «todo-1.8.15.txt:12-43; README.txt:97-112»
ND-1034. Use fake transports determinísticos e fixtures para TODOS os testes de provider, rede, filesystem, runner e binário. «todo-1.8.15.txt:12-43»
ND-1035. Não use CI, registros, hosts estáticos, repositórios, contas ou storage providers para evadir termos, quotas ou políticas de uso aceitável. «todo-1.8.15.txt:12-43»
ND-1036. Exija credenciais caller-owned, consentimento explícito, quotas limitadas e zero valores de segredo em código, logs, testes ou release notes. «todo-1.8.15.txt:12-43»
ND-1037. Declare explicitamente capabilities unsupported, caller-owned, privileged ou paid em vez de implementar claims-placeholder. «todo-1.8.15.txt:12-43»
ND-1038. Não assuma Netlify Functions, Vercel Functions, host fixo, porta fixa ou SQLite local como DB de produção em nenhum plano novo. «todo-1.8.15.txt:12-43»
ND-1039. Registre decisão-log para todo proposal rejeitado por violar termos de provider, fronteiras de segurança ou restrições físicas. «todo-1.8.15.txt:12-43»
ND-1040. Estabeleça por release: threat model (supply chain, binários, extração de arquivos, fetches remotos, manifests não confiáveis), performance model, data ownership model, retention model e observability model sem log de credenciais/payloads/dados privados. «todo-1.8.15.txt:12-43»
ND-1041. Não autorize account farming, contorno de quota, coleta de credenciais, execução oculta em background, execução de binário de terceiros ou claims de equivalência storage↔RAM/VRAM. «todo-1.8.15.txt:1-10»
ND-1042. Conserte ortografia/gramática e mantenha agrupamento visual por linhas em branco (sem títulos) ao reagrupar catálogos; não remova contexto nem palavra, só reordene. «sites.txt:5600-6300»

### Estrutura de projeto e estilo

ND-1043. `/web` = build estático (`index.html` + `/dist`); `/docs` = `plans/` (NN.topic.md), `sources/`, `talksN/`, `logs/`; `/tests` = `*.test.ts` + helpers + `scripts/` para não-JS. «readme1.txt:254-274»
ND-1044. Crie espelhos de CI por forge: `.gitlab`/`.forgejo`/`.codeberg`/`.woodpecker`/`.gitea` espelham `/.github`. «readme1.txt:254-274»
ND-1045. Manifests na raiz: package.json, tsconfig.json, biome.json, vite.config.ts, dockerfile, vercel.json/netlify.toml (rejeitando Functions). «readme1.txt:254-274»
ND-1046. Nunca aninhe pasta em pasta; só pastas de modo como subpastas; arquivos ficam flat. «readme1.txt:254-274»
ND-1047. Aplique a regra V8 de manifest: flat, um nível só, prefixo numérico no nome (`001`, `002`…), Title Case com espaços, sem `_`/`-`; `ls` é a documentação, ordem alfabética é o diagrama. «readme1.txt:254-274»
ND-1048. Nomeie tudo em minúsculas sem underscore/hífen; identificadores dependentes de contexto. «readme1.txt:234-253»
ND-1049. Escreva JSDoc `/** */` em inglês por seção; consulte a data antes de qualquer tarefa e use dependências na versão mais recente. «readme1.txt:234-253»
ND-1050. Modo padrão do código: mais simples que funciona; robusto pelo simples; verificação passo a passo. «readme1.txt:234-253»
ND-1051. CSS/SCSS ultra-moderno: webkits, variáveis, APIs gratuitas; sem emoji em código e docs. «readme1.txt:234-253»
ND-1052. Um padrão só para código e docs; sem `try/catch` ausente — error catcher embutido para rastreio posterior. «readme1.txt:234-253»
ND-1053. Antes de entregar arquitetura/código, verifique os 10 pontos: deploy aberto (sem Functions), infra aberta (host/porta sorteadas), root-first, lógica três camadas, biblioteca multi-modo, NBIT, design rígido (texto na caixa, grid rígido, toque 44px), estilo lowercase sem emoji, codificação meticulosa, escolha total do usuário. «readme1.txt:980-1011»
ND-1054. Máquina de referência 8 GB: kernel/OS ~500MB, Docker ~200MB, WASM ~100MB, overlay Firecracker ~50MB, app ~2GB, sandboxes ~4GB, cache ~1,15GB — sandboxes devem viver em OUTRAS máquinas. «readme1.txt:371-385; README.txt:262-268»
ND-1055. Conversação logada documenta a prioridade real: codar a BIBLIOTECA primeiro (é a chave e a ponte do sistema; é o que é deployado no Docker/pacote), depois as superfícies. «talks10/056-user.txt:1-3»

### Modos e matriz de execução

ND-1056. Resolva modos com `resolvemode` (subpath `./modes`): retorna perfil + capability map SEM iniciar servidor, abrir browser, escolher vendor ou endpoint de infra. «readme1.txt:275-309»
ND-1057. Eixos do modo: execution (library/app/browser/desktop/mobile/extension/cli/binary/computer/internet), runtime (node/browser/deno/bun/worker), memory/file (internal/external/physical/vectorized/library), dependency (internal/external/dev), visibility (visible/headless), pair (without/with). «readme1.txt:275-309; README.txt:118-133»
ND-1058. Primeira leva implementa pares library/cli/binary + memória/arquivo internos; cada modo funciona sem/com o par. «readme1.txt:275-309»
ND-1059. Par com/sem browser: Playwright (Chromium/Firefox/WebKit) para SPA/JS; fetch + Cheerio para estático. «readme1.txt:275-309»
ND-1060. Par com/sem Node: node:fs/child_process/SQLite quando há; senão Bun/Deno/edge/browser. «readme1.txt:275-309»
ND-1061. Par com/sem AI: token count, chunking, llms.txt, RAG quando há; senão scrape/extract puro. «readme1.txt:275-309»
ND-1062. Cascade de estratégia: `mode:fetch→fetch.ts`; `mode:browser→browser.ts`; `mode:auto` tenta fetch, detecta necessidade de JS, escala para Playwright. «readme1.txt:275-309; README.txt:164-190»
ND-1063. Piso cross-runtime: Node ≥26.2.0 / Bun ≥1.4.0; lane LTS 24.x; CI e containers em 26.7.0. «readme1.txt:275-309; README.txt:11-33»
ND-1064. Package subpaths explícitos: `./browser`, `./bot`, `./captcha`, `./memory-engine`, `./deploy`, `./release-evidence`, `./extension`, `./isolation`, `./browser-playwright`; desktop, mobile, target-plan e n8n são exports root. «readme1.txt:55-97; README.txt:146-163»
ND-1065. Adapters Node-only (filesystem, Node HTTP, fila persistente, file sessions, memória local, captcha-evidence) ficam em subpaths Node-only para o root entry permanecer cross-runtime safe. «readme1.txt:55-97; README.txt:146-163»
ND-1066. `memorystorage` é o backend process-local para browser workers, Deno, Bun e testes determinísticos. «readme1.txt:55-97»
ND-1067. Superfícies de factory descrevem fronteiras e invocam handlers do caller: NÃO instalam toolkits nativos, NÃO iniciam servidores, NÃO criam dashboards, NÃO armazenam credenciais. «readme1.txt:16-27»

### Engine e ciclo de vida

ND-1068. Motor converte job serializável em working set temporário → executa via provider selecionado → grava no storage adapter → emite trilha de eventos; funciona sem extensão, browser ou memória externa. «readme1.txt:310-333»
ND-1069. Camadas do engine: core (erros, ids, clock, events, tracing), domain (jobs/sessions/artifacts/providers/records), storage, memory, runners, runtime, cli, tests. «readme1.txt:310-333»
ND-1070. Scheduler seleciona o PRIMEIRO provider disponível por prioridade estável via `canRun`/`descriptor` — nunca aleatório. «readme1.txt:310-333; todo.txt:18-26»
ND-1071. Ciclo de vida: `jobqueued → jobpreparing → runnerselected → jobrunning → jobsyncing → storagecommitted → jobcompleted`. «readme1.txt:355-366; README.txt:141-146»
ND-1072. Falha emite `jobfailed` com code/retryability/message; cleanup em `finally`; retry fica na fronteira scheduler/orquestração — nenhum provider é dono do retry. «readme1.txt:355-366; README.txt:141-146»
ND-1073. Exponha rotas REST do sandbox: `POST /api/sandboxes` (query `provider`), `DELETE /api/sandboxes/:id`, `POST /:id/execute`, `/:id/sleep`, `/:id/wake`, `/:id/convert-to-ram`, `GET /:id/memory-stats`; orquestrador com `ramLimit 8192, cpuLimit 4, ttl 24h`; `WS /exec`; `Cron /cleanup`. «readme1.txt:355-366»
ND-1074. Modele DB com Drizzle/Prisma: `sandboxes(ram_limit, cpu_limit, gpu_enabled, memory_snapshot, expires_at)`, `memory_regions`, `packages(cached_in_ram)`, `sessions`, `events`, `captcha_results`, `assets`; FilePointer com colunas BIGINT pointer/TEXT s3:///JSON manifest/BYTEA 1MB. «readme1.txt:355-366»
ND-1075. Tabela histórica `users` guarda tokens por provider (github/gitlab/gitea/hf/kaggle) — nunca em código; sandbox tem colunas `storageToRamEnabled`, `zramSizeMb default 2048`, `sshHost/sshPort/webUrl`. «readme1.txt:355-366»
ND-1076. Enum de runner do ComputeJob: `github|forgejo|codeberg|gitlab|huggingface`; dialeto Drizzle comutável `sqlite|turso|postgresql` via `TURSO_DATABASE_URL`/`TURSO_AUTH_TOKEN`. «readme1.txt:355-366»
ND-1077. Codifique erros em faixas de 4 dígitos: Network 1xxx, HTTP 2xxx, Browser 3xxx, Scraping 4xxx, Session 5xxx, Config 6xxx, com severidade low/med/high/critical e `defaultRetryDelay`. «readme1.txt:355-366»
ND-1078. Classe erros tipados por código HTTP-like: Validation 400, Blocked 403, RateLimit 429, Proxy 502, Parse 422, Auth 401, Timeout 504, Network 503 — cada um com flag de retryability e sugestões de recovery machine-readable (action, description, automated, fallback). «README.txt:241-247»
ND-1079. Cuidado com transpilação: subclassificar Error quebra `instanceof` após compilação — restaure o prototype explicitamente em todo construtor. «README.txt:241-247»
ND-1080. Modele hooks ao estilo HTTP client moderno: request/response/retry/error, middleware onion por dispatch recursivo, interceptor managers com ids numéricos e ejection, registros com prioridade numérica (menor roda primeiro). «README.txt:241-247»
ND-1081. Contrato de tree-shaking: ESM-only named exports, side-effects-free, subpath exports para errors/events, lazy registry verificado por bundle analyzer. «README.txt:241-247»
ND-1082. Faixas fixas de validação nas fronteiras: viewport 320–7680 × 240–4320 (default 1920×1080), max retries 0–10 (backoff linear ou exponencial), concurrency 1–100, timeouts 1000–300000 ms. «README.txt:147-152»
ND-1083. Defaults do browser-agent: 100 sessões máx, timeout 1h, pool 1–5 browsers × até 10 páginas, idle 60s, launch timeout 30s, rotação ao bloqueio, stealth delay 500–2000ms, 5 erros consecutivos, limiar de circuito 0,5 com reações stop/skip/restart. «README.txt:147-152»
ND-1084. A partir de v1.8.18 o engine é serializável e DENY-BY-DEFAULT: request negada a menos que política, capability receipt, aprovação ou declaração de adapter exista. «README.txt:97-112»
ND-1085. Contratos internos NUNCA executam ação privilegiada: pool de storage lê réplicas verificadas em ordem de prioridade do caller (first-healthy, verified-first, priority-first) e escreve em primary-only, best-effort mirror, quorum ou fan-out; quorum reporta outcome parcial e falha abaixo do limiar. «README.txt:113-140»
ND-1086. Planos de reparo são declarativos: nunca iniciam repair em background, nunca sondam contas, nunca mutam adapters. «README.txt:113-140»
ND-1087. Admissão de working set seleciona candidatos serializáveis contra budgets de bytes/entradas SEM ler dados; bridge plan descreve tmp file/mmap/tmpfs/zram/swap só com capability declarada, retornando plano `caller-executes` com precondições e ownership de cleanup. «README.txt:113-140»
ND-1088. Ledger de materialização registra só transições validadas e produz plano `caller-cleans`; nunca desvincula arquivos, desmonta volumes, modifica swap ou apaga réplicas. «README.txt:113-140»
ND-1089. Fronteira binária classifica prefixos de bytes por magic numbers, planeja trabalho WASM limitado, invalida reuse de transformation-cache quando fonte/compilador/chave/política diferem, e chama apenas um executor isolado INJETADO. «README.txt:113-140»
ND-1090. Cache eligibility rejeita reuse de saídas não verificadas, com segredo, privadas, ligadas a ambiente ou parciais, reportando razões normalizadas sem inspecionar nada. «README.txt:113-140»
ND-1091. Contratos de arquivo rejeitam excesso de entradas, profundidade de aninhamento, bytes de saída, razão de descompressão, caminhos absolutos e path traversal; extração exige inspeção aceita + adapter injetado. «README.txt:113-140»
ND-1092. Cadeias de provider consomem só relatórios explícitos de provider e emitem plano `caller-dispatches` em vez de fazer request remota; handoff de artefato exige digest, tamanho, identidade do provider e escolha de retenção; cancelamento reporta estado remoto DESCONHECIDO até confirmação do provider. «README.txt:113-140»
ND-1093. Manifests de delivery mantêm chunks ordenados imutáveis via content type, size e SHA-256; verificação confere bytes recebidos sem avaliar código; CDN capability records armazenam só propriedades reportadas pelo caller. «README.txt:113-140»
ND-1094. Release evidence normaliza subject digest, producer, workflow, kind, method, timestamp e status; avaliação retorna accepted/rejected/insufficient com reason codes estáveis e NUNCA trata declaração não verificada como assinatura ou avaliação de vulnerabilidade. «README.txt:113-140»
ND-1095. Release readiness é DESCRITIVA: não pode editar versões, disparar CI, publicar, assinar, escanear nem contactar registros; vincula tag, versões de manifest, gates, artifact-plan digest, targets, signing state e evidências. «README.txt:113-140»
ND-1096. Mini App plans rejeitam input com token e exigem origem HTTPS + validação escolhida pelo caller; DNS plans listam ownership, DNSSEC e HTTPS sem poder comprar domínios nem mudar zonas. «README.txt:113-140»
ND-1097. Camada de protocolo: JSON, NDJSON, SSE, blocks, envelopes de API e MCP transport; confiabilidade via retry limitado, dispatch idempotente at-least-once, circuit breaking closed→open→half-open e compensação saga. «README.txt:141-146»
ND-1098. Proibições do playground: sem upload de arquivo, código arbitrário, compilação, execução binária, instanciação WASM, eval dinâmico, worker, storage persistente, fetch, WebSocket, iframe, tokens de provider ou controle de máquina. «README.txt:153-155»
ND-1099. Modelo de recursos não negociável: in-memory storage usa RAM do processo host; SQLite in-memory e grafos de objetos são modelos lógicos, NÃO computação "sem hardware" — todo sistema executável consome recursos de algum host. «README.txt:153-155»
ND-1100. Padrões/factories apenas em objeto puro — nenhuma instância de classe vendor exigida. «README.txt:65-75»

### Memória, tiers e storage→RAM

ND-1101. Modele 4 tiers: L1 RAM (~100ns), L2 VRAM (GPU-bound), L3 Storage-RAM/repos (praticamente ilimitado), L4 buckets externos HF/Kaggle/Terabox/R2 (ilimitado, network-bound). «readme1.txt:371-385; README.txt:259-261»
ND-1102. Escada de latência: RAM ~100ns · zram ~500ns · tmpfs ~1µs · mmap ~5µs · SQLite ~10µs · objeto/R2 ~50µs. «readme1.txt:371-385; README.txt:259-261»
ND-1103. Auto-escale por tamanho: <64MB → memfs; <1GB → mmap; maior → SQLite/R2. «readme1.txt:371-385»
ND-1104. Agregue backends via rclone (70+) num único pool virtual. «readme1.txt:371-385»
ND-1105. Tune o kernel com drop-in `/etc/sysctl.d/99-zai-memory.conf`: `vm.swappiness=180`, `watermark_boost_factor=0`, `watermark_scale_factor=125`, `page-cluster=0`, `overcommit_memory=1`. «readme1.txt:398-421»
ND-1106. Crie 16GB de RAM virtual com swapfile: `fallocate -l 16G /mnt/swapfile && mkswap && swapon`. «readme1.txt:398-421»
ND-1107. Monte tmpfs dimensionado (`mount -t tmpfs -o size=8G`) — default é metade da RAM física; `/dev/shm` já é tmpfs a 50% e serve como workspace. «readme1.txt:398-421»
ND-1108. Use zram com zstd/lz4 para amplificação 2–3× (8→24GB efetivo); `zram-generator` (systemd) auto-configura no boot; prioridade via `swapon --priority 100`. «readme1.txt:398-421»
ND-1109. Clone git DENTRO da RAM: `git clone --separate-git-dir=/dev/shm/repo.git` + `mount -o bind`; worker clona `--depth 1` em tmpfs e commita resultados de volta ao storage. «readme1.txt:398-421»
ND-1110. RAM disk por loop: `dd` imagem → `mkfs.ext4` → `mount -o loop`. «readme1.txt:398-421»
ND-1111. Aplique cgroups v2: `subtree_control +memory +cpu +pids +io`; `memory.max/high`, `swap.max=0`, `cpu.max '400000 100000'`, `pids.max`, `io.max` com rbps/wbps 100MB, `memory.oom.group=1`. «readme1.txt:398-421»
ND-1112. Carregue pacotes de CDN sem instalar (sdk-loader): `fetch(esm.run/...)` → `bridge.set(...)` → `URL.createObjectURL` com SQLite como cache. «readme1.txt:398-421»
ND-1113. Redeployie sandboxes a cada 6h (`cron: '0 */6 * * *'`) e cleanup a cada 15min (`*/15 * * * *`). «readme1.txt:398-421»
ND-1114. Registre honestamente: Docker sempre consome a RAM/CPU do próprio host — cap com `-m 512m`; não existe "memória externa mágica". «readme1.txt:398-421»
ND-1115. API da bridge: `map()/sync()/read(offset,length)/write(offset,data)/grow(newSize)/close()` com PROT_READ/WRITE, MAP_SHARED, MADV_RANDOM; seed 1MB; grow via `ftruncateSync` + re-map; zero-copy. «readme1.txt:422-433»
ND-1116. PagedBuffer mantém ~50 páginas (~3MB) em RAM com hash→offset `((hash<<5)-hash)+charCode % range`. «readme1.txt:422-433»
ND-1117. SQLite como RAM: `journal_mode=WAL`, `synchronous=NORMAL`, `cache_size=10000`, `temp_store=MEMORY`; LRU touch via `UPDATE ... RETURNING value`; use `:memory:`, PGlite, libSQL/Turso ou `node:sqlite DatabaseSync` como bridge zero-dependência. «readme1.txt:422-433»
ND-1118. Limite físico: storage ≠ VRAM (VRAM ~900GB/s de barramento vs 50–300ms remoto); bucket-como-VRAM impossível; bucket-como-VHD via FUSE válido; combine mount + quantização 1/4-bit (llama.cpp, BitNet). «readme1.txt:455-467; README.txt:1-3»
ND-1119. Posicionamento honesto: "free compute + storage-as-virtual-RAM cache" — swap/tmpfs/zram/mmap/FUSE/DB in-memory aproxima; nunca literal storage→RAM. «README.txt:1-3; readme1.txt:494-504»
ND-1120. Trate objeto-storage como swap com cuidado: pode dar kernel panic/BSOD; a tese zram-vs-ramdisk registra que FS sobre bloco comprimido pode segurar os mesmos bytes 2× na memória física. «README.txt:681-720»
ND-1121. Tese storage==compute: mesmos bytes; diferença é o flag de uso (`process` vs `keep`); ambos são VFS `inode+dentry+file_operations`; repositório estático é `/usr /bin /lib`, site estático é a BIOS, trigger é o bootloader. «readme1.txt:494-504»
ND-1122. Magic bytes são a verdade sobre tipo (ELF 7F 45 4C 46, PE 4D 5A, PNG 89 50 4E 47, ZIP 50 4B 03 04); extensão é UX; MIME é só para a web. «readme1.txt:494-504»
ND-1123. Capacidade livre agregada >33TB: GitHub 500MB + HF ~10TB + Kaggle 20TB + Terabox 3TB + npm ~ilimitado + Turso 9GB. «readme1.txt:505-520; README.txt:262-268»
ND-1124. Farm de 100 worker repos × 500MB = 50GB de espaço round-robin de artefatos. «README.txt:262-268»
ND-1125. Nunca declare disponibilidade após write falho; nunca colete listagem de backend não limitada em memória (paginação pass-through). «todo-1.8.15.txt:44-92»
ND-1126. Valide range reads com offset, length, total-size e digest-boundary; falhe CLOSED quando resposta não bate tamanho/digest esperado. «todo-1.8.15.txt:44-92»
ND-1127. Nega pool vazio e identificador de membro duplicado; ordenação de membros é determinística com tie-breakers estáveis. «todo-1.8.15.txt:44-92»
ND-1128. Métricas de pool com contadores de baixa cardinalidade (attempts, hits, misses, mismatches, bytes, elapsed) sempre limitados. «todo-1.8.15.txt:44-92»
ND-1129. Admissão/evicção do working set considera tamanho, checksum, prioridade, idade, custo de transferência e budget restante; estratégias LRU, size-aware, TTL-first e ranking do caller sem metadata ilimitada. «todo-1.8.15.txt:93-131»
ND-1130. Descreva operações privilegiadas (fallocate, mkswap, swapon, tmpfs, zram, mount, cleanup) como DESCRIPTORES — o core transport-neutral nunca executa shell. «todo-1.8.15.txt:93-131»
ND-1131. Exija evidência de precondição para toda operação privilegiada: plataforma, privilégio, espaço livre, mount namespace, consentimento do usuário e plano de rollback; negue quando o adapter não prova permissão e reversibilidade. «todo-1.8.15.txt:93-131»

### Storage backends e distribuição em buckets

ND-1132. Use rclone como agregador (`copy/sync --transfers 8`; `serve http --addr :8080` como CDN improvisado) entre Terabox/HF/Kaggle. «readme1.txt:472-493»
ND-1133. R2 free: 10GB + 10M ops, egress grátis, arquivo até 5GB; Storj como opção legal S3-compatível descentralizada. «readme1.txt:472-493»
ND-1134. HF: ilimitado best-effort grátis, 10TB público + 1TB privado PRO, arquivo 500GB via Xet; Kaggle: 200GB privado total, público ilimitado, 50 arquivos top-level, egress grátis. «readme1.txt:472-493»
ND-1135. Terabox 1TB/conta (4GB/arquivo free, 20GB premium, 300 arquivos/transfer); Telegram 2GB/arquivo Bot API (4GB premium); Discord "infinito" via chunks de 8MB. «readme1.txt:472-493»
ND-1136. npm como storage: tarball 250MB/versão; chunks renomeados `.bin.js` para escapar de scan binário; `split -b 200M` → `chunk-NNN.bin.js` → `npm publish @user/assets-001` → servir via jsDelivr/UNPKG/esm.sh; 10 pacotes = 2,5GB. «readme1.txt:472-493; 505-520»
ND-1137. Cloudinary para mídia pesada (vídeo/screenshots/logs); DB guarda só `url` + `cloudinaryId`. «readme1.txt:472-493»
ND-1138. Prefira repos HF do tipo `dataset` para binários (viewer), recuperação raw via `resolve/main/file.bin`; Kaggle com `dataset-metadata.json` + `kaggle datasets create -p docs/results --dir-mode tar`. «readme1.txt:472-493; README.txt:269-277»
ND-1139. Use dockerode (^3.x) para dirigir a bridge storage→RAM e containers de sandbox sem CLI; docker-compose (npm) orquestra stacks multi-container. «readme1.txt:472-493»
ND-1140. Monte buckets HF como volumes FUSE em pods Kubernetes via `huggingface/hf-csi-driver`. «readme1.txt:472-493»
ND-1141. Zero-install principle: nunca `npm install`; todo pacote carregado por URL e executado como está (installed-first, CDN-fallback, zero-install) com SRI `sha384` em todo import CDN inline. «readme1.txt:521-536; README.txt:248-256»
ND-1142. jsDelivr: cap 50MB (GitHub)/100MB (npm), purge instantâneo — "o S3 pirata"; esm.sh sem hard limit (~100MB) com `?bundle&min&target`; Skypack deprecado → esm.sh. «readme1.txt:521-536; README.txt:262-268»
ND-1143. Browsers limitam ~6 conexões SSE por origem; Cloudflare free mata idle ~100s → keep-alive a cada 30s. «readme1.txt:521-536»
ND-1144. GCore 1TB/mês grátis é edge compute, não só CDN; Statically transforma imagens de GitHub/GitLab/Bitbucket. «readme1.txt:521-536; README.txt:262-268»
ND-1145. Sharding SQL por hash-mod: 40 shards × 3GB = 120GB ou 400 shards = 1,2TB sobre HTTPS-only — FLAGUE que farmear contas grátis viola ToS; rotas compliant = bucket barato pago ou forge+object-store self-hosted. «readme1.txt:505-520; README.txt:269-277»
ND-1146. File-as-compute: 600MB → 600 chunks em 10 repos → rebuild em tmpfs de 8GB → executa → devolve URL de resultado em CDN; inline-bytes só <10MB, maior referencia storage-key com metadata JSON. «README.txt:278-283»
ND-1147. Limites SQL: Postgres campo 1GB com TOAST, 32TB/tabela; MySQL blob 4GB; base64-em-JSON é anti-pattern (+33% overhead); particione tabela de chunks por file id com PK composta. «README.txt:278-283»
ND-1148. Turso serve de fila de farm (workers inserem rows `queued`, Actions atualizam status e result URLs); DBs criadas idempotentemente no deploy por endpoint boot-init guardado por shared secret, nunca localmente. «README.txt:278-283»
ND-1149. Edge storage: Workers KV TTL mínimo 60s sem batch reads; Upstash REST com sliding windows via sorted-sets pipelined; Deno KV expiração em ms e transações versionstamp. «README.txt:416-428»
ND-1150. Não baixe cópias do FIRECRAWL nem código AGPL (minio, firecrawl) para dentro de Saddle GPL-3.0-only sem revisão legal separada. «README.txt:531-560; repo-research-1.8.16.txt:1-120»

### Compute: free runners e farm

ND-1151. GitHub Actions: 2 vCPU/7GB/14GB SSD 6h/job (4vCPU/16GB tier maior), minutos ilimitados em OSS, 20 jobs simultâneos (teto de concorrência), `ubuntu-latest` (evite macos/windows ~10× custo); LFS 1GB+1GB/mês. «readme1.txt:540-566»
ND-1152. Runner pequeno `ubuntu-slim` (Jan-2026): 1 vCPU/5GB/14GB/15min por job. «readme1.txt:540-566»
ND-1153. Forgejo Actions ~95% / Gitea Actions ~90% compatíveis com GitHub Actions; self-hosted grátis com ~512MB RAM mínima por runner; runner via `gitea/act_runner:latest` + `GITEA_RUNNER_REGISTRATION_TOKEN` + docker.sock. «readme1.txt:540-566»
ND-1154. GitLab Free: 400 min/mês, 2vCPU/8GB (small) vs 4vCPU/16GB (medium, 2× custo); TAG medium quando `ramLimit>8192` senão small; seletor `gpuEnabled→hf, ramLimit>16384→gitlab, else github`; runner keep-alive `sleep 3600`; sandbox id `sbx-${Date.now()}-${rand}`. «readme1.txt:540-566»
ND-1155. Codeberg+Woodpecker: FLOSS ilimitado, storage soft 750MB + 1,5GiB LFS/packages; labels de runner por RAM: `codeberg-tiny` 1vCPU/2GB/2min, `small` 2/4GB/5min, `medium` 4/8GB/10min. «readme1.txt:540-566»
ND-1156. HF Spaces: 16GB RAM 2vCPU, suspende após ~2 dias idle (keep-alive cron ~47h); ZeroGPU ~96GB VRAM ~5min/dia grátis; bucket 500GB/arquivo; push via `huggingface/gh-actions-git-lfs-push@v1` (HF_TOKEN) ou `HfApi().uploadFolder`; código roda como app Gradio que envolve `subprocess.run(['python3','-c',code])`. «readme1.txt:540-566»
ND-1157. Kaggle: 30h/semana GPU T4/P100 (30h separadas cada), 4 CPU/29GB RAM/GPU 32GB VRAM/12h por sessão, 20GB storage, 200GB/dataset; push com `kaggle kernels push --enable-gpu`. «readme1.txt:540-566»
ND-1158. Oracle Always Free: VM.Standard.A1.Flex 2 OCPU/12GB ARM/200GB; agregado livre ~92GB (16GB real + 32GB zram + 12GB Oracle + 32GB GPU VRAM). «readme1.txt:540-566»
ND-1159. ModelScope: 2 notebook VMs 4vCPU/16GB/50GB + API OpenAI-compatible 2000 calls/dia; Alibaba PAI-DSW 8vCPU/32GB + GPU 24GB sob quota 36h. «readme1.txt:540-566»
ND-1160. Cloudflare Workers como orquestrador free: 100K req/dia, D1 + Durable Objects + R2, 128MB/Worker; `wrangler d1 create`, `wrangler secret put GITHUB_TOKEN`, `wrangler deploy`; cron `scheduled(event)` para `cleanupOldSandboxes`. «readme1.txt:540-566»
ND-1161. Vercel Sandbox: microVM Firecracker por sessão, runtimes node26/24/22/python3.13, usuário `vercel-sandbox`, Docker+FUSE dentro, domain-allowlist atualizável, 1 usuário Linux por agente, secrets brokered sem vazar `console.log` de env. «readme1.txt:540-566; README.txt:284-320»
ND-1162. Netlify: sync 10s / async 15min / edge 50ms; 125k function reqs/mês; NÃO spawn child_process (envolva Python como microserviço HTTP isolado) — por isso só static/edge no core. «readme1.txt:540-566»
ND-1163. Cadeia de providers: `oracle-cloud → github-actions → huggingface → gitlab-ci → kaggle`; dispatch quebra no primeiro runner free; `farm.py` round-robin `workflow_dispatch` quebrando no HTTP 204 do primeiro worker livre. «readme1.txt:540-566; README.txt:321-360»
ND-1164. Mirror multiplier: push simultâneo a todos os forges multiplica compute ~4× (≤4×). «readme1.txt:505-520; README.txt:321-360»
ND-1165. Doutrina third-party-only (V5): infra só é "própria" se na máquina física do operador; repo na Azure/GitLab/HF com runner deles é third-party; conta sua ≠ infra sua. «readme1.txt:505-520»
ND-1166. Cadeia de custódia end-to-end: Browser 50KB → api → Actions runner (Microsoft) → HF/Kaggle/Terabox/NPM → repo third-party; cada seta é 1 request HTTPS; footprint local 0 bytes. «readme1.txt:505-520»
ND-1167. Modelagem V4 repo-como-processador: C1 Pages/CDN serve JSON (sem minutos), C2 Git Queue usa Issues/Discussions/`queue/` como fila, C3 Actions Worker é a única camada que consome minutos. «readme1.txt:584-598»
ND-1168. Trigger vocabulary: `repository_dispatch` (cross-repo PAT), `workflow_dispatch` (ref+inputs, retorna run_id), `workflow_call` (reusável), `workflow_run` (cadeia); `repository_dispatch` = IPC entre repos. «readme1.txt:584-598»
ND-1169. Bridge entre Pages: Site A fetch `site-b.github.io/api/queue.json` exige `Access-Control-Allow-Origin: *` ou proxy `github.io`; bridge completa A --POST dispatch→ api.github.com → Action roda → commit em docs/queue.json → Pages rebuild → B faz GET. «readme1.txt:584-598»
ND-1170. Escrita git REST atômica em 3 passos: blob (retorna SHA) → tree → commit. «readme1.txt:584-598»
ND-1171. OCI como storage content-addressed: `oras push` em GitHub/GitLab Packages; Chainloop CAS. «readme1.txt:584-598»
ND-1172. Ciclo por sandbox: repo + pipeline + cron + timeline (issue): createRepo → createPipeline → createCronJob → createTimeline; ciclo de sessão resumível artifact → mmap → run → sync → artifact. «readme1.txt:584-598»
ND-1173. Dispatch APIs por forge: GitHub `POST .../workflows/{id}/dispatches` (run_id desde Fev/2026); GitLab pipeline_schedules + trigger/pipeline; Forgejo/Gitea `/api/v1/repos/{owner}/{repo}/actions/workflows/{id}/dispatches`; HF `/api/repos/create` (type space, sdk docker) + hardware; Kaggle `/api/v1/kernels/push` com Basic auth e metadata enable_gpu/tpu/internet. «readme1.txt:505-520; README.txt:321-360»
ND-1174. Nuance de ToS preservada: hosting serverless genérico é banido pelos forges, mas processar binário do SEU PRÓPRIO repo via Actions é uso aceitável; farm que sharda contas descartáveis é a parte que viola ToS; cap de repo <5GB (warning 50MiB / CLI 100MB). «readme1.txt:698-712; README.txt:321-360»
ND-1175. Ferramentas de runner: `ephemerd` (containerd single-binary, isolation gvisor) + `ezgha init|doctor|serve` para runners efêmeros; `act` (71,1k★) roda workflows GitHub localmente via Docker. «readme1.txt:567-583»
ND-1176. Mapeie tiers de RAM para labels de runner: `sandbox-8gb:docker://sandbox-image:latest`, `-4gb`, `-2gb` com `capacity: 2` e flags `--memory=8g --cpus=4 --pids-limit=512`. «readme1.txt:567-583»
ND-1177. Self-hosted stack mínima: woodpecker-server (`WOODPEEKER_GITEA=true`) + woodpecker-agent (bind docker.sock) + api (`DATABASE_URL=sqlite:///data/sandboxes.db`). «readme1.txt:567-583»
ND-1178. code-server como IDE dev hospedada em sandbox (bind 0.0.0.0 porta 7860 em HF Spaces). «readme1.txt:567-583»
ND-1179. Teto WASM: browsers limitam 4GB default; WASM 3.0 Memory64 sobe para 16GB por instância. «readme1.txt:567-583»
ND-1180. Pinned Firecracker release v1.7.0 (x86_64) para microVMs. «readme1.txt:567-583»

### Isolamento e sandboxes

ND-1181. Regra do kernel: SEM KVM → gVisor `runsc`; COM KVM → Firecracker microVM. «readme1.txt:599-619; README.txt:284-320»
ND-1182. Escada de isolamento por risco: child_process nativo = sem isolamento (alto risco, serverless bloqueia subprocess); Pyodide-WASM/WASI = module-safe; MicroVM (Firecracker/Kata/gVisor) = preferido para código de terceiros não confiável. «readme1.txt:603-619»
ND-1183. Runtime table de cold start: kern ~1,9ms rootless 1,5MB; rust-nano-vm ~12ms 0,5MiB/fork; CubeSandbox <60ms KVM+eBPF; HiveBox 10–50ms namespaces+seccomp+Landlock; Mitos ~27ms warm CoW; gVisor ~200ms; E2B <100ms ~$0,50/h; Docker ~300ms. «README.txt:284-320»
ND-1184. Docker endurecido: `--network=none --cap-drop=ALL --security-opt=no-new-privileges --read-only --pids-limit=512 --runtime=runsc`; defaults de sandbox 512MB RAM + 1 vCPU + volume de dados por usuário + cleanup após 30min inativo. «README.txt:284-320»
ND-1185. V8 isolates (isolated-vm, starts <5ms <5MB) são o default para JS não confiável; edge VM contexts complementam. «README.txt:284-320»
ND-1186. BANIDOS: `vm2` (onda de CVEs de sandbox-escape: CVE-2026-22709, CVE-2025-68613, CVE-2026-1470) e `node:vm` documentado explicitamente como NÃO sendo fronteira de segurança. «README.txt:284-320; readme1.txt:698-712»
ND-1187. Empilhe hardening de container: cgroups v2 (cpu.max, memory.max/high, swap.max=0, pids.max 512, io.max, OOM group) + seccomp + AppArmor + OverlayFS; estatísticas lidas direto do filesystem de cgroup. «README.txt:284-320»
ND-1188. Guard reativo de RSS mata processos descontrolados acima de 500MB. «README.txt:284-320»
ND-1189. Nesting de gVisor exige containers privilegiados; Kubernetes pareia runtime classes com resource quotas. «README.txt:284-320»
ND-1190. Firecracker exige host KVM dedicado com kernel/rootfs/jailer — infra dedicada impossível dentro de site estático. «README.txt:284-320»
ND-1191. Mesh WASM in-browser: gateway dispara execuções via shared-memory buffers e atomics; worker sandbox com timeout de 8s que se auto-fecha no overrun; interpretador WASM/WASI cap 512 páginas (~32MB); mutation scanning em blocos paginados; remote memory mapper sobre streams gzip com transporte base64; defesa OOM em 3 camadas; janela HMAC-SHA256 de 5min ligada à identidade do projeto; concorrência fixa em 1; builds com wasm-opt e cache imutável por content-hash. «README.txt:284-320»
ND-1192. Persistência de mesh estático: 4 sites + 1 site de documentação passivo, cada um com DB SQLite por identidade criado on-demand atrás de rota de banco, sincronizado por engine incremental com checksum Fletcher-32 por bloco de 1KB para delta sync. «README.txt:284-320»
ND-1193. Liquid sandbox via CI: baixa artefato de estado anterior, mapeia em memória, fetch de pacotes CDN para o buffer, executa, sincroniza de volta, re-upload sob retenção de 7 dias — cada sessão retoma exatamente. «README.txt:284-320»
ND-1194. Traduza bytecode Maven/NuGet para WebAssembly para execução no browser quando aplicável. «README.txt:284-320»
ND-1195. Neko como candidato caller-owned de remote-browser adapter: exige seleção de imagem, networking, autenticação e TURN/port routing; persistência de browser e acesso a arquivos exigem policy/volume explícitos. «README.txt:531-560»
ND-1196. Lições Neko adotadas: runtime base + imagens de engine distintas, capability receipts de plataforma/imagem, display remoto como transport adapter, persistência de perfil opt-in, separação de build workflows da operação de serviço. «README.txt:531-560»
ND-1197. Rejeite qualquer "master browser" que funda engines: caminho realista é um shell selecionando entre engine adapters construídos e evidenciados independentemente (Chromium-family e Gecko-family cada um com seu capability receipt; WebKit só planejamento). «README.txt:531-560»
ND-1198. Ciclo 1.8.19 (virtual browser) shipa modelo de capability DATA-ONLY com fixtures primeiro — sem Neko embutido, binários, Docker, credenciais TURN ou perfis; claim de sessão real exige display transport, signaling, autenticação e network-policy no contrato do adapter. «README.txt:531-560»
ND-1199. Ciclo 1.8.21 (estudo comparativo): 60 repos públicos analisados via API (54 relevantes, 64 code samples), 130 candidatos planejados — evidência, NÃO adoção: não copia código, não herda credenciais, não reproduz anti-bot, não adota padrão sem revisão independente de compatibilidade e segurança; popularidade não é correção. «README.txt:531-560; readme1.txt:160-174»
ND-1200. Rejeite padrões dos concorrentes: hosted stealth browsers, rotação automática de proxy, captcha solving, object stores embutidos, dispatch APIs cloud-specific, módulos worker nativos no grafo universal, copiar código de provider. «README.txt:531-560»

### Scraping, crawl, cache, retry e proxy

ND-1201. Extração structured-first: JSON-LD → Microdata → OpenGraph/Twitter → RSS/Atom → Readability → raw HTML. «README.txt:191-204»
ND-1202. HTML→Markdown: turndown 7.2.4 / node-html-markdown / mdream (Rust/WASM ~33× mais rápido, ~15ms/MB); Markdown reduz tokens 60–80% vs HTML. «README.txt:191-204»
ND-1203. TTL por tipo: estático 24–72h, semi 4–24h, dinâmico 30min–4h, realtime 30s–5min. «README.txt:191-204»
ND-1204. Retry apenas em 429/500/502/503/504/408/409/520–530 + ECONNRESET/REFUSED/TIMEDOUT/ENOTFOUND; NUNCA em 400/401/403/404/410/422/451/407/426. «README.txt:191-204; 15.research.retry.rate.limit.txt:1113-1160»
ND-1205. Circuit breaker CLOSED→OPEN→HALF_OPEN com threshold 5 e reset 60000ms + compensação Saga. «README.txt:191-204»
ND-1206. Rate limit por algoritmo: Token Bucket, Sliding Window Log/Counter, Fixed Window, Leaky Bucket; honre `Retry-After`/`X-Rate-Limit-Reset` com margem de segurança e delay computado cacheado por URL. «README.txt:191-204»
ND-1207. Concurrency: p-limit/p-map/p-queue (priority, intervalCap)/p-retry/bottleneck/rate-limiter-flexible/cockatiel; AutoscaledPool e BrowserPool (1–20 browsers, 1–50 páginas). «README.txt:191-204»
ND-1208. RAG chunking: faixa ideal 400–500 tokens com overlap 10–20% e heading path; tokens ≈ caracteres/4; `llms.txt` com no máximo 100 links atômicos HTTPS. «README.txt:205-208»
ND-1209. Estratégias de enqueue: same-hostname (exclui subdomínios), same-domain (inclui), same-origin (host+porta), follow-all; DFS puro inserindo links na CABEÇA da fila. «README.txt:209-215»
ND-1210. Heurística de prioridade de crawl: navegação baixa, artigos média, pular binários/login/signup/querystrings de paginação. «README.txt:209-215»
ND-1211. Kill list de parâmetros de tracking cobre famílias inteiras de analytics (incluindo HubSpot, TikTok, ByteDance e analytics chineses); resolução canônica prefere o link canonical declarado e registra redirect chains com timestamps. «README.txt:209-215»
ND-1212. JSON-LD deve aceitar arrays top-level e containers `@graph` com field maps por tipo; microdata resolve propriedade por content → href → src → text. «README.txt:216-222; 18.research.content.extraction.txt:51-376»
ND-1213. API interception (escutar page responses filtrando por regex/method/status/content-type) supera rendering para sites API-driven. «README.txt:216-222; 18.research.content.extraction.txt:1154-1335»
ND-1214. Infinite scroll: bombear passos fixos de pixel em intervalos e então esperar. «README.txt:216-222»
ND-1215. Self-healing selectors geram variações antes de escalar para extração model-based e fallback de texto inteiro. «README.txt:216-222»
ND-1216. Sanitização dividida: allowlisting server-side vs purificação browser-side. «README.txt:216-222»
ND-1217. Parser footprints: Cheerio ~10M downloads semanais ~1MB/página; jsdom mais pesado mas executa scripts; parse5 é a referência spec-complete para HTML malformado. «README.txt:223-226»
ND-1218. Cache craft: revalidação condicional ETag/If-None-Match e Last-Modified/If-Modified-Since com short-circuit 304; TTL automático por headers (no-store→uncachable, max-age → shared max-age → default); writes transacionais com TTL zero; keys versionadas mantendo last-N gerações. «README.txt:227-240»
ND-1219. Stale-while-revalidate serve stale instantaneamente e revalida em background escrevendo nas duas camadas (fresh 5min, stale window 10min); promoção multi-camada move hits de disco para memória. «README.txt:227-240»
ND-1220. Intercepção de rotas do browser cacheia apenas stylesheets/scripts/imagens/fonts, renovando TTL no 304 sem refetch. «README.txt:227-240»
ND-1221. Subsistema de proxy: cascata de preços residential (~$15/1k reqs) → datacenter (~$0,50) → público/free com transições explícitas de downgrade/upgrade; health checks em loops de 60s contra echo endpoints. «README.txt:227-240»
ND-1222. Graveyard pool: enterrar proxy após 3 falhas e reviver após 5min com contadores zerados; seleção ordena por tempo de resposta medido. «README.txt:227-240; readme1.txt:355-366»
ND-1223. Session pinning: 1 fingerprint = 1 proxy = 1 sessão; stickiness por domain-hash; alertas acima de 30% de falha ou 5s de latência média; rotação smart casa país-alvo com least-used. «README.txt:227-240; 396-410»
ND-1224. Matching por tipo de alvo: sites governamentais pedem residential específico do país, redes sociais pedem mobile 4G/5G, APIs públicas toleram datacenter. «README.txt:227-240»
ND-1225. Concurrency adaptativa: janela de 100 samples mirando 10% de erro — cortar 30% quando erro exceder 1,5× do alvo, subir 20% quando abaixo de metade, re-avaliando a cada 10s; variante de latência corta quando latência de cauda dobra o alvo. «README.txt:227-240»
ND-1226. Autoscale: sobe quando CPU<50% E memória<70%; desce quando CPU>80% OU memória>85%; cap assimétrico. «README.txt:227-240; 21.research.batch.concurrency.txt:693-812»
ND-1227. Bulkhead isolation limita concorrência por bulkhead e total com contadores compartilhados; chains de fallback terminam em resgate web-archive disparado especificamente no 404. «README.txt:227-240»
ND-1228. Camadas cockatiel: timeout → breaker (percentual, abertura temporizada, hooks half-open) → retry exponencial com jitter → fetch. «README.txt:227-240»
ND-1229. Streaming: desabilitar buffering de reverse proxy + header no-buffering; CDNs free matam streams idle ~100s → keepalive a cada 30s; HTTP/1.1 limita 6 streams concorrentes por origem; NÃO streamear payloads <50KB; WS heartbeat ping 30s mata sockets mortos com subscriptions por job. «README.txt:227-240»
ND-1230. Rate limiting de API: global 1000 req/min por usuário, endpoints caros 10; headers draft-standard keyed por conta; request-ID audit trails. «README.txt:416-428»

### Movimento, anti-detection e captcha

ND-1231. Movimento humano determinístico: mouse com Bezier única, ramp de velocidade 0,3×→2,5× por arc-length (0–5% rampa, 5–75% cruzeiro 2,3–2,5×+sine, 75–100% ease-out), drift sub-pixel σ0,3–1,5px, ~15% overshoot; duração por Fitts `0,05 + 0,07*log2(1 + d/20)`s; digitação lognormal μ=4,17 σ=0,3 (~65ms) + bigram speedup + ~2% typos; scroll com accel/decel/overshoot. «readme1.txt:355-366; README.txt:396-410»
ND-1232. Postura anti-detection honesta: ad-block e stealth flags, fingerprints human-like, middleware onion, honrar robots/sitemap, movimento determinístico; captcha apenas como superfície opt-in de pesquisa supervisionada — NUNCA silenciosamente. «README.txt:396-410»
ND-1233. Stack recomendada: patchright (fork Playwright que edita código-fonte do Chromium) + puppeteer-extra-plugin-stealth + rotação Crawlee de fingerprints + proxies residential + randomização comportamental; evite rebrowser-playwright (sem manutenção desde 2024). «README.txt:396-410»
ND-1234. Rotação coerente: 1 fingerprint por sessão cobrindo OS↔UA↔engine↔locale↔timezone↔touch; distribuições de mercado amostradas (Chrome 65%/Safari 18%/Firefox 12%/Edge 5%; Windows 55%/macOS 25%/Linux 15%/Mobile 5%; telas 1920×1080 30%…); pools de sessão limitam tamanho, uso e idade. «README.txt:396-410»
ND-1235. Benchmarks de detecção (Mar/2026, 0–30): Playwright vanilla 26, stealth sozinho 18, patchright 24 (único passando TLS+HTTP/2+CDP), CloakBrowser 26; fingerprint de áudio derrota TODOS os testados. «README.txt:396-410»
ND-1236. Pipeline de captcha em camadas: fingerprints→stealth, comportamento→movimento Bezier+lognormal, TLS/IP→residential sticky regional, challenges→VLM-ou-token-solver como ÚLTIMA camada reservada para ~1–5% das sessões flagadas. «README.txt:396-410»
ND-1237. hCaptcha via `hcaptcha-challenger` ONNX com mapeamento desafio→modelo (binária→ResNet, área→YOLOv8, bounding box→segmentação, drag-drop→spatial chain-of-thought, múltipla escolha→ViT zero-shot). «README.txt:396-410»
ND-1238. APIs de token (NopeCHA, 2Captcha, CapSolver) cobrem hCaptcha, Turnstile (~5s via click-solver free) e reCAPTCHA; catalogue tipos extra: KeyCaptcha, Amazon WAF, MTCaptcha, Lemin, Cutcaptcha, Tencent, Yandex, ALTCHA, Prosopo. «README.txt:396-410»
ND-1239. Captcha bypass automatizado é o RISCO #1 do projeto — potencialmente ilegal e violação de ToS; ship apenas opt-in supervisado; não é release blocker. «readme1.txt:698-712, 736-757»
ND-1240. Recuperação em cadeia: detect-captcha → rotate → retry com aquecimento de conta (warming). «README.txt:396-410»
ND-1241. Operar BTS/rede celular sem licença ANATEL (BR)/FCC (US) é crime — nenhum 3G-from-code. «readme1.txt:698-712; README.txt:581-600»
ND-1242. Movement logs são JSON reproduzível (`version: 1`) com bloco de sessão (id, agentName, browser, originUrl, seed, personality, viewport, status), events array (move/click/drag/scroll/key com coordenadas CSS px, timing relativo, ângulos de wheel, targets keyed to seed), bloco captcha e bloco metrics. «README.txt:429-455»
ND-1243. Action recorder limita sessões a 2000 eventos com accessors manifest/export/clear que retornam cópias. «README.txt:429-455»
ND-1244. Formas de memória: episódica (event log append-only), semântica (recall por cosseno top-k), namespaced (TTL, autosave flush 10s) e cross-session (merged no boot); engine limita 128 entradas e 64MB por default. «README.txt:429-455»
ND-1245. Persistência de cache: checkpoints a cada 10 páginas sob TTL 7 dias retomando por job id derivado de hash da lista de URLs; Bloom filter dimensionado por fórmula (100k URLs, 1% falso-positivo); compressão nativa encolhe payloads 60–80% acima de 10KB; writes atômicos com temp keys e rollback. «README.txt:429-455»
ND-1246. Doutrina de tiers de cache: hot → LRU (1000 itens, 5min), warm → SQLite/Redis (100k, 1h), cold → IndexedDB/KV (7 dias), archive ilimitado; eviction pareia eager-TTL/hot, lazy-interval/warm, scheduled-expiry/cold, LRU/hot, size-based/warm; acesso resiliente caminha memory→SQLite→Redis continuando após falhas individuais. «README.txt:429-455»
ND-1247. Fingerprints persistidos concatenam canvas hash, GPU renderer unmasked, assinaturas de audio-context, dimensões de tela e timezone antes do hash; detecção de mudança compara hashes. «README.txt:429-455»
ND-1248. Benchmark computer-use: OSWorld humano 72,4% vs SOTA 12–20%; WebArena ~71%; WebVoyager 89,1%; Operator 87% em sites JS complexos mas 58% WebArena; Mariner 83,5%/84% ScreenSpot. «README.txt:411-415»
ND-1249. Receita híbrida vencedora de computer-use: raciocínio DOM/árvore-de-acessibilidade para alvos estruturados, modelos de visão para canvas e layouts não padrão, scripts determinísticos para validação/replay, verificação por diff de screenshots antes/depois. «README.txt:411-415»

### Bots e integrações

ND-1250. SaddleBot unifica GitHub, GitLab, Forgejo, Gitea, Bitbucket, Discord, Telegram, Reddit, Slack, Mastodon, Matrix e Bluesky via contrato `PlatformAdapter` (authenticate, listRepos, createWebhook, executeBot) envolto por safe adapter que captura toda falha em envelopes success/result/error. «README.txt:450-469»
ND-1251. Auth por adapter: scopes repo+workflow+org-read no forge dominante; tokens api-scope no GitLab; reuse do adapter GitHub com base-URL custom para Forgejo/Gitea; bot tokens no Discord. «README.txt:450-469»
ND-1252. Webhooks: push, pull request, issues, comments, releases e deployment events com verificação de secret-token. «README.txt:450-469»
ND-1253. Matriz de comandos unificada de 12 verbos (capture/scrape/review/deploy/memory/test/release/webhook/schedule/publish/artifact/status) com disponibilidade por plataforma — deploy limitado aos 3 forges maiores, publish efetivamente forge-nativo. «README.txt:450-469»
ND-1254. Loop runtime canônico: webhook chega → parse → seleciona adapter → executa → persiste resultado no memory backend → reporta status → opcionalmente dispara CI. «README.txt:450-469»
ND-1255. Alvos de registro de bots futuros: GitHub Apps, GitHub OAuth Apps, Google OAuth Apps, Reddit, WhatsApp (QR/cloud API). «readme1.txt:610-617»
ND-1256. Catálogo de bots de ecossistema em 3 papéis (automação computacional, code review, segurança/CI-CD) com 33+ bots derivados (FreeClaw, become-ceo, robin, acrobot, li-agent, AutoAR, AutoTriage entre eles) — cada bot integrado é escolha do caller. «readme1.txt:620-634; README.txt:450-469»
ND-1257. `appregistry`/`commandguard`/`deliveryqueue` rastreiam instalação/scopes/revogação de apps, aplicam scopes de comando de bot, e fazem retry de webhooks com dead letters (idempotência desde 1.7.0). «readme1.txt:55-97, 816-832»

### Packaging, registries e release

ND-1258. Seven gates pré-publicação: tests, lint, typecheck, build, README atualizado, changelog atualizado, nenhuma breaking sem major bump. «readme1.txt:681-697»
ND-1259. Gates pré-tag: `npm run check`, `formatcheck`, `test`, `pack:check`, `git diff --check`. «readme1.txt:681-697»
ND-1260. Caminho de release: validação de source → validação de package → tag → GitHub release → publicação independente por registro; o repo NUNCA guarda token de registro. «readme1.txt:816-832; README.txt:471-495»
ND-1261. Token npm previamente exposto está comprometido: revogar; usar OIDC Trusted Publishing; publicação no npm público bloqueada até owner substituir token; NUNCA reutilizar. «readme1.txt:681-697»
ND-1262. Injete NPM_TOKEN só como `NODE_AUTH_TOKEN`; GitHub Packages usa `GITHUB_TOKEN` curto; nenhum token em código/commit/chat. «readme1.txt:681-697»
ND-1263. 38 assets por release desde 1.8.12: 6 Linux, 6 Windows, 4 macOS (inclui app bundles), 2 Android, 1 container archive, 1 extension ZIP, 9 manifests e 9 checksums; naming `saddle.<surface>.<version>.<os>.<abi>.<ext>`; CycloneDX SBOM + provenance in-toto-shaped. «README.txt:471-495»
ND-1264. Estados de assinatura honestos: unsigned, ci-test-key, caller-owned, notarized, provider-signed, store-signed; manifests declaram o estado real — nunca represente ci-test-key como production-signed. «readme1.txt:112-124; README.txt:471-495»
ND-1265. Biblioteca open-source pode IMPLEMENTAR formatos de assinatura mas não pode cunhar certificado que Windows/Apple/store já confia; confiança pública vem só de root program, store, CA, managed provider ou programa OSS aprovado. «README.txt:471-495»
ND-1266. Práticas de assinatura PROIBIDAS: baixar "certificados universais", reusar chaves de outro projeto, commitar self-signed certs, alegar confiança para artefatos unsigned. «README.txt:471-495»
ND-1267. Forks e runs do Dependabot não recebem secrets do repo — jobs deles buildam/escaneiam/reportam unsigned ou test. «README.txt:471-495»
ND-1268. Release automation rejeita quando tag difere do manifest do pacote e faneia para 6 workflows de registro; versão de release derivada da tag por shared action (sem versão manual). «README.txt:471-495; readme1.txt:816-832»
ND-1269. Ids de artefato Maven devem ser lowercase/dígitos/hífens; coordenada Maven legada não pode ser deletada (falta permissão package-management delete); pin JDK 26 (não `latest`). «README.txt:471-495; readme1.txt:816-832»
ND-1270. GHCR: imagens privadas por default; só linkam a repo quando o Dockerfile carrega OCI source label; exit code de sucesso ≠ disponibilidade visível — verifique direto as package pages do owner. «README.txt:471-495»
ND-1271. RubyGems: publish permanente falha em host com trailing slash (redirect loops); NuGet self-hosted NÃO suporta trusted publishing (usar Entra ID para blobs). «README.txt:471-495»
ND-1272. Registries: npm `@wenathlan/saddle`, GHCR amd64/arm64/ppc64le, Maven `io.wenathlan:saddle`, NuGet `Saddle`, RubyGems `saddle`, PyPI via trusted publishing, ClawHub/OpenClaw (host version mínimo pinned), GitHub Pages. «README.txt:471-495»
ND-1273. Matriz de containers 1.8.17: só plataformas que buildam E executam o runtime empacotado — `linux/amd64`, `linux/arm64`, `linux/ppc64le`; nunca declare plataforma `unknown` como OS/arquitetura runnable; registre combos rejeitados com razão técnica. «todo-1.8.16.txt:667-681»
ND-1274. Smoke de container 1.8.17+: registry index inspection → pull → comparação de labels → execução de CLI. «README.txt:496-530»
ND-1275. Cache retention workflow: roda após CodeQL e diariamente; run manual reporta candidatos, `apply=true` obrigatório para deletar; scope `actions: write` + `contents: read`; manter 3 CodeQL mais recentes, 2 Node, 1 por família, e entries tocadas em 6h em refs não-default; deleção idempotente (404 logado, nunca aborta). «readme1.txt:112-124; todo-1.8.16.txt:653-666»
ND-1276. Jobs tag-scoped (target planning de release + publicação GitHub Packages npm) DESLIGAM o cache Node. «readme1.txt:112-124»
ND-1277. Inventário de caches antes de mudar retenção: 85 entries / 7.785.944.423 bytes no caso 1.8.16, dominados por overlays CodeQL. «todo-1.8.16.txt:653-666»
ND-1278. Workflows: 18 definições + 2 composite actions em `.github/workflows` (lowercase .yml) + dependabot.yml no local exigido pelo GitHub. «todo-1.8.16.txt:653-666; readme1.txt:112-124»
ND-1279. Android release: assinatura de produção do caller SÓ quando secrets existem; senão gera `ci-test-key` temporário, anexa APK/AAB e registra no manifest; iOS release desabilitado até caller habilitar signing/provisioning separado. «readme1.txt:112-124»
ND-1280. CI conventions: publish release-authoritative no GitHub Actions; demais forges rodam gates determinísticos idênticos; cleanup deleta artefatos >7 dias semanalmente; workflows third-party-only forçam imagens públicas de runner; segredos viajam base64-wrapped <48KB via rclone-action helpers. «README.txt:321-360»
ND-1281. Ferramenta de build: tsdown (Rolldown) recomendado no lugar do tsup (legado); binário standalone via `bun --compile`; alternativas Node SEA e Deno compile. «readme1.txt:787-800»
ND-1282. Cobertura mínima de testes 60%; um `*.test.ts` por módulo. «readme1.txt:787-800»
ND-1283. tsconfig: target ES2024, module ESNext, moduleResolution bundler, strict, declaration+declarationMap, verbatimModuleSyntax. «readme1.txt:787-800»
ND-1284. Compilação Bun: 8 cross-targets incluindo variantes musl, bytecode que corta startup pela metade, constantes de build, assets arbitrários embutidos, DBs SQLite embutidas, native addons, executáveis full-stack, icon/console Windows e codesign macOS. «README.txt:561-580»
ND-1285. Node SEA: sentinel fuse identifier documentado; ciclo macOS sign-strip-resign; hard-limited a CommonJS. «README.txt:561-580»
ND-1286. WASM packaging: inline módulos <14KB com targets auto por ambiente e padrão de import async-init. «README.txt:561-580»
ND-1287. Escape hatches de native deps: SQLite síncrono → runtime-native ou pure-JS; crypto nativa → pure JS; processamento de imagem → pure JS ou bundle externalizado. «README.txt:561-580»
ND-1288. Android CI em cadeia: node setup → assembly no-daemon → prebuild → keystore secrets → Gradle publishing config distinguindo archive de jar. «README.txt:561-580»

### Segurança, legal e governança

ND-1289. Segurança de supply chain: CodeQL (source+workflow), OSV Scanner (SARIF multi-ecosystem), cargo audit, npm audit, dependency review, secret scanning, SBOM, checks de artefato — gate fechado em high/critical alcançáveis. «README.txt:581-600»
ND-1290. Baseline de auditoria histórica: 42 alerts abertos em 1.8.7; Trivy juntou-se depois. «README.txt:581-600»
ND-1291. Advisory Tauri/glib (GHSA-wrw7-89jp-8q8g) tratado como limitação transitiva documentada: CI falha em versões afetadas reachables novas; advisory existente Linux-only sobrevive como ignore com prazo, rationale e tracking upstream; manifest expõe accepted-risk em vez de declarar bundle limpo. «README.txt:581-600»
ND-1292. AUP: operação legal, respeito aos termos de cada provider, proteção de credenciais e autorização antes de acessar sistemas; proibido malware, evasão de access control, ataques a terceiros, violação de privacidade, infração de IP e abuso de quota. «README.txt:581-600»
ND-1293. Política de trademark reserva as marcas Saddle/Saddle Browser e exige nomes distintos para distribuições modificadas sem restringir direitos GPL. «README.txt:581-600»
ND-1294. Privacidade é caller-configured; o core só transfere informação a outros sistemas por request explícito. «README.txt:581-600»
ND-1295. Usar HF/Kaggle/Terabox como dump pessoal ou pirataria dispara bans; ~40 contas descartáveis para driblar free tiers violam ToS — caminho correto é tier pago barato ou Forgejo+MinIO self-hosted. «readme1.txt:698-712; README.txt:581-600»
ND-1296. Caps de forge storage: warning acima de 50MB, rejeição acima de 100MB, bloqueio de repos acima de 5GB; storage free da HF contratualmente escopado a artefatos ML públicos. «README.txt:581-600»
ND-1297. Segredos ≤48KB base64 via actions dedicadas; HMAC verification em webhooks. «readme1.txt:698-712»
ND-1298. Governança histórica declarava projeto NÃO comunitário: totalmente proprietário, governado só pelo Licensor, sem maintainers externos sem CLA assinada; SPDX histórico `LicenseRef-Saddle-Proprietary`; resolução 1.8.12 = GPL-3.0-only. «readme1.txt:698-712; README.txt:581-600»
ND-1299. Copyright (C) Agosto 2026 devthink, nathlan, iakadion, nathu filho, allan neris. «readme1.txt:681-697»
ND-1300. Epistemologia de pesquisa: feature-selção requer corroboração de ≥2 repos independentes ou um padrão oficial antes de mudar contrato público; bug fix tem limiar menor só se os testes do próprio Saddle reproduzem o problema deterministicamente. «todo-1.8.16.txt:12-30»
ND-1301. Schema de evidência de pesquisa: categoria, repositório, capability, source path, qualidade de evidência, compatibilidade, risco e disposition proposta. «todo-1.8.16.txt:12-30»
ND-1302. De-duplicação de pesquisa para forks, templates, mirrors, renames abandonados e multi-repos de mesmo código; flag de conflito de interesse para projetos ligados a provider/maintainer/plataforma selecionados. «todo-1.8.16.txt:12-30»
ND-1303. Escalação de segurança para achados de pesquisa envolvendo RCE, sandbox escape, credential leakage, SSRF, package compromise ou violação de provider policy. «todo-1.8.16.txt:12-30»
ND-1304. Registro de versão/commit de cada evidência para refreshes detectarem drift; refresh de achados time-sensitive antes do release sem virar crawler automático do core. «todo-1.8.16.txt:12-30»
ND-1305. Amostra de estudo comparativo: 100–300 repos públicos, com rubrica por categoria (fonte pública, evidência ativa, revisão de licença, atividade corrente, visibilidade de testes, relevância a contrato existente) e separação entre maduros, emergentes e pequenos focados. «todo-1.8.16.txt:12-30»
ND-1306. Grupo todo achado por domínio Saddle existente (browser, extension, scrape, queue, storage, memory, runner, runtime, protocol, packaging, release, web, desktop, mobile, bot); dedupe padrões equivalentes; identifique o menor contrato aditivo seguro por gap recorrente. «todo-1.8.16.txt:450-464»
ND-1307. Priorize gaps aceitos por benefício de segurança, compatibilidade, valor de usuário, testabilidade, custo operacional e burden de manutenção; publique síntese comparativa ANTES de implementar. «todo-1.8.16.txt:450-464»
ND-1308. Item só está completo após contrato + implementação + testes determinísticos + documentação + segurança + impacto de release registrados; versão fica congelada até os gates passarem. «todo-1.8.16.txt:5-10; readme1.txt:175-209»
ND-1309. Planejamento 1.8.16 separado da implementação 1.8.15: nenhuma feature derivada de comparação entra no release antes de 1.8.15 passar os gates. «todo-1.8.16.txt:5-10»
ND-1310. Regras de batch: objetivos agrupados em vez de pastas-planejadas; cada um passa testes focados antes do próximo; bump de versão, commit, tag e release são ações separadas aguardando autorização explícita. «README.txt:496-530»
ND-1311. Consolidação de README: inspecione TODAS as revisões históricas (41 no root) extraindo temas duradouros; preserve o README como scope reference não-determinística; registre a consolidação fora dele sem links diretos a materiais internos. «todo-1.8.16.txt:682-735»
ND-1312. Arquivo criptografado de docs: só com passphrase fornecida pelo usuário (nunca gere credencial irrecuperável); verifique lista de arquivos (199 files/13 dir entries no caso) excluindo assets não relacionados e o próprio arquivo; mova sem alterar bytes. «todo-1.8.16.txt:682-735»
ND-1313. Auditoria de versões no repo inteiro: enumere toda referência a versão pré-release e classifique como active metadata, test fixture, changelog, release evidence, research ou scope text; atualize só active metadata. «todo-1.8.16.txt:700-715»
ND-1314. Higiene de branches: 2 rodadas de cleanup arquivaram 16 branches do Dependabot atrás de annotated archive tags (recuperáveis por head commit exato) deixando main como única branch. «README.txt:496-530»

### Concorrentes e posicionamento

ND-1315. Concorrentes diretos (7): Crawlee, Playwright, Puppeteer, Cheerio, Scrapy, Firecrawl, Browserless; Saddle lidera em all-in-one (scrape+crawl+batch+serialize+RAG). «readme1.txt:717-735»
ND-1316. Pesos da matriz de decisão: AI/LLM 25% · Anti-Detection 20% · Production Readiness 20% · Ease of Use 15% · Cross-Runtime 10% · Serialization 10%. «readme1.txt:717-735; README.txt:621-640»
ND-1317. Saídas exclusivas do Saddle vs concorrentes: payloads Redis `JSON.SET` e geração `llms.txt`. «readme1.txt:717-735; README.txt:621-640»
ND-1318. Posicionamento "Toolkit+": entre framework (Crawlee, complexo) e DaaS (Firecrawl/Browserless, API abstrata); contraste de maturidade: incumbentes 4–15 anos/3000+ commits vs ~1 ano/~200 commits. «readme1.txt:717-735; README.txt:621-640»
ND-1319. Anti-detection gaps declarados: sem randomização de fingerprint, sem TLS fingerprint, sem spoofing canvas/WebGL, sem captcha solving, sem residential proxy no toolkit base. «readme1.txt:717-735»
ND-1320. Todos os 4 concorrentes headline têm MCP server (incluindo variante Chrome DevTools) — integração MCP é gap declarado. «README.txt:621-640»
ND-1321. Rejeitar AGPL como dependência: Firecrawl 130k★ AGPL e MinIO AGPL não podem ter código copiado para Saddle GPL-3.0-only sem revisão legal separada. «README.txt:621-640; repo-research-1.8.16.txt:120-190»

### Plataformas, forges e catálogo

ND-1322. Inventário de plataformas: 911 plataformas agrupadas em 74 categorias de forges, CI, registries, clients, IDEs, DVCS, ecossistemas de pacotes, clouds e redes descentralizadas — enumeração de referência, NÃO feature set (muitas entradas link-only). «readme1.txt:148-159»
ND-1323. O catálogo destilou de ~6.700 registros de sites scrapados cobrindo 10.600 URLs por script de agregação. «README.txt:641-660»
ND-1324. Blacklist de plataformas excluídas por escolha do usuário: Gitblit, SCM-Manager, Gitorious, Kallithea (listadas por completude histórica, não recomendadas). «readme1.txt:952-979; README.txt:367-372»
ND-1325. Genealogia de forges: Gitea (2016) → Forgejo (2022/2024, alemão, non-profit) + Gitea Ltd comercial americana + forks chineses; Gogs e GitBucket na família leve. «platforms.txt:2587-2599»
ND-1326. Remotes federados/Web3: Radicle, Tangled, Gitopia, Hypercore/Dat, IPFS git remotes, ForgeFed, SSB+Git, Tea protocol, Arweave, Filecoin, Gun.js, OrbitDB; Azure DevOps aparece nas matrizes de compatibilidade. «platforms.txt:2710-2739; readme1.txt:148-159»
ND-1327. Forges de governo: Data.gov, code.gouv.fr, code.mil, Forge.mil, CyPhER Forge (DARPA), code.nasa.gov, code.up.gov.br, plataforma de código aberto do governo holandês; repositórios europeus via european-alternatives.eu. «platforms.txt:1740-1834; 2629-2688»
ND-1328. Plataformas de ML hub a incluir como storage/compute: Kaggle (Models & Datasets), DagsHub, Zenodo (CERN), Deepnote, Comet, OpenML, Figshare, Replicate (API-first), UC Irvine ML Repository, OpenXLab, SiliconFlow, GitCode AI/Gitee AI, Baseten. «platforms.txt:2850-2887; 239-307»
ND-1329. Metodologia de pesquisa de sites: multilíngue (JP/EN/ES/PT/AR/GR/IT/KO/DE/FR/VI/TW…), >1000 palavras-chave/sinônimos/frases-chave, caça de alternativas fora do mainstream, blacklist respeitada, sem citar exemplos já dados, hiperlinks sempre. «sites.txt:1-60»
ND-1330. Pesquisa delegável: dividir arquivo entre 30 subagentes (partes iguais por número de linha), depois reler/revisar todas as partes, organizar em todo list profissional com correção ortográfica, mesclagem de duplicatas e agrupamento hierárquico. «sites.txt:5600-6300»

### OpenCode, Z.ai e ecossistema de agentes

ND-1331. OpenCode é binário híbrido Go+Bun (ex-sst/opencode), NÃO front-end library; OpenTUI é framework TUI com core Zig e bindings TS. «readme1.txt:879-911; README.txt:641-660»
ND-1332. Três pacotes: `opencode-ai` é wrapper que baixa binário (NÃO ESM — ESM.sh/Skypack devolvem shim vazio); `@opencode-ai/sdk` é client type-safe (funciona via ESM.sh/jsDelivr/UNPKG); `@opencode-ai/plugin` dá helpers event-driven `tool()`. «readme1.txt:879-911»
ND-1333. Servidor OpenCode: Hono HTTP on Bun, porta default 4096, bind 0.0.0.0, OpenAPI 3.1 em /doc, `/global/health`, `/global/event` (SSE), `/tui/*` (append-prompt, submit-prompt, execute-command, show-toast, open-help), rotas `/project` e `/session` (plural); auth Basic `opencode:<senha>` via `OPENCODE_SERVER_PASSWORD`. «readme1.txt:879-911»
ND-1334. Sessões OpenCode: pasta em `~/.local/share/opencode` ou `.opencode/` com JSONL append-only; LSP em background para contexto de código; abrir aba = criar sessão = POST /session/create + SSE session.prompt. «readme1.txt:879-911»
ND-1335. Plugins em `.opencode/plugins/<name>.{js,ts}` (projeto) e `~/.config/opencode/plugins/` (global); ordem de carga: config global → config projeto → dir global → dir projeto; hooks `{ event }`, `tool.execute.before`, `session.idle`; handlers recebem `{project, directory, worktree, client, $}`; plugins rodam código arbitrário com permissões do usuário. «readme1.txt:879-911»
ND-1336. Flags OpenCode CORRETAS: saída é `--format json` (não `--json`); raciocínio via `--variant` (não `:high`); tabela de variantes por provider (Anthropic high/max; OpenAI/NVIDIA none…xhigh; Google low/high). «readme1.txt:879-911»
ND-1337. Modelos NVIDIA no OpenCode: `nvidia/nemotron-3-super-120b-a12b` com `temperature=1.0, top_p=0.95` entre tarefas; config persistente em opencode.jsonc. «readme1.txt:879-911»
ND-1338. `opencode serve` aceita múltiplos `--cors <origin>`; `--attach http://localhost:4096` usa servidor headless sem TUI; config suporta `mdns: true`. «readme1.txt:879-911»
ND-1339. Workflow OpenCode Runner: GitHub Actions instala via `curl -fsSL https://opencode.ai/install | bash`, default `opencode/gpt-5`, secrets ANTHROPIC_API_KEY/OPENAI_API_KEY, `repository_dispatch` tipo `opencode-run`, resultados em `.opencode/results/{session_id}.json`. «readme1.txt:879-911»
ND-1340. Linhagem Z.ai: scripts de setup upstream (falham no PowerShell do Windows — use Git Bash/WSL); GLM-5 deployável via Docker; Z.ai2api/GLM-ZAI-2API como proxies OpenAI-compatíveis; Oxide-Agent e sandcastle-zai como variantes de sandbox. «readme1.txt:870-878; README.txt:641-660»

### Linhagem, V1–V8 e arqueologia

ND-1341. Evolução de nomes: CloudSandbox (`@cloudsandbox/core|cli|providers|storage`) → SandPlatform → `@devthink/saddle` → `@wenathlan/saddle`; candidatos também storage-ram-bridge v1.0.0; grafias Seddon/Sedol são variantes — canônico é Saddle. «readme1.txt:833-869; README.txt:45-60»
ND-1342. V1: runtime browser no GitHub Pages (index.html estático; SDK-remote, SW-mock-Hono, WASM-binary). «readme1.txt:833-869»
ND-1343. V2: thin client — browser fatia/dumpa binários (só lê preview de 256 bytes via file slicing; uploads em chunks base64 via contents API com fine-grained tokens apenas em session storage, polled a cada 3s, descomprimidos no browser, client <5MB de RAM). «readme1.txt:833-869; README.txt:661-680»
ND-1344. V3: multi-forge (GitHub/Forgejo/Gitea/Codeberg/GitLab) + `farm.py` worker farm (100 repos). «readme1.txt:833-869»
ND-1345. V4: repo como processador virtual + teoria OS "tudo é arquivo" + escadas de trigger/bridge; OverlayFS: lowerdir read-only, upperdir writable, merged, copy-up na primeira escrita; OCI = tars comprimidos empilhados; emptyDir do K8s é RAM-backed. «readme1.txt:833-869; README.txt:76-90»
ND-1346. V5: 100% third-party — nada na máquina local ("Everything Third-Party, Nothing on Your Machine"). «readme1.txt:833-869»
ND-1347. V6: tabelas SQL como compute, 10 CDNs runners, pointers BigInt escala terabyte. «readme1.txt:833-869»
ND-1348. V7 REJEITADA: morta especificamente por profundidade de diretório (caminho com 5 níveis de aninhamento citado como exemplo da morte; 113 arquivos aninhados, 1390KB). «readme1.txt:833-869; README.txt:76-90»
ND-1349. V8: manifest flat com prefixo numérico; todo conteúdo anterior re-homed sob nomes flat datados. «readme1.txt:833-869»
ND-1350. Predecessores identificados: OpenCode Multi-Forge (tese repo-as-disk/CI-as-CPU/Pages-as-bus, farm.py, storage-as-ram.sh), UKA `@devthink/UKA` (computer-use + AI sandbox + captcha bypass via Brave movement capture), DevThink WebScrape `@devthink/webscrape` v2.0 (toolkit all-in-one com 4 perfis anti-detection = 3 engines × 2 OS). «readme1.txt:833-869; README.txt:45-60»
ND-1351. Contradição de fluxo preservada honestamente: uma descrição de pipeline prefere conversor Markdown de lib enquanto a análise comparativa insiste em serializer DOM custom para edge cases de nested-list/table. «README.txt:61-64»
ND-1352. Onde número diverge entre fonte e spec, o corpo da spec é canônico e a divergência é anotada inline (ex.: Turso 9GB vs 500M rows; ZeroGPU 96GB/5min vs H200/3,5min; Node floor 26.7.0 vs 22 vs 20; versão 2.0.0 hardcoded vs 1.8.5). «readme1.txt:1011-1039»
ND-1353. Google AI Studio é produto separado: app id `aca47e33-7d37-4176-a54d-0c67b452654f`, rodado via Android Studio com GEMINI_API_KEY. «readme1.txt:833-869»
ND-1354. VDR/UMCF (`@vdr/core-mesh`) é direção explorada, NÃO o layout shipado — diverge da identidade canônica e viola flat-root; princípios: Node.js-first, isolamento absoluto do usuário, $0 infra perpetua; MIME `application/vnd.vdr-block+bin` com headers X-VDR-Chunk-ID/Pointer-Offset/Compression/Integrity. «readme1.txt:912-928»
ND-1355. VDR: page table no Upstash Redis (10k req/dia); endereçamento 64-bit BigInt até ~9,22EB; L1 SharedArrayBuffer + Buffer.allocUnsafe com ring-buffer paging e flush automático no teto de RAM; engine default 512MB cap; fabric em 3 níveis (NPM efêmero → OPFS/SQLite/R2/Tigris → GitHub Releases 2GB/GitLab LFS 5GB/CDNs). «readme1.txt:912-928»
ND-1356. VDR regra dura: sem Serverless Functions como core engine (timeouts por tier: standard 26–300s, background >3min, edge 50ms); engine roda integrado no app (Prisma + SQLite). «readme1.txt:912-928»
ND-1357. Mesh VDR: 5 modos (Standalone/P2P Mesh Swarm/Browser/cron-webhook async/memoization-fabric); heartbeat `/api/mesh/heartbeat` 30s; WebRTC DataChannels; VRAM via `THREE.BufferGeometry` (header X-VDR-Client: ThreeJS-Renderer). «readme1.txt:912-928»

### Catálogos de pesquisa (toolkit era)

ND-1358. In-memory storage: Map nativo para básico, WeakMap para metadata sem leak, lru-cache v11 (bounded, TTL, fetchMethod), @keyv/bigmap (20M+ entries). «24.research.memory.persistence.txt:7-147»
ND-1359. Browser storage: localStorage 5–10MB síncrono, sessionStorage tab-scoped, IndexedDB async para grandes volumes, store2 como wrapper cross-browser. «24.research.memory.persistence.txt:148-385»
ND-1360. Cross-runtime KV: keyv 5.6.0 unifica memória/SQLite/Redis; dedup de requests via keyv com TTL, Bloom filter e ETag conditional requests. «24.research.memory.persistence.txt:527-952»
ND-1361. Edge KV: Cloudflare Workers KV, Upstash Redis, Deno KV — cada um com limites próprios (TTL 60s KV, REST pipelined Upstash, versionstamp Deno). «24.research.memory.persistence.txt:619-778»
ND-1362. TTL strategies e eviction strategies devem ser documentadas por volatilidade da store; graceful degradation com fallback chain por runtime detection. «24.research.memory.persistence.txt:1461-1833; 1241-1460»
ND-1363. Proxy: pacotes de rotação + HTTP agents + Crawlee ProxyConfiguration + session pinning + protocolos (HTTP/SOCKS4/SOCKS5/TLS) + health checking ativo (test URL, timeout 5000ms, 2 retries, medição de response time) + pool com remoção automática. «14.research.proxy.txt:17-1486»
ND-1364. Batch scraping: concorrência com p-limit, progress tracking, browser pooling, AutoscaledPool, work stealing, graceful degradation, layered resilience, adaptive concurrency. «21.research.batch.concurrency.txt:17-1871»
ND-1365. Crawling: BFS vs DFS (DFS por head-insert), robots.txt RFC 9309 com crawl-delay, sitemap parsing, URL frontier com prioridade, URL normalization, depth-limited, regras por domínio, canonical/redirect handling. «16.research.crawling.txt:18-1408»
ND-1366. Caching: HTTP response caching, in-memory, abstraction layers (keyv), disk-based, TTL por tipo, invalidation, request deduplication Crawlee, Playwright response caching, multi-layer architecture. «17.research.caching.txt:19-1598»
ND-1367. Errors/events: custom error classes, hierarquias com códigos, padrão Crawlee, classificação, recovery suggestions dentro do objeto de erro, typed EventEmitter, pacotes (emittery etc.), lifecycle hooks, middleware pipelines, plugin/hook systems. «19.research.errors.events.txt:19-1350»
ND-1368. Zod v4: ~14× mais rápido, ~26KB; use `z.strictObject`, `.prefault`, `z.toJSONSchema` para OpenAPI/client generation, branded/discriminated unions; valide opções de scraping em runtime e inputs de API via middleware; CLI com z.coerce; derive types TypeScript dos schemas. «README.txt:191-204; 20.research.zod.validation.txt:1-1350»
ND-1369. AI integration: Markdown como ponte universal (60–80% redução de tokens), token economics por KB (HTML 300–400, Markdown 80–120, texto 60–80, JSON 150–200), RAG pipeline Fetch→Extract→Markdown→Chunk→Embed→Store (Pinecone/Weaviate/Qdrant) com heading-path metadata. «README.txt:373-395; 23.research.ai.integration.txt:1-1465»
ND-1370. Chunking hierárquico parent-child: seções aos pais por comparação de heading level, subdivisão recursiva de seções oversized, posição como index math, YAML front matter com source/title/timestamp/content hash/language. «README.txt:373-395»
ND-1371. Extração com LLM: temperature 0 + JSON-object response format; confidence score = fração de campos obrigatórios presentes; near-duplicate detection combina mapas SHA-256 exatos com SimHash simplificado (threshold 0,95). «README.txt:373-395»
ND-1372. Tokenizadores dimensionados: tiktoken bindings 5MB, tokenizer multi-model 1MB, BPE leve 2MB, fallback chars/4 (~70% preciso); contagem exata por provider via call de 1 max-token lendo usage input tokens contra API version pinned. «README.txt:373-395»
ND-1373. Universal cross-runtime: escreva para a API mínima comum (fetch/Request/Response/Headers/URL/URLPattern/crypto.subtle/streams/TextEncoder/structuredClone/AbortController/atob/btoa/performance.now) e adapters para o resto; estrutura core/ + adapters/ (node/deno/bun/browser/cloudflare). «22.research.universal.runtime.txt:1-130»
ND-1374. Pesquisa de fronteira de VRAM: DiskLLM (~57× menos RAM), StorageLLM (MoE offload), m-store (RDMA/CXL), virtual-context, Blowfish (OSDI 2026); GPU→RAM: nbd-vram, kvcached, sillyCUDA; HF ZeroGPU ~96GB VRAM ~5min/dia free. «readme1.txt:455-467; README.txt:257-258»
ND-1375. Stack virtio-GPU para paravirtualização: virtio-gpu, virglrenderer, rutabaga_gfx, vhost-device-gpu, virtio-win drivers; guest_memfd e nbdkit-memory-plugin permitem RAM disks até escala exabyte. «readme1.txt:455-467; README.txt:257-258»
ND-1376. Local AI: llama.cpp (~109k★, 70B Q4_K_M em laptop), BitNet b1.58 (~82% menos energia; 100B a 5–7 tok/s em CPU; ~38k★), WebLLM/MLC-LLM (WebGPU, zero server), llamafile (executável = modelo+runtime, base do conceito "AI num QR code"). «readme1.txt:455-467; README.txt:373-395»
ND-1377. Storage infinito (fronteira): Project Silica (quartzo 10.000 anos), DNA Storage + TrellisBMA (1EB/mm³), cristal 5D (360TB/disco), Cerabyte (cerâmica 1000+ anos). «readme1.txt:455-467; README.txt:429-455»
ND-1378. Linhagem EMS/BCI para demos body-as-I/O: PossessedHand (2011) → Affordance++ (2015) → Muscle-Plotter/openEMSstim (2016) → SplitBody (CHI 2024, +35%) → Generative Muscle Stimulation (CHI 2026) → Human Operator (MIT Hard Mode 2026, VLM+EMS via Arduino relay) → Brain2Qwerty (Meta FAIR, MEG→texto 61%/78%); eletroacupuntura NÃO é HCI-EMS. «README.txt:429-455; readme1.txt:929-940»
ND-1379. Orquestração prior art: Orbits, LittleHorse, Temporal, Windmill, Sealos, Shipyard, MeshHook, Zapier/Airflow, Nomad, systemd-nspawn/LXC/Incus; runners efêmeros: act, ephemerd, ez-gh-actions, outrunner, createos-sandbox-ghar. «readme1.txt:941-951; README.txt:361-366»
ND-1380. Modelo "computational gear": toda automação decompõe em Identity Hub, Event Listener, Workflow Engine (DAG+Saga), Compute Sandbox MicroVM e Data Sink. «README.txt:361-366»
ND-1381. Catalogue >50 alternativas self-hosted de forge agrupadas: full platforms (GForge air-gapped, Allura, Heptapod, RhodeCode, FusionForge, RocketGit, Plastic SCM, Fossil), viewers leves (CGit, Gitweb, GitList, Klaus), access control (Gitolite, Gitosis), governo (Code.mil, NASA, code.gouv.fr), comunidade (disroot, fedorapeople, opendev, pagure), históricos. «README.txt:367-372; readme1.txt:952-979»
ND-1382. Catálogo expandido de forges: OneDev, Soft Serve, Phabricator/Phorge, Gerrit, Gogs, GitBucket, Launchpad, Helix Core/Perforce, Assembla, Taiga; matriz de suporte a Mercurial ao lado de Git. «README.txt:367-372; readme1.txt:952-979»

### Feasibility e honestidade operacional

ND-1383. Incidentes FUSE documentados: RSS cresceu de ~1,8GB para além de 7GB após update (OOM kill) e outro mount cresceu de KB para >4GB em 2 dias por enumeração de diretório em background — consumo oculto de RAM é a AMEAÇA #1 à proposta free-disk; mitigar com `--vfs-cache-mode full`. «README.txt:681-720; readme1.txt:434-454»
ND-1384. Throughput de tmpfs em runner de CI medido ~60MB/s — classe disco, não RAM; "RAM disks" de runner herdam noise da plataforma. «README.txt:681-720»
ND-1385. Servidor de alta concorrência sobre mount de cloud-drive falhou no pico (estável em arquivos locais) — mounts de rede NÃO servem workloads I/O-intensivos. «README.txt:681-720»
ND-1386. Matriz de constraints serverless: funções standard até minutos (paid) e cron; edge 50ms rígidos, ~0,5GB memória, sem fs/crypto nativa, sem cron; cold start edge 12–28ms e WASM 1–5ms. «README.txt:681-720»
ND-1387. Pré-arte bucket-as-FS: bucket S3-compatível como pseudo-FS via JSON/Msgpack; SDKs provider-unified abstraem S3/R2/Azure/Tigris; serviço gerenciado mantém metadata em Postgres e bytes em objetos — padrão exato para estado durável de workflow em funções transitórias. «README.txt:681-720»
ND-1388. Node inteiro dentro de WASM tem precedente: isolate WASI passa quase toda a suite oficial de testes do Node com boots ~40ms. «README.txt:681-720»
ND-1389. PaaS de container que rejeita workloads persistentes reforça a doutrina: estado long-lived pertence a storage caller-owned, NUNCA ao host de execução. «README.txt:681-720»
ND-1390. Débito técnico declarado: 30+ defaults hardcoded (timeout 30000, scrollDelay 300, maxScrolls 50, retries 3, cacheTTL 300000, viewport 1280×720, locale en-US, maxTokens 8000, chunkSize 512, maxSize 1000, maxFailures 3, reviveAfter 30min, rate limit 10/1000/5, pool 3, batch 5); 7 preços de modelo congelados em valores 2024 (gpt-4o, gpt-4o-mini, gpt-4-turbo, claude-3-5-sonnet, claude-3-haiku, gemini-1.5-pro/flash); UA estática; `--disable-web-security` hardcoded; host 0.0.0.0 → deveria ser 127.0.0.1; CORS `*` só em dev; versão duplicada em 4 lugares; purge de ~25–27 pacotes UI-era (react, sharp, hls.js, ink, blessed, ora, figlet, marked, inquirer, chalk-animation, cli-table3, cfonts, listr2, scheduler, cross-spawn, fuzzysort, gradient-string). «readme1.txt:758-767; README.txt:601-620»
ND-1391. Débito por arquivo: browser.ts:13 UA estática; browser.ts:37 `--disable-web-security`; server.ts:132 host; crawler.ts fila in-memory; session.ts Map-based perde estado; agent.ts output genérico sem schema; renderer.ts 3 caminhos hardcoded (pythonPath, windowSize, doomFramesDir). «readme1.txt:758-767»
ND-1392. Auditoria de features: complete = memory bridge/modes, job engine, chunked artifacts com checksums, error taxonomy com recovery hints, proxy pool com graveyard/revive, captcha detection contracts; partial = sessions (sem runtime de captura real), crawler (sem sitemap/adaptive renderer), MCP (sem server empacotado), queue (sem crash recovery), adapters sem auth live, ORM sem schemas deployados; entirely missing à época = publish workflows e web database layer. «featureaudit.txt:1-63»
ND-1393. Débito de dependências UKA (65 pacotes/12 grupos) catalogado: browser/mouse (playwright, puppeteer, bezier-js, @napi-rs/canvas, d3, sharp), AI/vision/captcha (ai, @ai-sdk/*, onnxruntime-web, tesseract.js, comlink), sandbox/deploy (@vercel/sandbox, vercel, nanoid), server (hono, express, socket.io, multer), DB (drizzle, mysql2, prisma), validation (zod, valibot, arktype), frontend, media/util, dev. «readme1.txt:801-815»
ND-1394. Declarar feature como "not implemented by design" quando se trata de bypass automático de captcha ou abuso de token — nunca shipar. «featureaudit.txt:30-63»
ND-1395. Manter `docs/gapmatrix.md` corrente com estados implemented/partial/deferred/unsafe-by-design. «todo.txt:169-176»

### Cenários e viabilidade

ND-1396. Cenários viáveis documentados: OpenCode 100% no browser via remote SDK; thin client com offload para Actions; multi-forge farm ilimitado; pipeline 100% third-party >33TB; site-as-SQL-table file-compute runner; auto-criar DBs no deploy; liquid sandbox resumindo exatamente entre runs de CI; site-as-VPS; pendrive 8GB montando buckets na nuvem como drive e rodando modelos quantizados locais (BOM ~R$30 na variante microcontrolador; portal captive ESP32 com hostapd/WiFiManager salva credenciais Wi-Fi criptografadas). «README.txt:661-680»
ND-1397. Sucesso do Saddle depende menos de tecnologia nova e mais de orquestrar elegantemente ferramentas provadas atrás de abstração minimalista unificada — o orquestrador é o componente make-or-break. «README.txt:661-680»
ND-1398. Entrega incremental prudente: começar do core mínimo (webhook server + executor JS), adicionar isolamento progressivamente (containers → microVMs → WASM) e orquestração depois. «README.txt:661-680»
ND-1399. Demo body-as-I/O e mind decoding fazem parte da narrativa Sci-Fi de 10 episódios (Ep1–Ep10) que acompanha a engenharia P0–P3 — cada episódio shipa repositório clonável e falha demos beta deliberadamente. «README.txt:429-455; readme1.txt:929-940»
ND-1400. Roadmap executado em 12 blocos de ecossistema com loop fixo: comparar comportamento com fontes primárias, registrar gaps, definir o menor contrato transport-neutral, implementar lógica agrupada sem vendor deps, adicionar testes fake-transport determinísticos, atualizar docs/changelog/todo, rodar checks, commitar antes do próximo bloco. «README.txt:601-620»
ND-1401. Estado dos 12 blocos: governança/auditoria ativa; browser-agent fundação completa; extension primeira leva feita; working-set/storage completo; runners/execução completo; scraping/contexto completo; API/MCP/segurança completo; bots/integrações completo; packaging parcial (extension zip/checksum/SBOM/provenance feitos; desktop/mobile/n8n/binary caller-owned); product surfaces primeira leva (observability, retention, threat model pendentes); cross-runtime graph auditado; release gates ativos. «README.txt:601-620»
ND-1402. Gaps carried-forward: provider-chain dry-run, adapters container/micro-VM, caches WASM content-addressed, SignPath/Azure + Sigstore/SLSA provenance, estudo comparativo, fronteira default-deny zero-touch. «README.txt:601-620»
ND-1403. Deferred BY DESIGN: captcha bypass, stealth patching, deploy de site/DB, persistent queues SQLite/Redis, MCP servers, extração de vídeo, geração de PDF, token prices configuráveis. «readme1.txt:736-757; README.txt:601-620»
ND-1404. Roadmap P0 (bloqueia prod): integração anti-detection, persistent queue, Docker; P1: MCP server, session persistence, schema extraction; P2/P3: PDF, token prices, webhooks, vídeo, mobile emulation, tracing, adaptive cache — com esforços estimados (stealth 1–2d, queue 3–5d, Docker 1–2d, MCP 3–5d, session 2–3d, Zod 2–3d, PDF 1d). «readme1.txt:736-757»

---

## FEATURES F-SDL

Formato: `F-SDL-NNN. título — detalhe (shipped|planned) [vX.0.0] «fonte:linhas»`. Continua de F-SDL-100 (seed F-SDL-001..088 não repetido).

### v1.7.0 — fundação

F-SDL-100. Public library core — `saddleurl`, `scrapeurl`, `scrapehtml`, `extractcontent`, `serializeresult`, `formatforagent`, `batchscrape`, `crawlurl` como exports públicos (shipped) [v1.7.0] «readme1.txt:340-354»
F-SDL-101. CLI `saddle <url> -f markdown|json|xml|redis|text --pretty --scroll --readable --agent --screenshot` (shipped) [v1.7.0] «readme1.txt:340-354»
F-SDL-102. Idempotência entre seis registros + `appregistry`, `commandguard`, `deliveryqueue` com dead letters; 76 testes (shipped) [v1.7.0] «readme1.txt:816-832; README.txt:496-530»
F-SDL-103. Bot unificado start/stop/executeCommand/handleWebhook/scheduleTask/getStatus sobre PlatformAdapter (shipped) [v1.7.0] «todo.txt:63-71; README.txt:456-469»
F-SDL-104. Serializadores JSON/NDJSON/SSE sem servidor obrigatório + streaming de blocos com backpressure configurável (shipped) [v1.7.0] «todo.txt:63-71»

### v1.8.0–1.8.5 — contratos e identidade

F-SDL-105. `runtimecontract` + `memorystorage` + probe root Node/Bun/Deno + `workerbridge`; 83 testes (shipped) [v1.8.0] «readme1.txt:816-832»
F-SDL-106. Identidade canônica `@wenathlan/saddle` no npm público; variante GH `@iakadion/saddle` via rewrite de namespace (shipped) [v1.8.1] «readme1.txt:816-832»
F-SDL-107. Release pós-transferência com identidade por registro (npm/GHCR/Maven/NuGet/RubyGems) + política de permissões MV3 + auditoria de grafo de exports + normalização de conteúdo limitada (shipped) [v1.8.2] «README.txt:496-530»
F-SDL-108. Pipelines Node 26.7.0 em todas as forges com gates determinísticos GitLab/Forgejo/Gitea/Woodpecker + Saddle Pages `saddle-pages` com VITE_BASE_PATH (shipped) [v1.8.4] «readme1.txt:816-832»
F-SDL-109. Engines metadata (node >=26.7.0, npm >=10.9.2, packageManager npm@12.0.2, sideEffects false) + Playwright peer opcional com resultado missing-dependency (shipped) [v1.8.5] «readme1.txt:816-832»
F-SDL-110. Memory engine com LRU bounded (`maxentries`/`maxbytes`), evict só do hot cache, rehidratação do primeiro backend responsivo, `stats()` de entries/bytes/hits/misses/evictions (shipped) [v1.8.5] «readme1.txt:98-111»

### snapshots, memória e triggers (changelog 1.2.0–1.6.0)

F-SDL-111. Vendor-neutral page snapshots com stable refs, stale-snapshot errors, diffs e registry de tabs/frames (shipped) [v1.2.0] «README.txt:61-64»
F-SDL-112. Bounded action batches + `actionrecorder` com provenance de snapshot boundaries (shipped) [v1.2.0] «README.txt:61-64; readme1.txt:340-354»
F-SDL-113. Memory-engine backends: github, gitlab, forgejo, gitea, huggingface, kaggle, modelscope, filehosting com StorageBackendFactory (shipped) [v1.3.0] «README.txt:61-64; readme1.txt:386-397»
F-SDL-114. Provider health reports (`runnerhealth`, `runnerhealthall`) + cooperative heartbeats + forge-neutral triggers manual/webhook/schedule/retry/heartbeat (shipped) [v1.4.0] «README.txt:61-64»
F-SDL-115. Semantic extraction (`extractsemantic`) — headings/landmarks/controls/links (shipped) [v1.5.0] «README.txt:61-64»
F-SDL-116. Envelope API — `requestcontext`/`successpayload`/`errorpayload` versionados (shipped) [v1.6.0] «README.txt:61-64»
F-SDL-117. Extension export com MV3 service worker + content bridge + popup + snapshot diffs; começa com permissão `storage`, sem broad host, read-only page-world (`pagefacts`) (shipped) [v1.1.0+] «readme1.txt:816-832; README.txt:156-190»
F-SDL-118. `assertfreshsnapshot`/`snapshotdiff`/`browsercontext` — rejeita ações stale, compara estado, rastreia tabs/frames/active context sem vendor client (shipped) [v1.2.0+] «readme1.txt:55-97»
F-SDL-119. `contentstorage`/`tieredcache` — dedupe de bytes imutáveis; hot values com cold storage e stale revalidation (shipped) [v1.4.0] «readme1.txt:55-97»
F-SDL-120. `syncobject`/`syncbackends` — compara manifests e copia/resolves updates entre adapters (shipped) [v1.4.0] «readme1.txt:55-97»
F-SDL-121. `workflowtriggers`/`triggermatch` — normaliza e casa starts manual/event/schedule/retry com request id determinístico (shipped) [v1.4.0] «readme1.txt:125-135»
F-SDL-122. `resumablerun`/`transitionrun` — recupera run state remoto via transições legais (shipped) [v1.4.0] «readme1.txt:55-97»
F-SDL-123. `validateworkflowinputs` — rejeita campos unknown, checa required, aplica defaults, converte tipos, aplica choices; trigger matcher retorna `invalid-inputs` (shipped) [v1.8.15] «readme1.txt:125-135»
F-SDL-124. `crawlfrontier`/`normalizeurl`/`persistentqueue` — fronteira durável e normalização de URLs (shipped) [v1.5.0] «readme1.txt:55-97»
F-SDL-125. `provenance`/`mergeprovenance` — liga chunks de contexto a fonte e evidência de retrieval (shipped) [v1.6.0] «readme1.txt:55-97»
F-SDL-126. `metricstore`/`operationsmetrics` — coletores bounded de counters e durações (shipped) [v1.7.0] «readme1.txt:28-38»
F-SDL-127. `retentionpolicy`/`backupplan`/`threatmodel` — retenção por dias/maxbytes, backup/restore declarativos, threat model com owner e lista de controles (shipped) [v1.8.15] «readme1.txt:28-38»
F-SDL-128. `controlsurface`/`controlservice` — request id, resource, operation, success state + audit callback opcional em toda resposta (shipped) [v1.7.0] «readme1.txt:16-27»
F-SDL-129. `nodeserver` — expõe handler Web Request/Response via Node HTTP (shipped) [v1.6.0] «readme1.txt:55-97»
F-SDL-130. `authorize` — verifica credenciais do caller via verifier injetado (shipped) [v1.6.0] «readme1.txt:55-97»
F-SDL-131. `assertresolvedpublicurl`/`assertredirectchain` — valida destinos resolvidos e redirects bounded (shipped) [v1.6.0] «readme1.txt:55-97»
F-SDL-132. `browsertools` — expõe snapshot/actions injetados como MCP tools opcionais (shipped) [v1.7.0] «readme1.txt:55-97»
F-SDL-133. `releaseevidence`/`evaluateevidence` — normaliza evidência caller-supplied e avalia contra política com reason codes bounded (shipped) [v1.8.16] «readme1.txt:55-97»
F-SDL-134. `evidencefromverification`/`releasereadiness` — mapeia checksum válido para evidência checked; receipt de readiness apenas descritivo (shipped) [v1.8.16] «readme1.txt:55-97»
F-SDL-135. RAG helpers — `chunkmarkdown`/`formatchunksforrag`, `generatellmstxt`/`generatellmsfulltxt`, `estimatetokens`/`fitsincontext` (shipped) [v1.5.0+] «README.txt:146-163»
F-SDL-136. Reliability helpers — `withretry`, subpath de error taxonomy, typed event emitter (shipped) [v1.5.0+] «README.txt:146-163»
F-SDL-137. Server/MCP — `createserver`, `mcpserver`/`mcptransport` (shipped parcial: contrato de tools, sem server empacotado) [v1.6.0] «README.txt:146-163; featureaudit.txt:1-63»
F-SDL-138. Storage adapters: local, chunked, S3-compatible, GitHub Contents, WebDAV, HF, Kaggle com put/get/head/delete/list + checksums (shipped) [v1.7.0] «readme1.txt:310-333; todo.txt:95-105»
F-SDL-139. Scheduler determinístico por prioridade estável com `canRun`/`descriptor` (shipped) [v1.7.0] «readme1.txt:310-333»
F-SDL-140. Queue de jobs com idempotência, retry e saga de compensação (shipped parcial — sem crash recovery) [v1.7.0] «todo.txt:56-62; featureaudit.txt:1-63»
F-SDL-141. Browser session replay abstrato sem acoplar o core a um browser (shipped parcial — sem captura real) [v1.7.0] «todo.txt:56-62; featureaudit.txt:1-63»
F-SDL-142. Scraping seguro com robots cache, extraction e content types; parser robots com crawl-delay RFC 9309 (shipped) [v1.7.0] «todo.txt:56-62, 63-71»
F-SDL-143. Cache com TTL e stale-while-revalidate (shipped) [v1.7.0] «todo.txt:56-62»
F-SDL-144. Packager para binary/container/manifest de distribuição (shipped) [v1.7.0] «todo.txt:56-62»
F-SDL-145. Adapters multiforge GitLab/Forgejo/Gitea/Codeberg/HuggingFace com wrappers (shipped) [v1.7.0] «todo.txt:56-62»
F-SDL-146. Modos library/cli/binary/browser/headless/computer como superfícies independentes (shipped) [v1.7.0] «todo.txt:45-53»
F-SDL-147. Modos de memória internal/external/physical/vectorized/library selecionáveis (shipped) [v1.7.0] «todo.txt:45-53»
F-SDL-148. Runtime universal sem exigir fs, process ou Buffer no núcleo (shipped) [v1.7.0] «todo.txt:72-84»
F-SDL-149. Rate limiting global, por usuário e por domínio (shipped) [v1.7.0] «todo.txt:72-84»
F-SDL-150. Crawling BFS com normalização de URL, sitemap e limite de domínio + queue persistente para crawl com fallback em memória (shipped parcial) [v1.7.0] «todo.txt:72-84; featureaudit.txt:1-63»
F-SDL-151. Fingerprint coerente por sessão sem patch stealth automático + pool de proxy com health score, rotate e revive (shipped) [v1.7.0] «todo.txt:85-94»
F-SDL-152. Contrato de captcha solver manual/externo com evidências e hash + pausa de revisão (shipped — detecção completa, bypass by design ausente) [v1.7.0] «todo.txt:85-94; featureaudit.txt:30-63»
F-SDL-153. Token estimate, chunk markdown e RAG manifest + geração de llms.txt e llms-full.txt (shipped) [v1.7.0] «todo.txt:85-94»
F-SDL-154. Webhooks HMAC e eventos de job (shipped) [v1.7.0] «todo.txt:85-94»
F-SDL-155. Manifests para browser extension, desktop, mobile e n8n; `n8nnode`/`n8nmatch`/`n8nexecute` rejeitam ações não declaradas (shipped) [v1.7.0] «todo.txt:85-94; readme1.txt:16-27»

### v1.8.8–1.8.15 — TypeScript, flat native, signing, pools

F-SDL-156. Migração root-based TypeScript com dist-only compilation e declarative target plans em 12 superfícies; 98 testes ativos (shipped) [v1.8.9] «README.txt:496-530»
F-SDL-157. Flat Capacitor/Tauri layout research aplicada ao desktop/mobile (shipped) [v1.8.11] «README.txt:496-530»
F-SDL-158. Resolução de licença GPL-3.0-only sobre trio contraditório + vocabulário SignPath + 38 assets + legal docs em um LICENSE (shipped) [v1.8.12] «README.txt:496-530»
F-SDL-159. Persistent-queue leases com visibility timeouts, renewals, idempotency keys (shipped) [v1.8.13] «README.txt:496-530»
F-SDL-160. Schema-neutral extraction com field provenance + allowlisted snapshot projection com byte budgets (shipped) [v1.8.13] «README.txt:496-530»
F-SDL-161. Cancellation reasons com compensation callbacks surfacing `compensation-failed` + deterministic retention keep/prune (shipped) [v1.8.13] «README.txt:496-530»
F-SDL-162. OCI labels, build-stage compile e post-push smoke validation no container (shipped) [v1.8.14] «README.txt:496-530»
F-SDL-163. Verified storage pools com quorum writes e read policies first-healthy/verified-first/priority-first (shipped) [v1.8.15] «README.txt:496-530; todo-1.8.15.txt:44-92»
F-SDL-164. Working-set admission com capability-gated bridge plans e materialization ledgers (shipped) [v1.8.15] «README.txt:496-530; todo-1.8.15.txt:93-131»
F-SDL-165. WASM transformation contracts com content-addressed transformation keys e binary-cache manifests (shipped) [v1.8.15] «README.txt:496-530; todo-1.8.15.txt:132-174»
F-SDL-166. Sensitive-cache eligibility (proíbe caching de outputs com segredos/dados pessoais/estado instável) (shipped) [v1.8.15] «todo-1.8.15.txt:132-174»
F-SDL-167. Declarative provider selection com immutable delivery manifests + PWA/CDN plans (shipped) [v1.8.15] «README.txt:496-530; todo-1.8.15.txt:210-240»
F-SDL-168. Mini App/DNS surface requirements — Telegram Mini App adapter sem token embutido + descriptor DNSSEC/HTTPS (shipped) [v1.8.15] «todo-1.8.15.txt:210-240»
F-SDL-169. Magic-byte classification sem confiar em extensão de filename (shipped) [v1.8.15] «todo-1.8.15.txt:132-174»
F-SDL-170. Archive extraction limits (entry count, depth, expansion ratio, traversal, executable-bit) (shipped) [v1.8.15] «todo-1.8.15.txt:132-174»
F-SDL-171. Chunk-delivery manifest com media type, digest, size, order e integrity; verificação de sequência (missing/duplicate/out-of-order/mismatch) (shipped) [v1.8.15] «todo-1.8.15.txt:210-240»
F-SDL-172. Deny-by-default isolated-execution request/decision/handoff contracts com typed projections + subpath isolation browser-safe + unified playground; 139 testes ativos (shipped) [v1.8.18] «README.txt:97-112; 496-530»
F-SDL-173. Virtual control plane (representa, valida, nega e handoffa requests sem executar localmente) + data-only remote-browser capability model (shipped) [v1.8.19] «README.txt:97-112; 531-560»
F-SDL-174. Container multi-arch linux/amd64+arm64+ppc64le com smoke por índice de registry, pull, comparação de labels e execução de CLI (shipped) [v1.8.17] «todo-1.8.16.txt:667-681»
F-SDL-175. README consolidation sobre 41 revisões históricas com matriz por seção (foundation/engine/productization/API/extension/security/package/development/CLI/repository/history/current-scope) (shipped) [v1.8.17] «todo-1.8.16.txt:682-735»

### 1.8.15 plans ainda não implementados (planejados)

F-SDL-176. Storage-pool immutable manifest com replica outcomes, digest, size, creation time e metadata do caller (planned) [v1.8.15] «todo-1.8.15.txt:44-92»
F-SDL-177. Health model de pool com bounded probes e injected clocks — sem background polling no core (planned) [v1.8.15] «todo-1.8.15.txt:44-92»
F-SDL-178. Execução real de host-plan privilegiado (fallocate/mkswap/swapon/tmpfs/zram/mount) por CLI/runner adapter — core só descreve (planned) [v1.8.15] «todo-1.8.15.txt:93-131»
F-SDL-179. WASM capability descriptor (compile/instantiate/streaming/threads/SIMD/WASI/host imports) + budgets CPU/wall-clock/memory/output/file-count/network portáteis (planned) [v1.8.15] «todo-1.8.15.txt:132-174»
F-SDL-180. Provider-chain dry-run dispatch plan renderizável como payloads GitHub/GitLab/Forgejo/Gitea/Codeberg/local CLI sem enviar request (planned) [v1.8.15] «todo-1.8.15.txt:175-209»
F-SDL-181. Execution lease record compatível com resumable workflow + persistent queue (planned) [v1.8.15] «todo-1.8.15.txt:175-209»
F-SDL-182. Runner attestation input (labels, OS, arquitetura, status efêmero, policy ids) ligado a dispatch plan (planned) [v1.8.16] «repo-research-1.8.16.txt:120-190»
F-SDL-183. Provider feature matrix (rangeRead, conditionalWrite, multipart, integrityClaim, objectImmutability, retention, mountRequired, credentialOwner) reportada por adapter (planned) [v1.8.16] «repo-research-1.8.16.txt:190-240»
F-SDL-184. Durability capability receipt (checkpointStore, leaseAuthority, deduplicationScope, retryAuthority, scheduleAuthority, cancellationConfirmation, retentionOwner) (planned) [v1.8.16] «repo-research-1.8.16.txt:220-270»
F-SDL-185. Terminal-state receipt (cancellation/compensation/cleanup confirmed/requested/unavailable/externally unknown), serializável, sem timers/reapers/workers (planned) [v1.8.16] «repo-research-1.8.16.txt:60-120»
F-SDL-186. Provider mutation precondition receipt (exige conditional-write support, digest evidence, declared size limits) (planned) [v1.8.16] «repo-research-1.8.16.txt:100-120»
F-SDL-187. Isolation capability receipt comparando operação pedida contra permissões caller-reported de resource/filesystem/network — estados eligible/denied/adapter-required (planned) [v1.8.16] «repo-research-1.8.16.txt:100-120»
F-SDL-188. Isolation attestation input (runtimeKind, hostAuthority, filesystemPolicy, networkPolicy, cpu/memory/process/timeout budgets, imageOrModuleDigest, evidenceStatus) (planned) [v1.8.16] «repo-research-1.8.16.txt:240-270»
F-SDL-189. Origin-bearing tool result envelope separando claims user/caller/adapter/remote-source sem confiar em label gerado por modelo (planned) [v1.8.16] «repo-research-1.8.16.txt:100-120»
F-SDL-190. Crawl policy receipt com origin normalizado, decisão robots + fonte, sitemap evidence, request budget, parser limits e fetchAdapterRequired (planned) [v1.8.16] «repo-research-1.8.16.txt:240-270»
F-SDL-191. Browser interaction receipt com snapshot identity, reference scope, session isolation claim, trace artifact digest e flag userContextProvided; expira refs quando snapshot muda (planned) [v1.8.16] «repo-research-1.8.16.txt:220-240»
F-SDL-192. Context provenance envelope (sourceDigest, sourceLocator, retrievalMethod, transformIdentity, transformDigest, chunkIdentity, citationRange, contextBudget, adapterRequired) (planned) [v1.8.16] «repo-research-1.8.16.txt:240-270»
F-SDL-193. Evidence policy result (subjectDigest, expectedIdentity, expectedWorkflow, evidenceKind, evidenceStatus, policyDecision, reasons, verificationTime) com 5 níveis absent/declared/downloaded/checked/verified (planned) [v1.8.16] «repo-research-1.8.16.txt:250-270»
F-SDL-194. Release readiness receipt completo (sourceTag, manifestVersions, requiredGates, artifactPlanDigest, publicationTargets, credentialOwner, signingStatus, verificationRequirements) (planned) [v1.8.16] «repo-research-1.8.16.txt:270-300»
F-SDL-195. Runner environment receipt (forgeKind, workflowDialect, runnerImage, os, architecture, toolchainEvidence, executionBoundary, ephemeralClaim, networkAuthority, credentialOwner) (planned) [v1.8.16] «repo-research-1.8.16.txt:300-330»
F-SDL-196. Crawl-checkpoint receipt com caller-owned resume evidence (corroborado por crawl4AI recovery state) (planned) [v1.8.16] «repo-research-1.8.16.txt:55-95»
F-SDL-197. MCP tool safety family (input schema, transport test, redaction policy, abuse test) (planned) [v1.8.16] «todo-1.8.16.txt:465-563»
F-SDL-198. Cross-runtime compatibility family (capability matrix, import graph audit, unsupported state) (planned) [v1.8.16] «todo-1.8.16.txt:465-563»
F-SDL-199. Observability/retention + operator authorization families (bounded metric schema, consent model, scope validator, audit event) (planned) [v1.8.16] «todo-1.8.16.txt:465-563»
F-SDL-200. Objective batches 1.8.16–1.8.20: S3 listing paginado com malformed-response handling; sitemap-index traversal cycle-safe com max URLs; action recording bounded exportável; workflow-input validation estrita com deterministic trigger matching; capability matrix cross-runtime library/browser/desktop/mobile/CLI/binary (planned) [v1.8.20] «README.txt:496-530»

### Engine + storage→RAM (runtime do produto)

F-SDL-201. Storage→RAM bridge com receitas kernel: swapfile 16G, tmpfs 8G, zram zstd 2–3×, zswap, OverlayFS, mmap, git-in-RAM, loop RAM disk (shipped no design/engine de runtime) [v1.0.0] «readme1.txt:398-421»
F-SDL-202. Sandbox REST API com create/execute/sleep/wake/convert-to-ram/memory-stats + WS /exec + cron cleanup (shipped no design) [v1.0.0] «readme1.txt:355-366»
F-SDL-203. Memory engine com transformToCompute/transformToStorage (~2× overhead) sobre 8 backends (shipped) [v1.3.0] «readme1.txt:386-397»
F-SDL-204. sdk-loader zero-install carregando pacotes de CDN em RAM com SQLite cache (shipped no design) [v1.0.0] «readme1.txt:398-421»
F-SDL-205. CDN package farm: chunks 200MB como pacotes npm encadeados servidos por jsDelivr/UNPKG/esm.sh (shipped no design) [v1.0.0] «readme1.txt:472-493; 505-520»
F-SDL-206. Farm `farm.py` de 100 worker repos com dispatch round-robin por workflow_dispatch (shipped no design) [v1.0.0] «readme1.txt:505-520; README.txt:76-90»
F-SDL-207. Multi-forge mirror push simultâneo (multiplicador ~4×) (shipped no design) [v1.3.0] «README.txt:76-90»
F-SDL-208. V3 UI com seletor de forge e display live de onde o processamento roda e quanto storage virou RAM (16GB swap no runner ramdisk) (shipped no design) [v1.3.0] «README.txt:76-90»
F-SDL-209. V4 repo-as-processor: endpoints estáticos `/api/handler.json`, `/api/queue.json`, `/api/state.json`, `/api/workers.json`, `/_bridge/inbox/` (shipped no design) [v4.0.0] «readme1.txt:584-598»
F-SDL-210. Per-sandbox lifecycle repo+pipeline+cron+timeline (issue) com ciclo resumível artifact→mmap→run→sync→artifact (planned→shipped no design) [v4.0.0] «readme1.txt:584-598»
F-SDL-211. Cloudflare Workers orchestrator com R2 bindings, Durable Object de estado, cron cleanup e filas Redis-backed (shipped no design) [v1.0.0] «readme1.txt:540-566»
F-SDL-212. Provider chain oracle→github→hf→gitlab→kaggle com first-free-runner-wins (shipped no design) [v1.0.0] «readme1.txt:540-566»
F-SDL-213. SCDN — entrega de assets por HTTPS via R2/CloudFront/Bun CDN/Deno Deploy/Vercel-Netlify edge (50–200ms edge vs 200–2000ms direto; hits 5–20ms) com env endpoint/token/bucket/region/TTL e retries linear-backoff (shipped no design) [v1.0.0] «README.txt:321-360»
F-SDL-214. CI artifact caching como liquid sandbox persistente com retenção 7 dias (shipped no design) [v1.0.0] «README.txt:284-320»
F-SDL-215. In-browser WASM mesh com gateway shared-memory, worker 8s timeout, cap 512 páginas, mutation scanning, HMAC 5min replay window, OOM 3-camadas (shipped no design) [v1.0.0] «README.txt:284-320»
F-SDL-216. Site-as-VPS emulation (memfs + V8 isolates + container daemons + KV/document DBs + engine microVM WASM emitindo traces vCPU/vRAM/vGPU) (planned) [v1.0.0] «README.txt:361-366»
F-SDL-217. Self-funded compute via GPU mining auto-farms (miners cap 2GB VRAM) num parque de Kubernetes CronJobs free (planned) [v1.0.0] «README.txt:361-366»
F-SDL-218. Pendrive 8GB "HD infinito": Node-20-portable + ESP32 captive portal + hf-mount/rclone/JuiceFS + llama.cpp/BitNet, buckets legais R2/Storj/B2 (planned/demo) [v1.0.0] «readme1.txt:929-940; README.txt:661-680»
F-SDL-219. Capacitor 8.5.0 Android/iOS + Tauri 2 desktop como superfícies mobile/desktop (shipped como target plans; artefatos caller-owned) [v1.8.9] «readme1.txt:275-309; README.txt:156-190; 601-620»
F-SDL-220. Binary self-contained executável — compute sandbox, VM e orquestrador em outros computadores via bun compile/Node SEA (shipped como target) [v1.8.9] «README.txt:156-190; 561-580»
F-SDL-221. Extension MV3 com workerbridge browser-independente e runtime extension entry declarada (shipped) [v1.8.18] «README.txt:156-190; readme1.txt:55-97»
F-SDL-222. Model catalog free com 26 modelos dedup (OpenCode 8, OpenRouter 15 únicos, Kilo 12 únicos, 9 compartilhados) filtrando `-free`, `/free`, `:free` (shipped como catálogo) [v1.8.15] «readme1.txt:136-147; README.txt:373-395»
F-SDL-223. Platform inventory 911 plataformas / 74 categorias gerado de ~6.700 registros e 10.600 URLs (shipped como doc) [v1.8.15] «readme1.txt:148-159; README.txt:641-660»
F-SDL-224. Comparative study 1.8.21: 60 repos analisados por API (54 relevantes, 64 code samples) em 5 categorias com dispositions (shipped como doc) [v1.8.21] «README.txt:531-560; repo-analysis-1.8.21.txt:1-10»

---

## CONTAGEM

- REGRAS ND: **ND-1001..ND-1404 = 404 regras** reais extraídas (mínimo exigido 250 ✔). Distribuição: identidade/pacote 15, governança 27, estrutura/estilo 13, modos 12, engine/lifecycle 33, memória/storage→RAM 31, backends/distribuição 19, compute/farm 27, isolamento 19, scraping/cache/retry/proxy 30, movimento/anti-detection 18, bots 8, packaging/release 32, segurança/legal/pesquisa 25, concorrentes 7, plataformas/forjes 9, OpenCode/Z.ai 10, linhagem V1–V8 16, catálogos de pesquisa 17, feasibility/honestidade 21 (todas com `«arquivo:linhas»`).
- FEATURES F-SDL: **F-SDL-100..F-SDL-224 = 125 features** reais (mínimo exigido 80 ✔), sendo ~70 shipped / ~40 planned-by-design / ~15 shipped-no-design (designs do runtime AetherForge), nenhuma repetida do seed F-SDL-001..088.
- Fontes integralmente lidas: readme1.txt (1–1040; 1040–2033 duplicata descartada), README.txt (592/592), todo.txt (1–175 + mapa), todo-1.8.15.txt (1–300 + mapa), todo-1.8.16.txt (selecionado + mapa), repo-research-1.8.16.txt (1–270), featureaudit.txt (63/63), platforms.txt (seções analíticas + mapa 74 categorias), sites.txt (amostras metodológicas + catálogo), 22.research.universal.runtime.txt (1–130), 15.research.retry.rate.limit.txt (status codes), 14.research.proxy.txt (health checking), mapas de 16/17/18/19/20/21/23/24.research, talks10 (6 arquivos-chave + 2 amostras), repo-analysis-1.8.21.txt (estrutura + 60 repos via grep).
- Pulados/documentados como lixo ou duplicata: readme1.txt 1040–2033 (README reconstruído repetido 2× com artefatos de erro de Write); platforms.txt entradas `_(sem link)_` (~3.700 linhas vazias); sites.txt 630–31.322 (catálogo URL repetitivo — amostrado em 3 pontos); todo.txt 297–708 e todo-1.8.15.txt 300–483 (blocos repetitivos de checklist de release, mapeados por cabeçalho); talks10 arquivos 007–1454 não amostrados individualmente (log de sessão, padrão confirmado em 8 amostras).
- Próxima onda sugerida (4c): ler `repo-synthesis-1.8.21.txt`, `repo-selected-1.8.21.txt`, `enginearchitecture.txt`, `libraryapi.txt`, `memoryengine.txt`, `modes.txt`, `models.txt`, `gapmatrix.txt`, `capabilityreport.txt`, `productindex.txt`, `changelog.txt`, releasenotes 1.8.12–1.8.18 e os corpos integrais de 18/24.research.
