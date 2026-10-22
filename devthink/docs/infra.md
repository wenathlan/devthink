# infra.md — the official infrastructure skill of the devthink family

architecture governance for the whole family: the system, the applications, the features and the processes. it consolidates the official rascunho parts 01 to 07, the session 7 owner voice, the living rule manuals and the neodocs digests into one document written in the architecture skill grammar: short, direct, functional rules in third person, grouped by correlated context, with features and rules as the same thing. the owner statements are the source, session 7 prevails, and the binding order is skill first, tree, rules, voice, logs. nothing is invented; every rule rides the corpus. the document splits in two: the general rules that hold for every application ride first, operation, design, code, storage, sandbox, security and build; the applications walk one by one after, each with the app name as the title and everything of the app grouped and hierarchical below it. a concrete detail of size, count or duration never rides as law in the body: it rides as an example, and when a measure is truly needed it rides in professional units. links, paths and commands live only at the last paragraph, behind a comment, so the body stays clean, and every github link of the corpus lives in the links.md companion file. when this document diverges from the tree, the tree wins and this file updates by bump.

## Governance/When To Use

the governance is rigid and observer toned: every rule below follows it. the specialist applies these rules when the operation touches the deploy, the database, the structure, the design, the release or any application of the family.

| Trigger/Topic/Item/Layer/Aspect/Mode/Folder/File | Purpose/Detail/Rule/Example |
|--------|--------|
| Objective | Mission. devthink is the virtual os of the internet and the superplatform: it absorbs devthinkos, cli desktop, soflowx, akash, extension, gateway and maene, embeds owni, owns the browser named devthink, and competes with the whole market at once with more than one million rival features, all self hosted. "superplatform" |
| Objective | Urgency. one application works fully at a time, devthink first; the urgent items are the chat opening and executing the sandbox, the vault built first because storage is of utmost importance, and versawaze inside cadria as the real blender competitor. "one app at a time" |
| Objective | Online first. something is online before anything else is finished: a plain blank white page in english on the main domain, then the policy page and the terms page. "coming soon first" |
| Objective | Self hosted. authentication stays on the own infrastructure, never supabase as a service; the repository still builds to cloudflare, netlify, vercel and github pages, so no choice closes that path. "never supabase" |
| Operation | Phases. two phases only, analysis first, execution second, never mixed; the fixed order is delete, read, authenticate, analyze, document, execute. "analysis then execution" |
| Operation | Checklist. every action of more than 100 steps starts with a checklist of about 100 items organized in waves; the master operation plans carry around 1000 sequential steps in 12 phases. "100 item checklist" |
| Operation | Waves. work rides waves of hierarchical subagents, 2 or 3 at a time for parallel lanes, up to hundreds per wave at corpus scale; one category per agent, verification after every wave, subagents never commit, the orchestrator commits. "waves of 2 3" |
| Operation | Depth. the wave count walks past 400 with around 300 steps or substeps per wave, hierarchical and linear, never skipping a step. "400 waves 300 steps" |
| Operation | Honesty. radical honesty reports the real state, the pendings and the plan; a number carries the measured label only from real execution with origin and provenance recorded, otherwise it is declared simulated. "measured or simulated" |
| Operation | Verify. verify per stage before advancing, verify real bytes before fixing apparent corruption, analyze failures from most recent to oldest, fetch before and after every wave because the workspace resets. "verify per stage" |
| Date first | Research. step 0 of every checklist consults the current date and researches the best pattern, implementation and dependency versions of that date; the research recurs at every step. "date first" |
| Worklog | Tracking. the shared worklog updates at each task, each agent writes its stage, a closed worklog is the done criterion, and the worklog never rides the repository. "closed worklog done" |

## Reading

the reading is linear, hierarchical and alphabetical: index first, details after, never skipping a line. it rides the bash terminal with sed segments of line ranges; the read tool and the chaos and results tools are forbidden in the corpus walk.

| Trigger/Topic/Item/Layer/Aspect/Mode/Folder/File | Purpose/Detail/Rule/Example |
|--------|--------|
| Segment read | Bash. read via sed from x to y in segments; giant files ride segments of, for example, one to four thousand lines, the rest smaller segments, one file at a time, alphabetical A B C D order inside the folder. "sed segments" |
| Index first | Grep. map the markers before the directed reading: headers, block comments, rule prefixes, then read the windows that matter. "index first" |
| Linear order | Discipline. top to bottom, never jump around; a duplicated rule is extracted once and merged at synthesis, nothing is read twice for content. "linear" |
| Bidirectional | Sweep. dense corpora read bidirectionally on critical passes, top down and bottom up, so no context gap survives. "both directions" |
| Persisted output | Overflow. an output larger than the inline limit lands persisted; the index of its rules extracts by grep and the body reads by window when the detail matters. "persisted log" |
| No source citation | Output. the synthesis never cites document names, lines or origins inside the body; the sources live only in the last paragraph. "links last" |

## Writing and Format

every document of the family obeys the same grammar: lowercase, dot hierarchy, one idea per sentence, grouped and deduplicated.

| Trigger/Topic/Item/Layer/Aspect/Mode/Folder/File | Purpose/Detail/Rule/Example |
|--------|--------|
| Case | Writing. everything lowercase, titles included; only code, file names and versions keep their own case. "all lowercase" |
| Marker | Writing. dot hierarchy only: point, subpoint, subpoint of the subpoint; no hyphen as marker, no numbered bullets, a hyphen becomes a dot in prose. "dot hierarchy" |
| Sentence | Writing. one idea per sentence, objective, progressive, cohesive, third person, impeccable spelling; one theme per paragraph, the subject changes after the punctuation. "one idea per sentence" |
| Dedup | Writing. duplicate words, senses and logics merge into one statement in one place, one concept in one house, no synonym pairs, no contradictions. "merge duplicates" |
| Tables | Writing. markdown tables are born perfect with header, separator and padded cells; library, engine and icon lists live in code boxes, never in tables; sections end with a table, rules above, tree drawings below. "tables born perfect" |
| Clean | Writing. zero emoji anywhere, zero source citation inside the text, no telegraphic fragments, a blank line between paragraphs. "no emoji" |
| Specifics | Writing. a concrete size, count or duration never rides as law in the body: it rides framed as an example, and a needed measure rides in professional units like px, ms and bytes, never dumped raw. "details as examples" |
| References | Writing. links, paths and commands live only at the last paragraph of the document behind a leading comment, and every github link of the corpus lives in the links.md companion file so nothing scatters through the text. "links last" |
| Interface | Writing. interface text is never verbose: short words, one to five words per label, icons in place of text whenever possible, and in the versawaze studio the label of an icon reveals only in the hover and focus animation. "icon first" |
| Voice | Tone. the observer writes in third person, never first person; short, direct, functional rules. "third person" |

## Identity and Naming

naming comes from the real technical root and the brand stays frozen: one name, one house.

| Trigger/Topic/Item/Layer/Aspect/Mode/Folder/File | Purpose/Detail/Rule/Example |
|--------|--------|
| Commits | Identity. commits ride the owner identity iakadion, conventional commits, one action per commit, every wave landing through the signed vehicle so the commit is born github verified. "iakadion signed" |
| Name source | Naming. new names come from the real root of the technical vocabulary, slightly deformed, english base, sonority first, endings never repeat, validated in phrase, domain and brand. "deformed roots" |
| Official only | Naming. only official names exist, never an invented app; subproducts never carry devthink; the brand keeps capital d and t in presentation and lowercase devthink in code and paths. "official names" |
| System names | Naming. the system ai is doo and the owner browser is named devthink; adopted names: devthink, saddle, debonair, stealthhead, argan, versawaze, katexis, cadria, getry, kinetra, vault, forge, foundry, cobaia. "doo and devthink" |
| Reserved | Naming. reserved names never reused: luminage, parallume, raccorda, coinwright, commonroom, mindvault, artifact, codex, buildwell, apertune, meshara, narrara, loreweave, stagecircuit, phenak, thaum, disselve. "reserved list" |
| File names | Naming. lowercase without underscore or hyphen, short unique keywords, composed names use the dot, framework config files keep their own convention. "dot names" |
| Frozen mapping | Naming. the owner pointed names map to flat real names and the mapping never renames, because a rename collides with the 3.0 baseline. "do not rename" |

## Design

the standard is windows 11 mixed with trylle, brave, chrome, codex and apple silicon, elevated to professional saas refinement; a design below the bar is rebuilt from zero, never patched.

| Trigger/Topic/Item/Layer/Aspect/Mode/Folder/File | Purpose/Detail/Rule/Example |
|--------|--------|
| Windows recipe | Chrome. the chrome copies the windows 11 millimetric recipe: an acrylic taskbar with blur and saturate, for example 48 px tall, square pins without names that reveal the name on hover, a floating start menu, for example 640 px wide, a slim titlebar between 28 and 30 px with the close button in the professional red rgb(232,17,35), an inactive window desaturating, windows opening with the windows curve in around a quarter of a second, snap layouts, alt tab and context menus identical to windows. "win11 millimetric" |
| Handles | Chrome. eight resize handles sit outside the window with a minimum window size of, for example, 320 by 320 px, a maximized window carries no radius, and the snap flyout is a small grid, for example 260 by 130 px with three by two slots carrying the aero snap ghost. "8 handles" |
| Trylle ladder | Surfaces. the canvas sits near black, for example #0a0a0b, eight surface steps climb from it with hairlines through color mix, the radius stays modest, the micro motion rides the trylle curve in around 150 ms, and the focus ring stays near white. "trylle 8 steps" |
| Nav | Chrome. the navbar location is configurable in settings exactly like windows moves the taskbar: floating, left, right or top. "movable taskbar" |
| Ban list | Gates. no decorative dots, no white borders, no pill 999px, no transition all, no pure black or white fills, no emoji icons, no text dissolving, no purple blue gradients, no pastel landings, no three identical cards, no visible scrollbars. "the ban list" |
| Color | Tokens. oklch tokens in three tiers, one signal accent per page at the 90/10 ratio, one gradient per page, hue gap above 20 degrees, indigo default purple and default blue banned as defaults. "oklch 3 tiers" |
| Type | Tokens. space grotesk for display, ibm plex mono for data and technical labels, fluid clamp titles, tracking and tabular numbers. "grotesk plex" |
| Motion | Motion. micro motion stays under, for example, 200 ms, entrances run 400 to 800 ms with stagger, only transform and opacity animate, reduced motion always respected, every control carries the 8 states. "transform opacity only" |
| Animated icon | Icon. the gradient moves inside the glyph, each layer stacked by its own index, glyph on top, ring below, background at the bottom, one signature movement per brand, and the app icon is redefined with the design. "gradient inside glyph" |
| Fluent icons | Icon. icons come from @fluentui/react-icons always, never lucide react; font size carries the size, the filled variant rides primary actions, and the map of 108 verified icons governs the substitution. "fluent only" |
| Hybrid mode | Track. one single design track serves everything and the only difference is presentation: the web face appears as a saas landing, tv mobile and binary adapt through responsiveness, dpi and aspect ratio, with no dedicated folder per platform, only the css converting; the hybrid mode in settings shows the same design across web tv and mobile. "css converts" |
| App flow | Flow. the ordinal flow is intro as the presentation that surprises, onboarding once with state in the db, then the internal window; on web public pages such as the explorer stay viewable without an account like youtube. "intro onboarding window" |
| Lock screen | Binary. the web chain enters the desktop directly with no lock screen; the lock with landscape clock and slide up rides the binary and iso intro only. "no web lock" |
| Design method | Reference. the neodevthink doctrine decomposes every reference into macro meso and micro properties and redistributes them section by section, index by index, layer by layer into the own brand, never a literal copy. "decompose redistribute" |
| Windows states | States. controls carry hover focus active disabled loading error empty success, touch targets of at least, for example, 44 px, primary buttons taller, for example 56 px, and the press scale of 0.7 lands in around 100 ms. "8 states 44px" |

### the design masterclass, the universal style library

the universal design library of the family: styles organize by style then theme, the laws limit how many of each element a page carries, and the css furniture catalog holds the signature pieces every app reuses.

| Trigger/Topic/Item/Layer/Aspect/Mode/Folder/File | Purpose/Detail/Rule/Example |
|--------|--------|
| Skill organization | Design. the universal design skill organizes by style then theme, never by image, with universal characteristics merging what repeats across references, every pattern entering a code box separated by micro animations, transitions, effects, colors and layouts, and the batch tracking carrying the provenance marker of every accumulated reference. "style then theme" |
| Premium dna | Design. the premium set dna rides pill first radii, generous card radii, the ninety ten rule of neutrals and one accent, three text levels, bento grids for features, side by side comparisons, soft diffuse shadows never hard, and the motion families of fast micro interactions, slower entrances and long ambient loops, always ease out. "premium dna" |
| Visual tensions | Design. the visual tensions are a first class inventory, for example neutral against accent, rigid against organic, dark against incandescent, order against noise, full against empty, same skeleton different skin and nature against machine, and the composition laws of inline slot, ghost world and break family govern how many of each element a page may carry. "tensions inventory" |
| Masterclass prompts | Design. the generated page treats every section as a master artboard layer with orchestrated depth, professional multi layer shadows, short copy with no corporate filler, the anti literalism of never rendering internal rules as cards, and the amateur cliche purge of decorative dots, dotted grids, bright orbs and pyramid stacks. "artboard layers" |
| Triad law | Design. exactly three fonts of display, structure and ui detail with no book serif, exactly three new global colors plus three per section with the blue purple pair banned, the semantic z index of atmosphere, content, floating and fixed bar, and oklch recommended for the color sheets. "3 fonts 3 colors" |
| Vibe code ban | Design. the vibe code layouts are banned as a list: the centered hero with two buttons and mockup, the equal three column grid, the testimonial carousel, the invented logo strip, the stats bar of users and uptime, the faq bolted to the footer, the four column footer, the same fade on every section, the twelve feature grid, and the random white lines between sections. "ban list v25" |
| Faun format | Design. the faun reset rebuilds from zero as a vertical fullscreen page with no phone frame, fixed sections of topbar, banner, blocks and footer, dense component and animation counts per section balanced with breathing, three to five word labels, one single component pattern with the white border as the only outline, and js tuned curved transitions never a hard cut. "faun reset" |
| Style references | Design. the eight unique style references enter with their own laws and don ts: the royal blue accent of relate, the retro serif of portal with the glow ring elevation, the void ghost chrome of active theory with binary radii, the flat gallery of twomuch with one type and one weight, the obsidian display of vivid, the single weight of three, the positive tracking signature of viture, and the lavender blueprint of visitors, each descending into a complete tailwind theme. "8 references" |
| Theme system | Design. the neo devthink theme system rides five canonical themes of light glass, obsidian night, sunset royal, nordic forest and pitch black amoled, tokens named by metaphor with dark inverting the pair keeping the names, the theme changing glass saturation and shadow depth and not only colors, and the app global tokens of outside, container, card, accent, text, selection, blur and shadow. "5 themes" |
| Css furniture | Design. the css furniture library carries the signature pieces, for example the pill button with the rotating disc, the floating header with the scrolled state, the cutout corners of paper biting the media, the fan of folders, the physical gauge with the glowing arc, the bicolor range, the native dialog with the backdrop, the toast pill, the empty state, the colossal footer wordmark, and the turbulence noise as section grain. "css furniture" |
| Motion catalog | Design. the keyframe catalog of spin, float, wave, dash and pulse families rides three easing families never mixed on the same element, the forty five degree rotation as the universal gesture of action, brightness as the lift of dark cards, the implicit stagger by child position, and the reduced motion media collapsing everything to instant. "motion families" |
| Responsive law | Design. breakpoints ride by content and not by device with the short viewport and the large screen as test cases, the scrollbar gutter stable in dialogs, the overscroll contained in modals, the touch action manipulation on buttons, the color scheme declared with the tokens, tabular numbers and mono for data, the consistent nano text hierarchy, touch targets never below the minimum, and the visible focus replacing the removed outline. "content breakpoints" |
| Design recipes | Design. the recipe catalog extracted by vlm deep dive covers the styles of glass, glitch, iridescence, aurora, skeuomorphism and retro futurism with effect parameters ready, recipes are normative theme data the theme tree consumes by name, and every new reference image enters the catalog with its hash. "recipe nnn" |
| Img catalog | Design. the image catalog is registered by inventory of count, bytes, names and hashes, never read or emitted in rule context, the flat numbered naming addressing every asset, the dedup before any pipeline, and the consumption always by numbered reference with the compressed variants derived instead of new masters. "img inventory" |

## Applications and Identities

each application cares for one thing and distributes it as the published library; logic is never duplicated and each family of features has one single house.

| Trigger/Topic/Item/Layer/Aspect/Mode/Folder/File | Purpose/Detail/Rule/Example |
|--------|--------|
| devthink | Os. the os and superplatform, the final absorber, 35 native pages in the theme, news as a page, own browser named devthink; it creates no video image 3d or audio logic and imports the published libraries; cli equals web equals tv. "final absorber" |
| saddle | Sandbox. the sandbox and vm runner, virtualization only, no browser no gateway no os features; bases max balanced and lite, oses android grapheneos linux omarchy windows, arches arm64 amd64, own vgpu and vcpu; it manages the virtual hardware the domains use. "vm runner only" |
| debonair | Audio. audio and the daw with its own marketing name, housing the katexis engine at the root. "katexis house" |
| cadria | Media. video and image player editor and studio; it absorbs iukka and create and houses the versawaze engine at the root. "versawaze house" |
| stealthhead | Game. the first person shooter importing versawaze and audio via libraries, no own engine file, loading only match ranking weapons and world, shipping pre compiled so visitor hardware never compiles. "pre compiled" |
| argan | Dns. dns and the network library: zones records dnssec handshake, the cloudflare competitor, every site on the same unified db. "network library" |
| getry | Gateway. the deployable gateway and inference with the devthink meta model masking real models, always free tag models, raising copies of itself for concurrency. "meta model" |
| vault | Storage. the supabase and aws bucket competitor: all storage lives in it and only in it, the other apps import the published library, security first with the faun lesson encoded. "storage house" |
| foundry forge | Clones. foundry runs and stores, forge runs only; with getry they materialize the site roles, they come from saddle, are not new apps, have no distribution at all and exist only as sites. "sites only" |
| cobaia | Monetization. the family monetization site with honest ad slots, referral, plans, support and blog; the family sites stay clean. "cobaia" |
| ansi art | Editor. editor gallery and conversion, 21 loose ts logics at the root, soochimp absorbed, rendering any tsx design in a terminal. "ansi art" |
| doo | Ai. the universal system ai; the person creates, trains and connects own ai with mcp api and gateway and builds sites with sandbox and preview. "doo" |
| Pulled apps | Apps. discord trello github gitlab and supabase features become apps tagged with who pulled them, creator ai or community; removed apps never return, their features live absorbed. "pulled apps" |
| Plan gate | Limits. the engines are free and without limit; the payment gate and the user tiers free pro enterprise live inside devthink only and never inside saddle or the engines. "plan inside devthink" |
| Import law | Library. a graph image 3d or video need of devthink imports from cadria and versawaze, audio imports debonair katexis, sandbox imports saddle, storage imports vault; a sibling path import is a defect the audit hunts. "import not duplicate" |

## Project Structure

the tree is flat and root first: no src in the house, folder equals page equals app, the theme is sol and the anchor chain never skips a layer.

| Trigger/Topic/Item/Layer/Aspect/Mode/Folder/File | Purpose/Detail/Rule/Example |
|--------|--------|
| Root | Layout. the repository root holds only app and mode folders plus docs, tests, forjas and loose files, with the envelope package.json at the root. "root first" |
| Flat | Layout. no src, no folder inside folder, no globals by category, no lib hooks or components folders; folder equals page equals app with everything of it inside. "flat" |
| Sol theme | Theme. the theme folder is sol with no default folder; one single css per theme and the only html is index.html at the theme root; app.tsx lives inside the theme beside the css and the html. "sol" |
| Anchor chain | Anchors. app.tsx imports the theme anchor, the theme anchor imports the page subanchors, the subanchors import the components, never skipping a layer; adding a component is adding a line in the subanchor, up to 100 per page. "linear anchors" |
| Page folder | Page. the page folder carries the page tsx subanchor, the loose components and ts helpers, no styles types or test tsx per page; the components of a theme live in sol componentes beside the anchors. "sol componentes" |
| Docs tests | Siblings. every app has its own docs and tests with scripts in tests scripts; it references, never copies; family scripts live in devthink tests scripts and no scripts folder sits at the monorepo root. "docs tests" |
| Manifests | Lockstep. one manifesto per language at the app root, versions in lockstep, one lock only, npm ci never install. "one manifest per language" |
| No asset folders | Assets. no ui assets public dist data or db folders in the tree; compilation stays at the owner root or outside the repo; only icon and favicon exist as assets, every other image lives in the db. "only favicon" |
| Notfound | Build. no 404 html exists; notfound is a tsx component the build resolves at deploy time. "notfound tsx" |
| Same shape | Sync. all apps share the same structure, no file at an app root that does not exist in the others; the only variation is the deploy copies inside the theme folder beside app.tsx. "same structure" |

## Code

the code is typescript first, library born, with every text living in the database and the interface pulling from the root.

| Trigger/Topic/Item/Layer/Aspect/Mode/Folder/File | Purpose/Detail/Rule/Example |
|--------|--------|
| Root logics | Pull. loose ts logics sit at the app root; the interface pulls from the root, the root never pulls from the interface, the interface never pulls from the interface. "root pulls" |
| Grouping | Cohesion. correlated logics group together in hierarchical blocks, one file one responsibility, about 300 logics per file and up to 1000 when the grouping demands. "grouped logics" |
| Typescript | Language. typescript first, runtime native before external package, the app born a multi mode library; zero js in the interface, explicit ts in relative imports, no enum and no namespace. "ts first" |
| No main | Entry. no main exists: app.tsx self mounts with embedded routing inside the theme covering the themes and the 404. "self mount" |
| Copy law | Data. nothing is hardcoded except doo and devthink: every interface text label and information lives in the db, first the tables then the ingestion, components read through typed accessors by id like an api, the seed rides the build, each app carries its own database. "copy law" |
| Config | Data. the code is the engine and the db is the living config; host and port are drawn and locked per session, never localhost, and nothing binds to one runtime. "db is config" |
| Honest data | Data. no fake data anywhere: no demo rows, no invented numbers, no theatrical timers, only honest empty states. "no fake data" |
| English | Language. english in code and jsdoc, trackable try and catch, the most modern patterns of the current date, typescript strict with any and ts ignore forbidden. "strict" |
| Biome | Quality. biome is the standard formatter and linter, conventional commits enforced, every component carries the animation logic and the micro interaction logic. "biome" |
| Graphnodes | Method. the graphnodes pattern rules the methodology: one thing connects to another in stages, hierarchical through graphs and nodes. "graphnodes" |
| Per job | Runtime. a script or one shot sandbox is bun, a network service or production is node lts, transform is swc or babel, bundle is esbuild for dev or webpack for heavy, a foreign binary rides the saddle sandbox or wasm. "per job runtimes" |
| Webpack lane | Convert. the outside library logic converts to the packages through webpack and no useful github workflow is discarded; the webpack lane and the deno lane ride the family. "webpack conversion" |
| Node maestro | Orchestrate. the 15 engines of the manifest orchestrate with node as the maestro and the python lane beside it spawning python 3 inside the sandbox cwd. "node maestro" |
| Mime registry | Data. the mime registry rides centrally managed with the media type on the left and the extensions on the right, the person types in the own file taking precedence over the global registry, and the format catalog of fifteen fixed categories with the modern image extensions and the cdn library registry pinned by url. "mime registry" |

## Engines and Libraries

the engine lives in one app and the others import the published library; the catalog never rides a package json.

| Trigger/Topic/Item/Layer/Aspect/Mode/Folder/File | Purpose/Detail/Rule/Example |
|--------|--------|
| Universal library | Publish. any project imports and configures only baseurl, models and keys; engines carry zero consumer data inside and ship a typed exported api on npm and maven with the spring boot module. "universal library" |
| Engine count | Catalog. more than 100 engines with no limit of engine library framework or package as long as node.js orchestrates behind; duplicates resolve at adoption with one entry per concept. "100 engines" |
| Master catalog | Dependencies. the master catalog carries more than 43 thousand dependencies and no package json carries them all; the manifest carries build essentials while the full catalog rides vfs and cdn at execution, granular install only inside the virtual sandbox. "43k catalog" |
| Pins | Versions. pins are exact, minimum release ages respected, one lock per manifest, and the union rule standardizes the package json of every app: the same dependencies dev dependencies and overrides everywhere, nothing removed, missing packages added. "union rule" |
| Icon family | Icons. one icon family per project including microsoft fluent2 and winui3, served from the central icon repository, with no limit of icon library. "one family per project" |
| Ai catalog | Ai. the ai catalog enters by category without ceiling in code boxes: 30 plus providers through the unified matrix, ag ui, a2a, acp, mcp, a2ui, agent sdks and the local onnx lane. "ai catalog" |
| Vendored reference | Catalog. the three js reference rides vendored and pinned for the offline sandbox with the import map of the modern build, the webgpu renderer with the node material language preferred over raw shaders, the canonical scene base, and the shader module catalog embedded in the reference. "tsl" |

## Data and Storage

all storage pulls from the vault engine and the database is never exposed: the faun lesson is law.

| Trigger/Topic/Item/Layer/Aspect/Mode/Folder/File | Purpose/Detail/Rule/Example |
|--------|--------|
| Stack | Storage. the stack is git lfs, libgit2, git objects and blobs inside the db, prisma declarative schema, drizzle orm, better sqlite3, libsql and mysql2, executed by drizzle with better sqlite3, no sql file in the repo. "drizzle executes" |
| Chunks | Storage. blobs are never in the db: chunks with sha 256, compression, catalog and automatic reuse, the 64 bit bigint pointer that holds terabytes; every upload passes the yml pipeline converting into chunks, packing tar xz level 9 plus brotli and firing the mimetypes api. "sha 256 chunks" |
| Unified db | Data. the db is unified between sites and apps, never committed, master plus shard per account, the same kind of table carrying the same columns and pointers in every app, identity text, counts int 32, time datetime, bytes bigint. "sync contract" |
| One login | Data. one login serves the whole family: an account created in any app is recognized in the main system and in every other app at once, same data same callbacks same identity, the dbs talking over https. "one signup" |
| Faun lesson | Security. the db is not readable or exportable, only registered people reach it, the database is encrypted aes 256 gcm at rest, and the static deploy must never expose a downloadable db: the decoy database serves anonymous probes while the real one stays sealed, the devtools open registers the ip and dns forever and all connected sites go blank for that user, any clone, any vpn. "faun lesson" |
| Hd as db | Drives. each hd represents a db and the person opens as many as wanted in settings like windows, the drive panel connecting google drive dropbox onedrive box and s3 opt in. "hd is db" |
| Replication | Data. sites replicate with write quorum n/2 plus 1, read any of n, idempotent daily reconciliation; the memory tiers ride n1 ram, n2 opfs with sqlite, n3 releases lfs cdn and free s3, crypto shred propagating across tiers. "quorum" |
| Apps in db | Runtime. a binary upload with rootfs installs through the vfs sandbox modalities and the app runs by the saddle engines of virtual memory ram and storage offered between sites. "apps in db" |

## Sandbox and Zero Touch

nothing touches the person hardware: the site becomes a sandbox when the person enters with an id, and the person machine only loads the interface.

| Trigger/Topic/Item/Layer/Aspect/Mode/Folder/File | Purpose/Detail/Rule/Example |
|--------|--------|
| No browser storage | Zero touch. the interface never writes in the browser: no indexeddb, localforage or localstorage; the offline answer rides the memory seed, never browser storage. "no localstorage" |
| No visitor hardware | Zero touch. the interface never uses visitor gpu cpu camera or geolocation and never compiles on anyone machine; everything else rides https domains with mimetypes, the engini virtual doctrine. "engini virtual" |
| Modalities | Saddle. the sandbox concentrates more than twenty modalities toward thirty: complete virtual with driver cpu gpu memory, universal runner, node packages, hardened docker, ghcr containers, microvm per workflow, browser and virtual browser, mobile with capacitor, confidential with attestation, qemu and firecracker, pod, local opt in, wasm and wasi, vfs from prisma git and db. "20 to 30" |
| Cdn lane | Saddle. the cdn of about 45 cdns is fetched inside the sandbox via vfs, never in the person browser, and the person chooses no modality: the platform resolves the join of all as the nuclear modality. "45 cdns inside" |
| Profiles | Hardware. the hardware profiles ride, for example, lite with around two vcpu, no vgpu and two gigabytes of memory, balanced with around four, half a vgpu and eight gigabytes, and max with around eight, one and sixteen; sandbox equals account with the immutable ghcr image versus the uuid instance, the install cd versus the save game. "lite balanced max" |
| Plan quota | Storage. the quota rides the plan through chunks up to the terabyte scale and never a literal fixed size. "quota by plan" |
| Sandbox models | Competitor. the market rides four sandbox models and the platform resolves the join of all: the pod per conversation of zai grok and manus, the local in browser sandbox of bolt aistudio and arena, the full vm with screen of manus vnc and grok headless, and the hybrid of local first with versioned storage outside. "4 models" |
| Session protocol | Chat. one websocket per session carries everything: token streaming, sandbox state, filesystem rpc and heartbeat, opened with a session create that negotiates the protocol capabilities and the client toolsets, the conversation born as an attachment of the ws session with rest only for reading and persistence. "one ws per session" |
| Sandbox handshake | Sandbox. the sandbox rises on the first send with discovery never hand built urls: the up request answers an sse of states checking quota ok initializing ready with the pod id and the explicit quotas of global per minute and per 4 hours in the handshake itself. "checking quota initializing ready" |
| Preview | Sandbox. the preview lives on its own subdomain per session with an ephemeral jwt of a few minutes, for example 300 seconds, carrying the session and port claims, and the dev server state arrives as an event with the detected frameworks before the ready. "preview subdomain" |
| Capabilities event | Sandbox. the image announces its capabilities as an event of node git ffmpeg playwright vercel, and the interface turns features on and off by the real capacity of the container; a generic rpc on the same ws serves the filesystem and the task plan with typed errors before the bind. "capabilities event" |
| Versioned storage | Sandbox. the code survives the sandbox: the codestorage carries the repo id and the commit sha, every write generates a version uuid, and the git repo rides outside the vm. "commit sha versions" |
| Agent hygiene | Chat. the cheap model generates the title and summary on a dedicated endpoint, the agent actions surface as chips of wrote files and ran commands, the response carries the deep link rid, and the agent browser runs headless inside the sandbox never in the visitor browser. "cheap title chips" |
| Credentials | Sandbox. every generated app rides an ephemeral token of its own with the access request of toggled permissions and its own secrets, never the account of the person. "ephemeral token per app" |
| No captcha | Sandbox. no captcha exists anywhere in the flow: the captchas of the competitors are eliminated by the self hosted infra, the flow stays click, message, sandbox progress, agent chips, live preview, download deploy. "zero captcha" |
| Survival kit | Saddle. the sandbox survival kit rides the static unrar binary for the archives, the double fork setsid for background processes that must persist between tool calls, the git source preferred over the compressed one because the transfer link expires, the pinned prisma version because the latest breaks the adapters, and the model list fetched live because the vendor models age out. "survival kit" |

## Accounts, Payment and Chat

one account serves the family and the plans live inside devthink only.

| Trigger/Topic/Item/Layer/Aspect/Mode/Folder/File | Purpose/Detail/Rule/Example |
|--------|--------|
| Signup | Auth. the person signs up with email and password or google github gitlab, the callback detects the origin by state in one page for all providers, and without login a temporary user is created with a random id never deleted. "temp user" |
| Cli parity | Auth. the cli and the web are the same thing: same design, same account, same signup, the sync constant over https in both directions. "cli equals web" |
| Plans | Payment. the plans are free pro enterprise defined inside devthink only; enterprise defines the gigabytes of hd and edge processing, the tags and badges ride the plan at signup, and the store sells pre trained ais plugins themes runners and models with stripe checkout, no card data stored. "free pro enterprise" |
| Trials | Payment. purchases are monthly annual or lifetime, pausable, with cashback and refund and a trial of 2 to 3 days with the card pre registered; the payment ip account and network register to block vpn duplication. "stripe checkout" |
| Monetization | Ethic. the monetization lives in cobaia with real ad slots and the ethical limit absolute: invisible click mirroring, hidden ad iframes and bot traffic are invalid traffic and never enter the tree. "honest ads" |
| Chat grammar | Chat. the chat follows the reference grammar of zcode synara and t3code on the windows chrome absorbing openai manus grok zai features, never a literal copy; the composer carries the stacked well grammar, the draft chips, the reasoning expander owning the violet and the day separators. "chat grammar" |
| 7 plus 1 | Chat. every message is understood by seven independent sub agents with an eighth summarizing; the edited message never interrupts the running work: checkpoint, new session number, parallel clone, the chain never stops, the last edit prevails. "7 plus 1" |
| Born sandbox | Chat. the conversation is born with the sandbox of space id sandbox id session id message id provisioned automatically, sustained by saddle, with the xterm terminal, the headless browser inspector and the monaco editor embedded, the approval modal of diff command and risk before every sensitive action and the kill switch always available. "born with sandbox" |
| Gateway opt in | Chat. the gateway connection is opt in: the natural state is disconnected, the assistant answers only after the person registers a gateway, never automatic, and the conversation compaction rides the gateway itself. "opt in gateway" |

## Build, Release and Git

the build happens on the github computers, the release rides the bump loop, and version walks the ladder.

| Trigger/Topic/Item/Layer/Aspect/Mode/Folder/File | Purpose/Detail/Rule/Example |
|--------|--------|
| Build host | Build. build, test and hash only on the github computers; the agent generates no binary and runs no authoritative battery, keeping light local gates; build test and publish are typescript end to end with js only as emit and bun runs directly. "build on runners" |
| Workflows | Ci. workflows are yml declarative, linear and hierarchical with triggers matrix caches and artifacts, releasing automatically on manifest ignore or changelog change, one workflow per responsibility walking the family app by app with saddle always last. "one per responsibility" |
| Assets | Release. release by bump: tag, per app zips, sha 256 sums, release notes from the changelog, 300 to 400 plus assets with the brave extension in the assets, the iso as the devthink exclusive, five next zips per app existing only as release assets never as folders. "300 plus assets" |
| Compression | Release. official compression is tar xz level 9 plus brotli one over the other applied by yml over the git objects; zip stays only where the platform requires it. "tar xz 9" |
| Registries | Release. every app ships to all registries npm, gh npm, ghcr, nuget, maven and rubygems, publishes idempotent with existence check, engines traveling as npm and maven packages with the spring boot module. "all registries" |
| Ladder | Version. the houses of 200 patch steps run from 2.0.97 to 3.0, one commit one step with the step footer, a tag only cutting when its gate ladder is green with permdiff and apifreeze synced after every bump. "houses of 200" |
| Pin policy | Ci. actions pinned by version tag never sha, images by tag never digest, hashes generated at build and traveling in the assets, no sha or secret hardcoded. "tag pins" |
| Bump loop | Green. main branch protected, prs and branches archived, only main remains; the bump loop fixes at the root, bumps, pushes, monitors and repeats until all green, every bug one bump, immutable tags, 0 0 0 dashboards as the done criterion, collateral red runs deleted. "bump until green" |
| Domains | Deploy. the wildcard domain serves every app as its own subdomain with the os site at the apex, the static playground split from the api subdomain, the own server running caddy with automatic tls and the builds published to its folders, and the dns carrying the mail security of spf, dkim and dmarc with the certificate challenges. "wildcard apps" |
| Multi target | Deploy. the same tree deploys to every target of cloud pages, functions, mobile, desktop and iso with the deploy descriptors inside the app theme folder, builds only on the runners, static only with no functions, and the sp rewrites with the fallback page. "same tree everywhere" |
| Mobile ship | Ship. tsx reaches the phone through the runtime chain of react native, expo and the apple or android toolchains, the bundler never produces the package alone, the ui unified without separating web, android and ios, the orientation never defining the device, and the signing reality honest with the android direct distribution viable and the ios requiring the apple identity, with the manifest pointing the package but never signing it. "mobile chain" |

## Security

secrets never touch the code, the queries never concatenate, and the intruder is registered.

| Trigger/Topic/Item/Layer/Aspect/Mode/Folder/File | Purpose/Detail/Rule/Example |
|--------|--------|
| Secrets | Crypto. secrets never in code, env gitignored, rotation standing, aes 256 gcm for tokens in db, node crypto for randomness, never math random. "secrets in env" |
| Binding | Crypto. every query rides parameter binding, never concatenation, format or f string sql, and server requests only http https with the host validated before sending, localhost loopback private and reserved rejected. "parameter binding" |
| Transport | Crypto. tls 1.3, hsts preload, strict csp, cors only the family domains, no captcha anywhere; passwords argon2id, session jwt with rotating jti, oauth with state and pkce. "tls 1.3" |
| Api hardening | Crypto. no basic auth, jwt with strong secret and algorithm defined at the backend, ttl short, payload small, max retry with jail on login, nosniff, frame deny, csp none on outputs, no fingerprinting headers, no credentials returned, central logging with alerts and no sensitive data logged. "api checklist" |
| Rate limit | Defense. rate limit public and authenticated, sandbox egress with allowlist, backend denylist of sources and databases, the db sqlite log and ts sources never served. "rate limit" |
| Devtools | Defense. the devtools intruders are blocked aggressively: on open the ip and dns register in the db and all connected sites go blank for that user forever, any clone, any vpn. "devtools block" |
| Consent | Defense. the kill switch always available, consent gates of three steps, deny by default, and the ai never participates in authentication. "consent gates" |
| Localhost tls | Crypto. the shared publicly trusted certificate for localhost cannot exist because publishing the certificate publishes the key and the revocation rule forces the revoke, so the family uses its own local certificate authority or the self signed leaf with the install step declared, never the revoked public pack, and the loopback dns is never a security boundary. "no shared localhost cert" |
| Keys | Defense. exposed credentials are cataloged for rotation and never replicated; tokens seen in chat or logs are burned and rotated; user keys ride the db per service type. "burn and rotate" |
| Corpus secrets | Crypto. the corpus secrets stay outside every read, merge and rewrite process as inventory only, never emitted, and the gateway validation is all green or nothing with the keys registered, the masked list served and the real chat answer proven before declaring ready. "secrets out" |

## The Applications in Detail

the per app feature map: objective first, then the operations each app owns, with the features and rules as the same thing.

### devthink, the os

the os owns the surfaces and imports every engine domain through the published packages.

| Trigger/Topic/Item/Layer/Aspect/Mode/Folder/File | Purpose/Detail/Rule/Example |
|--------|--------|
| 35 pages | Pages. onboarding, login, news, audio, video, image, notes, photo editor, video editor, browser, terminal, files, gallery, connectors, automations, deploy, security, docs, data, music, camera, recorder, mail, calendar, calculator, maps, store, console, gateway view, home, notfound, projects, providers, settings, usage, each a folder anchor with its components. "35 pages" |
| Born sandbox | Chat. the conversation provisions space sandbox session and message ids automatically, the vm rides the webcontainer or docker microvm, the per conversation db isolates, and the talk embeds xterm, the headless browser and monaco. "conversation vm" |
| Approval | Safety. the approval modal of diff command and risk levels with allow once allow always deny precedes every sensitive action, the kill switch kills vm processes and cancels api calls with checkpoint restore, automatic execution blocked by default. "approval modal" |
| Master screens | Screens. the eight master screens and the full screen map, for example around forty five screens carrying thousands of components in nine groups, the tour magnetic onboarding with spotlight, the equivalence matrix normalizing competitor concepts. "master screens" |
| Creator studio | Editors. the studio houses the video editor, the audio workstation with mixer effects rack and transport, the 3d studio with scene graph and material editor, the canvas, the code ide, the site builder and the notes, each with own ai chat, own nodes, own encoder and export. "creator studio" |
| Tools and explore | Pages. the tools page carries 60 plus tools from assetgen to upscaler, the explore carries 15 plus categories, the lab is the meta tab with multi select, and the fusion engine merges tabs by drag with selective cloning and universal detach. "fusion engine" |
| Persistence | State. persistence is crash proof with the 3 second idle save, the state json restoring tabs across devices, and the preview being the final video with background export in chunks. "preview is final" |
| Streaming | Media. social streaming carries no video bandwidth because the stream rides actions json reconstructed by the replay engine, the audio social rides webrtc, and the recording of a live generates the mp4. "actions json" |
| Storage hybrid | Storage. the hybrid storage covers more than 50 file hosts plus the own user cloud with cashback, the free plan requires the cloud connection, and the 3 layer storage rides user id, tab category and project name with the trash per project. "50 file hosts" |
| Ai actions | Ai. the ai is the registered super root admin user lookup with the server always on, 60 plus skills in aiactions, the todo list protocol of analyze plan execute verify test deliver, 3 execution modes of live hidden and autonomous, forced context injection and the compaction that resumes with the position saved. "aiactions" |
| Training logs | Ai. every user action logs to the private cloud invisible and inapagable as platform property for training, and the training rides the iamodels tab downloading from kaggle and hugging face with metered storage and processing. "training logs" |
| Multi agent | Ai. the llm is stateless: the backend owns liveness and memory through the db status, the router pattern with the agent dictionary, delegation via structured json, the react answer of thought action and parameters, the agent loop with the 2 second pause, memory in three layers of window files and checkpoints, and agents communicating through shared state never direct calls. "agent loop" |
| Swarm | Ai. several agents work at once each in its own tab with its own role over one shared context: one agent per tab with no ceiling, the leader worker topology with critics and verifiers, tab handoffs mid run, locks and conflict scans keeping parallel edits safe, result merging turning parallel outputs into one report, the progressboard showing every agent, and the consent model never changing because every proposal passes the same human review; the agent count names roles lanes priority freshness leader election quorum lock kinds and merge rules are user choices, nothing hardcoded. "swarm" |
| Plans table | Platform. the platform tiers ride free 3 projects 3 messages 200mb, pro 250 projects 50 messages 1 provider 500mb, essential 700 projects 10 providers 10gb, enterprise 2000 projects 40 providers 100gb, sponsor 50000 projects 300 providers 500gb, creators and ai users unrestricted. "tier table" |
| Node maestro | Orchestration. the maestro commands the 15 engines of the manifest, the graph runner walks every flow, the os registry carries the 42 ids the shell reads, the zoomlock installs before first render, and the python lane spawns python 3 in the sandbox cwd. "15 engines" |

### saddle, the sandbox engine

the aetherforge hypervisor plus the product surface of contracts, storage and compute.

| Trigger/Topic/Item/Layer/Aspect/Mode/Folder/File | Purpose/Detail/Rule/Example |
|--------|--------|
| Hypervisor core | Compute. the mttg scheduler of one million logical threads, vcpu overcommit with the topology constructor, cpu feature flags and hotplug, memory balloon with virtio mem hugepages ksm and zswap. "mttg" |
| Gpu lane | Compute. vfio passthrough with looking glass, nvidia mig slices and vgpu, cuda mps, venus and virgl paravirtual graphics, sriov on arc, so cuda and vulkan answer almost native. "vfio looking glass" |
| Machine lane | Compute. qemu 11 pinned with io uring disks, virtiofs, qcow2 zstd, discard unmap, multi queue net with sriov, vsock control plane, snapshot restore and live migration. "qemu 11" |
| Confidential | Compute. sev snp and intel tdx encrypted memory, tpm 2.0, virtio iommu, nested virtualization with firecracker cloud hypervisor kata and wasm isolates, docker and podman rootless paths. "sev snp tdx" |
| Contracts | Product. the runtime contract with probe of node bun deno, the worker bridge, the memory engine of lru bounded entries over 8 backends with stats, the envelope api versioned, idempotency across six registries. "runtime contract" |
| Storage adapters | Storage. local, chunked, s3 compatible, github contents, webdav, hugging face and kaggle adapters with put get head delete list and checksums, the verified pools with quorum writes and read policies. "8 backends" |
| Storage to ram | Compute. the bridge carries the kernel recipes of swapfile, tmpfs, zram zstd, zswap, overlayfs, mmap, git in ram and loop ram disk; storage bytes and memory bytes are the same bytes with the use flag, and the honest positioning is free compute plus storage as virtual ram, never remote ram addressable by cpu. "storage equals ram bytes" |
| Sandbox api | Runtime. create execute sleep wake convert to ram memory stats with the ws exec channel and cron cleanup; the sdk loader loads packages from cdn in ram with the sqlite cache. "convert to ram" |
| Cdn farm | Delivery. the farm serves chunks of, for example, 200 megabytes as chained npm packages over jsdelivr unpkg and esm sh, the scdn edge delivers over r2 cloudfront bun cdn and deno deploy, and the provider chain oracle github hf gitlab kaggle runs first free runner wins. "cdn farm" |
| Scraping | Tools. robots cache with crawl delay, the crawl frontier with normalization and persistent queue, the proxy pool with health rotation and revive, the manual captcha contract with evidence and hash, no automatic bypass by design. "robots cache" |
| Isolation | Safety. the deny by default isolated execution request decision and handoff contracts, the virtual control plane that validates and denies without executing, the sensitive cache eligibility, the archive extraction limits and the magic byte classification. "deny by default" |
| Receipts | Safety. the runner environment, crawl checkpoint, browser interaction, provenance, evidence policy and release readiness receipts with the 5 evidence levels from absent to verified. "receipts" |
| Distribution | Ship. npm ghcr maven nuget rubygems identity per registry, oci multi arch with smoke per index, capacitor tauri binary self contained and extension mv3 targets, the 911 platform inventory and the 60 repo comparative study. "911 platforms" |
| Saddle onboarding | Product. the saddle onboarding ssot carries the library first posture with the thirty modes, the three layered logic grouping of small files with one context each, the node builtins first, the inline execution, the cross runtime floor, the date aware research, the forge mirrors of gitlab forgejo codeberg woodpecker and gitea reflecting the github workflows, and the reconciliation instead of rewrite with the gap fill passes only adding. "library first" |
| Storage fleet | Storage. the free storage fleet aggregates the third party buckets of the release store, the ai hubs, the npm farm serving renamed chunks as the cdn, the cloud media host and the object stores, aggregated by rclone as one virtual pool over the memory tiers of ram, vram, repo storage and external buckets, with the pointer map of text as path, bytes as chunk and json as manifest. "free fleet" |
| Compute fleet | Compute. the free compute fleet rides the forges actions, the ai hub spaces and notebooks, the always free arm instances and the edge workers as orchestrator, with the provider chain of first free runner wins, the honest cron delay of ci minutes lagging, the runtime pickers of the thin client, and the artifact recycle keeping the quota. "free fleet compute" |
| Repo as computer | Compute. the repo rides as the computer with the repo as disk, the actions as cpu, the pages as bus and shared memory of json, the static site as bios, and the dispatch as the ipc between repositories, with the thin client writing base64 chunks through the worker and polling the result decompressed in the browser. "repo computer" |
| Engine lifecycle | Runtime. the engine converts a serializable job into a temporary working set executed by the selected provider, written to the storage adapter with the event trail of queued, preparing, selected, running, syncing and committed, the failure emitting the retryability code with cleanup in the finally, and the mode resolver answering the profile and capability map without starting anything. "job lifecycle" |
| Anti detection | Tools. the stealth is opt in only with the coherent fingerprint of one per session paired to one proxy, the ja4 tls baseline, the human movement model of ramped speed and lognormal typing, and the captcha cascade of stealth first, behavior second and the solver third, with the evidence stored as hashes never raw credentials and the automated bypass rejected as the legal risk number one. "opt in stealth" |
| Isolation ladder | Safety. the execution ladder picks the isolate for untrusted code by default, the wasm for compiled languages, and the microvm of firecracker or gvisor for the host boundary, with the node vm never a security boundary, the hardened container of no network, no capabilities and read only, and the cgroup telemetry read per sandbox. "risk ladder" |
| Receipts | Safety. every execution, transformation and delivery emits a declarative receipt, storage latency never labeled as ram, receipts starting no timers or reapers, the caller owned surfaces installing nothing and hosting nothing, the declarative storage pool with the read write policies, and the signing states explicit of unsigned, ci test key, caller owned, notarized and store signed, never inferred by the filename. "honesty receipts" |

### cadria and versawaze, the media and 3d studio

the cadria absorbs iukka and create and houses versawaze as the blender competitor.

| Trigger/Topic/Item/Layer/Aspect/Mode/Folder/File | Purpose/Detail/Rule/Example |
|--------|--------|
| Versawaze engine | 3d. the parametric primitives of plane cube sphere cylinder torus torus knot icosphere and the parametric lamp with profile ribs twist and belly; the modifiers of twist belly extrude and subdivision; the normals recomputation; z up millimeters. "parametric core" |
| Visualize | 3d. the visualize library converts images into triangulated meshes with vertex colors and normals over the planar cylindrical and dome topologies, with the procedural seeds of topography circuit voronoi and lithophane. "image to mesh" |
| Exporters | 3d. obj with vertex colors, stl binary, stl ascii, usda with xform mesh and display color, and gltf 2.0 embedded, ready for blender needle and three. "5 exporters" |
| Mcp bridge | Automation. the json rpc 2.0 tool table answers get scene info, add primitive, apply modifier, set transform, set camera, render frame, export stage and the fibonacci pose sampling of the blenderproc lineage with the z depth pass. "mcp stdio" |
| Server raster | Zero touch. the render never touches the visitor gpu: the software raster rides the server side over https and the browser only displays the returned frames. "server raster" |
| Studio face | Design. the professional dark dcc face with the windows 11 fluent chrome, the workspaces of layout modeling visualize baker and mcp, the tool shelf, the outliner, the property panels, the shading modes of wireframe solid baker normals depth, the icon first buttons whose labels reveal only in the hover and focus animation, zero dots. "dcc studio" |
| Folders as pages | Design. the folders ride the page grammar: the asset browser opens folders as pages with the same anchor chain, the breadcrumb and the folder cards. "folders as pages" |
| Iukka create | Media. the absorbed iukka rides the universal media player and the create rides the creative web platform anchors, both fused with zero loss and the featuresupdate hierarchy as the mandatory change log of features. "absorbed" |
| Anchor law | Design. the create platform anchors the structure with the folder as domain and the anchor orchestrator of the same name, the app importing only anchors, the anchors importing components and the components importing nothing directly, the structure document the only source of truth, and no src, no hashed build names, no obfuscated paths, with the lowercase imports verified one by one. "anchor law" |
| Flow law | Design. the platform flow rides intro once, homepage, the google sign in, onboarding once before projects, the plans checkout success chain never skipped, every undefined route on the 404, the environment detection choosing the base per hostname so login never redirects to localhost in production, and the encrypted redirector being the single production entry working on static hosting with no functions. "flow law" |
| Icon sets | Design. the icon system orchestrates the sixteen sets through the icons anchor with the theme folder as a page of its own and the toggle riding the topbar. "16 sets" |
| Storage server | Storage. the own storage server keeps only the metadata of projects, files, trash and configs with the real bytes sent elsewhere, the listing filtering deleted by default, the usage rpc called on any creation with size, and the health endpoint answering per server. "metadata only" |
| Player engine | Media. the framework agnostic player rides the provider layer of the abstract base with the html5, the hls with the native fallback, the dash with the typed error, youtube and vimeo with the post message api and the privacy mode, the url detection choosing the provider, the action queue ordering commands after ready, the stall detector with its states and auto recovery, the media capabilities check of decoding and hdr, and the webgpu compute filters with the workgroup size declared. "provider queue" |

### debonair and katexis, the audio studio

the audio and daw app with the katexis engine at the root.

| Trigger/Topic/Item/Layer/Aspect/Mode/Folder/File | Purpose/Detail/Rule/Example |
|--------|--------|
| Theory core | Audio. the theory harmony melody and rhythm engines over the 15 genre config, the instrument presets with adsr filter and fx routing, the music engine, the seeded rng, the step sequencer ui, the typed manual api. "theory engines" |
| Export and effects | Audio. midi and wav export, the effects chain of reverb delay distortion chorus compressor eq limiter, the audio worklet processors, the song structure with automatic arrangement, undo redo and serializable projects. "effects chain" |
| Ai mode | Audio. text to music with the chain of thought agent, the inspectable generation plan with reasoning and confidence, the mood map, the conversational refine, the hybrid mode where ai generates and the person edits. "ai mode" |
| Neural | Audio. rave ddsp and hifi gan over onnx, the model cache with progressive download, the stem separation with demucs, the voice conversion lane, the spectral module of fft stft mfcc and chroma. "onnx lane" |
| Quality system | Audio. the 13 quality checks with auto fix, the report of score and grade a to f, the mastering automation with lufs targets per platform of spotify minus 14 apple minus 16 beatport minus 9 and true peak minus 1 dbtp, the mixing recipes per genre. "quality gates" |
| Training machine | Audio. the 7 layer machine of input decompose analyze organize patterns train infer over the sqlite and faiss sample library with the tagging, the pattern library, the musical tokenization and the augmentation. "7 layers" |
| Offline package | Ship. the npm package under 50 megabytes with the compressed pattern database, the assembly engine of constraint satisfaction, the fallback chain of four levels so quality never drops, and the benchmarks public. "offline npm" |

### stealthhead, the fps

the arena waves shooter importing versawaze and audio through libraries.

| Trigger/Topic/Item/Layer/Aspect/Mode/Folder/File | Purpose/Detail/Rule/Example |
|--------|--------|
| Validation protocol | Gates. the ten step validation with last validation as the single gate, the monte carlo balancer of ttk with, for example, a thousand runs, the performance benchmark of around one minute with the budgets of draws triangles and the fps p50, the playwright smoke. "10 step gate" |
| Gameplay | Gameplay. the wave arena with the movement of slide tac sprint ads footsteps and spawn shield, the medals, the prone lean death cam, the smart spawn with boss telegraph and cap, the per bone hitboxes, the hitstop and the headshot fix. "arena waves" |
| Weapons | Gameplay. the real weapon table of ak 47 intervention mp5 and m870 with dmg rpm spread recoil ads fov and falloff, the loadouts with 0 to 100 stats, the cs2 fidelity validation against the anatomy docs. "weapon table" |
| Hud | Ui. the crosshair with spring physics and 5 styles, the hitmarker x snap, the hud i18n of en pt es with minimap leaderboard and settings, the viewmodel with the cdn mirrors chain and the per archetype enemies with skinning lod. "hud i18n" |

### argan, the dns

the network library of zones records dnssec and handshake.

| Trigger/Topic/Item/Layer/Aspect/Mode/Folder/File | Purpose/Detail/Rule/Example |
|--------|--------|
| Library model | Dns. dns lives as the open source published library any project consumes by configuration with no fixed address port or credential, configured by env and db only, the zone versioned and published by pipeline never edited by hand in production. "dns as library" |
| Pendurado model | Dns. each person anchors the bought main domain and hangs personalized domains under it resolving worldwide by the standard dns with nothing installed; the panel works as the registrar where the typed label becomes a real subdomain with an immediate public url. "pendurado" |
| Transports | Dns. classic udp 53 with tcp fallback, dot on 853, doh wire and json on https, doq on quic, doh3 for mobile, dnscrypt and odoh as the privacy lanes, mdns and llmnr local, ddns with tsig, rrl against amplification; where port 53 is blocked everything rides doh. "doh first" |
| Cluster | Dns. copies sync by authenticated gossip with hmac and origin filter, one primary as the registry, secondaries pulling by authenticated transfer with notify pushing, and the query always in three steps of stub send validate and answer with ttl cache. "gossip cluster" |
| Single db | Data. zones keys ds and audit live in one unified db with the zone rrset key ds and log schema, the serial crescent and the rollback by previous version. "single db" |
| Sovereignty | Position. sovereignty is opt in by design: the worldwide without installing lives in the pendurado, the alternative lives in the installed, the gateway covers who cannot touch the resolver, and the empty square of resolver plus authority plus domains under one account with real dnssec day one is the moat. "opt in sovereignty" |
| Tld mechanics | Dns. the tld mechanics distinguish root delegation from out of root resolution: a suffix that looks like a tld may ride a private resolver zone, a direct authoritative answer, a split horizon, a wildcard virtual tld or the own resolver of the client, and the decisive test consults the root servers against the specific resolver on the machine where the name works. "tld mechanics" |
| Email stack | Dns. the own email stack splits in the full server of the modern all in one, the transactional api with the logs and webhooks, the newsletter engine, and the dev inbox of the disposable services, with the ip reputation of ptr, spf, dkim and dmarc staying manual, and the search stack riding the self hosted meta searcher with the crawler and the vector store beside it. "email self hosted" |

### getry, the gateway

the deployable inference of 35 routes with the devthink meta model.

| Trigger/Topic/Item/Layer/Aspect/Mode/Folder/File | Purpose/Detail/Rule/Example |
|--------|--------|
| Route matrix | Gateway. seven endpoints across five versions build the route matrix, for example thirty five routes of chat completions completions embeddings keys messages models and responses, each route self contained with the single design pattern per version. "7x5 routes" |
| Versions | Gateway. v1 zai keyless inside the sandbox, v2 babel paused with fallback to v1, v3 nvidia with, for example, a couple dozen rotating keys in lru, v4 opencode and kilo free only, v5 openrouter free only. "5 versions" |
| Meta model | Gateway. the meta model devthink masks the model in every answer, the context rides the session headers with the seven thinking levels from none to max with high default, the key rotates every request and the model every few messages, for example six, round robin. "devthink mask" |
| Streaming | Gateway. the sse rides the exact openai frames of role reasoning content keepalive content finish and one done, the thinking always on in every request, the keepalive landing every, for example, 200 ms, the reasoning before the content. "sse exact" |
| Autofix | Gateway. the correction is centralized and intelligent with no whitelist blacklist or mock: parameter normalization with levenshtein, clamping to max with 1 percent margin, typo to the nearest valid, string to number, boolean coercion. "autofix" |
| Anti 429 | Gateway. retrying, for example, two to eight times with exponential backoff from around 200 ms up to about a minute with jitter, retry after respected, pacing, reactive cooldown, concurrency mutex with waiters queue. "anti 429" |
| Replicas | Deploy. write once in the repo, the release asset carries the versioned zip, a new sandbox loads the zip or extracts into src, and n copies rise by sending the gateway doc into new chats. "replicas" |
| Jury | Inference. the local jury is the first alternative to the paid judge: the fan out of three diverse providers runs in parallel with individual timeouts, the fixed pipeline of selection, normalization, outlier removal, weighted mean, confidence and divergence marks the cascade need, the vote weight rides the inverse of the historical calibration error, and the worm audit persists every individual vote. "jury of 3" |
| Calibration | Inference. the calibration rides the expected calibration error in bins with the temperature scaling optimized by grid search, the snapshots persisting per provider and model, the nightly recalibration job, and the free model catalog synced on schedule. "ece calibration" |
| Porter | Inference. the porter tries to resolve with its rulers before calling any provider targeting most requests at zero cost, the gates ride green above the high threshold, the gray band between and the red below with the hard block ceiling, and the stack rides hono on bun with drizzle and the sqlite driver. "porter rulers" |
| Api contract | Inference. every endpoint authenticates with the hmac header of tenant and signature, the chat contract standardizes the answer of model, content, usage, verdict, confidence, guard score, cache and jury votes, the version resolves from header to query to config, and the control headers of cache bust, adapter bypass and idempotency govern the request. "hmac contract" |
| Gateway db | Inference. the database carries the verdicts, calibration, labels, providers, models, worm audit and rate limit tables with the cache and memory helpers, the rate limit rides the token bucket per provider, tenant and person, and the providers carry only free models. "7 tables" |

### vault, the storage

the supabase and aws bucket competitor with the security first.

| Trigger/Topic/Item/Layer/Aspect/Mode/Folder/File | Purpose/Detail/Rule/Example |
|--------|--------|
| Encryption | Security. object bytes encrypt at rest aes 256 gcm under per project wrapped keys, the master key rides env or is generated and persisted, iv of 12 bytes, never math random. "aes 256 gcm" |
| Chunks | Storage. chunks of one mebibyte with sha 256 dedupe, gzip compression and catalog with automatic reuse, reassembled on read. "mebibyte chunks" |
| Keys | Security. access keys carry the visible prefix and the 32 byte secret stored only as sha 256 hash with the constant time compare and the revoke. "hashed keys" |
| Policies | Security. the policies of action read write list delete admin and prefix with deny overriding allow evaluated per request. "deny wins" |
| Audit | Security. every action writes the audit row of actor action path and ok, the rate limiting rides the token bucket per key and ip, and the audit answers the queries of the console. "audit trail" |
| Decoy | Security. the faun lesson enforced: the decoy database with plausible fake projects and objects serves anonymous probes while the real one stays sealed, the devtools open registers forever and the db never rides the static deploy. "decoy db" |
| Surface | Pages. the console carries the buckets, the object browser with the folders designed as pages, the retention, the keys, the audit and the usage of the plan quota through chunks. "console pages" |

### foundry, forge, cobaia and the absorbed roster

the site roles and the absorbed apps.

| Trigger/Topic/Item/Layer/Aspect/Mode/Folder/File | Purpose/Detail/Rule/Example |
|--------|--------|
| Site roles | Clones. vault stores only, forge runs only, foundry runs and stores, getry infers; all come from saddle, are not new apps, have no distribution and exist only as sites with web and next versions as release zips. "site roles" |
| Extension | Browser. the extension controls the browser with the consent first capability matrix, the least privilege manifest, the action preview, the bounded semantic snapshot and the audit, never hidden browsing credential access or captcha circumvention. "consent first" |
| Cli | Terminal. the cli equals the web with the terminal face and the white tabs sustained by the engines, riding the opencode lineage of providers and the antigravity auth plugin. "cli parity" |
| Auth manager | Cli. the auth manager rides the canonical file of ten providers with the three entry kinds of api key, oauth and multi account, the six storages of memory, browser, own file, opencode, codex and claude with the source selector, the rotation cycling the active account, the imports from the antigravity and qwen stores, the encryption at rest of aes gcm under the derived master key, the cache with the short ttl, the operation modes matrix, the audit showing only the token prefix, and the anomaly detection of session patterns by cosine similarity. "auth manager" |
| Owni akash | Absorbed. the owni rides the os as the gallery with the providers surface, the akash surface becomes the site builder and hosting manager dashboard, the soflowx becomes the social dev surface, the newschimp rides ansi art. "absorbed roster" |
| Akash builder | Absorbed. the akash absorbed rides the site builder with the managed provider of auto generated internal repo and deploy key beside the connection providers of the git and cloud platforms, the config page in the tabs of identity deployment dns and danger, the add site wizard suggesting the structure with ai, and the component library of typed ready pieces of heroes, navbars, features, pricing, ctas, footers and the rest with the gallery editor views and the drag and drop reorder. "site builder" |
| Soflowx | Absorbed. the soflowx absorbed keeps the module posture of sync only syncing, server only serving and play now owning the rooms notes posts and chats, the express socket server with the security stack of fingerprint, devtools disable, sanitize and rate limit, the versioned notes with real time rooms, the multi provider ai layer of the nine providers with per request knobs, and the stack overflow integration for questions and accepted answers. "social dev" |
| Ansi art | Absorbed. the ansi art library rides the terminal graphics of text art with the extensible figlet style font system, the gradients, the bar line and pie charts, the animation engine with the easing family, the image converters and the ink components, shipped as the universal package with the ink and cli exports. "terminal graphics" |
| Gl nathlan | Absorbed. the gl site rides the root orchestrator importing the section modules with the translation cache and the sfx engine, and the nathlan site rides the akia loader preparing the surface with zero layout shift, the central design module applied on boot, the canvas logo, and the audio profile with the documented ceiling map. "absorbed sites" |
| Soochimp | Absorbed. the newschimp absorbed rides the pwa of real time news with the readability extraction, the trilingual translation with the toggle and statuses, the unified cdn library registry loaded on demand, and the service worker precache with the ad domain filter. "news pwa" |
| Bob iakadion | Absorbed. the bob extension stays as the historical evidence of the handshake naming stack in pure js with no extractable spec, the iakadion hub rides the personal profile of the owner with the social badges, the tech arsenal and the windjets cards served from the repo, and the soodeska stays a reserved name with a stub of one line, no feature derivable without invention. "evidence and hub" |
| Mimetypes | Infra. the mimetypes file of more than 28 thousand lines and 5 thousand types feeds saddle and the servers, and the domains become runners and keepers with the communication riding mime types. "mimetypes" |

### the devthink extension, the consent first browser agent

the browser agent of the family: every rule of consent, audit and review applies on every surface, the extension, the cli, the mcp server and the web, because they share the same modules.

| Trigger/Topic/Item/Layer/Aspect/Mode/Folder/File | Purpose/Detail/Rule/Example |
|--------|--------|
| Consent gates | Safety. no sensitive action runs without the three gates of a live session, an approved plan and a granted origin, approval is one distinct human action per step with no batch approval and no timeout resolving a gate, and the sensitive kinds classify in the payment credential delete and publish classes, each demanding fresh consent per origin. "consent first" |
| Consent windows | Safety. every sensitive grant binds to a duration the person chooses and never runs unlimited, an expired window suspends the run mid step and the resume demands a fresh prompt, revokerun interrupts the pending step and every queued one as a terminal event, and unknown origins classify read only with every sensitive class denied until the profile widens. "deny default" |
| Immutable log | Audit. the log is append only with every entry chaining the sha 256 of its predecessor, the session close seals the chain with a final hash, the read verifies the whole chain before serving and refuses a broken link as tamper evidence, and the audit never carries payload, recording only origin, method, duration and error class. "append only" |
| Mcp server | Protocol. the engine serves json rpc over stdio and http with the tool catalog in the browser workflow memory and system namespaces, tools with side effects accept only the step id of an approved step, pairing rides single use codes storing only the token hash, remote transport demands tls with a pinned fingerprint, and rate limits without a silent default answer excess with a structured error and a retry after. "mcp stdio" |
| Gateway adapters | Gateway. four adapters speak the wire formats of openaicompat, anthropic, gemini and the local ollama, the dispatch loop runs the consent and base url gates first with a timeout race per attempt, jittered backoff and retry after honored, no endpoint, model or key leaves the person configuration, keys live in the vault resolving at the last moment, and a built bundle scan proves no key shape or provider url ships. "4 adapters" |
| Multi agent | Swarm. one agent per tab with planner, worker, observer and custom roles, a shared task queue with lanes, priorities and work stealing, a blackboard of goals, facts, findings and scratch carrying the consent class of its origin, the leader election with assignwork, collectresults and scaleworkers under the person bound, critic review and verifier checks with ack and timeout, handoffs preserving the original session grants, exclusive or shared resource locks with conflict scans, and escalations staying human decided. "agent swarm" |
| Run state | Resilience. the state machine tracks the legal transitions of queued, running, paused, awaiting approval, completed, failed, cancelled and rolled back, the offline queue replays in order, the idempotency key derives from plan and step, the checkpoint captures completed steps with a page digest and refuses a resume against a changed page, the heartbeat and zombie check reap dead runs, and the rollback offers typed compensations behind its own gate. "checkpoint resume" |
| Performance | Speed. performance optimizes and never limits, with every limit, delay, window and budget a choice of the person, lazy modules declaring their load reason, the incremental snapshot emitting deltas, the selector cache revalidating every hit, the stream parser tokenizing big pages chunk by chunk, the virtual list recycling rows, and the request coalesce fanning one dispatch out to every waiter. "no hidden cap" |
| Workflows | Automation. the workflow composes reviewed steps into a freezable document with every nested block expanding before the review, control flow of branch, while, parallel and try catch under person bounds, every child step keeping the same consent chain, triggers arming rules that launch reviewed workflows, the editor saving under its own gate, imports quarantined until review, and the export refusing any step that names a secret. "reviewed composition" |
| Network | Net. every outbound fetch is a reviewed https url without embedded credentials inside the granted origins, the header allowlist is the exact set transmitted with credential bearing headers naming their consent, sse persists the last event id and resumes, mutation rest and graphql grade sensitive, websocket accepts only wss inside the grants, and the rate limit respect sleeps until the published reset window. "reviewed fetch" |
| Capture and forensics | Vision. capture kinds carry reviewed options with redaction masking the sensitive regions before every shot, screen and audio record are sensitive consuming an approved prompt per start, ocr is read only over a paused frame, the vision shot grades sensitive carrying provenance and never image bytes, beforeafter captures surround every interactive step, and the console timeline masks secret shaped text before storing. "redact first" |
| Data minimization | Privacy. identity fields strip unless the reviewed plan lists them, local rule fields of an origin never leave the device, telemetry is off by construction with the enabled literal fixed false, sync is opt in per data class with aes gcm payloads, a cookie jar per run stays sealed, and the purge of full scope demands a typed confirmation while the audit hashes survive. "minimize" |
| Sandbox and emulation | Isolation. evaluate runs in an isolated world with untrusted markup routed through the sandbox frame that strips scripts and stamps a nonce per render, run state persists with a sha 256 integrity seal, emulation stacks layers only while the plan lists them and reverts in inverse order, geolocation override consents per origin, and the debugger permission stays out of the manifest with every debug session page injected. "sandbox frame" |
| Forms | Forms. every form submit demands an ask submit review step before it, every password fill carries its own consent kind with password entries refusing outright in profiles, generated values refusing card shaped or personal identifier shapes, honeypot fields flagged and skipped, the captcha hands control back to the person, and the submission ticket stores the values hash, never the values. "human in the loop" |
| Cli and multi runtime | Ship. the cli reuses the same policy, protocol, memory and progress modules so the consent gates hold on every surface, exit codes are a contract, the headless mode runs the read only vocabulary, the library builds esm, cjs and umd with an adapter seam injecting the platform, bundle size budgets fail the build, and the exports map preserves tree shaking. "same gates everywhere" |
| Packaging | Ship. one root manifest with the firefox, safari and vsix overlays as keys makes version drift structurally impossible, the same design renders on web, extension, android and tv from one web index, version sync stamps the same number on every manifest, publication rides the channels gated at assemble with the release approval environment, the sbom and attestation cover every artifact, and the rollback freezes the previous artifact set by the immutable tag. "one root manifest" |
| Verification gates | Gates. the readiness review of, for example, twenty four gates goes green before release covering the pool audit, api freeze, deprecation window, migrateplan fixtures, pentest zero fail, csp strict, permdiff clean, agentcert, costcert, doccheck and telemetry free, the wcag sweep audits every surface naming the success criterion, and the soak run proves the hash chain seals the same audit hash in two complete runs. "readiness gates" |
| Design atlases | Design. the twelve composition atlases of the neo devthink decompose every reference in the four layers of macro, meso, micro and distribution, preserving the characteristics and redistributing the functions, invented metrics are forbidden with statistics riding real local state, one product scene per screen, ornament always attached to function, and calculated data coming from real computation, never invented client numbers. "decompose redistribute" |
| Trust boundary | Safety. three message layers separate the trust boundaries of the user surface, the extension broker and the page bridge, the content script messages are untrusted input validated on every envelope, the remote endpoint submits typed plan proposals and is never a command authority, and the service worker is event driven and never an always on compute home. "three layers" |
| Kind vocabulary | Protocol. the immutable action vocabulary closes in the hundreds of documented kinds, each with family, consent class, capability, target grammar and schema anchor, growing only with the doc check proving the doc count equals the catalog count, and the target resolution rides the seven modes of selector, text, aria, name, xpath, index and point with zero matches reported and two or more refused as ambiguous. "335 kinds" |
| Memory model | Memory. site notes, scratchpad, run summaries, semantic recall, correction memory and consent memory live in versioned storage keys with provenance on every entry, sensitive note bodies sealed byte by position, the consent memory advisory with a denial weighing like a grant, retention never hardcoded, and the recall seam documented for a future remote backend. "sealed notes" |
| Surfaces | Chat. five surfaces ride the uniform routing of popup, sidepanel, dashboard page, options page and onboarding, every surface action traveling as a command on the bus with its gates, the live updates via one broadcast channel where the background posts a frame per audited event and no surface keeps own state, and the locale bundles with light dark tokens served from user data. "five surfaces" |
| Release cadence | Ship. the release rides one at a time fully validated before the next with exactly one hundred planned changes per release grouped by correlated context, the package json as the only version source, the trigger matrix of verify and security on every pr, the maintenance schedule opening only non breaking prs, and the grounding rule tracing every change to the feature pool while consent first is never removed. "100 changes" |
| Crx evidence | Gates. the harvested extension packages are untrusted data analyzed as static text only with every raw artifact deleted after analysis and only derived records kept, a manifest is technical evidence of declared scope and never an authorization of reuse, and the feature pool feeds the roadmap with grounding never copy. "evidence only" |

### the aura chat, the family chat interface

the chat face of the family: one unified glass box with browser tabs, one continuous silhouette, and the merge discipline that fuses every variant without losing its secrets.

| Trigger/Topic/Item/Layer/Aspect/Mode/Folder/File | Purpose/Detail/Rule/Example |
|--------|--------|
| Tab box | Chat. the premium input rides a rounded box with the two canonical tabs of ask a question and agents anchored above the top edge as browser tabs with flat bases, the active tab merging visually into the box, the first tab sizing to content, and the placeholder changing with the active tab. "browser tabs" |
| Unified silhouette | Chat. one single continuous svg path covers the box and the tabs with a gradient stroke, measured at runtime from the real container with the resize observer, redrawn on tab change and on window resize, with the saddle curves clamped so they never overlap on small screens and the geometry living in a named constants module. "one path" |
| Silhouette layers | Chat. the silhouette composes the layered stack of the extra outer border, the body fill, the inactive tab fills, the gradient contour and the content, the path morphing animated on its own transition, and the tween riding request animation frames with the ease out quart and the refs holding values between ticks. "layered glass" |
| Glass and clay | Chat. the surface merges liquid glass, frosted glass, gaussian glass and the gradient effect while claymorphism stays the only effect outside the gradient contour, the clay living in its own filter of drop and inner shadows, and the extra border being the single outer frosted ring behind everything, never bilateral and never in front of the gradient. "glass clay mix" |
| Two contours | Chat. only two contours exist, the unified gradient one and the outer frosted border, both outer only, with no inner white outline, no grey three dimensional rings, no spotlight bands, and the box limit equal to the contour limit. "two contours only" |
| Theme tokens | Chat. every color rides named custom properties per theme with the light and dark palettes of the same box, the chat tokens of page, card, fill, text, border, glow and shadow, the clay tokens, brand labels with tight tracking, scrollbars hidden everywhere and focus outlines suppressed as the owner requirement. "theme tokens" |
| Messages | Chat. the feed rides the message contract of id, text and sender with optional file attachments of pdf, image, code and generic kinds, user bubbles right aligned, ai bubbles glassy left aligned, the generation pill pulsing while the assistant works, and the entry animating in with the pop layout mode. "message contract" |
| Response panel | Chat. the response panel walks the three states of thinking, response and empty with the thinking carrying the pulsing logo glow and the staggered dots, the response card quoting the prompt in italic with the completed check, and the empty carrying the dashed hint with the send instruction. "three states" |
| Motion | Motion. the global ease is one curve shared by the whole interface, the tab squish runs in fast and out slower with chained tweens, hover and tap scale small and fast, the thinking glow pulses slowly, the aurora blobs float on long alternating loops behind the page, and opacity and transform transitions win over heavy per frame filters. "one ease" |
| Pwa chrome | Ship. the pwa chrome rides two halves, the vite plugin for dev and preview and the server middleware for deployed apps over one shared esm module: the manifest generated per host, the install tutorial page, the head tags injected idempotently, the open graph identity baked from the public files, and the streaming injector buffering only until the head close marker so the early flush survives. "pwa chrome" |
| Pwa tests | Gates. the pwa tests prove the injection before the head close, the project id metas, the idempotency of a second application, the baked identity, and the banner dimensions, riding node test with strict assertions. "tested injection" |
| Player | Media. the family player absorbs the patterns of the seven market players with the plugin system of core, ui and container plugins, the provider layer of html5, youtube, vimeo, hls, dash and embed, the webgpu filters, the webaudio equalizer with loudness targets, the websocket sync, the gestures, the chapters from webvtt, the ambient mode and the stats overlay, all under the accessibility of roles, labels and live regions with the i18n overrides. "player law" |
| Dedup and merge | Process. the variant fusion dedups by identical bytes or sha 256 with the subagents separating true duplicates from divergent versions, and the merge formula preserves always the secrets of the tabs, the curves and the contour, with the checklist timeline driving each refinement as a verifiable task. "merge formula" |

### the opencode lineage, the config engine of the cli

the declarative config lineage of the devthink cli: every version a named patch, every limit declared, every id exact, the own provider immutable.

| Trigger/Topic/Item/Layer/Aspect/Mode/Folder/File | Purpose/Detail/Rule/Example |
|--------|--------|
| Config shape | Cli. the agent config is one declarative json with the schema, the autoupdate off permanently, the plugin list and the provider map, each provider a thin wrapper over the openai compatible sdk declaring name, base url, key and the model map with explicit context and output limits, modalities, options and variants, and vision declared per model only where the vendor confirms. "declarative config" |
| Sampling law | Cli. the sampling quartet rides temperature of one, top p just under one, top k around forty and the reasoning object with the effort at max and the reasoning content visible, and the thinking enabling parameter enters only the families that support it, pruned and expanded again after verification. "effort max" |
| Variants ladder | Cli. the variant ladder of low, medium, high, xhigh and max selects the output budget per request with the none variant as the first class no thinking mode, and the ladder adapts per provider inside the global pattern. "variant ladder" |
| Own provider | Cli. the own devthink provider is immutable across the whole lineage: the sandbox base url, the aggregated context of the gateway and no static key because the environment cookie authenticates, and the aggregated context declares the total the gateway delivers, never one vendor. "own provider" |
| Pooling | Cli. free quota scales by multiplying identities: the same model rides as numbered provider replicas each with its own key, canary replicas on alternate domains take over when the main domain falls, and the sticky account selection keeps one account while its quota is sane instead of round robin wasting windows. "quota by identities" |
| Versioning | Cli. the lineage versions by named patch, one atomic patch per version with the file name as the changelog, the maturity stages of definitive, corrected and validated before the final name, the canonical structural diff proving versions, and the duplicates of download deduped by hash before any read. "patch lineage" |
| Patch types | Cli. every api symptom maps to one patch type: a transport error gets a new transport, a permission error gets the project bypass, a catalog error gets the id fix, a new model enters minimal and gains limits in the next version, and limits always ride full token values, never abbreviations. "symptom to patch" |
| Exactness | Cli. the config copies the vendor exactly: the real context the endpoint honors and never the marketing one, the official path capitalization, the exact token limits even when a digit differs by vendor convention, the official id of each provider, and the output never exceeding the context as the verifiable invariant. "copy exact" |
| Auth plugin | Cli. the antigravity auth plugin rides the oauth pkce on a random locked loopback port, the accounts store versioned with atomic writes and stale lock detection, the robin hood rotation filtering disabled and exhausted accounts with the soft quota warning, the per family rate limit reset times, the dual project bypass, the long running operation onboarding, and the dynamic version chain from remote to scrape to fallback. "auth plugin" |
| Plugin law | Cli. plugin and config solve different problems and coexist: the plugin owns transport and auth, the config owns catalog and limits, auth never enters the config, and a provider without auth uses the environment cookie where the environment already authenticates. "plugin not sdk" |
| Gateway conventions | Cli. the gateway inherits the market conventions: prefix routing per backend, the explicit model matrix of fallbacks, the periodic project id refresh against the ban, the hash and ttl cache of metadata, the three level fallback chain of every external dependency, and the free suffix and vendor prefix id conventions for interoperability. "gateway conventions" |
| Acervo | Cli. the config with inline keys is a secret never committed, the lineage archive stays integral because the history of decisions is part of the product, the two schemas of the two engines live compatibly by a one line swap, and the config stays one hundred percent provider catalog with agents and mcp living in the app. "config is secret" |

### the sandbox runtime, vfs and captures

the runtime of the preview sandbox, the virtual file system builder, the capture pipelines and the hypervisor config of the family.

| Trigger/Topic/Item/Layer/Aspect/Mode/Folder/File | Purpose/Detail/Rule/Example |
|--------|--------|
| Flashlite shell | Sandbox. the preview shell loads over an opaque origin iframe with scripts and forms allowed and same origin never granted, updates arriving by post message with the parent accepting only frames from its own content window, the handshake retaining pending content until ready, and the runtime exposing navigate and action with the captured form state attached. "opaque origin" |
| Vfs builder | Sandbox. the virtual file system builder builds the project with folder equals page, the explicit file markers extracted, the component extraction walking the comment markers, then the data attributes, then the ids, the slugified page folders, the virtual package json generated per framework, and the sealed project carrying the resolved entry file. "vfs builder" |
| Hypervisor config | Sandbox. the hypervisor principle states every numeric ceiling is a software object to edit and not to buy, the machine config declares accelerator, overcommit of cpu and memory, the gpu modes of vfio, vgpu, mig and virtio as fields of the same config, the scheduler of virtual threads with work stealing and fairness, and the canonical device paths. "every ceiling is software" |
| Autopilot | Ops. the daemonized work survives through the double fork with the grandchild adopted by init, the supervisor resurrecting the pilot on its loop, the state machine of wait auth, install, push, cascade and post green with the block state on real failure, the green requiring consecutive confirmations, the flaky reruns bounded before the block, and the registry cleanup deleting only the unambiguous stale versions. "daemonize and autopilot" |
| Signaling relay | Net. the webrtc relay carries only the rendezvous of roster and description with the data flowing peer to peer, the poll being the whole peer lifecycle with the first poll joining, the random peer ids per mount, the validation of room and payload with the abuse cap, the ttl of peers and signals, and the garbage collection walking beside the polls instead of a cron. "rendezvous only" |
| Render review | Vision. the visual acceptance rides the screenshot as ground truth with the comparison sheet aligning evidence but never scoring, the scorecard of five layers with a failed essential layer forcing the refine even with a high mean, the decision matrix of refine spec, refine code, request input and continue, and the deterministic viewer with controls disabled before capture. "vision gates" |
| Capture platform | Vision. the capture platform records the human or agent movement inside the browser as typed session events with the virtual cursor following the real motion, the bezier human cursor dispatching through the debugger protocol, the deterministic replay by seed, and the compacted export into the session log. "movement logs" |
| Pcm research | Sandbox. the virtual chip research virtualizes the memristor processor over wasm and webgpu with the drift becoming computation, the layered integration of bootloader, hal, wasm core, device model and compact model with the real hardware never touched, the conductance weights content addressed on the cdn with the merkle manifest, and the virtual benchmark landing near the physical one. "virtual chip" |

## The Competitor Feature Map

the features the market already proves, mapped screen by screen and wire by wire from the captured sessions; every competitor feature enters the app that owns the domain, self hosted with no captcha and no usage billing of a third party.

| Competitor | Platform | Features the family adopts |
|--------|--------|
| trylle | Agent | the magic session of chat plus sandbox with the chosen repo, os, region, model and effort, the unified inbox of prs issues and reviews, the onboarding accordion with the own cli key and auth, the import from github with 2 way sync, the level and balance card always visible in the sidebar, the command palette of ctrl k. "magic sessions" |
| zai | Agent | the workspace up orchestrator with the sse of states and the quotas in the handshake, the pod bound to the chat id, the preview on the chat subdomain, the versioned storage of one uuid per write, the openai style message tree with parent and children ids, the custom sse with phases, the scene config of recommended prompts per scene, the feature quota summary of limit used remaining per feature. "workspaces up" |
| grok build | Agent | the single ws message gateway with the capability negotiation, the named channels separating the answer from the thinking, the response persisted with the rid deep link, the rpc filesystem on the same ws with the typed error before the bind, the cheap polling of preview status before the server running event, the connector consent box of what it does private credentials read only scope third party disclaimer, the imagine presets, the automations catalog, the scheduled tasks, the private mode. "mgw ws" |
| manus | Agent | the socket io with jwt handshake and the typed events of tool used live status plan update sandbox update computer activity agent error, the regional vm with the web port and the vnc port plus otp, the preview as the plain http server on the configured port, the publish engine of clean checkpoint build with reserved paths and audited cache headers, the two cron flavors of heartbeat http and agent session, the platform capabilities of managed db oauth stripe storage llm invoke and notify, the e2b like sandbox with the runtime daemon, the env in two layers of platform and session, the skill marketplace with version hashes. "socket io vnc" |
| bolt | Agent | the fork of starter with the template classifier answering the starter id and files, the codestorage with the commit sha, the collaboration ws of presence stream start chat changed queue updated, the local webcontainer first with the pod as the heavy option, the title and summary by the cheap model, the action counter with good bad per message, the explicit token quota of per day and per month. "template classifier" |
| arena | Agent | the battle of option a versus option b with the vote, the generation as an evaluation with the stream credentials and the dedicated realtime proxy per run, the rive status animations, the stop generation always visible. "battle a b" |
| designarena | Agent | the chat id generated on the client with turn loop, the turns as typed entities with input refs and polling, the categories by artifact type, the own drive of the user inside the app, the title by dedicated endpoint, the leaderboards per category. "client chat id" |
| aistudio | Agent | the applet of id prompt auto title and secrets with the ephemeral token per app, the prompt autocomplete in the builder, the preview client side with cdn esm deps as the free layer, the recent applets with usage counters, the gradient border composer with the connectable data chips. "applet token" |
| chatgpt | Agent | the scheduled tasks, the projects as conversation folders, the plugin store with oauth install, the codex agent inside the chat, the library of outputs with suggested favorites and folders, the think toggle changing the greeting. "scheduled tasks" |
| netlify | Deploy | the agent runs as first class activity with the filter, the composer of the agent inside the project, the publish in preview never touching live, the wizard of creation with rewarded credits and starters, the drag and drop deploy, the oauth apps personal tokens and authorized applications triad. "agent runs" |
| vercel | Deploy | the team spine of projects deployments logs analytics firewall cdn domains storage flags agent sandboxes ai gateway workflows, the sandbox of drives and snapshots with the pre installed agents and the own sign in, the copy prompt for agent pattern on every setup screen, the sub sidebar with the back arrow, the usage radio rows. "copy prompt for agent" |
| cloudflare | Deploy | the agent readiness with the diagnostics gauge and the share of voice, the ai crawl control with the per crawler grid and the markdown for agents, the ask ai as an api token with per account scopes, the global search with the slash shortcuts, the quick actions column, the pay per crawl. "agent readiness" |
| gmi | Gateway | the model hub with hot badges, the playground with the llm multimodal workflow tabs and the neon sliders, the test routing of task chips then the cost balanced quality slider then the why this model ranking, the agent marketplace with verified only and registration, the onboarding survey with credit reward, the usage by model with time windows. "test routing" |
| akash | Own. | the own cms readapts: the modal that expands fullscreen on focus, the floating dock, the component library with preview, the ai in the editor, the trash of 30 days, the dns manager, the dual desktop mobile; the fake login becomes the devthink auth, the localstorage becomes the own db, the gemini only becomes the multi provider matrix. "akash readapt" |

| Design mix | Source | The grammar adopted |
|--------|--------|
| The blend | Ruler. brave chrome codex astra vivaldi windows 10 11 with the big store banners, apple silicon, awwwards saas and trylle cuteness: floating pill navs, window modals for settings, big hero banners on home, mixed sans serif italic headlines with deep gradients, mono for technical data, colored state labels, drag and drop cards, plan and balance always visible, micro trust lines under cta. "the blend" |
| Component law | Ruler. page equals folder equals sub app: the anchor imports the subanchors, each subanchor references its loose components, the settings click opens the settings page as a floating window never inline, and the official components of each page ride the official catalog. "anchor subanchor folder" |

## Processes

the ladder, the master plan and the walking of any new corpus.

| Trigger/Topic/Item/Layer/Aspect/Mode/Folder/File | Purpose/Detail/Rule/Example |
|--------|--------|
| Houses | Ladder. the houses of 200 steps run 2.0.97 to 2.0.200 opening 2.1.0, and so on to 3.0, around two thousand steps in total; one commit one step, no house opens with the previous red. "house ladder" |
| Milestones | Ladder. the eradication wave kills the old design, the standardization wave installs one grammar, the library wave moves shared logics into the published packages, the functional wave makes every app answer its real function, the depth waves walk graphs and nodes per app, and 3.0 stamps the platform certified. "5 milestone waves" |
| Master plan | Phases. the around 1000 step plan walks 12 phases: foundation inventory, shell of taskbar windows alt tab menus, entry flow of gate intro onboarding home, the 35 native pages eight steps each, the 15 engines six steps each, the eradication patterns one per app, the ten gates wired green, the release, the two presentations, the docs, the node maestro with the python lane, and the final qa. "12 phases" |
| Corpus walk | Reading. any new corpus source rides the linear alphabetical sed walk with the index first, and the digests append into regras and features with numbered ranges and origin cited, chasing more than 10000 rules. "append digests" |
| Skills | Design. the skills carry the design system, the canvas and viewport exports, typography color spacing radius shadows motion components responsiveness and the ban lists, kept simple objective and direct because the house prefers the intelligent syntax over the complex system. "simple skills" |
| Wave close | Discipline. every wave closes with the fetch, the verification, the commit through the signed vehicle and the worklog entry, and the typecheck and test battery answers green before any push; one wave one grouping one commit, the rung climbs every wave, and no wave opens on a red pipeline. "green before push" |
| Campaign ledger | Ladder. the climb from the current rung to 3.0 rides three phases with acceptance per rung: the chat flagship climbing to the competitor bar from stop regenerate and the action row through the branch tree, search, export, attachments, voice, memory, web search and the sandbox bridge; truth in every family surface with no fake data no silent seeds and the dead layers wired or deleted; and the os grade with the a11y sweep, the responsive sweep, the performance pass, the light theme completion and the regression hardening closing at the 3.0.0 stamp. "chat truth os grade" |

## Checklist

before any delivery the specialist verifies the ten points of the house.

| Trigger/Topic/Item/Layer/Aspect/Mode/Folder/File | Purpose/Detail/Rule/Example |
|--------|--------|
| 1 | Deploy. the stack rides prisma drizzle mysql2 socket js with no netlify or vercel functions. "no functions" |
| 2 | Infra. never localhost, host and port drawn then locked, 100 percent user choice, any provider swappable. "open infra" |
| 3 | Structure. root first, no src, flat, sol theme, anchors linear, sol componentes beside the anchors. "flat tree" |
| 4 | Logic. grouped by correlated context, 300 to 1000 logics per file, one responsibility per file. "grouped" |
| 5 | Library. born a multi mode library with internal memory, never bound to one runtime. "multi mode" |
| 6 | Dependencies. the union package json, pins exact, one lock, catalog outside the manifest. "union" |
| 7 | Copy law. every text in the db with tables first then ingestion and typed accessors, no fake data. "copy law" |
| 8 | Design. windows 11 trylle gates, ban list clean, fluent icons, 8 states, 44px, hybrid mode by css. "design gates" |
| 9 | Security. parameter binding, host validation, secrets in env, aes gcm, rate limit, devtools block. "security gates" |
| 10 | Verification. typecheck and tests green before push, worklog closed, radical honesty on the report. "green" |

## Current Standing

the consolidation and the pending waves of this operation.

| Trigger/Topic/Item/Layer/Aspect/Mode/Folder/File | Purpose/Detail/Rule/Example |
|--------|--------|
| Consolidation | Standing. this document rides infra md as the single official file, fed by the institutional docs and the corpus digests, with the app by app map closed for devthink, saddle, cadria versawaze, debonair katexis, stealthhead, argan, getry, vault, foundry, forge, cobaia, doo, the extension, the cli, the owni and the absorbed roster. "infra md" |
| Pending waves | Standing. the queue carries the vault security core of chunks crypto keys decoy and api, the vault sol face with the copy law and the folders as pages, the versawaze engine core with the server raster exporters and the mcp bridge, the versawaze studio face, the tests and docs battery of both apps, and the copy law batelada walking app by app into the tables. "pending waves" |
| Links file | Standing. every github link of the corpus rides extracted, deduplicated and grouped by repository in the links.md companion file beside this document, with the pinned revisions of the owner archive first, so the link knowledge survives even if the source documents are deleted. "links md" |

| Category | Rules | Theme |
| --- | --- | --- |
| governance | 12 | objective, operation, waves, honesty |
| reading | 6 | sed segments, index first, persisted |
| writing | 8 | lowercase, dot hierarchy, dedup, tables |
| identity | 7 | commits, names, brand, files |
| design | 15 | windows 11, trylle, icons, hybrid |
| applications | 15 | the roster and the single house |
| structure | 10 | flat tree, sol, anchors |
| code | 12 | logics, copy law, quality, runtimes |
| engines | 6 | catalog, universal library, pins |
| data | 8 | vault, chunks, unified db, faun |
| sandbox | 16 | modalities, zero touch, quotas, competitor sandbox models |
| accounts | 9 | auth, plans, chat grammar |
| build | 8 | workflows, assets, ladder, bump |
| security | 8 | crypto, binding, tls, devtools |
| competitor map | 14 | the features of every captured platform |
| per app | 8 | the feature maps of every app |
| processes | 6 | ladder, master plan, corpus, skills |
| checklist | 10 | the ten points before delivery |
| standing | 2 | consolidation and pending waves |

## To Visit, Links, Paths and Commands, in Order

> this closing block is the only place of the document allowed to carry links, paths and commands, kept last so the body above stays clean; the exhaustive list of every github link extracted from the corpus rides the links.md companion file beside this document, and the list below keeps only the entries the operation opens every day.

. the companion file carrying every github link of the corpus, deduplicated and grouped by repository. devthink/docs/links.md
. the official rascunho parts 01 to 07, the primary rule archive. https://github.com/iakadion/allan/tree/7421afded01f5ce89ded700796b58ec90605d570/docs/neodocs/outros.devthink/md
. the official rascunho at the second pinned revision. https://github.com/iakadion/allan/tree/ca5d761315c64eb8a1d47de8c5a5256611cbc33d/docs/neodocs/outros.devthink/md
. the official rascunho at the third pinned revision. https://github.com/iakadion/allan/tree/11349cdeca671ad2e9842477ea9ba379a8fee07a/docs/neodocs/outros.devthink/md
. the official rascunho at the fourth pinned revision. https://github.com/iakadion/allan/tree/b5588208da4969813fe7c99b980945070880a94a/docs/neodocs/outros.devthink/md
. the official rascunho at the fifth pinned revision. https://github.com/iakadion/allan/tree/1623a4d6985394b319a7040057f57e045c07ad94/docs/neodocs/outros.devthink/md
. the local neodocs corpus root. C:\allan\docs\neodocs
. the local rascunho and session folder. C:\allan\docs\neodocs\outros.devthink\md
. the living institutional docs of the devthink app. C:\allan\docs\devthink\devthink\docs
. the competitor screen captures of the thirteen platforms with the wire flows. C:\allan\docs\neodocs\outros.devthink\md\telas-design.md
. the architecture skill this format obeys. C:\Users\nathalan\.config\opencode\skills\architecture\SKILL.md
. the devthink repository. https://github.com/wenathlan/devthink
. the allan docs root. https://github.com/iakadion/allan/tree/main/docs
. the neoimg design references. https://github.com/iakadion/allan/tree/main/docs/neoimg
. the trylle ruler. https://trylle.com/
. the global node modules path. C:\Users\nathalan\node_modules
