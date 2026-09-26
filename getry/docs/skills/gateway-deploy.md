---
name: gateway-deploy
description: >-
  SKILL oficial de deploy replicável das cópias de gateway DevThink (@devthink/ai)
  no Z.ai. Use toda vez que abrir um chat novo e receber esta skill: baixa, descompacta,
  coloca em src/, cadastra as 22 chaves NVIDIA no DB, faz o push e o usuário deploya
  N cópias de gateway no Z.ai.
triggers:
  - "gateway deploy"
  - "cópia de gateway"
  - "devthink gateway"
  - "neozips"
  - "chaves nvidia"
  - "deploy z.ai"
---

# SKILL — Deploy Replicável de Cópias de Gateway DevThink no Z.ai

> Leia 100% deste documento antes de agir. Nada de improvisar: o código já está
> pronto no repositório e no arquivo compactado. Sua tarefa é montar o ambiente,
> registrar as chaves, validar as rotas e fazer o push. Sem parar o serviço.

## 0. Contexto (leia em voz alta pro seu cérebro)

| Item | Valor |
|------|-------|
| Plataforma | `@devthink/ai` — gateway multi-provider Next.js 16 (App Router) |
| Versões de gateway | V1 (ZAI) · V2 (Babel, pausada → fallback V1) · V3 (NVIDIA NIM) · V4 (OpenCode+Kilo free) · V5 (Unified/OpenRouter) |
| Rotas por versão | `chat/completions` `completions` `embeddings` `keys` `messages` `models` `responses` (7 × 5 = 35 rotas) |
| Repo oficial | `wenathlan/gateway` (privado) — fonte da verdade, sempre `main` |
| Endpoints Z.ai | `https://internal-api.z.ai/v1` (SDK base) · bypass V1: headers `X-Token` + `userId` diretos |
| NVIDIA NIM | `https://integrate.api.nvidia.com/v1` — 22 chaves `nvapi-…` em rotação LRU |
| DB | SQLite via Prisma 7 + `@prisma/adapter-libsql` (adapter recebe `{ url }` direto) |
| Auth GitHub | Device flow `client_id 178c6fc778ccc68e1d6a` → `github.com/login/device` → token em `.github-token` |
| Commits | SEMPRE como iakadion `174824991+iakadion@users.noreply.github.com` |

## 1. When To Use

| Trigger | Purpose | Detail | Rule |
|---------|---------|--------|------|
| "monta a gateway" | Ambiente do zero | clone → install → db → keys → dev | nunca localhost fixo, porta 3000 da sandbox |
| "cadastra as chaves" | Registro NVIDIA | `bun run db:push` + `bun run keys:register` | 22 chaves ativas na tabela `ApiKey` |
| "repara a gateway" | Rotas quebradas | comparar com `neogateway-src/` canônico | INLINE-PER-ROUTE: cada `route.ts` é single source of truth |
| "nova cópia" | Réplicas no Z.ai | repita §2 na sandbox nova | cada cópia = DB próprio, mesmas rotas |
| "push" | Publicar | bump de versão → commit → push `main` | painéis 0/0/0, workflows verdes |

## 2. Fluxo de Montagem (executar nesta ordem EXATA)

### 2.1 — Fonte A: repositório (preferida — já está tudo pronto)

```bash
cd /home/z/my-project
git clone https://<token>@github.com/wenathlan/gateway.git gateway-clone
# copiar o conteúdo pronto para o projeto da sandbox
cp -r gateway-clone/src/app/v1 gateway-clone/src/app/v2 gateway-clone/src/app/v3 \
      gateway-clone/src/app/v4 gateway-clone/src/app/v5 src/app/
cp gateway-clone/src/app/page.tsx gateway-clone/src/app/layout.tsx gateway-clone/src/app/globals.css src/app/
cp gateway-clone/src/lib/db.ts gateway-clone/src/lib/ui.ts src/lib/
cp gateway-clone/prisma/schema.prisma gateway-clone/prisma.config.ts .
cp -r gateway-clone/scripts .
```

### 2.2 — Fonte B: arquivo compactado (fallback — neozips do wormhole)

```bash
# 1. baixar via agent-browser (Chromium headless descriptografa sozinho via Service Worker)
agent-browser open "https://wormhole.app/D72BW4#YFIAupAqpmd_ILpUbYvNAA"
agent-browser snapshot -i   # achar botão "Download file" e clicar
ls ~/Downloads/neozips.rar  # arquivo limpo (5.9MB→3.75GB conforme o link)

# 2. extrair com UNRAR 7.x estático (unrar-free 0.3.1 NÃO suporta RAR5!)
curl -sL https://www.rarlab.com/rar/rarlinux-x64-712.tar.gz | tar xz
./rar/unrar x -o+ neozips.rar  # → 7 sub-rars
# 3. extrair UM sub-rar por vez e APAGAR cada um após extrair (disco 10GB!)
#    neodevthink(17MB) neopackages(50MB) neoimg(158MB) neoskills(175MB)
#    neochatinterface(175MB) neogateway(511MB) neodocs(2.66GB — pule se apertado)
# 4. neogateway é um repositório git cru: materialize com
git --work-tree=/home/z/neo/neogateway-src checkout HEAD -- .
```

### 2.3 — Dependências e banco

```bash
bun install                       # ~9s
bun run db:generate               # Prisma 7 client (driver adapters)
bun run db:push                   # cria ChatMessage, ApiKey, SessionContext, TownKey
bun run keys:register             # registra as 22 chaves NVIDIA → "total active nvidia keys: 22"
```

### 2.4 — Segurança das chaves

| Regra | Detalhe |
|-------|---------|
| Fonte das chaves | `nvidia/nvidia-keys.json` (22 entradas `nvapi-…`) do repo privado `wenathlan/gateway` (fonte original: histórico git do neogateway); template em `getry/scripts/nvidia-keys.example.json` |
| Repo privado | `wenathlan/gateway` é privado → chaves podem viajar nele |
| Repo público | NUNCA commitar chaves: `.gitignore` antes de qualquer push público |
| `.env` | `DATABASE_URL=file:/home/z/my-project/db/custom.db` (SQLite local) |

### 2.5 — Validação (tudo verde ou não acabou)

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/              # 200
curl -s http://localhost:3000/v3/keys | head -c 200                        # 22 chaves mascaradas
curl -s http://localhost:3000/v1/models | head -c 200                      # devthink meta-model
curl -s -X POST http://localhost:3000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"glm-5.3-flash","messages":[{"role":"user","content":"ping"}],"max_tokens":20}'
# → resposta com usage + session_id = V1 VIVA
```

## 3. Deploy de N Cópias no Z.ai

1. Push em `wenathlan/gateway` (main) com o bump de versão.
2. Em cada chat novo da sandbox Z.ai: cole esta skill → o agente executa §2 → cada sandbox vira uma cópia de gateway independente (DB próprio).
3. Réplica V1 precisa dos headers `X-Token` + `userId` (bypass do SDK compartilhado). V2–V5 funcionam fora da sandbox.
4. Domínios gerados: `https://<sandbox-id>.space-z.ai/` — as 35 rotas ficam disponíveis imediatamente.

## 4. Autenticação GitHub (se o token não existir)

```bash
# gera código de device flow (expira em 15 min — mostre ao usuário, NUNCA pare o serviço)
curl -s -X POST https://github.com/login/device/code -H "Accept: application/json" \
  -d "client_id=178c6fc778ccc68e1d6a&scope=repo,workflow,read:org,user"
# usuário autoriza em https://github.com/login/device
# poller troca device_code por access_token → salva em .github-token (chmod 600)
# regra 45: NUNCA re-pollar após AUTHORIZED
```

## 5. Checklist Final (10 pontos)

- [ ] 35 rotas V1–V5 presentes em `src/app/v{1..5}/`
- [ ] `prisma/schema.prisma` com ChatMessage + ApiKey + SessionContext + TownKey
- [ ] `bun run db:push` verde
- [ ] `bun run keys:register` → 22 chaves ativas
- [ ] `/v1/chat/completions` responde com `session_id` + `usage`
- [ ] `/v3/keys` lista 22 chaves mascaradas
- [ ] `.github-token` com chmod 600 (não commitar!)
- [ ] Commits assinados como iakadion
- [ ] Worklog do sandbox atualizado (`worklog.md` — append, nunca overwrite)
- [ ] Push em `wenathlan/gateway` main → usuário deploya as cópias

## 6. Armadilhas conhecidas (leia 2x)

1. **unrar-free 0.3.1 não abre RAR5** — use o binário estático 7.12 da rarlab.
2. **Processos background morrem entre tool calls** — use double-fork: `( setsid nohup CMD & )` → PPID 1.
3. **wormhole expira em 24h/100 downloads** — prefira Fonte A (repo).
4. **Prisma `latest` = 8.0.0-rc** — PIN em `7.10.0` (tag `prev`).
5. **Modelos NVIDIA EOL** — 410 Gone; liste com `GET /v1/models` e use nomes completos (`deepseek-ai/deepseek-v4.1-flash`).
6. **Babel.town 503** — V2 deve cair para V1 automaticamente.
7. **Streaming V3** — SessionStreamManager + circuit breaker 8 err/60s; timeout do cliente ≥ 120s.
8. **`.next` grande** — apague antes de builds pesados se o disco estiver >80%.
