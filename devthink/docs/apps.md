# apps

o dossiê completo dos onze aplicativos da superplataforma e suas engines, consolidado, deduplicado e agrupado por sentido correlato. cada aplicativo é dono exclusivo da sua engine, os demais importam via dependência.

## devthink

- o sistema operacional e envelope do monorepo, janela principal da família, consome as demais engines como biblioteca
- concorrente de github, gitlab, grok, chatgpt e do sistema operacional de desktop
- dono da orquestração, do fluxo de entrada, do onboarding em janela, do gerenciador e da cli como subaplicativo
- a cli é a mesma interface do aplicativo de chat, mesmo design e interação no terminal, funcionando ao instalar o pacote ou baixar o binário
- a extensão de navegador é praticamente igual à infraestrutura do host de código, com pareamento por código autorizado pelo proprietário, o servidor estático serve a extensão, se o site está no ar o servidor está no ar
- deploy múltiplo: serve estaticamente em qualquer plataforma, clones em múltiplas plataformas sincronizados no mesmo banco por protocolos e apis internas
- recursos: intro ordinal persistente no banco, gerenciador de janelas, navbar flutuante, dock, calendário acoplado, página de explore, sistema de arquivos próprio
- absorveu do saddle o que não é virtualização, como o scraper, e a feature de geração de música
- pendências: design reformulado no padrão de referência, zero hardcode nos componentes, tela de produção estável, bugs de janela e rolagem zerados, pacote principal publicado em todos os canais

## debonair

- a engine kathesis de áudio, música, voz e inteligência sonora
- concorrente de suno, flow music, fl studio mobile e youtube music
- estúdio musical completo: mixer, rack de efeitos, transporte, síntese, mixagem, masterização, sampler, biblioteca de amostras
- a ingestão reversa de música é a promessa principal: decomposição de música completa em payload estruturado e reconstrução tocável rodando na sandbox, sem tocar navegador, gpu ou cpu do visitante
- a lei do payload tem versões: a terceira define dezenas de parâmetros, faixa de blob por hash, taxas de amostragem distintas para reconhecimento e render, codificação binária proibida no payload
- o próximo passo é separar as stems e ingerir dados de referência nos bancos da engine
- já existe método pronto nos blobs antigos da área de estudo que reconstrói a música toda num json e reingere
- pendências: engine real, pesquisa aprofundada documentada, integração com as modalidades do saddle

## cadria

- a engine versawaze de vídeo, imagem, malha tridimensional, shaders e inteligência visual
- concorrente de blender, raybox, capcut, after effects, premiere e davinci
- dona de vídeo e imagem: timeline, render, efeitos, player, editor, controle de camadas, movimentos, rigs
- pipeline de pixels completo: brilho, contraste, saturação, sépia, escala de cinza, convolução, desfoque, redimensionamento
- o encoder de vídeo real é pendência central
- compartilha a biblioteca tridimensional com o debonair via dependência interna
- pendências: engine real, encoder funcional, integração com o saddle

## saddle

- a engine mestre de virtualização, runner de vm, sandbox e microvm, concorrente de oracle, virtualbox e sandboxes de código
- noventa modalidades independentes: wasm, webpack, babel, arquivo virtual, sistema de arquivos virtual, docker, execução direta de binários via fila de lançamento, emulação com drives reais, node, gpu virtual, cpu virtual, processamento de portas, sandbox, microvm, runner, hardware virtual, execução de scripts e interpretação de yaml com compilação em background
- o diferencial: nunca toca o navegador, gpu, cpu ou disco do visitante, tudo roda no hardware virtual de borda na internet, funcionando em plataformas estáticas
- o container é o exótico da família: mais de quinze lanes com perfis máximo, equilibrado e leve, distribuindo sistemas operacionais completos emulados dentro do container
- sistemas no catálogo: alpine, nixos, arch, debian, fedora, windows, android, grapheneos, omarchy, maru, vanilla, postmarket, lineage, calyx e a linguagem v
- mantém embutida a integração, a cli e os pacotes do fluxo de distribuição do bundler de módulos, descartando arquivos avulsos
- funções alheias a execução, vm e sandbox são removidas
- o projeto original é comparado com a versão integrada para restaurar capacidades perdidas
- pendências: modalidades registradas sem executor real, container publicado, lanes no espelho de containers, execução de docker e binários completa

## vault

- a engine de armazenamento, concorrente self-hosted de supabase, s3 e drizzle
- reconstruída do zero em cinco pilares: conta em runtime, bloqueio de download do banco, catálogo de mime types na casa dos milhares, https na casa das centenas, quota configurável
- camada principal em sqlite melhorado com mysql, drizzle, prisma, git lfs, libgit, blobs e ponteiros
- bucket self-hosted que serve a infraestrutura para qualquer pessoa ou aplicativo externo
- banco isca servindo sondas anônimas com projetos falsos plausíveis, base real selada
- objetos git como verdade, chunks de um mebibyte, deduplicação por hash
- o limite de dois gigabytes do sistema de arquivos é removido, configurável até ilimitado
- cada aplicativo vem com o sistema de armazenamento embutido puxando dos bancos centrais
- pendências: desbloqueio da quota, app de arquivos reformulado, protocolos espelhados em todos

## getry

- a biblioteca e gateway universal de inteligência artificial
- concorrente de chatgpt e google
- autenticação de provedores, rotação de chaves, raciocínio em níveis, rotas compatíveis com o padrão openai
- cinco provedores e trinta e cinco rotas conforme cadastro, números dependem do que o usuário cadastrar, sem trava fixa
- júri de três modelos com regra anti bajulação, cofre de chaves
- pendências: engine real, gateway funcional

## forge

- o clone deployável de execução pura, runner de binários na sandbox consumindo a engine do saddle
- executa binários pesados de concorrentes via fila de lançamento
- pendências: fila completa, execução real de binários

## foundry

- o clone deployável de pipeline completo, sandbox e banco de rede consumindo saddle e vault
- execução de estágios, artefatos no storage, interface clone de e2b e docker, controle administrativo, chunks de yaml, tar comprimido, mime types
- pendências: pipeline real end to end

## argan

- a biblioteca de rede, borda e gateway dns
- concorrente de cloudflare e aws
- zonas dns com registro raiz, subdomínios, dnssec com rotação, transportes completos, cluster de réplicas, email self-hosted, meta buscador próprio, publicação de domínios em sete passos
- dona de cleanurl, mimetypes, familyurl e keywords
- registros nunca excluem, apenas alteram
- pendências: domínios suspensos publicados, gateway real

## stealthhead

- a plataforma de jogo fps, sobrevivência e battle
- controle total de cena, malha, rig, inventários, personagens, armas, veículos, netcode e matchmaking real no banco
- mundo pré compilado, física determinística
- nomes hardcoded nas colunas do banco, nunca no código
- editor que absorve física, áudio, raio x, camadas, arena, player e combate
- hud por flags por dispositivo no build
- o app pequeno baixa o banco do site
- hoje exibe apenas o componente de jogo em construção
- pendências: mundo real, multiplayer, combate

## cobaia

- a superfície pública de monetização
- planos de receita recorrente, espaços de anúncio honestos, links de apoio, badges, roster, billing, rastreamento de receita e churn
- pendências: monetização viva hoje, catálogo de quarenta formas de monetização mapeadas

## engines do catálogo

- node é o maestro orquestrando mais de quinze engines: bun, cargo, corepack, deno, pnpm, babel, yaml, python com executor no node, go, rust, ruby e a linguagem v
- as engines não têm cara, o aplicativo tem cara
- engines ilimitadas, universais, opt-in e personalizáveis, limitação exclusivamente pela lógica comercial de planos dentro do sistema principal
