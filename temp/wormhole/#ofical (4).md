# regras gerais (valem para qualquer projeto)

> sincronização (29/09/2026) — a arquitetura da plataforma devthink vive inteira neste documento, que une as regras gerais, a arquitetura oficial, as regras por aplicativo, o template padrão, os componentes oficiais por página e o exemplo de repositório, tudo sincronizado entre si e sem contradição. contagens sincronizadas: devthink 35 páginas · saddle 15 · debonair 8 (100 rotas) · cadria 8 (126 rotas) · stealhead 7 (110 rotas) · argan 8 · getry 54 telas de console + 9+ subrotas multimodais (rotas v1 a v7 e quantas precisarem) · extensão MV3 absorvida · clones deployáveis: vault (só guarda), forge (só roda), foundry (roda e guarda), gateway next (getry).

regras gerais, escritas em terceira pessoa e válidas para qualquer projeto da família. o que for específico deste projeto aparece como exemplo, e exemplo é apenas exemplo. o documento é a união de todas as regras da plataforma, com um conceito = uma regra, no lugar certo, sem duplicação e sem contradição.

### regras de escrita (valem para o documento e para a operação)

| regras |
|---|
| 1. tudo em minúscula, títulos incluídos; só código, nomes de arquivo e versões mantêm o caixa próprio. |
| 2. frases separadas, claras e objetivas, progressivas; uma ideia por frase; ortografia, gramática e pontuação impecáveis. |
| 3. parágrafos e linhas de árvore espaçados, nada colado; entre um parágrafo e outro existe linha em branco. |
| 4. hierarquia temática: cada frase e cada parágrafo fala de um tema só; quando o assunto muda, muda depois da pontuação (vírgula, ponto e vírgula, ponto), de forma conectada e progressiva; nunca empilhar assuntos na mesma respiração. |
| 5. hierarquia de estrutura: ponto → subponto → subponto do subponto; contexto correlato agrupado; nada telegráfico. |
| 6. terceira pessoa em toda a prosa técnica; corpo normativo em português; código, comentários e JSDoc em inglês. |
| 7. zero emoji em lugar nenhum; zero citação de fonte; nenhum nome de documento, linha ou numeração de origem no texto. |
| 8. toda tabela markdown nasce perfeita: cabeçalho, linha de separação com pipes e células com espaços; listas de bibliotecas, engines e ícones vão em codebox, nunca em tabela. |
| 9. seção termina em tabela; regras ficam acima; desenhos de árvore ficam abaixo, no template e no exemplo. |
| 10. infraestrutura antiga entra marcada com a expressão (plano anterior); nunca riscada, nunca apagada, nunca em branco. |

### aplicativos — regras

| regras |
|---|
| 1. devthink — OS e superplataforma. objetivo: ser o sistema operacional e a plataforma que engloba tudo. contexto: é o OS, e absorve devthinkos, cli-desktop, SoFlowX, akash, extension, gateway e maene, além de embutir o owni. é também o app principal, com navegador próprio chamado devthink, 35 páginas nativas no tema e notícias como página. não cria lógica de vídeo, imagem, 3D ou áudio: importa da biblioteca publicada (saddle, argan, katexis, versawase). todo app sai publicado em todos os registros (npm, GH-npm, GHCR, NuGet, Maven) e roda a mesma interface em tudo: CLI = web = TV. |
| 2. saddle — sandbox e runner de VM. objetivo: ser só virtualização, com sandbox completa e runner de qualquer sandbox do mercado. contexto: sem browser, sem gateway e sem features de OS, porque absorve o e2ugh. traz 3 bases (max, balanced, lite), SOs (android, grapheneos, linux, omarchy, windows e distros), arquiteturas (arm64, amd64 e outras) e vGPU e vCPU próprias. existe em 3 formas: runtime por pacotes Node, full por container Docker e publicada nos registros. gerencia o hardware virtual que os domínios usam. |
| 3. debonair — áudio e DAW. objetivo: criação de áudio e música. contexto: app isolado com nome de marketing, abriga a engine katexis na raiz, e importa gateway, IA e workflow do devthink e versawase do cadria quando precisa de imagem. |
| 4. cadria — vídeo e imagem. objetivo: player, editor e estúdio de vídeo e imagem. contexto: absorve iukka (player) e create (editor), abriga a engine versawase na raiz, e importa katexis do debonair e gateway, IA e workflow do devthink. |
| 5. stealhead — jogo FPS. objetivo: jogo de tiro em primeira pessoa. contexto: importa versawase do cadria e áudio do debonair via biblioteca, sem arquivo próprio de engine, e carrega só as lógicas do jogo (partida, ranking, armas, mundo). |
| 6. argan — DNS e gateway. objetivo: DNS, zonas, registros, dnssec e handshake. contexto: biblioteca de rede do sistema, importa gateway e IA do devthink quando precisa, e cada site usa o mesmo DB unificado. |
| 7. getry — gateway deployável. objetivo: a inferência da rede, com o meta-modelo devthink mascarando os modelos reais. contexto: é app próprio no monorepo e, em forma de clone deployável, sobe várias cópias de si para sustentar a concorrência, sempre com modelos de tag free. |
| 8. ansi-art — arte ANSI. objetivo: editor, galeria e conversão de arte em caracteres. contexto: 21 lógicas .ts soltas na raiz e páginas próprias; as features do soochimp foram absorvidas, e a divergência fica registrada: a engine aparece como ansiart.ts embutida no devthink quando não é app próprio. |
| 9. vault, forge e foundry — os clones deployáveis de site. objetivo: materializar os três papéis de site da rede. contexto: saem da saddle, não são apps novos, e não têm distribuição nenhuma (existem só como sites; as versões web e next existem apenas como zip nos assets do release). |

### estrutura de pastas — regras

| regras |
|---|
| 1. raiz do repositório só com pastas de app/modo + docs/ + tests/ + forjas + arquivos soltos. exemplo: devthink/, saddle/, docs/, tests/, .github/. |
| 2. flat: sem src/ na casa, sem pasta dentro de pasta, sem globais por categoria. exemplo: sem lib/, hooks/, components/. |
| 3. pasta = página = app, com tudo dela dentro; página config é app config. |
| 4. cada app tem docs/ e tests/ próprios, com scripts em tests/scripts/; referencia, não copia. |
| 5. um manifesto por linguagem na raiz do app, versão em lockstep, um lock só. exemplo: package.json + bun.lock. |
| 6. forjas espelho repetem o .github. exemplo: .gitlab, .forgejo. |
| 7. .github/ na raiz do repositório, workflows auto-contidos, um por responsabilidade. exemplo: matrix cobre todos os apps. |
| 8. scripts auxiliares da família vivem dentro do app devthink, em devthink/tests/scripts, padronizados em TypeScript; nada de pasta scripts na raiz do monorepo; demais apps mantêm os próprios scripts em tests/ e tests/scripts/. |
| 9. nada se apaga: duplicado guarda com sufixo. exemplo: (2)(3). |
| 10. site já é sandbox; conta = sandbox. exemplo: ~50GB por plano. |
| 11. nenhuma pasta ui/, assets/, public/, dist/, data/ ou DB/ na árvore; compilação e artefatos ficam na raiz do dono ou fora do repo. |
| 12. todos os aplicativos têm a MESMA estrutura: nenhum arquivo na raiz de um app que não existe nos outros; a única variação são as cópias de deploy (Vercel, Netlify, Cloudflare, Capacitor, Tauri), que ficam dentro da pasta do tema, junto do App.tsx. |
| 13. a âncora global App.tsx fica DENTRO da pasta do primeiro tema, ao lado do index.css e do index.html; a raiz do aplicativo carrega só as lógicas .ts soltas, os configs soltos, docs/ e tests/. |
| 14. a página é uma pasta com o próprio nome: o <Pagina>.tsx da subâncora, os componentes TSX soltos na pasta e .ts auxiliares quando precisa; não existe .styles.ts, .types.ts nem .test.tsx por página. |

### lógicas e código — regras

| regras |
|---|
| 1. lógicas .ts na raiz do app; interface puxa da raiz; raiz nunca puxa da interface; interface nunca puxa de interface. |
| 2. correlatas juntas em blocos hierárquicos; 1 arquivo = 1 responsabilidade. exemplo: até 300 por arquivo. |
| 3. TypeScript primeiro; nativo do runtime antes de pacote externo; app nasce biblioteca multi-modo. exemplo: node:*; ~30 modos. |
| 4. zero JS na interface: só TS/TSX/css/html, com .ts explícito nos imports relativos e sem enum/namespace. |
| 5. sem main: o App.tsx self-mounta, com roteamento embutido, dentro do tema. exemplo: temas + 404. |
| 6. nada hardcodado: env/DB/porta; host/porta sorteados e travados, nunca localhost. exemplo: tema vem do DB. |
| 7. minúsculas sem _/- nos arquivos, inglês no código, JSDoc em inglês, sem emoji, try/catch rastreável. |
| 8. só a lógica de entrada migra do tema para a raiz. exemplo: gateway.ts. |
| 9. TS de ponta a ponta: escreve, testa e publica TypeScript; JS só como emit no publish. exemplo: sem enum/namespace, Bun executa direto. |

### tema, páginas e onboarding — regras

| regras |
|---|
| 1. o tema é a pasta, e não existe pasta "default". exemplo: Sol/. |
| 2. N temas = N pastas completas (cada uma com App.tsx, index.css, index.html, package.json, cópias de deploy e as pastas de página). exemplo: Sol/ + Lua/ + Terra/ + Mar/. |
| 3. dentro do tema existe um único CSS, o index.css, com nome personalizável (index.css, sol.css ou o nome do tema); nunca style.css, nunca um CSS por componente. |
| 4. a página é a pasta: <Pagina>.tsx da subâncora, componentes TSX soltos na pasta e .ts auxiliares quando precisa. exemplo real: home/ tem Home.tsx, entry.tsx, palette.tsx, tabs.tsx, types.ts e workspace.tsx; notfound/ tem só NotFound.tsx. |
| 5. onboarding frame a frame adaptado por app; login pulável via OS. exemplo: logo → login → entrada → nav. |
| 6. um design só; só muda responsividade. exemplo: portrait = celular, landscape = TV/desktop. |
| 7. wrappers só empacotam. exemplo: ios/, android/. |
| 8. sem public/assets/dist no repo; compila na raiz do dono. exemplo: só icon/favicon. |

### nomes — regras

| regras |
|---|
| 1. nome novo nasce da raiz real do vocabulário técnico, deformada de leve. exemplo: dissolve, dolly, raccord. |
| 2. base inglês, sonoridade primeiro; nunca repetir terminações; validar na frase ("bota no ___") e em domínio/marca. |
| 3. só nomes oficiais; nunca inventar app; marca `DevThink` com D e T maiúsculos na apresentação, e devthink minúsculo em código e paths; IA do sistema = `Doo`. |
| 4. subprodutos nunca carregam devthink no nome de marketing. |
| 5. em prosa, tudo em minúscula, salvo código, nomes de arquivo e versões. |

### fusão — regras

| regras |
|---|
| 1. fusão é tudo para dentro, sem duplicar; dois iguais viram um, e nada se perde. |
| 2. fundido vira página, comando ou lógica do hospedeiro; metadados se convertem; sinônimos viram um conceito. exemplo: chat = agente. |
| 3. vence o mais recente; versões antigas ficam no histórico do CHANGELOG. |

### engines e biblioteca — regras

| regras |
|---|
| 1. engine mora em um app; os demais importam a biblioteca publicada; sem dependência circular. exemplo: katexis no debonair. |
| 2. biblioteca universal: qualquer projeto importa e só configura baseURL, models e keys. |
| 3. mais de 100 engines no total, sem limite de engine, biblioteca, framework ou pacote, desde que o Node.js orquestre por trás. |
| 4. bibliotecas de IA e de ícones entram em codebox, por categoria, sem limite. |
| 5. conta = sandbox; site já é sandbox; nada toca no hardware da pessoa. |

### build, deploy e release — regras

| regras |
|---|
| 1. build, teste e hash só nos computadores do GitHub; o agente não gera binário nem roda bateria autoritativa. |
| 2. release por bump: tag, zips por app (nome.web.versão.zip e nome.next.versão.zip), SHA256SUMS e release notes do CHANGELOG. |
| 3. nenhuma pasta de versão next no repositório: as versões next existem só como zip nos assets do release. |
| 4. mesma árvore em todo alvo de deploy; estático sem Functions; as cópias de deploy (Vercel, Netlify, Cloudflare, Capacitor, Tauri) vivem dentro da pasta do tema. |
| 5. pin de dependências exato; idades mínimas de release respeitadas; um lock por manifesto. |

### git e ci — regras

| regras |
|---|
| 1. commits sempre na identidade do dono; conventional commits; uma ação por commit. |
| 2. branch main protegida; PRs e branches arquivados; só a main permanece. |
| 3. ações por TAG de versão, nunca por hash; nenhum hash hardcoded: o hash se gera no build e viaja nos assets. |
| 4. um workflow por responsabilidade; dependabot.yml em .github/, nunca em workflows/; secrets nunca em if:. |
| 5. painéis 0/0/0 como critério de pronto; runs vermelhas colaterais se deletam; loop de bump até tudo verde. |

### infra e dados — regras

| regras |
|---|
| 1. Drizzle ORM + better-sqlite3 na execução; Prisma só como schema declarativo dentro do tema; nenhum .sql no repo. |
| 2. DB unificado entre sites e apps, nunca commitado; mestre + shard por conta. |
| 3. blobs nunca no DB: chunks com SHA-256, compressão e catálogo; reuso automático. |
| 4. sites replicáveis com quorum de escrita N/2+1, leitura any-of-N e reconciliação diária idempotente. |
| 5. builds dos clones deployáveis ficam catalogados no DB do próprio site; backups sobem para o vault e para o foundry deployado. |

### execução — regras

| regras |
|---|
| 1. data primeiro: consultar a data e usar o melhor padrão e versão daquela data em cada etapa. |
| 2. inline primeiro; delegar subagentes antes de executar inline; arquivo local é último recurso; limpar temporários depois. |
| 3. verificar por etapa; verificar bytes reais antes de "corrigir" corrupção aparente; analisar falhas da mais recente à mais antiga. |
| 4. honestidade radical: reportar estado real, pendências e plano; erro anterior se corrige de verdade. |
| 5. never localhost; host e porta sorteados e travados por sessão; modo local só opt-in com consentimento. |

### documentação — regras

| regras |
|---|
| 1. # por arquivo e pasta, com o contexto na própria linha. exemplo: player.ts # player. |
| 2. doc de arquitetura é só árvore, um arquivo por linha; template no documento oficial; docs sincronizados entre si. |
| 3. seções terminam em tabela; regras acima, árvores abaixo. |
| 4. o documento inteiro segue as regras de escrita: minúscula, frases separadas, espaçamento, hierarquia temática. |

### contagens sincronizadas — regras

| contagem | valor |
|---|---|
| páginas devthink | 35 |
| páginas saddle | 15 |
| páginas debonair | 8 (100 rotas) |
| páginas cadria | 8 (126 rotas) |
| páginas stealhead | 7 (110 rotas) |
| páginas argan | 8 |
| páginas ansi-art | 6 |
| getry | 54 telas de console + 9+ subrotas multimodais |
| clones deployáveis | vault (só guarda), forge (só roda), foundry (roda e guarda), gateway next (getry) |
| lógicas soltas por app | ~92 no devthink, e o mesmo padrão de raiz nos demais |
| blocos condicionais | 10 de sandbox/VM + 6 de desktop nativo, mutuamente exclusivos |

**idioma do código e tradução da interface** — todo o código e toda a plataforma são escritos em inglês, dos nomes de arquivos e pastas aos comentários, scripts, workflows e mensagens de commit. a interface traduz para o idioma da pessoa por meio da API do Google GTX (o endpoint translate_a/single do translate.googleapis.com com o parâmetro client=gtx), que recebe o texto com o idioma de origem em auto e o idioma alvo escolhido pela pessoa e devolve os segmentos traduzidos. os blocos de texto viajam em lote, separados por um marcador acordado, e cada tradução fica guardada no cache local da pessoa, com a chave versionada, de modo que o texto original nunca se perde: o módulo guarda os originais num mapa fraco, sem alterar a estrutura do DOM.

| camada | comportamento |
|---|---|
| Código e plataforma | inglês (arquivos, pastas, comentários, scripts, workflows, commits) |
| Tradução | API do Google GTX (translate_a/single, client=gtx, sl=auto, tl do usuário) |
| Lote | os blocos viajam juntos com o separador acordado e voltam na ordem |
| Cache | armazenamento local da pessoa, chave versionada |
| Texto original | preservado num mapa fraco, sem mudar a estrutura do DOM |

# regras do template sol — interface universal, db virtual e release por aplicativo

> regras gerais, sem versão hardcodada: quando um contexto específico importa, ele entra como chamada exemplar e separada — como, por exemplo, na onda 2.0.47 do repositório, quando a pasta site virou sol e a release por aplicativo entrou no ar.

**a pasta do tema se chama sol** — a antiga pasta site deixa de existir em todos os aplicativos da família (argan, cadria, debonair, devthink, forge, foundry, getry, saddle, stealhead e vault); o conteúdo dela é absorvido dentro de sol sem perda zero e as pastas bagunçadas são reajustadas ao template. dentro do tema vale a régua de raiz: o único html é o index.html e o único css é o index.css (nome personalizável), não existe 404.html — o notfound é um componente tsx e o workflow de build resolve o fallback na hora do deploy —, não existe pasta assets com css e js separados, e não existe index.html dentro de pasta de página; página é pasta minúscula com o componente <pagina>.tsx e os auxiliares soltos. o app.tsx importa as âncoras das subrotas e cada subrota importa os próprios componentes, até cem por página. lógica geral (autenticação, interação, dados) fica na raiz do app em ts, usada pelos componentes; lógica feita para a interface (a barra de url limpa, o reveal, o tema) mora dentro de sol embutida em ts/tsx. os próximos temas não repetem as configurações de framework que já moram em sol — terão só as pastas de página. os nomes dos nossos arquivos usam palavra-chave única curta (auth.ts) e, quando compostos, usam ponto e nunca hífen, exceto nos arquivos de configuração de framework (package.json, tsconfig.json, vite.config.ts, tomls), que guardam a convenção deles.

**zero toque na máquina da pessoa** — a interface nunca grava nada no navegador: nada de indexeddb, localforage ou localstorage nos sites; nunca usa gpu, cpu, câmera ou geolocalização do visitante; nunca compila nada na máquina de ninguém. a única coisa que a máquina da pessoa faz é carregar a interface. cada site é uma sandbox assim que a pessoa entra com id: as vinte modalidades de sandbox (runtime via wasm, babel, pacotes node e as engines; a sandbox completa virtualizada que é o saddle, com drives e sistema; a runed sandbox que roda qualquer binário pelos domínios, inclusive a si mesma) vivem no #ofical e rodam nos nossos domínios por https, mimetype e api. o stealhead já vem pré-compilado — shaders, assets, tudo — para a vgpu e a vcpu do visitante não compilarem de volta; se precisar compilar, compila nas nossas engines.

**o db virtual** — o db self-hosted de cada site espelha o repositório por tema: código, assets e informações ficam gravados nele, por isso nada de dado fica hardcodado no componente — o componente busca da camada de db por acessor tipado, a resposta offline do build estático vem de seed em memória, e nunca de armazenamento do navegador. o db recebe git lfs como object e git objects/blobs (libgit2), drizzle orm, prisma schema, better-sqlite3 com libsql e mysql2; nada de supabase, tudo self-hosted com pacotes node nativos; os dbs se compartilham entre sites por https e pelos mimetypes. as engines são bibliotecas: zero dado de consumidor dentro delas, api tipada exportada, prontas para serem configuradas por quem consome, e viajam nos pacotes npm e maven com o módulo spring boot.

**identidades da família** — vault é o clone do supabase (todas as features) e a biblioteca de armazenamento da plataforma: todo armazenamento vive nele e só nele (git lfs, libgit2, objetos git e blobs dentro do db, drizzle, prisma, better-sqlite3, libsql, mysql2), e as outras aplicações importam a biblioteca @wenathlan/vault em vez de reimplementar; foundry é a interface e as configurações do clone de e2b e docker, e a engine dele mora no saddle; forge carrega os runners de sandbox na fronteira do saddle; cadria carrega a engine versawase na raiz (a engine de imagem, vídeo, animação e 3D, com referências em blender, after effects, davinci, photoshop e remotion); debonair carrega a engine katexis na raiz (a engine de áudio e música); argan leva o dns e o gateway; stealhead é a plataforma fps que importa versawase pela biblioteca publicada e guarda só o armazenamento e a pré-compilação; saddle é a engine de virtualização completa e a biblioteca das vinte modalidades de sandbox — quem quiser sandbox puxa dela; getry é a biblioteca e a referência da gateway; e o devthink é a superplataforma que junta todos: ele tem tudo o que cadria, debonair, forge, foundry, saddle, vault e getry têm, mas importando as bibliotecas deles — a lógica nunca se duplica, cada família de recursos tem uma só casa.

**modalidades vfs e cdn, e o limite real do catálogo** — duas modalidades entram no rol das vinte (e caminham para as trinta): a sandbox vfs, que monta um sistema virtual de arquivos sustentado pelo prisma, pelo git e pelo db — o sistema de arquivos da sandbox nasce do banco, não da máquina — e a sandbox cdn, que carrega as dependências por fetch nas cerca de quarenta e cinco cdns do catálogo (esm.sh entre elas; a lista completa o dono publica depois), como a studio das telas já demonstrava, com uma diferença decisiva: o carregamento não acontece no navegador da pessoa — ele acontece dentro da sandbox, no db, via vfs, pelos domínios, por mimetypes e apis internas sobre https. a pessoa não escolhe modalidade: a plataforma resolve a junção de todas (a modalidade nuclear) com o único propósito de não tocar nem um milímetro no navegador e no armazenamento do visitante. e o limite real, confirmado no catálogo: o package.10 carrega mais de quarenta e três mil dependências, e nenhum package.json as carrega inteiras — resolução de dependências explode a memória dos computadores de build (os nossos ou os do github e da netlify), o lockfile nunca fecha e o registro recusa o manifesto; instalar em lotes de trinta com intervalo também não existe como recurso de gerenciador de pacotes, porque a resolução do grafo é inteira de uma vez. por isso a regra é: o package.json carrega os essenciais do build; o catálogo inteiro fica disponível pelas modalidades vfs e cdn, que carregam em execução, sem instalar; e a instalação granular, de dez em dez ou de quarenta em quarenta com intervalo, vale para o materialização dentro da sandbox virtual, nunca para o host do build.

**a infraestrutura viva — pipeline, clones e o aplicativo que mora no db** — todo upload da pessoa (um vídeo, um binário, qualquer arquivo do central de files) atravessa a pipeline yml do próprio site: a pipeline converte e otimiza os dados em chunks, empacota em tar.xz (o mimetype muda com a conversão), grava no db do site e dispara a api de mimetypes para os outros sites da família sincronizarem backup; a codificação acontece na entrada e a decodificação é só revelar o que já está no db — a engine devolve o mimetype e o arquivo aparece na interface. os dbs se multiplicam para dar capacidade infinita de armazenamento: o vault carrega cron jobs que disparam a criação de novos dbs de forma estática no próprio host (na netlify, na vercel, no devserver), através do drizzle, do prisma schema, do git lfs e da compressão brotli; os sites deployáveis são clonáveis e sustentam a concorrência entre si, e os clones compartilham os dados — as sandboxes que rodam nos clones do saddle, do forge e dos demais estão todas sincronizadas. aplicativos vivem dentro do db: a pessoa manda um binário (um blender baixado do filecr, com a rootfs dele), a sandbox da família se passa pelo sistema virtual de arquivos do windows ou do linux (as modalidades de sandbox existem exatamente para isso — a completa virtualizada e as leves de vfs), a instalação decodifica e os artefatos são setados no db; o aplicativo passa a morar no db e roda pelas engines do saddle — memória virtual, memória ram virtual e armazenamento virtual são engines do saddle que os sites se dispõem entre si. quando o binário entra, a ia da gateway (com os clones da gateway disparados nas plataformas, todos conectados pelos templates padronizados) consulta em tempo real as tabelas de db, o lfs e os objetos git dos sites: se o aplicativo já existe no sistema, a resposta é "já está no ar — rodar agora", sacando ou escrevendo o componente interativo animado, pré-compilado em alguma sandbox — a pessoa roda direto na interface sem consumir a própria máquina, porque quem sustenta a execução são os sites deployados para concorrência (os clones do saddle e o clone só de rodar, o forge).

**painéis por aplicativo, o app admin e a ia doo** — dentro de cada aplicativo existe o contexto de painel do próprio aplicativo (um app de finanças tem o painel de finanças), e isso não tem nada a ver com o painel de segurança: por isso existe o aplicativo chamado admin, o app do sistema que carrega o controle. a plataforma traduz as features de discord, trello, github, gitlab e supabase em aplicativos — cadria é um aplicativo dentro do devthink, stealhead é um aplicativo puxado para dentro, sempre carregando a tag de quem puxou (pelo criador, pela ia, ou por qualquer usuário da comunidade). a ia do sistema é a doo: criada pelo criador, universal, serve todo mundo — e isso não impede a pessoa de criar, treinar e conectar a própria ia, com mcp, api e gateway personalizados, e de construir site lá dentro com sandbox e preview (as features de preview do z.ai, as sandboxes do e2b e as do manus, tudo pelo os). o design da interface é a mistura de chrome, brave, trello (a variação documentada nas telas), windows 10 e 11 e apple silicon — a barra flutuante de ícones que expande ao clique — e o material de referência do lookup deve subir a esse nível: o design atual está abaixo do padrão exigido. o css do tema segue o nome do tema (index.css padronizado hoje no sol; um tema luna amanhã carregaria o luna.css), e o app.tsx é a âncora central que gerencia as rotas do tema ativo — cada tema novo entra como novas subâncoras na âncora.

**um catálogo, um login, um compromisso por aplicativo** — o db não se deixa ler nem exportar: nenhum usuário alcança o banco, só quem está cadastrado dentro dele; e há uma segunda camada de painel além da dos criadores — a camada da comunidade, onde cada pessoa gerencia as próprias apis, npcs, mcp, sites, componentes, vídeos e binários, cria times, grupos, usuários e as próprias ias virtuais, curte e acompanha pelo explorer com as features sociais da família (discord, facebook, youtube, instagram, figma, behance) e roda os jogos pesados que a comunidade puxa (exe e apk pelo rodador de binários do saddle — a steam roda lá dentro). os dois painéis são o mesmo componente, nunca uma duplicata: a âncora gerencia os paths das subâncoras, cada subâncora gerencia a lista de import dos próprios componentes (até cem por página), e componentes idênticos podem repetir por página — acrescentar um componente é acrescentar uma linha na subâncora. as dependências de todos os package.json da família vêm de um catálogo único (o package.10, que carrega o conjunto inteiro com as overrides em modo espelho, cada dependência presa à própria versão do catálogo): a padronização é o destino, cada package.json caminha para o mesmo conjunto e para as mesmas overrides para o build não ter furos, e dependência nova entra pela versão que o catálogo responde. o db é compartilhado entre os sites da família: quem cria conta em qualquer um deles (vault, saddle, cadria, debonair, gateway ou devthink) tem login único, porque os dbs conversam entre si por https — o mesmo armazenamento, as mesmas rotas de callback, a mesma identidade. os clones são o plano de fallback do domínio: se o domínio oficial sair do ar, a pessoa é redirecionada para o próximo clone no ar (netlify, vercel, os links de preview e os deploys das plataformas são vitalícios enquanto existirem), e como o template é universal e os dbs são compartilhados, entrar em qualquer um dos links é entrar no mesmo site — nada se perde enquanto o repositório existir. cada aplicativo cuida de uma coisa só e distribui isso como biblioteca: saddle é o run — sandbox runner e binário runner, as vinte modalidades (a sandbox é a interface; o runner por trás é engine), cadria é mídia e 3D, debonair é áudio, vault é armazenamento, getry é gateway — e o devthink, a superplataforma, importa deles em vez de duplicar: quando uma página da família precisar de imagem ou vídeo, importa o cadria; de áudio, o debonair; de sandbox, o saddle; de armazenamento, o vault. a revisão que desduplica as lógicas réplica por réplica entre os aplicativos é trabalho futuro e deliberado.

**release por app e pages única** — cada aplicativo tem a própria linha de release no repositório único: a lane family release corta a tag <app>-v<versão> quando o package.json do app sobe, anexa o source archive tar.xz no nível -9e e as quatro formas next (tar.xz + brotli 11) vão para a release do app; o devthink mantém a linha v<versão> com a lane pesada própria. zip só fica onde a plataforma exige (vsix, xpi, extensão chromium, safari e o declarations do maven). o github pages do repositório é um site único que serve todos os temas sob /<app>/ — a interface universal deployada — e cada app também deploya clone na vercel, na netlify e em qualquer outra plataforma pelas formas next.

# regras da arquitetura oficial — devthink

> vige antes do template padrão. formato: parágrafo → tabela → parágrafo → tabela. nada hardcodado: a lógica é feita para configurar, mas o hardcode vai para o DB — o código é o motor, o DB é a configuração viva. o usuário escolhe tudo: troca de LLM (BYOK), de hosting (BYOH), de sandbox (memória, GPU, CPU, threads, núcleos), de cores e de temas — criar, misturar, importar e exportar temas, comunidade incluída. todo app expõe MCP para a IA gerenciar, com a LLM padrão mascarada e conectada. a interface é universal (TV, desktop, CLI, binário, Android, tablet): o mesmo build muda só aspect ratio, DPI/XDPI e responsividade. todo componente carrega dois tipos de lógica: a da animação e a que faz a micro-interação funcionar. componente é pré-output de feature: o botão mapeado no catálogo de telas já implica a feature.

**estrutura**: página = pasta = aplicativo dentro do tema. o tema é uma pasta com nome próprio — "web" é apenas o nome que se dá à pasta do tema, e pode ser Sol ou qualquer outro; o documento usa sempre o nome real para o modelo não confundir com a web. a âncora global App.tsx fica DENTRO da pasta do primeiro tema, ao lado do index.css e do index.html, e é o router: importa as subâncoras de todas as páginas e faz o state-router. dentro do tema existe um único CSS — o index.css — com nome personalizável (index.css, sol.css ou o próprio nome do tema); nenhum outro CSS de tema existe como arquivo separado. a subâncora Sol/<Pagina>/<Pagina>.tsx tem o mesmo nome da pasta e importa os componentes irmãos, todos em TSX, soltos na própria pasta da página, com .ts auxiliares quando precisa — não existe pasta ui/, assets/, public/, dist/, data/, DB/ nem src/ na casa, e não existe .styles.ts, .types.ts nem .test.tsx por página. componentes compartilhados (control.shell.tsx e os do Shell) ficam soltos na raiz do tema Sol/, junto do icons.ts e do package.json. as cópias de deploy (Vercel, Netlify, Cloudflare, Capacitor, Tauri) também vivem dentro da pasta do tema, ao lado do App.tsx. a raiz do aplicativo carrega só as lógicas .ts soltas, os configs soltos, docs/ e tests/. orçamento: até 100+ componentes TSX por página — cada pasta da página define os seus; os oficiais de cada página estão na seção componentes oficiais por página e desenhados na árvore do exemplo, um por linha.

| grupo | âncoras + componentes |
|---|---|
| shell | App.tsx + ThemeSwitch, CommandPalette, BellMenu, TranslateMenu, AvatarMenu, SidebarRail, TopPillBar, DockApps, Toast, Banner, Modal, Drawer, ConfirmBox (13) |
| conta/planos | Onboarding, Login, News, Home, Projects, Settings, Usage, Plans (3+Doações), Profile (9) |
| dev | Playground, Console, Gatewayview, Connectors, Automations, Deploy, Security, Providers, Files, Terminal, Notes, Docs, Data, Metrics, Architecture, Integrations (16) |
| editor akash | EditorHome, SitePages, SiteFiles, Design(dnd), Components(+GeminiChat), Content, EditorConfig, Trash (8) |
| mídia (cadria/stealhead) | Gallery, Audio, Video, Image, Music, Camera, Recorder, PhotoEditor, VideoEditor, Store (10) |
| criação IA | Browser, Sandboxes, Agents, Compose (4) |
| total | ~60 âncoras + ~40 de página = 100 (nada além; feature nova reutiliza) |

**arquivos de plataforma na raiz do tema (tradução dos arquivos da Cloudflare)** — estão desenhados na árvore do EXEMPLO (último item deste arquivo):

| arquivo | papel |
|---|---|
| devthink.toml | config da plataforma (na raiz do tema) — rotas de domínio, bindings, vars não-secretas |
| wrangler.toml | config Cloudflare/Workers equivalente — deploy, bindings, rotas de domínio dos sites |
| .dev.vars | segredos LOCAIS do wrangler dev (nunca commitado; em produção vira env do host) |
| mime.types | os 3000+ media types em formato nginx que alimentam o Saddle e o Caddy |

**infra selada (self-hosted, sem captcha)**: armazenamento = Git LFS + libgit2 (objetos git sem shell) + Prisma Schema + Drizzle ORM + MySQL2 + PostgreSQL + Better-SQLite3. Workflows em YML (declarativo, linear, hierárquico) com as mesmas features de GitHub/GitLab/Cloudflare: triggers, matrix, caches, artifacts, release automática quando package.json/.gitignore/CHANGELOG mudam (assets por app, versão única). Rede: domínios deployados sustentam a sandbox/Saddle 24h/dia; DB-sites guardam a persistência real (não só export HTTP-blob); comunicação por mime-types + API HTTPS. Compressão oficial: tar.xz nível 9 + Brotli (uma sobre a outra) via workflow YML sobre os objetos git. NENHUM hardware real do cliente (GPU/CPU/vGPU/vCPU): tudo emulação nos hosts. Gateway escreve o código; a UI (Akash/dashboard) controla repos/sandboxes visualmente. Essa mesma stack — workflows YML, filesystem do Git com objetos git via libgit2, Prisma Schema, Drizzle ORM, MySQL2 e Better-SQLite3 — serve tanto na operação pelo repositório do GitHub (workflows YML do GitHub) quanto na infraestrutura da própria plataforma; outras opções não são descartadas.

**os clones deployáveis** — sites clonáveis que materializam os três papéis de site da rede (só roda, só guarda, roda e guarda). Os três clones saem da saddle, que já resolve armazenamento e execução, e não são apps novos. Eles, junto com o gateway Getry, são os únicos aplicativos da família sem distribuição NENHUMA: nada de pacote npm publicável, nada de binário ou aplicativo nos assets do release, nada de extensão, nada de pacote NuGet ou Maven — existem apenas como sites, deployados por quem os hospeda; a biblioteca de cada um segue publicada nos registros, só o clone deployável em si não tem distribuição. A ingestão de treino roda em background neles.

| clone (modalidade de site deployado) | papel | o que contém | como deploya |
|---|---|---|---|
| 1. Vault | só armazenamento e persistência (sem running): guarda os DBs da rede e recebe os backups | a superfície web da família mais a camada de dados: DB unificado, mestre e shard por conta | zip completo do asset da release baixado e publicado no host de preferência, ou a versão Next gerada pela conversão automática |
| 2. Forge | só running (executa sem guardar a persistência da rede): roda qualquer binário com a engine Saddle | a superfície web mais o runtime de sandbox — emulação de computador virtual completo, loop estático | idem: zip do asset ou versão Next |
| 3. Foundry | armazenamento + execução juntos: roda, é uma sandbox e guarda — o runner completo, que executa processos de qualquer tipo de binário (docker, .exe, GHC, ASP, Node, Vue, Webpack, Babel, C++ compilado) com a engine do Saddle | a união das duas camadas anteriores no mesmo site | idem: zip do asset ou versão Next |
| 4. gateway-site (Getry) | a inferência da rede: sobe várias cópias de si para sustentar a concorrência; a gateway principal se alimenta desses clones e repassa a carga a eles | o app gateway deployável com o meta-modelo DevThink mascarado e as subrotas multimodais | pela skill própria (baixar o zip do asset, extrair, fazer o push no DB e o build do Next) ou pela conversão Next automática |

Os clones ganham nome próprio, curto, no estilo da família: as pastas no repo são vault, forge e foundry (sem hífen e sem underscore; nome com ponto só quando precisar de separador, como next.personalizado e os zips vault.web.&lt;versão&gt;.zip / vault.next.&lt;versão&gt;.zip).

**builds e backups dos clones** — cada clone deployável grava os próprios builds no DB do próprio site: o artefato construído fica catalogado no banco daquele site (tabela de build com versão, hash e data), e não em disco solto. Os backups dos builds e dos dados sobem, por sua vez, para o Vault (que guarda os DBs) e para o Foundry deployados na Vercel e na Netlify, que atuam como guardiões da rede e sustentam a concorrência: enquanto os clones ativos executam, os sites de guarda recebem as cópias de segurança com quorum de escrita e reconciliação diária.

**as engines do ecossistema: mais de 100, sem limite** — o parâmetro engine do catálogo de pacotes fixa as 60 engines do pipeline (a tabela abaixo), as chaves de engine do catálogo de runtime somam as 16 do package.10 (codebox a seguir) e o catálogo de IA entra por categoria sem teto; somadas, as engines passam de 100, e NÃO HÁ LIMITE de engine, biblioteca ou framework — entra tudo o que servir ao objetivo da plataforma (não tocar no computador da pessoa, rodar qualquer binário e garantir armazenamento e persistência), desde que o Node.js orquestre por trás; a preferência permanece com o Node.js, e duplicatas entre categorias se resolvem na adoção, mantendo uma entrada por conceito. Benchmark 2026: Bun venceu 8/14 testes, 52k req/s, boot 8-15ms — a aposta do dono confirmada; Node segue o mais estável. As 15 do orçamento oficial de engines levam o asterisco; a 15ª posição é o motor Saddle, que não é uma engine a mais: É o projeto de sandboxes do ecossistema (comparável ao E2B), com várias modalidades de execução (pod, local, VM+VNC). A compactação tar.xz + Brotli acompanha o orçamento como item adicional (+1). Regra por job: script/sandbox one-shot = Bun; serviço de rede/produção = Node LTS; transform = SWC/Babel; bundle = esbuild (dev)/Webpack (pesado); binário alheio = sandbox (motor Saddle)/Wasm.

| # | engine | papel |
|---|---|---|
| 1 | * Node.js (LTS) | orquestrador oficial (gateway, workflows, MCP servers) |
| 2 | npm | gerenciador e registro padrão da família |
| 3 | * Bun | engine rápida de scripts/sandbox (52k req/s, boot 8-15ms); packageManager dos manifests |
| 4 | * Deno 2 | alternativa segura (compatível Node, capabilities) |
| 5 | pnpm | workspaces com catálogo centralizado de versões e patches locais |
| 6 | Yarn | workspaces com hardlinks locais |
| 7 | cnpm | espelho de registro declarado nas chaves de engine |
| 8 | Corepack | fixação do gerenciador de pacotes dentro do manifesto |
| 9 | io.js | chave legada mantida por compatibilidade histórica |
| 10 | Bare | runtime leve embutido do catálogo-mestre |
| 11 | Teleport | engine de distribuição remota do catálogo-mestre |
| 12 | runtime | chave genérica presente no snapshot mais antigo do catálogo |
| 13 | TypeScript | compilador do ecossistema inteiro (TS nativo no Node, TS 7) |
| 14 | VS Code | host de extensões declarado nas chaves de engine |
| 15 | Chrome | piso de engine de browser do catálogo |
| 16 | Firefox | piso de engine de browser do catálogo |
| 17 | ECMAScript | piso de linguagem declarado nas engines do catálogo |
| 18 | * esbuild | bundler rápido do build de desenvolvimento (HMR) |
| 19 | * SWC | transpilação de TS/JSX em Rust para builds pesados |
| 20 | * Webpack | bundling pesado e frameworks embutidos gerenciados pelo Node |
| 21 | * Babel | transforms legados e plugins |
| 22 | Vite | build de desenvolvimento dos aplicativos |
| 23 | Rollup | empacotamento de bibliotecas |
| 24 | tsx | runner de TypeScript no desenvolvimento |
| 25 | * Wasmer/Wasm | execução de binários Wasm dentro da sandbox |
| 26 | WASI | alvo wasm32-wasi de builds nativos portáveis |
| 27 | * libgit2 (node-git) | objetos git sem shell: o VCS interno |
| 28 | * better-sqlite3 | storage local em edge, CLI e desktop |
| 29 | libSQL/Turso | driver de banco selecionável por variável |
| 30 | * mysql2 | driver MySQL dos DB-sites |
| 31 | * pg | driver PostgreSQL dos DB-sites |
| 32 | * Prisma | schema e ORM principal |
| 33 | * Drizzle | ORM SQL cru e leve |
| 34 | * Saddle (motor de sandbox) | o projeto de sandboxes do ecossistema, tipo E2B, com várias modalidades (pod, local, VM+VNC): roda qualquer binário (docker, .exe, GHC, ASP, Node, Vue, Webpack, Babel, C++ compilado); não é engine separada — É o motor Saddle |
| 35 | Docker | forma full de sandbox por container |
| 36 | gVisor (runsc) | isolamento de sandbox sem KVM (cold start ~200ms) |
| 37 | Firecracker | microVM quando há KVM |
| 38 | QEMU | bridge de virtualização do hardware virtual do Saddle |
| 39 | Caddy | servidor/edge próprio dos sites |
| 40 | WebGPU/WGSL | compute e render paralelos por shader |
| 41 | ONNX Runtime | inferência local quantizada int8, cacheada pela Cache API |
| 42 | WebCodecs | encode/decode de mídia com timestamping frame-exato |
| 43 | Web Audio/AudioWorklet | grafo de áudio e DSP em tempo real no navegador |
| 44 | ffmpeg | transcode e codecs (wasm para demonstração; binário completo em Python na sandbox) |
| 45 | Tone.js | engine de música sobre Web Audio |
| 46 | Three.js | render 3D da base sob a engine Versawase |
| 47 | Rapier | física 2D/3D em Rust/Wasm |
| 48 | Python/uv | treino pesado e binários em sandbox em background |
| 49 | Go | toolchain dos módulos Go |
| 50 | Rust/Cargo | crates pinadas com Cargo.lock versionado |
| 51 | PHP 8.3 + Swoole | ecossistema de referência |
| 52 | Ruby | ecossistema de publicação (gemspec) |
| 53 | Maven (JVM) | build e registro Maven |
| 54 | NuGet (.NET) | registro NuGet |
| 55 | C/C++ | núcleo de virtualização e monitor de GPU da frota virtual |
| 56 | GHC (Haskell) | binários compilados executados na sandbox |
| 57 | ASP | binários ASP executados na sandbox |
| 58 | HyperDHT | rede P2P validada por suite própria |
| 59 | WebRTC | transporte peer-a-peer |
| 60 | tar.xz -9 + Brotli | compactação oficial sobreposta do pipeline dos objetos git (+1 do orçamento) |

As chaves de engine de runtime do catálogo-mestre (package.10) — o campo engine aceita exatamente estas chaves, que formam a base declarada de runtimes e gerenciadores:

```text
bare, bun, chrome, cnpm, corepack, deno, ecmascript, firefox, iojs, node, npm, pnpm, teleport, typescript, vscode, yarn
```

**as engines de inteligência artificial** — o catálogo de IA não tem limite e entra por categoria, separado por vírgulas, dentro de codebox; nenhuma engine, biblioteca ou framework é restringida desde que sirva ao objetivo da plataforma.

```text
[1. Frameworks principais, core e performance de hardware]
PyTorch, TensorFlow, JAX, Safetensors, Keras, TF-Keras, MLX, PaddlePaddle, ONNX, OpenVINO, LiteRT, Core ML, ExecuTorch, Graphcore, Habana, Rust, unity-sentis, Burn, Candle, Tinygrad, Ivy, Flax, Haiku, Equinox, Orbax, Apache MXNet, Sonnet, Trax, Chainer, Darknet, Deeplearning4j, CNTK, TensorRT, PlaidML, NCNN, MNN, TNN, Aitemplate, OneFlow, MindSpore, MegEngine, Taichi, Halide, TVM, Apache TVM, Vowpal Wabbit, Shogun, H2O, Caffe, Caffe2, Singular, Singa, DyNet, Neon, Theano, Lasagne, Mocha, MatConvNet, OpenNN, Shark, ArrayFire, CuPy, Jittor, Triton, GGML, ggml-org, Vulkan Kompute, WebNN, WebGPU-torch, Node-Predict, m2cgen, ONNX Runtime, OpenXLA, XLA, Poplar, SynapseAI, ROCm, OneDNN, CuDNN, TensorRT-LLM, OpenCL, Vulkan, DirectML, SYCL, Heptagon, DaCe, Hidet, Enoki, Dr.Jit, Mitsuba, tiny-cuda-nn, Cutlass, CuBLAS, FlashAttention, Pallas, Jax-triton, Thinc, LibTorch, PyTorch-Geometric, DGL, Spektral, StellarGraph, CogDL, GraphVite, Great, DeepFindr, Graph-Learn, PyG, PyTorch-Lightning, Catalyst, Ignite, Accelerate, Composer, MosaicML

[2. LLMs, agentes e IA generativa]
Transformers, Diffusers, PEFT, GGUF, Llamafile, NeMo, Adapters, KerasHub, Microduck, DDUF, vLLM, TGI, CTranslate2, ExLlamaV2, SGLang, DeepSpeed-MII, LMDeploy, FastChat, PrivateGPT, LocalAI, Ollama, SkyPilot, Aphrodite Engine, LangChain, LlamaIndex, Haystack, AutoGen, CrewAI, LangGraph, DSPy, Semantic Kernel, PromptFlow, PydanticAI, Smolagents, SuperAGI, BabyAGI, MetaGPT, ChatDev, MemGPT, AgentGPT, Outlines, Guidance, Instructor, LMQL, Sglang-backend, Text-Generation-Webui, KoboldCPP, Aphrodite, Tabby, Continue, Copilot-cli, OpenDevin, SWE-agent, Mentat, Aider, Chat-with-MLX, Promptfoo, Ragas, TruLens, DeepEval, Phoenix, Giskard, LangFuse, OpenInference, LangSmith, Chainlit, Mesop, Gradio, Streamlit, Solara, Shiny-python, Panel, Taipy, Streamlit-fastapi, OpenLLMetry, LiteLLM, Braintrust, Langchain-Core, Langchain-Community, Langchain-Anthropic, Langchain-OpenAI, Ell-ai, Mirascope, Rig, Rig-Core, Burr, Hamilton, Swarm, OpenAI-Swarm, Bee-Agent-Framework, Pipecat, Livekit-Agents, Vocode, Daily-Transport, Phidata, Multi-Agent-Orchestrator, Langcorn, Camel, Langchain-Chroma, Llama-Parse, Unstructured, PyMuPDF, Marker, Docling, Nougat, Textract, PDFPlumber, PDFMiner, pypdf, Borb, Fitz, PyPDF2, Langchain-Groq

[3. Visão computacional e computação gráfica]
timm, OpenCLIP, PaddleOCR, OpenCV, Ultralytics, Detectron2, MMDetection, Supervision, Albumentations, Kornia, FiftyOne, MediaPipe, GluonCV, VisSL, Scikit-image, Pillow, ImageAI, BoofCV, SimpleCV, Mahotas, Caer, YoloNAS, Segment Anything, SAM2, GroundingDINO, YOLOv11, YOLOv10, RT-DETR, FastSAM, MobileSAM, DepthAnything, Marigold, ZoeDepth, MiDaS, ControlNet, IP-Adapter, AnimateDiff, Chronos, SVD, Stable-Video-Diffusion, Open-Sora, CogVideoX, HunyuanVideo, PyTorch3D, Kaolin, Nerfstudio, Instant-NGP, splatfacto, 3DGS, gsplat, Nerf, Mip-Nerf, NeRF-W, NeuS, Instant-mesh, TripoSR, SV3D, DreamGaussian, Point-E, Shap-E, MeshGraphNet, Open3D, Trimesh, PyMesh, Point-Cloud-Library, Laspy, PDAL, Rasterio, Earthpy, Segments-ai, Roboflow, LabelStudio, CVAT, VGG-Image-Annotator, Labelme, DeepLabCut, Sleap, Anipose, SimBa, DeepPose, OpenPose, MMPose, AlphaPose, ViTPose, RTMPose, Face-Alignment, InsightFace, DeepFace, Facenet-PyTorch, RetinaFace, Mediapipe-Face, Face-Recognition, Dlib, Face-EvoLVe, PyFeat, OpenFace, AffectNet, Emotion-Recognition, Torchvision, Imgaug, SimpleITK, Monai, PyAnatomy, NiBabel, Pydicom, Itk-snap, Nilearn, Mne-python

[4. NLP, tradução e semântica]
sentence-transformers, spacy, BERTopic, Flair, fastText, AllenNLP, Stanza, SpanMarker, paddlenlp, Transformers.js, setfit, Fairseq, NLTK, Gensim, TextBlob, Polyglot, Spark NLP, KeyBERT, Tiktoken, Tokenizers, CoreNLP, Pattern, Textacy, PyText, DeepPavlov, Farm, Rasa, Snips NLU, SacreBLEU, Rouge-score, Evaluate, Datasets, Huggingface-Hub, KenLM, SentencePiece, BPEmb, Moses, OpenNMT, MarianMT, Marian-Transformers, EasyNMT, PyTorch-NLP, TextAttack, AugLy, TextExtensionsForPandas, FlashText, PyICU, PyStemmer, Clustal, Levenshtein, FuzzyWuzzy, RapidFuzz, Jellyfish, TextDistance, Polyglot-NLP, SentiWordNet, VADER, TextBlob-FR, Spacy-transformers, GluonNLP, BlingFire, Word2Vec, GloVe, Fasttext-wheel, Top2Vec, BERTopic-Core, C-Transformers, Llama-cpp-python, MlX-lm, Outlines-core, Sqlglot, Sqlparse, Jinja2, MarkupSafe, PyYAML, Tomli, Iniconfig, Pluggy, Packaging, Typing-extensions, Annotated-types, Pydantic-core, Pydantic, Inflect, Unidecode, Anyascii, Slugify, Pyphen

[5. Áudio, fala e processamento de voz]
SpeechBrain, Asteroid, pyannote.audio, ESPnet, Whisper, WhisperX, Coqui TTS, Torchaudio, Silero VAD, RVC, Bark, Tortoise-TTS, Audiocraft, Descript Audio Codec, Librosa, Kaldi, Vosk, Pydub, SoundFile, Resampy, Pyttsx3, gTTS, Espeak-ng, Mimic3, Festival, MaryTTS, Mozilla-TTS, OpenTTS, Piper, ChatTTS, Fish-Speech, XTTS, StyleTTS2, MeloTTS, Kokoro, F5-TTS, CosyVoice, SenseVoice, FunASR, WeNet, DeepSpeech, Wav2Letter, Flashlight, PySimpleAudio, PyAudio, SoundDevice, SoundCard, Essentia, Aubio, Mir_eval, Madmom, Librosa-core, Audalign, Dejavu, Audio-Fingerprinting, Spleeter, Open-Unmix, Demucs, Wave-U-Net, PyTorch-Wavelets, Torch-Audio-Augmentations, Audiomentations, Pedalboard, Juce, Python-juce, Pretty_midi, Mido, Music21, Mingus, Lilypond, Abjad, Music-generation, Magenta, Note-seq, Chord-recognition, YAMNet, AudioSpectrogram, Praat-parselmouth, Parselmouth, Surfboard, DisVoice, OpenSmile, Meyda, WebRTC-VAD, PyVAD, Voice-Activity-Detection, Voice-Biometrics, Speaker-Recognition, DeepSpeaker, NeMo-ASR, NeMo-TTS

[6. Machine learning clássico, estatística e dados vetoriais]
Scikit-learn, Joblib, fastai, XGBoost, LightGBM, CatBoost, Polars, Pandas, Numpy, Dask, Vaex, Modin, PyCaret, TPOT, Auto-sklearn, Optuna, Rapids, Statsmodels, SciPy, Yellowbrick, Mlxtend, Sktime, Chroma, FAISS, Milvus, Qdrant, LanceDB, Weaviate, Pinecone, Pgvector, Marqo, Vespa, Elasticsearch, OpenSearch, ClickHouse, DuckDB, H2O-3, Driverless-AI, AutoGluon, FLAML, Hyperopt, Ray-Tune, Scikit-Optimize, Ax, Nevergrad, Spearmint, GPyOpt, BoTorch, SMAC3, ConfigSpace, Deap, Pygad, Inspyred, Platypus, Geatpy, JMetalPy, PyGMO, Scikit-learn-intelex, Intel-extension-for-transformers, IPEX, CuDF, CuML, CuGraph, Spatial-pandas, Geopandas, Shapely, PyProj, Fiona, Rasterio-core, Datashader, Holoviews, Bokeh, Plotly, Seaborn, Matplotlib, Graphviz, Pygraphviz, NetworkX, Snap-python, NetworKit, Igraph, Rustworkx, Graph-tool, Sknetwork, PyOD, Suod, Combo, PySAD, Alibi, SHAP, Captum, LIME, TreeInterpreter, InterpretML, Dalex, ELI5, Skater, Omnixai, Dice-ml

[7. Aprendizado por reforço, robótica e simulação]
stable-baselines3, ml-agents, sample-factory, Ray RLLib, Gymnasium, PettingZoo, Dopamine, Tianshou, CleanRL, ACME, MushroomRL, Keras-RL, Tensorforce, RLlib, TF-Agents, Garage, Horizon, Isaac-Gym, Isaac-Sim, Genesis, MuJoCo, PyBullet, Bullet-physics, ODE, Dart, Chrono, Drake, Webots, CoppeliaSim, V-REP, Gazebo, ROS2, PyMoCap, Pinocchio, Crocoddyl, CasADi, Acados, OMPL, MoveIt, OpenRAVE, PyRobot, Urdfpy, Trac_ik, SPlisHSPlasH, Taichi-elements, PhisX, Flex, Position-Based-Dynamics, Cloth-simulation, Soft-robotics, SoMo, Sofa-framework, OpenSim, Simbody, BioMechanics, Mujoco-menagerie, RoboSuite, ManiSkill, Orbit, Isaac-Lab, Orbit-Robotics, Gym-Anisopter, MineRL, Crafter, Procgen, Arcade-Learning-Environment, ViZDoom, Duckietown, AirSim, CARLA, DeepDrive, Highway-env, CommonRoad, Sumo, CityFlow, Flow-RL, MetaDrive, MadGames, StarCraft-II-API, PySC2, Pommerman, Hanabi-Learning-Environment, OpenSpiel, Suphx, AlphaZero-general, Chess-engine, Stockfish-python, Python-chess, Kaggle-environments, Lux-AI, Halite-AI, Sorenson

[8. MLOps, deploy e infraestrutura distribuída]
TensorBoard, Univa, MLflow, Weights & Biases, DVC, Kubeflow, BentoML, Seldon Core, ZenML, Neptune.ai, Arize, Comet ML, Aim, ClearML, FastAPI, Ray Serve, Horovod, DeepSpeed, Accelerate, Megatron-LM, PyTorch-Elastic, Torch-Distributed, Ray-Core, Ray-Data, Ray-Train, Slurm, Nomad, Kubernetes, Docker, Podman, Skypilot-core, RunAI, Anyscale, Modal, Replicate, Banana-dev, RunPod, Vast-ai, Lambda-labs, CoreWeave, Huggingface-Spaces, Render, Fly-io, Railway, Railway-deploy, Serverless-framework, OpenFaaS, Knative, AWS-Lambda, Google-Cloud-Functions, Azure-Functions, Serverless-llm, LocalStack, Terraform, Pulumi, Ansible, Chef, Puppet, Packer, Vagrant, K3s, Minikube, Kind, MicroK8s, Rancher, OpenShift, Argo-Workflows, Tekton, Jenkins, GitHub-Actions, GitLab-CI, CircleCI, Travis-CI, Bitbucket-Pipelines, Woodpecker, Drone, Gitea-Actions, Airflow, Prefect, Dagster, Mage-AI, Luigi, Kedro, Flyte, Oozie, Azkaban, Rundeck, Temporal, Camunda, Airbyte, Fivetran, Meltano, Stitch, Singer, dbt
```

**as bibliotecas de ícones** — o acervo carrega catorze conjuntos de ícones embutidos, os ícones oficiais da Microsoft (Fluent, nas variantes Fluent2 e WinUI3) e as demais famílias citadas pelas regras de interface; o repositório central de ícones serve todos os apps, com uma família por projeto e o repositório declarado na skill de design. NÃO HÁ LIMITE de biblioteca de ícones: entra a que servir, desde que o uso respeite a regra de uma família por projeto.

```text
Iconic, Phosphor, Hero (Heroicons), Feather, Meteor, Material, Basicons, Flowbite, Nonicons,
Sargam, Lucide, Mage, Fluent2 (Microsoft Fluent), WinUI3 (Microsoft),
hugeicons, radix-icons, tabler-icons, open-iconic
```

**os tipos de sandbox do saddle: mais de dez** — o Saddle concentra as modalidades de execução do ecossistema, e a plataforma adota a que serve ao objetivo em cada caso; os tipos somam mais de dez, listados na tabela, e nenhum deles toca no hardware da pessoa: tudo roda na internet, nos hosts que são sites runners, com comunicação por mime-types e HTTPS.

| Tipo de sandbox | Como funciona |
|---|---|
| 1. completa virtual | virtualiza driver, CPU, GPU e memória — tudo virtual, nos três perfis (max, balanced e lite) |
| 2. runner universal | o Saddle é a engine que roda qualquer sandbox e qualquer binário do mercado, inclusive os processos da própria plataforma |
| 3. pacotes Node | compila e roda via Node, Babel, Wasm, Webpack, Deno, Bun e as demais engines do catálogo, no padrão dos editores web |
| 4. container Docker | forma full por container, com Docker hardened (rede nenhuma, capabilities derrubadas, read-only, pids limitados, runtime runsc) |
| 5. container GHCR | a imagem publicada no GHCR, imutável, com a instância carregando UUID próprio (a CD de instalação versus o save game) |
| 6. microVM por workflow | imagem construída por workflow do GitHub a partir da árvore rootfs limpa, com o modificador de vCPU compilado e injetado, a ficha do processador virtual forçada por LD_PRELOAD, a pilha gráfica Mesa (OpenGL LLVMpipe, Vulkan Lavapipe, OpenCL Rusticl) e a tela virtual oculta do Xvfb, comprimida em estilo ISO e publicada no GHCR |
| 7. browser / virtual-browser | execução client-side no navegador real: WebContainer/StackBlitz, OPFS, WASM/SIMD, Web Worker e SharedArrayBuffer, nunca padrão e sempre opt-in |
| 8. mobile | sandbox em aparelho: Capacitor empacota a mesma interface; Termux em container; postmarketOS e Ubuntu Touch nativos |
| 9. confidencial | execução com atestado de hardware virtual (sevSnp/tdx/tpm) para cargas que exigem confidencialidade declarada |
| 10. QEMU / Firecracker | VM completa via QEMU (perfis max/balanced) e microVM via Firecracker quando há KVM; gVisor cobre o isolamento sem KVM (~200ms de cold start), com V8 isolates no serverless |
| 11. pod / local / VM+VNC | as três modalidades de execução do motor Saddle, herdadas da sandbox por conversa: pod efêmero, local opt-in e VM completa com VNC |
| 12. wasm/WASI | execução de binários Wasm dentro da sandbox (Wasmer, WasmEdge, WASI) para builds nativos portáveis |
| 13. local opt-in | modo local explícito com consentimento, que desabilita os pipelines de backend virtual e nunca é padrão |

**os três formatos de aplicativo (site e casa, next normal, next personalizado)** — a família tem exatamente um formato casa e dois modelos next, e nenhum aplicativo duplica pasta para ter versão next. a evidência que define os modelos vem da documentação oficial do next: a pasta src é opcional (o diretório app/ pode ficar na raiz do projeto, e src/ + app/ não podem existir ao mesmo tempo), a pasta public/ é opcional (só existe se houver assets estáticos) e a pasta de build é configurável via distDir. o formato casa segue o template padrão deste documento: o tema com o App.tsx dentro, ao lado do index.css e do index.html, e as lógicas .ts soltas na raiz do app. o next normal carrega src/, com o app/ dentro dela, e nasce sem as pastas dist, ui, public, assets, build e deploy. o next personalizado (next.personalizado) não tem src: é igual ao template da casa, só com a ponte app/ na raiz do projeto. cada formato tem a própria árvore desenhada na seção template padrão:

| modelo | regras |
|---|---|
| 1. site e casa (formato da casa) | o template da casa sem src: o tema com o App.tsx dentro, o index.css único, as cópias de deploy na pasta do tema e as lógicas .ts na raiz do app; é o formato de todos os aplicativos da família e o que a conversão automática usa como base |
| 1. Next padrão com as personalizações da casa | o Next normal do mercado com src e as regras da casa aplicadas: sem public/, sem dist/ (a pasta de build vai para onde distDir configurar), build compilado na raiz do dono; é o modelo que a conversão automática do workflow produz |
| 2. Next personalizado (next.personalizado) sem src | app/ na raiz do projeto, com a árvore da casa ao lado — as lógicas .ts na raiz, a pasta do tema ao lado do app/, e nenhuma src |

A honestidade técnica fecha a regra: uma árvore 100% sem nenhum diretório app/ ou pages/ o Next não aceita — o framework exige um dos dois — e, nesse caso, vale o modelo padrão com src, que passa a ser a única exceção aceita à raiz sem src; quem usa src mantém as mesmas regras de lógica correlata por dentro.

**o gateway getry e o bypass next** — o template é um só: o Getry, gateway de inferência com o meta-modelo DevThink mascarando os modelos reais, publicado com o kit universal de publicação (template e skill, prontos e sem defeitos). O clone deployável da gateway continua sendo o Getry e pega as rotas V1 a V7 e quantas precisarem. Ele tem os dois modelos: o padrão, que roda dentro da sandbox da Z.AI (com src e o app/ organizado pelas rotas v1, v2, v3, v4, v5), e o bypass, que roda fora da Z.AI e é a conversão do workflow — o bypass pode sair no modelo Next padrão sem as pastas que a plataforma costuma criar (sem dist, sem public, sem src quando der, sem ui) ou no modelo personalizado sem src. A skill de gateway opera em quatro passos: baixar o zip dos assets do repositório, descompactar, fazer o push no DB e fazer o build do Next; do lado da plataforma, a mensagem com as regras numa conversa em modo agente abre a sandbox, o agente cumpre a skill e o botão de publicar finaliza com o nome escolhido. O bypass existe porque a V1 da gateway só funciona dentro da sandbox da Z.AI: o SDK da plataforma exige o chat ID, o X-Session, o bearer token, o ID e o nome da sandbox e o ID do usuário, com o próprio captcha validando a abertura — e é exatamente essa dependência que o bypass elimina ao abrir mão do SDK e falar direto com os providers, funcionando no preview da sandbox da Z.AI, no Next normal e em qualquer host estático (Vercel, Netlify, GitHub Pages, Caddy próprio). cada sandbox publica do próprio jeito (a do Arena deploya na última etapa, por exemplo), e o mesmo par de modelos serve nas sandboxes do Arena, do DesignArena, do Figma e das demais plataformas, sempre com a comunicação via mime-types e HTTPS. A determinação do fluxo é determinística — não uma escolha arbitrária, e sim o caminho que o template percorre em toda publicação.

**conversão next automática (workflow inteligente)** — nenhum aplicativo da família duplica pasta para ter versão Next: o padrão é sempre a árvore sem src, e um workflow do GitHub converte o aplicativo na hora do build — move a superfície web para dentro de src/ quando o destino exige, gera os arquivos de scaffold Next e publica nos assets do release o zip completo do site (nomeado &lt;app&gt;.web.&lt;versão&gt;.zip, como vault.web.&lt;versão&gt;.zip) e o zip Next (nomeado &lt;app&gt;.next.&lt;versão&gt;.zip, como vault.next.&lt;versão&gt;.zip). As versões Next de TODOS os apps existem APENAS como zip nos assets do release: nenhuma pasta de versão Next existe no repositório. A conversão dispara junto da cadeia oficial de build (mudança de package.json/CHANGELOG → tag → release → assets) e é ela que permite deployar várias cópias no CI — várias do Vault e várias do Forge — sem custo de manutenção de pastas extras nos cerca de 30 aplicativos da família.

**workflow oficial de release** (vive em .github/workflows/release.yml): gatilho = modificação de package.json OU .gitignore OU CHANGELOG.md → release notes + build nas máquinas do GitHub. Matriz de assets (versão única do package.json): macOS .dmg (Apple Silicon/Intel) · Windows .exe (x64/ARM64) · Linux .deb/.rpm/.AppImage (x64/ARM64) · Android .apk · iOS .ipa. Jobs: build (matrix) → release (junta assets + notas e espelha no DB-site).

**paridade de superplataforma** — a mistura incorpora TODAS estas features, minimalista:

| Origem | Vira no DevThink |
|---|---|
| Cloudflare | dashboard de zona, DNS, WAF rulesets por fase, bots + pay-per-crawl, AI Crawl Control (Markdown p/ agentes), Workers/Pages/Containers/D1/KV/R2/AI Gateway, routes+cache auditável, Speed/Observatory, Ctrl+K |
| GitHub/GitLab | workflows YML, releases com assets por plataforma, PRs/issues/reviews, API keys/webhooks publicKey, marketplace |
| ChatGPT/Codex | chat com conectores, plugins store, agendadas, biblioteca; Codex: Environments/Tasks/Code review |
| GMI | model hub, playground com sliders, test routing (chips→slider custo-qualidade), agent marketplace |
| Brave | abas dentro do app, docks flutuantes, transparências, privacy-first |
| Z.AI/Grok/Manus/Bolt | sandbox por conversa (pod/local/VM+VNC), storage versionado, WS único, créditos |
| Akach (nosso) | editor de site completo + dashboard de controle da rede (páginas Editor + Rede) |

**regras de código**: Node.js é o orquestrador (15 engines no package.json), tudo TypeScript; frameworks pesados SÓ embutidos e gerenciados/compilados pelo Node (Webpack/Wasm/Babel/loader próprio). Prioridade de arquivos de framework: 1º YML, 2º Node.js/TS, 3º pacotes Node nativos de armazenamento, 4º hosts próprios (sites copiáveis e deployáveis). Controle total do usuário E da IA (via MCP) sobre CAD camadas, DAW mixagem, 3D rigs/malha/personagem. Codex entra como referência de interface.

**planos — só 3 + doações**: Free · Pro · Enterprise (= Enterprise+Sponsor) + página de Doações sempre visível. Hierarquias antigas (admins cooptados, sponsor separado, essencial intermediário e patrocínio remunerado como plano próprio) ficam só nas notas, marcadas como plano anterior. Componentes: PlanCards (3) + DonateBox.

**akach — o app editor de site do devthink** (a versão no ar está defasada): editor completo embutido (Pages, Files, Design dnd 9 blocos, Components 29 SYSTEM + GeminiChat, Content, Config, Trash) + **dashboard de controle da rede**: admin de TODOS os sites remotamente; mudanças de código continuam via repositório (Git LFS + libgit2), o painel é o controle visual. Páginas Editor + Rede lendo o mesmo backend (não substitui a CEDEL, sandbox virtual). Criadores: conta do dono + 4 co-criadores.

**cadria (editor de vídeo)** — referências: Photoshop, CorelDRAW, compositores (Nuke/Natron/Blender), pesquisados com a técnica das mil línguas/mil termos/Google Docs (mesma das 502 imagens: efeitos, textura, composição geométrica, espaçamento, camadas, seção por seção). **Design**: compacto, respiração Windows 11 (cantos 8-10px, acrílico/mica sutil, elevação 2 níveis, focus ring), nave bar flutuante (dock glass) + nave bar fixa (rail) coexistindo; mix Windows 10/11 + Codex + Trello + ZCode + T3 + Sinara + Apple Silicon + SaaS + Awwwards + Trylle; claro/escuro por tema; responsivo por ratio/DPI.

**catálogo neoskills — adoções** — cada skill mapeada no acervo e o que ela vira na plataforma. Do acervo inicial de 97 pastas, 89 são úteis; depois da fusão e da deduplicação ficam 104 pastas, com cerca de 95 úteis e 22 marcadas como lixo:

| Skill | Vira |
|---|---|
| webdev (control plane + capability catalog + checkpoints/publish com receipts) | espinha da plataforma — páginas Dev/Editor |
| workflow-composer + automation-and-scheduling + triggers | executor e constituição dos workflows YML + página Automations |
| webdev-periodic-updates (Heartbeat HTTP-cron vs AGENT cron) | 2º tipo de cron do Saddle |
| manus-api (tasks/webhooks publicKey/OAuth2 Open Apps) | spec da API pública (confirmAction = gate humano) |
| manus-config (connectors registry + review card) | página Connectors + gate de confirmação |
| github (10 capabilities granulares) | integração repos (PR/issue/release/secret/CI) |
| builtin-llm-models + data-api | catálogo e roteamento de LLM (Providers/Model Router) |
| agent-browser + computer-use + browser-use | as 3 engines de automação do Saddle (browser/nativo/QA) |
| chrome-devtools-mcp | auditoria das páginas do tema Sol (perf/a11y/LCP) |
| architecture (node:* first, library-first) | regras do orquestrador |
| design-premium + ui-ux-pro-max + autoclaw-design-capability | governança visual do tema Sol |
| memory (memória categorizada em arquivos) | memória da IA por usuário, versionada em Git LFS |
| persistent-computing (autoscale vs reserved vs VM/Docker) | decision engine de hosting das 3 modalidades |
| delivery-artifact + generative_ui | Canvas single-file + widgets vivos no chat |
| node-repl-host + zcode-runtime | kernels de execução (bridges browser/computer; delegação agente→agente) |
| mimosa (hooks de edição, guardas git, scan Ed25519) | segurança local-first |
| conf.d + financial-suite + agents-squad + deep-research + video2code + data-backup-restoration | templates de sandbox/produto/squad + features de produto |
| agentic-coding (PACT: contrato de aceitação, diffs mínimos) | protocolo de entrega do GLM-5.3-Flash |
| operação agentica/regras.txt (66KB) | [DOC] manual-mestre (raiz sem /src, tema universal, 1 workflow por responsabilidade) |
| inline (host de execução universal) | execução inline: node -e preferido, zero install, pacote ausente carrega de CDN em runtime, binários em test/bin/, automação de browser com observação semântica primeiro |

**regra de nomenclatura**: componente/feature nova só nasce a partir de (a) botão mapeado no catálogo de telas, ou (b) skill adotada na tabela acima. Os catálogos são o índice permanente.

**pipeline oficial de componentes** — como a IA (e o workflow YML de criação de site) constrói cada página, sempre no mesmo modelo. O App.tsx é o router: importa as subâncoras (uma por página). cada subâncora &lt;Pagina&gt;.tsx importa os componentes TSX da própria pasta. Na fase final, os componentes são FUNDIDOS dentro do subâncora (em vez de importados), agrupados hierarquicamente e em ordem alfabética — o accordion (A) fica acima do button (B), tudo num arquivo só, sem caminhos de import. O workflow YML segue exatamente essas 3 etapas, inclusive para os usuários da plataforma:

| etapa | o que acontece |
|---|---|
| 1. componentes isolados | a IA cria cada componente como arquivo TSX próprio, SOLTO na pasta da página (&lt;Pagina&gt;/&lt;Nome&gt;.tsx), com comentário # dizendo o que ele é |
| 2. Montagem da subâncora | a subâncora &lt;Pagina&gt;.tsx importa os componentes e monta a tela (rotas/paths gerenciados por ela) |
| 3. Fusão final | tudo é fundido DENTRO do subâncora: componentes agrupados hierárquica e alfabeticamente, sem imports — um arquivo só por página; os arquivos TSX isolados permanecem na pasta como fonte |

Regras do pipeline: cada componente TSX carrega comentário `#` com o que é (ex.: `// # Accordion — sanfona de seções colapsáveis`); lógicas correlatas agrupadas (a lógica DA animação e a lógica que FAZ a micro-interação funcionar vivem junto do componente); nada de pasta ui/, assets/, public/, dist/, src/ — componente vive na pasta da página. O site de biblioteca + a comunidade publicam e compartilham esses componentes (componentes, texturas, shaders) entre usuários — publica o componente, o outro instala na própria página.

**ícone animado com gradiente interno** — feature de design inovadora do tema Sol. O fundo que fica POR TRÁS do ícone (a caixa do index/card) é escolha do usuário (arredondado, círculo, etc.). O gradiente animado é DENTRO do glifo do ícone (como um PowerClip do CorelDRAW: o fundo de cores se mexe POR DENTRO do ícone, não por trás), e cada camada é um elemento empilhado com index próprio de camada (o z-index interno define a ordem: o glifo no index mais alto da pilha do ícone, o anel abaixo dele, o fundo externo no index mais baixo). O ícone é feito de CAMADAS animáveis (ex.: relógio = 2 ponteiros + anel do contorno — cada camada com animação e gradiente interno próprio):

| index da camada | camada do ícone | anima |
|---|---|---|
| 1 (topo da pilha) | Glifo/partes internas (ex.: ponteiros do relógio) | se mexe (rotação, pulso) + gradiente interno em movimento |
| 2 (meio) | Contorno/anel do ícone | animação de curva/traço + gradiente interno correndo |
| 3 (fundo da pilha) | Fundo externo (fora do glifo) | estático por padrão; formato e cor são escolha do usuário |

**skill de design completa (a criar no neoskills)** — mapear todos os efeitos, texturas, shaders e bibliotecas usáveis, com referência das bibliotecas de ícones (codebox acima) e dos ícones oficiais da Microsoft (Fluent), incluindo o ícone animado com gradiente interno descrito acima. Do painel de inserção do Framer já estão capturadas as bibliotecas de ícones, as oito categorias de elementos (Icons, Shaders, Media, Forms, Interactive, Social, Utility e Creative) e a seção de CMS com Collections e Fields. É esse catálogo que a skill carrega para a IA consultar na hora de gerar componentes.

**regras da família e da operação** — aqui entra a doutrina completa de operação da família de aplicativos, readaptada à arquitetura oficial e organizada por contexto correlato: operação do agente, git e CI, containers, código, banco de dados, segurança, gateway, engines, roster, construção, design, performance, memória, agentes e nomes. O que as regras acima já definem não se repete; quando um conceito reaparece em outro contexto, ele é mesclado na regra mais completa.

**operação do agente** (leitura, delegação, honestidade):

| regra |
|---|
| Data primeiro: consultar a data e usar o melhor padrão/versão DAQUELA data em cada etapa (deps no latest) |
| Ler TODOS os arquivos por segmentos sed -n 'X,Yp'; arquivos muito grandes se leem em segmentos grandes de 1.000 a 4.000 linhas, com grep para indexar marcadores e cabeçalhos antes da leitura dirigida, nunca carregando o arquivo inteiro e atribuindo cada trecho à sua fonte pelo marcador antes de mesclar; greps direcionados só para alvos específicos |
| Delegar subagentes ANTES de executar inline; arquivo local é último recurso; inline primeiro, arquivo por último; limpar temporários depois |
| Checklist interna no raciocínio (não em arquivo), agrupada por contexto, máx 10 por grupo |
| Nunca parar a operação aguardando autorização; trabalhar em paralelo durante esperas; nunca encerrar a mensagem durante polling |
| Analisar TODAS as falhas uma por uma, da mais recente à mais antiga; discrepância de leitura → verificação definitiva por subprocess/Python |
| Honestidade radical: reportar estado real, pendências e plano; erro do assistente anterior se corrige de verdade; nunca "pronto" sem prova de render ou teste verificável |
| Prova de execução: número só recebe o rótulo de medido quando vem de execução real sobre dados vinculados, com origem, divisão e proveniência registradas e rastreáveis; sem esse encadeamento, o resultado se declara simulado |
| Worklog compartilhado atualizado a cada task; cada agente escreve seu estágio; worklog fechado é critério de done |
| Nada se apaga: duplicado guarda com sufixo (2)(3); dedupe por hash mantendo a data mais recente |
| Verificar por etapa antes de avançar; verificar bytes reais (od/hexdump) antes de "corrigir" corrupção aparente |
| Arquivos de 22 a 24 mil linhas se leem em blocos entre subagentes com ownership disjunto, pulando nada |
| Sequência de execução da operação: 0 data e pesquisa → 1 ler todos os arquivos (dedupe de hashes idênticos antes) → 2 mapear regras por tema e categoria → 3 mapear features (até 4.000 por app, em versões, com checklist e tabelas) → 4 ler changelogs → 5 merge sem perda → 6 construir a interface (tema) → 7 construir a lógica de raiz → 8 deploy estático sem Functions → 9 container único → 10 bump até verde (0/0/0) → 11 arquivar e fechar (PRs arquivados, só main, worklog fechado, /tmp limpo) |

**git, identidade e ci/cd**:

| regra |
|---|
| Commits SEMPRE como iakadion (email 174824991+iakadion@users.noreply.github.com), nunca "Z User"; Conventional Commits (feat/fix/chore...); uma ação por commit |
| Device flow gh CLI: client_id 178c6fc778ccc68e1d6a, todos os escopos, token vitalício; NUNCA re-pollar após autorização (cada poll pós-auth invalida o token anterior) |
| Branch main protegida (required checks + 1 review + code-owner + linear + sem force-push/delete); PRs e branches arquivados com tag archive/prN — só a main permanece |
| Bump de dependência = commit direto no main + PR arquivado, SEM bump de produto; bump de produto SÓ com features; dependabot ecosystems npm/github-actions/docker |
| Actions pinados por TAG de versão (checkout@v7.0.1, setup-node@v7.0.0...), nunca SHA-40; imagens por tag, nunca digest (digest único não serve multi-arch) |
| Um workflow por responsabilidade, auto-contido; .github/actions/ PROIBIDA; dependabot.yml em .github/ (nunca em workflows/); secrets nunca em if: (usar env) |
| Cadeia família: push main com diff package.json+CHANGELOG → ci → release.yml (valida lockstep → cria tag → zip -9 + SHA256SUMS → release) → publishes via workflow_run com workflows: apontando pro NOME REAL |
| npm ci nunca install; lock ÚNICO (bun.lock OU package-lock.json); painéis 0/0/0 como critério de pronto; board só verde (runs vermelhas colaterais deletadas) |
| Loop de bump até tudo verde: bug → corrigir na raiz → bump → push → monitorar → repetir; npm imutável (publicou com erro → bump obrigatório); tag órfã deletar |
| Build/teste/hash SÓ nos computadores do GitHub; agente não gera binário nem roda bateria autoritativa; gates locais leves (tsc, biome, actionlint, YAML, lockstep) para sanidade |
| Testes reais em tests/ com node:test + node:assert, sem mocação; consumidor real no CI (pack → install → usar ESM/CJS/CLI/HTTP) |
| Lockstep de versão em TODOS os envelopes (~20-40: package.json, locks, Dockerfile OCI, pom, csproj, gemspec, Java/Cs, readmes, CHANGELOG) — gate dinâmico que LÊ package.json, nunca literal |
| CHANGELOG.md MAIÚSCULO com seção por versão (vira release notes); sem README de versão; histórico de linhagens fundidas verbatim |

**containers, builds e artefatos**:

| regra |
|---|
| UM Dockerfile cuida de TODO o contexto de container (docker-compose.yml e Dockerfile.full PROIBIDOS); container publicável é o principal (sem sufixo -web) |
| Multi-arch amd64/arm64 (+ppc64le/s390x); stages de build com FROM --platform=$BUILDPLATFORM (toolchain nativo, dist portável); QEMU sempre setado |
| Tags por versão/perfil :X.Y.Z, :X.Y.Z-balanced, :X.Y.Z-lite — SEM :latest, sem major.minor, sem rolling, sem sha256-*; label OCI org.opencontainers.image.version |
| Cache de REGISTRO ghcr.io/&lt;repo&gt;-buildcache mode=max (nunca type=gha); Trivy gate + provenance + SBOM; push direto multi-arch (nunca digest→merge); instalação de pacotes com retry (apt-get update+install, 5 tentativas) |
| PROIBIDO na raiz do repo: .apk, .ipa, container buildado, dist/, node_modules/, __pycache__/, zips/rars — artefato é asset da release |
| NENHUM hash SHA-256 hardcodado e nenhum digest fixo: as actions respondem pela TAG de versão, os digests de imagem viram tag também, e o hash (SHA256SUMS, .digest) se GERA no build e viaja nos assets do release; digest de asset resolvido em runtime via API do GitHub |
| Vulnerabilidade se resolve na RAIZ com overrides no package.json (não existem arquivos de ignore de scanner na família) |
| Timeouts 330/240; cleanup if: always(); não cancelar builds QEMU em andamento (monitorar e trabalhar em paralelo) |

**código TypeScript e limites**:

| regra |
|---|
| TS de ponta a ponta: escreve, testa e publica TS; JS só como emit no publish; Bun executa .ts direto; zero JS na interface (só TS/TSX/css/html) |
| Sintaxe erasável obrigatória (.ts roda nativo no Node 26 strip-types): PROIBIDO enum, namespace, parameter properties; imports relativos SEMPRE com extensão .ts explícita |
| TypeScript strict (noUncheckedIndexedAccess, noImplicitOverride, noFallthroughCasesInSwitch, noUnusedLocals/Parameters; target ES2022, moduleResolution bundler); proibido any (usar unknown + type guard) e @ts-ignore (usar @ts-expect-error justificado) |
| node:* nativo antes de pacote externo (externo só justificado em JSDoc); imutabilidade (as const, Readonly); funções puras preferidas |
| Limites: máx 300 lógicas correlatas por arquivo (0-100 típico); .ts ≤300 linhas; .tsx ≤500; ≤200 linhas = arquivo único; merge over split (repetido 2+ vira util/componente) |
| Biome formatador/linter padrão (aspas duplas, indent 2, organizeImports, lineWidth 100, semicolons asNeeded, trailingCommas all); pre-commit roda biome check --apply + tsc --noEmit |
| React 19+ funcional; estado global Zustand; TanStack Query; forms react-hook-form + zod; Tailwind utility-first com cn(); framer-motion; lucide-react |
| try/catch em todo ponto de I/O com erros tipados (code/details/cause; domínio em errors.ts); graceful shutdown SIGTERM→SIGKILL 10s; logs estruturados JSON com traceId, sem secrets |
| Minúsculas sem _/- em arquivos; camelCase em variáveis; UPPER_SNAKE_CASE em constantes/env; inglês no código e JSDoc; zero emoji |
| Nada hardcodado: env/DB/porta; host/porta sorteados e travados por sessão; porta aleatória de 1 a 1.000.000 travada após o sorteio; nunca localhost; tema vem do DB |
| Dead code com zero imports é deletado, mantendo integração futura válida; módulos úteis desmontados se reativam |

**banco de dados**:

| regra |
|---|
| Drizzle ORM + better-sqlite3 na execução; Prisma só como schema declarativo (provider sqlite); NENHUM .sql no repo; migrations geradas, gitignored, aplicadas em runtime/CI (idempotentes, nunca manuais, chaveadas por nome-base sem reexecutar o arquivo que já rodou) |
| Conexão via DATABASE_URL (dev file:./local.db, testes :memory:, prod Supabase Postgres); cliente singleton em database.ts; SQLite WAL + foreign_keys ON + busy timeout 5s |
| DB unificado entre sites/apps, nunca commitado; mestre + shard por conta; toda tabela: id cuid + timestamps; toda tabela de negócio tem userId/sandboxId (multi-tenancy; cross-tenant proibido salvo admin) |
| Blobs nunca no DB: upload → chunks 256KB com SHA-256 + compressão → catálogo app_library + binary_chunk; reuso automático em nova sandbox |
| Soft-delete preferido (deletedAt); hard-delete só GDPR (crypto-shred); onDelete Cascade/SetNull/Restrict; índice em toda FK e coluna filtrada; vacuum mensal |
| Sites replicáveis: replicação em M sites com quorum write N/2+1, leitura any-of-N, reconciliação diária, conflito last-write-wins |
| Toda query tipada, async, em try/catch, parameterized, sem SELECT *, com LIMIT/ORDER BY/tenant filter; pool 5 dev/20 prod; timeout 30s |
| Builds dos clones deployáveis ficam catalogados no DB do próprio site; backups sobem para o Vault e para o Foundry deployados na Vercel/Netlify |

**segurança**:

| regra |
|---|
| Secrets NUNCA em código (process.env/secret manager; .env gitignored + .env.example commitado; rotação 90 dias; AES-256-GCM + KMS para tokens em DB) |
| TLS 1.3 + HSTS preload + CSP estrita (default-src 'self'; wasm-unsafe-eval) + X-Frame-Options DENY + nosniff + Permissions-Policy; CORS só *.devthink.pro |
| Senhas argon2id (t=3, m=65536, p=4); session JWT 1h + refresh 30d com jti rotativo; logout → revoked_tokens; OAuth2 GitHub/Google/GitLab com state CSRF + PKCE |
| PII em coluna dedicada com log de acesso; nunca em logs/analytics/erros; direito ao esquecimento = cascade + crypto-shred; node:crypto para aleatoriedade (nunca Math.random) |
| Rate limit 60 req/min público / 1200 autenticado; egress de sandbox com allowlist; denylist de backend por extensão (.db/.sqlite/.log/fontes .ts nunca servidos) |
| Conformidade LGPD/GDPR/CCPA/COPPA/PCI-DSS; painéis 0/0/0; CodeQL semanal com fix real na fonte; SEV1 resposta &lt;15min; postmortem blameless |
| Sem captcha em NADA da plataforma (self-hosted, controle total); credencial exposta → catalogar para rotação, nunca replicar |

**gateway getry (inferência v1-v5)** — pipeline em 13 etapas: guard → cache → router → porter → júri → adapter → normalização → outlier removal → média ponderada → confidence → divergência → cascade → auditoria WORM:

| conceito | regra |
|---|---|
| Júri local | K=3 (pickDiverse shuffle+slice, timeout 8s, segue com K-1); peso 1/ECE clampado [0.1, 10]; divergência &gt;0.30 → cascade |
| Porter | réguas determinísticas (regex/allowlist/lookup/threshold) resolvem 80-90% a custo zero; risco &gt;0.85 → bloqueio incondicional |
| Fotocópia (cache) | sha256(state+questions): LRU in-memory hot + SQLite cold; TTL 24h verdicts/1h models/5min health; nunca pagar duas vezes |
| Banda cinza | 0.30-0.70: o sistema NUNCA age (não-ação consciente); semáforo verde &gt;0.70 executa / amarelo confirma / vermelho humano; "não sei" explícito: confidence &lt;0.30 → verdict unknown; parâmetros versionados por produto (strict/permissive) no DB, nunca hardcoded; tabela ação→{verde, amarelo} no DB; curva de confiabilidade pública com temperature scaling versionada com rollback; erro medido por lote continuamente e relatório de calibração por release; banda com escopo por campo (1 noul/campo no cascade) e aplicável ao júri (acordo = certeza); porta max com rate-limit de escala (anti-custo) e canal de alerta imediato; banda cinza documentada no Swagger V5 |
| Cascade | mini → verificador estreito (1 noul/campo) → médio/grande só no resíduo; V5 = verdict model destilado |
| Guard | 4 nouls de entrada (PII, injection, encoding, quota) + score de severidade de saída |
| Auditoria | WORM append-only com votos individuais persistidos; cadeia de hash hashPrev→hash; audit executável (vote DSL com quorum no DB) |
| Calibração | ECE 10 bins; Platt/temperature scaling; snapshot em calibration; recalibração noturna 02:00 UTC; sync de modelos free a cada 6h; RLCD como paradigma de treino (proibido otimizar bajulação) |
| Versões | V1 z.ai (sem chave, SÓ sandbox, headers X-Token+userId) · V2 Babel Town (chave) · V3 NVIDIA (22 chaves nvapi- LRU por useCount; modelo a cada 6 mensagens; 42+ modelos; SSE brace-depth parser) · V4 multi-provider (default; NVIDIA entende imagem/áudio nativo) · V5 destilado; V5-V8 o dono cria na duplicável por sandbox |
| API | Auth HMAC &lt;tenant&gt;.&lt;b64(hmac-sha256)&gt;; headers X-Tenant-Id/X-User-Id/X-Gateway-Version/X-Cache-Bust/X-Bypass-Adapter/Idempotency-Key; POST /v1/chat, GET /v1/models (nome completo; NVIDIA EOL = 410 Gone), /v1/verdict, /v3/keys (mascaradas), /health; subrotas multimodais /image /video /pdf /music /audio /embed /rerank |
| Só modelos free | pagos → HTTP 402; providers NVIDIA/Babel/OpenCode/Kilo + local para Doo; ordenação pelo Artificial Analysis Intelligence Index |
| Mecanismos-arquivo | um arquivo cada na raiz do getry: jury.ts, porter.ts+rules/, cache.ts, verdict.ts+prune.ts, gates.ts, weights.ts ("change weights, not proofs"), cascade.ts, evidence.ts (provas antes do juiz), guard.ts, memory.ts, trainer.ts, slicer.ts, doctree.ts, retrieve.ts, progressive.ts/summarizer.ts, models.ts, backoff.ts, circuit-breaker.ts, quota.ts, streaming.ts, mcp.ts, adapters/ |
| Números fixados | 98k+98k (2-calls thinking), keepalive 200ms, retry 2-8×, backoff 200ms-64s, jitter 75-125%, thinking sempre ligado, proibido thinking_instructions/format, max output 524288, 7 thinking levels, 3 mundos de reasoning normalizados, ordem SSE canônica input→reasoning→content→finish→[DONE] único |
| Anti-429/419 | retries com backoff exponencial + jitter, pacing 200-1200ms, mutex MAX_CONCURRENT, honra Retry-After; erros 401/422/429/529/410/404/timeout com tratamento próprio (410 remove modelo, 404 rotaciona, 529 backoff + próxima chave) |
| Hono + Bun | Hono (≠ Express, menor overhead edge), Bun no gateway (≠ Node), Drizzle + better-sqlite3, package.json ≤30-75 deps leves (1200+ pesadas no cdn.ts via esm.sh com cache Map), Prisma schema 400-500+ entradas |
| Operação da lib | UNRAR 7.x estático (unrar-free não abre RAR5); double-fork com setsid para background em sandbox; wormhole com janela de 24h e 100 downloads; validação tudo-verde-ou-nada: keys:register com as 22 chaves e dev server com resposta REAL antes de declarar pronto; segredos (chaves em texto plano, recovery codes) nunca entram em leitura, mescla ou reescrita — inventário apenas |

**engines da biblioteca** (engine mora em UM app; os demais importam a biblioteca publicada; sem dependência circular):

| engine | regras |
|---|---|
| Saddle (virtualização, no app saddle) | Docker no perfil light; QEMU/VM completa em max/balanced; perfis: max (8 vCPU, 1 vGPU, 16GB RAM, 100GB), balanceado (4/0.5/8; default humano), light (2/0/2; default free); OS convidados GrapheneOS/Linux/Omarchy/Android/Termux; portas 5300 DNS/8787 getry/5173 Vite; boot &lt;5s light &lt;15s max; isolamento namespaces+cgroups v2+seccomp+rootless; heartbeat 5s, 3 falhas → snapshot restore; vCPU quantum 10ms preemptivo; perfis são DADOS (registro no DB, não código); modules soltos: virtual.ts, virtualcpu.ts, virtualgpu.ts, virtualmemory.ts, scheduler.ts, isolation.ts, tiers.ts, server.ts, telemetry.ts...; roda QUALQUER binário (docker, .exe, GHC, ASP, Node, Vue, Webpack, Babel, C++ compilado) — emulação de computador virtual completo, loop estático; alimenta a 3ª modalidade de site (DB+Sandbox); os 13+ tipos de sandbox estão na seção de arquitetura oficial |
| Versawase (3D/vídeo, no cadria) | render Three.js WebGL/WebGPU (browser) e Vulkan (container); physics Rapier/Cannon/PhysX; MCP server de cena/mesh/material (JSON-RPC 2.0 + WS, HMAC/JWT, 60 req/min); alvos 60/30/15 FPS e 4K/1080p/720p por perfil; LOD automático; mesh 1M triângulos em max; referências Blender/needle.tools |
| Katexis (áudio/música, no debonair) | prompt → estruturas → render; WebAudio+AudioWorklet (browser), WASM (server); harmony/melody/rhythm/theory/instruments; MIDI in/out; WAV/MP3/OGG/FLAC; 44.1/48/96kHz; latência &lt;20ms, 64 vozes, 32 tracks; IA de música estilo FL Studio controlada pela LLM (ToneJS+Node); máquina de treinamento 7 camadas (coleta→decomposição→treino→inferência; samples SQLite+FAISS; FFT/STFT/MFCC/chroma; Faust DSP→WASM; ONNX int8) |
| Argan (DNS/rede, no app argan) | wire protocol DNS escrito à mão em TS (sem libs de DNS); zonas CRUD; registros A/AAAA/CNAME/MX/TXT/CAA/SRV/PTR; DNSSEC KSK+ZSK obrigatório em *.devthink.pro; DANE/TLSA; DoT 853; DoH 443; ACME DNS-01 wildcard; Handshake+PKARR; gateway de chat Doo↔sandbox via WS; &lt;5ms, 10.000 queries/s, TTL mínimo 60s |

**roster e páginas por app** (apps deletados PROIBIDOS de voltar: gl, owni, bob, iakadion, soodeska, cli-desktop, devthinkos, akash, create, nathlan, SoFlowX, soochimp, iukka — históricos absorvidos: e2ugh→saddle, gateway+extension+maene→devthink, iukka+create→cadria):

| app | páginas nativas (tema Sol/) |
|---|---|
| devthink (35) | Onboarding · Login · News · Audio · Video · Image · Notes · PhotoEditor · VideoEditor · Browser · Terminal · Files · Gallery · Connectors · Automations · Deploy · Security · Docs · Data · Music · Camera · Recorder · Mail · Calendar · Calculator · Maps · Store · Console · Gatewayview · Home · Notfound · Projects · Providers · Settings · Usage |
| saddle (15) | Onboarding · Login · Register · Home · Dashboard · Console · Playground · Architecture · Compute · Docs · Integrations · Metrics · Billing · Snapshots · NotFound |
| debonair (8) | Onboarding · Login · Mixer · Timeline · PianoRoll · Library · Master · Settings |
| cadria (8) | Onboarding · Login · Player · Timeline · Editor · Render · Library · Export |
| stealhead (7) | Onboarding · Login · Lobby · Match · Ranking · Inventory · Settings |
| argan (8) | Onboarding · Login · Dashboard · Zones · Records · Dnssec · Logs · Settings |
| getry (gateway deployável) | Playground · Monitor · Logs · Calibration · Providers + console |
| cobaia (nome PROVISÓRIO até o dono escolher o oficial; site de monetização da família, sem distribuição nenhuma — só site deployável) | Home · Pricing · Support · Apps · Legal · Blog · Notfound |

Regras de roster: devthink NÃO cria lógica de vídeo/imagem/3D/áudio — importa da biblioteca publicada (saddle, argan, katexis, versawase); saddle é SÓ virtualização (sem browser, sem gateway, sem features de OS); debonair/cadria têm nome de marketing próprio; stealhead importa versawase+katexis (lógicas só do jogo: partida, ranking, armas, mundo); argan usa o mesmo DB unificado em todos os sites; a conversa JÁ NASCE com sandbox (SpaceId/SandboxId/SessionId/MessageId provisionados automaticamente; chat = agente como sinônimos; a separação correta é conversa↔VM); Isolado é o modo padrão, Malha P2P e Navegador client-side são opt-in com consentimento.

Regras da cobaia (a superfície de monetização): a cobaia é um site REAL de conteúdo (home, pricing, support, apps, legal, blog, notfound) que carrega os planos MRR, os links de apoio (Sponsors/Ko-fi) e os slots de anúncio honestos, para que os sites da família fiquem limpos; a navegação entre os sites da família e a cobaia é VISÍVEL e opt-in (CTAs, faixa de apoio, deep links com UTM) — espelhamento invisível de cliques, iframes de anúncio ocultos e tráfego de bot contra páginas com anúncio são invalid traffic/click fraud nas políticas do Google AdSense/Ads e NUNCA entram na árvore; o script de anúncio só entra via env depois da aprovação, e os checkout links ficam em config local com estado vazio honesto até o dono preencher. Mesma árvore da família, um CSS só, zero subpastas, tudo em inglês (tradução gtx no runtime).

**pipeline de construção por app** (checklist de fases + ordem de dependências reais):

| fase | critério |
|---|---|
| 0 BASE | scaffold pelo TEMPLATE (92 soltos na raiz + condicionais 10+6); tema Sol/ completo (entrada + deploys + páginas); .github/ workflows auto-contidos |
| 1 LÓGICAS | .ts na raiz (1 arquivo = 1 responsabilidade, ≤300 correlatas por bloco); TS de ponta a ponta; zero hardcode; interface puxa da raiz, raiz nunca puxa da interface |
| 2 TEMA/DESIGN | &lt;Pagina&gt;/ só design; fundação de design aplicada tela a tela; 8 estados por componente; reduced-motion; focus-visible; AA verificado; prova de render antes de declarar pronto |
| 3 DADOS | Drizzle + better-sqlite3 (sem .sql no repo); DB unificado, nunca commitado; mestre + shard por conta |
| 4 BUILD/RELEASE | build/teste/hash só nos runners; release por bump; publicação nos registros (npm, GH-npm, GHCR, NuGet, Maven); mesma árvore em todo deploy; Dockerfile multi-arch |
| 5 GATES | painéis zerados 0/0/0; CHANGELOG por versão; bump até tudo verde; validação de gateway com resposta REAL antes de declarar pronto |

Ordem de construção: 1 argan (rede/DNS) → 2 gateway/getry (inferência) → 3 saddle (sandbox) → 4 debonair (katexis) → 5 cadria (versawase) → 6 stealhead (valida a biblioteca) → 7 devthink OS (o absorvedor final) → 8 clones deployáveis (Vault · Forge · Foundry · gateway Next). Gate de pronto: árvore 1:1 com o TEMPLATE, páginas com features documentadas, pipeline gateway verde, design com prova de render tela a tela, release publicada + site no subdomínio + clone funcionando.

**design fundação** (o design system fornecido é autoridade absoluta; o documento de design descreve o PORQUÊ de cada escolha):

| eixo | regra |
|---|---|
| Cor | OKLCH; tokens 3 tiers (primitivos/semânticos/por componente); arquitetura 3+3 (3 cores globais + 3 harmônicos por seção); 1 acento sinal por página (90/10); 1 gradiente por página; hue-gap &gt;20°; AA 4.5:1; status = dot (nunca fill); banidos indigo/roxo default, #000 chapado sem luz |
| Temas | Sol #0B0806/#F59E0B/#FFFBEB (default) + EMBER/TANGERINE · Cyber · Nature · Ocean · Obsidian; dark-first com rampa própria; troca via classe theme-* no html persistida em localStorage |
| Tipografia | tríade display/leitura/detalhe; máx 2 famílias + 1 script; display 700-900 (Syne, Clash Display, Outfit ExtraBold, Space Grotesk), leitura 400-500 (Outfit, Satoshi, Instrument Sans), mono em labels 8-11px com tracking; escala 12-72px; clamp(); 45-75ch; banidas Inter/Roboto/system-ui como identidade; fonte self-host com @fontsource, nunca Google Fonts link |
| Espaço | grid de 8 pontos; ritmo 24/32/48/64/96; seções 96-160px (py-24 a py-36); z-bands 0 atmosfera/10 conteúdo/20 consoles/50 barra fixa; anti-pirâmide (hero centrado + 3 cards banido); assimetria 60/40 |
| Geometria | escada de radius (chips pill → card 12-16 → médio 20-32 → hero 36-64 → painel 96-320, inner ≤ outer); 1 linguagem de borda por página; sombras layered-soft; glass = hex-alpha + blur ≥35% + hairline; liquid glass blur 20-24 + satur 200%; 1 fonte de luz por página; 1 textura por página |
| Movimento | micro ≤200ms; entradas 400-800ms com stagger 60-90ms; loops 8-30s; M3 cubic-bezier(0.2,0,0,1); easing: entrada decelerate, saída accelerate, ciclo spring; NUNCA linear em micro, NUNCA ease-in em entrada; animar a FUNÇÃO; interrupções em transform/opacity (nunca all); reduced-motion obrigatório; motion confirma estado (otimistic UI); 8 estados por componente (hover/focus/active/disabled/loading/error/empty/success) |
| Leis | 13 Leis por página: 1 cluster-herói ≤7 nós · 1 mega display · 1 cor sinal · 1 ghost (tint 8-25%, ≤30%) · 1 stamp orbitante · 1 borda quebrada · 1 card elevado em rail (center-pop) · 1 fonte de luz · inline-slot ≤2/linha · box-highlight ≤2 palavras · 1 tensão assinatura T-xxx · demo-live se vende social · IRL-mount com luz real |
| Diagramas | diagrama estrutural (fluxograma, mapa mental, gráfico radial, organograma) gerado por Playwright+CSS obedece a três leis de ferro: zero sobreposição (conector nunca cruza caixa nem texto), hierarquia visual obrigatória (nós primários maiores e mais fortes que os secundários, espaçamento entre grupos maior que o interno) e fundo pálido com cor saturada só em borda e texto; se toda caixa parece igual, o layout falhou |
| Ban lists P0 | boxception; grade igual; hero centrado + pill + 3 cards idênticos; glass+neon; fade-slide-up universal; muleta roxo-azul; emoji como ícone; Lorem ipsum; links mortos; copy "desbloquear/elevar/revolucionar"; em-dash overload; self-authorize READY; tells de IA 2026 auditar a zero-P0 antes de entregar ("awarded or redone") |
| Acessibilidade | WCAG 2.2 AA: HTML semântico, 1 H1, landmarks, focus visible (outline nunca none), focus trap em modals, drag-drop com alternativa de teclado, nunca sinal só por cor, prefers-reduced-motion/color-scheme respeitados; toque mínimo 44px (botões 56px) |
| Layout | mobile-first (360×640 → 768/1280/1920); sticky footer obrigatório; header 56px; sidebar 240/280px; command palette Ctrl+K; espinha NAV→HERO→PROVA→CLUSTER→CTA→FOOTER; seções consecutivas nunca repetem a fórmula; 1 tensão por eixo (~60 pares de conflito banidos) |
| Loading e inputs | thresholds: 0-300ms nada; 300ms-2s spinner/skeleton; 2-10s rotulado; 10-30s progresso com cancelar; 30s+ mensagem; 60s+ pausa; inputs de 40-44px com hairline, radius 6-8 e focus de 2px no acento com halo; validação on-blur; placeholder nunca substitui label |
| Touch set | lift −4px com sombra; press scale .94-.98; toggle-flip; squish no :active; wobble ±6°; pulse-on-send; live presence dot de 8px (máx 1 por view); entrada coreografada padrão riseIn 24→0px em 0,6s com stagger .05/.18/.31/.44s |
| Motion regulado | WCAG 2.2.2 (pausa para motion maior que 5s) e 2.3.1 (máx 3 flashes/s); reduced-motion remove motion-em-eixo mantendo crossfade; a View Transitions API não aplica reduced-motion sozinha; container queries cuidam da responsividade do componente; motion do jogo: stagger 40ms, micro 80ms, quick 150ms, fast 250ms, medium 350ms, slow 400ms, emphasis 500ms; scale floors modal 0.96/menu 0.97/tooltip 0.98 (nunca scale(0) na entrada); hit-area 44×44 |
| Tensões por app | devthink void-escuro × âmbar-Sol; saddle steel-instrumental × verde-lime (#0F1212 × #D4FF80); debonair estúdio-noir × âmbar-vácuo; cadria estúdio-escuro × oceano-ciano (#050811 × #06B6D4); stealhead LARANJA × AZUL-ESCURO; argan protocolo-escuro × verde-nature (#050B08 × #10B981); gateway terminal-void × fósforo-âmbar |
| Referência interna | desktop-OS no browser com 30 ViewModes e ~240 widgets, janelas radius 8, topbar com blur, 27 keyframes por ícone; o padrão do devthink segue esta referência elevada às 13 leis; heróis de shelf nomeados (SPLIT-RAIL, CINEMATIC-SANDWICH, FOTO-EDITORIAL, RHYTHM A/B, STAGE-SHELL, SPLAT-HERO, ANCHOR-FAN, PROMPT-STAGE, PAGE-IN-PAGE) |
| Receitas e entrega | as 14 receitas de tema (recipe-NNN.json: glassmorphism, cyber-glitch, iridescência, aurora, skeuomorfismo, retro-futurismo) são dados normativos consumidos pela árvore de temas; scan de emoji obrigatório na entrega; prova de render é quality-gate bloqueante |

**performance e observabilidade**:

| alvo | valor |
|---|---|
| Core Web Vitals | LCP &lt;2.5s · INP &lt;200ms · CLS &lt;0.1 · FCP &lt;1.8s · TTFB &lt;800ms; bundle inicial &lt;250KB gzipped |
| Cache assets | hash no nome → max-age=31536000, immutable; index.html no-cache; gzip/brotli &gt;1KB; sourcemaps off em produção |
| Gateway | p50 &lt;100ms / p95 &lt;500ms / p99 &lt;2s; 1000 req/s por instância; error rate &lt;0.1%; cache hit rate &gt;60%; porteiro 80-90% sem IA |
| Observabilidade | logs JSON 6 níveis com traceId/spanId; Prometheus /metrics (RED+USE); OpenTelemetry spans HTTP→DB→getry→provider; Sentry com PII sanitizada; health {status, version, uptime, db, providers, cache} |
| Lighthouse | perf &gt;90 · a11y &gt;95 · best practices &gt;95 · SEO &gt;95; profiling por release; benchmark de regressão em CI |

**memória n1/n2/n3 e storage fabric**:

| tier | papel |
|---|---|
| N1 (RAM) | interna do processo (SharedArrayBuffer + Buffer.allocUnsafe), latência microssegundos, nunca persiste segredos |
| N2 (quente) | OPFS + SQLite no host; sobrevive a reload; índices BM25 + HNSW; flush quando N1 atinge 80% |
| N3 (frio) | Git LFS / Releases / CDN / S3-R2; sobrevive a tudo; page-out quando N2 atinge 80%; eviction LRU (N2) / FIFO (N3) |

VFS com pager 64 bits BigInt; path sandbox:/mnt/data/; permissões POSIX virtuais; quota ~50GB; compressão transparente zstd; AES-256-GCM at rest; snapshot .vdr-snap diário para N3 + incremental + antes de operação destrutiva; retenção 7 diários/4 semanais/12 mensais; RTO 4h/RPO 24h; 1 banco por pessoa (mestre + shard); crypto-shred propaga para todas as tiers.

**doo, agentes e MCP**:

| aspecto | regra |
|---|---|
| Doo | IA virtual do sistema (doothink); ÚNICA entidade com nome hardcoded (com DevThink); conta própria kind='virtual' com sandbox perfil max; acessa engines via MCP; raciocina via getry V5; sempre inclui confidence + ece em respostas críticas; opção "não sei" explícita; anti-sycophancy (RLCD); subdomínio doo.devthink.pro |
| Agentes | instâncias de Doo com escopo e tools (agentId cuid, parentAgentId?, tools[], sandboxId); swarm.ts coordena em malha P2P (gossip, DHT, Raft/Paxos, heartbeat, split-brain detection); tasks enfileiradas com timeout 5min, retry 3× backoff exponencial, cancelamento cooperativo via AbortController |
| Tools | via MCP com JSON Schema; permissões read/write/network/admin com aprovação do usuário; perigosas (delete/format/reset) exigem confirmação explícita + 2FA para admin; toda invocação logada em tool_invocation |
| Subagentes da operação | até 3.000 em até 1.000 ondas com verificação a cada onda; 0-5 por frente com orquestrador mantendo TODO consolidada; 1 categoria/tema por subagente |
| Protocolos | A2A, AG-UI (+CrewAI/LangGraph/Mastra/Strands), ACP, MCP, Claude Agent SDK, CopilotKit (Slack/Discord/Teams/TG/WhatsApp), DeepSeek harness, Cloudflare sandbox, OpenSandbox, Cursor SDK, exa-mcp |
| Automação web | toda automação de IA web documenta capturas antes de codar o executor (conceito → summary → implementação → capturas); execução automática bloqueada por padrão; approval modal com diff/níveis de risco (allow once/always/deny); kill-switch de emergência |

**nomes e fusão**:

| aspecto | regra |
|---|---|
| Nome novo | raiz real do vocabulário técnico deformada de leve (dissolve, dolly, raccord); base inglês, sonoridade primeiro; nunca repetir terminações; validar na frase ("bota no ___") e em domínio/marca; só nomes oficiais, sem inventar app |
| Marca | DevThink (D e T maiúsculos em prosa); em código/paths minúsculo; IA do sistema = Doo; slogan "O sistema operacional virtual da internet."; subprodutos nunca carregam "devthink" no nome de marketing |
| Fusão | tudo para dentro sem duplicar; dois iguais viram um, nada se perde (App.tsx + App.tsx = um); fundido vira página/comando/lógica do hospedeiro; metadados convertidos; sinônimos num conceito único (chat = agente); vence o mais recente |
| Língua | corpo normativo pt-BR; código, comentários, JSDoc e docs técnicas em inglês; 3ª pessoa na prosa técnica; zero emoji; erro claro com próxima ação |
| Documentação | # por arquivo/pasta com o contexto (player.ts # player); doc de arquitetura é SÓ árvore (1 arquivo por linha, sem parágrafos); template padrão no topo do documento; docs sincronizados entre si |

**nomes aprovados e reservados do método** — adotados: DevThink, Saddle, Debonair, Stealhead, Argan, Versawase, Katexis, Cadria, Getry, Kinetra (editor/player de vídeo do cadria). Reservados (não adotados, nunca reusar): Kinetra-irmãos Luminage/Parallume/Raccorda, Coinwright, Commonroom, Mindvault, Artifact, Codex, Buildwell, Apertune, Meshara, Narrara, Loreweave, Stagecircuit, Phenak, Thaum, Disselve. Roster tem o 8º app ansi-art (arte ANSI; 21 .ts soltos + pasta ink-components/ — única exceção nominal permitida; páginas Editor/Gallery/Fonts/Convert/Export/Home; features do soochimp absorvidos; divergência registrada: aparece como `ansiart.ts` embutido no devthink quando não é app próprio).

**glossário mestre** — os termos canônicos que a operação inteira usa, com o significado exato de cada um:

| termo | significado |
|---|---|
| tree wins | em conflito, a árvore atual do repo vence sobre qualquer documento (SKILL.md &gt; árvore &gt; regras &gt; voz &gt; logs); conflito entre regras numeradas: a mais específica vence, empate → a mais recente do CHANGELOG; regra de tema nunca conflita com regra de raiz; se a árvore divergir do documento, a árvore vence e o doc se atualiza por bump; a skill vence até nova sessão; duas fontes divergentes → citar ambas no worklog e adotar a mais recente |
| sourced | nada inventado: toda regra vem dos arquivos de regras da plataforma |
| Engini virtual | doutrina anti-hardware: nenhuma execução toca hardware físico; CPU/GPU/memória 100% virtuais |
| Doo / Doot | IA virtual do sistema (doothink); único "usuário" hardcoded junto ao nome DevThink |
| sandbox explícita | toda pessoa (humana ou virtual) tem userId↔sandboxId 1:1; conta = sandbox ~50GB |
| $0 Infra | custo zero perpétuo: GitHub Releases, GitLab LFS, S3/R2 free tier, npm efêmero — salvo pagamento explícito |
| perfis max/balanced/lite | tamanhos de sandbox (max 8vCPU/1vGPU/16GB; balanceado 4/0.5/8 default; light 2/0/2) |
| 92 soltos | os 92 arquivos soltos na raiz de cada app (máximo documentado do template) |
| bloco condicional (10+6) | 10 arquivos só de sandbox/VM (QEMU) + 6 só de desktop nativo (Rust/Tauri), mutuamente exclusivos |
| envelope | manifesto de publicação por registro (package.json, pom, csproj, gemspec, Java/Cs) em lockstep |
| forjas | espelhos do .github (.gitlab, .forgejo) |
| SUPEREMA | template vigente: tema com nome real (Sol/), App.tsx self-mount, sem README no tema (evolução do template antigo com default/) |
| VDR / UMCF | Virtual Disk Runtime (pager BigInt 64 bits) / Unified Memory and Compute Fabric — storage fabric 3 tiers |
| N1/N2/N3 | memória RAM → OPFS+SQLite quente → Git LFS/Releases/CDN frio; quorum write N/2+1 nos sites replicáveis |
| .vdr-snap | snapshot do VFS (diário + incremental + antes de destruição) |
| ECE | Expected Calibration Error — métrica first-class de calibração do júri (10 bins, Platt scaling) |
| JEV + Nuclear-I/II/III | o juiz de casos (state+questions) e as 16 alternativas/3 pipelines completos do getry |
| banda cinza / porta max | 0.30-0.70 o sistema nunca age; &gt;0.85 bloqueio incondicional |
| porteiro / fotocópia | réguas determinísticas (80-90% custo 0) / cache sha256(state+questions) |
| meta-modelo / fusion | DevThink mascarando modelos reais; soma de janelas de contexto (3.1M-13.9M; V4 ~9M free) |
| 2-calls / 7 budgets | thinking emitido como 1ª requisição separada / 98k+98k em 7 níveis (none→max) |
| pure byte passthrough | mascarar só o nome do modelo, sem JSON.parse do stream |
| truncamento atômico | tool_calls + resultados cortados juntos (nunca separado) |
| lockstep | mesma versão em TODOS os envelopes (~20-40 arquivos), validada por gate que LÊ package.json |
| MimeType | domínios como runners (ponte sandbox↔site getry.devthink.pro); comunicação por mime-types + HTTPS |
| Xplorer | a loja de apps (conta=instalação instantânea shared-pointer) |
| Plano HD-Infinito | 30 soluções de armazenamento infinito (fuse/HF/sharding Drizzle/storage-as-RAM) |
| tag-free | regra inegociável: só modelos com tag free são roteados (pagos → 402) |
| tells de IA 2026 | lista viva de padrões-robô a auditar a zero-P0 antes de entregar |
| FARINHA MÁGICA | passe final de recalibração óptica do design (última fase do ciclo AUTO-AUDIT→REFACTOR→POLISH) |
| FLUXO-7 | pipeline de design: BRIEF → chain → estilo → HERO → mobiliário → LAWS-CHECK → OUTPUT |
| NeoImg / package.10 | 423 referências visuais (88,7% UI premiado) / catálogo de 21.818 pacotes npm em 40 categorias |
| dedup-manifest | deduplicação de manifests: 16.641 duplicatas deletadas / 6.474 mantidas |

**detalhes operacionais consolidados** — regras complementares da operação da família, consolidadas por contexto correlato. Os documentos da família se escrevem sem citar nome de arquivo nem caminho: o texto se explica por si, agrupado, hierárquico e linear, com as features e as regras sincronizadas entre si. A leitura do acervo segue segmentos lineares desde a linha zero — nada de leitura aleatória, e a leitura roda pelo terminal (sed de X a Y repetido até o fim) justamente para não acumular lixo do leitor de arquivos. A deduplicação usa hash e comparação byte a byte, com técnicas por nome, nome similar e nome semântico, começando sempre pelo menor arquivo e apagando o zip depois de extrair.

| tema | regra |
|---|---|
| Processamento | MimeTypes e protocolo HTTPS são a base da infraestrutura: todo processamento acontece via mime-types e WebSocket nos sites responsáveis (runners e sandbox), e a única coisa que consome a máquina do usuário é carregar a interface; a etapa final de tudo é a compilação em gzip cross-runtime, e pacotes Python entram via PyLogic com OCR e decodificação de imagem por pacotes Python+Node |
| Sandbox | o aplicativo já é uma sandbox; o runner compila em Wasm/Webpack/Babel; além dos 13+ tipos listados na arquitetura oficial, a plataforma cria 100+ modalidades novas (inclusive sandbox que emula sistema real simulando drivers de hardware/AVGPU/VCPU com OS em container); o binário de desktop, quando baixado, grava seus dados e DB em .config/.dev-tink |
| Template por tema | os arquivos de configuração de framework ficam na raiz do primeiro tema; os próximos temas carregam só as pastas de página (pasta = página = app), que se adaptam ao tema delas |
| Release | os builds de cada aplicativo são separados por processo: o workflow lança o release gradualmente à medida que cada um termina, sem esperar o conjunto inteiro; os clones deployáveis não levam distribuição alguma e carregam as duas versões nos assets, a normal e a Next, e o gateway sobe várias cópias para sustentar a concorrência |
| Controle remoto | a extensão DevThink controla o computador do dono remotamente quando há configuração manual (o host de controle é o próprio preview do chat do agente), com captura de imagem, controle total do DOM, conexão WebSocket e ID por operação; a captura de tela da operação usa a extensão |
| Interface do site | o site tem cara de OS: loading sempre com logo animada (animação na logo e no texto), navbar curvado com curvas voltadas para baixo, hero em slide com branco e LARANJA em efeito de vidro, seção seguinte com assets/pastas em movimento explicando a plataforma, micro-animação nas letras, prosa em terceira pessoa, e footer bem trabalhado com animação e curvas (SVG path, SVG inline, CSS inline e CSS Houdini); o módulo clean-URL entrega a barra limpa — hash vira path, index.html e rastreadores (utm_*, gclid, fbclid) saem via pushState com sincronia de canonical; cada tema ou agrupamento leva no máximo 100-200 passos derivados, hierárquicos e lineares |
| Planos e gateway | a hierarquia selada (Free, Pro, Enterprise) mapeia nas versões da gateway: Free usa V1-V3, Pro usa V4-V5 e Enterprise usa todas; a dúvida de design se resolve consultando a skill de design e explorando os sites de referência dela |
| Domínios | além dos subdomínios por app e funcionais, existe o plano de TLD alternativo via RFC 9476 e os TLDs P2P (PKARR/GNS/IPNS/Alfis) como alternativa futura |
| Segurança | o delete GDPR propaga para o VFS, N2, N3, DBs externos, caches de fotocópia e índices de embeddings; licenças por app: GPL-3.0-only para saddle, devthink e stealhead, MIT para argan, debonair, cadria e getry; chaves NVIDIA em texto plano são risco P0 e migram para env/DB antes de qualquer publish; telemetria sem PII com amostragem documentada; o atestado sigstore se verifica antes de confiar em binário; fingerprint de conta de IA só no cofre, nunca no código do produto |
| Gateway | fusion de contexto por versão: V1 3,1M / V2 4,2M / V3 9,3M / V4 13,9M / V5 10,5M (divergência registrada da V5 como unificada); a extensão absorvida trouxe 335 action kinds com injeção programática do pagebridge (nunca content_scripts declarativo) e o plugin de autenticação masquerade com OAuth loopback PKCE S256 |
| Saddle | bases de hardware real de referência: max (EPYC 9965, 192 núcleos, 1TiB, 8×B200), balanced (ThreadRipper 9995WX, 96 núcleos, 512GiB, 2×B200) e lite (Ryzen 9 9950X3D, 128GiB, RTX 5090); catálogo de hardware entra só via Pull Request com identidade real assada no runtime; camadas L1 RAM → L2 VRAM → L3 SQLite → L4 buckets; a imagem GHCR é imutável e a instância tem UUID próprio (a "CD de instalação" versus o "save game"); a imagem microVM se constrói por workflow próprio a partir da árvore rootfs limpa, com o modificador de vCPU compilado e injetado, a ficha do processador virtual forçada por LD_PRELOAD e compressão estilo ISO publicada no GHCR; a pilha gráfica de software entrega OpenGL LLVMpipe, Vulkan Lavapipe e OpenCL Rusticl sobre a tela virtual oculta do Xvfb; 3 tiers de execução: browser, node principal e container; API self-hosted node:http com mesh HMAC-SHA256 anti-replay |
| Memória | storage fabric VDR/UMCF com chunking de 16-64MB (SHA-256 + gzip), Supabase só de metadados com sharding de 50 mil por clone, e Hidra: 33 contas × 1TB = 33TB multi-link com self-healing e ~50 categorias de provedores; Git-as-Database com fórmula vencedora catalogada entre 112 (ingestão cega → transfor → replica → CDN, cifra por campo, assinatura Ed25519), Open Object com path endereçável por conteúdo e dreno de 60s (36 mil escritas/hora para 1M de contas), e os limites mapeados do GitHub (2GB por release, 5GB de LFS); a malha roda 5 sombras a cada 5s (reidratação + re-hash + expurgo assinado), o Nexus com pulse de 90s e commit-reveal Merkle, e o Omni Router faz balanceamento multi-LLM com circuit breaking e failover multi-cloud |

**publicação por aplicativo e pinning de dependências** — cada aplicativo publica o próprio pacote, e os workflows executam todo o ciclo de publicação; os pacotes da família vivem mesclados e otimizados no monorepo:

| tema | regra |
|---|---|
| Publicação por aplicativo | cada app publica o próprio pacote no npm e nas distribuições (GitHub Packages, GHCR, NuGet, Maven, RubyGems, jsDelivr); os workflows YML executam o ciclo completo (gatilho por mudança de manifesto, build nas máquinas do GitHub, release com assets por plataforma) |
| Biblioteca hospedada | a biblioteca de cada app mora no seu app e é importada pelos demais como workspace:*; nenhum pacote fica solto na raiz; scripts de produto ficam soltos na raiz flat do app, e scripts de auditoria/pipeline nunca entram no repo de produto |
| Idade mínima de release | nenhuma dependência recém-publicada entra no build: npm exige 7 dias de idade; bun, pnpm e uv exigem 3 dias; exceções apenas por allowlist nominal documentada (SDKs de IA, toolchains de empacotamento, binários de browser) |
| Scripts de build | os scripts de ciclo de vida são opt-in por allowlist nominal (esbuild, sharp, @tailwindcss/oxide, @swc/core, better-sqlite3, node-pty, protobufjs, koffi, msgpackr-extract, unrs-resolver); o npm roda com ignore-scripts=true, fund=false e audit=false |
| Espelhamento triplo | dependencies, devDependencies e overrides carregam o mesmo conjunto e versão, com overrides autorreferentes ($pacote) forçando resolução única; overrides de segurança usam sintaxe de range por CVE para forçar a versão corrigida |
| Manifestos | packageManager sempre pinado (bun, yarn, pnpm, npm entre os perfis) e um lockfile por manifesto; políticas .npmrc: prefer-online, prefer-dedupe, cache-min 0, auto-install-peers, strict-peer-dependencies desligada, fetch-retries 5 e cache-integrity (instalação offline-proof), com comentários documentando o porquê de cada flag |
| bunfig e pnpm | bunfig.toml fixa install exact=true, linker hoisted ou isolated por projeto, test root isolado (nunca rodar testes da raiz) e sourcemap external; o workspace do pnpm centraliza versões com o protocolo catalog, patches locais versionados e tolerância controlada (peerDependencyRules, packageExtensions, supportedArchitectures) |
| Python e demais | locks de Python 100% exatos (==) com fork vendado travando pacote e commit upstream juntos e bump por CVE documentado em comentário; Deno com nodeModulesDir manual e compatibilidade Node seletiva; Go com versão exata no go.mod; crates pinadas com Cargo.lock versionado |
| Catálogo-mestre | o npm inteiro se expressa como um package.json válido, com snapshots medidos de 2.140 a 31.317 pacotes; pacotes sem release viram referência github:dono/repo (cerca de 9 mil); mapa nome→repo com 19.690 entradas; catálogo de use-cases com 21.818 pacotes em 40 categorias e dedup por SHA-256 com eleição de guardião |
| Template de app | 435 dependências idênticas em 8 apps (dependencies = devDependencies = overrides = 435; sideEffects false; type module; engines node &gt;=26.2.0 e bun &gt;=1.4.0; 12 scripts canônicos); apps de infraestrutura declaram apenas devDependencies — o runtime é o próprio Node/Bun, com TS nativo sem transpilador |
| Pins fixados | node ^26.8.2, bun ^1.4.2, deno ^2.9.5, typescript ^5.8.0, npm ^12.1.0; faiss-node ^0.5.1, hnswlib-node ^3.0.0, onnxruntime-node ^1.31.0-dev; jest ^30.5.2 / vitest ^5.0.1, playwright ^1.63; eslint ^10.11 (+unicorn, security), prettier ^3.9.9, biome ^2.5.14 |

**operação de leitura e consolidação do acervo** — a leitura de arquivos grandes ou de muitos arquivos se divide entre subagentes na primeira rodada:

| aspecto | regra |
|---|---|
| Delegação inicial | 0 a 100 subagentes na primeira rodada, não em rodadas separadas; arquivos grandes se fatiam em 30 ou 100 partes iguais, da linha 0 até a última, separando cada parte de linha X até linha Y |
| Ferramentas | somente grep, glob, offset e limit, pelos comandos do terminal e do git; nenhum arquivo ou pasta temporária — a regra vale também para os subagentes |
| Arquivos muito grandes | a leitura roda por sed no terminal, em segmentos grandes de 1.000 a 4.000 linhas, com grep para indexar marcadores e cabeçalhos antes da leitura dirigida; nunca se carrega o arquivo inteiro, e cada trecho lido se atribui à sua fonte pelo marcador antes de qualquer mesclagem |
| Verificação | verificadores de blocos e gaps capturam itens únicos ainda não cobertos; subagentes assíncronos filtram conteúdo, contexto e lógica em todo o arquivo |
| Agregação | extrair, filtrar e agregar todo o conteúdo citado sem omitir nada; regenerar o documento agrupado por categoria, de forma unificada e sem omissões, seguido do resumo; a operação se refaz quantas vezes for preciso, com máxima atenção |
| Escopo | ler primeiro todas as skills; ler todos os arquivos de todos os formatos; pastas de conversas 1 a 9 por completo (a leitura nunca para no meio); a pasta 10 se ignora por tamanho; as pastas messy 2, 4 e 5 se excluem |
| Execução incremental | todo artefato se grava no disco no momento em que fica pronto, um artefato por turno, com arquivos de checkpoint por etapa; a retomada lê o que está no disco e continua do ponto exato, sem refazer trabalho já pronto e sem tentar produzir tudo numa única tacada |
| README histórico | ler todos os READMEs existentes e todos os commits que os tocaram (mapear com git log, recuperar com git show), incluindo versões em txt e conteúdo movido ou excluído |
| Escrita | sem rollback: adiciona-se ao arquivo atual tudo o que falta, sem reverter versão alguma; nenhuma citação de pasta, documento, caminho exato, nome ou numeração de commit no texto; sentidos iguais e sinônimos viram instância única; parágrafo de categoria → subtítulos seguidos imediatamente por tabelas |
| Checklist hierárquica | toda operação deriva de uma premissa e se desdobra em checklist com começo, meio e fim; cada tema chega a 100 passos otimizados e sem redundância, e cada sub-derivação produz outros 100 próprios; a etapa final revisa todas as partes e organiza o resultado em todo list profissional |

**login, CLI e sincronização** — a CLI e a plataforma compartilham conta, sessão e fluxo de entrada:

| aspecto | regra |
|---|---|
| Primeira entrada | o design se desbloqueia na primeira entrada e a pessoa pode logar tanto na CLI quanto na plataforma; sem login, cria-se usuário temporário com ID aleatório que nunca é excluído |
| Código temporário | a CLI abre um link temporário no GitHub Pages (só a CLI cria páginas temporárias — origem restrita por CORS/X-Origin); a pessoa digita na CLI o número de usuário e o código temporário exibidos; sem verificação por e-mail (sem SMTP); definida uma senha, o código temporário deixa de ser necessário |
| Sincronização | CLI e interface sincronizam por chamadas HTTPS constantes nas duas direções, para nunca faltar dado de workspace ou sessão; o botão "conectar com a CLI" inicia a comunicação inteligente |
| Identificadores | o ID de usuário pode ser numérico, alfanumérico ou personalizado; nome de chat e de workspace são personalizáveis e renomeáveis, atualizando o banco local e o banco da interface; aleatoriedade curta (pequena, média ou grande, com no máximo 15 caracteres) |
| Conexão invisível | porta e IDs de sessão, conversa e workspace são subentendidos e opcionais na confirmação — as APIs se comunicam sozinhas pelos métodos HTTPS, mime-types e content types (incluindo gRPC), enviando porta, sessão e usuário na conexão |
| Configuração | a configuração da CLI deriva da referência do opencode; o plugin zai documenta o próprio bypass de captcha na pasta do plugin |

**execução, run state e jogo** — o runtime da plataforma e o jogo compartilham a máquina de estados e o consentimento:

| aspecto | regra |
|---|---|
| Consentimento | toda ação passa por gates de consentimento em 3 passos (sessão viva → plano aprovado → origem concedida) antes de qualquer dispatch, com deny-by-default e revogação que encerra em qualquer ponto; a IA nunca participa da autenticação (determinístico por regra, com gates humanos); recovery codes ficam congelados |
| Cofre | tokens em cofre AES-256-GCM com chave derivada, apenas em memória, com hash sha-256 em repouso, logout que revoga server-side e lockout progressivo; teste de key-shape no bundle; RBAC admin/operator/viewer/auditor |
| Run state | máquina de estados completa (queued/running/paused/awaitingapproval/completed/failed/cancelled/rolledback); checkpoints com page digest; rollback com compensações tipadas; killswitch killall sempre disponível; fila offline com replay monotônico |
| Jogo | servidor autoritativo nas sandboxes; anti-cheat em camadas (régua + modelo) com rollback de ranking suspeito; DB-first: o bundle inteiro vive no DB, o cliente cai para IndexedDB offline e sincroniza ao voltar, warm-on-play (joga uma vez, estruturas gravadas, próximo boot pega pronto), GLB-only com Draco/Meshopt/KTX2, física determinística em WASM compartilhada, tick único com rollback, join/state a 12 Hz com interpolação de 100ms; sem servidor o jogo roda single-player com bots locais e reconecta sozinho, com PWA nos players |

**features consolidadas por aplicativo** — o detalhe por página vive nos catálogos de componentes; aqui fica o consolidado de features por app:

| App | Features consolidadas |
|---|---|
| devthink | onboarding full-bleed 9:16 sem moldura de celular com matriz de first-run em 10 vetores; busca universal com ~92 lógicas de comando (FTS SQLite, glob, stream-parse em worker pool, BM25+HNSW, Ctrl+P) com resultado percebido em &lt;200ms; Terminal com 20 modos e config de 4 chaves com autoupdate:false permanente; Audio com voz→texto em matriz (MediaRecorder, AudioWorklet, VAD por RMS, Web Speech, OPFS) e ASR Whisper ONNX int8; Video com player universal de 12 módulos e 6 providers; Notes em 3 colunas com markdown, autosave de 3-5s e sync revision+tombstone; PhotoEditor não-destrutivo em árvore de histórico com remoção de fundo em matriz; VideoEditor com timeline multi-trilha de 56px e corte fatiado de 10s (preview = final); Browser com abas solo/vinculadas, docking e multi-perfil sandbox por aba; Files com MemoryEngine de 8 backends e StorageRAMBridge com PagedBuffer de 50 páginas; Deploy com autopilot CI de 6 fases e supervisor de ressurreição; Gatewayview com mapa de nós e júri ao vivo de 3 votos |
| saddle | modelo da caixa de 8GB com vm.swappiness=180 e zram 3:1 (8→24GB efetivo); 15 contratos serializáveis deny-by-default; mode resolver de 7 eixos; 38 assets de release em 7 registros; 26 modelos free no catálogo; bucket-as-VRAM é impossível — dito com honestidade |
| debonair | interface FL Studio com todos os botões controlados pela LLM (meta-modelo mascarado) via Tone.js e pacotes Node; 5 produtos (biblioteca de composição TS com 16 gêneros e 13 escalas; app gerador web com 11 estilos; DAW local com análise 100% local e embeddings de 32 dimensões; analisador/reconstrutor browser com JSON Mestre de 82 parâmetros; spec de plataforma de 45 telas); Mixer com máscara notch e faders com gauge anel; Timeline com trilhas de 56px e snap magnético de 0,55s; PianoRoll com grade tnum e velocity por opacidade; Library com SQLite+FAISS e preview em hover ≤200ms; Master com cadeia de slots, presets por gênero, loudness honesto e A/B |
| cadria | player universal com 12 módulos de responsabilidade única, 6 providers com factory (HTML5, YouTube, Vimeo, HLS, DASH, Embed), AudioEngine em cadeia, filtros WGSL, EQ de 7 presets + EBU R128, plugin system de 6 tipos, offline IndexedDB e bindings React/Vue/Svelte; ~1.465 features no catálogo (codecs, WebGPU, 3D no editor); render fatiado de 10s com WebGPU paralelo e estimate honesto; export em 1080×1080/1350/1920, 16:9 e 9:16; transições com nome de técnica real de cinema (lap-dissolve/raccord) |
| stealhead | FFA first to 30 kills ou líder a 300s; velocidades 4,57/2,44/1,01 m/s (sprint 7,01; tac-sprint 8,38); WaveDirector com countdown de 3,5s, squads a cada 1,8s e interwave de 7s; smart spawn de 14 tentativas a 34-100m; XP verbatim (kill 100; Double 100 → Kill Chain &gt;8 = 2000); canon de inimigos (drone 30hp → overlord 1200); HUD com chips de vida/kills/dinheiro, bússola 000-359, radar com sweep, killfeed dwell 5,6s, barra de vida roxa, munição 62px, hitmarker 34px com scale 1,35→0,9 em 180ms, binding zero-render a 60fps sem React e placas chanfradas "0.1 PIXEL"; boot em 11 passos; gates em 10 passos + 13 métricas; servidor node:http + ws na mesma porta; editor-first (F2 abre/fecha, clique seleciona por raycast, G/R/S move/rotaciona/escala, painel com BAKE→DB, Web Blender com Tab PLAY vs EDIT, CSG, remesh manifold, LOD meshopt, bake KTX2); ingest de 4.912 assets (937,9 MB) com integrity_check ok |
| argan | servidor DNS UDP/TCP com wire format manual (RFC 1035) e 20+ tipos de record; DNSSEC sign/validate com ZSK/KSK ECDSA P-256; DS/KSK 2371 algo 13; ACME step-ca; Handshake HSD nas portas 12037-5350; HyperDHT testado com suite de 245 ações; webadmin de 5 abas; 10 canais P2P de propagação (jsDelivr, Tor, Hypercore, BEP44, Nostr, IPFS, mirrors git, PublicFreeSuffix PR, extensão MV3, unbound) |
| getry | console de 54 telas com tema terminal-void × fósforo-âmbar; 10 playgrounds (Verdict, Chat, Júri, Cascade, Guard, Risk, Boletim, Cache, Memory, Calibration); catálogo de 23 features; deploy Docker na 8787 com Prisma pinado em 7.10.0; herança de 18 rotas repassadoras, 7 thinking levels e autofix Levenshtein; canary de 1% para a próxima versão com A/B; rotas que estouram o limite de profundidade da árvore plana colapsam em rota catch-all com os módulos na pasta interna; o release carrega os artefatos nomeados por versão, com os zips &lt;app&gt;.web.&lt;versão&gt;.zip e &lt;app&gt;.next.&lt;versão&gt;.zip, o SHA256SUMS, as release notes e o manifesto de artefatos |

**detalhes de engine do catálogo** — complementos das 60 engines:

| Engine | Detalhe |
|---|---|
| pnpm | gate de idade mínima de release nas instalações |
| Yarn | release do próprio gerenciador vendada no repositório |
| Vite | configs pinadas (react, tailwindcss, tsconfigPaths) |
| Three.js | r186 com WebGPURenderer e fallback |
| HyperDHT | validado por suite própria de 245 ações |
| WebRTC | dual datachannels, coop e signaling por polling |
| Python/uv | gate exclude-newer nas instalações |
| Go | go.mod entre 1.15 e 1.26.5; TUI de referência |
| PHP 8.3 | ext-pdo e ext-swoole no ecossistema de referência |
| gVisor | cerca de 300 syscalls com cold start de ~200ms |
| Caddy | serve o diretório do aplicativo |
| QEMU | bridge de virtualização dos artefatos de hardware virtual do Saddle |

**checklist de 12 pontos antes de entregar arquitetura ou código**:

| # | Ponto |
|---|---|
| 1 | deploy estático-only com Prisma/Drizzle/MySQL2/Socket, sem Functions |
| 2 | infra aberta: nunca localhost, sem IP/porta fixa, host+porta sorteados e travados, 100% escolha do usuário, opções no DB |
| 3 | estrutura root-first sem src, pastas de tema + docs + tests + forjas, nomes lowercase, inglês, sem emoji |
| 4 | arquitetura de 3 camadas, lógica agrupada hierarquicamente, um arquivo uma responsabilidade, interface puxa só da raiz |
| 5 | biblioteca multi-modo, TypeScript primeiro, nativo antes de externo, memória interna |
| 6 | um manifesto por linguagem, versões em lockstep, o mais simples e robusto, últimas pesquisadas |
| 7 | nada hardcoded no código: parametrizado ou no DB; biblioteca universal com config |
| 8 | builds, testes e hashes só nos computadores do GitHub; Dockerfile único; tags, não SHAs; raiz limpa |
| 9 | bump até verde, tags imutáveis, CHANGELOG por versão, painéis 0/0/0 |
| 10 | design: texto na caixa, grid rígido, sem poeira, toque de 44px, premium nunca genérico |
| 11 | estilo: lowercase, sem underscore/hífen, camelCase, JSDoc, 3ª pessoa, zero emoji, error catcher |
| 12 | usuário com escolha total; conta = sandbox; self-hosted; nenhuma regra rígida forçada |

**arquitetura de biblioteca e execução inline** — o aplicativo nasce sempre como biblioteca e depois se converte para cada destino, com pares sem/com em todos os modos. A memória interna é a memória prioritária: o app guarda o próprio estado dentro de si e nunca fica preso a um único runtime. A linguagem de código é TypeScript e cada modo recebe o formato que precisa, aceitando qualquer framework equivalente ou melhor que os exemplos.

| Modo | Formatos (exemplos; vale o equivalente melhor otimizado) |
|---|---|
| Biblioteca e pacotes | npm, pnpm, yarn, bun, NuGet, Maven, RubyGems, PyPI, Cargo, Go modules, Dart pub, Composer, Gradle, Homebrew, Chocolatey, winget, snap, flatpak, Helm, OCI/container, MCP, VSIX, PowerShell, tarball, plugins, container Docker |
| Aplicação desktop | Tauri, Ionic, Bun; .exe/.msi/.msix (Windows), .deb/.rpm/.AppImage/.snap/.flatpak (Linux), .app/.dmg/.pkg (macOS) |
| Mobile | Capacitor, Tauri, Ionic, Bun; APK/AAB (Android), IPA (iOS); postmarketOS e Ubuntu Touch nativos, Termux em container |
| CLI | binário Bun/Tauri; a mesma interface TSX renderizada no terminal |
| Site | Vite, Vitest, React, Vue, Svelte, Express; HTML, CSS, JS, WASM, PWA, SSR/SSG |
| Extensão de navegador | CRX, XPI, SAFARIEXTZ para Chrome, Firefox, Safari e Opera |
| Rede | fetch, WebSocket, Socket, gRPC, HTTP/REST nos runtimes browser, node e bun |
| Interface e headless | DOM, Canvas, WebGL, GTK, Qt, SwiftUI como superfícies; puppeteer/playwright para execução sem tela |

As três camadas de âncoras organizam qualquer projeto direto na raiz. A camada 1 é o roteador universal (a âncora global App.tsx), que importa e exporta apenas as sub-rotas da camada 2. A camada 2 é o roteador local: cada recurso mora em sua pasta na raiz e o arquivo de entrada tem o mesmo nome da pasta (homônimo). A camada 3 são os componentes locais de apoio, privados, que apenas o roteador local da própria pasta importa — ficam fechados para as outras pastas. Dentro de cada arquivo a lógica fica agrupada por contexto em blocos hierárquicos, com lógica embutida, imports mínimos e dependências de CDN quando possível.

| Regra de estrutura | Detalhe |
|---|---|
| NBIT (independência de build) | um catálogo centraliza as versões (no Android, gradle/libs.versions.toml) e a configuração do módulo consome o catálogo por notação de pontos; nenhuma string de versão solta no código |
| Compilação direta pela raiz | as pastas de código se mapeiam no bloco sourceSets do build (java.srcDirs/kotlin.srcDirs no Android), eliminando caminhos aninhados; os arquivos ficam visíveis na raiz e compilam sob o mesmo namespace |
| Nomenclatura de apoio | arquivos secundários dentro da pasta usam o ponto como separador (ex.: audio.database, beat.synthesizer); underscore e hífen nunca; no máximo um ponto para nome secundário |
| Forjas espelho | .gitlab, .forgejo, .codeberg, .woodpecker e .gitea espelham o .github com os mesmos workflows adaptados por forja; a referência é o .github |
| Scripts auxiliares | os scripts da família vivem DENTRO do app devthink, em devthink/tests/scripts, padronizados em TypeScript; nada de pasta scripts na raiz do monorepo; demais apps mantêm os próprios scripts em tests/ e tests/scripts/ (não-JS: PowerShell, Python, shell); nomes minúsculos dependentes de contexto; sempre autorizados em qualquer etapa do fluxo |

A execução preferencial é inline: rodar e escrever por dentro (terminal ou raciocínio), com o arquivo como último recurso. Antes de qualquer tarefa a lista de tarefas agrupadas se constrói no raciocínio, com no máximo 10 por grupo correlato; o fluxo é checklist → delegar subagentes → executar inline → arquivo por último → limpar temporários. Dependência já instalada roda direto; a que não está importa de CDN em runtime, sem re-buscar o que já existe, e o sistema nunca instala nada global nem sai do diretório atual procurando credenciais.

| Execução inline | Regra |
|---|---|
| Script inline | node -e e node --input-type=module -e com saída no terminal; CJS, JS, TS, MJS e Python suportados; runner local só para tarefa complexa (escreve, roda, apaga) |
| CDNs | importável vai para esm.sh, esm.run ou jspm; binário de CLI para jsDelivr e unpkg; biblioteca curada para cdnjs; CDNs mortos (Skypack, esm.build, bundle.run, statically.io) se ignoram; na falha, tenta o próximo CDN |
| Binários | download e armazenamento só em test/bin/&lt;programa&gt;/, nunca global nem na raiz; localiza o executável pelo campo bin do package.json e roda offline depois de baixado |
| Navegador | automação no navegador real logado via perfil persistente (os cookies carregam) ou via navegador remoto por WebSocket; stealth quando houver anti-bot; renderização hospedada quando não houver código de browser |
| Catálogo inline | playwright/puppeteer(+extra) e agent-browser para browser; z-ai-web-dev-sdk para leitura e busca; axios/fetch, cheerio/jsdom, lodash/dayjs, commander/dotenv/yaml/zod/p-limit, express/ws, sharp/pdf-lib/exceljs/papaparse/marked/prettier/glob como imports de CDN |
| Design de engenharia | texto justo na caixa (linha ajustada ao limite real, zero folga sem função física, quebra de linha tratada), grade e margens fixas, nada de log falso ou poeira gráfica, toque de 44px, hover rápido, transição scramble ao ler dados e corte visual veloz na troca de telas |

**contratos de experimento e figuras** — quando a operação produz documentos de pesquisa, medição ou pacote de experimento, ela segue contratos explícitos antes de gerar qualquer saída: o contrato de dados registra a pergunta de pesquisa, o tipo de tarefa, a variável alvo, a rota do dataset (fornecido, descoberto, reutilizado, controlado ou sintético), a fonte com identificador estável (DOI/accession/URL), a versão, a licença, os arquivos usados, o protocolo de divisão treino/validação/teste com riscos de vazamento e as notas de reuso; um resultado só recebe o rótulo de medido quando o código rodou de verdade sobre dados não simulados e a proveniência aponta para a execução. O contrato de figura define antes do traço: a conclusão central em uma frase com verbo, o arquétipo (grade quantitativa, composição esquemática, prancha de imagem + quantitativo ou figura assimétrica mista), o mapa de painéis com um herói e controles visualmente mais discretos, as estatísticas necessárias e o risco de revisão; toda figura nasce vetorial com fonte embutida, legenda que se explica sozinha em 1-3 frases, marca d'água de simulado quando for o caso e manifest com o roteiro gerador ao lado do render. A auditoria de entrega verifica citações órfãs, cobertura temporal do corpus, páginas e caixas de texto transbordando — caixa transbordada se corrige, nunca se tolera.

# regras por app — catálogo oficial da família

cada aplicativo da família carrega as próprias regras detalhadas, numeradas de forma estável. as regras gerais mandam para a família inteira; as daqui descem ao detalhe de cada app e, quando são mais específicas, prevalecem sobre as gerais. a numeração APP-xxxx funciona como índice permanente: serve para citar uma regra em trabalho, em revisão e nos workflows, e não muda quando a regra evolui — muda só o texto. as adaptações à arquitetura oficial já estão aplicadas no próprio texto: as cópias de deploy vivem dentro da pasta do tema, e a página é a pasta com componentes soltos.

### catálogo por aplicativo

## devthink (APP-0001 a APP-0245)

| id | regra condensada |
|---|---|
| APP-0001 | devthink é o OS/superplataforma que engloba todos os demais apps; "DevThink" na apresentação, "devthink" técnico (`@wenathlan/devthink`). |
| APP-0002 | absorva devthinkos, cli-desktop, SoFlowX, akash, extension, gateway e maene no devthink e embuta owni — fusão sem perda, nada apagado. |
| APP-0003 | não implemente lógica própria de vídeo/imagem/3D/áudio no devthink: importe das bibliotecas publicadas (saddle, argan, katexis, versawase). |
| APP-0004 | saddle é a sandbox e VM runner do devthink; devthink nunca roda sandbox própria. |
| APP-0005 | publique o devthink em todos os registros (npmjs, GH-npm, GHCR, Maven, NuGet, RubyGems); mesma interface em tudo: CLI = web = TV. |
| APP-0006 | navegador interno tem nome DevThink e é app nativo do OS. |
| APP-0007 | 35 páginas nativas no tema; news é página (News/News.tsx), não feed externo. |
| APP-0008 | páginas como pastas-âncora: Onboarding/, Login/, News/, Audio/, Video/, Image/, Notes/, PhotoEditor/, VideoEditor/, Browser/, Terminal/, Files/, Gallery/. |
| APP-0009 | complete o tema com Connectors/, Automations/, Deploy/, Security/, Docs/, Data/, Music/, Camera/, Recorder/, Mail/, Calendar/, Calculator/, Maps/. |
| APP-0010 | feche o tema com Store/, Console/, Gatewayview/, Home/, Notfound/, Projects/, Providers/, Settings/, Usage/. |
| APP-0011 | mesma página renderizada em todos os alvos (web, TV landscape, Capacitor portrait, desktop Tauri, extensão): um design só, muda só responsividade. |
| APP-0012 | roteamento por `app.tsx` universal (camada 1) carregando entrypoints de pasta (camada 2); App.tsx self-mount sem main.tsx. |
| APP-0013 | cada página = 1 pasta isolada com TODOS os componentes embutidos; pasta recebe o nome da página. |
| APP-0014 | agrupe 30–40 lógicas correlatas por arquivo/página/pasta; nomes-palavra-chave diretos, sem underscore/hífen/pontos; subcomponentes entre parênteses. |
| APP-0015 | descreva spec sem código: codeboxes descrevem tela→componentes→fluxo (readme por página), nunca implementação. |
| APP-0016 | provisione automaticamente SpaceId, SandboxId (VM), SessionId e MessageId por conversa — a conversa já nasce com sandbox. |
| APP-0017 | chat = agente são sinônimos ("chat turbinado"); separação correta é conversa↔VM, nunca chat↔agente. |
| APP-0018 | vM da conversa via StackBlitz WebContainer ou Docker microVM — virtualização 100% lógica, sem hardware físico. |
| APP-0019 | banco isolado por conversa (Drizzle ORM + Prisma Schema); 15–40 DBs estáticos provisionados por usuário novo, mais os DBs das sandboxes. |
| APP-0020 | settings persistidos por user id em Drizzle. |
| APP-0021 | chat embute: terminal xterm com monitor de processos, browser headless com stream + inspector de rede, editor Monaco com diffs. |
| APP-0022 | approval modal com diff/comando e níveis de risco (allow once / allow always / deny) antes de toda ação sensível. |
| APP-0023 | kill-switch de emergência mata processos da VM e cancela chamadas de API, com restore/export/resume de checkpoint. |
| APP-0024 | execução automática bloqueada por padrão; escopo por site HTTPS; parada e revogação sempre disponíveis ("Controle antes da ação"). |
| APP-0025 | documente as 8 Telas Mestras: Runtime Dashboard; Workspace & Agent Environment (Ubuntu 24.04, git, port forwarding); Reasoning Prompt & Multi-Model Dispatcher (thinking slider low→max); Extensions & Connectors Hub (MCP por URL/JSON); Automations & Scheduled Cron; Artifacts & Storage Library; Banco de Dados relacional; +. |
| APP-0026 | 45 telas / 3.420 componentes em 9 grupos: público/auth ~340, onboarding ~210, chat-agente ~820, projetos/computação ~410, conectores/MCP ~390, automações ~360, biblioteca/multimodal ~380, segurança/auditoria ~270, configurações ~240. |
| APP-0027 | jornada: Landing → Auth OAuth (GitHub/Google/Discord) → Welcome → Tour Magnético → Importador de Memórias → Chat com VM automática → terminal/browser/editor embutidos → checkpoint humano → kill-switch → Projects/Connectors/Automations/Library/Security/Settings. |
| APP-0028 | iDs SpaceId/SandboxId/SessionId/MessageId criados automaticamente por conversa (dicionário oficial). |
| APP-0029 | tour Magnético = onboarding guiado com spotlight que abre pop-ups e mostra onde clicar. |
| APP-0030 | matriz de Equivalências: Ambiente de execução = My Computer/Sandbox/Environment-Coder/Container/VM; Workspace = Projetos/Codespace; Extensibilidade = Plugins/Conectores/MCP/Tools; Habilidades = Skills/System Instructions; Agendados = Scheduled/Cron; Biblioteca = Library/Gallery/Armazenamento; Risco = Aprovações/Checkpoints. |
| APP-0031 | replique o OCR das 6 referências: Manus (telas 1–48), Grok/xAI (37–41), Z.ai/GLM (49–60), Qwen (61–83), Google AI Studio (84–87), ChatGPT/Codex (88–99). |
| APP-0032 | dB Drizzle/Postgres: users (open_id, role), browser_connections, browser_sessions (escopo JSONB), automation_plans (steps JSONB; status draft→approved→in_progress→completed), automation_checkpoints (is_destructive, required_human_approval, approved_by), automation_executions (runtime cloud_vm\|browser_extension; state queued/running/paused/stopped/failed/success), automation_audit_events (payload JSONB), automation_policies. |
| APP-0033 | substitua rotas legadas (`/`, `/plans`, `/operations`, `/security`, `/audit`) pelas páginas consolidadas do tema. |
| APP-0034 | consolide 45 telas → 60 pastas (~90–100 comp/tela) → 14 master pages → 7 master core hubs: landing, auth, onboarding, workspace (mega core: chat+agent+microvm+ide+browser+git+studio), bots (integrações+mcp+cron+webhooks), explorer (streaming discovery+library+deploy+forks), settings (customizer+security+telemetry+memory+audit+keys). |
| APP-0035 | mescle páginas sinônimas sem excluir features: projects=workspace; connectors=bots=automações; studio=projects; telemetry+security→settings; explorer engloba library — embuta, não corte. |
| APP-0036 | reduza 70–80% das páginas duplicadas mesclando equivalentes (fundir sem excluir features). |
| APP-0037 | posicionamento: "GitHub + provedor de inferência + computação com interface de streaming/lazer". |
| APP-0038 | estética final: liquid glass, acrylic mica, dark claymorphism, cantos de onda 28px, omnibox estilo browser, shelves estilo Netflix. |
| APP-0039 | uI: sidebars flutuantes magnéticas (esquerda/direita/topbar configurável), cantos curva/onda 24–32px, design compacto, micro-componentes dentro de macro, branco/preto/escuro; sem pílulas/dots quadrados. |
| APP-0040 | referências estéticas: Chrome, Brave, Opera GX, X/Twitter, Windows, Webflow 2006; navegação tipo app de streaming (YouTube/Netflix/Prime). |
| APP-0041 | anime ícones por dentro; expandir animado na caixa de pesquisa e de chat. |
| APP-0042 | sidebars ESQUERDA+DIREITA repositionáveis (fixáveis em settings) e magnéticas — preferência declarada do dono. |
| APP-0043 | tools é aba catálogo de ferramentas ISOLADAS (equalizador etc.), âncora `tools.tsx` — não pasta para guardar coisas. |
| APP-0044 | renderização 3D, notas, código e site builder são áreas/abas do Creator Studio. |
| APP-0045 | creator Studio v2.0 "Industrial Pro": Void Black #050505, Zinc Deep #09090b, Zinc Surface #18181b, acento gradiente orange-500→red-600, Cyan=código, Purple=áudio, Green=visual, glassmorphism no topnav, rounded-2xl/3xl. |
| APP-0046 | abas estilo OS para multitask: Video Editor, Audio Workstation (Mixer, EffectsRack, Transport), 3D Studio (R3F, SceneGraph, MaterialEditor), Canvas (Artboard, Layers, Toolbar), Code IDE (Monaco + FileExplorer + PreviewPane), Site Builder (LivePreview, StylePanel, ComponentLib), Notes (BlockEditor + AIAssistant). |
| APP-0047 | cada editor tem: chat próprio de IA, nodes próprio (nodes.tsx + nodeslogic.ts), encoder.ts, calculator.ts, toolbar e export. |
| APP-0048 | /tools com 60+ ferramentas (assetgen, audioconverter, formatconverter, imageresizer, imageupscaler IA, colorpalettegen, qrcodegen, textsummarizer…). |
| APP-0049 | explore com 15+ categorias (vídeo, áudio, 3D, canvas, notes, site, tools, code, models IA, live, trending, shorts/reels, music, chat, ads). |
| APP-0050 | /lab é laboratório meta-aba: container que aceita múltiplos componentes; multi-select na barra de abas (Ctrl+Click); arrastar seleção cria laboratório. |
| APP-0051 | fusion Engine entre abas: Transferir/Mesclar/Integrar/Sincronizar via drag de aba sobre aba; clonagem seletiva; camadas híbridas; universal detach (painel→janela→aba sincronizada). |
| APP-0052 | persistência crash-proof: mouse parado 3s dispara salvamento; JSON de estado vai para session_state; login em outro dispositivo reabre abas injetando estados; heartbeat com pings. |
| APP-0053 | renderização em tempo real premium: preview É o vídeo final; play inicia export em background; processamento em chunks de 10s com bytes originais intactos e fatias paralelas. |
| APP-0054 | python/C++/C#/Java embutidos dentro de TypeScript via manipulação de bytes. |
| APP-0055 | streaming social sem vídeo: stream de ações JSON via WebSocket; navegador do espectador reconstrói a tela (Motor de Replay); qualidade infinita com banda mínima; gravação de live gera MP4. |
| APP-0056 | áudio social WebRTC estilo Discord Stage. |
| APP-0057 | storage híbrido com 50+ file hosts (alfafile, gofile.io, pixeldrain, katfile, turbobit, 1fichier, media.cm, krakenfiles, 0x0.st, filebin, temp.sh, workupload, megaup, wormhole.app…). |
| APP-0058 | detecte nuvem própria do usuário (GDrive/Mega/Dropbox): envie pra nuvem dele, salve só o link, calcule economia em cashback; senão escolha o host mais disponível; free é obrigado a conectar nuvem própria. |
| APP-0059 | pastas do storage em 3 camadas: (user id)/(categoria da aba)/(nome do projeto como arquivo); projeto é arquivo de log; duplicados viram (1),(2); subpasta = álbum/coleção; lixeira por project id; thumbnails em GIF. |
| APP-0060 | logs de treinamento são propriedade da plataforma: nuvem privada, invisível, inapagável pelo usuário; estrutura (user id)/(contexto)/(categoria)/arquivo.json. |
| APP-0061 | 17+ servidores: ads, signin, signup, storage, stripeservice, subscribe, subscribeswitch, useadmin, web, share, monitoring, allsubscriptionscount, filehost (gateway 50+ hosts), session, retrospective, streaming (WebSocket), voice (WebRTC), windgets (admin), sharding (federation), orchestrator — cada servidor uma porta. |
| APP-0062 | servidores são Gateways puros: só I/O, leem/editam a Tabela SQL; a Tabela SQL é a única fonte da verdade; mídia não passa por servidor. |
| APP-0063 | tipos de servidor: Editor (UPDATE/INSERT), Gateway completo, Monitor (SELECT dashboards), AI Worker (assíncrono). |
| APP-0064 | /aiactions com ~60 skills: todolist, contextanalyzer, planbuilder, questionasker, thinking, verification, testing, compaction, tokencount, file CRUD, contextcapture/export, mouse/keyboard, manipulação de componente/camada/efeito/timeline/canvas, websearch, examplesearch, logsearch, traininganalyze, styleextract, replication, livemode, hiddenmode, autonomousmode, geração de imagem/vídeo/áudio/3D/código/site/notas/anúncio/MIDI, modeldownload (Kaggle/HuggingFace), modelupload/training, agenttraining. |
| APP-0065 | protocolo todo-list é skill indispensável da IA. |
| APP-0066 | ciclo obrigatório: ANALISAR → PLANEJAR → EXECUTAR → VERIFICAR → TESTAR → (passou? ENTREGAR : REFAZER→PLANEJAR) → SALVAR FEEDBACK para treinamento. |
| APP-0067 | verification e test marcados `cannotSkip: true` no Todo-List Template. |
| APP-0068 | execução autônoma mesmo com usuário offline, batchTasks, combinação de estilos X+Y, publicação/compartilhamento e refaz automático ao falhar; feedback volta para treinamento. |
| APP-0069 | busque 30 logs similares no banco antes de executar (examplesearch.ts). |
| APP-0070 | 3 modos de execução: ao vivo (cursor fantasma), oculto (função direta, instantâneo), autônomo (admin only, segundo plano). |
| APP-0071 | iA cadastrada como usuário com email/senha (@lookup, super root admin); servidor assiste a porta dela; admin pode ver a IA trabalhando; IA retoma com "oi, paramos em X lugar, quer continuar?". |
| APP-0072 | loop de autocorreção: planejador → executor → verificador; dois robôs (um faz, outro verifica e manda consertar); resolutor de erros faz segundo check. |
| APP-0073 | fluxo do agente: mensagem → Agent processa com LLM+tools → valida segurança/permissões → ExtensionManager dispara ferramenta → resultado volta → LLM decide próximo passo → loop até terminar sem tool request. |
| APP-0074 | planos do agente limitados a até 10 etapas, definindo como agir e usar cada ferramenta. |
| APP-0075 | modo "ultra max pro high": ex. Claude 4.5 Opus — 1min30s, 4000 tools, 200k tokens; "oi" executa 7 tools; pedido de vídeo aciona modal de preferências (duração, transições, 2D/3D, orientação, legendas, publicação). |
| APP-0076 | conte tokens e crie arquivo de compressão de contexto antes de 100%; usuário continua no mesmo ou novo chat; IA diz onde parou. |
| APP-0077 | contexto forçado injetado pelo servidor (não pelo LLM): agente obrigado a ler histórico/arquivos antes de agir — não confiar na memória do LLM para iniciativa. |
| APP-0078 | estado de contexto separado: quem sabe que o agente está vivo é o backend (Worker + registro com status processing atrelado a user_id/task_id); delegação via JSON pelo Orquestrador; checklist visual via WebSocket em /task_id. |
| APP-0079 | memória em 3 camadas: janela deslizante (curto prazo), arquivos (longo prazo), sumarização de checkpoint por modelo barato a cada X interações. |
| APP-0080 | 1000+ componentes TSX e 1000+ lógicas TS em actions; cada ação requer arquivo lógico encapsulado no formato "componente X obedece lógica X e propriedade X". |
| APP-0081 | plugins do sistema: design.ts core, floating, geminiservice, antidevops (bloqueador de devtools), aesthetic, responsive, dnd, cleanurl, canvas flutuante, detach universal, sync/merge/transfer/clone entre abas, hybrid, infinityscroll, idle (mouse parado 3s), autosave, replay, observer. |
| APP-0082 | 99% das operações via terminal/comandos; alterações impactantes em paralelo via subagentes. |
| APP-0083 | /ai-action/: training/, observers/ (action-observer, mouse-tracker, keyboard-logger), interpreters/, planners/ (plan-builder, inspiration-fetcher, style-combiner, task-queue-manager), executors/ (ghost-cursor, silent-executor, component-clicker, offline-worker, publish-executor), validators/, components/, storage/. |
| APP-0084 | modo OFFLINE: usuário solicita e sai → Task Queue Manager enfileira → Offline Worker executa no servidor → ciclo completo → salva no Laboratório → publica → notifica ao voltar. |
| APP-0085 | comandos de IA: createVideo/Site/Model/Audio, editProject, applyStyle, combineStyles (X+Y), publishResult, shareResult, exportResult, batchTasks. |
| APP-0086 | inspiration Engine: busca modelo do estilo X, estilo Y e projeto Z; mescla colors/effects/transitions/mood; gera plano híbrido. |
| APP-0087 | validação: VerificationChecklist (didFollowPlan, didFollowTraining, didCompleteAllSteps, didMatchUserRequest, hasNoErrors, outputIsValid); TestProtocol com passed/failureReason/shouldRetry. |
| APP-0088 | task Queue com dependências (dependsOn), progress % e notificação por tarefa. |
| APP-0089 | servidor privado de treinamento: /training-data/users/{user}/inputs\|executions\|verifications\|tests\|outputs; /models (style-recognition, task-planning, error-correction); /feedback-loop (success-patterns.json, failure-patterns.json). |
| APP-0090 | grave TODAS as ações do usuário (cliques, atalhos, inputs, coordenadas, efeitos, ordem cronológica) como dataset de treinamento proprietário. |
| APP-0091 | hierarquia (plano anterior): Criadores (classe suprema) &gt; IA Loo &gt; Admins delegados &gt; Sponsors &gt; AI users &gt; Membros — a hierarquia atual é a selada com planos Free/Pro/Enterprise + doações; hierarquias antigas ficam só nas notas. |
| APP-0092 | aI agents e virtual users têm privilégios de criador quando originados por eles; perfis virtuais sempre marcados. |
| APP-0093 | hierarquia comunitária separada da administrativa: mestres de sala, líderes de equipe, moderadores de chamada/grupo/projeto; escalonamento ao criar servidores. |
| APP-0094 | admin que cria servidor torna-se admin daquele contexto (distinguível do admin da plataforma); admin comunitário administra só o contexto do app. |
| APP-0095 | planos destinam-se a RECURSOS, nunca a poderes administrativos; só criadores/IA concedem privilégio marcando no banco. |
| APP-0096 | planos (plano anterior: Free/Pro/Essential/Enterprise/Sponsor com cotas próprias) — o esquema vigente é Free/Pro/Enterprise + doações, e as cotas antigas ficam só nas notas como referência de capacidade. |
| APP-0097 | categorias de conexão externa independentes: nuvem/armazenamento, provedores de IA, servidores VPS GPU/CPU, VPN, banco de dados — cada uma com limite próprio por plano. |
| APP-0098 | modelos próprios rodam 24h na infra própria sem limite por requisição; limite de requisições incluso no próprio modelo. |
| APP-0099 | rate limit de IA por plano: cotas de requisições diárias crescentes com o plano; modelos próprios sem limite incluso. |
| APP-0100 | free obriga nuvem própria, 1 projeto por aba, anúncios, não exporta/renderiza; pagos: renderização em segundo plano, storage ilimitado, sem anúncios. |
| APP-0101 | stripe + gateways nacionais; beta só paga a plataforma; moeda própria; banco em beta; empréstimo indisponível no início. |
| APP-0102 | planos múltiplos simultâneos mensais/anuais pausáveis; créditos transferíveis; trial 2–3 dias com cartão pré-cadastrado (1 plano, sem múltiplas adesões); IP do pagamento registrado anti-fraude; sem subtração proporcional. |
| APP-0103 | compartilhamento de assinatura: convidar membro com/sem assinatura; convidado pausa/resume; proprietário presenteia ou ejeta; cada plano com ID+nome único; revogável. |
| APP-0104 | controle de conta de terceiros só mediante aceite; controlador não tem botão de saída a menos que permitido. |
| APP-0105 | cashback converte em crédito da loja, nunca dinheiro real. |
| APP-0106 | aPI própria vendida com cobrança cara e acesso programático. |
| APP-0107 | página de planos é a fonte dos preços; Stripe cuida só da comunicação; carteira mostra todos os planos comprados. |
| APP-0108 | compra de assets usuário-para-usuário via Stripe. |
| APP-0109 | proteção do banco: RLS com policy auto-enable trigger em cada entidade (plano anterior: Supabase com policies; hoje as regras de proteção valem sobre o DB unificado da casa); realtime universal; proteção contra escalonamento vertical/lateral; captura antifraude (navegador, tela, rede, geo, fingerprint); entidade de ataques exibida no painel inicial; restauração protegida contra injeção. |
| APP-0110 | schema (plano anterior: esquema único em public com Supabase): nomes curtos em inglês, sem emoji/underscore; &gt;200 entidades &gt;1000 campos; username+name obrigatórios; apps identificados por nome descritivo, jamais número sequencial; cascata partindo do usuário; proibida redundância. |
| APP-0111 | tabelas derivadas referenciadas só pelo ID único; nenhum campo repetido entre entidades; perfil principal com &gt;20 campos. |
| APP-0112 | sharding (plano anterior: Supabase com 50k usuários por projeto free e troca de API keys): hoje o sharding é Drizzle com 50 mil por shard e tabela mãe agregadora soma totais; contadores booleanos online/offline/editando; delete marca, não remove. |
| APP-0113 | cheque premium ao retornar: usuário logado sem plano confirmado é verificado na tabela de planos. |
| APP-0114 | ignore erros de policy duplicada (42710) ao re-executar SQL; catalogue erros SQL previstos (3F000, 42501, 42601, 42804, 42883, 42703, 22P02, 23505). |
| APP-0115 | chaves de API do usuário guardadas no navegador com exclusão permanente; cookies salvos para persistir conexões externas. |
| APP-0116 | tabela permanente dedicada para logs de sistema, IA e chat; content como link no banco e no navegador enquanto cookies ativos. |
| APP-0117 | dois versionamentos paralelos (plataforma × usuário) com hash aleatório por versão + data/horário; rollback Ctrl+Z para estados anteriores. |
| APP-0118 | ctrl+Z global via ZIP: compactar estado em zip após 30s de inatividade; reload devolve tudo ("Te ver de volta"); só fora do estado ativo; por app+usuário. |
| APP-0119 | logs comprimidos por usuário/contexto em ZIP com prazo de 1 semana; salva só o link; manter apenas o mais recente por entidade. |
| APP-0120 | fork de qualquer conteúdo (notas, projetos, mídia) de qualquer usuário; fork vinculado ao ID original e ao novo dono; Pro cria mas não executa na infra; Essential+ permite automação na infra. |
| APP-0121 | conta = sandbox isolada (~50GB por plano); site já é sandbox; cada usuário a sua. |
| APP-0122 | &gt;50 apps inclusos independentes com integrações (não um dentro do outro); nomes simples em inglês. |
| APP-0123 | star Menu, Profile, Canvas, Marketplace, Banco/Payment/Gateway, personalização com volta ao tema anterior, versões/temas anteriores; usuário pode renomear a plataforma só para si. |
| APP-0124 | loja é aplicativo; projetos publicados são aplicativos; storage com CDN própria conectando provedores externos; Secondary Panel para pagantes (só preferências próprias). |
| APP-0125 | navegador interno com 10+ submódulos Puppeteer, gerenciador de downloads, cofre de autenticação de conexões e app de métricas com mapa de tarefas e horários de pico. |
| APP-0126 | interações sociais: presentes entre usuários, curtidas/salvamentos/comentários por ID do post, seguir usuários, assinatura compartilhada com contagem por timestamps. |
| APP-0127 | explorer reúne todo conteúdo publicado (YouTube/Behance/Spotify/Instagram-like) com Melhores do ano/semana/dia por app; categoria do projeto registrada no banco; conteúdo IA-tagado com percentual "feito por IA". |
| APP-0128 | postagem de imagem, vídeo, código, música, áudio ou criação interna; posts ilimitados em URL blob; registros comprimidos periodicamente. |
| APP-0129 | a partir do Pro: criar agentes e CLIs e publicá-los (na plataforma ou servidor externo, ou ambos); IA do usuário em sandbox com ID único. |
| APP-0130 | protocolos de IA catalogados: MCP, ADP, A2A, ACP, AG-UI, OAP, AGP, TAP, TDF, FCP, LMOs, RESTful Agent API; arquiteturas MAS, RAG, CoT, ReAct, AgentOS; loop cognitivo Observe→Reason→Act→Remember→Communicate. |
| APP-0131 | terminal gateado por patente: terminal administrativo só com hash secreto do criador ou IA; bloqueio de escala de privilégio; Capability-based Security. |
| APP-0132 | grupos/equipes mistos (pessoas + subagentes + perfis virtuais marcados) e todas as features do YouTube + chatbot + página de criação. |
| APP-0133 | perfis virtuais (IAs pré-treinadas por profissão) têm acesso de usuário pleno: a plataforma serve humanos E usuários virtuais. |
| APP-0134 | apps nativos no tema com loja=Stripe: créditos diários renováveis (300/dia), horas de VM, faturas, upgrade Pro. |
| APP-0135 | xplorer App Store com overlay copy-on-write: apps pesados (CapCut/Photoshop/CorelDRAW) instalados na VM matriz; sub-VM recebe atalhos/ponteiros read-only e grava apenas pastas modificadas; cota 25–45 GB por usuário; gitstorage.ts monta a visão unificada. |
| APP-0136 | explorer streaming: descoberta estilo Netflix/YouTube de artefatos da comunidade, VMs compartilhadas, jogos, 3D; shelves horizontais; fork/clone 1-clique de projeto/VM/site/mídia; deploy manager com domínio custom e SSL; player bar flutuante. |
| APP-0137 | omni Router roteia LLMs: balance por custo/latência/precisão; circuit breaker + fallback chain transparente entre DeepInfra/GMI/Google Labs. |
| APP-0138 | memória infinita: Redis (ponteiros/hashes, sub-ms) + JuicedFS/MinIO (árvore de Merkle, blobs imutáveis) com desduplicação content-addressable. |
| APP-0139 | conceito-equação: Devthink = n8n (eventos) + ComfyUI (DAG multimodal) + NotebookLM (RAG) + Google Labs (VM/vContainer/vGPU/vCPU 100% software) + Omni Router + pools serverless + Waydroid + Asterisk (VoIP/SIP) + Git/Forgejo (blobs/Merkle) + Redis (cache RAM) + Llama/DeepSeek locais — "hypervisor de IA". |
| APP-0140 | dashboard sob controle: métricas Conexões/Sessões/Aprovações/Execuções/Eventos. |
| APP-0141 | mail gateway: e-mail exclusivo do agente (estilo @manus.bot) para disparar fluxos via SMTP. |
| APP-0142 | conectores atendem OCR Manus: API personalizada, MCP personalizado, importar MCP por JSON/URL; habilidades criadas/upload/GitHub; populares Instagram, Google Workspace, Meta Ads, Google Agenda, Notion, Higgsfield, Outlook. |
| APP-0143 | backend de referência com rotas /, /plans, /operations, /security, /audit e tabelas users, automationApprovals, automationAuditEvents, automationCheckpoints, automationExecutions, automationPlans, automationPolicies, browserConnections, browserSessions. |
| APP-0144 | chat Main Workspace com 40 componentes: sidebars flutuantes, model selector, reasoning slider, VM sandbox visibility switch, token counter, hero task suggestions, textarea, voice dictation, deep thinking toggle, web search modifier, code interpreter, require approval, slash commands popup, MCP plugin dropdown, IDs status. |
| APP-0145 | stream com SSE/WebSockets: reasoning accordion, tool exec cards, inline code diffs (apply/reject), fork conversation, cost estimation, export raw JSON. |
| APP-0146 | aVM (Advanced Virtual Machine) é design proprietário: processador + hardware virtual completos + drivers em software; VMs recursivas clonadas 25–45 GB por username. |
| APP-0147 | cLI DevThink é produto library-first: contratos (transport, session, memory, provider, tool, renderer) extraídos; browser-automation vira "audit evidence only", não requisito. |
| APP-0148 | proibidos defaults absolutos no CLI: "no default mode, no default model, no default temperature, no default topic, no default tokens"; proibido `process.env.X \|\| 'default'` e `?? fallback`; sem valor → feature desabilitada ou prompt ao usuário. |
| APP-0149 | memória interna em ordem: 1) sessão → 2) projeto `.devthink/` → 3) global `~/.devthink/` → 4) memória externa/provider SOMENTE se o usuário pedir; nunca acesso automático. |
| APP-0150 | banir emojis (U+1F000–1FFFF) em código, logs, UI, docs e commits; permitidos box-drawing, braille, ASCII art, ANSI; CI scan + lint rule. |
| APP-0151 | estrutura flat no CLI: sem subdiretórios dentro de módulo, sem hífens; tudo em `/cli` na raiz; máx 20 tipos/arquivo, 10–15 funções/arquivo. |
| APP-0152 | `.ts` lógica / `.tsx` design (JSX/Ink em .tsx; lógica de negócio em .ts). |
| APP-0153 | host 127.0.0.1 + porta aleatória no CLI: "localhost é proibido"; porta sorteada uma vez e fixa pela sessão; proibida porta hardcoded (3000/4096). |
| APP-0154 | proibido downgrade de versão: package.json só sobe ou mantém; CI checa. |
| APP-0155 | toda dependência de design precisa de import real em .tsx, senão é removida. |
| APP-0156 | bundling total interno (esbuild/rollup), sem resolução node_modules em runtime, dist com index.js/.mjs/.d.ts library-mode, named exports, sem side effects. |
| APP-0157 | cross-platform sem premissas: PowerShell/CMD/Bash/zsh/Browser/Desktop(Tauri,Electron); config em %APPDATA%/~/.config/~/Library por OS. |
| APP-0158 | tudo opcional: nenhuma flag/required field/setup wizard obrigatórios; hierarquia CLI flags &gt; env &gt; projeto &gt; global &gt; defaults-de-feature. |
| APP-0159 | 20 modos com memória interna: chat, code, review, debug, test, doc, refactor, explain, search, plan, execute, analyze, translate, generate, optimize, security, deploy, monitor, config, session. |
| APP-0160 | react → ANSI: Ink como camada principal (Yoga+react-reconciler), ANSI cru como fallback; web usa React DOM real — "single component source for both targets". |
| APP-0161 | output limpo: proibido stack trace cru, `[DEBUG]`, JSON.stringify no terminal; formato `LEVEL \| MODULE \| message`; debug só via `--verbose`. |
| APP-0162 | fronteira de segurança do CLI (não-negociável): não capturar cookies de browser, não repetir sessões web de terceiros, não burlar CAPTCHAs, não embutir OAuth codes de exemplos, não deployar DB mutável em GitHub Pages/Vercel/Netlify; auth só API key documentada ou OAuth/device flow oficial iniciado pelo usuário. |
| APP-0163 | elimine dados falsos: nenhum hardcoded, fake, mock, placeholder, portas fixas, números mágicos (187 ações em 8 fases; remover fallback "nvidia", fake `{connected:true, latencyMs:0}`, simulateLocalDelegation). |
| APP-0164 | comandos do CLI: `devthink chat/serve/models/mcp/share/export/import/config/identity/pair/sync/usage/routes/debug/auth/permissions/mode` + slash commands `/share /unshare /export /model /mode /settings /init`. |
| APP-0165 | gateway loopback embutido no CLI (`devthink serve`): health, catálogo, modelos, workspaces, sessões, abas, chat SSE; rotas REST share/export/lsp/mcp. |
| APP-0166 | providers 22→75+: OpenAI-compatible, Anthropic Messages, Google Gemini, Z.AI, Qwen, Xiaomi MiMo + OpenRouter, DeepSeek, Groq, Mistral, xAI, Ollama, Bedrock, Azure; resolução de endpoint em camadas; proxy por provider, PAC, SOCKS5, custom CA. |
| APP-0167 | agentes CLI: tipos explore/scout/general + ocultos compaction/title/summary; @mention parser; tab-switch Build/Plan; per-agent permissions `{tool: allow\|ask\|deny}` com globs; step limits + token budget; agentes em Markdown com frontmatter YAML em `.devthink/agents/*.md`, fallback AGENTS.md/CLAUDE.md/.cursorrules. |
| APP-0168 | plugin system estilo OpenCode: ES modules exportando `server(input)` → hooks (`chat.message`, `chat.params`, `tool.execute.after`); built-ins Memory, Proxy, MCP Server Manager. |
| APP-0169 | tools com schemas Zod: apply_patch, todowrite/todoread, question, websearch (Exa/SearXNG), lsp, skill; permissão allow/ask/deny por tool; dry-run; middleware chain. |
| APP-0170 | sessões CLI: share público com sanitização + expiração 24h/7d/30d/never + QR code; export JSON v1.0/Markdown/HTML com `--sanitize`; import de URL; SQLite `devthink.db`. |
| APP-0171 | memória CLI: HNSW + BM25 + RRF, EmbeddingService, auto-capture, profile learning; undo/redo + git; worker threads UI/LLM (Comlink). |
| APP-0172 | tUI moderna: Ink v7 incrementalRendering, Command Palette Ctrl+P (40+ ações, MRU), autocomplete `@files @agents /commands` fuzzy, DiffViewer inline/stacked, FileTree, ThinkingBlock colapsável, leader key Ctrl+X, keybinds JSON, 7 temas JSON, toasts 150-240ms. |
| APP-0173 | distribuição do CLI via Homebrew/Scoop/Chocolatey/AUR/Nix/Docker; binários Bun Linux x64/macOS arm64/Windows x64 + SHA-256; SSO (OIDC/SAML/LDAP); audit SIEM/GDPR. |
| APP-0174 | rWKV &gt; Mamba para inferência local: RWKV-7 é o único com WebGPU/WASM pronto; Mamba via ONNX "possível mas imaturo"; lazy-load de modelos (~95MB base + download). |
| APP-0175 | sQLite-first com fallback JSON: better-sqlite3 → bun:sqlite → json-only. |
| APP-0176 | corte de dependências 342→18 no CLI: visão Aider-like "um comando, uma variável de ambiente, resultado". |
| APP-0177 | paridade web↔CLI como aceite: "every user-facing web operation has a CLI or gateway equivalent, and every CLI operation has a visible web mapping". |
| APP-0178 | sincronização via paired gateway grátis primeiro; remote adapter opcional (Postgres+RLS user-operated); rejeitado: DB no repo e senha no browser; conflitos explícitos em Settings, nunca merge silencioso. |
| APP-0179 | pareamento web com gateway local: `devthink pair create` → ID + código de 8 chars válido 5 min, consumido 1×; token bearer curto só em sessionStorage; `web.allowedOrigins`. |
| APP-0180 | indexedDB `devthink.db` browser-local persistido; store `credentials` vazio por padrão, fora do sync. |
| APP-0181 | extensão (@wenathlan/extension "Devthink") consent-first/deny-default: recusa toda origem nunca concedida; allowlist por-origem exata, 1 origem por entrada, wildcard nenhum (estrela/segmento vazio/scheme wildcard recusam o check inteiro). |
| APP-0182 | mV3 sem remote code: endpoint remoto só entrega dados declarativos schema-checked, nunca código executável; permissões mínimas iniciais `storage`, `activeTab`, `sidePanel`; host permission só após pedido explícito. |
| APP-0183 | excluído por design da extensão: debugger, cookies, downloads, proxy, broad hosts `<all_urls>` e companion nativo. |
| APP-0184 | sem hardcode na extensão de duração/bound/shape/kind/threshold/lista — escolhas do usuário; nenhum registro de segurança passa por cima do human review. |
| APP-0185 | package.json é a única fonte de versão da extensão; push em main que muda package.json/CHANGELOG dispara pipeline → tag imutável `vX.Y.Z`; store submission operator-published. |
| APP-0186 | lLM na extensão sem provider hardcoded: sem allowlist, sem default; usuário conecta gateway/base-url/api-key/model; chave mora no browser credential store; 4 wire-shapes são interop, não providers. |
| APP-0187 | tarefa do browser-agent é sequência finita revisável: intent → bounded observation → action proposal → user-policy decision → execution → fresh observation → outcome record — NÃO loop irrestrito. |
| APP-0188 | observação semântica preferida (accessibility tree bounded); screenshot opcional com aprovação separada; target reference expira após navegação/mutação. |
| APP-0189 | cLI da extensão `devthink`: planlint, runworkflow (dryrun/resume/checkpoints), headless replay read-only sobre fixtures, composeworkflow; planos/workflows/fixtures versionados com schema strict (campos desconhecidos recusados com path). |
| APP-0190 | mCP server mode (1.1.84): toolcatalog + resourceexpose + promptexpose; transports stdio (JSON-RPC newline frames) + HTTP streamable localhost; TLS opcional; `--degraded` = read-only; audit entry por tool call. |
| APP-0191 | secret vault (1.1.62): put/fetch na última hora; registros persistem só label/origem/provenance/sha-256; secretleakscan + secretshapecarrying; honest limit: session storage memory-only. |
| APP-0192 | release discipline da extensão: cada release exatamente 100 changes concretas verificáveis em cadeia única (1.1.31→2.0.0); grounding em crxfeaturemining (57 artifacts CRX, non-executing). |
| APP-0193 | gateway tratado como app absorvido: 18 rotas passthrough (6 V1 + 6 V2 + 6 V3), input cliente → autofix → fetch baseURL oficial → retorno upstream → save DB → streaming de volta. |
| APP-0194 | thinking always-on 7 níveis (none→max, default high) em toda requisição V1/V2/V3; ordem obrigatória thinking → response; limite 98k thinking + 98k response. |
| APP-0195 | streaming manual: ReadableStream com pump/getReader/drain; makeSse com flush; keepalive 200ms; `[DONE]` único; anti-429 retry 2–8× backoff exponencial 200ms–64s, jitter, Retry-After, pacing 200ms, mutex MAX_CONCURRENT 1. |
| APP-0196 | conversão de formatos on-the-fly: detector openai chat.completions vs anthropic messages vs responses; output source-of-truth `chat.completion.chunk`; saída em 3 formatos + 20 SDKs. |
| APP-0197 | chaves: cadastrar as 22 chaves NVIDIA no DB via db.ts/prisma push com round-robin antes do build. |
| APP-0198 | meta-modelo rotulado somente "DevThink" (masking/tracking): toda resposta reporta model "devthink" no SSE byte passthrough. |
| APP-0199 | workflows do repo devthink: ci, pages, release, security, verify, maintenance, buildextension, cachecleanup, codeql, compatibility, container, desktop, mobile, publishghcr, publishgithubnpm, publishmaven, publishnpmjs, publishnuget, publishrubygems, securitypolicy, targets, workflowlint. |
| APP-0200 | metadata do repo: "OMNISCIENT IDE"; main `app.tsx`; ~40 scripts (dev/build/preview/server×8; electron×5). |
| APP-0201 | vite unificado (plano anterior): "App.tsx → core-hidden.js (ofuscado) → ak.js loader", rollup-plugin-obfuscator, css-injected-by-js — a pipeline de ofuscação antiga foi substituída pela árvore limpa sem dist. |
| APP-0202 | `ak.js` é redirecionador único criptografado em produção (plano anterior): não esconde nada, só aponta para `app.tsx` — mantido apenas como linhagem histórica do carregador. |
| APP-0203 | proibido no create/DevThink: pasta `/src`, `index.ts`, `core-hidden.js` em src, `/dist` para links ofuscados, `/public` para assets ofuscados. |
| APP-0204 | ordem mandatória de refactor: ler `estrutura.md` completo → ler `oldindex.txt` → analisar configs → TODO list (excluir/mesclar/editar/mover/renomear/atualizar/criar/escrever) antes de qualquer alteração. |
| APP-0205 | anchor file: `app.tsx` importa só os anchors; anchor importa tudo que a página precisa; arquivos abaixo do anchor não fazem imports. |
| APP-0206 | padrão Maestro-Soldado-Arma: ÂNCORA (.tsx) importa libs/caminhos e faz binding; LÓGICA (.ts) puramente funcional; COMPONENTE (.tsx) UI pura, recebe props, sem lógica de negócio. |
| APP-0207 | âncora `nomedapasta.tsx` e página `nomedapastapage.tsx` (única exceção à palavra "page"). |
| APP-0208 | sem limite de componentes/lógicas por pasta desde que o âncora administre libs e cada lógica X faça o componente Y funcionar. |
| APP-0209 | pastas permanentes: tools, extensions, live, post, dashboard, armazenamento, nodes, curso, infinity canvas, laboratório, status, agents+cli (só pagantes/admin), 3dstudio, ebook, code_ide, user, personalização, salvos, explore, terminal (isolado), trein modelos, actions. |
| APP-0210 | pastas proibidas: src, database, cache, sandbox, playground, share, export, import, bridge, integração, contexto, map, colaboração, vfx, engines, upload. |
| APP-0211 | cada página = 1 pasta; não pastas dentro de pastas; separar por categoria via comentários; nomes em inglês; não criar pastas com sentidos duplicados. |
| APP-0212 | agentes/subagentes em TypeScript replicando comportamentos de Python (terminal e editor); TS + React com mínimo de HTML/CSS. |
| APP-0213 | app.tsx inicia/innita security.ts e importa server e security; onboarding importa server+services e não reaparece após completo. |
| APP-0214 | arquivos escritos no chat (não criar projeto no container); só imports permitidos na estrutura. |
| APP-0215 | não mexa no index.css nem componentes universais — apenas a pasta da página. |
| APP-0216 | ao mover arquivos, não excluir nada — apenas mover e ajustar; sem cron jobs no projeto; apagar builds/zip antigos de dev e produção. |
| APP-0217 | plataforma em apps nativos iOS/Windows/Android/Mac/Linux (plano anterior: Electron + Pkg) — o empacotamento atual é Tauri no desktop e Capacitor no mobile, com o mesmo código TS, online/offline. |
| APP-0218 | sEO: sitemap.xml, keywords.txt, robots.txt, ads.txt, banner devthink.jpg. |
| APP-0219 | atalhos universais: Ctrl+Z/Y/C/V (copy/paste ENTRE abas), Ctrl+S auto-save, Ctrl+Click multi-seleção, arrastar = criar laboratório. |
| APP-0220 | status ao vivo: livecounter de usuários online, projectcounter, heatmap de atividade, vitrine de métricas. |
| APP-0221 | retrospectiva do usuário e da plataforma (ano/mês/semana/dia/hora) com gráficos, stats, countdown; monitoramento micro + macro + treinamento. |
| APP-0222 | /windgets (admin) com assets upados por categoria (video/audio/3d/canvas/notes/site/tools/code/models/templates). |
| APP-0223 | /mockup com exemplos/templates de projetos por aba (3D, áudio, canvas, vídeo, site). |
| APP-0224 | expansão do roster: criador de extensões web, criador de jogos, engineering simulation, ads builder, ebooks builder, cursos online (venda/compra/assistir), streaming de jogos play-to-go, tradução de fala em tempo real, criador de imagens pixels, terminal isolado para pagantes. |
| APP-0225 | métricas-alvo: 100+ páginas, 500+ componentes, 60+ ferramentas, 50+ file hosts, 15+ categorias de conteúdo, 10+ editores profissionais. |
| APP-0226 | deploy (plano anterior: GitLab repo + Netlify + Supabase com _headers, _redirects, netlify.toml, ak.js) — o alvo atual é Cloudflare com wrangler.toml, devthink.toml, routes gerenciadas pela App.tsx e mime-types na raiz do tema; Vercel/Netlify seguem como hosts de backup dos clones. |
| APP-0227 | posicionamento: "Adobe Creative Cloud + Twitch + YouTube + Discord + Spotify + AI Agents" com custo zero de infraestrutura, persistência total, escalabilidade infinita. |
| APP-0228 | aPI de páginas 45 v1: 01 Landing; 02–04 Auth; 05 Onboarding Tour; 06 Chat Main Workspace; 07 Active Stream; 08 Sandbox Terminal; 09 Sandbox Browser; 10 Sandbox Editor; 11 Approval Checkpoint; 12 Emergency Kill Switch; 13 Projects Hub; 14 Project Details; 15 Environment Create; 16 VM Storage; 17 Desktop Bridge; 18 Git Branch Manager; 19 Connectors Catalog; 20 MCP Importer; 21 Skill Builder; 22 OAuth Manager; 23–25 IM Bots (Discord/Telegram/Slack); 26 Automations Dashboard; 27 Cron Creator; 28 Mail Gateway; 29 Execution Logs; 30 Webhook Dispatch; 31 Library Hub; 32 Web Deployments; 33–35 Studios; 36 Security Posture; 37 Audit Trail; 38 Compliance Scanner; 39 Extension Inspector; 40 Telemetry Analytics; 41 User Profile; 42 Memory Customizer; 43 Layout Customizer; 44 Billing Compute; 45 Developer Keys. |
| APP-0229 | 45 telas em 9 grupos de carga: G1 Público/Auth (01–05) · G2 Onboarding (06–08) · G3 Núcleo Chat-Agente (09–15) · G4 Ambientes & Repos (16–20) · G5 Conectores & MCP (21–25) · G6 Agendamentos & Cron (26–30) · G7 Biblioteca (31–35) · G8 Segurança & Auditoria (36–40) · G9 Configurações (41–45). |
| APP-0230 | sandbox embutida no chat: terminal xterm, browser headless (CDP viewport), Monaco editor + diff view, file tree, restart VM, checkpoint card, killswitch modal. |
| APP-0231 | sistema de bordas do neochatinterface: z-order L1b right tab (z0) → L0 borda extra (z1) → L1 body fill (z2) → L2 SVG gradiente (z3) → L3 botões (z10) → L4 conteúdo (z20); halo frosted é outer-ring only, sempre ATRÁS do contorno gradiente. |
| APP-0232 | geometria "saddle" nas abas do chat: BOX_CORNER_RADIUS 24, SADDLE_CONCAVE_RADIUS 14, TAB_HEIGHT 40, OVERLAP_OFFSET 1.5, ACTIVE_TAB_RADIUS 18, INACTIVE_TAB_RADIUS 14; junta côncava fundida à caixa. |
| APP-0233 | bordas animadas: gradiente multicolor (#3b82f6→#8b5cf6→#ec4899→#f97316) stroke 6.5 com animateTransform 9s; squish de raio 18↔14 (220/380ms easeOutQuart); pulse branco no send 650ms. |
| APP-0234 | chat: claymorphism + liquid glass; clay-btn com inset shadows 4 camadas, backdrop blur 48px saturate(185%), gloss ::before 46%, send-btn gradiente 5-stop. |
| APP-0235 | aurora blobs animados com paleta por aba (blur 64px, blobFloat 24s, delays 0/-5/-9/-13s) e tokens dark (#08080A/#121216/#1E1E24, accent #F97316). |
| APP-0236 | app Aura (neodevthink): caixa de chat `rounded-[32px]` liquid-glass, pills 28px, "Internal Cognition" com scanline e chevron colapsável, MessageBubble assimétricas, timestamps + "Aura Pro". |
| APP-0237 | 5 temas completos (default glass, dark, pitch-black AMOLED, nordic-forest, sunset-royal) com tokens por tema. |
| APP-0238 | verificação por fluxo obrigatório: `bun run lint` limpo → dev server 200 → Agent Browser + VLM confirmando em dark E light, aba ativa E inativa, sem glitches/console errors. |
| APP-0239 | método DevThink de design: decompor cada referência em macro/meso/micro e redistribuir propriedades na marca própria — "never a literal copy"; documentar em mapeamento-*.md com matriz origem→destino. |
| APP-0240 | assistente oficial da plataforma: Loo (Lookup); linhagens SoFlowX→DooThink→Lookup mantendo `@lookup` como usuário-IA com privilégios super root admin e time de 30+ devs. |
| APP-0241 | lookup OS com shell de janelas: OSWindow com abas múltiplas, combineTabs/unstackTab/detachTab (popup 800x600), StartMenu 3x3 ("Exactly 9 Core Apps": VIDEO, AUDIO, STUDIO3D, CANVAS, CODE, LIVE, AI, FILES, EXPLORE), Ctrl+K palette, Ctrl+Alt+Del → STATUS. |
| APP-0242 | backend próprio Lookup (plano anterior: Express + Socket.IO + Vite middleware com rotas /auth/*, /rpc/:fn, /storage/v1/object/:bucket, /users/*, /projects, /streams, /files, /activity, /upload, /health; schema Drizzle/SQLite; fallback localStorage em 404) — o backend atual é a plataforma com node:http/Hono e o DB unificado. |
| APP-0243 | "Self-hosted Supabase" (plano anterior): classe SelfHostedAuth reimplementando Auth/PostgREST/Realtime/Storage sobre Drizzle+SQLite com paridade de API — absorvido pela auth federada da plataforma. |
| APP-0244 | agente AI da plataforma (uapp/ai): planner com FunctionDeclarations, ToolRegistry, perception (scan DOM semântico via data-ai-id), DOMExecutor ("as mãos"), VectorMemory, prompts por papel (GENERAL_ASSISTANT, CODE_EXPERT, CREATIVE_DIRECTOR, DATA_ANALYST). |
| APP-0245 | painéis de verificação de segurança 0/0/0 (code scanning, secret scanning, dependabot) como critério de pronto do devthink. |

## saddle (APP-0246 a APP-0490)

| id | regra condensada |
|---|---|
| APP-0246 | tese central Storage == Compute: bytes de storage e memória são os mesmos; a diferença é a flag de uso (`process` = working set temporário vs `keep` = persistente). |
| APP-0247 | posicionamento honesto: "free compute + storage-as-virtual-RAM **cache**" — storage nunca vira VRAM física (bus ~900 GB/s vs ~50–300 ms rede). |
| APP-0248 | nunca rotular storage remoto como RAM/VRAM/runner always-on; toda execução gera honesty receipt auditável e declarativo, sem side-effects. |
| APP-0249 | five-layer model: Storage → Storage-to-RAM Bridge → Compute → Sandbox Lifecycle → Orchestration. |
| APP-0250 | runner processador é substituível: GitHub Actions é adapter, não core; capacidade/latência/durabilidade são propriedades do backend, nunca do engine. |
| APP-0251 | working set: conjunto limitado de dados estágio-em-RAM (memfs/tmpfs/mmap) que o runner processa, com fronteira física explícita. |
| APP-0252 | artifact = fronteira durável publicada: resultado do job. |
| APP-0253 | engine: job serializável → working set temporário → runner injetado → commit em storage adapter → event trail/receipt. |
| APP-0254 | arquitetura universal (vale para qualquer app): 1 root-first sem `src/`; 2 sem hardcoded host/port/credencial/cloud/vendor; 3 sem platform-locked functions; 4 transport-neutral core; 5 WinterTC/ECMA-429; 6 Zod v4 nas bordas; 7 built-ins first; 8 honesty receipts; 9 date-aware; 10 third-person no emoji; 11 cross-runtime floor; 12 no localhost. |
| APP-0255 | root-first: pastas só agrupam lógica correlata; arquivo perto do root map; lowercase, sem `_`/`-`; até 20 lógicas correlatas por arquivo (5.3 admite 0–100/300). |
| APP-0256 | host+port recebidos como config; porta temporária sorteada e travada pelo caller; servidor nunca recebe hardcode. |
| APP-0257 | rejeite Netlify/Vercel Functions: use Node server aberto, container, worker ou forge workflow. |
| APP-0258 | core transport-neutral: core não importa Node/Docker/provider client; side-effects caller-owned e injetados. |
| APP-0259 | core limitado ao WinterTC/ECMA-429: fetch, Request/Response, URL, URLPattern, crypto.subtle, ReadableStream, structuredClone, AbortController, performance.now; evite fs/process/Buffer/path/child_process/require/__dirname → adapters + Uint8Array + import.meta.url. |
| APP-0260 | zod v4 só nas bordas: z.strictObject, branded, discriminated unions; z.toJSONSchema alimenta OpenAPI. |
| APP-0261 | prefira built-ins (`node:*`) a dependências novas; sem polyfills (fetch-polyfill, undici, buffer, path-browserify declarados mortos). |
| APP-0262 | cross-runtime floor: Node ≥26.2 / Bun ≥1.4; Node 26.7 em CI/containers; Node 24.x LTS; engines.node >=22 até release deliberada; runtime detection Deno → Bun → Node → browser; conditional exports com `types` primeiro, `browser` antes de `import`. |
| APP-0263 | docs/comments em inglês, 3ª pessoa, zero emoji. |
| APP-0264 | pesquisa date-aware: toda pesquisa carrega data de observação; claims expiram. |
| APP-0265 | coding standards: 1 arquivo/contexto sem duplicar lógica; scripts em /tests (não-JS em /tests/scripts/); um padrão só; CSS moderno com variáveis; error catcher embutido p/ tracing. |
| APP-0266 | checklist de 10 pontos antes de entregar: deploy aberto sem Functions; infra aberta (portas sorteadas); root-first; 3 camadas; multi-mode library; catálogo NBIT; design rígido 44px touch; estilo lowercase/sem emoji; coding meticuloso; escolha total do usuário. |
| APP-0267 | credenciais de scrape sempre injetadas pelo caller/secret: nunca commitadas nem impressas; alvos privados bloqueados; robots/crawl-delay/limites explícitos. |
| APP-0268 | execução binária bloqueada por padrão (binary opt-in, denied-by-default): só com capability receipt + approval de adapter isolado caller-owned. |
| APP-0269 | declare capacidades unsupported/paid explicitamente; teste com fake transports determinísticos; gates antes de push. |
| APP-0270 | extensão MV3 enxuta: só `activeTab`, `scripting`, `storage`; sem broad host, cookies, webRequest, debugger. |
| APP-0271 | job lifecycle: jobqueued → jobpreparing → runnerselected → jobrunning → jobsyncing → storagecommitted → jobcompleted (+jobfailed com código/retryability). |
| APP-0272 | public API raiz: saddleurl, scrapeurl, scrapehtml, extractcontent, serializeresult, formatforagent, chunkMarkdown/formatChunksForRAG, generateLlmsTxt/generateLlmsFullTxt, estimateTokens/fitsInContext, withRetry, createServer, batchscrape, crawlurl, browseragent, mcpserver/mcptransport, nodeserver, engine/scheduler, release-assets, releaseevidence/evaluateevidence, releasereadiness, executionrequest/executiondecision/executionhandoff, internalenvelope/internalapi. |
| APP-0273 | agent API: Saddle.launch, agent.run/batch/use/tool/remember/recall/on, saddle.compile, browser.navigate/click/type/screenshot, scrape, sandbox.exec; Zod v4; viewport 320–7680×240–4320; maxRetries 0–10; browserPool 1–20 × 1–50 pages; breaker threshold 0.5. |
| APP-0274 | subpaths publicados: ./browser, ./bot, ./captcha, ./memory-engine, ./deploy, ./release-evidence, ./extension, ./browser-playwright (caller-installed). |
| APP-0275 | memoryengine({backends, maxentries, maxbytes}): persist/load rehydrata do primeiro backend responsivo; stats() com hits/misses/evictions; hot working set em process memory + backends caller-owned como lado durável; evict LRU após exceder maxentries/maxbytes. |
| APP-0276 | pool descriptors com políticas: first-healthy/verified-first/priority-first/primary-only/best-effort mirror/quorum/fan-out + repair plans + capability reports. |
| APP-0277 | reliability: retry só para 429/5xx/408/409/520–530 + ECONNRESET; circuit breaker CLOSED→OPEN→HALF_OPEN (threshold 5, reset 60 s) + saga compensation; rate-limit token-bucket/sliding-window/leaky-bucket honrando Retry-After. |
| APP-0278 | erros em const-enums: Network 1xxx, HTTP 2xxx, Browser 3xxx, Scraping 4xxx, Session 5xxx, Config 6xxx. |
| APP-0279 | ~30 superfícies/modos: library npm, CLI (`saddle <url> -f markdown\|json\|xml\|redis\|text` + subcomandos capture/bot/memory/deploy/mcp/modes/runexample/create/exec/convert-to-ram/memory-stats/sleep/wake/list), binário, MV3 extension, bot multi-plataforma, tema/playground, mobile Capacitor 8.5.0, desktop Tauri 2, n8n node. |
| APP-0280 | modos de execução como pares w/wo: fetch/browser/auto/headless/cli-binary/computer — cada modo funciona sem e com seu par (browser pair Playwright vs fetch+Cheerio; Node pair; AI pair). |
| APP-0281 | mode axes: execution {library, application, browser, desktopapp, mobileapp, extension, cli, binary, computer, internet} × runtime {node, browser, deno, bun, worker} × memory {internal, external, physical, vectorized} × file/dependency/visibility/pair. |
| APP-0282 | scrape em cascata fetch→browser→auto; extração structured-first JSON-LD→Microdata→OpenGraph→RSS/Atom→Readability→raw HTML. |
| APP-0283 | conversão com mdream (Rust/WASM ~15 ms/MB) para markdown/xml com 60–80% menos tokens para LLM. |
| APP-0284 | saídas exclusivas Redis `JSON.SET` e `llms.txt`/`llms-full.txt`. |
| APP-0285 | chunk para RAG em 400–512 tokens com 10–20% overlap. |
| APP-0286 | storage-to-RAM bridge: swap fallocate/mkswap, tmpfs 8G, zram zstd 2–3×, mmap/memfd com magic-byte loader, FUSE/rclone 70+ backends, DB-as-RAM (SQLite :memory:, PGlite, Turso), CDN load com SRI sha384. |
| APP-0287 | tiers de computational memory: L1 RAM ~100 ns / zram ~500 ns / tmpfs ~1 µs / mmap ~5 µs / SQLite ~10 µs / object store ~50 µs. |
| APP-0288 | &gt;33 TB de storage livre agregado de terceiros: HF ~10 TB, Kaggle 20 TB, Terabox 3 TB, GitHub 500 MB. |
| APP-0289 | buckets V5: HF (500GB/arquivo), Kaggle (200GB/dataset ×10 = 2TB), Terabox (1TB×3 contas), npm (250MB tarball + jsDelivr/UNPKG/ESM.sh como CDN), rclone 70+ backends; farm.py orquestra N repos ×500MB. |
| APP-0290 | file-as-compute (V6): site próprio + Prisma (Site/File/FileChunk 1 MB/ComputeJob); chunks de 1 MB distribuídos em N repos workers; Action worker reconstrói em /mnt/ramdisk (tmpfs), executa WASI/Node, resultado volta por CDN jsDelivr; pointers BigInt (9 quintilhões); tabela de site + file table (BigInt &gt;2 GB). |
| APP-0291 | multi-forge free fleet: GitHub Actions 4 vCPU/16 GB/6 h unlimited OSS; GitLab 400 min/mo; Codeberg+Woodpecker 750 MB FLOSS; Forgejo/Gitea self-hosted unlimited; HF Spaces 16 GB + ZeroGPU ~96 GB VRAM ~5 min/dia; Kaggle 30 h/sem GPU T4–P100; ModelScope 2000 calls/dia; Oracle Always Free 2 OCPU/12 GB. |
| APP-0292 | encadeie runners na ordem `oracle→github→hf→gitlab→kaggle` e pare no primeiro runner livre; farm.py: 100 repos `opencode-worker-N` ×500 MB = 50 GB, dispatch para no primeiro `204 Accepted`. |
| APP-0293 | sandbox ladder: child_process → Pyodide-WASM → microVMs; runtimes kern ~1.9 ms, CubeSandbox &lt;60 ms, Firecracker &lt;125–150 ms, Mitos ~27 ms warm, gVisor ~200 ms cold, Docker ~300 ms hardened (`--network=none --cap-drop=ALL --read-only --pids-limit=512 --runtime=runsc`). |
| APP-0294 | vm2 banido definitivamente (CVEs conhecidas). |
| APP-0295 | docker hardened dormindo com MemorySwap -1 e ShmSize 2g. |
| APP-0296 | captcha é risco #1 (potencialmente ilegal/ToS): só opt-in, supervisionado, como research; stealth/canvas/TLS spoofing fora do core (gaps declarados). |
| APP-0297 | captcha em P1–P3 evidence-based: P1 stealth (patchright + puppeteer-stealth + fingerprint rotation) → P2 comportamento (Bézier 0.3×→2.5×, Fitts `0.05+0.07·log2(1+d/20)`s, digitação lognormal μ=4.17 σ=0.3 ~65 ms, ~2% typos, ~15% overshoot) → P3 solver (hcaptcha-challenger ONNX ResNet/YOLOv8/ViT, NopeCHA, 2Captcha/CapSolver; 30+ tipos). |
| APP-0298 | postura captcha 1.8.x: detecção + pausa para revisão humana + solver externo explícito + evidências auditáveis (guard.js) — bypass automático descartado. |
| APP-0299 | agent browser/Atlas: captura real (Brave) de mouse/click/scroll/tecla em JSON reproduzível por `seed`+`events`; sessões com replay d3; mouse virtual SVG, trail, click ripple via CDP init script; export `docs/logs/<session>.json` com personality. |
| APP-0300 | atlas tratado como browser real em 30 modos + backend próprio Drizzle+mysql2+Prisma+Cloudinary. |
| APP-0301 | movement log JSON v1: session {id sess_01J9…, agentName uka-capture, browser brave, originUrl, seed, personality careful, viewport}, eventos com x/y/rotação/timing/target/selector. |
| APP-0302 | bots como third-party app com credenciais SEMPRE do usuário: GitHub App/OAuth, GitLab, Forgejo, Gitea, Bitbucket, SourceHut, HF, Reddit, Discord, Telegram, Slack, Mastodon, Matrix, Bluesky. |
| APP-0303 | empacotamento em 6–7 registries: npm, GHCR, Maven io.wenathlan, NuGet, RubyGems, ClawHub/OpenClaw, GitHub Pages. |
| APP-0304 | 38 assets por release + SHA256SUMS + SBOM CycloneDX + provenance in-toto; naming `saddle.browser.1.8.18.<os>.<abi>.<ext>`; estados de assinatura declarados honestamente (SignPath Foundation pending). |
| APP-0305 | zero-install via CDN: nunca `npm install`; esm.sh/esm.run/jsDelivr/unpkg/jspm/cdnjs com import maps e SRI. |
| APP-0306 | sCDN: PUT/GET/DELETE com bearer + Cache-Control para R2/CloudFront/Bun CDN/Deno Deploy/Vercel/Netlify edge 50–200 ms vs 200–2000 ms direto (plano anterior: edge em Vercel/Netlify; alvo atual Cloudflare Workers/R2 via wrangler.toml). |
| APP-0307 | identidade canônica `@wenathlan/saddle` a partir de v1.8.1; cadeia: OpenCode Multi-Forge → UKA (@devthink/UKA) → DevThink WebScrape (@devthink/webscrape) → Saddle; nomes rejeitados: CloudSandbox, SandPlatform, storage-ram-bridge, Seddon/Sedol. |
| APP-0308 | licença GPL-3.0-only (resolve a contradição histórica "Proprietary - View Only"/MIT em 1.8.12); docs canônicos nunca revogam GPL. |
| APP-0309 | npm token antigo exposto em chat é comprometido: nunca reusar; publicação só via secret `NPM_TOKEN` owner-managed / OIDC trusted publishing. |
| APP-0310 | posicionamento competitivo: "Toolkit+" entre Crawlee (framework) e Firecrawl/Browserless (DaaS); pesos AI 25%, anti-detection 20%, production 20%, ease 15%, cross-runtime 10%, serialization 10%. |
| APP-0311 | toS válido: processar binário do próprio repo via Actions; farm com contas descartáveis para compute em massa é violação (~40 contas) — caminho correto é paid barato (R2 $0.015/GB) ou self-host Forgejo+MinIO. |
| APP-0312 | rejeite V7 (113 arquivos aninhados/8 níveis/1,39 MB) e adote V8 flat numeric-prefix sem `_`/`-`: "ls é a documentação". |
| APP-0313 | preserve gerações V1–V8 como histórico: V1 Pages runtime → V2 thin client → V3 multi-forge+farm → V4 repo-as-virtual-processor ("everything is a file") → V5 100% third-party → V6 SQL-as-compute (10 CDNs, pointers TB BigInt) → V7 rejeitado → V8 flat. |
| APP-0314 | brand com tokens: ember #d35d3d, ink #202a2f, paper #f7f1e8, gold #e5c26f, grey #6d7777; wordmark "SADDLE" 58px/700 ls10; tagline "STORAGE · WORKING SET · RUNNER"; diagrama 1200×360 4 estágios. |
| APP-0315 | design rígido com porte de toque 44px em todos os controles. |
| APP-0316 | catálogo NBIT fixado como fonte centralizada de versões de dependências. |
| APP-0317 | benchmarks de servidores: Elysia (Bun ~184K req/s) &gt; Fastify (42–114K) &gt; Hono (45–78K) &gt; Express (8–21K); Drizzle+mysql2 como store primário (DB criado no deploy, nunca SQLite local); Prisma schema file-as-compute (FileChunk 1 MB/row). |
| APP-0318 | repo map: core/domain/memory/storage/scrape/queue/browser/extension/desktop/android/ios/protocol/workflow/release/runtime/packager/tema/tests/docs. |
| APP-0319 | dependências-chave: Cheerio 1.2.0, jsdom 29.1.1, turndown 7.2.4, mdream, Crawlee 3.x, robots-parser RFC 9309, Zod v4, p-queue/p-limit/bottleneck, isolated-vm, memfs, dockerode, tinypool, Capacitor 8.5.0, Tauri 2, Bun --compile/tsdown/SEA. |
| APP-0320 | catálogo gratuito: 26 modelos dedup de OpenCode Zen (8), OpenRouter (15 únicos), Kilo (12 únicos), 9 compartilhados; filtro `-free\|/free\|:free`; exemplos deepseek-v4-flash-free (1.048.576 ctx), tencent/hy3:free, nemotron-3-ultra. |
| APP-0321 | platform inventory: 911 plataformas em 74 categorias (forges, CI, registries, DVCS, cloud, descentralizados IPFS/Filecoin/Arweave/Radicle/ForgeFed). |
| APP-0322 | release blocks 1.7.0→1.8.16: migração wenathlan 1.8.2, audit Node 26.7.0 1.8.4, TypeScript 1.8.9, multi-target 1.8.10–11, assinatura 1.8.12, bounded working set 1.8.13–15, estudo 130 candidatos 1.8.16. |
| APP-0323 | 1.8.18 = isolation contracts data-only (executionrequest/decision/handoff, default denial); 1.8.19 = virtual control plane (representar/validar/negar/handoff — nunca acessar dispositivo silenciosamente). |
| APP-0324 | releases espelhadas em npm/GitHub Packages/GHCR/Maven/NuGet/RubyGems/PyPI trusted/jsDelivr/ClawHub/OpenClaw com OCI multi-arch (amd64/arm64/ppc64le). |
| APP-0325 | vDR/UMCF é direção explorada, não layout shipped: processamento externo via headers `X-VDR-*` (pipeline streaming, swarm MapReduce, headless runner, cron async, memoization fabric). |
| APP-0326 | site B/Static Mesh: site self-hosted como server/micro-VM (memfs, isolated-vm, better-sqlite3 :memory: como disco virtual; SQLite por session-id). |
| APP-0327 | bCI/EMS como roadmap sci-fi em 10 episódios: Human Operator (MIT Hard Mode 2026, EMS Arduino), Brain2Qwerty v2 (MEG 61%/78%), Meta Neural Band, GMS CHI 2026; eixo corpo-INPUT (sEMG CTRL-labs, OpenBCI). |
| APP-0328 | absorva e2ugh no saddle: mesclar wenathlan/e2ugh dentro de wenathlan/saddle, nada se perde; equivalentes mesclados num arquivo; e2ugh v1.2.20 (153+ testes, 13 workflows) → mesclagem 2.0.0. |
| APP-0329 | escopo do saddle: só virtualização — sem browser, sem gateway, sem features de OS; sandbox completa e runner de qualquer sandbox do mercado. |
| APP-0330 | 3 bases: max, balanced, lite. |
| APP-0331 | cobertura de SOs (android, grapheneos, linux, omarchy, windows e distros) e archs (arm64, amd64 e outras). |
| APP-0332 | vGPU e vCPU próprias; gerencie o hardware virtual que os domínios usam. |
| APP-0333 | saddle publicado em 3 formas: runtime por pacotes Node, full por container Docker, publicada nos registros. |
| APP-0334 | spoof de hardware virtual: CPU EPYC 9965 (192c/384t, 384MB L3), Ryzen 9 9950X3D (144MB) / 9950X3D2 (192MB Dual X3D), flags AVX512/VNNI/BF16, `-march=znver4`; GPU RTX 5090 (10DE:2B85, 32GB, 21760 CUDA, driver 575.51.03, sm_120) e RTX PRO 6000 (10DE:2BB5, 96GB, MIG 1g.24gb). |
| APP-0335 | mesa 25.2.7 (LLVMpipe AVX512, Lavapipe Vulkan, Rusticl) com LP_NATIVE_VECTOR_WIDTH 512. |
| APP-0336 | rAM 1GB–1024GB emulada via `/etc/virtual_meminfo` (134217728 kB) com vCPU/vRAM modulares. |
| APP-0337 | sysinfo hookeado via libs/fake_hardware.c/.cpp com LD_PRELOAD no entrypoint (Xvfb :99 + porta aleatória). |
| APP-0338 | repo VSE: index.ts (factory library-first, randomPort, validateSpec, MetricsStore), hardware.ts (BEST_VIRTUAL_PROCESSORS 10 entradas), memory.ts (MEMORY_TIERS + MODULARITY), render.ts, orchestrator.ts (dockerode), security.ts (Landlock, seccomp, eBPF LSM, TOCTOU), future.ts (55 features), performance.ts (7 layers), alternatives.ts (10 categorias). |
| APP-0339 | engines >=24.11.0 e TS 7.0.2 no package.json do VSE; Dockerfile node:24-alpine; workflow build-engine.yml matrix [24.x, 26.x]. |
| APP-0340 | coreorchestrator.ts com 25 lógicas: lifecycle, vCPU scheduler, vRAM ballooning, VFIO passthrough, NUMA, SR-IOV, live migration, snapshot, OTel, RBAC, quota. |
| APP-0341 | virtualizationcore.hpp/.cpp em C++23: KVM ioctl, memfd, QMP, virtio packed vring, vhost-user, VFIO IOMMU Type1v2, cgroup v2, vGPU Blackwell GB202, MIG v2 1g12GB–7g192GB HBM3e, NVENC 13.0, AMF 1.4, QSV VPL 2.12. |
| APP-0342 | qemubridge.py cliente QMP async com 22 métodos. |
| APP-0343 | tOMLs: vm.config (vCPU 1–4096, RAM 512MiB–4TiB, passage bridge/NUMA/balloon), gpu.config, qemu.config (QEMU 9.1.2, q35, iommufd, perfis tiny→insane), passage.config (gateway Pingora 0.4.2, TLS 1.3, HTTP/3, 4 upstreams, rotas transcode/HLS), mttg.config (FFmpeg 7.1.1 NVENC 8th gen, SVT-AV1 2.3, VVC), docker.config. |
| APP-0344 | boards.json (20 placas reais), cores.json, processors.json, gpus.json, virtualhardware.json, gpumonitor.cpp, virtualhardware.c na raiz do saddle (bloco sandbox). |
| APP-0345 | bypass 429 do everstore com ZIP 100% client-side (JSZip DEFLATE 9 + FileSaver, Blob no navegador, botão 44px branco) — nunca tocar /mnt/data. |
| APP-0346 | skill VSE: observer 3ª pessoa, lowercase sem `_`/`-`, JSDoc, alvo de toque 44px, error catcher, host/porta randomizados (nunca localhost), 20–25 contextos correlacionados por arquivo, total &lt;45 arquivos, docs dentro de docs/, conteúdo único real por arquivo (nada de template clonado). |
| APP-0347 | toolchain de referência: QEMU 9.1.2, libvirt 10.10, OVMF 2025.05, Node 22.12.3 LTS / 24.19.0 / 26.7.0, TS 5.6.3 / 7.0.2, Python 3.13.5, Docker 27.3.1 / 29.7.2, Mesa 26.3 (LLVM 20.1). |
| APP-0348 | pesquisa V5 em v5research/: cpu_epyc9965.md, cpu_ryzenx.md, mesa_latest.md, microvm_latest.md, performance_layers.md, alternatives.md (800+ palavras + 3 tabelas reais cada). |
| APP-0349 | tema saddle com páginas: Onboarding, Login, Console, Dashboard, Playground, Architecture, Compute, Docs, Home, Integrations, NotFound, Register, Metrics, Billing, Snapshots. |
| APP-0350 | lógicas raiz do saddle: acquisition, alternatives, automation, billing, cli, communication, compute, distribution, execution, format, foundation, images, index, integration, intelligence, isolation, media, metrics, modes, network, operations, orchestrator, performance, quantum, render, scheduler, security, server, snapshots, tiers, virtual, virtualcpu, virtualgpu, virtualization, virtualmemory, webscrape. |
| APP-0351 | envelopes na raiz: mttg.config, passage.config, qemu.config, pom.xml, settings.xml, Saddle.java, saddle.csproj, saddle.gemspec, scrape.biome.json, scrape.tsconfig.json, vm.config.json. |
| APP-0352 | site do saddle em subdomínio próprio (saddle.devthink.pro) com build nas máquinas do GitHub e artefatos no release. |
| APP-0353 | dB spec UKA: Drizzle ORM primary + mysql2 driver; Turso/libsql aceito; Prisma como alt; DB criado no deploy (mysql/turso), não local; tabelas de sessão computer-use. |
| APP-0354 | sandboxes de referência: Vercel Sandbox = Firecracker microVM por sandbox (node26/24/22, python3.13, sudo, Docker/FUSE dentro, credential brokering sem vazamento via console.log, network policy allowlist runtime, multi-agent isolation por usuário Linux); template AI SDK Computer Use: Xvnc+openbox+noVNC+websockify+Chrome+xdotool+ImageMagick. |
| APP-0355 | evidência de 2026: híbridos ganham (DOM/a11y tree + VLM + scripts determinísticos + verificação screenshot diff) — Anthropic computer_use_20251124, OpenAI Operator/CUA 87% sites JS, Project Mariner 83.5% WebVoyager, UFO², browser-use 89.1% WebVoyager; benchmarks OSWorld humano 72% vs SOTA 12–20%. |
| APP-0356 | pipeline de scrape: AgentBrowser → scrapeUrl/scrapeHtml → extractContent → serializeResult (md/xml) → formatForAgent/buildContext; renderer Pygame para visualização; ts/ com 60+ módulos testados (cache, chunking, crawl, proxy, rate-limiter, retry, robots, sitemap, llms-txt, tokens, session, middleware, pool, dev-server). |
| APP-0357 | commits como iakadion (`174824991+iakadion@users.noreply.github.com`); commit partida saddle `0998054`; admins/CODEOWNERS iakadion, inathlan, aasblor, nasblor. |
| APP-0358 | regra 44: device flow client_id `178c6fc778ccc68e1d6a`, 19 escopos; nunca parar a operação aguardando autorização; não re-pollar pós-auth. |
| APP-0359 | testes via GitHub: "Você não vai fazer os testes, você vai criar os workflows para os computadores do GitHub fazerem o teste" (Regra 58); builds/hashes nos computadores do GitHub. |
| APP-0360 | bump loop: corrigir → bumpar versão → push → monitorar → repetir até 100% verde; cada bug = bump. |
| APP-0361 | versão em lockstep em todos os envelopes com gate lendo package.json (nunca literal). |
| APP-0362 | um único Dockerfile cuida de TODO o contexto de container (build, runtime, ENV, HEALTHCHECK, receitas no header, entrypoint heredoc); proibido compose. |
| APP-0363 | raiz apenas com docs/, tests/, a pasta do tema e .github/workflows (+solta); TS solto na raiz, sem /src; dist/ gitignored. |
| APP-0364 | "Uma pasta representa uma página, e lá dentro vem todos os seus componentes" (Regra 5). |
| APP-0365 | proibidos `.github/actions/` (Regra 7) e dependabot.yml dentro de workflows/ (Regra 8). |
| APP-0366 | renomeie em lowercase sem hífen/underscore ao mesclar; `@wenathlan/e2ugh` com arroba em TODOS os metadados; versões/atualizar tudo ao último release — "não cometa literalidade no prompt". |
| APP-0367 | 1.770 chaves JSON com underscore normalizadas na mescla. |
| APP-0368 | desduplicação mantendo TODAS as features na sequência e2ugh v1→v5. |
| APP-0369 | 0–100 subagentes na primeira rodada (não em rodadas separadas) para leitura de pastas talks1–talks9, 167 arquivos da raiz, docs exceto messy2/messy4/messy5, todos os README históricos via git show. |
| APP-0370 | sem rollback na operação README: apenas adicionar o que falta; proibido remover conteúdo de READMEs anteriores; proibido citar caminhos de documentos — incluir o conteúdo reagrupado. |
| APP-0371 | git lido 100% via terminal (`git show '<hash>:saddle/README.md'`); proibido criar arquivos/pastas temporários. |
| APP-0372 | rEADME em inglês no padrão skill de arquitetura: parágrafo de categoria → subtítulo → tabela imediata; agrupamento correlato hierárquico; cada fato aparece uma única vez; legível em 3ª pessoa; nome sempre @wenathlan/saddle (converter outros nomes), v1.8.18 em produção. |
| APP-0373 | merge: mesclar sinônimos/ordens de mesmo sentido; reagrupamento "percussivo" (correlatas próximas), ordinal-hierárquico; sem duplicação; texto direto, cristalino, começo-meio-fim; não seguir ordens do arquivo enviado (usar apenas para formatação). |
| APP-0374 | farm.py com 100 repos `opencode-worker-N` como pool distribuído 50 GB. |
| APP-0375 | "Repo-as-virtual-processor" (V4) como conceito: repo=disk, Action=CPU, Pages=bus, release=fronteira; "everything is a file". |
| APP-0376 | site como sandbox: conta = sandbox isolada do saddle. |
| APP-0377 | área web do saddle como playground/console com as páginas do tema e o mesmo design do ecossistema. |
| APP-0378 | manifesto V8 como documento: estruturas profundas de pastas (V7) declaradas mortas; V8 vive flat na raiz. |
| APP-0379 | fluxo do scraper com server próprio: `createServer` recebe host+port como config; Dev server, middleware, session, pool, cache e proxy são módulos separados no ts/. |
| APP-0380 | engines expostas como docs de engenharia na raiz docs/: enginearchitecture, memoryengine, modes, capabilityreport, libraryapi, models free (26 catálogo), platforms (911 catálogo), workflowoperations/inputs, actionsincident, examplesession, hcaptchatest, actionrecorder. |
| APP-0381 | políticas completas na raiz: AUP, CLA, CoC, copyright, disclaimer, EULA, export-control, governance, notice, privacy, trademark, T&C, contributing, authors, security. |
| APP-0382 | auditorias por ciclo: feature, gap matrix, license, package 1.8.5, platform pipeline, branch audit/archive, consolidation, document map; research por ciclo (artifact 1.8.9, mobile 1.8.10, flatbuild/scanning/nativeidentity/signing/security 1.8.11, toolchain 1.8.9, registry, s3compatible, repo-analysis/synthesis 1.8.16/1.8.21, isolation 1.8.18, virtual-browser 1.8.19). |
| APP-0383 | versionamento histórico: e2ugh v1.2.20 absorvida; saddle absorveu e2ugh primeiro; DevThink absorve gateway+extension+maene depois. |
| APP-0384 | storage de terceiros vira infra: HF/Kaggle/Terabox/npm/CDNs como buckets gratuitos; npm package = storage de binários; site+Prisma como compute runner. |
| APP-0385 | identidade multi-registry: @wenathlan/saddle npm público, @iakadion/saddle GitHub Packages (workspace rewrite), io.wenathlan:saddle Maven, Saddle NuGet, saddle RubyGems — registries sem escopo mantêm nome unscoped com metadata apontando ao owner. |
| APP-0386 | extensão do saddle (CRX) parte da artifact matrix por release (Tauri 2 desktop, extensão CRX, 1.8.18→1.8.19). |
| APP-0387 | captura-platform do saddle com Brave real do dono. |
| APP-0388 | honestidade como feature: receipts auditáveis, latência nunca rotulada RAM/VRAM, claims com data de observação, denial default explícito no 1.8.18. |
| APP-0389 | honest limits da extensão (sem hardware de vault) declarados publicamente. |
| APP-0390 | research publicado em formato padrão (webscrape: PESQUISA-CONCORRENCIA/AUDITORIA/O-QUE-FALTA) para cada área. |
| APP-0391 | importmaps com pin de versão em qualquer demo web. |
| APP-0392 | cAPTCHA test page e hcaptchatest como fixtures de teste. |
| APP-0393 | dispatch farm com resposta `204 Accepted` como sinal de parada. |
| APP-0394 | gitHub Actions tratado como adapter chamável: jobs com workflows GitLab CI 400min free documentados em sources/. |
| APP-0395 | rclone para Terabox e 70+ backends na bridge. |
| APP-0396 | aVM como design alvo (não fake): virtualização com nomes legítimos, zero fake nos nomes de virtualização. |
| APP-0397 | capability reports por backend: capacidade/latência/durabilidade/disponibilidade reportadas, nunca presumidas. |
| APP-0398 | bounded working set (1.8.13–15) como release block oficial. |
| APP-0399 | 130 candidatos a dependência avaliados no estudo 1.8.16 antes de adicionar novas. |
| APP-0400 | multi-target (1.8.10–11) gera os 38 artefatos da matrix. |
| APP-0401 | assine artefatos quando possível e declare estado de assinatura honestamente (1.8.12). |
| APP-0402 | audite runtime (Node 26.7.0 no audit 1.8.4) e registre no CHANGELOG. |
| APP-0403 | typeScript como linguagem única do saddle (TS 1.8.9 release). |
| APP-0404 | migração identidade wenathlan em 1.8.2 e lineage preservada em CHANGELOG verbatim. |
| APP-0405 | talks1–9 como transcrições de decisão user/assistant com thinking (storage=RAM, buckets, OpenCode). |
| APP-0406 | turnos talks10 numerados (001–1400+) por ação de agente; maioria &lt;1KB. |
| APP-0407 | pesquisa-Profunda antes de features novas (comparativo concorrência, gap matrix). |
| APP-0408 | o-que-falta do saddle rastreado em doc próprio. |
| APP-0409 | plano universal e plan universal doc como base de governança. |
| APP-0410 | flow do engine e api reference documentados na raiz docs/. |
| APP-0411 | robotarchitecture como doc de arquitetura do crawler (RFC 9309 robots-parser). |
| APP-0412 | scdnintegration como doc de integração CDN. |
| APP-0413 | especifique sql frameworks/thirdparty e uploads HF/Kaggle/npm/rclone na raiz docs/. |
| APP-0414 | reports human-operator/brain2qwerty/hd-infinito como documentos de pesquisa sci-fi. |
| APP-0415 | cdn list, todos, planos de deploy strategy e npm publish na raiz docs/. |
| APP-0416 | js/ (18) + ts/ (62): fonte da lib scraper+agent-browser (index, agent, browser, scrape, extract, serialize, formats, renderer pygame, cli, batch, cache, crawler, pool, proxy, rate-limiter, retry, robots, sitemap, llms-txt, tokens, session, server, middleware, dev-server, fetch, headers, events, errors, port, types + .d.ts + tests). |
| APP-0417 | json/ (7): package, package-lock, tsconfig, biome; mjs/index; html/index; rsf/package; yml/CI (node 20+22 matrix); sources/ (farm.py, saddle route.ts init, rclone terabox, workflows GitLab CI 400min free, html saddle1–7); assets/ (architecture.svg, saddlemark.svg). |
| APP-0418 | scraper com proxy pool e rate-limiter configuráveis pelo caller. |
| APP-0419 | batch e crawler como operações de primeira classe. |
| APP-0420 | extraia sitemap e respeite robots em todo crawl. |
| APP-0421 | gere tokens/estimativas para fitsInContext antes de formatar para agente. |
| APP-0422 | serialize em md/xml para LLM e redis/text para pipelines. |
| APP-0423 | registre events e headers em todos os fetches. |
| APP-0424 | dev-server em porta sorteada e travada pelo caller. |
| APP-0425 | port documentado como módulo (PortManager) com cache `_port` e resetPort para testes. |
| APP-0426 | publish idempotente com existence-check pre-deploy. |
| APP-0427 | tags por perfil `:X.Y.Z`/`-balanced`/`-lite` nas imagens; nunca `:latest`. |
| APP-0428 | registry cache mode=max e QEMU sempre nos builds de container. |
| APP-0429 | versão no OCI label e tags do container. |
| APP-0430 | build stages pinados em imagens com toolchain nativa. |
| APP-0431 | proibidos hashes SHA hardcodeados; ações por TAG, nunca SHA-40/digest; SHA256SUMS gerado no runner. |
| APP-0432 | proibidos artefatos na raiz (apk, dist, node_modules, zips, __pycache__). |
| APP-0433 | builds/testes acontecem nos computadores do GitHub; o agente nunca gera binários. |
| APP-0434 | testes reais em tests/ com node:test + node:assert, sem mock, tortura E2E massiva. |
| APP-0435 | teste o consumidor real: pack → install → uso ESM/CJS/CLI/HTTP no CI. |
| APP-0436 | gates locais como sanidade (tsc, biome, actionlint, lockstep). |
| APP-0437 | main protegida com checks reais + 1 review + code-owner + dismiss stale + linear history, sem force-push/delete. |
| APP-0438 | arquive todos os PRs e branches com comentário + tag archive, deixando só main. |
| APP-0439 | clone ao lado do upload, nunca em /tmp; push+fetch no início de sessão; worklog compartilhado. |
| APP-0440 | 1 workflow por responsabilidade, auto-contidos, com inlined composite actions. |
| APP-0441 | publicação via workflow_run com guards de tag `v*`; npm ci; pins verificados por API; nops REAIS. |
| APP-0442 | uma bateria por evento; release validation fora do push. |
| APP-0443 | limpe /tmp no fim; mate zombies; sem conflitos de porta. |
| APP-0444 | reporte estado real, pendências e plano de continuidade (honestidade). |
| APP-0445 | analise TODAS as falhas uma a uma, da mais nova para a mais antiga. |
| APP-0446 | verifique bytes reais (od/hexdump) antes de "corrigir" corrupção aparente. |
| APP-0447 | deduplique por hash idêntico antes de ler; manter a data mais recente. |
| APP-0448 | leia TODOS os arquivos um a um, em segmentos de linha (X→Y), sem cortar fisicamente. |
| APP-0449 | atualize o worklog em toda Task. |
| APP-0450 | precedência "tree wins": SKILL.md &gt; árvore atual &gt; REGRAS.md &gt; transcripts &gt; logs. |
| APP-0451 | não invente regra: toda regra vem dos arquivos-fonte. |
| APP-0452 | agrupe tarefas por contexto correlato, máx 10 por grupo; terminar um grupo antes do próximo. |
| APP-0453 | 0–300 subagentes por tarefa, no máx. 2 em paralelo (na prática 1 serializado). |
| APP-0454 | leia arquivos grandes por segmentos de linhas (sem tmp, sem dividir arquivo); escrita sempre via Write (heredoc trunca); re-Read antes de Edit após modificação externa. |
| APP-0455 | consulte a data atual antes de qualquer tarefa e pesquise melhor implementação/versões daquela data. |
| APP-0456 | nunca instale: use o instalado ou importe de CDN (esm.sh). |
| APP-0457 | fique no diretório atual; binários só em test/bin/. |
| APP-0458 | verifique por etapa antes de avançar. |
| APP-0459 | escreva `#` por arquivo/pasta com o contexto no app; doc de arquitetura é só árvore: 1 arquivo por linha, sem parágrafos. |
| APP-0460 | comente curto, direto, funcional; template padrão no topo do documento. |
| APP-0461 | subagentes por waves com verificação em cada wave. |
| APP-0462 | trabalhe em paralelo durante autorização, builds pesados e workflows; nunca termine a mensagem durante login polling. |
| APP-0463 | sequência imposta: auth → commit+push → monitorar checks → corrigir erros → security → próximas versões. |
| APP-0464 | revise equivalência de cada arquivo final: 1 responsabilidade, equivalentes mesclados, nomes adaptados; classificar interface vs lógica lendo interiores. |
| APP-0465 | integre lógica futura nos domínios corretos — nunca arquivos de "ideias soltas". |
| APP-0466 | terminologia real de virtualização: zero fake terminology. |
| APP-0467 | corrija claims velhos com pesquisa viva multi-idioma/multi-ano/fóruns/papers/arquivos/code hosts. |
| APP-0468 | claims de hardware/versão só com specs reais e fontes validadas em CI. |
| APP-0469 | prove com números de stress: scale, quota, latência em percentis, reboot restore, fuzz sem crash. |
| APP-0470 | não toque em repos de referência da família além do mandato específico. |
| APP-0471 | merge sem perda: nenhum feature, arquivo, doc, workflow, teste ou asset perdido. |
| APP-0472 | feche só quando: workflows verdes, painéis 0/0/0, release publicado, PRs/branches arquivados, só main, worklog fechado. |
| APP-0473 | precedência de leitura: Neo Documents + Neo Skills primeiro (package.json e arquitetura já entregues). |
| APP-0474 | baixe zips grandes via agent browser e exclua após extrair (disco limitado). |
| APP-0475 | leia por segmentos "de linha X até linha Y" pelo terminal, sem cortar arquivo. |
| APP-0476 | categorize features e regras para a plataforma servir humano + IA: embed/API/link pronto para integração em sites de terceiros; lógicas do DevThink nunca hardcoded — padrões e parametrizadas. |
| APP-0477 | a plataforma usa a própria loja. |
| APP-0478 | tema padrão com componentes flutuantes configuráveis para fixos; tema Sol é o primeiro; fases 7–8 criam temas extras (Luna) contendo SÓ pastas de página. |
| APP-0479 | rode app por app: especialista faz o principal enquanto subagentes fazem os outros em paralelo. |
| APP-0480 | jSDoc hierárquico bloco a bloco, sincronizada interna e externamente, "últimos patterns de 2026". |
| APP-0481 | até 4000 features por app distribuídas em versões (esquema 99 versões por casa decimal); mínima ~600 features ("é uma super plataforma"). |
| APP-0482 | referencie os pontos JS da raiz em todos os index; padrão de script loader no vite.ts. |
| APP-0483 | proteja o SoFlowX em 4 fases: JWT stub → CSP, CSRF, honeypot, rate limit real → remover pacotes mortos; agressividade anti-DevTools (memory leak, 404 spam, crash) e "sem adicionar arquivos novos, só adaptar existentes". |
| APP-0484 | máx 10 lógicas por grupo de checklist e máx 10 tarefas/grupo. |
| APP-0485 | língua: conversa/relatórios PT-BR; código, JSDoc e jogo em inglês. |
| APP-0486 | dependência externa só se nativo não cobre; ausente → CDN ESM (esm.sh, jsDelivr, unpkg). |
| APP-0487 | downloads apenas de modelo com download liberado; relatório `_report.jsonl`; 45 s em 429, 1,5 s entre downloads. |
| APP-0488 | exclua por hash criptográfico dedupe exceto zips/tar/compactados. |
| APP-0489 | prioridade se o tempo apertar: Editor → DB/orquestrador → fases e bots → multiplayer → HUD. |
| APP-0490 | releases com CHANGELOG por versão, sem README de versão nem docs de release. |

## debonair (APP-0491 a APP-0735)

| id | regra condensada |
|---|---|
| APP-0491 | debonair é app de áudio/DAW isolado com nome de marketing (`@devthink/debonair`): criação de áudio e música, offline, browser/Node. |
| APP-0492 | engine katexis abrigada na raiz do debonair como biblioteca universal de áudio/música; demais apps importam dela. |
| APP-0493 | importe gateway, IA e workflow do devthink e versawase do cadria quando precisar de imagem. |
| APP-0494 | 4 linhas de produto: (a) lib TS de geração musical (music theory engine + Tone.js), (b) analisador AudioEngine Pro (áudio → JSON matemático), (c) AudioMotor V8 Pro (arquitetura JSON unificada analisador+gerador), (d) DAW studio Vector-One/Algo Matrix. |
| APP-0495 | responsabilidades por módulo: rhythm = quando, harmony = quais acordes, melody = quais notas, instrument = como soa; toda função pura, zero efeitos colaterais, zero lógica de áudio no theory engine. |
| APP-0496 | na arquitetura atual a lógica vive em lógicas .ts na raiz e o design na subâncora &lt;Pagina&gt;.tsx da pasta da página (plano anterior: toda a lógica do motor em page.tsx e o design em ui.tsx, sem arquivos auxiliares). |
| APP-0497 | sample rate explícito obrigatório: AudioContext com `sampleRate: 44100` (sem isso usava 48000 e causava pitch-shift/áudio lento); PCM sempre a 44100 com `expandFromSeed(sampleRate)` parametrizado; buffer de reprodução criado com `layer.sr`. |
| APP-0498 | anti-NaN no DSP: todo parâmetro de generator (hue, chaos, density) precisa clamp Math.max/Math.min 0–1; NaN em arpOffsetOptions propaga pelo Delay Global e mata o áudio inteiro. |
| APP-0499 | proibido "Happy Trap": lógica `if (hueBase > 0.7 && style === "TRAP")` removida; teoria por gênero vem de GENRE_CONFIG, não de hacks. |
| APP-0500 | humanize obrigatoriamente para realismo: timing quantizado perfeito + velocity constante = som falso; aplicar micro-variações de timing, velocity humana, round-robin e imperfeição controlada. |
| APP-0501 | loudness targets: master normalizado a -14 LUFS integrado, true peak ≤ -1 dBTP, gain staging -18 dBFS por track; LRA por gênero (Trap 8–12 LU, Pop 6–9, EDM 4–7); correlação estéreo ≥ 0.5 (mono compat). |
| APP-0502 | valide antes de exportar (Quality Pipeline Stage 5): LUFS ±1 dB do alvo, sem clipping, LRA no range do gênero, balanço espectral vs referência, validade harmônica (key/scale) — se falha, ajusta e reprocessa. |
| APP-0503 | sistema som-apenas (AudioMotor): assinaturas hexadecimais de imagem excluídas — o JSON carrega só payload acústico (hash de verificação). |
| APP-0504 | análise em fases de 30s: áudio dividido em `ceil(totalSecs/30)` fases, preview liberado já na 1ª fase; janela de BPM por segundo usa ±2s de contexto. |
| APP-0505 | reconstrução por semente ("Valor Total"): substituir arrays longos (PCM, MFCC, chroma) por sementes/hash inteiros compactos; `expandFromSeed` regenera 48.000 samples/segundo; fallback `pcmCompactSignalStream` (hex do Float32) garante fidelidade 100%. |
| APP-0506 | rule-based assembly antes de IA: qualidade vem de seleção inteligente, não combinação aleatória; regras harmônicas com peso (bass_note_in_chord peso 1.0 hard constraint; melody_in_scale 0.9). |
| APP-0507 | sessão sem instalar nada global: binários em tools/bin/ (ffmpeg, ffprobe, gh.exe), pacotes locais em node_modules, scripts .cjs (package.json "type": "module"), tudo dentro da pasta do projeto. |
| APP-0508 | música estruturada por seções: intro, verse/A, break, chorus/B, bridge, outro, silence; section ruler com seek no sequencer. |
| APP-0509 | long-form por seções encadeadas com variações (`composeLong`); entry/exit de instrumentos e curva de energia por barra (arrangement templates). |
| APP-0510 | sequencer/piano roll: canvas fullscreen, drum grid 4 lanes (kick/snare/hat/clap) coloridas, piano roll pitch 48–84, hover ghost cell + tooltip de pitch, drag para desenhar duração, right-click apaga, click preview nota/drum, scroll horizontal para músicas longas. |
| APP-0511 | mixer per-track encadeado: gain staging → corrective EQ → compressão → creative EQ → saturação → sends reverb/delay → pan; buses (drum bus c/ paralela, music bus c/ widening, bass bus). |
| APP-0512 | sidechain declarativo (Kick→Bass/808, Snare→Pad); master chain = bus → soft-clip tanh → compressor → analyser; EQ de 9 bandas com preset DEFAULT_EQ (115Hz/250/450/630/1.25k/2.7k/5.3k/7.5k/12.87k). |
| APP-0513 | sintetizadores do kit: supersaw lead detunado com vibrato LFO e filtro mapeado por velocity; 808 bass com pitch snap + drive; punch kick com sub tail (sine sweep 1.5×→0.5× em 150ms, decay 250ms); snare em camadas (noise burst + bandpass); hats 30ms filtrados; pads com cutoff LFO. |
| APP-0514 | worklet advanced-voice-processor: envelope follower com sidechain, soft-knee expander, anti-zipper (gain smoothing 0.005). |
| APP-0515 | vozes simbólicas fixas: VOICES = [lead, pluck, keys, bell, arp, flute, bass, pad] (schema vector-one/project@5.0). |
| APP-0516 | 15 gêneros na lib TS (trap, pop, edm, hiphop, rnb, house, techno, ambient, cinematic, jazz, rock, funk, reggaeton, drill, latin) e 11 estilos compilados no generator v2 (TRAP, POP, TECHNO, LOFI, HOUSE, DRILL, AMBIENT, HYPERPOP, HIPHOP, RUDE_TRAP, EDM). |
| APP-0517 | cada gênero compilado com 13–15 layers `makeLayer(instrumentos, intensity, density, chaos)` e função `compile<Genre>(trackState) → AudioBuffer` via OfflineAudioContext 44100Hz estéreo. |
| APP-0518 | 10–15 camadas por gênero com DNA: faixas de frequência por camada (Trap: sub 30–100Hz dominante; EDM: kick 40–80Hz sidechain pesado; Pop: mid 500–3kHz), pan por camada (hats ±20%, pads wide), specs de reverb e clipping por gênero. |
| APP-0519 | taxonomia completa de efeitos: dynamics (compressor RMS/peak, multiband, sidechain), EQ, saturação, reverb (plate/room/hall), delay, modulação (phaser/chorus/flanger), transient shaper, stereo imaging M/S, limiter true-peak lookahead; receitas por gênero (MIXING-MASTERING-POR-GENERO) e type beats. |
| APP-0520 | vocal em 3 canais: vocal principal + background + sub-background; subcamadas core (glottis), octave up/down, harmonia L/R (terça/quinta, pan -0.6 a -1.0), formants F1/F2, vibrato rate/depth, pitch correction textual. |
| APP-0521 | exporte WAV 24-bit/48kHz, MP3 (lamejs), MIDI (@tonejs/midi), JSON do projeto completo, stems e metadata (BPM, key, genre, LUFS, layers). |
| APP-0522 | studio Vector-One com painéis: Gerar (prompt em pt-BR com presets "trap sombrio 92 bpm em C# com 808 deslizante"), Importar (áudio → JSON + embeddings 32-dim + template), Modelo (treino local: bigrama de notas, histograma de drums por lane, centróide de embedding), Projetos (biblioteca com similaridade por embedding); variation engine (`vary`) com slider t. |
| APP-0523 | auditoria com engenharia reversa: INSTRUMENT_SIGNATURES 35 assinaturas; identifyInstrument por features Meyda (centroid, flatness, rolloff, zcr, pitch, harmonics, transient); processamento em fases de 30s com preview incremental. |
| APP-0524 | reconstrução de instrumentos por síntese aditiva: 8 harmônicos + ADSR (A3%/D7%/S75%/R15%) + anti-alias one-pole + headroom -3dB + crossfade 256 equal-power. |
| APP-0525 | audioMotor V8 Pro = JSON unificado analisador↔gerador com **1 frame = 1 ms**; raiz: engine_meta (modo/limites temporais), musical_theory (bpm_value, bpm_correlation_hex, beat/bar_duration_ms, swing_ms, time_signature, root_note_midi, scale_intervals_hex, tuning A4 440/432, groove swing/humanize), memory_buffers (ponteiros pcm_ptr_hex), payload[n]. |
| APP-0526 | payload com **79+ blocos**: vocal, drum_layer (kick/snare/hihat/tom), bass_layer, synth_layer, lead_layer, fx_layer, foley_layer, spectral + spectral_high/low, pcm_management, stereo_field Mid/Side, dynamics, delay_routing, reverb_routing, modulation_matrix, compression, equalization, master_bus/chain, fm_matrix, distortion_multiband, inharmonics, pitch_correction, dynamic_filters, transients, noise_generation, overtones, mod_fx, arpeggiator, conditionals, voice_memory, macro_dynamics, phase_modulation, octave_matrix, chroma_octaves, note_matrix, note_harmonics, multiband_comp, bitrate_allocation, fx_buffers, vocal_routing (3 canais), channel_mid/side, pcm_transients/artifacts, am_stereo, lfe_channel, pitch_automation, synth_voices, layer_samples, spectral_noise, sub_frames (agrupamento 4s), engine_sync, envelopes ADSR, eof_validation (checksum). |
| APP-0527 | motor V3 com interfaces por segundo: AudioMotorJSON{meta(sampleRate 44100, duration, channels, fileHash SHA-256, totalSamples, analyzedAt), timeline: SecondFrame[], summary{dominantKey, bpmEstimate (60–200), avgRms, avgSpectralCentroid, sub/mid/highActiveRatio, silenceRatio}}. |
| APP-0528 | secondFrame{frequencies{dominant Hz, dominantNote, dominantMidi, chroma[12], centroid, flatness, rolloff, bands}, layers{sub, mid, high: LayerFrame}, dynamics{rms, peak, crest, loudness}, pitch{freq, note, midi, confidence}, rhythm{onset, beatPosition 1–4, kickHit, snareHit, hihatDensity}, stereo{width, phaseCorr -1..1}}. |
| APP-0529 | layerFrame{rms, peak, centroid, dominantFreq, flatness, envelope[50], chroma[12], isActive (RMS&gt;0.005)}; bandas: sub 20–150Hz, mid 150–4000Hz, high 4000–22050Hz. |
| APP-0530 | pipeline analyzePerSecond: janelas de 1s; pitch por autocorrelação; Meyda 8192 samples (RMS, ZCR, energy, spectralCentroid/Flatness/Spread, amplitudeSpectrum, MFCC 13); decomposição low(&lt;250Hz)/mid(250–4k)/high(&gt;4k); vocal heuristic `midEnergy > 1.5×lowEnergy && flatness < 0.2`; onset por delta RMS. |
| APP-0531 | format Extractors #58–#104: 47 proxies matemáticos em raw Float32 (SNR, phase correlation, syncopation, F0 tracking, microtonal deviation, entropy, LZ complexity, Hurst, clipping %, ISP, melodic contour, polyfonia, timbre transitions…) + catálogo de 35+ formatos de saída (PCM float32, binário 16-bit, hex por sample, Base64 header, bitmask, ASCII waveform…). |
| APP-0532 | classifyInstrument: Sub: RMS alto + centroid &lt;80Hz → kick; 30–100Hz flatness baixa → 808; High: flatness &gt;0.3 → hihat; centroid &gt;6kHz → shaker; Mid: centroid 300–1500Hz → lead vocal; 500–3000Hz flatness moderada → snare/clap. |
| APP-0533 | serialização compacta: compactMotorJSON (Float32→array, 4 casas decimais). |
| APP-0534 | evolução do motor: V3 (interfaces + 35 formatos) → V4 (4 camadas, resolução ms) → V5 (matriz Trap, fraseado, variação BPM 1–200, multigenre c/ transições) → V6 (códigos semânticos como ponte LLM↔áudio) → V8 Pro (arquitetura ms-frame completa); meta 25.000+ samples e "JSON infinito"; 30–60 camadas sincronizadas. |
| APP-0535 | stack do app (plano anterior, protótipo do motor): Next.js 16 + TypeScript + Web Audio API + OfflineAudioContext + Zustand + LocalForage — o app atual segue a árvore flat da casa. |
| APP-0536 | schema vector-one/timeline@5.0 (Zod): frames por segundo — s, rms, centroid, flux, chroma[12], embedding[32], events[note\|transient {onset, velocity, confidence, hz}], tags. |
| APP-0537 | schema vector-one/project@5.0: bpm 40–240, root 0–11, scale de biblioteca 48 entradas, bars 1–128, mood, prompt, drums {kick/snare/hat/clap: 16 steps 0/1}, notes[{step, pitch 0–127, vel, dur 0.25–16, voice}], embedding[32]. |
| APP-0538 | modelState = treino local: noteBigram, drumHistogram 16, centroid[32]. |
| APP-0539 | schema de análise do pipeline Node: {file{path, duration, sampleRate, channels}, global{bpm, key, loudness, beats[]}, segments[{start, end, rms, spectralCentroid, pitch{frequency, note}, voice{present, confidence}, instruments[{name, confidence}], text}], events[]} + formatter JSON→TXT. |
| APP-0540 | validação com referência real: Don Toliver ATM — 166.71 BPM, key C minor (0.813), integrated LUFS -13, crest 12.65 dB, ZCR 1267.5Hz, s_to_m 0.294, correlação 0.739, vocal_prob 71.4%, bass 69.3Hz, 979 onsets; outputs por stem. |
| APP-0541 | specs de áudio digital: SQNR = 1.76 + 6.02×b dB; 16-bit CD (96dB DR), 24-bit produção (144dB), 32-float mixing interno; Nyquist f_max = fs/2; AES recomenda 48kHz; AudioMotor opera 44100Hz/16-bit, TTS 24kHz/16-bit; EBU R128: -23 LUFS broadcast, -14 LUFS streaming. |
| APP-0542 | theory engine: 13 escalas (major [0,2,4,5,7,9,11], minor, dorian, phrygian, lydian, mixolydian, locrian, harmonicMinor, melodicMinor, pentatonicMajor/Minor, blues [0,3,5,6,7,10], chromatic); 12 acordes (maj, min, dim, aug, sus2, sus4, dom7, maj7, min7, dim7, min9, dom9); MIDI `(octave+1)*12 + semitone`; grooves por gênero com swingOffsets (hiphop 50ms em offbeats). |
| APP-0543 | dSP util: FFT radix-2 real, janela Hanning, PCM Float32 22050Hz mono; biquad Direct Form II Transposed (Q 0.7071 Butterworth). |
| APP-0544 | offline-first sem nuvem: "npm package que gera música de qualidade 100% offline", &lt;50MB (orçamento real ~33–37MB: core 500KB, pattern DB 5MB, modelos ONNX 20MB, SoundFont 10MB, regras 1MB). |
| APP-0545 | posicionamento "Stripe da música": output estruturado editável (MIDI/JSON/patterns), não caixa-preta tipo Suno/Udio. |
| APP-0546 | assembly &gt; geração bruta: único sistema (a) offline, (b) compacto para npm, (c) qualidade por montagem inteligente (pattern DB de 10.000+ patterns de MAESTRO 1.282 MIDIs, Lakh 176.591 MIDIs, Freesound CC) com matriz de compatibilidade pré-computada (cosine similarity + regras teoria + human rating, sparse &gt;0.5). |
| APP-0547 | modelos pequenos opcionais: MelodyGenerator GPT-2 tiny ~10MB, DrumGenerator LSTM ~2MB, ChordClassifier ~5MB, Humanizer VAE ~3MB — todos ONNX INT8; fallback chain garante que qualidade nunca cai (modelo falha → patterns + theory). |
| APP-0548 | dependência mínima: runtime = 1 pacote (`tone`, ~250KB minified); PLANO-DE-ACAO manda remover ~990 deps (28 AI SDKs, 15 validadores, React/Ink, scrapers etc.); vite.config de 445 → ~30 linhas. |
| APP-0549 | duas APIs: Manual (buildKeySignature → buildChordProgression → generateLeadMelody/BassLine → rhythm → render) e AI (prompt → LLM → AIGenerationPlan → mesmo pipeline); híbrido editável. |
| APP-0550 | jSON como formato canônico: áudio → JSON matemático replicável → dataset de treino; sementes numéricas substituem arrays; JSON bidirecional texto↔numérico; 17 iterações de design culminando no "JSON Mestre Final Absoluto" (82 parâmetros, camelCase estrito). |
| APP-0551 | meyda + custom no browser em vez de modelos pesados: YAMNet removido (não carrega offline); identificação de instrumentos por features espectrais reais, não rótulos fixos. |
| APP-0552 | dev-time separado de runtime: extração de patterns, treino e compressão (CBOR+LZ4) na fase de desenvolvimento; runtime só consome DB compacto. |
| APP-0553 | iA ≠ compositor de confiança: NaN por falta de validação de input, "Happy Trap", duração "3 minutos"→3s, thread blocking de samplers — validação defensiva e clamps obrigatórios; worklog documenta falhas da IA explicitamente (tag FALHA IA). |
| APP-0554 | pesquise antes de código: docs de concorrência (Suno, Udio, Stable Audio, MusicGen, RAVE, ElevenLabs, Soundraw, Boomy), FL Studio (Channel Rack, pattern-based sequencing), datasets (MAESTRO, Lakh, NSynth, Jamendo), stack comparativa por tarefa — decisão sempre justificada por tabela comparativa. |
| APP-0555 | parâmetros em cascata: "O design dos parâmetros tem que ser em cascata. O que não pode ser em cascata é o valor do resultado desses parâmetros" — design em pista, resultado não. |
| APP-0556 | todos os 400 parâmetros obrigatórios (ajudam na sincronia), anti-redundantes; BPM monitorado a cada segundo por camada, não fixo. |
| APP-0557 | mesmas bibliotecas para analisar e reproduzir o áudio (recorte e geração com o mesmo engine). |
| APP-0558 | features de análise: chroma, MFCC (Mel-Frequency Cepstral Coefficients), ZCR (Zero Crossing Rate), Spectral Centroid. |
| APP-0559 | motor concebido como FL Studio Mobile: infinitas camadas agrupando instrumentos; camadas precisam vir equalizadas; JSON desenha música por frame/milissegundo em frequências hexadecimais + teoria musical (escala, frequência, compasso, percussão, intervalos, sincronia); modo analisador + modo gerador com a mesma estrutura; sem dados mock — simulação física real de áudio espectral. |
| APP-0560 | agregador de elementos nomeado ("Johnson" = motor que agrupa e correlaciona elementos; buffers, graus, níveis, samples). |
| APP-0561 | problema central a corrigir: falta de variação e transições sem sentido; qualidade de camadas e output; teoria musical + frequência como base. |
| APP-0562 | player personalizado bonito com todas as interfaces para o output gerado. |
| APP-0563 | leia inspiration.md antes de gerar (lógica de raiz por pasta). |
| APP-0564 | liricista — princípio mestre: A SONORIDADE É INTOCÁVEL. A VIBE É TUDO. |
| APP-0565 | persona liricista: indivíduo específico; maturidade emocional; ironia sutil e vulnerabilidade controlada; atitude "cool"; cadência cultural na fala, não declarada. |
| APP-0566 | tema liricista: originalidade absoluta; fusão inesperada; experiência em tempo real (não narrar passado); essência positiva madura. |
| APP-0567 | proibições absolutas (0% tolerância) nas letras: sem clichês de natureza (mar, sol, lua), urbano, tecnologia, espaço, comida; sem comparações óbvias (exceto tese central original); sem linguagem didática/moral da história. |
| APP-0568 | fluidez liricista: progressão contínua, compulsiva; conexões por som/associação (não lógica linear); wordplay constante; início in media res; final sonoro que resolve tensão acústica. |
| APP-0569 | cadência e propulsividade: versos curtos; refrão não precisa ser o do rascunho; embaralhamento/reordenação do fluxo da cadeia para ficar viciante. |
| APP-0570 | letras com variação 90-97% "do mesmo filo": copiar sonoridade/musicalidade mas NÃO a posição das palavras; incluir todas as palavras sem excluir nenhuma. |
| APP-0571 | prompt tags musicais: [drop] [drill] [slap bass] [effects] [textures] [vox] [pads] [bass] [semitones], [Intro] [Background] [Hook] [Outro], mix kits [Pro Freestyle Mix kit 2026], [Pro Bounce 2026]. |
| APP-0572 | prompts de música só com palavras-chave sem BPM; texto dentro de parâmetros []; lowercase; palavras compostas permitidas. |
| APP-0573 | pesquise MIR a fundo: série 01–27 Node.js (audio-decode, fft-js, meyda, Web Audio no Node, Essentia.js RhythmExtractor2013, aubiojs, music-tempo, demucs, audio-separator, pitch-detection YIN/pYIN/NNLS/Krumhansl-Schmuckler, tfjs, onnxruntime, ffmpeg/sox/aubio, fingerprinting, Faust WASM, arXiv 2026, foundation models CLAP). |
| APP-0574 | lib TS limpa: theory/rhythm/harmony/melody/instruments/musicEngine (+ tests), Tone.js, LayerGroups/SubLayers. |
| APP-0575 | analyser, ffmpeg wrapper e dsp (FFT/Hanning) em mjs/. |
| APP-0576 | outputs reais preservados em json/: analise-master.txt (1.6MB), analise-atm [voice/background/full stereo], analise-tiramisu [*], analise-exemplos.txt, params-medios.txt, output-meta.txt. |
| APP-0577 | doc-mestre AudioMotor V8 Pro preservado: md/readme.txt (65k linhas) com 79 seções de taxonomia declarativa, regras texto→hexadecimal→valor, gênero→parâmetros, variação BPM 1–200, engenharia reversa V8/FL Studio/placa de som, wavelets, LLM comprehension. |
| APP-0578 | versionamento: v1/v0.2–v0.5 (AudioEngine Pro, workbook 845KB), v1/v1 (iterações workbook + pcm-store), v2 (Algo Matrix Audio engines/generator/{trap,pop,edm,...}.txt + Vector-One Studio). |
| APP-0579 | aRQUITETURA-OFFLINE-COMPLETA: 3 fases (dev/install/runtime), size budget, pattern DB, assembly engine, synthesis, quality guarantees, roadmap 20 semanas, matriz 15 gêneros. |
| APP-0580 | sISTEMA-QUALIDADE-COMPLETO: layers por gênero, quality pipeline 6 stages, sistema de referência, mixing/mastering automation, QA checks. |
| APP-0581 | modelo "fábrica de carros" (MONTAGEM-INTELIGENTE): 14.000 peças pré-fabricadas, metadados de peças, regras de compatibilidade. |
| APP-0582 | treino com a 7-layer training machine ("data mastigado"): decomposição de áudio em samples, schema de metadados (PIPELINE-TREINAMENTO, ORGANIZACAO-SAMPLES, MACHINE-TREINAMENTO-COMPLETA). |
| APP-0583 | extração de músicas reais do que importa (EXTRACAO-REFERENCIAS-REAIS, MIR): o que extrair para pattern DB. |
| APP-0584 | documente separação de stems (STEM-SEPARATION) e síntese vocal (SINTESE-VOCAL-AI) e realismo (SINTESE-REALISTA). |
| APP-0585 | camadas complexas como doc próprio (CAMADAS-COMPLEXAS) com specs por camada. |
| APP-0586 | workflow manual vs AI (WORKFLOW-MANUAL-VS-AI) como guia de decisão. |
| APP-0587 | catalogue infraestrutura de áudio/IA (INFRAESTRUTURA-AUDIO-AI) e librarias TS de áudio (LIBRARIAS-TS-AUDIO). |
| APP-0588 | análise espectral documentada (ANALISE-ESPECTRAL) com specs por banda. |
| APP-0589 | analise apps offline concorrentes (APPS-OFFLINE-ANALISE) e como concorrentes organizam (COMO-CONCORRENCES-ORGANIZAM). |
| APP-0590 | fL Studio analisado (FL-STUDIO-ANALISE: Channel Rack, pattern-based sequencing) como referência de UX. |
| APP-0591 | documente QUALIDADE-AUDIO-ESPECIFICACOES e PLANO-DE-ACAO como plano de corte de dependências. |
| APP-0592 | auditoria de dados (AUDITORIA-DADOS) antes de treinar. |
| APP-0593 | análise de infraestrutura (ANALISE-INFRAESTRUTURA) antes de escalar. |
| APP-0594 | `inspiration.txt` (compendium síntese JS) como base de técnicas de síntese. |
| APP-0595 | worklet de voz em lib/audio-engine.txt. |
| APP-0596 | algo Matrix com engines/generator/{trap,pop,edm,...}.txt + engines/aiManipulator.txt + worklog.txt de falhas da IA. |
| APP-0597 | vector-One com src/lib/audio/schema(1).txt, engine(1).txt, generator(1).txt, studio-store(1).txt, src/components/studio/*. |
| APP-0598 | sessões reais preservadas em talks/ (53 arquivos): análise Don Toliver ATM, separação HPSS+phase cancellation, geração estilo ATM, caça a pacotes/binários. |
| APP-0599 | concorrência analisada em docs próprios antes de features (PESQUISA-PROFUNDA-CONCORRENCIA, CONCORRENCES-AUDIO-AI-10, PESQUISA-ACADEMICA-AI-MUSICA). |
| APP-0600 | métricas da pasta: 1.054 arquivos / 41MB; maiores md/readme.txt 2.4MB (65k linhas), v2/h.txt 6.6MB, v2/audioreport.txt 1.9MB. |
| APP-0601 | números do AudioMotor: 1 frame = 1ms; 44100Hz/16-bit; 79+ blocos de payload; 35+ formatos de análise; 47 extractors #58–#104; V3→V8. |
| APP-0602 | números do Vector-One: embedding 32-dim; grid 16 steps; 8 voices; BPM 40–240; durações 30/60/90/120/180s. |
| APP-0603 | referência real: Don Toliver — ATM (192.7s, 48kHz, 320kbps → 166.71 BPM, C minor 0.813, LUFS -13). |
| APP-0604 | orçamento do pacote: &lt;50MB total (~33–37MB est.); runtime 1 dep (`tone`) ~250KB. |
| APP-0605 | páginas do tema debonair: Onboarding, Login, Mixer, Timeline, PianoRoll, Library, Master, Settings. |
| APP-0606 | lógicas raiz do debonair: effects, engine, export, harmony, index, instruments, katexis, master, melody, mixer, musicEngine, presets, rhythm, sampler, sequencer, synth, theory, utils. |
| APP-0607 | site do debonair em subdomínio próprio (debonair.devthink.pro) com build nas máquinas do GitHub e artefatos no release. |
| APP-0608 | envelopes do debonair: pom.xml, settings.xml, bun.lock, biome.json, tsconfig.json (mescla app+backup+build+server), package.json, CODEOWNERS. |
| APP-0609 | docs do debonair: ARCHITECTURE.md, CHANGELOG.md, CONTRIBUTING.md, LICENSE, README.md, SECURITY.md, code-of-conduct.md, third-party-notices.md. |
| APP-0610 | tests do debonair em tests/ com node:test + node:assert, sem mock. |
| APP-0611 | doc de arquitetura do debonair como árvore: 1 arquivo por linha, sem parágrafos. |
| APP-0612 | comentários curtos, diretos, funcionais; template padrão no topo do documento. |
| APP-0613 | subdomínio deploy estático sem Functions; stack Prisma/Drizzle/MySQL2 + Socket. |
| APP-0614 | não crie lógica de gateway dentro do debonair — importe do devthink. |
| APP-0615 | não crie lógica de imagem/3D dentro do debonair — importe versawase do cadria. |
| APP-0616 | engine katexis como único arquivo de engine de áudio do ecossistema; nenhum outro app cria engine própria. |
| APP-0617 | katexis para music engine (musicEngine.ts) e theory.ts como teoria compartilhada. |
| APP-0618 | presets.ts como presets por gênero (DNA por gênero). |
| APP-0619 | sampler.ts para leitura de samples do pattern DB. |
| APP-0620 | sequencer.ts como sequenciador por steps (16 steps/lane). |
| APP-0621 | synth.ts para os sintetizadores do kit (supersaw, 808, kick, snare, hats, pads). |
| APP-0622 | master.ts como masterização com loudness targets. |
| APP-0623 | export.ts para WAV/MP3/MIDI/JSON/stems/metadata. |
| APP-0624 | effects.ts para taxonomia de efeitos por gênero. |
| APP-0625 | harmony.ts para acordes e progressões (12 acordes catalogados). |
| APP-0626 | melody.ts para geração melódica (13 escalas). |
| APP-0627 | rhythm.ts para ritmo/grooves com swingOffsets. |
| APP-0628 | instruments.ts para instrumentos e INSTRUMENT_SIGNATURES. |
| APP-0629 | versionamento em lockstep com @wenathlan/debonair e publicação em todos os registros. |
| APP-0630 | bump loop até verde: fix, bump, push, monitor, repetir. |
| APP-0631 | tags imutáveis; CHANGELOG por versão como release notes. |
| APP-0632 | container único Dockerfile multi-stage; sem compose; tags por perfil. |
| APP-0633 | hashes construídos somente no runner (SHA256SUMS como asset). |
| APP-0634 | pre-push suite leve: typecheck zero + build + boot smoke + lint zero. |
| APP-0635 | limpe /tmp no fim; mate zombies. |
| APP-0636 | nunca commitar chaves/envs/credenciais; bloquear extensões secretas em ignore files. |
| APP-0637 | sourcemaps escondidos (off/hidden), nunca públicos. |
| APP-0638 | sanitize input; file-type por magic bytes; size caps; schema-validate channels. |
| APP-0639 | node:crypto para random de segurança; nunca Math.random. |
| APP-0640 | dark-first premium com gradients vívidos; sem roxo residual; 1 background global. |
| APP-0641 | texto encaixado na caixa; grid fixo; sem "poeira visual"; 44px de toque (56px botões). |
| APP-0642 | animação micro com GPU-only transform/opacity; respeita reduced motion e contraste. |
| APP-0643 | wCAG AA; nunca cor como único sinal; focus visível. |
| APP-0644 | perf: lazy-load libs pesadas; limite camadas de glass por viewport; backdrop-filter fallback; content-visibility offscreen. |
| APP-0645 | repositório central de ícones para todos os apps (incl. debonair). |
| APP-0646 | onboarding frame a frame adaptado ao debonair; login pulável via OS. |
| APP-0647 | um design só: portrait = celular, landscape = TV/desktop. |
| APP-0648 | wrappers ios/android só empacotam; nunca segunda interface. |
| APP-0649 | não commitar public/assets/dist; compila na raiz do dono; só icons/favicon. |
| APP-0650 | cLI como a mesma interface TSX renderizada no terminal; binário Bun no build. |
| APP-0651 | dB local via Drizzle ORM + better-sqlite3 (Supabase gerenciado, sem .sql no repo). |
| APP-0652 | prisma dentro do tema, nunca pasta prisma/ na raiz. |
| APP-0653 | um manifesto por linguagem na raiz; versão em lockstep; um lock só. |
| APP-0654 | .github/ na raiz com workflows auto-contidos, um por responsabilidade; dependabot.yml nunca em workflows/. |
| APP-0655 | scripts auxiliares em tests/ (não-JS em tests/scripts/). |
| APP-0656 | nunca apagar: duplicado guarda com sufixo (2)(3). |
| APP-0657 | foco em TypeScript: FFmpeg fora do app (delegar para tools/bin quando necessário) — "Nada de FFmpeg, nada de Python/Java. Foco total em TypeScript". |
| APP-0658 | features do motor compartilhadas entre analisador e gerador: "modo analisador + modo gerador com a mesma estrutura". |
| APP-0659 | dAW como app isolado de marketing: nome debonair, sem depender do ecossistema para rodar offline. |
| APP-0660 | imports cruzados: debonair importa gateway/AI/workflow do devthink — nunca o devthink importa engine do debonair diretamente (usa biblioteca publicada). |
| APP-0661 | não duplique lógica de teoria musical em outro app: theory.ts/katexis.ts são a única fonte. |
| APP-0662 | lógicas .ts na raiz; interface só no tema (Sol/). |
| APP-0663 | interface puxa da raiz/biblioteca; raiz nunca puxa de interface; interface nunca puxa de outra. |
| APP-0664 | correlatas agrupadas em blocos hierárquicos; 1 arquivo = 1 responsabilidade; até 300 por arquivo quando a correlação exigir. |
| APP-0665 | typeScript primeiro; nativo do runtime antes de pacote externo; app nasce biblioteca multi-modo (~30 modos). |
| APP-0666 | zero JS na interface: só TS/TSX/css/html, .ts explícito, sem enum/namespace. |
| APP-0667 | sem main: App.tsx self-mount com roteamento embutido (temas + 404). |
| APP-0668 | nada hardcodado: env/DB/porta; host/porta sorteados e travados, nunca localhost; tema vem do DB. |
| APP-0669 | nomes em minúsculas sem _/-, inglês no código, JSDoc em inglês, sem emoji, com try/catch rastreável. |
| APP-0670 | migre só a lógica de entrada do tema para a raiz. |
| APP-0671 | escreva/teste/publique TypeScript ponta a ponta; JS só como emit no publish. |
| APP-0672 | root-first: sem src/, sem pasta dentro de pasta, flat. |
| APP-0673 | cada app (incl. debonair) tem docs/ e tests/ próprios; referencia, não copia. |
| APP-0674 | pasta = página = app com tudo dela dentro; página config é app config. |
| APP-0675 | tema = pasta; sem pasta "default" (Sol/ no debonair). |
| APP-0676 | n temas = N pastas completas (entrada + deploys + páginas). |
| APP-0677 | página é a pasta com o próprio nome em minúscula: o <Pagina>.tsx da subâncora, os componentes TSX soltos na pasta e .ts auxiliares quando precisa; não existe .styles.ts, .types.ts nem .test.tsx por página. |
| APP-0678 | build/teste/hash só nas máquinas do CI. |
| APP-0679 | release por bump gerando tag + publishes (source.zip, SHA256SUMS, APK/IPA). |
| APP-0680 | mesma árvore em todo deploy, estático sem Functions (plano anterior: Vercel, Netlify, Pages, Capacitor, ISO; rewrites + 404) — o alvo atual é Cloudflare com wrangler.toml + devthink.toml e routes gerenciadas pela App.tsx. |
| APP-0681 | sem lock-in de plataforma; trocar livre (Prisma, Drizzle, MySQL2, Socket). |
| APP-0682 | commit com identidade iakadion; tags padronizadas e imutáveis; órfã deleta. |
| APP-0683 | branch principal protegida, sem force; só main. |
| APP-0684 | npm ci, nunca install; token por ambiente (NPM_TOKEN, GITHUB_TOKEN). |
| APP-0685 | pré-push leve; autoridade nos runners (gates locais, bateria no GitHub). |
| APP-0686 | testes reais em tests/, consumidor pack → install (node:test sem mock). |
| APP-0687 | painéis zerados como critério de pronto (0/0/0). |
| APP-0688 | bump até tudo verde; CHANGELOG por versão. |
| APP-0689 | verificação via biome + tsc --noEmit nos arquivos de fora. |
| APP-0690 | padrão nos domínios (virtual); opt-in local/misto pela IA. |
| APP-0691 | dB unificado entre sites/apps, nunca commitado; mestre + shard por conta. |
| APP-0692 | sites replicáveis de backup (plano anterior: clones Vercel/Netlify; hoje também os sites db.site e dbsandbox.site da rede). |
| APP-0693 | self-hosted, sem free-tier limitante; usuário escolhe tudo, nada rígido. |
| APP-0694 | sandbox publicada em 3 formas: runtime por pacotes, full por container, publicada nos registros. |
| APP-0695 | checklist interna por contexto, máx 10 por grupo; delegar subagentes antes de executar. |
| APP-0696 | inline primeiro, arquivo por último; limpar temporários (node -e; runner some depois). |
| APP-0697 | 13 Leis do design-premium ao desenhar UI do debonair: L1 INLINE-SLOT, L2 BOX-HIGHLIGHT, L3 CORNER-BORDER (1 linguagem de borda/página), L4 CLUSTER-HERO, L5 MEGA-UM, L6 FOTO-REI, L7 COLOR-LOCK, L8 HIERARQUIA-CONE, L9 GHOST-WORLD, L10 STAMP-ORBIT, L11 BREAK-CARRY, L12 DEMO-LIVE, L13 CENTER-POP. |
| APP-0698 | arquitetura de cor 3+3: 3 cores globais + 3 tons por seção; 1 gradiente/página TOTAL; 1 cor-sinal/página. |
| APP-0699 | tríade tipográfica: display 700–900 (Syne, Clash Display, Outfit ExtraBold, Plus Jakarta EB, Space Grotesk) + leitura 400–500 + detalhe 200–300 só em micro-labels; 2 famílias/página. |
| APP-0700 | escada de raio: chips pill/squircle; card pequeno 12–16; médio 20–32; herói 36–64; painel/seção 96–320; raio interno ≤ externo. |
| APP-0701 | motion: micro 120–250ms; entradas 400–800ms (stagger 60–90ms); loops 8–30s; ease base cubic-bezier(.2,.8,.2,1); animar a FUNÇÃO, nunca o pano de fundo. |
| APP-0702 | anti-vibe-code: boxception, pirâmide hero, grade igual 3–4 col, grid de 12 features, FAQ no rodapé, footer 4-col, stats fake, logo cloud inventado, emoji como ícone, orbes animate-ping, roxo→azul crutch, Inter/Roboto identidade, background-clip:text em toda headline, copy "unlock/elevate/revolutionize". |
| APP-0703 | zero tells de IA P0: gradiente bg-clip + Inter + roxo + hero centrado + 3 cards + glass reflex + eyebrow caps = IA instantânea; zero tells = gate. |
| APP-0704 | 8 estados por componente (hover/focus-visible/active/disabled/loading/error/empty/success); URL como estado; zero dead-ends. |
| APP-0705 | responsive gate: mobile-first 1 col, sem scroll horizontal, targets 44px, safe-areas env(), focus-visible ≥3:1, INP ≤200ms. |
| APP-0706 | perf de página: dimensões explícitas (zero CLS), font subsets, vídeo &gt; GIF, animação compositor-friendly. |
| APP-0707 | dials do taste-skill com baseline 8/6/4 (VARIANCE/MOTION/DENSITY) e preset por tipo de página. |
| APP-0708 | ícones Phosphor &gt; hugeicons &gt; radix &gt; tabler (lucide desencorajado); 1 família de ícone/projeto; fonte self-host/next-font, nunca Google Fonts &lt;link&gt; em produção. |
| APP-0709 | regra LILA: sem roxo-AI/glow automático; serif MUITO desencorajada como default; ênfase por itálico/bold da MESMA família. |
| APP-0710 | `min-h-[100dvh]` nunca `h-screen`; CSS Grid nunca calc-math; `leading-[1.1]` + reserva pb-1 em itálico com descender. |
| APP-0711 | style Sampling com 3 cartões lado-a-lado num único HTML (nunca tabs) e esperar o usuário escolher A/B/C. |
| APP-0712 | tEMA nomeado antes de tudo ("output sem tema é banido"). |
| APP-0713 | card law: máx 1 título ultra-curto + 1 frase-efeito OU 1 métrica + micro-label; 3 blocos de texto por card banido; badge-row ≤3. |
| APP-0714 | componentes com nomes engineering-expressivos (mixer-console-telemetry, daw-timeline-hud); "comp-header-001" banido. |
| APP-0715 | split do spine: NAV → HERO → PROVA → CLUSTER(1) → CTA-band → FOOTER-meta; 1 AR/página; seções consecutivas NUNCA repetem a fórmula. |
| APP-0716 | z-bands: 0 atmosfera; 10 conteúdo; 20 consoles/flutuantes; 50 barra fixa. |
| APP-0717 | respiro: padding de seção 96–160px; ritmo 24/32/48/64/96; separação por AR, não por caixas. |
| APP-0718 | assimetria intencional 60/40, 70/30; anti-pirâmide (badge→título→subtítulo→botões centralizado vetado). |
| APP-0719 | grão 3–4% em voids dark; halftone ≤2/página nunca sobre texto; vidro com blur ≥35% do ruído de baixo. |
| APP-0720 | sombras SEMPRE em camadas suaves (0 8px 30px rgba(0,0,0,.06–.10) light; 0 20px 50px -15px dark); 1 sombra dura só como assinatura deliberada. |
| APP-0721 | white-on-photo exige fade preto (58–72% altura); ramp de texto 3 níveis. |
| APP-0722 | tokens semânticos em OKLCH (tinta/papel/campo/sinal/alerta/atenuado/linha/profundidade); estados via color-mix. |
| APP-0723 | fLUXO-7 na produção de páginas: BRIEF-parse → CANVAS → ESPINHA AR → HERO → ÓTICA C-Ω → VIDA → VALIDAR; depois AUTO-AUDIT → REFACTOR → POLISH → FARINHA MÁGICA. |
| APP-0724 | demo-run de treinamento: sem brief → DEMO-RUN (brief auto-escolhido) prova o fluxo ponta-a-ponta em 3 boxes (trace 7 passos, página single-file, self-check de leis). |
| APP-0725 | cHECKLIST-PRE-ENTREGA 12/12: 1-cor-viva, 1-herói·1-break, 1-idioma-borda, stamp L8 ≤1, mock-vivo, ghost ≥regra (LEI-11 ≤10%), IRL-mount, center-pop EXACTLY-1 (LEI-13), veil-tone, inline-media, conexão 1 idioma, T-citada com crédito. |
| APP-0726 | self-check BOX3: leis L1 (1 glifo slot), L2 (marker 1× herda acento), L3 (1 idioma-borda), L5 (violeta único; preto executa; verde só status), L7 (ghost 1× tint 7%), L9 (1 break/página); conflitos-evitados toggle×flat, search×prompt, cluster×cluster, 2ª-cor-viva. |
| APP-0727 | deltas em ledger: REGISTRO-DELTA (v2.1→ S-265, AR-248, CH-250, T-244 + 2ª-prova) e registro v2.0 com ranges NV/legacy por categoria. |
| APP-0728 | bRIEF semântica de comandos: BRIEF: (gera página), N (treina batch), MERGE, EXPORTAR CAPÍTULO X, TREINAR, VAR dark/app, AUDIT:. |
| APP-0729 | merges de imagens com pool-fechado: fim de lote e consolidação no ledger (v2.0 = merge N1..N31; v2.3 = +R01/R02). |
| APP-0730 | uI funcional vs criativo: UI funcional (dashboard/form/tool) → design system existente (estabilidade); criativo (landing/portfólio/capa) → julgamento visual original (impacto). |
| APP-0731 | posicionamento por referência CONCRETA ("estúdio de gravação em Tóquio"), não adjetivos; declarar anti-default; compromisso visual: hero_subject + entrance + break_symmetry + focal_contrast. |
| APP-0732 | anuncie em linguagem humana o que será feito (blocos+paleta+fonte+tempo) antes de construir — nunca só "aguarde". |
| APP-0733 | com material-fonte, ler TUDO, extrair, arquitetar e confirmar outline+estilos num só round antes de construir. |
| APP-0734 | docs canônicos em PT-BR com catálogos em EN (padrão design-premium). |
| APP-0735 | minere os 392 lotes design-premium (lote-00…09) como fonte de referências imagem-a-imagem quando desenhar o debonair. |

---

**operação lírica (ghostwrite do debonair)** — a persona e o ghostwrite virtual das letras seguem o acervo do artista alvo:

| Regra |
|---|
| Pesquisar álbuns e letras cruzando YouTube, TikTok, Instagram, Billboard, Genius e Musixmatch — as letras se leem sempre pelas duas melhores fontes de transcrição |
| Operar do zero a cada pedido, uma letra por operação; a persona é unificada, como se todo o acervo de referência tivesse sido escrito por ela (ortografia, pontuação, posição, escolha de palavras, mesma equação, sentido, viciante, dançante) |
| Cinco ondas com 16 subagentes por onda (100 chamadas), sem agrupar tudo em uma onda só |
| Não repetir letra nem rima, não ser óbvio, rima não robótica; mapear padrões micro (frase) e macro (bloco) com porcentagem por bloco e por frase definida pelo agente |
| Mapear as regras verticais × horizontais das letras (tempo, posicionamento, sonoridade, percussão, compasso sincronizados) e reproduzir os padrões encontrados no acervo alvo |
| Pesquisar faixas de 2022 a 2026 (evolução de fluxo, rima e cadência) mais antigos em alta; prioridade: novas, depois populares, depois emergentes |
| Ortografia, pontuação e gramática otimizadas: sem duplicar vocábulo, acepção ou sinônimo; vírgula no lugar do "e"; maiúscula só no início da frase |
| Proibidas rimas e expressões legadas hardcodadas (flow, glow, gray, blow, grow, show, low, soft, concrete, cap, fat, "my flow", "no cap" etc.) — não aparecem em repertório profissional |
| Entrega em zip com link único; pasta e arquivos curtos, lowercase, sem hífen e sem underscore; tags lowercase sem numeração nem versão; sem comentários nem documentação extra |

### detalhe por seção normativa

Corpo normativo da operação (monorepo + gateway + sandbox + design system). princípio fundamental: "Cada página, cada pasta representa aplicativo. Pasta = página = app. As lógicas dos aplicativos moram do aplicativo." Regra de ouro no-hardcode: nada hardcoded exceto Doo e o nome DevThink; use o DB. diferencial: não tocar no computador/GPU/vGPU/vCPU do usuário (Engini virtual autoembutido). Os marcadores [V] indicam regra literal do acervo e [D] regra derivada do roster documentado; nenhuma regra é inventada e qualquer discrepância se verifica nos bytes reais.

## 1. arquitetura (1.1-1.23)
- **1.1 Princípios gerais do OS (R1.1-R1.20):** DevThink é OS virtual 100% na internet; nenhuma execução toca hardware físico (salvo modo `local` opt-in explícito); engloba todos os apps incluindo o próprio `devthink` (gateway/IDE do OS); CPU/GPU/memória virtuais; multimodal (gateway, sandbox, file hosting, runner, background, chatbot, projetos, IA simultâneos); cada usuário (humano ou virtual, incl. Doo) recebe sandbox explícita 1:1; **Pasta = página = app**; lógicas dos apps moram no app: `.ts` soltos na raiz flat; arquivos de deploy (vercel.json, netlify.toml, vite.config.ts, index.html, capacitor.config.ts) ficam DENTRO de `<app>/<Tema>/`; `vitest.config.ts` e `tauri.conf.json` ficam na raiz do app; `.github/` só na raiz do repo; 7 apps + 1 gateway (getry): devthink, saddle, debonair, cadria-video, stealhead, dns-argan, ansi-art + getry; apps removidos proibidos de reintroduzir (gl, owni, bob, iakadion, soodeska, cli-desktop, devthinkos, akash, create, nathlan, SoFlowX, soochimp, iukka, e maene/extension como fonte histórica); motores embutidos: Saddle (virtualização), Versawase (3D/jogo/imagem/vídeo), Katesis (áudio), Argan (DNS/gateway de chat); devthink embute Saddle+Argan; debonair importa gateway/harness/IA/DNS do devthink; cadria-video embute Versawase + importa Katesis; stealhead importa Versawase e consome Katesis; dns-argan = engine DNS + gateway de chat; getry = serviço de inferência V1-V5, somente modelos com tag `free`.
- **1.2 Camadas e níveis (R1.21-R1.40):** 6 níveis operacionais desacoplados (núcleo runtime, mapeamento de páginas, storage fabric 3 níveis, ingestão de binários, modos de processamento, malha de deployment, inspirado VDR/UMCF); Node.js é o hospedeiro mestre (sub-engines Rust WASM/C++ N-API/Python IPC comandadas por ele); isolamento absoluto do usuário é padrão, modo local opt-in; memória unificada RAM↔disco com endereçamento BigInt 64 bits; custo zero perpétuo ($0 Infra: GitHub Releases, GitLab LFS, buckets S3 egresso zero, NPM efêmero); multi-ecossistema (NPM + Maven .aar/.jar + NuGet .nupkg + OCI); nenhum `.sql` no repo — schema em prisma/schema.prisma ou drizzle.config.ts + schema.ts; UI web é só interface, armazenamento via sites-DB responsáveis; sandbox Saddle tem armazenamento persistente próprio (DBs externos recebem backups); dois conceitos: externo (sites DB via API) e interno (VFS persistente no container); L1 universal router importa/exporta só L2, máx 300 lógicas/arquivo; L2 local router por pasta raiz; L3 componentes privados só importados por L2; interface puxa do root, nunca o contrário; só entry logic migra tema→raiz (decidir lendo interiores); library-first multi-modo (~30 modos); buscar alternativas e combinar opções; minimal dependencies; nenhuma decisão quebra o princípio 100% virtual.
- **1.3 Fronteiras e dependências (R1.41-R1.50):** apps não importam .ts de outro app sem interface declarada; cada app expõe API via index.ts barrel; getry é stateless por request com cache compartilhado; configuração sensível lida de process.env ou localStorage cifrado, nunca hardcode; comunicação inter-app por contratos tipados; OS fornece workspace por pessoa; referências de mercado (Vercel AI, Cloudflare, GMI, Gemini, Claude, Grok, Hermes, OpenCloud, VSCode, Bolt.new, E2B, GitHub, HF, Manus, ChatGPT, Z.ai) são inspiração, nunca dependência; IA do sistema = Doo (DooThink/DoThink), usuário virtual com sandbox própria; DoThink OS é nome paralelo aceito; diferencial = não tocar no computador do usuário (Engini virtual).
- **1.4 Aplicação como biblioteca (R1.51-R1.60):** nasce biblioteca TS multi-modo antes de binário; memória interna prioritária; provider switch = config switch; biblioteca universal open-source (importar e só configurar baseURL/models/keys); erasable syntax obrigatória (sem enum/namespace/parameter properties); imports relativos com `.ts` explícito; preferir node:* built-ins; externos só quando necessário (justificado em JSDoc); zero JS na interface; App.tsx self-mount sem main.tsx.
- **1.5 Limites e orçamentos (R1.61-R1.70):** máx 300 lógicas correlatas/arquivo (0-300 quando correlação exige); .ts ≤300 linhas, .tsx ≤500 linhas; um arquivo uma responsabilidade; merge over split (repetido 2+ vira util/componente); cada arquivo dono dos exports sem barrels; hierarquia ordinal base→derivados; JSDoc em todos os blocos; blocos sincronizam; interface puxa do root.
- **1.6 Identidade (R1.71-R1.80):** marca DevThink; DoThink aceito em prosa; IA Doo; gateway renomeado Getry; apps mantidos 8; apps deletados 13 proibidos; históricos absorvidos (e2ugh, gateway, extension, maene) só linhagem verbatim; saddle absorveu e2ugh; devthink absorveu gateway+extension+maene (commits-base 3c6c88c, 30c38a1, f509fdb, bb0829e).
- **1.7 Domínios e subdomínios (R1.81-R1.90):** domínio raiz devthink.pro; subdomínio por app (appname).devthink.pro; app principal devthink.devthink.pro; subdomínio por tema (appname)-(tema).devthink.pro; API api.devthink.pro (REST) e ws.devthink.pro (WebSocket); docs.devthink.pro; status.devthink.pro; sandbox-<id>.devthink.pro; doo.devthink.pro; wildcard *.devthink.pro aponta para edge (plano anterior: Vercel/Netlify; alvo atual Cloudflare: wrangler.toml + devthink.toml).
- **1.8 Inspiração arquitetural (R1.91-R1.100):** padrões absorvidos sem dependência: Vercel AI SDK (streaming/tool calls), Cloudflare Workers (edge), GMI Cloud (multi-provider routing), Gemini/Claude/Grok (safety), Hermes Agent (harness), OpenCloud (open runtime), VSCode (extension API), Bolt.new (in-browser IDE), E2B (sandbox API), GitHub (versionamento/releases).
- **1.9 Multi-tenancy (R1.101-R1.110):** userId único (cuid) para todo usuário; 1 sandbox explícita 1:1; containerId hardcoded no site (UI), enviado ao DB, sandbox carrega por referência; workspace por pessoa; equipes mistas (humanos+IAs); perfil virtual sempre marcado; Doo tem perfil próprio; subagentes de usuário podem ser membros de equipe; users.kind distingue human/virtual.
- **1.10 Plataforma como OS (R1.111-R1.120):** superplataforma com features das gigantes (galeria YouTube-like, chatbot, explore, creation page); serve humanos e IAs; pré-treinamento de IAs por profissão; ferramentas para IA e humano; interações: página direta, embed via link, NPC para integração externa; a plataforma usa a própria loja; página Explore; galeria com tag "feito por IA" e percentual.
- **1.11 Limites operacionais (R1.121-R1.130):** gateway 32k state + 32k pergunta = 64k/req (espelha Jev); throughput alvo 250k tok/s; rate limit 1200 req/min por usuário; erros de provider tratados 401/422/429/529/5xx; latência 70-500ms (típico ~100ms); banda cinza 0.30-0.70; porta max: 1 alerta alto (&gt;0.85) escala; fan-out máx 5 providers paralelos; cache TTL 24h verdicts / 1h models / 5min health; account=sandbox ~50GB por plano.
- **1.12 Caminhos de execução (R1.131-R1.140):** modo Isolado (Standalone) é padrão; Malha Distribuída (P2P Mesh Swarm) opt-in com protocolo binário; modo Navegador (Client-Side Local) opt-in com consentimento; local nunca é padrão, requer toggle; execução default é virtual na internet; sem tocar GPU/vGPU/vCPU sem consentimento; aviso claro ao optar por local; local desabilita pipelines de backend virtual; local nunca acessa dados de outro usuário.
- **1.13 Língua e estilo (R1.141-R1.150):** documento em pt-BR; código/comentários/JSDoc em inglês; 3ª pessoa na prosa técnica; zero emoji; voz técnica calibrada, nunca hiperbólica; pt-BR coloquial-profissional sem gírias; tabelas markdown para dados; mensagens de erro claras com próxima ação; documentação didática com exemplos.
- **1.14 Fronteira interface × lógica (R1.151-R1.160):** tudo design (TSX/CSS/HTML/UX) no tema `<app>/<Tema>/`; tudo lógica TS na raiz do app; fronteira decide-se lendo o interior do arquivo; lógica no tema migra pra raiz; design na raiz migra pro tema; terminal-ui.tsx é design do tema; `web` é o hub de design de todo o projeto; raiz seca (sem hardcode), tema carrega customizações; tema puxa da raiz.
- **1.15 Regras de ouro (R1.161-R1.170):** nada se perde de nenhum repo mesclado; um arquivo por responsabilidade (0-100, até 300); builds/testes/hashes nos computadores do GitHub; bump loop até tudo verde com painéis 0/0/0; não hardcode nada; únicos hardcoded: Doo e o nome DevThink; lógicas parametrizadas e genéricas; diferencial: não tocar no hardware do usuário; Engini virtual; conta = sandbox (~50GB por plano).
- **1.16-1.18 Stack (R1.171-R1.200):** runtime Bun (dev/build) + Node.js 26+; TS priority; Drizzle + better-sqlite3; Prisma declarativo em temas; Supabase gerenciado em produção; Vite por tema; React 19+ (temas Vite) + Next.js 16 (landing raiz); shadcn/ui + lucide-react; Tailwind v4; Vitest + Playwright + Testing Library; Socket (WebSockets puros) para realtime; Prisma+Drizzle+MySQL2; Biome (double quotes, indent 2, organizeImports); Zustand (state), TanStack Query (server cache), react-hook-form+zod, Tailwind + cn(), framer-motion, lucide-react; Capacitor (mobile), Tauri (desktop), PWA manifest+sw.ts, Dockerfile único, QEMU+Docker+namespaces (saddle), Argan (DNS: DNSSEC/DANE/DoT/DoH/ACME), next-auth + JWT, argon2id (t=3, m=65536, p=4), node:crypto, deploy Vercel+Netlify+GitHub Pages homologados (plano anterior; alvo atual Cloudflare).
- **1.19 Repositórios família (R1.201-R1.210):** repos wenathlan/devthink e wenathlan/saddle; históricos e2ugh/maene/extension/gateway; scoped packages @wenathlan/*; maintainers iakadion, inathlan, aasblor, nasblor; CODEOWNERS `* @iakadion @inathlan @aasblor @nasblor`; commit identity iakadion `174824991+iakadion@users.noreply.github.com`; nunca "Z User"; GH CLI manual em ~/.local/bin sem sudo; device flow client_id `178c6fc778ccc68e1d6a`; token vitalício todos os escopos.
- **1.20 Histórico de evolução (R1.211-R1.220):** web/→tema; main.tsx→App.tsx self-mount; scripts/→tests/; saddle absorveu e2ugh (era infraestrutura do saddle); devthink absorveu gateway+extension+maene; gateway renomeado getry (app extra ZaiWeb SDK); extension era runtime de extensão de browser; maene era infra de memória; lineage verbatim no CHANGELOG e notices.
- **1.21 Domínios como runners (MimeType) (R1.221-R1.230):** domínios externos viram runners via MimeType; MimeType identifica o tipo de runner; runner é sandbox virtual com lógica específica; mapeamento domínio→runner no DB; runner expõe API; permissões próprias (read/write/network/admin); isolado; pode ser spawned por Doo via MCP; loga em runner_invocation; runner perigoso requer confirmação.
- **1.22 Loja e Stripe (R1.231-R1.240):** loja com Stripe na página Explore; página = função exposta; vende IAs pré-treinadas, plugins, themes, runners, modelos; checkout redirect checkout.stripe.com; webhook POST /api/stripe/webhook com HMAC verify; pedidos na tabela orders; entrega digital automática; reembolso via Stripe Refunds API; faturação invoices; não armazenar dados de cartão (PCI-DSS via Stripe).
- **1.23 NPC e embed (R1.241-R1.250):** NPC = integração externa via embed em sites de terceiros; embed = link pronto; NPC tem token próprio com escopo embed; renderiza UI mínima (chatbot/viewer/player); é sandbox de leitura; rate limit por host de origem; CSP estrita (apenas assets da plataforma); embed via iframe com sandbox attribute ou script tag com crossorigin; analytics próprio.

## 2. estrutura de pastas (2.1-2.50)
- **2.1 template padrão (R2.1-R2.6):** todo app segue o template padrão: `<nome>/` com o tema (Sol/ + até 4 nomeados, ex. Sol/Lua/Terra/Mar — 5 temas = 5 webs) + docs/ + tests/ + configs soltos + lógicas .ts soltas na raiz; cada tema é web completo, com o App.tsx DENTRO da pasta do tema, ao lado do index.css (único CSS do tema) e do index.html, mais vite.config.ts, tsconfig, cópias de deploy (vercel.json, netlify.toml, wrangler.toml, devthink.toml, .dev.vars, capacitor.config.ts, tauri.conf.json), manifest.json, sitemanifest.json, package.json, README, prisma/schema.prisma, ícones, robots.txt, sitemap.xml, sw.ts e as pastas de página; a página é a pasta com o próprio nome em minúscula (home/, notfound/), trazendo o <Pagina>.tsx da subâncora, os componentes TSX soltos e .ts auxiliares quando precisa — nenhuma pasta de página carrega nome de projeto.
- **2.2 Deploy vs raiz (R2.7-R2.10):** dentro de `<app>/<Tema>/` SÓ podem existir os arquivos do tema/deploy (vercel.json, netlify.toml, capacitor.config.ts, vite.config.ts, index.html, manifests, _headers, _redirects, caddyfile, mime.types, drizzle.config.ts, package.json do tema, lock do tema, prisma/schema.prisma, css, htmls, ícones, robots/sitemap/rss/ads/keywords, sw.ts) — adaptado para o alvo atual: wrangler.toml + devthink.toml + mime-types; na raiz do app SÓ os de dono-app (vitest.config.ts, tauri.conf.json, playwright.config.ts, eslint.config.js, biome.json, tsconfigs, tailwind/postcss/commitlint configs, prisma.config.ts, deno.json, vm.config.json, Dockerfile, docker.config, containerfile, scripts auxiliares .mjs, .prettierrc, .npmrc, .nvmrc, .gitignore etc., docs de governança); `.github/` só na raiz do repo; .gitignore em três níveis.
- **2.3 Lógicas soltas flat (R2.11-R2.15):** lógicas .ts soltas flat na raiz do app (~92 em devthink: accounts, agent, auth, bridge, cache, cli, companion, database, engine, evidence, flow, gates, gateway, guard, ids, index, jury, llm, mcp, memory, models, net, node, oauth, pack, page, policy, porter, providers, quota, request, runtime, search, security, server, session, storage, streaming, swarm, sync, tools, types, utils, version, versionregistry, views, workflow, workbenchsession, workbenchmemory...); cada arquivo com responsabilidade óbvia pelo nome; proibido src/ ou lib/ para lógica; subpastas permitidas só para conjuntos nominais (ink-components/); imports relativos curtos.
- **2.4 Blocos condicionais (R2.16-R2.20):** bloco Sandbox/VM (10 arquivos: boards.json, cores.json, gpus.json, processors.json, virtualhardware.json, qemu.config, gpumonitor.cpp, virtualhardware.c, virtualizationcore.cpp, qemubridge.py) só em apps de virtualização (saddle, e devthink quando abriga Saddle); bloco Desktop nativo (6: Cargo.toml, Cargo.lock, build.rs, main.rs, gen-icons.py, main.js) só em apps Rust; mutuamente exclusivos; Cargo.toml+main.rs implicam tauri.conf.json; qemu.config implica o conjunto completo de inventário de hardware.
- **2.5 Pastas obrigatórias (R2.21-R2.25):** todo app tem no mínimo Sol/, docs/ (README+ARCHITECTURE+CHANGELOG), tests/ (unitários, integração, fixtures); Sol/ web completo deployável.
- **2.6 Governança (R2.26-R2.29):** arquivos de governança permitidos na raiz do app (LICENSE, README, SECURITY, CHANGELOG, CONTRIBUTING, CODEOWNERS, CoC, third-party-notices, AUP, authors, bug-report, cla, copyright, disclaimer, eula, export-control, governance, notice, privacy-policy, PR template, support, T&C, terms-of-use, trademark-policy, RELEASE.md); arquivos de build multi-ecossistema quando aplicável (pom.xml, settings.xml, csproj, gemspec, Java/C#); proibido duplicar governança em temas; README do tema ≠ README do app.
- **2.7 Diretórios do repo raiz (R2.30-R2.35):** raiz do repo só .github/, .gitignore, package.json workspace, bun.lock, e uma pasta por app; proibido .ts solto na raiz do repo; proibido package.json de app na raiz; workspace scripts delegam para apps; bun.lock é lockfile único.
- **2.8-2.11 padrões e tema (R2.36-R2.55):** pasta de página em minúscula (o nome da pasta é o nome da página); subâncora <Pagina>.tsx com inicial maiúscula (Home.tsx em home/); pasta de app em minúsculas (hífen permitido em compostos, ex. dns-argan); lógicas .ts soltas em lowercase; .tsx de componente com inicial maiúscula; a página não tem index.ts nem .styles.ts/.types.ts/.test.tsx; subcomponentes ficam soltos na pasta da página (sem pasta parts/); nenhum .sql; index.html referencia manifest/favicon/icon/viewport/theme-color; vite.config.ts com base './', outDir fora do repo,
- **2.12-2.15 Blocos detalhados (R2.56-R2.75):** conteúdo dos JSONs de hardware virtual (boards=placas-mãe, cores=núcleos vCPU, gpus=GPUs, processors=modelos por tier, virtualhardware=consolidado); qemu.config args (-machine -cpu -smp -m -vga); gpumonitor.cpp N-API; virtualhardware.c VFS/ponteiros; virtualizationcore.cpp paging/swap/context switch; qemubridge.py IPC QEMU via socket; Cargo.* e main.rs do desktop; gen-icons.py; main.js Node opcional; saddle pode ter Sandbox/VM (não Desktop); stealhead pode ter Desktop (não Sandbox).
- **2.16-2.19 Configs específicas e git (R2.76-R2.95):** mttg.config/passage.config internos não-documentados (docs/internal/ não commitado); vm.config.json per-machine; metadata.json {name, version, description, author, license, homepage, repository}; companion/container/copy-static .mjs; .code-workspace; bun.lock único no repo; scrape.biome.json/scrape.tsconfig.json overrides; envelopes multi-ecossistema (devthink.csproj, Saddle.java, pom.xml, gemspec, devthink.java, devthinkcli.cs); .gitkeep em pastas vazias; .gitattributes LF + binários; .npmrc registry/save-exact=false/engine-strict; .nvmrc LTS; .prettierrc quando usado.
- **2.20-2.21 Proibições estruturais (R2.96-R2.105):** proibidos dist/, node_modules/, __pycache__/, .apk, .ipa, zips na raiz; docker-compose; .github/actions/; prisma/ na raiz; src/ para lógica; pasta dentro de pasta (exceção parts/); index.ts em página; duplicar arquivos entre temas; main.tsx; enum/namespace/parameter properties.
- **2.22 página detalhada (R2.106-R2.110, forma vigente):** a página é a pasta com o próprio nome em minúscula, trazendo o <Pagina>.tsx da subâncora, os componentes TSX soltos na pasta e .ts auxiliares quando precisa (prova no app real: home/ tem Home.tsx, entry.tsx, palette.tsx, tabs.tsx, types.ts e workspace.tsx; notfound/ tem só NotFound.tsx); os estilos vivem no index.css do tema, nunca em arquivo por componente; os testes cobrem o fluxo em tests/.
- **2.23-2.28 Páginas por app (R2.111-R2.140):** devthink: Console (terminal bash no browser), Gatewayview (pipeline getry V1-V5 com banda cinza/júri/cascade/cache), Home, Projects, Providers, Settings, Usage, Notfound, Explore, Store; saddle: AgentBrowser, Console, Dashboard, Playground, Architecture, Compute, Docs, Home, Integrations, Login/Register; debonair: Studio, Tracks, Instruments, Effects, Export, Library, Collaborate, Home; cadria-video: Editor, Timeline, Effects, Library, Export, Player, Settings, Home; stealhead: Game, Lobby, Loadout, Settings, Home; dns-argan: Dashboard, Zones, Records, Logs, Settings, Home; ansi-art: Editor, Gallery, Fonts, Convert, Export, Home; getry: Playground, Monitor, Logs, Calibration (histograma ECE), Providers.
- **2.29-2.30 Diretórios especiais (R2.141-R2.150):** docs/, tests/, tests/fixtures/, tests/mocks/, tests/seeds/, tests/scripts/ (não-JS, lowercase); assets estáticos compilados fora do repo; parts/; ink-components/.
- **2.31-2.36 Web universal e tema (R2.151-R2.180):** a pasta do tema é a interface universal única (web, TV, Capacitor, extensão, desktop, tablet, estáticos); um design só; só responsividade muda; ios/android só wrappers, evitar edição manual; proibidos public/assets/dist no repo; compilar na raiz do dono; só ícones commitados; ~92 soltos por app; um manifesto por linguagem; envelopes de registro únicos por ecossistema; proibido dois lockfiles; tema package.json private:true espelhando raiz; vercel.json com rewrites SPA/headers/CSP/HSTS/cleanUrls (plano anterior; alvo atual Cloudflare wrangler+devthink.toml); netlify.toml com build/redirects 200/headers; capacitor appId pro.devthink.<app>; mime.types custom; caddyfile reverse proxy self-hosted; _headers/_redirects (Cloudflare Pages); sw.ts PWA; robots/sitemap/rss SEO; ads.txt/keywords.txt; o tema canônico deployado primeiro; temas independentes com o mesmo template; temas de fases seguintes têm SÓ pastas de página.
- **2.37-2.40 Workspace raiz (R2.181-R2.200):** raiz: .github/, .gitignore, package.json workspace, bun.lock; workspaces = lista de apps; scripts delegam; devDependencies compartilhadas; sem dependencies de runtime; REGRAS.md, ARVORE-COMPLETA.md, MAPA-COMPLETO.md, worklog.md, README.md na raiz; 22 workflows (ci, pages, release, security, verify, maintenance, buildextension, cachecleanup, codeql, compatibility, container, desktop, mobile, publishghcr, publishgithubnpm, publishmaven, publishnpmjs, publishnuget, publishrubygems, securitypolicy, targets, workflowlint); dependabot ecosystems npm/github-actions/docker/cargo; CODEOWNERS família; proibido .github/actions/; dependabot.yml nunca em workflows/.
- **2.41-2.43 Pastas por app (R2.201-R2.215):** contagens de .ts soltos: devthink ~92, saddle 47+bloco, debonair 8, cadria-video 16, stealhead 7+Desktop, dns-argan 19, ansi-art 21+ink-components, getry ~22; extension/maene/e2ugh/gateway históricos sem pasta; proibido reintroduzir.
- **2.44-2.45 Convenções de import (R2.216-R2.225):** relativos curtos; entre apps @wenathlan/<app>; tema via tsconfig paths; assets absolutos no tema; import type verbatim; node: prefixo; externos do package.json; workspace:*.
- **2.46-2.50 Build, ícones, final (R2.226-R2.250):** build bun run build por tema → dist/ gitignored; assets com hash cacheable 1 ano; index.html no-cache; sourcemaps off em produção; icon.svg/png 512/ico/favicon; tsconfigs do tema herdam do app; resumo: raiz com tema+tests+docs+.github+soltos; dissolver pastas extra; app com tema/docs/tests/.ts soltos.

## 3. nomenclatura (3.1-3.47)
- **3.1 Convenções de nome (R3.1-R3.10):** `<nome>` minúsculas; `<Nome>` capitalizada (classes, .java/.cs, CLI, páginas); `<Tema>` PascalCase (default reservado); `<Pagina>` PascalCase; IA = Doo; textual DevThink; DoThink OS paralelo; engines CamelCase em prosa; subdomínio (appname).devthink.pro mantendo hífen; tabelas snake_case no banco / camelCase no TS.
- **3.2-3.4 Código, React/TS, i18n/API (R3.11-R3.35):** modelos Prisma PascalCase; colunas camelCase @map snake_case; configs lowercase com ponto; testes `<modulo>.test.ts` / `.integration.test.ts` / `.e2e.test.ts`; páginas em pasta própria com o <Pagina>.tsx da subâncora, componentes TSX soltos e .ts auxiliares (não existe .styles.ts, .types.ts nem .test.tsx por página); variáveis/funções camelCase; constantes UPPER_SNAKE_CASE; tipos PascalCase; enum PascalCase com membros UPPER_SNAKE_CASE; hooks use<Coisa>; componentes PascalCase; tag `v<x.y.z>`; branches main/feat|fix|chore|docs|release|hotfix; Conventional Commits (feat/fix/chore/docs/refactor/test/perf/build/ci/revert + escopo opcional); env UPPER_SNAKE_CASE com prefixo <APP>_; .env gitignored, .env.example commitado sem secrets; temas proibidos Default/Main/Index/Root; docs kebab-case; imports ordenados alfabeticamente (externos primeiro); i18n dot.notation.lowercase; endpoints REST kebab-case plural; eventos WS lowercase:action; workflows kebab-case.
- **3.5-3.9 Renomeações (R3.36-R3.60):** gateway→getry; web/→Tema; main.tsx→App.tsx; scripts/→tests/; e2ugh→saddle; extension→devthink; maene→devthink; apps deletados proibidos (gl→apps mantidos; owni→devthink; bob→saddle; iakadion é mantenedor; soodeska→debonair; cli-desktop→stealhead; devthinkos→devthink; akash→saddle; create→cadria-video; nathlan→devthink; SoFlowX→devthink social; soochimp→ansi-art; iukka→cadria-video player); lineage verbatim no CHANGELOG.
- **3.10-3.14 Naming method e adotados (R3.61-R3.85):** derivar de raízes técnicas reais; dicionário (raras, latim/grego); deformar até soar descoberto; inglês, sonoridade primeiro; nunca repetir finais; testar na frase falada; candidatos reservados (Kinetra, Coinwright, Commonroom, Mindvault/Artifact/Codex/Buildwell, Concinnia→Apertune, Meshara, Narrara, Loreweave, Stagecircuit); adotados: DevThink (intelligence/agents), Debonair (sound/music), Stealhead (games/action), Saddle (sandbox/VM), Argan (DNS/gateway), Versawase (3D/game/image/video), Katesis (audio/music), Cadria (video/image), Ansi-art, Getry.
- **3.15-3.24 Padrões de arquivo/variável/produto/evento/API/workflow/branding/visual/tipografia/ícone (R3.86-R3.135):** arquivos 100% minúsculos sem hífen/underscore (exceções Dockerfile/LICENSE/package-lock/CHANGELOG/SECURITY/README); CHANGELOG.md/README.md em maiúsculo .MD; camelCase em variáveis; inglês no código; zero emoji; devthink/DevThink casing; @wenathlan/devthink; io.github.wenathlan:devthink; eventos WS sandbox:start|stop|snapshot|destroy, verdict:resolve|audit|calibrate, stream:chunk|end|error, chat:message|typing|read; REST /api/users|sandboxes|verdicts|providers|projects; versão na path /v1..v5 (getry); métodos HTTP uppercase; status codes 200/201/204/400/401/403/404/409/422/429/500/503; workflows kebab-case; secrets UPPER_SNAKE_CASE; marca DevThink + slogan "O sistema operacional virtual da internet."; cor de marca violet, IA cyan, proibidas indigo/blue salvo explícito, neutra slate, estados emerald/amber/rose/cyan; Inter (UI) + JetBrains Mono (código) + Geist Sans alternativa; font-display swap + preload; proibidas fontes não-open-source; lucide-react; logo SVG multi-tamanho 16-512; favicon .ico+.svg.
- **3.25-3.31 Commits, branches, tags, versões, pacotes (R3.136-R3.170):** Conventional Commits com body em bullets e footer BREAKING CHANGE/Refs/Closes; branches main/feat/fix/chore/docs/release/hotfix/preview, deletadas após merge, só main permanente; tags semver + pre-release alpha/beta/rc + build metadata +data; tag imutável, órfã deletada; SemVer 2.0 (MAJOR breaking, MINOR feature, PATCH fix); versão do OS segue semver do app devthink; lockstep em ~20-40 envelopes (package.json, locks, Dockerfile ARG/label, pom revision, csproj, gemspec, server health, readmes, package.json do tema, tests, CHANGELOG, App.tsx); gate CI valida lockstep lendo package.json; engines últimas (Node &gt;=26, npm &gt;=12, Bun); @wenathlan/<app> em tudo; bin único; tema private:true espelhado.
- **3.32-3.35 Envelopes, commit identity, CI, secrets, env (R3.171-R3.200):** envelopes únicos por ecossistema (Saddle.java+pom+SaddleCli.cs+csproj+gemspec+SaddleCli.rb); Maven io.github.wenathlan:<app>; NuGet <App>; RubyGems <app>; commit como iakadion com email noreply, nunca Z User; workflow/job/step/run/concurrency kebab-case; secrets UPPER_SNAKE_CASE (VERCEL_TOKEN, NETLIFY_TOKEN, NPM_TOKEN, NPMJS_TOKEN, GITHUB_TOKEN, SUPABASE_*, DOCKER_HUB_TOKEN, MAVEN_CENTRAL_*); env globais NODE_ENV/LOG_LEVEL/TZ=America/Sao_Paulo; DB DATABASE_URL/SUPABASE_*; getry GATEWAY_V1..V5_KEY, NVIDIA_API_KEY, BABEL_API_KEY, OPENCODE_API_KEY, KILO_API_KEY; saddle SADDLE_PROFILE (default balanceado)/SADDLE_OS (default linux)/SADDLE_QEMU_BINARY; devthink DEVTHINK_PORT (3000)/DEVTHINK_PUBLIC_URL; argan ARGAN_DOMAIN/ARGAN_ACME_EMAIL/ARGAN_DNS_PORT (5300); auth NEXTAUTH_*/OAUTH_*; storage S3_*/GITHUB_RELEASES_TOKEN/GITLAB_LFS_TOKEN; observability SENTRY_DSN/OTEL_EXPORTER_OTLP_ENDPOINT; workflows como API GITHUB_TOKEN/WORKFLOW_REPO/WORKFLOW_REF.
- **3.36-3.39 Variáveis por app (R3.201-R3.210):** prefixo <APP>_ (DEVTHINK_*, SADDLE_*, GETRY_* ou GATEWAY_* legacy, ARGAN_*, DEBONAIR_*, CADRIA_*, STEALHEAD_*, ANSI_ART_*); variável nunca em código commitado.
- **3.40-3.47 Tabelas, colunas, enums, files (R3.211-R3.250):** tabela snake_case / export camelCase; FK `<table>_id`; timestamps created_at/updated_at/deleted_at; junction `<a>_<b>`; audit `<entity>_audit` ou audit_log; version `<entity>_version`; soft delete deleted_at; id cuid; hash SHA-256 hex; payload JSON; enabled boolean; peso float 0-1; enums PascalCase/UPPER_SNAKE_CASE com StorageTier (INTERNAL_RAM, NPM_EPHEMERAL, SITE_LOCAL_OPFS, GITHUB_RELEASE, GITLAB_LFS, S3_BUCKET_FREE), RiskBand (GREEN, GREY, RED), SandboxProfile (MAX, BALANCED, LIGHT), UserKind (HUMAN, VIRTUAL), ProviderKind (NVIDIA, BABEL, OPENCODE, KILO, OPENAI, ANTHROPIC, LOCAL), Os (LINUX, GRAPHENEOS, OMARCHY, ANDROID, TERMUX), VerdictStatus (UNKNOWN, RESOLVED, ESCALATED, BLOCKED); Drizzle text().$type com union; .ts lowercase; .tsx PascalCase páginas/lowercase componentes; .md UPPERCASE para CHANGELOG/README/SECURITY; .yml kebab-case; Dockerfile uppercase.

## 4. deploy (4.1-4.46)
- **4.1 Plataformas homologadas (R4.1-R4.10):** Vercel, Netlify, GitHub Pages homologadas (plano anterior; o alvo atual é Cloudflare: wrangler.toml, devthink.toml, routes da App.tsx; Cloudflare Pages e Caddy self-hosted opcionais no plano anterior); Vercel Root Directory = tema, build bun run build, output dist/; Netlify Base = tema, publish dist/; Pages via pages.yml; cada tema deployado como site independente; subdomínios (appname).devthink.pro e (appname)-(tema).devthink.pro; vercel.json rewrites/headers/cleanUrls/trailingSlash; netlify.toml build/redirects 200/headers; capacitor appId pro.devthink.<app>, webDir dist; manifest.json PWA; sitemanifest.json estendido.
- **4.2 Subdomínios (R4.11-R4.20):** index.html com manifest/favicon/icon/meta; vite base './' para subpaths; proibições de localização mantidas; subdomínios listados (devthink, saddle, debonair, cadria-video, stealhead, dns-argan, ansi-art, getry).devthink.pro; tema: devthink-sol.devthink.pro (preferir primeiro formato); raiz devthink.pro redireciona; DNS gerenciado por dns-argan (A/AAAA, CNAME Pages, TXT, CAA Let's Encrypt); TLS via Let's Encrypt ACME com renovação; HSTS max-age=63072000 includeSubDomains preload.
- **4.3-4.4 Ambiente, build, mobile/desktop (R4.21-R4.40):** env por deploy NODE_ENV/DATABASE_URL/SUPABASE_*/GITHUB_TOKEN; secrets no painel (nunca .env commitado); .env.example com placeholders; build bun run build output estático; sourcemaps desativados em produção (só staging debug); bundle inicial &lt; 250 KB gzipped com code-splitting por rota obrigatório; imagens sharp/vite-imagetools WebP/AVIF; cache assets 1 ano immutable / index.html no-cache; sw.ts PWA shell+offline; Capacitor empacota tema; Tauri empacota desktop com tauri.conf.json na raiz; desktop nativo main.rs/Cargo.toml + gen-icons.py + main.js; binários desktop via GitHub Releases (desktop.yml matrix windows/macos/ubuntu); mobile via artifact + upload manual (mobile.yml APK/IPA, assinatura KEYSTORE_BASE64); containers Dockerfile+containerfile publicados via container.yml+publishghcr.yml; Caddyfile self-hosted; canary "Immutable Deploys" + concurrent builds; rollback por URL imutável / re-deploy.
- **4.5-4.6 Estático sem Functions (R4.41-R4.50):** proibido Netlify/Vercel Functions; rewrites SPA /(.*) → /index.html; redirects 200; API node:http puro self-hosted (serve.ts); roteamento page-relative em subpaths; .nojekyll; fallback 404 SPA; mesma árvore em todo alvo (Vercel/Netlify/Pages/Capacitor/ISO); sem platform lock; site é sandbox.
- **4.7-4.14 Gator, variáveis, preview, canary, migration, cache (R4.51-R4.90):** app Gator deploya em qualquer plataforma com adapters (Vercel, Netlify, Pages, Cloudflare Pages, Caddy, Render, Fly.io); config de deploy no DB; cada app site+subdomínio próprio; deploy root = tema; VERCEL_TOKEN/NETLIFY_TOKEN/GITHUB_TOKEN/NPM_TOKEN/SUPABASE_SERVICE_ROLE/DOCKER_HUB_TOKEN/MAVEN_CENTRAL_*/NUGET_API_KEY/RUBYGEMS_API_KEY; OIDC federation quando possível; preview em PR (Vercel/Netlify) com DB efêmero e smoke tests, auto-destruído após merge; branches preview/* → preview, release/* → staging (DB próprio, migrations de teste, smoke E2E), main → produção; canary Immutable Deploys; rollback 1 clique; migration em CI antes de produção (job blocker, nunca manual, idempotente, rollback-able, job separado com secrets de serviço); cache: assets hash 1 ano immutable, index no-cache, manifest/robots/sitemap 1h, CDN na frente, gzip/brotli &gt; 1KB.
- **4.15-4.25 Mobile, desktop, container, binários, build env, getry, sandbox (R4.91-R4.150):** capacitor appId pro.devthink.<app>, webDir dist, build APK/IPA com KEYSTORE_BASE64; tauri build por OS com matrix; Dockerfile+containerfile na raiz do app, multi-arch (amd64, arm64, ppc64le, s390x), tags por perfil (:X.Y.Z, -balanced, -lite), proibido :latest/:major-only/sha256-*; cache registro mode=max (nunca type=gha), QEMU sempre, apt-get com retry 5x, versão em OCI label; binários desktop/APK/IPA/OCI/npm/Maven/NuGet/RubyGems publicados; publishes idempotentes com existence-check; FROM --platform=$BUILDPLATFORM, toolchain nativo, dist portável, Trivy gate, provenance+SBOM; getry em getry.devthink.pro (V1 health /v1/health, /v1/version, /v1/models, POST /v1/systemone, /metrics Prometheus, /v1/stream SSE); sandbox Saddle em saddle.devthink.pro e sandbox-&lt;id&gt;.devthink.pro, Docker ou QEMU, perfil define recursos, heartbeat 5s, 3 falhas → restart do snapshot, telemetria CPU/GPU/mem/IO/rede, destroy desreferencia chunks (retenção 30 dias), migração ao vivo, snapshot diário N3.
- **4.26-4.46 Docs/status/Doo/staging/preview/DNS/TLS/CSP/continuação (R4.146-R4.250):** docs em docs.devthink.pro (VitePress/Pagefind, versão por versão do OS); status.devthink.pro (poll de health, histórico de uptime, incident_log); Doo em doo.devthink.pro (perfil max, engines via MCP, raciocina via getry V5, nunca hardware físico, confidence+ece, labels, swarm, sub-agentes, anti-sycophancy RLCD); staging (appname)-staging.devthink.pro com DB próprio; preview com DB efêmero; DNS dns-argan (A/AAAA, CNAME, TXT, CAA Let's Encrypt, MX/SPF/DMARC, SRV opcionais, DNSSEC obrigatório, DANE/TLSA, ACME DNS-01 wildcard); TLS 1.3 obrigatório (1.2 com warning), HSTS preload, wildcard ACME, Caddy auto-HTTPS; CSP estrita default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; connect-src 'self' https://*.devthink.pro; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; X-Frame-Options DENY; nosniff; Referrer-Policy strict-origin-when-cross-origin; Permissions-Policy camera=()/microphone=()/geolocation=(); wildcard *.devthink.pro para edge; deploy automático no push de main após CI verde; branches→ambientes; rollback 1 clique; migration em CI; tags latest segue main / vX.Y.Z releases / stable alias; publish npm dual (npmjs+GitHub npm); Maven/NuGet/RubyGems só para apps que exportam; configs por tema listados; env NODE_ENV/LOG_LEVEL info prod debug staging/TZ America/Sao_Paulo; secrets via painel.

## 5. banco de dados (5.1-5.47)
- **5.1 Stack (R5.1-R5.10):** Drizzle ORM + better-sqlite3 gerenciado por Supabase em produção; SQLite local em dev; Prisma paralelo só para schema declarativo em temas; drizzle.config.ts e prisma/schema.prisma dentro de cada tema; NENHUM .sql no repo (migrations geradas programaticamente, gitignored); conexão via process.env.DATABASE_URL; schema Drizzle em schema.ts por tema; cliente DB singleton em database.ts.
- **5.2-5.3 Modelagem e blobs (R5.11-R5.25):** toda tabela com id cuid + createdAt + updatedAt (exceto joins puras); onDelete Cascade/SetNull/Restrict conforme; índices em colunas filtradas; BigInt para endereços virtuais/hashes/ponteiros; enums Prisma ou text().$type; soft-delete deletedAt; auditoria audit_log (actorId, action, entityType, entityId, before/after JSON, at); versionamento *_version para registros sensíveis; multi-tenancy userId ou sandboxId em toda tabela de negócio; transações com retry exponencial; blobs NÃO no DB — BinaryChunk com ponteiro remoteUrl; storageTier enum (INTERNAL_RAM, NPM_EPHEMERAL, SITE_LOCAL_OPFS, GITHUB_RELEASE, GITLAB_LFS, S3_BUCKET_FREE); SHA-256 obrigatório; chunking 256KB com address BigInt/byteLength/checksum; app_library catálogo global.
- **5.4 Tabelas específicas (R5.26-R5.37):** users, sandboxes (profile max/light/balanceado, containerId, os), verdicts (hash sha256 único), calibration (provider, peso, amostras), labels, audit_log, sessions, projects, providers (kind nvidia/babel/opencode/kilo/openai/anthropic/local, baseUrl, apiKeyRef sem secret), weights (versionados), gates (acao→verde/amarelo), rules (pattern regex, kind allowlist/lookup/threshold).
- **5.5-5.7 Boas práticas e conexão (R5.38-R5.50):** escritas só via database.ts; migrations por CI/CD; backup Supabase + export JSON para Releases; DATABASE_URL file:./local.db dev / Supabase prod; pool 5 dev 20 prod; timeout 30s; retry 3x backoff; graceful shutdown SIGTERM; health SELECT 1.
- **5.8-5.11 Schemas Drizzle e Prisma (R5.51-R5.70):** pgTable/sqliteTable; colunas text/integer/real/blob/bigint; defaultNow; @@index; FK references cascade; unique/uniqueIndex; composite PK; check constraint; views; Prisma datasource sqlite + client-js; model com cuid; relation; enum; @map; DateTime default now().
- **5.12-5.15 Tabelas adicionais (R5.71-R5.90):** tool_invocation, task_results, tasks, runner_invocation, orders, invoices, incidents, revoked_tokens, gateway_request, verdict_model_version, memory_n1/n2/n3, binary_chunk, app_library, cache_verdicts, cache_models, cache_health, rate_limit, quota_usage.
- **5.16-5.21 Multi-tenancy, auditoria, versionamento (R5.91-R5.120):** userId/sandboxId em toda tabela; queries filtram tenant; RLS; JWT claim com userId+sandboxId; middleware injeta tenant; cross-tenant proibido (salvo admin) e logado; isolamento VFS/memória/rede por tenant; audit_log insert-only imutável com crypto-shred GDPR e retenção 90 dias online + 1 ano cold; acesso a PII logado em pii_access; auditoria de veredictos reproduzível (hash+versão); *_version com rollback/diff/audit trail.
- **5.22-5.25 Migrations e backup (R5.121-R5.140):** geradas por drizzle-kit/prisma; gitignored; aplicadas em runtime/dev; em CI antes de produção (blocker); idempotentes e rollback-able; testadas em staging; snapshot diário Supabase + export JSON → GitHub Releases cold storage; retenção 7 diários/4 semanais/12 mensais; restore mensal em staging; RTO 4h / RPO 24h; backup antes de migration.
- **5.26-5.31 Performance e replicação (R5.141-R5.170):** índices, EXPLAIN, paginação cursor-based, evitar N+1; read replicas; cache query; pool/timeout; abort 60s; replicação sandbox→M sites DB com quorum N/2+1 e leitura any-of-N; escrita logada; reconciliação diária diff+sync; last-write-wins default, manual em disputes; sites replicáveis em Vercel/Netlify com API REST autenticada JWT.
- **5.32-5.34 Storage tiers (R5.171-R5.185):** INTERNAL_RAM L1; NPM_EPHEMERAL 24h; SITE_LOCAL_OPFS L2; GITHUB_RELEASE/GITLAB_LFS/S3_BUCKET_FREE L3; escolha automática por tamanho/frequência; promotion L3→L2→L1 e demotion contrária; blob &gt;1MB direto L3; perfil max prioriza L1, balanceado L2, light L3; migração transparente.
- **5.35-5.38 Supabase e SQLite local (R5.186-R5.205):** SUPABASE_URL/ANON_KEY/SERVICE_ROLE em env; auth/storage via Supabase; RLS com policies por tabela/role; trigger de audit via function; realtime quando disponível; Edge Functions NÃO (proíbe Functions); SQLite dev file:./local.db, :memory: em testes; WAL; PRAGMA foreign_keys ON; busy timeout 5s; synchronous NORMAL; cache -shared; temp store MEMORY.
- **5.39-5.47 Tipos, queries, transações, finais (R5.206-R5.250):** text/int/real/blob/bigint; boolean via integer; datetime ISO 8601; json via text; enum via check constraint; queries tipadas/async/try-catch/logadas em dev/sanitizadas parameterized; sem string concat, sem SELECT *, LIMIT+ORDER BY sempre, WHERE com tenant filter; transações para escritas críticas com retry exponencial, READ COMMITTED default, SERIALIZABLE crítico, savepoint, rollback em erro, timeout 30s; soft-delete preferido, hard-delete só GDPR; índices em FK/filtradas/compostos; revisão trimestral; vacuum/analyze mensal SQLite; reindex &gt;30% fragmentação.

## 6. sandbox e virtualização (6.1-6.49)
- **6.1 Conceito (R6.1-R6.10):** sandbox = container virtual autossuficiente com CPU/GPU/memória virtuais, roda Linux/Docker e opcionalmente OS convidado via QEMU; 1:1 userId↔sandboxId; containerId hardcoded no site (UI) e enviado ao DB; perfis max/light/balanceado (max = máximo de threads/vCPUs/memória/proc/GPU; light = mínimo; balanceado = default humano); Doo recebe max; sandbox roda autossuficiente OU sites-DB armazenam (coexistem); VFS persistente próprio.
- **6.2-6.6 Hardware, OS, FS, modos, ingestão (R6.11-R6.35):** inventário boards/cores/gpus/processors/virtualhardware.json + qemu.config + gpumonitor.cpp + virtualhardware.c + virtualizationcore.cpp + qemubridge.py; OS convidados homologados GrapheneOS, Linux (Debian/Ubuntu/Alpine), Omarchy, Android, Termux; path sandbox:/mnt/data/; Docker para light, Saddle VM (QEMU) para max/balanced; VFS pager 64 bits BigInt, L1 SharedArrayBuffer/Buffer.allocUnsafe, ring buffers com flush/swap, swap-out N2/N3, page-in sob demanda; modos Isolado (padrão) / P2P Mesh Swarm (opt-in, swarm.ts) / Navegador local (opt-in, toggle, desabilita pipelines backend); ingestão de binários: chunks 256KB, SHA-256, gzip, catálogo app_library com reuso, cache permanente N2/N3, Content-Type application/vnd.vdr-block+bin, headers X-VDR-Address/Chunk-Index/Compression/Checksum.
- **6.7-6.13 Runner e internals (R6.36-R6.70):** Saddle é o runner (create/start/stop/snapshot/destroy via server.ts HTTP/WS); perfis em runtime (tiers.ts); scheduler aloca vCPU/vGPU/memória; rede NAT por sandbox com egress por policy; cgroups; snapshots .vdr-snap; migração ao vivo; heartbeat 5s, 3 falhas → restore; telemetria; destroy desreferencia (retenção 30 dias); ~50GB por plano; módulos: index/virtual/virtualcpu/virtualgpu/virtualmemory/virtualization/virtualizationcore/scheduler/isolation/performance/tiers/operations/communication/intelligence/distribution/foundation/acquisition/automation/server/telemetry.
- **6.14-6.21 vCPU, vGPU, memória, rede (R6.71-R6.110):** vCPU quantum 10ms preemptivo; max 8 / balanceado 4 / light 2 vCPUs; affinity; steal time medido; throttling cgroup; hotplug; feature flags AVX/SSE4/AVX-512; x86_64 default arm64 opcional; topology; benchmark spec2017; vGPU fair-share (max 1×, balanceado 0.5×, light 0), passthrough ou emulado, memória dedicada, CUDA virtual, OpenGL/Vulkan, encode/decode, gpumonitor, glmark2, hotplug; memória max 16GB / balanceado 8GB / light 2GB, paginação 4KB, swap em 80%, L1/L2/L3, BigInt 64; rede NAT, IP virtual, egress policy, DNS Argan, bandwidth por perfil, latência/packet loss/jitter simulados default 0, IPv4+IPv6, port forward.
- **6.22-6.30 FS, processos, snapshots, migração, destruição (R6.111-R6.155):** VFS pager 64, /mnt/data/, mounts/symlinks/hardlinks virtuais, POSIX, ACLs, quota ~50GB, zstd, AES-256-GCM at rest; PID virtual, fork/exec, signals, cgroups v2, pids.max, process tree, zombie reap, OOM kill, core dump N3, strace; snapshot checkpoint memória+VFS .vdr-snap, incremental, diário, retenção 7/4/12, N3, restore mensal, antes de operação destrutiva e migration; live migration pré-cópia + stop-and-copy Δ&lt;100ms, rollback em falha, IP/VFS migram, heartbeat revalida, log em audit_log, testada em staging; destroy → desreferencia, retenção 30 dias, purge, VFS crypto-shred.
- **6.31-6.36 Telemetria e isolamento (R6.156-R6.185):** CPU/GPU/mem/IO/rede por sandbox; Prometheus /metrics; Grafana opcional; alertas &gt;90% 5min (CPU/mem/disk/rede); trace por request; profiling; flamegraph staging; namespaces PID/NET/MNT/UTS/IPC/USER; cgroups v2; seccomp allowlist; AppArmor/SELinux por perfil; capabilities drop ALL; rootless; --privileged proibido; egress proxy allowlist; DNS Argan; sem FS compartilhado; memory.max/cpu.max/pids.max/quota pacotes-s/50GB.
- **6.37-6.40 Perfis por usuário (R6.186-R6.215):** humano recém-cadastrado balanceado, upgrade max pago, downgrade light grátis; IA virtual Doo max por padrão; IAs pré-treinadas por profissão conforme carga; kind=virtual com marcação; sub-agentes light por padrão com parentAgentId, tools[] e sandboxId próprios; swarm com protocolo binário P2P, swarm.ts coordena, IDs únicos, topologia dinâmica, gossip discovery, DHT routing, latência/bandwidth medidas, heartbeat failure detection, rebalanceamento, replicação de estado, consensus Raft/Paxos, split-brain detection, recovery automático.
- **6.43-6.49 Modo browser, boot, shutdown (R6.216-R6.250):** modo browser opt-in com consentimento: Web Worker, OPFS, SharedArrayBuffer, WASM, SIMD, threads, memória limitada pelo browser, sem GPU física, dados locais nunca saem sem permissão, Web Crypto, Service Worker offline, sync background, NUNCA padrão; boot init→network→storage→runtime, systemd/termux-boot, &lt;5s light &lt;15s max, log audit, retry 3x → snapshot restore → human escalation, métricas e profiling; shutdown graceful SIGTERM → 10s → SIGKILL, flush, persistência VFS, snapshot final opcional, timeout 30s, force, cleanup network/cgroup/VFS (30 dias).

## 7. getry, a gateway renomeada (7.1-7.57)
- **7.1 Conceito (R7.1-R7.10):** getry (de gateway) = serviço de inferência V1-V5 que retransmite ou reconstrói payloads de NVIDIA/Babel/OpenCode/Kilo; SÓ modelos com tag free (pagos → 402); V1 proxy puro; V2 + normalização de schema; V3 + reconstrução de payload; V4 + fotocópia (cache) + porteiro grátis; V5 = pipeline Nuclear-II completo; app extra do ZaiWeb SDK; V1 só funciona na sandbox do Zai (cookies, sandbox id/nome, senha).
- **7.2-7.4 Mecanismos (R7.11-R7.35):** 21 mecanismos: júri local (fan-out K providers baratos via Argan, média ponderada por calibração, jury.ts); porteiro grátis (réguas regex/allowlist/lookup/thresholds resolve 80-90% a custo zero, porter.ts); fotocópia (cache sha256(state+questions), verdicts, cache.ts); pergunta tudo (fan-out + poda, prune.ts); semáforo por risco (gates.ts verde/amarelo/vermelho); boletim com pesos (nota = Σ peso×norm, weights.ts versionado); escadinha cascade (mini → verificador estreito → caro no resíduo, cascade.ts); provas antes do juiz (extratores + state + régua estrutural, evidence.ts); revista na porta guard (4 nouls in + 1 severidade + checks de saída, guard.ts); memória infinita N1/N2/N3 (memory.ts); treino próprio (destila com ECE first-class + temperature scaling + "não sei", trainer.ts, nunca agradar); fatiar e varrer (1M÷30k≈34 fatias paralelas, slicer.ts); árvore map-reduce (doctree.ts); busca+rerank (top-30, retrieve.ts); anti-meio (reordena importante primeiro/último); janela overlap 30k+2k; pasta progressiva (progressive.ts); resumidor barato (summarizer.ts); Nuclear-I (2-10 mecanismos); Nuclear-II (todos os 21); banda cinza 0.30-0.70 nunca age; porta max: 1 alerta &gt;0.85 escala; ECE first-class com confidence+ece em toda resposta de júri; RLCD, proibido otimizar agradar; confidence &lt;0.30 → verdict unknown.
- **7.5 Pipeline Nuclear (R7.36-R7.38):** Nuclear-I: msg → porteiro → revista in → provas → fotocópia → fan-out 1 ida → júri em escadinha (certeza = acordo) → boletim → semáforo → revista out → salva+calibra; fim auditável (pasta, votos, pesos, versão no DB). nuclear-II: caso de qualquer tamanho na memória infinita → Nuclear-I + fatias/top-30/bordas/overlap/resumos/progressivo → árvore junta veredictos → ... → salva+calibra+destila; auditável. nuclear-III: + any-provider adapters + public curve + consistency + beam + anti-jag + cost router + signal + votes + consumo do tema via biblioteca construída.
- **7.6-7.11 Providers, backoff, limites, sub-rotas (R7.39-R7.70):** providers homologados nvidia/babel/opencode/kilo; local (Doo) para offline; openai/anthropic só com free público documentado; modelos válidos em getry/models.ts revalidados mensalmente; erros 401/422/429/529 tratados com backoff 0.5s→5s jitter 0.25 máx 2 retries honrando Retry-After; exceções tipadas; provider excedendo p95 3 janelas → degraded; quota por minuto/hora/dia com soft warning 80% e hard block 100%; streaming SSE chunk a cada 256 tokens ou 200ms; auditoria gateway_request; retry idempotente via idempotency-key; timeout 10s/tentativa (30s Python); health /v1/health; /metrics Prometheus; rate limit 1200 req/min; fan-out máx 5; cache TTL 24h/1h/5min; version endpoint; 64k tokens/req; 250k tok/s; sub-rotas /v1/image, /v1/audio, /v1/pdf com schema/cache/audit/rate limit/quota próprios e providers free específicos.
- **7.12-7.18 V1, V2-V5, sites externos, skill (R7.71-R7.105):** V1 só na sandbox Zai (cookies ativos, renovação automática, session pool); V2-V5 fora (providers externos, sem cookies Zai, V5 default em produção); sites externos ~6 credenciais (Zai cookies, NVIDIA, Babel, OpenCode, Kilo, OpenAI opcional) em process.env ou localStorage cifrado, nunca hardcoded, rotação 90 dias; Skill Getry com pré-requisitos, árvore, passos, schema Drizzle, adapter NVIDIA exemplo, 5 estratégias V1-V5 com TS, semáforo 0.30-0.70 + porta max 0.85, deploy Vercel/Netlify, CLI `bun create devthink-getry <nome>`, replicável.
- **7.19-7.22 Tabelas e endpoints (R7.106-R7.125):** tabelas verdicts, calibration, labels, providers, models, audit (WORM hash chain), ratelimit, cache, memory, gateway_request; endpoints POST /v1/systemone (veredicto Jev-compatible), GET /v1/models, /v1/health, /v1/version, /metrics, GET /v1/verdicts/<hash> (+/audit, /verify/all WORM), POST /v1/stream SSE, GET /v1/providers.
- **7.23-7.28 Versões e módulos (R7.126-R7.155):** versão selecionável por header X-Gateway-Version, path /v1..v5, query ?gateway_version, config GATEWAY_DEFAULT_VERSION; V5 default; módulos: verdict, cache, porter, jury, cascade, weights, gates, evidence, guard, memory, trainer, slicer, doctree, retrieve, progressive, summarizer, models, backoff, circuit-breaker, quota, streaming, mcp, adapters/, calibration/, audit.ts.
- **7.29-7.31 Adapters e auth (R7.156-R7.170):** interface ProviderAdapter (listModels, toProvider, fromProvider, call, health); 5 adapters (NVIDIA/Babel/OpenCode/Kilo/Mock); provider swap = config swap; auth/hmac.ts (parseHmac/verifyHmac timingSafeEqual/signHmac); auth/tenant.ts TenantContext (free/pro/enterprise); canUseVersion: free V1-V3, pro V4-V5, enterprise todos; rate limit perMin por plano; default version por plano.
- **7.32-7.41 Routes, UI, docs, tests, schemas internos (R7.171-R7.220):** routes chat.ts (HMAC verify, tolerantParse, resolveVersion, runRouter), models.ts (filter ?capability), verdict.ts (/:id, /:id/audit, /verify/all), health.ts; UI server porta 5174 dev-only; playground com 5 abas (Verdict Playground/Monitor/Logs/Calibração histograma/Providers), dark pt-BR, Tailwind 4 esmeralda+âmbar+vermelho, sticky footer, Vite proxy /v1→8787; docs ARCHITECTURE/API/JURY/DEPLOY/CALIBRATION; tests jury/cache/guard/router + 4 smoke Bun; schemas.ts Zod (contentPart/message/tool/devRequest) + tolerantParse recovery; retransmit pass-through V1; withTimeout; reconstruct (Zod tolerant + temp clamp + maxTokens clamp + stop normalize + PII scrub + schemaVersion); normalizeImage; truncateHistory char budget; StreamEvent token/tool_call/done; normalizeSseStream OpenAI-compat; aggregateStream → DevResponse; tokens.ts (chars/4, reserveRatio 0.25, fitToBudget mantém system+últimas N); keys.ts vault AES-256-GCM round-robin; retry.ts (maxAttempts 5, base 200ms, cap 30s, statuses 429/529/500/502/503/504); ratelimit token bucket (capacity 60, refill 1/s, tryConsume, syncFromUpstream); context.ts KV in-memory+N2 com prefillHash; norm.ts sigmoid/minmax/zscore + approveScore.
- **7.42-7.47 16 alternativas JEV (R7.221-R7.249):** alts 1-21 listadas (base, júri, porteiro, fotocópia, pergunta tudo, semáforo, boletim, escadinha, provas, revista, Nuclear-I, fatiar, árvore, busca+rerank, anti-meio, overlap, progressiva, resumidor, memória infinita, treino próprio, Nuclear-II); comparativo: preço (Jev $0.042/Mtok vs Nuclear-I maioria grátis vs Nuclear-II +1M sem mesa gigante), velocidade (~100ms+rede vs ms locais/1 ida vs +paralelo 34 fatias), caixa (32k vs 32k bem usada vs 1M fatiado), certeza (1 curva vs acordo+banda vs +ECE+destilação), coleira, entrada, auditoria; build order: verdict+cache+porter → evidence+guard → jury+cascade+weights+gates → calibration+labels → slicers+memory → trainer → theme playground → testes com agreement congelado e A/B pinado.
- **7.48-7.57 Build order detalhado e testes (R7.250-R7.300):** ordem de arquivos conforme acima; ECE gate; verdict-model v1; página Verdict; testes: réguas 100%, out-of-scope blocked, joint highs nunca passam, error dentro da tolerância do floor, golden files, snapshots, A/B vs Jev pinado, RULER-like por faixa; provider swap = config swap; consistency none-of-the-above; negação rebaixa joint highs; beam three produto geométrico; anti-jag resolve contagem/matemática/datas em código; cost router; vote DSL versionado com quorum; signal sem logprobs (margin/agreement/grounding); hardcode só no tema.

## 8. segurança (8.1-8.47)
- **8.1-8.2 Princípios e rede (R8.1-R8.20):** segurança em profundidade (rede, container, app, dado, auth); hardening por padrão; least privilege; defense in depth com guard; secrets nunca em código (process.env/secret manager); .env gitignored, .env.example sem secrets; rotação 90 dias; recovery codes em cofre; tokens em DB cifrados AES-256-GCM com chave em KMS; logs nunca com secrets/PII/payloads; TLS 1.3 obrigatório (1.2 com warning); HSTS preload; CSP estrita (ver 4.36); headers DENY/nosniff/strict-origin/permissions-policy; CORS só *.devthink.pro em prod; egress allowlist por sandbox; rate limit 60 req/min público e 1200 autenticado; DDoS edge + WAF + circuit breaker; WS auth JWT em handshake revalidado 1h; mTLS interno.
- **8.3-8.5 Auth e sandbox (R8.21-R8.40):** next-auth + JWT próprio; OAuth2 GitHub/Google/GitLab; argon2id (t=3, m=65536, p=4); 2FA TOTP opcional com recovery codes em cofre; session JWT 1h/refresh 30d com rotação de jti; logout → revoked_tokens; magic link 15min single-use; Doo kind=virtual com sandbox max; namespaces, cgroups, seccomp, AppArmor/SELinux, capabilities drop ALL, rootless, --privileged proibido, egress proxy + DNS Argan, sem FS compartilhado; limits memory.max/cpu.max/pids.max/quota rede/50GB.
- **8.6-8.9 Dados e web security (R8.41-R8.60):** AES-256-GCM at rest + TLS 1.3; PII coluna dedicada com log pii_access; direito ao esquecimento cascade + crypto-shred; export /api/me/export JSON; auditoria de acesso; sanitização de input; URL allowlist; file-type por magic bytes; size caps 10MB; schema-validate channels WS; rate-limit chat; storage sensível cifrado; security headers + CSP; scrypt/PBKDF2 alternativos; HttpOnly+SameSite; CSP com .js externo; rate limits de registro/login; salt por usuário.
- **8.10-8.14 Anti-hardcode, sourcemaps, sessions (R8.61-R8.85):** zero platform paths/endpoints/tokens inline; resolver TODOS os problemas de segurança antes de done (fix real ou dismissal documentado); ignore files nunca excluem o que o Dockerfile copia; .db nunca commitado; downloads verificados por hash do runner; node:crypto sempre; sourcemaps hidden/off nunca públicos, verify post-build, sem cópias node_modules; session tokens hashados, HttpOnly SameSite Strict, rate limits registro/login/reset, 2FA, JWT 1h/30d, jti, logout revoga.
- **8.15-8.22 OAuth, 2FA, magic link, crypto (R8.86-R8.125):** OAuth GitHub/Google/GitLab com state CSRF, PKCE, refresh rotation, scope minimal, callback HTTPS-only, link por email, unlink requer senha; 2FA TOTP SHA-1 compat/SHA-256 preferido, 6-8 dígitos, período 30s, skew ±1, enrollment/disable requer senha, backup codes single-use; magic link 15min single-use por email com hash SHA-256, rate limit 5/h email e 10/h IP, redirect /auth/callback; AES-256-GCM com KMS, rotação 90 dias, IV único, auth tag; SHA-256 integridade/idempotência; argon2id senhas; HMAC SHA-256 com timingSafeEqual.
- **8.23-8.27 PII, LGPD, GDPR (R8.126-R8.150):** PII dedicada + log de acesso + nunca em logs/analytics/erros; esquecimento cascade+crypto-shred; export JSON; acesso /api/me, retificação PATCH, eliminação DELETE com 2FA; LGPD Lei 13.709/2018 com base legal documentada, coleta mínima, DPO privacy@devthink.pro, RIPD em docs/privacy/ripd.md, notificação ANPD, incident_log, crypto-shred + retenção 30 dias cold; GDPR consentimento de cookies, esquecimento, portabilidade, SCCs para transferência internacional.
- **8.28-8.31 Outros e políticas (R8.151-R8.170):** CCPA opt-out (não vendemos dados); COPPA &lt;13; PCI-DSS via Stripe; ISO 27001/SOC 2 alinhamento opcional; docs por app: export-control, terms, EULA, trademark-policy, CoC Contributor Covenant 2.1, SECURITY.md disclosure, privacy-policy, cookie banner + policy, AUP, DMCA takedown; WCAG 2.2 AA + accessibility.md; scorecard dismissal won't fix documentado ≤280 chars.
- **8.32-8.36 Vulnerabilidades, WAF, DDoS (R8.171-R8.195):** vulnerabilidades resolvidas NA RAIZ com overrides; sem arquivos de ignore; npm audit/trivy/CodeQL semanal; painéis 0/0/0; scorecard PinnedDependencies dismissal; actions por TAG e imagens por tag (digest não serve multi-arch); SHA256SUMS no runner, digest via API GitHub; WAF opcional Cloudflare (SQLi/XSS/LFI/RCE, challenge, rate limit por path, bot fight); DDoS edge, circuit breaker, Fail2Ban opcional, anycast.
- **8.37-8.41 Secrets e incident response (R8.196-R8.220):** secrets em painéis, nunca logados, ::add-mask:: em Actions, OIDC federation, Vault opcional self-hosted, KMS, .env.local dev, rotação 90 dias com script; incidente → P1 issue, containment, eradication, recovery, postmortem blameless em docs/incidents/<id>.md com action items rastreados, ANPD e usuários notificados, incident_log, severities SEV1 (&lt;15min) a SEV4.
- **8.42-8.47 Hardening de containers (R8.221-R8.250):** drop ALL capabilities, mínimas, no --privileged, rootless, seccomp, AppArmor/SELinux, read-only onde possível, no-new-privileges, namespaces (network/PID/UTS/IPC/USER/MNT/cgroup), cgroup v2 com cpu.max/memory.max/pids.max/io.max/rdma.max por perfil, quotas rede/bandwidth/conexões/fds, syslog remoto, audit daemon, eBPF, Falco e Tracee para runtime security.

## 9. engines (9.1-9.49)
- **9.1-9.3 Saddle (R9.1-R9.20):** engine/runner de sandbox (Docker + QEMU + GrapheneOS/Linux/Omarchy/Android); vCPU/vGPU/memória virtuais com perfis max/light/balanceado; importado por devthink; arquitetura de módulos index/virtual/virtualcpu/virtualgpu/virtualmemory/virtualization/virtualizationcore/scheduler/isolation/performance/tiers/operations/communication/intelligence/distribution/foundation/acquisition/automation/server/telemetry; virtualizationcore.cpp paging/swap; virtualhardware.c; gpumonitor.cpp N-API; qemubridge.py; JSONs de inventário.
- **9.4-9.7 Versawase (R9.21-R9.40):** engine 3D/jogo/imagem/vídeo; referências Blender (incl. MCP server), needle.tools (three docs, mesh-baker, usd-viewer, viewer), mcp-for-blender, BlenderProc; usado em cadria-video e stealhead; sub-módulos render/physics/animation/audio (delega Katesis)/input; MCP server (scene/mesh/material/light/camera via JSON-RPC 2.0 sobre WebSocket, auth HMAC/JWT, 60 req/min); performance 60 FPS max / 30 balanced / 15 light; resolução 4K/1080p/720p; ray tracing opcional max; mesh baking; LOD automático.
- **9.8-9.10 Katesis (R9.41-R9.55):** engine áudio/música; usada em debonair, importada por cadria-video e stealhead; sub-módulos engine/musicEngine/harmony/melody/rhythm/theory/instruments; saída WebAudio + AudioWorklet browser / WASM servidor; geração prompt → estruturas → render (inspirado Suno/FL Studio); harmony progressões/voice leading; melody motif/variação/sequência; rhythm tempo/compasso/groove; theory escalas/modos/intervalos; instruments synth/samples/FM/granular; effects reverb/delay/chorus/flanger/phaser/distortion/compressor/EQ; MIDI in/out; formatos WAV/MP3/OGG/FLAC/AAC; sample rates 44.1/48/96 kHz; 16/24/32-float.
- **9.11-9.13 Argan (R9.56-R9.70):** engine DNS + gateway de chat; app dns-argan + embutida no devthink; sub-módulos dnssec/dane/dot/handshake/records/zone/publish/acme/certs/server-web/query; ACME Let's Encrypt DNS-01; DNSSEC obrigatório *.devthink.pro com DANE/TLSA; gateway chat Doo↔sandbox↔usuário via WebSocket; DoT 853; DoH 443; KSK+ZSK; handshake.devthink.pro; zones CRUD; records A/AAAA/CNAME/MX/TXT/CAA/SRV/PTR; publish via API de registro.
- **9.14-9.18 Integração e detalhes Saddle (R9.71-R9.95):** engines independentes com barrel, sem dependência circular; importações devthink→(Saddle, Argan), cadria→(Versawase, Katesis), stealhead→(Versawase, Katesis), debonair→(Katesis, devthink); semver próprio com API estável; docs/ARCHITECTURE.md; benchmarks com regressão CI; testes cross-engine; MCP servers registrados em getry/mcp.ts; feature flags compile-time; workspace:*; Saddle Docker (light) e QEMU (max/balanced); multi-arch; 3 formas (Node runtime, container, registry); ports 5300 DNS / 8787 getry / 5173 Vite / 5174 playground / 3000 Next; perfis max (8 vCPU, 1 vGPU, 16GB), balanced (4, 0.5, 8GB), lite (2, 0, 2GB); default balanceado; Doo max.
- **9.19-9.24 Versawase/Katesis detalhes (R9.96-R9.125):** Versawase vive em cadria como @wenathlan/versawase; render Three.js/Babylon/WebGPU; physics Rapier/Cannon/PhysX; animation skeletal/morph/blend trees; áudio delegado Katesis; input keyboard/mouse/touch/gamepad/XR; MCP scene/mesh/material; JSON-RPC 2.0 WS; targets de FPS/resolução; Katesis vive em debonair como @wenathlan/katesis; referências WebAudio/AudioWorklet/Suno/FL Studio; sub-módulos e capacidades como acima.
- **9.25-9.27 Argan detalhes (R9.126-R9.140):** @wenathlan/argan; DNSSEC/DANE/DoT/DoH/ACME/Let's Encrypt/Caddy; zones CRUD; records; KSK+ZSK; DANE/TLSA; DoT 853; DoH 443; ACME DNS-01 wildcard; Caddy auto-HTTPS self-hosted; DB unificado por site.
- **9.28-9.33 Doo e cross-engine (R9.141-R9.170):** Doo assistente virtual (doothink), sandbox própria, perfil max, engines via MCP, raciocina via getry V5, nunca hardware físico, confidence+ece, labels, swarm, sub-agentes, anti-sycophancy RLCD, kind=virtual, subdomínio doo.devthink.pro; cross-engine via workspace:* e barrel, sem circular, API estável, docs, benchmarks, testes integration/, MCP em getry/mcp.ts, feature flags.
- **9.34-9.40 Performance e limites por engine (R9.171-R9.205):** Saddle 60 FPS vGPU, snapshot &lt;30s, 50GB/sandbox (100GB max); Versawase 60 FPS max, 4K@60, mesh 1M triângulos, 16GB VRAM; Katesis latência &lt;20ms, polyphony 64 voices, 32 tracks, 4GB; Argan latência &lt;5ms, 10000 queries/s, TTL mínimo 60s, 2GB; Doo latência &lt;100ms, 1000 req/s, 256k tokens, 16GB, profile max; vCPU/vGPU dedicados conforme engine.
- **9.41-9.49 Versioning, docs, testing, MCP (R9.206-R9.250):** semver próprio + latest main + @wenathlan/*; docs ARCHITECTURE/API/CHANGELOG/CONTRIBUTING/SECURITY/benchmarks/migration/cookbook/examples/sdk; testes unit/integration/e2e/performance/fuzz com coverage mínimo 80% em statements/branches/functions/lines, golden files, benchmarks regression em CI, snapshot tests, mocks para providers, property-based para puras, stress para limits; MCP server por engine (JSON-RPC 2.0, WebSocket, HMAC/JWT, 60 req/min).

## 10. apps (10.1-10.49)
- **10.1-10.4 devthink (R10.1-R10.25):** app central IDE/gateway/AI/chatbot/cluster/hosting/servidor de IA/dados/armazenamento/criação/compartilhamento para IA, usuários virtuais e humanos; embute Saddle+Argan; ~80-92 .ts soltos; páginas Console/Gatewayview/Home/Notfound/Projects/Providers/Settings/Usage (+Explore, Store, Chat, Agent, Sandbox, Verdict, Logs, Audit); bloco Sandbox/VM quando abriga Saddle; metadata.json; multi-ecossistema (devthink.java, devthinkcli.cs, csproj, gemspec, pom.xml).
- **10.5-10.7 saddle (R10.26-R10.40):** app sandbox/VM com páginas AgentBrowser/Console/Dashboard/Playground/Architecture/Compute/Docs/Home/Integrations/Login/NotFound/Register; bloco Sandbox/VM completo; Dockerfile/docker.config/qemu.config/vm.config.json/tauri.conf.json; governança legal completa; mttg.config/passage.config; multi-ecossistema (Saddle.java, SaddleCli.cs, csproj, gemspec, SaddleCli.rb, pom.xml); scrape overrides; absorveu e2ugh; 47 .ts; @wenathlan/saddle.
- **10.8-10.9 debonair (R10.41-R10.50):** app áudio (DAW + geração musical) com Katesis embutida; importa lógica do devthink para chat/gateway/agentes; sub-módulos engine/musicEngine/harmony/melody/rhythm/theory/instruments/utils; clone funcional do devthink focado em áudio para marketing; páginas Studio/Tracks/Instruments/Effects/Export/Library/Collaborate/Home; 8 .ts soltos; configs package/tsconfig/vite/biome/vite-env.
- **10.10-10.11 cadria-video (R10.51-R10.60):** editor/player de vídeo+imagem+áudio com Versawase + Katesis/Debonair; sub-módulos ambient/chapters/codecs/effects/filters/gestures/media/net/player/providers/stall/types/ui/utils/video + devplayer.exe; inspirado After Effects/Photoshop/Canva/Figma/Blender; páginas Editor/Timeline/Effects/Library/Export/Player/Settings/Home; 16 .ts; devplayer.exe nativo; configs completos.
- **10.12-10.13 stealhead (R10.61-R10.70):** plataforma de jogo FPS com Versawase embutida; sub-módulos engine-versawase/game/player/world/net/audio-katesis/db; inspirado CoD/Black Ops/Bloodstrike; capacitor/vite/vitest configs; páginas Game/Lobby/Loadout/Settings/Home; 7 .ts; db.ts próprio para game state; bloco Desktop nativo.
- **10.14-10.15 dns-argan (R10.71-R10.80):** engine DNS + gateway de chat; sub-módulos acme/certs/cli/dane/dnssec/dot/errors/handshake/index/publish/query/records/scrape/server/server-web/types/utils/web/zone; .env/.npmrc/.nvmrc/conversa.md; páginas Dashboard/Zones/Records/Logs/Settings/Home; 19 .ts; cli de management; scrape de DNS de terceiros.
- **10.16-10.17 ansi-art (R10.81-R10.90):** arte/terminal ANSI + image-to-ansi; sub-módulos animation-engine/box/charts/cli/color-utils/fonts/gradient/image-display/image-to-ansi*/layout/logo-to-ansi/renderer/svg-renderer/table/text-to-ansi/utils/widgets + ink-demo.tsx + ink-components/; renderização Ink (CLI) e canvas (web); páginas Editor/Gallery/Fonts/Convert/Export/Home; 21 .ts.
- **10.18-10.20 getry (R10.91-R10.105):** serviço de inferência V1-V5 (sem UI própria além do playground); 22 sub-módulos conforme 7.24-7.28; tabelas Drizzle; endpoints REST; V1 sandbox Zai, V2-V5 fora; 5 providers homologados + Mock; 5 estratégias plugáveis; 9 tabelas; playground com 5 abas; tema dark esmeralda+âmbar+vermelho.
- **10.21-10.23 Cross-app (R10.106-R10.120):** apps comunicam via getry (RPC/REST) e WebSocket; index.ts barrel único ponto de import; dependências via workspace:*; proibido importar .tsx de outro app (só lógica .ts); shared UI em src/components/ui/ (Next) ou componentes de tema (Vite); tema deployável isoladamente; docs por app; ícones por app; cor segue paleta DevThink; metadata.json por app.
- **10.24-10.27 Resumo e históricos (R10.121-R10.140):** devthink 92 .ts / saddle 47+bloco / debonair 8 / cadria-video 16 / stealhead 7+Desktop / dns-argan 19 / ansi-art 21+ink / getry 22; 8 apps mantidos (7+getry); 13 deletados; 4 históricos absorvidos (e2ugh, extension, maene, gateway→getry) sem pasta no repo, lineage verbatim no CHANGELOG/notices, commits-base preservados, não reintroduzir.
- **10.28-10.31 Metadata (R10.141-R10.160):** metadata.json {name, version, description, author, license, homepage, repository, bugs, keywords}; name lowercase scoped; version lockstep; author wenathlan/iakadion; licenses: devthink MIT, saddle GPL-3.0-only, debonair MIT, cadria-video MIT, stealhead GPL-3.0-only, dns-argan MIT, ansi-art MIT, getry MIT; repository github:wenathlan/<app>; homepage https://<app>.devthink.pro.
- **10.32-10.49 Entrypoints e matrizes (R10.161-R10.250):** index.ts por app exportando API pública (sem internals), ordenado alfabeticamente, com types.ts e utils.ts; exports canônicos por app listados; subdomínios por app; docs README/ARCHITECTURE/CHANGELOG/CONTRIBUTING/SECURITY/CODEOWNERS/LICENSE/metadata/RELEASE; matriz de quem tem o quê: bloco Sandbox/VM (saddle, devthink opcional), Desktop nativo (stealhead), engines embutidas, CLIs, servers, multi-ecossistema, devplayer.exe (cadria-video), ink-components (ansi-art), package-lock por app, bun.lock só na raiz, Dockerfile/containerfile (saddle, devthink), configs tauri/capacitor/playwright/vitest/eslint/biome/tsconfig/tailwind em todos conforme nível, vercel.json/netlify.toml (plano anterior) + wrangler.toml/devthink.toml (atual)/index.html/App.tsx/manifest/sw.ts/drizzle.config.ts em todo tema.

## 11. ui/ux (11.1-11.49)
- **11.1-11.3 Princípios e cores (R11.1-R11.20):** mobile-first (360×640 → 768 → 1280 → 1920+); sticky footer obrigatório (logo, copyright, versão, toggle tema/idioma); stack shadcn/ui + lucide-react + Tailwind v4 + framer-motion + cmdk + sonner + vaul; componentes shadcn na pasta da página ou do tema; padrão CVA; dark mode obrigatório; cores proibidas por padrão indigo e blue; paleta slate neutro + emerald sucesso + amber warning/banda cinza + rose erro + violet acentos de marca (parcimônia) + cyan/teal IA; banda cinza amber-400/500, &gt;0.70 rose-500, &lt;0.30 emerald-500; contraste AA 4.5:1 (3:1 grande); sem cores puras, usar paletas com opacidade; dark-first premium com gradients vívidos; sem sobras de roxo/white dots/vinheta/spacer bars/bordas pretas de ícone no light; um background global unificado.
- **11.4-11.6 Layout e grid (R11.21-R11.35):** grid 12 col desktop / 4 mobile, gutter 16/24px; tipografia Inter/JetBrains Mono/Geist; escala 12-72px; line-height 1.5/1.2/1.15; ritmo vertical 8px (4,8,16,24,32,48,64,96); fit text to box; fonts/line-height pelo bloco pai; quebras tratadas; label in box; grid fixo sem poeira gráfica; só o que tem uso real; simétrico; border radius 6px botões / 8px cards / 12px modals / 16px containers.
- **11.7-11.10 Componentes (R11.36-R11.55):** sticky footer com links GitHub/versão; sidebar 240/280px com seções; topbar 56px com logo/search/notifications/profile; command palette Cmd+K; toasts sonner bottom-right desktop / top-center mobile; Radix Dialog com focus trap/ESC/click outside; drawers vaul mobile; tables TanStack com virtualização &gt;1000 linhas; forms react-hook-form+zod; 44px touch (56px botões); hover rápido; text scramble ao ler dados; corte visual rápido; ícone central; dark mantém glass com gradient multicolor, light descarta; toggle universal único; TopDock compacto arrastável 8→30/40/60 ícones.
- **11.11-11.15 Interações (R11.56-R11.80):** skeletons preferidos a spinners (&lt;300ms não mostra nada); empty states com ilustração+texto+CTA; erros com retry+docs; ações destrutivas com AlertDialog vermelho + input de confirmação ("digite DELETE"); undo 5s; atalhos documentados em ?; touch 44×44; hover com focus; animações &lt;200ms micro / &lt;400ms página com prefers-reduced-motion; motion sutil GPU-only transform/opacity; WCAG AA; nunca só cor; focus visível; fontes relativas; lazy-load; glass limitado por viewport; backdrop-filter fallback; content-visibility offscreen; storage writes em batch.
- **11.16-11.22 Acessibilidade (R11.81-R11.115):** foco outline 2px violet/cyan; skip to content; ARIA labels em ícones-only; contraste AA em todos os estados; redundância cor+ícone+texto; HTML semântico; 1 H1 por página; landmarks ARIA; focus management em SPAs; focus nunca none; focus trap; atalhos sem conflito com leitores de tela; drag-drop com alternativa de teclado; prefers-reduced-motion/color-scheme/contrast/forced-colors; WCAG 2.2 AA perceptível/operável/compreensível/robusto (NVDA/JAWS/VoiceOver/TalkBack); navegadores Chrome/Firefox/Safari/Edge; label em todo input; erros via aria-invalid+aria-describedby; autocomplete correto.
- **11.23-11.25 Forms (R11.116-R11.130):** react-hook-form+zod; validação client-side; submit desabilitado durante request; inline validation on blur; feedback loading/success (toast ou inline)/error (inline+toast); campos obrigatórios e opcionais marcados; password strength meter.
- **11.26-11.32 Web Universal (R11.131-R11.165):** App.tsx self-mount sem main.tsx; sem arquivos duplicados no tema; lógica do tema importa da raiz; raiz sem hardcode, tema carrega customizações; responsivo por orientação (landscape TV/desktop, portrait celular) combinado com width/height/density; nunca UI nativa divergente; mudança de tema é rota; sem botão default; reset; tema editável client-side; viewer container com ambiente virtual + DevTools integrados; modal isolado no duplo-clique; modos raw-data e compile/render; copy: reproduzir copia imagem, raw-data copia código; mini-apps popup primeiro expansível, janelas persistentes independentes, sem frame-in-frame; canvas infinito global com workspaces múltiplos renomeáveis, ID único por workspace/mudança, drag-drop entre workspaces, layers dentro de layers, layer manager = workspace manager = file manager, persistência no browser, undo/redo; instâncias interligadas com coerência em tempo real.
- **11.33-11.35 Componentes de marca (R11.166-R11.180):** footer/header padrões; empty states da paleta; loading skeletons bg-muted animate-pulse; 404/500 com ilustração+CTA; onboarding tour 4 passos; settings em cards por categoria; dashboard Recharts; console xterm.js (fundo slate-950, texto slate-100, prompt violet-400); GatewayView diagrama com cores por estágio (porteiro slate, cache amber, júri cyan, semáforo rose/amber/emerald); projetos em grid responsivo 1/2/3/4; providers tabela com toggle/slider/dot; favicon animado opcional com reduced-motion; tipografia e ícones padrão.
- **11.36-11.40 Design System (R11.181-R11.205):** telas limpas firmes ágeis adaptadas à arquitetura flat root-first, premium nunca genérico; radius 6/8/12; shadows sm/md/lg (nunca 2xl em UI comum); borders 1px border-border; spacing 4-96; opacidade de estados; z-index dropdown 50/sticky 100/modal 200/toast 300/tooltip 400; transições 150ms default/200ms hover/300ms modals; reiterações das proibições de cor/background/toggle/dock/motion/a11y/perf.
- **11.41-11.43 Voz e tom (R11.206-R11.220):** voz técnica calibrada jamais hiperbólica; sem "incrível/excepcional/revolucionário" salvo métricas; pt-BR coloquial-profissional sem gírias; erros claros com próxima ação; docs didáticas; Doo útil calibrada anti-bajuladora, nunca agrade, confidence+ece, "não sei" explícito, RLCD; zero emoji na UI; 3ª pessoa.
- **11.44-11.49 Shadows/visuais (R11.221-R11.250):** shadows sm/md/lg; ilustrações flat sem gradientes complexos; paleta DevThink; logo SVG multi-tamanho com variantes por tema; favicon .ico+.svg; Inter/JetBrains Mono/Geist; lucide-react com import dinâmico; consistência visual; dark-first com um background global; icon central; universal toggle; TopDock.

## 12. código (12.1-12.19)
- **12.1 TypeScript (R12.1-R12.10):** strict mode obrigatório; noUncheckedIndexedAccess; noImplicitOverride/noFallthroughCasesInSwitch/noUnusedLocals/noUnusedParameters; target ES2022, module ESNext, moduleResolution bundler; verbatimModuleSyntax; proibido any (usar unknown + guard) e @ts-ignore (usar @ts-expect-error com justificativa); funções puras preferidas com efeitos isolados; imutabilidade as const/Readonly; imports ordenados (node builtins → externos → internos → relativos, alfabético).
- **12.2-12.3 Formatação (R12.11-R12.20):** Biome padrão (biome.json); regras indentStyle tab ou indent 2 conforme app, lineWidth 100, quoteStyle single ou double (família double, DevThink OS single), semicolons asNeeded, trailingCommas all; ESLint complementar (eslint-config-next); Prettier opcional; pre-commit hook (biome check --apply + tsc --noEmit + vitest run); commitlint Conventional Commits; organizeImports.
- **12.4-12.7 Estrutura (R12.21-R12.40):** .ts ≤300 linhas, .tsx ≤500; cabeçalho JSDoc 1-3 linhas; named exports preferidos (default só para páginas); um módulo uma responsabilidade; 0-100 lógicas correlatas/arquivo (até 300); sem duplicação; split só em concerns mistos/lógica pesada/reuso/puro .ts; hierarquia ordinal; JSDoc em blocos; sincronização; interface puxa da raiz; TS first, multi-mode library, JS só como emit.
- **12.8-12.13 React e código (R12.41-R12.70):** React 19+ com Suspense/Server Components/hooks; só componentes funcionais; hooks customizados em hooks/ da página ou tema; Zustand ou Context; TanStack Query; react-hook-form+zod; Tailwind + cn(); framer-motion; lucide-react com import dinâmico; memo/useMemo/useCallback só com benefício medido; erasable syntax (sem enum/namespace/parameter properties); imports com .ts explícito; nativo primeiro; zero JS na interface; split 200 linhas; commits pequenos; try/catch rastreável; scripts auxiliares em /tests (JS) e /tests/scripts/ (não-JS); Biome; dead code com zero imports deletado, mantendo integração futura válida.
- **12.14-12.15 Node/runtime (R12.71-R12.80):** Bun preferido, Node compatível; ESM com import, CommonJS só em .cjs; streams para dados grandes; async/await; try/catch em todo I/O; graceful shutdown SIGTERM/SIGINT; /health em todo serviço; PM2 ou systemd self-hosted; cluster multi-process; worker threads para CPU-bound.
- **12.16-12.18 Erros e logging (R12.81-R12.95):** erros tipados com code/details/cause; erros de domínio em types.ts ou errors.ts; mapeamento HTTP 400/401/403/404/409/422/429/500/503; stack trace só em dev; Sentry/OTel em produção; logs estruturados JSON trace→fatal; PII sanitizada; stdout/stderr coletados; traceId/spanId OpenTelemetry; operação loga actorId/action/entityId/latencyMs/success; logger em utils.ts ou logging.ts; nunca secrets nem payloads completos.
- **12.19+ Code style (R12.96+):** código simples, organizado, otimizado, agrupado, direto e objetivo.

## 13. testes (13.1-13.33)
- Stack: Vitest (unit/integration), Playwright (E2E), Testing Library; configs na raiz do app; testes em tests/ e inline `<modulo>.test.ts`; páginas com test.tsx próprio; fixtures/mocks/seeds em tests/.
- coverage mínimo 80% (statements/branches/functions/lines); relatório em coverage/ gitignored + badge; JUnit XML para CI, HTML para humanos.
- Estrutura AAA; um assert por teste (idealmente); nome descritivo; sem lógica nos testes; um teste por cenário; timeouts 5s unit / 30s integration / 60s E2E; Vitest pool forks; Playwright workers 50%.
- isolamento: DB reset entre integração, mocks resetados em beforeEach; flaky: 2 retries, se persistir it.skip com issue.
- réguas do porteiro 100% coverage; acordo do júri congelado (snapshots); A/B vs Jev pinado; RULER-like por faixa; banda cinza "dentro nunca age" testada; porta max "1 alerta alto escala" testada; cache hit/miss idempotência; ECE calibração; anti-sycophancy; verdict model versionado com semver do getry (V5 = verdict model v5); public curve.
- mocks: providers em tests/mocks/providers.ts, sandbox em tests/mocks/sandbox.ts, DB :memory: (vitest-mock-db ou better-sqlite3), MSW para rede em UI; snapshot/property-based/stress/fuzz/golden files; benchmark regression em CI (benchmarks/*.ts vs main), Bundlephobia, APM Sentry/OTel, RUM, Web Vitals, flamegraphs staging, Lighthouse CI.
- smoke por tema (5 cenários: home, console, projects, settings, logout); cross-browser Playwright matrix; accessibility axe-core; security ZAP/OWASP; pen test; bug bounty; chaos engineering; game days; stress 10x, soak 1h, spike 100x; migration/backup/DR/incident/failover/rollback/canary tests; UAT/beta/alpha/dogfooding; análise estática/dinamica (Biome, ESLint, SAST CodeQL, DAST ZAP, SCA, secret scan GitLeaks, container Trivy, image Dockle, hadolint, actionlint) e linters por linguagem (ruff, clippy, clang-tidy, golangci-lint, SpotBugs, Roslyn, RuboCop, SwiftLint, ktlint, etc.).
- real tests: node:test + node:assert sem mock, tortura E2E massiva; o agente NÃO roda testes autoritativos (GitHub testa via workflows); consumer test pack→install→ESM/CJS/CLI/HTTP; gates locais só sanidade; pre-push: typecheck zero + build + boot smoke + suites afetadas + lint zero; limpar /tmp e matar zombies.

## 14. ci/cd (14.1-14.31)
- 22 workflows obrigatórios (ci, pages, release, security, verify, maintenance, buildextension, cachecleanup, codeql, compatibility, container, desktop, mobile, publishghcr, publishgithubnpm, publishmaven, publishnpmjs, publishnuget, publishrubygems, securitypolicy, targets, workflowlint); dependabot para npm/github-actions/docker/cargo com auto-merge de patches; proibido package-ecosystem vazio.
- um workflow por responsabilidade, self-contained; `.github/actions/` PROIBIDO; workflow_run em publishes contorna supressão de token e aponta para o NOME REAL; concurrency groups distintos por evento; tag guards v* semver; npm ci nunca install; pins emparelhados por action verificados na API (checkout v7.0.1, setup-node v7.0.0, upload-artifact v7.0.1, setup-java v6.0.0, configure-pages v6.0.0, deploy-pages v5.0.1, build-push-action v7.3.0, trivy-action v0.36.0, action-gh-release v3.0.2, dockle v0.4.15, scorecard v2.4.4, sbom v0.24.2, actionlint v1.73.2); runtime versions PINADAS.
- bateria única por evento (ci.yml é a única bateria push/PR; release.validate excluída de push; nunca três cópias da mesma bateria); gates reais (no-ops reais, nada pulado ou falsificado); secrets nunca em if: (usar env); poller GH resiliente com auto-renovação ~15min; NUNCA parar durante login.
- cadeia família: push main com diff package.json+CHANGELOG → ci → release.yml (valida lockstep de TODOS os envelopes → cria tag → zip -9 + SHA256SUMS → release com notas do CHANGELOG) → 6 publishes via workflow_run + workflow_dispatch fallback (npmjs, github npm, maven, nuget, rubygems, ghcr) → conversão Next automática publica os zips web/next nos assets.
- container: Dockerfile único multi-arch amd64/arm64/ppc64le/s390x com FROM --platform=$BUILDPLATFORM, toolchain nativo, tags por versão (sem :latest/sha256-*), Trivy gate, provenance+SBOM, push multi-arch direto, cache registry sem hardcode; troca bidirecional de features de workflows Saddle↔DevThink (lane de VM VHE é exclusiva do saddle); timeouts 330/240; cleanup if: always(); cache BuildKit ghcr.io/<repo>-buildcache mode=max com 1 cache por família; cleaner 2x/dia.
- lockstep: gate dinâmico LÊ package.json (nunca literal); auto-tag no push de bump (version &gt; última tag → git tag + gh release create --generate-notes); dependabot merge --squash --admin com histórico linear, branch deletada e PR fechado com o commit de bump; bumps só-de-dependência = commit direto no main SEM bump de produto.
- painéis 0/0/0 como critério de pronto; 172 problemas de segurança resolvidos com fix real ou dismissal documentado; cada vermelho → diagnosticar log → corrigir na raiz → bump → push → repetir; npm imutável (erro → bump); tag órfã deletada; runs vermelhos deletados; builds/assets/checksums/binários só nos computadores do GitHub; denylist de backend do serve (.db/.sqlite/.log/fontes .ts nunca servidos); o tema = design universal com pastas=páginas, zero JS, App.tsx self-mount, configs de plataforma dentro da raiz do tema.

## 15. documentação (15.1-15.37)
- README na raiz do repo (visão geral), por app (o que faz/roda/contribui) e por tema (como deployar); ARCHITECTURE.md com ADRs; CHANGELOG.md Keep a Changelog; CONTRIBUTING/SECURITY/CODEOWNERS/LICENSE por app; REGRAS.md, ARVORE-COMPLETA.md, MAPA-COMPLETO.md, worklog.md na raiz.
- docs/ por app com ADR-<n>-<titulo>.md, api-reference, benchmarks; docs em pt-BR, markdown GFR puro (sem HTML exceto details/summary), Mermaid, tabelas para dados, H1 único com hierarquia sem pular níveis, links relativos, código em backticks com linguagem, exemplos executáveis, imagens com alt, doc versionada com a versão do OS.
- Doc de API completa (método/path/params/body/response/errors/exemplo curl); doc de conceito com definição/exemplos/referências; doc testada, revisada em PR, com search (Algolia DocSearch/Pagefind), i18n, SEO, analytics, feedback; seções: next steps, troubleshooting, FAQ, changelog, migration/deprecation/breaking/upgrade/downgrade/rollback guides, runbook, postmortem, incident response, DR, BCP; políticas (security, privacy, terms, AUP, DMCA, CoC, contributing, CLA, authors, templates); ADRs/RFCs/specs/design docs/proposals/research/benchmarks/case studies; brand guidelines (logo, paleta, tipografia, iconografia, voice/tone, content style, glossário); as repetições R15.31-R15.200 ("Doc with X (final)") são a mesma doutrina instanciada — referência, não cópia entre apps.

## 16. versionamento (16.1-16.37)
- SemVer 2.0 (MAJOR breaking / MINOR feature / PATCH fix); pre-release alpha/beta/rc; build metadata +data; versão do OS segue semver do app devthink; main trunk sempre deployável; branches feat (squash-merge), release/vX.Y.Z, hotfix de tag; tags imutáveis com latest (segue main) e stable (última release).
- Conventional Commits: feat→minor, fix→patch, BREAKING CHANGE/feat!→major, chore/docs/style/refactor/perf/test/build/ci/revert não bumpam; commitlint + standard-version/release-please automatizam; release GitHub com notes do CHANGELOG e assets (tarball, binários, APK/IPA, OCI); publicação dual npm (npmjs + GitHub npm); Maven/NuGet/RubyGems só para apps que exportam.
- Versionamento peculiar: última casa = unidades com 99 versões; chegar a 100 rola para dezenas (99 versões), depois centenas; até 4000 features por app entre versões; docs de features em checklist+tabelas; uma versão por mudança coerente.
- bump loop: qualquer bug/erro → fix, bump, push, monitorar, repetir até verde; cada bug é um bump; registries imutáveis; release automática valida lockstep, cria tag sozinha, zip máx compressão + SHA256SUMS, publishes via workflow_run; publishes idempotentes com existence-check; tags órfãs e runs vermelhos colaterais deletados; board 100% verde com só main; CHANGELOG maiúsculo .MD com linhagem verbatim; dep-only bumps direto no main sem bump de produto; versão de produto move só com features.

## 17. performance (17.1-17.36)
- Web Vitals: LCP &lt;2.5s, INP &lt;200ms, CLS &lt;0.1, FCP &lt;1.8s, TTFB &lt;800ms, TBT &lt;200ms; bundle inicial &lt;250KB gzipped; code-splitting por rota e feature; imagens WebP/AVIF com srcset 360/768/1280 e lazy loading; ícones SVG inline + spritemap; font-display swap + preload, subsets latin, variable fonts, self-host.
- backend: cache HTTP por tipo, CDN na frente, índices/EXPLAIN/paginação cursor/N+1 batch/compression gzip-brotli &gt;1KB/streaming SSE-NDJSON; vCPU quantum 10ms preemptivo, vGPU fair-share, memória 4KB com swap em 80%.
- Getry: cache hit rate &gt;60%, júri até 5 providers, cascade resolve 80% no mini, porteiro 80-90% sem IA, latência p50 &lt;100ms / p95 &lt;500ms / p99 &lt;2s, throughput 1000 req/s, error rate &lt;0.1%, Apdex &gt;0.9, Lighthouse perf &gt;90 / a11y &gt;95 / best practices &gt;95 / SEO &gt;95.
- otimização contínua: profiling por release (Bundlephobia/Analyzer), benchmark regression em CI, APM Sentry/OTel, RUM, flamegraphs staging; CSS: Tailwind, purge, critical inline, async loading, variáveis para theming, evitar seletores caros/deep nesting/!important/inline styles, will-change com cuidado; rede: HTTP/2-3, preconnect/dns-prefetch, lazy iframes/scripts, defer/async, preload críticos, prefetch futuros, Service Worker, streaming.
- Engines: Saddle 60 FPS vGPU / snapshot &lt;30s / 50GB sandbox / 100GB max; Versawase 60 FPS 4K max / mesh 1M triângulos / 16GB VRAM / 50GB; Katesis &lt;20ms / 64 voices / 32 tracks / 4GB / 20GB; Argan &lt;5ms / 10000 queries/s / TTL 60s / 2GB / 10GB; Doo &lt;100ms / 1000 req/s / 256k tokens / 16GB / 100GB (números 17.121-17.155 idênticos a 9.171-9.205).

## 18. acessibilidade (18.1-18.27)
- WCAG 2.2 AA em todos os temas: perceptível (alternativas textuais), operável (teclado completo), compreensível (Flesch &gt;60 pt-BR, previsível, recuperação de erro), robusto (NVDA/JAWS/VoiceOver/TalkBack; Chrome/Firefox/Safari/Edge).
- HTML semântico, 1 H1 por página com headings em ordem, landmarks ARIA, skip link, focus management em SPAs, focus visível nunca outline:none, focus trap em modals, atalhos sem conflito com leitores de tela, touch 44×44, drag-drop com alternativa de teclado, contraste AA 4.5:1 (3:1 grande), nunca só cor, prefers-reduced-motion/color-scheme/contrast, forced-colors testado.
- Forms: label em todo input, erros anunciados via aria-invalid+aria-describedby, instruções associadas, autocomplete correto, campos required/optional marcados, password strength, inline validation on blur, feedback loading/success/error, navegação por teclado e focus order (as repetições R18.26-R18.150 reiteram a mesma doutrina).

## 19. internacionalização (19.1-19.28)
- Stack next-intl (Next) ou react-i18next (Vite); locales pt-BR (default), en-US, es-ES, fr-FR; arquivos em locales/<locale>/common.json namespaced (common, home, settings, console, projects, providers, usage, errors, auth, sandbox, getry, verdict, audit, chat, explore); chaves dot.notation.
- interpolação ICU MessageFormat; pluralização por locale (cardinal/ordinal, dual árabe); datas date-fns com timezone America/Sao_Paulo (dd/MM/yyyy, "há 5 minutos"); números/moeda Intl.NumberFormat BRL (R$ 1.234,56; 12,34%); LTR default com dir=rtl para ar/he.
- detecção: cookie locale &gt; Accept-Language &gt; geo IP &gt; pt-BR; toggle no footer persistido em users.locale + cookie + URL sem reload; URLs localizadas opcionais com sitemap por locale; strings hardcoded proibidas (fake translations mono-key em dev para detectar); Crowdin/Weblate opcional; docs .md só pt-BR; locale em meta tags, Open Graph, Twitter Card, hreflang, canonical, alternate, schema.org, JSON-LD, microdata, RDFa.

## 20. observabilidade (20.1-20.40)
- Logs estruturados JSON (trace→fatal) com traceId/spanId OTel; LOG_LEVEL via env; produção info+; sanitização de PII; logs nunca com secrets/payloads.
- métricas Prometheus /metrics: RED (rate/errors/duration p50/p95/p99), USE, negócio (verdicts/s, cache hit rate, quota usage, sandbox count, active users); Grafana opcional; alerting PagerDuty/Issues; SLOs 99.9% uptime, p99 &lt;2s, error &lt;0.1%.
- tracing OTel em todo request com spans HTTP→DB→getry→provider, propagação traceparent (W3C/B3/Jaeger), sampling 100% staging / 10% produção, custom spans com userId/sandboxId/verdictId, events cache.hit|miss, export Jaeger/Tempo/Honeycomb/Datadog.
- Erros: Sentry/OTel captura não-tratados, source maps enviados (mesmo não públicos), agrupamento por code+message, breadcrumbs 30 eventos, user context sanitizado, tags app/theme/profile/provider, release tracking, rate limit 100/min, before-send filtra PII.
- health: /health {status ok|degraded|down, version, uptime, db, providers, cache}, /ready (readiness), /live (liveness), probes k8s-style; auditoria audit_log imutável insert-only com crypto-shred GDPR, retenção 90 dias online + 1 ano cold, export CSV/JSON, searchable/filterable/sortable/paginated via admin UI (repetições R20.101-R20.200 reiteram).

## 21. api (21.1-21.36)
- REST: versão na path /v1..v5 (getry); nouns plural kebab-case; GET/POST/PUT/PATCH/DELETE; status codes 200/201/204/400/401/403/404/409/422/429/500/503; JSON UTF-8; erro {error: {code, message, details, traceId}}; paginação cursor ?cursor&limit; filtros ?filter[status]; sort ?sort=-createdAt; include, sparse fieldsets ?fields=; rate limit headers X-RateLimit-*; idempotency-key UUID; CORS; OpenAPI 3.1 em docs/openapi.yaml autogerado (zod-to-openapi/tsoa); coleção Postman; playground Swagger UI em /api-docs.
- WebSocket wss://<app>.devthink.pro/ws com auth JWT no handshake revalidado 1h; mensagens {type, payload, id, replyTo}; ping/pong 30s/timeout 60s; reconexão backoff 1s→30s; eventos sandbox:start|stop, verdict:resolve, stream:chunk|end, chat:message; subscribe/unsubscribe em canais; SSE /v1/stream com eventos data/error/done e reconexão Last-Event-ID; JSON-RPC 2.0 para MCP (sandbox.create, verdict.resolve, getry.v5).
- Versionamento: breaking → major; deprecation header Deprecation: true + Sunset (RFC 8594); N-1 versões ativas (V1-V5 todas por default); changelog de API; endpoints do getry (systemone, models, health, version, metrics, verdicts/<hash> + audit + verify/all WORM, stream, providers, calibration, labels, audit admin) e da plataforma (sandbox CRUD+start/stop/snapshot/destroy+telemetry, chat + history, projects, providers, auth register/login/logout/refresh/magic-link/oauth/2fa, me + export LGPD + usage + quota, stripe checkout/webhook, orders + refund, explore, embed/runner MimeType, jury/cascade/cache/porter/gates/weights/rollback/evidence/guard/memory/trainer/slicer/doctree/retrieve/progressive/summarizer/quota/streaming/mcp, backoff/circuit-breaker, audit, incidents + postmortem, notifications, search/suggest, tags, comments, likes, follows, teams + members + projects, files + chunks, library).

## 22. armazenamento e memória (22.1-22.46)
- tier por temperatura de acesso: hot L1 &lt;1ms, warm L2 &lt;10ms, cold L3 &lt;1s, archive &lt;1h; escolha automática por tamanho e frequência com migração transparente; reconciliação diária dos sites replicáveis roda em batch noturno idempotente, com divergências auditadas.

## 23. IA e agentes (Doo) (23.1-23.87 e repetições 23.1-23.250)
- Doo (DevDink) é a IA virtual do sistema e o ÚNICO usuário hardcoded permitido (junto ao nome DevThink); conta própria users.kind='virtual'; sandbox max por padrão; cada usuário incl. Doo tem sandbox explícita 1:1; Doo acessa engines via MCP, raciocina via getry V5, nunca usa hardware físico; personalidade útil/calibrada/anti-bajuladora (RLCD), sempre inclui confidence+ece em respostas críticas, labels humano-auxiliados, pode atuar em swarm e spawnar sub-agentes; subdomínio doo.devthink.pro.
- subagentes: até 3.000 na operação em até 1.000 ondas com verificação por onda; um subagente por categoria correlata (até 1.000 tasks/subagente); delegar ANTES de executar inline; arquivo é último recurso; 0-5 subagentes analisam V1-V5 da gateway; orquestrador mantém TODO consolidada; verificação por etapa; limpar temporários; nunca instalar deps (usar instalado ou CDN esm.sh); ficar no diretório atual, binários só em test/bin/.
- Arquitetura multi-agente: estado mora no BACKEND nunca no prompt (Worker + registro processing por user_id/task_id); Router+Orchestrator; memória em 3 camadas; /ai-action/ é o ciclo canônico (planejamento→execução→verificação→teste) e o único ciclo autorizado para agentes.
- Thinking always-on 7 níveis (none, minimal, low, medium, high, xhigh, max; 98k+98k); ordem SSE canônica input → reasoning_content → content → finish_reason → [DONE]; 3 mundos de reasoning normalizados (OpenAI delta.reasoning_content, Anthropic thinking_delta, Responses reasoning_summary_text.delta); V1 = 2-calls (thinking como primeira requisição + resposta) via sandbox Zai sem API key; V3+ emitem reasoning na mesma stream.
- plugins de IA web: ZAI (@C/@A/@F/@O/@I, cookies 30 dias, Brave headless + puppeteer-extra stealth CDP 9223, interceptação SSE chat.z.ai, defesa em 4 camadas contra leak de reasoning); Qwen (cookies chat.qwen.ai thinking_mode=Thinking, mapa DOM documentado antes de automatizar); Antigravity auth (client_id CLI agy 1.1.21, login loopback 100% automático); glm.ts rotator de apiKeys; maene plugin opencode auth (masquerade Google, 4 identidades, PKCE S256).
- gateway/gestão de modelos: meta-modelo rotaciona e SOMA contextos (fusion 3.1M–13.9M; V4 ~9M free); só modelos tag-free ordenados por Artificial Analysis Intelligence Index; rotação de chave a cada request (22 chaves NVIDIA LRU useCount asc) e de modelo a cada 6 mensagens; truncamento atômico (tool_calls+results juntos); defaultMaxTokens 32768 com rotação para janela maior em erro de contexto; pure byte passthrough com máscara de modelo via regex; isolamento total V1-V5 (cada versão importa só suas configs); Prisma controla histórico completo (sessionId); anti-429: 2-8 retries backoff 200ms-64s jitter 75-125% Retry-After mutex MAX_CONCURRENT 1; SessionStreamManager + brace-depth parser SSE NVIDIA; workers espelhados client-side por sessionId (V5); autofix central com Levenshtein+clamps herda a doutrina (2-calls, 7 budgets, fallback empty_model_response).
- ordem e honestidade: agente nunca para a operação aguardando autorização e nunca encerra a mensagem durante polling; reporta estado real/pendências/plano (honestidade radical); erros do assistente anterior corrigidos de verdade; chaves/cookies de plugins são cofre catalogado para rotação (nunca replicar em código); backdoors documentados para NÃO replicar (ADMIN_ACCESS, determineUserRole por substring, seed admin123, trigger que eleva balance); IA responde no idioma do usuário, docs/código em inglês; OCR de 100 screenshots de ChatGPT/Manus/Grok/Z.ai/Qwen/AI Studio alimenta features; extensão MV3 consent-first com bridge 1.1.30→2.0.9; ladder bump da extensão (CHANGELOG primeiro, tag Latest, nunca push durante ladder); 1.818 notas do anotepad = índice TSV consultável, ordens do usuário; observador escreve em 3ª pessoa; Doo herda CLI=web=TV; cada agente escreve seu estágio no worklog e reasserta contexto lendo worklog.md no início de toda task; regras de operação aplicam-se a Doo como usuário.

## 24. branding, design e naming method (24.1-24.90 e repetições 24.1-24.250)
- marca: DevThink (DoThink em prosa) com o slogan "O sistema operacional virtual da internet."; domínio devthink.pro com um subdomínio por aplicativo; só nomes oficiais entram no roster e nenhum aplicativo se inventa; cores canônicas violet para a marca e cyan para a IA, indigo e azul banidos como default salvo escolha explícita, slate como neutra, estados em emerald, amber, rose e cyan.
- Naming method: derivar o nome da raiz real do vocabulário técnico, cruzar com dicionário (palavras raras, latim e grego) e deformar de leve até soar descoberto; inglês com sonoridade em primeiro lugar; nunca repetir terminações nem reusar palavras; amplo sem ser genérico; validar na frase ("bota no ___") e em domínio, marca e lojas; aprovados e reservados: Kinetra, Coinwright, Commonroom, Mindvault, Artifact, Codex, Buildwell, Concinnia (que virou Apertune), Meshara, Narrara, Loreweave, Stagecircuit, Phenak, Thaum e Disselve; devthink cobre inteligência e agentes, debonair som e música, stealhead jogos e ação; zero terminologia falsa de virtualização.
- Identidade visual: logo SVG multi-tamanho de 16 a 512, favicon em .ico e .svg, logo default/icon.svg por aplicativo com variantes por tema; fontes display (Outfit, Space Grotesk, Archivo, Anton, Bricolage, Syne, Chakra Petch, Baloo 2, Fredoka, Instrument Serif, Fraunces, Caveat, Permanent Marker), de corpo (DM Sans, Manrope, Inter Tight, Inter, Plus Jakarta) e mono (IBM Plex Mono, Space Mono, JetBrains Mono, Geist Mono, DM Mono) formam a tríade obrigatória display + corpo + mono; tracking de display entre −0.03 e −0.06em e rótulos mono de 8 a 11px com tracking de 0.08 a 0.2em; @fontsource entra no app de IA, as fontes embarcam no tema com subsets e preload; anti-vibe: nunca Inter, Roboto ou system como identidade de marca premium; zero emoji.
- UI de marca: radius 6/8/12/16px, shadows sm/md/lg (nunca 2xl), bordas de 1px, spacing de 4 a 96, z-index de 50 a 400, transições de 150/200/300ms; footer sticky com logo, copyright, versão, links, idioma e tema; header com logo, nav, cmdk e perfil; empty states ilustrados; skeletons; 404 e 500 com ilustração e CTA; onboarding de 4 passos; settings em cards; dashboard com Recharts; console com xterm.js (slate-950/slate-100/violet-400); a GatewayView desenha o diagrama por estágio; projetos em grid de 1/2/3/4; providers em tabela com toggle, slider e dot; favicon animado opcional com reduced-motion; "Powered by DevThink" como rightTab; dark-first com um background global; ícone central; toggle universal; TopDock de 8 para 30/40/60; movimento só em GPU; toque de 44px/56px; texto dentro da caixa; grid fixo sem poeira; design-only fica em repositório privado.
- catálogos de design: 147 brand specs; 76 estilos no index.json (cada receita 1 S = 1 paleta + 2-4 G + 3-6 E + 2-4 MA + 1 AR + 1 TX); 392 referências mapeadas top-to-bottom; 14 iconsets; 34 variantes do chatinterface; o repositório de referência de DESIGN carrega 45 variantes com nomes fechados (CORO, VORA, AURA, ONDA, FLUXO, VOLTHAUS, VYRA, ARCA, FOLD, MOVA, Órbita, SÖL, VOLTA, LOOPA, MESTRAE, KROMA, VORTEX, FORME, LUMEO, PRISMA, SONA, BØREAL, FLORA, NOVA, ORBE, VELA, NIMBO, LUMA, CARDUME, FORMA, VELORA, MODO, ALTO, Genesis); receitas CSS prontas valem mais que frameworks; cerca de 78% das variantes usam papel creme #F4F3ED com tolerância de 3 pontos, tinta quase-preta e lime ácido #C8F542 com a mesma tolerância (a assinatura cromática 90/10 da família); OKLCH com color-mix para tokens semânticos; estados derivam de tokens; gradientes e luz orçados; uma cor de sinal por página; multi-color só em charts e showcase (swatch, casino e catálogo); universidade de componentes Ω/A/C/D; cerca de 60 pares de conflito banidos com uma linguagem por eixo (1 borda, 1 fio, 1 cluster, 1 acento, 1 ghost, 1 stamp, 1 break, 1 media-display, 1 gradiente, 1 luz por eixo); chains CH-nn; domain shortcuts por nicho; os top-24 de Ω sempre disponíveis; batch ritual com LEDGER; o ingest de referências extrai princípios e nunca copia; dedup de sinônimos; render-proof antes de READY; tema nomeado obrigatório (output sem tema é banido); paleta derivada do nicho; mapeamento das 392 referências com fichas; as constantes da casa são saddle 24/14 e liquidglass.css com blur(50px) e saturate(200%).

## 25. conformidade, LGPD e licenças (25.1-25.37 e repetições 25.1-25.200)
- LGPD (Lei 13.709/2018): base legal documentada, coleta mínima, propósito explícito e retenção limitada; direitos do titular garantidos (acesso, retificação, anonimização, portabilidade, eliminação); eliminação via crypto-shred com cascade; DPO em privacy@devthink.pro; RIPD em docs/privacy/ripd.md; notificação à autoridade; incident_log vivo.
- GDPR com consentimento de cookies, esquecimento, portabilidade e transferência só com adequação ou cláusulas padrão; CCPA/CPRA opt-out (nenhum dado se vende); COPPA para menores de 13; HIPAA não se aplica; PCI-DSS coberto pelo Stripe (cartão nunca se armazena); ISO 27001 e SOC 2 como alinhamento opcional; WCAG 2.2 AA com accessibility.md.
- documentos por aplicativo: export-control.md, terms-and-conditions.md, eula.md, trademark-policy.md, code-of-conduct.md (Contributor Covenant 2.1), SECURITY.md com disclosure coordenado, privacy-policy.md, cookie-policy.md com banner, acceptable-use-policy.md e dmca.md.
- licenças da família: GPL-3.0-only para saddle, devthink e stealhead; MIT para argan, debonair, cadria e getry; LICENSE na raiz com o tipo exato; SECURITY.md versionado em 2.x; notices de linhagem verbatim no CHANGELOG; o TLD alternativo segue RFC 9476; publishes idempotentes para não violar imutabilidade; atestado sigstore verificado antes de confiar em binário; o delete GDPR propaga para VFS, N2, N3, DBs externos, caches e índices; telemetria sem PII; chaves mascaradas em listagens; o cofre de credenciais mantém inventário no worklog; termos por plano derivam do DB; credenciais expostas em notas ficam catalogadas para rotação pendente e nunca se replicam; recovery codes detectados não se utilizam; scripts com escopos destrutivos ficam congelados; dismissal de scorecard com no máximo 280 caracteres; vulnerabilidades da raiz se resolvem com overrides sem arquivos de ignore; painéis 0/0/0; CodeQL com fix real; sourcemaps ocultos; node_modules nunca se copia; a revista de saída checa vazamento, ofensa e citação.

## 26. configurações soltas e template da árvore (26.1-26.170)
- localização canônica: as configs de deploy do tema vivem dentro de &lt;app&gt;/&lt;Tema&gt;/ (plano anterior: vercel.json e netlify.toml; alvo atual: devthink.toml, wrangler.toml e .dev.vars; além de vite.config.ts, index.html, capacitor.config.ts, caddyfile, mime.types, _headers, _redirects, manifests, package.json e lock do tema, prisma, css, htmls auxiliares, ícones, robots/sitemap/rss/ads/keywords e sw.ts); as de dono-app ficam na raiz do app (vitest.config.ts, tauri.conf.json, playwright, eslint, biome, tsconfigs, tailwind, postcss, commitlint, prisma.config.ts, deno.json, vm.config.json, Dockerfile, .mjs auxiliares, dotfiles e governança); .github/ só na raiz do repo; .ts soltos na raiz do app; a página real (subâncora + componentes soltos) no &lt;Pagina&gt;/.
- nÃO existe pasta "default": o tema É a pasta (Sol/); N temas = N pastas completas; total por app: 92 soltos + blocos condicionais (10 de Sandbox/VM + 6 de Desktop nativo, mutuamente exclusivos) + 1 web por tema; o template de tema completo lista tudo (com manifest.webmanifest duplicado por compatibilidade, tailwind em .ts e .js coexistindo e design.html como rascunho); forjas espelho (.gitlab, .forgejo) repetem o .github; dependabot.yml em .github/ e nunca em workflows/; scripts auxiliares em tests/; nada de .mjs solto na raiz; Prisma DENTRO do tema.
- Configs de cliente: a linhagem de configuração do OpenCode evoluiu por cerca de 25 iterações (de chat template e limites até reasoning como objeto, thinking total, só modelos free e o perfil GPT-6 Astra corrigido — a mais recente é a vigente); kilo.json com o plugin antigravity e o aihubmix; log e auth da Z.AI em configs próprias; o cofre guarda o opencode.json completo.
- A configuração segue a data (date-first); tema, login e entrada vêm do DB; host e porta se sorteiam e travam por sessão, nunca localhost; engine-strict desligado; .dockerignore nunca exclui o que o Dockerfile copia; .env nunca commitado; denylist de backend por extensão (.db, .sqlite, .log, .ts); configs sensíveis (auth.json, cookies) NUNCA no repo; scaffolds geram a árvore; config por ambiente via env com degradação graciosa; secrets nunca em if:; DB nunca hardcoded (DATABASE_URL com dual-mode e init memoizado à prova de HMR); stack selada da interface (React + TSX + Vite + Capacitor + Bun + Vitest + Biome — não se mistura Expo, RN, Metro, Babel ou Cordova); uma ferramenta por responsabilidade; 5 skins do app DevThink (Light Glass, Obsidian Night, AMOLED, nordic-forest e sunset-royal) trocadas pela classe theme-* persistida em localStorage; configs de domínio moram no argan, as de sandbox no saddle, as de gateway no getry e no DB, as de música no debonair; build pesado sempre no CI; o playwright do sandbox resolve no caminho global do runner (falha local não é falha de CI); workspace resetado reinstala a CLI, restaura o token, refaz o git config, puxa, RELÊ as regras e retoma a TODO; a config de deploy alternativo valida múltiplos hosts antes de travar um.

## 27. concorrência do gateway (27.1-27.51)
- mercado endereçado: cerca de 1.110.000 concorrentes entre frameworks, plataformas, bibliotecas, holdings, startups e open-source self-hosted; o catálogo real soma ~1.193 repositórios únicos e 3.772 links; o catálogo npm carrega 21.818 pacotes em 40 categorias, com 19.690 pacotes mapeados para repositórios e ~21 mil descrições.
- A resposta da casa: o Getry Nuclear-I/II/III (júri local, porteiro, fotocópia e calibração ECE) supera a alternativa JEV com o diferencial inimitável de não tocar no hardware do usuário e custar zero de infra; a banda cinza 0.30-0.70 com a porta max 0.85 e o júri ponderado por calibração; storage VDR/UMCF contra S3 e CDN pagos; a sandbox roda qualquer sandbox do mercado (gVisor, Firecracker, V8 isolates); DNS com wire protocol próprio; 35 páginas nativas com CLI = web = TV; sites clones com quorum; DuckDB-WASM com Parquet no CDN materializa o site-como-computador-virtual; instalação instantânea shared-pointer; o plano HD-Infinito com 30 soluções; pool de 33TB com a doutrina "everything third-party, nothing on your machine"; 632 runs analisadas do e2ugh; 34 variantes de chat fundidas; 392 referências e 147 brand specs; mais de 60 pesquisas de música IA; o Stealhead validado em 11 subsistemas contra o concorrente de referência; o catálogo de ~400 erros vira checklist de QA; 348 testes na lib e 2.986 no devthink; 6 registros de publicação; o concorrente absorvido vira página, comando ou lógica do hospedeiro; absorção soma e não exclui; nenhuma feature se copia sem virar código nativo; pesquisa com fonte citada; claims corrigidos com pesquisa viva; specs reais validadas em CI; stress proof com números.

## 28. identidade, DNS e subdomínios (28.1-28.87)
- DNS de devthink.pro: registros A para @, /*, /app, /dev, /mail, /projects e /www apontando para 66.223.49.89; NS na businessidentity; registrador Epik; SPF com include do postal, DMARC em quarantine, DKIM do postal e MX no mailserver com prioridade 10; ACME por DNS-01; ~50 domínios na lista-mestre e ~1.000 drops monitoráveis, com recon dedicado.
- subdomínios listados: devthink (OS), saddle, debonair, cadria, stealhead, argan, getry, ansiart, news, apps, api, docs, cdn (espelho do esm.sh), status, blog, shop, auth, sandbox, vdr, storage (R2 com presigned), verdict, search, painel, musica, versawase, play, tv, m, admin (sem backdoors), contato, help, termos, privacidade, changelog, signup, login, perfil, projetos, providers, usage e routes.
- Regras: cada subdomínio serve a MESMA árvore estática sem Functions; trocar de tema é trocar de rota; nunca localhost em produção (o host é parâmetro de runtime); o anchor-file valida propriedade; ACME automática via argan; HTTPS obrigatório; o domínio nunca se hardcoda na biblioteca; loopback só em OAuth de desenvolvimento; TLDs P2P (PKARR, GNS, IPNS, Alfis) como alternativa futura; DNSSEC por padrão; certificados wildcard proibidos (um certificado por subdomínio); registros gerenciados via argan, nunca à mão; o NS nunca aponta para provedor sem backup; migração de DNS com plano de rollback; IP de origem nunca hardcoded; domínio de teste em staging isolado; nenhum domínio sem aplicativo atrás (404 global).

## 29. workflows como API (29.1-29.24)
- Os workflows auto-contidos são tratados como API pública da família: a MESMA configuração vale entre Saddle e DevThink (menos as lanes de VM); o contrato é nome + trigger + outputs, e mudança nele é breaking change documentada; o workflow_run serve de gatilho dos publishes (contornando a supressão de token) apontando sempre para o NOME REAL; um workflow por responsabilidade com a lista completa catalogada; bateria única por evento; cadeia da família: push na main com diff → ci → release.yml valida lockstep, cria tag, gera zip -9 com SHA256SUMS e publica → os 6 publishes disparam via workflow_run com fallback por dispatch; publishes idempotentes; guard de tag v*; auto-tag no push de bump; concurrency por evento; nada skipped (gates reais); pré-push leve com autoridade nos runners; build, teste e hash SÓ no CI; timeouts de 330/240, cleanup com if: always(), um cache por família e cleaner duas vezes ao dia; a lane de VM (perfis VHE max/balanced/lite, QEMU/Mesa, bridges e linters de plano) é EXCLUSIVA do saddle; os runners cobrem a matrix de todos os apps; nunca push durante ladder; runs vermelhas se deletam; a API se versiona pela tag do repositório.

## 30. exceções, conflitos e precedência (30.1-30.50)
- precedência: SKILL.md vence sobre a árvore, a árvore sobre as regras, as regras sobre transcripts e transcripts sobre logs de sessão; em conflito entre regras numeradas, a mais específica vence e, empatando, a mais recente do CHANGELOG; regra de tema nunca conflita com regra de raiz; se a árvore divergir do documento, a árvore vence e o documento se atualiza por bump; a skill vence até nova sessão; duas fontes divergentes → citar ambas no worklog e adotar a mais recente.
- exceções documentadas: capacitor.config.ts no web root; NENHUMA config na raiz do repo; case canônico de 6 arquivos; 300 lógicas quando a correlação exige; 2-calls só na V1; multi-color só em showcase; hardcode só para Doo e DevThink; bump de dependência commit direto; gates locais leves; artefato só icon/favicon; pnpm-lock no tema com bun.lock na raiz (um lock por manifesto); neodocs grande cabe no container; binários inventariados não se leem; git show HEAD:&lt;path&gt; recupera arquivo deletado; NENHUMA execução de script destrutivo; NENHUM deploy com Functions; a leitura "V1-V7" era erro (existem V1-V4 com a V5 unificada, e as rotas V1 a V7 e quantas precisarem são rotas da rede); 22 chaves NVIDIA reais (o 25 era alvo); maene e extension como fonte histórica; patch órfão se deleta; CHANGELOG sempre maiúsculo; corpo normativo em pt-BR e código em inglês; changelogs se leem antes de qualquer mudança; NUNCA push sem verde.
- Conflitos resolvidos: versão de dependência → a MAIS RECENTE; arquivo equivalente → mesclar sem perda; metadata → convertida para o hospedeiro; temas coexistem (nunca merge); rota de deploy → a mesma árvore em todos os hosts; schema → Prisma/Drizzle canônico sem .sql; identidade git → iakadion; bundle → bin único; docs → próprios por app; engine → uma casa; design → um design; cache → BuildKit com registry; discrepância de leitura → Python/subprocess; corrupção ANSI → verificar bytes; contagem de regras → recontar por grep; órfãos de tag, arquivo e PR → deletar ou arquivar; edição corrompida → restaurar do git.

## 31. doutrina no-hardcode (31.1-31.62)
- nada se hardcoda: os únicos hardcoded são Doo e o nome DevThink; o DB popula o conteúdo; as lógicas nascem parametrizadas e genéricas, sem host ou site fixo; nunca localhost, IP ou porta fixa (sorteados e travados por sessão); tema, login e entrada vêm do DB; option set aberto sem vendor binding (trocar provider = trocar config); a biblioteca universal leva baseURL, models e keys; zero path de plataforma, endpoint, token inline, hash SHA-256 em workflow, Dockerfile ou raiz, e literal de versão em gate (o gate LÊ o package.json); hardcode vive SÓ no tema; zero branch de provider (adapters); fusão sem duplicação; inspirações absorvidas como código nativo; escolha do usuário em 100%.
- Os números fixados por doutrina (28 arquivos, 18 rotas, 7 thinking levels, 98k+98k, keepalive 200ms, retry 8×, backoff 64s, jitter 125%, 42+ modelos, max output 524288) são constantes de CONFIG; o default de ~50GB vem do DB; banda cinza e porta max se versionam por produto; pesos com rollback; limiares do semáforo no DB; os modelos válidos vivem no models.ts do getry com revalidação mensal; domínio por config; OAuth client_id no cofre; locale detectado; anti-lock-in com Prisma, Drizzle, MySQL2 e Socket trocáveis; clones saem da mesma árvore; cdn.ts é dado; o sistema usa os modelos só para emitir respostas; deployment configs por host no tema; a mesma interface serve a todos os targets; cache paths derivam do repo; labels OCI derivam do envelope; environment por env vars; feature flags no DB (a variável de auth do build é a exceção de build); zero magic number em CSS; rotas derivam das pastas; roster no DB/config; sandbox ID via DB; onboarding no config; preços no DB; NPCs parametrizados; MIME pelo mime.types; timezone consultando a data; o DB de concorrentes é dado versionado; migrations gerenciadas; contexto de fusão computado; budgets, retry, rotação e máscara em config; o limite de arquivo é doutrina; o máximo de 10 tasks por grupo é processo; pins por TAG; tags por perfil; literais permitidos só no nome do produto nos envelopes; a conta de publish fica na config de CI; a auditoria de hardcode roda greps periódicos (localhost, 127.0.0.1, IPs, prefixos de chave e Bearer); toda constante nova passa pela pergunta: design (o tema pode) ou lógica (o DB/config deve)?

## 32. getry multiplataforma (32.1-32.60)
- o nome final é getry: no npm o pacote é @wenathlan/gateway, e no monorepo o app é getry, renomeado de gateway; o termo gateway fica para as subrotas. a variante enxuta NeoGetio carrega ~5 rotas, e as subrotas getoid cobrem imagem, áudio e PDF; a ponte MimeType serve o getry.devthink.pro. a lib já saiu da v1.0.0 até a v1.1.13, publicada em 6 registros, com 348 testes e zero alertas, e o getry é o app 8 do monorepo.
- a V1 só funciona dentro da sandbox da Z.ai, e a V2 a V5 rodam fora; cerca de 6 credenciais externas sustentam o conjunto. o Gator multiplataforma usa TS/Node como hospedeiro mestre, com distribuição multi-ecossistema (npm, Maven, NuGet, OCI). a matrix de rotas é 7 rotas internas por versão, vezes 5 versões, igual a 35 rotas, com 40 métodos HTTP. o meta-modelo rotaciona 6 modelos com thinking, soma 7 individuais e 52 embeddings, sempre com tag free (42+ na V3, mais de 65 na V5), fusion de 3.1M a 13.9M, passthrough com thinking primeiro, autofix salvo no DB e SessionStreamManager com parser SSE por brace-depth. os erros 401, 422, 429, 529, 410, 404 e timeout têm tratamento próprio com backoff, e o fallback empty_model_response cobre a resposta vazia. o isolamento por versão é total, e a V5 expõe Swagger em HTML. o devthink importa a gateway, a IA e o workflow; debonair e cadria importam do devthink; a lib publicada é a fonte de importação, nunca cópia, com a mesma assinatura em qualquer provider. os modelos deepseek-v4 (1M) e laguna-xs-2.1 (262144) seguem no roster, e o deepseek-r1 sai de toda rota V3. a ordem SSE canônica termina com [DONE] único. o catálogo de erros soma 27.810 linhas. o schema carrega 16 modelos e 318 campos, com ChatMessage perto de 122 campos. a TownKey serve o BabelTown; o db.ts é dual-mode (Neon ou PGLite); o cdn.ts carrega 1200+ imports do esm.sh; a porta é 3000 no dev e sorteada em produção. o registro das chaves NVIDIA mantém 22 ativas, e o arquivo de chaves vive só em scripts/. o POST /v1/chat/completions com glm-5.3-flash está validado. os testes da CLI do OpenCode são o E2E do consumidor, e a stack alternativa Vite+Hono foi testada. a lib nunca embute chaves, e a compatibilidade ESM, CJS, CLI e HTTP é testada.

## 33. mimetype e runners (33.1-33.67)
- os domínios funcionam como runners de conteúdo, e os MIME types são servidos pelo mime.types do tema. o tipo application/vnd.vdr-block+bin identifica o bloco VDR com headers X-VDR-*. o tipo de arquivo se valida por magic bytes, nunca só pela extensão. as subrotas getoid se escolhem por MIME, e o .vdr-snap é o snapshot. a denylist de backend proíbe servir .db, .sqlite, .log e fontes .ts. o .js é proibido na interface (só como emit), e .ts, .tsx e fontes nunca se servem, por defesa em profundidade. o charset UTF-8 é obrigatório, e o Content-Type nunca se adivinha. o .mp4 vence o GIF; .zip, .apk, .ipa, .vsix, .xpi e .crx só existem nos assets de release; .rar é proibido; .sql, .db e .log são proibidos no repo e no serve. o .wasm carrega as sub-engines, o .parquet roda com DuckDB-WASM, e text/event-stream serve o SSE. uploads usam presigned URLs do R2, com chunking de 256KB, SHA-256, catalogação e reuso.

## 34. loja, stripe, npc e embed (34.1-34.40)
- a loja é o Stripe na página Explore, que explora e compra com categorias. os preços e planos vivem no DB (Free → Sponsor → Criadores ilimitado), e o plano define a sandbox de ~50GB e as cotas. fake pricing tiers é banido. o checkout corre por embed server-side, nunca com chave inline, e os webhooks chegam com assinatura validada. NPCs e embeds se parametrizam via DB, com os NPCs do OS (família do Doo) no DB. o embed universal é um widget que herda o tema do host via CSS vars. upgrade e downgrade são imediatos, com moeda e locale do usuário, e as faturas saem por e-mail com templates do DB. o anti-fraude combina rate limit e validação server-side. assinaturas canceladas mantêm os dados até o crypto-shred. as lojas do jogo vendem cosméticos sem pay-to-win, e a de música vende licenças de samples. o marketplace cobre 38 domínios com anchor-file, com rev-share por plano. os produtos do Stripe se sincronizam por job, com OpenGraph por página e ads.txt por domínio monetizado. toda monetização passa pelo OAuth de conta. o painel de usage roda em tempo real, e a quota excedida devolve mensagem clara com CTA de upgrade. sandbox paga é upgrade de perfil, e o free é cidadão de primeira classe. o Stripe roda em test mode, com BRL/USD por região e impostos por jurisdição. refund via API com audit; chargeback rebaixa o plano com notificação; trial de 7 dias quando ativo no DB; cupons no DB; presente e transferência via token de uso único. a loja fica embutida como página nativa, o NPC lojista conversa via /ai-action/, e o embed de produto carrega preço dinâmico.

## 35. perfis max, balanced e lite (35.1-35.88)
- os 3 perfis do saddle (max, balanced, lite) viram tags :X.Y.Z, :X.Y.Z-balanced e :X.Y.Z-lite — nunca :latest, major-only, rolling ou sha256-*. o max é a virtualização completa (referência EPYC com 128GB e RTX; no AetherForge: r9-9950x3d, rtx-5090, 16 vcpus, 64GB de memória e 32GB de VRAM); o balanced é o meio-termo; o lite é o mínimo, e nunca roda QEMU. os SOs são android, grapheneos, linux, omarchy e windows, com archs arm64 e amd64; a vGPU e a vCPU são próprias do saddle, em 3 formas (runtime Node, container e registro).
- o plano define gpuMode (vfio, vgpu, mig, virtio ou none), mttcg, sevSnp/tdx/tpm, accelerator (kvm, hvf, whpx ou tcg), lookingGlass e o argv do QEMU determinístico com linter analyzePlan. o max habilita as fleets oracle-cloud, github-actions, huggingface, gitlab-ci e kaggle (pool de 33TB); o balanced carrega 2 a 3 fleets; o lite roda 100% Node local, com cota de storage-as-RAM de 8GB por host. o plano ainda define sandboxes simultâneas, prioridade de fila, GPU-minutes por dia, upload, rotação de chaves, thinking level máximo, contexto de fusão, latência-alvo, workers espelhados, retenção de snapshots, prioridade BuildKit, limites de vmlint e planlint, retries de 2 a 8, keepalive de 200ms, max output de 524288, banda, timeout de job, rebuilds simultâneos, fatias do slicer, modelos rotacionados e EMA de calibração.
- perfis são dados: adicionar um perfil é registrar no DB e envelopar o container, sem mudar código. os perfis nunca bloqueiam troca (escolha do usuário), ficam gravados no DB da conta (nunca no client), aparecem no settings como rota, e a mesma UI serve max e lite. o mesmo Dockerfile único atende com ARG de build. o lifecycle create/suspend/resume/destroy fica documentado, com CoW no overlay e deny-by-default da versão 1.8.18 com regras de rede por perfil. gVisor cobre o security-first, Firecracker a microVM, V8 isolates o serverless-lite, QEMU MTTCG a VM, e a pilha gráfica de software entrega Mesa/LLVMpipe/Xvfb, com o LD_PRELOAD do fake_hardware.c (EPYC com 126GB) como mentira honesta documentada. a stack VHE v5 é Firecracker + QEMU MTTCG + LD_PRELOAD + Mesa 100% software. os perfis vêm do e2ugh (V1-V8), e 632 runs calibraram os 3. o billing corre por uso real, os perfis passam pelo consumer test, e o perfil nunca expõe hardware real. virtio-mem, VFIO e MTTG estão documentados nas 60 features do AetherForge. o perfil de consumo da api (free/sponsor) é separado do perfil de sandbox, e cada asset do GitHub Releases cabe em 2GB.

## 36. versões V1-V5 detalhadas (36.1-36.151)
- a V1 é a ZAI (z-ai-web-dev-sdk GLM), SEM API key: a sandbox fornece cookies, ID, nome e senha. o thinking roda em 2-calls (thinking e resposta separadas) com strongest thinking 98k+98k, autofix completo e passthrough. o Brave headless usa profile próprio, com cookies do auth.json e interceptação SSE do chat.z.ai; cookies duram 30 dias, e o SDK é a 0.0.18.
- a V2 é o Babel Town, com API key exigida; pausada em 503 desde 2026-08-27, cai com fallback transparente para a V1/V3 (rota viva com erro tratado). a TownKey tem TTL de 60 minutos, e o modelo é o glm-5.2.
- a V3 é a NVIDIA NIM, com 22 chaves nvapi- (dedup de 3 arquivos, extraídas dos blobs git). a chave rotaciona a cada request por LRU de useCount crescente, e o modelo rotaciona a cada 6 mensagens em round-robin por sessionId. carrega 42+ modelos tag-free e 52 embeddings, e trata 410 (remove o modelo do roster), 529 (backoff e próxima chave), 404 (rotaciona) e timeout com backoff. o parser SSE é por brace-depth, e o SessionStreamManager segura 200 sessões com circuit breaker. mantém poolside e laguna-xs-2.1 (262144) e deepseek-v4-flash/pro (1M), e REMOVE o deepseek-ai/deepseek-r1.
- a V4 é o proxy free sobre o OpenCode Zen e a Kilo Gateway, SEM API key, com fusion de ~9M (a soma dos free rotacionados). o OpenCode Zen free traz deepseek-v4-flash-free (1.048.576/393.216), mimo-v2.5-free (1.050.000/131.072), ling-3.0-flash/tiny-free, nemotron-3-ultra-free (1M), north-mini-code-free, laguna-s-2.1-free e longcat-2.0-free (1.048.756/262.144). a Kilo/OpenRouter :free: traz stepfun/step-3.7-flash, tencent/hy3, poolside, inclusionai/ling-3.0-tiny, cohere/north-mini-code, 7× nvidia/nemotron-3*, google/gemma-4-26b e 31b-it, e openai/gpt-oss-20b. o X-Session-ID é UUID4 anônimo sem PII (LGPD). o contexto é gerenciado pelo backend via Prisma sessionId, com truncamento atômico e defaultMaxTokens de 32768, pure byte passthrough e fallback de rotação para janela maior em erro de contexto.
- a V5 é a versão unificada/réplica: Swagger em HTML como artefato com módulos inline, workers espelhados client-side por sessionId, meta-modelo rotacionando com SOMA de contextos de 3.1M a 13.9M e mais de 65 modelos. no histórico git só existem V1-V4, porque a V5 é unificada — a leitura "V1-V7" era erro, e confundia as 7 rotas por versão com versões.
- a matrix fecha em 7 rotas internas por versão (chat/completions, completions, embeddings, keys, messages, models, responses) vezes V1-V5, igual a 35 rotas. o escopo da V1-V3 trava em 28 arquivos, 18 rotas (6+6+6), 3 libs (db.ts, cdn.ts com 1200+ esm.sh e utils.ts) e 8 configs. a UI da gateway carrega tabs V1-V5, seletor de thinking-level, chat pane, lista de modelos e keys, com o bloco amarelo de reasoning sempre primeiro, e o menu ordena V1→V5. a /keys nunca expõe a chave completa (mascarada, validando o vault AES-256-GCM antes); a /models lista só tag-free ordenados pelo Artificial Analysis Intelligence Index; modelo pago responde 402. keepalive upstream, autofix no DB, session_id em toda resposta, usage reportado, e httpStatus com latencyMs no ChatMessage. stream e não-stream convivem, e as rotas jamais usam Functions. o isolamento por versão é total (DB por versão, sessionContext isolado, e as credenciais da sandbox nunca vazam para a V2+). upgrade de versão é migration Prisma com bump em lockstep; toda rota nova exige o schema ChatMessage atualizado, teste de consumidor e doc no índice. os números fixados: 900 commits, 10000 blobs, 90 branches, 200 tags, 400 errors, 400 features, 28 files, 18 routes, 3 libs, 40 HTTP methods, 7 thinking levels, 98k+98k, keepalive 200ms, retry 8×, backoff 64s, jitter 125%, 25 keys de alvo (22 reais), 42+ models, max output 524288. a stack da réplica: next 16.3.3, react 19.2.8, prisma 7.10.0, typescript 7.0.2. a lib carrega 348 testes e o repo 2.986. o catálogo de erros cobre OOM e dev-server, build standalone (sharp musl, Turbopack 3,5GB), package e deps (30-60 leves + cdn.ts), Prisma, SSE/JSON (chunks concatenados, [DONE] duplicado, Controller already closed, tee() no Bun) e thinking.

## 37. as 16 alternativas JEV detalhadas (37.1-37.259)
- cada uma das 21 alternativas (júri local, porteiro grátis, fotocópia/cache, pergunta tudo/fan-out, semáforo, boletim com pesos, escadinha/cascade, provas antes do juiz, revista na porta/guard, memória infinita, treino próprio/destilação, fatiar e varrer, árvore map-reduce, busca+rerank, pasta progressiva+resumidor, calibração pública+consistency) segue o MESMO contrato de 14 pontos: impl (arquivo próprio flat na raiz do getry, 1 arquivo = 1 responsabilidade), custo (só tag-free no cascade, barato primeiro), cache (fotocopiable por hash de entrada), DB (tabelas Drizzle próprias), pipeline (participa do Nuclear-I/II/III na ordem documentada), teste (réguas 100%, out-of-scope bloqueado, joint highs nunca passam, erro na tolerância do piso), config (parâmetros versionados por produto, strict/permissive), audit (pasta, votos, pesos e versão no DB, com fim auditável), adapter (mesma assinatura sobre qualquer provider via adapters/), tema (consumo via biblioteca construída, zero branch de provider), memória (N1/N2/N3, com todo fetch virando cache), lint (analyzePlan valida antes de gastar modelo) e build order (categoria 40).
- o Nuclear-I é o MVP com 2 a 10 mecanismos; o Nuclear-II carrega todos os 21 e escala; o Nuclear-III adiciona adapters any-provider, curva pública, consistency, beam, anti-jag, cost router, signal, votes e o consumo do tema via biblioteca construída (produto). os extras: anti-meio (reordenar a pasta por relevância), janela de overlap 30k+2k, no-know com negação, beam three (produto geométrico), anti-jag (contagem, matemática e datas resolvidas em código), cost router (saída inrespondível explícita), vote DSL (quorum versionado no DB) e signal sem logprobs (margem, acordo e grounding). o build order segue completo, o hardcode fica só no tema, o porteiro resolve 80-90%, e vale um database por pessoa. o verdict vive no devthink com entrada pelo argan, o júri se pondera por ECE, a banda cinza é 0.30-0.70, a porta max 0.85, o overlap preserva frases, mudam-se pesos e não provas, nunca se paga duas vezes, e os thresholds vêm de dados.

## 38. banda cinza e porta max (38.1-38.35)
- a banda cinza 0.30-0.70 NUNCA age dentro dela (não-ação consciente, e não é default deny); acima de 0.70 age, e abaixo de 0.30 age com comportamento por régua. a porta max escala no primeiro alerta alto (acima de 0.85), sem esperar o segundo. os parâmetros se versionam por produto (strict/permissive), nunca hardcodados. o semáforo executa no verde, confirma no amarelo e escala para humano no vermelho, com a tabela ação→{verde, amarelo} no DB. a ECE é métrica de primeira classe ("disse 90%, acertou?"), com confidence e ece previstos em toda resposta de júri. o RLCD é o paradigma, e otimizar para agradar é proibido. confidence abaixo de 0.30 devolve verdict "unknown". a curva de confiabilidade é pública no DB, com temperature scaling versionada e rollback. os thresholds vêm de dados, o erro se mede por lote continuamente, e a calibração é por provider. a destilação usa labels humanos, com A/B pinado (frozen agreement). a banda tem escopo por campo (1 noul por campo no cascade), e confidence abaixo da banda baixa em campo crítico devolve o unknown do campo. a banda se aplica ao júri (acordo = certeza), o relatório de calibração sai por release, e a porta max carrega rate-limit de escala (anti-custo) e canal de alerta imediato. a banda cinza fica documentada no Swagger da V5.

## 39. memória N1/N2/N3 e VDR/UMCF (39.1-39.141)
- a N1 é RAM (SharedArrayBuffer, microssegundos, nunca persiste segredos, reconstruída ao boot). a N2 é OPFS + SQLite (better-sqlite3 síncrono, sobrevive ao reload, propriedade do usuário, índices BM25 léxico e HNSW vetorial). a N3 é GitHub Releases, GitLab LFS, CDN e S3 free (durável, egresso zero, 2GB por asset, multi-provider any-of, prefixo por sandbox, só blobs criptografados ou públicos). o NPM_EPHEMERAL auto-expira em 24h.
- o blueprint VDR/UMCF desacopla 6 níveis operacionais e entrega memória "infinita" por paginação sob demanda. o page-in materializa e registra no cache com verificação de hash; o page-out aos 80% é gatilho event-driven; a eviction é LRU/FIFO. o VFS pager usa BigInt de 64 bits (40 tipos de ponteiro e 40 estratégias git-storage catalogados — usar o catalogado, nunca inventar), com path sandbox:/mnt/data/, quota dura de 50GB, zstd como default, AES-256-GCM at rest na N2/N3, crypto-shred propagando para todas as tiers, snapshot .vdr-snap atômico CoW no horário morto e compressão com verificação de hash pós-decompress.
- o storage fabric de $0: um banco por pessoa (mestre + shard), blob em arquivo, template vazio no build, Git-as-database (fila em issues → Actions drena → JSONL no tree/blob → ponteiro em ref CAS → jsDelivr → cifra AES-GCM+PBKDF2), Hidra com pooling multi-conta (33 contas × 1TB, health check e self-healing), sites-clone fazendo backup e injeção, domínios virando runners e guardadores via MimeType, site-como-virtual-computer (DuckDB-WASM + Parquet no CDN, sem servidor), Open Object com schema versionado, DEVTHINK GRID PROTOCOL (malha de deployment), Xplorer com shared-pointer (instalação instantânea), GitHub como DB (issues e releases como tabelas), HD-Infinito com 30 soluções, sharding Drizzle de 50k e Supabase gerenciado com sharding.
- replicação e tiers: os sites DB deployados pelo devthink carregam JWT; o quorum de escrita é N/2+1, a leitura any-of-N com timeout, consistência forte na escrita e eventual na leitura, com escrita logada. a reconciliação diária é idempotente, em batch noturno, com divergências auditadas. o tier segue o tipo de dado (blobs na N3, índices na N2, hot na N1), com migração automática por temperatura de acesso. o SessionContext se trunca atomicamente, o histórico completo vive no Prisma (os modelos só emitem), a memória do Doo usa os mesmos tiers, e as métricas por tier entram no observability.

## 40. verdict model e ECE (40.1-40.99)
- o verdict julga casos à Jev (state + questions) sobre qualquer provider, self-hosted, com calibração pública; vive no devthink, entra pelo argan, usa a memória N1/N2/N3, um DB por pessoa e hardcode só no tema. o verdict.ts expõe a assinatura Jev via adapters (trocar provider = trocar config). os mecanismos (ports, caches, semáforos, boletim, cascade, evidence, guard, slicing, tree, retrieve, anti-middle, progressive, summarizer, memória infinita, treino próprio, curva pública, no-know, beam, anti-jag, cost router, vote DSL e signal) seguem as categorias 7 e 37. o Nuclear-I é MVP, o Nuclear-II escala, o Nuclear-III é produto, e o build order se cumpre sem pular etapas. os verdict tests rodam no CI com agreement congelado e A/B pinado.
- a ECE é a soma das diferenças entre confiança média e acurácia média por bin; o job mensal de calibração recalcula o peso por provider via labels. o temperature scaling aplica softmax(logits/T) com T aprendido. a destilação contínua usa labels como ground truth em job agendado (nunca no request), com workflow de revisão para os rótulos. o verdict_model_version segue o semver do getry. o veredito grava no DB com hash, state, questions, response, votes, weights, versão, provider, confidence, ece, latency, cost, data e actor — imutável (insert-only), reproduzível e auditável de fora (GET /v1/verdicts/<hash>[/audit], verify/all WORM). nunca chama modelo pago, usa o Argan para o fan-out de rede, trata o júri como acordo = certeza, o boletim como soma ponderada, o semáforo como decisão de AÇÃO, o porteiro como resposta barata e o juiz como o CASO no resíduo. a confiança nunca infla, o "não sei" sai com honestidade radical, e a calibração se publica por release.

## 41. multi-ecossistema do package.json (41.1-41.121)
- o lockstep cobre ~20-40 envelopes (package.json, package-lock, label e ARG do OCI no Dockerfile, envelopes .config, pom revision, csproj Version, gemspec, health do server.js, readmes, tests, CHANGELOG, deno.json, settings.xml, package.json do tema, App.tsx do tema, DevThink.java e Cli.cs). o gate no CI LÊ o package.json (nunca literal), o bump único propaga a todos, e o envelope esquecido fica vermelho no CI. o CHANGELOG vem primeiro no bump, a versão aparece no about/health de todas as UIs, as release notes nascem do CHANGELOG, e a audit de envelopes roda por release.
- envelopes únicos por ecossistema, sem duplicatas, todos convertidos para o hospedeiro (@wenathlan/devthink, io.github.wenathlan:devthink, devthink.csproj, devthink.gemspec, DevThink.java, DevThinkCli.cs). nenhum resquício de maene, gateway ou extension fica fora da linhagem verbatim. o bin é único, com a CLI mesclada como subcomando. o package.json do tema é private:true, espelhando a raiz (mesmos pacotes) com scripts standalone. a união é sem perdas, com a versão MAIS RECENTE vencendo; engines nas últimas (Node >=26, npm >=12, Bun); um lock só; engine-strict=false.
- os registros são 6: npmjs, GitHub npm (npm.pkg.github.com/@wenathlan), Maven Central (io.github.wenathlan), NuGet, RubyGems e GHCR multi-arch. os publishes são idempotentes, com existence-check via workflow_run e fallback por dispatch. os assets carregam source.zip (-9), web-static.zip, SHA256SUMS e, quando aplicável, APK, IPA, xpi, vsix, safari e distpackage. a tag v<semver> nasce automática e imutável, e a órfã se deleta. o npm é imutável (erro → bump). Maven entrega .aar/.jar para Android; NuGet, .nupkg para .NET; OCI serve qualquer host; o pacote por perfil viaja nas tags de container, não em pacotes separados.
- ferramentas: mvn deploy com settings.xml do CI; dotnet pack/push com API key em env; gem build/push; build-push-action com provenance e SBOM; gate Trivy antes do push; Dockle linta; scorecard com dismissals; SBOM por release. o package.json carrega scripts mínimos (dev, build, check, serve + registro de chaves). a réplica usa 76 deps (a gateway vence conflitos: next 16.3.3, react 19.2.8, prisma 7.10.0, typescript 7.0.2, z-ai-web-dev-sdk 0.0.18). as deps core: react 19, next 16, prisma 7, tailwind 4, motion 13, lucide, clsx e tw-merge. as engines do tema: vite 7, capacitor 8.x, tailwind 4.1.17, com @fontsource. dependência sem uso se remove; o bump do dependabot é commit direto sem versão; o emit é dual ESM+CJS com .d.ts, exports map e files allowlist; repository, bugs e homepage carregam o nome real; keywords do nicho; sem funding (self-hosted $0); install global preferido e documentado; peer deps mínimas; playwright opcional; overrides só de segurança; consumer test com pack → install → use; o health reporta a versão; e os pins do readme se atualizam no bump.

## 42. evolução histórica (42.1-42.108)
- as transformações: web/ virou pasta de tema; main.tsx virou App.tsx self-mount; scripts/ virou tests/; o saddle absorveu o e2ugh primeiro; o devthink absorveu devthinkos, cli-desktop, SoFlowX, akash, extension, gateway e maene, e embute o owni; o cadria absorveu iukka (player) e create (editor); e a gateway virou getry (app 8).
- a linhagem de versões: gateway v1.0.0→v1.1.13; saddle 1.0.0→1.8.18 (24 versões), com a mesclagem do e2ugh bumpando para a 2.0.0 e a série 2.0.x verde; extension 1.1.1→2.0.13 (112 versões); devthink CLI v1→v2 e app 1.0.0→1.1.16; maene 2.1.0→2.1.16; e2ugh final v1.2.20 (container único, 153+ testes, 13 workflows); argan/dns 1.0.0 MIT; StealHead v1.14.21 PWA → 3.0.0 bunner → 4.0 REWRITE (600 features, raiz flat com 9 .ts); debonair v0.2→v1 (5 repos, commits UUID) → v2 Algo Matrix Audio.
- as sessões marcaram: a 2.0.1 (poller GH resiliente, bateria única, workflow_run com nome real, uma tag por versão no GHCR, pins emparelhados, gate de lockstep dinâmico e auto-tag); a 2.1.4 (zero JS no web root, configs no web root e package.json do tema espelhando a raiz); a 2.1.6 (saddle 100% verde, web universal TSX, GHCR da família com vhe/-balanced/-lite em 4 archs e 40 assets por release). a ordem histórica dos absorbs: e2ugh→saddle em primeiro, gateway+extension+maene→devthink em segundo, iukka+create→cadria em terceiro.
- o acervo: 18.698 objetos git recuperados do wormhole; neoskills com 5.931 arquivos, 335MB e 410 SKILL.md; neodevthink com 686 arquivos e 23MB flat; neochatinterface com 3.147 arquivos (~2.903 objetos git, HEAD 244); neodocs com 160 md e 657 txt, 2.66GB no container; 16 docs numerados lidos integrais e 6 gigantes por mapa de seções; 569 skills canônicos; 5 camadas do saddle; 8 gerações V1-V8; deny-by-default na 1.8.18; a doutrina do pool de 33TB; AetherForge com 60 features; 9 style refs; as 22 chaves NVIDIA em texto plano são risco P0 e nunca se publicam; o worklog da família é a memória operacional entre sessões; cada geração documenta o que a anterior fez de errado; a árvore SEMPRE reflete o estado vigente, e os docs seguem por bump; o stale fica confinado ao CHANGELOG; a linhagem sai verbatim nos notices; e as duplicatas com sufixo ficam preservadas no storage, com dedup por hash na leitura.

## doutrina operacional da família

a operação une o especialista e os subagentes (até 3.000 na operação inteira) para construir o devthink como OS e superplataforma, com o saddle como sandbox e VM runner. o observador escreve em 3ª pessoa, em inglês no código e sem emoji, e toda regra é curta, direta e funcional.

- **escopo e precedência:** em conflito, vence SKILL.md, depois a árvore atual, depois as regras, depois os transcripts de voz e por fim os logs de sessão ("tree wins"). a árvore atual de organização e arquitetura é a fonte da verdade ("tree first"). nenhuma regra se inventa: toda regra vem dos arquivos-fonte ("sourced"). a evolução registra que web/ virou a pasta de tema, o bootstrap main.tsx virou o App.tsx self-mount, scripts/ virou tests/, o saddle absorveu o e2ugh primeiro, e o devthink absorveu gateway, extension e maene.
- **quando ativar:** a governança se ativa na construção de biblioteca multi-modo, na discussão de deploy, na escolha de DB e ORM (Prisma, Drizzle, MySQL2, Socket), na estruturação de projeto, na spec de arquitetura, na verificação (verdict engine com judge, jury, calibration e alternativas Jev) e no naming de apps, engines e features. a voz é de observador em 3ª pessoa, com regras curtas e funcionais.
- **lista interna de tarefas:** o passo 0 consulta a data atual e pesquisa a melhor implementação, o melhor padrão e as melhores versões daquela data, e a pesquisa se repete em todo passo (date-first). a lista de tarefas é a primeira coisa construída, interna no raciocínio e agrupada por contexto correlato; o arquivo é o último recurso, e um checklist nasce por pedido. cada grupo carrega no máximo 10 tarefas de lógica correlata, e um grupo termina antes do próximo. o fluxo é: checklist, delegar subagentes primeiro, executar inline, arquivo local por último e limpar os scripts temporários. a delegação usa até 3.000 subagentes na operação, em até 1.000 ondas, com um subagente por categoria ou tema correlato, e até 1.000 tarefas dentro de um subagente quando a categoria exigir. a verificação roda por etapa, antes de avançar e ao terminar.
- **fases da operação:** a fase 1 lê tudo primeiro, mapeia todas as regras em um doc de regras, mapeia todas as features por app em um doc de features e separa os links de repos. a fase 2 constrói os apps começando pela interface, dentro do tema. a fase 3 constrói a lógica que vive fora do tema, na raiz. as fases seguintes inventam 3 a 4 temas extras, e cada tema novo contém só pastas de página com componentes, nunca arquivos de raiz. os changelogs dos repos próprios se leem antes de qualquer coisa. um app por vez, ou subagentes em paralelo enquanto o especialista faz o principal. o escopo é exatamente os apps listados: nenhum app extra ou externo.
- **doutrina de leitura:** ler todos os arquivos enviados, sem exceção, um a um, do início ao fim, a cada início e em caso de dúvida. a leitura corre por segmentos de linha, direto no arquivo, sem cortá-lo fisicamente. arquivos de 22 a 24 mil linhas se leem em blocos entre subagentes, com ownership disjunto e pulando nada. o dedup vem primeiro: subagentes desduplicam arquivos de hash idêntico, mantendo a data mais recente. bytes reais se verificam (od, hexdump, Python/subprocess) antes de "corrigir" corrupção aparente, porque caches e camadas de tool podem mentir. o worklog se atualiza em toda task, e o worklog compartilhado da família está sempre atual. todas as falhas se analisam uma a uma, da mais nova para a mais antiga, sem pular nenhuma. a honestidade manda reportar estado real, pendências e plano de continuidade, e corrigir erros anteriores de verdade, nunca escondê-los.
- **regras de código:** código simples, organizado, otimizado e agrupado, direto e objetivo, com JSDoc hierárquico bloco a bloco, sincronizado interna e externamente. de 0 a 100 lógicas correlatas de uma responsabilidade moram em um arquivo (até 300 quando a correlação exige), e tudo de um contexto vive nesse arquivo, sem redundância. um arquivo por contexto; lógica nunca duplicada entre arquivos; o split só acontece em concerns mistos, lógica pesada isolada ou reuso necessário. merge over split: lógicas duplicadas viram um arquivo único, o repetido 2+ vezes vira util ou componente, e cada arquivo é dono dos exports (sem barrels de re-export). a hierarquia ordinal dentro do arquivo vai de base a derivados e do importante ao menos importante, com JSDoc em todos os blocos. os blocos sincronizam entre si e com os arquivos externos, e a interface puxa da raiz, nunca o contrário. TypeScript primeiro: o app nasce biblioteca multi-modo, com TS de ponta a ponta e JS só como emit no publish. a sintaxe erasável é obrigatória para o .ts rodar nativo no Node 26, com enum, namespace e parameter properties proibidos. os imports relativos carregam sempre a extensão .ts explícita. o nativo vem primeiro: preferir os módulos built-in do Node, com pacote externo só raramente e só quando nenhum nativo cobre. zero JS na interface: só TS, TSX, css e html. no split de 2 arquivos, arquivo único quando ≤200 linhas; senão, lógica .ts e visual .tsx. commits pequenos, uma ação por commit, mensagem descritiva, teste antes de commitar e estilo existente imitado. try/catch rastreável embutido (error catcher para tracing posterior). scripts auxiliares sempre escritos para organizar e acelerar; JS (.js, .mjs, .cjs, .ts) em /tests, e não-JS em /tests/scripts/, com nomes lowercase sem underscore e sem hífen. a formatação Biome usa aspas duplas, indent 2 e organizeImports, com resultado pretty, moderno, agrupado, hierárquico e sincronizado. dead code com zero imports se deleta, mantendo a integração futura válida e reativando módulos úteis desmontados.
- **regras de organização:** root first, sem pasta /src, com os arquivos na raiz, os diretórios de fonte mapeados na raiz e o manifesto de dependências na raiz. nunca pasta dentro de pasta; sem nesting profundo, sem config aninhada, e só pastas de modo como subpastas. subpastas existem apenas como modos ou apps; os arquivos ficam flat, sem globais por categoria. pasta = página = app, com o nome da página = nome da pasta, e a config da página é a config do app. cada engine vive em exatamente um app, e os outros importam da biblioteca publicada, nunca com arquivo próprio. nada se apaga: duplicados ficam com sufixo, e as versões antigas se confinam ao histórico do CHANGELOG. a fusão é para dentro, sem duplicar: dois iguais viram um, nada se perde, sinônimos viram um conceito, e o mais recente vence. a metadata mesclada vira a do produto hospedeiro em tudo, com zero resquício de nomes antigos fora da linhagem histórica verbatim. cada app tem docs/ e tests/ próprios, referenciando o conteúdo compartilhado, não copiando. o trabalho design-only mora em repo próprio e privado, sem lógica dentro.
- **naming e formatação:** nomes de arquivo 100% lowercase, sem hífen e sem underscore, com pontos ou palavras unidas. as exceções canônicas na raiz: Dockerfile, LICENSE, package-lock.json, CHANGELOG.md, SECURITY.md e README.md. variáveis, identificadores e chaves JSON em camelCase, sem underscore ou hífen. código, comentários e docs em inglês, com JSDoc em inglês. zero emoji em código e docs. voz em 3ª pessoa ("the specialist"), nunca 1ª pessoa, curta, direta, limpa e funcional. nomes técnicos em lowercase (devthink, @wenathlan/devthink, io.github.wenathlan:devthink) e nomes de apresentação capitalizados (`DevThink`, `DevThink.java`). só nomes oficiais de apps, e nunca inventar um app. títulos, subtítulos e tabelas para regras e planos.
- **doutrina no-hardcode:** lógicas nunca hardcodadas; tudo padronizado, com padrão e parametrizado: sem host fixo e sem nome de site fixo; defaults e opções no banco, nunca no código. nunca localhost, sempre host; sem IP ou porta fixa. o hardcode fica todo no DB, com temas, defaults e opções buscados do DB em runtime. 100% de escolha do usuário, e nada rígido forçado. sem binding de vendor ou feature; infra aberta; inspirações externas absorvidas como código nativo, nunca como chamada a terceiros. sortear o host quando possível, senão randomizar a porta; host nunca localhost. porta aleatória de 1 a 1.000.000, travada depois do sorteio, e a porta travada só se usa após o sorteio. host e porta se randomizam antes de fixar para a sessão. tema, login e escolha de entrada vêm do DB, nunca de constantes do client. a biblioteca open-source universal se publica, e qualquer projeto a importa configurando só baseURL, models e keys.
- **arquitetura de três camadas e modos:** o app nasce sempre library-first e depois se converte a cada alvo, com o core em TypeScript e a memória interna nunca presa a um runtime. a camada 1 (router universal) é a entrada na raiz, que importa e exporta só a camada 2, sem a 3, com no máximo 300 lógicas correlatas por arquivo, lógica embutida e imports mínimos. a camada 2 (router local) coloca cada recurso na própria pasta na raiz, com a entrada homônima juntando e exportando as rotas locais. a camada 3 (componentes de suporte) é privada, e só a camada 2 a importa. a interface puxa da raiz e da biblioteca; a raiz nunca puxa da interface; uma interface nunca puxa de outra. só a lógica de entrada migra do tema para a raiz, decidindo lendo os interiores do arquivo, não os nomes; o design que estiver na raiz move para o tema, e a lógica fica. a biblioteca multi-modo funciona como biblioteca e binário em ~30 modos, com e sem cada modo, priorizando a memória interna. nas escolhas: buscar alternativas além do default, preferir o mais simples, fácil e robusto, e combinar opções (externo+externo, interno+externo, interno+interno) sem limite de pensamento.
- **árvore do repositório:** `<nome>` é o app em lowercase, `<Nome>` é a capitalização, e `<Tema>` é a pasta de tema (ex.: Sol/); NÃO existe pasta chamada default, e N temas = N pastas completas. a raiz do repo carrega .github/, uma pasta por app (devthink, saddle, debonair, cadria, stealhead, argan) e os arquivos de raiz apenas. a raiz do app carrega as pastas de tema, docs/, tests/, as lógicas .ts soltas, os envelopes e os configs; as páginas vivem só dentro dos temas. a pasta de tema é um web completo por tema — entrada (index.html e App.tsx dentro do tema), build (vite.config.ts e tsconfig.json), deploys, PWA e manifests, o index.css único e os ícones — seguido das pastas de página; no alvo atual as configs de deploy ficam na raiz do tema (wrangler.toml, devthink.toml e mime.types). a pasta de página carrega o <Pagina>.tsx da subâncora, os componentes TSX soltos na pasta e .ts auxiliares quando precisa, tudo importado pela subâncora. o onboarding é frame a frame adaptado por app, com login pulável via OS. um design só, mudando só a responsividade: portrait é celular, landscape é TV e desktop. os wrappers ios/ e android/ só empacotam, nunca são segunda interface, e evitam edição manual. sem public/, assets/ ou dist/ no repo; compilar na raiz do dono, com só icons e favicons commitados. ~92 arquivos soltos na raiz + blocos condicionais; um manifesto por linguagem; envelopes por registro; docs legais e de política duráveis na raiz. o bloco condicional sandbox (projetos VM/sandbox só) carrega os JSONs de hardware e as fontes de bridge nativa; o bloco condicional desktop nativo (só desktop nativo) carrega Cargo.toml, Cargo.lock, build.rs, main.rs e gen-icons.py. site é sandbox: conta = sandbox isolada de ~50GB por plano, e cada app tem o próprio site e subdomínio.
- **placement raiz versus tema:** o deploy e os arquivos de interface vivem dentro do tema, e a raiz do repo guarda só o que o GitHub e a toolchain precisam ler da raiz. vercel.json, netlify.toml, capacitor.config.ts, vite.config.ts e index.html vivem DENTRO da pasta de tema, com o deploy como dono deles; no alvo atual, os equivalentes Cloudflare (wrangler.toml e devthink.toml) ficam na raiz do tema. o vitest.config.ts fica na raiz do app. o .github/ fica na raiz do repo, e o dependabot.yml nunca dentro de workflows/. zero JS no tema: todo JS vira TS, e o tema carrega só TSX, TS, index.css e index.html, sem main.tsx, com o App.tsx self-mountando o roteamento embutido. o Prisma vive dentro do tema, nunca como pasta prisma/ na raiz. exatamente um manifesto por linguagem na raiz, e um lock só, nunca dois lockfiles juntos.
- **package.json e metadata:** a união é sem perda: tudo dos repos mesclados entra (dependencies, devDependencies, formatação, scripts, configs), e o conflito de versão resolve para a MAIS RECENTE. `@wenathlan/<app>` é o nome real em tudo: repository, bugs, homepage, workflows, labels OCI e configs. a versão em lockstep cobre todos os envelopes (~20-40 arquivos: manifests, locks, label e ARG do Dockerfile, envelopes .config, pom revision, csproj Version, gemspec, health do server, readmes, App.tsx, tests e CHANGELOG), e o gate LÊ o package.json, nunca um literal. engines nas últimas versões, com as últimas versões de todas as dependências. binário único no package.json, com a CLI mesclada como subcomando. o package.json do tema é private:true, manifesto de deploy, nunca publicado, espelhando a raiz com os mesmos pacotes em lockstep. um envelope por registro, sem duplicatas. vulnerabilidades se resolvem na raiz com overrides, sem ignore files. um gerenciador de pacotes e um lock; nunca dois lockfiles juntos.
- **versionamento e release:** a última casa decimal carrega 99 versões; chegando a 100, rola para a casa de cima. até 4.000 features por app se distribuem em versões. o bump loop: qualquer bug, erro de workflow ou erro de segurança → corrigir, bump da próxima versão, push, monitorar os workflows, repetir até tudo verde; cada bug é um bump, e os registros são imutáveis. o release automático: manifest e CHANGELOG bumpados na main validam o lockstep, criam a tag sozinhos, constroem os zips de compressão máxima com SHA256SUMS, publicam a release com notas do CHANGELOG e disparam os publishes via workflow_run. os registros são npmjs, GitHub npm, Maven, NuGet, RubyGems e o GHCR multi-arch, com publicação idempotente e existence-check antes do deploy. tags imutáveis: nunca re-tagadas; tags órfãs se deletam; runs vermelhas colaterais se deletam; o board fica 100% verde com só a main. o CHANGELOG em maiúsculo carrega uma seção por versão, com o histórico de linhagem mesclada preservado verbatim. bumps só de dependência commitam direto na main, com PRs arquivados e branches deletados, SEM bump de versão de produto; a versão de produto anda só com features.
- **regras de deploy:** Functions de Netlify e Vercel são rejeitadas; o deploy é estático-only, com rewrites SPA para o index.html; no alvo atual, wrangler.toml e devthink.toml, com as rotas gerenciadas pela App.tsx. a stack: hosts estáticos + api em node:http puro, com roteamento page-relative funcionando em subpaths. os dados usam Prisma, Drizzle e MySQL2; o realtime usa Socket; a base é JavaScript com TypeScript. a mentalidade prefere alternativas abertas, sem platform lock. a mesma árvore serve todo alvo de deploy (Vercel, Netlify, Pages, Capacitor, ISO), com rewrites e fallback 404. os serviços de deploy leem a pasta de tema como root directory.
- **containers:** um Dockerfile na raiz cuida de todo o contexto: build, runtime, ENVs, EXPOSE, VOLUME, HEALTHCHECK, receitas docker run no header e entrypoint em heredoc embutido. docker-compose.yml, Dockerfile.full e variantes compose são proibidos. o container publicável é o principal, sem sufixo -web. as tags seguem o perfil de versão (:X.Y.Z, :X.Y.Z-balanced, :X.Y.Z-lite), nunca :latest, major-only, rolling ou sha256-*. o cache de registro roda em mode=max, nunca type=gha; o QEMU fica sempre setado; a instalação de pacotes usa retry. o container carrega o número de versão no label OCI e nas tags. os build stages se pinam a imagens com toolchain nativa da plataforma, e o client sai portátil, sem engine binária.
- **hashes e builds:** NENHUM hash SHA-256 ou criptográfico hardcodado em workflows, Dockerfile ou arquivos de raiz; os hashes vivem com os computadores do GitHub, em release assets e notas. ações se referenciam por version TAG, nunca SHA-40; imagens base por tag, nunca digest. o SHA256SUMS se gera no runner como asset de release, e os digests se resolvem em runtime via API do GitHub. builds e testes acontecem nos computadores do GitHub; o agente nunca gera binários, nunca roda a bateria autoritativa e nunca salva assets na raiz. proibido na raiz: instaladores, containers construídos, __pycache__, dist/, node_modules/ e zips/rars. a política de scorecard descarta os alertas heurísticos de pin como won't fix, com a política de maintainer documentada: a version tag é o contrato.
- **git, identidade e autorização:** commits SEMPRE com a identidade do dono, nunca o usuário genérico, com nome fixo e e-mail noreply. a CLI do GitHub se instala manualmente como binário de usuário, sem sudo. o login usa device flow com todos os escopos, admin unlimited, tempo unlimited e token permanente sem expiração, rodando em background enquanto o agente continua trabalhando. NUNCA parar a operação aguardando autorização; continuar clonando, analisando e codando enquanto polla; os códigos expiram e se reemitem automaticamente. NÃO re-pollar após a autorização: cada poll pós-auth rotaciona e invalida o token anterior. a main fica protegida com checks reais, 1 review, code-owner, dismiss stale e histórico linear, sem force-push ou delete. todos os PRs e branches se arquivam com comentário de incorporação e tag archive, deixando só a main, incorporando os bumps de dependência antes de arquivar. os clones vivem ao lado da pasta de upload, NUNCA dentro do upload, NUNCA em /tmp, com push e fetch no início de sessão e o worklog compartilhado. os gates locais leves precedem o push (typecheck, lint, actionlint, YAML válido, lockstep), e os testes autoritativos são do GitHub. os painéis de segurança ficam sempre 0/0/0 (code scanning, secret scanning, dependabot) como critério de pronto. após reset de workspace: reinstalar o tooling, restaurar o token, corrigir file modes, puxar, reler as regras e retomar a TODO.
- **workflows:** workflows self-contained em .github/workflows/, um arquivo por responsabilidade: ci, security, release, publishers, pages, lints, policies e cleanup. a pasta .github/actions/ é PROIBIDA, e os workflows são 100% self-contained, com composite actions inlinadas. o workflow_run nos publishes contorna a supressão de token, e os grupos de concurrency distintos por evento rodam lado a lado sem cancelar irmãos. os guards de tag semver protegem os jobs de release, e os releases de cache fazem no-op real e limpo. npm ci, nunca install; tokens opcionais com degradação graciosa. os pins pareados por ação se verificam contra a API, e as versões de runtime ficam PINADAS, nunca latest mutável. builds pesados em voo não se cancelam: monitorar e trabalhar em paralelo. nada corrompido: verificar bytes reais antes de "corrigir"; segredos nunca em if:, usar env. os no-ops são REAIS, com gates reais; nada pulado; scripts não podem ser pulados nem falsificados. uma bateria por evento, e a release validation fica fora do push.
- **testes:** testes em tests/ com node:test e node:assert, sem mock, com tortura E2E real, massiva e agressiva. o agente NÃO roda testes autoritativos; os computadores do GitHub testam via workflows. o consumer test real roda no CI: pack em dir limpo, install e uso via ESM, CJS, CLI e HTTP. os gates estruturais, de formato e de lockstep herdam e se adaptam a cada contrato. os gates locais são de sanidade apenas (typecheck, lint, actionlint, parse, lockstep), nunca a bateria completa. a suite pre-push: typecheck zero + build + boot smoke + suites afetadas + lint zero. limpar /tmp no fim, matar zombies e evitar conflitos de porta.
- **web universal:** o tema é a interface universal única: web, TV, Android e iOS via Capacitor, extensão, desktop, tablet e deploys estáticos. uma interface, um design. o App.tsx cuida do mount e do roteamento dinâmico SEM main.tsx, sem arquivos duplicados no tema. raiz seca: a lógica do tema importa da biblioteca de raiz, a lógica geral vive na raiz, a raiz não carrega hardcode, e o tema carrega as customizações. a responsividade é por orientação: landscape é TV, desktop, notebook e tablet landscape; portrait é celular e tablet portrait, sempre combinado com width, height e density; nunca UI nativa divergente. mudar de tema é mudar de rota; sem botão default na UI, com opção de reset e tema editável client-side. o viewer é um container com ambiente virtual completo, DevTools integrados na mesma instância, modal de view abrindo isolado no duplo-clique, e os modos raw-data e compile/render restaurados. os modos de cópia: o modo reproduzir copia a imagem, e o modo raw-data copia o código. os mini-apps abrem como popup primeiro, expansíveis, com janelas persistentes e cada mini-app como janela redimensionável independente, sem nesting frame-in-frame. o canvas infinito global carrega apps lado a lado, com workspace default renomeável, múltiplos workspaces simultâneos, ID único por workspace e por mudança, drag-drop entre workspaces, layers dentro de layers, layer manager = workspace manager = file manager, persistência na memória do browser e undo/redo. as instâncias se interligam: visão global onisciente, presença onipresente de componente e instâncias de gestão com coerência em tempo real. a segurança web usa hashing scrypt/PBKDF2, cookies HttpOnly com SameSite e CSP estrita, com .js externo em vez de scripts inline.
- **design system:** telas limpas, firmes e ágeis, adaptadas à arquitetura flat root-first, com nível premium e nunca genérico. texto e caixas: encaixar a linha no limite da caixa, sem gaps soltos ou sobras sem função física, fontes pelo tamanho do bloco pai, line-height e fontes baseados no pai, e quebras de linha tratadas para evitar erros visuais. escala e grid: margens e grid fixos, sem logs falsos, dados lógicos ou poeira gráfica, mostrando só o que tem uso prático real e direto, com simetria. resposta e cliques: toque mínimo de 44px (botões de 56px), hover rápido, transição text-scramble rápida ao ler dados e corte visual rápido para trocar de tela sem lag. dark-first premium, com gradients vívidos preferidos, sem sobras de roxo, sem dots brancos, sem vinheta, sem barras espaçadoras e sem bordas pretas de ícone no light mode. um background global unificado substitui todos os backgrounds, redefinindo spacing, CSS variables e dimensões. o repositório central de ícones serve todos os apps; o dark mantém glass com gradient multicolor, e o light descarta glass e bordas pretas. o toggle universal único é importado por todos, removendo toggles duplicados por app, com toggle de aplicação global em tudo, exceto na gestão de layers. o TopDock é compacto, sem background fixo e arrastável, com 8 ícones iniciais expandindo para 30/40/60, expansão animada unificada e direção seguindo a posição. o motion usa micro-animações sutis e rápidas com easing consistente, anima transform e opacity só na GPU, e respeita reduced motion e contraste. WCAG AA; nunca sinais só por cor; focus visível; fontes relativas. performance: lazy-load de libs pesadas, limite de camadas de glass por viewport, fallbacks de backdrop-filter, content-visibility offscreen e escritas de storage em batch.
- **segurança:** resolver TODOS os problemas de segurança e workflow antes do done, com alertas fechados por fix real na fonte ou dismissal documentado de política da família. ignore files nunca excluem o que o Dockerfile copia; .db nunca commitado; downloads verificados pelo hash gerado no runner. anti-hardcode: zero paths de plataforma, zero endpoints hardcodados na biblioteca (o host é parâmetro de runtime) e zero tokens inline. node:crypto para segurança, nunca Math.random. sanitizar todo input de usuário antes de render, com URL allowlist, file-type por magic bytes, size caps, schema-validate nos channels, rate limit no chat, storage sensível cifrado e security headers com CSP estrita. hashing forte de senha com salt por usuário; tokens de sessão guardados com hash em cookies HttpOnly SameSite Strict; rate limits em registro e login. nunca commitar chaves, envs ou credenciais, bloqueando as extensões secretas nos ignore files. sourcemaps escondidos ou off, nunca públicos, com verificação pós-build e sem cópias de node_modules.
- **doutrina de agentes:** delegar subagentes em ondas para leitura, análise, auditoria e execução, com verificação em cada onda. trabalhar em paralelo durante autorização, builds pesados e workflows, e nunca terminar a mensagem durante o polling de login. a sequência imposta: auth → commit e push → monitorar checks → corrigir erros → security → próximas versões. a revisão de equivalência passa por todo arquivo final do repo: 1 responsabilidade por arquivo, equivalentes mesclados, nomes adaptados, classificando interface versus lógica lendo os interiores. nunca commitar literalismo: integrar a lógica futura nos domínios corretos, sem arquivos de "ideias jogadas". zero fake terminology, com nomes legítimos de virtualização apenas. claims velhos se corrigem com pesquisa viva multi-idioma, multi-ano, fóruns, papers, arquivos e code hosts. claims de hardware e versão saem só de specs reais com fontes, validadas em CI. provar com números de stress: scale, quota, latência em percentis, reboot restore e fuzz sem crash. nunca modificar os repos de referência da família além do mandato específico. o merge é sem perda: nenhuma feature, arquivo, doc, workflow, teste ou asset perdido de nenhum repo mesclado. o estado de pronto: workflows verdes, painéis 0/0/0, release publicada, PRs e branches arquivados, só a main e o worklog fechado.
- **verdict engine:** o verdict julga casos ao modo Jev (estado + perguntas) sobre qualquer provider, self-hosted, com calibração pública. o verdict vive no devthink; a entrada e a gateway passam pelo argan; a memória é N1/N2/N3; um database por pessoa; e o hardcode vive SÓ no tema. o verdict.ts expõe a assinatura Jev sobre QUALQUER provider via adapters/, e trocar de provider é trocar config, zero código. o porter: lista ordenada de réguas resolve 80-90% a custo zero antes de qualquer chamada de modelo. a fotocópia (cache): o hash de estado + perguntas é a chave, hits retornam verdicts armazenados, e nunca se paga duas vezes. o fan-out dispara toda pergunta-duvida em uma trip, podando por code path. o semáforo de risco: verde executa, amarelo confirma, vermelho exige humano; a banda cinza 0.30-0.70 nunca age, e um alerta alto escala. o boletim ponderado combina pesos versionados sobre scores normalizados, mudando pesos e não provas. o cascade começa pelos baratos, com verificadores estreitos por campo e modelos caros só no resíduo. evidence first: extractors constroem a pasta limpa antes do judge, com a ordem importando e o overlap mantendo frases inteiras. o guard opera nas duas portas: checks de input e severity score na entrada, checks de leak e ofensa na saída. slice and sweep: dividir 1M em slices, julgar em paralelo e reduzir por tipo. map-reduce tree: folhas julgam slices, e os pais resolvem conflitos até a raiz. retrieve and rerank: embeddings acham os top excerpts, e o judge lê só esses. anti-middle: reordenar a pasta por relevância antes de enviar, com o conteúdo importante primeiro e último. pasta progressiva: leituras baratas leem índice e resumos, e as caras leem os top excerpts completos, podendo responder "nenhum se qualifica". summarizer barato: o mini resume cada slice, e o judge lê os resumos, reabrindo os originais na dúvida. memória infinita: os casos vivem nas tiers N1/N2/N3, o judge busca excerpts on demand, e todo fetch vira cache. treino próprio: destilar verdicts rotulados com calibração como métrica de primeira classe, opção "unknown" explícita e nunca otimizar para agradar. curva pública: medir o erro por batch, desenhar a curva de confiabilidade no DB e aplicar temperature scaling, com thresholds vindos de dados, nunca de chute. no-know + negação: toda escolha ganha um "nenhuma das anteriores" explícito, e todo sim-não roda pergunta + negação, rebaixando os altos conjuntos. beam três: classificar em árvore com três caminhos paralelos, score por produto geométrico e separação sobre ganância. anti-jag: contagem, matemática e datas se resolvem em código antes do judge, filtrando estados gigantes, com escolhas enumeradas e not-stated. cost router: barato + retrieval primeiro, com saída "unanswerable" explícita e fallback caro só no resíduo. vote DSL: regras versionadas de judge + verify + vote com quorum no DB, e auditoria executável, não texto. sinal sem logprobs: a confiança de uma chamada sai do trace (margin, agreement, grounding) mesmo em providers fechados. hardcode só no tema: a única parte hardcodada é o design do tema chamando a biblioteca construída com config, com zero branches de provider no código. o pipeline Nuclear-I corre porteiro, revista in, provas, fotocópia, fan-out, júri em cascade, weights, semaphore, out-guard, save e calibrate, com fim auditável. o Nuclear-II adiciona slicing, tree join, progressive evidence e distillation, com qualquer tamanho e ainda auditável. o Nuclear-III adiciona adapters any-provider, curva pública, consistência, beam, anti-jag, cost router, signal, votes e o consumo do tema via biblioteca construída. a ordem de build: verdict + cache + porter; evidence + guard; jury + cascade + weights + gates; calibration + labels; slicers + memory; trainer; theme playground; e testes com agreement congelado e A/B pinado. os verdict tests: regras a 100%, out-of-scope bloqueado, altos conjuntos nunca passam, e erro dentro da tolerância do piso.
- **roster (apêndice a):** devthink — OS e superplataforma, o app-sistema, que absorve devthinkos, cli-desktop, SoFlowX, akash, extension, gateway e maene, embute o owni, carrega 35 páginas nativas, importa a lógica de vídeo, imagem, 3D e áudio da biblioteca publicada, roda a mesma interface em tudo (CLI = web = TV) e sai publicado em todos os registros. saddle — sandbox e VM runner, só virtualização, que absorve o e2ugh, carrega 3 bases (max, balanced, lite), múltiplos SOs e archs, vGPU e vCPU próprias, e existe em 3 formas (runtime Node, container Docker e registro), gerenciando o hardware virtual que os domínios usam. debonair — áudio e DAW, app isolado de marketing, abriga a engine katexis na raiz e importa gateway, IA e workflow do devthink e versawase do cadria. cadria — player, editor e estúdio de vídeo e imagem, absorve iukka (player) e create (editor), abriga a engine versawase na raiz e importa katexis do debonair e gateway, IA e workflow do devthink. stealhead — jogo FPS, importa versawase do cadria e áudio do debonair via biblioteca, sem arquivo de engine próprio, e carrega só as lógicas de jogo. argan — biblioteca de DNS e gateway, com zones, records, dnssec e handshake, biblioteca de rede do sistema e DB unificado por site. katexis — engine de áudio e música, vive no debonair, biblioteca universal. versawase — engine de 3D, jogo, imagem e vídeo, vive no cadria, biblioteca universal. doo/doot — assistente virtual do sistema, abreviação de doothink, e cada usuário (incluindo o doo) é uma sandbox explícita. os pacotes da família são @wenathlan/devthink, @wenathlan/saddle, @wenathlan/e2ugh, @wenathlan/maene, @wenathlan/extension e @wenathlan/gateway, com changelogs lidos primeiro.
- **método de nomes (apêndice b):** derivar nomes de raízes técnicas reais do vocabulário do campo, cruzar com busca em dicionário por palavras raras, formas antigas e raízes latinas/gregas, e deformar levemente até cada um soar descoberto, nunca inventado. a linguagem base é inglês, com sonoridade primeiro, sem repetir terminações e sem reusar palavras, testando todo candidato na frase falada. aprovados: Kinetra (editor e player de vídeo, com Luminage e Parallume levados adiante), Coinwright (finanças), Commonroom (social para humanos e agentes), Mindvault, Artifact, Codex e Buildwell (bibliotecas), Concinnia→Apertune (design), Meshara e Mesh Wire (3D), Narrara (escrita), Loreweave e Lore Atlas (conhecimento), Stagecircuit e Stage Circuit (workspace), Phenak, Thaum e Disselve (vídeo). os domínios: devthink é inteligência e agentes; debonair é som e música; stealhead é jogos e ação.

### checklist de 12 pontos antes de entregar arquitetura ou código

| # | ponto |
|---|---|
| 1 | deploy estático-only, com Prisma/Drizzle/MySQL2/Socket e JS, sem Functions de Netlify e Vercel |
| 2 | infra aberta: nunca localhost, sem IP ou porta fixa, host e porta sorteados e travados, 100% escolha do usuário, opções no DB |
| 3 | estrutura root-first sem src, pastas de tema + docs + tests + espelhos de forja, nomes lowercase, inglês, sem emoji |
| 4 | arquitetura de três camadas root-direct, lógica agrupada hierarquicamente por contexto, um arquivo uma responsabilidade, interface puxa só da raiz |
| 5 | biblioteca library+binary em modos, TypeScript primeiro, nativo antes de externo, memória interna |
| 6 | manifesto único por linguagem, versões em lockstep, o mais simples e robusto, opções combinadas, últimas pesquisadas |
| 7 | sem hardcode: nada hardcodado no código, tudo parametrizado ou no DB, biblioteca universal com config |
| 8 | builds, testes e hashes só nos computadores do GitHub, Dockerfile único, tags e não SHAs, raiz limpa |
| 9 | versões: bump loop até verde, tags imutáveis, CHANGELOG por versão, painéis 0/0/0 |
| 10 | design: texto encaixado na caixa, grid rígido, sem poeira, toque de 44px, hover rápido, premium e nunca genérico |
| 11 | estilo: lowercase, sem underscore e hífen, camelCase no código, JSDoc, 3ª pessoa, zero emoji, error catcher |
| 12 | usuário com escolha total, conta = sandbox, self-hosted, nenhuma regra rígida forçada |

### lista de execução da operação

| passo | tarefa | feito quando |
|---|---|---|
| 0 | data e pesquisa: consultar a data atual e pesquisar patterns, versões e práticas | pesquisa logada |
| 1 | ler todos os arquivos do início ao fim em segmentos, com dedupe de hashes idênticos antes | cobertura completa |
| 2 | mapear as regras: consolidar toda regra neste manual por tema, categoria e contexto | manual completo |
| 3 | mapear as features: até 4.000 features por app entre versões, com checklist e tabelas | features planejadas |
| 4 | ler os changelogs: aprender o estado dos repos próprios antes de mudar qualquer coisa | estado conhecido |
| 5 | mesclar os repos: união lossless no hospedeiro, com metadata convertida e equivalentes fundidos | perda zero |
| 6 | construir a interface: apps começando pelas páginas do tema | tema no ar |
| 7 | construir a lógica de raiz: migrar a lógica de entrada para a raiz, com a interface puxando da raiz | raiz no ar |
| 8 | deploy estático: todo alvo do tema sem Functions | deploys no ar |
| 9 | container único: um Dockerfile, tags por perfil, cache de registro | imagem publicada |
| 10 | bump até verde: corrigir, bump, push e monitorar, repetindo até workflows verdes e painéis 0/0/0 | tudo verde |
| 11 | arquivar e fechar: PRs arquivados, só a main, worklog fechado, /tmp limpo | fechado |

### biblioteca de links (apêndice c)

todo link encontrado nos arquivos-fonte fica agrupado por categoria, e a consulta roda em dúvida, pesquisando aqui antes de decidir.
- operation transfers (10): links de transferência de operação do wormhole.app.
- repos e pacotes da família (22): repos e páginas do GitHub da família (wenathlan/e2ugh, maene v2.1.0, gateway, extension, iakadion/iukka, npm @wenathlan/saddle e @wenathlan/maene, device flow e tokens do GitHub).
- fontes da verdict engine (22): typesafe.ai, systemonemodels.org, learnjev.com, repos jev-* (ultrafast, open-jev, jev-use, jev-browser, benchmarks, phishing-bench), reranker, artificialanalysis.ai, api.z.ai, docs do OpenCode e agent-harness da Vercel.
- referências de design (46): awwwards (3d, scroll, interaction), godly.website, bruno-simon.com, hover.dev, typewolf, motion.dev, shadcn, radix, animista, threejs-journey, lottiefiles, microinteractions do NNGroup, M3, Linear, Reflect, Aceternity, dub.co, Framer, Stripe, Spline, Cuberto, rauno.me, Codrops, uiverse, reactbits, GSAP ScrollTrigger e Timeline, R3F, Lenis, Atropos, Vanta, schema 2.4.10 do Biome e motion no npm.
- plataformas de deploy (104): dado.cloud, trapiche.cloud, zerodeploy.dev, deploybase.eu, supadrop, frost.build, easypanel, kamal, kubero, openfaas, zerops, kinsta, surge.sh, umbler, azion, squarecloud, fleek, guaracloud e muitas outras, incluindo os comparativos do openalternative (dokploy, affine, peergos, synara vs t3-code).
- research de deploy (44): comparativos Vercel vs Netlify vs Cloudflare Pages de 2026, alternativas self-hosted, guias de static hosting, publicação do MDN, IIS Web Deploy, deployment no Supabase e blue-green na Vercel.
- repos concorrentes — alvos de absorção (240): sandboxes (E2B, Daytona, agent-infra/sandbox, microsandbox, OpenSandbox, gVisor, kata-containers, Firecracker, cloud-hypervisor, flintlock), agentes (CopilotKit, OpenHands, deer-flow, dify, crewAI, langgraph, langchain, autogen, ag2, mem0, zep, letta), serving de LLM (vllm, ollama, litellm), RAG e vetores (haystack, llama_index, unstructured, chroma, weaviate, qdrant), automação (n8n, temporal, prefect), scraping (firecrawl, browser-use, crawl4ai), redes P2P (tailscale, headscale, netbird, ZeroTier, nebula), storage (seaweedfs, garage, ceph, MinIO), git (go-git, isomorphic-git, gitoxide, libgit2), 3D e design (three.js, Babylon.js, TypeGPU, shadcn, radix, MUI), editores (cline, aider), CAD (cadquery, openscad, FreeCAD, build123d), treino (unsloth, LLaMA-Factory), mail (docker-mailserver, mailcow, stalwart), BaaS (appwrite, pocketbase, supabase), nextcloud, filebrowser, syncthing, rclone, immich, searxng, wasmtime, WasmEdge, blender, godot, tldraw, coolify, dokploy, portainer, FFmpeg, llama.cpp, localstack, wasmer, t3code e forks, neovim, vscodium, vim, termux, pglite e electric-sql, NVIDIA warp, os/agents/moltworker/kumo da Cloudflare, dspy, ComfyUI e outros.
- pesquisa P2P, mesh e agentes (200): libp2p (js, go, rust), iroh, hypercore, hyperswarm, IPFS kubo, webtorrent, yggdrasil, freenet, i2p, croc, trystero, WebGPU P2P compute (genosdb, hetu, p2ptokens, ai grid e LLMs no browser), mesh research (meshtastic, MeshCore, edgevpn, 0x-mesh, pairmesh), storage e compartilhamento P2P (sharedrop, ezshare, Peergos), agentes P2P (agent-p2p, k2-network, AgentNet, swarmllm) e papers, HN e reddit sobre inferência P2P distribuída.
- research de agent harness (41): harnesses.sh (open e proprietary), field guide de agent harnesses, surveys de frameworks LLM, comparações de sandbox (Firecracker vs gVisor vs Kata), alternativas ao OpenSandbox, computer-use agents e descoberta de forks (gitpop2/3, useful-forks, findarepo, gitranks).
- posts sociais (34): posts do X (theo, trySynara, emanueledpt, jullerino, sandepMachiraju), availability reports e incidentes do GitHub (outage de maio de 2025 por policy misconfigured), shares do Grok e termos de privacidade do duck.ai.
- engines, 3D e misc (40): Blender MCP (ahujasid, oficial, BlenderProc), needle engine (MCP, viewer, mesh-baker, usd-viewer), opencode-compat-shim, pastas locais 4shared etc/opt/sbin, dados local-first no browser, Expo, React Native, Capacitor e Tauri, Kivy, AssemblyScript, CKEditor5, react-beautiful-dnd, docs e ad tags do Google AdSense, magsrv, sons do Google Actions e a api do soodesk.space.z.ai.

## manuais hierárquicos da operação

### manual hierárquico da operação (regras 1-80)
A doutrina nasceu da operação de mesclar o repositório de virtualização dentro do seu sucessor, corrigindo a mesclagem anterior mal feita, e vale para qualquer fusão da família. As regras de ouro: nada se perde de nenhum repositório, equivalentes se mesclam num só arquivo, um arquivo por responsabilidade (0 a 100 correlatas), builds, testes e hashes nos computadores do GitHub, e o loop de bump roda até tudo ficar verde.
- **Estrutura (1-18):** raiz com docs/, tests/, tema e .github/workflows com os soltos; lógica TS na raiz sem pasta de código e sem aninhamento; pasta de build gitignored e gerada no GitHub; o tema é a sala de design universal sem duplicatas (extensão, TV, app, iOS, Android, desktop, tablet e os hosts de deploy); uma pasta representa uma página com todos os componentes TSX, as lógicas TS ficam fora na raiz e o tema importa da raiz; configs de mobile e desktop na raiz; a pasta de actions compartilhadas é proibida; dependabot.yml nunca dentro de workflows/; scripts de apoio sem soltos soltos na raiz; a mesclagem de equivalentes num arquivo não exclui a feature de nenhum dos dois; os metadados viram o produto final; um único Dockerfile cuida de TODO o contexto (sem compose); hierarquia ordinal com JSDoc; zero duplicação em par; arquivos 100% minúsculos sem hífen e sem underscore com as exceções canônicas; camelCase; inglês; zero emoji.
- **Hashes, containers e metadata (19-36):** NENHUM hash hardcodado (vai para os computadores do GitHub em assets e notes); actions por TAG e imagens base por tag (nunca SHA-40 nem digest); SHA256SUMS gerado no runner; builds e testes só no GitHub (o agente não gera binário nem roda bateria autoritativa); proibido na raiz .apk, .ipa, container buildado, pasta de build, node_modules, cache de linguagem e zips; dismissal de scorecard marcado como wont-fix (a tag é o contrato); vulnerabilidades da raiz com overrides; um Dockerfile com receitas no header e entrypoint em heredoc; o container principal sem sufixo de variante; tags por perfil; cache de registro mode=max com QEMU e retry no apt; versão em label OCI; união total dos manifests com a versão mais recente vencendo; pacote escoped da família em tudo; lockstep em todos os envelopes com gate no CI; engines e dependências nas últimas; bin único; envelopes únicos.
- **Versionamento, git, workflows e testes (37-60):** loop de bump até tudo verde; release automática com tag, release e publishes via workflow_run (assets com source.zip -9, web-static.zip e SHA256SUMS); 6 registros idempotentes; tag órfã e runs vermelhas se deletam; tags imutáveis; CHANGELOG maiúsculo com a linhagem fundida verbatim; commits sempre na identidade do dono (nunca o usuário genérico do runner); CLI do forje manual sem sudo; device flow com o client_id da casa, todos os escopos e token permanente; NUNCA parar aguardando autorização; NÃO re-pollar após a autorização; branch protection na main (checks, review, code-owner e histórico linear, sem force); arquivar TODOS os PRs e branches deixando só a main; clones ao lado do upload, nunca em /tmp, com push e fetch no início; gates leves pré-push; painéis 0/0/0; workflows um por responsabilidade com workflow_run e concurrency por evento; guards de tag v*; npm ci; não cancelar builds QEMU (trabalhar em paralelo); bytes verificados antes de "corrigir"; segredos nunca em if:; testes com node:test sem mocação massiva; o agente NÃO roda teste autoritativo; consumer test; gates locais só de sanidade.
- **Web universal, segurança e agente (61-80):** o tema é a interface única universal com um design; App.tsx monta sem main; a lógica do tema importa da raiz seca; deploy estático sem Functions com rewrites, 404 e .nojekyll; botões com no mínimo 56px; scrypt/PBKDF2 com cookies HttpOnly SameSite e CSP estrita; resolver TODOS os problemas de segurança antes de declarar pronto; .dockerignore coerente; .db nunca commitado; anti-hardcode; node:crypto; ler TODOS os arquivos sem exceção; subagentes em ondas com verificação; paralelismo durante esperas; falhas analisadas da mais nova à mais antiga; worklog por task; honestidade radical; /tmp limpo e zombies mortos; não tocar em repositórios de referência além do mandato; discrepância → verificação definitiva por subprocess; revisão de equivalência de cada arquivo; o resultado final é workflows verdes, painéis 0/0/0, release publicada, tudo arquivado, só a main e o worklog fechado.
- **Apêndice do manual:** o ponto de partida da análise é o commit base do repositório de virtualização até o HEAD, com o predecessor na última versão estável e a mesclagem resultante na 2.0.0; CODEOWNERS com as quatro identidades da família; cache de mesa com digest resolvido via API; worklog no caminho padrão do projeto.

### manual hierárquico h0-h17
O manual de 173 regras R+D organiza a operação em 18 grupos hierárquicos, do H0 ao H17, e consolida as 19 séries de regras do acervo.
- **H0 Fontes e precedência:** a árvore completa é o padrão fixo; a precedência é SKILL.md &gt; árvore &gt; regras &gt; transcripts &gt; logs; nada inventado (sem mockup, dado falso ou reputação fictícia); primeiro se lê tudo, depois se compreende, organiza, documenta, testa e publica; as regras dos documentos não são determinísticas — extrai-se só a determinação da arquitetura.
- **H1 Apps:** roster fixo devthink, saddle, debonair, cadria, stealhead, argan, ansi-art e getry; Doo é o único usuário hardcoded junto ao nome DevThink; apps extras se deletam com as features embutidas após verificar dependências; identidades da família iakadion, inathlan, aasblor e nasblor.
- **H2-H4 Estrutura, lógicas e tema:** raiz só com pastas de app/modo, docs, tests, forjas e soltos; flat sem pastas de categoria; pasta = página = app; docs e tests próprios; um manifesto por linguagem em lockstep; forjas espelho; actions compartilhadas proibidas; nada se apaga (sufixo, com dedup por hash mantendo o mais recente); o tema é a pasta sem "default"; o tema é a sala de design com as configs de plataforma; site = sandbox de ~50GB; lógicas .ts na raiz; a interface puxa da raiz; TS primeiro multi-modo; zero JS na interface; App.tsx self-mount; nada hardcodado; minúsculas, inglês, JSDoc, sem emoji e try/catch; só a lógica de entrada migra; TS de ponta a ponta; estado no DB; interface universal com tema e responsividade; página só design com a pasta e os componentes soltos; onboarding frame a frame pulável; wrappers só empacotam; sem public/assets/dist; texto na caixa com 44px; a CLI renderiza a mesma interface TSX; o tema se edita client-side e salva no DB com "redefinir" no lugar de "default".
- **H5-H7 Nomes, fusão e engines:** naming por raiz técnica deformada (dissolve, dolly, raccord), inglês com sonoridade primeiro, sem óbvios, validação na frase; o roster se decidiu com o tema Sol e as engines Katexis e Versawase; a fusão é tudo para dentro sem duplicar; o fundido vira página, comando ou lógica do hospedeiro; sinônimos viram um conceito (chat = agente); zero perda; dono-único por categoria (150 famílias duplicadas reduzidas a zero); a engine mora num app; a biblioteca universal leva config; conta = sandbox; o nativo simples entra como .ts comum; a verdict engine é o judge(state, questions) próprio; banda cinza com porta max; hardcode só no tema; adapters para qualquer provider.
- **H8-H10 Build, git e infra:** build, teste e hash só no CI; release por bump com tag e publishes; a mesma árvore sem Functions; subdomínio por app; Dockerfile único multi-arch com pins; sem lock-in; publicar em todos os registros; versionamento com 99 versões por casa decimal; bump até verde com 0/0/0; sem hash hardcodado; Prisma dentro do tema; commits e tags imutáveis; só a main, zero PRs; npm ci; pré-push leve; testes reais com consumer; painéis zerados; CHANGELOG por versão; biome e tsc nos arquivos de fora; dependabot de dependência com commit direto; device flow; API routes e não server actions; o padrão nos domínios com opt-in local; DB unificado nunca commitado; sites replicáveis; self-hosted com 0% de serviço pago; o usuário escolhe tudo; sandbox em 3 formas; 100% virtual; memória infinita N1/N2/N3; storage fabric de 3 tiers a custo zero; Git-as-database com AES-GCM e PBKDF2; Hidra com 33 contas de 1TB; os sites-clone fazem backup e injeção; a V1 só na sandbox Zai.
- **H11-H12 Execução e documentação:** a data primeiro; checklist com no máximo 10 itens; inline primeiro; nunca instalar; diretório atual; verificação por etapa; delegação de 0 a 300 na leitura, 0 a 100 na execução e até 300 por app, em ondas de até 1.000; leitura por segmentos com dedup; a ordem de leitura é Neo Docs → Neo Skills → Neo Getry; as fases 1 a 3, temas extras 3 a 4 e a final de IMG; não se executa durante a fase de leitura; features com mínimo de 600 e teto de 4.000 por app; # por arquivo; o documento de arquitetura é árvore; os três documentos essenciais são as regras (acima de 10 mil linhas), as features (acima de 1.000 por app) e a skill de cópia da gateway.
- **H13 Gateway V1-V5:** o meta-modelo Fusion rotaciona backends e SOMA janelas (V1 3,1M, V2 4,2M, V3 9,3M, V4 13,9M, V5 10,5M); a resposta sai mascarada como DevThink; a V1 é ZAI sem chave com 2-calls, retries com backoff e jitter, mutex e throttle; a V2 é Babel Town, pausada com fallback para a V1 (TownKey com TTL de 60 minutos); a V3 é NVIDIA com 22 chaves LRU, rotação de modelo a cada 6 mensagens, SessionStreamManager de 200 sessões com circuit breaker; a V4 é OpenCode Zen e Kilo com free anônimos, descoberta dinâmica, TTL curto e fórmula de truncamento; a V5 é unificada; as 35 rotas são 5 versões × 7 rotas, nunca duplicadas; o models/route.ts de cada versão é a fonte única; as portas seguem o padrão (app, réplica e edge com o transform por query); Prisma com os models de sessão e chave em lazy db; 12 métodos de auth; a V1 injeta os headers de token e usuário na API interna; os 6 registros com gate Trivy; vitest com 348 testes e consumer job; o E2E roda pela CLI do consumidor com arquivos cobaia; branch protection com 7 checks, dockle, zero hash hardcodado e fix via overrides; as chaves em texto plano são risco P0 e migram para o cofre.
- **H14 Extension:** a extensão MV3 consent-first é o browser agent com bridge sem tetos arbitrários; injeção programática do pagebridge (nunca content_scripts declarativo); 335 action kinds com motor de workflows (loops, branches e triggers); multi-navegador com MV3 para Chrome, xpi para Firefox, zip para Safari e VSIX (matriz 335×3); o gateway.ts único na raiz; a família bridge se compõe de servercontract, socketrelay, chatbridge, wsbridge e nativehost; build autoritativo no GitHub; 22 assets por release; Maven único; GHCR sem sha256; a raiz só com .ts e 4 pastas (build, docs, tests e tema); manifests consolidados.
- **H15 Saddle:** nunca tocar hardware físico (a única camada física são os artifacts do GitHub, o GHCR e o CDN do npm; tudo é VRAM); as bases de referência são max (EPYC de 192 núcleos, 1TiB, 8×B200), balanced (ThreadRipper de 96 núcleos, 512GiB, 2×B200) e lite (Ryzen 9 de 16 núcleos, 128GiB, RTX 5090); o catálogo de hardware entra só por Pull Request com a identidade assada por build-args; as camadas L1 RAM → L2 VRAM → L3 SQLite → L4 buckets com streaming de pesos; a sandbox é a imagem GHCR imutável contra a instância com UUID próprio (a CD de instalação contra o save game), com a tabela de arquivos de sandbox e 3 tiers de execução (browser, node principal e container); a API é self-hosted em node:http (CRUD de sandboxes, exec, shelf e resume) com mesh HMAC-SHA256 anti-replay e sem Functions; o Dockerfile de LLVM 18 com o flag de arquitetura no alvo exótico; zips se deletam, docs ficam maiúsculos, os workflows legados de deploy se substituem e o arquivo de futuro se dissolve nas regras; o Dependabot aponta para as tags de arquivo.
- **H16 Maene:** o plugin npm de autenticação do OpenCode (masquerade Google) na versão estável com 8 workflows verdes e 57 testes; 4 identidades de masquerade (Antigravity CLI, Gemini CLI, Antigravity IDE e Gemini Code Assist); OAuth 100% automático via redirect loopback (PKCE S256) com detecção de provider pelos IDs dos modelos; configure add-only idempotente com descoberta do projeto real; tradução OpenAI/Gemini → cloudcode-pa; refresh identity-aware.
- **H17 Estado na selagem:** a stack confirmada é Next 16 + React 19 + TypeScript + Tailwind 4 + shadcn/ui + Bun + Prisma/SQLite + o SDK da sandbox; o grand merge v2.0.0 fechou com as ondas de restauração sem falhas (readiness GO, suíte completa e bundles íntegros); os padrões vigentes são dono-único, envelope em lockstep com gate, bump-até-verde, 0/0/0 com fix real ou wont-fix e o padrão de 4 pastas; runtimes na base Node 26 com strip-types, Bun 1.4.x e pnpm 11; o DNS de devthink.pro resolve com wildcard; mais de 1.110.000 concorrentes self-hosted sem tocar hardware; a Explore é a loja Stripe; conta = sandbox (free 50GB; os planos pagos sobem o teto e o plano noturno roda 5.000 subagentes); os workflows carregam checkpoints em cascata (editar a mensagem abre o fluxo variante que herda o contexto); o lookup é o protótipo da loja; o catálogo de erros registra ~400 ocorrências de P0 a P3; o chat "Aura" funde as 34 variantes com o contrato chat→gateway a fechar; o domínio auxiliar de dev local existe para o loop de desenvolvimento; material sensível (chaves em texto plano, recovery codes e o dossiê de auth) nunca se publica.

## part ii — derivações estruturais (D00001-D01342)
Cada regra D instancia uma regra-mãe dos manuais para um artefato concreto da árvore fixa; a derivação não cria conceito novo, aplica o conceito existente ao arquivo que o materializa.
- **Por aplicativo (devthink 35 páginas, saddle 15, debonair 8, cadria 8, stealhead 7, argan 8, ansi-art 6, getry de console):** o app segue o TEMPLATE PADRÃO (tema-pasta + docs/ + tests/ + envelope por linguagem + lógicas .ts soltos); o tema tem nome próprio (Sol/) e nenhuma pasta default; a publicação corre em todos os registros com lockstep; cada app tem site e subdomínio próprios; build, teste e hash só nos runners; cada arquivo do template do tema existe conforme o template, com dono único = tema (index.html, App.tsx, vite.config.ts, tsconfig, devthink.toml, wrangler.toml, .dev.vars, vercel.json, netlify.toml, capacitor.config.ts, tauri.conf.json, caddyfile, mime.types, _headers, _redirects, manifests, package.json, locks, prisma.config.ts, drizzle.config.ts, ionic, tailwind .ts+.js, postcss, deno.json, playwright, vitest, biome, metadata, dotfiles, eslint, commitlint, .mjs auxiliares, prisma/schema.prisma, css único do tema, htmls auxiliares, ícones 32/64/128, robots/sitemap/humans/rss/ads/keywords, sw.ts, db.ts, api.ts, auth.ts, utils.ts, server.ts, schema.prisma, DEPLOYMENT.md).
- **cada página <Pagina>/ (regra repetida por página):** entra dentro do tema como pasta com o próprio nome em minúscula, trazendo o <Pagina>.tsx da subâncora, os componentes TSX soltos na pasta e .ts auxiliares quando precisa; importa lógicas somente da raiz do app ou da biblioteca publicada, nunca de outra página; o texto cabe na caixa com grid fixo e toque de 44px; a responsividade vem do tema com media query (portrait celular, landscape TV/desktop); zero JS (só TS/TSX/css/html, sem enum ou namespace, .ts explícito); o estado vem do DB ou env sem hardcode; onboarding e login puláveis quando a sessão vem do OS; o erro renderiza com try/catch rastreável e mensagem acionável; os estilos vivem no index.css do tema, nunca em arquivo por componente.
- **Workflows do repositório:** os workflows existem na raiz do .github, auto-contidos, cada um com a própria função (ci com matriz por app bloqueando o merge; pages com rewrites e 404; release com tag, zips por app e SHA256SUMS; security com osv, trufflehog, trivy e SBOM fechando em 0/0/0; verify com biome e tsc; maintenance com limpeza de cache apenas por schedule; buildextension com MV3 zip/xpi/vsix; codeql com timeout de 30 minutos; compatibility cobrindo node/bun/deno/esm/cjs/umd; container multi-arch com pins; desktop com Tauri; mobile 100% na nuvem; os 6 publishes; securitypolicy; targets por app; workflowlint com dependabot fora de workflows/).
- **Fusões e absorções:** para cada app absorvido (devthinkos, cli-desktop, SoFlowX, akash, extension, gateway, maene e owni embutidos no devthink; e2ugh no saddle; iukka e create no cadria; os deletados sem herdeiro com features embutidas antes da remoção): todas as features catalogadas se preservam no destino (zero perda); os metadados se convertem para o envelope do destino; os testes equivalentes migram para tests/; os docs equivalentes migram para docs/; nenhuma pasta própria sobra no repositório após a fusão.

## apêndices a-i do documento-mestre
- **A (Onde mora cada coisa):** mapa rápido de placement — dependabot e CODEOWNERS na raiz do .github; o tema é o dono do deploy; Prisma dentro do tema; lógicas na raiz do app; docs e tests por app; um envelope por registro; scripts da família em devthink/tests/scripts.
- **B (Apps do roster):** os 8 apps + os motores com uma frase de objetivo cada, conforme a tabela de roster da arquitetura oficial (devthink OS e superplataforma; saddle virtualização; debonair áudio; cadria vídeo e imagem; stealhead FPS; argan DNS; ansi-art arte ANSI; getry inferência).
- **C (Providers e credenciais):** V1 Zai (sandbox, sem chave), V2 Babel (chave própria, pausada com fallback), V3 NVIDIA (22 chaves com rotação LRU), V4 OpenCode+Kilo (anônimo), V5 unificada/OpenRouter; credenciais no vault AES-256-GCM, nunca no código.
- **D (Perfis):** max (vGPU 1×, 8 vCPU, 16GB, frota completa), balanced (0.5×, 4 vCPU, 8GB, default humano), lite (sem vGPU, 2 vCPU, 2GB, Node local); o perfil se grava no DB da conta.
- **E (Banda cinza e porta max):** de 0.30 a 0.70 o sistema nunca age; acima de 0.85 a porta max bloqueia incondicionalmente; os parâmetros se versionam por produto no DB.
- **F (Versões da gateway):** V1 passthrough → V2 normalize → V3 júri → V4 cascade+guard → V5 verdict model; 7 rotas internas por versão (35 rotas no total); a V1 só funciona dentro da sandbox da Z.AI e o bypass Next cobre o lado de fora.
- **G (Motores):** Saddle (virtualização, no saddle), Versawase (3D/jogo/imagem/vídeo, no cadria), Katexis (áudio, no debonair) e Argan (DNS/gateway, no argan), cada um hospedado no seu app e importado pela biblioteca publicada.
- **H (Glossário):** o glossário canônico da operação vive na seção de arquitetura oficial (tabela Glossário mestre) e não se duplica em apêndice; termo novo entra lá, com significado exato e sem sinônimo concorrente.
- **I (Anti-padrões):** as ban lists de estrutura, leiaute, robótico, tells de IA, copy, processo e mídia, mais os ~60 pares de conflito e as proibições de código, vivem na seção de design fundação da arquitetura oficial; o apêndice apenas remete, para manter um conceito = uma regra no lugar certo.

# template padrão (vale para todo projeto)

o template cobre cinco formatos: a casa (site e casa) e as quatro formas next (next normal, next zai, next fifty e next personalized). `<nome>` é o app em minúsculas, `<Nome>` é a inicial maiúscula, e Sol/ é o tema — qualquer nome de tema vale, e não existe pasta "default". a âncora global App.tsx fica DENTRO da pasta do primeiro tema, ao lado do index.css e do index.html. a raiz do aplicativo carrega só as lógicas .ts soltas, os configs soltos, docs/ e tests/. total por app: ~92 soltos na raiz + blocos condicionais (10 de sandbox/VM + 6 de desktop nativo, mutuamente exclusivos) + 1 web completo por tema.

## formato 1 — site e casa (o template da casa)

```
├── <nome>/ # app da família — estrutura idêntica em todos
│
│   ├── Sol/  # o tema é a pasta — o nome é próprio; App.tsx, index.css, cópias de deploy e páginas DENTRO
│
│   │   ├── App.tsx  # âncora global — router: importa as subâncoras das páginas (DENTRO do tema, ao lado do index.css)
│
│   │   ├── index.css  # único CSS do tema — o nome é personalizável (index.css, sol.css ou o nome do tema)
│
│   │   ├── index.html  # entrada web
│
│   │   ├── icons.ts  # catálogo de ícones do tema
│
│   │   ├── control.shell.tsx  # shell compartilhado — solto na raiz do tema
│
│   │   ├── package.json  # envelope privado do tema
│
│   │   ├── pnpm-lock.yaml  # lock pnpm do tema
│
│   │   ├── pnpm-workspace.yaml  # workspace pnpm do tema
│
│   │   ├── tsconfig.json  # TS do tema
│
│   │   ├── tsconfig.node.json  # TS node do tema
│
│   │   ├── vite.config.ts  # build web
│
│   │   ├── devthink.toml  # config da plataforma (rotas de domínio, bindings, vars não-secretas)
│
│   │   ├── wrangler.toml  # config Cloudflare/Workers equivalente (deploy, bindings, rotas de domínio)
│
│   │   ├── .dev.vars.example  # exemplo dos segredos locais do wrangler dev — o .dev.vars real nunca commita
│
│   │   ├── vercel.json  # cópia de deploy Vercel
│
│   │   ├── netlify.toml  # cópia de deploy Netlify
│
│   │   ├── _headers  # cabeçalhos
│
│   │   ├── _redirects  # redirecionamentos
│
│   │   ├── caddyfile  # servidor Caddy
│
│   │   ├── mime.types  # tipos MIME
│
│   │   ├── capacitor.config.ts  # cópia de deploy mobile
│
│   │   ├── tauri.conf.json  # cópia de deploy desktop
│
│   │   ├── manifest.json  # manifesto PWA
│
│   │   ├── manifest.webmanifest  # manifesto web
│
│   │   ├── sitemanifest.json  # mapa do site
│
│   │   ├── icon.svg  # ícone
│
│   │   ├── favicon.ico  # favorito
│
│   │   ├── favicon.svg  # favorito
│
│   │   ├── icon32.png  # ícone 32
│
│   │   ├── icon64.png  # ícone 64
│
│   │   ├── icon128.png  # ícone 128
│
│   │   ├── design.html  # vitrine
│
│   │   ├── robots.txt  # robôs
│
│   │   ├── sitemap.xml  # mapa
│
│   │   ├── sw.ts  # service worker
│
│   │   ├── prisma/
│
│   │   │   └── schema.prisma  # schema do banco (Prisma vive dentro do tema)
│
│   │   └── <pagina>/  # página = pasta = app
│
│   │       ├── <Pagina>.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │       ├── <Componente>.tsx  # componente solto
│
│   │       └── <auxiliar>.ts  # .ts auxiliar
│
│   ├── docs/  # documentação do app (referencia, não copia)
│
│   ├── tests/  # testes do app
│
│   │   └── scripts/  # scripts do app (TypeScript; não-JS em tests/scripts)
│
│   │       ├── task.ts  # tarefas da operação
│
│   │       └── release.ts  # ciclo de release
│
│   ├── package.json  # envelope do app
│
│   ├── bun.lock  # lock Bun
│
│   ├── tsconfig.json  # TS (mescla app+build+server)
│
│   ├── biome.json  # lint/format
│
│   ├── deno.json  # deno
│
│   ├── vitest.config.ts  # testes
│
│   ├── prisma.config.ts  # config do banco
│
│   ├── Dockerfile  # container único (todo o contexto, entrypoint em heredoc)
│
│   ├── .dockerignore  # ignora docker
│
│   ├── .env.example  # exemplo de ambiente
│
│   ├── .gitattributes  # atributos git
│
│   ├── .gitignore  # ignorados
│
│   ├── .npmrc  # registry
│
│   ├── .nvmrc  # versão do node
│
│   ├── pom.xml  # envelope Maven
│
│   ├── settings.xml  # settings Maven
│
│   ├── <nome>.csproj  # envelope NuGet
│
│   ├── <nome>.gemspec  # envelope RubyGems
│
│   ├── <Nome>.java  # núcleo Java
│
│   ├── <Nome>Distribution.cs  # distribuição .NET
│
│   ├── LICENSE  # licença
│
│   ├── README.md  # apresentação
│
│   ├── ARCHITECTURE.md  # arquitetura
│
│   ├── CHANGELOG.md  # novidades por versão (vira release notes)
│
│   ├── SECURITY.md  # segurança e disclosure
│
│   ├── CODEOWNERS  # donos do repo
│
│   ├── CONTRIBUTING.md  # como contribuir
│
│   ├── code-of-conduct.md  # conduta
│
│   ├── third-party-notices.md  # notices de terceiros
│
│   ├── <logica1>.ts  # lógica solta
│
│   └── <logica2>.ts  # lógica solta
│
```

o tema seguinte (Lua/, Terra/, Mar/) repete a estrutura completa de Sol/, e só carrega as pastas de página com os componentes delas, adaptados ao tema. o bloco condicional de sandbox/VM (10 arquivos: boards.json, cores.json, gpus.json, processors.json, virtualhardware.json, qemu.config, gpumonitor.cpp, virtualhardware.c, virtualizationcore.cpp e qemubridge.py) entra só em projetos de virtualização. o bloco condicional de desktop nativo (6 arquivos: Cargo.toml, Cargo.lock, build.rs, main.rs, gen-icons.py e main.js) entra só em projetos Rust, e os dois blocos são mutuamente exclusivos.

## formato 2 — next normal (sem bloqueio de pastas)

o next normal é o template padrão do next do mercado, sem bloqueio de pastas: public, dist, assets e deploy podem existir, e os defaults do next respondem qualquer plataforma. a pasta de build vai para onde o distDir configurar quando o destino exigir. os ícones moram na pasta public nesta forma.

```
├── <nome>/
│
│   ├── src/
│
│   │   ├── app/  # roteamento do next — as rotas ficam dentro de src/
│
│   │   │   ├── layout.tsx  # layout raiz
│
│   │   │   ├── page.tsx  # entrada da rota
│
│   │   │   ├── globals.css  # único CSS (importado uma vez)
│
│   │   │   └── <rota>/  # rotas seguintes seguem o mesmo padrão
│
│   │   ├── db.ts  # lógicas de apoio do next (dentro de src/ quando a plataforma exige)
│
│   │   └── <modulo>.ts  # módulos de apoio
│
│   ├── public/  # permitida nesta forma — os ícones moram aqui
│
│   │   ├── icon.svg  # ícone
│
│   │   ├── favicon.ico  # favorito
│
│   │   ├── favicon.svg  # favorito
│
│   │   ├── icon32.png  # ícone 32
│
│   │   ├── icon64.png  # ícone 64
│
│   │   └── icon128.png  # ícone 128
│
│   ├── dist/  # permitida — a pasta de build vai para onde o distDir configurar
│
│   ├── assets/  # permitida
│
│   ├── deploy/  # permitida
│
│   ├── package.json  # envelope (next, react, prisma em lockstep)
│
│   ├── next.config.ts  # defaults do next — respondem qualquer plataforma
│
│   ├── .npmrc  # registry
│
│   ├── .nvmrc  # versão do node
│
│   ├── biome.json  # lint/format
│
│   ├── tsconfig.json
│
│   ├── vercel.json  # cópia de deploy Vercel
│
│   ├── netlify.toml  # cópia de deploy Netlify
│
│   ├── wrangler.toml  # config Cloudflare/Workers
│
│   ├── .dev.vars.example  # exemplo dos segredos locais do wrangler dev
│
│   ├── manifest.json  # manifesto PWA
│
│   ├── robots.txt  # robôs
│
│   ├── bun.lock
│
│   ├── prisma/  # prisma na pasta do app (nunca solto na raiz)
│
│   │   └── schema.prisma
│
│   ├── docs/  # docs do app
│
│   ├── tests/  # testes do app
│
│   │   └── scripts/  # scripts do app
│
│   ├── Dockerfile  # container único
│
│   └── <logica>.ts  # lógicas .ts soltas na raiz
│
│
│
└── (sem bloqueio de pastas: public, dist, assets e deploy permitidas — os defaults do next respondem qualquer plataforma)
│
```

## formato 3 — next zai (o template da plataforma, com a skill do gateway)

o next zai é o template padrão que a plataforma do Z.AI aceita. a forma é a mesma do next com src/, e a diferença está no carregamento: a skill do gateway entra em skills/gateway/SKILL.md, o schema do prisma entra em prisma/schema.prisma e o mapa de deploy entra no DEPLOY.md. a pasta public segue permitida nesta forma, e os ícones moram nela.

```
├── <nome>/
│
│   ├── src/
│
│   │   ├── app/  # roteamento do next — as rotas ficam dentro de src/
│
│   │   │   ├── layout.tsx  # layout raiz
│
│   │   │   ├── page.tsx  # entrada da rota
│
│   │   │   └── globals.css  # único CSS (importado uma vez)
│
│   │   └── db.ts  # lógicas de apoio do next
│
│   ├── skills/  # skills embarcadas no projeto
│
│   │   └── gateway/  # a pasta da skill que a plataforma executa em modo agente
│
│   │       └── SKILL.md  # a skill do gateway — regras e passos da publicação
│
│   ├── public/  # permitida nesta forma — os ícones moram aqui
│
│   │   ├── icon.svg  # ícone
│
│   │   ├── favicon.ico  # favorito
│
│   │   ├── favicon.svg  # favorito
│
│   │   ├── icon32.png  # ícone 32
│
│   │   ├── icon64.png  # ícone 64
│
│   │   └── icon128.png  # ícone 128
│
│   ├── prisma/  # prisma na pasta do app (nunca solto na raiz)
│
│   │   └── schema.prisma  # schema do banco exigido pela plataforma
│
│   ├── DEPLOY.md  # mapa de deploy — como cada destino recebe o app
│
│   ├── package.json  # envelope (next, react, prisma em lockstep)
│
│   ├── next.config.ts  # o template que a plataforma aceita
│
│   ├── .npmrc  # registry
│
│   ├── .nvmrc  # versão do node
│
│   ├── biome.json  # lint/format
│
│   ├── tsconfig.json
│
│   ├── vercel.json  # cópia de deploy Vercel
│
│   ├── netlify.toml  # cópia de deploy Netlify
│
│   ├── wrangler.toml  # config Cloudflare/Workers
│
│   ├── .dev.vars.example  # exemplo dos segredos locais do wrangler dev
│
│   ├── manifest.json  # manifesto PWA
│
│   ├── robots.txt  # robôs
│
│   ├── bun.lock
│
│   ├── docs/  # docs do app
│
│   ├── tests/  # testes do app
│
│   │   └── scripts/  # scripts do app
│
│   ├── Dockerfile  # container único
│
│   └── <logica>.ts  # lógicas .ts soltas na raiz
│
│
│
└── (o template que a plataforma do Z.AI aceita: skill do gateway, schema do prisma e mapa de deploy carregados)
│
```

## formato 4 — next fifty (bloqueio de pastas)

o next fifty é a mesma forma padrão do next, mas com as pastas proibidas bloqueadas: não existe public, dist, assets, build nem deploy. o deploy lê a raiz: netlify.toml, wrangler.toml e os demais configs ficam na raiz do projeto. os ícones sobem para a raiz nesta forma.

```
├── <nome>/
│
│   ├── src/
│
│   │   ├── app/  # roteamento do next — as rotas ficam dentro de src/
│
│   │   │   ├── layout.tsx  # layout raiz
│
│   │   │   ├── page.tsx  # entrada da rota
│
│   │   │   ├── globals.css  # único CSS (importado uma vez)
│
│   │   │   └── <rota>/  # rotas seguintes seguem o mesmo padrão
│
│   │   ├── db.ts  # lógicas de apoio do next (dentro de src/ quando a plataforma exige)
│
│   │   └── <modulo>.ts  # módulos de apoio
│
│   ├── icon.svg  # ícone na raiz — sem public nesta forma
│
│   ├── favicon.ico  # favorito na raiz
│
│   ├── favicon.svg  # favorito na raiz
│
│   ├── icon32.png  # ícone 32 na raiz
│
│   ├── icon64.png  # ícone 64 na raiz
│
│   ├── icon128.png  # ícone 128 na raiz
│
│   ├── package.json  # envelope (next, react, prisma em lockstep)
│
│   ├── next.config.ts  # distDir configurado — sem public, dist, assets, build e deploy
│
│   ├── .npmrc  # registry
│
│   ├── .nvmrc  # versão do node
│
│   ├── biome.json  # lint/format
│
│   ├── tsconfig.json
│
│   ├── vercel.json  # cópia de deploy Vercel — lida na raiz
│
│   ├── netlify.toml  # cópia de deploy Netlify — lida na raiz
│
│   ├── wrangler.toml  # config Cloudflare/Workers — lida na raiz
│
│   ├── .dev.vars.example  # exemplo dos segredos locais do wrangler dev
│
│   ├── manifest.json  # manifesto PWA
│
│   ├── robots.txt  # robôs
│
│   ├── bun.lock
│
│   ├── prisma/  # prisma na pasta do app (nunca solto na raiz)
│
│   │   └── schema.prisma
│
│   ├── docs/  # docs do app
│
│   ├── tests/  # testes do app
│
│   │   └── scripts/  # scripts do app
│
│   ├── Dockerfile  # container único
│
│   └── <logica>.ts  # lógicas .ts soltas na raiz
│
│
│
└── (bloqueio total: sem public, sem dist, sem assets, sem build e sem deploy — o deploy lê a raiz)
│
```

## formato 5 — next personalized (sem src, igual à casa, com a ponte app/)

o next personalized (next.personalizado) é igual ao template da casa: o que fica fora do tema são só as lógicas em TS, e dentro do tema entram o index.html, o index.css, o App.tsx, as páginas e os componentes. a única diferença é a ponte app/ na raiz do projeto, com as rotas do next. a forma é bloqueada: os ícones e o conjunto de arquivos de plataforma ficam na raiz, sem public, dist, assets, build nem deploy.

```
├── <nome>/
│
│   ├── app/  # ponte do next na raiz — só as rotas
│
│   │   ├── layout.tsx  # layout raiz
│
│   │   ├── page.tsx  # entrada da rota
│
│   │   └── <rota>/  # rotas seguintes seguem o mesmo padrão
│
│   ├── Sol/  # tema IGUAL ao formato 1 (App.tsx dentro, index.css, index.html, cópias de deploy, páginas)
│
│   ├── icon.svg  # ícone na raiz — forma bloqueada
│
│   ├── favicon.ico  # favorito na raiz
│
│   ├── favicon.svg  # favorito na raiz
│
│   ├── icon32.png  # ícone 32 na raiz
│
│   ├── icon64.png  # ícone 64 na raiz
│
│   ├── icon128.png  # ícone 128 na raiz
│
│   ├── .npmrc  # registry
│
│   ├── .nvmrc  # versão do node
│
│   ├── biome.json  # lint/format
│
│   ├── tsconfig.json
│
│   ├── vercel.json  # cópia de deploy Vercel
│
│   ├── netlify.toml  # cópia de deploy Netlify
│
│   ├── wrangler.toml  # config Cloudflare/Workers
│
│   ├── .dev.vars.example  # exemplo dos segredos locais do wrangler dev
│
│   ├── manifest.json  # manifesto PWA
│
│   ├── robots.txt  # robôs
│
│   ├── package.json
│
│   ├── next.config.ts  # distDir configurado
│
│   ├── bun.lock
│
│   ├── <logica>.ts  # lógicas .ts soltas na raiz, igual à casa
│
│   └── (sem src/ — a ponte app/ na raiz substitui o src/)
│
│
│
└── (estrutura da casa preservada: o tema manda, e o app/ só pontua as rotas)
│
```

## regras que valem para as quatro formas next

todas as quatro formas carregam na raiz o mesmo conjunto de arquivos de plataforma: .npmrc, .nvmrc, biome.json, tsconfig.json, vercel.json, netlify.toml, wrangler.toml, .dev.vars.example, manifest.json e robots.txt. os ícones seguem a regra do bloqueio: a pasta public só existe no next normal e no next zai, e nas formas bloqueadas (next fifty e next personalized) os ícones ficam na raiz. as quatro formas existem só como assets do release (tar.xz no nível máximo do xz com o overlay brotli por cima), nunca como pastas no repositório. a ordem de uso que a skill do gateway ensina: primeiro o next personalized, depois o next zai, depois o next fifty, depois o next normal.

## resumo dos cinco formatos

| formato | src | tema | lógicas | diferença |
|---|---|---|---|---|
| 1. site e casa | não | Sol/ com o App.tsx dentro | .ts soltos na raiz do app | o formato de todos os apps da família |
| 2. next normal | sim (app/ dentro de src/) | as rotas e o CSS seguem o next | lógicas de apoio dentro de src/ quando a plataforma exige | sem bloqueio: public, dist, assets e deploy permitidas |
| 3. next zai | sim (app/ dentro de src/) | as rotas e o CSS seguem o next | skill do gateway, schema do prisma e mapa de deploy carregados | o template que a plataforma do Z.AI aceita |
| 4. next fifty | sim (app/ dentro de src/) | as rotas e o CSS seguem o next | lógicas de apoio dentro de src/ quando a plataforma exige | bloqueio total: sem public, dist, assets, build e deploy; o deploy lê a raiz |
| 5. next personalized | não (ponte app/ na raiz) | igual à casa | .ts soltos na raiz, igual à casa | só a ponte app/ na raiz; ícones e arquivos de plataforma na raiz |

# componentes oficiais por página — tema devthink (as 35 páginas nativas + âncoras extras)

> regra: a âncora geral App.tsx (dentro da pasta do primeiro tema) importa a subâncora <Pagina>/<Pagina>.tsx; a pasta da página guarda os componentes soltos que a subâncora referencia. caixas e modais são componentes dentro da pasta (pop-ups flutuantes). as interações detalhadas vivem no catálogo de telas; aqui é só a lista. componente novo só nasce a partir de botão mapeado no catálogo ou de skill adotada.

## compartilhados (shell — soltos na raiz do tema Sol/)
`ThemeSwitch.tsx` # troca tema · `CommandPalette.tsx` # Ctrl+K · `BellMenu.tsx` # sininho · `TranslateMenu.tsx` # Globe EN⇄PT · `AvatarMenu.tsx` # perfil · `SidebarRail.tsx` # rail de navegação · `TopPillBar.tsx` # barra-pílula flutuante · `GlassCard.tsx` # vidro · `Badge.tsx` # estado/plano · `Button.tsx` # 6 variantes · `Input.tsx` # glow no focus · `CompactInput.tsx` # denso com ícone · `Select.tsx` # dropdown custom · `Switch.tsx` # toggle pill · `TabsPills.tsx` # tabs pílula · `Modal.tsx` # janela→fullscreen · `Drawer.tsx` # lateral · `ConfirmBox.tsx` # confirm vermelho · `Toast.tsx` # inline · `Banner.tsx` # bannerzão Windows Store · `DockApps.tsx` # dock de apps (AI Studio) · `EmptyState.tsx` # vazio · `LevelCard.tsx` # nível/balance (Trylle) · `AccessRequestBox.tsx` # permissões de app (AI Studio/Vercel)

## páginas nativas do devthink (as 35)

### onboarding/ — `Onboarding.tsx` # boas-vindas
`IntroSplash.tsx` # splash desliza pra cima · `WelcomeHero.tsx` # título+spark · `StepTimeline.tsx` # 3 passos · `CreateFirstBox.tsx` # primeiro projeto · `LanguagePick.tsx` # EN/PT · `ThemePick.tsx` # tema · `AccountLink.tsx` # GitHub/GitLab/Google/DevThink · `FinishCard.tsx` # CTA

### login/ — `Login.tsx` # acesso
`LoginCard.tsx` # expande fullscreen ao focar · `Slideshow.tsx` # 3 imgs 6s · `EmailInput.tsx` · `PasswordInput.tsx` · `KeepLogged.tsx` · `ForgotLink.tsx` · `SignInButton.tsx` # loading→entrar · `OAuthRow.tsx` # divisor · `GoogleButton.tsx` · `GitHubButton.tsx` · `GitLabButton.tsx` · `DevThinkButton.tsx` # banco próprio · `CallbackHandler.tsx` # /callback único via state · `TermsNote.tsx`

### news/ — `News.tsx` # notícias
`NewsHero.tsx` # destaque · `NewsList.tsx` · `NewsCard.tsx` · `CategoryPills.tsx` · `ChangelogFeed.tsx` # releases · `NewsReader.tsx` # flutuante · `SubscribeBox.tsx`

### home/ — `Home.tsx` # início
`WelcomeBack.tsx` · `ModeBanners.tsx` # Compilar/Criar carrossel · `StatTrio.tsx` # 3 stats · `CreateNewCards.tsx` # Vídeo/Áudio/3D/Código · `RecentProjects.tsx` · `AgentComposer.tsx` # "Work with an AI agent" · `PromptStarters.tsx` · `DataChips.tsx` # Drive/Sheets ok · `ActivityFeed.tsx` # All/Production/Previews/Agent runs · `QuickActionsRow.tsx` # 4 atalhos · `UsageOverview.tsx` # mini gráfico

### projects/ — `Projects.tsx` # projetos
`ProjectGrid.tsx` # 1/2/3 colunas · `ProjectCard.tsx` # hover Open Editor · `ProjectThumb.tsx` · `StatusBadge.tsx` · `GearButton.tsx` # →Settings · `SearchProjects.tsx` · `FilterRow.tsx` · `SortMenu.tsx` ▾ · `ViewToggle.tsx` · `AddProjectButton.tsx` · `CreateProjectWizard.tsx` # "Initialize Project" · `IdentityStep.tsx` · `InfraStep.tsx` # Managed/Connect/Later · `DnsRows.tsx` · `ProviderGrid.tsx` # 10 provedores · `UploadDropzone.tsx` · `LaunchButton.tsx` # 4 etapas · `UploadConfirmBox.tsx` # Repo/Key/Files · `EmptyProjects.tsx`

### playground/ — `Playground.tsx` # testes de modelo
`TypeTabs.tsx` # LLM|Multimodal|Workflow · `ModelPicker.tsx` ▾ · `ModelDetailsLink.tsx` ↗ · `ParamsPanel.tsx` # sliders Temperature/TopK/TopP · `StreamToggle.tsx` · `SystemPromptBox.tsx` · `ChatCanvas.tsx` · `ChatComposer.tsx` · `SendButton.tsx` · `HistoryList.tsx`

### console/ — `Console.tsx` # console técnico
`WorldToggle.tsx` # Inference↔Compute · `ConsoleRail.tsx` # grupos · `CreditChips.tsx` # $0+relâmpago · `BonusBanner.tsx` # Claim now · `UsageByModel.tsx` # janelas 24h… · `BillingLink.tsx`

### gatewayview/ — `Gatewayview.tsx` # gateway/getry
`RouterTester.tsx` # 3 steps · `TaskChips.tsx` # Coding/Agent/RAG/Math · `ModeSlider.tsx` # Cost—Balanced—Quality · `RecommendPanel.tsx` # positivo/custo · `RoutingSettings.tsx` # allowed pool · `LeaderboardTable.tsx` · `ApiKeyBox.tsx` · `CurlExample.tsx`

### connectors/ — `Connectors.tsx` # conectores/MCP
`ConnectorTabs.tsx` · `ConnectorCard.tsx` # ok/+ · `ConnectorDetailModal.tsx` # Experimente+Gerenciar+4 prompts (Manus) · `McpCustomForm.tsx` # URL MCP · `ConsentBox.tsx` # consent-box (Grok) · `PermissionToggles.tsx` # read/write (Vercel) · `InstalledList.tsx` · `StoreGrid.tsx` # Populares (ChatGPT) · `AddConnectorButton.tsx`

### automations/ — `Automations.tsx` # automações
`AutoTabs.tsx` # Automações|Execuções · `NewAutomationButton.tsx` · `CategorySections.tsx` · `AutomationCard.tsx` # +[Adicionar] · `ScheduleEditor.tsx` # cron · `RunsTable.tsx` · `RecomendadoMenu.tsx` ▾ (ChatGPT)

### deploy/ — `Deploy.tsx` # deploy
`DomainPanel.tsx` # domínios · `DnsRecordTable.tsx` # A/AAAA/CNAME/MX/TXT/NS · `PropagateButton.tsx` · `GitProviders.tsx` # GitHub/GitLab/Cursor Origin/Bitbucket/Azure · `DropDeploy.tsx` # pasta/zip · `DeploySettings.tsx` # auto publishing · `LockPublishing.tsx` · `TriggerDeployMenu.tsx` ▾ · `DeployTimeline.tsx` # main@hash Published · `BuildLogViewer.tsx` · `LighthouseCard.tsx` # score · `ReleaseAssets.tsx` # assets por app

### security/ — `Security.tsx` # segurança
`SecurityRail.tsx` · `AgentReadiness.tsx` # gauge+Share of Voice (CF) · `CrawlControl.tsx` # crawlers IA por bot · `MarkdownForAgents.tsx` · `ScanCenter.tsx` # Page Shield · `BotFight.tsx` · `AuditLog.tsx` · `TwoFactorBox.tsx` · `ApiTokens.tsx` · `AskAiDrawer.tsx` # agente assistente (CF)

### settings/ — `Settings.tsx` # ajustes (PÁGINA, não modal)
`SettingsRail.tsx` # grupos (Vercel 15) · `ProfileBox.tsx` # nome/url/avatar 32-48 chars · `AppearanceTab.tsx` · `LanguageTab.tsx` · `NotificationsTab.tsx` · `DataTab.tsx` # export/apagar · `WebhooksTab.tsx` # endpoint+segredo · `McpTab.tsx` # MCP próprio · `SessionsTab.tsx` # dispositivos · `DangerZone.tsx` # vermelho+confirm

### usage/ — `Usage.tsx` # uso
`UsageSubRail.tsx` # Networking/ISR/DataCache/Builds (Vercel) · `MetricTable.tsx` # radio-rows+limites · `UsageChart.tsx` # por janela · `PlanCompare.tsx` # Free/Pro/Enterprise · `CreditsBox.tsx` # bônus survey (GMI)

### providers/ — `Providers.tsx` # provedores de IA
`ProviderTabs.tsx` · `ModelHub.tsx` # badge HOT (GMI) · `ModelCard.tsx` # preço/contexto/… · `FineTunePanel.tsx` · `MyModels.tsx` · `DeploymentList.tsx` · `LeaderboardLink.tsx`

### files/ — `Files.tsx` # arquivos
`FileToolbar.tsx` # funil+grade/lista+busca (ChatGPT Bibl.) · `UploadButton.tsx` # "carregar arquivo" · `FileGrid.tsx` # masonry preview · `FileCard.tsx` # tamanho+"2d atrás" · `FolderTree.tsx` # expansível (Akash) · `FileViewer.tsx` # painel direito

### gallery/ — `Gallery.tsx` # galeria
`GalleryTabs.tsx` # Sugeridos|Favoritos|Pastas|Imagens|Tudo · `MediaTable.tsx` # Nome/Última atividade · `ThumbCell.tsx` · `LightboxModal.tsx` · `BulkActions.tsx`

### browser/ — `Browser.tsx` # navegador DevThink
`TabStrip.tsx` # abas redondas (Brave) · `AddressPill.tsx` · `SidebarPanel.tsx` # extensões · `SplitView.tsx` · `ShieldsPopover.tsx` · `HistoryPage.tsx` · `BookmarkBar.tsx`

### terminal/ — `Terminal.tsx` # terminal
`TermTabs.tsx` · `SandboxPicker.tsx` # SO+região (Trylle) · `TermCanvas.tsx` · `CliInstallCard.tsx` # npm|pnpm|Bun `devthink-cli` · `CliKeyBox.tsx`

### notes/ — `Notes.tsx` # notas
`NoteList.tsx` · `NoteEditor.tsx` · `TagsRow.tsx` · `AiWriteBox.tsx` · `ShareModal.tsx`

### docs/ — `Docs.tsx` # documentos
`DocsSidebar.tsx` # Introduction/Architecture/API/CLI · `DocBody.tsx` · `CodeBlock.tsx` # copiável · `SearchDocs.tsx`

### data/ — `Data.tsx` # dados
`StoreTable.tsx` # Browse data (Vercel Storage) · `CreateStorageBox.tsx` · `SchemaViewer.tsx` # prisma/drizzle · `BackupsPanel.tsx` · `LfsPanel.tsx` # LFS/blobs/objects

### store/ — `Store.tsx` # loja de apps
`StoreBanners.tsx` # carrossel (Windows Store) · `StoreCategories.tsx` # Recommended/Code&Dev… (GMI) · `AppCard.tsx` # publisher ok+chips · `VerifiedOnly.tsx` · `AgentRegistrationButton.tsx` # publicar agente · `InstallAppModal.tsx` # Access request+Apply

### mail/ — `Mail.tsx` # e-mail
`MailRail.tsx` # Inbox/Sent/… · `MailList.tsx` · `MailReader.tsx` · `ComposeWindow.tsx` # pop-up flutuante

### calendar/ — `Calendar.tsx` # calendário
`MonthGrid.tsx` · `EventPopover.tsx` # caixa do evento · `AgendaList.tsx` # "Agende uma tarefa" (ChatGPT) · `ReminderToggle.tsx`

### calculator/ — `Calculator.tsx` # calculadora
`CalcDisplay.tsx` # expressão+resultado · `CalcPad.tsx` # teclado numérico · `ModeTabs.tsx` # padrão|científica|programador · `HistoryList.tsx` # histórico copiável · `UnitConverter.tsx` # conversor de unidades

### maps/ — `Maps.tsx` # mapas
`MapCanvas.tsx` # tiles WebGL · `SearchPlaces.tsx` # busca de lugares · `RoutePanel.tsx` # origem→destino · `LayerChips.tsx` # trânsito/relevo/satélite · `PlaceCard.tsx` # ficha do lugar

### audio/ — `Audio.tsx` # áudio
`AudioProjects.tsx` · `WaveformCard.tsx` · `VoicePicker.tsx` · `GenerateAudioBox.tsx` # prompt→áudio

### video/ — `Video.tsx` # vídeo (contexto Cadria)
`VideoProjects.tsx` · `NewVideoCard.tsx` # start from scratch (AI Studio) · `RenderQueue.tsx` · `AspectChips.tsx` # 16:9/9:16/2:3 (Grok)

### image/ — `Image.tsx` # imagem
`ImagineComposer.tsx` # "Digite para imaginar"+chips (Grok) · `PresetGrid.tsx` # Sketch/Figurinhas… (ChatGPT) · `StyleChip.tsx` · `ResultMasonry.tsx`

### music/ — `Music.tsx` # música
`TrackList.tsx` · `PlayerDock.tsx` # dock fixo · `PromptToSongBox.tsx` · `LibraryTabs.tsx`

### camera/ — `Camera.tsx` # câmera
`CamPreview.tsx` · `PermissionPill.tsx` # ON/OFF (Access request) · `ShotButton.tsx` · `RollGrid.tsx`

### recorder/ — `Recorder.tsx` # gravador
`RecPanel.tsx` # Ready to go live? (Akash) · `ViewerStats.tsx` # viewers/past/subs · `MicLevel.tsx` · `RecSource.tsx` # tela/aba/janela

### photoeditor/ — `PhotoEditor.tsx` # editor de fotos
`CanvasStage.tsx` · `ToolRail.tsx` # esquerda · `LayersPanel.tsx` # direita · `AiEditBar.tsx` # Text/Precise/Reimagine (Grok) · `ExportBox.tsx`

### videoeditor/ — `VideoEditor.tsx` # editor de vídeos (Cadria)
`TimelineTracks.tsx` # trilhas drag-drop · `ClipItem.tsx` # dnd-kit (Akash Design) · `PreviewMonitor.tsx` # device switcher · `EffectsLibrary.tsx` # sidebar→timeline · `AiCutBox.tsx` # gerar via IA · `PublishBar.tsx` # Preview/Publish

### notfound/ — `Notfound.tsx` # 404
`NotFoundArt.tsx` · `BackHomeButton.tsx`

## âncoras extras (além das 35 — completam as ~60 âncoras do shell)

### sandboxes/ — `Sandboxes.tsx` # criação IA
`SandboxGrid.tsx` # cards por perfil · `NewSandboxWizard.tsx` # SO+arch+perfil+GPU · `SandboxCard.tsx` # status+ações · `ResourceSlider.tsx` # vCPU/RAM/vGPU · `ConsolePeek.tsx` # preview do terminal

### agents/ — `Agents.tsx` # criação IA
`AgentCard.tsx` # nome+modelo+tools · `NewAgentButton.tsx` · `ToolPicker.tsx` # MCP read/write/network/admin · `SwarmView.tsx` # malha de subagentes · `AgentLog.tsx` # execução ao vivo

### compose/ — `Compose.tsx` # criação IA
`PromptCanvas.tsx` # composição multimodal · `AssetRail.tsx` # mídia do projeto · `ModelSelector.tsx` # rota da gateway · `GenerateButton.tsx` # fila+progresso · `ResultDrawer.tsx` # resultados

### editorhome/ — `EditorHome.tsx` # Editor Akash
`SiteCard.tsx` # site do usuário · `NewSiteCard.tsx` # criar/importar · `TemplateStrip.tsx` # templates · `RecentEdits.tsx` # retomar · `PublishStateBadge.tsx` # rascunho|publicado

### sitepages/ — `SitePages.tsx` # Editor Akash
`PageList.tsx` # páginas do site · `AddPageButton.tsx` · `PageRow.tsx` # rota+título+status · `PageOrder.tsx` # drag para ordenar · `PageSettingsMenu.tsx` ▾

### sitefiles/ — `SiteFiles.tsx` # Editor Akash
`FileTree.tsx` # árvore do site · `FileEditor.tsx` # editor de arquivo · `UploadZone.tsx` # solta arquivos · `BinaryBadge.tsx` # tipo por magic bytes · `DeleteConfirm.tsx`

### design(dnd)/ — `Design.tsx` # Editor Akash (dnd)
`DropCanvas.tsx` # superfície de montagem · `PalettePanel.tsx` # componentes arrastáveis · `SelectionBox.tsx` # manipuladores · `LayerStack.tsx` # ordem de camadas · `PropsInspector.tsx` # props do nó

### components(+geminichat)/ — `Components.tsx` # Editor Akash
`ComponentLibrary.tsx` # catálogo instalável · `InstallComponentButton.tsx` # publica/instala · `GeminiChatPanel.tsx` # chat lateral de edição · `VariantSwatch.tsx` # variantes · `UsageBadge.tsx` # páginas que usam

### content/ — `Content.tsx` # Editor Akash
`CollectionTabs.tsx` # Collections · `FieldEditor.tsx` # Fields do CMS · `EntryTable.tsx` # registros · `RichTextBox.tsx` # edição rica · `PublishDraftToggle.tsx`

### editorconfig/ — `EditorConfig.tsx` # Editor Akash
`DomainBindBox.tsx` # domínio do site · `ThemePicker.tsx` # tema do site · `DeployTargetRows.tsx` # hosts (wrangler/devthink.toml) · `EnvVarsTable.tsx` # vars não-secretas · `SecretsHint.tsx` # aponta pro .dev.vars

### trash/ — `Trash.tsx` # Editor Akash
`TrashList.tsx` # deletados com sufixo (2)(3) · `RestoreButton.tsx` · `PurgeButton.tsx` # purge com confirm vermelho · `RetentionNote.tsx` # política de retenção

## hooks da âncora (fora das páginas)
`AuthGuard.tsx` # protege rotas · `StateRouter.tsx` # /callback identifica provider pelo state · `SandboxId.tsx` # toda ação tem ID→DB

## contagem por página

| página | componentes oficiais | observação |
|---|---|---|
| 35 nativas do devthink | subâncora + 4 a 12 componentes cada | lista completa acima |
| âncoras extras (5 de criação IA + 8 do editor akash) | 5 a 7 componentes cada | completam as ~60 âncoras do shell |
| compartilhados do shell | 24 componentes | soltos na raiz do tema Sol/ |
| hooks da âncora | 3 hooks | fora das páginas, junto do App.tsx |

# exemplo — o repositório devthink como fica

o exemplo desenha o repositório inteiro com todos os aplicativos da família, seguindo o template padrão. todos os apps têm a MESMA estrutura: nenhum arquivo na raiz de um app que não existe nos outros. a única variação são as cópias de deploy (Vercel, Netlify, Cloudflare, Capacitor, Tauri), que ficam dentro da pasta do tema, junto do App.tsx. o App.tsx fica DENTRO do tema, ao lado do index.css e do index.html, em todos os apps. a página é a pasta com o próprio nome em minúscula, trazendo o <Pagina>.tsx da subâncora, os componentes TSX soltos e .ts auxiliares quando precisa. as pastas de versão next não existem no repositório: as versões next existem só como zip nos assets do release. os builds, testes e hashes rodam nas máquinas do GitHub e viajam nos assets. nada aqui substitui o template padrão — é só o exemplo.

```
C:\allan2\devthink/
│
├── .github/  # ci do repositório
│
│   └── workflows/  # fluxos auto-contidos, um por responsabilidade
│       ├── ci.yml  # integração contínua com matriz por app
│       ├── pages.yml  # deploy estático com rewrites e 404
│       ├── release.yml  # valida lockstep, cria a tag, gera os zips e o SHA256SUMS
│       ├── security.yml  # osv, trufflehog, trivy e SBOM
│       ├── verify.yml  # biome e tsc
│       ├── maintenance.yml  # limpeza de cache por schedule
│       ├── buildextension.yml  # build da extensão MV3 zip/xpi/vsix
│       ├── cachecleanup.yml  # limpa caches
│       ├── codeql.yml  # análise de segurança com timeout de 30min
│       ├── compatibility.yml  # node/bun/deno/esm/cjs/umd
│       ├── container.yml  # container multi-arch com pins
│       ├── desktop.yml  # desktop com Tauri
│       ├── mobile.yml  # mobile 100% na nuvem
│       ├── publishghcr.yml  # publica no GHCR
│       ├── publishgithubnpm.yml  # publica no GH npm
│       ├── publishmaven.yml  # publica no Maven
│       ├── publishnpmjs.yml  # publica no npmjs
│       ├── publishnuget.yml  # publica no NuGet
│       ├── publishrubygems.yml  # publica no RubyGems
│       ├── securitypolicy.yml  # política de segurança
│       ├── targets.yml  # alvos por app
│       ├── workflowlint.yml  # lint dos fluxos com dependabot fora de workflows/
│
├── .gitlab/  # forja espelho — repete o .github adaptado por forja
├── .forgejo/  # forja espelho — repete o .github adaptado por forja
├── .gitignore  # ignorados do repositório
├── package.json  # envelope do repositório (workspace)
├── bun.lock  # lock único do repositório
├── docs/  # documentação do repositório (referencia as docs de cada app)
├── tests/  # testes do repositório
│
├── devthink/ # app+OS — absorve devthinkos, cli-desktop, SoFlowX, akash, extension, gateway e maene; embute o owni; 35 páginas nativas; importa vídeo, imagem, 3D e áudio da biblioteca publicada
│
│   ├── Sol/  # o tema é a pasta — o nome é próprio; App.tsx, index.css, cópias de deploy e páginas DENTRO
│
│   │   ├── App.tsx  # âncora global — router: importa as subâncoras das páginas (DENTRO do tema, ao lado do index.css)
│
│   │   ├── index.css  # único CSS do tema — o nome é personalizável (index.css, sol.css ou o nome do tema)
│
│   │   ├── index.html  # entrada web
│
│   │   ├── icons.ts  # catálogo de ícones do tema
│
│   │   ├── control.shell.tsx  # shell compartilhado — solto na raiz do tema
│
│   │   ├── package.json  # envelope privado do tema
│
│   │   ├── pnpm-lock.yaml  # lock pnpm do tema
│
│   │   ├── pnpm-workspace.yaml  # workspace pnpm do tema
│
│   │   ├── tsconfig.json  # TS do tema
│
│   │   ├── tsconfig.node.json  # TS node do tema
│
│   │   ├── vite.config.ts  # build web
│
│   │   ├── devthink.toml  # config da plataforma (rotas de domínio, bindings, vars não-secretas)
│
│   │   ├── wrangler.toml  # config Cloudflare/Workers equivalente (deploy, bindings, rotas de domínio)
│
│   │   ├── .dev.vars.example  # exemplo dos segredos locais do wrangler dev — o .dev.vars real nunca commita
│
│   │   ├── vercel.json  # cópia de deploy Vercel
│
│   │   ├── netlify.toml  # cópia de deploy Netlify
│
│   │   ├── _headers  # cabeçalhos
│
│   │   ├── _redirects  # redirecionamentos
│
│   │   ├── caddyfile  # servidor Caddy
│
│   │   ├── mime.types  # tipos MIME
│
│   │   ├── capacitor.config.ts  # cópia de deploy mobile
│
│   │   ├── tauri.conf.json  # cópia de deploy desktop
│
│   │   ├── manifest.json  # manifesto PWA
│
│   │   ├── manifest.webmanifest  # manifesto web
│
│   │   ├── sitemanifest.json  # mapa do site
│
│   │   ├── icon.svg  # ícone
│
│   │   ├── favicon.ico  # favorito
│
│   │   ├── favicon.svg  # favorito
│
│   │   ├── icon32.png  # ícone 32
│
│   │   ├── icon64.png  # ícone 64
│
│   │   ├── icon128.png  # ícone 128
│
│   │   ├── design.html  # vitrine
│
│   │   ├── robots.txt  # robôs
│
│   │   ├── sitemap.xml  # mapa
│
│   │   ├── sw.ts  # service worker
│
│   │   ├── prisma/
│
│   │   │   └── schema.prisma  # schema do banco (Prisma vive dentro do tema)
│
│   │   ├── home/  # página = pasta = app
│
│   │   │   ├── Home.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── entry.tsx  # componente solto
│
│   │   │   ├── palette.tsx  # componente solto
│
│   │   │   ├── tabs.tsx  # componente solto
│
│   │   │   ├── types.ts  # .ts auxiliar
│
│   │   │   └── workspace.tsx  # componente solto
│
│   │   ├── notfound/  # página = pasta = app
│
│   │   │   └── NotFound.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   ├── gatewayview/  # página = pasta = app
│
│   │   │   ├── Gateway.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── config.ts  # .ts auxiliar
│
│   │   │   └── definition.ts  # .ts auxiliar
│
│   │   ├── console/  # página = pasta = app
│
│   │   │   ├── Console.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── boot.ts  # .ts auxiliar
│
│   │   │   ├── commandcatalog.ts  # .ts auxiliar
│
│   │   │   └── terminal.tsx  # componente solto
│
│   │   ├── onboarding/  # página = pasta = app
│
│   │   │   ├── Onboarding.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── IntroSplash.tsx  # componente solto
│
│   │   │   ├── StepTimeline.tsx  # componente solto
│
│   │   │   └── ThemePick.tsx  # componente solto
│
│   │   ├── login/  # página = pasta = app
│
│   │   │   ├── Login.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── LoginCard.tsx  # componente solto
│
│   │   │   ├── OAuthRow.tsx  # componente solto
│
│   │   │   └── CallbackHandler.tsx  # componente solto
│
│   │   ├── news/  # página = pasta = app
│
│   │   │   ├── News.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── NewsHero.tsx  # componente solto
│
│   │   │   ├── NewsList.tsx  # componente solto
│
│   │   │   └── ChangelogFeed.tsx  # componente solto
│
│   │   ├── projects/  # página = pasta = app
│
│   │   │   ├── Projects.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── ProjectGrid.tsx  # componente solto
│
│   │   │   ├── ProjectCard.tsx  # componente solto
│
│   │   │   └── CreateProjectWizard.tsx  # componente solto
│
│   │   ├── providers/  # página = pasta = app
│
│   │   │   ├── Providers.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── ProviderTabs.tsx  # componente solto
│
│   │   │   └── ModelCard.tsx  # componente solto
│
│   │   ├── settings/  # página = pasta = app
│
│   │   │   ├── Settings.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── SettingsRail.tsx  # componente solto
│
│   │   │   ├── AppearanceTab.tsx  # componente solto
│
│   │   │   └── DangerZone.tsx  # componente solto
│
│   │   ├── usage/  # página = pasta = app
│
│   │   │   ├── Usage.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── UsageChart.tsx  # componente solto
│
│   │   │   └── PlanCompare.tsx  # componente solto
│
│   │   ├── audio/  # página = pasta = app
│
│   │   │   ├── Audio.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── WaveformCard.tsx  # componente solto
│
│   │   │   └── GenerateAudioBox.tsx  # componente solto
│
│   │   ├── video/  # página = pasta = app
│
│   │   │   ├── Video.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── RenderQueue.tsx  # componente solto
│
│   │   │   └── AspectChips.tsx  # componente solto
│
│   │   ├── image/  # página = pasta = app
│
│   │   │   ├── Image.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── ImagineComposer.tsx  # componente solto
│
│   │   │   └── ResultMasonry.tsx  # componente solto
│
│   │   ├── notes/  # página = pasta = app
│
│   │   │   ├── Notes.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── NoteList.tsx  # componente solto
│
│   │   │   └── NoteEditor.tsx  # componente solto
│
│   │   ├── photoeditor/  # página = pasta = app
│
│   │   │   ├── PhotoEditor.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── CanvasStage.tsx  # componente solto
│
│   │   │   ├── ToolRail.tsx  # componente solto
│
│   │   │   └── LayersPanel.tsx  # componente solto
│
│   │   ├── videoeditor/  # página = pasta = app
│
│   │   │   ├── VideoEditor.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── TimelineTracks.tsx  # componente solto
│
│   │   │   ├── PreviewMonitor.tsx  # componente solto
│
│   │   │   └── PublishBar.tsx  # componente solto
│
│   │   ├── browser/  # página = pasta = app
│
│   │   │   ├── Browser.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── TabStrip.tsx  # componente solto
│
│   │   │   ├── AddressPill.tsx  # componente solto
│
│   │   │   └── ShieldsPopover.tsx  # componente solto
│
│   │   ├── terminal/  # página = pasta = app
│
│   │   │   ├── Terminal.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── TermTabs.tsx  # componente solto
│
│   │   │   └── TermCanvas.tsx  # componente solto
│
│   │   ├── files/  # página = pasta = app
│
│   │   │   ├── Files.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── FileToolbar.tsx  # componente solto
│
│   │   │   ├── FileGrid.tsx  # componente solto
│
│   │   │   └── FolderTree.tsx  # componente solto
│
│   │   ├── gallery/  # página = pasta = app
│
│   │   │   ├── Gallery.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── GalleryTabs.tsx  # componente solto
│
│   │   │   └── LightboxModal.tsx  # componente solto
│
│   │   ├── connectors/  # página = pasta = app
│
│   │   │   ├── Connectors.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── ConnectorCard.tsx  # componente solto
│
│   │   │   └── McpCustomForm.tsx  # componente solto
│
│   │   ├── automations/  # página = pasta = app
│
│   │   │   ├── Automations.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── AutoTabs.tsx  # componente solto
│
│   │   │   ├── ScheduleEditor.tsx  # componente solto
│
│   │   │   └── RunsTable.tsx  # componente solto
│
│   │   ├── deploy/  # página = pasta = app
│
│   │   │   ├── Deploy.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── DomainPanel.tsx  # componente solto
│
│   │   │   ├── DeployTimeline.tsx  # componente solto
│
│   │   │   └── ReleaseAssets.tsx  # componente solto
│
│   │   ├── security/  # página = pasta = app
│
│   │   │   ├── Security.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── SecurityRail.tsx  # componente solto
│
│   │   │   ├── AuditLog.tsx  # componente solto
│
│   │   │   └── TwoFactorBox.tsx  # componente solto
│
│   │   ├── docs/  # página = pasta = app
│
│   │   │   ├── Docs.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── DocsSidebar.tsx  # componente solto
│
│   │   │   ├── DocBody.tsx  # componente solto
│
│   │   │   └── CodeBlock.tsx  # componente solto
│
│   │   ├── data/  # página = pasta = app
│
│   │   │   ├── Data.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── StoreTable.tsx  # componente solto
│
│   │   │   ├── SchemaViewer.tsx  # componente solto
│
│   │   │   └── BackupsPanel.tsx  # componente solto
│
│   │   ├── music/  # página = pasta = app
│
│   │   │   ├── Music.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── TrackList.tsx  # componente solto
│
│   │   │   ├── PlayerDock.tsx  # componente solto
│
│   │   │   └── PromptToSongBox.tsx  # componente solto
│
│   │   ├── camera/  # página = pasta = app
│
│   │   │   ├── Camera.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── CamPreview.tsx  # componente solto
│
│   │   │   └── ShotButton.tsx  # componente solto
│
│   │   ├── recorder/  # página = pasta = app
│
│   │   │   ├── Recorder.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── RecPanel.tsx  # componente solto
│
│   │   │   └── MicLevel.tsx  # componente solto
│
│   │   ├── mail/  # página = pasta = app
│
│   │   │   ├── Mail.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── MailRail.tsx  # componente solto
│
│   │   │   ├── MailReader.tsx  # componente solto
│
│   │   │   └── ComposeWindow.tsx  # componente solto
│
│   │   ├── calendar/  # página = pasta = app
│
│   │   │   ├── Calendar.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── MonthGrid.tsx  # componente solto
│
│   │   │   └── EventPopover.tsx  # componente solto
│
│   │   ├── calculator/  # página = pasta = app
│
│   │   │   ├── Calculator.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── CalcDisplay.tsx  # componente solto
│
│   │   │   ├── CalcPad.tsx  # componente solto
│
│   │   │   └── UnitConverter.tsx  # componente solto
│
│   │   ├── maps/  # página = pasta = app
│
│   │   │   ├── Maps.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── MapCanvas.tsx  # componente solto
│
│   │   │   ├── RoutePanel.tsx  # componente solto
│
│   │   │   └── PlaceCard.tsx  # componente solto
│
│   │   └── store/  # página = pasta = app
│
│   │       ├── Store.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │       ├── StoreBanners.tsx  # componente solto
│
│   │       ├── AppCard.tsx  # componente solto
│
│   │       └── InstallAppModal.tsx  # componente solto
│
│   ├── docs/  # documentação do app (referencia, não copia)
│
│   ├── tests/  # testes do app
│
│   │   └── scripts/  # scripts do app (TypeScript; não-JS em tests/scripts)
│
│   │       ├── task.ts  # tarefas da operação
│
│   │       └── release.ts  # ciclo de release
│
│   ├── package.json  # envelope do app
│
│   ├── bun.lock  # lock Bun
│
│   ├── tsconfig.json  # TS (mescla app+build+server)
│
│   ├── biome.json  # lint/format
│
│   ├── deno.json  # deno
│
│   ├── vitest.config.ts  # testes
│
│   ├── prisma.config.ts  # config do banco
│
│   ├── Dockerfile  # container único (todo o contexto, entrypoint em heredoc)
│
│   ├── .dockerignore  # ignora docker
│
│   ├── .env.example  # exemplo de ambiente
│
│   ├── .gitattributes  # atributos git
│
│   ├── .gitignore  # ignorados
│
│   ├── .npmrc  # registry
│
│   ├── .nvmrc  # versão do node
│
│   ├── pom.xml  # envelope Maven
│
│   ├── settings.xml  # settings Maven
│
│   ├── <nome>.csproj  # envelope NuGet
│
│   ├── <nome>.gemspec  # envelope RubyGems
│
│   ├── <Nome>.java  # núcleo Java
│
│   ├── <Nome>Distribution.cs  # distribuição .NET
│
│   ├── LICENSE  # licença
│
│   ├── README.md  # apresentação
│
│   ├── ARCHITECTURE.md  # arquitetura
│
│   ├── CHANGELOG.md  # novidades por versão (vira release notes)
│
│   ├── SECURITY.md  # segurança e disclosure
│
│   ├── CODEOWNERS  # donos do repo
│
│   ├── CONTRIBUTING.md  # como contribuir
│
│   ├── code-of-conduct.md  # conduta
│
│   ├── third-party-notices.md  # notices de terceiros
│
│   ├── accounts.ts  # lógica solta
│
│   ├── agent.ts  # lógica solta
│
│   ├── antigravity.ts  # lógica solta
│
│   ├── apifreeze.ts  # lógica solta
│
│   ├── auth.ts  # lógica solta
│
│   ├── background.ts  # lógica solta
│
│   ├── bridge.ts  # lógica solta
│
│   ├── build.ts  # lógica solta
│
│   ├── bun.ts  # lógica solta
│
│   ├── capture.ts  # lógica solta
│
│   ├── checksecrets.ts  # lógica solta
│
│   ├── cjs.ts  # lógica solta
│
│   ├── cli.ts  # lógica solta
│
│   ├── commands.ts  # lógica solta
│
│   ├── companion.ts  # lógica solta
│
│   ├── compatibility.ts  # lógica solta
│
│   ├── config.ts  # lógica solta
│
│   ├── constants.ts  # lógica solta
│
│   ├── core.ts  # lógica solta
│
│   ├── crossbrowser.ts  # lógica solta
│
│   ├── dashdone.ts  # lógica solta
│
│   ├── data.ts  # lógica solta
│
│   ├── database.ts  # lógica solta
│
│   ├── debug.ts  # lógica solta
│
│   ├── deno.ts  # lógica solta
│
│   ├── devthink.ts  # lógica solta
│
│   ├── engine.ts  # lógica solta
│
│   ├── environments.ts  # lógica solta
│
│   ├── evidence.ts  # lógica solta
│
│   ├── export.ts  # lógica solta
│
│   ├── fingerprint.ts  # lógica solta
│
│   ├── flow.ts  # lógica solta
│
│   ├── gates.ts  # lógica solta
│
│   ├── hardening.ts  # lógica solta
│
│   ├── headless.ts  # lógica solta
│
│   ├── http.ts  # lógica solta
│
│   ├── identity.ts  # lógica solta
│
│   ├── ids.ts  # lógica solta
│
│   ├── index.ts  # lógica solta
│
│   ├── llm.ts  # lógica solta
│
│   ├── mcp.ts  # lógica solta
│
│   ├── memory.ts  # lógica solta
│
│   ├── models.ts  # lógica solta
│
│   ├── modes.ts  # lógica solta
│
│   ├── net.ts  # lógica solta
│
│   ├── neutral.ts  # lógica solta
│
│   ├── node.ts  # lógica solta
│
│   ├── oauth.ts  # lógica solta
│
│   ├── offscreen.ts  # lógica solta
│
│   ├── pack.ts  # lógica solta
│
│   ├── page.ts  # lógica solta
│
│   ├── pagebridge.ts  # lógica solta
│
│   ├── perf.ts  # lógica solta
│
│   ├── plan.ts  # lógica solta
│
│   ├── policy.ts  # lógica solta
│
│   ├── progress.ts  # lógica solta
│
│   ├── project.ts  # lógica solta
│
│   ├── protocol.ts  # lógica solta
│
│   ├── providers.ts  # lógica solta
│
│   ├── quota.ts  # lógica solta
│
│   ├── recovery.ts  # lógica solta
│
│   ├── request.ts  # lógica solta
│
│   ├── run.ts  # lógica solta
│
│   ├── runtime.ts  # lógica solta
│
│   ├── search.ts  # lógica solta
│
│   ├── security.ts  # lógica solta
│
│   ├── serve.ts  # lógica solta
│
│   ├── server.ts  # lógica solta
│
│   ├── session.ts  # lógica solta
│
│   ├── storage.ts  # lógica solta
│
│   ├── streaming.ts  # lógica solta
│
│   ├── swarm.ts  # lógica solta
│
│   ├── sync.ts  # lógica solta
│
│   ├── terminal.ts  # lógica solta
│
│   ├── tools.ts  # lógica solta
│
│   ├── types.ts  # lógica solta
│
│   ├── umd.ts  # lógica solta
│
│   ├── updates.ts  # lógica solta
│
│   ├── utils.ts  # lógica solta
│
│   ├── version.ts  # lógica solta
│
│   ├── versionregistry.ts  # lógica solta
│
│   ├── views.ts  # lógica solta
│
│   ├── workbenchmemory.ts  # lógica solta
│
│   ├── workbenchsession.ts  # lógica solta
│
│   └── workflow.ts  # lógica solta
│
│
├── saddle/ # sandbox e runner de VM — só virtualização; absorve o e2ugh; 3 bases (max, balanced, lite); 13 tipos de sandbox; roda qualquer binário
│
│   ├── Sol/  # o tema é a pasta — o nome é próprio; App.tsx, index.css, cópias de deploy e páginas DENTRO
│
│   │   ├── App.tsx  # âncora global — router: importa as subâncoras das páginas (DENTRO do tema, ao lado do index.css)
│
│   │   ├── index.css  # único CSS do tema — o nome é personalizável (index.css, sol.css ou o nome do tema)
│
│   │   ├── index.html  # entrada web
│
│   │   ├── icons.ts  # catálogo de ícones do tema
│
│   │   ├── control.shell.tsx  # shell compartilhado — solto na raiz do tema
│
│   │   ├── package.json  # envelope privado do tema
│
│   │   ├── pnpm-lock.yaml  # lock pnpm do tema
│
│   │   ├── pnpm-workspace.yaml  # workspace pnpm do tema
│
│   │   ├── tsconfig.json  # TS do tema
│
│   │   ├── tsconfig.node.json  # TS node do tema
│
│   │   ├── vite.config.ts  # build web
│
│   │   ├── devthink.toml  # config da plataforma (rotas de domínio, bindings, vars não-secretas)
│
│   │   ├── wrangler.toml  # config Cloudflare/Workers equivalente (deploy, bindings, rotas de domínio)
│
│   │   ├── .dev.vars.example  # exemplo dos segredos locais do wrangler dev — o .dev.vars real nunca commita
│
│   │   ├── vercel.json  # cópia de deploy Vercel
│
│   │   ├── netlify.toml  # cópia de deploy Netlify
│
│   │   ├── _headers  # cabeçalhos
│
│   │   ├── _redirects  # redirecionamentos
│
│   │   ├── caddyfile  # servidor Caddy
│
│   │   ├── mime.types  # tipos MIME
│
│   │   ├── capacitor.config.ts  # cópia de deploy mobile
│
│   │   ├── tauri.conf.json  # cópia de deploy desktop
│
│   │   ├── manifest.json  # manifesto PWA
│
│   │   ├── manifest.webmanifest  # manifesto web
│
│   │   ├── sitemanifest.json  # mapa do site
│
│   │   ├── icon.svg  # ícone
│
│   │   ├── favicon.ico  # favorito
│
│   │   ├── favicon.svg  # favorito
│
│   │   ├── icon32.png  # ícone 32
│
│   │   ├── icon64.png  # ícone 64
│
│   │   ├── icon128.png  # ícone 128
│
│   │   ├── design.html  # vitrine
│
│   │   ├── robots.txt  # robôs
│
│   │   ├── sitemap.xml  # mapa
│
│   │   ├── sw.ts  # service worker
│
│   │   ├── prisma/
│
│   │   │   └── schema.prisma  # schema do banco (Prisma vive dentro do tema)
│
│   │   ├── home/  # página = pasta = app
│
│   │   │   ├── Home.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── HeroCard.tsx  # componente solto
│
│   │   │   └── QuickStart.tsx  # componente solto
│
│   │   ├── dashboard/  # página = pasta = app
│
│   │   │   ├── Dashboard.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── SandboxGrid.tsx  # componente solto
│
│   │   │   └── ResourceBars.tsx  # componente solto
│
│   │   ├── console/  # página = pasta = app
│
│   │   │   ├── Console.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── TermCanvas.tsx  # componente solto
│
│   │   │   └── BootLog.tsx  # componente solto
│
│   │   ├── playground/  # página = pasta = app
│
│   │   │   ├── Playground.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── ProfilePicker.tsx  # componente solto
│
│   │   │   └── RunConsole.tsx  # componente solto
│
│   │   ├── architecture/  # página = pasta = app
│
│   │   │   ├── Architecture.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── LayerDiagram.tsx  # componente solto
│
│   │   │   └── NodeCard.tsx  # componente solto
│
│   │   ├── compute/  # página = pasta = app
│
│   │   │   ├── Compute.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── GpuTable.tsx  # componente solto
│
│   │   │   └── FleetPanel.tsx  # componente solto
│
│   │   ├── docs/  # página = pasta = app
│
│   │   │   ├── Docs.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── DocBody.tsx  # componente solto
│
│   │   │   └── SearchDocs.tsx  # componente solto
│
│   │   ├── integrations/  # página = pasta = app
│
│   │   │   ├── Integrations.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── InstalledRow.tsx  # componente solto
│
│   │   │   └── ConnectFlow.tsx  # componente solto
│
│   │   ├── metrics/  # página = pasta = app
│
│   │   │   ├── Metrics.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── MetricTable.tsx  # componente solto
│
│   │   │   └── UsageChart.tsx  # componente solto
│
│   │   ├── billing/  # página = pasta = app
│
│   │   │   ├── Billing.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── PlanCompare.tsx  # componente solto
│
│   │   │   └── InvoiceList.tsx  # componente solto
│
│   │   ├── snapshots/  # página = pasta = app
│
│   │   │   ├── Snapshots.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── SnapshotList.tsx  # componente solto
│
│   │   │   └── RestoreButton.tsx  # componente solto
│
│   │   ├── onboarding/  # página = pasta = app
│
│   │   │   ├── Onboarding.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── IntroSplash.tsx  # componente solto
│
│   │   │   └── StepTimeline.tsx  # componente solto
│
│   │   ├── login/  # página = pasta = app
│
│   │   │   ├── Login.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── LoginCard.tsx  # componente solto
│
│   │   │   └── OAuthRow.tsx  # componente solto
│
│   │   ├── register/  # página = pasta = app
│
│   │   │   ├── Register.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── RegisterCard.tsx  # componente solto
│
│   │   │   └── TermsNote.tsx  # componente solto
│
│   │   └── notfound/  # página = pasta = app
│
│   │       └── NotFound.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   ├── docs/  # documentação do app (referencia, não copia)
│
│   ├── tests/  # testes do app
│
│   │   └── scripts/  # scripts do app (TypeScript; não-JS em tests/scripts)
│
│   │       ├── task.ts  # tarefas da operação
│
│   │       └── release.ts  # ciclo de release
│
│   ├── package.json  # envelope do app
│
│   ├── bun.lock  # lock Bun
│
│   ├── tsconfig.json  # TS (mescla app+build+server)
│
│   ├── biome.json  # lint/format
│
│   ├── deno.json  # deno
│
│   ├── vitest.config.ts  # testes
│
│   ├── prisma.config.ts  # config do banco
│
│   ├── Dockerfile  # container único (todo o contexto, entrypoint em heredoc)
│
│   ├── .dockerignore  # ignora docker
│
│   ├── .env.example  # exemplo de ambiente
│
│   ├── .gitattributes  # atributos git
│
│   ├── .gitignore  # ignorados
│
│   ├── .npmrc  # registry
│
│   ├── .nvmrc  # versão do node
│
│   ├── pom.xml  # envelope Maven
│
│   ├── settings.xml  # settings Maven
│
│   ├── <nome>.csproj  # envelope NuGet
│
│   ├── <nome>.gemspec  # envelope RubyGems
│
│   ├── <Nome>.java  # núcleo Java
│
│   ├── <Nome>Distribution.cs  # distribuição .NET
│
│   ├── LICENSE  # licença
│
│   ├── README.md  # apresentação
│
│   ├── ARCHITECTURE.md  # arquitetura
│
│   ├── CHANGELOG.md  # novidades por versão (vira release notes)
│
│   ├── SECURITY.md  # segurança e disclosure
│
│   ├── CODEOWNERS  # donos do repo
│
│   ├── CONTRIBUTING.md  # como contribuir
│
│   ├── code-of-conduct.md  # conduta
│
│   ├── third-party-notices.md  # notices de terceiros
│
│   ├── boards.ts  # lógica solta
│
│   ├── cores.ts  # lógica solta
│
│   ├── gpus.ts  # lógica solta
│
│   ├── processors.ts  # lógica solta
│
│   ├── virtualhardware.ts  # lógica solta
│
│   ├── qemu.ts  # lógica solta
│
│   ├── gpumonitor.ts  # lógica solta
│
│   ├── virtualhardwarec.ts  # lógica solta
│
│   ├── virtualizationcore.ts  # lógica solta
│
│   ├── qemubridge.ts  # lógica solta
│
│   ├── virtual.ts  # lógica solta
│
│   ├── virtualcpu.ts  # lógica solta
│
│   ├── virtualgpu.ts  # lógica solta
│
│   ├── virtualmemory.ts  # lógica solta
│
│   ├── scheduler.ts  # lógica solta
│
│   ├── isolation.ts  # lógica solta
│
│   ├── tiers.ts  # lógica solta
│
│   ├── server.ts  # lógica solta
│
│   ├── telemetry.ts  # lógica solta
│
│   ├── sandbox.ts  # lógica solta
│
│   ├── profile.ts  # lógica solta
│
│   ├── fleet.ts  # lógica solta
│
│   ├── storage.ts  # lógica solta
│
│   ├── snapshot.ts  # lógica solta
│
│   └── index.ts  # lógica solta
│
│
├── debonair/ # áudio e DAW — abriga a engine katexis na raiz; importa gateway, IA e workflow do devthink
│
│   ├── Sol/  # o tema é a pasta — o nome é próprio; App.tsx, index.css, cópias de deploy e páginas DENTRO
│
│   │   ├── App.tsx  # âncora global — router: importa as subâncoras das páginas (DENTRO do tema, ao lado do index.css)
│
│   │   ├── index.css  # único CSS do tema — o nome é personalizável (index.css, sol.css ou o nome do tema)
│
│   │   ├── index.html  # entrada web
│
│   │   ├── icons.ts  # catálogo de ícones do tema
│
│   │   ├── control.shell.tsx  # shell compartilhado — solto na raiz do tema
│
│   │   ├── package.json  # envelope privado do tema
│
│   │   ├── pnpm-lock.yaml  # lock pnpm do tema
│
│   │   ├── pnpm-workspace.yaml  # workspace pnpm do tema
│
│   │   ├── tsconfig.json  # TS do tema
│
│   │   ├── tsconfig.node.json  # TS node do tema
│
│   │   ├── vite.config.ts  # build web
│
│   │   ├── devthink.toml  # config da plataforma (rotas de domínio, bindings, vars não-secretas)
│
│   │   ├── wrangler.toml  # config Cloudflare/Workers equivalente (deploy, bindings, rotas de domínio)
│
│   │   ├── .dev.vars.example  # exemplo dos segredos locais do wrangler dev — o .dev.vars real nunca commita
│
│   │   ├── vercel.json  # cópia de deploy Vercel
│
│   │   ├── netlify.toml  # cópia de deploy Netlify
│
│   │   ├── _headers  # cabeçalhos
│
│   │   ├── _redirects  # redirecionamentos
│
│   │   ├── caddyfile  # servidor Caddy
│
│   │   ├── mime.types  # tipos MIME
│
│   │   ├── capacitor.config.ts  # cópia de deploy mobile
│
│   │   ├── tauri.conf.json  # cópia de deploy desktop
│
│   │   ├── manifest.json  # manifesto PWA
│
│   │   ├── manifest.webmanifest  # manifesto web
│
│   │   ├── sitemanifest.json  # mapa do site
│
│   │   ├── icon.svg  # ícone
│
│   │   ├── favicon.ico  # favorito
│
│   │   ├── favicon.svg  # favorito
│
│   │   ├── icon32.png  # ícone 32
│
│   │   ├── icon64.png  # ícone 64
│
│   │   ├── icon128.png  # ícone 128
│
│   │   ├── design.html  # vitrine
│
│   │   ├── robots.txt  # robôs
│
│   │   ├── sitemap.xml  # mapa
│
│   │   ├── sw.ts  # service worker
│
│   │   ├── prisma/
│
│   │   │   └── schema.prisma  # schema do banco (Prisma vive dentro do tema)
│
│   │   ├── mixer/  # página = pasta = app
│
│   │   │   ├── Mixer.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── ChannelStrip.tsx  # componente solto
│
│   │   │   └── FaderRack.tsx  # componente solto
│
│   │   ├── timeline/  # página = pasta = app
│
│   │   │   ├── Timeline.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── TrackLane.tsx  # componente solto
│
│   │   │   └── SnapGrid.tsx  # componente solto
│
│   │   ├── pianoroll/  # página = pasta = app
│
│   │   │   ├── PianoRoll.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── NoteGrid.tsx  # componente solto
│
│   │   │   └── VelocityBar.tsx  # componente solto
│
│   │   ├── library/  # página = pasta = app
│
│   │   │   ├── Library.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── SampleList.tsx  # componente solto
│
│   │   │   └── PreviewPlayer.tsx  # componente solto
│
│   │   ├── master/  # página = pasta = app
│
│   │   │   ├── Master.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── ChainSlots.tsx  # componente solto
│
│   │   │   └── LoudnessMeter.tsx  # componente solto
│
│   │   ├── onboarding/  # página = pasta = app
│
│   │   │   ├── Onboarding.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── IntroSplash.tsx  # componente solto
│
│   │   │   └── StepTimeline.tsx  # componente solto
│
│   │   ├── login/  # página = pasta = app
│
│   │   │   ├── Login.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── LoginCard.tsx  # componente solto
│
│   │   │   └── OAuthRow.tsx  # componente solto
│
│   │   └── settings/  # página = pasta = app
│
│   │       ├── Settings.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │       ├── AudioDeviceTab.tsx  # componente solto
│
│   │       └── ThemeTab.tsx  # componente solto
│
│   ├── docs/  # documentação do app (referencia, não copia)
│
│   ├── tests/  # testes do app
│
│   │   └── scripts/  # scripts do app (TypeScript; não-JS em tests/scripts)
│
│   │       ├── task.ts  # tarefas da operação
│
│   │       └── release.ts  # ciclo de release
│
│   ├── package.json  # envelope do app
│
│   ├── bun.lock  # lock Bun
│
│   ├── tsconfig.json  # TS (mescla app+build+server)
│
│   ├── biome.json  # lint/format
│
│   ├── deno.json  # deno
│
│   ├── vitest.config.ts  # testes
│
│   ├── prisma.config.ts  # config do banco
│
│   ├── Dockerfile  # container único (todo o contexto, entrypoint em heredoc)
│
│   ├── .dockerignore  # ignora docker
│
│   ├── .env.example  # exemplo de ambiente
│
│   ├── .gitattributes  # atributos git
│
│   ├── .gitignore  # ignorados
│
│   ├── .npmrc  # registry
│
│   ├── .nvmrc  # versão do node
│
│   ├── pom.xml  # envelope Maven
│
│   ├── settings.xml  # settings Maven
│
│   ├── <nome>.csproj  # envelope NuGet
│
│   ├── <nome>.gemspec  # envelope RubyGems
│
│   ├── <Nome>.java  # núcleo Java
│
│   ├── <Nome>Distribution.cs  # distribuição .NET
│
│   ├── LICENSE  # licença
│
│   ├── README.md  # apresentação
│
│   ├── ARCHITECTURE.md  # arquitetura
│
│   ├── CHANGELOG.md  # novidades por versão (vira release notes)
│
│   ├── SECURITY.md  # segurança e disclosure
│
│   ├── CODEOWNERS  # donos do repo
│
│   ├── CONTRIBUTING.md  # como contribuir
│
│   ├── code-of-conduct.md  # conduta
│
│   ├── third-party-notices.md  # notices de terceiros
│
│   ├── katexis.ts  # lógica solta
│
│   ├── audio.ts  # lógica solta
│
│   ├── daw.ts  # lógica solta
│
│   ├── mixer.ts  # lógica solta
│
│   ├── timeline.ts  # lógica solta
│
│   ├── pianoroll.ts  # lógica solta
│
│   ├── library.ts  # lógica solta
│
│   ├── master.ts  # lógica solta
│
│   ├── synth.ts  # lógica solta
│
│   ├── sampler.ts  # lógica solta
│
│   ├── midi.ts  # lógica solta
│
│   ├── fft.ts  # lógica solta
│
│   ├── mfcc.ts  # lógica solta
│
│   ├── stem.ts  # lógica solta
│
│   ├── render.ts  # lógica solta
│
│   ├── export.ts  # lógica solta
│
│   ├── types.ts  # lógica solta
│
│   ├── utils.ts  # lógica solta
│
│   └── index.ts  # lógica solta
│
│
├── cadria/ # vídeo e imagem — absorve iukka e create; abriga a engine versawase na raiz; importa katexis do debonair
│
│   ├── Sol/  # o tema é a pasta — o nome é próprio; App.tsx, index.css, cópias de deploy e páginas DENTRO
│
│   │   ├── App.tsx  # âncora global — router: importa as subâncoras das páginas (DENTRO do tema, ao lado do index.css)
│
│   │   ├── index.css  # único CSS do tema — o nome é personalizável (index.css, sol.css ou o nome do tema)
│
│   │   ├── index.html  # entrada web
│
│   │   ├── icons.ts  # catálogo de ícones do tema
│
│   │   ├── control.shell.tsx  # shell compartilhado — solto na raiz do tema
│
│   │   ├── package.json  # envelope privado do tema
│
│   │   ├── pnpm-lock.yaml  # lock pnpm do tema
│
│   │   ├── pnpm-workspace.yaml  # workspace pnpm do tema
│
│   │   ├── tsconfig.json  # TS do tema
│
│   │   ├── tsconfig.node.json  # TS node do tema
│
│   │   ├── vite.config.ts  # build web
│
│   │   ├── devthink.toml  # config da plataforma (rotas de domínio, bindings, vars não-secretas)
│
│   │   ├── wrangler.toml  # config Cloudflare/Workers equivalente (deploy, bindings, rotas de domínio)
│
│   │   ├── .dev.vars.example  # exemplo dos segredos locais do wrangler dev — o .dev.vars real nunca commita
│
│   │   ├── vercel.json  # cópia de deploy Vercel
│
│   │   ├── netlify.toml  # cópia de deploy Netlify
│
│   │   ├── _headers  # cabeçalhos
│
│   │   ├── _redirects  # redirecionamentos
│
│   │   ├── caddyfile  # servidor Caddy
│
│   │   ├── mime.types  # tipos MIME
│
│   │   ├── capacitor.config.ts  # cópia de deploy mobile
│
│   │   ├── tauri.conf.json  # cópia de deploy desktop
│
│   │   ├── manifest.json  # manifesto PWA
│
│   │   ├── manifest.webmanifest  # manifesto web
│
│   │   ├── sitemanifest.json  # mapa do site
│
│   │   ├── icon.svg  # ícone
│
│   │   ├── favicon.ico  # favorito
│
│   │   ├── favicon.svg  # favorito
│
│   │   ├── icon32.png  # ícone 32
│
│   │   ├── icon64.png  # ícone 64
│
│   │   ├── icon128.png  # ícone 128
│
│   │   ├── design.html  # vitrine
│
│   │   ├── robots.txt  # robôs
│
│   │   ├── sitemap.xml  # mapa
│
│   │   ├── sw.ts  # service worker
│
│   │   ├── prisma/
│
│   │   │   └── schema.prisma  # schema do banco (Prisma vive dentro do tema)
│
│   │   ├── player/  # página = pasta = app
│
│   │   │   ├── Player.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── PlaybackBar.tsx  # componente solto
│
│   │   │   └── ProviderMenu.tsx  # componente solto
│
│   │   ├── timeline/  # página = pasta = app
│
│   │   │   ├── Timeline.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── ClipLane.tsx  # componente solto
│
│   │   │   └── SnapGrid.tsx  # componente solto
│
│   │   ├── editor/  # página = pasta = app
│
│   │   │   ├── Editor.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── ToolRail.tsx  # componente solto
│
│   │   │   └── PreviewMonitor.tsx  # componente solto
│
│   │   ├── render/  # página = pasta = app
│
│   │   │   ├── Render.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── QueueList.tsx  # componente solto
│
│   │   │   └── ProgressCard.tsx  # componente solto
│
│   │   ├── library/  # página = pasta = app
│
│   │   │   ├── Library.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── MediaGrid.tsx  # componente solto
│
│   │   │   └── TagRow.tsx  # componente solto
│
│   │   ├── export/  # página = pasta = app
│
│   │   │   ├── Export.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── FormatGrid.tsx  # componente solto
│
│   │   │   └── SizeChips.tsx  # componente solto
│
│   │   ├── onboarding/  # página = pasta = app
│
│   │   │   ├── Onboarding.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── IntroSplash.tsx  # componente solto
│
│   │   │   └── StepTimeline.tsx  # componente solto
│
│   │   └── login/  # página = pasta = app
│
│   │       ├── Login.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │       ├── LoginCard.tsx  # componente solto
│
│   │       └── OAuthRow.tsx  # componente solto
│
│   ├── docs/  # documentação do app (referencia, não copia)
│
│   ├── tests/  # testes do app
│
│   │   └── scripts/  # scripts do app (TypeScript; não-JS em tests/scripts)
│
│   │       ├── task.ts  # tarefas da operação
│
│   │       └── release.ts  # ciclo de release
│
│   ├── package.json  # envelope do app
│
│   ├── bun.lock  # lock Bun
│
│   ├── tsconfig.json  # TS (mescla app+build+server)
│
│   ├── biome.json  # lint/format
│
│   ├── deno.json  # deno
│
│   ├── vitest.config.ts  # testes
│
│   ├── prisma.config.ts  # config do banco
│
│   ├── Dockerfile  # container único (todo o contexto, entrypoint em heredoc)
│
│   ├── .dockerignore  # ignora docker
│
│   ├── .env.example  # exemplo de ambiente
│
│   ├── .gitattributes  # atributos git
│
│   ├── .gitignore  # ignorados
│
│   ├── .npmrc  # registry
│
│   ├── .nvmrc  # versão do node
│
│   ├── pom.xml  # envelope Maven
│
│   ├── settings.xml  # settings Maven
│
│   ├── <nome>.csproj  # envelope NuGet
│
│   ├── <nome>.gemspec  # envelope RubyGems
│
│   ├── <Nome>.java  # núcleo Java
│
│   ├── <Nome>Distribution.cs  # distribuição .NET
│
│   ├── LICENSE  # licença
│
│   ├── README.md  # apresentação
│
│   ├── ARCHITECTURE.md  # arquitetura
│
│   ├── CHANGELOG.md  # novidades por versão (vira release notes)
│
│   ├── SECURITY.md  # segurança e disclosure
│
│   ├── CODEOWNERS  # donos do repo
│
│   ├── CONTRIBUTING.md  # como contribuir
│
│   ├── code-of-conduct.md  # conduta
│
│   ├── third-party-notices.md  # notices de terceiros
│
│   ├── versawase.ts  # lógica solta
│
│   ├── player.ts  # lógica solta
│
│   ├── editor.ts  # lógica solta
│
│   ├── render.ts  # lógica solta
│
│   ├── timeline.ts  # lógica solta
│
│   ├── export.ts  # lógica solta
│
│   ├── codecs.ts  # lógica solta
│
│   ├── effects.ts  # lógica solta
│
│   ├── filters.ts  # lógica solta
│
│   ├── transcode.ts  # lógica solta
│
│   ├── ui.ts  # lógica solta
│
│   ├── types.ts  # lógica solta
│
│   ├── utils.ts  # lógica solta
│
│   └── index.ts  # lógica solta
│
│
├── stealhead/ # jogo FPS — importa versawase e áudio via biblioteca, sem engine própria; lógicas só do jogo
│
│   ├── Sol/  # o tema é a pasta — o nome é próprio; App.tsx, index.css, cópias de deploy e páginas DENTRO
│
│   │   ├── App.tsx  # âncora global — router: importa as subâncoras das páginas (DENTRO do tema, ao lado do index.css)
│
│   │   ├── index.css  # único CSS do tema — o nome é personalizável (index.css, sol.css ou o nome do tema)
│
│   │   ├── index.html  # entrada web
│
│   │   ├── icons.ts  # catálogo de ícones do tema
│
│   │   ├── control.shell.tsx  # shell compartilhado — solto na raiz do tema
│
│   │   ├── package.json  # envelope privado do tema
│
│   │   ├── pnpm-lock.yaml  # lock pnpm do tema
│
│   │   ├── pnpm-workspace.yaml  # workspace pnpm do tema
│
│   │   ├── tsconfig.json  # TS do tema
│
│   │   ├── tsconfig.node.json  # TS node do tema
│
│   │   ├── vite.config.ts  # build web
│
│   │   ├── devthink.toml  # config da plataforma (rotas de domínio, bindings, vars não-secretas)
│
│   │   ├── wrangler.toml  # config Cloudflare/Workers equivalente (deploy, bindings, rotas de domínio)
│
│   │   ├── .dev.vars.example  # exemplo dos segredos locais do wrangler dev — o .dev.vars real nunca commita
│
│   │   ├── vercel.json  # cópia de deploy Vercel
│
│   │   ├── netlify.toml  # cópia de deploy Netlify
│
│   │   ├── _headers  # cabeçalhos
│
│   │   ├── _redirects  # redirecionamentos
│
│   │   ├── caddyfile  # servidor Caddy
│
│   │   ├── mime.types  # tipos MIME
│
│   │   ├── capacitor.config.ts  # cópia de deploy mobile
│
│   │   ├── tauri.conf.json  # cópia de deploy desktop
│
│   │   ├── manifest.json  # manifesto PWA
│
│   │   ├── manifest.webmanifest  # manifesto web
│
│   │   ├── sitemanifest.json  # mapa do site
│
│   │   ├── icon.svg  # ícone
│
│   │   ├── favicon.ico  # favorito
│
│   │   ├── favicon.svg  # favorito
│
│   │   ├── icon32.png  # ícone 32
│
│   │   ├── icon64.png  # ícone 64
│
│   │   ├── icon128.png  # ícone 128
│
│   │   ├── design.html  # vitrine
│
│   │   ├── robots.txt  # robôs
│
│   │   ├── sitemap.xml  # mapa
│
│   │   ├── sw.ts  # service worker
│
│   │   ├── prisma/
│
│   │   │   └── schema.prisma  # schema do banco (Prisma vive dentro do tema)
│
│   │   ├── lobby/  # página = pasta = app
│
│   │   │   ├── Lobby.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── MatchList.tsx  # componente solto
│
│   │   │   └── SquadCard.tsx  # componente solto
│
│   │   ├── match/  # página = pasta = app
│
│   │   │   ├── Match.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── Hud.tsx  # componente solto
│
│   │   │   ├── Killfeed.tsx  # componente solto
│
│   │   │   └── Radar.tsx  # componente solto
│
│   │   ├── ranking/  # página = pasta = app
│
│   │   │   ├── Ranking.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── Leaderboard.tsx  # componente solto
│
│   │   │   └── SeasonCard.tsx  # componente solto
│
│   │   ├── inventory/  # página = pasta = app
│
│   │   │   ├── Inventory.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── WeaponGrid.tsx  # componente solto
│
│   │   │   └── LoadoutRow.tsx  # componente solto
│
│   │   ├── onboarding/  # página = pasta = app
│
│   │   │   ├── Onboarding.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── IntroSplash.tsx  # componente solto
│
│   │   │   └── StepTimeline.tsx  # componente solto
│
│   │   ├── login/  # página = pasta = app
│
│   │   │   ├── Login.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── LoginCard.tsx  # componente solto
│
│   │   │   └── OAuthRow.tsx  # componente solto
│
│   │   └── settings/  # página = pasta = app
│
│   │       ├── Settings.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │       ├── SensitivityTab.tsx  # componente solto
│
│   │       └── KeybindTab.tsx  # componente solto
│
│   ├── docs/  # documentação do app (referencia, não copia)
│
│   ├── tests/  # testes do app
│
│   │   └── scripts/  # scripts do app (TypeScript; não-JS em tests/scripts)
│
│   │       ├── task.ts  # tarefas da operação
│
│   │       └── release.ts  # ciclo de release
│
│   ├── package.json  # envelope do app
│
│   ├── bun.lock  # lock Bun
│
│   ├── tsconfig.json  # TS (mescla app+build+server)
│
│   ├── biome.json  # lint/format
│
│   ├── deno.json  # deno
│
│   ├── vitest.config.ts  # testes
│
│   ├── prisma.config.ts  # config do banco
│
│   ├── Dockerfile  # container único (todo o contexto, entrypoint em heredoc)
│
│   ├── .dockerignore  # ignora docker
│
│   ├── .env.example  # exemplo de ambiente
│
│   ├── .gitattributes  # atributos git
│
│   ├── .gitignore  # ignorados
│
│   ├── .npmrc  # registry
│
│   ├── .nvmrc  # versão do node
│
│   ├── pom.xml  # envelope Maven
│
│   ├── settings.xml  # settings Maven
│
│   ├── <nome>.csproj  # envelope NuGet
│
│   ├── <nome>.gemspec  # envelope RubyGems
│
│   ├── <Nome>.java  # núcleo Java
│
│   ├── <Nome>Distribution.cs  # distribuição .NET
│
│   ├── LICENSE  # licença
│
│   ├── README.md  # apresentação
│
│   ├── ARCHITECTURE.md  # arquitetura
│
│   ├── CHANGELOG.md  # novidades por versão (vira release notes)
│
│   ├── SECURITY.md  # segurança e disclosure
│
│   ├── CODEOWNERS  # donos do repo
│
│   ├── CONTRIBUTING.md  # como contribuir
│
│   ├── code-of-conduct.md  # conduta
│
│   ├── third-party-notices.md  # notices de terceiros
│
│   ├── match.ts  # lógica solta
│
│   ├── ranking.ts  # lógica solta
│
│   ├── weapons.ts  # lógica solta
│
│   ├── world.ts  # lógica solta
│
│   ├── spawner.ts  # lógica solta
│
│   ├── hud.ts  # lógica solta
│
│   ├── physics.ts  # lógica solta
│
│   ├── netcode.ts  # lógica solta
│
│   ├── editor.ts  # lógica solta
│
│   ├── ingest.ts  # lógica solta
│
│   ├── types.ts  # lógica solta
│
│   ├── utils.ts  # lógica solta
│
│   └── index.ts  # lógica solta
│
│
├── argan/ # DNS e gateway — zonas, registros, dnssec e handshake; biblioteca de rede do sistema
│
│   ├── Sol/  # o tema é a pasta — o nome é próprio; App.tsx, index.css, cópias de deploy e páginas DENTRO
│
│   │   ├── App.tsx  # âncora global — router: importa as subâncoras das páginas (DENTRO do tema, ao lado do index.css)
│
│   │   ├── index.css  # único CSS do tema — o nome é personalizável (index.css, sol.css ou o nome do tema)
│
│   │   ├── index.html  # entrada web
│
│   │   ├── icons.ts  # catálogo de ícones do tema
│
│   │   ├── control.shell.tsx  # shell compartilhado — solto na raiz do tema
│
│   │   ├── package.json  # envelope privado do tema
│
│   │   ├── pnpm-lock.yaml  # lock pnpm do tema
│
│   │   ├── pnpm-workspace.yaml  # workspace pnpm do tema
│
│   │   ├── tsconfig.json  # TS do tema
│
│   │   ├── tsconfig.node.json  # TS node do tema
│
│   │   ├── vite.config.ts  # build web
│
│   │   ├── devthink.toml  # config da plataforma (rotas de domínio, bindings, vars não-secretas)
│
│   │   ├── wrangler.toml  # config Cloudflare/Workers equivalente (deploy, bindings, rotas de domínio)
│
│   │   ├── .dev.vars.example  # exemplo dos segredos locais do wrangler dev — o .dev.vars real nunca commita
│
│   │   ├── vercel.json  # cópia de deploy Vercel
│
│   │   ├── netlify.toml  # cópia de deploy Netlify
│
│   │   ├── _headers  # cabeçalhos
│
│   │   ├── _redirects  # redirecionamentos
│
│   │   ├── caddyfile  # servidor Caddy
│
│   │   ├── mime.types  # tipos MIME
│
│   │   ├── capacitor.config.ts  # cópia de deploy mobile
│
│   │   ├── tauri.conf.json  # cópia de deploy desktop
│
│   │   ├── manifest.json  # manifesto PWA
│
│   │   ├── manifest.webmanifest  # manifesto web
│
│   │   ├── sitemanifest.json  # mapa do site
│
│   │   ├── icon.svg  # ícone
│
│   │   ├── favicon.ico  # favorito
│
│   │   ├── favicon.svg  # favorito
│
│   │   ├── icon32.png  # ícone 32
│
│   │   ├── icon64.png  # ícone 64
│
│   │   ├── icon128.png  # ícone 128
│
│   │   ├── design.html  # vitrine
│
│   │   ├── robots.txt  # robôs
│
│   │   ├── sitemap.xml  # mapa
│
│   │   ├── sw.ts  # service worker
│
│   │   ├── prisma/
│
│   │   │   └── schema.prisma  # schema do banco (Prisma vive dentro do tema)
│
│   │   ├── dashboard/  # página = pasta = app
│
│   │   │   ├── Dashboard.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── ZoneMap.tsx  # componente solto
│
│   │   │   └── QueryChart.tsx  # componente solto
│
│   │   ├── zones/  # página = pasta = app
│
│   │   │   ├── Zones.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── ZoneTable.tsx  # componente solto
│
│   │   │   └── ZoneEditor.tsx  # componente solto
│
│   │   ├── records/  # página = pasta = app
│
│   │   │   ├── Records.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── RecordTable.tsx  # componente solto
│
│   │   │   └── RecordForm.tsx  # componente solto
│
│   │   ├── dnssec/  # página = pasta = app
│
│   │   │   ├── Dnssec.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── KeyList.tsx  # componente solto
│
│   │   │   └── SignButton.tsx  # componente solto
│
│   │   ├── logs/  # página = pasta = app
│
│   │   │   ├── Logs.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── LogTable.tsx  # componente solto
│
│   │   │   └── TraceDetail.tsx  # componente solto
│
│   │   ├── onboarding/  # página = pasta = app
│
│   │   │   ├── Onboarding.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── IntroSplash.tsx  # componente solto
│
│   │   │   └── StepTimeline.tsx  # componente solto
│
│   │   ├── login/  # página = pasta = app
│
│   │   │   ├── Login.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── LoginCard.tsx  # componente solto
│
│   │   │   └── OAuthRow.tsx  # componente solto
│
│   │   └── settings/  # página = pasta = app
│
│   │       ├── Settings.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │       ├── ResolverTab.tsx  # componente solto
│
│   │       └── ThemeTab.tsx  # componente solto
│
│   ├── docs/  # documentação do app (referencia, não copia)
│
│   ├── tests/  # testes do app
│
│   │   └── scripts/  # scripts do app (TypeScript; não-JS em tests/scripts)
│
│   │       ├── task.ts  # tarefas da operação
│
│   │       └── release.ts  # ciclo de release
│
│   ├── package.json  # envelope do app
│
│   ├── bun.lock  # lock Bun
│
│   ├── tsconfig.json  # TS (mescla app+build+server)
│
│   ├── biome.json  # lint/format
│
│   ├── deno.json  # deno
│
│   ├── vitest.config.ts  # testes
│
│   ├── prisma.config.ts  # config do banco
│
│   ├── Dockerfile  # container único (todo o contexto, entrypoint em heredoc)
│
│   ├── .dockerignore  # ignora docker
│
│   ├── .env.example  # exemplo de ambiente
│
│   ├── .gitattributes  # atributos git
│
│   ├── .gitignore  # ignorados
│
│   ├── .npmrc  # registry
│
│   ├── .nvmrc  # versão do node
│
│   ├── pom.xml  # envelope Maven
│
│   ├── settings.xml  # settings Maven
│
│   ├── <nome>.csproj  # envelope NuGet
│
│   ├── <nome>.gemspec  # envelope RubyGems
│
│   ├── <Nome>.java  # núcleo Java
│
│   ├── <Nome>Distribution.cs  # distribuição .NET
│
│   ├── LICENSE  # licença
│
│   ├── README.md  # apresentação
│
│   ├── ARCHITECTURE.md  # arquitetura
│
│   ├── CHANGELOG.md  # novidades por versão (vira release notes)
│
│   ├── SECURITY.md  # segurança e disclosure
│
│   ├── CODEOWNERS  # donos do repo
│
│   ├── CONTRIBUTING.md  # como contribuir
│
│   ├── code-of-conduct.md  # conduta
│
│   ├── third-party-notices.md  # notices de terceiros
│
│   ├── index.ts  # lógica solta
│
│   ├── dns.ts  # lógica solta
│
│   ├── zone.ts  # lógica solta
│
│   ├── zonefile.ts  # lógica solta
│
│   ├── records.ts  # lógica solta
│
│   ├── dnssec.ts  # lógica solta
│
│   ├── doh.ts  # lógica solta
│
│   ├── doq.ts  # lógica solta
│
│   ├── dot.ts  # lógica solta
│
│   ├── handshake.ts  # lógica solta
│
│   ├── acme.ts  # lógica solta
│
│   ├── cache.ts  # lógica solta
│
│   ├── certs.ts  # lógica solta
│
│   ├── query.ts  # lógica solta
│
│   ├── resolver.ts  # lógica solta
│
│   ├── server.ts  # lógica solta
│
│   ├── serverweb.ts  # lógica solta
│
│   ├── monitoring.ts  # lógica solta
│
│   ├── publish.ts  # lógica solta
│
│   ├── ratelimit.ts  # lógica solta
│
│   ├── scrape.ts  # lógica solta
│
│   ├── errors.ts  # lógica solta
│
│   ├── types.ts  # lógica solta
│
│   ├── utils.ts  # lógica solta
│
│   └── web.ts  # lógica solta
│
│
├── ansi-art/ # arte ANSI — editor, galeria, fontes, conversão e exportação; features do soochimp absorvidas
│
│   ├── Sol/  # o tema é a pasta — o nome é próprio; App.tsx, index.css, cópias de deploy e páginas DENTRO
│
│   │   ├── App.tsx  # âncora global — router: importa as subâncoras das páginas (DENTRO do tema, ao lado do index.css)
│
│   │   ├── index.css  # único CSS do tema — o nome é personalizável (index.css, sol.css ou o nome do tema)
│
│   │   ├── index.html  # entrada web
│
│   │   ├── icons.ts  # catálogo de ícones do tema
│
│   │   ├── control.shell.tsx  # shell compartilhado — solto na raiz do tema
│
│   │   ├── package.json  # envelope privado do tema
│
│   │   ├── pnpm-lock.yaml  # lock pnpm do tema
│
│   │   ├── pnpm-workspace.yaml  # workspace pnpm do tema
│
│   │   ├── tsconfig.json  # TS do tema
│
│   │   ├── tsconfig.node.json  # TS node do tema
│
│   │   ├── vite.config.ts  # build web
│
│   │   ├── devthink.toml  # config da plataforma (rotas de domínio, bindings, vars não-secretas)
│
│   │   ├── wrangler.toml  # config Cloudflare/Workers equivalente (deploy, bindings, rotas de domínio)
│
│   │   ├── .dev.vars.example  # exemplo dos segredos locais do wrangler dev — o .dev.vars real nunca commita
│
│   │   ├── vercel.json  # cópia de deploy Vercel
│
│   │   ├── netlify.toml  # cópia de deploy Netlify
│
│   │   ├── _headers  # cabeçalhos
│
│   │   ├── _redirects  # redirecionamentos
│
│   │   ├── caddyfile  # servidor Caddy
│
│   │   ├── mime.types  # tipos MIME
│
│   │   ├── capacitor.config.ts  # cópia de deploy mobile
│
│   │   ├── tauri.conf.json  # cópia de deploy desktop
│
│   │   ├── manifest.json  # manifesto PWA
│
│   │   ├── manifest.webmanifest  # manifesto web
│
│   │   ├── sitemanifest.json  # mapa do site
│
│   │   ├── icon.svg  # ícone
│
│   │   ├── favicon.ico  # favorito
│
│   │   ├── favicon.svg  # favorito
│
│   │   ├── icon32.png  # ícone 32
│
│   │   ├── icon64.png  # ícone 64
│
│   │   ├── icon128.png  # ícone 128
│
│   │   ├── design.html  # vitrine
│
│   │   ├── robots.txt  # robôs
│
│   │   ├── sitemap.xml  # mapa
│
│   │   ├── sw.ts  # service worker
│
│   │   ├── prisma/
│
│   │   │   └── schema.prisma  # schema do banco (Prisma vive dentro do tema)
│
│   │   ├── home/  # página = pasta = app
│
│   │   │   ├── Home.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── AnsiHero.tsx  # componente solto
│
│   │   │   └── ShowcaseStrip.tsx  # componente solto
│
│   │   ├── editor/  # página = pasta = app
│
│   │   │   ├── Editor.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── AnsiCanvas.tsx  # componente solto
│
│   │   │   ├── CharPalette.tsx  # componente solto
│
│   │   │   └── ColorMapper.tsx  # componente solto
│
│   │   ├── gallery/  # página = pasta = app
│
│   │   │   ├── Gallery.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── AnsiThumb.tsx  # componente solto
│
│   │   │   └── ViewerModal.tsx  # componente solto
│
│   │   ├── fonts/  # página = pasta = app
│
│   │   │   ├── Fonts.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── FontList.tsx  # componente solto
│
│   │   │   └── FontPreview.tsx  # componente solto
│
│   │   ├── convert/  # página = pasta = app
│
│   │   │   ├── Convert.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── DropConvert.tsx  # componente solto
│
│   │   │   └── OutputPreview.tsx  # componente solto
│
│   │   └── export/  # página = pasta = app
│
│   │       ├── Export.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │       ├── FormatGrid.tsx  # componente solto
│
│   │       └── ExportBox.tsx  # componente solto
│
│   ├── docs/  # documentação do app (referencia, não copia)
│
│   ├── tests/  # testes do app
│
│   │   └── scripts/  # scripts do app (TypeScript; não-JS em tests/scripts)
│
│   │       ├── task.ts  # tarefas da operação
│
│   │       └── release.ts  # ciclo de release
│
│   ├── package.json  # envelope do app
│
│   ├── bun.lock  # lock Bun
│
│   ├── tsconfig.json  # TS (mescla app+build+server)
│
│   ├── biome.json  # lint/format
│
│   ├── deno.json  # deno
│
│   ├── vitest.config.ts  # testes
│
│   ├── prisma.config.ts  # config do banco
│
│   ├── Dockerfile  # container único (todo o contexto, entrypoint em heredoc)
│
│   ├── .dockerignore  # ignora docker
│
│   ├── .env.example  # exemplo de ambiente
│
│   ├── .gitattributes  # atributos git
│
│   ├── .gitignore  # ignorados
│
│   ├── .npmrc  # registry
│
│   ├── .nvmrc  # versão do node
│
│   ├── pom.xml  # envelope Maven
│
│   ├── settings.xml  # settings Maven
│
│   ├── <nome>.csproj  # envelope NuGet
│
│   ├── <nome>.gemspec  # envelope RubyGems
│
│   ├── <Nome>.java  # núcleo Java
│
│   ├── <Nome>Distribution.cs  # distribuição .NET
│
│   ├── LICENSE  # licença
│
│   ├── README.md  # apresentação
│
│   ├── ARCHITECTURE.md  # arquitetura
│
│   ├── CHANGELOG.md  # novidades por versão (vira release notes)
│
│   ├── SECURITY.md  # segurança e disclosure
│
│   ├── CODEOWNERS  # donos do repo
│
│   ├── CONTRIBUTING.md  # como contribuir
│
│   ├── code-of-conduct.md  # conduta
│
│   ├── third-party-notices.md  # notices de terceiros
│
│   ├── index.ts  # lógica solta
│
│   ├── ansi.ts  # lógica solta
│
│   ├── canvas.ts  # lógica solta
│
│   ├── charset.ts  # lógica solta
│
│   ├── color.ts  # lógica solta
│
│   ├── convert.ts  # lógica solta
│
│   ├── export.ts  # lógica solta
│
│   ├── figlet.ts  # lógica solta
│
│   ├── font.ts  # lógica solta
│
│   ├── frames.ts  # lógica solta
│
│   ├── glyph.ts  # lógica solta
│
│   ├── import.ts  # lógica solta
│
│   ├── ink.ts  # lógica solta
│
│   ├── palette.ts  # lógica solta
│
│   ├── parser.ts  # lógica solta
│
│   ├── render.ts  # lógica solta
│
│   ├── sauce.ts  # lógica solta
│
│   ├── sixteencolors.ts  # lógica solta
│
│   ├── tags.ts  # lógica solta
│
│   ├── types.ts  # lógica solta
│
│   └── utils.ts  # lógica solta
│
│
├── getry/ # gateway deployável — inferência v1-v5 com o meta-modelo devthink mascarado; só modelos tag-free; sem distribuição nenhuma (as versões web e next existem só como zip nos assets)
│
│   ├── Sol/  # o tema é a pasta — o nome é próprio; App.tsx, index.css, cópias de deploy e páginas DENTRO
│
│   │   ├── App.tsx  # âncora global — router: importa as subâncoras das páginas (DENTRO do tema, ao lado do index.css)
│
│   │   ├── index.css  # único CSS do tema — o nome é personalizável (index.css, sol.css ou o nome do tema)
│
│   │   ├── index.html  # entrada web
│
│   │   ├── icons.ts  # catálogo de ícones do tema
│
│   │   ├── control.shell.tsx  # shell compartilhado — solto na raiz do tema
│
│   │   ├── package.json  # envelope privado do tema
│
│   │   ├── pnpm-lock.yaml  # lock pnpm do tema
│
│   │   ├── pnpm-workspace.yaml  # workspace pnpm do tema
│
│   │   ├── tsconfig.json  # TS do tema
│
│   │   ├── tsconfig.node.json  # TS node do tema
│
│   │   ├── vite.config.ts  # build web
│
│   │   ├── devthink.toml  # config da plataforma (rotas de domínio, bindings, vars não-secretas)
│
│   │   ├── wrangler.toml  # config Cloudflare/Workers equivalente (deploy, bindings, rotas de domínio)
│
│   │   ├── .dev.vars.example  # exemplo dos segredos locais do wrangler dev — o .dev.vars real nunca commita
│
│   │   ├── vercel.json  # cópia de deploy Vercel
│
│   │   ├── netlify.toml  # cópia de deploy Netlify
│
│   │   ├── _headers  # cabeçalhos
│
│   │   ├── _redirects  # redirecionamentos
│
│   │   ├── caddyfile  # servidor Caddy
│
│   │   ├── mime.types  # tipos MIME
│
│   │   ├── capacitor.config.ts  # cópia de deploy mobile
│
│   │   ├── tauri.conf.json  # cópia de deploy desktop
│
│   │   ├── manifest.json  # manifesto PWA
│
│   │   ├── manifest.webmanifest  # manifesto web
│
│   │   ├── sitemanifest.json  # mapa do site
│
│   │   ├── icon.svg  # ícone
│
│   │   ├── favicon.ico  # favorito
│
│   │   ├── favicon.svg  # favorito
│
│   │   ├── icon32.png  # ícone 32
│
│   │   ├── icon64.png  # ícone 64
│
│   │   ├── icon128.png  # ícone 128
│
│   │   ├── design.html  # vitrine
│
│   │   ├── robots.txt  # robôs
│
│   │   ├── sitemap.xml  # mapa
│
│   │   ├── sw.ts  # service worker
│
│   │   ├── prisma/
│
│   │   │   └── schema.prisma  # schema do banco (Prisma vive dentro do tema)
│
│   │   ├── playground/  # página = pasta = app
│
│   │   │   ├── Playground.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── ChatCanvas.tsx  # componente solto
│
│   │   │   ├── ReasoningPane.tsx  # componente solto
│
│   │   │   └── ModelPicker.tsx  # componente solto
│
│   │   ├── monitor/  # página = pasta = app
│
│   │   │   ├── Monitor.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── NodeMap.tsx  # componente solto
│
│   │   │   ├── JuryVotes.tsx  # componente solto
│
│   │   │   └── LatencyBars.tsx  # componente solto
│
│   │   ├── logs/  # página = pasta = app
│
│   │   │   ├── Logs.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── LogTable.tsx  # componente solto
│
│   │   │   └── TraceDetail.tsx  # componente solto
│
│   │   ├── calibration/  # página = pasta = app
│
│   │   │   ├── Calibration.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── EceBins.tsx  # componente solto
│
│   │   │   └── ReliabilityCurve.tsx  # componente solto
│
│   │   └── providers/  # página = pasta = app
│
│   │       ├── Providers.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │       ├── KeyVaultCard.tsx  # componente solto
│
│   │       ├── RotationStatus.tsx  # componente solto
│
│   │       └── ModelRoster.tsx  # componente solto
│
│   ├── docs/  # documentação do app (referencia, não copia)
│
│   ├── tests/  # testes do app
│
│   │   └── scripts/  # scripts do app (TypeScript; não-JS em tests/scripts)
│
│   │       ├── task.ts  # tarefas da operação
│
│   │       └── release.ts  # ciclo de release
│
│   ├── package.json  # envelope do app
│
│   ├── bun.lock  # lock Bun
│
│   ├── tsconfig.json  # TS (mescla app+build+server)
│
│   ├── biome.json  # lint/format
│
│   ├── deno.json  # deno
│
│   ├── vitest.config.ts  # testes
│
│   ├── prisma.config.ts  # config do banco
│
│   ├── Dockerfile  # container único (todo o contexto, entrypoint em heredoc)
│
│   ├── .dockerignore  # ignora docker
│
│   ├── .env.example  # exemplo de ambiente
│
│   ├── .gitattributes  # atributos git
│
│   ├── .gitignore  # ignorados
│
│   ├── .npmrc  # registry
│
│   ├── .nvmrc  # versão do node
│
│   ├── pom.xml  # envelope Maven
│
│   ├── settings.xml  # settings Maven
│
│   ├── <nome>.csproj  # envelope NuGet
│
│   ├── <nome>.gemspec  # envelope RubyGems
│
│   ├── <Nome>.java  # núcleo Java
│
│   ├── <Nome>Distribution.cs  # distribuição .NET
│
│   ├── LICENSE  # licença
│
│   ├── README.md  # apresentação
│
│   ├── ARCHITECTURE.md  # arquitetura
│
│   ├── CHANGELOG.md  # novidades por versão (vira release notes)
│
│   ├── SECURITY.md  # segurança e disclosure
│
│   ├── CODEOWNERS  # donos do repo
│
│   ├── CONTRIBUTING.md  # como contribuir
│
│   ├── code-of-conduct.md  # conduta
│
│   ├── third-party-notices.md  # notices de terceiros
│
│   ├── index.ts  # lógica solta
│
│   ├── routes.ts  # lógica solta
│
│   ├── jury.ts  # lógica solta
│
│   ├── porter.ts  # lógica solta
│
│   ├── cache.ts  # lógica solta
│
│   ├── verdict.ts  # lógica solta
│
│   ├── prune.ts  # lógica solta
│
│   ├── gates.ts  # lógica solta
│
│   ├── weights.ts  # lógica solta
│
│   ├── cascade.ts  # lógica solta
│
│   ├── evidence.ts  # lógica solta
│
│   ├── guard.ts  # lógica solta
│
│   ├── memory.ts  # lógica solta
│
│   ├── trainer.ts  # lógica solta
│
│   ├── slicer.ts  # lógica solta
│
│   ├── doctree.ts  # lógica solta
│
│   ├── retrieve.ts  # lógica solta
│
│   ├── progressive.ts  # lógica solta
│
│   ├── summarizer.ts  # lógica solta
│
│   ├── models.ts  # lógica solta
│
│   ├── backoff.ts  # lógica solta
│
│   ├── circuitbreaker.ts  # lógica solta
│
│   ├── quota.ts  # lógica solta
│
│   ├── streaming.ts  # lógica solta
│
│   └── mcp.ts  # lógica solta
│
│
├── vault/ # clone deployável — só armazenamento e persistência: guarda os DBs da rede e recebe os backups; sem distribuição nenhuma
│
│   ├── Sol/  # o tema é a pasta — o nome é próprio; App.tsx, index.css, cópias de deploy e páginas DENTRO
│
│   │   ├── App.tsx  # âncora global — router: importa as subâncoras das páginas (DENTRO do tema, ao lado do index.css)
│
│   │   ├── index.css  # único CSS do tema — o nome é personalizável (index.css, sol.css ou o nome do tema)
│
│   │   ├── index.html  # entrada web
│
│   │   ├── icons.ts  # catálogo de ícones do tema
│
│   │   ├── control.shell.tsx  # shell compartilhado — solto na raiz do tema
│
│   │   ├── package.json  # envelope privado do tema
│
│   │   ├── pnpm-lock.yaml  # lock pnpm do tema
│
│   │   ├── pnpm-workspace.yaml  # workspace pnpm do tema
│
│   │   ├── tsconfig.json  # TS do tema
│
│   │   ├── tsconfig.node.json  # TS node do tema
│
│   │   ├── vite.config.ts  # build web
│
│   │   ├── devthink.toml  # config da plataforma (rotas de domínio, bindings, vars não-secretas)
│
│   │   ├── wrangler.toml  # config Cloudflare/Workers equivalente (deploy, bindings, rotas de domínio)
│
│   │   ├── .dev.vars.example  # exemplo dos segredos locais do wrangler dev — o .dev.vars real nunca commita
│
│   │   ├── vercel.json  # cópia de deploy Vercel
│
│   │   ├── netlify.toml  # cópia de deploy Netlify
│
│   │   ├── _headers  # cabeçalhos
│
│   │   ├── _redirects  # redirecionamentos
│
│   │   ├── caddyfile  # servidor Caddy
│
│   │   ├── mime.types  # tipos MIME
│
│   │   ├── capacitor.config.ts  # cópia de deploy mobile
│
│   │   ├── tauri.conf.json  # cópia de deploy desktop
│
│   │   ├── manifest.json  # manifesto PWA
│
│   │   ├── manifest.webmanifest  # manifesto web
│
│   │   ├── sitemanifest.json  # mapa do site
│
│   │   ├── icon.svg  # ícone
│
│   │   ├── favicon.ico  # favorito
│
│   │   ├── favicon.svg  # favorito
│
│   │   ├── icon32.png  # ícone 32
│
│   │   ├── icon64.png  # ícone 64
│
│   │   ├── icon128.png  # ícone 128
│
│   │   ├── design.html  # vitrine
│
│   │   ├── robots.txt  # robôs
│
│   │   ├── sitemap.xml  # mapa
│
│   │   ├── sw.ts  # service worker
│
│   │   ├── prisma/
│
│   │   │   └── schema.prisma  # schema do banco (Prisma vive dentro do tema)
│
│   │   ├── dashboard/  # página = pasta = app
│
│   │   │   ├── Dashboard.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── ClusterHealth.tsx  # componente solto
│
│   │   │   └── QuorumCard.tsx  # componente solto
│
│   │   ├── storage/  # página = pasta = app
│
│   │   │   ├── Storage.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── DbTable.tsx  # componente solto
│
│   │   │   └── ReconcileCard.tsx  # componente solto
│
│   │   ├── backups/  # página = pasta = app
│
│   │   │   ├── Backups.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── BackupQueue.tsx  # componente solto
│
│   │   │   └── IntegrityCheck.tsx  # componente solto
│
│   │   └── settings/  # página = pasta = app
│
│   │       ├── Settings.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │       ├── RetentionForm.tsx  # componente solto
│
│   │       └── EnvPanel.tsx  # componente solto
│
│   ├── docs/  # documentação do app (referencia, não copia)
│
│   ├── tests/  # testes do app
│
│   │   └── scripts/  # scripts do app (TypeScript; não-JS em tests/scripts)
│
│   │       ├── task.ts  # tarefas da operação
│
│   │       └── release.ts  # ciclo de release
│
│   ├── package.json  # envelope do app
│
│   ├── bun.lock  # lock Bun
│
│   ├── tsconfig.json  # TS (mescla app+build+server)
│
│   ├── biome.json  # lint/format
│
│   ├── deno.json  # deno
│
│   ├── vitest.config.ts  # testes
│
│   ├── prisma.config.ts  # config do banco
│
│   ├── Dockerfile  # container único (todo o contexto, entrypoint em heredoc)
│
│   ├── .dockerignore  # ignora docker
│
│   ├── .env.example  # exemplo de ambiente
│
│   ├── .gitattributes  # atributos git
│
│   ├── .gitignore  # ignorados
│
│   ├── .npmrc  # registry
│
│   ├── .nvmrc  # versão do node
│
│   ├── pom.xml  # envelope Maven
│
│   ├── settings.xml  # settings Maven
│
│   ├── <nome>.csproj  # envelope NuGet
│
│   ├── <nome>.gemspec  # envelope RubyGems
│
│   ├── <Nome>.java  # núcleo Java
│
│   ├── <Nome>Distribution.cs  # distribuição .NET
│
│   ├── LICENSE  # licença
│
│   ├── README.md  # apresentação
│
│   ├── ARCHITECTURE.md  # arquitetura
│
│   ├── CHANGELOG.md  # novidades por versão (vira release notes)
│
│   ├── SECURITY.md  # segurança e disclosure
│
│   ├── CODEOWNERS  # donos do repo
│
│   ├── CONTRIBUTING.md  # como contribuir
│
│   ├── code-of-conduct.md  # conduta
│
│   ├── third-party-notices.md  # notices de terceiros
│
│   ├── index.ts  # lógica solta
│
│   ├── catalog.ts  # lógica solta
│
│   ├── database.ts  # lógica solta
│
│   ├── quorum.ts  # lógica solta
│
│   ├── reconcile.ts  # lógica solta
│
│   ├── replication.ts  # lógica solta
│
│   ├── restore.ts  # lógica solta
│
│   ├── shard.ts  # lógica solta
│
│   ├── storage.ts  # lógica solta
│
│   ├── types.ts  # lógica solta
│
│   └── utils.ts  # lógica solta
│
│
├── forge/ # clone deployável — só running: roda qualquer binário com a engine saddle; sem distribuição nenhuma
│
│   ├── Sol/  # o tema é a pasta — o nome é próprio; App.tsx, index.css, cópias de deploy e páginas DENTRO
│
│   │   ├── App.tsx  # âncora global — router: importa as subâncoras das páginas (DENTRO do tema, ao lado do index.css)
│
│   │   ├── index.css  # único CSS do tema — o nome é personalizável (index.css, sol.css ou o nome do tema)
│
│   │   ├── index.html  # entrada web
│
│   │   ├── icons.ts  # catálogo de ícones do tema
│
│   │   ├── control.shell.tsx  # shell compartilhado — solto na raiz do tema
│
│   │   ├── package.json  # envelope privado do tema
│
│   │   ├── pnpm-lock.yaml  # lock pnpm do tema
│
│   │   ├── pnpm-workspace.yaml  # workspace pnpm do tema
│
│   │   ├── tsconfig.json  # TS do tema
│
│   │   ├── tsconfig.node.json  # TS node do tema
│
│   │   ├── vite.config.ts  # build web
│
│   │   ├── devthink.toml  # config da plataforma (rotas de domínio, bindings, vars não-secretas)
│
│   │   ├── wrangler.toml  # config Cloudflare/Workers equivalente (deploy, bindings, rotas de domínio)
│
│   │   ├── .dev.vars.example  # exemplo dos segredos locais do wrangler dev — o .dev.vars real nunca commita
│
│   │   ├── vercel.json  # cópia de deploy Vercel
│
│   │   ├── netlify.toml  # cópia de deploy Netlify
│
│   │   ├── _headers  # cabeçalhos
│
│   │   ├── _redirects  # redirecionamentos
│
│   │   ├── caddyfile  # servidor Caddy
│
│   │   ├── mime.types  # tipos MIME
│
│   │   ├── capacitor.config.ts  # cópia de deploy mobile
│
│   │   ├── tauri.conf.json  # cópia de deploy desktop
│
│   │   ├── manifest.json  # manifesto PWA
│
│   │   ├── manifest.webmanifest  # manifesto web
│
│   │   ├── sitemanifest.json  # mapa do site
│
│   │   ├── icon.svg  # ícone
│
│   │   ├── favicon.ico  # favorito
│
│   │   ├── favicon.svg  # favorito
│
│   │   ├── icon32.png  # ícone 32
│
│   │   ├── icon64.png  # ícone 64
│
│   │   ├── icon128.png  # ícone 128
│
│   │   ├── design.html  # vitrine
│
│   │   ├── robots.txt  # robôs
│
│   │   ├── sitemap.xml  # mapa
│
│   │   ├── sw.ts  # service worker
│
│   │   ├── prisma/
│
│   │   │   └── schema.prisma  # schema do banco (Prisma vive dentro do tema)
│
│   │   ├── dashboard/  # página = pasta = app
│
│   │   │   ├── Dashboard.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── RunnerHealth.tsx  # componente solto
│
│   │   │   └── ActiveRuns.tsx  # componente solto
│
│   │   ├── runtime/  # página = pasta = app
│
│   │   │   ├── Runtime.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── BinaryDrop.tsx  # componente solto
│
│   │   │   └── RunConsole.tsx  # componente solto
│
│   │   ├── sandboxes/  # página = pasta = app
│
│   │   │   ├── Sandboxes.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── SandboxList.tsx  # componente solto
│
│   │   │   └── ProfilePicker.tsx  # componente solto
│
│   │   └── logs/  # página = pasta = app
│
│   │       ├── Logs.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │       ├── RunTable.tsx  # componente solto
│
│   │       └── TraceFilter.tsx  # componente solto
│
│   ├── docs/  # documentação do app (referencia, não copia)
│
│   ├── tests/  # testes do app
│
│   │   └── scripts/  # scripts do app (TypeScript; não-JS em tests/scripts)
│
│   │       ├── task.ts  # tarefas da operação
│
│   │       └── release.ts  # ciclo de release
│
│   ├── package.json  # envelope do app
│
│   ├── bun.lock  # lock Bun
│
│   ├── tsconfig.json  # TS (mescla app+build+server)
│
│   ├── biome.json  # lint/format
│
│   ├── deno.json  # deno
│
│   ├── vitest.config.ts  # testes
│
│   ├── prisma.config.ts  # config do banco
│
│   ├── Dockerfile  # container único (todo o contexto, entrypoint em heredoc)
│
│   ├── .dockerignore  # ignora docker
│
│   ├── .env.example  # exemplo de ambiente
│
│   ├── .gitattributes  # atributos git
│
│   ├── .gitignore  # ignorados
│
│   ├── .npmrc  # registry
│
│   ├── .nvmrc  # versão do node
│
│   ├── pom.xml  # envelope Maven
│
│   ├── settings.xml  # settings Maven
│
│   ├── <nome>.csproj  # envelope NuGet
│
│   ├── <nome>.gemspec  # envelope RubyGems
│
│   ├── <Nome>.java  # núcleo Java
│
│   ├── <Nome>Distribution.cs  # distribuição .NET
│
│   ├── LICENSE  # licença
│
│   ├── README.md  # apresentação
│
│   ├── ARCHITECTURE.md  # arquitetura
│
│   ├── CHANGELOG.md  # novidades por versão (vira release notes)
│
│   ├── SECURITY.md  # segurança e disclosure
│
│   ├── CODEOWNERS  # donos do repo
│
│   ├── CONTRIBUTING.md  # como contribuir
│
│   ├── code-of-conduct.md  # conduta
│
│   ├── third-party-notices.md  # notices de terceiros
│
│   ├── index.ts  # lógica solta
│
│   ├── engine.ts  # lógica solta
│
│   ├── runner.ts  # lógica solta
│
│   ├── sandbox.ts  # lógica solta
│
│   ├── queue.ts  # lógica solta
│
│   ├── isolate.ts  # lógica solta
│
│   ├── wasm.ts  # lógica solta
│
│   ├── hardware.ts  # lógica solta
│
│   ├── schedule.ts  # lógica solta
│
│   ├── telemetry.ts  # lógica solta
│
│   ├── types.ts  # lógica solta
│
│   └── utils.ts  # lógica solta
│
│
├── foundry/ # clone deployável — roda, é uma sandbox e guarda: a união das camadas do vault e do forge; guardião da rede; sem distribuição nenhuma
│
│   ├── Sol/  # o tema é a pasta — o nome é próprio; App.tsx, index.css, cópias de deploy e páginas DENTRO
│
│   │   ├── App.tsx  # âncora global — router: importa as subâncoras das páginas (DENTRO do tema, ao lado do index.css)
│
│   │   ├── index.css  # único CSS do tema — o nome é personalizável (index.css, sol.css ou o nome do tema)
│
│   │   ├── index.html  # entrada web
│
│   │   ├── icons.ts  # catálogo de ícones do tema
│
│   │   ├── control.shell.tsx  # shell compartilhado — solto na raiz do tema
│
│   │   ├── package.json  # envelope privado do tema
│
│   │   ├── pnpm-lock.yaml  # lock pnpm do tema
│
│   │   ├── pnpm-workspace.yaml  # workspace pnpm do tema
│
│   │   ├── tsconfig.json  # TS do tema
│
│   │   ├── tsconfig.node.json  # TS node do tema
│
│   │   ├── vite.config.ts  # build web
│
│   │   ├── devthink.toml  # config da plataforma (rotas de domínio, bindings, vars não-secretas)
│
│   │   ├── wrangler.toml  # config Cloudflare/Workers equivalente (deploy, bindings, rotas de domínio)
│
│   │   ├── .dev.vars.example  # exemplo dos segredos locais do wrangler dev — o .dev.vars real nunca commita
│
│   │   ├── vercel.json  # cópia de deploy Vercel
│
│   │   ├── netlify.toml  # cópia de deploy Netlify
│
│   │   ├── _headers  # cabeçalhos
│
│   │   ├── _redirects  # redirecionamentos
│
│   │   ├── caddyfile  # servidor Caddy
│
│   │   ├── mime.types  # tipos MIME
│
│   │   ├── capacitor.config.ts  # cópia de deploy mobile
│
│   │   ├── tauri.conf.json  # cópia de deploy desktop
│
│   │   ├── manifest.json  # manifesto PWA
│
│   │   ├── manifest.webmanifest  # manifesto web
│
│   │   ├── sitemanifest.json  # mapa do site
│
│   │   ├── icon.svg  # ícone
│
│   │   ├── favicon.ico  # favorito
│
│   │   ├── favicon.svg  # favorito
│
│   │   ├── icon32.png  # ícone 32
│
│   │   ├── icon64.png  # ícone 64
│
│   │   ├── icon128.png  # ícone 128
│
│   │   ├── design.html  # vitrine
│
│   │   ├── robots.txt  # robôs
│
│   │   ├── sitemap.xml  # mapa
│
│   │   ├── sw.ts  # service worker
│
│   │   ├── prisma/
│
│   │   │   └── schema.prisma  # schema do banco (Prisma vive dentro do tema)
│
│   │   ├── dashboard/  # página = pasta = app
│
│   │   │   ├── Dashboard.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── RunnerHealth.tsx  # componente solto
│
│   │   │   └── QuorumCard.tsx  # componente solto
│
│   │   ├── runtime/  # página = pasta = app
│
│   │   │   ├── Runtime.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── BinaryDrop.tsx  # componente solto
│
│   │   │   └── RunConsole.tsx  # componente solto
│
│   │   ├── storage/  # página = pasta = app
│
│   │   │   ├── Storage.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── DbTable.tsx  # componente solto
│
│   │   │   └── ReconcileCard.tsx  # componente solto
│
│   │   ├── backups/  # página = pasta = app
│
│   │   │   ├── Backups.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │   │   ├── BackupQueue.tsx  # componente solto
│
│   │   │   └── RestoreButton.tsx  # componente solto
│
│   │   └── settings/  # página = pasta = app
│
│   │       ├── Settings.tsx  # subâncora — importa e, na fase final, funde os componentes da pasta
│
│   │       ├── ProfilePicker.tsx  # componente solto
│
│   │       └── EnvPanel.tsx  # componente solto
│
│   ├── docs/  # documentação do app (referencia, não copia)
│
│   ├── tests/  # testes do app
│
│   │   └── scripts/  # scripts do app (TypeScript; não-JS em tests/scripts)
│
│   │       ├── task.ts  # tarefas da operação
│
│   │       └── release.ts  # ciclo de release
│
│   ├── package.json  # envelope do app
│
│   ├── bun.lock  # lock Bun
│
│   ├── tsconfig.json  # TS (mescla app+build+server)
│
│   ├── biome.json  # lint/format
│
│   ├── deno.json  # deno
│
│   ├── vitest.config.ts  # testes
│
│   ├── prisma.config.ts  # config do banco
│
│   ├── Dockerfile  # container único (todo o contexto, entrypoint em heredoc)
│
│   ├── .dockerignore  # ignora docker
│
│   ├── .env.example  # exemplo de ambiente
│
│   ├── .gitattributes  # atributos git
│
│   ├── .gitignore  # ignorados
│
│   ├── .npmrc  # registry
│
│   ├── .nvmrc  # versão do node
│
│   ├── pom.xml  # envelope Maven
│
│   ├── settings.xml  # settings Maven
│
│   ├── <nome>.csproj  # envelope NuGet
│
│   ├── <nome>.gemspec  # envelope RubyGems
│
│   ├── <Nome>.java  # núcleo Java
│
│   ├── <Nome>Distribution.cs  # distribuição .NET
│
│   ├── LICENSE  # licença
│
│   ├── README.md  # apresentação
│
│   ├── ARCHITECTURE.md  # arquitetura
│
│   ├── CHANGELOG.md  # novidades por versão (vira release notes)
│
│   ├── SECURITY.md  # segurança e disclosure
│
│   ├── CODEOWNERS  # donos do repo
│
│   ├── CONTRIBUTING.md  # como contribuir
│
│   ├── code-of-conduct.md  # conduta
│
│   ├── third-party-notices.md  # notices de terceiros
│
│   ├── index.ts  # lógica solta
│
│   ├── engine.ts  # lógica solta
│
│   ├── runner.ts  # lógica solta
│
│   ├── sandbox.ts  # lógica solta
│
│   ├── database.ts  # lógica solta
│
│   ├── shard.ts  # lógica solta
│
│   ├── backup.ts  # lógica solta
│
│   ├── quorum.ts  # lógica solta
│
│   ├── reconcile.ts  # lógica solta
│
│   ├── catalog.ts  # lógica solta
│
│   ├── storage.ts  # lógica solta
│
│   ├── telemetry.ts  # lógica solta
│
│   ├── types.ts  # lógica solta
│
│   └── utils.ts  # lógica solta
│
│
```

## contagem do exemplo

| aplicativo | páginas na árvore | lógicas soltas na raiz | papel |
|---|---|---|---|
| devthink | 35 | 85 | OS e superplataforma, o absorvedor final |
| saddle | 15 | 25 | sandbox e runner de VM |
| debonair | 8 | 19 | áudio e DAW, com a engine katexis |
| cadria | 8 | 14 | vídeo e imagem, com a engine versawase |
| stealhead | 7 | 13 | jogo FPS |
| argan | 8 | 25 | DNS e gateway de rede |
| ansi-art | 6 | 21 | arte ANSI |
| getry | 5 | 25 | gateway deployável, sem distribuição |
| vault | 4 | 11 | clone que só guarda |
| forge | 4 | 12 | clone que só roda |
| foundry | 5 | 14 | clone que roda e guarda |

## a super plataforma, as distribuições da família e o catálogo de actions e workflows

### a super plataforma e os concorrentes executáveis

O DevThink é a superplataforma, e isso significa que ele é o concorrente direto de todos os grandes de uma vez: o concorrente direto do Windows 10 e do Windows 11 (porque ele é o OS que carrega todos os aplicativos que a pessoa precisa), o concorrente direto do Chrome e do Brave (porque a interface dele é o navegador, a área de aplicativos e o explorer no mesmo corpo), e o concorrente direto do Gemini e do Claude (porque a interface que recebe o gateway é o próprio DevThink). A tradução dos recursos dos concorrentes em aplicativos dentro do DevThink é a regra de ouro: cada feature dos concorrentes vira um aplicativo do catálogo, e o que sobra de especial é que a plataforma também EXECUTA os aplicativos dos concorrentes por dentro — a engine de binários do saddle roda o exe e o apk de qualquer concorrente, então o Call of Duty (o concorrente do StealHead), o Blender, o Brave e qualquer aplicativo da Steam abrem dentro do DevThink pelo rodador de binários. Os aplicativos próprios de edição do DevThink são os de nome normal (o editor de vídeo, o estúdio de música, o editor de imagem), e eles puxam as engines da família por baixo: o editor de vídeo roda na versawase do cadria, o estúdio de música roda na katexis do debonair, e as interfaces do DevThink vestem o mesmo padrão de design da casa (a mistura Chrome, Brave, Trello, Windows 10 e 11 e Apple Silicon). Durante os workflows de pipeline o DevThink também é convertido para a distribuição de sistema operacional — o ISO instalável — porque o sistema é leve demais para pesar na máquina e se sustenta pelo domínio.

### a distribuição ISO instalável e as distribuições da família

A distribuição ISO é a pegada mínima que uma máquina carrega do DevThink: a lane `iso` do release.yml corta o `devthink-v<versão>-install.iso` com o xorriso a partir do conjunto base do release, e dentro da imagem vêm os sources tar.xz, o tarball do npm e os instaladores `install.sh` e `install.ps1`, com o README dizendo a doutrina — o sistema se sustenta pelo domínio e tudo o mais sobe por HTTPS. A distribuição WASM compila os núcleos puros das engines da família (a versawase do cadria e a katexis do debonair) com o esbuild do repositório e o toolchain javy quickjs em módulos `.wasm`, empacotados no `devthink-v<versão>-wasm.tar.xz` para a sandbox wasm do saddle montar em execução. As seis registros (npmjs, o registro npm do GitHub, maven, nuget, rubygems e o índice ghcr de cinco arquiteturas) já publicam pelo publish.yml com uma lane family para cada aplicativo, o npm publica com provenance SLSA de fábrica, e a distribuição por aplicativo segue o padrão tar.xz -9e com o zip reservado às plataformas que o exigem. Todo asset novo entra no guarda-chuva SHA256SUMS automaticamente porque a lane releaseassets varre os artefatos `release-*` e o githubrelease publica o conjunto verificado.

### o catálogo de actions e workflows do GitHub

O catálogo de actions e workflows da família nasce da lista que o dono recolheu do marketplace e dos starters do GitHub (o arquivo `actions e woflows catealogos.md`), e cada entrada mapeia para uma lane real do monorepo: o Webpack ganha a lane própria de transformação (`webpack.yml`, que empacota o bundle do core com o webpack como verificação de empacotador cruzado), o Publish Node.js Package e o Publish Node.js Package to GitHub Packages já são as lanes npmjs e family-githubnpm do publish.yml, o Java with Maven e o Publish Java Package with Maven já são as lanes family-maven, o Docker image e o Publish Docker Container já são o índice ghcr, o Next.js Pages já é o pages.yml da família, o SLSA Generic generator já é a provenance do npm publish, e o Labeler ganha a lane própria (`labeler.yml` com o `.github/labeler.yml`) que rotula os pull requests pelas pastas que tocam. As entradas de automação (Stale, Greetings, AI issue summary) e de marketplace (TruffleHog, Super Linter, Cache, GH Release, OpenCommit, jscpd) ficam registradas aqui como catálogo disponível: entram como lane quando o dono mandar, e nenhuma configuração leva segredo no repositório — os tokens moram nos secrets das pipelines.

### a árvore pura e o contrato de sincronia das tabelas

A árvore de cada aplicativo fica do jeito que o dono determinou: na raiz do app só a lógica em TS, o package.json e os configs de framework, as pastas docs e tests, e o tema Sol — nada de pasta prisma, public, dist, web, assets ou build, porque o schema prisma é ARQUIVO dentro do tema (como no devthink) e o drizzle.config.ts também mora dentro do tema. A raiz de cada app carrega o conjunto completo de configuração (`.npmrc`, `.nvmrc`, `.gitignore`, `.gitattributes`, `.dockerignore`, `.env.example`) e o tema carrega o conjunto completo de plataforma (headers, redirects, robots, manifest, mime.types, caddyfile, netlify.toml, vercel.json, wrangler.toml, tauri.conf.json, capacitor.config.ts, tsconfig.node.json, pnpm-workspace.yaml, README), sem faltar arquivo e sem arquivo sobrando — e o ajuste de organização é feito nos importes dos arquivos que já existem, não criando arquivos novos; dentro do tema Sol o único stylesheet é o index.css da raiz. A sincronia das tabelas segue o contrato da família: a tabela do mesmo kind carrega as mesmas colunas e os mesmos ponteiros em todos os aplicativos que a têm — ponteiro de identidade é texto, contador é inteiro de 32 bits, tempo é datetime ou texto ISO, e ponteiro de escala de bytes (tamanhos, comprimentos, offsets) é BigInt de 64 bits, o ponteiro que guarda terabytes; o rowid autoincrement do sqlite já é de 64 bits pelo contrato do motor. O devthink é o mestre do contrato, o schema.prisma de dentro do tema é a documentação de registro e o DDL de boot do db.ts espelha as mesmas colunas, com o RenderJob como o primeiro kind sincronizado entre cadria e debonair (mesma tabela, mesmo ponteiro canônico `status`). O override do biome fica geral — `**/*`, todos os arquivos, sem nome de arquivo no include — e o padrão de escrita dos módulos segue o JSDoc 2026 com as lógicas correlatas agrupadas em blocos hierárquicos sincronizados.
