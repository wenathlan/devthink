# conversa.txt part a (lines 1-4100) — distilled owner orders
source: /home/z/allan/organizado/md/conversa.txt (8195 lines total; this covers 1-4100)
dates covered: 28 sep 2026 → 03 oct 2026 (plus undated subagent delegations interleaved)
style: chronological voice transcripts, portuguese, noisy asr. everything below is distilled to english.

---

## 1. design orders

### overall aesthetic
- design must be a **100% professional fusion** of: windows 10 + windows 11 (fluent, mica, acrylic, rounded borders 8-10px, 2 elevation levels, focus ring, start menu, taskbar/navbar on top), brave + chrome (round tabs, omnibox pill, corners), codex, apple silicon (vibranium / liquid glass, translucent blur, inset highlights, blur+saturate), trylle (https://trylle.com/), trilly, and the reference sites in `c:\allan\docs\neoimg` and the design `.md` lists.
- "anti vibe code". clean design, well positioned, few dots, little text, optimized copy, micro+macro animations prioritized and planned, complete/smooth distribution with air to breathe, dark and light modes well defined, sidebar + navbar.
- use the best css/sx algorithms; use all ~1000 tailwind properties possible. take the animation box reference "as reference, not absolute truth".
- icon library fusion explicitly ordered: **lucide, mage, fluent ui (microsoft), tabler icons, iconoir, hugeicons, mynaui icons, remix icon, radix icons**.
- app icons must reach **apple silicon quality**: subtle per-app gradient, inset top highlight, layered diffuse shadow, crisp lucide glyph (strokewidth 1.5-1.8), readable label below, hover lift -4px + shadow, :active scale .96-.98, focus-visible ring, stagger 60ms, touch targets ≥44px. app identity color lives **on the tile**; the chrome (navbar, start menu, background) stays neutral graphite/slate.
- signal colors per app (never change them): argan #34d8a8, cadria #e858c7, debonair #d9962e, getry #8b5cf6, stealhead #e8563f, forge #d6f74b, foundry #1e6ff2, vault #7dd8ff, devthink amber sol #f59e0b, saddle green-lime #d4ff80.
- one stylesheet per theme: `<app>/Sol/sol.css` (index.css or theme-named). css discipline from design-premium skill (13 laws + ban lists): micro interactions ≤200ms, entrances stagger 60-90ms, animate only transform/opacity, `-webkit-backdrop-filter` before every `backdrop-filter`, z-index in bands, no `transition: all`, no pure #000/#fff, complete control states (hover/active/focus-visible/disabled), vendor prefixes -webkit-/-moz-, consolidated css variables, fluid type units.
- **no dots** (decorative dot patterns), **no orange** (for devthink it is amber #f59e0b), no white borders (dark hairlines; white-alpha max 0.08), no dissolving/dismembering text effects, no flashy sheen, no "vibe code" look, no generic slop, no big pastel gradients.

### screen flow / information architecture
- entry chain (mandatory): **boot with the real logo → identity (local auth) → desktop** with app icon grid + top navbar with start button + start menu. same for web, binary, extension, distribution: "intro animation → login screen → main screen (panel)". the panel/desktop comes **last**, only after login.
- there are two entry concepts: **intro** (the saas-style landing/intro when opening the site — `index.html` is "the face of the saas") and **explore** (a netflix/youtube-like page where the person explores other apps' explores, grouped by category: video, image, etc). they are different pages; the devteam chat page wrongly opening as panel belongs to the chat subapp, not the panel.
- on the iso/desktop distribution it opens like windows; on web it opens on the intro page.
- every screen follows: "always onboarding, always animation screen, then the main screen".
- navbar is **on top** (windows 10/11 style with start menu), not the wrong form the assistant made.
- when the person enters devthink the **app icons must appear** (like apple silicon launchpad/desktop), replacing the hated "onion operating system / nine instruments" text-slide deck — remove every residue of those slides.
- the chat app becomes one subapp among many: devthink is an **os** that aggregates subapps, not just a chat app.
- mobile/desktop adapters: design universal for extension, tv, etc., thanks to workflows and capacitor (ios conversion).

### logo and identity
- the devthink icon must be **exactly** the one from the fabric/factory folder: `c:\allan\docs\neodocs\outros.devthink\txt\logo.txt` — two paths, viewBox 0 0 800 800. `Sol/home/logo.tsx` must carry exactly those two paths (compare path by path). boot.tsx must render this real logo mark (not a `<span>dt</span>` text mark).
- boot animation: **simple** — discrete fade+scale on the mark, progress bar below, "devthink" text. instant skip on prefers-reduced-motion. keep shouldBoot()/sessionstorage contract and onDone prop unchanged.
- platform branding to configure on google console (branding, client, oauth), github/gitlab apps, telegram bots — all under the name **david king / devtank**; logo, banner, favicon, icons provided by the owner in a folder; domains change to devthink.com / devthink.pro (alpha: "let it think" instead of just flow); auth.devthink.pro.
- institutional thinking: institutional pages, docs page, about page, etc., all following the theme. sol theme is "the most illuminated theme" (not yellow — just the name).

### language
- **all apps in english** (code, comments, jsdoc, ui copy). translation to any language later via google gtx using `c:\allan\docs\neosdocs\outros.gl\js\translate.js` pattern; the folder only translates to portuguese when the person changes it in the settings page.
- `<html lang="en">`; remove remote cdn icon `https://z-cdn.chatglm.cn/z-ai/static/logo.svg` (no remote origin in the interface).

---

## 2. feature orders

### platform concept
- devthink is a direct competitor of grok, chatgpt, windows 10/11, e2b, cloudflare, and all famous agent/chat platforms: categories chat, chatbot, agent, browser, gateway. atomic chat + atomic agent features all go into devthink (agent and chat are the same thing); atomic mail is an app inside devthink; sigma browser is devthink's browser inside the sol theme. app 8 (ansi art) is embedded logic to turn any functional tsx design into a terminal (cli).
- copy the sandbox/interaction flows of competitors by mapping them with devtools (network tab) while driving the owner's real logged-in brave via cdp: **z.ai (chat.z.ai, agents mode, glm 5.3), manus.im (automations too), grok.com build mode, bolt.new, aistudio.google.com/apps, arena.ai/code, designarena.ai (click "site" then select "max" then send the prompt)**. send "oi", make them do a 20-step html todo list, make them open links, watch download flow; record endpoints (sse/ws, thread creation, sandbox/vm creation, file system, browser use, progress) in mds. what to copy for devthink: self-hosted, **no captcha** ("liberto pra todo mundo"), several deployed backup domains that host sandbox and/or db.
- saddle: complete virtualized sandbox engine (all sandbox modalities; ~20+ modalities, 13 types listed; runs any binary including itself; e2b/docker-like; the "sedum"/rune engine runs the sandbox on the domains). vault = supabase clone (all supabase features, storage, keeps dbs, receives backups). forge = execution only (runs any binary with saddle engine). foundry = complete (runs, is sandbox, and stores). getry = deployable gateway with routes v1-v7+ (v1 works on z.ai sandbox preview; next-bypass model generated by workflow conversion, no dist/public/src, no ui).
- **the interface never touches the visitor machine**: no indexeddb, no localforage, no localstorage writes, no browser storage of any kind in sol pages, no hardware access (no vgpu/vcpu/gpu/cpu/compilation apis). the only thing the visitor machine does is load the interface. all data lives in the site's own self-hosted db (the "virtual repo" — db mirrors repository content per theme: code, assets, info seeded into it) reached over https. pattern: usestate + useeffect fetching typed db accessors; offline answer is an **in-memory seed module** (no storage writes). replace any indexeddb/localstorage code with this.
- **stealhead pre-compiled doctrine**: the fps platform ships pre-compiled (shaders and assets prepared ahead, hash-verified rows) so the visitor vgpu/vcpu never compiles; heavy work runs on our own domains/engines/sandboxes over https.
- **engines are libraries**: saddle root modules stay library-grade — zero hardcoded consumer data, typed exports, consumed by sol pages and external consumers (npm/maven packages; a spring boot module rides the maven distribution; each app has a spring boot module, npm package, maven package, distributions). every engine written primarily as a library so anyone can use it on any platform.
- nothing hardcoded: component data (leaderboards, weapons, world assets, saddle boards/cores/gpus/processors, catalog) renders from db accessors over https with in-memory seed fallback. the db is seeded with exactly what the repository has (code, assets, information) — "repo virtual".
- dbs are shared through https (90+ protocols, 3000+ mimetypes); git lfs, libgit2, prisma, drizzle, mysql2, better-sqlite3; git objects/git blobs as storage modalities; single stack: workflows in yml + git filesystem (libgit2) + prisma schema + drizzle orm + mysql2 + better-sqlite3 — same stack for github repo operation and own platform infra.
- 60 engines in the catalog (node, npm, bun, deno, pnpm, yarn, typescript, vite, webpack, babel, esbuild, rollup, swc, wasm/wasmer/wasi, chrome/firefox engines, libgit2, better-sqlite3, libsql/turso, mysql2, pg, prisma, drizzle, saddle-motor, docker, gvisor, firecracker, qemu, caddy, webgpu/wgsl, onnx runtime, webcodecs, web audio, ffmpeg, tone.js, three.js, rapier, python/uv, go, rust/cargo, php+swoole, ruby, maven, nuget, c/c++, ghc, asp, hyperdht, webrtc, tar.xz -9 + brotli...). node.js is the orchestrator; 15 zingines/engines in package.json (see package10.json); heavy frameworks allowed only embedded and managed by node; owner prefers everything in typescript; external frameworks executed/compiled by node via webpack/wasm/babel.
- every clonable deployable site (db, sandbox, db+sandbox/runner) also gets **next-adapted versions** (so the v1 gateway works on z.ai preview and normal next; allows deploying multiple copies in ci: db copies, sandbox copies). next versions exist **only as zips in release assets** (`<app>.web.<version>.zip`, `<app>.next.<version>.zip`), never as folders in the repo.
- gateway is opt-in registration ("cadastro opt-in"); pull auth to authorize code before continuing design work.
- cadria = video editor competitor (netflix, splendor, davinci, after effects, vegas); "video" single app covers edit, play, modify, studio, streaming (imports cad engines); music studio separate.
- auth persistence: real auth, sync in/up, cli/login/sync sections in #ofical; identity local then desktop.
- super platform native apps wave: catalog.ts kinds "platform.apps", "platform.binaries", "studio.assets", "studio.tracks" with types nativeapp/runnerbinary/studioasset/studiotrack; runners of games/applications; no new npm deps — only react, wouter, lucide-react, sonner.
- packaging/publishing: publish packages to npmjs/github packages (private, "nathlan bros", pro.devthink.* scoped: stealhead, argan, cadria, debonair...). owner later ordered: **delete those wrongly published packages** and republish under the correct final names. no paid workflows/actions — catalog only free actions; no hardcoded shas — workflows act by tag, hash generated at build and travels in assets.
- chrome extension surfaces exist: sidepanel.ts (7941 lines), popup.ts, optionspage.ts, dashboardpage.ts, transparencypage.ts at app root.

---

## 3. rules

### naming
- own filenames use **dots, never hyphens** (framework config files keep their conventions): `clean.url.ts`, `use.stored.state.ts`, `app.header.tsx`, `status.dot.tsx`, `command.menu.tsx`, `devthink.os.tsx`, `gateway.home.tsx`, `<app>.app.tsx`. composed identifiers use a dot, never a hyphen.
- folders **without hyphen and without underscore**: vault, forge, foundry.
- **no dots in component names** in the other sense (naming rule from 24 oct block): write the name once, not repeatedly qualified with dots, since components are universal inside the components folder.
- scope naming: pro.devthink.* private packages by nathlan bros; @wenathlan/devthink root manifest; apps argan/cadria/debonair/forge/foundry/saddle/stealhead/vault/getry/devthink.
- remove dot/period repetitions in component naming; remove `gettryy` typo completely (zero mentions).

### waves / subagents discipline
- **three subagents per parallel call**, launch 3 at a time while the main agent also works; as one finishes, launch the next ("três por concorrência"; depends on who finishes first).
- read files **linearly, hierarchically, in segments via bash sed from line x to y** (never the read tool for these big transcripts; also `echo`, `node`, `grep -n` for anchors). never skip segments; never load whole giant files at once (segment 1.000-4.000 lines when reading #ofical).
- each context-absorption subagent covers a line range of the transcript and outputs a complete rules map (chronological, grouped by theme, complete sentences, no over-summarizing, mark [desatualizada?] revoked rules, end with "pontos pendentes da faixa").

### code / repo discipline
- **all text in english** in code, comments (jsdoc `/** ... */`), ui copy.
- code written **hierarchically, grouped by theme and blocks**, ~300 correlated logics per file, in jsdoc standard with the most recent parent syntax, dated.
- **never use bash to write/move source files** — the mimosa hook blocks it (sed/echo >, mv, cp, git mv). use read/write/edit tools; bash only for reads/grep/find and `rm` of a single file (allowed). for package.json (json) node -e scripts via bash are permitted.
- **no git commands** for subagents (orchestrator handles commit/release); no pushes; no installs (no npm/bun install; `pnpm --dir <app> install --lockfile-only` only); no local builds; **never write in dist/ or build/** (a local vite build with emptyoutdir false already polluted root index.html once — incident).
- node modules come from the global windows node_modules (`c:\users\nathalan\node_modules`); use a junction `mklink /J node_modules ...` for validation then `rmdir` it. **never download binaries, never install playwright into app data** — take it directly from node modules.
- zero feature loss: never remove packages, features, files, or assets when standardizing. additive-only merges (add missing deps, raise outdated ranges, never delete). check "wouter" exists in all apps.
- tsconfig: root typechecks sol tsx (add "sol/**/*.tsx", jsx react-jsx, lib dom/dom.iterable, paths @/* → ./sol/* then ./*).
- only `app.tsx` may be loose at sol root; every other loose .tsx moves into its own component folder (`shell/shell.tsx`, `toast/toast.tsx`, `console/terminalui.tsx`) with a first-line comment; importers updated; exported symbol names unchanged.
- each app keeps its own test folder; scripts of the family live in `devthink/tests/scripts` in typescript; cjs automation scripts (dt-*.cjs, harvest etc.) are transient tooling to be moved/deleted to allan organizado md at the end.
- components: max ~100 components per page; folder = page = app; the anchor component (app.tsx) manages routes/subroutes, subroute anchors import their components; components are universal/reusable across folders.
- pages: usestate + useeffect + typed db accessors; **no secrets hardcoded**; no new npm dependencies.
- versioning: bump to **2.0.135** in all package.json (24 oct block; later releases 2.0.183/184 had 400+ assets; release versions seen: 2.0.59 runs, 2.0.118, 2.0.133/134, 2.0.135, 2.0.140, 2.0.183/184); every error → bump new version; one tag only, ~200 assets, immutable release; workflows must come out **signed and verified** (release notes and commit).
- security: solve **all** security and quality problems (github code-scanning, pnpm audit gate, osv-scanner); fix advisories honestly (bump fixable deps, allowlist only transitives without fix); never silence a fixable advisory.
- docs (#ofical): third person, complete sentences, correct orthography/grammar/punctuation, hierarchical at all levels, every section ends in a table, lists of engines/icons in codebox, **zero emoji**, zero source citation (no file names, line numbers, «», r-num, "fonte de verdade"), old-infrastructure content marked "(plano anterior)" never deleted, one concept = one rule without duplication or contradiction, section order: regras gerais → regras da arquitetura oficial → regras por app (app-0001 to app-0735, three apps with 245 rules each) → template padrão → componentes oficiais por página → exemplo (last, ansi tree).
- repo hygiene: no ui/, assets/, public/, dist/, data/, db/ folders in the tree; `devthink.toml` in the theme; `wrangler.toml` + `.dev.vars` in every theme; one css per theme; "web" is just the name given to the theme folder (now sol; more themes later without duplicating framework configs); src only exists when the platform requires (next).
- deletes ordered: temp files/folders forbidden; wrong pro.devthink.* packages; cjs files (harvest etc.) once moved; "onion operating system"/"nine instruments" slide residues.

---

## 4. defects charged (what previous assistants did wrong)

1. design rejected **twice+**: "you almost did it right but couldn't" — vibe-code look, horrible icons, horrible navbar, wrong lockup understanding; "the person enters and says i hate it".
2. wrong intro: devteam page opening as panel/chat instead of intro flow; chat shown where the os desktop should be; slides of text ("onion operating system", "nine instruments") instead of windows-style app icons.
3. navbar wrong (must be top with start menu, windows 10/11); "me tira esse efeito horrível" (the dissolving-text effect).
4. dots not removed; orange not removed; devthink icon not equal to the fabric logo (logo.txt paths).
5. icon drag-and-drop broken (moving icons side to side doesn't work); subapps (settings, chat) "not well made", not equal to each other; redirection broken (clicking saddle/video studio/music studio doesn't navigate).
6. security and quality problems not solved/closed (code scanning, audit gate, osv).
7. standardization misunderstood: assistant **removed features/packages it should only standardize**; messed up the workflows; didn't standardize package.json across apps; version 183/184 regressed from 133/134 (lost 400+ assets; must restore features from the ~675-780 historic commits).
8. #ofical rewrite rejected: agent "ate" parts of the unificado and the new tree didn't standardize the apps → rewrite from zero.
9. too slow / wrong browser automation: opened opera instead of brave, brought windows to front, forgot enters, slow pipeline; must control brave in background via one pid, fast batelada ("5-10 minutes, bate e volta").
10. saddle page not loading on github pages (asset 404s / base path) — must verify with curl end-to-end.
11. reading discipline violations: assistants trying to read giant files whole instead of segmented sed; skipping content; not reading linearly.
12. localStorage/indexeddb code written in sol pages (violates the never-touch-visitor-machine doctrine) — must be replaced with db accessors + in-memory seed.
13. portuguese left in os/layout.tsx and remote cdn icon left in place.
14. hyphenated filenames left in os/components (must be dots).

---

## 5. quotes worth keeping (translated)

- "no temp file, no temp folder. headless mode."
- "you will navigate my real brave, already logged in, to configure the bots and the platform. i don't know how to configure — that's the only thing i ask."
- "we are not using supabase; we use our own self-hosted infra, similar to supabase."
- "the only thing the site will use of the person's computer is loading the interface."
- "we won't have captcha — it's free for everyone."
- "devthink is an os, not just a chat app."
- "when the person enters devthink, the icons must appear — apple silicon style, not like this."
- "windows 10/11 is not like that: there is a panel, a start menu. the fusion of brave, windows 10, apple silicon and trylle is not this. it's horrible."
- "the devthink icon is exactly the one in the factory folder."
- "i already told you: it's not orange, take out the dots."
- "the navbar is on top, man."
- "the chat app will become the chat subapp, because there will be the other apps."
- "first do the pull auth so i can authorize the code, then continue the design work."
- "three subagents per parallel call — pay attention and keep launching three at a time while you also work."
- "read linearly, hierarchically, via sed from line x to line y — no shortcuts."
- "i told you to standardize the config files, not to remove anything. zero loss."
- "i want the workflows signed and verified, both release notes and commit."
- "bump to 2.0.135 in all package.json and bump again on every error."
- "the vault is the clone of supabase; the foundry is the clone of e2b/docker; the engine lives inside saddle."
- "nothing hardcoded — the components' data lives in the db."
- "engines are libraries — anyone can use them, even with spring boot."
- "it's a direct competitor of grok, chatgpt, windows 10, e2b, cloudflare."
- "the interface never touches the visitor machine."
- "stealhead ships pre-compiled so the visitor's vgpu/vcpu never compiles anything."
- "you ate parts of the unificado and the new tree didn't standardize the apps — rewrite it from zero."
- "all apps in english; translation comes later via google gtx."
- "design of a premium startup/agency — webflow level."
- "micro animations prioritized; planned; smooth; taking care of scroll errors."
- "fast, please — i need this in five minutes, bate e volta (hit and return)."
