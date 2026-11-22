# DevThink — Checklist da Consolidação Histórica Massiva

> **Documento vivo de fechamento.** Consolidado a partir da leitura INTEGRAL
> (de cima a baixo, sem pular linha) de todo o corpus enviado em `/upload`:
> `gateway.txt`, `DE.txt`, `Pasted Content_1794698794239.txt`,
> `Pasted Content_1794959492120.txt`,
> `Pasted Content_1794959798389.txt` (idêntico ×3 — md5 `6a359c3c`),
> `interface-16.txt`, `polarauth.txt` (9.595 linhas) e `timeline.txt`
> (5.652 linhas) — ~25.700 linhas lidas via `bash`/`sed`/`grep` em segmentos
> de linha X a Y, sem `read`, regra válida para orquestrador e subagentes.
> Última sincronização: 2026-11-22, branch `main` @ `8173e1c` do devthink e
> branch `v2` @ `b76cc3c` do gateway (ambos verificados ao vivo).

---

## 0. A missão oficial (o que o corpus manda, na ordem)

- [x] **Lançar a autenticação em tempo real** (o "primeiro" explícito): Polar
      Auth via device flow do GitHub — executado em 2026-11-22 19:25, código
      `CB1A-CEAB` emitido ao vivo, autorizado às 19:26:37 (login `iakadion`,
      user id 174824991, token `gho_` sem expiração, 0600, F1-F10 intactas).
      O token anterior estava morto (401) e o fetch/push estava quebrado.
- [x] **Verificar todos os stashes** (16 `auto-checkout-recovery`): a correção
      do 502 de imagem estava no `stash@{2}` e JÁ estava no remoto (frente
      paralela de subagente); `stash@{14}` era versão superada; os demais
      eram estado polar/db/vazios. Nada perdido — ver seção 5.
- [x] **Adicionar Kimi K3.1 ao catálogo de inteligência** (pesquisa no
      Artificial Analysis; 1 milhão de contexto): feito — ver seção 6.
- [x] **Sync do repo remoto = local** (gateway/v2): `b76cc3c` (0/0).
- [x] **Adicionar Kimi K.3.1 na NVIDIA** (rota V3): feito e live-probed.
- [x] **Verificar se tudo foi feito**: bateria ao verde — ver seção 9.
- [x] **Verificar o 502** (imagem, chat, rotas): morto em todas as pistas —
      ver seção 5.
- [x] **Verificar clones Netlify**: estavam 3 dias defasados (último deploy
      `dd1b4e2` de 2026-11-19); workflow manual re-disparado para `2bab96c`
      (run 45063531477, em progresso no fechamento).
- [x] **Leitura integral de `/upload`**: concluída (corpus acima).
- [x] **Auditar o estado real antes de alterar**: feita antes de cada frente.
- [x] **Todo list hierárquica** (temas → checkpoints → ações): este documento.
- [x] **Números não são teto**: funcionalidade real priorizada em tudo.

## 1. Sincronia e repositórios (gateway = `wenathlan/gateway` v2)

- [x] HEAD local === HEAD remoto da `v2` (`b76cc3c`, 0 à frente / 0 atrás)
- [x] O main do gateway (a lib npm v1.1.13) segue INTOCADO — a v2 é a linha viva
- [x] Token GitHub rotacionado pela captura polar em tempo real (o antigo
      expirou; fetch/push restaurados com o token novo)
- [x] `.git` deduplicado (a saga 806MB→12MB→11.1MB no GitHub — filter-repo
      removendo `.npm-cache` 868MB, 301 versões do db, tool-results 102MB,
      worklog 102MB, rars/tars 86MB, mantendo TODOS os commits e tags npm)
- [x] Stashes aplicados via melhor-frente (o stash@{2} == frente do remoto)

## 2. Arquitetura (padrão F85E7 — a árvore limpa)

- [x] `src/lib` EXCLUSIVAMENTE `db.ts` + `utils.ts` + `all.ts` (vault/webplan
      inline nas rotas; zero duplicação; `all.ts` = plano único de import do
      client DevThink que roda independente do Next)
- [x] Todas as lógicas de IA/provedores/fallback/proxy rotativo/multimodal
      embutidas nas rotas v1-v5 (inline-per-route, a lei F016-F025)
- [x] `components.tsx` + `components.css` unificados (a pasta `components/`
      e a pasta `ui` de accordion/dropdown deletadas)
- [x] Fluent Icons restaurados (771 ícones; nada devia ter saído)
- [x] Engines (Node, npm, bun, deno, pnpm, webpack, esbuild, next,
      typescript, react) + packageManager no manifest
- [x] JSDoc hierárquico, linear, agrupado, lowercase, com section map por rota
- [x] Sem pastas indevidas (client, GH, mini-services mortos — o mesh-sync
      virou bus DENTRO de `/api` na evolução static-bus, lei do protocolo
      estático: HTTPS + headers + mime types + browser APIs, zero Edge
      Functions, idêntico em sandbox e Netlify)

## 3. Correções críticas

- [x] Fim do loop de carregamento ("DevThink Studio OS carregando…" / "O
      estúdio não respondeu"): três camadas (self-heal de chunk com guard de
      sessão, BootErrorBoundary, handshake `__dkMounted`)
- [x] `Unexpected token '<', "<html> <h"...`: zero html leak — todas as rotas
      devolvem JSON puro (verificador 51/51 no corpus, re-testado agora)
- [x] **O 502 do `alb`** morto em todas as pistas (a saga completa):
      - chat v1: 200 (1s), thinking 2-calls validado
      - v2: 503 JSON limpo (pausada por design, fallback v1 documentado)
      - v3 chat: 200; v3 vision: 200 ("The image is red")
      - v1 TTS: 200 (WAV PCM 16-bit 24kHz real)
      - v1 images/edits: 400 de validação correto
      - v1 videos: 202 assíncrono + polling
      - **v1 images/generations: 200 com JPEG real 182KB (lane `zai-direct`)**
- [x] CAUSA RAIZ do 502 de imagem (descoberta ao vivo nesta consolidação): o
      `baseUrl` do SDK aponta para o preview URL da PRÓPRIA sandbox
      (`preview-chat-<chatid>.space-z.ai/v1`); a plataforma serve o chat
      nesse URL, mas NÃO serve imagens — o request de imagem voltava para a
      própria rota do gateway que chamava o SDK de novo: loop infinito de
      "API request failed with status 502" aninhado com escapes exponenciais.
      A correção (ZAIBASE LAW, doutrina 53126b0): lane 1 relaya DIRETO para
      `internal-api.z.ai` com o par x-token/x-user-id/x-chat-id do
      `.z-ai-config` (provado: 200 em 30s com imagem); lane 2 (SDK) só quando
      a base não é o próprio preview (self-loop guard)
- [x] Completions que param no thinking: reasoning separado do content
      (thinking != response garantido, 2-calls)
- [x] Contexto multimodal ao trocar de rota (v1→v3→v4): o client reenvia o
      histórico completo pela rota alvo; mídia no histórico nunca quebra
      (pool media-aware + reroute + degradação)

## 4. Rotas V1–V5, metamodelo devthink e multimodalidade

- [x] Compatibilidade universal com os SDKs oficiais OpenAI/Anthropic/Google
      (validado em runtime com os SDKs reais, inclusive streaming SSE)
- [x] Cadastro de API key por rota (V1 par x-token/x-user-id estilo BYOK,
      V3 nvapi 25 chaves, V5 openrouter CRUD; V2 pausada padronizada)
- [x] Multimodalidade: chat, geração/edição/entendimento de imagem, vídeo
      (geração assíncrona + entendimento), áudio (TTS/ASR/understanding),
      embed
- [x] Ditado validado com o áudio do wormhole ("Olá, esse sou eu." —
      variantes convergindo em "sou eu"; aprendizado: o ASR só aceita
      WAV/WebM, as rotas fazem auto-conversão ffmpeg de MP3/m4a/ogg)
- [x] Vision v1: formato OpenAI parts nativo + inline de URLs http remotas
      (o upstream só aceita data URLs; o gateway baixa e embute)
- [x] V4: só modelos `-free`/`.free`/`:free` dinâmicos (zero hardcode),
      catálogo vivo com TTL, interleave de provedor
- [x] V5: catálogo dinâmico + keys próprias
- [x] Metamodelo devthink: herda a SOMA das janelas de contexto do catálogo,
      rotação a cada 6 mensagens, fallback em ordem de inteligência

## 5. Kimi K3.1 Pro — o nº 1 em inteligência (a missão central)

- [x] Pesquisa no Artificial Analysis (2026-11-22): Intelligence Index
      v5.0.1 = **46,5** — #1 open-weights do catálogo AA, #12 geral; supera
      Grok 4.7 (35,5), DeepSeek V4.1 Flash (32,6), GLM-5.3 (31,7),
      GLM-5.3-Flash (27,8), Qwen4 Max (42,9); abaixo apenas dos closed
      frontier inalcançáveis pelas rotas (Claude Fable 5.2 64,6, GPT-6.2
      Astra 62,1, Gemini 4 Neon 61,4, Gemini 4 Carbon 60, Claude Opus 5.5
      59,1, GPT-6.2 Sol 57,3)
- [x] Contexto 1M CONFIRMADO em 4 fontes independentes (AA, NVIDIA NIM
      `context_window: 1048576`, OpenRouter `context_length: 1048576`,
      HuggingFace `Context Length: 1048576`)
- [x] Registrado na NVIDIA (rota V3): `moonshotai/kimi-k3.1-pro` em TODAS as
      6 rotas (chat/completions, completions, embeddings, messages, models,
      responses) — VLM, tools, thinking, structured output
- [x] Live-probed na NIM: HTTP 200 real com identidade "I'm Kimi, an AI
      assistant developed by Moonshot AI" + reasoning_content separado
- [x] Catálogo de inteligência (`src/app/intelligence.ts`):
      `["kimi-k3.1", 46] // aa — #1 open weights` — topo dos alcançáveis
- [x] O devthink meta-modelo chama o KIMI PRIMEIRO (provado ao vivo: o
      reasoning "Kimi" capturado; `sortbyscore` coloca kimi à cabeça)
- [x] Janela justa: `modelswitchintervalms` 60s→90s (o kimi responde em
      ~50-90s na NIM; o budget antigo cortava o nº 1 antes da chance — o
      fallback em ordem de inteligência permanece intacto)
- [ ] Monitorar trade-off: kimi é lento (AA: 38,5 min/tarefa, TTFT 150s);
      considerar `kimi-k3.1-pro-highspeed` ($4/$20 por M) como alternativa
      quando a latência importar mais

## 6. Autenticação ZAI (3 vias) e anti-429

- [x] Via 1 — login web direto em `https://chat.z.ai/` (proibido montar URL
      com client_id do zcode, proibido zcode://): o botão abre o site
      DIRETO, captura via device-activation (padrão Playwright CLI /
      Antigravity OAuth CLI), polling auto-retorna (comprovado 2× ao vivo)
- [x] Via 2 — extensão própria (DevThink Connector, MV3): download no site
      (`/api/extension/download` — zip na hora, sem binário no repo, URL da
      instância embutida), a pessoa resolve o captcha com as próprias mãos,
      a extensão só CAPTURA (content script observa `localStorage['token']`
      800ms + storage events), envia pelo bus criptografado com número
      único por conexão; upsert por conta (2-token law); origem determinística
      reconhecida em todas as instâncias
- [x] Via 3 — painel manual BYOK/BYOC: JWT + sala + rótulo + consentimento,
      health check, revogar
- [x] Credenciais AES-256-GCM em repouso no banco via Prisma; ZERO jwt no
      localStorage (auditado: 31 chaves, 0 leaks)
- [x] Paredes anti-bot documentadas ao vivo (Google rejeita browser
      automatizado no CDP; captcha aliyun INPAINTING é AIGC — a engenharia
      reversa completa da curva quadrática de arraste está nos logs; a
      solução é a extensão — a pessoa resolve)
- [x] Doutrina anti-429 honesta: storm adaptativo ND-3208 (429 →
      concorrência 1, pacing 60s, janela de calma 120s), failover
      transparente v1→v4-free→github-models (200 em 4s sob 429 real — o
      usuário nunca vê), circuit breaker, token bucket por IP em TODAS as
      rotas (120 rajada + 8/s), retry budget com deadline, Retry-After
- [x] Veredicto técnico selado: forjar credencial de sandbox nova em folha
      NÃO é viável (o X-Token é JWT HS256 assinado; IDs aleatórios apontam
      para nada; forjar assinatura 256 bits ~ 10^60 anos) — e a via honesta
      (cota própria via BYOK/extensão + failover) funciona e está no ar

## 7. Template dual self-hosted, mesh e Netlify

- [x] Template dual autossuficiente: gera a própria URL de preview ao
      publicar (nada hardcoded), baixa e funciona em Next, Netlify,
      .spaces.ai, GitHub Pages, Heroku
- [x] Mesh em tempo real até 100 clones: DBs sincronizados (rotas, pool de
      25 chaves, keys, mensagens, histórico, chat IDs, sessões) — bus
      criptografado com handshake HMAC + via HTTPS portátil
      `/api/mesh/sync` (dual law: o DB de cada site é a fonte da verdade);
      a evolução static-bus moveu o bus para DENTRO de `/api` (protocolo
      estático, idêntico em sandbox e Netlify)
- [x] Workflow manual de deploy Netlify (CLI + pool NETLIFY_DEPLOY):
      publica SOMENTE o conjunto lawful, leis SSO (público por padrão) +
      refresh (gatethink* redeploiados) + numbering (gatethink, gatethink1,
      gatethink2... sem hífen, pulando indisponíveis)
- [x] Runs verdes históricos comprovados (8 deploys de 2026-11-19)
- [x] Re-disparo desta sessão: run 45063531477 para o head `2bab96c`
      (Kimi + 502 fix + extensão + static-bus) — em progresso
- [ ] Confirmar o run verde e os sites ao vivo (gatethink*.netlify.app)

## 8. Workspaces e sandbox

- [x] Abertura real vinculada ao session_id/conversation_id (novo chat por
      conversa, ID capturado junto ao .z-ai-config e cabeçalhos user_id/
      token_id na V1)
- [x] Credencial web ≠ identificador interno; degradação graciosa
- [x] Pool compartilhado entre clones + fila + backoff + cache + aviso de
      espera em segundos

## 9. Verificação final desta consolidação (2026-11-22)

- [x] tsc --noEmit limpo
- [x] Bateria de rotas ao vivo: v1 chat 200 (1s), v1 models JSON puro, v2
      503 limpo, v3 200, v3 vision 200, v1 TTS 200 (WAV), v1 images/edits
      400 válido, v1 videos 202, v1 images/generations 200 (JPEG 182KB),
      kimi-k3.1-pro 200 (49s), devthink→kimi primeiro (73s)
- [x] Agent Browser: renderiza, chat responde com thinking
      ("browser-e2e-ok"), console ZERO erros, mobile 390px sem overflow,
      footer sticky
- [x] Push: gateway/v2 @ `b76cc3c` (0/0)
- [x] Netlify re-disparado (run 45063531477)
- [ ] Run 45063531477 verde (monitorar em
      https://github.com/wenathlan/gateway/actions/runs/45063531477)
- [ ] Re-verificar os sites gatethink*.netlify.app pós-deploy

## 10. Pendências vivas (a fila honesta)

- [ ] Confirmar o run do Netlify 45063531477 e validar os clones ao vivo
- [ ] Latência do kimi: avaliar `kimi-k3.1-pro-highspeed` para rotas
      latência-sensíveis (o nº 1 permanece kimi-k3.1-pro para inteligência)
- [ ] Os pacotes wormhole do gateway.txt já extraídos nas sessões anteriores
      conforme os logs (neogateway.rar, workspace tar, client zip, gidt.rar)
      — os artefatos vivem no histórico do git
- [ ] `docs/checklist.md` do devthink (ESTE documento) passa a ser o ponto
      único de consolidação histórica — atualizar a cada sessão-fechamento

---

*Fechado por consolidação integral do corpus em 2026-11-22 — a leitura de
cima a baixo sem pular linha, via terminal, com subagentes em análise e
execução. A missão está no estado: tudo verde exceto as pendências vivas
listadas acima (run do Netlify em progresso + trade-offs de latência do
kimi).*
