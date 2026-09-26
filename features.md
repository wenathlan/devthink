---
name: features
description: >-
  FEATURES.md — registro de features por app da Operação DevThink.
  Meta por app: >1.000 features (média 400, mín 600, máx 4.000), distribuídas
  em versões formato x.0.0 com no máximo 99 features por versão.
  Seed real + ondas de leitura neodocs (append contínuo). Nada inventado.
---

# FEATURES — Registro por App (Operação DevThink)

> **Formato de entrada**: `F-<APP>-<NNN>. <título> — <detalhe> (status:
> shipped|planned) [v<versão>] «fonte»`
> **Versionamento**: cada app distribui features em versões `1.0.0`,
> `2.0.0`, `3.0.0`… com no máximo 99 features por versão; média 400,
> mínimo 600, máximo 4.000 features por app.
> **Fontes**: `neodocs-txt/features.txt` (AetherForge/saddle, 88 shipped),
> `regras-APP.md` (raiz), conversas, ondas neodocs.

## ÍNDICE DE APPS

| App | Papel | Meta | Seed | Versões |
|-----|-------|------|------|---------|
| devthink | OS e superplataforma (absorve 7+ apps) | 4.000 | 82 | v1.0.0+ |
| saddle | VM/DevThink + sandbox engine (AetherForge) | 4.000 | 88 | v1.0.0+ |
| debonair | app da família (tema próprio) | 1.000 | 12 | v1.0.0+ |
| cadria | app da família (absorve iukka+create) | 1.000 | 6 | v1.0.0+ |
| stealhead | app da família (importa versawase) | 1.000 | 6 | v1.0.0+ |
| argan | DNS/gateway da família | 1.000 | 6 | v1.0.0+ |
| getry | plataforma @devthink/ai (gateway) | 1.000 | 35 | v1.0.0+ |

---

## saddle — AetherForge engine [v1.0.0]

Seed integral de `neodocs-txt/features.txt` (TypeScript → markdown). 88
features **shipped** com knobs reais. Grupos: threads, cpu, memory, gpu,
hypervisor, storage, net, lifecycle, security, container.

### v1.0.0 — Hypervisor core (88 shipped)

F-SDL-001. MTTG M:N scheduler — Userspace work-stealing grid que apresenta até 1e6 threads lógicas em host finito; mesma ideia de Go Gs, Java virtual threads, Erlang processes (shipped) [v1.0.0] «features.txt:1»
F-SDL-002. vCPU overcommit — QEMU -smp maxcpus + KVM overcommit; provedores de nuvem usam 4–8× rotineiramente; ratio exposto como knob de primeira classe (shipped) [v1.0.0] «features.txt:2»
F-SDL-003. Topology constructor — Mapa de CPU guest que faz Windows/Linux acreditarem ser Threadripper/EPYC mesmo em host de 16 cores (shipped) [v1.0.0] «features.txt:3»
F-SDL-004. Host-passthrough CPU — Expõe AVX-512, AMX, APX, TOPOEXT conforme o silício físico (shipped) [v1.0.0] «features.txt:4»
F-SDL-005. CPU feature flags — Máscara ISA por plano; guest preso a baseline portável ou destravado (shipped) [v1.0.0] «features.txt:5»
F-SDL-006. Hotplug maxcpus — Começa pequeno, virsh setvcpus depois; QEMU ACPI CPU hotplug (shipped) [v1.0.0] «features.txt:6»
F-SDL-007. Memory balloon — virtio-balloon com free-page-reporting; guest devolve RAM sob pressão do host (shipped) [v1.0.0] «features.txt:7»
F-SDL-008. virtio-mem — Cresce/encolhe RAM do guest em chunks sem reboot; caminho real de memória ilimitada (shipped) [v1.0.0] «features.txt:8»
F-SDL-009. Hugepages / THP — Páginas 2MiB/1GiB via memory-backend-file em /dev/hugepages (shipped) [v1.0.0] «features.txt:9»
F-SDL-010. Host overcommit — Linux entrega mais memória anônima que DIMMs; combinar com zswap (shipped) [v1.0.0] «features.txt:10»
F-SDL-011. KSM merging — Páginas guest idênticas colapsam; alavanca de densidade multi-VM (shipped) [v1.0.0] «features.txt:11»
F-SDL-012. zswap + zram — RAM comprimida antes do swap em disco; amortece cliffs de overcommit (shipped) [v1.0.0] «features.txt:12»
F-SDL-013. VFIO GPU passthrough — GPU + função de áudio ligadas ao vfio-pci; CUDA/Vulkan quase nativo (shipped) [v1.0.0] «features.txt:13»
F-SDL-014. Looking Glass — Cópia de frame IVSHMEM do guest para o compositor host; sem HDMI dummy (shipped) [v1.0.0] «features.txt:14»
F-SDL-015. NVIDIA MIG slices — Partições GPU isoladas por hardware em Hopper/Blackwell; caps reais de VRAM por tenant (shipped) [v1.0.0] «features.txt:15»
F-SDL-016. NVIDIA vGPU / AMD MxGPU — Dispositivos mediados time-sliced ou SR-IOV; precisa SKU licenciado/firmware (shipped) [v1.0.0] «features.txt:16»
F-SDL-017. CUDA MPS — Compartilhamento multi-processo em software numa GPU sem licença vGPU (shipped) [v1.0.0] «features.txt:17»
F-SDL-018. Venus / VirGL — Vulkan/GL paravirtual; VRAM é janela de memória host — funciona com zero GPU discreta (shipped) [v1.0.0] «features.txt:18»
F-SDL-019. SR-IOV GPU — VFs de hardware em MI350 e Intel Arc; cada VF é dispositivo VFIO (shipped) [v1.0.0] «features.txt:19»
F-SDL-020. QEMU 11.1 machine — Pinned QEMU 11.1.0 (11 Ago 2026) + 10.0.12 stable (shipped) [v1.0.0] «features.txt:20»
F-SDL-021. io_uring disks — Fila de completion do kernel para virtio-blk; vence aio=native em 6.8+ (shipped) [v1.0.0] «features.txt:21»
F-SDL-022. virtiofs — Diretório host como mount guest; DAX opcional (shipped) [v1.0.0] «features.txt:22»
F-SDL-023. qcow2 compressed — Compressão zstd por cluster para imagens em notebooks (shipped) [v1.0.0] «features.txt:23»
F-SDL-024. Discard / unmap — fstrim do guest devolve espaço ao pool do host (shipped) [v1.0.0] «features.txt:24»
F-SDL-025. Multi-queue net — virtio-net com vhost e RSS; escala com vCPU (shipped) [v1.0.0] «features.txt:25»
F-SDL-026. SR-IOV NIC — Caminho de pacotes quase nativo; complementar ao GPU VFIO (shipped) [v1.0.0] «features.txt:26»
F-SDL-027. vsock — Sockets host↔guest sem IP; plano de controle do agente e do MTTG (shipped) [v1.0.0] «features.txt:27»
F-SDL-028. Snapshot / restore — Pause, dump, resume; stream de migração QEMU 11 (shipped) [v1.0.0] «features.txt:28»
F-SDL-029. Live migration — Postcopy + multifd; precisa storage compartilhado ou block migration (shipped) [v1.0.0] «features.txt:29»
F-SDL-030. SEV-SNP — Criptografia de memória AMD para guests EPYC; caminho de attestation documentado (shipped) [v1.0.0] «features.txt:30»
F-SDL-031. Intel TDX — Trust Domain Extensions em Xeon 6 (shipped) [v1.0.0] «features.txt:31»
F-SDL-032. TPM 2.0 — BitLocker / measured boot no guest (shipped) [v1.0.0] «features.txt:32»
F-SDL-033. virtio-iommu — IOMMU guest-side para assignment aninhado (shipped) [v1.0.0] «features.txt:33»
F-SDL-034. Nested virtualization — KVM no guest; Docker Desktop, WSL2, outro QEMU (shipped) [v1.0.0] «features.txt:34»
F-SDL-035. Firecracker backend — Jailer + microVM para boots de 125ms; sem GPU PCI (shipped) [v1.0.0] «features.txt:35»
F-SDL-036. Cloud Hypervisor — Alternativa rust-vmm; mais rápido que QEMU para guests cloud-like (shipped) [v1.0.0] «features.txt:36»
F-SDL-037. Kata Containers — VMs em forma de pod; Docker/K8s runtimeClass (shipped) [v1.0.0] «features.txt:37»
F-SDL-038. WASM isolate — Workload em componente Wasm com orçamento de CPU virtual quando VM é pesada demais (shipped) [v1.0.0] «features.txt:38»
F-SDL-039. Docker Engine 29 cgroup v2 — Mesmo plano compilado para docker run; cpu.max e memory.max (shipped) [v1.0.0] «features.txt:39»
F-SDL-040. Podman / nerdctl — Caminho rootless; mesma imagem OCI (shipped) [v1.0.0] «features.txt:40»
F-SDL-041..088. (demais 48 features do seed AetherForge em `neodocs-txt/features.txt` linhas 41–88 — storage avançado, net, lifecycle, security, container; importadas 1:1, sem resumo) «features.txt»

---

## devthink — OS e superplataforma

### v1.0.0 — Base do OS (seed de regras-APP.md, tudo shipped)

F-DTK-001..017. 35 páginas nativas no tema (Onboarding, Login, News, Audio, Video, Image, Notes, PhotoEditor, VideoEditor, Browser, Terminal, Files, Gallery, Connectors, Automations, Deploy, Security, Docs, Data, Music, Camera, Recorder, Mail, Calendar, Calculator, Maps, Store, Console, Gatewayview, Home, Notfound, Projects, Providers, Settings, Usage) — página=pasta-âncora com todos os componentes embutidos (shipped) [v1.0.0] «regras-APP.md APP-0007..0013»
F-DTK-018. Conversa nasce com sandbox — provisionamento automático de SpaceId, SandboxId (VM), SessionId, MessageId por conversa (shipped) [v1.0.0] «regras-APP.md APP-0016»
F-DTK-019. VM da conversa via StackBlitz WebContainer ou Docker microVM — virtualização 100% lógica (shipped) [v1.0.0] «regras-APP.md APP-0018»
F-DTK-020. Banco isolado por conversa (Drizzle ORM + Prisma Schema) + 15–40 DBs estáticos por usuário novo (shipped) [v1.0.0] «regras-APP.md APP-0019»
F-DTK-021. Chat embutido: terminal xterm com monitor de processos (shipped) [v1.0.0] «regras-APP.md APP-0021»
F-DTK-022. Chat embutido: browser headless com stream + inspector de rede (shipped) [v1.0.0] «regras-APP.md APP-0021»
F-DTK-023. Chat embutido: editor Monaco com diffs (shipped) [v1.0.0] «regras-APP.md APP-0021»
F-DTK-024. Approval modal com diff/comando e níveis de risco (allow once / allow always / deny) antes de toda ação sensível (shipped) [v1.0.0] «regras-APP.md APP-0022»
F-DTK-025. Kill-switch de emergência que mata processos da VM e cancela chamadas de API, com restore/export/resume de checkpoint (shipped) [v1.0.0] «regras-APP.md APP-0023»
F-DTK-026. 8 Telas Mestras (Runtime Dashboard, Workspace & Agent Environment, Reasoning Prompt & Multi-Model Dispatcher, Extensions & Connectors Hub, Automations & Scheduled Cron, Artifacts & Storage Library, Banco de Dados relacional, +) (shipped) [v1.0.0] «regras-APP.md APP-0025»
F-DTK-027. 45 telas / 3.420 componentes em 9 grupos (público/auth ~340, onboarding ~210, chat-agente ~820, projetos/computação ~410, conectores/MCP ~390, automações ~360, biblioteca/multimodal ~380, segurança/auditoria ~270, configurações ~240) (shipped) [v1.0.0] «regras-APP.md APP-0026»
F-DTK-028. Tour Magnético — onboarding guiado com spotlight que abre pop-ups (shipped) [v1.0.0] «regras-APP.md APP-0029»
F-DTK-029. Matriz de Equivalências — normalize conceitos entre concorrentes (shipped) [v1.0.0] «regras-APP.md APP-0030»
F-DTK-030. 7 master core hubs finais (landing, auth, onboarding, workspace, bots, explorer, settings) (shipped) [v1.0.0] «regras-APP.md APP-0034»
F-DTK-031. Creator Studio v2.0 "Industrial Pro" com abas estilo OS: Video Editor, Audio Workstation (Mixer, EffectsRack, Transport), 3D Studio (R3F, SceneGraph, MaterialEditor), Canvas (Artboard, Layers, Toolbar), Code IDE (Monaco+FileExplorer+PreviewPane), Site Builder (LivePreview, StylePanel, ComponentLib), Notes (BlockEditor+AIAssistant) (shipped) [v1.0.0] «regras-APP.md APP-0045..0046»
F-DTK-032. Cada editor com chat próprio de IA, nodes próprio (nodes.tsx+nodeslogic.ts), encoder.ts, calculator.ts, toolbar e export (shipped) [v1.0.0] «regras-APP.md APP-0047»
F-DTK-033. /tools com 60+ ferramentas (assetgen, audioconverter, formatconverter, imageresizer, imageupscaler IA, colorpalettegen, qrcodegen, textsummarizer…) (shipped) [v1.0.0] «regras-APP.md APP-0048»
F-DTK-034. Explore com 15+ categorias (vídeo, áudio, 3D, canvas, notes, site, tools, code, models IA, live, trending, shorts/reels, music, chat, ads) (shipped) [v1.0.0] «regras-APP.md APP-0049»
F-DTK-035. /lab como laboratório meta-aba; multi-select na barra de abas (Ctrl+Click); arrastar seleção cria laboratório (shipped) [v1.0.0] «regras-APP.md APP-0050»
F-DTK-036. Fusion Engine entre abas — Transferir/Mesclar/Integrar/Sincronizar via drag de aba sobre aba; clonagem seletiva; camadas híbridas; universal detach (shipped) [v1.0.0] «regras-APP.md APP-0051»
F-DTK-037. Persistência crash-proof — mouse parado 3s salva; JSON de estado em session_state; login em outro dispositivo reabre abas; heartbeat (shipped) [v1.0.0] «regras-APP.md APP-0052»
F-DTK-038. Preview É o vídeo final — play inicia export em background; chunks de 10s com bytes originais intactos e fatias paralelas (shipped) [v1.0.0] «regras-APP.md APP-0053»
F-DTK-039. Python/C++/C#/Java embutidos em TypeScript via manipulação de bytes (shipped) [v1.0.0] «regras-APP.md APP-0054»
F-DTK-040. Streaming social sem vídeo — stream de ações JSON via WebSocket; Motor de Replay reconstrói a tela; qualidade infinita com banda mínima; gravação de live gera MP4 (shipped) [v1.0.0] «regras-APP.md APP-0055»
F-DTK-041. Áudio social WebRTC estilo Discord Stage (shipped) [v1.0.0] «regras-APP.md APP-0056»
F-DTK-042. Storage híbrido com 50+ file hosts (alfafile, gofile.io, pixeldrain, katfile, turbobit, 1fichier, media.cm, krakenfiles, 0x0.st, filebin, temp.sh, workupload, megaup, wormhole.app…) (shipped) [v1.0.0] «regras-APP.md APP-0057»
F-DTK-043. Nuvem própria do usuário (GDrive/Mega/Dropbox) — envia pra nuvem dele, salva só o link, calcula economia em cashback; free obrigado a conectar nuvem (shipped) [v1.0.0] «regras-APP.md APP-0058»
F-DTK-044. Storage em 3 camadas (user id)/(categoria da aba)/(nome do projeto como arquivo); duplicados viram (1),(2); lixeira por project id; thumbnails GIF (shipped) [v1.0.0] «regras-APP.md APP-0059»
F-DTK-045. Logs de treinamento como propriedade da plataforma — nuvem privada, invisível, inapagável (shipped) [v1.0.0] «regras-APP.md APP-0060»
F-DTK-046. 17+ servidores (ads, signin, signup, storage, stripeservice, subscribe, subscribeswitch, useadmin, web, share, monitoring, allsubscriptionscount, filehost, session, retrospective, streaming, voice, windgets, sharding, orchestrator) (shipped) [v1.0.0] «regras-APP.md APP-0061»
F-DTK-047. /aiactions com ~60 skills (todolist, contextanalyzer, planbuilder, questionasker, thinking, verification, testing, compaction, tokencount, file CRUD, mouse/keyboard, websearch, geração de imagem/vídeo/áudio/3D/código/site/notas/anúncio/MIDI, modeldownload Kaggle/HuggingFace, modelupload/training, agenttraining) (shipped) [v1.0.0] «regras-APP.md APP-0064»
F-DTK-048. Protocolo todo-list como skill indispensável; ciclo ANALISAR→PLANEJAR→EXECUTAR→VERIFICAR→TESTAR→(ENTREGAR|REFAZER)→SALVAR FEEDBACK (shipped) [v1.0.0] «regras-APP.md APP-0065..0066»
F-DTK-049. 3 modos de execução — ao vivo (cursor fantasma), oculto (instantâneo), autônomo (admin only, segundo plano) (shipped) [v1.0.0] «regras-APP.md APP-0070»
F-DTK-050. IA como usuário cadastrado (@lookup, super root admin); IA retoma com "oi, paramos em X lugar, quer continuar?" (shipped) [v1.0.0] «regras-APP.md APP-0071»
F-DTK-051. Loop de autocorreção — planejador→executor→verificador; dois robôs; resolutor de erros segundo check (shipped) [v1.0.0] «regras-APP.md APP-0072»
F-DTK-052. Agent flow — mensagem→LLM+tools→validação→ExtensionManager→resultado→loop até sem tool request; planos de até 10 etapas (shipped) [v1.0.0] «regras-APP.md APP-0073..0074»
F-DTK-053..082. (demais features do bloco devthink em `regras-APP.md` linhas 7–251 — 30 logs similares antes de executar, examplesearch, DB Drizzle completo de automations, OCR das 6 referências Manus/Grok/Z.ai/Qwen/GoogleAI/ChatGPT, store Explore + Stripe, galeria com % de IA, perfis virtuais, chatbot YouTube-grade) «regras-APP.md»

### v2.0.0+ — Expansão (ondas neodocs)

⏳ Ondas 4–6 apendam features aqui (meta 4.000 no total; 99/versão).

---

## debonair / cadria / stealhead / argan / getry — seeds

- **debonair** [v1.0.0]: 12 features seed de `regras-APP.md` (seção debonair, linhas 499+) — temas, páginas e integrações próprias.
- **cadria** [v1.0.0]: absorve iukka+create; features de criação/canvas.
- **stealhead** [v1.0.0]: importa versawase; 3.194 textos em neodocs-txt/outros.stealthhead.
- **argan** [v1.0.0]: DNS/gateway da família (A @/* → 66.223.49.89; runners/keepers).
- **getry** [v1.0.0]: 35 rotas de gateway (7 endpoints × 5 versões), 22 chaves NVIDIA LRU, meta-modelo devthink, DB Prisma/SQLite, skill de deploy replicável.

⏳ Ondas neodocs apendam features por app a partir daqui.

---

## ONDA 4a — devthink profundo (99 features)

F-DTK-300..398: catálogo do manifesto `devthink v10.0.0` (3 shipped + 96
planned, todas [v10.0.0], teto 99/versão respeitado) — provenance de 19.691
pares pkg→repo, use-cases AI/LLM 809, Build-Tools 1302, UI-Components 1619,
Utilities 6109. Bloco completo: «onda4a-devthink.md § FEATURES F-DTK».


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

## ONDA 4b — saddle profundo (125 features)

F-SDL-100..224: deny-by-default, ladder gVisor/Firecracker, WASM mesh, VDR
64-bit, pool >33TB com 8 backends, CDN farm .bin.js, file-as-compute, SSE
por origem, cadeia de runners oracle→gha→hf→gitlab→kaggle, 38 assets de
packaging, OCI 3-arch, PlatformAdapter 12 forges. Bloco completo:
«onda4b-saddle.md § FEATURES F-SDL».


Formato: `F-SDL-NNN. título — detalhe (shipped|planned) [vX.0.0] «fonte:linhas»`. Continua de F-SDL-100 (seed F-SDL-001..088 não repetido).

### v1.7.0 — fundação

F-SDL-100. Public library core — `saddleurl`, `scrapeurl`, `scrapehtml`, `extractcontent`, `serializeresult`, `formatforagent`, `batchscrape`, `crawlurl` como exports públicos (shipped) [v1.7.0] «readme1.txt:340-354»
F-SDL-101. CLI `saddle <url> -f markdown|json|xml|redis|text --pretty --scroll --readable --agent --screenshot` (shipped) [v1.7.0] «readme1.txt:340-354»
F-SDL-102. Idempotência entre seis registros + `appregistry`, `commandguard`, `deliveryqueue` com dead letters; 76 testes (shipped) [v1.7.0] «readme1.txt:816-832; README.txt:496-530»
F-SDL-103. Bot unificado start/stop/executeCommand/handleWebhook/scheduleTask/getStatus sobre PlatformAdapter (shipped) [v1.7.0] «todo.txt:63-71; README.txt:456-469»
F-SDL-104. Serializadores JSON/NDJSON/SSE sem servidor obrigatório + streaming de blocos com backpressure configurável (shipped) [v1.7.0] «todo.txt:63-71»

### v1.8.0–1.8.5 — contratos e identidade

F-SDL-105. `runtimecontract` + `memorystorage` + probe root Node/Bun/Deno + `workerbridge`; 83 testes (shipped) [v1.8.0] «readme1.txt:816-832»
F-SDL-106. Identidade canônica `@wenathlan/saddle` no npm público; variante GH `@iakadion/saddle` via rewrite de namespace (shipped) [v1.8.1] «readme1.txt:816-832»
F-SDL-107. Release pós-transferência com identidade por registro (npm/GHCR/Maven/NuGet/RubyGems) + política de permissões MV3 + auditoria de grafo de exports + normalização de conteúdo limitada (shipped) [v1.8.2] «README.txt:496-530»
F-SDL-108. Pipelines Node 26.7.0 em todas as forges com gates determinísticos GitLab/Forgejo/Gitea/Woodpecker + Saddle Pages `saddle-pages` com VITE_BASE_PATH (shipped) [v1.8.4] «readme1.txt:816-832»
F-SDL-109. Engines metadata (node >=26.7.0, npm >=10.9.2, packageManager npm@12.0.2, sideEffects false) + Playwright peer opcional com resultado missing-dependency (shipped) [v1.8.5] «readme1.txt:816-832»
F-SDL-110. Memory engine com LRU bounded (`maxentries`/`maxbytes`), evict só do hot cache, rehidratação do primeiro backend responsivo, `stats()` de entries/bytes/hits/misses/evictions (shipped) [v1.8.5] «readme1.txt:98-111»

### snapshots, memória e triggers (changelog 1.2.0–1.6.0)

F-SDL-111. Vendor-neutral page snapshots com stable refs, stale-snapshot errors, diffs e registry de tabs/frames (shipped) [v1.2.0] «README.txt:61-64»
F-SDL-112. Bounded action batches + `actionrecorder` com provenance de snapshot boundaries (shipped) [v1.2.0] «README.txt:61-64; readme1.txt:340-354»
F-SDL-113. Memory-engine backends: github, gitlab, forgejo, gitea, huggingface, kaggle, modelscope, filehosting com StorageBackendFactory (shipped) [v1.3.0] «README.txt:61-64; readme1.txt:386-397»
F-SDL-114. Provider health reports (`runnerhealth`, `runnerhealthall`) + cooperative heartbeats + forge-neutral triggers manual/webhook/schedule/retry/heartbeat (shipped) [v1.4.0] «README.txt:61-64»
F-SDL-115. Semantic extraction (`extractsemantic`) — headings/landmarks/controls/links (shipped) [v1.5.0] «README.txt:61-64»
F-SDL-116. Envelope API — `requestcontext`/`successpayload`/`errorpayload` versionados (shipped) [v1.6.0] «README.txt:61-64»
F-SDL-117. Extension export com MV3 service worker + content bridge + popup + snapshot diffs; começa com permissão `storage`, sem broad host, read-only page-world (`pagefacts`) (shipped) [v1.1.0+] «readme1.txt:816-832; README.txt:156-190»
F-SDL-118. `assertfreshsnapshot`/`snapshotdiff`/`browsercontext` — rejeita ações stale, compara estado, rastreia tabs/frames/active context sem vendor client (shipped) [v1.2.0+] «readme1.txt:55-97»
F-SDL-119. `contentstorage`/`tieredcache` — dedupe de bytes imutáveis; hot values com cold storage e stale revalidation (shipped) [v1.4.0] «readme1.txt:55-97»
F-SDL-120. `syncobject`/`syncbackends` — compara manifests e copia/resolves updates entre adapters (shipped) [v1.4.0] «readme1.txt:55-97»
F-SDL-121. `workflowtriggers`/`triggermatch` — normaliza e casa starts manual/event/schedule/retry com request id determinístico (shipped) [v1.4.0] «readme1.txt:125-135»
F-SDL-122. `resumablerun`/`transitionrun` — recupera run state remoto via transições legais (shipped) [v1.4.0] «readme1.txt:55-97»
F-SDL-123. `validateworkflowinputs` — rejeita campos unknown, checa required, aplica defaults, converte tipos, aplica choices; trigger matcher retorna `invalid-inputs` (shipped) [v1.8.15] «readme1.txt:125-135»
F-SDL-124. `crawlfrontier`/`normalizeurl`/`persistentqueue` — fronteira durável e normalização de URLs (shipped) [v1.5.0] «readme1.txt:55-97»
F-SDL-125. `provenance`/`mergeprovenance` — liga chunks de contexto a fonte e evidência de retrieval (shipped) [v1.6.0] «readme1.txt:55-97»
F-SDL-126. `metricstore`/`operationsmetrics` — coletores bounded de counters e durações (shipped) [v1.7.0] «readme1.txt:28-38»
F-SDL-127. `retentionpolicy`/`backupplan`/`threatmodel` — retenção por dias/maxbytes, backup/restore declarativos, threat model com owner e lista de controles (shipped) [v1.8.15] «readme1.txt:28-38»
F-SDL-128. `controlsurface`/`controlservice` — request id, resource, operation, success state + audit callback opcional em toda resposta (shipped) [v1.7.0] «readme1.txt:16-27»
F-SDL-129. `nodeserver` — expõe handler Web Request/Response via Node HTTP (shipped) [v1.6.0] «readme1.txt:55-97»
F-SDL-130. `authorize` — verifica credenciais do caller via verifier injetado (shipped) [v1.6.0] «readme1.txt:55-97»
F-SDL-131. `assertresolvedpublicurl`/`assertredirectchain` — valida destinos resolvidos e redirects bounded (shipped) [v1.6.0] «readme1.txt:55-97»
F-SDL-132. `browsertools` — expõe snapshot/actions injetados como MCP tools opcionais (shipped) [v1.7.0] «readme1.txt:55-97»
F-SDL-133. `releaseevidence`/`evaluateevidence` — normaliza evidência caller-supplied e avalia contra política com reason codes bounded (shipped) [v1.8.16] «readme1.txt:55-97»
F-SDL-134. `evidencefromverification`/`releasereadiness` — mapeia checksum válido para evidência checked; receipt de readiness apenas descritivo (shipped) [v1.8.16] «readme1.txt:55-97»
F-SDL-135. RAG helpers — `chunkmarkdown`/`formatchunksforrag`, `generatellmstxt`/`generatellmsfulltxt`, `estimatetokens`/`fitsincontext` (shipped) [v1.5.0+] «README.txt:146-163»
F-SDL-136. Reliability helpers — `withretry`, subpath de error taxonomy, typed event emitter (shipped) [v1.5.0+] «README.txt:146-163»
F-SDL-137. Server/MCP — `createserver`, `mcpserver`/`mcptransport` (shipped parcial: contrato de tools, sem server empacotado) [v1.6.0] «README.txt:146-163; featureaudit.txt:1-63»
F-SDL-138. Storage adapters: local, chunked, S3-compatible, GitHub Contents, WebDAV, HF, Kaggle com put/get/head/delete/list + checksums (shipped) [v1.7.0] «readme1.txt:310-333; todo.txt:95-105»
F-SDL-139. Scheduler determinístico por prioridade estável com `canRun`/`descriptor` (shipped) [v1.7.0] «readme1.txt:310-333»
F-SDL-140. Queue de jobs com idempotência, retry e saga de compensação (shipped parcial — sem crash recovery) [v1.7.0] «todo.txt:56-62; featureaudit.txt:1-63»
F-SDL-141. Browser session replay abstrato sem acoplar o core a um browser (shipped parcial — sem captura real) [v1.7.0] «todo.txt:56-62; featureaudit.txt:1-63»
F-SDL-142. Scraping seguro com robots cache, extraction e content types; parser robots com crawl-delay RFC 9309 (shipped) [v1.7.0] «todo.txt:56-62, 63-71»
F-SDL-143. Cache com TTL e stale-while-revalidate (shipped) [v1.7.0] «todo.txt:56-62»
F-SDL-144. Packager para binary/container/manifest de distribuição (shipped) [v1.7.0] «todo.txt:56-62»
F-SDL-145. Adapters multiforge GitLab/Forgejo/Gitea/Codeberg/HuggingFace com wrappers (shipped) [v1.7.0] «todo.txt:56-62»
F-SDL-146. Modos library/cli/binary/browser/headless/computer como superfícies independentes (shipped) [v1.7.0] «todo.txt:45-53»
F-SDL-147. Modos de memória internal/external/physical/vectorized/library selecionáveis (shipped) [v1.7.0] «todo.txt:45-53»
F-SDL-148. Runtime universal sem exigir fs, process ou Buffer no núcleo (shipped) [v1.7.0] «todo.txt:72-84»
F-SDL-149. Rate limiting global, por usuário e por domínio (shipped) [v1.7.0] «todo.txt:72-84»
F-SDL-150. Crawling BFS com normalização de URL, sitemap e limite de domínio + queue persistente para crawl com fallback em memória (shipped parcial) [v1.7.0] «todo.txt:72-84; featureaudit.txt:1-63»
F-SDL-151. Fingerprint coerente por sessão sem patch stealth automático + pool de proxy com health score, rotate e revive (shipped) [v1.7.0] «todo.txt:85-94»
F-SDL-152. Contrato de captcha solver manual/externo com evidências e hash + pausa de revisão (shipped — detecção completa, bypass by design ausente) [v1.7.0] «todo.txt:85-94; featureaudit.txt:30-63»
F-SDL-153. Token estimate, chunk markdown e RAG manifest + geração de llms.txt e llms-full.txt (shipped) [v1.7.0] «todo.txt:85-94»
F-SDL-154. Webhooks HMAC e eventos de job (shipped) [v1.7.0] «todo.txt:85-94»
F-SDL-155. Manifests para browser extension, desktop, mobile e n8n; `n8nnode`/`n8nmatch`/`n8nexecute` rejeitam ações não declaradas (shipped) [v1.7.0] «todo.txt:85-94; readme1.txt:16-27»

### v1.8.8–1.8.15 — TypeScript, flat native, signing, pools

F-SDL-156. Migração root-based TypeScript com dist-only compilation e declarative target plans em 12 superfícies; 98 testes ativos (shipped) [v1.8.9] «README.txt:496-530»
F-SDL-157. Flat Capacitor/Tauri layout research aplicada ao desktop/mobile (shipped) [v1.8.11] «README.txt:496-530»
F-SDL-158. Resolução de licença GPL-3.0-only sobre trio contraditório + vocabulário SignPath + 38 assets + legal docs em um LICENSE (shipped) [v1.8.12] «README.txt:496-530»
F-SDL-159. Persistent-queue leases com visibility timeouts, renewals, idempotency keys (shipped) [v1.8.13] «README.txt:496-530»
F-SDL-160. Schema-neutral extraction com field provenance + allowlisted snapshot projection com byte budgets (shipped) [v1.8.13] «README.txt:496-530»
F-SDL-161. Cancellation reasons com compensation callbacks surfacing `compensation-failed` + deterministic retention keep/prune (shipped) [v1.8.13] «README.txt:496-530»
F-SDL-162. OCI labels, build-stage compile e post-push smoke validation no container (shipped) [v1.8.14] «README.txt:496-530»
F-SDL-163. Verified storage pools com quorum writes e read policies first-healthy/verified-first/priority-first (shipped) [v1.8.15] «README.txt:496-530; todo-1.8.15.txt:44-92»
F-SDL-164. Working-set admission com capability-gated bridge plans e materialization ledgers (shipped) [v1.8.15] «README.txt:496-530; todo-1.8.15.txt:93-131»
F-SDL-165. WASM transformation contracts com content-addressed transformation keys e binary-cache manifests (shipped) [v1.8.15] «README.txt:496-530; todo-1.8.15.txt:132-174»
F-SDL-166. Sensitive-cache eligibility (proíbe caching de outputs com segredos/dados pessoais/estado instável) (shipped) [v1.8.15] «todo-1.8.15.txt:132-174»
F-SDL-167. Declarative provider selection com immutable delivery manifests + PWA/CDN plans (shipped) [v1.8.15] «README.txt:496-530; todo-1.8.15.txt:210-240»
F-SDL-168. Mini App/DNS surface requirements — Telegram Mini App adapter sem token embutido + descriptor DNSSEC/HTTPS (shipped) [v1.8.15] «todo-1.8.15.txt:210-240»
F-SDL-169. Magic-byte classification sem confiar em extensão de filename (shipped) [v1.8.15] «todo-1.8.15.txt:132-174»
F-SDL-170. Archive extraction limits (entry count, depth, expansion ratio, traversal, executable-bit) (shipped) [v1.8.15] «todo-1.8.15.txt:132-174»
F-SDL-171. Chunk-delivery manifest com media type, digest, size, order e integrity; verificação de sequência (missing/duplicate/out-of-order/mismatch) (shipped) [v1.8.15] «todo-1.8.15.txt:210-240»
F-SDL-172. Deny-by-default isolated-execution request/decision/handoff contracts com typed projections + subpath isolation browser-safe + unified playground; 139 testes ativos (shipped) [v1.8.18] «README.txt:97-112; 496-530»
F-SDL-173. Virtual control plane (representa, valida, nega e handoffa requests sem executar localmente) + data-only remote-browser capability model (shipped) [v1.8.19] «README.txt:97-112; 531-560»
F-SDL-174. Container multi-arch linux/amd64+arm64+ppc64le com smoke por índice de registry, pull, comparação de labels e execução de CLI (shipped) [v1.8.17] «todo-1.8.16.txt:667-681»
F-SDL-175. README consolidation sobre 41 revisões históricas com matriz por seção (foundation/engine/productization/API/extension/security/package/development/CLI/repository/history/current-scope) (shipped) [v1.8.17] «todo-1.8.16.txt:682-735»

### 1.8.15 plans ainda não implementados (planejados)

F-SDL-176. Storage-pool immutable manifest com replica outcomes, digest, size, creation time e metadata do caller (planned) [v1.8.15] «todo-1.8.15.txt:44-92»
F-SDL-177. Health model de pool com bounded probes e injected clocks — sem background polling no core (planned) [v1.8.15] «todo-1.8.15.txt:44-92»
F-SDL-178. Execução real de host-plan privilegiado (fallocate/mkswap/swapon/tmpfs/zram/mount) por CLI/runner adapter — core só descreve (planned) [v1.8.15] «todo-1.8.15.txt:93-131»
F-SDL-179. WASM capability descriptor (compile/instantiate/streaming/threads/SIMD/WASI/host imports) + budgets CPU/wall-clock/memory/output/file-count/network portáteis (planned) [v1.8.15] «todo-1.8.15.txt:132-174»
F-SDL-180. Provider-chain dry-run dispatch plan renderizável como payloads GitHub/GitLab/Forgejo/Gitea/Codeberg/local CLI sem enviar request (planned) [v1.8.15] «todo-1.8.15.txt:175-209»
F-SDL-181. Execution lease record compatível com resumable workflow + persistent queue (planned) [v1.8.15] «todo-1.8.15.txt:175-209»
F-SDL-182. Runner attestation input (labels, OS, arquitetura, status efêmero, policy ids) ligado a dispatch plan (planned) [v1.8.16] «repo-research-1.8.16.txt:120-190»
F-SDL-183. Provider feature matrix (rangeRead, conditionalWrite, multipart, integrityClaim, objectImmutability, retention, mountRequired, credentialOwner) reportada por adapter (planned) [v1.8.16] «repo-research-1.8.16.txt:190-240»
F-SDL-184. Durability capability receipt (checkpointStore, leaseAuthority, deduplicationScope, retryAuthority, scheduleAuthority, cancellationConfirmation, retentionOwner) (planned) [v1.8.16] «repo-research-1.8.16.txt:220-270»
F-SDL-185. Terminal-state receipt (cancellation/compensation/cleanup confirmed/requested/unavailable/externally unknown), serializável, sem timers/reapers/workers (planned) [v1.8.16] «repo-research-1.8.16.txt:60-120»
F-SDL-186. Provider mutation precondition receipt (exige conditional-write support, digest evidence, declared size limits) (planned) [v1.8.16] «repo-research-1.8.16.txt:100-120»
F-SDL-187. Isolation capability receipt comparando operação pedida contra permissões caller-reported de resource/filesystem/network — estados eligible/denied/adapter-required (planned) [v1.8.16] «repo-research-1.8.16.txt:100-120»
F-SDL-188. Isolation attestation input (runtimeKind, hostAuthority, filesystemPolicy, networkPolicy, cpu/memory/process/timeout budgets, imageOrModuleDigest, evidenceStatus) (planned) [v1.8.16] «repo-research-1.8.16.txt:240-270»
F-SDL-189. Origin-bearing tool result envelope separando claims user/caller/adapter/remote-source sem confiar em label gerado por modelo (planned) [v1.8.16] «repo-research-1.8.16.txt:100-120»
F-SDL-190. Crawl policy receipt com origin normalizado, decisão robots + fonte, sitemap evidence, request budget, parser limits e fetchAdapterRequired (planned) [v1.8.16] «repo-research-1.8.16.txt:240-270»
F-SDL-191. Browser interaction receipt com snapshot identity, reference scope, session isolation claim, trace artifact digest e flag userContextProvided; expira refs quando snapshot muda (planned) [v1.8.16] «repo-research-1.8.16.txt:220-240»
F-SDL-192. Context provenance envelope (sourceDigest, sourceLocator, retrievalMethod, transformIdentity, transformDigest, chunkIdentity, citationRange, contextBudget, adapterRequired) (planned) [v1.8.16] «repo-research-1.8.16.txt:240-270»
F-SDL-193. Evidence policy result (subjectDigest, expectedIdentity, expectedWorkflow, evidenceKind, evidenceStatus, policyDecision, reasons, verificationTime) com 5 níveis absent/declared/downloaded/checked/verified (planned) [v1.8.16] «repo-research-1.8.16.txt:250-270»
F-SDL-194. Release readiness receipt completo (sourceTag, manifestVersions, requiredGates, artifactPlanDigest, publicationTargets, credentialOwner, signingStatus, verificationRequirements) (planned) [v1.8.16] «repo-research-1.8.16.txt:270-300»
F-SDL-195. Runner environment receipt (forgeKind, workflowDialect, runnerImage, os, architecture, toolchainEvidence, executionBoundary, ephemeralClaim, networkAuthority, credentialOwner) (planned) [v1.8.16] «repo-research-1.8.16.txt:300-330»
F-SDL-196. Crawl-checkpoint receipt com caller-owned resume evidence (corroborado por crawl4AI recovery state) (planned) [v1.8.16] «repo-research-1.8.16.txt:55-95»
F-SDL-197. MCP tool safety family (input schema, transport test, redaction policy, abuse test) (planned) [v1.8.16] «todo-1.8.16.txt:465-563»
F-SDL-198. Cross-runtime compatibility family (capability matrix, import graph audit, unsupported state) (planned) [v1.8.16] «todo-1.8.16.txt:465-563»
F-SDL-199. Observability/retention + operator authorization families (bounded metric schema, consent model, scope validator, audit event) (planned) [v1.8.16] «todo-1.8.16.txt:465-563»
F-SDL-200. Objective batches 1.8.16–1.8.20: S3 listing paginado com malformed-response handling; sitemap-index traversal cycle-safe com max URLs; action recording bounded exportável; workflow-input validation estrita com deterministic trigger matching; capability matrix cross-runtime library/browser/desktop/mobile/CLI/binary (planned) [v1.8.20] «README.txt:496-530»

### Engine + storage→RAM (runtime do produto)

F-SDL-201. Storage→RAM bridge com receitas kernel: swapfile 16G, tmpfs 8G, zram zstd 2–3×, zswap, OverlayFS, mmap, git-in-RAM, loop RAM disk (shipped no design/engine de runtime) [v1.0.0] «readme1.txt:398-421»
F-SDL-202. Sandbox REST API com create/execute/sleep/wake/convert-to-ram/memory-stats + WS /exec + cron cleanup (shipped no design) [v1.0.0] «readme1.txt:355-366»
F-SDL-203. Memory engine com transformToCompute/transformToStorage (~2× overhead) sobre 8 backends (shipped) [v1.3.0] «readme1.txt:386-397»
F-SDL-204. sdk-loader zero-install carregando pacotes de CDN em RAM com SQLite cache (shipped no design) [v1.0.0] «readme1.txt:398-421»
F-SDL-205. CDN package farm: chunks 200MB como pacotes npm encadeados servidos por jsDelivr/UNPKG/esm.sh (shipped no design) [v1.0.0] «readme1.txt:472-493; 505-520»
F-SDL-206. Farm `farm.py` de 100 worker repos com dispatch round-robin por workflow_dispatch (shipped no design) [v1.0.0] «readme1.txt:505-520; README.txt:76-90»
F-SDL-207. Multi-forge mirror push simultâneo (multiplicador ~4×) (shipped no design) [v1.3.0] «README.txt:76-90»
F-SDL-208. V3 UI com seletor de forge e display live de onde o processamento roda e quanto storage virou RAM (16GB swap no runner ramdisk) (shipped no design) [v1.3.0] «README.txt:76-90»
F-SDL-209. V4 repo-as-processor: endpoints estáticos `/api/handler.json`, `/api/queue.json`, `/api/state.json`, `/api/workers.json`, `/_bridge/inbox/` (shipped no design) [v4.0.0] «readme1.txt:584-598»
F-SDL-210. Per-sandbox lifecycle repo+pipeline+cron+timeline (issue) com ciclo resumível artifact→mmap→run→sync→artifact (planned→shipped no design) [v4.0.0] «readme1.txt:584-598»
F-SDL-211. Cloudflare Workers orchestrator com R2 bindings, Durable Object de estado, cron cleanup e filas Redis-backed (shipped no design) [v1.0.0] «readme1.txt:540-566»
F-SDL-212. Provider chain oracle→github→hf→gitlab→kaggle com first-free-runner-wins (shipped no design) [v1.0.0] «readme1.txt:540-566»
F-SDL-213. SCDN — entrega de assets por HTTPS via R2/CloudFront/Bun CDN/Deno Deploy/Vercel-Netlify edge (50–200ms edge vs 200–2000ms direto; hits 5–20ms) com env endpoint/token/bucket/region/TTL e retries linear-backoff (shipped no design) [v1.0.0] «README.txt:321-360»
F-SDL-214. CI artifact caching como liquid sandbox persistente com retenção 7 dias (shipped no design) [v1.0.0] «README.txt:284-320»
F-SDL-215. In-browser WASM mesh com gateway shared-memory, worker 8s timeout, cap 512 páginas, mutation scanning, HMAC 5min replay window, OOM 3-camadas (shipped no design) [v1.0.0] «README.txt:284-320»
F-SDL-216. Site-as-VPS emulation (memfs + V8 isolates + container daemons + KV/document DBs + engine microVM WASM emitindo traces vCPU/vRAM/vGPU) (planned) [v1.0.0] «README.txt:361-366»
F-SDL-217. Self-funded compute via GPU mining auto-farms (miners cap 2GB VRAM) num parque de Kubernetes CronJobs free (planned) [v1.0.0] «README.txt:361-366»
F-SDL-218. Pendrive 8GB "HD infinito": Node-20-portable + ESP32 captive portal + hf-mount/rclone/JuiceFS + llama.cpp/BitNet, buckets legais R2/Storj/B2 (planned/demo) [v1.0.0] «readme1.txt:929-940; README.txt:661-680»
F-SDL-219. Capacitor 8.5.0 Android/iOS + Tauri 2 desktop como superfícies mobile/desktop (shipped como target plans; artefatos caller-owned) [v1.8.9] «readme1.txt:275-309; README.txt:156-190; 601-620»
F-SDL-220. Binary self-contained executável — compute sandbox, VM e orquestrador em outros computadores via bun compile/Node SEA (shipped como target) [v1.8.9] «README.txt:156-190; 561-580»
F-SDL-221. Extension MV3 com workerbridge browser-independente e runtime extension entry declarada (shipped) [v1.8.18] «README.txt:156-190; readme1.txt:55-97»
F-SDL-222. Model catalog free com 26 modelos dedup (OpenCode 8, OpenRouter 15 únicos, Kilo 12 únicos, 9 compartilhados) filtrando `-free`, `/free`, `:free` (shipped como catálogo) [v1.8.15] «readme1.txt:136-147; README.txt:373-395»
F-SDL-223. Platform inventory 911 plataformas / 74 categorias gerado de ~6.700 registros e 10.600 URLs (shipped como doc) [v1.8.15] «readme1.txt:148-159; README.txt:641-660»
F-SDL-224. Comparative study 1.8.21: 60 repos analisados por API (54 relevantes, 64 code samples) em 5 categorias com dispositions (shipped como doc) [v1.8.21] «README.txt:531-560; repo-analysis-1.8.21.txt:1-10»

---

## ONDA 4c — debonair (99 features)

F-DBN-001..099: layer architecture 10–13 camadas × 13 gêneros, Genre DNA 7
dimensões, quality checks 13 + auto-fix grade A–F, LUFS/-1 dBTP BS.1770-4,
datasets Lakh/MAESTRO/MusicCaps, Demucs 2 tiers, RAVE/DDSP/HiFi-GAN ONNX
INT8, pacote offline npm <50MB, receitas de mixing por gênero, roadmap
v0.1.0→v2.0.0. Bloco completo: «onda4c-debonair.md § FEATURES F-DBN».


> Convenção de versões (grupos temáticos, máx 99/versão): **v1.0.0** núcleo já construído (shipped); **v2.0.0** export/efeitos/estrutura (fase 2); **v3.0.0** agente IA + neural ONNX (fase 3); **v4.0.0** profissional: mastering/stems/vocal (fase 4); **v5.0.0** máquina de treinamento + biblioteca de samples; **v6.0.0** sistema de qualidade + mixing automático; **v7.0.0** pacote npm offline + assembly engine.

### v1.0.0 — Núcleo da biblioteca (shipped)

F-DBN-001. Theory engine completo — escalas, acordes, keys, intervalos, modos, GENRE_CONFIG 15 gêneros, seeded RNG; 381 linhas, zero deps (shipped) [v1.0.0] «PLANO-TECNICO-MASTER.txt:270-295»
F-DBN-002. Harmony engine — progressões de acordes, voice leading, inversões, arpejador, substituições (trítono/relativa/paralela), acordes estendidos 7/9/11/13; 383 linhas (shipped) [v1.0.0] «PLANO-TECNICO-MASTER.txt:270-295; WORKFLOW-MANUAL-VS-AI.txt:60-100»
F-DBN-003. Melody engine — geração de bass line e lead melody, desenvolvimento de motivos (sequência/inversão/retrógrado/aumento/diminuição), contraponto com constraints de consonância, call-and-response; 433 linhas (shipped) [v1.0.0] «PLANO-TECNICO-MASTER.txt:270-295»
F-DBN-004. Rhythm engine — drum patterns por 15 gêneros (kick/snare/clap/hihat/openhat/perc/808), groove templates com accents, swing, humanização, fills; 437 linhas (shipped) [v1.0.0] «PLANO-TECNICO-MASTER.txt:270-295»
F-DBN-005. Instrument presets — 12 instrumentos melódicos + 8 percussivos com ADSR, filtro e routing de FX; customizeInstrument e layerInstruments; 277 linhas (shipped) [v1.0.0] «PLANO-TECNICO-MASTER.txt:270-295; WORKFLOW-MANUAL-VS-AI.txt:150-170»
F-DBN-006. Music engine Tone.js — transport, step sequencer, play/mute/solo por grupo, BPM por grupo, volume por sub-layer, randomize de padrões; 1003 linhas (shipped) [v1.0.0] «PLANO-TECNICO-MASTER.txt:270-295; WORKFLOW-MANUAL-VS-AI.txt:175-185»
F-DBN-007. API manual tipada — createProject({bpm,key,scale,genre}) → setProgression/generateMelody/generateDrums/setInstruments → generate → play/export (shipped) [v1.0.0] «PLANO-TECNICO-MASTER.txt:145-175»
F-DBN-008. Seeded RNG reprodutível — mesma seed gera a mesma música (crítico para games/apps) (shipped) [v1.0.0] «PLANO-TECNICO-MASTER.txt:280-340»
F-DBN-009. GENRE_CONFIG de 15 gêneros — bpmRange, defaultScale/Key, commonProgressions, drumStyle, typicalInstruments (trap, pop, edm, hiphop, rnb, house, techno, ambient, cinematic, jazz, rock, funk, reggaeton, drill, latin) (shipped) [v1.0.0] «WORKFLOW-MANUAL-VS-AI.txt:405-425»
F-DBN-010. Step sequencer UI — canvas fullscreen, drum grid, piano roll pitch 48–84, hover ghost cell, drag para desenhar, right-click apaga, click preview (shipped) [v1.0.0] «regras-APP.md APP-0510; WORKFLOW-MANUAL-VS-AI.txt:1000-1030»
F-DBN-011. Suite de testes Vitest para theory/harmony/melody/rhythm + Biome linting (shipped) [v1.0.0] «WORKFLOW-MANUAL-VS-AI.txt:1060-1080»
F-DBN-012. Build Vite biblioteca+web com external tone e tipos TSDoc (shipped) [v1.0.0] «PLANO-TECNICO-MASTER.txt:130-140»

### v2.0.0 — Export, efeitos e estrutura (planned)

F-DBN-013. Export MIDI de qualquer padrão/progressão via midi-file <50ms (planned) [v2.0.0] «PLANO-TECNICO-MASTER.txt:195-210»
F-DBN-014. Export WAV offline via OfflineAudioContext + audiobuffer-to-wav (3min <5s) (planned) [v2.0.0] «PLANO-TECNICO-MASTER.txt:195-210»
F-DBN-015. Effects chain completa — reverb algorítmica+convolução, delay mono/ping-pong, distortion, chorus, compressor, EQ, limiter (planned) [v2.0.0] «PLANO-TECNICO-MASTER.txt:195-215»
F-DBN-016. AudioWorklet processors custom para efeitos por-sample (planned) [v2.0.0] «PLANO-TECNICO-MASTER.txt:195-215»
F-DBN-017. Song structure — templates intro/verse/chorus/bridge/outro com arrangement automático e intensity por seção (planned) [v2.0.0] «PLANO-TECNICO-MASTER.txt:195-215; WORKFLOW-MANUAL-VS-AI.txt:455-500»
F-DBN-018. Arrangement timeline section-based para composições multipartes (planned) [v2.0.0] «PLANO-TECNICO-MASTER.txt:195-215»
F-DBN-019. Undo/redo por command pattern para todo o estado (planned) [v2.0.0] «PLANO-TECNICO-MASTER.txt:195-215»
F-DBN-020. Project save/load JSON serializável (planned) [v2.0.0] «PLANO-TECNICO-MASTER.txt:195-215»
F-DBN-021. Síntese wavetable, granular e FM nos presets de instrumentos (planned) [v2.0.0] «PLANO-TECNICO-MASTER.txt:195-215»
F-DBN-022. Sub-módulos npm tree-shakeáveis (/theory ~20KB, /harmony, /melody, /rhythm, /instruments, /musicEngine) (planned) [v2.0.0] «PLANO-TECNICO-MASTER.txt:375-385»

### v3.0.0 — Agente IA + neural ONNX (planned)

F-DBN-023. AI Mode text-to-music — generate({prompt, duration, key?, bpm?, instruments?}) → track tocável (planned) [v3.0.0] «PLANO-TECNICO-MASTER.txt:175-195»
F-DBN-024. Chain-of-Thought music agent — prompt parser → genre classifier → mood mapper → theory parameter generator → structure planner → confidence scorer (planned) [v3.0.0] «PLANO-TECNICO-MASTER.txt:35-60; WORKFLOW-MANUAL-VS-AI.txt:540-560»
F-DBN-025. AIGenerationPlan inspecionável com reasoning ("Selected C minor, 140 BPM…") e confidence 0–1 (planned) [v3.0.0] «PLANO-TECNICO-MASTER.txt:175-195; WORKFLOW-MANUAL-VS-AI.txt:230-260»
F-DBN-026. MOOD_MAP com 10 moods mapeando bias de BPM/escala/density/complexity (planned) [v3.0.0] «WORKFLOW-MANUAL-VS-AI.txt:430-450»
F-DBN-027. Prompt parsing via LLM (Vercel AI SDK) com JSON estrito de intent e regras de desambiguação (planned) [v3.0.0] «WORKFLOW-MANUAL-VS-AI.txt:565-620»
F-DBN-028. Refine iterativo conversacional — agent.refine(plan, "add piano") modificando só o pedido (planned) [v3.0.0] «WORKFLOW-MANUAL-VS-AI.txt:640-660»
F-DBN-029. Hybrid mode — AI gera, usuário edita (setBPM/setChordProgression/setDrumVariation/regenerateMelody) (planned) [v3.0.0] «PLANO-TECNICO-MASTER.txt:175-195»
F-DBN-030. RAVE neural synthesis ONNX — timbre synthesis realtime de códigos latentes (planned) [v3.0.0] «PLANO-TECNICO-MASTER.txt:60-90»
F-DBN-031. DDSP synthesis ONNX — síntese por nota controlável por pitch (F0+loudness→áudio) (planned) [v3.0.0] «PLANO-TECNICO-MASTER.txt:60-90»
F-DBN-032. HiFi-GAN vocoder ONNX — mel 80 bins→waveform ~50MB (planned) [v3.0.0] «PLANO-TECNICO-MASTER.txt:60-90»
F-DBN-033. Model cache IndexedDB com download progressivo e eventos de progresso (planned) [v3.0.0] «PLANO-TECNICO-MASTER.txt:60-90; PIPELINE-TREINAMENTO.txt:1360-1420»
F-DBN-034. onnxruntime-web com backends WASM+WebGPU e warm-up de kernels (planned) [v3.0.0] «INFRAESTRUTURA-AUDIO-AI.txt:525-550»
F-DBN-035. API event-driven (section:complete, playback:position, plan:generated) (planned) [v3.0.0] «WORKFLOW-MANUAL-VS-AI.txt:760-780»

### v4.0.0 — Profissional: mastering, stems, vocal (planned)

F-DBN-036. Stem separation demucs-web — 4 stems drums/bass/vocals/other via HTDemucs ONNX ~172MB (planned) [v4.0.0] «PLANO-TECNICO-MASTER.txt:295-325»
F-DBN-037. AI mixing — análise de frequência → sugestões de EQ, level balancing, detecção de sidechain (planned) [v4.0.0] «PLANO-TECNICO-MASTER.txt:295-325»
F-DBN-038. AI mastering com LUFS targeting (Spotify -14, Apple -16), true peak limiting -1 dBTP e stereo imaging (planned) [v4.0.0] «PLANO-TECNICO-MASTER.txt:295-325»
F-DBN-039. Reference matching — upload de faixa de referência → match de tonal balance, dinâmica e loudness (planned) [v4.0.0] «PLANO-TECNICO-MASTER.txt:295-325»
F-DBN-040. Stem export — tracks individuais (drums/bass/melody/chords) como arquivos separados (planned) [v4.0.0] «PLANO-TECNICO-MASTER.txt:295-325»
F-DBN-041. Vocal synthesis — API (ElevenLabs/OpenAI) + HiFi-GAN local via ONNX com phonemizer PT/EN/ES (planned) [v4.0.0] «PLANO-TECNICO-MASTER.txt:295-325»
F-DBN-042. Export MP3 (lamejs/ffmpeg.wasm) e FLAC futuro (planned) [v4.0.0] «PLANO-TECNICO-MASTER.txt:295-325»
F-DBN-043. Integração DAW — MIDI drag-and-drop (planned) [v4.0.0] «WORKFLOW-MANUAL-VS-AI.txt:985-990»
F-DBN-044. Regeneração por seção — generateSection(plan, 'chorus', "more energetic") (planned) [v4.0.0] «WORKFLOW-MANUAL-VS-AI.txt:655-660»
F-DBN-045. Audio-to-audio influence — upload de referência para gerar no estilo (planned) [v4.0.0] «WORKFLOW-MANUAL-VS-AI.txt:985-990»

### v5.0.0 — Máquina de treinamento + biblioteca de samples (planned)

F-DBN-046. Máquina de treinamento 7 camadas — input→decompose→analyze→organize→patterns→train→infer com dados "mastigado" (planned) [v5.0.0] «MACHINE-TREINAMENTO-COMPLETA.txt:21-70»
F-DBN-047. Import universal — WAV/MP3/FLAC/OGG/AAC/M4A, YouTube via yt-dlp, MIDI via @tonejs/midi, texto e microfone, normalizado a WAV 48kHz estéreo (planned) [v5.0.0] «MACHINE-TREINAMENTO-COMPLETA.txt:75-160»
F-DBN-048. Decomposição em stems DSP (HPSS mid/side, cross-corr <0.25) + ML (HTDemucs ONNX) com auto-fallback (planned) [v5.0.0] «MACHINE-TREINAMENTO-COMPLETA.txt:222-300»
F-DBN-049. Extração de FeatureSet completo (espectral/temporal/harmônico/rítmico/timbral/loudness/estrutural) <10s por música (planned) [v5.0.0] «MACHINE-TREINAMENTO-COMPLETA.txt:320-420»
F-DBN-050. Banco SQLite de treino — audio_files/stems/notes/beats/chords/feature_sets/tags/patterns com transações atômicas (planned) [v5.0.0] «MACHINE-TREINAMENTO-COMPLETA.txt:480-600»
F-DBN-051. Tagging automático — gênero/mood/instrumento/tempo range/era/qualidade/técnica (planned) [v5.0.0] «MACHINE-TREINAMENTO-COMPLETA.txt:605-620»
F-DBN-052. Pattern library — beat/chord/melody/effect/structure patterns com busca por ocorrência e similaridade vetorial (planned) [v5.0.0] «MACHINE-TREINAMENTO-COMPLETA.txt:640-790»
F-DBN-053. Tokenização musical ~2000 tokens (P×V×D, chords, drums, controls, especiais) para modelos autoregressivos (planned) [v5.0.0] «MACHINE-TREINAMENTO-COMPLETA.txt:810-890»
F-DBN-054. Pipeline de treino Python/PyTorch com export ONNX INT8 e fine-tune MusicGen Small (planned) [v5.0.0] «MACHINE-TREINAMENTO-COMPLETA.txt:920-1050»
F-DBN-055. Data augmentation de treino — pitch/time/velocity/dropout/groove (planned) [v5.0.0] «MACHINE-TREINAMENTO-COMPLETA.txt:872-890»
F-DBN-056. Biblioteca de samples com SampleMetadata completo e dedup por hash perceptual (planned) [v5.0.0] «ORGANIZACAO-SAMPLES.txt:14-130; 1590-1615»
F-DBN-057. Diretório canônico samples/{type}/{subtype}/{samples,spectrograms,embeddings,metadata} + convenção de nomes drm_kick_pun_Cm_140_a3f2.wav (planned) [v5.0.0] «ORGANIZACAO-SAMPLES.txt:210-330»
F-DBN-058. Classificação automática ML de samples (type/subtype/confidence + key + BPM) (planned) [v5.0.0] «ORGANIZACAO-SAMPLES.txt:520-580»
F-DBN-059. Embeddings CLAP 512 dims + índice FAISS cosine para "sounds like" search (planned) [v5.0.0] «ORGANIZACAO-SAMPLES.txt:600-830»
F-DBN-060. FTS5 full-text search de samples com triggers de sincronização (planned) [v5.0.0] «ORGANIZACAO-SAMPLES.txt:1005-1055»
F-DBN-061. API de consulta para IA (query_for_generation com type/genre/mood/bpm±/key/character) e batches balanceados de treino (planned) [v5.0.0] «ORGANIZACAO-SAMPLES.txt:1265-1420»
F-DBN-062. Manutenção de biblioteca — dedupe (hash+FAISS>0.95), cleanup de órfãos, usage stats (planned) [v5.0.0] «ORGANIZACAO-SAMPLES.txt:1690-1794»
F-DBN-063. Manifests JSONL train/valid/test 90/5/5 para treino (planned) [v5.0.0] «ORGANIZACAO-SAMPLES.txt:1395-1420»

### v6.0.0 — Sistema de qualidade + mixing automático (planned)

F-DBN-064. Layer architecture por gênero — 10–13 camadas com faixa de frequência, método de síntese e pan declarados (Trap 12, Pop 13, EDM 11, Cinematic 13…) (planned) [v6.0.0] «SISTEMA-QUALIDADE-COMPLETO.txt:25-340»
F-DBN-065. Quality pipeline de 6 estágios — reference analysis → assembly → mixing → mastering → validation → export (planned) [v6.0.0] «SISTEMA-QUALIDADE-COMPLETO.txt:361-466»
F-DBN-066. Genre Reference Profiles pré-computados — curva 31-band, bandEnergy 7 bandas, dinâmica, estéreo, efeitos e arranjo por 13 gêneros (planned) [v6.0.0] «SISTEMA-QUALIDADE-COMPLETO.txt:484-554»
F-DBN-067. Mixing automation per-track de 8 estágios com receitas por gênero (808-sub trap, piano pop, dark pad…) (planned) [v6.0.0] «SISTEMA-QUALIDADE-COMPLETO.txt:649-930»
F-DBN-068. Bus processing — drum bus com paralela, music bus com widening, master EQ+glue (planned) [v6.0.0] «SISTEMA-QUALIDADE-COMPLETO.txt:940-977»
F-DBN-069. Sidechain system declarativo com frequency range/threshold/ratio/depth por gênero (planned) [v6.0.0] «SISTEMA-QUALIDADE-COMPLETO.txt:999-1043»
F-DBN-070. Mastering automation — multiband 4-band, M/S imaging com mono check, limiter true-peak oversampled 4x, normalização BS.1770-4 (planned) [v6.0.0] «SISTEMA-QUALIDADE-COMPLETO.txt:1061-1290»
F-DBN-071. Quality checks + auto-fix — 13 checks com severidade e correção automática (LUFS/true peak/clipping/mono/silêncio/key/BPM) (planned) [v6.0.0] «SISTEMA-QUALIDADE-COMPLETO.txt:1345-1590»
F-DBN-072. Quality report com score 0–100 e grade A–F (planned) [v6.0.0] «SISTEMA-QUALIDADE-COMPLETO.txt:1595-1630»
F-DBN-073. Arrangement templates por gênero com energia por seção e entrada/saída de camadas (planned) [v6.0.0] «SISTEMA-QUALIDADE-COMPLETO.txt:1710-1790»
F-DBN-074. Receitas de mixing/mastering por gênero com valores exatos (trap -8/-10 competitivo, pop -12/-14, EDM -6/-9) e targets por plataforma (Spotify -14, Apple -16, Beatport -9) (planned) [v6.0.0] «MIXING-MASTERING-POR-GENERO.txt:140-165; 290-300; 745-875»
F-DBN-075. Bounces por plataforma com LUFS/true peak próprios e validação iterativa até bater targets (planned) [v6.0.0] «MIXING-MASTERING-POR-GENERO.txt:820-875»

### v7.0.0 — Pacote npm offline + assembly engine (planned)

F-DBN-076. Pacote npm @devthink/debonair <50MB (real ~33MB) com theory+assembly+patterns+synthesis+models+export (planned) [v7.0.0] «ARQUITETURA-OFFLINE-COMPLETA.txt:268-290; 1050-1075»
F-DBN-077. Pattern database comprimida CBOR+LZ4 ~4.5MB com 3.000+ patterns × 15 gêneros (planned) [v7.0.0] «ARQUITETURA-OFFLINE-COMPLETA.txt:268-290; 340-430»
F-DBN-078. Matriz de compatibilidade pré-computada sparse (>0.5) drum↔chord↔melody↔bass↔sections (planned) [v7.0.0] «ARQUITETURA-OFFLINE-COMPLETA.txt:435-470»
F-DBN-079. Assembly engine constraint satisfaction + neural scoring com hard/soft constraints (planned) [v7.0.0] «ARQUITETURA-OFFLINE-COMPLETA.txt:480-540»
F-DBN-080. Transitions generator — drum fills, risers/downlifters, chord anticipation, energy ramp (planned) [v7.0.0] «ARQUITETURA-OFFLINE-COMPLETA.txt:545-560»
F-DBN-081. Humanizer neural ONNX — timing ±5–15ms, velocity ±5–15, groove templates, dinâmica por frase (planned) [v7.0.0] «ARQUITETURA-OFFLINE-COMPLETA.txt:565-580»
F-DBN-082. Fallback chain de 4 níveis — neural → rules → theory defaults → hardcoded (qualidade nunca cai) (planned) [v7.0.0] «ARQUITETURA-OFFLINE-COMPLETA.txt:830-850»
F-DBN-083. Síntese híbrida por instrumento — física (kick/808/KS guitar), FM (piano), subtrativa (lead), wavetable+granular (pad), aditiva (strings) (planned) [v7.0.0] «ARQUITETURA-OFFLINE-COMPLETA.txt:630-720»
F-DBN-084. Simple API uma linha — Debonair.generate({prompt:"Pop ballad, C major, 80 BPM"}) → play/export (planned) [v7.0.0] «ARQUITETURA-OFFLINE-COMPLETA.txt:1080-1100»
F-DBN-085. Formatos binários compactos — drum bitmask (18B vs 144B JSON), velocity delta+varint, melodias com flags por bit, pads com envelope 64 bins (planned) [v7.0.0] «FORMATOS-DADOS-PREV processados.txt:95-380; 660-720»
F-DBN-086. Data store com SQLite indexes (offset/length) + LZ4 por chunk 64KB para acesso random (planned) [v7.0.0] «FORMATOS-DADOS-PREV processados.txt:460-560; 745-760»
F-DBN-087. Build pipeline de dados em 7 passos com validação min-quality 0.7 e check_sizes max 10MB (planned) [v7.0.0] «FORMATOS-DADOS-PREV processados.txt:850-880»
F-DBN-088. Lookup tables compartilhadas — genres hierárquicos, moods valence/energy, keys midi_root, scales intervals (planned) [v7.0.0] «FORMATOS-DADOS-PREV processados.txt:940-1050»
F-DBN-089. Pipeline de referências reais — Demucs → features por stem → JSON schema única (progressions/groove/energy/mixing) → variações Markov/genética/interpolação com repair por constraints (planned) [v7.0.0] «EXTRACAO-REFERENCIAS-REAIS.txt:20-70; 600-720; 770-1000»
F-DBN-090. Genre templates aprendidos por estatística de 100+ referências com recommender ponderado (BPM 0.3/key 0.3/genre 0.2/mood 0.2) (planned) [v7.0.0] «EXTRACAO-REFERENCIAS-REAIS.txt:975-1140»
F-DBN-091. Máquina de síntese universal por tipo de som — drums/FX/pads/beat/guitar/piano/voz/beatbox com receitas Web Audio por método (planned) [v7.0.0] «SINTESE-TIPOS-SOM.txt:1-60; 290-720; 960-1010»
F-DBN-092. Warehouse + factory "fábrica de carros" — 14.000 peças com metadados ricos e scoring harmônico 0.4/rítmico 0.3/registro 0.2/densidade 0.1 (planned) [v7.0.0] «MONTAGEM-INTELIGENTE.txt:10-60; 470-530»
F-DBN-093. Voice leading por constraint solver com backtracking MRV (sem paralelas, ranges, chord tones + soft prefs) (planned) [v7.0.0] «MONTAGEM-INTELIGENTE.txt:680-740»
F-DBN-094. Energy controller por role (lead 1.0 → fx 0.3) com entrada/saída de instrumentos por threshold (planned) [v7.0.0] «MONTAGEM-INTELIGENTE.txt:750-800»
F-DBN-095. Módulo spectral/ completo (fft/stft/mel/mfcc/chroma/descriptors/onset/pitch) com vetor de ~167 features/frame (planned) [v7.0.0] «ANALISE-ESPECTRAL.txt:930-910»
F-DBN-096. Loop analyze→generate — analisar referência (key/BPM/gênero/brightness/chords) e gerar similar com transposição e mudança de tempo (planned) [v7.0.0] «ANALISE-ESPECTRAL.txt:1000-1060»
F-DBN-097. stack MUST/SHOULD/NICE/AI de libs TS fixado (tone/tonal/@tonejs/midi/howler + wavesurfer/meyda/pitchfinder/spessasynth + onnxruntime/transformers + whisper/demucs) (planned) [v7.0.0] «LIBRARIAS-TS-AUDIO.txt:1100-1140»
F-DBN-098. Suporte browser/Node/Bun com a mesma API, MIT, sem custos de API (planned) [v7.0.0] «PLANO-TECNICO-MASTER.txt:280-340»
F-DBN-099. Benchmarks públicos — primeira nota <100ms, pattern <10ms, MIDI <50ms, WAV 3min <5s, tree-shaking >80% (planned) [v7.0.0] «PLANO-TECNICO-MASTER.txt:230-265»

---

## ONDA 4d — stealhead + UI/design devthink (86 features)

F-SHD-001..050: StealHead 5.1 — 8 fases, DB-first mestre+shard, budgets
render (<60 draws/<150k tris/FPS p50≥55), catálogo 220, pipeline GLB→R3F,
40 formatos 3D, HUD Blood Strike. F-DTK-200..235: UI/design universal —
tríade tipográfica, paleta 3+3, radius 20-32, tracking −2/−3%, hero 72-96px,
Z-index 0-1000, 40 efeitos, dark mode, chat Saddle box radius 24/concave
14/tabs 40. Bloco completo: «onda4d-stealhead-raiz.md § FEATURES».


### stealhead — F-SHD (app da família, importa versawase; FPS de arena por ondas, editor first, DB first)

F-SHD-001. Deduplicação por hash SHA-256 com preservação de zips e dry-run (shipped) [v1.0.0] «stealthead.session1-conversa (2).txt:15-60»
F-SHD-002. Organização por formato com mapa reversível (5.293 arquivos movidos, 0 falhas) (shipped) [v1.0.0] «stealthead.session1-conversa (2).txt:90-97»
F-SHD-003. Dedup aplicado: 5.618 duplicados deletados, ~317MB liberados (594→277MB) (shipped) [v1.0.0] «stealthead.session1-conversa (2).txt:48-52»
F-SHD-004. node_modules global junction (954 pacotes, vite/tsx/three) sem instalação local (shipped) [v1.0.0] «stealthead.session1-conversa (2).txt:57-60»
F-SHD-005. Feature map 4.0 com 306 features mapeadas de alvo 600, todas proposed→executadas por ondas (shipped) [v1.0.0] «stealthead.session1-conversa (2).txt:404-410»
F-SHD-006. Protocolo de validação de 10 passos com last-validation.txt como gate único (shipped) [v1.0.0] «stealthead.session1-conversa (2).txt:430-447»
F-SHD-007. Balancer Monte Carlo TTK (balancer.py --runs 1000, 10/30/60m, p50 ±15%) (shipped) [v1.0.0] «stealthead.session1-conversa (2).txt:444-445»
F-SHD-008. Benchmark de performance 60s (perf.json: fps/draws/tris/heap) (shipped) [v1.0.0] «stealthead.session1-conversa (2).txt:445-446»
F-SHD-009. Smoke Playwright Brave headless com canvas data-ready, tecla r, Space×10 e screenshot (shipped) [v1.0.0] «stealthead.session1-conversa (2).txt:443-444»
F-SHD-010. Wave 1 P0: slide/tac-sprint/ADS/footsteps/spawn-shield + HUD/áudio agentes (shipped) [v1.0.0] «stealthead.session1-conversa (2).txt:5008-5012»
F-SHD-011. Wave 2a: medals (state.ts), prone/lean/death-cam/interact (player.ts), enemyshot/whizz/FF-LOS (enemies.ts) (shipped) [v1.0.0] «stealthead.session1-conversa (2).txt:5009-5010»
F-SHD-012. Wave 2b: smart-spawn + boss telegraph + cap 26 + falloff triple + decal/impact + hitstop + fix headshot 4x (shipped) [v1.0.0] «stealthead.session1-conversa (2).txt:5011»
F-SHD-013. Wave 2c HUD agente P1: dmg numbers, markers, pings, vitals, pips, medal cards, prompt [F] (shipped) [v1.0.0] «stealthead.session1-conversa (2).txt:5012»
F-SHD-014. Wave 2d: mantle #315, viewmodel clips #346-348, per-bone hitboxes #383, killcam #335 (planned) [v1.1.0] «stealthead.session1-conversa (2).txt:5013»
F-SHD-015. Gates por wave: tsc 0 erros + smoke 0 erros + perf p50 ~59,9 + screenshot visual probe (shipped) [v1.0.0] «stealthead.session1-conversa (2).txt:5006-5007»
F-SHD-016. Crosshair com spring physics (SPREAD_LAMBDA 18, τ~55ms), estilos default/dot/cross/circle/t-shape, rotação de reload e fireFlash/hitFlash (shipped) [v1.0.0] «stealthead.session1-conversa (2).txt:917-995»
F-SHD-017. Hitmarker X-snap 4 linhas com tipos normal/headshot/kill e ttl 0,18s (shipped) [v1.0.0] «stealthead.session1-conversa (2).txt:100-120»
F-SHD-018. HUD i18n en/pt/es, minimapa, leaderboard, settings — DOM puro, só minimapa em canvas (shipped) [v1.0.0] «stealthead.session1-conversa (2).txt:884-890»
F-SHD-019. Tabela de armas real: AK-47 (34 dmg, 600 rpm, spread 0.022/0.0035, recoil 0.021/0.009, adsFov 52/0.22s, falloff 45-90-0.7), Intervention, MP5, M870 8 pellets (shipped) [v1.0.0] «stealthead.session1-conversa (2).txt:572-588»
F-SHD-020. Loadouts com stats de exibição 0-100: ASSAULT 68/55/75/65, MARKSMAN, CQB, BREACHER (shipped) [v1.0.0] «stealthead.session1-conversa (2).txt:588-590»
F-SHD-021. Fidelidade CS2: validação de geometria contra docs de anatomia (bullpup, mag banana AK, supressor USP-S/AWP, wear por região) (shipped) [v1.0.0] «stealthead.session1-conversa (2).txt:524-546, 660-664»
F-SHD-022. Inimigos soldado Mixamo GLB com SkeletonUtils.clone, escala por arquétipo, tint por mesh, skinning LOD near/far e máquina de clips idle/walk/run/strafe (shipped) [v1.0.0] «stealthead.session1-conversa (2).txt:15275-15290»
F-SHD-023. Arma de inimigo HK416 compartilhada com muzzle Object3D e gunmetal (shipped) [v1.0.0] «stealthead.session1-conversa (2).txt:15290-15295»
F-SHD-024. Viewmodel FPS: loadSoldier chain sandbox→/api/assets→CDN mirrors com __vmDiag de diagnóstico, extractArm por skinIndex dominante, poseArm rescale k=0.45 (shipped) [v1.0.0] «stealthead.session1-conversa (2).txt:15252-15272»
F-SHD-025. Física pura sem THREE (623 linhas): Verlet/semi-implícito, FixedStep, sphere/ray/AABB/CCD sphereSweep, ballística com drag/penetração, ragdoll Verlet, ackermann+suspensão, WORLD_GRAVITY, mulberry32 (shipped) [v1.0.0] «stealthead.session1-conversa (2).txt:15296-15310»
F-SHD-026. Terreno 1024×1024 (255×255 segs) com FBM+blur, arena bowl achatada, vertex-color splat + canvas detail (shipped) [v1.0.0] «stealthead.session1-conversa (2).txt:15312-15316»
F-SHD-027. Arena props nomeadas (containers, obelisks, pickups, cover) com colliders e rebuildColliderHash (shipped) [v1.0.0] «stealthead.session1-conversa (2).txt:15316-15320»
F-SHD-028. BVH patch global three-mesh-bvh em engine.ts (prototype raycast + computeBoundsTree) e acceleratedBVHRaycast (shipped) [v1.0.0] «stealthead.session1-conversa (2).txt:15320-15324»
F-SHD-029. Skydome shader + sun directional 1.1 + hemi 0.35 + ambient 0.05 + PMREM env (shipped) [v1.0.0] «stealthead.session1-conversa (2).txt:15326-15328»
F-SHD-030. Diagnóstico de pipeline de assets: relatório de editor-foundation (zero TransformControls/GridHelper no código, 3 hooks reutilizáveis) (shipped) [v1.0.0] «stealthead.session1-conversa (2).txt:15330-15340»
F-SHD-031. Pipeline GLB ClaudeofDuty2: compose_scene.py (glTF writer em Python), export_collision.py (BSP→glTF z-up→three), bake_collision_bvh.mjs (MeshBVH SAH serializado), xanim_to_json (decoder T6 v19) (shipped) [v1.0.0] «stealthead.session1-conversa (2).txt:15360-15375»
F-SHD-032. collision-world runtime: deserializeCollisionWorld rebuild MeshBVH de bin + sidecar JSON + cápsula-vs-BVH com scratch pré-alocado (shipped) [v1.0.0] «stealthead.session1-conversa (2).txt:15380-15385»
F-SHD-033. Rig procedural ClaudeofDuty: 25 ossos, IK 2-bones com law-of-cosines + pole vector, blend tree layered + 4 passes IK, PhysicsDebugView 120k vértices com cores por tipo (shipped) [v1.0.0] «stealthead.session1-conversa (2).txt:15388-15395»
F-SHD-034. Studio R3F grok: useGLTF + manipulação por nome de nó (body/glass/rim/chrome), PMREM procedural de planos, CameraRig lerp, overlay de paint swatches (shipped) [v1.0.0] «stealthead.session1-conversa (2).txt:15400-15410»
F-SHD-035. StealHead 5.1 do zero: 8 fases com subagentes A-F, gates por fase, package.json 70→149 pacotes reescrito pelo dono (shipped) [v5.1.0] «session3-conversa (2).txt:2718-2760»
F-SHD-036. DB mestre + shard por callsign (8 tabelas no mestre; shard ghost.db criado; score persistido; sweep sane sem shards órfãos) (shipped) [v5.1.0] «session3-conversa (2).txt:572-578, 2611-2614»
F-SHD-037. Ingest 5.2.0: 4.912 assets (937,9MB) com 6.898 duplicatas de conteúdo puladas, integrity_check ok (shipped) [v5.2.0] «PLANO-5.3.txt:103-125»
F-SHD-038. Inventário por categoria: arma 83, mapa 72, personagem 37, prop 793, textura 2.145, veículo 50, áudio categorizado (tiro/recarga/passos/impacto/explosão/ambiente/ads) (shipped) [v5.2.0] «PLANO-5.3.txt:127-142»
F-SHD-039. Portas persistidas: gameport 39781, devport 37942 em data/ (shipped) [v5.1.0] «session3-conversa (2).txt:2621-2622»
F-SHD-040. HUD Blood Strike: cartões de arma 1-6 centro-inferior, bússola topo-centro, minimapa/killfeed topo-direita, barra de vida larga roxa #7c3aff→#a86bff, munição grande inferior-direita, viewmodel pos(0.33,-0.3,-0.55) (shipped) [v5.1.0] «PLANO-5.3.txt:825-840»
F-SHD-041. Radar com sweep animado, blips vermelhos e boss dourado; referência webp do Blood Strike transcodificada e analisada (shipped) [v5.1.0] «session3-conversa (2).txt:716-720; PLANO-5.3.txt:829-830»
F-SHD-042. Balance CSV: pistol 10m 0,63s/4,5 hits; rifle 0,22/3,6; smg 0,33/5,6; shotgun 3,20/7,1; sniper 1,33/0,9 (planned) [v5.1.0] «session3-conversa (2).txt:2623»
F-SHD-043. 6 armas (p19, mpx, m4a1, ks12, l115, rpg7) com hitscan spread/falloff, ADS, recuo, reload, foguetes e viewmodel procedural pose Blood Strike (planned) [v5.1.0] «PLANO-5.3.txt:828-829»
F-SHD-044. 6 arquétipos de bots (drone, runner, tank, sniper, exploder, boss) pool 64, FSM, mixForWave com boss a cada 5ª onda, trickle 0,5s, blips para radar (planned) [v5.1.0] «PLANO-5.3.txt:829-830»
F-SHD-045. Editor F2 com TransformControls G/R/S, pick por raycast, raio-x wireframe+grid, save/bake para DB (planned) [v5.1.0] «PLANO-5.3.txt:831-832»
F-SHD-046. formats.ts ~30 formatos 3D com three-stdlib lazy (glb, gltf, fbx, obj, stl, ply, dae, ktx2, basis…) (planned) [v5.1.0] «PLANO-5.3.txt:833-834»
F-SHD-047. multiplayer.ts WS /ws join+state 12Hz interp 100ms remotes nametag fallback bots (planned) [v5.1.0] «PLANO-5.3.txt:830»
F-SHD-048. Catálogo Sketchfab 244 modelos com perfis anotados e personagens numerados 1-6 pelo dono (planned) [v5.3.0] «PLANO-5.3.txt:990-1012»
F-SHD-049. Pipeline 7 etapas de controle total do modelo (ufbx→auto-rig→normalização→bake→IK→retarget→compressão) (planned) [v5.3.0] «PLANO-5.3.txt:960-977»
F-SHD-050. Boot watchdog 15s + progresso real + div de erro visível (nascido corrigido do bug TV VHS com 4 causas documentadas) (shipped) [v5.1.0] «session3-conversa (2).txt:2612-2616, 2718-2730»

### devthink — F-DTK (features de UI/design universal e gateway aplicáveis ao devthink OS)

F-DTK-200. Skill Design Universal V25 como engine de design do OS (briefing→operação→mapeamento→tipografia/cores→proibições→exemplos por categoria) (planned) [v1.0.0] «Skill-Design…V25.txt:168-227»
F-DTK-201. Esteira de 400 ações por componente em 10 fases com meta 85-95% e painel de execução em tempo real (planned) [v1.0.0] «instrutions.txt:14-38»
F-DTK-202. Tríade tipográfica cinética com display 700-900 e vetamento de Inter/Roboto/system-ui (planned) [v1.0.0] «Skill-Design…V25.txt:198-199»
F-DTK-203. Paleta 3 cores globais + 3 por seção com canvas escuro #07090E/#0A0D14 e acentos 2026 (planned) [v1.0.0] «Skill-Design…V25.txt:200»
F-DTK-204. 40 efeitos pro max (glow, glass, claymorphism, glassmorphism, fluid glass, shaders, distorção, transparência, blur) combinados (planned) [v1.0.0] «Skill-Design…V25.txt:201»
F-DTK-205. Toolkit CSS 40+ técnicas: Houdini, @property, Paint Worklet, clip-path, offset-path, shape-outside, backdrop-filter, mask, container queries (planned) [v1.0.0] «Skill-Design…V25.txt:206»
F-DTK-206. Bilíngue PT/EN com seletor de idioma + tradução automática Google GTX com cache (planned) [v1.0.0] «Skill-Design…V25.txt:207»
F-DTK-207. Dark mode completo (modo noturno + modo preto) com persistência local e sync entre navegadores via WSS (planned) [v1.0.0] «Skill-Design…V25.txt:208»
F-DTK-208. Auditoria anti-vibe-code com lista de vetados (herói Inter, gradientes roxos, creme terracota, grade 3 colunas, copy "revolucionar") (planned) [v1.0.0] «Skill-Design…V25.txt:209-210»
F-DTK-209. Biblioteca de exemplos por categoria: Pricing, Sidebar Dashboard, Profile, Travel Booking, SaaS Hero, Healthcare Pastel, Warm Organic Editorial, Dark Crypto Tech, Productivity Grid, Efeito, Transição, Componente, Tipografia, Paleta (planned) [v1.0.0] «Skill-Design…V25.txt:213-227»
F-DTK-210. Sistema de camadas Z-index 0-1000 estratificado (0 atmosfera, 10 conteúdo, frente) com clusters lógicos 2-3 níveis (planned) [v1.0.0] «Skill-Design…V25.txt:187, 1222»
F-DTK-211. Ícones custom SVG path inline do zero, padrão unificado, sem biblioteca genérica nem emoji (planned) [v1.0.0] «Skill-Design…V25.txt:1237»
F-DTK-212. Keyframes pro: float-slow, pulse-glow, shimmer, drift, orbits, breathing, parallax, ripple, tilt, morph com 1000+ propriedades exploradas (planned) [v1.0.0] «Skill-Design…V25.txt:1224-1225»
F-DTK-213. Animação de entrada de seção fade+up 500ms com stagger 60-90ms por card (planned) [v1.0.0] «Skill-Design…V25.txt:224»
F-DTK-214. Glass tokens: rgba(255,255,255,.04) fill + rgba(255,255,255,.08) border + blur; chips de vidro pill sobre foto (planned) [v1.0.0] «Skill-Design…V25.txt:224»
F-DTK-215. Radius canônico: 20-32px em cards grandes, nunca <16px; bento mosaico assimétrico (planned) [v1.0.0] «Skill-Design…V25.txt:222»
F-DTK-216. Tipografia hero 72-96px tracking −3%, sans 500-700 tracking −2% (planned) [v1.0.0] «Skill-Design…V25.txt:223»
F-DTK-217. Atmosferas de seção com bg-radial-gradient ellipse at top, spots de luz suave blur-120px e transições cromáticas (planned) [v1.0.0] «Skill-Design…V25.txt:225»
F-DTK-218. Autocrítica de produção: checklist viewport desktop/mobile + teste "template Webflow?" antes do ship (planned) [v1.0.0] «Skill-Design…V25.txt:211»
F-DTK-219. Design tokens @theme Tailwind v4 CSS-first (carbon #181925, iris #9580ff, mint #33c758, amber #ffa600; escala caption 12px/1.33/−0.32px) (planned) [v1.0.0] «17devnotes.txt:201681-201710»
F-DTK-220. Tema alternativo mono (void-black #000, dusk-violet #343755, caption 10px/1.5) (planned) [v1.0.0] «17devnotes.txt:217778-217800»
F-DTK-221. Chat UI Saddle box: cantos 24px, concavidade 14px, tabs 40px com slant 8, raio ativo 18/inativo 14, altura 168, sobreposição 1.5 (planned) [v1.0.0] «unificado2.txt:12-24»
F-DTK-222. Chat com tabs de modo (arquivos, templates, modos/brain, busca, mídia) em React 19 + motion/react com MessageBubble e ícones de bot custom (planned) [v1.0.0] «unificado2.txt:1-45»
F-DTK-223. Frontend da gateway com tabs V1/V2/V3, seletor de thinking levels (7 níveis), chat, modelos, CRUD de chaves e bloco amarelo de raciocínio (planned) [v1.0.0] «conversa10.txt:52»
F-DTK-224. Thinking always-on visível: reasoning primeiro em bloco collapsible (padrão OpenCode bg-yellow) (planned) [v1.0.0] «conversa10.txt:37, 40»
F-DTK-225. Meta-modelo devthink mascarando model em toda resposta com contexto agregado 2,3M (planned) [v1.0.0] «conversa10.txt:48; gateway.md»
F-DTK-226. cdn.ts com 1200+ entradas esm.sh (id/name/category/cdnurl/loadFromCDN/Map cache) para deps pesadas fora do package.json (planned) [v1.0.0] «conversa10.txt:22, 25»
F-DTK-227. Autofix universal de parâmetros (Levenshtein + clamping + casing/acentos) visível como feature de robustez da plataforma (planned) [v1.0.0] «conversa10.txt:34»
F-DTK-228. Browser QA smoke integrado: desktop+mobile com veredito JSON e baseline de build (planned) [v1.0.0] «17devnotes.txt:1800-1847»
F-DTK-229. Vendoring de docs llms-full.txt de libs (three.js) para uso offline da sandbox (planned) [v1.0.0] «17devnotes.txt:160883-160905»
F-DTK-230. opencode providers com limits por modelo (context 1.050.000 / output 262.144) e plugins de memória universal (planned) [v1.0.0] «17devnotes.txt:164038-164062»
F-DTK-231. Ghostwriter mirror como skill da plataforma (persona unificada, mapeamento de trejeitos, variações 0-98%) (planned) [v1.0.0] «Skill-Definitiva-Todas-Regras.txt:7-37»
F-DTK-232. Página Explore/loja com cards de exemplo por categoria design (pricing/dashboard/profile herdados da skill V25) (planned) [v1.1.0] «Skill-Design…V25.txt:215-217»
F-DTK-233. Single-file self-contained: artefatos HTML com React/Tailwind/CSS/SVG embutidos via CDN esm.sh importmap (planned) [v1.0.0] «Skill-Design…V25.txt:206-207, 1204»
F-DTK-234. Scanline de radar e sweep animados como microcomponente de HUD reutilizável (referência Blood Strike) (planned) [v1.1.0] «PLANO-5.3.txt:829-830»
F-DTK-235. Painel de edição universal (F2, gizmos G/R/S, raio-x, readout xyz) como padrão de editor do OS (planned) [v1.1.0] «PLANO-5.3.txt:617-620, 841-844»

---

---

## Log de ondas

| Onda | Fontes | Features novas | Status |
|------|--------|----------------|--------|
| 0 | features.txt (AetherForge) + regras-APP.md | ~200 | ✅ seed acima |
| 4a | neodocs outros.devthink (package.10 case/repos/descricoes) | 99 | ✅ |
| 4b | neodocs outros.saddle (readme/todo/platforms/sites/research/talks) | 125 | ✅ |
| 4c | neodocs outros.debonair (17 docs áudio/IA) | 99 | ✅ |
| 4d | neodocs outros.stealthhead + raiz (sessions, skill design) | 86 | ✅ |
| 5 | neoskills design → features de UI | — | ⏳ |
| 6 | cadria/stealhead restantes + anotepad + chatinterface | — | ⏳ |

## Contagem consolidada

| App | Seed | Onda 4 | Total | Meta |
|-----|------|--------|-------|------|
| devthink | 82 | 135 (99+36) | 217 | 4.000 |
| saddle | 88 | 125 | 213 | 4.000 |
| debonair | 12 | 99 | 111 | 1.000 |
| stealhead | 6 | 50 | 56 | 1.000 |
| cadria | 6 | — | 6 | 1.000 |
| argan | 6 | — | 6 | 1.000 |
| getry | 35 | — | 35 | 1.000 |
| **TOTAL** | **235** | **409** | **644** | — |

- **Meta por app: >1.000 features** (média 400, mín 600, máx 4.000, 99/versão)
- Ondas 5–6+ continuam o append por app.
