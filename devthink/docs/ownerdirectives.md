# ownerdirectives

o cânon completo das diretrizes do dono da família devthink. este documento complementa o owner directives básico anterior, que o próprio dono declarou incompleto e com nomes errados de aplicativos, e conecta, sincroniza, hierarquiza e categoriza as regras, metas, features, expectativas e reclamações que estavam espalhadas pelos relatórios de leitura das pastas de antes e de depois de z. os cinco documentos vivos continuam no lugar: a lei operacional no lei, o dossiê dos aplicativos no apps, o estado auditado no operacao, o censo de segurança no seguranca e as ações no checklist.

## título e escopo

- este documento consolida a palavra do dono lida integralmente nos corpora: conversa51 (88.642 linhas), conversa52 (114.615 linhas), ordens (1.903 linhas), ordens1 (2.356 linhas), checklist (1) (6.579 linhas), feedssd (1.828 linhas), fedsd (1.564 linhas, subconjunto confirmado do feedssd), polarauth (10.160 linhas) e os dois arquivos pasted idênticos
- substitui o rascunho básico de 91 linhas que o dono reprovou: básico, incompleto e incorreto nos nomes dos aplicativos
- os erros de escrita dos nomes são intencionais, plantados pelo dono para provar leitura integral: cada garble decodificado vira regra de identificação, nunca duplicação de app
- toda reclamação registrada em qualquer texto, commit ou conversa é ordem imediata de mudança: reclamação significa regra
- números citados pelo dono são números-base, pisos mínimos, praticamente ilimitados; exemplo citado é ilustração, nunca obrigação de copiar igual
- ordem canônica de execução: infra verde primeiro, saddle com foco exclusivo, vault do zero, design do devthink, demais aplicativos por categoria linear, engines de áudio e vídeo por último

## as leis globais de operação

- a leitura vem antes de qualquer operação: primeiro analise, primeiro leia integralmente, de cima a baixo, linear, hierárquico, progressivo, por seção, frase e milímetro, sem atalhos, cortes seletivos ou pulos, sem perder micro e macro detalhes
- leitura exclusivamente via terminal: bash, sed, grep e awk em segmentos de linha x a y, nunca ferramenta direta de leitura; subagentes seguem a mesma lei
- verificação de autenticação antes de tudo: o token do github é conferido contra a api viva antes de qualquer alteração; não autenticado, o polar auth roda em background com captura em tempo real (device flow do gh cli, escada de escopos full, med, min e safe separados por vírgula, poller e watchdog destacados com setsid e nohup, janela renovável de seis horas)
- regra 45 do polar auth: uma vez autorizado, nunca mais sondar; o token vitalício vive em arquivo próprio com permissão 0600, o estado unificado num único diretório da raiz do projeto, o vocabulário único authorized, pending e failed
- nada em /tmp: o estado da sessão vive em /home/z/my-project, porque o /tmp evapora entre sessões
- veículo assinado iakadion: toda mudança aterrissa por branch datada, pull request e squash merge; os commits nascem verificados com a identidade do dono, nunca identidade de máquina, nunca x-access-token
- nunca force push: a main é protegida com checks reais, um review, codeowner, dismiss stale e linear history; o sync é sempre do remoto para o local, jamais o reverso
- worklog append-only fora do repositório: nunca entra no repo, o fechamento dele é o critério de conclusão da onda
- subagentes por categoria: cinco a sete simultâneos por categoria, até trezentos, seiscentos ou novecentos por operação, cada um começa com análise integral da fase antes de tocar em código, ignora frentes já ocupadas e avança sem atrapalhar; nunca git para subagentes; nunca bash para escrever ou mover código fonte
- ondas lineares: tudo numa onda só, do mais fácil para o mais difícil, um por um, meta por meta, reclamação por reclamação, agrupado por tema e categoria; pendência não fica para a próxima onda; prometer para depois é defeito
- verificação real via browser na produção (wenathlan.github.io/devthink e /panel): a sandbox parece normal mesmo com a produção quebrada, a validação exige render, não só http 200
- build e teste rodam nos runners do github, nunca na máquina local; workflows pesados, sobretudo os do saddle, são despachados e acompanhados por projeção de verde, nunca esperados ociosos
- honestidade radical: nunca anunciar erro antes de corrigir, não sei explícito, screenshot como verdade, nada de vou fazer sem fazer, zero dado falso, mock ou teatro

## os onze aplicativos da família

a superplataforma self-hosted tem onze aplicativos, cada um dono exclusivo da engine do seu domínio. o dono escreve errado de propósito; a tabela decodifica o cânon e corrige os nomes:

| aplicativo | papel | engine | concorrente | como o dono escreve |
|---|---|---|---|---|
| devthink | o sistema operacional e envelope do monorepo, o dev team do dono, janela principal da família | orquestração, node maestro | github, gitlab, grok, chatgpt, desktop | devtink, devtank, devteam, devthing, devtech, vinhthin, devinhthin, devdink, debitink, david tink, david tincktomely, devthinke, devrhink, deftin.com, davitinpro, bitik, dev thing, davidinho |
| debonair | áudio, música, voz e inteligência sonora, estúdio completo | kathesis | suno, flow music, fl studio mobile, youtube music | debonai, debonai com a cirílico, debনাi com caracteres bengalis, debonite, debomite, the bonai, debonire, debonar, debana, debo9, bonai |
| cadria | vídeo, imagem, malha tridimensional e shaders | versawaze | blender, raybox, capcut, after effects, premiere, davinci | cadre, cadrea, cadrria, kadra, cadia, cader, kader, cada, cade, cadaria |
| cobaia | superfície pública de monetização | — | — | sem garble mapeado |
| forge | runner de binários e execução pura na sandbox | — | — | forge.webpack (que não é app), ford |
| foundry | pipeline completo com sandbox e banco de rede | — | e2b, docker | sem garble mapeado |
| getry | biblioteca e gateway universal de inteligência artificial | — | chatgpt, google | gettry, gerrty, gatory, gettryy com dois y, gertroid, gatorade |
| saddle | a engine mestre de virtualização, vm, sandbox e microvm de borda | — | oracle, virtualbox, sandboxes de código | seddle, sedo, sedol, settle, sedal, ssaddle, sed o, seda, sedum, cero, rooney |
| stealthhead | a plataforma de jogo fps, sobrevivência e battle | — | — | stealthead, stealhead, sealthhead, stealthhear, stelath heaf |
| vault | armazenamento e persistência de borda | — | supabase, s3, drizzle | vout, volt, valt, vaut, valkyrie (apelido) |
| argan | rede, borda e gateway dns | — | cloudflare, aws | argam |

- correção de identificador: aimdebonite.app é com.debonair.app, e o padrão da família é com.wenathlan.app; pontos apenas onde a identificação do pacote exige, priorizando o nome único devthink
- e2ugh, maene, gateway e extension são pacotes antigos pré-devthink que ficaram nos registros: entram só como fonte da união de dependências dos nove repositórios históricos (devthink, maene, extension, gateway, saddle, nb, allan, devthinkiakadion, e2ugh), nunca como aplicativos da família
- termos correlatos decodificados: windjets, windgets, indigets e wing jets são wingets; better skill 3 e betasql lite 3 são better-sqlite3; bimotypes e mimo-types são mimetypes; boom é bun; grapenios é grapheneos; omashi é omarchy; marsh e mauruos são maru os; 2b é e2b; daitona é daytona; navercel é vercel; netleaf é netlify; codefar é cloudflare; trilly e tryke são trylle.com (a referência de design); katexis, catesis e k-test são kathesis; versawase e versus waze são versawaze; py lloyd é pylloyd (executor python em node); alan, allen e ala são o repositório allan; relays são releases; sets são assets; lames e lentes são lanes; mescla e mecla são merge; bompar e bumpa são bump; comicios e grupos são commits; radicodagem é conteúdo hardcoded; docks e dots são docs

## regras de engenharia

- zero hardcode em ts e tsx: nenhuma informação textual vive no código; texto, imagem, ícone e asset dinâmico vivem no banco e são puxados no build via apis internas com acessores tipados; engines são cegas, aplicativos têm face; só configs e testes podem ter dados fixos; sha256 gerada no build, nunca hardcoded em workflow (os 24 sítios já varridos)
- zero lógica duplicada entre aplicativos: cada app é dono exclusivo da engine do seu domínio e os demais consomem via dependência de pacote no package.json, nunca por caminho de pasta; storage é vault, vm é saddle, gateway é getry, rede é argan, áudio é debonair, vídeo é cadria, monetização é cobaia, execução é forge, pipeline é foundry, fps é stealthhead, os é devthink; a biblioteca tridimensional é compartilhada entre cadria e debonair via dependência interna
- reagrupamento por palavra chave: um arquivo único por responsabilidade consolidando de mil até sete mil lógicas correlatas (as casas citadas: 900, 1000, 4000 e 7000), nome de palavra única minúscula, cheia, direta, sem hífen, underscore, ponto interno, emoji, ansi art ou vibe code; o logics.ts genérico morre; variantes dispersas se fundem no arquivo do domínio
- testes exclusivamente em typescript na raiz da pasta tests de cada aplicativo, sem subpastas, sem json, sem mjs, sem cjs, sem imagens; simulação de carga de dados só nos testes; 477 arquivos de prova, zero não-ts; vitest de 900 a 1000 passos verdes antes de cada push
- dentro de cada aplicativo apenas as três pastas: sol (o tema, único css no sol.css), tests e docs; o ts puro vive na raiz do aplicativo, antes da pasta do tema; build direto na raiz (publish ponto, outdir ponto), nunca em dist; a raiz do monorepo carrega a pasta .github, as onze pastas dos aplicativos e exatamente dois arquivos, o gitignore e o package.json
- design windows 11 mais trylle.com em nível de prêmios internacionais: fidelidade de 97 a 99% ao index de referência do allan; tema sol único branco, nunca amarelo, com variação apenas clara e escura; fluent icons obrigatórios em tudo; ban list: lucide-react, transition all, pretos e brancos puros, indigo, violeta, azul genérico, neon, emoji como ícone, bordas brancas em vidro; titlebar 28/30px com close rgb(232,17,35), taskbar 48px acrílica, start 640px, accent gelo, foco, pill 999px, alvos de toque de 44px, microanimações de até 200ms só com transform e opacity, zoom travado via viewport; a mesma identidade para web, desktop, cli, tv, extensão e binário, diferindo só apresentação, responsividade e dpi; a cli é a mesma interface do chat
- jsdoc hierárquico 2026 em toda função exportada; código, comentários, interface e nomes em inglês integral; componentes em pascalcase nos wingets, flat, alfabéticos, sem pasta aninhada; documentos da operação em português brasileiro, minúsculas, frases completas, sem emoji
- união de dependências sem remoção: os onze manifests carregam a união dos package.json dos nove repositórios históricos, 22 a 32 mil dependências toleradas, os três blocos idênticos por união; o manifest da raiz carrega exclusivamente as engines, com o node maestro orquestrando mais de quinze engines; qemu e vm só no saddle
- estrutura didática pronta para a futura conversão de typescript para rust; arquivos de conversão nomeados com o aplicativo mais a extensão alvo, como vault.kts; docker compose e docker config unificados num único dockerfile por projeto

## as casas de distribuição

- a casa de workflows tem seis arquivos: ci, containers, maintenance, publish, release e security, mais os dois cfg de labeler e actionlint; cerca de 19.794 linhas e 126 jobs auditados; ordem do dono de 2026-11-18: manter a arquitetura atual e reagrupar por feature, nunca por path; o audit dos 1.795 commits da main comprova zero features perdidas nos 45 arquivos históricos de cinco eras
- seis distribuições por aplicativo (nuget, maven, container, gradle, npmjs e rubygems) resultam em mais de sessenta pacotes publicados; onze canais no total: npmjs, github packages, go get, maven, nuget, gradle, rubygems, docker, cargo, pypi e homebrew
- lanes de publicação por registro: npm com 32 assentos, maven com 44, nuget com 30, rubygems com 52, container com 13; o containers builda 47 lanes quando os envelopes npm chegam
- o container do saddle é o exótico da família: doze arquiteturas com os perfis máximo, equilibrado e leve, mais os catálogos de sistema (grapheneos, omarchy, maru os, vanilla os, v, arch, alpine, debian, nixos, void, fedora, postmarketos, android e linux, dezesseis assentos de os); a distribuição normal vem sem o prefixo v e senta acima da grapheneos no registro
- a distribuição webpack vive embutida no envelope original de cada pacote, a lei da fusão do rung 2.0.177: os pacotes avulsos com sufixo .webpack foram mortos e os assentos zerados nos registros; webpack é o workflow que cria a distribuição
- releases com mais de mil assets, com a meta escalando para três mil: a v2.0.185 tem 947, a v2.0.184 tem 962, a v2.0.183 tem 140; a recuperação acontece na 2.0.186, hoje em 840 no stamp corrente
- o buraco do npmjs: os envelopes @wenathlan estão travados em 2.0.181, porque as 2.0.185 nunca publicaram; a cascata do publish fecha o buraco de 181 até 186
- maven publica exclusivamente como com.wenathlan.app, o escopo antigo io.github.wenathlan é deletado; o artefato único embute library core, cli, headless e mcp server como recursos do jar, com extension zip e declarations zip como classifiers
- crons do repositório mantidos verbatim: codeql quarta 4:25, scorecard segunda 3:17, limpeza de cache diária 3:17 e 15:17, escada de dependências segunda 4:37, stale 5:47; a preocupação dos dez gigabytes de cache é da sandbox zai, não dos crons do repo
- cache por processo: cada workflow limpa o próprio cache ao terminar, reaproveita durante, limpa depois; cancelar runs obsoletos de heads stale libera executores

## metas e números-alvo

| meta | número |
|---|---|
| ações da operação | base de 5.000 a 6.000 ações, praticamente ilimitado; todolist interna de 10.000+ |
| commit assinado | a cada 900 ações na ordem original, refinado para 400 a 600 ações ou fronteira de onda |
| bump de versão | a cada 100, 600 ou 700 grandes ações, uma única vez no fim com tudo verde |
| fases e ondas | 100+ fases, 100+ ondas, 102 ondas datadas; relógio de uma hora por bateria |
| subagentes | 5 a 7 simultâneos por categoria, 300 a 900 por operação |
| tarefas de conserto | até 900 por frente |
| vitest | 900 a 1000 passos verdes antes de cada push; baseline família de 6.650 a 7.192 pernas verdes |
| commits auditados | escada de 1.513 até 1.900 (1.795 no audit real, 358 tocando workflows) |
| pacotes publicados | 60+ (6 distribuições x 11 aplicativos) |
| canais de distribuição | 11 |
| arquiteturas | 11 (12 com o assento unknown) |
| lanes do saddle | 15+ com perfis máximo, equilibrado e leve; 12 arch |
| assentos de os no container saddle | 16 |
| modalidades do saddle | 90 (81 live + 9 host) |
| assets por release | 500, depois 1.000+, depois 3.000+ |
| releases no arco 2.0.97 até 3.0 | 500+ |
| mimetypes | 4.000+ tipos (ouro debian 28.583, realidade 4.133) |
| protocolos https | 100, 200 e 1000 |
| engines orquestradas | 15+ (catálogo v 0.5.2) |
| lógicas por arquivo keyword | 1.000 a 7.000 (casas 900, 1000, 4000 e 7000) |
| dependências na união | 22.000 a 32.000 toleradas; 43.636 declarações no censo |
| workflows reagrupados | 1.500+ históricos, 80 etapas obrigatórias sem pular nenhuma |
| rung pós-verde | 2.0.186, 12 manifests em lockstep, changelog em cascata |
| buraco do npmjs | 181 até 186 a fechar pela cascata do publish |

## as reclamações r01-r25

cada reclamação do dono é ordem imediata. estado verificado na onda de 2026-11-20:

| id | reclamação | estado atual |
|---|---|---|
| r01 | raiz suja, logics.ts, txt avulsos | pendente (onda de estrutura) |
| r02 | lógicas duplicadas por dez e por onze, dispersas | pendente (reagrupar 4.000 a 7.000 por arquivo keyword) |
| r03 | branches sem merge | cumprida: todas mescladas, só a main resta |
| r04 | pull request aberto sem merge | cumprida: zero prs abertos, os pendentes #676 a #682 mesclados |
| r05 | approval de release quebrado | pendente: approval como iakadion após o verde |
| r06 | assets 429 contra 1.000+ | em curso: a v2.0.186 está em 840, a meta é 1.000+ |
| r07 | versões regredidas 2.1.6 e 2.1.7 | curada na curva 2.0.x lockstep; o npmjs segue no 2.0.181, buraco a fechar |
| r08 | workflows vermelhos desde o commit 29c24c4 | casa de 6 consolidada; as lanes aguardam o stamp pós-consolidação |
| r09 | pages parado, deployment parado | pendente: o deploy restaura depois do containers verde |
| r10 | my files horrível, 2gb travado, salvando no navegador | pendente (vault real, onda do zero) |
| r11 | design falso e mockado em tudo | pendente (zero hardcode, dados no banco via apis) |
| r12 | saddle.webpack não se encaixa | cumprida: assentos .webpack zerados nos registros, a variante fundida no pacote original |
| r13 | seis distribuições congeladas | pendente (destravar os 60+ assentos) |
| r14 | container do saddle não publicado | pendente (publicar com 15+ lanes e perfis) |
| r15 | security não resolvido | em curso: mistune 3.3.4 curado nos onze manifests com 22 alertas do dependabot a fechar no re-scan; os 2 alertas do scorecard (testes de ci e sast) aguardam runs verdes |
| r16 | apps.txt hardcode, ícones em cdn | pendente (ícones no banco, estáticos nos domínios) |
| r17 | sol falso em aplicativos sem sentido | pendente (componente de obra em construção honesto) |
| r18 | nginx ausente em aplicativos | pendente (padronizar os configuráveis) |
| r19 | 400+ assets perdidos nas v183 e v184 | a v2.0.183 tem 140; a recuperação acontece na 186 |
| r20 | workflows pesados travando a operação | doutrina vigente: despachar e seguir, cache limpo por processo |
| r21 | token não gravado em tempo real | cumprida: polar auth com captura em tempo real, token vitalício ativo |
| r22 | cli, tv e extensão sem o mesmo design | pendente (interface unificada) |
| r23 | sha256 hardcoded em 24 sítios | pendente (gerar no build) |
| r24 | extensão defasada | pendente (atualizar via assets do release) |
| r25 | janela cortada via /panel, x fora no resize, login preto, sombra no login | pendente (render do painel igual ao fullscreen) |

- queixas correlatas registradas fora da numeração: os 27 runs fantasma em fila documentados como anomalia do lado do github, o publish.yml gigante já reagrupado na casa de 6, os dois domínios ripados do argan a restaurar, a falha fa1.db do faun que nunca se repete (banco isca, download bloqueado), as 22 a 31 chaves nvidia em texto plano a rotacionar antes de qualquer publish, o aviso de que outro agente segue ativo na mesma mesa

## o cadence e os veículos

- commit assinado a cada 400 a 600 ações executadas ou na fronteira de cada onda: branch datada, pull request, squash merge, identidade iakadion, commits verificados
- o bump acontece uma única vez, no fim, depois de tudo resolvido e verde: a tag sai da main curada, porque a árvore congelada da 185 falha os próprios testes
- curva 2.0.x somente, a regressão 2.1.6 e 2.1.7 nunca retorna: doze manifests em lockstep (raiz mais onze aplicativos), changelog antes do sync, a versão idêntica nos doze
- vitest de 900 a 1000 passos verdes antes de cada push, tsc zero, biome zero, actionlint verde; cada erro corrigido bumpa o manifest
- cadeia de cura linear vigente: merge dos prs, ci verde na main, release train da 2.0.186, cascata do publish (o npmjs fecha o buraco de 181 até 186), containers nas 47 lanes, deploy do pages, tudo verde, bump no fim
- a cada fronteira fechada o ciclo retoma exatamente na linha onde parou: ler, mapear, abrir a branch, deixar verde, mesclar na main e voltar à linha

## os diferimentos

- engines kathesis do debonair e versawaze da cadria por último, com mais cuidado: até lá shells, design e lógicas de superfície; a fase dois abre as engines de fato, sem interface, porque engines não têm face, aplicativos têm
- getry hands-off enquanto outro agente trabalha nele: lane de verificação externa apenas, não perturbar, avançar para a próxima frente
- stealthhead no ritmo do dono: hoje só o componente de jogo em construção; os alvos (5 mapas, 50+ armas, 10+ personagens, 5 modos e 15 veículos) esperam a hora do dono
- conversão de typescript para rust: apenas a estrutura didática pronta, sem execução agora
- onda profunda do devthink os (35 páginas nativas, 45 telas, 3.420 componentes) depois das frentes de infra e distribuição

## as clarificações de 2026-11-20

- crons: a preocupação dos dez gigabytes é da sandbox zai, não do repositório; os crons do repo ficam (codeql, scorecard, limpeza de cache, escada de dependências e stale); a sandbox zai tem zero crons, verificado
- charts/devthink: o pacote nunca foi ordenado pelo dono; a lane helm foi retirada do publish (pr #682) e o pacote deletado do ghcr
- assentos .webpack: já zerados nos 54 pacotes dos registros, verificado nesta onda; a terceira rodada de reclamação está resolvida com a variante fundida no pacote original
- os 27 runs fantasma em fila: documentados como anomalia do lado do github (409 na cancela, não canceláveis); congestionam a fila sem ser defeito da árvore
- outro agente segue ativo na mesma mesa: o checkout misterioso e os prs #680 e #681 apareceram de frente independente e foram mesclados sem atrito; a doutrina de ignorar frentes ocupadas permanece

## a lei final

- a leitura vem antes de qualquer operação: primeiro analise, primeiro leia integralmente, mapeie os detalhes micro e macro, só depois execute
- nada pula: nem linha, nem etapa, nem reclamação, nem onda
- a hierarquia é linear: do mais fácil ao mais difícil, um por um, por categoria, até terminar
- tudo numa onda só: pendência não fica para a próxima, prometer para depois é defeito
