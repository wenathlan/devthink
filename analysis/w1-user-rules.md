# Regras do dono — session7-so-user.txt (wave 1-a)

Fonte: `analysis/allan-md/session7-so-user.txt` (7.559 linhas, ~2,4MB), lido INTEGRALMENTE em 22 segmentos via `sed`/`awk` no terminal (nunca Read no arquivo grande — lei do dono). Estrutura do arquivo: (a) linhas 1–1503 = ditados diretos do dono (PT informal, voz→texto); (b) linhas 1504–7559 = `# USER-AGENTE` (delegações do orquestrador aos subagentes, que carregam as ordens do dono literalmente citadas). Contagem de repetições por tema (grep -c -i, arquivo inteiro): db 441 · windows 414 · subagent 401 · test 364 · saddle 323 · cadria 284 · commit 298 · sol 268 · chat 242 · workflow 229 · sandbox 218 · debonair 216 · ícone 205 · vault 200 · sed 194 · biome 176 · argan 180 · assets 166 · trylle 165 · forge 155 · desktop 155 · getry 154 · foundry 136 · inglês 113 · hardcod 117 · storage 116 · ponto 99 · cjs 93 · emoji 78 · taskbar 71 · publish 63 · runner 65 · login 65 · subpasta 48 · cobaia 51 · localstorage 42 · fake 36 · grade 35 · ban list 35 · supabase 32 · gpu 32 · captcha 25 · tela de login 20 · laranja 19 · waves 20 · mock 10.

AVISO de cobertura: itens "Build for Ever AI", "intro gradiente rosa", "sobreviver a delete de cookies" e "modo incógnito" NÃO existem verbatim neste transcript (devem vir de regras.md/outras sessões). O que existe de equivalente está anotado abaixo (§2).

## 1. DESIGN (Windows 11 pattern, trylle.com, login/lock screen, ícones, redesign por app, fontes, cores)

- **rule**: "você não pegou a paleta... os efeitos... a textura... os shaders... a disposição dos elementos do Windows" — line ~685 — Design 100% Windows: copiar paleta, efeitos, texturas, shaders, disposição e interação do Windows (repetido em dezenas de delegações; "windows" = 414 menções).
- **rule**: "trlollo nao https://trylle.com/ ... mapear tela por tela" — line ~175 — trylle.com é a régua de design da casa (165 menções; receita exata extraída: canvas #0a0a0b, superfícies #171717→#484848, sombras Linear com anel 0 0 0 1px, hairlines color-mix 5%/10%, raio 10px, 150ms micro, ~4670).
- **rule**: "atualizar a tela de login pra ficar parecida com a tela do Windows... perfil, o nome, colocar a senha" — line ~941 — Login/lock screen estilo Windows moderno, com perfil+nome+senha (repetido: "tela de login" 20×).
- **rule**: "tela de login, ela não tem o nave bar... a navegação tá aparecendo na tela de lock" — line ~944 — Login/lock NÃO tem navbar nem navegação de OS visível.
- **rule**: "aqui já era pra abrir o OS sem apertar ou que clicar" — line ~4184 — O OS abre DIRETO no desktop após boot (~2s), sem clique extra.
- **rule**: "os aplicativos era pra tá espalhado na tela, era pra ter o logo no meio, não era pra ter essa grade" — line ~4186 — Ícones espalhados no desktop com logo ao centro; NADA de grade de cards.
- **rule**: "não tem botão start. O start menu é quando clica no ícone do dev team... a logo dev team aqui na frente, sem o nome" — line ~4217 — Start menu abre clicando na LOGO (sem texto, sem botão start).
- **rule**: "o Start Menu é flutuante... essa top bar aí está horrível" — line ~4222 — Menu flutuante estilo Win10/11; topbar fina 44–48px escura sólida (valores: barra 48px acrylic rgb(32 32 32 / 75%) + saturate(3) blur(20px), pins 38×38 r4, indicador ::after 3px, ~4416–4431).
- **rule**: "o design não é design de pílula, é bordas arredondadas... essas bordas brancas nunca vão existir no Windows dez" — line ~4219 — Sem pílulas 999px; cantos 4–8px; ZERO bordas brancas (hairlines escuras).
- **rule**: "Não é laranja... Me tira esse efeito horrível. E o texto se desfazendo" — line ~3865 — Sem laranja no chrome; remover efeitos de texto se dissolvendo.
- **rule**: "É OS, não é aplicativo só de chat" — line ~3868 — devthink é um OS (desktop/janelas/taskbar); o chat é só um app dele.
- **rule**: "NÃO. Eles são aplicativos... cada aplicativo ABRE COMO UMA JANELA do Windows" — line ~5141 — Os 9 apps da família são APLICAÇÕES em janelas Windows (intro → onboarding → janela), sem taskbar/start/desktop próprios.
- **rule**: "utilize só a referência de design do Windows dez, misturado com Brave... design Apple Silicon" — line ~4186 — Fusão Windows + Brave + Apple Silicon; devthink=OS, demais apps=Apple Silicon/janela (~834).
- **rule**: "os ícones são animados... leia exemplo.txt" — line ~4280 — Ícones/marcas premium ANIMADOS (gradiente movendo DENTRO do glifo/PowerClip, 3 camadas, ~2282); nível webflow-awards (~7215).
- **rule**: "o dono REJEITOU os ícones atuais (glifos lucide chapados em quadrados tintados)" — line ~4161 — Zero lucide-react: ícones SÓ de @fluentui/react-icons ou SVG próprio desenhado (~941, ~6300).
- **rule**: "quero design milimetricamente, macro e micro... com animações interações" — line ~679 — Design milimétrico macro+micro, com microinterações (150ms micro; press scale(0.7) 100ms; dtPopIntro 0→1.125→0.725→1 800ms).
- **rule**: "falei pra você reformular todas as páginas... Redesenhar todos os aplicativos do zero AO NIVEL DE WINDOWS TRYLE" — line ~944, ~1055 — Redesign completo de TODOS os apps do zero ao nível Windows+trylle (reprovado 4×+).
- **rule**: "Eu não quero que você reaproveite... quero que você refaça e reescreva tudo do zero" — line ~837 — Proibido reaproveitar/reciclar código de design; refazer do zero.
- **rule**: "abandone esse deisn mande um agente redesenhar nivel webflow" — line ~1463 — Redesign interno nível Webflow + autenticação persistente na mesma onda.
- **rule**: "design pastelão... a landing da página raiz é horrorosa" — line ~3434 — GitHub Pages/landing reprovada ("pastelão"); renovar sem perder funcionalidades.
- **rule**: "No web, o site abre como página SaaS (o app de Explorar, gratuito tipo YouTube/Apple/Cloudflare: logo animada...)" — line ~4944 — Cara SaaS no web (explore gratuito), OS no desktop; intro SaaS/web, installer/boot Windows, Android (~4958–4962).
- **rule**: "the explore app must deliver the same experience class as youtube and discord" — line ~6953 — Explore nível YouTube/Discord (categoria rail, sidebar com nouns first, per-row overflow menus).
- **rule**: "um pente fino em todos os aplicativos... no design de todos, na função de todos" — line ~1022 — Pente fino (auditoria fina) de design E função em todos os apps.
- **rule**: "CLI, desktop, extensão. Todos isso, TV, Android, etc. Eles vão ter uma só interface" — line ~410 — UMA interface só para todos os alvos (web/binário/ISO/APK/extensão/TV/Android) — repetido ~381, ~4943, ~7078.
- **rule**: "a única coisa que difere é o workflow de conversão" — line ~381 — As variantes saem por workflows de conversão (Next, exe, xdpi, vsx...), não por código duplicado.
- **rule**: "Sintaxe inteligente 2026: use o espectro completo do CSS moderno — custom properties, @theme... Hierarquia linear sincronizada" — line ~7248 — CSS 2026: tokens @theme, nada de valor mágico, seções @section/@depends-on, hierarquia linear (lei nova pro sol.css).
- **rule**: "parece que ele tá escrevendo o CSS de forma totalmente estranha. Falei pra utilizar... mil propriedades CSS. Em sol.css, que é o nome do tema" — line ~1453 — Usar TODO o espectro CSS em sol.css (o único stylesheet do tema; "Sol" é nome, não cor — ~628).
- **rule**: "Ban list completa: transition: all, glow neon, dots decorativos... #000/#FFF puros" — line ~4282 — Ban list anti-vibe-code: transition:all, glow, dots/orbes decorativos, #000/#FFF puros, pílulas, roxo-azul genérico, 3 cards idênticos (~3659).
- **rule**: "prefers-reduced-motion hard-stop (.01ms !important, last in file)" — line ~5327 — Guards de acessibilidade no fim do css (reduced-motion + reduced-transparency).
- **rule**: "NENHUM emoji em lugar nenhum... tabelas markdown perfeitas" — line ~2291 — Zero emoji em documento e UI; tabelas válidas.
- **rule**: "Labels de 1 a 5 palavras. Nada de dots/reticências, nada de hífen/travessão em labels" — line ~6299 — Labels curtos, sem hífen/travessão/reticências em texto de UI.
- **rule**: "NENHUM app traduz automaticamente — a página nasce em inglês e SÓ traduz quando a pessoa muda" — line ~3886 — Sem auto-translate por idioma do navegador; inglês nativo + tradução manual (gtx runtime opcional).
- **rule**: "tema claro/escuro... #0067c0 claro, #4cc2ff escuro, Mica dos dois" — line ~4795 — Tema claro+escuro obrigatórios com Mica/accent de ambos.
- **rule**: "o tema vive na pasta Sol/: one folder per page with loose TSX components beside the shared shell" — line ~3178 — Tema Sol por app: uma pasta por página + shell compartilhado (doutrina confirmada ~2416).
- **rule**: "arquitetura de âncoras em quatro camadas: App.tsx → Sol/Sol.tsx → página/página.tsx → componentes soltos" — line ~3603 — 4 camadas de âncora; App.tsx é o ÚNICO TSX fora do tema (~500).
- **rule**: "não existem subpastas dentro das pastas que tão dentro de sol" — line ~688, ~729 — Flat total: zero subpastas em pastas de página; pasta=página=subapp, âncora homônima minúscula (48 menções "subpasta").
- **rule**: "o único TSX fora é o APP TSX, o resto é tudo componente dentro de cada pasta" — line ~500 — Só App.tsx na raiz do app; o resto vive em pastas de página.
- **rule**: "zoom locks at the browser 100 percent baseline" — line ~6538 — Zoom do browser travado em 100%.
- **rule**: "responsiveness... one design track, the presentation screen changes per platform, aspect ratio" — line ~7078 — Uma track de design, adaptação por aspect-ratio/media queries.

## 2. AUTENTICAÇÃO E SEGURANÇA (login persistente, contas reais, segurança vs concorrentes)

- **rule**: "autenticação persitente... tonmar real a tenticaçaço persitnte" — line ~1460, ~1463 — Tornar REAL a autenticação persistente (meta explícita da onda final; "autentica" 22×).
- **rule**: "account creation does not work today" — line ~7349 — Criação de conta REAL no servidor (sqlite compartilhado, POST /api/v1/accounts, 409 taken, verificação, oauth callback) — missão do accounts agent.
- **rule**: "accountclient.ts now parks the session in sessionStorage (not localStorage)" — line ~7438 — Sessão persistente em sessionStorage (cache mirror), estado real no DB (OnboardingState no prisma — ~5318).
- **rule**: "a pessoa ficar puxando as aquisições e tentando exportar o DB... nenhum usuário tem acesso a não ser o que tá cadastrado" — line ~447 — DB inacessível ao visitante: só contas cadastradas leem/exportam.
- **rule**: "dar um banco de dados falso todo fudido e criptografado" — line ~1167 — Estratégia: DB falso criptografado de isca para confundir ataques.
- **rule**: "resolver todos os problemas de segurança... no security and quality" — line ~1401 — Fechar TODOS os alerts do GitHub (code scanning, audit, osv, codeql, dockle, trivy — ~3351).
- **rule**: "Segurança (sem captcha, self-hosted)" — line ~2003 — SEM captcha; segurança self-hosted (25 menções captcha — sempre para proibir).
- **rule**: "a gente não vai usar Supabase, é tudo self hosted" — line ~385 — Zero Supabase; self-hosted com pacotes próprios (32 menções).
- **rule**: "o dono apontou os exemplos Akash: bloquear o browser DevTools for real" — line ~7391 — DevTools guard real (timing trap do debugger), toggle do dono, sem lib disable-devtool (~7497–7516).
- **rule**: "safeurl(candidate) — só http/https; rejeita localhost/loopback/privado" — line ~4931, ~7358 — urlgate: TODA URL de servidor passa por validação SSRF-safe (DNS resolve, bloqueia loopback/privado).
- **rule**: "sandbox server-side... nothing runs or stores in the visitor machine" — line ~7263 — Sandbox server-side com jail (SESSIONPATTERN, contain(), caps de chars/entradas, ~7268–7289).
- **rule**: "prepared statements ONLY (never string concatenation)" — line ~2470 — Queries SEMPRE parametrizadas (better-sqlite3, db.ts).
- **rule**: "Nenhum secret hardcodado, nenhum domínio hardcodado" — line ~3400 — Zero secrets/domínios em código (domínio dev10.pro só no painel — ~3258).
- **rule**: "NUNCA cole tokens/headers/cookies nos MDs" — line ~1731 — Segredo operacional: tokens redacionados, nunca em docs.
- **rule**: "OAuth GitHub + GitLab + Google... bots da Vercel/Netlify" — line ~78, ~93, ~169 — OAuth real configurado; mapear concorrentes (Manus/Grok/Vercel/CF) para superar em segurança.
- NOTA: "sobreviver a delete de cookies" / "incógnito" não aparecem verbatim; o mais próximo é a sessão server-first + sessionStorage/cache-mirror (~7438, ~5353).

## 3. NOMENCLATURA (sem hífens; pontos; nomes diretos; inglês)

- **rule**: "tirando os arquivos de configuração de frameworks que tem que usar ifen... se puder usar ponto em vez de ifem" — line ~388 — Arquivos da casa: PONTO no lugar de hífen (clean.url.ts); configs de framework mantêm o hífen delas.
- **rule**: "our own filenames use DOTS, never hyphens (framework config files keep theirs)" — line ~2517, ~2437 — Confirmado nas delegações (27 menções "hífen").
- **rule**: "TUDO EM MINÚSCULO (padrão do repo: queuestudiorender, familyurl, derivebase — sem camelCase)" — line ~5085 — Identificadores tudo minúsculo sem camelCase.
- **rule**: "define um nome legal e curto" / "o nome dos JS, dos CSS... tem que ser nome curto" — line ~353, ~1106 — Nomes CURTOS e diretos para arquivos.
- **rule**: "eu falei pra renomear de components pra widgets" — line ~1342, ~6810 — Pasta de componentes do tema chama WIDGETS (Sol/components → Sol/widgets).
- **rule**: "no hyphen and no underscore anywhere, one english word per widget name" — line ~6681 — Um substantivo inglês por widget; stutter rule (nome repete página → sai o redundante, ~6707).
- **rule**: "em vez de ser DevTeam, DevTeam... o nome da seção" — line ~4241 — Abas/seções com a identidade REAL de cada app (não repetir "DevThink"); cada app tem rota definida e rótulo pelo nome real (~4281).
- **rule**: "os três clones deployáveis ganham NOME PRÓPRIO, curto... Vault (armazenamento), Forge, Foundry" — line ~2309, ~2328 — Nomes próprios: Vault, Forge, Foundry, Getry (Gettryy com 2 y era o bypass Next — ~2259).
- **rule**: "everything you write is in English; no emoji" — line ~2473, ~2656 — TUDO em inglês (código, comentários JSDoc, copy) — 113 menções "inglês".
- **rule**: "a marca em apresentação é DevThink (D e T maiúsculos)" — line ~4110 — Caso correto da marca "DevThink".
- **rule**: "página = pasta = aplicativo; cada página é uma pasta com um sub-âncora" — line ~2048 — A sintaxe inteligente: o NOME é o path, nada hardcodado (~3610).
- **rule**: "package.10.json — o catálogo universal (2.3MB)" — line ~430, ~4479 — O catálogo de pacotes/engines universal se chama package.10.json (mil deps/devdeps ~430).

## 4. DADOS/DB (info no DB, labels, sem storage do browser)

- **rule**: "esses png icon e etc do devthink... têm que estar hardcodados no db somente esses .ico .png favicon" — line ~667 — Ícones .ico/.png/favicon são os ÚNICOS binários permitidos e vivem hardcoded no DB (~3973).
- **rule**: "components carry NO hardcoded information/data — the tabular content comes from the DB layer" — line ~2499, ~2557, ~2570 — NENHUM dado hardcoded em componente; tabelas/listas vêm do DB (117 menções "hardcod").
- **rule**: "zero hardcoded text inside widgets — every interface string lives in the database of the own application" — line ~6911, ~6939, ~7001 — COPY LAW: toda string de UI vem do DB do app (labels.ts manifest + label() accessor + labels table — ~6916).
- **rule**: "catalogRows(kind, seeds)... seed.catalog.ts" — line ~2742 — Padrão catalog: dados via catalog.ts + seed.catalog.ts com accessor tipado.
- **rule**: "Replace any localStorage-only flag with the accessor (localStorage = cache mirror only)" — line ~5353 — Estado (intro/onboarding seen) catalogado no DB/prisma; localStorage só espelho.
- **rule**: "prisma/schema.prisma dentro do tema (Sol/schema.prisma); drizzle.config.ts idem" — line ~2664 — Prisma absorvido como schema.prisma no tema; drizzle junto.
- **rule**: "storage standard, chunks sha-256" — line ~6596 — Armazenamento por chunks com sha-256; quota 2GB (2147483648) com piso generoso 900MB (~7149, ~7333).
- **rule**: "THE INTERFACE NEVER TOUCHES THE VISITOR MACHINE: no IndexedDB, no localForage, no localStorage writes" — line ~2551, ~2566 — Interface não escreve na máquina do visitante (evolução: db.ts local como cache da app, não storage do usuário).
- **rule**: "Zero dado falso, zero demo, zero setTimeout/setInterval de teatro" — line ~6303, ~6555 — ZERO dados fake/demo/timers teatrais; empty states honestos (mock 10×, fake 36×).
- **rule**: "os builds ficam gravados no próprio DB de cada site; os backups sobem para os sites" — line ~2287 — Builds gravados no DB do site; backups vão aos clones (vault guarda os DBs — ~2328).
- **rule**: "e eu te ensino a técnica do DB... tem que fazer uma técnica de DB" — line ~698 — Técnica de DB ensinada/repetida (a camada de dados é o coração).

## 5. ENGINES (saddle sandbox, containers, vault storage, runner)

- **rule**: "lógicas em TS. Pelo amor de Deus, lógicas em TS" — line ~378 — Engines/lógicas em TypeScript puro na RAIZ do app (multi-modo node+browser, zero DOM — ~2482, ~4492).
- **rule**: "No sistema, você vai fazer ele infinito... memória infinita" — line ~1151 — Sandbox/memória infinita: virtual + armazenamento (sandbox é a "memória de armazenamento" — ~438).
- **rule**: "os TIPOS de sandbox — são MAIS DE 10 (completa virtual com driver/CPU/GPU/memória...)" — line ~2283 — +10 modalidades de sandbox (virtual completa, VFS, Docker — modalidade sandbox VFS + Docker no hashtag oficial ~435).
- **rule**: "sandbox.spec.ts — base max/balanced/lite, SO, arch, vCPU/vGPU" — line ~4545 — Spec declarativa de sandbox: sabores max/balanced/lite com recursos por spec.
- **rule**: "MODALITYBINARIES = container-docker, ..." — line ~7279 — Relatório honesto de modalidades por binário do host (sem fingir processo).
- **rule**: "saddle é o complete virtualized sandbox engine (the full sandbox modalities)" — line ~2555 — Saddle = engine de sandbox completa, exportada como biblioteca (ENGINES ARE LIBRARIES).
- **rule**: "vault = clone de armazenamento (estilo Supabase, só guarda)... forge = runner... foundry = sandbox" — line ~5144, ~2260, ~4562 — Papéis: Vault=storage (guarda DBs/backups), Forge=runner floor, Foundry=sandbox/pipeline.
- **rule**: "runnerBinaries... call-of-duty (kind game, formats...)" — line ~2760 — Runner roda binários de concorrentes (jogos/executáveis) na plataforma.
- **rule**: "o OS não duplica lógica que já existe nos apps — importa dos pacotes publicados (pro.devthink.*)" — line ~4868, ~4875 — Engines consumidas via npm entre apps; AUDIT-DUP mata clones (~4862).
- **rule**: "as 60 ENGINES do catálogo... MAIS DE 100 no total" — line ~2125, ~2284 — Catálogo de engines: 60 do pipeline + runtimes do package.10.
- **rule**: "~300 lógicas correlatas POR ARQUIVO de campanha" — line ~5122 — Campanha de lógicas: extrair ~300 lógicas correlatas por tema dos concorrentes (repositories.md, 988 repos).
- **rule**: "o JSON precisa de uma LLM, de um link de API" (Jev = JSON) — line ~4884 — json.engine: LLM via API devolve JSON decidido (json.decision/parse/engine + policy/schema).
- **rule**: "visualize — de PIXELS a MESH (TS puro, zero dependência)" — line ~4484 — Biblioteca visualize (cadria): pixels→mesh OBJ/STL, normais, cores por vértice.
- **rule**: "cadria (vídeo/imagem — versawase), debonair (áudio — katexis/catesis), argan (dns/gateway), getry (gateway/models)" — line ~4584–4591, ~2568 — Engines por app: versawase (vídeo), katexis (música), catesis (debonair), dns (argan), meta-modelo getry.
- **rule**: "biblioteca universal sem hardcode: qualquer pessoa pode construir" — line ~2116 — Tudo construído de forma que qualquer pessoa possa replicar (sem hardcode).
- **rule**: "verifica se as lógicas não estão clonadas... dedupe-and-regroup por famílias" — line ~4862, ~7403 — Regroup: merge de módulos correlatos em famílias (authfamily, gatewayfamily, storagefamily, queuefamily) sem shims.

## 6. DISTRIBUIÇÃO (npmjs, pacotes, containers, releases, workflows verdes)

- **rule**: "A NOVA VERSÃO DO SADDLE NAO TA SNDO PUBLIACO IGUAL OS OUTROS NO NPMJS" — line ~1472 — TODOS os apps publicam no npmjs (@wenathlan/saddle etc.) sincronamente; saddle 2.1.6 travado (~1487).
- **rule**: "cada aplicativo publica o próprio pacote no npm e suas distribuições" — line ~2085 — Cada app = pacote próprio + distribuições próprias (npm, ghcr, maven, nuget, rubygems — ~3388).
- **rule**: "falei pra deletar esses pacotes... pro.devthink.stealhead Private" — line ~636 — Deletar pacotes privados errados (pro.devthink.*) e publicar direito.
- **rule**: "417 workflows de todas as versões anteriores... resolva os problemas dos workflows" — line ~858, ~1351 — Workflows têm que ficar VERDES (quebrou release approve — consertar; 229 menções workflow).
- **rule**: "workflows são feitos em YML e o armazenamento usa [a stack própria]" — line ~2114 — Stack única: workflows YML + armazenamento próprio.
- **rule**: "NENHUM hash sha256/sha40 hardcodado (ações por tag de versão)" — line ~2374, ~3398 — Actions por tag @vX.Y.Z, nunca SHA; workflowupdates.mjs valida drift.
- **rule**: "UMA tag (v2.0.x), UMA release, TODOS os assets da família na mesma release (~200 assets, imutável)" — line ~3387, ~3540 — Release única da família com todos os assets.
- **rule**: "tar.xz no nível máximo do xz + overlay brotli" — line ~2397, ~1999 — Compressão máxima: tar.xz -9 + brotli nos assets/4 formatos Next.
- **rule**: "containers: .deb .rpm .AppImage .exe .dmg (win/mac/linux, arm64)" — line ~228–252 — Distribuição em containers/instaladores para todos os SOs.
- **rule**: "o GitHub Pages não tá funcionando porque o workflow não tá pegando o index dentro de sol" — line ~509 — Pages workflow deve apontar o index do tema certo (publish "." build na raiz — ~3188–3195).
- **rule**: "deploy na Vercel... netlify.toml publish = '.'... vercel.json outputDirectory '.'" — line ~479, ~3191 — Deploy universal: vercel+netlify+pages+wrangler+capacitor+tauri, publish na raiz.
- **rule**: "as quatro formas Next existem SÓ como assets do release" — line ~2397 — Templates Next (normal/zai/fifty/personalized) só como assets de release, nunca na árvore.
- **rule**: "ordem de uso: personalized primeiro, depois zai, depois fifty, depois normal" — line ~2398 — Ordem canônica dos formatos Next.
- **rule**: "sem dist, sem public, sem ui... apenas as pastas Sol, docs e tests" — line ~506, ~527 — Árvore de app: SÓ Sol/ + docs/ + tests/ (nada de dist/public/assets/ui na fonte).
- **rule**: "continue fazendo as releases até terminar os objetivos" — line ~441, ~1443 — Continuar releases/mudanças em lote: melhor 100–400 alterações de uma vez que ping-pong.

## 7. FEATURES POR APLICATIVO (vídeo real, sync, chat, etc.)

- **rule**: "subapp de CHAT de qualidade Grok/ChatGPT" — line ~3797 — Chat completo: sidebar rail 260px, composer 2 camadas, turns assimétricos, welcome, session.panel, mascote solbot (242 menções chat).
- **rule**: "a questão da Gateway é cadastro opt-in" — line ~4029 — Gateway no chat = registro OPT-IN (estado desconectado visível; sem base salva, o send avisa e não quebra).
- **rule**: "video (engine versawase), music (katexis)... queuebinarylaunch/queuestudiorender" — line ~2759–2768 — Estúdios nativos: video/music/image/games com fila REAL via runner (sem render local).
- **rule**: "o app de VÍDEO é O estúdio — edita, reproduz, modifica" — line ~6050 — Rótulo honesto: video = estúdio completo (vídeo real, 61 menções "vídeo").
- **rule**: "primeiro faz o sincronização com o remoto" — line ~1228 — SYNC in/out com o remoto antes de trabalhar (39 menções sync).
- **rule**: "calculadora, imagem, usage, gatewayview reconstruídos do zero em Windows 11" — line ~6286–6413 — Subapps nativos rebuild com lógica real na raiz e zero demo.
- **rule**: "MCP registry + custom providers (tudo opt-in, default false)" — line ~4929 — Todo app com automação + MCP prontos p/ qualquer LLM controlar; opt-in.
- **rule**: "cada aplicativo tem uma pasta de teste" — line ~557 — Cada app tem SUA pasta tests/ (não sobrecarregar a do devthink).
- **rule**: "cobaia — o site de monetização (AdSense, Sponsors, Ko-fi, pricing, legal)" — line ~5214–5231 — App cobaia carrega anúncios/monetização honesta (sem tráfego inválido/bot).
- **rule**: "My Files: a real explorer grammar (breadcrumb, side tree, carets)" — line ~7379 — My Files = explorer real; console = terminal real; settings com rail e indicador móvel.
- **rule**: "o sandbox pane do chat para de fingir: server answer renders its rows" — line ~7298 — Painel sandbox do chat conecta no servidor real (sandboxclient.ts; fallback honesto offline).
- **rule**: "chat streaming SSE com parser resiliente, retry backoff, compactação, token estimate, fila" — line ~4504–4508 — Lógicas de chat: stream.parse, retry.backoff, conversation.compact, token.estimate, request.queue.
- **rule**: "intro → onboarding → app... 3-4 passos frame a frame" — line ~5165 — Onboarding em 3–4 passos em TODOS os apps (intro Akash spring, exit slide-up 0.8s).
- **rule**: "extensão MV3 multi-dialeto (firefox/safari/vsix overlays)" — line ~5995 — Extensão de navegador com manifest único multi-dialeto.
- **rule**: "mobile android/ios e desktop lanes nativas universais" — line ~3279, ~3392 — Lanes family-mobile/family-desktop para APKs/binários de todos os apps.

## 8. PROCESSO (subagentes, ondas, leitura sed, chunks, CJS no organizado, testes TS, commits)

- **rule**: "36 subagentes por concorrência fazendo tarefas com contexto agrupado e correlato" — line ~572 — Subagentes em massa com contexto AGRUPADO E CORRELATO (401 menções subagent).
- **rule**: "3 subagentes por chamada paralela... quando terminar um já lança o outro" — line ~649 — Lançar de 3 em 3 em paralelo, relançando conforme termina (~1336: 2 por mandato).
- **rule**: "leia em segmentos com o bash usando o sed de linha x, y, z em pedaços" — line ~581, ~682, ~717 — LEI DE LEITURA: arquivos grandes SÓ via bash sed em segmentos (194 menções sed; nunca cat/Read inteiro — ~2244, ~5245).
- **rule**: "setenta, oitenta chamadas de seed via bash em segmentos de X a Y" — line ~1049 — Até 70–80 chamadas sed para documentos gigantes (cobertura total em pedaços).
- **rule**: "gaste menos tokens... só 15 milhões disponíveis" — line ~218, ~311 — Economia de tokens: leitura segmentada + dedup.
- **rule**: "usa o script CJS... analisa esses scripts DT, DL" — line ~196, ~203 — Automação de navegador via scripts CJS (dt-tela/dt-clique/dt-lib/dt-netlib; CJS no organizado — ~1323; 93 menções cjs).
- **rule**: "escrita de fonte (.ts/.tsx/.css) via bash é BLOQUEADA (hook Mimosa) — use Read/Write/Edit" — line ~2377, ~2652 — Nunca escrever fonte via bash; Edit/Write cirúrgico (regra de máquina da casa).
- **rule**: "testes: convenção VITEST — NUNCA node:test" — line ~4917, ~5092 — Testes TS only em vitest (69 menções; node:test proibido no devthink/cadria).
- **rule**: "gates: biome lint zero erros... tsc --noEmit zero erros" — line ~4918, ~6305 — Gates locais antes de terminar: biome 0 + tsc 0 (+ zindex/design tests).
- **rule**: "NÃO commite... o orquestrador cuida do release" — line ~3405, ~2474 — Commit/push só pelo orquestrador (mas ~998/1058: "dá o commit pra salvar" quando pede); git pull --rebase antes de push (~5334).
- **rule**: "manda mensagem de progresso a cada bloco concluído" — line ~2248, ~2357 — Protocolo: mensagens de progresso por bloco; relatório final em português autocontido.
- **rule**: "desduplicar as informações... agrupamento de lógicas correlatas em um arquivo" — line ~1463, ~2086 — Desduplicar e agrupar por conceito (docs e código).
- **rule**: "não é determinação, é determinação determinística... se encontrar jeito melhor, siga" — line ~292 — Execução determinística com liberdade para melhorar caminho.
- **rule**: "o dono reprovou pela terceira/quarta vez e mandou abandonar do zero" — line ~4150, ~4371 — Ondas (waves) de reformulação com escopos EXCLUSIVOS por agente (20 menções waves; 400+ waves/~300 steps por wave — ~6595).
- **rule**: "LEIA ANTES DE ESCREVER; re-leia a região antes de CADA Edit" — line ~4660, ~4734 — Ler antes de escrever; re-ler antes de editar.
- **rule**: "zero perda de features" — line ~3811, ~2497, ~5171 — ZERO perda de funcionalidade em qualquer refator/redesign.
- **rule**: "primero faz o fetch porque teve muitos commits na frente" — line ~1064, ~1129 — Fetch/reclone antes de mexer (repo muda rápido).
- **rule**: "continuar até ter o trabalho completo, sem desvios e sem imperfeições" — line ~3504, ~563 — Continuar até o fim sem desvios.
- **rule**: "melhor fazer cem, duzentas, quatrocentas alterações" — line ~1443 — Lotes grandes de alterações de uma vez (não migalhas).

## 9. INFRAESTRUTURA (sem GPU/CPU/storage do usuário, mimetypes, HTTPS, deploy universal)

- **rule**: "não vai tocar no computador da pessoa, não vai tocar no armazenamento... nem na VGPU, na VCPU" — line ~407, ~413, ~2572 — NÃO usar hardware do visitante: nada de GPU/CPU/câmera/geolocalização/compilação local (stealhead pré-compilado — ~2553).
- **rule**: "protocolos https e mime types... APIs internas com https" — line ~1144 — APIs internas por HTTPS com mimetypes corretos.
- **rule**: "eu prefiro que a gente use pacotes nativos do Node" — line ~416 — Pacotes nativos do Node (sem runtimes exóticos).
- **rule**: "NUNCA instale nada dentro do repositório... node_modules global C:\Users\nathalan\node_modules" — line ~2376, ~661, ~6458 — Proibido node_modules no repo; execução via NODE_PATH global (junction mklink quando preciso — ~3810).
- **rule**: "self hosted com pacotes próprios (better-sqlite3, @libsql/client, mysql2)" — line ~385, ~2428 — Stack self-hosted: sqlite/libsql/mysql2 + prisma/drizzle.
- **rule**: "build com hash DIRETO na raiz (vite outDir '.', emptyOutDir false, assetsDir '')" — line ~3188 — Build na raiz com bundles hash, sem pastas dist/public/assets.
- **rule**: "UM CSS dentro do tema... Nada de arquivo .css novo" — line ~2098, ~2655 — UM stylesheet por tema (sol.css; exceção posterior: css local de subapp — ~6296).
- **rule**: "NENHUMA pasta assets/ — quebra o template... só Sol + docs + tests" — line ~3958–3968 — Sem pasta assets; binários só .ico/.png de favicon (exceção documentada ~3973).
- **rule**: "arquivos web 2026: robots.txt, keywords.txt, sitemap.xml, manifest.json+webmanifest" — line ~3201 — Cada app com web files completos, SEM domínio hardcoded (relativos — ~3253).
- **rule**: "só um de cada vez... você tá abrindo trinta abas e não tá percebendo" — line ~902, ~172 — Foco sequencial; não abrir dezenas de abas à toa.
- **rule**: "o navegador é o Brave REAL do usuário via CDP 9222... NUNCA mate brave.exe" — line ~1895, ~1549 — Automação no navegador REAL logado do dono (Brave CDP), com regras de segurança rígidas (nunca deletar/submeter).
- **rule**: "o documento é a união de todas as regras... sincronizado entre organizado e repo" — line ~2295 — Docs sincronizados entre allan/organizado e o repo (#ofical como documento oficial).

## 10. QUEIXAS CONTRA O ASSISTENTE ANTERIOR (o que o dono diz que está quebrado/feio/falso/mockado)

- **rule**: "esse design ainda tá horrível, você não pegou a paleta do Windows" — line ~685 — Design reprovado repetidamente (4+ reprovações formais: ~3858, ~3921, ~4150, ~4371).
- **rule**: "Esse design aí da tela de login tá horrível... a navegação tá aparecendo na tela de lock" — line ~941, ~944 — Login feio com navbar indevida; página Explorer feia p/ remover.
- **rule**: "Me tira esse efeito horrível. E o texto se desfazendo" — line ~3866 — Efeitos de texto dissolvendo (proibidos).
- **rule**: "essa top bar aí está horrível... design de pílula... essas bordas brancas" — line ~4219–4223 — Topbar/pílulas/bordas brancas reprovadas.
- **rule**: "não era pra ter essa grade" (apps em grade) — line ~4185 — Grade de cards em vez de desktop com ícones.
- **rule**: "o dono REJEITOU os ícones atuais (glifos lucide chapados)" — line ~4161 — Ícones chapados/lucide rejeitados.
- **rule**: "design pastelão... INACEITÁVEL" (GitHub Pages landing) — line ~3434, ~3462 — Landing do Pages "pastelão".
- **rule**: "você não tá sabendo manipular meu navegador... tem que ler suas skills de computer use" — line ~7, ~10 — Assistente não sabia operar o navegador (não leu skills).
- **rule**: "você tá prestando atenção nas regras que eu tô dizendo ou tá apenas ignorando?" — line ~1339 — Ordem ignorada repetidamente; tinha que ler o arquivo de regras primeiro (~276, ~391).
- **rule**: "você tá sendo muito direto, tá cortando as informações e tá inventando" — line ~273 — Corta informação e inventa conteúdo.
- **rule**: "eu já falei pra você não citar nenhuma citações dos arquivos" — line ~267, ~270 — Citações de fontes nos docs (proibido; "fonte de verdade" proibida — ~2254).
- **rule**: "quando você colocar os componentes, você tem que pular as linhas" — line ~261 — Documentação emparedada, sem espaçamento.
- **rule**: "esses novos scripts estão pesados... o framer não tá abrindo" — line ~264 — Scripts pesados travando o navegador.
- **rule**: "você tá colocando subpasta dentro de pasta, dentro de pasta" — line ~729, ~688 — Subpastas proibidas persistindo após ordem.
- **rule**: "você tá escrevendo o CSS de forma totalmente estranha... sol.css" — line ~1453 — CSS fora do padrão/propriedades subutilizadas.
- **rule**: "você tá colocando scripts do lado de fora" — line ~356 — Scripts soltos fora do lugar certo.
- **rule**: "você COMEU partes do unificado... o documento está todo bugado" — line ~2335, ~2272 — Rewrites que "comem" conteúdo; doc desincronizado.
- **rule**: "você quebrou os workflows... o Release approve... 417 workflows" — line ~846–858 — Workflows quebrados pelo assistente (lanes vermelhas no publish — ~3481–3486).
- **rule**: "acho que as lojas estão todas bugadas" — line ~869 — Lojas/stores bugadas na época.
- **rule**: "ta dando tela preta... a página ta dando em branco" — line ~929, ~676 — Telas pretas/em branco no Pages (routerBase/assets 404 — ~935, ~953, ~980: URL residual w/l_.../chat).
- **rule**: "a página do saddle não tá carregando" — line ~3942 — Saddle não carrega no Pages (base path/assets).
- **rule**: "ainda tá renegado em português + laranja" (notfound live) — line ~3984 — 404 em PT com laranja no live (idioma/cor errados).
- **rule**: "DRAG de ícones quebrado... redirecionamentos mortos (launchdeck)" — line ~6047 — Drag do desktop e links mortos.
- **rule**: "commit e9612122 (UUID) varredura automatizada homogeneizou o design" — line ~6564 — Sweep automatizado regrediu o design (arqueologia pedida).
- **rule**: "account creation does not work today" — line ~7349 — Criação de conta não funciona (auth falsa/mockada até então).
- **rule**: "o sandbox pane do chat para de fingir" — line ~7298 — Sandbox do chat era fingida (mock) — tinha que virar server real.
- **rule**: "você tá fazendo tudo errado... Biome... escrita... estrutura" — line ~444, ~1158 — Erros sistemáticos: Biome, escrita, estrutura.
- **rule**: "você não olhou todas as páginas... não clicou em todos os botões" — line ~215 — Mapeamentos incompletos de dashboards.
- **rule**: "abrir trinta abas e não tá percebendo" — line ~172 — Abas em excesso sem noção de estado.

## Síntese de prioridade (pela repetição)

1. Design Windows 11 + trylle com valores exatos (414+165 menções) — reprovado 4+ vezes; login/lock Windows sem navbar; apps como janelas; ícones animados premium sem lucide.
2. Sem dados fake/mock/hardcode: tudo no DB (labels/catalog/seeds); dados falsos = infração grave.
3. Autenticação persistente REAL + contas reais server-side (foco das últimas ondas).
4. Flat tree: pasta=página=app=âncora; widgets; pontos não hífens; minúsculo; inglês; zero subpasta/assets.
5. Sandbox server-side real (saddle engine, +10 modalidades) e storage via vault; nada roda/arma na máquina do visitante.
6. Publicação npmjs de todos os apps + workflows verdes consolidados (ci/verify/release/publish/pages/maintenance/security/mobile/desktop/lint).
7. Processo: subagentes 3-a-3/36 concorrência, leitura só via sed em segmentos, vitest TS only, biome/tsc gates, commit só do orquestrador, zero perda de features.
