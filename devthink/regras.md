# regras.md — regras do dono, hierárquicas

Fonte: C:\allan2\devthink\StealHead\docs\StealHead\md\session7-so-user.txt (seção USER, linhas 1–1106, 28 Set → 18 Out 2026), lida por segmentos via sed. O mapa bruto por segmento está em regras.mapa.md. As regras ficam acima; exemplos e estados entram como "por exemplo" separado.

## 1. Regras gerais

A plataforma é uma super plataforma, concorrente direta de Windows 10, Windows 11, Brave, Chrome, Codex, ChatGPT, OpenAI, Anthropic, ZAI, Google, Grok, T3, OpenCode, Supabase, Cloudflare, E2B e de todo harness de agente. O DevThink é o OS completo que abriga aplicativos, e os outros aplicativos da família são aplicativos, nunca OS. Toda feature dos concorrentes entra como feature nossa, traduzida em aplicativos dentro do tema. A comunicação toda é via HTTPS e mimetypes, nada toca em hardware físico do usuário (GPU, CPU, vGPU, vCPU, IndexedDB, localStorage, armazenamento), a única coisa que carrega na máquina dele é a interface, e todo processamento e armazenamento acontecem nos nossos domínios e engines.

| Regra | Conteúdo |
| --- | --- |
| Identidade | Continue com DevThink; login único em todos os sites da família; DBs compartilhados |
| Fallback de domínio | devthink.pro cai → redireciona para os clones (Netlify, Vercel vitalícios); template universal serve qualquer deploy |
| Sem captcha | A plataforma é livre, sem captcha |
| Permissões de usuário | Criar times, grupos, usuários, IAs virtuais, MCPs, APIs, sites, componentes; IA do sistema é universal; hierarquia free, pro, enterprise (sponsor) + doações |
| Opt-in | Tudo configurável: LLM, sandbox, memória, GPU, CPU, threads, cores, temas (criar, misturar, importar, exportar), chaves, hostings; defaults hardcoded mas personalizáveis |
| Biblioteca universal | Lógica na raiz sem hardcodagem, distribuída em npm, maven, containers, com módulo Spring Boot; qualquer um usa e adapta |

## 2. Design

O design do DevThink é a fusão do Windows 10 e do Windows 11 com trylle.com, e é o único app com design de OS. Os outros aplicativos têm o design de aplicativo, padrão Apple Silicon, Awards Design, Webflow, trylle.com puro, no nível do index.html de web. O design é universal para web, TV, desktop, CLI, binário, extensão e APK: muda só aspect ratio (tablet, notebook e PC são horizontais, celular vertical), DPI, responsividade e o método de build. O design atual do DevThink está reprovado: refazer e reescrever do zero, sem reciclar, com ícones bonitos e animados, mesmas interações, animações e posições do Windows, bordas arredondadas (nada de pílula), start menu flutuante, elementos flutuantes, sem dots, sem hífens, sem verbosidade, sem fontes amadoras, sem roxo ou azul genérico de vibe code, sem neon, sem cinza marrom, sem grade rígida no desktop, com sombras, efeitos de vidro e curvas profissionais, texturas e receitas de tokens profissionais, dark e light definidos, scroll cuidado e micro e macro animações em tudo, incluindo a animação da logo no estilo de cline.bot e a fusão de ícones das dezenove bibliotecas (Iconic, Phosphor, Hero, Feather, Meteor, Material, Basicons, Flowbite, Nonicons, Sargam, Lucide, Mage, Fluent UI, Tabler, Iconoir, Hugeicons, MynaUI, Remix Icon, Radix Icons).

| Regra | Conteúdo |
| --- | --- |
| Referências | C:\allan\docs\neodevthink, neodocs\lookup.exdevthink, neodocs\outros.akash, neoskills, neoimg, index.html de web, exemplo.txt, repositories.md, designeer.md, concorrentes clonados em C:\allan\docs\temp |
| Top bar | Estilo Windows: aplicativos fixados por ícone, nome só no hover |
| Start menu | Abre ao clicar no ícone do DevThink (logo na frente, sem nome), flutuante, sem botão start |
| Ícones | Animados, três camadas (caminhos, contorno, fundo interno com gradiente se movendo), fundo externo opcional |
| Janelas | Todo aplicativo abre em uma janela igual do Windows, minimizar, maximizar, fechar; hover no topo da tela mostra os controles |
| Sem Lucide React | Proibido; design próprio e moderno |
| Taskbar | Clique na logo abre a caixa de pinados com interação de Windows, sem highlight indevido na caixa de pesquisa |
| Textos | Curtos, diretos, claros; sem dots, sem "passe o mouse para", sem "clique na engrenagem", sem emojis |
| Tudo em inglês | Tradução só quando a pessoa muda o idioma nas configurações, via API Google GTX (translate.js) |

## 3. Fluxo de telas

Existem duas intros e uma sequência única. A intro da web é a página de apresentação do index.html, cara de SaaS institucional, e a intro do binário, da extensão e da distribuição é a mesma da web. Depois da intro vem a tela de horário com paisagem, a tela de bloqueio estilo Android onde a pessoa puxa para cima, a tela de login estilo Windows moderno (perfil, nome, senha), e por último o painel. No build compilado para binário ou ISO a sequência é a do Windows: logo carregando, paisagem, bloqueio, login, tela inicial de aplicativos. O usuário salva credencial e senha no DB no primeiro uso, sem dados falsos.

| Etapa | Web | Binário, ISO, extensão, APK |
| --- | --- | --- |
| 1 | Intro SaaS do index.html | Logo carregando animada |
| 2 | Clique no sininho → tela de login do OS | Tela de horário com paisagem |
| 3 | Painel | Bloqueio (puxar para cima), login Windows |
| 4 | — | Tela inicial de aplicativos |

## 4. Arquitetura

A pasta do aplicativo tem a pasta do tema (Sol, nome alterável), docs e tests, e mais nada: sem src (exceção do template Next), sem public, dist, assets, ui, build, deploy, db, data, prisma. O build acontece na raiz, por cima de si mesmo, nos computadores do GitHub. A âncora geral é o App.tsx na raiz, que importa a âncora do tema, o sol.tsx dentro do tema junto do sol.css; o sol.tsx importa as subâncoras de cada pasta; a subâncora recebe o nome da pasta (settings.tsx dentro de settings) e importa os componentes da própria pasta; sempre com export no final. Dentro de sol cada pasta é um aplicativo ou página, sem subpasta dentro de subpasta, sem pasta apps, sem pasta components: o componente vive na pasta da página a que pertence, ou vem importado de outra pasta ajustado ao contexto. O único TSX fora do tema é o App.tsx. As lógicas gerais ficam na raiz do aplicativo, antes do tema, escritas em TypeScript puro, trêscentas ou novecentas lógicas correlatas agrupadas por arquivo por responsabilidade, em blocos hierárquicos, lineares, progressivos e sincronizados, comentados com hashtag, JSDoc 2026, tudo minúsculo, nomes com ponto em vez de hífen (auth.ts, clean.url.ts), palavras chave únicas e curtas, e as lógicas específicas de interface ficam dentro do tema. Um CSS só por tema, o sol.css, dentro do tema; index.html é o único HTML da raiz; 404, terms e policies são componentes TSX compilados pelo workflow.

| Regra | Conteúdo |
| --- | --- |
| Arquivos de raiz obrigatórios | redirects, robots.txt, keywords.txt, manifest.json, manifest.webmanifest, .npmrc, .nvmrc, .gitignore, .gitattributes, .dockerignore, biome.json, tsconfig, vercel.json, netlify.toml, wrangler, devthink.toml, schema prisma na raiz, package.json idêntico em todos |
| Pastas proibidas | src (exceto Next), public, dist, assets, ui, build, deploy, db, data, prisma, components, apps, os |
| Workflows | YML dentro de .github/workflows, agrupados por função (publicação, manutenção, conversão next), etapas aplicadas app por app, Saddle por último; sem sha256 hardcoded; sem workflows pagos; release imutável com checksum |
| Releases | Uma tag e uma release do DevThink com ~200 assets (iso, vsix, exe, dmg, deb, rpm, AppImage, ipa, apk, zip, next), tar.xz máximo + Brotli; excluir tags, releases e pacotes npm dos outros apps; versões next em <app>.next personalized, 50, zai, normal |
| Conversão next | Workflow converte o padrão sem src para os formatos next e sobe compactado nos assets, sem pasta duplicada |
| Configs 2026 | Toda dependência, devDependency e arquivo de configuração na última versão latest, patterns e sintaxe 2026, bumpar até tudo verde |
| Domain | Nunca hardcodar domínio em sitemap, robots ou código |

## 5. Dados e armazenamento

O DB é o repo virtual: guarda código, assets e informações exatamente como o repositório, e é nele que toda hardcodagem acontece. Nenhum componente, engine ou workflow hardcoda informação; texto, informação, emoji, imagens e links são ingeridos no DB e puxados por fetch, com marcadores no componente apontando a tabela e o item, e a build estática responde de um módulo seed em memória, sem escrever storage do navegador. A stack de armazenamento é Git LFS com objetos git e blobs dentro dos DBs, libgit2, Drizzle ORM, Prisma Schema, MySQL2, Better SQLite3 e JSON, tudo numa lógica unificada, no padrão dos arquivos db.ts, sandbox.ts, compiler.ts e ingest.ts da referência StealHead. O schema prisma fica na raiz, sem pasta prisma, e as tabelas SQL são sincronizadas entre todos os aplicativos, com os mesmos campos e ponteiros, BigInt para terabytes. Cada usuário tem o seu DB, os DBs são considerados HDs dentro do sistema, e o usuário cria novos HDs nas configurações. Os DBs são criptografados, as APIs só respondem para sites autorizados cadastrados pelo dono, e acessar DevTools registra o IP e bloqueia a pessoa em todos os sites, sites em branco, mesmo com VPN.

| Regra | Conteúdo |
| --- | --- |
| Sem Supabase | Infra self-hosted própria, sem limites |
| Sandbox | Vinte a trinta modalidades: runtime via Wasm, Babel, Node, Bun, Deno e as engines; completa via Saddle com drivers e CPU, GPU virtuais, perfis light, max, balanceado; VFS sustentado por Prisma e Git; via CDN (esm.sh e as quarenta e cinco CDNs) |
| Saddle | É o projeto de sandboxes tipo E2B, a engine do Rune, roda qualquer binário e sandbox, containers Docker e GHCR; Foundry é clone de E2B e Docker (interface e configurações, engine no Saddle); Vault é clone do Supabase e a biblioteca de armazenamento que todos importam; Getry é o gateway (adaptação Next para deploy da Z.ai e next normal, versões bypass e da Z.ai) |
| Cadria | Engine VersaWaze, motor de 3D, imagem, vídeo e animação, referências Blender, Remotion, DaVinci, After Effects, Gemini image, Veo |
| Debonair | Engine de áudio e música tipo Suno, estúdio de música |
| Imports | Sem lógica duplicada: o app que precisa de imagem importa Cadria, de áudio importa Debonair, de sandbox importa Saddle, de armazenamento importa Vault; DevThink junta todos importando deles |
| Stealthhead | Jogo FPS pré-compilado (shaders e assets prontos, hash verificado), nunca compila na máquina do visitante, só navegação a mexer |
| Cobaia | Site clone de monetização (Google Ads, MRR, conversão, planos): cliques dos sites principais redirecionam invisivelmente para ele, que fecha anúncios; sites principais limpos; também roda bot de automação para sustentar os domínios |

## 6. Rotas e interação (estado do GitHub Pages)

As rotas do DevThink publicadas estão bugadas e seguem a regra do /nome do app. A rota do painel troca entre a caixa de aplicativos e o painel, alternando sozinha; rotas estranhas do tipo w/l_id/s/l_id/t/l_id/chat aparecem quando devia ser /chat, porque aquilo pertence ao aplicativo de chat; clicar em Cadria, Debonair, Argan, Forge, Vault ou Saddle deve ir para devthink/nome do app e abrir DENTRO da janela do DevThink, com a mesma interface, e hoje sai para o design errado; a pasta os existe dentro de devthink e não deveria existir, tudo nela vai para sol adaptado e ela é deletada; o painel existe mas não aparece na grade de aplicativos; a tela do painel fica preta e psicodélica; a caixa de login está ruim; os aplicativos nativos (vídeo, imagem, áudio, calculadora, docs, chat, sobre, intro, onboarding, exploring) precisam ser refeitos do zero e iguais entre si; o texto logo original da intro de web voltou no lugar do texto grosso.

## 7. Operação

A operação é por segmentos de leitura com sed de linha X a Y no terminal, nunca com a ferramenta de leitura de arquivo, até seis mil linhas por corte conforme o tamanho, e subagentes de dois ou três por vez, lançando o próximo assim que um termina, com o dono autorizando por pull auth via comandos git quando preciso. Tudo é lido de forma hierárquica, linear, de cima para baixo, com início, meio e fim, to-do list por tema com subderivações até cem passos cada, e os verificadores de teste rodam primeiro: tsc noEmit, biome, seguranças, tudo verde antes de seguir. Nada é instalado dentro das pastas: a execução puxa do node_modules global em C:\Users\nathalan\node_modules, os scripts de teste ficam na pasta tests de cada aplicativo, escritos em TypeScript (cjs permitido), e os builds pesados acontecem nos computadores do GitHub. Escrita de documento é parágrafo seguido de tabela, sempre terminando em tabela, sem citação de documento ou linha lida, sem emoji, desduplicando conceito, contexto e sinônimo iguais, com ortografia e gramática corretas, tom profissional em terceira pessoa, e o que foge do modelo atual entra como plano anterior, nunca riscado.

| Regra | Conteúdo |
| --- | --- |
| Verificação | Code Security do GitHub zerado; páginas publicadas testadas de verdade (sandbox abre, chat responde, gateway funciona) |
| Simulação | Controlar o Brave do dono em nova janela, uma aba por vez, abrir, capturar, interagir e fechar; mapear site via DevTools antes de automatizar |
| Documento por tela | tela.<site>.md com design, telas e fluxo de interação, depois consolidado em telas-design.md |
| Segurança de código | Repositório público: nada hardcodado no código, gerado nas pipelines; sem chave hardcoded |
