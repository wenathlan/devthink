## 5. REGRAS POR APP

Fontes: neodocs-captures (raiz-saddle-devthink-design, saddle-dns-extension-misc, stealthhead, debonair, cli, devthink-lookup, neochatinterface-neodevthink, neoskills-design, anotepad-p1/p2, 12conversations-p3, raiz-models-instrutions) + contexto2 (ARVORE-COMPLETA (2).md, regras-totais.md) + repo getry (docs/skills/gateway-deploy.md, worklog.md). Origem citada em `«…»` por regra. Nada inventado; regra-mãe + sub-regras.

### devthink

APP-0001. devthink — Posicione o devthink como OS e superplataforma, o "sistema app" que engloba todos os demais; apresentação "DevThink", técnico "devthink" (`@wenathlan/devthink`). «ARVORE:9; devthink-lookup D1»
APP-0002. devthink — Absorva devthinkos, cli-desktop, SoFlowX, akash, extension, gateway e maene no devthink e embuta owni; fusão sem perda, nada apagado. «ARVORE:9; devthink-lookup R2»
APP-0003. devthink — Não implemente lógica própria de vídeo, imagem, 3D ou áudio no devthink: importe das bibliotecas publicadas (saddle, argan, katexis, versawase). «ARVORE:9»
APP-0004. devthink — Use o saddle como sandbox e VM runner do devthink ("with saddle as its sandbox and VM runner"); o devthink nunca roda sandbox própria. «regras-totais Scope»
APP-0005. devthink — Publique o devthink em todos os registros (npmjs, GH-npm, GHCR, Maven, NuGet, RubyGems) e rode a mesma interface em tudo: CLI = web = TV. «ARVORE:9; regras-totais Checklist 7»
APP-0006. devthink — Nomeie o navegador interno de DevThink e trate-o como app nativo do OS. «ARVORE:9»
APP-0007. devthink — Ofereça 35 páginas nativas no tema e trate news como página (News/News.tsx), não como feed externo. «ARVORE:9,416-450»
APP-0008. devthink — Estruture páginas como pastas-âncora: Onboarding/, Login/, News/, Audio/, Video/, Image/, Notes/, PhotoEditor/, VideoEditor/, Browser/, Terminal/, Files/, Gallery/. «ARVORE:416-428»
APP-0009. devthink — Complete o tema com Connectors/, Automations/, Deploy/, Security/, Docs/, Data/, Music/, Camera/, Recorder/, Mail/, Calendar/, Calculator/ e Maps/. «ARVORE:429-441»
APP-0010. devthink — Feche o tema com Store/, Console/, Gatewayview/, Home/, Notfound/, Projects/, Providers/, Settings/ e Usage/. «ARVORE:442-450»
APP-0011. devthink — Renderize a mesma página em todos os alvos (web, TV landscape, Capacitor portrait, desktop Tauri, extensão): um design só, só muda responsividade. «regras-totais Web Universal; ARVORE Tema 5»
APP-0012. devthink — Roteie por `app.tsx` universal (camada 1) carregando entrypoints de pasta (camada 2); App.tsx self-mount sem main.tsx. «raiz-saddle devthink2:7454; regras-totais App self-mount»
APP-0013. devthink — Implemente cada página = 1 pasta isolada com TODOS os componentes embutidos; a pasta recebe o nome da página. «raiz-saddle devthink2:7454-7461»
APP-0014. devthink — Agrupe 30–40 lógicas correlatas por arquivo/página/pasta; nomes-palavra-chave diretos, sem underscore, hífen ou pontos; subcomponentes entre parênteses. «raiz-saddle devthink2:6192,8816»
APP-0015. devthink — Descreva spec sem código: codeboxes descrevem tela→componentes→fluxo (readme por página), nunca implementação. «raiz-saddle devthink2:7452»
APP-0016. devthink — Provisione automaticamente SpaceId, SandboxId (VM), SessionId e MessageId a cada nova conversa — a conversa JÁ NASCE com sandbox. «raiz-models FEATURES; raiz-saddle devthink2:5592»
APP-0017. devthink — Trate chat = agente como sinônimos ("chat turbinado"); a separação correta é conversa↔VM, nunca chat↔agente. «raiz-models DECISÕES 1; raiz-saddle DECISÕES Devthink»
APP-0018. devthink — Abra a VM da conversa via StackBlitz WebContainer ou Docker microVM — virtualização 100% lógica, sem hardware físico. «raiz-models FEATURES; 12conv-p3 VSE»
APP-0019. devthink — Isole banco por conversa (Drizzle ORM + Prisma Schema) e provisione 15–40 DBs estáticos por usuário novo, mais os DBs das sandboxes. «raiz-saddle devthink2:5592; raiz-models»
APP-0020. devthink — Persista settings por user id em Drizzle. «raiz-saddle devthink2:14640»
APP-0021. devthink — Embuta no chat: terminal xterm com monitor de processos, browser headless com stream + inspector de rede, editor Monaco com diffs. «raiz-saddle devthink2:5812-5862»
APP-0022. devthink — Implemente approval modal com diff/comando e níveis de risco (allow once / allow always / deny) antes de toda ação sensível. «raiz-saddle devthink2:5812; raiz-models»
APP-0023. devthink — Disponibilize kill-switch de emergência que mata processos da VM e cancela chamadas de API, com restore/export/resume de checkpoint. «raiz-saddle DICIONÁRIO; devthink-lookup F»
APP-0024. devthink — Bloqueie execução automática por padrão; escopo por site HTTPS; parada e revogação sempre disponíveis (postura "Controle antes da ação"). «raiz-saddle devthink2:5099-5118»
APP-0025. devthink — Documente as 8 Telas Mestras: Runtime Dashboard; Workspace & Agent Environment (Ubuntu 24.04, git, port forwarding); Reasoning Prompt & Multi-Model Dispatcher (thinking slider low→max); Extensions & Connectors Hub (MCP por URL/JSON); Automations & Scheduled Cron; Artifacts & Storage Library; Banco de Dados relacional; +. «raiz-saddle devthink2:5295-5584»
APP-0026. devthink — Conte 45 telas / 3.420 componentes em 9 grupos: público/auth ~340, onboarding ~210, chat-agente ~820, projetos/computação ~410, conectores/MCP ~390, automações ~360, biblioteca/multimodal ~380, segurança/auditoria ~270, configurações ~240. «raiz-saddle devthink2:5648-5681; raiz-models»
APP-0027. devthink — Siga o fluxo de jornada: Landing → Auth OAuth (GitHub/Google/Discord) → Welcome → Tour Magnético → Importador de Memórias → Chat com VM automática → terminal/browser/editor embutidos → checkpoint humano → kill-switch → Projects/Connectors/Automations/Library/Security/Settings. «raiz-saddle devthink2:5603-5643; raiz-models»
APP-0028. devthink — Crie IDs SpaceId/SandboxId/SessionId/MessageId automaticamente por conversa (dicionário oficial). «raiz-saddle DICIONÁRIO»
APP-0029. devthink — Execute o Tour Magnético como onboarding guiado com spotlight que abre pop-ups e mostra onde clicar. «raiz-saddle DICIONÁRIO; devthink-lookup»
APP-0030. devthink — Normalize conceitos com a Matriz de Equivalências: Ambiente de execução = My Computer/Sandbox/Environment-Coder/Container/VM; Workspace = Projetos/Codespace; Extensibilidade = Plugins/Conectores/MCP/Tools; Habilidades = Skills/System Instructions; Agendados = Scheduled/Cron; Biblioteca = Library/Gallery/Armazenamento; Risco = Aprovações/Checkpoints. «raiz-saddle devthink2:5067-5078»
APP-0031. devthink — Replique o OCR das 6 referências: Manus (telas 1–48), Grok/xAI (37–41), Z.ai/GLM (49–60), Qwen (61–83), Google AI Studio (84–87), ChatGPT/Codex (88–99). «raiz-saddle devthink2:5084-5293»
APP-0032. devthink — Modele DB Drizzle/Postgres com: users (open_id, role), browser_connections (pareamento/revogação), browser_sessions (escopo JSONB), automation_plans (steps JSONB, status draft→approved→in_progress→completed), automation_checkpoints (is_destructive, required_human_approval, approved_by), automation_executions (runtime cloud_vm|browser_extension, state queued/running/paused/stopped/failed/success), automation_audit_events (payload JSONB), automation_policies. «raiz-saddle devthink2:5445-5560»
APP-0033. devthink — Substitua rotas legadas (`/`, `/plans`, `/operations`, `/security`, `/audit`) pelas páginas consolidadas do tema. «raiz-saddle devthink2:5119-5130»
APP-0034. devthink — Consolide 45 telas → 60 pastas (~90–100 comp/tela) → 14 master pages → 7 master core hubs finais: landing, auth, onboarding, workspace (mega core: chat+agent+microvm+ide+browser+git+studio), bots (integrações+mcp+cron+webhooks), explorer (streaming discovery+library+deploy+forks), settings (customizer+security+telemetry+memory+audit+keys). «raiz-saddle devthink2:8816,10186,12614-12640,13791-13820»
APP-0035. devthink — Mescle páginas sinônimas sem excluir features: projects=workspace; connectors=bots=automações; studio=projects; telemetry+security→settings; explorer engloba library — embuta, não corte. «raiz-saddle devthink2:13773; raiz-models DECISÕES 4»
APP-0036. devthink — Reduza em 70–80% as páginas duplicadas mesclando equivalentes (fundir sem excluir features). «raiz-models DECISÕES 4»
APP-0037. devthink — Posicione a plataforma como "GitHub + provedor de inferência + computação com interface de streaming/lazer". «raiz-saddle devthink2:13773»
APP-0038. devthink — Defina a estética final: liquid glass, acrylic mica, dark claymorphism, cantos de onda 28px, omnibox estilo browser, shelves estilo Netflix. «raiz-saddle devthink2:13791-13800»
APP-0039. devthink — Construa UI com sidebars flutuantes magnéticas (esquerda/direita/topbar configurável), cantos em curva/onda inclinada 24–32px, design compacto, micro-componentes dentro de macro, branco/preto/escuro; sem pílulas/dots quadrados. «raiz-saddle devthink2:12606»
APP-0040. devthink — Referencie estética Chrome, Brave, Opera GX, X/Twitter, Windows, Webflow 2006; navegação tipo app de streaming (YouTube/Netflix/Prime). «raiz-saddle devthink2:12606,13773; raiz-models»
APP-0041. devthink — Anime ícones por dentro e dê expandir animado à caixa de pesquisa e de chat. «raiz-models REGRAS (design preferido)»
APP-0042. devthink — Posicione sidebars ESQUERDA+DIREITA repositionáveis (fixáveis em settings) e magnéticas — preferência declarada do dono. «raiz-models antingo conceito»
APP-0043. devthink — Separe Tools como aba catálogo de ferramentas ISOLADAS (equalizador etc.), âncora `tools.tsx` — não é pasta para guardar coisas. «raiz-models antingo conceito»
APP-0044. devthink — Adicione renderização 3D, notas, código e site builder como áreas/abas do Creator Studio. «raiz-models antingo conceito»
APP-0045. devthink — Rotule o Creator Studio v2.0 "Industrial Pro": Void Black #050505, Zinc Deep #09090b, Zinc Surface #18181b, acento gradiente orange-500→red-600, Cyan=código, Purple=áudio, Green=visual, glassmorphism no topnav, rounded-2xl/3xl. «raiz-models DECISÕES 6»
APP-0046. devthink — Sistema de abas estilo OS para multitaskar apps: Video Editor, Audio Workstation (Mixer, EffectsRack, Transport), 3D Studio (R3F, SceneGraph, MaterialEditor), Canvas (Artboard, Layers, Toolbar), Code IDE (Monaco + FileExplorer + PreviewPane), Site Builder (LivePreview, StylePanel, ComponentLib), Notes (BlockEditor + AIAssistant). «raiz-models FEATURES evolução final»
APP-0047. devthink — Dê a cada editor: chat próprio de IA, nodes próprio (nodes.tsx + nodeslogic.ts), encoder.ts, calculator.ts, toolbar e export. «anotepad-p1 30dv:30-37»
APP-0048. devthink — Abasteça /tools com 60+ ferramentas (assetgen, audioconverter, formatconverter, imageresizer, imageupscaler IA, colorpalettegen, qrcodegen, textsummarizer…). «anotepad-p1 30dv:291-308»
APP-0049. devthink — Ofereça Explore com 15+ categorias (vídeo, áudio, 3D, canvas, notes, site, tools, code, models IA, live, trending, shorts/reels, music, chat, ads). «anotepad-p1 30dv:1160-1177»
APP-0050. devthink — Crie /lab como laboratório meta-aba: container que aceita múltiplos componentes; multi-select na barra de abas (Ctrl+Click); arrastar seleção cria laboratório. «anotepad-p1 30dv:416-425»
APP-0051. devthink — Implemente Fusion Engine entre abas: Transferir/Mesclar/Integrar/Sincronizar via drag de aba sobre aba; clonagem seletiva; camadas híbridas; universal detach (painel→janela→aba sincronizada). «anotepad-p1 30dv:900-960»
APP-0052. devthink — Garanta persistência crash-proof: mouse parado 3s dispara salvamento; JSON de estado vai para session_state; login em outro dispositivo reabre abas injetando estados; heartbeat com pings. «anotepad-p1 30dv:980-1000»
APP-0053. devthink — Renderize em tempo real premium: preview É o vídeo final; play inicia export em background; processamento fatiado em chunks de 10s com bytes originais intactos e fatias paralelas. «anotepad-p1 30dv:1008-1046»
APP-0054. devthink — Embuta Python/C++/C#/Java dentro de TypeScript via manipulação de bytes (tecnologias embutidas). «anotepad-p1 30dv:1046; ESTRTUUTA OFICIAL 728-760»
APP-0055. devthink — Faça streaming social sem vídeo: transmita stream de ações JSON via WebSocket; o navegador do espectador reconstrói a tela (Motor de Replay); qualidade infinita com banda mínima; gravação de live gera MP4. «anotepad-p1 30dv:1130-1158»
APP-0056. devthink — Implemente áudio social WebRTC estilo Discord Stage. «anotepad-p1 30dv:1158»
APP-0057. devthink — Monte storage híbrido com 50+ file hosts (alfafile, gofile.io, pixeldrain, katfile, turbobit, 1fichier, media.cm, krakenfiles, 0x0.st, filebin, temp.sh, workupload, megaup, wormhole.app…). «anotepad-p1 30dv:760-840»
APP-0058. devthink — Detecte nuvem própria do usuário (GDrive/Mega/Dropbox): envie pra nuvem dele, salve só o link e calcule economia em cashback; senão escolha o host mais disponível; free é obrigado a conectar nuvem própria. «anotepad-p1 30dv:760-840»
APP-0059. devthink — Estruture pastas do storage em 3 camadas: (user id)/(categoria da aba)/(nome do projeto como arquivo); projeto é arquivo de log; duplicados viram (1),(2); subpasta = álbum/coleção; lixeira por project id; thumbnails em GIF. «anotepad-p1 30dv:842-852»
APP-0060. devthink — Declare logs de treinamento como propriedade da plataforma: nuvem privada, invisível, inapagável pelo usuário; estrutura (user id)/(contexto)/(categoria)/arquivo.json. «anotepad-p1 30dv:854-858»
APP-0061. devthink — Rode 17+ servidores: ads, signin, signup, storage, stripeservice, subscribe, subscribeswitch, useadmin, web, share, monitoring, allsubscriptionscount, filehost (gateway 50+ hosts), session, retrospective, streaming (WebSocket), voice (WebRTC), windgets (admin), sharding (federation), orchestrator — cada servidor uma porta. «anotepad-p1 30dv:743-763»
APP-0062. devthink — Exija que servidores sejam Gateways puros: só I/O, leem/editam a Tabela SQL; a Tabela SQL é a única fonte da verdade; mídia não passa por servidor. «anotepad-p1 DEVTHIN BETA NOTE 488-491»
APP-0063. devthink — Tipifique servidores: Editor (UPDATE/INSERT), Gateway completo, Monitor (SELECT dashboards), AI Worker (assíncrono). «anotepad-p1 DEVTHIN BETA NOTE 493-498»
APP-0064. devthink — Popule /aiactions com ~60 skills: todolist, contextanalyzer, planbuilder, questionasker, thinking, verification, testing, compaction, tokencount, file CRUD, contextcapture/export, mouse/keyboard, manipulação de componente/camada/efeito/timeline/canvas, websearch, examplesearch, logsearch, traininganalyze, styleextract, replication, livemode, hiddenmode, autonomousmode, geração de imagem/vídeo/áudio/3D/código/site/notas/anúncio/MIDI, modeldownload (Kaggle/HuggingFace), modelupload/training, agenttraining. «anotepad-p1 30dv:766-806»
APP-0065. devthink — Exija o protocolo todo-list como skill indispensável da IA. «anotepad-p1 30dv:766; DEVTHIN BETA NOTE 60-135»
APP-0066. devthink — Execute o ciclo obrigatório: ANALISAR → PLANEJAR → EXECUTAR → VERIFICAR → TESTAR → (passou? ENTREGAR : REFAZER→PLANEJAR) → SALVAR FEEDBACK para treinamento. «anotepad-p1 DEVTHIN BETA NOTE 35-58»
APP-0067. devthink — Marque verification e test como `cannotSkip: true` no Todo-List Template. «anotepad-p1 DEVTHIN BETA NOTE 60-135»
APP-0068. devthink — Permita execução autônoma mesmo com usuário offline, batchTasks, combinação de estilos X+Y, publicação/compartilhamento e refaz automático ao falhar; feedback volta para treinamento. «anotepad-p1 DEVTHIN BETA NOTE 390-404»
APP-0069. devthink — Busque 30 logs similares no banco antes de executar (examplesearch.ts). «anotepad-p1 30dv:777»
APP-0070. devthink — Ofereça 3 modos de execução: ao vivo (cursor fantasma), oculto (função direta, instantâneo), autônomo (admin only, segundo plano). «anotepad-p1 30dv:1096-1100»
APP-0071. devthink — Cadastre a IA como usuário com email/senha (@lookup, super root admin); servidor assiste a porta dela; admin pode ver a IA trabalhando; IA retoma com "oi, paramos em X lugar, quer continuar?". «anotepad-p1 30dv:1078-1083; ESTRTUUTA OFICIAL 105-111»
APP-0072. devthink — Rode loop de autocorreção: planejador → executor → verificador; dois robôs (um faz, outro verifica e manda consertar); resolutor de erros faz segundo check. «anotepad-p1 ESTRTUUTA OFICIAL 152-176»
APP-0073. devthink — Execute o fluxo do agente: mensagem → Agent processa com LLM+tools → valida segurança/permissões → ExtensionManager dispara ferramenta → resultado volta → LLM decide próximo passo → loop até terminar sem tool request. «anotepad-p1 ESTRTUUTA OFICIAL 177-190»
APP-0074. devthink — Limite planos do agente a até 10 etapas definindo como agir e usar cada ferramenta. «anotepad-p1 ESTRTUUTA OFICIAL 195-204»
APP-0075. devthink — Defina o modo "ultra max pro high": ex. Claude 4.5 Opus — 1min30s, 4000 tools, 200k tokens; "oi" executa 7 tools; pedido de vídeo aciona modal de preferências (duração, transições, 2D/3D, orientação, legendas, publicação). «anotepad-p1 ESTRTUUTA OFICIAL 216-240»
APP-0076. devthink — Conte tokens e crie arquivo de compressão de contexto antes de 100%; usuário continua no mesmo ou novo chat; IA diz onde parou. «anotepad-p1 ESTRTUUTA OFICIAL 443-455»
APP-0077. devthink — Injete contexto forçado pelo servidor (não pelo LLM): obrigue o agente a ler histórico/arquivos antes de agir — "não confiar na memória do LLM para iniciativa". «anotepad-p1 Arquitetura Multi-Agente 78-100»
APP-0078. devthink — Separe estado de contexto: quem sabe que o agente está vivo é o backend (Worker + registro com status processing atrelado a user_id/task_id); delegação via JSON pelo Orquestrador; checklist visual via WebSocket em /task_id. «anotepad-p1 Arquitetura Multi-Agente 20-50»
APP-0079. devthink — Use memória em 3 camadas: janela deslizante (curto prazo), arquivos (longo prazo), sumarização de checkpoint por modelo barato a cada X interações. «anotepad-p1 Arquitetura Multi-Agente 52-62»
APP-0080. devthink — Prepare 1000+ componentes TSX e 1000+ lógicas TS em actions; cada ação requer arquivo lógico encapsulado no formato "componente X obedece lógica X e propriedade X". «anotepad-p1 ESTRTUUTA OFICIAL 14-33»
APP-0081. devthink — Anexe plugins ao sistema: design.ts core, floating, geminiservice, antidevops (bloqueador de devtools), aesthetic, responsive, dnd, cleanurl, canvas flutuante, detach universal, sync/merge/transfer/clone entre abas, hybrid, infinityscroll, idle (mouse parado 3s), autosave, replay, observer. «anotepad-p1 30dv:810-831»
APP-0082. devthink — Execute 99% das operações via terminal/comandos; alterações impactantes em paralelo via subagentes. «anotepad-p1 Note 04 17:6-8»
APP-0083. devthink — Estruture /ai-action/ com training/, observers/ (action-observer, mouse-tracker, keyboard-logger), interpreters/, planners/ (plan-builder, inspiration-fetcher, style-combiner, task-queue-manager), executors/ (ghost-cursor, silent-executor, component-clicker, offline-worker, publish-executor), validators/, components/, storage/. «anotepad-p1 DEVTHIN BETA NOTE 7-31»
APP-0084. devthink — Implemente modo OFFLINE: usuário solicita e sai → Task Queue Manager enfileira → Offline Worker executa no servidor → ciclo completo → salva no Laboratório → publica → notifica ao voltar. «anotepad-p1 DEVTHIN BETA NOTE 140-160»
APP-0085. devthink — Aceite comandos de IA: createVideo/Site/Model/Audio, editProject, applyStyle, combineStyles (X+Y), publishResult, shareResult, exportResult, batchTasks. «anotepad-p1 DEVTHIN BETA NOTE 165-183»
APP-0086. devthink — Rode Inspiration Engine: busca modelo do estilo X, estilo Y e projeto Z; mescla colors/effects/transitions/mood; gera plano híbrido. «anotepad-p1 DEVTHIN BETA NOTE 185-215»
APP-0087. devthink — Valide com VerificationChecklist: didFollowPlan, didFollowTraining, didCompleteAllSteps, didMatchUserRequest, hasNoErrors, outputIsValid; TestProtocol com passed/failureReason/shouldRetry. «anotepad-p1 DEVTHIN BETA NOTE 218-246»
APP-0088. devthink — Suporte Task Queue com dependências (dependsOn), progress % e notificação por tarefa. «anotepad-p1 DEVTHIN BETA NOTE 248-270»
APP-0089. devthink — Mantenha servidor privado de treinamento: /training-data/users/{user}/inputs|executions|verifications|tests|outputs; /models (style-recognition, task-planning, error-correction); /feedback-loop (success-patterns.json, failure-patterns.json). «anotepad-p1 DEVTHIN BETA NOTE 424-440»
APP-0090. devthink — Grave TODAS as ações do usuário (cliques, atalhos, inputs, coordenadas, efeitos, ordem cronológica) como dataset de treinamento proprietário. «anotepad-p1 30dv:1085-1094»
APP-0091. devthink — Hierarquize usuários: Criadores (classe suprema, controle total) > IA Loo (poderes equivalentes) > Admins delegados (poderes medidos) > Sponsors (remunerados, com aprovação do criador) > AI users/agents > Membros comuns. «anotepad-p1 Note 03 20:41-51; anotepad-p2 anote-7r8ddm7g:64-70»
APP-0092. devthink — Iguale AI agents e virtual users a privilégios de criador quando originados por eles; perfis virtuais sempre marcados. «anotepad-p1 Note 03 20:50-51; regras (13)»
APP-0093. devthink — Separe hierarquia comunitária da administrativa: mestres de sala, líderes de equipe, moderadores de chamada/grupo/projeto; escalonamento ao criar servidores. «anotepad-p1 Note 03 20:55-56»
APP-0094. devthink — Admin que cria servidor torna-se admin daquele contexto (distinguível do admin da plataforma); admin comunitário administra só o contexto do app. «anotepad-p2 anote:87-88»
APP-0095. devthink — Destine planos a RECURSOS, nunca a poderes administrativos; só criadores/IA concedem privilégio marcando no banco. «anotepad-p2 anote:193,217-218»
APP-0096. devthink — Fixe planos: Free 3 projetos/3 msgs agentic/200MB/0 provedores; Pro 250/50 msgs externos + ilimitado nos modelos próprios/1 provedor/500MB; Essential 700/10/10GB/4 nuvens; Enterprise 2000/40/100GB/20; Sponsor 50000/300/500GB/40+; Criadores e AI Users ilimitados. «anotepad-p1 Note 03 20:57-66; anotepad-p2 anote:231-237»
APP-0097. devthink — Trate categorias de conexão externa como independentes: nuvem/armazenamento, provedores de IA, servidores VPS GPU/CPU, VPN, banco de dados — cada uma com limite próprio por plano. «anotepad-p1 Note 03 20:67-68; anotepad-p2 anote:240-243»
APP-0098. devthink — Rode modelos próprios 24h na infra própria sem limite por requisição; limite de requisições incluso no próprio modelo. «anotepad-p2 anote:240-243»
APP-0099. devthink — Fixe rate limit de IA: Free 3 requisições (só modelos próprios); Pro 50 msgs + ilimitado nos próprios; Essential/Enterprise/Sponsor 2000+ diárias. «anotepad-p2 anote:411-414»
APP-0100. devthink — Versione planos 30dv: Free obriga nuvem própria, 1 projeto por aba, cheio de anúncios, não exporta/renderiza; pagos: renderização em segundo plano, storage ilimitado, sem anúncios. «anotepad-p1 30dv:1104-1122»
APP-0101. devthink — Integre Stripe + Abacate Pay/Nubank/gateways nacionais; beta só para pagar a plataforma; moeda própria; banco em beta; empréstimo indisponível no início. «anotepad-p1 Note 03 20:70-79»
APP-0102. devthink — Permita planos múltiplos simultâneos mensais/anuais pausáveis; créditos transferíveis; trial 2–3 dias com cartão pré-cadastrado (1 plano, sem múltiplas adesões); registrar IP do pagamento anti-fraude; sem subtração proporcional. «anotepad-p1 Note 03 20:70-79»
APP-0103. devthink — Habilite compartilhamento de assinatura: convidar membro com/sem assinatura; convidado pausa/resume; proprietário presenteia ou ejeta; cada plano com ID+nome único; aceite revogável. «anotepad-p1 Note 03 20:81-89»
APP-0104. devthink — Controle conta de terceiros só mediante aceite; controlador não tem botão de saída a menos que permitido. «anotepad-p1 Note 03 20:91-94»
APP-0105. devthink — Converta cashback em crédito da loja, nunca dinheiro real. «anotepad-p1 30dv:1124-1128»
APP-0106. devthink — Venda API própria com cobrança cara e acesso programático. «anotepad-p1 30dv:1130-1132»
APP-0107. devthink — Deixe a página de planos como fonte dos preços; o Stripe cuida só da comunicação; carteira mostra todos os planos comprados. «anotepad-p1 Note 01 07:6-8»
APP-0108. devthink — Gerencie compra de assets usuário-para-usuário via Stripe. «anotepad-p1 MAPA:16»
APP-0109. devthink — Proteja o banco: RLS habilitado com policy auto-enable trigger em cada entidade; realtime universal; proteção contra escalonamento vertical/lateral; captura antifraude (navegador, tela, rede, geo, fingerprint); entidade de ataques exibida no painel inicial; restauração protegida contra injeção. «anotepad-p1 Note 03 20:32-39»
APP-0110. devthink — Normalize o schema: esquema único em public; limpar public/auth/realtime antes de reconstruir; CREATE TABLE IF NOT EXISTS; nomes curtos em inglês, sem emoji/underscore; >200 entidades >1000 campos; username+name obrigatórios; apps identificados por nome descritivo, jamais número sequencial; cascata partindo de auth.user.id; proibida redundância. «anotepad-p1 Note 03 20:6-30»
APP-0111. devthink — Referencie tabelas derivadas apenas pelo ID único; nenhum campo repetido entre entidades; perfil principal com >20 campos. «anotepad-p1 Note 03 20:29-31»
APP-0112. devthink — Planeje sharding Supabase: 50k usuários por projeto free; ao atingir 49k prepara Shard 2 e troca API keys; tabela mãe agregadora soma totais; contadores booleanos online/offline/editando; delete marca, não remove. «anotepad-p1 30dv:1052-1070»
APP-0113. devthink — Cheque premium ao retornar: usuário logado sem plano confirmado é verificado na tabela do Supabase. «anotepad-p1 Note 01 06:8-9»
APP-0114. devthink — Ignore erros de policy duplicada (42710) ao re-executar SQL; catalogue erros SQL previstos (3F000, 42501, 42601, 42804, 42883, 42703, 22P02, 23505). «anotepad-p1 Note 03 01:6; anotepad-p2 anote:401-410»
APP-0115. devthink — Guardem chaves de API do usuário no navegador com exclusão permanente; cookies salvos para persistir conexões externas. «anotepad-p2 anote:424-427»
APP-0116. devthink — Mantenha tabela permanente dedicada para logs de sistema, IA e chat; content como link no banco e no navegador enquanto cookies ativos. «anotepad-p2 anote:20-21»
APP-0117. devthink — Rode dois versionamentos paralelos (plataforma × usuário) com hash aleatório por versão + data/horário; rollback Ctrl+Z para estados anteriores. «anotepad-p2 anote:332-340»
APP-0118. devthink — Implemente Ctrl+Z global via ZIP: compactar estado em zip após 30s de inatividade; reload devolve tudo ("Te ver de volta"); só fora do estado ativo; por app+usuário; RLS e realtime em todas as tabelas. «anotepad-p2 anote:19,341-352; devthink-lookup D12»
APP-0119. devthink — Comprima logs por usuário/contexto em ZIP com prazo de 1 semana; salva só o link; manter apenas o mais recente por entidade. «anotepad-p2 anote:341-352»
APP-0120. devthink — Habilite fork de qualquer conteúdo (notas, projetos, mídia) de qualquer usuário; registre fork vinculado ao ID original e ao novo dono; Pro cria mas não executa na infra; Essential+ permite automação na infra. «anotepad-p2 anote:388-392»
APP-0121. devthink — Trate conta = sandbox isolada (~50GB por plano); site já é sandbox; cada usuário a sua. «regras-totais Site is sandbox; ARVORE Infra 3»
APP-0122. devthink — Inclua >50 apps inclusos independentes com integrações (não um dentro do outro); nomes simples em inglês. «anotepad-p2 anote:220-226»
APP-0123. devthink — Ofereça Star Menu, Profile, Canvas, Marketplace, Banco/Payment/Gateway, personalização com volta ao tema anterior, versões/temas anteriores; usuário pode renomear a plataforma só para si. «anotepad-p2 anote:221-224»
APP-0124. devthink — Trate a loja como aplicativo; projetos publicados são aplicativos; storage com CDN própria conectando provedores externos; Secondary Panel para pagantes (só preferências próprias). «anotepad-p2 anote:214-219»
APP-0125. devthink — Ofereça navegador interno com 10+ submódulos Puppeteer, gerenciador de downloads, cofre de autenticação de conexões e app de métricas com mapa de tarefas e horários de pico. «anotepad-p2 anote:240-244»
APP-0126. devthink — Integre interações sociais: presentes entre usuários, curtidas/salvamentos/comentários por ID do post, seguir usuários, assinatura compartilhada com contagem por timestamps. «anotepad-p2 anote:173-181»
APP-0127. devthink — Reúna no Explorer todo conteúdo publicado (YouTube/Behance/Spotify/Instagram-like) com Melhores do ano/semana/dia por app; categoria do projeto registrada no banco; conteúdo IA-tagado com percentual "feito por IA". «anotepad-p2 anote:183-192; regras (13)»
APP-0128. devthink — Permita postagem de imagem, vídeo, código, música, áudio ou criação interna; posts ilimitados em URL blob; registros comprimidos periodicamente. «anotepad-p2 anote:180-191»
APP-0129. devthink — A partir do Pro, permita criar agentes e CLIs e publicá-los (na plataforma ou servidor externo, ou ambos); IA do usuário em sandbox com ID único. «anotepad-p2 anote:184,293-303»
APP-0130. devthink — Catalogue protocolos de IA: MCP, ADP, A2A, ACP, AG-UI, OAP, AGP, TAP, TDF, FCP, LMOs, RESTful Agent API; arquiteturas MAS, RAG, CoT, ReAct, AgentOS; loop cognitivo Observe→Reason→Act→Remember→Communicate. «anotepad-p2 anote:314-336; devthink-lookup F22»
APP-0131. devthink — Gateie o terminal por patente: terminal administrativo só com hash secreto do criador ou IA; bloqueio de escala de privilégio; Capability-based Security. «anotepad-p2 anote:144-148»
APP-0132. devthink — Rode grupos/equipes mistas (pessoas + subagentes + perfis virtuais marcados) e todas as features do YouTube + chatbot + página de criação. «regras (13); devthink-lookup R30»
APP-0133. devthink — Dê a perfis virtuais (IAs pré-treinadas por profissão) acesso de usuário pleno: a plataforma serve humanos E usuários virtuais. «regras (13); devthink-lookup F21»
APP-0134. devthink — Publique apps nativos no tema com loja=Stripe: créditos diários renováveis (300/dia), horas de VM, faturas, upgrade Pro. «raiz-saddle devthink2:12606+; ARVORE:9»
APP-0135. devthink — Rode o Xplorer App Store com overlay copy-on-write: apps pesados (CapCut/Photoshop/CorelDRAW) instalados na VM matriz; sub-VM recebe atalhos/ponteiros read-only e grava apenas pastas modificadas; cota 25–45 GB por usuário; gitstorage.ts monta a visão unificada. «raiz-saddle devthink2:2350-2390»
APP-0136. devthink — Ofereça Explorer streaming: descoberta estilo Netflix/YouTube de artefatos da comunidade, VMs compartilhadas, jogos, 3D; shelves horizontais; fork/clone 1-clique de projeto/VM/site/mídia; deploy manager com domínio custom e SSL; player bar flutuante. «raiz-saddle devthink2:13820-13900»
APP-0137. devthink — Roteie LLMs pelo Omni Router: balance por custo/latência/precisão; circuit breaker + fallback chain transparente entre DeepInfra/GMI/Google Labs. «raiz-saddle devthink2:140-146,630-660»
APP-0138. devthink — Implemente memória infinita: Redis (ponteiros/hashes, sub-ms) + JuicedFS/MinIO (árvore de Merkle, blobs imutáveis) com desduplicação content-addressable. «raiz-saddle devthink2:600-640»
APP-0139. devthink — Defina o conceito-equação: Devthink = n8n (eventos) + ComfyUI (DAG multimodal) + NotebookLM (RAG) + Google Labs (VM/vContainer/vGPU/vCPU 100% software) + Omni Router + pools serverless + Waydroid + Asterisk (VoIP/SIP) + Git/Forgejo (blobs/Merkle) + Redis (cache RAM) + Llama/DeepSeek locais — "hypervisor de IA". «raiz-saddle devthink2:2-48,1178-1190»
APP-0140. devthink — Cuide do dashboard sob controle: métricas Conexões/Sessões/Aprovações/Execuções/Eventos. «raiz-saddle devthink2:5099»
APP-0141. devthink — Exponha Mail gateway: e-mail exclusivo do agente (estilo @manus.bot) para disparar fluxos via SMTP. «raiz-saddle devthink2:5171,5981»
APP-0142. devthink — Atenda OCR Manus nos conectores: API personalizada, MCP personalizado, importar MCP por JSON/URL; habilidades criadas/upload/GitHub; populares Instagram, Google Workspace, Meta Ads, Google Agenda, Notion, Higgsfield, Outlook. «raiz-models FEATURES conectores»
APP-0143. devthink — Use backend de referência com rotas /, /plans, /operations, /security, /audit e tabelas users, automationApprovals, automationAuditEvents, automationCheckpoints, automationExecutions, automationPlans, automationPolicies, browserConnections, browserSessions. «raiz-models FEATURES backend»
APP-0144. devthink — Implemente o chat Main Workspace com 40 componentes: sidebars flutuantes, model selector, reasoning slider, VM sandbox visibility switch, token counter, hero task suggestions, textarea, voice dictation, deep thinking toggle, web search modifier, code interpreter, require approval, slash commands popup, MCP plugin dropdown, IDs status. «raiz-models FEATURES Chat Main»
APP-0145. devthink — Exiba stream com SSE/WebSockets: reasoning accordion, tool exec cards, inline code diffs (apply/reject), fork conversation, cost estimation, export raw JSON. «raiz-models FEATURES Stream»
APP-0146. devthink — Limite AVM (Advanced Virtual Machine) ao design proprietário: processador + hardware virtual completos + drivers em software; VMs recursivas clonadas 25–45 GB por username. «raiz-saddle DICIONÁRIO; raiz-models»
APP-0147. devthink — Projete o CLI DevThink como produto library-first: contratos (transport, session, memory, provider, tool, renderer) extraídos; browser-automation vira "audit evidence only", não requisito. «cli DECISÕES; DEVTHINK-1.1.0-feature-map»
APP-0148. devthink — Proíba defaults absolutos no CLI: "no default mode, no default model, no default temperature, no default topic, no default tokens"; proibido `process.env.X || 'default'` e `?? fallback`; sem valor → feature desabilitada ou prompt ao usuário. «cli REGRAS; MASTER-REWRITE-PLAN §2.1»
APP-0149. devthink — Resolva memória interna em ordem: 1) sessão → 2) projeto `.devthink/` → 3) global `~/.devthink/` → 4) memória externa/provider SOMENTE se o usuário pedir; nunca acesso automático. «cli REGRAS §2.2»
APP-0150. devthink — Banque emojis (U+1F000–1FFFF) em código, logs, UI, docs e commits; permitidos box-drawing, braille, ASCII art, ANSI; CI scan + lint rule. «cli REGRAS §2.3»
APP-0151. devthink — Mantenha estrutura flat no CLI: sem subdiretórios dentro de módulo, sem hífens; tudo em `/cli` na raiz; máx 20 tipos/arquivo, 10–15 funções/arquivo. «cli REGRAS §2.4-2.6»
APP-0152. devthink — Separe `.ts` lógica / `.tsx` design (JSX/Ink em .tsx; lógica de negócio em .ts). «cli REGRAS §2.7»
APP-0153. devthink — Force host 127.0.0.1 + porta aleatória no CLI: "localhost é proibido"; porta = sorteada uma vez e fixa pela sessão; proibida porta hardcoded (3000/4096). «cli REGRAS §2.15; port-memory-spec»
APP-0154. devthink — Proíba downgrade de versão: package.json só sobe ou mantém; CI checa. «cli REGRAS §2.16»
APP-0155. devthink — Exija que toda dependência de design tenha import real em .tsx, senão removida. «cli REGRAS §2.17»
APP-0156. devthink — Compile internamente: bundling total (esbuild/rollup), sem resolução node_modules em runtime, dist com index.js/.mjs/.d.ts library-mode, named exports, sem side effects. «cli REGRAS §2.14,2.18»
APP-0157. devthink — Garanta cross-platform sem premissas: PowerShell/CMD/Bash/zsh/Browser/Desktop(Tauri,Electron); config em %APPDATA%/~/.config/~/Library por OS. «cli REGRAS §2.19»
APP-0158. devthink — Torne tudo opcional: nenhuma flag/required field/setup wizard obrigatórios; hierarquia CLI flags > env > projeto > global > defaults-de-feature. «cli REGRAS §2.20»
APP-0159. devthink — Implemente 20 modos com memória interna: chat, code, review, debug, test, doc, refactor, explain, search, plan, execute, analyze, translate, generate, optimize, security, deploy, monitor, config, session. «cli REGRAS §2.13»
APP-0160. devthink — Converta React → ANSI: Ink como camada principal (Yoga+react-reconciler), ANSI cru como fallback; web usa React DOM real — "single component source for both targets". «cli REGRAS ARCHITECTURE-react-to-terminal»
APP-0161. devthink — Padronize output limpo: proibido stack trace cru, `[DEBUG]`, JSON.stringify no terminal; formato `LEVEL | MODULE | message`; debug só via `--verbose`. «cli REGRAS §2.10»
APP-0162. devthink — Respeite a fronteira de segurança do CLI (não-negociável): não capturar cookies de browser, não repetir sessões web de terceiros, não burlar CAPTCHAs, não embutir OAuth codes de exemplos, não deployar DB mutável em GitHub Pages/Vercel/Netlify; auth só API key documentada ou OAuth/device flow oficial iniciado pelo usuário. «cli REGRAS; DEVTHINK-1.1.0 §1; SECURITY»
APP-0163. devthink — Elimine dados falsos: nenhum hardcoded, fake, mock, placeholder, portas fixas, números mágicos (187 ações em 8 fases; remover fallback "nvidia", fake `{connected:true, latencyMs:0}`, simulateLocalDelegation). «cli REGRAS 026-formulacao; PLAN-60-CLEANUP»
APP-0164. devthink — Comande o CLI por `devthink chat/serve/models/mcp/share/export/import/config/identity/pair/sync/usage/routes/debug/auth/permissions/mode` + slash commands `/share /unshare /export /model /mode /settings /init`. «cli FEATURES README (6)»
APP-0165. devthink — Embuta gateway loopback no CLI (`devthink serve`): health, catálogo, modelos, workspaces, sessões, abas, chat SSE; rotas REST share/export/lsp/mcp. «cli FEATURES 002-feature-parity»
APP-0166. devthink — Suporte providers 22→75+: OpenAI-compatible, Anthropic Messages, Google Gemini, Z.AI, Qwen, Xiaomi MiMo + OpenRouter, DeepSeek, Groq, Mistral, xAI, Ollama, Bedrock, Azure; resolução de endpoint em camadas; proxy por provider, PAC, SOCKS5, custom CA. «cli FEATURES §4»
APP-0167. devthink — Implemente sistema de agentes CLI: tipos explore/scout/general + ocultos compaction/title/summary; @mention parser; tab-switch Build/Plan; per-agent permissions `{tool: allow|ask|deny}` com globs; step limits + token budget; agentes em Markdown com frontmatter YAML em `.devthink/agents/*.md`, fallback AGENTS.md/CLAUDE.md/.cursorrules. «cli FEATURES 04-agent-system»
APP-0168. devthink — Adote plugin system estilo OpenCode: ES modules exportando `server(input)` → hooks (`chat.message`, `chat.params`, `tool.execute.after`); built-ins Memory, Proxy, MCP Server Manager. «cli FEATURES PLUGINS»
APP-0169. devthink — Adicione tools com schemas Zod: apply_patch, todowrite/todoread, question, websearch (Exa/SearXNG), lsp, skill; permissão allow/ask/deny por tool; dry-run; middleware chain. «cli FEATURES 013-grupo-13»
APP-0170. devthink — Implemente sessões CLI: share público com sanitização + expiração 24h/7d/30d/never + QR code; export JSON v1.0/Markdown/HTML com `--sanitize`; import de URL; SQLite `devthink.db`. «cli FEATURES 002 §2.1-2.2»
APP-0171. devthink — Construa memória CLI: HNSW + BM25 + RRF, EmbeddingService, auto-capture, profile learning; undo/redo + git; worker threads UI/LLM (Comlink). «cli FEATURES 000-master-todo»
APP-0172. devthink — Modernize a TUI: Ink v7 incrementalRendering, Command Palette Ctrl+P (40+ ações, MRU), autocomplete `@files @agents /commands` fuzzy, DiffViewer inline/stacked, FileTree, ThinkingBlock colapsável, leader key Ctrl+X, keybinds JSON, 7 temas JSON, toasts 150-240ms. «cli FEATURES 03-tui; 100-redesign»
APP-0173. devthink — Distribua o CLI via Homebrew/Scoop/Chocolatey/AUR/Nix/Docker; binários Bun Linux x64/macOS arm64/Windows x64 + SHA-256; SSO (OIDC/SAML/LDAP); audit SIEM/GDPR. «cli FEATURES 000 Grupos 41-47»
APP-0174. devthink — Escolha RWKV > Mamba para inferência local: RWKV-7 é o único com WebGPU/WASM pronto; Mamba via ONNX "possível mas imaturo"; lazy-load de modelos (~95MB base + download). «cli DECISÕES 000-SUMMARY; 034-BINARY-SIZE»
APP-0175. devthink — Priorize SQLite-first com fallback JSON: better-sqlite3 → bun:sqlite → json-only. «cli DECISÕES REWRITE-db»
APP-0176. devthink — Corte dependências 342→18 no CLI: visão Aider-like "um comando, uma variável de ambiente, resultado". «cli DECISÕES PLANO-DE-ACAO»
APP-0177. devthink — Contrate paridade web↔CLI como aceite: "every user-facing web operation has a CLI or gateway equivalent, and every CLI operation has a visible web mapping". «cli DECISÕES v1.1.11»
APP-0178. devthink — Sincronize via paired gateway grátis primeiro; remote adapter opcional (Postgres+RLS user-operated); rejeitado: DB no repo e senha no browser; conflitos explícitos em Settings, nunca merge silencioso. «cli DECISÕES v1.1.16»
APP-0179. devthink — Pareie web com gateway local: `devthink pair create` → ID + código de 8 chars válido 5 min, consumido 1×; token bearer curto só em sessionStorage; `web.allowedOrigins`. «cli FEATURES pairing contract»
APP-0180. devthink — Persista IndexedDB `devthink.db` browser-local; store `credentials` vazio por padrão, fora do sync. «cli FEATURES v1.1.16:31-36»
APP-0181. devthink — Estenda a plataforma à extensão (@wenathlan/extension "Devthink") com consent-first/deny-default: recusa toda origem nunca concedida; allowlist por-origem exata, 1 origem por entrada, wildcard nenhum (estrela/segmento vazio/scheme wildcard recusam o check inteiro). «saddle-dns-extension-misc REGRAS extension»
APP-0182. devthink — Use MV3 sem remote code: endpoint remoto só entrega dados declarativos schema-checked, nunca código executável; permissões mínimas iniciais `storage`, `activeTab`, `sidePanel`; host permission só após pedido explícito. «saddle-dns-extension-misc extension»
APP-0183. devthink — Exclua por design da extensão: debugger, cookies, downloads, proxy, broad hosts `<all_urls>` e companion nativo. «saddle-dns-extension-misc extension»
APP-0184. devthink — Não hardcode na extensão duração/bound/shape/kind/threshold/lista — escolhas do usuário; nenhum registro de segurança passa por cima do human review. «saddle-dns-extension-misc extension»
APP-0185. devthink — Use package.json como única fonte de versão da extensão; push em main que muda package.json/CHANGELOG dispara pipeline → tag imutável `vX.Y.Z`; store submission operator-published. «saddle-dns-extension-misc extension»
APP-0186. devthink — Integre LLM à extensão sem provider hardcoded: sem allowlist, sem default; usuário conecta gateway/base-url/api-key/model; chave mora no browser credential store; 4 wire-shapes são interop, não providers. «saddle-dns-extension-misc extension 1.1.57»
APP-0187. devthink — Modele tarefa do browser-agent como sequência finita revisável: intent → bounded observation → action proposal → user-policy decision → execution → fresh observation → outcome record — NÃO loop irrestrito. «saddle-dns-extension-misc extension»
APP-0188. devthink — Prefira observação semântica (accessibility tree bounded); screenshot opcional com aprovação separada; target reference expira após navegação/mutação. «saddle-dns-extension-misc extension»
APP-0189. devthink — Rode CLI da extensão `devthink`: planlint, runworkflow (dryrun/resume/checkpoints), headless replay read-only sobre fixtures, composeworkflow; planos/workflows/fixtures versionados com schema strict (campos desconhecidos recusados com path). «saddle-dns-extension-misc extension»
APP-0190. devthink — Exponha MCP server mode (1.1.84): toolcatalog + resourceexpose + promptexpose; transports stdio (JSON-RPC newline frames) + HTTP streamable localhost; TLS opcional; `--degraded` = read-only; audit entry por tool call. «saddle-dns-extension-misc extension»
APP-0191. devthink — Proteja segredos com secret vault (1.1.62): put/fetch na última hora; registros persistem só label/origem/provenance/sha-256; secretleakscan + secretshapecarrying; honest limit: session storage memory-only. «saddle-dns-extension-misc extension»
APP-0192. devthink — Mantenha release discipline da extensão: cada release exatamente 100 changes concretas verificáveis em cadeia única (1.1.31→2.0.0); grounding em crxfeaturemining (57 artifacts CRX, non-executing). «saddle-dns-extension-misc extension»
APP-0193. devthink — Trate o gateway como app absorvido: 18 rotas passthrough (6 V1 + 6 V2 + 6 V3), input cliente → autofix → fetch baseURL oficial → retorno upstream → save DB → streaming de volta. «12conv-p3 REGRAS Gateway»
APP-0194. devthink — Suporte thinking always-on 7 níveis (none→max, default high) em toda requisição V1/V2/V3; ordem obrigatória thinking → response; limite 98k thinking + 98k response. «12conv-p3 Gateway 5»
APP-0195. devthink — Faça streaming manual: ReadableStream com pump/getReader/drain; makeSse com flush; keepalive 200ms; `[DONE]` único; anti-429 retry 2–8× backoff exponencial 200ms–64s, jitter, Retry-After, pacing 200ms, mutex MAX_CONCURRENT 1. «12conv-p3 Gateway 6»
APP-0196. devthink — Converta formatos on-the-fly: detector openai chat.completions vs anthropic messages vs responses; output source-of-truth `chat.completion.chunk`; saída em 3 formatos + 20 SDKs. «12conv-p3 Gateway»
APP-0197. devthink — Gerencie chaves: cadastrar as 22 chaves NVIDIA no DB via db.ts/prisma push com round-robin antes do build. «12conv-p3 Gateway 8; worklog getry»
APP-0198. devthink — Rotule o meta-modelo somente "DevThink" (masking/tracking): toda resposta reporta model "devthink" no SSE byte passthrough. «12conv-p3 DECISÕES 10; worklog getry MAENE»
APP-0199. devthink — Mantenha o repo devthink com .github/workflows alvo: ci, pages, release, security, verify, maintenance, buildextension, cachecleanup, codeql, compatibility, container, desktop, mobile, publishghcr, publishgithubnpm, publishmaven, publishnpmjs, publishnuget, publishrubygems, securitypolicy, targets, workflowlint. «devthink-lookup F29»
APP-0200. devthink — Declaração metadata do repo: "OMNISCIENT IDE"; main `app.tsx`; ~40 scripts (dev/build/preview/server×8; electron×5). «devthink-lookup F27»
APP-0201. devthink — Configure Vite unificado: "App.tsx → core-hidden.js (ofuscado) → ak.js loader", rollup-plugin-obfuscator, css-injected-by-js. «devthink-lookup F27»
APP-0202. devthink — Trate `ak.js` como redirecionador único criptografado em produção: não esconde nada, só aponta para `app.tsx`. «saddle-dns-extension-misc create; anotepad-p1 30dv:1310»
APP-0203. devthink — Proíba no create/DevThink: pasta `/src`, `index.ts`, `core-hidden.js` em src, `/dist` para links ofuscados, `/public` para assets ofuscados. «saddle-dns-extension-misc create REGRAS»
APP-0204. devthink — Execute a ordem mandatória de refactor: ler `estrutura.md` completo → ler `oldindex.txt` → analisar configs → TODO list (excluir/mesclar/editar/mover/renomear/atualizar/criar/escrever) antes de qualquer alteração. «saddle-dns-extension-misc create»
APP-0205. devthink — Aplique anchor file: `app.tsx` importa só os anchors; anchor importa tudo que a página precisa; arquivos abaixo do anchor não fazem imports. «saddle-dns-extension-misc create»
APP-0206. devthink — Adote padrão Maestro-Soldado-Arma: ÂNCORA (.tsx) importa libs/caminhos e faz binding; LÓGICA (.ts) puramente funcional; COMPONENTE (.tsx) UI pura, recebe props, sem lógica de negócio. «anotepad-p1 30dv:24-31»
APP-0207. devthink — Nomeie âncora `nomedapasta.tsx` e página `nomedapastapage.tsx` (única exceção à palavra "page"). «anotepad-p1 30dv:33-37»
APP-0208. devthink — Não limite componentes/lógicas por pasta desde que o âncora administre libs e cada lógica X faça o componente Y funcionar. «anotepad-p1 DEVTHIN BETA NOTE 476-483»
APP-0209. devthink — Reconheça pastas permanentes: tools, extensions, live, post, dashboard, armazenamento, nodes, curso, infinity canvas, laboratório, status, agents+cli (só pagantes/admin), 3dstudio, ebook, code_ide, user, personalização, salvos, explore, terminal (isolado), trein modelos, actions. «anotepad-p1 ESTRTUUTA OFICIAL 38-66»
APP-0210. devthink — Reconheça pastas proibidas: src, database, cache, sandbox, playground, share, export, import, bridge, integração, contexto, map, colaboração, vfx, engines, upload. «anotepad-p1 ESTRTUUTA OFICIAL 70-89»
APP-0211. devthink — Estruture cada página = 1 pasta; não pastas dentro de pastas; separar por categoria via comentários; nomes em inglês; não criar pastas com sentidos duplicados. «anotepad-p1 ESTRTUUTA OFICIAL 91-97»
APP-0212. devthink — Escreva agentes/subagentes em TypeScript replicando comportamentos de Python (terminal e editor); TS + React com mínimo de HTML/CSS. «anotepad-p1 ESTRTUUTA OFICIAL 14-22»
APP-0213. devthink — Mantenha app.tsx iniciando/innitando security.ts e importando server e security; onboarding importa server+services e não reaparece após completo. «anotepad-p1 Note 02 17:7-9»
APP-0214. devthink — Escreva arquivos no chat (não criar projeto no container); só imports permitidos na estrutura. «anotepad-p1 Note 02 17:6»
APP-0215. devthink — Não mexa no index.css nem componentes universais — apenas a pasta da página. «anotepad-p1 Note 05 02:6»
APP-0216. devthink — Não excluir nada ao mover arquivos — apenas mover e ajustar; sem cron jobs no projeto; apagar builds/zip antigos de dev e produção. «anotepad-p1 Note 05 01:6»
APP-0217. devthink — Converta a plataforma em apps nativos iOS/Windows/Android/Mac/Linux via Electron + Pkg: mesmo código TS, online/offline. «anotepad-p1 30dv:1258-1272»
APP-0218. devthink — Prepare SEO: sitemap.xml, keywords.txt, robots.txt, ads.txt, banner devthink.jpg. «anotepad-p1 30dv:56-78»
APP-0219. devthink — Fixe atalhos universais: Ctrl+Z/Y/C/V (copy/paste ENTRE abas), Ctrl+S auto-save, Ctrl+Click multi-seleção, arrastar = criar laboratório. «anotepad-p1 30dv:950-958»
APP-0220. devthink — Exiba status ao vivo: livecounter de usuários online, projectcounter, heatmap de atividade, vitrine de métricas. «anotepad-p1 30dv:1180-1188»
APP-0221. devthink — Ofereça retrospectiva do usuário e da plataforma (ano/mês/semana/dia/hora) com gráficos, stats, countdown; monitoramento micro + macro + treinamento. «anotepad-p1 30dv:1212-1240»
APP-0222. devthink — Popule /windgets (admin) com assets upados por categoria (video/audio/3d/canvas/notes/site/tools/code/models/templates). «anotepad-p1 30dv:848-860»
APP-0223. devthink — Ofereça /mockup com exemplos/templates de projetos por aba (3D, áudio, canvas, vídeo, site). «anotepad-p1 30dv:606-616»
APP-0224. devthink — Expanda o roster: criador de extensões web, criador de jogos, engineering simulation, ads builder, ebooks builder, cursos online (venda/compra/assistir), streaming de jogos play-to-go, tradução de fala em tempo real, criador de imagens pixels, terminal isolado para pagantes. «anotepad-p1 30dv:1282-1294»
APP-0225. devthink — Vise as métricas-alvo: 100+ páginas, 500+ componentes, 60+ ferramentas, 50+ file hosts, 15+ categorias de conteúdo, 10+ editores profissionais. «anotepad-p1 30dv:1296-1305»
APP-0226. devthink — Deploye GitLab repo + Netlify + Supabase com _headers, _redirects, netlify.toml, ak.js. «anotepad-p1 30dv:1310-1320»
APP-0227. devthink — Posicione a plataforma como "Adobe Creative Cloud + Twitch + YouTube + Discord + Spotify + AI Agents" com custo zero de infraestrutura, persistência total, escalabilidade infinita. «anotepad-p1 30dv:8-10»
APP-0228. devthink — Defina a API de páginas 45 v1: 01 Landing; 02–04 Auth; 05 Onboarding Tour; 06 Chat Main Workspace; 07 Active Stream; 08 Sandbox Terminal; 09 Sandbox Browser; 10 Sandbox Editor; 11 Approval Checkpoint; 12 Emergency Kill Switch; 13 Projects Hub; 14 Project Details; 15 Environment Create; 16 VM Storage; 17 Desktop Bridge; 18 Git Branch Manager; 19 Connectors Catalog; 20 MCP Importer; 21 Skill Builder; 22 OAuth Manager; 23–25 IM Bots (Discord/Telegram/Slack); 26 Automations Dashboard; 27 Cron Creator; 28 Mail Gateway; 29 Execution Logs; 30 Webhook Dispatch; 31 Library Hub; 32 Web Deployments; 33–35 Studios; 36 Security Posture; 37 Audit Trail; 38 Compliance Scanner; 39 Extension Inspector; 40 Telemetry Analytics; 41 User Profile; 42 Memory Customizer; 43 Layout Customizer; 44 Billing Compute; 45 Developer Keys. «raiz-models FEATURES 45 telas»
APP-0229. devthink — Agrupe as 45 telas em 9 grupos de carga: G1 Público/Auth (01–05) · G2 Onboarding (06–08) · G3 Núcleo Chat-Agente (09–15) · G4 Ambientes & Repos (16–20) · G5 Conectores & MCP (21–25) · G6 Agendamentos & Cron (26–30) · G7 Biblioteca (31–35) · G8 Segurança & Auditoria (36–40) · G9 Configurações (41–45). «raiz-models FEATURES grupos de carga»
APP-0230. devthink — Implemente sandbox embutida no chat: terminal xterm, browser headless (CDP viewport), Monaco editor + diff view, file tree, restart VM, checkpoint card, killswitch modal. «raiz-models FEATURES Sandbox embutida»
APP-0231. devthink — Copie o sistema de bordas do neochatinterface: z-order L1b right tab (z0) → L0 borda extra (z1) → L1 body fill (z2) → L2 SVG gradiente (z3) → L3 botões (z10) → L4 conteúdo (z20); halo frosted é outer-ring only, sempre ATRÁS do contorno gradiente. «neochatinterface S4; REGRAS 1»
APP-0232. devthink — Use geometria "saddle" nas abas do chat: BOX_CORNER_RADIUS 24, SADDLE_CONCAVE_RADIUS 14, TAB_HEIGHT 40, OVERLAP_OFFSET 1.5, ACTIVE_TAB_RADIUS 18, INACTIVE_TAB_RADIUS 14; junta côncava fundida à caixa. «neochatinterface S1-S2»
APP-0233. devthink — Anime bordas: gradiente multicolor (#3b82f6→#8b5cf6→#ec4899→#f97316) stroke 6.5 com animateTransform 9s; squish de raio 18↔14 (220/380ms easeOutQuart); pulse branco no send 650ms. «neochatinterface S3, S9»
APP-0234. devthink — Estilize chat com claymorphism + liquid glass: clay-btn com inset shadows 4 camadas, backdrop blur 48px saturate(185%), gloss ::before 46%, send-btn gradiente 5-stop. «neochatinterface S10-S11, S16»
APP-0235. devthink — Corra aurora blobs animados com paleta por aba (blur 64px, blobFloat 24s, delays 0/-5/-9/-13s) e tokens dark (#08080A/#121216/#1E1E24, accent #F97316). «neochatinterface S12-S13»
APP-0236. devthink — Construa o app Aura (neodevthink) com caixa de chat `rounded-[32px]` liquid-glass, pills 28px, "Internal Cognition" com scanline e chevron colapsável, MessageBubble assimétricas, timestamps + "Aura Pro". «neochatinterface S14-S15»
APP-0237. devthink — Ofereça 5 temas completos (default glass, dark, pitch-black AMOLED, nordic-forest, sunset-royal) com tokens por tema. «neochatinterface neodevthink FEATURES»
APP-0238. devthink — Verifique por fluxo obrigatório: `bun run lint` limpo → dev server 200 → Agent Browser + VLM confirmando em dark E light, aba ativa E inativa, sem glitches/console errors. «neochatinterface REGRAS 4»
APP-0239. devthink — Use o método DevThink de design: decompor cada referência em macro/meso/micro e redistribuir propriedades na marca própria — "never a literal copy"; documentar em mapeamento-*.md com matriz origem→destino. «neochatinterface REGRAS 7»
APP-0240. devthink — Escolha assistente oficial da plataforma: Loo (Lookup); renomeie linhagens SoFlowX→DooThink→Lookup mantendo `@lookup` como usuário-IA com privilégios super root admin e time de 30+ devs. «devthink-lookup D1; anotepad-p1 ESTRTUUTA 105-111»
APP-0241. devthink — Construa o Lookup OS com shell de janelas: OSWindow com abas múltiplas, combineTabs/unstackTab/detachTab (popup 800x600), StartMenu 3x3 ("Exactly 9 Core Apps": VIDEO, AUDIO, STUDIO3D, CANVAS, CODE, LIVE, AI, FILES, EXPLORE), Ctrl+K palette, Ctrl+Alt+Del → STATUS. «devthink-lookup F1-F5»
APP-0242. devthink — Rode o backend próprio Lookup: Express + Socket.IO + Vite middleware com rotas /auth/*, /rpc/:fn, /storage/v1/object/:bucket, /users/*, /projects, /streams, /files, /activity, /upload, /health; schema Drizzle/SQLite users/projects/streams/project_files/activity_logs; fallback localStorage em 404. «devthink-lookup F7-F9»
APP-0243. devthink — Implemente "self-hosted Supabase": classe SelfHostedAuth reimplementando Auth/PostgREST/Realtime/Storage sobre Drizzle+SQLite; migração pós-Supabase mantendo paridade de API. «devthink-lookup F10, D2»
APP-0244. devthink — Crie o agente AI da plataforma (uapp/ai): planner com FunctionDeclarations, ToolRegistry, perception (scan DOM semântico via data-ai-id), DOMExecutor ("as mãos"), VectorMemory, prompts por papel (GENERAL_ASSISTANT, CODE_EXPERT, CREATIVE_DIRECTOR, DATA_ANALYST). «devthink-lookup F13»
APP-0245. devthink — Mantenha painéis de verificação de segurança 0/0/0 (code scanning, secret scanning, dependabot) como critério de pronto do devthink. «regras-totais Zero panels»
### saddle

APP-0246. saddle — Defina a tese central Storage == Compute: bytes de storage e de memória são os mesmos; a diferença é a flag de uso (`process` = working set temporário vs `keep` = persistente). «raiz-saddle 07saddle:1890-1899; saddle-dns-extension-misc»
APP-0247. saddle — Posicione honestamente: "free compute + storage-as-virtual-RAM **cache**" — storage nunca vira VRAM física (bus ~900 GB/s vs ~50–300 ms rede). «raiz-saddle 07saddle:1381,1897; saddle-dns-extension-misc»
APP-0248. saddle — Nunca rotule storage remoto como RAM/VRAM/runner always-on; toda execução gera honesty receipt auditável e declarativo, sem side-effects. «raiz-saddle 07saddle:7351-7357; regra universal 8»
APP-0249. saddle — Implemente o five-layer model: Storage → Storage-to-RAM Bridge → Compute → Sandbox Lifecycle → Orchestration. «raiz-saddle 07saddle:1955-1964,9655»
APP-0250. saddle — Considere o runner processador substituível: GitHub Actions é adapter, não core; capacidade/latência/durabilidade são propriedades do backend, nunca do engine. «raiz-saddle DICIONÁRIO; saddle-dns-extension-misc SPECS»
APP-0251. saddle — Defina working set: conjunto limitado de dados estágio-em-RAM (memfs/tmpfs/mmap) que o runner processa, com fronteira física explícita. «raiz-saddle DICIONÁRIO»
APP-0252. saddle — Defina artifact como fronteira durável publicada: resultado do job. «raiz-saddle DICIONÁRIO»
APP-0253. saddle — Execute o engine: job serializável → working set temporário → runner injetado → commit em storage adapter → event trail/receipt. «saddle-dns-extension-misc SPECS enginearchitecture»
APP-0254. saddle — Siga a arquitetura universal (vale para qualquer novo app): 1 root-first sem `src/`; 2 sem hardcoded host/port/credencial/cloud/vendor; 3 sem platform-locked functions; 4 transport-neutral core; 5 WinterTC/ECMA-429; 6 Zod v4 nas bordas; 7 built-ins first; 8 honesty receipts; 9 date-aware; 10 third-person no emoji; 11 cross-runtime floor; 12 no localhost. «saddle-dns-extension-misc REGRAS 1-12»
APP-0255. saddle — Fique root-first: pastas só agrupam lógica correlata; arquivo perto do root map; lowercase, sem `_`/`-`; até 20 lógicas correlatas por arquivo (5.3 admite 0–100/300). «raiz-saddle 07saddle:213,3442; stealthhead PLANO-5.3»
APP-0256. saddle — Receba host+port como config; porta temporária sorteada e travada pelo caller; servidor nunca recebe hardcode. «raiz-saddle 07saddle:211,3440»
APP-0257. saddle — Rejeite Netlify/Vercel Functions: use Node server aberto, container, worker ou forge workflow. «raiz-saddle 07saddle:212»
APP-0258. saddle — Mantenha core transport-neutral: core não importa Node/Docker/provider client; side-effects caller-owned e injetados. «regra universal 4; raiz-saddle 07saddle:214»
APP-0259. saddle — Limite-se ao WinterTC/ECMA-429 no core: fetch, Request/Response, URL, URLPattern, crypto.subtle, ReadableStream, structuredClone, AbortController, performance.now; evite fs/process/Buffer/path/child_process/require/__dirname → adapters + Uint8Array + import.meta.url. «regra universal 5»
APP-0260. saddle — Valide com Zod v4 só nas bordas: z.strictObject, branded, discriminated unions; z.toJSONSchema alimenta OpenAPI. «regra universal 6»
APP-0261. saddle — Prefira built-ins (`node:*`) a dependências novas; sem polyfills (fetch-polyfill, undici, buffer, path-browserify declarados mortos). «regra universal 7»
APP-0262. saddle — Respeite cross-runtime floor: Node ≥26.2 / Bun ≥1.4; Node 26.7 em CI/containers; Node 24.x LTS; engines.node >=22 até release deliberada; runtime detection Deno → Bun → Node → browser; conditional exports com `types` primeiro, `browser` antes de `import`. «regra universal 11»
APP-0263. saddle — Escreva docs/comments em inglês, 3ª pessoa, zero emoji. «regra universal 10; raiz-saddle 07saddle:217-218»
APP-0264. saddle — Faça pesquisa date-aware: toda pesquisa carrega data de observação; claims expiram. «regra universal 9»
APP-0265. saddle — Segure coding standards: 1 arquivo/contexto sem duplicar lógica; scripts em /tests (não-JS em /tests/scripts/); um padrão só; CSS moderno com variáveis; error catcher embutido p/ tracing. «raiz-saddle 07saddle:3789-3809»
APP-0266. saddle — Passe o checklist de 10 pontos antes de entregar: deploy aberto sem Functions; infra aberta (portas sorteadas); root-first; 3 camadas; multi-mode library; catálogo NBIT; design rígido 44px touch; estilo lowercase/sem emoji; coding meticuloso; escolha total do usuário. «raiz-saddle 07saddle:7418-7435»
APP-0267. saddle — Serve credenciais sempre injetadas pelo caller/secret: nunca commitadas nem impressas; alvos privados bloqueados; robots/crawl-delay/limites explícitos. «raiz-saddle 07saddle:1526-1532»
APP-0268. saddle — Bloqueie execução binária por padrão (binary opt-in, denied-by-default): só com capability receipt + approval de adapter isolado caller-owned. «raiz-saddle 07saddle:1649-1650,7347-7350»
APP-0269. saddle — Declare capacidades unsupported/paid explicitamente; teste com fake transports determinísticos; gates antes de push. «raiz-saddle 07saddle:3761-3764»
APP-0270. saddle — Garanta extension MV3 enxuta: só `activeTab`, `scripting`, `storage`; sem broad host, cookies, webRequest, debugger. «raiz-saddle 07saddle:1531,9505-9508»
APP-0271. saddle — Normalize o job lifecycle: jobqueued → jobpreparing → runnerselected → jobrunning → jobsyncing → storagecommitted → jobcompleted (+jobfailed com código/retryability). «raiz-saddle 07saddle:1678»
APP-0272. saddle — Exponha a public API raiz: saddleurl, scrapeurl, scrapehtml, extractcontent, serializeresult, formatforagent, chunkMarkdown/formatChunksForRAG, generateLlmsTxt/generateLlmsFullTxt, estimateTokens/fitsInContext, withRetry, createServer, batchscrape, crawlurl, browseragent, mcpserver/mcptransport, nodeserver, engine/scheduler, release-assets, releaseevidence/evaluateevidence, releasereadiness, executionrequest/executiondecision/executionhandoff, internalenvelope/internalapi. «raiz-saddle 07saddle:1481-1510»
APP-0273. saddle — Ofereça Agent API: Saddle.launch, agent.run/batch/use/tool/remember/recall/on, saddle.compile, browser.navigate/click/type/screenshot, scrape, sandbox.exec; Zod v4; viewport 320–7680×240–4320; maxRetries 0–10; browserPool 1–20 × 1–50 pages; breaker threshold 0.5. «raiz-saddle 07saddle:1680-1699»
APP-0274. saddle — Publique subpaths: ./browser, ./bot, ./captcha, ./memory-engine, ./deploy, ./release-evidence, ./extension, ./browser-playwright (caller-installed). «raiz-saddle 07saddle:2000-2011»
APP-0275. saddle — Exponha memoryengine({backends, maxentries, maxbytes}): persist/load rehydrata do primeiro backend responsivo; stats() com hits/misses/evictions; hot working set em process memory + backends caller-owned como lado durável; evict LRU após exceder maxentries/maxbytes. «raiz-saddle 07saddle:3653-3667; saddle-dns-extension-misc SPECS»
APP-0276. saddle — Escolha pool descriptors com políticas: first-healthy/verified-first/priority-first/primary-only/best-effort mirror/quorum/fan-out + repair plans + capability reports. «raiz-saddle 07saddle:3941-3953,7359-7373»
APP-0277. saddle — Reliability: retry só para 429/5xx/408/409/520–530 + ECONNRESET; circuit breaker CLOSED→OPEN→HALF_OPEN (threshold 5, reset 60 s) + saga compensation; rate-limit token-bucket/sliding-window/leaky-bucket honrando Retry-After. «raiz-saddle 07saddle:1453-1457»
APP-0278. saddle — Tipifique erros em const-enums: Network 1xxx, HTTP 2xxx, Browser 3xxx, Scraping 4xxx, Session 5xxx, Config 6xxx. «raiz-saddle 07saddle:1797»
APP-0279. saddle — Mapeie ~30 superfícies/modos: library npm, CLI (`saddle <url> -f markdown|json|xml|redis|text` + subcomandos capture/bot/memory/deploy/mcp/modes/runexample/create/exec/convert-to-ram/memory-stats/sleep/wake/list), binário, MV3 extension, bot multi-plataforma, web/playground, mobile Capacitor 8.5.0, desktop Tauri 2, n8n node. «raiz-saddle 07saddle:1664-1680,278-299»
APP-0280. saddle — Trabalhe os modos de execução como pares w/wo: fetch/browser/auto/headless/cli-binary/computer — cada modo funciona sem e com seu par (browser pair Playwright vs fetch+Cheerio; Node pair; AI pair). «raiz-saddle 07saddle:1400-1435,3846-3864»
APP-0281. saddle — Declare mode axes: execution {library, application, browser, desktopapp, mobileapp, extension, cli, binary, computer, internet} × runtime {node, browser, deno, bun, worker} × memory {internal, external, physical, vectorized} × file/dependency/visibility/pair. «raiz-saddle 07saddle:1975-1999; saddle-dns-extension-misc»
APP-0282. saddle — Raspe em cascata fetch→browser→auto; extração structured-first JSON-LD→Microdata→OpenGraph→RSS/Atom→Readability→raw HTML. «raiz-saddle 07saddle:1751-1779»
APP-0283. saddle — Converta com mdream (Rust/WASM ~15 ms/MB) para markdown/xml com 60–80% menos tokens para LLM. «raiz-saddle 07saddle:2013-2032; saddle-dns-extension-misc»
APP-0284. saddle — Produza saídas exclusivas Redis `JSON.SET` e `llms.txt`/`llms-full.txt`. «raiz-saddle 07saddle:6208-6234»
APP-0285. saddle — Chunk para RAG em 400–512 tokens com 10–20% overlap. «raiz-saddle 07saddle:6234»
APP-0286. saddle — Monte a storage-to-RAM bridge: swap fallocate/mkswap, tmpfs 8G, zram zstd 2–3×, mmap/memfd com magic-byte loader, FUSE/rclone 70+ backends, DB-as-RAM (SQLite :memory:, PGlite, Turso), CDN load com SRI sha384. «raiz-saddle 07saddle:1717-1734,2432-2459»
APP-0287. saddle — Defina tiers de computational memory: L1 RAM ~100 ns / zram ~500 ns / tmpfs ~1 µs / mmap ~5 µs / SQLite ~10 µs / object store ~50 µs. «raiz-saddle 07saddle:2443-2459»
APP-0288. saddle — Agregue >33 TB de storage livre de terceiros: HF ~10 TB, Kaggle 20 TB, Terabox 3 TB, GitHub 500 MB. «raiz-saddle 07saddle:359,4059-4060»
APP-0289. saddle — Implemente buckets V5: HF (500GB/arquivo), Kaggle (200GB/dataset ×10 = 2TB), Terabox (1TB×3 contas), npm (250MB tarball + jsDelivr/UNPKG/ESM.sh como CDN), rclone 70+ backends; farm.py orquestra N repos ×500MB. «saddle-dns-extension-misc FEATURES»
APP-0290. saddle — Implemente file-as-compute (V6): site próprio + Prisma (Site/File/FileChunk 1 MB/ComputeJob); chunks de 1 MB distribuídos em N repos workers; Action worker reconstrói em /mnt/ramdisk (tmpfs), executa WASI/Node, resultado volta por CDN jsDelivr; pointers BigInt (9 quintilhões); tabela de site + file table (BigInt >2 GB). «raiz-saddle 07saddle:2454-2459,4049-4059; saddle-dns-extension-misc»
APP-0291. saddle — Rode o multi-forge free fleet: GitHub Actions 4 vCPU/16 GB/6 h unlimited OSS; GitLab 400 min/mo; Codeberg+Woodpecker 750 MB FLOSS; Forgejo/Gitea self-hosted unlimited; HF Spaces 16 GB + ZeroGPU ~96 GB VRAM ~5 min/dia; Kaggle 30 h/sem GPU T4–P100; ModelScope 2000 calls/dia; Oracle Always Free 2 OCPU/12 GB. «raiz-saddle 07saddle:2483-2507»
APP-0292. saddle — Encadeie runners na ordem `oracle→github→hf→gitlab→kaggle` e pare no primeiro runner livre; farm.py: 100 repos `opencode-worker-N` ×500 MB = 50 GB, dispatch para no primeiro `204 Accepted`. «raiz-saddle 07saddle:41-49,396-407,6753»
APP-0293. saddle — Ofereça a sandbox ladder: child_process → Pyodide-WASM → microVMs; runtimes kern ~1.9 ms, CubeSandbox <60 ms, Firecracker <125–150 ms, Mitos ~27 ms warm, gVisor ~200 ms cold, Docker ~300 ms hardened (`--network=none --cap-drop=ALL --read-only --pids-limit=512 --runtime=runsc`). «raiz-saddle 07saddle:1699-1717,2460-2482,6805-6832»
APP-0294. saddle — Banque vm2 definitivamente (CVEs conhecidas). «raiz-saddle 07saddle:6805-6832»
APP-0295. saddle — Durma Docker hardened com MemorySwap -1 e ShmSize 2g. «12conv-p3 VSE v2/v3»
APP-0296. saddle — Trate captcha como risco #1 (potencialmente ilegal/ToS): só opt-in, supervisionado, como research; stealth/canvas/TLS spoofing ficam fora do core (gaps declarados). «raiz-saddle 07saddle:6980-6983»
APP-0297. saddle — Estruture captcha em P1–P3 evidence-based: P1 stealth (patchright + puppeteer-stealth + fingerprint rotation) → P2 comportamento (Bézier 0.3×→2.5×, Fitts `0.05+0.07·log2(1+d/20)`s, digitação lognormal μ=4.17 σ=0.3 ~65 ms, ~2% typos, ~15% overshoot) → P3 solver (hcaptcha-challenger ONNX ResNet/YOLOv8/ViT, NopeCHA, 2Captcha/CapSolver; 30+ tipos). «raiz-saddle 07saddle:1792-1809,6181-6208,11871-11892»
APP-0298. saddle — Adote a postura captcha 1.8.x: detecção + pausa para revisão humana + solver externo explícito + evidências auditáveis (guard.js) — bypass automático descartado. «saddle-dns-extension-misc DECISÕES 2»
APP-0299. saddle — Rode o agent browser/Atlas: captura real (Brave) de mouse/click/scroll/tecla em JSON reproduzível por `seed`+`events`; sessões com replay d3; mouse virtual SVG, trail, click ripple via CDP init script; export `docs/logs/<session>.json` com personality. «raiz-saddle 07saddle:1841-1856; saddle-dns-extension-misc»
APP-0300. saddle — Trate Atlas como browser real em 30 modos + backend próprio Drizzle+mysql2+Prisma+Cloudinary. «raiz-saddle 07saddle:6234-6243,11843-11856»
APP-0301. saddle — Padronize o movement log JSON v1: session {id sess_01J9…, agentName uka-capture, browser brave, originUrl, seed, personality careful, viewport}, eventos com x/y/rotação/timing/target/selector. «raiz-saddle 07saddle:11871; saddle-dns-extension-misc SPECS»
APP-0302. saddle — Rode bots como third-party app com credenciais SEMPRE do usuário: GitHub App/OAuth, GitLab, Forgejo, Gitea, Bitbucket, SourceHut, HF, Reddit, Discord, Telegram, Slack, Mastodon, Matrix, Bluesky. «raiz-saddle 07saddle:3129-3154,2187-2202»
APP-0303. saddle — Empacote em 6–7 registries: npm, GHCR, Maven io.wenathlan, NuGet, RubyGems, ClawHub/OpenClaw, GitHub Pages. «raiz-saddle 07saddle:1539-1562,1809-1841»
APP-0304. saddle — Gere 38 assets por release + SHA256SUMS + SBOM CycloneDX + provenance in-toto; naming `saddle.browser.1.8.18.<os>.<abi>.<ext>`; estados de assinatura declarados honestamente (SignPath Foundation pending). «raiz-saddle 07saddle:6885-6886,1539-1562»
APP-0305. saddle — Ofereça zero-install via CDN: nunca `npm install`; esm.sh/esm.run/jsDelivr/unpkg/jspm/cdnjs com import maps e SRI. «raiz-saddle 07saddle:3446-3501»
APP-0306. saddle — Rode a SCDN: PUT/GET/DELETE com bearer + Cache-Control para R2/CloudFront/Bun CDN/Deno Deploy/Vercel/Netlify edge 50–200 ms vs 200–2000 ms direto. «raiz-saddle 07saddle:3744,4165»
APP-0307. saddle — Fixe a identidade canônica `@wenathlan/saddle` a partir de v1.8.1; cadeia: OpenCode Multi-Forge → UKA (@devthink/UKA) → DevThink WebScrape (@devthink/webscrape) → Saddle; nomes rejeitados: CloudSandbox, SandPlatform, storage-ram-bridge, Seddon/Sedol. «raiz-saddle 07saddle:1921-1934,4379-4396,6999-7028»
APP-0308. saddle — Feche a licença em GPL-3.0-only (resolve a contradição histórica "Proprietary - View Only"/MIT em 1.8.12); docs canônicos nunca revogam GPL. «raiz-saddle 07saddle:1792,6980-6999»
APP-0309. saddle — Trate o npm token antigo exposto em chat como comprometido: nunca reusar; publicação só via secret `NPM_TOKEN` owner-managed / OIDC trusted publishing. «raiz-saddle 07saddle:1539-1554»
APP-0310. saddle — Defina o posicionamento competitivo: "Toolkit+" entre Crawlee (framework) e Firecrawl/Browserless (DaaS); pesos AI 25%, anti-detection 20%, production 20%, ease 15%, cross-runtime 10%, serialization 10%. «raiz-saddle 07saddle:1856-1872»
APP-0311. saddle — Marque como ToS válido processar binário do próprio repo via Actions; farm com contas descartáveis para compute em massa é violação (~40 contas) — caminho correto é paid barato (R2 $0.015/GB) ou self-host Forgejo+MinIO. «raiz-saddle 07saddle:6986-6988»
APP-0312. saddle — Rejeite V7 (113 arquivos aninhados/8 níveis/1,39 MB) e adote V8 flat numeric-prefix sem `_`/`-`: "ls é a documentação". «raiz-saddle 07saddle:1940-1955,4396-4409,6794-6805»
APP-0313. saddle — Preserve as gerações de design V1–V8 como histórico: V1 Pages runtime → V2 thin client → V3 multi-forge+farm → V4 repo-as-virtual-processor ("everything is a file") → V5 100% third-party → V6 SQL-as-compute (10 CDNs, pointers TB BigInt) → V7 rejeitado → V8 flat. «raiz-saddle 07saddle:1940-1955»
APP-0314. saddle — Desenhe o brand com tokens: ember #d35d3d, ink #202a2f, paper #f7f1e8, gold #e5c26f, grey #6d7777; wordmark "SADDLE" 58px/700 ls10; tagline "STORAGE · WORKING SET · RUNNER"; diagrama 1200×360 4 estágios. «raiz-saddle 07saddle:1886-1890,7299-7316»
APP-0315. saddle — Aplique design rígido com porte de toque 44px em todos os controles do saddle. «raiz-saddle 07saddle:7428; saddle-dns-extension-misc brand»
APP-0316. saddle — Fixe o catálogo NBIT como fonte centralizada de versões de dependências. «raiz-saddle 07saddle:7428»
APP-0317. saddle — Compare servidores por benchmark: Elysia (Bun ~184K req/s) > Fastify (42–114K) > Hono (45–78K) > Express (8–21K); use Drizzle+mysql2 como store primário (DB criado no deploy, nunca SQLite local); Prisma schema file-as-compute (FileChunk 1 MB/row). «raiz-saddle 07saddle:1792-1798,4065»
APP-0318. saddle — Organize o repo map: core/domain/memory/storage/scrape/queue/browser/extension/desktop/android/ios/protocol/workflow/release/runtime/packager/web/tests/docs. «raiz-saddle 07saddle:1601-1628»
APP-0319. saddle — Fixe dependências-chave: Cheerio 1.2.0, jsdom 29.1.1, turndown 7.2.4, mdream, Crawlee 3.x, robots-parser RFC 9309, Zod v4, p-queue/p-limit/bottleneck, isolated-vm, memfs, dockerode, tinypool, Capacitor 8.5.0, Tauri 2, Bun --compile/tsdown/SEA. «raiz-saddle 07saddle:321-329,9280-9301»
APP-0320. saddle — Registre o catálogo gratuito: 26 modelos dedup de OpenCode Zen (8), OpenRouter (15 únicos), Kilo (12 únicos), 9 compartilhados; filtro `-free|/free|:free`; exemplos deepseek-v4-flash-free (1.048.576 ctx), tencent/hy3:free, nemotron-3-ultra. «raiz-saddle 07saddle:1767-1779,3691-3703»
APP-0321. saddle — Mantenha platform inventory: 911 plataformas em 74 categorias (forges, CI, registries, DVCS, cloud, descentralizados IPFS/Filecoin/Arweave/Radicle/ForgeFed). «raiz-saddle 07saddle:3703-3715»
APP-0322. saddle — Documente os release blocks 1.7.0→1.8.16: migração wenathlan 1.8.2, audit Node 26.7.0 1.8.4, TypeScript 1.8.9, multi-target 1.8.10–11, assinatura 1.8.12, bounded working set 1.8.13–15, estudo 130 candidatos 1.8.16. «raiz-saddle 07saddle:3730-3765»
APP-0323. saddle — Feche 1.8.18 como isolation contracts data-only (executionrequest/decision/handoff, default denial) e 1.8.19 como virtual control plane (representar/validar/negar/handoff — nunca acessar dispositivo silenciosamente). «saddle-dns-extension-misc FEATURES release train»
APP-0324. saddle — Espelhe releases em npm/GitHub Packages/GHCR/Maven/NuGet/RubyGems/PyPI trusted/jsDelivr/ClawHub/OpenClaw com OCI multi-arch (amd64/arm64/ppc64le). «saddle-dns-extension-misc FEATURES release train»
APP-0325. saddle — Rode o VDR/UMCF como direção explorada, não layout shipped: processamento externo via headers `X-VDR-*` (pipeline streaming, swarm MapReduce, headless runner, cron async, memoization fabric). «raiz-saddle 07saddle:7194-7209,7435-7439»
APP-0326. saddle — Explore Site B/Static Mesh: site self-hosted como server/micro-VM (memfs, isolated-vm, better-sqlite3 :memory: como disco virtual; SQLite por session-id). «raiz-saddle 07saddle:7179-7194,7254-7269»
APP-0327. saddle — Estude BCI/EMS como roadmap sci-fi em 10 episódios: Human Operator (MIT Hard Mode 2026, EMS Arduino), Brain2Qwerty v2 (MEG 61%/78%), Meta Neural Band, GMS CHI 2026; eixo corpo-INPUT (sEMG CTRL-labs, OpenBCI). «raiz-saddle 07saddle:1872-1886,6946-6980; saddle-dns-extension-misc DECISÕES 12»
APP-0328. saddle — Absorva e2ugh no saddle: mesclar wenathlan/e2ugh dentro de wenathlan/saddle, nada se perde; equivalentes mesclados num arquivo; e2ugh v1.2.20 (153+ testes, 13 workflows) → mesclagem 2.0.0. «devthink-lookup R25; ARVORE saddle»
APP-0329. saddle — Restrinja o escopo do saddle: só virtualização — sem browser, sem gateway, sem features de OS; sandbox completa e runner de qualquer sandbox do mercado. «ARVORE:10»
APP-0330. saddle — Ofereça 3 bases: max, balanced, lite. «ARVORE:10; regras-totais Appendix A»
APP-0331. saddle — Cubra SOs (android, grapheneos, linux, omarchy, windows e distros) e archs (arm64, amd64 e outras). «ARVORE:10»
APP-0332. saddle — Entregue vGPU e vCPU próprias; gerencie o hardware virtual que os domínios usam. «ARVORE:10»
APP-0333. saddle — Publique o saddle em 3 formas: runtime por pacotes Node, full por container Docker, publicada nos registros. «ARVORE:10; regras-totais Appendix A»
APP-0334. saddle — Spoofe hardware virtualmente: CPU EPYC 9965 (192c/384t, 384MB L3), Ryzen 9 9950X3D (144MB) / 9950X3D2 (192MB Dual X3D), flags AVX512/VNNI/BF16, `-march=znver4`; GPU RTX 5090 (10DE:2B85, 32GB, 21760 CUDA, driver 575.51.03, sm_120) e RTX PRO 6000 (10DE:2BB5, 96GB, MIG 1g.24gb). «12conv-p3 VSE v2/v3»
APP-0335. saddle — Rode Mesa 25.2.7 (LLVMpipe AVX512, Lavapipe Vulkan, Rusticl) com LP_NATIVE_VECTOR_WIDTH 512. «12conv-p3 VSE v2/v3; timelineconversa5»
APP-0336. saddle — Emule RAM 1GB–1024GB via `/etc/virtual_meminfo` (134217728 kB) com vCPU/vRAM modulares. «12conv-p3 VSE v2/v3»
APP-0337. saddle — Hooke sysinfo via libs/fake_hardware.c/.cpp com LD_PRELOAD no entrypoint (Xvfb :99 + porta aleatória). «12conv-p3 VSE repo v2»
APP-0338. saddle — Estruture o repo VSE: index.ts (factory library-first, randomPort, validateSpec, MetricsStore), hardware.ts (BEST_VIRTUAL_PROCESSORS 10 entradas), memory.ts (MEMORY_TIERS + MODULARITY), render.ts, orchestrator.ts (dockerode), security.ts (Landlock, seccomp, eBPF LSM, TOCTOU), future.ts (55 features), performance.ts (7 layers), alternatives.ts (10 categorias). «12conv-p3 VSE repo v2»
APP-0339. saddle — Passe engines >=24.11.0 e TS 7.0.2 no package.json do VSE; Dockerfile node:24-alpine; workflow build-engine.yml matrix [24.x, 26.x]. «12conv-p3 VSE repo v2»
APP-0340. saddle — Construa o coreorchestrator.ts com 25 lógicas: lifecycle, vCPU scheduler, vRAM ballooning, VFIO passthrough, NUMA, SR-IOV, live migration, snapshot, OTel, RBAC, quota. «12conv-p3 VSE v6»
APP-0341. saddle — Compile virtualizationcore.hpp/.cpp em C++23: KVM ioctl, memfd, QMP, virtio packed vring, vhost-user, VFIO IOMMU Type1v2, cgroup v2, vGPU Blackwell GB202, MIG v2 1g12GB–7g192GB HBM3e, NVENC 13.0, AMF 1.4, QSV VPL 2.12. «12conv-p3 VSE v6»
APP-0342. saddle — Ofereça qemubridge.py cliente QMP async com 22 métodos. «12conv-p3 VSE v6; ARVORE saddle»
APP-0343. saddle — Configure TOMLs: vm.config (vCPU 1–4096, RAM 512MiB–4TiB, passage bridge/NUMA/balloon), gpu.config, qemu.config (QEMU 9.1.2, q35, iommufd, perfis tiny→insane), passage.config (gateway Pingora 0.4.2, TLS 1.3, HTTP/3, 4 upstreams, rotas transcode/HLS), mttg.config (FFmpeg 7.1.1 NVENC 8th gen, SVT-AV1 2.3, VVC), docker.config. «12conv-p3 VSE v6; ARVORE saddle»
APP-0344. saddle — Mantenha boards.json (20 placas reais), cores.json, processors.json, gpus.json, virtualhardware.json, gpumonitor.cpp, virtualhardware.c na raiz do saddle (bloco sandbox). «ARVORE saddle:731-739; regras-totais Sandbox block»
APP-0345. saddle — Resolva bypass 429 do everstore com ZIP 100% client-side (JSZip DEFLATE 9 + FileSaver, Blob no navegador, botão 44px branco) — nunca tocar /mnt/data. «12conv-p3 VSE DECISÕES 8»
APP-0346. saddle — Escreva a skill VSE: observer 3ª pessoa, lowercase sem `_`/`-`, JSDoc, alvo de toque 44px, error catcher, host/porta randomizados (nunca localhost), 20–25 contextos correlacionados por arquivo, total <45 arquivos, docs dentro de docs/, conteúdo único real por arquivo (nada de template clonado). «12conv-p3 VSE Skill»
APP-0347. saddle — Mantenha o toolchain de referência: QEMU 9.1.2, libvirt 10.10, OVMF 2025.05, Node 22.12.3 LTS / 24.19.0 / 26.7.0, TS 5.6.3 / 7.0.2, Python 3.13.5, Docker 27.3.1 / 29.7.2, Mesa 26.3 (LLVM 20.1). «12conv-p3 SPECS 3»
APP-0348. saddle — Salve pesquisa V5 em v5research/: cpu_epyc9965.md, cpu_ryzenx.md, mesa_latest.md, microvm_latest.md, performance_layers.md, alternatives.md (800+ palavras + 3 tabelas reais cada). «12conv-p3 SPECS 4»
APP-0349. saddle — Fixe o tema saddle com páginas: Onboarding, Login, Console, Dashboard, Playground, Architecture, Compute, Docs, Home, Integrations, NotFound, Register, Metrics, Billing, Snapshots. «ARVORE saddle:662-676»
APP-0350. saddle — Fixe as lógicas raiz do saddle: acquisition, alternatives, automation, billing, cli, communication, compute, distribution, execution, format, foundation, images, index, integration, intelligence, isolation, media, metrics, modes, network, operations, orchestrator, performance, quantum, render, scheduler, security, server, snapshots, tiers, virtual, virtualcpu, virtualgpu, virtualization, virtualmemory, webscrape. «ARVORE saddle:741-776»
APP-0351. saddle — Inclua envelopes na raiz: mttg.config, passage.config, qemu.config, pom.xml, settings.xml, Saddle.java, saddle.csproj, saddle.gemspec, scrape.biome.json, scrape.tsconfig.json, vm.config.json. «ARVORE saddle:716-730»
APP-0352. saddle — Publique o site do saddle em subdomínio próprio (saddle.devthink.pro) com build nas máquinas do GitHub e artefatos no release. «ARVORE saddle:590»
APP-0353. saddle — Colete DB spec UKA: Drizzle ORM primary + mysql2 driver; Turso/libsql aceito; Prisma como alt; DB criado no deploy (mysql/turso), não local; tabelas de sessão computer-use. «raiz-saddle 07saddle:6243; saddle-dns-extension-misc SPECS»
APP-0354. saddle — Estude sandboxes de referência: Vercel Sandbox = Firecracker microVM por sandbox (node26/24/22, python3.13, sudo, Docker/FUSE dentro, credential brokering sem vazamento via console.log, network policy allowlist runtime, multi-agent isolation por usuário Linux); template AI SDK Computer Use: Xvnc+openbox+noVNC+websockify+Chrome+xdotool+ImageMagick. «saddle-dns-extension-misc SPECS sandbox research»
APP-0355. saddle — Conclua por evidência de 2026: híbridos ganham (DOM/a11y tree + VLM + scripts determinísticos + verificação screenshot diff) — Anthropic computer_use_20251124, OpenAI Operator/CUA 87% sites JS, Project Mariner 83.5% WebVoyager, UFO², browser-use 89.1% WebVoyager; benchmarks OSWorld humano 72% vs SOTA 12–20%. «saddle-dns-extension-misc SPECS computer use»
APP-0356. saddle — Prepare pipeline de scrape: AgentBrowser → scrapeUrl/scrapeHtml → extractContent → serializeResult (md/xml) → formatForAgent/buildContext; renderer Pygame para visualização; ts/ com 60+ módulos testados (cache, chunking, crawl, proxy, rate-limiter, retry, robots, sitemap, llms-txt, tokens, session, middleware, pool, dev-server). «saddle-dns-extension-misc SPECS scrape pipeline»
APP-0357. saddle — Defina resposta de commit: commits como iakadion (`174824991+iakadion@users.noreply.github.com`); commit partida saddle `0998054`; admins/CODEOWNERS iakadion, inathlan, aasblor, nasblor. «devthink-lookup R27 Apêndice A»
APP-0358. saddle — Siga a Regra 44: device flow client_id `178c6fc778ccc68e1d6a`, 19 escopos; nunca parar a operação aguardando autorização; não re-pollar pós-auth. «devthink-lookup R27»
APP-0359. saddle — Roda testes via GitHub: "Você não vai fazer os testes, você vai criar os workflows para os computadores do GitHub fazerem o teste" (Regra 58); builds/hashes nos computadores do GitHub. «devthink-lookup R27»
APP-0360. saddle — Viva o bump loop: corrigir → bumpar versão → push → monitorar → repetir até 100% verde; cada bug = bump. «devthink-lookup D8; regras-totais Bump loop»
APP-0361. saddle — Mantenha versão em lockstep em todos os envelopes com gate lendo package.json (nunca literal). «devthink-lookup R27 Regra 33; regras-totais Lockstep»
APP-0362. saddle — Roda um único Dockerfile cuidando de TODO o contexto de container (build, runtime, ENV, HEALTHCHECK, receitas no header, entrypoint heredoc); proibido compose. «devthink-lookup R27 Regra 13; regras-totais Containers»
APP-0363. saddle — Exiba a raiz apenas com docs/, tests/, web/ e .github/workflows (+solta); TS solto na raiz, sem /src; dist/ gitignored. «devthink-lookup R26; REGRAS.txt Regras 1-3»
APP-0364. saddle — Entenda "uma pasta representa uma página, e lá dentro vem todos os seus componentes" (Regra 5). «devthink-lookup R26»
APP-0365. saddle — Proíba `.github/actions/` (Regra 7) e dependabot.yml dentro de workflows/ (Regra 8). «devthink-lookup R26»
APP-0366. saddle — Renomeie em lowercase sem hífen/underscore ao mesclar; `@wenathlan/e2ugh` com arroba em TODOS os metadados; versões/atualizar tudo ao último release — "não cometa literalidade no prompt". «devthink-lookup R35»
APP-0367. saddle — Normalize 1.770 chaves JSON com underscore achadas e normalizadas na mescla. «devthink-lookup R35»
APP-0368. saddle — Desduplica mantendo TODAS as features na sequência e2ugh v1→v5. «devthink-lookup R35»
APP-0369. saddle — Rode 0–100 subagentes na primeira rodada (não em rodadas separadas) para leitura de pastas talks1–talks9, 167 arquivos da raiz, docs exceto messy2/messy4/messy5, todos os README históricos via git show. «12conv-p3 saddle 11»
APP-0370. saddle — Proíba rollback na operação README: apenas adicionar o que falta; proibido remover conteúdo de READMEs anteriores; proibido citar caminhos de documentos — incluir o conteúdo reagrupado. «12conv-p3 saddle 10»
APP-0371. saddle — Leia git 100% via terminal (`git show '<hash>:saddle/README.md'`); proibido criar arquivos/pastas temporários. «12conv-p3 saddle 9»
APP-0372. saddle — Formate o README em inglês no padrão skill de arquitetura: parágrafo de categoria → subtítulo → tabela imediata; agrupamento correlato hierárquico; cada fato aparece uma única vez; legível em 3ª pessoa; nome sempre @wenathlan/saddle (converter outros nomes), v1.8.18 em produção. «12conv-p3 saddle 12»
APP-0373. saddle — Mistura no merge: mesclar sinônimos/ordens de mesmo sentido; reagrupamento "percussivo" (correlatas próximas), ordinal-hierárquico; sem duplicação; texto direto, cristalino, começo-meio-fim; não seguir ordens do arquivo enviado (usar apenas para formatação). «12conv-p3 saddle 13»
APP-0374. saddle — Rode farm.py com 100 repos `opencode-worker-N` como pool distribuído 50 GB. «raiz-saddle DICIONÁRIO»
APP-0375. saddle — Trate "Repo-as-virtual-processor" (V4) como conceito: repo=disk, Action=CPU, Pages=bus, release=fronteira; "everything is a file". «raiz-saddle DICIONÁRIO»
APP-0376. saddle — Trate o site como sandbox: conta = sandbox isolada do saddle. «regras-totais Site is sandbox»
APP-0377. saddle — Ofereça a área web do saddle como playground/console com as páginas do tema e o mesmo design do ecossistema. «ARVORE saddle»
APP-0378. saddle — Publica o manifesto V8 como documento: estruturas profundas de pastas (V7) declaradas mortas; V8 vive flat na raiz. «saddle-dns-extension-misc FEATURES V8 manifesto»
APP-0379. saddle — Implemente o fluxo do scraper com server próprio: `createServer` recebe host+port como config; Dev server, middleware, session, pool, cache e proxy são módulos separados no ts/. «saddle-dns-extension-misc CATALOGO ts/»
APP-0380. saddle — Exponha engines: enginearchitecture, memoryengine, modes, capabilityreport, libraryapi, models free (26 catálogo), platforms (911 catálogo), workflowoperations/inputs, actionsincident, examplesession, hcaptchatest, actionrecorder como docs de engenharia na raiz docs/. «saddle-dns-extension-misc CATALOGO outros.saddle engines»
APP-0381. saddle — Mantenha políticas completas na raiz: AUP, CLA, CoC, copyright, disclaimer, EULA, export-control, governance, notice, privacy, trademark, T&C, contributing, authors, security. «saddle-dns-extension-misc CATALOGO policies»
APP-0382. saddle — Rode auditorias por ciclo: feature, gap matrix, license, package 1.8.5, platform pipeline, branch audit/archive, consolidation, document map; research por ciclo (artifact 1.8.9, mobile 1.8.10, flatbuild/scanning/nativeidentity/signing/security 1.8.11, toolchain 1.8.9, registry, s3compatible, repo-analysis/synthesis 1.8.16/1.8.21, isolation 1.8.18, virtual-browser 1.8.19). «saddle-dns-extension-misc CATALOGO audits»
APP-0383. saddle — Versione e2ugh como histórico: e2ugh v1.2.20 absorvida; saddle absorveu e2ugh primeiro; DevThink absorve gateway+extension+maene depois. «regras-totais Evolution note»
APP-0384. saddle — Garanta que storage de terceiros vira infra: HF/Kaggle/Terabox/npm/CDNs como buckets gratuitos; npm package = storage de binários; site+Prisma como compute runner. «saddle-dns-extension-misc DECISÕES 7»
APP-0385. saddle — Gerencie identidade multi-registry: @wenathlan/saddle npm público, @iakadion/saddle GitHub Packages (workspace rewrite), io.wenathlan:saddle Maven, Saddle NuGet, saddle RubyGems — registries sem escopo mantêm nome unscoped com metadata apontando ao owner. «saddle-dns-extension-misc DECISÕES 8»
APP-0386. saddle — Faça a extensão do saddle (CRX) parte da artifact matrix por release (Tauri 2 desktop, extensão CRX, 1.8.18→1.8.19). «saddle-dns-extension-misc FEATURES release train»
APP-0387. saddle — Rode o captura-platform do saddle com Brave real do dono. «saddle-dns-extension-misc CATALOGO outros.saddle raiz»
APP-0388. saddle — Aplique honestidade como feature: receipts auditáveis, latência nunca rotulada RAM/VRAM, claims com data de observação, denial default explícito no 1.8.18. «saddle-dns-extension-misc DECISÕES 3»
APP-0389. saddle — Declare honest limits da extensão (sem hardware de vault) publicamente. «saddle-dns-extension-misc DECISÕES 3»
APP-0390. saddle — Publique research em formato padrão (webscrape: PESQUISA-CONCORRENCIA/AUDITORIA/O-QUE-FALTA) para cada área. «saddle-dns-extension-misc ansi-art (formato padrão webscrape)»
APP-0391. saddle — Use importmaps com pin de versão em qualquer demo web do saddle. «raiz-saddle 07saddle:3446-3501»
APP-0392. saddle — Coloque CAPTCHA test page e hcaptchatest como fixtures de teste. «saddle-dns-extension-misc CATALOGO outros.saddle raiz»
APP-0393. saddle — Rode dispatch farm com resposta `204 Accepted` como sinal de parada. «raiz-saddle 07saddle:3160,6753»
APP-0394. saddle — Trate GitHub Actions como adapter chamável: jobs com workflows GitLab CI 400min free documentados em sources/. «saddle-dns-extension-misc CATALOGO yml/CI»
APP-0395. saddle — Use rclone para Terabox e 70+ backends na bridge. «saddle-dns-extension-misc CATALOGO sources rclone terabox»
APP-0396. saddle — Registre AVM como design alvo (não fake): virtualização com nomes legítimos, zero fake nos nomes de virtualização. «raiz-saddle DICIONÁRIO; devthink-lookup D11»
APP-0397. saddle — Implemente capability reports por backend: capacidade/latência/durabilidade/disponibilidade reportadas, nunca presumidas. «raiz-saddle 07saddle:7359-7373»
APP-0398. saddle — Limite working set com bounded working set (1.8.13–15) como release block oficial. «raiz-saddle 07saddle:3730-3765»
APP-0399. saddle — Avalie 130 candidatos a dependência no estudo 1.8.16 antes de adicionar novas. «raiz-saddle 07saddle:3765»
APP-0400. saddle — Use multi-target (1.8.10–11) para gerar os 38 artefatos da matrix. «raiz-saddle 07saddle:3730-3765»
APP-0401. saddle — Assine artefatos quando possível e declare estado de assinatura honestamente (1.8.12). «raiz-saddle 07saddle:3730-3765»
APP-0402. saddle — Audite runtime (Node 26.7.0 no audit 1.8.4) e registre no CHANGELOG. «raiz-saddle 07saddle:3730-3765»
APP-0403. saddle — Mantenha TypeScript como linguagem única do saddle (TS 1.8.9 release). «raiz-saddle 07saddle:3730-3765»
APP-0404. saddle — Migre identidade wenathlan em 1.8.2 e preserve lineage em CHANGELOG verbatim. «raiz-saddle 07saddle:3730-3765; regras-totais CHANGELOG»
APP-0405. saddle — Escreva talks1–9 como transcrições de decisão user/assistant com thinking (storage=RAM, buckets, OpenCode). «saddle-dns-extension-misc CATALOGO talks»
APP-0406. saddle — Numere turnos talks10 (001–1400+) por ação de agente; maioria <1KB. «saddle-dns-extension-misc CATALOGO talks10»
APP-0407. saddle — Rode Pesquisa-Profunda antes de features novas (comparativo concorrência, gap matrix). «saddle-dns-extension-misc CATALOGO outros.saddle raiz»
APP-0408. saddle — Rastreie o o-que-falta do saddle em doc próprio (o-que-falta). «saddle-dns-extension-misc CATALOGO outros.saddle raiz»
APP-0409. saddle — Publique plano universal e plan universal doc como base de governança. «saddle-dns-extension-misc CATALOGO outros.saddle raiz»
APP-0410. saddle — Documente o flow do engine e o api reference na raiz docs/. «saddle-dns-extension-misc CATALOGO outros.saddle raiz»
APP-0411. saddle — Trate robotarchitecture como doc de arquitetura do crawler (RFC 9309 robots-parser). «saddle-dns-extension-misc CATALOGO outros.saddle»
APP-0412. saddle — Integre scdnintegration como doc de integração CDN. «saddle-dns-extension-misc CATALOGO outros.saddle»
APP-0413. saddle — Especifique sql frameworks/thirdparty e uploads HF/Kaggle/npm/rclone na raiz docs/. «saddle-dns-extension-misc CATALOGO outros.saddle»
APP-0414. saddle — Mantenha reports human-operator/brain2qwerty/hd-infinito como documentos de pesquisa sci-fi. «saddle-dns-extension-misc CATALOGO outros.saddle»
APP-0415. saddle — Escreva cdn list, todos, todos os planos de deploy strategy e npm publish na raiz docs/. «saddle-dns-extension-misc CATALOGO outros.saddle»
APP-0416. saddle — Guarde js/ (18) + ts/ (62): fonte da lib scraper+agent-browser (index, agent, browser, scrape, extract, serialize, formats, renderer pygame, cli, batch, cache, crawler, pool, proxy, rate-limiter, retry, robots, sitemap, llms-txt, tokens, session, server, middleware, dev-server, fetch, headers, events, errors, port, types + .d.ts + tests). «saddle-dns-extension-misc CATALOGO js/ts»
APP-0417. saddle — Fixe json/ (7): package, package-lock, tsconfig, biome; mjs/index; html/index; rsf/package; yml/CI (node 20+22 matrix); sources/ (farm.py, saddle route.ts init, rclone terabox, workflows GitLab CI 400min free, html saddle1–7); assets/ (architecture.svg, saddlemark.svg). «saddle-dns-extension-misc CATALOGO»
APP-0418. saddle — Rode o scraper do saddle com proxy pool e rate-limiter configuráveis pelo caller. «saddle-dns-extension-misc CATALOGO ts/»
APP-0419. saddle — Ofereça batch e crawler como operações de primeira classe. «saddle-dns-extension-misc CATALOGO ts/»
APP-0420. saddle — Extraia sitemap e respeite robots em todo crawl. «saddle-dns-extension-misc CATALOGO ts/»
APP-0421. saddle — Gere tokens/estimativas para fitsInContext antes de formatar para agente. «raiz-saddle 07saddle:1481-1510»
APP-0422. saddle — Serialize em md/xml para LLM e redis/text para pipelines. «raiz-saddle 07saddle:1481-1510»
APP-0423. saddle — Registre events e headers em todos os fetches. «saddle-dns-extension-misc CATALOGO ts/»
APP-0424. saddle — Rode dev-server do saddle em porta sorteada e travada pelo caller. «regra universal 2»
APP-0425. saddle — Documente port como módulo (PortManager) com cache `_port` e resetPort para testes. «cli SPECS port-memory-spec»
APP-0426. saddle — Padronize saddle publish: idempotente com existence-check pre-deploy. «regras-totais Registries»
APP-0427. saddle — Use tags por perfil `:X.Y.Z`/`-balanced`/`-lite` nas imagens; nunca `:latest`. «regras-totais Profile tags»
APP-0428. saddle — Fixe registry cache mode=max e QEMU sempre nos builds de container. «regras-totais Registry cache»
APP-0429. saddle — Coloque a versão no OCI label e tags do container. «regras-totais Version inside»
APP-0430. saddle — Faça build stages pinados em imagens com toolchain nativa. «regras-totais Native builder»
APP-0431. saddle — Proíba hashes SHA hardcodeados; ações por TAG, nunca SHA-40/digest; SHA256SUMS gerado no runner. «regras-totais Hashes»
APP-0432. saddle — Proíba artefatos na raiz (apk, dist, node_modules, zips, __pycache__). «regras-totais Forbidden at root»
APP-0433. saddle — Assuma que builds/testes acontecem nos computadores do GitHub; o agente nunca gera binários. «regras-totais GitHub builds»
APP-0434. saddle — Rode testes reais em tests/ com node:test + node:assert, sem mock, tortura E2E massiva. «regras-totais Tests»
APP-0435. saddle — Teste o consumidor real: pack → install → uso ESM/CJS/CLI/HTTP no CI. «regras-totais Consumer test»
APP-0436. saddle — Deixe gates locais como sanidade (tsc, biome, actionlint, lockstep). «regras-totais Local sanity»
APP-0437. saddle — Proteja main com checks reais + 1 review + code-owner + dismiss stale + linear history, sem force-push/delete. «regras-totais Branch protection»
APP-0438. saddle — Arquive todos os PRs e branches com comentário + tag archive, deixando só main. «regras-totais Archive PRs»
APP-0439. saddle — Clone ao lado do upload, nunca em /tmp; push+fetch no início de sessão; worklog compartilhado. «regras-totais Clone paths»
APP-0440. saddle — Rode 1 workflow por responsabilidade, auto-contidos, com inlined composite actions. «regras-totais Workflows»
APP-0441. saddle — Publique via workflow_run com guards de tag `v*`; npm ci; pins verificados por API; nops REAIS. «regras-totais Workflows»
APP-0442. saddle — Mantenha uma bateria por evento; release validation fora do push. «regras-totais Single battery»
APP-0443. saddle — Limpe /tmp no fim; mate zombies; sem conflitos de porta. «regras-totais Clean tmp»
APP-0444. saddle — Reporte estado real, pendências e plano de continuidade (honestidade). «regras-totais Honesty»
APP-0445. saddle — Analise TODAS as falhas uma a uma, da mais nova para a mais antiga. «regras-totais Failure order»
APP-0446. saddle — Verifique bytes reais (od/hexdump) antes de "corrigir" corrupção aparente. «regras-totais Byte verify»
APP-0447. saddle — Deduplique por hash idêntico antes de ler; manter a data mais recente. «regras-totais Dedupe first»
APP-0448. saddle — Leia TODOS os arquivos um a um, em segmentos de linha (X→Y), sem cortar fisicamente. «regras-totais Segment reading»
APP-0449. saddle — Atualize o worklog em toda Task. «regras-totais Worklog»
APP-0450. saddle — Use o marcadore "tree wins": SKILL.md > árvore atual > REGRAS.md > transcripts > logs. «regras-totais Precedence»
APP-0451. saddle — Não invente regra: toda regra vem dos arquivos-fonte. «regras-totais No invention»
APP-0452. saddle — Agrupe tarefas por contexto correlato, máx 10 por grupo; terminar um grupo antes do próximo. «stealthhead checklist; regras-totais Group size»
APP-0453. saddle — Comande 0–300 subagentes por tarefa, no máx. 2 em paralelo (na prática 1 serializado). «stealthhead REGRAS; regras-totais Subagent delegation»
APP-0454. saddle — Leia arquivos grandes por segmentos de linhas (sem tmp, sem dividir arquivo); escrita sempre via Write (heredoc trunca); re-Read antes de Edit após modificação externa. «stealthhead REGRAS»
APP-0455. saddle — Consulte a data atual antes de qualquer tarefa e pesquise melhor implementação/versões daquela data. «stealthhead Date first; regras-totais Date and research»
APP-0456. saddle — Nunca instale: usa o instalado ou importa de CDN (esm.sh). «ARVORE Execução 4»
APP-0457. saddle — Fique no diretório atual; binários só em test/bin/. «ARVORE Execução 5»
APP-0458. saddle — Verifique por etapa antes de avançar. «ARVORE Execução 6»
APP-0459. saddle — Escreva `#` por arquivo/pasta com o contexto no app; doc de arquitetura é só árvore: 1 arquivo por linha, sem parágrafos. «ARVORE Documentação 1-2»
APP-0460. saddle — Comente curto, direto, funcional; template padrão no topo do documento. «ARVORE Documentação 3-4»
APP-0461. saddle — Rode subagentes por waves com verificação em cada wave. «regras-totais Waves»
APP-0462. saddle — Trabalhe em paralelo durante autorização, builds pesados e workflows; nunca termine a mensagem durante login polling. «regras-totais Parallel during waits»
APP-0463. saddle — Siga sequência imposta: auth → commit+push → monitorar checks → corrigir erros → security → próximas versões. «regras-totais Imposed sequence»
APP-0464. saddle — Revise equivalência de cada arquivo final: 1 responsabilidade, equivalentes mesclados, nomes adaptados; classificar interface vs lógica lendo interiores. «regras-totais Equivalence review»
APP-0465. saddle — Integre lógica futura nos domínios corretos — nunca arquivos de "ideias soltas". «regras-totais Future in domains»
APP-0466. saddle — Use terminologia real de virtualização: zero fake terminology. «regras-totais Real terminology»
APP-0467. saddle — Corrija claims velhos com pesquisa viva multi-idioma/multi-ano/fóruns/papers/arquivos/code hosts. «regras-totais Research depth»
APP-0468. saddle — Só use claims de hardware/versão com specs reais e fontes validadas em CI. «regras-totais Live specs»
APP-0469. saddle — Prove com números de stress: scale, quota, latência em percentis, reboot restore, fuzz sem crash. «regras-totais Stress proof»
APP-0470. saddle — Não toque em repos de referência da família além do mandato específico. «regras-totais No scope creep»
APP-0471. saddle — Mescle sem perda: nenhum feature, arquivo, doc, workflow, teste ou asset perdido. «regras-totais Lossless merge»
APP-0472. saddle — Feche só quando: workflows verdes, painéis 0/0/0, release publicado, PRs/branches arquivados, só main, worklog fechado. «regras-totais Done state»
APP-0473. saddle — Fixe precedência de leitura: Neo Documents + Neo Skills primeiro (package.json e arquitetura já entregues). «devthink-lookup D15»
APP-0474. saddle — Baixe zips grandes via agent browser e exclua após extrair (disco limitado). «devthink-lookup R28»
APP-0475. saddle — Leia por segmentos "de linha X até linha Y" pelo terminal, sem cortar arquivo. «devthink-lookup R29»
APP-0476. saddle — Categorize features e regras para a plataforma servir humano + IA: embed/API/link pronto para integração em sites de terceiros; lógicas do DevThink nunca hardcoded — padrões e parametrizadas. «devthink-lookup R30»
APP-0477. saddle — Faça a plataforma usar a própria loja. «devthink-lookup R30»
APP-0478. saddle — Tema padrão com componentes flutuantes configuráveis para fixos; tema Sol é o primeiro; fases 7–8 criam temas extras (Luna) contendo SÓ pastas de página. «devthink-lookup R31»
APP-0479. saddle — Rode app por app: especialista faz o principal enquanto subagentes fazem os outros em paralelo. «devthink-lookup R32»
APP-0480. saddle — Formate com JSDoc hierárquico bloco a bloco, sincronizada interna e externamente, "últimos patterns de 2026". «devthink-lookup R32»
APP-0481. saddle — Distribua até 4000 features por app em versões (esquema 99 versões por casa decimal); mínima ~600 features ("é uma super plataforma"). «devthink-lookup R32; regras-totais Features per version»
APP-0482. saddle — Referencie os pontos JS da raiz em todos os index; padrão de script loader no vite.ts. «devthink-lookup R33»
APP-0483. saddle — Proteja o SoFlowX em 4 fases: JWT stub → CSP, CSRF, honeypot, rate limit real → remover pacotes mortos; agressividade anti-DevTools (memory leak, 404 spam, crash) e "sem adicionar arquivos novos, só adaptar existentes". «devthink-lookup R34»
APP-0484. saddle — Guarde o max 10 lógicas por grupo de checklist e máx 10 tarefas/grupo. «stealthhead checklist»
APP-0485. saddle — Respeite língua: conversa/relatórios PT-BR; código, JSDoc e jogo em inglês. «stealthhead Língua»
APP-0486. saddle — Dependência externa só se nativo não cobre; ausente → CDN ESM (esm.sh, jsDelivr, unpkg). «stealthhead Node natives first»
APP-0487. saddle — Rode downloads apenas de modelo com download liberado; relatório `_report.jsonl`; 45 s em 429, 1,5 s entre downloads. «stealthhead Download»
APP-0488. saddle — Exclua por hash criptográfico dedupe exceto zips/tar/compactados. «stealthhead Dedupe»
APP-0489. saddle — Priorize se o tempo apertar: Editor → DB/orquestrador → fases e bots → multiplayer → HUD. «stealthhead Prioridade»
APP-0490. saddle — Publique releases com CHANGELOG por versão, sem README de versão nem docs de release. «ARVORE Git/CI 7»
### debonair

APP-0491. debonair — Defina o debonair como app de áudio/DAW isolado com nome de marketing (`@devthink/debonair`): criação de áudio e música, offline, browser/Node. «debonair.md header; ARVORE:11»
APP-0492. debonair — Abriegue a engine katexis na raiz do debonair como biblioteca universal de áudio/música; demais apps importam dela. «ARVORE:11; regras-totais Engines»
APP-0493. debonair — Importe gateway, IA e workflow do devthink e versawase do cadria quando precisar de imagem. «ARVORE:11; regras-totais Appendix A»
APP-0494. debonair — Tenha 4 linhas de produto: (a) lib TS de geração musical (music theory engine + Tone.js), (b) analisador AudioEngine Pro (áudio → JSON matemático), (c) AudioMotor V8 Pro (arquitetura JSON unificada analisador+gerador), (d) DAW studio Vector-One/Algo Matrix. «debonair.md header»
APP-0495. debonair — Separe responsabilidades por módulo: rhythm = quando, harmony = quais acordes, melody = quais notas, instrument = como soa; toda função pura, zero efeitos colaterais, zero lógica de áudio no theory engine. «debonair.md REGRAS 1»
APP-0496. debonair — Viva toda a lógica do motor em `page.tsx` e todo o design em `ui.tsx` (v0.4 AudioEngine Pro) — proibido criar arquivos auxiliares (pcm-store.ts embutido). «debonair.md REGRAS 2»
APP-0497. debonair — Declare sample rate explícito obrigatório: AudioContext com `sampleRate: 44100` (sem isso usava 48000 e causava pitch-shift/áudio lento); PCM gerado sempre a 44100 com `expandFromSeed(sampleRate)` parametrizado; buffer de reprodução criado com `layer.sr`. «debonair.md REGRAS 3»
APP-0498. debonair — Aplique anti-NaN no DSP: todo parâmetro de generator (hue, chaos, density) precisa clamp Math.max/Math.min 0–1; NaN em arpOffsetOptions propaga pelo Delay Global e mata o áudio inteiro. «debonair.md REGRAS 4»
APP-0499. debonair — Proíba "Happy Trap": lógica `if (hueBase > 0.7 && style === "TRAP")` que forçava acordes maiores foi removida; teoria por gênero vem de GENRE_CONFIG, não de hacks. «debonair.md REGRAS 5»
APP-0500. debonair — Humanize obrigatoriamente para realismo: timing quantizado perfeito + velocity constante = som falso; aplicar micro-variações de timing, velocity humana, round-robin e imperfeição controlada. «debonair.md REGRAS 6»
APP-0501. debonair — Mire loudness targets: master normalizado a -14 LUFS integrado, true peak ≤ -1 dBTP, gain staging -18 dBFS por track; LRA por gênero (Trap 8–12 LU, Pop 6–9, EDM 4–7); correlação estéreo ≥ 0.5 (mono compat). «debonair.md REGRAS 7»
APP-0502. debonair — Valide antes de exportar (Quality Pipeline Stage 5): LUFS ±1 dB do alvo, sem clipping, LRA no range do gênero, balanço espectral vs referência, validade harmônica (key/scale) — se falha, ajusta e reprocessa. «debonair.md REGRAS 8»
APP-0503. debonair — Use sistema som-apenas (AudioMotor): assinaturas hexadecimais de imagem excluídas — o JSON carrega só payload acústico (hash de verificação). «debonair.md REGRAS 9»
APP-0504. debonair — Analise em fases de 30s: áudio dividido em `ceil(totalSecs/30)` fases, preview liberado já na 1ª fase; janela de BPM por segundo usa ±2s de contexto. «debonair.md REGRAS 10»
APP-0505. debonair — Reconstrua por semente ("Valor Total"): substituir arrays longos (PCM, MFCC, chroma) por sementes/hash inteiros compactos; `expandFromSeed` regenera 48.000 samples/segundo; fallback `pcmCompactSignalStream` (hex do Float32) garante fidelidade 100%. «debonair.md REGRAS 11»
APP-0506. debonair — Prefira rule-based assembly antes de IA: qualidade vem de seleção inteligente, não combinação aleatória; regras harmônicas com peso (bass_note_in_chord peso 1.0 hard constraint; melody_in_scale 0.9). «debonair.md REGRAS 12»
APP-0507. debonair — Trabalhe a sessão sem instalar nada global: binários em tools/bin/ (ffmpeg, ffprobe, gh.exe), pacotes locais em node_modules, scripts .cjs (package.json "type": "module"), tudo dentro da pasta do projeto. «debonair.md REGRAS 13»
APP-0508. debonair — Estruture música por seções: intro, verse/A, break, chorus/B, bridge, outro, silence; section ruler com seek no sequencer. «debonair.md FEATURES timeline»
APP-0509. debonair — Gere long-form por seções encadeadas com variações (`composeLong`); entry/exit de instrumentos e curva de energia por barra (arrangement templates). «debonair.md FEATURES timeline»
APP-0510. debonair — Construa sequencer/piano roll: canvas fullscreen, drum grid 4 lanes (kick/snare/hat/clap) coloridas, piano roll pitch 48–84, hover ghost cell + tooltip de pitch, drag para desenhar duração, right-click apaga, click preview nota/drum, scroll horizontal para músicas longas. «debonair.md FEATURES sequencer»
APP-0511. debonair — Encadeie mixer per-track: gain staging → corrective EQ → compressão → creative EQ → saturação → sends reverb/delay → pan; buses (drum bus c/ paralela, music bus c/ widening, bass bus). «debonair.md FEATURES mixer»
APP-0512. debonair — Declare sidechain declarativo (Kick→Bass/808, Snare→Pad); master chain = bus → soft-clip tanh → compressor → analyser; EQ de 9 bandas com preset DEFAULT_EQ (115Hz/250/450/630/1.25k/2.7k/5.3k/7.5k/12.87k). «debonair.md FEATURES mixer»
APP-0513. debonair — Sintetize os instruments do kit: supersaw lead detunado com vibrato LFO e filtro mapeado por velocity; 808 bass com pitch snap + drive; punch kick com sub tail (sine sweep 1.5×→0.5× em 150ms, decay 250ms); snare em camadas (noise burst + bandpass); hats 30ms filtrados; pads com cutoff LFO. «debonair.md FEATURES sintetizadores»
APP-0514. debonair — Rode worklet advanced-voice-processor: envelope follower com sidechain, soft-knee expander, anti-zipper (gain smoothing 0.005). «debonair.md FEATURES sintetizadores»
APP-0515. debonair — Fixe vozes simbólicas: VOICES = [lead, pluck, keys, bell, arp, flute, bass, pad] (schema vector-one/project@5.0). «debonair.md FEATURES vozes»
APP-0516. debonair — Cubra 15 gêneros na lib TS (trap, pop, edm, hiphop, rnb, house, techno, ambient, cinematic, jazz, rock, funk, reggaeton, drill, latin) e 11 estilos compilados no generator v2 (TRAP, POP, TECHNO, LOFI, HOUSE, DRILL, AMBIENT, HYPERPOP, HIPHOP, RUDE_TRAP, EDM). «debonair.md FEATURES gêneros»
APP-0517. debonair — Compile cada gênero com 13–15 layers `makeLayer(instrumentos, intensity, density, chaos)` e função `compile<Genre>(trackState) → AudioBuffer` via OfflineAudioContext 44100Hz estéreo. «debonair.md FEATURES gêneros»
APP-0518. debonair — Mantenha camadas 10–15 por gênero com DNA: faixas de frequência por camada (Trap: sub 30–100Hz dominante; EDM: kick 40–80Hz sidechain pesado; Pop: mid 500–3kHz), pan por camada (hats ±20%, pads wide), specs de reverb e clipping por gênero. «debonair.md FEATURES camadas»
APP-0519. debonair — Organize taxonomia completa de efeitos: dynamics (compressor RMS/peak, multiband, sidechain), EQ, saturação, reverb (plate/room/hall), delay, modulação (phaser/chorus/flanger), transient shaper, stereo imaging M/S, limiter true-peak lookahead; receitas por gênero (MIXING-MASTERING-POR-GENERO) e type beats. «debonair.md FEATURES efeitos»
APP-0520. debonair — Trate vocal em 3 canais: vocal principal + background + sub-background; subcamadas core (glottis), octave up/down, harmonia L/R (terça/quinta, pan -0.6 a -1.0), formants F1/F2, vibrato rate/depth, pitch correction textual. «debonair.md FEATURES vocal»
APP-0521. debonair — Exporte WAV 24-bit/48kHz, MP3 (lamejs), MIDI (@tonejs/midi), JSON do projeto completo, stems e metadata (BPM, key, genre, LUFS, layers). «debonair.md FEATURES export»
APP-0522. debonair — Construa o Studio Vector-One com painéis: Gerar (prompt em pt-BR com presets "trap sombrio 92 bpm em C# com 808 deslizante"), Importar (áudio → JSON + embeddings 32-dim + template), Modelo (treino local: bigrama de notas, histograma de drums por lane, centróide de embedding), Projetos (biblioteca com similaridade por embedding); variation engine (`vary`) com slider t. «debonair.md FEATURES studio»
APP-0523. debonair — Audite com engenharia reversa: INSTRUMENT_SIGNATURES 35 assinaturas; identifyInstrument por features Meyda (centroid, flatness, rolloff, zcr, pitch, harmonics, transient); processamento em fases de 30s com preview incremental. «debonair.md FEATURES auditoria»
APP-0524. debonair — Reconstrua instrumentos por síntese aditiva: 8 harmônicos + ADSR (A3%/D7%/S75%/R15%) + anti-alias one-pole + headroom -3dB + crossfade 256 equal-power. «debonair.md FEATURES auditoria»
APP-0525. debonair — Defina AudioMotor V8 Pro como JSON unificado analisador↔gerador com **1 frame = 1 ms**; raiz: engine_meta (modo/limites temporais), musical_theory (bpm_value, bpm_correlation_hex, beat/bar_duration_ms, swing_ms, time_signature, root_note_midi, scale_intervals_hex, tuning A4 440/432, groove swing/humanize), memory_buffers (ponteiros pcm_ptr_hex), payload[n]. «debonair.md SPECS AudioMotor»
APP-0526. debonair — Complete o payload com **79+ blocos**: vocal, drum_layer (kick/snare/hihat/tom), bass_layer, synth_layer, lead_layer, fx_layer, foley_layer, spectral + spectral_high/low, pcm_management, stereo_field Mid/Side, dynamics, delay_routing, reverb_routing, modulation_matrix, compression, equalization, master_bus/chain, fm_matrix, distortion_multiband, inharmonics, pitch_correction, dynamic_filters, transients, noise_generation, overtones, mod_fx, arpeggiator, conditionals, voice_memory, macro_dynamics, phase_modulation, octave_matrix, chroma_octaves, note_matrix, note_harmonics, multiband_comp, bitrate_allocation, fx_buffers, vocal_routing (3 canais), channel_mid/side, pcm_transients/artifacts, am_stereo, lfe_channel, pitch_automation, synth_voices, layer_samples, spectral_noise, sub_frames (agrupamento 4s), engine_sync, envelopes ADSR, eof_validation (checksum). «debonair.md SPECS AudioMotor»
APP-0527. debonair — Defina o Motor V3 com interfaces por segundo: AudioMotorJSON{meta(sampleRate 44100, duration, channels, fileHash SHA-256, totalSamples, analyzedAt), timeline: SecondFrame[], summary{dominantKey, bpmEstimate (60–200), avgRms, avgSpectralCentroid, sub/mid/highActiveRatio, silenceRatio}}. «debonair.md SPECS Motor V3»
APP-0528. debonair — Defina SecondFrame{frequencies{dominant Hz, dominantNote, dominantMidi, chroma[12], centroid, flatness, rolloff, bands}, layers{sub, mid, high: LayerFrame}, dynamics{rms, peak, crest, loudness}, pitch{freq, note, midi, confidence}, rhythm{onset, beatPosition 1–4, kickHit, snareHit, hihatDensity}, stereo{width, phaseCorr -1..1}}. «debonair.md SPECS Motor V3»
APP-0529. debonair — Defina LayerFrame{rms, peak, centroid, dominantFreq, flatness, envelope[50], chroma[12], isActive (RMS>0.005)}; bandas: sub 20–150Hz, mid 150–4000Hz, high 4000–22050Hz. «debonair.md SPECS Motor V3»
APP-0530. debonair — Rode o pipeline analyzePerSecond: janelas de 1s; pitch por autocorrelação; Meyda 8192 samples (RMS, ZCR, energy, spectralCentroid/Flatness/Spread, amplitudeSpectrum, MFCC 13); decomposição low(<250Hz)/mid(250–4k)/high(>4k); vocal heuristic `midEnergy > 1.5×lowEnergy && flatness < 0.2`; onset por delta RMS. «debonair.md SPECS pipeline»
APP-0531. debonair — Implemente os Format Extractors #58–#104: 47 proxies matemáticos em raw Float32 (SNR, phase correlation, syncopation, F0 tracking, microtonal deviation, entropy, LZ complexity, Hurst, clipping %, ISP, melodic contour, polyfonia, timbre transitions...) + catálogo de 35+ formatos de saída (PCM float32, binário 16-bit, hex por sample, Base64 header, bitmask, ASCII waveform...). «debonair.md SPECS pipeline»
APP-0532. debonair — Classifique por camada (classifyInstrument): Sub: RMS alto + centroid <80Hz → kick; 30–100Hz flatness baixa → 808; High: flatness >0.3 → hihat; centroid >6kHz → shaker; Mid: centroid 300–1500Hz → lead vocal; 500–3000Hz flatness moderada → snare/clap. «debonair.md SPECS classify»
APP-0533. debonair — Serialize compacto: compactMotorJSON (Float32→array, 4 casas decimais). «debonair.md SPECS classify»
APP-0534. debonair — Preserve a evolução do motor: V3 (interfaces + 35 formatos) → V4 (4 camadas, resolução ms) → V5 (matriz Trap, fraseado, variação BPM 1–200, multigenre c/ transições) → V6 (códigos semânticos como ponte LLM↔áudio) → V8 Pro (arquitetura ms-frame completa); meta 25.000+ samples e "JSON infinito"; 30–60 camadas sincronizadas. «debonair.md SPECS evolução»
APP-0535. debonair — Fixe o stack do app: Next.js 16 + TypeScript + Web Audio API + OfflineAudioContext + Zustand + LocalForage. «debonair.md SPECS evolução»
APP-0536. debonair — Defina o schema vector-one/timeline@5.0 (Zod): frames por segundo — s, rms, centroid, flux, chroma[12], embedding[32], events[note|transient {onset, velocity, confidence, hz}], tags. «debonair.md SPECS Vector-One»
APP-0537. debonair — Defina o schema vector-one/project@5.0: bpm 40–240, root 0–11, scale de biblioteca 48 entradas, bars 1–128, mood, prompt, drums {kick/snare/hat/clap: 16 steps 0/1}, notes[{step, pitch 0–127, vel, dur 0.25–16, voice}], embedding[32]. «debonair.md SPECS Vector-One»
APP-0538. debonair — Trate ModelState como treino local: noteBigram, drumHistogram 16, centroid[32]. «debonair.md SPECS Vector-One»
APP-0539. debonair — Padronize o schema de análise do pipeline Node: {file{path, duration, sampleRate, channels}, global{bpm, key, loudness, beats[]}, segments[{start, end, rms, spectralCentroid, pitch{frequency, note}, voice{present, confidence}, instruments[{name, confidence}], text}], events[]} + formatter JSON→TXT. «debonair.md SPECS schema análise»
APP-0540. debonair — Valide com referência real: Don Toliver ATM — 166.71 BPM, key C minor (0.813), integrated LUFS -13, crest 12.65 dB, ZCR 1267.5Hz, s_to_m 0.294, correlação 0.739, vocal_prob 71.4%, bass 69.3Hz, 979 onsets; outputs por stem. «debonair.md SPECS JSON real»
APP-0541. debonair — Fixe specs de áudio digital: SQNR = 1.76 + 6.02×b dB; 16-bit CD (96dB DR), 24-bit produção (144dB), 32-float mixing interno; Nyquist f_max = fs/2; AES recomenda 48kHz; AudioMotor opera 44100Hz/16-bit, TTS 24kHz/16-bit; EBU R128: -23 LUFS broadcast, -14 LUFS streaming. «debonair.md SPECS QUALIDADE-AUDIO»
APP-0542. debonair — Fixe o theory engine: 13 escalas (major [0,2,4,5,7,9,11], minor, dorian, phrygian, lydian, mixolydian, locrian, harmonicMinor, melodicMinor, pentatonicMajor/Minor, blues [0,3,5,6,7,10], chromatic); 12 acordes (maj, min, dim, aug, sus2, sus4, dom7, maj7, min7, dim7, min9, dom9); MIDI `(octave+1)*12 + semitone`; grooves por gênero com swingOffsets (hiphop 50ms em offbeats). «debonair.md SPECS theory»
APP-0543. debonair — Use DSP util: FFT radix-2 real, janela Hanning, PCM Float32 22050Hz mono; biquad Direct Form II Transposed (Q 0.7071 Butterworth). «debonair.md SPECS DSP»
APP-0544. debonair — Seja offline-first sem nuvem: "npm package que gera música de qualidade 100% offline", <50MB (orçamento real ~33–37MB: core 500KB, pattern DB 5MB, modelos ONNX 20MB, SoundFont 10MB, regras 1MB). «debonair.md DECISÕES 1»
APP-0545. debonair — Posicione como "Stripe da música": output estruturado editável (MIDI/JSON/patterns), não caixa-preta tipo Suno/Udio. «debonair.md DECISÕES 1»
APP-0546. debonair — Prefira assembly > geração bruta: nicho = único sistema (a) offline, (b) compacto para npm, (c) qualidade por montagem inteligente (pattern DB de 10.000+ patterns de MAESTRO 1.282 MIDIs, Lakh 176.591 MIDIs, Freesound CC) com matriz de compatibilidade pré-computada (cosine similarity + regras teoria + human rating, sparse >0.5). «debonair.md DECISÕES 2»
APP-0547. debonair — Use modelos pequenos opcionais: MelodyGenerator GPT-2 tiny ~10MB, DrumGenerator LSTM ~2MB, ChordClassifier ~5MB, Humanizer VAE ~3MB — todos ONNX INT8; fallback chain garante que qualidade nunca cai (modelo falha → patterns + theory). «debonair.md DECISÕES 3»
APP-0548. debonair — Minimize dependência: runtime = 1 pacote (`tone`, ~250KB minified); PLANO-DE-ACAO manda remover ~990 deps (28 AI SDKs, 15 validadores, React/Ink, scrapers etc.); vite.config de 445 → ~30 linhas. «debonair.md DECISÕES 4»
APP-0549. debonair — Ofereça duas APIs: Manual (buildKeySignature → buildChordProgression → generateLeadMelody/BassLine → rhythm → render) e AI (prompt → LLM → AIGenerationPlan → mesmo pipeline); híbrido editável. «debonair.md DECISÕES 5»
APP-0550. debonair — Trate JSON como formato canônico: áudio → JSON matemático replicável → dataset de treino; sementes numéricas substituem arrays; JSON bidirecional texto↔numérico; 17 iterações de design culminando no "JSON Mestre Final Absoluto" (82 parâmetros, camelCase estrito). «debonair.md DECISÕES 6»
APP-0551. debonair — Prefira Meyda + custom a modelos pesados no browser: YAMNet removido (não carrega offline); identificação de instrumentos por features espectrais reais, não rótulos fixos. «debonair.md DECISÕES 7»
APP-0552. debonair — Separe dev-time/runtime: extração de patterns, treino e compressão (CBOR+LZ4) na fase de desenvolvimento; runtime só consome DB compacto. «debonair.md DECISÕES 8»
APP-0553. debonair — Trate IA ≠ compositor de confiança: NaN por falta de validação de input, "Happy Trap", duração "3 minutos"→3s, thread blocking de samplers — validação defensiva e clamps obrigatórios; worklog documenta falhas da IA explicitamente ([⚠️ FALHA IA]). «debonair.md DECISÕES 9»
APP-0554. debonair — Pesquise antes de código: docs de concorrência (Suno, Udio, Stable Audio, MusicGen, RAVE, ElevenLabs, Soundraw, Boomy), FL Studio (Channel Rack, pattern-based sequencing), datasets (MAESTRO, Lakh, NSynth, Jamendo), stack comparativa por tarefa — decisão sempre justificada por tabela comparativa. «debonair.md DECISÕES 10»
APP-0555. debonair — Projete parâmetros em cascata: "O design dos parâmetros tem que ser em cascata. O que não pode ser em cascata é o valor do resultado desses parâmetros" — design em pista, resultado não. «anotepad-p2 Note 07 03:6-8»
APP-0556. debonair — Torne todos os 400 parâmetros obrigatórios (ajudam na sincronia), anti-redundantes; BPM monitorado a cada segundo por camada, não fixo. «anotepad-p2 Note 07 03:10»
APP-0557. debonair — Use as mesmas bibliotecas para analisar e reproduzir o áudio (recorte e geração com o mesmo engine). «anotepad-p2 Note 07 01:6»
APP-0558. debonair — Extraia features de análise: chroma, MFCC (Mel-Frequency Cepstral Coefficients), ZCR (Zero Crossing Rate), Spectral Centroid. «anotepad-p2 Note 06 30:6»
APP-0559. debonair — Conceba o motor como FL Studio Mobile: infinitas camadas agrupando instrumentos; camadas precisam vir equalizadas; JSON desenha música por frame/milissegundo em frequências hexadecimais + teoria musical (escala, frequência, compasso, percussão, intervalos, sincronia); modo analisador + modo gerador com a mesma estrutura; sem dados mock — simulação física real de áudio espectral. «anotepad-p1 Note 05 14:6-60»
APP-0560. debonair — Nomeie o agregador de elementos ("Johnson" = motor que agrupa e correlaciona elementos; buffers, graus, níveis, samples). «anotepad-p1 Note 05 14:6-60»
APP-0561. debonair — Corrija o problema central: falta de variação e transições sem sentido; qualidade de camadas e output; teoria musical + frequência como base. «anotepad-p1 Note 05 10:6-8»
APP-0562. debonair — Ofereça player personalizado bonito com todas as interfaces para o output gerado. «anotepad-p1 Note 05 21:6»
APP-0563. debonair — Leia inspiration.md antes de gerar (lógica de raiz por pasta). «anotepad-p1 Note 05 10:6-12»
APP-0564. debonair — Segue o liricista com princípio mestre: A SONORIDADE É INTOCÁVEL. A VIBE É TUDO. «anotepad-p1 Manual-csiffhhg:12»
APP-0565. debonair — Persona liricista: indivíduo específico; maturidade emocional; ironia sutil e vulnerabilidade controlada; atitude "cool"; cadência cultural na fala, não declarada. «anotepad-p1 Manual:18-26»
APP-0566. debonair — Tema liricista: originalidade absoluta; fusão inesperada; experiência em tempo real (não narrar passado); essência positiva madura. «anotepad-p1 Manual:28-34»
APP-0567. debonair — Aplique proibições absolutas (0% tolerância) nas letras: sem clichês de natureza (mar, sol, lua), urbano, tecnologia, espaço, comida; sem comparações óbvias (exceto tese central original); sem linguagem didática/moral da história. «anotepad-p1 Manual:36-52»
APP-0568. debonair — Fluidez liricista: progressão contínua, compulsiva; conexões por som/associação (não lógica linear); wordplay constante; início in media res; final sonoro que resolve tensão acústica. «anotepad-p1 Manual:54-62»
APP-0569. debonair — Cadência e propulsividade: versos curtos; refrão não precisa ser o do rascunho; embaralhamento/reordenação do fluxo da cadeia para ficar viciante. «anotepad-p1 Note 04 02:6-10»
APP-0570. debonair — Gere letras com variação 90-97% "do mesmo filo": copiar sonoridade/musicalidade mas NÃO a posição das palavras; incluir todas as palavras sem excluir nenhuma. «anotepad-p2 msuica:6-8; Note 07 11»
APP-0571. debonair — Use prompt tags musicais: [drop] [drill] [slap bass] [effects] [textures] [vox] [pads] [bass] [semitones], [Intro] [Background] [Hook] [Outro], mix kits [Pro Freestyle Mix kit 2026], [Pro Bounce 2026]. «anotepad-p1 Note 01 03:7»
APP-0572. debonair — Gere prompts de música só com palavras-chave sem BPM; texto dentro de parâmetros []; lowercase; palavras compostas permitidas. «anotepad-p2 Note 07 12:6-8»
APP-0573. debonair — Pesquise MIR a fundo: série 01–27 Node.js (audio-decode, fft-js, meyda, Web Audio no Node, Essentia.js RhythmExtractor2013, aubiojs, music-tempo, demucs, audio-separator, pitch-detection YIN/pYIN/NNLS/Krumhansl-Schmuckler, tfjs, onnxruntime, ffmpeg/sox/aubio, fingerprinting, Faust WASM, arXiv 2026, foundation models CLAP). «debonair.md CATALOGO série 01-27»
APP-0574. debonair — Organize a lib TS limpa: theory/rhythm/harmony/melody/instruments/musicEngine (+ tests), Tone.js, LayerGroups/SubLayers. «debonair.md CATALOGO ts/»
APP-0575. debonair — Guarde analyser, ffmpeg wrapper e dsp (FFT/Hanning) em mjs/. «debonair.md CATALOGO mjs/»
APP-0576. debonair — Mantenha outputs reais em json/: analise-master.txt (1.6MB), analise-atm [voice/background/full stereo], analise-tiramisu [*], analise-exemplos.txt, params-medios.txt, output-meta.txt. «debonair.md CATALOGO json/»
APP-0577. debonair — Preserve o doc-mestre AudioMotor V8 Pro: md/readme.txt (65k linhas) com 79 seções de taxonomia declarativa, regras texto→hexadecimal→valor, gênero→parâmetros, variação BPM 1–200, engenharia reversa V8/FL Studio/placa de som, wavelets, LLM comprehension. «debonair.md CATALOGO md/readme»
APP-0578. debonair — Versione o app: v1/v0.2–v0.5 (AudioEngine Pro, workbook 845KB), v1/v1 (iterações workbook + pcm-store), v2 (Algo Matrix Audio engines/generator/{trap,pop,edm,...}.txt + Vector-One Studio). «debonair.md CATALOGO versões»
APP-0579. debonair — Fixe o ARQUITETURA-OFFLINE-COMPLETA: 3 fases (dev/install/runtime), size budget, pattern DB, assembly engine, synthesis, quality guarantees, roadmap 20 semanas, matriz 15 gêneros. «debonair.md CATALOGO planos»
APP-0580. debonair — Siga o SISTEMA-QUALIDADE-COMPLETO: layers por gênero, quality pipeline 6 stages, sistema de referência, mixing/mastering automation, QA checks. «debonair.md CATALOGO planos»
APP-0581. debonair — Use o modelo "fábrica de carros" (MONTAGEM-INTELIGENTE): 14.000 peças pré-fabricadas, metadados de peças, regras de compatibilidade. «debonair.md CATALOGO planos»
APP-0582. debonair — Treine com a 7-layer training machine ("data mastigado"): decomposição de áudio em samples, schema de metadados (PIPELINE-TREINAMENTO, ORGANIZACAO-SAMPLES, MACHINE-TREINAMENTO-COMPLETA). «debonair.md CATALOGO planos»
APP-0583. debonair — Extraia de músicas reais o que importa (EXTRACAO-REFERENCIAS-REAIS, MIR): o que extrair de músicas reais para pattern DB. «debonair.md CATALOGO planos»
APP-0584. debonair — Documente separação de stems (STEM-SEPARATION) e síntese vocal (SINTESE-VOCAL-AI) e realismo (SINTESE-REALISTA). «debonair.md CATALOGO planos»
APP-0585. debonair — Trate camadas complexas como doc próprio (CAMADAS-COMPLEXAS) com specs por camada. «debonair.md CATALOGO planos»
APP-0586. debonair — Separe workflow manual vs AI (WORKFLOW-MANUAL-VS-AI) como guia de decisão. «debonair.md CATALOGO planos»
APP-0587. debonair — Catalogue infraestrutura de áudio/IA (INFRAESTRUTURA-AUDIO-AI) e librarias TS de áudio (LIBRARIAS-TS-AUDIO). «debonair.md CATALOGO planos»
APP-0588. debonair — Documente análise espectral (ANALISE-ESPECTRAL) com specs por banda. «debonair.md CATALOGO planos»
APP-0589. debonair — Analise apps offline concorrentes (APPS-OFFLINE-ANALISE) e como concorrentes organizam (COMO-CONCORRENCES-ORGANIZAM). «debonair.md CATALOGO planos»
APP-0590. debonair — Analise FL Studio (FL-STUDIO-ANALISE: Channel Rack, pattern-based sequencing) como referência de UX. «debonair.md CATALOGO planos»
APP-0591. debonair — Documente QUALIDADE-AUDIO-ESPECIFICACOES e PLANO-DE-ACAO como plano de corte de dependências. «debonair.md CATALOGO planos»
APP-0592. debonair — Rode auditoria de dados (AUDITORIA-DADOS) antes de treinar. «debonair.md CATALOGO planos»
APP-0593. debonair — Analise infraestrutura (ANALISE-INFRAESTRUTURA) antes de escalar. «debonair.md CATALOGO planos»
APP-0594. debonair — Use o `inspiration.txt` (compendium síntese JS) como base de técnicas de síntese. «debonair.md CATALOGO v2»
APP-0595. debonair — Rode o worklet de voz em lib/audio-engine.txt. «debonair.md CATALOGO v2»
APP-0596. debonair — Rode Algo Matrix com engines/generator/{trap,pop,edm,...}.txt + engines/aiManipulator.txt + worklog.txt de falhas da IA. «debonair.md CATALOGO v2»
APP-0597. debonair — Rode Vector-One com src/lib/audio/schema(1).txt, engine(1).txt, generator(1).txt, studio-store(1).txt, src/components/studio/*. «debonair.md CATALOGO v2»
APP-0598. debonair — Preserve sessões reais em talks/ (53 arquivos): análise Don Toliver ATM, separação HPSS+phase cancellation, geração estilo ATM, caça a pacotes/binários. «debonair.md CATALOGO talks»
APP-0599. debonair — Analise concorrência em docs próprios antes de features (PESQUISA-PROFUNDA-CONCORRENCIA, CONCORRENCES-AUDIO-AI-10, PESQUISA-ACADEMICA-AI-MUSICA). «debonair.md CATALOGO planos»
APP-0600. debonair — Colete métricas da pasta: 1.054 arquivos / 41MB; maiores md/readme.txt 2.4MB (65k linhas), v2/h.txt 6.6MB, v2/audioreport.txt 1.9MB. «debonair.md NÚMEROS-CHAVE»
APP-0601. debonair — Fixe números do AudioMotor: 1 frame = 1ms; 44100Hz/16-bit; 79+ blocos de payload; 35+ formatos de análise; 47 extractors #58–#104; V3→V8. «debonair.md NÚMEROS-CHAVE»
APP-0602. debonair — Fixe números do Vector-One: embedding 32-dim; grid 16 steps; 8 voices; BPM 40–240; durações 30/60/90/120/180s. «debonair.md NÚMEROS-CHAVE»
APP-0603. debonair — Fixe referência real: Don Toliver — ATM (192.7s, 48kHz, 320kbps → 166.71 BPM, C minor 0.813, LUFS -13). «debonair.md NÚMEROS-CHAVE»
APP-0604. debonair — Fixe orçamento do pacote: <50MB total (~33–37MB est.); runtime 1 dep (`tone`) ~250KB. «debonair.md NÚMEROS-CHAVE»
APP-0605. debonair — Fixe páginas do tema debonair: Onboarding, Login, Mixer, Timeline, PianoRoll, Library, Master, Settings. «ARVORE debonair:850-857»
APP-0606. debonair — Fixe lógicas raiz do debonair: effects, engine, export, harmony, index, instruments, katexis, master, melody, mixer, musicEngine, presets, rhythm, sampler, sequencer, synth, theory, utils. «ARVORE debonair:886-903»
APP-0607. debonair — Publique o site do debonair em subdomínio próprio (debonair.devthink.pro) com build nas máquinas do GitHub e artefatos no release. «ARVORE debonair:778»
APP-0608. debonair — Guarde envelopes do debonair: pom.xml, settings.xml, bun.lock, biome.json, tsconfig.json (mescla app+backup+build+server), package.json, CODEOWNERS. «ARVORE debonair:880-885»
APP-0609. debonair — Mantenha docs do debonair: ARCHITECTURE.md, CHANGELOG.md, CONTRIBUTING.md, LICENSE, README.md, SECURITY.md, code-of-conduct.md, third-party-notices.md. «ARVORE debonair:871-879»
APP-0610. debonair — Rode tests do debonair em tests/ com node:test + node:assert, sem mock. «ARVORE debonair:859; regras-totais Tests»
APP-0611. debonair — Gere o doc de arquitetura do debonair como árvore: 1 arquivo por linha, sem parágrafos. «ARVORE Documentação 2»
APP-0612. debonair — Comente curto, direto, funcional; template padrão no topo do documento. «ARVORE Documentação 3-4»
APP-0613. debonair — Rode subdomínio deploy estático sem Functions; stack Prisma/Drizzle/MySQL2 + Socket. «regras-totais Deploy»
APP-0614. debonair — Não crie lógica de gateway dentro do debonair — importe do devthink. «ARVORE:11»
APP-0615. debonair — Não crie lógica de imagem/3D dentro do debonair — importe versawase do cadria. «ARVORE:11»
APP-0616. debonair — Mantenha engine katexis como único arquivo de engine de áudio do ecossistema; nenhum outro app cria engine própria. «regras-totais Engine one home»
APP-0617. debonair — Use Katexis para music engine (musicEngine.ts) e theory.ts como teoria compartilhada. «ARVORE debonair:892-902»
APP-0618. debonair — Exponha presets.ts como presets por gênero (DNA por gênero). «ARVORE debonair:897; debonair.md camadas»
APP-0619. debonair — Rode sampler.ts para leitura de samples do pattern DB. «ARVORE debonair:899»
APP-0620. debonair — Rode sequencer.ts como sequenciador por steps (16 steps/lane). «ARVORE debonair:900; debonair.md sequencer»
APP-0621. debonair — Rode synth.ts para os sintetizadores do kit (supersaw, 808, kick, snare, hats, pads). «ARVORE debonair:901; debonair.md sintetizadores»
APP-0622. debonair — Rode master.ts como masterização com loudness targets. «ARVORE debonair:893; debonair.md REGRAS 7»
APP-0623. debonair — Rode export.ts para WAV/MP3/MIDI/JSON/stems/metadata. «ARVORE debonair:888; debonair.md export»
APP-0624. debonair — Rode effects.ts para taxonomia de efeitos por gênero. «ARVORE debonair:886; debonair.md efeitos»
APP-0625. debonair — Rode harmony.ts para acordes e progressões (12 acordes catalogados). «ARVORE debonair:889; debonair.md theory»
APP-0626. debonair — Rode melody.ts para geração melódica (13 escalas). «ARVORE debonair:894; debonair.md theory»
APP-0627. debonair — Rode rhythm.ts para ritmo/grooves com swingOffsets. «ARVORE debonair:898; debonair.md theory»
APP-0628. debonair — Rode instruments.ts para instrumentos e INSTRUMENT_SIGNATURES. «ARVORE debonair:891; debonair.md auditoria»
APP-0629. debonair — Versione em lockstep com @wenathlan/debonair e publique em todos os registros. «regras-totais Scoped name; ARVORE:11»
APP-0630. debonair — Rode bump loop até verde: fix, bump, push, monitor, repetir. «regras-totais Bump loop»
APP-0631. debonair — Trate tags como imutáveis; CHANGELOG por versão como release notes. «regras-totais Immutable tags»
APP-0632. debonair — Faça container único Dockerfile multi-stage; sem compose; tags por perfil. «regras-totais Containers»
APP-0633. debonair — Construa hashes somente no runner (SHA256SUMS como asset). «regras-totais Runner checksums»
APP-0634. debonair — Rode pre-push suite leve: typecheck zero + build + boot smoke + lint zero. «regras-totais Pre-push suite»
APP-0635. debonair — Limpe /tmp no fim; mate zombies. «regras-totais Clean tmp»
APP-0636. debonair — Proteja segredos: nunca commitar chaves/envs/credenciais; bloquear extensões secretas em ignore files. «regras-totais No secrets»
APP-0637. debonair — Esconda sourcemaps (off/hidden), nunca públicos. «regras-totais Hidden sourcemaps»
APP-0638. debonair — Sanitize input; file-type por magic bytes; size caps; schema-validate channels. «regras-totais Sanitize input»
APP-0639. debonair — Use node:crypto para random de segurança; nunca Math.random. «regras-totais Secure random»
APP-0640. debonair — Rode dark-first premium com gradients vívidos; sem roxo residual; 1 background global. «regras-totais Design System»
APP-0641. debonair — Encaixe texto na caixa; grid fixo; sem "poeira visual"; 44px de toque (56px botões). «regras-totais Design System»
APP-0642. debonair — Anima micro com GPU-only transform/opacity; respeita reduced motion e contraste. «regras-totais Motion»
APP-0643. debonair — Garanta WCAG AA; nunca cor como único sinal; focus visível. «regras-totais A11y contrast»
APP-0644. debonair — Gerencie perf: lazy-load libs pesadas; limite camadas de glass por viewport; backdrop-filter fallback; content-visibility offscreen. «regras-totais Perf budget»
APP-0645. debonair — Use um repositório central de ícones para todos os apps (incl. debonair). «regras-totais Icon central»
APP-0646. debonair — Rode onboarding frame a frame adaptado ao debonair; login pulável via OS. «ARVORE Tema 4»
APP-0647. debonair — Mantenha um design só: portrait = celular, landscape = TV/desktop. «ARVORE Tema 5»
APP-0648. debonair — Deixe wrappers ios/android só empacotarem; nunca segunda interface. «ARVORE Tema 6»
APP-0649. debonair — Não commitar public/assets/dist; compila na raiz do dono; só icons/favicon. «ARVORE Tema 7»
APP-0650. debonair — Rode CLI como a mesma interface TSX renderizada no terminal; binário Bun no build. «ARVORE Tema 9»
APP-0651. debonair — Persista DB local via Drizzle ORM + better-sqlite3 (Supabase gerenciado, sem .sql no repo). «ARVORE TEMPLATE»
APP-0652. debonair — Use Prisma dentro do tema, nunca pasta prisma/ na raiz. «regras-totais Prisma in theme»
APP-0653. debonair — Mantenha um manifesto por linguagem na raiz; versão em lockstep; um lock só. «ARVORE Estrutura 5»
APP-0654. debonair — Rode .github/ na raiz com workflows auto-contidos, um por responsabilidade; dependabot.yml nunca em workflows/. «ARVORE Estrutura 7»
APP-0655. debonair — Coloque scripts auxiliares em tests/ (não-JS em tests/scripts/). «ARVORE Estrutura 8»
APP-0656. debonair — Nunca apagar: duplicado guarda com sufixo (2)(3). «ARVORE Estrutura 9»
APP-0657. debonair — Foque em TypeScript: FFmpeg fora do app (delegar para tools/bin quando necessário) — "Nada de FFmpeg, nada de Python/Java. Foco total em TypeScript". «anotepad-p1 Note 01 05:6»
APP-0658. debonair — Compartilhe features do motor entre analisador e gerador: "modo analisador + modo gerador com a mesma estrutura". «anotepad-p1 Note 05 14; debonair.md linhas de produto»
APP-0659. debonair — Trate o DAW como app isolado de marketing: nome debonair, sem depender do ecossistema para rodar offline. «ARVORE:11; debonair.md DECISÕES 1»
APP-0660. debonair — Imports cruzados: debonair importa gateway/AI/workflow do devthink — nunca o devthink importa engine do debonair diretamente (usa biblioteca publicada). «regras-totais Interface direction»
APP-0661. debonair — Não duplique lógica de teoria musical em outro app: theory.ts/katexis.ts são a única fonte. «regras-totais Merge over split»
APP-0662. debonair — Escreva lógicas .ts na raiz; interface só no tema (Sol/). «ARVORE Lógicas 1»
APP-0663. debonair — Garanta interface puxa da raiz/biblioteca; raiz nunca puxa de interface; interface nunca puxa de outra. «ARVORE Lógicas 2»
APP-0664. debonair — Agrupe correlatas em blocos hierárquicos; 1 arquivo = 1 responsabilidade; até 300 por arquivo quando a correlação exigir. «ARVORE Lógicas 3»
APP-0665. debonair — Use TypeScript primeiro; nativo do runtime antes de pacote externo; app nasce biblioteca multi-modo (~30 modos). «ARVORE Lógicas 4»
APP-0666. debonair — Zero JS na interface: só TS/TSX/css/html, .ts explícito, sem enum/namespace. «ARVORE Lógicas 5»
APP-0667. debonair — Sem main: App.tsx self-mount com roteamento embutido (temas + 404). «ARVORE Lógicas 6»
APP-0668. debonair — Nada hardcodado: env/DB/porta; host/porta sorteados e travados, nunca localhost; tema vem do DB. «ARVORE Lógicas 7»
APP-0669. debonair — Nomeie em minúsculas sem _/-, inglês no código, JSDoc em inglês, sem emoji, com try/catch rastreável. «ARVORE Lógicas 8»
APP-0670. debonair — Migre só a lógica de entrada do tema para a raiz. «ARVORE Lógicas 9»
APP-0671. debonair — Escreva/teste/publique TypeScript ponta a ponta; JS só como emit no publish. «ARVORE Lógicas 10»
APP-0672. debonair — Trate root-first doutrina: sem src/, sem pasta dentro de pasta, flat. «ARVORE Estrutura 2»
APP-0673. debonair — Cada app (incl. debonair) tem docs/ e tests/ próprios; referencia, não copia. «ARVORE Estrutura 4»
APP-0674. debonair — Mantenha a pasta = página = app com tudo dela dentro; página config é app config. «ARVORE Estrutura 3»
APP-0675. debonair — Rode tema = pasta; sem pasta "default" (Sol/ no debonair). «ARVORE Tema 1»
APP-0676. debonair — Use N temas = N pastas completas (entrada + deploys + páginas). «ARVORE Tema 2»
APP-0677. debonair — Coloque `<Pagina>/` só design: .tsx/.styles.ts/.types.ts/.test.tsx. «ARVORE Tema 3»
APP-0678. debonair — Rode build/teste/hash só nas máquinas do CI. «ARVORE Build 1»
APP-0679. debonair — Publique release por bump gerando tag + publishes (source.zip, SHA256SUMS, APK/IPA). «ARVORE Build 2»
APP-0680. debonair — Deploye mesma árvore em todo deploy, estático sem Functions (Vercel, Netlify, Pages, Capacitor, ISO; rewrites + 404). «ARVORE Build 3»
APP-0681. debonair — Sem lock-in de plataforma; trocar livre (Prisma, Drizzle, MySQL2, Socket). «ARVORE Build 6»
APP-0682. debonair — Commit identidade iakadion; tags padronizadas e imutáveis; órfã deleta. «ARVORE Git 1»
APP-0683. debonair — Proteja branch principal, sem force; só main. «ARVORE Git 2»
APP-0684. debonair — Rode npm ci, nunca install; token por ambiente (NPM_TOKEN, GITHUB_TOKEN). «ARVORE Git 3»
APP-0685. debonair — Pré-push leve; autoridade nos runners (gates locais, bateria no GitHub). «ARVORE Git 4»
APP-0686. debonair — Rode testes reais em tests/, consumidor pack → install (node:test sem mock). «ARVORE Git 5»
APP-0687. debonair — Use painéis zerados como critério de pronto (0/0/0). «ARVORE Git 6»
APP-0688. debonair — Bump até tudo verde; CHANGELOG por versão. «ARVORE Git 7»
APP-0689. debonair — Verifique via biome + tsc --noEmit nos arquivos de fora. «ARVORE Git 8»
APP-0690. debonair — Padrão nos domínios (virtual); opt-in local/misto pela IA. «ARVORE Infra 1»
APP-0691. debonair — Rode DB unificado entre sites/apps, nunca commitado; mestre + shard por conta. «ARVORE Infra 2»
APP-0692. debonair — Rode sites replicáveis de backup (clones Vercel/Netlify). «ARVORE Infra 3»
APP-0693. debonair — Seja self-hosted, sem free-tier limitante; usuário escolhe tudo, nada rígido. «ARVORE Infra 4-5»
APP-0694. debonair — Publique a sandbox em 3 formas: runtime por pacotes, full por container, publicada nos registros. «ARVORE Infra 6»
APP-0695. debonair — Priorize checklist interna por contexto, máx 10 por grupo; delegar subagentes antes de executar. «ARVORE Execução 2»
APP-0696. debonair — Inline primeiro, arquivo por último; limpar temporários (node -e; runner some depois). «ARVORE Execução 3»
APP-0697. debonair — Use as 13 Leis do design-premium quando desenhar UI do debonair: L1 INLINE-SLOT, L2 BOX-HIGHLIGHT, L3 CORNER-BORDER (1 linguagem de borda/página), L4 CLUSTER-HERO, L5 MEGA-UM, L6 FOTO-REI, L7 COLOR-LOCK, L8 HIERARQUIA-CONE, L9 GHOST-WORLD, L10 STAMP-ORBIT, L11 BREAK-CARRY, L12 DEMO-LIVE, L13 CENTER-POP. «neoskills REGRAS-DESIGN 13 Leis»
APP-0698. debonair — Aplique arquitetura de cor 3+3: 3 cores globais + 3 tons por seção; 1 gradiente/página TOTAL; 1 cor-sinal/página. «neoskills Cor»
APP-0699. debonair — Tríade tipográfica: display 700–900 (Syne, Clash Display, Outfit ExtraBold, Plus Jakarta EB, Space Grotesk) + leitura 400–500 + detalhe 200–300 só em micro-labels; 2 famílias/página. «neoskills Tipografia»
APP-0700. debonair — Escada de raio: chips pill/squircle; card pequeno 12–16; médio 20–32; herói 36–64; painel/seção 96–320; raio interno ≤ externo. «neoskills Geometria»
APP-0701. debonair — Motion: micro 120–250ms; entradas 400–800ms (stagger 60–90ms); loops 8–30s; ease base cubic-bezier(.2,.8,.2,1); animar a FUNÇÃO, nunca o pano de fundo. «neoskills Motion»
APP-0702. debonair — Evite anti-vibe-code: boxception, pirâmide hero, grade igual 3–4 col, grid de 12 features, FAQ no rodapé, footer 4-col, stats fake, logo cloud inventado, emoji como ícone, orbes animate-ping, roxo→azul crutch, Inter/Roboto identidade, background-clip:text em toda headline, copy "unlock/elevate/revolutionize". «neoskills Anti-Vibe-Code»
APP-0703. debonair — Zero tells de IA P0: gradiente bg-clip + Inter + roxo + hero centrado + 3 cards + glass reflex + eyebrow caps = IA instantânea; zero tells = gate. «neoskills Anti-Vibe-Code tell»
APP-0704. debonair — Rode 8 estados por componente (hover/focus-visible/active/disabled/loading/error/empty/success); URL como estado; zero dead-ends. «neoskills operacionais»
APP-0705. debonair — Responsive gate: mobile-first 1 col, sem scroll horizontal, targets 44px, safe-areas env(), focus-visible ≥3:1, INP ≤200ms. «neoskills operacionais»
APP-0706. debonair — Perf de página: dimensões explícitas (zero CLS), font subsets, vídeo > GIF, animação compositor-friendly. «neoskills operacionais»
APP-0707. debonair — Use dials do taste-skill com baseline 8/6/4 (VARIANCE/MOTION/DENSITY) e preset por tipo de página. «neoskills Dials»
APP-0708. debonair — Prefira ícones Phosphor > hugeicons > radix > tabler (lucide desencorajado); 1 família de ícone/projeto; fonte self-host/next-font, nunca Google Fonts <link> em produção. «neoskills Dials regras duras»
APP-0709. debonair — Regra LILA: sem roxo-AI/glow automático; serif MUITO desencorajada como default; ênfase por itálico/bold da MESMA família. «neoskills Dials regras duras»
APP-0710. debonair — Use `min-h-[100dvh]` nunca `h-screen`; CSS Grid nunca calc-math; `leading-[1.1]` + reserva pb-1 em itálico com descender. «neoskills Dials regras duras»
APP-0711. debonair — Rode Style Sampling com 3 cartões lado-a-lado num único HTML (nunca tabs) e esperar o usuário escolher A/B/C. «neoskills operacionais»
APP-0712. debonair — Defina TEMA nomeado antes de tudo ("output sem tema é banido"). «neoskills operacionais Theme step 0»
APP-0713. debonair — Card law: máx 1 título ultra-curto + 1 frase-efeito OU 1 métrica + micro-label; 3 blocos de texto por card banido; badge-row ≤3. «neoskills operacionais Card law»
APP-0714. debonair — Nomeie componentes engineering-expressivos (mixer-console-telemetry, daw-timeline-hud); "comp-header-001" banido. «neoskills operacionais Naming»
APP-0715. debonair — Split do spine: NAV → HERO → PROVA → CLUSTER(1) → CTA-band → FOOTER-meta; 1 AR/página; seções consecutivas NUNCA repetem a fórmula. «neoskills Arquitetura de página»
APP-0716. debonair — Z-bands: 0 atmosfera; 10 conteúdo; 20 consoles/flutuantes; 50 barra fixa. «neoskills Arquitetura»
APP-0717. debonair — Respiro: padding de seção 96–160px; ritmo 24/32/48/64/96; separação por AR, não por caixas. «neoskills Arquitetura»
APP-0718. debonair — Assimetria intencional 60/40, 70/30; anti-pirâmide (badge→título→subtítulo→botões centralizado vetado). «neoskills Arquitetura»
APP-0719. debonair — Grão 3–4% em voids dark; halftone ≤2/página nunca sobre texto; vidro com blur ≥35% do ruído de baixo. «neoskills Efeitos»
APP-0720. debonair — Sombras SEMPRE em camadas suaves (0 8px 30px rgba(0,0,0,.06–.10) light; 0 20px 50px -15px dark); 1 sombra dura só como assinatura deliberada. «neoskills Efeitos»
APP-0721. debonair — White-on-photo exige fade preto (58–72% altura); ramp de texto 3 níveis. «neoskills Cor»
APP-0722. debonair — Use tokens semânticos em OKLCH (tinta/papel/campo/sinal/alerta/atenuado/linha/profundidade); estados via color-mix. «neoskills Cor»
APP-0723. debonair — Aplique FLUXO-7 na produção de páginas: BRIEF-parse → CANVAS → ESPINHA AR → HERO → ÓTICA C-Ω → VIDA → VALIDAR; depois AUTO-AUDIT → REFACTOR → POLISH → FARINHA MÁGICA. «neoskills FLUXO-7»
APP-0724. debonair — Rode demo-run de treinamento: sem brief → DEMO-RUN (brief auto-escolhido) prova o fluxo ponta-a-ponta em 3 boxes (trace 7 passos, página single-file, self-check de leis). «raiz-saddle design.txt:15776»
APP-0725. debonair — Passe CHECKLIST-PRE-ENTREGA 12/12: 1-cor-viva, 1-herói·1-break, 1-idioma-borda, stamp L8 ≤1, mock-vivo, ghost ≥regra (LEI-11 ≤10%), IRL-mount, center-pop EXACTLY-1 (LEI-13), veil-tone, inline-media, conexão 1 idioma, T-citada com crédito. «raiz-saddle design.txt:25720-25746»
APP-0726. debonair — Rode self-check BOX3: leis L1 (1 glifo slot), L2 (marker 1× herda acento), L3 (1 idioma-borda), L5 (violeta único; preto executa; verde só status), L7 (ghost 1× tint 7%), L9 (1 break/página); conflitos-evitados toggle×flat, search×prompt, cluster×cluster, 2ª-cor-viva. «raiz-saddle design.txt:16050-16066»
APP-0727. debonair — Registre deltas em ledger: REGISTRO-DELTA (v2.1→ S-265, AR-248, CH-250, T-244 + 2ª-prova) e registro v2.0 com ranges NV/legacy por categoria. «raiz-saddle design.txt:25742-25745,24457-24539»
APP-0728. debonair — Use BRIEFsemântica de comandos: BRIEF: (gera página), N (treina batch), MERGE, EXPORTAR CAPÍTULO X, TREINAR, VAR dark/app, AUDIT:. «raiz-saddle design.txt:16070»
APP-0729. debonair — Feche merges de imagens com pool-fechado: fim de lote e consolidação no ledger (v2.0 = merge N1..N31; v2.3 = +R01/R02). «raiz-saddle design.txt:24457,27813»
APP-0730. debonair — Para UI funcional vs criativo: UI funcional (dashboard/form/tool) → design system existente (estabilidade); criativo (landing/portfólio/capa) → julgamento visual original (impacto). «neoskills router»
APP-0731. debonair — Posicione por referência CONCRETA ("estúdio de gravação em Tóquio"), não adjetivos; declarar anti-default; compromisso visual: hero_subject + entrance + break_symmetry + focal_contrast. «neoskills operacionais Creative Context»
APP-0732. debonair — Anuncie em linguagem humana o que será feito (blocos+paleta+fonte+tempo) antes de construir — nunca só "aguarde". «neoskills operacionais Build Preview»
APP-0733. debonair — Com material-fonte, ler TUDO, extrair, arquitetar e confirmar outline+estilos num só round antes de construir. «neoskills operacionais Content Read»
APP-0734. debonair — Consolide docs canônicos em PT-BR com catálogos em EN (padrão design-premium). «neoskills Notas de captura»
APP-0735. debonair — Minere os 392 lotes design-premium (lote-00…09) como fonte de referências imagem-a-imagem quando desenhar o debonair. «neoskills Índice-mestre»
<!-- CONTINUA -->


