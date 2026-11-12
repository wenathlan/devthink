# lei

a lei completa da operação devthink consolidada, deduplicada e hierarquizada. toda reclamação do proprietário registrada em qualquer texto, commit ou conversa vira diretriz obrigatória listada aqui. cada regra aparece uma única vez. nada se ignora, nada se pula.

## regras de operação

- a operação principal acontece exclusivamente no repositório devthink, o estudo de concorrentes acontece no repositório alan, repositórios que não são nossos são desconsiderados
- a raiz do ambiente local mantém apenas o repositório devthink e a área de estudo de concorrentes, template next, src, venv e python são descartados antes e depois de cada sessão, nunca usados nem para autenticação
- primeira ação de toda sessão: autenticação verificada ou lançada em tempo real com o script de autenticação lido por completo e executado em background, capturando o token assim que o proprietário autorizar, sincronizando o head remoto para o local em seguida
- o token capturado vive em arquivo próprio com permissão restrita, o script não repolla depois de autorizado, os arquivos de estado ficam num único diretório da raiz, nunca em temporários
- leitura de arquivos sempre integral, linear, hierárquica, progressiva, do topo ao fim, por seção, frase e milímetro, sem atalhos, cortes seletivos ou pulos, usando exclusivamente comandos de terminal em segmentos de linha, nunca ferramenta direta de leitura
- subagentes seguem as mesmas regras do agente principal, inclusive a leitura somente por terminal
- ordem de prioridade fixa: primeiro saddle, depois vault, depois o design do devthink e o estudo das referências clonadas, depois os demais aplicativos, o aprofundamento das engines de áudio e vídeo vem depois da padronização dos configuráveis dos onze
- execução do mais fácil para o mais difícil, um por um, meta por meta, reclamação por reclamação, agrupado por tema e categoria
- ondas ilimitadas, mais de cem ondas possíveis, cinco a sete subagentes simultâneos por categoria até trezentos ou mais por onda, cada subagente inicia com análise integral da fase antes de modificar, subagentes ignoram frentes ocupadas e avançam para a próxima sem atrapalhar
- tudo numa única onda, pendência não fica para a próxima, prometer para depois é defeito
- lista interna de dez mil ou mais ações principais, com até novecentas tarefas de conserto por frente, relógio de uma hora por operação
- leitura massiva de documentação roda por último, em background, com subagente dedicado, sem bloquear correções urgentes
- workflows pesados não são esperados rodar, o resultado é verificado depois em lote, principalmente os do saddle
- verificação real via browser agent na produção, a sandbox parece normal mesmo com a produção quebrada
- ao ler um trecho, mapear as regras, verificar no código, abrir a branch, deixar verde, mesclar na main e retornar exatamente na linha onde parou, repetindo até fechar o ciclo
- merge das branches do mais antigo para o mais recente com squash, sync antes e entre merges, ao final existe apenas a main
- pr é onda de execução por tema e categoria, nunca por aplicativo isolado, com nome da onda, cerca de cinquenta prs por onda
- resolver os problemas por request, fechar por request, mesclar por request
- commits com a identidade do proprietário, nunca bash para escrever ou mover código fonte, nunca git dentro de subagentes
- quando existir outro agente na mesma frente, ignorar sem atrapalhar e seguir para a próxima
- exemplos citados em conversa são ilustração, nunca obrigação de copiar igual
- limite de infraestrutura total entre oito e dez gigabytes

## regras de projeto

- o monorepo é a superplataforma self-hosted de código próprio com onze aplicativos, cada solução é concorrente direta de mercado no seu domínio
- cada aplicativo é dono exclusivo de uma engine, os demais importam via dependência de pacote, nunca via caminho de pasta, duplicação de lógica entre aplicativos é proibida
- as engines são cegas, não contêm informação textual própria, texto, imagem e asset dinâmico vivem no banco e são puxados via apis internas e sintaxe inteligente, no build
- a interface em sol e os widgets puxam todo conteúdo do respectivo banco via tags e apis internas
- hardcode permitido apenas em arquivos de configuração e em testes
- cada aplicativo web tem banco de dados próprio, gerenciado pela engine de armazenamento ou espelhando sua lógica, os bancos se interligam por protocolos e apis internas
- o sistema roda via internet vinte e quatro horas na infraestrutura própria de borda, deployável em qualquer plataforma estática, clones em múltiplas plataformas compartilham sincronização
- código coringa: o mesmo código serve qualquer plataforma de deploy sem depender de serviços pagos ou free tiers
- estrutura da raiz: exclusivamente a pasta de workflows e as onze pastas dos aplicativos mais dois arquivos, nada além
- dentro de cada aplicativo apenas as três pastas: o tema, os testes e a documentação
- pastas proibidas: build, src, dist, assets soltos, scripts, artifacts, publicação fora da raiz
- build direto na raiz do aplicativo, saída na raiz, nunca em dist
- testes exclusivamente em typescript na raiz da pasta de testes, sem subpastas, simulação de carga de dados somente nos testes
- lógicas em typescript na raiz de cada aplicativo, antes da pasta do tema
- reagrupamento por palavra chave: uma única palavra cheia, direta, minúscula, sem termo composto, sem pontos internos, sem hífen, sem emoji, que simbolize o sentido exato da função
- até sete mil lógicas correlatas agrupadas no arquivo do seu domínio, nunca variante separada, lógicas de teste nunca se misturam com lógica real
- migração de lógica errada: recortar do aplicativo errado e mover para o dono da engine, reagrupando em seguida
- estrutura didática pronta para a futura conversão de toda a infraestrutura de typescript para rust
- prioridade para typescript e node nativos na orquestração, uso livre de go, python, rust, ruby e demais linguagens conforme a necessidade
- engines de inteligência artificial podem demandar python, ruby, go, rust e jsonc

## regras de formatação

- código, comentários, interface, nomes de arquivo e pasta em inglês integral
- nomes de arquivo e pasta em minúsculas, palavra única, sem hífen, underscore, pontos internos ou emoji
- componentes em pascalcase, identificadores em minúsculas
- padrão de codificação moderno: hierárquico, linear, agrupado por blocos, jsdoc bem comentado, flags, tags, tokens, sintaxe inteligente, sem verbosidade
- pattern design do ano corrente sempre
- dots apenas onde a identificação do pacote exige, corrigindo identificadores antigos para o padrão com ponto reverso correto, priorizando o nome único devthink
- arquivos de conversão nomeados com o nome do aplicativo seguido da extensão alvo, avaliando antes se os gerenciadores aceitam a personalização sem quebrar
- unificar docker compose e docker config num único dockerfile por projeto
- pontuação dos textos: vírgula para contextos diferentes, barra para mesmo contexto, nunca escrever por extenso percentual, barra, igual ou versus, frases coerentes com gramática e acentuação corretas
- sem gírias, ansi art, emoji, vibe code, pirâmides de código ou dots decorativos
- desduplicação agressiva de palavras, sentidos e lógicas, cada sentido aparece uma única vez
- correção contextual de termos desconhecidos ou errados pelo sentido técnico
- documentos da operação em minúsculas, frases completas e conectadas, objetivos, sem emoji, sem citação de fonte, em português brasileiro autocontido
- toda a documentação existente se resume em no máximo cinco arquivos centrais na pasta de documentação do aplicativo principal, após o agrupamento todos os demais txt e md do repositório são deletados de todas as pastas

## regras dos configuráveis

- os onze manifests com o mesmo template, mesma sequência de chaves, mesmas flags de teste, versão sincronizada na curva correta
- dependências idênticas em todos os aplicativos nos três blocos, dependências, dev e overrides, mesma quantidade nos três, sem remoção de dependência prévia
- o manifest da raiz contém exclusivamente as engines, node como maestro orquestrando mais de quinze engines
- dependências de emulação e drive virtual exclusivas do saddle
- lockfile único, oculto no gitignore junto do arquivo de infraestrutura
- arquivos configuráveis padronizados na raiz de cada aplicativo com a mesma formatação, sequência e metodologia, adaptados ao objetivo de cada um: package json, npm, qemu, nginx, netlify, homebrew, cargo, capacitor, maven, gradle kts, robots, devthink toml, env, gemspec, csproj, rs, rb, java, xml, yml, json, go mod, doc go, pyproject toml
- arquivos idênticos em todos: a versão de mimetypes com mais de quatro mil tipos e o protocols types do vault
- todas as mais de quinze distribuições convertidas presentes em todos os aplicativos
- grupo de publicação maven novo por aplicativo, pacotes do grupo antigo deletados e republicados
- padronização espelha o app principal nos documentos templateáveis

## regras de segurança

- nunca tocar no navegador, gpu, cpu, memória ou armazenamento local do visitante, sem local storage
- bloqueio rigoroso do download direto do arquivo de banco estático
- conta e dados persistidos exclusivamente na engine de armazenamento própria, nunca no navegador da pessoa
- resolver todos os alertas de code scanning e do bot de dependências, configurar o sistema para ignorar alertas ou falhas é proibido em qualquer linguagem
- resolver as vulnerabilidades de verdade com commit, nunca silenciar
- infraestrutura self-hosted independente, sem framework pago ou free tier
- comunicação entre engine, banco e storage exclusivamente por apis internas
- servir estaticamente de forma segura da raiz interna com milhares de mime types e centenas de protocolos
- assinatura de hash gerada dinamicamente no build, nunca hardcodada em workflow
- token nunca inline em url
- cabeçalhos de segurança obrigatórios
- guarda contra ferramentas de desenvolvedor com correção do falso positivo de tela branca
- autenticação em tempo real com escopos amplos e captura imediata

## regras de design

- tema único branco, variação apenas claro e escuro, futuro segundo tema lunar
- logo limpa sem texto abaixo do ícone
- fidelidade ao index de referência do aplicativo principal, apenas os controles originais
- fluent icons obrigatórios, fonte moderna igual à web, hero com gradiente
- texto minimalista: título e descrição no máximo, caixa de login só com ícones dos provedores
- remover todo texto que revele infraestrutura interna
- janelas no padrão do sistema operacional de referência com titlebar completa, alças de redimensionamento, efeito acrílico no rodapé, avatar e power sempre visíveis
- navbar flutuante e fixável com interações inteligentes: puxar para cima fica flutuante, puxar para a esquerda fixa, descolar da parede a torna flutuante com bordas arredondadas
- calendário acoplado que acompanha a posição do dock flutuante
- microanimações e microinterações obrigatórias, curtas, usando apenas transform e opacity, alvos de toque adequados
- zoom travado no widget de scroll como no repositório de referência, via viewport do index, sem lógica óbvia por aplicativo
- url direta abre standalone em tela cheia sem moldura, clique dentro do painel abre dentro da janela do sistema, sem diferença de renderização entre os modos
- nível de qualidade de prêmios internacionais de web, minimalista profissional
- mesma identidade para web, desktop, cli, tv, extensão e mobile, diferindo apenas apresentação, responsividade e detecção de dpi
- a cli é a mesma interface do aplicativo de chat com o mesmo design e interação no terminal
- todo aplicativo não oficial ou jogo exibe o componente único de obra em construção, sem texto
- especificações milimétricas de geometria, composição, espaçamento e cor não se definem em documento, mapeiam direto nas referências clonadas na área de estudo de design, com seletores, tokens e variáveis de estilo reajustados
- o padrão visual combina o estilo do sistema operacional de referência com o site de referência premium
- redesenho completo dos widgets do zero, componentes em inglês em ordem alfabética, sem pasta dentro de pasta, agrupamento correlato ilimitado num único arquivo
- fluxo de entrada ordinal persistindo estado no banco, com intro de saída fluida, onboarding em janela e gerenciador
- página de explore no mesmo padrão do próprio aplicativo

## regras de versão e distribuição

- versão sincronizada nos onze, na curva correta do rung atual, regressão de número de versão é proibida
- a cada seiscentas ou setenta grandes ações concluídas, bump na raiz atualizando os onze manifests, gerando changelog e disparando releases e distribuições em cascata
- onze arquiteturas oficiais padronizadas
- onze canais de distribuição por aplicativo
- mais de quinze lanes de sistema operacional e de arquitetura interna no catálogo de distribuições do container do saddle
- containers dos dez aplicativos com as arquiteturas padronizadas, o do saddle é o exótico com perfis máximo, equilibrado e leve
- meta de pacotes publicados acima de sessenta, com assets de release acima de mil
- fluxo automático de aprovação de release funcionando em cascata
- binários nos assets do release com assinatura dinâmica
