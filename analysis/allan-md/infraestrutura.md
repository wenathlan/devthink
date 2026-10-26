# infraestrutura

the single infrastructure document of the family. it consolidates the whole corpus of the family repositories from the pinned base to the current head, the ten final documents of the reduction, and the full feature extraction of the reading waves — more than two thousand unique features deduplicated by concept into one map. it is self-contained: no source names, no paths, no references outside itself. it records what the family is, engine by engine, app by app, with the lawful constants of the design and the infrastructure preserved — ports, budgets, quotas, sizes, version pins.

## objectives hierarchy

the objectives of the operation, as ordered by the owner.

### p0 — storage sandbox working
- the storage engine and the sandbox engine fully functional: the vault storing through git objects, the saddle running every modality
- the sandbox born with every conversation, executing and persisting, with the virtual file system under quota
- storage equals compute: the same bytes, the usage flag decides between working set and persistence

### p1 — competitor features functional inside our infrastructure
- every feature the competitors ship, working inside the family infrastructure, on the family domains, under the family laws
- features are judged against the reference apps of the market, never copied as code — the competitor is a spec, not a vendor
- imports between apps through published libraries; zero duplication of logic anywhere in the family

### p2 — one hundred percent modern design
- one design system serving every surface: web, desktop, tv, mobile, cli and extension
- the system app carries the complete windows identity over the surface ruler; the family apps are applications inside windows frames, each with its own accent
- the same build is vertical on the phone and horizontal on tablet, tv and desktop; the only difference is responsiveness, density and the packaging tool
- any app below the golden reference page is rebuilt from zero, never patched

### p3 — releases
- one tag, one immutable release for the family, with the full asset matrix attached and every gate green
- the lanes publish per app as they finish; the gate closes only with everything functional and the extension present in the assets
- the bump loop repeats until the dashboards read zero, zero, zero

### master rules
- the fifteen engines of the root manifest orchestrate everything; node is the master orchestrator of gateway, workflows and tool servers
- no tool, framework or library is forbidden, from the moment it is orchestrated by the engines; the catalog grows without limit and nothing is discarded
- node and the native packages are the core; the fast runtime is the bet for one-shot work; the stable runtime serves the network services
- the design system serves every app and appears in the cli — the same interface renders in the terminal, pretty with white tabs
- a folder is a page is an app; the folder name is the app name; the tree is flat
- each app owns exactly one responsibility; the others import its published library — never a duplicated logic, never a cross-folder import
- the database is shared across the family: one signup, one account, recognized in every app
- the clones of the family redirect among themselves; deployable templates convert to any platform
- the interface never touches the machine of the visitor: no browser storage as source, no gpu, cpu, camera or location — only loading, over the family domains, through the standard web transport
- the chat talks to the gateway and nothing else; the provider kit never reaches the client
- the gateway registration is opt-in; the natural state of the chat is disconnected
- one interface everywhere: cli equals web equals tv — the same component tree compiles to browser, terminal, cli, tv and android

## infrastructure-wide systems

the systems that every app shares. each lives inside one owning app; the others import it.

### storage — the vault doctrine
- git objects are the source of truth: the repository is the disk of the platform; code, assets and information live as objects under the library bindings, the orm layers and the virtual file system
- the database is the virtual repository: each app has its database, each user has a database — the personal disk; every hard disk is a database, opened as many as wanted from the drive panel, multiplying automatically as they fill with the registry mapping them
- access by identity and big integer pointers; a single accessor writes; schema and seed are idempotent
- every table carries identity, timestamps and soft deletion; the audit trail records actor, action, entity and before-after state
- blobs never ride the tables: the binary chunk table carries the remote pointer, the address, the length and the checksum; a blob store contract answers put(stream) with id, bytes, checksum and kind, friendly to large-file pointers
- chunks carry content-hash dedupe with compression and a catalog for automatic reuse; the upload pipeline walks manifest, chunking, dual compression (the layered maximum archive plus brotli over it), engine decoding and a mimetype return
- encryption at rest under wrapped per-project keys; access keys exist only as hashes compared in constant time
- policies deny-wins over allow, scoped by prefix, for read, write, list, delete and admin; an audit row per action
- the decoy database serves anonymous probes with plausible fake projects; a database download returns the encrypted decoy while the real base stays sealed — the recorded failure never to repeat
- replication: master plus shard per account; writes commit on a majority quorum; reads accept any replica; daily idempotent reconciliation; last-write-wins; the cluster of copies talks over https with gossip, consistent hash sharding and signed authentication, and the clone fallback redirects to the next online clone
- memory tiers by temperature with latency budgets; automatic promotion and demotion by size and frequency; oversize blobs go directly to cold
- the unified address space spans memory and disk; the storage-to-ram bridge swaps, maps and overlays the same bytes between flags of use
- honesty receipts: storage latency is never labeled as memory — the positioning says compute plus storage as a virtual memory cache
- zero touch on the visitor is law: the local store is only an offline mirror cache of the database
- the wire types of the family carry address, node, timestamp, chunk and compression headers with hashing and magic-byte validation; slices of 16-64MB with checksum plus gzip; an instruction type in json, a stream and a block type in binary
- the system tables of the family: users of human and virtual kinds, sandboxes, verdicts, calibration, labels, weights, gates, tool and runner invocations, orders, invoices, incidents, revoked tokens, gateway requests, the memory tiers, binary chunks, the app library and the caches
- the data stack: the typed orm over the better sqlite driver, the managed postgres in production, the declarative schema pair running in parallel inside each theme
- the cdn farm serves chained packages from many cdns; fetching happens inside the sandbox, never in the user's browser
- the provider chain walks the free compute sources in order and the first free runner wins
- the repo as computer: repository as disk, actions as cpu, pages as bus, static site as bios, dispatch as inter-process communication between repositories
- plans meter by chunk quota on the scale of terabytes; engines and the sandbox stay unlimited and free; the lock is visual only, inside the operating system, at signup and payment

### gateway — the inference spine
- the route surface: a fixed endpoint set replicated across five versioned lanes; every lane answers the same set — chat completions, completions, embeddings, keys, messages, models and responses
- the sandbox-native lane is keyless: it works only inside the provider sandbox and never pretends to work elsewhere
- the paused lane answers with an explicit service status and the fallback instruction, falling back automatically to the first lane
- the rotating-pool lane rotates keys least-used-first with per-key statistics; the model swaps on a message window per session
- the anonymous lane requires the session header of a fresh identifier; it discovers free models dynamically with last-known-good
- the free-tag lane of the public router answers only the free models; paid models are refused outright
- the meta-model masks the upstream in every response; the real provider model never leaks; the declared context is the aggregate of the composed windows
- the inference pipeline, in order: the authenticated request with the keyed signature; the guard with the input rules and the output severity score; the cache keyed by state and question; the porter
- the porter resolves most requests at zero cost with deterministic rules; the grey risk band never acts inside; the risk door blocks unconditionally above it
- the local jury: a diverse panel of three, votes normalized, outliers dropped, averaged with weights inverse to the historical calibration error
- confidence aggregates; divergence beyond the threshold escalates to the cascade: the small model, the verifier, then the medium and large models; the distilled verdict is the destination lane
- the append-only audit persists the individual votes on a write-once chain of hashes; the verdict surfaces expose votes, weights, evidence and guard scores
- calibration is first-class: the expected calibration error over bins; temperature scaling by grid search; snapshots per provider and model; a nightly recalibration job; confidence rides every verdicted response
- anti-sycophancy: flattering and false confidence are prohibited; confidence below the floor returns an explicit unknown
- streaming law: reasoning precedes content in every turn; exactly one terminator; heartbeats only while idle; partial frames never emit
- the brace-depth parser retains incomplete buffers and emits the terminator only at depth zero outside strings; corrupt frames are discarded, never relayed
- anti-rate-limit doctrine: bounded retries with exponential backoff and cryptographic jitter; the retry-after header honored; a concurrency mutex of one with a waiter queue
- the key vault stores, resolves and revokes through seams; resolution at the last moment; the mask applies before every log; the export check refuses any key shape
- routing by tier, tenant and request kind; version pinning per request with rollback, coexistence and canary
- the route truth is a single source per version — centralization attempts were reverted and stay reverted
- thinking is always on at every route without exception, at tiered levels with character budgets; the two-call pattern serves the lanes that cannot stream reasoning
- the context budget guard computes per turn: input bounded by context minus maximum output minus a safety buffer

### sandbox — the virtualization spine
- virtualization only: the sandbox layer of the whole family; every site role and every runner descends from it
- everything third-party, nothing on your machine: workloads run on the free compute of the forges and providers, never on the operator machine
- honest positioning: free compute plus storage as a virtual ram cache; remote storage never becomes addressable ram, and the receipts say so
- the modality resolver: the workload states its needs — isolation, gpu, network, boot; the platform answers with the exact set; the person never hand-picks modalities
- isolation ladder, deny by default: child process for low trust, wasm for compiled work, the microvm at the host boundary; the script vm is never a security boundary and the deprecated vm library is banned
- containers run without network, without capabilities, on a read-only root, with an init as the first process and no-new-privileges
- the kernel-level guards ride the host: the filesystem scoping, the syscall allowlist deny-by-default, the asynchronous io family blocked always
- one bus, one machine, one metrics: typed topics with a replay ledger; a complete lifecycle state machine from creation through destruction
- the scheduler handles logical threads beyond the physical count; cpu overcommit; memory ballooning with the paravirtual device and compressed swap tiers
- the gpu lane: passthrough, vendor slices, paravirtualization, the multiprocessor service, the paravirtual display stacks; per-process virtual gpus
- snapshots, restore and live migration with measured downtime; rollback walks phases with a circuit breaker
- a receipt for every execution, transformation and delivery; signing states are explicit facts, never claims — the receipt vocabulary spans not provided, declared, parsed, checked, verified, rejected, unknown
- the account is the sandbox: an immutable image identity versus a throwable instance identity — the install cd versus the save game
- the mimetypes golden source identifies the runner: the domains become runners and keepers communicating through media types; path traversal is blocked at the entry
- storage adapters across the local, the chunked, the object stores, the code hosting contents, the webdav hosts, the model hubs and the dataset hosts, with pools under quorum
- the free storage fleet: release store buckets, model hub spaces, the package farm serving renamed chunks as a cdn, and media hosts, aggregated as a virtual pool
- the free compute quotas of the fleet, recorded: the forge actions with four vcpus, sixteen gigabytes and six-hour unlimited runs for open source; the second forge at four hundred minutes per month; the free collaborative forges unlimited; the hub spaces with sixteen gigabytes and near ninety-six gigabytes of shared gpu; the notebook provider with gpu hours and twenty terabytes; the always-free arm instances with two ocps and twelve gigabytes; the edge workers; the lambda ceilings
- the free storage pool, recorded: the package registry at two hundred fifty megabytes per tarball with unlimited total; the chat platform bots at two gigabytes; the channel chunks at eight megabytes; the object store free tier at ten gigabytes; the cloud drive at one terabyte per account; the model hub at ten terabytes; the notebook datasets at two hundred gigabytes each; the code host at five hundred megabytes per repository
- anti-localhost golden rule: hosts derive from interfaces or user choice; ports draw from a random band; literal loopback addresses appear only in the guard that rejects them
- version pinning by date ledger: every engine pinned to a working version; old pins survive only as provenance
- scraping surfaces: robots cache with crawl delay; a crawl frontier with normalization and a persistent queue; a proxy pool with health, rotation and revival
- captcha is manual with a contract of evidence and hash; automatic bypass is forbidden by design
- the engine ships to every registry as a package and a multi-arch image with a smoke check; the extension package rides the release
- the runtime catalog with measured latencies: the in-process kernel near two milliseconds; the v8 isolates at five; the rust nano-vm at twelve; the warm in-memory engine at twenty-seven; the cube engine under sixty; the cloud sandboxes under one hundred; the microvm at one hundred twenty-five to one hundred fifty; the syscall-filter engine around two hundred; the containers near three hundred; the wasm engines by memory footprint

### design system
- the fusion is windows plus the reference studio: the operating system carries the complete windows identity; the other apps are applications inside windows frames, each with its own accent
- two faces of the operating system: the saas face on the web — intro, explore by categories, auth, panel — and the system face installed — desktop first, no saas face
- explore is not the intro
- one design track serves every platform: the same build is vertical on the phone and horizontal on tablet, tv and desktop; only responsiveness, density and the packaging workflow differ; the hidden surfaces enable in settings
- the cli renders the same interface in the terminal with white tabs
- materials: the body material on the operating system; the taskbar and flyout material with the noise texture as an inline pattern, never an image file
- glass only on chrome, navigation, modals and widgets, never as a wash; glass carries a dark hairline, never a white border
- elevation is expressed by surface color, never by border; the surface ladder climbs in even steps
- the accent of the operating system is used sparingly — active indicator, toggle on, focus, selection; after the indigo ban the flat windows light accent is the signal color, with its hover step
- the identity accent of each app rides only brand mark, content ctas and active indicators; the chrome stays neutral graphite
- the icons come only from the official fluent set, sized by font size, never by stroke width; the filled variant marks the primary action; zero emoji as icons
- premium icons are squircles with an internal gradient, three animatable layers, hover tilt with sheen and a drop shadow in the app color; the application icon set rides one lit-plate grammar with three-stop identity gradients; nine family marks with distinct silhouettes; the family mark geometry is the hexagon with the three-paw star, generated from a four-layer optical-glass prompt deck
- motion law: micro interactions under the standard ceiling with one property per transition; entrances with a stagger; exits accelerating; the pop intro and the success flash as the only exceptions
- the reduced-motion preference is a hard stop written last in every stylesheet; reduced transparency gets solid floors
- the ban list is a blocking gate, zero tolerance: no transition-on-all, no lazy full pills, no pure black or pure white fills, no neon glow or decorative dots, no default purple or blue as signal, no white borders on glass, no decorative gradients, no dissolve fades
- the chat grammar: the composer as the hero with the browser-tab anchors above the border; one continuous silhouette drawn with a gradient stroke measured at runtime
- the quality bar: any app below the golden reference page is rebuilt from zero, never patched; a redesign rewrites, never recycles
- the verification law: a wave lands only with the checks clean, the dev server answering, the agent browser and a vision model confirming dark and light, active and inactive, zero glitches
- the premium ruler: thirteen premium design laws with the per-school standards of the platform vendors and the award studios as references; the design registry of the super skill holds ten registries with about sixteen hundred canonical identifiers — styles, geometries, effects, motions, textures, components, architectures, tensions, foundations and chapters — new identifiers only after independent proofs, deltas appended without breaking the numbering
- the token-grade layer: unified deep canvas, an eight-step surface scale, layered shadow stacks, hairlines derived from the foreground, micro feedback at one hundred fifty milliseconds on the standard easing curve, one solar accent for action and state
- the glass vocabulary: a five-step surface alpha ladder from frost to phantom, blur always paired with saturate, the shadow scale, the overlay scale and the spacing scale; the trend set recorded — bento grids, container queries, dark-first, the second glassmorphism, semantic colors, aurora gradients, tokens with nine to eleven shades per color, motion tokens
- touch law: forty-four pixel targets with press scale and a visible focus ring across every subapp; the anti-pill pass with the small radius token across family surfaces
- the accessibility sweep rides the checklist over every surface: names, labels, heading hierarchy, computed contrast of tokens, focus visible, tab order, the language stamp, generated-markup cross-check
- the design corpus feeds the system: the skill packages for artifacts, styles and brands; the pattern taxonomy of effects, animations, transitions, textures, components, architectures, styles, geometries and tensions with correlation, synergy and conflict matrices; five base styles from clean saas to productivity mosaic; the information-shape patterns and exploration ladder of the interactive skill; the chinese typography ruleset for title breaking; the refined token catalog with twenty motion recipes

### security
- the device authorization grant of the public code-hosting standard is the canonical login of the house; the poller is two-phase with a watchdog relaunch every twenty seconds, file-based status protocol, permanent tokens stored with restricted permissions, and never a re-poll after authentication succeeds
- the token carries the lifetime authorization pole: no expiry, so the sandbox never kills the session mid-run
- the self-hosted auth law: the auth endpoint belongs to the family domain, never third-party; the structure is the own
- the oauth platform of the house: the code-hosting app with device flow, signed webhook events and installation tokens exchanged through short-lived certificates; the rival forge app beside it; a single callback routed by state
- account unification: one signup, one account; an account created in one app is recognized in every app of the family; the family session rides the shared data home so one login covers everything; the guest identity is born on first visit, never deleted, working in web and terminal
- credential law: never in code, never in a component database; environment variables, gitignored stores or the encrypted auth store; the public repository carries an empty key template only; credential stores hold only hashed shadows, secrets never displayed
- rotation is standing: burn and rotate any token seen in chat or logs; a credential leaked in chat is compromised and forbidden
- a credential inventory exists in the corpus — existence only, zero values — and rotation before any publication is the permanent gate
- encryption at rest with the standard authenticated cipher; the post-quantum hybrid group on the modern transport; snapshots with the second cipher family
- the anti-devtools posture in two layers: detection blocks the shortcuts and traps the debugger by timing; the response raises a fixed overlay and registers the address permanently — every connected site goes blank for that visitor; armed in production, disarmed in development
- clean url tokens stripped from the address bar; the strict content policy with no eval and no remote code
- the safeurl pattern guards every new client host: only web schemes, loopback and private ranges rejected, the mapped address form normalized; the url gate is the single door for server url requests — web schemes only, resolved hostnames held to public ranges, refused by address never by name
- the ai bot blocklist at the edge of the family zone; agents without consent are blocked; the robots doctrine disallows private routes, never exposes source maps or structured data to crawlers, blocks the training crawlers and about fifty five scanner bots totally, with crawl delays per engine
- zero captcha in the whole flow: eliminated by the self-hosted infrastructure; the silent captcha of the market is recorded as evidence, never replicated
- the agent hardline: the blocklist holds even in full-auto mode — the recursive root delete, fork bombs, filesystem formatting, raw device writes
- anti prompt-injection: context files are scanned before they reach the agent; the forced context makes the agent read history and files before acting
- the sandbox security stack: the kernel filesystem scoping, the syscall allowlist, the host-side programs at the exact decision point, rootless control groups, pinned transport
- the modern defense stack: the filesystem sandboxing of the newest kernel abi, the syscall filter deny-by-default, the ebpf security modules, rootless control groups, the post-quantum key exchange and signatures on transport, the snapshot engine with relabeling, the confidential tiers of the host
- the honest threat model: hardware spoofing is an identity claim, not an isolation claim; hostile workloads stay under the full virtual machine layer
- the ci gate battery: the code scanner over the language matrix, the secret scanner over the full history, the scorecard, the image linter, the vulnerability scanner, the dependency review, the audits, the sbom, the license checker
- the owner lane: pushes that touch workflow files require the workflow scope; the runner token never touches workflows; the landing job runs under the owner token through manual dispatch
- the cross-llm memory of the family: the memory server with local embeddings, the hybrid recall of keyword and vector with reciprocal rank fusion, top-five injection, the personal-data scanner, encrypted store, one database serving every client of the house
- the embed contract for guests: a read-sandbox token scoped to embeds, per-origin rate limit, strict content policy, the sandboxed iframe — and the recorded anti-pattern of the privileged backdoor account is documented to be never replicated
- the zoom lock rides every app: baseline device pixel ratio, wheel and pinch blocked, sealed viewport

### releases
- the one release law: a single version tag cuts one release that carries every app inside it; per-app assets ride the family release, never their own
- the gate closes only with the full asset band attached, the browser extension present in the assets, and the family fully functional
- the family lanes wake on the published release event and publish per app as they finish
- version houses of a few hundred steps each; one commit is one step; each house closes with a release; no house opens with the previous one red
- the version ladder from the last consolidation base to the platform stamp walks recorded waves: the small houses, the eradication wave where the old design dies in every app, the standardization wave with one grammar, the library wave moving shared logics into the published library, the functional wave with every app end to end, the depth waves with graphs and nodes per app, then the platform stamp
- the bump loop: every bug is a bump; the loop repeats until every gate is green and the dashboards read zero, zero, zero
- lockstep: every app shares the version of the root package; one release note fires for the whole family; drift must test false before any push; the workflow rejects a tag that mismatches the manifest
- the next version derives by pure arithmetic over the manifest — never a typed number; tag and manifest mismatch is a rejection
- compression: the layered maximum archive plus brotli over it; checksums generated by the pipeline, never hardcoded; zero hash strings in source
- the draft gate downloads every asset back and verifies every checksum before anything publishes
- the rollback gate freezes the previous set through the immutable tag with pinned checksums
- gates never disabled — a red gate blocks the release, always; fix what the gate demands
- the release gate battery, recorded: the schema freeze with frozen schemas and capability manifests; the pentest with twenty one entries over trust boundaries and guards; the content-policy audit; the permission diff; the agent certification with thirty coordination scenarios over fake tabs of every browser kind under a fake clock; the cost certification with nine accounting checks replayed and recomputed byte-identical without timestamps; the doc check; the sweep; the pool audit of the six hundred twenty six mined feature items with an implemented floor of five hundred ninety failing the release on regression; the matrix verification over eighteen cells; the telemetry-free proof; the recipes runner over the thirty six gallery recipes; the readiness review of twenty seven gates with the verdict artifact; the soak run holding a long workflow across the retention window with checkpoint resume, restart simulation, the byte-identical no-drift contract and the zombie reaper proof; the accessibility sweep
- the standing order of the apps in every workflow: the operating system first, the family in canonical order, the sandbox engine always last — it is the heaviest
- builds, tests and hashes run only on the host computers of the integration service, never local
- the event suppression law: a release created by the repository token never fires the release event; the flip rides the owner token so the lanes fire hands-free
- static deploys without platform functions; the same tree ships to every target; the domain never hardcodes into repository files
- the publication channels, thirteen: the two package registries of the code host and the public registry, the jvm registry, the dotnet registry, the multi-arch container registry with five linux architectures, the ruby registry, the editor marketplace, the browser marketplaces of the three engines, the site bundle, the declarations bundle, and the provenance of sbom plus attestations plus the artifact manifest, with the checksum umbrella over every asset
- the asset matrix per release: the disk image and the installer executables across both architectures, the linux packages and images, the mobile packages, the editor extension, the five next-form zips per app — web, personalized, platform template, restricted, normal, in the usage order — the site zip, the iso exclusive to the operating system, the container images per architecture, the wasm cores, with the checksum umbrella
- the toolchain policy: the exact current runtime in continuous integration, the version decoupled from releases, the runtime catalog regenerated on every release so it never drifts from the manifest
- the maintenance ladder proposes dependency rungs weekly; the maintenance surface is a versioned-action allowlist — the automated dependency bot was removed by design
- exactly one hundred planned changes per release, with the verification and security lanes triggered on every pull request
- the release chain carries the full version history grouped by roadmap phases, from the frozen extension base through the platform releases

## devthink — the operating system

the central product: the operating system and superplatform of the family. it imports every sibling engine through published libraries and owns no media logic of its own — gateway from the gateway app, image and video from the media app, audio from the audio app, the sandbox from the sandbox engine.

### objective
- one operating system on the internet: a real desktop with windows, taskbar, start and apps, where the conversation is the machine; the virtual os absorbing every predecessor surface of the family into one superplatform

### macro features
- two faces: the saas face on the web and the system face on desktop and installer media
- a full page surface of thirty five native pages — twenty six page folders plus nine family views: onboarding, login, news, audio, video, image, notes, the photo and video editors, browser, terminal, files, gallery, connectors, automations, deploy, security, docs, data, music, camera, recorder, mail, calendar, calculator, maps, store, console, gateway view, home, not found, projects, providers, settings, usage
- the master screens: the runtime dashboard; the workspace with the guest system, version control and port forwarding; the reasoning prompt with the thinking slider; the connectors hub over the tool protocol; automations and scheduled jobs; artifacts and the shared surface
- eight master screens; forty five screens and three thousand four hundred twenty components in nine groups; seven master core hubs — landing, auth, onboarding, workspace, bots, explorer, settings
- the api surface of the first version counts forty five pages: landing, auth, onboarding, the chat workspace, the sandbox terminal, browser and editor, the approval checkpoint, the kill switch, projects, connectors, the importer, the skill builder, the oauth manager, the message bots, automations, the cron creator, the mail gateway, webhooks, the library hub, deployments, the studios, the security posture, the audit trail, the compliance scanner, the extension inspector, telemetry, profile, the memory customizer, the layout customizer, billing, developer keys
- a conversation is born with its sandbox: space, sandbox, session and message identities provisioned automatically at creation; the virtual machine of the conversation runs on the in-browser container or the container microvm — one hundred percent logical virtualization; an isolated database per conversation beside the fifteen to forty static databases of the new user
- the sandbox handshake streams its states over the server-sent channel — checking quota, initializing, ready with the pod identifier and the explicit global, per-minute and four-hour quotas; ephemeral application tokens of three hundred seconds guard the previews
- approval modal before every sensitive action: diff, command and risk shown with allow once, allow always and deny; automatic execution blocked by default
- kill switch with checkpoint restore: kills the machine processes, cancels the calls in flight, offers restore, export and resume
- the chat embeds the terminal, a headless browser with network inspector, and the code editor with live diffs
- the message comprehension pipeline: seven independent subagents with an eighth summarizer, each able to spawn seven more; the edit never interrupts the running work; the checkpoint chain merges at the end
- agent swarm: one agent per tab without ceiling; leader and workers with critics and verifiers; mid-run handoffs; locks and conflict scans; result merging; a progress board; work stealing with mailboxes and a blackboard; per-agent budgets and scopes; consensus quorum with arbitration; the kill switch always present
- the swarm dashboard: overview panel, per-agent status cards, the shared queue view, message flow, the conflict and arbitration log, cost per agent, the escalation inbox with human decisions, the kill switch, the timeline scrubber, the aggregate report download — read-only for viewers without the run role
- swarm knobs are user choice, never hardcoded: count, roles, lanes, priority, freshness, election, quorum and merge policy
- agent certification: thirty coordination scenarios end to end over fake tabs of every browser kind with the fake clock; six certified topologies — leader-worker with election, round-robin slicing, exact claim, plan delegation, swarm consensus, hybrid rollback
- forced context injection by the server: the agent must read history and files before acting; the initiative of the model is never trusted
- agent memory in layers: a sliding window for the short term, files for the long term, checkpoint summaries by a cheap model; resumable compaction saves its position
- the action server: sixty plus skills in the action surface, the todo-list protocol — analyze, plan, execute, verify, test, deliver or redo, save feedback — with verify and test impossible to skip; three execution modes — live with the ghost cursor, hidden instant, autonomous for admins only in the background; observers, interpreters, planners, executors and validators in dedicated folders; row-level security with realtime, plan quotas, payments, antifraud, boot cleanup
- the ai as a registered super-root admin user with email and password, its own virtual account kind, resuming with position saved, its server always on for paying users; the universal system ai answers through the tool protocol with the reasoning of the fifth gateway lane, confidence and calibration error on every answer; virtual users are served alongside humans, each with its own sandbox
- every user action recordable as proprietary training data, in chronological order — clicks, shortcuts, inputs, coordinates, texts; the training logs are platform property on the private cloud: invisible, undeletable
- crash-proof persistence: saves on idle at three seconds with light state; the state restores tabs across devices through the heartbeat; the preview is the final output exported in chunks of ten seconds with the original bytes intact
- social streaming without video bandwidth: actions travel as replayable records over the websocket and the replay engine reconstructs the screen; live recording produces the final video; social audio rides the peer connection in the stage style; the community layer carries teams, groups, likes, follows and forks
- the signaling relay for the peer connections rides the database with two tables created on first use, random peer identities per mount, payload caps, garbage collection riding the polls — only rendezvous traffic server-side
- hybrid storage across dozens of file hosts plus the own cloud, layered by user, tab category and project name, with trash per project and gif thumbnails; the own cloud integration saves only the link and computes the cashback economy; the hydra layer balances thirty three free terabyte accounts by space and rate with resumable chunking and orphan detection; the bring-your-own-server tricks — unlisted videos as a video server, hidden drive folders, the pin platform as a cdn, presigned uploads
- the microserver fleet of the platform: ads, signin, signup, storage, payments, subscriptions, monitoring, share, the file host for the free hosts, session, streaming, voice, sharding, orchestrator — each a single-port server
- the ai hierarchy: maestro, soldier and weapon; gateways act as porters of input and output; the verdict engine suite rides the root with its mechanisms — the porter, the jury, the cache, the gates, the weights, the cascade, the evidence, the guard, the slicer, the doctree, the retrieve, the progressive folder, the summarizer, the memory, the trainer, the adapters, the calibration, the consistency, the beam, the jagged, the route, the domain language, the signal — with the verdict playground as the single hardcoded theme consuming the published verdict library
- the provider adapters behind one judge interface: the typed, the openai-shaped, the anthropic-shaped, the google-shaped and the local
- the main database auto-shards at the per-project limit; the super root admin user keeps a server always on
- plan tiers bound disk, memory and edge by the paid plan; engines and the sandbox stay unlimited and free; the lock is visual only; the free tier requires the own cloud
- the payment surface has two views: the saas intro view and the internal panel view; the store sells pretrained models, plugins, themes, runners and models with automatic digital delivery; the checkout rides the payment provider with verified webhooks, orders and invoices, and no card data stored
- the deep search runs a local full-text ladder before the model; the universal search answers under a strict budget with about ninety two command logics; the store of the operating system publishes applications by category with the best-of rail and the provenance of the immutable tag, viewable without an account
- the extension is a consent-first bridge: three gates on every step, approval as a distinct human action, grants never unlimited, deny by default, a transparency page of permission diffs — the full surface lives in its own section below
- the query engine runs several tested runtime modes — plugin, cli headless, web, browser library, node library, standalone — each declaring capabilities, persistence and auth
- the ansi art logic converts designs to terminal graphics; the terminal graphics library carries fonts, charts, gradients, ink, image conversion, an animation engine with thirty plus easings, keyframes and motion paths, five gradient types with fifteen presets, seven chart types, the svg conversion through half-blocks, clock and system widgets; it renders any component design in the terminal and lives as its own app when not embedded
- the decision model of the house is a proprietary json engine with an injected completer, never a key in code
- node maestro orchestrates the engine manifest with a graph runner and an os registry; the python lane spawns the interpreter with timeout, capture and exit codes; a zoom lock runs before the first render
- the extended browser surface controls browsers remotely and multi-dialect across the desktop, the rival engine, the mobile packs and the editor; the own browser carries its chrome, consent gates and the policy module
- the mobile lane ships the embedded android emulator over the peer connection, the virtual cpu runner, self signed packages and over-the-air manifests; the capacitor source boundary serves android and ios, the workbench builds before the sync, the packages build in the pipeline and the simulator-only mobile package carries no caller credentials
- the file explorer app carries the full windows grammar: toolbar with back, forward, up and refresh; the breadcrumb address bar; the command bar; the nav pane with quick access and the machine; the folder grid with category glyphs; the drive cards with the activity light and the real capacity bar reading the storage estimate and the machine registry; the status bar and the details view; the connection wall for the external storages; opened from its own icon as a floating window or its own route
- the window manager: the taskbar with pinned apps and running indicator; the floating start menu with search; the tray with clock, quick settings and the calendar flyout; the notifications; caption buttons with the red close and the desaturated inactive; snap, drag, maximize at the top edge, the minimize flight to the dock icon, resize handles, cascade, the switcher; the most-recent z-order stack with persisted session geometry; declarative app metadata for singleton, autostart and mime kinds; application-scoped launch tokens; the inter-process channel always answers
- the boot sequence: logo animation, lock face with clock, swipe up, sign in over the dimmed blurred wallpaper, desktop
- the fusion engine between tabs: transfer, merge, integrate and sync by dragging one tab over another, with selective cloning and hybrid layers; the universal detach turns a panel into a floating window into a synced solo tab; the meta-tab holds the multi-select bar with drag-to-lab
- the creator studio: the video editor, the audio workstation with mixer, effects rack and transport, the three-dimensional studio with scene graph and material editor, the canvas, the code editor, the site builder and the notes — each with its own ai chat, nodes, encoder, calculator, toolbar and export
- the tools page carries sixty plus tools — asset generation, converters, the upscaler, the code generator; the lab holds the fusion engine; the action surface holds the skills
- the news page is a page with live feed, never an external feed; the notes module carries floating draggable notes with persisted position, dashboards charting real data, shareable public and private notes, the todo list as the canonical planning format, the expiring trash and the compacting weekly log
- the guided onboarding with spotlight pop-ups; the equivalence matrix normalizing competitor concepts; the onboarding state lives in the database with the entry gate on every theme home; the browser store is a cache mirror merged with the seen-wins rule — flags never regress
- the translation module of the family: batch transport with markers, ordered answers, the per-person versioned cache, the originals behind weak references, the dom untouched — riding the shell with transport, cache and chunking
- the memory tiers of the platform: the ram tier on shared buffers in microseconds never persisting secrets; the browser filesystem tier with the embedded database and its keyword and vector indexes; the release tier of the code host, the large-file store, the cdn and the free object stores with the crypto-shred propagation
- the virtual file system: the pager with sixty four bit pointers, the sandboxed data path, the fifty gigabyte quota, the standard compression by default, encryption at rest, atomic snapshots; the hierarchical builder treats folders as pages with language detection and component extraction
- the mimetypes registry of the family — tens of thousands of lines and thousands of types in the debian format — feeds the sandbox rune and the web server; the wire types ride their headers with slice sizes, checksums and magic-byte validation
- the interface sound service plays haptic data-uri sounds with throttle; the presentations split between the windowless web scroll face and the installed mica stage face; the developer tools shield arms in production; the deep link dispatcher parks the route and replays it once the router mounts
- the os registry with forty two app identifiers as the single source the shell reads; the app catalog registry carries the views of the roles and the engines with the dynamic command menu and gateway home; the seed catalog answers app names and details offline
- the local identity key in the browser store; the static workbench keeps its browser-local non-sensitive workspaces, sessions, tabs, messages and preferences with revision and tombstone metadata, the credentials store empty by default; the chat rides one websocket per session carrying token streaming, sandbox state, filesystem calls and heartbeat
- the chat rides the proxy of the house with the dual protocol of the two big providers, keepalive at five seconds, the model, health, status, stats and feature endpoints
- the desktop enters directly, login eliminated on the installed face; the family url resolves the sibling deploys; the subdomain map of the family spans the functional hosts — news, apps, api, docs with the package mirror, status, blog, shop, auth, sandbox, storage, verdict, search, music
- the shell theme ladder: five skins persisted — the clear glass, the obsidian dark, the pitch black, the nordic forest, the sun — plus the theme library of the design tokens; the z-index ladder from atmosphere to tooltip with the immutable family block of thirty eight variables shared by the eleven apps; the two stylesheet passes — windows first, then the token grade; the studio pass appends its renewal block per app, additive
- the per-brand signature icon animation — one movement per app, entry and hover only; the desktop icons open the deploy units themselves with the mount base frozen at boot
- the operational plans recorded: the twelve-phase plan with the pages at eight steps each and the engines at six steps each, the eradication wave of twenty items, ten gates; the operation plan of the interface in five phases with the web engines of the scraper — the parser, the automation browser, the crawler suite

### micro interactions
- every native app opens as a floating desktop window: drag, snap, minimize, maximize, taskbar presence; closing returns to the intro
- the intro-onboarding-main sequence runs inside a window; the deep chat route belongs to the chat subapp; the embedded flag removes the shell chrome
- the chat surface: the premium composer with the question and agents tabs above the border; one continuous silhouette with a gradient stroke measured at runtime; the resting pill grows on typing; the avatarless timeline; the reasoning expander; the sessions panel with lineage; the canvas pane with versioned buffer; the sandbox chip with boot stream; the terminal, inspector and code editor embedded
- the chat wave set: stop and regenerate with the honest stopped error and partial answers flagged; the message action row; date separators and the streaming clock with locale weekdays and elapsed seconds; the markdown renderer with block grammar, capped heading ladder, nested lists, blockquotes, tables, links restricted to web schemes, the in-house highlighter for the six languages; the model picker with context windows probed once per registration and persisting across sessions; the effort picker riding every round as its own header and persisting; the honest token meter; the branch tree surface and map; conversation search; session management; export and share; capability honesty; slash commands; attachments with vision payload; voice dictation and playback; the memory panel; web search with citations; the sandbox bridge; usage transparency; the temporary chat
- the message chain never stops: editing a message opens a cascading checkpoint variant that inherits context without interrupting the run, on a new session number, running as a parallel clone; the newest edit prevails; the final merge carries every checkpoint
- the chat toolbar: stop and regenerate, branch tree, search, export, attachments, voice, memory, web search and the sandbox bridge
- the chat hygiene: the cheap model generates titles and summaries on a dedicated endpoint; agent actions render as chips — files written, commands run; responses carry the deep link identifier
- thinking and answering stream in separated phases; the reasoning precedes the content in every turn; the thinking block carries its expander with the medium default
- the sandbox chip: creation, state stream, quota and profile one gesture away; approval and kill live beside it
- the same interface renders in the terminal: the component tree through the terminal renderer, icons as glyphs with fallback, gradients as truecolor
- the command palette finds apps and actions with fuzzy keywords, recents first, capability filtered; the stack combines tabs into recursive split panes
- floating notes drag with persisted position; dashboards chart real data; explore browses themes and trending with fork and origin
- the todo list is the canonical planning format; the trash expires; the weekly log compacts
- consent windows carry a user-chosen duration; an expired window suspends the run mid-step
- image conversion to terminal graphics with dithering and adaptive palettes; charts, gradients and an animation engine
- the craft grammar of the settings, console and file surfaces: the moving nav indicator, the spring-settled segmented controls, the streaming terminal rows with the duty-cycled cursor, the staged boot graph
- the loading threshold ladder wired into every surface; the touch targets with press scale and the visible focus ring
- the crash defenses: the range-error watchdog, the snapshot rollback, the double-fork daemons surviving process reaping
- the webrtc room binding: identity mounted once, the room derived from the hostname, unreliable broadcast plus reliable ordered send

### engine status
- the operating system boots: the golden path verified end to end — landing, sign in, the lock screen, the desktop with taskbar, start menu and the pinned apps of the family — with zero console errors
- the chat answers through the gateway with the streaming law honored
- the engines import through the published libraries of the siblings; nothing duplicated
- the grand merge joined four predecessors under the strong copyleft license with the permissive lineage recorded in the third-party notices
- the readiness snapshots of the chain recorded: the no-go with twenty four of twenty seven green, the all-green snapshots before it
- missing: the design passes below the golden bar; the database sweep beyond the shell wave; chat persistence in the browser store; desktop icon drag with persistence; the complete icon migration to the fluent set; the dead redirects of the launch surface; the remaining sub-steps of the operational plans

### competitor targets
- the platform class: the big edge network, the code hosting platform, the chat assistants, the agent command lines, the reference operating systems cloned as design evidence — the web-os references with their app catalogs, view modes and widget counts; the build platforms with their template classifiers, versioned code storage, per-project collaboration, local-first sandboxes, cheap title models, visible action counters and explicit token quotas; the agent platforms with their screen maps, connectors pages, developer key pages, sandbox panels per task and modal settings; the deploy platforms with their projects, agent runners, gateway and oauth screens
- the session-sandbox reference with its magic sessions — chat plus sandbox with repository, system, region, model and effort dropdowns, cli-first tabs, the gamification card, the palette shortcut — recorded as the shape to equal
- the generation-battle platforms with vote, ephemeral stream credentials per run, status animations, exploring counters and the always-visible stop; the inbox platforms with two-way repository import
- the full platform equation recorded: the assistant platform, the workflow automation platform, the node studio, the notebook platform, the lab suite, the router, the cloud and the inference platform characteristics fused self-hosted

### next steps
- restore every app touched by the destructive sweep, by evidence — hashes, dates and diffs — never by memory
- the design pass app by app, rewrite from zero below the bar
- the database sweep of every app's data layer — no fake ratings, no invented numbers, honest empty states
- the payment surface decision, the store entity, the local payment method for the home country
- the responsive ladder with the density and resolution differences per device
- the remaining waves of the version ladder through the platform stamp

## saddle — the sandbox engine

the virtualization engine of the family. competitors of the sandbox-provider and microvm class: the agent sandbox platforms, the microvm engines, the container runtimes, the wasm runtimes, the sandbox jails.

### objective
- everything third-party, nothing on your machine: free compute plus storage as a virtual ram cache, honestly receipted

### macro features
- canonical modality types: the full virtual machine with virtual drivers, cpu, gpu and memory; the universal runner of any binary including itself; node packages through the bundlers and runtimes; hardened containers; registry images; workflow-driven microvms with a software graphics stack; browser and virtual browser; mobile targets; confidential tiers with attestation; the wasm families; the virtual filesystem from the database and the git objects; the cdn of about forty five cdns fetched inside the sandbox through the vfs
- the modality ladder walks from twenty through forty toward the full count plus the nuclear one; thirteen canonical types with the runed sandbox alive around the clock; the join resolver and the boot ladder — the microvm at one hundred twenty five milliseconds, the syscall-filter engine at two hundred
- operating system bases span a mobile-hardened linux, a graphene mobile system, a desktop linux, the arch-based minimalist system and the desktop of the mainstream vendor; both mainstream architectures ship; own vgpu and vcpu
- hardware profiles: light at two vcpus, no gpu and two gigabytes; balanced at four, half a gpu and eight; max at eight, one gpu and sixteen, with the hundred-gigabyte disk — the universal ai takes max, the human takes balanced by default, the sub-agent takes light; the per-plan quota near fifty gigabytes
- the engine motor in layers: interposed virtual hardware at the process level — the library interposition spoofing the process file tree, the memory info and the system calls; identity and software gpu generation; the execution engines below
- the hypervisor engine, eighty eight shipped features: the m-to-n multi-tenant scheduler with vcpu overcommit up to four thousand ninety six; the topology constructor; the host-passthrough cpu with feature flags and hotplug; the memory balloon and the paravirtual memory device; hugepages with transparent huge pages; host overcommit; the same-page merging; the compressed swap pair; the gpu passthrough with the display bridge; the vendor gpu slices and the multiprocessor service; the paravirtual display stacks; the device passthrough of gpu and network; the asynchronous io disks; the shared filesystem; the compressed disk images with discard and unmap; multi-queue networking; the socket device; snapshot and restore; live migration with postcopy and the multi-stream transport; the confidential tiers of both vendors; the trusted platform module; the nested iommu; nested virtualization; the microvm backends; the container engine with the second-generation control groups
- the virtual machine plan generator: the typed plan over cpu, gpu, sockets, dies, cores, threads, memory, gpu mode, vram and the confidential flags, with the argument linter before launch; one schema in three serializations — the machine-readable, the human twin and the compact form — parsed by the planner cli
- the c++ core with the direct device access, the management protocol bridge with its asynchronous methods, and the typed orchestrator above; the distroless container for the runtime
- contract-first: a serializable job, a temporary working set, a selected runner, a commit to a storage adapter, an event trail; the lifecycle states walk queued through preparing, runner, running, syncing, committed, completed or failed with retryable codes; the cron reaps the stale
- execution is deny by default: no request runs without policy, capability receipt, approval and a named adapter; the execution receipts carry the denial code; the isolation contracts are data-only — the request, the decision, the handoff — over the virtual control plane
- the binary boundary classifies prefixes by magic number, plans bounded wasm, invalidates cache on source or policy change; archive inspection rejects entry excess, depth excess, absolute paths and traversal
- delivery manifests carry ordered immutable chunks with checksums; verification checks bytes without evaluating code
- snapshots, restore and live migration; rollback walks phases with a circuit breaker, a quiesce, a restore, a verify and a reattach; snapshot-per-session with the overview, drives and snapshots anatomy
- confidential tiers with the vendor memory encryption, the virtual trusted platform module and nested virtualization
- a receipt for every execution, transformation and delivery; declarations never become signatures
- storage as ram: the bridge mechanisms — zero-copy mapping, tmpfs, compressed swap, fuse mounts, database-as-ram, cdn load with integrity hashes; the kernel recipes of the swapfile, tmpfs, the compressed ram disk with its ratio, the compressed swap, overlays, memory maps, the git repository in ram, the loop ram disk; the hot working set evicts least-recently-used with rehydration; the remote filesystems beyond the fuse — the object-store bridges, the memory-file maps, the memory databases, the elastic memory engines — recorded as the research frontier
- the kernel tuning for runners: the swap tendency raised, the page cluster zeroed, the ram ratio, the swapfile and tmpfs sizes; the free infra plan with the edge control plane, the forge compute and the compressed storage-memory
- the memory ladder with the measured latencies — ram at one hundred nanoseconds, the compressed ram at five hundred, tmpfs at the microsecond, the memory map at five, the embedded database at ten, the object store at fifty — with the four tiers from process ram to the fleet buckets; the memory engine keeps the hot in-process working set with eviction by entries and bytes, persists to every backend before the cache update, rehydrates from the first returning backend, and reports its statistics; the memory modes span the internal, external, physical, vectorized, library and chunked adapters; the gpu-to-ram spillover loads models with the honesty receipt per execution
- the memory tiers of the sandbox: the ram tier, the video tier, the repository-storage tier and the external buckets, with load, persist, release and safe-load operations; the seven-tier model with the working set
- the free pool spans the forges and providers, tens of terabytes with per-account quotas; the farm orchestrates the free compute quotas across every forge with the per-forge quota table and the artifact recycle; the worker farm of one hundred repositories dispatches through the workflow trigger with the pages as bus
- file-as-compute: large files become chunks across repositories, reassemble in memory, execute, and deliver through the cdn — the six hundred megabyte file becomes six hundred chunks across ten repositories, rebuilt in the eight-gigabyte tmpfs, with the result url on the cdn
- the repo-as-processor lanes: the static files as the system tree, the actions as the cpu, the pages as the content bus, the issues as the queue
- the honest report stands: storage is not processing; the bucket-to-vram protocol does not exist
- scraping cascade: fetch, browser, auto; robots and sitemaps honored per the standard; structured extraction first — the structured data of the page, then the open graph, then the feeds, then the readable text, then the raw markup; the markdown conversion cuts most of the tokens; the llms text files generated for the agents; the sitemap traversal follows nested indexes with depth, url and timeout caps and cycle prevention
- the crawl stack: the persistent frontiers over the embedded database, the robots parser per the standard, the sitemap walker; the queue with bounded concurrency, retries with backoff, idempotency keys and the saga compensation over the persistent lane; the stale-while-revalidate cache; the token estimation with heading-aware chunking; the rag helpers and the tool-protocol tools
- the capture platform: the injected virtual cursor over the debug protocol, the session event logs, the bezier plus jitter plus overshoot human trajectories, the stealth fingerprint patches, the deterministic replay by seed; the movement capture with the fitts-law durations and the lognormal typing with its typo rate
- human movement is synthesized: bezier trajectories by arc length, sub-pixel drift, lognormal typing with typos
- anti-detection is deterministic, honest and opt-in: one coherent fingerprint per session paired to one proxy, the tls baseline of the client hello, the session pools with the onion middleware as research, the proxy pool with round-robin, random and sticky strategies and the graveyard revive; the captcha cascade — stealth, behavior, solver — with the contract of evidence stored as hashes, the human review pause, the injected solver and the verifiable evidence; the captcha test pipeline with the ethics line: supervised research only, terms respected, bypass refused by design
- the bot adapters wrap the forges and the chat platforms with the safe error envelopes; the unified command parser, the webhook receiver with the idempotent signature, the schedule and status surfaces; the deploy matrix spans the serverless adapters, the forge pipelines, the self-hosted container with the database — the environment contract for the bot tokens and secrets
- the virtual hardware catalog: the real boards, the gpu catalog with the blackwell generation, the processor identities with the verified models and the omnibus catalog, the cores; the host inventory probes over the memory info, the vendor gpu query, the graphics and vulkan info; the vgpu driver lanes — the passthrough, the rom dump, the vendor slices; the generated process tree and the vendor query texts; the emulated flagship cpu, the flagship gpus and the accelerator; the library shims for the compute stack; the software gpu with the vector width and the thread ceiling, the vulkan and opencl software drivers
- the quantum layer: statevector simulator with the full gate set and seeded measurement, the key distribution protocols with eavesdropper detection, the quantum ram
- the virtual chip research: the memristor processor virtualized over wasm and the web gpu — the drift becoming computation, the conductance weights content-addressed on the cdn with the merkle manifest, the five-layer stack of bootloader, hal, core, device model and compact model; the datasheet of the blade with its geometry, frequency and pipeline; the research models of the academia and the vendor toolkit; the web gpu device count
- the orchestrator: warm pools with prewarm, acquire, release, refill and drain; role-based access with four roles; the numa scheduler; the balloon controller; the passage routing with latency budgets; the append-only audit trail; the bully leader election; the telemetry export; the resource reservations with their time-to-live; the copy-on-write private maps, the port allocator and the host resolver
- the passage network stack: the virtual switch with the dataplane kit, the express datapath, the zero-copy receive, the zero-trust tunnel
- the defense stack of the newest generation: the filesystem sandboxing of the newest kernel abi, the syscall filter deny-by-default, the ebpf security modules, rootless control groups, the post-quantum key exchange and signatures, the snapshot engine with relabeling, the confidential tiers
- the browser mode: the web worker cpu, the browser filesystem storage, the shared buffers for memory, the wasm with simd, the web crypto, the offline service worker; the four-library architecture — the browser capture, the worker sandbox, the wasm executor and the typed persistence with the per-identifier static database; the static mesh with the gateway, the worker with its timeout, the wasm executor with the memory paging and the snapshot injection, the persistor with compression and the backup endpoint per sandbox
- the engine ships the site as vps emulation, in the browser wasm mesh, the pendrive as infinite hard disk and the free model catalog
- the public library ships with the injected transports and the caller-owned concerns — the fetcher, the captcha, the persistence, the proxy and the webhooks stay with the caller; the product surface map spans the library, desktop, mobile, the workflow-node contract, operations, cross-runtime, the browser worker, the browser, the extension and the web control contracts
- the engine contracts: the provider chain, the cancellation plan for unknown remote state, the delivery manifest, the cache eligibility, the archive limits, the mini-app and dns plans, the action recorder
- the object-store adapter with the full listing contract — bounded pages, the rejection of non-advancing tokens, the caller-owned signer, the checksum from the entity tag, the decoded entities
- the modality resolver over ten axes with about thirty export modes; the resolve mode reads execution, runtime, memory, file, dependency and visibility axes without starting anything
- the research discipline: one hundred thirty public repositories sampled with license-gated dispositions; every feature candidate modeled as a side-effect-free serializable receipt — the isolation attestation, the crawl policy, the browser interaction, the storage matrix, the durability capability, the evidence policy, the release readiness, the runner provenance, the tool capability, the execution trace, the context provenance; the comparative evidence set of sixty repositories selected five gaps — the durable leases, the structured extraction, the context budget, the cancellation with compensation, the retention policy
- the alternatives registry: thirteen engines on the five-method sandbox contract with the selection scoring and the variant taxonomy; the microvm engines and the confidential tiers pinned in the version ledger; the android virtualization research — the virtual device farms, the containerized android, the desktop bridges
- the strong copyleft license carries the package, mirrored to every registry; the free code-signing path of the foundation certificate; the third-party posture recorded — export-control notice, privacy policy with no telemetry by default, terms without warranty
- the desktop and mobile conversions consume the same compiled web dist, never forking the engine — the desktop shell of the newest toolkit, the mobile packs; the debug package against the release package after shrinking
- the one hardened dockerfile with the runtime and binary-runtime targets; the local authentication with the iterated hash and the per-boot seeded admins; the store mirror repair
- profiles are data: a new profile is a database record plus a container envelope, never code; one hundred percent of the sandbox config is editable through the api with the aliases table and shareable presets; the session law streams the states with the ephemeral tokens and the runtime daemon with the watcher loop
- the sandboxes stay alive around the clock on the deployed domains; the frozen engine image with the per-sandbox quota preserved on resume; the single version tag per profile across profiles and architectures with the always-on emulator

### micro interactions
- the sandbox is born with the conversation and surfaces as a status chip: creation, state stream, quota and profile
- creation takes the model, the cpu count, the memory, the gpu and the quota; the state walks creation to running with a reaper on expiry
- execution returns output and exit code; the virtual file system persists per sandbox under quota
- approval and kill live one gesture away from the chip
- the fifteen pages of the engine site walk onboarding through snapshots; the site system carries the editorial rail with the numbered execution trail, the paper, the ink, the ember and the gold of the brand, the noise overlay

### engine status
- the engine contract implemented and published through the ladder of versions; the runed sandbox stays alive around the clock; the engine identity transferred across registries with the lineage recorded — the multi-forge origin, the capture platform, the webscraper, the current name; the private virtual-hardware engine absorbed and relicensed
- the performance layers recorded: the software gpu vector width and thread ceiling, the gpu spoofing through the software drivers, the memory semantics, the microvm warm pool from one hundred twenty five milliseconds to three to five milliseconds restore at one hundred fifty machines per second, the emulator thread strategy of the flagship cpu model, the build cache cut, the network keepalive and pooling; the kernel techniques — the zero-copy receive, the schedulable kernel scheduler, the compressed ram, the linker, the huge pages with their tlb cut
- the engine releases carry thirty eight assets — twenty primaries, nine manifests, nine checksums — with the architecture-explicit names, the per-surface checksums and manifests and the bill of materials; the signing states recorded; the dotted per-surface metadata with the checksum, manifest, bill and provenance per version; six registry lanes with the trusted publishing for the public registry; the multi-arch container matrix with the manifest verification before the smoke test
- the workflow fleet: the verification, the code scanning, the compatibility lanes over the alternative runtimes, the pages, the registry publishes, the desktop, the mobile, the container, the cache cleanup — with the workflow lint gate; the closed branches recoverable through the annotated archive tags; the repository keeps only the main line
- the cross-forge pipelines carry the verification and package lanes of every forge with no cross-forge release token — the primary forge is release-authoritative; the multi-forge pages publish the same artifact everywhere
- missing: the full modality count live in production; the pod-per-session state stream; the mime golden source rollout complete with the path-traversal block everywhere; the completion of the free pool quorum across every adapter; the sessions, crawler, universal api, tool-protocol server, queue and storage adapters recorded as partial in the feature audit

### competitor targets
- the sandbox class: the agent sandbox platforms of the market, the microvm engines, the sandbox runtimes, the wasm runtimes, the jail suites; the sandbox providers with their websocket gateways, preview discovery, ephemeral preview tokens and capability events; the full-vm providers with their remote desktops; the browser sandboxes with their measured latencies — all recorded as the evidence pool
- the multi-forge census of more than a thousand searches with the genealogy of the forge lineage and the regional instances; the forge catalog in seventy four categories

### next steps
- modalities live in production with the state stream
- the mime golden source as the runner identifier across every surface
- the free storage fleet under quorum with the receipts honest
- the five selected gaps from the comparative evidence set as the next candidates — the durable leases, the structured extraction, the context budget, the cancellation with compensation, the retention

## debonair — audio and music

the audio engine of the family. competitor of the audio class: the generative music platforms, the digital audio workstations, the music streaming apps.

### objective
- the theory core over genre configurations: rhythm is when, harmony is what, melody is which notes, instrument is how it sounds — pure functions throughout; the platform vision is the music stripe — offline under a strict package budget, no cloud, no keys

### macro features
- the engine is pure typescript at the root of the audio app: zero dom, zero audio context, zero storage in the engine; the house tree with the pure engines at root and the theme above; served inside the sandbox by the gateway iframe
- the two dozen verified modules: theory, the harmony engine, the rhythm grammar, the genre matrix, the arranger, the take events, the beat grid, the loudness meter, the mixer graph, the remix plan, the speech alignment, the timeline algebra, the sidechain ducking, the transport bus, the take shelf, the runtime database, the seed, the catalog, the family url, the daw view — with the module inventory and sizes recorded and the test suite green
- the engine imports the published audio primitives of the media app — the decode, the fft, the spectrum, the rhythm, the rhythm beat, the tonality, the timbre, the attributes — through the subpath seam; the published engine of the audio app carries sixteen genres, thirteen scales, the subpath exports and the transport over layer groups
- four product lines: the generation library, the analyzer, the studio, the export pipeline
- step sequencer, presets, seeded randomness, a typed manual api; export to midi and wav — the standard midi file with its variable-length quantities, the riff wave formats at sixteen, twenty four and thirty two float bits
- effect chain with audio worklets: reverb, delay, distortion, chorus, compressor, equalizer, limiter; the convolution reverb and the modulation matrix of the daw
- song structure with automatic arrangement; undo and redo; serializable projects
- the explicit sample rate is mandatory — the runtime defaults to a different rate and the drift slows and detunes the audio; the float doctrine for the samples
- determinism seeded end to end: same prompt plus same seed equals the same take
- the genre dna fixes the dominant band, the spectral tilt, the loudness range, the clipping and sidechain behavior, the reverb, the panning and the tempo per family — fifteen genres with the trap numbers recorded: the half-time sweet spot, the sub-bass band, the loudness range, the plate never on the subs; the assembly warehouse of about fourteen thousand parts — the drum patterns, the bass, the chords, the melodies
- the pattern database sources: the piano corpus with its thousand-plus midis, the lakh corpus with its hundred-thousand-plus, the creative-commons sound archive, the neural synthesizer corpus with its thousand-plus instruments; the optional quantized models with the four-level fallback chain — neural, rules, theory defaults, hardcoded
- ai mode: text to music with an inspectable generation plan carrying reasoning and confidence; a mood map; conversational refinement; hybrid human-machine editing at every level
- the chain-of-thought music agent: the prompt parser, the genre classifier, the mood mapper, the theory parameters, the structure planner, the confidence scorer — over the genre configs; the third phase adds the neural layer of the timbre transfer, the differentiable synth and the neural vocoder
- the generation styles matrix with the trigger orchestrator — add, update, remove with the intensity, density, chaos and hue macros; the vector composer with the forty-eight scale library and the checked rules: the bass locked to the kick root, the diatonic melody, the chained section drift
- neural stack through the runtime: generative models, timbre transfer, note generation, sequence models, pitch correction; progressive model download with warm-up; stem separation; voice conversion; the spectral module; the instrument identification through the embedding model into the forty-class instrument head with the offline heuristic fallback of the six bands
- the analyzer and reconstructor run fully in the browser: the catalog of one hundred eight cdn dsp libraries loaded in parallel batches with the audit log of the dead urls; the six layers with the butterworth fourth-order band separation; the streaming analysis in thirty-second batches with the first-batch preview release and the toast completion; the tracks, libraries and inspector tabs; the beat detection; the real versus reconstruction playback
- the compact audio json: the per-second timeline schema of about one hundred seventy parameters — the header, the layer, the four correlation parameters of the tempo fluctuation, the spectral transition confidence, the harmonic distortion state hash, the pitch trajectory slope; the symmetric header-to-layer inheritance; the state-hash seeds replacing the base64 audio — the hash family of the compact signal stream with four hex characters per diff sample, the transform coding, the companding, the spectral peaks as the numeric track of about fifteen kilobytes per second; the pattern descriptors of the notes, the chroma, the coefficients, the envelope, the spectral peaks and the scale; the bidirectional text-to-number dictionary; the reconstruction priority chain — the faithful stream first, the seed expansion second, the pattern synthesis last; the audio store of the browser database indexed by session, second and track with the lru cache and the lazy preload against the memory overflow, the streams kept out of the component state; the reconstruction at the native rates; the forty-five seconds analyzed in about thirty with the spectrals computed once per second shared across the six layers, the pitch in the sample chunks, the notes only for the tonal layers; the size cut against the raw samples above ninety-nine percent
- the convergent synthesis engine: the two-hundred-parameter track data, the cross-restriction synthesis, the excitation flow, the truth funnel, the iterative validation within the tolerance, the headroom, the anti-aliasing biquad at the fraction of the sample rate
- the typed composition compatibility rules with weights — the bass note in the chord, the melody in the scale, the dissonance avoided; the melody suite — the motif development, the bass line, the lead, the arpeggio, the counterpoint, the call and response; the anti-repetition history with the compatibility scoring over key, mood, energy, genre and interaction
- the sound-synthesis training machine: the per-instrument implementations — the plucked string, the fm and sine drums, the warm pads, the simplified piano, the vocoder voice, the beatbox — with the effect chain architecture
- the realism canon: the plucked-string and waveguide models, the modal drums, the six-operator fm algorithms, the additive spectra with the inharmonicity factor, the humanization of the timing, the velocity, the micro-detune and the brightness, the breath, fret and key noise
- quality gate with checks and auto-fix, a letter grade, and mastering to loudness targets per streaming platform with mix recipes by genre — the integrated loudness per platform, the true-peak ceiling, the twenty-four bit and the native rate, the gating windows of the broadcast standard, the oversampling ladder, the band-limited oscillators, the offline render, the live ab compare
- the training machine layered over the local store with a vector index: the seven-layer pipeline from input through decomposition, analysis, organization, the pattern library, training and inference producing the tensor-ready data with the model export; tagging, pattern library, musical tokenization, augmentation
- an offline package under the hard fifty-megabyte budget carrying the compressed pattern database of ten-thousand-plus patterns; assembly by constraint satisfaction with the four-level fallback chain; the core bundle under the three-hundred-kilobyte ceiling; the quality targets — the import under five seconds per three minutes, the features under ten, the pattern generation under ten milliseconds, the wave export of three minutes under five seconds, the theory above ninety-five percent valid
- the canonical audio pipeline: input; feature extraction in the frequency and perception domains; generation by the autoregressive, latent, or differentiable families; the vocoder; dsp and effects; output through the audio graph, the file formats, streaming and the players
- node orchestrates everything: the heavy ml in the sandbox, the heavy dsp in the compiled binaries — the ffmpeg, the rubber band library and the cli of the code host in the local tool folder — workers per stage, cache by content hash over the path, the options version and the model version; the worker threads parallel the decode, the transform, the ml and the stems; the deployment image with the audio binaries
- the analysis pipeline runs its stages: decode, mono, tags, stems, spectral features, tempo and beats, pitch chords and key, speech, onsets and structure, loudness, fingerprint, report; the point-dft validated for the simultaneous chord detection; the beat detection by the onset-envelope autocorrelation with the parabolic refinement and the fourier tempogram; the latency-prefix discard
- the import lane decodes chords with the beam search over the cadence-graded hidden model, the swappable key profiles behind one rotation, the tempo with the refinement; the import queue from the five dissected competitors — their structured tags and their stopping rules absorbed
- the stem separation without models: mid-side split, harmonic-residual, biquad banding per stem, cross-correlation validation; the five-signal mapping into the weighted sigmoid masks and the filtered inverse transform; the harmonic-percussive split through the moving average in linear time; the vocal formant table per vowel; the heavy model runs in the sandbox; the research landscape of the neural separators with their measured sdr recorded
- the lyric doctrine: the sound is untouchable, the vibe is everything; legacy cliches banned; prompts carry keywords only, never numbers
- the ghostwriter mirror: the persona unification of five artist mindsets — the waves of subagent research, the vertical times horizontal rule tables, the eight-character word law, the rhyme scheme tracking with the banned rhymes, the fused certainty merge, the tens of lyrics per artist per year, the five variations fused into one, the ghost melody tags, the semantic sonority chains, the articulation patterns with the macro and micro mixes, the extended forbidden words, the production style tags
- the daw surface: eight pages — onboarding, login, mixer, timeline, piano roll, library, master, settings; the mixer notch channels with faders and meters, the genre recipes, the loudness targets per platform, the master metering with the true peak; the timeline strip with the magnetic snap; the piano roll with velocity and aftertouch; the comp recording with swipe to compile; freeze and bounce in place; the stem separation; the hardware bridges; the controls operable by the language model through the tone library, the compiled dsp of the functional language, the rubber band library, the quantized model cache; the memoized subcomponents over the single stable animation loop
- the sample library organizes by type and mood with the perceptual-hash dedupe and the embeddings for similar search — the uuid and hash dedupe over the embedded database with the vector index
- the android daw carries the layout of the modules — core, theme, studio, the separator, the sequencer, the analyzer — with the room database history, the vendor rest service and the neural stem separation
- the legacy of the bitwise engine: the offline render of thirty seconds in tens of milliseconds through the noise buffers, the polynomial shaper of the sub, the comb-delay echo, the bitmask sequencer, the acid fm synth; the eleven generation styles; the analysis page converting audio into binary, samples and hexadecimal; the fx chain of the vendor replication fixed to the hardware ceiling with the nine-band map, the preamp shelves and the compressor
- the dataset catalog: the piano corpora, the lakh corpus, the aria and gigamidi corpora, the free music archive, the neural synthesizer corpus, the multitrack benchmark, the captioned music set, the drum packs, the generative music models
- the api surface: the cli flags for json, stems, fingerprint and visualization; the rest analysis and results; the websocket events of the lifecycle; the json and text reports; the binary artifact index with the hashes and the regeneration notes
- the vocal synthesis plan in three phases — the rules-based phonemizer across the three languages, the vocoder wrapper, the tonality-aware synthesis; the research corpus of the singing synthesis engines
- the server-side pipeline of the planning ladder: the ingest with the conservation number, the bigint identifiers, the blob store, the pattern miner per genre, the composer, the render jobs, the vitrine; the verified execution steps of the ladder generated from the live engine exports

### micro interactions
- the audio mixer: lanes with faders and meters, genre recipes, loudness targets per platform, master metering with true peak
- the timeline editor with clip lanes; the studio arranger composes structure automatically
- the studio pages: onboarding, mixer, timeline, piano roll, library, master, settings
- the mastering chain is honest: loudness measured, never claimed; the ab compare live
- the presentation-pure component tree: memoized lists, the single animation loop reading the references, no heavy css animations, the sticky footer, mobile first
- the audio recipes recorded as constants: the kick sweep, the snare band, the hat pass, the clap times, the sub snap, the saturation constant, the compressor and delay numbers

### engine status
- the proven pipeline: the recorded reference chain of the studio versions — ingestion decomposes real references into per-second vectors; reconstruction deterministic by seed; the first version proved the pipeline real
- the houses recorded on the version ladder: the engine core house, the body house, the acoustic release, the family contract at the platform release; the completion waves from the competitor dissection through the daw timeline editor, the writers, the stems manifest, the scope with waveform and playhead, the gateway persistence with the fetch-first and the session fallback
- the competitor dissections recorded: the market studios with their pipelines, the token vocabularies, the reward models, the preset libraries, the genre taxonomies
- missing: the sample, stem, midi and fingerprint waves; the real daw surface; localization; the golden end-to-end files; the design pass with the genre explorer and the player bar takes

### competitor targets
- the audio class: the generative music platforms, the digital audio workstations, the music streaming apps — the codec and decoder engines of the same class recorded as dependencies; the market leader captured as the design reference with its prompt library grammar and its tag blocks

### next steps
- the open waves of the ladder
- the daw surface real, the studio presentable as the generative platform of the market
- the design pass under the ruler with the same grammar
- the third phase of the music agent with the neural layer

## cadria — image, video and 3d

the media engine of the family. competitor of the media class: the streaming platforms, the 3d suites, the video editors and compositors, the react video frameworks.

### objective
- the engine lives in the root of the app and ships as a published library — raster by software on the server; the gpu of the visitor is never used

### macro features
- parametric primitives with modifiers — twist, belly, extrude, subdivision with its iteration ceiling and quad ceiling — with normals; the up axis in millimeters
- the visualize feature converts an image into a meshable surface with vertex colors across planar, cylindrical and dome topologies plus procedural seeds — the luminance heightmap over the triangulated grid with decimation — the principal feature; the image-to-mesh export in the object and stereo formats
- exporters for the interchange formats: the wavefront with vertex colors, the stereo formats, the usda scene and the embedded gltf
- a bridge exposes the scene over the tool protocol: scene info, primitives, modifiers, transforms, camera, render and export, with pose sampling and a depth pass — the json-rpc tool table with the fibonacci sampling
- render: the scene graph over the modern gpu api with fallback; physics through the wasm engine with alternates
- animation: skeletal, morph targets, blend trees; input: keyboard, mouse, touch, gamepad and xr
- the engine exposes a tool-protocol server over the websocket, authenticated and rate limited
- the six pure logics of the engine: the tick clock with the frame math in exact big-integer ticks per second beside the timecode; the editing algebra of the reference editor — overwrite, insert, lift, extract, split, trim, roll, slip, slide, rate stretch with sync-lock — that never throws, answering typed refusals instead; the blend formulas of the sixteen standard modes; the color conversions across the four spaces; the ease curves; the mask planes with feathering
- video: sliced rendering in ten-second pieces — the preview is the final; a deterministic edit list with the model only on the ambiguous cuts; the render farm spans sandboxes; the multi-cam with proxies, the scopes, the hdr codecs, the watch party; the generate modes; the render contract of the hundred modalities plus one for every cut
- the decode engine: seven types with eighteen functions, frame-accurate sessions over the browser decoder, all positions in exact big-integer ticks; the media probe of the two container families in typed arrays; the declarative transcode ladder — never upscale, even dimensions
- image: background removal in a matrix of techniques; the ansi conversion with dithering; the sixteen blend modes with feathered masks and the color conversions
- the player is universal: seven providers behind a factory — the native element, the two big video hosts, the two adaptive stream families, the websocket and the peer connection; the gpu compute filters in the shading language; the audio engine chain with the equalizer presets and the loudness normalization by the broadcast standard; the multi-client sync over the websocket and the peer-to-peer; the glass interface; the action queue deferring to readiness; the stall detector watching the buffer with the three recovery strategies and automatic recovery; capability probing covers decoding and dynamic range
- the player surfaces: gestures — swipe to seek, pinch for volume, tap and double tap for fullscreen, pinch and rotate, the three-finger undo, the four-finger app switch, the force-touch peek and pop, the jog dial; the mini player follows the platform picture-in-picture with the document variant; privacy mode loads the embedders without trackers; media session with os controls; multi-track audio; chapters parse from the sidecar track; ambient glow extracts color from frames; the stats overlay; the screenshot; the resume; the theater mode; the ab loop; the position restore
- media pwa complete: maskable icons, screenshots, shortcuts, share target, file handlers, the side panel and the launch handler
- the model control pipeline: importing, auto rigging, normalizing, baking, retargeting via the inverse kinematics and compressing, over the lazy-loaded catalog of the forty formats
- studio workspaces for layout, modeling, visualize, baking and the bridge; shading modes; labels reveal on hover and focus; the studio wears the family window grammar — title bar, drag, maximize, restore chip; the dark dcc face with the tool shelf, outliner and property panels; the image render paint test suite
- image-to-three-dimensional sculpting in locked passes with a single corrective action per pass; the agent vision is the sole approver against one comparison sheet
- absorbs the universal player of the family and the creative platform — the multi-format player with documents and realtime chat, the creative platform with its editors and microservices; the editor and player carry the fused name
- the flow law chain: intro once, homepage, the big sign in, onboarding once before projects, the plans checkout success chain, the encrypted redirector as the single production entry on static hosting without functions
- the gallery with masonry columns, category filters, lightbox and likes over real persistence
- absorbs the universal player and the creative platform; the changelog of features is mandatory per release; the game consumes the engine and the audio through published libraries
- performance tiers recorded: the frame rate targets per profile, resolutions up to the top, the video memory ceiling of the max profile, optional ray tracing at max, automatic level of detail, million-triangle meshes

### micro interactions
- gestures: swipe to seek, pinch for volume, tap and double tap for fullscreen
- the mini player follows the platform picture-in-picture; privacy mode loads the embedders without trackers
- the studio surfaces: workspaces switch without losing the scene; the video editor mixes the vendor desktop grammar with the terminal-grade reference; the floating dock and the fixed rail coexist

### engine status
- the engine lives at the root of the studio app as a published library; the published seam carries the audio primitives consumed by the audio engine
- the competitor repositories of the class cloned under the budget — the react video framework, the media pipelines, the compositor references, the interchange formats, the node material stacks
- missing: the engine build as the typescript library at full function — the foreign-language reference engines convert to the house stack; the design pass; the wasm cores riding the release through the bundler and the quickjs runtime; the player roadmap — the plugin system, the offline storage, the protected media, the aria, the localization, the bindings, the cast targets, the thumbnails, the low-latency streams, the steering, the vr, the agents text

### competitor targets
- the media class: the streaming platforms, the 3d suites, the video editors and compositors, the react video frameworks — the foreign-language engines of the same class recorded as conversion targets: the open video editors, the compositor, the media frameworks, the wasm media converters behind the engine mapping

### next steps
- the design pass to the golden bar — the studio surfaces first
- visualize at full function as the principal feature
- the wasm cores in the release assets; the player complete with the privacy embedders

## stealthhead — the fps game

the game of the family. competitor of the shooter class: the adversarial critic compares real frames against the reference shooter of the market.

### objective
- precompiled: shaders and assets prepared ahead of time; the visitor never compiles anything — imports the media engines through published libraries and owns only the game logic: the match, the ranking, the arsenal, the world

### macro features
- arena waves with the full movement grammar: stances, tactical sprint, the slide with cancel, mantle, ladders, lean, the head bob locked to the stride, aiming down sights, footsteps, spawn shield
- medals; prone and the death camera; per-bone hitboxes; hitstop; the headshot fix
- real weapon data with damage, rate of fire, spread, recoil, aim profile and falloff; the six-weapon arsenal with hitscan and rocket, the two-channel learnable recoil, the fire modes, the reload cancel with partial, the penetration, the whizz-by, the per-surface impact recipes, the procedural viewmodel, the hyperburst rates; the hud localizes across languages
- the enemies ride the state machine — the drone, runner, tank, sniper, exploder, boss — with the pool, the trickle, the boss every fifth wave, the cover choice, the engagement slots, the peek tokens, the per-bone hitboxes and the ragdoll; the squad ai shares contact with delays over the blend tree with its solvers; the wave director scales difficulty; the smart spawn prefers unseen
- smart spawning with boss telegraphs and caps; a complete map of sections with bot archetypes and a boss cadence; six map modes with the prop classification — compact, wide, tall, collision, tileset — the prop packs, the platform strips, the parallax stage canvas; the spawn planner with the seeded fair points
- the hud: compass strip, the minimap with the vision cone and the radar sweep, the vitals plates, the hitmarkers of the four classes, the floating damage numbers, the killfeed, the medals chain, the hurt vignette, the weapon cards, the health bar, the touch controls — through transient dom updates
- editor-first, database-first: a master database plus one shard per callsign; the owner database is sacred, never touched; tests run under the ghost callsign; the twelve-table master with the per-callsign shard; the username-as-database sharding attached to the master; the hygiene procedures of the prune and sweep; the owner order stands: the game is not to be touched beyond navigation
- the database as the virtual gpu and cpu: all processing dispatched to the database pre-compiled — the compiled table carries the kind with the hash: the bounding hierarchies, the navigation grids, the probes, the color luts, the shader manifests with the named programs of the probes, the holo scan, the tri-layer car paint, the skydome gradient, the vignette lut; warm-on-play caches the compiled structures after the first session with the cold-start hooks; the offline zip export; the api serves the database bytes cache-first with the disk seeds; the loader parses the raw buffers; the prewarm compiles everything into the database, shaders included — the virtual gpu precompile doctrine
- thousands of ingested assets live inside the database — the four-thousand-plus items at near a gigabyte with the content dedup skipping the thousands of duplicates; the catalog of the model marketplace deduplicated from its hundreds; the mirror integrity report of the copied corpus with the magic-byte verification; the format ingestion of the dozens of formats through the lazy loaders with the conversion of the foreign formats into the standard; the corpus of the reference game with its thousands of files — the models, the objects, the textures, the sounds — as the majority of the repository volume
- the asset pipeline is glb-only with mesh compression, quantization at fourteen bits, weld tolerance, the draco and meshopt and basis compressions, the orm texture packing with the red carrying the occlusion, the green the roughness, the blue the metalness, the lazy decoders; the acquisition formats convert offline through the mandatory transform pass — center, weld, dedup, prune, quantize; the creative-commons curation stack with the cataloged sources; the metadata resolution of the reference game items
- the fixed-rate loop at the higher rate with the maximum substeps and interpolation; the capped delta; deterministic physics by the axis bisection on aligned boxes and the spatial hash — no physics engine, by decision record: the raycast over the bounding hierarchy, the slab test on the six planes, the grid hash over the multi-cell size with the traversal that kills the damage through walls; the swept collision; the delta-snapshot netcode with the input reconciliation
- multiplayer rides the socket with join and state at the fixed rate with the interpolation buffer; the bots run the archetypes from the pool with the periodic boss; the offline fallback to the bots is transparent; the lockstep capture of the deterministic frames; the hijacked automation api on the global namespace — the state, the teleport, the look, the damage, the respawn, the alert, the finish, the graphics preset — with the harness scripts of the state, test, record, enemy, mobile and graphics probes writing their artifacts
- the remote fallback keeps the client offline-first with a local indexed cache and sync
- a gizmo editor that saves and bakes to the database — the hidden editor opens behind the key or the address flag with the scene tree, the raycast selection, the gizmos, the x-ray wireframe, the inspector, the live coordinate readout, the bake to the orchestrator — the merged statics, the instancing, the hierarchy, the navigation grid, the probes
- validation by the monte carlo over the time-to-kill with the thousand-run balancer and the p50/p95 benchmark of the minute; the ten ordered steps gated by the last-validation record; the json report of the boot milliseconds, the frame probe, the console errors and the verdict; the recorded player speeds of the walk, crouch, sprint and tac and the gravity; the playtest checklist of the field of view kick, the ads, the combo banners, the care packages, the overlord phase
- the engine contract: zero external assets, all procedural; subsystems own their directories and never import each other — they fetch through the context; the registry of the eleven subsystems topologically sorted — render, materials, sky, world, physics, player, weapons, fx, ai, ui, audio; the ownership map of the twelve subsystems
- canonical events for firing, impacts, damage, deaths, landings and footsteps; a dozen surface types with their responses
- quality by budgets: the anti-aliasing, the ambient occlusion, the reflections, the volumetrics, the shadow map of the cascades to the horizon, the particle and decal budgets; the draw, triangle and frame budgets of the benchmark — under the call ceiling, under the physics milliseconds, the frame target; zero per-frame allocations; the instanced batches; the level of detail; the rule of the batched versus the instanced by the copy count; the offline-serialized hierarchy; the point-light count as a permutation key with the ballast lights; the materials prewarm by compiling every variant with a bound target; the four-tier quality presets; the lut grading chain of the cube; the closed-form particles; the blackbody ramps of the sparks; the decals projected on the triangles in one draw call with the atlas of the real relief
- the gaussian splatting as the photoreal layer of the references — the renderers compared, the compression pipeline of the splat format under two megabytes, the splat as visual layer only over the invisible colliders of the standard meshes
- the car game of the single file: the vehicle physics of the pure-js engine with the ackermann steering extracted from the box of the chassis with the quaternion anti-gimbal; the closed procedural track of the hundreds of spaced points with the parallel transport frames, the banking and the dynamic-width ribbon geometry; the instanced vegetation of the hundreds of trees in one call; the batched city of the hundreds of buildings in one call with the three levels of detail; the shared terrain of the visual plane and the physics heightfield over one array; the compression ladder of the car model through the codecs; the locked import map of the cdn with the module shims; the fallback chain of the renderers with the context-loss recovery and the static thumbnail; the physics matrix with the locked primaries and fallbacks — the pure-js engine chosen as the only one surviving the offline single file
- procedural everything: the canvas textures of the albedo, the synthesis of the audio, the environment map of the renderer, the tone mapping; the methodology of the single file — the fixed skeleton, the modular theme factories, the config-object theme swapping, the axis-aligned collision
- the character pipeline: the staged sculpt with the spec of the two-layer representation — the semantic group with the per-part dense field of the resolution ladder — over the fourteen primitive kinds; the detail inventory of the identity-defining details mapped before the codegen over the taxonomy of the gloss, bevel, fastener, linework, contour, seam, stitch, stain, scratch, chip, decal, emissive, hole, groove and ridge with its gate; the deterministic review ensemble with the hard overlap and scale gates and the vision model as the last layer; the correction ceilings; the analysis-by-synthesis fitting loop with the bounded coordinate descent; the comparison sheets; the required artifacts of the reference set, the reference mesh, the assessment, the sculpt spec, the rig payload, the render manifest, the comparison sheet and the diagnose render over the paired browser passes; the token budget model of the pipeline — the deterministic scripts near free, the spec, the factory, the review cycles, the total per object
- the forge gates of the character pipeline: the visual hull carving, the uv unwrap, the geodesic skinning, the joint loops, the pairwise penetration, the self-intersection, the turntable, the attachment anchor, the mesh reference compare; the decimation refusing the face flips and the boundary erosion; the morph targets with the relative deltas; the implicit modeling of the smooth booleans over the primitive ceiling; the likeness maximization — the template fit, the camera match, the de-light, the projection and bake, the per-region confidence; the stylized hair of the scalp mass with the ribbon and tube locks; the action-rigged procedural models with the pivots, sockets, collider proxies and destruction groups; the visual hull reconstruction from the silhouette views with the confidence of the hidden regions; the chain of the node materials recognized and rebuilt to the standard shading language; the node material path with the automatic fallback through the transpiler; the microflake car paint emulated with the noise, the fresnel modulation and the clearcoat perturbation
- the weapon pipeline: the reference item families with the adapters, the analysis framework, the projection-first finishes, the de-lit reference baking, the review-scene fixture contract; the item anatomy vocabulary of the knives, pistols, rifles, submachines, snipers and gloves in the two languages for the fidelity debugging; the fidelity pipeline with the binary metalness, the finish recipes, the wear masks by the float value, the paint-seed patterns, the counter led, the sticker slots, the spring-joint charms; the mapping of the reference items to the engine materials with the performance costs
- the rig emitter with the watertight capsule builder and the scaling of the segments; the procedural rigging contract with the deterministic validation split between the factory and the runtime with the pose-probe evidence
- the sprite taxonomy of the other games: the ten asset types with the fifteen actions, the bundle presets with the separate effect sheets, the sheet presets of the rows and columns, the component mode rules; the genre playbooks — the endless runner with the forgiveness trio of the jump buffer and coyote time and the speed cap, the tower defense with the fixed path against the maze, the platformer with the axis-separated boxes, the grid puzzles with the cascade loop, the wall-kick tables, the randomizer and the lock delay with the capped resets; the game ai doctrine — the grid search with the binary heap and the weighted tiles with the corner-cut forbidden, the steering, the behavior trees against the machines, the funnel algorithm of the navmesh, the staggering of the distant agents; the juice toolkit — the trauma shake, the hitstop helper, the flash, the tweens, the camera with the lookahead and the deadzone; the kit of the engine — the timer with the capped delta and the accumulator, the controller, the character controller with the autostep and the snap, the instancing, the compressed assets, the profiler; the scene stack of the web game framework with the lifecycle, the pooling and the shutdown; the audio stack with the gain buses, the sprites and the fallback formats with the spatial pan; the three-dimensional stack with the helpers, the physics, the capped pixel ratio and the manual disposal; the web craft rules — the balanced wrapping only on the short headings, the tabular numerals on the counters, never the transition on all, the compositor-only properties
- the open graph card pipeline: the sixteen-by-nine generation, the title bake, the cover crop to the standard size of the network, the verification, the flag in the site configuration emitted by the injector — never pasted into the root, never the bare type
- the gameplay canon recorded: the spread state table from the crouch to the sprint, the timbre slots in rotation, the squad peek tokens, the ragdoll of the capsules, the audio of the seven-layer synthesized gunfire, the one-pass composite post of the reference game
- the dependency set closed at the recorded count: the render library with the bounding hierarchy and the csg, the ecs, the ai library, the post-processing, the camera controls, the text, the audio, the compression codecs, the navigation, the physics alternative, the transforms, the server socket, the schema validation, the orm trio with the embedded drivers, the router suite, the capacitor packs; the overrides pinned; the rejected packages recorded with the verdicts
- the port law: the server port from the environment within the privileged range else the fixed fallback; the dev port drawn once in its band and persisted; the no-build server runner; the three database drivers with the automatic fallback; the three deploy targets; the address truncation fallback

### micro interactions
- the hud localizes across languages; the death camera; hitstop on the hits; the boss telegraphs
- the montage of the references: the weapon inspect, the medal pops, the kill banner chain
- the desktop block lives only here — the two blocks of the family are mutually exclusive

### engine status
- the database-first structure stands: master plus shard per callsign; the owner database sacred
- imports the 3d engine and the audio engine through the published libraries; no engine of its own
- the consolidation waves recorded: the fourteen sequential versions with one feature per version, the acceptance gates, the rewrite plan of the hundreds of features with the ownership mapping, the master plans of the sections with the goals — the maps, the arsenal, the characters, the modes, the vehicles
- the session parameter logs recorded — the user turns, the assistant turns, the tool calls, the subagent sessions of the rebuild under the flash model
- missing: the warm-on-play cache complete; the asset pipeline at full depth; the remaining feature map tiers

### competitor targets
- the shooter class: the reference shooter of the market — the adversarial critic grades against it frame by frame; the reference games of the class recorded with their engine contracts, their instancing, their hierarchies and their measured budgets; the play counter of the reference on the blob store with the latched sessions and the bandwidth gate

### next steps
- the ghost callsign under tests; the asset pipeline at full depth
- the monte carlo validation and the benchmark on every wave
- the genre playbooks of the other games as the library of the house

## argan — the dns and zones

the dns and network engine of the family — the library every site imports. competitor of the edge-network class: the big edge networks, the authoritative dns servers, the validating resolvers.

### objective
- resolver plus authority plus domains inside one account, signed from day one — the moat; the sovereignty model: the hanging lane for worldwide access, the installed alternative, the gateway for the resolver-less users

### macro features
- dns as a published open source library; configuration by environment and database; no fixed address, port or credential
- the zone is versioned and published by pipeline, never hand-edited in production; the publishing scripts stay build-less
- the wire protocol written by hand per the dns standard; record types with creators, aliases and validation — the ten families with the full-coverage encoders of the record data, the thirty-two-bit serials, the trailing-dot normalization
- the authoritative server over udp and tcp; the resolver client with typed shortcuts; zones crud; the zone file parse and serialize
- transports: the classic port over udp with tcp fallback; dns over tls; dns over https in both forms and the third generation; over quic and its mobile variant; the privacy protocols of the encrypted relay family; the encrypted updates with signed transfers; local discovery names; response-rate limiting
- dnssec signing and validation with the zone and key signing keys on the elliptic curve; the rollover automation; the chain verified to the anchor; the denial of existence proven; the dane records; the acme client with both challenges and the wildcard; the real deployment recorded — the ds record at the parent with its tag and algorithm
- the zone environment policy: the restrictive mail policy, the default certificate authority record, the ttl ladder of the short and the long, the annual key of the legacy suite
- cluster: authenticated gossip with the hmac and origin filtering; one primary as registry; secondaries via authenticated transfer with notify; the sync endpoints — join, sync, health, members, forward — with the inter-copy authentication and the auto-approve for the prefix only; the cluster secret stays out of the repository
- the query walks in steps — stub, send, validate, answer — with cache and ttl
- the hanging-domain model: each person anchors one bought main domain and hangs personalized domains below it, resolving worldwide through standard dns without installing anything
- the registrar panel: a typed label becomes a real subdomain with an immediate public url; whois availability; certificate and dane records; automated certificate challenges of both kinds; the zone bank and the delegation health against the major resolvers
- zone craft: the full zonefile with factories for every record family; automated rollover; real cryptographic validation
- the own naming system: generates the keys of the curve, registers names and propagates the own tld through the package mirrors, the social bot, the p2p seed and the browser extension — the ten propagation channels recorded: the cdn zone caching over hundreds of points of presence, the onion service, the hypercore gossip, the dht records with their byte ceiling, the relay events, the pinning network, the git mirrors across the platforms, the free-suffix pull requests, the resolver extension, the one-line installer of the validating resolver
- the alternative tld mechanics: the suffix that looks like a tld can be a private resolver zone, an authoritative answer, a split horizon, a virtual wildcard tld, or the client's own resolver; the experimental-use lane of the reserved suffix with the decentralized identity of the owner, the serverless resolver with the service worker, the mini-app propagation and the optional blockchain literal; the handshake path with its stack, its wallet, the vickrey auction and the zero-cost sole-bidder trick; the available names of the family recorded on the handshake chain; the free paths of the community suffixes and the managed tunnel
- the hundred-and-one resolution modalities of the layered resolver: the cache, the authority, the recursor, the p2p quorum, the upstream, the write-once telemetry, the popularity-based ttl calibration
- self-hosted email: full server, transactional api with logs and webhooks, newsletter engine, disposable developer inbox; reputation records managed manually
- the search stack is the self-hosted meta searcher, crawler and vector store
- the publication pipeline: whois, records, certificate, web, firewall check, dns verification, tls verification, summary — the seven-step flow
- the same engine runs inside every sandbox: natted network with an egress policy; the resolver-first doctrine with the encrypted api route on the alternate port when the classic port is blocked by the sandbox
- the clone cluster: thirty redundant resolver endpoints behind one load balancer address — every copy of the sandbox platform as an authority, the gossip replication between copies replacing the transfer, the compressed database export at the quality level, the inactive answering with the gone status, the bootstrap by the literal address
- the windows stack verdicts recorded: the authoritative server with the gui as the best primary, the lighter recursive engine, the free secondary transfer of the tunnel provider, the local certificate authority, the ipv6 usually free of the carrier nat; the local stack of the primary, the secondary, the recursor, the web ui and the rest ports at the recorded memory ceiling
- the company stack research: the power servers with the admin panel, the load balancer, the tunnel, the provisioning, the observability trio, the private certificate authority, the versioned zone files in the repository
- the registry platform research: the extensible provisioning protocol with the whois and the registration data access, the open registries, the node frameworks with their measured query rates; the legal layer with the privacy redaction of the directory data
- the zero-cost production flow: the free-domain pull request, the nameservers to the free host, the api-managed zones with the seconds-level propagation
- the multilingual glossary of the dns and tls terms across the fifteen languages built from the standards bodies; the internationalized domain handling with the punycode; the two primary languages of the documentation
- the platform reconnaissance corpora: the subdomain inventories of the market platforms, the dropping-domain lists, the ecosystem master list with its tlds, the root-zone census, the forge alternatives, the private-tld research with the lab reproduction

### micro interactions
- the zone diff compares versions with standards-compliant semantics and shows the exact record changes
- the propagation checker fans out to the public resolvers in parallel — the ten to fifteen operators grouped into total, partial and inconsistent — with an observation mode that reports without acting; the latency and hit-rate charts
- the registrar panel turns a typed label into a live subdomain with an immediate url; rollover states are visible
- the email surface: inbox, transactional logs and webhooks
- the dashboard charts query latency and cache hit rate
- the web ui of the resolver: the five tabs — resolve, build records, certificates, zone file, the handshake names — with the record builders, the public resolver methods, the self-signed generator and the dane configuration

### engine status
- the library suite live: the acme, the dane, the handshake, the two encrypted clients, the publish flow, the naming keys of the curve; the library matrix validated claim by claim
- the real fleet: the three live zones with the wildcard address record at the one-minute ttl through the registrar, the mail exchanger to the mail server, the mail policies, the ds record at the parent; the registrar custody recorded; the posture scan of the main zone recorded — the unsigned state, the missing certificate record, the wildcard answering the random subdomains
- the deploy topology: the static playground, the functions api of the edge, the proxy pair, the wildcard subdomains on the registrar address
- missing: the dns infrastructure lane with staged deploy and automatic rollback; the full zone publication through the pipeline; the email stack self-hosted with the reputation records managed by hand

### competitor targets
- the edge class: the big edge networks, the authoritative dns servers, the validating resolvers, the zone managers; the encrypted resolver endpoints of the market recorded with their endpoints and tiers; the sandbox platforms of the market with their subdomain inventories as the reconnaissance of the gateway family

### next steps
- the infrastructure lane: lint, zone tests, build matrix, image scan, staged deploy with automatic rollback
- the family zone with the app subdomains under the wildcard record; the nameserver move
- the email stack self-hosted with the reputation records managed by hand
- the own tld through the propagation channels, opt-in

## getry — the gateway

the deployable inference gateway of the family — a universal library published to every registry. competitors of the gateway class: the unified model routers, the inference proxies, the sandbox chat providers.

### objective
- receive requests through the route surface, infer or retransmit, and deploy on any platform as a convertible template — the meta model masks the real families behind the house name

### macro features
- the three layers of inference: the masked gateway; the operating system itself as an embedded gateway; own inference inside the sandboxes of the own domains, where training is possible and limits do not apply
- the route surface: seven endpoints times five versions — thirty five routes; the earlier ladder of the three versions with the per-version set; the version chosen by header, path or query; each route self-contained with the models inside the route; the shared lane carries the cdn map of the thousand-plus heavy dependencies with its cache; one gateway configuration produces the seven route handlers of a version
- five lanes: the sandbox-native keyless — the web sdk inside, never pretending to work elsewhere; the paused lane with the explicit fallback and the automatic return to the first; the rotating pool of the twenty-two to twenty-five keys with the least-used-first rotation and per-key statistics; the free proxy over the two aggregators with the fusion context of about nine million tokens; the unified replica with the distilled verdict; further versions creatable per sandbox without limit
- the anonymous lane requires the session header and discovers the free models dynamically with the last-known-good; the free-tag lane of the public router refuses the paid models outright
- the meta-model masks the upstream in every response — every response reports the house name; the meta-model junction composes the models of the fusion behind one dispatch identifier — the rotation models, the individual models, the embedding models; the declared context is the aggregate of the composed windows, with the output ceiling recorded; the shared context persists per session in the database, reloading the accumulated history on the switches of route and model
- the model swap on the message window per session; the key rotation per request; the model inventory of the tens of models with the embeddings; the provider catalog of the forty-plus providers with the exact context and output windows; the free pool of the models with the million-token contexts; the token-plan provider of the mobile vendor with its variants; the coder provider surface with its streaming phases and its reasoning tokens in the usage; the research of the vendor inference catalog — the embedders, the rerankers, the speech models
- the inference pipeline in its full order: the keyed signature; the server; the guard with its four gates; the cache of the least-recently-used over the embedded database; the version router; the porter; the jury of three; the adapters; the normalization; the outlier removal; the weighting by the inverse calibration error; the divergence cascade; the write-once audit
- the porter resolves most requests at zero cost with the ordered rules, the allowlist and the database lookup before any provider call — the rulers cut eighty to ninety percent; the photocopy cache answers the repeated state; the idempotency key returns the same verdict; the grey band never acts alone; the hard block above the ceiling
- the local jury: the diverse panel of three over the providers in parallel with the nine-stage pipeline; the votes normalized; the outliers removed; the weights inverse to the calibration error within the clamps; the answer with the confidence and the divergence mark; the escalation to the cascade — the small model, the verifier, the medium, the large; the distilled verdict is the destination lane
- the calibration engine: the expected calibration error over ten bins; the temperature scaling by the grid search over the log range with the step; the snapshots per provider and model; the nightly recalibration at the recorded hour; the free-model sync on its interval; the confidence rides every verdicted response
- the audit: the write-once chain of the previous hash to the hash; the table set of the verdicts, the calibration, the labels, the providers, the models, the audit, the rate limit, the cache, the memory tiers; the append-only individual votes; the verdict surfaces expose the votes, the weights, the evidence and the guard scores
- anti-sycophancy: flattering and false confidence are prohibited; the confidence below the floor returns the explicit unknown
- thinking is always on at every route without exception, at the seven levels with the character budgets recorded — the budget pair, the effort ceilings of the token maximums; the reasoning precedes the content; the leak-filter state machine across the chunks; the dual format of the reasoning tokens; the two-call pattern for the lanes that cannot stream reasoning; the thinking block of the interface with its expander and the medium default; the structural extraction of the thinking
- streaming law: the exact frames of the reference api; the keepalive at the two hundred milliseconds with the suppression ladder to the second; the heartbeats only while idle; the partial frames never emit; the brace-depth parser retains the incomplete buffers, emits the terminator only at the depth zero outside the strings, discards the corrupt frames and never relays them; the body passthrough by the stream fork
- anti-throttling: the exponential backoff with the cryptographic jitter; the bounded retries with the recorded range and ceiling; the retry-after honored; the pacing; the cooldown; the single flight with the waiter queue; the global mutex of one
- the key vault: store, resolve and revoke through the seams; the resolution at the last moment; the mask before every log; the export check refuses any key shape; the key registration with the census and the masked display route
- the auth roster of the twelve methods: bearer, header, query, basic, the oauth client credentials, the signed tokens, the cloud signatures, the cookies, the mutual tls, the keyless, the anonymous; the tenant authentication by the keyed signature of the identifier
- routing by tier, tenant and request kind — the free tier to the second lane, the pro to the fourth, the enterprise to the fifth, the canary share of the sixth; version pinning per request with rollback, coexistence and canary
- the autofix engine: the parameter normalization without lists — the casing, the accents, the typo to the nearest valid by the edit distance, the clamp with margin, the string to number, the boolean coercion; accepts the three api grammars; the format converters for the tens of sdks
- the universal parameter acceptance with the autocorrection and the clamping
- the context budget guard computes per turn: the input bounded by the context minus the maximum output minus the safety buffer
- multimodal subroutes beyond chat: image, video, document, music, audio, embed and rerank; the music subroute of the first lane understanding music without a native model; the subroutes planned for the target count
- the slicer cuts the million-token contexts into the overlapping slices of the thirty-thousand tokens; the tree map-reduces the partial verdicts
- replication: each new sandbox chat becomes an independent copy with its own database and the same route set; deploys on the subdomains through the wildcard; the replicas raise by sending the gateway document into new chats; the replication kit ships the foreground transfer with the auto-resume per part, the chunk validation, the archive extraction, the double-fork survival, the device-flow authentication and the key derivation of the transfer protocol from the salt
- the console: fifty four screens plus the multimodal subroutes; the kpi dashboard of the requests per minute, the tokens per second, the jury, the cascade and the calibration error; the ten playgrounds — the verdict, the chat, the jury, the cascade, the guard, the risk, the report, the cache, the memory, the calibration with its reliability diagram; the operation, editors and governance screens; the model registry free-only, ordered by the public intelligence index; the model hub with the test routing — the task match, the cost-balanced-quality slider — the leaderboard and the agent marketplace
- the engine on the fast runtime with the typed orm and the embedded database, behind the edge router; the default model of the fusion with its million context and output ceiling; the next adaptation for the sandbox deploy with the bypass versions; no platform functions
- the plugin surface: the reverse-engineered provider plugin bridges the command line client to the sandbox chat — a headful browser with its own profile, stream interception, tool execution locally
- the mechanisms live one per file at the gateway root — the jury, the porter with its rules, the cache with its prune, the verdict, the gates, the weights, the cascade, the evidence, the guard, the memory, the trainer, the slicer, the doctree, the retrieve; the build order: verdict, cache and doorman first
- the universal library published to every registry: the twelve auth methods, the routes per version, the unlimited versions, the model rotation, the base url rotation, the retry with jitter, the throttling handling, the cross-provider fallback, the two-call thinking, the anti-parse streaming with the model masking, the context sharing, the meta-models, the embedded database over the universal adapter, the scaffolding cli — init, add, list, show, validate, keys, models, serve, export
- the chat gateway contract with the operating system: the session and thinking headers, the reasoning before the content, the single done marker

### micro interactions
- the chat registration is opt-in: the disconnected state is natural; the endpoint never inferred or prefilled; the endpoint field persists as a local preference
- the registration probe validates the origin, probes the model catalog with a timeout, and walks the four connection states
- the send posts the chat completion with the meta model name; the response streams with reasoning before content
- the session header rotates with the context window; the thinking level rides its own header
- the conversation can request a sandbox through the api: creation with model and resource shape, execution with output and exit code
- the thinking block of the interface in its warning color with the expander

### engine status
- five versions defined and live in the ladder; the route surface complete; the key pool registered with the census before the ready state; the production deploy split live — the static playground, the functions api of the edge, the container and the bare metal, the proxy pair, the wildcard subdomains
- the model catalog captures of the market providers recorded; the provider research of the vendor catalog
- missing: the production deploy workflows, the nightly calibration job, the periodic free catalog sync; the restore-or-retire decision on the paused lane; the blocked entry stays a recorded decision

### competitor targets
- the gateway class: the unified model routers of the market, the inference proxies, the sandbox chat providers whose recipes are recorded as evidence — the compat surface of the router style with its provider-prefixed routes, semantic cache stats, the idempotency window, the sticky sessions, the latency percentiles, the budget and backup apis; the builder platforms with their websocket gateways, preview discovery, ephemeral preview tokens and capability events; the conversation-sandbox provider with its pod-per-chat, versioned storage, the single websocket of about two thousand frames per session and the token window; the full-vm provider with its remote desktop port

### next steps
- the gateway workflows to implement: the continuous integration, the production deploy, the nightly calibration, the catalog sync
- the paused lane decision
- the extension of lanes by the owner — further versions creatable per sandbox
- the multimodal subroutes to the target count

## vault — the storage engine

the storage backbone of the family. direct competitor of the storage class: the object stores of the big clouds, the hosted database platforms, the buckets, the self-hosted storage daemons.

### objective
- it only stores: git objects as the source of truth under the library bindings and the orm layers; built first because storage is of utmost importance — the p0 of the operation

### macro features
- chunked object storage with content-hash dedupe and compression; a catalog enables automatic reuse; the pointer width sustains terabyte scale — the sixty-four bit pointers; the vault chunk at the megabyte with the standard hash and compression, the application ingest chunk at the two hundred fifty-six kilobytes; the reassembly on read
- encrypted at rest with authenticated encryption under wrapped per-project keys — the twelve-byte vectors; access keys stored only as hashes with constant-time comparison; the visible prefix with the hashed secret; the master key from the environment or generated
- the decoy database serves anonymous probes with plausible fake projects; a database download returns the encrypted decoy while the real base stays sealed — the recorded lesson enforced forever
- the console: projects, buckets, the object browser with folders as pages, retention, keys with revoke, the audit query, and usage by plan metered in chunks
- the conversion pipeline: upload, chunking, the layered maximum archive plus brotli over it, decode through the engines, mimetype return through the mimetypes api
- the open-object architecture: the derived database never versioned; blob posts without base64; one reference per bounded group of users; the signed shards of the curve; the terabyte scale of the paid plans
- the pointer types and git-storage strategies are cataloged — forty of each — use the cataloged one, never invent
- the sealed stack keeps the git objects inside the database beside the relational pair and the schema tool — the library semantics with the commit pointers and the rollback checkout; the per-theme mirrors keep the components free of hardcoding
- every hard disk is a database; databases multiply automatically with the registry mapping them; clusters pool memory and storage of the clones; the person opens as many as wanted from the drive panel; the external storages connect opt-in
- the export route answers the standard methods with automatic table discovery and the protected delete — the backup on the internet
- policies govern read, write, list, delete, admin with prefix scoping; deny overrides allow; every action lands in the audit row
- replication: master plus shard per account; the quorum write of the majority; any-of-N read; the daily idempotent reconciliation; last-write-wins; the sandbox replicates to the external database sites
- memory tiers by temperature with the latency budgets — hot under the millisecond, warm under the ten, cold under the second, archive under the hour; oversize blobs go directly to cold; the promotion and demotion by size and frequency
- the storage-to-ram bridge swapping, mapping and overlaying the same bytes between use flags; the memory tiers of the engine
- the wire fabric of the storage: the git filesystem storage, the chunk catalog with the hash and compression, the cipher per field, the append-only identifiers of the time-ordered kind, the push ceiling per minute
- the blob store contract answers the stream put with the identifier, bytes, hash and kind — friendly to the large-file pointers
- the daily incremental snapshots with the recovery objectives
- the storage fabric research matrix of the fifty topics — the compression, the deduplication, the union filesystems, the replication streams, the pinning networks, the object stores, the archives, the steganography, the tape, the conflict-free replicas, the gossip logs, the zero-copy io; the infinite-storage research of the thirty solutions — the node filesystem bridges, the dataset abstractions, the edge stores, the free buckets, the orm sharding of the shards, the local compute
- the git surgery tools: the archive merger over the isomorphic git with the lightweight filesystem and the zip repair of the head, the grafts and the packed references, exporting the merged archive; the chronological merger with its fifty-plus archive formats, the graft chain, the reflog consolidation and the sanitization
- the free-tier research of the storage platforms recorded with the quotas and the mirroring recipes

### micro interactions
- the asset browser opens folders as pages; retention and keys manage from the console; usage reads by plan meter
- the drive panel opens the databases of the person; the external storages connect behind the opt-in

### engine status
- the engine list pinned in the manifest: the version control bindings, the schema engines, the orm pair, the wire drivers, the local store
- the storage doctrine of the whole family lives here and every app inherits it
- missing: the engine at full function — the git objects at terabyte scale, the signed shards, the blind drain, the decoy download defense proven in production

### competitor targets
- the storage class: the object stores of the big clouds, the hosted database platforms, the self-hosted storage daemons of the distributed class — the open engines of the same class recorded behind the engine mapping as the conversion targets

### next steps
- the engine at one hundred percent — the p0 of the operation
- the upload pipeline proven to the terabyte scale on the paid plans
- the decoy defense and the authorized-hosts-only apis verified

## forge — execution only

the execution role of the family. competitor of the sandbox and static-hosting class.

### objective
- it only runs: every capability descends from the sandbox engine; the site face of the execution role with the runners at the sandbox frontier and the published library

### macro features
- exists as a site only: web surface plus convertible packaging inside release assets; registers the runners and the run logs over https; the site archive and the next conversions travel as the compressed release assets
- no library of its own beyond what the sandbox engine publishes; no native distribution; the site roles carry the persistence: this one keeps nothing — the role exists to run
- the virtualization forge: the modular vcpus to the thousands, the gpu catalog of the newest generation, the emulator and firmware configurations; the c++ core with the direct device access and the management protocol bridge with its asynchronous methods, the typed orchestrator of the logics above, the distroless container; the typed plan generator with the argument linter; the embedded feature set of the virtualization; the scheduler of the million threads
- the virtual hardware engine of the forge: the shims of the process tree, the vendor query, the compute and management libraries; the emulated flagship cpu, the memory info of the hundreds of gigabytes, the orchestrator over the container and the server — the blueprint of the sandbox-provider killer
- the runtime container of the hypervisor: the cmake build, the type-stripping checks, the multi-arch image builder, the emulator dry-run checks; the build stage with the script-ignoring install and the distroless non-root entrypoint
- the character decomposition of the sculpting pipeline: the nine-layer ontology, the build dag, the worked coverage test, the completeness checklist of the fifteen points; the detail taxonomy with its gate; the local spec search over the collections with the evidence bundles; the adapters of the segmentation and depth models with the provenance; the splatting stack of the photoreal references; the fidelity tooling with the pinned servers and the isolated profiles; the material resolver with the evidence extraction, the per-region comparator and the microscope capture
- the ci and build app of the family: the keyword surface of the role, the robots law, the universal desktop artifact lane for the nine sibling applications

### engine status
- never a new app: a role of the sandbox engine, like its siblings

### competitor targets
- the execution class: the sandbox providers and the static hosting platforms — the cloud sandbox providers recorded as the shape to equal

### next steps
- the site role law: the library publishes, the clone never distributes — zero binaries in the assets
- the rig and sculpting gates of the character pipeline as the shared tooling of the game

## foundry — execution plus storage

the complete role: execution plus storage plus sandbox. competitor of the same class.

### objective
- it runs and keeps — the engine lives in the sandbox engine, the storage in the vault

### macro features
- same site law as the execution role: deployable clone, convertible packaging in assets, no native distribution
- the database-plus-sandbox site role: adds a running sandbox to the databases of the network; containers and buckets under one console; the clone owning the sandbox and image surface records, the engine in the sandbox engine
- the joined pair of the market clones: the execution sandbox with the network database

### engine status
- never a new app: the complete role of the sandbox engine

### competitor targets
- the complete class: the sandbox providers with storage of the market — the cloud sandbox and container platforms recorded as the shape to equal

### next steps
- the site role law; the role serves the network as the clone with persistence

## cobaia — monetization

the public parallel site of the family: apps, pricing, support, blog and legal pages.

### objective
- honest monetization only: real ad slots, referral, plans and support; the testbed of the family carrying the monetization so the main sites stay clean

### macro features
- the public site with the apps catalog with deep links, pricing, support, blog and legal pages; honest empty states; the placeholder ad slots declared and empty until approval
- the ad script loads only after approval, injected through environment configuration; the monetization layer of the ad-network service workers with the domain and zone configuration and the injection scripts wired into every page
- the ethical limit is absolute: no invisible click mirroring, no hidden frames, no bot traffic; invalid traffic is never engineered
- the plan limits stay visual inside the system app; the engines and sandboxes stay free and unlimited
- the monetization rails: the checkout of the payment provider, the payment links, the metered api billing, the sponsors, the donations and the tip jar; the coupons and trials in the database; the digital delivery automatic
- the monetization research recorded: the forty forms of the developer-to-developer monetization, the header bidding of the hundreds of bidders, the rewarded rates, the offerwall experiments with the decision window, the locale matrix of the thousand-plus keywords across the twenty-two locales, the playbook of ninety days, the ten new app concepts; the verdict of the non-existent sdk recorded — the sighting was an offerwall
- the absorbed surfaces of the family live here as the parallel testbed: the social platform with its ai providers, its clients of the question and video platforms, its views, its multiplayer quiz rooms and its socket events; the site builder with its deploy providers, its component blocks, its background engine of the effects, its ai customizer; the wallet extension of the naming chain with its api actions, the domain auctions and the provider bridge; the universal web player with the os file handlers, the protocol handler, the share target, the encrypted storage hook and the tab sync; the family video player with its options, filters, presets, compute shaders, the loudness normalizer and the provider detection; the email reader; the ansi-art library bits; the cms surfaces of the absorbed app with its dual desktop and mobile pages, its state routes, its workspace tabs, its chat with the structure suggestions
- the deploy platform catalog research of the hundred-plus alternatives; the social platform of the absorbed roster with the posts, comments, likes and favorites under the row-level security of the managed database, with the oauth doors of the two big platforms, and the offline fallback creating the account directly when the backend is down

### micro interactions
- the checkout rides the payment provider; the plans page reads the honest quotas
- the apps directory carries the deep links into the family deploys
- the blog and the legal pages render statically

### engine status
- the public surface of the family; the payment decision pending — the provider choice among the payment platforms, the local payment method for the home country, the entity behind the store
- the ads only after the approval through the environment configuration

### competitor targets
- the monetization surfaces of the market — recorded as evidence of what honest monetization looks like; the offerwall and ads-only verdicts of the research recorded with the platforms of the h5 games

### next steps
- the payment page with the two views — the saas intro and the internal panel
- the ad approval through environment configuration
- the legal and policy pages deployed statically before the oauth redirects can work

## the cli — the terminal face of the operating system

the terminal application of the family: the same interface, the same information architecture, the same laws, rendered in the terminal. the chat of the house in the conversational terminal.

### objective
- the web in the terminal: one domain model rendered by the web tree and the terminal tree, the navigation rail of chat, history, projects, providers, usage, routes and settings — the parity is the contract

### macro features
- the operation modes, twenty and more: terminal, shell, browser, desktop, headless, library, server, client, the text ui, the plain cli, memory, plugin, test, debug, quiet, interactive, build, plan, explore, general, attach, the pipeline action, the sdk, the plugin host, the tool-protocol server, the language server, the pty, the version control, the watcher, the delegation, the themes, the offline, the embedding — each mapping to the internal memory of the hybrid search; the mode detection table with the defaults; the feature-detection core adapter
- the terminal modes of the chat: the infinite canvas — the node graph of the conversing agent blocks with the project document as the base prompt and the preview port; the invisible mode — the minimal vertical logs; the visual mode of the blender-node graph with the prompt guide
- the terminal interface: the render tree of the newest terminal toolkit over the newest runtime tree with the raw ansi fallback and the alternative renderer; the braille spinner; the adaptive box; the component family of the interface kit; the command palette with the fuzzy search and the recent ranking; the leader key; the file, agent and slash autocompletion; the bash preview; the symbol lookup; the status bar of the model, agent, session and tokens; the collapsible thinking block; the virtualized messages with the rendering ceiling; the toast system callable from anywhere; the diff viewer inline and stacked; the streaming message components; the icon glyphs with the unicode fallback and the powerline set
- the banner: the figlet logo with the gradient, the three-phase animation — the reveal per character, the gradient sweep, the idle wave and pulse — the paste slot for the custom logo; the timing catalog of the cursor blink, the typewriter and the breath
- the theme system: the built-in json themes with the eighteen tokens — the palette, the borders of the prompt and its focus, the build and plan modes — loaded from the themes folder with validation and the crossfade; the living background engine — the gradient shift on its cycle, the breathe, the idle shift, the typing stabilization; the theme registry with the transition field; the authentic palettes recorded
- the persistence law: every path under the configuration root — never the state, cache or data directories of the platform; every database operation also exports the json to the data folder; the configuration is the single json — never the commented, yaml or toml variants; the storage chain of the file, browser and memory stores per mode with the environment overrides; the cache ceilings of the model catalog, the file tree and the tool servers; the dual write of the embedded database and the json with the rebuild recovery; the storage engine detection — the better sqlite, the runtime sqlite, the json-only fallback; the write-ahead log; the versioned migrations; the session import and export
- the agent system: the subagent types — the read-only explorer, the planning scout, the general with the full tools, plus the reviewers of the code, tests, security, docs, refactors and debugs; the mention parser with the delegation tree; the per-agent permissions of allow, ask and deny with the glob patterns and the approval cache; the per-agent model configuration, the token budgets and the step limits with the read-only pause at the limit; the agent color identity; the hidden agents of the compaction, title and summary; the worker pool over the threads with the rpc protocol and the health checks
- the memory system: the vector index of the nearest-neighbor search with the hybrid keyword and vector fusion of the reciprocal rank; the memory tool with the add, search, profile and forget; the memory layers of the session, project and global; the memory blueprint of the tool-protocol server with the local embeddings, the keyword and vector indexes of the embedded database under its ceiling, the managed postgres above it with the hierarchical index, the dedicated engines above that; the three-phase sleep consolidation; the embedding tiers — the local, the multilingual, the matryoshka
- the local inference of the state-space family: the compact model of the hundred-thirty-million parameters in the four-bit quantization near ninety megabytes with the constant recurrent state of the tens of kilobytes — the model state itself as the index with the keyword fallback and the fusion; the backend ladder of the web gpu, the runtime, the wasm and the cpu; the temperature for the code suggestions; the headless inference server of the runtime with the compatible endpoints and the fixed-size session tensors; the model map of the twenty modes — the compact web-first primary, the hybrid for the server, the distilled embedder head; the model registry with the lazy download, the integrity hash, the registry mirror and the release fallback; the state compression replacing the conversation history with the recurrent state and the token buffer; the distilled embedding head replacing the character hash; the inference stack of the wasm runtime with the quantized models served from the cdn; the tiered ladder of the local primary, the optional larger local and the cloud mini
- the browser parallelism stack: the wasm runtime on the main thread, the three workers of the inference, embeddings and the pre-processing with the search index and the reader, the shared buffers with the lock-free pub-sub, the rpc of the comlink, the leader election of the web locks
- the model routing: the multi-model router with the fast default, the fast lane and the complex lane; the provider registry of the two hundred twenty six providers with the free-first routing and the automatic fallback, cost and speed optimization; the model listing with the local cache refreshed daily, the fuzzy search, the free-versus-paid indicator and the token price estimate; the endpoint matrix of the twelve providers with the user-owned keys; the rule sources of the agents — the agent, the assistant and the editor rule files of the ecosystem
- the git integration: the undo and redo with the snapshot, the diff-aware undo, the workflow templates of the pipeline; the patch application tool
- the client protocol server of the agents, the editor extension and the language server support
- the session sharing: the rest and cli endpoints with the qr code, the expiries, the sanitization and the exports in the three formats with the sanitize flag
- the structured logging to the state folder with the rotation and the trace correlation
- the tool-protocol management: add, list, authenticate, debug, the health checks, the dynamic oauth of the registration protocol, the tool cache with its ceiling; the serve over the stdio and http with the consent gates
- the oauth manager of the three providers with the encrypted credentials; the six auth stores — the memory, the browser, the family, the three external clients of the ecosystem; the provider accounts of the sixteen with the rotation and the health trackers
- the provider cli of the house: the login, logout, accounts, quota, config, models, status, doctor and menu commands with the configuration override of the ecosystem
- the rss subsystem: the ingest, list, remove, status, query, recent, digest, health and analytics commands; the six-module pipeline of the fetcher, parser, cleaner, chunker, embedder and store; the four-layer cache; the polling budgets per feed type; the feeds of the news, code, papers, videos, podcasts with the transcription, books, the link aggregators, the forums and the magazines; the item streaming over the server-sent channel; the seen-items cache with the last-modified; the digest and mirror commands; the deployment command per platform; the alternatives research of the social protocols; the voice and iot variants; the training pipeline with the chunking, the dedup and the domain cap
- the web workbench: the three-zone browser workbench of the rail, canvas and inspector; the flat pages of the home, providers, projects, routes, usage and the not-found; the pairing by the consume endpoint; the parity with the terminal; the session tabs, the stream canvas, the command palette, the route inspector; the localhost gateway typed contract bound to the loopback with the origin validation and the streaming responses
- the anti-localhost law of the cli: the random host octets of the loopback, the port drawn from the cryptographic range and locked, the retry ladder, never the literal localhost name; the port record of the port, host, process and timestamp in the port file; the memory-primary state with the file fallback synced on the interval
- the local-first entry: the pairing codes, the compact identifiers of the prefixes and the ten-character token, the workbench addressable by url; the stable identifiers of the workspace, session, tab, section and message with the sqlite adapter and the json fallback
- the exports map: the seventeen flat entries of the distribution — the agent, auth, commands, core, database, markdown, memory, plugin, sdk, server, shell, side, store, themes, the interface, the ui; the flat root with the fourteen category prefixes and the barrel per category
- the native binary: the compile of the runtime produces the executable near the hundred megabytes with the externals; the artifacts of the three platforms; the binary pipeline with the multi-arch, the compression and the baseline variant; the distribution through the package managers of the three platforms and the stores of the six managers planned
- the installer: the curl script detecting the os and arch, pulling the binaries from the releases
- the workflow matrix: the verification, integration, pages, release, compatibility, security, scanning, lint and target lanes that reject the tag mismatching the manifest
- the server: the route index of the tens of routes in the ten groups, the openapi of the current version, the schema validation, the rate limiting, the traversal guards; the health endpoint of the providers; the streaming with the polling fallback; the backend beside the dev server on the matched port
- the plugin system: the server function returning the hooks of the messages and the tools; the memory plugin with its database path, result ceiling and injection; the loader from the configuration; the load commands
- the roadmap of the agent architecture: the dependency injection with the symbol tokens, the lifecycle hooks, the permission guards, the interceptors, the pipes, the middleware chain, the delegation with retry, the circuit breaker and the queue
- the embedded database rewrite: the sqlite-first with the json fallback of the engine abstraction; the wasm binary of the local model lazy-loaded in the three build variants with the cache commands of the models

### micro interactions
- the chat layout: only the centered logo, the message blocks and the input box — no top bar, no status bar; the arrow-key selection, never numbered; the maximum of the three steps; the vi mode optional
- the command palette over the shortcut; the leader key; the fuzzy files and agents
- the compact mode by the terminal width; the media rendered to the terminal; the spinner variants
- the module family of the ui with the banner, icons, input, messages, status, toast and tokens

### engine status
- the interface in its second major: the domain model shared, the navigation rail of the parity, the auth, config, sync and serve as the cli-only commands
- the capability audit against the rival agents recorded: the hybrid memory unique to the house; the critical gaps of the editor integration and the background agents; the roadmap of the seventy-six to one hundred six days
- the module matrix audited across the twenty modules — the eight fully autonomous, the core as the base, the persistence of the database and memory, the orchestration of the agent and plugin
- the operation plans recorded: the nine hundred actions in the ten chunks — the bug fixes, parity, the interface modernization, agents, architecture, themes, distribution, integration, the advanced and the security; the redesign checklist of the forty actions; the interface tree of the logo slots with the font conversion and the media rendering

### competitor targets
- the agent command lines of the market: the first rival with its provider count, the second with its messaging platforms, its keyword memory and its persona file; the editor agents, the terminals, the continuous rivals — the capability gaps cataloged against all of them; the session databases of the rivals read-only as the evidence of the golden path

### next steps
- the gaps of the roadmap: the version control manager, the editor extension, the server-side tool protocol, the skills marketplace, the cost dashboard, the review bot, the voice-to-code, the background agents
- the distribution through the six package stores
- the state-space ladder through the web gpu

## the extension — the consent-first browser agent

the browser agent of the family: the laws of the operating system riding into the browser. it exists as the product with the longest release chain of the family, from the frozen base to the current major.

### objective
- consent-first, always: the capability matrix is least-privilege, every action is previewed, every grant is bounded, the audit is immutable, the telemetry is off by construction

### macro features
- the frozen protocol: the message catalog of the twenty three messages, the ten schemas, the action vocabulary of the three hundred thirty five immutable kinds in the twelve families — the interaction, observation, navigation, the tabs and windows, forms, datasets, files, the media capture, network, debug, workflow, triggers — beside the twenty eight observation kinds; the five wire error codes; the six exit codes of the terminal; the protocol major of the second generation with the deprecation window of the first; the schema freeze artifact pins it all
- the capability manifests: one json per frozen surface — the background, the content bridge, the side panel, the popup, the cli, the library, the tool-protocol server — pinning the release, the protocol major, the messages, the kinds, the permissions, the permission coverage map and the tool versions, with the drift entries of the manifest diff
- the workflow engine: blocks, scopes, expressions and control flow; the ten trigger kinds — the visit, url, menu, key, button, cron, interval, list, webhook, event — with cooldowns and dedup; the typed variable scopes with shadowing; the expressions with the regex extraction of the named captures; the dry-run projections; the single-step debugging; the checkpoints; the conditionals, branch, loop, while, foreach and parallel with joins; the try-catch with retries and timeouts; the canvas editor with the nested blocks, minimap, breakpoints and the version diff; the versioning, diffing and rollback with review; the background runs with the watchdog of the stalls and zombies; the per-site policy overrides; the import and export
- the importers: the plans authored outside the family — the first version, the automation extension, the test framework, the tabular formats — convert into the reviewed plan grammar with the refusal twins; the importers convert only and never execute; the fixtures ship in every package
- the agent swarm: one agent per tab, the roles of planner, worker, observer, critic and verifier; the work stealing; the leader-worker topology with scaling; the consensus quorum; the tab handoffs; the locks of origin and selector; the conflict scans; the escalation inbox with the human decisions; the blackboard of the verified lessons; the depth limits; the mailboxes; the per-agent budgets and scopes; the kill switch; the dashboard of the overview, per-agent cards, the shared queue, the message flow, the conflict and arbitration log, the cost panel, the escalation inbox, the kill switch, the timeline scrubber and the aggregate report download — read-only for the viewers without the run role; the certification of the thirty coordination scenarios over the fake tabs of every browser kind under the fake clock; the six certified topologies — the leader-worker with election, the round-robin slicing, the exact claim, the plan delegation, the swarm consensus, the hybrid rollback
- the agent protocol server: the four namespaces of the browser, workflow, memory and system; the json-rpc framing with the consent-refused error; the stdio and http transports with the localhost bind on the default port; the single-use pairing codes; the session tokens as the hashed digests; the allowlist; the approval gates; the streaming; the idempotency keys; the batching; the dry runs; the tool mocks; the degraded read-only mode; the per-client rate limits; the tls for the remote; the capability negotiation
- the security core: the deny-default allowlist; the origin profiles; the consent windows with the duration; the sensitive classes; the masking; the secret vault with the last-moment resolution; the phish guard; the schema-strict inbound guard; the rate limits; the confirm gates of the pay, delete and credentials; the redacted shots; the escape hatch; the on-device virus verdict; the nonce handshake; the data minimization with the telemetry off by construction; the capture and forensics with the redaction; the forms with the ask-submit review; the memory model with the sealed sensitive notes
- the session interface: the five session stores with their gates — the site notes with the sealing at rest, the scratchpad, the run summaries, the correction memory, the consent memory — with the semantic recall of the fingerprints, the recall seam, the incremental search corpus and the audit bundles
- the execution environments: the isolated world; the offscreen worker pool that grows with the parse queue with the user-fixed size and the transferable keys as buffers, with the inline fallback; the sandbox frame with the per-render nonces; the keepalive run state with the heartbeat; the service-worker reattach resumes from the pending step; the zombie reaper; the per-tab namespace isolation; the url history per run
- the performance model: the lazy loading of the heavy modules with the declared load reasons and the warmup telemetry; the dom debouncing per event type; the batch backpressure — the queue pauses, the steps never drop; the incremental snapshots with the deltas; the selector cache per generation; the virtualized lists; the streamed parsing of the oversized pages; the chunked extraction of the big tables; the worker queue backpressure; the per-step performance records; the per-domain concurrency slots; the domain lanes; the polite delay; the adaptive poll; the run budgets with the alerts; the timeout-cancel; the tab suspension; the battery and network aware deferrals; the run cache; the step prefetch; the warm selectors; the session reuse; the efficient resume; the navigation dedup; the duration meter; the selector profile; the step trace; the startup meter; the slow motion; the artifact compression; the log pruning; the parallel reads — every window and budget a user choice
- the observers run the read-only vocabulary over the accessibility tree, the shadow roots, the frames, the reader view, the outline and the open graph; the target resolution answers the selector, text, aria, name, path, index and point grammars with the ambiguity refusal and the candidate lists; every clickable element numbers itself in the document order
- the datasets extraction: the header normalization, the span expansion, the nested tables, the pagination merge, the chunked streaming; the run timeline watches the console, errors and tasks with the spam collapse and the run diffs; the persistent sessions checkpoint the scroll, forms, storage and cookies with the crash detection
- the interface surfaces: the five surfaces of the popup, side panel, dashboard, options and onboarding behind the uniform routing on the one command bus with the audit trail and the broadcast channel; the command palette with the fuzzy search and the recent ranking; the onboarding walkthrough with the four consent completion events; the surface family — the datagrid with the column type inference and the masked exports of the three kinds, the export menu with the masked values, the quick actions context menu, the shortcut keys, the omnibox task, the status badge, the notifications with the deep links, the recent tray, the picker overlay with the stability-scored selectors, the target halo with the state colors, the shot panel, the compare viewer with the before-and-after slider, the page chips, the site profiles, the dark and light, the two locales, the import-export and the drop import
- the site bridge: the relay wire protocol of the envelopes — the session create, join, event post and event stream — with the hashed token authentication, the token rotation on rejoin, the pairing codes of the five minutes; the static site renders the review cards and never executes: the person enters the relay address with the pairing code, the site joins, sends the task text, receives the cards, returns the decisions while the extension alone executes; the widget of the chat bridge; the offline queue; the kill switch; the immutable cache headers of the static channel; the relay container reuses the envelope grammar of the tool-protocol mode and the native bridge
- the native host bridge: the companion process; the length-prefixed wire behind the consent with the hashed token authenticating every envelope; the localhost relay on the random port; the native surfaces of the dialogs and notifications behind the consent layers; the single connection of the extension; the frozen platform contract across the browsers; the heartbeat reattach
- the transparency page: the active grants with the revoke; the consent session history; the permissions with the consuming surfaces; the stored-data kinds with the purge of the typed confirmation phrase and the masked export; the audit hash-chain verification with the seal hash as the tamper evidence; the allowed senders; the permission diffs; the safe defaults; the vault labels with the value never displayed
- the flow library marketplace: the schema-strict manifests, the publisher signatures with the quarantine, the grant diffs before the import, the pending-import landing, the sync bridge of the file and web providers behind the opt-in, the library gates
- the llm integration: the four protocol shapes of the chat completions, responses, messages and the rival format; the model routing maps the task kinds to the provider and model pairs with the fallback; the budget ceilings halt and ask the user
- the deep research participant: the five-phase orchestrator of the plan, search, read, rank and synthesize with the budget guards, the two-tier cache, the ranker of the keyword and recency, the junk-url filter, the web search and reader over the streamable http of the provider called directly
- the cross-browser packaging: the single root manifest with the overlays of the two rival engines, the api map table, the polyfills, the package of the first rival, the skeleton of the second with its entitlements and delegate, the linter of the first rival
- the release pipeline: the manifest as the sole version source; the trigger matrix of the verification, security, release and maintenance; the publishes to the release, the registries and the container store with the checksum manifest; the smoke of the cli, the plan lint, the overlay preparation with the linter, the native smoke of the wire and token, the container smoke of the ping; the maintenance surface of the versioned-action allowlist — the automated dependency bot removed by design; exactly one hundred planned changes per release
- the library modes: the one source tree into the module formats and the runtime entries of the three runtimes with the exports map of the twenty-two entries, the adapter seam of the storage, clock, logger and fetch; the engines pinned with the package manager pinned
- the evidence corpus: the sixty seven competitor extensions of the store mined through the official update service with the static analysis only — the thousands of mapped features, the api pairs, the permission census — feeding the pool audit of the six hundred twenty six consolidated items cross-referenced against the shipped symbol corpus; the implemented floor of the five hundred ninety fails the release on regression
- the example gallery: the thirty six recipes in the five families of the scraping, forms, testing, monitoring and agents over the four self-contained fixture pages with the expected durations, the consent classes and the five certified topologies
- the configuration: the browser session expires at the quarter hour; the audit retains the hundred events; the fake clock at its epoch; the deterministic fake tab identifiers per browser kind
- the browser research of the market: the operator of the assistant platforms as the fork priority; the copilot extension of the provider with its language registration and its direct fetch bypassing the editor infrastructure

### micro interactions
- the manifest starts with only the storage permission, no broad host, rehydrating by event
- the content bridge is the single injected script; the read-only page bridge
- the exit codes of the terminal: the ok, the refused consent, the failed step, the schema error, the unsupported, the cancelled
- the relay surfaces behind the environment variables: the bind and port of the http, the bind and port of the tool-protocol server, the path of the relay, the idle timeout absent when never
- the pairing flow of the site bridge: the relay url validated before the save, the consent gate before the first socket, the minted code with the expiry countdown, the one-click revoke

### engine status
- the release chain of the hundred twelve versions from the frozen base; the artifact matrix of the distribution — the cli, the headless, the type declarations, the module formats, the neutral build, the runtime entries, the tool-protocol bundle, the native bridge, the site zip, the editor package
- the self-hosted container: the multi-stage build with the validation chain — the pinned toolchain, the manifest check, the module check, the headless smoke, the native smoke, the overlay preparation; the three runtime surfaces of the static site, the socket relay and the listener; the digest-pinned images
- the testing battery: the two thousand four hundred ninety four unit tests across the suites of the timeline, resilience, devtools, profiling, emulation, session memory, workflow, control flow, triggers, the agent protocol, the integrations, the multi-agent, the orchestration, the execution environments, the security, the session interface, the surfaces, the performance parts; the seven hundred torture tests
- missing: the roadmap of the module suite — the pipelines of the stream disk, resume extraction and dedupe rows; the webapi family of the streams and posts; the vision family of the image, region, pdf and frame recognition; the forensics; the minimization; the gateway adapters of the three grammars; the agent fleet

### competitor targets
- the automation extensions and the agent operators of the store — the sixty seven mined manifests as the evidence pool; the agent operators of the assistant platforms as the fork priority

### next steps
- the module suite of the build log to complete
- the drift entries of the capability manifests to zero
- the coverage floor of the pool audit to rise without regression

## maene — the provider lineage bridges

the provider bridges of the family: the plugins that masquerade as the official clients of the free tiers and bridge them into the house protocols. one plugin for the gravity platform, one for the sandbox chat provider, one for the coder provider — the same doctrine: the free tier is a spec, the masquerade is verified, the quota is rotated.

### objective
- the free tiers of the market providers, bridged into the house formats with strong code proof — never a scraped api, always the official flow with our identity

### macro features
- the gravity plugin: the oauth of the pkce flow with the verifier of the hundred twenty eight characters on the random port of the loopback; the masquerade as the official cli of the platform with the full identification spoof; the dual bypass of the two platforms; the robin-hood rotation of the multi-account pool in the round-robin and sticky modes on the quota errors; the soft-quota threshold; the dual quota pools of the two platforms with the background refresh; the thinking-signature cache of the lru ceiling; the auto-recovery backoff; the streaming with the auto-recovery; the image generation with the aspect ratio; the search grounding; the eleven in-memory models of the current catalog; the deterministic session identifiers per workspace of the fnv family; the fingerprint pools randomizing the cli, api and runtime versions with the platform coherence; the endpoint cascade of the production, daily, sandbox and autopush endpoints; zero external dependencies — the node builtins and the global fetch only; the layer dag of the six levels with the single owner files; the add-only configuration; the frozen bypass aggregates; the atomic account store with the restricted permissions; the debug logger with the rotation, retention and the secret redaction; the offset anti-fingerprint of the processes
- the sandbox-chat plugin: the bridge over the headful browser with its own profile on the debug port of the persistent browser; the stealth plugins; the stream interception of the provider frames converted into the open completion format; the local tool execution — the write, edit, multiedit, read, bash, run, list, glob, remove, delete, the todo write and read, the search — with the sandbox-to-local path mapping and the command conversion of the operating systems; the triple resolution of the chat identifiers; the prefix modes of the models; the accumulation of the tool calls; the stores of the chats, sessions and logs; the anonymous-token fallback; the time-bucketed signature of the provider with its hmac; the captcha pipeline in-page through the evaluation of the provider's own scripts with the validated signature; the inline mode with the completions direct from the runtime
- the coder-provider bridge: the nine runtime modes across the cli, web, library, engine and browser dimensions — the plugin mode, the standalone cli, the web ui over the serve command, the node library, the browser library through the direct fetch without the automation framework, the headless server; the dual-mode core — the send through the page and the send direct through the fetch; the login over the raw websocket of the debug protocol with the filtered cookie set; the account lanes with the cooldown and the rate-limit marking; the encrypted-at-rest passwords; the slider-captcha solver; the conversion of the stream chunks into the open format; the models of the two providers with the mode prefixes; the request queue; the persistent browser; the api server of the chat stream, models and status on the one random port recorded in the port file; the native binary; the distribution through the installer and the two package managers; the hybrid session store of the pinned chat with the economical turns — the ceiling of the sessions, the cleanup interval, the ttl, the recovery on restart; the session sync with the ecosystem database; the cookie persistence of the three destinations
- the provider research recorded: the reverse engineering of the provider's captcha machine — the bytecode interpreter of the obfuscation, the custom hash, the encrypted path; the fingerprint pools of the seeded webgl vendors, viewports and concurrencies with the user-agent rotation; the account manager of the coder provider with the cooldown, the marking and the stream slots; the translation of the anthropic grammar into the provider's models through the go proxy; the admin-gated proxy of the coder provider with the session keeper of the human-like interaction, the uploads of the large prompts as files, the conversion of the streams between the grammars, the routing with the proxy redaction and the runtime overrides; the endpoint map of the rival platforms
- the editor extension of the provider: the registration of the language model provider in the editor, the utility model with the autofix, the dual registration of the declarative and programmatic kinds, the secret storage runbook, the four-layer thinking filter, the extractor of the responses over the coding plan endpoint, the model with the always-thinking gate and the reasoning effort setting

### micro interactions
- the provider commands of the cli: the login, logout, accounts, quota, config, models, status, doctor and menu
- the configuration of the ecosystem: the provider catalog with the exact vendor limits, the plugin and configuration split, the environment cookie authentication
- the configuration file of the bridge with the base url and the model

### engine status
- the gravity plugin in its recorded version with the five build waves; the coder bridge in its fifth version with the test harness and the corpus of the captcha machine; the sandbox-chat plugin with the profile stores and the default model of the turbo
- the account pools live: the sixteen accounts of the gravity platform beside the two accounts of the chinese providers with the health and rate-limit tracking; the import from the four external stores one-way

### competitor targets
- the provider proxies of the market with the per-model feature resolution; the official clients of the free tiers as the masquerade targets — always verified against the live flows

### next steps
- the captcha research to stay supervised and ethical — the evidence recorded, the bypass refused by design
- the economical turns of the hybrid session store to extend across the bridges
- the browser-library mode as the default — the direct fetch with the real cookies, the automation framework only for the authentication

## aura — the chat interface of the operating system

the premium chat surface of the family: the reference implementation of the composer grammar, merged from the dozens of deduplicated variants into one canonical interface.

### objective
- one continuous silhouette over the box and the tabs, measured at runtime — the gradient stroke as the identity, the glass as the material, never a hard border

### macro features
- the geometry: the single continuous svg path over the box and the tabs; the resize observer measures the geometry at the runtime; the canonical constants of the box radius, the saddle radius, the tab radius and the box height; the four visual layers — the tab at the base, the extra border, the body fill, the gradient contour with the buttons above; the outer frosted ring only, never the inner border
- the material: the liquid glass fused with the frosted and the gaussian glasses; the claymorphism outside the gradient contour only — the toolbar, the pills, the buttons; the nine fused glass languages of the merged variants; the static-first effects with the single transient pulse on the send at its duration
- the tabs of the composer: the question tab and the agents tab above the border; the tab morphing on the animation frame
- the thinking block in its warning color with the expander and the medium default level
- the pills of the surface: the apps, canvas, thinking, search, deep research, media, audio and workspace; the skills dropdown; the model selector of the max, pro and flash tiers; the dark-first tokens of the clay family
- the prompt card of the four layers with the flower mark as the logo
- the build stack of the reference: the newest framework generation with the motion library, the newest design system, the typed store — and no base url, no model, no key in the code; the visual chat answers only after the registration
- the merged provenance: the thirty four deduplicated variants merged into the canonical interface; the reference artifact of the box and tabs compiled with the svg tab geometry on the dark lane
- the interface renders as the pwa chrome of the platform

### micro interactions
- the pulse on the send; the resting pill that grows on typing
- the tab morph between the question and the agents modes
- the gradient stroke redrawn on the resize

### engine status
- the canonical interface live as the chat surface of the operating system; the reference artifact recorded
- missing: the remaining surfaces of the grammar — the branch tree and the map rides the flagship chat, the aura surface carries the composer and the pills

### competitor targets
- the chat interfaces of the market assistants — the token tables, the trajectory colors and the composer hero grammar of the rivals recorded as the reference dossier

### next steps
- the interface as the single chat surface across the web and the terminal renderings

## the absorbed roster

the surfaces absorbed into the family, kept as the record of the lineage: the predecessor operating system and its cli desktop, the social flow platform, the cloud ide, the gateway, the provider bridge and the capture platform absorbed into the operating system; the universal media player and the creative platform absorbed into the media engine; the email reader and the wallet of the naming chain absorbed into the monetization testbed; the learning variant stands apart with its local rules, no ai and no signup; the remix application and the sketch platform recorded as the parallel experiments of the testbed; the embedded browser surface lives inside the operating system with its own providers and policy; the ansi art surface stands as its own application when not embedded as the single module of the operating system; the universal player of the family lives as the published library of the media engine.

## closing

### canonical references
the ten source documents of the reduction, consolidated here — the doctrine of rules with its eight laws; the design system with tokens, grammar and ban list; the engine catalog with the fifteen official engines; this infrastructure base; the auth and security doctrine; the register of repositories; the companion rule and feature bases of the corpus; the plans of the houses. this file is the infrastructure map of the family: the objectives, the shared systems, the eleven applications with their macro features and micro interactions, the bridges and the interfaces.

### critical inherited items
- p0 credentials: an inventory of live credentials exists in the corpus — provider keys in plaintext, oauth tokens, cookies, recovery codes, certificates with split keys — existence only, zero values; rotate before any publication, always; the recovery key of the cloud archive exists and its value is never reproduced
- p1 design: the passes below the golden bar on every app of the family; the restoration of every app touched by the destructive sweep, by evidence; the database sweep of every data layer
- p2 releases: the asset band with signed attestation restored on every lane; the workflows green sustained across bumps; the owner lane carrying the workflow commits; the analysis of the historical workflow commits, additive
- p3 engines: the fifteen engines functional in the root manifest — the media engine, the audio engine, the virtualization engine, the gateway, the dns, the storage, the monetization surface, plus the root engine, the graph runner, the stream parser, the retry with backoff, the conversation compactor, the tool registry, the calculator and the maestro; the storage engine and the sandbox at full function; the design track multi-device; the tree law across the family

### annex — concrete values by app
concrete operational values; no secrets ever — credential material is existence-only.

- the register of repositories: the canonical monorepo carries the system app, the sandbox, the audio, the media, the game, the dns app and the gateway app as internal platform — eleven apps in the current tree; the absorbed repositories recorded with their lineage; the organization holds the family with the gateway repository private behind its key pool
- engine version ledger, date-first pins: node 26.7.0 and 24.19.0 lts; typescript 7.0.2; docker 29.7.2; qemu 11.1.0; mesa 26.2.1; firecracker 1.16.1; kata 4.1.0; gvisor release-20260817.0; cloud hypervisor 53.0; criu 4.2.1; the compose engine 5.5.0; kernels 7.1.9 stable and 6.18.45 long-term
- engine counts: 15 official engines in the root manifest; the catalog of 60; 100+ with runtimes and ai; the dependency census of the package registrar at 43,636 declarations — the larger count wins by recency; the manifest corpus of the family recorded at the thousands of manifests across the language ecosystems; the engine routing per job — the one-shot script on the fast runtime, the network service on the stable runtime, the transform on the transpilers, the bundle on the bundlers, the foreign binary on the sandbox and the wasm
- gateway lane map: the first lane keyless inside the provider sandbox with the family model set and the two-call thinking; the second lane paused with the explicit fallback, its context aggregate; the third lane the rotating pool of the 22-25 keys with the least-used-first census, its context aggregate, the tens of models, the model swap every 6 messages, the concurrency of the sessions; the fourth lane the free proxy over the two aggregators with the fusion context near 9M tokens; the fifth lane the unified replica with the distilled verdict at 10.5M; the meta-model junction recorded with the six rotation, seven individual and fifty two embedding models; the output ceiling at 524,288; the thinking budgets at the pair of 98k, the effort ceilings of 16375/32750/50000/65536 tokens; the keepalive at 200ms with the suppression ladder to the second; the retries 2-8× over 200ms-64s; the 40 http methods on the route surface
- route surface: seven endpoints — chat completions, completions, embeddings, keys, messages, models, responses — across five versions, 35 routes total; the earlier ladder of the 18-21 passthrough routes; the anonymous lane with the fresh session header; the tier routing free, pro, enterprise with the canary share
- sandbox: profiles light/balanced/max at 2/4/8 vcpus, 0/0.5/1 gpu and 2/8/16 GB with the 100GB disk of the max; the per-plan quota near 50GB; the microvm warm pool at 125ms cold, ~3-5ms restore, 150 VMs per second under 5MiB each; the vcpu quantum at 10ms preemptive; the boot ladder of the engines with the latency catalog — the in-process kernel at 1.9ms, the isolates at 5ms, the rust nano-vm at 12ms, the warm memory at 27ms, the cube at 60ms, the cloud sandboxes under 100ms, the microvm at 125-150ms, the filter engine at 200ms, the containers at 300ms; the engine release matrix of 38 assets — 20 primaries, 9 manifests, 9 checksums — mirrored across the nine-plus registries; the strong copyleft license on the package
- storage: the vault chunk at 1MiB with the standard hash dedupe and compression; the app-layer ingest chunk at 256KB; the tier latencies — hot under 1ms, warm under 10ms, cold under 1s, archive under 1h; blobs over 1MB go directly to cold; the dual compression at the maximum archive level plus brotli; the wire slices at 16-64MB; the memory ladder — ram at 100ns, the compressed ram at 500ns, tmpfs at 1µs, the map at 5µs, the embedded database at 10µs, the object store at 50µs; the free pool of the fleet at the tens of terabytes with the per-account quotas of every forge recorded
- mimetypes golden source: 28,583 lines and 5,584 types in the debian format feeding the runners and the servers; the corpus recorded the working subset at 2,323 lines and ~3,000 types; the golden core of the architecture documents carries the vendor list
- dns: the central domain of the family with the wildcard address record through the registrar at a one-minute ttl covering apex, www, app, mail, projects and the star; the app subdomains of the eleven apps beneath it; the ds record at the parent with its tag and the elliptic curve algorithm; the live fleet of the three zones; the resolver ports of the local stack — the primary at 53, the secondary at 5353, the recursor at 5354, the interface at 8080, the rest at 8081; the encrypted resolver of the sandbox on the alternate port 81 when the classic port is blocked; the propagation channels of the ten; the clone cluster of the thirty copies behind one load balancer
- ports of the house, local: the os on 3000 with the dev server on 5173; the gateway on 3001; the auth service on 3030; the proxy on 81; the retired chat service on 3031; the cli loopback port band 30000-59999 drawn with cryptographic randomness — the cli band of the 0-1M draw with the record file; the game dev port drawn once in 36000-39999 and persisted, the server port else the fixed fallback; the tool-protocol listener of the extension on 7436; the relay on 8080; the sandbox engine image on its random port of the band unless pinned
- the media engine: performance tiers at 60/30/15 frames per second across max/balanced/light; resolutions up to 4k; the max profile addresses 16GB of video memory; the sliced video render in ten-second slices; the big-integer ticks at 254,016,000,000 per second beside the timecode
- the audio engine: the 24 verified modules; the analysis pipeline of 12 stages; the genre matrix of 15 genres with dna; the module test suite at 223 tests green with the ladder of the planning waves above; mastering at the integrated loudness of minus 14 for streaming, true peak below minus 1, the platform variants of minus 16 and minus 9, the twenty-four bit at 48kHz; the offline package under the 50MB budget with the core bundle under 300KB; the catalog of 108 dsp libraries with the 154 unique pinned urls; the compact json of the 82 distinct parameters — 76 header, 66 layer, the 4 correlation parameters; the assembly warehouse of the ~14,000 parts; the reconstruction of the 45 seconds in ~30; the size cut above 99% against the raw samples; the quality targets of the import, features, generation, export and theory
- the game: the master database plus one shard per callsign; the monte carlo validation over time-to-kill with the thousand-run balancer and the p50/p95 benchmark of the minute; the draw, triangle and frame budgets — under 120 draw calls, under 2ms physics, the frame target; the player speeds of the walk 4.57, crouch 2.44, sprint 7.01 and tactical 8.38 meters per second with the gravity of minus 20.6; the asset corpus of the 4,912 items at 937.9MB with the content dedup; the model catalog of the 244 items; the compression ladder of the car model from 2.8MB through 0.62 to 0.48 with the total of 1.2MB at the three levels of detail of 30k/10k/3k; the multiplayer at the 12Hz socket with the interpolation buffer of the hundred milliseconds; the enemy pool of 64 with the trickle of the half second
- the operating system: the local boot verified on the golden path with the desktop, taskbar, start and the pinned apps of the family — zero console errors; the 35 native pages of the 26 folders plus the 9 family views; the 8 master screens with the 45 screens and 3,420 components of the 9 groups; the release with its archive of the hundred files of the ten apps; the readiness snapshots of the 27 gates — the no-go at 24 green, the all-green snapshots; the widget census of the family — 167 widgets across the eleven apps with the per-app counts of the 92, 21, 16, 10, 6, 6, 5, 2, 3, 3, 3
- the cli: the 20-plus operation modes; the flat root of the 218 files with the 14 prefixes; the exports map of the 17 entries; the native binary at ~104MB; the model of the state-space family at ~90MB with the constant state of the ~64KB; the message rendering ceiling of the 50; the timing catalog of the interface; the compact identifiers of the prefixes with the 10-character token
- the extension: the 335 action kinds of the 12 families; the 23 protocol messages of the 10 schemas; the 6 exit codes; the 5 wire errors; the release chain of the 112 versions from the frozen base; the 36 gallery recipes of the 5 families over the 4 fixture pages; the 2,494 unit tests with the 700 torture tests; the pool audit of the 626 items with the floor of the 590; the 67 mined competitor extensions with the 2,416 mapped features and the 251 api pairs; the session expiry of the quarter hour with the audit retention of the 100 events
- releases: the family asset band of 300-400+; the per-app target of 80; the first family release at 2.0.47 with 92 assets; the first fully green publish at 2.0.78 with 172 assets; the extension ladder from the frozen base 1.1.31 through the platform releases; the 13 publication channels; the draft-verify-publish chain with the checksum umbrella
- the assets per release: the disk image and the executables across the two architectures, the linux packages and images, the mobile packages of both stores, the editor extension, the five next-form zips per app — web, personalized, platform-template, restricted, normal, in the usage order — the site zip, the iso exclusive to the os, the containers per architecture, the wasm cores, the checksum umbrella
- competitor recipes, recorded figures: the conversation-sandbox provider with its pod-per-chat and versioned storage; the single websocket with ~1,954 frames per session and the token window of 300s; the full-vm provider with the remote desktop on its port; the builder platforms with the build command ceiling of the thousand characters, the five-minute budget, the output on the object store, the publish routes of the first-match window of 1-32, the container envelope of the one vcpu and the half gigabyte with the timeout and the scale-to-zero; the battle platforms with the ephemeral stream credentials per run; the magic sessions of the reference with its dropdowns and gamification; the agent runs of the deploy platforms with the preview publish; the link harvest of the corpus — the tens of thousands of unique links with the family repositories, the competitor references, the package entries, the forge alternatives and the ai providers
- the app order in every workflow: the os first, the family in canonical order, the sandbox engine always last
- the engine clone mapping of the family — the competitor is a spec, never a vendor: the media engine from the open video editors and the wasm media converters; the audio engine from the wasm audio decoders and the codec research; the sandbox engine from the emulators, the microvm engines, the jails and the wasm runtimes; the gateway from the unified routers; the dns from the authoritative servers, the validators and the naming chains; the storage from the open object stores of the distributed class; the monetization from the payment libraries
- divergence law: any conflict with the tree, the tree wins; this file updates by bump, never by silent edit
