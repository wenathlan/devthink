# operacao

o estado consolidado da operação, o histórico auditado e a definição das frentes de execução. todo o conteúdo dos textos lidos, dos mais de mil e setecentos commits do repositório principal e dos documentos de todos os grupos foi lido, deduplicado e resumido aqui.

## o que a auditoria dos commits mostrou

- o repositório principal tem mais de mil e setecentos commits na main, começando em maio, com picos de oitocentos em outubro e setecentos e sessenta em novembro
- o padrão dominante é a onda: mais de quinhentos commits de onda, seguidos de correção, feature, design, docs e refactor
- aplicativos mais tocados: devthink, saddle, vault, debonair e cadria
- temas que aparecem no histórico: rungs de versão, bateria verde, publicação nos registros, design com a dupla de referência visual, segurança com curas reais e nunca silenciamento, lockstep de dependências, união de manifests, recuperação das dependências perdidas pela colheita de blobs dos nove repositórios da família
- a união das dependências: todos os manifests de todos os repositórios históricos foram colhidos, deduplicados por nome e somados nos onze manifests atuais, somando milhares de nomes
- as últimas trinta entradas fecharam a cve do esbuild, lançaram o rung corrente, unificaram o bundler dentro dos pacotes originais, completaram a limpeza de ícones e ajustaram a gramática do lockfile no pino do runtime fixo
- progressão de versão: da linha inicial até a grande fusão da segunda linha major, seguindo em rungs contínuos até o rung corrente, com a linha desviada do saddle realinhada
- existiram regressões registradas: versões fora da curva, assets de release despencando, aprovação de release quebrada em commits antigos, branchs abertas sem merge, dots de infraestrutura apagados antes da leitura

## estado atual verificado

- apenas a main existe como branch permanente, com as branches do bot de dependências do vault pendentes de resolução
- suíte de testes verde com milhares de passos no runner oficial
- versão sincronizada nos onze, rung corrente na curva certa
- pacotes publicados nos registros, porém com frentes quebradas no fluxo de publicação detalhadas no documento de segurança
- o site estático da família está no ar
- a leitura integral dos textos enviados e dos documentos de todos os grupos foi concluída: o briefing mestre, os arquivos de feedback, o corpus de autenticação com dezenas de variantes de script consolidadas no build corrigido, a conversa completa em dezenas de milhares de linhas lida em sete segmentos por subagentes, e a auditoria dos commits

## frentes de execução em ordem

- primeira frente: a consolidação documental, os cinco documentos centrais substituindo toda a documentação dispersa, com a deleção de todos os txt e md antigos do repositório
- segunda frente: o fechamento dos alertas de segurança, bumps nas dependências python vulneráveis nos onze manifests, deduplicação das entradas duplicadas por caixa, mesclando as variantes na versão corrigida
- terceira frente: as curas dos workflows quebrados, frente por frente, por request
- quarta frente: o design no padrão de referência, depois do estudo dos clones na área de referência
- quinta frente: as engines reais, na ordem saddle, vault, depois áudio e vídeo
- sexta frente: distribuição completa, sessenta ou mais pacotes, mil ou mais assets, todas as lanes

## o processo de onda

- cada onda abre stride, caminha as provas e fecha na main via squash com checks verdes
- prs paralelos fecham como superseded quando o conteúdo já cavalga o head
- o relatório de onda sai em minúsculas, frases completas e conectadas, sem emoji, sem citação de fonte, duplicatas fundidas numa regra num lugar só
- ao final de cada onda a lista interna atualiza, o que foi feito marca, o que falta redefine

## distribuição e versão

- a cada bloco de grandes ações o bump na raiz atualiza os onze, gera changelog e dispara a cascata
- canais por aplicativo: npmjs, github packages, gitlab, maven, gradle, nuget, rubygems, docker, cargo, pypi, homebrew, go get
- arquiteturas oficiais: as onze plataformas padronizadas da família
- as matrizes do bundler por aplicativo somam os pacotes da meta
- o espelho de containers recebe as lanes com perfis
- os assets do release carregam binários, envelopes e conversões com assinatura dinâmica

## lições registradas

- deletar documento antes de ler perde infraestrutura, sempre lê antes
- a sandbox engana, verificação é no browser
- prometer para depois é defeito
- regressão de versão quebra a cascata inteira
- hash hardcoded em workflow quebra a cadeia de confiança
- ignorar alerta de segurança é proibido, cura é com commit
- separar variante em arquivo próprio viola a lei do agrupamento correlato
- teste mockado na raiz é lógica falsa, mock vive só nos testes
- dependência nunca se remove, sempre se soma no lockstep
