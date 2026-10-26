# Regras destiladas dos commits — a lei que os 719 + 189 commits codificam

Este documento é a destilação das regras da operação, colhidas dos 719 commits de `wenathlan/devthink` (main) e dos 189 commits de `iakadion/allan` (main), cruzadas contra a doutrina viva de `redesign.doctrine.md`. Cada regra traz: (a) a lei em uma frase, (b) a evidência de origem (prefixos de sha + trechos de mensagem), (c) o status — **enforced-in-ci** (um gate/lane recusa a landing), **enforced-by-convention** (a operação cumpre, nenhum gate obriga), **aspirational** (declarada, ainda não executada). Regras novas que a doutrina não cobre estão marcadas [NOVA]; divergências doutrina-vs-commits estão na seção final.

---

## A. A lei do versionamento e da rung (o degrau)

**A1. A versão sobe em degraus (rungs) lockstep: o bump toca a raiz, o envelope e toda a família de carriers ao mesmo tempo.**
- Evidência: `179a0372` "the version walks to 2.0.130 across the whole lockstep family (the root, the envelope, every carrier the release sync owns…)"; `94090ad7` (#72) "The metadata family stamps 2.0.142 and 2.0.143"; `1ce7c996` "the seven family envelopes stamp 2.0.117".
- Status: enforced-in-ci (a verificação de metadata/check:maintenance e o readme/health gate recusar stamp órfão — ver `9236645a` "the 2.1.6 stamps the last commit's package bump orphaned … re-lockstep to 2.1.7 so the health gate and the readme gate answer the envelope again").

**A2. O bump só acontece quando um erro aparece DEPOIS de aterrissar — nunca a cada tropeço de preparação; o commit de aterrissagem carrega o trailer `— step: <rung>`.**
- Evidência: 66 commits do devthink carregam "step: 2.0.xxx" no fechamento do corpo (ex.: `409d1597` "…— step: 2.0.127"; `dc8d5a05` "— step: 2.0.128"; `e29c6123` "— step: 2.0.138"); bumps aparecem atrelados a aterrissagens verificadas (`645834df`, `ecb33523`, `32219f5a` chore release 2.0.96).
- Status: enforced-by-convention.

**A3. Nenhuma rung abre sobre pipeline vermelho; cada onda fecha com a bateria verde e o readiness "go".**
- Evidência: `7d9e5946` (docs/infra) "the wave discipline hardens into one wave one grouping one commit with the rung climbing every wave and no wave opening on a red pipeline"; `409d1597` "sixteen gates green local … readiness go"; `8e7692e2` "the readiness review (27/27 gates go)".
- Status: enforced-in-ci (readiness/gate ladder é gate de merge).

**A4. A terrível lição da rung 127: depois de TODO bump roda a sincronização de metadata (release.mjs sync, permdiff, apifreeze) — bump sem sync deixa a família inteira derivada e o gate recusa tudo.**
- Evidência: `409d1597` "the regression every bump since 2.0.118 carried: the version stamp walked the package manifest … but the release metadata synchronization never ran after the bump, so the whole lockstep family drifted (the generated release notes, the permission baseline, the maven revision, the nuget version, the gemspec … all kept answering 2.0.118), the gate ladder refused every candidate since v2.0.119".
- Status: enforced-in-ci (o próprio gate ladder que detectou a deriva).

**A5. O em-dash e todo caractere não-ASCII vivem na forma literal UTF-8 — escapes `\u2014` do serializador JSON são recusados pelo check:maintenance.**
- Evidência: `a8c64ef3` "the escapes return to the literal characters the baseline pins — step: 2.0.119"; `8a48c041` "the em-dash escapes return to the literal utf-8 form the 2.0.119 rule demands"; `cccc5bb4` reincidente fechado de novo.
- Status: enforced-in-ci. [NOVA — a doutrina não menciona]

## B. O contrato do changelog

**B1. O changelog ganha a seção da rung ANTES do sync de metadata, e o heading atual do changelog é gate do "go" — landing sem a seção é recusada.**
- Evidência: `6302cf1a` "the stamp step writes the heading into devthink/CHANGELOG.md but the landing git add never carried the file … the release notes test answered 'current changelog heading is missing' and the readiness suite answered no-go (the changelog chain is a gate of the go decision); devthink/CHANGELOG.md now rides the staged set of the rung".
- Status: enforced-in-ci (release notes test + readiness).

**B2. As release notes são geradas pelo sync e renderizam as seções por canal de artefato — nunca escritas à mão.**
- Evidência: `1bc33fb1` "the release notes restamp reads the changelog the envelope clock section rewrote"; `409d1597` "the release notes rendering the per channel artifact sections again"; `866b98d9`/`a2a2757f` "the 2.0.24 changelog carries the notes re-render row".
- Status: enforced-in-ci.

## C. O ciclo dos artefatos sincronizados

**C1. A cadeia completa por aterrissagem: bump → CHANGELOG → sync:metadata (release/permdiff/apifreeze) → apifreeze → permdiff → readiness → sweep → dependencyupdates → check:maintenance → matrixverify → npm test no baseline → branch → PR → checks verdes → squash verified → branch deletada.**
- Evidência: a sequência nomeada existe espalhada por dezenas de corpos: `179a0372` ("re-frozen apifreeze artifact and the recorded permission baseline"), `409d1597` ("release.mjs sync, permdiff.mjs sync and apifreeze.mjs sync over the regenerated gate artifacts"), `fcac0603` ("the sweep truth rides the release chain too"), `c579beb7` ("both living gates answer drift false again (check:maintenance, dependency:updates)"), `f4c49c52` ("matrix answer eighteen of eighteen cells green"), `19a84b49` ("the sweep and the matrix and the readiness regenerate green").
- Status: enforced-in-ci.

**C2. O freeze (apifreeze) só roda DEPOIS do build que emite os schemas — sync antes do artefato existir morre no ENOENT.**
- Evidência: `db9cba81` "the dispatch leg of the rung died ENOENT on dist/schemas/observation.schema.json because the apifreeze sync walked the schemas … before any artifact existed … the step now carries node tests/build.mjs ahead of bun run apifreeze:sync".
- Status: enforced-in-ci (a ordem é testada pela própria lane). [NOVA]

**C3. O artefato de sweep/gate nunca carrega estado de execução local — o commit só leva o estado canônico.**
- Evidência: `6421c761` "the sweep artifact returns to its canonical state — the local run never rides the commit"; `419b63bd` "syncs the sweep artifact"; `a3f9b877` "the readiness artifact records the rebased suite run".
- Status: enforced-in-ci. [NOVA]

## D. A lei do publish (npmjs vivo, gêmeo idempotente)

**D1. Toda rung aterrissada publica de verdade: cada app da família responde a versão nova no registro — versão ultrapassada no npmjs é falha da rung.**
- Evidência: `fd0108c7` "the dependency gate rides the ladder, the registry freshness answers the release"; `1ce7c996` "the seven family envelopes stamp 2.0.117 for the registry lanes (the private flag died with the EPRIVATE fix, so npmjs and the github registry accept them for the first time)"; `e08f8936` "the dependency ladder answers the non-breaking updates the registry shipped".
- Status: enforced-in-ci (dependency/registry freshness gate).

**D2. O contrato 409 do gêmeo: publicar versão já existente (409 "already published" OU 409 "still staging" na lane irmã) é VITÓRIA idempotente, nunca erro — todo outro fracasso mantém o retry limitado com recheck do registro.**
- Evidência: `e1fc923d` (#69) "both 409 forms (the version already published and the version still staging through the sibling) close the lane as the idempotent win, every other failure keeps the bounded retry and the registry view recheck"; `7384f967` (#67) "the npm retry rechecks the registry between the attempts so a version that landed through the twin publish lane answers as the idempotent win it is"; raiz histórica `8032038e` "make github package publishing idempotent"; `a7280c3b` gem lane "treats the immutable envelope as present when the registry answers the duplicate rejection".
- Status: enforced-in-ci. [NOVA em detalhe — a doutrina fala "idempotente" sem o contrato 409 duplo]

**D3. A lane do npmjs instala com as credenciais e o mirror certos: o npmrc comprometido restaura o auth do token de job, e o redirect do registry que o setup-node deixa no home config é neutralizado.**
- Evidência: `2c7289fc` "the home npmrc loses the registry redirect — the setup node step leaves the github package registry in the home config the project restore never reaches, the install lanes neutralize it"; `d785887f` "the github npm lane authenticates the family scope — the install writes the registry auth from the job token"; `f7901263` "the github npm lane restores the committed npmrc so the install resolves the public family mirror".
- Status: enforced-in-ci. [NOVA]

**D4. O tag da release pertence à lane auto-tag do run da main-push — a aterrissagem PAT nunca empurra tag própria (o push manual mata a cadeia de assets por herança de skip); o fallback GITHUB_TOKEN mantém tag+dispatch.**
- Evidência: `dc8d5a05` "(4) THE AUTO-TAG RACE: the 128 release shipped its notes with zero assets because the landing's explicit tag push raced the main-push release run … the ladder's landing now leaves the tag to the auto-tag lane whenever the owner pat fired the merge … while the app-token fallback keeps the explicit tag and dispatch".
- Status: enforced-in-ci. [NOVA]

**D5. Commits de automação carregam a identidade do dono (iakadion), nunca identidade de máquina.**
- Evidência: `52e1ae0a` "the automation branch commits answer iakadion now, never a machine identity".
- Status: enforced-by-convention. [NOVA]

## E. Higiene de branch (só a main)

**E1. O repositório carrega apenas a main: trabalho chega por branch curta → PR → checks completos → squash merge verificado → branch deletada.**
- Evidência: os landings da era atual são squashes de PR com um commit só — `5b42ccde` (#75), `9f82e54e` (#74), `3a67b641` (#73), `94090ad7` (#72), `cf4e6743` (#70) …; os poucos merges diretos são sincronizações de remote ("Merge branch 'main' of https://github.com/wenathlan/devthink" ×3; idem no allan ×3); nenhum nome de branch aparece na história além de main.
- Status: enforced-by-convention (o (#NN) é o rastro do squash; nenhum gate proíbe push direto além da proteção de branch).

**E2. Nada de arranhão (scratch) entra na árvore do devthink: rascunho, temp, profiles de probe e scripts órfãos são varridos na mesma rung que os gerou.**
- Evidência: `38e1e04b` "the silent scratch leaves the tree, the static scan stays honest"; `7f3f8cc7` "the temp archive stays outside the tree"; `64d21e72` "the scaffold skills leave the tree and the local scratch stays out"; `9218a6e2`/`c7609879` "the probe evidence trees/profiles leave the tracked contract"; `5b62decc` "the session8 scripts folder retires".
- Status: enforced-in-ci (static scan / estrutura). [NOVA]

**E3. O index.html volta ao estado de fonte limpa depois de qualquer build local — o build de um app reescreve o index DO APP, nunca o da raiz, e o commit nunca carrega hash de bundle.**
- Evidência: `7ed1ba9b` "the family build reverts the entry rewrite — the vite build writes the hashed entry into the source index and the design contracts read the source form, so the build step restores the tracked index right after the dist lands"; `deeec0d3` "the entry rides the source face again — the hashed ghosts leave the html"; `bbe01009` "the source index of the os returns after a build smoke had rewritten it with the hashed bundle"; `522cd98b` "the build smoke rides the throwaway copy so the source index stays clean".
- Status: enforced-in-ci (design contracts leem a forma-fonte). [NOVA em força]

## F. A disciplina da onda (wave)

**F1. Uma onda = um agrupamento = um commit (batched); aterrissagens em lote de centenas de alterações são o padrão, não exceção.**
- Evidência: `7d9e5946` "one wave one grouping one commit"; `94090ad7` "(178 renames, barrels and imports rewritten)" — 315 files changed no stat; `8e7692e2` "388 paths changed; 156 test files green (2989 tests and the one governed skip)"; `6e5b2c26` "the workflows fold into one correlated battery"; `802bace87` (allan) "the md corpus answers one content each".
- Status: enforced-by-convention.

**F2. A doutrina dos 400 waves / 300 steps: o plano de campanha vive no documento oficial com aceitação por rung; governança com ondas de 2-3.**
- Evidência: `0d12fb33` "the governance with the waves of 2 3 and the 400 waves 300 steps law … the 12 phase master plan, the ten point checklist and the to visit list closed at the last paragraph"; `7d9e5946` "the campaign ledger of three phases with acceptance per rung".
- Status: aspirational (planejado em docs; a cadência real observável é rung por rung). [NOVA]

**F3. Nada é deletado sem a lógica ser absorvida; nada é purgado sem conferir o que os gates leem.**
- Evidência: `6e5b2c26` "nothing is deleted without its logic absorbed"; `19a84b49` "the operational reference documents return from the purge — the gates of the ladder read twenty five live inputs the two document wave had swept with the legacy plans … restore from the history they never left".
- Status: enforced-by-convention. [NOVA]

## G. As leis de nome

**G1. Nome de componente não tem dot: PascalCase limpo, escrito uma vez — 178 renames nas 11 famílias fecharam a purga, incluindo as formas de referência mais silenciosas (alias sem extensão, imports irmãos, import do CLI strip-types).**
- Evidência: `94090ad7` (#72) "The dot leaves the component names across the eleven family applications (178 renames, barrels and imports rewritten) … the three quieter reference forms heal from the rename map: extension-less alias paths, same-folder sibling imports and the strip-types CLI import".
- Status: enforced-by-convention (a purga foi batch rung; o naming gate cobre o que vem depois).

**G2. Underscore é recusado no vocabulário — existe um gate de naming com braço de underscore, e o braço específico avalia antes do geral para não engolir exceções legadas (padrões do asset Android). nem sequer o vocabulário de storage escapa.**
- Evidência: `724df8b8` "the storage vocabulary answers the reviewed words without the underscore" + corpo: "the naming gate of the android asset set carried a dead arm: the build script pattern itself carries underscores, so the general underscore gate swallowed it before the specific message could ever answer — the specific arm rides first now and both verdicts stay reachable … remnant tripped the underscore refusal every run, the guard stands"; `163ae41a` "the dead arm of the naming gate rides first".
- Status: enforced-in-ci. [NOVA — a doutrina só fala dot/hífen]

**G3. Widget renomeia para uma palavra inglesa, sem gaguejar o nome do app (stutter rule) — controls.exportrow, sourcerail, stageart, visualizepanel, login.form.**
- Evidência: `4457dc93` "twenty widgets rename to the one word english rule with the stutter dropped and sixteen anchors follow the imports"; `d05d6b3d` "the five studio widgets obey the one word rule as controls exportrow sourcerail stageart and visualizepanel"; `c09971ec` "the login widget obeys the one word rule as login.form".
- Status: enforced-by-convention (testes de design seguem os anchors). [NOVA]

**G4. Cada app concentra os widgets reutilizáveis numa pasta widgets/ única (a components/ morre byte-idêntica), âncoras e testes de design seguindo os imports.**
- Evidência: `256f6584` "the ninety nine reusable widgets concentrate in sol widgets in alphabetical order byte identical"; `ec9a1936`, `294ae5d4`, `3f4347e4`, `8cbd2b76`, `9f1adeff`, `f3ef710c` — a mesma frase por app; `8e1dabe9` "the wave 2 componentes centralization lands — every app keeps only anchors beside Sol/componentes".
- Status: enforced-by-convention (config/structure checks acompanham). [NOVA]

**G5. Toda metadata ativa responde devthink — nomes de arquivo, PLUGIN_ID, router, prefixes de log, user-agent: nenhum nome de linhagem absorvida (maene/opencode) sobrevive.**
- Evidência: `8e7692e2` "every file name and every active metadata of the merged repositories answers devthink … the metadata the repositories carry answers devthink alone" (com a história preservada: changelog sections, third-party notices, genealogy audit).
- Status: enforced-by-convention. [NOVA]

## H. A lei da estrutura de arquivos (família correlata, flat)

**H1. Lógica correlata agrupa-se num arquivo-família por tema na raiz do app (dns/gateway/media/concurrency/window), e as páginas ficam flat — o catálogo raiz é só estrutura, nunca apresentação.**
- Evidência: `466feb6c` "the dns, gateway and media logics ride the app roots"; `64321e91` "the match, ranking, mixer and timeline logics ride the roots"; `6d4affd1` "the concurrency logics ride the app root from the competitors"; `c4a67018` "the pure logics ride the app root and the pages stay flat"; `04a0f582` "the root catalog is structure only, the theme layer owns the spawns"; `763665b0` "Sol/windowregistry.tsx leaves the tree for good … labels and spawns live in the data layer, the logic lives at the root, the components bind".
- Status: enforced-by-convention (o flat structure contract e os typecheck gates cobrem consequências).

**H2. O contrato de estrutura flat recusa qualquer conteúdo rastreado que duplique outro (hash match mata a lane); corpo canônico de workflow vive embutido no módulo como array JSON, não como arquivo irmão.**
- Evidência: `dc8d5a05` "(2) THE DUPLICATE WALL: the canonical desktop body lived as a tracked file beside the module, and the flat structure contract refuses any tracked content duplicating another (the hash match killed the rung's ci lane); the body now rides embedded as a json-escaped line array inside the module".
- Status: enforced-in-ci. [NOVA]

**H3. A família standard de pastas é fechada (ex.: raiz web com uma família vite/index/vercel/netlify/capacitor/schema; mobile e scripts dissolvidos; quatro pastas do padrão) — subapp duplicado não existe.**
- Evidência: `8e7692e2` "one vite/index/vercel/netlify/capacitor/schema family at the web root — the subapp duplicate is gone … the structure lands on the four folders the family standard owns"; `da7ce199` "the interface dissolves into the web root, one folder serves every surface".
- Status: enforced-by-convention. [NOVA]

**H4. Os documentos de planejamento da operação vivem no allan (organizado/md), scripts .cjs/.mjs em organizado/cjs — devthink carrega só código da família; documentos operacionais que os gates leem ficam.**
- Evidência: `cf4e6743` (#70) "The operation scripts and the archaeology report now live in iakadion allan organized, so devthink carries only the family code"; `5b6d506d8` + `e15c6e0da` (allan) "the twelve operation cjs scripts … move into organizado cjs and organizado md of allan, where every script and every planning document of the family operation lives"; contrapeso `19a84b49` (os 25 inputs vivos dos gates voltam).
- Status: enforced-by-convention.

**H5. A árvore do devthink carrega os baselines biome em jsonc com assinatura própria por app, byte-idênticos ao template da família; o config parity gate falha a pipeline no primeiro drift.**
- Evidência: `4441d87f` "the biome baseline rides byte identical across the eleven apps at the family template … and the config parity gate runs in the family configs workflow failing the pipeline on the first drift"; `7c919488` "the biome baselines return to jsonc with their own signatures"; `bbe01009` "the structure gate exempts the deliberate family biome baseline the parity law enforces".
- Status: enforced-in-ci. [NOVA — "biome schema" da missão]

## I. A lei do CSS 2026 e do design family

**I1. Sol CSS por tokens: escada completa de bandas (10 bandas, incl. toast), variáveis de geometria do shell, silk curve, física de tecla — e ZERO valor bruto fora da escada (zero raw band scale, zero raw values, zero invented numbers).**
- Evidência: `248dbe79` "the sol css gains the complete ten band ladder … the zenbex guard test enforces the ten bands, the geometry, the silk curve and the zero raw band scale"; `3122606a` "the four raw z index values ride the named bands with identical computed values, zero visual change"; `d05d6b3d` "the declared tokens replacing the hardcoded swatches"; `24fc6c66` "the ladder rides the bands with zero raw values".
- Status: enforced-in-ci (zindex/zenbex guard test).

**I2. O guard de camadas tem o nome verdadeiro: z-index vive em bandas nomeadas com calc entre elas — e o teste se chama zindex (o apelido zenbex foi corrigido duas vezes, nos dois repos).**
- Evidência: `8020d2db` "the zenbex name corrects to zindex — the layer discipline guard keeps the ten bands"; `b0769551c` (allan) "the zenbex name corrects to zindex — the layer plan rides the true name of the property that defines the stacking"; `e8d8a155` "the zindex guard rides node test".
- Status: enforced-in-ci. [NOVA]

**I3. Toda animação respeita reduced-motion e reduced-transparency (zeroing, pausa, anim-paused hook) com duty-cycle em loops.**
- Evidência: `248dbe79` "the family motion law of the duty cycled stepped loops with the reduced motion zeroing and the anim paused hook, the silk surface law … with the reduced transparency guard"; `e01a031b` "paused by the hook and zeroed by the reduced motion preference"; `f4b8f84a` "the getry hard stop of the reduced motion lands as the last word".
- Status: enforced-in-ci (design suites).

**I4. Lei da cópia (copy law): todo texto de UI vive na labels table do banco de dados do app — manifest inglês tipado como fonte da verdade, seed idempotente protegendo linhas traduzidas, accessor tipado, e o visitor bundle nunca importa a store nativa (mirror de cache no browser é permitido como espelho, nunca fonte).**
- Evidência: `9ca602ba` "the labels store joins the database at version three with the typed rows carrying the revision and the translated flag, the labels file carries the english manifest of the chat surface as the source of truth with the typed accessor, the idempotent seed protecting the translated rows"; série por app: `996b0ebc` (cadria 495 strings), `40a68b6f` (saddle 423), `88130dfc` (debonair 348), `ff067083` (forge 213/foundry 204), `ae87f4bb` (argan 187/getry 186/vault 209), `83e8c708` (cobaia 128/stealthhead 197); `996b0ebc` "the browser seed mirrors the rows into the local cache because the visitor bundle never imports the native store"; `272328ac` "the no storage law of the own legal copy wins — the label seed drops the localstorage mirror and the manifest answers the english source of truth"; sweep fecha: `ae87f4bb` "the sweep finds zero rendered strings outside the accessor".
- Status: enforced-in-ci (sweep de strings renderizadas fora do accessor). [NOVA em detalhe — a doutrina tem a Lei do DB; os commits mostram o mecanismo completo]

**I5. Toda app é autoredada em inglês e o módulo Google GTX traduz vivo qualquer outra língua (12 línguas), com parede notranslate nos nomes nativos — a escolha de língua é do usuário, a superfície nunca se auto-traduz.**
- Evidência: `7d8c6898` "every app is authored english and the google gtx module answers every other language … the twelve language ladder covers en pt es fr de it ja ko zh-CN ru ar hi"; `00289e9f` "the theme never auto-translates — the settings choice is the only trigger"; `2878cd68` "the translation session arms only for a saved language choice".
- Status: enforced-by-convention (suite cobre o picker). [NOVA]

**I6. Estados honestos e oito estados por widget: skeleton/Retry ladder em todo estado, spinner de busy, oito estados nos primitivos de botão — dot decorativo, número inventado, alert de janela e boot teatral morrem.**
- Evidência: `4457dc93` "the theatrical boot sleeps and the invented numbers … die for the honest staged cards"; `e0effc25` "the decorative dots of the landing the ready badge and the ingest shelf die"; `c09971ec` "the dashboards answer the honest loading with the skeleton bars and the inline status instead of the window alert"; `1ad54ff5` "the honest ladder rides every state from the skeleton to the retry"; `c616dd2e` "an empty category answers empty folder, never an invented record".
- Status: enforced-by-convention (design suites nos estados). [NOVA]

**I7. A identidade de cor de cada app é pinada (forge lime, foundry azul, vault gelo) e os contratos de design reconciliam qualquer drift do CSS de volta aos valores pinados; skins/temas migram juntos nos landings.**
- Evidência: `f4b8f84a` "the identities ride back where the css had drifted from them with the forge lime the foundry azul and the vault gelo restored to the pinned values behind the alias wiring".
- Status: enforced-by-convention. [NOVA]

## J. As leis das engines (saddle, vault, url gate)

**J1. Sandbox = execução no servidor via saddle: jail por sessão, efeitos reais de filesystem, SEM processo e SEM socket; o simulador browser-pure é fallback offline declarado, nunca a verdade; o registro de modalidades do saddle (modalityregistry) é a fonte única e o relatório nunca mente sobre o que executou.**
- Evidência: `3a67b641` (#73) "the sandbox of the run and storage lane lands on the server side: a jail per session, real filesystem effects only, no process and no socket, five routes under /api/v1/sandbox and eight real tests"; `9f82e54e` (#74) "the 2.0.145 rung wires the sandbox client and lands the vault shaped storage lane"; `0d12fb33` "the sandbox of 20 to 30 modalities with the zero touch doctrine" e "the isolation ladder of isolate wasm and microvm with the node vm never a boundary"; `4268b4ec` "the hypervisor principle of every numeric ceiling a software object".
- Status: enforced-in-ci (as 8 rotas com testes reais; relatório de modalidades é sonda pura de PATH).

**J2. Storage = vault: a lane de storage do servidor fala com o vault, o My Files lê a conta real, e a barra de capacidade responde o uso real da infraestrutura quando a lane está de pé — quota do dono da conta, sem teto hardcoded.**
- Evidência: `9f82e54e` (#74) "lands the vault shaped storage lane"; `5b42ccde` (#75) "settings, console and My Files receive the craft grammar with the capacity bar answering the real infrastructure usage when the lane is up"; `0d12fb33` (docs) "the storage law with the sha 256 chunks and the vault faun lesson with the decoy db".
- Status: enforced-in-ci nas rotas que existem; quota-sem-teto é enforced-by-convention.

**J3. O url gate recusa endereço não-público POR RESOLUÇÃO, nunca por nome — o exchange OAuth e toda chamada de servidor passam por ele (http/https, privado/loopback recusado).**
- Evidência: `5b42ccde` (#75) "The oauth exchange closes the dead end through the provider token endpoints behind the url gate, which refuses every non public address by resolution and never by name"; `3bfff421` "the gateway calls answer the safe url guard … the pairing can no longer be aimed anywhere but a well-formed base"; docs `4268b4ec` "security gains the no shared localhost cert law".
- Status: enforced-in-ci. [NOVA — resolução-por-nome é o detalhe que a doutrina não pina]

**J4. Contas reais: o servidor é o dono das contas — digest scrypt com salt por conta, bearer de sessão guardado só como sombra sha-256, sessão da família no data home compartilhado (um login cobre a família); o callback OAuth completa o exchange (o "received" morto morreu).**
- Evidência: `5b42ccde` (#75) "scrypt digests with a per account salt, session bearers stored only as their sha-256 shadow, the family session on the shared data home so one login covers the family"; `999d0fc2` "the wave 9 oauth doors land — the provider row and the single callback"; `24c1e878` "the auth gates answer scrypt".
- Status: enforced-in-ci.

**J5. Nada persiste no navegador do visitante como fonte de verdade; as chaves legacy de browser caem por onda (localstorage mirror da label seed morreu; a cota de navegador deixou de ser o teto).**
- Evidência: `272328ac` "the no storage law of the own legal copy wins — the label seed drops the localstorage mirror"; `77c5e2c0` "the splash rides the spring and the guarded exit with the no storage law writing nothing"; `c616dd2e` (a cota lê navigator.storage.estimate — diagnóstico honesto do que ainda é browser, corrigido no registro).
- Status: enforced-by-convention (cada onda troca uma chave; sem gate global ainda).

**J6. O DB nunca é baixável nem servido no deploy estático — e o deploy é universal (GitHub Pages hoje, Vercel/Netlify amanhã, base de rota derivada do pathname de boot).**
- Evidência: `95798855` "the router base derives from the boot pathname under relative hosting"; `b6d6ae64`/`f3d1f374` "the site entry resolves its assets under the repository folder"; `a80da1db` "the family routers derive their base from the boot pathname"; a proibição de servir o DB aparece na doutrina (server.ts serveStatic) e o movimento dos commits (storage lane no servidor) executa a direção.
- Status: enforced-by-convention (o deploy universal tem CI; a proibição de servir o DB depende da onda 3 completar).

## K. A lei da honestidade

**K1. Nada fake na superfície: pill de ferramenta falso, boot teatral, número inventado, registro inventado, estado mentiroso — tudo morre no commit que expõe; a honestidade é verificável (capacidade real, contagem real, vazio responde vazio).**
- Evidência: `95257f3f` "the fake tool pills leave and the honest notice stays"; `3197275e` "the fake parts (the decorative hash fields, the checksum that never validates) are named as the things the new code never repeats"; `c616dd2e` "every figure real … an empty category answers empty folder, never an invented record"; `0d12fb33` (docs) "the honesty receipts with the explicit signing states".
- Status: enforced-by-convention. [NOVA como princípio nomeado]

## L. As leis de teste

**L1. Teste é .ts e só .ts — bateria vitest/node por app, contagem pinada e reportada no commit (3198 tests, 414/416 saddle, 2989 no merge, "the one governed skip"); arquivos não-TS da pasta de testes migram pro allan.**
- Evidência: contagens citadas em `8e7692e2` ("156 test files green (2989 tests and the one governed skip)"), `9236645a`/`e29c6123` ("the 3198-test battery green whole"), `8e943a1b` ("the suite answers four hundred sixteen green"); migração: `5b62decc` "the session8 scripts folder retires — the family scripts live inside the os app tests … the loose root scripts folder leaves the tree"; `e15c6e0da` (allan) scripts saem do devthink tests; doctrine § Lei do teste confirma a direção.
- Status: enforced-in-ci (a bateria roda nas lanes; a migração completa é enforced-by-convention).

**L2. Testes reais, sem mocks de conveniência: as suítes exercitam funções reais (spawns de subprocesso, servidor vivo, gateway vivo), e a verificação de feature inclui browser ao vivo + leitura VLM nos dois temas.**
- Evidência: `f4c49c52` "the matrixverify test spawns the whole verification matrix as subprocesses"; `526f1101` "the saddle suite boots the web server it ships"; `88a83e82` "verified end to end over the live gateway: the streamed answer renders (the exact-token probe answers)"; bodies da 2.0.144/145: "verified: lint clean, tsc clean, 3198 tests green, browser and vlm confirm the pane open and empty states"; `7d8c6898` "verified end to end live in the window".
- Status: enforced-by-convention (as suítes existem; "no mocks" é prática, não gate). [NOVA em detalhe]

**L3. O baseline de falhas Windows conhecidas é explícito: o conjunto ambiental pré-existente idêntico no head prístino é aceito; FALHAS NOVAS não aterrissam ("zero new failures … the 9 fails are the pre-existing environmental set, identical on the pristine head").**
- Evidência: body de landing da onda 2: "the full vitest battery answers 3198 pass with zero new failures (the 9 fails are the pre-existing environmental set, identical on the pristine head)"; `409d1597` "the eight failing suites green fifty-eight of fifty-eight" (as oito viraram verdes antes do go).
- Status: enforced-by-convention. [NOVA]

**L4. Todo lane que spawna subprocesso carrega orçamento próprio de timeout; o piso da casa é 30s (teto, nunca espera) — o "cold runner timeout lottery" morreu por lei.**
- Evidência: `f4c49c52` "the cell walk now answers a sixty second budget of its own while every other test keeps the house default"; `e29c6123` "the house floor itself moves from five to thirty seconds … (the timeout is a ceiling, never a wait)".
- Status: enforced-in-ci (containerpack guardian re-pinna o piso). [NOVA]

## M. Os contratos das lanes de CI

**M1. O vocabulary do sweep e as origens revisadas: o origin sweep mantém a honestidade (placeholder sem path quebra o sweep — "the origin sweep stays honest"), as origens revisadas vivem como DATA ROWS (gateway upstreams, oauth origins nas reviewed rows) — dado é dado, não código.**
- Evidência: `590517fe` "the reviewed origins ride the gateway upstreams as data rows"; corpo de rung (fix(verify)) "the wave 1 catalog heal lands — the oauth origins join the reviewed rows"; `409d1597` "the storage platform placeholder … joins the sibling no-path grammar so the origin sweep stays honest"; `ae87f4bb` "the sweep finds zero rendered strings outside the accessor".
- Status: enforced-in-ci. [NOVA]

**M2. Instalação congelada SEM scripts em toda lane que só constrói: `--ignore-scripts` no frozen install de TODAS as lanes (ci, verify, security, release, family-mobile, container builder) — o postinstall lottery do better-sqlite3 é lei morta.**
- Evidência: `cccc5bb4` "every bun install --frozen-lockfile of the ci, verify, security, release and family-mobile lanes now answers --ignore-scripts the way the publish lanes, the pages lane and the maintenance ladder already did"; `da37ec4c` "the container builder joins the ignore-scripts wall"; `52e1ae0a` origem da wall.
- Status: enforced-in-ci. [NOVA]

**M3. Supply chain: action pins seguem releases correntes, imagens de container carregam digest de registry nas DUAS stages literais de runtime (nunca digest escrito à mão em outro lugar; baseline ARG-driven fica em tag), overrides de vulnerabilidade andam no manifest + nos TRÊS sabores de lock regenerados.**
- Evidência: `031791c9` "the workflow action tags follow their latest releases — the mutable pins the ladder owns"; `9236645a` "the five unpinned container images the scanner refused close through the digest ladder … exactly the two literal runtime stages carry stamps, every ARG-driven baseline keeps the tag form … no hand-written digest anywhere else"; `f8856e5b`/`f7901263` "the override walks both locks … all three lock flavors regenerate"; `b10446c8` "docker login walks to the four seven the registry answers".
- Status: enforced-in-ci (osv lane, runtime policy gate, imagedigests check). [NOVA]

**M4. O ladder de dependências anda sozinho no que o registry responde como non-breaking, com o gate de drift fechando falso — updates quebram em override documentado, nunca em range solto.**
- Evidência: `c579beb7` "the dependency ladder walks its available non-breaking update — the verify gate ladder refused the rung 127 chain again at the living check (non-breaking dependency updates are available)"; `d57c1766` "react hook form rides the seven ninety one the registry answers, the gate drift closes false"; `520f2ac6`/`807e42ac` "the dependency ladder rides the non breaking wave".
- Status: enforced-in-ci (check:maintenance, dependency:updates). [NOVA]

**M5. O schema do workflow é validado antes de tudo: job-level if não lê matrix context (o GitHub recusa o arquivo inteiro); a exclusão anda na expressão include da matrix.**
- Evidência: `dc8d5a05` "(1) THE SCHEMA WALL: the job-level if the android lane carried referenced the matrix context, a context the job-level conditional never answers — the workflow schema refused the whole file on the branch push … the os exclusion now walks the matrix include expression itself".
- Status: enforced-in-ci (o próprio GitHub recusa). [NOVA]

**M6. A pipeline publica no PR e espera o PRIMEIRO check existir antes do watch — checks completos antes do merge, sempre.**
- Evidência: `6302cf1a` "gh pr checks --watch refuses instantly while zero checks exist … the first check is now polled for (up to five minutes) before the watch walks the pipeline to its end"; `30734f5c` "the family matrix builds before it tests".
- Status: enforced-in-ci. [NOVA]

**M7. A família toda responde junto: dez lanes de workflow verdes ao mesmo tempo é o critério de rung ("the ten workflow lanes stand green together"), matrix 18/18, e o CodeQL tem teto de 60 minutos.**
- Evidência: `7384f967` "the ten workflow lanes stand green together"; `f4c49c52` "eighteen of eighteen cells green"; `8e7692e2` "the codeql ceiling rides at sixty minutes (the merged surface measured past thirty thirteen times)".
- Status: enforced-in-ci. [NOVA]

## N. Disciplina operacional (os dois repositórios)

**N1. Dois repositórios, papéis fechados: devthink = código da família; allan = arquivo + organizado por extensão (md/cjs/svg/…) — nada de doc/planejamento novo dentro do devthink.**
- Evidência: `cf4e6743` (#70); `5b6d506d8`/`e15c6e0da` (allan); a série "split N/M" do allan cria organizado/<ext> por extensão (`8824c40b3` split 11/36 organizado/source, `557462528` split 9/36 organizado/json, …).
- Status: enforced-by-convention.

**N2. O allan é arquivo zero-perda: todo commit de split/pedaço declara "conteudo preservado" + provenance "orig <sha>"; arquivos >100MB viram pedaços byte-exatos (limite GitHub 104857600) OU Git LFS; os originais removidos ficam provados numa tag; a certificação fecha em relatório.**
- Evidência: `2fb714f3b` "adiciona pedacos dos arquivos maiores que 100 MB … conteudo preservado; orig 66653aef0"; `6df9d1867` "os 6 originais maiores que 100 MB entram via Git LFS (ponteiros no tree, bytes no servidor LFS)"; `db641c69a` "remove 642 arquivos originais (conteudo preservado na tag arquivo/md-pre-rascunho-20261013)"; `626c135c5` "push final da fase chunks-2 e certificacao"; `1b4d75321` "divide neo.packages/pack.json (125 MB) em 2 pedacos byte-exatos".
- Status: enforced-by-convention (disciplina do arquivista). [NOVA]

**N3. O corpus md do allan se consolida sem duplicar: duplicatas exatas dobram na gêmea mantida, documentos restaurados renomeiam em colisão, e o manifest carrega a provenance inteira.**
- Evidência: `802bace87` "the exact duplicates fold into their kept twins … and the manifest carries the whole provenance so nothing is lost"; `761987028` "reduce corpus cc57f462..b0769551 to ten hierarchical documents (#1)"; `455f8d891` "the ten documents fold into infraestrutura, links and the package union".
- Status: enforced-by-convention. [NOVA]

**N4. O harvest é reproduzível do próprio repositório: os scripts cjs (repo.case harvest/metadata/build, regras walk/extract/digest) varrem cada manifest blob de cada commit e catalogam uma linha por pacote (nome, link, uso).**
- Evidência: `f4d27a03` "the harvest walker that reads every manifest blob of every commit, the metadata fetcher that pulls the registry descriptions, and the build assembler that categorizes and writes the document"; `e15c6e0da`; `0e7bb1738` "every package name of every dependency key of every manifest blob of every commit of allen and devthink … one row per package with name first, link second and use last".
- Status: enforced-by-convention. [NOVA]

**N5. O allan tolera commits de arranhão ("fefe", "rascunho", uuid) — o devthink não; e o .gitignore/.gitattributes do allan marcam binários e ignoram pesados.**
- Evidência: 44+ commits "fefe" no allan contra zero (pós-era arcaica) no devthink; `027b9f74d` "restaura .gitattributes (marca binarios …) e corrige .gitignore"; devthink: `38e1e04b`, `64d21e72` (E2).
- Status: enforced-by-convention. [NOVA — nuance que a doutrina não registra]

**N6. O hook Mimosa bloqueia bash tocando .ts/.tsx/package.json no ambiente de operação — escrita nesses arquivos por Write/Edit ou script node do organizado; scanner com falso positivo delega a escrita a subagente com design fechado.**
- Evidência: nenhum commit menciona Mimosa — é lei do ambiente de operação (este próprio agente roda sob o hook), confirmada na doutrina §5. As regras internas (sem literal de loopback, spawn só por argv, saídas por join de array) vêm da prática do scanner, não do corpus.
- Status: enforced-by-convention (ambiental). [GAP — sem evidência em commit]

---

## Divergências: o que os commits dizem e a doutrina (ainda) não cobre

1. **O contrato 409 duplo do publish gêmeo** (D2) — a doutrina diz "idempotente", os commits definem os dois formas de 409 como vitória.
2. **A regra do em-dash UTF-8 literal** (A5) — recusa de escapes \u2014 é lei de gate desde 2.0.119; a doutrina não menciona.
3. **O trailer "step: <rung>"** (A2) — formato de mensagem de landing codificado em 66 commits.
4. **A wall de --ignore-scripts** (M2) e o **orçamento de timeout por lane** (L4) — infra-leis que a doutrina não registra.
5. **O auto-tag race e a doutrina do PAT** (D4) — tag pertence à lane, não ao landing; herança de skip matou a 128.
6. **O braço de underscore no naming gate** (G2) e a regra da palavra-inglesa-sem-stutter (G3).
7. **A copy law como mecanismo completo** (I4): labels table + seed idempotente + manifest inglês tipado + mirror de browser permitido como espelho (nuance que convive com a Lei do navegador) + sweep de strings renderizadas.
8. **O flat structure contract anti-duplicação por hash** (H2) e o schema wall do workflow (M5).
9. **A lição da purga de docs** (F3): gates leem documentos vivos — purgar sem mapear inputs quebra a ladder.
10. **A identidade de dono nos commits de automação** (D5) e o allan como arquivo zero-perda com provenance por sha (N2).

## Divergências: o que a doutrina diz e nenhum commit reforça (ainda)

1. **"Dois subagentes por vez, no máximo"** — nenhum commit registra o limite; a landing `3a67b641` (#73) afirma "six parallel agents rebuilt the chat surface", ou o limite é posterior àquele landing ou não é estrito. Processo verbal, sem rastro no corpus.
2. **Mimosa (sem literal de loopback, spawn só por argv, saída por join de array)** — lei do ambiente, zero menção em commits dos dois repos. Mantida como regra de operação, não de repositório.
3. **"npm view @wenathlan/<app> version" pós-merge como confirmação manual** — os commits aproximam (registry freshness gate, twin 409), mas o passo manual de conferir o latest não aparece nominalmente; hoje o gate de freshness cumpre o papel.
4. **"100% personalizável via settings"** — a doutrina promete; os commits entregaram pedaços (navbar position, language picker, accent/wallpapers) sem um gate de cobertura de personalização.
5. **"APK/PPI Android sai montado no estilo mobile — verificar a cada onda"** — as android lanes existem e aterrissaram (`179a0372` family artifact lanes android, `dc8d5a05`), mas a conferência visual-por-onda não tem rastro de commit sistemático.
6. **"Os textos vêm do catálogo/DB durante o build"** — cumprido nas superfícies migradas (I4), mas a migração é por app; apps recém-absorvidos começam fora da lei.
7. **"40 modalidades" / "50 nos docs"** — os commits confirmam o diagnóstico da doutrina: o número oficial oscila nos docs (20-30 em `0d12fb33`, 24 no registry); o registro em código continua a fonte.

## Top-10 (resumo executivo)

1. **Rung lockstep com sync imediato** — bump da família inteira + release.mjs/permdiff/apifreeze sync no mesmo passo (A1, A4).
2. **Changelog antes do sync, heading atual é gate do go** (B1, C1).
3. **Publish idempotente 409: gêmeo em npmjs é vitória, não erro** (D2, D1).
4. **Só a main: PR → checks verdes → squash verified → branch deletada; commit de landing leva "step: <rung>"** (E1, A2).
5. **Nome sem dot, sem underscore, uma palavra inglesa sem stutter, widgets concentrados por app** (G1–G4).
6. **CSS por tokens com zero valor bruto — guard zindex de 10 bandas fecha a lei** (I1, I2).
7. **Copy law: todo texto na labels table do DB, seed idempotente, inglês autoredado + GTX vivo; sweep acha zero strings fora do accessor** (I4, I5, M1).
8. **Engines: saddle executa no servidor (jail por sessão, sem processo/socket), vault guarda, url gate recusa privado por resolução — nada canônico no navegador do visitante** (J1–J3, J5).
9. **Testes .ts reais com bateria verde (baseline Windows conhecido aceito, falha nova não aterrissa) + verificação browser/VLM** (L1–L3).
10. **A ladder manda: readiness go, sweep honesto, matrix 18/18, ignore-scripts everywhere, drift de maintenance fecha falso — nenhuma onda abre vermelha** (C1, M2, M7, A3).
