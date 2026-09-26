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

## Log de ondas

| Onda | Fontes lidas | Regras novas | Features novas | Status |
|------|--------------|--------------|----------------|--------|
| 0 | contexto.rar (162 arquivos, 53 únicos) + ARVORE-COMPLETA + regras-totais | ~1.400 | — | ✅ consolidadas nas Partes 1–3 |
| 1 | 6 conversas (17.500 linhas) | ~140 | — | ✅ Parte 2 (REGRAS-CONVERSAS.txt) |
| 2 | captures raiz/saddle/devthink/design + stealthhead + debonair + cli + chatinterface + skills design | ~740 | — | ✅ Parte 3 (regras-APP.md) |
| 3 | gateway operação + DNS + workflows + mesh | 60 | — | ✅ Parte 4 (OPR-0001..0060) |
| 4a | neodocs outros.devthink (package.10 case/repos/descricoes) | 214 | 99 | ✅ |
| 4b | neodocs outros.saddle (readme/todo/platforms/sites/research/talks) | 404 | 125 | ✅ |
| 4c | neodocs outros.debonair (17 docs de áudio/IA) | 335 | 99 | ✅ |
| 4d | neodocs outros.stealthhead + raiz (sessions, conversas 9-11, devnotes, skill design) | 292 | 86 | ✅ |
| 5 | neoskills web design / design premium / design pro → specs CSS componentes | — | — | ⏳ fila |
| 6 | cadria/stealhead restantes + anotepad + notes + aiactions + chatinterface | — | — | ⏳ fila |

## Contagem consolidada

- PARTE 1 regras-totais: ver `regras-totais.md` (~520 entradas de tabela)
- PARTE 2 REGRAS-CONVERSAS.txt: ~140 regras numeradas
- PARTE 3 regras-APP.md: ~740 regras (APP-xxxx, SDL-xxxx, DBN-xxxx)
- PARTE 4: 60 regras (OPR-0001..0060)
- PARTE 5 onda 4: **1.245 regras ND** (214+404+335+292) · **409 features**
- **Total consolidado: ~2.705 regras + 409 features**
- **Meta: >10.000 regras** — ondas 5–6+ continuam o append (faixas ND-4xxx+)
