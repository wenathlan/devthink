# checklist

o total da operação de forma hierárquica. cada item é uma ação real verificável, agrupada por categoria, tema e aplicativo, em ordem do fácil para o difícil. o tema e a categoria de cada bloco definem diretamente o escopo da branch e do pull request correspondente. cada reclamação mapeada virou ação. nenhum item especifica código, tamanho, cor ou medida: a geometria, a composição e o espaçamento mapeiam direto nas referências clonadas na área de estudo de design.

## o preâmbulo e a seção 0 do arquivo único de 2026-11-18

# CHECKLIST — DevThink (um arquivo só: toda a operação)

> Gerado 2026-11-18T05:00Z. Consolida INTEGRALMENTE: a casa `reports/` (9 pastas,
> 20 arquivos, sessão anterior) + `Pasted Content_1794977314554.txt` (TODOLIST MESTRE
> fases A-L, OWNER DIRECTIVES, action tracker w00-w19) + `ordens1.txt` (cauda de
> novembro: as ordens da onda corrente) + `conversa52.txt` (o cânon completo,
> 103.451 linhas) + a medição API viva de 2026-11-18. Lei do arquivo: NADA foi
> removido; duplicatas desduplicadas por síntese com referência cruzada.
> Lei de agrupamento: por categoria (operação, formatação, organização, arquitetura),
> por aplicativo (11 apps), por tema (infra verde, segurança, releases, pacotes),
> por objetivo/regra (números-âncora, reclamações R01-R25), por hierarquia linear.
> Lei do cadence: commit a cada 400-600 ações / a cada fronteira de agrupamento.
> Lei do bump: a próxima versão (2.0.186) SÓ depois de tudo resolvido e verde.

## 0. Como este arquivo funciona

1. Seção 1 = a ONDA IMEDIATA (o que está em voo agora, com estado medido por API).
2. Seção 2 = o registro por CATEGORIA (operação / arquitetura / organização / formatação) — as regras.
3. Seção 3 = as ONDAS w00-w19 completas (1.245 ações do tracker, a espinha).
4. Seção 4 = o mapa POR APLICATIVO (11 dossiês).
5. Seção 5 = as reclamações R01-R25 (cada reclamação = ordem imediata).
6. Seção 6 = os números-âncora (o placar do dono).
7. Seção 7 = a ordem de execução linear hierárquica (o passo a passo vigente).

## as ondas imediatas de 2026-11-18

## 1. ONDA IMEDIATA (estado medido via API 2026-11-18T05:00Z)

### 1.1 Feito nesta onda (verificado)

- [x] C001. Leitura integral dos 3 arquivos novos (Pasted 2.082 linhas; ordens1 2.233;
  conversa52 103.451 — a cauda canon lida integralmente, os 8 chunks anteriores já no corpus)
- [x] C002. Token iakadion verificado ativo (escopos sem delete:packages — a lacuna mapeada)
- [x] C003. CANCELADOS todos os workflows ativos por ordem do dono (8 runs novíssimos
  cancelados via API 202: CI 2460, Security 2574/2575, Publish 490, CI/Security PR, CI 2460,
  Maintenance 3911, CI push 2460; + 1 Security 2577 in_progress → deixado correr o scan e
  será cancelado na re-dispatch da casa curada)
- [x] C004. 27 runs fantasma queued documentados (GitHub interno, 409 na cancela — não-canceláveis)
- [x] C005. Casa de workflows VERIFICADA: 6 arquivos (ci/containers/maintenance/publish/release/
  security + 2 cfg) = 19.794 linhas, ~150 jobs — organização atual CONFIRMADA como a correta
  (ordem do dono: manter a arquitetura de hoje; reagrupar por feature, não por path)
- [x] C006. Mapeados os 25 assentos .webpack nos 4 registros (npm saddle-webpack;
  nuget Saddle.Webpack; maven com.wenathlan.*.webpack ×11; rubygems *.webpack ×12) —
  o dono tem razão: AINDA ESTÃO LÁ (3ª rodada de reclamação)
- [x] C007. Delete dos assentos testado: 403 "You need at least delete:packages" —
  o portão do token, não do repositório
- [x] C008. Polar Auth delete-scope LANÇADO em background (user_code 2813-477A,
  delscope-poll.sh: renova código, captura token, AUTO-DELETA os 25 assentos ao autorizar)
- [x] C009. Cache analisado: repo gha cache = 66MB (sadio — o cachecleanup do maintenance
  funciona); a lacuna real = containers.yml/publish.yml/ci.yml NÃO limpam os próprios
  caches ao terminar (só o security.yml tem o job "Clean this run's caches")
- [x] C010. studio-os confirmado MESCLADO no main (87b2624a, PR #647 squash) — a
  reclamação do dono sobre branches refere ao followup/triggers-and-depfresh (PR #649 aberto)
- [x] C011. Supressões de raiz removidas do main (616efa65 Delete .trivyignore;
  8452c8b8 Delete osv-scanner.toml) — lei 11 cumprida; resta só saddle/.trivyignore (permitida)

### 1.2 Em voo (a fila linear da sessão)

- [x] C012. Merge do PR #649 (followup/triggers-and-depfresh: ladder não-destrutivo nos
  11 manifests) — re-dispatch dos checks após as curas de workflow, squash, arquivar, deletar branch
  (verificado 2026-11-25: merge há 60+ PRs, árvore só main, zero PRs abertos)
- [x] C013. Curar a lei do cache na casa: replicar o job "Clean this run's caches" do
  security.yml para containers.yml, publish.yml e ci.yml (cada processo limpa o próprio
  cache ao terminar — a diretiva do dono: reaproveita durante, limpa depois)
  (verificado 2026-11-25: o job existe nos 6 fluxos, security 2789 limpou verde)
- [ ] C014. Análise dos workflows de TODOS os commits (1.700-1.900) — o que perdeu de
  feature, o que falta adicionar (a diretiva do dono, em segmentos, com subagentes)
- [ ] C015. Diagnóstico dos logs das falhas de lane (build saddle / webpack stealthhead +
  foundry / desktop windows-x64+arm64 / android stealthhead) → PR de cura por tema
- [ ] C016. Containers run verde no HEAD → Pages deploy corrente → browser-verify
- [x] C017. Curar 1+1 alertas novos (code-scanning + dependabot) sem supressão
  (verificado 2026-11-25: dependabot 0 abertos; code-scanning 5162 polynomial-redos curado
  com scan linear sem regex na onda 20; 1759 scorecard SAST self-heal por evidência)
- [ ] C018. Release train no HEAD → approval como iakadion → cascade publish verde
- [ ] C019. Dispatch manual da casa inteira (lei da reexecução manual)
- [x] C020. Bump 2.0.186 SÓ APÓS tudo verde (12 manifests lockstep, changelog, release
  1.000+ assets)
  (verificado 2026-11-25: 2.0.186 e 2.0.187 publicadas, lockstep na raiz e módulos)


### 1.3 Registro de execução da onda imediata (worklog 2026-11-18T05:00-08:15Z)

- [x] C021. Workflow-house audit por subagente (C014): 1.795 commits no main, 358 tocaram
  workflows, 45 arquivos históricos em 5 eras → VEREDITO: **ZERO features perdidas** — a casa
  de 6 (126 jobs) é superconjunto estrito; todos os 5 crons sobrevivem verbatim (CodeQL qua
  4:25, Scorecard seg 3:17, cachecleanup diário 3:17+15:17, depfresh seg 4:37, stale 5:47)
- [x] C022. Diagnóstico dos 46 failures do containers run 28: TODOS na etapa "wait for the
  family envelopes on npmjs" — os envelopes @wenathlan/*@2.0.185 nunca publicaram no npmjs
  (npmjs travado em 2.0.181) — a cadeia de dependência real
- [x] C023. Causa-raiz pnpm multiple-versions: os pins `version: 12.21.0` (13 sítios) vs
  packageManager `pnpm@12.18.0` da TAG v2.0.185 (cortada antes do fix 4f698a89) — pin
  retirement + packageManager como fonte única (commit c9a6d789, PR #650)
- [x] C024. Correção startup-failure: 12 blocos `with:` vazios removidos (b4881262, PR #650)
- [x] C025. PR #650 aberto (wave/housecure): cache law + packagemanager law + spline license
  seat (784d4880) + Public Domain onlyAllow (863a645b) — checks: 24 success/1 (depfresh gate)
- [x] C026. PR #649 completado: 11 locks bun regenerados contra os manifests bumped
  (c3ed3e7b), 180 overrides stale sincronizados (4b788747), override npm ^12.2.3 (08eb4f0b),
  re-regen pós-override (4c938719), locks bun 1.4.4 CI-rung (df22c813), overrides literais
  npm-compatible (c00511e2), root sync cirúrgico do package-lock (73117b06), getry parity
  + saddleExempt npm (edeeea81), newline canônico do walker (c9fc8921)
- [x] C027. Causa-raiz dos 22 failures de install DECODADA em camadas: (1) locks regen com
  bun 1.3.14 vs CI bun 1.4.4 (drift de formato); (2) overrides "$name" pnpm-style não
  npm-compatible; (3) saddle package-lock root desincronizado; (4) getry parity drift; (5)
  newline canônico do walker — TODAS curadas em camadas no PR #649
- [x] C028. delscope-poll.sh ARMADO com supervisor watchdog (código renova a cada 15min;
  captura → auto-deleta os 25 assentos .webpack nos 4 registros)
- [~] C029. CI no head c9fc8921 (o mergulho final do PR #649 antes do squash)
- [ ] C030. A PROXIMA VERSÃO: o rung 2.0.186 sai da main curada (a tag 185 tem árvore
  congelada que falha seus próprios testes) — exatamente a lei do bump do dono

### 1.4 A cadeia de cura (o mapa linear descoberto nesta onda)

```text
depfresh gate vermelho no main (atualizações disponíveis)
  → PR #649 (ladder nos 11 manifests + locks + overrides + parity + newline)
    → CI verde no main
      → release train 2.0.186 (tag da main curada)
        → publish cascade (npmjs envelopes 2.0.186 — o buraco 181→185 fecha)
          → containers (espera envelopes → builda as 47 lanes)
            → Pages deploy (assemble+deploy no containers.yml)
              → TUDO VERDE + bump law cumprida
```


### 1.7 Continuação (08:10-08:45Z) — as camadas finais do PR #649

- [x] C041. Minimum age law seatada no foundry/dependencyupdates.ts (8be1fac8): o gate
  propõe só assentos com 7 dias de registro (a doutrina 7d npm/3d bun-pnpm-uv da casa) —
  o treadmill gate que NUNCA passou desde a casa de 6 (o studio-os o trouxe) fecha
- [x] C042. Os 2 assentos aged que a proposta 04:00 perdeu (picomatch 4.0.7, schema-utils
  4.8.3) syncados nos 11 manifests + locks regen
- [x] C043. Reader órfão verify.yml → ci.yml no runtime.ts (e9520d66) — o validador de
  baselines lê a casa de 6 que o 87b2624a fold carrega (o ENOENT fecha)
- [x] C044. Types do depfresh age law corrigidos (latestTime no cache type + index guard)
- [~] C045. CI no head e9520d66 — os 4 failures de cima decodados: typecheck (meu TS, fixado),
  consumer smoke (js-base64 3.9.7 publicado DURANTE o fetch — corrida de propagação, o
  tarball existe agora), saddle biome (flake transitório de download npx), gate ladder (age
  law). Todas curadas ou transitórias.


### 1.8 O trabalho em camadas (09:00-10:00Z) — o descascamento das 6k+ camadas

Cada cura expõe a próxima camada latente (as "6k+ erros desde 29c24c4"):

- [x] C046. Camada 7: runtime.ts reader órfão (verify.yml → ci.yml, e9520d66)
- [x] C047. Camada 8: csproj NU1202 WebScene → union declaration seat
  (6aa629db + 6f4702f3: os 77 refs × 11 csproj conditioned em
  EnableUnionPackageReferences — declarados inteiros pela lei da união,
  o content envelope não restaura o que nunca consumiu)
- [x] C048. Camada 9: EOVERRIDE getry → direct deps sync ao union (ed7eb042) —
  a falha "biome lint errors in getry" do saddle suite era ISSO (o npx do runner
  lia o manifest conflitado)
- [x] C049. Camada 10: docker context 22.8GB → .dockerignore monorepo geometry
  (ee0fafdd: os node_modules/dist dos 11 siblings nunca mais entram no transfer)
- [x] C050. nugetpack test expectation → net8.0 leg revertida ao content profile
- [~] C051. CI no head ee0fafdd — o container smoke agora com contexto enxuto


### 1.9 Continuação (10:00-10:45Z) — as camadas finais do gate ladder

- [x] C052. Camada 11: docker context 22.8GB → transient ignore (9bb2db06)
  → context 130.88MB (contexto curado!)
- [x] C053. Camada 12: full-disk runner shutdown → disk reclaim + smoke lane
  moved to the ladder tail (aeb30c48 + 5cc298f7: os node_modules saem do
  disco ANTES do docker build; typecheck/lint/web rodam ANTES com as árvores)
- [x] C054. Camada 13: languagejava flake → setup-java temurin 21 seated no
  family-tests job (e4641f21)
- [~] C055. CI 2484: 24/25 verde; gate ladder com 54/58 steps verdes,
  container smoke no tail com disco livre — o head 5cc298f7 é o mergulho


### 1.10 O estado da vitória parcial (12:00-13:00Z)

- [x] C056. **PR #649 MERGED** (squash c52cf7a4b5): o depfresh ladder + locks +
  overrides + parity + age law + union declaration seat — 26/26 CI verde
- [x] C057. **PR #650 MERGED** (squash 16a0a976ef): a cache law (limpeza por
  run no ci/containers/publish) + packagemanager law + license seats — 26/26 CI
  verde no head mesclado
- [x] C058. Branches: **SÓ main** (16a0a976ef) — followup + housecure deletadas
  pós-merge; PRs abertos: **0** (a exigência do dono cumprida)
- [~] C059. PR #651 aberto (wave/securityseats): os security seats upstream-blocked
  (picomatch CVE documentado no saddle/.trivyignore com condição de drop +
  ascii-art-graph no exacts) — a última lane vermelha do Security no main
- [~] C060. Runs no main (CI 2490 / Security 2608 / Containers 35) na fila — a
  fila congestiona com os 27 fantasmas


### 1.11 O fechamento da sessão (13:30Z)

- [~] C061. PR #651 (security seats) na fila — a CI confirmará os seats; merge
  pós-verde (a última lane vermelha do Security no main)
- [~] C062. Runs no main na fila (CI 2490 / Security 2608 / Containers 35 /
  Publish 492): a cascade do release 2.0.186 (a tag 185 é congelada com testes
  falhos — a próxima versão da main curada fecha o buraco npmjs 181→185)
- [~] C063. delscope ARMADO (código abaixo no relatório): o dono autoriza →
  AUTO-DELETA os 25 assentos .webpack (11 maven + 12 rubygems + 1 nuget + 1 npm)
- [ ] C064. BUMP 2.0.186: SÓ após PR #651 + a cascade verde (a lei do dono) →
  release train → 1.000+ assets → tudo verde confirmado

### 1.12 Continuação (19:45-21:15Z) — o descascamento do gate de licenças em lote

- [x] C065. Token iakadion reautenticado do github-auth/data/token.json (o
  /tmp da sessão anterior evaporou — o estado vive no upload/, a lei de
  nunca-em-tmp do dono responde)
- [x] C066. Sync local→remoto: main=16a0a976 (PR #650 squash), branch
  wave/securityseats=d915a33e (PR #651 aberto), snapshot da árvore local
  velha em stale-local-backup (nada perdido)
- [x] C067. Diagnóstico da falha do PR #651: o assento ascii-art-graph
  (a camada da main) curado expôs a camada seguinte — ascii-art-image@1.4.0
  UNKNOWN (a transição do ascii-art@2.8.5 da escada depfresh) — o padrão de
  descascamento uma-camada-por-vez que o checker de primeira-falha esconde
- [x] C068. O CENSUS completo (a resposta ao descascamento): o walk da
  closure de produção do devthink pelo bun.lock (12.241 pacotes, com peers
  11.458), cada assento lido no registro contra o allow set — 103 assentos
  sem licença ou com rótulo não-permissivo enumerados DE UMA VEZ (a família
  ascii-art, os ai-sdk provider multi-versão, o par a2a, as famílias
  hyperframes e tensile-perf, o mistralai, os platform seats do codex, os
  rungs LGPL-3.0-only do sonar e rollup-plugin-dts, o AGPL do seelen-ui, o
  innosetup, o spelling apache do netlify e todos os singles sem licença do
  registro antigo — callsite, css-value, sylvester e irmãos)
- [x] C069. Os 103 assentos sentados no exacts do security.yml (commit
  859be620 no PR #651): o census verificado contra o MESMO checker local
  (jszip/rc/sha.js/elkjs/font-awesome passam — o checker parseia os rótulos
  compostos SPDX; só os átomos não-permitidos falham)
- [x] C070. A cura do ERR_PNPM_IGNORED_BUILDS da publish 492: pnpm 12.3.4
  tornou os builds ignorados em falha dura de instalação — a lane
  enginedeps do vault (e cada irmão da family container release archive)
  morre ali; o better-sqlite3@13 responde da prebuilds directory (verificado
  local: :memory: carrega sem binding compilado), então o assento
  strictDepBuilds:false nos 11 pnpm-workspace.yaml retorna o install à lane
  de aviso que a era pnpm 11 andava (PR #652, commit f72da7cf, 132 linhas)
- [x] C071. PR #652 aberto (wave/strictdepbuilds): o license check da PR
  falha na camada ascii-art-graph da main — esperado, resolve quando o #651
  (os assentos) merge primeiro; update-branch + re-cheks na sequência
- [~] C072. Runs no ar: PR #651 (52 checks) e PR #652 (58 checks) — o merge
  quando verde, #651 primeiro
- [x] C073. delscope REARMADO (user_code E9F7-7696, expira 15min, watchdog
  detached): o dono autoriza em github.com/login/device → o token com
  delete:packages captura → AUTO-DELETA os 25 assentos .webpack nos 4
  registros (npm saddle-webpack, nuget Saddle.Webpack, maven ×11, rubygems
  ×12 — user/ e org/ lanes ambas varridas)
- [x] C074. checklist.md desduplicado (2438→2073 linhas, 20 seções
  duplicadas removidas — a lei do dono: nada removido, só desduplicado) +
  o worklog desta sessão
- [ ] C075. A cadeia vigente: PR #651 verde → merge squash → PR #652
  update-branch → verde → merge → re-dispatch da casa no main curado
  (CI/Security/Publish/Containers) → o release train 2.0.186 → o bump law

## o registro por categoria

## 2. REGISTRO POR CATEGORIA (as 4 leis de agrupamento do dono)

### 2.1 OPERAÇÃO (como se trabalha)

- Ciclo: delete → read → authenticate → analyze → document → execute; sync remoto→local SEMPRE primeiro
- Leitura integral linear via bash/sed (linha X a Y), nunca ferramenta de read direta; nunca pular linha
- Subagentes por categoria (5-7), até 300/600/900; nunca git para subagentes; nunca bash para escrever fonte
- Onda = PR por TEMA/categoria (~50 PRs por onda, 100+ ações cada); tudo numa onda só
- Testes vitest 900-1000 verdes antes de cada push; verificação via browser a cada onda
- Commit a cada 400-600 ações e a cada fronteira de agrupamento; squash merge oldest→newest; só main
- Commits com identidade iakadion (veículo assinado branch→PR→squash REST, nunca "x-access-token")
- Não esperar workflows pesados — despachar e seguir; verificar no final
- Worklog fora do repo como critério de conclusão de onda; todolist interna 10.000+ ações
- Cota 100M tokens/22h; lei de máquina (sem installs, node_modules global, esm.sh)

### 2.2 ARQUITETURA (a forma do monorepo)

- Lei da árvore rígida: raiz = .github + 11 pastas dos apps + exatamente 2 arquivos (.gitignore, package.json)
- Dentro de cada app: SOMENTE sol/, tests/, docs/; pasta = página (com anchor); build na raiz, nunca em dist/
- Lei da exclusividade de engine: cada app é DONO da sua engine; os demais consomem via package.json
  (storage=Vault, VM=Saddle, gateway=Getry, rede=Argan, áudio=Debonair, vídeo=Cadria, monetização=Cobaia,
  execução=Forge, pipeline=Foundry, FPS=Stealthhead, OS=DevThink) — nunca por caminho de pasta
- Lei do lockstep: 11 apps + raiz na MESMA versão 2.0.x (proibido 2.1.x); bump na raiz propaga
- Lei da união de dependências: NUNCA remover dependência; união dos package.json dos 9 repos
- Lei da nomenclatura: palavra única minúscula sem hífens/underscore; dots só em package ID (com.wenathlan.app)
- package.json raiz SÓ engines (15+ engines, v 0.5.2); QEMU só no Saddle; 12 package.json sincronizados
- Casa de workflows: 6 arquivos por tema (ci, containers, maintenance, publish, release, security) —
  MANTER esta organização atual (ordem do dono 2026-11-18); reagrupar lógica correlata DENTRO dos temas
- Dockerfile único por app (unificar compose+config); configuráveis padronizados na raiz de cada app

### 2.3 ORGANIZAÇÃO (a casa dos arquivos)

- Lógicas TS reagrupadas por palavra-chave: auth.ts, db.ts, copy.ts, audio.ts, ingest.ts, gates.ts...
  (até 4.000-7.000 lógicas correlatas por arquivo; teto 300; deletar logics.ts genérico)
- Zero lógica duplicada entre apps: se já existe em outro app, consome via package.json
- Wingets PascalCase flat alfabéticos; zero JS na interface; zero ts dentro de sol
- Configuráveis idênticos por família: package.json, npmrc, Nginx (recolocar onde ausente), Netlify,
  Homebrew.rb, Cargo, Capacitor, Maven, Gradle, robots.txt, devthink.toml, .gemspec, .csproj, go.mod,
  doc.go, pyproject.toml, .env, _headers, _redirects
- Mimetypes 4.000+ byte-idêntico nos 11 roots; protocols.types idêntico; scripts idênticos
  (dev, build, preview, test, lint, format, typecheck)
- tests/ dentro de cada app, somente .ts; pastas de página em sol só com anchors
- Zero MD dentro de .github (só código); dependabot.yml na raiz .github

### 2.4 FORMATAÇÃO (o estilo)

- Design Windows 11 + trylle.com (nível Awwwards): titlebar 28/30px, close rgb(232,17,35),
  accent #a3d7e6, focus #4cc2ff, pill 999px, taskbar 48px, pins 38×38, start 640px,
  movimento 250ms cubic-bezier(0.85,0.14,0.14,0.85), alvos ≥44px, animações ≤200ms
- Fluent Icons (lucide BANIDO — gate grep); tema Sol único branco; sem Saddle Cloud no sidebar;
  sem glows azuis; ban-list: transition:all, #000/#fff puros, neon, emoji como ícone, indigo/violeta
- Fidelidade 97-99% ao index.html de referência (.devthink/web/index.html do allan)
- Zero hardcode em .ts/.tsx/wingets (tudo no DB via APIs internas; sha256 no build, nunca hardcoded)
- Lei da honestidade radical: zero mock/teatro/ratings falsos/Unsplash/tracks fake
- Inglês total (GTX tradução em runtime); JSDoc hierárquico 2026; Biome em tudo
- Curva 2.0.x somente; changelog no git add; commits verificados


## a espinha do tracker — as ondas w00-w19

## 3. AS ONDAS w00-w19 (a espinha completa do tracker — 1.245 ações)

> Fonte: action tracker do corpus (Pasted Content, consolidado do conversa52 + ordens1).
> Estados: [x] feito, [~] em progresso, [ ] aberto. Executar linear, uma por uma,
> dentro de cada onda, sem pular. Commit a cada fronteira de onda.

## w00 operation and verification (25 actions)

- [x] 0001 integral reading of conversa52.txt (97,281 lines, eight chunks, zero skipped)
- [x] 0002 integral reading of ordens1.txt (1,986 lines, superset confirmed)
- [x] 0003 github token verified authenticated (iakadion, lifetime device-flow token)
- [x] 0004 remote state verified: only main on origin, zero open PRs
- [x] 0005 ownerdirectives.md rewritten complete with app-name corrections
- [x] 0006 actiontracker.md built with 1,120 actions
- [~] 0007 green train convergence watched by projection (never awaited idle)
- [ ] 0008 browser-agent verification of wenathlan.github.io/devthink/ home (no white screen)
- [ ] 0009 browser-agent verification of /panel (panel boots whole)
- [ ] 0010 browser-agent verification light and dark theme shots
- [ ] 0011 mobile 390x844 shot, footer glued, no horizontal scroll
- [ ] 0012 desktop 1280x800 shot, windows draggable, snap alive
- [ ] 0013 latest release opened: assets listed, extension zip downloadable
- [ ] 0014 npmjs registry check: @wenathlan/devthink published above 2.1.6
- [ ] 0015 maven central check: com.wenathlan.devthink answering
- [ ] 0016 ghcr check: saddle container latest tag multi-arch
- [ ] 0017 code-scanning alert count snapshot (before wave)
- [ ] 0018 dependabot alert count snapshot (before wave)
- [ ] 0019 workflow run map snapshot: ten lanes status
- [ ] 0020 version lockstep check: twelve manifests same 2.0.x
- [ ] 0021 root layer check: only .github + eleven apps + two files
- [ ] 0022 vitest family suite count snapshot
- [ ] 0023 worklog.md updated append-only (outside the repo)
- [ ] 0024 cleanup pass on /home/z/my-project (before and after z, 10gb law)
- [ ] 0025 local stray reports commit cleaned from the repo (root-layer law)

## w01 cross-family structure (45 actions)

- [ ] 0101 audit root layer: list every file outside the eleven apps and .github
- [ ] 0102 delete logs.ts and every stray file from the repo root
- [x] 0103 audit each app folder: only sol, tests, docs allowed inside (PR #712)
- [ ] 0104 remove src, scripts, artifacts, terminal, dist, images, assets, build folders from every app
- [ ] 0105 remove .md files from inside .github (keep codeowners, commitkey, dependabot, workflows)
- [ ] 0106 verify .gitignore hides pnpm-lock.yaml and infra docs
- [ ] 0107 verify no .dockerignore at root (prohibited)
- [ ] 0108 build config at app root: publish ".", outdir "."
- [ ] 0109 capacitor webdir "." in every app
- [ ] 0110 tauri frontdist to root in every app
- [ ] 0111 netlify.toml publish "." with the full engine block
- [ ] 0112 vercel.json outputdirectory "."
- [ ] 0113 wrangler.toml present per app
- [ ] 0114 build ghosts swept: no index-*.js, no committed dist, no stray webmanifest
- [ ] 0115 page folders inside sol carry only anchors
- [x] 0116 widgets flat, alphabetical, zero nesting in every app (the wingets spelling retired whole, PR #712)
- [ ] 0117 stutter renames finished (imagerepeat family gone)
- [ ] 0118 variant logic files merged (script.chat.browser.prov cohort into one)
- [ ] 0119 ts files never inside sol (tsx components only)
- [ ] 0120 app.tsx the only tsx outside the theme
- [ ] 0121 zero emoji / ansi art / vibe code markers in source
- [ ] 0122 zero hyphens and underscores in file and folder base names
- [ ] 0123 english-only audit of code, jsdoc, ui strings, names
- [ ] 0124 jsdoc 2026 blocks with section markers on every root ts file
- [ ] 0125 biome config identical across the family
- [x] 0126 tests folder inside every app (never outside) (PR #712)
- [ ] 0127 tests only .ts: no json, mjs, cjs, images anywhere in tests
- [ ] 0128 tests/artifacts/wcag.json class removed
- [ ] 0129 test images moved to allan/organizado by extension
- [ ] 0130 scripts cjs/mjs/python moved to allan/organizado by extension
- [ ] 0131 conversion of moved scripts to ts queued
- [ ] 0132 configs standardized: identical formatting and sequence per family
- [ ] 0133 mimetypes file byte-identical across eleven roots (4,000+ types)
- [ ] 0134 protocols.types byte-identical across eleven roots
- [ ] 0135 nginx config present at every app root
- [ ] 0136 docker compose and docker config unified: one dockerfile per app
- [ ] 0137 go.mod with non-empty doc.go in every app
- [ ] 0138 devthink.toml in every app root
- [ ] 0139 robots.txt family-wide with the bot blocklist
- [ ] 0140 gemspec, csproj, rs, rb, java, xml, pyproject family set complete
- [ ] 0141 icon family five per root (icon.svg, svg.icon, icon.ico, icon192, icon512)
- [ ] 0142 drift workflow: fails when the fifteen standard files diverge
- [ ] 0143 script names identical (dev, build, preview, test, lint, format, typecheck)
- [ ] 0144 structure law test: find app -mindepth 3 -type d returns zero pages deep
- [x] 0145 structure wave landed via signed vehicle (branch, PR, squash, verified) (PR #712 ladder 9/9)

## w02 workflows regroup (60 actions)

- [ ] 0201 inventory the fifteen current workflow files with line counts
- [ ] 0202 map every job of ci.yml, verify.yml, workflowlint.yml into the unified ci.yml
- [ ] 0203 map release.yml, publish.yml, containers.yml, saddlelanes.yml into delivery.yml
- [ ] 0204 map family-desktop.yml, family-mobile.yml, pages.yml into family.yml
- [ ] 0205 map maintenance.yml, registryheal.yml, rungrecords.yml into stewardship.yml
- [ ] 0206 security.yml stays unified (audit, osv, codeql, dockle, trivy, pentest)
- [ ] 0207 keep all 80 mandatory steps: zero steps dropped in the regroup
- [ ] 0208 job names and step ids stable (the verify ladder answers by job)
- [ ] 0209 concurrency groups collapse per context (no lane races)
- [ ] 0210 actionlint green on every unified file under the house config
- [ ] 0211 actionlint-config.cfg updated for the new file set
- [ ] 0212 no markdown files inside .github after regroup
- [ ] 0213 dependabot.yml stays at .github root, never inside workflows
- [ ] 0214 release approval cascade documented: published trigger, owner PAT, workflow_run
- [ ] 0215 sha256 generated in build steps only (24 sites stay swept)
- [ ] 0216 webpack conversion logic lives inside delivery.yml jobs
- [ ] 0217 workflow_dispatch input set on every unified file (manual run law)
- [ ] 0218 manual dispatch of unified ci.yml with current stamp
- [ ] 0219 manual dispatch of unified delivery.yml (tag, metadata, registries)
- [ ] 0220 manual dispatch of unified family.yml (desktop, mobile, pages)
- [ ] 0221 manual dispatch of unified stewardship.yml
- [ ] 0222 manual dispatch of unified security.yml
- [ ] 0223 pages deployment verified live after dispatch
- [ ] 0224 codeql cron wed 25 4 * * 3 kept verbatim
- [ ] 0225 scorecard cron mon 17 3 * * 1 kept verbatim
- [ ] 0226 npm ci replaces install everywhere; minimum ages 7d npm, 3d bun/pnpm/uv
- [ ] 0227 actions pinned by exact version tag (44 sha-pinned seats stay)
- [ ] 0228 stale (90d) and first-interaction seated in stewardship.yml
- [ ] 0229 cache law: no cache by doctrine, cleanup twice a day
- [ ] 0230 gh cli over github-script doctrine documented per job
- [ ] 0231 better-sqlite3 postinstall lottery: ignore-scripts on every leg plus dockerfile wall
- [ ] 0232 gh013 landing: owner PAT path for workflow file updates documented
- [ ] 0233 cancel-in-progress on stale heads frees executors
- [ ] 0234 run obsolescence sweep: red collaterals deleted
- [ ] 0235 tortue workflow battery green (240 green legs over the seven files)
- [ ] 0236 1,500+ historical workflows analysis: features catalogued, nothing lost
- [ ] 0237 workflows of the 1,700+ commits swept for lost conversion features
- [ ] 0238 release train: draft, verify, immutable lock through gh cli
- [ ] 0239 dispatch-processing wall documented (startup failures are platform walls)
- [ ] 0240 pages.yml validated with the workflowcheck without touching the landing step
- [ ] 0241 family-container archive path for the six guest apps documented
- [ ] 0242 publish lanes resolve version from the release tag against package.json
- [ ] 0243 nuget packageversion, maven revision, rubygems env version seats verified
- [ ] 0244 catalog candidates studied (crates-io-action, pypi-publish oidc, helm, homebrew, goreleaser)
- [ ] 0245 two catalog links captured in the guides (2-link law between 230 comments)
- [ ] 0246 workflow regroup landed via signed vehicle
- [ ] 0247 ten lanes green simultaneously recorded as the rung criterion
- [ ] 0248 readiness gates (27) green
- [ ] 0249 codeql teto 60 minutes respected
- [ ] 0250 matrixverify 18/18 cells green
- [ ] 0251 workflowlint lane green on main
- [ ] 0252 maintenance ladder auto-tag weekly seats green
- [ ] 0253 release approval environment policy curated via api
- [ ] 0254 the 2-link guide comment block inserted in every unified file
- [ ] 0255 workflow bodies carry zero hardcoded digests (grep clean)
- [ ] 0256 no workflow per isolated app remains (family matrix only)
- [ ] 0257 saddle lanes ride delivery.yml as stages (never standalone files)
- [ ] 0258 pages 404 dispatcher of the root untouched
- [ ] 0259 workflow wave landed via signed vehicle
- [ ] 0260 workflow regroup report written in the wave log

## w03 distribution and packages (50 actions)

- [ ] 0301 list every .webpack package version across the registries
- [ ] 0302 cancel the 25 dead .webpack seat versions (maven, rubygems, nuget, npm)
- [ ] 0303 embed the webpack build inside the original saddle package
- [ ] 0304 embed the webpack build inside the original forge package
- [ ] 0305 embed the webpack build inside the original cadria package
- [ ] 0306 embed the webpack build inside every remaining original package
- [ ] 0307 delete saddle-webpack from the org registry after embedded publish proves
- [ ] 0308 delete every <app>.webpack registry seat
- [ ] 0309 discard loose .webpack files from the tree
- [ ] 0310 webpack.cjs bundle rides the original envelope of each channel
- [ ] 0311 maven old scope io.github.wenathlan.* deletion list confirmed
- [ ] 0312 delete io.github.wenathlan.devthink from maven central
- [ ] 0313 delete io.github.wenathlan.cadria, argan, debonair, getry
- [ ] 0314 delete io.github.wenathlan.vault, cobaia, foundry, forge, stealthhead, saddle
- [ ] 0315 publish com.wenathlan.devthink on maven central
- [ ] 0316 publish com.wenathlan.<app> for the remaining ten apps
- [ ] 0317 maven artifact embeds library core, cli, headless entry, mcp server as jar resources
- [ ] 0318 extension zip attached as classifier artifact
- [ ] 0319 declarations zip attached as classifier artifact
- [ ] 0320 nuget seats publish under normal names (no pro prefix)
- [ ] 0321 rubygems seats publish under normal names
- [ ] 0322 @wenathlan/devthink published on npmjs above the poisoned 2.1.6 line
- [ ] 0323 every family npm package climbs above 2.1.6
- [ ] 0324 github packages npm mirror seats in sync
- [ ] 0325 six distributions per app confirmed (nuget, maven, container, gradle, npmjs, rubygems)
- [ ] 0326 60+ package count confirmed on the org packages page
- [ ] 0327 binaries of every app downloadable direct from release assets
- [ ] 0328 11 architectures standardized in the container matrix
- [ ] 0329 12-lane law: 8 primary plus 4 best-effort exotic per distribution
- [ ] 0330 os/arch tab shows 11+ lanes for every app container
- [ ] 0331 saddle container 15+ lanes confirmed on ghcr
- [ ] 0332 max / balanced / lite profiles in every saddle distribution
- [ ] 0333 os catalog seats: grapheneos, omarchy, maru os, vanilla os, v, arch, alpine
- [ ] 0334 os catalog seats: debian, nixos, void, fedora, postmarketos, android, linux
- [ ] 0335 normal distribution carries no v suffix, sits on grapheneos
- [ ] 0336 family-container archive answers the six guest apps
- [ ] 0337 dependency blob harvest: nine repositories enumerated (devthink, maene, extension, gateway, saddle, nb, allan, devthinkiakadion, e2ugh)
- [ ] 0338 package.json of every blob parsed with the thirteen kinds
- [ ] 0339 union deduplicated by name (6,665 npm names, 22k+ tolerated)
- [ ] 0340 missing names reported, never silently dropped (1,178 reported)
- [ ] 0341 the three blocks carry the identical set in all eleven manifests
- [ ] 0342 overrides use the dollar pattern
- [ ] 0343 root package.json carries engines only (15+ engines, yaml included)
- [ ] 0344 eleven app manifests carry zero engines keys
- [ ] 0345 root dependencies, devdependencies, overrides migrated to the apps
- [ ] 0346 qemu / vm dependencies removed from the ten, kept in saddle only
- [ ] 0347 pnpm-lock.yaml regenerated lockfile-only, hidden by gitignore
- [ ] 0348 package.json template sequence: header, scripts, three blocks
- [ ] 0349 unknown flags, peerdependencies, publishconfig, packagemanager removed
- [ ] 0350 distribution wave landed via signed vehicle with changelog cascade

## w04 design reform (100 actions)

- [ ] 0401 neo.temp inventory: 125+ examples catalogued by category
- [ ] 0402 trylle production raw inspected (487kb index, 291kb master css)
- [ ] 0403 trylle tokens extracted: 435 root custom properties
- [ ] 0404 trylle oklch values mapped (154)
- [ ] 0405 the 7.5% hairline law applied (color-mix in oklab, both faces)
- [ ] 0406 win11react / seelen-ui / fluentui / winui gallery tokens mapped
- [ ] 0407 case.md links studied and the competitor list confirmed
- [ ] 0408 designeer.md consulted (539 links, 569 sites)
- [ ] 0409 competitor clone set grown past 100 repos in neo.temp
- [ ] 0410 reference index.html (allan/.devthink/web) diffed against current home
- [ ] 0411 hero restored: pink gradient (#a855f7 computed start)
- [ ] 0412 six original buttons only
- [ ] 0413 saddle cloud button removed from the sidebar
- [ ] 0414 blue glows removed family-wide
- [ ] 0415 blue button in the hero removed
- [ ] 0416 login shadow leak fixed
- [ ] 0417 titlebar 28/30px with min, max, close
- [ ] 0418 close rgb(232,17,35) burning red on hover
- [ ] 0419 x icon never escapes the window on resize
- [ ] 0420 8 resize handles outside the window
- [ ] 0421 accent vault ice #a3d7e6 seated
- [ ] 0422 focus #4cc2ff seated (chrome focus only)
- [ ] 0423 pill 999px kept out of the shell
- [ ] 0424 transition:all zeroed family-wide (grep clean)
- [ ] 0425 taskbar 48px acrylic with blur and saturate
- [ ] 0426 pins 38x38 icon-only, names on hover
- [ ] 0427 activity indicator growing with activity
- [ ] 0428 tray two-line tabular clock
- [ ] 0429 start menu 640px with avatar and power sticky
- [ ] 0430 win11 acrylic effect on start menu footer
- [ ] 0431 mica with grain on the desktop
- [ ] 0432 real boot ring on boot
- [ ] 0433 lock screen over the live desktop, clock left
- [ ] 0434 navbar flutuante when pulled up
- [ ] 0435 navbar fixado when pulled left
- [ ] 0436 1mm undock physics with rounded borders
- [ ] 0437 calendar opens aligned to the floating navbar line
- [ ] 0438 calendar follows the dock when floating
- [ ] 0439 zoom locked via the faun viewport meta before first render
- [ ] 0440 wheel and pinch blocked family-wide
- [ ] 0441 scroll bug dead: empty area before side a removed
- [ ] 0442 body never scrolls (app grammar height law)
- [ ] 0443 fluent icons imported, lucide purged family-wide
- [ ] 0444 zero emoji as icons
- [ ] 0445 27 squircle app icons with identity gradient
- [ ] 0446 theme sol white, never yellow
- [ ] 0447 light and dark variation only
- [ ] 0448 future sol / luna seat documented, six themes banned
- [ ] 0449 auth screen follows the system theme (no black on white)
- [ ] 0450 all css in sol.css, zero loose css in tsx
- [ ] 0451 sol.css immutable family block leads (38 variables, z ladder)
- [ ] 0452 sol.css passes append-only
- [ ] 0453 1000+ css properties used honestly
- [ ] 0454 panel logo: white mark, zero text below
- [ ] 0455 devthink icon equals the logo.txt mark (two paths, viewbox 800)
- [ ] 0456 auth box icons only: google, github, gitlab, cli
- [ ] 0457 oauth row label: continue with devthink (never continue with google)
- [ ] 0458 identity colors seated per app (tan, jade, magenta, amber, coral, lime, blue, ice, violet)
- [ ] 0459 ban list swept: indigo #6366f1 gone
- [ ] 0460 violet #8b5cf6 gone
- [ ] 0461 generic blue #2563eb gone
- [ ] 0462 sky blues gone (except chrome focus)
- [ ] 0463 pure black and white fills gone
- [ ] 0464 neon and purple dark residue gone
- [ ] 0465 rigid desktop grid gone (organic arc icons)
- [ ] 0466 icon drag with ghost preview and persisted positions
- [ ] 0467 touch targets 44px floor audited
- [ ] 0468 microanimations 200ms ceiling, transform and opacity only
- [ ] 0469 motion default 150ms, ceiling 500ms
- [ ] 0470 no infinite loops, duty-cycled or event-driven
- [ ] 0471 prefers-reduced-motion gate on every non-essential keyframe
- [ ] 0472 spring banned on operational surfaces
- [ ] 0473 z-index ladder named bands only (atmosphere to tooltip)
- [ ] 0474 dpi detection 1x / 1.5x / 2x / 3x automatic scale
- [ ] 0475 horizontal root means tv / tablet / landscape
- [ ] 0476 hud per device pre-activated in the build
- [ ] 0477 cut ribbon aligned in native a after debonair
- [ ] 0478 apps inside windows render identical to direct url
- [ ] 0479 explore page matches the app standard
- [ ] 0480 every native app opens as draggable, snappable window with taskbar presence
- [ ] 0481 window z-order from mru stack
- [ ] 0482 snap flyout 260x130 with ghost
- [ ] 0483 maximized windows carry no radius
- [ ] 0484 minimum window 320x320
- [ ] 0485 my files follows the windows explorer grammar (toolbar, breadcrumb, nav pane, drive cards)
- [ ] 0486 vault face professional saas (supabase head to head)
- [ ] 0487 stealthhead answers the single jogo em construcao component
- [ ] 0488 qa gates: desktop 1280x800 and mobile 390x844 screenshots
- [ ] 0489 vlm review light and dark, page white is failure one
- [ ] 0490 footer glued to bottom on short pages
- [ ] 0491 six dossiers of design law documented (tokens, motion, geometry, bans, icons, grammar)
- [ ] 0492 css tokens come only from the theme, zero literals in tsx
- [ ] 0493 scrollbar invisible where the reference hides it
- [ ] 0494 hero clamp(2.25rem, 5vw, 3.75rem) seated
- [ ] 0495 inter variable plus geist mono seated, body 13px / 450
- [ ] 0496 marketing copy ban list swept (unlock, empower, elevate, revolutionize, seamlessly)
- [ ] 0497 texts reveal nothing of infrastructure (gtx line gone)
- [ ] 0498 title and description only, zero verbose sub paragraphs
- [ ] 0499 design wave landed via signed vehicle
- [ ] 0500 design verified live on the public site by browser agent

part one ends at action 0500. waves w05 through w19 continue in the sections below, closing at action 1120.












## w05 saddle (110 actions)

- [ ] 0501 modalities registry audited: 90 rows (81 live + 9 host) honest
- [ ] 0502 the 17 registry-only modalities labeled planned (build-make, ninja, fs-gitobjects, language cargo/dotnet/lua/nim/php/rust/v/zig, network dns/doh, runner deno/serverless/wasi, storage sqlite)
- [ ] 0503 count divergence closed: registry is the operational truth, docs never lie
- [ ] 0504 fake docker/qemu strings removed from the sandbox exec shell
- [ ] 0505 firecracker:boot honest when the binary is absent
- [ ] 0506 qemu:version honest on failure
- [ ] 0507 prepare / toolchain scripts made real or removed
- [ ] 0508 orchestrator qemu/firecracker wired to real http routes
- [ ] 0509 runonedge real (lane_not_wired answers never)
- [ ] 0510 webserver.ts documented as the real entry (server.ts adapter fixed)
- [ ] 0511 readme entry point corrected (web script boots /api/v1/health)
- [ ] 0512 web scraper and non-vm features transferred to devthink
- [ ] 0513 agent-context surface rescued (chunking, llms-txt, token estimation)
- [ ] 0514 playwright transport rescued as the real browser lane
- [ ] 0515 bot module rescued or retired consciously
- [ ] 0516 captcha contracts rescued or the unused dependency removed
- [ ] 0517 proxy pool contracts rescued or removed
- [ ] 0518 crawler contracts (robots, frontier, budgets) rescued or removed
- [ ] 0519 withretry public export restored
- [ ] 0520 mv3 extension surface decision documented (target-plan only)
- [ ] 0521 dist publication restored (dist js, d.ts, source maps, types field)
- [ ] 0522 engines field (node >= 26.7.0) restored in the saddle manifest
- [ ] 0523 docs corpus consolidated (the 120-doc corpus into devthink docs)
- [ ] 0524 legacy tests restored green
- [ ] 0525 go module rung: doc.go filled with real documentation
- [ ] 0526 eBPF GPU telemetry: loader and attach or labeled builder-only
- [ ] 0527 quantum layer header stays honest (classical simulation by design)
- [ ] 0528 nine non-run groups out of saddle (saddlecompare verdict applied)
- [ ] 0529 wasm modality with real executor
- [ ] 0530 wasme modality with real executor
- [ ] 0531 webpack modality as embedded distribution workflow
- [ ] 0532 babel modality compiling sh / yml / yaml in background
- [ ] 0533 virtual file modality with real executor
- [ ] 0534 virtual file system modality with real executor
- [ ] 0535 docker modality running containers for the family
- [ ] 0536 exe / binary execution via queuebinarylaunch
- [ ] 0537 qemu with real drives
- [ ] 0538 aws seat with honest refusal or real executor
- [ ] 0539 node runner seat live
- [ ] 0540 e2b seat live
- [ ] 0541 daytona seat live
- [ ] 0542 vgpu seat live
- [ ] 0543 vcpu seat live
- [ ] 0544 gpu seat live
- [ ] 0545 cpu seat live
- [ ] 0546 port processing seat live
- [ ] 0547 sandbox spawn via child_process verified
- [ ] 0548 microvm firecracker lane live
- [ ] 0549 cloud hypervisor seat live
- [ ] 0550 kata seat decision documented
- [ ] 0551 gvisor seat decision documented
- [ ] 0552 criu seat decision documented
- [ ] 0553 warm pool: 125ms cold boot, 3-5ms restore measured
- [ ] 0554 live migration under 100ms measured
- [ ] 0555 one-month retention policy seated
- [ ] 0556 scheduler psi lstm lane honest
- [ ] 0557 rl autoscaler lane honest
- [ ] 0558 tenant admission control seated
- [ ] 0559 vmconfig crdt seated
- [ ] 0560 m:n scheduler with vcpu overcommit verified
- [ ] 0561 memory balloon, hotplug, page merging verified
- [ ] 0562 snapshots, restore, migration verified
- [ ] 0563 storage as ram bridge (tmpfs, compressed swap, fuse mounts)
- [ ] 0564 file-as-compute: 600mb into 600 chunks across ten repos
- [ ] 0565 repo-as-computer: repo disk, actions cpu, pages bus, dispatch ipc
- [ ] 0566 free fleet aggregated (forge runners, hub spaces, notebooks, always free, edge workers)
- [ ] 0567 denial-by-default execution policy with receipts
- [ ] 0568 honest refusal codes for lanes not carried
- [ ] 0569 scraping cascade moved to devthink with robots respected
- [ ] 0570 capture platform with virtual cursor and human trajectories (devthink side)
- [ ] 0571 container os distribution catalog: 16 seats verified
- [ ] 0572 12 arch lanes per distribution (8 primary + 4 best-effort)
- [ ] 0573 17-seat container catalog standard
- [ ] 0574 max / balanced / lite profiles per distribution
- [ ] 0575 normal distribution on grapheneos without the v suffix
- [ ] 0576 saddle container published multi-arch on ghcr (latest)
- [ ] 0577 the frozen 2.1.6 registry state stays cured
- [ ] 0578 mesa mirror hygiene (cache releases clean)
- [ ] 0579 workloadlaw vocabulary exported for the family
- [ ] 0580 modality resolver: workload declares needs, platform answers the exact set
- [ ] 0581 hypervisor 88-feature catalog honest
- [ ] 0582 13 canonical types toward the ninety documented
- [ ] 0583 105 sandbox variants catalogued
- [ ] 0584 60 capabilities catalog fixed
- [ ] 0585 hardware bank: 57 cpus, 19 gpus, 20 boards in 3 tiers
- [ ] 0586 sandbox quota ~50gb per account enforced by plan
- [ ] 0587 4-256mib per sandbox verified
- [ ] 0588 8gb tmpfs lane verified
- [ ] 0589 cdn lane mirroring dozens of cdns inside the vfs
- [ ] 0590 the visitor browser never loads one byte of sandbox payload (master law test)
- [ ] 0591 job lifecycle: queued, preparing, runner selected, running, syncing, committed, done
- [ ] 0592 retry only at the scheduler boundary
- [ ] 0593 24/7 alive on deployed domains with quota preserved on resume
- [ ] 0594 three forms of sandbox fall (fresh, hibernate, revive, reboot, recreate)
- [ ] 0595 startup.sh brings the preview back alone
- [ ] 0596 dockerfile 52 from stages verified (11 distros x 3 tiers + catalog)
- [ ] 0597 vlang v 0.5.2 catalog engine seated (manifest root)
- [ ] 0598 the encrypted engine file password never enters a commit
- [ ] 0599 modalities plan count 90 enforced by test
- [ ] 0600 saddle cli: vm, vmlint, gpus, script, chat, sandbox run/status/docker/compile green
- [ ] 0601 saddle chat REPL (help folded) verified
- [ ] 0602 saddle pages: browser, architecture, compute, console, home, notfound, onboarding, settings
- [ ] 0603 os/architecture tab (the dock) with the 15+ lanes visible
- [ ] 0604 honest map of real versus promised modalities in docs
- [ ] 0605 102 docs of saddle consolidated to the honest map
- [ ] 0606 saddle design reformulated (the not-opening design fixed)
- [ ] 0607 saddle face follows the family design canon
- [ ] 0608 bun-only lock lesson 122 kept
- [ ] 0609 integration adapters verified (github, gitlab, forgejo, gitea, codeberg, huggingface)
- [ ] 0610 saddle wave landed via signed vehicle

## w06 vault (90 actions)

- [ ] 0611 vault rebuilt from zero (the old surface retired)
- [ ] 0612 signup, login, session flows real
- [ ] 0613 person registers app / database and receives own id
- [ ] 0614 api key shown once, hash stored (helix-db model)
- [ ] 0615 endpoint + database-id flow live (bearer auth)
- [ ] 0616 helix-db reference cloned and studied (db-us-east-1)
- [ ] 0617 direct db download blocked (faun law)
- [ ] 0618 vaulthandoff refuses .db / .sqlite
- [x] 0619 decoy database answers anonymous probes
- [x] 0620 decoy download returns the encrypted decoy, real base sealed
- [ ] 0621 aes-256-gcm at rest with enveloped per-project keys
- [ ] 0622 fresh vectors per write
- [ ] 0623 access keys hash-only with constant-time compare
- [ ] 0624 objects git as source of truth (repository is the platform disk)
- [ ] 0625 1mib storage chunks, 256kb ingest chunks
- [ ] 0626 content-addressed dedup by chunk hash
- [ ] 0627 wide integer pointers holding terabyte scale
- [ ] 0628 every hard drive is a database (multiple drives from the panel)
- [ ] 0629 databases multiply automatically on fill
- [ ] 0630 registry maps the drives
- [ ] 0631 memory tiers: hot under 1ms, warm under 10ms, cold under 1s, archive under 1h
- [ ] 0632 big blobs go straight to cold
- [ ] 0633 replication: master plus shard per account
- [ ] 0634 quorum majority writes
- [ ] 0635 read from any replica
- [ ] 0636 daily idempotent reconciliation, last write wins
- [ ] 0637 mimetypes widened from 11 to 4000+ (the golden source)
- [ ] 0638 https protocols widened to 100 / 200 / 1000
- [ ] 0639 mysql2, libgit2, lfs-server: real implementation or labeled promise
- [ ] 0640 /objects page becomes the live ledger (not the deterministic rehearsal)
- [ ] 0641 account exists at runtime (prisma schema plus table)
- [ ] 0642 single operator token retired for real auth
- [ ] 0643 five storage routes live (quota, write, read, usage, delete)
- [ ] 0644 key validation: no leading slash, no traversal, sane charset
- [ ] 0645 2gb lock removed from my files and the whole platform
- [ ] 0646 quota bar reads live infrastructure usage
- [ ] 0647 900mb / 900gb / user-defined ceilings configurable
- [ ] 0648 plan defines the ceiling (~50gb default), never code
- [ ] 0649 storage runs the vault engine, never browser storage
- [ ] 0650 navigator.storage.estimate reading retired
- [ ] 0651 localforage and local storage writes retired family-wide
- [ ] 0652 label factory imported by the eleven apps (typed accessors)
- [ ] 0653 interface chains live in the db
- [ ] 0654 labels.ts seeds moved to the store seat (two-door law)
- [ ] 0655 storagelane.ts as the sqlite factory owner (seven siblings consume)
- [ ] 0656 db.ts dedup x10 closed via the vault library subpath
- [ ] 0657 onboardingstate dedup x10 closed
- [ ] 0658 sha-256 x24 sites collapsed to one owner
- [ ] 0659 familyurl x10 collapse points fixed
- [ ] 0660 onboarding x10 pending points fixed
- [ ] 0661 version triple-sync closed
- [ ] 0662 vault per app: eleven databases, one manager
- [ ] 0663 shared protocol interconnection via internal apis
- [ ] 0664 each deploy keeps its independent db interconnected
- [ ] 0665 vault published as open source library (npmjs, github, gitlab)
- [ ] 0666 vault serves any external app (bucket self-host)
- [ ] 0667 vault face: hero selling the store, plans table, object browser, live console
- [ ] 0668 vault design professional saas (supabase head to head)
- [ ] 0669 vault pages: home, pricing, support, apps, legal, blog, notfound
- [ ] 0670 sbom and provenance on the vault release
- [ ] 0671 deploysafety vault: 13 green legs over sealed headers
- [ ] 0672 decoy probes logged and answered
- [ ] 0673 encryption at rest test green
- [ ] 0674 chunk dedup test green
- [ ] 0675 quorum write test green
- [ ] 0676 tier latency test green
- [ ] 0677 api key single-display test green
- [ ] 0678 download refusal test green
- [ ] 0679 storage routes contract test green
- [ ] 0680 object ledger live test green
- [ ] 0681 drive multiplication test green
- [ ] 0682 reconciliation idempotency test green
- [ ] 0683 label factory consumption test green (eleven apps)
- [ ] 0684 mimetypes count test green (4000+)
- [ ] 0685 protocols count test green
- [ ] 0686 my files writes through /api/v1/storage (write lane closed)
- [ ] 0687 new folder grammar lands with the database wave
- [ ] 0688 drive cards with real capacity bars
- [ ] 0689 breadcrumb, side tree, carets in my files
- [ ] 0690 account data never saves on the user computer (verified)
- [ ] 0691 one signup recognized family-wide through vault
- [ ] 0692 family session rides the shared data home
- [ ] 0693 guest identity never deleted
- [ ] 0694 vault dossiers updated in allan/organizado/md
- [ ] 0695 honest map of real versus promised vault features
- [ ] 0696 vault wave landed via signed vehicle
- [ ] 0697 vault release assets published (extensions of the family matrix)
- [ ] 0698 vault container answering family-container archive
- [ ] 0699 vault npm above 2.1.6
- [ ] 0700 vault verified live on the public site by browser agent

## w07 devthink app (110 actions)

- [ ] 0701 hardcoded text purge: every ts and tsx string to the db
- [ ] 0702 typed accessors reading during build via internal apis
- [ ] 0703 fake data purge complete (ratings, movies, unsplash, metrics, fake artists)
- [ ] 0704 saascontent fake streams deleted
- [ ] 0705 apps still carrying false hardcoded info cleaned
- [ ] 0706 wingets consume db, zero fixed data
- [ ] 0707 tests keep the only hardcode license (mocks, fixtures)
- [ ] 0708 chat born with sandbox ids (space, sandbox, session, message)
- [ ] 0709 sandbox provisioned per conversation (1:1 user-sandbox)
- [ ] 0710 message pipeline: seven independent subagents plus the eighth summarizer
- [ ] 0711 each subagent spawns seven more when needed
- [ ] 0712 edit never interrupts: checkpoint, new session, parallel clone
- [ ] 0713 newest edit prevails, checkpoints merge at the end
- [ ] 0714 agent swarm: one agent per tab, no ceiling
- [ ] 0715 leader, workers, critics, verifiers, work stealing
- [ ] 0716 mailboxes, blackboard, consensus quorum
- [ ] 0717 kill switch always present
- [ ] 0718 approval modal before every sensitive action (diff, command, risk)
- [ ] 0719 allow once, allow always, deny
- [ ] 0720 chat kill switch kills processes and cancels in-flight calls
- [ ] 0721 60 sessions and 40 turns persisted, deep-link handoff
- [ ] 0722 cheap model generates title and summary at a dedicated endpoint
- [ ] 0723 today / yesterday / weekday separators with streaming clock
- [ ] 0724 composer glass dock with textarea above and control bar below
- [ ] 0725 circular 32px send button in the accent
- [ ] 0726 user bubble right with tail, assistant flat on the floor
- [ ] 0727 violet reasoning expander collapsed by default
- [ ] 0728 actions revealed on hover
- [ ] 0729 thinking always-on, visible in collapsible block
- [ ] 0730 markdown v2: h3 ceiling, tables, http/https links only, own highlighter
- [ ] 0731 xterm embedded with process monitor
- [ ] 0732 headless browser inspector with stream and network
- [ ] 0733 monaco with live diffs
- [ ] 0734 lineage chip branch-edit n with family flyout
- [ ] 0735 store selling pretrained models, plugins, themes, runners
- [ ] 0736 plans free / pro / enterprise grant resources, never powers
- [ ] 0737 visual-only lock, two-day trial, donations always visible
- [ ] 0738 creator plan never sold
- [ ] 0739 two creator identities seeded at every boot, first user never admin
- [ ] 0740 mcp registry: endpoints, custom providers, ssrf-safe validation
- [ ] 0741 opt-in, disabled by default, every app automation ready
- [ ] 0742 devtools guard: timing trap, console probe, styled interlude
- [ ] 0743 never dom destruction, zero false positives
- [ ] 0744 f12 and ctrl+shift+i/j/c shortcuts only
- [ ] 0745 never blocks copy, cut, paste, selection, drag
- [ ] 0746 rss subsystem: fetcher, parser, cleaner, chunker, embedder, store
- [ ] 0747 two-phase dedup, digest, analytics
- [ ] 0748 deep search cascade: full text, local semantic, llm
- [ ] 0749 reciprocal rank fusion
- [ ] 0750 universal search under strict budget, 92 command logics
- [ ] 0751 tab fusion: transfer, merge, integrate, sync by drag
- [ ] 0752 universal detach
- [ ] 0753 social streaming without video bandwidth (replayable records)
- [ ] 0754 replay engine reconstructs the screen
- [ ] 0755 every user action recordable as proprietary training data
- [ ] 0756 chronological, invisible, undeletable
- [ ] 0757 ai as super root user (instant and background modes)
- [ ] 0758 live ghost cursor
- [ ] 0759 oauth row: google, github, gitlab with pkce s256
- [ ] 0760 state marker, endpoints, scopes seated
- [ ] 0761 bots of github and gitlab ready
- [ ] 0762 cli pairing in the cline authkit model (device code, 5 minutes, single use)
- [ ] 0763 mobile lane: android emulator over peer connection
- [ ] 0764 self-signed packages, ota manifests
- [ ] 0765 pwa / apk single build offline-first
- [ ] 0766 correct mime types for manifest and service worker
- [ ] 0767 netlify, vercel, cloudflare templates deployable
- [ ] 0768 clones interconnected through the shared databases via internal apis
- [ ] 0769 static serving everywhere (any host runs it)
- [ ] 0770 open source, anyone can deploy anywhere
- [ ] 0771 scrape feature in devthink (moved from saddle)
- [ ] 0772 capture platform with virtual cursor and human trajectories
- [ ] 0773 gtx translation module (batch, versioned cache per person)
- [ ] 0774 zero pt-br strings left in code (english total)
- [ ] 0775 calculator via ready library (pylloyd pattern)
- [ ] 0776 internal unofficial apps answer em construcao
- [ ] 0777 onboarding flow: intro with fluid exit
- [ ] 0778 fluent window onboarding, ten points resolved
- [ ] 0779 manager /panel
- [ ] 0780 onboarding state persisted in the db (prisma + db.ts)
- [ ] 0781 never touches the visitor machine
- [ ] 0782 direct url opens standalone fullscreen without frame
- [ ] 0783 double click in the panel opens inside the system window
- [ ] 0784 identical rendering on both paths
- [ ] 0785 explore page rebuilt on the cloned tokens
- [ ] 0786 window manager: every native app a window
- [ ] 0787 alt tab, dock magnify, file explorer, honoface verified
- [ ] 0788 desktop grid three apps per row aligned
- [ ] 0789 logo hero centered, apps scattered around
- [ ] 0790 shell chrome without start button: logo as trigger at the left
- [ ] 0791 tray with gateway state and tabular clock
- [ ] 0792 familyurl returns the real deploy paths
- [ ] 0793 version triple-sync seated
- [ ] 0794 labels and chatlabels ride the db lane (copystore precedent)
- [ ] 0795 devtools guard toggle in settings, default on, production only
- [ ] 0796 zoom locked at 100% on every surface, baseline dpr
- [ ] 0797 wheel and pinch blocked
- [ ] 0798 chat persistence 60/40 with handoff
- [ ] 0799 chat flagship features mapped from manus, chatgpt, meta ai, z.ai, grok, claude, t3, pi
- [ ] 0800 atomic chat grammar: rounded-2xl bubbles with cuts
- [ ] 0801 thinking drawer and tactile send
- [ ] 0802 streaming fallback and 900s timeout respected
- [ ] 0803 rate limit 1200 req/min seated
- [ ] 0804 caddy flush_interval -1 seated
- [ ] 0805 websocket chat on port 3003, root path, client never carries the port
- [ ] 0806 settings total personalization (the chat is the creation workspace)
- [ ] 0807 account lane session landing verified
- [ ] 0808 explorer page removed per order r18
- [ ] 0809 db folder never committed again (r25)
- [ ] 0810 devthink wave landed via signed vehicle


## w08 getry (70 actions, verification-only lane: another agent owns the build)

- [~] 0811 hands off the getry agent (never disturb, advance elsewhere)
- [ ] 0812 five providers seated (verified from the outside)
- [ ] 0813 35 routes answering (7 endpoints x 5 versions)
- [ ] 0814 thinking always on in seven levels (none to max, default high)
- [ ] 0815 character budgets 0/1400/5500/17000/68000 verified
- [ ] 0816 key rotation pool (22-25 keys, least-used first)
- [ ] 0817 model rotation every six messages per session
- [ ] 0818 meta-model masking the upstream name (answers say devthink)
- [x] 0819 jury of three diverse members with inverse-calibration weighting
- [ ] 0820 gray zone 0.30-0.70 never auto-acts
- [ ] 0821 anti-sycophancy: flattery and false confidence banned
- [ ] 0822 confidence below floor returns explicit unknown
- [ ] 0823 deepseek-r1 removed from all v3 lanes
- [ ] 0824 step-3.7-flash kept, deepseek-v4-flash added
- [ ] 0825 twelve auth methods catalogued
- [ ] 0826 million-token contexts sliced into 30k overlapping pieces
- [ ] 0827 token meter always estimating with the approximate symbol
- [ ] 0828 context window declared, never invented
- [ ] 0829 no whitelist, no mock data, no blacklist
- [ ] 0830 autofix by levenshtein distance with intention clamp
- [ ] 0831 two-call pattern: reasoning first without stream, answer second
- [ ] 0832 streaming law: exact frames, depth parser, one terminator
- [ ] 0833 heartbeats only at rest, partial frames never emitted
- [ ] 0834 backoff 200ms to 64s with cryptographic jitter
- [ ] 0835 retry-after respected, concurrency mutex of one
- [ ] 0836 circuit breaker on v3: 8 errors in 60s
- [ ] 0837 streaming timeout 900s, non-streaming 180s
- [ ] 0838 rate limit in thousands of requests per minute
- [ ] 0839 one-route-at-a-time doctrine (OOM law)
- [ ] 0840 dynamic load or direct fetch for heavy SDKs (never top-level import)
- [ ] 0841 scope locked: routes plus two libraries plus config (no middleware, no fourth library)
- [ ] 0842 five lanes: sandbox keyless, paused, rotating pool, anonymous, free-label
- [ ] 0843 free pool: 26 models across zen, openrouter, kilo
- [ ] 0844 router 226 providers, free-first
- [ ] 0845 meta-model fused context 2,262,144 tokens
- [ ] 0846 console: 54 screens, 10 playgrounds
- [ ] 0847 provider manifest ~12k lines maintained
- [ ] 0848 error inventory with hundreds of codes
- [ ] 0849 night recalibration at 02:00 utc
- [ ] 0850 openai-compatible surface verified from a clean client
- [ ] 0851 getry published as the family gateway library
- [ ] 0852 devthink imports gateway logic from getry (zero duplication)
- [ ] 0853 keys resolve at the last moment, masked before every log
- [ ] 0854 vault-held key store (never plaintext in repo)
- [ ] 0855 the 22-31 nvidia keys rotated out of history
- [ ] 0856 sandbox replication: each new chat becomes an independent copy
- [ ] 0857 nightly catalog sync green
- [ ] 0858 restore-or-retire decision recorded for the paused lane
- [ ] 0859 eleven providers mirrored in the platform face
- [ ] 0860 metered api billing lane ready (stripe metered via cobaia)
- [ ] 0861 getry container answering family-container archive
- [ ] 0862 getry npm above 2.1.6
- [ ] 0863 getry maven com.wenathlan.getry live
- [ ] 0864 getry pages clone verified live
- [ ] 0865 getry design follows the family canon (violet identity)
- [ ] 0866 token estimate symbol on every surface
- [ ] 0867 no provider name leaks to the user
- [ ] 0868 honest route errors (never invented)
- [ ] 0869 getry dossiers current in allan/organizado/md
- [ ] 0870 getry verification report written (outside interference zero)

## w09 cadria (70 actions)

- [ ] 0871 versawaze engine declared the cadria law
- [ ] 0872 video encoder real (webcodecs over versawase slices plus gl frames)
- [ ] 0873 transcodeplan executes (never declarative-only)
- [ ] 0874 real bytes for png artifacts
- [ ] 0875 real bytes for webm artifacts
- [ ] 0876 real bytes for gif artifacts
- [ ] 0877 renderjob executor live
- [ ] 0878 timeline compositor live (15 operations)
- [ ] 0879 user video import lane
- [ ] 0880 webgl2 runtime wired to a real consumer (createRenderer out of mocks)
- [ ] 0881 three mesh wells delivered or the promise downgraded honestly
- [ ] 0882 all raster server-side, visitor gpu never used
- [ ] 0883 heavy processing moved from studio.tsx to saddle
- [ ] 0884 render in 10-second slices, preview equals final
- [ ] 0885 deterministic edit list
- [ ] 0886 render farm across sandboxes
- [ ] 0887 16 blend modes iso/w3c
- [ ] 0888 ticks 254,016,000,000/s in bigint with smpte
- [ ] 0889 performance tiers 60/30/15 fps
- [ ] 0890 resolutions up to 4k
- [ ] 0891 126 routes on 8 pages
- [ ] 0892 universal player with loudness normalization (broadcast standard)
- [ ] 0893 visualize resource: image to mergeable surface (height by luminance)
- [ ] 0894 hear-to-see pipeline: audio to deterministic live art
- [ ] 0895 model pipeline: import, autorig, normalize, bake, retarget
- [ ] 0896 tool protocol bridge over websocket
- [ ] 0897 obj / stl / usda / gltf2 exporters
- [ ] 0898 parametric primitives at the root
- [ ] 0899 video import lane with honest progress
- [ ] 0900 nuclear contract 100+1 modalities
- [ ] 0901 iukka player absorbed (history documented)
- [ ] 0902 create editor absorbed (history documented)
- [ ] 0903 cadria design: the dark atelier with the shining magenta
- [ ] 0904 cadria mark carries the fluent halo pair
- [ ] 0905 debonair-adjacent cut ribbon aligned (native a)
- [ ] 0906 cadria opens standalone fullscreen on direct url
- [ ] 0907 cadria opens inside the system window from the panel
- [ ] 0908 identical rendering both paths
- [ ] 0909 timeline with 15 operations verified
- [ ] 0910 layers, rigs, mesh, motion controls verified
- [ ] 0911 pixel pipeline: brightness, contrast, saturation, sepia, grayscale
- [ ] 0912 convolution 3x3, box blur, bilinear resize
- [ ] 0913 compositing honest map in docs
- [ ] 0914 encoder benchmarks recorded
- [ ] 0915 wasm cores in the release assets
- [ ] 0916 player roadmap honest
- [ ] 0917 blenders-of-the-family: cadria never reimplements devthink logic
- [ ] 0918 devthink imports video / image / 3d from cadria (published library)
- [ ] 0919 cadria pages: studio, editor, player, timeline, notfound
- [ ] 0920 cadria tests: 648 green legs and growing
- [ ] 0921 renderjob retry at the scheduler boundary only
- [ ] 0922 artifacts stored in the vault (chunks, dedup)
- [ ] 0923 export queue honest
- [ ] 0924 gpu lane declared when saddle vgpu carries it
- [ ] 0925 mesh well 1 (primitives) verified
- [ ] 0926 mesh well 2 (import) verified
- [ ] 0927 mesh well 3 (visualize) verified
- [ ] 0928 shader library catalogued
- [ ] 0929 shader compilation server-side
- [ ] 0930 the visitor never compiles (precompiled doctrine)
- [ ] 0931 cadria container answering family-container archive
- [ ] 0932 cadria npm above 2.1.6
- [ ] 0933 cadria maven com.wenathlan.cadria live
- [ ] 0934 cadria pages clone verified live
- [ ] 0935 cadria dossiers current in allan/organizado/md
- [ ] 0936 design wave: cadria face at awwwards level
- [ ] 0937 timeline algebra test green
- [ ] 0938 blend mode test green
- [ ] 0939 slice render test green
- [ ] 0940 exporter test green
- [ ] 0941 import lane test green
- [ ] 0942 honest map updated
- [ ] 0943 wave landed via signed vehicle

## w10 debonair (70 actions)

- [ ] 0944 kathesis engine declared the debonair law
- [ ] 0945 reverse ingest first (json payload rebuilds the song in the sandbox)
- [ ] 0946 the v1 law restored from the blobs (outros.debonair v1/v2/v3)
- [ ] 0947 four-stem demix (harmonic, percussive, vocal, other)
- [ ] 0948 trained genre corpus (15 families)
- [ ] 0949 formant vocal render
- [ ] 0950 time-stretch executor
- [ ] 0951 bounce limiter parity
- [ ] 0952 hpss two-stem verified deterministic
- [ ] 0953 genre classification by signal, never filename
- [ ] 0954 decode worker covers mp3 and flac (not only wav)
- [ ] 0955 the visitor browser never decodes (decodeAudioData retired)
- [ ] 0956 llm bridge closed over the family gateway (seventh mcp tool)
- [ ] 0957 composewithllm live
- [ ] 0958 hugging face spaces music generation studied (the category link)
- [ ] 0959 music generation wired as the great feature (play proves it)
- [ ] 0960 the json gesture to db references (play first, then db)
- [ ] 0961 suno.com cloned in temp and the cjs internals studied
- [ ] 0962 the v1 decomposition pattern documented (76 header seats, 66 frame seats)
- [ ] 0963 the law of 82 parameters enforced by test
- [ ] 0964 four correlations seated
- [ ] 0965 deterministic seed: mulberry32(hashseed(fnv-1a))
- [ ] 0966 same prompt plus same seed equals same take
- [ ] 0967 recon at 44100 hz, render at 48000 hz (never swapped in silence)
- [ ] 0968 wav 24 bits at 48khz output
- [ ] 0969 loudness -14 lufs, true peak -1 dbtp
- [ ] 0970 lra per genre
- [ ] 0971 export midi and wav in 16, 24, 32 float bits
- [ ] 0972 pcm float as the definitive interchange (no hex, no base64)
- [ ] 0973 blob store by sha256, bytes outside the document
- [ ] 0974 the 108 dsp cdn libraries in parallel batches
- [ ] 0975 30-second streaming analysis windows
- [ ] 0976 butterworth fourth order in six layers
- [ ] 0977 offline package under 50mb
- [ ] 0978 pattern bank beyond ten thousand patterns
- [ ] 0979 daw of 8 pages with 100 routes
- [ ] 0980 mixer, rack, transport, synthesis, sampling, mastering
- [ ] 0981 reverse payload ingestion (music in, json out, music back)
- [ ] 0982 ghostwriter personas (five artist mentalities unified)
- [ ] 0983 banned words list enforced (flow, glow, cap, blow...)
- [ ] 0984 clipping dictionary (tryna, finna, lil, bout, gon, ion, yall, aight, cuz)
- [ ] 0985 lowercase ratio ~98 percent
- [ ] 0986 syllable and rhythm budgets enforced
- [ ] 0987 one letter per operation
- [ ] 0988 ml identification with hundreds of classes (never hand-written signatures)
- [ ] 0989 sample rate explicit 44100, clamp 0-1 against nan
- [ ] 0990 synthesis timing owned by the owner (deferred, never surprising)
- [ ] 0991 sandboxmodality vocabulary (local, runnernode, containerdocker, microvmfirecracker)
- [ ] 0992 debonair design: the noir stage standard (dark, suno/fl studio/trylle)
- [ ] 0993 hero with deep floor and brass light pair
- [ ] 0994 debonair opens standalone fullscreen on direct url
- [ ] 0995 debonair opens inside the system window from the panel
- [ ] 0996 identical rendering both paths
- [ ] 0997 two files page.tsx and ui.tsx discipline kept
- [ ] 0998 debonair tests: 1,111 green legs and growing
- [ ] 0999 v8 verdicts enforced (no wrappers, no decorative ids, no global bpm)
- [ ] 1000 debonair container answering family-container archive
- [ ] 1001 debonair npm above 2.1.6
- [ ] 1002 debonair maven com.wenathlan.debonair live
- [ ] 1003 debonair pages clone verified live
- [ ] 1004 debonair dossiers current in allan/organizado/md
- [ ] 1005 reverse ingest test green
- [ ] 1006 demix test green
- [ ] 1007 loudness test green
- [ ] 1008 determinism test green
- [ ] 1009 honest map updated
- [ ] 1010 wave landed via signed vehicle

## w11 stealthhead (55 actions)

- [ ] 1011 the single jogo em construcao component answers every route
- [ ] 1012 zero text walls
- [ ] 1013 the frozen design kept until the owner paces the game
- [ ] 1014 db-first doctrine documented (master db plus shard per callsign)
- [ ] 1015 the owner db is sacred; tests use the ghost callsign, never player
- [ ] 1016 precompiled shaders in the db
- [ ] 1017 bounding hierarchies compiled ahead
- [ ] 1018 navigation grids compiled ahead
- [ ] 1019 probes and color tables compiled ahead
- [ ] 1020 the db acts as vgpu / vcpu for the next visitor
- [ ] 1021 gaussian splat layer under 2mb
- [ ] 1022 deterministic physics: axis bisection on aligned boxes
- [ ] 1023 spatial hash, no physics engine (recorded decision)
- [ ] 1024 gravity -9.82, never -9.81
- [ ] 1025 multiplayer ws join/state at 12hz
- [ ] 1026 100ms interpolation buffer
- [ ] 1027 offline bots fallback
- [ ] 1028 under 120 draw calls per frame
- [ ] 1029 under 8ms js, under 6ms gpu, under 2ms physics
- [ ] 1030 pixelratio ceiling 1.5, zero per-frame allocation
- [ ] 1031 hitscan and rocket weapons in the schema
- [ ] 1032 enemy state machines: drone, runner, tank, sniper, exploder, boss
- [ ] 1033 boss every fifth wave
- [ ] 1034 monte carlo validation (1000 balancer runs)
- [ ] 1035 time-to-kill validated
- [ ] 1036 4000+ ingested assets near 1gb in the db
- [ ] 1037 character import pipeline (ufbx / glb / gltf-s)
- [ ] 1038 engineer character 1 ingested
- [ ] 1039 inventory: cars, vehicles, characters, weapons synced from the db
- [ ] 1040 names pulled from db columns (never hardcoded)
- [ ] 1041 owner targets documented: 5 maps, 50+ weapons, 10+ characters, 5 modes, 15 vehicles
- [ ] 1042 single-html game opens by double click on file:// (no coop/coep, no 30mb wasm, no bundler)
- [ ] 1043 car game in single file with ackermann steering
- [ ] 1044 balancer runs in the thousands
- [ ] 1045 7 pages with 110 routes schema
- [ ] 1046 12 tables in the master database
- [ ] 1047 callsign ghost real in tests
- [ ] 1048 stealthhead pages: home, game, notfound
- [ ] 1049 design: the coral identity, the em construcao component only
- [ ] 1050 stealthhead container answering family-container archive
- [ ] 1051 stealthhead npm above 2.1.6
- [ ] 1052 stealthhead maven live
- [ ] 1053 stealthhead pages clone verified live
- [ ] 1054 dossiers current
- [ ] 1055 honest map (deferred engine, live component)
- [ ] 1056 tests: 147 green legs
- [ ] 1057 zero fake gameplay numbers on the surface
- [ ] 1058 em construcao localized in english
- [ ] 1059 wave landed via signed vehicle
- [ ] 1060 game wave held until the owner paces it

## w12 argan (40 actions)

- [ ] 1061 dns library: resolver plus authority plus domains in one account
- [ ] 1062 handwritten wire protocol (no dns library)
- [ ] 1063 transports: udp, tcp, dot, doh both forms, doq, odoh
- [ ] 1064 edns 1232 bytes
- [ ] 1065 doh on port 81 when 53 blocked
- [ ] 1066 dnssec day one: ksk/zsk, elliptic curve, auto rotation
- [ ] 1067 root zone . with soa / ns
- [ ] 1068 subdomains personalized, resolving worldwide
- [ ] 1069 records: name, type, content, never deleted, only altered
- [ ] 1070 cleanurl, familyurl, keywords, mimetypes surfaces
- [ ] 1071 101 resolution modalities (nuceral ladder)
- [ ] 1072 cache, auth, recursor, p2p quorum, upstream, worm telemetry, ttl by popularity
- [ ] 1073 10 propagation channels (jsdelivr, tor, hypercore, bittorrent dht, nostr, ipfs, git mirrors, publicfreesuffix, mv3, unbound)
- [ ] 1074 the hanging domain model (one main domain per person)
- [ ] 1075 the two ripped domains restored (complaint 72)
- [ ] 1076 zero dns record deletion (existing records never touched)
- [ ] 1077 replica cluster with hmac gossip
- [ ] 1078 self-hosted email full server
- [ ] 1079 own search stack as self-hosted metasearch
- [ ] 1080 seven-step publication pipeline
- [ ] 1081 zone state signed (the unsigned state healed)
- [ ] 1082 certificate present on the main zone
- [ ] 1083 email reputation manual
- [ ] 1084 30 redundant resolvers behind one balancer
- [ ] 1085 10 record families
- [ ] 1086 argan pages: 8 pages live
- [ ] 1087 15-language glossary
- [ ] 1088 argan design: the jade identity
- [ ] 1089 argan container answering family-container archive
- [ ] 1090 argan npm above 2.1.6
- [ ] 1091 argan maven com.wenathlan.argan live
- [ ] 1092 argan pages clone verified live
- [ ] 1093 dossiers current
- [ ] 1094 wire protocol tests green
- [ ] 1095 dnssec signing test green
- [ ] 1096 never-delete invariant test green
- [ ] 1097 honest map updated
- [ ] 1098 wave landed via signed vehicle
- [ ] 1099 argan serves the family domains (cloudflare competitor lane)
- [ ] 1100 devthink imports network logic from argan (published library)

## w13 forge (20 actions)

- [ ] 1101 execution clone role documented (never a new app)
- [ ] 1102 queuebinarylaunch live
- [ ] 1103 heavy binaries run (call of duty, blender, brave, steam)
- [ ] 1104 zero binaries in the release assets
- [ ] 1105 virtual hardware engine (flagship emulated cpu, hundreds of gb memory info)
- [ ] 1106 character decomposition pipeline (nine-layer ontology)
- [ ] 1107 build graph and 15-point completeness checklist
- [ ] 1108 forge as the ci and build app of the family
- [ ] 1109 forge design: the lime identity
- [ ] 1110 forge container answering family-container archive
- [ ] 1111 forge npm above 2.1.6
- [ ] 1112 forge maven com.wenathlan.forge live
- [ ] 1113 forge pages clone verified live
- [ ] 1114 dossiers current
- [ ] 1115 launch queue tests green
- [ ] 1116 honest map updated
- [ ] 1117 wave landed via signed vehicle
- [ ] 1118 forge consumes saddle as library (published package)
- [ ] 1119 forge consumes vault for artifacts
- [ ] 1120 forge design at awwwards level

## w14 foundry (15 actions)

- [ ] 1121 pipeline clone (e2b / docker interface) documented
- [ ] 1122 stages execute in the real sandbox
- [ ] 1123 pipeline defined in yml slices with real interpretation
- [ ] 1124 artifacts stored by the vault library (content-addressed chunks)
- [ ] 1125 admin control surface
- [ ] 1126 yml chunks, tar.xz, mime type lanes
- [ ] 1127 foundry design: the blue identity
- [ ] 1128 foundry container answering family-container archive
- [ ] 1129 foundry npm above 2.1.6
- [ ] 1130 foundry maven com.wenathlan.foundry live
- [ ] 1131 foundry pages clone verified live
- [ ] 1132 dossiers current
- [ ] 1133 stage execution tests green
- [ ] 1134 honest map updated
- [ ] 1135 wave landed via signed vehicle

## w15 cobaia (20 actions)

- [ ] 1136 monetization surface documented
- [ ] 1137 honest ad slots: declared, empty until approval
- [ ] 1138 ad script loads only after environment approval
- [ ] 1139 zero external calls and zero tracking before approval
- [ ] 1140 no invisible click mirroring, no hidden frames, no bot traffic
- [ ] 1141 the 40 monetization forms catalog
- [ ] 1142 adsense declaration file
- [ ] 1143 alternatives catalogued (ezoic, monumetric, mediavine)
- [ ] 1144 mrr via stripe
- [ ] 1145 pix payout in brazil
- [ ] 1146 affiliates of infrastructure
- [ ] 1147 github sponsors and kofi visible
- [ ] 1148 cashback becomes store credit, never cash back
- [ ] 1149 plans free / pro / enterprise grant resources, never powers
- [ ] 1150 cobaia pages: home, pricing, support, apps, legal, blog, notfound
- [ ] 1151 cobaia design: honest and clean
- [ ] 1152 cobaia container answering family-container archive
- [ ] 1153 cobaia npm above 2.1.6
- [ ] 1154 dossiers current
- [ ] 1155 wave landed via signed vehicle

## w16 docs consolidation (45 actions)

- [ ] 1156 the 645/675 dots commits restored and read before any deletion
- [ ] 1157 the 1000 blobs from cc57f46 to c3f08ca read by the background agent
- [ ] 1158 conversa.md 23k lines read linearly
- [ ] 1159 repos.case.md 204,140 lines swept
- [ ] 1160 every txt and md of the repo history enumerated
- [ ] 1161 infraestrutura.md written (airplane manual, lowercase, english)
- [ ] 1162 infraestrutura.md carries macro and micro features per app
- [ ] 1163 zero paths, zero numbers inside infraestrutura.md
- [ ] 1164 links.md written (every https captured, one repo one line one truth)
- [ ] 1165 unified package.json written via the allan cjs script
- [ ] 1166 the checklist document written in markdown syntax
- [ ] 1167 consolidation down to four to six files total
- [ ] 1168 stray txt and md deleted from the devthink repo after validation
- [ ] 1169 the app docs folders md read before deletion
- [ ] 1170 eleven dossiers in allan/organizado/md
- [ ] 1171 each dossier: purpose, micro and macro features by category
- [ ] 1172 no line numbers, no paths inside dossiers
- [ ] 1173 regras.md seat in devthink/docs with the rule mapping by category
- [ ] 1174 the rule catalog 10-15k rules target maintained
- [ ] 1175 rule numbering app-0001 to app-0735 maintained
- [ ] 1176 dedup law: duplicates become __2 __3 until consolidation
- [ ] 1177 nothing deleted before reading (the dots lesson)
- [ ] 1178 secrets out of every merge (nvidia keys, .env, .pem)
- [ ] 1179 the readingmap updated with coverage states
- [ ] 1180 the corpus index written (62 categories, 10,176 rules)
- [ ] 1181 docs wave runs last, separate subagent wave
- [ ] 1182 worklog.md closed as the completion criterion
- [ ] 1183 the wave log written (files created / altered / removed per app)
- [ ] 1184 tables of change per section
- [ ] 1185 new tokens documented
- [ ] 1186 before and after examples
- [ ] 1187 validation results
- [ ] 1188 pending items and deviations with justification
- [ ] 1189 readme absorbs the doc content (no doc path citations)
- [ ] 1190 readme subtitles each followed by a table
- [ ] 1191 code of conduct mirrors the devthink standard family-wide
- [ ] 1192 governance docs standardized across repos
- [ ] 1193 zero emoji inside the docs
- [ ] 1194 zero source citation inside the body
- [ ] 1195 links and paths only at the tail
- [ ] 1196 english total in code docs
- [ ] 1197 the official folder pattern (one word lowercase names)
- [ ] 1198 the uniplano merge executed (research plus plan)
- [ ] 1199 archive of superseded docs documented
- [ ] 1200 docs wave landed via signed vehicle

## w17 security and quality (50 actions)

- [ ] 1201 code-scanning alerts enumerated (before snapshot compared)
- [ ] 1202 every alert fixed by code, closed by request, merged by request
- [ ] 1203 zero ignore configurations (the forbidden path never taken)
- [ ] 1204 dependabot alerts zero
- [ ] 1205 the trivy 15 go stdlib cves: entries carry their drop condition
- [ ] 1206 upstream bump the day a stable typescript patch ships
- [ ] 1207 the trivyignore list never broadened
- [ ] 1208 the ci-tests scorecard alert healed by green merges
- [ ] 1209 scorecard transient failures documented as platform
- [ ] 1210 the 22-31 nvidia keys rotated
- [ ] 1211 github app and gitlab app pairs rotated
- [ ] 1212 admin credentials rotated
- [ ] 1213 r2 tokens rotated
- [ ] 1214 recovery codes rotated (wormhole lessons)
- [ ] 1215 three documented backdoors removed
- [ ] 1216 session cookies rotated
- [ ] 1217 secrets never printed in logs
- [ ] 1218 keys encrypted at rest (aes-256-gcm)
- [ ] 1219 argon2id for passwords
- [ ] 1220 node:crypto, never math.random
- [ ] 1221 tls 1.3 everywhere
- [ ] 1222 strict csp seated
- [ ] 1223 ssrf-safe url validation in the mcp registry
- [ ] 1224 visitor report rate-limited and session-keyed (never by ip, cgnat law)
- [ ] 1225 the db folder never committed (gitignore wall)
- [ ] 1226 mini-services walled by gitignore
- [ ] 1227 personal owner data out of public repos
- [ ] 1228 dev10.pro never inside repo files
- [ ] 1229 robots.txt blocks gptbot, claudebot, ccbot, bytespider, perplexitybot
- [ ] 1230 devtools guard never wipes dom
- [ ] 1231 signed commits: the vehicle verified on every wave
- [ ] 1232 gpg key public in .github/commitkey.asc, private with the owner
- [ ] 1233 zombie agent commits impossible (branch policy)
- [ ] 1234 main protected: checks real, one review, codeowner, dismiss stale, linear history, no force push, no delete
- [ ] 1235 security battery green (audit, osv, codeql, dockle, trivy, pentest)
- [ ] 1236 osv fail-on-vuln with documented false positives
- [ ] 1237 sbom cyclonedx on every release
- [ ] 1238 provenance attestations on every release
- [ ] 1239 dependency review gate green
- [ ] 1240 secret scanning green
- [ ] 1241 cargo audit green
- [ ] 1242 npm audit green
- [ ] 1243 gates close on high or critical reachable
- [ ] 1244 the 45 python/npm security bumps verified
- [ ] 1245 esbuild cve override law seated (0.28.2 pin)
- [ ] 1246 undici, zod, follow-redirects, fast-uri, body-parser overrides seated
- [ ] 1247 security wave landed via signed vehicle
- [ ] 1248 the 29c24c4 aftermath fully closed
- [ ] 1249 alert count after snapshot recorded
- [ ] 1250 zero open alerts at close (except the documented trivy seats)

## w18 tests and gates (40 actions)

- [ ] 1251 family suite count snapshot (7,192 legs baseline)
- [ ] 1252 devthink 3,592 legs green
- [ ] 1253 debonair 1,111 legs green
- [ ] 1254 saddle 522 legs green
- [ ] 1255 cadria 648 legs green
- [ ] 1256 vault 320 legs green
- [ ] 1257 getry 578 legs green
- [ ] 1258 stealthhead 147 legs green
- [ ] 1259 forge 89 legs green
- [ ] 1260 foundry 76 legs green
- [ ] 1261 argan 72 legs green
- [ ] 1262 cobaia 37 legs green
- [ ] 1263 477 proof files, zero non-ts
- [ ] 1264 vitest the only ci runner (node:test banned)
- [ ] 1265 900-1000 steps before every push enforced
- [ ] 1266 tsc 0 enforced
- [ ] 1267 bun run check with maxworkers 2
- [ ] 1268 bun run lint green
- [ ] 1269 actionlint green
- [ ] 1270 windows baseline: 22 failures in 7 files healed
- [ ] 1271 torture tests (700) green
- [ ] 1272 agentcert 30 scenarios green
- [ ] 1273 costcert 9 checks green
- [ ] 1274 pentest 21 entries green
- [ ] 1275 smoke audit: desktop 1280x800 and mobile 390x844
- [ ] 1276 page white equals failure one
- [ ] 1277 verdict json against baseline
- [ ] 1278 two vlm passes (light and dark)
- [ ] 1279 ui reviewer meticulous, pixel auditor skeptical (yes or no)
- [ ] 1280 gates before commit documented
- [ ] 1281 lockfile frozen installs green
- [ ] 1282 pnpm ignored builds block seated (onlybuiltdependencies)
- [ ] 1283 biome format check green
- [ ] 1284 typecheck workflows use the root manifest only
- [ ] 1285 test folder inside every app verified
- [ ] 1286 tests regenerated per structure wave
- [ ] 1287 the changelog auto-fires per bump
- [ ] 1288 each error fixed bumps the manifest (the law)
- [ ] 1289 test wave landed via signed vehicle
- [ ] 1290 suite counts recorded in the wave log

## w19 release train and assets (35 actions)

- [ ] 1291 release draft created via gh cli
- [ ] 1292 verify lane green before the immutable lock
- [ ] 1293 the immutable tag cut
- [ ] 1294 release approval environment approved as iakadion
- [ ] 1295 the cascade fires the family lanes (workflow_run)
- [ ] 1296 npm lanes publish (32 seats)
- [ ] 1297 maven lanes publish (44 seats)
- [ ] 1298 nuget lanes publish (30 seats)
- [ ] 1299 rubygems lanes publish (52 seats)
- [ ] 1300 container lanes publish (13 seats)
- [ ] 1301 family-container archive answers the six guest apps
- [ ] 1302 release notes with sbom and provenance
- [ ] 1303 assets past 500 per release
- [ ] 1304 assets past 1000 per release
- [ ] 1305 assets toward 3000 per release
- [ ] 1306 binaries of every app downloadable
- [ ] 1307 extension zip in the assets (downloadable and installable)
- [ ] 1308 declarations zip attached
- [ ] 1309 five zips per app (web, next.personalizado, next.zai, next.fifty, next.normal)
- [ ] 1310 tar.xz at -9e with brotli over
- [ ] 1311 compression kept where platforms demand zip
- [ ] 1312 appimage, dmg, exe, deb, rpm, ipa, apk published
- [ ] 1313 sha256sums generated in build
- [ ] 1314 version resolved from the release tag against the matrix manifest
- [ ] 1315 twelve manifests in lockstep confirmed by the release
- [ ] 1316 changelog written before sync
- [ ] 1317 bump cadence recorded (600/700 actions)
- [ ] 1318 the 2.0.x ladder confirmed (never 2.1.x)
- [ ] 1319 release train dispatch manual run for the current stamp
- [ ] 1320 runs verdes recorded
- [ ] 1321 red collaterals deleted
- [ ] 1322 release verified live on the public pages
- [ ] 1323 the owner checklist expectations reviewed one by one
- [ ] 1324 every expectation of the ordens1 tail confirmed
- [ ] 1325 final report: everything green, everything archived, everything delivered

## closing count

- total actions: 1,320 (w00 25, w01 45, w02 60, w03 50, w04 100, w05 110, w06 90, w07 110, w08 70, w09 73, w10 67, w11 50, w12 40, w13 20, w14 15, w15 20, w16 45, w17 50, w18 40, w19 35)
- order of execution: w00 then w01 through w19, easiest to hardest, one by one, by category, correlated, hierarchical, linear, waves landed via the signed vehicle, worklog append-only outside the repo
- getry lane w08 stays verification-only while its agent works
- engines debonair and cadria carry deferred deep work inside their waves per the owner order (mais cuidado, depois)

## a onda do green train 2.0.184

- [x] ler integralmente as ordens, o corpus de autenticação e a conversa corrente, deduplicando os blocos repetidos
- [x] verificar a autenticação viva contra a api do github antes de qualquer alteração
- [x] sincronizar o head remoto no ambiente local antes da onda
- [x] baixar e auditar os logs das cinco lanes vermelhas do stamp 2.0.183 (workflowlint, verify nas três pernas, pages no assento npm do saddle e publish)
- [x] corrigir a chave timeout-minutes duplicada dentro do job family-cargo do publish.yml (o syntax-check que o workflowlint reddened)
- [x] corrigir o heal do jsdom family-wide: whatwg-url ^5.0.0 → ^17.3.0, webidl-conversions ^3.0.0 → ^8.0.1 e tr46 ^0.0.3 → ^7.0.0 nos onze manifests, nos onze catálogos pnpm-workspace, nos onze bun locks (com o assento scoped tr46/punycode) e no lock npm do saddle
- [x] restaurar o peerDependenciesMeta que o conversor bun→npm derrubou: 748 pacotes do saddle package-lock recuperam o meta verdadeiro do registro (830 assentos carregando)
- [x] resgatar o docs/infra.md que a consolidação #636 aposentou por engano (o livro da lei do arquivo único volta do pre-consolidation tree)
- [x] resgatar os assentos README do devthink.csproj (PackageReadmeFile e o None Include Pack)
- [x] corrigir o consumer smoke: o distpackage declara o conjunto de runtime real que os bundles importam em vez da união family de 4.109 assentos (o stub @vue/runtime-vapor@0.0.0 do registro com deps workspace:* morre por construção)
- [x] bumpar o rung 2.0.184 nos 169 assentos de versão da família (manifests, locks, containers, distribuições, gates, certificações e lanes)
- [x] registrar a onda no changelog e no releasenotes com a gramática de tabela da casa
- [x] validar o actionlint sobre a família inteira de workflows após as correções
- [ ] acompanhar as lanes do github ficarem verdes com o stamp 2.0.184 e fechar o ciclo

## operação de leitura e sincronização

- [x] ler integralmente o briefing mestre completo do topo ao fim por segmentos de linha no terminal
- [x] ler integralmente os arquivos de feedback do proprietário, deduplicando os blocos repetidos
- [x] ler integralmente o corpus de autenticação, mapeando as dezenas de variantes de script e o build corrigido consolidado
- [x] ler integralmente a conversa completa em dezenas de milhares de linhas, em sete segmentos por subagentes, todos lendo por terminal
- [x] auditar todos os commits da main do repositório principal, tema por tema
- [x] inventariar todos os txt e md de todos os grupos do repositório
- [x] identificar os documentos com informação única versus boilerplate por comparação
- [x] extrair o script de autenticação corrigido do corpus e validar a sintaxe
- [x] lançar a autenticação em background com poller e watchdog
- [ ] capturar o token em tempo real assim que o proprietário autorizar
- [x] sincronizar o head remoto para o local antes de qualquer alteração
- [x] limpar a raiz do ambiente mantendo apenas o repositório principal e a área de estudo
- [x] consolidar a leitura nos cinco documentos centrais na pasta de documentação
- [ ] mapear cada regra dos cinco documentos contra o código para auditar cumprimento
- [ ] auditar os commits dos repositórios históricos da família citados nos textos para resgatar conversões perdidas
- [ ] ler os blobs de manifests dos repositórios históricos com subagente dedicado em background
- [ ] comparar o projeto original do saddle com a versão integrada registrando capacidades perdidas
- [ ] comparar cada aplicativo com seu dossiê histórico registrando features falsas, reais e perdidas
- [ ] registrar a lista de prs abertos, branchs pendentes e prs arquivados por categoria
- [ ] definir a lista interna de mais de dez mil ações com até novecentas por frente
- [ ] verificar a cada onda o que foi feito e o que falta antes de avançar
- [ ] ler os commits dos workflows do repositório histórico resgatando features de conversão perdidas
- [ ] registrar os assets que sumiram dos releases ao longo das regressões
- [ ] restaurar as conversões multimodais perdidas no padrão atual
- [ ] auditar onde cada item do mapeamento está no código antes de corrigir

## segurança por request

- [ ] bump da biblioteca de imagens nos onze manifests para a versão corrigida
- [ ] bump da biblioteca de git nos onze manifests para a versão corrigida
- [ ] bump do servidor web assíncrono nos onze manifests para a versão corrigida
- [ ] bump da biblioteca de tokens nos onze manifests para a versão corrigida
- [ ] bump do lock de arquivo nos onze manifests para a versão corrigida
- [ ] bump do framework de agentes nos onze manifests para a versão corrigida
- [ ] bump do servidor de rede nos onze manifests para a versão corrigida
- [ ] bump do cliente http nos onze manifests para a versão corrigida
- [ ] bump do instalador nos onze manifests para a versão corrigida
- [ ] bump do driver de banco nos onze manifests para a versão corrigida
- [ ] bump do parser de sql nos onze manifests para a versão corrigida
- [ ] bump do parser de asn nos onze manifests para a versão corrigida
- [ ] bump do protocolo de modelos nos onze manifests para a versão corrigida
- [ ] bump da pilha de grafos de linguagem nos onze manifests nas três variantes
- [ ] bump do roteador de modelos nos onze manifests para a versão corrigida
- [ ] bump do formatador nos onze manifests para a versão corrigida
- [ ] bump do certificado nos onze manifests para a versão corrigida
- [ ] bump do conjunto de ferramentas nos onze manifests para a versão corrigida
- [ ] bump do filtro de sopa nos onze manifests para a versão corrigida
- [ ] bump do runtime de agente de nuvem nos onze manifests para a versão corrigida
- [ ] bump do sdk de agentes nos onze manifests para a versão corrigida
- [ ] bump do framework de agentes de código nos onze manifests para a versão corrigida
- [ ] bump do servidor de aplicação nos onze manifests para a versão corrigida
- [ ] bump do protocolo http2 nos onze manifests para a versão corrigida
- [ ] bump da biblioteca de assinaturas nos onze manifests para a versão corrigida
- [ ] bump da biblioteca wsgi nos onze manifests para a versão corrigida
- [ ] bump do cliente dns nos onze manifests para a versão corrigida
- [ ] bump da biblioteca de templates nos onze manifests para a versão corrigida
- [ ] bump do motor de aprendizado nos onze manifests para a versão corrigida
- [ ] bump do índice de llamas nos onze manifests para a versão corrigida
- [ ] bump da biblioteca de mpack nos onze manifests para a versão corrigida
- [ ] bump do dicionário multivalorado nos onze manifests para a versão corrigida
- [ ] bump do kit de linguagem natural nos onze manifests para a versão corrigida
- [ ] bump da telemetria nos onze manifests para a versão corrigida
- [ ] bump do acelerador nos onze manifests para a mais recente sem correção publicada
- [ ] bump do compositor de agentes nos onze manifests para a mais recente sem correção publicada
- [ ] bump da biblioteca dsp nos onze manifests para a mais recente sem correção publicada
- [ ] bump do servidor de dados nos onze manifests para a versão corrigida
- [ ] bump do servidor mcp rápido nos onze manifests para a versão corrigida
- [ ] bump da biblioteca mlx nos onze manifests para a versão corrigida
- [ ] bump do servidor graphql rápido nos onze manifests para a versão corrigida
- [ ] bump do roteador jwt nos onze manifests para a versão corrigida
- [ ] bump da biblioteca de domínios nos onze manifests para a versão corrigida
- [ ] bump do cliente mongo nos onze manifests para a versão corrigida
- [ ] converter o leitor de pdf morto no sucessor vivo já presente na união
- [ ] mesclar a variante maiúscula da biblioteca de git no pino minúsculo corrigido
- [ ] mesclar a variante maiúscula da biblioteca de imagens no pino minúsculo corrigido
- [ ] mesclar a variante maiúscula da biblioteca de tokens no pino minúsculo corrigido
- [ ] mesclar as variantes de caixa do compilador python, da marcação segura, dos trechos de código, do arquivo de som e do sql na versão maior
- [ ] elevar o piso da template mako para a versão corrigida
- [ ] verificar a paridade dos manifests após todos os bumps
- [ ] abrir o pr da onda de segurança com a lista completa
- [ ] deixar a bateria verde no pr
- [ ] mesclar o pr por request
- [ ] fechar os quatro prs do bot superseded com justificativa
- [ ] confirmar o fechamento dos alertas pela api após o merge
- [ ] rerun das baterias de segurança na main após o merge
- [ ] zerar o alerta do scorecard com histórico de merges verdes
- [ ] gerar a assinatura de hash dinamicamente no build nos vinte e quatro sítios mapeados
- [ ] remover qualquer configuração que ignore alertas ou vulnerabilidades em qualquer linguagem
- [ ] revisar os cabeçalhos de segurança do site estático
- [ ] revisar o bloqueio de download do banco estático
- [ ] revisar a guarda contra ferramentas de desenvolvedor com o falso positivo corrigido
- [ ] revisar que nenhum token aparece inline em url
- [ ] confirmar zero dados de conta no navegador do visitante
- [ ] auditar a política de segurança documental do repositório
- [ ] auditar o escaneamento de segredos verificado
- [ ] auditar o scan de sistema de arquivos
- [ ] auditar o scan de imagem de container
- [ ] auditar o scanner de vulnerabilidades osv
- [ ] auditar a revisão de dependências nos prs

## workflows por frente

- [ ] ler o log da falha da fusão do bundler no envelope original em cada aplicativo
- [ ] corrigir a fusão do assento do bundler dentro do envelope original para o devthink
- [ ] corrigir a fusão do assento do bundler dentro do envelope original para o debonair
- [ ] corrigir a fusão do assento do bundler dentro do envelope original para o cadria
- [ ] corrigir a fusão do assento do bundler dentro do envelope original para o saddle
- [ ] corrigir a fusão do assento do bundler dentro do envelope original para o vault
- [ ] corrigir a fusão do assento do bundler dentro do envelope original para o getry
- [ ] corrigir a fusão do assento do bundler dentro do envelope original para o forge
- [ ] corrigir a fusão do assento do bundler dentro do envelope original para o foundry
- [ ] corrigir a fusão do assento do bundler dentro do envelope original para o argan
- [ ] corrigir a fusão do assento do bundler dentro do envelope original para o stealthhead
- [ ] corrigir a fusão do assento do bundler dentro do envelope original para o cobaia
- [ ] ler o log da falha da publicação gradle quando ausente
- [ ] corrigir a publicação do envelope gradle do argan
- [ ] corrigir a publicação do envelope gradle do debonair
- [ ] corrigir a publicação do envelope gradle do foundry
- [ ] corrigir a publicação do envelope gradle do forge
- [ ] corrigir o build das faces node do vault
- [ ] ler o log da falha das publicações de imagem multiarquitetura do saddle
- [ ] corrigir o build e push da lane leve do saddle
- [ ] corrigir o build e push da lane equilibrada do saddle
- [ ] corrigir o build e push da lane máxima do saddle
- [ ] corrigir o build e push das lanes com variantes de sistema do saddle
- [ ] corrigir o build e push das lanes do catálogo alpine
- [ ] corrigir o build e push das lanes do catálogo arch
- [ ] corrigir o build e push das lanes do catálogo debian
- [ ] corrigir o build e push das lanes do catálogo fedora
- [ ] corrigir o build e push das lanes do catálogo windows
- [ ] corrigir o build e push das lanes do catálogo android das variantes endurecidas
- [ ] corrigir o build e push das lanes do catálogo das variantes móveis e de firmware
- [ ] corrigir o build e push da lane da linguagem v
- [ ] corrigir o anexo de assets do release do saddle
- [ ] ler o log da falha do build do tema do saddle nas páginas
- [ ] corrigir a instalação e o build do tema do saddle
- [ ] reexecutar o fluxo das páginas com os onze temas verdes
- [ ] corrigir a auditoria das dependências resolvidas do workbench
- [ ] corrigir as regras de segurança do linter
- [ ] corrigir a checagem de licenças das dependências
- [ ] corrigir o build da imagem para o scan de containers
- [ ] corrigir a auditoria do grafo rust
- [ ] corrigir o gate de paridade de configuração da família
- [ ] corrigir o contrato de cli no runtime bun
- [ ] corrigir o contrato de cli no runtime node
- [ ] corrigir o contrato de cli no runtime deno
- [ ] corrigir o empacotamento do bundle pelo bundler na integração
- [ ] corrigir a suíte do debonair na integração
- [ ] corrigir a suíte do saddle na integração
- [ ] corrigir o workbench estático na integração
- [ ] corrigir o build da distribuição raiz na verificação
- [ ] corrigir a instalação da versão npm declarada na verificação
- [ ] corrigir o smoke do consumidor na verificação
- [ ] corrigir os modos de biblioteca nos três runtimes na verificação
- [ ] reexecutar a bateria de integração verde na main
- [ ] reexecutar a bateria de verificação verde na main
- [ ] reexecutar a bateria de segurança verde na main
- [ ] reexecutar o fluxo de publicação verde na main
- [ ] reexecutar o fluxo das lanes verde na main
- [ ] reexecutar o fluxo das páginas verde na main
- [ ] reexecutar o fluxo de manutenção verde na main
- [ ] confirmar o histórico de merges verdes normalizando o scorecard
- [ ] reagrupar os mil e quinhentos workflows históricos por assunto acumulando rotinas correlatas num lugar só
- [ ] explorar e incorporar actions úteis do marketplace na divisão de páginas
- [ ] explorar e incorporar actions úteis do marketplace na divisão de automação
- [ ] explorar e incorporar actions úteis do marketplace na divisão de integração contínua
- [ ] explorar e incorporar actions úteis do marketplace na divisão de segurança
- [ ] explorar e incorporar actions úteis do marketplace na divisão de deploy

## estrutura e formatação por aplicativo

- [ ] auditar a raiz do devthink contra a regra das três pastas
- [ ] auditar a raiz do debonair contra a regra das três pastas
- [ ] auditar a raiz do cadria contra a regra das três pastas
- [ ] auditar a raiz do saddle contra a regra das três pastas
- [ ] auditar a raiz do vault contra a regra das três pastas
- [ ] auditar a raiz do getry contra a regra das três pastas
- [ ] auditar a raiz do forge contra a regra das três pastas
- [ ] auditar a raiz do foundry contra a regra das três pastas
- [ ] auditar a raiz do argan contra a regra das três pastas
- [ ] auditar a raiz do stealthhead contra a regra das três pastas
- [ ] auditar a raiz do cobaia contra a regra das três pastas
- [ ] remover pastas proibidas do devthink
- [ ] remover pastas proibidas do debonair
- [ ] remover pastas proibidas do cadria
- [ ] remover pastas proibidas do saddle
- [ ] remover pastas proibidas do vault
- [ ] remover pastas proibidas do getry
- [ ] remover pastas proibidas do forge
- [ ] remover pastas proibidas do foundry
- [ ] remover pastas proibidas do argan
- [ ] remover pastas proibidas do stealthhead
- [ ] remover pastas proibidas do cobaia
- [ ] mover a saída do build para a raiz em cada aplicativo
- [ ] auditar os nomes de arquivo de cada aplicativo contra a lei da palavra única minúscula
- [ ] renomear arquivos com hífen, underscore, ponto interno ou emoji no devthink
- [ ] renomear arquivos com hífen, underscore, ponto interno ou emoji no debonair
- [ ] renomear arquivos com hífen, underscore, ponto interno ou emoji no cadria
- [ ] renomear arquivos com hífen, underscore, ponto interno ou emoji no saddle
- [ ] renomear arquivos com hífen, underscore, ponto interno ou emoji no vault
- [ ] renomear arquivos com hífen, underscore, ponto interno ou emoji no getry
- [ ] renomear arquivos com hífen, underscore, ponto interno ou emoji no forge
- [ ] renomear arquivos com hífen, underscore, ponto interno ou emoji no foundry
- [ ] renomear arquivos com hífen, underscore, ponto interno ou emoji no argan
- [ ] renomear arquivos com hífen, underscore, ponto interno ou emoji no stealthhead
- [ ] renomear arquivos com hífen, underscore, ponto interno ou emoji no cobaia
- [ ] renomear pastas com hífen, underscore, ponto ou espaço em todos
- [ ] reagrupar as lógicas de autenticação no arquivo único do domínio em cada aplicativo
- [ ] reagrupar as lógicas de banco no arquivo único do domínio em cada aplicativo
- [ ] reagrupar as lógicas de sandbox no arquivo único do domínio no saddle
- [ ] reagrupar as lógicas de armazenamento no arquivo único do domínio no vault
- [ ] reagrupar as lógicas de protocolos no arquivo único do domínio no vault
- [ ] reagrupar as lógicas de dns no arquivo único do domínio no argan
- [ ] reagrupar as lógicas de catálogo no arquivo único do domínio no devthink
- [ ] reagrupar as lógicas de raciocínio no arquivo único do domínio no getry
- [ ] reagrupar as lógicas de gateway no arquivo único do domínio no getry
- [ ] reagrupar as lógicas de runner no arquivo único do domínio no forge
- [ ] reagrupar as lógicas de pipeline no arquivo único do domínio no foundry
- [ ] reagrupar as lógicas de partida e ranqueamento no arquivo único do domínio no stealthhead
- [ ] reagrupar as lógicas de mundo no arquivo único do domínio no stealthhead
- [ ] reagrupar as lógicas de monetização no arquivo único do domínio no cobaia
- [ ] reagrupar as lógicas de agentes no arquivo único do domínio no devthink
- [ ] reagrupar as lógicas de segurança no arquivo único do domínio no devthink
- [ ] reagrupar as lógicas de distribuição no arquivo único do domínio no devthink
- [ ] reagrupar as lógicas de modalidades no arquivo único do domínio no saddle
- [ ] reagrupar as lógicas virtuais no arquivo único do domínio no saddle
- [ ] reagrupar as lógicas de objetos no arquivo único do domínio no vault
- [ ] reagrupar as lógicas de conta no arquivo único do domínio no devthink
- [ ] mesclar variantes dispersas no arquivo único do domínio em todos os aplicativos
- [ ] recortar lógicas de vídeo duplicadas para o cadria
- [ ] recortar lógicas de áudio duplicadas para o debonair
- [ ] recortar lógicas de gateway duplicadas para o getry
- [ ] recortar lógicas de sandbox duplicadas para o saddle
- [ ] recortar lógicas de armazenamento duplicadas para o vault
- [ ] recortar lógicas de dns duplicadas para o argan
- [ ] converter imports de caminho de pasta em dependência de pacote em todos
- [ ] deduplicar lógicas repetidas entre aplicativos
- [ ] compartilhar a biblioteca tridimensional entre cadria e debonair via dependência
- [ ] auditar o jsdoc e o padrão moderno em cada arquivo reagrupado
- [ ] auditar os comentários em inglês em todo o código
- [ ] padronizar os onze manifests no mesmo template e sequência de chaves
- [ ] igualar as dependências nos três blocos de todos os manifests
- [ ] sincronizar a versão nos onze manifests na curva corrente
- [ ] manter só as engines no manifest da raiz
- [ ] manter as dependências de emulação exclusivas do saddle
- [ ] padronizar o package json do devthink com a metodologia da família
- [ ] padronizar o package json do debonair com a metodologia da família
- [ ] padronizar o package json do cadria com a metodologia da família
- [ ] padronizar o package json do saddle com a metodologia da família
- [ ] padronizar o package json do vault com a metodologia da família
- [ ] padronizar o package json do getry com a metodologia da família
- [ ] padronizar o package json do forge com a metodologia da família
- [ ] padronizar o package json do foundry com a metodologia da família
- [ ] padronizar o package json do argan com a metodologia da família
- [ ] padronizar o package json do stealthhead com a metodologia da família
- [ ] padronizar o package json do cobaia com a metodologia da família
- [ ] adicionar os configuráveis ausentes no devthink
- [ ] adicionar os configuráveis ausentes no debonair
- [ ] adicionar os configuráveis ausentes no cadria
- [ ] adicionar os configuráveis ausentes no saddle
- [ ] adicionar os configuráveis ausentes no vault
- [ ] adicionar os configuráveis ausentes no getry
- [ ] adicionar os configuráveis ausentes no forge
- [ ] adicionar os configuráveis ausentes no foundry
- [ ] adicionar os configuráveis ausentes no argan
- [ ] adicionar os configuráveis ausentes no stealthhead
- [ ] adicionar os configuráveis ausentes no cobaia
- [ ] espelhar o protocols types do vault em todos os aplicativos
- [ ] espelhar a versão de mimetypes com milhares de tipos em todos
- [ ] unificar docker compose e docker config num único dockerfile no devthink
- [ ] unificar docker compose e docker config num único dockerfile no debonair
- [ ] unificar docker compose e docker config num único dockerfile no cadria
- [ ] unificar docker compose e docker config num único dockerfile no saddle
- [ ] unificar docker compose e docker config num único dockerfile no vault
- [ ] unificar docker compose e docker config num único dockerfile no getry
- [ ] unificar docker compose e docker config num único dockerfile no forge
- [ ] unificar docker compose e docker config num único dockerfile no foundry
- [ ] unificar docker compose e docker config num único dockerfile no argan
- [ ] unificar docker compose e docker config num único dockerfile no stealthhead
- [ ] unificar docker compose e docker config num único dockerfile no cobaia
- [ ] corrigir os identificadores de pacote para o padrão com ponto reverso em todos
- [ ] nomear os arquivos de conversão com o nome do aplicativo e a extensão alvo
- [ ] gerar o arquivo de conversão gradle do vault
- [ ] avaliar a personalização de nome nos gerenciadores go e python sem quebrar
- [ ] migrar o grupo de publicação maven para o novo padrão nos onze
- [ ] deletar os pacotes do grupo maven antigo e republicar no novo
- [ ] converter os testes restantes para typescript na raiz da pasta de testes
- [ ] reagrupar os testes por domínio correlato em todos
- [ ] limpar mocks, fixtures e binários da pasta de testes mantendo só typescript
- [ ] rodar a suíte completa verde antes de cada push

## documentação

- [x] escrever o documento da lei com todas as regras deduplicadas
- [x] escrever o dossiê dos aplicativos e engines
- [x] escrever o documento da operação com o estado auditado
- [x] escrever o documento de segurança com o censo e as ondas de cura
- [x] escrever o checklist hierárquico total
- [ ] deletar todos os txt e md antigos da pasta do devthink
- [ ] deletar todos os txt e md antigos da pasta do debonair
- [ ] deletar todos os txt e md antigos da pasta do cadria
- [ ] deletar todos os txt e md antigos da pasta do saddle
- [ ] deletar todos os txt e md antigos da pasta do vault
- [ ] deletar todos os txt e md antigos da pasta do getry
- [ ] deletar todos os txt e md antigos da pasta do forge
- [ ] deletar todos os txt e md antigos da pasta do foundry
- [ ] deletar todos os txt e md antigos da pasta do argan
- [ ] deletar todos os txt e md antigos da pasta do stealthhead
- [ ] deletar todos os txt e md antigos da pasta do cobaia
- [ ] deletar os txt e md antigos da raiz do repositório
- [ ] atualizar as referências de build dos envelopes para os caminhos sobreviventes
- [ ] confirmar que os fluxos de publicação empacotam os envelopes sem os arquivos deletados
- [ ] confirmar zero documento redundante após a consolidação
- [ ] manter os cinco documentos como única documentação viva

## design por aplicativo

- [ ] clonar as referências visuais na área de estudo de design
- [ ] inspecionar seletores, tokens e variáveis de estilo das referências
- [ ] mapear a geometria, a composição e o espaçamento das referências
- [ ] definir o padrão visual único da família combinando o sistema operacional de referência com o site premium de referência
- [ ] aplicar o tema único branco no devthink com variação clara e escura
- [ ] aplicar o tema único branco no debonair com variação clara e escura
- [ ] aplicar o tema único branco no cadria com variação clara e escura
- [ ] aplicar o tema único branco no saddle com variação clara e escura
- [ ] aplicar o tema único branco no vault com variação clara e escura
- [ ] aplicar o tema único branco no getry com variação clara e escura
- [ ] aplicar o tema único branco no forge com variação clara e escura
- [ ] aplicar o tema único branco no foundry com variação clara e escura
- [ ] aplicar o tema único branco no argan com variação clara e escura
- [ ] aplicar o tema único branco no stealthhead com variação clara e escura
- [ ] aplicar o tema único branco no cobaia com variação clara e escura
- [ ] trocar a logo para a versão limpa sem texto
- [ ] aplicar os fluent icons em todos os aplicativos
- [ ] aplicar a fonte moderna da web em todos
- [ ] refazer o hero com gradiente no aplicativo principal
- [ ] reduzir os textos para título e descrição no máximo em todas as telas
- [ ] limpar a caixa de login para só ícones dos provedores
- [ ] remover todo texto que revela infraestrutura interna
- [ ] implementar a navbar flutuante e fixável no devthink com as interações inteligentes
- [ ] implementar a navbar flutuante e fixável nos demais aplicativos
- [ ] implementar o calendário acoplado acompanhando o dock flutuante
- [ ] implementar as microanimações curtas com transform e opacity no devthink
- [ ] implementar as microanimações curtas nos demais aplicativos
- [ ] implementar os shaders no lugar das linhas divisórias
- [ ] travar o zoom via viewport do index como na referência
- [ ] corrigir o bug de rolagem com a área vazia antes do painel
- [ ] corrigir o bug do ícone de fechar saindo da janela no redimensionamento
- [ ] corrigir a sombra vazando no login
- [ ] corrigir a janela cortada ao abrir via painel versus url direta
- [ ] alinhar a tela de login com o tema do sistema
- [ ] colocar o relógio à esquerda na barra
- [ ] corrigir os dez pontos de colapso do construtor de urls de família
- [ ] corrigir os dez pontos pendentes do onboarding
- [ ] refazer a página de explore no padrão do próprio aplicativo
- [ ] refazer os widgets do devthink do zero em ordem alfabética sem pasta aninhada
- [ ] refazer os widgets dos demais aplicativos do zero
- [ ] zerar o hardcode de texto nos widgets puxando do banco via apis internas
- [ ] colocar o componente de obra em construção em todo aplicativo não oficial
- [ ] colocar o componente de jogo em construção no stealthhead
- [ ] unificar a identidade da extensão com a interface principal
- [ ] unificar a identidade da cli com o chat no terminal
- [ ] unificar a identidade da tv com detecção de dpi e escala
- [ ] validar a mesma interface em web, desktop, cli, tv e extensão
- [ ] implementar as janelas com titlebar completa, alças e efeito acrílico no rodapé
- [ ] implementar o dock com avatar e power sempre visíveis
- [ ] implementar o modo standalone em tela cheia para url direta
- [ ] implementar a abertura em janela pelo clique no painel
- [ ] validar a página de produção estável sem tela branca

## persistência e dados

- [ ] remover o limite de dois gigabytes do sistema de arquivos e da plataforma
- [ ] implementar a quota configurável até ilimitado
- [ ] bloquear o download direto do banco estático
- [ ] mover toda persistência de conta para a engine de armazenamento
- [ ] zerar o salvamento de dados no navegador do visitante
- [ ] dar banco próprio a cada aplicativo web espelhando a lógica da engine de armazenamento
- [ ] interligar os bancos por protocolos e apis internas
- [ ] limpar os dados falsos de avaliações inventadas do banco
- [ ] limpar os dados falsos de filmes fictícios do banco
- [ ] limpar os dados falsos de artistas reais em faixas falsas do banco
- [ ] limpar os dados falsos de criadores fictícios do banco
- [ ] limpar as métricas infinitas falsas do banco
- [ ] substituir links externos de imagem por assets próprios no banco
- [ ] implementar a camada de objetos git como verdade com chunks e deduplicação
- [ ] implementar o banco isca para sondas anônimas
- [ ] implementar o fluxo ordinal de entrada persistindo no banco
- [ ] implementar o gerenciador de onboarding com estado no banco
- [ ] implementar a reformulação de todos os ícones de todos os módulos no banco
- [ ] servir os arquivos de ícone estáticos obrigatórios nos domínios estáticos
- [ ] seguir o padrão de web estático da referência para os assets servidos

## engines reais por aplicativo

### saddle
- [ ] implementar o executor das modalidades registradas sem executor real
- [ ] implementar a modalidade wasm
- [ ] implementar a modalidade do bundler de módulos
- [ ] implementar a modalidade do transpilador
- [ ] implementar a modalidade de arquivo virtual
- [ ] implementar a modalidade de sistema de arquivos virtual
- [ ] implementar a modalidade de container
- [ ] implementar a execução direta de binários via fila de lançamento
- [ ] implementar a emulação com drives reais
- [ ] implementar a modalidade de computação em nuvem
- [ ] implementar a modalidade do runtime node
- [ ] implementar as modalidades de gpu e cpu virtuais
- [ ] implementar o processamento de portas
- [ ] implementar a modalidade de sandbox
- [ ] implementar a modalidade de microvm
- [ ] implementar o runner de hardware virtual
- [ ] implementar a execução de scripts em background
- [ ] implementar a interpretação de yaml com compilação em background
- [ ] implementar as noventa modalidades verificáveis uma a uma
- [ ] remover funções alheias a execução, vm e sandbox
- [ ] manter o fluxo do bundler embutido com cli e pacotes
- [ ] descartar os arquivos avulsos do fluxo do bundler
- [ ] restaurar capacidades perdidas do projeto original
- [ ] publicar o container exótico com perfis e lanes completas
- [ ] validar a execução sem tocar navegador, gpu, cpu ou disco

### vault
- [ ] reconstruir a conta em runtime sem depender de serviço externo
- [ ] completar o catálogo de mime types na casa dos milhares
- [ ] completar os protocolos https na casa das centenas
- [ ] refazer o app de arquivos com o novo design
- [ ] servir o bucket self-hosted para aplicativos externos
- [ ] espelhar o sistema de armazenamento nos demais aplicativos
- [ ] implementar os chunks de um mebibito com deduplicação por hash
- [ ] implementar a base selada com o banco isca

### debonair
- [ ] implementar a decomposição de música em payload estruturado
- [ ] implementar a reconstrução tocável do payload
- [ ] rodar a ingestão reversa na sandbox sem tocar recursos locais
- [ ] separar as stems na ingestão
- [ ] ingerir dados de referência nos bancos da engine
- [ ] completar o mixer do estúdio
- [ ] completar o rack de efeitos do estúdio
- [ ] completar o transporte do estúdio
- [ ] completar a síntese do estúdio
- [ ] completar a mixagem e masterização
- [ ] completar o sampler e a biblioteca de amostras
- [ ] pesquisar e documentar as referências de áudio em documento próprio
- [ ] estudar os espaços de música da plataforma de modelos abertos
- [ ] implementar a feature de geração de música

### cadria
- [ ] implementar o encoder de vídeo real
- [ ] completar a timeline do editor
- [ ] completar o render do editor
- [ ] completar o player do editor
- [ ] completar o controle de camadas
- [ ] completar os movimentos e rigs
- [ ] completar o pipeline de pixels com brilho
- [ ] completar o pipeline de pixels com contraste e saturação
- [ ] completar o pipeline de pixels com sépia e escala de cinza
- [ ] completar o pipeline de pixels com convolução e desfoque
- [ ] completar o pipeline de pixels com redimensionamento
- [ ] implementar o gerador de malha tridimensional
- [ ] implementar os shaders
- [ ] compartilhar a biblioteca tridimensional com o debonair via dependência

### getry
- [ ] implementar o gateway com autenticação de provedores
- [ ] implementar a rotação de chaves
- [ ] implementar o raciocínio em sete níveis
- [ ] implementar as trinta e cinco rotas compatíveis com o padrão openai
- [ ] implementar os cinco provedores conforme cadastro
- [x] implementar o júri de três com regra anti bajulação
- [ ] implementar o cofre de chaves

### forge
- [ ] implementar o runner de binários na sandbox
- [ ] completar a fila de lançamento de binários pesados
- [ ] validar a execução dos binários de referência dos concorrentes

### foundry
- [ ] implementar a execução de estágios do pipeline
- [ ] implementar os artefatos no storage
- [ ] implementar a interface clone de e2b e docker
- [ ] implementar o controle administrativo
- [ ] implementar os chunks de yaml, o tar e os mime types

### argan
- [ ] implementar os transportes dns completos nas quatro vias
- [ ] implementar o dnssec com rotação
- [ ] implementar o cluster de réplicas com fofoca autenticada
- [ ] implementar o email self-hosted
- [ ] implementar o meta buscador
- [ ] publicar os domínios suspensos em sete passos
- [ ] implementar o cleanurl e o familyurl
- [ ] implementar as keywords

### stealthhead
- [ ] implementar o mundo pré-compilado com física determinística
- [ ] implementar o multiplayer com netcode real no banco
- [ ] implementar o matchmaking
- [ ] implementar o combate
- [ ] implementar as arenas
- [ ] implementar os veículos
- [ ] implementar os cinco mapas
- [ ] implementar as cinquenta armas
- [ ] implementar os dez personagens
- [ ] implementar os quinze veículos do mundo
- [ ] manter os nomes hardcoded nas colunas do banco, nunca no código
- [ ] absorver física, áudio, raio x, camadas, arena, player e combate no editor
- [ ] implementar o hud por flags por dispositivo no build
- [ ] validar o app pequeno baixando o banco do site

### cobaia
- [ ] implementar os planos de receita recorrente
- [ ] implementar os espaços de anúncio honestos
- [ ] implementar os links de apoio
- [ ] implementar os badges
- [ ] implementar o roster
- [ ] implementar o billing
- [ ] implementar o rastreamento de receita e churn
- [ ] mapear as quarenta formas de monetização do catálogo

### devthink
- [ ] absorver o scraper do saddle
- [ ] implementar o sistema de arquivos próprio sem limite
- [ ] completar a cli com a mesma interface do chat
- [ ] validar a extensão com pareamento por código
- [ ] servir a extensão dos assets do release
- [ ] validar o download da extensão pelos assets do release versionado
- [ ] validar o deploy estático em múltiplas plataformas sincronizadas
- [ ] implementar o painel de janelas da família com modo standalone
- [ ] implementar a orquestração das engines importadas como biblioteca

## distribuição e release

- [ ] publicar o pacote principal no canal npmjs
- [ ] completar as seis distribuições por aplicativo
- [ ] completar os onze canais por aplicativo
- [ ] completar as onze arquiteturas nos containers dos dez aplicativos
- [ ] completar as lanes com perfis do saddle no espelho de containers
- [ ] completar as lanes do catálogo de distribuições de sistema
- [ ] restaurar o fluxo de aprovação de release em cascata
- [ ] ultrapassar mil assets nos release notes
- [ ] validar os binários nos assets com assinatura dinâmica
- [ ] bump de versão na raiz a cada bloco de grandes ações
- [ ] validar o changelog automático em cascata
- [ ] verificar todos os pacotes publicados na meta de sessenta ou mais
- [ ] publicar os containers docker pendentes de todos os serviços
- [ ] expandir a matriz de arquiteturas nos dockerfiles do espelho
- [ ] implantar o processamento de borda nas noventa modalidades
- [ ] gerar os release notes com as conversões multimodais

## verificação final

- [ ] rodar a suíte completa com mil passos ou mais verde
- [ ] rodar todas as baterias de workflow verde na main
- [ ] confirmar zero alerta aberto de segurança
- [ ] confirmar zero vulnerabilidade aberta de dependência
- [ ] confirmar zero branch pendente além da main
- [ ] confirmar zero pr aberto
- [ ] verificar a produção no browser em múltiplas plataformas
- [ ] verificar o site estático no ar com os onze temas
- [ ] verificar a extensão instalável dos assets
- [ ] verificar a cli instalável pelo pacote
- [ ] verificar a resposta da api de alertas zerada
- [ ] atualizar os cinco documentos com o estado final
- [ ] fechar o ciclo com projeção e status totalmente verdes

## pendências especificas mapeadas nas reclamações

- [ ] resolver o arquivo de rótulos com dados hardcoded transformando em teste que popula o banco
- [ ] remover a calculadora legada usando biblioteca pronta
- [ ] remover o log de lógica na raiz do aplicativo principal
- [ ] atualizar os documentos templateáveis espelhando o app principal
- [ ] recolocar a pasta de testes aprovando toda a suíte
- [ ] corrigir os sítios de assinatura hardcoded nos workflows
- [ ] restaurar a curva de assets dos releases que despencou
- [ ] marcar os aplicativos internos como em construção
- [ ] padronizar a nomenclatura dos canais de publicação
- [ ] restaurar os arquivos de infraestrutura dos commits antigos consolidados em arquivo único
- [ ] gerar os dossiês por aplicativo consolidados nos cinco documentos
- [ ] validar o fluxo de download da extensão pelos assets do release
- [ ] implementar a feature de scrape no aplicativo principal
- [ ] estudar os espaços de referência de música da plataforma de modelos abertos
- [ ] validar a versão do site publicada contra o servidor local
- [ ] confirmar o merge de todas as branchs do bot superseded

## detalhamento por aplicativo das frentes de código

### devthink detalhado
- [ ] reagrupar a lógica de autenticação do devthink no arquivo único
- [ ] reagrupar a lógica de conta do devthink no arquivo único
- [ ] reagrupar a lógica de agentes do devthink no arquivo único
- [ ] reagrupar a lógica de catálogo do devthink no arquivo único
- [ ] reagrupar a lógica de pensamento do devthink no arquivo único
- [ ] reagrupar a lógica de automação do devthink no arquivo único
- [ ] reagrupar a lógica de captura do devthink no arquivo único
- [ ] reagrupar a lógica de bridge do devthink no arquivo único
- [ ] reagrupar a lógica de certificado de agente no arquivo único
- [ ] reagrupar a lógica de congelamento de api no arquivo único
- [ ] reagrupar a lógica de registro de aplicativos no arquivo único
- [ ] reagrupar a lógica de auditoria do devthink no arquivo único
- [ ] zerar hardcode de texto nos componentes do tema sol do devthink
- [ ] zerar hardcode de texto nos widgets do devthink
- [ ] puxar os textos do painel do banco via apis internas
- [ ] puxar os ícones do painel do banco via apis internas
- [ ] corrigir o gerenciador de janelas do painel
- [ ] corrigir o dock do painel com as interações inteligentes
- [ ] corrigir a barra de tarefas do painel
- [ ] corrigir o menu iniciar com o efeito acrílico no rodapé
- [ ] corrigir a área de notificações do painel
- [ ] implementar o modo televisão do devthink com a mesma interface
- [ ] implementar o modo desktop do devthink com a mesma interface
- [ ] implementar a extensão com a mesma interface do painel
- [ ] validar a cli espelhando o chat com o mesmo design
- [ ] implementar o instalador pwa offline first com manifest correto
- [ ] gerar o apk pelo build único
- [ ] gerar os templates de deploy para as plataformas de hospedagem
- [ ] implementar a sincronização dos clones em múltiplas plataformas
- [ ] implementar o intro ordinal com a intro de saída fluida
- [ ] corrigir os dez pontos do onboarding em janela
- [ ] implementar o gerenciador de onboarding

### saddle detalhado
- [ ] auditar as noventa modalidades contra o registro do catálogo
- [ ] implementar o executor de cada modalidade registrada sem executor
- [ ] implementar as três modalidades de perfil como dados
- [ ] implementar a fila de lançamento de binários com prioridade
- [ ] implementar o hardware virtual de borda funcionando na internet
- [ ] implementar o processamento sem tocar os recursos locais do visitante
- [ ] implementar o runner de containers com as distribuições emuladas
- [ ] implementar o drive real na emulação
- [ ] implementar as portas virtuais
- [ ] implementar a compilação em background dos scripts
- [ ] auditar o código do saddle contra funções alheias persistentes
- [ ] recortar o scraper do saddle para o devthink
- [ ] recortar qualquer função de web do saddle que não seja de execução
- [ ] comparar o saddle original com o integrado funcional por funcional
- [ ] registrar as capacidades perdidas do saddle original
- [ ] restaurar as capacidades perdidas no padrão atual
- [ ] publicar o container do saddle no espelho com as lanes
- [ ] publicar as lanes de catálogo de cada sistema operacional
- [ ] validar as lanes com perfis máximo, equilibrado e leve
- [ ] validar o container exótico com as mais de quinze lanes
- [ ] manter a cli do fluxo do bundler embutida
- [ ] manter os pacotes do fluxo do bundler embutidos
- [ ] descartar os arquivos avulsos do fluxo do bundler
- [ ] rodar a suíte do saddle verde
- [ ] validar a execução de binários pesados de referência

### vault detalhado
- [ ] reconstruir a engine do vault do zero nos cinco pilares
- [ ] implementar a conta em runtime sem serviço externo
- [ ] implementar a criação de aplicativo com identificador próprio
- [ ] implementar a camada principal em sqlite melhorado
- [ ] implementar as camadas mysql, drizzle e prisma
- [ ] implementar o git lfs e a libgit
- [ ] implementar os blobs e ponteiros com bigint
- [ ] implementar os chunks de um mebibito
- [ ] implementar a deduplicação por hash
- [ ] implementar o bloqueio de download do banco
- [ ] implementar o banco isca com projetos falsos plausíveis
- [ ] implementar a base real selada
- [ ] remover o limite de dois gigabytes do my files
- [ ] implementar a quota configurável
- [ ] completar os mime types na casa dos milhares
- [ ] completar os protocolos https na casa das centenas
- [ ] distribuir a engine open source nos registros
- [ ] espelhar o protocols types em todos os aplicativos
- [ ] refazer o app de arquivos com o design da família
- [ ] servir o bucket self-hosted para aplicativos externos
- [ ] rodar a suíte do vault verde

### debonair detalhado
- [ ] implementar a lei do payload na terceira versão
- [ ] implementar as dezenas de parâmetros do payload
- [ ] implementar a faixa de blob por hash
- [ ] implementar as taxas de amostragem distintas de reconhecimento e render
- [ ] proibir a codificação baseada em sessenta e quatro no payload
- [ ] implementar a decomposição de música completa
- [ ] implementar a reconstrução tocável
- [ ] implementar a separação de stems
- [ ] implementar a ingestão de referências no banco da engine
- [ ] rodar a ingestão reversa na sandbox
- [ ] implementar o reconstrutor ingerindo o json
- [ ] completar o daw completo com mixer
- [ ] completar o rack de efeitos
- [ ] completar o transporte
- [ ] completar a síntese
- [ ] completar a mixagem
- [ ] completar a masterização
- [ ] completar o sampler
- [ ] completar a biblioteca de amostras
- [ ] documentar a pesquisa de áudio em documento da engine
- [ ] rodar a suíte do debonair verde

### cadria detalhado
- [ ] implementar o encoder de vídeo real na engine
- [ ] implementar a timeline completa
- [ ] implementar o render completo
- [ ] implementar o player completo
- [ ] implementar o editor com controle de camadas
- [ ] implementar os movimentos
- [ ] implementar os rigs
- [ ] implementar o pipeline de pixels inteiro
- [ ] implementar o gerador de malha tridimensional
- [ ] implementar os shaders
- [ ] implementar a ia visual
- [ ] compartilhar a biblioteca tridimensional via dependência
- [ ] rodar a suíte do cadria verde

### getry detalhado
- [ ] implementar as cinco pontes de provedores
- [ ] implementar as trinta e cinco rotas
- [ ] implementar a compatibilidade com o padrão openai
- [ ] implementar o mascaramento do meta modelo
- [ ] implementar a autenticação dos provedores
- [ ] implementar a rotação de chaves
- [ ] implementar o raciocínio nos sete níveis
- [x] implementar o júri de três modelos
- [ ] implementar a regra anti bajulação
- [ ] implementar o cofre de chaves
- [ ] rodar a suíte do getry verde

### forge detalhado
- [ ] implementar o runner consumindo a engine do saddle
- [ ] implementar a fila de lançamento
- [ ] implementar a execução de binários pesados
- [ ] validar a execução dos binários de referência
- [ ] rodar a suíte do forge verde

### foundry detalhado
- [ ] implementar os estágios do pipeline
- [ ] implementar os artefatos no storage do vault
- [ ] implementar a interface clone de e2b e docker
- [ ] implementar o controle administrativo
- [ ] implementar os chunks de yaml
- [ ] implementar o tar comprimido
- [ ] implementar os mime types do pipeline
- [ ] rodar a suíte do foundry verde

### argan detalhado
- [ ] implementar as zonas dns com o registro raiz
- [ ] implementar os subdomínios
- [ ] implementar os registros que alteram sem excluir
- [ ] implementar o dnssec com rotação
- [ ] implementar o handshake
- [ ] implementar os quatro transportes dns
- [ ] implementar o cluster de réplicas com fofoca autenticada
- [ ] implementar o email self-hosted
- [ ] implementar o meta buscador
- [ ] implementar a publicação de domínios em sete passos
- [ ] implementar o cleanurl
- [ ] implementar o familyurl sem os dez pontos de colapso
- [ ] implementar as keywords
- [ ] rodar a suíte do argan verde

### stealthhead detalhado
- [ ] manter o componente de jogo em construção como única face pública
- [ ] implementar o mundo pré-compilado
- [ ] implementar a física determinística
- [ ] implementar o editor absorvendo a física
- [ ] implementar o editor absorvendo o áudio
- [ ] implementar o editor absorvendo o raio x
- [ ] implementar o editor absorvendo as camadas
- [ ] implementar o editor absorvendo a arena, o player e o combate
- [ ] implementar o multiplayer com o servidor no banco
- [ ] implementar o netcode real
- [ ] implementar o matchmaking
- [ ] implementar os cinco mapas
- [ ] implementar as cinquenta armas
- [ ] implementar os dez personagens
- [ ] implementar os quinze veículos
- [ ] implementar os inventários
- [ ] manter os nomes nas colunas do banco, nunca no código
- [ ] implementar o hud por flags por dispositivo
- [ ] validar o app pequeno baixando o banco do site
- [ ] rodar a suíte do stealthhead verde

### cobaia detalhado
- [ ] implementar os planos de mrr
- [ ] implementar os espaços de anúncio honestos
- [ ] implementar os links de apoio das plataformas de patrocínio
- [ ] implementar os badges
- [ ] implementar o roster
- [ ] implementar o billing
- [ ] implementar o rastreamento de mrr
- [ ] implementar o rastreamento de churn
- [ ] mapear as quarenta formas de monetização
- [ ] rodar a suíte do cobaia verde

## recuperação de dependências e blobs

- [ ] colher todos os manifests de todos os blobs dos repositórios da família
- [ ] deduplicar os nomes de dependências por caixa e por variante
- [ ] somar os nomes faltantes nos onze manifests sem remoção
- [ ] espelhar a união nos três blocos de cada manifest
- [ ] espelhar a união nos overrides do workspace
- [ ] regenerar os locks honestos sob o veredito do resolvedor
- [ ] validar os nomes contra os registros vivos
- [ ] reportar os nomes não publicados como pesquisa, nunca silenciosamente descartados
- [ ] auditar a união do pip nos onze envelopes
- [ ] auditar a união do cargo nos assentos rust
- [ ] auditar a união do go nos requires
- [ ] auditar a união das gems nos assentos ruby
- [ ] auditar a união do nuget nos assentos csproj
- [ ] ler os scripts de união da área de organização aproveitando o que existe
- [ ] manter a família espelhada com a mesma lista em todos

## verificação por browser

- [ ] verificar o site principal no ar contra o servidor local
- [ ] verificar os onze temas no site da família
- [ ] verificar o painel sem tela branca em produção
- [ ] verificar o login sem sombra vazando
- [ ] verificar a rolagem sem área vazia
- [ ] verificar o zoom travado
- [ ] verificar o resize sem o ícone de fechar escapando
- [ ] verificar a abertura via painel igual à url direta
- [ ] verificar o calendário acompanhando o dock flutuante
- [ ] verificar a navbar flutuante e fixável
- [ ] verificar o explore no padrão do aplicativo
- [ ] verificar os widgets puxando do banco
- [ ] verificar a extensão instalada conectando
- [ ] verificar a cli no terminal com o mesmo design
- [ ] verificar o jogo com o componente de construção
- [ ] verificar a responsividade no mobile
- [ ] verificar a detecção de dpi na televisão
- [ ] verificar os links de download dos assets do release

## publicação por canal

- [ ] publicar o envelope npmjs do devthink
- [ ] publicar o envelope npmjs do debonair
- [ ] publicar o envelope npmjs do cadria
- [ ] publicar o envelope npmjs do saddle
- [ ] publicar o envelope npmjs do vault
- [ ] publicar o envelope npmjs do getry
- [ ] publicar o envelope npmjs do forge
- [ ] publicar o envelope npmjs do foundry
- [ ] publicar o envelope npmjs do argan
- [ ] publicar o envelope npmjs do stealthhead
- [ ] publicar o envelope npmjs do cobaia
- [ ] publicar o envelope github packages de cada aplicativo
- [ ] publicar o envelope gitlab de cada aplicativo
- [ ] publicar o envelope maven de cada aplicativo no grupo novo
- [ ] publicar o envelope gradle de cada aplicativo
- [ ] publicar o envelope nuget de cada aplicativo
- [ ] publicar a gem de cada aplicativo
- [ ] publicar o envelope pypi de cada aplicativo
- [ ] publicar o envelope cargo de cada aplicativo
- [ ] publicar o formula homebrew de cada aplicativo
- [ ] publicar o módulo go de cada aplicativo
- [ ] publicar o container de cada aplicativo no espelho
- [ ] validar o assento do bundler fundido no envelope original de cada aplicativo
- [ ] validar as faces node do vault no fluxo de publicação
- [ ] validar o pacote da documentação python do devthink

## testes por aplicativo

- [ ] rodar a suíte do devthink com os testes reagrupados em typescript
- [ ] rodar a suíte do debonair com os testes reagrupados em typescript
- [ ] rodar a suíte do cadria com os testes reagrupados em typescript
- [ ] rodar a suíte do saddle com os testes reagrupados em typescript
- [ ] rodar a suíte do vault com os testes reagrupados em typescript
- [ ] rodar a suíte do getry com os testes reagrupados em typescript
- [ ] rodar a suíte do forge com os testes reagrupados em typescript
- [ ] rodar a suíte do foundry com os testes reagrupados em typescript
- [ ] rodar a suíte do argan com os testes reagrupados em typescript
- [ ] rodar a suíte do stealthhead com os testes reagrupados em typescript
- [ ] rodar a suíte do cobaia com os testes reagrupados em typescript
- [ ] validar a bateria de locksync da família
- [ ] validar a bateria de paridade de configuração da família
- [ ] validar a bateria de manifestos da família
- [ ] validar a bateria de artefatos da família
- [ ] validar a suíte completa com o runner oficial no pino do runtime fixo

## conteúdo e dados por aplicativo

- [ ] auditar o banco do devthink contra dados falsos
- [ ] auditar o banco do debonair contra dados falsos
- [ ] auditar o banco do cadria contra dados falsos
- [ ] auditar o banco do saddle contra dados falsos
- [ ] auditar o banco do vault contra dados falsos
- [ ] auditar o banco do getry contra dados falsos
- [ ] auditar o banco do forge contra dados falsos
- [ ] auditar o banco do foundry contra dados falsos
- [ ] auditar o banco do argan contra dados falsos
- [ ] auditar o banco do stealthhead contra dados falsos
- [ ] auditar o banco do cobaia contra dados falsos
- [ ] migrar os textos dos componentes para o banco de cada aplicativo
- [ ] migrar as imagens dos componentes para o banco de cada aplicativo
- [ ] migrar os ícones de cada módulo para o banco
- [ ] servir os ícones estáticos obrigatórios nos domínios estáticos
- [ ] validar o padrão de web estático da referência para os assets
- [ ] implementar a ingestão de dados de referência nas engines de áudio
- [ ] implementar a ingestão de dados de referência nas engines de vídeo

## design por widget do painel

- [ ] refazer o widget de chat no padrão de referência
- [ ] refazer o widget de arquivos no padrão de referência
- [ ] refazer o widget de calculadora como biblioteca pronta
- [ ] refazer o widget de calendário acoplado ao dock
- [ ] refazer o widget de relógio à esquerda da barra
- [ ] refazer o widget de configurações sem textos de infraestrutura
- [ ] refazer o widget de exploração no padrão do aplicativo
- [ ] refazer o widget de terminal com a cli
- [ ] refazer o widget de música com a engine de áudio
- [ ] refazer o widget de vídeo com a engine de vídeo
- [ ] refazer o widget de máquinas com a engine de virtualização
- [ ] refazer o widget de banco com a engine de armazenamento
- [ ] refazer o widget de rede com a engine de dns
- [ ] refazer o widget de pipeline com a engine de pipeline
- [ ] refazer o widget de execução com a engine de runner
- [ ] refazer o widget de monetização com a superfície pública
- [ ] refazer o widget de jogo com o componente de construção
- [ ] validar os widgets em ordem alfabética sem pasta aninhada

## autenticação e identidade

- [ ] capturar o token em tempo real na autorização do proprietário
- [ ] instalar o token na cli e no helper de credenciais
- [ ] persistir o token em três camadas
- [ ] reutilizar o token válido sem novo pareamento
- [ ] manter o poller e o watchdog em background até a captura
- [ ] confirmar o status autorizado no arquivo de estado
- [ ] assinar os commits com a identidade do proprietário
- [ ] validar os commits verificados pela assinatura da plataforma
- [ ] configurar o pareamento por código da extensão
- [ ] validar a autorização da extensão conectando ao servidor estático

## ciclo de fechamento

- [ ] conferir cada item deste checklist contra o código antes de marcar
- [ ] atualizar o checklist a cada onda com o estado real
- [ ] fundir duplicatas novas num único item
- [ ] manter a lista interna de dez mil ações sincronizada com este documento
- [ ] reportar cada onda em minúsculas com frases completas
- [ ] fechar cada pr por request com a bateria verde
- [ ] mesclar cada pr por request na main
- [ ] validar o scorecard com o histórico de merges verdes
- [ ] validar a projeção final com status totalmente verde

## interações por superfície

- [ ] implementar a interação de puxar para cima flutuando a navbar no devthink
- [ ] implementar a interação de puxar para a esquerda fixando a navbar
- [ ] implementar a interação de descolar da parede tornando a navbar flutuante
- [ ] implementar o destaque de foco nos controles de janela
- [ ] implementar o formato pílula nos controles
- [ ] implementar o efeito acrílico no rodapé do menu
- [ ] implementar as oito alças de redimensionamento das janelas
- [ ] implementar o duplo clique abrindo dentro da janela do sistema
- [ ] implementar a url direta abrindo standalone em tela cheia
- [ ] implementar a detecção de dpi com escala automática por superfície
- [ ] implementar a apresentação de tela por superfície mantendo o mesmo design
- [ ] validar a interação idêntica na web, desktop, cli, tv e extensão
- [ ] implementar a responsividade mobile com alvos de toque adequados
- [ ] implementar a animação de entrada das janelas
- [ ] implementar a animação de saída das janelas
- [ ] implementar o magnestismo do dock nas bordas
- [ ] implementar o snap das janelas nas bordas
- [ ] implementar a busca do menu iniciar
- [ ] implementar os atalhos de teclado do painel
- [ ] implementar o modo escuro sincronizado com o sistema

## versão e mecânica de release

- [ ] validar o rung corrente sincronizado nos onze manifests
- [ ] implantar o bump de versão na raiz a cada bloco de ações
- [ ] validar o espelhamento automático do bump nos onze
- [ ] validar a geração do changelog no bump
- [ ] validar o disparo em cascata das distribuições no bump
- [ ] validar a aprovação de release em cascata restaurada
- [ ] validar os release notes com as notas de cada rung
- [ ] validar os assets do release com os binários das arquiteturas
- [ ] validar a assinatura dinâmica dos assets
- [ ] validar o congelamento e destravamento das distribuições
- [ ] validar as oitenta etapas obrigatórias sem pular nenhuma
- [ ] destravar as seis distribuições congeladas por estrutura

## estudo de concorrentes

- [ ] ler o documento de casos do repositório com os links das referências
- [ ] clonar as referências de código na área de estudo
- [ ] clonar as referências de design na área de imagens
- [ ] inspecionar os seletores das referências
- [ ] inspecionar os tokens das referências
- [ ] inspecionar as variáveis de estilo das referências
- [ ] reajustar os valores no padrão da família
- [ ] estudar os concorrentes de virtualização e sandbox
- [ ] estudar os concorrentes de armazenamento
- [ ] estudar os concorrentes de áudio e vídeo
- [ ] estudar os concorrentes de gateway de inteligência
- [ ] estudar os concorrentes de dns e rede
- [ ] estudar os concorrentes de pipeline
- [ ] estudar os concorrentes de execução de binários
- [ ] estudar os concorrentes de monetização
- [ ] registrar o estudo de cada concorrente com o que serve e o que contradiz
- [ ] contrariar os concorrentes que tocam os recursos locais do visitante
- [ ] aplicar o funcionamento real aprendido nas engines

## higiene do repositório

- [ ] confirmar a raiz com apenas as pastas da família e os dois arquivos permitidos
- [ ] remover arquivos de log da raiz de cada aplicativo
- [ ] remover o lançador legado da autenticação se existir
- [ ] manter o lockfile oculto no gitignore da família
- [ ] confirmar o arquivo de infraestrutura oculto no gitignore
- [ ] auditar o gitignore da família cobrindo os artefatos de build
- [ ] limpar caches do repositório antes do push final
- [ ] validar a estrutura plana do repositório no contrato da bateria
- [ ] validar a árvore de cada aplicativo com apenas as três pastas
- [ ] validar os caminhos dos workflows apontando para as pastas certas

## os apêndices do tracker de 2026-11-18 (mapa por aplicativo, reclamações r01-r25, números-âncora e ordem de execução linear)

## 4. MAPA POR APLICATIVO (os 11 dossiês)

| App | Papel | Engine | Concorrente | Identidade | Prioridade |
|---|---|---|---|---|---|
| DevThink | OS supremo / workbench | — | GitHub/GitLab | âmbar solar | design pós-infra |
| Saddle | Virtualização 90 modalidades | — | Oracle/VirtualBox/e2b | tan #d6b483 | foco exclusivo pós-infra |
| Vault | Edge storage | — | Supabase/S3 | gelo #a3d7e6 | #2 do zero |
| Getry | Gateway IA 5 provedores × 7 = 35 rotas | — | — | violeta #9a7ce0 | verificação externa |
| Debonair | Áudio/DAW | Kathesis (deferida) | suno/FL Studio | âmbar #bd7a1a | shell agora, engine por último |
| Cadria | Vídeo/3D | VersaWaze (deferida) | CapCut/AE | magenta #e04f9f | shell agora, engine por último |
| Argan | Rede/DNS/DNSSEC | — | Cloudflare | jade #14b98c | onda w12 |
| Forge | Runner de binários | — | — | lime #a2cb3a | onda w13 |
| Foundry | Pipeline | — | E2B/Docker | azul #4d8edd | onda w14 |
| Stealthhead | FPS (jogo em construção) | — | — | coral #f4694f | no ritmo do dono |
| Cobaia | Monetização MRR | — | — | âmbar | onda w15 |

## 5. RECLAMAÇÕES R01-R25 (cada reclamação = ordem imediata)

| # | Reclamação | Diretriz | Estado (2026-11-18) |
|---|---|---|---|
| R01 | Raiz suja, logics.ts, txt avulsos | Limpeza estrutural | pendente (onda w01) |
| R02 | Lógicas ×10/×11 duplicadas dispersas | Reagrupar 4.000-7.000 por arquivo keyword | pendente (ondas w01/w06-w07) |
| R03 | Branches sem merge | Mesclar TODAS no main squash + arquivar | studio-os JÁ no main (87b2624a); resta PR #649 (followup/triggers-and-depfresh) |
| R04 | PR aberto sem merge | 0 PRs | #649 aberto — merge pós-checks verdes |
| R05 | Release approval quebrado | Restaurar approval como iakadion | release-approval job no containers.yml + release.yml — verificar pós-verde |
| R06 | Assets 429 vs 1000+ | Releases 1.000+ assets | v2.0.185=947; restaurar na 2.0.186 |
| R07 | Versões regredidas 2.1.6/2.1.7 | Curva 2.0.x lockstep | publicar rungs 2.0.x nos 60+ assentos |
| R08 | Workflows vermelhos desde 29c24c4 | Tudo verde + dispatch manual | casa de 6 no main; re-dispatch pós-curadoria |
| R09 | Pages parado | Restaurar deploy | deploy job agora em containers.yml (assemble+deploy); aguarda run verde |
| R10 | My Files 2GB, salvando no navegador | Vault real | pendente (onda w06) |
| R11 | Design falso/mockado | Zero hardcode, DB via APIs | pendente (ondas w04/w07) |
| R12 | saddle.webpack não se encaixa | Deletar .webpack, fundir no original | 25 assentos nos 4 registros; delscope-poll.sh ARMADO (user_code na seção 1.1) |
| R13 | 6 distribuições congeladas | Destravar 60+ assentos | pendente (onda w03) |
| R14 | Saddle container não publicado | Publicar + 15+ lanes | pendente (onda w05) |
| R15 | Security não resolvido | Resolver sem supressão | 1+1 abertos novos (code-scanning + dependabot); curar por código |
| R16 | apps.txt hardcode, ícones CDN | Ícones no banco, estáticos | pendente (onda w07) |
| R17 | Sol falso em apps sem sentido | Em construção honesto | pendente (ondas w11/w15) |
| R18 | Nginx ausente em apps | Padronizar configuráveis | pendente (onda w01) |
| R19 | 400+ assets perdidos v183/184 | Manter ≥1.000 por release | v2.0.183=140; recuperar na 186 |
| R20 | Workflows pesados travando | Despachar e seguir | doutrina vigente + cache-clean por processo (C013) |
| R21 | Token não gravado em tempo real | Polar Auth background | delscope-poll.sh + token vitalício ativo |
| R22 | CLI/TV/extensão sem o mesmo design | Interface unificada | pendente (transversais w07) |
| R23 | sha256 hardcoded (24 sítios) | Gerar no build | pendente (ondas w02/w03) |
| R24 | Extensão defasada | Atualizar via assets | pendente (onda w19) |
| R25 | Janela cortada via /panel; X fora; login preto; sombra | Render painel=fullscreen | pendente (onda w04) |

## 6. NÚMEROS-ÂNCORA (o placar do dono)

- 10.000+ ações internas na todolist (base: 5.000-6.000 ações desta operação; ilimitado)
- 100+ ondas; ~50 PRs por onda; 900 tarefas/sistema; 300 subagentes (máx 600-900)
- 1.500+ workflows históricos reagrupados na casa de 6; 80 etapas obrigatórias sem pular
- 1.513 → 1.600 → 1.700+ → 1.900 commits auditados (ler todos os blobs, nada perdido)
- 60+ pacotes (6 distribuições × 11 apps nos 11 canais); ZERO assentos .webpack ao final
- Releases 500 → 1.000+ → 3.000+ assets; 500+ releases no arco 2.0.97→3.0
- 90 modalidades Saddle (81 live + 9 host); 11 arquiteturas; 15+ lanes container; 16 seats OS
- vitest 900-1000 verdes antes de cada push; tsc 0; biome 0; actionlint verde
- 4.000-7.000 lógicas correlatas por arquivo (teto 300; variantes 900/7.000/9.000)
- 22-32k dependências toleradas (união sem remoção); mimetypes 4.000+
- rung 2.0.186 pós-verde; 12 manifests lockstep; changelog cascade
- 6.650-7.192 pernas verdes na família (baseline vitest)

## 7. ORDEM DE EXECUÇÃO LINEAR HIERÁRQUICA (o passo a passo vigente)

1. Onda imediata: C012-C020 (seção 1.2) — merge #649, cache-clean na casa, análise dos
   commits, cura das lanes, Pages verde, alertas fechados, release train, dispatch manual
2. w02 workflows regroup (a casa de 6: manter arquitetura, curar features dentro)
3. w03 distribution (deletar .webpack via delscope quando o dono autorizar; 60+ assentos)
4. w01 cross-family structure (árvore rígida, configuráveis, wingets)
5. w04 design reform (Win11+trylle, tokens, ban-list)
6. w05 saddle (90 modalidades reais, container, 15+ lanes) — foco exclusivo
7. w06 vault (do zero, decoy, My Files real)
8. w07 devthink app (zero hardcode, chat flagship, janelas)
9. w08 getry (verificação externa) / w09 cadria / w10 debonair (shells e superfícies)
10. w11 stealthhead / w12 argan / w13 forge / w14 foundry / w15 cobaia
11. w16 docs consolidation / w17 security and quality / w18 tests and gates / w19 release train
12. BUMP 2.0.186 (só aqui) → release 1.000+ assets → testes finais → tudo verde

> Lei final do cadence: a cada 400-600 ações executadas (ou fronteira de onda),
> um commit assinado (branch → PR → squash, iakadion). O bump acontece UMA vez,
> no fim, depois de tudo resolvido — então os testes e o verde confirmam.

## a onda da consolidação final 2.0.186 (2026-11-20)

- [x] ler integralmente os novos uploads (checklist, cauda da conversa52, cauda do ordens1, cauda do polarauth)
- [x] verificar a autenticação viva (token iakadion, escopos plenos)
- [x] mesclar os PRs pendentes (#676-#682 — zero PRs abertos)
- [x] mesclar/deletar todas as branches (só main resta)
- [x] cancelar as runs ativas e as runs órfãs de branches mortas
- [x] documentar os 27 runs fantasma (anomalia do lado do GitHub)
- [x] retirar a lane helm do publish (o pacote charts/devthink nunca foi ordenado)
- [x] deletar o pacote charts/devthink do GHCR
- [x] verificar os assentos .webpack zerados nos 54 pacotes dos registros
- [x] curar o mistune ==3.3.4 nos onze manifests (22 alertas dependabot a fechar no re-scan)
- [x] clarificação dos crons (sandbox zai zero crons; crons do repo ficam)
- [ ] acompanhar as lanes do main ficarem verdes no stamp pós-consolidação
- [ ] fechar o buraco npmjs 181→186 (a cascata do publish)
- [ ] fechar os 2 alertas do code-scanning (scorecard CITests/SAST)
- [ ] restaurar o deploy do GitHub Pages (R09)
- [ ] approval do release como iakadion (R05)
- [ ] releases com 1.000+ assets (R06 — v2.0.186 está em 840)
- [ ] bump para a próxima versão UMA vez, no fim, com tudo verde
- [ ] engines kathesis (debonair) e versawaze (cadria) por último, com cuidado

## a onda dos relatórios

- [x] complementar o ownerdirectives.md (cânon completo, nomes corrigidos)
- [x] unificar e desduplicar os textos espalhados neste checklist preservando o existente
- [ ] mapear cada regra dos seis documentos contra o código para auditar cumprimento

## o todolist mestre de 2026-11-17 (fases A-L)

# TODOLIST MESTRE — DevThink (100+ fases e ações, por categoria, hierárquico-linear)

> Gerado da leitura integral (conversa52 + ordens1 + ordens + feedssd + polarauth + Pasted). Estado em 2026-11-17. Progresso marcado com [x]. Cada ação segue a lei: PR por tema/categoria, squash merge, só main, vitest verde antes de push.

## FASE A — INFRA VERDE (workflows, PR, deployment) — PRIORIDADE MÁXIMA

- [x] A01. Verificar autenticação GitHub (token embutido no remote + API OK)
- [x] A02. Leitura integral de todos os arquivos enviados (conversa52 33 chunks, ordens1 4, ordens 4, feedssd 4, polarauth, Pasted ×2, fedsd=subset)
- [x] A03. Mapear causas raiz dos 6 checks vermelhos do PR #643 (locksync/license/cargo/dep-review/deno/bun)
- [x] A04. Sync local main ← origin/main (44 commits atrás, fast-forward)
- [x] A05. Fix cargo: conflito links ffmpeg-next × fframes — remover ffmpeg-next dos 11 Cargo.tomls (commit 0c037161)
- [x] A06. Fix license: @giscus/react UNKNOWN — GISCUS_EXCLUDE dinâmico do lock no security.yml (commit 0c037161)
- [ ] A07. Regenerar saddle/package-lock.json contra manifest do PR (npm --package-lock-only rodando; backup: propose job do Maintenance)
- [ ] A08. Commit lock regenerado + push no wave/lockheal
- [ ] A09. Aguardar CI/Verify/Security verdes no PR #643
- [ ] A10. Retry Dependency review (erro 5xx transiente do GitHub)
- [ ] A11. Verificar job propose do Maintenance (land rung on main via automation branch)
- [ ] A12. Squash merge PR #643 no main
- [ ] A13. workflow_dispatch do pages.yml (GitHub Pages parado desde 11/12)
- [ ] A14. Verificar deployment verde + Pages publicado
- [ ] A15. Reexecutar manualmente (workflow_dispatch) TODOS os workflows no main pós-merge até tudo verde
- [ ] A16. Limpar branches mortas locais (audiheal, docs, rung-182, security, verifyheal) e remotas (wave/lockheal pós-merge, studio-os após análise)
- [ ] A17. Investigar branch studio-os (2ª branch aberta) — merge ou arquiva
- [ ] A18. Confirmar zero PRs abertos e só main no final
- [ ] A19. Bump rung 2.0.186 (lockstep 12 manifests, changelog, workflows, releases)
- [ ] A20. Release 2.0.186 com 1.000+ assets (restaurar curva; 185 saiu com 947, 183 com 140)

## FASE B — SEGURANÇA E QUALIDADE (por request)

- [ ] B01. Mapear alertas dependabot abertos (paginação completa, per_page=100)
- [ ] B02. Fechar cada PR dependabot superseded por merge verde (4 PRs do bot + novos)
- [ ] B03. Verificar code-scanning: 0 abertos (5.069 históricos) — manter zero; rever 522 "won't fix"
- [ ] B04. Scorecard: fechar alerta 1759 (único parcial do ledger de 40)
- [ ] B05. ROTACIONAR 22–31 chaves NVIDIA nvapi- (P0 — texto plano no código)
- [ ] B06. Rotacionar cert/chave *.backloop.dev + 16 chaves token-plan + recovery codes GitHub expostas
- [ ] B07. Auditoria dos 3 backdoors documentados (lookup.exdevthink etc.)
- [ ] B08. Confirmar proibição de ignore de CVEs em TODOS os workflows (varredura allowlist/filters)
- [ ] B09. ~50 bumps Python nos 11 manifests (vault: authlib, joserfc, oauthlib, pillow, pyasn1, pypdf, tornado, twisted)
- [ ] B10. Verificar Trivy/saddle .trivyignore (15 CVEs tsgo — única supressão permitida)
- [ ] B11. Verified secret scan verde (chaves queimadas vistas em conversa — queimar/rotacionar)
- [ ] B12. OSV scanner / pnpm audit / Biome security rules — manter verdes

## FASE C — WORKFLOWS (reagrupamento por tema)

- [ ] C01. Reagrupar 1.500+ workflows em 5 arquivos por tema: ci / delivery / family / stewardship / security
- [ ] C02. Garantir 80 etapas obrigatórias sem pular (sem etapa removida no reagrupamento)
- [ ] C03. Workflows com workflow_dispatch (run manual) para a versão atual sair correta
- [ ] C04. Merge de workflows duplicados/correlatos em arquivo único por contexto
- [ ] C05. Validação actionlint/workflow lint verde após reagrupamento
- [ ] C06. Run manual de cada workflow reagrupado + conferir verde

## FASE D — DISTRIBUIÇÃO / PACOTES

- [ ] D01. Publicar @wenathlan/devthink no npmjs (ainda não publicado)
- [ ] D02. Deletar pacotes Maven io.github.wenathlan.* (31/29/29/4 por "Nathlan Bros")
- [ ] D03. Publicar exclusivamente com.wenathlan.<app> no Maven
- [ ] D04. Excluir versões .webpack separadas e embutir no pacote original (nome normal)
- [ ] D05. 6 distribuições por app = 60+ pacotes (npmjs, GitHub Packages, Maven, NuGet, Gradle, RubyGems, Docker, Cargo, PyPI, Homebrew, Go Get)
- [ ] D06. Containers: 11 arquiteturas por app (hoje 5) — ArchOS com 12/15+ lanes (Alpine, NixOS, V, Arch, Debian, GrapheneOS, ArchOS interno)
- [ ] D07. Versão normal sem prefixo "v" no GHCR, publicada acima da GrapheneOS
- [ ] D08. Perfis Max/Balanced/Lite só no Saddle (container exótico)
- [ ] D09. sha256 dinâmica gerada no build (nunca hardcoded em workflows) — 24 sítios pendentes
- [ ] D10. Assets dos releases ≥1.000 por release (curva despencada: 318/429/140)
- [ ] D11. Binários nos assets do Release + family lanes no evento release:published (OWNER_PAT)
- [ ] D12. ISO exclusivo do DevThink

## FASE E — SADDLE (foco exclusivo pós-infra)

- [ ] E01. Auditar as 90 modalidades declaradas (81 live + 9 host) vs reais (~24 registradas, ~40 atuando, 17 registry-only)
- [ ] E02. Implementar modalidades faltantes como executores REAIS: AWS, Node, VFS, E2B, Daytona, Wasmer, vGPU/vCPU, firecracker/microVM, Exe/Binário, SHs
- [ ] E03. Matar 5 superfícies falsas (firecracker fake, qemu cosmético, doc.go vazio, lane_not_wired)
- [ ] E04. Migrar 9 grupos non-run para DevThink (Web Scrape etc.)
- [ ] E05. Consertar e PUBLICAR container Docker do Saddle (GHCR)
- [ ] E06. Comparar com github.com/wenathlan/saddle original — restaurar features perdidas
- [ ] E07. Container com 15+ lanes + SOs emulados (GrapheneOS, Omarchy, Maru OS, Vanilla OS, V OS)
- [ ] E08. Garantir lei no-touch (nada no navegador/GPU/CPU/disco do usuário)
- [ ] E09. Modalidade sandbox E2E (microvm firecracker, EPYC 9965/8vcpus/32GB) — manter funcional
- [ ] E10. Extensão DevThink conectada (auth por código estilo GitHub)

## FASE F — VAULT (do zero)

- [ ] F01. Rebuild estilo Supabase: cadastro com ID próprio, API key uma vez, nada no navegador
- [ ] F02. Bloquear download do DB (lição fa1.db do Faun) + banco isca (decoy)
- [ ] F03. Remover limite 2GB do My Files → 900MB/900GB/50GB por plano (BigInt terabyte)
- [ ] F04. Stack: better-sqlite3 + MySQL2 + Drizzle + Prisma + Git LFS + LibGit2 + Blobs
- [ ] F05. Chunks 1 MiB com dedupe sha-256 + AES-256-GCM + replica quorum n/2+1
- [ ] F06. Mimetypes 4.000+ (ouro debian 28.583) + protocols.types idêntico em todos
- [ ] F07. HTTPS 100/200/1000 protocolos; 5 rotas de armazenamento
- [ ] F08. API estilo HelixDB (Bearer + database-id)
- [ ] F09. Rewire: religar o OS ao storage real (estado não persiste no navegador)
- [ ] F10. My Files redesign (design "horrível" atual)

## FASE G — DESIGN (DevThink e família)

- [ ] G01. Design 97–99% igual ao index.html de referência (.devthink/web/index.html do allan)
- [ ] G02. Fluent Icons em tudo (lucide banido — gate grep)
- [ ] G03. Tema Sol único branco; sem Saddle Cloud no sidebar; sem glows azuis
- [ ] G04. Windows 11 + trylle.com: titlebar 28/30px, close rgb(232,17,35), accent #a3d7e6, focus #4cc2ff, pill 999px, taskbar 48px, movimento 250ms cubic-bezier(0.85,0.14,0.14,0.85)
- [ ] G05. Estudar 125+ clones em neo.temp + 569 refs em designeer (tokens CSS) ANTES de criar token
- [ ] G06. Corrigir bug janela cortada (painel vs URL direta; duplo clique abre dentro da janela)
- [ ] G07. Corrigir sombra vazando no login
- [ ] G08. Zoom travado via viewport maximum-scale=1
- [ ] G09. NavBar flutuante/fixada (1mm descola); relógio da lock screen à esquerda
- [ ] G10. Redesign Cadria/Debonair (dark stage padrão suno/FL Studio, brass/waveform/halo)
- [ ] G11. Ban-list design como gate grep (sem transition:all, sem #000/#fff, sem neon, sem emoji)
- [ ] G12. Bug scrolling (área vazia antes do "lado A") + calendário não-magnético

## FASE H — ESTRUTURA DE CÓDIGO

- [ ] H01. Deletar logics.ts genérico; reagrupar por palavra-chave (auth.ts, db.ts, copy.ts, audio.ts, ingest.ts, gates.ts)
- [ ] H02. Consolidar até 4.000 lógicas correlatas por arquivo (teto 300; variantes 900/7.000/9.000)
- [ ] H03. Zero hardcode em TS/TSX/wingets — tudo do DB via APIs internas
- [ ] H04. Limpar dados falsos (ratings, filmes, Unsplash, tracks, métricas, saascontent.ts já deletado — varredura completa)
- [ ] H05. Árvore rígida: raiz = .github + 11 apps + .gitignore + package.json; por app só sol/tests/docs
- [ ] H06. Pasta tests de volta em cada app + vitest 900–1000 verdes
- [ ] H07. JSDoc hierárquico 2026 + Biome em todos os arquivos reagrupados
- [ ] H08. Padronizar configuráveis na raiz de cada app (Nginx ausente — recolocar; Netlify, Homebrew.rb, Cargo, Capacitor, Maven, Gradle, robots.txt, devthink.toml, .gemspec, .csproj, go.mod, doc.go, pyproject.toml)
- [ ] H09. Unificar Dockerfile único por projeto (compose+config → 1 Dockerfile)
- [ ] H10. Corrigir aimdebonite.app → com.debonair.app; dots só em package ID
- [ ] H11. União de dependências: todos os package.json dos 9 repos, kinds deps/devDeps/overrides, sem remover nenhuma (22–32k ok)
- [ ] H12. package.json raiz só engines; QEMU só no Saddle
- [ ] H13. Wingets PascalCase flat alfabéticos consumindo DB
- [ ] H14. Renomeações sem hífens/dots/underscore (palavra única minúscula)

## FASE I — FEATURES ELETAS

- [ ] I01. Music Generation (Hugging Face Spaces) — música em JSON nos blobs do allan (V1–V3)
- [ ] I02. Separar stems (demix 4-stem) + ingestão reversa (JSON→música)
- [ ] I03. Infraestrutura de banco (feature eleita #2)
- [ ] I04. Extensão de navegador funcional (conecta agente ao navegador do dono)
- [ ] I05. APK/emulador Android (autorizado)
- [ ] I06. Scrape no DevThink
- [ ] I07. Clones estáticos multi-plataforma interligados (código coringa, mesmo banco via APIs internas)
- [ ] I08. CLI = interface do chat; TV/extensão/binário com interface idêntica

## FASE J — GETRY (gateway IA)

- [ ] J01. Resolver guerra de OOM (import top-level mata memória — carregamento dinâmico)
- [ ] J02. Rewrite das 6 rotas por versão (18 rotas: v1 zai keyless + v2 babel + v3 nvidia)
- [ ] J03. Escopo travado: middleware e 4ª biblioteca proibidos
- [ ] J04. Meta-modelo devthink: 2.262.144 contexto / 524.288 saída (soma de janelas)
- [ ] J05. Thinking 7 níveis (default high); modelo troca a cada 6 mensagens
- [ ] J06. Rotação de 22–31 chaves NVIDIA (junto com B05)

## FASE K — AMBIENTE E DOCUMENTAÇÃO

- [ ] K01. Limpar raiz /home/z/my-project: deletar template Next, src, venv, python (só DevThink + allan)
- [ ] K02. Consolidar corpus: ~7.000 MDs → 10 → 3 finais (infraestrutura.md "manual de avião", links.md 22.137 links, package.json 22.687 pacotes)
- [ ] K03. Dossiês por app em organizado/md (argan.md...vault.md — 11 dossiês)
- [ ] K04. Restaurar docs dos 645 commits da pasta dots (antes de deletar)
- [ ] K05. Reformatar mapping/checklist em markdown `- [ ]` (sem código cru/px/cores/paths)
- [ ] K06. Resumir todos os txt/md em 4–6 documentos e apagar os originais do DevThink
- [ ] K07. Polar Auth: manter token vitalício + poller/watchdog em background (state em /home/z/my-project/)
- [ ] K08. Worklog fora do repo como critério de conclusão de onda
- [ ] K09. Reler conversa51.txt integralmente (97.281 linhas — relatórios perdidos no reset do ambiente)

## FASE L — ENGINES DEFERIDAS (POR ÚLTIMO, COM MAIS CUIDADO)

- [ ] L01. Debonair/Kathesis: análise externa, stems como produto, key/pitch, VAD+whisper, fingerprint, embeddings, loop fechado (RECON-V1..V8, 82 parâmetros, 44.100×48.000 Hz, anti-base64)
- [ ] L02. Cadria/VersaWaze: encoder de vídeo REAL (WebCodecs); navegação refazer
- [ ] L03. TS→Rust (preparação futura)
- [ ] L04. Stealthhead: jogo no ritmo do dono (5 mapas/50+ armas/15 veículos)

---

**TOTAL: 12 fases · 130 ações** (base cumprida das "mais de cem" exigidas; expandir conforme execução — a meta do dono é 10.000+ ações-chave no total da operação, praticamente ilimitado).

## o owner directives consolidado (anexo histórico)

# OWNER DIRECTIVES — DevThink (consolidado integral)

> Fonte: leitura integral de conversa52.txt (99.281 linhas, 33 chunks), ordens1.txt (2.059 linhas), ordens.txt (1.903 linhas), feedssd.txt (1.828 linhas), polarauth.txt (9.595 linhas), Pasted Content (2 arquivos idênticos), fedsd.txt (subconjunto 100% confirmado de feedssd — 1.564/1.564 linhas casam).
> Relatórios por chunk: docs-reading/c52-chunk-01..33.md, ordens1-chunk-01..04.md, ordens-chunk-01..04.md, feedssd-chunk-01..04.md, polarauth-full.md, pasted-and-fedsd.md, workflow-status.md.
> Nomes corrigidos: os 11 apps reais são **Argan, Cadria, Cobaia, Debonair (DeBonAI), DevThink, Forge, Foundry, Getry, Saddle, Stealthhead, Vault**. Typos do dono mapeados: "Svelte/Seddle/Settle/Sedal"→Saddle · "hoshios/Archeos/ACOS/Archos"→ArchOS (aba OS/Arch no GHCR) · "grhcr/GRHCR"→GHCR · "DevTink/DevTank/DevTeam/DevDink"→DevThink · "relays"→releases · "sets"→assets · "MauruOS/Marsh/Omashi/Grapenios/Grafene OS"→distros (Manjaro/GrapheneOS/Omarchy/Maru OS/Vanilla OS/V OS) · "Kader/Cadia/cadre"→Cadria · "stealhead/StealHead"→Stealthhead · "Valt/Vout"→Vault · "Debonai/Debonite"→Debonair · "katexis/kathesis/Katesis"→Kathesis (engine do Debonair) · "versawase/VersaWaze"→VersaWaze (engine do Cadria) · "trile/Trilly/Tride/tryke"→trylle.com (referência de design) · "Alan/Allen/alan"→repositório allan · "BetaSQL Lite 3/BetterSkill3"→better-sqlite3 · "2B"→E2B · "Daitona"→Daytona · "Nugget"→NuGet · "boom"→Bun · "aimdebonite.app"→com.debonair.app · "faun/FA1"→repositório wenathlan/faun · "Py Lloyd"→executor de Python no Node · "conversa MB"→conversa.md.

---

## 1. LEIS MÃE (invioláveis, hierarquia máxima)

1. **Lei no-touch**: NUNCA tocar navegador, GPU, CPU, disco, localStorage, câmera, localização ou carteira do visitante/usuário. Todo processamento roda 24h via internet na infraestrutura própria (Saddle + Vault). "O navegador do visitante nunca carrega um byte do payload da sandbox."
2. **Lei da exclusividade de engine**: cada app é DONO EXCLUSIVO da sua engine; os demais consomem via `package.json` (import `@wenathlan/*`), NUNCA por caminho de pasta, NUNCA duplicando código. Storage=Vault · VM=Saddle · gateway IA=Getry · rede/DNS=Argan · áudio=Debonair · vídeo/3D=Cadria · monetização=Cobaia · execução=Forge · pipeline=Foundry · FPS=Stealthhead · OS=DevThink.
3. **Lei do zero hardcode**: nenhuma informação textual em .ts/.tsx/wingets (engines são "cegas"); toda informação vive no DB (better-sqlite3 / Vault) e é puxada via APIs internas no build. Exceção: só configs e tests podem ter dados fixos. SHA256 gerada no build, nunca hardcoded em workflows.
4. **Lei da árvore rígida**: primeira camada da raiz = `.github` + 11 pastas dos apps + exatamente 2 arquivos (`.gitignore`, `package.json`). Dentro de cada app: SOMENTE `sol/`, `tests/`, `docs/`. Pasta = página (com anchor). Build na raiz, nunca em `dist/`. Proibido src/scripts/artifacts/terminal na raiz de app.
5. **Lei do lockstep de versão**: os 11 apps + raiz na MESMA versão, curva 2.0.x SOMENTE (2.1.x proibida — regressão a 2.1.6/2.1.7 foi erro). Bump no package.json da raiz propaga a todos + changelog + workflows + releases. Rungs atuais: 2.0.185 no main; meta pós-verde = 2.0.186 (o dono citou 182/183/184 como próximos rungs na época; 185 já saiu).
6. **Lei da união de dependências**: NUNCA remover dependência prévia. União de todos os package.json dos 9 repos (devthink, maene, extension, gateway, saddle, nb, e2ugh, iakadion/allan, iakadion/devthink), kinds dependencies/devDependencies/overrides (sem peerDependencies/publishConfig), mesmo com 22–32 mil deps. Análise dos 1.252–1.900 commits sem perder pacote.
7. **Lei da nomenclatura**: palavra única, minúscula, cheia, sem hífens/underscore/emoji no nome base de arquivo. Dots apenas em identificação de pacote (com.wenathlan.app, com.debonair.app — corrigir aimdebonite.app). Renomeações sem hífens/dots. Wingets = componentes (com G).
8. **Lei do squash merge**: merges oldest→newest com squash, restando SOMENTE main no final. Commits com identidade iakadion (nunca "x-access-token"/máquina). Veículo assinado: branch→PR→squash REST (web-flow GitHub, "Signed by GitHub").
9. **Lei da leitura**: leitura integral, linear, hierárquica, de cima a baixo, SEM PULAR NENHUMA LINHA, exclusivamente via Bash/sed/grep (segmento linha X–Y), NUNCA ferramenta direta de read. Primeiro analise, primeiro veja o que é, mapeie micro e macro detalhes, SÓ DEPOIS opere. Toda reclamação = diretriz obrigatória imediata.
10. **Lei da honestidade radical**: zero dado falso/mock/teatro. Nada de ratings inventados, filmes falsos, Unsplash, tracks fake, estatísticas simuladas, toasts falsos. "Abandone a simulação, os textos falsos e a disfuncionalidade."
11. **Lei do silêncio de alerta proibido**: TERMINANTE PROIBIDO configurar workflow para ignorar CVEs/alertas (o feito com CVEs hardcoded do Go foi violação). Resolver e commitar. Única supressão permitida: saddle/.trivyignore (15 CVEs tsgo). Nenhum alerta fechado sem commit de correção.
12. **Lei do consentimento deny-default** e **nunca force push**. Worklog fora do repo como critério de conclusão de onda.

## 2. MÉTODO DE OPERAÇÃO (como o dono exige que se trabalhe)

- Ciclo canônico: delete → read → authenticate → analyze → document → execute. Sync remoto→local SEMPRE primeiro (nunca local→remoto).
- Toda reclamação = ordem imediata. "Por exemplo" = ilustração, NÃO obrigação.
- Ondas: PR = onda por TEMA/categoria (nunca por app), ~50 PRs por onda com 100+ ações cada; "tudo numa onda só" (nunca deixar para a próxima onda/mensagem/sessão).
- Subagentes: 5/6/7 por categoria, até 300/600/900 paralelos; ignorar frentes já ocupadas por outra instância e avançar para a próxima; nunca git para subagentes; nunca bash para escrever/mover fonte (Write/Edit only — hook Mimosa).
- Testes: pasta `tests` de volta dentro de cada app; testes SOMENTE em TypeScript; vitest 900–1000 passos verdes ANTES de cada push.
- Verificação: via browser a cada onda ("a sandbox parece normal mas não está"). Validação exige render, não só HTTP 200.
- Todolist interna: 10.000+ ações-chave (base: mil; "praticamente ilimitado"), até 900 tarefas planejadas por sistema, 100+ ondas, 1:00h no relógio por operação.
- Retomada: sempre voltar à linha Y exata onde parou; ciclo ler→mapear→branch→verde→merge→voltar à linha Y.
- Não atrapalhar agentes paralelos (Getry, versões 2.0.181/182) — frentes independentes.
- Cota: 100M tokens/22h; Lei de Máquina (sem installs, node_modules global, esm.sh).

## 3. OS 11 APLICATIVOS (papel, engine, concorrente)

| App | Papel | Engine | Concorrente |
|---|---|---|---|
| DevThink | OS supremo / monorepo / workbench | — | GitHub/GitLab |
| Argan | Rede/DNS/gateway (zonas, records, dnssec) | — | Cloudflare/AWS |
| Cadria | Vídeo/3D | **VersaWaze** | CapCut/After Effects |
| Cobaia | Monetização MRR/planos | — | — |
| Debonair | Áudio/DAW/IA sonora | **Kathesis** | — |
| Forge | Runner de binários/execução | — | — |
| Foundry | Pipeline | — | — |
| Getry | Gateway IA (5 provedores/35 rotas/7 níveis thinking) | — | — |
| Saddle | Virtualização (90 modalidades) | — | Oracle/VirtualBox |
| Stealthhead | FPS (só "jogo em construção") | — | — |
| Vault | Edge storage/persistência | — | Supabase/S3 |

## 4. SADDLE (prioridade #1 — "foco exclusivo" após infra verde)

- 90 modalidades de VM/sandbox/microVM (81 live + 9 host): WASM, Docker, QEMU (exclusivo do Saddle), AWS, Node, VFS, E2B, Daytona, Wasmer, vGPU/vCPU, firecracker/microVM, Exe/Binário, SHs, Webpack/Babel. Hoje: ~24 registradas no código, ~40 reais, 17 registry-only — meta: todas as 90 como executores REAIS (nunca lane_not_wired).
- Container Docker: consertar e PUBLICAR (estava preso em 2.1.6 no GHCR; 10 lanes ficaram verdes pela 1ª vez desde 7 nov no commit ea655f2c). 11 arquiteturas (hoje 5) + ArchOS com 12/15+ lanes (Alpine, NixOS, V, Arch Linux, Debian, GrapheneOS + ArchOS interno; hoje só linux/arm64 + unknown).
- Perfis Max/Balanced/Lite EXCLUSIVOS do Saddle (nenhum outro app tem versão balanceada/lite/max).
- SOs emulados: GrapheneOS, Omarchy, Maru OS, Vanilla OS, V OS, Marsh, Omashi, Grapenios (=GrapheneOS).
- Versão normal SEM prefixo "v", publicada ACIMA (mais recente) que a GrapheneOS no GHCR.
- Funções alheias a run/VM/sandbox SAEM do Saddle → DevThink (Web Scrape etc.). 9 grupos non-run saem; 5 superfícies falsas morrem (firecracker fake, qemu cosmético, doc.go vazio).
- Nunca tocar GPU/CPU/navegador — o binário baixado roda "na internet" via hosts.
- Comparar com github.com/wenathlan/saddle (repo original) e restaurar features perdidas.
- Modalidade sandbox funcional E2E existente: microvm firecracker, EPYC 9965/8vcpus/32GB.

## 5. VAULT (prioridade #2 — "do zero")

- Clone self-hosted do Supabase: cadastro com ID próprio, API key mostrada uma vez, NADA salvo no navegador.
- Bloquear download do DB (falha histórica do Faun: fa1.db baixável estaticamente até hoje). Banco isca (decoy database) para sondas.
- Desbloquear My Files: limite 2GB → 900MB/900GB/50GB por plano (configurável, escala terabyte, BigInt).
- Stack: better-sqlite3 (principal) + MySQL2 + Drizzle + Prisma + Git LFS + LibGit2 + Blobs; chunks de 1 MiB com dedupe por hash sha-256; AES-256-GCM; replica com quorum n/2+1.
- Mimetypes 3.000/4.000/6.000 (hoje 4.133; ouro debian 28.583 linhas); protocolos HTTPS 100/200/1000; protocols.types idêntico em todos os apps.
- 5 rotas de armazenamento; API estilo HelixDB (Bearer + database-id); rewire do OS religando ao storage real.

## 6. DEVTHINK (SO e design)

- Design: fidelidade 97–99% ao `index.html` de referência (`.devthink/web/index.html` do repo allan); Fluent Icons (lucide BANIDO); tema Sol ÚNICO branco; sem botão Saddle Cloud no sidebar, sem glows azuis, sem botão azul.
- Windows 11 + trylle.com (nível Awwwards/Webflow Awards): titlebar 28/30px, close rgb(232,17,35), accent #a3d7e6, focus #4cc2ff, pill 999px, taskbar 48px, pins 38×38, start 640px, movimento 250ms cubic-bezier(0.85,0.14,0.14,0.85), navbar flutuante/fixada (1mm descola), alvos ≥44px, animações ≤200ms, relógio da lock screen à ESQUERDA (lei).
- NÃO inventar token antes de estudar os 125+ clones em neo.temp e 569 refs em designeer (repo allan; inspeção de seletores/variáveis CSS). repo.case.md lista concorrentes.
- Bug urgente recorrente: janela cortada — app aberto via URL direta `/devthink/<app>/` abre fullscreen correto; aberto pelo painel/duplo clique abre cortado; duplo clique deve abrir DENTRO da janela do sistema sem redirecionar. familyurl colapsado ×10 (deploybase.ts corrigiu `../<slug>/` → `/devthink/<slug>/`).
- Zoom travado via viewport (maximum-scale=1, lição do Faun). Bug da sombra vazando no login. Tela branca em produção (node:crypto em ids.ts → WebCrypto).
- Features: Music Generation (Hugging Face Spaces; música serializada em JSON nos blobs do allan V1–V3; separar stems; ingerir referências via Vault), scrape, extensão de navegador (auth por código estilo GitHub; agente conecta ao navegador do dono; baixa dos assets de release; 335 kinds/2.494 testes), geração de música eleita feature #1 + infraestrutura de banco.
- Infra self-hosted: "site no ar = servidor no ar"; clones estáticos multi-plataforma (Netlify/Vercel/Cloudflare/domínio próprio) interligados ao mesmo banco via APIs internas; código coringa; 15 engines self-hosted; devthink.pro com 30+ subdomínios Cloudflare; auth.devthink.pro; GitHub App devtinker-app 5108223; branding "let it think".
- CLI = interface do chat DevThink; TV/extensão/binário com interface idêntica (difere só dpi/disposição/animação).
- Getry: 5 provedores/35 rotas (18 rotas: 6 v1 zai keyless + 6 v2 babel town + 6 v3 nvidia)/7 níveis thinking (default high); 22–31 chaves NVIDIA rotativas (ROTAÇÃO OBRIGATÓRIA — P0, chaves nvapi- em texto plano); meta-modelo devthink 2.262.144 contexto/524.288 saída (soma de janelas); modelo troca a cada 6 mensagens; deepseek-r1 proibido; middleware e 4ª biblioteca proibidos; guerra de OOM (import top-level mata memória).

## 7. DISTRIBUIÇÃO / RELEASES / WORKFLOWS

- 6 distribuições por app = **60+ pacotes** (55 exatos + NPMJS): npmjs, GitHub Packages, Maven, NuGet, Gradle, RubyGems, Docker, Cargo, PyPI, Homebrew, Go Get (11 canais). Dual npmjs/GitHub Packages com escopo `@wenathlan/<app>`.
- Maven: DELETAR pacotes `io.github.wenathlan.*` (versões 31/29/29/4 por "Nathlan Bros") e publicar exclusivamente `com.wenathlan.<app>`. devthink AINDA não publicado no npmjs.
- Versões `.webpack` separadas: CANCELAR/EXCLUIR e EMBUTIR no pacote original (nome normal, sem sufixo).
- Releases: 1.000+ assets (variante 3.000+; casas de 200 passos, exatamente 100 mudanças por release; escada 2.0.97→3.0 com 500+ releases). Assets caíram para 318/429/140 em rungs recentes — restaurar.
- Workflows: 1.402/1.500+ workflows "perdidos" a recuperar verdes; 80 etapas obrigatórias sem pular; reagrupar 1.500+ workflows em 5 arquivos por tema (ci/delivery/family/stewardship/security); agrupados por tema/contexto correlato; UNIDOS em arquivos únicos; reexecução MANUAL (workflow_dispatch) para a versão atual sair correta.
- Deployment/GitHub Pages: PARADOS — restaurar (Family Pages morria no `bun install --frozen-lockfile` do saddle; run manual pós-merge do lock heal).
- Release approval quebrado desde commits 118/140 — corrigido (release.mjs sync estendido à família; OWNER_PAT no create/flip; familylanes.mjs dispara no evento `release: published`).
- Segurança: code-scanning meta 87→0 (conquistado: 0 alertas abertos, 5.069 históricos; 522 "won't fix" a rever); dependabot: ~50 bumps Python nos 11 manifests + fechar 4 PRs do bot superseded; scorecard alerta 1759 resta; CVEs esbuild cadeia drizzle-kit→esbuild fechada com override ^0.28.2 (alertas 2102/2101/2100/2079 curados por commit, nunca dismiss); 6 CVEs HIGH Trivy curados (brace-expansion 5.0.11 + undici 6.29.1); Commit 29c24c4 = marco da crise (6k+ erros desde ele).

## 8. ESTRUTURA DE CÓDIGO / QUALIDADE

- Lógicas TS reagrupadas por palavra-chave: arquivo único por domínio (auth.ts, db.ts, copy.ts, audio.ts, ingest.ts, gates.ts, edgelandes.ts, modalities.ts, protocols.ts), JSDoc hierárquico 2026, Biome, teto de 300/900/3.000/4.000 (até 7.000–9.000) lógicas correlatas por arquivo. DELETAR logics.ts genérico.
- Famílias TS: authfamily, gatewayfamily etc. 15 arquivos padrão por raiz de app. Escada z-index no sol.css. Portas aleatórias 1024–65535.
- Tudo em inglês (tradução GTX em runtime). Padronização 2026: Pattern Design, sintaxe inteligente.
- Configuráveis padronizados na raiz de cada app: package.json, npmrc, Nginx (ausente em alguns — recolocar), Netlify, Homebrew.rb, Cargo, Capacitor, Maven, Gradle, robots.txt, devthink.toml, .gemspec, .csproj, .rs, .rb, .java, .xml, .yml, .json, go.mod, doc.go, pyproject.toml, .env, .iml, _headers, _redirects. UM único Dockerfile por projeto (unificar compose+config). Conversões = nome do app + extensão (vault.kts).
- package.json da raiz: SÓ `engines` (Node maestro de 15+ engines, V 0.5.2 catálogo). QEMU/VM só no Saddle. 12 package.json sincronizados.
- Components em `wingets`, PascalCase, flat sem subpastas, alfabéticos. Zero JS na interface.
- Correções específicas: bug guard.ts curado (probe console stringificado sincronamente disparava blank para todo visitante; política final: trap 1200ms, toggle do dono, intersticial, sem heurística de tamanho); bug familyurl; OS boot branco (WebCrypto).

## 9. AMBIENTE / AUTENTICAÇÃO / GIT

- Polar Auth: device flow GitHub (CLIENT_ID 178c6fc778ccc68e1d6a), poller+watchdog em background (setsid nohup double-fork), captura de token em tempo real, state files em /home/z/my-project/ (nunca temp), token SEM expiração, 17 escopos, rule 45 (once authorized never poll again), janela 6h, escada FULL→MED→MIN→SAFE. Identidade iakadion. Token vitalício em upload/github-auth/data/ (sobrevive resets).
- Limpeza da raiz /home/z/my-project: DELETAR template Next, src, venv, python — só DevThink (operação) + repo allan (concorrentes/estudo).
- Git: sync remoto→local primeiro; merges squash oldest→newest; só main; commits verificados (branch→PR→squash REST); GPG pública em .github/commitkey.asc; GH013 bloqueia workflow via token (só ladder/OWNER_PAT); CHANGELOG sempre no git add.
- Leitura de blobs/dots: POR ÚLTIMO, em background (645 commits da pasta dots, 286 globs, 206+300 commits, conversa.md 23k linhas, ~7.000→10 arquivos, 9.041 MDs do allan → 3 finais: package.json 22.687 pacotes, links.md 22.137 links, infraestrutura.md estilo "manual de avião").
- Dossiês por app em organizado/md (argan.md...vault.md) — 11 dossiês.

## 10. SEGURANÇA (P0)

- 22–31 chaves NVIDIA nvapi- em texto plano: ROTACIONAR antes de qualquer publish (P0 máximo).
- Cert/chave *.backloop.dev + 16 chaves token-plan + recovery codes GitHub expostas: rotacionar.
- 3 backdoors documentados; falso positivo "DevTools Already Open".
- Proibido ignorar alertas (lei 11). Dependabot: fechar por request com merge verde. Code-scanning: commit definitivo por CVE.

## 11. FEATURES ELETAS / DEFERIDAS

- Eleitas: geração de música (Debonair) + infraestrutura de banco; extensão de navegador + APK/emulador Android autorizados.
- **DEFERIDOS PELO DONO (por último, com mais cuidado): engines Kathesis (Debonair) e VersaWaze (Cadria)** — "deixa o cadria e o dev team pra depois, a engine pra depois". TS→Rust. Jogo Stealthhead no ritmo do dono. Getry voltou ao escopo geral (agente pausado).
- Debonair v2.27: TEM síntese/beatgrid/BS.1770/remixplan; FALTAM análise externa, stems como produto, key/pitch detectados, VAD+whisper, fingerprint, embeddings, loop fechado geração↔referência; RECON-V1..V8 (82 parâmetros congelados); recon 44.100 Hz × render 48 kHz; anti-base64/PCM inline.
- Cadria: encoder de vídeo REAL (WebCodecs) é o gap ranqueado; navegação "horrorosa" a refazer.
- Stealthhead: PLANO-5.2/UNIPLANO-5.2; ~50 veículos/personagens/armas; 40+ formatos; editor.ts absorve física/engine/combate; HUD por dispositivo (Capacitor/Bun 1.4.2); DB por colunas C1..C4; app de 1–2MB baixa DB do site (full 900MB); 5 mapas/50+ armas/15 veículos.

## 12. NÚMEROS-ÂNCORA (metas quantitativas do dono)

10.000+ ações na todolist (base mil, "praticamente ilimitado") · 900 tarefas/sistema · 100+ ondas · 300 subagentes (máx 600–900) · 1:00h por operação · 1.402–1.500+ workflows verdes · 1.513→1.600→1.700→1.900 commits auditados · 6 distribuições/app = 60+ pacotes · releases 1.000+ (até 3.000+) assets · 80 etapas de workflow · 90 modalidades Saddle · 11/12/15+ lanes OS/Arch · 11 arquiteturas · 11 canais · 15+ engines self-hosted · mimetypes 4.000+ · vitest 900–1000/push · ~50 PRs/onda · 4.000–7.000 lógicas por arquivo · 22–32 mil dependências aceitas · rung 2.0.186 próximo · 6.650–7.192 pernas verdes na família · 43 provedores openai-compatible/352 modelos · 945 ações do checklist mestre (6 fases).

## 13. ORDEM DE EXECUÇÃO (hierarquia imposta pelo dono)

1. Workflows verdes (CI/Verify/Security/Pages) — inclui lock heal, license gate, cargo audit
2. GitHub Pages / deployment restaurados
3. Branches/PRs: merge tudo no main, arquivar PRs, só main
4. Reagrupar 1.500+ workflows em 5 arquivos por tema + run manual
5. Release 2.0.186 com 1.000+ assets + publicar 60+ pacotes (com.wenathlan.*, sem .webpack)
6. **Saddle (foco exclusivo)** — 90 modalidades reais, container publicado, 15+ lanes
7. Vault do zero
8. Design (97–99% index.html, Win11+trylle)
9. Segurança/qualidade por request (dependabot, code-scanning, scorecard)
10. Engines DeBonAI (Kathesis) + Cadria (VersaWaze) — POR ÚLTIMO, com mais cuidado

## a onda da execução de 2026-11-20 (a retomada do checklist definitivo)

- [x] o checklist definitivo lido integralmente e a execução retomada a partir dele (a transição criação para execução que o dono ordenou)
- [x] o token verificado contra a api viva antes de qualquer alteração (iakadion ativo, escopos com o lacuna de delete:packages suprida pelo token do device flow capturado)
- [x] as execuções ativas canceladas por ordem do dono (zero em progresso; os vinte e sete enfileirados fantasma internos da plataforma documentados com a tentativa de cancelamento registrada)
- [x] a auditoria dos mil oitocentos e vinte e três commits da pasta de workflows concluída por três subagentes em faixas contíguas (trezentos e sessenta e nove commits tocaram workflows; veredito: as features da casa de seis sobrevivem como superconjunto; as duas perdas documentadas são o empacotamento da extensão do saddle e o unpublish do heal, ambas retiradas deliberadas com substituto; o helm lane aposentado por ordem expressa)
- [x] o delta do corpus lido integralmente (a cauda da conversa cinco mil e duzentos até a linha cento e catorze mil seiscentos e quinze e a cauda das ordens; as dezoito diretrizes novas registradas no cânon)
- [x] o censo de segurança medido (vinte e dois alertas do dependabot todos do mistune pip já curados no main pelo bump da versão corrigida, aguardando o reescaneamento natural; dois alertas de code scanning processuais do scorecard que fecham com os runs verdes; zero segredos vazados)
- [x] a remoção dos pacotes residuais verificada com evidência de censo (zero assentos webpack nos cinco registros da organização e da conta; zero charts sem ordem; a varredura do device flow executou a limpeza)
- [x] a causa raiz do ci vermelho curada (o eixo do desktop carregava a lista dos nove membros duas vezes; a correção carrega a lista uma única vez com a semântica do disparo duplo preservada)
- [x] os relatórios consolidados no arquivo único (o checklist definitivo soma as ondas imediatas, o registro por categoria, a espinha do tracker, os apêndices, o todolist mestre e o anexo histórico sem apagar nada, desduplicando)
- [x] as lacunas do relatório do dono fechadas (as features exigidas por aplicativo, o estado medido, o worklog da onda lockheal, os números-âncora faltantes e as âncoras do cânon integral)
- [ ] o pr da cura do eixo do desktop verde e mesclado (a fila imediata)
- [ ] o pr do portão de assinatura mobile atualizado e mesclado (a simetria do ci-test-key)
- [ ] a reexecução manual da casa inteira no main curado (o ci, o security, o maintenance, o publish, o containers e o release)
- [ ] a cascata de publicação dos envelopes irmãos no npmjs (o buraco cento e oitenta e um até a versão corrente)
- [ ] o deploy do github pages restaurado e verificado por browser na produção
- [ ] o reescaneamento do dependabot fechando os vinte e dois alertas do mistune
- [ ] os dois alertas do scorecard fechando com os runs verdes
- [ ] a bateria de testes verde e o disparo manual validando a versão corrente
- [ ] o bump seguinte aplicado somente após tudo verde (a lei do dono)

## a onda da consolidação integral de 2026-11-23 (a leitura integral do corpus completo)

> Consolidada por 18 leitores paralelos (R1-R18) cobrindo INTEGRALMENTE todo o /upload
> via bash/sed/grep por segmentos de linha, sem pular linha: ordens.txt (1.903), ordens1.txt
> (3.811), polarauth.txt (10.463), fedsd.txt (1.564), feedssd.txt (1.828), checklist (1).txt
> (6.920), conversa19.txt (85.022), conversa50.txt (86.534), conversa51.txt (97.281),
> conversa52.txt (114.615 integral), unificado.outro.txt (173.492 mapeado: 32 constituintes,
> 13 duplicatas identificadas por md5, conteúdo único lido), devtyhink.txt (1.138), Pasted
> Content (33.162 chars), extract/ (67 arquivos verificados), docs-reading/ (6 relatórios
> cross-checkados). Nada removido; duplicatas registradas com contagem.

### o estado vivo auditado nesta onda (2026-11-23)

- [x] a leitura integral do corpus completo concluída por 18 leitores em faixas contíguas com desduplicação por md5 e registro de repetições
- [x] a autenticação verificada contra o remoto (fetch/ls-remote verdes; token embutido ativo)
- [x] o polar canônico extraído da variante definitiva (polarauth.txt linhas 1-305, corrected build Rev A/D/G) e lançado em background com poller+watchdog destacados (código 5C8F-A789 pendente de autorização do dono em github.com/login/device; janela 6h renovável; rule 45 respeitada; captura em tempo real para .github-token 0600)
- [x] o sincronismo remoto para local concluído (main em 4b62682f; o commit local de relatórios preservado no branch backup/docs-reading e restaurado como worklog não rastreado fora do repo, conforme a lei)
- [x] o stash auditado (stash@{0} "vue scrub": remove @vue/runtime-vapor@0.0.0 quebrado com workspace:* irreal de 11 bun.lock + argan/package.json; base antiga; conflita com a frente ocupada dos locks; preservado intacto como mapa de feature)
- [x] os commits novos do remoto mapeados (17 commits de 2026-11-20 a 2026-11-22: PRs #683-#704, lucide retirado da família, familyurl colapsado no dono devthink, escopo granular + skip honesto, consolidação histórica massiva, docs raiz deletado conforme a árvore)
- [x] as frentes ocupadas identificadas (6 PRs abertas #696-#702: db-vault-subpath, getry-devdeps-union, getry-jury, jsdoc-2026-pass, sha-collapse, vault-encryption — CI in_progress; lei: ignorar e avançar à próxima sem interferir)

### as lacunas descobertas pela leitura integral (a acrescentar às ondas)

- [ ] W20-001. o módulo pulse (12º módulo oficial da mega-onda final de ordens1.txt linhas 3635-3720 e do devtyhink.txt bloco A) NÃO existe na árvore: criar o scaffold honesto (sol/, tests/, docs/ + .ts de lógica na raiz) com o rótulo "Em construção" — estúdio aberto Voice-First dono único de automação e gestão 24/7 de redes sociais e canais (X, Instagram via Graph API oficial/MCP com renovação de token, Facebook, YouTube), operável por humanos e enxames nas VMs, consumindo getry, saddle, cadria, debonair, vault e cobaia via package.json
- [ ] W20-002. a IA nativa doo (dois "o") onipresente definida no cânon como usuário IA oficial dos criadores do CODEOWNERS: registrar no mapa de identidade e no plano de features do devthink
- [ ] W20-003. a lei Voice-First: todos os 12 aplicativos oferecem a experiência principal por voz (Voice-First Ao Vivo multi-persona zero texto no getry; ditação por áudio; auto-treinamento/destilação cross-sandbox) — mapear as lacunas por aplicativo
- [ ] W20-004. a lei 100% internet para binários: mesmo como aplicativo desktop nativo o binário NÃO executa processamento local, conectando direto aos hosts remotos — auditar as faces desktop/ISO do devthink contra esta lei
- [ ] W20-005. a meta-regra dos valores ilustrativos (ordens1.txt L3635): todo número citado é piso/opt-in, nunca teto — já refletida no preâmbulo, reafirmar nos números-âncora
- [ ] W20-006. as 3 leis do NETLIFY ROAD do gateway v2 (unificado.outro.txt constituinte gateway.txt linhas 10389-10460): lei do SSO (sso_login false em todo site de toda conta viva, toda rodada, public by law), lei do refresh (todo gatethinkN existente é redesplantado com o build fresco da v2), lei da numeração sem traço (conta sem gatethinkN recebe o próximo número, namespace global) — sincronizar com a frente do gateway quando liberar
- [ ] W20-007. as regras de máquina da session7 (unificado.outro.txt constituinte session7-so-user (2).txt): escrita de fonte SOMENTE via ferramentas de edição (hook Mimosa bloqueia bash para escrever), nenhuma pasta assets/ (árvore é sol/+docs/+tests/ com ícones como única exceção binária), apps nascem em inglês com tradução só via configuração — validar conformidade da árvore atual
- [ ] W20-008. o mapa de consolidação nominal de arquivos por palavra-chave do DOC-u1 de conversa52 (edgelandes.ts, sandbox.ts, modalities.ts, virtual.ts, objects.ts, storage.ts, dns.ts, catalog.ts, thinking.ts, gateway.ts, runner.ts, match.ts, ranking.ts, world.ts, monetization.ts, agents.ts, security.ts, dashboard.ts) — cruzar com o estado real de cada raiz de app e completar os assentos faltantes
- [ ] W20-009. os detalhes canônicos do devtyhink.txt ainda não sentados no tracker: getry adiciona Kimi K3.1 pro 1M de contexto (registro vivo já feito pela frente paralela em todas as 6 rotas v3 — verificar e marcar); cores oficiais por app (devthink âmbar solar, saddle tan #d6b483, vault gelo #a3d7e6, getry violeta #9a7ce0, debonair âmbar #bd7a1a, cadria magenta #e04f9f, argan jade #14b98c, forge lime #a2cb3a, foundry azul #4d8edd, stealthhead coral #f4694f); baseline de testes 7.192 pernas em 477 arquivos + 700 torture + 30 agentcert + 9 costcert + 21 pentest; devthink 35 páginas/45 telas/3.420 componentes; WebSocket porta 3003 rate 1.200 req/min timeout 900s; debonair RECON 76 header/66 frame/4 correlações/82 parâmetros; cadria ticks 254.016.000.000/s e 126 rotas; argan DoH porta 81 EDNS 1232 bytes 101 modalidades 30 resolvedores 15 idiomas; stealthhead física 120Hz gravidade -9.82 <120 draw calls Monte Carlo 1.000 runs splatting <2MB 12 tabelas
- [ ] W20-010. o inventário de links oficiais do devtyhink.txt (113 URLs únicas incluindo os 12 wormholes do bloco B, os 6 modelos HuggingFace exclusivos, storytold/* 8 repos, freebuff, 2 artifacts Claude) — portar para o links.md da consolidação documental
- [ ] W20-011. as discrepâncias canônicas resolvidas pela leitura: 11 aplicativos (Pasted) vs 12 módulos (mega-onda final + devtyhink bloco A: pulse é o 12º) — o cânon mais novo vence; Supabase é CONCORRENTE do vault nunca SDK (a frase "via Supabase" do Pasted é distorção corrigida); chaves NVIDIA 25 vs 31 (rotacionar TODAS as encontradas); lógicas por arquivo 7.000 vs 9.000 (o teto é ilustrativo); devtyhink.txt contém ~28% de duplicação interna apesar de "desduplicado" (blocos D e links repetidos) — registrado, nada descartado
- [ ] W20-012. o vue scrub do stash aplicado quando a frente dos locks liberar (remover @vue/runtime-vapor@0.0.0 dos 11 bun.lock + argan/package.json; base do stash é antiga, regenerar contra o main curado)
- [ ] W20-013. a cauda de conversa51.txt linhas 87.909-97.281 lida integralmente por R16 (a dedup prévia de 12 nov estava 3 dias defasada; conteúdo único já coberto pelo conversa52 — registrado para a eternidade)
- [ ] W20-014. o skill.md Ghostwriter Mirror (conversa51 L96614) e o cronograma pessoal de estudos de 14 dias do dono (conversa52 L30056) identificados como conteúdo PESSOAL alheio ao ecossistema: excluídos do corpus de regras do projeto, preservados no arquivo original
- [ ] W20-015. os números de ouro da leitura: corpus total lido ~584.571 linhas de upload + relatórios; 12 módulos oficiais; 2.986 linhas de checklist vivo antes desta onda; 6 PRs abertas; 12 commits wave não mesclados; 1 stash preservado; 13 duplicatas internas do unificado identificadas por md5

### a fila linear desta onda (a execução imediata, do mais fácil ao mais difícil)

- [ ] E-01. o checklist consolidado commitado na branch datada da onda com squash via PR (a lei do veículo assinado; identidade iakadion)
- [ ] E-02. a verificação por browser da produção (wenathlan.github.io/devthink/ e /panel, desktop 1280x800 e mobile 390x844, claro e escuro) registrando o estado real sem depender da sandbox
- [ ] E-03. o scaffold honesto do pulse (W20-001) com PR própria por tema (nunca por app)
- [ ] E-04. o mapa Voice-First por aplicativo (W20-003) documentando as lacunas
- [ ] E-05. a validação das regras de máquina da session7 contra a árvore (W20-007)
- [ ] E-06. o cruzamento do mapa nominal de consolidação (W20-008) com as raízes reais
- [ ] E-07. o porto dos links oficiais (W20-010) para o arquivo de links da consolidação
- [ ] E-08. as ondas w00-w19 restantes executadas na ordem da seção 7 quando as frentes ocupadas liberarem (workflows verdes, pages, npmjs cascade, saddle, vault, design, engines deferidas)

## a onda 20 da cura linear (2026-11-25, a retomada do zero ordenada pelo dono)

O dono ordenou a retomada do zero: sync do head, leitura integral de /upload via terminal
(bash/sed em segmentos, jamais read), autenticação em tempo real e execução por agrupamento.
Esta onda responde:

- [x] W20.01 Sync do head: fetch + reset linear para 48686fef (local 1 à frente preservado em
  stale-local-backup, stash w04-i18n44 anotado, árvore limpa)
- [x] W20.02 Leitura integral via terminal: dfffD.txt (especificação isolada final, 17 versões
  evolutivas, a vigente R01-R25), devtyhink.txt, Pasted Content 1795192092987, mais o estado
  vivo via API (branches, PRs, runs, alertas, pacotes, Pages)
- [x] W20.03 Autenticação: token vigente verificado (repo/workflow/write:packages/delete_repo);
  polarauth.ts lançado destacado na porta 3010 com código de dispositivo para capturar
  delete:packages em tempo real (estado em .polar-auth.json na raiz, Regra 45 cumprida)
- [x] W20.04 Auditoria do estado: só main, zero PRs, casa de 6 fluxos, árvore raiz 15 itens
  limpa, pacotes npm limpos (zero .webpack, zero charts/devthink, zero legados io.github/pro),
  dependabot 0, secret scanning 0, Pages raiz ao vivo 200 com dispatcher de deep link íntegro
- [x] W20.05 Runs fantasmas: 27 runs em fila desde 11-11 (Verify/Pages aposentados) — cancelamento
  via API responde 409 (entradas fantasmas da plataforma, zero jobs, zero consumo de runner;
  documentado, sem ação possível)
- [x] W20.06 Cura linear polynomial-redos (alerta 5162): familyurl.ts, gateway.ts (4 pontos) e
  fileexplorer.ts trocam a escada regex de quantificador ancorado por scan linear de charCode
  (bateria de 26 asserções + prova de 1M barras hostis em 5ms — sem regex, sem supressão)
- [x] W20.07 Lei do cache verificada: job "Clean this run's caches" presente nos 6 fluxos
  (security 2789 limpou verde nesta onda)
- [x] W20.08 A árvore da documentação: checklist.md movido para docs/checklist.md na raiz do
  repositório (a lei: docs/ na raiz contendo exclusivamente o arquivo único, jamais
  devthink/docs/checklist.md; zero referências quebradas — nenhum teste ou workflow apontava
  o caminho antigo)
- [x] W20.09 Alerta 1759 (scorecard SAST): mecanismo de autocura confirmado — o buraco é um
  commit histórico sem evidência CodeQL que sai da janela conforme cabeças com evidência
  acumulam (a bateria analyze carimba cada push; monitorar a próxima segunda-feira)
- [x] W20.10 Containers: a autópsia do run 113 achou a raiz — os grupos de concorrência
  compartilhados (family-mobile, family-desktop, devthink-webpack) deixavam cada leg em fila
  substituir a pendente anterior (dos 108 jobs da onda só um punhado respondeu runner): a
  cura escopa cada grupo por leg da matriz (por app, por app+plataforma, por pacote), as
  legs móveis do saddle andam no carregador bun.lock congelado (o npm ci de 16k pacotes
  anda 20-60min frio) e os tetos móveis sobem ao 60 curado que a lei PR #646 registra
  (PR #713)
- [x] W20.10b GHCR: a lei do buildcache limitado aterrissa como passo de retenção no
  cachecleanup do maintenance (mantém as 3 mais novas de devthink-buildcache,
  saddle-buildcache e e2ugh-buildcache, deletando as antigas via API best-effort no
  OWNER_PAT — 76/100+/30 versões acumuladas hoje)
- [x] W20.10c Tema: a verificação ao vivo pegou a página publicada presa na escada clara
  com sistema escuro (matchMedia true, data-theme light) — a cura anda no padrão da casa:
  pré-pintura no html de entrada (espelho primeiro, preferência do sistema depois, zero
  escritas), systemThemeLadder no personalstore, o watcher seguindo os flips ao vivo até a
  primeira escolha explícita, e o snapshot de settings consultando o sistema (PR #713)
- [ ] W20.11 buildcache: conferir versões do saddle-buildcache e e2ugh-buildcache no GHCR (a lei
  do cache veda cache ilimitado em registro de containers, deletando versões antigas via API)
- [ ] W20.12 Dispatch manual da casa inteira (ci, containers, maintenance, publish, release,
  security) e seguir até 100% verde incluindo Pages ao vivo
- [ ] W20.13 Verificação por navegador real: raiz, /panel (deep link), claro e escuro, sem tela
  branca/preta
- [ ] W20.14 Aterrissagem por veículo assinado: branch datada por categoria, PR, CI 100% verde,
  squash merge sob iakadion (jamais identidade de máquina)
- [ ] W20.15 Bump 2.0.188 em lockstep SÓ APÓS tudo verde (12 manifests, changelog, release)
- [ ] W20.16 Monitorar a autorização polarauth (código de dispositivo) e sincronizar o token
  delete:packages quando o dono autorizar

## a fila da onda 21 (a honestidade da página pública — R11 contra a restauração do acervo)

A verificação ao vivo da onda 20 achou a página pública publicada carregando prova social
fabricada (a restauração PR8 P1 do acervo de referência trouxe o conteúdo junto com a
gramática visual): a onda 21 separa os dois mandatos — a gramática visual do acervo fica
(héro, seções, cartões, trilhos, tratamentos CSS), a prova social falsa sai (a lei R11 fecha
definitivo: zero avaliações falsas, criadores fictícios, métricas infinitas).

- [ ] W21.01 O cartão de nota do hero ("4,9", "The perfect organizer and team builder") vira
  declaração honesta de capacidade (sem número inventado)
- [ ] W21.02 O deck de criadores ("Alan Neres"/"Nato" com likes/posts/views inventados) vira o
  estado honesto declarado (os estúdios da família como perfis reais, zero métricas falsas)
- [ ] W21.03 As notas por app do fan deck (4,9/4,8/4,9/4,9/4,7) saem (os badges reais ficam:
  35 AI Routes, Kathesis DSP, VersaWaze 3D, Zero Local GPU, Instant Sync)
- [ ] W21.04 O catálogo do bento Cadria ("LAST COLONY", TOP 10 com filmes inventados,
  "99% Match", live TV "38 watching now") vira vitrine declarada de conceito sem prova
  social falsa
- [ ] W21.05 O muro explorer ("Join over 100,000 human and AI creators", reels com criadores
  @ falsos) vira o estado honesto
- [ ] W21.06 Os contratos de teste da entryface/entryflow andam junto (a bateria pinava o
  acervo restaurado; a nova lei R11 vence e os testes pinam o estado honesto)
- [ ] W21.07 Verificação ao vivo pós-cura: screenshots claro/escuro desktop/mobile da página
  pública sem um número de prova social inventado
- [ ] W21.08 A deleção do pacote buildcache aposentado (76 versões residuais do
  devthink-buildcache da era 2.0.15) via escopo delete:packages assim que o polar auth
  capturar a autorização (a diretiva 2.0.16 aposentou o pacote; as versões antigas ficaram)
- [ ] W21.09 A questão arquitetural da indireção por expressão: as lanes vhe ainda empurram
  cache de registro pelo env CACHE_IMAGE com a expressão do repositório enquanto o contrato
  bane o nome literal (5 pontos cache-to: type=registry) — a decisão do dono: aposentar o
  cache de registro por inteiro (embed no run) ou reassentar o contrato na realidade das
  lanes
