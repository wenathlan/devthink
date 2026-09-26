# Direção visual do DevThink

## Três abordagens possíveis

| Nome | Introdução breve | Probabilidade |
| --- | --- | ---: |
| Atelier de Cobre | Um navegador de trabalho editorial e quente, com superfícies grafite e detalhes em cobre. Ele privilegia foco, materialidade e rastreabilidade. | 0.08 |
| Sala de Sinais Orbitais | Um workspace escuro e espacial, em que anéis azuis suaves e um laranja de alta energia indicam presença, rota e fluxo. Ele transforma a sessão em uma mesa de controle precisa. | 0.03 |
| Terminal de Impressão | Um sistema monocromático de estética tipográfica, com bordas impressas, retícula e ritmo de editor. Ele reforça a sensação de ferramenta local e confiável. | 0.06 |

## Direção selecionada: Sala de Sinais Orbitais

### Movimento de design

O DevThink adota o **instrumentalismo espacial editorial**: a disciplina de uma estação de trabalho técnica encontra o brilho contido de uma navegação por órbita. A referência de navegador aparece na hierarquia de abas e barras de comando; não como imitação de Chrome ou Opera, mas como uma gramática reconhecível de continuidade e contexto.

### Princípios centrais

1. **Cromado, não dashboard:** o produto é uma área de trabalho com bordas, abas, trilhos e contexto ativo; nunca uma coleção centralizada de cartões.
2. **Sinal antes de ornamento:** laranja indica ação e foco, azul-orbe indica conexão ou fluxo e verde somente confirma estabilidade.
3. **Profundidade discreta:** camadas pretas, recortes SVG e texturas de pontos explicam hierarquia sem gradientes genéricos ou excesso de vidro.
4. **Paridade de comando:** a web e a CLI usam os mesmos nomes de estado, mesma marca ANSI, mesmas ações principais e o mesmo modelo mental de workspace.

### Filosofia de cor

O preto mineral sustenta sessões longas e cria silêncio visual. O **laranja DevThink `#ff6a00`** é propriedade de ação, seleção e identidade; por isso nunca é usado para decoração passiva. O **azul-orbe `#78a9ff`** é uma luz fria de estado, reservada para gateway, streaming e relações de contexto. Marfim acinzentado e cinzas azulados sustentam leitura sem transformar a interface em puro branco.

### Paradigma de layout

O layout é uma **mesa de trabalho orbital**: uma barra superior de contexto e abas passa sobre um trilho de navegação fino; o centro é um canvas de conversa e execução; uma coluna de inspeção é uma camada invocável, não uma terceira coluna permanente. A tela de entrada é uma bancada central contida por uma abertura SVG ampla, e não um hero de marketing.

### Elementos de assinatura

1. Uma abertura SVG original, formada por blocos arredondados assimétricos, cria profundidade atrás da entrada e dos estados vazios.
2. Anéis orbitais locais em SVG, do laranja ao azul-orbe, indicam pareamento, streaming e conexão sem depender de efeitos de terceiros.
3. Uma faixa de abas compacta e uma barra de comando terminal unem a navegação do navegador ao ritmo da CLI.

### Filosofia de interação

Toda ação frequente é imediata e legível por teclado. O foco muda sem atraso; apenas o ingresso de uma sessão, a abertura do inspetor e a chegada de um stream recebem transição. Botões mantêm pressão física leve; estados de conexão usam forma, texto e cor, nunca só cor.

### Animação

As transições de painel usam 180–240 ms, `cubic-bezier(0.23, 1, 0.32, 1)` e somente `transform` e `opacity`. Anéis orbitais usam movimento lento, sem cursor obrigatório. A revelação de retícula é limitada a entradas e vazios; sob `prefers-reduced-motion`, todos os movimentos não essenciais são removidos e o conteúdo fica imediatamente visível.

### Sistema tipográfico

**Space Grotesk** conduz títulos, navegação e controles; **IBM Plex Mono** conduz rotas, prompts, estados e dados de execução. Títulos possuem massa compacta, com contraste alto. Metadados usam mono em caixa baixa e espaçamento moderado. A marca ANSI decorativa jamais substitui um rótulo acessível.

### Essência da marca

**DevThink é o workspace local de desenvolvimento com IA para quem precisa rotear provedores, acompanhar streams e manter a execução sob seu controle.**

Personalidade: **precisa, energética, composta**.

### Voz da marca

As mensagens são curtas, operacionais e verificáveis. CTAs descrevem a próxima ação real; nunca prometem autonomia fictícia.

> Abrir uma rota local e escolher o modelo de execução.

> Parear o gateway. Manter as credenciais no seu computador.

### Wordmark e logo

A marca canônica é a composição ANSI `DEVTHINK` já renderizada pela CLI. Na web, ela aparece como texto acessível acompanhado por uma versão compacta do mesmo ritmo pixelado, sempre em laranja DevThink ou cinza de baixo contraste.

### Cor de assinatura

**Laranja DevThink — `#ff6a00`.**

## Decisões de implementação

As referências de 21st.dev, UIverse e React Bits orientam hierarquia, ritmo e movimento, mas o DevThink usa componentes, SVGs e CSS locais. Nenhum código de terceiro é copiado. A interface não introduz uma dependência visual nova apenas para reproduzir um efeito de referência.
