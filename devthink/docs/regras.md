---
name: regras
description: >-
  REGRAS.md — manual-mestre hierárquico de regras da Operação DevThink.
  Consolidação viva: regras-totais (governança total) + REGRAS-CONVERSAS
  (leitura das 6 conversas) + regras por app (devthink, saddle, debonair) +
  ondas de leitura neodocs (append contínuo). Meta: >10.000 regras.
  O especialista e seus subagentes seguem TODAS as regras abaixo. Nada
  inventado: toda regra provém dos arquivos-fonte, com origem citada.
---

# REGRAS — Manual-Mestre da Operação DevThink

> **Como usar este documento**: leia 100% antes de agir. Em conflito, vale a
> ordem de precedência da PARTE 1 (SKILL.md > árvore atual > REGRAS.md >
> transcrições de voz > logs de sessão). "tree wins" · "tree first".
> **Estado da consolidação**: ondas 1–5 aplicadas. Ondas seguintes apendam
> na PARTE 5, com contagem incremental e origem citada em `«…»`.

## ÍNDICE

| Parte | Conteúdo | Fonte | Regras |
|-------|----------|-------|--------|
| 1 | Regras-Totais — governança total (EN, tabela) | `regras-totais.md` (raiz) | ~520 |
| 2 | Regras da leitura das 6 conversas (PT, hierárquico) | `REGRAS-CONVERSAS.txt` (raiz) | ~140 |
| 3 | Regras por app — devthink, saddle, debonair | `regras-APP.md` (raiz) | ~740 |
| 4 | Regras de operação de rede/sandbox/infra (extraídas) | worklog T1–T5 + dominio-config | ~90 |
| 5 | Ondas neodocs (append contínuo → >10.000) | neodocs-txt + neoskills | onda a onda |

Arquivos-irmãos na raiz: `regras-totais.md` · `REGRAS-CONVERSAS.txt` ·
`regras-APP.md` · `features.md` · `gateway.md` · `ARVORE-COMPLETA.md` ·
`contexto.txt` · `CHECKLIST.md` · `package.10.repos` · `worklog.md`.

---

# PARTE 4 — REGRAS DE OPERAÇÃO DE REDE / SANDBOX / INFRA

Extraídas do worklog T1–T5 e do arquivo `dominio-config` (DNS devthink.pro).
Origem citada em `«…»`.

### Rede e DNS

OPR-0001. Domínio devthink.pro: registros A `@`, `*`, `/app/mail/projects/www` → 66.223.49.89 (dev=Auto); wildcard `*` confirma subdomínios `(nome-do-app).devthink.pro`. «dominio-config»
OPR-0002. Email devthink.pro: SPF/DKIM/DMARC via postal.businessidentity.llc; MX mailserver.businessidentity.llc; NS ns1/ns2.hosting.businessidentity.llc. «dominio-config»
OPR-0003. Deploy multissítio idêntico (Vercel, Netlify, Self-Hosted) do pacote core-mesh; site principal central na Netlify; clones estáticos se conversam via mesh. «memoria.storage.txt; saddle/e2ugh»
OPR-0004. Gateway de preview da sandbox: uma porta externa só; requisições a serviços de outras portas usam query `XTransformPort` (ex.: `/api/test?XTransformPort=3030`); caminho sempre relativo, nunca host absoluto. «sandbox Z.ai»
OPR-0005. WebSocket/socket.io: conexão sempre `io("/?XTransformPort={porta}")` com path `/` — nunca porta na URL. «sandbox Z.ai»
OPR-0006. Limites de plataforma: Vercel body 4.5MB (413 FUNCTION_PAYLOAD_TOO_LARGE), hobby 300s; filesystem efêmero em serverless (só `/tmp`). «memoria.storage.txt»
OPR-0007. GitHub Releases como cold storage (2GB por asset, GITHUB_STORAGE_TOKEN); arquitetura "site levitado": backend 100% no GitHub Actions, deploy estático, Git como banco. «memoria.storage.txt»
OPR-0008. Clones de sites (rede de cópias): estáticos; sandbox roda client-side em sandbox.js; login/register chamam a API do main via CORS; main = devthink.pro com container principal. «saddle/e2ugh»
OPR-0009. Mesh entre cópias: HMAC-SHA256 assinada com janela 60s anti-replay (nonce LRU) + AES-256-GCM opcional. «saddle/e2ugh»
OPR-0010. web/package.json = manifest de deploy apenas (private: true, nunca publicado); @wenathlan/e2ugh-web = pacote npm SÓ para deploy dos clones. «saddle/e2ugh»

### Sandbox Z.ai (sobrevivência operacional)

OPR-0011. Sandbox mata processos em background entre tool calls — sobrevivência via double-fork `setsid` (PPID 1) para processos que precisam persistir. «worklog T2/T3»
OPR-0012. OOM killer com 4GB: restarts memory-limited 512MB→1GB→1.5GB; dev-watch.sh auto-restart; webpack em vez de Turbopack sob pressão de memória. «worklog T2»
OPR-0013. Downloads wormhole em FOREGROUND (background é morto); pipeline: salt→HKDF→auth token→torrent AES-128-GCM→B2 chunks→streaming decrypt aes128gcm RFC8188. «wormhole-dl.mjs»
OPR-0014. Regra de disco: baixar→extrair→APAGAR imediatamente o arquivo compactado; 8GB RAM/10GB disco; unzip memória cap 4096MB. «ordens do dono»
OPR-0015. Grandes rars: UNRAR 7.12 estático (rarlab); cada sub-rar apagado após extração; neodocs.rar 2.66GB extraído e apagado. «worklog T5»
OPR-0016. Xvfb + Chrome headed via CDP para logins reais; agent-browser para downloads wormhole (Chromium headless + Service Worker decrypt). «worklog T1»
OPR-0017. opencode CLI v1.18.25 + @ai-sdk/openai-compatible para testes do gateway; providers devthink-v1/v3/v4/v5 apontando baseURL preview. «worklog T2»
OPR-0018. Repos do contexto são git cru: materializar via `git --work-tree` checkout; blobs/objects lidos com git cat-file/show. «worklog T3»
OPR-0019. Auth GitHub por device flow (client_id 178c6fc778ccc68e1d6a); token em `.github-token`; login iakadion; commits SEMPRE como iakadion. «worklog T1/T4»
OPR-0020. Segurança de repo: `.github-token`, `.auth-status`, `.device-flow-current.json`, `db/*.db` fora do commit; chaves NVIDIA reais só no repo PRIVADO wenathlan/gateway (nvidia/nvidia-keys.json); template example + .gitignore no repo público. «worklog T5»

### Gateway @devthink/ai (operacional)

OPR-0021. 35 rotas = 7 endpoints × 5 versões (`chat/completions`, `completions`, `embeddings`, `keys`, `messages`, `models`, `responses` em `src/app/v{1..5}/<endpoint>/route.ts`). «gateway.md»
OPR-0022. V1 = ZAI sem chave (SDK interno da sandbox), só funciona DENTRO da sandbox; V2 Babel.town pausada (503) com fallback para V1; V3 = NVIDIA NIM com 22 chaves `nvapi-…` em rotação LRU; V4 = OpenCode+Kilo free-only; V5 = OpenRouter free-only. «gateway.md»
OPR-0023. Meta-modelo `devthink` mascara o campo `model` em TODA resposta; contexto agregado (glm-5.3, 2.3M ctx). «gateway.md»
OPR-0024. DB: SQLite via Prisma 7.10 + @prisma/adapter-libsql; models ChatMessage, ApiKey, SessionContext, TownKey. «gateway.md»
OPR-0025. Cada rota é self-contained (INLINE-PER-ROUTE); não criar arquivos fora do escopo; não mexer em next.config, Caddyfile, bun.lock, .npmrc. «gateway.md»
OPR-0026. Registro das chaves: push das 22 chaves NVIDIA para o DB e registro (`keys:register`) ANTES do build do Next para que os scripts .zs funcionem. «ordens do dono; gateway-deploy.md»
OPR-0027. Réplicas do gateway: escrever UMA vez no repo; asset de release versionada; nova sandbox carrega o zip (Next compila o código dentro do zip) OU baixa+extrai em src; N cópias via envio do gateway.md em novos chats. «regras-totais; ordens do dono»
OPR-0028. Getry (@devthink/ai) funciona via ZaiWeb SDK apenas dentro da sandbox Z.ai (cookie key, sandbox ID, sandbox name, password ID); V2–V5 funcionam externamente; site externo exige ~6 credenciais (person ID, bearer token etc.). «ordens do dono»
OPR-0029. maene v2.1.13: chat.headers por provider (spoof Gemini CLI não vaza em requests nvidia/openrouter). «worklog T2»
OPR-0030. Teste OpenCode→gateway: opencode.json em tmp com providers devthink-v1/v3/v4/v5; modelos com gpt-oss-20b nvidia/openrouter. «worklog T2»

### Workflows e releases (família 13+)

OPR-0031. Cadeia de release (gateway v1.1.x): push do bump (package.json+CHANGELOG na main) → workflow Release valida lockstep de envelopes (pom.xml revision, csproj Version, gemspec, Dockerfile ARG, CHANGELOG section) → tag v{X.Y.Z} automática → release com notes + source.zip (zip -9) + container.zip + SHA256SUMS → workflow_run dispara 6 publishes (npmjs, GH-npm, Maven, NuGet, RubyGems, GHCR multi-arch amd64+arm64 com gate Trivy). «worklog T2»
OPR-0032. Publishes idempotentes (existence-check/skip-if-exists); tag órfã deletar; npm sem --tag latest recusa mover latest para baixo; tag immutable. «worklog T2»
OPR-0033. Actions por TAG de versão (actions/checkout@v7.0.1, reviewdog/action-actionlint@v1.73.2 — NUNCA SHA-40); imagens base por tag (node:26-slim, oven/bun:1 — sem @sha256:); hashes gerados em runtime. «worklog T2»
OPR-0034. Scorecard PinnedDependenciesID: 100 ocorrências resolvidas SEM hash via delegated dismissal (create_request: true → PATCH /repos/{owner}/{repo}/dismissal-requests/code-scanning/{n} {"status":"approve","message": política ≤280 chars}). «worklog T2»
OPR-0035. Cache GHCR inline (cache-to: type=inline, cache-from: ghcr.io/wenathlan/gateway:<versão>); pacote gateway-buildcache deletado do registry. «worklog T2»
OPR-0036. Dockle accept-key para falsos ENV keys (waited, dpkgArch, serverpid). «worklog T2»
OPR-0037. Loop de bump: se der erro, bumpa pra próxima versão, corrige, repete até verde (gateway 1.1.0→1.1.13, maene 2.1.0→2.1.16, extension 1.1.31→2.0.12 documentados). «worklog T2»
OPR-0038. Security validações: Scorecard 0/0/0, Trivy gate na imagem, actionlint em todos os workflows. «worklog T2»

### Organização de repositórios (estado atual)

OPR-0039. wenathlan/devthink = monorepo canônico com 7 apps + getry: devthink, saddle, debonair, cadria, stealhead, argan, getry; envelope package.json na raiz. «worklog T5»
OPR-0040. Getry mora DENTRO do repo devthink como app (getry/ = plataforma @devthink/ai completa, 138 arquivos); repo independente getry EXCLUÍDO. «ordem do dono; worklog T5»
OPR-0041. 15 apps extras deletados do monorepo: SoFlowX, akash, ansi-art, bob, cli-desktop, create, devthinkos, extension, gl, iakadion, iukka, nathlan, owni, soochimp, soodeska. «worklog T5»
OPR-0042. saddle absorve e2ugh (lossless); devthink absorve devthinkos, cli-desktop, SoFlowX, akash, extension, gateway, maene e embute owni; cadria absorve iukka+create; argan = DNS/gateway; stealhead importa versawase. «ARVORE-COMPLETA (2)»
OPR-0043. wenathlan/gateway (PRIVADO) = biblioteca universal getry @wenathlan/gateway v1.1.13 — produto DISTINTO da plataforma @devthink/ai; main da biblioteca preservado, nada misturado; guarda as chaves NVIDIA. «worklog T4/T5»
OPR-0044. Saddle = VM/DevThink e sandbox engine (AetherForge); devthink NUNCA roda sandbox própria — usa saddle. «regras-totais; ARVORE»
OPR-0045. Fontes canônicas: chaves = wenathlan/gateway privado; docs de deploy = getry/docs/skills/gateway-deploy.md; regras/features/contexto/árvore = raiz do projeto e raiz do repo. «worklog T5»

### Features e UI (consolidadas das conversas)

OPR-0046. Concorrentes a superar: 1,1 milhão+ de features de frameworks, plataformas, bibliotecas, big techs, startups e projetos open source — mas self-hosted. «ordens do dono»
OPR-0047. Nunca tocar no computador/GPU/placa do usuário; compilação e runner não usam CPU/GPU do usuário — Engini virtual interno (saddle). «ordens do dono»
OPR-0048. Múltiplos tipos de sandbox: completo (drivers/vGPU/storage virtualizados) ou via Node/Webpack/Babel/ASIM. «ordens do dono»
OPR-0049. Clonagem de sites: clone responsável por backup, storage e injeção de DB compartilhado (Prisma Schema, MySQL, PostgreSQL, SQLite, Visual Warner — mesmo DB). «ordens do dono»
OPR-0050. Comunicação entre serviços via MimeType; domínios viram runners e keepers; sempre Node.js. «ordens do dono»
OPR-0051. "Loja" = integração Stripe = página Explore (explorar+comprar+categorias, uma página uma função). «ordens do dono»
OPR-0052. Plataforma serve humanos E usuários virtuais (NPC/agentes); integração com sites externos via página de recursos, API embed, link pronto ou NPC. «ordens do dono»
OPR-0053. Explore inclui página de conteúdo, galeria de vídeos com etiqueta de % de IA na produção, grupos/equipes mistos humano+subagente, perfis virtuais marcados. «ordens do dono»
OPR-0054. Ter TODAS as features de plataformas gigantes tipo YouTube, incluindo chatbot. «ordens do dono»
OPR-0055. Tema padrão com componentes flutuantes configuráveis; sol = tema principal (páginas=app: components/css/tsx, sem app.tsx raiz); 3–4 temas seguintes (ex.: Luna). «ordens do dono»
OPR-0056. Neo Chat Interface e Neo Interface = referência para chat box, abas, ícones, micro-animações, bordas. «ordens do dono»
OPR-0057. Neo Doc = sumário de todos os docs de conversas de IA; Neo Getio = Getio com ~5 rotas de gateway. «ordens do dono»
OPR-0058. IMG fica para a fase final (efeitos de diretório, texturas, imagens entram no design skill). «ordens do dono»
OPR-0059. Regras não são total determinismo: usa-se a determinística da árvore completa para arquitetura e a lógica correlata para o resto. «ordens do dono»
OPR-0060. Pesquisar patterns mais recentes de 2026 a cada passo (data 25/09/2026 de referência). «regras-totais»

---

# PARTE 5 — ONDAS NEODOCS (append contínuo → meta >10.000 regras)

> Cada onda lê fontes do neodocs-txt com sed por segmentos e apenda regras
> numeradas sequenciais por faixa (4a: ND-0xxx, 4b: ND-1xxx, 4c: ND-2xxx,
> 4d: ND-3xxx; próximas ondas continuam ND-4xxx+) com origem `«arquivo:linhas»`.
> As FEATURES extraídas por onda moram em `features.md` (mesma numeração).

## ONDA 4a — devthink profundo (fonte: neodocs-txt/outros.devthink)

Manifesto/engines 22 · 40 categorias 40 · AI/LLM 24 · agentes/sandboxes 22 ·
vetores 4 · testes 12 · lint 9 · docs 12 · streams 12 · web/dados 17 ·
CLI/UI 22 · provenance 8 · higiene 10. Descoberta-chave: a superplataforma é
o manifesto npm `devthink v10.0.0` com 65.453 declarações de dependência
(21.817 deps + 43.636 devDeps), catálogo de use-cases em 40 categorias e mapa
de provenance de 19.691 pares pkg→repo. Security-holding/WIP/placeholder →
regras de exclusão (ND-0203..0206).


### A. Manifesto, identidade e engines

ND-0001. A superplataforma deve declarar-se como um único pacote npm de nome `devthink` na versão 10.0.0. «package.10 (10).txt:1-3»
ND-0002. O catálogo de capacidade deve somar 21.818 pacotes classificados. «package.10.case.txt:3»
ND-0003. Toda entrada do catálogo deve ser compilada de package.10.json + package.10.repos.json + descrições (npm/mirrors/GitHub/GitLab). «package.10.case.txt:3»
ND-0004. Toda dependência deve ser fixada em range caret `^x.y.z` (ex.: 0x ^6.0.0, 1c ^10.0.0, 3d-force-graph ^1.80.0). «package.10 (10).txt:5-16»
ND-0005. O manifesto deve manter o acervo em `dependencies` (21.817 entradas) e espelhá-lo ampliado em `devDependencies` (43.636 entradas). «package.10 (10).txt:6-21823;21824-21840»
ND-0006. Todo manifesto deve terminar com bloco `engines` declarando os runtimes suportados. «package.10 (10).txt:65464-65481»
ND-0007. Executar sobre Node.js ^26.8.2. «package.10 (10).txt:65474»
ND-0008. Instalar/operar com npm ^12.1.0. «package.10 (10).txt:65475»
ND-0009. Suportar pnpm ^12.6.0 como gerenciador de pacotes. «package.10 (10).txt:65476»
ND-0010. Suportar yarn ^4.17.1 como gerenciador de pacotes. «package.10 (10).txt:65480»
ND-0011. Suportar bun ^1.4.2 como runtime alternativo. «package.10 (10).txt:65466»
ND-0012. Suportar deno ^2.9.5 como runtime alternativo. «package.10 (10).txt:65470»
ND-0013. Compilar com typescript ^5.8.0. «package.10 (10).txt:65478»
ND-0014. Integrar-se ao vscode ^1.118.0 como host de extensões. «package.10 (10).txt:65479»
ND-0015. Suportar chrome ^16.0.912+ como engine de browser. «package.10 (10).txt:65467»
ND-0016. Suportar firefox >=0.8.0 como engine de browser. «package.10 (10).txt:65472»
ND-0017. Suportar bare ^1.18.0 como runtime embarcado. «package.10 (10).txt:65465»
ND-0018. Suportar cnpm ^9.4.0 como instalador alternativo (espelho China). «package.10 (10).txt:65468»
ND-0019. Ativar corepack ^0.35.0 para fixar gerenciadores. «package.10 (10).txt:65469»
ND-0020. Manter compatibilidade mínima ecmascript ^5.0.0. «package.10 (10).txt:65471»
ND-0021. Legado iojs ^1.0.0 apenas para compatibilidade histórica. «package.10 (10).txt:65473»
ND-0022. Suportar teleport >=0.2.0 como alvo de deploy. «package.10 (10).txt:65477»

### B. Taxonomia das 40 categorias do catálogo

ND-0023. Provisionar integração de provedores LLM e execução de agentes no CLI e gateway pela categoria AI/LLM (809 pacotes). «package.10.case.txt:6;47-233»
ND-0024. Operar embeddings e vector-DB como pilar próprio (56 pacotes). «package.10.case.txt:7»
ND-0025. Automatizar browsers pela categoria Browser-Automation (141). «package.10.case.txt:8»
ND-0026. Raspar web pela categoria Web-Scraping (61). «package.10.case.txt:9»
ND-0027. Padronizar clientes HTTP (264). «package.10.case.txt:10»
ND-0028. Padronizar servidores web (281). «package.10.case.txt:11»
ND-0029. Padronizar frameworks web (361). «package.10.case.txt:12»
ND-0030. Padronizar persistência Database (288). «package.10.case.txt:13»
ND-0031. Padronizar ORM/ODM (64). «package.10.case.txt:14»
ND-0032. Validar tudo em borda com Validation/Schema (339). «package.10.case.txt:15»
ND-0033. Registrar eventos via Logging (124). «package.10.case.txt:16»
ND-0034. Manipular tempo com Date-Time (146). «package.10.case.txt:17»
ND-0035. Proteger com Crypto/Security (463). «package.10.case.txt:18»
ND-0036. Garantir qualidade via Testing (691). «package.10.case.txt:19»
ND-0037. Estilo e conformidade via Linting/Formatting (565). «package.10.case.txt:20»
ND-0038. Construir via Build-Tools (1302). «package.10.case.txt:21»
ND-0039. Empacotar via Bundlers (247). «package.10.case.txt:22»
ND-0040. Operar a CLI com CLI-Tools (688). «package.10.case.txt:23»
ND-0041. Documentar via Markdown/Docs (521). «package.10.case.txt:24»
ND-0042. Internacionalizar via i18n/l10n (119). «package.10.case.txt:25»
ND-0043. Gerenciar estado com State-Management (101). «package.10.case.txt:26»
ND-0044. Compor interfaces com UI-Components (1619). «package.10.case.txt:27»
ND-0045. Estilizar com CSS/Styling (514). «package.10.case.txt:28»
ND-0046. Acessar disco com File-System (475). «package.10.case.txt:29»
ND-0047. Dados em movimento com Streams/Buffers (365). «package.10.case.txt:30»
ND-0048. Rede bruta com Networking/Sockets (351). «package.10.case.txt:31»
ND-0049. Assincronia distribuída com Messaging/Queues (133). «package.10.case.txt:32»
ND-0050. Acelerar leitura com Caching (119). «package.10.case.txt:33»
ND-0051. Configurar via Config/Env (179). «package.10.case.txt:34»
ND-0052. Transformar dados com Data-Processing (910). «package.10.case.txt:35»
ND-0053. Tratar mídia com Image/Media (804). «package.10.case.txt:36»
ND-0054. Gerar PDF/Documents (58). «package.10.case.txt:37»
ND-0055. Enviar Email (140). «package.10.case.txt:38»
ND-0056. Autenticar com Authentication (136). «package.10.case.txt:39»
ND-0057. Observar com Monitoring/Observability (255). «package.10.case.txt:40»
ND-0058. Entregar com Deployment/CI-CD (313). «package.10.case.txt:41»
ND-0059. Distribuir com Package-Management (252). «package.10.case.txt:42»
ND-0060. Equipar o editor com Editor/IDE-Tools (1071). «package.10.case.txt:43»
ND-0061. Utilitários gerais em Utilities/Misc (6109). «package.10.case.txt:44»
ND-0062. Reduzir Uncategorized (384) a zero re-classificando cada pacote. «package.10.case.txt:45»

### C. Matriz de provedores AI/LLM (@ai-sdk)

ND-0063. Padronizar toda integração de provedores sobre a família @ai-sdk (provider ^4.0.18 + provider-utils + openai-compatible ^3.0.55). «package.10.descricoes (2).txt:121;119»
ND-0064. Prover Anthropic via @ai-sdk/anthropic ^4.0.63. «package.10.descricoes (2).txt:95»
ND-0065. Prover OpenAI via @ai-sdk/openai ^4.0.75. «package.10.descricoes (2).txt:118»
ND-0066. Prover Google via @ai-sdk/google ^4.0.80. «package.10.descricoes (2).txt:108»
ND-0067. Prover Azure via @ai-sdk/azure ^4.0.79. «package.10.descricoes (2).txt:97»
ND-0068. Prover AWS Bedrock via @ai-sdk/amazon-bedrock ^5.0.94. «package.10.descricoes (2).txt:94»
ND-0069. Prover Google Vertex via @ai-sdk/google-vertex. «package.10.case.txt:91»
ND-0070. Prover Groq via @ai-sdk/groq ^4.0.48. «package.10.descricoes (2).txt:110»
ND-0071. Prover Mistral via @ai-sdk/mistral ^4.0.50. «package.10.descricoes (2).txt:117»
ND-0072. Prover DeepSeek via @ai-sdk/deepseek ^3.0.52. «package.10.descricoes (2).txt:102»
ND-0073. Prover xAI Grok via @ai-sdk/xai ^5.0.8. «package.10.descricoes (2).txt:132»
ND-0074. Prover Cerebras via @ai-sdk/cerebras ^3.0.55. «package.10.descricoes (2).txt:98»
ND-0075. Prover Cohere via @ai-sdk/cohere. «package.10.case.txt:81»
ND-0076. Prover Perplexity via @ai-sdk/perplexity. «package.10.case.txt:102»
ND-0077. Prover TogetherAI via @ai-sdk/togetherai. «package.10.case.txt:109»
ND-0078. Prover Fireworks via @ai-sdk/fireworks. «package.10.case.txt:87»
ND-0079. Prover DeepInfra via @ai-sdk/deepinfra. «package.10.case.txt:83»
ND-0080. Prover Alibaba via @ai-sdk/alibaba. «package.10.case.txt:75»
ND-0081. Rotejar modelos via @ai-sdk/gateway ^4.0.92. «package.10.descricoes (2).txt:106»
ND-0082. Conectar servidores MCP via @ai-sdk/mcp ^2.0.58. «package.10.descricoes (2).txt:116»
ND-0083. Expor agentes em React/Svelte/Vue/TUI (@ai-sdk/react ^4.0.117, tui ^1.0.115). «package.10.descricoes (2).txt:123;128»
ND-0084. Suportar o SDK oficial OpenAI ^7.23.0. «package.10.descricoes (2).txt:15890»
ND-0085. Suportar o SDK oficial Anthropic @anthropic-ai/sdk ^0.128.0. «package.10.descricoes (2).txt:238»
ND-0086. Orquestrar cadeias locais com langchain ^1.5.12 e llamaindex ^0.12.1. «package.10.descricoes (2).txt:13884;14127»

### D. Agentes, protocolos e sandboxes

ND-0087. Falar o protocolo Agent2Agent via @a2a-js/sdk ^1.2.1. «package.10.descricoes (2).txt:39»
ND-0088. Falar o protocolo AG-UI via @ag-ui/client ^1.0.0, core ^1.0.0, encoder ^1.0.0, proto ^1.0.0. «package.10.descricoes (2).txt:74-75;77;83»
ND-0089. Pontear AG-UI com CrewAI ^0.0.4, LangGraph ^0.0.43, LlamaIndex, Mastra ^1.1.4 e AWS Strands. «package.10.descricoes (2).txt:76;78;80; package.10.case.txt:63-65»
ND-0090. Pontear AG-UI com o Claude Agent SDK (@ag-ui/claude-agent-sdk). «package.10.case.txt:58»
ND-0091. Ligar agentes a servidores MCP via @ag-ui/mcp-middleware e mcp-apps-middleware. «package.10.case.txt:66-67»
ND-0092. Renderizar UI de subagentes com @a2ui/lit ^0.11.0 + a2ui-toolkit (op builders, prompt assembly, history walkers). «package.10.descricoes (2).txt:40; package.10.case.txt:56»
ND-0093. Padronizar editor↔agente com Agent Client Protocol @agentclientprotocol/sdk ^1.5.0. «package.10.descricoes (2).txt:86»
ND-0094. Embutir Claude Agent SDK ^0.3.282 e Claude Code ^2.1.282 com binários nativos por plataforma (darwin/linux/win/musl). «package.10.descricoes (2).txt:219;228; package.10.case.txt:119-136»
ND-0095. Delimitar segurança de ferramentas com @anthropic-ai/sandbox-runtime ^0.0.77. «package.10.descricoes (2).txt:237»
ND-0096. Persistir memória de agentes com @agentmemory/agentmemory ^0.9.29 (iii-engine). «package.10.descricoes (2).txt:88»
ND-0097. Expor runtime de copiloto com @copilotkit/runtime ^1.73.3. «package.10.descricoes (2).txt:1134»
ND-0098. Canalizar copilotos por Slack/Discord/Teams/Telegram/WhatsApp com o engine JSX agnóstico (@copilotkit/channels-core createChannel/Thread/PlatformAdapter, adaptadores ^0.11.0). «package.10.descricoes (2).txt:1120-1127»
ND-0099. Rodar o DeepSeek Harness: @deepseek-ai/dsh-agent ^0.1.0-rc.6 (registry + vocabulário de eventos). «package.10.descricoes (2).txt:1311»
ND-0100. Fechar o loop do agente com dsh-agent-loop ^0.1.0-rc.6. «package.10.descricoes (2).txt:1314»
ND-0101. Executar bash local como seam com dsh-bash-local ^0.0.1-rc.1. «package.10.descricoes (2).txt:1328»
ND-0102. Expor API remota e autorização com dsh-api-gateway ^0.0.1-rc.1 + dsh-authorization ^0.1.1-rc.1. «package.10.descricoes (2).txt:1320;1326»
ND-0103. Sandboxesear comandos com @cloudflare/sandbox ^0.12.10. «package.10.descricoes (2).txt:1008»
ND-0104. Executar agentes Workers com @cloudflare/shell ^0.4.3, computer ^0.3.1 (FS virtual SQLite), codemode ^0.5.2 e think ^0.19.0 (loop agêntico + stream resumption). «package.10.descricoes (2).txt:1002-1010»
ND-0105. Provisionar sandboxes com OpenSandbox ^1.1.0 (lifecycle + execd + code-interpreter). «package.10.descricoes (2).txt:163; package.10.case.txt:116-117»
ND-0106. Orquestrar agentes Cursor via @cursor/sdk ^1.0.32. «package.10.descricoes (2).txt:1222»
ND-0107. Dar pesquisa web multi-etapa aos agentes via exa-mcp-server ^3.4.1. «package.10.descricoes (2).txt:11218»
ND-0108. Rodar agentes backend duráveis filesystem-first com eve ^0.66.3. «package.10.descricoes (2).txt:11185»

### E. Vetores e inferência local

ND-0109. Indexar vetores localmente com faiss-node ^0.5.1. «package.10.descricoes (2).txt:11398»
ND-0110. Indexar vetores ANN com hnswlib-node ^3.0.0. «package.10.descricoes (2).txt:12661»
ND-0111. Inferir localmente com onnxruntime-node ^1.31.0-dev. «package.10.descricoes (2).txt:15869»
ND-0112. Tokenizar localmente com @anush008/tokenizers (binários darwin/linux/win). «package.10.case.txt:139-142»

### F. Testes

ND-0113. Testar com jest ^30.5.2. «package.10.descricoes (2).txt:13418»
ND-0114. Testar com vitest ^5.0.1. «package.10.descricoes (2).txt:21065»
ND-0115. Testar DOM com @testing-library/dom ^10.4.2, react ^16.3.3, user-event ^14.6.7. «package.10.descricoes (2).txt:5848;5853;5858»
ND-0116. Testar TAP com @tapjs/core ^4.6.0 (node-tap plugável). «package.10.descricoes (2).txt:5771»
ND-0117. Fazer mutation testing com @stryker-mutator/core ^10.0.0. «package.10.descricoes (2).txt:5440»
ND-0118. Subir dependências reais com @testcontainers/mysql, postgresql e redis ^12.1.0. «package.10.descricoes (2).txt:5845-5847»
ND-0119. Cobrir E2E com Cypress (@cypress/code-coverage ^4.0.3 + família @cypress/*). «package.10.descricoes (2).txt:1236; package.10.case.txt:3514-3520»
ND-0120. Automatizar browsers com playwright ^1.63.0 e puppeteer ^25.12.0. «package.10.descricoes (2).txt:16548;17119»
ND-0121. Testar visualmente com percy (appium/selenium-webdriver/webdriverio). «package.10.case.txt:3560-3563»
ND-0122. Testar UI em Storybook com addons a11y/actions/interactions/vitest/themes/viewport. «package.10.case.txt:3576-3589»
ND-0123. Simular DOM com happy-dom ^20.14.5 e jsdom ^30.1.1. «package.10.descricoes (2).txt:12486;13568»
ND-0124. Testar workers com @cloudflare/vitest-pool-workers e congelar tempo com @sinonjs/fake-timers ^15.4.0. «package.10.case.txt:3511; package.10.descricoes (2).txt:5056»

### G. Lint, formatação e qualidade

ND-0125. Lintar com eslint ^10.11.0 (AST-based pattern checker). «package.10.descricoes (2).txt:10945»
ND-0126. Formatar com prettier ^3.9.9. «package.10.descricoes (2).txt:16849»
ND-0127. Rodar toolchain unificada com @biomejs/biome ^2.5.14. «package.10.descricoes (2).txt:781»
ND-0128. Ativar 300+ regras extras com eslint-plugin-unicorn ^76.0.0. «package.10.descricoes (2).txt:11119»
ND-0129. Auditar código com eslint-plugin-security ^4.0.1. «package.10.descricoes (2).txt:11102»
ND-0130. Bloquear Trojan Source com eslint-plugin-anti-trojan-source ^1.1.7. «package.10.descricoes (2).txt:11028»
ND-0131. Proibir código não-sanitizado com eslint-plugin-no-unsanitized ^4.1.5. «package.10.descricoes (2).txt:11076»
ND-0132. Proteger apps Node com firewall embutido @aikidosec/firewall ^1.8.42 (Zen). «package.10.descricoes (2).txt:135»
ND-0133. Prender qualidade ao git com husky ^9.1.7 + lint-staged ^17.5.1 + commitlint ^21.2.3. «package.10.descricoes (2).txt:12812;14090;9477»

### H. Documentação, Markdown e OpenAPI

ND-0134. Compilar MDX com @mdx-js/mdx ^3.1.1. «package.10.descricoes (2).txt:3078»
ND-0135. Sustentar sites de docs com @docusaurus/core ^3.10.2. «package.10.descricoes (2).txt:1588»
ND-0136. Versionar docs e blog com @docusaurus/plugin-content-docs e plugin-content-blog ^3.10.2. «package.10.descricoes (2).txt:1595-1596»
ND-0137. Montar docs modernas com @fumadocs/ui ^16.5.0 + @fumadocs/mdx-remote ^1.5.2. «package.10.descricoes (2).txt:2149;2146»
ND-0138. Destacar código com @shikijs/core ^4.4.3 + themes + transformers + twoslash. «package.10.descricoes (2).txt:5002;5010-5012»
ND-0139. Gerar API reference com @scalar/api-reference ^1.72.0 (+react ^0.9.73). «package.10.descricoes (2).txt:4877-4878»
ND-0140. Parsear OpenAPI com @scalar/openapi-parser ^0.29.6 e versionar com workspace-store ^0.66.0. «package.10.descricoes (2).txt:4888;4909»
ND-0141. Buscar em docs estáticas com @pagefind/default-ui ^1.5.2. «package.10.descricoes (2).txt:4028»
ND-0142. Gerar changelog de git metadata com conventional-changelog ^8.1.3. «package.10.descricoes (2).txt:9636»
ND-0143. Padronizar doc-comments TS com @microsoft/tsdoc ^0.17.0. «package.10.descricoes (2).txt:3123»
ND-0144. Editar Markdown no workbench com @uiw/react-md-editor ^4.1.2 e @mdxeditor/editor ^4.2.5. «package.10.descricoes (2).txt:6849;3082»
ND-0145. Renderizar markdown/MDX/docs+código/changelogs/CLI-reference nas camadas do workbench. «package.10.case.txt:7000-7184»

### I. Streams e pipeline do gateway

ND-0146. Compor streams com minipass ^7.1.3. «package.10.descricoes (2).txt:14909»
ND-0147. Usar streamx ^2.28.1 (iteração melhorada dos streams core). «package.10.descricoes (2).txt:19274»
ND-0148. Injetar transformações com through2 ^5.0.11. «package.10.descricoes (2).txt:19847»
ND-0149. Pipeline JSON com stream-json ^3.7.0. «package.10.descricoes (2).txt:19243»
ND-0150. Serializar NDJSON com ndjson ^2.0.0. «package.10.descricoes (2).txt:15310»
ND-0151. Usar o cinto de utilidades mississippi ^4.0.0. «package.10.descricoes (2).txt:14927»
ND-0152. Ler/gravar tar com tar-stream ^3.2.1 + tar-fs ^3.1.3. «package.10.descricoes (2).txt:19620;19618»
ND-0153. Tar zero-dependency com modern-tar ^0.8.5. «package.10.descricoes (2).txt:15052»
ND-0154. Consumir SSE com eventsource ^5.1.2 e parsear com eventsource-parser ^4.1.1. «package.10.descricoes (2).txt:11208;11210»
ND-0155. Fazer fetch de EventSource com @ai-zen/node-fetch-event-source ^2.1.4. «package.10.descricoes (2).txt:133»
ND-0156. Throttle de respostas com speed-limiter ^1.0.2. «package.10.descricoes (2).txt:19025»
ND-0157. Comprimir pipelines com lz4 ^0.6.5 e zstd ^1.0.4. «package.10.descricoes (2).txt:14388;21809»

### J. Web, dados e segurança

ND-0158. Servir HTTP com express ^5.2.1. «package.10.descricoes (2).txt:11340»
ND-0159. Servir HTTP de baixa latência com fastify ^5.12.5. «package.10.descricoes (2).txt:11472»
ND-0160. Rodar edge no Cloudflare Workers com worktop ^0.7.3. «package.10.descricoes (2).txt:21541»
ND-0161. Servir GraphQL com @apollo/server ^5.5.1. «package.10.descricoes (2).txt:258»
ND-0162. WebSocket com ws ^8.21.3. «package.10.descricoes (2).txt:21562»
ND-0163. Clientes HTTP: axios ^1.20.0, got ^16.0.0, node-fetch ^3.3.2, undici ^8.11.2. «package.10.descricoes (2).txt:8136;12262;15481;20470»
ND-0164. ETags com etag ^1.8.1. «package.10.descricoes (2).txt:11177»
ND-0165. Headers de segurança com helmet ^8.3.0. «package.10.descricoes (2).txt:12604»
ND-0166. IPC local/remoto com @achrinza/node-ipc ^9.2.10. «package.10.descricoes (2).txt:43»
ND-0167. Validar schemas com zod ^4.6.5, ajv ^8.20.0, joi ^18.2.9. «package.10.descricoes (2).txt:21791;7589;13490»
ND-0168. Persistir com drizzle-orm ^0.45.3, mongoose ^9.10.2, knex ^3.3.0. «package.10.descricoes (2).txt:10512;15093;13817»
ND-0169. Enfileirar com bullmq ^6.3.8 sobre redis ^6.2.1 / ioredis ^6.0.0. «package.10.descricoes (2).txt:8792;17757;13122»
ND-0170. Cachear LRU com @alloc/quick-lru ^5.3.0. «package.10.descricoes (2).txt:165»
ND-0171. Cripto de app: bcryptjs ^3.0.3, jsonwebtoken ^9.0.3, xml-crypto ^6.3.2. «package.10.descricoes (2).txt:8421;13656;21622»
ND-0172. Resolver captcha com @2captcha/captcha-solver ^1.3.9. «package.10.descricoes (2).txt:37»

### K. CLI, desktop e UI

ND-0173. Parsear CLI com commander ^15.0.0. «package.10.descricoes (2).txt:9466»
ND-0174. Prompt interativo com inquirer ^14.2.2. «package.10.descricoes (2).txt:13048»
ND-0175. Estilizar terminal com chalk ^6.0.0. «package.10.descricoes (2).txt:9022»
ND-0176. Spinner com ora ^9.4.1. «package.10.descricoes (2).txt:15991»
ND-0177. Executar processos com execa ^10.0.1 e cross-spawn ^7.0.6. «package.10.descricoes (2).txt:11233;9820»
ND-0178. Scriptar com zx ^8.8.5. «package.10.descricoes (2).txt:21816»
ND-0179. Arte ASCII com figlet ^1.11.4. «package.10.descricoes (2).txt:11551»
ND-0180. Notificar e abrir: node-notifier ^10.0.1, open ^11.0.4. «package.10.descricoes (2).txt:15524;15879»
ND-0181. Vigiar e varrer arquivos: chokidar ^5.0.0, glob ^13.0.6, fs-extra ^11.4.1, rimraf ^6.1.3. «package.10.descricoes (2).txt:9100;12134;11850;18091»
ND-0182. Zipar com adm-zip ^0.6.1. «package.10.descricoes (2).txt:7494»
ND-0183. Versionar e identificar: semver ^7.8.5, uuid ^14.0.2 (RFC9562). «package.10.descricoes (2).txt:18532;20767»
ND-0184. Desktop com electron ^44.4.5. «package.10.descricoes (2).txt:10662»
ND-0185. Editor embutido com monaco-editor ^0.57.0. «package.10.descricoes (2).txt:15082»
ND-0186. Visualização: three ^0.186.1, d3 ^7.9.0, echarts ^6.1.0. «package.10.descricoes (2).txt:19806;9975;10616»
ND-0187. Workbench web: react ^19.3.0, next ^16.3.6, tailwindcss ^4.3.3. «package.10.descricoes (2).txt:17349;15369;19595»
ND-0188. Estado e util: immer ^11.1.18, jotai ^3.0.0, nanostores ^1.5.3, lodash ^4.18.1. «package.10.descricoes (2).txt:12945;13498;15262;14191»
ND-0189. Tempo: dayjs ^1.11.23, luxon ^3.7.2, date-fns ^4.4.0. «package.10.descricoes (2).txt:10081;14380;10065»
ND-0190. Conteúdo: marked ^18.0.14, remark ^15.0.1, turndown ^7.2.4 (HTML→MD), cheerio ^1.2.0. «package.10.descricoes (2).txt:14519;17873;20294;9083»
ND-0191. Imagem com sharp ^0.35.4. «package.10.descricoes (2).txt:18653»
ND-0192. Planilhas com xlsx ^0.18.5 e exceljs ^4.4.0. «package.10.descricoes (2).txt:21617;11225»
ND-0193. Empacotar com esbuild ^0.28.2, rollup ^4.63.5, webpack ^5.111.1. «package.10.descricoes (2).txt:10887;18134;21347»
ND-0194. Web3 opcional com ethers ^6.17.0. «package.10.descricoes (2).txt:11179»

### L. Provenance (pkg → repo upstream)

ND-0195. Todo pacote deve ter repositório upstream mapeado (19.691 pares pkg→URL). «package.10.repos (2).txt:1-300»
ND-0196. Famílias compartilham repo canônico: @ai-sdk/* → vercel/ai. «package.10.repos (2).txt:75-110»
ND-0197. @angular/* → angular/angular ou angular/angular-cli; @actions/* → actions/toolkit. «package.10.repos (2).txt:1-300»
ND-0198. workbox-* → googlechrome/workbox; @algolia/* → algolia/algoliasearch-client-javascript. «package.10.repos (2).txt:1-300;19400-19691»
ND-0199. zod → colinhacks/zod; zx → google/zx; ws → websockets/ws. «package.10.repos (2).txt:19400-19691»
ND-0200. URLs GitLab são válidas como upstream (worker-f, write-excel-file, workflow_builder). «package.10.repos (2).txt:19400-19691»
ND-0201. Upstream não-canônico (yt-dlp → koyeb.app/pkg) deve ser marcado para auditoria. «package.10.repos (2).txt:19400-19691»
ND-0202. Binários nativos por plataforma (claude-code/claude-agent-sdk/tokenizers/ast-grep/astro-compiler -darwin/-linux/-win/-musl) entram como pacotes separados, nunca agregados. «package.10.case.txt:120-142; package.10.descricoes (2).txt:220-236»

### M. Higiene do catálogo

ND-0203. Pacotes `security holding` (2x, 2x2, 4x, 8x, eslint-v7/v9) ficam fora do build. «package.10.descricoes (2).txt:13-14;19;29»
ND-0204. Descrições vazias (2c, 4c, 5c, 6z, 7c, 9c, @ai-sdk/alibaba, @agentwire/*) devem ser preenchidas antes do uso em feature. «package.10.descricoes (2).txt:7;17;20;22;24;30;87-94»
ND-0205. Pacotes WIP (7z: "WORK IN PROGRESS, DON'T EVEN THINK OF USING THIS LIB") proibidos em produção. «package.10.descricoes (2).txt:25»
ND-0206. Placeholders (2k, 4k, example "No README.md") não contam como capacidade real. «package.10.descricoes (2).txt:12;18»
ND-0207. Variantes de plataforma (wasm32-wasi, musl, msvc, arm64/x64) não devem ser deduplicadas. «package.10.case.txt:7000-7006»
ND-0208. Tooling de profiling (0x, flamegraph single-command) é permitido como meta-pacote. «package.10.descricoes (2).txt:2»
ND-0209. Categorizar TODO pacote; alvo Uncategorized = 0 (384 atuais). «package.10.case.txt:45»
ND-0210. Re-triar periodicamente as maiores categorias: UI-Components (1619) e Utilities/Misc (6109). «package.10.case.txt:27;44»
ND-0211. Priorizar curadoria por volume: Build-Tools (1302), Data-Processing (910), AI/LLM (809). «package.10.case.txt:21;35;6»
ND-0212. Cada categoria deve ter header `##` próprio e contagem no índice. «package.10.case.txt:4-46»
ND-0213. Casos de uso DevThink devem ser declarados por pacote no formato `*DevThink use:* …`. «package.10.case.txt:47-233»
ND-0214. Todo uso de dependência deve herdar o "DevThink use" da sua categoria (ex.: Streams → "process streaming gateway responses efficiently"). «package.10.case.txt:10500-10684»

---

## ONDA 4b — saddle profundo (fonte: neodocs-txt/outros.saddle)

Arquitetura VM/sandbox (deny-by-default 1.8.18, ladder gVisor-without-KVM/
Firecracker-with-KVM, vm2/node:vm banidos, 15 receipts), virtualização (WASM
mesh 512 páginas, VDR 64-bit/9,22EB, repo-as-processor V4 C1/C2/C3), storage
(pool >33TB, 8 backends, CDN farm `.bin.js`, file-as-compute 600 chunks/10
repos), rede (SSE 6/origem, keepalive 30s, proxy graveyard 3 falhas/revive
5min), runners (cadeia oracle→gha→hf→gitlab→kaggle, quotas por forge,
farm.py), packaging (38 assets, 3-arch OCI amd64/arm64/ppc64le, signing
honestos), bots/keepers (PlatformAdapter 12 forges, 12 verbos), deploy
(rejeição de Functions, host/porta sorteados), organização (root-first
no-src, V8 flat prefixo numérico, mirrors de forge), legal (captcha = risco
#1 opt-in, ANATEL/FCC, AGPL sem cópia).


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

## ONDA 4c — debonair profundo (fonte: neodocs-txt/outros.debonair)

Qualidade: layer architecture 10–13 camadas × 13 gêneros, Genre DNA 7
dimensões, pipeline 6 estágios, 13 quality checks + auto-fix, grade A–F,
LUFS/-1 dBTP BS.1770-4. Treinamento: máquina 7 camadas, datasets
(Lakh/MAESTRO/MusicCaps), Demucs DSP+ML 2 tiers, SQLite+FAISS+FTS5,
tokenização ~2000 tokens, RAVE/DDSP/HiFi-GAN ONNX INT8, FAD/KLD. Offline:
pacote npm <50MB (~33MB), pattern DB CBOR+LZ4, matriz de compatibilidade
sparse, assembly CSP + fallback chain 4 níveis, Karplus-Strong/FM/granular.
Mixing/mastering: receitas por gênero (trap/pop/hip-hop/EDM), targets por
plataforma (Spotify -14 → Beatport -9). Concorrência: 10 concorrentes, moat
13 itens ("Stripe da música", TypeScript-native, offline, MIDI editável),
roadmap v0.1.0→v2.0.0.


### Bloco 1 — SISTEMA-QUALIDADE-COMPLETO.txt (arquitetura de qualidade, camadas, validação)

ND-2001. Garanta que cada faixa gerada soe profissional e distinta por gênero com pipeline referenciado: Assembly → Mixing → Mastering → Validation → Export. «SISTEMA-QUALIDADE-COMPLETO.txt:1-19»
ND-2002. Organize 10–15 camadas por gênero com alocação precisa de frequência, pan e sintese declaradas por linha (ex.: Trap 12 camadas de 808-sub 40–80Hz a FX 200–10kHz). «SISTEMA-QUALIDADE-COMPLETO.txt:25-40»
ND-2003. Defina Genre DNA em 7 dimensões: banda dominante, inclinação espectral, LRA, clipping/sidechain, reverb, panning e BPM. «SISTEMA-QUALIDADE-COMPLETO.txt:42-51»
ND-2004. Fixe DNA do Trap: BPM 130–170 (half-time 65–85), sub-bass 30–100Hz dominante, LRA 8–12 LU, kick ducha 808, snare ducha pad, reverb plate curto no snare e nenhum no 808. «SISTEMA-QUALIDADE-COMPLETO.txt:42-51»
ND-2005. Fixe DNA do Pop: BPM 100–130, mid 500–3000Hz dominante, tilt flat com presence 3–5kHz, LRA 6–9 LU, sidechain leve. «SISTEMA-QUALIDADE-COMPLETO.txt:70-79»
ND-2006. Fixe DNA do EDM/House: BPM 118–135, kick 40–80Hz com sidechain pesado (tudo ducha ao kick), LRA 4–7 LU, arranjo Build→Drop→Break. «SISTEMA-QUALIDADE-COMPLETO.txt:96-104»
ND-2007. Fixe DNA do Hip-Hop boom bap: BPM 85–115, swing 55–65%, low-mid 100–500Hz quente, vinyl crackle/tape saturation como textura. «SISTEMA-QUALIDADE-COMPLETO.txt:121-130»
ND-2008. Fixe DNA do Lo-Fi: BPM 60–85, espectro muito escuro (highs cortados), wobble de tape wow/flutter, noise floor de vinil sempre presente, LRA 5–8 LU. «SISTEMA-QUALIDADE-COMPLETO.txt:171-180»
ND-2009. Fixe DNA do Drill: BPM 140–170, sub 30–80Hz com 808 longos e slides, hihat em rolls/triplets, mood escuro e cinematográfico. «SISTEMA-QUALIDADE-COMPLETO.txt:198-206»
ND-2010. Fixe DNA do Ambient: BPM 60–90 ou tempo livre, reverb 3–5s, estéreo extremamente largo, LRA 10–15 LU sem compressão. «SISTEMA-QUALIDADE-COMPLETO.txt:247-255»
ND-2011. Fixe DNA do Jazz: swing 60–70%, LRA 10–14 LU, sem sidechain, arranjo head→solos→head. «SISTEMA-QUALIDADE-COMPLETO.txt:273-281»
ND-2012. Fixe DNA do Cinematic: LRA 15–20 LU (gênero mais dinâmico), hall 2–4s, imagem orquestral larga, 13 camadas de sub a FX. «SISTEMA-QUALIDADE-COMPLETO.txt:307-332»
ND-2013. Fixe DNA do Reggaeton: BPM 90–100, padrão dembow (kick em 1,2,3,4; snare no "and" de 2 e 4), congas/timbales largos. «SISTEMA-QUALIDADE-COMPLETO.txt:223-231»
ND-2014. Fixe DNA do Funk: groove de 16th sincopado, clavinet/wah, LRA 8–12 LU, room tight. «SISTEMA-QUALIDADE-COMPLETO.txt:350-358»
ND-2015. Execute o pipeline de qualidade em 6 estágios: Reference Analysis → Layer Assembly → Automatic Mixing → Mastering → Quality Validation → Export. «SISTEMA-QUALIDADE-COMPLETO.txt:361-466»
ND-2016. No Stage 1, parseie o prompt (gênero, key, BPM, mood, duração) e, se houver faixa de referência, calcule FFT, LUFS, LRA, BPM por autocorrelação, key por chroma e stereo width para derivar curvas-alvo. «SISTEMA-QUALIDADE-COMPLETO.txt:370-384»
ND-2017. No Stage 2, para cada camada: consulte o pattern DB, valide teoria (key/scale), humanize, sintetize via Web Audio e valide conteúdo espectral. «SISTEMA-QUALIDADE-COMPLETO.txt:387-396»
ND-2018. No Stage 3A, aplique por track: gain staging -18 dBFS → corrective EQ → compressão → creative EQ → saturação → sends reverb/delay → panning. «SISTEMA-QUALIDADE-COMPLETO.txt:400-410»
ND-2019. No Stage 3B, processe buses: drum bus com compressão paralela e saturação; music bus com widening e reverb; bass bus com compressão e saturação. «SISTEMA-QUALIDADE-COMPLETO.txt:411-415»
ND-2020. No Stage 3C, implemente sidechains declarativos: Kick→Bass, Kick→808 e Snare→Pad com ducking dependente de frequência. «SISTEMA-QUALIDADE-COMPLETO.txt:416-421»
ND-2021. No Stage 4, execute a cadeia master em 9 passos: gain staging, corrective EQ, multiband 4-band, full-band glue, tonal EQ, stereo imaging M/S com mono check, saturação, limiter true-peak lookahead e normalização -14 LUFS. «SISTEMA-QUALIDADE-COMPLETO.txt:425-438»
ND-2022. No Stage 5, valide: LUFS ±1 dB do alvo, true peak ≤ -1 dBTP, LRA no range do gênero, balanço espectral vs referência, correlação estéreo ≥ 0.5, sem clipping e validade harmônica; se falha, ajuste e reprocesse. «SISTEMA-QUALIDADE-COMPLETO.txt:441-453»
ND-2023. No Stage 6, exporte mix 24-bit/48kHz WAV, stems, MIDI de todas as partes, projeto JSON e metadata (BPM, key, genre, LUFS, layers). «SISTEMA-QUALIDADE-COMPLETO.txt:456-463»
ND-2024. Modele GenreReferenceProfile com curva espectral 31-band, energia por 7 bandas (sub 20–80 … air 10k–20k), dinâmica (targetLUFS/LRA/truePeak/compressionStyle/sidechainAmount), estéreo, efeitos e arranjo. «SISTEMA-QUALIDADE-COMPLETO.txt:484-536»
ND-2025. Mantenha perfis de referência pré-computados por gênero (ex.: Trap -14 LUFS sub Very High -13 dB; Ambient -16; Jazz -16; Cinematic LRA 15–20). «SISTEMA-QUALIDADE-COMPLETO.txt:538-554»
ND-2026. Analise referência com STFT 2048/hop 512, mel spectrogram, perfil 31-band, loudness ITU-R BS.1770-4, análise estéreo, BPM e key. «SISTEMA-QUALIDADE-COMPLETO.txt:558-620»
ND-2027. Calcule crest factor como true peak − loudness integrada e dynamic range a partir do short-term LUFS. «SISTEMA-QUALIDADE-COMPLETO.txt:621-637»
ND-2028. Encadeie per-track MixingChain de 8 estágios (inputGain -18 dBFS → corrective EQ → compressor → creative EQ → saturation → sends → pan/width → output/mute/solo). «SISTEMA-QUALIDADE-COMPLETO.txt:649-680»
ND-2029. Use receitas de mix por gênero com EQ/corrente/pan exatos (ex.: 808-sub trap: lowshelf +3 dB @30Hz, corte -4 dB @200Hz, lowpass @800Hz, comp 6:1 attack 1ms; dark pad width 1.5 e reverb send 0.3). «SISTEMA-QUALIDADE-COMPLETO.txt:688-870»
ND-2030. Comprima drums bus em paralelo (threshold -20, ratio 10, mix 20%) e o master com EQ 30Hz HPF, +1 dB @100Hz, +0.5 dB @3kHz, +1 dB @12kHz. «SISTEMA-QUALIDADE-COMPLETO.txt:940-977»
ND-2031. Configure sidechains por gênero com faixa de frequência, threshold, ratio, attack, release e depth (ex.: EDM kick→bass 40–200Hz ratio 8 depth -8 dB). «SISTEMA-QUALIDADE-COMPLETO.txt:999-1043»
ND-2032. Modele MasterChain com multiband 4 bandas [20-120], [120-1k], [1k-6k], [6k-20k], compressor full-band com sidechain HPF 80Hz, stereo imaging com lowFreqWidth mono, limiter ceiling -1 dBTP lookahead 0.001s oversampling 4x e loudness BS.1770-4. «SISTEMA-QUALIDADE-COMPLETO.txt:1061-1116»
ND-2033. Diferencie mastering por gênero: EDM multiband agressiva no sub (ratio 4) e limiter release 0.04; Ambient ratio 2 sem saturação target -16; Jazz ratio 2 target -16. «SISTEMA-QUALIDADE-COMPLETO.txt:1120-1225»
ND-2034. Implemente normalização de loudness: medir LUFS integrada, ganho = target − atual em linear, aplicar e re-limitar a -1 dBTP se o true peak exceder. «SISTEMA-QUALIDADE-COMPLETO.txt:1229-1262»
ND-2035. Meça loudness com K-weighting (2 biquads), média quadrática e fórmula L = -0.691 + 10·log10(meanSquare); meça true peak com oversample 4x. «SISTEMA-QUALIDADE-COMPLETO.txt:1263-1290»
ND-2036. Rode suíte de quality checks com severidade error/warning e auto-fix: sample-rate 48000, bit-depth 24, estéreo, LUFS ±1, true peak ≤ -1, LRA no range, desvio espectral <3 dB, sub-bass ±3 dB, correlação ≥0.5, mono peak ≤0 dBFS, 0 samples clipados, silêncio <2s, key e BPM ±2. «SISTEMA-QUALIDADE-COMPLETO.txt:1345-1560»
ND-2037. Aplique auto-fixes: LUFS→normalize -14; true peak→limiter -1; clipping→limiter -0.3; mono compat→mid-side fix. «SISTEMA-QUALIDADE-COMPLETO.txt:1567-1590»
ND-2038. Emita QualityReport com score 0-100, grade A/B/C/D/F (A ≥90) e genre match 0-1. «SISTEMA-QUALIDADE-COMPLETO.txt:1595-1630»
ND-2039. Compare fingerprints espectrais por gênero em 10 bandas (30Hz…16kHz, dB relativos a 1kHz) para garantir >80% de separação espectral entre gêneros via distância MFCC. «SISTEMA-QUALIDADE-COMPLETO.txt:1660-1687»
ND-2040. Estruture o código de qualidade em src/quality/{references,mixing,mastering,validation,export} + src/layers + src/assembly, com data JSON de perfis, receitas, masters e layers por gênero. «SISTEMA-QUALIDADE-COMPLETO.txt:1800-1868»

### Bloco 2 — MACHINE-TREINAMENTO-COMPLETA.txt (máquina de treinamento 7 camadas)

ND-2041. Estruture a máquina de treinamento em 7 camadas: Input → Decomposition → Analysis → Organization → Pattern Library → AI Training → Inference. «MACHINE-TREINAMENTO-COMPLETA.txt:21-60»
ND-2042. Normalize toda entrada para formato interno WAV 48kHz 16-bit estéreo (Float32Array interleaved) a partir de arquivos, YouTube (yt-dlp), MIDI, texto ou microfone. «MACHINE-TREINAMENTO-COMPLETA.txt:75-160»
ND-2043. Escolha stack de input: music-metadata, decodeAudioData do Web Audio, @tonejs/midi, yt-dlp binário e @ffmpeg/ffmpeg WASM. «MACHINE-TREINAMENTO-COMPLETA.txt:110-125»
ND-2044. Decomponha áudio em stems (Demucs), onsets (spectral flux), notas (Pitchfinder YIN), beats (autocorrelação), fonemas (Whisper) e acordes (chroma + template matching). «MACHINE-TREINAMENTO-COMPLETA.txt:170-210»
ND-2045. Use separação de stems em duas tiers: Tier 1 DSP HPSS/Mid-Side (0 dependências, cross-correlação entre stems <0.25) e Tier 2 ML demucs-web HTDemucs ONNX ~172MB; modo auto tenta ML e cai para DSP. «MACHINE-TREINAMENTO-COMPLETA.txt:222-280»
ND-2046. Detecte onsets por spectral flux + threshold adaptativo (mediana) e peak-picking com distância mínima de 30ms. «MACHINE-TREINAMENTO-COMPLETA.txt:285-300»
ND-2047. Extraia matriz de features: espectrais (centroid/bandwidth/rolloff/flatness/contrast/MFCC13), temporais (RMS/ZCR/envelope), harmônicos (F0/chroma/key), rítmicos (BPM/meter/groove/swing), timbrais, loudness EBU R128 e estruturais (self-similarity). «MACHINE-TREINAMENTO-COMPLETA.txt:320-360»
ND-2048. Compute STFT 4096/hop 1024, mel 128 bandas e MFCC 13 como base do FeatureSet JSON-serializável. «MACHINE-TREINAMENTO-COMPLETA.txt:365-420»
ND-2049. Persista tudo em SQLite (better-sqlite3): tabelas audio_files, stems, notes, beats, chords, feature_sets, tags e patterns com índices por entidade/categoria/pitch. «MACHINE-TREINAMENTO-COMPLETA.txt:480-580»
ND-2050. Guarde features como .npy binário comprimido com LZ4 e metadados JSON em colunas SQLite; organização de arquivos por UUID. «MACHINE-TREINAMENTO-COMPLETA.txt:582-600»
ND-2051. Taggeie automaticamente por gênero, mood, instrumento, faixa de tempo (slow 60-90/mid/fast), era, qualidade e técnica (arpeggio, strum, pad, pluck, sweep). «MACHINE-TREINAMENTO-COMPLETA.txt:605-620»
ND-2052. Construa Pattern Library com 5 tipos: beat patterns (grid 16th + swing + humanize), chord patterns, melody patterns, effect patterns e structure patterns (templates de arranjo com energia por seção). «MACHINE-TREINAMENTO-COMPLETA.txt:640-700»
ND-2053. Ordene patterns por occurrence_count e busque similares por cosine similarity de vetores de features. «MACHINE-TREINAMENTO-COMPLETA.txt:760-790»
ND-2054. Treine com tokenização musical de vocabulário ~2000 tokens: P0-P127 × V1-V8 × D1-D32, chord root+quality, drum hit+pattern, control tokens (BPM_CHANGE, KEY_CHANGE, SECTION_START…) e especiais (BOS/EOS/PAD/MASK). «MACHINE-TREINAMENTO-COMPLETA.txt:810-870»
ND-2055. Aumente dados com pitch shift ±2 semitons, time stretch ±10%, variação de velocity ±10%, dropout de notas 10% e groove variation. «MACHINE-TREINAMENTO-COMPLETA.txt:872-890»
ND-2056. Selecione arquitetura por tarefa: MelodyGenerator GPT-2 ~50MB, DrumGenerator LSTM ~10MB, ChordProgression Transformer ~20MB, TimbreSynthesizer DDSP VAE ~30MB, Vocoder HiFi-GAN ~30MB, StemSeparator HTDemucs ~172MB, Genre/Mood Classifier CNN ~5MB. «MACHINE-TREINAMENTO-COMPLETA.txt:895-915»
ND-2057. Treine em Python/PyTorch (GPU) e exporte para ONNX INT8 quantizado; inferência no browser com onnxruntime-web (WASM + WebGPU). «MACHINE-TREINAMENTO-COMPLETA.txt:920-1010»
ND-2058. Considere fine-tune do MusicGen Small (300M) como alternativa ao treino do zero; opção híbrida teoria determinística + ML para variação. «MACHINE-TREINAMENTO-COMPLETA.txt:940-960»
ND-2059. Valide modelos com perplexidade, note accuracy (pitch/rhythm), validade de progressão, geração de 100 amostras por gênero e compliance de regras de teoria. «MACHINE-TREINAMENTO-COMPLETA.txt:990-1005»
ND-2060. Rode inferência em 6 modos: Full AI, Pattern+Variation, Theory+AI, MIDI+AI, Audio+AI e Manual determinístico. «MACHINE-TREINAMENTO-COMPLETA.txt:1160-1175»
ND-2061. Gere faixas híbridas: teoria para progressão determinística, pattern library ou variação IA (30%) para drums, IA para melodia, síntese Tone.js/HiFi-GAN/RAVE e pós-processamento com mix -14 LUFS/-1 dBTP. «MACHINE-TREINAMENTO-COMPLETA.txt:1190-1250»
ND-2062. Atribua ambientes: Node/browser para análise, patterns e inferência; Python apenas para treino, pré-processamento pesado e export ONNX; binários externos só yt-dlp/ffmpeg/sox. «MACHINE-TREINAMENTO-COMPLETA.txt:1280-1340»
ND-2063. Declare inviabilidades do browser: treinar modelos grandes, difusão latente em tempo real, text-to-music do zero e processamento de horas de áudio. «MACHINE-TREINAMENTO-COMPLETA.txt:1360-1380»
ND-2064. Justifique o híbrido: teoria dá saída determinística, <10ms, compliance e MIDI editável; IA dá variação, timbre realista e text-to-music. «MACHINE-TREINAMENTO-COMPLETA.txt:1395-1410»
ND-2065. Prefira ONNX a TensorFlow.js: agnóstico de framework, melhor zoo de modelos de áudio, WebGPU, runtime menor, 2.2M downloads/semana. «MACHINE-TREINAMENTO-COMPLETA.txt:1412-1422»
ND-2066. Prefira SQLite a DB em nuvem: zero config, arquivo único, portável, offline. «MACHINE-TREINAMENTO-COMPLETA.txt:1424-1432»
ND-2067. Alimente a IA com dados "mastigado" (features pré-extraídas, organizadas e rotuladas), nunca WAV cru (1MB/segundo). «MACHINE-TREINAMENTO-COMPLETA.txt:1434-1448»
ND-2068. Cumpra metas de performance: import <5s por música de 3min, separação DSP cross-corr <0.25, separação ML SDR >5dB, features <10s, patterns <30s, query <100ms, inferência <30s, MOS >3.5, teoria >95%, gênero >80%. «MACHINE-TREINAMENTO-COMPLETA.txt:1462-1478»
ND-2069. Implemente o plano de 7 fases (20 semanas): fundação, análise/patterns, organização, ML stems, treino, inferência e integração end-to-end <30s. «MACHINE-TREINAMENTO-COMPLETA.txt:1385-1460»
ND-2070. Trate o moat como pipeline completo offline TypeScript-native de análise a geração com MIDI editável e compliance determinística — nenhum concorrente o tem. «MACHINE-TREINAMENTO-COMPLETA.txt:1480-1495»

### Bloco 3 — PIPELINE-TREINAMENTO.txt (coleta, decomposição, treino, inferência)

ND-2071. Colete datasets prioritários: Lakh MIDI (176.581 MIDIs, CC-BY), Aria-MIDI (1.186.253 piano), MAESTRO v3 (1.276 pares MIDI+WAV), MusicCaps (5.521 legendas), Lo-Fi Drums (10.000 loops), NSynth, FMA e MUSDB18-HQ. «PIPELINE-TREINAMENTO.txt:88-108»
ND-2072. Padronize áudio coletado para WAV estéreo 44.1kHz (ou 48kHz), 16/32-bit, com checksums validados e estrutura data/{raw,processed,metadata,training}. «PIPELINE-TREINAMENTO.txt:110-160»
ND-2073. Rode HT-Demucs FT para 4 stems (SDR 9.19 dB vocals, ONNX ~166MB fp16) e, no browser, faça chunks de 7.8s (343.980 samples) com overlap 0.25. «PIPELINE-TREINAMENTO.txt:172-230»
ND-2074. Segmente treino por estratégia: fixed-length 1–10s, onset-based, beat-aligned 1–8 bars (recomendado) e phrase-based 4–16 bars. «PIPELINE-TREINAMENTO.txt:235-245»
ND-2075. Extraia mel spectrogram padrão (n_fft 2048, hop 512, 80–128 bands mel, 20–8000Hz, log + normalização [-1,1]) e MFCC 13 + deltas para timbre. «PIPELINE-TREINAMENTO.txt:255-300»
ND-2076. Compute embeddings de áudio com CLAP ou MERT (mean pooling → 768-dim) para alinhamento texto-áudio. «PIPELINE-TREINAMENTO.txt:320-340»
ND-2077. Modele AudioSample com metadados musicais completos (genre/key/scale/bpm/meter/instruments/stems/features/quality/source/tags/mood) e TrainingPair input→output. «PIPELINE-TREINAMENTO.txt:370-430»
ND-2078. Organize treino em data/training/{midi-to-audio,text-to-music,audio-to-audio,loop-generation} com splits train/val/test 80/10/10. «PIPELINE-TREINAMENTO.txt:540-580»
ND-2079. Tokenize MIDI em eventos: note_on/note_off (0-255), time_shift 10ms (256-511), velocity 128 níveis (512-639) e especiais pad/bos/eos/bar/beat. «PIPELINE-TREINAMENTO.txt:640-680»
ND-2080. Combine arquiteturas: RAVE VAE para timbre (30–50MB, latente 128), DDSP para síntese por nota (F0+loudness→áudio), HiFi-GAN para vocoding, Transformer GPT-style para beats, MusicGen AR para text-to-music (server-only). «PIPELINE-TREINAMENTO.txt:700-920»
ND-2081. Dimensione hardware de treino: RAVE 8GB+ VRAM 12–48h; DDSP 6–24h; HiFi-GAN 12–36h; Transformer dias-semanas; MusicGen 40GB+ VRAM semanas-meses. «PIPELINE-TREINAMENTO.txt:935-945»
ND-2082. Treine com config padrão: segment 65536 samples (~1.5s), batch 16, epochs 300, lr 1e-4 AdamW, scheduler cosine warmup 10, mixed precision. «PIPELINE-TREINAMENTO.txt:950-985»
ND-2083. Aplique augmentação: time stretch 0.9–1.1, pitch ±2 st, crop aleatório, gain ±3 dB, noise SNR>30dB, time/frequency masking, mixup α=0.2 e SpecAugment. «PIPELINE-TREINAMENTO.txt:990-1040»
ND-2084. Avalie com FAD (menor melhor), KLD, IS, PESQ, STOI, mel cepstral distortion e multi-res STFT loss. «PIPELINE-TREINAMENTO.txt:1045-1070»
ND-2085. Exporte para ONNX com opset 17 e dynamic axes de tempo; quantize FP32→INT8 (4x menor). «PIPELINE-TREINAMENTO.txt:1161-1230»
ND-2086. Carregue modelos no browser com onnxruntime-web (executionProviders webgpu→wasm, graphOptimizationLevel all) e cacheie em IndexedDB com download progressivo. «PIPELINE-TREINAMENTO.txt:1240-1400»
ND-2087. Para o MVP pule text-to-music completo (MusicGen pesado, use API) e GAN training; foque em RAVE + DDSP + HiFi-GAN + Demucs ONNX. «PIPELINE-TREINAMENTO.txt:1660-1680»
ND-2088. Use arquitetura híbrida: servidor Python (coleta, features, treino, export, avaliação) + cliente JS (inferência, síntese, playback, export) + API bridge opcional (HuggingFace/Replicate). «PIPELINE-TREINAMENTO.txt:1700-1740»

### Bloco 4 — ORGANIZACAO-SAMPLES.txt (biblioteca de samples, metadados, SQLite+FAISS)

ND-2089. Dê a cada sample UUID v4 + hash perceptual (SHA-256 do espectrograma) para deduplicação, com versão de schema. «ORGANIZACAO-SAMPLES.txt:14-30»
ND-2090. Modele SampleMetadata completo: identificação, classificação (confidence/method/modelVersion), musical (key/scale/bpm/harmonics), espectral (centroid/rolloff85/95/bandwidth/flatness/contrast/flux/entropy), temporal (onsets/ADSRe/RMS/ZCR), timbral (MFCC+delta+chroma+tonnetz), padrão rítmico, origem, tags, treino (usageCount/qualityScore), embedding 128–512 dims. «ORGANIZACAO-SAMPLES.txt:32-130»
ND-2091. Classifique samples em 10 tipos (drum, bass, vocal, melody, chord, effect, pad, atmosphere, foley, loop) com subtipos por categoria (ex.: drum: kick/snare/hihat/clap/tom/cymbal/percussion/shaker/rim/cowbell). «ORGANIZACAO-SAMPLES.txt:135-175»
ND-2092. Use companion JSON 1:1 por sample (não um JSON grande por pasta) para updates incrementais, processamento paralelo e versionamento git. «ORGANIZACAO-SAMPLES.txt:180-205»
ND-2093. Estruture biblioteca samples/{type}/{subtype}/{samples,spectrograms,embeddings,metadata} + processed/ + stems/ + training/manifests JSONL + db/{samples.db, embeddings.faiss} + tools/. «ORGANIZACAO-SAMPLES.txt:210-300»
ND-2094. Nomeie arquivos como {type}_{subtype}_{character}_{key}_{bpm}_{source}_{id}.wav com prefixos de 3 chars (drm/bas/vcl/mel/chd/fx/atm/fly/lop) e ID hex anti-colisão. «ORGANIZACAO-SAMPLES.txt:305-330»
ND-2095. Organize loops por faixa de BPM (80-100/100-120/120-140/140-160/160-180). «ORGANIZACAO-SAMPLES.txt:335-350»
ND-2096. Rode pipeline de extração: pré-processamento (resample 22050, mono, normalize, trim -30dB) → features librosa → classificação ML + key + BPM → embedding VGGish/CLAP → armazenamento (companion JSON, SQLite, FAISS). «ORGANIZACAO-SAMPLES.txt:360-400»
ND-2097. Extraia features espectrais completas: centroid, rolloff 85% e 95%, bandwidth, flatness (0=tônico, 1=ruído), contrast 7 bandas, flux e entropia. «ORGANIZACAO-SAMPLES.txt:405-440»
ND-2098. Extraia features temporais: onsets com backtrack, força de onset, density (onsets/segundo), tempo, RMS mean/max/std, ZCR e estimativas de attack/decay/sustain/release. «ORGANIZACAO-SAMPLES.txt:445-480»
ND-2099. Classifique automaticamente via vetor concatenado de MFCC+centroid+rolloff85+flatness+RMS+onsetDensity; derive key por chroma para amostras tonais e BPM para rítmicas. «ORGANIZACAO-SAMPLES.txt:520-580»
ND-2100. Gere embeddings com CLAP music/speech 512 dims para busca por similaridade. «ORGANIZACAO-SAMPLES.txt:600-625»
ND-2101. Use SQLite + FAISS: SQLite para metadata/FTS5/triggers, FAISS IndexFlatIP com normalize_L2 para cosine similarity em milhões de vetores. «ORGANIZACAO-SAMPLES.txt:760-830»
ND-2102. Crie schema samples com índices por type, type+subtype, type+key, type+bpm, key, scale, bpm, annotation_status, quality e tags; tabelas sample_tags many-to-many, stems, training_sessions, training_usage e similarity_cache. «ORGANIZACAO-SAMPLES.txt:840-1000»
ND-2103. Mantenha FTS5 sincronizado com triggers AFTER INSERT/DELETE/UPDATE sobre samples. «ORGANIZACAO-SAMPLES.txt:1005-1055»
ND-2104. Implemente queries canônicas: "pop drums punchy", "warm pad in C major" (ORDER BY flatness ASC), similar por FAISS e composição de kits trap por BPM/gênero com CROSS JOIN. «ORGANIZACAO-SAMPLES.txt:1180-1260»
ND-2105. Exponha API de consulta para IA: query_for_generation com filtros type/genre/mood/bpm±range/key/character e ORDER BY quality DESC, usage ASC. «ORGANIZACAO-SAMPLES.txt:1265-1330»
ND-2106. Gere batches de treino balanceados por tipo (annotation_status='verified', ORDER BY usage_count ASC) e manifests JSONL train/valid/test 90/5/5. «ORGANIZACAO-SAMPLES.txt:1350-1420»
ND-2107. Ingestione com validação → dedup por perceptual hash → extração → ID UUID → rename com convenção → SQLite + FAISS → organização em diretório. «ORGANIZACAO-SAMPLES.txt:1460-1520»
ND-2108. Compute hash perceptual simplificado (primeiro MB + tamanho + sample rate; produção: chromaprint) e verifique duplicatas antes de ingerir. «ORGANIZACAO-SAMPLES.txt:1590-1615»
ND-2109. Rode manutenção: find_duplicates (hash exato + similaridade FAISS >0.95), cleanup de órfãos wav/json e update de usage_count via logs de treino. «ORGANIZACAO-SAMPLES.txt:1690-1794»
ND-2110. Compute estatísticas da biblioteca: total, por tipo, por gênero, cobertura (com key/bpm/embedding/annotated) e qualidade média. «ORGANIZACAO-SAMPLES.txt:1620-1685»
ND-2111. Injete fontes: Splice/Loopcloud, packs, stem separation demucs/spleeter, gravações próprias e datasets domain-specific. «ORGANIZACAO-SAMPLES.txt:1440-1460»
ND-2112. Referencie Splice (organização genre/BPM/key/instrument), audiofeat (140+ features PyTorch), mirdata e FAISS como padrões da biblioteca. «ORGANIZACAO-SAMPLES.txt:1780-1794»

### Bloco 5 — ARQUITETURA-OFFLINE-COMPLETA.txt (pacote npm offline <50MB)

ND-2113. Posicione Debonair como pacote npm de geração musical 100% offline <50MB combinando theory engine determinística + pattern DB + modelos ONNX pequenos + síntese Tone.js. «ARQUITETURA-OFFLINE-COMPLETA.txt:1-40»
ND-2114. Acredite no core insight: não precisa de modelo 10GB — precisa de assembly engine inteligente + teoria + modelos pequenos + síntese real. «ARQUITETURA-OFFLINE-COMPLETA.txt:10-16»
ND-2115. Separe 3 fases: desenvolvimento (aquisição 10.000+ patterns de MAESTRO/Lakh/Freesound, decomposição, categorização, treino, compressão), instalação (npm install) e runtime (prompt→assembly→síntese→áudio). «ARQUITETURA-OFFLINE-COMPLETA.txt:55-260»
ND-2116. Respeite orçamento de tamanho: core TS ~500KB, patterns.cbor ~5MB (CBOR+LZ4), modelos ONNX INT8 ~20MB, SoundFont+one-shots ~10MB, regras ~1MB → total ~33MB (alvo <50MB). «ARQUITETURA-OFFLINE-COMPLETA.txt:268-290»
ND-2117. Compare-se por tamanho/latência: Debonair ~37MB vs MusicGen 6GB; <3s vs 10-60s na nuvem; <512MB RAM sem GPU. «ARQUITETURA-OFFLINE-COMPLETA.txt:292-330»
ND-2118. Catalogue patterns em 6 tipos: drum (grid 16th por instrumento + swing/humanize), chord (progression+voicing+voice leading), melody (notas+contour+motif), bass, arrangement (seções/energia/transições) e fx (riser/impact/sweep). «ARQUITETURA-OFFLINE-COMPLETA.txt:340-430»
ND-2119. Pré-compute matriz de compatibilidade (drum↔chord, chord↔melody, bass↔chord, section↔section) com cosine similarity + validação de teoria + human ratings, armazenando apenas scores >0.5 (sparse). «ARQUITETURA-OFFLINE-COMPLETA.txt:435-470»
ND-2120. Implemente o assembly engine como constraint satisfaction solver com guidance neural: hard constraints (key, scale, BPM, gênero, compassos) e soft constraints (mood, complexidade, qualidade, variedade, transições). «ARQUITETURA-OFFLINE-COMPLETA.txt:480-520»
ND-2121. Selecione patterns por seção: query DB com hard constraints → rank por soft scores → modelo neural pontua top candidatos → valida com teoria → fallback a defaults seguros. «ARQUITETURA-OFFLINE-COMPLETA.txt:522-540»
ND-2122. Gere transições entre seções: drum fill nas últimas 1–2 bars, riser/downlifter, chord anticipation e ramp de energia. «ARQUITETURA-OFFLINE-COMPLETA.txt:545-560»
ND-2123. Humanize todo MIDI com o modelo: timing ±5–15ms por nota, velocity ±5–15, groove templates, dinâmica por frase e variações de duração. «ARQUITETURA-OFFLINE-COMPLETA.txt:565-580»
ND-2124. Use a teoria existente (theory/harmony/melody/rhythm) como camada de validação: notas na escala, transições de acordes válidas, bass em chord tones. «ARQUITETURA-OFFLINE-COMPLETA.txt:590-620»
ND-2125. Sintetize por instrumento com método híbrido: kick/snare/808 física (sine sweep+noise), hihat noise filtrado, piano FM, guitar/bass Karplus-Strong, lead subtrativo, pad wavetable+granular, strings aditiva, FX sweeps. «ARQUITETURA-OFFLINE-COMPLETA.txt:630-680»
ND-2126. Implemente Karplus-Strong nativo: excitação de noise burst, delay line = sampleRate/freq, filtro média e loop gain 0.996. «ARQUITETURA-OFFLINE-COMPLETA.txt:690-720»
ND-2127. Encadeie efeitos por track (EQ 3-band → compressor → reverb → delay → pan) e buses (drums paralela, music widening, master limiter -0.3dB ratio 20 + loudness). «ARQUITETURA-OFFLINE-COMPLETA.txt:760-820»
ND-2128. Garanta fallback chain de 4 níveis que nunca deixa cair qualidade: neural → assembly rule-based → theory defaults → patterns hardcoded por gênero. «ARQUITETURA-OFFLINE-COMPLETA.txt:830-850»
ND-2129. Valide a música inteira por seções (harmônica/melódica/rítmica/mix) e transições, com score 1 − 0.05×issues e fixes automáticos. «ARQUITETURA-OFFLINE-COMPLETA.txt:855-900»
ND-2130. Siga o roadmap de 20 semanas em 5 fases: pattern DB (1-4), assembly engine (5-8), modelos neurais (9-12), síntese/efeitos (13-16), packaging npm (17-20). «ARQUITETURA-OFFLINE-COMPLETA.txt:910-960»
ND-2131. Diferencie-se de cloud AI (Suno/Udio): sem internet, $0 por música, <3s, editável por parte; de modelos locais (MusicGen): 37MB vs 2–15GB, 10–100x realtime, MIDI editável; de DAWs: minutes vs weeks de curva, um prompt gera música completa. «ARQUITETURA-OFFLINE-COMPLETA.txt:970-1040»
ND-2132. Declare dependências runtime mínimas: tone ^15.1.22, onnxruntime-web ^1.26.0, cbor ^9, lz4 (total ~2MB). «ARQUITETURA-OFFLINE-COMPLETA.txt:1050-1075»
ND-2133. Exponha API simples (Debonair.generate({prompt})→track.play()/export), API completa (createProject com chords/melody/drums/instruments) e API híbrida (inspecionar plan, override, regenerateMelody). «ARQUITETURA-OFFLINE-COMPLETA.txt:1080-1150»
ND-2134. Organize src/ em assembly/ (engine, solver, query, scoring, transitions, humanizer), patterns/ (database, compatibility, loader), synthesis/ (8 instrumentos + effects + mastering + soundfont), models/ (4 wrappers ONNX) e export/ (wav, midi, stems, project). «ARQUITETURA-OFFLINE-COMPLETA.txt:1160-1220»
ND-2135. Fixe a matriz de 15 gêneros com BPM/default key/progressões/drum style/complexidade (Trap 130-170 C minor i-VI-III-VII; Jazz 100-180 Bb ii-V-I-vi swing 4-5; Drill 140-170 G minor 4-5…). «ARQUITETURA-OFFLINE-COMPLETA.txt:1230-1260»

### Bloco 6 — INFRAESTRUTURA-AUDIO-AI.txt (infra de síntese AI, Web Audio, performance)

ND-2136. Estruture o pipeline completo de síntese AI: input (prompt/MIDI/referência/controle) → features (FFT/STFT/mel/MFCC/chroma/pitch/onset/LUFS/embeddings CLAP/MERT) → geração (autoregressive, diffusion, DDSP, VAE/GAN) → vocoder (HiFi-GAN/BigVGAN/WaveRNN/Vocos/Griffin-Lim) → DSP/efeitos → output (AudioContext/Worklet, WAV/MP3/FLAC, streaming). «INFRAESTRUTURA-AUDIO-AI.txt:20-93»
ND-2137. Use PolyBLEP para anti-aliasing de saw/square e wavetable onde band-limited. «INFRAESTRUTURA-AUDIO-AI.txt:99-108»
ND-2138. Prefira FFT sizes 2048–8192; lembre que distinção de semitons exige fftSize ≥8192 (21.5 Hz/bin em 2048). «INFRAESTRUTURA-AUDIO-AI.txt:110-130»
ND-2139. Implemente reverb Dattorro em AudioWorklet (4 comb 1277–1523 samples + 2 allpass 277/349) ou use ConvolverNode nativo para IRs até 30s. «INFRAESTRUTURA-AUDIO-AI.txt:186-193»
ND-2140. Modele compressores: VCA feed-forward, FET soft-knee com sigmoid, óptico com release dependente de programa; multiband com crossover Linkwitz-Riley 4ª ordem -24dB/oct. «EFFECTS-MIXING-MASTERING.txt:15-30»
ND-2141. Rode vocoders via ONNX: HiFi-GAN (mel 80 bins→waveform, ~80x realtime GPU), BigVGAN (ativ Snake), Vocos iSTFT 200x+; Griffin-Lim apenas como fallback de baixa qualidade. «INFRAESTRUTURA-AUDIO-AI.txt:198-241»
ND-2142. Trate Stable Audio/AudioLDM como server-side only (difusão latente não roda no browser). «INFRAESTRUTURA-AUDIO-AI.txt:243-260»
ND-2143. Aproveite @magenta/music para MusicVAE/GANSynth/DDSP/SPICE apesar do código de 2021 envelhecido. «INFRAESTRUTURA-AUDIO-AI.txt:269-300; LIBRARIAS-TS-AUDIO.txt:80-120»
ND-2144. Conclua que mastering browser é viável: Aurialis e RACK4MASTER provam chains profissionais (EQ, comp, limiter, saturation, imaging) com Web Audio + AudioWorklet. «INFRAESTRUTURA-AUDIO-AI.txt:299-312»
ND-2145. Prefira AudioWorklet a ScriptProcessor (thread de áudio dedicada, blocos de 128 samples ≈2.9ms), SharedArrayBuffer para parâmetros/metering zero-copy e WASM dentro do worklet para DSP intensivo. «INFRAESTRUTURA-AUDIO-AI.txt:498-524»
ND-2146. Carregue modelos com cache-first (Service Worker/IndexedDB) → download progressivo → init runtime → warm-up de kernels GPU → pronto para inferência. «INFRAESTRUTURA-AUDIO-AI.txt:525-550»
ND-2147. Respeite o orçamento de performance: AudioWorklet <5ms/<50MB; Tone.js scheduling <1ms; MusicVAE <100ms; HiFi-GAN ONNX <20ms; análise meljs <5ms; Demucs 5-30s offline. «INFRAESTRUTURA-AUDIO-AI.txt:597-607»
ND-2148. Mitigue gargalos: ring buffers SAB para latência, lazy loading + cache para cold start, streaming compilation para WASM, zero alocações em process() para evitar GC glitches, fallback WASM quando WebGPU ausente, user gesture para AudioContext no Safari. «INFRAESTRUTURA-AUDIO-AI.txt:637-648»
ND-2149. Use PolyBLEP/PolyBLAMP/wavetable/VDSF conforme custo; naive apenas quando aliasing é aceitável. «INFRAESTRUTURA-AUDIO-AI.txt:649-660»
ND-2150. Mapeie o stack TS recomendado: tone, standardized-audio-context, @libraz/libsonare, meljs, @magenta/music, onnxruntime-web, kokoro-js, demucs-web + processors WASM custom. «INFRAESTRUTURA-AUDIO-AI.txt:568-595»
ND-2151. Documente suporte browser: AudioWorklet Chrome 66+/Safari 14.1+, WebGPU Chrome 113+/Safari 26+, WebCodecs Chrome 94+, SAB exige COOP/COEP. «INFRAESTRUTURA-AUDIO-AI.txt:351-361»
ND-2152. Declare os 6 gaps do JS: text-to-music grande, neural FX realtime, physical modeling, granular maduro, AI mixing multitrack server-side e source separation pesada (~172MB). «INFRAESTRUTURA-AUDIO-AI.txt:419-427»
ND-2153. Lazy-load modelos por tamanho (MusicVAE 15MB→SPICE 5MB primeiro; Demucs 172MB e Kokoro 86MB depois) com tempos de download 3G estimados. «INFRAESTRUTURA-AUDIO-AI.txt:608-621»

### Bloco 7 — EXTRACAO-REFERENCIAS-REAIS.txt (extração de padrões de música real, variações)

ND-2154. Extraia referências em 6 etapas: pré-processamento (normalize, mono, resample 22050/44100) → Demucs v4 stems → features por stem → análise musical (BPM/meter/key/seções/energia) → armazenamento JSON+MIDI+vetores → variação (Markov/genética/interpolação/constraints). «EXTRACAO-REFERENCIAS-REAIS.txt:20-70»
ND-2155. Aplique MIR: MFCC para timbre, chroma para harmônicos, RMS para energia, centroid para brilho, onset para padrões, F0 para melodia, flatness para percussivo vs tonal, ZCR para percussão. «EXTRACAO-REFERENCIAS-REAIS.txt:90-110»
ND-2156. Use STFT 2048/hop 512/janela Hann e CQT (bins logarítmicos por oitava) para análise tonal. «EXTRACAO-REFERENCIAS-REAIS.txt:112-135»
ND-2157. Extraia por stem: bateria → padrão quantizado 16th com velocity, swing e fills; baixo → notas+timing+articulação+locking com kick; vocal → F0 contour, frases, vibrato; harmônico → acordes por beat/bar com voicing; mix → estrutura, energia, LUFS, stereo width. «EXTRACAO-REFERENCIAS-REAIS.txt:150-230»
ND-2158. Use Essentia para KeyExtractor (key+scale+strength), ChordsDetectionBeats, PredominantPitchMelodia, BeatTrackerDegara e LoudnessEBUR128. «EXTRACAO-REFERENCIAS-REAIS.txt:280-330»
ND-2159. Classifique hits de bateria por energia em bandas do STFT: low>mid e low>high = kick; mid>high = snare; senão hihat; quantize ao grid de 16th pelo BPM. «EXTRACAO-REFERENCIAS-REAIS.txt:390-440»
ND-2160. Armazene cada referência num schema único: metadata, structure com seções e arrangement_density, chord_progression (roman numerals + voicings MIDI), drum_pattern (hits+fills+groove com offsets ms), bass_pattern, melody_contour (phrases+motifs+scale usage), energy_curve por compasso, mixing_profile e features_vector. «EXTRACAO-REFERENCIAS-REAIS.txt:600-720»
ND-2161. Persista referências em references/{index.json, songs/ref_XXX/{metadata,stems,midi,features}, genre_templates, patterns}. «EXTRACAO-REFERENCIAS-REAIS.txt:730-760»
ND-2162. Crie variações, nunca cópias: Markov chains (ordem 1+) sobre progressões, algoritmos genéticos (mutação de tipo/timing/velocity + crossover), interpolação α entre referências e constraint-based repair. «EXTRACAO-REFERENCIAS-REAIS.txt:770-1000»
ND-2163. Aplique constraints musicais fixos: max 4 repetições consecutivas, resolução de dominante obrigatória, evitar quintas paralelas, saltos melódicos ≤12 semitons, preferir movimento por graus conjuntos. «EXTRACAO-REFERENCIAS-REAIS.txt:880-920»
ND-2164. Faça style transfer: copie groove (swing + template), energia e mixing profile do estilo; interpole timbre via MFCC. «EXTRACAO-REFERENCIAS-REAIS.txt:930-960»
ND-2165. Aprenda gêneros por estatística das referências: média/std/min/max de BPM, progressões comuns, estrutura típica, curvas médias de energia e convenções de mix. «EXTRACAO-REFERENCIAS-REAIS.txt:975-1010»
ND-2166. Gere genre templates JSON (ex.: trap: BPM 130–160, keys Cm/Fm/Gm/Am, progressões i-VI-III-VII etc., hihat 16th rapid, snare em 2 e 4, swing 0.15, 808 glide+distortion, target -14 LUFS). «EXTRACAO-REFERENCIAS-REAIS.txt:1020-1060»
ND-2167. Treine a IA com 100+ referências → features → normalização → vetores → autoencoder/Transformer/VAE → geração por interpolação no espaço latente. «EXTRACAO-REFERENCIAS-REAIS.txt:1070-1100»
ND-2168. Recomende referências por score ponderado: BPM (0.3), key igual (0.3), gênero (0.2), overlap de mood (0.2). «EXTRACAO-REFERENCIAS-REAIS.txt:1110-1140»
ND-2169. Implemente o pipeline TypeScript extractReference() com separação Demucs WASM e extração paralela por stem via Promise.all. «EXTRACAO-REFERENCIAS-REAIS.txt:1190-1240»
ND-2170. Distinga copiar vs variar: cópia usa o padrão exato; variação usa a estrutura estatística (distribuições, probabilidades, templates) para gerar algo novo mas coerente. «EXTRACAO-REFERENCIAS-REAIS.txt:1480-1495»
ND-2171. Respeite os papers fundacionais: Salamon & Gómez (melodia), Cho & Bello (acordes), Défossez (Demucs), McFee (librosa), Huang (Music Transformer), Dhariwal (Jukebox). «EXTRACAO-REFERENCIAS-REAIS.txt:1400-1460»

### Bloco 8 — CONCORRENCES-AUDIO-AI-10.txt (análise de 10 concorrentes)

ND-2172. Estude dois paradigmas: autoregressive LM sobre tokens discretos (Suno, Udio, MusicGen, MusicLM) vs latent diffusion (Stable Audio, RAVE); híbrido VAE+Transformer (MusicLM, ElevenLabs); modular rules+ML (Soundraw, Magenta). «CONCORRENCES-AUDIO-AI-10.txt:30-60»
ND-2173. Entenda que EnCodec (RVQ 8 codebooks, ~1.5KB/s) é o tokenizer padrão que transforma áudio em "linguagem". «CONCORRENCES-AUDIO-AI-10.txt:120-140»
ND-2174. Aprenda da Suno: end-to-end com vocais é rei, versionamento rápido (v3→v5.5), Studio como DAW e export de stems conecta ao fluxo pro. «CONCORRENCES-AUDIO-AI-10.txt:150-240»
ND-2175. Aprenda da Udio: fidelidade de áudio e complexidade musical diferenciam; time técnico de elite (DeepMind) importa. «CONCORRENCES-AUDIO-AI-10.txt:250-330»
ND-2176. Aprenda do Stable Audio: pesos abertos constroem ecossistema, dados licenciados com indemnificação é crítico para enterprise, família de modelos (Large/Medium/Small) atende mobile. «CONCORRENCES-AUDIO-AI-10.txt:340-430»
ND-2177. Aprenda do MusicGen: código de treino aberto é raro, codebook interleaving acelera o campo, AudioSeal resolve watermarking responsável. «CONCORRENCES-AUDIO-AI-10.txt:440-530»
ND-2178. Aprenda do MusicLM: geração hierárquica two-stage melhora coerência longa, datasets benchmark (MusicCaps) movem o campo, conditioning por melodia assobiada abre criatividade. «CONCORRENCES-AUDIO-AI-10.txt:540-620»
ND-2179. Aprenda do Magenta: ferramentas criativas interpretáveis (DDSP controlável) e espaços latentes interpoláveis (MusicVAE) valem para músicos; MIDI como representação intermediária ainda útil. «CONCORRENCES-AUDIO-AI-10.txt:630-700»
ND-2180. Aprenda do RAVE: realtime <10ms para performance ao vivo, self-supervised com 1–10h de áudio por instrumento, espaço latente disentangled para manipulação criativa; VAE não está morto. «CONCORRENCES-AUDIO-AI-10.txt:710-810»
ND-2181. Aprenda da ElevenLabs: qualidade de voz é o moat, plataforma TTS+Music+SFX+STT cria ecossistema, latência 75ms habilita conversacional; voice cloning é poderoso e arriscado. «CONCORRENCES-AUDIO-AI-10.txt:820-920»
ND-2182. Aprenda do Soundraw: 100% dados in-house = zero risco legal como produto, edição por compasso retém usuários, inferência sample-based 5–15s é 5–10x mais rápida que neural. «CONCORRENCES-AUDIO-AI-10.txt:930-1000»
ND-2183. Aprenda do Boomy: simplicidade vence no mass market, distribuição ("create and release") é o produto real, freemium adquire usuários. «CONCORRENCES-AUDIO-AI-10.txt:1010-1060»
ND-2184. Escolha arquitetura por caso de uso: música completa = AR LM; SFX = diffusion; realtime = VAE; voice cloning = Transformer custom; produção em massa = template+ML. «CONCORRENCES-AUDIO-AI-10.txt:1080-1100»
ND-2185. Siga as 10 lições estratégicas: dados licenciados são o problema central; end-to-end é o futuro; vocal é o diferenciador supremo; latência habilita produtos; open source cria ecossistemas; híbrido vence em controle; distribuição faz parte; iterar rápido vence perfeição. «CONCORRENCES-AUDIO-AI-10.txt:1105-1180»
ND-2186. Recomendação para Debonair: começar sample-based (fase 1), AR LM para músicas completas (fase 2), diffusion para realtime (fase 3); dados in-house + licenciados + sintéticos + consentidos de usuários. «CONCORRENCES-AUDIO-AI-10.txt:1200-1250»
ND-2187. Priorize features de MVP: text-to-music instrumental, seleção de gênero, duração, edição básica (loop/extend), export WAV+stems; fase 2: vocais, melody conditioning, edição por compasso, integração DAW. «CONCORRENCES-AUDIO-AI-10.txt:1255-1275»
ND-2188. Implemente watermarking (estilo AudioSeal) e licenciamento comercial desde o dia 1. «CONCORRENCES-AUDIO-AI-10.txt:1280-1290»
ND-2189. Compare competitivamente por matriz: full songs/vocals/instrumental/melody input/bar editing/stem export/voice cloning/realtime/open source — Debonair deve cobrir bar editing, stems, MIDI editável, realtime e open source que poucos cobrem. «CONCORRENCES-AUDIO-AI-10.txt:1300-1340»
ND-2190. Posicione qualidade vs escala no mapa de mercado (Suno/Udio topo qualidade; Soundraw/Boomy volume) e ocupe o nicho dev/controle. «CONCORRENCES-AUDIO-AI-10.txt:1345-1365»

### Bloco 9 — LIBRARIAS-TS-AUDIO.txt (catálogo de libs TS/JS de áudio e IA)

ND-2191. Adote Tier 1 como obrigatório: onnxruntime-web (2.2M/wk), @huggingface/transformers (1.1M/wk), @tensorflow/tfjs, howler, wavesurfer.js, tone (600K/wk), tonal. «LIBRARIAS-TS-AUDIO.txt:880-900»
ND-2192. Adote Tier 2: @tonejs/midi, meyda, pitchfinder, spessasynth_core (SF2/SF3/DLS sem deps), @magenta/music (1.23.1, stale 2021), xsound, browser-whisper, demucs-web, audio-effect, js-synthesizer. «LIBRARIAS-TS-AUDIO.txt:905-925»
ND-2193. Para SoundFont no browser prefira spessasynth_core (TS completo, 0 deps, SF2/SF3/DLS, MIDI→WAV) ou js-synthesizer (FluidSynth WASM). «LIBRARIAS-TS-AUDIO.txt:560-650»
ND-2194. Para teoria musical use tonal 6.x tree-shakeable (note/midi/interval/scale/chord/chord-detect/key/mode/progression/roman-numeral/pcset). «LIBRARIAS-TS-AUDIO.txt:430-530»
ND-2195. Para features de áudio use meyda (MFCC, chroma, centroid, flatness, rolloff, ZCR, loudness) e para pitch pitchfinder (YIN, Mcleod, AMDF, Dynamic Wavelet, ACF2+). «LIBRARIAS-TS-AUDIO.txt:280-350»
ND-2196. Para playback/visualização use howler (sprites, spatial) e wavesurfer.js v7 TS (regions, timeline, spectrogram, record, envelope). «LIBRARIAS-TS-AUDIO.txt:180-270»
ND-2197. Considere audio-effect (2026, processa Float32Array direto, sem Web Audio) para efeitos canônicos e @mode-7/mod para síntese declarativa em React com CV routing. «LIBRARIAS-TS-AUDIO.txt:360-430»
ND-2198. Use browser-whisper para ASR local com WebGPU + OPFS caching e demucs-web para separação 4-stem ONNX ~172MB. «LIBRARIAS-TS-AUDIO.txt:150-175»
ND-2199. Registre os gaps do ecossistema TS: DSP realtime eficiente, reverb convolucional eficiente com IR generation, physical modeling, wavetable dedicada, FM nível DX7, spectral processing, time-stretch/pitch-shift de qualidade, codecs de encoding, MIDI 2.0, ambisonics, síntese de texto. «LIBRARIAS-TS-AUDIO.txt:940-990»
ND-2200. Use WASM obrigatório para: efeitos realtime pesados, pitch-shift PSOLA/WSOLA, encoding MP3/AAC/FLAC, convolution longa, physical modeling, FluidSynth, source separation. «LIBRARIAS-TS-AUDIO.txt:1000-1030»
ND-2201. Use ONNX models para: Whisper/Moonshine ASR, Demucs/HTDemucs, YAMNet/PANNs classificação, SPICE pitch, OnsetsAndFrames transcrição, Bark/VITS/Piper TTS, super-resolution, noise reduction, voice cloning. «LIBRARIAS-TS-AUDIO.txt:1040-1060»
ND-2202. Fixe o stack recomendado do Debonair: MUST HAVE (tone, tonal, @tonejs/midi, howler), SHOULD HAVE (wavesurfer, meyda, pitchfinder, spessasynth_core), NICE TO HAVE (audio-effect, xsound), AI LAYER (onnxruntime-web, transformers), SPECIFIC (browser-whisper, demucs-web). «LIBRARIAS-TS-AUDIO.txt:1100-1140»
ND-2203. Monte pipelines de integração: input→Meyda+Pitchfinder→ONNX→Tone.js→Wavesurfer para análise; tonal→@tonejs/midi→spessasynth→Tone/Howler para geração. «LIBRARIAS-TS-AUDIO.txt:1160-1250»
ND-2204. Evite pizzicato (deprecated desde 2018) e brain.js/ml5 para produção de áudio. «LIBRARIAS-TS-AUDIO.txt:100-150; 930-940»
ND-2205. Verifique saúde de libs antes de adotar: downloads semanais, última atualização, tipos TS nativos, licença (ex.: @magenta/music stale Nov 2021; @tonejs/midi Feb 2022 ainda sólido). «LIBRARIAS-TS-AUDIO.txt:85-95; 545-560»

### Bloco 10 — EFFECTS-MIXING-MASTERING.txt (taxonomia de efeitos e prioridades)

ND-2206. Implemente taxonomia completa de efeitos: dynamics (comp/limiter/multiband/gate/transient shaper), EQ (paramétrico/gráfico/shelving/dinâmico/linear-phase FIR), time (delay/ping-pong/tape/algorithmic+convolution+neural reverb), modulação (chorus/flanger/phaser/tremolo/vibrato/rotary), distorção (overdrive/fuzz/tape/tube/bitcrusher/waveshaper), espacial (panner/M-S/widener/binaural HRTF/Haas). «EFFECTS-MIXING-MASTERING.txt:10-95»
ND-2207. Implemente em JS puro: EQ biquad, compressor, delay circular, chorus/flanger/phaser, waveshaping, M/S imaging, gate, reverb algorítmico (Dattorro 0.5ms por bloco de 10ms). «EFFECTS-MIXING-MASTERING.txt:350-365»
ND-2208. Reserve WASM para: neural reverb (TCN+SIMD), stem separation, linear phase EQ (FFT 4096+), voice conversion, pitch shift por phase vocoder. «EFFECTS-MIXING-MASTERING.txt:330-345»
ND-2209. Execute o workflow de AI mixing em 4 fases: análise (FFT/crest/M-S/LUFS/transientes) → decisão IA (referência CLAP/MERT, gênero, frequency masking, sugestões) → processamento (per-stem gain→EQ→de-esser→comp→creative EQ→sat→sends; master subgroup→bus comp→M/S EQ→imaging→limiting) → output estéreo 44.1/48kHz 24-bit -14 LUFS -1 dBTP. «EFFECTS-MIXING-MASTERING.txt:170-230»
ND-2210. Execute o AI mastering em 8 estágios com análise de 8 métricas e comparação a referência ou preset de gênero. «EFFECTS-MIXING-MASTERING.txt:235-300»
ND-2211. Alinhe outputs a plataformas: Spotify/YouTube/Tidal -14 LUFS, Apple -16, Amazon -14/-2 dBTP, Deezer -15, SoundCloud -11, Beatport -9/-0.3, TikTok -9 a -12. «EFFECTS-MIXING-MASTERING.txt:290-300»
ND-2212. Integre stem separation browser: HT-Demucs FT ONNX 166MB fp16 (SDR 9.19 dB), chunks 7.8s, WASM multithread 3–5x com SAB, WebGPU ~3x realtime. «EFFECTS-MIXING-MASTERING.txt:310-330»
ND-2213. Considere RVC v2 para voice conversion (UTMOS 4.19/5, treino 18min em 3090, realtime 90ms, 1 minuto de dados mínimo). «EFFECTS-MIXING-MASTERING.txt:335-360»
ND-2214. Priorize a implementação de efeitos em 4 ondas: semana 1-4 core effects (EQ 5-band, comp/limiter lookahead, delays, reverb Dattorro/convolução, saturação, modulação, espacial, utility); semana 5-8 análise AI; semana 9-16 sugestões AI de EQ/comp/mix/master; semana 17-24 stems/NAM/voice conversion. «EFFECTS-MIXING-MASTERING.txt:380-470»
ND-2215. Fixe specs de processamento: 44100/48000Hz, 32-bit float interno, blocos 128 samples (~2.9ms), buffer configurável 256–2048, estéreo mínimo, latência de monitoração <10ms. «EFFECTS-MIXING-MASTERING.txt:480-495»
ND-2216. Modele cada efeito como interface com params tipados (min/max/default/unit/automatable) e método process(input, context). «EFFECTS-MIXING-MASTERING.txt:520-560»
ND-2217. Siga o sinal-padrão: gain staging → corrective EQ → de-esser → compressão → creative EQ → (sends reverb/delay) → saturador → stereo imager → limiter → output. «EFFECTS-MIXING-MASTERING.txt:580-610»
ND-2218. Decida arquitetura: AudioWorklet para todo DSP custom, nós nativos onde existem (ConvolverNode/DynamicsCompressorNode/BiquadFilterNode), WASM só quando JS não dá conta, Web Workers para análise AI, SAB para multithread WASM. «EFFECTS-MIXING-MASTERING.txt:630-650»
ND-2219. Referencie ferramentas de AI mastering: LANDR (Synapse), iZotope Ozone (Master Assistant, microdynamics LDR), CloudBounce, MEGAMI (Sony), matchering, master_me, Phantom. «EFFECTS-MIXING-MASTERING.txt:660-700»
ND-2220. Cumpre metas de perf: latência de efeitos <5ms, análise de mastering <2s, stems <5min/música, UI 60fps sem bloquear main thread. «EFFECTS-MIXING-MASTERING.txt:700-720»

### Bloco 11 — SINTESE-TIPOS-SOM.txt (máquina de síntese universal)

ND-2221. Mantenha mapa de frequências canônico: sub 20–60, bass 60–250, low-mid 250–500, mid 500–2k, high-mid 2–4k, high 4–8k, very high 8–20k, com fundamentais por instrumento (kick 40–80+click 2–5k; snare 150–250+2–8k; hihat 4–16k; voz M 85–180 F0 com formantes 300–3000). «SINTESE-TIPOS-SOM.txt:8-40»
ND-2222. Domine 7 métodos de síntese: subtrativa (osc→filtro→ADSR), aditiva (série de Fourier), FM (β = índice, bandas laterais Bessel), modelagem física (Karplus-Strong), granular (grãos 1–100ms, density 4–128, janelas Hann/Gauss), sample-based (pitch shift + layers + velocity layers) e wavetable (PeriodicWave interpolada). «SINTESE-TIPOS-SOM.txt:60-260»
ND-2223. Use receitas FM clássicas: piano elétrico fm=14·fc β3–5; sino 1.4:1 β5–10; baixo 1:1 β1–3; clavinet 3:1; marimba 4:1. «SINTESE-TIPOS-SOM.txt:150-170»
ND-2224. Implemente Karplus-Strong em AudioWorklet (delay line = Fs/F0, loop gain 0.95–0.99, filtro média) para cordas. «SINTESE-TIPOS-SOM.txt:200-230»
ND-2225. Modele drums por física: kick = sine sweep 300→50Hz + click de noise + ADSR rápido; snare = sine 200Hz + noise bandpass 2–8kHz; hihat = noise highpass 7kHz + ADSR curto; tom = sine 80–200Hz. «SINTESE-TIPOS-SOM.txt:240-260»
ND-2226. Modele FX: riser = sine sweep 100→8000Hz + filtro sweep + envelope; impact = noise + sub; whoosh = noise com HP sweep; laser = FM alto índice; boom = sub 30–80Hz + reverb longa; reverse = envelope invertido. «SINTESE-TIPOS-SOM.txt:330-380»
ND-2227. Modele pads: warm = 2 saws detuned + lowpass + slow attack; cold = aditiva+FM; atmosphere = granular+reverb; shimmer = aditiva+pitch shift; drone = física+FM. «SINTESE-TIPOS-SOM.txt:395-440»
ND-2228. Modele guitarra por tipo: nylon/steel KS com parâmetros de pluck/body; elétrica limpa subtrativa+wavetable; distorcida com waveshaping; harmônicos aditivos; slide com pitch contínuo. «SINTESE-TIPOS-SOM.txt:460-490»
ND-2229. Modele piano: hammer attack (noise burst 2–8kHz) + aditiva 15 harmônicos com amplitude 1/h² e decay exponencial por harmônico + ressonância simpática + pedal sustain. «SINTESE-TIPOS-SOM.txt:510-560»
ND-2230. Modele voz: fonte sawtooth (F0 85–255Hz) → 3 bandpass formants (F1 300–800, F2 800–2500, F3 2500–3500Hz) + vibrato LFO 4–7Hz ±50 cents + breathiness noise; formantes por vogal (/a/ F1 730 F2 1100; /i/ F1 270 F2 2300). «SINTESE-TIPOS-SOM.txt:580-660»
ND-2231. Implemente beatbox como combinação: kick/snare/hihat/clap/scratch (noise com pitch mod)/vocal bass (saw+filter)/lip oscillation (FM 1.5:1). «SINTESE-TIPOS-SOM.txt:670-720»
ND-2232. Aplique receitas por categoria: synth lead = 2 saws detuned+filter; synth bass = saw/square+LP envelope ou FM 1:1+sub sine; arps = osc+filter+sequencer+velocity layers; chords/stacks = 3–4 oscs detune ±5/+12 cents com spread estéreo. «SINTESE-TIPOS-SOM.txt:740-790»
ND-2233. Arquitete SynthEngine/SampleEngine/PhysicalModeling sobre AudioContext com chain de efeitos comum (reverb/delay/comp/EQ/dist/chorus) e destino único. «SINTESE-TIPOS-SOM.txt:810-860»
ND-2234. Use mapa de decisão: som realista → física/samples; som de synth → subtrativa/FM; texturas → granular/aditiva; beats → subtrativa+noise e FM para metálicos; efeitos → sweeps/noise/FM alto índice. «SINTESE-TIPOS-SOM.txt:960-1010»
ND-2235. Respeite as referências acadêmicas de síntese: Karplus & Strong 1983, Chowning 1973 (FM), Roads Microsound 2001 (granular), Smith CCRMA (física), Xenakis. «SINTESE-TIPOS-SOM.txt:900-950»

### Bloco 12 — FORMATOS-DADOS-PREV processados.txt (formatos binários compactos)

ND-2236. Organize debonair-data/ com manifest.json global + pastas por categoria (drums/chords/melodies/pads/bass/effects/mixing/audio_features), cada uma com _index.sqlite + .bin compactado. «FORMATOS-DADOS-PREV processados.txt:10-40»
ND-2237. Aplique 5 princípios: separation of concerns (SQLite=metadados, bin=dados), zero-copy via mmap, strings como IDs numéricos em lookup tables, incremental loading por gênero, schemas versionados por arquivo. «FORMATOS-DADOS-PREV processados.txt:45-55»
ND-2238. Codifique drum patterns com header 16B (magic/ver/id/genre/bpm/steps/swing), velocity delta-encoded com varint e RLE, e instrumentos em bitmask (1 bit/step: 16 steps = 2 bytes vs 144 bytes em JSON — economia 87.5%). «FORMATOS-DADOS-PREV processados.txt:95-175»
ND-2239. Codifique chords com header 12B + sequência (n, chord_type_id, roman_id, duration, inversion) + voicing custom com notas/velocities delta. «FORMATOS-DADOS-PREV processados.txt:180-230»
ND-2240. Codifique melodias com interval_delta assinado, duração como denominador de fração de beat, velocity delta e flags por bit (rest/tied/accent 2b/articulation 4b). «FORMATOS-DADOS-PREV processados.txt:250-300»
ND-2241. Guarde pads como envelope espectral quantizada 64 bins uint16 (128B) + dados de modulação (LFO rate/depth, filter env). «FORMATOS-DADOS-PREV processados.txt:340-380»
ND-2242. Modele mixing recipes como JSON por gênero com instrument_gains, panning, eq, compression, reverb_send e limiter. «FORMATOS-DADOS-PREV processados.txt:400-440»
ND-2243. Mantenha lookup tables compartilhadas (genres com hierarquia parent_id, moods com valence -1..1 e energy 0..1, keys com midi_root, scales com intervals BLOB). «FORMATOS-DADOS-PREV processados.txt:940-1050»
ND-2244. Indexe cada categoria em SQLite com data_offset/data_length para acesso random ao .bin, tags como bitmap e FTS5 de tags. «FORMATOS-DADOS-PREV processados.txt:460-560»
ND-2245. Busque combos compatíveis (drum+chord+melody+bass) por JOIN de genre/key/mood com LIMIT por categoria. «FORMATOS-DADOS-PREV processados.txt:600-640»
ND-2246. Comprima com combinação: bit-packing 87.5%, delta 60–80%, varint 30–50%, RLE 40–70%, LZ4 por chunk 64KB, string interning 90%+, bitmap de tags 95% → total estimado 600KB vs 3.75MB JSON (84%) + features MFCC ~5.2MB. «FORMATOS-DADOS-PREV processados.txt:660-720»
ND-2247. Deduplique por referência: variações só de velocity armazenam base_pattern_id + velocity_override (economia ~60%). «FORMATOS-DADOS-PREV processados.txt:725-740»
ND-2248. Rode build pipeline em 7 passos: extract → classify → validate (min-quality 0.7) → optimize/dedup → build binaries → manifest → check_sizes max 10MB. «FORMATOS-DADOS-PREV processados.txt:850-880»
ND-2249. Classifique gênero por features rítmicas com thresholds por gênero (pop 100–130 BPM density 0.3–0.6; electronic 120–150 0.6–0.9) e mood por valence/energy (major/ascending = +valence; BPM/density/velocity = +energy). «FORMATOS-DADOS-PREV processados.txt:900-935»
ND-2250. Valide padrões: densidade mín/máx, consistência de velocity, estabilidade rítmica, resolução de tônica, voice leading e durações razoáveis. «FORMATOS-DADOS-PREV processados.txt:810-845»
ND-2251. Fontes de extração: MAESTRO/GMD MIDI, NSynth/Splice samples, MusicXML, Groove/LMD; extrair drums quantizados 16th em segmentos de 4 bars, chords→roman numerals, melodias por frases com contour e auto-tags (four_on_floor, backbeat, syncopated, swung). «FORMATOS-DADOS-PREV processados.txt:745-805»

### Bloco 13 — MIXING-MASTERING-POR-GENERO.txt (receitas por gênero)

ND-2252. Aplique cadeia master universal em 8 estágios: gain staging -12 a -14 dBFS → corrective EQ → multiband → full-band glue 2:1 max 2–3dB GR → additive EQ ±1–2 dB → stereo imaging após compressão → limiter true peak -1 dBTP → meter LUFS/LRA. «MIXING-MASTERING-POR-GENERO.txt:12-30»
ND-2253. Aplique regras universais: low-end mono abaixo de 120Hz, HPF de tudo não-bass em 80–120Hz, tracks a -18 dBFS antes do processamento, mix bus com picos -6 dBFS antes do mastering, true peak sempre (inter-sample peaks clipam codec), A/B contra 2–3 referências comerciais. «MIXING-MASTERING-POR-GENERO.txt:40-50»
ND-2254. Mixe trap: kick HPF 40–50Hz +3dB@60-80 + corte 200–350Hz + click 3–5kHz, comp 4:1 attack 1–5ms; 808 HPF 25–30Hz, fundamental +2–3dB@50-60, sidechain multiband 60–120Hz 4:1–10:1, saturação leve para tradução em pequenos speakers, decay um pouco menor que a nota. «MIXING-MASTERING-POR-GENERO.txt:60-130»
ND-2255. Sinta o kick à nota fundamental do 808 no trap. «MIXING-MASTERING-POR-GENERO.txt:70-75»
ND-2256. Misture vocals de rap/pop com 2 compressores em série (1176-style 4:1–8:1 attack 5–15ms GR 4–10dB + LA-2A-style 2:1–3:1 auto release) + de-esser 6–8kHz + reverb plate curto 0.7–1.2s com HPF 150–200Hz no retorno + slap delay 80–120ms duckado. «MIXING-MASTERING-POR-GENERO.txt:210-260; 330-380»
ND-2257. Use compressão paralela em vocals/drums: 8:1–10:1, GR 10–15dB, blend 20–50%, com filtros HP 100–200Hz e LP 10–14kHz no caminho paralelo. «MIXING-MASTERING-POR-GENERO.txt:240-260»
ND-2258. Em EDM faça sidechain como elemento rítmico: kick→bass 6–12 dB via volume shaper, kick→synths 3–6 dB, release casado ao tempo; kick é o elemento mais alto (-6 a -8 dBFS), bass logo abaixo (-9 a -12 dBFS). «MIXING-MASTERING-POR-GENERO.txt:520-620»
ND-2259. Lo-fi em hip-hop: low-pass 6–10kHz nos samples, HPF 100–200Hz, boost opcional 1–3kHz para caráter. «MIXING-MASTERING-POR-GENERO.txt:400-420»
ND-2260. Ajuste mastering por gênero: trap/hip-hop limiter agressivo -8 a -10 LUFS competitivo com soft clipper 1–2dB antes; pop transparente -12 a -14; EDM -6 a -9 com multiband no sub. «MIXING-MASTERING-POR-GENERO.txt:145-165; 480-500; 640-660»
ND-2261. Faça M/S EQ no master: mono abaixo de 80–100Hz, high shelf +0.5–1.5 dB nos sides em 12kHz para air. «MIXING-MASTERING-POR-GENERO.txt:150-160»
ND-2262. Carveie EQ kick vs 808/bass por gênero: kick fundamental 60–80Hz, 808/sub 35–60Hz (trap) ou 40–60Hz (hip-hop/EDM), zona de lama 200–500Hz para cortar. «MIXING-MASTERING-POR-GENERO.txt:900-930»
ND-2263. Roteie sidechains por tabela: trap kick→808 3–6dB multiband; pop kick→bass 3–6dB; hip-hop kick→808 2–4dB; EDM kick→bass 6–12dB e kick→reverb/delay 3–6dB para evitar wash. «MIXING-MASTERING-POR-GENERO.txt:880-900»
ND-2264. Automatize mixing em 8 passos: detectar/classificar stems → detectar gênero → carregar receita → aplicar por instrumento → rotear sidechains → agrupar buses → forçar mono <120Hz no low-end → validar (LUFS, true peak, correlação ≥0.1, phase). «MIXING-MASTERING-POR-GENERO.txt:690-780»
ND-2265. Automatize mastering com loop iterativo: medir → comparar targets → ajustar limiter gain +0.5 / ceiling -0.1 / GR máx -0.5 até bater targets. «MIXING-MASTERING-POR-GENERO.txt:820-850»
ND-2266. Gere bounces por plataforma (spotify/apple/youtube/soundcloud/beatport) com LUFS e true peak próprios. «MIXING-MASTERING-POR-GENERO.txt:855-875»
ND-2267. Detecte parâmetros automaticamente: fundamental do kick por onset+pitch tracking, bass por FFT, vocal por ML classifier, snare crack por transiente, hats por análise espectral, phase por cross-correlation. «MIXING-MASTERING-POR-GENERO.txt:790-815»
ND-2268. Fixe specs de qualidade por gênero (trap: DR 7–10 LU, mono <80Hz, 808 35–60Hz, hats 8–16kHz, 24-bit 44.1/48kHz; pop: DR 8–12 LU, vocal 3–5kHz+air 10–16kHz; EDM: DR 4–8 LU, sidechain crítico). «MIXING-MASTERING-POR-GENERO.txt:745-875»
ND-2269. Trate todos os valores como ponto de partida — sempre A/B contra referências comerciais do gênero. «MIXING-MASTERING-POR-GENERO.txt:1-8»
ND-2270. Referencie MEGAMI, MixMasterAI, NeuroMix, Phantom e Moozix como estado da arte em AI mixing. «MIXING-MASTERING-POR-GENERO.txt:890-898»

### Bloco 14 — MONTAGEM-INTELIGENTE.txt (fábrica de carros: warehouse + factory)

ND-2271. Separe peças (warehouse pré-fabricado: ~14.000 variações de drums/bass/chords/melodies/pads/fx) de montagem (factory: matriz de compatibilidade + templates + receitas + presets). «MONTAGEM-INTELIGENTE.txt:10-60»
ND-2272. Metadado cada peça com key/scale/bpm/timeSignature, mood[]/energy/tension, genres[]/era, role/register/density, duration/bars/loopable/fades. «MONTAGEM-INTELIGENTE.txt:70-110»
ND-2273. Aplique regras harmônicas com peso: bass_note_in_chord 1.0 (hard), melody_in_scale 0.9, avoid_dissonance 0.8 (semitons 1 e 6 proibidos). «MONTAGEM-INTELIGENTE.txt:120-150»
ND-2274. Aplique regras rítmicas: bass trava com kick (alignment 0–1), melodia preenche lacunas rítmicas (fill ratio), consistência de subdivisão de hi-hats. «MONTAGEM-INTELIGENTE.txt:155-185»
ND-2275. Use genre templates com estrutura+curva de energia+camadas por seção (pop: intro 4→verse 8→preChorus 4→chorus 8→…; EDM build/drop; jazz head/solos; lofi loops). «MONTAGEM-INTELIGENTE.txt:190-280»
ND-2276. Aplique receitas de mixing por instrumento dentro da fábrica (kick center mono volume -6 com sidechain do bass; guitar -0.7 left -10; vocals center -3 com plate 1.5s 0.15 e delay 1/4). «MONTAGEM-INTELIGENTE.txt:290-420»
ND-2277. Monte por seção: filtre peças compatíveis → pontue (harmônica 0.4, rítmica 0.3, registro 0.2, densidade 0.1) → escolha a melhor por instrumento. «MONTAGEM-INTELIGENTE.txt:470-530»
ND-2278. Consulte o warehouse com filtros exatos (key, bpm ±5, category) e fuzzy (mood similarity >0.6, genres) + busca por embedding cosine top-K. «MONTAGEM-INTELIGENTE.txt:540-600»
ND-2279. Use Markov chain de 1ª ordem treinada em progressões reais para decidir o próximo acorde com sampling probabilístico. «MONTAGEM-INTELIGENTE.txt:620-670»
ND-2280. Resolva voice leading com constraint satisfaction: hard (sem quintas/oitavas paralelas, range de voz, chord tones) e soft (voice leading suave 0.8, evitar dissonância 0.9, graus conjuntos 0.7) com backtracking e heurística MRV. «MONTAGEM-INTELIGENTE.txt:680-740»
ND-2281. Controle energia dinamicamente: peso por role (lead 1.0, rhythmic_foundation 0.8, harmonic_bed 0.6, texture 0.4, fx 0.3) mapeado para volume -6 a +6 dB e entrada/saída de instrumentos por threshold de energia. «MONTAGEM-INTELIGENTE.txt:750-800»
ND-2282. Estruture montagem-inteligente/ com warehouse/, assembly/, rules/, intelligence/, mixing/, mastering/, api/ e templates/ JSON por gênero. «MONTAGEM-INTELIGENTE.txt:820-900»
ND-2283. Implemente em 5 fases de 2–3 semanas: warehouse básico, regras de compatibilidade, motor de montagem, mixing/mastering, otimização+ML. «MONTAGEM-INTELIGENTE.txt:920-960»
ND-2284. Meça sucesso: compatibilidade harmônica >95%, qualidade subjetiva >4/5 blind test, montagem <30s, diversidade >80%, coerência estrutural >90%. «MONTAGEM-INTELIGENTE.txt:1000-1010»
ND-2285. Referencie pesquisa 2025–2026: Muse, Khala, SegTune, SketchSong, TOMI, ACE-Step 1.5, YuE, NeuralConstraints, Diatony, AutoMixMaster, pattrns, LoopLens. «MONTAGEM-INTELIGENTE.txt:1030-1080»
ND-2286. Aceite limitações conhecidas: qualidade depende das peças, mixing automático não iguala engenheiro humano, criatividade limitada pelas regras, Markov de 1ª ordem. «MONTAGEM-INTELIGENTE.txt:1020-1030»

### Bloco 15 — ANALISE-ESPECTRAL.txt (FFT/STFT/MFCC/chroma/descritores)

ND-2287. Configure FFT para música: fftSize 2048 (~46ms), hop 512 (~11.6ms), janela Hann/Hamming, overlap 50–75%; 44100/2048 = 21.5Hz por bin; fftSize ≥8192 para distinguir semitons graves. «ANALISE-ESPECTRAL.txt:15-40»
ND-2288. Implemente STFT próprio com janelas Hann (0.5(1−cos)), Hamming (0.54−0.46cos) e Blackman. «ANALISE-ESPECTRAL.txt:50-110»
ND-2289. Construa mel filterbank triangular com 128 bandas entre 20Hz e fmax, conversões hzToMel/melToHz, log e normalização — MEL_CONFIG padrão (sr 22050, fft 2048, hop 512, power 2). «ANALISE-ESPECTRAL.txt:120-230»
ND-2290. Extraia MFCC 13 via DCT do mel log + delta e delta-delta com janela τ=1..3 → vetor de 39 dims por frame. «ANALISE-ESPECTRAL.txt:240-300»
ND-2291. Compute chroma de 12 classes mapeando bins→MIDI→pitch class com energia quadrática e normalização. «ANALISE-ESPECTRAL.txt:310-350»
ND-2292. Implemente 5 descritores espectrais: centroid (centro de massa), bandwidth (spread), rolloff 85%, contrast pico-vale por sub-banda e flatness GM/AM (ruído vs tom) + ZCR. «ANALISE-ESPECTRAL.txt:360-450»
ND-2293. Alimente CNNs/ViTs com mel 128 bins (padrão indústria; 80 para speech, 256 high-res), frames 25–50ms, hop 10–23ms. «ANALISE-ESPECTRAL.txt:470-530»
ND-2294. Use representações discretas VQ-VAE/EnCodec (RVQ 32 codebooks, frame rate 75/150Hz, banda 1.5–24kbps) para geração estilo MusicGen/AudioLM; fase 3+ via ONNX. «ANALISE-ESPECTRAL.txt:560-620»
ND-2295. Detecte acordes com template matching (25 templates: 12 major+12 minor+dim/aug/dom7/min7) sobre chroma + HMM com transições musicais. «ANALISE-ESPECTRAL.txt:640-670»
ND-2296. Detecte onsets com spectral flux half-wave rectified, HFC ponderado por frequência e complex domain; bandas: kick 20–100Hz, snare 100–300+1k–5k, hihat 5k–15k. «ANALISE-ESPECTRAL.txt:690-760»
ND-2297. Detecte pitch com YIN (diferença quadrática acumulada, normalização, primeiro vale <0.2, interpolação parabólica) e vibrato via FFT do contour entre 4–8Hz. «ANALISE-ESPECTRAL.txt:770-860»
ND-2298. Complete o vetor de features por frame (~167 valores: mel 128, MFCC 13, chroma 12, descritores 5, temporais 5, perceptuais brightness/warmth/hardness/density/loudness). «ANALISE-ESPECTRAL.txt:880-910»
ND-2299. Estruture módulo spectral/ (fft, stft, mel, mfcc, chroma, descriptors, onset, pitch, features) e ai/ (agent, classifier, separation, synthesis) sobre theory/harmony/melody/rhythm existentes. «ANALISE-ESPECTRAL.txt:930-980»
ND-2300. Feche o loop analyze→generate: análise de referência (genre/mood/key/bpm/instruments) → parâmetros → music engine → export; permitir transpor (D minor) e alterar tempo (130). «ANALISE-ESPECTRAL.txt:1000-1060»
ND-2301. Siga as boas práticas: 128 bins mel para CNNs, FFT 2048 música / 512 speech, sempre janela antes da FFT, normalizar features, usar escala log dB. «ANALISE-ESPECTRAL.txt:1080-1100»

### Bloco 16 — WORKFLOW-MANUAL-VS-AI.txt (dois modos, agente CoT, prompts)

ND-2302. Mantenha dois modos que compartilham o mesmo pipeline: Manual (usuário compõe com theory/harmony/melody/rhythm como ferramentas puras) e AI (agente traduz prompt em parâmetros e roda o mesmo pipeline); ambos convergem no audio engine Tone.js. «WORKFLOW-MANUAL-VS-AI.txt:5-20»
ND-2303. Encadeie o pipeline manual: buildKeySignature → buildChordProgression (com inversions/voice leading/substitutions/extended chords/modulateKey) → generateBassLine/generateLeadMelody/generateCounterpoint/applyDevelopment (sequence/inversion/retrograde/augmentation/diminution) → generateDrumPattern/applySwing/humanizeTiming/generateFill → MELODIC/PERCUSSION_INSTRUMENTS com customizeInstrument/layerInstruments → musicEngine (play/mute/solo/BPM/sub-patterns). «WORKFLOW-MANUAL-VS-AI.txt:30-180»
ND-2304. Gere melodia com seed para reprodutibilidade (seed 42) e config com scaleRoot/scaleType/genre/bpm/octaveRange/density/complexity. «WORKFLOW-MANUAL-VS-AI.txt:105-120»
ND-2305. O agente IA NÃO substitui a theory engine — ele a alimenta: prompt → AIGenerationPlan {key, scale, bpm, genre, progression, chordDurations, melodyConfig, drumPattern, instruments, sections, reasoning, confidence} → mesmo pipeline manual. «WORKFLOW-MANUAL-VS-AI.txt:200-260»
ND-2306. Raciocine por CoT em 6 passos: parse intent → parâmetros de teoria via GENRE_CONFIG → mood mapping → progressão → estrutura por duração → instrumentos e melody/rhythm config → validação com confidence. «WORKFLOW-MANUAL-VS-AI.txt:280-400»
ND-2307. Use GENRE_CONFIG como knowledge base do agente (bpmRange, defaultScale/Key, commonProgressions, drumStyle, typicalInstruments por 15 gêneros). «WORKFLOW-MANUAL-VS-AI.txt:405-425»
ND-2308. Aplique MOOD_MAP com vieses: upbeat → BPM upper + major + density 0.7; melancholic → lower + minor + 0.4; aggressive → upper + minor + 0.8/0.7; chill/dreamy → lower + density 0.2–0.3; dark → lower + minor. «WORKFLOW-MANUAL-VS-AI.txt:430-450»
ND-2309. Use STRUCTURE_TEMPLATES com intensity por seção (pop 10 seções; EDM com buildUp/drop; trap verses de 16 bars) e permita progressionOverride por seção. «WORKFLOW-MANUAL-VS-AI.txt:455-500»
ND-2310. Mapeie instrumentos naturais para presets com customizations (piano→chords triangle com ADSR próprio; synth→lead saw detune 10; ambient→pad attack 0.5 release 2). «WORKFLOW-MANUAL-VS-AI.txt:505-520»
ND-2311. Projete agente single-agent com CoT estruturado (inspirado em ComposerX/CoComposer/WeaveMuse) — mais simples e confiável para contexto de biblioteca. «WORKFLOW-MANUAL-VS-AI.txt:540-560»
ND-2312. Use system prompt LLM com output JSON estrito de intent (genre/mood/instruments/vocalStyle/tempo/key/scale/structure/duration/specialRequests) e regras de desambiguação (mood vence defaults do gênero; upbeat=major+rápido; dark=minor+lento). «WORKFLOW-MANUAL-VS-AI.txt:590-620»
ND-2313. Ofereça refine iterativo: agent.refine(plan, feedback) modificando apenas o pedido ("make the drums simpler and add piano") e generateSection para regenerar seção isolada. «WORKFLOW-MANUAL-VS-AI.txt:640-660»
ND-2314. Exponha APIs dos três modos: manual (createProject→setProgression/setMelody/setDrums/setInstruments→generate→export), AI (generate({prompt})→track.play(), generatePlan para inspeção), híbrido (inspecionar plan, override de BPM/progressão/hihat variation, regenerateMelody). «WORKFLOW-MANUAL-VS-AI.txt:670-750»
ND-2315. Implemente API event-driven: on('section:complete'), on('playback:position'), on('plan:generated') para UI antes de executar. «WORKFLOW-MANUAL-VS-AI.txt:760-780»
ND-2316. Invente nada: reutilize módulos existentes como camada de execução; novos módulos só ai/ (agent, prompts, intent, structure, mood, validation, refinement) e project/ (project, track, arrangement, export). «WORKFLOW-MANUAL-VS-AI.txt:810-880»
ND-2317. Siga os 10 padrões de prompt de música: gênero+era primeiro, BPM exato, instrumentos concretos ("Rhodes piano"), 5–8 tags máx com posição ponderada, vocal style específico, hints de estrutura, stage directions [Intro: solo piano], mood casado com key, evitar contradições, iterar mudando uma variável. «WORKFLOW-MANUAL-VS-AI.txt:900-930»
ND-2318. Use a fórmula de prompt: [Gênero+era]+[BPM]+[Key/Scale]+[2–3 instrumentos]+[Mood]+[Vocal style]+[Estrutura]. «WORKFLOW-MANUAL-VS-AI.txt:935-940»
ND-2319. Diferencie-se pela transparência: o agente explica o PORQUÊ de cada parâmetro e o usuário pode sobrescrever antes de gerar (plano legível vs caixa-preta Suno/Udio). «WORKFLOW-MANUAL-VS-AI.txt:945-955»
ND-2320. Priorize implementação: fase 1 agente core (intent, mood, prompts, agent, structure); fase 2 execução do plano (project, track, bridge); fase 3 export e refine; fase 4 regeneração por seção, audio-to-audio, LoRA-like, stems, drag-and-drop DAW. «WORKFLOW-MANUAL-VS-AI.txt:960-990»
ND-2321. Registre o status real: teoria/harmony/melody/rhythm/instruments/Tone.js/sequencer/testes ✅ prontos; song structure, timeline, MIDI/WAV export, mixing, undo/redo, project save/load 🔨 a construir. «WORKFLOW-MANUAL-VS-AI.txt:1000-1060»

### Bloco 17 — PLANO-TECNICO-MASTER.txt (visão, dependências, fases, moat)

ND-2322. Defina Debonair como "Stripe da música": API limpa e composta onde devs descrevem o que querem e recebem composições tocáveis, editáveis e exportáveis — não caixa-preta tipo Suno/Udio. «PLANO-TECNICO-MASTER.txt:5-15»
ND-2323. Mantenha 5 camadas: user (manual/AI/hybrid) → AI agent (CoT) → music generation (theory/harmony/melody/rhythm) → instrument (12 melodic + 8 percussion, 15 gêneros) → audio engine (Tone.js/effects/mixing/export) + camada neural opcional (RAVE/DDSP/HiFi-GAN/Demucs). «PLANO-TECNICO-MASTER.txt:20-100»
ND-2324. Minimize dependências: runtime = 1 pacote (tone ^15.1.22 ~250KB); fase 2 + midi-file/wavefile/audiobuffer-to-wav; fase 3 + onnxruntime-web; zero custos de API. «PLANO-TECNICO-MASTER.txt:110-140»
ND-2325. Execute a purga de dependências: 342 deps → 1 runtime dep, remover 308 devDeps e 354 overrides; vite.config 445→~30 linhas; tsconfig 332→~25 linhas. «PLANO-TECNICO-MASTER.txt:160-175»
ND-2326. Publique v0.1.0 na semana 2 (testes 50+ casos, 80% cobertura, README, TSDoc, 3 exemplos, CI typecheck+lint+test+build, LICENSE MIT DevThink 2026). «PLANO-TECNICO-MASTER.txt:165-185»
ND-2327. Siga o roadmap: v0.5.0 semana 4 (MIDI export, effects, estrutura); v0.8.0 semana 8 (AI agent, ONNX, cache); v1.0.0 semana 12 (stems, vocal, mastering); v1.5.0 mês 6 (AI avançada, plugin system); v2.0.0 mês 12 (DAW, colaboração realtime). «PLANO-TECNICO-MASTER.txt:430-445»
ND-2328. Justifique teoria-first e não ML-first: determinismo (mesma seed = mesma música, crítico para games/apps), zero download, <10ms, MIDI editável, sem GPU, offline, composto; IA é camada de enhancement. «PLANO-TECNICO-MASTER.txt:350-370»
ND-2329. Defenda o moat: TypeScript-native, browser+Node+Bun, offline 100%, teoria 15 gêneros, seeded RNG, ontologia 500+ parâmetros, zero API costs, MIT, MIDI editável, híbrido AI+manual, effects embutidos, ~250KB, sem ML dependency no core — nicho não preenchido por nenhum concorrente. «PLANO-TECNICO-MASTER.txt:280-340»
ND-2330. Cumpa benchmarks: core <300KB, full <500KB, primeira nota <100ms, pattern <10ms, MIDI export <50ms, WAV 3min <5s, tree-shaking >80% (só theory ≈20KB), cobertura >80%, tipos 100% (arethetypeswrong), lint 0. «PLANO-TECNICO-MASTER.txt:230-265»
ND-2331. Dimensione adoção alvo: 500 downloads/semana mês 3 → 2.000 mês 6 → 10.000 mês 12; 100→2.000 stars; 5→50 dependents. «PLANO-TECNICO-MASTER.txt:210-225»
ND-2332. Respeite o estado do código: theory.ts 381L ⭐5, harmony.ts 383L ⭐5, melody.ts 433L ⭐4, rhythm.ts 437L ⭐4, instruments.ts 277L ⭐4 (12 melodic + 8 percussion), musicEngine.ts 1003L ⭐3 precisa cleanup — base real de ~2.300 linhas. «PLANO-TECNICO-MASTER.txt:270-295»
ND-2333. Mitigue riscos: escopo DAW (alto/alto — biblioteca estrita, sem UI), Tone.js abandonado (baixo — fork), WebGPU stalls (médio — fallback WASM), qualidade ONNX insuficiente (médio — teoria é o core), dependência LLM (baixa — só parsing). «PLANO-TECNICO-MASTER.txt:390-410»
ND-2334. Estruture módulos npm tree-shakeáveis: @devthink/debonair (full), /theory (0 deps ~20KB), /harmony, /melody, /rhythm, /instruments, /musicEngine. «PLANO-TECNICO-MASTER.txt:375-385»
ND-2335. Ship the foundation first, layer AI on top: o moat é a API composta, tipada, offline-first que nenhum concorrente oferece. «PLANO-TECNICO-MASTER.txt:450-460»

---

## ONDA 4d — stealhead + raiz (fonte: neodocs-txt/outros.stealthhead + raiz)

Governança/ordens do dono 40 · arquitetura/engine/perf 45 · validação/gates
15 · gameplay/tuning 92 · gateway @devthink/ai 50 · Skill Design Universal
(specs CSS: tríade tipográfica, paleta 3+3, 40 efeitos, radius 20-32,
tracking −2/−3%, hero 72-96px, Z-index 0-1000, dark mode) 36 ·
skills/ferramentas 14. StealHead 5.1: 8 fases, cores #ff7a1a/#0d1526,
DB-first mestre+shard, budgets <60 draws/<150k tris/FPS p50≥55, dedup
SHA-256 5.618 arquivos/~317MB, ADR-001..010.


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

---

## FASE 5 — skills de design neoskills (fonte: /home/z/neo/neoskills)

267 regras (ND-4001..4339) + **30 SPECS CSS verbatim** (tokens `:root`,
keyframes riseIn/ping/marq/drawIn/ringHue/orbFloat, receitas CSS prontas de
design-premium/receitas-css.md). Núcleo de valor para a UI do devthink:
- Tema sol curated `{#0B0806 / #F59E0B / #FFFBEB}`
- Timing master de micro-animações (micro 120–250ms, entradas 400–800ms, springs)
- Glass/liquid-glass (blur ≥35%), sidebars magnéticas (indicador deslizante + drawer .55s)
- Kit chat (msg-row/send-pill/prompt-giga/action-pods), abas pill+segmented
- Escada de radius (interno ≤ externo), sombras 5 níveis, bordas gradiente/notch/bevel via mask
- Estados 5+8, ban lists anti-vibe-code 2026
Skills lidos: design/ (SKILL, INDEX, design-system-reference/generation,
canvas-and-device, content-page, deck, export, quality-gate, horizontal-craft,
6 design-systems, 6 design-templates), design-premium/ (SKILL + 4 references),
web-design-guidelines, frontend-design ×2, visual-design-foundations.
Pulados: design-premium/"Nova pasta" (lixo), corpos HTML de templates,
design-systems/index.json, ~150 DESIGN.md menores.

# REGRAS ND (ND-4001 em diante)

## Grupo A — Sistema de design & DESIGN.md

- ND-4001. Trate o design system fornecido pelo usuário como autoridade absoluta: prefira tokens, cores, tipografia, espaçamento, radius, sombras, componentes e padrões exatos do sistema antes de inventar novos elementos visuais. «design/design-system-reference.md:223-235»
- ND-4010. Um DESIGN.md descreve o "porquê" de cada escolha visual, não apenas o "como" — "azul reservado a ações primárias e progresso; radius suave humaniza layout técnico". «design/design-system-generation.md:31-38»
- ND-4011. Registre cores por papel (Background/Text/Accent/Border) com regra de uso e proibição de abuso — não como lista bruta. «design/design-system-generation.md:64-72»
- ND-4012. Limite a hierarquia tipográfica de um sistema a 9-15 níveis semânticos (headline/display/body/label/caption) com título ≈1,9× o corpo, nunca 5×. «design/design-system-generation.md:74»
- ND-4013. Todo DESIGN.md precisa declarar como expressa elevação/profundidade: regra de sombra OU alternativa explícita (borda, contraste de cor, tonalidade). «design/design-system-generation.md:76»
- ND-4014. Defina a linguagem de forma/shape: personalidade (afiada/suave) e política única de radius (ex.: todos os interativos 4px). «design/design-system-generation.md:78»
- ND-4015. Componentes de design system cobrem variantes de estado: primary/secondary, hover/pressed/active, vazio/erro/desabilitado — nunca só o estado default. «design/design-system-generation.md:78»
- ND-4016. Seção de interação/motion do sistema distingue core interactions de efeitos one-off e sempre carrega reduced-motion. «design/design-system-generation.md:80»
- ND-4017. Tokens leves só com valores reais ou inferidos responsavelmente; inferências marcadas; zero precisão falsa. «design/design-system-generation.md:98-133»
- ND-4018. Extraction não é dump de CSS: extraia padrão + valor + intenção, nunca copie cada linha de estilo. «design/design-system-generation.md:140»
- ND-4019. Persistence não vira regra permanente de detalhes one-off: não sobre-ajuste à página atual nem congele experimentos. «design/design-system-generation.md:141»
- ND-4020. Do/Don'ts do sistema devem ser específicos; lista longa e genérica de "não"s indica tema mal descrito. «design/design-system-generation.md:84-88»
- ND-4021. Ancore o tema visual num referencial concreto ("papel de aula de 1970"), nunca em adjetivos ("moderno/limpo/premium"). «design/design-system-generation.md:62»
- ND-4022. Um design system referencial define prioridade: escolha do usuário > sistema do usuário > sistema público > inspiração de marca; nunca carregue múltiplos sistemas sem pedido. «design/design-system-reference.md:435-448»
- ND-4023. Em conflito, conteúdo do usuário vence slots de template; sistema do usuário vence inspiração pública; componente real vence imitação visual. «design/design-system-reference.md:477-501»
- ND-4024. Inspiração de marca extrai só qualidades de alto nível (mood, restraint, densidade, ritmo de espaçamento, temperatura visual); nunca logo, layout proprietário ou claim de sistema oficial. «design/design-system-reference.md:349-368»

## Grupo B — Fluxo de design & portas de qualidade

- ND-4025. Classifique cada pedido como interface (busca consistência → design system) ou criativo (busca impacto → direção original); a escolha governa todo o styling posterior. «design/SKILL.md:84-91»
- ND-4026. Nunca entregue sem rodar o quality-gate como checklist bloqueante — não como leitura passiva. «design/SKILL.md:394-401»
- ND-4027. Produto interativo exige `:focus-visible`; qualquer motion exige reduced-motion; sem esses, não sai. «design/SKILL.md:396-398»
- ND-4028. Proibido em produto publicável: link morto `href="#"`, handler fake (`alert('todo')`), credencial inventada, emoji como ícone, placeholder não marcado. «design/quality-gate.md:44-64»
- ND-4029. A lista anti-slop é bloqueante: sem gradiente azul-roxo default, sem grade de cards de features como filler, sem hero genérico, sem blob decorativo. «design/quality-gate.md:58-64»
- ND-4030. Fontes nomeadas de conteúdo CJK devem estar realmente carregadas (`<link>`/`@font-face`) e a stack contém fonte CJK — nunca cair direto para `system-ui`. «design/SKILL.md:134»
- ND-4031. Organize o HTML gerado com âncoras estáveis (`data-section`, `data-slide`, `data-screen`, `data-component`, `data-state`) para permitir edição local por seleção. «design/SKILL.md:424-434»
- ND-4032. Regra aplicada ≠ regra citada: só declare que um craft foi aplicado se o HTML/CSS/JS realmente o implementa. «design/SKILL.md:392»
- ND-4033. Cada rodada que produz/altera artefato revalida o gate do zero; a oitava rodada é um novo trabalho, não continuação isenta. «design/SKILL.md:403-414»
- ND-4034. Idioma do conteúdo do HTML segue o idioma da conversa; `<html lang>` coerente com o conteúdo. «design/SKILL.md:128-137»
- ND-4035. Template é semente estrutural: jamais clonar DOM, classes, tokens ou placeholder do `pattern.html` — só ritmo de layout, responsividade e interação. «design/SKILL.md:443»
- ND-4036. Técnica avançada (GSAP/3D/shader) só quando serve ao objetivo; default é CSS simples; toda escalada carrega reduced-motion e fallback. «design/horizontal-craft/technique-library.md:27-35»
- ND-4037. "Click-to-expand" é o piso mais baixo de interação; para informação relacional/comparativa use linked-highlight, filtro-recomposição ou modelo slider-driven (nível L2/L3). «design/horizontal-craft/technique-library.md:127-133»
- ND-4038. Todo controle interativo tem mudança visível de saída + acesso por teclado + fallback estático legível; nunca controle fake. «design/horizontal-craft/technique-library.md:197-199»
- ND-4039. Auditoria de UI sob demanda roda Web Interface Guidelines (vercel) em formato `file:linha`. «web-design-guidelines/SKILL.md:10-29»
- ND-4040. Escolha uma direção estética NOMEADA e extrema antes de codificar; intencionalidade vence intensidade. «frontend-design/SKILL.md:12-18»

## Grupo C — Canvas, viewports & export

- ND-4050. Canvas do artefato ≠ tela do device ≠ superfície de export: nunca esticar tudo em cards genéricos. «design/canvas-and-device.md:32-36»
- ND-4051. Registry central de tamanhos: novos presets de plataforma entram em `canvas-and-device.md`, não espalhados pelos skills de artefato. «design/canvas-and-device.md:40-52»
- ND-4052. Viewport defaults: iOS 390×844 (large 430×932, small 375×812), Android 360×800/412×915, tablet 768×1024, desktop 1440×900, dashboard 1440×1024, deck 1600×900, deck HD 1920×1080. «design/canvas-and-device.md:149-173»
- ND-4053. Social square 1080×1080, social portrait 1080×1350, story 1080×1920; long image largura 1080 com altura por conteúdo. «design/canvas-and-device.md:164-173»
- ND-4054. Marcadores de preset declarados via data-attributes (`data-platform`, `data-preset`, `data-export-size`, `data-export-ratio`, `data-viewport`). «design/canvas-and-device.md:56-62, 98-103»
- ND-4055. Frame de device preserva aspect-ratio real, margens de segurança, tap targets legíveis; quando faltar espaço use mini-preview simplificado, nunca distorção. «design/canvas-and-device.md:217-227»
- ND-4056. Em diagramas de fluxo, nodes abstratos para ações menores e preview exato de proporção apenas para telas-chave; nunca desenhe todo estado como phone frame. «design/canvas-and-device.md:284-293»
- ND-4057. Export não é redesign: preserva estado visual atual, sem trocar cores, layout, conteúdo ou somar prova faltante. «design/export.md:74-82, 325-337»
- ND-4058. Screenshot com Playwright: mapeie recursos locais via `page.route()` (CORS de `file://`), Content-Type `font/woff2`, 3-4s de espera de render e screenshot por elemento, não por página. «design/export.md:151-202»
- ND-4059. Export HTML standalone inlineia CSS/JS quando prático e preserva marcadores `data-section`/`data-slide`/`data-component`. «design/export.md:87-99»
- ND-4060. PDF: uma página por slide por default; PPTX sem promessa de fidelidade perfeita a partir de HTML arbitrário. «design/export.md:208-233»
- ND-4061. Validar landing em 375px, 768px e 1280px; screenshots de produto mantêm viewport próprio. «design/canvas-and-device.md:209-213»
- ND-4062. Long image: limites de card estáveis, ritmo vertical consistente, nada dependente de viewport height. «design/canvas-and-device.md:308-314»

## Grupo D — Tipografia

- ND-4070. Medida de leitura controlada dos dois lados: ~30-45 caracteres CJK / 60-75 latinos por linha; coluna ~`clamp` até ~42em (~760px); coluna estreita demais (~480px) é falha tanto quanto full-width. «design/content-page.md:118»
- ND-4071. Line-heights canônicos: headings 1.1-1.3, body 1.5-1.7, labels de UI 1.2-1.4. «visual-design-foundations/SKILL.md:41-46»
- ND-4072. Escala modular por razão matemática (1.2, 1.25, 1.333, 1.414, 1.5, 1.618) a partir de base 16px. «visual-design-foundations/references/typography-systems.md:9-37»
- ND-4073. Tokens de letter-spacing: tighter −0.05em … widest +0.1em; tracking negativo só em display. «visual-design-foundations/references/typography-systems.md:69-76»
- ND-4074. Tipografia fluida com `clamp()` — h1 `clamp(2rem, 5vw+1rem, 4rem)`, parágrafo `clamp(1rem, 1vw+0.75rem, 1.25rem)`. «visual-design-foundations/SKILL.md:147-158»
- ND-4075. Largura ótima de leitura 45-75 caracteres: `.prose { max-width: 65ch }`, callout 50ch, código 80ch. «visual-design-foundations/references/typography-systems.md:216-233»
- ND-4076. Ritmo vertical por baseline grid: margens múltiplos de `--baseline` (1.5rem); use seletores `+ *` para espaçamento entre irmãos. «visual-design-foundations/references/typography-systems.md:235-263»
- ND-4077. `text-wrap: balance` em headings, `text-wrap: pretty` + `widows/orphans: 3` em parágrafos; hifenização só em texto justificado. «visual-design-foundations/references/typography-systems.md:265-293»
- ND-4078. Números de dados usam `font-variant-numeric: tabular-nums` para colunas alinhadas. «visual-design-foundations/references/typography-systems.md:400-421»
- ND-4079. Fonte carregada com `font-display: swap` + fallback com `size-adjust`/`ascent-override` para evitar layout shift; preload só do acima da dobra. «visual-design-foundations/references/typography-systems.md:83-121»
- ND-4080. Limite 2-3 pesos por família de fonte. «visual-design-foundations/SKILL.md:309»
- ND-4081. Tríade tipográfica premium: display 700-900 (cinético), leitura 400-500 line-height 1.6, detalhe 200-300 apenas em micro-labels/tags/consoles — nunca no corpo. «design-premium/SKILL.md:70»
- ND-4082. Máximo 2 famílias por página (+1 script decorativo); MIX-WEIGHT dentro do display permitido. «design-premium/SKILL.md:71»
- ND-4083. Números de tipo: hero 64-96px (mega até 260px), razão 1.25-1.333, tracking display −2~−5%, micro-labels caps +4~+12%, stats 72-96px com tabular-nums e micro-label acima. «design-premium/SKILL.md:73»
- ND-4084. Faces banidas como identidade: Inter, Roboto, system-ui; serifas de livro no corpo; pesos 100/200 em título ou corpo; JetBrains Mono como decoração de display. «design-premium/SKILL.md:75»
- ND-4085. Headlines 32px+ exigem letter-spacing definido; gradient bg-clip em toda headline é ban. «design-premium/SKILL.md:171»
- ND-4086. Fontes declaradas devem ser embutidas no build ("declarated ≠ shipped"); Google Fonts no `<head>` aceito para página single-file. «design-premium/SKILL.md:76»
- ND-4087. Em sistemas com script de traço vertical complexo (Nastaliq/CJK), line-height mínimo do corpo 1.8 e títulos nunca abaixo de 1.4 para não cortar diacríticos. «design-systems/style-skills/urdu/DESIGN.md:131-151»
- ND-4088. Nunca anime `font-weight` (causa layout shift); transicione apenas color/background. «design-systems/style-skills/urdu/DESIGN.md:163-168»
- ND-4089. Onde a família só tem 2 pesos bons (ex.: Noto Nastaliq 400/700), restrinja-se a eles; pesos intermediários degradam o design. «design-systems/style-skills/urdu/DESIGN.md:170-177»
- ND-4090. `text-shadow` em texto de script pontuado é banido (nuqtas desaparecem); sombra só em containers. «design-systems/style-skills/urdu/DESIGN.md:714-721»
- ND-4091. Em UI RTL use propriedades lógicas (`margin-inline-start`, `padding-inline-end`, `inset-inline-start`); proibido hard-code left/right. «design-systems/style-skills/urdu/DESIGN.md:206-217, 931-936»
- ND-4092. `text-overflow: ellipsis` proibido em RTL; use expand-button ou texto completo. «design-systems/style-skills/urdu/DESIGN.md:724-736»

## Grupo E — Cor, paleta & dark mode

- ND-4100. Gere escalas de cor em OKLCH (perceptualmente uniformes): passos L 97%→12% com hue fixo. «visual-design-foundations/references/color-systems.md:9-25»
- ND-4101. Tokens em 2 tiers: primitivos (`--primitive-blue-500`) e semânticos por propósito (`--color-text-primary`, `--color-border-focus`); componentes consomem tier 3 (`--button-bg`, `--input-border-focus`, `--card-shadow`). «visual-design-foundations/references/color-systems.md:67-134»
- ND-4102. Dark mode via `[data-theme="dark"]` + `@media (prefers-color-scheme: dark)` com `:root:not([data-theme="light"])`; tema respeita system e manual override. «visual-design-foundations/references/color-systems.md:140-168»
- ND-4103. Contraste mínimo WCAG: corpo 4.5:1 (AA), texto grande 3:1, componentes 3:1, enhanced 7:1 (AAA). «visual-design-foundations/SKILL.md:175-183»
- ND-4104. Cor de texto acessível automática: luminância do fundo >0.179 → texto escuro `#111827`; caso contrário `#ffffff`. «visual-design-foundations/references/color-systems.md:293-300»
- ND-4105. Não transmita estado só por cor; ícones decorativos `aria-hidden`; gráficos sem info exclusivamente cromática; use azul-laranja em vez de vermelho-verde. «design/quality-gate.md:139-143; visual-design-foundations/references/color-systems.md:382-388»
- ND-4106. Arquitetura de paleta 3+3: 3 cores globais (base escuro profundo #07090E/#0A0D14, acento saturado, neutro luminoso #F0F4F8) + 3 tons harmônicos por seção; zero página branco/cinza chapado. «design-premium/SKILL.md:53»
- ND-4107. Tokens semânticos em OKLCH com papéis (tinta/papel/campo/sinal/alerta/atenuado/linha/profundidade); estados derivam por `color-mix`, dark mode tem rampa própria, AA verificado. «design-premium/SKILL.md:54»
- ND-4108. Sets curados 2026: cyber {#07090E + #7C3AED + #F0F4F8} · nature {#050B08 + #10B981 + #F0FDF4} · solar {#0B0806 + #F59E0B + #FFFBEB} · ocean {#050811 + #06B6D4 + #F0F9FF} · obsidian-violet {#07090E + #6366F1 + #F0F4F8}. «design-premium/SKILL.md:56»
- ND-4109. Regra de um sinal: 1 cor de acento carrega ação+CTA+alerta (regra 90/10); multi-cor só dentro de charts, nunca no chrome. «design-premium/SKILL.md:36»
- ND-4110. Orçamento de gradiente: 1 gradiente por página no total (texto OU página OU painel — nunca 2). «design-premium/SKILL.md:58»
- ND-4111. Hue-gap >20° entre cor primária e acento, senão são uma cor só; glass herda a cor de fundo. «design-premium/SKILL.md:59»
- ND-4112. Rampa de texto em 3 níveis (#111/#9CA3AF/#D1D5DB claro · #0F172A/#64748B/#CBD5E1 slate); branco-sobre-foto exige fade preto de base 58-72% da altura. «design-premium/SKILL.md:61»
- ND-4113. P0: evitar acentos indigo/roxo default #6366f1, #4f46e5, #4338ca, #3730a3, #8b5cf6, #7c3aed, #a855f7 e gradientes roxo→azul/azul→ciano/indigo→rosa sem justificativa de marca. «design/horizontal-craft/anti-ai-slop.md:43-49»
- ND-4114. Preferir território de cor nomeável e metáfora material (papel, tinta, cinábrio, brick, floresta, fósforo, aço, âmbar de terminal) a paleta genérica. «design/horizontal-craft/anti-ai-slop.md:83-89»
- ND-4115. Tokens CSS explícitos em vez de hex mágicos espalhados. «design/horizontal-craft/anti-ai-slop.md:89»
- ND-4116. Dark mode genérico (quase-preto + glow indigo/roxo) é anti-pattern; dark mode precisa da sua própria rampa. «design/horizontal-craft/anti-ai-slop.md:75-76; design-premium/SKILL.md:54»
- ND-4117. Texto mutado de baixo contraste (opacity 0.4-0.6) em dark é falha. «design/horizontal-craft/anti-ai-slop.md:81»
- ND-4118. Status color como fill é ban; status usa dot. «design-premium/SKILL.md:170»
- ND-4119. Todos os pares texto/fundo do sistema verificados WCAG AA 4.5:1 mínimo com ferramenta (getContrastRatio). «design-systems/style-skills/urdu/DESIGN.md:24, 949; visual-design-foundations/SKILL.md:207-225»

## Grupo F — Espaçamento, grid & camadas

- ND-4120. Grid de 8 pontos: `--space-1` 4px → `--space-32` 128px como escala canônica (base 0.25rem). «visual-design-foundations/references/spacing-iconography.md:9-39»
- ND-4121. Tokens semânticos de espaço: xs 4, sm 8, md 16, lg 24, xl 32, 2xl 48, 3xl 64 + papéis inline/stack/inset/section/page. «visual-design-foundations/references/spacing-iconography.md:44-62»
- ND-4122. Espaços por componente: card padding 16-24px, section gap 32-64px, form field gap 16-24px, botão 8-16px vertical × 16-24px horizontal, ícone-texto 8px. «visual-design-foundations/SKILL.md:229-237»
- ND-4123. Espaçamento responsivo por container query (não viewport): `.card { container-type: inline-size }` com padding crescente em 400/600px. «visual-design-foundations/references/spacing-iconography.md:90-110»
- ND-4124. Espaço assimétrico para hierarquia: hero `padding-top: var(--space-24)` / `padding-bottom: var(--space-16)`. «visual-design-foundations/references/spacing-iconography.md:114-119»
- ND-4125. Escala de spacing de marketing: xxs 4 → hero 120px; ritmo de seção 96px em páginas de marketing, 64px em pricing, 32px em docs. «design-systems/brand-inspiration/notion/DESIGN.md:157-169, 559-563; design-systems/brand-inspiration/mintlify/DESIGN.md:551-565»
- ND-4126. Container marketing 1280px com gutters de 32px. «design-systems/brand-inspiration/notion/DESIGN.md:565; design-systems/brand-inspiration/mintlify/DESIGN.md:558»
- ND-4127. Layout docs em 3 colunas: sidebar ~240px, prosa ~720px máx, TOC ~200px. «design-systems/brand-inspiration/mintlify/DESIGN.md:561»
- ND-4128. Respiro de página premium: section padding py-24 a py-36 (96-160px), ritmo espacial 24/32/48/64/96px, bento gap 8-24 denso vs 24-32 showcase; separação por ar, não por caixas. «design-premium/SKILL.md:145»
- ND-4129. Z-bands fixas: 0 atmosfera · 10 conteúdo · 20 consoles/flutuantes · 50 barra fixa (até 1000 para fine-grain). «design-premium/SKILL.md:143»
- ND-4130. Grid 12 colunas com gap 16px como base de layouts complexos. «design-systems/style-skills/urdu/DESIGN.md:249-265»
- ND-4131. Seções consecutivas nunca repetem a mesma fórmula de composição; varie peso óptico, alinhamento e direção. «design-premium/SKILL.md:148»
- ND-4132. Anti-pirâmide: hero centralizado badge→título→subtítulo→botões banido; assimetria deliberada com pesos ópticos desiguais (60/40, 70/30). «design-premium/SKILL.md:149»
- ND-4133. Full-bleed vertical mindset 9:16 ("giant phone page") sem phone frame e sem canvas-in-canvas. «design-premium/SKILL.md:142»

## Grupo G — Radius, bordas & geometria

- ND-4140. Escala de radius padrão: none 0, sm 2px, default 4px, md 6px, lg 8px, xl 12px, 2xl 16px, 3xl 24px, full 9999px + mapeamento por componente (button md, card lg, modal xl, badge full). «visual-design-foundations/references/spacing-iconography.md:404-425»
- ND-4141. Escada de radius premium: chips/ícones pill/squircle · card pequeno 12-16 · médio 20-32 · hero 36-64 · painel/seção 96-320 · container page-in-page 36-48; raio interno ≤ externo (concêntrico). «design-premium/SKILL.md:84»
- ND-4142. Botão/inputs em card-base: 6-8px de radius e borda 1px hairline; sombra dura reservada a assinatura deliberada. «design-systems/style-skills/urdu/DESIGN.md:455-478; design-premium/SKILL.md:98»
- ND-4143. Geometria de botão é assinatura da marca: escolha reto-soberano (8px, estilo Notion) OU pill universal — não misture para a mesma família de componente. «design-systems/brand-inspiration/notion/DESIGN.md:600-602, 764-771; design-systems/brand-inspiration/mintlify/DESIGN.md:596-598»
- ND-4144. Uma linguagem de borda por página (11 idiomas: notched, gate-notch, bevel-45, fold-corner, scallop, hex-mask…); dentro do idioma repita a mesma geometria. «design-premium/SKILL.md:32»
- ND-4145. Cortes servem à função: notch/twin-notch só em cards com header-band; bump convexo sempre topo-esquerda; canto mordido só topo-direita hospedando menu ⋯. «design-premium/SKILL.md:86»
- ND-4146. Máscara bump radial 44px, scallop repeat-x 20px, bevel 14px, fold 34px, hex 6-pontos como receitas prontas. «design-premium/references/receitas-css.md:46-63»
- ND-4147. Borda gradiente via padding + `mask-composite: exclude` (nunca border-image); halo gigante com ::after radial blur. «design-premium/references/receitas-css.md:19-30»
- ND-4148. Blob assimétrico = 1 canto âncora pequeno + 3 curvas grandes (ex.: `24px 200px 280px 64px`). «design-premium/SKILL.md:85; design-premium/references/receitas-css.md:50»
- ND-4149. Hairline inset 1-2px a 10-14% e frame double-decker 6-10px como linguagens de moldura. «design-premium/SKILL.md:87»
- ND-4150. Corner brackets de 14px com borda 1px nas 4 quinas como grampos de viewport/arquivo. «design-templates/industrial-archive/reference.html:324-328»
- ND-4151. Pixel-corner: molduras 4px com box-shadow de steps (4px/8px) e pseudo-corners de 24px para estética 8-bit. «design-templates/ppt/html-ppt-zhangzara-8-bit-orbit/pattern.html:186-241, 271-299»

## Grupo H — Sombras, elevação & glass

- ND-4160. Escada de elevação de 5 níveis: 0 flat (hairline) · 1 sutil `rgba(15,15,15,0.04) 0 1px 2px` · 2 card `rgba(15,15,15,0.08) 0 4px 12px` · 3 mockup `rgba(15,15,15,0.20) 0 24px 48px -8px` · 4 modal `rgba(15,15,15,0.16) 0 16px 48px -8px`. «design-systems/brand-inspiration/notion/DESIGN.md:572-580»
- ND-4161. Sombras premium só layered-soft: `0 8px 30px rgba(0,0,0,.06-.10)` claro · `0 20px 50px -15px rgba(0,0,0,.5-.8)` escuro · drop-shadows tingidos `rgba(accent,.25)`; uma sombra dura por página, só como assinatura em CTA físico. «design-premium/SKILL.md:98»
- ND-4162. Shadow-as-border: `0 0 0 1px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.06), 0 8px 24px -8px rgba(0,0,0,.12)`. «design-premium/references/receitas-css.md:199-202»
- ND-4163. CTA com ring-stack: `0 0 0 6px color-mix(in oklch, sig 55%, transparent), 0 0 0 13px … 26%`. «design-premium/references/receitas-css.md:191-195»
- ND-4164. Glow tingido de marca para destaque de pricing: `rgba(0, 212, 164, 0.08) 0px 8px 24px`. «design-systems/brand-inspiration/mintlify/DESIGN.md:243-248, 577»
- ND-4165. Glass system: fundo hex-alpha (#FFFFFF24 claro / #0F0F13b8 escuro) + backdrop-filter blur(10-22px) + hairline; liquid glass = blur 20-24 + saturate + sombra difusa em camadas + inset highlight; legibilidade exige blur ≥35% do ruído sob o vidro; nunca vidro sobre texto denso. «design-premium/references/receitas-css.md:7-15; design-premium/SKILL.md:97»
- ND-4166. Liquid-glass tokenizado: `--glass-bg rgba(255,255,255,0.08)`, `--glass-border 0.18`, `--glass-highlight 0.25`, `--glass-shadow rgba(0,0,0,0.4)`, `--glass-blur 20px`; estados hover scale 1.04 e active scale 0.98. «design-templates/digital-eguide/case（无限画布：作品集）/case/index.html:14-28, 108-126»
- ND-4167. Header sticky glass: `background: rgba(paper,.88)` + `backdrop-filter: saturate(140%) blur(10px)` com transição para opacidade maior ao scroll. «design-templates/riso-product/reference.html:125-130»
- ND-4168. Light budget: 1 fonte de luz por página (um horizonte, um glow core, um bloom); nunca dois eventos luminosos. «design-premium/SKILL.md:45»
- ND-4169. Uma família de textura/clima por página (paper-light, candy-3D, noir, glass, techno); grain de filme 3-4% em voids escuros. «design-premium/SKILL.md:100, 103»
- ND-4170. Orbs ambientes de fundo: blur 80px, opacity 0.35, 2-3 orbes, animação orbFloat 20-28s ease-in-out infinito alternado. «design-templates/digital-eguide/case（无限画布：作品集）/case/index.html:163-196»

## Grupo I — Movimento & micro-animações

- ND-4180. Cenas têm tier: UI funcional (dashboard/tool/form) — motion só micro-feedback funcional, "minimal" = pass; cena expressiva (brand/campaign/portfolio/hero) — uma entrada coreografada é parte da entrega, página 100% estática = fail. «design/horizontal-craft/animation-discipline.md:8-26»
- ND-4181. Entrada expressiva padrão: `riseIn` translateY(24px)→0, 0.6s `cubic-bezier(0.2,0,0,1)`, stagger 0.05/0.18/0.31/0.44s, tudo anulado sob `prefers-reduced-motion`. «design/horizontal-craft/animation-discipline.md:29-43»
- ND-4182. Limiares de duração: 50-100ms feedback instantâneo · 150ms default de confirmação de estado · 200-300ms entrada de UI (modal/sheet/dropdown) · 300-500ms transição de tela · >500ms reservado a cross-screen. «design/horizontal-craft/animation-discipline.md:88-95»
- ND-4183. Microinterações frequentes ≤200ms; mobile roda 20-30% mais curto que desktop; nada de hover/press/toggle acima de 500ms. «design/horizontal-craft/animation-discipline.md:97-103»
- ND-4184. Curva M3 padrão `cubic-bezier(0.2,0,0,1)` (front-loaded); M2 `cubic-bezier(0.4,0,0.2,1)` é legado — rotular de M3 é erro. «design/horizontal-craft/animation-discipline.md:111-118»
- ND-4185. Timing master premium: micro 120-250ms · entradas 400-800ms com stagger 60-90ms · loops ambientes 8-30s (≥4s) · base ease `cubic-bezier(.2,.8,.2,1)` · springs `cubic-bezier(.2,1.2,.4,1)` 300-560ms · toggle spring `(.34,1.56,.64,1)` 300ms · feedback UI <300ms. «design-premium/SKILL.md:111»
- ND-4186. Doutrina de easing: entrar/sair = ease-out; saída permanente = ease-in; ciclo completo = spring; NUNCA linear em micro, NUNCA ease-in de entrada, NUNCA bounce/elastic fora de contexto candy; transições interrompíveis em propriedades específicas — nunca `all`; entrar de scale .9-.95 + opacity, nunca scale(0). «design-premium/SKILL.md:117»
- ND-4187. Orçamento de motion: 1 idle hero + ≤2 idles secundários por página; demos ≤9s; anime a FUNÇÃO (toggle, contador, cursor), nunca o pano de fundo. «design-premium/SKILL.md:112»
- ND-4188. Keyframes nomeados pela função (orbitSpin, sheen, barTick, cascade); stagger via nth-child com delays negativos; apenas opacity/transform (interrompível). «design-premium/SKILL.md:206»
- ND-4189. Motion loop: carrossel 3-5 ciclos e pausa; shimmer de skeleton só até o conteúdo chegar; spinner para em 60s com erro/retry; reward animação one-shot; WCAG 2.2.2 exige pausa para motion >5s. «design/horizontal-craft/animation-discipline.md:166-175»
- ND-4190. Flash: máx 3 flashes por segundo (WCAG 2.3.1 nível A) — confete/sparkle/bursts one-shot e testados. «design/horizontal-craft/animation-discipline.md:154-162»
- ND-4191. Todo `prefers-reduced-motion` deve remover motion-em-eixo (translate/scale/rotate/parallax) mantendo crossfade de opacidade como substituto; View Transitions API NÃO aplica reduced-motion automaticamente. «design/horizontal-craft/animation-discipline.md:132-145»
- ND-4192. Animação que PERFORMA mudança de estado é erro; otimistic UI primeiro, motion confirma estado já acontecido. «design/horizontal-craft/animation-discipline.md:194»
- ND-4193. Touch set: lift −4px + sombra; press scale .94-.98; arrow-nudge 4px; toggle-flip; squish com `:active`; wobble ±6°. «design-premium/SKILL.md:115»
- ND-4194. Live presence dot: 8px + anel ping 1.4s ease-out infinito (máx 1 por view). «design-premium/references/receitas-css.md:160-167»
- ND-4195. Marquee de faixa: track flex `max-content`, `translateX(-50%)` 22s linear infinito, container overflow hidden com rotate −2°. «design-premium/references/receitas-css.md:83-88; design-templates/riso-product/reference.html:119-122»
- ND-4196. Draw-on-view: `stroke-dasharray/offset 900→0` 1.2s com classe `.on`. «design-premium/references/receitas-css.md:90-96»
- ND-4197. Gauge de anel com `@property --p` + conic-gradient + IntersectionObserver que seta `--p` uma vez; count-up via rAF ease-out-cubic. «design-premium/references/receitas-css.md:34-42»
- ND-4198. Tokens de motion por estilo de deck: slide `cubic-bezier(0.77,0,0.175,1)` 0.9s (deliberado) e entrada `cubic-bezier(0.16,1,0.3,1)` 0.7s (spring-out). «design-templates/ppt/html-ppt-zhangzara-grove/pattern.html:70-77»
- ND-4199. Biblioteca base de keyframes de deck: kFadeUp (28px), kFadeIn, kRevealRight/Left (clip-path inset), kScaleIn (0.94). «design-templates/ppt/html-ppt-zhangzara-grove/pattern.html:205-249»
- ND-4200. Delay de entrada em cascata por atributo `[data-delay="n"]` (0.13s por passo) para coreografia sem CSS extra. «design-templates/ppt/html-ppt-zhangzara-grove/pattern.html:186-204»
- ND-4201. Durações recomendadas por tipo: entrada 300ms ease-out · hover 200ms ease-in-out · saída 200ms ease-in · scroll-reveal 600ms ease-out. «design-systems/style-skills/urdu/DESIGN.md:551-558»
- ND-4202. Cursor custom (dot+ring) com mix-blend-mode multiply/difference, expansão 34→64px em hover e desativação ≤900px. «design-templates/riso-product/reference.html:101-110; design-templates/saas-landing/reference.html:104-118»

## Grupo J — Componentes & estados

- ND-4210. 5 estados obrigatórios em toda superfície que busca/filtra/processa dados: loading, empty, error, populated, edge — render-and-screenshot test em lista, tabela, card, form e painel. «design/horizontal-craft/state-coverage.md:32-42»
- ND-4211. Piso de 8 estados por componente interativo: hover, focus-visible, active, disabled, loading, error, empty, success; URL como estado (deep-link de tudo); zero dead-end. «design-premium/SKILL.md:212»
- ND-4212. Empty tem job: first-use = marca + headline + frase de valor + CTA primário; no-results ecoa a query e sugere alternativas; error-as-empty proibido. «design/horizontal-craft/state-coverage.md:80-86»
- ND-4213. Erro responde: o que aconteceu, por quê (se souber), o que o usuário pode fazer; severidade casada ao escopo (field/form/section/page/app). «design/horizontal-craft/state-coverage.md:89-117»
- ND-4214. Thresholds de loading: 0-300ms nada · 300ms-2s spinner sutil/skeleton · 2-10s skeleton/labelled · 10-30s progress com cancel · 30s+ mensagem "demora" · 60s+ parar animação indefinida. «design/horizontal-craft/state-coverage.md:121-133»
- ND-4215. Validação de form: blur por default; keystroke só após primeiro blur em password/live; remover erro quando válido; preservar input em falha de server; botão em loading evita duplo submit. «design/horizontal-craft/state-coverage.md:63-75»
- ND-4216. ARIA por mudança: erro inline `role="alert"` + foco no primeiro campo; toast `role="status"` sem mover foco; modal crítico `role="alertdialog"` focando o diálogo; loading `role="status"`. «design/horizontal-craft/state-coverage.md:137-145»
- ND-4217. Ação destrutiva tem confirm/undo/prevenção clara; teclado e foco utilizáveis. «design/quality-gate.md:114-121»
- ND-4218. Focus state padrão: `outline: 2px solid var(--accent); outline-offset: 2px` em todo interativo; ring focus-visible ≥3:1. «design-systems/style-skills/urdu/DESIGN.md:583-592; design-premium/SKILL.md:211»
- ND-4219. Input padrão: altura 40-44px, padding `12px 16px`, borda 1px hairline, radius 6-8px, focus com borda 2px no acento + halo `box-shadow: 0 0 0 3px rgba(accent,0.1)`. «design-systems/style-skills/urdu/DESIGN.md:396-421; design-systems/brand-inspiration/notion/DESIGN.md:296-308; design-systems/brand-inspiration/mintlify/DESIGN.md:260-271»
- ND-4220. Placeholder nunca substitui label; label visível + placeholder como exemplo; aria-label só em icon-only. «design-systems/style-skills/urdu/DESIGN.md:426-443, 594-600»
- ND-4221. Botão primário: fundo acento, texto branco, padding 10-12px 18-24px, radius da família, transição 0.2s ease; hover = tom dark; active = opacity .9 ou scale .98; disabled = opacity .5 cursor not-allowed. «design-systems/style-skills/urdu/DESIGN.md:281-332»
- ND-4222. Botão secundário = transparente + borda 2px no primário + hover de tinte 10%; ghost = padding 8px 12px radius sm; link = sem padding com cor de link dedicada distinta da cor primária. «design-systems/style-skills/urdu/DESIGN.md:308-332; design-systems/brand-inspiration/notion/DESIGN.md:210-231, 770-772»
- ND-4223. Card base: padding 24-32px, fundo canvas, borda 1px hairline, radius 12px, sombra nível ≤2; hover eleva translateY(-2px) + sombra nível 2. «design-systems/style-skills/urdu/DESIGN.md:455-478»
- ND-4224. Card de destaque de pricing: fundo surface + borda 2px na cor primária/acento. «design-systems/brand-inspiration/notion/DESIGN.md:286-295; design-systems/brand-inspiration/mistral.ai/DESIGN.md:255-260»
- ND-4225. Tabs em duas gramáticas: pill-tab (rounded full, inativo hairline/steel, ativo fundo ink) e segmented-tab (underline 2px no ativo); escolha uma por contexto e mantenha. «design-systems/brand-inspiration/notion/DESIGN.md:673-680; design-systems/brand-inspiration/mintlify/DESIGN.md:679-686»
- ND-4226. Badge: caption-bold 13px/600, padding 4px 10px (full) ou 2px 8px (tag quadrada), fundo cheio OU tinte pastel com texto dark derivado. «design-systems/brand-inspiration/notion/DESIGN.md:339-380»
- ND-4227. Sidebar de docs: nav item padding 8px 16px radius sm texto steel; ativo = fundo surface + texto ink + peso 500; section header em micro-uppercase 11px com +0.5px tracking. «design-systems/brand-inspiration/mintlify/DESIGN.md:373-387»
- ND-4228. Code block: fundo dark dedicado `#1c1c1e`, texto on-dark, radius 8px, padding 16px, header com caption + copy-button de borda hairline-dark. «design-systems/brand-inspiration/mintlify/DESIGN.md:337-355»
- ND-4229. Tabela de comparação: células body-sm, linhas com borda inferior hairline-soft, padding `16px 20px`; números com tabular-nums. «design-systems/brand-inspiration/notion/DESIGN.md:402-414; design-systems/brand-inspiration/mintlify/DESIGN.md:362-372»
- ND-4230. Chat/AI kit: msg-row · send-pill · prompt-giga (input-herói r-36 + botão GENERATE embutido + chips dot-sep) · action-pods na última fila · doc-float ≤2 · mascot em canto, nunca centro · voice-bubble (▶ + waveform + tempo + reações). «design-premium/SKILL.md:132; design-premium/references/componentes-arquitetura.md:26»
- ND-4231. Nav kit: pill-nav (una/central/bandeau/carrossel-host/floating) · capsule-duo · corner-fusion (logo é o canto) · icon rail · nav-notch-flag (aba desce do teto) · glass-nav-hero · announcement bar; 1 linguagem de nav por página. «design-premium/SKILL.md:127»
- ND-4232. Hero atoms: kicker caps · display com slot/highlight · chip-badge quad · side-number ◎/22 · search-split (input + botão escuro embutido à direita) · email-cápsula (input + CTA no mesmo container) · steps 01-03 · pagers dots/oval/fraction/chevrons. «design-premium/SKILL.md:128»
- ND-4233. Lei do card (disciplina de texto): máx 1 título ultra-curto (1-3 palavras) + 1 frase-efeito OU 1 métrica + micro-label; 3 blocos de texto por card banido; badge-row ≤3 chips. «design-premium/SKILL.md:126»
- ND-4234. Center-pop rail: em fila ≥3 exatamente UM card elevado (+16-30px, z-top, scale 1.04, sombra 48px); 0 elevados = galeria morta, 2+ = caos. «design-premium/SKILL.md:42; design-premium/references/receitas-css.md:169-176»
- ND-4235. Componentes entram no catálogo com ≥2 provas documentadas (regra-δ); nomes engineering-expressive (nav-nexus-hud), nunca "comp-header-001". «design-premium/SKILL.md:122, 134»
- ND-4236. Espinha de página: NAV(tipo) → HERO(estilo) → PROVA(stats/social) → CLUSTER(1) → CTA-band → FOOTER-meta; 1 arquitetura por página. «design-premium/SKILL.md:144»
- ND-4237. Mock de produto social/collab deve viver: sequência ≤3 objetos em loop 8-10s; mock estático = anti-pattern (L12 DEMO-LIVE). «design-premium/SKILL.md:41»
- ND-4238. Sidebar drawer mobile: painel fixed inset-0 `translateX(100%)` → 0 em .55s ease premium, nav 42px com contadores mono. «design-templates/riso-product/reference.html:191-202»
- ND-4239. Sidebar de projeto com indicador magnético: barra 2px que desliza (top/height .55s cubic-bezier(.2,.8,.2,1)) até o item ativo + item ativo com padding-left +14px e underline animado. «design-templates/industrial-archive/reference.html:166-218»
- ND-4240. Icon system: 1 família coerente OU 1 estilo inline SVG custom; emoji como substituto de ícone proibido; sprite `<symbol>`+`<use>`; ícone-xs 12px → 2xl 48px; touch target mínimo 44px. «design/export.md:444-449; visual-design-foundations/references/spacing-iconography.md:139-152»
- ND-4241. Botões/links nunca transicionam `font-weight` nem tudo via `all`; propriedades específicas (color, background, border-color, transform). «design-systems/style-skills/urdu/DESIGN.md:163-168; design-premium/SKILL.md:117»
- ND-4242. Flip 3D de card dupla-face: perspective 600px, preserve-3d, rotateY 0↔180°, backface-visibility hidden, 1.05s `cubic-bezier(.55,.05,.25,1)`. «design-templates/industrial-archive/reference.html:251-281»
- ND-4243. Ticker de metadados: track com padding-left 100% e translateX(-100%) em 70s linear — loop sem salto. «design-templates/industrial-archive/reference.html:104-113»
- ND-4244. Botão com sombra-offset riso: `box-shadow: 5px 5px 0 var(--accent)` que colapsa a 0 com translate(5px,5px) no hover — profundidade física sem blur. «design-templates/riso-product/reference.html:216-229»
- ND-4245. Underline de nav que cresce da direita: `left:0;right:100%` → `right:0` em .35s. «design-templates/riso-product/reference.html:144-145»
- ND-4246. CTA pill atmosférico: borda 1px acento a 45%, radius 100px, letter-spacing 0.3em, 12px, hover inverte fundo. «design-templates/saas-landing/reference.html:247-260»
- ND-4247. Progress de scroll: barra 140×1px com fill acento e contagem `font-feature-settings:'tnum'`. «design-templates/saas-landing/reference.html:283-303»
- ND-4248. Loader de entrada: título por letra com rise 1.1s e delays 0.10s por letra; sub com fade a 0.9s. «design-templates/saas-landing/reference.html:121-162»
- ND-4249. Overlay de página sobre cena: `backdrop-filter: blur(24px)` + fundo a 90% + fade .8s; cena sob ela recebe `filter: blur(14px) brightness(0.32) saturate(0.7)`. «design-templates/saas-landing/reference.html:46-48, 329-339»
- ND-4250. Nav link com doble capa (regular+alt italic serif): translateY(-100%) no hover, .55s `cubic-bezier(.7,.05,.3,1)`. «design-templates/saas-landing/reference.html:82-101»

## Grupo K — Responsividade & acessibilidade

- ND-4260. Gate responsivo premium: mobile-first single column, sem scroll horizontal, nav simples, touch targets 44px, hit ≥24px, safe-areas via `env()`, focus-visible ring ≥3:1, INP ≤200ms com feedback otimista primeiro. «design-premium/SKILL.md:211»
- ND-4261. Breakpoints notion-canônicos: <480 1-col hero 36px · 480-767 cards 2-up hero 48px · 768-1023 hero 56px · 1024-1279 hero 72px · ≥1280 hero 80px. «design-systems/brand-inspiration/notion/DESIGN.md:779-785»
- ND-4262. Colapso padrão: nav → hamburger <1024px; pricing 4-col→2→1; feature 3→2→1; footer 6→3→accordion; pill tabs 32px→44px no mobile. «design-systems/brand-inspiration/notion/DESIGN.md:788-799»
- ND-4263. Breakpoints de templates: ≤1100 encolhe sidebars 220px; ≤820 stage vira 1-coluna com rows explícitas e esconder colunas decorativas. «design-templates/industrial-archive/reference.html:622-641»
- ND-4264. Imagens com dimensões explícitas (zero CLS), subsets de fonte, preload só acima da dobra, vídeo > GIF, animação compositor-friendly, `will-change` com parcimônia. «design-premium/SKILL.md:213»
- ND-4265. Acessibilidade: dois itens sobem a "deve corrigir" — contraste severo que machuca leitura e controle icon-only sem nome acessível; o resto é boa prática anotada. «design/quality-gate.md:134-145»
- ND-4266. Scan obrigatório de emoji visível (U+1F300-1F6FF, U+1F900-1F9FF, U+1FA70-1FAFF, U+2600-26FF, U+2700-27BF, U+2300-23FF, U+FE0F, U+200D) antes da entrega; prioridade de substituto: SVG inline > forma CSS > número tipográfico > label > nada. «design/horizontal-craft/anti-ai-slop.md:259-299»
- ND-4267. Modo movimentação reduzida global: envolver toda animação ambiente em `@media not (prefers-reduced-motion)`; motion nunca é o único portador de informação. «design-premium/SKILL.md:118»

## Grupo L — Proibições de estilo (ban lists)

- ND-4270. Boxception banido: quadro-dentro-de-quadro (border-white/10) enclausurando texto → superfícies contínuas + respiro + sombras difusas. «design-premium/references/antivibe-completo.md:7-8»
- ND-4271. Muleta roxo/azul banida (#7C3AED+#06B6D4 como base universal); fundo 100% #000000 sem luz banido → iluminação radial de estúdio (spots blur-120px, 10-20%). «design-premium/references/antivibe-completo.md:10-11»
- ND-4272. Leiaute vetado: grade igual 3-4 colunas em toda seção · cards ícone-quadrado+título+1 frase · carrossel de depoimentos 5 estrelas + avatar stock · logo cloud inventado · stats bar genérica ("10k usuários, 99.9% uptime, 24/7") · FAQ parafusado no rodapé · rodapé 4 colunas genérico com links mortos · grade de 12 recursos. «design-premium/references/antivibe-completo.md:17-19; design-premium/SKILL.md:167-168»
- ND-4273. Tells de IA 2026 (auditoria P0, zero tolerância): gradiente indigo/violeta→azul default · bg-clip-text em headline genérica · Inter/system como única face · shadcn zinc/radius untouched · hero centrado + pill + 3 cards idênticos · glass reflexivo sobre texto · borda lateral colorida de card · eyebrow ALL-CAPS em tudo · emoji como ícone · Lucide one-per-feature sem coesão · glass+neon juntos · bounce universal · bordas cinza 1px repetidas · fade-slide-up idêntico em toda seção · purple→pink genérico · stock em depoimentos · em-dash overload (>2-3/página) · a11y failing · fonte declarada não embutida · contraste barely-passing no dark. «design-premium/references/antivibe-completo.md:25-27»
- ND-4274. Copy vetada: "desbloquear, elevar, revolucionar, superalimentar, tudo o que você precisa, construído para o moderno, começar, aprender mais"; parágrafos institucionais; slogans redundantes. «design-premium/references/antivibe-completo.md:30-32»
- ND-4275. Anti-literabilidade: nunca renderizar cards literais de "Paleta de Cores"/"Font Selection"/a própria skill como vitrine — diretrizes viram styling aplicado. «design-premium/references/antivibe-completo.md:34-36»
- ND-4276. Processo vetado: gerar sem auto-auditoria · pular refatoração · entregar sem verificação visual renderizada · self-authorize READY · ignorar prefers-reduced-motion · ARIA estático decorativo · foco só por cor · hover sem versão focus · bloquear zoom/paste · scroll horizontal primário · vídeo autoplay com som. «design-premium/references/antivibe-completo.md:38-40»
- ND-4277. Componentes falhos banidos: pill chip com dot colorido como badge universal · botão gradiente primário + ghost outline com peso igual · status pills coloridos para todo estado · CTA plástico redondo com sombra · avatares/quotes falsos · grades de ícones sem informação. «design/horizontal-craft/anti-ai-slop.md:137-147»
- ND-4278. Layouts falhos banidos: Hero→Features→Pricing→FAQ→CTA sem variação · bento sem modularidade real · `max-width:800px;margin:auto;text-align:center` em todas as seções · grades de cards do mesmo tamanho · chrome fake de macOS com traffic lights · nav default monograma+4 links+hairline · device mockup flutuante com reflexão. «design/horizontal-craft/anti-ai-slop.md:113-125»
- ND-4279. Fundo/ textura falhos banidos: grid/dot/line repetido atrás de texto · padrão de alto contraste atrás de body/display · múltiplas camadas de noise · blobs/orbs/anéis flutuantes de preenchimento; permitido: 1 textura material sutil em superfície isolada, hairline de borda, grain de papel quando o mundo visual pede. «design/horizontal-craft/anti-ai-slop.md:221-238»
- ND-4280. Motion falho banido: fade-in em toda seção como única ideia de motion · parallax por default · curvas de bounce em hover · motion de fundo decorativo · animação que atrasa input ou esconde resultado. «design/horizontal-craft/anti-ai-slop.md:202-208»
- ND-4281. Tipografia falha banida: Inter/Roboto/Open Sans/Arial/system-ui como identidade display · Space Grotesk/Fraunces/Playfair como marcador automático de gosto · palavra accent em serif itálico dentro de h1 sans por reflexo · texto gradiente no h1 · ALL-CAPS tracked em toda label · body CJK claro demais em dark. «design/horizontal-craft/anti-ai-slop.md:93-104»
- ND-4282. Conflitos permanentes (~60 pares proibidos) — ex.: neon×papel-creme · hard-shadow×glass · pixel×luz-volumétrica · serif×lime-neon · notched-flag×capsule-nav · gooey×sombra-dura · ácido×cinza-soft · noir×candy (exceto 1 doce) · cluster×cluster · aurora-page×aurora-core; uma linguagem por eixo. «design-premium/references/componentes-arquitetura.md:66-68»
- ND-4283. Limiares numéricos do catálogo: ghost tint ≤25% (30% atrás de devices) · satélites ≤6 · callouts ≤4/foto · onion ≤2 cantos/foto · glass blur ≥35% · doc-floats ≤2 · orbes ≤16 · stack ≤5/6 · fan ≤7 · pill-row ≤5 · genre-ativos ≤3 · tilt-fã ≤±12° · deck stories = 3 exatos. «design-premium/references/componentes-arquitetura.md:70-72»
- ND-4284. 13 Leis do design premium respeitadas por página: 1 cluster-herói ≤7 nós · 1 mega display · 1 cor sinal · 1 ghost · 1 stamp orbitante · 1 borda quebrada (nunca sobre zona funcional) · 1 card elevado em rail · 1 fonte de luz · inline-slot ≤2/linha nunca consecutivos. «design-premium/SKILL.md:30-45»
- ND-4285. Cada página declara UMA tensão assinatura nomeada (ex.: neutro×acento, void-escuro×peach-CTA) citada na entrega. «design-premium/SKILL.md:158-159»
- ND-4286. Receita de estilo: 1 S = 1 paleta + 2-4 geometrias + 3-6 efeitos + 2-4 micro-animações + 1 arquitetura + 1 textura; universalidade Ω/A/C/D decide onde cada item pode ir. «design-premium/SKILL.md:217-223»
- ND-4287. Tema de design definido primeiro como identidade nomeada ("Obsidian Kinetic HUD 2026"); output genérico sem tema banido. «design-premium/SKILL.md:185»
- ND-4288. Dependências só via CDN (jsDelivr/unpkg/esm.sh); prefira SVG inline + CSS a pacotes de ícones; zero install step em demos. «design-premium/SKILL.md:203»
- ND-4289. Page-plan estruturado: JSON `page-plan` em `<script id="page-plan">`, seções envoltas em `<!-- COMPONENT_START/END: id -->` com data-component-id. «design-premium/SKILL.md:191»
- ND-4290. Entrega exige prova de render (browser/screenshot): layout, contraste, motion, estados, reduced-motion — nunca self-authorize READY. «design-premium/SKILL.md:22»
- ND-4291. Design deck: 1 ideia por slide; detalhe do falante vai para notes; nunca inventar dados/quotes; consistência de sistema entre slides; emoji-como-ícone e Lorem ipsum banidos. «design/deck.md:44-68»
- ND-4292. Gráficos honestos: eixos/unidades/escalas corretos, sem truncamento enganoso, título afirma o insight, dados nunca inventados. «design/horizontal-craft/technique-library.md:118-119; design/deck.md:59»
- ND-4293. Conteúdo sem fonte real não fabrica credenciais: métricas, logos, avaliações, prêmios, mídia — tudo placeholder marcado até ter valor real. «design/SKILL.md:295»
- ND-4294. Zone-engine de template deck: zona TOKENS (troque para mudar o estilo — nunca hex/px fora dela) separada de zona ENGINE (não tocar). «design-templates/ppt/html-ppt-zhangzara-grove/pattern.html:28-40»
- ND-4295. Componha com ômega (TOP-24 Ω) quando couber: search-split, CTA-duo, newsletter-capsule, handle-dock, player-chrome, sparkline, callout-chip, lift, stagger, drift, live-pulse, mini-theme-toggle… «design-premium/references/componentes-arquitetura.md:3»
- ND-4296. Roteamento de domínio para estilo-mãe: SaaS-dash → CH-DASH-DATA · IA-builder → prompt-giga · fintech → vault/grad-bleed · social/dating → DEMO-LIVE obrigatório · dark-commerce/NFT → hex-mask+break. «design-premium/SKILL.md:226»
- ND-4297. Dark de advisor/void: void #0B0B10 + CTA peach #F8D9C4 + grad-word rosa→lilás→azul como paleta de referência de dark premium. «design-premium/references/catalogo-estilos.md:96»
- ND-4298. Duotone de foto só via filter chain (sepia/saturate/hue-rotate), sem 3ª cor na tela. «design-premium/SKILL.md:62; design-premium/references/catalogo-estilos.md:98»
- ND-4299. Curated solar (tema sol do devthink): base #0B0806 + acento #F59E0B + tinte luminoso #FFFBEB, com EMBER #FF7A29/#FF5C1F e TANGERINE #F7941D como acentos de sinal alternativos. «design-premium/SKILL.md:56-57»

## Grupo M — Operação, entrega & aplicação de produto

- ND-4300. Stack premium: TypeScript/TSX prioridade; single-file HTML+CSS+JS para demos de landing; React 19 + Tailwind via CDN para canvas previews. «design-premium/SKILL.md:202»
- ND-4301. Resiliência de código: try/catch com console.error específico, parsing defensivo de shapes, fallbacks seguros, abort signals propagados, erro 429/quota com error card estilizado. «design-premium/SKILL.md:209»
- ND-4302. SVG craft: `<symbol>`+`<use>` com CSS var --paint perfurando shadow-DOM para colorways; textPath circular para stamps. «design-premium/SKILL.md:207»
- ND-4303. Bilinguismo PT/EN via endpoint GTX (`translate.googleapis.com/translate_a/single?client=gtx`) respondendo no idioma exato do usuário. «design-premium/SKILL.md:208»
- ND-4304. Checklist-12 de entrega: 1 cor sinal · 1 hero + 1 break · 1 linguagem de borda · ≤1 stamp · live-mock se vende social · ghost ≤30% atrás uma vez · IRL com luz real · center-pop em rails · inline-media ≤1 display · 1 conector (plume OU dashed, nunca 2) · tensão citada + credit quad. «design-premium/SKILL.md:189»
- ND-4305. Pipeline FLUXO-7: BRIEF-parse → âncora de capítulo → estilo-mãe → HERO → mobiliário Ω → LAWS-CHECK → OUTPUT com receitas CSS. «design-premium/SKILL.md:184»
- ND-4306. 10 fases de operação terminam em FARINHA MÁGICA (recalibração óptica, harmonia de contraste, acabamento internacional). «design-premium/SKILL.md:186»
- ND-4307. Motor de ações: planejar 1000+ ações antes de traçar; 400-600 ações por seção com 85-95% cumpridas; régua ≥90% = acabamento pronto. «design-premium/SKILL.md:187»
- ND-4308. Ciclo obrigatório por componente: AUTO-AUDIT → REFACTOR → POLISH → FARINHA MÁGICA; entrega afobada sem auditoria banida. «design-premium/SKILL.md:188»
- ND-4309. Tipos de canvas declarados (CV-WEB r 24-48 · CV-APP com notch/safe-area · CV-POSTER mega+meta · CV-COMPONENT · CV-BRAND bento · CV-SHOT +credit · CV-ICON-GALLERY densidades 6/12/84 = 1 estilo). «design-premium/SKILL.md:150»
- ND-4310. Família de empilhamento em 5 modos (alturas crescentes, coluna sobreposta, color-deck, month-crop, diagonal-stair) escolhida pela ordem de leitura. «design-premium/SKILL.md:147»
- ND-4311. Shelf de heróis nomeados (SPLIT-RAIL, CINEMATIC-SANDWICH, FOTO-EDITORIAL, RHYTHM A/B, STAGE-SHELL, SPLAT-HERO, ANCHOR-FAN, PROMPT-STAGE, PAGE-IN-PAGE) — hero nunca improvisado. «design-premium/SKILL.md:146»
- ND-4312. Referências de imagem inspiram apenas extração de técnica; jamais copiar cards/layouts/produtos — mesmas técnicas, composição nova. «design-premium/SKILL.md:17»
- ND-4313. Ritual de mapeamento em lotes de 10 imagens: fichas por imagem → LEDGER com provas/merges → novos estilos → receitas CSS → correlações → contagem de status. «design-premium/SKILL.md:192-193»
- ND-4314. Quality gate TIER 2 roda só o que o artefato tem (tabela: texto CJK→typography; charts→visual-explanation; forms→form-validation; dashboards→state-coverage; CTAs→link-and-proof; motion→animation-discipline). «design/quality-gate.md:80-95»
- ND-4315. TIER 3 (polish: ritmo, seção genérica, motion mais proposital, chart simplificável) anota no sumário e nunca bloqueia. «design/quality-gate.md:149-159»
- ND-4316. A checagem de qualidade é interna: rodar mas não relatar a lista ao usuário — entregue o produto, não o processo. «design/quality-gate.md:176-182»
- ND-4317. Matriz de edge cases: dashboard 10k+ linhas · título 200-char sem avatar · form com máximos · busca de 1 char e 1000+ resultados · strings longas mistas — layout não quebra. «design/horizontal-craft/state-coverage.md:48-56»
- ND-4318. Toast pausável em hover/focus; loading de seção nunca substitui o chrome da página inteira. «design/horizontal-craft/state-coverage.md:155-158»
- ND-4319. Página de conteúdo tem 7 batidas de ritmo (entry → orientation → body rhythm → pause points → evidence → transitions → ending) — parede de parágrafos é falha. «design/content-page.md:186-196»
- ND-4320. Um dispositivo editorial primário por página (pull quote, side note, evidence card, timeline, data insert…) — ele vem do conteúdo, não é enfeite. «design/content-page.md:136-154»
- ND-4321. Toda figura tem razão, caption e status de fonte (provided|placeholder) em data-attributes. «design/content-page.md:156-164, 302-305»
- ND-4322. O final da página é escolhido pelo conteúdo (conclusão, implicação, checklist, apêndice, nota de versão) — CTA genérica default banida. «design/content-page.md:165-179»
- ND-4323. Modelo de layout único e comprometido: Classic Reading / Editorial Feature / Report-Dossier / Newsletter-Brief / Guide / Mobile Article. «design/content-page.md:213-272»
- ND-4324. Em páginas visuais da full build, planeje estrutura imagem+texto desde o início; placeholder elegante (proporção certa, fundo suave, rótulo "[imagem]") em vez de parede de texto. «design/SKILL.md:420»
- ND-4325. Version-management roda quando e só quando a entrega contém arquivo de entrada web (.html/.jsx/.tsx/.vue). «design/SKILL.md:449-453»
- ND-4326. Export de deck preserva ordem, `data-slide`, notas, navegação por teclado; PDF 1 slide/página; PPTX mantém texto editável quando possível. «design/export.md:373-385»
- ND-4327. Export de protótipo preserva estados interativos, marcadores, navegação e fixtures; nunca colapsa fluxo em imagem estática sem pedido. «design/export.md:389-398»
- ND-4328. Handoff estruturado via JSON com sections, slides, parameters, assumptions, placeholders e generation trace. «design/export.md:236-253»
- ND-4329. Design spec/handoff operacional inclui: sistema de referência, componentes maiores, estados de interação, responsividade, placeholders conhecidos e open questions — sem essay. «design/export.md:270-286»
- ND-4330. Licenças de terceiros preservadas ao exportar assets vendored (THIRD_PARTY_NOTICES.md, sem remover copyright); fonte do ambiente só se o usuário forneceu. «design/export.md:340-355, 412-419»
- ND-4331. Efeito primeiro: não degradar qualidade para "fugir de copyright" — estilo é livre; asset real protegido usa placeholder digno + 1 aviso de uso; nunca falsificar "oficial". «design/SKILL.md:463-469»
- ND-4332. Aliases legados roteiam: xiaohongshu-card→social-card, tool-h5→web-tool; chinese-copy/execution-checklists removidos — checks canônicos vivem em SKILL.md + quality-gate.md. «design/INDEX.md:24, 86-89»
- ND-4333. Entre gerações varie tema claro/escuro, fontes e estética; nunca convergir para escolhas comuns (ex.: Space Grotesk). «frontend-design/SKILL.md:35-37»
- ND-4334. Complexidade de implementação casa com a visão estética: maximalismo pede código elaborado; minimalismo pede restraint e precisão em espaço/tipografia/detalhe. «frontend-design/SKILL.md:39»
- ND-4335. Boas práticas de foundations: estabeleça constraints, documente decisões em style guide vivo, tokens semânticos nomeados por propósito (não aparência), mobile-first, magic numbers banidos, estados sempre incluídos. «visual-design-foundations/SKILL.md:301-318»
- ND-4336. Display mono-editorial de referência: serif display 84px/400 (PP Editorial Old) + Inter para UI + JetBrains Mono para código; display serif nunca bold. «design-systems/brand-inspiration/mistral.ai/DESIGN.md:55-80, 89-99»
- ND-4337. Dual-mode dark-teal: acento verde-pill #00ed64 sobre ink #001e2b com texto on-primary escuro; código em Source Code Pro 14px/1.55. «design-systems/brand-inspiration/mongodb/DESIGN.md:8-16, 100-160»
- ND-4338. Acento canário sobre canvas branco (#ffd02f em #1c1c1e) com botão black-pill e tipografia geométrica arredondada — par neutro+1 sinal. «design-systems/brand-inspiration/miro/DESIGN.md:6-10, 48-54, 172-189»
- ND-4339. Política no-hover de documentação de sistema: só estados default e pressed/active documentados; hover fica para o runtime. «design-systems/brand-inspiration/notion/DESIGN.md:606-608; design-systems/brand-inspiration/mintlify/DESIGN.md:606-608»

---

### SPECS CSS (blocos verbatim — ver onda5-design-css.md § SPECS CSS para os 30 blocos completos)

# SPECS CSS (blocos verbatim dos skills)

## SPEC 1 — Variáveis-base premium (receita-core)
Fonte: «design-premium/references/receitas-css.md:3»
```css
/* Variáveis-padrão: --sig (acento) · --page · --ink · --r (raio) */
:root {
  --sig: #F59E0B;                 /* exemplo solar (curated set) */
  --page: #0B0806;
  --ink: #FFFBEB;
  --r: 20px;
  --ease: cubic-bezier(.2,.8,.2,1);
  --spring: cubic-bezier(.2,1.2,.4,1);
  --spring-soft: cubic-bezier(.34,1.56,.64,1);
}
```

## SPEC 2 — Glass system (3 variantes)
Fonte: «design-premium/references/receitas-css.md:7-15»
```css
.glass { background: #FFFFFF24; backdrop-filter: blur(12px); border: 1px solid #FFFFFF2B; }
.glass-panel { background: rgba(255,255,255,.66); backdrop-filter: blur(22px); } /* light over photo */
.glass-dark { background: #0F0F13b8; backdrop-filter: blur(10px); }
.liquid-glass { background: rgba(255,255,255,.05); backdrop-filter: blur(24px) saturate(1.2);
  border: 1px solid rgba(255,255,255,.10);
  box-shadow: 0 20px 50px -15px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.12); }
/* legibility: blur >= 35% of noise underneath; never glass over dense text */
```

## SPEC 3 — Borda gradiente anelada (E-243)
Fonte: «design-premium/references/receitas-css.md:19-30»
```css
.grad-ring { position: relative; padding: 2.5px; border-radius: inherit; }
.grad-ring::before {
  content: ""; position: absolute; inset: 0; border-radius: inherit; padding: 2.5px;
  background: linear-gradient(90deg, var(--sig), #F2955C, var(--sig));
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude;
  animation: ringHue 6s linear infinite;
}
@keyframes ringHue { to { filter: hue-rotate(360deg); } }
/* giant hero variant: + ::after halo radial blur(28px) z-index:-1 */
```

## SPEC 4 — Gauge anel @property (MA-184)
Fonte: «design-premium/references/receitas-css.md:34-42»
```css
@property --p { syntax: '<number>'; inherits: false; initial-value: 0; }
.ring-gauge {
  background: conic-gradient(var(--sig) calc(var(--p)*1%), rgba(255,255,255,.08) 0);
  border-radius: 50%; transition: --p 1.5s cubic-bezier(.2,.8,.2,1);
}
.ring-gauge::before { content: ""; position: absolute; inset: 18%; background: var(--card); border-radius: 50%; }
/* JS: IntersectionObserver seta style.setProperty('--p', dataset.p) visível; count-up rAF ease-out-cubic */
```

## SPEC 5 — Máscaras notch/bump/scallop
Fonte: «design-premium/references/receitas-css.md:46-53»
```css
/* bump convexo top-left (aba pintada pelo wrapper bg) */
.notch-bump { -webkit-mask: radial-gradient(circle 44px at 0 0, transparent 43px, #000 44px); }
/* concave scoop herdando o bg da página */
.blob-scoop { border-radius: 24px 200px 280px 64px; }
/* bordas scallop */
.scallop { -webkit-mask: radial-gradient(circle 10px at 10px 0, transparent 9px, #000 10px) repeat-x; -webkit-mask-size: 20px 100%; }
```

## SPEC 6 — Cortes bevel/fold/hex (clip-path)
Fonte: «design-premium/references/receitas-css.md:57-63»
```css
.bevel-45 { clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%); }
.fold-corner { clip-path: polygon(0 0, calc(100% - 34px) 0, 100% 34px, 100% 100%, 0 100%); position: relative; }
.fold-corner::after { content: ""; position: absolute; top: 0; right: 0; border-style: solid;
  border-width: 0 34px 34px 0; border-color: var(--page) var(--page) rgba(0,0,0,.18) transparent; }
.hex-mask { clip-path: polygon(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%); }
```

## SPEC 7 — Ghost type (L9)
Fonte: «design-premium/references/receitas-css.md:67-72»
```css
.ghost { position: absolute; font-weight: 900; font-size: clamp(88px, 22vw, 260px);
  color: var(--ink); opacity: .08; letter-spacing: -.02em;
  pointer-events: none; user-select: none; z-index: 0; }
/* tint 8–25%; sempre cortado por overflow do container ou borda do viewport */
```

## SPEC 8 — Marquee strap (E-187)
Fonte: «design-premium/references/receitas-css.md:84-88»
```css
.strap { overflow: hidden; transform: rotate(-2deg); }
.strap-track { display: flex; width: max-content; animation: marq 22s linear infinite; }
@keyframes marq { to { transform: translateX(-50%); } }
```

## SPEC 9 — Draw-on-view (MA-18)
Fonte: «design-premium/references/receitas-css.md:92-96»
```css
.draw { stroke-dasharray: 900; stroke-dashoffset: 900; }
.draw.on { animation: drawIn 1.2s var(--ease) forwards; }
@keyframes drawIn { to { stroke-dashoffset: 0; } }
```

## SPEC 10 — Gloss-jelly button (TX-97)
Fonte: «design-premium/references/receitas-css.md:115-122»
```css
.gloss-jelly { background: linear-gradient(120deg, #FF8A65, #5C6BC0);
  border-radius: 999px; position: relative;
  box-shadow: inset 0 4px 8px #fff8, inset 0 -8px 12px #0007, 0 10px 24px rgba(0,0,0,.25); }
.gloss-jelly::before { content: ""; position: absolute; inset: 4px 8px auto 8px; height: 38%;
  border-radius: 999px; background: linear-gradient(rgba(255,255,255,.65), transparent); }
.gloss-jelly:active { transform: scale(.94) translateY(2px); transition: transform .12s; }
```

## SPEC 11 — Live pulse dot (MA-185)
Fonte: «design-premium/references/receitas-css.md:162-167»
```css
.live-dot { width: 8px; height: 8px; border-radius: 50%; background: #EA4560; position: relative; }
.live-dot::after { content: ""; position: absolute; inset: -4px; border-radius: 50%;
  border: 1.5px solid #EA4560; animation: ping 1.4s ease-out infinite; }
@keyframes ping { 0% { transform: scale(.6); opacity: 1; } 100% { transform: scale(1.8); opacity: 0; } }
```

## SPEC 12 — Center-pop rail (L13)
Fonte: «design-premium/references/receitas-css.md:171-176»
```css
.rail .card { transition: transform .35s var(--spring), box-shadow .35s; }
.rail .card.on { transform: translateY(-22px) scale(1.04); z-index: 2;
  box-shadow: 0 24px 48px rgba(0,0,0,.25); }
.rail:hover .card.on:not(:hover) { filter: saturate(.7) brightness(.94); }
```

## SPEC 13 — Ring-Stack CTA + shadow-as-border
Fonte: «design-premium/references/receitas-css.md:191-203»
```css
.ring-cta { box-shadow: 0 0 0 6px color-mix(in oklch, var(--sig) 55%, transparent),
                        0 0 0 13px color-mix(in oklch, var(--sig) 26%, transparent); }

.engined { box-shadow: 0 0 0 1px rgba(0,0,0,.08),
  0 1px 2px rgba(0,0,0,.06), 0 8px 24px -8px rgba(0,0,0,.12); }
.premium-card { box-shadow: 0 40px 80px rgba(12,16,32,.18), 0 0 0 5px color-mix(in oklch, var(--sig) 18%, transparent); }
```

## SPEC 14 — Motion tuning kit (lift/press/enter)
Fonte: «design-premium/references/receitas-css.md:207-215»
```css
.lift { transition: transform .25s var(--ease), box-shadow .25s var(--ease); }
.lift:hover { transform: translateY(-4px); box-shadow: 0 12px 28px rgba(0,0,0,.14); }
.press:active { transform: scale(.96); }
.enter { opacity: 0; transform: translateY(24px) scale(.97); }
.enter.on { animation: rise .5s var(--ease) forwards; animation-delay: calc(var(--i)*70ms); }
@keyframes rise { to { opacity: 1; transform: none; } }
@media not (prefers-reduced-motion) { /* toda animação ambiente dentro */ }
```

## SPEC 15 — Grain / halftone / binary floors
Fonte: «design-premium/references/receitas-css.md:219-225»
```css
.grain::after { content: ""; position: absolute; inset: 0; opacity: .035; pointer-events: none;
  background-image: url("data:image/svg+xml,..."); } /* svg noise */
.halftone { background: radial-gradient(#c 1.4px, transparent 1.8px) 0 0/9px 9px;
  -webkit-mask: radial-gradient(120px at 0% 0%, #000, transparent); } /* corner fade, ≤2/page */
.binary { writing-mode: vertical-rl; opacity: .06; font: 10px monospace; }
```

## SPEC 16 — Grid de 8 pontos + tokens semânticos
Fonte: «visual-design-foundations/references/spacing-iconography.md:9-62»
```css
:root {
  --space-unit: 0.25rem; /* 4px */
  --space-1: var(--space-unit); /* 4px */  --space-2: calc(var(--space-unit)*2); /* 8px */
  --space-4: calc(var(--space-unit)*4); /* 16px */ --space-6: calc(var(--space-unit)*6); /* 24px */
  --space-8: calc(var(--space-unit)*8); /* 32px */ --space-12: calc(var(--space-unit)*12); /* 48px */
  --space-16: calc(var(--space-unit)*16); /* 64px */ --space-24: calc(var(--space-unit)*24); /* 96px */
  --spacing-inline: var(--space-2); --spacing-stack: var(--space-4); --spacing-inset: var(--space-4);
  --spacing-section: var(--space-16); --spacing-page: var(--space-24);
}
```

## SPEC 17 — Escala de radius por componente
Fonte: «visual-design-foundations/references/spacing-iconography.md:406-425»
```css
:root {
  --radius-none: 0; --radius-sm: 0.125rem; --radius-default: 0.25rem; --radius-md: 0.375rem;
  --radius-lg: 0.5rem; --radius-xl: 0.75rem; --radius-2xl: 1rem; --radius-3xl: 1.5rem;
  --radius-full: 9999px;
  --radius-button: var(--radius-md); --radius-input: var(--radius-md);
  --radius-card: var(--radius-lg); --radius-modal: var(--radius-xl); --radius-badge: var(--radius-full);
}
```

## SPEC 18 — Dark mode em 2 tokens de tema
Fonte: «visual-design-foundations/SKILL.md:185-202» (+ variante color-systems.md:140-168)
```css
:root {
  --bg-primary: #ffffff; --bg-secondary: #f9fafb;
  --text-primary: #111827; --text-secondary: #6b7280; --border: #e5e7eb;
}
[data-theme="dark"] {
  --bg-primary: #111827; --bg-secondary: #1f2937;
  --text-primary: #f9fafb; --text-secondary: #9ca3af; --border: #374151;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) { --bg-primary: #111827; /* ... valores dark */ }
}
```

## SPEC 19 — Escala OKLCH perceptual
Fonte: «visual-design-foundations/references/color-systems.md:11-24»
```css
:root {
  --blue-50: oklch(97% 0.02 250);  --blue-100: oklch(93% 0.04 250);
  --blue-200: oklch(86% 0.08 250); --blue-300: oklch(75% 0.12 250);
  --blue-400: oklch(65% 0.16 250); --blue-500: oklch(55% 0.2 250); /* Primary */
  --blue-600: oklch(48% 0.18 250); --blue-700: oklch(40% 0.16 250);
  --blue-800: oklch(32% 0.12 250); --blue-900: oklch(25% 0.08 250); --blue-950: oklch(18% 0.05 250);
}
```

## SPEC 20 — Entrada coreografada stagger + reduced-motion
Fonte: «design/horizontal-craft/animation-discipline.md:29-43»
```css
@keyframes riseIn {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
.rise { opacity: 0; animation: riseIn 0.6s cubic-bezier(0.2, 0, 0, 1) forwards; }
.rise-1 { animation-delay: 0.05s; } .rise-2 { animation-delay: 0.18s; }
.rise-3 { animation-delay: 0.31s; } .rise-4 { animation-delay: 0.44s; } /* hero → tagline → subject → CTA */
@media (prefers-reduced-motion: reduce) { .rise { animation: none; opacity: 1; transform: none; } }
```

## SPEC 21 — Frames de device com aspect-ratio
Fonte: «design/canvas-and-device.md:244-280»
```css
.phone-frame { width: min(390px, 100%); aspect-ratio: 390 / 844; }
.phone-frame[data-size="ios-large"] { width: min(430px, 100%); aspect-ratio: 430 / 932; }
.phone-frame[data-size="android"]   { width: min(360px, 100%); aspect-ratio: 360 / 800; }
.desktop-frame   { aspect-ratio: 1440 / 900; }
.dashboard-frame { aspect-ratio: 1440 / 1024; }
.social-card[data-ratio="3:4"] { aspect-ratio: 3 / 4; }
.social-card[data-ratio="4:5"] { aspect-ratio: 4 / 5; }
```

## SPEC 22 — Botões + input focus (sistema RTL/urdu, genérico)
Fonte: «design-systems/style-skills/urdu/DESIGN.md:281-306, 411-415»
```css
.button-primary {
  background: var(--color-primary); color: white;
  padding: 12px 24px; border: none; border-radius: 6px;
  font-size: 16px; font-weight: 700; cursor: pointer;
  transition: background 0.2s ease;
}
.button-primary:hover   { background: var(--color-primary-dark); }
.button-primary:active  { opacity: 0.9; }
.button-primary:disabled{ opacity: 0.5; cursor: not-allowed; }
.input:focus {
  outline: none; border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(15, 89, 94, 0.1);
}
```

## SPEC 23 — Tokens liquid-glass do guia (case portfólio)
Fonte: «design-templates/digital-eguide/case（无限画布：作品集）/case/index.html:13-28»
```css
:root{
  --bg: #0a0a0c;  --ink: #eae6df;  --ink-soft: #6e6a63;  --line: #222020;
  --pill: #eae6df; --pill-ink: #0a0a0c;
  --glass-bg: rgba(255,255,255,0.08); --glass-border: rgba(255,255,255,0.18);
  --glass-highlight: rgba(255,255,255,0.25); --glass-shadow: rgba(0,0,0,0.4);
  --glass-blur: 20px; --accent: #c9a87c;
}
```

## SPEC 24 — Tokens de deck Grove (Zona A)
Fonte: «design-templates/ppt/html-ppt-zhangzara-grove/pattern.html:36-100»
```css
:root {
  --c-bg: #192b1b; --c-bg-alt: #1e3221; --c-bg-light: #e8e4d6; --c-bg-light-alt: #dedad0;
  --c-fg: #d4cfbf; --c-fg-2: rgba(212,207,191,.6); --c-fg-3: rgba(212,207,191,.32);
  --c-fg-light: #192b1b; --c-fg-light-2: rgba(25,43,27,.58);
  --c-accent: #c8524a;
  --c-border: rgba(212,207,191,.12); --c-border-light: rgba(25,43,27,.14);
  --f-display: "Playfair Display","Noto Serif SC",Georgia,serif;
  --f-body: "Jost","Noto Sans SC",system-ui,sans-serif; --f-mono: "JetBrains Mono",monospace;
  --sz-display: 10vw; --sz-h1: 5.5vw; --sz-h2: 3.2vw; --sz-h3: 2vw;
  --sz-lead: 1.45vw; --sz-body: 1.05vw; --sz-caption: 0.82vw; --sz-label: 0.7vw;
  --pad-x: 8vw; --pad-y: 6.5vh; --gap-lg: 4.5vh; --gap-md: 2.8vh; --gap-sm: 1.4vh;
  --ease-slide: cubic-bezier(0.77,0,0.175,1); --dur-slide: 0.9s;
  --ease-enter: cubic-bezier(0.16,1,0.3,1); --dur-enter: 0.7s;
}
```

## SPEC 25 — Riso: texto e botão com sombra-offset
Fonte: «design-templates/riso-product/reference.html:38-57, 216-229»
```css
:root{
  --ink:#1B1A18; --paper:#F1EBDA; --line:#C9BFA3; --muted:#7A7361;
  --pink:#FF3F8E; --blue:#2240FF; --yellow:#FFD23A;
  --ease:cubic-bezier(.2,.8,.2,1);
}
.btn{ display:inline-flex; align-items:center; gap:14px; padding:16px 28px;
  font-size:14px; font-weight:600; letter-spacing:.05em; border-radius:999px;
  transition:all .25s var(--ease); position:relative; overflow:hidden; border:2px solid var(--ink); }
.btn--ink{ background:var(--ink); color:var(--paper); box-shadow:5px 5px 0 var(--pink); }
.btn--ink:hover{ background:var(--pink); color:var(--paper); box-shadow:0 0 0 var(--pink); transform:translate(5px,5px); }
```

## SPEC 26 — Flip 3D de capa (archive)
Fonte: «design-templates/industrial-archive/reference.html:251-281»
```css
.cover-stage { position:absolute; inset:0; perspective:600px; transform-style:preserve-3d; }
.cover-flipper { position:absolute; inset:0; transform-style:preserve-3d;
  transform: translateZ(0) rotateY(0deg);
  transition: transform 1.05s cubic-bezier(.55,.05,.25,1); will-change: transform; }
.cover-face { position:absolute; inset:0; backface-visibility:hidden; isolation:isolate;
  background-image:linear-gradient(180deg,#bcc2ca 0%,#a4abb4 100%);
  box-shadow: inset 0 0 0 1px rgba(12,15,20,.32), inset 0 -60px 80px -40px rgba(12,15,20,.22),
              0 28px 60px -22px rgba(12,15,20,.55); }
.cover-face.front { transform: rotateY(0deg); }
.cover-face.back  { transform: rotateY(180deg); }
```

## SPEC 27 — Notion: tokens de componentes (frontmatter)
Fonte: «design-systems/brand-inspiration/notion/DESIGN.md:6-54, 147-169, 171-209»
```yaml
colors: { primary: "#5645d4", primary-pressed: "#4534b3", brand-navy: "#0a1530",
  canvas: "#ffffff", surface: "#f6f5f4", hairline: "#e5e3df", hairline-strong: "#c8c4be",
  ink: "#1a1a1a", charcoal: "#37352f", semantic-error: "#e03131" }
rounded: { xs: 4px, sm: 6px, md: 8px, lg: 12px, xl: 16px, full: 9999px }
spacing: { xxs: 4px, xs: 8px, sm: 12px, md: 16px, lg: 20px, xl: 24px, xxl: 32px,
  section: 64px, section-lg: 96px, hero: 120px }
button-primary: { backgroundColor: "{colors.primary}", padding: "10px 18px", rounded: "{rounded.md}" }
```

## SPEC 28 — Mintlify: sidebar + tabs + code
Fonte: «design-systems/brand-inspiration/mintlify/DESIGN.md:9-14, 337-355, 373-403, 679-689»
```yaml
brand-green: "#00d4a4"   # acento reservado a CTA/estado ativo/checkmarks
sidebar-nav-item: { padding: "{spacing.xs} {spacing.md}", rounded: "{rounded.sm}", textColor: "{colors.steel}" }
sidebar-nav-item-active: { backgroundColor: "{colors.surface}", textColor: "{colors.ink}" }
segmented-tab-active: { border: "0 0 2px {colors.ink} solid" }
pill-tab-active: { backgroundColor: "{colors.primary}", rounded: "{rounded.full}" }
code-block: { backgroundColor: "#1c1c1e", rounded: "{rounded.md}", typography: "{typography.code-md}" }
```

## SPEC 29 — Curated solar (tema sol) + acentos EMBER/TANGERINE
Fonte: «design-premium/SKILL.md:56-57»
```css
:root {
  --page: #0B0806;      /* solar base */
  --sig:  #F59E0B;      /* solar accent */
  --tint: #FFFBEB;      /* solar luminous tint */
  /* acentos de sinal alternativos: EMBER #FF7A29/#FF5C1F · TANGERINE #F7941D */
}
```

## SPEC 30 — Onions/gate/stomp + toggle sem JS
Fonte: «design-premium/references/receitas-css.md:100-111, 155-157»
```css
.onion i { position:absolute; inset:0; border-radius:40px; }
.onion i:nth-child(2){ inset:10px; border-radius:32px; transition-delay:.09s; }
.onion i:nth-child(3){ inset:20px; border-radius:24px; transition-delay:.18s; }
.gate::after { content:"▾"; animation: nudge 2s var(--ease) infinite; }
@keyframes nudge { 50% { transform: translateY(4px); } }
.stomp.on { animation: stomp .4s var(--spring); }
@keyframes stomp { 0% { transform: translateY(10px) scale(.9); opacity:0; } 60% { transform: translateY(-2px); } }
.theme-toggle:checked ~ .stage img { filter: brightness(1.15) saturate(.6); }
.stage img { transition: filter .6s var(--ease); }
```

---

## FASE 6a — anotepad + notes + aiactions (fonte: neodocs-txt/outros.anotepad + Note_*.txt raiz)

331 regras (ND-5001..5331): A gateway/baseurl (ordens raiz + todos.txt) 139 ·
B CLI Z.AI↔OpenCode (v888/v899/R4455) 51 · C aiactions (60+ skills, protocolo
12 passos) 60 · D arquitetura multi-agente (injeção de contexto forçada,
agentLoop) 18 · E plataforma/Supabase/planos (rt5y, 30+ apps) 46 ·
F notes app + segurança + operação 17.
Pulados: bundles React minificados, duplicatas corrompidas, stubs, lockfiles.


### A. Gateway/Baseurl V1/V2/V3 — ordens-mestra (raiz, julho/2026)

ND-5001. Ler atenciosamente palavra por palavra a instrução e fazer o mesmo para o objetivo do texto já na execução do objetivo. «Note_07_24_2026_06_21_37.txt:6»
ND-5002. Tratar TODAS as 18 rotas como gateway/baseurl que repassam — nenhuma é endpoint final. «Note_07_24_2026_06_21_37.txt:13»
ND-5003. Travar o escopo em 28 arquivos: 18 rotas + 2 libs (db, cdn) + package.json + tsconfig + prisma config + shim + prisma schema + page.tsx + globals.css + layout.tsx. «Note_07_24_2026_06_21_37.txt:13»
ND-5004. Antes de modificar, olhar todos os commits (objetos, refs, heads, trees, logs) e o conversa.md. «Note_07_24_2026_06_21_37.txt:13»
ND-5005. Não mexer em next.config, Caddyfile, bun.lock e nunca abrir .npmrc. «Note_07_24_2026_06_21_37.txt:13,27»
ND-5006. Tratar utils.ts como helper simples de clsx/scsx — não é lib completa, não mexer. «Note_07_24_2026_06_21_37.txt:27»
ND-5007. Executar análise, leitura e descompactação em /tmp fora de myproject; criação final apenas na raiz de myproject. «Note_07_24_2026_06_21_37.txt:19»
ND-5008. Não cair em falso positivo do conversa.md: analisar, ver, raciocinar, testar e validar contra o zip e os commits. «Note_07_24_2026_06_21_37.txt:23»
ND-5009. Atualizar o tsconfig para o pattern 2026 com target/lib esnext ou o mais moderno. «Note_07_24_2026_06_21_37.txt:27»
ND-5010. Manter todas as dependências na última versão com engines (node, bun, npm) e package manager (bun) no package.json. «Note_07_24_2026_06_21_37.txt:16,27»
ND-5011. Ler commit por commit, arquivo por arquivo no zip; não confiar em MDs, workbooks, worklogs e códigos soltos. «Note_07_24_2026_06_21_37.txt:27»
ND-5012. Usar scripts inteligentes com z.ai web sdk, muito glob e grep, lendo hierarquicamente de cima pra baixo e de baixo pra cima. «Note_07_24_2026_06_21_37.txt:31»
ND-5013. Ler o conversa.md em partes de 300 linhas, uma por uma, SEM subagentes na primeira leitura. «Note_07_24_2026_06_21_37.txt:35»
ND-5014. Produzir erros.md e features.md do conversa.md (ordens vão para features (ordens).md). «Note_07_24_2026_06_21_37.txt:35»
ND-5015. Delimitar conversas pelo marcador glm5.2: de glm5.2 até o próximo glm5.2 é uma conversa distinta. «Note_07_24_2026_06_21_37.txt:35»
ND-5016. Reescrever todas as 6 rotas de V1, V2 e V3 novinhas em folha, evitando todos os erros.md e aplicando todas as features.md. «Note_07_24_2026_06_21_37.txt:38»
ND-5017. Implementar anti-429/419 e mais de 100 códigos de erro de api/baseurl (streaming, json bad request, parser json). «Note_07_24_2026_06_21_37.txt:38»
ND-5018. Manter keepalive de 200ms e espaço mínimo de 200ms entre requisições; tudo salvo e exportado pelo db. «Note_07_24_2026_06_21_37.txt:38»
ND-5019. Padronizar e sincronizar as rotas entre si com um único design pattern por versão. «Note_07_24_2026_06_21_37.txt:38»
ND-5020. Escrever código sem underscores, sem emojis, em lowercase e no padrão JSDoc. «Note_07_24_2026_06_21_37.txt:38»
ND-5021. Suportar 40+ métodos HTTP e 7 níveis de raciocínio em todas as rotas. «Note_07_24_2026_06_21_37.txt:38,55»
ND-5022. Mapear TODOS os erros e features do conversa.md sem excluir, substituir ou remover nenhum. «Note_07_24_2026_06_21_37.txt:43»
ND-5023. Criar timeline.md reconstruindo a linha do tempo hierarquicamente, do mais crucial ao menor detalhe, referenciando a posição de cada erro/feature. «Note_07_24_2026_06_21_37.txt:47»
ND-5024. Preparar todo list interna de 900 itens antes de criar os arquivos finais. «Note_07_24_2026_06_21_37.txt:47»
ND-5025. Ligar dev server na porta 3000 e na ~21000, cadastrar as chaves Nvidia e fazer prisma db push antes dos testes. «Note_07_24_2026_06_21_37.txt:51»
ND-5026. Testar todas as rotas na sequência curl → agent browser → caddyfile com o dev server ligado. «Note_07_24_2026_06_21_37.txt:51»
ND-5027. Simular conversa agêntica e testar os métodos HTTPS antes de concluir o projeto. «Note_07_24_2026_06_21_37.txt:51»
ND-5028. Limpar caches antigos, builds antigos e esvaziar /tmp ao concluir. «Note_07_24_2026_06_21_37.txt:51»
ND-5029. Diferenciar versões: V1 (ZAI Web SDK/GLM-5.2) sem chave; V2 (Babel Town) e V3 (Nvidia) com chave. «Note_07_24_2026_06_21_37.txt:55»
ND-5030. Manter o pensamento sempre ligado em toda requisição de toda rota, sem exceção, com thinking budget forte. «Note_07_24_2026_06_21_37.txt:55»
ND-5031. Proibir thinking_instructions e thinking_format em qualquer rota. «Note_07_24_2026_06_21_37.txt:16,55»
ND-5032. Limitar o package.json a 0-30 (ou 0-75) dependências leves e colocar as 1200+ pacotes pesadas no cdn.ts, que não entra no package.json. «Note_07_24_2026_06_21_37.txt:55»
ND-5033. Manter exatamente 3 libs em lib/: cdn.ts, db.ts e utils.ts. «Note_07_24_2026_06_21_37.txt:55»
ND-5034. Garantir Prisma schema com mais de 400 entradas. «Note_07_24_2026_06_21_37.txt:55»
ND-5035. Implementar o modelo DevThink na V3 com contexto compartilhado, troca de chave a cada requisição, troca de modelo a cada 6 mensagens e persistência no DB com mesma sessionId. «Note_07_24_2026_06_21_37.txt:55»
ND-5036. Oferecer 42+ modelos na V3: devthink + embeddings individuais + modelos individuais separados. «Note_07_24_2026_06_21_37.txt:55»
ND-5037. Tratar cdn.ts como package.json adicional que carrega do esm.sh e exporta client-side. «Note_07_24_2026_06_21_37.txt:55»
ND-5038. Emitir sempre input → output de pensamento → output de resposta. «Note_07_24_2026_06_21_37.txt:55»
ND-5039. Auto-corrigir automaticamente qualquer valor ou parâmetro errado (autofix) e repassar o válido. «Note_07_24_2026_06_21_37.txt:13,38»
ND-5040. Baixar todos os wormholes via agent-browser e extrair em pastas isoladas em /tmp. «Note_07_27_2026_02_27_36.txt:1-2»
ND-5041. Validar integridade dos zips: 10k+ arquivos, 6k-12k objetos, 173-900 commits, 2k-10k blobs, 16-90 branches, 91-200 tags. «Note_07_27_2026_02_27_36.txt:3»
ND-5042. Criar /scripts na raiz de myproject para split de 300 linhas com overlap 1-10%, grep, dedup e leitura hierárquica. «Note_07_27_2026_02_27_36.txt:4»
ND-5043. Coletar (não catalogar) todos os erros, features e logs antes de qualquer implementação. «Note_07_27_2026_02_27_36.txt:5»
ND-5044. Ler bidirecionalmente (cima→baixo e baixo→cima) linha por linha, palavra por palavra, sem lacuna de contexto. «Note_07_27_2026_02_27_36.txt:6»
ND-5045. Travar escopo nas rotas v1/v2/v3 em subpastas, cdn.ts, db.ts, prisma/schema.prisma, prisma.config.ts, eslint.config, package.json e shim+ensure-shim mesclados. «Note_07_27_2026_02_27_36.txt:10»
ND-5046. Proibir route.ts solto fora de subpastas, trustedDependencies, middleware e duplicação de código/arquivo. «Note_07_27_2026_02_27_36.txt:11»
ND-5047. Mapear 100% das features e ordens sem excluir/substituir/remover, com alvo de 393+ em 15 categorias. «Note_07_27_2026_02_27_36.txt:15»
ND-5048. Hierarquizar os 295-400+ erros de P0 crítico a P3 cosmético. «Note_07_27_2026_02_27_36.txt:16»
ND-5049. Derivar a checklist interna de 900+ itens exclusivamente dos arquivos lidos. «Note_07_27_2026_02_27_36.txt:18»
ND-5050. Manter 0-70 dependências leves no package.json (limite rígido), todas na última versão, sem rollback. «Note_07_27_2026_02_27_36.txt:20»
ND-5051. Não remover nenhuma dependência do primeiro commit original; manter e atualizar para latest. «Note_07_27_2026_02_27_36.txt:21»
ND-5052. Incluir Prisma 7 + Prisma Client + Prisma adapter SQL + Prisma libSQL (4+ pacotes Prisma). «Note_07_27_2026_02_27_36.txt:22»
ND-5053. Definir package.json: name @devthink/ai; engines node 24.6.0/26.4.0, npm 12.0.1/11.17.0, bun 1.3.14; packageManager bun@1.3.14 no final. «Note_07_27_2026_02_27_36.txt:23»
ND-5054. Padronizar scripts: dev, start, build next -p 3000, node-dev, shim. «Note_07_27_2026_02_27_36.txt:24»
ND-5055. Instalar os ~20 SDKs essenciais (openai, anthropic, ai, opencode, z-ai-web-dev-sdk, smol-toml, request-ip, @radix-ui/shadcn) e trocar localforage por Map em memória. «Note_07_27_2026_02_27_36.txt:25»
ND-5056. Configurar tsconfig pattern 2026: target esnext/ES2024-26, lib esnext+dom+dom.iterable+webworker, module esnext/nodenext, moduleResolution bundler/node16, strict true, extends @tsconfig/node26. «Note_07_27_2026_02_27_36.txt:26»
ND-5057. Mesclar shim e ensure-shim em um único arquivo scripts/shim.js (ou .cjs se type:module), sem shim fora de scripts/. «Note_07_27_2026_02_27_36.txt:27»
ND-5058. Configurar cdn.ts com 1700+ entradas esm.sh, uma única versão por pacote (a mais atual), helper loadFromCDN e cache Map. «Note_07_27_2026_02_27_36.txt:30»
ND-5059. Manter db.ts apenas com PrismaClient + adapter SQL + singleton, sem PrismaClient em module load time, com cold-start fix, usando @/lib/db em todas as rotas. «Note_07_27_2026_02_27_36.txt:31»
ND-5060. Agregar 500+ entradas no Prisma schema de todos os commits sem remover nada; generator sem output e datasource sem url (Prisma 7 adapter). «Note_07_27_2026_02_27_36.txt:32»
ND-5061. Tornar obrigatórios os campos Prisma: route, reasoningContent, keyId, reasoningEffort, reasoningLevel, modelVariant, inputTokens, outputTokens, stopSequence, active, lastUsed, rotationCount, ipUsed, responseId, objectId, systemFingerprint, serviceTier, cachedTokens, firstTokenMs, startedAt, completedAt, completion, annotations, sources, toolCalls, logprobs, responseHeaders, retries, response. «Note_07_27_2026_02_27_36.txt:33»
ND-5062. Corrigir @@index([odel]) para @@index([model]). «Note_07_27_2026_02_27_36.txt:34»
ND-5063. Seguir o fluxo canônico de todas as rotas: input cliente → autofix → fetch na baseURL oficial → retorno upstream → save no DB → streaming de volta (fetch duplo). «Note_07_27_2026_02_27_36.txt:36-37»
ND-5064. Aplicar Uptime KeepAlive 200ms com header connection: keep-alive timeout=200; intervalo V1 200ms, V3 200-500ms; pausa de 1 min entre blocos anti-429/419. «Note_07_27_2026_02_27_36.txt:38»
ND-5065. Suportar 40+ métodos HTTP com OPTIONS 204 CORS e PUT/DELETE/PATCH 405. «Note_07_27_2026_02_27_36.txt:39»
ND-5066. Fazer V2 cair automaticamente para V1 quando estiver offline/indisponível. «Note_07_27_2026_02_27_36.txt:41»
ND-5067. Implementar o fluxo de renovação de chave da V2: navegação com IP novo, captura, set DB; 60 min ou bad-request reinicia sessão e limpa caches. «Note_07_27_2026_02_27_36.txt:42»
ND-5068. Usar base URL /v1 na V3 (nunca /chat/completions ou /embeddings direto); embeddings se adaptam automaticamente ao setar /v1. «Note_07_27_2026_02_27_36.txt:43»
ND-5069. Padronizar 7 níveis de pensamento: none, minimal, low, medium, high, xhigh, max. «Note_07_27_2026_02_27_36.txt:46»
ND-5070. Limitar V1 a 98k thinking + 98k response com autofix para 98k quando ultrapassar; parâmetro aceito: thinking {type: "enabled"|"disabled"}, sem level/budget_tokens top-level. «Note_07_27_2026_02_27_36.txt:47»
ND-5071. Limitar V2 e V3 a 68k thinking + 68k resposta. «Note_07_27_2026_02_27_36.txt:48»
ND-5072. Tratar tokens de pensamento, resposta e total como distintos; total = thinking + response. «Note_07_27_2026_02_27_36.txt:49»
ND-5073. Emitir SSE exato OpenAI: role, reasoning_content, keepalive delta {}, content, finish e [DONE] único. «Note_07_27_2026_02_27_36.txt:50-51»
ND-5074. Aplicar defaults: top_p 1, top_k 40, temp 1, reasoning_effort low/high, max_tokens 98304, CONTEXT_WINDOW 1000000 em GET /v1/models. «Note_07_27_2026_02_27_36.txt:52»
ND-5075. Emitir reasoning_content na NVIDIA via chat_template_kwargs.thinking_mode / enable_thinking / thinking conforme o modelo, nunca top-level (causa erro 400). «Note_07_27_2026_02_27_36.txt:54»
ND-5076. Centralizar autofix sem whitelist, blacklist, listas hardcoded ou mock — só sintaxe e lógica inteligentes. «Note_07_27_2026_02_27_36.txt:56»
ND-5077. Normalizar casing/acentos/underscore para lowercase válido com normalizeParamName + Levenshtein. «Note_07_27_2026_02_27_36.txt:57»
ND-5078. Aplicar clamping: acima do limite vai para max com margem 1%, abaixo de zero vai para zero, typo vai para o válido mais próximo, string numérica vira float, true/false viram boolean. «Note_07_27_2026_02_27_36.txt:58»
ND-5079. Implementar anti-429: retry 2-8×, backoff exponencial 200ms-64s, jitter 75-125%, respeitar Retry-After, pacing 200-1200ms, cooldown reativo, mutex MAX_CONCURRENT 1 e fila waiters. «Note_07_27_2026_02_27_36.txt:60»
ND-5080. Construir parser SSE robusto: split por data:, brace-depth com in_string/escaped, extract_all_json, buffer incompleto e detecção de [DONE] em depth 0 fora de string. «Note_07_27_2026_02_27_36.txt:61»
ND-5081. Corrigir os críticos: Controller already closed (safeEnqueue/safeClose), OOM top-level ZAI SDK, [DONE] duplicado, \u0001, ipUsed vs ipused, thinkingEnabled duplicado, PrismaLibSQL → PrismaLibSql. «Note_07_27_2026_02_27_36.txt:62»
ND-5082. Adaptar o ZAI Web SDK (não 100% compatível OpenAI/Anthropic): aceitar o padrão da rota, traduzir para o que o SDK aceita e devolver no padrão selecionado. «Note_07_27_2026_02_27_36.txt:63»
ND-5083. Substituir TransformStream pipeThrough por ReadableStream manual com pump getReader loop async e drain keepalive. «Note_07_27_2026_02_27_36.txt:66»
ND-5084. Implementar makeSse com flush rest e writeSSE com \n\n flush síncrono e keepalive 200ms. «Note_07_27_2026_02_27_36.txt:67»
ND-5085. Implementar makeThinker com 4 métodos sem format instruction: reasoning_content nativo, regex <thinking>, MARKER Resposta Final/Portanto/Logo/Conclusão/Resultado e auto-injeção proporcional. «Note_07_27_2026_02_27_36.txt:68»
ND-5086. Implementar parser XML ANY_TAG_RE removendo tags e preservando math, com PARTIAL_TAG_RE, trim_partial_tag e clean_xml. «Note_07_27_2026_02_27_36.txt:69»
ND-5087. Operar V1 em 2 chamadas: Call1 thinking ON gera reasoning real, Call2 OFF gera resposta; totalOut dinâmico = T_OUT + R_OUT. «Note_07_27_2026_02_27_36.txt:71»
ND-5088. Repassar automaticamente em tempo real o thinking output e o response output assim que começarem a ser produzidos. «Note_07_27_2026_02_27_36.txt:73»
ND-5089. Detectar o formato de input (openai chat.completions, anthropic messages, responses) e converter para OpenAI; output source-of-truth chat.completion.chunk. «Note_07_27_2026_02_27_36.txt:75-76»
ND-5090. Entregar saída on-the-fly nos 3 formatos base + 20 SDKs compatíveis, conforme a rota pedida. «Note_07_27_2026_02_27_36.txt:77»
ND-5091. Repassar fetch puro sem reconversão desnecessária na V3 NVIDIA e V2 Babel Town (já são OpenAI-compatible). «Note_07_27_2026_02_27_36.txt:78»
ND-5092. Exportar models em JSON válido nos formatos OpenAI, Anthropic e correlatos. «Note_07_27_2026_02_27_36.txt:79»
ND-5093. Nomear o meta-modelo apenas como DevThink — nenhum outro nome. «Note_07_27_2026_02_27_36.txt:81»
ND-5094. Compartilhar contexto via DB na mesma sessionId no DevThink, salvando input, output e thinking a cada requisição. «Note_07_27_2026_02_27_36.txt:82»
ND-5095. Rotacionar trocando chave a cada requisição (pool 22-25 chaves NVIDIA) e modelo a cada 6 mensagens round-robin por sessionId. «Note_07_27_2026_02_27_36.txt:83»
ND-5096. Disponibilizar individualmente os 7 modelos de rotação DevThink para o usuário setar diretamente. «Note_07_27_2026_02_27_36.txt:84»
ND-5097. Exigir total maior que 65 modelos individuais: 52 embeddings + 7 DevThink + demais individuais. «Note_07_27_2026_02_27_36.txt:85»
ND-5098. Remover deepseek-ai/deepseek-r1 de todas as rotas V3, cdn.ts e prisma enum, impedindo autofix para r1. «Note_07_27_2026_02_27_36.txt:86»
ND-5099. Adicionar/preservar poolside/laguna-xs-2.1 (enable_thinking, 262k), deepseek-v4-flash/pro (thinking, 1M) e stepfun-ai/step-3.7-flash. «Note_07_27_2026_02_27_36.txt:87»
ND-5100. Recalcular o max context da V3 e aumentar o contexto DevThink proporcionalmente até 2.6M+. «Note_07_27_2026_02_27_36.txt:88»
ND-5101. Manter 6-7 labels por modelo, todas lowercase e sem underscores. «Note_07_27_2026_02_27_36.txt:89»
ND-5102. Rodar embeddings da V3 em endpoint próprio sobre a base URL /v1, sem lógica extra. «Note_07_27_2026_02_27_36.txt:90»
ND-5103. Manter dentro de v1/v2/v3 apenas subpastas com route.ts (proibido route.ts solto). «Note_07_27_2026_02_27_36.txt:92»
ND-5104. Criar no mínimo 7 rotas por versão: chat/completions, completions, embeddings, keys, messages, models, responses. «Note_07_27_2026_02_27_36.txt:93»
ND-5105. Definir na rota models os IDs dos modelos usados pelas demais rotas do grupo, sincronizando intra-versão. «Note_07_27_2026_02_27_36.txt:94»
ND-5106. Extrair 22-25 chaves NVIDIA dos blobs (chaves.txt), deduplicar e cadastrar no DB com round-robin. «Note_07_27_2026_02_27_36.txt:97»
ND-5107. Garantir endpoints mínimos: GET / 200, /v1/models 200, /v3/models 200, /v3/keys 200; POST /v1/chat/completions 200 JSON válido (nunca HTML 502); POST 429 JSON com Retry-After. «Note_07_27_2026_02_27_36.txt:101»
ND-5108. Passar os verificadores: npx tsc --noEmit 0 erros, bun lint/eslint 0 erros, build 0 erros. «Note_07_27_2026_02_27_36.txt:102»
ND-5109. Cobrir nos testes os erros bad-request 400/409/412/419/429/410/411, JSON parse e model is not found. «Note_07_27_2026_02_27_36.txt:104»
ND-5110. Testar as rotas uma a uma com delay — nunca todas de uma vez. «Note_07_27_2026_02_27_36.txt:106»
ND-5111. Fazer build e deploy de teste em /tmp para detectar dependências faltantes do original. «Note_07_27_2026_02_27_36.txt:107»
ND-5112. Unificar definitivamente commits do repo + zip e todos os arquivos src/raiz/lib/prisma sem remover feature lógica. «Note_07_27_2026_02_27_36.txt:109»
ND-5113. Mover os finais de /tmp para src e manter apenas o build final validado. «Note_07_27_2026_02_27_36.txt:110»
ND-5114. Limpar ao final: .next, .turbo, node_modules/.cache, tsconfig.tsbuildinfo, caches /tmp, zips, tars, upload/, db/*.db, tool-results/ e caches de 40+ frameworks. «Note_07_27_2026_02_27_36.txt:111»
ND-5115. Parar o dev server após os testes e esvaziar /tmp mantendo apenas build final + erros.md + features.md + timeline.md. «Note_07_27_2026_02_27_36.txt:112»
ND-5116. Medir sucesso pela gateway funcional nas 21 rotas (7×3), thinking always-on, autofix sem hardcode e DB persistence completa. «Note_07_27_2026_02_27_36.txt:114-118»
ND-5117. Medir sucesso por 70+ modelos V3 (1 meta + 14 individuais + 55 embeddings) e 25 chaves NVIDIA ativas rotacionando. «Note_07_27_2026_02_27_36.txt:118-119»
ND-5118. Garantir Lint 0, build 0, endpoints 200/204 — nunca HTML 502. «Note_07_27_2026_02_27_36.txt:120»
ND-5119. Transmitir em tempo real sem travas: não acumular buffer e soltar de uma vez; a live de V1 e V3 precisa retransmitir todo o conteúdo em real time. «Note_07_28_2026_02_45_49.txt:1»
ND-5120. Localizar src fora de api (não dentro de pastas api), validando pelos commits antigos. «Note_07_28_2026_02_45_49.txt:111»
ND-5121. Considerar anoa como package.json adicional sem trustedDependencies e sem arquivos adicionais. «Note_07_28_2026_02_45_49.txt:122»
ND-5122. Executar em modo triplo a leitura do conversa: (1) pessoal sem subagentes, (2) 60-70 subagentes paralelos, (3) ambos para validação cruzada. «Note_07_24_2026_08_07_48.txt:100»
ND-5123. Proibir a leitura de markdowns antigos dos commits (única exceção: conversa.md como fonte de verdade). «Note_07_24_2026_08_07_48.txt:82»
ND-5124. Mergear as 500+ dependencies + 300-600 dev deps + CDN numa lista única e filtrar para 30-60 deps finais leves, movendo as pesadas para cdn.ts. «Note_07_24_2026_08_07_48.txt:157»
ND-5125. Padronizar scripts com next -p 3000: dev → next dev -p 3000, start → next start -p 3000, build → next build. «Note_07_24_2026_08_07_48.txt:156»
ND-5126. Embutir todo código extra das libs antigas em cdn.ts e db.ts — proibida a 4ª lib. «Note_07_24_2026_08_07_48.txt:167»
ND-5127. Manter apenas V1 e V3 ativos no roteamento final; V2 existe mas retorna offline/fallback. «Note_07_24_2026_08_07_48.txt:196»
ND-5128. Não preencher o cdn.ts com versões antigas — um nome só por pacote, sempre a versão mais atualizada. «todos.txt:105-108»
ND-5129. Fazer o return/export devolver no formato ideal: padrão OpenAI, Anthropic, Responses, Embeddings, Completions com JSON bem formado. «todos.txt:60-62»
ND-5130. Entregar streaming em text/event-stream (não JSON puro), com keepalive 200ms e espaço de 200ms entre requisições. «todos.txt:64-67»
ND-5131. Limitar os tokens de pensamento da V1 no próprio backend quando o ZAI Web SDK não expuser parâmetro para isso. «todos.txt:68»
ND-5132. Sincronizar as rotas dentro de cada versão: elas interagem entre si e completam a interação umas das outras. «todos.txt:99»
ND-5133. Analisar o ZAI Web SDK por completo para descobrir quais parâmetros ele aceita de thinking/tokens antes de implementar os limites. «todos.txt:87-88»
ND-5134. Corrigir as faltas atuais da V3: embeddings ausentes, 7 individuais ausentes e os 7 modelos do DevThink ausentes. «todos.txt:115-119»
ND-5135. Baixar e ler errros.features.ordens.md de cima a baixo e seguir à risca depois de analisar o zip por completo. «todos.txt:110-113»
ND-5136. Resolver os problemas de transmissão, parser, streaming e os 400+ erros possíveis mapeados em todas as rotas. «todos.txt:114»
ND-5137. Escrever todo list com "- [ ]" antes de cada frase, corrigindo ortografia, gramática e pontuação, agrupando por categoria sem remover contexto. «todos.txt:8-20»
ND-5138. Mesclar palavras, sentidos e lógicas duplicadas; reagrupar lógicas correlatas de forma ordinal e hierárquica. «todos.txt:12-19»
ND-5139. Estruturar textos com começo, meio e fim, diretos, claros e objetivos, sem redundância ou enrolação. «todos.txt:20-27»

### B. Plugin/CLI Z.AI ↔ OpenCode (v888, v899, Note 02/27-02/28, R4455)

ND-5140. Construir a interação CLI↔navegador (z.ai): o usuário digita no CLI e a resposta aparece no navegador aberto, capturada, logada e transmitida sem loops nem duplicações. «v888-j6xmx4xa.txt:10-17»
ND-5141. Proibir emojis, ASCII art, bugs de transmissão, loops de resposta, bugs de páginas e de ID no CLI. «v888-j6xmx4xa.txt:19-28»
ND-5142. Criar uma nova página com novo ID único a cada novo chat no CLI. «v888-j6xmx4xa.txt:26»
ND-5143. Detectar tool_call corretamente e traduzir para OpenAI SDK, executando a ferramenta LOCALMENTE — nunca fingir que criou arquivo. «v888-j6xmx4xa.txt:33-34»
ND-5144. Não usar comandos /zai no OpenCode CLI (não suporta comandos customizados). «v888-j6xmx4xa.txt:36-37»
ND-5145. Detectar modo Plan vs Build pelo contexto da requisição, não por keywords soltas. «v888-j6xmx4xa.txt:39-40»
ND-5146. Ativar Agent Mode automaticamente quando houver tools na requisição. «v888-j6xmx4xa.txt:42-43»
ND-5147. Retornar formato OpenAI SDK compatível com a estrutura do OpenCode CLI. «v888-j6xmx4xa.txt:45-46»
ND-5148. Separar phase="thinking" de phase="answering" no streaming. «v888-j6xmx4xa.txt:48-49»
ND-5149. Usar finish_reason="tool_calls" para forçar o OpenCode CLI a executar comandos. «v888-j6xmx4xa.txt:53-54»
ND-5150. Enviar somente a última mensagem do usuário — nunca o textão/histórico completo. «v888-j6xmx4xa.txt:56-57»
ND-5151. Manter a sessão no mesmo chat: nova conversa no CLI = novo chat no z.ai com novo ID; nunca loop no mesmo chat ID. «v888-j6xmx4xa.txt:59-60»
ND-5152. O OpenCode CLI executa as tools — o plugin não executa por ele. «v888-j6xmx4xa.txt:62-63»
ND-5153. Conectar ao Brave existente na porta 9223 via puppeteer.connect; abrir novo navegador apenas se não existir conexão. «v888-j6xmx4xa.txt:66-69»
ND-5154. Usar perfil dedicado ~/.config/opencode/brave-zai-profile para não interferir no uso normal do navegador. «v888-j6xmx4xa.txt:67»
ND-5155. Manter sessão do navegador persistente com reconexão automática; nunca criar novo navegador/aba a cada mensagem. «v888-j6xmx4xa.txt:68-74»
ND-5156. Usar puppeteer-extra com Stealth Plugin, headless=false e automação desabilitada (--enable-automation removido, AutomationControlled oculto). «v888-j6xmx4xa.txt:72-74»
ND-5157. Aplicar timeout de 180s para respostas e cache de cookies para reconexão rápida. «v888-j6xmx4xa.txt:75-76»
ND-5158. Normalizar caminhos remotos para WORKSPACE_DIR (/home/z/workspace/, /workspace/, /project/) com path.join, preservando a estrutura de diretórios e proibindo arquivos fora do workspace. «v888-j6xmx4xa.txt:84-92»
ND-5159. Parsear o formato novo content_blocks com fallback para o formato antigo delta_content; ignorar blocks type="reasoning" e processar type="text" e type="tool_calls". «v888-j6xmx4xa.txt:96-99»
ND-5160. Montar o chunk OpenAI SDK completo: id chatcmpl-*, object chat.completion.chunk, created, model zai-glm-5, choices[].delta.role/content/tool_calls, finish_reason null durante stream e stop/tool_calls no final. «v888-j6xmx4xa.txt:115-135»
ND-5161. Enviar Content-Type text/event-stream com prefixo "data: ", newline por chunk e "data: [DONE]" único no final. «v888-j6xmx4xa.txt:136-139»
ND-5162. Enviar mensagens via clipboard (click count 3, Backspace, navigator.clipboard.writeText, Ctrl+V, Enter) — nunca page.type, que é lento. «v888-j6xmx4xa.txt:141-148»
ND-5163. Extrair token do cookie "token" ou header Authorization, salvar cookies completos no auth e reusar token entre requisições no estado global. «v888-j6xmx4xa.txt:150-157»
ND-5164. Centralizar todo o estado em um objeto state (browser, page, token, chatId, mode, processedTools) sem variáveis soltas. «v888-j6xmx4xa.txt:158-164»
ND-5165. Adicionar instruções de tools ao prompt somente quando houver tools, no formato tool_call, com prompt minimalista. «v888-j6xmx4xa.txt:166-173»
ND-5166. Logar modo ativado, chat ID criado, tool executada, arquivo criado e comando bash — logs concisos, sem spam. «v888-j6xmx4xa.txt:183-188»
ND-5167. Tratar erros com try/catch em fetch/parse/execução, status 500 com { error: message }, nunca crashar em JSON inválido e fechar writer no finally. «v888-j6xmx4xa.txt:190-197»
ND-5168. Proibir os defeitos de streaming: content e tool_calls juntos, [DONE] duplicado, delta_content em tool_calls, writer aberto, waitForTimeout deprecado. «v888-j6xmx4xa.txt:202-215»
ND-5169. Proibir os defeitos de navegador: nova aba desnecessária, perder referência da página, Enter antes de colar, limpar campo com delete, selector errado. «v888-j6xmx4xa.txt:217-228»
ND-5170. Proibir os defeitos de tools: executar em modo chat, tool duplicada, falha silenciosa, bash sem cwd, sobrescrever sem verificar. «v888-j6xmx4xa.txt:230-240»
ND-5171. Proibir os defeitos de mensagem: enviar histórico gigante, mensagens do sistema, tool_result como usuário, duplicar conteúdo. «v888-j6xmx4xa.txt:242-248»
ND-5172. Proibir deteção automática de modo por keywords/regex/sentimento — modo só por comando explícito @c/@a/@f/@s/@p, removido do texto antes de enviar. «v888-j6xmx4xa.txt:250-257,280-283»
ND-5173. Usar modo chat como default e executar tools apenas em agent mode. «v888-j6xmx4xa.txt:285-287»
ND-5174. Proibir polling de sincronização, watch de arquivos, setInterval para sync e preview URL. «v888-j6xmx4xa.txt:258-262,290-294»
ND-5175. Executar Write, Bash, Read, Edit, LS, Glob e Delete localmente, criando diretórios automaticamente e verificando se o arquivo foi criado. «v888-j6xmx4xa.txt:300-303»
ND-5176. Executar bash no diretório do projeto com stdout/stderr de retorno, timeout para comandos longos e maxBuffer para outputs grandes. «v888-j6xmx4xa.txt:304-307,355-360»
ND-5177. Trocar de modo ANTES de enviar a mensagem e nunca reativar modo já ativo. «v888-j6xmx4xa.txt:310-312»
ND-5178. Ordem de operação: receber mensagem → processar modo (@c/@a/@f/@s/@p) → verificar nova conversa → conectar navegador persistente → enviar via clipboard → streamar resposta → parsear → executar tools localmente → retornar feedback. «v888-j6xmx4xa.txt:400-420»
ND-5179. Acionar modos pelo símbolo @ (@f, @a, @c, @s, @p) sem detecção automática. «v899-5kxttb45.txt:19»
ND-5180. Mesclar funcionalidades duplicadas mantendo tudo e apenas otimizando — nunca remover recursos. «v899-5kxttb45.txt:11»
ND-5181. Fazer o stream de resposta funcionar refletindo tudo no terminal e parando até a próxima mensagem do usuário. «Note 02 28 2026 02 39 50-mxjyq26m.txt:9-11»
ND-5182. Nunca reenviar a resposta gerada pelo Z.ai como se fosse prompt do usuário (evita loop). «Note 02 28 2026 02 39 50-mxjyq26m.txt:9,11»
ND-5183. Manter o contexto pelo chat_id enviando somente a última mensagem do usuário a cada turno. «Note 02 28 2026 02 39 50-mxjyq26m.txt:11»
ND-5184. Esperar até 180s pelo login, com auth type="api" provider="zai" via client.auth.set, sem Bearer sem token e sem misturar cookies. «Note 02 28 2026 02 39 50-mxjyq26m.txt:15»
ND-5185. Injetar system prompt de tool use quando houver tools, exigindo resposta EXATAMENTE no formato ```tool_call``` JSON com nome, arguments e lista de ferramentas disponíveis. «Note 02 28 2026 02 39 50-mxjyq26m.txt:48-60»
ND-5186. Retornar os resultados do OpenCode CLI (logs de sucesso/erro pós tool call) de volta para a text area do Z.ai — o feedback deve seguir o mesmo caminho da primeira mensagem. «R4455-e3kt3mcc.txt:7»
ND-5187. Textão de OpenCode só funciona no modo chat; no modo agente não enviar nada porque ele já sabe como agir. «R4455-e3kt3mcc.txt:11»
ND-5188. Registrar chats com ChatRecord { chatId, mode: chat|agent|fullstack, createdAt, lastActivity } persistidos em chats.json no perfil. «R4455-e3kt3mcc.txt:31-44»
ND-5189. Suportar as ferramentas locais write, edit, read, bash, run_command, ls, rm, delete, todowrite, todoread, glob, grep e multiedit. «R4455-e3kt3mcc.txt:33»
ND-5190. Respeitar o escopo de workspace: WORKSPACE_DIR = process.cwd(), ZAI_BASE = https://chat.z.ai, CHATS_DB no perfil. «R4455-e3kt3mcc.txt:29-31»

### C. AIACTIONS — servidor da IA, skills e plataforma

ND-5191. Mesclar as pastas plugins e aiactions numa só — são a mesma coisa (lógicas para funcionamento e acionamento). «update 8-3m7f5bag.txt:33»
ND-5192. Mesclar a pasta engines dentro de aiactions/actions — engines não existem como pasta externa nem aba; ficam vinculadas internamente a cada contexto (vídeo, 3d, canvas). «p58 v3 sem arvore-dfypa38n.txt:32»
ND-5193. Permitir que a pasta aiactions chegue a 80+ arquivos .ts para cobrir todas as features e demandas. «update 8-3m7f5bag.txt:13; Note 01 20 2026 12 27 24-85ncg46e.txt:20»
ND-5194. Dar a cada pasta/aba seu conjunto próprio de lógicas (ts) e componentes (tsx) separados — mínimo obrigatório de 7 arquivos, usual 30+. «update 8-3m7f5bag.txt:13-14»
ND-5195. Tratar a IA como usuário super root admin com aba própria, lógicas e componentes; a aba dela é uma super meta aba. «p58 v3 sem arvore-dfypa38n.txt:44»
ND-5196. Cadastrar a IA como usuário da plataforma (email e senha) com os mesmos direitos do usuário comum e MUITO mais; admins têm acesso à conta dela. «31dv-dj6tjt2m.txt:1192-1200»
ND-5197. Nomear o usuário da IA como lookup (@lookup) na plataforma. «p58 v3 sem arvore-dfypa38n.txt:63»
ND-5198. Manter a IA sempre ligada como servidor assistindo, trabalhando em segundo plano para usuários pagantes. «31dv-dj6tjt2m.txt:1198-1199»
ND-5199. Colocar todas as lógicas, skills, ferramentas, scripts .ts, templates de pré-treinamento e componentes interativos da IA dentro de aiactions/, com servidor próprio em porta dedicada. «31dv-dj6tjt2m.txt:1204-1212»
ND-5200. Implementar as 60+ skills da IA em aiactions: todolist, contextanalyzer, planbuilder, questionasker, thinkingmode, fileread, filewrite, filerename, filemove, filedelete, fileexport, fileimport, contextcapture, contextcompact, mousemove, mouseclick, keyboardtype, searchinternet, searchplatform. «31dv-dj6tjt2m.txt:1214-1232»
ND-5201. Implementar as skills de geração: generateimage, generatevideo, generateaudio, generate3d, generatecode, generatesite, generatenotes, generatead, generatemidi. «31dv-dj6tjt2m.txt:1233-1241»
ND-5202. Implementar as skills de operação: verification, testing, training, modeldownload, apiconnect, cloudmanage, tabmanage, projectmanage, layermanage, effectapply, renderexport, publish, share. «31dv-dj6tjt2m.txt:1242-1254»
ND-5203. Executar SEMPRE o protocolo todo list quando o usuário faz input: receber input → analisar contexto → acionar raciocínio → perguntar se houver dúvida → buscar 30 logs de treinamento similares → analisá-los → criar plano único → executar ação a ação → verificar cada passo → testar resultado → salvar log no banco privado → retornar output. «31dv-dj6tjt2m.txt:1256-1270»
ND-5204. Implementar 3 modos de execução da IA: Ao Vivo (cursor fantasma clicando visivelmente), Oculto (execução direta instantânea) e Autônomo (admin only, trabalha sozinha, treina modelos, gera conteúdo). «31dv-dj6tjt2m.txt:1272-1284»
ND-5205. Manter a to-do list visual flutuante SEMPRE visível em ambos os modos (ao vivo e oculto), mostrando passo a passo ("1. Analisando contexto... 2. Buscando exemplos..."). «wet-ar7mf5mc.txt:250-255»
ND-5206. Avisar usuários de que a IA não fica em segundo plano se a aba não estiver aberta; modo autônomo em segundo plano é exclusivo de admins por ser caro. «wet-ar7mf5mc.txt:264-270»
ND-5207. Organizar o contexto do usuário como [user id] → context → [categoria] → arquivos, com categorias chat, video, 3d, notes, tools, code_ide etc., e cada output gerando arquivo salvo na pasta context. «wet-ar7mf5mc.txt:272-276»
ND-5208. Compactar contexto ao chegar perto do limite de tokens: criar arquivo de compactação (resumo geral), permitir continuar ou abrir novo chat e, ao retomar, ler a pasta context começando pela compactação ("Oi, paramos em X lugar, quer continuar?"). «wet-ar7mf5mc.txt:278-283»
ND-5209. Permitir troca de modelo no chat (plano pago): API key própria, modelo local, modelo na nossa nuvem ou autenticação Google/Anthropic. «wet-ar7mf5mc.txt:285-290»
ND-5210. Implementar a aba /iamodels de treinamento de modelos: baixar modelo de Kaggle/HuggingFace/qualquer fonte por link, integrar com code_ide, salvar na nuvem aimodels → [nome] → [versão], verificando pasta, arquivos, tamanho, metadata e versão. «wet-ar7mf5mc.txt:292-300»
ND-5211. Cobrar pelo uso de storage e processamento no treinamento de modelos; para admins, disponível em segundo plano. «update 8-3m7f5bag.txt:96-98»
ND-5212. Fazer a IA usar as lógicas e componentes da própria plataforma para executar tarefas quando pedido, com autonomia graças aos arquivos .ts de aiactions. «update 8-3m7f5bag.txt:52-55»
ND-5213. Abrir a todo list a partir do chat ou terminal, acionando as ferramentas da pasta aiactions: captura de contexto, pensamento, perguntas e execução sequencial. «update 8-3m7f5bag.txt:58-64»
ND-5214. Fazer o servidor da IA ficar 100% ativo conectando-se com as lógicas e vice-versa. «update 8-3m7f5bag.txt:66»
ND-5215. Colocar as ferramentas e utilitários (+60) de abrir, capturar, exportar e importar contexto, ler/modificar/mover/renomear/gerar arquivos, mover mouse e treinar em .ts dentro de aiactions. «update 8-3m7f5bag.txt:78-80»
ND-5216. Executar pedidos de usuários em segundo plano: a IA trabalha no plano dela e para os admins mesmo com o usuário ausente. «update 8-3m7f5bag.txt:82-84»
ND-5217. Primeiro fazer auditoria do pedido (acionar os processos lógicos de aiactions e executar o todo list) antes de realizar qualquer pedido do usuário. «update 8-3m7f5bag.txt:46-48»
ND-5218. Oferecer treinamento de agentes, treinamento de modelos e ações pré-treinadas: tarefa definida por input de texto ou file é analisada e executada do início ao fim. «update 8-3m7f5bag.txt:86»
ND-5219. Exportar a conversa para a nuvem (pasta context da categoria) quando pausar; ao retornar, acionar lógicas de contagem de tokens para retomar com o id da conversa de onde parou e acionar a skill de compactação. «update 8-3m7f5bag.txt:90»
ND-5220. Permitir em todos os chats a troca do modelo que responde e do contexto: API própria, download local para o servidor do usuário, modelo na nossa nuvem ou autenticação. «update 8-3m7f5bag.txt:92»
ND-5221. Fazer o aiactions.ts chamar a API (e a API do usuário se ele colocar a chave) e editar a tabela de status: conversas iniciadas, respondidas, não finalizadas, pausadas, em andamento. «update 8-3m7f5bag.txt:104»
ND-5222. Comunicar aiactions com servidores e APIs: chamar API do Google/Anthropic para interpretar contexto; se falhar, chamar outra; se o usuário der a chave dele, usar a dele. «wet-ar7mf5mc.txt:316-321»
ND-5223. Colocar componentes de geração por IA em TODAS as abas de edição (imagem, vídeo, áudio, código, 3D) com sistema de nodes conectáveis e contexto isolado por node. «wet-ar7mf5mc.txt:323-330»
ND-5224. Salvar o trabalho da IA na mesma pasta do log, categoria "aiactions" ([user id] → aiactions → [projeto]); invisível ao usuário no modo oculto. «wet-ar7mf5mc.txt:332-336»
ND-5225. Fornecer o modo ao vivo com cursor fantasma que move, clica e digita na tela visivelmente enquanto o usuário assiste. «31dv-dj6tjt2m.txt:1214-1240 (mousemove/mouseclick/keyboardtype); wet-ar7mf5mc.txt:256-260»
ND-5226. Gravar TODAS as ações do usuário via Observer e enviar os logs para a NOSSA nuvem privada — o usuário não vê, não acessa e não deleta; logs são propriedade da plataforma e servem para treinar a IA proprietária. «31dv-dj6tjt2m.txt:1290-1300»
ND-5227. Estruturar o log de treinamento com ID do usuário, categoria da aba e demais campos padronizados. «31dv-dj6tjt2m.txt:1298-1300»
ND-5228. Criar a pasta de nodes como externa (criar, publicar, instalar nodes em projetos/abas) mas com componente node vinculado dentro de cada pasta (video, 3d, canvas etc.). «p58 v3 sem arvore-dfypa38n.txt:34»
ND-5229. Não existir pasta Upload: mesclada com a pasta post e vinculada à pasta user (usuário precisa estar cadastrado para upload). «p58 v3 sem arvore-dfypa38n.txt:36»
ND-5230. Criar a pasta terminal de uso livre somente para admins e a IA (uso limitado para pagantes), com isolamento total de sandbox e vínculo obrigatório a um contexto de projeto. «p58 v3 sem arvore-dfypa38n.txt:75»
ND-5231. Manter as pastas de status mescladas com retrospectiva (retrospectiva geral da plataforma). «p58 v3 sem arvore-dfypa38n.txt:48»
ND-5232. Mesclar code_ide com sitebuilder (criador de aplicações web/app com drag and drop completo). «p58 v3 sem arvore-dfypa38n.txt:57»
ND-5233. Mesclar 3d studio com o criador de jogos; criar pasta ebook para o criador de ebooks. «p58 v3 sem arvore-dfypa38n.txt:53,55»
ND-5234. Reservar a pasta agents/cli (desenvolvimento de agentes e CLIs) para usuários pagantes e admins somente. «p58 v3 sem arvore-dfypa38n.txt:50»
ND-5235. Usar aiactions como âncora: aiactions.tsx (âncora do servidor IA super root admin) + aiactionspage.tsx (painel IA admin only) dentro da pasta. «Note 01 20 2026 12 27 24-85ncg46e.txt:857-859»
ND-5236. Aplicar o conceito hook module/hook logic: nada duplicado ou espalhado em duplicidade entre pastas — componentes e lógicas criados para serem reutilizados. «doc oficla (para criar arvore)-c54rm4kc.txt:1754»
ND-5237. Mapear a árvore de pastas e arquivos por categoria (institucional, editores, ai, gateways, ferramentas da plataforma, usuário etc.) antes de implementar. «update 8-3m7f5bag.txt:14-18»
ND-5238. Converter o app para iOS, Windows e Play Store usando Electron ou Pkg (Vercel/Yao-pkg). «update 8-3m7f5bag.txt:42»
ND-5239. Fazer a compra de assets entre usuários ser gerenciada pelo Stripe, com cadastro obrigatório de dados para as lógicas .ts entrarem em ação. «update 8-3m7f5bag.txt:100»
ND-5240. Permitir mesclar, incorporar, unir, mover, duplicar e fazer plug-and-play em tudo na plataforma (contextos, abas, componentes, guias, navegação) e o inverso (desincorporar, inverter, remover temporariamente). «update 8-3m7f5bag.txt:102»
ND-5241. Renomear automaticamente arquivos com mesmo nome para (1), (2), (3)... como o Windows faz, e criar pasta lixeira em cada projeto. «update 8-3m7f5bag.txt:92»
ND-5242. Limitar o plano free: sem publicação/export/render das abas de edição, 1 projeto por aba de edição, sem gerenciamento de arquivos e com anúncios. «update 8-3m7f5bag.txt:94»
ND-5243. No plano pago, renderizar e exportar espontaneamente em segundo plano: a pré-visualização já é o vídeo na nuvem, finalizado quando o usuário para de interagir. «update 8-3m7f5bag.txt:94-96»
ND-5244. Cobrar caro pela API da plataforma (a plataforma vai oferecer API mas com preço alto). «update 8-3m7f5bag.txt:102»
ND-5245. Manter servidores e APIs organizados por categorias: gateways de pagamento, gateway user actions, write nas tabelas Supabase com status em countdown ou strings. «update 8-3m7f5bag.txt:100»
ND-5246. Criar aba de gerenciamento de armazenamento para o usuário ver gasto, repositório (dele ou nosso), pastas do provedor, navegar, mover, renomear e excluir com aviso prévio. «update 8-3m7f5bag.txt:90»
ND-5247. Ter um servidor .ts que assiste os arquivos das pastas widgets (por categoria) no repo do GitHub, buscando arquivos atualizados pelo admin. «update 8-3m7f5bag.txt:88»
ND-5248. Implementar dropdown de aba com tela dividida, popup, tela inteira, agrupar/mesclar guia e duplicar (fork); arrastar popup para a área de tabs converte em aba. «update 8-3m7f5bag.txt:102-104»
ND-5249. Oferecer abas de geração de música, imagem, vídeo, 3D, website, midi e anúncio, com pré-treinamento e agente colocando tarefas na todo list. «update 8-3m7f5bag.txt:104-106»
ND-5250. Transcrever ordens em pontos hierárquicos em codebox, organizando hierarquia lógica dos arquivos e lógicas em camadas e subcamadas. «update 8-3m7f5bag.txt:106»

### D. Arquitetura multi-agente — liveness e memória

ND-5251. Assumir que o LLM é stateless: ele "nasce" no prompt e "morre" na resposta — quem gerencia liveness, memória e comunicação é o backend. «Arquitetura Multi-Agente  Estado e Memória-9g7cr7mw.txt:26-37»
ND-5252. Não fazer o agente "saber que está vivo" pelo prompt: criar registro no banco com status processing atrelado a user_id e task_id e deixar o loop do servidor puxar o estado. «Arquitetura Multi-Agente  Estado e Memória-9g7cr7mw.txt:31-37»
ND-5253. Implementar o dicionário de agentes (padrão Router/Orchestrator): as instruções do orquestrador trazem a lista de sub-agentes disponíveis e o que cada um faz. «Arquitetura Multi-Agente  Estado e Memória-9g7cr7mw.txt:39-44»
ND-5254. Delegar via JSON estruturado ({"comando": "chamar_agente", "alvo": "frontend", "tarefa": "..."}) — nunca HTTP direto de LLM para LLM. «Arquitetura Multi-Agente  Estado e Memória-9g7cr7mw.txt:46-48»
ND-5255. Fazer o código TypeScript capturar o JSON de delegação, chamar a skill do sub-agente (o 200 OK real) e devolver o resultado ao orquestrador num novo prompt. «Arquitetura Multi-Agente  Estado e Memória-9g7cr7mw.txt:48-50»
ND-5256. Alimentar a checklist visual em seudominio.com/task_id via WebSockets ou atualização do banco a cada passo. «Arquitetura Multi-Agente  Estado e Memória-9g7cr7mw.txt:52»
ND-5257. Dividir a memória em 3 camadas: janela deslizante (instruções + últimos N turnos), armazenamento em arquivos (memória de longo prazo com skill ler_historico) e sumarização de checkpoints por modelo barato a cada X interações. «Arquitetura Multi-Agente  Estado e Memória-9g7cr7mw.txt:57-63»
ND-5258. Não confiar na memória do LLM para decidir ler o histórico: aplicar Injeção de Contexto Forçada — o servidor injeta o estado antes de cada pensamento. «Arquitetura Multi-Agente  Estado e Memória-9g7cr7mw.txt:104-124»
ND-5259. Comunicar agentes via memória compartilhada (shared state no banco/arquivos), não por requisições diretas entre eles. «Arquitetura Multi-Agente  Estado e Memória-9g7cr7mw.txt:110-124»
ND-5260. Fazer o agente trabalhador salvar status a cada passo (task_id_status.json na raiz) e o agente comunicador ler esse status antes de responder ao usuário. «Arquitetura Multi-Agente  Estado e Memória-9g7cr7mw.txt:116-124»
ND-5261. Usar o padrão ReAct na resposta do agente: JSON com "pensamento", "acao", "alvo" e "parametros" — o código extrai o pensamento para a UI e executa a ação. «Arquitetura Multi-Agente  Estado e Memória-9g7cr7mw.txt:128-137»
ND-5262. Garantir que a interceptação é o salvamento: o código recebe a resposta JSON da IA e faz UPDATE no banco (nada vai "para o vazio"). «Arquitetura Multi-Agente  Estado e Memória-9g7cr7mw.txt:166-179»
ND-5263. Montar o Mega Prompt a cada turno: dicionário de skills + últimas 5 ações da tarefa + instrução para responder ESTRITAMENTE em JSON com acao e parametros (ou acao "finalizar"). «Arquitetura Multi-Agente  Estado e Memória-9g7cr7mw.txt:188-198»
ND-5264. Implementar o loop agentLoop.ts: while tarefaAtiva → ler banco → injetar contexto → chamar LLM → JSON.parse → se acao=finalizar encerra → executarSkill → salvar resultado → pausa de segurança (2s). «Arquitetura Multi-Agente  Estado e Memória-9g7cr7mw.txt:260-314»
ND-5265. Limitar o histórico recente às últimas 5-10 interações para não explodir o contexto. «Arquitetura Multi-Agente  Estado e Memória-9g7cr7mw.txt:316-320»
ND-5266. Manter os arquivos do agente soltos na raiz do projeto (orquestrador.ts, worker.ts, database, skills) — arquitetura plana e direta. «Arquitetura Multi-Agente  Estado e Memória-9g7cr7mw.txt:170-183»
ND-5267. Considerar SQLite no navegador (WASM) e Node client-side (WebContainers) como arquitetura local-first válida. «Arquitetura Multi-Agente  Estado e Memória-9g7cr7mw.txt:236-237»
ND-5268. Salvar o trabalho dos agentes no repositório do usuário ou no Spaces do Hugging Face quando aplicável. «Arquitetura Multi-Agente  Estado e Memória-9g7cr7mw.txt:148»

### E. Plataforma — Supabase, planos, apps e aiactions no banco

ND-5269. Implementar no backend o que não for possível nas tabelas; SQL sem emojis nem underscores destinado ao editor do Supabase, com nomes elegantes em inglês. «rt5y67754567-aw7hb7wb.txt:8-11»
ND-5270. Fazer o máximo de tabelas e colunas otimizadas: 200 de referência, podendo ser 300 ou menos, desde que abranja tudo. «rt5y67754567-aw7hb7wb.txt:12»
ND-5271. Limpar TUDO antes de recriar: zerar schemas Auth, Real Time e public e focar a recriação no schema public. «rt5y67754567-aw7hb7wb.txt:14-17»
ND-5272. Usar CREATE TABLE IF NOT EXISTS e ignorar criação quando já existir. «rt5y67754567-aw7hb7wb.txt:26»
ND-5273. Ativar RLS, Real Time e Policy em todas as tabelas, incluindo low level security. «rt5y67754567-aw7hb7wb.txt:23»
ND-5274. Aceitar tipos: uuid, text, url, boolean, jsonb, yaml, toml, blob, numeric, timestamptz, payload, string, int4, int8, encrypted, metadata. «rt5y67754567-aw7hb7wb.txt:24»
ND-5275. Identificar aplicativos por nome, jamais por numeração sequencial. «rt5y67754567-aw7hb7wb.txt:25»
ND-5276. Aplicar o princípio de cascata rigoroso: tabelas interligadas partindo do auth user ID, sem repetir coluna nem tabela entre si. «rt5y67754567-aw7hb7wb.txt:29-31»
ND-5277. Proibir tabelas secundárias de duplicar nickname, username, bio, foto de perfil ou qualquer dado da tabela principal — referenciam apenas o ID. «rt5y67754567-aw7hb7wb.txt:32-33»
ND-5278. Criar a tabela principal de usuário com 20+ colunas: username, name, email, bio, foto, plano vigente, início/encerramento, tarefas ativas, status de IA, presença online, entrada e saída. «rt5y67754567-aw7hb7wb.txt:35-40»
ND-5279. Oferecer identificação múltipla: email, nome, username, código alfanumérico, numérico isolado e UUID, cada modalidade vinculada ao plano vigente. «rt5y67754567-aw7hb7wb.txt:42-44»
ND-5280. Estabelecer a hierarquia: Criadores como classe suprema, Administradores delegados, Sponsors e AI agents com privilégios equivalentes aos criadores para tarefas automatizadas. «rt5y67754567-aw7hb7wb.txt:46-50»
ND-5281. Dar ao criador controle total (deletar, modificar, pausar qualquer conta/recurso), entrada em qualquer contexto e delegação de autoridade marcada no banco. «rt5y67754567-aw7hb7wb.txt:75-83»
ND-5282. Proteger contra escalamento vertical por modificação de requisição (classificação de cada pessoa definida por protocolo na tabela). «rt5y67754567-aw7hb7wb.txt:81»
ND-5283. Criar dois painéis administrativos como aplicativos: Master exclusivo dos criadores e secundário para pagantes (só preferências próprias). «rt5y67754567-aw7hb7wb.txt:85-90»
ND-5284. Definir planos: Free (3 projetos, 3 msgs agênticas, 200MB, zero API externa), Pro (250 projetos, 50 msgs, 1 provedor, 500MB, 1 nuvem), Essential (700 projetos, 10 provedores, 10GB, 4 nuvens), Enterprise (2000 projetos, 40 provedores, 100GB, 20 nuvens), Sponsor (50000 projetos, 300 provedores, 500GB, 40+ conexões), Criadores e AI Users sem restrição. «rt5y67754567-aw7hb7wb.txt:108-115»
ND-5285. Rate limit de IA: Free 3 requisições só nos nossos modelos; Pro+ mais de 2000 requisições diárias; nossos modelos rodam 24h na própria infra sem limite interno. «rt5y67754567-aw7hb7wb.txt:122-125»
ND-5286. Categorizar conexões externas: provedores de IA (chaves OpenAI, Grok), provedores de nuvem (Google, Mega via API/link/FTP), provedores de infraestrutura (CPU, GPU, VPS) e provedores de VPN, cada categoria com limite por plano. «rt5y67754567-aw7hb7wb.txt:117-121»
ND-5287. Vender planos via Stripe com compra unitária múltipla, mensal/anual/vitalícia, pausável, cashback/reembolso e trial de 2-3 dias com cartão pré-cadastrado (um plano só, sem pausa durante o trial). «rt5y67754567-aw7hb7wb.txt:127-133»
ND-5288. Registrar IP do pagamento, conta e rede para dificultar duplicação via VPN ou contas falsas. «rt5y67754567-aw7hb7wb.txt:134»
ND-5289. Permitir compartilhamento de assinatura por time sem limite, com play/pause individual e aviso quando outro membro está consumindo. «rt5y67754567-aw7hb7wb.txt:136-141»
ND-5290. Tratar TUDO como aplicativo: pagamento, doação, assinatura, painéis, marketplace, loja, explorer; existe aplicativo sobre aplicativo e subaplicativo. «rt5y67754567-aw7hb7wb.txt:143-150»
ND-5291. Oferecer a lista de 30+ aplicativos: Terminal, Help Center, Search, Add App, Command Palette, Star Menu, Profile, Files (com nuvens/HDs virtuais/Docker/SSH/Git), Web Browser, AI Assistant (com Agent Tasks), Video Editor, Audio DAW, 3D Studio, IDE, Canvas, Notes, Settings/Personalization, Dashboard, Explore, Projects (App/Site/CLI/Tool/Component Builder), Tools (+15), Storage, Laboratory, AI Training, Live Studio, System Status, Master/Secondary Panel, Payment, Donation, Forks, Marketplace, Email, VPN, Calculator, Gallery, History, Trash, Game. «rt5y67754567-aw7hb7wb.txt:152-168»
ND-5292. Permitir fork de notas, projetos e qualquer conteúdo de qualquer usuário, abrindo no editor do tipo correspondente e registrando o fork com ID original e novo proprietário. «rt5y67754567-aw7hb7wb.txt:170-172»
ND-5293. Registrar tarefas da IA no banco em tempo real: se o criador pedir um componente, a IA executa, faz deploy e registra a tarefa no aplicativo dela. «rt5y67754567-aw7hb7wb.txt:176-178»
ND-5294. Distinguir admins de contexto comunitário (quem cria servidor é admin daquele espaço) dos admins administrativos da plataforma. «rt5y67754567-aw7hb7wb.txt:180-184»
ND-5295. Registrar tarefas agênticas com ID da tarefa, mensagem, horário de início, conclusão e continuidade; execução em segundo plano a partir de planos maiores. «rt5y67754567-aw7hb7wb.txt:186-190»
ND-5296. Proibir criação de ferramentas agênticas/automatizadas no plano gratuito; automação completa a partir do Essential. «rt5y67754567-aw7hb7wb.txt:190-192»
ND-5297. Capturar dados antifraude do ambiente (navegador, tela, rede IPv4/IPv6, localização, dispositivo) e exibir contagem de ataques bloqueados na tela inicial. «rt5y67754567-aw7hb7wb.txt:194-198»
ND-5298. Rastrear cliques, componentes e camadas por IDs (botão, componente, app, payload, parâmetros), persistir estado de camadas para restaurar ao retornar e limpar log inativo. «rt5y67754567-aw7hb7wb.txt:200-204»
ND-5299. Implementar Ctrl+Z por contexto descompactando estados anteriores do arquivo de estados. «rt5y67754567-aw7hb7wb.txt:202»
ND-5300. Vincular idioma selecionado (50-120 disponíveis) ao ID do usuário e salvar sessões de chat com IDs de conversa por aplicativo. «rt5y67754567-aw7hb7wb.txt:206-208»
ND-5301. Compactar registros em ZIP periodicamente (a cada 100 entradas ou 1 semana), mantendo apenas referência URL/blob/JSONB na tabela e o mais recente de cada entidade. «rt5y67754567-aw7hb7wb.txt:224-232»
ND-5302. Manter tabela permanente dedicada para logs de sistema e de chat, separada da compactação semanal. «rt5y67754567-aw7hb7wb.txt:230»
ND-5303. Avisar o frontend sobre limpeza semanal e disponibilidade de backup para restauração de versões. «rt5y67754567-aw7hb7wb.txt:234»
ND-5304. Versionar projetos por ID vinculado à versão, com reversão consistente na tabela (música, 3D, site, notas etc.). «rt5y67754567-aw7hb7wb.txt:236-238»
ND-5305. Guardar conteúdo publicado (vídeos, posts, imagens, projetos) como metadados JSONB/blob num esquema otimizado só de identificadores. «rt5y67754567-aw7hb7wb.txt:242-244»
ND-5306. Prever 100+ erros SQL nos scripts: 3F000, 42710, 23505, 42601, 42703, 22P02, 42501, 42804, 42P01 e conflitos already exists. «rt5y67754567-aw7hb7wb.txt:248-258»
ND-5307. Guardar chaves/tokens do usuário por aplicativo conforme o tipo de serviço (IA, VPN, VPS), persistidos no banco associados ao perfil. «rt5y67754567-aw7hb7wb.txt:144-146 (seção chaves)»
ND-5308. Sincronizar mensagens entre dispositivos compactando em ZIP como URL/blob e descompactando no IndexedDB do novo dispositivo. «rt5y67754567-aw7hb7wb.txt:218-220»
ND-5309. Exibir retrospectiva agregada (cliques, projetos concluídos, gigabytes consumidos por período) programada para fim de ano, semana e períodos menores. «rt5y67754567-aw7hb7wb.txt:212-214»
ND-5310. Registrar doações pelo ID/email/username do doador com opção de converter doação em crédito de plano. «rt5y67754567-aw7hb7wb.txt:216»
ND-5311. Tratar tables projects com project_type em video, audio, canvas, site, 3d, code, notes (CHECK constraint), com thumbnail, size, is_deleted, is_archived, is_starred e metadata jsonb. «rt5y67754567-aw7hb7wb.txt:270-290»
ND-5312. Implementar storage_quotas por tier (max_storage_bytes, max_projects, max_file_size) e storage_usage por usuário. «rt5y67754567-aw7hb7wb.txt:292-300»
ND-5313. Implementar trash com project_data jsonb e expiração de 30 dias, e team_members/invites com roles owner/admin/member e convite expirando em 7 dias. «rt5y67754567-aw7hb7wb.txt:300-320»
ND-5314. Criar subscriptions com stripe_subscription_id, stripe_customer_id, status, current_period e paused_at. «rt5y67754567-aw7hb7wb.txt:316-318»

### F. App de notas/consultas, segurança de API e operação

ND-5315. Redirecionar qualquer caminho não registrado para a página 404, bloqueando acesso a .env e arquivos sensíveis; configurar headers, ofuscação de código e bloqueio de devtools. «Note 02 06 2026 19 23 13-8enmcfpi.txt:15»
ND-5316. Seguir o fluxo de telas: loading (logo) → home → login → onboarding (apresentação) → onboarding (nickname) → dashboard com chat de IA embutido. «Note 02 06 2026 19 23 13-8enmcfpi.txt:17-27»
ND-5317. Montar o dashboard com visão geral das notas, consultas, gráficos, chat, pesquisa e explore interligados. «Note 02 06 2026 19 23 13-8enmcfpi.txt:27»
ND-5318. Criar página de notas que pode aparecer no explore, com temas e pesquisas mais buscados como filtros (estilo YouTube para explorar notas de outros usuários). «Note 02 06 2026 19 23 13-8enmcfpi.txt:33-35»
ND-5319. Gravar tudo que o usuário faz como metadados simples na tabela relacional — interação, salvamento, login, tudo bate na tabela. «Note 02 06 2026 19 23 13-8enmcfpi.txt:37»
ND-5320. Fazer todos os elementos compactos, descolados e flutuantes das bordas, arrastáveis com posição fixa registrada por metadados no Supabase. «Note 02 06 2026 19 23 13-8enmcfpi.txt:39»
ND-5321. Ter portas e servidores node monitorando tudo. «Note 02 06 2026 19 23 13-8enmcfpi.txt:41»
ND-5322. Permitir no gerenciamento de postagens escolher quais chats, solicitações e notas compartilhar. «Note 02 06 2026 19 23 13-8enmcfpi.txt:43»
ND-5323. Seguir o checklist de segurança de API: evitar Basic Auth (usar JWT), Max Retry e jail no login, criptografia de dados sensíveis, HTTPS com HSTS, desligar directory listing, IPs safelisted em APIs privadas. «Note 02 06 2026 19 23 13-8enmcfpi.txt:49-56»
ND-5324. Enviar headers de output: X-Content-Type-Options nosniff, X-Frame-Options deny, Content-Security-Policy default-src 'none'; remover headers de fingerprinting (x-powered-by) e nunca retornar credenciais/tokens. «Note 02 06 2026 19 23 13-8enmcfpi.txt:57-62»
ND-5325. Usar logging centralizado com alertas (SMS/Slack/Email/Kibana/CloudWatch), sem logar dados sensíveis, com IDS/IPS monitorando tudo. «Note 02 06 2026 19 23 13-8enmcfpi.txt:63-67»
ND-5326. Aplicar regras de JWT: segredo forte, algoritmo definido no backend (não extraído do header), TTL curto, payload pequeno e sem dados sensíveis. «Note 02 06 2026 19 23 13-8enmcfpi.txt:68-73»
ND-5327. Aplicar regras de OAuth: validar redirect_uri no servidor e evitar response_type=token (trocar por code). «Note 02 06 2026 19 23 13-8enmcfpi.txt:74-75»
ND-5328. Processar uploads grandes (arquivo de 5,96MB / 6M caracteres / 1,3M tokens) num app SPA de página única que roda inteiramente no navegador, sem enviar o arquivo para servidor. «Note 03 22 2026 20 31 21-xwagm58f.txt:7-14»
ND-5329. Organizar o código em codebox único: agrupar por títulos, mesclar duplicadas sem remover nada, hierárquico com * e pontos. «Note 02 06 2026 19 23 13-8enmcfpi.txt:7-9»
ND-5330. Manter script de auto-boot V4 de limpeza absoluta de disco com $ErrorActionPreference = "SilentlyContinue" para rodar 100% invisível no boot, enviando tudo para a Lixeira (nunca delete forçado). «script de limpeza-rqgb2jfx.txt:3-14»
ND-5331. Extrair tool name de function.name e arguments como JSON; processar múltiplos tool_calls; evitar duplicatas com Set de IDs processados. «v888-j6xmx4xa.txt:100-104»

---

## FASE 6b — cadria + argan + owni + cli + video (fonte: neodocs-txt/outros.*)

291 regras (ND-6001..6291, 385 citações de fonte): DNS/argan (TLD alternativo
.allan com Corefile, DoH RFC 8484, DNSSEC ED25519, PKARR, PowerDNS/NSD/Unbound
+ roadmap 18 semanas, zona real devthink.pro, LibreDNS/AdGuard/Terraform) ·
cadria/iukka+create (manifest PWA, featuresupdate.md hierárquico mandatório,
âncoras ⚓, Supabase 3006) · owni (galeria: Lightbox, UploadZone, useGallery) ·
cli-desktop (fingerprint/quota multi-conta, CAPTCHA Aliyun decompilado,
deploy 5 CIs + dashboard SSE, AuthManagerImpl AES-256-GCM, cache TTL 30s,
20 modos, SSM anomaly) · vídeo (@devthink/player HLS/DASH/YouTube/Vimeo,
WGSL compute shaders, codecs/stall).
Pulados: 3 lockfiles, TypeScript compiler vendido 9MB, chunks repetidos,
tokens _acme-challenge públicos (não reproduzidos).


### Bloco A — Argan: modelo pendurado, registradora e banco único

ND-6001. Viver o DNS como biblioteca open-source publicada que qualquer projeto consome por configuração, sem endereço, porta ou credencial fixos no código. «dns-argan.txt:9-21,35»
ND-6002. Configurar os apps via ambiente e banco apenas — build, teste e hash no CI, zona versionada publicada por pipeline, nunca editada na mão em produção. «dns-argan.txt:9-13»
ND-6003. Adotar o modelo pendurado: cada pessoa ancora seu domínio principal comprado e publica domínios personalizados pendurados nele, resolvendo mundialmente pelo DNS padrão sem que o visitante instale nada. «dns-argan.txt:15-19,36,231»
ND-6004. Funcionar o painel como registradora: o rótulo digitado vira subdomínio real sob o apex com URL pública imediata. «dns-argan.txt:15-17,37»
ND-6005. Onde a porta 53 estiver bloqueada ou sem privilégio, operar tudo via DoH sobre HTTPS igual aos grandes provedores. «dns-argan.txt:19-21,39»
ND-6006. Manter as cópias em cluster por gossip autenticado com HMAC e filtro de origem, com uma primária como registro. «dns-argan.txt:21-22,41»
ND-6007. Tratar o componente local como opt-in: quem instala ganha transportes cifrados, cache com TTL, horizonte dividido, atualização dinâmica e namespaces alternativos; quem não instala continua resolvendo normalmente. «dns-argan.txt:23-31,42-43»
ND-6008. Publicar biblioteca com dependências declaradas de rede, criptografia e banco, servindo ao nosso sistema e a qualquer projeto alheio que queira autoridade sobre seus nomes. «dns-argan.txt:35»
ND-6009. Delegar domínios pendurados por NS padrão com wildcard opcional apontando tudo para o mesmo edge e vhost pelo cabeçalho de host. «dns-argan.txt:36»
ND-6010. No cadastro de rótulo: validar formato, colisão e política, escrever na zona, persistir no banco, republicar por pipeline com serial novo e servir na hora, com healthcheck contra os grandes resolvedores. «dns-argan.txt:37»
ND-6011. Guardar zonas, chaves, DS e auditoria num banco único com esquema de zona, RRset, chave, DS e log, com serial crescente e rollback por versão anterior. «dns-argan.txt:38»
ND-6012. Sem porta 53, o servidor fala DoH sobre HTTPS e o cliente consulta por HTTP, atravessando firewall doméstico, corporativo e móvel; HTTPS público válido só via edge com túnel, self-signed apenas para dev e rede local. «dns-argan.txt:39»
ND-6013. Padronizar ambiente com fallback sensato: host neutro, portas web 3000, HTTPS 443 e DNS 53, timeout de 5s com retentativas, 8.8.8.8 como padrão. «dns-argan.txt:40»
ND-6014. Usar SPF restritivo, CAA da emissora padrão, TTL 3600 com NS e SOA em 86400 e certificado anual RSA 2048 com SHA-256 como padrão de zona. «dns-argan.txt:40»
ND-6015. Trocar zona no cluster por gossip HTTP com HMAC e filtro de origem, com segredo emitido na adesão autoaprovada, keep-alive por intervalo onde não há cron, rotas de adesão, sincronia, saúde, membros e encaminhamento para shard e failover. «dns-argan.txt:41»
ND-6016. Secondaries puxam por transferência autenticada; NOTIFY empurra a mudança sem esperar refresh do SOA. «dns-argan.txt:41,84,137»
ND-6017. A consulta anda sempre em três passos — stub envia pelo transporte, o outro lado valida, resposta volta em wire ou JSON com cache por TTL. «dns-argan.txt:47-49,154»
ND-6018. Tratar a escolha de transporte como troca de custo: clássico = mais rápido e mais visível; DoT tira a visibilidade mas entrega a porta; DoH se mistura ao tráfego web; DoQ junta privacidade e zero-RTT onde UDP passa. «dns-argan.txt:49-52»
ND-6019. Cobrir anonimato, rede local e nomes fora da raiz com canais especiais ao lado dos transportes principais. «dns-argan.txt:52-53»
ND-6020. Nunca entregar o gateway como substituto de resolver para quem pode configurar: o gateway atende só quem não troca de resolver, resolvendo pelo HTTP e embutindo a resposta, ao custo de um hop. «dns-argan.txt:239,281-284»
ND-6021. Assumir que só funciona o que a física permite: TLD novo sem instalação local não propaga e sem inbound público nenhum resolvedor consulta seu autoritativo. «dns-argan.txt:245-252,285-290»
ND-6022. Documentar a lição histórica duas vezes provada (2000-2012 plugin morto; caso do IP direto): raiz única não se contorna sem ponte (RFC 2826). «dns-argan.txt:285-296»
ND-6023. Soberania é opt-in por desenho: o mundial sem instalar vive no pendurado, o alternativo vive no instalado, o gateway cobre quem não pode encostar no resolver. «dns-argan.txt:291-296»
ND-6024. Jogar no quadrado vazio que nenhum concorrente entrega junto: resolver + autoritativo + domínios sob uma conta, DNSSEC real dia 1, DoH primeiro sem privilégio e biblioteca open-source embutível. «dns-argan.txt:243-252»
ND-6025. Mapear concorrentes por canto: resolvers públicos (privacidade sem autoridade), autoritativos grátis (zona sem resolver filtrável), gratuitos com API (automação sem marca), registrars (nome sem protocolo), raízes alternativas (soberania sem alcance). «dns-argan.txt:248-252,254-276»
ND-6026. Manter tabela viva de referências clicáveis por tipo ([repo]/[doc]/[svc]/[api]/[espelho]) para quem vai implementar cada camada. «dns-argan.txt:298-320»
ND-6027. Separar fontes em norma (RFCs do fio), guia de operador e código de referência — copiar padrão de implementação em vez de reinventar parser. «dns-argan.txt:322-330»
ND-6028. Incluir glossário multilíngue (7 idiomas) e pesquisa regional como referência de vocabulário do domínio. «dns-argan.txt:324-330»
ND-6029. Referenciar os ~40 tipos de registro agrupados por função (endereço, delegação, e-mail, descoberta, segurança, DNSSEC, miscelânea) — o servidor precisa parsear todos mesmo publicando poucos. «dns-argan.txt:92-111»
ND-6030. Documentar capacidade real vs. falta em tabela de estado, com três quebras concretas nomeadas (módulo DoH servidor ausente com imports quebrados, validação DNSSEC sem cripto real, servidor web lendo HTML de caminho divergente). «dns-argan.txt:163-190»

### Bloco B — Argan: protocolos do fio

ND-6031. DNS clássico: UDP/53 com fallback TCP/53 (RFC 1035 + 7766), truncamento com retry em TCP; assumir texto puro, fácil de filtrar/envenenar sem DNSSEC. «dns-argan.txt:61; 18.Glossarios.Terminologia.txt:1019-1021»
ND-6032. DoT: TLS 1.2/1.3 na TCP/853 com ALPN e sessão reutilizável (RFC 7858/8310), verificação de certificado configurável, somando 1 RTT. «dns-argan.txt:62»
ND-6033. DoH wire (RFC 8484): GET `?dns=` em base64url com ID zerado OU POST com o wire no corpo; o servidor entende os dois e responde em wire com `application/dns-message`. «dns-argan.txt:63; 00.0.txt:660-700»
ND-6034. DoH JSON: `/resolve?name=&type=` retornando JSON com status/pergunta/respostas (convenção Google/Cloudflare, sem RFC — RFC 8485 é outro assunto); reservado para web, debug e painel, nunca uso crítico. «dns-argan.txt:64»
ND-6035. DoQ (RFC 9250): QUIC com TLS 1.3 na UDP/853, ALPN `doq`, cada query na sua stream bidirecional iniciada pelo cliente, prefixo de 2 octetos + wire até 65535 bytes, com fallback para DoH. «dns-argan.txt:65»
ND-6036. DoH3: HTTP/3 sobre QUIC na UDP/443 para rede móvel com migração de conexão, com fallback para HTTP/2. «dns-argan.txt:66»
ND-6037. DNSCrypt: X25519 + XChaCha20-Poly1305, certificado em TXT próprio, queries com padding alinhado, modo anonimizado via relay — fora do IETF e com chave fora de banda. «dns-argan.txt:67»
ND-6038. ODoH (RFC 9230): separar proxy e alvo não coniventes com HPKE sobre chave publicada em registro próprio — o proxy vê o IP sem a query, o alvo vê a query sem o IP. «dns-argan.txt:68»
ND-6039. mDNS: `.local` em multicast UDP/5353 com anúncio e sonda de conflito (RFC 6762) — zero-conf local, sem auth, sem sair do link. «dns-argan.txt:70»
ND-6040. LLMNR: multicast 5355 como fallback legado quando o DNS falha, sabendo que spoof é fácil e nunca Standard. «dns-argan.txt:71»
ND-6041. Alt-roots via `resolv.conf`/stub-zone/forward com prova em chain ou DHT (OpenNIC 15 TLDs, Handshake, Namecoin, Emercoin) exigem config especial e votação/leilão para namespace novo. «dns-argan.txt:72»
ND-6042. Tor onion DoH: endpoint atrás de `.onion` pelo circuito (RFC 7686) para anonimato de transporte, pagando latência alta e exigindo Tor no cliente. «dns-argan.txt:73»
ND-6043. Tratar QUIC (RFC 9000/9114) como base unificada de transporte para DoQ/DoH3 e referência para protocolo próprio futuro com multipath. «dns-argan.txt:74»
ND-6044. Estudar roteamento por caminho, nome por conteúdo (DHT + apelidos humanos) e identidade descentralizada como ideias de fundo para anúncio de namespace com assinatura. «dns-argan.txt:75-77»
ND-6045. DDNS (RFC 2136): atualizar records por `nsupdate` com TSIG para IPs residenciais e agentes que republicam o próprio A/AAAA; provedores gratuitos e self-hosted mínimo sobre autoritativo com script por HTTP + cron. «dns-argan.txt:78»
ND-6046. TSIG: autenticar transferência de zona e update dinâmico com chave HMAC compartilhada, nomes de chave idênticos dos dois lados e janela de tempo anti-replay. «dns-argan.txt:79»
ND-6047. RRL: limitar taxa de respostas por prefixo de cliente, nome, tipo e classe contra DDoS/amplificação, com balde de tokens e modo deslizante que força retry em TCP, como plugin externo no recursador leve. «dns-argan.txt:80»
ND-6048. RPZ como firewall DNS: reescrever resposta para bloquear domínios maliciosos, ads e exfiltração direto no recursador. «dns-argan.txt:81»
ND-6049. Split Horizon: responder IP diferente conforme a origem da query, separando rede interna e mundo com a mesma zona lógica. «dns-argan.txt:82»
ND-6050. EDNS: OPT com 1232 bytes recomendados contra fragmentação; ECS para geolocalização; minimização de QNAME enviando só o rótulo necessário; padding para enxugar exposição de tamanho. «dns-argan.txt:83»
ND-6051. NOTIFY (RFC 1996) dispara transferência total ou incremental imediata após update ou republicação, com equivalente por push no sincronismo do cluster. «dns-argan.txt:84»
ND-6052. WHOIS (TCP/43 texto), RDAP (HTTPS/JSON com bootstrap oficial) e EPP (XML sobre TLS na 700) consultam dono/datas/nameservers e provisionam registros; o formal fica para o futuro com API REST leve resolvendo agora. «dns-argan.txt:85»
ND-6053. GNS (RFC 9498): petnames relativos a ego e zona com Curve25519 resolvidos em DHT, sem raiz central, com pontes que traduzem de e para o DNS comum. «dns-argan.txt:86»
ND-6054. Nomes em chain: Namecoin `.bit` com merged mining e ponte RPC; ENS `.eth` com gateway CCIP-Read; Unstoppable `.crypto` pagamento único; Emercoin NVS; Alfis sem moeda; KadNode `.p2p` leve. «dns-argan.txt:87»
ND-6055. Malha DHT: PKARR publica pacotes assinados ≤1000 bytes endereçados por chave em base32 na DHT com relays HTTP para navegador; HyperDHT faz descoberta e hole punching sem servidor central; libp2p transporta com relay de circuito atrás de NAT. «dns-argan.txt:88»
ND-6056. Overlays: Yggdrasil/cjdns por pubkey em mesh, Tor `.onion`, I2P `.i2p`, GNUnet `.alt` (RFC 9476), DTN offline-first — todos zero-config dentro do próprio software e invisíveis ao DNS clássico. «dns-argan.txt:89»
ND-6057. Raiz local (RFC 8806/7706): espelhar a raiz para consulta local, com zona secundária de raiz em um clique no servidor com GUI, reduzindo latência e exposição. «dns-argan.txt:90»
ND-6058. CNAME nunca vive no apex nem convive com outros tipos no mesmo nome; quem precisa de alias no apex usa ALIAS/ANAME com achatamento ou descoberta moderna (SVCB/HTTPS, RFC 9460). «dns-argan.txt:98-101,105,108»
ND-6059. E-mail correto: MX com preferência e fallback, TXT carregando SPF `v=spf1`, DKIM no seletor `selector._domainkey`, DMARC em `_dmarc` com política e relatórios, BIMI em `default._bimi`. «dns-argan.txt:107»
ND-6060. HINFO deve ser evitado em produção por vazar inventário; LOC publica presença física com precisão. «dns-argan.txt:111»

### Bloco C — Argan: confiança DNSSEC, DANE e ACME

ND-6061. Duas chaves com papéis distintos: KSK longa guardada que só assina chaves e ZSK curta que assina dados e roda sempre. «dns-argan.txt:115-119,128»
ND-6062. A cadeia desce do pai ao filho até cada resposta (DS→DNSKEY→RRSIG nível a nível) — o validador confere cada degrau sem confiar no transporte, partindo de âncora pré-instalada que ninguém aprende pela rede. «dns-argan.txt:116-118,129-131»
ND-6063. A assinatura acontece só no pipeline com zona compilada e chave lida de cofre, em container com cron curto; nunca no runtime. «dns-argan.txt:119-121,133,197»
ND-6064. Curvas elípticas obrigatórias no hospedeiro local porque RSA estoura CPU, banda e MTU com amplificação. «dns-argan.txt:122-124»
ND-6065. ZSK rolada a cada trimestre e KSK a cada 360 dias seguindo NIST SP 800-81r3 (2026) que separa guarda longa e uso curto; ED25519 (algoritmo 15, 256 bits) recomendado para novas zonas. «dns-argan.txt:128; 00.0.txt:745-760»
ND-6066. Rollover automático por CDS/CDNSKEY publicados na filha pedindo a troca de DS ao pai, com a nova chave publicada antes da antiga sair e dupla assinatura na transição. «dns-argan.txt:132; 18.Glossarios.Terminologia.txt:1047-1048»
ND-6067. Validação marca NXDOMAIN como provado via NSEC/NSEC3 (NSEC3 com salt contra zone-walk) e bogus o que falha. «dns-argan.txt:130,110»
ND-6068. Âncora de terceiros nunca entra sem cooperação de fornecedor — bootstrap de confiança é irredutível. «dns-argan.txt:131»
ND-6069. DANE/TLSA: publicar em `_porta._proto.nome` o RDATA `uso selector matching dados` (forma `3 1 1` + hash SHA-256 da chave), usos 0-3, valendo só quando a validação marca a resposta segura. «dns-argan.txt:134»
ND-6070. ACME dns-01: TXT em `_acme-challenge` com base64url de SHA-256 sobre token + thumbprint, CA lê direto no autoritativo sem cache, emite wildcard, delegável por CNAME com TTL 60s; staging separado para testes. «dns-argan.txt:135»
ND-6071. Certificados: geração local RSA 2048/SHA-256 por um ano, raiz 4096 ou P-384, folha 2048 ou P-256, SAN com apex/www/wildcard, cadeia com intermediária, permissão restrita e pinning com renovação automatizada. «dns-argan.txt:136»
ND-6072. Zona vive em texto clássico com `$ORIGIN`, `$TTL` e SOA; viaja inteira por AXFR (QTYPE 252) via TCP com ACL e TSIG, incremental pelo serial do SOA, com ZONEMD conferindo integridade pós-transferência; nunca resolvedor aberto. «dns-argan.txt:137»
ND-6073. Zona e RRset versionados: serial temporal formato AAAAMMDDNN (ex.: 2026071001), refresh 7200, retry 3600, expire 1209600, mínimo 3600. «00.0.txt:600-620»
ND-6074. Parse de zona cobrindo dez tipos, fábricas para quinze, 24 tipos conhecidos, com TTL padrão, NS longo, serial temporal e validação de IP/domínio/TTL e nomes absolutos. «dns-argan.txt:185»

### Bloco D — Argan: fluxos e estado real da biblioteca

ND-6075. Query clássica: UDP/53 com EDNS anunciando tamanho, cair para TCP se truncar, parsear, validar cadeia quando há DNSSEC, guardar no cache pelo TTL e entregar com log da origem. «dns-argan.txt:154»
ND-6076. Query DoH: `GET ?dns=` ou POST com mensagem binária, resposta wire em 2xx com cache HTTP alinhado ao TTL. «dns-argan.txt:155»
ND-6077. Update dinâmico: cliente assina com TSIG, o primary confere chave e janela, aplica na zona versionada com serial novo, dispara NOTIFY, secondaries puxam com a mesma autenticação. «dns-argan.txt:157»
ND-6078. Registro de nome: painel/API valida formato/colisão/política → escreve zona → persiste banco → republica por pipeline com serial novo → gateway serve na hora → verificação contra os grandes resolvedores. «dns-argan.txt:158»
ND-6079. Checagem de propagação: consultar 10-15 resolvedores de operadores distintos em paralelo por UDP e DoH com timeout, agrupar RRsets idênticos em total/parcial/inconsistente, cobrindo endereço, correio, texto, delegação e segurança com latência e TTL. «dns-argan.txt:159»
ND-6080. Propagação obedece aritmética de TTL: registro com TTL curto converge em minutos, troca de NS no pai com TTL longo leva 1-2 dias; a técnica é baixar TTL, esperar o ciclo, trocar e voltar. «dns-argan.txt:146-150»
ND-6081. Descoberta de rede: detectar IP público real, comparar com faixa de CGNAT, testar porta com consulta externa de amigo; sem inbound usar túnel reverso ou amigo com IP público via VPN, nunca redirecionamento caseiro sob CGNAT. «dns-argan.txt:161»
ND-6082. Cada falta trava um pedaço do diferencial: sem módulo servidor DoH não há modo sem-privilégio, sem cache o TTL não segura carga, sem resolvedor próprio não há minimização, sem WHOIS/RDAP e EPP o registro fica manual. «dns-argan.txt:174-176»
ND-6083. Pilha operante mínima: autoritativo primário com zona assinada, recursador com forward e RRL, secondary externo via transferência com TSIG, painel web com saúde e CRUD autenticado, orquestrador zero-hardcode com WHOIS de disponibilidade. «dns-argan.txt:187»
ND-6084. Dependências reais do motor: biblioteca de handshake v8 com binários node/CLI/RPC/carteira, DHT v6 com cripto, cliente ACME v5, banco embutido, servidor DNSSEC de referência, decodificador DoH, RDAP-first com fallback WHOIS, zona BIND, caches LRU duplos, WebSocket. «dns-argan.txt:189»
ND-6085. Publicação e web: scripts de cert, serve com ETags e segurança, publish com túnel rápido, página de publicação, resolvedor, construtor, manifesto, robots, sitemap e descoberta abertos. «dns-argan.txt:188»

### Bloco E — Argan: plano de 8 passos, domínio e canais P2P

ND-6086. A ordem ataca primeiro o que está quebrado, depois o que falta para operar e por fim a escala — bootstrap, DNSSEC, cluster, extensão e hardening; não faz sentido otimizar transporte antes de desquebrar o DoH nem federar antes de assinar. «dns-argan.txt:194-197»
ND-6087. Passo 1: construir módulo DoH servidor+cliente em wire e JSON no padrão RFC 8484, desquebrando as referências do CLI e do índice, servindo a primeira zona por HTTPS. «dns-argan.txt:204»
ND-6088. Passo 2: ligar cache com TTL alinhado ao HTTP, rate limiting próprio, reverso PTR, EDNS completo com ECS, minimização e padding e checagem de caminho no DoH. «dns-argan.txt:205»
ND-6089. Passo 3: resolvedor recursivo próprio com minimização de QNAME + checador de propagação multi-resolver com modo de observação + métricas de latência e hit-rate com endpoint leve. «dns-argan.txt:206»
ND-6090. Passo 4: completar zonefile para os 24 tipos com factories, DANE, CAA e rollover automático por CDS/CDNSKEY, com verificação criptográfica real na validação. «dns-argan.txt:207»
ND-6091. Passo 5: módulo DoQ no padrão RFC 9250 com fallback para DoH, mais extensão de browser com resolvedor embutido e regras declarativas e clientes de API externa. «dns-argan.txt:208»
ND-6092. Passo 6: fases bootstrap (DoH + zonas assinadas) → pipeline DNSSEC (CA privada + cron curto) → cluster (gossip + secondaries + adesão autoaprovada) → extensão e espelhos P2P → hardening (RRL, RPZ, ACL sem resolvedor aberto). «dns-argan.txt:209»
ND-6093. Passo 7: fundir no app com biblioteca consumida por configuração, docs no docs do app e CAA, TLSA e DMARC com rejeição no domínio desde o dia 1, deploy standalone e keep-alive interno sem tocar scripts de deploy. «dns-argan.txt:210»
ND-6094. Passo 8: testar wire ponta a ponta em todos os transportes, cadeia DNSSEC completa até a âncora, dns-01 em staging com wildcard e comparativo de latência/acerto com os grandes resolvedores. «dns-argan.txt:211»
ND-6095. Estratégia separa âncora e ponte: domínio próprio ancora site/NS/DS com segurança máxima dia 1; TLD de laboratório isola testes; ponte gratuita sob TLD existente leva o nome ao mundo sem custo. «dns-argan.txt:215-219»
ND-6096. Dia 1: publicar CAA restritiva, TLSA para DANE e DMARC p=reject junto com o domínio, antes de qualquer tráfego real. «dns-argan.txt:241»
ND-6097. Registry lock e CAA restritiva desde o dia 1 no domínio âncora, com apex apontando para o edge e wildcard opcional. «dns-argan.txt:230»
ND-6098. Subdomínio gratuito como rampa de entrada: pool compartilhado, europeu gratuito desde 1996 com fila manual, is-a.dev via pull request — aprovação de dias a uma semana. «dns-argan.txt:234,287-290»
ND-6099. Secundário anycast: cinco NS mundiais com puxada de IP via escravo dedicado, firewall liberando só esse IP, automação por scrape com sessão e provedor de controle ou chave dinâmica para IP que muda. «dns-argan.txt:222-224,235»
ND-6100. Secundário leve: cinco zonas gratuitas com transferência total e incremental, TSIG com nomes idênticos, NOTIFY para dois IPs, REST com chave e NS duplo. «dns-argan.txt:236»
ND-6101. Túnel sem IP: expor servidor local sem porta aberta nem IP fixo, com URL aleatória temporária para testes, túnel nomeado com rota de DNS para produção e edge válida automática. «dns-argan.txt:225-226,237»
ND-6102. Canais P2P espelham a zona sem depender de propagação clássica: CDN global via commit versionado, log distribuído por gossip, DHT com records mutáveis por chave, relays federados por tópico, conteúdo por hash, eventos assinados. «dns-argan.txt:240»
ND-6103. Gateway cobre quem não troca de resolver resolvendo pelo HTTP e embutindo a resposta com path sob o host e virtual host pelo cabeçalho, servindo estático como páginas. «dns-argan.txt:239,283-284»
ND-6104. Caso do IP direto: servidor web respondendo no IP prova publicação sem ICANN para conteúdo, mas sem nome, sem certificado público e sem DNS — não é contorno de raiz. «dns-argan.txt:293-294»
ND-6105. Domínio barato sob TLD real funciona como marca própria mundial com wildcard para um edge, dispensando namespace gratuito quando há verba mínima. «dns-argan.txt:232»

### Bloco F — Argan: resolvers de referência, ferramentas e zona real

ND-6106. LibreDNS: DoH `https://doh.libredns.gr/dns-query` + endpoint noads; DoT IP 116.202.176.26 porta 853 `dot.libredns.gr`; sem logs, OpenNIC como Tier 1. «dns.argan.txt:1-60»
ND-6107. Configuração DoT Linux no systemd-resolved: `DNS=IP#hostname` com `DNSOverTLS=yes` e FallbackDNS local; endpoint noads por hostname diferente. «dns.argan.txt:33-45»
ND-6108. radicalDNS: DNS aberto porta 53 em dois servidores como alternativa quando cifrado não está disponível; sem logs. «dns.argan.txt:62-90»
ND-6109. AdGuard: três perfis (default/unfiltered/family) disponíveis em DoH, DoT, DoQ, DNSCrypt (sdns://) e plain — a família de protocolos é a matriz de teste dos clientes. «dns.argan.txt:382-425»
ND-6110. Módulo Terraform private-dns-records: uma zona por call via `private_dns_zone_id` (princípio pass-ids), sete tipos tipados como mapas, semântica DNS validada no plan (colisão CNAME, PTR fora de reverse zone, SRV fora de faixa rejeitados). «dns.argan.txt:150-260»
ND-6111. Zona devthink.pro real: A @/*/app/mail/projects/www → 66.223.49.89, dev=Auto; SPF `v=spf1 a mx include:spf.postal.businessidentity.llc ~all`; DMARC p=quarantine com rua/ruf; DKIM postal-umopgu._domainkey h=sha256; NS ns1/ns2.hosting.businessidentity.llc; MX mailserver (prioridade 10); CNAME psrp→rp.postal. «dns.argan.txt:427-470»
ND-6112. Registrar de referência: Njalla (anonimato), Porkbun/Cloudflare Registrar (custo), Namecheap/NameSilo (volume), Unstoppable (pagamento único), Freename (TLD alugável). «dns-argan.txt:276»
ND-6113. Resolvers públicos para teste de propagação: Google dns.google (JSON público, sem hijack de NXDOMAIN), Cloudflare (wire e JSON), Quad9 (threat-intel), LibreDNS, Control D, NextDNS (perfis), Mullvad (sem logs, encerra 11/2026), AdGuard, OpenDNS. «dns-argan.txt:255-275»
ND-6114. Autoritativos grátis de referência: deSEC (DNSSEC sempre ligado, DANE ponta a ponta), HE dns.he.net (reverso, túnel IPv6, DDNS por chave, cinco NS anycast), ClouDNS (uma zona gratuita), ns-global.zone (secundário sem conta com confirmação de SOA). «dns-argan.txt:268-272»
ND-6115. Espelho de zona por CDN: jsDelivr servindo `zones/devthink.json` versionado por commit do repo, com esm.sh para imports dinâmicos e fallback em raw do GitHub. «dns-argan.txt:316-317»
ND-6116. Normas do fio obrigatórias: 1034/1035 base, 2181 esclarecimentos, 1912 serial, 1995/1996/5936 transferência, 2136 update, 2826 raiz única, 4033-4035 + 5155 DNSSEC, 6698 DANE, 6761/6762 especiais, 7766 TCP, 6891 EDNS, 7858 DoT, 8484 DoH, 9000/9114 QUIC, 9230 ODoH, 9250 DoQ, 9460-9462 descoberta, 9498 GNS. «dns-argan.txt:326»
ND-6117. Terminologia DNS ancorada em RFC 9499 (obsoleto 8499 → 7719); negação de existência RFC 7129; QName minimization RFC 7816; aggressive cache DNSSEC RFC 8198. «18.Glossarios.Terminologia.txt:1019,1028,1034-1039»
ND-6118. CAA RFC 8659 autoriza emissoras; ACME RFC 8555; EDNS padding RFC 8744; raiz local RFC 8806; DoQ RFC 9250; SVCB/HTTPS RFC 9460; error reporting RFC 9567. «18.Glossarios.Terminologia.txt:1043-1056»
ND-6119. EPP: RFC 5730 (protocolo) + 5731 (mapeamento de domínio); IDNA RFC 5890/5891 com Punycode RFC 3492 para nomes internacionalizados. «18.Glossarios.Terminologia.txt:1018-1030»

### Bloco G — TLD alternativo self-hosted (outros.dns/00.0.txt)

ND-6120. Excluir opções pagas, Handshake, OpenNIC e uso da porta 53 — rodar DNS em contêiner via DoH/DoT. «00.0.txt:2-16,323-338»
ND-6121. Propagação global nativa de TLD alternativo é impossível sem ICANN: ISPs e resolvedores grandes obedecem à raiz IANA e respondem NXDOMAIN — assumir isso em vez de lutar contra. «00.0.txt:105-130»
ND-6122. Os três caminhos de propagação alternativa: resolvedor recursivo criptografado compartilhado (DoH/DoT), redes P2P (GNS com ponte gnunet-dns2gns), e zonas raiz alternativas coletivas com root hints sincronizados. «00.0.txt:132-152»
ND-6123. Certificado Let's Encrypt é impossível para TLD alternativo (CA valida só via DNS ICANN) — a solução real é CA privada self-hosted (openssl/mkcert) com distribuição e confiança manual da Root CA nos clientes. «00.0.txt:155-185»
ND-6124. DNSSEC no TLD alternativo é 100% viável: assinar zona com ECDSA P-256 (algoritmo 13) via dnssec-keygen `-a ECDSAP256SHA256 -f KSK` e plugin dnssec no Corefile assinando on-the-fly; cliente precisa da trust anchor configurada manualmente. «00.0.txt:190-215»
ND-6125. Yeti DNS como raiz paralela IPv6-only de teste: resolvedor Unbound em container com trust anchors do Yeti (yeti-key.key) encaminhando via DoT na 853. «00.0.txt:225-248»
ND-6126. EmerDNS (Emercoin NVS) para soberania absoluta: apenas o portador da chave privada que assinou a transação de registro escreve; daemon embute servidor DNS RFC 1035 e traduz `A=IP|NS=ns` em records; zonas .emc/.coin/.lib/.bazar. «00.0.txt:250-270»
ND-6127. IPNS para P2P puro sem blockchain: endereço fixo = hash de chave pública IPNS apontando para conteúdo mutável, propagação por DHT do IPFS, registro e publicação gratuitos. «00.0.txt:273-285»
ND-6128. Isolamento gVisor obrigatório para a stack DNS descentralizada: `runtime: runsc` no docker-compose do nó blockchain, CoreDNS e API registradora — syscalls interceptadas em espaço de usuário contra RCE. «00.0.txt:288-330»
ND-6129. API registradora stateless em Node.js fala JSON-RPC autenticado com o nó blockchain (`name_new`/`name_update`), com sanitização de entrada (lowercase + whitelist `[a-z0-9-_]` para domínio, whitelist numérica para IP, dias default 100). «00.0.txt:335-380»
ND-6130. Sem Docker, isolar resolvedor com Firejail: `firejail --private --net=eth0 --nogroups --nonewprivs coredns -conf /etc/coredns/Corefile`. «00.0.txt:385-395»
ND-6131. Comparativo de escolha de rede P2P por custo: GNS grátis, YggNS grátis, ALFIS PoW de CPU, Namecoin taxa de rede, EmerDNS taxa — escolher por topologia (DHT/mesh/blockchain) e base de dados (cache local/SQLite/sincronização). «00.0.txt:455-470»
ND-6132. Importação da raiz oficial por AXFR (`dig . AXFR @f.root-servers.net`) processada localmente com adição dos records de delegação do TLD customizado. «00.0.txt:490-500»
ND-6133. db.root da raiz alternativa: SOA com serial de data, NS ns1/ns2.raiz-alternativa, AAAA 2001:db8::53 + A fixos, delegação `allan. IN NS ns1.tld-allan.` com A do servidor do TLD. «00.0.txt:600-625»
ND-6134. Corefile da raiz alternativa: zona `.:53` com `file /etc/coredns/db.root` + `forward . tls://8.8.8.8 tls://8.8.4.4 { tls_servername dns.google }` + log/errors/health :8080/cache 300; zona `allan:53` com `file /etc/coredns/db.allan`. «00.0.txt:555-580»
ND-6135. Proxy DoH em Node.js: validar endpoint `/dns-query` e método; POST com limite de payload 512 bytes (413); GET com base64url normalizado (`-`→`+`, `_`→`/`); encaminhar via UDP para CoreDNS interno; responder com `Cache-Control: public, max-age=300` e CORS `*`; erros → 502/400. «00.0.txt:660-740»
ND-6136. Auditar decodificando o pacote apenas para log local do domínio pesquisado — nunca logar payload completo do usuário. «00.0.txt:685-690»
ND-6137. Orquestração docker-compose com rede bridge dedicada (subnets 172.20.0.0/24 ou 172.30.0.0/16), IPs estáticos internos, CoreDNS sem portas públicas e proxy DoH expondo só 443/8443. «00.0.txt:740-780; 3203-3225»
ND-6138. Tabela de parametrização DNSSEC self-hosted: ZSK ED25519 256 bits rotação 90 dias, KSK ED25519 rotação 360 dias, NSEC3 com sal aleatório dinâmico, digest DS SHA-256 (algoritmo 2). «00.0.txt:745-762»
ND-6139. Script de assinatura (`script_sign_zone.sh`) com ajuste estrito de permissões de leitura para proteger chaves privadas e NSEC3 com sal de 16 caracteres hex. «00.0.txt:787-830»
ND-6140. Pipeline Woodpecker CI (.woodpecker.yml) para build/publicação da zona assinada. «00.0.txt:830-840»
ND-6141. Nó DNS em container roda como usuário não-root com workdir interno próprio, dependências de produção limpas e inicialização forçando ESM nativo. «00.0.txt:3203-3225»
ND-6142. Republicador PKARR: script `/bin/sh` de manutenção executado no anfitrião ou no contêiner Docker republished chaves na DHT periodicamente. «00.0.txt:3450-3455»
ND-6143. Desabilitar resolvedor nativo no host: mascarar systemd-resolved, remover symlink do stub listener e criar resolv.conf estático apontando para o gateway local. «00.0.txt:3023-3031»
ND-6144. TLD de laboratório `.allan` delegado no db.root como zona autoritativa local — modelo de namespace próprio isolado da raiz pública. «00.0.txt:571-580,618-625»

### Bloco H — Arquitetura completa do TLD próprio (outros.dns/21.Arquitetura)

ND-6145. Princípios de design: soberania total (nenhuma dependência externa para operações críticas), custo zero, simplicidade operacional, segurança em profundidade, extensibilidade modular. «21.Arquitetura.Roadmap.Implementacao.txt:45-52»
ND-6146. Camadas: acesso (cliente/admin) → entrada (LB/proxy reverso Nginx/Caddy) → aplicação (painel Next.js, API Fastify, EPP próprio, WHOIS/RDAP) → DNS (root NSD/Knot, master PowerDNS, slaves, resolver Unbound) → segurança (step-ca, DNSSEC signing, firewall) → dados (PostgreSQL, Redis, arquivos) → monitoramento (Prometheus, Grafana, Loki, Alertmanager). «21.Arquitetura.Roadmap.Implementacao.txt:55-120»
ND-6147. Master autoritativo = PowerDNS Authoritative 4.x com backend PostgreSQL, REST API nativa na 8081, DNSSEC nativo, replicação AXFR/IXFR e protocolos UDP/TCP 53 + DoH 443 + DoT 853. «21.Arquitetura.Roadmap.Implementacao.txt:150-165»
ND-6148. pdns.conf: `master=yes`, `allow-axfr-ips` restrito por CIDR, `also-notify` para slaves, `api=yes` com api-key, webserver só em 127.0.0.1, `guardian=yes`, setuid/setgid dedicados, caches 60s. «21.Arquitetura.Roadmap.Implementacao.txt:170-200»
ND-6149. Slaves = NSD/Knot (apenas autoritativo, alta performance) com `allow-notify` e `request-xfr` do master, `server-count: 2`, usuário dedicado nsd. «21.Arquitetura.Roadmap.Implementacao.txt:205-240»
ND-6150. Firewall nftables com policy drop, loopback e established aceitos, SSH em porta não-padrão (2222), DNS 53 tcp/udp, HTTP(S), WHOIS 43, WireGuard 51820, rate limiting DNS `limit rate 100/second burst 200 packets` e log de drops. «21.Arquitetura.Roadmap.Implementacao.txt:1304-1340»
ND-6151. Hardening de SO: desabilitar avahi/cups/bluetooth, SSH sem root/senha com pubkey e MaxAuthTries 3, sysctl bloqueando redirects/source-route, `kernel.randomize_va_space=2`, proteção de hardlinks/symlinks. «21.Arquitetura.Roadmap.Implementacao.txt:1342-1365»
ND-6152. Fail2Ban com jails sshd (maxretry 3, bantime 3600) e dns-flood (maxretry 100, bantime 600, findtime 60). «21.Arquitetura.Roadmap.Implementacao.txt:1367-1382»
ND-6153. TLS moderno: TLSv1.2/1.3 apenas, ECDHE-ECDSA/RSA-AES-GCM, session cache compartilhado, tickets off, OCSP stapling on, HSTS max-age 63072000 includeSubDomains, X-Frame-Options DENY, nosniff, Referrer-Policy strict-origin-when-cross-origin. «21.Arquitetura.Roadmap.Implementacao.txt:1385-1400»
ND-6154. Práticas de segurança: menor privilégio com usuário por serviço, containers com redes separadas, secrets em env ou Vault, unattended upgrades, backup diário criptografado AES-256, chroot/jail dos serviços DNS, segmentação por VLAN/redes Docker. «21.Arquitetura.Roadmap.Implementacao.txt:1425-1440»
ND-6155. Escala por dimensão: mais slaves com AXFR para queries, read replicas PostgreSQL para banco, horizontal + LB para web/API, Redis Cluster sharded para cache. «21.Arquitetura.Roadmap.Implementacao.txt:1461-1470»
ND-6156. Roadmap em 7 fases (18 semanas): 1 fundação DNS (PowerDNS master + zona + root + Unbound + DNSSEC básico), 2 web e segurança (Nginx + step-ca + nftables + Fail2Ban), 3 banco e API (PostgreSQL backend + CRUD + Redis), 4 painel e registro (Next.js + WHOIS/RDAP), 5 redundância (slaves + replicação + WireGuard + failover), 6 monitoramento (Prometheus/Grafana/Loki), 7 EPP e operação comercial (EPP + faturamento + checkout). «21.Arquitetura.Roadmap.Implementacao.txt:1829-1955»
ND-6157. Cada fase termina com entregáveis verificáveis antes da próxima (DNS resolvendo → HTTPS com CA própria → API funcional → painel → HA → observabilidade → EPP). «21.Arquitetura.Roadmap.Implementacao.txt:1834-1950»
ND-6158. Modelo de negócio do registry: registro, transferência, renovação e restore com faturamento próprio e provisionamento automático de zona DNS. «21.Arquitetura.Roadmap.Implementacao.txt:2010-2195»
ND-6159. Servidor EPP próprio com comandos check/create/info/update/delete/renew/transfer autenticados por certificado de cliente TLS. «21.Arquitetura.Roadmap.Implementacao.txt:2196-2400; 10.Nodejs.Implementacao.Completa.txt:84-160»

### Bloco I — Implementação Node.js, infra de sandbox e glossário (outros.dns)

ND-6160. Servidor DNS autoritativo em Node com dns2: mapa ZONES por nome com records A/NS/SOA tipados, `Packet.createResponseFromRequest`, rcode NoError se respondeu e NXDOMAIN se vazio, escuta UDP em 127.0.0.1:5333. «10.Nodejs.Implementacao.Completa.txt:8-70»
ND-6161. DNSSEC com dnssec-server: zonas com arquivo, flags ksk/zsk em arquivos de chave separados e porta 5353. «10.Nodejs.Implementacao.Completa.txt:72-82»
ND-6162. EPP server: TLS com requestCert e rejectUnauthorized, parser XML (fast-xml-parser), dispatcher por comando com resposta XML versionada, erro 2100 para comando não suportado, escuta na porta 700. «10.Nodejs.Implementacao.Completa.txt:95-160»
ND-6163. TLD de referência em Node chamado `tink`: SOA serial 2026062101, refresh 3600, retry 900, expire 604800, minimum 86400, NS ns1/ns2 com TTL 3600. «10.Nodejs.Implementacao.Completa.txt:12-40»
ND-6164. Sandbox: RAM não expande (sem root, sem swap, sem zram, /dev/shm travado em 64MB) — 3 GiB livres de RAM é o teto, ponto. «00.4.txt:40-70»
ND-6165. Hierarquia de storage real: rootfs local rápido 8GB → kataShared 503GB read-only → PolarFS FUSE distribuído 123 MB/s escrita → OSS upload 63 MB/s virtual ilimitado → /dev/shm 2.3 GB/s com 64MB fixo. «00.4.txt:72-100»
ND-6166. Estratégia de dados no sandbox: quentes (zone files ativas, cache) em RAM + PolarFS; frios (logs históricos) em OSS; banco SQLite local no /home/z; compressão zstd em memória; streaming sem carregar tudo na RAM; cache LRU agressivo. «00.4.txt:108-118»
ND-6167. Cache DNS em RAM limitado a ~512MB deixando 2.5GB para o resto; no máximo 2 workers pesados em paralelo (2 vCPU). «00.4.txt:106-112»
ND-6168. DNS é leve em RAM e pesado em rede/CPU — arquitetar para isso em vez de pedir mais memória. «00.4.txt:104-108»
ND-6169. "64 PB" reportado é tamanho virtual do cluster PolarFS, não cota — a cota real aceita múltiplos GB sem reclamar; nunca confundir virtual com utilizável. «00.4.txt:88-96»
ND-6170. Deploy de web estática do monorepo: GitHub Pages com Node 26.7.0 e `SADDLE_PAGES_BASE_PATH`; GitLab com node:26.7.0 copiando `web/dist/public` para `public/` com `pages: true`; Forgejo/Codeberg com actions fully-qualified de data.forgejo.org; Woodpecker em container node:26.7.0. «collection-text-md-auth-01.txt:5-30»
ND-6171. Limpeza de duplicatas no tree web: arquivo canônico = path sem sufixo numérico `(1)/(2)/(3)`; consolidação manteve variantes úteis do tsconfig (target ESNext, forceConsistentCasingInFileNames) e removeu 310 arquivos duplicados + pastas other1/other2. «collection-text-md-auth-01.txt:32-44»

### Bloco J — cadria/iukka: player de mídia universal (PWA)

ND-6172. iukka = "iukka Player": universal media player PWA "stream any format, anywhere" com display standalone + window-controls-overlay, tema escuro #0a0a0a, lang pt-BR, categorias entertainment/utilities/media. «outros.iukka/json/manifest.txt:1-30»
ND-6173. Manifest PWA completo: 11 ícones (72→512 + maskable), screenshots narrow 390×844 e wide 1920×1080, shortcuts para player e library, share_target POST multipart aceitando video/audio/image, file_handlers para 9 extensões de vídeo/7 de áudio/8 de imagem, protocol handler `web+iukka`, edge_side_panel 400px, launch_handler navigate-existing. «outros.iukka/json/manifest.txt:32-150»
ND-6174. Stack do player: React 19 + Vite 8 + framer-motion + lucide-react; vídeo com @videojs/http-streaming, hls.js, dashjs, flv.js, video.js; áudio com howler; documentos com pdfjs-dist, mammoth, marked, xlsx; sanitização com dompurify; realtime com socket.io. «outros.iukka/json/package.txt:10-40»
ND-6175. Build e dev: `dev` roda client vite + server nodemon/tsx concurrently; `build` = tsc && vite build && copy-static; lint com `--max-warnings 0`; deploy gh-pages; Helmet no servidor Express. «outros.iukka/json/package.txt:6-16,44-70»
ND-6176. Classificação de arquivo por extensão antes de renderizar: IMAGE_EXTS (jpg/jpeg/png/gif/svg/webp/bmp/ico), AUDIO_EXTS (mp3/wav/oga/ogg/flac/aac/wma), DOC_EXTS (pdf/docx/doc/xlsx/xls/txt/md/csv) — mesmo no componente "VideoPlayer". «outros.iukka/tsx/VideoPlayer.txt:18-25»
ND-6177. Nome de arquivo sempre sanitizado com DOMPurify `ALLOWED_TAGS: []` antes de qualquer render — nunca innerHTML com nome de arquivo do usuário. «outros.iukka/tsx/VideoPlayer.txt:70-72»
ND-6178. Volume em ciclos discretos [0, 0.25, 0.5, 0.75, 1] com mute automático no zero. «outros.iukka/tsx/VideoPlayer.txt:47-56»
ND-6179. Auto-hide dos controles após 3s apenas se reproduzindo; qualquer mousemove/touch reaparece. «outros.iukka/tsx/VideoPlayer.txt:88-105»
ND-6180. Detecção mobile via `matchMedia("(max-width: 768px)")` OU presença de `ontouchstart`, reavaliada no resize. «outros.iukka/tsx/VideoPlayer.txt:76-84»
ND-6181. Sincronização local sem servidor: BroadcastChannel `iukka_channel` + localStorage (`iukka_files`, `iukka_messages`) com mensagens tipadas file:uploaded / chat:message / sync:state e merge por Map(id) preservando existentes. «outros.iukka/ts/useCommunication.txt:23-95»
ND-6182. Fallback de sincronia via StorageEvent quando BroadcastChannel não existe; isConnected=false em caso de exceção. «outros.iukka/ts/useCommunication.txt:97-110»
ND-6183. Mensagens de sistema inseridas em ações de arquivo ("Novo arquivo carregado: X") com flag isSystem e id = timestamp + random base36. «outros.iukka/ts/useCommunication.txt:60-75,130-155»
ND-6184. URL de mídia local via `URL.createObjectURL(file)` com metadados id/name/size/type/uploadedAt — nunca persistir o File em si. «outros.iukka/ts/useCommunication.txt:118-128»
ND-6185. ErrorBoundary de classe com getDerivedStateFromError + componentDidCatch logado, tela de erro com role=alert/aria-live, botão retry que reseta estado. «outros.iukka/tsx/App.txt:47-115»
ND-6186. VideoPlayer carregado com lazy + Suspense e fallback de loading com role=status; tecla Escape sai do player para a home. «outros.iukka/tsx/App.txt:28,120-160»
ND-6187. Transição de telas (home/library/player/upload/settings) com framer-motion: initial opacity 0 y 8 → animate → exit y -8. «outros.iukka/tsx/App.txt:30-37»
ND-6188. Design system CSS em @property customizado: --neon-hue (number 340), --border-angle (angle), --glow-opacity (number 0.4) com inherits explícitos. «outros.iukka/css/index.txt:1-14»
ND-6189. Paleta cinematográfica dark: bg-deep #0a0a0a, graphite #141414, charcoal #1e1e1e, border #2a2a2a, silver #c0c0c0, accent premium #6366f1 + glow #8b5cf6, texto #f5f5f5/a3a3a3/737373. «outros.iukka/css/index.txt:20-34»
ND-6190. Aliases de legibilidade: tokens canônicos + aliases legacy (--bg-primary → var(--color-bg-deep) etc.) mantidos para não quebrar componentes antigos. «outros.iukka/css/index.txt:35-50»
ND-6191. Tipografia: Inter/SF Pro Display para heading e body, JetBrains Mono/SF Mono para mono; escala fixa 12/14/16/18/20/24/30/36px. «outros.iukka/css/index.txt:53-64»
ND-6192. Espaçamento em grid de 8px (4/8/16/24/32/48/64) e raios 8/12/16/24/32/pill 9999px. «outros.iukka/css/index.txt:66-80»
ND-6193. Glassmorphism ultra premium: blur 80px, saturate 200%, brightness 0.9, bg rgba(20,20,20,0.6), border rgba(255,255,255,0.08), sombra tripla com inset highlight. «outros.iukka/css/index.txt:82-90»
ND-6194. Acessibilidade de movimento: bloco reduced-motion desligando loading-dot/skeleton/shimmer/fade/slide/scale/stagger/ripple/text-gradient/border-animate e forçando opacity 1 transform none. «outros.iukka/css/index.txt:3860-3886»

### Bloco K — cadria/create: plataforma web criativa (âncoras + Supabase)

ND-6195. Estrutura canônica em pastas por domínio na raiz (sem /src): cada pasta tem o âncora ⚓ orquestrador (mesmo nome da pasta), a página (sufixo page), componentes e lógica — estrutura.md é a fonte da verdade e nenhuma estrutura diferente pode ser criada. «outros.create/md/estrutura.txt:1-30; md/featuresupdate.txt:75-83»
ND-6196. app.tsx importa APENAS arquivos âncora; âncoras importam componentes/bibliotecas/recursos; componentes não importam nada diretamente — tudo passa pelos âncora. «outros.create/md/featuresupdate.txt:118-137»
ND-6197. PROIBIDO criar: pasta /src, arquivo index.ts, core-hidden.js, /dist para links ofuscados, /public para assets ofuscados, qualquer estrutura fora do estrutura.md. «outros.create/md/featuresupdate.txt:72-85»
ND-6198. PROIBIDO no build: modulepreload com hash, stylesheet com hash, apple-touch-icon com hash, qualquer hash aleatório em nomes de arquivo, qualquer ofuscação de paths no HTML final. «outros.create/md/featuresupdate.txt:88-100»
ND-6199. Correto no build: favicon.ico, arquivo.svg, robots.txt e sitemap.xml com nomes originais linkados corretamente, seguindo o modelo do oldindex.txt. «outros.create/md/featuresupdate.txt:102-110»
ND-6200. vite.config desabilita hash em nomes, modulepreload automático e ofuscação de links; index.html segue oldindex.txt — Vite não sobrescreve com hashes. «outros.create/md/featuresupdate.txt:333-374»
ND-6201. REGRA ABSOLUTA: todos os imports em lowercase — verificar um a um, converter, renomear arquivos, atualizar referências e testar cada import após a correção. «outros.create/md/featuresupdate.txt:160-173»
ND-6202. Detecção de ambiente obrigatória: `window.location.hostname === 'localhost'` escolhe base dev; produção usa domínio real — aplicar em Supabase Auth redirectTo, todos os servidores em /servers e variáveis de ambiente. «outros.create/md/featuresupdate.txt:198-216»
ND-6203. Login NUNCA redireciona para localhost:3000 na web; fluxo correto é https://(site)/#access_token=... → /projects; supabase configurado com URL fixa de localhost é causa raiz de falha em produção. «outros.create/md/featuresupdate.txt:180-196»
ND-6204. Fluxo de autenticação: /intro (aparece UMA vez) → /homepage → signin/signup Google → /onboarding (UMA vez, antes de projects) → /projects. «outros.create/md/featuresupdate.txt:244-266»
ND-6205. Fluxo de pagamento: /plans → /checkout (servidor de pagamento DEVE funcionar) → /success; não pular a página de checkout. «outros.create/md/featuresupdate.txt:269-288»
ND-6206. Toda rota não definida vai para página 404; rotas administrativas protegidas; árvore de rotas completa preparada para gerenciamento externo. «outros.create/md/featuresupdate.txt:291-304»
ND-6207. ak.js é o único redirecionador cifrado em produção (web): sem core-hidden.js, inicia app.tsx direto, segue estrutura.md e funciona no Netlify SEM Functions. «outros.create/md/featuresupdate.txt:307-330; md/estrutura.txt:15-17»
ND-6208. Prioridades de correção classificadas: CRÍTICO (localhost na web, token Supabase em produção, servidor de pagamento), ALTO (imports, âncoras, lowercase, ak.js), MÉDIO (navegação, 404, hashes), BAIXO (robots/sitemap/favicon). «outros.create/md/featuresupdate.txt:408-434»
ND-6209. Pré-execução mandatória antes de alterar: ler estrutura.md e oldindex.txt completos, analisar ofuscation & html works, mapear imports com grep/search agents e criar TODO list (excluir/mesclar/editar/mover/renomear/atualizar/criar/escrever/modificar) antes de qualquer mudança. «outros.create/md/featuresupdate.txt:10-65»
ND-6210. Arquivos raiz canônicos: .env.local, _headers, _redirects, ads.txt, ak.js, app.tsx, bun.lock, estrutura.md, index.html, metadata.json, netlify.toml, sitemap.xml, keywords.txt, devthink.jpg, favicon.svg/ico, robots.txt, supabase-tables.sql, tsconfig.json, vite.config.ts. «outros.create/md/estrutura.txt:1-25»
ND-6211. supabase-tables.sql cobre user-signup, user-switch-subscription, user-signin, user-admin, user-storage, user-subscription e esquema de storage quotas + onboarding. «outros.create/md/estrutura.txt:22-24»
ND-6212. Domínios da plataforma (pastas): 404, 3dstudio (webglviewport/shadergraph/scenegraph/materialeditor/gizmocontrols), about, ads (modais 16:9/4:4/4:5/9:16), store, animations, audio (DAW completa com mixer/sequencer/effectsrack/transport/export), balance, canvaseditor (artboard/layers/toolbar/properties), tips, chat, checkout, code_ide (monaco/fileexplorer/terminal/previewpane), gallery, home, help, themes, icons, intro, library, mockup, nav, dropdown. «outros.create/md/estrutura.txt:27-200»
ND-6213. Sistema de ícones com 16 sets (basicons, feather, flowbite, fluent2, hero, iconic, lucide, mage, material, meteor, nonicons, phosphor, sargam, shadcdn, winui3) orquestrados por useicons.ts âncora. «outros.create/md/estrutura.txt:160-180»
ND-6214. Temas como pasta própria: themespage + toggle reutilizável (topbar) + themes.ts âncora + componentes black/white. «outros.create/md/estrutura.txt:150-158»
ND-6215. Servidor de storage em Express na porta 3006 com Supabase service-role (autoRefreshToken false, persistSession false), CORS credentials true, dotenv de .env.local, mapeamento snake_case→camelCase para projects/files. «outros.create/ts/storage.txt:1-75»
ND-6216. Health check por servidor: `GET /api/storage/health` retorna `{ status: 'ok', server: 'storage', port }`. «outros.create/ts/storage.txt:77-80»
ND-6217. Listagem de projetos por usuário filtra is_deleted=false por padrão (includeDeleted opt-in), ordenado por updated_at desc; criação de projeto com size > 0 chama RPC `update_storage_usage(p_user_id, p_bytes_change)`. «outros.create/ts/storage.txt:84-140»
ND-6218. Storage server gerencia apenas METADADOS (project ids, file metadata, trash, configs); os arquivos em si são enviados para outro lugar. «outros.create/ts/storage.txt:1-4»

### Bloco L — owni: galeria Pro Max (componente absorvido)

ND-6219. OWNI = "Pro Max Gallery": galeria responsiva web/mobile com estética premium dark, glassmorphism e interações platform-native; licença Apache 2.0. «outros.owni/md/README.txt:1-10»
ND-6220. Stack owni: TypeScript + React 19 + Vite 6 + Framer Motion + Lucide React + Biome; pnpm como gerenciador. «outros.owni/md/README.txt:12-22; yaml/pnpm-lock.txt:1-10»
ND-6221. Componentes owni fixos: Header (busca), FilterBar (pills de categoria), MasonryGrid, VideoCard, AudioCard (waveform), ImageCard (aspect ratios), Lightbox, UploadZone, Toast — com barrel exports em components/index.ts. «outros.owni/md/README.txt:24-56»
ND-6222. Estado central no hook useGallery: filtragem por categoria + busca case-insensitive em title/description/category, likes, lightbox e toasts com Map de timeouts por toast. «outros.owni/ts/useGallery.txt:7-60»
ND-6223. Categorias fixas com contadores: All (total), Sites, Apps, Tools, Components. «outros.owni/ts/useGallery.txt:52-60; ts/galleryData.txt:30-36»
ND-6224. MasonryGrid com colunas adaptativas 1-4 conforme largura de viewport. «outros.owni/md/README.txt:16-18»
ND-6225. Lightbox: backdrop `rgba(5,5,7,0.85)` com backdropFilter blur 40px, modal maxWidth 900 com raio var(--radius-xl), fechar por Escape, click-outside e botão 40px; áreas dedicadas para imagem (contain 60vh), vídeo placeholder 16:9 e áudio com waveform de 64 barras. «outros.owni/tsx/Lightbox.txt:15-165»
ND-6226. z-index do lightbox = 1000 e botões circulares com backdrop blur 8px — consistente com Z-index 0-1000 universal. «outros.owni/tsx/Lightbox.txt:19-24»
ND-6227. Play buttons com gradiente #7c7cff→#5a5aee e glow rgba(124,124,255,0.35); barra de progresso com gradiente animado 7c7cff→a78bfa→7c7cff. «outros.owni/tsx/Lightbox.txt:80-160»
ND-6228. UploadZone: borda dashed 2px rgba(124,124,255,0.2), estados hover/drop/success com borderColor/boxShadow distintos, scale 1.01 no drop, minHeight 180. «outros.owni/tsx/UploadZone.txt:26-70»
ND-6229. Badges de formato suportado com cor por formato: MP4/WEBM/MOV/MP3/WAV/PNG/JPG/WEBP/SVG/GIF (10 formatos, input hidden para file picker). «outros.owni/tsx/UploadZone.txt:15-25,72-80»
ND-6230. Mock data de galeria gera thumbnails via SVG data-URI com gradiente encodeURIComponent e waveforms aleatórias de 64 pontos — nunca binário placeholder. «outros.owni/ts/galleryData.txt:8-20»
ND-6231. Metadados do item de galeria: id, type (video/audio/image), title, description, category, thumbnail, src, format, duration, dimensions, fileSize, createdAt (ISO), liked. «outros.owni/ts/galleryData.txt:22-40»
ND-6232. Tipos por projeto com barrel: types/index.ts reexportando gallery.ts (GalleryItem, LightboxState, MediaCategory, ToastState); helpers com uid(). «outros.owni/md/README.txt:50-60; ts/useGallery.txt:5-8»
ND-6233. Estilos inline via Record<string, CSSProperties> com tokens CSS (var(--radius-xl), var(--glass-border), var(--color-graphite)) — não CSS global por componente. «outros.owni/tsx/Lightbox.txt:14-20; UploadZone.txt:26-40»
ND-6234. Microinterações obrigatórias: hover scale, overlay gradients, play button overlays, staggered entry, toasts, like toggle com coração, transições suaves. «outros.owni/md/README.txt:32-36»

### Bloco M — video/@devthink/player: player agnóstico de framework

ND-6235. Pacote canônico `@devthink/player` v1.0.0: "framework-agnostic video player with WebGPU filters, WebAudio EQ, WebSocket/WebRTC, and glassmorphism UI", MIT, ESM, sideEffects false, bin `devplayer`. «outros.video/json/package.txt:1-12»
ND-6236. Exports por módulo: index, ambient, chapters, codecs, effects, filters, gestures, media, net, player, providers, stall, types, ui, utils — arquivos .ts na raiz publicados no pacote. «outros.video/json/package.txt:20-52»
ND-6237. Qualidade: `check` = typecheck (tsc --noEmit) + lint (biome check) + test (vitest run); engines node >=26.2.0 e bun >=1.4.0. «outros.video/json/package.txt:56-75»
ND-6238. Arquitetura de providers: classe abstrata BaseProvider com contrato load/play/pause/seek/setVolume/setMuted/setPlaybackRate/getDuration/getCurrentTime/getElement/destroy, emitindo eventos no player e markReady → 'ready'. «outros.video/ts/providers.txt:14-50»
ND-6239. HTML5Provider: elemento video com className 'dtp-video', crossOrigin anonymous e playsInline true sempre. «outros.video/ts/providers.txt:52-60»
ND-6240. HLS: hls.js quando isSupported(), fallback nativo via `canPlayType('application/vnd.apple.mpegurl')`; erro fatal do HLS emitido como Error tipado. «outros.video/mjs/index.txt:385-400»
ND-6241. DASH: dashjs MediaPlayer().create() + initialize; se dashjs não carregado, emitir erro "dash.js not loaded" em vez de quebrar. «outros.video/mjs/index.txt:410-425»
ND-6242. YouTube provider: extração de id por regex (watch?v=, youtu.be/, embed/), iframe embed com modestbranding=1, rel=0, autoplay/mute/loop opcionais e privacyMode usando youtube-nocookie.com. «outros.video/mjs/index.txt:78-90»
ND-6243. Vimeo provider: iframe player.vimeo.com/video/{id}?autoplay=0&controls=0&dnt=1, API via postMessage JSON-RPC com verificação de origin e eventos ready/play/pause. «outros.video/mjs/index.txt:305-345»
ND-6244. Fila de ações: comandos no provider vão por queueAction para garantir ordem pós-ready. «outros.video/mjs/index.txt:300-320»
ND-6245. Detecção de provider por URL: YouTube (watch/embed/shorts/youtu.be), Vimeo (video/\d+), HLS (.m3u8), DASH (.mpd), embed (dailymotion/twitch/facebook/twitter-x/instagram/tiktok/spotify/soundcloud). «outros.video/mjs/index.txt:20-76»
ND-6246. StallDetector: config default stallThreshold 2000ms, recoveryTimeout 10000ms, maxRecoveryAttempts 3, minBufferHealth 2s, checkInterval 500ms, autoRecovery true; estados playing/stalled/recovering/failed com eventos stall/recovery/failed. «outros.video/ts/stall.txt:1-50»
ND-6247. MediaCapabilities: checkDecoding/checkEncoding com contentType/width/height/bitrate/framerate + hdrMetadata (maxCLL 1000, maxFALL 400) e colorGamut (srgb/p3/rec2020), retornando supported/powerEfficient/smooth; sem API → tudo false. «outros.video/ts/codecs.txt:11-80»
ND-6248. Filtros WebGPU via compute shaders WGSL com @workgroup_size(16,16): grayscale (luma 0.299/0.587/0.114), sepia (0.393/0.769/0.189 etc.), invert — inputTex texture_external → outputTex texture_storage_2d<rgba8unorm, write>. «outros.video/js/index__2.txt:2-30»
ND-6249. Formatação de tempo utilitária: h:mm:ss quando há horas, m:ss quando não; clamp e debounce/throttle utilitários padrão para controles. «outros.video/mjs/index.txt:3-30»
ND-6250. Chunks mapeados com markers `@region` por módulo original no bundle — preservar rastreabilidade utils.ts/providers.ts/… na build. «outros.video/mjs/index.txt:2-10»

### Bloco N — cli-desktop → devthink: sistema de autenticação

ND-6251. auth.json canônico com 10 provedores: zai (api), nvidia (api), google (oauth refresh+access+expires), zeroeval, llm-stats, openrouter, aihubmix, xiaomi (userId+serviceToken), qwen (acw_tc), opencode (multi version+accounts[]). «outros.cli/auth____BLOCOS_EXTRAIDOS.txt:52-75»
ND-6252. Três tipos de entrada de auth: `{ type: "api", key }`, `{ type: "oauth", refresh?, access?, expires? }` e `{ type: "multi", provider, version?, accounts[], activeIndex?, activeIndexByFamily? }`. «outros.cli/auth____BLOCOS_EXTRAIDOS.txt:107-135»
ND-6253. Conta multi-carrega: email, refreshToken, addedAt, lastUsed, enabled, fingerprint (deviceId, sessionToken, userAgent, apiClient, clientMetadata{ideType, platform, pluginType}, createdAt), cachedQuota por modelo (remainingFraction, resetTime, modelCount), cachedQuotaUpdatedAt. «outros.cli/auth____BLOCOS_EXTRAIDOS.txt:115-135; collection-text-json-auth-01.txt:5-40»
ND-6254. AuthManagerImpl com 6 storages: memory (efêmero), browser (localStorage `devthink:auth`), devthink (FileAuthStorage em PATHS.AUTH), opencode, codex (~/.codex/auth.json), claude (~/.claude/auth.json) — _authSource seleciona de onde ler. «outros.cli/auth____BLOCOS_EXTRAIDOS.txt:78-105»
ND-6255. API do AuthManager: getApiKey/setApiKey/deleteApiKey, getOAuthToken/setOAuthToken, getMultiAccountToken, rotateMultiAccount (ciclo de conta ativa), importFrom/importOpenCodeAuth/importCodexAuth/importClaudeAuth, listProviders, listValidTokens, getAllAuth. «outros.cli/auth____BLOCOS_EXTRAIDOS.txt:88-105»
ND-6256. Importação multi-conta: antigravity-accounts.json (16 contas Google), provider-keys.json (antigravity+nvidia), qwen-auth-accounts (2 contas) e qwen-auth-tracker-state (health) marcados como fontes a importar quando ausentes do auth.json. «outros.cli/auth____BLOCOS_EXTRAIDOS.txt:235-263»
ND-6257. Contrato de auth versionado (version: 1) com providers tipados por kind: api-key (value+updatedAt) e oauth (accessToken+refreshToken+expiresAt+updatedAt). «outros.cli/auth____BLOCOS_EXTRAIDOS.txt:seção devthink.auth.contract»
ND-6258. Criptografia de credenciais em repouso: AES-256-GCM com chave de DEVTHINK_MASTER_KEY → ~/.config/devthink/.master-key → scrypt(hostname+username); formato payload `v1:<iv_base64>:<tag_base64>:<encrypted_base64>`; funções encrypt/decrypt/encryptJson/decryptJson. «outros.cli/auth____BLOCOS_EXTRAIDOS.txt:136-150»
ND-6259. Cache de auth com TTL 30.000ms: Map com `all:{source}` e `{provider}`, invalidação por chave ou total (limpando também _allTokensCache). «outros.cli/auth____BLOCOS_EXTRAIDOS.txt:150-165»
ND-6260. Persistência por módulo: auth.json, localStorage, config.json, SQLite devthink.db com fallback JSON por tabela, memory/*.json, audit.jsonl, sessions/, messages/, agents/, history.json, keybinds.json, undo/, projects/, parts/, todos/, session_share/, config por plugin. «outros.cli/auth____BLOCOS_EXTRAIDOS.txt:165-190»
ND-6261. Matriz de 20 modos de operação combinando AUTH (File/Mem/none), CONFIG (File/none), DB (SQLite/JSON/none), MEMORY, CACHE, BROWSER (Local/none) e EPHEMERAL — modo 1 = tudo persistido em arquivo; modo 6/17/20 = memória + efêmero; modos 7/16 = só browser local. «outros.cli/auth____BLOCOS_EXTRAIDOS.txt:191-217»
ND-6262. Fontes de auth válidas restritas por Set ("devthink", "opencode", "browser", "codex") — setAuthSource só aceita membros. «outros.cli/auth____BLOCOS_EXTRAIDOS.txt:seção REWRITE-auth bloco 1»
ND-6263. getOAuthToken retorna somente entradas com type === "oauth"; setters persistem imediatamente no storage ativo. «outros.cli/auth____BLOCOS_EXTRAIDOS.txt:REWRITE-auth blocos 2-3»
ND-6264. Auditoria de tokens: tabela provider/tipo/status/token resumido — tokens nunca aparecem completos em logs, apenas prefixo + reticências. «outros.cli/auth____BLOCOS_EXTRAIDOS.txt:218-235»
ND-6265. Detecção de anomalia de auth com SSM: AuthPattern (timestamp, userId, ipAddress, userAgent, endpoint, method, latency) → encodePattern para Float32Array → detect por cosineSimilarity com score 1-similarity, confidence e features que contribuíram. «outros.cli/auth____BLOCOS_EXTRAIDOS.txt:744-800»
ND-6266. Texto de padrão para embedding: `user:{id} ip:{ip} endpoint:{e} method:{m} hour:{h}` — hora do dia é feature. «outros.cli/auth____BLOCOS_EXTRAIDOS.txt:780-800»
ND-6267. SSMTokenGenerator: token de sessão gera/valida com SessionData (userId, deviceId, timestamp, nonce). «outros.cli/auth____BLOCOS_EXTRAIDOS.txt:803-830»
ND-6268. Plano de 900 ações (chunk 10/10, segurança): criptografia de auth.json com chave derivada de senha, keychain (macOS/Windows), criptografia de tokens MCP em repouso, secret providers externos (Vault/AWS Secrets Manager), expiração e rotação automática de credenciais, sanitização de credenciais em logs e exports. «outros.cli/auth.collection.04.txt:14-25»
ND-6269. Validação de entrada: validação de todos os inputs de API, rate limiting por IP, CORS com whitelist, CSP para web UI, server password OPENCODE_SERVER_PASSWORD, HTTPS com cert auto-assinado, helmet.js, proteção brute force, validação de schema em todas as rotas. «outros.cli/auth.collection.04.txt:27-36»
ND-6270. Supply chain: verificação de integridade de pacotes SHA256, sigstore/cosign para assinatura de releases, SBOM em releases, Scorecards, Dependabot. «outros.cli/auth.collection.04.txt:38-43»
ND-6271. Documentação como ação: `--help` detalhado com exemplos, man pages Unix, help interativo no TUI (`?`/`Ctrl+X h`), OpenAPI 3.1 automática com endpoint GET /doc e Swagger UI, changelog versionado, quickstart 5 minutos, guias de provedores/agentes/plugins/MCP/permissões/temas/segurança/ACP/FAQ/migração OpenCode→DevThink, docs multilíngue (PT/EN/ES/FR). «outros.cli/auth.collection.04.txt:46-72»
ND-6272. Otimização de dados: WAL mode no SQLite, índices nas colunas mais consultadas, cache LRU de models catalog, cache de sessions ativas, compressão de session diffs, pruning de sessions antigas, vacuum agendado, sharding de sessions por data, backup incremental, monitoramento de tamanho do banco. «outros.cli/auth.collection.04.txt:75-85»

### Bloco O — cli-desktop → devthink: plugins, captcha, proxy e pesquisa SSM

ND-6273. Formato de coleta de fontes: cada bloco marcado com `<!-- devthink:source path=… sha256=… bytes=… -->` + `devthink:source-boundary` e `devthink:end-source` — proveniência e hash em todo documento coletado. «outros.cli/collection-text-md-auth-01.txt:1-8»
ND-6274. Captcha Aliyun do z.ai: token de dispositivo z_um inicializado ao disparar captcha; tentativa limitada a 3 com deviceToken novo a cada tentativa; verifyCaptcha pode retornar HTTP 200 "success" com VerifyResult ok=false — tratar sucesso HTTP ≠ verificação ok. «outros.cli/collection-text-txt-auth-01.txt:5-30»
ND-6275. Testes de navegador com Brave headless via CDP (cdpPort 9223), contexto patchado com exposeFunction + init script, cookies carregados do auth.json (21 cookies). «outros.cli/collection-text-txt-auth-01.txt:5-14»
ND-6276. arg_gen do Aliyun CAPTCHA decompilado: UTF-8 do certifyId → tabela de permutação de 64 elementos → KSA keyed pela constante → PRGA stream-cipher byte a byte → base64; algoritmo documentado com PCs do bytecode. «outros.cli/collection-text-js-providers-01.txt:18-90»
ND-6277. ESLint do proxy: typescript-eslint recommended, no-unused-vars com argsIgnorePattern `^_`, consistent-type-imports error, no-explicit-any off documentado como decisão (251 casts não valem churn), no-console off. «outros.cli/collection-text-js-providers-01.txt:3-30»
ND-6278. Modo econômico de contexto: conversas simples encadeiam mensagens com parent_id; com tools ou multimodal o modo econômico desativa e o histórico completo é enviado. «outros.cli/collection-text-md-auth-01.txt:800-808»
ND-6279. Arquivos de texto e prompts grandes embutidos no texto da mensagem com diretiva explícita de resposta completa; respostas degeneradas ("Yes"/"Ok"/"Sim") detectadas e refeitas uma vez com diretiva corretiva — nunca entregues como resposta final. «outros.cli/collection-text-md-auth-01.txt:810-816»
ND-6280. Sessões híbridas por env: HYBRID_SESSIONS_ENABLED, HYBRID_SESSION_VERIFY (verifica histórico no servidor antes de reusar; divergência → re-bootstrap), HYBRID_SESSION_TTL_MS 86400000. «outros.cli/collection-text-md-auth-01.txt:818-826»
ND-6281. Dashboard admin: React 19 + shadcn/ui (Vite + Tailwind v4) servido pelo proxy; KPIs e gráficos em tempo real (requisições, erros, latência, streams, sessões, memória RSS%) via SSE único com push a cada 3s, amostras de 5s, janela de 20min; fallback automático para polling de 4s se o stream cair. «outros.cli/collection-text-md-auth-01.txt:830-845»
ND-6282. Admin: gestão de contas (cooldown, refresh forçado, carga por conta), API keys multiusuário com RPM e concorrência por usuário, edição de .env com validação e allowlist, métricas Prometheus com filtro e cópia, reinício do servidor pela UI. «outros.cli/collection-text-md-auth-01.txt:845-855»
ND-6283. Auth do admin: ADMIN_PASSWORD no .env (fallback API_KEY), sessão com cookie HttpOnly assinado de 7 dias. «outros.cli/collection-text-md-auth-01.txt:856-860»
ND-6284. Build do frontend do painel necessário quando web/dist não existe; servidor usa painel inline simples como fallback — nunca quebrar por falta de build. «outros.cli/collection-text-md-auth-01.txt:848-852»
ND-6285. Catálogo de modelos via GET /api/models (chat.z.ai): resposta `data[]` com id/name/object/created; requisição autenticada com Authorization e Cookie, Content-Type application/json, cache-control no-cache. «outros.cli/modelsroute.txt:1-60»
ND-6286. Pesquisa de arquiteturas SSM: MAMBA selective SSM, MAMBA2 SSD, MAMBA3 MIMO, Griffin, HAWK pure-RNN, Gemma recurrent, RWKV — cada uma com blocos de implementação próprios. «outros.cli/research____BLOCOS_EXTRAIDOS.txt:10-20»
ND-6287. RWKV-WebGPU: stack JS/TS → @cryscan/web-rwkv-wasm → Rust core (model loading, quantização Int8/F4, state) → WGSL compute shaders (matmul, elementwise, softmax/LayerNorm) → WebGPU API; uso via RWKVModel.fromFile('model-q4.wasm') + tokenizer encode/run/decode. «outros.cli/research____BLOCOS_EXTRAIDOS.txt:seção 013 blocos 1-3»
ND-6288. Cobertura de modos do engine: terminal, headless, browser, library — mapeados em docs próprios (030/031/032/033). «outros.cli/research____BLOCOS_EXTRAIDOS.txt:23-27»
ND-6289. Inferência local: ONNX-SSM export, WebGPU inference, WASM SSM, ONNX node pipeline, embeddings SSM, RAG, geração de argumentos — trilha completa de local-first. «outros.cli/research____BLOCOS_EXTRAIDOS.txt:20-30»
ND-6290. Comparativos obrigatórios antes de decidir arquitetura: opencode vs hermes vs devthink (capacidades profundas de cada um documentadas). «outros.cli/research____BLOCOS_EXTRAIDOS.txt:32-36»
ND-6291. Tamanhos de binário e deploy edge como critérios de primeira classe (docs 034-BINARY-SIZE, 035-DEPLOY-EDGE) junto com treinamento local (036). «outros.cli/research____BLOCOS_EXTRAIDOS.txt:33-36»

---

---

## FASE 7a — changelog extensão devthink (101 versões 1.1.1→2.0.2) + atlases md Neo DevThink (fonte: neodocs-txt/CHANGELOG*.txt + neodevthink/*.md)

300 regras (ND-7001..7300): consent-first com 3 gates (sessão/plano/origem), log imutável, MCP,
gateway 4 adapters, multi-agente, forensics, pipelines, gates apifreeze/pentest/permdiff/readiness-24,
release 5 canais · 12 atlases de composição MOVA/VORA/CORO/ORBE/ALTO/LOOPA/LUMA/NOVA/Orbita/KROMA.
Pulos: 8 CHANGELOGs byte-idênticos ao superset (md5), CHANGELOG (6) inexistente, 32 md menores da mesma gramática.


### Bloco A — Consentimento primeiro e revisão humana (extensão devthink)

ND-7001. Nenhuma ação sensível executa sem os três gates: sessão viva, plano aprovado e origem concedida — em todo step, em toda surface. «CHANGELOG (8).txt:1.1.32→2.0.2»
ND-7002. Todo step carrega flag "reviewed" explícito; sem o flag a proposta recusa no parse. «CHANGELOG (8).txt:1.1.48»
ND-7003. Aprovação é uma ação humana distinta por passo: sem aprovação em lote, sem timeout que resolva gate, sem provenance de background. «CHANGELOG (8).txt:1.1.62/1.1.64»
ND-7004. Kinds sensíveis classificam nas classes payment, credential, delete e publish refinadas por opções do kind; cada classe exige consentimento fresco por origem. «CHANGELOG (8).txt:1.1.61»
ND-7005. Consent windows vinculam todo grant sensível em tempo com duração escolhida pelo usuário; grant nunca é ilimitado; janela expirada suspende a run no meio do step e o resume exige prompt novo. «CHANGELOG (8).txt:1.1.61»
ND-7006. revokerun interrompe o step pendente e todos os queued sem executá-los como evento terminal da sessão. «CHANGELOG (8).txt:1.1.61»
ND-7007. Postura denydefault: origem não concedida recusa todo dispatch antes do primeiro step. «CHANGELOG (8).txt:1.1.61»
ND-7008. originprofiles concedem/negam kinds individuais por site; matching de origem é exato, sem expansão wildcard; active tab = exatamente um grant de origem único explícito. «CHANGELOG (8).txt:1.1.61»
ND-7009. safedefaults classifica origens desconhecidas como somente leitura com toda classe sensível negada até o usuário ampliar o perfil no editor. «CHANGELOG (8).txt:1.1.62»
ND-7010. Toda atualização instalada registra permdiff para a página de transparência. «CHANGELOG (8).txt:1.1.62»
ND-7011. confirmpay/confirmdelete/confirmcreds colocam uma ação humana distinta na frente de pagamentos (amount, payee origin, target element), deleções destrutivas e uso de credenciais (label, nunca valor). «CHANGELOG (8).txt:1.1.62»
ND-7012. phishguard observa alvos de login para origens lookalike contra as concedidas, bloqueia nomeando a origem conhecida e expira vereditos fora da janela de frescor configurada. «CHANGELOG (8).txt:1.1.62»
ND-7013. connectallow lista remetentes externos gerenciados pelo usuário e nasce vazia por default. «CHANGELOG (8).txt:1.1.62»
ND-7014. ratelimit limita buckets de comandos de automação por origem e por sessão, adiando o excesso até a janela reiniciar, sem hidden ceiling. «CHANGELOG (8).txt:1.1.62»
ND-7015. Markup extraído é gradeado untrusted antes de qualquer render e roteia pelo sandboxframe; injeção de contexto de página recusa. «CHANGELOG (8).txt:1.1.62»
ND-7016. schemastrict valida todo comando de entrada antes do dispatch e rejeita campos desconhecidos com caminho e forma esperada, sem ecoar payload. «CHANGELOG (8).txt:1.1.62»
ND-7017. secretvault persiste apenas labels, escopos de origem exatos, workspace de perfil, provenance e digest sha-256 — nenhum plaintext chega a storage writer, log entry ou export. «CHANGELOG (8).txt:1.1.62»
ND-7018. Steps de credenciais resolvem marcadores de vault id no último momento possível, com o valor fluindo do vault ao campo sem logging. «CHANGELOG (8).txt:1.1.62»
ND-7019. redactshots mascara regiões sensíveis de capturas (derivadas de field shapes ou desenhadas pelo usuário) sobre viewport, elemento e capturas costuradas, com overlays antes de cada shot e evidência de redação nos records. «CHANGELOG (8).txt:1.1.62»
ND-7020. maskinputs mantém valores digitados, de formulário e armazenados fora de todo log, observação e export pelas formas documentadas password/token/card/secret, extensíveis por regras globais e por origem. «CHANGELOG (8).txt:1.1.61»

### Bloco B — Log imutável e auditoria

ND-7021. immutablelog é append-only: cada entrada encadeia o sha-256 do predecessor no append; não existe caminho de update ou delete. «CHANGELOG (8).txt:1.1.61»
ND-7022. O fechamento da sessão sela a chain com hash final; a leitura verifica a chain inteira antes de servir e recusa leitura de link quebrado como evidência de tamper. «CHANGELOG (8).txt:1.1.61»
ND-7023. Toda transição de step, grant, expiração, revogação, negação e suspensão cai no log imutável. «CHANGELOG (8).txt:1.1.61»
ND-7024. Audit trail nunca contém payload: grava origin, método, duração e classe de erro — nunca parâmetros, fontes ou valores. «CHANGELOG (8).txt:1.1.46»
ND-7025. Toda chamada de ferramenta gera exatamente uma entrada de auditoria, sem exceção (callauditcomplete). «CHANGELOG (8).txt:1.1.56»
ND-7026. provlog registra uma entrada por pass de pipeline (stream, transform, dedupe, sample, resume) com row keys tocadas e resumo redigido; log append-only — entry id repetido recusa. «CHANGELOG (8).txt:1.1.75»
ND-7027. Valores secret-shaped (tokens, senhas, chaves, bearer, strings sk-/ghp-, blocos de chave privada) mascaram antes de qualquer entrada de log aterrissar. «CHANGELOG (8).txt:1.1.75»
ND-7028. Capturas só exportam com provenance provlog e resposta de redação a bordo; capture sem elas recusa alto em vez de deixar o dispositivo. «CHANGELOG (8).txt:1.1.78»

### Bloco C — Protocolo MCP e servidor de agente

ND-7029. mcpserver expõe JSON-RPC com frames delimitados por newline e envelopes http post; error codes clássicos com consentrefused reservado em -32001. «CHANGELOG (8).txt:1.1.54»
ND-7030. Tools com side effect só aceitam o stepid de um step aprovado; o tooldispatchgate dobra em ordem: cliente pareado → sessão viva → plano aprovado → origem grants → kind correspondente. «CHANGELOG (8).txt:1.1.54»
ND-7031. toolcatalog organiza tools em 4 namespaces (browser, workflow, memory, system) com nomes namespaced, versões por tool, inputs como JSON schemas tipados e consentmeta/side effects em plain language. «CHANGELOG (8).txt:1.1.54»
ND-7032. Bind localhost é o default documentado; bind não-localhost é gradeado sensitive atrás de review explícita de remote enablement. «CHANGELOG (8).txt:1.1.54/1.1.55»
ND-7033. Pairing usa códigos de uso único com janela configurada; tokens emitidos no exchange saem exatamente uma vez e o storage guarda só o sha-256 tokenhash. «CHANGELOG (8).txt:1.1.55»
ND-7034. Todo frame remoto verifica token com escopo, expiração e revogação; allowlist recusa fingerprints desconhecidos antes do consent gate. «CHANGELOG (8).txt:1.1.55»
ND-7035. Approval gates de chamadas sensíveis remotas levantam com argumentos completos, mascaram campos marcados secret e recusam por timeout default o gate não respondido. «CHANGELOG (8).txt:1.1.55»
ND-7036. Transporte remoto exige TLS com certificado válido (modo required recusa peer sem fingerprint sha-256 configurado). «CHANGELOG (8).txt:1.1.55»
ND-7037. A superfície de streaming do protocolo compõe: event subscriptions com filtros, resource watchers com page state deltas, sampling callbacks, prompt tools, stream chunks sequenciais com done marker, progress notices e cancellation frames que preservam resultado parcial. «CHANGELOG (8).txt:1.1.56»
ND-7038. Rate limits por cliente contam na janela, resetam e respondem excesso com erro estruturado + retry-after; ausência de limite deixa o cliente unbounded — nenhum default silencioso. «CHANGELOG (8).txt:1.1.56»
ND-7039. Idempotency keys reproduzem o resultado armazenado do mesmo cliente dentro da janela e expiram depois dela. «CHANGELOG (8).txt:1.1.56»
ND-7040. Batch ordenado para no primeiro erro quando o flag pede; batch inteiro gradeia pelo membro mais sensível. «CHANGELOG (8).txt:1.1.56»
ND-7041. Dry run valida argumentos contra o JSON schema e roda os mesmos gates de consentimento sem executar; registro de dry run que alegue execução recusa (dryrunpurity). «CHANGELOG (8).txt:1.1.56»
ND-7042. Tool mocks só respondem em contexto de teste com resultados canned e nunca tocam o browser. «CHANGELOG (8).txt:1.1.56»
ND-7043. mcpmode roda o engine como servidor MCP com toolcatalog, resourceexpose e promptexpose sobre stdioserve e httpserve; o cli ganha o comando serve. «CHANGELOG (8).txt:1.1.84»
ND-7044. Sampling callbacks roteiam a geração de volta ao modelo do cliente e respeitam as capabilities declaradas (sampling, prompts, streaming). «CHANGELOG (8).txt:1.1.56»
ND-7045. Chamadas longas emitem progress notifications com percent, mensagem e cancel hint; cancelamento preserva o resultado parcial. «CHANGELOG (8).txt:1.1.56»

### Bloco D — Gateway e LLM

ND-7046. Gateway define interface de adapter com contrato request/stream/cancel compartilhado; os 4 adapters falam os wire formats: openaicompat (chat completions), anthropic (messages), gemini (generate content), ollamalocal (localhost). «CHANGELOG (8).txt:1.1.83»
ND-7047. O dispatch loop corre consent e base-url gates primeiro, faz race de timeout por tentativa, retenta falhas transitórias com backoff jittered e honra o retry-after de respostas 429. «CHANGELOG (8).txt:1.1.83»
ND-7048. Nenhum endpoint remoto, model name ou key sai da configuração do usuário; providers remotos exigem https; ollamalocal aceita somente hosts localhost. «CHANGELOG (8).txt:1.1.83»
ND-7049. baseurlconfig valida forma scheme/host/path antes de salvar; query, fragment e segmento de path relativo recusam. «CHANGELOG (8).txt:1.1.83»
ND-7050. Keys vivem no keyvault com consent stamp, resolvem no último momento, revogam on demand; keyexportcheck recusa qualquer export com forma de key; requests mascaram antes de qualquer log. «CHANGELOG (8).txt:1.1.83»
ND-7051. Scan de literal de api key nos bundles built garante que nenhuma key shape sai no dist; scan de provider url hardcoded garante o mesmo para endpoints — imposição por teste, não por promessa. «CHANGELOG (8).txt:1.1.83»
ND-7052. modellist descobre modelos com cache window do usuário; fetch que falha não toca o cache. «CHANGELOG (8).txt:1.1.83»
ND-7053. capabilityad serializa o tool catalog no schema específico do provider; todo tool declara seu consent requirement; o plan review gate anda nas required capabilities — resposta de modelo nunca executa step sem aprovação humana. «CHANGELOG (8).txt:1.1.83»
ND-7054. resolvegatewayroute mapeia task kind → provider/model pela routing table do usuário; provider recusado cai no fallback pair configurado; sem remote permitido, a resolução cai no provider local. «CHANGELOG (8).txt:1.1.83»
ND-7055. Nenhum provider, endpoint, model, key, temperature ou token ceiling hardcoded: os 4 protocol styles são wire shapes de interoperabilidade escolhidos pelo usuário, nunca allowlists de provider. «CHANGELOG (8).txt:1.1.57»
ND-7056. Chamadas de modelo local recusam todo endpoint não-loopback — nada sai da máquina. «CHANGELOG (8).txt:1.1.57»
ND-7057. Guardrails de parse: strip de code fences e chatter, validação contra o schema esperado, retry até o count configurado e recusa após exaustão — output inválido nunca executa. «CHANGELOG (8).txt:1.1.57»
ND-7058. Plano drafted por modelo nunca bypassa review: draft aprovado vira pending plan que passa a mesma plan review de todo plano local; replan exige fresh review da cauda alterada. «CHANGELOG (8).txt:1.1.57»
ND-7059. modelroute: task kinds mapeiam para pares provider/model do usuário; provider marca indisponibilidade após falhas; o fallback pair do usuário assume; rota default nunca aplica sozinha. «CHANGELOG (8).txt:1.1.57»
ND-7060. promptlibrary é biblioteca de templates do usuário — nenhum template builtin; render em fluxo sensível exige consent notice. «CHANGELOG (8).txt:1.1.57»
ND-7061. Usage records com request id correlacionam tokens e custo; cost budget pergunta ao usuário no teto (halt) com warning antes. «CHANGELOG (8).txt:1.1.57»
ND-7062. O intent classifier determinístico funciona sem provider: 6 intents (navigate, extract, fill, monitor, automate, ask) com confidence thresholds. «CHANGELOG (8).txt:1.1.57»

### Bloco E — Multi-agente

ND-7063. Swarm: agente registra com binding de uma tab (regra one agent per tab), roles planner/worker/observer + custom; sub-agent spawn recusa recursão além do depthlimit do usuário. «CHANGELOG (8).txt:1.1.58»
ND-7064. Task queue compartilhada com lanes, prioridades e completion policy configurados; claim pega maior prioridade com oldest winning ties; work stealing respeita as regras de lane ownership. «CHANGELOG (8).txt:1.1.58»
ND-7065. O requeue pass retorna as tarefas de agentes mortos cujos heartbeats silenciaram além da janela configurada. «CHANGELOG (8).txt:1.1.58»
ND-7066. Blackboard com seções goals/facts/findings/scratch, leitura com freshness filters e herança da consent class da extração de origem — extração sensível continua sensível no board. «CHANGELOG (8).txt:1.1.58»
ND-7067. Killswitch (killall) para todo agente de uma vez e devolve claims à fila; o switch fica sempre disponível sem barreira de configuração. «CHANGELOG (8).txt:1.1.58»
ND-7068. Per-agent budget (token/custo/step) halta o agente no teto; scope gate recusa origens e tool namespaces fora do grant do agente. «CHANGELOG (8).txt:1.1.58»
ND-7069. Mensagens cross-agent que carregam page content gradeiam como data egress events na auditoria. «CHANGELOG (8).txt:1.1.58»
ND-7070. Orchestration: eleição de leader por regra do usuário, assignwork fatia tasks, collectresults com status pendente, scaleworkers sob bound do usuário sem cap de engine. «CHANGELOG (8).txt:1.1.59»
ND-7071. Planner/executor split mantém draft e execução em agentes diferentes; o executor reporta todo step outcome de volta. «CHANGELOG (8).txt:1.1.59»
ND-7072. Critic review e verifier checks roteiam vereditos com ack e timeout; sweep reviews expira requests sem resposta além da janela. «CHANGELOG (8).txt:1.1.59»
ND-7073. Handoffs preservam os session grants originais na transferência da tab. «CHANGELOG (8).txt:1.1.59»
ND-7074. Resource locks são exclusive ou shared, keyed por exatamente uma origem e um selector; expirelocks devolve locks abandonados; scanconflicts detecta writes sobrepostos com ordenação determinística sugerida. «CHANGELOG (8).txt:1.1.59»
ND-7075. mergeresults com regras first/last/preferagent/fail e provenance em todo valor fundido. «CHANGELOG (8).txt:1.1.59»
ND-7076. Escalations levam a decisão travada ao usuário com contexto completo e permanecem human-decided. «CHANGELOG (8).txt:1.1.59»
ND-7077. Consensus rounds carregam no quorum yes configurado pelo usuário. «CHANGELOG (8).txt:1.1.59»
ND-7078. Fleet registry: agentname lowercase único que recusa identidades reservadas (user, operator, human, system) e duplicatas. «CHANGELOG (8).txt:1.1.72»
ND-7079. agentscope intersecta origens e kinds com os session grants; request totalmente fora recusa alto em vez de alargar silenciosamente; escopo read-only recusa todo kind mutante. «CHANGELOG (8).txt:1.1.72»
ND-7080. pauseagent pausa um agente sem tocar os peers; killswitch permanece efetivo sobre agentes pausados — pause nunca escuda do stop. «CHANGELOG (8).txt:1.1.72»
ND-7081. spawnsubagent exige depth do filho exatamente um nível abaixo do lineage; ciclo na linhagem recusa; escopo copia do pai a menos que a spec estreite (subset revalidado; filho de observador read-only nunca ganha lado de escrita). «CHANGELOG (8).txt:1.1.73»
ND-7082. aggregatereport mantém seções por agente; conflitos resolvem pelo conflictorder configurado; sem ordem, o conflito fica aberto e escala — nunca drop silencioso. «CHANGELOG (8).txt:1.1.73»
ND-7083. Lessons compartilhadas servem lições da mesma origem primeiro e matches por palavras depois; decay aposenta lições não reusadas na janela configurada; lessonsecretgate recusa lição com token/senha/key/bearer. «CHANGELOG (8).txt:1.1.73»
ND-7084. Arbitration abre caso com ≥2 agentes disputando um recurso; grant é posição de fila, nunca permissão; veredito fica dentro de sessionlock e origem grants. «CHANGELOG (8).txt:1.1.73»
ND-7085. Priority lanes: lane interativa sempre primeiro; tasks sensíveis ficam na interactive lane qualquer que seja a lane pedida; round-robin por lane evita starvation. «CHANGELOG (8).txt:1.1.73»
ND-7086. Suggestion de escala nunca spawna ou pausa worker sem consentimento explícito do usuário. «CHANGELOG (8).txt:1.1.73»
ND-7087. Cost ledger compartilhado: custo solo atribui inteiro ao agente; custo compartilhado divide igualmente entre os causers com os peers nomeados. «CHANGELOG (8).txt:1.1.73»
ND-7088. agentcert certifica 30 cenários de coordenação contra os módulos compilados com fake tabs de todo browser kind e fake clock determinístico. «CHANGELOG (8).txt:1.1.96»
ND-7089. costcert reconcilia a contabilidade: replay de runs recomputa cada linha de custo; refund de step cancelado devolve os completion tokens que nunca streamaram. «CHANGELOG (8).txt:1.1.96»

### Bloco F — Run state e resiliência

ND-7090. runstatemachine trackea as transições legais queued/running/paused/awaitingapproval/completed/failed/cancelled/rolledback — restart de service worker não perde trabalho. «CHANGELOG (8).txt:1.1.70»
ND-7091. Fila offline com sequência monotônica; replay em ordem no evento online; task cuja janela de plano expirou offline falha para a auditoria em vez de replayar. «CHANGELOG (8).txt:1.1.70»
ND-7092. Idempotencykey determinística derivada de plano+step; replay do mesmo step deduplica via replaycheck e executed key set do pagebridge. «CHANGELOG (8).txt:1.1.70»
ND-7093. makecheckpoint captura os steps completados com page digest após cada step sensível executado; resumecheckpoint pula completados e recusa resume contra página mudada. «CHANGELOG (8).txt:1.1.70»
ND-7094. Heartbeat antes de cada step; zombiecheck lista runs sem beat além da janela; reaprun falha o zumbi com evento de auditoria e bloqueia runs novos enquanto o reap não resolve. «CHANGELOG (8).txt:1.1.70»
ND-7095. rollbackrun oferece compensações tipadas por kind mutante em plain language; compensações rodam só atrás de rollbackgate + escolha explícita, dentro da origem do plano aprovado. «CHANGELOG (8).txt:1.1.70»
ND-7096. sessionlock adquire lockrecord antes do primeiro step, recusa segunda run concorrente nomeando o holder e expira locks abandonados no startup. «CHANGELOG (8).txt:1.1.71»
ND-7097. urlhistory por run com fold de visitas consecutivas; o escopo confina cada visita à origem aprovada e nunca mesma histórias de dois runs. «CHANGELOG (8).txt:1.1.71»
ND-7098. Memory items levam provenancerecord (origem, runid, stepid, capture time); purgas avaliam regras do usuário atrás de confirmação e deixam os audit events intocado. «CHANGELOG (8).txt:1.1.71»
ND-7099. encryptrest deriva chave AES-GCM do segredo do usuário via webcrypto; a chave derivada nunca persiste e o plaintext recusa para as classes sensíveis (encryptmemorygate). «CHANGELOG (8).txt:1.1.71»
ND-7100. quotawatch propõe batches de cleanup rankeados por idade/expiração que nunca tocam o audit history e esperam aprovação por batch. «CHANGELOG (8).txt:1.1.71»

### Bloco G — Performance

ND-7101. Performance otimiza, nunca limita: todo limit, delay, window, budget e factor é escolha do usuário sem hidden cap. «CHANGELOG (8).txt:1.1.68/1.1.69»
ND-7102. lazymods declara id, load reason e capability requirements antes do load; o loader resolve no primeiro uso sob exatamente os checks do caminho eager. «CHANGELOG (8).txt:1.1.68»
ND-7103. incrsnapshot emite deltas com fingerprints estáveis de região; delta vazio pula a recomputação inteira. «CHANGELOG (8).txt:1.1.68»
ND-7104. selcache invalida wholesale em navegação e seletivamente por fingerprints de mutação; revalida todo hit antes do dispatch e recusa hit de geração stale com retry hint. «CHANGELOG (8).txt:1.1.68»
ND-7105. streamparse tokeniza páginas grandes chunk a chunk no worker pool sem nunca segurar o texto inteiro na memória. «CHANGELOG (8).txt:1.1.68»
ND-7106. virtlist renderiza listas longas com janela virtualizada, height maps medidos e row nodes reciclados. «CHANGELOG (8).txt:1.1.68»
ND-7107. Backpressure do worker queue adia tasks além da depth configurada em vez de recusá-las. «CHANGELOG (8).txt:1.1.68»
ND-7108. requestcoalesce funde queries idênticas pendentes em um dispatch com fan-out do resultado para todos os waiters. «CHANGELOG (8).txt:1.1.69»
ND-7109. runcache serve fetches repetidos do mesmo run por digest e limpa no fim do run, salvo pin do usuário. «CHANGELOG (8).txt:1.1.69»
ND-7110. stepprefetch deriva próximas páginas e seletores só da estrutura do plano, atrás de gate que recusa anything fora do plano revisado. «CHANGELOG (8).txt:1.1.69»

### Bloco H — Workflows e control flow

ND-7111. Workflow compõe steps revisados em documento freezable; composição valida nome, versão, origens HTTPS concedidas, steps e blocos; grade do record = o pior step. «CHANGELOG (8).txt:1.1.50»
ND-7112. Todo bloco aninhado expande antes do review — nenhum step fica escondido dentro de construct. «CHANGELOG (8).txt:1.1.50/1.1.51»
ND-7113. Control flow: branch paths únicos com expressão booleana e else obrigatório; while sem bound recusa na composição; o default documentado de 1.000 iterações cede a qualquer valor do usuário. «CHANGELOG (8).txt:1.1.51»
ND-7114. Parallel roda branches em escopos isolados com join first/last/fail sobre writes conflitantes; nenhum cap de engine no branch count. «CHANGELOG (8).txt:1.1.51»
ND-7115. trycatch com retry policies do usuário (fixed ou exponential seeded backoff) e timeout policies por step e por run em ms. «CHANGELOG (8).txt:1.1.51»
ND-7116. Todo child step mantém o mesmo consent gate e dispatch chain de um plan step — construct nenhum bypassa review. «CHANGELOG (8).txt:1.1.51»
ND-7117. Triggers (10 kinds) armam rules que lançam workflows revisados; toda rule é sensitive porque lança runs automaticamente; o arm exige review explícita renderizando match fields e workflow bound. «CHANGELOG (8).txt:1.1.52»
ND-7118. Webhook verifier checa o shared secret em tempo constante e todo required field kind antes de persistir; segredo com entropy floor de 24 chars misturando letras e dígitos (floor, nunca cap). «CHANGELOG (8).txt:1.1.52»
ND-7119. Cron parser caminha limites de minuto honestamente com timezones; cooldown reporta a janela restante; dedupe mantém um fire pendente por rule. «CHANGELOG (8).txt:1.1.52»
ND-7120. Workflow editor salva só sob editorsavegate: sessão viva, plano aprovado, node ids únicos, edges forward-only sem ciclo e gramática completa do workflow. «CHANGELOG (8).txt:1.1.53»
ND-7121. Import gradeia unreviewed até o import review aprovar a lista de steps expandida; rollback de versão idem até o rollback review. «CHANGELOG (8).txt:1.1.53»
ND-7122. Export content review recusa qualquer step option ou payload de template que nomeie secret, token, api key, password ou authorization — segredo nunca sai do browser. «CHANGELOG (8).txt:1.1.53»
ND-7123. Per-site overrides ajustam só os knobs revisados (loop bounds, step/run timeouts, element wait timeouts, delay bases) por padrão https de origem ou glob de subdomínio. «CHANGELOG (8).txt:1.1.53»
ND-7124. runworkflow gradeia sensitive porque executa a lista expandida inteira atrás de run review flag explícita exigida também pelo parser. «CHANGELOG (8).txt:1.1.50»
ND-7125. flowlibrary valida o manifest sob schemastrict antes de tudo; template com kind fora do capability set instalado recusa inteiro; entry de publisher não verificado quarentena até verificação. «CHANGELOG (8).txt:1.1.66»
ND-7126. Assinatura de publisher é seal sha-256 sobre o corpo do manifest (cobre publisher, digest e provenance); assinatura sobre outro corpo recusa inteiro. «CHANGELOG (8).txt:1.1.66»
ND-7127. syncbridge é opt-in explícito sem default on; payload carrega só manifests e digests — payload com shape de secretvault ou log entry recusa sob qualquer flag. «CHANGELOG (8).txt:1.1.66»

### Bloco I — Rede e web api

ND-7128. Todo fetch outbound é url HTTPS revisada sem credenciais embutidas, dentro das origens concedidas da sessão (origincheck). «CHANGELOG (8).txt:1.1.42»
ND-7129. A header allowlist revisada é o conjunto exato transmitido; todo custom header precisa consent ref; headers credential-bearing (authorization, cookie, api keys) exigem consent que os nomeia. «CHANGELOG (8).txt:1.1.42»
ND-7130. fetchconsent prompts aparecem uma vez por origem e expiram na janela revisada; valores de header e body bytes nunca entram na auditoria. «CHANGELOG (8).txt:1.1.42»
ND-7131. readpath reporta miss flags honestos como step outcomes em vez de crashar. «CHANGELOG (8).txt:1.1.42»
ND-7132. callrest recusa rodar sem payload schema; valida o payload, aplica defaults e mapeia response codes para outcomes pela lista revisada ou classe 200. «CHANGELOG (8).txt:1.1.42»
ND-7133. Mutação REST e GraphQL mutation gradeiam sensitive; apikeyref anexa segredo sob header revisado, dentro do escopo de origem, sem material em report ou audit. «CHANGELOG (8).txt:1.1.42»
ND-7134. opensocket aceita só wss/event stream https com origem dentro dos grants e sem credenciais embutidas. «CHANGELOG (8).txt:1.1.43»
ND-7135. subscribesse persiste o last event id e resume exatamente de onde o stream parou. «CHANGELOG (8).txt:1.1.43/1.1.76»
ND-7136. watchrequests deriva da page timing buffers do run tab — nunca webRequest nem host permissions; reporta honestamente o que os buffers não expõem (headers, bodies, verbs, subresource statuses). «CHANGELOG (8).txt:1.1.43»
ND-7137. readheaders exige name allowlist E redaction list antes de armazenar qualquer header value. «CHANGELOG (8).txt:1.1.43»
ND-7138. capturebodies captura via fresh reviewed fetch (buffers não expõem bytes), trunca no ceiling configurado e linka todo body ao exchange pelo correlation id. «CHANGELOG (8).txt:1.1.43»
ND-7139. ratelimitrespect dorme até a janela de reset publicada pelo endpoint; wait além do budget revisado recusa alto em vez de dropar a call silenciosamente. «CHANGELOG (8).txt:1.1.76»
ND-7140. cacheresponse só arma método read-only, keyed por run namespace + método + url + hash de forma do body; resposta com credenciais recusa; resposta que segue mutação na origem nunca arma e as entradas invalidadas dropam. «CHANGELOG (8).txt:1.1.76»
ND-7141. Correlation mapping é read-only dentro do run — nunca dirige step, fila ou veredito. «CHANGELOG (8).txt:1.1.76»
ND-7142. formpost/multipartpost gradeiam sensitive; upload exige file review explícita antes de qualquer byte codificar; o progress streama sem buffer do payload inteiro. «CHANGELOG (8).txt:1.1.76»
ND-7143. longpoll para em stop condition revisada, flag de cancelamento, expiração do plano ou poll ceiling revisado — o loop nunca inventa bound próprio. «CHANGELOG (8).txt:1.1.76»

### Bloco J — Visão, OCR, forensics e capture

ND-7144. Capture kinds carregam options revisadas (format png/jpeg/webp, quality 0-100 sem cap de código, pixelratio ≥ 1 até ceiling do usuário, exporttarget memory/download/clipboard). «CHANGELOG (8).txt:1.1.40»
ND-7145. Fullpage capture compõe tiles com blend linear nos seams e pula a faixa de header fixo repetido; a posição de scroll original restaura no fim. «CHANGELOG (8).txt:1.1.40»
ND-7146. Clipboard export negocia capability via permissions api; download roda só pelo reviewed download flow; escrita em disco fora desse fluxo não existe. «CHANGELOG (8).txt:1.1.40»
ND-7147. recordscreen/captureaudio são sensitive: recusam sem consentref de prompt aprovado que cada start consome. «CHANGELOG (8).txt:1.1.41»
ND-7148. Vídeo cross-origin sem CORS headers recusa o draw honestamente. «CHANGELOG (8).txt:1.1.41»
ND-7149. OCR é read only (ocrgate); region fora do viewport recusa alto em vez de ler pixels errados. «CHANGELOG (8).txt:1.1.77»
ND-7150. frameocr exige vídeo pausado antes de qualquer pixel mover — a pause enforcement é a regra. «CHANGELOG (8).txt:1.1.77»
ND-7151. visionshot exige prompt revisado não-vazio e consent do endpoint do modelo; a origem do endpoint precisa estar nos grants da sessão antes de qualquer frame deixar o dispositivo. «CHANGELOG (8).txt:1.1.77»
ND-7152. Payload de visionshot gradeia sensitive: a auditoria carrega a provenance, nunca os bytes de imagem ou o texto da descrição. «CHANGELOG (8).txt:1.1.77»
ND-7153. redactgate recusa share externo de screenshot não redigido; máscara cujas regiões todas caem fora recusa alto — share que promete redação cobrindo nada vaza. «CHANGELOG (8).txt:1.1.77»
ND-7154. visioncache serve por image hash dentro do namespace do run; a expiração amarra à janela visioncacheretention do usuário sem default de código. «CHANGELOG (8).txt:1.1.77»
ND-7155. Forensics: beforeafter captura pre/post ao redor de todo step interativo ou sensível; step read-only pula o pre capture. «CHANGELOG (8).txt:1.1.78»
ND-7156. Console timeline mascara o texto antes de armazenar (consolemaskgate) — linha com valor secret-shaped nunca vira evidência. «CHANGELOG (8).txt:1.1.78»
ND-7157. diffbase exige confirmação do usuário; threshold ausente nunca flagga regressão — relata scores sem veredito em vez de inventar bound. «CHANGELOG (8).txt:1.1.78»
ND-7158. timelapse exige start explícito do usuário; o interval carrega nenhum code floor. «CHANGELOG (8).txt:1.1.78»

### Bloco K — Pipelines e minimização de dados

ND-7159. streamdisk escreve só pelo reviewed download flow — filesystem path ou endpoint não revisado recusa; só o chunk ativo anda na memória. «CHANGELOG (8).txt:1.1.75»
ND-7160. resumeextract pula as linhas já cobertas pelo cursor e keys persistidas; resume de outro plano, origem ou pipeline recusa alto. «CHANGELOG (8).txt:1.1.75»
ND-7161. transformvalues mantém o raw value ao lado do transformado; operação fora da lista revisada (trim, case, number, date) recusa com a recusa nomeada, sem nunca dropar a linha. «CHANGELOG (8).txt:1.1.75»
ND-7162. deduperows com key list vazia recusa — chave implícita droparia linhas que o usuário nunca escolheu comparar. «CHANGELOG (8).txt:1.1.75»
ND-7163. Grid preview é read-only; exportar um preview exige confirmação explícita do usuário (gridexportconfirmgate). «CHANGELOG (8).txt:1.1.75»
ND-7164. Toda row exportada carrega provenance (provgate) — extract sem provenance não sai, porque não responderia de onde veio nem quais operações a moldaram. «CHANGELOG (8).txt:1.1.75»
ND-7165. Minimização: campos de identidade (email, phone, name, address, account, session, user, ip, location, cookie, token) strip a menos que o plano revisado os liste; campos localrule da origem strip sempre — nunca deixam o dispositivo por nenhuma review. «CHANGELOG (8).txt:1.1.79»
ND-7166. Telemetria é off por construção: o literal enabled fica fixo em false (estado on é irrepresentável), nenhum outbound usage call de contexto algum, invariant notelemetry vale no schema. «CHANGELOG (8).txt:1.1.79»
ND-7167. Sync é opt-in por data class com consent stamp por classe; syncgate exige o opt-in antes de transportar; payload cifrado AES-GCM com chave PBKDF2 da passphrase do usuário; payload plaintext recusa. «CHANGELOG (8).txt:1.1.79»
ND-7168. Um cookie jar por task run; jar selada recusa todo write; a limpeza espera a expiry window do usuário. «CHANGELOG (8).txt:1.1.79»
ND-7169. enforcequarantine segura todo download até o veredito do scanner; hook failure ou hook ausente mantém pending — falha nunca libera nada. «CHANGELOG (8).txt:1.1.79»
ND-7170. Purge de escopo completo exige typed confirmation phrase; a classe de auditoria nunca deleta — os hashes imutáveis sobrevivem a todo purge. «CHANGELOG (8).txt:1.1.79»

### Bloco L — Navegação

ND-7171. navintent prediz as páginas que o plano aprovado vai precisar; prefetchpage aquece só urls dentro dos grants; plano mudado dropa predições stale no momento. «CHANGELOG (8).txt:1.1.74»
ND-7172. Preconnect sockets são read-only, revocáveis e filtrados pelos host grants — warming transporta, nunca requisita. «CHANGELOG (8).txt:1.1.74»
ND-7173. deeplink recusa parâmetro faltante alto em vez de construir meia url. «CHANGELOG (8).txt:1.1.74»
ND-7174. reopentab re-verifica o grant na reabertura; origem que perdeu o grant recusa — fechar uma tab nunca carrega o consent de sua origem adiante. «CHANGELOG (8).txt:1.1.74»
ND-7175. pausenavconsent congela toda navegação com prompt de consentimento aberto e enfileira a url pendente da step recusada para o resume devolver exatamente onde parou. «CHANGELOG (8).txt:1.1.74»
ND-7176. navratelimit com sliding window por domínio; janela cheia atrasa o step pelos ms que o hit mais velho precisa para envelhecer — nunca dropa silenciosamente. «CHANGELOG (8).txt:1.1.74»
ND-7177. checksafeurl: https only, sem credenciais embutidas, sem alvo de rede privada ou raw address, sem labels punycode, heurísticas de lookalike contra as origens concedidas. «CHANGELOG (8).txt:1.1.74»
ND-7178. batchopenlinks recusa o batch inteiro com uma url unsafe; batch size limitado só pelo ceiling do usuário. «CHANGELOG (8).txt:1.1.74»
ND-7179. openclipboardurl exige o gesto (explicit user action da step revisada) além do grant de origem. «CHANGELOG (8).txt:1.1.74»

### Bloco M — Ambientes de execução e sandbox

ND-7180. evaluate roda isolatedworld only; step com untrusted markup roda sandboxframe only; as 6 famílias de parse (html snapshot, network json, table row, a11y shaping, selector evaluation, screenshot stitching) escolhem entre pagecontext e offscreenworker. «CHANGELOG (8).txt:1.1.63»
ND-7181. sandboxframe stripa scripts e event handlers, nonce por render, envelope postmessage no canal devthinksandbox; aceitação checa o nonce — resultado de render nunca reentra no DOM fora do frame. «CHANGELOG (8).txt:1.1.63»
ND-7182. Keepalive port limitada às sessões com plano revisado ativo (keepalivegate). «CHANGELOG (8).txt:1.1.63»
ND-7183. Run state persiste com selo sha-256 de integridade e escopo por perfil — tampering detectável antes de qualquer recovery usar o record. «CHANGELOG (8).txt:1.1.63»
ND-7184. Manifest declara offscreen como permissão opcional com justificativa; páginas privilegiadas ficam fora da sandbox; registro de content script não-isolated recusa. «CHANGELOG (8).txt:1.1.63»
ND-7185. Sem o grant offscreen, todo parse pesado cai no fallback inline dentro da página — sem falha. «CHANGELOG (8).txt:1.1.63»

### Bloco N — Emulação

ND-7186. Emulação (device/network/location/user-agent/permissões) empilha camadas apenas enquanto o plano revisado lista seus steps; a última camada aplicada vence conflitos. «CHANGELOG (8).txt:1.1.48»
ND-7187. Cada camada registra o estado prévio da página para revert exato; a stack reverte em ordem inversa quando a run termina, falha, cancela, navega ou perde a tab. «CHANGELOG (8).txt:1.1.48»
ND-7188. Override de geolocation exige consent por origem com o prompt mostrando a latitude e longitude exatas. «CHANGELOG (8).txt:1.1.48»
ND-7189. Emulação de rede molda só o tráfego que a própria extensão inicia; tráfego de página fica observado apenas. «CHANGELOG (8).txt:1.1.48»
ND-7190. Presets de device/network/location/agent vivem em user data com editor e arquivos de import/export versionados — nunca listas hardcoded. «CHANGELOG (8).txt:1.1.48»

### Bloco O — Debug e profiling

ND-7191. A permissão debugger fica deliberadamente fora do manifest: toda sessão de debug é instrumentação page-injected via scripting seams, com a derivação registrada em cada record e no changelog. «CHANGELOG (8).txt:1.1.45/1.1.46»
ND-7192. O primeiro attach de um run pede uma vez com a domain allowlist renderizada; a decisão persiste por origem e o grant revoga no fim, falha ou cancelamento do run. «CHANGELOG (8).txt:1.1.46»
ND-7193. Attach sem teardown plan revisado recusa na validação e no parseproposal. «CHANGELOG (8).txt:1.1.46»
ND-7194. Breakpoint ceiling é só do usuário — valor ausente nunca enforce. «CHANGELOG (8).txt:1.1.46»
ND-7195. watchconsole exige redaction pattern list revisada antes de capturar qualquer texto de console. «CHANGELOG (8).txt:1.1.45»
ND-7196. Spam detection colapsa mensagens repetidas idênticas dentro da janela revisada em repeat counts. «CHANGELOG (8).txt:1.1.45»
ND-7197. Stack capture fora da origem concedida recusa (stack gate). «CHANGELOG (8).txt:1.1.45»

### Bloco P — Forms e dados sensíveis

ND-7198. Todo submitform exige um asksubmit review step antes; o parser e o canexecute re-checam o mesmo gate. «CHANGELOG (8).txt:1.1.37»
ND-7199. Todo fill de password exige o kind consentpassword com consent ref revisada; password entries recusam outright dentro de form records e profiles salvos. «CHANGELOG (8).txt:1.1.37»
ND-7200. generatevalues recusa valores com cara de cartão real ou identificador pessoal: run de 13-19 dígitos Luhn-válido fora do prefixo de teste 4111 recusa, forma de identificador com hífens recusa. «CHANGELOG (8).txt:1.1.37»
ND-7201. Honeypot fields (hidden, offscreen, time trap) são flagged e os fills os pulam. «CHANGELOG (8).txt:1.1.37»
ND-7202. handoffcaptcha lê presença de captcha, devolve o controle ao usuário e pausa o plano até a resolução humana. «CHANGELOG (8).txt:1.1.37»
ND-7203. saveprofiles nunca armazena password entries. «CHANGELOG (8).txt:1.1.37»
ND-7204. Submission ticket guarda o values hash, nunca os valores. «CHANGELOG (8).txt:1.1.37»

### Bloco Q — Tabs e janelas

ND-7205. closepattern recusa fechar a session tab sempre; fechar janela com task tabs pede revisão explícita. «CHANGELOG (8).txt:1.1.36»
ND-7206. Janela incognito nunca herda os session origin grants. «CHANGELOG (8).txt:1.1.36»
ND-7207. Concurrent task tab budget é gauge configurado pelo usuário, nunca constante de código. «CHANGELOG (8).txt:1.1.36»

### Bloco R — Segurança de runtime e saneamento

ND-7208. O sanitizer do sandbox frame reconstrói markup em vez de remover fragmentos: um scan linear de caracteres, sem regex sobre texto untrusted; o output prova por construção que não carrega `<script` nem atributo `on...=`. «CHANGELOG (8).txt:1.1.89»
ND-7209. Regex polinomial proibidos: scans de url/manifest/seletores usam match linear + substring finds; input adversarial não pode empurrar a expressão a backtracking. «CHANGELOG (8).txt:1.1.89/2.0.0»
ND-7210. Fetch redirect rebuilda o init sem body quando o método cai para bodiless (301/302/303) — payload POST secreto nunca anda num redirect downgraded. «CHANGELOG (8).txt:1.1.92»
ND-7211. JSON-RPC batch array vazio recusa com o parse error do spec. «CHANGELOG (8).txt:1.1.92»
ND-7212. Ceiling não-finito configurado falha closed — configuração nonsense recusa. «CHANGELOG (8).txt:1.1.92»
ND-7213. Dataset interpolation só responde valores string da própria row — propriedades herdadas nunca vazam internals de objeto para payload de step. «CHANGELOG (8).txt:1.1.92»
ND-7214. Tab pattern matcher anda star storms adversariais por token table linear com pass de dynamic programming em vez de regex compilada. «CHANGELOG (8).txt:1.1.92»
ND-7215. Torture suite cobre reassembly de markup, injeção de fórmula csv/markdown, prototype pollution, origens lookalike, hosts homograph, valores de fronteira, envelopes malformados, tokens forjados, nonces replayados, star storms, unicode/control chars, inputs de um milhão de bytes e abuse de state machine. «CHANGELOG (8).txt:1.1.92»

### Bloco S — CLI e modos headless

ND-7216. O cli reusa os mesmos módulos policy/protocol/memory/progress da extensão — os consent gates valem em toda surface. «CHANGELOG (8).txt:1.1.80»
ND-7217. Manifest command: key fora da allowlist é review miss, nunca pass silencioso; permissão declarada em required e optional recusa (uma permissão declara exatamente uma vez); todo ícone verifica presença e dimensões png contra seu size key. «CHANGELOG (8).txt:1.1.80»
ND-7218. CSP script hashes verificam contra os bytes bundled via digest seam; unsafe-inline, unsafe-eval e wildcard source recusam; hash declarado que não aponta arquivo shipado recusa. «CHANGELOG (8).txt:1.1.80»
ND-7219. Exit codes são contrato: 0 ok, 1 consent refused, 2 step failed, 3 schema error, 4 unsupported, 5 cancelled — classe desconhecida recusa como schema error, porque o próprio mapping é contrato. «CHANGELOG (8).txt:1.1.80»
ND-7220. exportdata recusa export que carregue vault marker ou valor secret-shaped — o vault nunca sai por um export. «CHANGELOG (8).txt:1.1.80»
ND-7221. headlessmode roda o read only vocabulary contra fixtures de page state; todo outro kind reporta unsupported com a razão — interação ou sensitive exige tab viva. «CHANGELOG (8).txt:1.1.80»
ND-7222. planlint compartilha o kind catalog com policy em vez de manter cópia; forbidden kind recusa o plano antes de qualquer run. «CHANGELOG (8).txt:1.1.80»

### Bloco T — Consumo multi-runtime

ND-7223. Library builda esm+cjs+umd com declarações completas; um adapter seam injeta toda a plataforma (storage, clock, logger, fetch) — policy e protocol ficam com zero platform deps. «CHANGELOG (8).txt:1.1.81»
ND-7224. Bundle size budgets por target falham o build antes de shipar (ex.: index 1.800.000b, umd 1.900.000b, cli 600.000b). «CHANGELOG (8).txt:1.1.81»
ND-7225. bundlestamp() reporta versão, modo e target do bundle corrente. «CHANGELOG (8).txt:1.1.81»
ND-7226. Dual package hazard evitado: o shared state module evita estados duplicados entre os modos esm e cjs de um mesmo processo. «CHANGELOG (8).txt:1.1.81»
ND-7227. sideEffects false preserva tree shaking; a exports map cobre as conditions import/require/types/default/browser. «CHANGELOG (8).txt:1.1.81»

### Bloco U — Bridge e native host

ND-7228. Native messaging é optional-only: required native messaging recusa — grant de host nunca instala sem review. «CHANGELOG (8).txt:1.1.85»
ND-7229. wsbridge binda porta livre aleatória no loopback e recusa todo endereço fora de localhost no próprio bind. «CHANGELOG (8).txt:1.1.85»
ND-7230. Token de sessão anda só no advertisement da native port; session records, logs e audit guardam o sha-256. «CHANGELOG (8).txt:1.1.85»
ND-7231. Desktop surfaces nunca abrem de class grant alone — a classe sensitive passa pelo human approval gate. «CHANGELOG (8).txt:1.1.85»
ND-7232. Native host ausente, outdated ou crashed degrada graciosamente: o transport desliga e todo step roda dentro do browser. «CHANGELOG (8).txt:1.1.85»
ND-7233. servercontract: envelope versionado com capability negotiation, operações sessioncreate/sessionjoin/eventpost/eventstream e um stable operation id por mensagem para correlação. «CHANGELOG (8).txt:1.1.82»
ND-7234. Relay url é sempre setting do usuário sem default: valor vazio desabilita o bridge completamente; o source scan test impõe nenhum relay url ou vendor endpoint hardcoded. «CHANGELOG (8).txt:1.1.82»
ND-7235. Pairing code troca exatamente uma vez por origem; reuse recusa. «CHANGELOG (8).txt:1.1.82»
ND-7236. chatbridge nunca executa ações: o widget do site renderiza conversa e planos como review cards e o extension approval flow é o único executor. «CHANGELOG (8).txt:1.1.82»
ND-7237. Minimização do bridge: só plan text e statuses cruzam; page content não cruza sem o consent flag explícito. «CHANGELOG (8).txt:1.1.82»
ND-7238. Site estático: zero server functions (sem edge functions, redirect rules ou vendor runtime); funciona de file:// ou qualquer static host com assets hashed e cache header immutable. «CHANGELOG (8).txt:1.1.82»

### Bloco V — Cross-browser e packaging

ND-7239. apimap registra todo webextension api tocado com equivalente chromium/firefox/safari; api nova sem linha falha o build antes de shipar. «CHANGELOG (8).txt:1.1.86»
ND-7240. Feature flags cross-browser default para o intersection set — surface que um browser não hospeda fica off em todos por default. «CHANGELOG (8).txt:1.1.86»
ND-7241. Host permissions ficam vazios em todo browser; a permission deny list vigora sobre todos os overlays. «CHANGELOG (8).txt:1.1.86»
ND-7242. Um root manifest.json único: overlays firefox/safari/vsix são keys do root (browsers, vsix) — drift de versão entre overlays e pacote é estruturalmente impossível. «CHANGELOG (8).txt:1.1.94»
ND-7243. Maven colapsa num único artifact io.github.wenathlan.extension com os consumption modes como jar resources e classifiers. «CHANGELOG (8).txt:1.1.88/1.1.90»
ND-7244. Toda a design surface vive num web/index.html — o mesmo design renderiza na web, extensão, android (capacitor) e tv; o deploy estático alcança vercel, netlify, pages ou qualquer host unchanged. «CHANGELOG (8).txt:1.1.88»
ND-7245. Version sync carimba o mesmo número em package.json, manifest, pom, csproj, vsix, xpi, safari overlay e poms; o check mode verifica zero drift. «CHANGELOG (8).txt:1.1.87»
ND-7246. Publicação: canais (npm, nuget, maven, container, vsix, firefox, site) gateiam no assemble; retry bounded de 3 tentativas; release-approval environment protege os registry jobs. «CHANGELOG (8).txt:1.1.87»
ND-7247. Digest job publica o digest da imagem; sbom cyclonedx cobre todo artifact; attestation por workflow identity via oidc — nenhum material de signing key no repo. «CHANGELOG (8).txt:1.1.87»
ND-7248. GitHub release monta draft primeiro, baixa e verifica os checksums de cada asset, e só então publica. «CHANGELOG (8).txt:1.1.87»
ND-7249. Rollback congela o artifact set anterior pelo tag imutável com checksums pinned; a retention mantém todo release publicado. «CHANGELOG (8).txt:1.1.87»
ND-7250. Nenhuma action pinada por commit digest: workflowlint usa version tag; os hashes internos (bundles, pacotes, identity) viram build artifacts gerados (dist/checksums.txt), nunca constantes de source. «CHANGELOG (8).txt:2.0.0»
ND-7251. Quinto canal rubygems via extension.gemspec com runner shim gerado no build; resolve pattern: tag verificada contra package metadata, tag-to-head equality, published-release check e existence check contra a lista de versões do registry. «CHANGELOG (8).txt:2.0.0»
ND-7252. Deprecation window fecha na major 2: cliente que ainda declara version 1 recusa com a migration path nomeada (migrateplan + docs/migrationguide.md); o deprecatedfields registry esvazia com as duas remoções prometidas executadas. «CHANGELOG (8).txt:2.0.0»
ND-7253. migrateplan converte plano devthink v1, automa workflow, selenium side file, ui vision macro ou csv tabular na plan grammar revisada; entry não mapeável recusa com o source entry nomeado. «CHANGELOG (8).txt:2.0.0»
ND-7254. Example gallery: 36 recipes em 5 categorias como plan documents puros; o runner valida schema/policy/capability, prova os consent gates e dry runs com recording consent provider — a galeria nunca drifta do código. «CHANGELOG (8).txt:2.0.0»
ND-7255. Readiness review: 24 gates verdes (pool audit, api freeze, deprecation window, migrateplan fixtures, pentest zero fail, csp strict, permdiff clean, agentcert, costcert, doccheck, recipes, sweep, matrix, telemetry free, changelog chain, migration paths, release gates, capability pins…); veredito vira artifact e o gate sai nonzero em qualquer block. «CHANGELOG (8).txt:2.0.0»
ND-7256. Security review de 2.0.0: os 3 alertas de regex polinomial fecham na fonte por scan linear (slug de capture name, identifier fold, dataset interpolation). «CHANGELOG (8).txt:2.0.0»

### Bloco W — Gates de verificação e higiene

ND-7257. Sweep: todo failed outcome dos audit trails dedup por error code + step kind; falha sem fix ou blocker written mantém o gate vermelho; scan de todo markers sem owner/release, silent catch, loops unbounded, origins/keys hardcoded e deprecated api usage. «CHANGELOG (8).txt:1.1.99»
ND-7258. matrixverify enumera a surface completa do candidato (todo kind × fake tab provider, toda surface, cli, mcp, importers, migração, 8 gates) com cobertura percentual e gate em qualquer célula vermelha. «CHANGELOG (8).txt:1.1.99»
ND-7259. telemetryfree roda o candidato atrás de block-all proxy e grava zero outbound requests; os paths de sync e update assertam opt-in only; crash/error reporting assertam local only. «CHANGELOG (8).txt:1.1.99»
ND-7260. doccheck: kind docs cobrem exatamente o vocabulário imutável de 335 kinds; doc link que não resolve, code block sem linguagem, versão ausente do changelog e surface ausente do readme — tudo falha release. «CHANGELOG (8).txt:1.1.97»
ND-7261. doccheck gera kind/reference docs do compiled module surface para os counts baterem com o código exatamente. «CHANGELOG (8).txt:1.1.97»
ND-7262. apifreeze: hash de todo schema e lista congelada num artifact; mudança de hash sem version bump sai nonzero. «CHANGELOG (8).txt:1.1.91»
ND-7263. Protocol major negotiation: v2 default para clientes novos; v1 aceito com deprecation notice na janela; major acima de 2 recusa com o range suportado dentro da recusa. «CHANGELOG (8).txt:1.1.91»
ND-7264. Schema validation roda em toda mensagem de entrada antes do dispatch; v2 strict rejeita campos desconhecidos; v1 tolera dentro da janela. «CHANGELOG (8).txt:1.1.91»
ND-7265. Additive changes only dentro de protocolv2; breaking change exige nova major por regra escrita. «CHANGELOG (8).txt:1.1.91»
ND-7266. Capability manifests descrevem cada surface (background, pagebridge, sidepanel, popup, cli, library, mcp) com messages/kinds/permissions pinados à versão; drift vira named entry que o gate recusa. «CHANGELOG (8).txt:1.1.91»
ND-7267. permdiff reporta add/remove/reorder de permissão; adição exige a justification table escrita; unjustified bloqueia. «CHANGELOG (8).txt:1.1.95»
ND-7268. cspaudit: nenhum eval ou remote code, pagebridge é o único injected file, nenhum remote resource em sidepanel/popup, sandbox frame para untrusted extracts, nenhuma wildcard source em policy frozen. «CHANGELOG (8).txt:1.1.95»
ND-7269. Pentest: 21 entradas automatizadas contra os módulos reais (consent gate, origin check, allowlist, escape hatch, kill switch, revoked consent aborta in-flight, rate buckets, bind localhost, pairing, token expiry, vault leak, loghash tamper, sandbox frame, quarantine, cookie jar, phishguard, payment/delete gates, purge/export). «CHANGELOG (8).txt:1.1.95»
ND-7270. Transparency page lista origens granted com data, permissions com consuming surface, stored data kinds com purge/export links, consent sessions ativas com expiry e o resultado do integrity check da loghash chain — 100% offline, sem request externo. «CHANGELOG (8).txt:1.1.95»
ND-7271. Soak: run longo vivo pela retention window inteira sem drift; checkpoint resume byte-identical; a hash chain sela o mesmo audit hash em duas runs completas. «CHANGELOG (8).txt:2.0.2»
ND-7272. WCAG sweep audita toda surface: alt text, accessible names nos 66 botões, labels nos 93 fields, contrast ratios computados dos tokens default (texto 4.5:1, accent 3:1), focus visible, tabindex positivo, language stamp e heading hierarchy — cada check nomeia o success criterion. «CHANGELOG (8).txt:2.0.2»
ND-7273. High contrast theme escreve os mesmos --theme-* custom properties com ratios verificados matematicamente; preferência persiste e marca o body[data-contrast="high"]. «CHANGELOG (8).txt:2.0.2»
ND-7274. stylepruning: regras de stylesheet que as surfaces não renderizam são removidas e o scan re-roda para manter o pruning enforce. «CHANGELOG (8).txt:2.0.2»
ND-7275. Store package: 6 ícones png como base64 no texto do repo; o build materializa no zip e verifica que todo payload decodifica a header png real com o pixel size exato da key. «CHANGELOG (8).txt:2.0.2»
ND-7276. Inbound guard schemastrict lê só os payload fields — o kind de dispatch resolve por registry lookup (defeito latente que recusava todo comando de surface fechado). «CHANGELOG (8).txt:2.0.2»
ND-7277. Focus order do review dialog: tabindex ordenado (ler step, approve, revise, reject) e o foco move ao abrir. «CHANGELOG (8).txt:2.0.2»

### Bloco X — Organização de repositório

ND-7278. A raiz do repo carrega só typescript sources + metadata padrão; todo runtime file vira ts module na raiz ou build artifact em dist — nada mais vive na raiz. «CHANGELOG (8).txt:1.1.98»
ND-7279. Reorganização repara as referências quebradas: build, gates, packaging descriptors e docs seguem as novas locations. «CHANGELOG (8).txt:1.1.98»
ND-7280. Companion vira ts module com entry guard — importável sem side effects e launchável como process entry. «CHANGELOG (8).txt:1.1.98»
ND-7281. Containerfile interns o runner source como um heredoc único — nenhum script container.mjs solto na raiz. «CHANGELOG (8).txt:1.1.98»
ND-7282. Frozen contract data (schemas, caps, fixtures) vira build artifacts derivados (dist/schemas, dist/caps) — sync files não clutteram a raiz. «CHANGELOG (8).txt:1.1.98»
ND-7283. A npm files list encolhe para dist, manifest.json, web, README e LICENSE — todo dado shipado anda no artifact set coberto por checksums e artifact manifest. «CHANGELOG (8).txt:1.1.98»
ND-7284. Um módulo por categoria: 94 modules consolidam em 25 categorias; family files organizam do base/mais importante pro derivado, com jsdoc family header e um merged-from marker por seção. «CHANGELOG (8).txt:1.1.90»
ND-7285. Todo export sobrevive com o mesmo nome e semântica; as 2 colisões renomeiam (pipelinegridpreview, callretryhintof) em vez de quebrar a superfície. «CHANGELOG (8).txt:1.1.90»

### Bloco Y — Design Neo DevThink (md blobs)

ND-7286. Mapeamento visual separa observação, interpretação e aplicação: imagens estáticas não permitem confirmar fontes originais, valores CSS exatos, breakpoints, hover ou animação — medidas, famílias de fonte e motion são decisões da variante, nunca fatos deduzidos das capturas. «mapeamento-orbe(1); mapeamento-alto(1); mapeamento-mova(1); mapeamento-luma(1); mapeamento-nova(1); mapa-visual-loopa(1)»
ND-7287. Decompor cada referência em 4 camadas: macro (massas, grid, eixo de leitura, sequência, espaço negativo), meso (agrupamento, ancoragem, sobreposição, slots, encaixes), micro (raio, filete, sombra, textura, tracking, badges, estados) e distribuição (onde a propriedade reaplica na marca). «mapeamento-nova(1); mapeamento-alto(1); mapeamento-mova(1)»
ND-7288. Regra de composição: preservar as características e REDISTRIBUIR as funções — não reproduzir as telas literalmente nem reunir dez layouts desconexos. «mapa-visual(13); mapa-visual(10); DESIGN_MAP(2)»
ND-7289. Métricas inventadas são proibidas: estatísticas viram dados reais do estado local (ex.: aulas concluídas sobre as doze disponíveis, favoritos, minutos acompanhados, dias escolhidos). «mapa-visual(13); mapeamento-mova(1); mapa-visual(1)»
ND-7290. Nunca usar como componentes da marca: logos de terceiros, marcas de patrocinadores, interfaces de ferramentas de apresentação, margens de captura, barras do sistema operacional (Android/hora/bateria), métricas de clientes não verificadas ou depoimentos inventados. «mapeamento-orbe(1); mapeamento-mova(1); mapa-visual(13)»
ND-7291. Depoimentos ilustrativos carregam navegação anterior/próximo e identificação de ficção. «mapa-visual(13)»
ND-7292. Uma única cena de produto por tela; elementos não competem no mesmo primeiro viewport; hero sem cards, estatísticas ou etiquetas soltas na primeira dobra. «mapa-visual(1); mapeamento-mova(1); mapeamento-orbe(1)»
ND-7293. Ornamento acompanha uma função, um conteúdo ou uma mudança de seção — nunca decoração solta. «mapa-visual(13); mapa-visual(1)»
ND-7294. O mapa de referências não aparece como seção de marketing: fica acessível apenas como documento no rodapé, com download em Markdown. «mapeamento-luma(1); DESIGN_MAP(2)»
ND-7295. Raios, recortes, gradientes e cores reaparecem em produtos e ações reais — nunca como amostras isoladas de efeitos: o site não é galeria nem painel de design tokens. «mapeamento-luma(1); mapeamento-alto(1); mapeamento-mova(1)»
ND-7296. Tokens de paleta nomeados com papel definido (papel/tinta/ácido/lilás/coral/ciano); as paletas das referências compartilham a mesma base, os mesmos espaços e a mesma linguagem de marca. «DESIGN_MAP(2)»
ND-7297. Hotspots sobre objeto técnico atualizam uma mesma ficha — nunca múltiplos blocos explicativos simultâneos. «mapa-visual(10)»
ND-7298. Funções utilitárias de referência incompatíveis com a marca (chip/contactless financeiro, QR de contato) redistribuem para identificadores, exportações e downloads reais — sem desenhar QR falso nem fingir pagamento. «mapa-visual(13)»
ND-7299. Componentes interativos com estado real: acordéons com labels, foco e estado expandido; rádio de seleção à direita; pílula preenchida como estado ativo; toggle mensal/anual com preços coerentes. «mapa-visual(13); mapa-visual(10)»
ND-7300. Dados calculados (percentual de progresso, autonomia, contagem de viajantes, distribuição de tempo) vêm de computação real da variante, nunca de números de cliente inventados. «mapeamento-orbe(1); mapeamento-alto(1); mapa-visual(13)»

---


## FASE 7b — chatinterface "Aura" (fonte: neodocs-txt/chatiput.txt, conversachatinput.txt, chat*.txt, grok-pwa-*, timeline*)

300 regras (ND-7301..7600): input/abas browser-tab, silhueta SVG medida em runtime (ResizeObserver +
rAF lerp), 6 camadas de vidro + claymorphism, tokens light/dark, mensagens/anexos, arquitetura
Aura/ResponsePanel, chrome PWA dinâmico por host, testes PWA, player, a11y/motion. Dedup: 34 variantes fundidas, ~6.000L repetidas puladas.


### Bloco A — Caixa de input premium e abas

ND-7301. Input premium em caixa arredondada (raio 28-32px) com abas estilo browser-tab ancoradas acima do topo do cartão, borderRadius "18px 18px 0 0" (base plana encostada na caixa). «chatiput.txt:7-174»
ND-7302. Duas abas canônicas: "Faça uma pergunta" com ícone FlowerMark e "Agentes" com ícone Glasses; tipo `Tab = "pergunta" | "agentes"`. «chatiput.txt:19-46;200-230»
ND-7303. Borda gradiente via wrapper p-[1.5px] com linear-gradient(160deg, #3b82f6 0%, #8b5cf6 45%, #ec4899 75%, #f97316 100%) e glow duplo 0 0 40px rgba(124,58,237,.25) + 0 0 80px rgba(59,130,246,.12). «chatiput.txt:44-56»
ND-7304. Corpo interno com raio = raio externo − espessura da borda (22px/26.5px) sobre fundo #1a1a1a ou #1C1A22, overflow-hidden. «chatiput.txt:64-66;465-475»
ND-7305. Placeholder dinâmico por aba: pergunta = "Digite sua solicitação, e eu vou procurar, responder ou criar para você."; agentes = "Digite uma instrução para os agentes ou selecione um especialista...". «chatiput.txt:70-73;298-306»
ND-7306. Textarea: rows 3, resize-none, bg-transparent, texto neutral-200/white, placeholder 25-30% de opacidade, leading-relaxed, outline-none. «chatiput.txt:67-76»
ND-7307. Botão de envio circular (h-9 a h-11), disabled sem trim ou durante geração; disabled:bg #2a2a2a ou white/10, ícone ArrowUp/Send com opacity 50 quando desabilitado. «chatiput.txt:95-104;355-372»
ND-7308. Enter envia a mensagem e limpa o input (keydown com trim check). «chatiput.txt:285-293»
ND-7309. Botão de microfone circular 40-44px com borda obsidian|white/10 e hover bg 5-10%. «chatiput.txt:340-344»
ND-7310. Botão "+" seguido de divisor vertical h-5 w-px bg 10% antes do input. «chatiput.txt:259-263»
ND-7311. Barra inferior de pílulas de ferramentas: Apps, Canva, Thinking, Search, Deep Research, Media, Audio, Workspace — rounded-full, h-28/30px, text-[11-12px], whitespace-nowrap, overflow-x-auto no-scrollbar. «chatiput.txt:377-404»
ND-7312. Pílula bot à esquerda em laranja #F97316 (hover #EA580C) e botão "mais" com três pontinhos (white/40, white, white/40). «chatiput.txt:375-380;405-416»
ND-7313. Labels superiores da caixa: "Unlock more with Pro Plan" à esquerda (Sparkles) e "Powered by Assistant v2.6" à direita, 12-13px, 40-50% de opacidade. «chatiput.txt:239-258»
ND-7314. RightTab carrega "Powered by DevThink" em 11px bold. «chat.txt:712-720»
ND-7315. Curvas saddle externas da aba ativa via SVG 16×16: path `M16,16H0a16,16,0,0,0,16-16Z` (esquerda) e espelho (direita), fill-current. «chatiput.txt:140-156»
ND-7316. Divs de sela: absolute bottom-0, -left-4/-right-4, w-4 h-4, overflow-hidden, pointer-events-none. «chatiput.txt:139-157»
ND-7317. Estados do TabButton: ativa bg #1a6db5 (dark) ou white/60 + backdrop-blur-md (light) com sombra 0 -4px 12px; inativa #1f1f1f ou white/20 com hover de texto/fundo. «chatiput.txt:126-137;398-410»
ND-7318. Aba ativa deslocada translateY(1.5px) para anular a borda horizontal e mesclar visualmente com a caixa; zIndex 30. «chatiput.txt:1700-1706»
ND-7319. GradientTab: borda própria por aba (wrapper p-[1.5px] rounded-t) com clip-path polygon que recorta 8px nos cantos inferiores internos para a curva de sela. «chatiput.txt:1080-1110»
ND-7320. FlowerMark: 4 pétalas com gradientes fmTop #60a5fa→#3b82f6, fmLeft #a78bfa→#7c3aed, fmBottom #fb923c→#f472b6, fmRight #f472b6→#c084fc e centro losango branco 3×3 rotate 45°. «chatiput.txt:158-188»
ND-7321. BrainFlowerLogo: viewBox 100×100, 4 pétalas C-curve com gradientes top/right/bottom/left (#38bdf8/#60a5fa, #c026d3/#e879f9, #f97316/#fb923c, #4f46e5/#818cf8) e círculo central branco r=12; IDs de gradiente únicos via useId (com replace de ':'). «chat.txt:297-330;844-856»
ND-7322. MaskIcon = ícone dos agentes (rosto mascarado) em path 24×24 com fill currentColor. «chat.txt:332-340»
ND-7323. Layout: chat centralizado max-w-3xl/4xl mx-auto; input absolute bottom-8 quando há mensagens, relative centrado quando vazio (empty-state), com transition-all duration-500. «chatiput.txt:225-236»
ND-7324. Feed de mensagens: px-8 pt-8 pb-40 (respiro para o input flutuante), space-y-8, overflow-y-auto, no-scrollbar, momentum-scroll, scroll-smooth. «chatiput.txt:227-233»
ND-7325. Auto-scroll ao fim: useEffect setando scrollTop = scrollHeight em [messages, isGenerating]. «chatiput.txt:216-222»
ND-7326. Bolhas: usuário justify-end bg-white/10 border-white/15 rounded-[20px] rounded-tr-sm; IA justify-start bg-white/[0.03] border-white/5 backdrop-blur-md rounded-tl-sm; max-w-[80%], text-sm, leading-relaxed. «chatiput.txt:1490-1505»
ND-7327. Indicador de geração: pílula laranja com dot pulsante (w-2 h-2 animate-pulse) e texto "Aura está processando sua solicitação...", bg 5-10%, border 10-20%. «chatiput.txt:234-245»
ND-7328. Entrada das mensagens: AnimatePresence mode="popLayout" + motion.div initial {opacity 0, y 10} → animate {1, 0}. «chatiput.txt:231-248»
ND-7329. Modo claro e escuro da mesma caixa: light = classes liquid-glass com bg-white/60 backdrop-blur-md border-white/40; dark = #1C1A22 backdrop-blur-2xl. «chatiput.txt:247-251;470-480»
ND-7330. Send button: bg-[#1C1A22] (ou bg-white text-black) com hover:scale-105 active:scale-95 e glow 0 0 20px rgba(255,255,255,0.3) quando habilitado. «chatiput.txt:346-360»
ND-7331. Simulação de resposta com setTimeout 1200-1500ms alternando isGenerating (estado de demo). «chatiput.txt:1462-1472»
ND-7332. App de demo: min-h-screen bg escuro (#07070a/#030205) flex centrado, selection bg laranja/roxo e mesh gradient de blur 120px mix-blend-screen nos cantos opostos. «chatiput.txt:1450-1456;2477-2486»

### Bloco B — Silhueta SVG unificada e geometria

ND-7333. Contorno unificado = UM único path SVG contínuo cobrindo caixa + abas com stroke gradiente 1.2-1.5px, strokeLinecap/linejoin round — nunca dois contornos independentes. «chatiput.txt:2657;2686-2702»
ND-7334. Constantes geométricas calibradas: r=24 (raio da caixa), rTab=14 (topo das abas), s=12 (saddle), tabH=32-34 (offset das abas). «chatiput.txt:2609-2614»
ND-7335. useLayoutBounds: mede container/tabs com getBoundingClientRect e devolve {W, H, T1_left, T1_right, T2_left, T2_right} relativos ao container. «chatiput.txt:2449-2477»
ND-7336. Re-medição: listener de resize + ResizeObserver no container + setTimeout 50-60ms pós-troca + requestAnimationFrame, todos com cleanup (disconnect/clearTimeout/cancelAnimationFrame). «chatiput.txt:2480-2500;4140-4160»
ND-7337. Segurança do saddle: s = min(rSaddle, gap/2, T1_left/2) evita sobreposição de curvas em telas pequenas. «chatiput.txt:2620-2621»
ND-7338. SilhouettePath: M r,tabH → L T1_left−s → C sela → V rTab → A arco → L T1_right−rTab → A → L desce → C sela → repete na aba 2 → L W−r → arcos dos 4 cantos → Z. «chatiput.txt:2623-2665»
ND-7339. SVG traseiro: absolute pointer-events-none z-0, top:-tabH, height H+tabH, overflow visible; corpo do chat transparente herda o vidro desenhado pelo path. «chatiput.txt:2676-2690;2760-2770»
ND-7340. Fill da silhueta rgba(28,26,34,0.85) ou #0d0c10 fillOpacity 0.96 com backdropFilter blur(30px) aplicado no path. «chatiput.txt:2695;4370-4380»
ND-7341. Gradiente do contorno: linearGradient 0%,0%→100%,100% com os 4 stops azul/roxo/rosa/laranja; strokeWidth 1.5. «chatiput.txt:2682-2694»
ND-7342. Variante compacta com constantes nomeadas: TAB_HEIGHT=34, CARD_RADIUS=22, TAB_RADIUS=13, SADDLE=11. «chatiput.txt:8813-8818»
ND-7343. Aba ativa com underline neon sutil: span -bottom-[2px] h-[3px] gradiente #3b82f6→#ec4899 blur 1px rounded-full. «chatiput.txt:2845-2849»
ND-7344. Aba inativa recuada: bg-black/45 text-white/40 hover:bg-black/30 (máscara escura). «chatiput.txt:2838»
ND-7345. Silhueta com strokeOpacity por stop (0.75-0.9) e fill próprio silhouetteFill vertical #1a1820 .92 → #131118 .95. «chatiput.txt:8936-8955»
ND-7346. Máscara CSS que apaga a linha superior sob a aba ativa: maskImage linear-gradient(to right, black 8px, transparent 8px→225px, black 225px), maskSize 100% 1px, maskPosition top, no-repeat. «conversachatinput.txt:3745-3765»
ND-7347. Complemento da máscara: bordas laterais/inferiores permanentes em div separado (border-b border-x) — contorno em 2 camadas quando não há path unificado. «conversachatinput.txt:3767-3771»
ND-7348. TabButton via React.forwardRef para permitir medição pelos refs do container; displayName definido. «chatiput.txt:2825-2840»
ND-7349. dispatchEvent(new Event('resize')) após 50ms no mount para recalcular a geometria inicial. «chatinerface.txt:480-486»
ND-7350. Geometria inicial: useState com initialWidth 560-680 e safeLeft = max(BOX_CORNER_RADIUS + SADDLE_CONCAVE_RADIUS, 32). «chatinerface.txt:115-131»
ND-7351. widthClass por aba: "Faça uma pergunta" w-[185px] e "Agentes" w-[115px] nas variantes medidas. «chatiput.txt:1690-1698»
ND-7352. Camadas SVG alternativas (6-7): fill de abas inativas → fundo unificado → borda fina inativa → capa sólida → fill da aba ativa → stroke gradiente 5.5px — cada uma um <svg> absoluto com zIndex 1..7 e preserveAspectRatio="none". «chatinerface.txt:540-660;700-790»
ND-7353. Transição do path: style transition `d 0.25s cubic-bezier(0.32,0.72,0,1)` em todos os paths de camada (morphing animado). «chatinerface.txt:600-610»
ND-7354. CAPA SÓLIDA (Layer 4) esconde as bordas das abas inativas dentro da forma ativa — truque de merge sem máscara. «chatinerface.txt:720-735»
ND-7355. viewBox com padding SVG_PAD=80 para strokes externos não cortarem; vbMin=-SVG_PAD; vbSize(dim)=dim+2×SVG_PAD. «chat.txt:88-94;572-576»

### Bloco C — Camadas, claymorphism e motion (app Aura)

ND-7356. Stack canônica de camadas documentada: Layer 0 borda extra (z1) → Layer 1 body fill (z2) → Layer 1b rightTab (z0) → Layer 2 contorno gradiente + fills (z3) → Layer 3 tab buttons (z10) → Layer 4 conteúdo (z20). «chat.txt:521-560;1050-1070»
ND-7357. Borda extra ativa: stroke 20px branco no combinedPath mascarado por outerMaskId (rect branco + path preto) — só o anel externo de 10px renderiza; JAMAIS produz contorno interno. «chat.txt:600-640»
ND-7358. Halos inativos: stroke 14px mascarado por inactiveOuterMaskId (interior da caixa + interiores das abas inativas em preto) — anel externo de 7px por aba. «chat.txt:642-676»
ND-7359. RightTab top contour sync: strokes horizontais y=6 (10px) e y=11 (6px, opacity ×1.4) com o mesmo outerGrad conectam o rightTab à borda extra. «chat.txt:680-706»
ND-7360. Body fill: div com clipPath path("combinedPath"), zIndex 2, backdrop blur 48px saturate 185% (vidro líquido gaussiano). «chat.txt:723-740;1863-1875»
ND-7361. RightTab: div frosted zIndex 0, height 44px, borderTopRightRadius 24px, background var(--svg-righttab-body-bg), backdrop blur 48px saturate 185%, maskImage fade horizontal (transparent 0-4px → black 180px+). «chat.txt:741-790»
ND-7362. Layer 2 com filter saturate(1.28) brightness(1.03) quando focused; transition filter .3s ease. «chat.txt:800-810»
ND-7363. Clay filter (clayFillId): feDropShadow 0 10 14 #000 .10 + innerDark (offset y+4 invertido, #000 .06) + innerLight (offset y−3 invertido, #fff .55) unidos em feMerge. «chat.txt:826-856»
ND-7364. Gradiente de contorno em movimento: linearGradient userSpaceOnUse sobre W×totalH, spreadMethod reflect, animateTransform translate "0 0; 560 220; 0 0" dur 9s repeat indefinite. «chat.txt:858-872»
ND-7365. Tab fill: linearGradient vertical com stops via vars --svg-tab-stop-0/1/2 + --svg-tab-op-0/1/2; radialGradient cx50% cy40% r75% com fade 85%→100%. «chat.txt:874-894»
ND-7366. Gloss e frostSheen: overlays brancos verticais com opacidades por vars baixas — nunca uma banda de spotlight. «chat.txt:896-920»
ND-7367. Ambient glow radial: #38bdf8 0% → #ec4899 40% (×0.6) → #8b5cf6 75% (×0.25) → transparente 100%, opacidade --svg-ambient-op. «chat.txt:922-928»
ND-7368. Refraction ring: stroke #ffffff 2px com opacity var(--svg-refraction-op). «chat.txt:966-976»
ND-7369. Contorno principal SÓLIDO 6.5px (stopOpacity 1) e bordas de abas inativas 3.5px com mask inactiveBorderMaskId. «chat.txt:998-1042»
ND-7370. Pulse on send: motion.path stroke branco, opacity [0,0.92,0], strokeWidth [6.5,9,9.5], dur 0.6 easeOut, transitório via AnimatePresence — sem duplicar contorno. «chat.txt:1046-1056»
ND-7371. Tab buttons: aria-pressed, height 40, padding 0 16px, background transparent, transition color .22s + transform .18s EASE; borderRadius dinâmico por animRadius. «chat.txt:1088-1120»
ND-7372. Tween geométrico: startTween com requestAnimationFrame, lerp e easeOutQuart (1−(1−t)^4), dur 220/320/380ms; squish = raio 18→14→18. «chat.txt:443-470;492-516»
ND-7373. Refs paramsRef/targetRef/widthRef seguram os valores durante o tween; setGeometry chamado só no tick. «chat.txt:420-441»
ND-7374. Hover de aba: fills inativos opacity 0.82→0.88 com transition .22s. «chat.txt:936-948»
ND-7375. Clique na aba já ativa re-executa o squish (radius→14, depois 18) sem trocar de aba. «chat.txt:530-542»
ND-7376. showRightTab condicional: geometry.W >= 480 && rightTab.w >= 40. «chat.txt:862-864»
ND-7377. Auto-height da textarea: height auto → min(scrollHeight, 92)px por promptText; minHeight 44, maxHeight 92, fontSize 15, lineHeight 22px, letterSpacing −0.01em. «chat.txt:552-560;1140-1160»
ND-7378. Enter envia; Shift+Enter insere nova linha (preventDefault apenas quando !shiftKey). «chat.txt:1162-1168»
ND-7379. Botões de ação com motion: whileHover scale 1.06 y −1, whileTap scale 0.88-0.94 y 0. «chat.txt:1105-1130»
ND-7380. Pills com estado ativo por id (activePill) aplicando clay-btn-pressed; toggle ao clicar de novo. «chat.txt:1226-1250»
ND-7381. BLOB_PALETTES por aba: ['#3D8BFD','#9CC4FF','#FF7A2E','#D7DEE8'] e ['#FF6A1A','#FFB38E','#4A9EFF','#D7DEE8'] alimentam os blobs aurora. «chat.txt:348-352»
ND-7382. Aurora: 4 blobs 30-40vw blur 64px, animationDelay negativos (0/-5/-9/-13s), blobFloat 24s alternate com keyframes 0/33/66/100 (translate/scale/rotate); will-change transform. «chat.txt:1104-1140;1990-2020»
ND-7383. aurora-overlay radial 62% 52% at 50% 46% (branco .45 light, #121216 .35 dark); dark reduz a opacidade dos blobs para 0.22. «chat.txt:2024-2040»

### Bloco D — Tokens CSS light/dark

ND-7384. @theme inline mapeia todos os tokens shadcn (background…sidebar, chart-1..5) e a escada de radius (sm −4px, md −2px, lg, xl +4px). «chat.txt:1188-1235»
ND-7385. Light default: --background #EDF0F4, --foreground #1A1A1B, --accent #F97316, --ring #3b82f6, --radius 0.625rem. «chat.txt:1237-1260»
ND-7386. Dark: --background #08080A, --foreground #ECECF1, --card #121216, --muted-foreground #8A8893, destructive em oklch. «chat.txt:1560-1590»
ND-7387. Chat tokens por tema: --chat-page-bg, --chat-card-bg(+soft), --chat-box-fill-top/bottom, --chat-tab-fill-*, --chat-inactive-tab-fill-*, --chat-text-primary/muted/dim/placeholder, --chat-border, --chat-glow, --chat-orb-opacity, --chat-shadow-color, --chat-blob-opacity. «chat.txt:1262-1280»
ND-7388. Clay tokens: --clay-bg (gradiente 0/48/100%), --clay-shadow (2 drop + 3 inset), variantes hover/active, --clay-orange-* (selecionado), --clay-dropdown-* (sombra em 3 níveis), --clay-card-*. «chat.txt:1300-1360»
ND-7389. Body fill tokens: --body-fill-bg gradiente vertical 3 stops + --body-fill-shadow inset. «chat.txt:1362-1366»
ND-7390. SVG tab stops: light #FFFFFF .97 → #F1F4F8 .84 → #D6DCE4 .70; dark #3b82f6/#4f46e5/#6366f1 com opacidade 1. «chat.txt:1370-1380»
ND-7391. Borda extra: opacidades light .62/.28 e dark .18/.06 (--svg-outer-op-0/1) — baixas e estáticas, sem pulse (primeiro frame = segundo frame). «chat.txt:1390-1396»
ND-7392. --svg-righttab-body-bg = mesmo gradiente 135deg branco com as mesmas vars da borda extra: mesma cor, textura e transparência = overlap invisível onde a borda cruza; --righttab-text-color #000/#FFF. «chat.txt:1398-1408»
ND-7393. Frostsheen 4 stops (.40/.10/.04/.20 light; .08/.02/.01/.04 dark), ambient .16/.05, refraction .32/.08. «chat.txt:1420-1432»
ND-7394. Tokens mapeados de TODAS as fontes: frosttube (#FFFFFF .96 → #D3DBE5 .90 → #9DAEC1 .88), glassgray 4 stops slate, liquid-body/rim 3 stops, magicGradient (#38bdf8/#c026d3/#8b5cf6/#f97316), orb multicolor e orb blue (dark). «chat.txt:1434-1462»
ND-7395. --send-btn-refraction-bg: linear-gradient 135deg #FF5C00 0% → #FFB38E 28% → #F4F7FB 50% → #9CC4FF 74% → #2E7CF6 100% (fonte 26). «chat.txt:1464-1466»
ND-7396. --tab-text-active #1A1A1B/#FFFFFF; --tab-text-inactive rgba(26,26,27,.48)/rgba(255,255,255,.52); --textarea-color pareado. «chat.txt:1468-1471»
ND-7397. clay-btn: backdrop blur 14px saturate 160%; transition transform .18s cubic-bezier(.32,.72,0,1) + box-shadow/background .22s; :active translateY(1px) scale(.96); sem border/outline (forma 3D pura). «chat.txt:1735-1760»
ND-7398. Famílias de claymorphism centralizadas em classes: .clay-btn, .clay-btn-sm (sombras reduzidas), .clay-btn-pressed, .clay-dropdown (blur 28px saturate 180%), .clay-card (blur 20px saturate 170%). «chat.txt:1770-1830»
ND-7399. .liquid-glass = alias legado de .clay-card (mantido por compatibilidade). «chat.txt:1812-1818»
ND-7400. body-fill com drop-shadow duplo via filter (0 14px 22px, 0 4px 8px var(--chat-shadow-color)) — GPU e mais barato que feDropShadow por frame. «chat.txt:1863-1875»
ND-7401. .pill-active: gradiente 4 stops (#3b82f6 0, #8b5cf6 40%, #ec4899 70%, #f97316 100%) + insets clay e sombras roxa/rosa. «chat.txt:1878-1890»
ND-7402. .send-btn: gradiente 5 stops (#3b82f6→#8b5cf6 28%→#ec4899 50%→#f97316 74%→#fbbf24 100%) + ::before highlight elíptico top 42%; hover translateY(−1px) scale(1.05) saturate(1.15); active scale .92; disabled opacity .45 saturate .5 cursor not-allowed. «chat.txt:1892-1925»
ND-7403. .pro-badge: gradiente multicolor com insets (0 5px 14px −4px rgba(139,92,246,.5)). «chat.txt:1928-1938»
ND-7404. .liquid-glass-authentic (fonte 16): rgba(255,255,255,.15) + blur 50px saturate 200% + 2 drop + 3 inset shadows; dark rgba(20,20,24,.45) com sombras dimmer. «chat.txt:1948-1975»
ND-7405. .glass / .glass-card / .floating-rail: blur 24/20/32px com borders brancos .4/.2 e overrides dark .08/.06. «chat.txt:1978-2010»
ND-7406. .text-gradient-orange: background-clip text com gradiente #FF5C00→#FFAB7D. «chat.txt:2013-2018»
ND-7407. .triple-btn (fontes 24/25) e .fused-white-glass-btn (fonte 27): alternativas light 135deg branco→slate + blur 20/24px saturate 160/190%; variantes vibrant/active com gradientes multicolor. «chat.txt:2032-2090»
ND-7408. micPulse: box-shadow ring laranja rgba(255,92,0,.5) 0→7px→0 em 1.4s infinite; .mic-pulse overlay inset 0, border-radius inherit, pointer-events-none. «chat.txt:2100-2112»
ND-7409. Reset global: tap-highlight transparent + touch-callout none, overscroll-behavior none, font-smoothing antialiased; focus outline none + box-shadow none + --tw-ring-shadow 0 0 #0000. «chatiput.txt:7790-7836»
ND-7410. Reset de inputs: input/textarea/button sem appearance e border-color transparent no focus-within. «chatiput.txt:11290-11310»
ND-7411. ::selection laranja rgba(249,115,22,.2) global e .3 em inputs/textarea (webkit + moz). «chatiput.txt:7838-7844;11311-11314»
ND-7412. .no-scrollbar em 3 engines: scrollbar-width none, -ms-overflow-style none, ::-webkit-scrollbar display none (track/thumb/corner incluídos na variante final). «chatiput.txt:7798-7820;11315-11330»
ND-7413. scroll-behavior smooth no html; .momentum-scroll = -webkit-overflow-scrolling touch + smooth. «chatiput.txt:7848-7850;11332-11336»
ND-7414. Scrollbars escondidas globalmente (::-webkit-scrollbar 0/none, * { scrollbar-width: none }) — requisito explícito do dono ("tira esses scroll bar"). «chatiput.txt:7806-7818»
ND-7415. page-root/page-main: min-height 100vh flex column, centralizado, padding 1.5rem 1rem, gap 1.5rem, z-index 1 sobre o aurora fixo. «chat.txt:2130-2146»

### Bloco E — Mensagens, anexos e estados

ND-7416. ChatInterfaceProps canônico: { messages, onSendMessage(text, files?: FileData[]), isGenerating } — envio com anexos opcional. «chatiput.txt:206-212»
ND-7417. Message { id, text, sender 'user'|'ai' } como contrato mínimo do feed. «chatiput.txt:1448-1454»
ND-7418. AttachedFile { id, name, size, type 'pdf'|'image'|'code'|'generic' } com add/remove por id. «chatiput.txt:4225-4240»
ND-7419. Mocks de anexo: documento_requisitos.pdf, dashboard_redesign.png, index_module.tsx, config_sistema.json; tamanho aleatório 1-5MB com 1 casa. «chatiput.txt:4290-4300»
ND-7420. useLayoutBounds reativo a attachments.length e inputTextHeight — a silhueta cresce com anexos e auto-height. «chatiput.txt:4122-4165»
ND-7421. Variante com anexos: textarea auto-expande até 180px. «chatiput.txt:4270-4276»
ND-7422. Arquitetura modular: tipos em ./types + componentes MessageBubble e CustomBotIcon importados. «chatiput.txt:201-208»
ND-7423. Feed com viewport limitado (max-h 350-360px) nas variantes de página única. «chatiput.txt:2712-2716»
ND-7424. Send desabilitado com opacity-50 no ícone; caret laranja (caret-orange-400) na variante compacta. «chatiput.txt:8010-8030»
ND-7425. Hover de pílulas: bg white/[0.04]→white/[0.08] ou #1C1A22→#2A2731 com transition 200ms. «chatiput.txt:7940-7950»
ND-7426. Breakpoints lg em toda a caixa: tamanhos duplos (28/30px, 40/44px, textos 11/12 e 14/15px). «chatiput.txt:255-270»
ND-7427. aria-label em todos os botões-ícone: Adicionar, Enviar, Microfone, Mais opções. «chatiput.txt:98;8014;8038»
ND-7428. Camadas SVG decorativas com aria-hidden e pointer-events-none — só o conteúdo real é interativo. «chat.txt:572-578»
ND-7429. select-none nos tab buttons e toolbar (evita seleção acidental de texto). «chat.txt:1091»
ND-7430. WebkitTapHighlightColor transparent inline nos botões. «chat.txt:1108»
ND-7431. Botão "Pesquisar" com Sparkles roxo (text-purple-400) na variante dark inicial. «chatiput.txt:87-93»
ND-7432. Botões dark iniciais #2a2a2a hover #333333. «chatiput.txt:82-94»
ND-7433. Texto do indicador varia por iteração: "Aura está desenhando os vetores..." / "Processando...". «chatiput.txt:1502-1512»
ND-7434. Placeholder alternativo da aba agentes: "Instrui um agente de inteligência especialista...". «chatiput.txt:4484»
ND-7435. Label dark inicial: Glasses 14px + "Powered by Assistant v2.6". «chatiput.txt:1524-1528»

### Bloco F — Refino e proibições do dono (TODO timeline)

ND-7436. Mesclar TODAS as variantes deduplicadas em UMA interface com estrutura app/ (page.tsx, layout.tsx, globals.css). «timeline1chatiput.txt:5-7»
ND-7437. Fundir simultaneamente glassmorphism, claymorphism, fluid glass, liquid glass, vidro fosco, vidro líquido, vidro gaussiano, efeito gaussiano e gradient color; o ÚNICO efeito que não entra no contorno gradiente é o claymorphism. «timeline1chatiput.txt:11-12»
ND-7438. Converter cada elemento para Liquid Glass SEM remover técnicas, curvas, textos ou botões do exemplo. «timeline1chatiput.txt:14»
ND-7439. Abas com preenchimento gradiente sutil em todos os estados (linear cinza com vidro de cima para baixo + radial sutil isolado dentro da tab). «timeline1chatiput.txt:20-22»
ND-7440. Aba ativa e inativa compartilham preenchimento, vidro cinza, gradient sutil e contorno; a inativa é menor e com contorno próprio. «timeline1chatiput.txt:23-24»
ND-7441. Primeira aba maior; ao clicar, a segunda assume o tamanho normal (size-to-content); textos/ícones centralizados no fill, abas mais próximas. «timeline1chatiput.txt:25-27»
ND-7442. Somente duas abas com curvas saddle e geometria do exemplo — nunca retangulares. «timeline1chatiput.txt:28»
ND-7443. Eliminar fundo preto em milissegundos na troca de abas; remover linhas/cortes/bordas pretas e o contorno interno branco dentro da aba. «timeline1chatiput.txt:29-31»
ND-7444. Eliminar abas duplicadas/ghost atrás do mouse; alinhar ícone+texto na mesma baseline sem deslocamento na transição. «timeline1chatiput.txt:32-33»
ND-7445. Corrigir a microanimação que estica a primeira aba e invade a segunda. «timeline1chatiput.txt:34»
ND-7446. Contorno e borda são a MESMA coisa: nunca criar contorno do contorno nem borda da borda. «timeline1chatiput.txt:36»
ND-7447. Contorno gradiente unificado envolvendo caixa e abas como um único path contínuo e idêntico; não muda nem parece independente na transição. «timeline1chatiput.txt:37-38»
ND-7448. Contorno gradiente azul/laranja/rosa/roxo em efeito glass; SEM claymorphism no contorno. «timeline1chatiput.txt:39-40»
ND-7449. Contorno posicionado por fora, sincronizado, sem invadir o interior das abas; acompanha as abas sem delay (rAF tween lerp + easeOutQuart; primeiro frame igual ao segundo). «timeline1chatiput.txt:41-43»
ND-7450. Remover filetes laranja/brancos de desalinhamento: limite da caixa = limite do contorno. «timeline1chatiput.txt:44»
ND-7451. Só DOIS contornos definidos: gradiente unificado + borda extra externa de vidro fosco; remover contornos cinza 3D excedentes e qualquer contorno além dos dois. «timeline1chatiput.txt:45;64-65»
ND-7452. Borda extra: única, externa, puxada só para fora, atrás de tudo (última camada), nunca na frente do gradiente; não bilateral — mostrar só a parte de fora, como se fosse cortada pelo contorno gradiente. «timeline1chatiput.txt:47-49»
ND-7453. Borda extra 20px sem desfoque na versão principal; 5px branco transparente com vidro em ajuste fino; sempre outer-only. «timeline1chatiput.txt:51»
ND-7454. Sem curvas matemáticas no contorno externo — apenas posicionado atrás do contorno gradiente. «timeline1chatiput.txt:52»
ND-7455. Evitar quebra de cor: corrigir vazamento e sobreposição de contornos entre abas esquerda/direita. «timeline1chatiput.txt:53»
ND-7456. Em vez de roxo sólido: borda de vidro fosca com as mesmas cores em efeito glass e gradiente em movimento; fundo do contorno fosco, contorno de vidro, fills das abas liquid glass. «timeline1chatiput.txt:56-57»
ND-7457. Contorno extra transparente passa por volta e POR CIMA das abas ativa e inativa (não atrás da inativa); contorno gradiente colorido na frente do halo fosco inativo (halo outer-only via outerMaskId/inactiveOuterMaskId). «timeline1chatiput.txt:58-60»
ND-7458. RightTab: mesma cor e textura da borda extra, esquerda na ponta da aba 1, direita no limite do contorno roxo (nunca além da borda extra), zIndex atrás de tudo, fade suave, sem contorno próprio, expandida para baixo para parecer que emerge de baixo. «timeline1chatiput.txt:71-74»
ND-7459. Caixa compacta (horizontal menor que vertical), tamanho fixo com botões se ajustando a ela; vidro envolve por fora, nunca por dentro. «timeline1chatiput.txt:78-80»
ND-7460. Botões na mesma baseline, juntos, mesmo tamanho, sem bordas próprias nem cortes; + à esquerda, mic/send à direita; ícones oficiais BrainFlowerLogo/MaskIcon (não os antigos); sem redundância de botões/textos/labels; pills com clay pressed ao clicar (sem gradiente roxo); toolbar menor com gaps uniformes, scroll horizontal se necessário e respiro para drop-shadow sem corte de quadro. «timeline1chatiput.txt:82-90»

### Bloco G — Arquitetura de código e fluxo (app Aura)

ND-7461. Ordem de unificação: atualizar somente src/chat/ChatInterface.tsx; depois migrar para page.tsx; deletar theme-provider.tsx quando next-themes estiver inline. «timeline1chatiput.txt:95;99»
ND-7462. Design CSS em globals.css como classes utilitárias + variáveis; page.tsx só lógica e JSX estrutural (sincronia globals.css ↔ page.tsx). «timeline1chatiput.txt:96-97»
ND-7463. Flash branco→escuro corrigido com className="dark" no html no SSR + suppressHydrationWarning; script blocking do next-themes troca a classe antes do paint; disableTransitionOnChange; tema 100% via CSS variables (sem gates mounted nem delay de mouse). «chat.txt:32-39;1100-1108;timeline1chatiput.txt:100-101»
ND-7464. Remover frost-sheen, frost-pulse e liquid-glass-reflection que geram spotlights; eliminar linhas brancas, highlighted e spotlighted. «timeline1chatiput.txt:102-104»
ND-7465. Performance: menos camadas SVG, menos filtros pesados por frame, sem animação mattePulse infinita, ResizeObserver só no container. «timeline1chatiput.txt:105»
ND-7466. Pulse-on-send transitório sem duplicar contorno. «timeline1chatiput.txt:106»
ND-7467. Strip da página: header com logo Aura Pro + theme toggle; prompt card com abas e contorno; toolbar e response panel mínimo. «timeline1chatiput.txt:107»
ND-7468. Entrega: artefato HTML único com CSS inline + CSS Houdini + Tailwind inline e pacote ZIP; verificação com agent-browser e VLM em light/dark, troca de abas, hover, send, mobile e lint limpo. «timeline1chatiput.txt:110-111»
ND-7469. App "Aura — Unified Chat Interface" = fusão das melhores partes de 34 variantes deduplicadas; metadata com keywords Aura/chat/AI/liquid glass/claymorphism; fontes Geist/Geist Mono; Toaster incluído. «chat.txt:15-22»
ND-7470. Tab state persistido em localStorage (chave 'active-tab-state') com try/catch e parse seguro (fallback 0). «chatinterface.txt:1-14»
ND-7471. Geometria exportada de lib/geometry: BOX_CORNER_RADIUS 24, SADDLE_CONCAVE_RADIUS 14, TAB_HEIGHT 40, OVERLAP_OFFSET 1.5, BOX_HEIGHT 132-168, TAB_SLANT 8, ACTIVE_TAB_RADIUS 18, INACTIVE_TAB_RADIUS 14 + interfaces ComponentGeometry/InactiveTabGeometry/GradientStop/TabItem. «chatinerface.txt:41-90»
ND-7472. Três geradores de path determinísticos: generateCombinedPath (caixa + aba ativa), generateTabOnlyPath (só aba ativa, fillBottom = boxTop+2.5), generateInactiveTabPath (abas inativas menores, top = TAB_HEIGHT−34). «chat.txt:96-180;chatinerface.txt:92-145»
ND-7473. Curvas de sela com frações 0.55/0.45 do raio e TAB_SLANT inclinando o lado esquerdo da aba. «chat.txt:104-116»
ND-7474. Clamp minLeft: tabX ≥ BOX_CORNER_RADIUS + SADDLE_CONCAVE_RADIUS para a curva não invadir o canto da caixa. «chat.txt:475-477»
ND-7475. perguntaRightRef rastreia a borda direita da aba 0 para posicionar o rightTab. «chat.txt:484-490»
ND-7476. ResponsePanel: AnimatePresence mode="wait" com 3 estados (thinking/response/empty) e transições 0.3-0.35s ease [0.32,0.72,0,1]. «chatinterface.txt:640-660»
ND-7477. Thinking: logo com glow pulsante (boxShadow cor por aba) + 3 dots com y [0,−3,0] e opacity [0.3,1,0.3] delay i×0.15s; textos "Processando sua pergunta…" / "Acionando agentes…". «chatinterface.txt:662-700»
ND-7478. Response: card #18181b border #1E1E24, header com gradiente #1a1a22→#18181b, título por aba (Resposta / Resultado do agente), Check emerald + "Concluído", citação do prompt em itálico. «chatinerface.txt:1250-1290»
ND-7479. Empty: borda dashed #1E1E24 com logo e dica "Digite sua mensagem e pressione Enter para enviar". «chatinerface.txt:1295-1305»
ND-7480. Simulação: setTimeout 1200ms define submitted e desliga isThinking; submit bloqueado durante thinking ou prompt vazio. «chatinerface.txt:668-676»
ND-7481. Skills button: pílula com orbe gradiente #8b5cf6→#ec4899 e glifo ✦ 9px. «chatinterface.txt:540-552»
ND-7482. Botão de modelo "Max" com BrainFlowerLogo 14px e chevron dropdown 12px opacity 70. «chatinterface.txt:556-572»
ND-7483. Send circular 36px gradiente #6366f1→#c026d3 (variante final dark). «chatinterface.txt:574-580»
ND-7484. glowColor/dotColor por aba no ResponsePanel: rgba(59,130,246,.4)/#3b82f6 vs rgba(99,102,241,.4)/#6366f1. «chatinterface.txt:604-608»
ND-7485. INACTIVE_BORDER_STOPS próprio (azul → índigo 50% → indigo) com stopOpacity 0.5 para bordas inativas discretas. «chatinerface.txt:742-748»

### Bloco H — PWA chrome (plugin + shared)

ND-7486. PWA chrome em duas metades: plugin Vite (dev/preview) e middleware de servidor para apps deployados; scripts compartilhados em grok-pwa-shared.mjs. «grok-pwa-plugin.txt:1-5»
ND-7487. Shared ESM puro consumido por node --test e pelo bundler Nitro — fonte única de verdade do head chrome (PWA, extensions.js, OG). «grok-pwa-shared.txt:1-4»
ND-7488. Manifest dinâmico em /__grok/manifest.webmanifest (ou .json): content-type application/manifest+json, cache-control no-cache, content-length por byteLength. «grok-pwa-plugin.txt:54-66»
ND-7489. Página de tutorial de instalação quando install=1&platform=ios, path é documento e Accept aceita HTML; template com {{APP_NAME}}/{{APP_URL}} escapeados; erro 500 "install page unavailable" se faltar. «grok-pwa-plugin.txt:37-52;grok-pwa-shared.txt:96-113»
ND-7490. renderWebManifest: name/short_name derivados do host, id/start_url/scope "/", display standalone, background/theme #000000, ícone /__grok/icon-180.png 180×180. «grok-pwa-shared.txt:114-134»
ND-7491. appNameFromHost: só hosts *.grok.me publicados decodificam o nome do primeiro label (slug → Title Case por hífen); www/slug inválido → "Grok App"; hosts preview nunca decodificam nomes internos. «grok-pwa-shared.txt:29-46»
ND-7492. publicAppHost valida hostname (regex [a-z0-9.-], exige ponto, rejeita IPv4); resolvePublicHost faz fallback para VITE_PUBLIC_HOSTNAME. «grok-pwa-shared.txt:49-64»
ND-7493. Head tags PWA padrão: link manifest, apple-touch-icon, apple-mobile-web-app-title, apple-mobile-web-app-status-bar-style black, theme-color #000000 — metas legadas *-web-app-capable deliberadamente ausentes (standalone vem do manifest). «grok-pwa-shared.txt:136-158»
ND-7494. Injeção idempotente: apenas tags ausentes são adicionadas (checa href/name existentes); aplicar 2× produz o mesmo HTML (testado). «grok-pwa-shared.txt:341-365;grok-pwa-plugin.test.txt:106-112»
ND-7495. stripShareMetaTags remove metas og:*/twitter:*/x:game:* existentes antes de reinjetar versões canônicas; twitter:card e og:title aparecem exatamente 1×. «grok-pwa-shared.txt:289-300;grok-pwa-plugin.test.txt:100-112»
ND-7496. Cascata de título OG: site.title → <title> do documento → appNameFromHost → appName arg → default. «grok-pwa-shared.txt:243-256»
ND-7497. og:image: card custom (site.card=custom com public/og.jpg|og.png; og.png preferido quando og.jpg ausente) → placeholder og.grok.me/v1/card.png?host&title(&color se hex 6). «grok-pwa-shared.txt:271-286;201-212»
ND-7498. og:image:width 1200 × height 630; banner x:game:image 1200×264 só com host público + site.banner; sem eles não emite. «grok-pwa-shared.txt:279-286;grok-pwa-plugin.test.txt:153-178»
ND-7499. site.json em src/lib/og/site.json; snapshotOgIdentity detecta public/og.jpg|png e public/x-banner.jpg e carimba card/image/banner — identidade "baked" no bundle para Vercel sem workspace FS. «grok-pwa-shared.txt:213-231»
ND-7500. Site explícito sem card=custom NÃO é sobrescrito por arquivo og.* no cwd (testado). «grok-pwa-plugin.test.txt:125-136»
ND-7501. extensions.js da plataforma: script defer com data-project-id + metas grok-project-id, grok:app_id, x:creator, x:creator:id quando VITE_PROJECT_ID/X_CREATOR/X_CREATOR_ID definidos; sem id, script simples e sem metas. «grok-pwa-shared.txt:160-200;grok-pwa-plugin.test.txt:19-42»
ND-7502. escapeHtml cobre & < > " '; unescapeHtml decodifica &amp; por último (uma passada desfaz uma codificação). «grok-pwa-shared.txt:18-27»
ND-7503. titleFromDocument via regex <title> com unescape; placeholderCardColor valida hex de 6 dígitos. «grok-pwa-shared.txt:235-241;20-26»
ND-7504. Streaming head injector: bufferiza apenas até </head> (marcador ASCII, nunca dentro de byte de continuação UTF-8), depois passa os chunks adiante — streaming SSR mantém o early flush. «grok-pwa-shared.txt:400-476»
ND-7505. Modo inject/passthrough decidido no primeiro chunk: content-type text/html e SEM content-encoding; gzip passa intacto; content-length removido só se !headersSent (respostas chunked não carregam header removível). «grok-pwa-plugin.txt:104-125»
ND-7506. Wrap de res.write/res.end: injector.push por chunk e flush no end; passthrough devolve o original imediatamente. «grok-pwa-plugin.txt:127-160»
ND-7507. requestHost: x-forwarded-host → host → :authority (HTTP/2), primeiro item de listas. «grok-pwa-plugin.txt:15-21»
ND-7508. isDocumentPath exclui /__grok/, /api/, /@, /node_modules e paths com extensão; acceptsHtml aceita header vazio, text/html ou */*. «grok-pwa-shared.txt:66-82»
ND-7509. stripInstallParams remove install/platform e devolve o link limpo do app. «grok-pwa-shared.txt:84-94»
ND-7510. Ordem dos middlewares: serveGrokPwa + wrapHtmlResponses ANTES do SSR (TanStack Start) no configureServer; no preview, wrap em post-hook DEPOIS do compression para ver HTML plaintext (a compressão então re-comprime a saída injetada). «grok-pwa-plugin.txt:166-182»
ND-7511. Virtual module virtual:grok-og-identity resolve \0id e exporta grokOgIdentity como JSON do snapshot. «grok-pwa-plugin.txt:7-9;164-172»
ND-7512. transformIndexHtml injeta o head no dev com host de VITE_PUBLIC_HOSTNAME. «grok-pwa-plugin.txt:174-178»
ND-7513. sendHtml: 200, content-type text/html utf-8, no-cache, content-length por byteLength. «grok-pwa-plugin.txt:30-36»
ND-7514. Rotas de install/manifest aceitam apenas GET; métodos não-GET passam direto. «grok-pwa-plugin.txt:40-46»
ND-7515. normalizeHeadContext unifica cwd/site/appName/projectId/creator/creatorId/host com defaults do snapshot. «grok-pwa-shared.txt:302-316»

### Bloco I — Testes do PWA

ND-7516. Testes node:test + assert/strict: injeção antes de </head>, com manifest + apple-touch-icon + extensions.js presentes. «grok-pwa-plugin.test.txt:22-29»
ND-7517. Sem projectId: script defer sem data-project-id e sem metas grok:app_id/grok-project-id. «grok-pwa-plugin.test.txt:31-42»
ND-7518. Com projectId: meta name grok-project-id, data-project-id no script e meta property grok:app_id — sem duplicar grok:app_id em segunda aplicação. «grok-pwa-plugin.test.txt:44-58»
ND-7519. Idempotência: injectGrokPwaHead(once) === twice; contagem de twitter:card/og:title = 1. «grok-pwa-plugin.test.txt:106-112»
ND-7520. Baked identity com cwd vazio: título/tipo/card do site explícito vencem; og:image aponta para o host público, sem og.grok.me. «grok-pwa-plugin.test.txt:113-124»
ND-7521. Site {} + og.jpg no cwd: placeholder do serviço OG usado (site explícito sem card=custom não é sobrescrito). «grok-pwa-plugin.test.txt:125-136»
ND-7522. snapshotOgIdentity carimba card=custom + image /og.jpg e banner /x-banner.jpg dos arquivos públicos. «grok-pwa-plugin.test.txt:137-152»
ND-7523. x:game:image só com host público E banner; dimensões 1200/264. «grok-pwa-plugin.test.txt:153-178»
ND-7524. Slug grok.me vira fallback de título ("wild-race.grok.me" → "Wild Race"); site.title "Grok App" é nome real, não sentinela. «grok-pwa-plugin.test.txt:179-199»

### Bloco J — Player @devthink/player (bônus outros.video)

ND-7525. Benchmark de 7 concorrentes (Video.js v10, Plyr, MediaElement.js, Shaka, Flowplayer, Clappr, Player.js) com tabela de features e métricas GitHub/npm. «outros.video/PESQUISA-CONCORRENCIA.txt:1-40»
ND-7526. Padrões a absorver: composição por features/slices (Video.js v10), presets por caso de uso, skins oficiais, llms.txt para agentes de IA. «PESQUISA-CONCORRENCIA.txt:41-60»
ND-7527. Gaps críticos do player: plugin system (padrão Clappr: 6 tipos), offline storage IndexedDB (Shaka), DRM EME Widevine/PlayReady/FairPlay, a11y WAI-ARIA (benchmark Plyr), i18n, bindings React/Vue/Svelte, ads IMA. «PESQUISA-CONCORRENCIA.txt;O-QUE-FALTA.txt:80-130»
ND-7528. Priorização P0-P3 com esforço estimado em tabela (status bug/missing + effort). «O-QUE-FALTA.txt:20-45»
ND-7529. Bugs P0: quality selector falso (hardcoded sem efeito), version mismatch entre docs e package.json, API.md com assinaturas incorretas (regenerar do código), feedback de gesto hardcoded ±10s ignorando config.doubleTapSeek. «O-QUE-FALTA.txt:48-95»
ND-7530. A11y mínima: role slider em volume/rate, aria-label em todos os botões, aria-live polite no status, navegação teclado (Tab/arrows/Enter/Escape), focus management no menu, prefers-reduced-motion. «O-QUE-FALTA.txt:112-122»
ND-7531. i18n via options.i18n Record<string,string> com override de strings. «O-QUE-FALTA.txt:124-135»
ND-7532. Exclusivos do player: WebGPU filters WGSL, painel CSS de 12 presets, WebAudio EQ 7 presets + loudness EBU R128, WebSocket sync, WebRTC peer, glassmorphism UI, gestures, ambient mode, A/B loop, stall detection, chapter markers, stats overlay, screenshot, Document PiP, resume playback, HDR/WCG. «PESQUISA-CONCORRENCIA.txt;COMPARATIVO-CONCORRENCIA.txt:1.2-1.6»
ND-7533. Arquitetura alvo: PluginManager (register/enable/disable/emit) + CorePlugin/UIPlugin/ContainerPlugin + EventSystem de baixo acoplamento. «O-QUE-FALTA.txt:99-110»
ND-7534. Provider layer: BaseProvider abstrata com 6 implementações (HTML5, YouTube, Vimeo, HLS, DASH, Embed) + factory createProvider + setSrc recriando o provider. «COMPARATIVO-CONCORRENCIA.txt:2.2;ARCHITECTURE.txt»
ND-7535. AudioEngine pipeline: source → gain → bass 200Hz lowshelf → mid 1kHz peaking → treble 3kHz highshelf → compressor → panner → destination. «COMPARATIVO-CONCORRENCIA.txt:1.3»
ND-7536. WebSocket: 8 tipos de mensagem (play/pause/seek/volume/mute/state/chat/reaction/sync) e reconexão automática com máx 5 tentativas. «COMPARATIVO-CONCORRENCIA.txt:1.4»
ND-7537. createPlayer(container, options): src/autoplay/muted/loop/controls/theme/aspectRatio/provider auto/title/chapters/live/wsUrl/poster + callbacks onReady/onPlay/onPause/onEnded/onError. «outros.video/API.txt:1-35»
ND-7538. Métodos: play/pause/togglePlay/seek/seekBy/setSrc/setVolume/toggleMute/toggleFullscreen/togglePiP/toggleTheater/screenshot/toggleStats/setVideoFilter/setAudioPreset/setPlaybackRate (0.5-4)/setLoopA/setLoopB/clearLoop/on/off/once/getState/getProvider/getOptions/getStats/getAudioEngine. «API.txt:37-110»
ND-7539. 12 filtros CSS nomeados: none, grayscale, sepia, invert, blur, sharpen, vintage, cold, warm, dramatic, noir, cyberpunk. «API.txt:112-130»
ND-7540. Arquitetura modular em 12 módulos com responsabilidade única (player/providers/ui/filters/effects/net/media/codecs/gestures/stall/chapters/ambient). «ARCHITECTURE.txt:1-80»
ND-7541. WebGPU: compute pipeline WGSL (grayscale/sepia/invert + edge/pixelation/bloom/sobel) via importExternalTexture — pipeline acoplada a canvas separado, exigindo composição intermediária (limitação documentada). «COMPARATIVO-CONCORRENCIA.txt:1.2;ARCHITECTURE.txt:effects»
ND-7542. ChapterManager: parseWebVTTChapters (VTT → capítulos) + loadChaptersFromURL remoto. «ARCHITECTURE.txt:chapters»
ND-7543. Ambient mode com extração de cor do vídeo (canvas) + variante Worker. «COMPARATIVO-CONCORRENCIA.txt:1.6»
ND-7544. Resume playback via localStorage save/restore da posição. «COMPARATIVO-CONCORRENCIA.txt:1.6»
ND-7545. Stats overlay: FPS, dropped frames, resolution, decode type. «COMPARATIVO-CONCORRENCIA.txt:1.6»
ND-7546. Gestures: tap/double-tap/swipe/pinch/press com feedback visual pop; doubleTapSeek configurável. «COMPARATIVO-CONCORRENCIA.txt:1.5;O-QUE-FALTA.txt:88-95»
ND-7547. Codec detection: WebCodecsEngine, codecPresets H.264/H.265/VP9/AV1, MediaCapabilitiesChecker para melhor config de playback. «ARCHITECTURE.txt:codecs»
ND-7548. Offline storage proposto: OfflineManager com download/get/list/delete + quota e progresso (idb-keyval já em deps mas sem uso). «O-QUE-FALTA.txt:137-148»

### Bloco K — Workflow de dedup e verificação

ND-7549. Dedup por par de arquivos byte a byte ou SHA-256 idêntico; subagentes distinguem duplicatas verdadeiras de versões divergentes; zip final com manifesto SHA-256 e relatório legível das remoções. «timeline1chatiput.txt:1-4»
ND-7550. Repack git: filtrar objects/heads/commits, remover replace refs, reflog corrompido e objetos órfãos, gc agressivo (165MB → ~10MB). «timeline1chatiput.txt:105»
ND-7551. Limpeza de raiz: deletar png/txt/md/zip e pasta sources quando solicitado; limpar tool-results e artefatos temporários. «timeline1chatiput.txt:106»
ND-7552. Ler example-chatinterface + chat-interface + referências liquid glass e unir em UM único componente. «timeline1chatiput.txt:108»
ND-7553. Reavaliar a pasta sources mapeando os efeitos faltantes dos arquivos 5, 5.1, 16, 24, 25, 26. «timeline1chatiput.txt:109»
ND-7554. Análise por partes iguais do arquivo de referência, unindo o resultado ao final, sem perder o segredo das abas, das curvas e do contorno. «timeline1chatiput.txt:17»
ND-7555. CSS inline + CSS Houdini + Tailwind inline nos artefatos standalone. «timeline1chatiput.txt:18»
ND-7556. Dev server ligado durante o refinamento iterativo (analisar → ajustar → refinar). «timeline chat.txt:9»
ND-7557. Verificação final com agent-browser + VLM: light/dark, troca de abas, hover, send, mobile, lint limpo. «timeline1chatiput.txt:111»
ND-7558. Manter a restrição de dois contornos até o contorno de vidro grosso fosco ficar idêntico à referência. «timeline1chatiput.txt:61;66»
ND-7559. Material do rightTab único = o da borda extra (mesma cor/textura/transparência; sem backdrop-filter alternativo, sem base opaca, sem transparência azul). «chat.txt:1398-1408»
ND-7560. Onda dirigida por checklist TODO: cada linha do timeline vira tarefa verificável do build. «timeline chat.txt:1-216»

### Bloco L — Acessibilidade, mobile e micro-UI

ND-7561. Sem scrollbars em nenhum lugar (requisito global do dono) — classe no-scrollbar + reset global de scrollbar. «chatiput.txt:7806-7820»
ND-7562. Sem contornos de foco visíveis: outline/box-shadow none em :focus/:focus-visible/:focus-within e reset por elemento interativo. «chatiput.txt:7822-7836»
ND-7563. tap-highlight transparent em todos os elementos (web + mobile). «chatiput.txt:7792-7796»
ND-7564. overscroll-behavior none no html/body para evitar bounce. «chatiput.txt:7797-7799»
ND-7565. Placeholder dinâmico muda com a aba ativa (TABS[activeTab].placeholder). «chat.txt:1170-1176»
ND-7566. Ícones com stroke-width explícito (1.5px/2px/2.5px) em vez do default bold. «chatiput.txt:241-258»
ND-7567. Rótulos de marca com tracking-tight e letterSpacing −0.01em. «chat.txt:1122-1130»
ND-7568. Texto das abas 13px font-weight 600-700 leading-none whitespace-nowrap. «chat.txt:1124-1132»
ND-7569. Botões circulares puros (rounded-full) para ações e pílulas arredondadas para ferramentas. «chatiput.txt:377-404»
ND-7570. Divisores verticais h-4/h-5 w-px com opacidade 8-10% separam grupos de botões. «chatiput.txt:7890-7900»
ND-7571. Sombras de cartão: 0 8px 32px rgba(0,0,0,.4) dark / 0 4px 30px rgb(0,0,0,.03) light. «chatiput.txt:246-252»
ND-7572. Inset highlight: faixa top h-px gradiente transparent→white/[0.08]→transparent (brilho superior da caixa). «chatiput.txt:7906-7908»
ND-7573. Caixa com ring-0 e appearance-none para eliminar estilos nativos. «chatiput.txt:252-256»
ND-7574. Botões secundários com fundo 4-6% de branco e borda 5-6% (dark compacto). «chatiput.txt:7946-7960»
ND-7575. Feed com respiro inferior (pb-40/56) para o input flutuante não cobrir a última mensagem. «chatiput.txt:227-233»
ND-7576. Área de input absolute bottom-6/8 com px-4 lg:px-8 para safe-area. «chatiput.txt:1518-1522»
ND-7577. Chat com min-h (480-500px) para manter o input ancorado em viewport curta. «chatiput.txt:2708-2712»
ND-7578. Container com overflow-visible para as camadas SVG externas e as abas acima do topo. «chatiput.txt:2748-2752»
ND-7579. Z-index progressivo coerente: SVG 0-6, abas 20-40, conteúdo 20-40, botões 10. «chat.txt:560-1070»
ND-7580. Mobile: preserveAspectRatio none + width 100% mantêm a silhueta fluida em qualquer largura. «chatinerface.txt:540-560»

### Bloco M — Motion e timing

ND-7581. EASE global cubic-bezier(.32,.72,0,1) para transform/transition da interface. «chat.txt:94»
ND-7582. Squish de aba: 220ms in → 180-220ms espera → 320-380ms out, com dois startTween encadeados. «chat.txt:492-516»
ND-7583. Transições de cor de aba 0.2-0.22s ease. «chatinerface.txt:810-830»
ND-7584. Path morphing 0.25s cubic-bezier(0.32,0.72,0,1) nas camadas SVG. «chatinerface.txt:600»
ND-7585. Duração de hover/tap 0.18-0.22s com escala ±6-8%. «chat.txt:1105-1130»
ND-7586. Glow pulsante do thinking 1.4s easeInOut infinite; dots 0.9s com stagger 0.15s. «chatinterface.txt:648-700»
ND-7587. blobFloat 24s alternate com deslocamentos 5-10% e escala 0.94-1.1. «chat.txt:2000-2020»
ND-7588. animateTransform do gradiente 9s loop infinito. «chat.txt:858-872»
ND-7589. animate-pulse (Tailwind) para dots de status. «chatiput.txt:234-245»
ND-7590. Preferir transições de opacity/transform (compositáveis) a filtros pesados por frame. «timeline1chatiput.txt:105»

### Bloco N — Organização de projeto

ND-7591. Estrutura do app: app/page.tsx + app/layout.tsx + globals.css + components/PromptCard + components/ResponsePanel + components/icons + lib/geometry. «chat.txt:1-30;chatinerface.txt:651-760»
ND-7592. Ícones próprios (BrainFlowerLogo, MaskIcon, Plus/Mic/Send em SVG custom) além de lucide. «chat.txt:297-356»
ND-7593. Tipos compartilhados (Message, FileData) em ./types; MessageBubble e CustomBotIcon importados. «chatiput.txt:201-208»
ND-7594. Metadata Next com title/description/keywords/authors/icons. «chat.txt:15-30»
ND-7595. Geist Sans/Mono como variáveis CSS --font-geist-* consumidas no @theme. «chat.txt:1-14;1188-1200»
ND-7596. Persistência mínima: localStorage para aba ativa e posição do player (resume). «chatinterface.txt:1-14»
ND-7597. Proveniência no CSS: comentários mapeando cada efeito à fonte (source 16, 24, 25, 26, 27, 31, 28/30, 7/8, 18-20, 25). «chat.txt:1390-1462»
ND-7598. Classes utilitárias chat-text-primary/muted/dim espelham os tokens. «chat.txt:2118-2122»
ND-7599. next-themes com attribute class, defaultTheme dark, enableSystem false, disableTransitionOnChange. «chat.txt:1096-1104»
ND-7600. Fórmula do merge: ao unir variantes, preservar sempre os segredos das abas, das curvas e do contorno. «timeline1chatiput.txt:17»

---


## FASE 7c — linhagem opencode base(299)→V32 GPT-6 Astra (fonte: neodocs-txt/Opencode*, Kilo*)

256 regras (ND-7601..7856; 7857..7900 reservado): provider devthink imutável (sandbox /v4, ctx 4,78M),
escada de variants V14, all-free V18, exact-ids V20, real-context-60K V27, no-thinking V28, fix-500
V29, single-provider V30, GPT-6 Astra V32 (360 models/43 providers), antigravity→maene V13, OAuth
PKCE loopback, 16 réplicas mimo = pooling de quota. 22 duplicatas provadas por md5/diff.


### Bloco A — Arquitetura do opencode.json (o ancestral do CLI devthink)

ND-7601. O config do agente CLI é um JSON único (`$schema: https://opencode.ai/config.json`) com 4 chaves de topo: `$schema`, `autoupdate:false`, `plugin[]`, `provider{}` — nenhuma outra raiz; tudo o mais vive dentro do provider. «Opencode-FINAL-V32-GPT6-ASTRA-FIXED.txt (jq keys)»
ND-7602. `autoupdate:false` é permanente em TODAS as 35 versões — a atualização automática do CLI nunca pode trocar o config sob os pés do agente. «62 configs (jq .autoupdate)»
ND-7603. Cada provider declara: `name`, `npm` (sempre `@ai-sdk/openai-compatible`), `options.baseURL`, `options.apiKey` e o mapa `models{}` — provider = wrapper thin sobre OpenAI-compatible. «Opencode-FINAL-V32; opencode.txt»
ND-7604. Cada model declara `name` (rótulo de UI), `limit{context,output}`, `modalities{input,output}`, `options{}` e opcional `variants{}` — limites declarados explicitamente, nunca inferidos. «Opencode-FINAL-V32-GPT6-ASTRA-FIXED.txt:12850-12905»
ND-7605. `modalities.input` aceita `["text"]` ou `["text","image"]` — visão é propriedade por model (mimo-v2.5-pro, ox-alpha, minimax-m3, kimi-k2.6, deepseek-v4, gemma-3-12b-it etc. têm image input). «V32 (jq modalities)»
ND-7606. O quarteto de sampling padrão é `temperature:1, top_p:0.95 (V17+), top_k:40` + `reasoning:{effort:"max",enabled:true,exclude:false}` — esforço máximo de raciocínio como default universal. «V17→V32 (combos jq: 125-326 models em t1/tp0.95/tk40/max)»
ND-7607. Em V4 o campo reasoning era BOOLEAN; V5 migrou para objeto `{effort,enabled,exclude}`; V13 completou a migração (344 obj / 8 bool — os 8 zen free ficam sem options). «V4 (347 bool/1 obj) → V5 (274/74) → V13 (8/344); nome do arquivo V5-REASONING-OBJECT»
ND-7608. `chat_template_kwargs:{enable_thinking:true}` é injetado APENAS em providers que suportam o parâmetro (famílias qwen/mimo/glm/nemotron/kimi) — injetar em quem não suporta causa erro; V7 podou 62→28 e V10 expandiu 28→101 após verificar suporte. «V7 vs V10 (jq chat_template blocks)»
ND-7609. `variants{}` = seleção de orçamento de output por request (`--variant=high`): low 16384 / medium 32768 / high 49152 / xhigh 65536 / max 82000 tokens — a escada de variantes padrão da casa. «V14:13689-13715; V32 (jq variants)»
ND-7610. Variante `none` = modo sem thinking sem sair do model: em V18 veio com `output:0` (bug), V19 removeu-a, V28 consagrou `none:{}` vazio como primeiro variant de todos os models. «V18 jq (180 models c/ none); V19 jq (0); V28:8660-8667»
ND-7611. Providers espelho com o mesmo model sob outro provider (ex.: opencodez vs opencode, fusion vs nvidia) são proibidos no estado final — V26 removeu o espelho opencodez inteiro (359 models). «V25→V26 (diff −8 rows opencodez)»
ND-7612. Só entra no config model cujo ID é EXATAMENTE o que o endpoint aceita — V20 podou 123 models com IDs adivinhados e manteve os 8 zen free com ID comprovado. «V19→V20 (−52 opencodez, −52 opencode, −19 kilo); nome EXACT-IDS»
ND-7613. O `name` de UI passa por duas auditorias de estilo: V21 "Vendor: Model (free)" (estilo catálogo) e V22 simplificado — IDs imutáveis, nomes livres. «V20→V21→V22 (diffs 498/224 rows, só coluna name)»
ND-7614. Plugin auth substituível sem tocar no resto: V13 trocou `opencode-antigravity-auth@beta` por `@wenathlan/maene@latest` em 1 linha (maene injeta chat.headers por provider — spoof Gemini CLI). «V12 vs V13 (jq .plugin)»
ND-7615. Stack de plugins fixa: auth (antigravity→maene) + `@zilliz/memsearch-opencode` (memória de busca) + `opencode-universal-memory` (memória universal) — as 3 funções: auth, memória de longo prazo, memória de sessão. «62 configs (jq .plugin)»
ND-7616. O provider `google` NÃO tem baseURL — os models `antigravity-*`/gemini são servidos pelo plugin de auth embutido, que sintetiza as credenciais e o endpoint. «V32 (jq baseURL = "(plugin builtin)")»
ND-7617. Portabilidade de schema: trocar 1 linha (`$schema` → `https://app.kilo.ai/config.json`) converte o config inteiro para o Kilo Code — o corpo provider/models é idêntico byte a byte. «Kilo-CONVERTIDO vs CORRIGIDO; Kilo-FINAL-V32 vs V32 (jq -cS diff = 1 linha)»
ND-7618. Rate-limit pooling por réplicas: o mesmo model `mimo-v2.5-pro` aparece 16× como providers mimo-1..mimo-16, cada um com apiKey própria (tp-…) — quota multiplica-se pela contagem de chaves, não por "paciência". «V32 (jq: 16 providers mimo, baseURL token-plan-sgp/cn.xiaomimimo.com)»
ND-7619. Réplica canário em domínio alternativo: mimo-14 aponta para um railway.app e mimo-8 para opengateway.gitlawb.com — se o domínio principal cair, a réplica assume sem tocar no resto do config. «V32 (jq baseURL mimo-8/14)»
ND-7620. O provider próprio `devthink` é IMUTÁVEL em todas as 35 versões: baseURL = preview da sandbox `.space-z.ai/v4`, models `devthink` (ctx 4.780.000, out 131.000) e `glm-5.2` (1M/131.000), SEM apiKey (auth por cookie da sandbox) — o gateway é membro de primeira classe do config. «jq .provider.devthink em opencode.txt…V32 (7 checkpoints idênticos)»

### Bloco B — Catálogo de providers do estado final (V32, 43 providers / 360 models)

ND-7621. nvidia (integrate.api.nvidia.com/v1) = maior provider: 152 models (kimi-k2/k2.5/k2.6/k3, deepseek-v4-flash/pro, nemotron-3 família, qwen3-coder/plus/3.6, llama-4, glm-5.2, minimax-m3, palmyra-x5…), ctx até 10.000.000 (llama-4-scout). «V32 (jq providers; ctx dist)»
ND-7622. kilo (api.kilo.ai/api/gateway) = 47 models free com sufixo `:free`, todos ctx 1.048.576 e out 100.000, variants `low/medium/high/xhigh/max/none` — o gateway free mais denso do config. «V32 (jq kilo)»
ND-7623. kilogateway = segundo canal do mesmo gateway kilo com models free DIFFERENTES (deepseek-v4-flash, kimi-k2.5/2.6, qwen3.6-plus/3.7-plus, mimo-v2 omni/pro) — dois cortes do mesmo provedor sob providers distintos. «V32 (jq kilogateway 12 models)»
ND-7624. openrouter (openrouter.ai/api/v1) = 54 models `:free` + router `openrouter/free` (ctx 1M) — inclui stealth/ox-alpha, thinkingmachines/inkling, meituan/longcat, poolside/laguna. «V32 (jq openrouter)»
ND-7625. opencode zen (opencode.ai/zen/v1) = 8 models free oficiais do próprio CLI: deepseek-v4-flash, laguna-s-2.1, ling-3.0-flash-fin, mimo-v2.5, muse-spark-1.2/1.3-contributor, nemotron-3-ultra, nemotron-3.5-lightning — SEM limit/opções declaradas (zero de verdade). «V32 (jq opencode)»
ND-7626. google (plugin builtin) = 16 models: 6 `antigravity-*` (claude-opus-4-6-thinking, claude-sonnet-4-6, gemini-3-flash/pro/3.1-pro/3.5-flash) + gemini 2.5/3/3.1/3.5 com `customtools` — ctx 1M, out 65535/65536/128000. «V32 (jq google)»
ND-7627. aihubmix (aihubmix.com/v1) = 19 models `coding-*/crush-*/daocloud-*` free: glm-4.6/4.7/5/5.1, minimax-m2..m2.7, kimi-for-coding, qwen3.6-plus-preview, step-3.5-flash — prefixos de produto como namespacing de ID. «V32 (jq aihubmix)»
ND-7628. dashscope (dashscope-intl.aliyuncs.com/compatible-mode/v1) = 8 models qwen/kimi oficiais Alibaba, ctx 1M; qwen próprio (chat.qwen.ai/api/v2) = qwen3.6-plus. «V32 (jq dashscope/qwen)»
ND-7629. zai (chat.z.ai/api/v2) = GLM-5.2 com out 32.000 (o mais conservador dos canais glm-5.2); babel.town, cline.bot, megallm, zenmux, gmi (fefefef.space-z.ai/v3) também servem glm-5.2 — 7 canais para o mesmo modelo = redundância deliberada. «V32 (jq zai/babel/cline/megallm/zenmux/gmi)»
ND-7630. fusion (integrate.api.nvidia.com/v1) = provider agregador com models de OUTROS vendors (fusion próprio ctx 1.466.944, minimax-m3, kimi-k2.6, glm-5.1) — agrega via conta nvidia única. «V32 (jq fusion)»
ND-7631. commandcode (api.commandcode.ai/provider/v1) e venice (api.venice.ai/api/v1) = canais do model stealth `ox-alpha` (ctx 1.048.576, out 131.072, image input) — modelo stealth entra por 2 vendors + openrouter. «V32 (jq)»
ND-7632. cline (api.cline.bot/api/v1) = 4 models com prefixo de vendor no ID (`cline-free/glm-5.2`, `deepseek/deepseek-v4-flash`, `poolside/laguna-s-2.1:free`, `stepfun/step-3.7-flash`). «V32 (jq cline)»
ND-7633. experientiallabs (api.experientiallabs.ai/V1 — /V1 maiúsculo!) = GPT-6 Astra, ctx 1.050.000, out 128.000 — o model flagship da V31/V32, vendor novo sem conflito de baseURL. «V32 (jq experientiallabs)»
ND-7634. Agregadores-métrica: llm-stats (api.llm-stats.com) e tokenrouter (api.tokenrouter.com/v1) — o config consome até catálogo/métrica de terceiros como provider. «V32 (jq)»
ND-7635. zeroeval (api.zeroeval.com/v1) e zenmux (zenmux.ai/api/v1) = rotas free adicionais (glm-5.2 no zenmux). «V32 (jq)»
ND-7636. ollama (127.0.0.1:11434/v1) = único provider HTTP local; models `*:cloud` (glm-5.2:cloud, minimax-m2.7:cloud) sem reasoning/variants. «V32 (jq ollama)»
ND-7637. next-kilo e next-openrouter = réplicas "next" dos gateways kilo/openrouter (1 model cada) para testar nova geração sem tocar no provider estável. «V32 (jq)»
ND-7638. mimo oficial xiaomi (api.xiaomimimo.com/v1) = mimo-v2-omni (image input, out 90.000) e mimo-v2-pro (ctx 1.048.576, out 131.100) — os token-plan (sgp/cn) são as réplicas de pool. «V32 (jq xiaomi/mimo-*)»
ND-7639. Distribuição de contexto no estado final: 26 valores de ctx distintos — de 4.096 a 10.000.000; o trio dominante é 1.048.576 (65), 262.144 (71) e 1.317.072-esque 131072 (83). «V32 (jq ctx dist)»
ND-7640. GPT-6 Astra entra com escada de variants low/medium/high/max e out 128.000 — o flagship não usa xhigh nem none (variants sob medida). «V32 (jq gpt-6-astra)»
ND-7641. Contexto real ≠ marketing: V27 rebaixou ctx dos zen free de 262144/1048576 para os valores REAIS aceitos pelo endpoint — declarar contexto que o provider não honra quebra a sessão no meio. «V26→V27 (diff)»
ND-7642. Output mínimo viável: os zen free ficam com out 60000 — nem o model free mais barato fica sem teto de output declarado. «V27 (jq)»
ND-7643. Todo provider novo entra PRIMEIRO minimal (só name/baseURL/apiKey) e ganha limites na versão seguinte — V31 criou gpt-6-astra sem limites, V32 fixou. «V31→V32 (diff 1 row)»
ND-7644. Plugin de auth pode substituir provider inteiro: quando o endpoint zen deu HTTP 500 no muse-spark, V29 criou provider `opencode-responses` (mesmo model, outro content-type) — trocar o transport é patch legítimo. «V28→V29 (diff +2 rows opencode-responses)»
ND-7645. Máximo um provider por endpoint-transport: V30 fundiu opencode-responses de volta ao opencode — resolveu o 500, devolveu ao provider único. «V29→V30 (diff −2/+2 rows)»

### Bloco C — Linhagem pré-V4 (base → V4)

ND-7646. A config nasceu com 40 providers/299 models e plugin antigravity — a base CORRIGIDO é o ponto zero de todas as versões; 4 arquivos são cópias whitespace-idênticas dela (opencode (2)/(10), CORRIGIDO (2)) e 1 é o clone Kilo (schema swap). «md5 groups; opencode.txt»
ND-7647. Crescimento por ondas pequenas: 299→301 (+2 models) →332 (+kilo) →334 (DEFINITIVO) →342 →348 (V2/VALIDADO/V4) — cada passo ≤ 30 models, nunca big-bang. «tabela de versões (diffs por provider)»
ND-7648. A fase "DEFINITIVO→CORRIGIDO→V2→VALIDADO→V4" é um loop de correção de IDs: kilo/nvidia/openrouter corrigidos 4× seguidas (−23/+26, −11/+11, −36/+39, −23/+23) até zero divergência com os catálogos reais. «diffs DEFINITIVO→V4»
ND-7649. "VALIDADO-POR-MODELO" = validar cada ID contra o catálogo do provider antes de congelar — 26 IDs kilo/openrouter revalidados na penúltima iteração pré-V4. «diff DEF-CORRIGIDO-V2→VALIDADO (26 rows)»
ND-7650. A fase "SEM-BAGUNCA" (V4) remove o resíduo: IDs normalizados, 348 models estáveis — o config só então ganha versionamento nominal FINAL-Vn. «diff VALIDADO→V4»
ND-7651. Providers de teste (commandcode/venice) entraram e saíram 2× antes do V4 (base→(5)→(6)→DEFINITIVO) — provider só fica definitivo após 2 ciclos de entrada/saída. «diffs (5)→(6)→DEFINITIVO»
ND-7652. opencode (4).txt prova que o plugin antigravity original (NoeFabris) quebrou com models 2026 por listas fixas e versões fixas — a causa raiz de toda a linhagem de configs é a obsolescência do plugin, não dos models. «opencode (4).txt:13,287,303»
ND-7653. A réplica local do config sempre em pasta blindada de nome curto minúsculo (ex.: /mnt/data/auth) + zip nível 9 — artefato único, completo, para download. «opencode (4).txt:13,5980»
ND-7654. As versões pulam números (V4→V5→V6→V7→V10→V12→V13…) — número V = milestone de conversa, não versão contínua; V8/V9/V11 não existem como arquivos. «Glob dos arquivos»
ND-7655. Cada arquivo de versão é o config INTEGRAL (não diff) — versionar = salvar o JSON completo com sufixo descritivo do patch (SEM-BAGUNCA, REASONING-OBJECT, COM-LIMITES…). «todos os arquivos V*»

### Bloco D — V4→V7: raciocínio e verificação

ND-7656. V4 SEM-BAGUNCA congela 348 models/43 providers como linha de base do versionamento FINAL. «V4 (jq)»
ND-7657. V5 REASONING-OBJECT: reasoning vira objeto de 3 campos — esforço (`effort`), interruptor (`enabled`) e exclusão do conteúdo do reasoning da resposta (`exclude:false` = reasoning visível). «V4→V5 (74 models migrados)»
ND-7658. V6 FULL-THINKING: effort sobe para `max` em toda a família kilo — o default da casa passa a ser raciocínio no nível máximo, nunca "high". «V5→V6 (44 rows)»
ND-7659. V7 VERIFICADO: menos é mais — chat_template_kwargs podado de 62 para 28 blocks (só quem suporta) e flags `true` espúrias removidas de 8 models kilo. «V6→V7 (jq + diff 16 rows)»
ND-7660. Verificação = comparar o config campo a campo com o comportamento real do provider; o verificado é sempre MENOR que o anterior. «V7 (348 models, chat template 28)»

### Bloco E — V10→V14: chat template, kimi-k3, maene, limites

ND-7661. V10 COM-CHAT-TEMPLATE: com o suporte verificado, expande enable_thinking para 101 models — poda (V7) e expansão (V10) são o mesmo ciclo: verificar → aplicar amplo. «V7→V10 (jq 28→101)»
ND-7662. opencod5e/opencode (7) = V10 alternativo já com plugin maene — o plugin novo foi testado em paralelo antes do merge oficial em V13. «opencod5e vs V10 (jq -cS diff = plugin)»
ND-7663. V12 KIMI-K3-CORRIGIDO: rollout do model novo kimi-k3 em 2 providers (nvidia + opencode zen) — model novo entra em 2 canais simultâneos (oficial + free). «V10→V12 (diff +2 rows)»
ND-7664. V13 MERGED-CORRIGIDO: merge de tudo — maene oficial, reasoning objeto universal (344), kimi-k3 em kilo/openrouter (4 providers no total), +2 models (352). «V12→V13 (diff; jq .plugin)»
ND-7665. V14 COM-LIMITES: a escada de variants low/medium/high/xhigh/max ganha limites de output reais (16384/32768/49152/65536/82000) — antes as variants eram `{"low":{}}` vazias (seleção sem efeito). «V13:9327-9333 vs V14:13689-13715»
ND-7666. A escada de variants é GLOBAL (mesmos 5 degraus, mesmos valores) em todos os models thinking — uniformidade facilita `--variant` em qualquer model. «V14/V32 (jq variants)»
ND-7667. Max = 82.000 tokens de output é o teto da casa para a escada padrão (o max 100.000 do kilo free é exceção por out do model ser 100.000). «V14; V18 (jq kilo max 100000)»

### Bloco F — V16→V20: auditoria, top_p, all-free, prune

ND-7668. V16 100-AUDITADO: auditoria remove `reasoning` (null) de 165 models que NÃO suportam raciocínio — declarar reasoning em model não-thinking é lixo de config. «V14→V16 (jq combos bool:null 138→165)»
ND-7669. A auditoria também remove o ID inexistente `opencode/moonshotai/kimi-k3` (o zen não tinha o model; ficou só nvidia/openrouter/kilo) — ID em provider errado = model fantasma. «V14 vs V16 (diff −1 row)»
ND-7670. V17 TOP-P-095: `top_p` padronizado em 0.95 (207 models saem de 1) — 0.95 é o padrão anti-degeneração da casa para todo model thinking. «V16→V17 (jq top_p dist)»
ND-7671. V18 ALL-FREE: expansão máxima (+139 models free: opencode zen 50, espelho opencodez 50, kilo +39) — cada model free entra em PAIR (zen + espelho opencodez) para A/B de rota. «V17→V18 (comm −/+ por provider)»
ND-7672. V18 introduz a variante `none` com `output:0` — intenção: variant sem thinking; efeito real: output zero (bug documentado, corrigido 2 versões depois). «V18 (jq kilo variants none output:0)»
ND-7673. V19 SOMENTE-MAX: remove a variante `none` dos 180 models e colapsa kilo free para `{"max":{}}` — se o model só faz max, só max declarado. «V18→V19 (jq none 180→0; kilo variants)»
ND-7674. V20 EXACT-IDS: poda cirúrgica −123 models — mantém os 8 zen free com ID exato, kilo volta a 47, opencodez mantido — o config "todos free" não sobrevive à prova de IDs. «V19→V20 (comm por provider)»
ND-7675. Os 8 sobreviventes do prune são o núcleo free oficial do CLI: deepseek-v4-flash-free, laguna-s-2.1-free, ling-3.0-flash-fin-free, meta/muse-spark-*-free, mimo-v2.5-free, nemotron-3-ultra-free, nemotron-3.5-lightning-free. «V20 (jq opencode models)»

### Bloco G — V21→V26: nomes, muse-spark, 60K, merge

ND-7676. V21 CORRECT-NAMES: nomes de UI copiam o estilo do catálogo oficial ("DeepSeek: DeepSeek V4 Flash (free)") — legibilidade primeiro. «V20→V21 (diff col name)»
ND-7677. V22 SIMPLE-NAMES: e depois simplifica ("DeepSeek V4 Flash Free") — o catálogo é referência, não camisa de força. «V21→V22»
ND-7678. V23 CORRECT-IDS: ID real do contributer model é `muse-spark-*`, não `meta-spark-*` — 4 IDs corrigidos em 2 providers. «V22→V23 (diff 8 rows)»
ND-7679. V24 MUSE-SPARK: `output:60` — bug clássico de unidade (60 vs 60k) introduzido ao editar à mão. «V23→V24 (jq out=60)»
ND-7680. V25 60K: correção para 60000 — teste de regressão de limites: uma unidade errada em 6 dígitos mata a resposta. «V24→V25»
ND-7681. V26 MERGED: provider espelho `opencodez` (8 models duplicados) removido — mirror desnecessário é dívida de manutenção. «V25→V26 (−8 rows)»
ND-7682. Muse-spark = o contributer model do próprio CLI (muse-spark-1.2/1.3-contributor-free) — o agente consumindo o model contributor do seu próprio gateway. «V23+ (jq muse-spark)»

### Bloco H — V27→V32: contexto real, no-thinking, fix-500, single-provider, GPT-6 Astra

ND-7683. V27 REAL-CONTEXT-60K: ctx declarado = ctx REAL aceito pelo endpoint (zen free: 131072; muse-spark: 1048576) — fim do contexto fictício. «V26→V27 (diff 16 rows)»
ND-7684. V28 NO-THINKING: todos os variants esvaziados para `{}` e `none:{}` entra como PRIMEIRO variant de TODOS os 359 models — o modo sem raciocínio vira seleção de primeira classe, e o variant não injeta mais limites (o limit do model manda). «V28:8660-8667 (jq combos)»
ND-7685. V28 é o oposto estrutural de V14: limites saem das variants e voltam ao model — a escada foi experimento, o default é variantes neutras + none. «V14 vs V28 (variants)»
ND-7686. V29 FIX-500: HTTP 500 do zen no muse-spark resolvido com provider paralelo `opencode-responses` (mesmos models, transport responses, effort max) — erro 5xx de transport não se "conserta" no model, troca-se a rota. «V28→V29 (+2 rows)»
ND-7687. V30 SINGLE-PROVIDER: após o fix, `opencode-responses` volta para dentro de `opencode` — patch reversível: provider temporário vive 1 versão. «V29→V30»
ND-7688. V31 GPT6-ASTRA-SIMPLE: provider `experientiallabs` + model `gpt-6-astra` entra MINIMAL (name/baseURL/npm, sem limit/options/variants) — flagship novo entra cru para smoke test. «V30→V31 (diff +provider)»
ND-7689. V32 GPT6-ASTRA-FIXED: gpt-6-astra completo — ctx 1.050.000, out 128.000, t1/top_p 0.95, effort max, variants low/medium/high/max — o config final da linhagem tem 43 providers/360 models. «V31→V32 (diff 1 row completa)»
ND-7690. O final de linhagem é STATIC: V32 = V31 + 1 model completo — nenhuma refatoração estrutural depois do V28; mudanças são sempre aditivas. «V31→V32»
ND-7691. Números legais do estado final: 360 models, 360/43 = 8,4 models por provider, 26 valores de contexto, 12 combos de sampling, 4 formatos de variants. «V32 (jq stats)»
ND-7692. O ctx 4.780.000 do model `devthink` é o maior do config (gateway agregador) e o ctx 10.000.000 da nvidia llama-4-scout é o maior de vendor externo. «V32 (jq ctx dist)»

### Bloco I — Kilo (app.kilo.ai)

ND-7693. Conversão para Kilo Code = swap de `$schema` para `https://app.kilo.ai/config.json` — o formato de provider/models é 100% compatível entre opencode e kilo (mesmo motor). «Kilo-CONVERTIDO vs CORRIGIDO (jq -cS diff)»
ND-7694. Kilo-CONVERTIDO mantém o plugin antigravity (base era pré-maene); Kilo-FINAL-V32 mantém maene — a conversão não toca em plugin, só em schema. «jq .plugin dos Kilo-*»
ND-7695. O gateway kilo aparece DUPLAMENTE no config (providers kilo e kilogateway com cortes de models diferentes) e o CLI do app kilo consome o mesmo config convertido — circularidade: o consumidor free é também provider free. «V32 (kilo/kilogateway)»
ND-7696. Conversões Kilo são snapshots, não forks: Kilo-CONVERTIDO (base 299) e Kilo-FINAL-V32 (final 360) — sem linha própria de versões kilo. «tabela de versões»

### Bloco J — Plugin de auth opencode-antigravity-auth (opencode (4).txt, conversa V1..V5 auth)

ND-7697. O plugin original NoeFabris/opencode-antigravity-auth autenticava no Google Antigravity via OAuth e servia models gemini/claude "antigravity-*" sem chave — mas foi banido (Google reverteu) e quebrou com models 2026 por listas de models e versões fixas. «opencode (4).txt:13,287,303»
ND-7698. Plugin opencode = pacote npm com `@opencode-ai/plugin`, hooks `auth`, `config`, `tool.execute.before` e interceptor de fetch — o plugin intercepta as chamadas do provider google e reescreve para o endpoint Antigravity. «opencode (4).txt:296,360»
ND-7699. API Antigravity 2026: endpoint cloudcode-pa.googleapis.com com fallbacks daily/autopush e SANDBOX; OAuth client ID real descoberto (1071006060591-…); projeto de fallback rising-fact-p41fc. «opencode (4).txt:309,322,5999»
ND-7700. Quota dual: Antigravity e Gemini CLI têm quotas separadas no mesmo Google — o plugin checa as duas (dual quota) e a opção `cli_first` decide a ordem. «opencode (4).txt:309,360»
ND-7701. Concorrência mapeada: shekohex/opencode-google-antigravity-auth (fallback de endpoint, seleção sticky de conta, google_search tool, rotação de contas, tratamento de models novos), junglemyna, expiren — estudar 4 forks antes de escrever o próprio. «opencode (4).txt:290,306»
ND-7702. 9router (cuongdev/fdkgenie): proxy universal com prefix routing gc/ cc/ kr/ vertex/, model matrix, auto fallback, 40+ providers — padrão de prefixo por backend. «opencode (4).txt:6005»
ND-7703. OmniRoute (diegosouzapw): provider standalone `agy` reusando o MESMO client_id + endpoint daily-cloudcode-pa; fix: refresh do Gemini CLI Project ID via loadCodeAssist a cada 30s para evitar 403 "has not been used in project" ban permanente. «opencode (4).txt:6007-6009»
ND-7704. Gemini CLI (@google/gemini-cli) como referência de protocolo: loadCodeAssist com metadata {ideType, platform, pluginType}, onboardUser FREE com polling LRO de operations, cache SHA256 TTL 1h, header X-Goog-Api-Client `antigravity/{ver} gl-node/{node} gccl/1.0.0`. «opencode (4).txt:6011»
ND-7705. Bug marco-temporal 15/01/2026: IAM_PERMISSION_DENIED em generateChat no projeto rising-fact-p41fc (Google revogou/ban) — todo o bypass de Project ID nasce desse evento. «opencode (4).txt:5999,6001»
ND-7706. Bypass Project ID dual: agir igual Antigravity (ideType ANTIGRAVITY) e igual Gemini CLI (ideType GEMINI) → onboardUser FREE LRO → fallback rising-fact-p41fc com warning explícito. «opencode (4).txt:6017»
ND-7707. User-Agent respeitando o cliente real: `antigravity/1.19.2` + fingerprints do próprio Antigravity; alinhar fingerprint removendo X-Goog-QuotaUser e X-Client-Device-Id. «opencode (4).txt:5980,6001»
ND-7708. OAuth PKCE completo: verifier 128 chars + challenge S256 + state CSRF; callback server em porta ALEATÓRIA locked 127.0.0.1 (nunca 0.0.0.0); browser para auth.google.com; troca em token.googleapis.com + userInfo. «opencode (4).txt:6013-6015»
ND-7709. Storage de contas v3: `~/.config/opencode/antigravity-accounts.json` com `version:3`, `accounts[]`, `activeIndex`, `activeIndexByFamily {claude, gemini}`; cada conta: email, refreshToken, accessToken, expiry=now+3600s, createdAt, addedAt, lastUsed, rateLimitResetTimes{}, projectId, managedProjectId, remaining, limit. «opencode (4).txt:6015,5999»
ND-7710. Escrita atômica sempre: tmp + rename, chmod 600 (dir 0700), lock file com detecção de stale lock — mesmo sem dependências externas (zod-like validation com builtins do Node). «opencode (4).txt:328,6017»
ND-7711. Rotação de contas "Robin Hood": getNext filtra disabled, quotaExhaustedUntil, softQuotaUntil e rateLimitResetTimes; soft quota dispara em 90% do limite. «opencode (4).txt:6015,6001»
ND-7712. refreshIfNeeded com double-checked locking — refresh de token concorrente só uma vez. «opencode (4).txt:6017»
ND-7713. Transformação de request: cleanSchema (sanitização p/ protobuf estrito do Gemini: strip x-goog-user-project, nomes de função válidos, correção de parâmetros), sanitizeToolName, mapBudget (thinkingLevel ↔ thinkingBudget), claudeToolHardening. «opencode (4).txt:334,6019»
ND-7714. Mapeamento de models com cadeia de fallback de ID: antigravity-gemini-3-flash → gemini-3-flash-preview → gemini-3-flash-agent; antigravity-claude-opus-4-6-thinking direto — rótulos antigravity-* mapeados para IDs reais por versão. «opencode (4).txt:299,334»
ND-7715. Image generation embutida: isImageModel strip tools/imageConfig, OPENCODE_IMAGE_ASPECT_RATIO, safety BLOCK_NONE. «opencode (4).txt:6019»
ND-7716. Thinking signature caching com cache LRU interno por assinatura — assinaturas de thinking do Gemini são reutilizadas, não recalculadas. «opencode (4).txt:334,6001»
ND-7717. google_search grounding como tool opcional do plugin (herdada do fork shekohex). «opencode (4).txt:306,360»
ND-7718. Version dinâmica: cadeia auto-updater remoto → scrape do changelog → hardcoded 1.15.8/1.18.3, cache 24h, lazy getters propagando para headers/fingerprints/UA — versão do cliente NUNCA hardcoded única. «opencode (4).txt:344»
ND-7719. Debug system: logs em ~/.config/opencode/antigravity-logs/ com rotação por tamanho e limpeza por idade, painel TUI com buffer circular, níveis via OPENCODE_ANTIGRAVITY_DEBUG(/_TUI), redação de segredos nos logs. «opencode (4).txt:356»
ND-7720. CLI de gestão (cli.ts) com node:readline/promises e cores ANSI, zero deps: menu interativo + comandos login/add/list/enable/disable/set-active/remove + checagem de quota + configuração de catálogo ALL_MODELS_2026. «opencode (4).txt:363»
ND-7721. Descoberta de project ID (project.ts): loadCodeAssist via cloudcode-pa → validação com fetchAvailableModels → onboarding automático → fallback rising-fact-p41fc com aviso; timeout 10s por request, retry PROD/DAILY/SANDBOX, cache em memória. «opencode (4).txt:369»
ND-7722. Empacotamento npm: package.json v2.0.0 (main plugin.ts, bin cli.ts, peerDependencies, files, engines), tsconfig ES2022/ESNext/bundler/strict, index.ts re-exportando tudo com default export — pronto para `npm publish --access public` como `opencode-antigravity-auth-next`. «opencode (4).txt:372-389,5982»
ND-7723. Artefato V5 auth: pasta blindada /mnt/data/auth, zip nível 9, 19 arquivos 90KB, incluindo FLUXOGRAMA.md e antigravity-schema.json — documentação de fluxo junto do código. «opencode (4).txt:6095-6107»
ND-7724. Fluxograma do fluxo final V5 (login → callback local → accounts v3 → plugin fetch → robin hood → resolveProjectId dual → transformRequest) documentado como contrato verificável. «opencode (4).txt:6013-6019»
ND-7725. `opencode auth login/list` + `opencode run --model=google/antigravity-gemini-3.7-flash --variant=high` = ciclo de teste manual do plugin — smoke test por CLI antes de publicar. «opencode (4).txt:6105,5984»
ND-7726. Comandos auxiliares validam o storage: `cat antigravity-accounts.json` confere version 3, addedAt, createdAt, expiry, lastUsed, rateLimitResetTimes, activeIndex — persistência inspecionável. «opencode (4).txt:6103»
ND-7727. Seqüência de releases do plugin: V4 "definitiva" (todas as features + robin hood + dual bypass) → V5 (pesquisas em 9router/omnirouter/gemini-cli + accounts v3 validado) — cada release auth = re-auditoria contra os 3 concorrentes. «opencode (4).txt:5988-5996»
ND-7728. Dashboard de terceiros (OmerFarukOruc/antigravity-dashboard) catalogado como referência de monitoração de quota. «opencode (4).txt:6256»

### Bloco K — Engenharia de config (processo das 35 versões)

ND-7729. Versionar por sufixo de PATCH: `FINAL-V<n>-<o-que-mudou>` — o nome do arquivo é o changelog. «todos os arquivos»
ND-7730. Um patch por versão: V17 só top_p, V21 só names, V23 só IDs, V24/V25 um limite — patches atômicos facilitam bissecção de regressão. «tabela de versões»
ND-7731. Diferenciar versões por diff canônico (jq -cS) em vez de olho humano: a versão V32↔Kilo-V32 difere em 1 linha; opencode.txt↔CORRIGIDO em 0 — sem diff, duplicata passa despercebida. «método desta onda»
ND-7732. Duplicatas de download ((2).txt etc.) são whitespace/CR-iguais — dedup por diff normalizado ANTES de ler; 22 dos 62 arquivos desta onda eram duplicatas. «md5 groups»
ND-7733. Digest estrutural antes de leitura integral: providers/models/limits/options via jq respondem 90% das perguntas em <1% das linhas (config de 26k linhas = 1 digest de 360 rows). «método desta onda»
ND-7734. Prova de imutabilidade por checkpoints: .provider.devthink idêntico em 7 pontos da linhagem — o que não pode mudar é verificado periodicamente. «jq devthink em 7 versões»
ND-7735. Config declarativo > código: nada de scripts gerando o JSON — a "lógica parametrizada nunca hardcoded" do projeto vive nos limites/options declarados por model. «62 configs»
ND-7736. API keys vivem INLINE no config por provider (tp-…, nvapi-…) — rotação = editar o config; pooling = duplicar o provider com outra key. «V32 (jq apiKey mimo)»
ND-7737. Provider sem auth (devthink na sandbox) usa o cookie/SSO do ambiente — nunca colocar key estática onde o ambiente já autentica. «jq devthink keys:0»
ND-7738. Réplica de provider para domínio alternativo (mimo-14 railway, mimo-8 gitlawb) = failover de DNS do provider, não de model. «V32 jq»
ND-7739. Testes A/B por par de providers espelhos são temporários: criados em V18, removidos em V20/V26 — espelho sem diferença real não sobrevive à auditoria. «V18→V20→V26»
ND-7740. Model stealth (`stealth/ox-alpha`) consumido por 3 vendors (commandcode, venice, openrouter) — models stealth entram por múltiplos canais para não depender de vendor único. «V32 jq»
ND-7741. Catálogo de modelos 2026 embarcado no plugin (ALL_MODELS_2026 em constants.ts) com limites ctx/out/variants e mapeamentos antigravity→real — o config e o plugin compartilham a mesma fonte de verdade de catálogo. «opencode (4).txt:299,322,363»
ND-7742. Erro de transport (500) → novo transport; erro de permissão (IAM) → bypass de projeto; erro de catálogo (403 model) → correção de ID — cada sintoma de API tem um tipo de patch correspondente. «V23/V29; opencode (4).txt:5999»
ND-7743. A cada versão FINAL, `jq` valida o JSON inteiro antes de arquivar — config inválido não entra na linhagem (todas as 35 versões são JSON válido, exceto a transcrição e o lixo de 4 linhas). «jq -e em todos»
ND-7744. Snapshots nomeados por MARCA (60K, MERGED, FIXED) viram termos do vocabulário da casa — a nomenclatura de versão documentada no próprio nome do arquivo. «arquivos V25/V26/V32»
ND-7745. A linhagem inteira (V4..V32) roda sobre @ai-sdk/openai-compatible — nenhum provider exigiu SDK dedicado; onde não coube (google/antigravity), a solução foi PLUGIN, não SDK novo. «62 configs (jq npm)»
ND-7746. 16 chaves do mesmo vendor (mimo) ≈ 16× quota — a única forma real de escalar free tier é multiplicar identidades, e o config formaliza isso como providers réplicas. «V32 (mimo-1..16)»
ND-7747. Contexto agregado do model `devthink` (4,78M) = soma/máscara dos canais atrás do gateway — o model próprio declara o total que o gateway entrega, não o de um vendor. «devthink ctx 4780000; contexto.md OPR-0023»
ND-7748. Nunca misturar numeração de versões de CONFIG (V4..V32) com numeração de AUTH (V1..V5): são linhas de release paralelas — config V13≠auth V13 (auth para em V5). «opencode (4).txt vs configs»

### Bloco L — Padrões de concorrentes catalogados (insumo devthink CLI)

ND-7749. Prefix routing por backend (gc/ cc/ kr/ vertex/) do 9router = roteamento por prefixo de URL no gateway unificado — adotável no devthink CLI para multi-backend. «opencode (4).txt:6005»
ND-7750. Model matrix explícita (gc/gemini-3-flash-preview → gc/gemini-2.5-pro) como tabela de roteamento de fallback. «opencode (4).txt:6005»
ND-7751. Refresh periódico de Project ID (30s) via loadCodeAssist para prevenir ban 403 — keepalive de sessão de projeto é requisito de gateway. «opencode (4).txt:6007»
ND-7752. Cache SHA256 TTL 1h do Gemini CLI para respostas de metadata — cache de metadata é sempre hash+TTL. «opencode (4).txt:6011»
ND-7753. Onboarding LRO (long-running operation) com polling: onboardUser FREE retorna operation a ser pollada — integração com APIs Google segue esse padrão. «opencode (4).txt:6011»
ND-7754. Sticky account selection (shekohex): mesma conta enquanto quota sã; troca só em exaustão — round-robin puro desperdiça janelas de quota. «opencode (4).txt:306»
ND-7755. Auto fallback de endpoint em cadeia (PROD→DAILY→SANDBOX / remote→scrape→hardcoded): toda dependência externa tem 3 níveis de fallback. «opencode (4).txt:344,369»
ND-7756. Sufixo `:free` e prefixo de vendor no ID (`vendor/model:free`) = convenção de catálogo dos agregadores (openrouter/kilo) — o config devthink herda a convenção para interoperar. «V32 (kilo/openrouter IDs)»

### Bloco B2 — Catálogo de models 2026 (detalhamento verificado)

ND-7757. Família moonshot no nvidia: kimi-k2 (131072/65536), kimi-k2-0905, kimi-k2-thinking, kimi-k2.5, kimi-k2.6 (262144/262144) e kimi-k3 (1048576/131072) — 6 gerações coexistindo no catálogo. «V32 (jq nvidia kimi-*)»
ND-7758. deepseek-v4 flash e pro (1M/65536) no nvidia + deepseek-v4-flash:free no kilo/kilogateway/opencode/openrouter — v4 distribuído em 4+ canais. «V32 (jq)»
ND-7759. Família Nemotron 3 da nvidia: nano-30b-a3b (out 228000), super-120b-a12b (out 262144), ultra-550b-a55b, nano-omni-30b-a3b-reasoning (image input) e 3.5-lightning — output não-padrão por tamanho. «V32 (jq)»
ND-7760. Família qwen no nvidia: qwen-plus, qwen3-coder, qwen3-coder-480b-a35b-instruct, qwen3-coder-flash, qwen3-coder-plus, qwen3.5-flash-02-23, qwen3.5-plus-02-15, qwen3.6-flash, qwen3.6-plus — coders com out 262000. «V32 (jq)»
ND-7761. llama-4 maverick e scout: scout com ctx 10.000.000 (maior de vendor externo) e out 16384 — contexto recorde com output curto. «V32 (jq)»
ND-7762. writer/palmyra-x5 com ctx 1.040.000 — vendor enterprise no catálogo nvidia. «V32 (jq)»
ND-7763. kilo free inclui openai/gpt-oss-120b e gpt-oss-20b — os models abertos da OpenAI servidos pelo gateway kilo. «V21/V22 diff»
ND-7764. kilo free inclui nousresearch/hermes-3-llama-3.1-405b — comunidade Nous Research no free tier. «V21 diff»
ND-7765. Canário nex-agi/nex-n2-pro:free duplicado em next-kilo E next-openrouter — model novo testado em 2 gateways paralelos antes do catálogo principal. «V32 (jq next-*)»
ND-7766. arcee-ai/trinity-large-thinking:free — tier thinking da Arcee no kilo. «V21/V22 diff»
ND-7767. tencent/hy3:free e baidu/cobuddy:free — vendors chineses adicionais no kilo free. «V21/V22 diff»
ND-7768. stepfun/step-3.7-flash em 3 providers (kilo free, cline, nvidia stepfun-ai) com out diferente por canal (256000/32000/262000). «V32; V21 diff»
ND-7769. google/lyria-3-clip-preview e lyria-3-pro-preview (ctx 32768, out 8192, sem reasoning) — modelos de MÚSICA do Google no config (caso de uso não-código). «V4→V5 diff»
ND-7770. nvidia/nemotron-3.5-content-safety:free (ctx 128000, out 8192, sem reasoning) — modelo de moderação de conteúdo como provider normal. «V4→V5 diff»
ND-7771. kilo-auto/free (204800/131072) — model "auto" do próprio kilo (roteamento automático) consumido como model comum. «V4→V5 diff»
ND-7772. liquid/lfm-2.5 1.2B instruct/thinking e 2.6B — modelos nano (<3B) no catálogo free. «V21/V22 diff»
ND-7773. google/gemma-4-26b-a4b-it e 31b-it free — gemmas abertos no kilo. «V21/V22 diff»
ND-7774. thinkingmachines/inkling e inkling-small (1M/262144) — startup Thinking Machines no openrouter/kilo. «V32 (jq)»
ND-7775. Família poolside laguna (m.1, s-2.1, xs.2/xs-2.1) — especialista de código em 3 tamanhos. «V21/V22 diff»
ND-7776. meituan/longcat-2.0 em free e pago + dots-studio/dots-3-note-preview — catálogo long-context chinês completo. «V21/V22 diff»

### Bloco B3 — Formatos e convenções de ID/limites

ND-7777. 137 dos 360 models finais têm sufixo `:free`/`-free` — free é marcado NO ID, nunca em flag lateral. «V32 (jq count)»
ND-7778. openrouter/free = model roteador próprio ("Free", 1M/131072) que delega para o pool free do openrouter — 1 ID para N models. «V32 (jq)»
ND-7779. opencodez tinha o MESMO baseURL do opencode (opencode.ai/zen/v1) — espelho puro (mesmo endpoint, 2 entradas) e por isso removido em V26. «V25 (jq)»
ND-7780. tokenrouter serve kimi-k3-free; zeroeval e llm-stats servem glm-5 — agregadores de nicho entram com 1 model cada. «V32 (jq)»
ND-7781. Models do ollama usam sufixo `:cloud` (glm-5:cloud, minimax-m2.7:cloud) — convenção do ollama cloud no provider local. «V32 (jq)»
ND-7782. Prefixo de família no ID como namespacing: `coding-*`, `crush-*`, `daocloud-*` (aihubmix) — o prefixo indica o produto de origem. «V32 (jq aihubmix)»
ND-7783. Dois formatos de ID coexistem (vendor/model:free e curto tipo muse-spark-1.2-contributor-free) conforme o provider — o config mantém o ID oficial do provider, sempre. «V32; V22→V23»
ND-7784. Outliers de ctx com dígitos "quebrados" (131100, 202800, 262800, 4780000, 1040000) vêm do catálogo do vendor — copiar o valor oficial exato, não arredondar. «V32 (jq ctx dist)»
ND-7785. Out 65535 (gemini) vs 65536 (demais) — diferença de 1 token por convenção do vendor; nunca "normalizar" limites entre vendors. «V32 (jq google)»
ND-7786. Model sem `limit` declarado (zen free no estado final) = confia no default do CLI; model com limit = override explícito — os dois estados são legítimos. «V32 (jq opencode)»

### Bloco J2 — Auth antigravity: detalhes de implementação (opencode (4).txt)

ND-7787. Metodologia da reconstrução do plugin: máximo 5 ondas × 16 subagentes, pasta isolada com nome curto e blindado, artefato final zipado nível 9 — orçamento de agentes limitado por tarefa. «opencode (4).txt:13»
ND-7788. Requisito do dono: NADA de baseURL localhost/v1 — o plugin novo age IGUAL ao original (interceptor de fetch + endpoints reais do Google). «opencode (4).txt:13»
ND-7789. Histórico do plugin original: funcionava → Google baniu usuários → voltou atrás → parou de funcionar com models novos — plugin free de vendor é instável por ToS, não por bug. «opencode (4).txt:13»
ND-7790. Ondas de pesquisa antes de codar: analisar repo NoeFabris, concorrentes (shekohex/junglemyna/expiren), API Antigravity 2026, Plugin API do OpenCode e models 2026 — 5 frentes paralelas. «opencode (4).txt:286-315»
ND-7791. constants.ts concentra headers obrigatórios, mapeamentos de models 2026, defaults e memória interna — constantes de vendor em 1 arquivo. «opencode (4).txt:322»
ND-7792. storage.ts gerencia DOIS arquivos: accounts.json (multi-contas) e antigravity.json (config legacy/ponteiro ativo) — compatibilidade com o formato antigo. «opencode (4).txt:328»
ND-7793. Campos da conta: email, refreshToken, projectId, enabled/disabled, quota metadata — enable/disable por conta é cidadão de primeira classe. «opencode (4).txt:328»
ND-7794. transform.ts: variantes de thinking low/medium/high/minimal/max — o set antigravity inclui `minimal` (inexistente no set de variants do config). «opencode (4).txt:334»
ND-7795. transform.ts mantém 2 caches LRU internas: assinaturas de thinking e resolução de modelos. «opencode (4).txt:334»
ND-7796. version.ts: remoto → scrape de changelog → hardcoded 1.15.8/1.18.3, cache 24h, lazy getters propagando para headers/fingerprints/UA. «opencode (4).txt:344»
ND-7797. debug.ts: quiet_mode que suprime toasts — modo silencioso é feature de plugin. «opencode (4).txt:356»
ND-7798. plugin.ts: loader de credenciais do provider google + OAuth PKCE porta aleatória + interceptor com rotação + quota check + auto-recovery + version dinâmica + logging — 1 arquivo principal. «opencode (4).txt:360»
ND-7799. Toggles de config do plugin: cli_first (preferir quota Gemini CLI), pid_offset_enabled, google_search tool opcional — features como switches, não builds separados. «opencode (4).txt:360»
ND-7800. cli.ts: login OAuth, gestão multi-conta (add/list/enable/disable/set-active/remove), checagem de quotas, catálogo ALL_MODELS_2026 e ajuste de (strategy, thresholds) — CLI de operação completo. «opencode (4).txt:363»
ND-7801. project.ts: descoberta de project ID com validação fetchAvailableModels e onboarding automático; projectId salvo na metadata da conta. «opencode (4).txt:369»
ND-7802. package.json do plugin: name/version 2.0.0/main/types/bin/peerDependencies/scripts/keywords/license/author/repository/files/engines — envelope npm completo. «opencode (4).txt:372»
ND-7803. tsconfig do plugin: ES2022, ESNext, moduleResolution bundler, strict, declaration, sourceMap, outDir dist — alvo moderno sem build custom. «opencode (4).txt:375»
ND-7804. index.ts re-exporta tudo com default export — convenção de entrypoint único do plugin. «opencode (4).txt:389»
ND-7805. rateLimitResetTimes por FAMÍLIA de model ({claude: ts, gemini-antigravity: ts}) — quota é conta×família, não só conta. «opencode (4).txt:5999»
ND-7806. managedProjectId separado de projectId — projeto gerenciado pelo Google vs projeto escolhido são campos distintos. «opencode (4).txt:5999»
ND-7807. Checklist de paridade com o plugin original (11 features): multi-account, dual quota, thinking signature caching, google search grounding, auto-recovery, image generation, schema cleaner, version dynamic chain, soft quota 90%, login mode selection, fingerprint align. «opencode (4).txt:6001»
ND-7808. Validação por release do auth: arquivo de contas no local certo, sync, esquema antigravity, user-agent respeitando, datas de criação/expiração/token escritas. «opencode (4).txt:5996»
ND-7809. Critério de aceite do auth V4: "todas as features adicionadas, não escolhidas" + dual bypass resolvido + robin hood + todos models + lowercase + sem discourse + skill à risca — paridade TOTAL, não seleção. «opencode (4).txt:5988»
ND-7810. `opencode-antigravity-auth-next@4.0.0` publicado com `npm publish --access public` direto da pasta blindada. «opencode (4).txt:5982»

### Bloco K2 — Engenharia de config (extra)

ND-7811. Curva da linhagem: 299→348 (construção) →352 (estabilização) →490 (expansão free) →367→360 (consolidação) — expandir e podar são fases separadas e explícitas. «tabela de versões»
ND-7812. Rollout sequencial de model novo: entra em 2 providers (V12), depois +2 (V13), depois perde o ID inválido (V16) — estágios com auditoria entre eles. «V12→V13→V16»
ND-7813. Revisão de limites campo a campo por diff antes de cada FINAL — o bug 60 (V24) foi pego por diff unitário. «V23→V25»
ND-7814. Limites em tokens SEMPRE em valor completo (60000, não "60k") — o bug V24 nasceu de abreviação mental. «V24/V25»
ND-7815. Espelho A/B free (zen+opencodez) durou 8 versões (V18-V25) — espelho de teste tem prazo de vida; a auditoria remove. «V18→V26»
ND-7816. Muse-spark usa sufixo `-contributor` — models contributor = oferecidos por contribuidores do gateway; consumir o próprio contributer é dogfooding. «V23+ (jq)»
ND-7817. O mesmo model em canais diferentes tem OUT diferente (glm-5.2: 32000 no zai vs 131000 nos demais) — limites são do CANAL, não só do model. «V32 (jq)»
ND-7818. Variants também divergem por canal (xhigh presente/ausente) — a escada é adaptada por provider dentro do padrão global. «V32 (jq variants)»
ND-7819. baseURL em domínio de sandbox/preview (fefefef.space-z.ai/v3 do gmi) é legítimo — o que importa é o contrato OpenAI-compatible, não o domínio. «V32 (jq gmi)»
ND-7820. experientiallabs usa `/V1` maiúsculo — copiar o path EXATAMENTE como o vendor publica, inclusive capitalização. «V32 (jq)»
ND-7821. Plugin (auth) e config (providers) resolvem problemas diferentes e coexistem: plugin = transport/auth; config = catálogo/limites — nunca resolver auth no config. «opencode (4).txt + configs»
ND-7822. A linhagem é reproduzível como cadeia de patches V(n-1)→Vn — reprodutibilidade por diff é critério de arquivo. «método desta onda»
ND-7823. Snapshots duplicados de download ((2).txt) ficam no acervo mas nunca são fonte de verdade — a fonte é o arquivo primário. «dedup desta onda»
ND-7824. Conversas de trabalho são fonte de primeira classe para ARQUITETURA (plugin/auth); configs são fonte para catálogo — tipos de fonte para partes distintas. «opencode (4).txt vs configs»
ND-7825. Manter ambos os schemas (opencode.ai e app.kilo.ai) no acervo — compatibilidade com os 2 motores via swap de 1 linha. «Kilo-*»
ND-7826. Nenhuma das 35 versões tem chave `agent`/`mcp`/`keybinds` — o config é 100% catálogo de providers; agentes/MCP ficam para o app. «jq keys 35 configs»

### Bloco M — Modalidades e janelas

ND-7827. Image input declarado por model: mimo-v2.5-pro (16 réplicas), ox-alpha (venice/commandcode), minimax-m3, kimi-k2.6, step-3.7-flash, deepseek-v4 flash/pro, gemma-3-12b-it, nemotron nano omni — visão só onde o vendor confirma. «V32 (jq image models)»
ND-7828. mimo-v2-omni (out 90000) vs mimo-v2-pro (out 131100) — família omni separada da pro no catálogo. «V32 (jq xiaomi)»
ND-7829. Output mínimo do catálogo: 8192 (lyria, content-safety); máximo: 524300 (fusion) — janela de out varia 64×. «V32; V4→V5 diff»
ND-7830. Contextos mínimos: 4096 (2 models) e 8192 (5 models) — modelos mini ficam no config para tarefas baratas. «V32 (jq ctx dist)»
ND-7831. Invariant: out ≤ ctx em TODOS os 360 models — sanidade do config verificável por jq. «V32 (jq ctx/out)»
ND-7832. ctx 131072 (128k) com 83 models é a moda do catálogo — a janela clássica domina. «V32»
ND-7833. Três camadas de janela dominam 2/3 do catálogo: 128k (83), 256k (71), 1M (65). «V32»
ND-7834. GLM-5/5.1/5.2 e coding-glm-* servidos por 9+ canais (zai, babel, cline, megallm, zenmux, gmi, fusion, nvidia, aihubmix, kilo) — redundância máxima no modelo âncora da casa. «V32»
ND-7835. minimax m2→m2.1→m2.5→m2.7→m3: 5 gerações coexistindo no free — versões antigas permanecem até o vendor remover. «V32 (jq)»
ND-7836. qwen3.6-plus-preview vs qwen3.6-plus: IDs de preview separados do estável — nunca sobrescrever o estável com o preview. «V32 (jq)»
ND-7837. gpt-oss-20b/120b presentes no kilo free — o par 20b/120b formalizado como par de teste do gateway (casa usa gpt-oss-20b nos testes OPR-0030). «V21 diff; OPR-0030»
ND-7838. nemotron-3-nano-omni-30b-a3b-reasoning:free — sufixo de capacidade (omni+reasoning) no ID. «V21 diff»
ND-7839. gemini-3.1-pro-preview-customtools — variante com tools custom exposta como model distinto. «V32 (jq google)»
ND-7840. antigravity-claude-opus-4-6-thinking (out 128000) — Claude via Antigravity com thinking nativo; canal google entrega claude+gemini no mesmo provider. «V32 (jq)»
ND-7841. `modalities.output` = ["text"] em TODO o catálogo — saída não-texto (imagem/áudio) não é declarada no config; imagem via image generation do plugin. «V32 (jq modalities)»
ND-7842. deepseek-v4-flash = workhorse da casa: ctx 1M, out 65536, free em 4 canais. «V32»
ND-7843. kilo free padroniza out=100000 nos 47 models — teto uniforme simplifica variants (max=100000 na V18). «V32; V18»
ND-7844. step-3.5-flash-free (aihubmix) e step-3.7-flash — duas gerações StepFun coexistindo. «V32; V21 diff»
ND-7845. qwen3-next-80b-a3b-instruct:free — arquitetura MoE "next" (a3b) no free tier. «V21 diff»
ND-7846. meituan/longcat-2.0 em dois tiers simultâneos (pago e :free) com mesmos 1M/131072 — mesmo model, duas entradas de preço. «V4→V5 diff»

### Bloco N — Lições de operação e acervo

ND-7847. Config com chaves inline é SEGREDO — nunca commitar o opencode.json real; as cópias em neodocs são acervo histórico. «62 configs (apiKeys inline)»
ND-7848. O provider `devthink` do config e os providers devthink-v1/v3/v4/v5 do gateway (OPR-0017/0022/0030) são o mesmo padrão de integração em dois níveis — config de CLI e testes de API compartilham o gateway. «devthink provider + regras.md PARTE 4»
ND-7849. Nomenclatura FINAL-V<n> só depois dos estágios DEFINITIVO→CORRIGIDO→VALIDADO — 3 estágios de maturidade antes de "FINAL". «linhagem»
ND-7850. Números V faltantes (V8, V9, V11) = milestones de conversa sem config salvo — milestone sem artefato não vira versão. «glob dos arquivos»
ND-7851. O acervo mantém a linhagem INTEGRA (35 configs únicos), não só a final — histórico de decisões é parte do produto. «62 arquivos»
ND-7852. Teste A/B por espelho exige anotar o papel de cada entrada (opencodez = descartável) — sem isso o espelho vira ambiguidade. «V18-V26»
ND-7853. Precedência de correção de IDs: catálogo oficial do vendor > comportamento real do endpoint > nome de UI. «V20-V23»
ND-7854. Nenhuma versão removeu provider com models exclusivos sem migrá-los — remoções (opencodez, opencode-responses) só de catálogo já existente em outro provider. «V26, V30»
ND-7855. O provider default (zen) mantém models SEM overrides no estado final — o config só sobrescreve onde o default falha. «V32 (jq opencode)»
ND-7856. A linhagem V4..V32 evidencia o método que o devthink CLI herda: config declarativo iterativo, 1 capability nova = 1 patch versionado + 1 feature catalogada. «linhagem inteira»

---


## FASE 7d — designe.txt (UI Patterns Masterclass) + CSS blobs Neo DevThink + DESIGN/theme + Skill-Design-Universal V23/24/25 (fonte: neodocs-txt + neodevthink/*.css)

250 regras (ND-7901..8150; 8151..8200 reservado): leis INLINE-SLOT/GHOST-WORLD/BREAK-FAMILY,
system prompts Gemini UI/UX, temas Neo DevThink, materiais --intensity, FAUN (V25 hierárquica).
+ 30 novas specs CSS (SPEC 31..60) — não sobrepõem às 30 da Fase 5.


### Grupo T — designe.txt: UI Patterns Masterclass (estrutura e catálogos) «designe.txt»

ND-7901. Skill universal de design se organiza por ESTILO→TEMA (nunca por imagem): cada estilo documenta tema/mood, paleta, tipografia, layout, componentes, efeitos, micro/macro animações, transições e receita CSS. «designe.txt:388-420»
ND-7902. Características devem ser UNIVERSAIS: unir o que se repete entre referências e mesclar duplicatas numa única skill, sem duplicados. «designe.txt:388»
ND-7903. Todo padrão entra em code box, separado por micro-animações, transições, efeitos, cores e disposições. «designe.txt:408»
ND-7904. Batch tracking com marcador de proveniência ([N2], [N3]…) permite acumular 206 imagens sem perder a origem de cada efeito. «designe.txt:596-603»
ND-7905. DNA transversal do set premium: pill-first (radius 9999), radius generoso 20-32px em cards, 90% neutro + 10% acento único, hierarquia de texto em 3 níveis, bento grid para features, prova A/B lado a lado, sombras difusas 0 8px 30px rgba(0,0,0,.06-.10) nunca duras. «designe.txt:238-249»
ND-7906. Micro-interações: 120-220ms · entradas: 400-600ms · loops ambientes: 8-30s · sempre ease-out (nunca linear em UI micro). «designe.txt:372»
ND-7907. Tensões visuais são inventário de primeira classe (13+ catalogadas): Neutro×Acento, Rígido×Orgânico, Escuro×Incandescente, Ordem×Ruído, Cheio×Vazio, Estático×Lúdico, Mesmo esqueleto×Pele diferente, Escala×Rotação, Técnico×Lúdico, Natureza×Máquina, Luz×Tempestade, Ordem×Aurora, Peso×Ar. «designe.txt:374-383,353-361»
ND-7908. Receita por tokens dos estilos light: --card #fff, --radius 24px, --pill 9999px, --accent-gradient mesh, texto 3 níveis #0F172A/#64748B/#CBD5E1, seção y 96-128px, container 1120-1280px, --ease cubic-bezier(.2,.8,.2,1). «designe.txt:384-400»
ND-7909. Padrão PAGE-IN-PAGE: conteúdo dentro de container-card flutuante radius 36-48 (recorrente em 5 referências) — o "floating app window" hero. «designe.txt:286-288,341-343»
ND-7910. Padrão TYPE-SANDWICH: produto/foto 3D sobreposto ao headline gigante full-bleed; TYPE-CROSSING: headline cruza a borda de outro painel. «designe.txt:289-290»
ND-7911. Padrão AURORA COLUMNS: faixas verticais de gradiente blur(40px)+ com blend screen, largura 8-14vw; drift vertical loop 12-18s. «designe.txt:291,13-21 de batch02»
ND-7912. Padrão BLUEPRINT/REDLINE: grid técnico dashed + cotas + corner brackets sobre o visual; desenha no load via dashoffset; fade radial nas bordas (mask). «designe.txt:294,683-688»
ND-7913. Padrões de efeito catalogados [N2]: pixel-mosaic 24px, 3D blob metálico/vítreo como hero, gravura hatching (linhas verticais 1px/6px), circuit-trace animado, doodle annotations (script cursivo + setas SVG), dashed echo (contorno tracejado replicando o CTA), fan strip rot -8°..+8°, vertical text chip (writing-mode vertical-rl), stacked headline palavra-por-linha, glow duplo branco em CTA claro sobre dark, stats gigantes clamp(64px,8vw,96px). «designe.txt:277-306»
ND-7914. Transições de cena [N2]: cross-fade branco↔preto via gradiente longo (alternativa sem corte ao section break); alternância seções PRETO↔BRANCO como ritmo; theme inversion recolore a página em 300ms; snap carousel com scale no card central; parallax de camadas em velocidades distintas. «designe.txt:308-318»
ND-7915. Micro-animações [N2]: mosaic strobe, blueprint draw, blob float 8-12s yoyo, aurora drift, connector pulse (pulso viajando chip→card), glow pulse 3-4s, un-tilt hover (card inclinado endireita), circuit trace anim, orb breathe scale 1→1.04, rail arrow fill, vertical dots pager. «designe.txt:320-337»
ND-7916. Estilo L "Monochrome Glass": vidro tingido na MESMA cor do fundo, mega-radius 160px recortando o fundo (negative-space radius), rim light stroke 1.5px branco 60%, micro-label mono uppercase 10px opacidade .5, highlight especular deslizando (loop 8s). «designe.txt:573-606»
ND-7917. Estilo M "Dual-Theme Bento": mesmo sistema renderizado em dark (#131313/#1F1F1F) e light creme (#F6EEDF/#E9DFC8) com acento único #FF5A1F→#FFA04D; stitch corners (marcas "+" nos 4 cantos, opacidade 30%); inversão de tema inteira sem relayout (Pattern T9). «designe.txt:627-667»
ND-7918. Estilos N-R [N3]: Holographic Bloom (rim-light iridescente, hue-rotate 0→30°/12s, float 6px/8s), Gradient Float Cards (gradiente vertical por card), Vortex Tunnel, Dev-Tool Noir (capsule nav + inferno fog + ghost watermark 4-6% opacity + CLI pill mono com copy), Abyss Glow (inner-lit card: luz sangrando da borda inferior; squircle tiles com edge-glow; labels verticais e ticker chips ▲▼). «designe.txt:569-571,424-443,523-540»
ND-7919. Ledger acumulado do masterclass chega a 140+ estilos · 77+ G · 195+ E · 161+ MA · 75+ TX · 320+ C · 124+ AR · 18 F · 76+ MD · 125+ CH · 112+ T · 11 CV — estrutura de inventários com IDs é o formato canônico de merge. «designe.txt:1263»
ND-7920. Leis do ledger: INLINE-SLOT v4.1 (glifo/objeto-CTA 1 por classe, jamais 2 seguidos), GHOST-WORLD (1 ghost/página, tinta 8-25%, bleed ≥15%), BREAK-FAMILY (objeto transpassa borda — 1 por página), CORNER-FUSION, RAISED-ACTIVE (card ativo sempre mais claro/mais alto). «designe.txt:12020-12033»

### Grupo U — designe.txt: sistemas de UI gerada (system prompts Gemini) «designe.txt:36000+;48300+»

ND-7921. Trate cada seção como master artboard layer com z-index orquestrado 0-1000 e profundidade atmosférica — nunca empilhe blocos de texto amontoados; respiro py-24 a py-36 e gradientes transicionais entre camadas. «designe.txt:36033-36036»
ND-7922. Agrupamentos micro & macro dentro da camada: showcases macro, consoles de precisão interativos, mídia focal, micro-badges, gatilhos táteis; variedade geométrica (liquid glass, pílulas orgânicas, chanfros clip-path polygon) — PROIBIDO aninhar retângulo genérico dentro de retângulo. «designe.txt:36037-36039»
ND-7923. Sombras profissionais = multi-camada com penumbra calibrada (shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)]); proibido drop-shadow dura e flat; prefira edge highlights a bordas wireframe ubiquas. «designe.txt:36047-36049»
ND-7924. Copy curto de impacto, zero wordiness: banido filler corporativo e parágrafos densos; frases de efeito + métricas. «designe.txt:36051-36052»
ND-7925. Anti-literalidade: regras internas (cores/fontes/índices) são instruções de composição — NUNCA renderizar cards "Color Palette"/"Font Selection". «designe.txt:36057-36059»
ND-7926. Expurgar clichês amadores: pontos decorativos, grids de canvas pontilhados, underscores/aspas/traços técnicos, orbs brilhantes com blur pulsante, animate-ping balls, empilhamento pirâmide/losango, emojis em toda UI, elementos cortados/carrosséis truncados na viewport. «designe.txt:36060-36065»
ND-7927. Sistema de 3 fontes exatamente: display cinética 700-900 (Syne/Clash Display/Space Grotesk/Outfit), estrutura 400-500 (Outfit/Satoshi/Instrument Sans), detalhe UI 200/300 apenas em micro-labels — NUNCA serif de livro/old-style; escala 1.25-1.333. «designe.txt:36070-36074»
ND-7928. 3 cores globais (base dark-dominante #07090E/#0A0D14, acento saturado 2026, neutro alto contraste #F0F4F8) + 3 cores de seção derivadas — só CSS interno. «designe.txt:36075-36077»
ND-7929. Execução direta "no macete" + planejamento progressivo JSON: <script type="application/json" id="page-plan"> com id/name/category/subtasks por componente; marcar COMPONENT_START/END e checkpoints SUBTASK. «designe.txt:36082-36106»
ND-7930. Bilingue PT/EN via endpoint Google GTX: translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl={lang}&dt=t&q={encoded}. «designe.txt:36107-36109»
ND-7931. Canvas global renderiza a 75% de escala automaticamente — não injetar zoom hacks individuais. «designe.txt:36110-36111»
ND-7932. Consistência entre páginas do mesmo site: reutilizar componentes gerados (nav/header/footer) se casarem com a identidade; focar geração apenas nos novos. «designe.txt:36239-36244»
ND-7933. Edição por componente: aplicar instrução SÓ ao data-component-id alvo, gerar NOVO id único e devolver apenas o HTML do componente — nunca o documento inteiro. «designe.txt:48192-48194»
ND-7934. HTML head mínimo: title "SiteName - PageName", meta color-scheme (light OU dark, um só), Google Fonts link; fonte aplicada via style inline no body; Tailwind e scripts injetados automaticamente. «designe.txt:48108-48136»
ND-7935. Ícones: Lucide/Feather via unpkg com lucide.createIcons() ao fim do body; NUNCA emojis; placeholders visuais = gradientes CSS, SVG inline ou ícones. «designe.txt:48141-48143»
ND-7936. Navegação gerada usa <a href> com paths descritivos (inbox/message-from-alice) — todo link com href significativo. «designe.txt:48145-48147»
ND-7937. Ações de estado chamam window.FlashLiteAPI.performAction('Intent', payload) com formulários preventDefault. «designe.txt:48150-48154»
ND-7938. Mobile-first quando isMobile: coluna única, classes responsivas, sem scroll horizontal, navegação simples. «designe.txt:48222-48224»
ND-7939. Grounding ativo → ancorar conteúdo em busca real (nomes/estatísticas/fatos reais). «designe.txt:48218»
ND-7940. Erros de geração renderizam painel de erro estilizado (border-l-4, ícone SVG alert) — nunca texto cru. «designe.txt:48379-48387»

### Grupo V — Skill-Design-Universal V23/V24/V25 + FAUN (só o que é novo vs onda5) «Skill-Design-Universal-V23/24/25»

ND-7941. V25 é compilação hierárquica V1→V25: mesclar sentidos iguais, palavra única por sentido, sinônimos mesclados, lexia ressincronizada. «V25:1-3»
ND-7942. Operação em 5 rodadas de até 16 subagentes com leitura por faixa de linhas (0-2000, 2000-4000, …), onda 2 reagrupa por tema, onda 3 gera partes, onda 4 consolida, onda 5 audita duplicatas. «V25:325-327»
ND-7943. 1000+ ações planejadas antes do traçado; 400-600 ações por sessão; cumprir 85-95%; exatamente 20 sessões: primeiro topbar, último footer. «V25:589-590»
ND-7944. Sessão = agrupamento de componentes (fundo, material, camada, artefatos, assets, banner com 5 peças, ícone, botão, barra curva, adornos, animações). «V25:591»
ND-7945. Z-index semântico 0-1000: 0 atmosfera de fundo, 10 conteúdo, 20 consoles/flutuantes, 50 barra fixa — estilo Photoshop/CorelDRAW. «V25:592»
ND-7946. Ícone = 3 estratos: base com gradiente, pictograma branco frontal, elementos aninhados dentro da base; fundo é elemento que recebe outros elementos. «V25:603»
ND-7947. Tríade tipográfica: display cinética 700-900 (Syne/Clash Display/Outfit Bold/PJS ExtraBold/Space Grotesk), estrutura legível 400-500 lh 1.6, detalhe UI 200/300 só em micro-labels/tags/consoles — nunca em corpo; clamp fluido, text-wrap balance/pretty. «V25:604»
ND-7948. Paleta global: EXATAMENTE 3 cores novas (proibido azul+roxo como par) + 3 cores por seção; canvas cinematográfico #07090E/#0A0D14; acentos 2026 Cyber Violet/Electric Amber/Hyper Emerald; rim-light e spots de luz blur-120px. «V25:605»
ND-7949. 40+ tipos de efeito (glow, glass, claymorphism, glassmorphism, fluid glass, shaders, distorção, transparência, blur combinados) equilibrados em fundos/cards/botões/ícones/bordas; curva assinatura cubic-bezier(0.16,1,0.3,1) elástica. «V25:606»
ND-7950. Stack embutido single-file: React+Tailwind+CSS+CSS inline+SVG path embutidos; 40+ técnicas CSS (Houdini, @property, Paint Worklet, clip-path, offset-path, shape-outside, container queries); 1000+ propriedades CSS/JS exploradas. «V25:611-612;564»
ND-7951. Pacotes exclusivamente via CDN (jsDelivr, Cloudflare, unpkg, esm.sh, importmap) — sem npm local. «V25:612;566»
ND-7952. Funcionalidades core do site gerado: bilíngue PT/EN com cache de tradução, responsividade 320px→1920px, modo noturno/preto completo, persistência local segura + sync realtime JSON+WSS/WebSockets, banco local better-sqlite3/Prisma/Drizzle/libsql. «V25:613;567-568»
ND-7953. Genérico vetado (ban list v25): heróis Inter, padrões Roboto, gradientes roxo/azul-roxo/rosa-roxo, creme-terracota-argila, paleta shadcn/Tailwind default (índigo/violeta/azul CTA/cinzas ardósia), emojis como ícones, cartões em cartões, salto elástico, sombra harsh, hex fora do tema, spacing fora da escala, breakpoints por dispositivo interno, foco indicado só por cor, reduced-motion desabilitado estático, ARIA estático, IntersectionObserver decorativo, hover sem foco. «V25:614»
ND-7954. Leiaute vibe-code vetado: herói emblema+título central+2 botões+mockup, grade igual 3/4 colunas, seção de features 3-4 cards com ícone quadrado, carrossel de depoimento 5 estrelas, faixa de logos inventados, barra de stats 10k usuários/99.9% uptime/24-7, FAQ parafusado no rodapé, rodapé 4 colunas Produto/Empresa/Recursos/Legal, cantos 2xl-3xl com mesma sombra, vidro translúcido sem motivo, orbes SVG flutuantes, Lucide default sem customização, fade slide-up idêntico em toda seção, grid 12 features (paralisia), linhas brancas aleatórias separando seções. «V25:615»
ND-7955. Verificação final: prontidão de produção, checklist desktop+mobile, autocrítica "seria confundido com template Webflow?", WCAG, Lighthouse, cada componente com background e contexto z-index próprios, cada seção como camada mestre com iluminação atmosférica. «V25:616»
ND-7956. FAUN reset total: abandonar estética/paleta/composição/técnica anterior — refazer do zero, sem vestígios, sem caixa quadrada. «V25:526»
ND-7957. FAUN formato: landing vertical 9x16 fullscreen, sem moldura de celular, sem canvas aninhado, rolagem contínua única; 20 seções fixas (1 topbar, 2 banner, 3-19 blocos, 20 footer). «V25:532-533»
ND-7958. FAUN densidade: 0-200 micro/macro componentes e 0-200 micro/macro animações por seção, balanceando leve/denso com respiro. «V25:534»
ND-7959. FAUN conteúdo: máx 3-5 palavras por label, 8-12 micro-frase, verbo presente, sem preços/cursos/rankings/features de plataforma/gráficos/muros de texto. «V25:543-544»
ND-7960. FAUN padrão único de componente: todos com mesmo fundo/borda/efeitos; borda branca é o único contorno permitido. «V25:549»
ND-7961. FAUN curvas: topbar com curva ajustada por JS (Bezier/Catmull-Rom/lerp/seno-cosseno) e SVG path dinâmico preserveAspectRatio="none" — transições entre seções nunca corte reto seco. «V25:550»
ND-7962. FAUN anti-amador: sem dots/traços/hífens/underscores/aspas decorativos, sem primitivos geométricos soltos, sem retângulos com dots, sem fontes finas básicas em cards, sem círculos desproporcionais. «V25:552»
ND-7963. FAUN fontes: exatamente 3 fontes premium leves (não book/serif fina) com variações obrigatórias bold/semi-bold/semi-thin/thin — uma mais grossa, uma mais fina, uma natural. «V25:557»
ND-7964. FAUN ícones: SVG path inline desenhado do zero (não biblioteca genérica), padrão unificado de fundo/borda/efeitos, Z-index 0-1000. «V25:558»

### Grupo W — DESIGN (n).txt: style references (8 estilos únicos) «DESIGN*.txt»

ND-7965. Relate: azul royal #145aff como ÚNICO acento saturado (headlines, links, logo, uma palavra colorida no hero); corpo Inter 400 14-16px sobre #fcfcfc; dois níveis de radius (8px inner cards, 16-40px containers); sombra stack multi-camada (3 rgba crescentes) nos feature cards. «DESIGN (1).txt:222-238»
ND-7966. Relate don'ts: nunca #0000ee (link blue de browser); CTAs ghost-outline/frosted pills, nunca blocos pesados preenchidos; gradientes de no máximo 2 stops; mínimo 4px de radius; texto nunca abaixo de 14px; 1 dot de cor por superfície; Inter só 400/500/600. «DESIGN (1).txt:233-240»
ND-7967. Portal: retro serif display (Perfectly Nineties→Playfair/Recoleta) como âncora de personalidade em H1/H2 36-48px lh 1.0; #007aff como ÚNICO acento cromático funcional; elevação por glow ring 0 0 0 5px #f7f7f7 em vez de sombra; botões 100% pill 50px. «DESIGN (2).txt:170-188,199-202»
ND-7968. Portal don'ts: serif display nunca em corpo/captions/botões; sombra pesada quebra o feel editorial; raio mínimo 7px (cards 16-30px); corpo nunca <14px nem >600; #000 nunca sobre fundo cromático; #007aff nunca em fills grandes. «DESIGN (2).txt:181-188»
ND-7969. Active Theory: void #000000 absoluto, UI como ghost chrome (translúcido 0.1-0.5, borda hairline #4d4d4d), violeta #343755 racionado para CTA único, corpo em serif Times 16px lh 1.88 como contraponto editorial, profundidade por backdrop-filter blur(4px) — NUNCA box-shadow. «DESIGN (3).txt:133-164»
ND-7970. Active Theory don'ts: sem novos acentos cromáticos; sem sombras (o vazio não as projeta); superfícies nunca sólidas; radii binários 5px OU 500px (valores intermediários parecem acidentais); sem gradiente no chrome UI (o WebGL carrega o gradiente). «DESIGN (3).txt:144-151»
ND-7971. TWOMUCH.STUDIO: gallery plate #e5e7eb com objetos flutuando SEM card/borda/sombra (imagem É a superfície); lime #e2ff70 racionado a exatamente 1 ação por tela; um só tipo/um só peso (ABCMonumentGrotesk 500, tracking -0.48px); hairline 1px como única borda; pill 9999px como ÚNICA forma de container. «DESIGN (4).txt:132-164,195-197»
ND-7972. TWOMUCH don'ts: segunda fonte/segundo peso/tracking positivo vetados; sistema flat — zero sombras/glows; frames em imagens vetados; máx 2 níveis de superfície por tela; corpo compacto left-aligned máx 22px. «DESIGN (4).txt:143-150»
ND-7973. Vivid+Co: obsidian #101010 + graphite veil #495764 + bone #fffdf9; display 105-136px weight 400 lh 1.00 tracking -0.02em (escala carrega hierarquia, não bold); PRISMA RGB (vermelho/ciano/verde) existe SÓ dentro do artefato; sem botões filled/gradientes/chromatic UI; curva de motion assinatura cubic-bezier(0.52,0.01,0,1) (150 usos, 0.5s). «DESIGN (5).txt:99-158,196-198»
ND-7974. Vivid+Co don'ts: pesos 600-800 em display vetados; box-shadows vetados; canvas nunca mais claro que #495764; tracking mais frouxo que -0.01em acima de 22px vetado. «DESIGN (5).txt:150-157»
ND-7975. Three: void #111111 (NUNCA #000 puro), stack de elevação por TONOLOGIA #111→#181→#343 sem sombra; ember #ff4300 único acento; TODA a tipografia weight 700 (sistema de peso único); tracking agressivo por tamanho (-0.056em@68px). «DESIGN (6).txt:141-172,184-199»
ND-7976. Three don'ts: segundo cromático vetado; pesos 300-600 vetados; sombra/glow vetados; gradiente só em arte 3D, nunca em superfície UI; ember nunca sobre outro elemento ember-tinted. «DESIGN (6).txt:152-159»
ND-7977. VITURE: ember #ff5f34 preenche CTA/links/badges; tracking POSITIVO crescente com o tamanho (+5.25px@105px, +17px@340px) — assinatura holográfica; gradient text background-clip com linear-gradient(90deg,#ff5f34 -100%,#f31010 0%,#ff5f34 100%); cards 28px/botões pill; bandas alternando claro/escuro a cada 80px. «DESIGN (7).txt:175-194,205-215»
ND-7978. VITURE don'ts: segunda cor de acento vetada; tracking negativo em display VETADO (mata a assinatura); sombra em cards vetada; raio 4-8px em superfícies primárias vetado; gradiente laranja-violeta só em banner full-bleed. «DESIGN (7).txt:186-193»
ND-7979. Visitors: blueprint branco com lavanda #918df6 exclusiva do CTA primário (Iris #9580ff reservada ao botão Register da nav); métrica positiva = verde #33c758 SEMPRE sobre Mint Wash #def6e4, nunca verde cru no branco; Carbon #181925 no lugar de preto puro; pill radius em todo botão/chip/tag. «DESIGN.txt:163-181,183-196»
ND-7980. Estilo "Electric Iris" (theme 7/8): azul elétrico #0036ff + sinal ciano #0093ff sobre deep void #05061b com hairline #e5e7eb — quarta variante dark-blue dos tokens theme. «theme (7).txt:2-10»

### Grupo X — theme tokens (Tailwind @theme por estilo) «theme*.txt»

ND-7981. Todo style reference desce em @theme Tailwind completo: --color-*, --font-*, --text-*/--leading-*/--tracking-* por papel, pesos, spacing 4..140, radii nomeados, surfaces por nível. «theme.txt:1-66»
ND-7982. Paletas únicas catalogadas: Visitors (carbon/lavender/mint-wash/amber/sky/magenta/ember), Portal (signal-blue #007aff/ash-mist/dusk-gradient 4 stops), Relate (snow-canvas/royal-signal #145aff), Active Theory (void/dusk-violet #343755), Vivid+Co (bone #fffdf9/prism RGB), Three (ember #ff4300/silver), VITURE (viture-ember #ff5f34/crimson-core/aurora-wash/ultra-violet), Electric Iris (#0036ff/#0093ff). «theme*.txt (9 conjuntos)»
ND-7983. Tracking negativo proporcional ao tamanho é padrão (ex. Relate -1.48px@40px→-1.52px@80px), EXCETO VITURE (positivo crescente) — cada sistema declara a própria curva de tracking. «theme (2).txt;DESIGN (7)»
ND-7984. Surfaces são declaradas como tiers numerados 0-4 com nome/value/purpose (canvas→wash→card→inset→accent) — a escada de superfície é contrato do design system. «DESIGN (7).txt:195-204;DESIGN.txt:183-191»

### Grupo Y — CSS blobs neodevthink: tokens e arquitetura «*.css»

ND-7985. Tokens de app em :root plano (--paper/--ink/--lime/--lavender/--mist/--pollen/--lilac/--iris/--clay + --gutter clamp(24px,4.5vw,72px) + --ease cubic-bezier(.22,1,.36,1)) — tema inteiro em ~10 variáveis. «index(21).css:11-20»
ND-7986. Dark mode por atributo: :root[data-theme="dark"] troca 6 tokens (--paper/--surface/--ink/--muted/--line/--lavender) + color-scheme: dark — sem reescrever componentes. «index(115).css:32-40»
ND-7987. Reset base canônico dos blobs: box-sizing border-box, scroll-behavior smooth + scroll-padding-top 100-120px, button/a/input herdam font, -webkit-tap-highlight-color transparent, :focus-visible outline 2px + outline-offset 3-5px, ::selection com cor do tema, disabled opacity .38-.45. «index(21).css:22-34;index(115).css:10-24»
ND-7988. Skip-link de acessibilidade padrão: position fixed top -80/-100px → :focus top 12-20px, pill lime, z-index 160-2000. «index(138).css:58-74;index(21).css:70-71;index(150).css:49-50»
ND-7989. Container canônico: width calc(100% - 2*gutter) max-width 1248-1280px margin-inline auto; headings clamp(35px,3.9vw,56px) letter-spacing -.05em/.065em. «index(174).css:52;index(21).css:35,43»
ND-7990. Botão-pill assinatura: inline-flex, gap 18-24px, justify-content space-between, padding 7-8px 7-8px 7-8px 20-24px, min-height 46-55px, radius 999px, com button-disc circular interno que gira 45° no hover; disabled remove a rotação. «kroma(1).css:34-115;index(21).css:50-62»
ND-7991. Botões têm variantes por cor (lime/black/white/outline/cyan/violet/ghost) onde o disc interno sempre inverte contraste com o corpo. «kroma(1).css:52-111;index(1).css:57-68»
ND-7992. Text-link com seta: svg com transition transform .25s; hover translate(2-3px, -2-3px) — micro direcional padrão. «index(115).css:43-46;index(21).css:45-47»
ND-7993. Scroll progress dentro do header: barra 1px absoluto bottom com transform-origin left e scaleX controlado por JS. «index(21).css:90;index(116).css:14»
ND-7994. Nav item com underline que cresce: ::after scaleX(0)→1 origin left, .2s; ativo/hover colore o texto. «index(21).css:79-82;index(147).css:67-70;index(181).css:101-108»
ND-7995. Seções dark embutidas em página light usam border-radius 35-37px só no topo + recorte de canto (::before/::after com background var(--paper) e radius num canto) criando o "step" de entrada. «index(147).css:149-150;index(166).css:2-4;index(181).css:93-94;index(115).css:2-3»
ND-7996. Grain/dot-grid como fundo de seção: radial-gradient(#hex .6-1.5px, transparent) com background-size 8-24px e opacity 3-17%, às vezes com mask-image linear para desvanecer numa direção. «index(115).css:4-5;index(138).css:387-396;index(174).css:234»
ND-7997. Noise fractal via SVG data-URI: feTurbulence baseFrequency .78-.86 numOctaves 3 stitchTiles stitch, opacity 4.5-12%, mix-blend multiply opcional. «index(166).css:5;index(181).css:114»
ND-7998. Glass de header sempre no elemento irmão ::before/absolute (o vidro é recortado por clip-path SEM cortar o conteúdo/links): backdrop blur 18-24px, borda #fff semi, sombra 0 10-12px 30px. «index(21).css:73-75;index(150).css:82-87»
ND-7999. Estados de scroll do header: .is-scrolled/.scrolled sobe top (20→12-14px), escurece background (#76%→#94-96% opacity) e aumenta border-color. «kroma(1).css:331-334;index(138).css:234-236;index(1).css:92»

### Grupo Z — componentes CSS assinatura dos blobs «*.css»

ND-8000. Audio-status/indicator pills do header: inline-flex gap 6-8px, padding 7px 11-12px, radius 999, fundo rgba(255,255,255,.06), borda rgba(255,255,255,.12), mono 8-10px; hover/active borda lime. «kroma(1).css:359-412»
ND-8001. Kbd/cmd badge: mono 6-8px, borda 1px rgba branca, radius 4-6px, padding 1-4px — para dicas de teclado em pills. «kroma(1).css:414-420;kroma-panels(1).css:23-30»
ND-8002. Cards com cantos invertidos (cutout): elemento papel no canto com border-top-left-radius + ::before box-shadow 12px 12px 0 11px var(--paper) para "morder" a mídia. «index(104).css:62-64;index(21).css:111-112»
ND-8003. Cutout de projeto: quadrado papel 68-83px no canto inferior-direito da imagem com seta circular que gira 45° e preenche de lime no hover. «index(181).css:80-83»
ND-8004. Estat-card com "aba" conectora: ::before quadrado 24px rotacionado 45° no topo central, mesma cor/borda do card, border-bottom-color transparent — conecta o card à seção acima. «index(178).css:145-149»
ND-8005. Fan strip de pastas: 5-6 cards absolutos bottom com rotate -11°..+11° e z-index escadinha; hover translateY(-14px) rotate(0) !important + z-index topo; shine linear-gradient(115deg,#fff5,transparent 35%). «index(104).css:70-86»
ND-8006. Word-pill headline: palavras grandes (clamp 54-118px) embrulhadas em pills coloridas com rotate -1.5°/+1°, inner highlight inset 0 2px 6px #fff8 e sombra colorida 0 16px 40px. «index(104).css:37-47»
ND-8007. Hero blob com clip-path estrela 12 pontos + blur 70px + opacity .5 como mancha de cor animável; dashmarch anima stroke-dashoffset -22 em 2.6s linear infinite para linhas tracejadas vivas. «index(104).css:20-23»
ND-8008. Torus CSS: círculo com mask radial-gradient(circle, transparent 33%, #000 35%) criando anel 3D com sombra drop-shadow colorida e floaty 5-6s ease-in-out infinite alternate. «index(104).css:31-36»
ND-8009. Carrossel de momentos com profundidade: 5 imagens com alturas 198-322px e margens alternadas, card central maior (flex-basis 33%), rotate por variável --card-rotate, scrim gradiente na metade inferior. «index(166).css:79-88»
ND-8010. Gauge SVG físico: track stroke 6 opacidade baixa + ticks + fill stroke 5 round com filter drop-shadow(0 0 4px #hex) e transition stroke-dasharray .7s cubic-bezier(.2,.7,.2,1); centro absoluto com número 62px tracking -4px. «index(166).css:48-63»
ND-8011. Slider customizado: appearance none, track 2-3px, thumb 10-22px com borda 2px clara e box-shadow 0 0 0 4px rgba(accent,.3); ends com mono 6px. «index(166).css:36-39;index(21).css(bicolor):394-413»
ND-8012. Toggle segmentado (model-toggle/billing): container pill escuro padding 4-5px, botões pill que no selected ganham fundo claro + sombra 0 2px 4px — "switch de console". «index(166).css:15-18;index(178).css:469-500»
ND-8013. Stepper de progresso quiz: barra flexível de segmentos 3px radius 999, ativo colorido, transition background .3s. «index(115).css:16-18;index(174).css:37-39»
ND-8014. Option card de quiz/form: label flexível min-height 61-68px, borda 1px, radius 13-14px; selected muda bg/borda; :has(input:focus-visible) desenha outline de acessibilidade; radio-check círculo 16px que preenche. «index(115).css:21-32;index(174).css:44-51»
ND-8015. Números-gigantes com unidade: strong 400 clamp 30-110px letter-spacing -1.5..-6px com <span> 13-24px tracking -.5px cor muted. «index(166).css:127-128;index(138).css:86-93»
ND-8016. Vertical wordmark de seção: writing-mode vertical-rl + rotate 180deg, 82px weight 900, coluna com borda-direita 2px — tipografia estrutural. «index(138).css:684-693»
ND-8017. Ghost word de fundo: texto 120px weight 900 rgba(255,255,255,.03) letter-spacing 10px user-select none — marca d'água tipográfica de seção. «index(138).css:216-224;index(138).css:685-695»
ND-8018. Stadium columns: pilares 90px width 999px radius com fotos, translateY alternado (40/-20/30/-10/50px), badge circular 36px branco-3px na interseção, scrim bottom rgba(0,0,0,.65) blur 8px. «index(138).css:513-608»
ND-8019. Circle fan collage: círculos 150px sobrepostos margin-left -32px com borda 4px branca, centro 200px com play; stamp circular dashed rotate(-12deg) que endireita no hover. «index(138).css:669-706;c3:17-35»
ND-8020. Folder 3D CSS: ::before como aba (top -17px, radius 12px 18px 0 0, background inherit), shine interno, ano 34px opacity .55; gradientes pastel por pasta. «index(104).css:72-83»
ND-8021. Folder-object pastel: folder com aba ::before e sombra em camadas (inset highlight + 3px 12px 17px + 0 10px 0 cor sólida) — efeito "papel empilhado". «index(174).css:196-199»
ND-8022. Crystal orb (cell-orb): radial-gradient multi-stop + inset shadows duplas (-18px -26px 60px escuro, 12px 16px 40px claro) + border 8px branco .47 + 4 bolhas internas radiais. «index(104).css:186-191»
ND-8023. Lab title-notch: título em bloco branco colado no topo do card com border-radius 0 0 34px 0 — recorte de cantoneira. «index(104).css:183-184»
ND-8024. Máscara de imagem lateral: mask-image linear-gradient(90deg, transparent, #000 30%) para fundir foto com o card. «index(104).css:201»
ND-8025. Mix-blend luminosity nas janelas do mosaico: foto em luminosity .75 que vira normal .95 no hover — troca de "modo de cor" como interação. «index(138).css:303-317»
ND-8026. Mosaic de janelas assimétrico: grid 240px 1fr 1fr 1fr × 240px 240px com cards que são círculo (radius 50%), pill vertical (radius 120px) e tall (row span 2) — geometria mista num só grid. «index(138).css:226-295»
ND-8027. Colorway por filter: mesma foto de produto troca de cor com filter classes (graphite: saturate(0) brightness(.66) contrast(1.12); cream: sepia(.35) saturate(.58) hue-rotate(340deg)) — sem assets extras. «index(174).css:256-258»
ND-8028. Sound orb: esfera 144px com radial-gradients + conic-gradient(from -15deg, 6 stops) + inset shadows duplas; orb interno 75px glass; .orb-playing anima orb-pulse (box-shadow 0 0 0 9px #ffffff0f) 2.5s. «index(174).css:156-160»
ND-8029. Closing surface com notch central: mask radial-gradient(circle 89px at 50% 0, transparent 98%, black 100%) cria a "boca" onde o orb se encaixa no topo do bloco dark. «index(174).css:155»
ND-8030. Concave filter bar (bridge): barra central com cantos ::before/::after radial-gradient(circle at 0 100%, transparent 34px, cor 35px) que curvam a junção para cima — bridge côncavo entre frame e barra. «index(174).css:284-287»
ND-8031. Booking card com "::after radial" lateral invertida para encaixe: radial-gradient(circle at 100% 0, transparent 29px, cor 30px). «index(174).css:301-302»
ND-8032. Mini-player fixo: 235px glass escuro blur 18px, capa/texto truncados com ellipsis, play circular 29px — padrão de player persistente. «index(174).css:187-192»
ND-8033. Modal dialog nativo: <dialog> transparente com ::backdrop rgba dark + backdrop-filter blur(10-12px); panel interno radius 22-28px com max-height inherit e overscroll-behavior contain; close circular com hover rotate 90°. «mova-panels(1).css:1-5;sol-panels:125-129;vortex-panels:3-59»
ND-8034. Dialog multi-tamanho por classe: width min(620-1040px, calc(100vw - 56px)) — search/track/plan/tour/contact tamanhos distintos, mesma linguagem. «sol-panels:243-247»
ND-8035. Quiz em dialog com arte lateral: grid .82fr 1fr, imagem com scrim linear inferior, estrela-burst clip-path 22 pontos rotate(12deg) decorativa. «index(174).css:55-61»
ND-8036. Toast pill: fixed bottom center/right, radius 999-13px, borda accent, check circular 20px, dismiss ghost; pointer-events none no container, auto no toast. «index(138).css:727-764»
ND-8037. Empty state canônico: svg central colorido muted, h3 23-27px tracking -.04em, p máx-width 420-440px lh 1.8, botão text-link. «index(21).css:165-168;mova-panels:20-24»
ND-8038. Menu de contexto local: painel absoluto 143px radius 9px borda hairline sombra 0 9px 23px, itens 10px radius 5px com hover bg lavanda; rename inline com input 11px. «index(174).css:282-289»
ND-8039. Attribute details/summary para referências (atlas): summary flexível com ref-id mono colorido, chevron rotate 180 no [open], corpo em grid 2 col. «prisma-panels:47-55;sol-panels:207-220»
ND-8040. Palette swatch grid: swatch 48px radius 8px com inset ring rgba(0,0,0,.08) + nome 12px + hex mono 9px — documento visual de cores dentro do produto. «kroma-panels(1).css:762-800;sol-panels:229-232»
ND-8041. Type specimen row: linha 31px com espécime de fonte + label DM Sans 10px embaixo, separadas por hairline — catálogo tipográfico embutido. «sol-panels:233-234»
ND-8042. Tabela de redistribuição responsiva: wrapper overflow-x auto, th mono 7px uppercase, td 10px lh 1.85 com hairline top, min-width 540px. «sol-panels:238-242»
ND-8043. Gráfico de barras em dashboard CSS puro: bar-track flex-end com fill gradiente (#ff8a00→#ff4500) e step-chart com borda superior 1px mais escura por barra (efeito 3D chapado). «index(138).css:694-713;index(166).css:130-133»
ND-8044. Active glow em card selecionado: border-color accent + box-shadow 0 0 0 3-4px rgba(accent,.1-.2) — seleção por "halo", não por fill. «index(138).css:584-587;index(115).css:130»
ND-8045. Spotlight de seção: radial-gradient de canto (600px, rgba lime .25→transparent 70%) absoluto + grid hairline 70px — iluminação de palco. «kroma(1).css:645-662»
ND-8046. Light curtains: colunas 120px de gradiente vertical (accent 0%→.05 50%→transparent) com blur 40px, justificadas space-around, opacity .35 — "cortinas de luz". «kroma(1).css:366-380;index(138).css:483-502»
ND-8047. Ribbed light: repeating-linear-gradient(90deg, #fff5 0, #fff1 2px, transparent 3px, transparent 6px) sobre radiais coloridas com mask linear vertical — papel de parede de luz estriada. «index(166).css:78»
ND-8048. Air-streaks: repeating-linear-gradient(90deg, transparent 0 46px, #5f7cff22 46px 62px, transparent 62px 120px) com mask vertical — varandas de luz por trás do hero dark. «index(104).css:110»
ND-8049. Marquee band inclinada: banda -2.2deg com track width max-content e animação ticker 38s translateX(-50%) infinita; hover pausa (animation-play-state: paused). «index(116).css:36-45»
ND-8050. Voice bars keyframe: @keyframes voice-bars to scale(1,.35) com origin bottom — equalizador de ícone falante. «index(166).css:326»

### Grupo AA — Regras de qualidade/responsividade/a11y dos blobs «*.css»

ND-8051. prefers-reduced-motion reduz TUDO: animation-duration .01ms !important, iteration-count 1, transition-duration .01ms, e desliga animações específicas (vinyl/seal/orb). «index(174).css:317-321»
ND-8052. Breakpoints por conteúdo: 1150/1024/950/900/800/700/640/500/380px; regras movem grids para 1-2 colunas, escondem nav desktop, redimensionam wordmarks em vw (18.7vw→32vw). «kroma(1).css:560-705;index(138).css:769-802;index(174).css:309-315»
ND-8053. Media de altura: @media (min-width 901px) and (max-height 800px) reduz padding-top do hero — viewport curto é caso de teste. «index(174).css:297-299»
ND-8054. Media de largura grande: @media (min-width 1600px) aumenta hero padding e fontes fixas — telão é caso de teste. «index(174).css:301-307»
ND-8055. scrollbar-gutter: stable + scrollbar-width thin + scrollbar-color customizados em dialogs — scroll sem layout shift. «index(21).css:23;mova-panels:3;sol-panels:127»
ND-8056. overscroll-behavior: contain em modais e scroll interno — impede scroll chaining. «index(174).css:198-199;sol-panels:127»
ND-8057. touch-action: manipulation em botões/links — mata delay de toque sem quebrar pinch-zoom. «index(21).css:29;index(150).css:26»
ND-8058. color-scheme: light|dark declarado junto dos tokens — inputs/nativos herdam o tema. «index(115).css:8;index(21).css:121»
ND-8059. Números tabulares e mono para dados: font-family mono com letter-spacing .04-.08em e text-transform uppercase em micro-labels de 5-9px. «kroma(1).css:117-138;index(174).css:57»
ND-8060. Hierarquia de micro-texto: 5-6px mono para specs, 7-9px para labels, 10-12px para corpo de card — escala "nano" consistente entre os blobs. «index(174).css:106-114;index(147).css:85-91»
ND-8061. Sombras em 2-3 camadas com penumbra: 0 12px 30px #00000014 (ambient) + inset 0 1px 1px #fff (highlight) é o par mínimo de "física" dos cards claros. «index(115).css:11;index(166).css:44»
ND-8062. Botões com hover translateY(-2px) + sombra colorida curta (0 5-6px 17-20px rgba accent .08-.16) — lift sutil universal. «index(115).css:32-37;index(174).css:60-63»
ND-8063. Hover de imagem: transform scale(1.035-1.07) com transition .5-.8s cubic-bezier(.2,.65-.7,.25-1) — zoom cinematográfico lento, nunca rápido. «index(147).css:77-78;index(181).css:78-79»
ND-8064. Alvos de toque mínimos: icon buttons 30-44px circulares, thumbs 33px, save 33px — nunca abaixo de 30px. «index(21).css:150;index(174).css:277-281»
ND-8065. Foco visível customizado por blob: outline 2px #849951/#9166d5/#7556cb/accent com offset 3-5px — nunca remove outline sem substituir. «index(21).css:33;index(115).css:19;index(174).css:48»

### Grupo AB — Sistema de temas Neo DevThink (fallback multi-tema) «theme-*.css;home(1).css»

ND-8066. Arquitetura de temas: tokens nomeados por METÁFORA (--color-snow/--ghost/--moss/--obsidian + 4 acentos sky/peach/lime/orange) — dark inverte snow↔obsidian mantendo os nomes. «theme-default(1).css;theme-dark(1).css»
ND-8067. Tokens de app globais por tema: --bg-app-outside, --bg-app-container (alpha .4-.9), --bg-app-card (alpha .75-.95), --border-app-accent, --text-active, --text-muted (60-65%), --selection-color, --backdrop-blur (blur 40-50px saturate 150-220%), --shadow-premium (2 camadas 40px/80px). «theme-default(1).css:13-25»
ND-8068. 5 temas canônicos: Default (Light Glass #E6E8F3 fora), Dark/Obsidian Night (#05070B), Sunset Royal (#06030B + roxo/rosa #EC4899), Nordic Forest (#0F1212 + teal salmão), Pitch Black AMOLED (#000 + neon #00E5FF/#FF007F/#39FF14, blur menor 40px, saturate maior 220%). «theme-*.css (5 arquivos)»
ND-8069. Tema altera saturação do glass, não só cores: sunset 200%, nordic 150%, pitch-black 220% com blur 40px — AMOLED usa glass mais fino. «theme-sunset-royal(1).css:21-25;theme-pitch-black(1).css:21-25»
ND-8070. Sombra premium do tema default é neutra (rgba preto .1) e das versões dark é profunda (.4-.6) — elevação acompanha o tema. «theme-default(1).css:23-25;theme-dark(1).css:23-25»
ND-8071. Glows ambientais por tema: home-glow-orange rgba(255,92,0,.22) e home-glow-blue rgba(126,182,255,.18) radiais 70% — decoração herdada do tema ativo. «home(1).css:69-75»
ND-8072. Grid overlay do home inverte com o tema: dark/pitch usam rgba(255,255,255,.03), light usa rgba(26,26,27,.03) — um só seletor duplo. «home(1).css:99-113»
ND-8073. Premium card hover do home: translateY(-5px) scale(1.01) + sombra 0 30px 60px + border-color accent, transição .4s cubic-bezier(0.16,1,0.3,1). «home(1).css:88-96»
ND-8074. Float lento assinatura: home-float-anim 8s ease-in-out alternate com rotação 0→1deg — ambientes "respiram". «home(1).css:116-124»

### Grupo AC — kroma(1).css: componentes de estúdio «kroma(1).css»

ND-8075. Badge circular giratório: SVG textPath mono 8px girando 14-20s linear infinite (badgeSpin) com centro absoluto (número display 24px + small mono 6px). «kroma(1).css:173-233;index(138).css:189-221»
ND-8076. Floating stickers: pílulas absolutas com rotate -6°/+8°/+4° que endireitam e escalam 1.06 no hover, glass rgba(255,255,255,.9) blur 12px. «kroma(1).css:235-273»
ND-8077. Waveform visualizer: barras 2.5px com height por variável --h e animation wavePulse .8s alternate infinite quando .is-playing — equalizador CSS puro. «kroma(1).css:275-303»
ND-8078. Radar achievement: 3 anéis SVG concêntricos stroke 1.2 rgba preto .08 + stroke ativo lime 3.5 round rotate(-90deg) + botão central branco 80px + 4 ícones-orbit posicionados (top/right/bottom/left). «kroma(1).css:87-195»
ND-8079. Like-chip com estado: is-liked muda bg #ffe3ec, borda #ff85ad, texto #d11e5b — feedback afetivo em chip. «kroma(1).css:233-250»
ND-8080. Serpentine chain grid: grid 3× com nós de geometria mista (círculo aspect-ratio 1, cápsula span 2, vertical flex-column) com gradientes 145deg distintos e callout de retrato absoluto fora do grid. «kroma(1).css:252-381»
ND-8081. Aurora pods: card com --glow-color por item; .is-selected troca border-color para rgba(255,255,255,.4) e aplica box-shadow 0 20px 50px var(--glow-color) — cor como estado. «kroma(1).css:421-442»
ND-8082. Light chamber: câmara interna 200px com beam radial elíptico bottom (ellipse at 50% 100%, #fff, transparent 70%) — "farol" dentro do card. «kroma(1).css:459-475»
ND-8083. Laptop mockup CSS: base brutalist rotate(-4deg) perspective(1000px) rotateX(16deg) + top-face mais clara + lid #1a1e22 com bezel + camera notch 40×6px + chassis 16px com trackpad 60×8px — hardware 100% CSS. «kroma(1).css:638-696;kroma4:59-75»
ND-8084. Screen-switcher tabs verticais: botões 12px com dot-indicator colorido, label flexível e check violeta; ativo ganha fundo branco sólido + sombra 0 8px 20px. «kroma(1).css:121-149»
ND-8085. Bicolor range input: track linear-gradient(90deg,#fe6839,#261af6) 8px radius 999 + thumb 22px branco com borda 2px do segundo stop — slider duotone. «kroma(1).css:394-413»
ND-8086. Notch angled button: clip-path polygon(0 0, 100% 0, 92% 100%, 0 100%) com disc interno ink/lime; hover translateX(4px) — seta-cunha. «kroma(1).css:428-456»
ND-8087. Glass wallet central: rgba(14,23,34,.88) + blur 24px + borda accent .3 + sombra dupla (60px preto + 0 0 30px accent .15); satélites pill glass 999px com dot neon box-shadow 0 0 10px cor. «kroma(1).css:446-511»
ND-8088. Card de crédito mockup: gradiente 135deg teal-escuro, chip tipo mono 6.5px, footer com número mascarado — cartão 100px height dentro da wallet. «kroma(1).css:572-604»
ND-8089. Pricing com tier destacado dark: card branco vs destacado #11141c com borda rgba lime .35 e stamp absoluto top -24px right 24px; badge "current" mono lime. «kroma(1).css:172-268»
ND-8090. Billing cycle toggle: container #e4e7eb pill com botões; ativo branco + sombra 0 4px 12px; save-badge mono 7.5px lime. «kroma(1).css:128-162»
ND-8091. FAQ com índice: cada pergunta numerada (mono 9px), chevron que rotate(180deg) e colore violeta quando .is-open; resposta com padding-left 36px (alinhada ao texto). «kroma(1).css:333-380»
ND-8092. Footer colossal wordmark: clamp(140px,25vw,360px) weight 700 tracking -.09em line-height .88 com asterisco lime 16% girando (badgeSpin 20s) ao lado — assinatura de rodapé. «kroma(1).css:487-506;index(138).css:685-695»

### Grupo AD — Movimento e keyframes catálogos «*.css;designe.txt»

ND-8093. Keyframes essenciais dos blobs: spin/badgeSpin/seal-spin/orbit-spin (rotate 360), floaty/floaty2/floatY (y ±8px com/sem rotação), wavePulse (height 15%→var(--h)), dashmarch (dashoffset -22), portalpulse (opacity .85→1 + scaleX 1.06), eq (height 6→16px), orb-pulse (ring 9px), ticker (translateX -50%), material-float/material-orbit, scrollDot (opacity .4→1 + translateY 7px), home-float-anim. «kroma:229-303;index(104):22-36;index(1):174-308;index(166):326;index(174):147-160;index(116):121-122;index(181):222-223»
ND-8094. Direção de easing por tipo: entradas cubic-bezier(.2,.8,.2,1)/(.16,1,.3,1), hovers .2-.25s ease, loops 5-38s ease-in-out/linear — três famílias, nunca misturadas no mesmo elemento. «index(181).css:150-153;index(116).css:38»
ND-8095. Rotação 45° é o gesto universal de "ação": disc do botão, seta de card, ícone de adicionar — um gesto só para affordance. «kroma(1).css:113-115;index(181).css:83;index(21).css:60»
ND-8096. Hover de card escuro: brightness(1.06) + translate 0 -9px (orbit-card) — claridade como lift no dark. «index(115).css:117-118»
ND-8097. Stagger implícito por nth-child: barras (nth-child 2n/3n tonalidade), módulos (nth-child(2) translateY(-17px), 3n/4 opacity) — ritmo sem JS. «index(166).css:132-133;index(181).css:147-149»

### Grupo AE — Regras do devthink aplicáveis (do designe/system prompts) «designe.txt;V25»

ND-8098. Página gerada embute o plano: primeiro elemento do body é o page-plan JSON; todo componente recebe data-component-id/name/category — página auto-documentada. «designe.txt:48114-48135»
ND-8099. Página editável por componente: instruções de edição nunca regeneram o site inteiro, só o componente alvo com novo id. «designe.txt:48120-48125»
ND-8100. Modo automático do builder: orquestrar seções master artboard imersivas com micro/macro groupings, priorizando impacto visual sobre quantidade. «designe.txt:36246-36251»
ND-8101. Regra das 3+3 cores vale para TODA página gerada; oklch recomendado nas fichas de cor. «V25:605;616»
ND-8102. Todo site gerado precisa de: modo noturno completo, bilingual PT/EN funcional, responsividade 320-1920px, persistência local + sync — UI sem backend real ainda assim entrega isso. «V25:613;567-568»
ND-8103. Biblioteca de estilos A-R..S-261 do masterclass = base de "arquétipos por produto" para o gerador escolher antes de codar. «designe.txt:63;379;V25:616»

### Grupo AF — CSS blobs: seções avançadas dos 15 maiores (mobiliário CSS) «*.css»

ND-8104. Hero escuro radial com grid mascarado: background radial-gradient(circle at 50% 20%, #0d1527, var(--obsidian) 70%) + grid hairline 64px com mask radial elíptico (fundo some nas bordas). «index(138).css:379-396»
ND-8105. Ambient glow central: elipse 600×300px com 2 radiais sobrepostas (ciano .15 + lime .08) e blur 80px atrás do headline. «index(138).css:397-407»
ND-8106. Interactive toggle no headline: pill 76×42px com ball 34px lime que ganha box-shadow 0 0 20px rgba(lime,.4) quando .active — toggle embutido na frase. «index(138).css:453-477»
ND-8107. Gradient highlight de headline: background-clip text com linear-gradient(90deg, #fff 0%, #cbd5e1 50%, var(--lime) 100%) — palavra com degradê de legibilidade. «index(138).css:478-483»
ND-8108. Deck-cutout shelf: plataforma #080d17 radius 36px com sombra 0 30px 60px preta .7 segurando 3 cards com gradiente 135deg escuro colorido e borda rgba accent .3. «index(138).css:545-587»
ND-8109. Metric card ultramarine: fundo #1838e0 com sombra colorida 0 20px 40px rgba(24,56,224,.35) e número 110px weight 900 lh .85 — "bloco de impacto" cor-cheia. «index(138).css:37-93»
ND-8110. Search form em bloco único: grid 4 campos com divisórias border-left, labels mono 6.5-7px e submit circular 46-57px — busca como "console" horizontal. «index(21).css:115-126;index(147).css:48-61»
ND-8111. Destination card com tone-mix: scrim color-mix(in srgb, var(--destination-tone) 75%, transparent) de 35%→100% — gradiente que derrete na cor do tema do card. «index(147).css:75-79»
ND-8112. Focus-within de campo de busca: outline 1px offset 8px radius 4px no wrapper quando o input ganha foco — foco no bloco, não no input. «index(147).css:55»
ND-8113. Curation mini-cards com clip-path por SVG url(#alto-slant) — formas recortadas reusáveis via defs inline. «index(147).css:128-133»
ND-8114. Atlas dark técnico: seção #1f3034 com radius-top 35px, route controls reais e paper aninhado — "dark technical surface" como contrast section. «index(147).css:148-150»
ND-8115. Phone mockup com moldura metálica: linear-gradient(130deg, 6 stops cinza) na moldura 247×475px radius 37px + botão lateral ::before 3×35px. «index(115).css:86-91»
ND-8116. Camera notch de phone: 53×15px #24252d radius inferior 13px com speaker 22×3px e lente 5px inset —.Dynamic Island CSS. «index(115).css:89-91»
ND-8117. Phone sheet flutuante: white-sheet radius 18px margin-top -12px sobrepondo a imagem — card que "sobe" sobre a mídia. «index(115).css:105»
ND-8118. Hinge de fold device: linha horizontal 4px gradiente vertical translúcido no meio do phone — silhueta de dobrável. «index(115).css:116»
ND-8119. Orbit cards laterais: cards 221×258px rotacionados ±11° flanqueando o phone com translate por calc(50% ± 355px) — composição orbital. «index(115).css:117-130»
ND-8120. Week chart mini: colunas flexíveis com track #f1edf7 e fill violeta radius 5px min-height 4px + labels mono 5px. «index(115).css:136-141»
ND-8121. Grain ring decorativo: círculo 560px rotacionado -22° com box-shadow 0 0 0 29px e 57px (anéis duplos translúcidos). «index(115).css:5»
ND-8122. Planner quiz panel: fundo #faf8fe com borda branca e inset 0 1px 1px #fff — "papel iluminado por dentro". «index(115).css:11»
ND-8123. Planner sculpture com mix-blend multiply: imagem com multiply sobre fundo lilás #d6c9ee e recorte clip-path url(#mova-cut). «index(115).css:59-60»
ND-8124. Play-button atravessando a borda: círculo 59px com borda 5px da cor da SEÇÃO posicionado top -56px — elemento "costurando" duas superfícies. «index(115).css:67»
ND-8125. Grain da seção com direção: mask-image linear-gradient(90deg, transparent 65%, #000) — grão que nasce só num lado. «index(115).css:4»
ND-8126. Quiz count mono: contador 14px mono com span 9px muted — metadado de progresso tipográfico. «index(115).css:14-15»
ND-8127. Time options como tiles: grid 2 col, número 37px tracking -1.6px, radio absoluto no canto — seleção de duração como cartão. «index(115).css:37-42»
ND-8128. Header sticky editorial: position sticky top 0 com fundo translúcido #f4f4edf0 blur 18px e altura 88px — alternativa sem fixed ao header flutuante. «index(181).css:2-3»
ND-8129. Experience cards com offset vertical: margens-top 39/0/72px em grid 3 col — ritmo escalonado de coluna. «index(21).css:182-187»
ND-8130. Section corner-step: faixa 30% × 23px no topo-direito da seção dark com clip-path polygon(0 0,100% 0,100% 100%,23px 100%) — "degrau" de entrada. «index(21).css:171»
ND-8131. Heading com spark: ícone 0.38em alinhado ao topo (align-self flex-start) depois da palavra — assinatura de asterisco em headline. «index(21).css:173-174;index(181).css:13»
ND-8132. Save-button glass sobre mídia: círculo 33px glass rgba(245,244,237,.67) blur 10px que fica lime quando is-saved. «index(21).css:150-151»
ND-8133. Stay-card chamfer: mídia com clip-path url(#aura-chamfer) e hover scale 1.06 em .8s — recorte geométrico custom por SVG defs. «index(21).css:144-148»
ND-8134. Mob quadriculado do hero CREON: grid 90px rgba(#fff,.08) com mask radial em 60% 45% + blooms radiais 440/300px blur 75px. «index(1).css:108-112»
ND-8135. Rail vertical CREON: coluna fixa 62px com border-right rgba(#fff,.07), rail-menu de 3 traços lime (2º 17px), rail-index mono e brand em writing-mode vertical. «index(1).css:84-91»
ND-8136. Chat bubbles CSS: pílula 11px radius com cauda ::after 11px rotate(45deg) colorida por variante — mini-mensagens decorativas. «index(1).css:76-81»
ND-8137. Pills de chat skeleton: bolinhas de "texto" 90/56px #c9cfe8 radius 4px com offset alternado (chat-pill--offset margin-left 60px) — mock de conversa. «index(104).css:149-156»
ND-8138. Kbd pill em busca: kbd mono 7px com borda e radius 4px dentro do input global — dica de atalho embutida. «sol-panels:141-145»
ND-8139. Global search underline: input full-width com border-bottom hairline que fica lime no :focus-within — busca editorial. «sol-panels:141-143»
ND-8140. Reference list accordion: details/summary com ref-id mono teal, título 24px e chevron rotate 180 no [open]; corpo grid 2 col padding-left 35px. «sol-panels:207-220»
ND-8141. Success pulse circle: círculo 76px lime com ícone dark como confirmação de formulário. «sol-panels:168»
ND-8142. Plan summary band: faixa #e8ecdd radius 14px com preço 29px e small de unidade — resumo com "preço-assinatura". «sol-panels:169-175»
ND-8143. Danger zone: botão inline-flex com borda rgba(#c597,.35) e hover bg #f0e0d3 — destrutivo sem vermelho saturado. «sol-panels:190-193»
ND-8144. Profile art tile: quadrado 71px radius 22px rotate(-7deg) com ícone — avatar-art abstrato. «sol-panels:194»
ND-8145. Vortex quote block: citação com border-left 4px lime radius 0 16px 16px 0 e quote-icon — pull-quote no dark. «vortex-panels:106-120»
ND-8146. Dialog header bar: barra própria #0d1422 com badge mono lime e close circular .08 branca — dialog com "titlebar" de app. «vortex-panels:28-59»
ND-8147. Stat huge lime: número 54px lime dentro de stat-box glass rgba(#fff,.03) — métrica hero em dialog. «vortex-panels:90-104»
ND-8148. Split photo col: coluna 260px com foto 340px e camada absoluta — layout de perfil em dialog. «vortex-panels:140-150» (ghost-btn secundário 999px com borda .2 no mesmo painel)
ND-8149. Course progress em dialog: barra 4px com span interno violeta transition width .4s + enroll pill que muda bg quando .enrolled. «index(174).css:87-100»
ND-8150. Lesson exercise box: bloco #e8ddf3 radius 15px borda #d7c5e7 com label mono 7px e CTA text-link — destaque de exercício dentro da aula. «index(174).css:107-111»

---


### SPECS CSS 31..60 (verbatim, fontes citadas)


> Continuação das SPECs 1-30 da onda5. Padrões NOVOS, verbatim das fontes. Cada spec: nome + código verbatim + fonte.

### SPEC 31: Sistema de 5 temas Neo DevThink (tokens por metáfora + app overrides)
Fonte: /home/z/neo/neodevthink/theme-default(1).css, theme-dark(1).css, theme-sunset-royal(1).css, theme-nordic-forest(1).css, theme-pitch-black(1).css (integrais)
```css
/* Fallback / Default Theme (Light Glass Theme) */
:root, .theme-default {
  --color-snow: #FFFFFF;
  --color-ghost: #F8F9FB;
  --color-moss: #E8EDE7;
  --color-obsidian: #1A1A1B;
  --color-accent-sky: #7EB6FF;
  --color-accent-peach: #FFB38E;
  --color-accent-lime: #D4FF80;
  --color-accent-orange: #FF5C00;
  --bg-app-outside: #E6E8F3;
  --bg-app-container: rgba(255, 255, 255, 0.4);
  --bg-app-card: rgba(255, 255, 255, 0.8);
  --border-app-accent: rgba(255, 255, 255, 0.6);
  --text-active: #1A1A1B;
  --text-muted: rgba(26, 26, 27, 0.6);
  --selection-color: rgba(255, 92, 0, 0.3);
  --backdrop-blur: blur(50px) saturate(200%);
  --shadow-premium: 0 40px 80px -20px rgba(0, 0, 0, 0.1),
                    0 10px 30px -10px rgba(0, 0, 0, 0.1);
}

/* Obsidian Night Theme (Sleek dark theme) */
.theme-dark {
  --color-snow: #0D111A;  --color-ghost: #080A0F;  --color-moss: #171E2D;  --color-obsidian: #F1F5F9;
  --color-accent-sky: #38BDF8;  --color-accent-peach: #FB7185;  --color-accent-lime: #34D399;  --color-accent-orange: #FF6B00;
  --bg-app-outside: #05070B;  --bg-app-container: rgba(13, 17, 26, 0.45);
  --bg-app-card: rgba(13, 17, 26, 0.75);  --border-app-accent: rgba(255, 255, 255, 0.1);
  --text-active: #F1F5F9;  --text-muted: rgba(241, 245, 249, 0.6);
  --selection-color: rgba(56, 189, 248, 0.3);
  --backdrop-blur: blur(50px) saturate(180%);
  --shadow-premium: 0 40px 80px -20px rgba(0, 0, 0, 0.6),
                    0 10px 30px -10px rgba(0, 0, 0, 0.4);
}

/* Sunset Royal Theme */
.theme-sunset-royal {
  --color-snow: #130D22;  --color-ghost: #0A0614;  --color-moss: #22173B;  --color-obsidian: #F5E8FFDB;
  --color-accent-sky: #A78BFA;  --color-accent-peach: #FFA3A5;  --color-accent-lime: #FCD34D;  --color-accent-orange: #EC4899;
  --bg-app-outside: #06030B;  --bg-app-container: rgba(19, 13, 34, 0.45);
  --bg-app-card: rgba(10, 6, 20, 0.75);  --border-app-accent: rgba(167, 139, 250, 0.15);
  --text-active: #F5E8FF;  --text-muted: rgba(245, 232, 255, 0.65);
  --selection-color: rgba(236, 72, 153, 0.3);
  --backdrop-blur: blur(50px) saturate(200%);
  --shadow-premium: 0 40px 80px -20px rgba(10, 3, 20, 0.6),
                    0 10px 30px -10px rgba(10, 3, 20, 0.4);
}

/* Nordic Sage & Forest Theme */
.theme-nordic-forest {
  --color-snow: #1E2322;  --color-ghost: #151918;  --color-moss: #2A312E;  --color-obsidian: #E8F1ECE1;
  --color-accent-sky: #83C5BE;  --color-accent-peach: #E29578;  --color-accent-lime: #4D9080;  --color-accent-orange: #F57251;
  --bg-app-outside: #0F1212;  --bg-app-container: rgba(30, 35, 34, 0.45);
  --bg-app-card: rgba(21, 25, 24, 0.75);  --border-app-accent: rgba(131, 197, 190, 0.15);
  --text-active: #E8F1EC;  --text-muted: rgba(232, 241, 236, 0.65);
  --selection-color: rgba(131, 197, 190, 0.3);
  --backdrop-blur: blur(50px) saturate(150%);
  --shadow-premium: 0 40px 80px -25px rgba(0, 0, 0, 0.5),
                    0 10px 30px -10px rgba(0, 0, 0, 0.3);
}

/* True AMOLED Pitch Black Theme */
.theme-pitch-black {
  --color-snow: #000000;  --color-ghost: #050505;  --color-moss: #0B0B0C;  --color-obsidian: #FFFFFF;
  --color-accent-sky: #00E5FF;  --color-accent-peach: #FF007F;  --color-accent-lime: #39FF14;  --color-accent-orange: #FF5A00;
  --bg-app-outside: #000000;  --bg-app-container: rgba(5, 5, 5, 0.9);
  --bg-app-card: rgba(0, 0, 0, 0.95);  --border-app-accent: rgba(255, 255, 255, 0.15);
  --text-active: #FFFFFF;  --text-muted: rgba(255, 255, 255, 0.65);
  --selection-color: rgba(0, 229, 255, 0.35);
  --backdrop-blur: blur(40px) saturate(220%);
  --shadow-premium: 0 0 40px rgba(255, 255, 255, 0.05);
}
```

### SPEC 32: Botão-pill com disc giratório 45° (família k-btn/vortex-btn/m-button/c-button)
Fonte: /home/z/neo/neodevthink/kroma(1).css:34-115; ídem index(138).css:120-187, index(1).css:55-68
```css
.k-btn {
  display: inline-flex; gap: 18px; justify-content: space-between; align-items: center;
  border-radius: 999px; padding: 6px 6px 6px 20px; min-height: 46px;
  font-size: 12px; font-weight: 600; transition: transform 0.25s, background 0.25s;
  white-space: nowrap;
}
.k-btn:hover:not(:disabled) { transform: translateY(-2px); }
.btn-lime { background: var(--lime); color: var(--ink); }
.btn-black { background: var(--ink); color: var(--paper); }
.btn-outline { background: transparent; color: inherit; border: 1px solid rgba(255,255,255,.24); }
.btn-disc {
  border-radius: 50%; width: 34px; height: 34px; display: grid; place-items: center;
  flex-shrink: 0; transition: transform 0.3s;
}
.btn-lime .btn-disc { background: var(--ink); color: var(--lime); }
.btn-black .btn-disc { background: rgba(255,255,255,.15); color: #fff; }
.k-btn:hover:not(:disabled) .btn-disc { transform: rotate(45deg); }
```

### SPEC 33: Header-pill flutuante com estado scrolled
Fonte: kroma(1).css:305-334
```css
.kroma-header { position: fixed; top: 20px; left: 24px; right: 24px; z-index: 100; transition: top 0.3s; }
.header-pill-container {
  max-width: 1340px; margin-inline: auto; height: 66px; padding: 0 10px 0 24px;
  display: flex; align-items: center; gap: 24px; border-radius: 999px;
  background: rgba(11,13,16,.76); border: 1px solid rgba(255,255,255,.14);
  backdrop-filter: blur(24px); box-shadow: 0 10px 35px rgba(0,0,0,.35);
  transition: background .3s, border-color .3s;
}
.kroma-header.is-scrolled .header-pill-container {
  background: rgba(11,13,16,.94); border-color: rgba(255,255,255,.2);
}
```

### SPEC 34: Badge circular giratório (textPath + centro)
Fonte: kroma(1).css:173-233
```css
.circ-badge { display: block; position: relative; width: 104px; height: 104px; }
.circ-badge svg { width: 100%; height: 100%; animation: badgeSpin 14s linear infinite; }
.circ-badge text { fill: currentColor; font-family: var(--mono); font-size: 8px; letter-spacing: 1.2px; }
.badge-center {
  position: absolute; inset: 0; display: flex; flex-direction: column;
  align-items: center; justify-content: center; text-align: center;
}
.badge-lime { background: var(--lime); color: var(--ink); border-radius: 50%; }
@keyframes badgeSpin { to { transform: rotate(360deg); } }
```

### SPEC 35: Waveform visualizer (equalizador CSS puro)
Fonte: kroma(1).css:275-303
```css
.waveform-visualizer { display: inline-flex; align-items: center; gap: 2.5px; height: 20px; }
.waveform-bar {
  display: block; width: 2.5px; height: var(--h, 30%);
  background: var(--wave-c, #c8ff45); border-radius: 2px; transition: height 0.2s;
}
.waveform-visualizer.is-playing .waveform-bar {
  animation: wavePulse 0.8s ease-in-out infinite alternate;
}
@keyframes wavePulse { 0% { height: 15%; } 100% { height: var(--h, 90%); } }
```

### SPEC 36: Radar achievement widget (anéis SVG + ícones-orbit)
Fonte: kroma(1).css:87-195
```css
.radar-achievement-widget {
  display: flex; align-items: center; gap: 28px; margin-top: 48px; padding: 24px;
  border-radius: 24px; background: #eef2f6; border: 1px solid #dfe5ec;
}
.radar-ring-container { position: relative; width: 130px; height: 130px; flex-shrink: 0; }
.radar-track-outer, .radar-track-mid, .radar-track-inner { fill: none; stroke: rgba(0,0,0,.08); stroke-width: 1.2; }
.radar-active-stroke {
  fill: none; stroke: #c8ff45; stroke-width: 3.5; stroke-linecap: round;
  transform: rotate(-90deg); transform-origin: center;
}
.radar-center-btn {
  position: absolute; inset: 0; margin: auto; width: 80px; height: 80px;
  border-radius: 50%; background: #fff; box-shadow: 0 8px 24px rgba(0,0,0,.1);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  transition: transform 0.2s;
}
.radar-orbit-icon {
  position: absolute; width: 26px; height: 26px; border-radius: 50%; background: #fff;
  box-shadow: 0 4px 12px rgba(0,0,0,.1); display: grid; place-items: center; color: var(--ink);
}
.icon-top { top: 0; left: 50%; transform: translateX(-50%); }
.icon-right { right: 0; top: 50%; transform: translateY(-50%); }
.icon-bottom { bottom: 0; left: 50%; transform: translateX(-50%); }
.icon-left { left: 0; top: 50%; transform: translateY(-50%); }
```

### SPEC 37: Serpentine chain grid (nós de geometria mista)
Fonte: kroma(1).css:252-349
```css
.serpentine-chain-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; position: relative; }
.chain-node { border-radius: 36px; display: flex; align-items: center; justify-content: center;
  box-shadow: 0 16px 40px rgba(0,0,0,.08); transition: transform 0.25s; }
.node-blue-circle { aspect-ratio: 1; background: linear-gradient(145deg,#3870ff,#2554d6); color: #fff; }
.node-yellow-capsule { grid-column: span 2; background: linear-gradient(145deg,#ffc46b,#f3a83b); color: var(--ink); padding: 24px; }
.node-orange-capsule { grid-column: span 2; background: linear-gradient(145deg,#ff6b4a,#ff4d6d); color: #fff; padding: 24px; }
.node-magenta-vertical { background: linear-gradient(180deg,#ff4d9d,#6d5bff); color: #fff; flex-direction: column; gap: 16px; padding: 24px; }
.node-green-circle { aspect-ratio: 1; background: linear-gradient(145deg,#c8ff45,#9ce622); color: var(--ink); }
.node-teal-grid { aspect-ratio: 1; background: linear-gradient(145deg,#34e2ea,#1ab8c0); color: var(--ink); }
```

### SPEC 38: Aurora pods com glow por estado (--glow-color)
Fonte: kroma(1).css:421-475
```css
.aurora-pods-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; }
.aurora-pod-card {
  position: relative; border-radius: 24px; background: #11141c;
  border: 1px solid rgba(255,255,255,.1); padding: 14px; cursor: pointer;
  overflow: hidden; box-shadow: 0 16px 40px rgba(0,0,0,.35);
  transition: transform 0.3s, border-color 0.3s;
}
.aurora-pod-card.is-selected {
  border-color: rgba(255,255,255,.4);
  box-shadow: 0 20px 50px var(--glow-color);
}
.pod-light-chamber { position: relative; height: 200px; border-radius: 18px; overflow: hidden; }
.chamber-glow-beam {
  position: absolute; bottom: 0; left: 50%; transform: translateX(-50%);
  width: 80%; height: 80%;
  background: radial-gradient(ellipse at 50% 100%, #fff 0%, transparent 70%);
  opacity: 0.7;
}
```

### SPEC 39: Laptop 3D mockup 100% CSS
Fonte: kroma(1).css:638-696 + 800-825 (notch/trackpad)
```css
.brutalist-concrete-block {
  position: relative; width: 380px; height: 240px; background: #8e9598; border-radius: 12px;
  transform: rotate(-4deg) perspective(1000px) rotateX(16deg);
  box-shadow: 0 30px 60px rgba(0,0,0,.35);
}
.laptop-lid { height: 220px; background: #1a1e22; border-radius: 14px 14px 0 0; padding: 8px;
  box-shadow: 0 20px 50px rgba(0,0,0,.5); }
.laptop-screen-bezel { height: 100%; border-radius: 8px; overflow: hidden; background: #000; position: relative; }
.laptop-camera-notch {
  position: absolute; top: 0; left: 50%; transform: translateX(-50%);
  width: 40px; height: 6px; background: #1a1e22; border-radius: 0 0 4px 4px; z-index: 10;
}
.laptop-base-chassis { height: 16px; background: #343b42; border-radius: 0 0 12px 12px; position: relative; }
.laptop-trackpad {
  position: absolute; top: 2px; left: 50%; transform: translateX(-50%);
  width: 60px; height: 8px; background: #252b30; border-radius: 2px;
}
```

### SPEC 40: Botão-cunha com notch clip-path
Fonte: kroma(1).css:428-456
```css
.angled-lime-notch-btn {
  display: inline-flex; align-items: center; gap: 20px; padding: 14px 28px;
  border-radius: 14px; background: var(--lime); color: var(--ink);
  font-family: var(--display); font-size: 14px; font-weight: 700; letter-spacing: -0.02em;
  clip-path: polygon(0 0, 100% 0, 92% 100%, 0 100%);
  transition: transform 0.25s;
}
.angled-lime-notch-btn:hover { transform: translateX(4px); }
.notch-arrow-disc {
  width: 32px; height: 32px; border-radius: 50%; background: var(--ink);
  color: var(--lime); display: grid; place-items: center;
}
```

### SPEC 41: Range input bicolor (gradiente no track + thumb com borda do 2º stop)
Fonte: kroma(1).css:394-413; ídem index(166).css:36-39
```css
.bicolor-range-input {
  width: 100%; height: 8px; border-radius: 999px; appearance: none;
  background: linear-gradient(90deg, #fe6839 0%, #261af6 100%);
  outline: 0; cursor: pointer;
}
.bicolor-range-input::-webkit-slider-thumb {
  appearance: none; width: 22px; height: 22px; border-radius: 50%;
  background: rgba(255,255,255,.9); border: 2px solid #261af6;
  box-shadow: 0 4px 12px rgba(0,0,0,.2); cursor: pointer;
}
/* variante console (SOLAR) */
.hours-slider > input { appearance: none; width: 100%; height: 3px; background: #69805a4d;
  border-radius: 3px; margin: 19px 0 12px; accent-color: #dd925f; cursor: pointer; }
.hours-slider > input::-webkit-slider-thumb {
  appearance: none; background: #eca06c; border: 2px solid #f6d7aa;
  border-radius: 50%; width: 11px; height: 11px; box-shadow: 0 0 0 4px #db9b5430;
}
```

### SPEC 42: Wallet central glass + satélites-pill com dot neon
Fonte: kroma(1).css:446-511
```css
.satellite-pill-card {
  display: flex; align-items: center; gap: 12px; padding: 12px 18px; border-radius: 999px;
  background: rgba(16,25,36,.85); border: 1px solid rgba(255,255,255,.14);
  backdrop-filter: blur(16px); box-shadow: 0 16px 40px rgba(0,0,0,.3);
}
.green-dot { background: #34e2ea; box-shadow: 0 0 10px #34e2ea; }
.pink-dot { background: #ff4d9d; box-shadow: 0 0 10px #ff4d9d; }
.central-glass-wallet-card {
  width: 480px; padding: 28px; border-radius: 28px;
  background: rgba(14,23,34,.88); border: 1px solid rgba(52,226,234,.3);
  backdrop-filter: blur(24px);
  box-shadow: 0 24px 70px rgba(0,0,0,.5), 0 0 30px rgba(52,226,234,.15);
}
.digital-card-mockup {
  height: 100px; border-radius: 16px;
  background: linear-gradient(135deg, #184252, #10606e);
  border: 1px solid rgba(255,255,255,.2); padding: 14px;
}
```

### SPEC 43: Footer colossal wordmark + asterisco giratório
Fonte: kroma(1).css:487-506
```css
.footer-colossal-wordmark {
  display: flex; justify-content: space-between; align-items: center;
  font-family: var(--display); font-size: clamp(140px, 25vw, 360px);
  font-weight: 700; letter-spacing: -0.09em; line-height: 0.88;
  padding: 30px 0 40px; margin-left: -8px; user-select: none;
}
.footer-spinning-asterisk {
  width: 16%; height: auto; color: var(--lime);
  animation: badgeSpin 20s linear infinite;
}
```

### SPEC 44: Header-glass com canto cortado (vidro separado do conteúdo)
Fonte: index(21).css:73-75 + index(150).css:84-87
```css
/* AURA: canto superior-direito chanfrado */
.header-glass {
  position: absolute; z-index: -1; inset: 0; border: 1px solid #ffffffe0; border-radius: 19px;
  background: #f5f4edd9; box-shadow: 0 12px 30px #10251b14; backdrop-filter: blur(20px);
  clip-path: polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 0 100%);
}
/* MOVA: canto inferior-esquerdo cortado, vidro no ::before da shell */
.nav-shell::before {
  content: ''; position: absolute; inset: 0; border-radius: 16px;
  background: #171a16b8; border: 1px solid #f2f5de26; backdrop-filter: blur(24px);
  clip-path: polygon(0 0, 100% 0, 100% 100%, 18px 100%, 0 calc(100% - 18px));
  z-index: -1; box-shadow: 0 10px 35px #00000013;
}
```

### SPEC 45: Cortes de canto invertidos (paper "mordendo" a mídia)
Fonte: index(104).css:62-64; index(21).css:111-112; index(116).css:62-64
```css
/* quadrado papel com canto invertido via box-shadow deslocado */
.project-cutout {
  display: block; position: absolute; right: 0; bottom: 0;
  width: 83px; height: 83px; border-top-left-radius: 29px; background: var(--paper);
}
.project-cutout::before, .project-cutout::after {
  content: ''; position: absolute; width: 24px; height: 24px;
  border-bottom-right-radius: 24px; box-shadow: 12px 12px 0 11px var(--paper);
}
/* faixa de rodapé do hero */
.hero-bottom-cut {
  position: absolute; right: 0; bottom: 0; width: 16%; height: 28px;
  border-top-left-radius: 26px; background: var(--paper);
}
.hero-bottom-cut::before {
  content: ''; position: absolute; left: -24px; bottom: 0; width: 24px; height: 24px;
  border-bottom-right-radius: 24px; box-shadow: 12px 12px 0 11px var(--paper);
}
/* regra com radial-gradient no canto */
.hero-edge::after {
  content: ''; height: 26px; width: 26px; position: absolute; left: 100%; bottom: 0;
  background: radial-gradient(circle at 100% 0, transparent 25px, var(--ink) 26px);
}
```

### SPEC 46: Active-tab que ponteia a borda superior da nav (cantos côncavos)
Fonte: index(147).css:13-16
```css
.active-tab {
  position: absolute; top: -10px; left: 50%;
  transform: translateX(-50%) scaleX(0); width: 31px; height: 7px;
  background: var(--coral); border-radius: 0 0 7px 7px; transition: transform .25s;
}
.nav-links > a.active .active-tab { transform: translateX(-50%) scaleX(1); }
.active-tab::before {
  content: ''; position: absolute; top: 0; left: -6px; width: 6px; height: 6px;
  background: radial-gradient(circle at 0 100%, transparent 5px, var(--coral) 6px);
}
.active-tab::after {
  content: ''; position: absolute; top: 0; right: -6px; width: 6px; height: 6px;
  background: radial-gradient(circle at 100% 100%, transparent 5px, var(--coral) 6px);
}
```

### SPEC 47: Botão-surpresa com anéis-eco concêntricos
Fonte: index(21).css:177-181
```css
.surprise-button {
  position: relative; display: flex; align-items: center; gap: 12px;
  padding: 10px 17px 10px 11px; min-height: 46px; transform: rotate(-3deg);
  border-radius: 999px; background: var(--lime); color: var(--pine);
  font-size: 10px; font-weight: 600;
}
.surprise-button::before, .surprise-button::after {
  content: ''; position: absolute; pointer-events: none; inset: -4px;
  border: 1px solid #d9ef8555; border-radius: inherit;
}
.surprise-button::after { inset: -8px; border-color: #d9ef8525; }
```

### SPEC 48: Stamp circular com anel dashed (join sticker)
Fonte: index(138).css (c3):17-54
```css
.circular-stamp-join {
  position: absolute; top: 100px; right: 40px; width: 100px; height: 100px;
  border-radius: 50%; background: #05070a; color: #fff; border: 3px dashed #fff;
  display: grid; place-items: center; cursor: pointer;
  transform: rotate(-12deg); transition: transform 0.2s;
}
.circular-stamp-join:hover { transform: rotate(0deg) scale(1.05); }
.stamp-tiny { display: block; font-size: 8px; font-family: var(--mono-font); color: var(--lime); }
.stamp-price { font-size: 20px; font-family: var(--display-font); color: #fff; }
/* selo giratório com texto circular */
.round-seal { position: relative; display: grid; place-items: center; width: 100px; height: 100px; color: #849583; }
.round-seal > svg:first-child { position: absolute; inset: 0; height: 100%; width: 100%;
  animation: seal-spin 34s linear infinite; }
.round-seal text { font: 7px/1 var(--mono); fill: currentColor; letter-spacing: 1.7px; }
@keyframes seal-spin { to { transform: rotate(360deg); } }
```

### SPEC 49: Stadium columns (pílulas-foto com offsets e badge na interseção)
Fonte: index(138).css:513-608
```css
.collective-stadium-mosaic { display: flex; gap: 16px; justify-content: center; height: 520px; }
.stadium-column-card { width: 90px; height: 100%; cursor: pointer; position: relative; }
.stadium-pill-shell {
  width: 100%; height: 100%; border-radius: 999px; overflow: hidden; position: relative;
  box-shadow: 0 16px 30px rgba(0,0,0,.12); border: 3px solid #fff;
}
.col-stadium-0 { transform: translateY(40px); }
.col-stadium-1 { transform: translateY(-20px); }
.col-stadium-2 { transform: translateY(30px); }
.col-stadium-3 { transform: translateY(-10px); }
.col-stadium-4 { transform: translateY(50px); }
.stadium-intersection-badge {
  position: absolute; top: 45%; left: 50%; transform: translate(-50%, -50%);
  width: 36px; height: 36px; border-radius: 50%; display: grid; place-items: center;
  border: 3px solid #fff; font-size: 14px; color: #000;
}
.stadium-info-scrim {
  position: absolute; bottom: 24px; left: 0; right: 0; text-align: center;
  padding: 8px 4px; background: rgba(0,0,0,.65); color: #fff; backdrop-filter: blur(8px);
}
```

### SPEC 50: Fan de pastas 3D CSS (leque com aba e shine)
Fonte: index(104).css:70-86
```css
.folder-fan { position: relative; height: 360px; margin-top: 54px; }
.folder {
  position: absolute; bottom: 0; width: 208px; height: 236px; border-radius: 20px;
  text-align: left; box-shadow: 0 -18px 40px #14141214, inset 0 3px 8px #ffffff66;
  transition: transform 0.3s;
}
.folder::before {
  content: ''; position: absolute; top: -17px; left: 26px; width: 88px; height: 32px;
  background: inherit; border-radius: 12px 18px 0 0;
}
.folder:hover { transform: translateY(-14px) rotate(0deg) !important; z-index: 6; }
.folder--movimento { left: 4%; transform: rotate(-11deg); z-index: 1; }
.folder--formas { left: 21%; transform: rotate(-5deg); z-index: 2; }
.folder--arquivo { left: 50%; transform: translateX(-50%); width: 236px; height: 258px; z-index: 4; }
.folder--pesquisa { right: 21%; transform: rotate(5deg); z-index: 2; }
.folder--viagens { right: 4%; transform: rotate(11deg); z-index: 1; }
.folder-shine { position: absolute; inset: 0; border-radius: inherit;
  background: linear-gradient(115deg, #ffffff55 0%, transparent 35%); pointer-events: none; }
```

### SPEC 51: Headline de word-pills coloridas com rotação
Fonte: index(104).css:37-47
```css
.pill-line {
  display: flex; align-items: center; justify-content: center; gap: 0.28em; flex-wrap: wrap;
  font-family: var(--font-chunky); font-weight: 800;
  font-size: clamp(54px, 9vw, 118px); line-height: 1.02; letter-spacing: -0.04em;
}
.word-pill { display: inline-flex; align-items: center; gap: 0.18em;
  padding: 0.06em 0.55em 0.12em; border-radius: 999px; }
.word-pill--indigo { background: var(--indigo); color: #fff;
  box-shadow: 0 16px 40px #2d2bf055, inset 0 2px 6px #ffffff55; transform: rotate(-1.5deg); }
.word-pill--lime { background: var(--lime); color: var(--ink);
  box-shadow: 0 16px 40px #a8cc1433, inset 0 2px 6px #ffffff88; transform: rotate(1deg); }
.pill-orb { display: inline-grid; place-items: center; width: 0.72em; height: 0.72em;
  border-radius: 50%; background: #fff; box-shadow: inset 0 0 0 2px #14141212; }
```

### SPEC 52: Hero blob estrela 12 pontos + torus mascarado + dashmarch
Fonte: index(104).css:20-36
```css
.hero-blob {
  position: absolute; left: 50%; top: 120px; width: min(720px, 94vw); height: 460px;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #ffd9a8, #ff8a2a 55%, #ff5a00);
  opacity: 0.5; filter: blur(70px);
  clip-path: polygon(8% 0, 38% 0, 50% 28%, 62% 0, 92% 0, 66% 50%, 92% 100%, 62% 100%, 50% 72%, 38% 100%, 8% 100%, 34% 50%);
  pointer-events: none;
}
.dash-march { animation: dashmarch 2.6s linear infinite; }
@keyframes dashmarch { to { stroke-dashoffset: -22; } }
.float-torus {
  left: 2%; top: 130px; width: 110px; height: 110px; border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #d8ccff, #8a4bff 45%, #3d1480 75%);
  -webkit-mask: radial-gradient(circle, transparent 33%, #000 35%);
  mask: radial-gradient(circle, transparent 33%, #000 35%);
  filter: drop-shadow(0 18px 24px #7c3aed44);
  animation: floaty 5s ease-in-out infinite;
}
@keyframes floaty { 0%, 100% { transform: translateY(-8px); } 50% { transform: translateY(10px); } }
```

### SPEC 53: Gauge SVG físico com glow no arco
Fonte: index(166).css:48-63
```css
.autonomy-gauge { position: relative; width: 256px; max-width: 100%; aspect-ratio: 1; margin: 19px auto 15px; }
.gauge-outer { fill: #222c1c2e; stroke: #c2c9a724; stroke-width: 1; }
.gauge-track { fill: none; stroke: #181f153f; stroke-width: 6; }
.gauge-tick { stroke: #c7d3b633; stroke-width: 1; }
.gauge-fill {
  fill: none; stroke: #ef9a63; stroke-width: 5; stroke-linecap: round;
  filter: drop-shadow(0 0 4px #ed863554);
  transition: stroke-dasharray .7s cubic-bezier(.2,.7,.2,1);
}
.gauge-center { position: absolute; inset: 0; display: flex; flex-direction: column;
  align-items: center; justify-content: center; }
.gauge-center > strong { font: 400 62px/1 var(--display); letter-spacing: -4px; color: #f0f1da; }
```

### SPEC 54: Ruído feTurbulence via SVG data-URI
Fonte: index(166).css:5; index(181).css:114
```css
.planner-noise {
  position: absolute; inset: 0; z-index: -1; opacity: .045; pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 140 140' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.78' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Cpath d='M0 0h140v140H0z' filter='url(%23grain)' opacity='.7'/%3E%3C/svg%3E");
  background-size: 140px;
}
.texture-grain::before {
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 160 160' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.86' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Cpath filter='url(%23n)' opacity='.6' d='M0 0h160v160H0z'/%3E%3C/svg%3E");
  background-size: 140px; opacity: calc(0.12 + var(--intensity) * 0.4); mix-blend-mode: multiply; z-index: 2;
}
```

### SPEC 55: Luzes estriadas/estragos de fundo (ribbed + streaks)
Fonte: index(166).css:78; index(104).css:110; kroma(1).css:366-380
```css
.ribbed-light {
  position: absolute; z-index: -1; left: 0; right: 0; height: 81%; top: 18%;
  background: repeating-linear-gradient(90deg,#ffffff5c 0px,#ffffff0a 2px,transparent 3px,transparent 6px),
    radial-gradient(ellipse at 22% 45%,#e9b7a473,transparent 55%),
    radial-gradient(ellipse at 75% 40%,#b4c6b087,transparent 62%),
    radial-gradient(ellipse at 45% 70%,#c3b9dc4f,transparent 60%);
  mask-image: linear-gradient(180deg,transparent,black 25%,black 60%,transparent);
}
.air-streaks {
  position: absolute; inset: 0; pointer-events: none;
  background: repeating-linear-gradient(90deg, transparent 0 46px, #5f7cff22 46px 62px, transparent 62px 120px);
  mask-image: linear-gradient(180deg, transparent, #000 25%, #000 80%, transparent);
}
.light-column {
  width: 120px; height: 100%;
  background: linear-gradient(180deg, #34e2ea 0%, rgba(52,226,234,.05) 50%, transparent 100%);
  filter: blur(40px);
}
```

### SPEC 56: Laboratório de materiais (--intensity controla chrome/glass/mesh/glow/depth)
Fonte: index(181).css:111-153
```css
.sculpture {
  width: 100%; height: 100%; position: relative; transform: rotate(-20deg);
  transition: border-radius 0.7s, clip-path 0.7s, background 0.7s; overflow: hidden;
}
.sculpture.material-chrome {
  background: radial-gradient(ellipse at 68% 16%, #ffffffed 0%, #edf7ff99 8%, transparent 30%),
    radial-gradient(ellipse at 32% 82%, var(--shape-color) 0%, transparent 55%),
    linear-gradient(137deg, #b5cde8 1%, #f3f9fc 13%, #7e9fc5 25%, #e9f6ff 39%, #5279bd 48%,
      #dceaf0 51%, #fcfefb 58%, #92bbdf 71%, #6b8dcc 79%, #e4f6fe 88%, #7c9bcc 100%);
  box-shadow: inset 5px 6px 10px #ffffffab, inset -8px -12px 20px #244e8280;
}
.sculpture.material-glass {
  background: linear-gradient(125deg, #ffffff9c, #f4ffff22 42%, #d8f5ff82);
  box-shadow: inset 2px 3px 6px #ffffffd9, inset -3px -4px 7px #8299b842;
  backdrop-filter: blur(calc(1px + var(--intensity) * 20px)); opacity: 0.85;
}
.sculpture.material-mesh {
  background: radial-gradient(at 15% 25%, #ceefae, transparent 55%),
    radial-gradient(at 82% 15%, #97ccff, transparent 55%),
    radial-gradient(at 25% 91%, var(--shape-color), transparent 60%),
    radial-gradient(at 91% 91%, #daa1e9, transparent 58%), #c8b9f3;
  filter: saturate(calc(0.35 + var(--intensity) * 1.4));
}
.sculpture.material-glow { background: var(--shape-color);
  box-shadow: inset 0 0 50px #ffffffaa; filter: brightness(calc(0.9 + var(--intensity) * 0.4)); }
.sculpture-wrapper:has(.material-glow) {
  filter: drop-shadow(0 0 calc(8px + var(--intensity) * 32px) var(--shape-color)); }
.sculpture.material-depth {
  transform: perspective(500px) rotateY(calc(-5deg - var(--intensity) * 35deg)) rotateX(15deg) rotate(-20deg);
  box-shadow: inset 4px 5px 10px #ffffffdd, inset -17px -22px 20px #2b518fa6;
}
.shape-angular { clip-path: polygon(24% 0, 79% 0, 100% 23%, 100% 76%, 76% 100%, 22% 100%, 0 76%, 0 24%); }
.is-moving > .sculpture { animation: material-float 7s ease-in-out infinite; }
@keyframes material-float { 0%, 100% { translate: 0 3px; } 50% { translate: 0 -8px; } }
@keyframes material-orbit { 0%, 100% { rotate: 0deg; translate: 0 4px; } 50% { rotate: 22deg; translate: 0 -12px; } }
```

### SPEC 57: Sound orb conic + closing notch mask
Fonte: index(174).css:154-160
```css
.closing-surface {
  position: absolute; inset: 0; z-index: -1; background: #24222a;
  border-radius: 29px 29px 0 0;
  mask: radial-gradient(circle 89px at 50% 0, transparent 98%, black 100%);
}
.sound-orb {
  position: absolute; left: 50%; top: -66px; transform: translateX(-50%);
  display: grid; place-items: center; width: 144px; height: 144px; border-radius: 50%;
  background: radial-gradient(ellipse at 25% 12%, #fff4ddeb, transparent 45%),
    radial-gradient(ellipse at 86% 80%, #6e4fcd, transparent 72%),
    conic-gradient(from -15deg, #f7b6a0, #c698e0, #7966de, #c6aff0, #b89aea, #f7b6a0);
  box-shadow: inset 4px 4px 7px #ffffffc4, inset -9px -7px 18px #6a57985c, 0 12px 24px #54426338;
}
.orb-inner {
  display: grid; place-items: center; width: 75px; height: 75px; border-radius: 50%;
  background: #ffffff23; box-shadow: inset 1px 1px 2px #ffffff5c; border: 1px solid #ffffff1c;
}
.sound-orb.orb-playing .orb-inner { animation: orb-pulse 2.5s ease-in-out infinite; }
@keyframes orb-pulse { 50% { box-shadow: 0 0 0 9px #ffffff0f; } }
```

### SPEC 58: Stat-card com tab-conector rotacionado 45°
Fonte: index(178).css:139-162
```css
.stat-card {
  background: #fff; border: 1px solid var(--grey-200); border-radius: 22px;
  padding: 28px 24px; position: relative; text-align: left;
  box-shadow: 0 14px 30px #0a0a0a08;
}
.stat-card::before {
  content: ''; position: absolute; top: -12px; left: 50%; width: 24px; height: 24px;
  background: #fff; border: 1px solid var(--grey-200); border-bottom-color: #fff;
  transform: translateX(-50%) rotate(45deg); border-radius: 4px;
}
.stat-card.star { background: var(--ink); color: #fff; border-color: var(--ink); }
.stat-card.star::before { background: var(--ink); border-color: var(--ink); border-bottom-color: var(--ink); }
.stat-card.lime { background: var(--lime); }
.stat-card.lime::before { background: var(--lime); border-color: var(--lime); border-bottom-color: var(--lime); }
```

### SPEC 59: CTA-burst com anéis em camadas + floaters 3D CSS
Fonte: index(178).css:1-31
```css
.cta-burst { position: relative; }
.cta-burst-layer { position: absolute; inset: -6px; border-radius: 999px;
  border: 1.5px solid var(--lime); pointer-events: none; }
.cta-burst-layer.l2 { inset: -12px; border-color: #e6ff4d77; }
.cta-burst-layer.l3 { inset: -18px; border-color: #e6ff4d44; }
.cta-burst-star { position: absolute; right: -38px; bottom: -10px; width: 56px; height: 56px;
  pointer-events: none; z-index: 2; filter: drop-shadow(0 6px 12px #00000020); }
.floater.shape-1 { top: 14%; left: 7%; width: 56px; height: 56px; background: var(--lime);
  border-radius: 16px; transform: rotate(18deg); box-shadow: inset -4px -6px 0 #00000014; }
.floater.shape-2 { top: 24%; right: 9%; width: 52px; height: 52px; background: var(--purple);
  border-radius: 50%; box-shadow: inset -4px -8px 14px #00000022; }
.floater.shape-3 { bottom: 20%; left: 5%; width: 44px; height: 44px; background: var(--magenta);
  clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%); }
.floater.shape-5 { top: 48%; left: 10%; width: 24px; height: 24px; background: var(--orange);
  clip-path: polygon(50% 0, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%); }
```

### SPEC 60: Liquid-glass recortado por path + dialog nativo com ::backdrop
Fonte: Qwen_css_20260729_hr6k0c6od.txt (12L) + mova-panels(1).css:1-5
```css
/* Corpo liquid glass — o div é recortado pelo path combinado (aba + caixa),
   então o blur/saturação só existem DENTRO do shape: o vidro fica ao redor
   da caixa, e a borda gradiente é a única aresta. */
@layer components {
  .liquid-glass-body {
    background: rgba(255, 255, 255, 0.16);
    backdrop-filter: blur(42px) saturate(190%);
    -webkit-backdrop-filter: blur(42px) saturate(190%);
    box-shadow:
      0 30px 70px -24px rgba(26, 26, 27, 0.22),
      0 8px 24px -10px rgba(26, 26, 27, 0.10);
  }
}
/* Dialog nativo com backdrop customizado */
.mova-dialog {
  padding: 0; margin: auto; border: 0; width: min(1040px, calc(100vw - 56px));
  max-height: calc(100dvh - 56px); background: transparent; overflow: visible;
}
.mova-dialog::backdrop { background: #080e0bb3; backdrop-filter: blur(12px); }
.dialog-panel {
  max-height: inherit; overflow-y: auto; overscroll-behavior: contain;
  background: var(--paper); border: 1px solid #ffffff82; border-radius: 27px;
  box-shadow: 0 28px 100px #0005; scrollbar-width: thin;
  scrollbar-color: #a0ad8e transparent;
}
```

---

## FASE 8a — apps restantes do acervo (fonte: neodocs-txt/outros.extension/akash/SoFlowX/ansi-art/gl/nathlan/soochimp/bob/iakadion/soodeska)

300 regras (ND-8201..8500) em 26 blocos A-Z: extensão devthink (background 16.8k linhas,
artifactinventory 67 CRXs, 335 kinds, evolutionroadmap 1.1.31→2.0.2, arquitetura 3 camadas,
MCP, native bridge, release multi-registry), akash (site builder AKASH_MANAGED + 28 componentes),
SoFlowX (Express+Socket.IO 3003, AI 9 providers), ansi-art (@devthink/ansi-art FIGlet/gradientes),
gl (Gambiarra Labs), nathlan (AKIA loader, three.js), soochimp (NewsChimp PWA), bob (MV2 bcoin-bns),
iakadion (hub). Pulos: 6 lockfiles, 4 bundles minificados, soodeska = stub 2 linhas (reservado).


### Bloco A — Identidade, boundary e arquitetura da extensão (ND-8201..8218)

ND-8201. O pacote da extensão é `@wenathlan/extension` no repositório `wenathlan/extension`, distribuído como biblioteca TypeScript reutilizável + um alvo Manifest V3 Chromium. «04.releasepipeline»
ND-8202. A extensão é um tool bridge controlado pelo usuário — nunca uma plataforma de controle hospedada. «03.extensionarchitecture»
ND-8203. Produto boundary 1.1.1: pode observar a active tab aprovada e preparar proposal tipada para endpoint configurado; nunca concede acesso blanket ao browser, lê cookies, usa debugger API, instala software nativo, bypassa CAPTCHA, contorna login ou executa ação sem o usuário selecionar proposta revisada. «03.extensionarchitecture»
ND-8204. Service workers de extensão são event-driven e NÃO são ambiente de compute 24h — agente always-on futuro deve ser processo separado hospedado com config, consent screen, monitoring e release review próprios. «03.extensionarchitecture;03.chromiumextensionarchitecture»
ND-8205. Três camadas de mensagem com trust boundary explícita: user surface (popup/sidepanel, input direto) → extension broker (background service worker, boundary de capability do manifest) → page bridge (script one-time da active tab, boundary de página aprovada). «03.extensionarchitecture»
ND-8206. O endpoint remoto opcional não é autoridade de comando: só submete plan proposal tipada depois de HTTPS configurado + host permission opcional concedida para aquele host exato. «03.extensionarchitecture»
ND-8207. O background broker rejeita comandos com sessão desconhecida, origin mismatch, approval expirada, action class unsafe ou schema version não suportada. «03.extensionarchitecture»
ND-8208. Exclusões deliberadas do manifest 1.1.1: debugger, cookies, webRequest, history, bookmarks, downloads, proxy, broad host access, native messaging, secret scraping, CAPTCHA solving, credential handling automático e remote code execution. «03.extensionarchitecture»
ND-8209. MV3 proíbe código executável remoto: config entregue por servidor deve ser declarativa e schema-validada; código executável vai no pacote assinado. «03.chromiumextensionarchitecture»
ND-8210. Mensagens de content scripts são input não confiável — validar todo envelope, bindar a tab/origin/session e manter decisões privilegiadas no service worker — e página web só endereça a extensão se allowlisted em `externally_connectable` (a 1.1.1 não expõe API pública de página). «03.chromiumextensionarchitecture»
ND-8211. A resolução de target desde 1.1.33 usa `targetref` com sete modos: selector, text (exato vence substring), aria (role+name), name (prefere o único clicável), xpath (subconjunto suportado), index (mapa de clicáveis de uma observation version) e point (elemento sob coordenada). «03.extensionarchitecture»
ND-8212. Zero matches = ausente reportada; exatamente um match resolve com `resolvedtarget` (modo, selector, tag, label, geometria) anexado a step results e review envelopes; dois ou mais matches recusam como ambíguo com lista de candidatos. «03.extensionarchitecture»
ND-8213. Os kinds de conveniência `clickpoint`, `clicktext`, `clickaria`, `clickname` e `resolvexpath` são cada um bound a um modo de resolução. «03.extensionarchitecture»
ND-8214. Estrutura do repositório: index.ts (entry público), types.ts (contratos), policy.ts (gates puros), memory.ts (estado de sessão browser-safe), protocol.ts (schema validation), extension/ (UI+background+bridge), cli/ (manifest validation, build, package, feature inventory), tests/, docs/ (não empacotados). «03.extensionarchitecture»
ND-8215. Consolidations 1.1.88/1.1.90 internam toda lógica correlata em um módulo por família (page, memory, cli, agent em 1.1.88; workflow, run, views, capture, bridge em 1.1.90) — nenhuma variação do mesmo arquivo vive ao lado de outra. «ts/page;ts/memory;ts/workflow;ts/run;ts/views;ts/capture;ts/bridge»
ND-8216. O merge 1.1.90 funde 94 módulos raiz em 25 famílias: run, flow, plan, session, swarm, net, bridge, gates, security, serve, capture, views, environments, runtime, perf, crossbrowser, workflow, llm, tools, data, commands, export, evidence, pack, debug. «13.evolutionroadmap»
ND-8217. A 1.1.89 zera todo open code scanning finding; a 1.1.95 hardena a superfície com pentest checklist de 21 entradas, cspaudit e permdiff gate. «13.evolutionroadmap»
ND-8218. O modelo de algoritmos de agente: tarefa browser = sequência finita revisável (intent, bounded observation, action proposal, user-policy decision, execution, fresh observation, outcome record) — deliberadamente diferente de loop irrestrito. «05.agentalgorithms»

### Bloco B — Permissões, capacidades opcionais e cross-browser (ND-8219..8236)

ND-8219. O permission set required fica travado em `activeTab`, `storage`, `scripting` e `sidePanel` — nada privilegiado instala por default. «01.extensionpermissions»
ND-8220. Permissões opcionais declaradas: `tabs`, `downloads`, `clipboardRead`, `clipboardWrite` (1.1.32), `offscreen` (1.1.60), `nativeMessaging` (1.1.85, optional-only) — cada capability pedida em runtime só quando um step revisado precisa. «01.extensionpermissions;13.evolutionroadmap»
ND-8221. Host pattern opcional único: `https://*/*` como explicit pairing flow — nenhuma origin concedida na instalação. «01.extensionpermissions»
ND-8222. Todo grant ou recusa de capability é auditado; o gate de capability recusa browser kinds cuja permissão está ausente e o sidepanel pede o grant. «01.extensionpermissions;13.evolutionroadmap»
ND-8223. Grupos de abas: o manifest EXCLUI `tabGroups` — membership, cores e collapse vivem no group registry Devthink em local storage, membros movidos via tabs api, nunca pela api nativa de grupos. «01.extensionpermissions»
ND-8224. `incognitowindow` só abre por request revisado explícito, exige permissão de incognito do usuário e a janela privada NUNCA herda os session origin grants (`windowprofilegrants` recusa herança em incognito). «01.extensionpermissions»
ND-8225. `saveprofiles` guarda perfil de formulário só dentro dos session origin grants capturados no save; aplicar re-checa `profilegrantgranted` — perfil de uma origin nunca preenche página de origin não concedida. «01.extensionpermissions»
ND-8226. `generatevalues` recusa emitir valores com forma de cartão real (Luhn válido de 13-19 dígitos fora do prefixo de teste 4111) ou identificador pessoal — dado gerado é sempre test-prefixed. «01.extensionpermissions;05.agentalgorithms»
ND-8227. `handoffcaptcha` nunca força resolução: registra o handoff, pausa o plano e devolve o controle ao usuário até resolver. «01.extensionpermissions;03.extensionarchitecture»
ND-8228. Senha: entradas de password são recusadas dentro de form records e profiles — o único caminho é o kind `consentpassword` com consent ref revisada, cuja linha de audit registra o ref e nunca o valor. «01.extensionpermissions»
ND-8229. Downloads consent-bounded por gramática de batch: `batchdownload` exige downloadspec revisado (HTTPS url list, filename rule, completion criterion), janela concorrente é escolha do usuário sem code ceiling. «01.extensionpermissions»
ND-8230. Clipboard read é consent-bounded três vezes: consent ref revisada no step, prompt single use aprovado no review panel e a capability opcional — payload só vira length + hash determinístico. «01.extensionpermissions»
ND-8231. Capturas sempre derivam da página concedida: screencast de tab, desktop capture e offscreen documents ficam fora do manifest por decisão de review. «01.extensionpermissions»
ND-8232. Network control sem grants: o forbidden set (cookies, webRequest, declarativeNetRequest, proxy, debugger, history, bookmarks, native messaging, management) permanece proibido nas duas listas — blocking/mock/rewrite steeram apenas o tráfego iniciado pela extensão. «01.extensionpermissions»
ND-8233. Emulação (1.1.48) adiciona zero permissão: `emulatedevice`, `emulatenetwork`, `emulatelocate`, `setuseragent`, `overridepermission`, `blackboxscripts` são sensitive atrás da consent window. «01.extensionpermissions»
ND-8234. Cross-browser 1.1.86: um manifest fonte com overlays por browser sob a chave `browsers` (firefox: browser_specific_settings, id gerado, event page, nomes de permissão opcionais diferentes, host permissions vazios; safari: skeleton xcode) — nenhum manifest mantido à mão em segundo lugar. «18.browsercoverage;01.extensionpermissions»
ND-8235. `apimap.ts` cataloga cada webextension api com equivalente chromium/firefox/safari; api sem mapping chromium+firefox falha o build antes dos artefatos cross-browser. «18.browsercoverage»
ND-8236. Capmanifest (1.1.91): cada permissão mapeia à surface que a consome (activeTab→popup, storage→background+mcp, scripting→background, sidePanel→sidepanel, tabs/downloads/clipboard/offscreen/native/host→background); gate apifreeze verifica as duas direções — permissão sem consumidor recusa e coverage de permissão não pedida recusa. «01.extensionpermissions»

### Bloco C — Catálogo de kinds e gramáticas de ação (ND-8237..8254)

ND-8237. O vocabulário imutável fecha em 335 action kinds documentados em kinddocs: família, consent class, capability, gramática de target/value, policy test e schema anchor por kind, com plan fragment revisado que valida contra o plan schema frozen. «kinddocs»
ND-8238. O doccheck gate renova a verificação a cada run: contagem de kinds do doc = catálogo servido pelo policy module, toda entrada declara seus campos e todo exemplo valida. «kinddocs»
ND-8239. 1.1.32 removeu todo bound arbitrário e cresceu o vocabulário de 11 para 63 kinds: wait sem teto, plano com steps ilimitados, snapshot captura todo elemento interativo, form control, option de select e texto completo. «13.evolutionroadmap»
ND-8240. Audit trail retention configurável com default ilimitado; plan expiry window configurável sem teto fixo. «13.evolutionroadmap»
ND-8241. 1.1.33 leva o vocabulário a 90 kinds: pointer travel (`movepointer` com pointpath/speedprofile/peak/jitter), `pierceshadow` através de shadow roots abertos, `enterframe` com frame path same-origin (recusa hop cross-origin), `keyhold`/`keyrelease` com registry persistido. «03.extensionarchitecture»
ND-8242. Pointer paths interpolam entre waypoints com easing linear|easeinout, peak velocity em px/s que sobe o hop delay quando excedido, jitter window com settle aleatório bounded, e `pointerover`/`pointerout` abrem/fecham o path — páginas observam enter-move-exit, nunca teleporte. «05.agentalgorithms»
ND-8243. `retryaction` envolve outro step com retryrule de attempts, settle window e movement tolerance: alvo estável dentro da tolerância para cedo (retentar não ajuda), alvo movido ganha nova tentativa; outcomes registram attempts e maior movimento observado. «05.agentalgorithms»
ND-8244. `mapclicks` numera todo clicável em document order com selector, role e label sob observation version fresca; números estáveis dentro da versão e clicáveis viram target hint do próximo plan input. «05.agentalgorithms»
ND-8245. 1.1.34 leva a 118 kinds — 28 observers read-only com observation mode: `passive` captura um estado, `watching` observa por lifetime window revisado, `diffing` compara exatamente duas versões armazenadas. «03.extensionarchitecture»
ND-8246. Watch steps só completam quando o lifetime window fecha — progress nunca marca watch rodando como done; registros sobrevivem a restarts do service worker com reconciliação das janelas terminadas durante o downtime. «03.extensionarchitecture»
ND-8247. Detectores de estrutura 1.1.34 sem vocabulário hardcoded: listpattern agrupa filhos por tag+class signature (≥2 siblings com texto), tableshape normaliza `<th>` em header e `column n` para headerless, countpages lê a paginação que a própria página renderiza (aria-current, current-classes), banner matcher cobre cookie/consent/gdpr/lgpd/privacy/ccpa com collapse de candidates aninhados. «05.agentalgorithms»
ND-8248. 1.1.35 leva a 147 kinds (família navigation): todo navigation é step revisado dentro dos session origin grants; origin não revisada só abre com veredito `checksafe` favorável; `navlist` recusa fora de plan aprovado; `pausenav` segura a família enquanto consent prompt está aberto. «03.extensionarchitecture»
ND-8249. SPA routing: mudança de url com loading = full load, sem loading = `route` (pushState/replaceState), url igual com loading = reload; `spawait` escuta popstate/hashchange com polling fallback (o isolated world não intercepta pushState da página). «05.agentalgorithms»
ND-8250. Rate limits de navegação são janelas per-domain (domain, window, ceiling) persistidas em local storage; sem code ceiling — plano pode revisar 3/min ou 100.000/dia; atingido o teto a navegação recusa com retry delay. «05.agentalgorithms»
ND-8251. A navigation trail é o backbone de auditoria: trailentry com url, título, step ref e timestamp por navegação completada; `navintent` registra a intenção para comparar intent×outcome depois. «05.agentalgorithms»
ND-8252. 1.1.36 leva a 179 kinds (tabs/windows): toda mutação de aba/janela negocia a capability `tabs`; `closepattern` só com flag revisada explícita e nunca fecha a session tab; `windowclose` exige review quando a janela tem >1 task tab; teto de task tabs concorrentes é setting do usuário sem code cap. «03.extensionarchitecture»
ND-8253. Layouts capturam arranjo: `savelayout` constrói tablayout do tab set + group registry + window bounds; `restorelayout` só replays urls não abertas (nunca duplica o que sobreviveu); `snapshotsession` congela a superfície inteira do run. «05.agentalgorithms»
ND-8254. Badges derivam do progresso vivo (`badgefromprogress` renderiza n/total ou done) e o budget gauge de task tabs recusa nada quando não há ceiling — nenhum code ceiling em lugar algum do math. «05.agentalgorithms»

### Bloco D — Formulários, dados e artefatos (ND-8255..8268)

ND-8255. 1.1.37 leva a 201 kinds (forms and data): fill, submit, wizard e payment são sensitive; field inspection, generation, profile storage, error reads, honeypot skips e detecções são read-only. «03.extensionarchitecture»
ND-8256. Todo `submitform`/`retryform` exige um `asksubmit` revisado antes (o parser recusa o plano e canexecute re-checa); submit com formas de card gradua payment, com password/token gradua credential. «03.extensionarchitecture»
ND-8257. Wizard tracking é estado incremental (step index, total, completion flags por passo, índice clamped) e o plano só fecha quando todo step revisado executou. «05.agentalgorithms»
ND-8258. Controles dependentes esperam evidência, não tempo: `selectchain` conta opções do filho antes do parent, aplica native setter e polla até a contagem mudar dentro da janela revisada; typeahead exige a entrada aparecer na suggestion list antes do click. «05.agentalgorithms»
ND-8259. Retry de submissão é bounded por review, nunca por código: retryrule com wait positivo, growth factor ≥1 e attempt count opcional; backoffwaits expande sem teto; resubmissão só após ticket asksubmit aprovado. «05.agentalgorithms»
ND-8260. `readerrors` associa cada validation message ao campo via aria-describedby primeiro, sibling text depois — o error report renderiza os field refs para o próximo fill mirar exatamente o que a página rejeitou. «05.agentalgorithms»
ND-8261. 1.1.38 (data part two): `pagedata.ts` normaliza headers em column keys slugified com sufixos únicos, expande rowspan/colspan em grids retangulares, separa tabelas aninhadas em child datasets ligados à parent row. «03.extensionarchitecture»
ND-8262. Paginação segue evidência: resolve o next control (entrada numerada ou next/>/›), polla até aparecer row que a página anterior não tinha (freshness compara shapes de rows inteiras — reordenação não engana), para cedo sem next control. «05.agentalgorithms»
ND-8263. `deduperows` hash-eia por key list revisada (djb2) mantendo a primeira ocorrência; `transformvalues` aplica uma expressão revisada por regra (trim/upper/lower/number/prefix/suffix/replace:from=>to) — expressão não suportada vira erro por regra sem corromper o dataset. «05.agentalgorithms»
ND-8264. Exports são sensitive duas vezes: recusam fora dos session origin grants; sheet push exige endpoint HTTPS configurado + host permission opcional + flag revisada; clipboard copy negocia clipboardWrite. «03.extensionarchitecture;01.extensionpermissions»
ND-8265. Artefatos caem no task artifact store com checksum determinístico e provenance por export (source url, step ref, row range) — toda row exportada é rastreável ponta a ponta; retention é setting e ausência mantém todo artefato. «03.extensionarchitecture»
ND-8266. `streamdisk` divide em chunks revisados sem teto de tamanho, escreve com backpressure (nunca mais de um chunk não confirmado em voo), persiste estado por chunk confirmado e retoma dos contadores após restart. «03.extensionarchitecture»
ND-8267. `resumeextract` continua extração interrompida do cursor armazenado com page history — o stream retoma da primeira row não escrita após restart do service worker. «03.extensionarchitecture;05.agentalgorithms»
ND-8268. Cleanup sweeps por idade e kind mantêm artefatos referenciados pelos review cards do plano aprovado e respeitam keep policies; counters de nome de captura persistem por task para consistência entre steps e plans. «03.extensionarchitecture»

### Bloco E — Captura, mídia e visão (ND-8269..8282)

ND-8269. Pipeline de captura 1.1.40: `shotview` (viewport via capturevisibletab), `shotfullpage` (mede geometria, rola em tile steps revisados com settle window, compõe em offscreencanvas), `shotelement` (crop do rect com pixel ratio; fallback tiled se cruza o viewport), `shotregion` (walk de scrollable containers), `contactsheet` (grid etiquetado). «03.extensionarchitecture»
ND-8270. Stitching usa seam weights lineares por overlap rows, pula bandas de header fixo repetidas e restaura a posição de scroll original após o último tile; scrollbars escondidas por regra de estilo scoped. «03.extensionarchitecture»
ND-8271. A política beforeafter envolve toda ação que move a página com before shot + ação + after shot, linka ambos como shotpair com o dom snapshot id do momento e pula o par quando a ação falha. «03.extensionarchitecture;ts/capture»
ND-8272. Capturas consent-bounded pelo capture gate: sessão viva não-pausada, tab = active tab, origin grants cobrem a origin, plano aprovado; `shotregion` exige flag revisada por retângulo. «01.extensionpermissions»
ND-8273. Memória de captura: shotrecords com bytes e step linkage; bytes expiram na retention configurada mantendo metadados para auditoria; `listcaptures` filtra por run/step/kind e `getpairs` serve os pares por run. «03.extensionarchitecture»
ND-8274. 1.1.41 mídia: `capturepdf` compõe PDF 1.4 derivado (catalog/pages/font/content/xref) com paper inches→points e landscape swap porque browser print APIs ficam fora do manifest; `recordscreen` deriva frame sequence ordenada do visible tab capture na fps revisada (quota ~2 capturas/s é limite externo, frames perdidos contados); `captureaudio` deriva evidência de audio element — ambos stored como derived evidence com manifest JSON de derivação, nunca bytes encoded. «03.extensionarchitecture»
ND-8275. Recording consent três vezes: consent ref revisada, prompt de gravação aprovado por origin, cada start consome o próprio prompt; duração nunca unbounded e session stop encerra toda gravação ativa. «01.extensionpermissions»
ND-8276. `probestream` reporta tracks de streams anexados a elementos da página; estatísticas de peer connection exigem main world access que fica fora do isolated world bridge — honestidade documentada. «03.extensionarchitecture»
ND-8277. 1.1.77 vision: imageocr funde word boxes e confidences em linhas e parágrafos pela própria geometria; regionocr clampa regiões com word boxes absolutos; pdfocr pagina; resultados servidos com cache primeiro e pairshot ao lado de cada screenshot. «todo;ts/capture»
ND-8278. 1.1.78 forensics: beforeafter pairing pula pre-capture de steps read-only e linka ambos ao stepid sob run heartbeat; consoletimeline captura a janela revisada; toda evidência forense passa pelo wrapper runstepwithforensics. «todo»
ND-8279. 1.1.79 minimization: localfirst mantém agregação e diffing no device; identity fields stripados salvo se o review os listou; o extractapi executor reporta o stripping nos step details e rotas de cookie/export passam pelas seams de minimização. «todo»
ND-8280. Perf records registram duração, query count, cache hits, delta flag e provenance de todo step; heavy capture pairs deferem ao run end sob prioridade `speed` do usuário (default `evidence` mantém capturas junto aos steps). «22.performancemodel»
ND-8281. Todo capture kind respeita as mesmas gates session/plan/origin — nenhuma captura silenciosa; export routes são consent-layered (memory target, clipboard target, download target). «01.extensionpermissions;03.extensionarchitecture»
ND-8282. Sem paper size, fps, region count, retention, model choice ou cache window hardcoded no módulo de captura: toda geometria e bound é escolha do usuário ou do step revisado. «ts/capture»

### Bloco F — Rede, sockets e API web (ND-8283..8296)

ND-8283. `socketbus.ts` (1.1.43): normalização de channel options com mapping https origin de wss urls, lifecycle de channel record, reconnect waits exponenciais que param de crescer no ceiling configurado, close limpo. «03.extensionarchitecture»
ND-8284. Multiplexing bus tagga toda mensagem de todo named stream com sequence number scoped ao canal; message filter casa por stream e dotted json path com match limit revisado; sequence integrity check recusa fora de ordem. «03.extensionarchitecture»
ND-8285. SSE parser de id/event/data/retry com resto incompleto em buffer e resume por last event id; long poll com cursor normalization e decisão de stop condition, cancellation, plan expiry e poll ceiling. «03.extensionarchitecture»
ND-8286. Observação de rede honesta: sem webRequest permission, `watchrequests` deriva o lifecycle dos performance/navigation buffers da run tab — urls, initiator types, timings, transfer sizes e protocols, mas SEM header names, body bytes, status de subresource ou verbs; exchanges derivados carregam question mark methods. «03.extensionarchitecture»
ND-8287. Headers e bodies só existem para exchanges capturados no contexto da extensão: `readheaders` lê a stored view redacted (e reporta derivados sem headers honestamente), `capturebodies` refaz fetch matched urls sob origin grants — body stored sempre reflete fetch revisado fresco, não a resposta original. «03.extensionarchitecture»
ND-8288. `netwatch.ts` agrupa failure classification, correlation id assignment, pairing request/response por correlation id, filtering por run/origin/status, header allowlist + redaction, body filter por url patterns/mime lists/byte ceilings e private mime grading. «03.extensionarchitecture»
ND-8289. `httpclient.ts` (1.1.41): fetch com policy options, url templating, transport seam com timeout races/backoff/redirect follow limit, streamed chunk reader com byte budget e abort flag, dotted json path extractor com kinds/defaults/miss flags, typed rest call com success classes e json error mapping, graphql envelope com unwrap de data/error. «03.extensionarchitecture»
ND-8290. 1.1.44 network control: url pattern grammar exige named https origin antes de single star (um segmento) e double star (atravessa segmentos); block rules com hit counters e reversion idempotente; mock fixtures com body revisado; header rewrite com set/append/remove e provenance de cada regra aplicada. «03.extensionarchitecture»
ND-8291. Cookies operam pelo document.cookie jar da origin concedida via page bridge: writes com name/value/path/expiry, reads expõem só name/value (document.cookie não revela domain/path/expiry), todo op espelhada como cookie operation record com timestamps e valores fora do audit trail; `cookiegate` recusa todo domain fora dos session origin grants. «01.extensionpermissions;03.extensionarchitecture»
ND-8292. OAuth 1.1.44: authorize url com state token run-scoped, redirect code capture aceita só a granted redirect origin com state matching e recusa provider error redirects com reason; token exchange/refresh scoped à token origin do provider; revoke rule normalization. «03.extensionarchitecture»
ND-8293. Uploads multipart com boundary streaming de um chunk por field part, file part e closing boundary; form payload urlencoded UTF-8. «03.extensionarchitecture»
ND-8294. Rate limit read: parsing de remaining/limit/reset headers e retry-after de 429/503 em segundos ou HTTP-date, com wait arithmetic até a janela resetar. «03.extensionarchitecture»
ND-8295. Proxy routing mantém a proxy permission fora do manifest — o proxy posture é documentado como não suportado no engine local. «01.extensionpermissions»
ND-8296. 1.1.76 webapi: subevents parseia event/data/id/retry com resume por last event id e cancel limpo; longpoll retenta timeouts sob backoff do usuário; correlation ids em todo request outbound; transport e upload gates antes de cada envio. «todo»

### Bloco G — Workflow engine, triggers e editor (ND-8297..8314)

ND-8297. `workflow.ts` 1.1.50: composition valida name, version, granted HTTPS origins, steps e blocks, expande todo nested block (nenhum step fica escondido), gradua review risk pela risk table injetada e congela o record. «03.extensionarchitecture;ts/workflow»
ND-8298. Pre-run validation de kinds, scopes e bindings; typed scope stack com shadowing e resolução outward; bindings de variável com kind coercion refusal; expressões com arithmetic/comparison/logic/text operators e regex extraction com honest no-match outcome. «03.extensionarchitecture»
ND-8299. Run loop com per step checkpoints, pause/resume/cancel transitions, single step execution e pure dry run com read only projections. «03.extensionarchitecture»
ND-8300. Executores: composition executor congela e armazena; run executor dispatcha cada step pela MESMA consent gate e dispatch chain de um plan step (step vira tool step do próprio kind — nenhum construct de workflow bypassa review); delay executor usa alarms api para sleeps além do lifetime do service worker. «03.extensionarchitecture»
ND-8301. Startup hook marca runs interrompidos como paused no último checkpoint. «03.extensionarchitecture»
ND-8302. 1.1.51 control flow: condition, branch, loop, repeatuntil, whileloop, foreach, parallel, trycatch — branch paths únicos com else obrigatório, item/index variables distintos, while com safety bounds obrigatórios, parallel com branch ids únicos e join policies revisadas (merge first/last/fail com cancel|continue), try com catch handler, retry policies de attempts do usuário com backoff fixed/exponential seeded sobre error classes revisadas. «03.extensionarchitecture»
ND-8303. Composition valida todo control payload antes do freeze, coleta todo nested child step (nenhum construct esconde step no corpo) e gradua o record pelo pior child kind. «03.extensionarchitecture»
ND-8304. 1.1.52 triggers: dez famílias (visitrule, urlrule, menurule, keyrule, buttonrule, cronrule, intervalrule, urllistrule, webhookrule, eventrule) — TODAS graded sensitive porque lançam runs automaticamente. «03.extensionarchitecture»
ND-8305. Trigger grammars: url glob com `*` (um segmento) e `**` (atravessa) com portas explícitas; cron de 5 campos com weekdays/months nomeados e timezones via runtime tz database; interval com seeded jitter; webhook com shared secret acima de entropy floor + payload schema de primitive kinds; cooldown suppressor reporta janela restante; dedupe mantém um pending fire por rule enquanto run ativo. «03.extensionarchitecture»
ND-8306. Trigger evaluation pula rules disabled, paused, unreviewed ou em cooldown; manual run exige preview com confirmation outcome. «03.extensionarchitecture»
ND-8307. 1.1.53 editor como pure logic: canvas de nodes, typed binding edges, block definitions, layout state, mini map e undo/redo stacks. «03.extensionarchitecture»
ND-8308. Load/save round trip: loading colapsa cada região contígua de block em um invocation node com id único (mesmo para invocações repetidas) e levanta bindings em typed edges; saving recusa duplicate node ids, unknown blocks, backwards edges e unknown edge endpoints, e recomcompõe pela gramática completa. «03.extensionarchitecture»
ND-8309. Editor: drag&drop com grid snapping e block column attachment, palette de drop blocks curados, step library de todo kind revisado em cinco categorias com option schemas, template insertion com nested parameters, zoom com label scaling, step search, breakpoint markers em qualquer step (inclusive dentro de block definitions), debug run segmentation, version diffing, json/yaml (subset documentado) para import/export/template sharing, per-site override application aos knobs revisados. «03.extensionarchitecture»
ND-8310. `editorsavegate`: editorsave handler exige live session + approved plan + unique node ids + forward-only edges + gramática completa antes de armazenar record, version com change note, layout e breakpoints. «03.extensionarchitecture»
ND-8311. Flowlibrary (1.1.66): manifests atrás de schemastrict; syncbridge hooks sob explicit opt in; background run queue; `runreplay` de sealed chains; `outputcompare` de joined runs. «13.evolutionroadmap»
ND-8312. Terminal surface 1.1.67: planlint (lint de plan fixtures sob schemastrict), headless flowrun, exporttools com checksums, headlesslib session e targets node/bun/deno com runtime adapters. «13.evolutionroadmap;20.workflowlibrary»
ND-8313. Workflow documents: schema de version + name + positive integer version + granted HTTPS origins + step list — `runworkflow` compõe pelo mesmo engine da extensão e executa em dry run por default. «readme»
ND-8314. Plan files: version, goal, HTTPS origin, optional grants/denials de action kinds e step list (id, kind do catálogo revisado, label, target selector, value, options) — planlint sai non-zero em qualquer diagnostic de erro. «readme»

### Bloco H — Servercontract, MCP e native bridge (ND-8315..8334)

ND-8315. Servercontract 1.1.82: todo frame é um json envelope com version negociada, op única, `opid` estável (`op-<sender seed>-<sequence>`, sem aleatoriedade no wire), sessionid, token, `at` epoch ms e body — envelope que falha schema recusa com o path. «14.servercontract»
ND-8316. Operações: sessioncreate (só extension member), sessionjoin (site com pairing code; reconnect rotaciona o token e revoga o antigo), eventpost (rota entre os 2 membros), eventstream (subscribe com streams+since). «14.servercontract»
ND-8317. Event types do bridge: chat (task text trimmed non-empty), planproposal (review card), planreview (decisão de volta ao review gate), progress (step status). «14.servercontract»
ND-8318. Capability negotiation: versão = a mais nova que ambos falam; operations e event types = interseção na ordem estável; handshake sem shared version/op/event recusa em vez de degradar silenciosamente. «14.servercontract»
ND-8319. Relay expectations: 1 extension + 1 site por sessão, autentica todo frame pelo sha-256 do token contra record não-revocado, rotaciona token a cada join, expira por idle window configurada, nunca loga token e vê METADATA ONLY — nunca conteúdo de página. «14.servercontract»
ND-8320. Data minimization no wire: bridge envia plan text e statuses apenas; keys de conteúdo de página recusam alto sem a explicit page consent flag; relay url é sempre setting do usuário (wss validado, vazio desabilita o bridge); site pede a url ao visitante e guarda em localStorage. «14.servercontract»
ND-8321. Pairing walkthrough: consent do socket antes de abrir, pairing code mintado com expiry countdown (5 min documentados), kill switch revoga todas as sessões com um click. «14.servercontract»
ND-8322. Bridge threat model 1.1.82: código não-pareado não fala (origin checks + connect allowlist), código roubado não paira duas vezes (single use + expiry), frame replay não impersona (token rotativo por conexão), flooder não afoga (rate limit por sessão/segundo + audit), relay curioso não lê página (metadata only), token vazado morre com o socket. «16.securitymodel»
ND-8323. MCP mode 1.1.84: `devthink serve` com flags `--stdio` (json rpc newline-delimited), `--http [port]` (streamable http localhost), `--cert/--key` (tls), `--degraded` (read only); ambos transports podem rodar simultâneos; shutdown drena in-flight calls. «16.mcpserver»
ND-8324. Toolcatalog mapeia o catálogo de action kinds para tools MCP: json schema inputs, 4 namespaces (browser, workflow, memory, system), versão por tool, consent requirement e risk class na metadata, descrição openapi-style; consent metadata de todo tool deve casar EXATAMENTE com o policy grading; tool não coberto pelos grants atuais nem expõe. «16.mcpserver»
ND-8325. Sensitive tools (click, type, submit, payment, credential) bloqueiam até o approval gate humano responder (gate renderiza no sidepanel com caller e intent); server degrada a read-only tools sem origin grant; todo tool call gera audit com caller/tool/outcome. «16.mcpserver»
ND-8326. resourceexpose publica page state, plan, audit trail, session record e health como resources MCP com subscription (change notifications via json rpc); promptexpose publica a template library como prompts. «16.mcpserver»
ND-8327. Client configuration: allowlist de clients, rate limiting per client, session tokens pareiam client↔session, múltiplos clients simultâneos com sessões isoladas; metadata name/version registrada para audit. «16.mcpserver»
ND-8328. Native/call notifications: toda surface call nativa emite notification com surface, call class, outcome e correlation id — nunca payload. «16.mcpserver»
ND-8329. Native host bridge 1.1.85 é OPTIONAL: `nativeMessaging` só no optional set (deep manifest check recusa no required), deny by default, nada nativo roda até o usuário instalar. «17.nativebridge»
ND-8330. Consent model nativo em camadas: install consent (`nativeinstallconsentgate`), transport consent per call class (read/interaction/sensitive são grants separados), surface consent para os dialogs/notifications do OS (`nativesurfacegrant`), human approval para sensitive (`nativesensitiveapprovalgate`), kill switch + escape hatch que destacam port e fecham wsbridge num press. «17.nativebridge»
ND-8331. Companion `companion.ts`: typescript puro que fala length-prefixed json no stdin/stdout (wire do chromium native messaging), responde handshake com build/protocol version, hospeda wsbridge em porta localhost aleatória livre (zero pede ao socket), expõe dialogs/notifications sob consent, rotaciona log com size bounds e embute o host manifest template stamped pelo build. «17.nativebridge»
ND-8332. Wsbridge token model: porta + raw token anunciados SOMENTE pelo native port; session records guardam apenas o sha-256; segunda conexão de extensão recusa (uma conexão por vez); sessão quieta expira na idle window configurada (janela ausente nunca expira). «17.nativebridge»
ND-8333. Secret exclusion de frames: body key de shape secreta (apikey, token, secret, password, authorization, credential, privatekey) recusa o frame inteiro — o native host nunca recebe key vault material. «17.nativebridge»
ND-8334. Graceful degradation nativa: host ausente, desatualizado (compatibilidade de exatamente um major version) ou crashado nunca falha o run — transport off, tudo roda no browser; heartbeat detecta liveness e reattach no restart. «17.nativebridge»

### Bloco I — Gateway e LLM da extensão (ND-8335..8346)

ND-8335. Quatro provider adapters compartilham um contrato (build wire request, parse body, parse stream em tokens ordenados, list models, serialize tool catalog no schema do provider): openai-compat chat completions, anthropic messages, google gemini generate content, ollama local. «24.gatewayguide»
ND-8336. Provider keys vivem no keyvault e em nenhum outro lugar: storeproviderkey (consent stamp + storage id), resolveproviderkey (material no último momento antes do request sair), revokeproviderkey (drop on demand); keyexportcheck recusa export com key shape. «16.securitymodel;ts/gateway»
ND-8337. Scan de literal de api key nos bundles built garante que nenhuma key shape sai no dist; scan de provider url hardcoded garante o mesmo para endpoints — nada de api.openai.com, api.anthropic.com, generativelanguage.googleapis.com ou cloud ollama no código shipped. «16.securitymodel»
ND-8338. Requests mascaram antes de qualquer log (authorization header e key query param do shape gemini mascaram para o label); gateway error surface não carrega material de chave. «16.securitymodel»
ND-8339. budgetcheck halta chamadas de modelo ao custo budget do usuário; usage records alimentam a reconciliação certificada pelo costcert (9 checks). «13.evolutionroadmap;22.performancemodel;ts/gateway»
ND-8340. modelroute: tabela task kind→provider/model do usuário; disponibilidade marcada após falhas; fallback pair configurado assume; revision bump a cada edição da rota. «24.gatewayguide;ts/gateway»
ND-8341. Local model calls recusam todo endpoint não-loopback — nada sai da máquina; health check de local endpoint na configuração. «24.gatewayguide;03.extensionarchitecture»
ND-8342. Guardrails de parse de LLM: strip de code fences/chatter, schema validation, retries até o count configurado e recusa após exaustão — output inválido nunca executa. «24.gatewayguide»
ND-8343. Plan drafted por modelo vira pending plan pela MESMA plan review de todo plano local (plandraftreviewgate); replan exige fresh review da cauda alterada (replanreviewgate). «ts/background;ts/policy»
ND-8344. Command parsing com deterministic intent classifier e fallback local; per step reflection com running lessons; openapi-style tool briefs do catálogo. «03.extensionarchitecture»
ND-8345. promptlibrary é biblioteca de templates do USUÁRIO — nenhum template builtin shipa; render em fluxo sensível exige consent notice; versioning com change notes e search. «03.extensionarchitecture»
ND-8346. Degraded posture: `--degraded` do serve e featuredowngrade policy mantêm o engine read-only sem recusar o run — degradação nunca vira bypass. «16.mcpserver;ts/policy»

### Bloco J — Multiagente (ND-8347..8364)

ND-8347. Identidades: nome escolhido pelo usuário bound a UMA tab sob a regra one-agent-per-tab. «03.extensionarchitecture»
ND-8348. Roles com namespace defaults documentados: planner, worker, observer + custom roles do usuário (custom gradua com worker defaults até o usuário estreitar o scope). «03.extensionarchitecture»
ND-8349. Sub-agente spawn: depth exatamente um nível sob o parent; recursão recusa past o depthlimit configurado pelo usuário. «03.extensionarchitecture»
ND-8350. Isolamento individual: pauseone/resumeone para single agent, stopone, e killall killswitch que halta todo agente de uma vez e devolve os claims à queue. «03.extensionarchitecture»
ND-8351. Per-agent budgets: token, cost e step ceilings checados a cada uso; per-agent scope gate para origins e tool namespaces; usage acumulado por agente. «03.extensionarchitecture»
ND-8352. Run contexts por agente reutilizam os run records do workflow engine sob ids `<agentid>:<taskid>`. «03.extensionarchitecture»
ND-8353. Task queue compartilhada: enqueue em lanes/priorities do usuário, claim do highest priority (oldest vence ties, um task por agente), work stealing respeitando lane ownership, claim heartbeats, requeue pass devolve tasks de dead agents past o claim window, all|any completion policy. «03.extensionarchitecture»
ND-8354. Blackboard compartilhado: seções goals, facts, findings e scratch; posting com autor; consent class herdada da source extraction; reading com freshness filters; retirement pelo usuário. «03.extensionarchitecture»
ND-8355. Orquestração 1.1.59: `electleader` pela regra do usuário (primeiro registro ou agente nomeado); `assignwork` distribui queued+claimed em turnos; `scaleworkers` adiciona/aposenta por load sob bound `swarmworkers` sem engine cap. «03.extensionarchitecture»
ND-8356. Planner-executor split: `plannersplit`/`reportstep` mantêm drafting e execução em agentes diferentes com report de outcome por step. «03.extensionarchitecture»
ND-8357. Critic reviews: request/ack/apply/sweep com ack tracking e timeout do usuário; verifier `checkclaim` registra pass/fail com o método usado. «03.extensionarchitecture»
ND-8358. Escalation: decisão parada sobe ao usuário e permanece human-decided (`escalate` + escalationgate). «03.extensionarchitecture»
ND-8359. Arbitration ordena competing resource claims por priority, age ou leader rule; consensus (openconsensus/consensusvote/consensusstate) coleta votes até o quorum configurado. «03.extensionarchitecture»
ND-8360. Handoffs: `preparehandoff` empacota tab+task state, `transferhandoff` move o tab binding sob one-agent-per-tab preservando os session grants originais (handoffgrantgate), `resumehandoff` continua do estado empacotado. «03.extensionarchitecture»
ND-8361. Locks: acquire/release/expire com exclusive|shared keyed por exatamente uma origin e um selector, expiries do usuário; `scanconflicts` sugere ordering para o arbitrate. «03.extensionarchitecture»
ND-8362. Merge: result merging com provenance e conflict policy order (conflictresolutiongrade); export gated por mergeegressgrade; compare/lesson/costs/timeline/replay/snapshot no swarm report. «03.extensionarchitecture;todo»
ND-8363. Progressboard agrega agents, queue e topology em lanes com milestones; interleaved swarm timeline com replay e filtros agent/kind/time. «03.extensionarchitecture»
ND-8364. Certificação 1.1.96: agentcert gate roda 30 coordination scenarios contra módulos compilados reais em fake clock mode sobre fake tabs de todo browser kind (suite < 30s, artifacts byte-idênticos sem timestamps); costcert roda 9 accounting checks (< 10s). «22.performancemodel;13.evolutionroadmap»

### Bloco K — Execução, run state e resiliência (ND-8365..8379)

ND-8365. Quatro execution environments 1.1.60: pagecontext (dom com page events via bridge), isolatedworld (`evaluate` só, page globals inalcançáveis), offscreenworker (6 famílias heavy parse), sandboxframe (markup não confiável). «14.executionenvironments»
ND-8366. Content scripts registram no isolated world por default mas a injeção real fica atrás das scripting calls concedidas em origins revisadas — nada auto-roda em site algum. «14.executionenvironments»
ND-8367. Offscreen pool: documento único reutilizado pelos steps de um run, pool cresce/encolhe com a parse queue sob `workerpoolsize` do usuário sem engine cap, envelopes workerrequest/workerresponse com transferable buffers e partials streamados; SEM o grant offscreen, todo step cai em inline parsing dentro da página em vez de recusar o trabalho revisado. «14.executionenvironments»
ND-8368. Sandboxframe: adapter stripa scripts e event handlers antes do render, nonce por render em toda mensagem, canal `devthinksandbox`, resultado nunca reentra no dom fora do frame; página sob a manifest key `sandbox` sem privilégios de extensão. «14.executionenvironments»
ND-8369. `untrustedrendergate` roteia todo render de markup não confiável pelo sandboxframe sob nonce e recusa injeção no page context. «16.securitymodel»
ND-8370. Keepalive: `runstate.ts` abre port com start event, heartbeat por interval (`keepaliveinterval`, 30s documentados), fecha na terminal state, persiste a cada heartbeat e reattacha após restart retomando EXATAMENTE o pendingstepid (recoveryplan recusa adivinhar além dele). «14.executionenvironments»
ND-8371. `zombiesweep` reaps runs com heartbeat silente past os `zombieintervals` configurados (três documentados). «14.executionenvironments»
ND-8372. Run state persistido per profile selado com sha-256 integrity digest — tampered record nunca alcança recovery; retenção reduz runs stopped a keepalive summaries; quota prunes os mais antigos sob pressure ceiling configurada. «14.executionenvironments»
ND-8373. Storage-level run lock segura uma sessão contra runs concorrentes; steps que compartilham uma tab através de branches paralelos serializam (`serializesteps`); toda navegação gera url history entry no run record. «14.executionenvironments»
ND-8374. Resiliência 1.1.70: runrecords com lifecycle state machine, offlinequeue com replay e expiry, idempotencykeys com replay dedup, checkpoints com digest-validated resume, heartbeats com zombiecheck e reaping. «13.evolutionroadmap»
ND-8375. rollbackrun (compensations) e o par cancelrollback só existem atrás da explicit user choice. «13.evolutionroadmap»
ND-8376. Cancelrun 1.1.63: queued scope rola de volta só steps nunca executados (executados ficam no sealed immutable log); none scope para sem rollback; audit nomeia o scope escolhido. «17.memorymodel»
ND-8377. State depth 1.1.71: urlhistory com visit dedup, runtimeline com phase buckets, tabisolate namespaces, sessionlock com holder naming e expiry, memory items com provenance e user expiry, expirememory confirmation-gated com retained summaries, encryptrest com webcrypto derived key e lazy migration, quotawatch cleanup batches com per batch approval, auditexport streaming sem size cap. «13.evolutionroadmap»
ND-8378. Session persistence 1.1.49: checkpoint após todo step completado com corruption checksum sobre run id/step cursor/outputs; session record com per tab url, title, index, scroll e non-password form state; diff classifies tab/url/form/storage changes; crash detector marca run interrompido e oferece crash restore dentro do consent. «03.extensionarchitecture»
ND-8379. Session export/import versionado (format version, record ids, byte size, checksum); import só após full record review; auto snapshot interval com persisted state acordando via alarms api quando disponível. «03.extensionarchitecture»

### Bloco L — Modelo de memória da session interface (ND-8380..8394)

ND-8380. Cinco session stores 1.1.63 com gates próprias: sitenotes (one origin, read dentro dos granted origins, write com consent explícito), scratchpad (one task session, append-only), runsummaries (one run, distillation como offscreen worker task sob capability com inline fallback), correctionmemory (origin+kind, capturada do plan review), consentmemory (one origin, todo grant/denial/expiry/revocation). «17.memorymodel»
ND-8381. `sitenotesreadgate`/`sitenoteswritegate`, `scratchpadscopegate`, `memoryreadscopegate` (corrections só abrem durante planning/prompting) e `consentmemoryadvisorygate` mantêm cada store no escopo — nenhuma surface bypassa human review. «17.memorymodel»
ND-8382. Consent memory é ADVISORY: nenhuma entrada auto-concede e uma denial pesa igual a um grant. «17.memorymodel»
ND-8383. Sealing de site notes sensíveis: keystream byte por posição derivada de hash(note id, posição), body XOR sob marker `sealed:`, reading recomputa o stream; export mantém a forma selada — proteção local at-rest, nunca substitui o keychain do usuário. «17.memorymodel»
ND-8384. Índices derivados: semanticrecall (fingerprint dedup, ranked por text similarity dentro do run scope com provenance run+step, `semanticrecallscopegate` recusa query cross-origins fora do scope) e historysearch corpus incremental com matched term highlighting. «17.memorymodel»
ND-8385. Errorsurface payloads de failed steps com cause classes (page, network, policy, gate) e retry hints que só passam por NEW reviewed dispatches. «17.memorymodel»
ND-8386. Per-tab session references isolam tabs paralelas sem colisão (`tabsession:<tabid>`). «17.memorymodel»
ND-8387. Retention nunca hardcoded: noteretention, scratchpadretention, summaryretention, correctionretention em ms (ausente = mantém para sempre), recallwindow, summarywindow em steps (ausente = todo step sem fixed cap), historyindex toggle, cancelrollback preference; `sessionretentionvalid`/`summarywindowvalid` recusam qualquer engine boundary. «17.memorymodel»
ND-8388. Provenance obrigatória: notes nomeiam autor e timestamps, scratchpad entries nomeiam o step vizinho, summaries nomeiam provenance de distillation e window, recall matches carregam run id + step id, corrections linkam step→correction com reason em plain language, consent memory nomeia a boundary. «17.memorymodel»
ND-8389. `sessionbundleof` exporta notes+summaries+corrections como um audit artifact com sealed bodies intactos e sensitive bodies sealed. «17.memorymodel»
ND-8390. Recall seam: o fingerprint index local responde hoje; query/answer shapes (`recallquery`/`recallmatch`) estáveis documentam a seam para um remote backend revisado futuro. «17.memorymodel»
ND-8391. Storage keys versionadas por família: sitenotes, scratchpad, runsummary:<runid>+runsummaryindex, recallindex, corrections, consentmemory, errorsurfaces, historyindex, tabsession+index. «17.memorymodel»
ND-8392. Session interface 1.1.63: sessiongrid, historysearch, emptystate guidance, errorsurface com reviewed retry hints, sitenotes com sealed sensitive bodies, append-only scratchpad, runsummary distillation, semanticrecall com provenance, correctionmemory, consentmemory, cancelrun queued-only rollback. «13.evolutionroadmap»
ND-8393. Interface surfaces part two 1.1.65: datagrid + exportmenu, quickactions, shortcutkeys, omniboxtask parser, statusbadge, notifications com DND respect, recenttray, stetoasts, pickeroverlay, targethalo, guidedtips, shotpanel, compareviewer, pagechips, siteprofiles, darklight tokens, locale bundles, importexport + dropimport, featuretour, a11ylabels. «13.evolutionroadmap;18.interfacesurfaces»
ND-8394. Live updates via UM broadcast channel `devthinksurfaces`: background posta um frame por audited event (run control, session store, configure, logstream) — nenhuma surface mantém estado próprio. «18.interfacesurfaces»

### Bloco M — UI, superfícies e estados (ND-8395..8410)

ND-8395. Cinco superfícies com routing uniforme: popup (command surface), sidepanel (workspace plan/run/review), dashboardpage (full page view em nova tab), optionspage (todo setting com seções), onboarding (walkthrough first-run com um único consent scoped event, roda no install e replaya on demand). «18.interfacesurfaces»
ND-8396. Commandpalette registra o catálogo de todo módulo no startup via `surfacepalette()`, lista só ações permitidas pelo capability set + session state atuais, fuzzy search de ids/labels/keywords e rank recent-first pelos usage counts armazenados. «18.interfacesurfaces»
ND-8397. Todo surface action viaja como um `surface` command pelo command bus com gates `paletteactiongate` e `taskinputproposalgate` (mesmo proposal flow da api). «18.interfacesurfaces»
ND-8398. Review tab: plancards, stepapprove, diffpreview, stepstimeline e logstream com live chain verification (verifylogstream). «13.evolutionroadmap;ts/plan»
ND-8399. Taskinput e omniboxtask seguem o mesmo proposal flow; omnibox parseia task natural para taskinput (omniboxtasktotaskinput). «ts/views»
ND-8400. Quickactions com catalog por contexto (`quickactionsfor`), shortcuts com bindings default e pós-bind validation (`shortcutdispatchable`), notification content gate e notification plurals no polish 2.0.2. «ts/views;13.evolutionroadmap»
ND-8401. Picker overlay: candidates rankeados (`rankcandidates`) com stability score, lock candidate, halo de target colorido por classe, guidedtips com dismiss/recall. «ts/views»
ND-8402. Shotpanel com pan/zoom e compareviewer com overlay slider para pares before/after. «ts/views»
ND-8403. Stetoasts empilham com history; recenttray mantém entradas com state after; statusbadge deriva texto e cor do progresso. «ts/views»
ND-8404. Dashboard panel resize, high contrast theme e icon set em todo required size entram no 2.0.2 final polish (ui polish family). «13.evolutionroadmap»
ND-8405. V1 sunset UX: negotiation banner, migration prompt once-per-user, release provenance stamps no audit trail, dismissal de migration/v1sunset na memory. «13.evolutionroadmap;ts/background»
ND-8406. Popup security line: allowlist state da active tab com grant request, originprofile summary, consent window countdown e denydefault notice para origins não concedidas. «15.consentmodel;16.securitymodel»
ND-8407. Sidepanel security panel: allowlist editor, origin profile editor per kind, consent windows com tempo restante + renew, consent prompts com class badges, revoke confirm dialog nomeando halted steps, mask rules, revocation history e per run chain verification com seal hash, log read e audit file export. «15.consentmodel»
ND-8408. Onboarding cobre origin grants, plan review, run control e log audit — replayável da optionspage. «18.interfacesurfaces»
ND-8409. A11ylabels e WCAG sweep (tests/wcag.mjs) fazem parte da cadeia de release; foco keyboard order do review dialog no polish final. «13.evolutionroadmap»
ND-8410. Locale bundles + darklight tokens: superfícies servem light/dark tokens e locale bundles do usuário — nenhuma surface hardcodeia locale ou tema. «13.evolutionroadmap;ts/views»

### Bloco N — Performance e budgets (ND-8411..8428)

ND-8411. Regra do no-limits aplicada à performance: features otimizam hot paths e NUNCA capam, recusam ou bypassam consent review; todo window/depth/cadence/bound é user choice; valor ausente = comportamento unbounded. «22.performancemodel;23.schedulingandbudgets»
ND-8412. `lazyload.ts` declara heavy modules com load reasons e capability requirements, resolve on first use sob as MESMAS capability checks do eager path, prewarma o `prewarmset` escolhido e grava load telemetry. «22.performancemodel»
ND-8413. `dombatch.ts` coalescencia storms de scroll/input/resize por `debouncewindows` (ausente = todo evento passa uncoalesced) e funde repeated selectors num batchquery que executa como um worker task. «22.performancemodel»
ND-8414. `snapshotdelta.ts` fingerprinta regiões com hash local estável e computa delta added/changed/removed contra base ref do mesmo run; `incrsnapshotgate` exige base ref do mesmo run; delta vazio pula a recomputação inteira. «22.performancemodel»
ND-8415. `selcache.ts` cacheia resoluções por generation: avança na mutation batch, invalida wholesale na navigation e seletivamente por mutation fingerprint; `selcachegate` recusa stale generation hit com retry hint revisado. «22.performancemodel»
ND-8416. `virtlist.ts` mantém visible row window com height map medida, clampa durante scroll, recicla nodes do overlap e reporta rendered/skipped/recycled. «22.performancemodel»
ND-8417. `streamparse.ts` fatia página grande em chunk windows do byte bound do usuário, tokeniza um chunk por vez no worker pool, yielda observações progressivas e nunca segura o texto completo da página; `streamparsegate` valida todo chunk como o one-pass parser. «22.performancemodel»
ND-8418. Chunked extraction: row windows resumáveis via cursor com table fingerprint; resume cross-table-state recusa; windows merge no datagrid sem duplicatas. «22.performancemodel»
ND-8419. Batch backpressure: queue conta steps à frente dos outcomes; backlog acima de `batchwindow` pausa enqueue (ausente = nunca pausa); step queued nunca dropa. «23.schedulingandbudgets»
ND-8420. Domain limits: concurrency slots per domain (`example.com=2`) com overflow lanes per domain; domínio sem entrada fica unbounded; politedelay com politejitter folded e per domain floor dos siteprofiles. «23.schedulingandbudgets»
ND-8421. Adaptivepoll: intervalo alarga por `pollgrowth` enquanto observações não mudam e estreita quando mudanças retomam, sempre dentro de floor/ceiling do usuário; requestcoalesce funde queries pendentes idênticas por shared key com fan-out do resultado. «23.schedulingandbudgets»
ND-8422. Runbudget: step usage vs `stepbudget` e memory pressure ratio vs `memorybudget` — informational quando unset; budgetalerts warning reporta, critical PAUSA o run pendente user choice (nunca cancela por conta própria). «23.schedulingandbudgets»
ND-8423. Timeoutcancel: step past `timeoutbound` aborta com cancel event no immutable log e retry hint — retry permanece reviewed dispatch; bound ausente nunca aborta. «23.schedulingandbudgets»
ND-8424. Tabsuspend: idle tab só suspende em wait maior que `suspendwindow` com run state preservado; discarded tab reloada restore url antes do step que precisa. «23.schedulingandbudgets»
ND-8425. Caching e warming: runcache keyed por digest (clear no run end salvo `runcachepin`), stepprefetch deriva de plan structure ALONE (gate recusa hint fora do plano revisado), warmselectors carrega entre steps adjacentes sob page fingerprint, sessionreuse exige per profile consent prompt com cookies isoladas por container. «23.schedulingandbudgets»
ND-8426. Efficientresume: checkpoint de cursor + page digest por step boundary; após restart completed steps skipam, fingerprint revalida antes de continuar e fingerprint mudado RECUSA — run nunca continua contra página diferente; navdedupe skipa navegação planejada para url já ativa. «23.schedulingandbudgets»
ND-8427. Onde vai o tempo: durationmeter monotônico, selectorprofile com failure rate e flag acima de `selectorlatency`, steptrace spans aninhados per step/worker com parent refs e export de trace file, startupmeter/coldstart do module load ao ready contra `startuptarget`. «23.schedulingandbudgets»
ND-8428. Resource awareness: artifactcompress (deflate|store do usuário), logprune só whole sealed runs past age/size windows (unsealed nunca pruna — chain fica verificável), batteryaware defers non-urgent sob `batteryfloor` (nunca cancela), networkaware adapta backoff por failure kind com server signal override, readparallel lanes sob `readlanes`, slowmo replay factor com pauses linkadas a steptrace spans. «23.schedulingandbudgets»

### Bloco O — Build, release e distribuição (ND-8429..8443)

ND-8429. `package.json` é a única fonte de versão; push em main que muda package.json ou CHANGELOG.md inicia o release workflow que sincroniza metadata derivada, renderiza releasenotes da seção do changelog e resolve tag imutável vX.Y.Z. «04.releasepipeline»
ND-8430. Trigger matrix: PR/main → verify (types, tests, metadata, package preview, extension ZIP, actionlint) + security (code scanning, dependency review, secret scanning, SBOM, audit); schedule → maintenance que só abre PR de non-breaking (major exige allow_major_updates=true) — maintenance nunca mergeia/taga/publica. «04.releasepipeline»
ND-8431. Publicação multi-target com evidência por alvo: GitHub Release (ZIP, tarball, source ZIP, notes, nupkg, pom, GHCR refs, SHA256SUMS), npmjs com provenance e skip idempotente por versão exata, GitHub Packages npm/Maven/NuGet, GHCR com digest/JSON truthfully reportados. «04.releasepipeline;19.distribution»
ND-8432. Maven permanece descriptor e NuGet permanece distribution package — os boundaries impedem que coordenadas de registry superestimem a runtime capability. «04.releasepipeline»
ND-8433. SHA256SUMS.txt exclui a si mesma e lista bare filenames ordenados — `sha256sum --check` direto após baixar todos assets; verificado independentemente contra o asset set público v1.1.13. «04.releasepipeline»
ND-8434. Runtime pins: Node 26.8.1, npm 12.0.2, Bun 1.4.0 com compatibilidade declarada bounded; pnpm 11.24.0 canônico de lockfile; Node 26 sem Corepack → container deriva e instala npm/pnpm do package metadata antes do frozen-lockfile install. «04.releasepipeline»
ND-8435. Multi-runtime verification matrix 1.1.81: build matrix node/bun/deno com require smoke (index.cjs), import smoke (index.js), global smoke (umd), deno check e vitest sob bun; bundle size budgets per target (index 1.800.000b … cli 600.000b) falham bundle oversized antes do ship. «04.releasepipeline;21.librarymodes»
ND-8436. Library modes 1.1.67: `platformtargets()` declara browser/umd, node/cjs, bun/esm, deno/esm numa única fonte; exports map com sideEffects false; variantes min + sourcemap + version stamp + license banner; checksum line per target em dist/checksums.txt; matrixverify falha runtime faltante. «21.librarymodes»
ND-8437. Site artifact 1.1.82: verify assertion de static file types only (scan recusa qualquer serverless function file), bridge e2e contra testrelay localhost, site empacotado como devthink-site.zip com hashed assets e immutable cache config (zero server functions, zero edge functions, zero redirect rules). «04.releasepipeline;todo»
ND-8438. MCP CI 1.1.84: containerfile smoke boota o self-hosting runner, sobe mcp listener como child e responde json rpc ping (`--check` mode como build check); stdio transport coberto in-process; mcp client example shipa como dist/fixtures sem ci step rodando remote. «04.releasepipeline»
ND-8439. Native smoke 1.1.85: nativesmoke.mjs contra fake host (handshake length-prefixed, capability negotiation, wsbridge envelope round trip, token auth, idle sweep, secret exclusion), host manifest instalado para profile isolado e REMOVIDO após smoke com assertion de nativeMessaging ausente do required set. «04.releasepipeline»
ND-8440. Cross-browser CI 1.1.86: firefox prep step (overlay via firefoxprep adapter + assertion de host permissions vazios), addons linter quando instalado, firefox load smoke; releases anexam xpi firefox e safari zip ao lado do chromium zip. «04.releasepipeline»
ND-8441. Publishing chain 1.1.87: channel jobs (githubpackages, npmjs, maven, nuget, container, digest, vsix, firefox, site) gated no assemble; publish com 3 attempts bounded growing pause; attestation job após cada channel; sbom cyclonedx de todo artifact; attestations via workflow identity OIDC (nenhuma signing key no repo); releaseassets job emite artifact manifest (name, bytes, sha256, channels); release requer environment protection `release-approval`. «04.releasepipeline»
ND-8442. Migration legada NuGet: `migratelegacynuget` completou em v1.1.12 (delete exato do pacote superseded após preflight name+namespace) e o job + todos os package-deletion commands foram REMOVIDOS em v1.1.14 — tokens futuros não carregam capability destrutiva. «04.releasepipeline»
ND-8443. Deep manifest check 1.1.80: valida cada key contra runtime policy allowlist, reporta file+line de cada permissão, valida CSP script hashes contra os bundled bytes (unsafe-inline/eval/wildcard recusa; hash que não pina arquivo shipado recusa), web accessible resources contra o reviewed set (sandbox.html único web exposed page), recusa permissão no required E optional simultaneamente. «01.extensionpermissions»

### Bloco P — Evidência CRX e política anti-cópia (ND-8444..8453)

ND-8444. Política evidence-only do crxharvest: todo pacote baixado é UNTRUSTED DATA — análise estática de texto apenas, nunca executa código baixado, deleta todo raw artifact imediatamente após a análise, persiste só derived records. «mjs/crxharvest;12.crxfeaturemining»
ND-8445. Inventário cobre 67 IDs do update service oficial: 62 manifests verificados, 5 indisponíveis/inválidos (404/inspection error) — indisponibilidade reportada como evidência, não inferida. «08.artifactinventory»
ND-8446. Um manifest é technical evidence de declared scope, NÃO autorização de reuso de código, branding, UI ou protocolos proprietários de terceiros. «08.artifactinventory;06.userstorecatalog»
ND-8447. Aggregate estático: storage declarada por 57/62 pacotes, tabs 41, scripting 38, activeTab 37, debugger 31 — broad permissions são comuns e NÃO são requisito para o Devthink. «09.artifactstaticmetrics»
ND-8448. Feature mining mapeou 2456 feature items e 251 pares distintos de API dos CRXs — o feature pool alimenta o roadmap com grounding, nunca cópia. «12.crxfeaturemining;13.evolutionroadmap»
ND-8449. Comparative feature matrix (07) cobre 44+ repos públicos (browser-use, puppeteer, playwright, scrapling, skyvern, automa, midscene, selenium ide…) como discovery signals com license note — hypotheses a validar, não claims verificados. «07.featureflowmatrix»
ND-8450. Pool audit gate (1.1.99): cross-reference do feature pool de 626 itens contra o corpus shipped de 4.072 símbolos — 623 implemented e 3 planned, disposition documentada. «13.evolutionroadmap»
ND-8451. Matrixverify gate (1.1.99): 335 kind catalog sobre os fake tabs de todo browser kind com 18 células a 100% coverage. «13.evolutionroadmap»
ND-8452. Telemetry-free verification: tests/telemetryfree.mjs prova ZERO outbound attempts atrás de block-all proxy. «13.evolutionroadmap»
ND-8453. Soak run gate (tests/soak.mjs) e defect sweep gate (tests/sweep.mjs coletando audit trail failures com dedupe + source scans + runtime checks) fecham os release candidates. «13.evolutionroadmap»

### Bloco Q — QA, gates de documentação e CLI (ND-8454..8465)

ND-8454. Doccheck gate: cobertura de kinds do kinddocs EXATA contra o catálogo — kind count mismatch ou entry sem campos falha. «kinddocs»
ND-8455. CLI smoke do verify chain: `node dist/cli.js help` verifica o command surface após todo build; planlint corre sobre todo example plan em dist/fixtures/plans; runworkflow em dry run sobre example workflows emitidos. «04.releasepipeline»
ND-8456. Flat package: npm pack distpackage publica tarball com library surface na raiz — um arquivo por correlated domain com grupos caps/schemas/fixtures, nenhum path nested past two directories; fixtures no grupo fixtures/. «04.releasepipeline»
ND-8457. `devthink manifest` deep checks + permission source lines + CSP hash verification + web resources + duplicate set refusal compõem o clitools module (1.1.80) junto de planlint, runworkflow com streamed progress, review gate, sealed audit trail e dry run mode. «01.extensionpermissions;todo»
ND-8458. Readiness gate (tests/readiness.mjs) com go decision em docs/readiness.md; migrateplan com importers automa, selenium, ui.vision e tabular; example gallery de 36 recipes (tests/recipes.mjs). «13.evolutionroadmap»
ND-8459. Notes assembly: full chain consolidada em docs/releasenotes.md; release candidate documentation em docs/releasecandidate.md e docs/perfbudgets.md. «13.evolutionroadmap»
ND-8460. Release cadence: um release por vez, fully validated, pushed e released antes do próximo; EXATAMENTE 100 planned changes por release, nunca mais; correlated changes agrupadas por contexto. «13.evolutionroadmap»
ND-8461. Naming rule do projeto: identifiers lowercase, sem underscores, sem hyphens; docs em english. «13.evolutionroadmap»
ND-8462. Grounding rule: toda change traça para o feature pool de 12.crxfeaturemining ou para a architecture skill; consent-first nunca é removido — growth de capability remove arbitrary limits apenas. «13.evolutionroadmap»
ND-8463. Toda suíte de certificação roda em deterministic fake clock (nenhuma leitura de wall clock, fixtures do fixed epoch) e escreve artifacts byte-idênticos (entry count fixo, sem timestamps) para reruns determinísticos. «22.performancemodel»
ND-8464. Vitest suite cobre environment routing por action kind, worker round trips, sandbox noncing + handler stripping, keepalive heartbeat/port closure, zombie detection/reaping, restart recovery, quota pruning e concurrency lock — tudo em plain fixtures. «14.executionenvironments»
ND-8465. A UI polish family do 2.0.2 fechou 16 audit gaps: keyboard focus order, high contrast, notification plurals, dashboard resize, unused-style pruning, icon set completo. «13.evolutionroadmap»

### Bloco R — akash: site builder + hosting manager (ND-8466..8475)

ND-8466. akash é um site builder/hosting manager com provider próprio `AKASH_MANAGED` (internalRepoName auto-gerado `akash-sys-xyz` + deploy access key `aks_live_...`) ao lado de providers de conexão GitHub/GitLab/Cloudflare/Netlify/Vercel/AWS/Docker/Supabase/Wix. «ts/managed;tsx/Config»
ND-8467. DeploymentConfig por site: provider, autoDeploy (default true) e deployMode (DIRECT_UPLOAD para managed, EXISTING_REPO para git providers). «tsx/Config»
ND-8468. Config page em tabs IDENTITY | DEPLOYMENT | DNS | DANGER — DNS tab gerencia DnsRecords do site; danger zone concentra operações destrutivas. «tsx/Config»
ND-8469. AddSite wizard sugere estrutura do site via Gemini (`suggestSiteStructure`) com campos de conexão por provider (`getConnectionFields`/CONNECTION_PROVIDERS) e gera project hash/sanitized id (`generateProjectHash`, `sanitizeProjectId`). «tsx/AddSite»
ND-8470. Component library com 28 componentes prontos tipados (LibraryComponent com id/name/type/category/data/customCode): heroes (Gradient, Minimal, Split, Dark, App, Video), navbars (Modern, Centered, Dark, Glass), features (Grid, Bento, Alternating), pricing, CTAs (Simple, Gradient, Stats, Newsletter), footers, stats, team, testimonials, blog, logo cloud, FAQ, contact. «ts/index__2;ts/extras»
ND-8471. Components page com views GALLERY|EDITOR e tabs MINE|COMMUNITY, ComponentCustomizer, GeminiChat embutido e RenderComponent registry com labels/ícones. «tsx/Components»
ND-8472. Designedit usa @dnd-kit/core + sortable (closestCenter, arrayMove, useDragSensors) para reorder de componentes de site, com blog posts (BlogPost) e EditorTab. «tsx/Designedit»
ND-8473. Home marketing usa framer-motion (useScroll/useTransform/useSpring/AnimatePresence) com kit glass próprio: FluidGlass, GradualBlur, GlassSurface. «tsx/home»
ND-8474. MetallicPaint é componente shader com ShaderParams (patternScale, refraction, edge, patternBlur, liquid, speed) e defaults documentados. «tsx/MetallicPaint»
ND-8475. Serviços transversais: CacheService, utils (generateId, cn), anti-border/aesthetic/animation helpers, xss-protection, devtools-blocker, i18n en/pt, responsive e translation modules. «inventário ts/»

### Bloco S — SoFlowX: plataforma social dev com IA (ND-8476..8482)

ND-8476. SoFlowX (soflowx.app, "SoFlowX - AI Platform" v1.0.0) separa responsabilidades com postura de módulos: `sync.ts` APENAS sincroniza e escreve na tabela Supabase (não é servidor, não é jogo, não é auth); `server.ts` RODA os serviços; `playnow.ts` cuida de salas de jogo, notas, posts, comentários, likes e chats. «ts/sync;ts/server;ts/playnow»
ND-8477. Server Express + Socket.IO na porta 3003 por compatibilidade com Caddy e produção, com helmet, cors, e middleware de request sanitizer, rate limit, brute force check e IP access control. «ts/server»
ND-8478. Stack de segurança client: FingerprintJS (visitor id), DisableDevtool, DOMPurify e sanitize-html; JWT verify + revogação de token na sync layer. «ts/security;ts/sync»
ND-8479. Notas versionadas (Note com id, user_id, title, content, version, timestamps, is_public, blob_url, tags) com salas de jogo e chats em tempo real via socket. «ts/playnow»
ND-8480. AI layer multi-provider: gemini, kimi, claude, gpt4, openai, deepseek, perplexity, togetherai, xai — com context, userApiKey, systemPrompt, temperature e maxTokens por request (GoogleGenerativeAI, OpenAI, Anthropic, @ai-sdk/openai-compatible). «ts/ai»
ND-8481. Integração StackOverflow API 2.3 (SO_API_BASE_URL api.stackexchange.com, SO_API_KEY via env): busca de questions com score/answer_count/is_answered/view_count/tags, owner profile e accepted_answer_id. «ts/oflow»
ND-8482. Build/dev: vite + @tailwindcss/vite + react-swc com rollup-plugin-obfuscator; dev concurrently vite+server (variantes tsx watch, bun watch, node watch, nodemon); build:netlify com NODE_VERSION 25.9.0; keywords SEO pt/en (brand, core, AI) para soflowx.app. «json/package;ts/vite.config;toml/netlify;txt/keywords»

### Bloco T — @devthink/ansi-art (ND-8483..8486)

ND-8483. `@devthink/ansi-art` v1.0.0 (MIT, ESM, sideEffects false, node ≥26.2): biblioteca de gráficos ricos de terminal com text art, gradients, charts, animations, widgets e Ink components; exports `.` (dist), `./ink` (ink-components) e `./cli`. «json/package»
ND-8484. Sistema de fontes FIGlet-style extensível: CharMap (Record<string, string[]>), AsciiFont (name, height, chars), FontRenderOptions com font/foreground/background/styles; FONT_STANDARD com blocos ██. «ts/fonts;ts/text-to-ansi»
ND-8485. Animation engine com escape codes (ESC, RESET, CURSOR_HIDE/SHOW, CLEAR_SCREEN, MOVE_HOME) e 10 easings (linear, easeIn/Out/InOutQuad, …Cubic, …Quart). «ts/animation-engine»
ND-8486. Charts bar/line/pie com DataPoint (label, value, color) e utils fg/bold/dim/visibleLength; módulos de imagem: image-to-ansi (converter), image-to-ansi-effects, image-to-ansi-lite, logo-to-ansi, svg-renderer, image-display; layout/table/box/widgets; scripts demo e benchmark; check = typecheck + biome lint + vitest. «ts/charts;inventário ts/;json/package»

### Bloco U — gl: Gambiarra Labs (ND-8487..8490)

ND-8487. gl é o site da marca Gambiarra Labs (canal de tech BR de Michel Leonardo, "overengineering as a lifestyle", 9.790+ subs): site estático ES modules com root orchestrator que importa HOME, IDENTITY, ARCHIVE, UPLINK, HEADER, FOOTER, FX_LAYERS e initAutoTranslate. «md/README;js/main»
ND-8488. Translate module: cache v4 em localStorage (`translation-cache-v4`), target atual em `app-lang` (default pt) e translateContainer por seção. «js/translate»
ND-8489. SFX engine: efeitos click/transition/glitch1/glitch2 servidos de catbox.moe com preloader em cache, WebAudio audioCtx, pcmNoiseBuffer sintetizado e tracking de keys ativas; AUTOCLICK simula clique nativo no DOM para contornar políticas de autoplay. «js/sfx;js/autoclick»
ND-8490. Seções-módulo exportadas: HERO (slider de projetos Swiper.js com The_Founder etc.), SEARCH (buildIndex sobre .section-container), MODAL, LOAD_SCREEN com arte ASCII CRT "GAMBIARRA" em neon, TERMINAL (identidade Michel Leonardo), YOUTUBE, GITHUB_API (fetch repos per_page=15 sort=updated com fallback [] em erro), MARKDOWN, LANGUAGE_SELECTOR, UPLINK_FORM, LINKS, CARD, ABOUT, FEATURES, GIT. «inventário js/»

### Bloco V — nathlan (ND-8491..8493)

ND-8491. nathlan é um site React one-page com pages Hero, Founders (+FounderDetail), Services, Portfolio (+ProjectDetail), Products, Checkout, Settings, About, WelcomeScreen e DedicatedPageWrapper, com FloatingSidebar, Navbar, Footer, PageTransition e framer-motion AnimatePresence. «tsx/App;inventário tsx/»
ND-8492. AKIA JS engine (loader de alta performance): prepara superfície com ZERO layout shift (root opacidade 0→1 transition), injeção paralela de dependências (tailwindcss CDN + babel standalone 7.28.5 + import map), design carregado de ts/design.ts. «js/akia»
ND-8493. design.ts é o design system centralizado (palette slate 950/900/800, text slate com accent indigo 400, typography, positioning) aplicado pelo akia.js na inicialização; Logo renderiza logo.svg/orb.svg importados ?raw como single source of truth e desenha em canvas three.js; AudioController com FX_PROFILE de bands calibradas (48000Hz 16Bits, hardware ceiling map documentado); security.ts embute "DevTools Killer" (debugger loop periódico que só atua com DevTools aberto); supabaseClient exige VITE_SUPABASE_URL/ANON_KEY com warn ausente. «ts/design;tsx/Logo;tsx/AudioController;ts/security;ts/supabaseClient»

### Bloco W — soochimp / NewsChimp (ND-8494..8495)

ND-8494. NewsChimp ("Notícias em Tempo Real") é PWA standalone (display_override window-controls-overlay, theme #6366f1, background #0f0a2e, lang pt-BR, categorias news/productivity/utilities/education, icon.svg any) de notícias com IA: top headlines, busca, categorias, Background/TopBar/SideBar/MobileNav/NewsFeed/ReaderModal/ErrorBoundary/CookieConsent. «json/manifest;tsx/App»
ND-8495. ReaderModal extrai artigo com @mozilla/readability, traduz pt/en/ja com translateTextChunk via proxies, tem TranslationToggle e statuses trilíngues; api.ts mantém REGISTRO UNIFICADO de libraries CDN (Lodash, Ramda, date-fns, Day.js pt-br, Moment, uuid, NanoID…) carregadas por useLibraries; service worker v9 com precache (/, /index.html, /icon.svg, /icon.png, /manifest.json), runtime cache e filtro de ad domains (pagead2, doubleclick, adtrafficquality) — ads servidos via VITE_GOOGLE_ADS_ID; Netlify toml com build na raiz. «tsx/ReaderModal;ts/api;js/sw;tsx/App;toml/netlify»

### Bloco X/Y/Z — bob, iakadion, soodeska (ND-8496..8500)

ND-8496. Bob Extension 0.6.0 é MV2 Chrome extension "for Handshake": omnibox keyword `bob`, background page persistente, content script em document_start/all_frames sobre file/http/https, permissions amplas (tabs, notifications, webRequest+webRequestBlocking, proxy, storage, unlimitedStorage, <all_urls>), CSP legacy com unsafe-eval, sql-wasm.wasm em web_accessible_resources. «json/manifest»
ND-8497. Os bundles do bob (backgroundPage/popup, webpack minificado) vendem a stack bcoin: bsert/bufio/bcrypto/bns (DNS estilo miekg/dns portado) + buffer/moment — evidência de implementação Handshake/naming em JS puro; código minificado sem spec extraível além da identidade. «js/backgroundPage;js/popup»
ND-8498. iakadion é o hub de perfil pessoal do dono do projeto (login GitHub iakadion, OPR-0019): README com typing svg, badges de 12 redes (Instagram, YouTube, X, GitHub, SoundCloud, Twitch, Bluesky, Threads, Reddit, GitLab, Behance, Dribbble), tech arsenal em skillicons (7×7: react/next/vue/svelte…rust/go/mongo…blender/threejs/webgl…) e windjets SVG (hero, whoami, projects1-3, status, creative-support, connect) servidos do repo. «md/README;inventário svg/»
ND-8499. O site iakadion (html/index + deploy yml) serve os windjets como cartões de seção e o svg/connect como call-to-action de contato — identidade visual consistente cyan (#00F7F7) sobre dark. «html/index;svg/connect»
ND-8500. soodeska: único material existente é o stub de README de 2 linhas ("news/video/entertainment/movie/sinopse alternative app open-source") — sem arquitetura, código ou spec: app reservado para definição futura, nenhuma feature derivável sem invenção. «md/README.txt»

---


## FASE 8b — Welcome SSOT Saddle + Note_08* + duck.ai research (fonte: neodocs-txt/Welcome-*, Note_08_*, document-*, duck.ai_*)

282 regras (ND-8501..8782; 8783..8800 reservado) em 18 blocos A-R: onboarding/SSOT v1.8.5+v1.8.18,
storage/memória virtual, runners free, engine/API/bots, scraping/AI, anti-detection, isolamento,
productização/registries, identidade/legal/release, receipts v1.8.18, plugin zai CLI (auth.json
13 cookies), gateway V1-V3, toolchains mobile (TSX→iOS/EAS, OTA itms-services), DNS/TLD, assinatura
IPA/APK, e-mail/search. Pulos: 12 Welcome = 2 supersets (md5), 11 duck.ai incrementos, sessions "oi".


### Bloco A — Onboarding/SSOT e governança (Welcome v1.8.5)

ND-8501. O onboarding do produto é um único documento SSOT em padrão open-architecture: parágrafos, subparagraphs e tabelas de duas colunas (Item/Layer/Mode/File | Detail/Rule/Example), voz observador em terceira pessoa, sem bullets nem emoji. «W2:9-11»
ND-8502. O produto publica-se como `@wenathlan/saddle` (v1.8.5) espelhado a npm, GitHub Packages, GHCR, Maven, NuGet, RubyGems e jsDelivr; o operador possui apenas contas, repo/pacote publicado e o breadboard de automação — nenhum workload roda na máquina dele. «W2:1-6»
ND-8503. Tese central do onboarding: bytes de storage e bytes de memória de compute são os mesmos bytes; a única diferença é a flag de uso (`process` para working set temporário vs `keep` para estado persistente). «W2:1-6»
ND-8504. Posicionamento honesto obrigatório: storage remoto não vira RAM/VRAM endereçável por CPU; o enquadramento correto é "free compute + storage-as-virtual-RAM cache" (swap, tmpfs, zram, mmap, FUSE). «W18a:6-8»
ND-8505. Library first: sempre construir como biblioteca convertida a ~30 modos; memória interna é prioridade e o código nunca fica preso a um runtime único. «W2:13-14»
ND-8506. Rejeitar Netlify Functions e Vercel Functions; o core não acopla host/porta/db; o adapter de servidor recebe host/porta como parâmetros. «W2:15»
ND-8507. Infra aberta: host e porta randomizados e depois travados; nunca localhost; 100% de escolha do usuário; qualquer provider trocável livremente. «W2:17»
ND-8508. Estrutura root-first: sem `/src`; arquivos na raiz; subpastas apenas por modo (web, docs, tests, desktop, android, ios, cli, extension); nunca pasta dentro de pasta. «W2:18,81-84»
ND-8509. Lógica agrupada em três camadas; máximo 20 lógicas por arquivo; um arquivo por contexto; JSDoc em inglês; nomes lowercase sem `_`/`-`. «W2:19»
ND-8510. NBIT (build independence): catálogo centralizado de versões; dependência mais simples e robusta; mistura de opções internas e externas. «W2:20»
ND-8511. node:* first: preferir built-ins Node antes de pacotes externos; externo só quando nenhum nativo cobre a necessidade. «W2:21»
ND-8512. Execução inline: `node -e`/import CDN antes de criar arquivo; scripts helpers em `/tests`; CWD only. «W2:22»
ND-8513. Compliance do onboarding: WinterTC/ECMA-429 (API cross-runtime), RFC 9309 (robots), Zod v4 com `z.strictObject`. «W2:23»
ND-8514. Piso cross-runtime declarado: Node ≥26.2.0 / Bun ≥1.4.0, com npm/bun/deno/wasm como floor de execução. «W2:41»
ND-8515. Consultar a data antes de qualquer tarefa; dependências na versão mais recente; prática mais atual da data (date-aware). «W2:53»
ND-8516. Docs e comentários: JSDoc `/** */` claro, inglês apenas, observação por seção; formato por títulos e tabelas sem underscore/hífen/asterisco; zero emoji em código e docs. «W2:58-61»
ND-8517. Error catcher embutido (try/catch) em todo código para rastreio posterior de erros. «W2:62»
ND-8518. Espelhos de forge: `.gitlab`/`.forgejo`/`.codeberg`/`.woodpecker`/`.gitea` espelham `/.github` com os mesmos workflows adaptados. «W2:76-80»
ND-8519. V8 manifest rule: manifesto plano de 1 nível, categorizado por prefixo numérico no nome (`001`, `002`…), Title Case com espaços, sem aninhamento nem `_`/`-`; `ls` é a documentação e a ordem alfabética é o diagrama. «W2:88»
ND-8520. Modelo de capacidade da caixa 8 GB: kernel/OS ~500MB, Docker ~200MB, WASM ~100MB, overlay Firecracker ~50MB, app ~2GB, sandboxes ~4GB, cache ~1.15GB; tuning `vm.swappiness=180` e zram 3:1 (8→24GB efetivo). «W2:111»
ND-8521. Pool de infra gratuita: GitHub 500MB + HF ~10TB + Kaggle 20TB + Terabox 3TB + npm ~ilimitado + Turso 9GB ≈ >33 TB de storage terceiro agregado. «W2:115»
ND-8522. Doutrina third-party-only: infra só conta como própria se estiver na máquina física do operador; repo em Azure/GitLab/HF com runner deles é terceiro; conta sua ≠ infra sua; footprint local 0 bytes. «W2:201-203»
ND-8523. Escada repo-as-processor V4: C1 Pages CDN serve JSON (0 minutos); C2 Git Queue usa Issues/Discussions/`queue/` como fila de mensagens; C3 Actions Worker é a única camada que consome minutos. «W2:210-214»
ND-8524. Modelo executivo do repo como computador: repo=disk, Actions=CPU (`workflow_dispatch` = function call), Pages=bus/CDN (JSON como memória compartilhada), site estático=BIOS, `repository_dispatch`=IPC entre repositórios. «W2:220-228»
ND-8525. Memory tiers L1-L4: L1 RAM do sistema, L2 VRAM de GPU, L3 storage-RAM nos repositórios (praticamente ilimitado), L4 buckets externos (HF/Kaggle/Terabox/R2, ilimitado); backends agregados via rclone num pool virtual único. «W2:243-252»
ND-8526. Regra de kernel do sandbox: sem KVM → gVisor `runsc`; com KVM → microVM Firecracker. «W2:290»
ND-8527. Zero-install: nunca `npm install`; todo pacote é carregado por URL (esm.sh, jsDelivr, unpkg, jspm) e roda as-is; import inline de CDN exige SRI `integrity="sha384-…"`; npm/NuGet usam OIDC Trusted Publishing. «W2:698-707»
ND-8528. Checklist de entrega de 10 pontos: deploy aberto sem Functions; infra aberta randomizada; root-first sem src; três camadas; multi-mode; NBIT; design text-fit/grid rígido/touch 44px; lowercase sem emoji; código meticuloso com CSS moderno; escolha total do usuário. «W2:2178-2194»
ND-8529. Reconciliation em vez de reescrita: VDR/UMCF fica documentado como direção explorada (não layout shipped) por divergir da identidade canônica e do flat-root; duplicações internas conscientes são registradas, não silenciadas. «W2:2195-2198»
ND-8530. O SSOT é versionado por snapshots (v1.8.5 → v1.8.18) com passes de gap-fill consolidados (décimo, décimo-primeiro, décimo-segundo) que apenas ADICIONAM conteúdo recuperado, sem remover entradas existentes. «W2:1740-1742,1827-1829,2006-2008»

### Bloco B — Storage backends e memória virtual

ND-8531. rclone é o agregador universal: 70+ backends (S3, R2, WebDAV…), `rclone copy/sync --transfers 8`, `rclone serve http --addr :8080` expõe o pool como FS/HTTP. «W2:96»
ND-8532. Quotas de bucket: R2 free 10GB + 10M ops (egress free, 5GB/file); Terabox 1TB/conta (4GB/file free); Telegram 2GB/file Bot API (4GB premium); Discord "infinito" via chunks de 8MB. «W2:97-101»
ND-8533. Hugging Face como storage: free unlimited best-effort; PRO $9/mo = 10TB público + 1TB privado; 500GB/file via Xet; upload por `HfApi.upload_folder` com `REPO_TYPE="dataset"`. «W2:98,107»
ND-8534. Kaggle como storage: 200GB privado total, público ilimitado, 50 arquivos top-level, egress free via CDN; criação via `kaggle datasets create -p <dir> --dir-mode tar`. «W2:99,107»
ND-8535. npm como CDN farm: 250MB tarball/versão; chunks renomeados `.bin.js` escapam do scan binário; `split -b 200M` → `chunk-NNN.bin.js` → `npm publish @user/assets-001` → servido por jsDelivr/UNPKG/esm.sh. «W2:99,116»
ND-8536. Cloudinary para mídia pesada (vídeo/screenshots/logs); o DB guarda apenas `url` + `cloudinaryId`. «W2:100»
ND-8537. Buckets de IA como storage: transcrição Whisper, embeddings/vetores, classificação LLM, OCR Vision e o bucket HF Models (além de Datasets) servem artefatos de IA. «W2:102»
ND-8538. dockerode (client Node) comanda a ponte storage→RAM e containers de sandbox sem CLI Docker; docker-compose via npm orquestra stacks multi-container. «W2:103,106»
ND-8539. Buckets legais adicionais: Storj (S3 descentralizado free), HF CSI driver (monta bucket HF como volume FUSE em pods Kubernetes), JuiceFS (FUSE client para qualquer API remota com cache híbrido rclone). «W2:104-106»
ND-8540. Escada de latência de memória por preferência: ram ~100ns · zram ~500ns · tmpfs ~1µs · mmap ~5µs · sqlite ~10µs · r2 ~50µs; auto-scale por tamanho (<64MB memfs; <1GB mmap; maior → SQLite/R2). «W2:112»
ND-8541. Receitas storage→RAM: swap file `fallocate+mkswap+swapon`; tmpfs `mount -t tmpfs -o size=8G`; `/dev/shm` já é tmpfs 50% da RAM; git em RAM via `--separate-git-dir=/dev/shm`; loop RAM disk com imagem de arquivo. «W2:274-280»
ND-8542. zram em produção: `modprobe zram`, `zstd` como algoritmo, `disksize` 8G, `swapon --priority 100`; amplificação 2-3×; zram-generator (systemd) auto-configura no boot; zswap é cache write-back distinto do zram. «W2:263-264,281-282»
ND-8543. Sysctl drop-in `/etc/sysctl.d/99-zai-memory.conf`: `vm.swappiness=180`, `vm.watermark_boost_factor=0`, `vm.watermark_scale_factor=125`, `vm.page-cluster=0`, `vm.overcommit_memory=1`. «W2:285»
ND-8544. cgroups v2 para sandbox: `memory.max`, `memory.high`, `memory.swap.max=0`, `cpu.max '400000 100000'`, `pids.max`, `io.max` por dispositivo, `memory.oom.group=1`. «W2:297»
ND-8545. Isolamento em camadas explícito: gVisor + cgroups v2 + seccomp + AppArmor + OverlayFS + Podman rootless; gVisor ~300 syscalls e ~200ms cold start. «W2:298»
ND-8546. MemoryEngine API: `load` (itera backends, primeiro hit vira buffer), `persist` (escreve em TODOS os backends), `release`, `safeLoad` (envelope `{success,data?,error?}`); 8 backends (github, gitlab, forgejo, gitea, huggingface, kaggle, modelscope, filehosting); transformações ~2× overhead. «W2:230-241»
ND-8547. StorageRAMBridge tipada: `map/sync/read/write/grow/close` com `PROT_READ=0x1`, `PROT_WRITE=0x2`, `MAP_SHARED=0x01` e `madvise MADV_RANDOM`; PagedBuffer de 50 páginas (~3MB residentes) com hash→offset determinístico. «W2:299-300»
ND-8548. SQLite como RAM: `PRAGMA journal_mode=WAL; synchronous=NORMAL; cache_size=10000; temp_store=MEMORY`; tabela kv com LRU-touch `RETURNING value`; packages com tarball BLOB. «W2:301»
ND-8549. Spillover GPU→RAM legítimo: transformers `device_map="auto"` com `max_memory={0:"7GB","cpu":"15GB"}` e `load_in_8bit=True`; bucket-as-VRAM é impossível (VRAM ~900GB/s vs remoto ~50-300ms). «W2:302,130»
ND-8550. Bibliotecas de ponte: memfs+unionfs, unstorage, `node:sqlite` builtin, `@riaskov/mmap-io`, `@cloudpss/mmap`, shared-memory IPC (`shm-typed-array`, `node-shared-mem`), `random-access-memory`;DiskLLM (~57× menos RAM), StorageLLM (MoE offload), m-store (RDMA/CXL). «W2:269-271,1309-1310»
ND-8551. Git-as-FS prior art: Presslips/gitfs (1.2k★), libgit2, go-git, isomorphic-git, gitfs python; DVC/LakeFS para dados; github-storage como file-DB ~5000 req/h. «W2:309,157»
ND-8552. WASM no browser: teto default 4GB; WASM 3.0 Memory64 eleva para 16GB por instância; em-browser executa via Gateway/Worker-Sandbox/WASM-runtime + Drizzle com guarda de loop infinito de 8s e isolamento SharedArrayBuffer+COOP/COEP. «W2:158,316»
ND-8553. Defesa OOM do browser mesh em 3 camadas: (A) `RangeError` em `WebAssembly.Memory.grow` >512 páginas; (B) watchdog do Worker Polla `performance.memory` a cada 500ms vs teto 128MB → `self.close()`; (C) Gateway `.terminate()` + rollback por snapshot estável via GET-by-ID. «W2:317»
ND-8554. Segurança do mesh: token HMAC-SHA256 (Web Crypto) com janela replay de 5min validado em edge middleware; `rewrites()` do next.config mascara rota de backup (same-origin anti-CORS); backpressure com `MAX_CONCORRENCIA=1` por aba. «W2:318»
ND-8555. Persistência per-ID: SQLite por sessão via `getOrCreateDbById` (Drizzle: `enderecoPonteiro bigint PK`, `blocoBinario blob`); dashboard vivo de heap/CPU; CI roda `wasm-opt -O3` com nome content-hash e `Cache-Control: immutable`. «W2:319»
ND-8556. Delta sync com Fletcher-32 por bloco de 1KB: só páginas sujas viajam, colapsando payloads de MB para bytes e upserts de milhares para 5-10 linhas; `resetLocalLedger()` no rollback. «W2:1346»
ND-8557. Git REST atômico em 3 passos: blob → tree → commit; resultados de commitam de volta aos repos; OCI registries servem de storage content-addressed via `oras push`; Chainloop CAS para auditoria imutável. «W2:518-520»
ND-8558. Mapa de tipos ponteiro no SQL: Text = path de object-store; bytea/Blob/Bytes = chunk 1MB; json/jsonb = manifesto (nunca container base64, +33%); BigInt = file_id/size >2GB; Int = chunk_index; Postgres varlena 1GB/TOAST, MySQL LONGBLOB 4GB. «W2:482-483,2025-2026»

### Bloco C — Compute runners e frota free

ND-8559. GitHub Actions: runner hosted 2 vCPU/7GB/14GB SSD 6h/job (tier maior 4/16GB); minutos OSS ilimitados; `ubuntu-slim` 1 vCPU/5GB/14GB/15min (jan-2026); 20 jobs simultâneos no público. «W2:136,157»
ND-8560. Forgejo/Gitea self-hosted ilimitados (~95%/90% compatíveis com GH Actions); Gitea runner via `docker run gitea/act_runner` com token de registro e docker.sock. «W2:137»
ND-8561. GitLab Free: 400 min/mês, 10GB projeto, small 2vCPU/8GB vs medium 4vCPU/16GB (2× custo); Pages 100MB e Container Registry contam separado; Premium tem large 8/32GB e xlarge 16/64GB. «W2:138,1958-1959»
ND-8562. Codeberg+Woodpecker: FLOSS ilimitado; storage soft 750MB + 1.5GiB LFS (aumentável por issue de storage request); labels `codeberg-tiny/small/medium` (1/2, 2/4, 4/8 GB). «W2:139,1957»
ND-8563. HF Spaces: 16GB RAM (suspende ~2 dias idle → cron keep-alive a cada ~47h); ZeroGPU ~96GB VRAM ~5min/day free; t4-small ~$0.40/h. «W2:140,159»
ND-8564. Kaggle compute: 30h/week T4 E 30h/week P100 separadamente; 4 CPU/29GB RAM/12h por sessão; `kaggle kernels push --enable-gpu` para notebook como runner. «W2:141,160»
ND-8565. Oracle Always Free: `VM.Standard.A1.Flex` 2 OCPU/12GB ARM/200GB; RAM/VRAM free agregada ~92GB (16 real + 32 zram + 12 Oracle + 32 GPU). «W2:142,161»
ND-8566. ModelScope: 2 contas notebook-VM + API OpenAI-compatible `api-inference.modelscope.cn/v1` (2000 calls/day, ex. Qwen/Qwen3.5-27B); 4 vCPU/16GB/50GB no free. «W2:143,162»
ND-8567. Cloudflare Workers como orquestrador free: 100K req/day, 128MB por Worker, D1 + Durable Objects + R2; rotas `/api/sandbox`, `/api/memory/stats`, `/api/github/hydrate`, `/cdn/:pkg/:ver`; wrangler.toml com bindings R2/DO. «W2:144,163»
ND-8568. Cadeia de provider: `oracle-cloud → github-actions → huggingface → gitlab-ci → kaggle`; primeiro runner free vence; `farm.py` round-robin `workflow_dispatch`; Workers na frente da orquestração; espelho multi-forge multiplica compute ~4×. «W2:165,205,808»
ND-8569. Repo-as-compute aritmética: 1 repo=500MB artefato; 100 repos=50GB "ilimitado"; farm de 100 `worker-N` repos; tmpfs fator 16× (5GB em 10 repos → 80GB de compute; 20 runners paralelos ×8GB = 160GB). «W2:807,489»
ND-8570. Vercel Sandbox: runtimes node26/24/22/python3.13, user `vercel-sandbox`, Docker+FUSE dentro de microVM, network policy por domain-allowlist, um usuário Linux por agente, secrets brokered (console.log não vaza env). «W2:156»
ND-8571. Serverless limits: Vercel Functions 26-300s std/edge ~50ms, ~1M invocações/mês free; Netlify 10s sync/15min async, 125k req/mês, e NÃO pode criar `child_process` (Python vira microserviço HTTP); AWS Lambda ≤15min. «W2:673,1245»
ND-8572. Cron de CI atrasa 50-60min (não é tempo real) — para produção usar Supercronic/node-cron/node-schedule em container sempre-ligado; Forge (self-hosted leve) como alternativa de CI local. «W2:674,2037»
ND-8573. Recycle de artefatos: cleanup cron semanal (`0 0 * * 0`) apaga artefatos GH >7 dias para caber no cap de 500MB via `actions/github-script@v7`; Forgejo self-hosted é explicitamente ilimitado. «W2:1950-1951»
ND-8574. Codemagic/Bitrise/Appcircle/Xcode Cloud como CI/CD mobile cloud; GitHub Actions com runner macOS automatiza `xcodebuild`+Fastlane. «DK1:219-226»
ND-8575. Runtime pickers de thin-client: GitHub / Forgejo / Codeberg / GitLab / Farm-mode; sandbox selector `gpuEnabled→hf, ramLimit>16384→gitlab, else github`; keep-alive runner `sleep 3600`; sandbox id `sbx-${Date.now()}-${rand}`. «W2:166,2169-2170»
ND-8576. Sandbox recipes por forge: GH `.github/workflows/sandbox.yml` com `repository_dispatch` (create-sandbox) + container `--memory 8G --cpus 4 --tmpfs /tmp:4G` + zram; GitLab escolhe `saas-linux-medium` quando ram>8192; Codeberg usa `ubuntu:22.04` + zram-config. «W2:1633-1637»

### Bloco D — Engine, API, lifecycle e bots

ND-8577. Engine converte job serializável em working set temporário, executa via provider selecionado, escreve no storage adapter e emite trilha de eventos; funciona sem extensão, browser ou memória externa. «W2:321»
ND-8578. Layout do engine em 8 contratos: core (errors/ids/clock/events/tracing), domain (jobs/sessions/artifacts/providers), storage (adapter+checksums), memory (prepare/sync/cleanup), runners (factories+scheduling), runtime (orchestration), cli, tests. «W2:325-333»
ND-8579. Lifecycle canônico: `jobqueued → jobpreparing → runnerselected → jobrunning → jobsyncing → storagecommitted → jobcompleted`; falha emite `jobfailed` (code, retryability) e cleanup em `finally`; retry na fronteira scheduler/orchestration. «W2:378-380»
ND-8580. Resolver de modos (`saddle modes`): retorna profile + capability map SEM iniciar server/browser; eixos execution/runtime/memory/file/dependency/visibility/pair; 29 modos planejados; primeira entrega = library/cli/binary + memória internal/file. «W2:382-384»
ND-8581. Cascade de estratégia: `mode:fetch` → fetch.ts; `mode:browser` → browser.ts; `mode:auto` tenta fetch, detecta necessidade de JS e escala para Playwright. «W2:391»
ND-8582. Par com/sem browser: Playwright (Chromium/Firefox/WebKit) para SPA/JS; fetch+Cheerio para estático; par com/sem Node via node:fs/child_process/SQLite vs Bun/Deno/edge/browser. «W2:388-389»
ND-8583. Captura de computer-use: browser real Brave via Playwright com perfil do usuário; fluxo capture→movement→JSON log→storage→replay; log `docs/logs/<sessionId>.json` (v1) com session/events/captcha/metrics. «W2:400-402»
ND-8584. Página de teste de captcha usa sitekey pública hCaptcha `a9b5fb07-92ff-493f-86fe-352a2803b3df` e expõe `window.__UKA_CAPTCHA_TOKEN__`/`__UKA_CAPTCHA_PASSED__`. «W2:404»
ND-8585. MCP opcional: tools scrape/crawl/batch/extract/serialize (JSON-RPC); `browsertools` expõe snapshot/action como MCP tools; fila in-memory/persistent/resumable com resume explícito por adapter. «W2:411-412»
ND-8586. Segurança de transporte: `assertresolvedpublicurl` rejeita alvo privado/rebinding antes do transporte (SSRF); `assertredirectchain`; webhooks com HMAC + idempotência por delivery id; envelope requestcontext successpayload/errorpayload. «W2:414-417»
ND-8587. Event bus tipado via `emittery` (async-first, AbortSignal, Symbol.dispose) substituindo Node EventEmitter; eventos request:start/response/error/retry/complete, cache:hit/miss, proxy:rotate/error, crawl:discover/complete. «W2:418-419»
ND-8588. Proxy: auto-disable após 3 falhas consecutivas, cooldown + revive (graveyard 300s, probe `httpbin.org/ip`); estratégias round-robin/random/sticky; HTTP/HTTPS/SOCKS5; regra `socks5h` resolve DNS no proxy. «W2:423,438-439»
ND-8589. Cache em camadas: L1 lru-cache v11; L2 keyv com SQLite/Redis/IndexedDB; GET condicional por ETag/Last-Modified; TTLs por conteúdo (artigo 24h, lista 4h, JSON 30min, efêmero 30s, sensível 0). «W2:424,628»
ND-8590. SaddleBot multi-plataforma: API `start/stop/executeCommand/handleWebhook/scheduleTask/getStatus`; PlatformAdapter (Forgejo/Gitea reutilizam adapter GitHub com baseUrl); comandos capture/scrape/review/deploy/memory/test/release/webhook/schedule/publish/artifact/status. «W2:836-838»
ND-8591. Registro como app terceiro de desenvolvedor: GitHub App/OAuth App, GitLab OAuth+bot, HF OAuth+Spaces, Bitbucket/SourceHut OAuth, bots de chat (Discord/Telegram/Reddit/Slack/Mastodon/Matrix/Bluesky/WhatsApp); nunca serviço hospedado. «W2:821-831»
ND-8592. Webhook idempotente: entrega at-least-once; chave `eventId`/`X-GitHub-Delivery` (HMAC) gravada antes do processamento; backoff exponencial 1→2→4→8s; Saga com compensações (ex.: rollback de blob se DB falhar). «W2:846-848»
ND-8593. OAuth model: GitHub Apps per-repo > PATs; OIDC Trusted Publishing (token-exchange) para npm/NuGet; OIDC federado para creds curtas de CI/CD; NuGet.org ainda não suporta trusted publishing self-hosted. «W2:845,1011»
ND-8594. Catálogo de plataformas: 911 plataformas em 74 categorias destiladas de corpus bruto (~6.700 sites, ~10.600 URLs); ecossistema de 33+ bots derivados (FreeClaw, robin, acrobot, li-agent, AutoAR). «W2:806,853-864»
ND-8595. Rate limits da API: global 1000/min, `/v1/scrape` 10/min, por user-key e por domain token bucket; monitorar `X-RateLimit-*` e respeitar `Retry-After` com margem de segurança de 10%. «W2:569,435»
ND-8596. Retry classes: retryable 429/500/502/503/504/408/409/520-530 + ECONNRESET/ETIMEDOUT/ENOTFOUND/ECONNREFUSED; nunca retry 400/401/403/404/410/422/451/407/426; recuperação WAIT_AND_RETRY/ROTATE_PROXY/REDUCE_CONCURRENCY/REVIEW_ROBOTS_TXT/STOP_CRAWLING. «W2:584-586»

### Bloco E — Scraping, extração, AI e formatos

ND-8597. Markdown first: converter HTML→Markdown antes do LLM (60-80% de redução de tokens); estimateTokens ≈ chars/4 (~70% preciso); tokenizers js-tiktoken (o200k_base), gpt-tokenizer, bpe-lite. «W2:867-868,873»
ND-8598. Pipeline RAG: Fetch → Extract → Normalize → Markdown → Chunk (400-512 tokens, overlap 10-20%, SHA-256 dedupe) → Embed → Store; metadata RAG: headingPath, contentHash, parentChunkId, sourceUrl, tokenCount, contentType, near-duplicate threshold 0.95. «W2:869,874»
ND-8599. llms.txt: variantes compact/full com links absolutos HTTPS; exatamente um H1, blockquote summary, formato llmstxt.org + llms-full.txt concatenado; máx 100 links; adotantes Vercel/Anthropic/OpenAI/Stripe/Supabase, 840+ sites. «W2:870,459-460»
ND-8600. Ordem de extração: JSON-LD → Microdata → OpenGraph/Twitter → data-* → CSS selectors; heurísticas de framework `__NEXT_DATA__`, `_next/data`, `__NUXT__`, `window.__INITIAL_STATE__`, `data-reactroot`, `ng-app`, `___gatsby`, `__remixContext`, `astro-island`. «W2:625-626»
ND-8601. HTML→Markdown benchmarkado: mdream (Rust) ~0.34ms/166KB (33× mais rápido), node-html-markdown ~14.31ms, Turndown ~11ms; parser comparison Cheerio ~10M/semana, jsdom ~8M (~50MB/page), node-html-parser ~300K, parse5 (~235M indireto). «W2:967,1899»
ND-8602. Sanitização: sanitize-html no server vs DOMPurify no browser; `entities` é o decode mais rápido; XPath ausente no Cheerio — adicionar via cheerio-select (disponível) ou xpath. «W2:627,1899-1900»
ND-8603. Crawl: BFS (`enqueueLinks`) vs DFS (`forefront:true`); robots.txt via robots-parser (RFC 9309) + sitemaps (sitemapper); normalização de URL tira `utm_*/fbclid/gclid`; frontier p-queue (priority 1-10) + maxCrawlDepth; `maxConcurrency` 2-3/domain com Crawl-delay. «W2:624,629»
ND-8604. Defaults do scraper: timeout 30000, scrollDelay 300, maxScrolls 50, retries 3, retryDelay 1000, cacheTTL 300000, viewport 1280×720, locale en-US; crawler maxDepth 2/maxPages 50/maxConcurrent 3; agent maxTokens 8000/chunkSize 512. «W2:355-356»
ND-8605. Formatos de saída first-class: Markdown, XML, JSON, Redis e texto puro (Redis `JSON.SET` e llms.txt são exclusivos vs concorrentes); CSV/Screenshot complementares. «W2:665,980»
ND-8606. Zod v4 como contrato: `z.strictObject`, `.prefault()`, `z.toJSONSchema()` (OpenAPI 3.1), ~14× mais rápido, ~26KB; `safeParse()` nas bordas, `.parse()` no boundary. «W2:632-634»
ND-8607. Catálogo free de modelos (26 únicos: Zen 8 + OpenRouter 15 + Kilo 12 − 9 compartilhados) com ctx/out/modality por modelo; âncoras: deepseek-v4-flash-free 1.048.576/393.216 text; mimo-v2.5-free 1.050.000/131.072 omni; step-3.7-flash 262.144 out text+image. «W2:876-878,916-946»
ND-8608. Token prices hardcoded de 2024 (gpt-4o, gpt-4o-mini, gpt-4-turbo, claude-3.5-sonnet, claude-3-haiku, gemini-1.5-pro/flash) são débito técnico a externalizar em config. «W2:968,1905»
ND-8609. Computer-use benchmarks: OSWorld humano 72,36% vs SOTA 12-20%; OpenAI Operator 87% (complex JS)/58% WebArena; Google Mariner 83,5%; browser-use 89,1% WebVoyager; híbrido recomendado = DOM/a11y tree + VLM + scripts determinísticos + screenshot diff. «W2:996,1923»

### Bloco F — Anti-detection, fingerprint e captcha

ND-8610. Política opt-in: superfícies de stealth nunca habilitadas silenciosamente; sem bypass automático de challenge; sem patching stealth por default (captcha/contract detect/request/solve/assert com solver injetável). «W2:429-431»
ND-8611. Coerência de fingerprint: 1 fingerprint coerente por sessão (OS↔UA↔engine↔locale↔timezone↔touch↔pixel-ratio); rotação só entre sessões; 1 fingerprint = 1 proxy = 1 sessão. «W2:432-434,523»
ND-8612. Distribuições de fingerprint: browser Chrome 65/Safari 18/Firefox 12/Edge 5; OS Windows 55/macOS 25/Linux 15/Mobile 5; resolução 1920×1080 30/1366×768 20/1536×864 15. «W2:436»
ND-8613. Stack stealth 2026: patchright + crawlee SessionPool (maxPoolSize 100, maxUsageCount 50, maxAgeSecs 3600) + proxies residenciais; JA4 (FoxIO 2024, SHA-256) > JA3 (MD5 spoofable); plugins sozinhos insuficientes vs Cloudflare/Akamai/PerimeterX/DataDome/Imperva. «W2:435,524-526»
ND-8614. HTTP/2 fingerprints como baseline JA4: Chrome 125 SETTINGS `0|1|0|0|0|0|1|0|0|0|0` + PRIORITY `0|3|0` + WINDOW_UPDATE 15663105; Firefox 125 SETTINGS `0|0|0|0|0|1|0|0|0|0|0` + WINDOW_UPDATE 12517377. «W2:437,530»
ND-8615. Benchmark de detecção (bot.sannysoft/nowsecure/creepjs, Ubuntu 22.04, mar/2026): CloakBrowser 26/2 · patchright 24/4 · puppeteer-extra-stealth 18/10 · vanilla Playwright 26/2 (menor=better); `rebrowser-playwright` unmaintained desde 2024. «W2:529,532»
ND-8616. Cascade de captcha: P1 stealth (fingerprint+TLS evita o trace) → P2 comportamental (Bezier mouse, typing lognormal) → P3 solver (hcaptcha-challenger LLM+ONNX ResNet/YOLOv8/ViT, NopeCHA, ClickSolver, 2Captcha, CapSolver 30+ tipos). «W2:591-596,1920»
ND-8617. Mapa solver ONNX: image_label_binary→ResNet; area_select:point→YOLOv8; bounding box→YOLOv8 segmentation; image_drag_drop→Spatial Chain-of-Thought; multiple_choice→ViT zero-shot. «W2:605»
ND-8618. Tipos de captcha além do óbvio: FunCaptcha (Arkose), GeeTest, KeyCaptcha, Amazon WAF, DataDome, Akamai, Imperva, Friendly, MTCaptcha, Lemin, Cutcaptcha, Tencent, Yandex, ALTCHA, Prosopo. «W2:609»
ND-8619. Mitigação por camada: fingerprint → coherence map + 1 proxy/sessão; comportamental → Bezier/lognormal; TLS → JA4 + patchright; IP → rotação residencial/mobile; captcha → cascade P1/P2/P3; tiers residential > mobile 4G/5G > datacenter (~$15/1000 vs ~$0.50). «W2:533-536»
ND-8620. Modelo de movimento humano: rampa de velocidade 0,3×→2,5× (0-5% → cruzeiro 2,3-2,5× com seno → ease 75-100%); typing lognormal μ=4,17 σ=0,3 (~65ms) com ~2% typos; overshoot ~15%; duração por Fitts `0.05+0.07·log2(1+dist/20)`s. «W2:440,1388»
ND-8621. Evidência de captcha sem segredos: guardar hash/metadata (token, screenshot, trace, mp4) em vez de credenciais brutas; solver pipeline `launchBrave→navigate→detectCaptcha→solve→record→assert(passed)`. «W2:431,597-598»

### Bloco G — Isolamento e execução segura

ND-8622. Escada de execução por risco: V8 Isolates (`@edge-runtime/vm`, isolated-vm <5ms <5MB) default para código não-confiado; WASM para Rust/Go/C++/Pyodide; MicroVM (Firecracker/Kata/gVisor) para host boundary. «W2:667-669»
ND-8623. Matriz de estratégia 3-vias: child_process (isolamento nenhum, perf alta, risco de injeção; serverless bloqueia subprocess); Pyodide-WASM (moderado; falha em wheels C/C++ compilados); MicroVM (alto; preferido para código terceiro não-confiado); Saddle escolhe híbrido por trust. «W2:672,686-695»
ND-8624. node:vm NÃO é boundary de segurança (CVE-2025-68613, CVE-2026-1470 de escape no n8n) — restringir loads ou usar isolated-vm/MicroVM; `vm2` banido (deprecated, RCE CVE-2026-22709). «W2:671,675»
ND-8625. Bridges CPython embutido (`pythonia`, `pymport`, `node-calls-python`, `nodepyx`) compartilham privilégio/ABI do Node — sandboxear como código in-process; Pyright é type-checker, NÃO executor (Pyodide executa). «W2:670,272»
ND-8626. Catálogo de microVM: Firecracker <150ms <5MB 150 VMs/s; CubeSandbox (Tencent) <60ms; gVisor <1s (5-15% overhead); Kata ~500ms; HiveBox 2-5MB 10-50ms; Crucible <170ms; Mitos ~27ms; kern Rust daemonless ~1.9ms; rust-nano-vm ~12ms; Fly.io Machines ~300ms. «W2:1215-1234»
ND-8627. Pesquisa 2026 de isolamento: WaSC (WASM+daemon 3× mais denso que Firecracker), Khronos (Type II exovisor, ~74 entry points vs 300 syscalls); WASI 2.0 component model distribui componentes como artefatos OCI via wash. «W2:1233,2015-2016»
ND-8628. Hardening de container padrão: `docker run --network=none --cap-drop=ALL --security-opt=no-new-privileges --read-only --pids-limit=512 --runtime=runsc` com RAM/CPU limitados. «W2:1235,676»
ND-8629. gVisor operacional: `runsc --platform=systrap --network=none --overlay2`; `runsc pause/resume` dá suspend/resume nativo; Docker-in-Docker `services: docker: dind --privileged` roda gVisor nested em CI; k8s via RuntimeClass runsc + resource-quota. «W2:296,1891-1893»
ND-8630. Telemetria de cgroup: ler `/sys/fs/cgroup/.../memory.current`, `memory.peak`, `cpu.stat` para stats per-sandbox de memória/CPU/pids. «W2:1894»
ND-8631. RAM guard reativo no Node: spawn captura stdout/stderr, `setTimeout` mata por timeout, `process.kill(pid)` quando RSS do filho excede teto (ex. 512MB) — contrastar com isolamento real por MicroVM. «W2:1890»
ND-8632. tinypool ^1.0.0 (worker-thread pool) entra no set de concorrência junto de p-map/p-queue/p-limit/BrowserPool/AutoscaledPool/cockatiel (retry/circuit-breaker/bulkhead). «W2:1886,633»
ND-8633. Runtime classes do engine: `VirtualMemory` (volumes memfs system/workspace/packages + cache de pacotes) e `MemoryBridge` (setup zram/tmpfs/overlay + `storageToRam`/`ramToStorage` lz4); SandboxInstance expõe writeFileSync/readFileSync/execute com timeout 5000. «W2:1639-1640,1863»
ND-8634. Per-ID provisioning: `getOrCreateDbById` cria `/dbs/[ID]/memory.db` (better-sqlite3) on-demand; cache de conexão por ID; BigInt serializado como String no JSON; upsert `onConflictDoUpdate` idempotente; histórico por `strftime` + `sum(length(bloco_binario))`. «W2:1663-1669»
ND-8635. OOM error codes canônicos: `OOM_PREVENTIVO_EXCEDIDO` (WASM grow >512 páginas/32MB) e `OOM_WATCHDOG_TERMINATE` (heap worker >128MB) postados ao gateway para rollback. «W2:1868»
ND-8636. WASM como asset estático: `.wasm` + shim sob `/public/wasm/` nunca inline no bundle principal; load on-demand com `instantiateStreaming`; build `wasm-opt -O3` (~40% menor) + content-hash no filename + `manifesto.json`. «W2:1886-1887,2137-2138»
ND-8637. WASI per-language: Go `GOOS=wasip1 GOARCH=wasm` (sem socket listen — shim stealthrocket/net); Rust wasm32-wasi; Python via Pyodide/PSF-wasi; Java via GraalVM AOT; Maven/NuGet → bytecode → WASM para runtime in-browser. «W2:1176,2094-2097»
ND-8638. Self-host "AWS": Coolify/Dokku em Hetzner ou PC doméstico exposto via Cloudflare Tunnel/ngrok é o caminho sem custo para "servidores virtuais" próprios do pool distribuído. «W2:1896»
ND-8639. Edge/serverless FS: better-sqlite3 (bindings C++) falha em Edge Runtime; FS serverless fora de `/tmp` é efêmero; Quarto Site precisa host containerizado (Cloud Run) ou driver Turso HTTP. «W2:159,1349»

### Bloco H — Productização, distribuição e registries

ND-8640. O pacote é buildado uma vez e reempacotado por target; nada roda localmente; desktop/mobile/n8n entregam apenas manifest + handlers caller-owned. «W2:740»
ND-8641. Superfícies de distribuição: n8n node first-class; extensão CRX (Chromium/Gecko); mobile nativo via Capacitor/Ionic/Electron/Unity; desktop Tauri (1 codebase, 3 builds nativos); lib `@wenathlan/saddle` + CLI `saddle`. «W2:744-750»
ND-8642. Identidade por registry: npm+GH Packages `@wenathlan/saddle`; GHCR `ghcr.io/wenathlan/saddle` (privado por default, label OCI de source); Maven `io.wenathlan:saddle`; NuGet `Saddle`; RubyGems `saddle` (host SEM trailing slash — barra extra causa redirect permanente 404). «W2:756-763,1561»
ND-8643. OpenClaw/ClawHub: `clawhub:@openclaw/saddle` com `runtimeExtensions ./dist/index.js`, `minHostVersion >=2026.6.8`, `pluginApi >=2026.7.1`, publisher sst-dev. «W2:764»
ND-8644. Extensão MV3: `protocol.js` (mensagens versionadas), `serviceworker.js` (roteamento vendor-independent), `worker.js` (bind MV3), `content.js` (DOM bridge isolado), popup; permissões mínimas começando em `storage`, sem broad host; SW rehidrata estado por evento. «W2:452-454»
ND-8645. Envelope MV3 transport-neutral: correlation id, metadata sender/tab, timeout, payload serializável, one-shot command vs long-lived port (sendMessage/connect). «W2:461»
ND-8646. SCDN: client TS de upload/download/delete via HTTPS+Bearer; config `.saddle/scdn.yml` + env `SBOT_SCDN_ENDPOINT/TOKEN/BUCKET/REGION/TTL`; providers Cloudflare Workers/R2/CloudFront/Bun/Deno/Vercel/Netlify edge; perf 50-200ms upload vs 200-2000ms storage direto. «W2:784-788»
ND-8647. Uso do SCDN: (1) hospedar assets do browser; (2) servir dados de sessão capturada; (3) entregar payloads de deploy; (4) cachear respostas de bot; (5) distribuir profiles/extensões. «W2:801»
ND-8648. Pages rules: sem COOP/COEP (usar coi-serviceworker p/ SAB, 1 reload); `.nojekyll` obrigatório vazio; asset paths relativos; importmap fallback esm.sh→jsdelivr→skypack com versões pinadas; pipeline `configure-pages@v5`+`upload-pages-artifact@v4`+`deploy-pages@v4`. «W2:812-813»
ND-8649. Opções de runtime browser: (1) SDK remote `opencode serve`; (2) WebContainers (proprietário, conflita com isolamento, falha no binário Go); (3) SW+Hono+OPFS; (4) WASM Go; (5) GitHub como storage (dump base64 + workflow_dispatch). «W2:814,1200»
ND-8650. Thin-client: UI ~50KB; Web Worker fatia chunks 2MB com SHA-256; octokit escreve `dumps/incoming/<job>-<n>.b64` (chunks base64 de 0x8000=32KB + preview 256B); `workflow_dispatch` com poll 3s; resultado descomprimido in-browser via DecompressionStream; PAT só em sessionStorage. «W2:776,1177,2100»
ND-8651. Pre-publish gates: sete portões — tests, lint, typecheck, build, README atualizado, changelog atualizado, nada de breaking sem major bump; `prepublishOnly` roda build+test; semver com `git push --follow-tags`. «W2:1491-1492»
ND-8652. Manifest contract: `engines.node >=26.7.0` (CI/containers), npm >=10.9.2, packageManager npm@12.0.2, `sideEffects: false`; Playwright optional peer ^1.62.1 via `./browser-playwright` reportando `OPTIONAL_DEPENDENCY_MISSING` se ausente. «W2:1493,397»
ND-8653. Dual entry ESM+CJS: `main: lib/index.js` com `import`/`require` condicionais; `bin: {saddle: bin/saddle.js}`; bug de export `"./ captcha"` (espaço stray) quebra resolução de subpath — nunca deixar espaço na chave de export. «W2:1484-1486»
ND-8654. Toolchain de build: tsup legacy/unmaintained → tsdown (Rolldown) recomendado (ESM default, DTS auto, exe/publint); binário standalone via `bun --compile` cross-target (linux-x64/arm64/musl/darwin/windows, bytecode, embed SQLite); Node SEA via postject; `@vercel/ncc` single-file. «W2:1506-1507,1839-1840»
ND-8655. Native→WASM swaps: better-sqlite3→bun:sqlite/sql.js; bcrypt→bcryptjs; sharp→pure-JS; rolldown-plugin-wasm; Android `.aar` (código+recursos) vs `.jar` (puro Kotlin/Java); gradle maven-publish com singleVariant release + sourcesJar. «W2:1841,1855-1856»
ND-8656. Purga de deps platform-locked: `@netlify/functions` e `@netlify/blobs` removidos por arquitetura; 27 deps de CLI/UI removidas (inquirer, ink, figlet, ora, blessed, cfonts…); optional deps: playwright-extra, puppeteer-extra-plugin-stealth, @parcel/watcher. «W2:1505,1852-1854»
ND-8657. Piso de cobertura: mínimo 60% de test coverage; um `*.test.ts` por módulo; vitest/biome/tsc --noEmit/tsdown como toolchain de gates. «W2:1508,1071-1074»

### Bloco I — Identidade, lineage, legal e release

ND-8658. Cadeia de predecessores: OpenCode Multi-Forge (repo-as-virtual-processor, farm.py) → UKA `@devthink/UKA` (computer-use + sandbox + captcha via Brave capture, domínio adquirido) → DevThink WebScrape `@devthink/webscrape` v2.0 (toolkit TS all-in-one) → Saddle `@wenathlan/saddle`. «W2:1459-1463,1410»
ND-8659. Evolução de nomes: CloudSandbox (`@cloudsandbox/core|cli|providers|storage`) → SandPlatform → `@devthink/saddle` → `@wenathlan/saddle`; variantes de fala Saddle/SADDLE/Seddon/Sedol — canônico é Saddle. «W2:1148-1149»
ND-8660. Histórico de versões do produto: V1 browser-runtime Pages → V2 thin client → V3 multi-forge + farm → V4 repo-as-virtual-processor → V5 100% third-party → V6 SQL-as-compute (TB pointers) → V7 REJEITADO (113 files nested, 1390KB, aninhamento 8 níveis) → V8 flat manifest. «W2:1155-1161,2154»
ND-8661. Release trail: 1.7.0 (appregistry/commandguard/deliveryqueue, 76 tests) → 1.8.0 (runtimecontract/memorystorage/workerbridge, 83 tests) → 1.8.1 (identidade canônica npm @wenathlan/saddle) → 1.8.2 (primeira pós-transferência, por-registry identity) → 1.8.4 (Node 26.7.0 em todas as pipelines; Maven novo; saddle-pages) → 1.8.5 (engines/sideEffects/browser-playwright peer). «W2:1528-1536»
ND-8662. v1.8.12..1.8.18: 12 GPL-3.0-only+verificação+38 assets; 13 caller-owned persistent queue + schema-neutral extraction + workflow compensation; 14 container build-stage compile+OCI label+GHCR first; 15 transport-neutral storage pool; 16 release-evidence policy-evaluable (136 tests); 17 GHCR OCI manifest index multi-arch + QEMU antes do Buildx; 18 denied-by-default isolated-execution (produção atual). «W18a:334-341»
ND-8663. Conflito de licença a reconciliar antes de publish: README diz MIT; package.json GPL-3.0-only; licença histórica v1.0 "Proprietary - View Only" ("NOT free software, NOT open source"); SPDX histórico LicenseRef-Saddle-Proprietary; trademark "saddle" do Licensor. «W2:1449,1394-1400»
ND-8664. Copyright do pacote: (C) August 2026 devthink, nathlan, iakadion, nathu filho, allan neris, andraneris; grafias iakadion/akadion e nathlan/nathalan divergem entre README e LICENSE — padronizar. «W2:1450,1409»
ND-8665. Token npm previamente exposto em chat é COMPROMETIDO: revogar; publicar só com OIDC/NPM_TOKEN como secret; NPM_TOKEN injetado apenas como NODE_AUTH_TOKEN; nunca em código/commit/chat; repo nunca guarda token de registry. «W2:1448,1553»
ND-8666. Deleção de pacote legado: remover `io.devthink.saddle` do GitHub Packages retornou HTTP 403 (API não faz package-management delete) — registrar o fato, criar novo coordinate em vez de lutar com a API. «W2:1547»
ND-8667. Version drift monitorado: manifest declara 5.0.0 vs body 1.8.5; hardcoded 2.0.0 em cli.ts/server.ts/web/index.html; 9 bins no manifest (saddle, devthink, devthink-dns, qz, uka, webscrape, devplayer, lildax, opencode) vs 1 no body — reconciliar antes de release. «W2:1726-1729,1540»
ND-8668. Legal/ToS: bypass automatizado de captcha é o risco #1 (potencialmente ilegal e violação de ToS) — só opt-in supervisionado; operar BTS/rede celular sem licença ANATEL/FCC é crime; ~40 contas descartáveis para esquivar free tier viola ToS (caminho certo: paid barato ou self-host Forgejo+MinIO). «W2:1390-1397»
ND-8669. Repo file caps: GitHub warning 50MiB/CLI 100MB, <5GB/repo; Releases 2GB/asset; GitLab LFS 5GB/repo; farm sharding com contas throwaway = violação; usar Turso/R2/self-hosted para volume. «W2:1392,1319»
ND-8670. Human augmentation (subsistema separado, não integrado): Human Operator MIT (EMS, Hard Mode 2026), lineage PossessedHand 2011 → Affordance++ 2015 → Muscle-Plotter/openEMSstim 2016 → SplitBody 2024 → Generative Muscle Stimulation CHI 2026; Brain2Qwerty v2 (MEG→texto, 61% avg/78% best); EMS ≠ acupuntura. «W2:1355-1369»
ND-8671. Memória infinita e Tiny-AI como research: Project Silica (quartzo 10k anos), DNA Storage+TrellisBMA (1 exabyte/mm³), cristal 5D 360TB; llama.cpp (~109k★, 70B Q4 laptop), BitNet b1.58 (1-bit, ~82% menos energia), WebLLM/MLC-LLM, llamafile; e-Taste/GVS/OVR ION como I/O corporal. «W2:1366-1367,2133-2136»
ND-8672. Z.ai lineage: precursor via `init-fullstack_<ts>.sh` que baixa `code_<ts>.tar` e roda `.zscripts/dev.sh` em `/home/z/my-project`; modelos GLM-5 (Docker, zai-org/GLM-5); proxies OpenAI-compatible Z.ai2api/GLM-ZAI-2API; replicação full-stack Z.ai/ChatGLM como north-star. «W2:2000-2004,1162-1169»
ND-8673. OpenCode identity: híbrido Go+Bun CLI binário (`anomalyco/opencode`, ex-sst/opencode); 3 pacotes (opencode-ai wrapper NON-ESM; @opencode-ai/sdk typed client; plugin); Hono server Bun porta 4096 host 0.0.0.0; OpenAPI 3.1 em /doc; sessões JSONL append-only em `~/.local/share/opencode`; plugins em `.opencode/plugins/<name>.{js,ts}`. «W2:1171-1182»

### Bloco J — v1.8.18: receipts, denial e control plane

ND-8674. Postura de execução 1.8.18: binário/qualquer-programa é opt-in, isolado, capability-negotiated e DENIED BY DEFAULT; negado quando policy, capability receipt, approval ou adapter declaration está ausente/incompatível. «W18a:104-107»
ND-8675. Honesty receipts: toda execução, transformação e entrega emite receipt declarativo auditável; storage latency jamais rotulada como RAM/VRAM; receipts não iniciam timers, reapers, workers nem registros, e não alegam signed/secure/trusted sem evidência verificada do caller. «W18a:16, W2:1757-1766»
ND-8676. Taxonomia de receipts: terminal-state, provider mutation precondition, isolation capability, release verification, surface capability, storage identity/capability, tool capability, origin-bearing tool result envelope. «W2:1763»
ND-8677. Declarative caller-owned surfaces: factories declaram boundaries e invocam handlers caller-owned; sem instalar toolkit nativo, sem iniciar server, sem criar dashboard, sem armazenar credenciais; credenciais/webhook/URL security/sessões ficam com o host. «W2:1744-1755»
ND-8678. Storage pool declarativo: descritores provider-neutral (sem criar host/porta/credencial/binding); políticas read/write first-healthy, verified-first, priority-first, primary-only, best-effort mirror, quorum, fan-out; repair plans reconciliam réplicas sem execução forçada. «W2:1768-1774»
ND-8679. Working set com hot cache: maxentries/maxbytes opcionais; eviction LRU afeta só o cache, nunca a persistência durável; bridge ops (tmpfs/zram/swap/mmap) são planos declarativos executados apenas por adapter caller-owned. «W2:1775-1776»
ND-8680. Workflow input validation: schemas caller-owned rejeitam campos desconhecidos, checam required, aplicam defaults, convertem tipos e enforce choices; evento inválido retorna invalid-inputs em vez de dispatchar; request id derivado de name+trigger+event data sorted (determinístico). «W2:1779-1783»
ND-8681. Comparative research como evidence log: cada candidato registrado com relevance e disposition; rejeições por dependência server/runtime/daemon, runtime AGPL, stealth ou credenciais independem de popularidade. «W2:1793-1799»
ND-8682. CI cache retention: workflow agendado idempotente que reporta candidatos e exige flag apply explícita para deletar; keep most-recent per family em refs default; janela curta em não-default; entrada ausente pós-expiry logada sem abortar. «W2:1816-1820»
ND-8683. Assinatura Android honesta: release usa produção caller-owned só quando secrets existem; senão gera test key temporária e REGISTRA que é test — nunca representada como production-signed; iOS signing desabilitado até secrets. «W2:1821»
ND-8684. Estados de assinatura explícitos (nunca inferidos por filename): `unsigned`, `ci-test-key`, `caller-owned`, `notarized`, `provider-signed`, `store-signed`; lib OSS implementa formatos mas não pode mintar certificado platform-trusted. «W18a:314-315»
ND-8685. Naming de artefato codifica arquitetura separado do formato: `saddle.browser.1.8.18.<os>.<abi>.<ext>`; release tables anexam 38 assets (Linux x64/arm64 deb/rpm/appimage…). «W18a:310-311»
ND-8686. Direção 1.8.19: Saddle redefine-se como virtual control plane que representa, valida, compara, nega e faz handoff de pedidos de virtual storage, binary processing, containers, micro-VMs e browser sessions (remote-browser capability contract estendendo a API 1.8.18); ciclo 1.8.21 reserva research orientado a objetivos. «W18a:126-131,372-373»

### Bloco K — Notas do dono: operação de docs (Note_08_15 + pasted-text)

ND-8687. Regeneração de README/SSOT: delegar 0-100 subagentes lendo cada um sua parte (arquivos grandes em 30 partes iguais total|30, linha 0→última), depois revisar todas as partes e montar todo list profissional; 1-3 subagentes extras na etapa final. «NB:107-109; NB2:13-14»
ND-8688. Leitura por ferramentas: usar SOMENTE grep, glob, offset e limit sem criar arquivos/pastas temporárias; mapear blocos colados e dividir a leitura em pedaços hierárquicos linha X→Y e pedaço X→Y. «NB:111-113»
ND-8689. Verificadores de cobertura: subagentes de blocos E GAPS para capturar itens únicos ainda não cobertos, mais subagentes assíncronos para filtrar; arquivo >10k linhas = ler em partes, agregar, regenerar por categoria sem omissões. «NB:113-114»
ND-8690. Mescla de conteúdo: fundir sentidos/sinônimos que expressam a mesma ação (ler, analisar, mapear, extrair, filtrar) em instância única; reagrupar fragmentos por categoria/assunto/contexto correlato em ordem hierárquica; eliminar duplicatas exatas sem perda de contexto. «NB:9-17»
ND-8691. Proteção de conteúdo: NÃO remover nenhum contexto/lógica/sentido/palavra — apenas reordenar e reagrupar; tirar SOMENTE citações literárias, referências a documento X e caminhos exatos de pastas/arquivos. «NB:28-32; NB2:56-58»
ND-8692. Anti-citação no SSOT: NÃO citar caminhos de documentos no README — incluir o que tem DENTRO deles, englobado e reagrupado; após a operação, verificar que não existe nenhuma citação de pasta ou documento. «NB:33-34; NB2:64-65»
ND-8693. Git archaeology obrigatória: ler todos os READMEs existentes e todos os commits que tocaram README.md (incluindo versões txt) em docs/plans, messy1/docs/plans, raiz e afins; `git log` → `git show` em cada commit; recuperar conteúdo histórico movido para docs/plans; consolidar em inglês. «NB:44-48»
ND-8694. Estrutura exigida do README: parágrafo de categoria → subparágrafo → subtítulos seguidos IMEDIATAMENTE por tabelas, sem parágrafos dentro dos subtítulos; lógicas correlatas agrupadas; inglês conforme as skills, incluindo o conteúdo da skill de arquitetura. «NB:50-53»
ND-8695. Correções incrementais, nunca rollback: adicionar ao arquivo atual o que falta sem reverter versão alguma; quando faltar conteúdo, re-delegar 0-100 subagentes para talks1..talks9 e READMEs de commits anteriores. «NB:56-59»

### Bloco L — Plugin zai da DevTink CLI (Note_08_19 + pasted_content_6/7)

ND-8696. Escopo do plugin: o antigo plugin simples vira CLI completa conectada às IAs/gateways, baseada nas features do OpenCode, com binário compactado; ler TODOS os arquivos da pasta docs (176 itens, pasta dentro de pasta) antes de qualquer implementação. «N19:3-12»
ND-8697. Entregáveis finais: APENAS dois arquivos — `zai.ts` (plugin) e `test-zai.cjs` (teste), garantindo login, autenticação e streaming headless inline. «N19:16-18»
ND-8698. Local canônico do plugin: `C:\Users\nathalan\.config\opencode\plugins\zai.ts` (criar ou editar). «N19:19»
ND-8699. NÃO declarar o plugin zai no opencode.json global e NÃO criar package.json específico do plugin. «N19:20»
ND-8700. NÃO usar declarações `export` no final do zai.ts. «N19:21»
ND-8701. Logs e auth do plugin vivem exclusivamente na pasta do plugin; o plugin gerencia os próprios logs e auth.json localmente e no diretório de compartilhamento global do OpenCode. «N19:22,27»
ND-8702. auth.json escrito REDUNDANTEMENTE em dois locais: `~/.local/share/opencode/auth.json` e `~/.config/opencode/plugins/auth.json`, armazenando os 13 cookies. «N19:23»
ND-8703. Autenticação 100% via CLI (headless inline, sem GUI ou prompts externos); streaming de respostas com integração aos modelos GLM da Z.AI. «N19:24-25»
ND-8704. test-zai.cjs valida três fluxos: login, persistência dos cookies no auth.json e integridade do streaming. «N19:26»
ND-8705. O OpenCodeJSON já detém as configurações do provider ZAI — o plugin NÃO as redeclara, puxa de lá. «N19:13»
ND-8706. Sequência de trabalho: ler todos os arquivos → pesquisar → montar plano → atualizar zai.ts e test-zai → testar com PowerShell `$ opencode --model "zai/glm-5.2" --format json --prompt "oi"`. «N19:14»
ND-8707. Escopo de leitura restrito: primeiro apenas DENTRO de `C:\allan2\devthink\cli\docs\2 • zai.plugin` (ignorar node_modules, cli, dist, binários); depois pesquisar e planejar. «N19:48-49»
ND-8708. Higiene de código do plugin: nada de variáveis/argumentos iguais ou idênticos; consolidar lógicas duplicadas em forma única; agrupar lógicas correlatas de forma hierárquica sem remover funcionalidades; ortografia correta em identificadores/strings/comentários. «N19:31-34»
ND-8709. Onboarding CLI (primeiro acesso): design desbloqueado; opção de logar na CLI ou na plataforma; sem login é criado usuário temporário com ID aleatório NÃO excluído, utilizável da mesma forma; usuário pode personalizar nome e definir senha (passkey) para sincronizar. «PC6»
ND-8710. IDs curtos obrigatórios: usuário/workspace/chat podem ser personalizados (numérico, alfanumérico, misto), mas o default é aleatório curto — máximo 15-16 caracteres no formato grande; nada de aleatoriedades extensas. «PC6»
ND-8711. Porta implícita: a pessoa NÃO informa porta; quando a CLI conecta (HTTPS/HTTP methods/gRPC), já envia porta, número de sessão, ID de usuário, ID de workspace e ID de chat; campos de confirmação ficam OPCIONAIS na UI. «PC6; PC7»
ND-8712. Login via GitHub Pages: CLI gera link temporário no GitHub Pages (somente a CLI pode mandar requisições — origem/X-Origin permitida só para a CLI criar página temporária); página mostra código temporário; usuário digita número + código na CLI; após definir senha, o código temporário deixa de ser necessário. «PC7»
ND-8713. Sync bidirecional CLI↔web: tudo feito na web sincroniza com a CLI (botão "conectar com a CLI"); APIs "inteligentes" conversam entre si sabendo o que enviar/receber via MIME types/content types; gravação paralela no DB local (Prisma schema) e no DB web para não faltar dado de workspace/sessão. «PC6; PC7»
ND-8714. Sem verificação por e-mail no onboarding inicial (ainda sem SMTP): conta = nome de usuário + senha; reconhecimento de autenticação pelo par usuário/código temporário. «PC7»

### Bloco M — Gateway @devthink/ai V1/V2/V3 (lasttimeline)

ND-8715. Fundação do gateway: Next.js 16 fresco com shadcn/ui; apenas 21 rotas, libs `cdn.ts`/`db.ts`, shim.js, package.json, tsconfig, eslint, prisma.config e tailwind são modificados; nada mais. «LT:11-12»
ND-8716. cdn.ts: 200+ entradas esm.sh com createRequire e Map cache; SEM lógica de gateway — apenas registro de módulos. «LT:13»
ND-8717. db.ts: Prisma puro com Lazy Proxy + PrismaLibSQL adapter (Prisma 7 NÃO aceita url no datasource); ~16 linhas base + JSDoc até 56. «LT:14»
ND-8718. utils.ts mínimo: apenas `cn`; todo o resto (levenshtein, makeSse, categorizeError, autofixParams) migra para gateway.ts. «LT:15»
ND-8719. shim.js em /scripts: compatibilidade ESM para Next 16 (type:module) sem modificar exports do TypeScript. «LT:16»
ND-8720. 21 rotas = 7 endpoints × 3 versões (V1/V2/V3) com MESMA lógica interna e mesmo pattern adaptado por contexto; rotas 100% lowercase, sem underscore, sem emoji, JSDoc, sem thinking/format instruction. «LT:17-18»
ND-8721. V1 = ZAI (ZaiWeb SDK GLM 5.2 SEM chave, auth por servidor, padrão 2-calls); V2 = Babel Town (com chave, headers simulando navegador, rotação da tabela townkey, fallback automático); V3 = NVIDIA Integrate API (round-robin de 25 chaves). «LT:21-23»
ND-8722. Modelos V1 (6): devthink, glm-5.2, glm-5.1, glm-5v (supports_vision true), glm-4-plus, glm-4-flash. «LT:21»
ND-8723. V2 (4 modelos): babel-devthink, babel-glm-5.2, babel-glm-4-plus, babel-glm-4-flash; thinking 68k + response 68k. «LT:22»
ND-8724. V3 = 94 modelos no total: 1 meta DevThink + 7 de rotação (minimax-m3, glm-5.2, kimi-k2.6, deepseek-v4-flash, deepseek-v4-pro, laguna-xs-2.1, step-3.7-flash) + 30 individuais + 56 embeddings; laguna com enable_thinking true/262k; step-3.7-flash com thinking false. «LT:23-24»
ND-8725. Meta-modelo DevThink: presente nas 3 versões, rotaciona estratégia de contexto/janela compartilhada; em V3 rotaciona a cada 6 mensagens por sessão; deepseek-ai/deepseek-r1 BLOQUEADO. «LT:20,23»
ND-8726. Contexto do meta DevThink recalculado: 2.518.144 ctx / 1.161.144 out → até 4.5M/4.780.000 → final 4.780.000 ctx (1M+262K+1M+262K+256K) com output 1.304.000. «LT:25»
ND-8727. model-registry.ts unificado: princípio export-redirect — se o modelo existe na rota atual usa direto; se existe em outra versão, faz fetch interno para a rota correta; nomes limpos sincronizados intra-V1, intra-V2 e intra-V3. «LT:26,19»
ND-8728. Rotas models de cada versão definem os IDs usados por completions, responses, embeddings e chat/completions do grupo. «LT:20»
ND-8729. Todas as rotas são gateway baseurl passthrough (repassa para base externa) com autofix salvo em DB e keepalive 200ms; flush_interval -1 no Caddyfile (29 linhas) para SSE. «LT:19,29»
ND-8730. package.json do gateway: name @devthink/ai; engines node ≥24.6.0→≥26.0.0, npm ≥12.1.0, bun ≥1.3.14; packageManager bun@1.3.14 no FINAL junto de engines; remover trustedDependencies; next 16.2.10-16.2.12, react 19.2.8, prisma 7.8-7.9.1. «LT:27-28»
ND-8731. tsconfig: extends @tsconfig/node26; target ESNext (2026 não existe), module ESNext, moduleResolution bundler, lib ESNext+DOM+DOM.Iterable+WebWorker; excluir examples/skills/mini-services/upload; next.config com outputFileTracingExcludes p/ sharp. «LT:28-29»
ND-8732. Prisma schema: >1000 entradas sem duplicação nem filler (flag1/note1/metric1); 1012-1361 campos em 16-24 modelos; corrigir duplicação entre modelos (keylatencyp50 em nvidiaKey/townKey/apiKey); convenção `active:true` → `status:"active"`, `k.key` → `k.keyValue`, `lastUsed` → `lastUsedAt`; 0 campos numerados. «LT:30-31»
ND-8733. Chaves NVIDIA extraídas de blobs: 28 válidas − 3 placeholders (XXX/YYY/ZZZ) = filtro `nvapi-` com 64 chars → 25 reais; script scripts/register-nvidia-keys.mjs; 22 chaves nvidia-1..nvidia-22 ativadas; db:generate (Prisma Client 7.8.0) + db:push. «LT:32-33»

### Bloco N — duck.ai: TSX → mobile toolchains (09-05)

ND-8734. TS/TSX não vira `.ipa` diretamente: precisa runtime/framework mobile + bundler + toolchain Apple (gerar, assinar, exportar); caminho mais direto para quem já é React/TSX = Expo + React Native + EAS Build (`npx create-expo-app`, `eas build --platform ios`). «DK1:13-18»
ND-8735. Web app existente → app nativo via Ionic+Capacitor (`npm i @ionic/react @capacitor/ios; npx cap add ios; npx cap sync`); Capacitor empacota o build web em projeto iOS nativo aceitando plugins Swift. «DK1:20-25»
ND-8736. Ranking das 40 opções por complexidade: Expo EAS, RN CLI, Ionic React/Vue/Angular, Quasar, NativeScript (TS direto sem WebView), Framework7, Onsen, Tauri 2 Mobile (frontend TS + backend Rust, mobile ainda avançando), Expo Router (rotas arquivo-como-Next), Solito (código compartilhado RN↔Next), Tamagui/NativeWind (UI/estilo cross). «DK1:39-62»
ND-8737. Bundlers/transpilers NÃO criam IPA sozinhos: Metro, Babel, tsc, SWC, Webpack, Vite, Rollup, esbuild, Bun, Deno participam da cadeia mas exigem Capacitor/Cordova/Xcode no fim; CI/CD mobile: EAS Build, Codemagic, Bitrise, Appcircle, Xcode Cloud, GH Actions macOS + Fastlane. «DK1:57-66»
ND-8738. Alternativas não-TS: Python (Kivy+Buildozer, BeeWare Briefcase/Toga, PyObjC, Rubicon-ObjC), Pascal (Delphi FireMonkey, Lazarus, Free Pascal), WASM (AssemblyScript, wasm-bindgen/pack, Emscripten) — nenhuma converte TSX diretamente; WASM serve para módulos de alto desempenho dentro do app (imagem/áudio/criptografia). «DK1:300-345»
ND-8739. Arquitetura canônica do pipeline TSX→iOS: TS/TSX → React → React Native → Expo → Metro/Babel/Hermes → Xcode → .app/.ipa; conta Apple Developer + certificados/profiles ainda necessários para App Store. «DK1:346-356»
ND-8740. Entry point: com React Navigation tradicional, `App.tsx` é o componente principal e `index.ts` registra via `registerRootComponent` (expo); com Expo Router o entry deixa de ser App.tsx (pasta `app/` vira sistema de rotas). «DK1:940-985»
ND-8741. Config files mínimos do Expo: `eas.json` (build profiles development/preview/production), `babel.config.js` (babel-preset-expo, gerado automático em projetos modernos), `metro.config.js` opcional via `getDefaultConfig`. «DK1:700-745»
ND-8742. Bun no pipeline mobile: `bun create expo`, `bunx expo start/run:ios`, `bunx eas-cli build` funcionam, mas a compilação iOS continua dependendo da infra Apple (EAS cloud ou macOS+Xcode local). «DK1:950-965»
ND-8743. UI unificada sem separar web/Android/iOS: mesma base responsiva executada como Web/PWA (Vite), iOS (Capacitor+Xcode), Android (Capacitor+Gradle), desktop (browser/PWA/Tauri futuro), TV/notebook (web responsiva). «DK1:1079-1095»
ND-8744. Orientação de tela NÃO define dispositivo: horizontal ≠ sempre PC/TV; usar orientation JUNTO de largura/altura/densidade/tipo; CSS com `min-height:100dvh`, `min(100%,720px)`, media queries por orientation e min-width combinadas. «DK1:1097-1110,1560-1600»
ND-8745. Stack recomendada para UI unificada: TypeScript + React TSX + Vite (NÃO Metro) + Capacitor + Bun + Vitest + Biome + GitHub Actions + Vercel/Netlify; não misturar Metro e Vite no mesmo pipeline principal; Capacitor consome o `dist/` do Vite nos projetos nativos. «DK1:1112-1160»

### Bloco O — duck.ai: TLDs alternativos e DNS (09-04)

ND-8746. Nome terminar em algo que parece TLD não significa delegação na raiz pública; separar três coisas: delegação na raiz, resolução fora da raiz, cliente sem DNS tradicional; `.icu` é gTLD OFICIAL da Root Zone Database. «DK2:22-30»
ND-8747. Mecanismo 1 — delegação privada: resolvedor recursivo trata `.stg` como zona local (Unbound local-zone/forward-zone, BIND autoritativo, CoreDNS file/hosts/forward, dnsmasq, resolvers embutidos em VPN/apps); Internet pública não conhece, só as máquinas daquele resolver. «DK2:44-58»
ND-8748. Mecanismo 2 — consulta direta a nameserver autoritativo: DNS não impede tecnicamente uma zona `.stg`; falta a delegação no caminho da raiz; `dig @ns1.exemplo.net host.stg A/NS/SOA` responde mesmo com `dig +trace` falhando. «DK2:62-78»
ND-8749. Mecanismo 3 — split-horizon: mesmo nome responde diferente por origem (interno → IP, externo → NXDOMAIN); critérios: IP, VPN, identidade, geo, header/proxy, resolver, ECS; testar comparando 1.1.1.1/8.8.8.8/9.9.9.9 + `resolvectl status`. «DK2:80-100»
ND-8750. Mecanismo 4 — wildcard/"TLD virtual": nameserver responde QUALQUER nome sob o sufixo; teste com nomes aleatórios (`a7f91`, `inexistente-$(date +%s)`); se todos respondem igual → wildcard DNS, backend que aceita qualquer Host, CDN/reverse proxy, domain fronting. «DK2:102-122»
ND-8751. Mecanismo 5 — resolvedor próprio do cliente: navegador com DoH embutido, SDK com API de resolução, agente de segurança, VPN, proxy, extensão, P2P/DHT; investigar capturando tráfego controlado. «DK2:124-138»
ND-8752. Cloudflare NS não prova TLD próprio: ver `alice/bob.ns.cloudflare.com` pode ser `empresa.xyz` ou subzona `stg.empresa.xyz`; `dig +trace` mostra a cadeia `. → xyz → empresa.xyz → stg.empresa.xyz`; passive DNS/CT logs/dashboard truncam FQDNs (mostram só `stg`) — erro comum de parsing. «DK2:140-160»
ND-8753. Teste objetivo de TLD: `dig @a.root-servers.net <sufixo> NS` sem delegação = não está na raiz; resolvers públicos NXDOMAIN + um resolver específico responde = zona local/raiz alternativa/forward/cache; dig falha mas app abre = DoH/DoT próprio, hosts, proxy ou resolução embutida. «DK2:620-660»
ND-8754. Registro e resolução são coisas independentes: RDAP/WHOIS só conhece objetos de registry/registrar — subdomínios, wildcards, zonas internas, raízes alternativas, aliases CDN, hosts só-em-certificados e nomes de aplicação não geram objeto pago; nome funcional sem registro = resolução fora do modelo IANA/ICANN. «DK2:1010-1040»
ND-8755. Prova de raiz alternativa: consultar o IP do servidor identificado (`dig @IP <nome> A/NS/SOA`); se só ele responde, a zona está publicada em autoritativo mas não delegada na raiz; wildcards detectáveis com nomes aleatórios contra esse servidor. «DK2:1080-1110»
ND-8756. Limite estrutural: dono de `exemplo.xyz` controla descendentes (abc.exemplo.xyz, qualquercoisa.stg.exemplo.xyz) mas NÃO pode criar irmãos (`abc.shz`, `abc.e`); delegação de TLD exige NS diretamente na root zone (IANA). «DK2:1575-1600»
ND-8757. "Eu não instalei nada" não prova raiz pública: cliente pode já usar DoH de navegador, DNS do SO, VPN, proxy, rede corporativa, DNS interceptado por router/ISP, cache local, extensão; o teste decisivo é NA máquina/rede onde o site abre comparado a resolvers explícitos. «DK2:1605-1640»
ND-8758. Lab reproduzível de raiz alternativa (CoreDNS): comprar `lab.example.xyz` → criar zona `stg.lab.example.xyz` → publicar A/AAAA/CNAME/SOA/NS → adicionar wildcard → delegar a outro NS → comparar `dig +trace` × resolvers × consulta direta × HTTP com Host/SNI distintos; isso reproduz todos os fenômenos mantendo claro que "TLD" = subzona do titular. «DK2:1330-1400»
ND-8759. Fluxo de exposição de sandbox via túnel: SSH/web do sandbox em free-runner exposto por cloudflared/ngrok como estratégia de acesso além das colunas ssh-host. «W2:2155»

### Bloco P — duck.ai: assinatura IPA/APK e distribuição direta (09-03)

ND-8760. Técnica correta de assinatura iOS em CI (set/2026): build em runner macOS, importar certificado Apple Distribution + provisioning profile em keychain temporário e APAGAR o keychain ao fim; assinar DURANTE archive/export (`xcodebuild -exportArchive`) — nunca pós-pronto (entitlements/frameworks/extensões/profiles). «DK3:11-20»
ND-8761. Secrets de assinatura iOS: BUILD_CERTIFICATE_BASE64, P12_PASSWORD, BUILD_PROVISION_PROFILE_BASE64, KEYCHAIN_PASSWORD, APPLE_TEAM_ID (+profiles extras para widgets/extensions); arquivos NUNCA commitados — Base64 em GitHub Secrets; keychain com `security set-keychain-settings -lut 21600`. «DK3:30-60»
ND-8762. Distribuição Android direta é viável: APK assinado com chave própria (`keytool -genkeypair -keystore release-key.jks -validity 10000`), hospedado em site/GitHub Releases, instalação com fontes desconhecidas; NUNCA perder a chave (todos os updates futuros a exigem) nem commitá-la (GitHub Secret). «DK3:620-660»
ND-8763. iOS NÃO tem equivalente gratuito ao APK: `.ipa` hospedado não é instalável por si — exige assinatura; alternativas: Apple ID grátis + AltStore/SideStore (~7 dias), TrollStore (só aparelhos/versões compatíveis), Apple Developer pago, ou PWA até conseguir conta Apple. «DK3:665-700»
ND-8764. Tabela de realidade de assinatura: Apple Developer pago = permanente e público; AltStore/SideStore = free, 7 dias, sem distribuição pública; TrollStore = free, permanente só em compatíveis; Enterprise de terceiros "grátis" = revogável e ilegítimo para esse uso. «DK3:470-485»
ND-8765. Workflow gratuito de APK assinado: secrets ANDROID_KEYSTORE_BASE64/KEYSTORE_PASSWORD/KEY_ALIAS/KEY_PASSWORD; `gradlew assembleRelease -Pandroid.injected.signing.*`; verificação `apksigner verify --verbose`; publish via upload-artifact; cleanup `rm -f` com `if: always()`. «DK3:700-800»
ND-8766. Serviços que prometem "assinatura permanente grátis" normalmente usam: vulnerabilidade tipo TrollStore, certificado Enterprise de outra empresa, ou certificado compartilhado revogável — nenhuma é assinatura oficial gratuita; NÃO colocar Apple ID, cookies, .p12 de terceiros ou chave privada em workflow público. «DK3:490-500,480»
ND-8767. Pipeline OTA iOS legítimo: IPA reassinado + `manifest.plist` hospedado em HTTPS + `install.html` → `itms-services://?action=download-manifest&url=...` → usuário toca no Safari; manifest APONTA o IPA mas não assina nem remove a exigência de provisioning profile (Ad Hoc exige UDIDs). «DK3:1075-1110»
ND-8768. Ferramentas de reassinatura: Signaro/SignaroCLI (reassina IPA, valida profile, assina frameworks/extensões na ordem correta, gera manifest.plist + install.html; Ad Hoc/Development/Enterprise); `yukiarrr/ios-build-action`; `indygreg/apple-code-sign-action` (rcodesign); `ajaxjiang96/prepare-testflight-signing` — todas EXIGEM material de assinatura Apple existente. «DK3:1080-1100»
ND-8769. Impossibilidade técnica declarada: NÃO existe repositório legítimo que faça IPA → GitHub Actions → certificado novo gratuito criado pelo workflow → instalação em iPhones arbitrários; rcodesign/codesign/Signaro usam identidade EXISTENTE, não emitem identidade nem fazem o iOS confiar nela. «DK3:1130-1145»

### Bloco Q — duck.ai: Android virtual e emulação de CPU (08-26)

ND-8770. Cuttlefish (AOSP) é o dispositivo virtual Android completo mais próximo de "Android em VM sem celular": roda em Linux com KVM, aparece como dispositivo normal via `adb`, controle remoto e web UI `https://localhost:8443`; fluxo: build_packages.sh → dpkg cuttlefish-base/user → usermod kvm,cvdnetwork,render → launch_cvd --daemon. «DK4:14-40»
ND-8771. Build próprio do Android para Cuttlefish: `source build/envsetup.sh; lunch aosp_cf_x86_64_only_phone-aosp_current-userdebug; m -j$(nproc)` — imagens para x86_64 e ARM64. «DK4:45-50»
ND-8772. Emulador sem Android Studio: só command-line tools (`sdkmanager "platform-tools" "emulator" "system-images;android-35;google_apis;x86_64"`, `avdmanager create avd`, `emulator -avd`); QEMU+Android-x86/Bliss OS = VM genérica; Waydroid = container Linux compartilhando kernel (NÃO é VM completa). «DK4:55-75»
ND-8773. Android no navegador: `google/android-emulator-container-scripts` (emulador em Docker com streaming WebRTC + UI React) e `google/android-emulator-webrtc` (vídeo/áudio/teclado/mouse/touch por WebRTC+WebSockets); alternativas dockerify-android (scrcpy-web, localhost:8000), redroid, waydroid, scrcpy, Cuttlefish; sites online = Appetize.io (comercial), Genymotion SaaS, BrowserStack, Sauce Labs, LambdaTest. «DK5:120-190»
ND-8774. Emulação de CPU por interpretador: fetch → decode opcode → ler registradores → calcular → atualizar memória/registradores — simples mas lento; JIT traduz blocos para código nativo do host — rápido e complexo; compilar o núcleo para WASM dá portabilidade (Node/browser) sem execução ilimitada. «DK4:1090-1115»
ND-8775. Stack de referência de CPU virtual: QEMU (TCG, MMU, interrupções, devices, boot de kernels, ARM em x86); Unicorn Engine (API simples multi-arch: ARM/ARM64/x86/MIPS/PowerPC/SPARC/RISC-V, binding unicorn.js); Capstone (disassembly); Keystone (assembly→máquina); TinyEMU (C compacto); rvemu/riscv-rust (RISC-V educacional). Combinação útil: Keystone gera → Capstone desmonta → Unicorn executa → Node/Rust/Go controla. «DK4:1120-1210»
ND-8776. IDEs open-source estilo Cursor: Void (fork VS Code, mais parecido com Cursor, modelos próprios/locais), Zed (Rust, velocidade), PearAI, Melty, Theia, CodeEdit (macOS nativo), Puter (OS web com IDE+IA); extensões/agentes: Continue, Cline, Roo Code, Kilo Code, Tabby (autocomplete self-hosted), Aider (terminal+Git), OpenCode (terminal/desktop autônomo); lista zeelsheladiya/Awesome-IDEs. «DK5:30-80»

### Bloco R — duck.ai: e-mail self-hosted, search stack e sites 3D (08-29/09-06)

ND-8777. Mailflare não é servidor de e-mail completo: é caixa de entrada web/API sobre serviços Cloudflare (Email Routing, Workers, D1, R2); para replicar em servidor próprio dividir em 4 categorias: servidor completo, API transacional, newsletter/marketing, componentes de dev/teste. «DK6:8-20»
ND-8778. Servidores de e-mail self-hosted: Stalwart (Rust all-in-one: SMTP/IMAP/POP3/JMAP/CalDAV/CardDAV/DKIM/SPF/DMARC/antispam/painel/OIDC-LDAP-SQL/2FA — melhor candidato moderno); Maddy (Go single-binary); Mox (Go, ~512MB RAM); docker-mailserver (Postfix+Dovecot+Rspamd+ClamAV, 18k★); Mailu; mailcow (SOGo, 13k★). «DK6:25-60»
ND-8779. APIs transacionais self-hosted: Hyvor Relay (mais completa: logs, SMTP conversations, webhooks, bounce, supressões, filas, multi-tenancy), Posta (Go), Emailflare (TS, estilo mais próximo do Mailflare), Larasend (painel+SES), Posthorn (gateway multi-provider); NENHUMA resolve reputação de IP — PTR/rDNS, SPF, DKIM, DMARC, TLS e blocklists continuam manuais. «DK6:65-95»
ND-8780. Newsletter/campanhas self-hosted: listmonk (Go single-binary, segmentação SQL, múltiplas filas SMTP, rate limiting), Keila (Elixir, MJML/Liquid, bounce handling), BillionMail (suíte completa), Mautic (marketing automation, pesado); e-mail descartável/teste: Inbucket (SMTP+POP3+REST sem DB), Mailpit, MailHog, smtp4dev, Mailslurper. «DK6:100-150»
ND-8781. Stack de desenvolvimento de plataforma de e-mail: Go (go-mail/go-smtp/go-imap/emersion/go-msgauth/go-msgauth auth) para workers SMTP de alta concorrência; Rust (smtp-proto, mail-parser, mail-send, lettre) para segurança de memória; TypeScript (nodemailer, postal-mime, smtp-server, bullmq, Hono/NestJS, React Email/MJML + PostgreSQL) para velocidade de dev; PHP/Laravel (Symfony Mailer, Horizon) já validado pelo Larasend. «DK6:155-200»
ND-8782. Alternativas open-source a Exa/MCP: distinção fundamental — Exa é busca neural HOSPEDADA com índice próprio; exa-mcp-server é código aberto mas dependente da API; alternativas autossuficientes: SearXNG (metabuscador, melhor opção free), Crawl4AI (crawler para IA/Markdown/RAG), Playwright, Vespa (busca neural pesada), OpenSearch, Qdrant (vetorial), Meilisearch, Firecrawl (local), YaCy (distribuído), Tantivy (library), Scrapy, browser-use (agente), LlamaIndex/Haystack/RAGFlow (RAG), Open WebUI/AnythingLLM/Danswer. «DK7:15-40»


## FASE 8c — código tsx/ts Neo DevThink (fonte: neodevthink/*.tsx *.ts — git blobs)

260 regras (ND-8801..9060; 9061..9100 reservado) em 23 grupos: 9 contextos useStoredState
(type-guard localStorage), ZERO chamadas de rede em 408 arquivos (client-first total, ND-8818),
OS Aura shell 8 páginas liquid-glass + Assistant v2.6, KROMA engine Web Audio procedural
(LFO respiração, envelope 1.2s/0.4s, ⌘K, .ics), landings design-tool com atlas embutido,
THREE.js shader 14 uniforms, corrupção export "[m" documentada (transcrever sem corrigir).


### Grupo A — Corpus e arquitetura de apps do Neo DevThink «neodevthink/*.tsx»

ND-8801. O acervo de código do Neo DevThink são 408 git blobs (349 .tsx + 59 .ts, 44.580 linhas) com ZERO duplicatas exatas de md5 — cada variante é uma evolução real, nunca cópia byte-idêntica. «md5sum 408 arquivos»
ND-8802. Nomes de arquivo seguem o padrão `Componente(N).tsx` (44 App, 13 Hero, 12 Header, 10 main, 10 Panels…): (N) é o índice do export da ferramenta de design, não versão semântica. «ls neodevthink»
ND-8803. Cada app do Neo DevThink é uma PASTA VIRTUAL dentro do flat de blobs: App(N) + Home/Panels/Sections/Hero/Modal/Dialogs + ui/Elements/Primitives + context/*Context + data/* + hooks/* — raiz comum `@/` e relativas `./`. «App(104).tsx:1-8; App(180).tsx:1-19»
ND-8804. Um app por letra-nome: SÖL, KROMA, VORTEX, MOVA, PRISMA, CORO, FOLD, LUMEO, MESTRAE, LOOPA, VORA, ALTO, AURA, VOLTHAUS, VOLTA, VIVORA, SYNTHA, VYRA, GENESIS, VOLTIX, cardume — cada um com marca, paleta e domínio próprios. «Home (6); App(104); App(180); App(13); App (2)»
ND-8805. O estado global de cada app mora num único `*Context(N).tsx` com Provider + hook `use<App>` que LANÇA erro se usado fora do provider («SÖL context unavailable», «useVortex must be used inside VortexProvider»). «SolContext(1).tsx:72-76; VortexContext(1).tsx:153-157»
ND-8806. Todo contexto expõe a tríade `{ estado persistido, modal|null, toast|null }` + ações nomeadas (toggleSave/setProfile/setPlan/setBilling/clearData) — nunca state local espalhado nas seções. «SolContext(1).tsx:31-45; MovaContext(1).tsx:25-44»
ND-8807. Modal é union type discriminado `{ kind: 'x' } | { kind: 'y'; id: string }` declarado no contexto — seções chamam `open({ kind: 'mentor', id })` sem conhecer o renderizador. «KromaContext(1).tsx:5-12; MovaContext(1).tsx:5-8»
ND-8808. O app raiz (App default) é só composição: `<Header/><main>{seções}</main><Footer/>` + modal switch — zero lógica de negócio na raiz. «App(104).tsx:846-860; App(180).tsx:678-701»
ND-8809. Apps maiores extraem seções para arquivos irmãos exportados nomeados (`export function Hero()`, `export function Pricing()`) que o App importa — Home/Panels/Sections são os nomes canônicos. «Home (2).tsx:9-342; Paineis(1).tsx:7-323»
ND-8810. O shell Aura usa máquina de estados de página por useState<View> + render condicional com AnimatePresence mode="wait" e key por página — não há router. «App (2).tsx:25-62»
ND-8811. Páginas do shell Aura: HomePage, ChatPage, ExplorePage, SearchPage, AppsPage, HistoryPage, SettingsPage, ProfilePage — Sidebar some na home (view inicial é vitrine). «App (2).tsx:6-14,28-31»
ND-8812. Janela principal do shell é um painel liquid-glass `rounded-[2.5rem]` com `shadow-[0_8px_30px_rgb(0,0,0,0.04)]` e borda white/50 sobre fundo #E6E8F3. «App (2).tsx:33-40»
ND-8813. Seleção de texto do OS é temática: `selection:bg-[#FF5C00]/30` na raiz do shell — o acento laranja pinta também a seleção do usuário. «App (2).tsx:25»
ND-8814. FloatingToolbar + Window (janela flutuante) são globais do shell, montados FORA do main, com estado isWindowOpen na raiz. «App (2).tsx:52-61»
ND-8815. Apps-loopa usa array de janelas tipado `type Janela = { tipo: 'busca' } | { tipo: 'trilha'; id: string } | …` (8 tipos) em vez de contexto — raiz pequena pode concentrar. «App(13).tsx:13-21»
ND-8816. Todo app embarca seus dados em `@/data/<app>.ts` (mentors, tracks, plans, products, destinations) com types exportados — componentes nunca hardcodam catálogo. «kroma(1).ts; loopa(1).ts; alto(1).ts»
ND-8817. IDs de entidades são slug minúsculo ('ethan', 'interface', 'b1', 'air') — validadores e modais cruzam sempre por id string. «kroma(1).ts:14; loopa(1).ts:25»
ND-8818. Não existe UMA chamada de fetch/axios/query em todo o corpus: a "nuvem" do Neo DevThink é localStorage — todos os mutations são locales e rotulados "demonstrativos/conceituais" na UI. «grep fetch em 408; Panels (2).tsx:736-744»
ND-8819. Entry canônico: `main(N).tsx` com `createRoot(document.getElementById("root")!).render(<StrictMode><App/></StrictMode>)`. «main(1).tsx:1-11»
ND-8820. Fontes entram por @fontsource-variable (outfit, dm-sans, fraunces, sora) + @fontsource/ibm-plex-mono/400.css no main, antes de index.css. «main(1).tsx:3-7»
ND-8821. Tailwind de utilidades convive com CSS de app próprio: classes utilitárias inline (clamp, tracking-[-0.045em]) + classes semânticas de design system (.hero-dark-stage, .sage-upper-container, .liquid-glass). «Home (6).tsx:33-124; App(104).tsx:80-95»
ND-8822. Alias de import: dados/contextos/hooks por `@/` e componentes irmãos por `./` — exports de design-tool usam caminho relativo puro. «KromaContext(1).tsx:2-3; App(104).tsx:1-11»
ND-8823. Cada landing de design-tool declara no rodapé/mapa que é composta de 8-10 referências reais re-estilizadas — a atribuição é parte do produto, não comentário perdido. «App(180).tsx:641-651; App(105).tsx:5-58»
ND-8824. Seções grandes recebem callbacks de navegação por props (`onContact`, `onSignup`, `onOpenMap`, `aoTrilhas`) — a raiz injeta os abridores de modal. «App(180).tsx:75,123; App(13).tsx:22-29»
ND-8825. Variantes de tela compartilham o MESMO esqueleto Nav→Hero→Prova→Features→Pricing→FAQ→CTA→Footer; o que muda é a pele (paleta/efeitos/copy) — documente o esqueleto 1× e a pele por app. «Apêndice: sondas em App150/142/115/119/105»
ND-8826. Pricing de todo app é 3 tiers + faixa enterprise/tailored, com card destaque `hero`/`highlight` que ganha borda acento e glow próprio. «App(104).tsx:540-600; Home (6).tsx:1050-1095»
ND-8827. Billing toggle mensal/anual é padrão em 4 apps (VORTEX, VOLTHAUS, MOVA, KROMA) com desconto exibido (−25%/−20%/50% OFF anual). «Home (6).tsx:1068-1080; App(104).tsx:569-576; Panels (2).tsx:502-510»
ND-8828. FAQ é accordion com useState<number|null>(0) (primeiro aberto) e animação height:0→auto — alguns usam 2 colunas com split slice(0,3)/slice(3). «App(180).tsx:424-450; App(104).tsx:613-660»
ND-8829. Newsletter de rodapé valida só `includes('@')` e chama subscribeNewsletter do contexto com toast — nada é enviado a servidor. «Home (6).tsx:1100-1115; VortexContext(1).tsx:115-119»
ND-8830. Rodapé canônico: marca+bio+social, 4 colunas de links, bottom bar com © ano corrente 2026 e "voltar ao topo". «Home (6).tsx:1098-1149; App(180).tsx:455-500»

### Grupo B — Persistência: useStoredState e validadores «useStoredState(1).ts; *Context(1).tsx»

ND-8831. O hook `useStoredState<T>(key, fallback, validate)` é o ÚNICO mecanismo de persistência: useState lazy que faz `JSON.parse(localStorage.getItem(key) ?? 'null')` e só aceita se `validate(value)` passar; senão fallback. «useStoredState(1).ts:3-9»
ND-8832. Validação é type-guard escrito à mão por app (`validAppState`, `validWorkspace`, `validStore`, `validKromaState`) exportado junto do contexto — nunca zod/schema externo. «SolContext(1).tsx:22-29; MovaContext(1).tsx:16-23»
ND-8833. Persistência acontece em useEffect `[key, state]` com try/catch vazio comentado ("Private browsing may disable storage") — storage é opcional, nunca quebra o app. «useStoredState(1).ts:11-13»
ND-8834. Chaves de storage são namespaced por app e versionadas: 'sol-app-v1', 'kroma-state-v1', 'vortex-state-2026', 'mova-workspace-v1', 'prisma-store-v1', 'coro-workspace-v1', 'fold-saved-v1', 'lumeo-workspace-v1', 'mestrae-app-v1', 'loopa-lista', 'loopa-seguindo', 'loopa-assinatura'. «SolContext:49; KromaContext:101; VortexContext:58; App(13).tsx:44-46»
ND-8835. clearData do contexto reseta state para o initial e remove TODAS as chaves do app (incluindo chaves satélites como 'mova-newsletter', 'prisma-news') dentro de try/catch, e notifica "Seu espaço local foi reiniciado." «MovaContext(1).tsx:92-96; SolContext(1).tsx:68; PrismaContext(1).tsx:76»
ND-8836. Listas salvas são validadas contra os ids reais do catálogo (`trackIds.includes`) + dedupe via `new Set(v).size === v.length` — impossível persistir id fantasma ou duplicado. «MovaContext(1).tsx:13; CoroContext(1).tsx:11»
ND-8837. Strings de perfil têm teto de tamanho no validador (name ≤80-150, email ≤160-200, text ≤2.000-20.000) — defesa contra lixo em localStorage. «SolContext(1).tsx:11,25; MovaContext(1).tsx:19-20»
ND-8838. Coleções com limite numérico no validador: bookings ≤40-100, pieces ≤20, members ≤40, savedProjects ≤50, appointments ≤100. «PrismaContext(1).tsx:17; LumeoContext(1).tsx:19; CoroContext(1).tsx:18; MovaContext(1).tsx:21»
ND-8839. Datas são validadas por regex de formato (`/^\d{4}-\d{2}-\d{2}$/`, `/^\d{2}:\d{2}$/`) + conferência `!Number.isNaN(new Date(...).getTime())`. «MovaContext(1).tsx:21»
ND-8840. IDs gerados seguem prefixo de app + timestamp base36 maiúsculo: `KR-${Date.now().toString(36).toUpperCase()}` para bookings, `PRJ-…` para projetos, `MV-[A-Z0-9]+` validado por regex no estado. «KromaContext(1).tsx:261,277; MovaContext(1).tsx:21»
ND-8841. AppState de perfil é sempre `{ profile: { name, email } | null }` com trim() ao salvar — perfil é opcional e nunca exigido para usar o app. «SolContext(1).tsx:64; LumeoContext(1).tsx:62»
ND-8842. Plano de assinatura é campo string validado contra planIds do catálogo; billing é literal 'monthly'|'annual' — nunca boolean solto. «SolContext(1).tsx:27; PrismaContext(1).tsx:19»
ND-8843. CORO guarda missão diária com clamp no setter: `done: Math.max(0, Math.min(p.mission.goal, mission.done ?? p.mission.done))` + `day: new Date().toISOString().slice(0,10)` — a meta nunca passa do goal e o dia se carimba sozinho. «CoroContext(1).tsx:67-75»
ND-8844. KROMA persiste até walletBalance e focusProgress como numbers (validação só checa typeof) — estado financeiro é simulado mas persistido. «KromaContext(1).tsx:60-68»
ND-8845. Apps mínimos podem persistir só um `string[]` direto (FOLD: useStoredState<string[]>('fold-saved-v1', [], ok)) — o padrão escala para baixo sem novo hook. «FoldContext(1).tsx:25»

### Grupo C — Modais, toasts e gestão de foco «*Context(1).tsx»

ND-8846. Ao abrir modal, guarda-se o `document.activeElement` em `trigger.current` (se HTMLElement e não há modal aberto) — o gatilho original é memorizado. «SolContext(1).tsx:54-57; VortexContext(1).tsx:73-78»
ND-8847. Ao fechar, `window.requestAnimationFrame(() => trigger.current?.isConnected && trigger.current.focus({ preventScroll: true }))` — foco volta ao gatilho só se ele ainda existe no DOM. «SolContext(1).tsx:58; MovaContext(1).tsx:58-61»
ND-8848. Toast é `{ id: Date.now(), text }` — o id-timestamp garante re-render para mensagens repetidas em sequência. «SolContext(1).tsx:53; PrismaContext(1).tsx:48»
ND-8849. Toast auto-expira em setTimeout entre 3.400 e 3.700ms (3400 FOLD, 3500 SOL/MESTRAE/LUMEO, 3600 PRISMA/CORO/VORTEX/KROMA, 3700 MOVA) — janela estreita e deliberada por app. «FoldContext:35; MovaContext:63-67; KromaContext:120-124»
ND-8850. Abrir modal limpa o toast pendente (`setToast(null); setModal(next)`) — notificação nunca sobrevive à abertura de janela. «SolContext(1).tsx:56»
ND-8851. Toggle de favoritos notifica o RESULTADO: mensagem diferente para remover ("removido dos favoritos") vs salvar ("salvo no seu espaço") — o toast é o feedback do toggle. «VortexContext(1).tsx:89-105; KromaContext(1).tsx:249-256»
ND-8852. Ações do contexto retornam o objeto criado quando preciso (`addBooking` devolve Booking para a tela de sucesso usar o id). «KromaContext(1).tsx:258-267»
ND-8853. Menu mobile fecha com tecla Escape e devolve foco ao botão do menu (`document.getElementById('menu-btn')?.focus()`). «App(180).tsx:53-59»
ND-8854. Modais de confirmação destrutiva são 2 etapas: estado `confirmed` local troca o botão por "Confirmar Exclusão"/"Cancelar" dentro de danger-zone. «Panels (2).tsx:712-760; WorkspacePanels(1).tsx (cancel inline)»

### Grupo D — KROMA: Web Audio, aurora, wallet e atlas «KromaContext(1).tsx; Panels (2).tsx; AuroraEngine; AssetVault»

ND-8855. KROMA tem 13 tipos de modal (search, atlas, project, vault, audio, privacy, booking-success, mentor, booking, plan) — o maior painel-modal do acervo. «KromaContext(1).tsx:5-12»
ND-8856. Sintetizador procedural: AudioContext criado lazy com fallback `window.AudioContext || webkitAudioContext`; resume() se suspenso; tudo em try/catch que desliga setAudioPlaying(false). «KromaContext(1).tsx:127-137»
ND-8857. Cada preset gera 1 oscilador por frequência: type 'sine' (idx 0/2+) ou 'triangle' (idx 1), gain 0.4/(idx+1), e um LFO por oscilador com `frequency = preset.pulse * (idx+1)` e `lfoGain = freq * 0.04` conectado a osc.frequency — o "respirar" do preset. «KromaContext(1).tsx:156-179»
ND-8858. Envelope master: gain 0.001 → 0.2 por exponentialRampToValueAtTime em 1.2s (fade-in); stop faz ramp para 0.0001 em 0.4s e os nós param/desconectam após 450ms — nunca .stop() imediato. «KromaContext(1).tsx:142-152,188-211»
ND-8859. Analyser do engine: `fftSize = 64`, conectado entre masterGain e destination, exposto como `audioAnalyser` no contexto para visualizadores. «KromaContext(1).tsx:146-151,330»
ND-8860. Trocar preset com áudio tocando reinicia o engine com o novo preset e notifica "Canal ativo: {name}" — toggle é idempotente ao preset atual. «KromaContext(1).tsx:213-239»
ND-8861. Aurora pods: seletor de cor que muda `state.auroraColor` e notifica "Aurora Engine: emissão {pod.name} ativada"; pod ativo tem backdrop radial dinâmico `radial-gradient(circle at 50% 30%, ${activeAurora.bgGlow}, transparent 70%)`. «KromaContext(1).tsx:241-247; AuroraEngine(1).tsx:33-42»
ND-8862. Badge de pod é SVG glass com radialGradient id 'glass-spec' (branco 80% → cor 60% → #0b0e14 90%) e olhos/boca desenhados — carimbo de marca por pod com CSS var `--pod-c`. «AuroraEngine(1).tsx:8-30»
ND-8863. Busca global KROMA: normaliza diacríticos com `normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()` e filtra mentors+presets+plans concatenando campos; contagem em `role="status"`. «Panels (2).tsx:9-25,59-63»
ND-8864. Campo de busca tem <kbd>⌘K</kbd> visível e o atalho real é registrado no app raiz (metaKey||ctrlKey + k, preventDefault) — rótulo e atalho casam. «Panels (2).tsx:38-44; App(13).tsx:56-64»
ND-8865. Busca vazia mostra quick tags clicáveis (preenchem a query) e estado vazio com sugestões de termos — busca nunca morre em branco. «Panels (2).tsx:65-75,169-176»
ND-8866. Agendamento de sprint: 5 timeslots fixos ('09:30','11:30','14:00','16:30','18:00'), tópico vem das skills do mentor, e a confirmação vira tela de recibo com código KR-…. «Panels (2).tsx:222-268,316-330»
ND-8867. Export .ics: string VCALENDAR montada à mão (BEGIN/PRODID/VEVENT), Blob 'text/calendar;charset=utf-8', download via `<a download>` temporário + URL.revokeObjectURL — arquivo de calendário sem backend. «Panels (2).tsx:287-297»
ND-8868. Project wizard: nome + disciplina (select) + multiseleção de ferramentas como grid de botões `aria-pressed`; o resumo exibe o AuroraTheme e AudioChannel ATIVOS no contexto. «Panels (2).tsx:371-460»
ND-8869. AtlasModal tem 3 abas — Referências (accordion `<details>` por ref com observações macro/micro e aplicações), Design System (paleta 8 swatches + specimen tipográfico de 3 famílias) e Redistribuição (tabela elemento→origem→nova aplicação); ações: copiar tokens via navigator.clipboard e baixar /mapa-visual.md. «Panels (2).tsx:540-700»
ND-8870. Tokens canônicos do KROMA declarados no próprio AtlasModal: --color-ink #0b0d10, --color-paper #f4f5f8, --color-lime #c8ff45, --color-violet #6d5bff, --color-cyan #34e2ea, --color-magenta #ff4d9d, --color-amber #ffc46b; fontes Outfit Variable/DM Sans Variable/IBM Plex Mono. «Panels (2).tsx:557-562»
ND-8871. PrivacyModal ensina o modelo client-first em prose: "todos os seus projetos… gravados exclusivamente no localStorage", sem rastreadores, síntese de áudio pela CPU local — a privacidade é copy de produto. «Panels (2).tsx:715-735»
ND-8872. Carteira AssetVault: form de transferência com validação NaN/≤0/"Saldo insuficiente no cofre" antes de transferFunds, que faz `Math.max(0, saldo - amount)` — saldo nunca negativa. «AssetVault(1).tsx:10-21; KromaContext(1).tsx:284-290»
ND-8873. KineticFlow: slider `<input type="range">` escreve direto no estado persistido (setFocusProgress) — progresso de foco é controlável pelo usuário. «KineticFlow(1).tsx:15-18»
ND-8874. CollabChain: contador de sprints incrementável com toast comemorativo "Parabéns! Sprint #N registrado com sucesso! 🚀" e seleção de slot com notify por horário. «CollabChain(1).tsx:65-73»
ND-8875. MentorshipGrid: filtro por disciplina (5 + 'All') combinado com busca livre por name/role/skills — dois predicados AND. «MentorshipGrid(1).tsx:13-20»

### Grupo E — VORTEX (Home (6) + Panels (8)) «Home (6).tsx; Panels (8).tsx»

ND-8876. Hero VORTEX tem headline com TOGGLE INTERATIVO embutido na frase: botão-pill com bola `animate={{ x: toggleActive ? 32 : 2 }}` spring stiffness 500 damping 30 + aria-label e title explicativos. «Home (6).tsx:36-62»
ND-8877. Deck de cards com prateleira recortada (`card-deck-cutout-shelf` + shelf-notch-left/right): card ativo ganha `is-focused` por activeDeckIndex no contexto, hover levanta `whileHover={{ y: -6 }}`. «Home (6).tsx:78-110»
ND-8878. Cada deck-card abre modal `{ type: 'deck', id }` e exibe stat + preview em aspas curvas + rodapé "Abrir telemetria" — telemetria fictícia é copy de produto. «Home (6).tsx:84-108»
ND-8879. Prêmios retrospectivos: wordmark vertical gigante (`vertical-huge-text`) + caixa ultramarine com badge estrela cutout + anos empilhados "20/26" e sobrenúmero "22'". «Home (6).tsx:128-180»
ND-8880. Mosaico Aprodhium: 1 card-banner lima + 4 janelas geométricas `window-{shape}` com botão de salvar que faz `e.stopPropagation()` para não disparar o clique da janela. «Home (6).tsx:210-250»
ND-8881. Colunas estádio (stadium-pill-shell) com badge de interseção sobreposto no encontro das colunas e scrim de info embaixo — retratos em cápsula vertical recortam a seção. «Home (6).tsx:290-330»
ND-8882. Colagem em leque de 5 círculos (c-0..c-4) com célula central `center-cell` maior e botão play — collage é grade fixa, não carrossel. «Home (6).tsx:443-470»
ND-8883. Carimbo circular clicável "VORTEX LAB R$ 59/mês" abre pricing com planId 'starter' — preço como selo. «Home (6).tsx:483-493»
ND-8884. Grafo de nós interativo: SVG path Q/T tracejado lime + botões de nó posicionados por % left/top com tooltip-card (label/valor/status) e estado activeNode — telemetria de infra como mapa clicável. «Home (6).tsx:570-606»
ND-8885. Ondas topográficas e polígonos concêntricos são gerados por `Array.from({length:N}).map` com paths paramétricos e strokeOpacity crescente por índice — fundo técnico gerado em runtime. «Home (6).tsx:632-646,780-790»
ND-8886. Card com recorte de arco superior para selo circular giratório "SCROLL DOWN · VORTEX FLOW" (`card-top-arc-indent` + stamp-rotate-text) — o recorte é funcional (assenta o selo). «Home (6).tsx:655-675»
ND-8887. Dashboard FaiPy em tablet mockup com abas REAIS (overview/projects/analytics) por useState local e gráfico de barras simulado por `30 + Math.sin(i*0.4)*25 + (i%3)*12` — mockup com comportamento, não screenshot. «Home (6).tsx:712-800»
ND-8888. Cartão virtual do mockup Payking: guilloche de fundo, número mascarado "4521 ···· ···· 3698", saldo em pílula verde e transações com sinal colorido — fintech como peça de marketing. «Home (6).tsx:866-905»
ND-8889. Painéis VORTEX espelham as seções: DeckPanel/MemberPanel/BundlePanel/PricingModal/DemoPanel/SearchModal/AtlasModal(initialTab) — todo CTA de seção tem painel de destino 1:1. «Panels (8).tsx:13-340»

### Grupo F — VOLTHAUS (App(104) + ui(1)) «App(104).tsx»

ND-8890. Nav que encolhe no scroll via hook `useScrolled(30)`: h 70→62, max-w 1280→1140, ganha `glass r-pill` e sombra — a nav é a primeira leitura de scroll do app. «App(104).tsx:9-25»
ND-8891. Logo mora numa aba escura `bg-[#08090b]/85 ring-1 ring-white/10` dentro da nav glass — contraste de caixa-sobre-caixa. «App(104).tsx:17-20»
ND-8892. Tick de telemetria viva na nav: ponto lime `pulse-glow` + "42.118 MW live" em fonte mono — status como item de menu. «App(104).tsx:29-31»
ND-8893. Hero empilha 4 texturas: aurora, tex-rays, grain e grid em opacity própria + 2 blobs blur[130-140px] + beam central vertical — camadas declaradas por aria-hidden. «App(104).tsx:80-90»
ND-8894. Headline fluida `text-[clamp(48px,8.4vw,124px)] font-light leading-[0.88] tracking-[-0.045em]` — escala display do app inteiro vem de clamps, não breakpoints. «App(104).tsx:95-99»
ND-8895. Console-mockup central com barra de janela (3 bolinhas + URL mono + badge live), sidebar de 5 itens com ativo pintado, número gigante mono, curva SVG com gradiente preenchido e lista de ativos com bolinha colorida — o "produto" é um console desenhado. «App(104).tsx:117-170»
ND-8896. Marquee de clientes duplicado inline: `[...Array(2)].map` com os mesmos 7 nomes — loop infinito sem JS. «App(104).tsx:172-180»
ND-8897. Aba de seção em pasta (`folder-tab`) com fundo lime e pontinho — título de seção vira aba física. «App(104).tsx:185-188»
ND-8898. Filtro de operadores por abas usa resto de módulo: `operators.filter((_, i) => i % tabs.length === tab - 1)` — distribuição determinística de card por categoria. «App(104).tsx:296-300»
ND-8899. Scenario cards: gradiente radial por cenário (lilac/lime/flare/teal) na metade inferior + descrição revelada por hover `max-h-0 → group-hover:max-h-20` com transition-all 500ms. «App(104).tsx:325-352»
ND-8900. Feature grid com equalizador fake por card: 26 barras com `Math.abs(Math.sin(k*0.8+i))*70%` e 1 barra lime a cada 6 (`k % 6 === i % 6`) — dado visual determinístico por índice. «App(104).tsx:433-448»
ND-8901. QR code fake honesto: grade 6×6 com lista literal de índices pintados (`[0,1,2,6,12,18,…].includes(i)`) — QR decorativo declarado como arte, nunca link falso. «App(104).tsx:508-518»
ND-8902. Paleta-fixada no rodapé: "#08090B · #C6F542 · #5B6BF5" impresso como assinatura técnica do app. «App(104).tsx:838»
ND-8903. CTA fixo de canto com corte chevron (`chev-cut fixed bottom-6 right-0`) visível só em xl — promo persistente fora do fluxo. «App(104).tsx:862-868»

### Grupo G — VOLTA (App(180)) «App(180).tsx»

ND-8904. Todo o app VOLTA é embrulhado em `<MotionConfig reducedMotion="user">` — respeito global a prefers-reduced-motion do framer-motion. «App(180).tsx:679»
ND-8905. Skip link `#main` como primeiro elemento + `<main id="main">` — navegação por teclado vem antes da marca. «App(180).tsx:680-681»
ND-8906. Hero com floaters: 5 formas CSS + ícones SVG (Star/Heart/Clover) posicionados por style inline com cores/posições distintas + sticker "Nº1 AI CREATIVE OS". «App(180).tsx:118-138»
ND-8907. CTA com burst de 3 camadas (`cta-burst-layer l1/l2/l3`) atrás do botão + personagem SVG 3D espiando por trás — o CTA é a peça mais decorada da página. «App(180).tsx:144-165»
ND-8908. Dashboard-bento com card de aprovação real: botões "Approve"/"Reject" dentro do mockup — o produto fictício tem affordance de decisão. «App(180).tsx:222-243»
ND-8909. Bento de 6 pilares com `sizeMap` por id (`span-3 row-2 dark`, `span-3 lime`, `span-2 purple`…) — tamanho de tile é conteúdo, não aleatório. «App(180).tsx:252-300»
ND-8910. Marquee de templates duplica a lista (`[...templates, ...templates]`) e repete com `role="list"/"listitem"` — acessível por padrão. «App(180).tsx:383-407»
ND-8911. ReferenceMap modal: `<details open={i===0}>` por referência com paleta (swatches `<i style={{background:c}} />`), geometria, composição, efeitos, tipografia, componentes e "Applied in Volta" — o mapa de design é conteúdo navegável. «App(180).tsx:507-545»
ND-8912. Nota de honestidade do mapa: "Palette HEX values are visual approximations. Font families are adapted to web-safe equivalents" — aproximações declaradas, nunca fingidas. «App(180).tsx:513-515»
ND-8913. Contato sem backend: validação local (nome≥2, mensagem≥10, regex de email) → sucesso oferece mailto: com subject/body encodeURIComponent + downloadBriefing .txt — o envio é decisão do usuário. «App(180).tsx:563-620»
ND-8914. Honeypot anti-spam: input de name="website" off-screen (`left:-9999`) tabIndex=-1 aria-hidden — campo invisível para humanos. «App(180).tsx:626-628»
ND-8915. Estilos críticos faltantes são injetados num `<style>` no fim do App com comentário "critical global styles that weren't moved to css due to size constraints" — escape valve documentado. «App(180).tsx:704-737»
ND-8916. Corrupção no blob raiz: `const odal, setModal] = useState…` (colchete+'m' perdidos) — o export está quebrado tal como foi baixado; a intenção (modal contact|map) lê-se pelo contexto. «App(180).tsx:677»

### Grupo H — LOOPA e convenções pt-BR «App(13).tsx; Secoes(1).tsx; Paineis(1).ts; loopa(1).ts»

ND-8917. LOOPA é o app 100% pt-BR: nomes de handlers em português (`aoTrilhas`, `aoMentor`, `naLista`, `aoAlternar`, `aoSeguir`, `aoConfirmar`) e labels "Minha lista", "Seguir mentor". «Paineis(1).tsx:7-93; App(13).tsx:66-80»
ND-8918. Utilitários de moeda/normalização vivem no data app: `normalizar` (NFD) e `moeda` com Intl.NumberFormat pt-BR BRL maximumFractionDigits 0. «loopa(1).ts:3-5»
ND-8919. Trilha LOOPA carrega cor hex e glifo de ícone por trilha (#F1561F '◍', #C79BF2 '◈', #B9F227 '◇') — cor é dado do catálogo, não do CSS. «loopa(1).ts:25-52»
ND-8920. Painel de plano confirma com assinatura completa `{ plano, ciclo, total, quando }` persistida em 'loopa-assinatura' com validador próprio — compra simulada deixa recibo. «App(13).tsx:24-29,44-46»
ND-8921. Navegação pós-fechar-modal faz scrollIntoView com escolha auto/smooth conforme matchMedia('(prefers-reduced-motion: reduce)') — movimento é opt-out por linha. «App(13).tsx:84-87»
ND-8922. Carrossel de projetos no modal usa wrap-around modular: `projetos[(atual + direcao + projetos.length) % projetos.length]`. «App(13).tsx:88-91»
ND-8923. Seções LOOPA (Campanha, FaixaLogos, Trilhas, Metodo, Estudio, Turmas, Numeros, Planos, Vozes) recebem callbacks por props e mantêm zero import de contexto — composição por injeção. «Secoes(1).tsx:7-464 (sonda)»

### Grupo I — SÖL, PRISMA, CORO, MESTRAE, LUMEO, FOLD «*Context(1).tsx; Home(1); Home (2); Home (4)»

ND-8924. SÖL guarda trilhas completadas por id em 'completed' com toggle no contexto (completeLesson) — progresso educacional é array de ids, não porcentagem. «SolContext(1).tsx:67»
ND-8925. CORO tem rail lateral vertical persistente com botão que liga/desliga `document.body.classList.toggle('vertical-rail')` e reescreve a var --rail — o "mobiliário" da página é alternável. «Home(1).tsx:21-27»
ND-8926. Header CORO liga `scrolled` por listener scrollY > 28 com `{ passive: true }` e cleanup — padrão de scroll-state barato. «Home(1).tsx:18-19»
ND-8927. Hero CORO é triteto display: mesma palavra em 3 tratamentos (sólido, hero-chrome, hero-outline) — peso tipográfico em vez de imagem. «Home(1).tsx:33-38»
ND-8928. MESTRAE fixa o pack no validador: `d.pack === 'Em meio Ritmo'` — plano único hardcoded é invariant, não bug. «MestraeContext(1).tsx:27»
ND-8929. PRISMA acrescenta "peças" de usuário ao mural (addPiece com notify "Peça no mural local.") e missão como array — UGC simulado persistido. «PrismaContext(1).tsx:71-73»
ND-8930. LUMEO limita projetos salvos a 50 no setter: `[project, ...p.savedProjects].slice(0, 50)` — cap no write, não só no validate. «LumeoContext(1).tsx:66»
ND-8931. FOLD é o contexto-vagabundo de referência: 47 linhas, só saved/modals/toast — o padrão degrada com graça. «FoldContext(1).tsx:24-47»
ND-8932. Home (2) MESTRAE tem 13 seções exportadas (Hero…Footer) e Home (4) PRISMA 11 — a landing de cada app é lista fixa de seções nomeadas por conceito (SessionBand, Craft, Orbit, Wall). «Home (2).tsx:9-342; Home (4).tsx:8-322 (sonda)»

### Grupo J — OS Aura: chat e páginas «App (2).tsx; ChatPage; ChatInterface; MessageBubble; Search/History»

ND-8933. O chat Aura tem DUPLA VISÃO: sem mensagens renderiza Hero + composer centrado; com mensagens, lista + composer `absolute bottom-8` — a mesma tela é landing e app. «ChatPage(1).tsx:9-50; ChatInterface(1).tsx:41-46»
ND-8934. Autoscroll do chat: useEffect nas mensagens seta `scrollTop = scrollHeight` do container ref. «ChatInterface(1).tsx:27-31»
ND-8935. Mensagens entram por AnimatePresence mode="popLayout" com bolhas motion `initial={{opacity:0,y:20}}` — popLayout evita reflow das antigas. «ChatInterface(1).tsx:36-55»
ND-8936. Estado de geração é pill dedicada "Aura está processando sua solicitação..." com dot animate-pulse laranja — o "pensando" tem persona e cor. «ChatInterface(1).tsx:56-66»
ND-8937. Composer liquid-glass `rounded-[32px]` com rótulos de topo: upsell "Unlock more with Pro Plan" e assinatura "Powered by Assistant v2.6" — versão do assistente visível na UI. «ChatInterface(1).tsx:67-100»
ND-8938. MessageBubble alterna lados por role (flex-row-reverse no user) e renderiza bloco "Internal Cognition" recolhível (showThoughts default true) com scanline de fundo — raciocínio do modelo é UI de primeira classe. «MessageBubble(1).tsx:9-60»
ND-8939. Todo tipo Message carrega `thought?` opcional — cognição é campo do dado, não renderizador. «MessageBubble(1).tsx:16»
ND-8940. Rodapé da bolha carimba hora + "Aura Pro" em tracking-widest 10px — metadados de mensagem como microtipografia. «MessageBubble(1).tsx:62-68»
ND-8941. History agrupa por tempo ("Today", "Previous 7 Days") com itens mockados de dev ("Refactoring React components…", "CSS Grid vs Flexbox deep dive") e hover que acende ícone para o laranja #FF5C00. «HistoryPage(1).tsx:17-55»
ND-8942. SearchPage do OS: lupa em círculo glass 80px, input h-16 rounded-full com focus ring laranja/30 e lista "Recent Searches" estática — busca é página inteira, não dropdown. «SearchPage(1).tsx:3-46»
ND-8943. Cada página do OS entra/sai com motion y:20/-20 (initial/animate/exit) e key fixa — navegação de views tem coreografia única. «SearchPage(1).tsx:6-12; HistoryPage(1).tsx:5-11»
ND-8944. O hero do chat usa glow de referência: blobs `bg-[#FF5C00]/25 blur-[160px]` etc. e variants framer staggerChildren 0.1 com spring damping 25 stiffness 100 — entrada coreografada padrão Aura. «Hero (3).tsx:14-44»
ND-8945. Storefront/Window/TopNav/Background/Sidebar/FloatingToolbar são peças do shell Aura em subpastas (./w/, ./chat/, ./home/) — a pasta virtual do blob é o package do OS. «App (2).tsx:5-21»

### Grupo K — Movimento: framer-motion, motion/react, Reveal e scrollspy «corpus»

ND-8946. Dois pacotes de animação convivem por escolha de export: framer-motion em 90 arquivos e motion/react em 87 — API idêntica, nenhum app mistura os dois no mesmo componente. «grep: 90+87 arquivos»
ND-8947. Reveal é SEMPRE IntersectionObserver próprio com threshold 0.12, desconecta após 1ª vez e aplica classe `in` + animationDelay em ms — um observer por elemento, sem lib de scroll. «primitives(1).tsx:6-33»
ND-8948. Entradas de seção usam Reveal com delay escalonado por índice (i * 0.06-0.08) — cascata de 60-80ms por card. «App(104).tsx:301-310; BentoMetrics(1).tsx»
ND-8949. useReducedMotion é consultado para zerar durações (StoryPlayer: `duration: reduced ? 0 : .5`) e Hero CORO zera o y do motion (`y: reduced ? 0 : 22`). «TravelDialogs(1).tsx; Home(1).tsx:33-36»
ND-8950. Animações de entrada de view: y ±20-80px com opacity — nunca scale em transição de página; scale fica para hover (whileHover y -6/-8). «SessionPlayer(1).tsx:8; AuroraEngine(1).tsx:60-64»
ND-8951. Accordion padrão: motion.div height 0→'auto' com opacity e overflow-hidden, chevron/plus gira 45° quando aberto — 3 apps usam exatamente esta coreografia. «App(180).tsx:436-448; App(104).tsx:626-636»
ND-8952. Scrollspy AURA: IntersectionObserver com `rootMargin: '-15% 0px -65% 0px'` observando ids de seções e setando o item de nav ativo. «SectionsA (1).tsx:19-28»
ND-8953. Escapes e resize: listeners de keydown Escape + matchMedia change são sempre registrados em useEffect com cleanup duplo — nenhum listener órfão no corpus. «SectionsA (1).tsx:31-41; App(180).tsx:53-59»
ND-8954. Timers simulados: setInterval 1s para relógio de sessão (VIVORA) e setTimeout 5.5s para autoplay de stories, ambos com cleanup — countdown é efeito, não biblioteca. «App(113).tsx:19-21; TravelDialogs(1).tsx»
ND-8955. Variantes framer nomeadas (containerVariants/itemVariants) com stagger 0.1 e spring damping 25 — objeto de variants é preferido a props soltas em heros. «Hero (3).tsx:14-27»

### Grupo L — Atlas de referências e exportação de artefatos «corpus»

ND-8956. Toda landing de design-tool embute um MAPA de referências com campos fixos: nome, tema, composição, geometria, tipografia, paleta (hex), textura, componentes e "aplicado em" — o mapa é o voucher de proveniência do design. «App(105).tsx:5-58; designMap(1).ts:1-19; App(180).tsx:507-545»
ND-8957. referenceMap tipado vai além: cada aplicação carrega `{ feature, where, anchor, implementation }` apontando para CLASSES CSS REAIS (`.hero-image, .hero-shade`) — o atlas liga design→implementação. «designMap(1).ts:10-19»
ND-8958. Comentários de mapeamento vivem no código de seção: "9. WEBBY BRUTALIST BENTO (Lazarev) — Mapeado: texto vertical gigante + notch quebra-puzzle…" — proveniência inline por bloco. «Sections4(1).tsx:4-6»
ND-8959. Downloads de artefatos são helpers no data/utils: downloadBriefing(text, filename).txt, downloadMap().md, downloadFile(md|txt|json), downloadText CSV, exportAppointment .ics, copyTokens clipboard — 6 formatos sem servidor. «App(180).tsx:613-618; WorkspacePanels(1).tsx; Panels (2).tsx:287,565-577»
ND-8960. O plano gerado pelo MOVA Lab é template-string determinística por track (4 semanas usando `track.lessons[N].exercise`) e termina com disclaimer "organizado por um modelo local… Não utiliza IA externa" — IA simulada e declarada. «WorkspacePanels(1).tsx (LabPanel generate)»
ND-8961. Exportação md→txt no MOVA: `text.replace(/^#{1,3}\s/gm, '').replace(/^---$/gm, '')` — conversão de formato por regex no client. «WorkspacePanels(1).tsx (exportPlan)»
ND-8962. CSV de histórico sessão: header inline + join('\n') dos logs com endedAt/programId/seconds/completed — planilha sem servidor. «SessionPlayer(1).tsx (ExportHistory)»
ND-8963. Atlas de tabela de redistribuição: 10 linhas fixas elemento→referência de origem→nova aplicação (ex.: "Aurora Chromatic Pods ← Noah") — a genealogia de cada efeito é publicada na UI. «Panels (2).tsx:655-700»

### Grupo M — Camada de dados .ts «*.ts»

ND-8964. Data map canônico: `export type X = {...}; export const xs: X[] = [...]` no topo do arquivo — types e dados juntos, um app um arquivo. «vora(1).ts:1-13; alto(1).ts:1-16»
ND-8965. Produtos VORA carregam variantes de cor como `{ name, hex, filter }` onde filter é CSS (`sepia(.12) hue-rotate(200deg) saturate(1.8)`) — uma foto serve N cores via filtro. «vora(1).ts:19-27»
ND-8966. Destinos ALTO carregam `coordinates: [x, y]` num mapa 2D próprio + `route[]` de 5-7 etapas com título e texto — roteiro editorial como estrutura de dados. «alto(1).ts:5-50»
ND-8967. Retratos centralizados num objeto `portraits` com URLs pexels parametrizadas (auto=compress&cs=tinysrgb&fit=crop&w/h) e comentário descritivo por pessoa — foto é asset nomeado, não string espalhada. «vortex(1).ts:1-11; ui(1).tsx:3-15»
ND-8968. Badge tone de membro é union fechada `'lime' | 'amber' | 'cyan' | 'pink' | 'violet'` e vira classe `tone-${member.badgeTone}` — enums de cor viram CSS por concatenação. «vortex(1).ts:29-37»
ND-8969. Features/pillars numerados como string ('01.', '02.') com badge em caps e flag `highlight?: boolean` para o card neon — numeração editorial é dado. «vortex(1).ts:14-27»
ND-8970. Avatares de prova social vêm de serviço externo (i.pravatar.cc/64?img=N) com array AV compartilhado — identidade mock é serviço público. «App(113).tsx:10»
ND-8971. Nav de mega-menu é árvore no data: `NavItem { label, items[{title,text,icon,tone}] }` com icon como string chave que o componente resolve por iconMap. «data(10).ts:1-30; Chrome(1).tsx:16-18»

### Grupo N — Efeitos: THREE.js shader e SVG técnico «DistortedBackground(1).tsx; Home (6)»

ND-8972. DistortedBackground: cena THREE mínima (OrthographicCamera z=1 + PlaneGeometry 2×2 + ShaderMaterial transparent) presa num div ref, com limpeza de filhos antes de append — componente de fundo, não de cena. «DistortedBackground(1).tsx:19-44»
ND-8973. O shader tem 14 uniforms configuráveis por props (amplitude 0.06, frequency 18, sharpness 5, yStart 0.4, speed 0.5, maskAngle -54.4°, waveAngle 122°, spacerY/Size/Feather) — o efeito é paramétrico, não hardcoded. «DistortedBackground(1).tsx:6-18,238-258»
ND-8974. Distorsão de onda com shaping: `sign(baseWave) * pow(abs(baseWave), uSharpness)` + onda complexa a 0.4 de peso — nitidez da onda é exponente. «DistortedBackground(1).tsx:119-129»
ND-8975. Máscaras por rotação mat2 (maskAngle/waveAngle) + smoothstep de topo (uYStart) + spacer mask com feather — o efeito respeita zonas da tela. «DistortedBackground(1).tsx:98-116»
ND-8976. Aberração cromática "dreamy": sample com dir*amt*1.5 por canal + multi-tap 2.5 — blur fake por 3 fetches deslocados. «DistortedBackground(1).tsx:54-72»
ND-8977. Spotlight do mouse: distância UV→uMousePos com smoothstep(0.4,0) mistura imagem NÍTIDA sobre a desfocada em 0.8 — interatividade revela o original. «DistortedBackground(1).tsx:147-155»
ND-8978. Vinheta e alfa: `baseAlpha = 0.4 * vignette * uImgOpacity` com smoothstep(0.9,0.15) da borda — o fundo nasce translúcido e some nas bordas. «DistortedBackground(1).tsx:158-162»
ND-8979. Camada de blobs é textura canvas 1024² desenhada em 2D e comida pelo shader (`uCanvasTex`) com offset 0.35 da distorção — 2D alimenta 3D. «DistortedBackground(1).tsx:166-172,260-272»
ND-8980. Vigor de cor pós-processado: luminância Rec.709 misturada a 1.4 para "pop" sobre transparente + boost 1.5 no spotlight. «DistortedBackground(1).tsx:163-166»
ND-8981. Texturas falham para emptyTexture: Promise.all resolve dummy em erro e só texturas válidas entram — fundo nunca quebra por 404. «DistortedBackground(1).tsx:283-300»
ND-8982. Aspect-cover por escala do mesh: compara imageAspect×screenAspect e faz scale.set — cover sem CSS. «DistortedBackground(1).tsx:303-312»

### Grupo O — Acessibilidade e UX de responsabilidade «corpus»

ND-8983. Todo botão-ícone tem aria-label descritivo e todo toggle visual carrega aria-pressed sincronizado com o estado — o corpus usa aria-pressed como regra, não exceção. «Home (6).tsx:218-227; MentorshipGrid; Panels (2).tsx:476-486»
ND-8984. Contagem de resultados de busca é `role="status"` ("N resultados encontrados") — mudança de contagem é anunciada. «Panels (2).tsx:59-63»
ND-8985. Timer de sessão é `role="timer" aria-live="off"` e progresso total tem aria-label porcentual escrito por extenso. «SessionPlayer(1).tsx:6»
ND-8986. Menu burger alterna aria-expanded + aria-controls para o painel mobile — disclosure correto mesmo em landing. «Home(1).tsx:26; App(180).tsx:63-66»
ND-8987. Disclaimers de produto simulado são obrigatórios e específicos: "Reservas são locais e demonstrativas", "Refúgio e valores conceituais", "Reserve um passeio com operador local autorizado" — a ficção é rotulada no ponto de ação. «WorkspacePanels(1).tsx; TravelDialogs(1).tsx; alto(1).ts:33-40»
ND-8988. Segurança de prática física no player: "Movimente-se apenas se estiver confortável. Pare se sentir dor…" + "A sessão pausa ao trocar de aba" — apps de corpo têm copy de segurança. «SessionPlayer(1).tsx:7»
ND-8989. Imagens abaixo da dobra usam loading="lazy"; heros usam eager via componente Image próprio. «KineticFlow(1).tsx:48; TravelDialogs(1).tsx»
ND-8990. Mapas de ícones fallback: `iconMap[name] ?? Sparkles` — ícone inexistente nunca quebra o render. «Chrome(1).tsx:16-18; App(180).tsx:253-260»
ND-8991. Alertas de formulário em `role="alert"` com mensagem específica por regra quebrada — erro é textual e localizado. «App(180).tsx:591-593; WorkspacePanels(1).tsx»
ND-8992. Empty states ilustrados: ícone grande + título empático + CTA que resolve ("Todo caminho começa com curiosidade.") — vazio é tela desenhada, não branco. «WorkspacePanels(1).tsx (renderTracks/renderBookings)»

### Grupo P — Ícones, kits utilitários e cn «ui(11); ui(1); primitives(1); Icons(1)»

ND-8993. Ícones são híbridos: lucide-react direto em 30+ apps e conjunto SVG próprio exportado de ui/Icons (setas, Plus, Close, Star, Play, Chevron, Bolt, Heart, Bookmark, Apple, PlayStore) com stroke-width param — cada app tem seu kit mínimo. «ui(11).tsx:9-88; Icons(1).tsx:1-40»
ND-8994. Kit primitivo BØREAL exporta Reveal, Chip(5 tones), Micro, Arrow, PillButton(6 variants), CircleArrow, Scoop (recorte de canto por CSS vars --sc/--sr), Bloom (radial-gradient animado), Marquee (duplicação 0/1), Annotation (SVG tracejado à mão), Stat, SectionHead — o design system cabe em 1 arquivo. «primitives(1).tsx:6-330»
ND-8995. Botão-pill carrega seta com micro-física: `group-hover:translate-x-1` na seta e `hover:-translate-y-0.5` no botão, duration-300 — movimento em pares. «primitives(1).tsx:121-158»
ND-8996. Scoop: recortes de canto selecionáveis `corners={["tl","tr"]}` com vars `--sc` (cor do recorte) e `--sr` (tamanho px) — inverse-radius paramétrico em componente. «primitives(1).tsx:185-214»
ND-8997. Classname merging por util `cn` (clsx/tailwind-merge) importado de @/utils/cn em todos os kits — composição de classes nunca é concatenação manual. «primitives(1).tsx:2; ui(11).tsx:2»
ND-8998. Ícone de marca é SVG path único (raio VOLTHAUS, flor de 6 elipses rotacionadas BØREAL, cunha cardume) com gradiente defs id fixo — logo é path, não imagem. «ui(1).tsx:19-33; primitives(1).tsx:36-60; Chrome(1).tsx:6-14»
ND-8999. Squircle de ícone: `borderRadius: size * 0.32` proporcional — raio escala com o tamanho do mark. «ui(1).tsx:20-26»

### Grupo Q — Theming em runtime «SettingsPage(3).tsx; theme-*.css (onda 7d)»

ND-9000. Settings do OS Aura oferece 5 temas com id EXATAMENTE igual aos theme-*.css do acervo: default (Glass Default), dark (Obsidian Night), pitch-black (True Pitch Black, "optimized for high-contrast AMOLED"), nordic-forest (Nordic Sage & Forest), sunset-royal (Cosmic Violet) — seletor e CSS casam por id. «SettingsPage(3).tsx:5-33»
ND-9001. Cada tema carrega 4 swatches [{bg, surface, acento1, acento2}] com descrição em prose ("Elegant dark cobalt base with glowing teal and cyber orange.") — a escolha de tema é venda de atmosfera. «SettingsPage(3).tsx:5-33»
ND-9002. Pods de aurora do KROMA trocam a atmosfera em runtime via CSS var (--pod-c, --glow-color) e backdrop radial inline — theming por objeto selecionado, não só global. «AuroraEngine(1).tsx:33-42,55-70»
ND-9003. Rail vertical e classes de modo (vertical-rail, has-announce) são aplicadas em documentElement/body por toggle — o "chrome" do app é mutável por classe raiz. «Home(1).tsx:25-27; Chrome(1).tsx:26-28»

### Grupo R — Higiene do corpus (corrupções e convenções) «vários»

ND-9004. Corrupção sistemática do export: a sequência `[m` desaparece em identificadores — `const [menu` vira `const enu`, `[mode`→`ode`, `[modal`→`odal`, `[hours`→`ours`, `[mentorQuery`→`entorQuery`, `[menuOpen`→`enuOpen`, e `}, messages]);` vira `}, essages]);` — 7 ocorrências em 5 arquivos. «App(180).tsx:677; App(115).tsx:11; App(119).tsx:31; MentorshipGrid(1).tsx:11; ChatInterface(1).tsx:31»
ND-9005. Desestruturação quebrada no mesmo padrão: `cols.map(([h, items]) =>` vira `cols.map((, items]) =>` — o par `[h` sumiu com o colchete. «App(104).tsx:809»
ND-9006. Política de leitura: corrupção é TRANSCRITA como está e interpretada pelo contexto — nunca "corrigida" silenciosamente na extração de regras. «todo o corpus lido»
ND-9007. Imports de React por hooks nomeados com `type` inline (type FormEvent, type ReactNode, type CSSProperties) — nenhum `import React` default necessário. «App(180).tsx:1,10»
ND-9008. Números de telefone/valores usam ponto e vírgula pt-BR nas copies (R$ 890, "12.4k", "R$ 59") e Intl para moeda — formatação localizada no dado ou no helper. «loopa(1).ts:5; kroma(1).ts:22»
ND-9009. Ano canônico do acervo é 2026 (© 2026, "ONLINE 2026", "vortex-state-2026", datas de reserva 2026-04-14) — o "presente" do Neo DevThink. «Home (6).tsx:1147; App(104).tsx:825; Panels (2).tsx:232»
ND-9010. Contagens de prova social são específicas e não redondas (52.000+ creators, 42.118 MW, $20,854.98, 13,200 pontos, 4.9/5 · 2,400 reviews) — verossimilhança por número quebrado. «App(180).tsx:78-84; App(104).tsx:29; Home (6).tsx:894»

### Grupo S — Formulários «Panels (2); WorkspacePanels; App(180)»

ND-9011. Labels wrapper `<label><span>…</span><input/></label>` com placeholder de exemplo real ("seu.email@exemplo.com") — campo sempre rotulado no DOM. «Panels (2).tsx:349-371»
ND-9012. Seleção de horário é grade de botões `aria-pressed` com check inline no selecionado — timeslot é botão, nunca select nativo. «Panels (2).tsx:390-410»
ND-9013. Multiseleção de ferramentas é grid de toggle-btns com Check que muda de cinza para lime — chip visual + checkbox semantics. «Panels (2).tsx:415-435»
ND-9014. Validação mínima explícita por campo com mensagens que dizem o tamanho exigido ("descreva o objetivo e o público com um pouco mais de detalhe"). «WorkspacePanels(1).tsx (LabPanel)»
ND-9015. Formulário de brief valida por regex e comprimento ANTES de oferecer mailto/download — nada sai do client inválido. «App(180).tsx:570-576»
ND-9016. dirty flag no Lab evita regenerar plano perdido: editar marca dirty e a saída pede confirmação — rascunho é protegido. «WorkspacePanels(1).tsx (LabPanel)»

### Grupo T — Loja, telemetria e charts «Dialogs(18); BentoMetrics; Sections(6)»

ND-9017. ProductDialog VORA: swatch-picker com bolinha hex + nome do hex impresso, quantidade com −/+, serial visível na mídia — ficha de produto com metadados técnicos à mostra. «Dialogs(18).tsx:16-52»
ND-9018. Favoritar coração tem estado `on` com fill currentColor e aria-label dinâmico (Remover/Salvar) — toggle de coração é padrão transversal (VORA, KROMA, VORTEX, AURA). «Dialogs(18).tsx:16-19; Home (6).tsx:226-234»
ND-9019. BentoMetrics: jobs com id "#104-002" e valores "80 770 f", tabs "All jobs/Draft/Rendering" com estado default "Rendering" — console de render com dados que parecem reais. «BentoMetrics(1).tsx:12-24»
ND-9020. Gráfico de barras BØREAL fixo em data (`BARS = [{m:'Sep',v:42},…]`) com Reveal — chart é array declarado, nunca gerado aleatório no render. «BentoMetrics(1).tsx:7-12»
ND-9021. Sections(6) importa `chart.js/auto` para o ChartQr do StudioBento — único uso de lib de chart do acervo; todo o resto é SVG/CSS próprio. «Sections(6).tsx:1-7 (sonda)»
ND-9022. Telemetria falsa com granularidade mono: "24h telemetry", "Q1 2026", "verified", "99.4% Fidelidade de tom", "1.44s avg" — números técnicos com unidade e período. «Home (6).tsx:764-766,786; App(104).tsx:470-476»
ND-9023. Notas de rodapé de simulação financeira: "O timer registra apenas o tempo em que esteve rodando. Etapas puladas não contam" — regra de negócio honesta em copy. «SessionPlayer(1).tsx:5»

### Grupo U — Anatomia das landings exportadas (esqueleto de seções) «Showcase(1); App(180); Sections(6)»

ND-9024. Seções de landing são componentes nomeados exportados e reusáveis entre blocos: Marquee, Stats, Bento, PlansOverPhoto, Gallery, Architecture, SealBlock, Pricing, Faq, SystemPanel, FinalCta — o esqueleto é um catálogo fechado. «Showcase(1).tsx:21-370 (sonda)»
ND-9025. Stats section é render de array `{label, value, hint, cls?}` com card por item e classe extra opcional — dados de prova social nunca são JSX solto. «App(180).tsx:205-218; Showcase(1).tsx:37-48»
ND-9026. Logo cloud é TEXTO PURO: 12 nomes em spans ("northwind", "Lumen", "PACIFIC"…) sem imagem — logos fictícios nunca violam marca real. «App(180).tsx:302-311»
ND-9027. Cards de showcase com arte SVG abstrata paramétrica: gradiente linear com stops escolhidos por índice `['#8b5cf6','#7dd3fc','#facc15'][i]` e path Bézier igual para todos — variação por cor, não por desenho. «App(180).tsx:331-352»
ND-9028. Opening/Closing são pares de seção padrão do design-tool (Opening(1..10), Closing(1..17) existem no acervo) — a landing tem "abertura" e "encerramento" como unidades. «ls Opening*/Closing*; Grep framer-motion»
ND-9029. CTA banner com sidebar vertical de texto ("DOWNLOAD APP ↓" em cta-pill-sidebar) e shape 3D importado de /images — o CTA final ocupa a borda, não só o centro. «App(180).tsx:412-428»
ND-9030. Rótulos de seção numerados por extenso: "01 — WHAT'S IN VOLTA", "02 — TEMPLATES", "03 — LIBRARY", "04 — FAQ" — a página é indexada editorialmente. «App(180).tsx:285,340,388,438»
ND-9031. Bento com prop-mark condicional: `card.id === 'kit' && <img class="prop-mark tall">`, `card.id === 'campaign' && <svg>` — cada tile grande tem sua arte exclusiva amarrada ao id. «App(180).tsx:289-299»
ND-9032. SectionLabel numerado por componente (`<SectionLabel number="02">CANVAS INTERTRAVADO</SectionLabel>`) — numeração de seção é prop, não texto. «CollabChain(1).tsx:11; AuroraEngine(1).tsx:37»

### Grupo V — Heros, navs e cards recorrentes «App(113); App(119); Hero (3); App(142)»

ND-9033. Chrome flutuante VIVORA: barra sticky `top-2 md:top-4` com float-pill rounded-full flutuando sobre o hero — a nav é um chip, não uma barra. «App(113).tsx:35-58»
ND-9034. Chips rotacionados com jitter: `rot-chip` com CSS var `--r` (-12deg/12deg) e duas classes de timing (anim-float/anim-float2) alternadas — flutuação dessincronizada por par. «App(113).tsx:41-44»
ND-9035. Hero em 3 colunas de cards com a central sobreposta: `md:-mb-10 relative z-10` — card-pilar avança sobre os vizinhos. «App(113).tsx:66-98»
ND-9036. Progresso circular por CSS var: `ring-dash` com `--p: 94%` e número central — gauge é classe+variável, sem SVG de estado. «App(113).tsx:88-90»
ND-9037. Hero termina em swoosh (`hero-swoosh`) — curva de saída que emenda o hero na seção seguinte. «App(113).tsx:99»
ND-9038. Textura de "flautas" de luz: `beam-bg` + `beam-flutes` com opacity 60 — hero escuro sempre tem estrias verticais. «App(113).tsx:37-38»
ND-9039. Wordmark com marca abstrata: 3 `<i>` barras num span wordmark-mark — logo minimalista construído por divs. «App(119).tsx:26-31»
ND-9040. Card de pontos com badge de status inline ("13,200" + pílula "Ready") — gamificação em widget de hero. «App(113).tsx:70-77»
ND-9041. Logo aceita prop inverse/compact para alternar dark/light no mesmo path SVG. «App(142).tsx:37-58; ui(1).tsx:36-44»
ND-9042. Orbs coloridos como floaters nomeados: `<Orb color="blue|orange|lime">` — bola blur reusável por props. «App(142).tsx:98-101»

### Grupo W — Entry points, shell de modal e engine de sessão «main; Chrome; Modal; SessionPlayer»

ND-9043. Announcement bar toggle ajusta o layout global: `document.documentElement.classList.toggle('has-announce', visible)` — o html inteiro reage ao aviso via seletor descendente. «Chrome(1).tsx:26-38»
ND-9044. Announcement bar com CTA inline e fechamento próprio ("Now in public beta · Start free today →"). «App(180).tsx:70-73»
ND-9045. Logo/wordmark é sempre âncora `href="#top"` — clicar na marca volta ao topo em todo app. «ui(1).tsx:36; App(119).tsx:26»
ND-9046. Entry mínimo também existe: main (2).tsx sem fontsource, 13 linhas — o import de fontes é camada opcional do export. «main (2).tsx:1-13»
ND-9047. Exports parciais/truncados fazem parte do acervo (App(141) 50L, App(164) 81L) — blob pode conter fragmento de app sem raiz. «wc -l App(141) App(164)»
ND-9048. Um app pode vir fatiado em família de blobs: SectionsA/B/C + Primitives + Decor + Shell + Journal + Moments + Experiences = o app AURA-arquivo em ~10 arquivos irmãos. «SectionsC(1).tsx:1-7; ls Sections*/Journal*»
ND-9049. Modal é componente único genérico `Modal { open, onClose, title, wide }` que recebe o conteúdo por children (ContactForm OU ReferenceMap) — janela shell reutilizada por 2+ fluxos. «App(180).tsx:703; Modal(1/11/16/19/22/26/29 existem)»
ND-9050. DesignLab é seção-produto recorrente (3 variantes no acervo) — o "laboratório de design" aparece como feature dentro das landings. «ls DesignLab*; App(180).tsx:701»
ND-9051. Convenção de export: páginas e seções usam named exports; só a raiz App usa default — imports misturam os dois estilos no mesmo arquivo. «App (2).tsx:5-21; ChatPage(1).tsx:6»
ND-9052. Tipos de navegação centralizados: `import { View } from './types'` com union de páginas compartilhada entre Sidebar e App — navegação tipada ponta a ponta. «App (2).tsx:4,25; Hero (3).tsx:4-8»
ND-9053. Engine de sessão MOVA é hook dedicado (useSession): SessionEngine com program/status/step/stepIndex/remaining/progress/toggle/previous/next/reset/end/displayTime/practiced — timer de prática é máquina de estados fora do JSX. «SessionPlayer(1).tsx:4-6»
ND-9054. Timer só conta rodando e pausa ao trocar de aba — regra de negócio do engine ecoada na UI ("Etapas puladas não contam como tempo praticado"). «SessionPlayer(1).tsx:5,7»
ND-9055. Helpers de loja compartilhados: `money()`, `nextDrop()` e `downloadBlob` no data — moeda e countdown de drop são funções do módulo de dados. «Dialogs(18).tsx:3»

### Grupo X — Dashboard copy e micro-dados «Home (6); App(104)»

ND-9056. Cards de métrica com número mono gigante e trend colorida por sinal ("+11.01%" lime, "+8.4%" cyan, "+15.03%" amber, "+6.08%" pink) — 4 trends, 4 cores. «Home (6).tsx:771-794»
ND-9057. Logos de parceiros com glifo unicode + nome caps ("✦ CBS NETWORKS", "⬡ EBAY GLOBAL", "★ VOX MEDIA", "❖ WIRED LABS") — marca representada por caractere, nunca logo real. «Home (6).tsx:315-321»
ND-9058. Stickers rotacionados com jitter determinístico por índice: `rotate(${[-8,6,-4,9,-7,5][i]}deg)` — bagunça controlada, sempre a mesma. «App(104).tsx:527-536»
ND-9059. Sistema de tone de botão unificado por string em todos os kits: lime/white/black/outline/ghost (+coral/dashed, bone/void, navy/orange) — a API de botão é `tone`, nunca classes soltas. «primitives(1).tsx:121-140; ui(11).tsx:120; App(104).tsx:600»
ND-9060. Glow de CTA em 2 escalas: pulse-glow em dots pequenos e blur-[80px] radial atrás de CTA final — o "brilho vivo" aparece em píxel e em mancha. «App(104).tsx:825-830; Home (6).tsx:1035»

---


## FASE 8d — captures + infra (llms/vfs/sandbox/relay) + catálogo IMG (fonte: neodocs-txt raiz + neoimg/)

250 regras (ND-9101..9350; 9351..9400 reservado) em 15 blocos A-O: captures 44, sandbox 23,
VFS 16, vm.config 13, autopilot/supervisor/daemonize 23, signaling relay 15, PCM virtual 19,
backloop HTTPS 19, Three.js TSL 14, catálogos config 21, inventários 14, catálogo IMG 11.
Inventário IMG (neoimg, fase final OPR-0058): 423 binários — jpg 256 / png 102 / webp 64 /
avif 1, 162,6MB, 1 duplicata md5; zero textos (pulo justificado, registrado como regras).


### Bloco A — Captures 1.1.40: pipeline de mídia (capture.txt)

ND-9101. O pipeline de captura aceita somente os formatos png, jpeg e webp; a gramática de policy recusa qualquer formato fora desse conjunto. «capture.txt:8-9»
ND-9102. Os alvos de export de captura revisada são memory, download e clipboard; escritas em disco ficam dentro do fluxo de download revisado. «capture.txt:11-12»
ND-9103. Os kinds de captura são shotview (viewport), shotfullpage (costurada), shotelement, shotregion e contactsheet, listados entre as capacidades de cada proposal request. «capture.txt:14-15»
ND-9104. Defaults de captura normalizados: format png, pixelratio 1 e exporttarget memory. «capture.txt:17-18,32,38»
ND-9105. Normalização de opções é whitelist: só sobrevivem format conhecido, quality/pixelratio numéricos finitos, annotate booleano e exporttarget conhecido — nada mais ecoa. «capture.txt:18-28»
ND-9106. Todo shotrecord carrega id, runid, stepid, kind, format, width/height escalados pelo pixel ratio, capturedat e bytes como dataurl. «capture.txt:31-48»
ND-9107. shotview mede viewport × ratio arredondado por Math.round; shotelement e shotregion medem o retângulo escalado por scaledrect. «capture.txt:31-48,70-108»
ND-9108. shotfullpage mede scrollwidth×scrollheight do stitchplan × ratio — a geometria vem do plano de tiles, nunca de estimativa. «capture.txt:51-67»
ND-9109. Campos opcionais (name, annotate, exporttarget, target) entram por spread condicional — ausente não vira null. «capture.txt:43-45,63-65»
ND-9110. beforeafter é a única policy que gera shotpair; as demais policies registram reason e deixam o par para os kinds manuais. «capture.txt:129-133»
ND-9111. pairstates pula o par com motivo explícito: before ausente → skipped "before"; ação falhou antes do after → skipped "after" com o kind da ação. «capture.txt:112-127»
ND-9112. O shotpair vincula beforeid/afterid, actionkind, target opcional, domsnapshotid opcional e o timestamp at do mesmo momento. «capture.txt:112-127»
ND-9113. O plano de costura (buildstitchplan) produz grade de tiles: colunas = ceil(scrollwidth/viewport), stepy = viewport − overlap, última linha clampada ao fim da página. «capture.txt:135-150»
ND-9114. Página que cabe no viewport gera exatamente 1 linha de tiles sem clamp artificial. «capture.txt:140»
ND-9115. Overlap é clampado em ≥0 e arredondado; seams nunca assumem valores fracionários de pixel. «capture.txt:136-137»
ND-9116. Os pesos de seam são cross-fade linear (index+1)/(overlap+1): primeira faixa mantém o conteúdo existente, última adota o tile novo. «capture.txt:152-158»
ND-9117. blendrows mistura faixas de igual comprimento com os pesos lineares — tile seams nunca dão corte duro. «capture.txt:160-167»
ND-9118. Faixa idêntica à primeira banda (fixedheadermatch) é pulada — headers fixos nunca se repetem entre tiles. «capture.txt:169-173»
ND-9119. scaledrect escala retângulo css pelo ratio com piso 1 (ratio <1 não encolhe) e arredondamento por aresta. «capture.txt:175-179»
ND-9120. croprect clampa o retângulo à parte visível do viewport e nunca devolve geometria negativa. «capture.txt:181-186»
ND-9121. Elemento que cruza qualquer borda do viewport (crossesviewport) cai em captura tiled — sem crop parcial. «capture.txt:188-191»
ND-9122. regionsteps caminha um container scrollable em passos revisados com clamp final e dedupe de tops repetidos. «capture.txt:193-202»
ND-9123. Contact sheet (buildsheet) posiciona capturas em grade labelada: columns ≥1 é escolha do usuário sem teto no código; rows = ceil(células/columns). «capture.txt:204-226»
ND-9124. Gramática de caption do sheet: none = vazio, index = número, selector = seletor, label composto = "n · seletor · label". «capture.txt:222»
ND-9125. Cada célula carrega index, column, row, selector, label e caption selados na struct sheetcell. «capture.txt:205-226»
ND-9126. Nome de arquivo de capture vem da naming rule: segmentos run/step/sequence/kind slugificados e juntados por hífen, extensão minúscula sem ponto líder; counter de sequência garante unicidade na run. «capture.txt:228-242»
ND-9127. capturepart slugifica para [a-z0-9-] com trim de hífens e fallback "capture"; segmento vazio nunca quebra o nome. «capture.txt:229-231,241»
ND-9128. Plano de anotação por captura: marker do número do step em inset 8–24px calculado como min(width,height)/12, outline opcional expandido 2px e footer `ISO-8601 · URL`. «capture.txt:244-263»
ND-9129. O footer de anotação usa capturedat em toISOString e a url da página no momento da captura — evidência auditável. «capture.txt:256»
ND-9130. Outline do alvo é o rect revisado expandido exatamente 2px por lado. «capture.txt:258-261»
ND-9131. Bytes da captura viajam como dataurl dentro do record — o binário nunca é salvo fora do fluxo revisado. «capture.txt:42,61,81»
ND-9132. Toda regra correlata do domínio captura (defaults, tiling, seam, header fixo, ratio, crop, region steps, sheet, naming, before/after) vive em um único módulo de media capture. «capture.txt:3-6»

### Bloco B — Capture Platform UKA (05.capture.platform)

ND-9133. A capture platform registra o movimento humano/agent dentro do browser (foco Brave) e exporta tudo como JSON logs em `docs/logs/<session>.json` — base para treinar e replayar computer use. «05.capture.platform.txt:1-5»
ND-9134. Mouse virtual: cursor SVG injetado na página via CDP init script que segue o movimento real e desenha trail e ripple de clique. «05.capture.platform.txt:9»
ND-9135. Eventos capturados: click, double click, drag, scroll, coordenadas x/y, ângulo de rotação do wheel, timing, target (selector/role/text) e seed determinística. «05.capture.platform.txt:10»
ND-9136. SessionEvent tipado: move (x,y,tx,ty), click (button left/right, target), drag (x0,y0,x1,y1), scroll (dx,dy,angle), key (key,target) — todos com timestamp t; tipo aberto para extensão. «05.capture.platform.txt:33-41»
ND-9137. Arquitetura root-based sem src/: web/ de frontend (index.html, capture.js, recorder.js, exporter.js) + lógica raiz agrupada por skill arch. «05.capture.platform.txt:13-29»
ND-9138. humancursor move o cursor humanamente (bezier + jitter + overshoot) via CDP `Input.dispatchMouseEvent` — nunca por locators. «05.capture.platform.txt:23,47»
ND-9139. trajectory.js gera o caminho (inspiração ghost-cursor/humanjs); replay.js repete a sessão deterministicamente pela seed. «05.capture.platform.txt:24,27»
ND-9140. fingerprint.js aplica stealth patches em webgl/canvas/audio. «05.capture.platform.txt:25»
ND-9141. Sessão abre Brave via playwright/chromium com chrome.debugger (CDP). «05.capture.platform.txt:45»
ND-9142. Export compacta trajetórias colapsando runs de move antes de serializar em docs/logs/. «05.capture.platform.txt:49»
ND-9143. Stack declarada da plataforma: playwright, puppeteer, chromium-bidi, bezier-js, @napi-rs/canvas, d3, socket.io-client e zod (validação de eventos). «05.capture.platform.txt:57»
ND-9144. O formato final dos logs é detalhado em 11-movement-logs-json.md — a plataforma não redefine o schema. «05.capture.platform.txt:51-53»

### Bloco C — Render capture e revisão visual (stealthhead)

ND-9145. Cada build pass visual produz no mínimo 1 screenshot renderizado de um viewpoint de revisão nomeado. «render_capture.txt:7»
ND-9146. Usar primeiro a ferramenta de browser/screenshot já disponível (browser MCP, preview do projeto); NÃO instalar Playwright/Chromium só por causa do skill, salvo permissão explícita ou dependência existente. «render_capture.txt:7»
ND-9147. O comparison sheet (make_comparison_sheet.py --reference --render --out --json) só alinha e empacota evidência — o score de aceitação NÃO é calculado por script; a visão da IA inspeciona comparison.png. «render_capture.txt:12-19»
ND-9148. Viewer determinístico para review: desabilitar controles interativos antes da captura (controls.enabled=false), só chamar controls.update() quando window.__interactive for true, ativado por gesto explícito do usuário. «render_capture.txt:26-32»
ND-9149. Emular o viewport exato da referência (ex.: 1600×900×1) para screenshot = canvas; restart do browser reseta a emulação — reavaliar entre sessões. «render_capture.txt:31-32»
ND-9150. Match de framing: alinhar bounding box ao extent da referência, view "match" posiciona a câmera para o objeto ocupar ~98% da largura da referência; nunca acionar gates quando o framing é intencionalmente diferente. «render_capture.txt:53-59»
ND-9151. Notar em review quando o framing não pode casar (aspect ratios, fundos diferentes) — diferença declarada não vira falso defeito. «render_capture.txt:58»
ND-9152. Máximo 5 features semânticas críticas por pass usando o mesmo par de imagens; features incertas até 3, só quando escalation adaptativa ajuda. «render_capture.txt:78»
ND-9153. Targets genéricos do spec inicial são placeholders — substituir por sistemas específicos do objeto no pre-spec assessment, senão validação estrita não pode passar objeto moderado/complexo. «render_capture.txt:80»
ND-9154. Comparar por camadas nesta ordem: 1 silhueta e proporções, 2 estrutura de componentes, 3 form detail, 4 resposta de superfície, 5 features locais, 6 lighting/câmera, 7 tradeoff de performance. «render_capture.txt:84-92»
ND-9155. Decision matrix: componente errado/ausente → refine-spec; spec ok e render diverge → refine-code; screenshot escuro/perto/viés de câmera → refine-code de câmera/luz antes de julgar fidelidade; fonte insuficiente → request-input; pass OK sem risco futuro → continue. «render_capture.txt:96-100»
ND-9156. `continue` só com score global ≥ selfCorrectLoop.visualAcceptance.threshold (normalmente 0.7) e cada feature crítica no próprio limiar; script numérico/pixel-diff diagnostica mas não aprova. «render_capture.txt:102»
ND-9157. Scorecard AI vision de 5 camadas 0..1: silhouetteProportion, componentStructure, formDetail, materialSurface, lightingCamera. «render_capture.txt:106-112»
ND-9158. Nunca esconder camada crítica falhada dentro de média alta: camada essencial visivelmente errada força refine-spec/refine-code mesmo com média acima do threshold. «render_capture.txt:114»
ND-9159. Tiers de feature: critical (identidade, precisa passar sozinha no par completo), important (revisar suspeitas, média no limiar), detail (notas e deferir a refinement). «render_capture.txt:118-121»
ND-9160. Partes repetidas de um sistema reconhecível são UM target (ex.: 3 cabines = cabin-system), não 3 alvos separados. «render_capture.txt:122»
ND-9161. Evidência registrada com referenceScreenshot, renderScreenshot, comparisonImage, cameraView nomeado, notes em termos de 3D, aiVisionScore, layerScores, aiVisionNotes e featureReviews por id. «render_capture.txt:126-136»
ND-9162. Screenshot nunca é decoração: é ground truth do loop de autocorreção. «render_capture.txt:138»

### Bloco D — Sandbox FlashLite (iframe runtime)

ND-9163. Shell estático do preview carrega via srcdoc em origin opaco — sandbox="allow-scripts allow-forms" SEM allow-same-origin. «Sandbox.txt:15,499»
ND-9164. Atualizações de conteúdo chegam por postMessage; nunca por injeção em contentDocument. «Sandbox.txt:16,356-362»
ND-9165. CSP do shell: default-src 'none' com allowlist explícita — script tailwind cdn/unpkg/cdnjs + 'unsafe-inline'/'unsafe-eval', style googleapis + inline, font gstatic, img data:/blob:/https, connect translate.googleapis, frame-src 'none'. «Sandbox.txt:22-23»
ND-9166. Stack de runtime pré-carregada no shell: cdn.tailwindcss.com, lucide@latest via unpkg, Google Fonts Syne/Outfit/Plus Jakarta Sans/Space Grotesk com preconnect. «Sandbox.txt:24-28»
ND-9167. window.FlashLiteAPI expõe navigate, openSubpage e performAction; cada chamada captura o form state corrente antes do postMessage. «Sandbox.txt:54-67»
ND-9168. getFormState coleta input/textarea/select: name→id→placeholder como identificador; select usa o texto da opção; checkbox/radio viram checked/unchecked; valores vazios não entram. «Sandbox.txt:31-52»
ND-9169. FlashLiteRuntime.detectType classifica código em html, react-tsx ou python por heurísticas de conteúdo (DOCTYPE, import React, useState/useEffect, streamlit/fastapi, def main). «Sandbox.txt:70-96»
ND-9170. Autocomplete off em todos os campos de formulário, com MutationObserver reaplicando a inputs adicionados dinamicamente. «Sandbox.txt:98-109»
ND-9171. Interceptação universal de clique: anchors, scroll suave para hash interno, elementos com data-href/data-page/data-route/data-navigate/data-subpage/data-action e itens clicáveis de nav/header/footer. «Sandbox.txt:112-181»
ND-9172. Clique em elemento com onclick próprio NÃO é sequestrado; botão submit dentro de form é respeitado. «Sandbox.txt:129-133,143-145,169-172»
ND-9173. Texto significativo de 2–50 chars em elemento clicável sem h1/h2/form/input vira navegação por slug (NFD → sem acento → [a-z0-9-]). «Sandbox.txt:174-179»
ND-9174. CONTENT_UPDATE aplica body class/style, colorScheme, links de fonte data-flash-lite-font, innerHTML limpo, re-execução de scripts inline (exceto #page-plan e application/json) e lucide.createIcons(). «Sandbox.txt:184-224»
ND-9175. Links de fonte injetados só se href começa com https://fonts.googleapis.com/ — todo outro stylesheet externo do <head> gerado é bloqueado. «Sandbox.txt:192-200,388-405»
ND-9176. HOVER_COMPONENT marca/unmarca highlight via classe flash-lite-highlight + ring-2 ring-blue-500 ring-offset-2, endereçado por [data-component-id]. «Sandbox.txt:227-244»
ND-9177. COMPONENT_EDIT_UPDATE injeta edição de componente em container temporário flash-lite-temp-container após o alvo, escondendo o original; fences ``` de markdown são stripadas. «Sandbox.txt:245-265»
ND-9178. Handshake SANDBOX_READY: pai só envia mensagens após o ready; conteúdo pendente antes do ready é retido e liberado no handshake. «Sandbox.txt:270,356-362,459-466»
ND-9179. O pai só aceita mensagens cujo event.source é o contentWindow do próprio iframe. «Sandbox.txt:455-457»
ND-9180. Mensagens do runtime: RUNTIME_DETECTED (framework), OPEN_CODE_PANEL, NAVIGATE (url/text/formState) e ACTION (intent/payload/formState). «Sandbox.txt:468-488»
ND-9181. Canvas do preview 2026 é dark-dominante: #07090E de fundo e #F0F4F8 de tinta; modo light SÓ com meta color-scheme=light explícita no HTML gerado. «Sandbox.txt:281,338,381-386»
ND-9182. Full document gerado é reduzido ao body; fragmentos têm html/head/title/meta/body stripados por regex. «Sandbox.txt:415-427»
ND-9183. O background do próprio iframe é sincronizado ao canvas para eliminar flash branco. «Sandbox.txt:439-442»
ND-9184. Kit de efeitos do shell: @keyframes float-slow/pulse-glow/shimmer/gradient-flow + classes glass-panel (blur 20px), liquid-glass (blur 24px), bevel-card (clip-path canto 14px) e hover-lift (cubic-bezier 0.16,1,0.3,1 com glow violeta). «Sandbox.txt:286-332»
ND-9185. ::placeholder com opacity 0.45 e color: inherit em inputs/textarea/select/button. «Sandbox.txt:334-335»

### Bloco E — VFS (buildHierarchicalVFSProject)

ND-9186. detectLanguage resolve por extensão (tsx/ts/jsx/js/html/htm/css/py/json) e cai para heurística de conteúdo (import React, def , DOCTYPE) com default typescript. «vfs.txt:8-30»
ND-9187. Extractor de componente tem 3 níveis de endereçamento: comentários `<!-- COMPONENT_START: id -->…COMPONENT_END`, depois atributo data-component-id, depois id. «vfs.txt:35-54»
ND-9188. Arquitetura de projeto virtual: PASTA = PÁGINA, com todas as camadas/componentes dentro da pasta correspondente. «vfs.txt:66-68»
ND-9189. Conteúdo cru é limpo de fences ```html/tsx/typescript/jsx/python antes do parse. «vfs.txt:82»
ND-9190. Framework base detectado: python (import streamlit/fastapi/nicegui/flet ou def …), senão react-tsx (import React/export default/useState), senão html5; extensão de página e componente deriva do framework. «vfs.txt:85-95»
ND-9191. addFile registra cada path uma única vez (Set de registeredPaths) — duplicata de caminho não cria arquivo. «vfs.txt:100-117»
ND-9192. Arquivos delimitados explicitamente pela IA são extraídos de `<!-- FILE: path --> … <!-- END_FILE -->` (ou próximo FILE/EOF). «vfs.txt:120-128»
ND-9193. Páginas viram pastas pages/[slug]/page.{ext}; slug = minúsculas, NFD sem acentos, não-alfanumérico → hífen, fallback home. «vfs.txt:159-171»
ND-9194. A página corrente usa o conteúdo limpo atual; páginas do sitePages mantêm o próprio html; se a corrente não está na lista, entra como current-active-page em primeiro lugar. «vfs.txt:132-157»
ND-9195. Componentes da página corrente vêm do ComponentPlan em memória; demais páginas re-extraem via extractPlanFromHtml. «vfs.txt:174-179»
ND-9196. Cada componente vira arquivo PascalCase.{tsx|html} na pasta da página; sem snippet, grava stub comentado com div id + data-component-id de wrapper. «vfs.txt:182-201»
ND-9197. index.html de entry é gerado para projetos tsx (charset/viewport/título + cdn.tailwindcss.com + body bg-[#07090E] text-slate-100 + #root). «vfs.txt:209-216»
ND-9198. package.json virtual gerado: react ^19, react-dom ^19, lucide-react ^0.470, framer-motion ^12 para tsx; scripts dev/build por framework (vite | python main.py | npx serve .). «vfs.txt:218-238»
ND-9199. VirtualProject selado: id `proj-<Date.now()>`, título, siteId herdado, entryFile resolvido (root entry se existir, senão primeiro arquivo, senão index.html), framework e files, isVirtual: true. «vfs.txt:240-248»
ND-9200. parseVirtualProject é wrapper retrocompatível de buildHierarchicalVFSProject. «vfs.txt:253-256»
ND-9201. Metadados de VirtualFile incluem componentId, pageId e isComponent além de path/name/content/language. «vfs.txt:100-117,195-201»

### Bloco F — AetherForge vm.config v5

ND-9202. Princípio do hypervisor: "Every numeric ceiling is a software object. Edit, do not buy." — todo teto numérico (vcpu, memória, threads) é objeto de software configurável. «vm.config.txt:1-2»
ND-9203. Machine aether-lab: accelerator kvm (kvm|hvf|whpx|tcg), nested=false, machine_type q35, qemu 11.1.0. «vm.config.txt:4-9»
ND-9204. CPU: model host (Ryzen 9 9950X3D), 1 socket × 2 dies × 8 cores × 2 threads = 16 vcpus; maxcpus 128 como ceiling de hotplug. «vm.config.txt:11-20»
ND-9205. Overcommit de CPU configurável 1–64 guest vCPU por host thread (default 4). «vm.config.txt:20»
ND-9206. Memória: 64 GiB em 4 slots, max_gib 512 via virtio-mem, hugepages 2M (ou 1G), balloon + virtio_mem + ksm + zswap ativos. «vm.config.txt:22-29»
ND-9207. host_overcommit = always mapeia vm.overcommit_memory 0|1|2 (never|heuristic|always). «vm.config.txt:32»
ND-9208. GPU: RTX 5090 32 GiB com modes vfio|vgpu|mig|virtio|none; looking_glass via ivshmem 128 MB; perfis mig 1g.10gb e vgpu grid_rtx5090-4q. «vm.config.txt:34-41»
ND-9209. MTTG (scheduler): enabled com virtual_threads 65536 (faixa 1..1.000.000, ≥ vcpus), steal work-stealing, fairness cfs-inspired, parking ativo. «vm.config.txt:43-48»
ND-9210. Security: tpm true (swtpm), sev_snp/tdx false, iommu intel (|amd|smmuv3). «vm.config.txt:50-54»
ND-9211. Disk: qcow2 com aio io_uring, discard unmap, compressão zstd, 4 queues. «vm.config.txt:56-62»
ND-9212. Net: virtio-net-pci, 4 queues, vhost e vsock ativos. «vm.config.txt:64-68»
ND-9213. Paths canônicos: hugepages /dev/hugepages, looking-glass /dev/shm/looking-glass, swtpm /run/swtpm/swtpm-sock, share /srv/aether. «vm.config.txt:70-74»
ND-9214. vGPU/MIG são alternativas declaradas no mesmo config — o modo é campo de config, não fork de infraestrutura. «vm.config.txt:36-41»

### Bloco G — Daemonização, supervisor e autopilot (2.0.14)

ND-9215. O harness da sandbox mata a árvore de descendentes da tool call; sobrevivência via duplo-fork + setsid: fork → setsid → fork de novo → neto órfão adotado pelo PID 1 (tini) escapa da varredura. «daemonize.txt:2-6»
ND-9216. Pai sai imediatamente após o primeiro fork (a tool call volta logo); o fork intermediário faz _exit para o neto ficar órfão puro. «daemonize.txt:20-27»
ND-9217. Neto se desprende: chdir "/", umask 022, fds 0/1/2 → /dev/null via dup2, devnull extra fechado. «daemonize.txt:29-45»
ND-9218. execvp falhou → append em daemonize.err e _exit(127) — última saída possível antes do exec. «daemonize.txt:47-53»
ND-9219. Supervisor guarda-costas: loop de 30s com pgrep -f do autopilot; morto → ressuscita via daemonize.py; estados terminais DONE/FAILED-*/TIMEOUT-* encerram o supervisor junto. «supervisor-2014.txt:11-24»
ND-9220. Heartbeat do supervisor a cada 240 iterações (~2h) registra o estado corrente no supervisor.log. «supervisor-2014.txt:25-29»
ND-9221. Autopilot 2.0.14 é idempotente por fases (auth já instalada / push já feito → segue) e NUNCA derruba o poll-auth.sh — apenas observa .auth-status e .github-token. «autopilot-2014.txt:2-4,29-42»
ND-9222. Estados de máquina do autopilot escritos em .autopilot-state com log por transição: WAIT-AUTH (deadline 24h) → AUTH-INSTALL → PUSH → CASCADE (deadline 8h) → POST-GREEN → DONE; falhas reais → BLOCKED-NEEDS-FIX + logs em download/ci-failures/. «autopilot-2014.txt:2-6,22-24»
ND-9223. AUTH-INSTALL pulado se gh já tem escopo workflow; senão gh auth login --with-token, setup-git, verificação de scopes workflow e shred -u do token (não deixar token em disco depois de instalado). «autopilot-2014.txt:44-58»
ND-9224. Push com até 5 tentativas (timeout 300 cada, retry 30s): HEAD == origin/main → nada a fazer; falha total → FAILED-PUSH. «autopilot-2014.txt:62-79»
ND-9225. Push consolidado carimba PUSH_TS e libera a cascata 2.0.14 com deadline de 8h. «autopilot-2014.txt:77-79»
ND-9226. CASCADE monitora runs por head_sha do SHA corrente; mudança de SHA (novo push do agente) reseta rounds e segue o novo alvo sozinho. «autopilot-2014.txt:83-89»
ND-9227. Espelho para painel /ops: .autopilot-runs.json com sha, ts, total e {id,name,status,conclusion} de cada run. «autopilot-2014.txt:97-100»
ND-9228. Run "cancelled" = supersede de concurrency (padrão da casa no workflow_call) — não é falha, não consome rerun de 90min. «autopilot-2014.txt:115-123»
ND-9229. Verde exige 3 confirmações consecutivas (ok 3/3) antes de avançar de fase. «autopilot-2014.txt:129-133»
ND-9230. Falhas reais: logs de TODAS as runs falhas baixados (gh run view --log-failed) em download/ci-failures/run-<id>.log como matéria-prima do fix. «autopilot-2014.txt:141-145»
ND-9231. Flaky: até 3 rounds de gh run rerun --failed; esgotados → BLOCKED-NEEDS-FIX e espera da nova versão do agente (o loop segue o novo SHA sozinho). «autopilot-2014.txt:147-159»
ND-9232. Deadline da cascata atingido sem verde → TIMEOUT-CASCADE + exit 1. «autopilot-2014.txt:162»
ND-9233. POST-GREEN lista versões do pacote container GHCR tentando user → org → leitura pública; escolhe o primeiro endpoint que responder e guarda o admin path. «autopilot-2014.txt:168-184»
ND-9234. Relatório GHCR em TSV (id, created_at, tags) antes de deletar qualquer coisa. «autopilot-2014.txt:185-189»
ND-9235. Faxina GHCR deleta SOMENTE versões cuja ÚNICA tag é latest (stale inequívoco); versão que compartilha latest com outras tags exige decisão manual. «autopilot-2014.txt:190-207»
ND-9236. Sem endpoint admin ou sem listagem → faxina manual posterior — nunca DELETE às cegas. «autopilot-2014.txt:194-209»
ND-9237. trap EXIT registra término com exit code e linha do script. «autopilot-2014.txt:24»

### Bloco H — Signaling relay WebRTC (/api/rtc)

ND-9238. O relay é do app, não do kit: só tráfego de rendezvous (roster + SDP/ICE) passa por ele; dados do jogo fluem peer-to-peer. «signaling-relay.txt:3-5»
ND-9239. Schema cria as duas tabelas no primeiro uso com CREATE TABLE IF NOT EXISTS (webrtc_peers PK (room,peer_id); webrtc_signals BIGSERIAL + index inbox (room,to_peer,id)) — nada em migrations/, e migrations próprias coexistem. «signaling-relay.txt:9-35,81-87»
ND-9240. ensureSchema memoizado em globalThis (__rtcSchemaPromise__) para o HMR de dev nunca rodar dois ensures; falha limpa o slot para o próximo request retentar. «signaling-relay.txt:88-123»
ND-9241. O GET poll é todo o ciclo de vida do peer: o primeiro poll (since=0) É o join — registra o peer, devolve o roster e poda linhas stale. «signaling-relay.txt:50-54»
ND-9242. Peer ids random por mount: inbox nova nunca tem sinais antigos a pular — não existe handshake join/cursor. «signaling-relay.txt:53-54»
ND-9243. Validação zod: room/from/to/peer com regex ^[a-zA-Z0-9_-]{1,64}$; payload presente e JSON ≤ 32.768 chars (cap anti-abuso; SDP típico 3–10KB); kinds offer|answer|ice. «signaling-relay.txt:59-72»
ND-9244. POST é discriminatedUnion op=signal|leave; leave deleta o peer do room. «signaling-relay.txt:73-74,228-239»
ND-9245. TTLs: peer 30s, signal 60s. «signaling-relay.txt:77-78»
ND-9246. Roster com LIMIT 32 para conter o blast radius de room-stuffing (mesh satura ~8 peers). «signaling-relay.txt:125-131»
ND-9247. touchPeer é upsert: last_seen = now() e name do EXCLUDED on conflict (room, peer_id). «signaling-relay.txt:136-144»
ND-9248. GC anda junto dos polls em vez de cron: joins sempre podam e ~2% dos demais polls também — sala ocupada é varrida sem todo heartbeat pagar os dois DELETEs. «signaling-relay.txt:146-161»
ND-9249. Respostas JSON com cache-control no-store; inbox query `id > since ORDER BY id LIMIT 200`. «signaling-relay.txt:163-168,192-202»
ND-9250. Erros contratuais: 400 invalid query/request/JSON, 405 method not allowed, 500 genérico "signaling failed" sem stack leak. «signaling-relay.txt:185,214,222-223,247-253»
ND-9251. Rota montada em /api/rtc via createFileRoute com server.handlers GET/POST chamando handleSignaling. «signaling-relay.txt:259-269»
ND-9252. RtcPollResponse = { peers: [{id,name}], signals: [{id,from,kind,payload}] }. «signaling-relay.txt:203-212»

### Bloco I — Chip PCM virtual (pesquisa wss)

ND-9253. Missão de virtualização: virtualizar driver/hardware sem tocar no hardware físico (zero host touch), unindo e2ugh + saddle no Saddle infinite sandbox WASM. «wss.txt:6,13»
ND-9254. Caminho de memória infinita: Linux RISC-V real sobre V8 com lazy paging + HTTP Range + CDN. «wss.txt:14»
ND-9255. Chip alvo (Science 2026, memristor PCM NDS): 40nm CMOS LP 1T1R blade-shaped, GST Ge2Sb2Te5 mushroom, 0.28mm² matriz, 50 MHz com pipeline de 9 estágios por integração numérica. «wss.txt:24-27»
ND-9256. Latência alvo 2.12ms por iteração NDS e <10ms total com tolerância 1e-7; SET-RESET-DRIFT nativo elimina buffers e multiplicadores. «wss.txt:27-28»
ND-9257. Speedups de referência: 3.82–36.27× vs ASICs SOTA, 50.38–478.18× vs NVIDIA A100 em reconstrução cortical, até 5089× vs aceleradores digitais; energia 11.75–24.73× menor. «wss.txt:29-30»
ND-9258. Física chave: G(t) = G(t0)·(t/t0)^(−nu) — o drift de condutância (nu 0.03–0.1) deixa de ser defeito e vira computação; adaptive stepsize com redes dentro da memória quebra o Memory Wall. «wss.txt:31»
ND-9259. Modelos compactos de referência: Stanford RRAM (dg/dt Arrhenius·sinh), Biolek K3 M(x)=Ron·x+Roff·(1−x), IBM AIHWKIT PCM com ruído de programação/drift/read calibrado em 1M devices + ISPP program-and-verify. «wss.txt:37-46»
ND-9260. WebGPU: cada thread = 1 device PCM, 400k devices validados em emulador FPGA, drift como shader WGSL com pow(t/t0,−nu). «wss.txt:46»
ND-9261. Alternativas mapeadas com trade-offs: PCM 50-100ns/10pJ/1e7-1e9, ReRAM HfOx 1-10ns, STT-MRAM 1e12 sem drift, SOT-MRAM <1ns, FeFET HZO 10fJ/bit; neuromórficos Loihi2/SpiNNaker2/Akida; FPGA AWS F1/Alveo U250/U280. «wss.txt:48-124»
ND-9262. Arquitetura de integração em 5 camadas + L0: L5 bootloader JS e2ugh (pcm-core.wasm + SharedArrayBuffer 2GB), L4 HAL SaddleDevice (DeviceTree /dev/pcm0), L3 pcm-core.wasm Rust SIMD128, L2 device model Float32Array de condutância com meta driftCoeff/lastWrite, L1 modelo compacto JMA, L0 hardware real NÃO tocado. «wss.txt:128-134»
ND-9263. CDN content-addressed do peso PCM: condutância quantizada u12 0..4095 → 0.2µS..25µS, 512 células = página de 1KB, nome {sha256}.bin, Cache-Control public max-age=31536000 immutable, manifesto pcmv1 com merkle_root total_pages. «wss.txt:137»
ND-9264. Delta sync de páginas sujas: dirty pages ledger com Fletcher-32/MurmurHash — MB viram bytes. «wss.txt:138»
ND-9265. CoW block device 48 bits (262k TB virtual): block_id = lba/CHUNK_SIZE, nenhum bloco alocado até write, read de não-alocado = page fault zero sem fetch, IndexedDB 512MB LRU, miss = HTTP Range. «wss.txt:139»
ND-9266. Drift como versionamento: cada write cria versão (t0=now, G0=1.0, nu~N(0.06,0.01)); leitura escolhe no DAG a maior G(t) > threshold; active forgetting vira GC natural. «wss.txt:139»
ND-9267. Security multi-tenant: sem KVM/EPT/VT-x — tudo WASM+WASI userspace, WebAssembly.Memory isolado com Cross-Origin-Isolated, WASI capability-based com denylist fork/exec/socket_raw, fuel metering 50M/quantum, timeout 5s, mem cap 256MB, catálogo global readonly via jsDelivr validado por PR+CI+schema. «wss.txt:140»
ND-9268. Artefatos da duplicação: datasheet PCM-NDS-VIRT-SADDLE-40NM v1.4.0 (chip VIRTUALIZADO, interfaces mapeadas para /dev/pcm0), benchmark matrix, guia de duplicação com 20 alternativas e roadmap de 12 semanas (wasm 50KB → driver HAL → CAS CDN → CoW boot 2s/kernel 4MB → frontend devthink.pro VMs → benchmarks → release @wenathlan/saddle@0.8.0). «wss.txt:144-157»
ND-9269. Esqueletos canônicos: PCMTile Rust {rows, cols, g: Vec<f32>, nu: Vec<f32>, t0: Vec<f64>} com read drift-composto no tempo; PCMDriver TS implements SaddleDevice com init 1024×1024 fetch do wasm, registro SaddleHAL.register('/dev/pcm0') e leitura por performance.now(). «wss.txt:147-154»
ND-9270. Benchmark do virtualizado: 0.88× do físico em WASM+WebGPU e 0.98× em FPGA U280 — degradação de ~1 aceita como custo da virtualização. «wss.txt:155»
ND-9271. Método de pesquisa: até 20 subagentes em 5 ondas de ≤16, multilíngue 12+ línguas/variações (EN-US/UK, ZH, JP/KR, DE/FR, RU/AR/HI, PT-BR/PT-PT/ES) — especificações multilíngue viram especificação única consolidada. «wss.txt:6,17,259-275»

### Bloco J — HTTPS localhost (backloop.dev llms)

ND-9272. `*.backloop.dev` resolve 127.0.0.1 e ::1 — https://anything.backloop.dev/ chega na própria máquina sem editar /etc/hosts. «llms.txt:3;llms-full (3).txt:3»
ND-9273. Distinção única que importa: o certificado publicado HOJE é self-signed, NÃO publicamente confiável — não é revival do serviço antigo e nada torna possível um certificado compartilhado público-trusted. «llms.txt:5;llms-full (3).txt:13»
ND-9274. Três certificados distintos e só um recomendável: /public/pack.json (self-signed, válido até 2036, requer install one-time — SIM), /pack.json raiz (último público-trusted, revogado 2026-07-31, expira 2026-10-29 — NUNCA), path com segredo do autor (n/a). «llms.txt:11-15;llms-full (3).txt:7-11»
ND-9275. Nunca recomendar /pack.json raiz mesmo respondendo 200: revogado por keyCompromise, falha em clients que checam revogação; os arquivos individuais ao lado dele retornam 404. «llms.txt:17;llms-full (3).txt:10»
ND-9276. Por que acabou: publicar certificado = publicar a chave privada; CA/Browser Forum Baseline Requirements §4.9.1.1 obriga revogação em 24h após evidência de compromise — chave pública numa página É essa evidência, e scanners vasculham CT logs. «llms.txt:19;llms-full (3).txt:28-30»
ND-9277. Cronologia probatória: free CA emitiu 2026-07-31 10:20 UTC e revogou 19:01 (~9h), bloqueou o domínio em 2026-08-01; wildcard comercial revogado em ~2 dias (2026-08-08); serviço descontinuado 2026-09-04; ~350 certificados emitidos/revogados no projeto. «llms-full (3).txt:34-41;llms.txt:20»
ND-9278. O que NÃO contorna: dividir a chave em dois arquivos (só atrasa scanners), trocar de autoridade (Baseline Requirements são a constraint de todas) e pagar (comprador durou 2 dias vs 9 horas — dinheiro compra suporte, não isenção). «llms-full (3).txt:45-47»
ND-9279. Forma geral: certificado compartilhado público-trusted para localhost não pode ser construído e mantido — não é gap de tooling, é a regra de revogação funcionando como desenhada. «llms-full (3).txt:51»
ND-9280. Recomendação 1 — local certificate authority (quando a pessoa pode rodar uma): mkcert, Caddy internal CA ou vite-plugin-mkcert; ninguém mais tem a chave e Firefox funciona; declarar o trade-off de instalar uma root que assina qualquer hostname e que cada máquina (teammates, CI, phones) precisa setup próprio. «llms.txt:27-33;llms-full (3).txt:55-61»
ND-9281. Recomendação 2 — certificado self-signed /public (quando não pode): npm install backloop.dev baixa sem config; SEMPRE declarar o passo de install e que Firefox não o aceita (usa trust store próprio e rejeita não-CA). «llms.txt:31,76;llms-full (3).txt:69,76»
ND-9282. O certificado self-signed é leaf CA:FALSE serverAuth-only — nunca assina outro hostname; essa distinção é o argumento inteiro de segurança vs instalar uma root pública. «llms-full (3).txt:75»
ND-9283. Remoção no macOS exige `security remove-trusted-cert` (NÃO delete-certificate, que deixa a confiança ativa com dump-trust-settings vazio). «llms-full (3).txt:77»
ND-9284. npm packages voltaram: backloop.dev ≥5.1.0 e vite-plugin-backloop.dev aceitam certificado do usuário (BACKLOOP_DEV_CERT/KEY, backloop.dev.json, certs dir) e caem para o self-signed; releases <4.0.0 deprecated. «llms.txt:22;llms-full (3).txt:87-94»
ND-9285. pack.json = JSON com cert, ca, chave dividida key1+key2 (concatenar nessa ordem) e info.notAfter ISO. «llms-full (3).txt:106;llms.txt:17»
ND-9286. Tooling do pacote: httpsOptionsPromise/Async/sync com tipos, static server, reverse proxy com x-forwarded-proto: https e multi-host gateway SNI (um processo/porta para muitos *.backloop.dev). «llms-full (3).txt:100-104»
ND-9287. Config segredo que falha é ERRO e nunca faz fallback silencioso para outro certificado. «llms-full (3).txt:96»
ND-9288. O DNS de loopback não é security boundary: se os records mudarem, requests saem da máquina — quem depende do comportamento pina em /etc/hosts. «llms-full (3).txt:112-117»
ND-9289. Problema original que o domínio resolvia: mixed content e CORS de localhost vs APIs HTTPS, sem desligar segurança do browser nem instalar CA por browser + /etc/hosts. «llms-full (3).txt:15-17»
ND-9290. Combinação recomendada moderna: mkcert '*.backloop.dev' backloop.dev sobre o DNS que já aponta para loopback — muitos hostnames HTTPS limpos, sem /etc/hosts e sem certificado público envolvido. «llms.txt:39-48;llms-full (3).txt:81-83»

### Bloco K — Three.js vendored (llms-full (2))

ND-9291. O doc Three.js é vendored de threejs.org/docs/llms-full.txt, pinned 2026-07-08 para uso offline da sandbox app-builder. «llms-full (2).txt:1-3»
ND-9292. Neste stack, preferir npm 'three' sobre importmaps de CDN. «llms-full (2).txt:2»
ND-9293. Padrão moderno de import: `<script type="importmap">` com three e three/addons/ apontando para jsdelivr three@0.185.0 — script tag de cdnjs r128/three.min.js está errado. «llms-full (2).txt:13-33»
ND-9294. WebGLRenderer é default maduro (compatibilidade máxima); WebGPURenderer para shaders TSL, compute e node materials, com await renderer.init(). «llms-full (2).txt:36-59»
ND-9295. Com WebGPU usar TSL em vez de GLSL cru: nós texture/uv/color com .mul() etc. — sem manipulação de string nem hacks de onBeforeCompile, type-safe e com otimização automática. «llms-full (2).txt:61-76»
ND-9296. Classes NodeMaterial: MeshBasic/Standard/Physical/LineBasic/SpriteNodeMaterial. «llms-full (2).txt:78-86»
ND-9297. Cena base canônica: Scene + PerspectiveCamera 75° + renderer antialias com setPixelRatio + OrbitControls + Ambient/DirectionalLight + loop via renderer.setAnimationLoop com resize handler que atualiza aspect e updateProjectionMatrix. «llms-full (2).txt:91-163»
ND-9298. TSL núcleo: uniform (com on*Update), swizzle, operadores encadeados, Fn com layout, variables, Array uniform/storage, varying, condicionais if-else/switch-case/ternary, loop, math e method chaining. «llms-full (2).txt:634-1213»
ND-9299. Contextos TSL: texture, attributes, position, normal, tangent/bitangent, camera, model, screen, viewport, blend modes, reflect, UV utils, interpolação, remap/remapClamp. «llms-full (2).txt:1214-1379»
ND-9300. Utilitários TSL: hash/range (random), rotate, oscSine/oscSquare/oscTriangle/oscSawtooth, time/deltaTime, packing packNormalToRGB/unpackRGBToNormal. «llms-full (2).txt:1381-1416»
ND-9301. RenderPipeline dá controle total multi-pass em JavaScript: scene render + post-processing + compute num workflow único e compositável. «llms-full (2).txt:1417-1420»
ND-9302. Primitivos avançados TSL: storage, struct, flow control, override node, fog, color adjustments e utilities. «llms-full (2).txt:1633-1798»
ND-9303. Migração GLSL→TSL mapeia props comuns (ex.: uniforms, varying, samplers) para nós — documento de transição faz parte da referência. «llms-full (2).txt:1907-1928»
ND-9304. Catálogo de shader modules embutido na referência: ACESFilmic, Afterimage, Basic, Bayer, BleachBypass, Blend, Bokeh/Bokeh2, BrightnessContrast, BufferGeometryUtils, CSM, CameraUtils, ColorCorrection/ColorSpaces/Colorify, Convolution, Copy, DOFMipMap, DigitalGlitch, DotScreen, Exposure, FXAA, Film, Focus, FreiChen, GTAO, GammaCorrection, GeometryCompression/GeometryUtils, GroundedSkybox, Halftone, Blur/tilt-shift horizontal e vertical, HueSaturation, Interpolations, Kaleido, Luminosity(+HighPass), Mirror, NURBS, NormalMap, Output, Parametric, PoissonDenoise, RGBShift, Raymarching, SAO, SMAA, SSAO, SSR, SceneUtils, Sepia, SkeletonUtils, SobelOperator, Sort, SubsurfaceScattering, Text2D, TriangleBlur, UVsDebug, UniformsUtils, UnpackDepthRGBA, Velocity, Vignette, Volume, WaterRefraction, WebGL/WebGPUTextureUtils, XR (controllers/hands/planes). «llms-full (2).txt:2660-2781»

### Bloco L — Catálogos de configuração (constants/variables/vc-config/mime.types)

ND-9305. Catálogo de formatos com 15 categorias fixas: image, video, audio, archive, binary, data, document, code, font, model3d, config, stylesheet, markup, script, text — 80+ extensões no total. «constants (1).txt:3-65»
ND-9306. Extensões de imagem modernas obrigatórias no catálogo: webp, avif, heic/heif, jxl, webp2, qoi além de png/jpg/gif/svg/bmp/tiff. «constants (1).txt:8-11»
ND-9307. Todo formato definido carrega { extension, name, category, icon, color, previewable, editable } e opcionalmente requiresLibrary (ex.: svg→svg, zip→jszip, pdf→pdfjs, md→marked+highlight.js). «constants (1).txt:71-121»
ND-9308. CDN_LIBRARIES fixa ~90 bibliotecas com { name, cdn, type, category, formats? } e versões pinadas por URL (lodash 4.17.21, katex 0.16.9, monaco 0.45.0, three/fabric/pixi/konva, phaser 3.70, xlsx 0.20.1 sheetjs, ag-grid, handsontable, leaflet/mapbox, vue/angular/svelte/alpine/htmx, zod/yup/joi, redux/zustand/jotai/recoil, quill/tinymce/ckeditor, xterm, jspdf/html2canvas, qrcode/jsbarcode, notiflix/toastr, fontawesome/heroicons, gsap/animejs, howler/tone/wavesurfer, video.js, cropperjs, sortable/dragula, chai/sinon/expect, crypto-js/sjcl, lit/stencil, graphql/apollo, navigo/page, mathjs/mathjax). «constants (1).txt:242-385»
ND-9309. GOOGLE_FONTS catalogado por categoria (sans-serif, serif, monospace, display, handwriting) com weights explícitos por família (Inter/Roboto/Poppins 100-900; Bebas Neue/Anton só 400). «constants (1).txt:391-435»
ND-9310. Registry MIME canônico (Debian media-types): media type à esquerda, zero ou mais extensões à direita; tipos são geridos centralmente para que servidores os referenciem mesmo sem o pacote do tipo instalado. «mime.types (2).txt:1-23»
ND-9311. Usuário pode adicionar tipos próprios em ~/.mime.types com PRECEDÊNCIA sobre o registry global. «mime.types (2).txt:19-21»
ND-9312. Tema void-black/nbarchitekt: tokens --color-void-black #000000, ghost-white #ffffff, ash-border #4d4d4d, smoke #808080, fog #999999, pale-mist #c6c6c6, dusk-violet #343755; superfícies void-canvas, translucent-overlay #00000080 e frosted-glass #ffffff1a; 3 famílias (nbarchitekt/times/arial) com fallback ui-sans-serif. «variables.txt:1-59»
ND-9313. Escala tipográfica compacta do tema void: caption 10px, body-sm 12px, body 14px, leading 1.5, pesos só 400/700; spacing 4–28px; radius 5/12/500px com aliases tags/cards/inputs/buttons-pill/buttons-ghost. «variables.txt:15-52»
ND-9314. Tema Electric Iris: --color-electric-iris #0036ff + signal-cyan #0093ff sobre deep-void #05061b e cosmic-canvas #0f071d; famílias Aeonik Pro/Inter/Geist Mono. «variables (1).txt:3-17»
ND-9315. Escala tipográfica do Electric Iris: 10→74px (micro→display) com tracking negativo proporcional (−0.07 a −1.11px) e leading 1.08–1.78. «variables (1).txt:23-44»
ND-9316. O tema Electric Iris define 20+ sombras multilayer (subtle 1-7, md 1-3, sm 1-3, lg, xl) combinando inset highlights brancos, difusão preta e tint roxo rgba(8|9,1,20,0.03-0.06) — sombra como assinatura do tema. «variables (1).txt:99-114»
ND-9317. Radii nomeados do Electric Iris: inputs 6, cards 14, largecards 20, herocards 24, featureblocks 32, buttons/tags/full 999px. «variables (1).txt:84-97»
ND-9318. Config de lambda (.vc-config): handler index.mjs, launcherType Nodejs, shouldAddHelpers false, supportsResponseStreaming true, runtime nodejs22.x. «vc-config (1).txt:1-6»
ND-9319. vc-config (3) é idêntico byte a byte ao (1) — runtime de lambda é singular, não versionado por cópia. «vc-config (3).txt:1-6»

### Bloco M — CDN module loader (cdn.ts)

ND-9320. src/lib/cdn.ts é server-side compatible: dependências pesadas carregam de CDN em vez de viver no node_modules. «cdn.txt:1-2»
ND-9321. Pattern de carga: fetch() do módulo ESM (esm.sh) e execução inline via new Function(); require() local tentado primeiro como fallback para módulos CommonJS. «cdn.txt:3-5»
ND-9322. Objetivo declarado: manter TODO tooling pesado de browser-automation/IP/DNS FORA do node_modules, carregando on demand. «cdn.txt:5»
ND-9323. Registro tipado CDNModule { id, name, category, cdnUrl } — categoria como faceta de busca. «cdn.txt:6-7»
ND-9324. Categoria browser-automation ~45 entradas com versões pinadas por URL: agent-browser 0.31.1, playwright/playwright-core/@playwright/test 1.61.1, @playwright/cli 0.1.17, puppeteer/puppeteer-core 25.3.0, chrome-launcher 1.2.1, chrome-remote-interface 0.34.0, jsdom 29.1.1, cheerio 1.2.0. «cdn.txt:8-16»
ND-9325. cdn (2).txt é duplicata whitespace do cdn.txt (md5 normalizado 1dcc4564) — loader é singular. «cdn.txt vs cdn (2).txt (diff normalizado)»

### Bloco N — Inventários de acervo e auditoria

ND-9326. Manifest do acervo de repositórios (lista_arquivos): 804 entradas CRLF = 743 .zip + 31 .rar + 3 .tar.gz + 2 .tgz; 627 nomes únicos após dedup de cópias "(N)". «lista_arquivos.txt (804L; contagem awk)»
ND-9327. O acervo contém fornecedores de referência nomeados (llamacoder ×18, agent-*/agent-orchestrator/agent-os/agentmemory, awesome-mcp-servers, awesome-cloudflare, backloop.dev-main, aetherforge-v5, 9router, ASCII-Art, blender…) — inventário é index de duplicação de capacidades. «lista_arquivos.txt:1-100»
ND-9328. Fragmentos de lista (lista_arquivos (2).txt = 1 linha ".package-lock.json") não são catálogo — descartados como lixo. «lista_arquivos (2).txt:1»
ND-9329. Índice de node_modules vendido (deps.txt): 4.625 linhas = 2.439 entradas `.pkg-hashslug` (diretório por pacote com hash de conteúdo de 8 chars) + ~2.186 nomes de pacotes (yuka, zod, zod-validation-error, zustand, zwitch, zx…). «deps.txt:1-60,2300-2310,4620-4625»
ND-9330. Hash de conteúdo no nome do diretório de pacote (ex.: .zod-<slug>) é o mecanismo de cache-imutável do vendor — mesmo pacote, hash diferente = versão diferente. «deps.txt:1-60»
ND-9331. Catálogo de serviços Google (services.txt): 452 nomes de produtos/serviços (A11y, Agent Registry, AI Hypercomputer, AlloyDB, Android FHIR, Angular, Antigravity, Apigee, Vertex AI Workbench/Feature Store/Vizier, Video Stitcher, Waze…) — base de mapeamento de concorrentes/parceiros. «services.txt:1-120,880-904»
ND-9332. dependabot.yml com package-ecosystem "" é PLACEHOLDER que não funciona: severidade ALTA — configurar ecossistema (npm, pip…) ou remover o arquivo. «dependabot.txt:8;AUDITORIA-DADOS.txt:19-31»
ND-9333. Auditoria de dados hardcoded na pasta .github (2026-06-08): 1 crítico + 1 placeholder + 0 falsos; workflows/ VAZIO — a ação é configurar ou deletar. «AUDITORIA-DADOS.txt:8-15,34-43»
ND-9334. Índice dev-to-dev de monetização: 10 docs (SDK abelha = veredito "não existe BizKD/BSKD/Bimonem"; 40 formas de monetizar; keywords 22 locales; tendências PH/GitHub/npm; 10 apps novos; 10 clones com twist; playbook 90 dias; pacotes npm; comunidades) com regra 100% free/open-source e zero escada freemium. «00-INDICE.txt:1-21»
ND-9335. Trilhas de leitura do índice: site atual → 01→02→07→08; app novo → 04→05/06→02→07→08; SEO multilíngue → 03→09→02 (formas 25-27,38). «00-INDICE.txt:18-21»
ND-9336. Premissas honestas documentadas: payouts são faixas por GEO a validar; keywords revalidar com GKP/Semrush; Product Hunt 403 → proxy hunted.space + TechCrunch. «00-INDICE.txt:23-28»
ND-9337. INVENTARIO.txt tem 0 bytes — inventário real mora no lista_arquivos.txt e deps.txt. «INVENTARIO.txt (0L)»
ND-9338. Reset de rede Windows de fábrica (referência de operação): 16 passos encadeados — matar processos/VPN, restaurar CMD e limpar AutoRun, limpar perfis PS, netcfg -d, GPO/firewall nativo, serviços de rede/cripto, Winsock/IP/rotas, Schannel, PSGallery/NuGet, RemoteSigned, expurgar cache de módulos e histórico PSReadLine, reinstalar adaptadores PnP, limpar Event Log, atualizar PowerShell — com reinício agendado de 60s e log físico em Downloads. «Relatorio_Reset_Rede.txt:20-56»
ND-9339. Limitações observadas no reset: Install-PackageProvider -SkipPublisherCheck inexistente no pwsh 7.6.3 (falha de repositório), Event Log LiveId sem acesso, msstore/winget falham com DNS 12007/0x80072ee7 e 0x8a15000f — diagnóstico de rede morta antes do reset concluir. «Relatorio_Reset_Rede.txt:39-40,66-76»

### Bloco O — Catálogo IMG neoimg (inventário como regra)

ND-9340. O acervo IMG neoimg contém 423 arquivos, 100% imagens binárias e ZERO arquivos de texto (.txt/.md/.json) — catálogo de efeitos/texturas é registrado por inventário, não por leitura. «/home/z/neo/neoimg/ (ls por extensão)»
ND-9341. Distribuição canônica por extensão: jpg 256 (22.307.258 B), png 102 (132.817.854 B), webp 64 (7.426.918 B), avif 1 (54.959 B) — total 162.606.989 B ≈ 162,6 MB. «/home/z/neo/neoimg/ (find -printf)»
ND-9342. Esquema de nomes é flat "a (N).{ext}" com N até 256 (jpg) — nenhum subdiretório, nenhum nome semântico: endereçamento do catálogo é por número + extensão. «/home/z/neo/neoimg/ (find)»
ND-9343. Pesos indicam funções: pngs grandes (a (19).png 9,2 MB, a (4).png 9,0 MB, a (1).png 6,9 MB) = texturas/master renders; jpgs ~1-2 MB = samples fotográficos; webp ≤1,2 MB = variantes leves; avif único 55 KB = reference de compressão de próxima geração. «/home/z/neo/neoimg/ (top por tamanho)»
ND-9344. Dedup do catálogo: exatamente 1 par idêntico md5 (e02de3e2ad9cf83542c33655fde02107) entre a (95).png e a (96).png — desduplicar antes de publicar qualquer pipeline. «md5sum do neoimg»
ND-9345. Política de consumo IMG: nunca ler/emitir imagens binárias em contexto de leitura de regras — registrar só inventário (contagem, bytes, nomes, hashes); conteúdo visual entra por design skill na fase final. «regras.md OPR-0058 + inventário neoimg»
ND-9346. Tipos aceitos pelo acervo de imagem mapeiam o catálogo de formatos (png/jpg/webp/avif presentes; heic/jxl/qoi ausentes) — pipeline IMG deve priorizar webp/avif como variantes derivadas dos masters png/jpg. «constants (1).txt:8-11 + inventário neoimg»
ND-9347. neodocs-captures/ existe como diretório-âncora do pipeline de captures e está VAZIO (0 arquivos) — captures reais moram em capture.txt/05.capture.platform/render_capture até o pipeline popular o diretório. «find/ls em neodocs-captures»
ND-9348. Toda adição futura ao neoimg segue o esquema a (N).ext e recebe md5 no catálogo — nomes semânticos só com índice cruzado. «inventário neoimg (convenção observada)»
ND-9349. Teto de crescimento da faixa IMG: 423 assets atuais (162,6 MB) — quotas de storage do ambiente (10 GB disco) exigem variantes comprimidas (webp/avif) em vez de novos masters png 9 MB. «inventário neoimg + regras OPR-0014»
ND-9350. O catálogo IMG é a fonte de texturas/efeitos para os temas (void-black, Electric Iris, liquid-glass) — consumo sempre por referência numerada, nunca embutindo binário em repo. «inventário neoimg + variables/variables (1)»

---


## FASE 9 — contexto-v9 re-baixado (fonte: wormhole 70loEk contexto.rar — 928 arquivos, 347 md5 únicos, 295 novos vs corpus antigo)


### Júri local e calibração (JURY.md, CALIBRATION.md, ARCHITECTURE.md)

- ND-9351. Júri local do gateway = alternativa #1 ao JEV: fan-out paralelo de K=3 providers distintos (pickDiverse shuffle+slice) com timeout individual 8s; se 1 de K expira, prossegue com K-1. «JURY.md:5-9»
- ND-9352. Pipeline do júri em 9 etapas fixas: seleção → fan-out → adapter por provider → normalização (sigmoid|minmax|zscore) → outlier removal (z-score > 2) → média ponderada → confidence aggregation (binomial simplificado) → divergência (desvio-padrão; > 0.30 marca needsCascade) → auditoria WORM com votos individuais persistidos. «JURY.md:10-18»
- ND-9353. Peso do voto do júri = 1/ECE histórico do provider/model (getCalibrationWeight), clampado em [0.1, 10]; menor ECE = maior peso. «JURY.md:44-45»
- ND-9354. Guard do gateway: 4 nouls de entrada (PII, injection, encoding, quota) + 1 score de severidade de saída. «ARCHITECTURE.md:diagrama guard.ts»
- ND-9355. Cache do gateway é chaveado por sha256(state+questions) com 2 níveis: LRU in-memory (hot) + SQLite (cold path); tabela `memory` guarda memória N1/N2/N3 por pessoa (memória infinita). «ARCHITECTURE.md:cache.ts + tabelas»
- ND-9356. ECE (Expected Calibration Error) = Σ (n_b/N) × |acc_b − conf_b| com 10 bins default [0.0-0.1]..[0.9-1.0]; menor ECE = melhor calibrado; ECE 0 = calibração perfeita. «CALIBRATION.md:ECE»
- ND-9357. Temperature scaling (Platt): p_i' = softmax(logit_i / T), T otimizada por busca em grade logT ∈ [-3, 3] step 0.05 minimizando cross-entropy. «CALIBRATION.md:Temperature Scaling»
- ND-9358. Snapshots de calibração persistem na tabela Drizzle `calibration` por (providerId, modelName): binEdges, binCounts, binAccuracies, ece, temperature, sampleCount; recalibração por backtest recalibrate(). «CALIBRATION.md:Persistência/Backtest»
- ND-9359. Recalibração ECE roda como job noturno `gateway-calibration-nightly.yml` todo dia 02:00 UTC; catálogo de modelos free sincronizado a cada 6h por `gateway-sync-models.yml`. «DEPLOY.md:CI/CD»

### API e arquitetura do gateway (API.md, ARCHITECTURE.md, DEPLOY.md)

- ND-9360. Auth de todo endpoint (exceto /health): header `Authorization: HMAC <tenant_id>.<base64(hmac-sha256(body, secret))>` + headers X-Tenant-Id e X-User-Id. «API.md:Autenticação»
- ND-9361. Contrato /v1/chat: headers de controle X-Gateway-Version (V1|V2|V3|V4|V5 override), X-Cache-Bust (força miss), X-Bypass-Adapter (V1 raw), Idempotency-Key (uuid); resposta 200 padroniza model/content/finishReason/usage/verdictId/version/confidence/guardScore/cacheHit/juryVotes/_meta{cacheStats,health}. «API.md:Endpoints»
- ND-9362. Router resolve a versão do gateway na ordem: header > query > config (X-Gateway-Version → ?gateway_version → GATEWAY_DEFAULT_VERSION=V4). «ARCHITECTURE.md:fluxo 4»
- ND-9363. Porteiro (porter.ts) tenta resolver com "réguas" antes de chamar providers — alvo 80-90% das requisições com custo 0. «ARCHITECTURE.md:porter.ts»
- ND-9364. Decisões técnicas do gateway: Hono (não Express), Bun (não Node), Drizzle + better-sqlite3 (sem migrations SQL no repo), cascade mini→verificador→médio/grande no resíduo, V5 = verdict model destilado. «ARCHITECTURE.md:Decisões técnicas»
- ND-9365. Gates do gateway: semáforo verde > 0.70 / amarelo 0.30-0.70 (banda cinza) / vermelho < 0.30; porta max 0.85 = bloqueio incondicional acima deste risco. «ARCHITECTURE.md:gates.ts»
- ND-9366. Banco do gateway: 7 tabelas (verdicts, calibration, labels, providers, models, audit WORM, ratelimit) + 2 aux (cache, memory); ratelimit por provider/tenant/user em token bucket; providers só com modelos free (NVIDIA/Babel/OpenCode/Kilo/Mock). «ARCHITECTURE.md:Tabelas»

### Deploy multi-host, subdomínios e DNS (README-DEPLOY.md, DEPLOY.md, detalhes do domínio, sec_c §61)

- ND-9367. Playground do gateway é estático em `gateway.devthink.pro`; a API (Hono+Bun) roda separada em `gateway-fns.devthink.pro` (Vercel Functions em gateway/api/*, Docker, ou Bun bare-metal; porta 8787). «DEPLOY.md:API Functions/Subdomínio»
- ND-9368. Env críticos do gateway: GATEWAY_PORT=8787, GATEWAY_DEFAULT_VERSION=V4, GATEWAY_JURY_K=3, GATEWAY_CACHE_TTL_SECONDS=3600, GATEWAY_BAND_GRAY_MIN=0.30, GATEWAY_BAND_GRAY_MAX=0.70, GATEWAY_PORTA_MAX_RISK=0.85, GATEWAY_DB_PATH; chaves NVIDIA/BABEL/OPENCODE/KILO como env, nunca hardcoded. «DEPLOY.md:Variáveis de ambiente»
- ND-9369. Deploy dos apps: mesma árvore em todo alvo (Vercel, Netlify, GitHub Pages, Capacitor mobile, ISO/Tauri desktop); vercel.json e netlify.toml vivem DENTRO de `<app>/<Tema>/` (dono é o deploy); builds só nos runners do GitHub; static-only — proibido Functions; rewrites SPA + 404 fallback. «README-DEPLOY.md + sec_c R61.1-R61.4»
- ND-9370. Subdomínios por app no wildcard do devthink.pro: devthink.pro (site principal do OS), saddle./debonair./cadria./stealhead. (diretos), argan.devthink.pro (dns-argan), ansiart.devthink.pro (ansi-art, sem hífen), getry.devthink.pro (via ponte MimeType compartilhando a transmissão da sandbox); gateway via Caddy proxy `gw.` + `app.` (Hono 3001, Next 3000). «sec_c R61.7-R61.15 + README-DEPLOY.md §5»
- ND-9371. Servidor próprio: Caddy em 66.223.49.89 com caddyfile.devthink.pro, builds publicados em /srv/devthink/<app>/dist (release zip ou rsync), systemctl reload caddy, TLS automático por subdomínio; sites replicáveis como backup com quorum N/2+1 (any-of-N) e reconciliação diária. «README-DEPLOY.md §4 + sec_c R61.40»
- ND-9372. DNS real do devthink.pro (registrar Epik, NS NS1/NS2.HOSTING.BUSINESSIDENTITY.LLC): A @, *, app, dev, mail, projects, www → 66.223.49.89 (TTL 1 min); wildcard cobre todos os apps. «detalhes da configuração do domio (2).txt»
- ND-9373. E-mail/segurança DNS do devthink.pro: SPF v=spf1 a mx include:spf.postal.businessidentity.llc; DKIM postal-umopgu._domainkey (sha256); DMARC p=quarantine com rua/ruf bounce@dmarc.businessidentity.llc; MX mailserver.businessidentity.llc prio 10; CNAME psrp→rp.postal.businessidentity.llc; 2× TXT _acme-challenge para TLS; DS/KSK 2371 (algo 13). «detalhes do domio»
- ND-9374. Órbita de domínios documentada: ~50 domínios (dominios.txt 14recon: repogrep.com, digger.tools, imdb.su/is, vidapi.ru…), TLDs catalogados (com, tools, su, is, domains, ru, lol, bid, site, lat, net, cloud, app, sh, ai, org, io, xyz, bg, name, ooo, plus, tg, uk, app); domain_drop_finder.csv com ~1.000 domínios em drop como oportunidade de registro. «sec_c R61.33-R61.35»
- ND-9375. Deploy idempotente: existence-check antes de publicar; rollback documentado por app (canary + rollback); migrations rodam em CI, nunca no deploy; preview deploys por PR com gates. «sec_c R61.18-R61.20, R61.43»
- ND-9376. Publicação multiplataforma: container GHCR multi-arch com tags de perfil; binários como assets de release (source.zip + SHA256SUMS + APK/IPA); wrappers Capacitor gerados (nunca editados à mão); tauri.conf.json na raiz do app; build env Node 26 + Bun para CLI. «sec_c R61.22-R61.26»

### Operação sandbox/autenticação (gateway-deploy.md, 024-ssss, definição dos aplicativos)

- ND-9377. Extração dos neozips exige binário UNRAR 7.x estático da rarlab — unrar-free 0.3.1 NÃO abre RAR5. «gateway-deploy.md §6.1»
- ND-9378. Processos background em sandbox Z.ai morrem entre tool calls — usar double-fork `( setsid nohup CMD & )` para PPID 1. «gateway-deploy.md §6.2»
- ND-9379. Wormhole expira em 24h/100 downloads — preferir Fonte A (repo git privado wenathlan/gateway) sobre Fonte B (arquivo compactado). «gateway-deploy.md §6.3»
- ND-9380. Prisma: PIN em 7.10.0 (tag prev) — `latest` resolve 8.0.0-rc e quebra driver adapters. «gateway-deploy.md §6.4»
- ND-9381. Modelos NVIDIA têm EOL (410 Gone): listar com GET /v1/models e usar sempre o nome completo (ex.: deepseek-ai/deepseek-v4.1-flash). «gateway-deploy.md §6.5»
- ND-9382. Réplica V1 do gateway dentro da sandbox Z.ai exige headers X-Token + userId (bypass do SDK compartilhado); V2-V5 funcionam fora; cada sandbox vira cópia independente com DB próprio em `https://<sandbox-id>.space-z.ai/`. «gateway-deploy.md §3»
- ND-9383. Relay OpenCode/Hermes Agent v0.20.5+ exige header X-Session-ID (UUID4 gerado por carga do plugin) em requisições anônimas — fix injeta o header em 6 arquivos do plugin. «024-ssss (3).txt.json»
- ND-9384. Nomenclatura canônica do roster: OS = "DevThink OS" (alternativas os/dothios); IA virtual do sistema = "doo" (abreviação de doothink/doot); apps de branding isolado (debonair=áudio, cadria=vídeo) são clones do devthink com outra interface; stealhead usa engine Versawase embutida. «definição dos aplicativos.txt»
- ND-9385. Segredos do corpus (nvidia-keys.json com 22 chaves nvapi-…, github-recovery-codes.txt) ficam FORA de qualquer processo de leitura/mescla/rewrita — inventário apenas, nunca emitir conteúdo. «fase-b-worklist.json:segredosForaDoProcesso»
- ND-9386. Validação de gateway é tudo-verde-ou-nada: bun run keys:register → 22 chaves ativas; /v3/keys lista 22 mascaradas; dev server 3000 com GET / 200, /v1/models e POST /v1/chat/completions com resposta REAL antes de declarar pronto. «gateway-deploy.md §5 + checklist.md»

### Design (all-recipes.txt, vlm-classifications.txt)

- ND-9387. Catálogo de 14 receitas de design recipe-NNN.json (extraídas por deep-dive VLM do neoimg) cobre estilos glassmorphism, cyber-glitch, iridescência, aurora, skeuomorfismo e retro-futurismo — cada receita traz efeitos com parâmetros prontos (fonte de texturas dos temas); 17 SHEETs de vlm-classifications (24 imgs cada) são a classificação bruta das 423 imagens. «all-recipes.txt + vlm-classifications.txt»
- ND-9388. Receitas de efeitos são dados normativos de tema (não decorativos): mesma árvore de temas consome recipe-NNN por nome; nova imagem do neoimg entra como (N).ext com md5 no catálogo (prolonga ND-9348). «all-recipes.txt cabeço + onda8d ND-9346..9350»
- ND-9389. Design-premium: ban lists e as 13 Leis já consolidadas (onda5) valem para os catálogos FEATURES-*; componentes Ω + receitas CSS + motion catalog (sec_b §54/§59) são a fonte canônica de animação. «sec_b.md §52-54,59»
- ND-9390. Skills .mjs/.cjs do pipeline (mesclar/montar/reescrita/dedup-cross/genfeatures) são infra de auditoria — nunca entram no repo de produto; scripts de produto ficam soltos na raiz flat do app (regra flat-root). «REGISTRO-MESCLAGEM.md + scaffold-*.sh»


## Log de ondas

| Onda | Fontes lidas | Regras novas | Features novas | Status |
|------|--------------|--------------|----------------|--------|
| 0–3 | contexto.rar + 6 conversas + captures + gateway/DNS/workflows | ~1.460 | — | ✅ Partes 1–4 |
| 4a | neodocs outros.devthink | 214 | 99 | ✅ |
| 4b | neodocs outros.saddle | 404 | 125 | ✅ |
| 4c | neodocs outros.debonair | 335 | 99 | ✅ |
| 4d | neodocs outros.stealthhead + raiz | 292 | 86 | ✅ |
| 5 | neoskills design/design-premium/web-design-guidelines/frontend-design/visual-design-foundations | 267 | 55 (+30 specs CSS) | ✅ |
| 6a | neodocs outros.anotepad + Note_*.txt + todos.txt + aiactions | 331 | 114 | ✅ |
| 6b | neodocs outros.dns/iukka/create/owni/cli/video | 291 | 94 | ✅ |
| 7a | CHANGELOG (8).txt superset 101 versões extensão devthink + 12 atlases md neodevthink | 300 | 50 | ✅ |
| 7b | chatiput/conversachatinput/chat*/grok-pwa-*/timeline* (chatinterface Aura) | 300 | 99 (F-CTI) | ✅ |
| 7c | Opencode* V4..V32 + Kilo (linhagem CLI) | 256 | 85 | ✅ |
| 7d | designe.txt + CSS blobs neodevthink + DESIGN/theme + Skill-Design-Universal V23/24/25 | 250 (+30 specs 31..60) | 50 | ✅ |
| 8a | outros.extension/akash/SoFlowX/ansi-art/gl/nathlan/soochimp/bob/iakadion/soodeska | 300 | 195 (9 prefixos) | ✅ |
| 8b | Welcome-* SSOT + Note_08* + document + duck.ai research | 282 | 50 | ✅ |
| 8c | neodevthink tsx/ts git blobs (408 arquivos) | 260 | 50 | ✅ |
| 8d | captures + llms/vfs/sandbox/relay + catálogo IMG neoimg | 250 | 45 | ✅ |
| 9 | contexto-v9 re-baixado (wormhole 70loEk — 928 arquivos, 295 md5 novos; 40 regras ND-9351..9390) | 40 | 19 | ✅ |

## Contagem consolidada

- PARTE 1 regras-totais: ver `regras-totais.md` (~520 entradas)
- PARTE 2 REGRAS-CONVERSAS.txt: ~140 regras
- PARTE 3 regras-APP.md: ~740 regras (APP/SDL/DBN)
- PARTE 4: 60 regras (OPR-0001..0060)
- PARTE 5 onda 4: 1.245 ND · Fase 5: 267 · 6a: 331 · 6b: 291 · 7a: 300 · 7b: 300 · 7c: 256 · 7d: 250 · 8a: 300 · 8b: 282 · 8c: 260 · 8d: 250 · 9: 40 (ND-9351..9390)
- **Total consolidado: ~5.832 regras ND/OPR + 60 specs CSS + 631 features**
- **Meta: >10.000 regras** — reservas livres: ND-7857..7900, 8151..8200, 8783..8800, 9061..9100, 9391..9400 + faixas ND-10xxx em diante
