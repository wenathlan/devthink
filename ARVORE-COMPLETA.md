# REGRAS GERAIS (valem para qualquer projeto)

Regras gerais, minimalistas e diretas. O que for específico deste projeto aparece como Exemplo — são apenas exemplos, não significa que é exatamente isso.

### Aplicativos — regras

| Regras |
|--------|
| 1. devthink — OS e superplataforma. Objetivo: ser o sistema operacional e a plataforma que engloba tudo. Contexto: é o OS (absorve devthinkos, cli-desktop, SoFlowX, akash, extension, gateway e maene; embute owni) e o app principal (navegador chama-se DevThink, 35 páginas nativas no tema, news como página). Não cria lógica de vídeo, imagem, 3D ou áudio: importa da biblioteca publicada (saddle, argan, katexis, versawase). Todo app sai publicado em todos os registros (npm, GH-npm, GHCR, NuGet, Maven) e roda a mesma interface em tudo (CLI = web = TV). |
| 2. saddle — sandbox e runner de VM. Objetivo: ser só virtualização: sandbox completa e runner de qualquer sandbox do mercado. Contexto: sem browser, sem gateway, sem features de OS (absorve e2ugh). 3 bases (max, balanced, lite); SOs (android, grapheneos, linux, omarchy, windows e distros); archs (arm64, amd64 e outras); vGPU e vCPU próprias. 3 formas: runtime por pacotes Node, full por container Docker, publicada nos registros. Gerencia o hardware virtual que os domínios usam. |
| 3. debonair — áudio e DAW. Objetivo: criação de áudio e música. Contexto: app isolado com nome de marketing; abriga a engine katexis na raiz; importa gateway, IA e workflow do devthink e versawase do cadria quando precisa de imagem. |
| 4. cadria — vídeo e imagem. Objetivo: player, editor e estúdio de vídeo e imagem. Contexto: absorve iukka (player) e create (editor); abriga a engine versawase na raiz; importa katexis do debonair e gateway, IA e workflow do devthink. |
| 5. stealhead — jogo FPS. Objetivo: jogo de tiro em primeira pessoa. Contexto: importa versawase do cadria e áudio do debonair via biblioteca, sem arquivo próprio de engine; lógicas só do jogo (partida, ranking, armas, mundo). |
| 6. argan — DNS e gateway. Objetivo: DNS, zonas, registros, dnssec e handshake. Contexto: biblioteca de rede do sistema; importa gateway e IA do devthink quando precisa; cada site usa o mesmo DB unificado. |

### Estrutura de pastas — regras

| Regras |
|--------|
| 1. Raiz só com pastas de app/modo + docs/ + tests/ + forges + arquivos soltos. Exemplo: devthink/, docs/, tests/, .github/. |
| 2. Flat: sem src/, sem pasta dentro de pasta, sem globais por categoria. Exemplo: sem lib/, hooks/, components/. |
| 3. Pasta = página = app, com tudo dela dentro; página config é app config. |
| 4. Cada app tem docs/ e tests/ próprios; referencia, não copia. |
| 5. Um manifesto por linguagem na raiz, versão em lockstep, um lock só. Exemplo: package.json + bun.lock. |
| 6. Forjas espelho repetem o .github. Exemplo: .gitlab, .forgejo. |
| 7. .github/ na raiz, workflows auto-contidos, um por responsabilidade. Exemplo: matrix cobre todos os apps. |
| 8. Scripts auxiliares em tests/ (não-JS em tests/scripts/). Exemplo: task.mjs. |
| 9. Nada se apaga: duplicado guarda com sufixo. Exemplo: (2)(3). |
| 10. Site já é sandbox; conta = sandbox. Exemplo: ~50GB por plano. |

### Lógicas e código — regras

| Regras |
|--------|
| 1. Lógicas .ts na raiz; interface só no tema. |
| 2. Interface puxa da raiz/biblioteca; raiz nunca puxa de interface; interface nunca puxa de outra. |
| 3. Correlatas juntas em blocos hierárquicos; 1 arquivo = 1 responsabilidade. Exemplo: até 300 por arquivo. |
| 4. TypeScript primeiro; nativo do runtime antes de pacote externo; app nasce biblioteca multi-modo. Exemplo: node:*; ~30 modos. |
| 5. Zero JS na interface: só TS/TSX/css/html, .ts explícito, sem enum/namespace. Exemplo: index.css + index.html. |
| 6. Sem main: App.tsx self-mount com roteamento embutido. Exemplo: temas + 404. |
| 7. Nada hardcodado: env/DB/porta; host/porta sorteados e travados, nunca localhost. Exemplo: tema vem do DB. |
| 8. Minúsculas sem _/-, inglês no código, JSDoc em inglês, sem emoji, com try/catch rastreável. |
| 9. Só a lógica de entrada migra do tema para a raiz. Exemplo: gateway.ts. |
| 10. TS de ponta a ponta: escreve, testa e publica TypeScript; JS só como emit no publish. Exemplo: sem enum/namespace, Bun executa direto. |

### Tema, páginas e onboarding — regras

| Regras |
|--------|
| 1. O tema é a pasta; sem pasta "default". Exemplo: Sol/. |
| 2. N temas = N pastas completas (entrada + deploys + páginas). Exemplo: index.html, App.tsx, vercel.json, netlify.toml, capacitor.config.ts. |
| 3. <Pagina>/ só design. Exemplo: .tsx/.styles.ts/.types.ts/.test.tsx. |
| 4. Onboarding frame a frame adaptado por app; login pulável via OS. Exemplo: logo → login → entrada → nav. |
| 5. Um design só; só muda responsividade. Exemplo: portrait = celular, landscape = TV/desktop. |
| 6. Wrappers só empacotam. Exemplo: ios/, android/. |
| 7. Sem public/assets/dist no repo; compila na raiz do dono. Exemplo: só icon/favicon. |
| 8. Texto cabe na caixa, grid fixo, 44px de toque, sem poeira visual. |
| 9. CLI é a mesma interface TSX renderizada no terminal; sem fonte por linguagem. Exemplo: binário Bun no build. |

### Nomes — regras

| Regras |
|--------|
| 1. Raiz real do vocabulário técnico, deformada de leve. Exemplo: dissolve, dolly, raccord. |
| 2. Base em inglês, sonoridade primeiro; nunca repetir terminações. |
| 3. Amplo sem ser genérico; sem óbvios. Exemplo: player + editor no mesmo app. |
| 4. Validar na frase e em domínio/marca/lojas. Exemplo: "bota no ___". |
| 5. Só nomes oficiais; sem inventar app. |

### Fusão — regras

| Regras |
|--------|
| 1. Tudo para dentro sem duplicar; dois iguais viram um, nada se perde. Exemplo: App.tsx + App.tsx = um. |
| 2. Fundido vira página/comando/lógica do hospedeiro, metadados convertidos. Exemplo: clones viram páginas do OS. |
| 3. Sinônimos num conceito único; absorvida soma, não exclui. Exemplo: chat = agente. |
| 4. Equivalentes mesclam sem perda; vence o mais recente. |

### Engines e biblioteca — regras

| Regras |
|--------|
| 1. Engine mora num app; demais importam da biblioteca publicada, sem arquivo próprio. Exemplo: versawase no cadria, katexis no debonair. |
| 2. Biblioteca universal para qualquer projeto; usuário só configura. Exemplo: baseURL/modelos/keys. |
| 3. Conta = sandbox isolada; cada usuário a sua. |
| 4. Nativo simples vive como .ts comum na raiz, sem engine externa. Exemplo: notes.ts. |

### Build, deploy e release — regras

| Regras |
|--------|
| 1. Build/teste/hash só nas máquinas do CI. Exemplo: GitHub → assets do release. |
| 2. Release por bump gera tag + publishes. Exemplo: source.zip, SHA256SUMS, APK/IPA. |
| 3. Mesma árvore em todo deploy, estático sem Functions. Exemplo: Vercel, Netlify, Pages, Capacitor, ISO; rewrites + 404. |
| 4. Cada app com site + subdomínio próprios. Exemplo: saddle.devthink.pro. |
| 5. Dockerfile único multi-arch, pins por tag. Exemplo: amd64/arm64. |
| 6. Sem lock-in de plataforma; trocar livre. Exemplo: Prisma, Drizzle, MySQL2, Socket. |
| 7. Todo app publica em todos os registros. Exemplo: npm, GH-npm, GHCR, NuGet, Maven. |

### Git e CI — regras

| Regras |
|--------|
| 1. Commits e tags padronizados e imutáveis; órfã deleta. Exemplo: user fixo + noreply. |
| 2. Branch principal protegida, sem force; só main. Exemplo: checks + review. |
| 3. npm ci, nunca install; token por ambiente. Exemplo: NPM_TOKEN, GITHUB_TOKEN. |
| 4. Pré-push leve; autoridade nos runners. Exemplo: gates locais, bateria no GitHub. |
| 5. Testes reais em tests/, consumidor pack → install. Exemplo: node:test sem mock. |
| 6. Painéis zerados como critério de pronto. Exemplo: 0/0/0. |
| 7. CHANGELOG por versão (vira release notes); sem README de versão nem docs de release; bump até tudo verde. |
| 8. Verificação via biome + tsc --noEmit nos arquivos de fora; build/teste/hash nos runners. Exemplo: biome check + tsc --noEmit. |

### Infra e dados — regras

| Regras |
|--------|
| 1. Padrão nos domínios (virtual); opt-in local/misto pela IA. Exemplo: Saddle vGPU/vCPU, max/balanced/lite. |
| 2. DB unificado entre sites/apps, nunca commitado. Exemplo: mestre + shard por conta. |
| 3. Sites replicáveis de backup. Exemplo: clones Vercel/Netlify. |
| 4. Self-hosted, sem free-tier limitante. |
| 5. Usuário escolhe tudo; nada rígido. |
| 6. Sandbox em 3 formas: runtime por pacotes, full por container, publicada nos registros. Exemplo: Node, Docker, npm/Maven/NuGet. |

### Execução — regras

| Regras |
|--------|
| 1. Data primeiro: consultar a data e usar o melhor padrão/versão dela em cada etapa. Exemplo: deps no latest. |
| 2. Checklist interna por contexto, máx 10 por grupo; delegar subagentes antes de executar. |
| 3. Inline primeiro, arquivo por último; limpar temporários. Exemplo: node -e; runner some depois. |
| 4. Nunca instalar: usa o instalado ou importa de CDN. Exemplo: esm.sh. |
| 5. Ficar no diretório atual; binários só em test/bin/. |
| 6. Verificar por etapa antes de avançar. |

### Documentação — regras

| Regras |
|--------|
| 1. # por arquivo/pasta com o contexto no app. Exemplo: player.ts # player. |
| 2. Doc de arquitetura é só árvore: 1 arquivo por linha, sem parágrafos. |
| 3. Comentários curtos, diretos, funcionais. |
| 4. Template padrão no topo do documento. |

# TEMPLATE PADRÃO — <nome>/ (vale para todo projeto)

`<nome>` = app em minúsculas. `<Nome>` = inicial maiúscula. `<Tema>` = tema.
`default` = ex-web = qualquer nome de tema (não existe pasta "default"; a pasta tem o nome do tema, ex. `Sol/`). 5 temas = 5 pastas.
`<Pagina>/` = pasta = página = app, só design. Sem nome de projeto aqui.
Lógicas `.ts` soltas na raiz. `.github/` na raiz do repo.
Stack dados: Drizzle ORM + better-sqlite3 (Supabase gerenciado, sem .sql no repo).
Total: 92 soltos na raiz + blocos condicionais (10+6) + 1 web completo por tema.

```
<nome>/
├── Sol/  # <Tema> default = ex-web = qualquer nome de tema (não existe pasta "default"; o tema é a pasta; o tema é o app, cuida do design)
│   ├── index.html  # entrada web
│   ├── App.tsx  # app roteador
│   ├── vite.config.ts  # build web
│   ├── tsconfig.json  # TS (mescla node)
│   ├── vercel.json  # deploy Vercel
│   ├── netlify.toml  # deploy Netlify
│   ├── capacitor.config.ts  # mobile
│   ├── tauri.conf.json  # desktop
│   ├── caddyfile  # servidor Caddy
│   ├── mime.types  # tipos MIME
│   ├── _headers  # cabeçalhos
│   ├── _redirects  # redirecionamentos
│   ├── manifest.json  # manifesto PWA
│   ├── manifest.webmanifest  # manifesto web
│   ├── sitemanifest.json  # mapa do site
│   ├── package.json  # envelope privado
│   ├── pnpm-lock.yaml  # lock pnpm
│   ├── pnpm-workspace.yaml  # workspace pnpm
│   ├── prisma.config.ts  # banco
│   ├── Cargo.toml  # envelope Rust
│   ├── Cargo.lock  # lock Rust
│   ├── drizzle.config.ts  # dados
│   ├── ionic.config.json  # ionic
│   ├── tailwind.config.ts  # estilos
│   ├── tailwind.config.js  # estilos js
│   ├── postcss.config.mjs  # css
│   ├── postcss.config.js  # css
│   ├── deno.json  # deno
│   ├── playwright.config.ts  # e2e
│   ├── vitest.config.ts  # testes
│   ├── biome.json  # lint/format
│   ├── metadata.json  # metadados
│   ├── .prettierignore  # ignora format
│   ├── .prettierrc  # format
│   ├── eslint.config.ts  # eslint
│   ├── commitlint.config.js  # commits
│   ├── companion.mjs  # build companheiro
│   ├── container.mjs  # container build
│   ├── copy-static.mjs  # copia estáticos
│   ├── package-lock.json  # lock
│   ├── vite-env.d.ts  # tipos do vite
│   ├── README.md  # apresentação
│   ├── prisma/schema.prisma  # banco
│   ├── index.css  # estilo do tema
│   ├── styles.css  # estilos
│   ├── popup.css  # estilo do popup
│   ├── design.html  # vitrine
│   ├── popup.html  # popup
│   ├── icon.svg  # ícone
│   ├── icon.png  # ícone
│   ├── icon.ico  # ícone
│   ├── favicon.ico  # favorito
│   ├── favicon.svg  # favorito
│   ├── icon32.png  # ícones
│   ├── icon64.png  # ícones
│   ├── icon128.png  # ícones
│   ├── robots.txt  # robôs
│   ├── sitemap.xml  # mapa
│   ├── humans.txt  # humanos
│   ├── rss.xml  # feed
│   ├── ads.txt  # anúncios
│   ├── keywords.txt  # palavras
│   ├── sw.ts  # service worker
│   ├── db.ts  # banco local
│   ├── api.ts  # api
│   ├── auth.ts  # auth
│   ├── utils.ts  # utilidades
│   ├── server.ts  # servidor
│   ├── schema.prisma  # banco prisma
│   ├── DEPLOYMENT.md  # deploy
│   └── <Pagina>/  # pasta = página = app; por tema, só adiciona a pasta
│       ├── <Pagina>.tsx  # tela
│       ├── <Pagina>.styles.ts  # estilo da tela
│       ├── <Pagina>.types.ts  # tipos da tela
│       └── <Pagina>.test.tsx  # teste da tela
├── docs/  # docs
├── tests/  # testes
├── .dockerignore  # ignora docker
├── .env  # ambiente
├── .env.example  # exemplo de ambiente
├── .env.local  # ambiente local
├── .gitattributes  # atributos git
├── .gitignore  # ignorados
├── .gitkeep  # mantém pasta no git
├── .npmignore  # ignora publish
├── .npmrc  # registry
├── .nvmrc  # node
├── Dockerfile  # container (mescla docker.config+containerfile)
├── <doc>.md  # doc
├── <modulo>.biome.json  # lint do módulo
├── <modulo>.tsconfig.json  # TS do módulo
├── <nome>.code-workspace  # workspace
├── <nome>.csproj  # envelope .NET
├── <nome>.gemspec  # envelope Ruby
├── <Nome>.java  # núcleo Java
├── <Nome>Distribution.cs  # distribuição .NET
├── acceptable-use-policy.md  # uso aceitável
├── ARCHITECTURE.md  # arquitetura
├── authors.md  # autores
├── bug-report.md  # relato de bug
├── bun.lock  # lock Bun
├── CHANGELOG.md  # novidades (vira release notes)
├── cla.md  # CLA
├── CODEOWNERS  # donos
├── code-of-conduct.md  # conduta
├── CONTRIBUTING.md  # como contribuir
├── contributing.md  # contribuição
├── copyright.md  # direitos
├── disclaimer.md  # aviso
├── eula.md  # EULA
├── export-control.md  # exportação
├── governance.md  # governança
├── jsdom.d.ts  # tipos DOM
├── LICENSE  # licença
├── notice.md  # aviso
├── package.json  # envelope privado
├── pom.xml  # envelope JVM
├── privacy-policy.md  # privacidade
├── pull-request-template.md  # modelo de PR
├── README.md  # apresentação
├── SECURITY.md  # segurança
├── settings.xml  # settings Maven
├── support.md  # suporte
├── terms-and-conditions.md  # termos
├── terms-of-use.md  # uso
├── third-party-notices.md  # terceiros
├── trademark-policy.md  # marca
├── biome.json  # lint/format
├── tsconfig.json  # TS (mescla app+backup+build+server)
```

```
SÓ PROJETO SANDBOX/VM (10)
├── boards.json  # placas
├── cores.json  # núcleos
├── gpus.json  # GPUs
├── processors.json  # processadores
├── virtualhardware.json  # hardware virtual
├── gpumonitor.cpp  # monitor GPU
├── virtualhardware.c  # hardware C
├── virtualizationcore.cpp  # núcleo virtual
└── qemubridge.py  # ponte QEMU
```

```
SÓ PROJETO DESKTOP NATIVO (6)
├── build.rs  # build Rust
├── main.rs  # núcleo Rust
├── gen-icons.py  # gera ícones
└── main.js  # núcleo desktop
```

---

# EXEMPLO — C:\allan2\devthink como vai ficar (repositório DevThink)

```
C:\allan2\devthink/
│
├── .github/  # ci do repo
│   ├── dependabot.yml  # deps auto
│   └── workflows/  # fluxos
│       ├── ci.yml  # integração
│       ├── pages.yml  # pages
│       ├── release.yml  # release
│       ├── security.yml  # segurança
│       ├── verify.yml  # verificação
│       ├── maintenance.yml  # manutenção
│       ├── buildextension.yml  # build extensão
│       ├── cachecleanup.yml  # limpa cache
│       ├── codeql.yml  # análise
│       ├── compatibility.yml  # compatibilidade
│       ├── container.yml  # container
│       ├── desktop.yml  # desktop
│       ├── mobile.yml  # mobile
│       ├── publishghcr.yml  # publica GHCR
│       ├── publishgithubnpm.yml  # publica GH npm
│       ├── publishmaven.yml  # publica Maven
│       ├── publishnpmjs.yml  # publica npmjs
│       ├── publishnuget.yml  # publica NuGet
│       ├── publishrubygems.yml  # publica RubyGems
│       ├── securitypolicy.yml  # política
│       ├── targets.yml  # alvos
│       └── workflowlint.yml  # lint de fluxos
│
├── .gitignore  # ignorados do repo
├── package.json  # envelope do repo
│
├── devthink/  # app+OS (DevThink já é o OS: absorve devthinkos/cli-desktop/SoFlowX/akash/extension/gateway/maene; embute owni; news=News/ (página); apps nativos no tema (35 páginas); importa lógicas da biblioteca publicada (saddle/argon/katexis/versawase), nada hardcodado; build nas máquinas do GitHub, artefatos no release; sites+subdomínios ex saddle.devthink.pro; HW: domínios (padrão) / local / misto (IA decide))
│   ├── Sol/  # <Tema> default = ex-web = qualquer nome de tema (não existe pasta "default"; o tema é a pasta; o tema é o app, cuida do design)
│   │   ├── index.html  # entrada web
│   │   ├── App.tsx  # app roteador
│   │   ├── vite.config.ts  # build web
│   │   ├── tsconfig.json  # TS (mescla node)
│   │   ├── vercel.json  # deploy Vercel
│   │   ├── netlify.toml  # deploy Netlify
│   │   ├── capacitor.config.ts  # mobile
│   │   ├── tauri.conf.json  # desktop
│   │   ├── caddyfile  # servidor Caddy
│   │   ├── mime.types  # tipos MIME
│   │   ├── _headers  # cabeçalhos
│   │   ├── _redirects  # redirecionamentos
│   │   ├── manifest.json  # manifesto PWA
│   │   ├── manifest.webmanifest  # manifesto web
│   │   ├── sitemanifest.json  # mapa do site
│   │   ├── package.json  # envelope privado
│   │   ├── pnpm-lock.yaml  # lock pnpm
│   │   ├── pnpm-workspace.yaml  # workspace pnpm
│   │   ├── prisma.config.ts  # banco
│   │   ├── Cargo.toml  # envelope Rust
│   │   ├── Cargo.lock  # lock Rust
│   │   ├── drizzle.config.ts  # dados
│   │   ├── ionic.config.json  # ionic
│   │   ├── tailwind.config.ts  # estilos
│   │   ├── tailwind.config.js  # estilos js
│   │   ├── postcss.config.mjs  # css
│   │   ├── postcss.config.js  # css
│   │   ├── deno.json  # deno
│   │   ├── playwright.config.ts  # e2e
│   │   ├── vitest.config.ts  # testes
│   │   ├── biome.json  # lint/format
│   │   ├── metadata.json  # metadados
│   │   ├── .prettierignore  # ignora format
│   │   ├── .prettierrc  # format
│   │   ├── eslint.config.ts  # eslint
│   │   ├── commitlint.config.js  # commits
│   │   ├── companion.mjs  # build companheiro
│   │   ├── container.mjs  # container build
│   │   ├── copy-static.mjs  # copia estáticos
│   │   ├── package-lock.json  # lock
│   │   ├── vite-env.d.ts  # tipos do vite
│   │   ├── README.md  # apresentação
│   │   ├── prisma/schema.prisma  # banco
│   │   ├── index.css  # estilo do tema
│   │   ├── styles.css  # estilos
│   │   ├── popup.css  # estilo do popup
│   │   ├── design.html  # vitrine
│   │   ├── popup.html  # popup
│   │   ├── icon.svg  # ícone
│   │   ├── icon.png  # ícone
│   │   ├── icon.ico  # ícone
│   │   ├── favicon.ico  # favorito
│   │   ├── favicon.svg  # favorito
│   │   ├── icon32.png  # ícones
│   │   ├── icon64.png  # ícones
│   │   ├── icon128.png  # ícones
│   │   ├── robots.txt  # robôs
│   │   ├── sitemap.xml  # mapa
│   │   ├── humans.txt  # humanos
│   │   ├── rss.xml  # feed
│   │   ├── ads.txt  # anúncios
│   │   ├── keywords.txt  # palavras
│   │   ├── sw.ts  # service worker
│   │   ├── db.ts  # banco local
│   │   ├── api.ts  # api
│   │   ├── auth.ts  # auth
│   │   ├── utils.ts  # utilidades
│   │   ├── server.ts  # servidor
│   │   ├── schema.prisma  # banco prisma
│   │   ├── DEPLOYMENT.md  # deploy
│   │   ├── Onboarding/Onboarding.tsx  # boas-vindas
│   │   ├── Login/Login.tsx  # acesso
│   │   ├── News/News.tsx  # notícias
│   │   ├── Audio/Audio.tsx  # áudio
│   │   ├── Video/Video.tsx  # vídeo
│   │   ├── Image/Image.tsx  # imagem
│   │   ├── Notes/Notes.tsx  # notas
│   │   ├── PhotoEditor/PhotoEditor.tsx  # editor de fotos
│   │   ├── VideoEditor/VideoEditor.tsx  # editor de vídeos
│   │   ├── Browser/Browser.tsx  # navegador
│   │   ├── Terminal/Terminal.tsx  # terminal
│   │   ├── Files/Files.tsx  # arquivos
│   │   ├── Gallery/Gallery.tsx  # galeria
│   │   ├── Connectors/Connectors.tsx  # conectores
│   │   ├── Automations/Automations.tsx  # automações
│   │   ├── Deploy/Deploy.tsx  # deploy
│   │   ├── Security/Security.tsx  # segurança
│   │   ├── Docs/Docs.tsx  # documentos
│   │   ├── Data/Data.tsx  # dados
│   │   ├── Music/Music.tsx  # música
│   │   ├── Camera/Camera.tsx  # câmera
│   │   ├── Recorder/Recorder.tsx  # gravador
│   │   ├── Mail/Mail.tsx  # e-mail
│   │   ├── Calendar/Calendar.tsx  # calendário
│   │   ├── Calculator/Calculator.tsx  # calculadora
│   │   ├── Maps/Maps.tsx  # mapas
│   │   ├── Store/Store.tsx  # loja
│   │   ├── Console/Console.tsx  # console
│   │   ├── Gatewayview/Gatewayview.tsx  # gateway
│   │   ├── Home/Home.tsx  # início
│   │   ├── Notfound/Notfound.tsx  # 404
│   │   ├── Projects/Projects.tsx  # projetos
│   │   ├── Providers/Providers.tsx  # provedores
│   │   ├── Settings/Settings.tsx  # ajustes
│   │   └── Usage/Usage.tsx  # uso
│   ├── docs/  # docs
│   ├── tests/  # testes
│   ├── .dockerignore  # ignora docker
│   ├── .env  # ambiente
│   ├── .env.example  # exemplo de ambiente
│   ├── .env.local  # ambiente local
│   ├── .gitattributes  # atributos git
│   ├── .gitignore  # ignorados
│   ├── .gitkeep  # mantém pasta no git
│   ├── .npmignore  # ignora publish
│   ├── .npmrc  # registry
│   ├── .nvmrc  # node
│   ├── Dockerfile  # container (mescla docker.config+containerfile)
│   ├── ARCHITECTURE.md  # arquitetura
│   ├── CHANGELOG.md  # novidades (vira release notes)
│   ├── CODEOWNERS  # donos
│   ├── CONTRIBUTING.md  # como contribuir
│   ├── LICENSE  # licença
│   ├── README.md  # apresentação
│   ├── SECURITY.md  # segurança
│   ├── code-of-conduct.md  # conduta
│   ├── third-party-notices.md  # terceiros
│   ├── package.json  # envelope Node
│   ├── bun.lock  # lock Bun
│   ├── pom.xml  # envelope JVM
│   ├── settings.xml  # settings Maven
│   ├── devthink.csproj  # envelope .NET
│   ├── devthink.gemspec  # envelope Ruby
│   ├── devthink.java  # núcleo Java
│   ├── ExtensionDistribution.cs  # distribuição .NET
│   ├── biome.json  # lint/format
│   ├── tsconfig.json  # TS (mescla app+backup+build+server)
│   ├── accounts.ts  # contas
│   ├── agent.ts  # agente
│   ├── ansiart.ts  # engine ansi-art embutida (só se preciso)
│   ├── antigravity.ts  # antigravidade
│   ├── apifreeze.ts  # congela API
│   ├── auth.ts  # autenticação
│   ├── automations.ts  # automações/cron do OS
│   ├── background.ts  # fundo
│   ├── backup.ts  # backup da conta
│   ├── bridge.ts  # ponte
│   ├── browser.ts  # navegador DevThink
│   ├── build.ts  # build
│   ├── bun.ts  # bun
│   ├── calculator.ts  # calculadora
│   ├── calendar.ts  # calendário
│   ├── camera.ts  # câmera
│   ├── capture.ts  # captura
│   ├── checksecrets.ts  # checa segredos
│   ├── cjs.ts  # commonjs
│   ├── cli.ts  # CLI
│   ├── commands.ts  # comandos
│   ├── companion.ts  # companheiro
│   ├── compatibility.ts  # compatibilidade
│   ├── config.ts  # config
│   ├── connectors.ts  # conectores/MCP
│   ├── constants.ts  # constantes
│   ├── core.ts  # núcleo
│   ├── crossbrowser.ts  # multinavegador
│   ├── dashdone.ts  # painel pronto
│   ├── data.ts  # dados
│   ├── database.ts  # banco
│   ├── debug.ts  # debug
│   ├── deno.ts  # deno
│   ├── deploy.ts  # deploy de sites
│   ├── devthink.ts  # núcleo DevThink
│   ├── docs.ts  # documentos
│   ├── engine.ts  # motor
│   ├── environments.ts  # ambientes
│   ├── evidence.ts  # provas
│   ├── export.ts  # exportação
│   ├── files.ts  # arquivos/storage
│   ├── fingerprint.ts  # impressão
│   ├── flow.ts  # fluxo
│   ├── gallery.ts  # galeria/biblioteca
│   ├── gateway.ts  # gateway/rotas
│   ├── gates.ts  # portões
│   ├── hardening.ts  # blindagem
│   ├── headless.ts  # sem tela
│   ├── http.ts  # http
│   ├── identity.ts  # identidade
│   ├── ids.ts  # ids
│   ├── index.ts  # entrada
│   ├── llm.ts  # modelos
│   ├── mail.ts  # e-mail
│   ├── maps.ts  # mapas
│   ├── mcp.ts  # MCP
│   ├── memory.ts  # memória
│   ├── models.ts  # modelos
│   ├── modes.ts  # modos
│   ├── music.ts  # música (via katexis do debonair)
│   ├── net.ts  # rede
│   ├── neutral.ts  # neutro
│   ├── node.ts  # node
│   ├── notes.ts  # notas
│   ├── notifications.ts  # notificações
│   ├── oauth.ts  # oauth
│   ├── offscreen.ts  # fora de tela
│   ├── pack.ts  # pacote
│   ├── page.ts  # página
│   ├── pagebridge.ts  # ponte de página
│   ├── perf.ts  # desempenho
│   ├── plan.ts  # plano
│   ├── policy.ts  # política
│   ├── progress.ts  # progresso
│   ├── project.ts  # projeto
│   ├── protocol.ts  # protocolo
│   ├── providers.ts  # provedores
│   ├── quota.ts  # cota
│   ├── recorder.ts  # gravador
│   ├── recovery.ts  # recuperação
│   ├── request.ts  # requisição
│   ├── run.ts  # execução
│   ├── runtime.ts  # runtime
│   ├── search.ts  # busca
│   ├── security.ts  # segurança
│   ├── serve.ts  # serve
│   ├── server.ts  # servidor
│   ├── session.ts  # sessão
│   ├── sharing.ts  # compartilhamento
│   ├── storage.ts  # armazenamento
│   ├── store.ts  # loja de apps
│   ├── streaming.ts  # streaming
│   ├── swarm.ts  # enxame
│   ├── sync.ts  # sincronia
│   ├── terminal.ts  # terminal
│   ├── tools.ts  # ferramentas
│   ├── types.ts  # tipos
│   ├── umd.ts  # umd
│   ├── updates.ts  # atualizações
│   ├── utils.ts  # utilidades
│   ├── version.ts  # versão
│   ├── versionregistry.ts  # registro de versões
│   ├── views.ts  # visões
│   ├── workbenchmemory.ts  # memória da bancada
│   ├── workbenchsession.ts  # sessão da bancada
│   └── workflow.ts  # fluxo de trabalho
│
├── saddle/  # sandbox e runner de VM, só isso (sem browser, sem gateway; absorve e2ugh; 3 bases max/balanced/lite; SOs android/grapheneos/linux/omarchy/windows + distros; archs arm64/amd64/+6; vGPU/vCPU; 3 formas: runtime por pacotes, full por container, publicada nos registros; build nas máquinas do GitHub, artefatos no release; site+subdomínio ex saddle.devthink.pro)
│   ├── Sol/  # <Tema> default = ex-web = qualquer nome de tema (não existe pasta "default"; o tema é a pasta; o tema é o app, cuida do design)
│   │   ├── index.html  # entrada web
│   │   ├── App.tsx  # app roteador
│   │   ├── vite.config.ts  # build web
│   │   ├── tsconfig.json  # TS (mescla node)
│   │   ├── vercel.json  # deploy Vercel
│   │   ├── netlify.toml  # deploy Netlify
│   │   ├── capacitor.config.ts  # mobile
│   │   ├── tauri.conf.json  # desktop
│   │   ├── caddyfile  # servidor Caddy
│   │   ├── mime.types  # tipos MIME
│   │   ├── _headers  # cabeçalhos
│   │   ├── _redirects  # redirecionamentos
│   │   ├── manifest.json  # manifesto PWA
│   │   ├── manifest.webmanifest  # manifesto web
│   │   ├── sitemanifest.json  # mapa do site
│   │   ├── package.json  # envelope privado
│   │   ├── pnpm-lock.yaml  # lock pnpm
│   │   ├── pnpm-workspace.yaml  # workspace pnpm
│   │   ├── prisma.config.ts  # banco
│   │   ├── Cargo.toml  # envelope Rust
│   │   ├── Cargo.lock  # lock Rust
│   │   ├── drizzle.config.ts  # dados
│   │   ├── ionic.config.json  # ionic
│   │   ├── tailwind.config.ts  # estilos
│   │   ├── tailwind.config.js  # estilos js
│   │   ├── postcss.config.mjs  # css
│   │   ├── postcss.config.js  # css
│   │   ├── deno.json  # deno
│   │   ├── playwright.config.ts  # e2e
│   │   ├── vitest.config.ts  # testes
│   │   ├── biome.json  # lint/format
│   │   ├── metadata.json  # metadados
│   │   ├── .prettierignore  # ignora format
│   │   ├── .prettierrc  # format
│   │   ├── eslint.config.ts  # eslint
│   │   ├── commitlint.config.js  # commits
│   │   ├── companion.mjs  # build companheiro
│   │   ├── container.mjs  # container build
│   │   ├── copy-static.mjs  # copia estáticos
│   │   ├── package-lock.json  # lock
│   │   ├── vite-env.d.ts  # tipos do vite
│   │   ├── README.md  # apresentação
│   │   ├── prisma/schema.prisma  # banco
│   │   ├── index.css  # estilo do tema
│   │   ├── styles.css  # estilos
│   │   ├── popup.css  # estilo do popup
│   │   ├── design.html  # vitrine
│   │   ├── popup.html  # popup
│   │   ├── icon.svg  # ícone
│   │   ├── icon.png  # ícone
│   │   ├── icon.ico  # ícone
│   │   ├── favicon.ico  # favorito
│   │   ├── favicon.svg  # favorito
│   │   ├── icon32.png  # ícones
│   │   ├── icon64.png  # ícones
│   │   ├── icon128.png  # ícones
│   │   ├── robots.txt  # robôs
│   │   ├── sitemap.xml  # mapa
│   │   ├── humans.txt  # humanos
│   │   ├── rss.xml  # feed
│   │   ├── ads.txt  # anúncios
│   │   ├── keywords.txt  # palavras
│   │   ├── sw.ts  # service worker
│   │   ├── db.ts  # banco local
│   │   ├── api.ts  # api
│   │   ├── auth.ts  # auth
│   │   ├── utils.ts  # utilidades
│   │   ├── server.ts  # servidor
│   │   ├── schema.prisma  # banco prisma
│   │   ├── DEPLOYMENT.md  # deploy
│   │   ├── Onboarding/Onboarding.tsx  # boas-vindas
│   │   ├── Console/Console.tsx  # console
│   │   ├── Dashboard/Dashboard.tsx  # painel
│   │   ├── Playground/Playground.tsx  # testes
│   │   ├── Architecture/Architecture.tsx  # arquitetura
│   │   ├── Compute/Compute.tsx  # computação
│   │   ├── Docs/Docs.tsx  # documentos
│   │   ├── Home/Home.tsx  # início
│   │   ├── Integrations/Integrations.tsx  # integrações
│   │   ├── Login/Login.tsx  # acesso
│   │   ├── NotFound/NotFound.tsx  # 404
│   │   ├── Register/Register.tsx  # registro
│   │   ├── Metrics/Metrics.tsx  # métricas
│   │   ├── Billing/Billing.tsx  # cobrança
│   │   └── Snapshots/Snapshots.tsx  # snapshots
│   ├── docs/  # docs
│   ├── tests/  # testes
│   ├── .dockerignore  # ignora docker
│   ├── .env  # ambiente
│   ├── .env.example  # exemplo de ambiente
│   ├── .env.local  # ambiente local
│   ├── .gitattributes  # atributos git
│   ├── .gitignore  # ignorados
│   ├── .gitkeep  # mantém pasta no git
│   ├── .npmignore  # ignora publish
│   ├── .npmrc  # registry
│   ├── .nvmrc  # node
│   ├── Dockerfile  # container (mescla docker.config+containerfile)
│   ├── ARCHITECTURE.md  # arquitetura
│   ├── CONTRIBUTING.md  # como contribuir
│   ├── CHANGELOG.md  # novidades (vira release notes)
│   ├── CODEOWNERS  # donos
│   ├── LICENSE  # licença
│   ├── README.md  # apresentação
│   ├── SECURITY.md  # segurança
│   ├── acceptable-use-policy.md  # uso aceitável
│   ├── authors.md  # autores
│   ├── bug-report.md  # relato de bug
│   ├── cla.md  # CLA
│   ├── code-of-conduct.md  # conduta
│   ├── contributing.md  # contribuição
│   ├── copyright.md  # direitos
│   ├── disclaimer.md  # aviso
│   ├── eula.md  # EULA
│   ├── export-control.md  # exportação
│   ├── governance.md  # governança
│   ├── notice.md  # aviso
│   ├── privacy-policy.md  # privacidade
│   ├── pull-request-template.md  # modelo de PR
│   ├── support.md  # suporte
│   ├── terms-and-conditions.md  # termos
│   ├── terms-of-use.md  # uso
│   ├── third-party-notices.md  # terceiros
│   ├── trademark-policy.md  # marca
│   ├── mttg.config  # mttg
│   ├── passage.config  # passage
│   ├── qemu.config  # QEMU
│   ├── package.json  # envelope Node
│   ├── pom.xml  # envelope JVM
│   ├── settings.xml  # settings Maven
│   ├── Saddle.java  # núcleo Java
│   ├── saddle.csproj  # envelope .NET
│   ├── saddle.gemspec  # envelope Ruby
│   ├── scrape.biome.json  # lint do scrape
│   ├── bun.lock  # lock Bun
│   ├── biome.json  # lint/format
│   ├── tsconfig.json  # TS (mescla app+backup+build+server)
│   ├── scrape.tsconfig.json  # TS do scrape
│   ├── vm.config.json  # vm
│   ├── boards.json  # placas
│   ├── cores.json  # núcleos
│   ├── gpus.json  # GPUs
│   ├── processors.json  # processadores
│   ├── virtualhardware.json  # hardware virtual
│   ├── gpumonitor.cpp  # monitor GPU
│   ├── virtualhardware.c  # hardware C
│   ├── virtualizationcore.cpp  # núcleo virtual
│   ├── qemubridge.py  # ponte QEMU
│   ├── jsdom.d.ts  # tipos DOM
│   ├── acquisition.ts  # aquisição
│   ├── alternatives.ts  # alternativas
│   ├── automation.ts  # automação
│   ├── billing.ts  # cobrança
│   ├── cli.ts  # CLI
│   ├── communication.ts  # comunicação
│   ├── compute.ts  # computação
│   ├── distribution.ts  # distribuição
│   ├── execution.ts  # execução
│   ├── format.ts  # formato
│   ├── foundation.ts  # base
│   ├── images.ts  # imagens
│   ├── index.ts  # entrada
│   ├── integration.ts  # integração
│   ├── intelligence.ts  # inteligência
│   ├── isolation.ts  # isolamento
│   ├── media.ts  # mídia
│   ├── metrics.ts  # métricas
│   ├── modes.ts  # modos
│   ├── network.ts  # rede
│   ├── operations.ts  # operações
│   ├── orchestrator.ts  # orquestrador
│   ├── performance.ts  # desempenho
│   ├── quantum.ts  # quântico
│   ├── render.ts  # render
│   ├── scheduler.ts  # agendador
│   ├── security.ts  # segurança
│   ├── server.ts  # servidor
│   ├── snapshots.ts  # snapshots
│   ├── tiers.ts  # planos
│   ├── virtual.ts  # virtual
│   ├── virtualcpu.ts  # vCPU
│   ├── virtualgpu.ts  # vGPU
│   ├── virtualization.ts  # virtualização
│   ├── virtualmemory.ts  # memória virtual
│   └── webscrape.ts  # raspagem web
│
├── debonair/  # app áudio/DAW (abriga engine katexis na raiz; importa gateway/IA/workflow do devthink + versawase do cadria; build nas máquinas do GitHub, artefatos no release; site+subdomínio ex debonair.devthink.pro)
│   ├── Sol/  # <Tema> default = ex-web = qualquer nome de tema, estrutura no TEMPLATE; o tema é o app, cuida do design
│   │   ├── index.html  # entrada web
│   │   ├── App.tsx  # app roteador
│   │   ├── vite.config.ts  # build web
│   │   ├── tsconfig.json  # TS (mescla node)
│   │   ├── vercel.json  # deploy Vercel
│   │   ├── netlify.toml  # deploy Netlify
│   │   ├── capacitor.config.ts  # mobile
│   │   ├── tauri.conf.json  # desktop
│   │   ├── caddyfile  # servidor Caddy
│   │   ├── mime.types  # tipos MIME
│   │   ├── _headers  # cabeçalhos
│   │   ├── _redirects  # redirecionamentos
│   │   ├── manifest.json  # manifesto PWA
│   │   ├── manifest.webmanifest  # manifesto web
│   │   ├── sitemanifest.json  # mapa do site
│   │   ├── package.json  # envelope privado
│   │   ├── pnpm-lock.yaml  # lock pnpm
│   │   ├── pnpm-workspace.yaml  # workspace pnpm
│   │   ├── prisma.config.ts  # banco
│   │   ├── Cargo.toml  # envelope Rust
│   │   ├── Cargo.lock  # lock Rust
│   │   ├── drizzle.config.ts  # dados
│   │   ├── ionic.config.json  # ionic
│   │   ├── tailwind.config.ts  # estilos
│   │   ├── tailwind.config.js  # estilos js
│   │   ├── postcss.config.mjs  # css
│   │   ├── postcss.config.js  # css
│   │   ├── deno.json  # deno
│   │   ├── playwright.config.ts  # e2e
│   │   ├── vitest.config.ts  # testes
│   │   ├── biome.json  # lint/format
│   │   ├── metadata.json  # metadados
│   │   ├── .prettierignore  # ignora format
│   │   ├── .prettierrc  # format
│   │   ├── eslint.config.ts  # eslint
│   │   ├── commitlint.config.js  # commits
│   │   ├── companion.mjs  # build companheiro
│   │   ├── container.mjs  # container build
│   │   ├── copy-static.mjs  # copia estáticos
│   │   ├── package-lock.json  # lock
│   │   ├── vite-env.d.ts  # tipos do vite
│   │   ├── README.md  # apresentação
│   │   ├── prisma/schema.prisma  # banco
│   │   ├── index.css  # estilo do tema
│   │   ├── styles.css  # estilos
│   │   ├── popup.css  # estilo do popup
│   │   ├── design.html  # vitrine
│   │   ├── popup.html  # popup
│   │   ├── icon.svg  # ícone
│   │   ├── icon.png  # ícone
│   │   ├── icon.ico  # ícone
│   │   ├── favicon.ico  # favorito
│   │   ├── favicon.svg  # favorito
│   │   ├── icon32.png  # ícones
│   │   ├── icon64.png  # ícones
│   │   ├── icon128.png  # ícones
│   │   ├── robots.txt  # robôs
│   │   ├── sitemap.xml  # mapa
│   │   ├── humans.txt  # humanos
│   │   ├── rss.xml  # feed
│   │   ├── ads.txt  # anúncios
│   │   ├── keywords.txt  # palavras
│   │   ├── sw.ts  # service worker
│   │   ├── db.ts  # banco local
│   │   ├── api.ts  # api
│   │   ├── auth.ts  # auth
│   │   ├── utils.ts  # utilidades
│   │   ├── server.ts  # servidor
│   │   ├── schema.prisma  # banco prisma
│   │   ├── DEPLOYMENT.md  # deploy
│   │   ├── Onboarding/Onboarding.tsx  # boas-vindas do debonair
│   │   ├── Login/Login.tsx  # acesso do debonair
│   │   ├── Mixer/Mixer.tsx  # mixagem
│   │   ├── Timeline/Timeline.tsx  # linha do tempo
│   │   ├── PianoRoll/PianoRoll.tsx  # piano roll
│   │   ├── Library/Library.tsx  # biblioteca de sons
│   │   ├── Master/Master.tsx  # masterização
│   │   ├── Settings/Settings.tsx  # ajustes do debonair
│   ├── docs/  # docs do debonair
│   ├── tests/  # testes do debonair
│   ├── .dockerignore  # ignora docker
│   ├── .env  # ambiente
│   ├── .env.example  # exemplo de ambiente
│   ├── .env.local  # ambiente local
│   ├── .gitattributes  # atributos git
│   ├── .gitignore  # ignorados
│   ├── .gitkeep  # mantém pasta no git
│   ├── .npmignore  # ignora publish
│   ├── .npmrc  # registry
│   ├── .nvmrc  # node
│   ├── Dockerfile  # container (mescla docker.config+containerfile)
│   ├── ARCHITECTURE.md  # arquitetura do debonair
│   ├── CHANGELOG.md  # novidades do debonair (vira release notes)
│   ├── CODEOWNERS  # donos do debonair
│   ├── CONTRIBUTING.md  # como contribuir no debonair
│   ├── LICENSE  # licença do debonair
│   ├── README.md  # apresentação do debonair
│   ├── SECURITY.md  # segurança do debonair
│   ├── code-of-conduct.md  # conduta do debonair
│   ├── third-party-notices.md  # terceiros do debonair
│   ├── package.json  # envelope do debonair
│   ├── pom.xml  # envelope JVM do debonair
│   ├── settings.xml  # settings Maven do debonair
│   ├── bun.lock  # lock Bun
│   ├── biome.json  # lint/format
│   ├── tsconfig.json  # TS (mescla app+backup+build+server)
│   ├── effects.ts  # efeitos
│   ├── engine.ts  # núcleo do motor de áudio
│   ├── export.ts  # exportação
│   ├── harmony.ts  # harmonia
│   ├── index.ts  # entrada das lógicas de áudio
│   ├── instruments.ts  # instrumentos
│   ├── katexis.ts  # engine katexis (áudio/música) hospedada aqui (biblioteca universal)
│   ├── master.ts  # masterização
│   ├── melody.ts  # melodia
│   ├── mixer.ts  # mixagem
│   ├── musicEngine.ts  # motor musical
│   ├── presets.ts  # presets
│   ├── rhythm.ts  # ritmo
│   ├── sampler.ts  # sampler
│   ├── sequencer.ts  # sequenciador
│   ├── synth.ts  # sintetizadores
│   ├── theory.ts  # teoria musical
│   └── utils.ts  # utilidades de áudio
│
├── cadria/  # app vídeo (absorve iukka=player e create; abriga engine versawase na raiz; importa katexis do debonair + gateway/IA/workflow do devthink; build nas máquinas do GitHub, artefatos no release; site+subdomínio ex cadria.devthink.pro)
│   ├── Sol/  # <Tema> default = ex-web = qualquer nome de tema, estrutura no TEMPLATE; o tema é o app, cuida do design
│   │   ├── index.html  # entrada web
│   │   ├── App.tsx  # app roteador
│   │   ├── vite.config.ts  # build web
│   │   ├── tsconfig.json  # TS (mescla node)
│   │   ├── vercel.json  # deploy Vercel
│   │   ├── netlify.toml  # deploy Netlify
│   │   ├── capacitor.config.ts  # mobile
│   │   ├── tauri.conf.json  # desktop
│   │   ├── caddyfile  # servidor Caddy
│   │   ├── mime.types  # tipos MIME
│   │   ├── _headers  # cabeçalhos
│   │   ├── _redirects  # redirecionamentos
│   │   ├── manifest.json  # manifesto PWA
│   │   ├── manifest.webmanifest  # manifesto web
│   │   ├── sitemanifest.json  # mapa do site
│   │   ├── package.json  # envelope privado
│   │   ├── pnpm-lock.yaml  # lock pnpm
│   │   ├── pnpm-workspace.yaml  # workspace pnpm
│   │   ├── prisma.config.ts  # banco
│   │   ├── Cargo.toml  # envelope Rust
│   │   ├── Cargo.lock  # lock Rust
│   │   ├── drizzle.config.ts  # dados
│   │   ├── ionic.config.json  # ionic
│   │   ├── tailwind.config.ts  # estilos
│   │   ├── tailwind.config.js  # estilos js
│   │   ├── postcss.config.mjs  # css
│   │   ├── postcss.config.js  # css
│   │   ├── deno.json  # deno
│   │   ├── playwright.config.ts  # e2e
│   │   ├── vitest.config.ts  # testes
│   │   ├── biome.json  # lint/format
│   │   ├── metadata.json  # metadados
│   │   ├── .prettierignore  # ignora format
│   │   ├── .prettierrc  # format
│   │   ├── eslint.config.ts  # eslint
│   │   ├── commitlint.config.js  # commits
│   │   ├── companion.mjs  # build companheiro
│   │   ├── container.mjs  # container build
│   │   ├── copy-static.mjs  # copia estáticos
│   │   ├── package-lock.json  # lock
│   │   ├── vite-env.d.ts  # tipos do vite
│   │   ├── README.md  # apresentação
│   │   ├── prisma/schema.prisma  # banco
│   │   ├── index.css  # estilo do tema
│   │   ├── styles.css  # estilos
│   │   ├── popup.css  # estilo do popup
│   │   ├── design.html  # vitrine
│   │   ├── popup.html  # popup
│   │   ├── icon.svg  # ícone
│   │   ├── icon.png  # ícone
│   │   ├── icon.ico  # ícone
│   │   ├── favicon.ico  # favorito
│   │   ├── favicon.svg  # favorito
│   │   ├── icon32.png  # ícones
│   │   ├── icon64.png  # ícones
│   │   ├── icon128.png  # ícones
│   │   ├── robots.txt  # robôs
│   │   ├── sitemap.xml  # mapa
│   │   ├── humans.txt  # humanos
│   │   ├── rss.xml  # feed
│   │   ├── ads.txt  # anúncios
│   │   ├── keywords.txt  # palavras
│   │   ├── sw.ts  # service worker
│   │   ├── db.ts  # banco local
│   │   ├── api.ts  # api
│   │   ├── auth.ts  # auth
│   │   ├── utils.ts  # utilidades
│   │   ├── server.ts  # servidor
│   │   ├── schema.prisma  # banco prisma
│   │   ├── DEPLOYMENT.md  # deploy
│   │   ├── Onboarding/Onboarding.tsx  # boas-vindas do cadria
│   │   ├── Login/Login.tsx  # acesso do cadria
│   │   ├── Player/Player.tsx  # player
│   │   ├── Timeline/Timeline.tsx  # linha do tempo
│   │   ├── Editor/Editor.tsx  # editor
│   │   ├── Render/Render.tsx  # render
│   │   ├── Library/Library.tsx  # biblioteca
│   │   ├── Export/Export.tsx  # exportação
│   ├── docs/  # docs do cadria
│   ├── tests/  # testes do cadria
│   ├── .dockerignore  # ignora docker
│   ├── .env  # ambiente
│   ├── .env.example  # exemplo de ambiente
│   ├── .env.local  # ambiente local
│   ├── .gitattributes  # atributos git
│   ├── .gitignore  # ignorados
│   ├── .gitkeep  # mantém pasta no git
│   ├── .npmignore  # ignora publish
│   ├── .npmrc  # registry
│   ├── .nvmrc  # node
│   ├── Dockerfile  # container (mescla docker.config+containerfile)
│   ├── ARCHITECTURE.md  # arquitetura do cadria
│   ├── CHANGELOG.md  # novidades do cadria (vira release notes)
│   ├── CODEOWNERS  # donos do cadria
│   ├── CONTRIBUTING.md  # como contribuir no cadria
│   ├── LICENSE  # licença do cadria
│   ├── README.md  # apresentação do cadria
│   ├── SECURITY.md  # segurança do cadria
│   ├── code-of-conduct.md  # conduta do cadria
│   ├── third-party-notices.md  # terceiros do cadria
│   ├── package.json  # envelope do cadria
│   ├── pom.xml  # envelope JVM do cadria
│   ├── settings.xml  # settings Maven do cadria
│   ├── bun.lock  # lock Bun
│   ├── biome.json  # lint/format
│   ├── tsconfig.json  # TS (mescla app+backup+build+server)
│   ├── ambient.ts  # ambiente/luz da cena
│   ├── capture.ts  # captura
│   ├── chapters.ts  # capítulos do vídeo
│   ├── codecs.ts  # codecs
│   ├── effects.ts  # efeitos de vídeo
│   ├── filters.ts  # filtros
│   ├── gestures.ts  # gestos de controle
│   ├── index.ts  # entrada das lógicas de vídeo
│   ├── media.ts  # mídia
│   ├── net.ts  # rede do cadria
│   ├── player.ts  # player (absorve iukka)
│   ├── providers.ts  # provedores
│   ├── render.ts  # renderização
│   ├── stall.ts  # controle de stall do player
│   ├── stream.ts  # streaming
│   ├── subtitles.ts  # legendas
│   ├── thumbnails.ts  # miniaturas
│   ├── timeline.ts  # timeline
│   ├── transcode.ts  # transcodificação
│   ├── types.ts  # tipos do cadria
│   ├── ui.ts  # UI do cadria
│   ├── utils.ts  # utilidades de vídeo
│   ├── versawase.ts  # engine 3D/video/imagem hospedada aqui (biblioteca universal)
│   ├── video.ts  # núcleo de vídeo do app
│   └── styles.css  # estilos do cadria
│
├── stealhead/  # jogo FPS (importa versawase do cadria + áudio do debonair via biblioteca, sem arquivo próprio; build nas máquinas do GitHub, artefatos no release; site+subdomínio ex stealhead.devthink.pro)
│   ├── Sol/  # <Tema> default = ex-web = qualquer nome de tema, estrutura no TEMPLATE; o tema é o app, cuida do design
│   │   ├── index.html  # entrada web
│   │   ├── App.tsx  # app roteador
│   │   ├── vite.config.ts  # build web
│   │   ├── tsconfig.json  # TS (mescla node)
│   │   ├── vercel.json  # deploy Vercel
│   │   ├── netlify.toml  # deploy Netlify
│   │   ├── capacitor.config.ts  # mobile
│   │   ├── tauri.conf.json  # desktop
│   │   ├── caddyfile  # servidor Caddy
│   │   ├── mime.types  # tipos MIME
│   │   ├── _headers  # cabeçalhos
│   │   ├── _redirects  # redirecionamentos
│   │   ├── manifest.json  # manifesto PWA
│   │   ├── manifest.webmanifest  # manifesto web
│   │   ├── sitemanifest.json  # mapa do site
│   │   ├── package.json  # envelope privado
│   │   ├── pnpm-lock.yaml  # lock pnpm
│   │   ├── pnpm-workspace.yaml  # workspace pnpm
│   │   ├── prisma.config.ts  # banco
│   │   ├── Cargo.toml  # envelope Rust
│   │   ├── Cargo.lock  # lock Rust
│   │   ├── drizzle.config.ts  # dados
│   │   ├── ionic.config.json  # ionic
│   │   ├── tailwind.config.ts  # estilos
│   │   ├── tailwind.config.js  # estilos js
│   │   ├── postcss.config.mjs  # css
│   │   ├── postcss.config.js  # css
│   │   ├── deno.json  # deno
│   │   ├── playwright.config.ts  # e2e
│   │   ├── vitest.config.ts  # testes
│   │   ├── biome.json  # lint/format
│   │   ├── metadata.json  # metadados
│   │   ├── .prettierignore  # ignora format
│   │   ├── .prettierrc  # format
│   │   ├── eslint.config.ts  # eslint
│   │   ├── commitlint.config.js  # commits
│   │   ├── companion.mjs  # build companheiro
│   │   ├── container.mjs  # container build
│   │   ├── copy-static.mjs  # copia estáticos
│   │   ├── package-lock.json  # lock
│   │   ├── vite-env.d.ts  # tipos do vite
│   │   ├── README.md  # apresentação
│   │   ├── prisma/schema.prisma  # banco
│   │   ├── index.css  # estilo do tema
│   │   ├── styles.css  # estilos
│   │   ├── popup.css  # estilo do popup
│   │   ├── design.html  # vitrine
│   │   ├── popup.html  # popup
│   │   ├── icon.svg  # ícone
│   │   ├── icon.png  # ícone
│   │   ├── icon.ico  # ícone
│   │   ├── favicon.ico  # favorito
│   │   ├── favicon.svg  # favorito
│   │   ├── icon32.png  # ícones
│   │   ├── icon64.png  # ícones
│   │   ├── icon128.png  # ícones
│   │   ├── robots.txt  # robôs
│   │   ├── sitemap.xml  # mapa
│   │   ├── humans.txt  # humanos
│   │   ├── rss.xml  # feed
│   │   ├── ads.txt  # anúncios
│   │   ├── keywords.txt  # palavras
│   │   ├── sw.ts  # service worker
│   │   ├── db.ts  # banco local
│   │   ├── api.ts  # api
│   │   ├── auth.ts  # auth
│   │   ├── utils.ts  # utilidades
│   │   ├── server.ts  # servidor
│   │   ├── schema.prisma  # banco prisma
│   │   ├── DEPLOYMENT.md  # deploy
│   │   ├── Onboarding/Onboarding.tsx  # boas-vindas do stealhead
│   │   ├── Login/Login.tsx  # acesso do stealhead
│   │   ├── Lobby/Lobby.tsx  # saguão
│   │   ├── Match/Match.tsx  # partida
│   │   ├── Ranking/Ranking.tsx  # ranking
│   │   ├── Inventory/Inventory.tsx  # inventário
│   │   ├── Settings/Settings.tsx  # ajustes do stealhead
│   ├── docs/  # docs do stealhead
│   ├── tests/  # testes do stealhead
│   ├── .dockerignore  # ignora docker
│   ├── .env  # ambiente
│   ├── .env.example  # exemplo de ambiente
│   ├── .env.local  # ambiente local
│   ├── .gitattributes  # atributos git
│   ├── .gitignore  # ignorados
│   ├── .gitkeep  # mantém pasta no git
│   ├── .npmignore  # ignora publish
│   ├── .npmrc  # registry
│   ├── .nvmrc  # node
│   ├── Dockerfile  # container (mescla docker.config+containerfile)
│   ├── ARCHITECTURE.md  # arquitetura do stealhead
│   ├── CHANGELOG.md  # novidades do stealhead (vira release notes)
│   ├── CODEOWNERS  # donos do stealhead
│   ├── CONTRIBUTING.md  # como contribuir no stealhead
│   ├── LICENSE  # licença do stealhead
│   ├── README.md  # apresentação do stealhead
│   ├── SECURITY.md  # segurança do stealhead
│   ├── code-of-conduct.md  # conduta do stealhead
│   ├── third-party-notices.md  # terceiros do stealhead
│   ├── package.json  # envelope do stealhead
│   ├── pom.xml  # envelope JVM do stealhead
│   ├── settings.xml  # settings Maven do stealhead
│   ├── bun.lock  # lock Bun
│   ├── biome.json  # lint/format
│   ├── tsconfig.json  # TS (mescla app+backup+build+server)
│   ├── ai.ts  # IA dos bots
│   ├── game.ts  # núcleo do jogo
│   ├── inventory.ts  # inventário
│   ├── lobby.ts  # saguão
│   ├── matchmaking.ts  # pareamento
│   ├── physics.ts  # física
│   ├── player.ts  # jogador
│   ├── ranking.ts  # ranking
│   ├── save.ts  # salvamento
│   ├── weapons.ts  # armas
│   ├── world.ts  # mundo 3D (via versawase do cadria)
│   ├── net.ts  # rede do jogo
│   └── db.ts  # DB do jogo (unificado)
│
├── argan/  # app DNS (zonas, registros, dnssec, handshake, gateway; importa gateway/IA do devthink quando precisa; build nas máquinas do GitHub, artefatos no release; site+subdomínio ex argan.devthink.pro)
│   ├── Sol/  # <Tema> default = ex-web = qualquer nome de tema, estrutura no TEMPLATE; o tema é o app, cuida do design
│   │   ├── index.html  # entrada web
│   │   ├── App.tsx  # app roteador
│   │   ├── vite.config.ts  # build web
│   │   ├── tsconfig.json  # TS (mescla node)
│   │   ├── vercel.json  # deploy Vercel
│   │   ├── netlify.toml  # deploy Netlify
│   │   ├── capacitor.config.ts  # mobile
│   │   ├── tauri.conf.json  # desktop
│   │   ├── caddyfile  # servidor Caddy
│   │   ├── mime.types  # tipos MIME
│   │   ├── _headers  # cabeçalhos
│   │   ├── _redirects  # redirecionamentos
│   │   ├── manifest.json  # manifesto PWA
│   │   ├── manifest.webmanifest  # manifesto web
│   │   ├── sitemanifest.json  # mapa do site
│   │   ├── package.json  # envelope privado
│   │   ├── pnpm-lock.yaml  # lock pnpm
│   │   ├── pnpm-workspace.yaml  # workspace pnpm
│   │   ├── prisma.config.ts  # banco
│   │   ├── Cargo.toml  # envelope Rust
│   │   ├── Cargo.lock  # lock Rust
│   │   ├── drizzle.config.ts  # dados
│   │   ├── ionic.config.json  # ionic
│   │   ├── tailwind.config.ts  # estilos
│   │   ├── tailwind.config.js  # estilos js
│   │   ├── postcss.config.mjs  # css
│   │   ├── postcss.config.js  # css
│   │   ├── deno.json  # deno
│   │   ├── playwright.config.ts  # e2e
│   │   ├── vitest.config.ts  # testes
│   │   ├── biome.json  # lint/format
│   │   ├── metadata.json  # metadados
│   │   ├── .prettierignore  # ignora format
│   │   ├── .prettierrc  # format
│   │   ├── eslint.config.ts  # eslint
│   │   ├── commitlint.config.js  # commits
│   │   ├── companion.mjs  # build companheiro
│   │   ├── container.mjs  # container build
│   │   ├── copy-static.mjs  # copia estáticos
│   │   ├── package-lock.json  # lock
│   │   ├── vite-env.d.ts  # tipos do vite
│   │   ├── README.md  # apresentação
│   │   ├── prisma/schema.prisma  # banco
│   │   ├── index.css  # estilo do tema
│   │   ├── styles.css  # estilos
│   │   ├── popup.css  # estilo do popup
│   │   ├── design.html  # vitrine
│   │   ├── popup.html  # popup
│   │   ├── icon.svg  # ícone
│   │   ├── icon.png  # ícone
│   │   ├── icon.ico  # ícone
│   │   ├── favicon.ico  # favorito
│   │   ├── favicon.svg  # favorito
│   │   ├── icon32.png  # ícones
│   │   ├── icon64.png  # ícones
│   │   ├── icon128.png  # ícones
│   │   ├── robots.txt  # robôs
│   │   ├── sitemap.xml  # mapa
│   │   ├── humans.txt  # humanos
│   │   ├── rss.xml  # feed
│   │   ├── ads.txt  # anúncios
│   │   ├── keywords.txt  # palavras
│   │   ├── sw.ts  # service worker
│   │   ├── db.ts  # banco local
│   │   ├── api.ts  # api
│   │   ├── auth.ts  # auth
│   │   ├── utils.ts  # utilidades
│   │   ├── server.ts  # servidor
│   │   ├── schema.prisma  # banco prisma
│   │   ├── DEPLOYMENT.md  # deploy
│   │   ├── Onboarding/Onboarding.tsx  # boas-vindas do argan
│   │   ├── Login/Login.tsx  # acesso do argan
│   │   ├── Dashboard/Dashboard.tsx  # painel
│   │   ├── Zones/Zones.tsx  # zonas
│   │   ├── Records/Records.tsx  # registros
│   │   ├── Dnssec/Dnssec.tsx  # dnssec
│   │   ├── Logs/Logs.tsx  # logs
│   │   ├── Settings/Settings.tsx  # ajustes do argan
│   ├── docs/  # docs do argan
│   ├── tests/  # testes do argan
│   ├── .dockerignore  # ignora docker
│   ├── .env  # ambiente
│   ├── .env.example  # exemplo de ambiente
│   ├── .env.local  # ambiente local
│   ├── .gitattributes  # atributos git
│   ├── .gitignore  # ignorados
│   ├── .gitkeep  # mantém pasta no git
│   ├── .npmignore  # ignora publish
│   ├── .npmrc  # registry
│   ├── .nvmrc  # node
│   ├── Dockerfile  # container (mescla docker.config+containerfile)
│   ├── ARCHITECTURE.md  # arquitetura do argan
│   ├── CHANGELOG.md  # novidades do argan (vira release notes)
│   ├── CODEOWNERS  # donos do argan
│   ├── CONTRIBUTING.md  # como contribuir no argan
│   ├── LICENSE  # licença do argan
│   ├── README.md  # apresentação do argan
│   ├── SECURITY.md  # segurança do argan
│   ├── code-of-conduct.md  # conduta do argan
│   ├── third-party-notices.md  # terceiros do argan
│   ├── conversa.md  # conversa do app
│   ├── package.json  # envelope do argan
│   ├── pom.xml  # envelope JVM do argan
│   ├── settings.xml  # settings Maven do argan
│   ├── bun.lock  # lock Bun
│   ├── biome.json  # lint/format
│   ├── tsconfig.json  # TS (mescla app+backup+build+server)
│   ├── acme.ts  # ACME do DNS
│   ├── cache.ts  # cache DNS
│   ├── certs.ts  # certificados
│   ├── cli.ts  # CLI do DNS
│   ├── dane.ts  # DANE
│   ├── dnssec.ts  # DNSSEC
│   ├── doh.ts  # DNS over HTTPS
│   ├── doq.ts  # DNS over QUIC
│   ├── dot.ts  # DNS over TLS
│   ├── errors.ts  # erros do DNS
│   ├── handshake.ts  # handshake
│   ├── index.ts  # entrada das lógicas de DNS
│   ├── monitoring.ts  # monitoramento
│   ├── publish.ts  # publicação de zonas
│   ├── query.ts  # consultas
│   ├── ratelimit.ts  # limite de taxa
│   ├── records.ts  # registros
│   ├── resolver.ts  # resolvedor
│   ├── scrape.ts  # coleta
│   ├── server.ts  # servidor DNS
│   ├── server-web.ts  # painel web do DNS
│   ├── types.ts  # tipos do argan
│   ├── utils.ts  # utilidades de DNS
│   ├── web.ts  # web do argan
│   ├── zone.ts  # zonas
│   └── zonefile.ts  # arquivos de zona
```
