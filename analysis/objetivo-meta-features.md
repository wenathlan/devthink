# Objetivo, Meta e Features — operação session9 (rung base 2.0.150)

Fontes: session7-so-user.txt (7.559 linhas, lidas integralmente por subagente via sed), session7-so-assistant.txt (34.293 linhas), redesign.doctrine.md, rules.distilled.md, auditoria de código 1-c (árvore 2.0.150), verificação npm/GitHub ao vivo.

---

## OBJETIVO (uma frase)

Entregar o DevThink como sistema REAL: design Windows 11 × trylle.com em todas as superfícies, autenticação persistente de verdade no servidor, zero superfície mocado, engines (saddle/vault) falando pelo servidor, família publicada — nada de teatro.

## META (como se sabe que chegou)

1. A pessoa entra, vê a face de entrada padrão awards; cria conta; apaga cookies/abre anônimo; faz login de novo e a conta + dados estão lá (servidor, não navegador).
2. O sandbox executa pela lane do servidor (jail por sessão, relatório honesto das modalidades do registry) com fallback offline declarado.
3. My Files lê/escreve na lane /api/v1/storage (quota do plano, sem teto de navegador).
4. Vídeo com face real de reprodução (não só fila).
5. Todo texto de UI vem da lane de labels/copy (DB), zero string renderizada fora do accessor.
6. Nomenclatura limpa: zero dot, zero hífen, zero stutter (ImageImageengine etc.), zero composto (GatewayFamily).
7. Workflows verdes; família sincronizada no npmjs (saddle incluso).
8. Verificação browser ao vivo (agent-browser) do caminho dourado, zero erro de console.

## FEATURES (o que vale, por pilares)

### P1 — Design (a régua: Windows 11 + trylle.com)
- tela de login/lock no padrão Windows: relógio à esquerda, mica no sign-in, perfil+nome+senha, SEM navbar; nada de pílulas 999px, bordas brancas, laranja no chrome, glow/dots decorativos.
- canvas #0a0a0b; superfícies #171717→#484848; sombras Linear com anel; hairlines 5%; raio 10px; micro 150ms.
- OS abre direto no desktop após boot ~2s; apps espalhados no desktop com logo no meio (nunca grade de cards); sem botão start — o menu abre clicando na LOGO; start flutuante 640px.
- topbar 48px acrylic rgb(32 32 32/75%) saturate(3) blur(20px); pins 38×38 r4 sem nome (nome no hover); indicador ::after 3px.
- ícones premium animados (gradiente dentro do glifo, 3 camadas) — ZERO lucide-react, só @fluentui/react-icons.
- tema claro+escuro (#0067c0/#4cc2ff, Mica dupla); reduced-motion respeitado.
- CSS 2026: @theme tokens, hierarquia linear, seções; sol.css único stylesheet.

### P2 — Autenticação e segurança
- contas no servidor: scrypt+salt, sessão bearer com sombra sha-256, cookie HttpOnly com rotação (30d) — login persistente de verdade; conta sobrevive a apagar cookies (re-login restaura tudo).
- OAuth com client-ids via env + exchange no servidor atrás do urlgate (recusa privado por RESOLUÇÃO).
- DevTools guard real (técnica Akash, timing trap, toggle do dono).
- DB inacessível ao visitante; prepared statements; sem captcha; self-hosted.

### P3 — Engines (saddle = sandbox/execução, vault = armazenamento, forge = runner)
- sandbox: lane do servidor (jail por sessão), modalidades do modalityregistry como fonte única, relatório nunca mente; simulador browser-pure só como fallback offline declarado.
- distribuições do saddle: max / light / palacial (containers) — preparar e publicar.
- storage: lane /api/v1/storage falando com o vault; quota do dono da conta; My Files real (upload/criar pasta/escrever).
- nada canônico no navegador do visitante; localStorage só cache descartável.

### P4 — Dados
- copy law: todo texto na labels table / lane de copy; sweep acha zero strings fora do accessor.
- janelas/ícones/labels: geometria e bindings no DB (OsAppWindow etc.), não no componente.
- estado (onboarding, plan) no Prisma; contas unificadas (fim do split raw-sqlite vs Prisma quando possível sem quebrar gates).

### P5 — Distribuição
- família @wenathlan/* sincronizada no npmjs (verificar `npm view` pós-merge); saddle incluído.
- containers max/light/palacial + ghcr; uma tag/uma release; workflows das 10 lanes verdes.

### P6 — Processo
- subagentes em ondas, leitura por sed em segmentos (nunca Read em arquivo grande), lotes de alterações por aterrissagem, bump só quando erro aparece depois de aterrissar, changelog antes do sync, `— step: <rung>` no commit, só main via PR squash (ou push direto quando a lane de PR não existir no ambiente).

---

## ESTADO ENCONTRADO (auditoria 1-c, base 2.0.150)

| Pilar | Estado | Evidência |
|---|---|---|
| Login/Auth | REAL no servidor (scrypt, cookie HttpOnly rotativo) | server.ts:1255-1353, authfamily.ts |
| Intro/landing | REAL (SaaS light "An OS built for every AI") — "Build for Ever AI" rosa NÃO existe na árvore | IntroSaassections |
| Naming | 4 stutters restantes (ImageImageengine, ImageImagestills, SettingsSettingstypes, ShellShellchrome) | widgets/ |
| Sandbox chat | REAL (lane servidor primeiro, fallback declarado) | sandboxlane.ts, server.ts:1102-1157 |
| My Files | PARCIAL — leitura real, escrita pendente | /api/v1/storage/objects POST existe, UI não usa |
| Vídeo | PARCIAL — fila honesta, sem playback/generation | Sol/video/ |
| Labels/copy | PARCIAL — copy na lane DB, labels ainda seed em código | CopyRow vs oslabels/chatlabels |
| Contas | SPLIT — raw sqlite fora do Prisma | accounts lane |
| Fluxo dev | GAP — `bun run dev` só sobe o vite; o gateway (3001) nunca sobe → toda lane real responde offline | package.json raiz |
| Workflows | REAL (10 lanes SHA-pinned) | .github/workflows |
| npm | devthink/vault/cadria@2.0.150 publicados; saddle travado em 2.1.6 no registro | npm view |

## ONDAS DE EXECUÇÃO (a partir daqui)

- **3-a Ambiente + fluxo dev real**: `bun run dev` sobe gateway 3001 + vite 3000 juntos; verificação browser do caminho dourado.
- **3-b Design**: auditar visualmente login/lock, intro, desktop, taskbar contra a régua; corrigir o que estiver fora do padrão (a queixa central do dono).
- **3-c De-mock**: My Files escrevendo na lane; vídeo com playback real; labels na lane DB.
- **3-d Naming/estrutura**: 4 stutters + imports/barrels.
- **3-e Distribuição**: saddle containers max/light/palacial verificados + caminho de publish preparado.
- **4 Aterrissagem**: commit em lote, push, verificação browser final, worklog.
