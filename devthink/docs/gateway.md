---
name: gateway
description: >-
  SKILL de replicação do Gateway DevThink (@devthink/ai) no Z.ai. Cole este doc
  em um chat NOVO: o agente monta a sandbox, instala, registra as 22 chaves
  NVIDIA, valida as 35 rotas, faz push e replica N cópias sozinho.
---

# SKILL — Replicar o Gateway @devthink/ai (DevThink) no Z.ai

> Leia 100% antes de agir. O código já existe — nada de reescrever rotas.
> Fluxo validado end-to-end: clone → install → db → 22 chaves → dev :3000 → push.

## 1. IDENTIDADE

| Item | Valor |
|------|-------|
| Plataforma | `@devthink/ai` — gateway multi-provider Next.js 16 (App Router), bun 1.3+ |
| Rotas | **35 = 7 endpoints × 5 versões**: `chat/completions` `completions` `embeddings` `keys` `messages` `models` `responses` em `src/app/v{1..5}/<endpoint>/route.ts` |
| V1 = ZAI | SEM chave (SDK interno da sandbox); família glm-5.3; **só funciona dentro da sandbox Z.ai** |
| V2 = Babel.town | pausada (503) → mantém código e cai para V1 automaticamente |
| V3 = NVIDIA NIM | `https://integrate.api.nvidia.com/v1` — 22 chaves `nvapi-…` em rotação LRU |
| V4 = OpenCode+Kilo | free-only, sem chave, catálogo dinâmico |
| V5 = OpenRouter | free-only (env `OPENROUTER_API_KEY`) |
| Meta-modelo | `devthink` — máscara do campo `model` em TODA resposta; contexto agregado |
| DB | SQLite via Prisma 7.10 + `@prisma/adapter-libsql` — models `ChatMessage`, `ApiKey`, `SessionContext`, `TownKey` |
| Fonte única de verdade | monorepo **`wenathlan/devthink`** (código, app `getry/`) + repo PRIVADO **`wenathlan/gateway`** (`nvidia/nvidia-keys.json`, as 22 chaves) |
| Auth GitHub | device flow `client_id 178c6fc778ccc68e1d6a` → token em `.github-token` |
| Commits | SEMPRE como iakadion `174824991+iakadion@users.noreply.github.com` |

Regra de ouro: cada rota é self-contained (INLINE-PER-ROUTE). Não criar arquivos
fora do escopo, não mexer em `next.config`, `Caddyfile`, `bun.lock`, `.npmrc`.

## 2. PREPARAR AMBIENTE

- [ ] Sandbox Z.ai: ~10GB disco / 8GB RAM; bun, git, curl pré-instalados.

```bash
df -h /home/z && free -h && bun --version   # confirmar recursos
```

- [ ] Liberar espaço (~6.4GB recuperados na operação original):

```bash
rm -rf /home/z/.venv /home/z/.cache/puppeteer /home/z/.npm
```

### Fonte A — git clone (PREFERIDA, sem risco de expiração)

```bash
cd /home/z
git clone https://<token>@github.com/wenathlan/devthink.git devthink
# copiar a plataforma (getry/) para o projeto da sandbox:
cp -r devthink/getry/src/app/v{1,2,3,4,5} /home/z/my-project/src/app/
cp devthink/getry/src/app/{page.tsx,layout.tsx,globals.css} /home/z/my-project/src/app/
cp devthink/getry/src/lib/{db.ts,ui.ts} /home/z/my-project/src/lib/
cp devthink/getry/prisma/schema.prisma devthink/getry/prisma.config.ts /home/z/my-project/
cp -r devthink/getry/scripts /home/z/my-project/
```

### Fonte B — wormhole (fallback; link expira em 24h / 100 downloads)

Asset `D72BW4` (fragmento fornecido junto do link) = `neozips.rar` 3.7GB
(3.749.366.980 bytes, 749 chunks × 5MB).

```bash
# downloader CLI foreground com timeout — NUNCA background (armadilha #1)
timeout 580 node wormhole-dl2.mjs D72BW4 <fragmento> /home/z/neozips.rar
# se timeout matar: REPITA A MESMA LINHA — resume automático por parts
# (valida cada chunk em neozips.rar.parts/ por tamanho; stall 90s → exit; re-auth B2 a cada ~15-20min)
```

- `wormhole-dl2.mjs` = pipeline E2E replicando o browser: salt → HKDF → auth
  token → torrent AES-128-GCM → chunks B2 → streaming decrypt `aes128gcm`
  (RFC 8188). Se não estiver no ambiente, obtenha uma cópia do usuário/repo —
  NÃO improvisar downloader; para arquivos <2GB o agent-browser resolve.
- Extração com UNRAR 7.12 ESTÁTICO (`unrar-free 0.3.1` NÃO abre RAR5):

```bash
curl -sL https://www.rarlab.com/rar/rarlinux-x64-712.tar.gz | tar xz
./rar/unrar x -o+ neozips.rar            # → 7 sub-rars
# extrair UM sub-rar por vez e APAGAR cada um após extrair (disco 10GB!):
#   neodevthink 17MB · neopackages 50MB · neoimg 158MB · neoskills 175MB
#   neochatinterface 175MB · neogateway 511MB (ALVO) · neodocs 2.66GB (pular se apertado)
./rar/unrar x -o+ neogateway.rar
git --work-tree=/home/z/neo/neogateway-src checkout HEAD -- .   # repo git cru → materializar
# as 22 chaves vivem no histórico (commit "register 22 NVIDIA keys") em scripts/nvidia-keys.json
```

## 3. INSTALAR

```bash
cd /home/z/my-project
bun install                  # ~9s, ~377 pacotes
bun run db:generate          # client Prisma 7 (driver adapters)
bun run db:push              # cria ChatMessage, ApiKey, SessionContext, TownKey
bun run keys:register        # → "SUCCESS — total active nvidia keys: 22"
```

- [ ] Env do banco: `GATEWAY_DATABASE_URL=file:/home/z/my-project/db/custom.db`
      (NÃO usar `DATABASE_URL` do workspace — conflito com o DB da plataforma).
- [ ] Chaves NVIDIA (22): clonar o repo PRIVADO
      `wenathlan/gateway` → `nvidia/nvidia-keys.json` → copiar para
      `scripts/nvidia-keys.json`. Em repo público existe SOMENTE o template
      `getry/scripts/nvidia-keys.example.json` (vazio) + `.gitignore`.
- [ ] `keys:register` usa `scripts/register-nvidia-keys.mjs` (semeia a tabela
      `ApiKey`, provider `nvidia`, nomes nvidia-1..nvidia-22).
- [ ] Validar contagem antes de seguir: `curl -s http://localhost:3000/v3/keys`
      deve reportar 22 (feito na seção 4).

## 4. RODAR E VALIDAR

Subir o dev server na porta 3000 (foreground no MESMO bloco bash — sobe, testa, mata):

```bash
cd /home/z/my-project && bun run dev & DEVPID=$!; sleep 8
curl -s -o /dev/null -w "GET /            -> %{http_code}\n" http://localhost:3000/          # 200
curl -s http://localhost:3000/v1/models | head -c 300          # meta-model devthink (glm-5.3, ctx ~2.3M)
curl -s http://localhost:3000/v3/keys | head -c 300            # 22 chaves mascaradas
curl -s -X POST http://localhost:3000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"devthink","messages":[{"role":"user","content":"ping"}],"max_tokens":20}' | head -c 400
# → resposta SSE/JSON com usage + session_id = GATEWAY VIVA
kill $DEVPID
```

- [ ] Se o server precisar sobreviver entre tool calls:
      `( setsid nohup bun run dev & )` → PPID 1 (double-fork). Ainda assim,
      prefira validar tudo em um único bloco (armadilha #1).
- [ ] Verificação browser (quando disponível): `/` renderiza "DevThink Gateway,
      35 routes", cards V1–V5, console sem erros.

### Checklist final (10 pontos)

- [ ] 35 rotas V1–V5 presentes em `src/app/v{1..5}/`
- [ ] `prisma/schema.prisma` com ChatMessage + ApiKey + SessionContext + TownKey
- [ ] `bun run db:push` verde
- [ ] `bun run keys:register` → 22 chaves ativas
- [ ] `/v1/chat/completions` responde com `session_id` + `usage`
- [ ] `/v3/keys` lista 22 chaves mascaradas
- [ ] `.github-token` com chmod 600 (NUNCA commitar)
- [ ] Commits assinados como iakadion
- [ ] `worklog.md` atualizado (append, nunca overwrite)
- [ ] Push na `main` → usuário deploya as cópias

## 5. AUTH GITHUB

```bash
# 1. gerar device code (expira em 15 min — mostre o user_code ao usuário)
curl -s -X POST https://github.com/login/device/code -H "Accept: application/json" \
  -d "client_id=178c6fc778ccc68e1d6a&scope=repo,workflow,read:org,user"
# → user_code (exemplo real já autorizado: E8A6-4FF6), device_code, interval=5
# 2. usuário autoriza em https://github.com/login/device
# 3. poller: trocar device_code por token a cada 5s até "authorization_pending" virar 200
curl -s -X POST https://github.com/login/oauth/access_token -H "Accept: application/json" \
  -d "client_id=178c6fc778ccc68e1d6a&device_code=<DEVICE_CODE>&grant_type=urn:ietf:params:oauth:grant-type:device_code"
# 4. salvar access_token em .github-token (chmod 600) e PARAR o poll
chmod 600 .github-token
git config user.name iakadion
git config user.email 174824991+iakadion@users.noreply.github.com
```

- [ ] `.gitignore` deve conter ANTES de qualquer commit: `.github-token`,
      `.auth-status`, `.device-flow-current.json`, `db/*.db`,
      `scripts/nvidia-keys.json`, `.env`.
- [ ] Regra 45: NUNCA re-pollar depois de AUTHORIZED (token já obtido).
- [ ] Push: `git push https://<token>@github.com/wenathlan/devthink.git main`
      (ou no repo-alvo da cópia).

## 6. REPLICAÇÃO (N cópias)

Cada chat novo do Z.ai que receber esta skill vira UMA cópia independente
(DB próprio, mesmas 35 rotas). Repetir as seções 2–5 em N sandboxes.

- [ ] Deploy externo (fora da sandbox): Vercel ou Netlify
      - `vercel.json` SEM bloco `functions` (quebra o build Next/Bun).
      - Build via Bun + Next; env `DATABASE_URL` (libsql/turso) +
        `ZAI_BASE_URL` (default `https://api.z.ai` — público).
      - LEMBRETE: **V1 só funciona dentro da sandbox Z.ai** (precisa cookies/
        identidade do usuário). Fora, V2–V5 funcionam; V2 pausada → fallback.
- [ ] Domínio próprio: subdomínio `(nome-do-app).devthink.pro`
      - DNS devthink.pro já tem wildcard: `A @/*/app/mail/projects/www → 66.223.49.89`
        (dev=Auto) — basta criar o registro A do subdomínio → `66.223.49.89`.
- [ ] Preview da sandbox: `https://<sandbox-id>.space-z.ai/` — 35 rotas
      disponíveis imediatamente após o dev/build server subir.
- [ ] Para várias cópias do MESMO código: escreveu uma vez no monorepo →
      push → cada sandbox clona e registra as chaves (não reescrever rotas).

## 7. REGRAS CRÍTICAS (8 armadilhas — leia 2x)

1. **Sandbox mata background entre tool calls** → downloader/dev server SEMPRE
   em FOREGROUND com timeout (580s p/ download; re-invocar = resume). Se
   precisar sobreviver entre calls: `( setsid nohup CMD & )` → PPID 1.
2. **Wormhole expira** (24h / 100 downloads) → 404/410 = pedir link novo;
   Fonte A (git clone) é imune. Nunca agent-browser para o neozips 3.7GB
   (blob ceiling do browser ~2GB).
3. **Chaves NVIDIA nunca em repo público** → fonte só no PRIVADO
   `wenathlan/gateway:nvidia/nvidia-keys.json`; no público apenas
   `nvidia-keys.example.json` + `.gitignore`. `git ls-files` antes do push.
4. **`.manustask` é binário** → não ler como texto, não grep conteúdo.
5. **Contexto binário UXP** → tratar como binário (não descompactar/parsear
   como texto); usar somente os arquivos de contexto textuais.
6. **Prisma config object** → `prisma.config.ts` obrigatório; datasource SEM
   `url`, generator SEM `output`; adapter `PrismaLibSql`; `db.ts` nunca cria
   PrismaClient em module-load (lazy proxy); PIN prisma `7.10.0`
   (`latest` = 8.0.0-rc, quebra).
7. **Um `[DONE]` único** → parser/emit SSE: exatamente um `data: [DONE]`
   maiúsculo em brace-depth 0; nunca duplicado nem colado (`nudata`/`zdata`
   = chunks concatenados); keepalive como `delta {}` ou `: keepalive`.
8. **Máscara devthink** → campo `model` do stream de saída SEMPRE `devthink`,
   nunca o nome upstream real (GLM/NVIDIA/kilo); modelo específico setado =
   só rotação de chave; `devthink` = chave + modelo a cada 6 msgs/sessão.

## 8. CRITÉRIOS DE PRONTO

Só declare sucesso se TUDO passar:

- [ ] Disco livre ≥5GB ANTES do download (senão limpar .venv/.cache)
- [ ] `ls src/app/v1/v2/v3/v4/v5` → 7 rotas em cada (35 no total)
- [ ] `bun install` sem erro
- [ ] `bun run db:push` verde (4 models criados)
- [ ] `bun run keys:register` → `total active nvidia keys: 22`
- [ ] `GET /` → 200 · `GET /v1/models` → devthink · `GET /v3/keys` → 22 mascaradas
- [ ] `POST /v1/chat/completions` (model devthink) → `usage` + `session_id`
- [ ] `git status`/`git ls-files` SEM segredos (`.github-token`,
      `scripts/nvidia-keys.json`, `db/*.db`, `.env` fora do commit)
- [ ] Commit/push `main` como iakadion, workflows/painéis verdes
- [ ] `worklog.md` da sandbox atualizado via append
- [ ] URL pública respondendo (preview space-z.ai OU subdomínio devthink.pro)
- [ ] Nenhum processo em background órfão; caches grandes limpos (`.next`,
      zips, sub-rars) se disco >80%

Pronto = usuário recebe a URL da cópia + confirmação "22 chaves, 35 rotas".
