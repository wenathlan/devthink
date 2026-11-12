# seguranca

o censo completo dos erros de segurança e das falhas de workflow do repositório, com o mapa de resolução por frente. mapear todos os erros, todas as reclamações e resolver um por um, fechando por request, mesclando por request, até tudo verde, livre de erros de segurança e vulnerabilidade.

## o censo dos alertas de dependências

- o bot de dependências mantém abertos mais de dois mil e trezentos alertas no canal python, distribuídos em cem e vinte e um alertas por aplicativo nos onze manifests, todos com a mesma lista de pacotes vulneráveis
- gravidade: dezenas críticas, mais de mil altas, mais de mil médias e dezenas baixas
- os campeões de alerta: a biblioteca de imagens, a biblioteca de git, o servidor web assíncrono, a biblioteca de tokens, o lock de arquivo, o framework de agentes, o servidor de rede, o cliente http, o instalador, o driver de banco, o parser de sql, o parser de asn, o protocolo de modelos, a pilha de grafos de linguagem, o roteador de modelos e dezenas de outros
- a raiz estrutural: o envelope python de cada aplicativo carrega a união das dependências colhidas de todos os repositórios históricos, pinos exatos duplicados por variante de caixa, onde a entrada minúscula foi corrigida em rungs anteriores mas a variante maiúscula manteve o pino antigo vulnerável
- a cura: bump de todos os pacotes vulneráveis para a versão corrigida ou a mais recente, mesclando as variantes duplicadas por caixa num único pino correto, aplicando identicamente nos onze manifests
- pacotes sem versão corrigida publicada sobem para a mais recente disponível
- o pacote morto sem correção possível converte-se no sucessor vivo já presente na união
- os prs abertos do bot para o vault ficam superseded pela cura completa da família e fecham após o merge da onda

## o censo do code scanning

- um alerta aberto do scorecard reclamando que prs mesclados passaram sem teste de integração
- a cura: os prs da operação passam a rodar a bateria verde antes do merge, o score normaliza com o histórico de merges verdes

## o censo dos workflows

- o fluxo de publicação quebra nas frentes: o empacotamento do assento do bundler dentro do envelope original em todos os aplicativos, a publicação do envelope gradle quando ausente em quatro aplicativos, as faces node do vault
- o fluxo das lanes do saddle quebra em todas as publicações de imagem multiarquitetura, nas lanes do catálogo de distribuições e no anexo de assets
- o fluxo das páginas quebra na instalação e build do tema do saddle, com cancelamentos em cascata nos demais
- a bateria de segurança quebra em: auditoria das dependências resolvidas do workbench, regras de segurança do linter, checagem de licenças, build da imagem para scan, auditoria do grafo rust
- a bateria de integração quebra em: paridade de configuração da família, contrato de cli nos três runtimes, empacotamento do bundle pelo bundler, suíte do debonair e do saddle, workbench estático
- a bateria de verificação quebra em: build da distribuição raiz e instalação da versão npm declarada
- as falhas nas branches do bot herdam as quebras da main, a cura da main cura as branches
- a leitura dos logs de cada falha define a correção cirúrgica frente por frente, sem nunca configurar ignoração

## as regras de cura

- cada frente quebra num passo específico, o log aponta o passo, a correção ataca a causa raiz
- proibido silenciar alerta, ignorar vulnerabilidade ou marcar falha como esperada
- a assinatura de hash é gerada no build, nunca hardcoded
- o bump das dependências python é cirúrgico nos pinos exatos, mantendo a união sem remoção
- depois da cura, rerun das baterias, confirmação do verde em pr e na main
- o fechamento dos alertas confirmado pela api depois do merge

## as ondas de cura

- onda um: bump python completo nos onze, dedupe das variantes de caixa, supersede dos prs do bot
- onda dois: cura do fluxo de publicação, a fusão do bundler no envelope original
- onda três: cura das lanes do saddle e do catálogo de distribuições
- onda quatro: cura do build do tema nas páginas
- onda cinco: cura da bateria de segurança
- onda seis: cura da bateria de integração e verificação
- onda sete: rerun geral, confirmação do verde total, fechamento do alerta do scorecard com o histórico de merges verdes

## as causas raiz mapeadas nas ondas de cura

- a frente do pacote de ícones: o assento do sistema operacional era o único feixe que atingia o pacote de ícones inline, então os identificadores sublinhados da árvore resolvida só entraram por ele; a cura andou o assento externo exatamente como o react já andava, mantendo o pacote no manifest do consumidor
- a frente do assento de override duplicado: o pino da ferramenta de build andava em duas formas no manifest do aplicativo principal, a literal com seletor e a forma de objeto; toda leitura npm do manifest quebrava no assento sem nome e o workspace do auditor dobrou a chave duplicada que o resolvedor recusa; a cura removeu as formas literais mantendo os objetos como os dez irmãos já respondem, subiu o pino das janelas no cargo que o grafo demanda e ensinou o gerador a deduplicar
- a frente do fumo do consumidor: um dos milhares de assentos publicados carrega o protocolo de workspace na dependência que o registro do npm recusa; a identificação do assento culpado e a sobrescrita seguem pendentes
- a frente da paridade de configuração: o teste chama a saída de processo inesperada; investigar o gate que dispara
- a frente da suíte do debonair: a sonda registra que o postinstall do runtime não rodou por causa da instalação com scripts ignorados; investigar a sonda
- a frente da suíte do saddle: a requisição não autorizada na suíte; investigar a autenticação do teste
- a frente do workbench estático: o argumento de formatação fora de faixa; investigar a chamada
- as frentes de publicação: a fusão do assento do bundler no envelope, o envelope gradle ausente e as faces node do vault seguem pendentes de leitura de log
- as lanes do saddle e o tema das páginas seguem pendentes de leitura de log
- o scan de container falhou no apt do build da imagem com retentativa esgotada; verificar transitoriedade
