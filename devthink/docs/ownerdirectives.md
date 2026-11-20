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

## o apêndice das lacunas fechadas (a extensão do cânon)

o apêndice fecha as lacunas que o dono apontou no relatório básico: as features exigidas por aplicativo, o estado medido do repositório, o worklog da onda lockheal, os números-âncora faltantes e as âncoras do cânon integral. o conteúdo vem da leitura integral do corpus consolidado (conversa52 114.615 linhas, ordens1 2.579, checklist gen-2 6.920) e nada do que já vivia no documento é repetido — a lei é somar sem apagar, desduplicando.
# ownerdirectives — extensão

este rascunho fecha as cinco lacunas apontadas pelo dono no ownerdirectives.md do repo: as features exigidas por aplicativo, a fotografia do repositório na medição via api de 2026-11-16, o worklog da onda lockheal, os números-âncora que faltavam e as âncoras do cânon integral consolidado. as fontes são a segunda geração do checklist de upload (seções 4, 5, 9, 10, 11 e 14) e o consolidado integral, das leis mãe à ordem de execução. nada do que já vive no documento do repo se repete aqui; a mescla final no arquivo vivo cabe à frente de docs do repo.

## 1. as features exigidas por aplicativo

os mandados categorizados por aplicativo, na ordem da seção 9 do owner directives pt. os números são números-base, pisos mínimos, praticamente ilimitados; exemplo citado é ilustração, nunca obrigação de copiar igual.

### devthink

- 35 páginas nativas, 45 telas e 3.420 componentes, a onda profunda do os já diferida no documento vivo
- janelas windows 11 reais: taskbar, start, snap, alt-tab e jump lists; boot verificado; menu iniciar com avatar e power acrílico sticky; explorador win11; snap com 8 alças
- chat flagship com 7 subagentes e o oitavo sumarizador; checkpoints em cascata com prevalência da última edição; sandbox provisionada no nascimento da conversa
- store de modelos, plugins, temas e runners; mcp e automação em todos os aplicativos
- enxame de agentes com leader, workers e critics; o verdict engine tem 16 membros: porter, júri, cache, gates, weights, cascade, evidence, guard, slicer, doctree, retrieve, summarizer, memory, trainer e calibration
- explore público com rail; navegador embedded com consent gates
- planos free, pro e enterprise existem exclusivamente no devthink; cadastro único sincronizado entre todos os aplicativos
- extensão de navegador, tv e mobile com o mesmo design; oauth google, github e gitlab com continue with devthink e pkce s256
- my files estilo este computador, com hds e barra de capacidade real; página de pagamento com 2 visões
- gtx language picker com 12 idiomas; verificação via browser no site público wenathlan.github.io/devthink

### saddle

- 90 modalidades de vm, sandbox e microvm (81 live e 9 host): wasm, webpack, babel, virtual file, docker, aws, node, vfs, container dock, e2b, daytona, wasme, exe, binário, shs, yml e yaml, vgpu, vcpu, gpu, cpu, portas, sandbox, microvm, runner e hardware virtual
- rodar docker, exe e binário via queuebinarylaunch; executar shs, yml e yaml via babel; qemu com firecracker, gvisor, nsjail e wasmtime
- perfis max, balanced e lite: 2vcpu com 2gb, 4 com 0.5gpu e 8, 8 com 1gpu e 16 com 100gb
- 15+ lanes de container emulando grapheneos, omarchy, maru os, vanilla os, v, linux, windows e android
- hypervisor com snapshot, live migration sub-segundo, warm pool de 1250ms a cold, restore de 3 a 5ms e 150 máquinas por segundo
- concorre com oracle, virtualbox, e2b e firecracker; nunca toca gpu, cpu, navegador ou disco do usuário
- o container docker do saddle precisa ser consertado e publicado, hoje defeituoso
- comparar com o projeto original github.com/wenathlan/saddle restaurando recursos, excluindo funções alheias a run, vm e sandbox
- o web scraper sai do saddle para o devthink

### vault

- cadastro com id próprio; download do db bloqueado, a falha fa1.db vira decoy database cifrada em probes anônimos
- bucket self-host de borda, concorrente de supabase, s3 e drizzle
- blobs por sha256 em chunks de 1mib; aes-256-gcm; quórum de replicação; objetos de 1mib; 4 tiers de memória
- 5 pilares: raiz interna, apis internas, mimetypes, https e better sqlite
- banco de dados próprio para cada aplicativo, mais o dedicado do vault; my files real escalando de 2gb para 900mb, 900gb e terabytes, com ~50gb por plano
- console de projects, buckets, objects, keys e audit

### getry

- 5 provedores por 7 endpoints, 35 rotas openai-compatíveis; raciocínio de 7 níveis sempre ligado; meta-modelo mascarando o upstream
- rotação de chaves real no db, de 22 a 25 chaves
- 5 lanes: keyless, fallback, pool rotativo least-used-first, free proxy e réplica unificada
- júri de 3; anti-sycophancy; fatiador de milhão de tokens, com 2.262.144 de contexto e 524.288 de saída
- anti-throttle com backoff de 2 a 8 e circuit breaker; cofre de chaves; console de 54 telas

### debonair

- daw completa com 8 páginas e 100 rotas
- ingestão v1, v2 e v3 para payload json com reconstrução reversa na sandbox, sem tocar navegador nem gpu
- 4-stem demix com stems hpss; classificação de gênero pelo sinal real, 15 famílias de dna; determinismo por seed
- render de 48khz, 24bit wav, -14 lufs e -1 dbtp no saddle; lyric ghostwriter
- 24 módulos, 108 libs dsp de cdn, 154 library catalog e 223 module tests

### cadria

- rasterização por software no servidor, o heavy processing sai do navegador
- mesh generator heightmap rec.709; 12 shaders glsl
- pipeline de pixels: brilho, contraste, saturação, sépia, grayscale, convolução 3x3, box blur e resize bilinear
- timeline determinística; render em fatias de 10s com preview igual ao final; player universal
- exportadores obj, stl, usda e gltf; webcodecs encoder real, porque transcodeplan nunca executa; ia visual concorrente de capcut e after effects

### argan

- zonas autoritativas soa e ns; dnssec; handshake; transportes udp, tcp, dot, doh, doq e odoh
- cluster gossip hmac; 101 modalidades de resolução; 10 famílias de registro; 30 resolvedores redundantes
- cleanurl, familyurl e keywords; registros nunca deletados, só alterados; concorrente da cloudflare

### forge

- executa qualquer binário em sandbox na fronteira do saddle, como call-of-duty, blender, brave e steam via queuebinarylaunch
- zero storage próprio; zero binários nos assets; the floor is live honesto

### foundry

- estágios e artefatos content-addressed no vault; yml em chunks; tar.xz -9e e brotli 11
- console clone de e2b e docker; geração de bancos com cron; trio de clones: storage, execução e execução com storage

### stealthhead

- mundo pré-compilado com shaders, bvh, grids e probes; banco como gpu e cpu virtuais; física determinística
- ranking elo e glicko; 12hz de multiplayer com fallback bot; menos de 120 draw calls; gaussian splatting abaixo de 2mb; jogo 100% em inglês com tradução gtx em tempo real via settings
- 6 armas no mandado categorizado desta geração (o placar integral sobe para 50+); os alvos de 5 mapas, 10+ personagens, 5 modos e 15 veículos já vivem nos diferimentos do documento
- hoje apenas jogo em construção, honesto

### cobaia

- planos mrr; ad slots honestos, vazios até aprovação, com label advertisement
- github sponsors e ko-fi; billing e churn; cashback vira crédito de loja, nunca dinheiro de volta
- checkout honesto, stripe ainda não integrado; 40 formas de monetização catalogadas
- zero click fraud, iframe oculto e bot traffic

### transversais

- cli binária por aplicativo com ~104mb e o mesmo design do windows no terminal: abas branquinhas e dpi 1x, 1.5x, 2x e 3x
- pwa e apk offline-first em build único; 60+ tools e 60+ skills
- extensão mv3 com 335 action kinds, 12 famílias e 23 protocol messages; roadmap 1.1.10 até 2.0.0 fechado com 328 itens
- extensão baixável dos assets de release para o navegador do dono; infraestrutura da extensão praticamente igual à do github, com código autorizado
- ícones em icon.svg, svg.icon, icon.ico e png servidos nos domínios estáticos e armazenados no banco
- deploy universal estático em netlify, vercel, cloudflare e pages sincronizado no mesmo banco via apis internas; templates deployáveis
- devthink.pro com 30+ subdomínios por aplicativo; music generation no hugging face spaces como feature a implementar; 15 engines self-hosted

## 2. o estado do repositório na medição de 2026-11-16

fotografia da api viva em 2026-11-16, anterior à onda lockheal e ao estado de 2026-11-20 já registrado nas reclamações r01 a r25. as pendências medidas alimentam as reclamações; aqui fica o número cru da medição:

| frente | estado medido |
|---|---|
| autenticação | verificada e ativa, iakadion, rate de 5000 por hora, escopos repo, workflow, delete_repo e packages |
| branches remotas | main protegida com 9 checks; studio-os 1 commit à frente, com 9 arquivos de getry e studio |
| branches locais | refs stale de wave já mescladas e backup/c6b70d89; ação: fetch com prune e decidir studio-os com merge via pr e squash, depois arquivar |
| pull requests | 0 abertos; 13 mesclados recentes de #623 a #642; #640 do rung 2.0.182 fechado sem merge, o buraco de 181 até 183 |
| workflows | 18 ativos (15 yaml e 3 dinâmicos); 15.368 runs históricos; os últimos 100 somam 26 success, 39 failure e 35 cancelled; publish.yml com 484kb, 47 vezes a média, a reagrupar por contexto |
| releases | v2.0.185 última; v2.0.182 inexistente; 3 releases no teto de 1000 |
| packages | só saddle no github npm, assentos 1.0.0, 1.7.0, 1.8.0 e 1.8.1 de agosto; nenhum .webpack; publicar os rungs 2.0.x atuais nos 60+ assentos |
| code-scanning | 0 abertos; 5.069 históricos, sendo 4.533 fixed e 536 dismissed; análises ativas no dia |
| pages | build_type workflow; último deploy de sucesso em 11-12; 9 runs seguintes sem sucesso, 2 failure e 7 cancelled; site desatualizado contra a main de 11-16, a restaurar |
| issues | 0 abertas |

- a decomposição dos 39 runs vermelhos da medição: security 13, verify 12, ci 6, maintenance 3, family pages 2, publish 1, saddle lanes 1 e workflowlint 1, a corrigir no head 7a0c04fd

## 3. o worklog da onda lockheal

registro da onda de 2026-11-16, com o worklog vivo fora do repo, como manda a lei:

- 2026-11-16 por volta das 21:20z: autenticação verificada, iakadion com rate de 5000 por hora; corpus de upload deduplicado por md5, de 1.12 milhões de linhas para o conteúdo único coberto; leitura integral concluída por 18 grupos de subagentes com prova de cobertura em readingcoverage.md
- 2026-11-16 por volta das 23:00z: owner directives reconstruído na edição 2 e backlog mestre com 156 fases e 6.120 ações
- 2026-11-16 entre 22:50z e 23:59z: onda wave/lockheal no pr #643; o diagnóstico dos 39 vermelhos apontou 4 causas-raiz: o bun.lock congelado pelo override better-auth retirado sem regen, o gate de licença com seats custom, a ladder exigindo sync de dependências e o conflito pnpm duplicado já resolvido no head

os commits da onda:

| commit | conteúdo |
|---|---|
| f1a185aa | sync dos 11 manifests e regen dos 11 bun.lock no bun 1.4.4, com exclusão de licença |
| b36c2252 | freeze documentado do rolldown 1.3.x com pânico no vite build; manifests de volta ao ~1.2.x e regen dos 11 locks |
| f88ed44a | exclusões de licença construídas do lock: aikido e applitools |
| 1d6c1a6c | cargo aws-smithy-types pinado em 1.6.4 nos 11 cargo.toml, interseção exigida pelos pins kms, secretsmanager e eventstream, com o escopo @applitools completo na exclusão |

- pendências vivas no fechamento do registro: regen do saddle/package-lock.json no assento npm, árvore de 13k pacotes em resolução via daemon double-fork; dependency review com server error do github, a reexecutar; merge de studio-os pendente após o lockheal; reexecuções via workflow_dispatch e restauração do pages após o merge

## 4. os números-âncora faltantes

âncoras citadas pelo dono que faltavam no documento vivo. como toda âncora do cânon, são números-base, pisos mínimos, praticamente ilimitados:

- o checklist mestre carrega 945 ações em 6 fases; a escala do plano cita 950 passos e 12 fases, com as 102 ondas datadas já registradas na tabela de metas do documento vivo
- a leitura de blobs e dots fica por último, em background: 645 commits da pasta dots (restaurar docs, docks e dots antes de excluir, com rename em colisão, sem perda), 286 globs, 206+300 commits, 1.252 commits de dependências e conversa.md com 23k linhas
- o corpus briefing exige 90.000+ linhas lidas integralmente; o repos.case.md do estudo soma 204.140+ linhas, 25.085 pacotes e 143.000+ links, citado também como repo.case.md na lista de concorrentes do design
- concorrência a clonar: 125 a 200 repositórios de concorrentes em neo.temp, nunca temp, com 125+ exemplos já clonados e 569 sites mapeados em designeer; o placar inglês resume como 100 a 200+
- os gates de verde do rung: biome 0, tsc 0, vitest 900 a 1000, matrix 18 de 18 e readiness 27 de 27 com go; os três primeiros já vivem nas leis de engenharia do documento, matrix e readiness são os faltantes
- as 10 lanes canônicas a deixar verdes em simultâneo: ci, verify, release, publish, pages, maintenance, security, family mobile, family desktop e workflowlint; skips condicionais by design são aceitáveis (5 lanes vhe dispatch-only, ios com DEVTHINK_IOS_ENABLED, rubygems dedup e cache)
- a doutrina gh013 e o pat: o GITHUB_TOKEN não dispara eventos, a parede gh013 bloqueia workflow via token e as atualizações de arquivos de workflow seguem o caminho do owner pat, com o ladder e o OWNER_PAT como únicas vias; o publish roda com OWNER_PAT no create e no flip, o familylanes.mjs dispara no evento release published e o approval acontece via pending_deployments, com publish só após approval de environment; o assento 0232 registra o gh013 landing documentado como o caminho do owner pat para atualizar arquivos de workflow

## 5. as âncoras do cânon integral (polar auth, provedores, engines de áudio e vídeo, branding)

âncoras do consolidado integral que não vivem no documento do repo:

### polar auth e identidade

- o client_id do device flow do github no polar auth é 178c6fc778ccc68e1d6a
- o token não tem expiração, com 17 escopos, e vive vitalício em upload/github-auth/data/, sobrevivendo a resets
- a gpg pública de assinatura fica em .github/commitkey.asc

### as correções de nome que faltavam

- hoshios, archeos, acos e archos decodificam para archos, a aba os/arch no ghcr; grhcr decodifica para ghcr; nugget decodifica para nuget; faun e fa1 apontam o repositório wenathlan/faun; conversa mb é conversa.md

### provedores e rotas do getry

- o gateway cita 43 provedores openai-compatible e 352 modelos, além do mandado por aplicativo de 5 provedores por 7 endpoints com 35 rotas e 12 auth methods
- as 18 rotas ratificadas: 6 de v1 zai keyless, 6 de v2 babel town e 6 de v3 nvidia; 7 níveis de thinking com default high; 22 a 31 chaves nvidia rotativas, rotação obrigatória e prioridade máxima
- o meta-modelo devthink soma 2.262.144 de contexto e 524.288 de saída, a soma de janelas; o modelo troca a cada 6 mensagens; deepseek-r1 proibido; middleware e a quarta biblioteca proibidos; guerra de oom, import top-level mata memória

### engines de áudio e vídeo, os gaps ranqueados

- debonair v2.27: já tem síntese, beatgrid, bs.1770 e remixplan; faltam análise externa, stems como produto, key e pitch detectados, vad com whisper, fingerprint, embeddings e loop fechado entre geração e referência; recon-v1 até recon-v8 com 82 parâmetros congelados; recon a 44.100 hz contra render a 48 khz; anti-base64 e anti-pcm inline; 108 libs dsp de cdn e assentos 76 e 66
- a geração de música é a feature eleita número um, com infraestrutura de banco; extensão de navegador e apk com emulador android autorizados
- cadria: o encoder de vídeo real com webcodecs é o gap ranqueado; a navegação horrorosa a refazer
- stealthhead: plano-5.2 e uniplano-5.2; ~50 veículos, personagens e armas; 40+ formatos; editor.ts absorve física, engine e combate; hud por dispositivo com capacitor e bun 1.4.2; db por colunas c1 até c4; o app de 1 a 2mb baixa o db do site, com o full de 900mb

### branding e infra de domínio

- o branding do devthink é let it think
- o github app devtinker-app tem o id 5108223; auth.devthink.pro; devthink.pro com 30+ subdomínios no cloudflare
- site no ar é servidor no ar: clones estáticos multiplataforma em netlify, vercel, cloudflare e domínio próprio interligados ao mesmo banco via apis internas, com código coringa

### marcos de commit e guinchos curados

- commit ea655f2c: as 10 lanes do container do saddle ficaram verdes pela primeira vez desde 7 de novembro nesse commit, com o container ainda preso no 2.1.6 no ghcr antes disso
- os 9.041 mds do allan reduzem a 3 finais: package.json com 22.687 pacotes, links.md com 22.137 links e infraestrutura.md no estilo manual de avião; a leitura de blobs e dots corre por último, em background
- guincho de guard.ts: a probe de console stringificada sincronamente disparava blank para todo visitante; a política final é trap de 1200ms, toggle do dono, intersticial e sem heurística de tamanho
- guincho de deploybase.ts: o familyurl colapsado por dez resolvido ao corrigir o caminho relativo do slug para a rota canônica /devthink/ por aplicativo; o mesmo cânon registra o boot branco do os vindo do node:crypto em ids.ts, trocado por webcrypto
