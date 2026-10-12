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
| stealthhead | app da família (importa versawase) | 1.000 | 6 | v1.0.0+ |
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

## debonair / cadria / stealthhead / argan / getry — seeds

- **debonair** [v1.0.0]: 12 features seed de `regras-APP.md` (seção debonair, linhas 499+) — temas, páginas e integrações próprias.
- **cadria** [v1.0.0]: absorve iukka+create; features de criação/canvas.
- **stealthhead** [v1.0.0]: importa versawase; 3.194 textos em neodocs-txt/outros.stealthhead.
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

## ONDA 4d — stealthhead + UI/design devthink (86 features)

F-SHD-001..050: Stealthhead 5.1 — 8 fases, DB-first mestre+shard, budgets
render (<60 draws/<150k tris/FPS p50≥55), catálogo 220, pipeline GLB→R3F,
40 formatos 3D, HUD Blood Strike. F-DTK-200..235: UI/design universal —
tríade tipográfica, paleta 3+3, radius 20-32, tracking −2/−3%, hero 72-96px,
Z-index 0-1000, 40 efeitos, dark mode, chat Saddle box radius 24/concave
14/tabs 40. Bloco completo: «onda4d-stealthhead-raiz.md § FEATURES».


### stealthhead — F-SHD (app da família, importa versawase; FPS de arena por ondas, editor first, DB first)

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
F-SHD-035. Stealthhead 5.1 do zero: 8 fases com subagentes A-F, gates por fase, package.json 70→149 pacotes reescrito pelo dono (shipped) [v5.1.0] «session3-conversa (2).txt:2718-2760»
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

## FASE 5 — UI/design do devthink (55 features + 30 specs CSS)

F-DTK-400..454: tema sol curated, timing de micro-animações, glass/
liquid-glass, sidebars magnéticas, kit chat (msg-row/send-pill/prompt-giga/
action-pods), abas pill+segmented, escada de radius, sombras 5 níveis, bordas
via mask, estados 5+8, keyframes prontos. Specs CSS verbatim (tokens :root +
keyframes + 20 receitas de design-premium/receitas-css.md) moram em
«regras.md § FASE 5 · SPECS CSS» e «onda5-design-css.md».

# FEATURES F-DTK-400+ (UI/design aplicadas ao devthink)

- F-DTK-400. Design tokens CSS central — `:root` com papéis semânticos em 2 tiers (primitivo→semântico→componente), tema sol curated {#0B0806/#F59E0B/#FFFBEB} como default (planned) [v1.0.0] «design-premium/SKILL.md:56; visual-design-foundations/references/color-systems.md:67-134»
- F-DTK-401. Dark mode via `[data-theme]` + prefers-color-scheme com rampa própria e persistência local (planned) [v1.0.0] «visual-design-foundations/references/color-systems.md:140-231; design-premium/SKILL.md:210»
- F-DTK-402. Escala de cor OKLCH perceptual com geração programática de rampas por hue (planned) [v1.0.0] «visual-design-foundations/references/color-systems.md:9-61»
- F-DTK-403. Verificador WCAG automático (getContrastRatio + meetsWCAG) integrado ao pipeline de build (planned) [v1.0.0] «visual-design-foundations/SKILL.md:207-225»
- F-DTK-404. Grid de espaçamento 8pt com tokens semânticos (inline/stack/inset/section/page) (planned) [v1.0.0] «visual-design-foundations/references/spacing-iconography.md:9-62»
- F-DTK-405. Escada de radius com regra concêntrica (interno ≤ externo) aplicada a chips→card→hero→painel (planned) [v1.0.0] «design-premium/SKILL.md:84»
- F-DTK-406. Escala de sombras em 5 níveis (flat→sutil→card→mockup→modal) padronizada em todo produto (planned) [v1.0.0] «design-systems/brand-inspiration/notion/DESIGN.md:572-580»
- F-DTK-407. Glass system (.glass/.glass-dark/.liquid-glass) para overlays, docks e painéis flutuantes com blur ≥35% (planned) [v1.0.0] «design-premium/references/receitas-css.md:7-15»
- F-DTK-408. Z-bands de z-index 0/10/20/50 documentadas como camadas canônicas da plataforma (planned) [v1.0.0] «design-premium/SKILL.md:143»
- F-DTK-409. Sidebar magnética com indicador deslizante (barra 2px cubic-bezier(.2,.8,.2,1)) e item ativo com padding-shift (planned) [v1.0.0] «design-templates/industrial-archive/reference.html:166-218»
- F-DTK-410. Drawer mobile full-screen (translateX .55s premium ease) para nav compacta (planned) [v1.0.0] «design-templates/riso-product/reference.html:191-202»
- F-DTK-411. Sidebar de docs 3-colunas (nav 240 / prosa 720 / TOC 200) com nav-item ativo surface+ink (planned) [v1.0.0] «design-systems/brand-inspiration/mintlify/DESIGN.md:561, 373-387»
- F-DTK-412. Kit de chat: msg-row, send-pill, prompt-giga (input-herói + botão embutido + chips), action-pods, voice-bubble com waveform (planned) [v1.0.0] «design-premium/SKILL.md:132; design-premium/references/componentes-arquitetura.md:26»
- F-DTK-413. Presença com live-dot ping (1 por view, anel 1.4s ease-out) em listas de agentes (planned) [v1.0.0] «design-premium/references/receitas-css.md:160-167»
- F-DTK-414. Abas duplas: pill-tab (ativa fundo ink) e segmented-tab (underline 2px) como gramáticas únicas por contexto (planned) [v1.0.0] «design-systems/brand-inspiration/notion/DESIGN.md:673-680»
- F-DTK-415. Badge kit (4px 10px full / 2px 8px square) com variants tinte pastel + texto dark (planned) [v1.0.0] «design-systems/brand-inspiration/notion/DESIGN.md:339-380»
- F-DTK-416. Entrada coreografada hero com stagger riseIn 0.6s (hero→tagline→subject→CTA) (planned) [v1.0.0] «design/horizontal-craft/animation-discipline.md:29-43»
- F-DTK-417. Biblioteca de keyframes por função (orbitSpin, sheen, barTick, cascade, rise) com stagger nth-child (planned) [v1.0.0] «design-premium/SKILL.md:206»
- F-DTK-418. Timing master global: micro 120-250ms, entradas 400-800ms stagger 60-90ms, loops 8-30s, springs cubic-bezier(.2,1.2,.4,1) (planned) [v1.0.0] «design-premium/SKILL.md:111»
- F-DTK-419. Doutrina de easing: ease-out de entrada, spring de ciclo, jamais `transition: all`, nunca scale(0) (planned) [v1.0.0] «design-premium/SKILL.md:117»
- F-DTK-420. prefers-reduced-motion global: strip de motion-em-eixo com substituto de crossfade (planned) [v1.0.0] «design/horizontal-craft/animation-discipline.md:132-145»
- F-DTK-421. Gauge de anel @property --p com conic-gradient + IntersectionObserver + count-up rAF (planned) [v1.0.0] «design-premium/references/receitas-css.md:34-42»
- F-DTK-422. Marquee de status/announcement com translateX(-50%) 22s (planned) [v1.0.0] «design-premium/references/receitas-css.md:84-88»
- F-DTK-423. Draw-on-view de diagramas SVG (dashoffset 900→0) (planned) [v1.0.0] «design-premium/references/receitas-css.md:90-96»
- F-DTK-424. Borda gradiente .grad-ring (mask-composite exclude + hue 6s) para cartões destaque (planned) [v1.0.0] «design-premium/references/receitas-css.md:19-30»
- F-DTK-425. Cortes funcionais clip-path (bevel-45/fold-corner/hex) como linguagem de borda única por página (planned) [v1.0.0] «design-premium/references/receitas-css.md:57-63; design-premium/SKILL.md:32»
- F-DTK-426. Máscaras de aba/notch (bump radial 44px, scallop repeat-x) para tiles com header (planned) [v1.0.0] «design-premium/references/receitas-css.md:46-53»
- F-DTK-427. Botões com sombra-offset física (5px 5px 0 accent → colapso no hover) para clima riso/print (planned) [v1.0.0] «design-templates/riso-product/reference.html:216-229»
- F-DTK-428. Nav link com underline que cresce (right 100%→0) e dupla capa regular/alt-italic (planned) [v1.0.0] «design-templates/riso-product/reference.html:144-145; design-templates/saas-landing/reference.html:82-101»
- F-DTK-429. Cursor custom dot+ring (mix-blend, expansão hover, off ≤900px) como micro-interação assinatura (planned) [v1.0.0] «design-templates/riso-product/reference.html:101-110»
- F-DTK-430. Loader de entrada com rise por letra (1.1s, delays .08s) e barra de progresso tnum (planned) [v1.0.0] «design-templates/saas-landing/reference.html:121-162, 283-303»
- F-DTK-431. Overlay de subpágina com backdrop blur 24px + blur/escurecimento da cena sob (planned) [v1.0.0] «design-templates/saas-landing/reference.html:46-48, 329-339»
- F-DTK-432. Toggle de tema sem JS (checkbox + :checked ~ seletor) com transição .6s (planned) [v1.0.0] «design-premium/references/receitas-css.md:155-157»
- F-DTK-433. Estados cobertos: loading/empty/error/populated/edge renderizados em toda lista/tabela/card/form (planned) [v1.0.0] «design/horizontal-craft/state-coverage.md:32-42»
- F-DTK-434. Piso de 8 estados por componente interativo + URL como estado (deep-link) (planned) [v1.0.0] «design-premium/SKILL.md:212»
- F-DTK-435. Thresholds de loading canônicos (0-300ms nada… 60s+ parar) com cancel em >10s (planned) [v1.0.0] «design/horizontal-craft/state-coverage.md:121-133»
- F-DTK-436. Empty states com headline + valor + CTA e eco de query em no-results (planned) [v1.0.0] «design/horizontal-craft/state-coverage.md:80-86»
- F-DTK-437. Erros com causa+recuperação, severidade por escopo, input preservado (planned) [v1.0.0] «design/horizontal-craft/state-coverage.md:89-117»
- F-DTK-438. ARIA por mudança (alert/status/alertdialog) com política de foco definida (planned) [v1.0.0] «design/horizontal-craft/state-coverage.md:137-145»
- F-DTK-439. Focus-visible global outline 2px accent offset 2px + ring ≥3:1 (planned) [v1.0.0] «design-systems/style-skills/urdu/DESIGN.md:583-592; design-premium/SKILL.md:211»
- F-DTK-440. Inputs 40-44px com halo de foco `0 0 0 3px rgba(accent,.1)` e label obrigatória (planned) [v1.0.0] «design-systems/style-skills/urdu/DESIGN.md:396-421, 426-443»
- F-DTK-441. Validação on-blur (keystroke só pós-blur em campos live) (planned) [v1.0.0] «design/horizontal-craft/state-coverage.md:63-75»
- F-DTK-442. Touch targets 44px e safe-areas env() em toda surface mobile (planned) [v1.0.0] «visual-design-foundations/references/spacing-iconography.md:149-152; design-premium/SKILL.md:211»
- F-DTK-443. Registry de viewports com data-attributes (data-device/data-viewport/data-export-size) para previews reais (planned) [v1.0.0] «design/canvas-and-device.md:56-62, 229-240»
- F-DTK-444. Frames de device com aspect-ratio CSS (390/844, 1440/900, 1440/1024) (planned) [v1.0.0] «design/canvas-and-device.md:244-280»
- F-DTK-445. Breakpoints canônicos 375/768/1280 + colapsos definidos (nav→hamburger, grids N→1) (planned) [v1.0.0] «design/canvas-and-device.md:209-213; design-systems/brand-inspiration/notion/DESIGN.md:779-799»
- F-DTK-446. Espaçamento responsivo por container queries em cards (planned) [v1.0.0] «visual-design-foundations/references/spacing-iconography.md:90-110»
- F-DTK-447. Tipografia fluida clamp() + text-wrap balance/pretty + 65ch de prosa (planned) [v1.0.0] «visual-design-foundations/SKILL.md:147-158; visual-design-foundations/references/typography-systems.md:216-293»
- F-DTK-448. Modo RTL/idiomas com propriedades lógicas e bdi para conteúdo misto (planned) [v1.0.0] «design-systems/style-skills/urdu/DESIGN.md:206-217, 696-702»
- F-DTK-449. Audit UI automatizado contra Web Interface Guidelines (file:line output) (planned) [v1.0.0] «web-design-guidelines/SKILL.md:10-29»
- F-DTK-450. Scan de emoji automático por faixas Unicode com substituto SVG/CSS/label (planned) [v1.0.0] «design/horizontal-craft/anti-ai-slop.md:259-299»
- F-DTK-451. Auditoria anti-vibe-code (ban lists P0: boxception, muleta roxo, pirâmide, tells 2026) no pipeline de entrega (planned) [v1.0.0] «design-premium/references/antivibe-completo.md:5-48»
- F-DTK-452. Page-plan JSON (`<script id="page-plan">`) + marcadores COMPONENT_START/END para edição por componente (planned) [v1.0.0] «design-premium/SKILL.md:191»
- F-DTK-453. Export fiel: standalone HTML/ZIP/imagem/PDF/PPTX sem redesign + screenshot Playwright com page.route() para assets locais (planned) [v1.0.0] «design/export.md:87-99, 151-202»
- F-DTK-454. DESIGN.md vivo do devthink: import/extraction/persistence de tokens reais com Do/Don'ts e Agent Prompt Guide (planned) [v1.0.0] «design/design-system-generation.md:8-93»

---

## FASE 6a — gateway/CLI/aiactions/notes (114 features)

F-DTK-500..599: gateway (36), CLI Z.AI↔OpenCode (30), aiactions 60+ skills
(34) · F-NPD-001..014: anotepad como app de notas. Bloco completo:
«onda6a-anotepad.md § FEATURES».


Formato: `F-XXX-NNN. <feature>. <status shipped|planned>. [versão]` — F-DTK-500+ para o devthink
(cli, gateway, aiactions, tools), F-NPD-001+ para anotepad/notes como app.

### Grupo 1 — Gateway/Baseurl (F-DTK-500..535) [planned, v1 gateway]

- F-DTK-500. Gateway pass-through V1 (ZAI Web SDK/GLM-5.2) sem chave. planned. [gateway-v1]
- F-DTK-501. Gateway V2 (Babel Town/Mobile Town) com chave e fallback automático para V1. planned. [gateway-v2]
- F-DTK-502. Gateway V3 (NVIDIA) com chave, base /v1. planned. [gateway-v3]
- F-DTK-503. Estrutura de 7 rotas por versão (chat/completions, completions, embeddings, keys, messages, models, responses). planned. [gateway-v1..v3]
- F-DTK-504. Sincronização intra-versão das 6-7 rotas com design pattern único. planned. [gateway]
- F-DTK-505. 40+ métodos HTTP por rota (OPTIONS 204, PUT/DELETE/PATCH 405). planned. [gateway]
- F-DTK-506. Keepalive 200ms + pacing 200-500ms + pausa anti-429 de 1 min entre blocos. planned. [gateway]
- F-DTK-507. Thinking always-on com 7 níveis (none..max) e budget forte por default. planned. [gateway]
- F-DTK-508. Limites V1 98k+98k e V2/V3 68k+68k com autofix de limite. planned. [gateway]
- F-DTK-509. SSE exato OpenAI com reasoning_content antes de content e [DONE] único. planned. [gateway]
- F-DTK-510. Autofix inteligente sem whitelist: normalização (Levenshtein), clamping (margem 1%), tipagem. planned. [gateway]
- F-DTK-511. Anti-429 com backoff exponencial, jitter, Retry-After, mutex e fila waiters. planned. [gateway]
- F-DTK-512. Parser SSE brace-depth com extract_all_json e detecção de [DONE]. planned. [gateway]
- F-DTK-513. makeThinker 4 métodos (reasoning nativo, regex, MARKER, auto-injeção). planned. [gateway]
- F-DTK-514. Parser XML ANY_TAG_RE/PARTIAL_TAG_RE/clean_xml preservando math. planned. [gateway]
- F-DTK-515. V1 em 2 chamadas (Call1 thinking ON, Call2 OFF) com totalOut dinâmico. planned. [gateway-v1]
- F-DTK-516. Detector de input OpenAI/Anthropic/Responses + conversores openaiToAnthropic, openaiToResponses, anthropicToOpenAI, responsesToOpenAI. planned. [gateway]
- F-DTK-517. Saída on-the-fly em 3 formatos base + 20 SDKs. planned. [gateway]
- F-DTK-518. Rota models com CONTEXT_WINDOW 1000000 e catálogo JSON válido. planned. [gateway]
- F-DTK-519. Pool de 22-25 chaves NVIDIA com rotação por requisição. planned. [gateway-v3]
- F-DTK-520. Troca de modelo a cada 6 mensagens round-robin por sessionId. planned. [gateway-v3]
- F-DTK-521. Meta-modelo DevThink com contexto compartilhado via DB. planned. [gateway-v3]
- F-DTK-522. 70+ modelos V3 (1 meta + 14 individuais + 55 embeddings). planned. [gateway-v3]
- F-DTK-523. Renovação de chave V2 por navegação IP novo + reset a cada 60 min/bad-request. planned. [gateway-v2]
- F-DTK-524. Persistência Prisma 500+ entradas (tokens, reasoning, rotações, retries). planned. [gateway]
- F-DTK-525. cdn.ts com 1700+ entradas esm.sh client-side + loadFromCDN + cache Map. planned. [gateway]
- F-DTK-526. db.ts singleton Prisma 7 adapter SQL com cold-start fix. planned. [gateway]
- F-DTK-527. Shim unificado em scripts/shim(.cjs). planned. [gateway]
- F-DTK-528. Testes curl → agent-browser → caddyfile nas portas 3000/21k. planned. [gateway]
- F-DTK-529. Endpoints mínimos 200/204 com JSON em erros e Retry-After no 429. planned. [gateway]
- F-DTK-530. Scripts auxiliares em /scripts (split-conversa-300, read-commits, read-hierarquico, condensar-erros-features). planned. [gateway]
- F-DTK-531. Documentos de processo erros.md + features.md + timeline.md + checklist 900 itens. planned. [gateway]
- F-DTK-532. Modo triplo de leitura (pessoal + 60-70 subagentes + cruzada). planned. [gateway]
- F-DTK-533. Deploy de teste em /tmp para detectar deps faltantes. planned. [gateway]
- F-DTK-534. Pipeline de limpeza final (caches 40+ frameworks, /tmp, dev server). planned. [gateway]
- F-DTK-535. Transmissão real-time sem acumulação de buffer nas lives V1/V3. planned. [gateway]

### Grupo 2 — CLI Z.AI ↔ OpenCode (F-DTK-536..565) [planned, cli]

- F-DTK-536. Plugin @opencode-ai com auth provider zai (browser-session). planned. [cli]
- F-DTK-537. Conexão puppeteer ao Brave persistente na porta 9223. planned. [cli]
- F-DTK-538. Perfil dedicado brave-zai-profile com cache de cookies. planned. [cli]
- F-DTK-539. Stealth plugin + automação desabilitada (anti-detecção). planned. [cli]
- F-DTK-540. Reconexão automática e timeout de 180s. planned. [cli]
- F-DTK-541. Novo chat = nova página + novo ID único. planned. [cli]
- F-DTK-542. Envio da somente-última-mensagem (sem histórico). planned. [cli]
- F-DTK-543. Envio via clipboard (click 3 + Ctrl+V + Enter) anti-lentidão. planned. [cli]
- F-DTK-544. Parse de content_blocks novo com fallback delta_content. planned. [cli]
- F-DTK-545. Stream OpenAI SDK completo (chat.completion.chunk + finish_reason). planned. [cli]
- F-DTK-546. Separação phase thinking/answering no stream. planned. [cli]
- F-DTK-547. Tool call injection via system prompt formato ```tool_call```. planned. [cli]
- F-DTK-548. Execução local de tools (write/edit/read/bash/ls/rm/glob/grep/multiedit etc.). planned. [cli]
- F-DTK-549. Mapeamento remoto→WORKSPACE_DIR com path.join e mkdirs automáticos. planned. [cli]
- F-DTK-550. Verificação de arquivo criado (anti-"fingiu que criou"). planned. [cli]
- F-DTK-551. Bash com cwd do projeto, timeout e maxBuffer. planned. [cli]
- F-DTK-552. Modos por comando @c/@a/@f/@s/@p (chat/agent/fullstack/etc.) sem keyword detection. planned. [cli]
- F-DTK-553. Detecção automática de Agent Mode quando houver tools. planned. [cli]
- F-DTK-554. Persistência de chats em chats.json (chatId, mode, timestamps). planned. [cli]
- F-DTK-555. Anti-loop: nunca reenviar resposta do Z.ai como prompt do usuário. planned. [cli]
- F-DTK-556. Feedback loop: resultados/logs do OpenCode devolvidos à text area do Z.ai. planned. [cli]
- F-DTK-557. Set processedTools anti-duplicação de tool calls. planned. [cli]
- F-DTK-558. Estado global centralizado (state.browser/page/token/chatId/mode). planned. [cli]
- F-DTK-559. Auth por cookie "token" com reuso entre requisições. planned. [cli]
- F-DTK-560. Logs concisos de modo, chat ID, tools e arquivos. planned. [cli]
- F-DTK-561. Tratamento de erro 500 { error } sem crashar o stream. planned. [cli]
- F-DTK-562. Compatibilidade OpenAI SDK total com o OpenCode CLI. planned. [cli]
- F-DTK-563. Modo chat default e tools só em agent mode. planned. [cli]
- F-DTK-564. Reconhecimento de caminhos /home/z/workspace, /workspace, /project. planned. [cli]
- F-DTK-565. Política zero: sem /zai, sem polling, sem watch de arquivos, sem preview URL. planned. [cli]

### Grupo 3 — AIACTIONS / servidor da IA (F-DTK-566..599) [planned, plataforma]

- F-DTK-566. Pasta aiactions unificada (plugins+engines mesclados) com 80+ arquivos .ts. planned. [aiactions]
- F-DTK-567. IA como usuário cadastrado super root admin (@lookup) com aba própria. planned. [aiactions]
- F-DTK-568. aiactions.tsx âncora + aiactionspage.tsx painel admin. planned. [aiactions]
- F-DTK-569. Servidor da IA sempre ativo em porta dedicada. planned. [aiactions]
- F-DTK-570. Skill todolist (protocolo de 12 passos por input). planned. [aiactions]
- F-DTK-571. Skills contextanalyzer + contextcapture + contextcompact (limite de tokens). planned. [aiactions]
- F-DTK-572. Skills planbuilder + questionasker + thinkingmode. planned. [aiactions]
- F-DTK-573. Skills de arquivos: fileread/filewrite/filerename/filemove/filedelete/fileexport/fileimport. planned. [aiactions]
- F-DTK-574. Modo ao vivo: cursor fantasma (mousemove/mouseclick/keyboardtype). planned. [aiactions]
- F-DTK-575. To-do list visual flutuante sempre visível. planned. [aiactions]
- F-DTK-576. Modo oculto (execução direta instantânea). planned. [aiactions]
- F-DTK-577. Modo autônomo admin-only (segundo plano, treina modelos, gera conteúdo). planned. [aiactions]
- F-DTK-578. Skills de geração: image/video/audio/3d/code/site/notes/ad/midi. planned. [aiactions]
- F-DTK-579. Skills verification + testing (verificação e teste de cada passo). planned. [aiactions]
- F-DTK-580. Busca de 30 logs de treinamento similares por input. planned. [aiactions]
- F-DTK-581. Observer gravando todas as ações do usuário na nuvem privada. planned. [aiactions]
- F-DTK-582. Treinamento da IA proprietária com os logs da plataforma. planned. [aiactions]
- F-DTK-583. Aba /iamodels de treinamento de modelos (Kaggle/HuggingFace por link). planned. [aiactions]
- F-DTK-584. Nuvem aimodels/[modelo]/[versão] com verificação de integridade. planned. [aiactions]
- F-DTK-585. Cobrança de storage/processamento no treinamento. planned. [aiactions]
- F-DTK-586. Troca de modelo/chave no chat por plano pago (API própria, local, nuvem, OAuth). planned. [aiactions]
- F-DTK-587. Contexto por usuário [user id]→context→[categoria]→arquivos. planned. [aiactions]
- F-DTK-588. Compactação de contexto com retomada ("paramos em X lugar"). planned. [aiactions]
- F-DTK-589. Skills searchinternet + searchplatform. planned. [aiactions]
- F-DTK-590. Skills apiconnect (Google/Anthropic) com fallback de API. planned. [aiactions]
- F-DTK-591. Skills cloudmanage/tabmanage/projectmanage/layermanage. planned. [aiactions]
- F-DTK-592. Skills renderexport/publish/share/effectapply. planned. [aiactions]
- F-DTK-593. Nodes de geração por IA em todas as abas de edição. planned. [aiactions]
- F-DTK-594. Incorporação/desincorporação de nodes e chats por drag-and-drop. planned. [aiactions]
- F-DTK-595. Auditoria automática do pedido antes de executar (todo list primeiro). planned. [aiactions]
- F-DTK-596. Execução de pedidos em segundo plano para pagantes. planned. [aiactions]
- F-DTK-597. Tabela de status de conversas (iniciadas/respondidas/pausadas) editada pela IA. planned. [aiactions]
- F-DTK-598. Pasta terminal isolada por sandbox para admins e IA. planned. [aiactions]
- F-DTK-599. Múltiplos terminais criáveis pela IA como abas. planned. [aiactions]

### Grupo 4 — Anotepad / Notes como app (F-NPD-001..014) [planned]

- F-NPD-001. App Notes como módulo da plataforma (project_type notes). planned. [anotepad]
- F-NPD-002. Editor de notas flutuantes arrastáveis com posição persistida. planned. [anotepad]
- F-NPD-003. Dashboard com visão geral das notas + gráficos + chat embutido. planned. [anotepad]
- F-NPD-004. Explore de notas com temas e pesquisas em alta como filtros. planned. [anotepad]
- F-NPD-005. Fork de notas de qualquer usuário com registro de origem. planned. [anotepad]
- F-NPD-006. Notas compartilháveis via gerenciamento de postagens (privado/público). planned. [anotepad]
- F-NPD-007. Todo list como formato canônico de nota (- [ ], agrupada, hierárquica, sem duplicatas). planned. [anotepad]
- F-NPD-008. Codebox único por nota com mescla de duplicadas sem remoção de contexto. planned. [anotepad]
- F-NPD-009. Upload e processamento local de arquivos grandes em SPA no navegador. planned. [anotepad]
- F-NPD-010. Skill generatenotes da IA criando notas automaticamente. planned. [anotepad]
- F-NPD-011. Histórico de notas exportado para pasta context da categoria notes. planned. [anotepad]
- F-NPD-012. Versionamento de notas com reversão consistente (projectversions). planned. [anotepad]
- F-NPD-013. Trash de notas com expiração de 30 dias e restauração. planned. [anotepad]
- F-NPD-014. Compactação semanal de logs de notas em ZIP com referência na tabela. planned. [anotepad]

---

## FASE 6b — cadria + argan + owni + cli/vídeo (94 features)

F-CAD-001..026 (26, cadria/iukka+create) · F-ARG-001..028 (28, argan
DNS/DoH/DNSSEC/PKARR) · F-OWN-001..014 (14, owni galeria) · F-DTK-600..625
(26, cli-desktop auth multi-conta + player HLS/DASH/WGSL). Bloco completo:
«onda6b-apps.md § FEATURES».


### cadria (absorve iukka + create) — F-CAD-001+

| ID | Feature | Status | Fonte |
|----|---------|--------|-------|
| F-CAD-001 | Universal Media Player PWA "iukka Player" standalone com window-controls-overlay (shipped) [v1.0.0] «iukka/json/manifest.txt» |
| F-CAD-002 | Manifest completo: 11 ícones + maskable, screenshots narrow/wide, shortcuts (Play, Library) (shipped) [v1.0.0] «iukka/json/manifest.txt» |
| F-CAD-003 | Web Share Target POST multipart para vídeo/áudio/imagem (shipped) [v1.0.0] «iukka/json/manifest.txt» |
| F-CAD-004 | File Handlers para 24 extensões de mídia + protocol handler web+iukka (shipped) [v1.0.0] «iukka/json/manifest.txt» |
| F-CAD-005 | Edge Side Panel 400px e launch_handler navigate-existing (shipped) [v1.0.0] «iukka/json/manifest.txt» |
| F-CAD-006 | Player multi-formato: HLS (hls.js + nativo), DASH (dashjs), FLV (flv.js), video.js + VHS (shipped) [v1.0.0] «iukka/json/package.txt» |
| F-CAD-007 | Visualizador de documentos: PDF (pdfjs-dist), DOCX (mammoth), Markdown (marked), XLSX (xlsx) (shipped) [v1.0.0] «iukka/json/package.txt» |
| F-CAD-008 | Áudio com howler e playlists locais (shipped) [v1.0.0] «iukka/json/package.txt» |
| F-CAD-009 | Sanitização DOMPurify de nomes de arquivo (shipped) [v1.0.0] «iukka/tsx/VideoPlayer.txt» |
| F-CAD-010 | BroadcastChannel + localStorage sync de arquivos e chat entre abas (shipped) [v1.0.0] «iukka/ts/useCommunication.txt» |
| F-CAD-011 | Chat local com mensagens de sistema e merge de estado por id (shipped) [v1.0.0] «iukka/ts/useCommunication.txt» |
| F-CAD-012 | ErrorBoundary global com retry (shipped) [v1.0.0] «iukka/tsx/App.txt» |
| F-CAD-013 | Design System Pro Max: @property neon-hue/border-angle/glow-opacity, paleta cinematográfica, glass blur 80px (shipped) [v1.0.0] «iukka/css/index.txt» |
| F-CAD-014 | Suporte a reduced-motion desligando todas as animações (shipped) [v1.0.0] «iukka/css/index.txt» |
| F-CAD-015 | Plataforma criativa multi-domínio: 3D studio, DAW de áudio, canvas editor, code IDE, chat AI, store, gallery, mockup (shipped) [v1.0.0] «create/md/estrutura.txt» |
| F-CAD-016 | Arquitetura de arquivos âncora (app.tsx → âncora → componentes) (shipped) [v1.0.0] «create/md/featuresupdate.txt» |
| F-CAD-017 | Build sem hashes/ofuscação com assets de nome original (shipped) [v1.0.0] «create/md/featuresupdate.txt» |
| F-CAD-018 | Detecção de ambiente dev/prod com BASE_URL dinâmico (shipped) [v1.0.0] «create/md/featuresupdate.txt» |
| F-CAD-019 | Fluxo auth completo: intro → homepage → Google OAuth → onboarding → projects (planned) [v1.1.0] «create/md/featuresupdate.txt» |
| F-CAD-020 | Fluxo de pagamento plans → checkout → success com servidor próprio (planned) [v1.1.0] «create/md/featuresupdate.txt» |
| F-CAD-021 | Página 404 e rotas administrativas protegidas (planned) [v1.1.0] «create/md/featuresupdate.txt» |
| F-CAD-022 | Supabase storage server (porta 3006): projects, files, trash, quotas via RPC update_storage_usage (shipped) [v1.0.0] «create/ts/storage.txt» |
| F-CAD-023 | Health check /api/storage/health por serviço (shipped) [v1.0.0] «create/ts/storage.txt» |
| F-CAD-024 | Sistema de temas black/white com toggle na topbar (shipped) [v1.0.0] «create/md/estrutura.txt» |
| F-CAD-025 | Catálogo de 16 sets de ícones orquestrados por useicons (planned) [v1.2.0] «create/md/estrutura.txt» |
| F-CAD-026 | ak.js redirecionador cifrado único em produção, Netlify sem Functions (planned) [v1.2.0] «create/md/featuresupdate.txt» |

### argan (DNS/gateway) — F-ARG-001+

| ID | Feature | Status | Fonte |
|----|---------|--------|-------|
| F-ARG-001 | Servidor autoritativo UDP/TCP com mapa de tipos, wildcard, serial e eventos (shipped) [v1.0.0] «dns-argan.txt:180» |
| F-ARG-002 | Cliente DNS e resolvedor com timeout, padrão público e retry em truncamento + fallback TCP (shipped) [v1.0.0] «dns-argan.txt:180» |
| F-ARG-003 | Cliente DoT na 853 contra provedores públicos com reuso de sessão (shipped) [v1.0.0] «dns-argan.txt:181» |
| F-ARG-004 | CLI DoH para grandes provedores (wire/JSON) (shipped) [v1.0.0] «dns-argan.txt:182» |
| F-ARG-005 | Módulo servidor DoH RFC 8484 wire+JSON (planned) [v1.1.0] «dns-argan.txt:204» |
| F-ARG-006 | Cache com TTL alinhado ao HTTP + rate limiting próprio (planned) [v1.1.0] «dns-argan.txt:205» |
| F-ARG-007 | Reverso PTR, EDNS completo com ECS, minimização QNAME e padding (planned) [v1.1.0] «dns-argan.txt:205» |
| F-ARG-008 | Resolvedor recursivo próprio com minimização de QNAME (planned) [v1.2.0] «dns-argan.txt:206» |
| F-ARG-009 | Checador de propagação multi-resolver (10-15 resolvedores paralelos) com modo observação (planned) [v1.2.0] «dns-argan.txt:159,206» |
| F-ARG-010 | Métricas de latência e hit-rate com endpoint leve (planned) [v1.2.0] «dns-argan.txt:206» |
| F-ARG-011 | Zonefile completo 24 tipos com factories (planned) [v1.2.0] «dns-argan.txt:207,185» |
| F-ARG-012 | Rollover automático DNSSEC por CDS/CDNSKEY (planned) [v1.3.0] «dns-argan.txt:207» |
| F-ARG-013 | Validação DNSSEC com verificação criptográfica real (planned) [v1.3.0] «dns-argan.txt:207» |
| F-ARG-014 | Módulo DoQ RFC 9250 com fallback DoH (planned) [v1.3.0] «dns-argan.txt:208» |
| F-ARG-015 | Extensão de browser com resolvedor embutido e regras declarativas (planned) [v1.3.0] «dns-argan.txt:208» |
| F-ARG-016 | Cluster gossip HMAC com adesão autoaprovada e rotas de sincronia/saúde/shard/failover (planned) [v1.4.0] «dns-argan.txt:41,209» |
| F-ARG-017 | Espelhos P2P: CDN versionada, DHT mutável por chave, relays federados, eventos assinados (planned) [v1.4.0] «dns-argan.txt:240» |
| F-ARG-018 | Hardening: RRL, RPZ, ACL sem resolvedor aberto (planned) [v1.4.0] «dns-argan.txt:209» |
| F-ARG-019 | Registradora embutida: rótulo → zona → banco → pipeline → URL imediata (planned) [v1.5.0] «dns-argan.txt:37,158» |
| F-ARG-020 | Modelo pendurado: subdomínios reais sob domínio comprado com wildcard e vhost (planned) [v1.5.0] «dns-argan.txt:36,231» |
| F-ARG-021 | TLD de laboratório isolado com CA privada (planned) [v1.5.0] «dns-argan.txt:233; 00.0.txt:155-185» |
| F-ARG-022 | Painel web com saúde e CRUD autenticado (shipped) [v1.0.0] «dns-argan.txt:169,187» |
| F-ARG-023 | Orquestrador zero-hardcode com WHOIS de disponibilidade e verificação de DNS (shipped) [v1.0.0] «dns-argan.txt:187» |
| F-ARG-024 | DANE/TLSA + ACME dns-01/http-01 com CA privada e staging (shipped) [v1.0.0] «dns-argan.txt:184» |
| F-ARG-025 | CRUD de zonas com parse/serialize (10 tipos parse, 15 factories) (shipped) [v1.0.0] «dns-argan.txt:185» |
| F-ARG-026 | Ponte de nomes descentralizados (validação, conversão TLD, construção de zona) (shipped) [v1.0.0] «dns-argan.txt:186» |
| F-ARG-027 | Scripts cert/serve/publish com ETags, túnel rápido e descoberta aberta (shipped) [v1.0.0] «dns-argan.txt:188» |
| F-ARG-028 | Proxy DoH Node.js standalone com cache-control e CORS (shipped) [v1.0.0] «00.0.txt:660-740» |

### owni — F-OWN-001+

| ID | Feature | Status | Fonte |
|----|---------|--------|-------|
| F-OWN-001 | Galeria Pro Max responsiva com masonry 1-4 colunas (shipped) [v1.0.0] «owni/md/README.txt» |
| F-OWN-002 | Filtro por categoria com contadores (All/Sites/Apps/Tools/Components) (shipped) [v1.0.0] «owni/ts/useGallery.txt» |
| F-OWN-003 | Busca case-insensitive em título/descrição/categoria (shipped) [v1.0.0] «owni/ts/useGallery.txt» |
| F-OWN-004 | VideoCard com badges de formato, duração, dimensões e tamanho (shipped) [v1.0.0] «owni/md/README.txt» |
| F-OWN-005 | AudioCard com waveform dinâmica de 64 barras e toggle de playback (shipped) [v1.0.0] «owni/md/README.txt; tsx/Lightbox.txt» |
| F-OWN-006 | ImageCard com variantes de aspect ratio (tall/normal/wide) (shipped) [v1.0.0] «owni/md/README.txt» |
| F-OWN-007 | Lightbox com backdrop blur 40px, Esc, click-outside e waveform player (shipped) [v1.0.0] «owni/tsx/Lightbox.txt» |
| F-OWN-008 | UploadZone drag-and-drop com estados hover/drop/success e badges de 10 formatos (shipped) [v1.0.0] «owni/tsx/UploadZone.txt» |
| F-OWN-009 | Toasts com timeouts gerenciados por Map (shipped) [v1.0.0] «owni/ts/useGallery.txt» |
| F-OWN-010 | Like toggle com estado de coração (shipped) [v1.0.0] «owni/md/README.txt» |
| F-OWN-011 | Mock data com thumbnails SVG data-URI e waveforms geradas (shipped) [v1.0.0] «owni/ts/galleryData.txt» |
| F-OWN-012 | Hook central useGallery como única fonte de estado (shipped) [v1.0.0] «owni/ts/useGallery.txt» |
| F-OWN-013 | Integração doowni como componente de galeria na plataforma cadria/devthink (planned) [v1.1.0] «absorção Fase 6b» |
| F-OWN-014 | Persistência real de uploads com metadados GalleryItem no storage server (planned) [v1.1.0] «evolução natural documentada» |

### devthink (cli-desktop + video absorvidos) — F-DTK-600+

| ID | Feature | Status | Fonte |
|----|---------|--------|-------|
| F-DTK-600 | AuthManagerImpl com 6 storages (memory/browser/devthink/opencode/codex/claude) (shipped) [v1.0.0] «cli/auth____BLOCOS_EXTRAIDOS.txt:78-105» |
| F-DTK-601 | Tipos de credencial api/oauth/multi com contas multi-provider e rotação (shipped) [v1.0.0] «cli/auth____BLOCOS_EXTRAIDOS.txt:107-135» |
| F-DTK-602 | rotateMultiAccount com ciclo por família (activeIndexByFamily) (shipped) [v1.0.0] «cli/auth____BLOCOS_EXTRAIDOS.txt» |
| F-DTK-603 | Importadores de auth: OpenCode, Codex, Claude e JSONs multi-conta (shipped) [v1.0.0] «cli/auth____BLOCOS_EXTRAIDOS.txt:88-105,235-263» |
| F-DTK-604 | Criptografia AES-256-GCM com cadeia de master key + scrypt fallback (shipped) [v1.0.0] «cli/auth____BLOCOS_EXTRAIDOS.txt:136-150» |
| F-DTK-605 | Cache de auth TTL 30s com invalidação granular (shipped) [v1.0.0] «cli/auth____BLOCOS_EXTRAIDOS.txt:150-165» |
| F-DTK-606 | 20 modos de operação (matriz auth/config/db/memory/cache/browser/ephemeral) (shipped) [v1.0.0] «cli/auth____BLOCOS_EXTRAIDOS.txt:191-217» |
| F-DTK-607 | Persistência total: SQLite devthink.db com fallback JSON por tabela + audit.jsonl (shipped) [v1.0.0] «cli/auth____BLOCOS_EXTRAIDOS.txt:165-190» |
| F-DTK-608 | Detecção de anomalia de auth SSM com embedding + cosine similarity (planned) [v2.0.0] «cli/auth____BLOCOS_EXTRAIDOS.txt:744-800» |
| F-DTK-609 | SSM token generator com SessionData (userId, deviceId, nonce) (planned) [v2.0.0] «cli/auth____BLOCOS_EXTRAIDOS.txt:803-830» |
| F-DTK-610 | Keychain integration (macOS Keychain, Windows Credential Manager) (planned) [v2.0.0] «cli/auth.collection.04.txt:15-16» |
| F-DTK-611 | Secret providers externos (Vault, AWS Secrets Manager) e rotação automática (planned) [v2.0.0] «cli/auth.collection.04.txt:17-20» |
| F-DTK-612 | Rate limiting por IP + CSP + helmet + server password (planned) [v2.0.0] «cli/auth.collection.04.txt:27-36» |
| F-DTK-613 | Supply chain: SHA256, sigstore/cosign, SBOM, Scorecards, Dependabot (planned) [v2.0.0] «cli/auth.collection.04.txt:38-43» |
| F-DTK-614 | OpenAPI 3.1 automática + GET /doc com Swagger UI (planned) [v2.0.0] «cli/auth.collection.04.txt:53-55» |
| F-DTK-615 | Man pages, help interativo TUI e docs multilíngue PT/EN/ES/FR (planned) [v2.0.0] «cli/auth.collection.04.txt:49-52,72» |
| F-DTK-616 | SQLite WAL + índices + compressão de session diffs + sharding por data (planned) [v2.0.0] «cli/auth.collection.04.txt:75-85» |
| F-DTK-617 | Testes de browser com Brave headless CDP e cookies do auth.json (shipped) [v1.0.0] «cli/collection-text-txt-auth-01.txt:5-14» |
| F-DTK-618 | Bypass/verificação de captcha Aliyun com device token z_um e 3 tentativas (shipped) [v1.0.0] «cli/collection-text-txt-auth-01.txt:8-30» |
| F-DTK-619 | @devthink/player: player agnóstico com providers HTML5/HLS/DASH/YouTube/Vimeo (shipped) [v1.0.0] «video/json/package.txt; ts/providers.txt» |
| F-DTK-620 | Filtros WebGPU por compute shader WGSL 16×16 (grayscale/sepia/invert) (shipped) [v1.0.0] «video/js/index__2.txt» |
| F-DTK-621 | StallDetector com auto-recovery (threshold 2s, 3 tentativas, buffer health 2s) (shipped) [v1.0.0] «video/ts/stall.txt» |
| F-DTK-622 | MediaCapabilities checker de decoding/encoding com HDR e colorGamut (shipped) [v1.0.0] «video/ts/codecs.txt» |
| F-DTK-623 | Provider YouTube com privacy mode (nocookie) e Vimeo com dnt=1 (shipped) [v1.0.0] «video/mjs/index.txt» |
| F-DTK-624 | WebAudio EQ e WebSocket/WebRTC no player (planned) [v1.1.0] «video/json/package.txt:4» |
| F-DTK-625 | Player como bin devplayer + exports modulares (15 submódulos) (shipped) [v1.0.0] «video/json/package.txt:14-52» |

---

---

## FASE 7a — changelog extensão devthink + atlases Neo DevThink (50 features)

F-DTK-700..749: núcleo consent-first MV3, gates, MCP, multi-agente, forensics,
pipelines, release 5 canais + atlases de composição. Bloco completo: «onda7a-changelogs.md § FEATURES».


> Formato: - [ ] planned (versão x.0.0 implícita entre colchetes). Fonte: CHANGELOG (8).txt (cada marco de versão vira feature planned) exceto onde notado.

- [ ] F-DTK-700: Núcleo consent-first library-first de extensão browser MV3 com permissões minimizadas (activeTab, storage, scripting, sidePanel), endpoint HTTPS user-entered, sessões active-tab, plan proposals tipadas, gates de aprovação/stop, audit storage local e builds reproduzíveis [v1.1.0]
- [ ] F-DTK-701: Release automation multi-canal a partir de push em main com metadata sincronizada, tag imutável e publicação sem dispatch manual [v1.1.0]
- [ ] F-DTK-702: Target preview de revisão: highlight do alvo resolvido de focus/inspect/click/type durante a review, sem mudar valores, navegar ou requisitar [v1.2.0]
- [ ] F-DTK-703: Catálogo passivo de CRX: inventário de IDs de extensões Chrome com matrizes de permissão/transporte e arquitetura clean-room documentada [v1.2.0]
- [ ] F-DTK-704: Vocabulário de ação consent-first de 63 kinds: pointer/teclado, drag&drop, upload, formulário, scroll, read vocabulary completa, mutação sob review e comandos de browser [v2.0.0]
- [ ] F-DTK-705: Modelo de capacidades opcionais (tabs, downloads, clipboardRead/Write) negociado via permissions api com auditoria de grant [v2.0.0]
- [ ] F-DTK-706: Sessões pausáveis/resumíveis com fechamento automático de planos completos [v1.2.0]
- [ ] F-DTK-707: Observação profunda de 28 kinds read-only: a11ytree com shadow DOM e iframes, reader view, outline, opengraph, detecção de idioma e diffing [v3.0.0]
- [ ] F-DTK-708: Navegação master: containers, deep links, waits de SPA, navlist, safety checks, batch open curado e prefetch/preconnect [v3.0.0]
- [ ] F-DTK-709: Run timeline com watchconsole/watcherrors/watchtasks, spam collapse, rotação e console diff entre runs [v4.0.0]
- [ ] F-DTK-710: Sessão devtools-style instrumentada: attachcdp/cdpcmd/breakpoints/stepcode/watchexpr/overridescript com teardown revisado [v4.0.0]
- [ ] F-DTK-711: Profiling: measureflow, heapshot, trackmemory, profilecpu, watchshifts, traceload, replaytrace e capturesourcemaps [v4.0.0]
- [ ] F-DTK-712: Emulação em camadas com revert exato: device, network, location, user-agent, permissões e blackbox de scripts [v4.0.0]
- [ ] F-DTK-713: Sessões persistentes: checkpoints checksumados, capture/restore com scroll/forms/storage/cookies, diff, busca e export/import revisados [v4.0.0]
- [ ] F-DTK-714: Workflow engine: compose/save/run/dryrun com checkpoints, escopos de variáveis tipados, expressões e templates [v5.0.0]
- [ ] F-DTK-715: Control flow completo: condition/branch/loop/foreach/parallel/trycatch com retry e timeout policies [v5.0.0]
- [ ] F-DTK-716: Trigger engine de 10 kinds: visit/url/menu/key/button/cron/interval/urllist/webhook/event com arm review e manual run preview [v5.0.0]
- [ ] F-DTK-717: Workflow editor visual: canvas com drag&drop, blocos aninhados, minimap, breakpoints, version diff e undo/redo [v5.0.0]
- [ ] F-DTK-718: MCP server no browser: JSON-RPC, tool catalog de 4 namespaces, capability negotiation e stdio bridge [v5.0.0]
- [ ] F-DTK-719: Transporte stream http com TLS, pairing codes de uso único, tokens sha-256, allowlist e approval gates [v5.0.0]
- [ ] F-DTK-720: Streaming completo do protocolo: subscriptions, resource deltas, sampling callbacks, prompt tools, batches, dry runs e tool mocks [v6.0.0]
- [ ] F-DTK-721: Qualquer LLM dirige: provider machinery com 4 protocol styles, modelroute, promptlibrary e guardrails — zero valores hardcoded [v6.0.0]
- [ ] F-DTK-722: Multi-agente swarm: identidades por tab, task queue com lanes, mailboxes, blackboard, budgets e killswitch [v6.0.0]
- [ ] F-DTK-723: Orquestração: leader/worker, planner/executor, critic/verifier, handoffs, locks, merges e progressboard [v6.0.0]
- [ ] F-DTK-724: Sessão como interface: sessiongrid, historysearch, sitenotes, scratchpad, runsummary, semanticrecall, correctionmemory e consentmemory [v6.0.0]
- [ ] F-DTK-725: Segurança core: secretvault, redactshots, schemastrict, origincheck, confirm gates (pay/delete/creds), phishguard e transparencypage [v6.0.0]
- [ ] F-DTK-726: Trust boundary: denydefault, originprofiles, consentwindows, immutable log hash-chained e maskinputs [v6.0.0]
- [ ] F-DTK-727: Interface completa: popup de comando, sidepanel workspace com plancards/diffpreview/timeline, dashboard, options, onboarding e command palette [v6.0.0]
- [ ] F-DTK-728: UI polish: datagrid, exportmenu, quickactions, shortcuts, statusbadge, picker overlay, compareviewer, siteprofiles, dark/light, locale pt/en e a11y labels [v7.0.0]
- [ ] F-DTK-729: Ecosystem: flowlibrary com browse/fork/share, syncbridge opt-in, background run queue, attentionfeed, runreplay e outputcompare [v7.0.0]
- [ ] F-DTK-730: Library headless multi-runtime: planlint, flowrun, exporttools e build esm/cjs/umd para node/bun/deno [v7.0.0]
- [ ] F-DTK-731: Performance: lazymods, incremental snapshots, selcache, virtual lists, stream parse, chunk extract e worker backpressure [v7.0.0]
- [ ] F-DTK-732: Politeness e budgets: batch lanes, adaptive poll, request coalescing, runbudget, battery/network awareness e slowmo replay [v7.0.0]
- [ ] F-DTK-733: Resiliência de run: run state machine, fila offline, idempotency, checkpoints com digest, zombie reap e rollback compensations [v7.0.0]
- [ ] F-DTK-734: State depth: urlhistory, runtimeline com buckets, sessionlock, provenance de memória, encrypt-at-rest, quota watch e audit export [v7.0.0]
- [ ] F-DTK-735: Fleet control: registro com nomes únicos, scopes, budgets, pause isolado, killswitch, reviews entre pares, replay e consenso [v7.0.0]
- [ ] F-DTK-736: Sub-agentes e escala: spawn com depth limit, aggregate report, interleave, lessons, arbitration, priority lanes e cost split [v7.0.0]
- [ ] F-DTK-737: Navegação inteligente: predição navintent, prefetch, deep links, reopen de tabs fechadas, rate limit por domínio e safety heuristics [v7.0.0]
- [ ] F-DTK-738: Data pipelines: stream para disco com cursor, resume, transform com raw retido, dedupe, sample, source stamp e provlog [v7.0.0]
- [ ] F-DTK-739: Web api transports: SSE, long poll, graphql subscriptions, multipart, correlation ids, rate limit respect e cache por run [v7.0.0]
- [ ] F-DTK-740: Vision/OCR: image/region/pdf/frame OCR, vision descriptions, grounding, dom pairing, redaction masks e vision cache [v7.0.0]
- [ ] F-DTK-741: Forensics: before/after captures, console+network timelines, baseline diff, thumbnails, timelapse e capture bundles portáveis [v7.0.0]
- [ ] F-DTK-742: Minimização de dados: local-first stripping, telemetria off por construção, sync opt-in cifrado, purge/export, cookie jars, quarentena e cleanup [v7.0.0]
- [ ] F-DTK-743: CLI de operador completo: manifest checks profundos, planlint, runworkflow, exportdata e headlessmode com exit codes contratuais [v7.0.0]
- [ ] F-DTK-744: Consumo universal: esm/cjs/umd/neutral, adapters por plataforma, engines node/bun/deno e budgets de bundle por target [v7.0.0]
- [ ] F-DTK-745: Servercontract + socket relay: ponte estática site↔extensão com pairing, rotação de token e fila offline [v7.0.0]
- [ ] F-DTK-746: Gateway multi-provider com adapters openai/anthropic/gemini/ollama, routing table, budget tracking e guardrails [v7.0.0]
- [ ] F-DTK-747: Native host bridge + cross-browser: native messaging opcional, wsbridge loopback, firefox xpi, safari skeleton e vsix [v8.0.0]
- [ ] F-DTK-748: Plataforma 2.0: freeze de contratos, apifreeze gate, migrateplan (automa/selenium/vision/csv), recipe gallery de 36, pentest/csp/permdiff gates, readiness de 24 gates e 5 canais de publicação [v8.0.0]
- [ ] F-DTK-749: Polish final auditado: soak sem drift, wcag sweep com ratios 4.5:1/3:1, high contrast theme, style pruning enforce, store package com 6 ícones verificados e banner de sunset v1 com migrateplan [v8.0.0]

---

## FASE 7b — chatinterface "Aura" (99 features F-CTI-001..099)

App NOVO: prefixo F-CTI. Input liquid glass, abas browser-tab, silhueta SVG
runtime, 6 camadas de vidro, PWA dinâmico, player, a11y/i18n/PWA-offline reservas.
Bloco completo: «onda7b-chatinterface.md § FEATURES».


### v1.0.0 — Input premium e abas (shipped no código do corpus)

| ID | Feature | Status | Fonte |
|----|---------|--------|-------|
- F-CTI-001. Caixa de prompt liquid glass com abas browser-tab ancoradas ao topo (shipped) [v1.0.0] «chatiput.txt:7-174»
- F-CTI-002. Duas abas "Faça uma pergunta"/"Agentes" com placeholder dinâmico por aba (shipped) [v1.0.0] «chatiput.txt:298-306»
- F-CTI-003. Contorno gradiente 4 stops em movimento (animateTransform 9s reflect) (shipped) [v1.0.0] «chat.txt:858-872»
- F-CTI-004. Silhueta SVG unificada medida em runtime (useLayoutBounds + ResizeObserver) (shipped) [v1.0.0] «chatiput.txt:2449-2500»
- F-CTI-005. Borda extra outer-only 20px via máscaras outerMaskId/inactiveOuterMaskId (shipped) [v1.0.0] «chat.txt:600-676»
- F-CTI-006. RightTab "Powered by DevThink" emergendo de trás da borda extra (shipped) [v1.0.0] «chat.txt:741-790»
- F-CTI-007. Tween geométrico rAF com lerp + easeOutQuart (contorno acompanha frame a frame) (shipped) [v1.0.0] «chat.txt:443-470»
- F-CTI-008. Squish de raio da aba ativa 18↔14 ao clicar (shipped) [v1.0.0] «chat.txt:492-542»
- F-CTI-009. TAB_SLANT=8 (abas inclinadas) na variante de geometria (shipped) [v1.0.0] «chatinerface.txt:44-50»
- F-CTI-010. 6-7 camadas SVG com path morphing 0.25s e preserveAspectRatio none (shipped) [v1.0.0] «chatinerface.txt:540-790»
- F-CTI-011. Máscara CSS que apaga a linha superior sob a aba ativa (técnica da silhueta) (shipped) [v1.0.0] «conversachatinput.txt:3745-3765»
- F-CTI-012. Fill da aba ativa: linear + radial + gloss + clay filter SVG (shipped) [v1.0.0] «chat.txt:874-920;826-856»
- F-CTI-013. Frost sheen, ambient glow e refraction ring com opacidades theme-aware (shipped) [v1.0.0] «chat.txt:922-976»
- F-CTI-014. Pulse-on-send transitório no contorno (sem duplicar) (shipped) [v1.0.0] «chat.txt:1046-1056»
- F-CTI-015. Textarea auto-height (92px final; 180px na variante com anexos) (shipped) [v1.0.0] «chat.txt:552-560;chatiput.txt:4270-4276»
- F-CTI-016. Enter envia / Shift+Enter nova linha (shipped) [v1.0.0] «chat.txt:1162-1168»
- F-CTI-017. Barra de pílulas de ferramentas: Apps, Canva, Thinking, Search, Deep Research, Media, Audio, Workspace + bot (shipped) [v1.0.0] «chatiput.txt:377-404»
- F-CTI-018. Botão Skills com orbe gradiente e glifo ✦ (shipped) [v1.0.0] «chatinterface.txt:540-552»
- F-CTI-019. Seletor de modelo "Max" com chevron dropdown (shipped) [v1.0.0] «chatinterface.txt:556-572»
- F-CTI-020. Mic + Send como clay buttons com motion hover/tap (shipped) [v1.0.0] «chat.txt:1105-1130»

### v1.0.0 — Mensagens, estados e anexos (shipped)

| ID | Feature | Status | Fonte |
|----|---------|--------|-------|
- F-CTI-021. Feed com auto-scroll ao fim a cada mensagem (shipped) [v1.0.0] «chatiput.txt:216-222»
- F-CTI-022. Bolhas user/ai assimétricas (rounded-tr-sm/tl-sm) com glass distinto (shipped) [v1.0.0] «chatiput.txt:1490-1505»
- F-CTI-023. Indicador de geração pulsante laranja ("Aura está processando...") (shipped) [v1.0.0] «chatiput.txt:234-245»
- F-CTI-024. AnimatePresence popLayout na entrada de mensagens (shipped) [v1.0.0] «chatiput.txt:231-248»
- F-CTI-025. Empty-state centralizado com input relativo (shipped) [v1.0.0] «chatiput.txt:225-236»
- F-CTI-026. Transição input docked/empty 500ms (shipped) [v1.0.0] «chatiput.txt:236»
- F-CTI-027. ResponsePanel com 3 estados (thinking/response/empty) (shipped) [v1.0.0] «chatinterface.txt:640-700»
- F-CTI-028. Thinking com glow pulsante + 3 dots stagger (shipped) [v1.0.0] «chatinterface.txt:648-700»
- F-CTI-029. Response card com citação do prompt e status "Concluído" (shipped) [v1.0.0] «chatinerface.txt:1250-1290»
- F-CTI-030. Empty response com borda dashed e dica de uso (shipped) [v1.0.0] «chatinerface.txt:1295-1305»
- F-CTI-031. Persistência da aba ativa em localStorage (active-tab-state) (shipped) [v1.0.0] «chatinterface.txt:1-14»
- F-CTI-032. Modo demo com resposta simulada (setTimeout 1.2-1.5s) (shipped) [v1.0.0] «chatiput.txt:1462-1472»
- F-CTI-033. Assinatura onSendMessage(text, files?: FileData[]) para anexos (shipped) [v1.0.0] «chatiput.txt:206-212»
- F-CTI-034. AttachedFile com 4 tipos (pdf/image/code/generic) e add/remove (shipped) [v1.0.0] «chatiput.txt:4225-4240»
- F-CTI-035. Silhueta reativa a anexos e altura do input (shipped) [v1.0.0] «chatiput.txt:4122-4165»
- F-CTI-036. Mic visual com anel micPulse laranja (shipped) [v1.0.0] «chat.txt:2100-2112»
- F-CTI-037. Botão + com divisor vertical antes do input (shipped) [v1.0.0] «chatiput.txt:259-263»
- F-CTI-038. Mocks de anexo por tipo com tamanho aleatório (shipped) [v1.0.0] «chatiput.txt:4290-4300»
- F-CTI-039. Pills com estado pressed (clay-btn-pressed) por id (shipped) [v1.0.0] «chat.txt:1226-1250»
- F-CTI-040. Botão "mais opções" com três pontinhos (shipped) [v1.0.0] «chatiput.txt:405-416»

### v1.0.0 — Tema, tokens e design system (shipped)

| ID | Feature | Status | Fonte |
|----|---------|--------|-------|
- F-CTI-041. Dark/light mode com next-themes (attribute class, default dark) (shipped) [v1.0.0] «chat.txt:1096-1104»
- F-CTI-042. SSR dark sem flash (className dark + suppressHydrationWarning) (shipped) [v1.0.0] «chat.txt:32-39»
- F-CTI-043. Tokens chat-* completos por tema (page/card/fills/textos/glow/blobs) (shipped) [v1.0.0] «chat.txt:1262-1280»
- F-CTI-044. Família clay (.clay-btn/.clay-btn-sm/.clay-btn-pressed/.clay-dropdown/.clay-card) (shipped) [v1.0.0] «chat.txt:1735-1830»
- F-CTI-045. send-btn gradiente 5 stops + variante refraction (fonte 26) (shipped) [v1.0.0] «chat.txt:1892-1925;1464-1466»
- F-CTI-046. PRO badge gradiente multicolor com insets (shipped) [v1.0.0] «chat.txt:1928-1938»
- F-CTI-047. liquid-glass-authentic (5-layer box-shadow, blur 50px) (shipped) [v1.0.0] «chat.txt:1948-1975»
- F-CTI-048. Variantes glass/glass-card/floating-rail para cards externos (shipped) [v1.0.0] «chat.txt:1978-2010»
- F-CTI-049. text-gradient-orange (background-clip text) (shipped) [v1.0.0] «chat.txt:2013-2018»
- F-CTI-050. Aurora background com blobs por paleta da aba ativa (shipped) [v1.0.0] «chat.txt:348-352;1104-1140»
- F-CTI-051. Theme toggle Sun/Moon clay (shipped) [v1.0.0] «chat.txt:1153-1160»
- F-CTI-052. Tokens de fontes mapeados por comentário (sources 5/16/24-27/31) (shipped) [v1.0.0] «chat.txt:1390-1462»

### v1.0.0 — PWA chrome do chatinterface (shipped)

| ID | Feature | Status | Fonte |
|----|---------|--------|-------|
- F-CTI-053. Manifest web dinâmico por host (standalone, theme #000000) (shipped) [v1.0.0] «grok-pwa-shared.txt:114-134»
- F-CTI-054. Página de tutorial de instalação iOS (?install=1&platform=ios) (shipped) [v1.0.0] «grok-pwa-plugin.txt:37-52»
- F-CTI-055. Injeção idempotente de head tags (só faltantes) (shipped) [v1.0.0] «grok-pwa-shared.txt:341-365»
- F-CTI-056. OG/Twitter card canônico com strip de metas duplicadas (shipped) [v1.0.0] «grok-pwa-shared.txt:289-300»
- F-CTI-057. og:image custom (public/og.jpg|png) ou placeholder com cor hex (shipped) [v1.0.0] «grok-pwa-shared.txt:271-286»
- F-CTI-058. Banner x:game:image 1200×264 para apps tipo x:game (shipped) [v1.0.0] «grok-pwa-shared.txt:279-286»
- F-CTI-059. snapshotOgIdentity baked no bundle (deploy sem workspace FS) (shipped) [v1.0.0] «grok-pwa-shared.txt:213-231»
- F-CTI-060. extensions.js da plataforma com grok-project-id/grok:app_id (shipped) [v1.0.0] «grok-pwa-shared.txt:160-200»
- F-CTI-061. Metas x:creator/x:creator:id para autoria (shipped) [v1.0.0] «grok-pwa-shared.txt:180-200»
- F-CTI-062. Streaming head injector (buffer só até </head>, early flush preservado) (shipped) [v1.0.0] «grok-pwa-shared.txt:400-476»
- F-CTI-063. Modo passthrough para respostas comprimidas (gzip intacto) (shipped) [v1.0.0] «grok-pwa-plugin.txt:104-125»
- F-CTI-064. requestHost com x-forwarded-host/host/:authority (shipped) [v1.0.0] «grok-pwa-plugin.txt:15-21»
- F-CTI-065. Guardas isDocumentPath/acceptsHtml (não injetar em assets/API) (shipped) [v1.0.0] «grok-pwa-shared.txt:66-82»
- F-CTI-066. apple-touch-icon + status-bar black + theme-color (iOS) (shipped) [v1.0.0] «grok-pwa-shared.txt:136-158»
- F-CTI-067. Nome do app derivado do slug *.grok.me (Title Case) (shipped) [v1.0.0] «grok-pwa-shared.txt:29-46»
- F-CTI-068. Virtual module grok-og-identity para o bundle Vite (shipped) [v1.0.0] «grok-pwa-plugin.txt:164-172»
- F-CTI-069. transformIndexHtml dev injection (shipped) [v1.0.0] «grok-pwa-plugin.txt:174-178»
- F-CTI-070. Metade Nitro/server para apps deployados (shared único) (shipped) [v1.0.0] «grok-pwa-plugin.txt:1-5»
- F-CTI-071. Suíte node:test de idempotência/OG/manifest (shipped) [v1.0.0] «grok-pwa-plugin.test.txt:22-241»
- F-CTI-072. stripInstallParams: link limpo do app após tutorial (shipped) [v1.0.0] «grok-pwa-shared.txt:84-94»

### v1.0.0 — Qualidade, performance e workflow (shipped)

| ID | Feature | Status | Fonte |
|----|---------|--------|-------|
- F-CTI-073. no-scrollbar global triplo-engine (shipped) [v1.0.0] «chatiput.txt:7798-7820»
- F-CTI-074. Reset global de focus rings/tap highlight/overscroll (shipped) [v1.0.0] «chatiput.txt:7790-7836»
- F-CTI-075. ::selection laranja temática (shipped) [v1.0.0] «chatiput.txt:7838-7844»
- F-CTI-076. Scroll suave + momentum-scroll no feed (shipped) [v1.0.0] «chatiput.txt:7848-7850;11332-11336»
- F-CTI-077. aria-label em todos os botões-ícone (shipped) [v1.0.0] «chatiput.txt:98;8014;8038»
- F-CTI-078. aria-pressed nas abas (shipped) [v1.0.0] «chat.txt:1092»
- F-CTI-079. ResizeObserver apenas no container (performance) (shipped) [v1.0.0] «timeline1chatiput.txt:105»
- F-CTI-080. Cleanup completo de rAF/observer/timeout nos effects (shipped) [v1.0.0] «chatiput.txt:2480-2500»
- F-CTI-081. Dedup SHA-256 das variantes antes do merge (shipped) [v1.0.0] «timeline1chatiput.txt:1-4»
- F-CTI-082. Verificação visual agent-browser + VLM em light/dark (planned) [v1.1.0] «timeline1chatiput.txt:111»
- F-CTI-083. Lint limpo + checagem mobile no fluxo de aceite (planned) [v1.1.0] «timeline1chatiput.txt:111»
- F-CTI-084. lib/geometry exportada (paths + constantes tipadas) (shipped) [v1.0.0] «chatinerface.txt:41-145»
- F-CTI-085. IDs de gradiente SVG únicos por instância (useId) (shipped) [v1.0.0] «chat.txt:844-856»
- F-CTI-086. Tabs com forwardRef para medição externa (shipped) [v1.0.0] «chatiput.txt:2825-2840»
- F-CTI-087. Re-cálculo de geometria pós-mount via dispatch resize (shipped) [v1.0.0] «chatinerface.txt:480-486»
- F-CTI-088. Clamp minLeft anti-invasão do canto da caixa (shipped) [v1.0.0] «chat.txt:475-477»
- F-CTI-089. Saddle adaptativo s = min(saddle, gap/2, left/2) (shipped) [v1.0.0] «chatiput.txt:2620-2621»
- F-CTI-090. Artefato HTML único com CSS Houdini + Tailwind inline e pacote ZIP de entrega (planned) [v1.1.0] «timeline1chatiput.txt:18;110»

### Reserva v1.1.0+ (demanda explícita do dono, não codificada no corpus)

| ID | Feature | Status | Fonte |
|----|---------|--------|-------|
- F-CTI-091. PWA offline storage (cache de assets + IndexedDB) herdado do padrão do player (planned) [v1.1.0] «O-QUE-FALTA.txt:137-148»
- F-CTI-092. Plugin system de UI do chat (CorePlugin/UIPlugin/ContainerPlugin) (planned) [v1.2.0] «O-QUE-FALTA.txt:99-110»
- F-CTI-093. A11y WAI-ARIA completa (roles, aria-live, focus management) (planned) [v1.1.0] «O-QUE-FALTA.txt:112-122»
- F-CTI-094. i18n dos textos do chat via Record<string,string> (planned) [v1.1.0] «O-QUE-FALTA.txt:124-135»
- F-CTI-095. Bindings React/Vue/Svelte do componente de chat (planned) [v1.2.0] «O-QUE-FALTA.txt:136»
- F-CTI-096. llms.txt do chatinterface para agentes de IA (planned) [v1.2.0] «PESQUISA-CONCORRENCIA.txt:60»
- F-CTI-097. Múltiplas skins do chat (frosted/minimal) como presets (planned) [v1.2.0] «PESQUISA-CONCORRENCIA.txt:41-50»
- F-CTI-098. Skins theme-aware com stats overlay do chat (latência/tokens) (planned) [v1.2.0] «COMPARATIVO-CONCORRENCIA.txt:1.6»
- F-CTI-099. Compartilhamento do chat (Web Share + OG card por conversa) (planned) [v1.2.0] «grok-pwa-shared.txt:289-300»

---

## FASE 7c — linhagem opencode (85 features F-DTK-750..834)

V4→V32: escada de variants, all-free, exact-ids, 60K context, no-thinking,
fix-500, GPT-6 Astra 360 models/43 providers, antigravity→maene, PKCE loopback.
Bloco completo: «onda7c-opencode.md § FEATURES».


| ID | Feature (planned — capacidade nova introduzida pela versão/fonte) | Fonte |
|----|-------------------------------------------------------------------|-------|
| F-DTK-750 | Config opencode base: 40 providers/299 models com @ai-sdk/openai-compatible, limits e modalities declarados (planned) [V-corrigido] «opencode.txt» |
| F-DTK-751 | Providers commandcode + venice para model stealth ox-alpha (planned) [V-corrigido+cc] «opencode (5).txt» |
| F-DTK-752 | Provider kilo com 18 models `:free` via gateway api.kilo.ai (planned) [base+kilo] «opencode (6).txt» |
| F-DTK-753 | Config DEFINITIVO 43 providers — catálogo fechado pré-auditoria (planned) [V3] «Opencode-DEFINITIVO (1).txt» |
| F-DTK-754 | Correção incremental de catálogo kilo/openrouter (+8 models) (planned) [DEF-CORRIGIDO] «Opencode-DEFINITIVO-CORRIGIDO (1).txt» |
| F-DTK-755 | Correção de IDs em massa kilo/nvidia/openrouter (planned) [DEF-CORRIGIDO-V2] «Opencode-DEFINITIVO-CORRIGIDO-V2.txt» |
| F-DTK-756 | Validação por modelo: 26 IDs conferidos contra catálogo do provider (planned) [VALIDADO-POR-MODELO] «Opencode-FINAL-VALIDADO-POR-MODELO.txt» |
| F-DTK-757 | Congelamento SEM-BAGUNCA: baseline 348 models estáveis p/ versionamento FINAL (planned) [V4] «Opencode-FINAL-V4-SEM-BAGUNCA.txt» |
| F-DTK-758 | Reasoning como objeto {effort,enabled,exclude} (planned) [V5] «Opencode-FINAL-V5-REASONING-OBJECT.txt» |
| F-DTK-759 | Full thinking: effort max universal na família kilo (planned) [V6] «Opencode-FINAL-V6-FULL-THINKING.txt» |
| F-DTK-760 | Verificação de suporte: chat_template_kwargs só em providers compatíveis (planned) [V7] «Opencode-FINAL-V7-VERIFICADO.txt» |
| F-DTK-761 | Chat template expandido a 101 models thinking após verificação (planned) [V10] «Opencode-FINAL-V10-COM-CHAT-TEMPLATE.txt» |
| F-DTK-762 | Variante de config com plugin maene em paralelo ao antigravity (planned) [V10-maene] «opencod5e.txt» |
| F-DTK-763 | Rollout kimi-k3 em nvidia + opencode zen (planned) [V12] «Opencode-FINAL-V12-KIMI-K3-CORRIGIDO.txt» |
| F-DTK-764 | Merge: plugin maene oficial + reasoning objeto universal + kimi-k3 em 4 providers (planned) [V13] «Opencode-FINAL-V13-MERGED-CORRIGIDO.txt» |
| F-DTK-765 | Escada de variants com limites de output reais 16384/32768/49152/65536/82000 (planned) [V14] «Opencode-FINAL-V14-COM-LIMITES.txt» |
| F-DTK-766 | Auditoria 100%: reasoning null nos não-thinking + remoção de model fantasma (planned) [V16] «Opencode-FINAL-V16-100-AUDITADO.txt» |
| F-DTK-767 | Padronização top_p 0.95 em 207 models (planned) [V17] «Opencode-FINAL-V17-TOP-P-095.txt» |
| F-DTK-768 | Explosão all-free: +139 models free em 3 providers + variante none (planned) [V18] «Opencode-FINAL-V18-ALL-FREE.txt» |
| F-DTK-769 | Modo somente-max: colapso de variants ao degrau máximo (planned) [V19] «Opencode-FINAL-V19-SOMENTE-MAX.txt» |
| F-DTK-770 | Prune por IDs exatos: −123 models, núcleo de 8 zen free + kilo 47 (planned) [V20] «Opencode-FINAL-V20-EXACT-IDS.txt» |
| F-DTK-771 | Nomes de UI estilo catálogo vendor (planned) [V21] «Opencode-FINAL-V21-CORRECT-NAMES.txt» |
| F-DTK-772 | Nomes de UI simplificados sem vendor prefix (planned) [V22] «Opencode-FINAL-V22-SIMPLE-NAMES (1).txt» |
| F-DTK-773 | Correção de IDs meta-spark→muse-spark (planned) [V23] «Opencode-FINAL-V23-CORRECT-IDS.txt» |
| F-DTK-774 | Experimento de output mínimo no contributer model (bug 60) (planned) [V24] «Opencode-FINAL-V24-MUSE-SPARK (1).txt» |
| F-DTK-775 | Fix 60K: output 60000 no muse-spark (planned) [V25] «Opencode-FINAL-V25-60K (1).txt» |
| F-DTK-776 | Merge de provider espelho: opencodez eliminado (planned) [V26] «Opencode-FINAL-V26-MERGED.txt» |
| F-DTK-777 | Contexto real declarado (131072/1048576) + out 60000 nos zen free (planned) [V27] «Opencode-FINAL-V27-REAL-CONTEXT-60K.txt» |
| F-DTK-778 | Modo no-thinking: variante `none:{}` primeiro em todos os models + variants neutros (planned) [V28] «Opencode-FINAL-V28-NO-THINKING.txt» |
| F-DTK-779 | Provider paralelo opencode-responses para contornar HTTP 500 (planned) [V29] «Opencode-FINAL-V29-FIX-500.txt» |
| F-DTK-780 | Consolidar em provider único (opencode) pós-fix (planned) [V30] «Opencode-FINAL-V30-SINGLE-PROVIDER (1).txt» |
| F-DTK-781 | Provider experientiallabs + GPT-6 Astra minimal (planned) [V31] «Opencode-FINAL-V31-GPT6-ASTRA-SIMPLE.txt» |
| F-DTK-782 | GPT-6 Astra completo: ctx 1,05M / out 128k / effort max / variants (planned) [V32] «Opencode-FINAL-V32-GPT6-ASTRA-FIXED.txt» |
| F-DTK-783 | Portabilidade de config para Kilo Code via schema swap (planned) [Kilo-V32] «Kilo-FINAL-V32-GPT6-ASTRA-FIXED.txt» |
| F-DTK-784 | Conversão antecipada da base para app.kilo.ai (planned) [Kilo-CONVERTIDO] «Kilo-CONVERTIDO.txt» |
| F-DTK-785 | Pooling de quota com 16 réplicas mimo-1..16 de chaves distintas (planned) [V32] «V32 (jq)» |
| F-DTK-786 | Réplica canário de provider em domínio alternativo (railway/gitlawb) (planned) [V32] «V32 (jq mimo-8/14)» |
| F-DTK-787 | Provider próprio devthink sem apiKey (auth por cookie da sandbox) no config do CLI (planned) [base..V32] «jq .provider.devthink» |
| F-DTK-788 | Modelo devthink com contexto agregado 4,78M via gateway V4 (planned) [base..V32] «jq devthink ctx» |
| F-DTK-789 | 7 canais redundantes para glm-5.2 (zai/babel/cline/megallm/zenmux/gmi/fusion) (planned) [V32] «V32 (jq)» |
| F-DTK-790 | Model stealth ox-alpha por 3 vendors (commandcode/venice/openrouter) (planned) [V32] «V32 (jq)» |
| F-DTK-791 | Provider de métrica de catálogo (llm-stats) como fonte de models (planned) [V32] «V32 (jq)» |
| F-DTK-792 | Provider local ollama (127.0.0.1:11434) com models *:cloud (planned) [base..V32] «V32 (jq)» |
| F-DTK-793 | Providers "next-*" para testar nova geração de gateway sem tocar o estável (planned) [V32] «V32 (jq)» |
| F-DTK-794 | Auth OAuth PKCE com callback em porta aleatória locked 127.0.0.1 (planned) [auth-V5] «opencode (4).txt:6013» |
| F-DTK-795 | Storage multi-conta v3 (antigravity-accounts.json) com activeIndexByFamily e rateLimitResetTimes (planned) [auth-V5] «opencode (4).txt:5999,6015» |
| F-DTK-796 | Escrita atômica tmp+rename, chmod 600/0700 e lock file com stale detection (planned) [auth-V1+] «opencode (4).txt:328» |
| F-DTK-797 | Rotação Robin Hood de contas com soft quota em 90% (planned) [auth-V4] «opencode (4).txt:6015» |
| F-DTK-798 | Dual quota Antigravity + Gemini CLI com opção cli_first (planned) [auth-V4] «opencode (4).txt:360» |
| F-DTK-799 | Bypass Project ID dual (ideType ANTIGRAVITY→GEMINI) + fallback rising-fact-p41fc (planned) [auth-V4/V5] «opencode (4).txt:6017» |
| F-DTK-800 | Refresh de token com double-checked locking (planned) [auth-V4] «opencode (4).txt:6017» |
| F-DTK-801 | Transformação de request: cleanSchema protobuf-strict + sanitizeToolName + mapBudget (planned) [auth-V4] «opencode (4).txt:334,6019» |
| F-DTK-802 | Cadeia de fallback de IDs de model antigravity-* → IDs reais (planned) [auth-V4] «opencode (4).txt:334» |
| F-DTK-803 | Thinking signature caching com LRU (planned) [auth-V4] «opencode (4).txt:6001» |
| F-DTK-804 | google_search grounding como tool opcional do plugin (planned) [auth-V4] «opencode (4).txt:306» |
| F-DTK-805 | Image generation com OPENCODE_IMAGE_ASPECT_RATIO e safety BLOCK_NONE (planned) [auth-V4] «opencode (4).txt:6019» |
| F-DTK-806 | Version dinâmica: remote→changelog-scrape→hardcoded com cache 24h (planned) [auth-V4] «opencode (4).txt:344» |
| F-DTK-807 | Debug logging com rotação, TUI buffer circular e redação de segredos (planned) [auth-V4] «opencode (4).txt:356» |
| F-DTK-808 | CLI de contas interativa (login/add/list/enable/disable/set-active/remove) zero-deps (planned) [auth-V4] «opencode (4).txt:363» |
| F-DTK-809 | Descoberta de project ID com timeout 10s e retry PROD/DAILY/SANDBOX (planned) [auth-V4] «opencode (4).txt:369» |
| F-DTK-810 | Pacote npm publicável opencode-antigravity-auth-next (main/bin/peerDeps/engines) (planned) [auth-V4/V5] «opencode (4).txt:372,5982» |
| F-DTK-811 | Artefato único: pasta blindada nome curto + zip nível 9 + FLUXOGRAMA.md (planned) [auth-V5] «opencode (4).txt:6095-6107» |
| F-DTK-812 | Align de fingerprint: UA antigravity/{ver} sem X-Goog-QuotaUser/X-Client-Device-Id (planned) [auth-V5] «opencode (4).txt:5980,6001» |
| F-DTK-813 | Smoke test CLI: opencode auth login/list + run --variant=high (planned) [auth-V5] «opencode (4).txt:6103-6105» |
| F-DTK-814 | Re-auditoria contra concorrentes (9router/omnirouter/gemini-cli) por release (planned) [auth-V5] «opencode (4).txt:5988-6009» |
| F-DTK-815 | Prefix routing gc/cc/kr/vertex + model matrix (padrão 9router) (planned) [pesquisa] «opencode (4).txt:6005» |
| F-DTK-816 | Keepalive de Project ID 30s anti-ban 403 (padrão OmniRoute) (planned) [pesquisa] «opencode (4).txt:6007» |
| F-DTK-817 | Cache SHA256 TTL 1h para metadata (padrão Gemini CLI) (planned) [pesquisa] «opencode (4).txt:6011» |
| F-DTK-818 | Sticky account selection até exaustão de quota (padrão shekohex) (planned) [pesquisa] «opencode (4).txt:306» |
| F-DTK-819 | Onboarding LRO com polling de operations (padrão Gemini CLI) (planned) [pesquisa] «opencode (4).txt:6011» |
| F-DTK-820 | Dedup de linhagem por diff canônico jq -cS (método de engenharia) (planned) [processo] «método desta onda» |
| F-DTK-821 | Digest estrutural jq (providers/models/limits) como pré-leitura de configs gigantes (planned) [processo] «método desta onda» |
| F-DTK-822 | Versionamento por sufixo descritivo do patch no nome do arquivo (planned) [processo] «arquivos V*» |
| F-DTK-823 | Um patch por versão (atomicidade de bissecção) (planned) [processo] «tabela de versões» |
| F-DTK-824 | Checkpoints de imutabilidade em providers sagrados (devthink) ao longo da linhagem (planned) [processo] «jq devthink 7 checkpoints» |
| F-DTK-825 | Validação JSON completa antes de arquivar versão (planned) [processo] «jq -e 35 configs» |
| F-DTK-826 | Espelho A/B temporário de providers free com remoção pós-auditoria (planned) [V18→V26] «diffs V18/V20/V26» |
| F-DTK-827 | Prune de modelos fantasma por comparação com catálogo oficial (planned) [V20] «comm V19→V20» |
| F-DTK-828 | Correção de contexto fictício para contexto real aceito pelo endpoint (planned) [V27] «diff V26→V27» |
| F-DTK-829 | Variante none como seleção de primeira classe para no-thinking (planned) [V28] «V28:8660» |
| F-DTK-830 | Transport swap como fix de 5xx (provider responses paralelo) (planned) [V29] «diff V28→V29» |
| F-DTK-831 | Entrada minimal de flagship novo + fix de limites na versão seguinte (planned) [V31/V32] «diff V31→V32» |
| F-DTK-832 | Plugin de memória dupla: memsearch (busca) + universal-memory (sessão) (planned) [base..V32] «jq .plugin» |
| F-DTK-833 | Plugin maene de spoof de headers por provider (chat.headers) (planned) [V13+] «jq .plugin V13» |
| F-DTK-834 | Catálogo ALL_MODELS_2026 embarcado no plugin compartilhado com o config (planned) [auth-V4] «opencode (4).txt:322,363» |

---

## FASE 7d — design neodevthink (50 features F-DTK-850..899)

Temas Neo DevThink, botão-disc, header-glass clip-path, cutouts, tabs côncavas,
laptop/phone/folder/torus CSS, gauge SVG glow, feTurbulence, dialogs ::backdrop,
liquid-glass Qwen, wordmark colossal, FAUN.
Bloco completo: «onda7d-design-css2.md § FEATURES».


| ID | Feature | Status | Fonte |
|----|---------|--------|-------|
| F-DTK-850 | Sistema de 5 temas trocáveis (default/dark/sunset-royal/nordic-forest/pitch-black) via tokens por metáfora (shipped) «theme-*.css» |
| F-DTK-851 | Tema AMOLED pitch-black com glass fino (blur 40px saturate 220%) e neon ciano/magenta/lime (shipped) «theme-pitch-black(1).css» |
| F-DTK-852 | Tema com seleção de texto colorida por tema (--selection-color) (shipped) «theme-default(1).css» |
| F-DTK-853 | Sombra premium de 2 camadas tokenizada por tema (--shadow-premium) (shipped) «theme-dark(1).css» |
| F-DTK-854 | Dark mode por atributo data-theme com 6 tokens trocados + color-scheme (shipped) «index(115).css:32-40» |
| F-DTK-855 | Skip-link de acessibilidade universal (teclado primeiro) (shipped) «index(138).css:58-74» |
| F-DTK-856 | Foco visível customizado com offset 3-5px em todo controle (shipped) «index(21).css:33» |
| F-DTK-857 | prefers-reduced-motion: matar animações/transições globalmente com exceção lista (shipped) «index(174).css:317-321» |
| F-DTK-858 | Header-pill flutuante com contração no scroll (top 20→12, blur escurece) (shipped) «kroma(1).css:305-334» |
| F-DTK-859 | Barra de progresso de leitura dentro da nav (scaleX com origin left) (shipped) «index(21).css:90» |
| F-DTK-860 | Vidro de header recortado por clip-path sem cortar os links (shipped) «index(21).css:75;index(150).css:85» |
| F-DTK-861 | Active-tab com ponte côncava sobre a borda da nav (shipped) «index(147).css:13-16» |
| F-DTK-862 | Badge circular giratório com texto em textPath (selo giratório) (shipped) «kroma(1).css:173-233» |
| F-DTK-863 | Botão-pill com disc interno que gira 45° no hover (gesto de ação) (shipped) «kroma(1).css:113-115» |
| F-DTK-864 | Waveform visualizador CSS puro com estado is-playing (shipped) «kroma(1).css:275-303» |
| F-DTK-865 | Radar achievement com 3 anéis SVG + ícones-orbit + botão central (shipped) «kroma(1).css:87-195» |
| F-DTK-866 | Chips de like/save com estado afetivo colorido (is-liked rosa) (shipped) «kroma(1).css:246-250» |
| F-DTK-867 | Serpentine chain grid com nós de geometria mista (círculo/cápsula/vertical) (shipped) «kroma(1).css:252-349» |
| F-DTK-868 | Aurora pods com glow-color por item como estado selecionado (shipped) «kroma(1).css:439-442» |
| F-DTK-869 | Mockup de laptop 100% CSS com notch e trackpad (shipped) «kroma(1).css:638-696» |
| F-DTK-870 | Screen-switcher vertical com dot-indicator e check (shipped) «kroma(1).css:121-149» |
| F-DTK-871 | Slider bicolor (gradiente no track, thumb com borda do 2º stop) (shipped) «kroma(1).css:394-413» |
| F-DTK-872 | Botão-cunha com clip-path notch e hover deslizante (shipped) «kroma(1).css:428-456» |
| F-DTK-873 | Wallet glass central com satélites-pill e dots neon (shipped) «kroma(1).css:446-511» |
| F-DTK-874 | Footer com wordmark colossal e asterisco giratório (shipped) «kroma(1).css:487-506» |
| F-DTK-875 | Pricing com tier destacado dark + stamp flutuante + badge current (shipped) «kroma(1).css:172-268» |
| F-DTK-876 | FAQ numerado com chevron que rotaciona e colore (shipped) «kroma(1).css:333-380» |
| F-DTK-877 | Cortes de canto invertidos por box-shadow deslocado (cutout) (shipped) «index(104).css:62-64;index(21).css:111-112» |
| F-DTK-878 | Mosaic de janelas com mix-blend luminosity no hover (shipped) «index(138).css:303-317» |
| F-DTK-879 | Stadium columns de fotos com badge na interseção (shipped) «index(138).css:513-608» |
| F-DTK-880 | Fan de pastas 3D CSS com aba, shine e un-tilt no hover (shipped) «index(104).css:70-86» |
| F-DTK-881 | Headline de word-pills coloridas rotacionadas com inner highlight (shipped) «index(104).css:37-47» |
| F-DTK-882 | Hero blob com clip-path estrela + dashmarch em linhas vivas (shipped) «index(104).css:20-23» |
| F-DTK-883 | Torus/materiais flutuantes mascarados com floaty (shipped) «index(104).css:31-36» |
| F-DTK-884 | Carrossel de momentos com profundidade por altura/rotação variável (shipped) «index(166).css:79-88» |
| F-DTK-885 | Gauge SVG físico com ticks, glow no arco e transição de dasharray (shipped) «index(166).css:48-63» |
| F-DTK-886 | Ruído fractal feTurbulence via SVG data-URI (grão calibrável) (shipped) «index(166).css:5;index(181).css:114» |
| F-DTK-887 | Laboratório de materiais com variável --intensity (chrome/glass/mesh/glow/depth) (shipped) «index(181).css:130-153» |
| F-DTK-888 | Colorway por filter (graphite/cream) sem assets extras (shipped) «index(174).css:256-258» |
| F-DTK-889 | Sound orb conic-gradient com pulso de reprodução (shipped) «index(174).css:156-160» |
| F-DTK-890 | Closing block com notch radial para encaixe de orb (shipped) «index(174).css:155» |
| F-DTK-891 | Filter-bar côncava com bridge radial-gradient (junção curva) (shipped) «index(174).css:284-287» |
| F-DTK-892 | Mini-player persistente glass com texto truncado (shipped) «index(174).css:187-192» |
| F-DTK-893 | Dialog nativo <dialog> com ::backdrop blur e close rotativo (shipped) «mova-panels(1).css:1-5» |
| F-DTK-894 | Sistema de dialogs multi-tamanho por classe (search/track/plan/tour) (shipped) «sol-panels:243-247» |
| F-DTK-895 | Quiz multi-etapas com progresso segmentado e opções-card selecionáveis (shipped) «index(115).css:16-57» |
| F-DTK-896 | Toast pill com check circular e dismiss (shipped) «index(138).css:727-764» |
| F-DTK-897 | Catálogo de paleta/type-specimen embutido no produto (atlas) (shipped) «kroma-panels(1).css:762-800;sol-panels:229-234» |
| F-DTK-898 | Marquee inclinado com pausa no hover (ticker de banda) (shipped) «index(116).css:36-45» |
| F-DTK-899 | Gerador de páginas com page-plan JSON + componentes endereçados por data-component-id (planned) «designe.txt:48114-48135» |

---
## FASE 7a — changelog extensão devthink + atlases Neo DevThink (50 features)

F-DTK-700..749: núcleo consent-first MV3, gates, MCP, multi-agente, forensics,
pipelines, release 5 canais + atlases de composição. Bloco completo: «onda7a-changelogs.md § FEATURES».


> Formato: - [ ] planned (versão x.0.0 implícita entre colchetes). Fonte: CHANGELOG (8).txt (cada marco de versão vira feature planned) exceto onde notado.

- [ ] F-DTK-700: Núcleo consent-first library-first de extensão browser MV3 com permissões minimizadas (activeTab, storage, scripting, sidePanel), endpoint HTTPS user-entered, sessões active-tab, plan proposals tipadas, gates de aprovação/stop, audit storage local e builds reproduzíveis [v1.1.0]
- [ ] F-DTK-701: Release automation multi-canal a partir de push em main com metadata sincronizada, tag imutável e publicação sem dispatch manual [v1.1.0]
- [ ] F-DTK-702: Target preview de revisão: highlight do alvo resolvido de focus/inspect/click/type durante a review, sem mudar valores, navegar ou requisitar [v1.2.0]
- [ ] F-DTK-703: Catálogo passivo de CRX: inventário de IDs de extensões Chrome com matrizes de permissão/transporte e arquitetura clean-room documentada [v1.2.0]
- [ ] F-DTK-704: Vocabulário de ação consent-first de 63 kinds: pointer/teclado, drag&drop, upload, formulário, scroll, read vocabulary completa, mutação sob review e comandos de browser [v2.0.0]
- [ ] F-DTK-705: Modelo de capacidades opcionais (tabs, downloads, clipboardRead/Write) negociado via permissions api com auditoria de grant [v2.0.0]
- [ ] F-DTK-706: Sessões pausáveis/resumíveis com fechamento automático de planos completos [v1.2.0]
- [ ] F-DTK-707: Observação profunda de 28 kinds read-only: a11ytree com shadow DOM e iframes, reader view, outline, opengraph, detecção de idioma e diffing [v3.0.0]
- [ ] F-DTK-708: Navegação master: containers, deep links, waits de SPA, navlist, safety checks, batch open curado e prefetch/preconnect [v3.0.0]
- [ ] F-DTK-709: Run timeline com watchconsole/watcherrors/watchtasks, spam collapse, rotação e console diff entre runs [v4.0.0]
- [ ] F-DTK-710: Sessão devtools-style instrumentada: attachcdp/cdpcmd/breakpoints/stepcode/watchexpr/overridescript com teardown revisado [v4.0.0]
- [ ] F-DTK-711: Profiling: measureflow, heapshot, trackmemory, profilecpu, watchshifts, traceload, replaytrace e capturesourcemaps [v4.0.0]
- [ ] F-DTK-712: Emulação em camadas com revert exato: device, network, location, user-agent, permissões e blackbox de scripts [v4.0.0]
- [ ] F-DTK-713: Sessões persistentes: checkpoints checksumados, capture/restore com scroll/forms/storage/cookies, diff, busca e export/import revisados [v4.0.0]
- [ ] F-DTK-714: Workflow engine: compose/save/run/dryrun com checkpoints, escopos de variáveis tipados, expressões e templates [v5.0.0]
- [ ] F-DTK-715: Control flow completo: condition/branch/loop/foreach/parallel/trycatch com retry e timeout policies [v5.0.0]
- [ ] F-DTK-716: Trigger engine de 10 kinds: visit/url/menu/key/button/cron/interval/urllist/webhook/event com arm review e manual run preview [v5.0.0]
- [ ] F-DTK-717: Workflow editor visual: canvas com drag&drop, blocos aninhados, minimap, breakpoints, version diff e undo/redo [v5.0.0]
- [ ] F-DTK-718: MCP server no browser: JSON-RPC, tool catalog de 4 namespaces, capability negotiation e stdio bridge [v5.0.0]
- [ ] F-DTK-719: Transporte stream http com TLS, pairing codes de uso único, tokens sha-256, allowlist e approval gates [v5.0.0]
- [ ] F-DTK-720: Streaming completo do protocolo: subscriptions, resource deltas, sampling callbacks, prompt tools, batches, dry runs e tool mocks [v6.0.0]
- [ ] F-DTK-721: Qualquer LLM dirige: provider machinery com 4 protocol styles, modelroute, promptlibrary e guardrails — zero valores hardcoded [v6.0.0]
- [ ] F-DTK-722: Multi-agente swarm: identidades por tab, task queue com lanes, mailboxes, blackboard, budgets e killswitch [v6.0.0]
- [ ] F-DTK-723: Orquestração: leader/worker, planner/executor, critic/verifier, handoffs, locks, merges e progressboard [v6.0.0]
- [ ] F-DTK-724: Sessão como interface: sessiongrid, historysearch, sitenotes, scratchpad, runsummary, semanticrecall, correctionmemory e consentmemory [v6.0.0]
- [ ] F-DTK-725: Segurança core: secretvault, redactshots, schemastrict, origincheck, confirm gates (pay/delete/creds), phishguard e transparencypage [v6.0.0]
- [ ] F-DTK-726: Trust boundary: denydefault, originprofiles, consentwindows, immutable log hash-chained e maskinputs [v6.0.0]
- [ ] F-DTK-727: Interface completa: popup de comando, sidepanel workspace com plancards/diffpreview/timeline, dashboard, options, onboarding e command palette [v6.0.0]
- [ ] F-DTK-728: UI polish: datagrid, exportmenu, quickactions, shortcuts, statusbadge, picker overlay, compareviewer, siteprofiles, dark/light, locale pt/en e a11y labels [v7.0.0]
- [ ] F-DTK-729: Ecosystem: flowlibrary com browse/fork/share, syncbridge opt-in, background run queue, attentionfeed, runreplay e outputcompare [v7.0.0]
- [ ] F-DTK-730: Library headless multi-runtime: planlint, flowrun, exporttools e build esm/cjs/umd para node/bun/deno [v7.0.0]
- [ ] F-DTK-731: Performance: lazymods, incremental snapshots, selcache, virtual lists, stream parse, chunk extract e worker backpressure [v7.0.0]
- [ ] F-DTK-732: Politeness e budgets: batch lanes, adaptive poll, request coalescing, runbudget, battery/network awareness e slowmo replay [v7.0.0]
- [ ] F-DTK-733: Resiliência de run: run state machine, fila offline, idempotency, checkpoints com digest, zombie reap e rollback compensations [v7.0.0]
- [ ] F-DTK-734: State depth: urlhistory, runtimeline com buckets, sessionlock, provenance de memória, encrypt-at-rest, quota watch e audit export [v7.0.0]
- [ ] F-DTK-735: Fleet control: registro com nomes únicos, scopes, budgets, pause isolado, killswitch, reviews entre pares, replay e consenso [v7.0.0]
- [ ] F-DTK-736: Sub-agentes e escala: spawn com depth limit, aggregate report, interleave, lessons, arbitration, priority lanes e cost split [v7.0.0]
- [ ] F-DTK-737: Navegação inteligente: predição navintent, prefetch, deep links, reopen de tabs fechadas, rate limit por domínio e safety heuristics [v7.0.0]
- [ ] F-DTK-738: Data pipelines: stream para disco com cursor, resume, transform com raw retido, dedupe, sample, source stamp e provlog [v7.0.0]
- [ ] F-DTK-739: Web api transports: SSE, long poll, graphql subscriptions, multipart, correlation ids, rate limit respect e cache por run [v7.0.0]
- [ ] F-DTK-740: Vision/OCR: image/region/pdf/frame OCR, vision descriptions, grounding, dom pairing, redaction masks e vision cache [v7.0.0]
- [ ] F-DTK-741: Forensics: before/after captures, console+network timelines, baseline diff, thumbnails, timelapse e capture bundles portáveis [v7.0.0]
- [ ] F-DTK-742: Minimização de dados: local-first stripping, telemetria off por construção, sync opt-in cifrado, purge/export, cookie jars, quarentena e cleanup [v7.0.0]
- [ ] F-DTK-743: CLI de operador completo: manifest checks profundos, planlint, runworkflow, exportdata e headlessmode com exit codes contratuais [v7.0.0]
- [ ] F-DTK-744: Consumo universal: esm/cjs/umd/neutral, adapters por plataforma, engines node/bun/deno e budgets de bundle por target [v7.0.0]
- [ ] F-DTK-745: Servercontract + socket relay: ponte estática site↔extensão com pairing, rotação de token e fila offline [v7.0.0]
- [ ] F-DTK-746: Gateway multi-provider com adapters openai/anthropic/gemini/ollama, routing table, budget tracking e guardrails [v7.0.0]
- [ ] F-DTK-747: Native host bridge + cross-browser: native messaging opcional, wsbridge loopback, firefox xpi, safari skeleton e vsix [v8.0.0]
- [ ] F-DTK-748: Plataforma 2.0: freeze de contratos, apifreeze gate, migrateplan (automa/selenium/vision/csv), recipe gallery de 36, pentest/csp/permdiff gates, readiness de 24 gates e 5 canais de publicação [v8.0.0]
- [ ] F-DTK-749: Polish final auditado: soak sem drift, wcag sweep com ratios 4.5:1/3:1, high contrast theme, style pruning enforce, store package com 6 ícones verificados e banner de sunset v1 com migrateplan [v8.0.0]

---


## FASE 7b — chatinterface "Aura" (99 features F-CTI-001..099)

App NOVO: prefixo F-CTI. Input liquid glass, abas browser-tab, silhueta SVG
runtime, 6 camadas de vidro, PWA dinâmico, player, a11y/i18n/PWA-offline reservas.
Bloco completo: «onda7b-chatinterface.md § FEATURES».


### v1.0.0 — Input premium e abas (shipped no código do corpus)

| ID | Feature | Status | Fonte |
|----|---------|--------|-------|
- F-CTI-001. Caixa de prompt liquid glass com abas browser-tab ancoradas ao topo (shipped) [v1.0.0] «chatiput.txt:7-174»
- F-CTI-002. Duas abas "Faça uma pergunta"/"Agentes" com placeholder dinâmico por aba (shipped) [v1.0.0] «chatiput.txt:298-306»
- F-CTI-003. Contorno gradiente 4 stops em movimento (animateTransform 9s reflect) (shipped) [v1.0.0] «chat.txt:858-872»
- F-CTI-004. Silhueta SVG unificada medida em runtime (useLayoutBounds + ResizeObserver) (shipped) [v1.0.0] «chatiput.txt:2449-2500»
- F-CTI-005. Borda extra outer-only 20px via máscaras outerMaskId/inactiveOuterMaskId (shipped) [v1.0.0] «chat.txt:600-676»
- F-CTI-006. RightTab "Powered by DevThink" emergendo de trás da borda extra (shipped) [v1.0.0] «chat.txt:741-790»
- F-CTI-007. Tween geométrico rAF com lerp + easeOutQuart (contorno acompanha frame a frame) (shipped) [v1.0.0] «chat.txt:443-470»
- F-CTI-008. Squish de raio da aba ativa 18↔14 ao clicar (shipped) [v1.0.0] «chat.txt:492-542»
- F-CTI-009. TAB_SLANT=8 (abas inclinadas) na variante de geometria (shipped) [v1.0.0] «chatinerface.txt:44-50»
- F-CTI-010. 6-7 camadas SVG com path morphing 0.25s e preserveAspectRatio none (shipped) [v1.0.0] «chatinerface.txt:540-790»
- F-CTI-011. Máscara CSS que apaga a linha superior sob a aba ativa (técnica da silhueta) (shipped) [v1.0.0] «conversachatinput.txt:3745-3765»
- F-CTI-012. Fill da aba ativa: linear + radial + gloss + clay filter SVG (shipped) [v1.0.0] «chat.txt:874-920;826-856»
- F-CTI-013. Frost sheen, ambient glow e refraction ring com opacidades theme-aware (shipped) [v1.0.0] «chat.txt:922-976»
- F-CTI-014. Pulse-on-send transitório no contorno (sem duplicar) (shipped) [v1.0.0] «chat.txt:1046-1056»
- F-CTI-015. Textarea auto-height (92px final; 180px na variante com anexos) (shipped) [v1.0.0] «chat.txt:552-560;chatiput.txt:4270-4276»
- F-CTI-016. Enter envia / Shift+Enter nova linha (shipped) [v1.0.0] «chat.txt:1162-1168»
- F-CTI-017. Barra de pílulas de ferramentas: Apps, Canva, Thinking, Search, Deep Research, Media, Audio, Workspace + bot (shipped) [v1.0.0] «chatiput.txt:377-404»
- F-CTI-018. Botão Skills com orbe gradiente e glifo ✦ (shipped) [v1.0.0] «chatinterface.txt:540-552»
- F-CTI-019. Seletor de modelo "Max" com chevron dropdown (shipped) [v1.0.0] «chatinterface.txt:556-572»
- F-CTI-020. Mic + Send como clay buttons com motion hover/tap (shipped) [v1.0.0] «chat.txt:1105-1130»

### v1.0.0 — Mensagens, estados e anexos (shipped)

| ID | Feature | Status | Fonte |
|----|---------|--------|-------|
- F-CTI-021. Feed com auto-scroll ao fim a cada mensagem (shipped) [v1.0.0] «chatiput.txt:216-222»
- F-CTI-022. Bolhas user/ai assimétricas (rounded-tr-sm/tl-sm) com glass distinto (shipped) [v1.0.0] «chatiput.txt:1490-1505»
- F-CTI-023. Indicador de geração pulsante laranja ("Aura está processando...") (shipped) [v1.0.0] «chatiput.txt:234-245»
- F-CTI-024. AnimatePresence popLayout na entrada de mensagens (shipped) [v1.0.0] «chatiput.txt:231-248»
- F-CTI-025. Empty-state centralizado com input relativo (shipped) [v1.0.0] «chatiput.txt:225-236»
- F-CTI-026. Transição input docked/empty 500ms (shipped) [v1.0.0] «chatiput.txt:236»
- F-CTI-027. ResponsePanel com 3 estados (thinking/response/empty) (shipped) [v1.0.0] «chatinterface.txt:640-700»
- F-CTI-028. Thinking com glow pulsante + 3 dots stagger (shipped) [v1.0.0] «chatinterface.txt:648-700»
- F-CTI-029. Response card com citação do prompt e status "Concluído" (shipped) [v1.0.0] «chatinerface.txt:1250-1290»
- F-CTI-030. Empty response com borda dashed e dica de uso (shipped) [v1.0.0] «chatinerface.txt:1295-1305»
- F-CTI-031. Persistência da aba ativa em localStorage (active-tab-state) (shipped) [v1.0.0] «chatinterface.txt:1-14»
- F-CTI-032. Modo demo com resposta simulada (setTimeout 1.2-1.5s) (shipped) [v1.0.0] «chatiput.txt:1462-1472»
- F-CTI-033. Assinatura onSendMessage(text, files?: FileData[]) para anexos (shipped) [v1.0.0] «chatiput.txt:206-212»
- F-CTI-034. AttachedFile com 4 tipos (pdf/image/code/generic) e add/remove (shipped) [v1.0.0] «chatiput.txt:4225-4240»
- F-CTI-035. Silhueta reativa a anexos e altura do input (shipped) [v1.0.0] «chatiput.txt:4122-4165»
- F-CTI-036. Mic visual com anel micPulse laranja (shipped) [v1.0.0] «chat.txt:2100-2112»
- F-CTI-037. Botão + com divisor vertical antes do input (shipped) [v1.0.0] «chatiput.txt:259-263»
- F-CTI-038. Mocks de anexo por tipo com tamanho aleatório (shipped) [v1.0.0] «chatiput.txt:4290-4300»
- F-CTI-039. Pills com estado pressed (clay-btn-pressed) por id (shipped) [v1.0.0] «chat.txt:1226-1250»
- F-CTI-040. Botão "mais opções" com três pontinhos (shipped) [v1.0.0] «chatiput.txt:405-416»

### v1.0.0 — Tema, tokens e design system (shipped)

| ID | Feature | Status | Fonte |
|----|---------|--------|-------|
- F-CTI-041. Dark/light mode com next-themes (attribute class, default dark) (shipped) [v1.0.0] «chat.txt:1096-1104»
- F-CTI-042. SSR dark sem flash (className dark + suppressHydrationWarning) (shipped) [v1.0.0] «chat.txt:32-39»
- F-CTI-043. Tokens chat-* completos por tema (page/card/fills/textos/glow/blobs) (shipped) [v1.0.0] «chat.txt:1262-1280»
- F-CTI-044. Família clay (.clay-btn/.clay-btn-sm/.clay-btn-pressed/.clay-dropdown/.clay-card) (shipped) [v1.0.0] «chat.txt:1735-1830»
- F-CTI-045. send-btn gradiente 5 stops + variante refraction (fonte 26) (shipped) [v1.0.0] «chat.txt:1892-1925;1464-1466»
- F-CTI-046. PRO badge gradiente multicolor com insets (shipped) [v1.0.0] «chat.txt:1928-1938»
- F-CTI-047. liquid-glass-authentic (5-layer box-shadow, blur 50px) (shipped) [v1.0.0] «chat.txt:1948-1975»
- F-CTI-048. Variantes glass/glass-card/floating-rail para cards externos (shipped) [v1.0.0] «chat.txt:1978-2010»
- F-CTI-049. text-gradient-orange (background-clip text) (shipped) [v1.0.0] «chat.txt:2013-2018»
- F-CTI-050. Aurora background com blobs por paleta da aba ativa (shipped) [v1.0.0] «chat.txt:348-352;1104-1140»
- F-CTI-051. Theme toggle Sun/Moon clay (shipped) [v1.0.0] «chat.txt:1153-1160»
- F-CTI-052. Tokens de fontes mapeados por comentário (sources 5/16/24-27/31) (shipped) [v1.0.0] «chat.txt:1390-1462»

### v1.0.0 — PWA chrome do chatinterface (shipped)

| ID | Feature | Status | Fonte |
|----|---------|--------|-------|
- F-CTI-053. Manifest web dinâmico por host (standalone, theme #000000) (shipped) [v1.0.0] «grok-pwa-shared.txt:114-134»
- F-CTI-054. Página de tutorial de instalação iOS (?install=1&platform=ios) (shipped) [v1.0.0] «grok-pwa-plugin.txt:37-52»
- F-CTI-055. Injeção idempotente de head tags (só faltantes) (shipped) [v1.0.0] «grok-pwa-shared.txt:341-365»
- F-CTI-056. OG/Twitter card canônico com strip de metas duplicadas (shipped) [v1.0.0] «grok-pwa-shared.txt:289-300»
- F-CTI-057. og:image custom (public/og.jpg|png) ou placeholder com cor hex (shipped) [v1.0.0] «grok-pwa-shared.txt:271-286»
- F-CTI-058. Banner x:game:image 1200×264 para apps tipo x:game (shipped) [v1.0.0] «grok-pwa-shared.txt:279-286»
- F-CTI-059. snapshotOgIdentity baked no bundle (deploy sem workspace FS) (shipped) [v1.0.0] «grok-pwa-shared.txt:213-231»
- F-CTI-060. extensions.js da plataforma com grok-project-id/grok:app_id (shipped) [v1.0.0] «grok-pwa-shared.txt:160-200»
- F-CTI-061. Metas x:creator/x:creator:id para autoria (shipped) [v1.0.0] «grok-pwa-shared.txt:180-200»
- F-CTI-062. Streaming head injector (buffer só até </head>, early flush preservado) (shipped) [v1.0.0] «grok-pwa-shared.txt:400-476»
- F-CTI-063. Modo passthrough para respostas comprimidas (gzip intacto) (shipped) [v1.0.0] «grok-pwa-plugin.txt:104-125»
- F-CTI-064. requestHost com x-forwarded-host/host/:authority (shipped) [v1.0.0] «grok-pwa-plugin.txt:15-21»
- F-CTI-065. Guardas isDocumentPath/acceptsHtml (não injetar em assets/API) (shipped) [v1.0.0] «grok-pwa-shared.txt:66-82»
- F-CTI-066. apple-touch-icon + status-bar black + theme-color (iOS) (shipped) [v1.0.0] «grok-pwa-shared.txt:136-158»
- F-CTI-067. Nome do app derivado do slug *.grok.me (Title Case) (shipped) [v1.0.0] «grok-pwa-shared.txt:29-46»
- F-CTI-068. Virtual module grok-og-identity para o bundle Vite (shipped) [v1.0.0] «grok-pwa-plugin.txt:164-172»
- F-CTI-069. transformIndexHtml dev injection (shipped) [v1.0.0] «grok-pwa-plugin.txt:174-178»
- F-CTI-070. Metade Nitro/server para apps deployados (shared único) (shipped) [v1.0.0] «grok-pwa-plugin.txt:1-5»
- F-CTI-071. Suíte node:test de idempotência/OG/manifest (shipped) [v1.0.0] «grok-pwa-plugin.test.txt:22-241»
- F-CTI-072. stripInstallParams: link limpo do app após tutorial (shipped) [v1.0.0] «grok-pwa-shared.txt:84-94»

### v1.0.0 — Qualidade, performance e workflow (shipped)

| ID | Feature | Status | Fonte |
|----|---------|--------|-------|
- F-CTI-073. no-scrollbar global triplo-engine (shipped) [v1.0.0] «chatiput.txt:7798-7820»
- F-CTI-074. Reset global de focus rings/tap highlight/overscroll (shipped) [v1.0.0] «chatiput.txt:7790-7836»
- F-CTI-075. ::selection laranja temática (shipped) [v1.0.0] «chatiput.txt:7838-7844»
- F-CTI-076. Scroll suave + momentum-scroll no feed (shipped) [v1.0.0] «chatiput.txt:7848-7850;11332-11336»
- F-CTI-077. aria-label em todos os botões-ícone (shipped) [v1.0.0] «chatiput.txt:98;8014;8038»
- F-CTI-078. aria-pressed nas abas (shipped) [v1.0.0] «chat.txt:1092»
- F-CTI-079. ResizeObserver apenas no container (performance) (shipped) [v1.0.0] «timeline1chatiput.txt:105»
- F-CTI-080. Cleanup completo de rAF/observer/timeout nos effects (shipped) [v1.0.0] «chatiput.txt:2480-2500»
- F-CTI-081. Dedup SHA-256 das variantes antes do merge (shipped) [v1.0.0] «timeline1chatiput.txt:1-4»
- F-CTI-082. Verificação visual agent-browser + VLM em light/dark (planned) [v1.1.0] «timeline1chatiput.txt:111»
- F-CTI-083. Lint limpo + checagem mobile no fluxo de aceite (planned) [v1.1.0] «timeline1chatiput.txt:111»
- F-CTI-084. lib/geometry exportada (paths + constantes tipadas) (shipped) [v1.0.0] «chatinerface.txt:41-145»
- F-CTI-085. IDs de gradiente SVG únicos por instância (useId) (shipped) [v1.0.0] «chat.txt:844-856»
- F-CTI-086. Tabs com forwardRef para medição externa (shipped) [v1.0.0] «chatiput.txt:2825-2840»
- F-CTI-087. Re-cálculo de geometria pós-mount via dispatch resize (shipped) [v1.0.0] «chatinerface.txt:480-486»
- F-CTI-088. Clamp minLeft anti-invasão do canto da caixa (shipped) [v1.0.0] «chat.txt:475-477»
- F-CTI-089. Saddle adaptativo s = min(saddle, gap/2, left/2) (shipped) [v1.0.0] «chatiput.txt:2620-2621»
- F-CTI-090. Artefato HTML único com CSS Houdini + Tailwind inline e pacote ZIP de entrega (planned) [v1.1.0] «timeline1chatiput.txt:18;110»

### Reserva v1.1.0+ (demanda explícita do dono, não codificada no corpus)

| ID | Feature | Status | Fonte |
|----|---------|--------|-------|
- F-CTI-091. PWA offline storage (cache de assets + IndexedDB) herdado do padrão do player (planned) [v1.1.0] «O-QUE-FALTA.txt:137-148»
- F-CTI-092. Plugin system de UI do chat (CorePlugin/UIPlugin/ContainerPlugin) (planned) [v1.2.0] «O-QUE-FALTA.txt:99-110»
- F-CTI-093. A11y WAI-ARIA completa (roles, aria-live, focus management) (planned) [v1.1.0] «O-QUE-FALTA.txt:112-122»
- F-CTI-094. i18n dos textos do chat via Record<string,string> (planned) [v1.1.0] «O-QUE-FALTA.txt:124-135»
- F-CTI-095. Bindings React/Vue/Svelte do componente de chat (planned) [v1.2.0] «O-QUE-FALTA.txt:136»
- F-CTI-096. llms.txt do chatinterface para agentes de IA (planned) [v1.2.0] «PESQUISA-CONCORRENCIA.txt:60»
- F-CTI-097. Múltiplas skins do chat (frosted/minimal) como presets (planned) [v1.2.0] «PESQUISA-CONCORRENCIA.txt:41-50»
- F-CTI-098. Skins theme-aware com stats overlay do chat (latência/tokens) (planned) [v1.2.0] «COMPARATIVO-CONCORRENCIA.txt:1.6»
- F-CTI-099. Compartilhamento do chat (Web Share + OG card por conversa) (planned) [v1.2.0] «grok-pwa-shared.txt:289-300»

---


## FASE 7c — linhagem opencode (85 features F-DTK-750..834)

V4→V32: escada de variants, all-free, exact-ids, 60K context, no-thinking,
fix-500, GPT-6 Astra 360 models/43 providers, antigravity→maene, PKCE loopback.
Bloco completo: «onda7c-opencode.md § FEATURES».


| ID | Feature (planned — capacidade nova introduzida pela versão/fonte) | Fonte |
|----|-------------------------------------------------------------------|-------|
| F-DTK-750 | Config opencode base: 40 providers/299 models com @ai-sdk/openai-compatible, limits e modalities declarados (planned) [V-corrigido] «opencode.txt» |
| F-DTK-751 | Providers commandcode + venice para model stealth ox-alpha (planned) [V-corrigido+cc] «opencode (5).txt» |
| F-DTK-752 | Provider kilo com 18 models `:free` via gateway api.kilo.ai (planned) [base+kilo] «opencode (6).txt» |
| F-DTK-753 | Config DEFINITIVO 43 providers — catálogo fechado pré-auditoria (planned) [V3] «Opencode-DEFINITIVO (1).txt» |
| F-DTK-754 | Correção incremental de catálogo kilo/openrouter (+8 models) (planned) [DEF-CORRIGIDO] «Opencode-DEFINITIVO-CORRIGIDO (1).txt» |
| F-DTK-755 | Correção de IDs em massa kilo/nvidia/openrouter (planned) [DEF-CORRIGIDO-V2] «Opencode-DEFINITIVO-CORRIGIDO-V2.txt» |
| F-DTK-756 | Validação por modelo: 26 IDs conferidos contra catálogo do provider (planned) [VALIDADO-POR-MODELO] «Opencode-FINAL-VALIDADO-POR-MODELO.txt» |
| F-DTK-757 | Congelamento SEM-BAGUNCA: baseline 348 models estáveis p/ versionamento FINAL (planned) [V4] «Opencode-FINAL-V4-SEM-BAGUNCA.txt» |
| F-DTK-758 | Reasoning como objeto {effort,enabled,exclude} (planned) [V5] «Opencode-FINAL-V5-REASONING-OBJECT.txt» |
| F-DTK-759 | Full thinking: effort max universal na família kilo (planned) [V6] «Opencode-FINAL-V6-FULL-THINKING.txt» |
| F-DTK-760 | Verificação de suporte: chat_template_kwargs só em providers compatíveis (planned) [V7] «Opencode-FINAL-V7-VERIFICADO.txt» |
| F-DTK-761 | Chat template expandido a 101 models thinking após verificação (planned) [V10] «Opencode-FINAL-V10-COM-CHAT-TEMPLATE.txt» |
| F-DTK-762 | Variante de config com plugin maene em paralelo ao antigravity (planned) [V10-maene] «opencod5e.txt» |
| F-DTK-763 | Rollout kimi-k3 em nvidia + opencode zen (planned) [V12] «Opencode-FINAL-V12-KIMI-K3-CORRIGIDO.txt» |
| F-DTK-764 | Merge: plugin maene oficial + reasoning objeto universal + kimi-k3 em 4 providers (planned) [V13] «Opencode-FINAL-V13-MERGED-CORRIGIDO.txt» |
| F-DTK-765 | Escada de variants com limites de output reais 16384/32768/49152/65536/82000 (planned) [V14] «Opencode-FINAL-V14-COM-LIMITES.txt» |
| F-DTK-766 | Auditoria 100%: reasoning null nos não-thinking + remoção de model fantasma (planned) [V16] «Opencode-FINAL-V16-100-AUDITADO.txt» |
| F-DTK-767 | Padronização top_p 0.95 em 207 models (planned) [V17] «Opencode-FINAL-V17-TOP-P-095.txt» |
| F-DTK-768 | Explosão all-free: +139 models free em 3 providers + variante none (planned) [V18] «Opencode-FINAL-V18-ALL-FREE.txt» |
| F-DTK-769 | Modo somente-max: colapso de variants ao degrau máximo (planned) [V19] «Opencode-FINAL-V19-SOMENTE-MAX.txt» |
| F-DTK-770 | Prune por IDs exatos: −123 models, núcleo de 8 zen free + kilo 47 (planned) [V20] «Opencode-FINAL-V20-EXACT-IDS.txt» |
| F-DTK-771 | Nomes de UI estilo catálogo vendor (planned) [V21] «Opencode-FINAL-V21-CORRECT-NAMES.txt» |
| F-DTK-772 | Nomes de UI simplificados sem vendor prefix (planned) [V22] «Opencode-FINAL-V22-SIMPLE-NAMES (1).txt» |
| F-DTK-773 | Correção de IDs meta-spark→muse-spark (planned) [V23] «Opencode-FINAL-V23-CORRECT-IDS.txt» |
| F-DTK-774 | Experimento de output mínimo no contributer model (bug 60) (planned) [V24] «Opencode-FINAL-V24-MUSE-SPARK (1).txt» |
| F-DTK-775 | Fix 60K: output 60000 no muse-spark (planned) [V25] «Opencode-FINAL-V25-60K (1).txt» |
| F-DTK-776 | Merge de provider espelho: opencodez eliminado (planned) [V26] «Opencode-FINAL-V26-MERGED.txt» |
| F-DTK-777 | Contexto real declarado (131072/1048576) + out 60000 nos zen free (planned) [V27] «Opencode-FINAL-V27-REAL-CONTEXT-60K.txt» |
| F-DTK-778 | Modo no-thinking: variante `none:{}` primeiro em todos os models + variants neutros (planned) [V28] «Opencode-FINAL-V28-NO-THINKING.txt» |
| F-DTK-779 | Provider paralelo opencode-responses para contornar HTTP 500 (planned) [V29] «Opencode-FINAL-V29-FIX-500.txt» |
| F-DTK-780 | Consolidar em provider único (opencode) pós-fix (planned) [V30] «Opencode-FINAL-V30-SINGLE-PROVIDER (1).txt» |
| F-DTK-781 | Provider experientiallabs + GPT-6 Astra minimal (planned) [V31] «Opencode-FINAL-V31-GPT6-ASTRA-SIMPLE.txt» |
| F-DTK-782 | GPT-6 Astra completo: ctx 1,05M / out 128k / effort max / variants (planned) [V32] «Opencode-FINAL-V32-GPT6-ASTRA-FIXED.txt» |
| F-DTK-783 | Portabilidade de config para Kilo Code via schema swap (planned) [Kilo-V32] «Kilo-FINAL-V32-GPT6-ASTRA-FIXED.txt» |
| F-DTK-784 | Conversão antecipada da base para app.kilo.ai (planned) [Kilo-CONVERTIDO] «Kilo-CONVERTIDO.txt» |
| F-DTK-785 | Pooling de quota com 16 réplicas mimo-1..16 de chaves distintas (planned) [V32] «V32 (jq)» |
| F-DTK-786 | Réplica canário de provider em domínio alternativo (railway/gitlawb) (planned) [V32] «V32 (jq mimo-8/14)» |
| F-DTK-787 | Provider próprio devthink sem apiKey (auth por cookie da sandbox) no config do CLI (planned) [base..V32] «jq .provider.devthink» |
| F-DTK-788 | Modelo devthink com contexto agregado 4,78M via gateway V4 (planned) [base..V32] «jq devthink ctx» |
| F-DTK-789 | 7 canais redundantes para glm-5.2 (zai/babel/cline/megallm/zenmux/gmi/fusion) (planned) [V32] «V32 (jq)» |
| F-DTK-790 | Model stealth ox-alpha por 3 vendors (commandcode/venice/openrouter) (planned) [V32] «V32 (jq)» |
| F-DTK-791 | Provider de métrica de catálogo (llm-stats) como fonte de models (planned) [V32] «V32 (jq)» |
| F-DTK-792 | Provider local ollama (127.0.0.1:11434) com models *:cloud (planned) [base..V32] «V32 (jq)» |
| F-DTK-793 | Providers "next-*" para testar nova geração de gateway sem tocar o estável (planned) [V32] «V32 (jq)» |
| F-DTK-794 | Auth OAuth PKCE com callback em porta aleatória locked 127.0.0.1 (planned) [auth-V5] «opencode (4).txt:6013» |
| F-DTK-795 | Storage multi-conta v3 (antigravity-accounts.json) com activeIndexByFamily e rateLimitResetTimes (planned) [auth-V5] «opencode (4).txt:5999,6015» |
| F-DTK-796 | Escrita atômica tmp+rename, chmod 600/0700 e lock file com stale detection (planned) [auth-V1+] «opencode (4).txt:328» |
| F-DTK-797 | Rotação Robin Hood de contas com soft quota em 90% (planned) [auth-V4] «opencode (4).txt:6015» |
| F-DTK-798 | Dual quota Antigravity + Gemini CLI com opção cli_first (planned) [auth-V4] «opencode (4).txt:360» |
| F-DTK-799 | Bypass Project ID dual (ideType ANTIGRAVITY→GEMINI) + fallback rising-fact-p41fc (planned) [auth-V4/V5] «opencode (4).txt:6017» |
| F-DTK-800 | Refresh de token com double-checked locking (planned) [auth-V4] «opencode (4).txt:6017» |
| F-DTK-801 | Transformação de request: cleanSchema protobuf-strict + sanitizeToolName + mapBudget (planned) [auth-V4] «opencode (4).txt:334,6019» |
| F-DTK-802 | Cadeia de fallback de IDs de model antigravity-* → IDs reais (planned) [auth-V4] «opencode (4).txt:334» |
| F-DTK-803 | Thinking signature caching com LRU (planned) [auth-V4] «opencode (4).txt:6001» |
| F-DTK-804 | google_search grounding como tool opcional do plugin (planned) [auth-V4] «opencode (4).txt:306» |
| F-DTK-805 | Image generation com OPENCODE_IMAGE_ASPECT_RATIO e safety BLOCK_NONE (planned) [auth-V4] «opencode (4).txt:6019» |
| F-DTK-806 | Version dinâmica: remote→changelog-scrape→hardcoded com cache 24h (planned) [auth-V4] «opencode (4).txt:344» |
| F-DTK-807 | Debug logging com rotação, TUI buffer circular e redação de segredos (planned) [auth-V4] «opencode (4).txt:356» |
| F-DTK-808 | CLI de contas interativa (login/add/list/enable/disable/set-active/remove) zero-deps (planned) [auth-V4] «opencode (4).txt:363» |
| F-DTK-809 | Descoberta de project ID com timeout 10s e retry PROD/DAILY/SANDBOX (planned) [auth-V4] «opencode (4).txt:369» |
| F-DTK-810 | Pacote npm publicável opencode-antigravity-auth-next (main/bin/peerDeps/engines) (planned) [auth-V4/V5] «opencode (4).txt:372,5982» |
| F-DTK-811 | Artefato único: pasta blindada nome curto + zip nível 9 + FLUXOGRAMA.md (planned) [auth-V5] «opencode (4).txt:6095-6107» |
| F-DTK-812 | Align de fingerprint: UA antigravity/{ver} sem X-Goog-QuotaUser/X-Client-Device-Id (planned) [auth-V5] «opencode (4).txt:5980,6001» |
| F-DTK-813 | Smoke test CLI: opencode auth login/list + run --variant=high (planned) [auth-V5] «opencode (4).txt:6103-6105» |
| F-DTK-814 | Re-auditoria contra concorrentes (9router/omnirouter/gemini-cli) por release (planned) [auth-V5] «opencode (4).txt:5988-6009» |
| F-DTK-815 | Prefix routing gc/cc/kr/vertex + model matrix (padrão 9router) (planned) [pesquisa] «opencode (4).txt:6005» |
| F-DTK-816 | Keepalive de Project ID 30s anti-ban 403 (padrão OmniRoute) (planned) [pesquisa] «opencode (4).txt:6007» |
| F-DTK-817 | Cache SHA256 TTL 1h para metadata (padrão Gemini CLI) (planned) [pesquisa] «opencode (4).txt:6011» |
| F-DTK-818 | Sticky account selection até exaustão de quota (padrão shekohex) (planned) [pesquisa] «opencode (4).txt:306» |
| F-DTK-819 | Onboarding LRO com polling de operations (padrão Gemini CLI) (planned) [pesquisa] «opencode (4).txt:6011» |
| F-DTK-820 | Dedup de linhagem por diff canônico jq -cS (método de engenharia) (planned) [processo] «método desta onda» |
| F-DTK-821 | Digest estrutural jq (providers/models/limits) como pré-leitura de configs gigantes (planned) [processo] «método desta onda» |
| F-DTK-822 | Versionamento por sufixo descritivo do patch no nome do arquivo (planned) [processo] «arquivos V*» |
| F-DTK-823 | Um patch por versão (atomicidade de bissecção) (planned) [processo] «tabela de versões» |
| F-DTK-824 | Checkpoints de imutabilidade em providers sagrados (devthink) ao longo da linhagem (planned) [processo] «jq devthink 7 checkpoints» |
| F-DTK-825 | Validação JSON completa antes de arquivar versão (planned) [processo] «jq -e 35 configs» |
| F-DTK-826 | Espelho A/B temporário de providers free com remoção pós-auditoria (planned) [V18→V26] «diffs V18/V20/V26» |
| F-DTK-827 | Prune de modelos fantasma por comparação com catálogo oficial (planned) [V20] «comm V19→V20» |
| F-DTK-828 | Correção de contexto fictício para contexto real aceito pelo endpoint (planned) [V27] «diff V26→V27» |
| F-DTK-829 | Variante none como seleção de primeira classe para no-thinking (planned) [V28] «V28:8660» |
| F-DTK-830 | Transport swap como fix de 5xx (provider responses paralelo) (planned) [V29] «diff V28→V29» |
| F-DTK-831 | Entrada minimal de flagship novo + fix de limites na versão seguinte (planned) [V31/V32] «diff V31→V32» |
| F-DTK-832 | Plugin de memória dupla: memsearch (busca) + universal-memory (sessão) (planned) [base..V32] «jq .plugin» |
| F-DTK-833 | Plugin maene de spoof de headers por provider (chat.headers) (planned) [V13+] «jq .plugin V13» |
| F-DTK-834 | Catálogo ALL_MODELS_2026 embarcado no plugin compartilhado com o config (planned) [auth-V4] «opencode (4).txt:322,363» |

---


## FASE 7d — design neodevthink (50 features F-DTK-850..899)

Temas Neo DevThink, botão-disc, header-glass clip-path, cutouts, tabs côncavas,
laptop/phone/folder/torus CSS, gauge SVG glow, feTurbulence, dialogs ::backdrop,
liquid-glass Qwen, wordmark colossal, FAUN.
Bloco completo: «onda7d-design-css2.md § FEATURES».


| ID | Feature | Status | Fonte |
|----|---------|--------|-------|
| F-DTK-850 | Sistema de 5 temas trocáveis (default/dark/sunset-royal/nordic-forest/pitch-black) via tokens por metáfora (shipped) «theme-*.css» |
| F-DTK-851 | Tema AMOLED pitch-black com glass fino (blur 40px saturate 220%) e neon ciano/magenta/lime (shipped) «theme-pitch-black(1).css» |
| F-DTK-852 | Tema com seleção de texto colorida por tema (--selection-color) (shipped) «theme-default(1).css» |
| F-DTK-853 | Sombra premium de 2 camadas tokenizada por tema (--shadow-premium) (shipped) «theme-dark(1).css» |
| F-DTK-854 | Dark mode por atributo data-theme com 6 tokens trocados + color-scheme (shipped) «index(115).css:32-40» |
| F-DTK-855 | Skip-link de acessibilidade universal (teclado primeiro) (shipped) «index(138).css:58-74» |
| F-DTK-856 | Foco visível customizado com offset 3-5px em todo controle (shipped) «index(21).css:33» |
| F-DTK-857 | prefers-reduced-motion: matar animações/transições globalmente com exceção lista (shipped) «index(174).css:317-321» |
| F-DTK-858 | Header-pill flutuante com contração no scroll (top 20→12, blur escurece) (shipped) «kroma(1).css:305-334» |
| F-DTK-859 | Barra de progresso de leitura dentro da nav (scaleX com origin left) (shipped) «index(21).css:90» |
| F-DTK-860 | Vidro de header recortado por clip-path sem cortar os links (shipped) «index(21).css:75;index(150).css:85» |
| F-DTK-861 | Active-tab com ponte côncava sobre a borda da nav (shipped) «index(147).css:13-16» |
| F-DTK-862 | Badge circular giratório com texto em textPath (selo giratório) (shipped) «kroma(1).css:173-233» |
| F-DTK-863 | Botão-pill com disc interno que gira 45° no hover (gesto de ação) (shipped) «kroma(1).css:113-115» |
| F-DTK-864 | Waveform visualizador CSS puro com estado is-playing (shipped) «kroma(1).css:275-303» |
| F-DTK-865 | Radar achievement com 3 anéis SVG + ícones-orbit + botão central (shipped) «kroma(1).css:87-195» |
| F-DTK-866 | Chips de like/save com estado afetivo colorido (is-liked rosa) (shipped) «kroma(1).css:246-250» |
| F-DTK-867 | Serpentine chain grid com nós de geometria mista (círculo/cápsula/vertical) (shipped) «kroma(1).css:252-349» |
| F-DTK-868 | Aurora pods com glow-color por item como estado selecionado (shipped) «kroma(1).css:439-442» |
| F-DTK-869 | Mockup de laptop 100% CSS com notch e trackpad (shipped) «kroma(1).css:638-696» |
| F-DTK-870 | Screen-switcher vertical com dot-indicator e check (shipped) «kroma(1).css:121-149» |
| F-DTK-871 | Slider bicolor (gradiente no track, thumb com borda do 2º stop) (shipped) «kroma(1).css:394-413» |
| F-DTK-872 | Botão-cunha com clip-path notch e hover deslizante (shipped) «kroma(1).css:428-456» |
| F-DTK-873 | Wallet glass central com satélites-pill e dots neon (shipped) «kroma(1).css:446-511» |
| F-DTK-874 | Footer com wordmark colossal e asterisco giratório (shipped) «kroma(1).css:487-506» |
| F-DTK-875 | Pricing com tier destacado dark + stamp flutuante + badge current (shipped) «kroma(1).css:172-268» |
| F-DTK-876 | FAQ numerado com chevron que rotaciona e colore (shipped) «kroma(1).css:333-380» |
| F-DTK-877 | Cortes de canto invertidos por box-shadow deslocado (cutout) (shipped) «index(104).css:62-64;index(21).css:111-112» |
| F-DTK-878 | Mosaic de janelas com mix-blend luminosity no hover (shipped) «index(138).css:303-317» |
| F-DTK-879 | Stadium columns de fotos com badge na interseção (shipped) «index(138).css:513-608» |
| F-DTK-880 | Fan de pastas 3D CSS com aba, shine e un-tilt no hover (shipped) «index(104).css:70-86» |
| F-DTK-881 | Headline de word-pills coloridas rotacionadas com inner highlight (shipped) «index(104).css:37-47» |
| F-DTK-882 | Hero blob com clip-path estrela + dashmarch em linhas vivas (shipped) «index(104).css:20-23» |
| F-DTK-883 | Torus/materiais flutuantes mascarados com floaty (shipped) «index(104).css:31-36» |
| F-DTK-884 | Carrossel de momentos com profundidade por altura/rotação variável (shipped) «index(166).css:79-88» |
| F-DTK-885 | Gauge SVG físico com ticks, glow no arco e transição de dasharray (shipped) «index(166).css:48-63» |
| F-DTK-886 | Ruído fractal feTurbulence via SVG data-URI (grão calibrável) (shipped) «index(166).css:5;index(181).css:114» |
| F-DTK-887 | Laboratório de materiais com variável --intensity (chrome/glass/mesh/glow/depth) (shipped) «index(181).css:130-153» |
| F-DTK-888 | Colorway por filter (graphite/cream) sem assets extras (shipped) «index(174).css:256-258» |
| F-DTK-889 | Sound orb conic-gradient com pulso de reprodução (shipped) «index(174).css:156-160» |
| F-DTK-890 | Closing block com notch radial para encaixe de orb (shipped) «index(174).css:155» |
| F-DTK-891 | Filter-bar côncava com bridge radial-gradient (junção curva) (shipped) «index(174).css:284-287» |
| F-DTK-892 | Mini-player persistente glass com texto truncado (shipped) «index(174).css:187-192» |
| F-DTK-893 | Dialog nativo <dialog> com ::backdrop blur e close rotativo (shipped) «mova-panels(1).css:1-5» |
| F-DTK-894 | Sistema de dialogs multi-tamanho por classe (search/track/plan/tour) (shipped) «sol-panels:243-247» |
| F-DTK-895 | Quiz multi-etapas com progresso segmentado e opções-card selecionáveis (shipped) «index(115).css:16-57» |
| F-DTK-896 | Toast pill com check circular e dismiss (shipped) «index(138).css:727-764» |
| F-DTK-897 | Catálogo de paleta/type-specimen embutido no produto (atlas) (shipped) «kroma-panels(1).css:762-800;sol-panels:229-234» |
| F-DTK-898 | Marquee inclinado com pausa no hover (ticker de banda) (shipped) «index(116).css:36-45» |
| F-DTK-899 | Gerador de páginas com page-plan JSON + componentes endereçados por data-component-id (planned) «designe.txt:48114-48135» |

---

## FASE 8a — apps restantes (195 features, 9 prefixos novos)

F-EXT-001..060 (extension) · F-AKA-001..030 (akash) · F-SOF-001..025 (SoFlowX) ·
F-ANS-001..020 (ansi-art) · F-GL-001..015 (gl) · F-NTH-001..015 (nathlan) ·
F-SCM-001..010 (soochimp) · F-BOB-001..010 (bob) · F-IAK-001..010 (iakadion).
Bloco completo: «onda8a-apps.md § FEATURES».


### F-EXT — extension (001..060)

- F-EXT-001. Remoção de todo bound arbitrário: wait sem teto, steps ilimitados, snapshot completo de elementos/forms/opções/texto. planned. [1.1.32]
- F-EXT-002. Vocabulário de ação expandido para 63 kinds (presskey, drag/drop, upload, readtable, readstorage, evaluate, tab/window commands…). planned. [1.1.32]
- F-EXT-003. Modelo de capacidades opcionais (tabs/downloads/clipboardRead/clipboardWrite) com negociação via permissions api e capability gate. planned. [1.1.32]
- F-EXT-004. Pointer paths com speedprofile (waypoints, easing, peak velocity, jitter, enter-move-exit). planned. [1.1.33]
- F-EXT-005. targetref com 7 modos + retryaction com retryrule + mapclicks numerado + pierceshadow/enterframe. planned. [1.1.33]
- F-EXT-006. Observação profunda: 28 observers read-only passive/watching/diffing (a11ytree, readertree, detectlists, detecttables, classifypage, deriveselector…). planned. [1.1.34]
- F-EXT-007. Watch lifetimes (watchmutate, watchbanner, watchfocus, waitquiet) com janelas revisadas e reconciliação pós-restart. planned. [1.1.34]
- F-EXT-008. Família de navegação: openlink/openprivate/deeplink/followlink/spanav/rewritequery/checksafe/batchopen/prefetch/handleauth/printpdf. planned. [1.1.35]
- F-EXT-009. Wait profiles per site (navprofile), rate windows per domain (navrate) e navigation trail auditável (trailaudit/navintent). planned. [1.1.35]
- F-EXT-010. Comando total de tabs/windows: querytabs, findclones, grouptabs, savelayout/restorelayout, incognitowindow, badgetab, scratchwindow. planned. [1.1.36]
- F-EXT-011. watchtab com event streams persistidos + snapshotsession/reopenrun. planned. [1.1.36]
- F-EXT-012. Forms family: fillform/filllabel/fillcard/fillcode/consentpassword/asksubmit/submitform/readerrors/retryform/saveprofiles. planned. [1.1.37]
- F-EXT-013. Wizards e controles dependentes: runwizard, selectchain, picktypeahead, pickdate com espera por evidência. planned. [1.1.37]
- F-EXT-014. Scraping estruturado: scrapetable, paginateextract, deduperows, transformvalues, resumeextract com cursor. planned. [1.1.38]
- F-EXT-015. Exports consent-gated: exportcsv/exportjson/exportexcel/copytable/pushsheets/streamdisk com checksum + provenance por row. planned. [1.1.38]
- F-EXT-016. Downloads gerenciados: batchdownload com state machine, interceptmime com deny default, quarantinedownload com scan verdict, cleanup sweeps. planned. [1.1.39]
- F-EXT-017. Clipboard consentido: readclipboard com prompt single use, writeclipboard/copyscreen com payload hash. planned. [1.1.39]
- F-EXT-018. Capturas: shotview/shotfullpage (stitching com seam blending)/shotelement/shotregion/contactsheet. planned. [1.1.40]
- F-EXT-019. beforeafter policy com shotpairs + capture gallery com thumbnails e divisores de comparação. planned. [1.1.40]
- F-EXT-020. Mídia derivada honesta: capturepdf (PDF 1.4 composto), recordscreen/captureaudio como derived evidence, probestream, image batches. planned. [1.1.41]
- F-EXT-021. Canais de rede consentidos: websocket com reconnect/multiplex, subscribesse com last-event-id, longpoll com cursor. planned. [1.1.43]
- F-EXT-022. Observação de APIs de página: netwatch com exchange records, api ranking e replay spec com overrides. planned. [1.1.43]
- F-EXT-023. Controle de tráfego próprio: block/mock/header rules com pattern grammar, cookie jar operações, rate limit headers. planned. [1.1.44]
- F-EXT-024. OAuth no browser: authorize com state run-scoped, code capture, token exchange/refresh/revocation; multipart uploads com boundary streaming. planned. [1.1.44]
- F-EXT-025. Debugging: console/error/longtask timeline (runtimeline) + debugger session instrumentada sem debugger permission (cdpbus, breakpoints, stepping, watch, overrides). planned. [1.1.45/46]
- F-EXT-026. Profilers: flow metrics, heap snapshots intervalados, cpu profile, layout shift, traces com export e offline replay. planned. [1.1.47]
- F-EXT-027. Emulação: emulatedevice/emulatenetwork/emulatelocate/setuseragent/overridepermission/blackboxscripts como sensitive. planned. [1.1.48]
- F-EXT-028. Sessões persistíveis: capture/restore/diff/search/export/import com crash restore no consent context. planned. [1.1.49]
- F-EXT-029. Workflow engine: compose com block expansion, bindings/expressions/regex, dry run read-only, run dispatch pela consent chain. planned. [1.1.50]
- F-EXT-030. Control flow: condition/branch/loop/repeatuntil/whileloop/foreach/parallel com join policies/trycatch com retry policies. planned. [1.1.51]
- F-EXT-031. Triggers automáticos: 10 famílias (visit/url/menu/key/button/cron/interval/urllist/webhook/event) todas sensitive. planned. [1.1.52]
- F-EXT-032. Workflow editor visual: canvas nodes/edges, mini map, undo/redo, breakpoints, version diff, json/yaml sharing, per-site overrides. planned. [1.1.53]
- F-EXT-033. MCP server mode: json rpc stdio/http, toolcatalog com 4 namespaces e consent metadata, resources/prompts expostos. planned. [1.1.54]
- F-EXT-034. Transporte remoto: pairing codes single use, tokens sha-256, client allowlist, TLS required, approval gates com redaction. planned. [1.1.55]
- F-EXT-035. Streaming do protocolo: subscriptions, resource watchers, sampling callbacks, stream chunks, progress, cancellation com partial result, batch, idempotency, dry run, mocks. planned. [1.1.56]
- F-EXT-036. LLM integration: 4 protocol styles, model routing com fallback, command parsing, plan drafting/replan, reflection, cost budget halts, promptlibrary. planned. [1.1.57]
- F-EXT-037. Multi-agente fundação: identidades/roles, spawn com depth limit, task queue com lanes/work stealing, mailboxes, blackboard, budgets/scopes, killswitch. planned. [1.1.58]
- F-EXT-038. Orquestração: leader election, worker scaling, planner-executor split, critic reviews, verifier checks, tab handoffs, resource locks, consensus, escalation humana. planned. [1.1.59]
- F-EXT-039. Quatro execution environments com offscreen worker pool (capability + inline fallback) e sandboxframe com nonce. planned. [1.1.60]
- F-EXT-040. Security part one: denydefault allowlist, originprofiles, consent windows, revokerun, immutable loghash chain, maskinputs. planned. [1.1.61]
- F-EXT-041. Security part two: secretvault, redactshots, schemastrict/origincheck/connectallow, ratelimit buckets, confirmpay/confirmdelete/confirmcreds, phishguard, safedefaults, transparencypage. planned. [1.1.62]
- F-EXT-042. Session interface: sessiongrid, historysearch, sitenotes seladas, scratchpad append-only, runsummary, semanticrecall, correctionmemory, consentmemory, cancelrun rollback. planned. [1.1.63]
- F-EXT-043. Cinco superfícies de UI: popup/sidepanel/dashboard/options/onboarding + commandpalette fuzzy recent-first. planned. [1.1.64]
- F-EXT-044. Superfícies part two: datagrid/exportmenu, quickactions, shortcutkeys, omniboxtask, statusbadge/notifications/recenttray/stetoasts, pickeroverlay/targethalo/guidedtips, shotpanel/compareviewer/pagechips, siteprofiles, darklight tokens, locale bundles, importexport, featuretour, a11ylabels. planned. [1.1.65]
- F-EXT-045. Ecosystem: flowlibrary com schemastrict manifests, syncbridge opt-in, attentionfeed, background run queue, runreplay de sealed chains, outputcompare. planned. [1.1.66]
- F-EXT-046. Library modes: esm/cjs/umd + entries node/bun/deno com runtime adapters e headlesslib. planned. [1.1.67]
- F-EXT-047. Performance part one: lazymods, debouncedom, batchquery, incrsnapshot + selcache, virtlist, streamparse, chunkextract, worker backpressure, perf records. planned. [1.1.68]
- F-EXT-048. Performance part two: batch backpressure, domain limits, politedelay, adaptivepoll, requestcoalesce, runbudget/budgetalerts, timeoutcancel, tabsuspend, runcache, stepprefetch, efficientresume, navdedupe, durationmeter, selectorprofile, steptrace, startupmeter, artifactcompress, logprune, batteryaware, networkaware, readparallel, warmselectors, slowmo. planned. [1.1.69]
- F-EXT-049. Resiliência: runrecords state machine, offlinequeue com replay/expiry, idempotencykeys, checkpoints digest-validated, heartbeats + zombiecheck, rollbackrun compensations opt-in. planned. [1.1.70]
- F-EXT-050. State depth: urlhistory dedup, runtimeline, tabisolate, sessionlock, encryptrest webcrypto, quotawatch approval batches, auditexport streaming. planned. [1.1.71]
- F-EXT-051. Agentwork: spawnsubagent com scope copy narrowing, aggregatereport com conflict policy e escalation. planned. [1.1.72]
- F-EXT-052. Multi-agent part four: integração do swarm com o engine e handoffs completos. planned. [1.1.73]
- F-EXT-053. Navigation intelligence: navintent predictions por step order + urlhistory, prefetchpage com speculative dns e drop on plan change, preconnect targets. planned. [1.1.74]
- F-EXT-054. Data pipelines: runpipelinepass com pipelinetargetgate, stamping, transforms revisadas antes de persistência, streamdisk checkpoints. planned. [1.1.75]
- F-EXT-055. Web API coverage: subevents sse, longpoll com backoff do usuário, webhooks com secret + schema, correlation ids outbound. planned. [1.1.76]
- F-EXT-056. Vision/OCR: imageocr com word boxes/confidences→linhas/parágrafos, regionocr clamped, pdfocr paginado, cache-first com pairshot. planned. [1.1.77]
- F-EXT-057. Capture forensics: beforeafter runstepwithforensics, consoletimeline, run pairing sob heartbeat. planned. [1.1.78]
- F-EXT-058. Minimization: localfirst extraction no device, identity strip por review list, exportapi report nos step details. planned. [1.1.79]
- F-EXT-059. CLI tools: deep manifest checks, planlint, runworkflow com streamed progress + review gate + sealed audit + dry run, headless. planned. [1.1.80]
- F-EXT-060. Plataforma final: multi-runtime verify (node/bun/deno), servercontract site bridge, gateway adapters, mcp ci, native host bridge, cross-browser artifacts, apifreeze protocolv2, hardening (pentest/cspaudit/permdiff), agentcert/costcert, 2.0.0 platform release + 2.0.2 polish. planned. [1.1.81..2.0.2]

### F-AKA — akash (001..030)

- F-AKA-001. Provider nativo AKASH_MANAGED com internalRepoName auto-gerado e deploy access key aks_live_. planned. [web]
- F-AKA-002. Conexão de providers externos: GitHub e GitLab (EXISTING_REPO). planned. [web]
- F-AKA-003. Conexão Cloudflare/Netlify/Vercel (deploy estático/edge). planned. [web]
- F-AKA-004. Conexão AWS/Docker/Supabase/Wix (targets adicionais). planned. [web]
- F-AKA-005. DeploymentConfig por site com autoDeploy e deployMode (DIRECT_UPLOAD|EXISTING_REPO). planned. [web]
- F-AKA-006. Wizard AddSite com sugestão de estrutura por Gemini (suggestSiteStructure). planned. [web]
- F-AKA-007. generateProjectHash + sanitizeProjectId para ids de projeto seguros. planned. [web]
- F-AKA-008. getConnectionFields/CONNECTION_PROVIDERS: campos dinâmicos por provider. planned. [web]
- F-AKA-009. Config page IDENTITY|DEPLOYMENT|DNS|DANGER. planned. [web]
- F-AKA-010. Gerenciador de DNS records por site. planned. [web]
- F-AKA-011. Danger zone centralizada por site. planned. [web]
- F-AKA-012. Component library: 6 heroes (Gradient, Minimal, Split with Image, Dark, App, Video Background). planned. [web]
- F-AKA-013. Component library: 4 navbars (Modern, Centered, Dark, Glassmorphism). planned. [web]
- F-AKA-014. Component library: 3 features (Grid, Bento, Alternating). planned. [web]
- F-AKA-015. Component library: Pricing Cards + 4 CTAs (Simple, Gradient, Stats, Newsletter). planned. [web]
- F-AKA-016. Component library: 2 footers, 2 stats, Team Grid, Testimonials, Blog Cards, Logo Cloud, FAQ, Contact Split. planned. [web]
- F-AKA-017. Gallery MINE|COMMUNITY com editor DESIGN|CODE. planned. [web]
- F-AKA-018. ComponentCustomizer de props/tema por componente. planned. [web]
- F-AKA-019. GeminiChat embutido na página de componentes. planned. [web]
- F-AKA-020. Geração de conteúdo de blog por Gemini (generatePostContent). planned. [web]
- F-AKA-021. Editor drag&drop com @dnd-kit (closestCenter, arrayMove, sensors plugin). planned. [web]
- F-AKA-022. Kit glass próprio: FluidGlass, GradualBlur, GlassSurface. planned. [web]
- F-AKA-023. MetallicPaint: shader com patternScale/refraction/edge/patternBlur/liquid/speed. planned. [web]
- F-AKA-024. Home marketing com framer-motion (scroll transforms, spring, AnimatePresence). planned. [web]
- F-AKA-025. CacheService para estado e artefatos de site. planned. [web]
- F-AKA-026. i18n en/pt com translation module. planned. [web]
- F-AKA-027. xss-protection e devtools-blocker transversais. planned. [web]
- F-AKA-028. Páginas públicas + LoginPage com managed registration. planned. [web]
- F-AKA-029. Fondos animados: Aurora, Background, Bg2, CameraRig 3D. planned. [web]
- F-AKA-030. StyledSelect/Dropdown e ui kit (Button, Card, Badge, Input, CompactInput) próprio. planned. [web]

### F-SOF — SoFlowX (001..025)

- F-SOF-001. Sync layer Supabase com postura de módulo (só sincroniza/escreve; não é server/auth/game). planned. [1.0.0]
- F-SOF-002. Auth com JWT verify + revogação de token. planned. [1.0.0]
- F-SOF-003. User metadata (full_name, avatar_url) propagada do Supabase. planned. [1.0.0]
- F-SOF-004. Notes versionadas com is_public, blob_url e tags. planned. [1.0.0]
- F-SOF-005. Salas de jogo (game rooms) com estado em server próprio. planned. [1.0.0]
- F-SOF-006. Posts, comentários e likes sociais. planned. [1.0.0]
- F-SOF-007. Chats realtime via Socket.IO. planned. [1.0.0]
- F-SOF-008. Server Express + Socket.IO porta 3003 (compat Caddy). planned. [1.0.0]
- F-SOF-009. Hardening server: helmet, cors, request sanitizer. planned. [1.0.0]
- F-SOF-010. Rate limit + brute force check + IP access control. planned. [1.0.0]
- F-SOF-011. FingerprintJS visitor id para anti-abuse. planned. [1.0.0]
- F-SOF-012. DisableDevtool + DOMPurify + sanitize-html no client. planned. [1.0.0]
- F-SOF-013. AI multi-provider (9 modelos: gemini, kimi, claude, gpt4, openai, deepseek, perplexity, togetherai, xai). planned. [1.0.0]
- F-SOF-014. Opções por request de IA: context, userApiKey, systemPrompt, temperature, maxTokens. planned. [1.0.0]
- F-SOF-015. Chave de API por usuário (userApiKey) com env fallback. planned. [1.0.0]
- F-SOF-016. Integração StackOverflow API 2.3 (busca de questions). planned. [1.0.0]
- F-SOF-017. Resultados SO com score/answers/views/tags/owner/accepted_answer. planned. [1.0.0]
- F-SOF-018. Perfil SO (SOUserProfile) integrado aos resultados. planned. [1.0.0]
- F-SOF-019. getEnv/isProduction/sanitizeEnv utilitários de ambiente. planned. [1.0.0]
- F-SOF-020. Dev runner concurrently (vite + tsx/bun/node/nodemon watch). planned. [1.0.0]
- F-SOF-021. Build Vite com react-swc, tailwindcss v4 plugin e rollup obfuscator. planned. [1.0.0]
- F-SOF-022. Deploy Netlify com NODE_VERSION 25.9.0. planned. [1.0.0]
- F-SOF-023. Keywords SEO pt/en (brand, core dev, AI/LLM). planned. [1.0.0]
- F-SOF-024. checkConnection/checkTableHealth de saúde Supabase. planned. [1.0.0]
- F-SOF-025. Re-export services (zustand store, cn/twMerge) para uso independente. planned. [1.0.0]

### F-ANS — @devthink/ansi-art (001..020)

- F-ANS-001. Pacote @devthink/ansi-art ESM com exports ./, ./ink, ./cli. planned. [1.0.0]
- F-ANS-002. Text-to-ANSI FIGlet-style com FONT_STANDARD em blocos ██. planned. [1.0.0]
- F-ANS-003. Sistema de fontes extensível (CharMap, AsciiFont name/height/chars). planned. [1.0.0]
- F-ANS-004. Render options de fonte: font/foreground/background/styles. planned. [1.0.0]
- F-ANS-005. Gradientes ANSI com interpolação hex→RGB por passo. planned. [1.0.0]
- F-ANS-006. Animation engine com 10 easings (quad/cubic/quart in/out/inout). planned. [1.0.0]
- F-ANS-007. Controle de terminal: cursor hide/show, clear screen, move home. planned. [1.0.0]
- F-ANS-008. Charts bar/line/pie com cores por DataPoint. planned. [1.0.0]
- F-ANS-009. Tabelas ANSI renderizadas (table module). planned. [1.0.0]
- F-ANS-010. Boxes e bordas (box module) com estilos. planned. [1.0.0]
- F-ANS-011. Layout engine para composição de painéis. planned. [1.0.0]
- F-ANS-012. Widgets de terminal prontos. planned. [1.0.0]
- F-ANS-013. Image-to-ANSI converter com efeitos (image-to-ansi-effects). planned. [1.0.0]
- F-ANS-014. image-to-ansi-lite para conversão rápida de baixo custo. planned. [1.0.0]
- F-ANS-015. logo-to-ansi (render de logo em arte ANSI). planned. [1.0.0]
- F-ANS-016. svg-renderer (SVG→ANSI) e image-display. planned. [1.0.0]
- F-ANS-017. CLI com demo e benchmark (scripts/demo-ansi-art, benchmark-ansi). planned. [1.0.0]
- F-ANS-018. Ink components (export ./ink) para UIs React no terminal. planned. [1.0.0]
- F-ANS-019. Web preview com Vite + vitest + biome check chain. planned. [1.0.0]
- F-ANS-020. Utils de cor (fg/bold/dim/visibleLength) respeitando largura visível. planned. [1.0.0]

### F-GL — gl / Gambiarra Labs (001..015)

- F-GL-001. Root orchestrator ES modules (HOME, IDENTITY, ARCHIVE, UPLINK, HEADER, FOOTER, FX_LAYERS). planned. [web]
- F-GL-002. Auto-translate pt/en com cache localStorage v4. planned. [web]
- F-GL-003. Language selector persistido em app-lang. planned. [web]
- F-GL-004. SFX engine com click/transition/glitch (catbox) e preloader. planned. [web]
- F-GL-005. WebAudio com PCM noise buffer sintetizado + keys ativas. planned. [web]
- F-GL-006. AUTOCLICK de simulação de clique nativo para autoplay. planned. [web]
- F-GL-007. HERO slider de projetos com Swiper.js. planned. [web]
- F-GL-008. Search client-side com index sobre section-container. planned. [web]
- F-GL-009. Loader CRT com arte ASCII neon da marca. planned. [web]
- F-GL-010. Seção TERMINAL de identidade (Michel Leonardo, Go/Assembly/C). planned. [web]
- F-GL-011. GITHUB_API com fetch de repos (15, sort updated) e fallback silencioso. planned. [web]
- F-GL-012. Seção YOUTUBE integrada ao canal. planned. [web]
- F-GL-013. MARKDOWN renderer para conteúdo. planned. [web]
- F-GL-014. UPLINK com form de contato + LINKS. planned. [web]
- F-GL-015. FX_LAYERS de efeitos visuais + ARCHIVE de projetos. planned. [web]

### F-NTH — nathlan (001..015)

- F-NTH-001. AKIA engine com zero layout shift (root opacidade 0→1). planned. [web]
- F-NTH-002. Injeção paralela de dependências (CDN tailwind + babel standalone). planned. [web]
- F-NTH-003. Import map declarado no loader. planned. [web]
- F-NTH-004. design.ts centralizado (palette/typography/positioning) injetado no boot. planned. [web]
- F-NTH-005. Logo/Orb three.js com SVGs ?raw como single source. planned. [web]
- F-NTH-006. WelcomeScreen com gate de assets carregados + exit animado. planned. [web]
- F-NTH-007. AudioController com FX_PROFILE de 9 bands calibradas (48kHz/16bit). planned. [web]
- F-NTH-008. PageTransition global entre seções. planned. [web]
- F-NTH-009. FloatingSidebar de navegação. planned. [web]
- F-NTH-010. Páginas Founders/FounderDetail + Services + Portfolio/ProjectDetail. planned. [web]
- F-NTH-011. ProductsPage + CheckoutPage + SettingsPage. planned. [web]
- F-NTH-012. DevTools Killer anti-inspeção (debugger loop condicionado). planned. [web]
- F-NTH-013. supabaseClient com env obrigatórias warnadas. planned. [web]
- F-NTH-014. Cache layer própria (ts/cache). planned. [web]
- F-NTH-015. DedicatedPageWrapper para páginas dedicadas por projeto. planned. [web]

### F-SCM — soochimp / NewsChimp (001..010)

- F-SCM-001. Feed de top headlines + busca + categorias. planned. [web]
- F-SCM-002. ReaderModal com @mozilla/readability e extração de imagem real. planned. [web]
- F-SCM-003. Tradução de artigos pt/en/ja em chunks via proxies. planned. [web]
- F-SCM-004. TranslationToggle global por leitura. planned. [web]
- F-SCM-005. Registro unificado de libraries CDN (utility/chart/animation) com loader useLibraries. planned. [web]
- F-SCM-006. PWA standalone com window-controls-overlay e icon.svg any-size. planned. [web]
- F-SCM-007. Service worker v9 com precache + runtime cache + filtro de ad domains. planned. [web]
- F-SCM-008. Google Ads condicionado a VITE_GOOGLE_ADS_ID. planned. [web]
- F-SCM-009. Cookie consent + ErrorBoundary globais. planned. [web]
- F-SCM-010. Layout responsivo TopBar/SideBar/MobileNav + Netlify toml na raiz. planned. [web]

### F-BOB — bob (001..010)

- F-BOB-001. Manifest MV2 com omnibox keyword `bob`. planned. [0.6.0]
- F-BOB-002. Background page persistente (MV2). planned. [0.6.0]
- F-BOB-003. Content script document_start em all_frames sobre file/http/https. planned. [0.6.0]
- F-BOB-004. Permissions de proxy + webRequestBlocking. planned. [0.6.0]
- F-BOB-005. Notifications e storage/unlimitedStorage. planned. [0.6.0]
- F-BOB-006. sql-wasm.wasm acessível ao conteúdo (SQLite no browser). planned. [0.6.0]
- F-BOB-007. Stack bcoin vendida (bsert/bufio/bcrypto) para cripto Handshake. planned. [0.6.0]
- F-BOB-008. Stack bns vendida (DNS Handshake portado de miekg/dns). planned. [0.6.0]
- F-BOB-009. Handshake swarm/peer protocol com handshakeTimeout e signed messages. planned. [0.6.0]
- F-BOB-010. Popup UI com bundling webpack próprio. planned. [0.6.0]

### F-IAK — iakadion (001..010)

- F-IAK-001. README hub central do perfil (musician/filmmaker/developer/designer/writer/game creator/inventor/artist). planned. [profile]
- F-IAK-002. Typing SVG animado com as 8 identities. planned. [profile]
- F-IAK-003. Badges de 12 redes sociais com links diretos. planned. [profile]
- F-IAK-004. Windjet hero.svg 900px de capa. planned. [profile]
- F-IAK-005. Windjet whoami.svg de seção. planned. [profile]
- F-IAK-006. Windjets projects1-3.svg de galeria de projetos. planned. [profile]
- F-IAK-007. Windjet status.svg de estado atual. planned. [profile]
- F-IAK-008. Windjet creative-support.svg de serviços/criação. planned. [profile]
- F-IAK-009. Tech arsenal em 7 linhas de skillicons (28 stacks). planned. [profile]
- F-IAK-010. svg/connect.svg como call-to-action de contato no site (html/index + deploy yml). planned. [profile]

---


## FASE 8b — Welcome/SSOT + pesquisa duck.ai (50 features F-DTK-950..999)

Onboarding SSOT versionado, receipts denied-by-default, plugin zai (auth.json 13 cookies),
gateway V1-V3, TSX→iOS/EAS, OTA itms-services, self-hosted stack.
Bloco completo: «onda8b-welcome-notes.md § FEATURES».


| ID | Feature (planned — capacidade nova introduzida pela fonte) | Fonte |
|----|----------------------------------------------------------------|-------|
| F-DTK-950 | Welcome SSOT versionado por snapshots progressivos com gap-fills aditivos (v1.8.5→v1.8.18) (planned) «W2:1740-2198; W18a:320-341» |
| F-DTK-951 | capabilityreport() serializável por eixos execution/runtime/memory/file/dependency/visibility/pair (planned) «W18a:80-85» |
| F-DTK-952 | Mode resolver sem efeito (`saddle modes`) que retorna profile+capability map sem iniciar server/browser (planned) «W2:382-384» |
| F-DTK-953 | Política de execução denied-by-default serializável (1.8.18) (planned) «W18a:104-107» |
| F-DTK-954 | Camada release-evidence policy-evaluable com receipts honestos (136 tests) (planned) «W18a:338; W2:1757-1766» |
| F-DTK-955 | runtimecontract + memorystorage + root ESM entry para APIs runtime-specific e package loaders (planned) «W18a:84-85» |
| F-DTK-956 | controlsurface/controlservice auditável montável atrás de qualquer Web Request/Response (planned) «W18a:57-59» |
| F-DTK-957 | n8n node/match/execute como superfície declarativa do engine (planned) «W18a:56» |
| F-DTK-958 | desktopmanifest/mobilemanifest + desktopadapter/mobileadapter caller-owned (planned) «W18a:83» |
| F-DTK-959 | Extensão MV3 com permissão mínima storage e rehidratação por evento (planned) «W2:452-454» |
| F-DTK-960 | appregistry + commandguard + deliveryqueue com dead-letter e idempotência (planned) «W2:1528» |
| F-DTK-961 | operationsmetrics/retentionpolicy/backupplan/threatmodel como pacote de operação (planned) «W18a:50-51» |
| F-DTK-962 | SCDN com scdn.yml + retry linear e providers de edge plugáveis (planned) «W2:784-791» |
| F-DTK-963 | farm.py round-robin dispatch parando no primeiro runner livre HTTP 204 (planned) «W2:807» |
| F-DTK-964 | MemoryEngine 8 backends com load/persist/release/safeLoad e transforms ~2× (planned) «W2:230-241» |
| F-DTK-965 | StorageRAMBridge map/sync/read/write/grow/close com mmap flags e grow zero-copy via ftruncate (planned) «W18a:136-137» |
| F-DTK-966 | Browser mesh de 4 bibliotecas + Quarto backup factory com delta-sync Fletcher-32 (planned) «W2:1332-1352» |
| F-DTK-967 | Defesa OOM 3 camadas (RangeError → watchdog 500ms → snapshot rollback) (planned) «W2:317; W18a:123» |
| F-DTK-968 | Onboarding CLI com usuário temporário persistente e ID aleatório curto (planned) «PC6» |
| F-DTK-969 | Login CLI via GitHub Pages link temporário + código temporário (planned) «PC7» |
| F-DTK-970 | auth.json dual-path redundante com 13 cookies Z.AI (planned) «N19:23» |
| F-DTK-971 | Plugin zai.ts auto-contido (sem export, sem package.json, puxa config do opencode.json) (planned) «N19:19-21» |
| F-DTK-972 | test-zai.cjs de validação login+cookies+streaming (planned) «N19:26» |
| F-DTK-973 | Sync bidirecional CLI↔web com botão "conectar com a CLI" (planned) «PC7» |
| F-DTK-974 | IDs de usuário/workspace/chat personalizados com teto de 15-16 caracteres (planned) «PC6» |
| F-DTK-975 | Gateway V1 ZAI sem chave com 6 modelos GLM e padrão 2-calls (planned) «LT:21» |
| F-DTK-976 | Gateway V2 Babel Town com rotação townkey e fallback automático (planned) «LT:22» |
| F-DTK-977 | Gateway V3 NVIDIA com round-robin de 25 chaves e 94 modelos (planned) «LT:23» |
| F-DTK-978 | Meta-modelo devthink com rotação a cada 6 mensagens e contexto 4.78M (planned) «LT:23,25» |
| F-DTK-979 | model-registry.ts com export-redirect entre versões V1/V2/V3 (planned) «LT:26» |
| F-DTK-980 | Registro de chaves NVIDIA via script antes do build (keys:register) (planned) «LT:32-33» |
| F-DTK-981 | Prisma schema >1000 campos sem duplicação com convenção status/keyValue/lastUsedAt (planned) «LT:30-31» |
| F-DTK-982 | Preservação git total: branches protect + git replace --graft para parents perdidos (planned) «LT:103-105» |
| F-DTK-983 | Pipeline TSX→iOS via Expo/EAS com estrutura raiz sem src (planned) «DK1:13-18,1160-1210» |
| F-DTK-984 | Instalação OTA iOS via itms-services + manifest.plist hospedado (planned) «DK3:1075-1110» |
| F-DTK-985 | Assinatura APK self-service com keystore JKS e apksigner verify (planned) «DK3:700-800» |
| F-DTK-986 | Fallback PWA para iOS enquanto não há conta Apple Developer (planned) «DK3:680-690» |
| F-DTK-987 | Android virtual em browser via emulator-container-scripts + WebRTC (planned) «DK5:120-160» |
| F-DTK-988 | Runner de CPU virtual com stack Unicorn/Capstone/Keystone controlado por Node (planned) «DK4:1120-1210» |
| F-DTK-989 | Plataforma de e-mail self-hosted inspirada em Mailflare (Stalwart/Hyvor/listmonk como blocos) (planned) «DK6:25-95» |
| F-DTK-990 | Search stack self-hosted Exa-like (SearXNG+Crawl4AI+Qdrant+browser-use) (planned) «DK7:15-40» |
| F-DTK-991 | Catálogo curado de 30 sites/jogos 3D browser como referência de acabamento (planned) «DK8:20-100» |
| F-DTK-992 | Truthful static playground: preview honesto sem efeitos antes do handoff (planned) «W18a:104-107» |
| F-DTK-993 | Remote-browser capability contract do control plane 1.8.19 (planned) «W18a:126-131» |
| F-DTK-994 | Estados de assinatura explícitos em release (unsigned…store-signed) (planned) «W18a:314-315» |
| F-DTK-995 | Release com 38 assets multi-plataforma nomeados por os/abi/ext (planned) «W18a:310-311» |
| F-DTK-996 | GHCR OCI manifest index multi-arch (amd64/arm64/ppc64le) com QEMU antes do Buildx (planned) «W18a:340-341» |
| F-DTK-997 | Build WASM content-hashed com wasm-opt -O3 + manifesto.json (planned) «W2:2137-2138» |
| F-DTK-998 | Onboarding de provider no CLI: teste único `$ opencode --model zai/glm-5.2 --format json` (planned) «N19:14» |
| F-DTK-999 | Dedup de acervo por md5 + diff normalizado (whitespace/CR) com tabela nominal de pulos (planned) «método desta onda» |

---


## FASE 8c — UI real Neo DevThink (50 features F-DTK-900..949)

9 contextos SOL/KROMA/VORTEX/MOVA/PRISMA/CORO/FOLD/LUMEO/MESTRAE, OS Aura (ChatPage dupla-visão,
Internal Cognition), KROMA Web Audio (LFO/export .ics/⌘K), landings com atlas, THREE.js paramétrico.
Bloco completo: «onda8c-tsx-blobs.md § FEATURES».


**Sistema de contextos (9 apps + hook)**
- F-DTK-900. useStoredState: hook de persistência genérico localStorage+validador com fallback seguro «useStoredState(1).ts»
- F-DTK-901. Contexto SÖL: cursos/trilhas com savedTracks, planos, lições completadas e limpeza total «SolContext(1).tsx»
- F-DTK-902. Contexto KROMA: mentores, presets de áudio, aurora pods, wallet, sprints e projetos «KromaContext(1).tsx»
- F-DTK-903. Contexto VORTEX: membros, bundles, deck, billing cycle, newsletter e demo «VortexContext(1).tsx»
- F-DTK-904. Contexto MOVA: workspace completo (trilhas, aulas, reservas, brief, quiz result) «MovaContext(1).tsx»
- F-DTK-905. Contexto PRISMA: programs/guides/works com bookings, peças de mural e missão «PrismaContext(1).tsx»
- F-DTK-906. Contexto CORO: programas, missão diária com clamp, comunidade (members ≤40) «CoroContext(1).tsx»
- F-DTK-907. Contexto LUMEO: módulos, pricing, projetos salvos com cap 50 «LumeoContext(1).tsx»
- F-DTK-908. Contexto MESTRAE: mentores, pack fixo, aulas completadas «MestraeContext(1).tsx»
- F-DTK-909. Contexto FOLD: favoritos mínimos de projetos (47 linhas, escalonamento para baixo) «FoldContext(1).tsx»

**KROMA Studio (features de produto)**
- F-DTK-910. Busca global com ⌘K, normalização de diacríticos, 3 grupos de resultados e role=status «Panels (2).tsx»
- F-DTK-911. Ficha de mentor com rating, skills-chip, salvar e CTA de sprint nomeado «Panels (2).tsx»
- F-DTK-912. Agendamento de sprint 1:1 com 5 timeslots, tópico por skill e recibo com código KR- «Panels (2).tsx»
- F-DTK-913. Export .ics da reserva via Blob+download sem servidor «Panels (2).tsx»
- F-DTK-914. Project wizard com multiseleção de ferramentas e resumo aurora/áudio ativos «Panels (2).tsx»
- F-DTK-915. Confirmação de plano com preço mensal/anual e checklist de perks «Panels (2).tsx»
- F-DTK-916. Atlas modal 3 abas: referências accordion, design system (paleta+tipografia), redistribuição em tabela «Panels (2).tsx»
- F-DTK-917. Copiar tokens CSS e baixar mapa-visual .md do atlas «Panels (2).tsx»
- F-DTK-918. Privacy modal client-first com danger-zone de reset 2 etapas «Panels (2).tsx»
- F-DTK-919. Sintetizador Web Audio procedural: presets com LFO de respiração, envelope 1.2s/0.4s, analyser fftSize 64 «KromaContext(1).tsx»
- F-DTK-920. Aurora Engine: pods de emissão com backdrop radial dinâmico e badge glass por cor «AuroraEngine(1).tsx»
- F-DTK-921. AssetVault: carteira com transferência validada (NaN, saldo) e light curtains «AssetVault(1).tsx»
- F-DTK-922. Kinetic Flow: slider de foco gravado no estado persistido «KineticFlow(1).tsx»
- F-DTK-923. Collab Chain: grade intertravada com slots, contador de sprints e doodles à mão «CollabChain(1).tsx»
- F-DTK-924. Mentorship Grid: filtro por 5 disciplinas + busca em name/role/skills «MentorshipGrid(1).tsx»

**OS Aura (shell + chat)**
- F-DTK-925. Shell OS de 8 páginas com sidebar, topnav, floating toolbar e janela liquid-glass «App (2).tsx»
- F-DTK-926. Chat Aura com dupla visão hero↔conversa e transição AnimatePresence «ChatPage(1).tsx»
- F-DTK-927. Composer liquid-glass 32px com upsell Pro e assinatura Assistant v2.6 «ChatInterface(1).tsx»
- F-DTK-928. Indicador de geração "Aura está processando…" com dot pulsante «ChatInterface(1).tsx»
- F-DTK-929. MessageBubble com Internal Cognition recolhível (scanline) e carimbo Aura Pro «MessageBubble(1).tsx»
- F-DTK-930. Histórico agrupado Today/Previous 7 Days com hover accent #FF5C00 «HistoryPage(1).tsx»
- F-DTK-931. Página de busca full-screen com recentes e focus ring laranja «SearchPage(1).tsx»
- F-DTK-932. Seletor de 5 temas runtime com swatches (default/dark/pitch-black/nordic-forest/sunset-royal) «SettingsPage(3).tsx»

**VORTEX (landing produto)**
- F-DTK-933. Hero com toggle interativo embutido no headline (spring 500/30) «Home (6).tsx»
- F-DTK-934. Deck de telemetria com prateleira recortada e card focused «Home (6).tsx»
- F-DTK-935. Grafo de infra com nós clicáveis e tooltip de status «Home (6).tsx»
- F-DTK-936. Dashboard FaiPy tablet com abas funcionais e chart de barras sin() «Home (6).tsx»
- F-DTK-937. Pricing com billing toggle −25% e card destaque glow «Home (6).tsx»
- F-DTK-938. Painéis deck/member/bundle/pricing/demo/search/atlas 1:1 com as seções «Panels (8).tsx»

**VOLTHAUS / VOLTA / utilidades transversais**
- F-DTK-939. Nav glass que encolhe no scroll (useScrolled) com telemetria viva e CTA fixo chev-cut «App(104).tsx»
- F-DTK-940. Console-mockup com sidebar, curva SVG com gradiente e lista de ativos «App(104).tsx»
- F-DTK-941. Scenario cards com gradiente radial por clima de mercado e descrição por hover «App(104).tsx»
- F-DTK-942. FAQ 2 colunas com accordion height animado e ícone + rotativo 45° «App(104).tsx; App(180).tsx»
- F-DTK-943. VOLTA brief: contato sem backend com mailto + download .txt + honeypot «App(180).tsx»
- F-DTK-944. VOLTA Reference Map modal com paleta/geom/efeitos por referência e download do mapa «App(180).tsx»
- F-DTK-945. MotionConfig reducedMotion="user" global + skip link «App(180).tsx»

**LOOPA / MOVA / AURA viagem**
- F-DTK-946. LOOPA: 8 janelas tipadas, ⌘K, lista/seguir/assinatura persistidos e carrossel wrap-around «App(13).tsx»
- F-DTK-947. MOVA Workspace: 4 abas com contadores, progresso inline, cancelamento 2 etapas e .ics «WorkspacePanels(1).tsx»
- F-DTK-948. MOVA Lab: gerador de plano de 4 semanas por template determinístico com export md/txt/json «WorkspacePanels(1).tsx»
- F-DTK-949. AURA viagem: StayDetail com galeria, StoryPlayer autoplay 5.5s reduced-motion-aware, ArticleDetail com próxima leitura e scrollspy de nav «TravelDialogs(1).tsx; SectionsA (1).tsx»

---


## FASE 8d — captures/infra/IMG (45 features F-DTK-840..849 + F-NPD-015..049)

Captures/sandbox/VFS/relay/PCM/backloop/Three.js TSL + anotepad catálogo.
Bloco completo: «onda8d-captures-img.md § FEATURES».


### F-DTK-840..849 — captures/infra/IMG (todas planned, devthink v10.x)

- [ ] F-DTK-840: Media capture pipeline runtime — 5 kinds (shotview/fullpage/element/region/contactsheet), formats png/jpeg/webp, targets memory/download/clipboard, defaults png+ratio1+memory [v10.0.0] «capture.txt»
- [ ] F-DTK-841: Full-page stitched capture com tile plan, cross-fade de seams, skip de fixed header e fallback tiled por viewport-cross [v10.0.0] «capture.txt:135-191»
- [ ] F-DTK-842: Contact sheet generator — grade labelada escolha-do-usuário, captions none/index/selector/label-composto [v10.0.0] «capture.txt:204-226»
- [ ] F-DTK-843: Capture naming + annotation plan — slug run-step-seq-kind único por run, marker de step, outline +2px, footer ISO·URL [v10.0.0] «capture.txt:228-263»
- [ ] F-DTK-844: Capture Platform UKA — cursor SVG via CDP, SessionEvent tipado, humancursor bezier+jitter+overshoot, replay determinístico por seed, export JSON compactado em docs/logs [v10.0.0] «05.capture.platform.txt»
- [ ] F-DTK-845: Browser screenshot feedback loop — comparison sheet side-by-side, deterministic viewer com gate __interactive, framing match ~98%, scorecard 5 camadas, decision matrix refine-spec/refine-code/request-input/continue [v10.0.0] «render_capture.txt»
- [ ] F-DTK-846: FlashLite sandbox iframe — shell srcdoc origin opaco, CSP allowlist, FlashLiteAPI/Runtime, framework detect html/react-tsx/python, highlight por componentId, streaming edit de componente [v10.0.0] «Sandbox.txt»
- [ ] F-DTK-847: VFS builder hierárquico — pasta=página, FILE delimiters, componentes PascalCase endereçados 3 níveis, package.json react19/lucide/framer-motion gerado [v10.0.0] «vfs.txt»
- [ ] F-DTK-848: Autopilot CI esteira autônoma — 6 fases com states, supervisor de ressurreição, daemonize duplo-fork, faxina GHCR latest-stale com decisão manual de shared-latest [v10.0.0] «autopilot-2014.txt;supervisor-2014.txt;daemonize.txt»
- [ ] F-DTK-849: Catálogo IMG pipeline — inventário por extensão/hash de 423 assets, dedup md5, variantes webp/avif derivadas, endereçamento a (N).ext [v10.0.0] «inventário neoimg»

### F-NPD-015..049 — capacidades de plataforma Neo (captures/infra/IMG catalog, todas planned)

- [ ] F-NPD-015: Capture policy beforeafter com shotpair e skip reasons auditáveis [v10.0.0] «capture.txt:112-133»
- [ ] F-NPD-016: Whitelist de normalização de opções de captura (nada desconhecido ecoa) [v10.0.0] «capture.txt:18-28»
- [ ] F-NPD-017: Region capture com regionsteps clampado e dedupe de scroll tops [v10.0.0] «capture.txt:193-202»
- [ ] F-NPD-018: Form state capture embutido em navigate/action do sandbox [v10.0.0] «Sandbox.txt:31-67»
- [ ] F-NPD-019: Interceptação universal de cliques com slug de texto 2–50 chars [v10.0.0] «Sandbox.txt:112-181»
- [ ] F-NPD-020: Runtime detect html/react-tsx/python com handshake RUNTIME_DETECTED [v10.0.0] «Sandbox.txt:70-96,468-473»
- [ ] F-NPD-021: Sandbox highlight/hover por data-component-id com ring padrão [v10.0.0] «Sandbox.txt:227-244»
- [ ] F-NPD-022: Streaming component edit em temp container com strip de fences [v10.0.0] «Sandbox.txt:245-265»
- [ ] F-NPD-023: Font whitelist Google-Fonts-only no head gerado do sandbox [v10.0.0] «Sandbox.txt:192-200,388-405»
- [ ] F-NPD-024: Kit de micro-animações do shell (float/glow/shimmer/gradient + glass/bevel/hover-lift) [v10.0.0] «Sandbox.txt:286-332»
- [ ] F-NPD-025: detectLanguage por extensão + fallback por conteúdo [v10.0.0] «vfs.txt:8-30»
- [ ] F-NPD-026: Component snippet extractor 3 níveis (comment/data-id/id) [v10.0.0] «vfs.txt:35-54»
- [ ] F-NPD-027: Projeto VFS com stubs de componente endereçados (data-component-id wrapper) [v10.0.0] «vfs.txt:182-201»
- [ ] F-NPD-028: Dispositivo virtual PCM /dev/pcm0 (PCMTile Rust + PCMDriver TS SaddleDevice) [v10.0.0] «wss.txt:128-154»
- [ ] F-NPD-029: CDN content-addressed pcmv1 — página 1KB, SHA256, immutable, manifesto merkle_root [v10.0.0] «wss.txt:137»
- [ ] F-NPD-030: Delta sync de páginas sujas Fletcher-32/MurmurHash [v10.0.0] «wss.txt:138»
- [ ] F-NPD-031: CoW block device 48-bit com IndexedDB LRU 512MB e miss via HTTP Range [v10.0.0] «wss.txt:139»
- [ ] F-NPD-032: Drift-as-versioning com DAG G(t) e active forgetting GC [v10.0.0] «wss.txt:139»
- [ ] F-NPD-033: Isolamento multi-tenant WASI capability-based com fuel metering 50M/5s/256MB [v10.0.0] «wss.txt:140»
- [ ] F-NPD-034: HTTPS localhost via local CA (mkcert/Caddy/vite-plugin-mkcert) com wildcard loopback [v10.0.0] «llms.txt:27-48;llms-full (3).txt:55-61»
- [ ] F-NPD-035: Multi-host HTTPS gateway SNI + reverse proxy x-forwarded-proto [v10.0.0] «llms-full (3).txt:100-104»
- [ ] F-NPD-036: Cert pack self-signed com install one-time e política never-fallback em segredo inválido [v10.0.0] «llms-full (3).txt:65-96»
- [ ] F-NPD-037: Three.js TSL shader authoring (WebGPURenderer + NodeMaterial + await init) [v10.0.0] «llms-full (2).txt:36-86»
- [ ] F-NPD-038: RenderPipeline multi-pass TSL (scene+post+compute unificados) [v10.0.0] «llms-full (2).txt:1417-1420»
- [ ] F-NPD-039: Shader module gallery (FXAA/GTAO/SSR/SMAA/SSAO/Bloom/Luminosity/Kaleido/…) no catálogo de efeitos [v10.0.0] «llms-full (2).txt:2660-2781»
- [ ] F-NPD-040: TSL utilities kit (oscillators, random/hash, remap, packing normal↔RGB) [v10.0.0] «llms-full (2).txt:1374-1416»
- [ ] F-NPD-041: CDN module loader esm.sh + new Function com require fallback, tooling pesado fora do node_modules [v10.0.0] «cdn.txt:1-16»
- [ ] F-NPD-042: Registro MIME canônico com override por usuário (~/.mime.types) [v10.0.0] «mime.types (2).txt:1-23»
- [ ] F-NPD-043: Catálogo de 80+ formatos com previewable/editable/requiresLibrary por extensão [v10.0.0] «constants (1).txt:3-121»
- [ ] F-NPD-044: CDN library registry ~90 libs pinadas por categoria [v10.0.0] «constants (1).txt:242-385»
- [ ] F-NPD-045: Google Fonts catalog com weights por família e 5 categorias [v10.0.0] «constants (1).txt:391-435»
- [ ] F-NPD-046: Temas de plataforma void-black e Electric Iris como token sets versionados [v10.0.0] «variables.txt;variables (1).txt»
- [ ] F-NPD-047: Lambda runtime vc-config nodejs22.x com response streaming [v10.0.0] «vc-config (1).txt»
- [ ] F-NPD-048: Dependabot hardening (package-ecosystem explícito + workflows não-vazios) guiado por auditoria [v10.0.0] «dependabot.txt;AUDITORIA-DADOS.txt»
- [ ] F-NPD-049: Acervo indexado de duplicação (manifest 627 únicos zip/rar + node_modules hash-index + catálogo 452 serviços) [v10.0.0] «lista_arquivos.txt;deps.txt;services.txt»

---


## FASE 9 — contexto-v9 re-baixado (19 features novas)


> Máximos por prefixo no consolidado (verificados por grep ANTES de numerar): DTK-999 (fechado),
> CTI-099, DBN-099, SDL-224, SHD-050, ANS-020, ARG-028, CAD-026, EXT-060, NPD-049, AKA-030,
> SOF-025, OWN-014, NTH-015, GL-015, SCM-010, IAK-010, BOB-010. Novas features abaixo continuam
> a partir do máximo de cada prefixo; fontes = catálogos [P]/[N] dos itens 19-20 da tabela.
> ATENÇÃO orquestrador: v9 traz catálogos com esquemas DT-999/SDL-999/GTR-817/DEB-385/CDV-390/
> STH-353/ARG-405/ANS-312 (~4.660 IDs) NÃO-mapeados 1:1 para F-*; mapear antes de fundir em massa.

- F-SDL-225. Roster completo de sandboxes catalogadas com storage-as-virtual-RAM em 5 camadas. planned. «FEATURES-saddle.md v2»
- F-SDL-226. Tiers de virtualização L1-L4 (CPU/GPU/memória em software) selecionáveis por sandbox. planned. «FEATURES-saddle.md»
- F-DBN-100. Faust DSP compilado para WASM no motor de áudio. planned. «features-part2.md DEB-710»
- F-DBN-101. Rubber Band time-stretching (C++ bundled GPL). planned. «features-part2.md DEB-711»
- F-DBN-102. Rubber Band pitch-shifting. planned. «features-part2.md DEB-712»
- F-DBN-103. Pool de workers por núcleo de CPU com transferência ArrayBuffer zero-copy. planned. «features-part2.md DEB-713/714»
- F-DBN-105. Cache de modelos ONNX via Cache API + quantização int8 (poda de nós + fusão de camadas + destilação professor-aluno). planned. «features-part2.md DEB-715..718»
- F-SHD-051. Engine Versawase embutida com gameplay FPS, multiplayer/rede e progressão em 12 seções. planned. «FEATURES-stealthhead.md (~1.220 features)»
- F-CAD-027. Renderização fatiada paralela de vídeo: pedaços de 10s, preview = final premium. planned. «features-part1.md DT-268 (motor compartilhado cadria)»
- F-CAD-028. Codecs/WebGPU/3D com engine Versawase no editor estilo After Effects/Figma/DaVinci. planned. «FEATURES-cadria-video.md (~1.465 features)»
- F-ANS-021. Conversão imagem→ANSI com dithering, subpixel/adaptive e ASCII fallback em 21 categorias. planned. «FEATURES-ansi-art.md v2 (1000+)»
- F-ANS-022. Outputs ANSI/SVG + formatos animados + special sources + image statistics & palettes. planned. «FEATURES-ansi-art.md v2»
- F-ARG-029. DNSSEC/DANE + DoT/DoH/DoQ/DoH3 + ACME + gestão de zonas e scraping de DNS. planned. «FEATURES-dns-argan.md»
- F-ARG-030. Gateway de chat retransmissor de inferência integrado à engine Argan (CLI + UI web admin). planned. «FEATURES-dns-argan.md»
- F-CTI-100. Abas solo/vinculadas com docking + mesclagem de abas e camadas híbridas na caixa de chat. planned. «features-part1.md DT-269/270 (UI compartilhada chat)»
- F-CTI-101. Salvamento automático após 3-5s parado + +1000 componentes TSX na pasta actions. planned. «features-part1.md DT-273/274»
- F-NTH-016. IA como usuário: @lookup, super-root, funciona como time de 30+ devs (hierarquia Maestro-Soldado-Arma). planned. «features-part1.md DT-265/275»
- F-GL-016. Gateways porteiros IO-only — servidores só despacham entrada/saída (web 8080 + porta dedicada IA). planned. «features-part1.md DT-266/267»
- F-GL-017. Supabase como DB principal com auto-sharding no limite de 50k usuários/projeto; planos Free→Sponsor→Criadores ilimitado. planned. «features-part1.md DT-271/272»


## Log de ondas

| Onda | Fontes | Features novas | Status |
|------|--------|----------------|--------|
| 0 | features.txt (AetherForge) + regras-APP.md | ~200 | ✅ seed |
| 4a–4d | neodocs devthink/saddle/debonair/stealthhead+raiz | 409 | ✅ |
| 5 | neoskills design → UI devthink | 55 (+30 specs CSS) | ✅ |
| 6a | anotepad + notes + aiactions | 114 | ✅ |
| 6b | cadria + argan + owni + cli/vídeo | 94 | ✅ |
| 7a–8d | changelogs + chatinterface + opencode + design-css2 + apps + welcome + tsx + captures (8 ondas) | 619 | ✅ |
| 9 | contexto-v9 re-baixado (wormhole 70loEk) | 19 | ✅ |

## Contagem consolidada

> **Total global v9: 631 features** (14 prefixos + FASE 9 contexto-v9; 19 novas na onda 9). Contagem por onda: ver Log de ondas e regras.md.

| App | Seed | Onda 4 | Fase 5 | Fase 6 | Total | Meta |
|-----|------|--------|--------|--------|-------|------|
| devthink | 82 | 135 | 55 | 126 (F-DTK-500..625) | 398 | 4.000 |
| saddle | 88 | 125 | — | — | 213 | 4.000 |
| debonair | 12 | 99 | — | — | 111 | 1.000 |
| cadria | 6 | — | — | 26 | 32 | 1.000 |
| stealthhead | 6 | 50 | — | — | 56 | 1.000 |
| argan | 6 | — | — | 28 | 34 | 1.000 |
| owni (embutido) | — | — | — | 14 | 14 | — |
| anotepad (NPD) | — | — | — | 14 | 14 | — |
| getry | 35 | — | — | — | 35 | 1.000 |
| **TOTAL** | **235** | **409** | **55** | **208** | **907** | — |

- **Meta por app: >1.000 features** (média 400, mín 600, máx 4.000, 99/versão)
- Ondas 7–8 continuam o append por app.
