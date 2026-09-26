---
name: checklist
description: >-
  CHECKLIST.md — checklist objetivo, minimalista e detalhado da Operação
  DevThink, no estilo da árvore completa. Marque [x] quando concluído.
  Uma linha = um fato verificável.
---

# CHECKLIST — Operação DevThink

> Estilo: árvore completa. Objetivo, minimalista, detalhado.
> Referência: 25/09/2026. Repos canônico: wenathlan/devthink (main).

## 1. Downloads e leitura

- [x] contexto.rar baixado (wormhole 1BmY2n, 5.87MB) — nova versão do contexto
- [x] contexto.rar extraído em /home/z/contexto2 e apagado
- [x] dominio-config baixado (wormhole pvWN4d, 1498B) — DNS devthink.pro lido
- [x] neozips.rar baixado (wormhole D72BW4, 3.749.366.980 bytes)
- [x] 7 sub-rars extraídos e APAGADOS após extração (regra disco)
- [x] neodevthink (17MB) extraído
- [x] neopackages (50MB) extraído — lido com prioridade baixa (ordem do dono)
- [x] neoimg (158MB) extraído — catálogo apenas, IMG na fase final
- [x] neoskills (175MB) extraído — 183 pastas
- [x] neochatinterface (175MB) extraído
- [x] neogateway (511MB) extraído — 22 chaves NVIDIA extraídas
- [x] neodocs.rar (2.66GB) extraído (24.924 arquivos; 15.578 textos) e APAGADO
- [x] neodocs-txt flat: 866 entradas de texto em /home/z/neodocs-txt
- [x] auth scripts lidos (relaunch-auth, poll-auth, auth-watchdog, dl-watchdog, wormhole-dl.mjs)
- [x] Auth GitHub device flow AUTORIZADA (código E8A6-4FF6) → token em .github-token
- [x] contexto.txt lido integralmente (2.825 linhas) — atualizado vs versão 1 (+386 linhas)
- [x] ARVORE-COMPLETA lida integralmente (1.295 linhas estendidas com REGRAS GERAIS)
- [x] Onda 4a: neodocs outros.devthink (package.10 case/repos/descricoes) → 214 regras + 99 features
- [x] Onda 4b: neodocs outros.saddle (readme/todo/platforms/sites/research/talks) → 404 regras + 125 features
- [x] Onda 4c: neodocs outros.debonair (17 docs áudio/IA) → 335 regras + 99 features
- [x] Onda 4d: neodocs outros.stealthhead + raiz (sessions, conversas 9-11, skill design) → 292 regras + 86 features
- [ ] Onda 5: neoskills web design/design premium/design pro → specs CSS componentes (ND-4xxx)
- [ ] Onda 6: cadria/stealhead/argan/getry + anotepad + notes + aiactions (ND-5xxx)
- [ ] Changelogs lidos: saddle, devthink, e2ugh, maene, extension, gateway
- [ ] git blobs/objects lidos: Neo DevThink + 7 arquivos

## 2. Documentos na raiz (este conjunto)

- [x] regras.md — manual-mestre (Partes 1–5, ondas apendam → meta >10.000)
- [x] regras-totais.md — governança total (EN, tabelas)
- [x] REGRAS-CONVERSAS.txt — leitura das 6 conversas (~140 regras)
- [x] regras-APP.md — regras por app (devthink/saddle/debonair, ~740)
- [x] features.md — registro de features por app (seed 235, meta >1.000/app)
- [x] gateway.md — SKILL de replicação do gateway em chats novos
- [x] contexto.txt — contexto canônico (2.825 linhas, hierárquico)
- [x] ARVORE-COMPLETA.md — árvore estendida com regras gerais (1.295 linhas)
- [x] CHECKLIST.md — este documento
- [x] package.10.repos — registro dos repositórios
- [x] worklog.md — log compartilhado de agentes
- [ ] contexto.txt re-hierarquizado pós-ondas (manter atualizado)
- [ ] regras.md >10.000 regras (atual: ~2.705 consolidadas; ondas 5–6+)
- [ ] features.md >1.000 features por app (atual: 644 no total — devthink 217, saddle 213, debonair 111, stealhead 56, getry 35, cadria 6, argan 6)
- [ ] IMG: efeitos de diretório, texturas, imagens → design skill (fase final)

## 3. Repositórios e organização

- [x] getry removido como repo independente
- [x] getry movido para dentro de devthink como app (getry/, 138 arquivos)
- [x] 15 apps extras deletados (SoFlowX, akash, ansi-art, bob, cli-desktop, create, devthinkos, extension, gl, iakadion, iukka, nathlan, owni, soochimp, soodeska)
- [x] wenathlan/devthink = monorepo canônico: devthink, saddle, debonair, cadria, stealhead, argan + getry
- [x] Push monorepo (0252ee9 main) — "follow ARVORE-COMPLETA exactly"
- [x] wenathlan/ai (repo temporário) DELETADO (HTTP 204)
- [x] wenathlan/gateway privado preserva biblioteca v1.1.13 + chaves NVIDIA
- [x] Chaves NVIDIA fora do repo público (template + .gitignore)
- [ ] saddle: merge lossless e2ugh concluído e verificado pairwise
- [ ] devthink: absorção devthinkos/cli-desktop/SoFlowX/akash/extension/gateway/maene + owni embutido
- [ ] cadria: absorção iukka+create
- [ ] stealhead: import versawase
- [ ] argan: DNS/gateway (A @/* → 66.223.49.89)

## 4. Gateway @devthink/ai (getry)

- [x] 35 rotas integradas no projeto (v1–v5 × 7 endpoints)
- [x] 22 chaves NVIDIA registradas no DB (keys:register — total active: 22)
- [x] db:push + db:generate OK (Prisma 7.10 + libsql)
- [x] Dev server :3000 — GET / 200; /v3/keys 22 mascaradas; /v1/models devthink meta
- [x] POST /v1/chat/completions glm-5.3-flash → resposta real com usage+session_id
- [x] NVIDIA NIM direto → HTTP 200 deepseek-v4.1-flash (82 modelos vivos)
- [x] gateway.md (skill) escrito — replicação em chats novos
- [ ] N cópias de gateway deployadas via skill (fluxo gateway.md)
- [ ] Gator: deploy em plataformas arbitrárias + next.line src gateway
- [ ] Sub-rotas gateway: imagem, áudio, PDF parsing
- [ ] .zs scripts: modificação/criação para auto-pull release asset

## 5. Build da plataforma (ordem do dono)

- [ ] Painel de controle (painel de controle) — tudo começa por ele
- [ ] Tema sol: páginas=app (components/css/tsx), 35 páginas
- [ ] Sidebars flutuantes magnéticas ESQ+DIR repositionáveis
- [ ] Neo Chat Interface como referência de chat/abas/ícones/micro-animações
- [ ] Explore com Stripe (loja) — uma página uma função
- [ ] Galeria de vídeos com etiqueta % de IA
- [ ] Grupos/equipes mistos humano+subagente; perfis virtuais marcados
- [ ] Chatbot (YouTube-grade) no Explore
- [ ] Componentes flutuantes configuráveis no tema padrão
- [ ] Temas 2–4 (ex.: Luna)
- [ ] Deploy GitHub Pages + Netlify + Vercel + subdomínios (nome-do-app).devthink.pro
- [ ] Site clones: backup+storage+injeção de DB compartilhado (Prisma/MySQL/PostgreSQL/SQLite/Visual Warner)
- [ ] Sandboxes: completo (drivers/vGPU/storage) ou Node/Webpack/Babel/ASIM
- [ ] Sem hardcode; sem mockups falsos; DB preenche conteúdo; lógica parametrizada

## 6. Verificação final

- [ ] lint verde (bun run lint)
- [ ] Browser: página / renderiza sem erros de console
- [ ] Golden path testado no browser (interações principais)
- [ ] Responsivo mobile+desktop; footer sticky (mt-auto)
- [ ] dev.log sem erros de runtime
- [ ] worklog.md atualizado por todos os agentes
