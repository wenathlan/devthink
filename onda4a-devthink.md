# ONDA 4a — devthink profundo (neodocs-txt/outros.devthink)

> Task ID 6-5-a (tentativa 2). Extração de regras ND + features F-DTK do acervo `outros.devthink`
> (superplataforma devthink v10.0.0 — catálogo npm gigante). Nada inventado; tudo citado por «arquivo:linhas».

## ARQUIVOS / SEGMENTOS LIDOS

| Arquivo | Linhas | Leitura |
|---|---|---|
| worklog.md (T3/T4/T5 + 6-5-b/c/d) | 351 | lido (contexto, numerações ND-1xxx/2xxx/3xxx e F-DTK-200..235 já usadas) |
| regras.md PARTE 4 + features.md | 147/153 | formato `OPR-NNNN` / `F-APP-NNN` lido |
| package.10.descricoes (2).txt | 21.818 | seg. 1–235 (integral, cut 120) + seg. 11.000–11.230 + greps-alvo com nº de linha (≈200 pacotes citados) |
| package.10.repos (2).txt | 19.691 | amostras 1–300 e 19.400–19.691 (JSON plano repetitivo pkg→URL; 1,29 MB integrais inviáveis no orçamento de saída — documentado como amostrado) |
| package.10.case.txt | 21.983 | 4 janelas prescritas (1–700, 3500–4200, 7000–7700, 10500–11200) via extrator compacto `NR\|pkg\|DevThink use` (185 linhas/janela de ~650–700; resto do padrão repetitivo por categoria) + mapa completo dos 40 headers de categoria via grep -n |
| package.10 (10).txt | 65.481 | cabeçalho 1–6, devDependencies 21.824–21.840, engines 65.464–65.481 + contagens awk |

Nota estrutural: o manifesto `package.10 (10).txt` declara `"name": "devthink", "version": "10.0.0"` com
`dependencies` (21.817 entradas) e `devDependencies` (43.636 entradas — superset ~2×). O `case.txt` é o
catálogo de use-cases desses 21.818 pacotes em 40 categorias. Padrões "DevThink use" repetem-se por
cluster de categoria (ex.: AI/LLM → "power LLM provider integration and agent runs in the CLI and gateway").

---

## REGRAS ND

### A. Manifesto, identidade e engines

ND-0001. A superplataforma deve declarar-se como um único pacote npm de nome `devthink` na versão 10.0.0. «package.10 (10).txt:1-3»
ND-0002. O catálogo de capacidade deve somar 21.818 pacotes classificados. «package.10.case.txt:3»
ND-0003. Toda entrada do catálogo deve ser compilada de package.10.json + package.10.repos.json + descrições (npm/mirrors/GitHub/GitLab). «package.10.case.txt:3»
ND-0004. Toda dependência deve ser fixada em range caret `^x.y.z` (ex.: 0x ^6.0.0, 1c ^10.0.0, 3d-force-graph ^1.80.0). «package.10 (10).txt:5-16»
ND-0005. O manifesto deve manter o acervo em `dependencies` (21.817 entradas) e espelhá-lo ampliado em `devDependencies` (43.636 entradas). «package.10 (10).txt:6-21823;21824-21840»
ND-0006. Todo manifesto deve terminar com bloco `engines` declarando os runtimes suportados. «package.10 (10).txt:65464-65481»
ND-0007. Executar sobre Node.js ^26.8.2. «package.10 (10).txt:65474»
ND-0008. Instalar/operar com npm ^12.1.0. «package.10 (10).txt:65475»
ND-0009. Suportar pnpm ^12.6.0 como gerenciador de pacotes. «package.10 (10).txt:65476»
ND-0010. Suportar yarn ^4.17.1 como gerenciador de pacotes. «package.10 (10).txt:65480»
ND-0011. Suportar bun ^1.4.2 como runtime alternativo. «package.10 (10).txt:65466»
ND-0012. Suportar deno ^2.9.5 como runtime alternativo. «package.10 (10).txt:65470»
ND-0013. Compilar com typescript ^5.8.0. «package.10 (10).txt:65478»
ND-0014. Integrar-se ao vscode ^1.118.0 como host de extensões. «package.10 (10).txt:65479»
ND-0015. Suportar chrome ^16.0.912+ como engine de browser. «package.10 (10).txt:65467»
ND-0016. Suportar firefox >=0.8.0 como engine de browser. «package.10 (10).txt:65472»
ND-0017. Suportar bare ^1.18.0 como runtime embarcado. «package.10 (10).txt:65465»
ND-0018. Suportar cnpm ^9.4.0 como instalador alternativo (espelho China). «package.10 (10).txt:65468»
ND-0019. Ativar corepack ^0.35.0 para fixar gerenciadores. «package.10 (10).txt:65469»
ND-0020. Manter compatibilidade mínima ecmascript ^5.0.0. «package.10 (10).txt:65471»
ND-0021. Legado iojs ^1.0.0 apenas para compatibilidade histórica. «package.10 (10).txt:65473»
ND-0022. Suportar teleport >=0.2.0 como alvo de deploy. «package.10 (10).txt:65477»

### B. Taxonomia das 40 categorias do catálogo

ND-0023. Provisionar integração de provedores LLM e execução de agentes no CLI e gateway pela categoria AI/LLM (809 pacotes). «package.10.case.txt:6;47-233»
ND-0024. Operar embeddings e vector-DB como pilar próprio (56 pacotes). «package.10.case.txt:7»
ND-0025. Automatizar browsers pela categoria Browser-Automation (141). «package.10.case.txt:8»
ND-0026. Raspar web pela categoria Web-Scraping (61). «package.10.case.txt:9»
ND-0027. Padronizar clientes HTTP (264). «package.10.case.txt:10»
ND-0028. Padronizar servidores web (281). «package.10.case.txt:11»
ND-0029. Padronizar frameworks web (361). «package.10.case.txt:12»
ND-0030. Padronizar persistência Database (288). «package.10.case.txt:13»
ND-0031. Padronizar ORM/ODM (64). «package.10.case.txt:14»
ND-0032. Validar tudo em borda com Validation/Schema (339). «package.10.case.txt:15»
ND-0033. Registrar eventos via Logging (124). «package.10.case.txt:16»
ND-0034. Manipular tempo com Date-Time (146). «package.10.case.txt:17»
ND-0035. Proteger com Crypto/Security (463). «package.10.case.txt:18»
ND-0036. Garantir qualidade via Testing (691). «package.10.case.txt:19»
ND-0037. Estilo e conformidade via Linting/Formatting (565). «package.10.case.txt:20»
ND-0038. Construir via Build-Tools (1302). «package.10.case.txt:21»
ND-0039. Empacotar via Bundlers (247). «package.10.case.txt:22»
ND-0040. Operar a CLI com CLI-Tools (688). «package.10.case.txt:23»
ND-0041. Documentar via Markdown/Docs (521). «package.10.case.txt:24»
ND-0042. Internacionalizar via i18n/l10n (119). «package.10.case.txt:25»
ND-0043. Gerenciar estado com State-Management (101). «package.10.case.txt:26»
ND-0044. Compor interfaces com UI-Components (1619). «package.10.case.txt:27»
ND-0045. Estilizar com CSS/Styling (514). «package.10.case.txt:28»
ND-0046. Acessar disco com File-System (475). «package.10.case.txt:29»
ND-0047. Dados em movimento com Streams/Buffers (365). «package.10.case.txt:30»
ND-0048. Rede bruta com Networking/Sockets (351). «package.10.case.txt:31»
ND-0049. Assincronia distribuída com Messaging/Queues (133). «package.10.case.txt:32»
ND-0050. Acelerar leitura com Caching (119). «package.10.case.txt:33»
ND-0051. Configurar via Config/Env (179). «package.10.case.txt:34»
ND-0052. Transformar dados com Data-Processing (910). «package.10.case.txt:35»
ND-0053. Tratar mídia com Image/Media (804). «package.10.case.txt:36»
ND-0054. Gerar PDF/Documents (58). «package.10.case.txt:37»
ND-0055. Enviar Email (140). «package.10.case.txt:38»
ND-0056. Autenticar com Authentication (136). «package.10.case.txt:39»
ND-0057. Observar com Monitoring/Observability (255). «package.10.case.txt:40»
ND-0058. Entregar com Deployment/CI-CD (313). «package.10.case.txt:41»
ND-0059. Distribuir com Package-Management (252). «package.10.case.txt:42»
ND-0060. Equipar o editor com Editor/IDE-Tools (1071). «package.10.case.txt:43»
ND-0061. Utilitários gerais em Utilities/Misc (6109). «package.10.case.txt:44»
ND-0062. Reduzir Uncategorized (384) a zero re-classificando cada pacote. «package.10.case.txt:45»

### C. Matriz de provedores AI/LLM (@ai-sdk)

ND-0063. Padronizar toda integração de provedores sobre a família @ai-sdk (provider ^4.0.18 + provider-utils + openai-compatible ^3.0.55). «package.10.descricoes (2).txt:121;119»
ND-0064. Prover Anthropic via @ai-sdk/anthropic ^4.0.63. «package.10.descricoes (2).txt:95»
ND-0065. Prover OpenAI via @ai-sdk/openai ^4.0.75. «package.10.descricoes (2).txt:118»
ND-0066. Prover Google via @ai-sdk/google ^4.0.80. «package.10.descricoes (2).txt:108»
ND-0067. Prover Azure via @ai-sdk/azure ^4.0.79. «package.10.descricoes (2).txt:97»
ND-0068. Prover AWS Bedrock via @ai-sdk/amazon-bedrock ^5.0.94. «package.10.descricoes (2).txt:94»
ND-0069. Prover Google Vertex via @ai-sdk/google-vertex. «package.10.case.txt:91»
ND-0070. Prover Groq via @ai-sdk/groq ^4.0.48. «package.10.descricoes (2).txt:110»
ND-0071. Prover Mistral via @ai-sdk/mistral ^4.0.50. «package.10.descricoes (2).txt:117»
ND-0072. Prover DeepSeek via @ai-sdk/deepseek ^3.0.52. «package.10.descricoes (2).txt:102»
ND-0073. Prover xAI Grok via @ai-sdk/xai ^5.0.8. «package.10.descricoes (2).txt:132»
ND-0074. Prover Cerebras via @ai-sdk/cerebras ^3.0.55. «package.10.descricoes (2).txt:98»
ND-0075. Prover Cohere via @ai-sdk/cohere. «package.10.case.txt:81»
ND-0076. Prover Perplexity via @ai-sdk/perplexity. «package.10.case.txt:102»
ND-0077. Prover TogetherAI via @ai-sdk/togetherai. «package.10.case.txt:109»
ND-0078. Prover Fireworks via @ai-sdk/fireworks. «package.10.case.txt:87»
ND-0079. Prover DeepInfra via @ai-sdk/deepinfra. «package.10.case.txt:83»
ND-0080. Prover Alibaba via @ai-sdk/alibaba. «package.10.case.txt:75»
ND-0081. Rotejar modelos via @ai-sdk/gateway ^4.0.92. «package.10.descricoes (2).txt:106»
ND-0082. Conectar servidores MCP via @ai-sdk/mcp ^2.0.58. «package.10.descricoes (2).txt:116»
ND-0083. Expor agentes em React/Svelte/Vue/TUI (@ai-sdk/react ^4.0.117, tui ^1.0.115). «package.10.descricoes (2).txt:123;128»
ND-0084. Suportar o SDK oficial OpenAI ^7.23.0. «package.10.descricoes (2).txt:15890»
ND-0085. Suportar o SDK oficial Anthropic @anthropic-ai/sdk ^0.128.0. «package.10.descricoes (2).txt:238»
ND-0086. Orquestrar cadeias locais com langchain ^1.5.12 e llamaindex ^0.12.1. «package.10.descricoes (2).txt:13884;14127»

### D. Agentes, protocolos e sandboxes

ND-0087. Falar o protocolo Agent2Agent via @a2a-js/sdk ^1.2.1. «package.10.descricoes (2).txt:39»
ND-0088. Falar o protocolo AG-UI via @ag-ui/client ^1.0.0, core ^1.0.0, encoder ^1.0.0, proto ^1.0.0. «package.10.descricoes (2).txt:74-75;77;83»
ND-0089. Pontear AG-UI com CrewAI ^0.0.4, LangGraph ^0.0.43, LlamaIndex, Mastra ^1.1.4 e AWS Strands. «package.10.descricoes (2).txt:76;78;80; package.10.case.txt:63-65»
ND-0090. Pontear AG-UI com o Claude Agent SDK (@ag-ui/claude-agent-sdk). «package.10.case.txt:58»
ND-0091. Ligar agentes a servidores MCP via @ag-ui/mcp-middleware e mcp-apps-middleware. «package.10.case.txt:66-67»
ND-0092. Renderizar UI de subagentes com @a2ui/lit ^0.11.0 + a2ui-toolkit (op builders, prompt assembly, history walkers). «package.10.descricoes (2).txt:40; package.10.case.txt:56»
ND-0093. Padronizar editor↔agente com Agent Client Protocol @agentclientprotocol/sdk ^1.5.0. «package.10.descricoes (2).txt:86»
ND-0094. Embutir Claude Agent SDK ^0.3.282 e Claude Code ^2.1.282 com binários nativos por plataforma (darwin/linux/win/musl). «package.10.descricoes (2).txt:219;228; package.10.case.txt:119-136»
ND-0095. Delimitar segurança de ferramentas com @anthropic-ai/sandbox-runtime ^0.0.77. «package.10.descricoes (2).txt:237»
ND-0096. Persistir memória de agentes com @agentmemory/agentmemory ^0.9.29 (iii-engine). «package.10.descricoes (2).txt:88»
ND-0097. Expor runtime de copiloto com @copilotkit/runtime ^1.73.3. «package.10.descricoes (2).txt:1134»
ND-0098. Canalizar copilotos por Slack/Discord/Teams/Telegram/WhatsApp com o engine JSX agnóstico (@copilotkit/channels-core createChannel/Thread/PlatformAdapter, adaptadores ^0.11.0). «package.10.descricoes (2).txt:1120-1127»
ND-0099. Rodar o DeepSeek Harness: @deepseek-ai/dsh-agent ^0.1.0-rc.6 (registry + vocabulário de eventos). «package.10.descricoes (2).txt:1311»
ND-0100. Fechar o loop do agente com dsh-agent-loop ^0.1.0-rc.6. «package.10.descricoes (2).txt:1314»
ND-0101. Executar bash local como seam com dsh-bash-local ^0.0.1-rc.1. «package.10.descricoes (2).txt:1328»
ND-0102. Expor API remota e autorização com dsh-api-gateway ^0.0.1-rc.1 + dsh-authorization ^0.1.1-rc.1. «package.10.descricoes (2).txt:1320;1326»
ND-0103. Sandboxesear comandos com @cloudflare/sandbox ^0.12.10. «package.10.descricoes (2).txt:1008»
ND-0104. Executar agentes Workers com @cloudflare/shell ^0.4.3, computer ^0.3.1 (FS virtual SQLite), codemode ^0.5.2 e think ^0.19.0 (loop agêntico + stream resumption). «package.10.descricoes (2).txt:1002-1010»
ND-0105. Provisionar sandboxes com OpenSandbox ^1.1.0 (lifecycle + execd + code-interpreter). «package.10.descricoes (2).txt:163; package.10.case.txt:116-117»
ND-0106. Orquestrar agentes Cursor via @cursor/sdk ^1.0.32. «package.10.descricoes (2).txt:1222»
ND-0107. Dar pesquisa web multi-etapa aos agentes via exa-mcp-server ^3.4.1. «package.10.descricoes (2).txt:11218»
ND-0108. Rodar agentes backend duráveis filesystem-first com eve ^0.66.3. «package.10.descricoes (2).txt:11185»

### E. Vetores e inferência local

ND-0109. Indexar vetores localmente com faiss-node ^0.5.1. «package.10.descricoes (2).txt:11398»
ND-0110. Indexar vetores ANN com hnswlib-node ^3.0.0. «package.10.descricoes (2).txt:12661»
ND-0111. Inferir localmente com onnxruntime-node ^1.31.0-dev. «package.10.descricoes (2).txt:15869»
ND-0112. Tokenizar localmente com @anush008/tokenizers (binários darwin/linux/win). «package.10.case.txt:139-142»

### F. Testes

ND-0113. Testar com jest ^30.5.2. «package.10.descricoes (2).txt:13418»
ND-0114. Testar com vitest ^5.0.1. «package.10.descricoes (2).txt:21065»
ND-0115. Testar DOM com @testing-library/dom ^10.4.2, react ^16.3.3, user-event ^14.6.7. «package.10.descricoes (2).txt:5848;5853;5858»
ND-0116. Testar TAP com @tapjs/core ^4.6.0 (node-tap plugável). «package.10.descricoes (2).txt:5771»
ND-0117. Fazer mutation testing com @stryker-mutator/core ^10.0.0. «package.10.descricoes (2).txt:5440»
ND-0118. Subir dependências reais com @testcontainers/mysql, postgresql e redis ^12.1.0. «package.10.descricoes (2).txt:5845-5847»
ND-0119. Cobrir E2E com Cypress (@cypress/code-coverage ^4.0.3 + família @cypress/*). «package.10.descricoes (2).txt:1236; package.10.case.txt:3514-3520»
ND-0120. Automatizar browsers com playwright ^1.63.0 e puppeteer ^25.12.0. «package.10.descricoes (2).txt:16548;17119»
ND-0121. Testar visualmente com percy (appium/selenium-webdriver/webdriverio). «package.10.case.txt:3560-3563»
ND-0122. Testar UI em Storybook com addons a11y/actions/interactions/vitest/themes/viewport. «package.10.case.txt:3576-3589»
ND-0123. Simular DOM com happy-dom ^20.14.5 e jsdom ^30.1.1. «package.10.descricoes (2).txt:12486;13568»
ND-0124. Testar workers com @cloudflare/vitest-pool-workers e congelar tempo com @sinonjs/fake-timers ^15.4.0. «package.10.case.txt:3511; package.10.descricoes (2).txt:5056»

### G. Lint, formatação e qualidade

ND-0125. Lintar com eslint ^10.11.0 (AST-based pattern checker). «package.10.descricoes (2).txt:10945»
ND-0126. Formatar com prettier ^3.9.9. «package.10.descricoes (2).txt:16849»
ND-0127. Rodar toolchain unificada com @biomejs/biome ^2.5.14. «package.10.descricoes (2).txt:781»
ND-0128. Ativar 300+ regras extras com eslint-plugin-unicorn ^76.0.0. «package.10.descricoes (2).txt:11119»
ND-0129. Auditar código com eslint-plugin-security ^4.0.1. «package.10.descricoes (2).txt:11102»
ND-0130. Bloquear Trojan Source com eslint-plugin-anti-trojan-source ^1.1.7. «package.10.descricoes (2).txt:11028»
ND-0131. Proibir código não-sanitizado com eslint-plugin-no-unsanitized ^4.1.5. «package.10.descricoes (2).txt:11076»
ND-0132. Proteger apps Node com firewall embutido @aikidosec/firewall ^1.8.42 (Zen). «package.10.descricoes (2).txt:135»
ND-0133. Prender qualidade ao git com husky ^9.1.7 + lint-staged ^17.5.1 + commitlint ^21.2.3. «package.10.descricoes (2).txt:12812;14090;9477»

### H. Documentação, Markdown e OpenAPI

ND-0134. Compilar MDX com @mdx-js/mdx ^3.1.1. «package.10.descricoes (2).txt:3078»
ND-0135. Sustentar sites de docs com @docusaurus/core ^3.10.2. «package.10.descricoes (2).txt:1588»
ND-0136. Versionar docs e blog com @docusaurus/plugin-content-docs e plugin-content-blog ^3.10.2. «package.10.descricoes (2).txt:1595-1596»
ND-0137. Montar docs modernas com @fumadocs/ui ^16.5.0 + @fumadocs/mdx-remote ^1.5.2. «package.10.descricoes (2).txt:2149;2146»
ND-0138. Destacar código com @shikijs/core ^4.4.3 + themes + transformers + twoslash. «package.10.descricoes (2).txt:5002;5010-5012»
ND-0139. Gerar API reference com @scalar/api-reference ^1.72.0 (+react ^0.9.73). «package.10.descricoes (2).txt:4877-4878»
ND-0140. Parsear OpenAPI com @scalar/openapi-parser ^0.29.6 e versionar com workspace-store ^0.66.0. «package.10.descricoes (2).txt:4888;4909»
ND-0141. Buscar em docs estáticas com @pagefind/default-ui ^1.5.2. «package.10.descricoes (2).txt:4028»
ND-0142. Gerar changelog de git metadata com conventional-changelog ^8.1.3. «package.10.descricoes (2).txt:9636»
ND-0143. Padronizar doc-comments TS com @microsoft/tsdoc ^0.17.0. «package.10.descricoes (2).txt:3123»
ND-0144. Editar Markdown no workbench com @uiw/react-md-editor ^4.1.2 e @mdxeditor/editor ^4.2.5. «package.10.descricoes (2).txt:6849;3082»
ND-0145. Renderizar markdown/MDX/docs+código/changelogs/CLI-reference nas camadas do workbench. «package.10.case.txt:7000-7184»

### I. Streams e pipeline do gateway

ND-0146. Compor streams com minipass ^7.1.3. «package.10.descricoes (2).txt:14909»
ND-0147. Usar streamx ^2.28.1 (iteração melhorada dos streams core). «package.10.descricoes (2).txt:19274»
ND-0148. Injetar transformações com through2 ^5.0.11. «package.10.descricoes (2).txt:19847»
ND-0149. Pipeline JSON com stream-json ^3.7.0. «package.10.descricoes (2).txt:19243»
ND-0150. Serializar NDJSON com ndjson ^2.0.0. «package.10.descricoes (2).txt:15310»
ND-0151. Usar o cinto de utilidades mississippi ^4.0.0. «package.10.descricoes (2).txt:14927»
ND-0152. Ler/gravar tar com tar-stream ^3.2.1 + tar-fs ^3.1.3. «package.10.descricoes (2).txt:19620;19618»
ND-0153. Tar zero-dependency com modern-tar ^0.8.5. «package.10.descricoes (2).txt:15052»
ND-0154. Consumir SSE com eventsource ^5.1.2 e parsear com eventsource-parser ^4.1.1. «package.10.descricoes (2).txt:11208;11210»
ND-0155. Fazer fetch de EventSource com @ai-zen/node-fetch-event-source ^2.1.4. «package.10.descricoes (2).txt:133»
ND-0156. Throttle de respostas com speed-limiter ^1.0.2. «package.10.descricoes (2).txt:19025»
ND-0157. Comprimir pipelines com lz4 ^0.6.5 e zstd ^1.0.4. «package.10.descricoes (2).txt:14388;21809»

### J. Web, dados e segurança

ND-0158. Servir HTTP com express ^5.2.1. «package.10.descricoes (2).txt:11340»
ND-0159. Servir HTTP de baixa latência com fastify ^5.12.5. «package.10.descricoes (2).txt:11472»
ND-0160. Rodar edge no Cloudflare Workers com worktop ^0.7.3. «package.10.descricoes (2).txt:21541»
ND-0161. Servir GraphQL com @apollo/server ^5.5.1. «package.10.descricoes (2).txt:258»
ND-0162. WebSocket com ws ^8.21.3. «package.10.descricoes (2).txt:21562»
ND-0163. Clientes HTTP: axios ^1.20.0, got ^16.0.0, node-fetch ^3.3.2, undici ^8.11.2. «package.10.descricoes (2).txt:8136;12262;15481;20470»
ND-0164. ETags com etag ^1.8.1. «package.10.descricoes (2).txt:11177»
ND-0165. Headers de segurança com helmet ^8.3.0. «package.10.descricoes (2).txt:12604»
ND-0166. IPC local/remoto com @achrinza/node-ipc ^9.2.10. «package.10.descricoes (2).txt:43»
ND-0167. Validar schemas com zod ^4.6.5, ajv ^8.20.0, joi ^18.2.9. «package.10.descricoes (2).txt:21791;7589;13490»
ND-0168. Persistir com drizzle-orm ^0.45.3, mongoose ^9.10.2, knex ^3.3.0. «package.10.descricoes (2).txt:10512;15093;13817»
ND-0169. Enfileirar com bullmq ^6.3.8 sobre redis ^6.2.1 / ioredis ^6.0.0. «package.10.descricoes (2).txt:8792;17757;13122»
ND-0170. Cachear LRU com @alloc/quick-lru ^5.3.0. «package.10.descricoes (2).txt:165»
ND-0171. Cripto de app: bcryptjs ^3.0.3, jsonwebtoken ^9.0.3, xml-crypto ^6.3.2. «package.10.descricoes (2).txt:8421;13656;21622»
ND-0172. Resolver captcha com @2captcha/captcha-solver ^1.3.9. «package.10.descricoes (2).txt:37»

### K. CLI, desktop e UI

ND-0173. Parsear CLI com commander ^15.0.0. «package.10.descricoes (2).txt:9466»
ND-0174. Prompt interativo com inquirer ^14.2.2. «package.10.descricoes (2).txt:13048»
ND-0175. Estilizar terminal com chalk ^6.0.0. «package.10.descricoes (2).txt:9022»
ND-0176. Spinner com ora ^9.4.1. «package.10.descricoes (2).txt:15991»
ND-0177. Executar processos com execa ^10.0.1 e cross-spawn ^7.0.6. «package.10.descricoes (2).txt:11233;9820»
ND-0178. Scriptar com zx ^8.8.5. «package.10.descricoes (2).txt:21816»
ND-0179. Arte ASCII com figlet ^1.11.4. «package.10.descricoes (2).txt:11551»
ND-0180. Notificar e abrir: node-notifier ^10.0.1, open ^11.0.4. «package.10.descricoes (2).txt:15524;15879»
ND-0181. Vigiar e varrer arquivos: chokidar ^5.0.0, glob ^13.0.6, fs-extra ^11.4.1, rimraf ^6.1.3. «package.10.descricoes (2).txt:9100;12134;11850;18091»
ND-0182. Zipar com adm-zip ^0.6.1. «package.10.descricoes (2).txt:7494»
ND-0183. Versionar e identificar: semver ^7.8.5, uuid ^14.0.2 (RFC9562). «package.10.descricoes (2).txt:18532;20767»
ND-0184. Desktop com electron ^44.4.5. «package.10.descricoes (2).txt:10662»
ND-0185. Editor embutido com monaco-editor ^0.57.0. «package.10.descricoes (2).txt:15082»
ND-0186. Visualização: three ^0.186.1, d3 ^7.9.0, echarts ^6.1.0. «package.10.descricoes (2).txt:19806;9975;10616»
ND-0187. Workbench web: react ^19.3.0, next ^16.3.6, tailwindcss ^4.3.3. «package.10.descricoes (2).txt:17349;15369;19595»
ND-0188. Estado e util: immer ^11.1.18, jotai ^3.0.0, nanostores ^1.5.3, lodash ^4.18.1. «package.10.descricoes (2).txt:12945;13498;15262;14191»
ND-0189. Tempo: dayjs ^1.11.23, luxon ^3.7.2, date-fns ^4.4.0. «package.10.descricoes (2).txt:10081;14380;10065»
ND-0190. Conteúdo: marked ^18.0.14, remark ^15.0.1, turndown ^7.2.4 (HTML→MD), cheerio ^1.2.0. «package.10.descricoes (2).txt:14519;17873;20294;9083»
ND-0191. Imagem com sharp ^0.35.4. «package.10.descricoes (2).txt:18653»
ND-0192. Planilhas com xlsx ^0.18.5 e exceljs ^4.4.0. «package.10.descricoes (2).txt:21617;11225»
ND-0193. Empacotar com esbuild ^0.28.2, rollup ^4.63.5, webpack ^5.111.1. «package.10.descricoes (2).txt:10887;18134;21347»
ND-0194. Web3 opcional com ethers ^6.17.0. «package.10.descricoes (2).txt:11179»

### L. Provenance (pkg → repo upstream)

ND-0195. Todo pacote deve ter repositório upstream mapeado (19.691 pares pkg→URL). «package.10.repos (2).txt:1-300»
ND-0196. Famílias compartilham repo canônico: @ai-sdk/* → vercel/ai. «package.10.repos (2).txt:75-110»
ND-0197. @angular/* → angular/angular ou angular/angular-cli; @actions/* → actions/toolkit. «package.10.repos (2).txt:1-300»
ND-0198. workbox-* → googlechrome/workbox; @algolia/* → algolia/algoliasearch-client-javascript. «package.10.repos (2).txt:1-300;19400-19691»
ND-0199. zod → colinhacks/zod; zx → google/zx; ws → websockets/ws. «package.10.repos (2).txt:19400-19691»
ND-0200. URLs GitLab são válidas como upstream (worker-f, write-excel-file, workflow_builder). «package.10.repos (2).txt:19400-19691»
ND-0201. Upstream não-canônico (yt-dlp → koyeb.app/pkg) deve ser marcado para auditoria. «package.10.repos (2).txt:19400-19691»
ND-0202. Binários nativos por plataforma (claude-code/claude-agent-sdk/tokenizers/ast-grep/astro-compiler -darwin/-linux/-win/-musl) entram como pacotes separados, nunca agregados. «package.10.case.txt:120-142; package.10.descricoes (2).txt:220-236»

### M. Higiene do catálogo

ND-0203. Pacotes `security holding` (2x, 2x2, 4x, 8x, eslint-v7/v9) ficam fora do build. «package.10.descricoes (2).txt:13-14;19;29»
ND-0204. Descrições vazias (2c, 4c, 5c, 6z, 7c, 9c, @ai-sdk/alibaba, @agentwire/*) devem ser preenchidas antes do uso em feature. «package.10.descricoes (2).txt:7;17;20;22;24;30;87-94»
ND-0205. Pacotes WIP (7z: "WORK IN PROGRESS, DON'T EVEN THINK OF USING THIS LIB") proibidos em produção. «package.10.descricoes (2).txt:25»
ND-0206. Placeholders (2k, 4k, example "No README.md") não contam como capacidade real. «package.10.descricoes (2).txt:12;18»
ND-0207. Variantes de plataforma (wasm32-wasi, musl, msvc, arm64/x64) não devem ser deduplicadas. «package.10.case.txt:7000-7006»
ND-0208. Tooling de profiling (0x, flamegraph single-command) é permitido como meta-pacote. «package.10.descricoes (2).txt:2»
ND-0209. Categorizar TODO pacote; alvo Uncategorized = 0 (384 atuais). «package.10.case.txt:45»
ND-0210. Re-triar periodicamente as maiores categorias: UI-Components (1619) e Utilities/Misc (6109). «package.10.case.txt:27;44»
ND-0211. Priorizar curadoria por volume: Build-Tools (1302), Data-Processing (910), AI/LLM (809). «package.10.case.txt:21;35;6»
ND-0212. Cada categoria deve ter header `##` próprio e contagem no índice. «package.10.case.txt:4-46»
ND-0213. Casos de uso DevThink devem ser declarados por pacote no formato `*DevThink use:* …`. «package.10.case.txt:47-233»
ND-0214. Todo uso de dependência deve herdar o "DevThink use" da sua categoria (ex.: Streams → "process streaming gateway responses efficiently"). «package.10.case.txt:10500-10684»

---

## FEATURES F-DTK

### v10.0.0 — Catálogo e manifesto (shipped)

F-DTK-300. Manifesto npm único `devthink` v10.0.0 — 21.817 dependencies + 43.636 devDependencies + engines de 16 runtimes (shipped) [v10.0.0] «package.10 (10).txt:1-3;6;21824-21840;65464-65481»
F-DTK-301. Catálogo de use-cases DevThink em 40 categorias com 21.818 pacotes (shipped) [v10.0.0] «package.10.case.txt:1-45»
F-DTK-302. Mapa de provenance pkg→repo upstream com 19.691 entradas GitHub/GitLab (shipped) [v10.0.0] «package.10.repos (2).txt:1-300;19400-19691»

### v10.0.0 — Categorias como capacidades (planned)

F-DTK-303. AI/LLM — 809 pacotes para LLM providers + agent runs no CLI/gateway (planned) [v10.0.0] «package.10.case.txt:6;47-233»
F-DTK-304. Embeddings/Vector-DB — 56 pacotes (planned) [v10.0.0] «package.10.case.txt:7»
F-DTK-305. Browser-Automation — 141 pacotes (planned) [v10.0.0] «package.10.case.txt:8»
F-DTK-306. Web-Scraping — 61 pacotes (planned) [v10.0.0] «package.10.case.txt:9»
F-DTK-307. HTTP-Client — 264 pacotes (planned) [v10.0.0] «package.10.case.txt:10»
F-DTK-308. Web-Server — 281 pacotes (planned) [v10.0.0] «package.10.case.txt:11»
F-DTK-309. Web-Framework — 361 pacotes (planned) [v10.0.0] «package.10.case.txt:12»
F-DTK-310. Database — 288 pacotes (planned) [v10.0.0] «package.10.case.txt:13»
F-DTK-311. ORM/ODM — 64 pacotes (planned) [v10.0.0] «package.10.case.txt:14»
F-DTK-312. Validation/Schema — 339 pacotes (planned) [v10.0.0] «package.10.case.txt:15»
F-DTK-313. Logging — 124 pacotes (planned) [v10.0.0] «package.10.case.txt:16»
F-DTK-314. Date-Time — 146 pacotes (planned) [v10.0.0] «package.10.case.txt:17»
F-DTK-315. Crypto/Security — 463 pacotes (planned) [v10.0.0] «package.10.case.txt:18»
F-DTK-316. Testing — 691 pacotes (planned) [v10.0.0] «package.10.case.txt:19»
F-DTK-317. Linting/Formatting — 565 pacotes (planned) [v10.0.0] «package.10.case.txt:20»
F-DTK-318. Build-Tools — 1.302 pacotes (planned) [v10.0.0] «package.10.case.txt:21»
F-DTK-319. Bundlers — 247 pacotes (planned) [v10.0.0] «package.10.case.txt:22»
F-DTK-320. CLI-Tools — 688 pacotes (planned) [v10.0.0] «package.10.case.txt:23»
F-DTK-321. Markdown/Docs — 521 pacotes (planned) [v10.0.0] «package.10.case.txt:24»
F-DTK-322. i18n/l10n — 119 pacotes (planned) [v10.0.0] «package.10.case.txt:25»
F-DTK-323. State-Management — 101 pacotes (planned) [v10.0.0] «package.10.case.txt:26»
F-DTK-324. UI-Components — 1.619 pacotes (planned) [v10.0.0] «package.10.case.txt:27»
F-DTK-325. CSS/Styling — 514 pacotes (planned) [v10.0.0] «package.10.case.txt:28»
F-DTK-326. File-System — 475 pacotes (planned) [v10.0.0] «package.10.case.txt:29»
F-DTK-327. Streams/Buffers — 365 pacotes (planned) [v10.0.0] «package.10.case.txt:30»
F-DTK-328. Networking/Sockets — 351 pacotes (planned) [v10.0.0] «package.10.case.txt:31»
F-DTK-329. Messaging/Queues — 133 pacotes (planned) [v10.0.0] «package.10.case.txt:32»
F-DTK-330. Caching — 119 pacotes (planned) [v10.0.0] «package.10.case.txt:33»
F-DTK-331. Config/Env — 179 pacotes (planned) [v10.0.0] «package.10.case.txt:34»
F-DTK-332. Data-Processing — 910 pacotes (planned) [v10.0.0] «package.10.case.txt:35»
F-DTK-333. Image/Media — 804 pacotes (planned) [v10.0.0] «package.10.case.txt:36»
F-DTK-334. PDF/Documents — 58 pacotes (planned) [v10.0.0] «package.10.case.txt:37»
F-DTK-335. Email — 140 pacotes (planned) [v10.0.0] «package.10.case.txt:38»
F-DTK-336. Authentication — 136 pacotes (planned) [v10.0.0] «package.10.case.txt:39»
F-DTK-337. Monitoring/Observability — 255 pacotes (planned) [v10.0.0] «package.10.case.txt:40»
F-DTK-338. Deployment/CI-CD — 313 pacotes (planned) [v10.0.0] «package.10.case.txt:41»
F-DTK-339. Package-Management — 252 pacotes (planned) [v10.0.0] «package.10.case.txt:42»
F-DTK-340. Editor/IDE-Tools — 1.071 pacotes (planned) [v10.0.0] «package.10.case.txt:43»
F-DTK-341. Utilities/Misc — 6.109 pacotes (planned) [v10.0.0] «package.10.case.txt:44»
F-DTK-342. Uncategorized — 384 pacotes como dívida de triagem (planned) [v10.0.0] «package.10.case.txt:45»

### v10.0.0 — IA, agentes e sandboxes (planned)

F-DTK-343. Matriz unificada de 30+ provedores LLM via @ai-sdk (anthropic/openai/google/azure/bedrock/vertex/groq/mistral/deepseek/xai/cerebras/cohere/perplexity/togetherai/fireworks/deepinfra/alibaba…) (planned) [v10.0.0] «package.10.case.txt:75-114; package.10.descricoes (2).txt:94-132»
F-DTK-344. Protocolo AG-UI (client/core/encoder/proto ^1.0.0) com pontes CrewAI/LangGraph/LlamaIndex/Mastra/AWS Strands (planned) [v10.0.0] «package.10.descricoes (2).txt:74-83»
F-DTK-345. Protocolo A2A (Agent2Agent) via @a2a-js/sdk ^1.2.1 (planned) [v10.0.0] «package.10.descricoes (2).txt:39»
F-DTK-346. ACP — Agent Client Protocol ^1.5.0 para comunicação editor↔agente (planned) [v10.0.0] «package.10.descricoes (2).txt:86»
F-DTK-347. MCP — @ai-sdk/mcp ^2.0.58 + @ag-ui/mcp-middleware e mcp-apps-middleware (planned) [v10.0.0] «package.10.descricoes (2).txt:116; package.10.case.txt:66-67»
F-DTK-348. A2UI — subagent tools + renderer Lit (@a2ui/lit ^0.11.0, a2ui-toolkit) (planned) [v10.0.0] «package.10.descricoes (2).txt:40; package.10.case.txt:56»
F-DTK-349. Claude Agent SDK ^0.3.282 + Claude Code ^2.1.282 com binários nativos por plataforma (planned) [v10.0.0] «package.10.descricoes (2).txt:219;228»
F-DTK-350. Anthropic Sandbox Runtime ^0.0.77 (limites de segurança general-purpose para ferramentas) (planned) [v10.0.0] «package.10.descricoes (2).txt:237»
F-DTK-351. CopilotKit runtime ^1.73.3 + canais JSX Slack/Discord/Teams/Telegram/WhatsApp ^0.11.0 (planned) [v10.0.0] «package.10.descricoes (2).txt:1134;1120-1127»
F-DTK-352. DeepSeek Harness (dsh-agent/agent-loop/bash-local/api-gateway/authorization rc) (planned) [v10.0.0] «package.10.descricoes (2).txt:1311-1328»
F-DTK-353. Cloudflare agents — sandbox ^0.12.10, shell ^0.4.3, computer ^0.3.1, codemode ^0.5.2, think ^0.19.0 (planned) [v10.0.0] «package.10.descricoes (2).txt:1002-1010»
F-DTK-354. OpenSandbox SDK ^1.1.0 — lifecycle + execd + code interpreter (planned) [v10.0.0] «package.10.descricoes (2).txt:163; package.10.case.txt:116-117»
F-DTK-355. Orquestração de agentes Cursor via @cursor/sdk ^1.0.32 (planned) [v10.0.0] «package.10.descricoes (2).txt:1222»
F-DTK-356. Memória persistente de agentes (agentmemory iii-engine ^0.9.29) (planned) [v10.0.0] «package.10.descricoes (2).txt:88»
F-DTK-357. Busca vetorial local — faiss-node ^0.5.1 + hnswlib-node ^3.0.0 (planned) [v10.0.0] «package.10.descricoes (2).txt:11398;12661»
F-DTK-358. Inferência ONNX local (onnxruntime-node ^1.31.0-dev) + tokenizers nativos multi-OS (planned) [v10.0.0] «package.10.descricoes (2).txt:15869; package.10.case.txt:139-142»
F-DTK-359. Pesquisa web multi-etapa para agentes (exa-mcp-server ^3.4.1) (planned) [v10.0.0] «package.10.descricoes (2).txt:11218»
F-DTK-360. Agentes backend duráveis filesystem-first (eve ^0.66.3) (planned) [v10.0.0] «package.10.descricoes (2).txt:11185»
F-DTK-361. Voz via @ai-sdk — elevenlabs/deepgram/assemblyai/gladia/revai/lmnt (TTS/STT) (planned) [v10.0.0] «package.10.case.txt:82;85;89;96;107;108»
F-DTK-362. Suíte de testes — jest ^30.5.2 + vitest ^5.0.1 + @testing-library (planned) [v10.0.0] «package.10.descricoes (2).txt:13418;21065;5848-5858»
F-DTK-363. Testcontainers MySQL/PostgreSQL/Redis ^12.1.0 (planned) [v10.0.0] «package.10.descricoes (2).txt:5845-5847»
F-DTK-364. Mutation testing com Stryker ^10.0.0 (planned) [v10.0.0] «package.10.descricoes (2).txt:5440»
F-DTK-365. E2E de browser — Playwright ^1.63.0 + Puppeteer ^25.12.0 + Cypress (code-coverage ^4.0.3) (planned) [v10.0.0] «package.10.descricoes (2).txt:16548;17119;1236»
F-DTK-366. Visual testing com Percy (appium/selenium-webdriver/webdriverio) (planned) [v10.0.0] «package.10.case.txt:3560-3563»
F-DTK-367. Storybook com addons a11y/interactions/vitest/themes/viewport (planned) [v10.0.0] «package.10.case.txt:3576-3589»
F-DTK-368. DOM sintético — happy-dom ^20.14.5 / jsdom ^30.1.1 + fake-timers ^15.4.0 (planned) [v10.0.0] «package.10.descricoes (2).txt:12486;13568;5056»

### v10.0.0 — Qualidade, docs, gateway e runtime (planned)

F-DTK-369. Lint/formatação — ESLint ^10.11.0 + Prettier ^3.9.9 + Biome ^2.5.14 (planned) [v10.0.0] «package.10.descricoes (2).txt:10945;16849;781»
F-DTK-370. Segurança estática — eslint-plugin-security/anti-trojan-source/no-unsanitized + Aikido Zen firewall ^1.8.42 (planned) [v10.0.0] «package.10.descricoes (2).txt:11102;11028;11076;135»
F-DTK-371. Git hooks — husky ^9.1.7 + lint-staged ^17.5.1 + commitlint ^21.2.3 (planned) [v10.0.0] «package.10.descricoes (2).txt:12812;14090;9477»
F-DTK-372. Docs MDX — @mdx-js/mdx ^3.1.1 + fumadocs ^16.5.0 + mdx-remote ^1.5.2 (planned) [v10.0.0] «package.10.descricoes (2).txt:3078;2149;2146»
F-DTK-373. Docusaurus ^3.10.2 com plugins docs/blog/pages/sitemap/analytics/svgr (planned) [v10.0.0] «package.10.descricoes (2).txt:1588;1595-1596; package.10.case.txt:7013-7037»
F-DTK-374. Syntax highlight Shiki ^4.4.3 (langs/themes/transformers/twoslash) (planned) [v10.0.0] «package.10.descricoes (2).txt:5002;5010-5012»
F-DTK-375. API Reference OpenAPI — Scalar ^1.72.0 + openapi-parser ^0.29.6 + workspace-store ^0.66.0 (planned) [v10.0.0] «package.10.descricoes (2).txt:4877;4888;4909»
F-DTK-376. Busca estática de docs com Pagefind ^1.5.2 (planned) [v10.0.0] «package.10.descricoes (2).txt:4028»
F-DTK-377. Changelog convencional ^8.1.3 a partir de git metadata (planned) [v10.0.0] «package.10.descricoes (2).txt:9636»
F-DTK-378. Edição de Markdown no workbench — @uiw/react-md-editor ^4.1.2 + @mdxeditor/editor ^4.2.5 (planned) [v10.0.0] «package.10.descricoes (2).txt:6849;3082»
F-DTK-379. Toolkit de streams do gateway — minipass ^7.1.3, streamx ^2.28.1, through2 ^5.0.11, mississippi ^4.0.0 (planned) [v10.0.0] «package.10.descricoes (2).txt:14909;19274;19847;14927»
F-DTK-380. JSON streaming — ndjson ^2.0.0 + stream-json ^3.7.0 (planned) [v10.0.0] «package.10.descricoes (2).txt:15310;19243»
F-DTK-381. SSE universal — eventsource ^5.1.2 + eventsource-parser ^4.1.1 + node-fetch-event-source ^2.1.4 (planned) [v10.0.0] «package.10.descricoes (2).txt:11208;11210;133»
F-DTK-382. Compactação/tar — lz4 ^0.6.5, zstd ^1.0.4, tar-stream ^3.2.1, tar-fs ^3.1.3, modern-tar ^0.8.5 (planned) [v10.0.0] «package.10.descricoes (2).txt:14388;21809;19620;19618;15052»
F-DTK-383. Servidores — express ^5.2.1, fastify ^5.12.5, worktop ^0.7.3 (Workers), Apollo ^5.5.1 (planned) [v10.0.0] «package.10.descricoes (2).txt:11340;11472;21541;258»
F-DTK-384. WebSocket/IPC — ws ^8.21.3 + @achrinza/node-ipc ^9.2.10 (planned) [v10.0.0] «package.10.descricoes (2).txt:21562;43»
F-DTK-385. HTTP clients — axios ^1.20.0, got ^16.0.0, node-fetch ^3.3.2, undici ^8.11.2 (planned) [v10.0.0] «package.10.descricoes (2).txt:8136;12262;15481;20470»
F-DTK-386. Filas Redis — bullmq ^6.3.8 + redis ^6.2.1 + ioredis ^6.0.0 (planned) [v10.0.0] «package.10.descricoes (2).txt:8792;17757;13122»
F-DTK-387. ORM/ODM — drizzle ^0.45.3, mongoose ^9.10.2, knex ^3.3.0 (planned) [v10.0.0] «package.10.descricoes (2).txt:10512;15093;13817»
F-DTK-388. Validação — zod ^4.6.5, ajv ^8.20.0, joi ^18.2.9 (planned) [v10.0.0] «package.10.descricoes (2).txt:21791;7589;13490»
F-DTK-389. Auth/segurança HTTP — helmet ^8.3.0, bcryptjs ^3.0.3, jsonwebtoken ^9.0.3, xml-crypto ^6.3.2, 2captcha ^1.3.9 (planned) [v10.0.0] «package.10.descricoes (2).txt:12604;8421;13656;21622;37»
F-DTK-390. Workbench web — react ^19.3.0 + next ^16.3.6 + tailwindcss ^4.3.3 (planned) [v10.0.0] «package.10.descricoes (2).txt:17349;15369;19595»
F-DTK-391. 3D e charts — three ^0.186.1, d3 ^7.9.0, echarts ^6.1.0 (planned) [v10.0.0] «package.10.descricoes (2).txt:19806;9975;10616»
F-DTK-392. Desktop — electron ^44.4.5 + monaco-editor ^0.57.0 + terminal xterm (upstream xtermjs/xterm.js) (planned) [v10.0.0] «package.10.descricoes (2).txt:10662;15082; package.10.repos (2).txt:19400-19691»
F-DTK-393. CLI toolkit — commander ^15.0.0, inquirer ^14.2.2, chalk ^6.0.0, ora ^9.4.1, execa ^10.0.1, zx ^8.8.5, figlet ^1.11.4 (planned) [v10.0.0] «package.10.descricoes (2).txt:9466;13048;9022;15991;11233;21816;11551»
F-DTK-394. FS/arquivos — chokidar ^5.0.0, glob ^13.0.6, fs-extra ^11.4.1, rimraf ^6.1.3, adm-zip ^0.6.1, semver ^7.8.5, uuid ^14.0.2 (planned) [v10.0.0] «package.10.descricoes (2).txt:9100;12134;11850;18091;7494;18532;20767»
F-DTK-395. Conteúdo — marked ^18.0.14, remark ^15.0.1, turndown ^7.2.4, cheerio ^1.2.0 (planned) [v10.0.0] «package.10.descricoes (2).txt:14519;17873;20294;9083»
F-DTK-396. Mídia/dados — sharp ^0.35.4, xlsx ^0.18.5, exceljs ^4.4.0, ethers ^6.17.0 (planned) [v10.0.0] «package.10.descricoes (2).txt:18653;21617;11225;11179»
F-DTK-397. Build — esbuild ^0.28.2, rollup ^4.63.5, webpack ^5.111.1 (planned) [v10.0.0] «package.10.descricoes (2).txt:10887;18134;21347»
F-DTK-398. Estado/util — immer ^11.1.18, jotai ^3.0.0, nanostores ^1.5.3, lodash ^4.18.1, dayjs ^1.11.23, luxon ^3.7.2, date-fns ^4.4.0 (planned) [v10.0.0] «package.10.descricoes (2).txt:12945;13498;15262;14191;10081;14380;10065»

---

## CONTAGEM

- **REGRAS ND**: ND-0001 … ND-0214 = **214 regras** (blocos: A manifesto/engines 22, B categorias 40, C AI/LLM 24, D agentes 22, E vetores 4, F testes 12, G lint 9, H docs 12, I streams 12, J web/dados 17, K CLI/UI 22, L provenance 8, M higiene 10) — todas com «arquivo:linhas» de conteúdo realmente lido.
- **FEATURES F-DTK**: F-DTK-300 … F-DTK-398 = **99 features** (3 shipped + 96 planned; todas [v10.0.0], respeitando o teto de 99/versão de features.md). F-DTK-200..235 (onda 4d) não colidem.
- **Fontes**: 4 arquivos-alvo; ~1.100 linhas de case.txt efetivamente exibidas (4 janelas prescritas, extrator compacto), 465 de descricoes + ~200 linhas via grep com nº de linha, 592 de repos (2 amostras), ~60 de package.10 (10).txt + contagens awk (21.817 deps / 43.636 devDeps).
- **Pulados/limitados (documentado)**: repos integral (1,29 MB, JSON plano repetitivo — amostrado 2×300 linhas); resto das 4 janelas do case além das 185 linhas/janela exibidas (padrões "DevThink use" repetem por cluster; headers das 40 categorias mapeados 100% via grep -n: AI/LLM 47, Embeddings 859, Browser-Automation 918, Web-Scraping 1062, HTTP-Client 1126, Web-Server 1393, Web-Framework 1677, Database 2041, ORM 2332, Validation 2399, Logging 2741, Date-Time 2868, Crypto 3017, Testing 3483, Linting 4177, Build-Tools 4745, Bundlers 6050, CLI-Tools 6300, Markdown 6991, i18n 7515, State 7637, UI-Components 7741, CSS 9363, File-System 9880, Streams 10358, Networking 10726, Messaging 11080, Caching 11216, Config 11338, Data-Processing 11520, Image 12433, PDF 13240, Email 13301, Auth 13444, Monitoring 13583, Deployment 13841, Pkg-Mgmt 14157, Editor 14412, Utilities 15486).
- **Verificação**: numerar sequencial sem lacunas; nada inventado; pacotes "security holding"/WIP/placeholders registrados como regras de exclusão, não como capacidade.
- Fusão (orquestrador): ND-0001..0214 → regras.md PARTE 5/6 (prefixo DTK); F-DTK-300..398 → features.md seção devthink.
