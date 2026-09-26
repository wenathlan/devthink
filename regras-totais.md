---
name: regras-totais
description: Total rules manual for the DevThink operation. Hierarchical governance grouped by theme, category and context for coding, organization, architecture, deploy, security and agent behavior. The specialist (and its subagents) follows every rule below. Triggers on any DevThink build, merge, deploy, or architecture task.
---

## Scope and Precedence

Total rules govern the DevThink operation: the specialist plus its subagents (up to 3000 for the whole operation) build DevThink as OS and superplatform, with saddle as its sandbox and VM runner. The observer writes in third person, English only, no emoji. Every rule is short, direct and functional.

| Trigger/Topic/Item/Layer/Aspect/Mode/Folder/File | Purpose/Detail/Rule/Example |
|--------|--------|
| Precedence | Order. on conflict SKILL.md wins, then the current tree, then REGRAS.md, then voice transcripts, then session logs. "tree wins" |
| Current tree | Source. the current organization architecture is the full tree. "tree first" |
| No invention | Honesty. no rule invented; every rule comes from the source files. "sourced" |
| Evolution note | History. `web/` became the theme folder; `main.tsx` bootstrap became `App.tsx` self-mount; `scripts/` became `tests/`; saddle absorbed e2ugh first, DevThink absorbs gateway plus extension plus maene now. "evolved" |

## When To Use

| Trigger/Topic/Item/Layer/Aspect/Mode/Folder/File | Purpose/Detail/Rule/Example |
|--------|--------|
| Library design | Activate on multi-mode library build. apply the same governance. "Build as library" |
| Deploy talk | Activate governance when user discusses deploy. apply arch rules. "Deploy on Netlify?" |
| Database or ORM | Activate on Prisma/Drizzle/MySQL2/Socket choice. apply arch rules. "Use Drizzle?" |
| Project structure | Activate on best folder or layout design. apply arch rules. "How to structure?" |
| Architecture spec | Activate on technical architecture specification. apply arch rules. "Write arch spec" |
| Verdict engine | Activate on judge, jury, calibration, or Jev-alternative work. apply verdict rules. "Build verdict" |
| Naming | Activate on any app, engine, or feature naming. apply naming rules. "Name it" |
| Governance | Scope. technical architecture governance; applies rigid design rules. "arch governance" |
| Voice | Tone. observer writes in third person; no first person. "the specialist" |
| Rule style | Format. every rule short, direct, functional. "concise rules" |

## Internal To-Do List

The to-do list is the first thing the specialist builds; step 0 consults the current date (day/month/year), then researches the best implementation, design pattern, and dependency versions of that date. Research recurs through every step so every part uses the most up-to-date practice of the consulted date. Reference date: 25 September 2026.

| Trigger/Topic/Item/Layer/Aspect/Mode/Folder/File | Purpose/Detail/Rule/Example |
|--------|--------|
| Date and research | Steps. step 0: consult the current date, then research best implementation, pattern, versions; research recurs every step. "date-first" |
| Before any task | Plan. specialist builds a grouped to-do list internally (in reasoning); a file is the last resort; one checklist per request; subgroup by correlated context. "internal list" |
| Group size | Plan. max 10 tasks per group of correlated logic; open another group of same context when more; finish a group before next. "max 10" |
| Workflow | Steps. (1) checklist; (2) delegate subagents first; (3) execute inline; (4) local file last resort; (5) cleanup temp scripts. "steps" |
| Subagent delegation | Delegate. up to 3000 for the whole operation, in up to 1000 waves; group each subagent by correlated category/theme; one category per subagent; up to 1000 tasks inside one subagent when the category demands it. "subagents" |
| Verify per step | Quality. verify stepwise before next step and after finishing. "verify" |

## Operation Phases

| Trigger/Topic/Item/Layer/Aspect/Mode/Folder/File | Purpose/Detail/Rule/Example |
|--------|--------|
| Phase 1 reading | Phase. read everything first; map all rules into one rules document; map all features per app into one features document; separate repo links. "phase 1" |
| Phase 2 interface | Phase. build the apps starting from the interface, inside the theme. "phase 2" |
| Phase 3 outside logic | Phase. build the logic that lives outside the theme, at the root. "phase 3" |
| Later phases | Phase. invent 3 to 4 extra themes; each new theme holds only page folders with components, never root files. "later themes" |
| Changelogs first | Order. read all changelogs of the owned repos before anything, to learn what exists and what was done. "changelogs" |
| One app at a time | Order. finish one app then move to the next, or keep subagents in parallel while the specialist builds the main one. "app by app" |
| Only these apps | Scope. focus exactly on the listed apps; no extra app, no external app. "listed only" |

## Reading Doctrine

| Trigger/Topic/Item/Layer/Aspect/Mode/Folder/File | Purpose/Detail/Rule/Example |
|--------|--------|
| Read all files | Duty. read ALL upload files, no exception, one by one, thoroughly, start to end, at every start and whenever in doubt. "read all" |
| Segment reading | Method. read files in line segments (line X to line Y) directly; never cut the file physically to read it. "segments" |
| Block reading | Method. read 22k-24k line files in blocks across subagents with disjoint ownership, skipping nothing. "blocks" |
| Dedupe first | Method. delegate subagents to dedupe identical-hash files first, keeping the most recent date. "dedupe" |
| Byte verify | Truth. verify real bytes (od/hexdump, Python/subprocess) before "fixing" apparent corruption; caches and tool layers can lie. "bytes" |
| Worklog | Trace. update the worklog on every Task; shared family worklog stays current. "worklog" |
| Failure order | Debug. analyze ALL failures one by one, newest to oldest, skipping none. "failures" |
| Honesty | Duty. report real state, pendings, continuity plan; fix prior errors truly, never hide. "honest" |

## Coding Rules

Code is simple, organized, optimized, grouped; internal logic grouped and optimized; direct and objective; hierarchical JSDoc block by block, synchronized internally and externally, file to file and inside each file.

| Trigger/Topic/Item/Layer/Aspect/Mode/Folder/File | Purpose/Detail/Rule/Example |
|--------|--------|
| Correlated logic | Grouping. 0 to 100 correlated logics of one responsibility in ONE file, up to 300 when the correlation demands it; everything about one context lives in that file, no redundancy. "grouped" |
| One file one job | Cohesion. one file per context; no duplicated logic across files; split only on mixed concerns, heavy isolated logic, necessary reuse, or pure `.ts`. "one file, one job" |
| Merge over split | Cohesion. merge duplicated logics into single files; anything repeated 2+ times becomes a util or component; each file owns its exports, no re-export barrels. "merge" |
| Hierarchy | Order. inside the file, hierarchical ordinal blocks, base to derivatives, most important to least; JSDoc on all blocks. "blocks" |
| Sync | Consistency. blocks synchronize with each other internally and with external files; interface pulls from root, root never pulls from interface. "sync" |
| TypeScript first | Language. TypeScript is the priority language; app is born a multi-mode library; TS end to end, JS only as emit on publish. "ts first" |
| Erasable syntax | Syntax. mandatory erasable syntax so `.ts` runs natively on Node 26; prohibited enum, namespace, parameter properties. "erasable" |
| Explicit extension | Imports. relative imports ALWAYS with explicit `.ts` extension. "explicit ts" |
| Native first | Dependency. always prefer Node.js built-in modules; external packages only rarely and only when no native built-in covers the need. "node:* first" |
| No JS in interface | Purity. zero JS in the interface: only TS/TSX/css/html. "no js ui" |
| Two-file split | Size. single file when 200 lines or less, else logic `.ts` plus visual `.tsx`. "200 lines" |
| Small commits | Hygiene. one action per commit, descriptive message; test before commit; mimic existing style. "small commits" |
| Try/catch | Safety. embed error catcher or debugger for later tracing; traceable try/catch. "try/catch" |
| Helper scripts | Scripts. always write helper scripts to organize and accelerate tasks; JS (`.js`/`.mjs`/`.cjs`/`.ts`) in `/tests`, non-JS in `/tests/scripts/`; names lowercase, no underscore or hyphen. "tests/_task.mjs" |
| Formatting | Style. Biome double quotes, indent 2, organizeImports; pretty, modern, grouped, hierarchical, synced. "biome" |
| Dead code | Hygiene. delete dead code with zero imports; keep valid future integration; reactivate useful unmounted modules. "no dead" |

## Organization Rules

| Trigger/Topic/Item/Layer/Aspect/Mode/Folder/File | Purpose/Detail/Rule/Example |
|--------|--------|
| Root first | Layout base. no `/src` folder; files at root; source dirs mapped at root; the dependency manifest stays at root. "no /src" |
| No folder inside folder | Layout base. never nest; no deep nesting; no nested config; only mode folders as subfolders. "flat layout" |
| Subfolders by mode only | Layout base. subfolders only as modes or apps; files stay flat; no globals by category. "flat" |
| Folder page app | Identity. folder equals page equals app; page name equals folder name; config page is config app. "folder=page" |
| Engine one home | Ownership. each engine lives in exactly one app; others import it from the published library, never with their own file. "one engine" |
| Nothing deleted | Preserve. nothing is deleted: duplicates kept with suffix; stale versions confined to CHANGELOG history. "suffix keep" |
| Fusion | Merge. inward without duplicating; two equals become one, nothing lost; synonyms into a single concept; most recent wins. "fuse" |
| Metadata converts | Merge. merged metadata becomes the host product everywhere; zero remnants of old names except verbatim historic lineage. "convert" |
| Reference not copy | Reuse. each app has its own docs/ and tests/; reference shared content, do not copy it. "reference" |
| Design only repo | Scope. design-only work lives in its own private repo, no logic inside. "design repo" |

## Naming and Formatting Rules

| Trigger/Topic/Item/Layer/Aspect/Mode/Folder/File | Purpose/Detail/Rule/Example |
|--------|--------|
| Lowercase files | Naming. filenames 100% lowercase, no hyphen, no underscore; dots or joined words only. "lowercase" |
| Root exceptions | Naming. essentials keep canonical case: `Dockerfile`, `LICENSE`, `package-lock.json`, `CHANGELOG.md`, `SECURITY.md`, `README.md`. "exceptions" |
| camelCase code | Naming. variables, identifiers, JSON keys in camelCase, no underscore or hyphen. "camelCase" |
| English only | Language. code, comments, docs in English; JSDoc in English. "en docs" |
| No emoji | Clean. none in code and docs. "no emoji" |
| Third person | Tone. observer writes in third person; no first person. "the specialist" |
| Concise voice | Tone. short/medium, direct, clean, functional. "concise voice" |
| Product casing | Brand. lowercase technical names (`devthink`, `@wenathlan/devthink`, `io.github.wenathlan:devthink`) and capitalized presentation names (`DevThink`, `DevThink.java`). "casing" |
| Official names only | Brand. only official app names; never invent an app. "official" |
| Tables format | Format. titles, subtitles, tables for rules and plans. "tables" |

## No-Hardcode Doctrine

Logics are never hardcoded; everything is standard, patterned and parametrized: no fixed host name, no fixed site name; defaults and options live in the database, never in code.

| Trigger/Topic/Item/Layer/Aspect/Mode/Folder/File | Purpose/Detail/Rule/Example |
|--------|--------|
| No hardcoded address | Avoid lock-in. never localhost, always host, no fixed IP or port. "host, not localhost" |
| Options in DB | Config. hardcode nothing in code; hardcode everything in DB; themes, defaults and options fetched from DB at runtime. "db owns config" |
| User choice | Respect user. all settings parametrized, 100 percent choice; nothing rigid forced. "user sets port" |
| Open option set | Avoid lock-in. no vendor or feature binding, infra open; external inspirations absorbed as native code, never as third-party calls. "swap provider" |
| Host flow | Randomize. draw host if possible else randomize host port; host never localhost. "random host" |
| Port flow | Randomize. random port (1 to 1000000) then lock; use the locked port only after the draw. "port 48213" |
| Session pair | Randomize. host plus port randomized before fixed for session. "pair randomized" |
| Theme from DB | Config. theme, login and entry choices come from the DB, never from client constants. "theme db" |
| Universal library | Reuse. publish the open-source library; any project imports it and only configures `baseURL/models/keys`. "configure only" |

## Architecture: Three Layers and Modes

The application is always built as a library first, then converted to every target; one library-first core in TypeScript, internal memory never bound to a single runtime.

| Trigger/Topic/Item/Layer/Aspect/Mode/Folder/File | Purpose/Detail/Rule/Example |
|--------|--------|
| Layer 1 universal router | Entry. root entry imports/exports only L2; no L3; max 300 correlated logics per file; embedded logic, minimal imports. "L1 root" |
| Layer 2 local router | Resource. each resource in its own root folder; homonym entry gathers and exports local routes. "L2 folder" |
| Layer 3 components | Support. private; only L2 imports them. "L3 support" |
| Interface direction | Flow. interface pulls from root/library; root never pulls from interface; one interface never pulls from another. "one way" |
| Entry migration | Frontier. only entry logic migrates from the theme to the root; decide by reading file interiors, not names; design in root moves to theme, logic stays. "gateway rule" |
| Multi-mode library | Modes. works as library and binary across ~30 modes, with and without each mode; internal memory priority. "multi-mode" |
| Seek alternatives | Choose. beyond default; open options. "alt lib" |
| Simplest robust | Choose. simplest, easiest, most robust. "min deps" |
| Combine options | Choose. blend external plus external, internal plus external, internal plus internal; no thought limits. "mix strategies" |

## Repo Layout: The Current Tree

`<nome>` is the lowercase app. `<Nome>` is capitalized. `<Tema>` is the theme folder (example `Sol/`); there is no folder named `default`. N themes means N complete folders. `default/` in older docs means the theme folder.

| Trigger/Topic/Item/Layer/Aspect/Mode/Folder/File | Purpose/Detail/Rule/Example |
|--------|--------|
| Repo root | Layout. `.github/` plus one folder per app (`devthink/`, `saddle/`, `debonair/`, `cadria/`, `stealhead/`, `argan/`) plus root files only. "apps root" |
| App root | Layout. `<Tema>/` theme folders plus `docs/`, `tests/`, loose `.ts` logics, envelopes, configs; pages live only inside themes. "app root" |
| Theme folder | Layout. complete web per theme: entry (`index.html`, `App.tsx`), build (`vite.config.ts`, `tsconfig.json`), deploys (`vercel.json`, `netlify.toml`, `capacitor.config.ts`), PWA/manifests, styles, icons; then `<Pagina>/` page folders. "theme folder" |
| Page folder | Layout. page folder holds only design: `<Pagina>.tsx`, `<Pagina>.styles.ts`, `<Pagina>.types.ts`, `<Pagina>.test.tsx`; all components, styles, types, validation, tests together. "page folder" |
| Onboarding | Flow. onboarding frame by frame adapted per app; login skippable via OS. "onboarding" |
| One design | Design. one design only; only responsiveness changes; portrait is phone, landscape is TV/desktop. "one design" |
| Wrappers only pack | Native. `ios/` and `android/` are generated packaging wrappers, never a second interface; avoid manual edits. "wrappers" |
| No build dirs in repo | Hygiene. no `public/`, `assets/`, or `dist/` in the repo; compile at the owner's root; only icons and favicons committed. "no dist" |
| Root loose files | Layout. 92 loose files at root plus conditional blocks; one manifest per language; envelopes per registry; legal and policy docs durable at root. "loose root" |
| Sandbox conditional block | Layout. VM/sandbox projects only: hardware JSONs plus native bridge sources. "sandbox block" |
| Desktop conditional block | Layout. native desktop projects only: `Cargo.toml`, `Cargo.lock`, `build.rs`, `main.rs`, `gen-icons.py`. "desktop block" |
| Site is sandbox | Identity. the site already is a sandbox; account equals isolated sandbox, about 50GB per plan. "account sandbox" |
| Each app own site | Deploy. each app gets its own site plus subdomain. "subdomain" |

## Root Versus Theme Placement

Deploy and interface files live inside the theme; the repo root holds only what GitHub and the toolchain must read from the root.

| Trigger/Topic/Item/Layer/Aspect/Mode/Folder/File | Purpose/Detail/Rule/Example |
|--------|--------|
| Deploy configs in theme | Place. `vercel.json`, `netlify.toml`, `capacitor.config.ts`, `vite.config.ts`, `index.html` live INSIDE the theme folder; the deploy root owns them. "theme owns deploy" |
| Test config at root | Place. `vitest.config.ts` stays at the app root. "vitest root" |
| Forge at repo root | Place. `.github/` stays at the repo root; GitHub only reads it from there. "`dependabot.yml` never inside `workflows/`" |
| Zero JS in theme | Purity. every JS inside the theme becomes TS; only TSX/TS/index.css/index.html remain; no `main.tsx`; `App.tsx` self-mounts with embedded routing. "tsx only" |
| Prisma in theme | Place. Prisma lives inside the theme, never a root `prisma/` folder. "prisma theme" |
| One manifest per language | Standard. exactly one manifest per language at root; one lock only, never two lockfiles together. "one lock" |

## package.json and Metadata

| Trigger/Topic/Item/Layer/Aspect/Mode/Folder/File | Purpose/Detail/Rule/Example |
|--------|--------|
| Union no loss | Merge. everything from merged repos is added: dependencies, devDependencies, formatting, scripts, configs; version conflict resolves to MOST RECENT. "union" |
| Scoped name | Identity. `@wenathlan/<app>` as the real name everywhere: repository, bugs, homepage, workflows, OCI labels, configs. "scoped" |
| Lockstep version | Sync. version in lockstep in ALL envelopes (~20-40 files): manifests, locks, Dockerfile label/ARG, `.config` envelopes, pom revision, csproj Version, gemspec, Java/C# cores, server health, readmes, `App.tsx`, tests, CHANGELOG; the gate READS `package.json`, never a hardcoded literal. "lockstep" |
| Latest engines | Fresh. engines at latest versions with latest versions of ALL dependencies. "latest" |
| Single bin | CLI. single binary in `package.json`; a merged CLI becomes a subcommand. "one bin" |
| Theme manifest private | Deploy. theme `package.json` is `private: true`, a deploy manifest, never published; it mirrors the root with the same packages in lockstep. "private theme" |
| Single envelopes | Registry. one envelope per registry, no duplicates. "one envelope" |
| Overrides at root | Fix. vulnerabilities resolved at root with `overrides`; no ignore files. "overrides" |
| Single package manager | Tooling. one manager and one lock; never two lockfiles together. "one pm" |

## Versioning and Release

The last decimal place is units with 99 versions; reaching 100 rolls into tens, also 99 versions; reaching 100 rolls into hundreds. Up to 4000 features per app distributed across versions.

| Trigger/Topic/Item/Layer/Aspect/Mode/Folder/File | Purpose/Detail/Rule/Example |
|--------|--------|
| Bump loop | Loop. any bug, workflow error, or security error: fix, bump next version, push, monitor workflows, repeat until all green; each bug is a version bump; registries are immutable. "bump green" |
| Automatic release | Flow. manifest plus CHANGELOG bump on main validates lockstep, creates the tag alone, builds maximum-compression zips plus SHA256SUMS, releases with CHANGELOG notes, publishes via `workflow_run`. "auto release" |
| Registries | Surface. npmjs, GitHub npm, Maven, NuGet, RubyGems plus multi-arch GHCR; publishes idempotent with existence-check pre-deploy. "registries" |
| Immutable tags | Tags. tags never re-tagged; orphan tags deleted; collateral red runs deleted; board stays 100 percent green with only main. "immutable" |
| CHANGELOG | History. uppercase `.MD` with one section per version; merged lineage history preserved verbatim. "changelog" |
| Features per version | Plan. up to 4000 features per app spread across versions; feature docs use checklist plus tables format. "4000" |
| Dep-only bumps | Rule. dependency-number-only updates commit straight to main with PRs archived and branches deleted, WITHOUT a product version bump; product versions move on features only. "dep bump" |

## Deploy Rules

| Trigger/Topic/Item/Layer/Aspect/Mode/Folder/File | Purpose/Detail/Rule/Example |
|--------|--------|
| No functions | Constrain deploy. reject Netlify Functions and Vercel Functions; static-only deploys with SPA rewrites to `index.html`. "no functions" |
| Static stack | Set stack. static hosts plus pure `node:http` API; page-relative routing works on Pages subpaths. "static" |
| Data stack | Set stack. use Prisma, Drizzle, MySQL2. "Prisma schema" |
| Realtime | Set stack. use Socket. "Socket channel" |
| Base | Set stack. use JavaScript with TypeScript. "JS base" |
| Mindset | Guide choice. prefer open alternatives; no platform lock. "No platform lock" |
| Same tree every deploy | Parity. the same tree on every deploy target: Vercel, Netlify, Pages, Capacitor, ISO; rewrites plus 404 fallback. "same tree" |
| Deploy root | Config. deploy services read from the theme folder as root directory. "theme root" |

## Containers

| Trigger/Topic/Item/Layer/Aspect/Mode/Folder/File | Purpose/Detail/Rule/Example |
|--------|--------|
| Single Dockerfile | Container. ONE Dockerfile at root handles the whole container context: build, runtime, ENVs, EXPOSE, VOLUME, HEALTHCHECK, `docker run` recipes in the header, heredoc embedded entrypoint. "one dockerfile" |
| No compose | Container. prohibited `docker-compose.yml`, `Dockerfile.full`, or any compose variant. "no compose" |
| Principal image | Publish. the publishable container is the principal, no `-web` suffix. "principal" |
| Profile tags | Tags. version tags per profile (`:X.Y.Z`, `:X.Y.Z-balanced`, `:X.Y.Z-lite`); never `:latest`, never major-only, never rolling, never `sha256-*`. "profile tags" |
| Registry cache | Build. registry cache mode=max; never `type=gha`; QEMU always set; package installs with retry. "cache" |
| Version inside | Label. container carries the version number in OCI label plus tags. "labeled" |
| Native builder | Build. build stages pinned to IMAGES with native platform toolchain; portable client without binary engine. "native build" |

## Hashes and Builds

| Trigger/Topic/Item/Layer/Aspect/Mode/Folder/File | Purpose/Detail/Rule/Example |
|--------|--------|
| No hardcoded hashes | Doctrine. NO hardcoded SHA-256/cryptographic hash in workflows, Dockerfile, or root files; hashes live with the GitHub computers in release assets and notes. "hashes ci" |
| Tags not SHAs | Pin. actions referenced by version TAG, never SHA-40; base images by tag, never digest. "tag contract" |
| Runner checksums | Assets. SHA256SUMS generated on the runner as a release asset; digests resolved at runtime via the GitHub API. "runner sums" |
| GitHub builds | Authority. builds and tests happen on the GitHub computers; the agent never generates binaries, never runs the authoritative battery, never saves assets at root. "ci builds" |
| Forbidden at root | Hygiene. prohibited at root: installers, built containers, `__pycache__`, `dist/`, `node_modules/`, zips/rars. "clean root" |
| Scorecard policy | Policy. heuristic pin alerts dismissed as won't fix with documented maintainer policy: version tag is the contract. "wont fix" |

## Git, Identity and Authorization

| Trigger/Topic/Item/Layer/Aspect/Mode/Folder/File | Purpose/Detail/Rule/Example |
|--------|--------|
| Commit identity | Identity. commits ALWAYS as the owner identity, never a generic user; fixed name plus noreply email. "owner commits" |
| Manual GH CLI | Tooling. GH CLI installed manually as a user binary, no sudo. "manual gh" |
| Device flow | Auth. login via device flow with ALL scopes, admin unlimited, unlimited time, permanent token without expiration; the flow runs in the background while the agent keeps working. "device flow" |
| Never block on auth | Flow. NEVER stop the operation awaiting authorization; keep cloning, analyzing, coding while polling; codes expire and are re-emitted automatically. "no blocking" |
| No re-poll after auth | Token. DO NOT re-poll after authorization; each post-auth poll rotates and invalidates the prior token. "no repoll" |
| Branch protection | Guard. main requires real checks plus 1 review plus code-owner plus dismiss stale plus linear history, no force-push or delete. "protected main" |
| Archive PRs | Hygiene. archive ALL PRs and branches with incorporation comment plus archive tag, leaving only main; incorporate dependency bumps before archiving. "only main" |
| Clone paths | Workspace. clones live beside the upload folder, NEVER inside upload, NEVER in /tmp; push plus fetch at session start; shared worklog. "clone beside" |
| Pre-push audit | Gates. lightweight local gates before push (typecheck, lint, actionlint, valid YAML, lockstep); authoritative tests belong to GitHub. "light gates" |
| Zero panels | Done. security panels always 0/0/0 (code scanning, secret scanning, dependabot) as the done criterion. "0/0/0" |
| Rollback resume | Recovery. after workspace reset reinstall tooling, restore token, fix file modes, pull, re-read rules, resume TODO. "resume" |

## Workflows

| Trigger/Topic/Item/Layer/Aspect/Mode/Folder/File | Purpose/Detail/Rule/Example |
|--------|--------|
| One per responsibility | Layout. self-contained workflows in `.github/workflows/`, one file per responsibility: ci, security, release, publishers, pages, lints, policies, cleanup. "one workflow" |
| No composite actions | Purity. `.github/actions/` PROHIBITED; workflows 100 percent self-contained with inlined composite actions. "self-contained" |
| workflow_run publishes | Triggers. `workflow_run` on publishes works around token suppression; distinct concurrency groups per event run side by side without canceling siblings. "workflow_run" |
| Tag guards | Release. semver tag guards on release jobs; cache releases do a clean real no-op. "tag guards" |
| Clean install | Deps. `npm ci`, never install; tokens optional with graceful degradation. "npm ci" |
| Pinned toolchain | Pins. paired pins per action verified against the API; runtime versions PINNED, never mutable latest. "pinned" |
| No staring at builds | Flow. do not cancel in-flight heavy builds; monitor and work in parallel. "parallel wait" |
| Valid files only | Hygiene. nothing corrupted: verify real bytes before "fixing"; secrets never in `if:`, use env. "valid yml" |
| Real gates | Rigor. no-ops are REAL with real gates; nothing skipped; scripts cannot be skipped or faked, make them real. "real gates" |
| Single battery | Layout. one battery per event; release validation excluded from push. "one battery" |

## Tests

| Trigger/Topic/Item/Layer/Aspect/Mode/Folder/File | Purpose/Detail/Rule/Example |
|--------|--------|
| Real tests | Doctrine. tests in `tests/` with `node:test` plus `node:assert`, no mocking, real torture E2E, massive and aggressive. "real tests" |
| Agent does not run authority | Authority. the agent does NOT run authoritative tests; the GitHub computers test via workflows. "ci tests" |
| Consumer test | E2E. real consumer test in CI: pack into a clean dir, install, use over ESM/CJS/CLI/HTTP. "consumer" |
| Structural gates | Gates. structure, format, and lockstep gates inherited and adapted to each contract. "gates" |
| Local sanity only | Sandbox. local gates are sanity only (typecheck, lint, actionlint, parse, lockstep), never the full battery. "sanity" |
| Pre-push suite | Suite. typecheck zero plus build plus boot smoke plus affected suites plus lint zero before push. "pre-push" |
| Clean tmp | Hygiene. clean `/tmp` at the end; kill zombies; no port conflicts. "clean tmp" |

## Web Universal

The theme is the single universal interface: web, TV, Android/iOS via Capacitor, extension, desktop, tablet, static deploys. One interface, one design.

| Trigger/Topic/Item/Layer/Aspect/Mode/Folder/File | Purpose/Detail/Rule/Example |
|--------|--------|
| App self-mount | Entry. `App.tsx` handles mounting and dynamic routing WITHOUT `main.tsx`; no duplicated files in the theme. "self-mount" |
| Root is dry | Flow. theme logic imports from the root library; general logic lives at root; the root carries no hardcode; the theme loads customizations. "dry root" |
| Responsive by orientation | Layout. landscape is TV/desktop/notebook/landscape-tablet, portrait is phone/portrait-tablet, always combined with width, height and density; never a divergent native UI. "orientation" |
| Theme change is route | Nav. theme change is a route change; no default button in UI; reset option; theme editable client-side. "theme route" |
| Viewer container | Viewer. the viewer is a container with a full virtual environment; DevTools integrated in the same instance; view modal opens isolated on double-click; raw-data and compile/render modes restored. "viewer" |
| Copy modes | Clipboard. reproduce mode copies the image; raw-data mode copies the code. "copy modes" |
| Mini-app windows | Windows. apps open as popup first, expandable; windows persistent; each mini-app an independent resizable window; no frame-in-frame nesting. "popups" |
| Infinite canvas | Workspace. global infinite canvas instance with side-by-side apps; default renamable workspace; multiple simultaneous workspaces; unique ID per workspace and per change; drag-drop between workspaces; layers inside layers; layer manager equals workspace manager equals file manager; persists to browser memory; undo/redo. "canvas" |
| Interlinked instances | Coherence. omniscient global view, omnipresent component presence, and management instances interlinked with real-time coherence. "instances" |
| Web security | Safety. scrypt/PBKDF2 hashing, HttpOnly plus SameSite cookies, strict CSP with external `.js` instead of inline scripts. "web sec" |

## Design System

Direct rules for clean, firm, agile screens, adapted to the flat root-first architecture. Premium level, never generic.

| Trigger/Topic/Item/Layer/Aspect/Mode/Folder/File | Purpose/Detail/Rule/Example |
|--------|--------|
| Text and boxes | UI fit. fit line to box limit; no loose gaps or leftovers without physical function; fonts by parent block size; line height and fonts based on parent; handle line breaks to avoid visual errors. "label in box" |
| Scale and grid | UI grid. fixed margins/grid; no fake logs, logical data, or graphic dust; show only what has real, direct practical use; symmetric. "aligned grid" |
| Response and clicks | UI input. 44px touch minimum (56px buttons); fast hover; quick text scramble transition when reading data; fast visual cut to switch screens without lag. "44px target" |
| Dark first | Tokens. dark-first premium; vivid gradients preferred; no purple leftovers, no white dots, no vignette, no spacer bars, no black icon borders in light mode. "dark first" |
| Global background | Tokens. one unified global background replaces all backgrounds; redefine spacing, CSS variables, dimensions. "one bg" |
| Icon central | Icons. one central icon repository for all apps; dark keeps glass with multicolor gradient, light drops glass and black borders. "icons" |
| Universal toggle | Controls. one universal toggle component imported by all; remove per-app duplicate toggles; global-apply toggle everywhere except layer management. "toggle" |
| TopDock | Dock. compact, no fixed background, draggable; 8 initial icons expanding to 30/40/60; unified animated expansion; direction follows position. "dock" |
| Motion | Motion. subtle fast micro-animations with consistent easing; animate transform and opacity on GPU only; respect reduced motion and contrast. "motion" |
| A11y contrast | Access. WCAG AA contrast; never color-only signals; visible focus; relative font sizes. "a11y" |
| Perf budget | Perf. lazy-load heavy libs; limit glass layers per viewport; backdrop-filter fallbacks; offscreen content-visibility; batched storage writes. "perf" |

## Security

| Trigger/Topic/Item/Layer/Aspect/Mode/Folder/File | Purpose/Detail/Rule/Example |
|--------|--------|
| Fix at source | Duty. resolve ALL security and workflow problems before done; alerts closed with real fix at the source or documented family-policy dismissal. "source fix" |
| Ignore hygiene | Files. ignore files never exclude what the Dockerfile copies; `.db` never committed; downloads verified by runner-generated hash. "ignore" |
| Anti-hardcode | Code. zero platform paths, zero hardcoded endpoints in the library (host is a runtime parameter), zero inline tokens. "no hardcode" |
| Secure random | Crypto. `node:crypto`, never `Math.random` for security. "crypto" |
| Sanitize input | Web. sanitize all user input before render; URL allowlist; file-type by magic bytes; size caps; schema-validate channels; rate-limit chat; encrypt sensitive storage; security headers plus strict CSP. "sanitize" |
| Auth storage | Sessions. strong password hashing with per-user salt; session tokens stored hashed with HttpOnly SameSite Strict cookies; registration and login rate limits. "sessions" |
| No secrets in repo | Hygiene. never commit keys, envs, or credentials; block secret extensions in ignore files. "no secrets" |
| Hidden sourcemaps | Build. sourcemaps hidden or off, never public; verify post-build; no `node_modules` copies. "hidden maps" |

## Agent Doctrine

| Trigger/Topic/Item/Layer/Aspect/Mode/Folder/File | Purpose/Detail/Rule/Example |
|--------|--------|
| Waves with verification | Execute. delegate subagents in waves for reading, analysis, auditing and execution, with verification each wave. "waves" |
| Parallel during waits | Flow. work in parallel during authorization, heavy builds and workflows; never end the message during login polling. "parallel" |
| Imposed sequence | Order. auth, then commit plus push, then monitor checks, then fix errors, then security, then next versions. "sequence" |
| Equivalence review | Review. every final repo file passes an equivalence review: one responsibility per file, equivalents merged, names adapted; classify interface versus logic by reading interiors. "review" |
| Future in domains | Plan. never commit literalism: integrate future logic into correct domains; no dumped-idea files. "domains" |
| Real terminology | Naming. zero fake terminology; legitimate virtualization names only. "real names" |
| Research depth | Research. correct stale claims by live research across languages, years, forums, papers, archives and code hosts. "deep research" |
| Live specs | Catalog. hardware and version claims only from real specs with sources, validated in CI. "live specs" |
| Stress proof | Proof. prove with stress numbers: scale, quota, latency percentiles, reboot restores, fuzz without crash. "stress" |
| No scope creep | Mandate. never modify family reference repos beyond the specific mandate. "mandate" |
| Lossless merge | Merge. no feature, file, doc, workflow, test, or asset lost from any merged repo. "no loss" |
| Done state | Done. all workflows green, panels 0/0/0, release published, PRs and branches archived, only main, worklog closed. "done" |

## Verdict Engine

The verdict engine judges cases the Jev way (state plus questions) over any provider, self-hosted, with public calibration. Verdict lives in `devthink`; entry and gateway go through `argan`; memory is N1/N2/N3; one database per person. Hardcode lives ONLY in the theme.

| Trigger/Topic/Item/Layer/Aspect/Mode/Folder/File | Purpose/Detail/Rule/Example |
|--------|--------|
| Same signature | API. `verdict.ts` exposes the Jev signature over ANY provider via `adapters/`; switching provider is switching config, zero code. "any provider" |
| Free porter | Cost. an ordered ruler list resolves 80 to 90 percent at zero cost before any model call. "porter" |
| Photocopy | Cache. hash of state plus questions is the key; hits return stored verdicts; never pay twice. "cache" |
| Ask everything | Trips. fan out every maybe-question in one trip; prune by code path. "fan-out" |
| Risk semaphore | Act. green executes, yellow confirms, red needs a human; gray band 0.30 to 0.70 never acts; one high alert escalates. "semaphore" |
| Weighted bulletin | Rank. versioned weights combine normalized scores; change weights, not proofs. "weights" |
| Cascade | Cost. cheap tries first, narrow verifiers per field, expensive models only on residue. "cascade" |
| Evidence first | Quality. extractors build a clean folder before the judge; order matters; overlap keeps phrases whole. "evidence" |
| Guard both doors | Safety. input checks plus severity score on entry, leak and offense checks on exit. "guard" |
| Slice and sweep | Scale. split 1M into slices, judge in parallel, reduce by type. "slices" |
| Map-reduce tree | Conflict. leaves judge slices, parents resolve conflicts up to the root. "tree" |
| Retrieve and rerank | Scale. embeddings find top excerpts; the judge reads only those. "retrieve" |
| Anti-middle | Order. reorder the folder by relevance before sending; important content first and last. "order" |
| Progressive folder | Doubt. cheap reads index and summaries; expensive reads full top excerpts and may answer none qualify. "progressive" |
| Cheap summarizer | Scale. mini summarizes each slice; the judge reads summaries and reopens originals on doubt. "summarize" |
| Infinite memory | Memory. cases live in N1/N2/N3 tiers; the judge fetches excerpts on demand; every fetch becomes cache. "memory" |
| Own training | Model. distill labeled verdicts with calibration as a first-class metric; explicit unknown option; never optimize pleasing. "trainer" |
| Public curve | Trust. measure error per batch, draw the reliability curve in DB, apply temperature scaling; thresholds from data, never guesses. "curve" |
| No-know plus negation | Correct. every choice gains an explicit none-of-the-above; every yes-no runs question plus negation and downgrades joint highs. "consistency" |
| Beam three | Hierarchy. classify in a tree with three parallel paths; score by geometric product; separation over greed. "beam" |
| Anti-jag | Robust. counting, math and dates resolve in code before the judge; filter giant states; enumerated choices plus not-stated. "jagged" |
| Cost router | Cost. cheap plus retrieval first with an explicit unanswerable output; expensive fallback only on residue. "router" |
| Vote DSL | Audit. versioned judge plus verify plus vote rules with quorum in DB; executable audit, not text. "dsl" |
| Signal without logprobs | Calibrate. single-call confidence from trace (margin, agreement, grounding) even on closed providers. "signal" |
| Hardcode only in theme | Purity. the only hardcoded part is theme design calling the built library with config; zero provider branches in code. "theme only" |
| Nuclear one | Pipeline. porter, in-guard, evidence, photocopy, fan-out, jury in cascade, weights, semaphore, out-guard, save and calibrate; auditable end. "nuclear-I" |
| Nuclear two | Pipeline. nuclear-I plus slicing, tree join, progressive evidence and distillation; any size, still auditable. "nuclear-II" |
| Nuclear three | Pipeline. nuclear-II plus any-provider adapters, public curve, consistency, beam, anti-jag, cost router, signal, votes, and theme consumption via built library. "nuclear-III" |
| Build order | Order. verdict plus cache plus porter; evidence plus guard; jury plus cascade plus weights plus gates; calibration plus labels; slicers plus memory; trainer; theme playground; tests with frozen agreement and pinned A/B. "build order" |
| Verdict tests | Tests. rules at 100 percent; out-of-scope blocked; joint highs never pass; error within tolerance of floor. "verdict tests" |

## Appendix A: App Roster

| App/Engine | Objective | Context |
|--------|--------|--------|
| devthink | OS and superplatform; the system app | Absorbs devthinkos, cli-desktop, SoFlowX, akash, extension, gateway, maene; embeds owni; 35 native pages; imports video, image, 3D, audio logic from the published library; same interface on everything (CLI equals web equals TV); published in all registries |
| saddle | Sandbox and VM runner, only virtualization | Absorbs e2ugh; 3 bases (max, balanced, lite); multiple OSs and archs; own vGPU and vCPU; 3 forms: Node runtime, Docker container, registry published; manages the virtual hardware domains use |
| debonair | Audio and DAW | Isolated marketing app; houses the katexis engine at root; imports gateway, AI, workflow from devthink and versawase from cadria |
| cadria | Video and image player, editor, studio | Absorbs iukka (player) and create (editor); houses the versawase engine at root; imports katexis from debonair and gateway, AI, workflow from devthink |
| stealhead | FPS game | Imports versawase from cadria and audio from debonair via library, no own engine file; game logics only |
| argan | DNS and gateway library | Zones, records, dnssec, handshake; system network library; unified DB per site |
| katexis | Audio and music engine | Lives in debonair; universal library |
| versawase | 3D, game, image, video engine | Lives in cadria; universal library |
| doo/doot | System virtual assistant | Abbreviation of doothink; each user (including doo) is an explicit sandbox |
| Packages | `@wenathlan/devthink`, `@wenathlan/saddle`, `@wenathlan/e2ugh`, `@wenathlan/maene`, `@wenathlan/extension`, `@wenathlan/gateway` | Scoped family packages; changelogs read first |

## Appendix B: Naming Method

Derive names from real technical roots of the field vocabulary, cross with dictionary search for rare words, old forms and Latin/Greek roots, then deform slightly until each sounds discovered, never invented. Base language is English, sonority first, never repeat endings, never reuse words, test every candidate in the spoken phrase. Approved: Kinetra (video editor/player, with Luminage and Parallume carried forward), Coinwright (finance), Commonroom (social for humans and agents), Mindvault/Artifact/Codex/Buildwell (libraries), Concinnia then Apertune (design), Meshara/Mesh Wire (3D), Narrara (writing), Loreweave/Lore Atlas (knowledge), Stagecircuit/Stage Circuit (workspace), Phenak/Thaum/Disselve (video). Devthink is intelligence and agents; debonair is sound and music; stealhead is games and action.

## Checklist

Before delivering architecture or code, the specialist verifies twelve points.

| Trigger/Topic/Item/Layer/Aspect/Mode/Folder/File | Purpose/Detail/Rule/Example |
|--------|--------|
| 1 | Deploy. static-only deploys; Prisma/Drizzle/MySQL2/Socket/JS; no Netlify/Vercel Functions. "no functions" |
| 2 | Open infra. never localhost; no fixed IP/port; host plus port randomized then locked; user 100 percent choice; options in DB. "random port" |
| 3 | Structure. root-first, no src, no folder inside folder; theme folders plus docs plus tests plus forge mirrors; names lowercase; English; no emoji. "no /src" |
| 4 | Architecture. three-layer root-direct; logic grouped hierarchically by context; one file one responsibility; interface pulls from root only. "grouped" |
| 5 | Library. library plus binary across modes; TypeScript first; native before external; internal memory. "multi-mode" |
| 6 | Dependencies. single manifest per language; lockstep versions; simplest robust; blend options; latest researched. "lockstep" |
| 7 | No hardcode. nothing hardcoded in code; everything parametrized or in DB; universal library with config only. "no hardcode" |
| 8 | Builds. builds, tests and hashes on GitHub computers only; single Dockerfile; tags not SHAs; clean root. "ci builds" |
| 9 | Versions. bump loop until green; immutable tags; CHANGELOG per version; panels 0/0/0. "green" |
| 10 | Design. fit text to box; strict grid; no dust; 44px touch; fast hover; premium, never generic. "44px" |
| 11 | Style. lowercase; no underscore or hyphen; camelCase code; JSDoc; third person; zero emoji; error catcher. "no emoji" |
| 12 | User. user holds full choice; account equals sandbox; self-hosted; no rigid rule forced. "user choice" |

## To-Do List

The execution list the specialist (GLM 5.3 and its subagents) follows for the operation.

| Step | Task | Done when |
|--------|--------|--------|
| 0 | Date and research. consult the current date; research latest patterns, versions, practices. | Research logged |
| 1 | Read all files. read every file start to end in segments; dedupe identical hashes first. | Full coverage |
| 2 | Map rules. consolidate every rule into this manual, grouped by theme, category, context. | Manual complete |
| 3 | Map features. plan up to 4000 features per app across versions with checklist plus tables. | Features planned |
| 4 | Read changelogs. learn the owned repos state before changing anything. | State known |
| 5 | Merge repos. lossless union into the host with metadata converted and equivalents fused. | Zero loss |
| 6 | Build interface. build apps starting from the theme pages. | Theme live |
| 7 | Build root logic. migrate entry logic to root; keep interface pulling from root. | Root live |
| 8 | Static deploy. deploy every theme target without Functions. | Deploys live |
| 9 | Single container. one Dockerfile, profile tags, registry cache. | Image published |
| 10 | Bump till green. fix, bump, push, monitor; repeat until workflows green and panels 0/0/0. | All green |
| 11 | Archive and close. PRs archived, only main, worklog closed, `/tmp` clean. | Closed |

## Appendix C: Link Library

Every link found in the source files, grouped by category. Check these when in doubt; research here before deciding.

### Operation transfers

- https://wormhole.app/PBr9Nr#tnTmwW_IGk_togIl_nuT1g
- https://wormhole.app/BWKye2#b0RkEjunCNwMllhXZraZ0g
- https://wormhole.app/Ay0ozA#pTKSPLDY2coN-koryajFhQ
- https://wormhole.app/EZl96R#cccn17R24fX2QJ-oEgHk0A
- https://wormhole.app/0vJbR7#awerMFjdw3d6EfOPjvOQKw
- https://wormhole.app/dLD23r#RI0dQubYTNd51rXvQDAoFg
- https://wormhole.app/dLKEy9#eG3TXwLwsQzyNvWnj-4P8g
- https://wormhole.app/M9EbjY#e8wlPwOb_usvu3gjgrJW2w
- https://wormhole.app/2QkoeR#AK9I88WIGbMWXYXD33xEww
- https://wormhole.app/EZB06a#f7Cca1CnefbG2aRdEEBy5Q

### Family repos and packages

- https://github.com/wenathlan/e2ugh.git
- https://github.com/wenathlan/e2ugh/actions
- https://github.com/wenathlan/e2ugh/security/code-scanning
- https://github.com/wenathlan/e2ugh/tree/main/.github/workflows
- https://github.com/wenathlan/maene/releases/tag/v2.1.0
- https://github.com/wenathlan/maene/security/code-scanning
- https://github.com/wenathlan/gateway.git
- https://github.com/wenathlan/gateway/actions
- https://github.com/wenathlan/gateway/branches
- https://github.com/wenathlan/gateway/pulls
- https://github.com/wenathlan/gateway/security/code-scanning
- https://github.com/wenathlan/extension/security/code-scanning
- https://github.com/NoeFabris/opencode-antigravity-auth
- https://github.com/iakadion/iukka
- https://iakadion.github.io/iukka/
- https://www.npmjs.com/package/@wenathlan/saddle
- https://www.npmjs.com/package/@wenathlan/maene
- https://github.com/login/device
- https://github.com/settings/tokens/new
- https://github.com/settings/applications
- https://github.com/login/device/select_account
- https://github.com/login/device/success

### Verdict engine sources

- https://docs.typesafe.ai
- https://typesafe.ai/blog
- https://systemonemodels.org
- https://learnjev.com
- https://github.com/typesafe-ai
- https://github.com/browser-use/jev-ultrafast
- https://github.com/daseinlabs/open-jev
- https://github.com/shitianfang/jev-use
- https://github.com/vlad-terin/jev-browser
- https://github.com/AbdelStark/jev-benchmarks
- https://github.com/anisselbd/jev-phishing-bench
- https://github.com/hev/reranker
- https://github.com/themsquared/jev-benchmark
- https://github.com/zhuyansen/jev-search-rerank-eval
- https://artificialanalysis.ai/
- https://artificialanalysis.ai/agents/coding
- https://internal-api.z.ai/v1
- https://api.z.ai
- https://anomalyco-opencode.mintlify.app/
- https://opencode-ai-opencode.mintlify.app/
- https://vercel.com/i/agent-harness
- https://vercel.com/i/vercel-drop-or-netlify-drop

### Design references

- https://www.awwwards.com/websites/3d/
- https://www.awwwards.com/websites/scroll/
- https://www.awwwards.com/websites/interaction/
- https://godly.website/
- https://bruno-simon.com/
- https://www.hover.dev/
- https://www.typewolf.com/
- https://motion.dev/
- https://motion.dev/docs/react
- https://motion.dev/docs/scroll
- https://motion.dev/docs/animate
- https://ui.shadcn.com/
- https://www.radix-ui.com/
- https://animista.net/
- https://threejs-journey.com/
- https://threejs.org/examples/
- https://lottiefiles.com/
- https://www.nngroup.com/articles/microinteractions/
- https://www.interaction-design.org/literature
- https://www.figma.com/best-practices
- https://m3.material.io/
- https://linear.app
- https://reflect.app
- https://ui.aceternity.com
- https://dub.co
- https://vercel.com
- https://www.framer.com
- https://stripe.com
- https://spline.design
- https://burocratik.com
- https://locomotive.ca
- https://www.cuberto.com
- https://rauno.me
- https://www.gobelins.fr
- https://tympanus.net/codrops
- https://uiverse.io
- https://www.reactbits.dev/
- https://gsap.com/docs/v3/Plugins/ScrollTrigger/
- https://gsap.com/docs/v3/GSAP/Timeline/
- https://r3f.docs.pmnd.rs/getting-started/introduction
- https://github.com/pmndrs/react-three-fiber
- https://lenis.darkroom.engineering/
- https://atroposjs.com/
- https://www.vantajs.com/
- https://biomejs.dev/schemas/2.4.10/schema.json
- https://www.npmjs.com/package/motion

### Deploy alternatives: platforms

- https://dado.cloud/
- https://trapiche.cloud/
- https://zerodeploy.dev/
- https://deploybase.eu/
- https://supadrop.host/
- https://www.supadrop.io/
- https://frost.build/
- https://demo.frost.build
- https://easypanel.io/
- https://kamal-deploy.org/
- https://www.kubero.dev/
- https://www.openfaas.com/
- https://instapods.com/
- https://seite.sh/
- https://simplystatic.com/
- https://staclo.host/
- https://upfling.host/
- https://boomurl.com/
- https://fylo.host/
- https://www.hostingraja.in/
- https://cloud.needle.tools/
- https://monsterasp.net/
- https://www.umbhost.net/
- https://www.resilio.com/resilio-connect/
- https://octopus.com/
- https://convox.com/
- https://www.cloud66.com/
- https://dada.cloud/
- https://orbit.build/
- https://sota.io/
- https://zerops.io/
- https://mogenius.com/
- https://ploi.io/
- https://dormhost.com/
- https://adios.dev/
- https://wasp.sh/cloud
- https://aws.amazon.com/apprunner/
- https://droply.host/
- https://stacktr.ee/
- https://stacktr.ee/tiiny-host-alternative
- https://temps.sh/
- https://sitesauce.app/
- https://hummingdeck.com/
- https://ditto.site/
- https://roastweb.com/
- https://heatbot.io/
- https://fumadocs.vercel.app/
- https://greentreedigital.co.uk/
- https://timeweb.com/
- https://cloud.yandex.com/en/services/storage
- https://gitverse.ru/
- https://www.geminilaunch.com/
- https://sitedropper.com/
- https://webslice.com/
- https://www.statichost.uk/
- https://deplo.build/
- https://tinidrop.com/
- https://webstudio.is/static
- https://www.surge.sh/
- https://deploy.dev/
- https://selfhost.dev/deploy/
- https://staticdeploy.io/
- https://www.deployhq.com/hosting
- https://www.umbler.com/br
- https://www.azion.com/pt-br/
- https://squarecloud.app/product
- https://www.shipstatic.com/
- https://fleek.xyz/
- https://opensourceui.in
- https://shrimply.pages.dev/
- https://guaracloud.com/
- https://guaracloud.com/en/
- https://guaracloud.com/en/docs/getting-started/introduction/
- https://guaracloud.com/en/docs/services/service-catalog/
- https://guaracloud.com/en/docs/deployments/container-runtime/
- https://guaracloud.com/docs/services/overview/
- https://guaracloud.com/docs/services/managing-services/
- https://guaracloud.com/docs/billing/overview/
- https://zerodeploy.dev/docs/cli/deploy
- https://zerodeploy.dev/compare/best-netlify-alternatives
- https://deploybase.eu/agents
- https://deploybase.eu/pricing
- https://deploybase.eu/use-cases
- https://deploybase.eu/deploy/hugo
- https://deploybase.eu/open-source
- https://deploybase.eu/deploy/sveltekit
- https://deploybase.eu/features/forms
- https://deploybase.eu/vs
- https://kinsta.com/docs/static-site-hosting/
- https://kinsta.com/blog/static-sites/
- https://kinsta.com/changelog/static-site-hosting/
- https://cloud.google.com/solutions/web-hosting
- https://supadrop.host/blog/free-static-website-hosting-guide/
- https://supadrop.host/blog/host-html-file-online-free/
- https://supadrop.host/blog/netlify-drop-vs-supadrop/
- https://blog.trapiche.cloud/blog/hospedagem-site-estatico-gratis-brasil
- https://blog.trapiche.cloud/blog/trapiche-vs-vercel
- https://blog.trapiche.cloud/blog/deploy-react-gratis-brasil
- https://www.tabnews.com.br/VictorBona/follow-up-da-guara-cloud-obrigado-pela-recepcao-respostas-as-duvidas-e-o-que-vem-agora
- https://openalternative.co/dokploy
- https://openalternative.co/affine
- https://openalternative.co/peergos
- https://openalternative.co/synara
- https://openalternative.co/compare/synara/vs/t3-code

### Deploy alternatives: research articles

- https://dev.to/openaltfinder/ditch-vercel-netlify-the-best-self-hosted-alternatives-in-2026-2f49
- https://danubedata.ro/blog/cloudflare-pages-vs-netlify-vs-vercel-static-hosting-2026
- https://danubedata.ro/blog/best-netlify-alternatives-static-site-hosting-2026
- https://www.layer3labs.io/comparisons/netlify-alternatives
- https://bootstrap.build/articles/static-website-hosting/
- https://bootstrap.build/articles/vercel-alternatives/
- https://bootstrap.build/articles/host-ai-generated-website/
- https://bootstrap.build/articles/cloudflare-pages-alternatives/
- https://bootstrap.build/articles/github-pages-alternatives/
- https://www.customjs.space/blog/serverless-static-site-hosting
- https://aibizhub.io/articles/vercel-vs-netlify-vs-cloudflare-pages-pricing-2026/
- https://gautamkhorana.com/blog/cloud-hosting-2026-vercel-netlify-cloudflare-render/
- https://clickwebstudio.com/blog/vercel-vs-netlify-cloudflare-2026
- https://operatoriq.io/blog/best-vercel-alternatives-2026/
- https://www.learncodepro.com/tutorials/mern-stack-web-development/devops-deployment-scaling/hosting-choices-vercel-netlify-heroku-render-aws-basics
- https://jesusiniesta.es/blog/best-app-deployment-platforms-2026
- https://www.codebrand.us/blog/vercel-vs-netlify-vs-cloudflare-2026/
- https://fromscratch.dev/alternatives/netlify
- https://launchadvisor.co/guides/vercel-vs-netlify-vs-render
- https://www.shipstatic.com/static-site-hosting-comparison-2026
- https://hackceleration.com/labs/alternatives/netlify-alternatives
- https://devops-daily.com/comparisons/vercel-vs-netlify-vs-cloudflare-pages
- https://tech-insider.org/vercel-vs-netlify-2026-2/
- https://upsun.com/blog/best-netlify-alternatives/
- https://getathenic.com/blog/vercel-vs-netlify-vs-railway-deployment
- https://www.mortexsolutions.com/blog/how-to-deploy-website-vercel-netlify-2026
- https://www.devtoolreviews.com/reviews/vercel-vs-netlify
- https://resources.rework.com/tools/dev-tools/best-vercel-alternatives
- https://futurepicker.com/en/vercel-alternatives-frontend-deployment-comparison-2026-en/
- https://futurepicker.com/en/vercel-alternatives-netlify-cloudflare-railway-2026-en/
- https://www.buildmvpfast.com/alternatives/netlify
- https://www.buildmvpfast.com/blog/ide-agent-operating-system-cursor-warp-claude-code-2026
- https://thesoftwarescout.com/best-vercel-alternatives-2026-6-platforms-worth-switching-to/
- https://expresstech.io/7-vercel-alternatives-in-2026-no-usage-bills/
- https://www.runxbuild.com/blog/vercel-alternative
- https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Your_first_website/Publishing_your_website
- https://learn.microsoft.com/en-us/iis/install/installing-publishing-technologies/installing-and-configuring-web-deploy-on-iis-80-or-later
- https://vercel.com/docs/deployments
- https://vercel.com/next.js/blue-green-deployments-vercel
- https://supabase.com/docs/guides/deployment
- https://microsaashq.com/saas-ideas/static-website-hosting-745
- https://hummingdeck.com/blog/host-single-html-file
- https://webslice.com/blog/serverless-launch
- https://greentreedigital.co.uk/pay-as-you-go-websites/

### Competitor repos: absorb targets (self-hosted, same-category plus alternative-category)

- https://github.com/jchanvfx/NodeGraphQt
- https://github.com/clemenssielaff/ZodiacGraph
- https://github.com/mfessenden/SceneGraph
- https://github.com/Roniasoft/NodeLink
- https://github.com/Lakr233/vphone-cli
- https://github.com/NdoleStudio/httpsms
- https://github.com/HackUnderway/SearchPhone
- https://github.com/CopilotKit/openbot
- https://github.com/CopilotKit/OpenBot
- https://github.com/CopilotKit/CopilotKit
- https://github.com/CopilotKit/OpenMuse
- https://github.com/www.copilotkit.ai/openbot
- https://github.com/www.copilotkit.ai/openmuse
- https://github.com/opensandbox-group/OpenSandbox
- https://github.com/opensandbox-group/fast-sandbox
- https://github.com/e2b-dev/E2B
- https://github.com/e2b-dev/e2b
- https://e2b.dev/docs
- https://e2b.dev/docs/sandbox/git-integration
- https://github.com/daytonaio/daytona
- https://www.daytona.io/docs/en/
- https://github.com/agent-infra/sandbox
- https://sandbox.agent-infra.com/guide/start/quick-start
- https://github.com/superradcompany/microsandbox
- https://docs.microsandbox.dev/getting-started/introduction
- https://github.com/us/den
- https://github.com/substratusai/sandboxai
- https://github.com/kubernetes-sigs/agent-sandbox
- https://github.com/google/gvisor
- https://github.com/gvisor/gvisor
- https://gvisor.dev/
- https://github.com/kata-containers/kata-containers
- https://github.com/firecracker-microvm/firecracker
- https://github.com/cloud-hypervisor/cloud-hypervisor
- https://github.com/vndee/llm-sandbox
- https://github.com/sandbox0-ai/sandbox0
- https://github.com/weaveworks/flintlock
- https://open-sandbox.ai/guides/secure-container
- https://github.com/Panniantong/Agent-Reach
- https://github.com/toeverything/AFFiNE
- https://github.com/mysteriumnetwork/node
- https://github.com/MysteriumNetwork/node
- https://github.com/cloudflare/cloudflare-os
- https://blog.cloudflare.com/cloudflare-os/
- https://github.com/cloudflare/agents
- https://github.com/cloudflare/moltworker
- https://blog.cloudflare.com/moltworker-self-hosted-ai-agent/
- https://github.com/cloudflare/kumo
- https://github.com/stanfordnlp/dspy
- https://github.com/David-Crty/databasement
- https://david-crty.github.io/databasement/
- https://github.com/databasus/databasus
- https://github.com/Oros42/IMSI-catcher
- https://github.com/electric-sql/pglite
- https://pglite.dev/docs/
- https://electric-sql.com/primitives/pglite
- https://github.com/NVIDIA/warp
- https://nvidia.github.io/warp/stable/user_guide/installation.html
- https://github.com/minio/minio
- https://github.com/libgit2/libgit2
- https://github.com/vercel-labs/vgpu
- https://vgpu.sh/
- https://vgpu.sh/docs
- https://vgpu.sh/agents.md
- https://github.com/Untrivial-ai/agent-orchestrator
- https://github.com/athasdev/athas
- https://github.com/x-cmd/x-cmd
- https://github.com/earthtojake/text-to-cad
- https://github.com/MakazhanAlpamys/Soup
- https://github.com/smartcomputer-ai/agent-os
- https://github.com/mrdoob/three.js
- https://github.com/hieunc229/mailflare
- https://github.com/amagine-ai/Amagine3D
- https://github.com/xevrion/breakscale
- https://github.com/exa-labs/exa-mcp-server
- https://github.com/zed-industries/zed
- https://github.com/pingdotgg/t3code
- https://t3.codes/
- https://github.com/Emanuele-web04/synara
- https://github.com/supabase/supabase
- https://github.com/PurpleDoubleD/locally-uncensored
- https://github.com/tailscale/tailscale
- https://github.com/tailscale/tailcat
- https://github.com/floci-io/floci
- https://github.com/playcanvas/engine
- https://github.com/freeCodeCamp/devdocs
- https://github.com/imputnet/helium
- https://github.com/comfyanonymous/ComfyUI
- https://github.com/raullenchai/Rapid-MLX
- https://github.com/caamer20/Telegram-Drive
- https://github.com/termux/termux-app
- https://github.com/termux/termux-packages
- https://github.com/termux/proot
- https://github.com/termux/proot-distro
- https://github.com/termux/termux-x11
- https://github.com/termux/glibc-packages
- https://github.com/alpbahadur/49Agents
- https://github.com/ahujasid/blender-mcp
- https://github.com/wasmerio/wasmer
- https://github.com/kernalix7/winpodx
- https://github.com/NousResearch/hermes-agent
- https://github.com/Finsys/dockhand
- https://github.com/traycerai/traycer
- https://github.com/bidyut10/opensourceui
- https://github.com/stanislav-web/OpenDoor
- https://github.com/soirihiroka/shrimply
- https://github.com/All-Hands-AI/OpenHands
- https://github.com/OpenHands/OpenHands
- https://github.com/bytedance/deer-flow
- https://github.com/langgenius/dify
- https://github.com/crewAIInc/crewAI
- https://github.com/langchain-ai/langgraph
- https://github.com/langchain-ai/langchain
- https://github.com/microsoft/autogen
- https://github.com/ag2ai/ag2
- https://github.com/mem0ai/mem0
- https://github.com/getzep/zep
- https://github.com/letta-ai/letta
- https://github.com/vllm-project/vllm
- https://github.com/ollama/ollama
- https://github.com/BerriAI/litellm
- https://github.com/deepset-ai/haystack
- https://github.com/run-llama/llama_index
- https://github.com/Unstructured-IO/unstructured
- https://github.com/chroma-core/chroma
- https://github.com/weaviate/weaviate
- https://github.com/qdrant/qdrant
- https://github.com/n8n-io/n8n
- https://github.com/temporalio/temporal
- https://github.com/PrefectHQ/prefect
- https://github.com/mendableai/firecrawl
- https://github.com/browser-use/browser-use
- https://github.com/AppFlowy-IO/AppFlowy
- https://github.com/outline/outline
- https://github.com/logseq/logseq
- https://github.com/juanfont/headscale
- https://github.com/netbirdio/netbird
- https://github.com/zerotier/ZeroTierOne
- https://github.com/slackhq/nebula
- https://github.com/seaweedfs/seaweedfs
- https://github.com/deuxfleurs-org/garage
- https://github.com/ceph/ceph
- https://github.com/go-git/go-git
- https://github.com/isomorphic-git/isomorphic-git
- https://github.com/software-mansion/TypeGPU
- https://github.com/BabylonJS/Babylon.js
- https://github.com/shadcn-ui/ui
- https://github.com/radix-ui/primitives
- https://github.com/mui/material-ui
- https://github.com/cline/cline
- https://github.com/Aider-AI/aider
- https://github.com/CadQuery/cadquery
- https://github.com/openscad/openscad
- https://github.com/FreeCAD/FreeCAD
- https://github.com/build123d/build123d
- https://github.com/unslothai/unsloth
- https://github.com/hiyouga/LLaMA-Factory
- https://github.com/docker-mailserver/docker-mailserver
- https://github.com/mailcow/mailcow-dockerized
- https://github.com/stalwartlabs/mail-server
- https://github.com/appwrite/appwrite
- https://github.com/pocketbase/pocketbase
- https://github.com/nextcloud/server
- https://github.com/filebrowser/filebrowser
- https://github.com/syncthing/syncthing
- https://github.com/rclone/rclone
- https://github.com/immich-app/immich
- https://github.com/searxng/searxng
- https://github.com/unclecode/crawl4ai
- https://github.com/donnemartin/system-design-primer
- https://github.com/bytecodealliance/wasmtime
- https://github.com/WasmEdge/WasmEdge
- https://github.com/blender/blender
- https://github.com/godotengine/godot
- https://github.com/tldraw/tldraw
- https://github.com/stablyai/orca
- https://github.com/coollabsio/coolify
- https://github.com/Dokploy/dokploy
- https://github.com/portainer/portainer
- https://github.com/FFmpeg/FFmpeg
- https://github.com/ggerganov/llama.cpp
- https://github.com/Byron/gitoxide
- https://github.com/localstack/localstack
- https://github.com/machirajusaisandeep/t3code-custom
- https://github.com/superset-sh/superset
- https://github.com/generalaction/emdash
- https://github.com/getpaseo/paseo
- https://github.com/spatie/bloom
- https://github.com/tellahq/opensession
- https://github.com/MillionSend/millionsend
- https://github.com/2dust/v2rayN
- https://github.com/warp-tech/warpgate
- https://github.com/snail007/goproxy
- https://github.com/erebe/wstunnel
- https://github.com/mubeng/mubeng
- https://github.com/headroomlabs-ai/headroom
- https://github.com/m1k1o/neko
- https://github.com/m1k1o/neko-apps
- https://github.com/pascalorg/editor
- https://github.com/immersive-web/webxr
- https://github.com/remotion-dev/remotion
- https://github.com/CapSoftware/Cap
- https://github.com/antonyshakirov/hop
- https://github.com/MrKai77/Loop
- https://github.com/MonitorControl/MonitorControl
- https://github.com/upscayl/upscayl
- https://github.com/vorssaint/vorssaint-utils
- https://github.com/ghostty-org/ghostty
- https://github.com/robbietilton/Compositor
- https://github.com/Bodila51/muse-jev-playbook
- https://github.com/pngwn/twinkleplop
- https://github.com/google/ax
- https://github.com/heygen-com/hyperframes
- https://github.com/codedbytahir/motionforge
- https://github.com/nelsonmfinda/brail
- https://github.com/elitan/frost
- https://github.com/piku/piku
- https://github.com/SamKirkland/web-deploy
- https://github.com/moghtech/komodo
- https://github.com/markdown-site/markdown-site
- https://github.com/zortos293/t3code-copilot
- https://github.com/13kparkin/Pivot
- https://github.com/aaditagrawal/t3code
- https://github.com/Konan69/t3code
- https://github.com/Konan69
- https://github.com/maria-rcks/t3libre
- https://github.com/camie-ace/KamiCode
- https://github.com/eimexdev/t3agent
- https://github.com/ReinaMacCredy/astra
- https://github.com/EclipticAxis/t3code-zh-CN
- https://github.com/JerkyTreats/t3code-omarchy
- https://github.com/JerkyTreats/t3code
- https://github.com/neovim/neovim
- https://github.com/VSCodium/vscodium
- https://github.com/vim/vim
- https://github.com/Noisemaker111/t3code-canvas
- https://github.com/JSvandijk/t3code-mobile
- https://github.com/AndreMiras/gitpop2
- https://github.com/AndreMiras/gitpop3
- https://github.com/useful-forks/useful-forks.github.io

### Competitor repos: P2P, mesh, agents research

- https://github.com/pojntfx/webnetes
- https://github.com/MetaverseJS/peercompute
- https://metaversejs.github.io/peercompute/
- https://github.com/Akilan1999/p2p-rendering-computation
- https://p2prc.akilan.io/
- https://akilan.io/projects/p2prc/
- https://github.com/LostBeard/SpawnDev.ILGPU
- https://github.com/LostBeard/SpawnDev.VoxelEngine
- https://github.com/LostBeard/SpawnDev.Codecs
- https://github.com/LostBeard/LostSpawns
- https://github.com/LostBeard
- https://github.com/TrentPierce/Shard
- https://mintlify.wiki/TrentPierce/Shard/architecture/overview
- https://www.mintlify.com/TrentPierce/Shard/introduction
- https://mintlify.wiki/TrentPierce/Shard/quickstart
- https://github.com/Nehanth/swarmllm
- https://github.com/hyperspaceai/agi
- https://github.com/Rupamthxt/Mesh-Zero
- https://github.com/Insider77Circle/DarkSwarm
- https://github.com/Hattussa-IT-Solutions/Aether
- https://github.com/antonellof/peerclaw
- https://github.com/denizumutdereli/agents-p2p-network
- https://github.com/epappas/seipients-agent-to-agent
- https://github.com/yashksaini-coder/AgentPay
- https://github.com/raihankhan-rk/AgentNet
- https://github.com/k2-network/k2-network
- https://github.com/konantgit-sys/p2p-agent-mesh
- https://github.com/satorisz9/agent-p2p
- https://github.com/one-d-wide/ygg-p2p-agent
- https://github.com/davidnichols-ops/aafp
- https://github.com/openvole/openvole
- https://github.com/Agnuxo1/OpenCLAW-P2P
- https://github.com/decent-stuff/decent-cloud
- https://github.com/subutai-io/p2p
- https://github.com/songjiayang/p2pedge
- https://github.com/tylerdsilva/P2P-Distributed-Storage
- https://github.com/lla-dane/P2P-Federated-Learning
- https://github.com/IzzyFuller/Quloud
- https://github.com/Peergos/Peergos
- https://github.com/ameba23/harddrive-party
- https://github.com/chiragsoni81245/p2p-storage
- https://github.com/piyushgarg-dev/P2PShare
- https://github.com/Kerim-Sabic/lightning-p2p
- https://github.com/perguth/peermesh
- https://github.com/sol4nki/weave
- https://github.com/ianjiteshan/ShareSYNC
- https://github.com/AchyutPatel/DataWave
- https://github.com/dpokk/p2p-sharing
- https://github.com/ktock/llmlet
- https://github.com/futureverse/future.p2p
- https://github.com/Iftimie/P2P-RPC
- https://github.com/arka816/gpu-p2p
- https://github.com/ShareDropio/sharedrop
- https://github.com/Peer5/ShareFest
- https://github.com/KizzyCode/storagep2p-swift
- https://github.com/julienc91/ezshare
- https://github.com/bugs-creator/WebP2P
- https://github.com/Ronifue/peershare
- https://github.com/danieloleary/c2c
- https://github.com/DeclanJeon/PonsWarp
- https://github.com/Onboardbase/secure-share
- https://github.com/sabarivelanganesan/p2p-data-storage
- https://github.com/OpenArchive/save-dweb-backend
- https://github.com/1ceit/fetchp2p
- https://github.com/swarajshaw/AccessLM
- https://github.com/SaharBarak/p2p-llm-network
- https://github.com/p2p-today/p2p-project
- https://github.com/lexzaiello/GoP2P
- https://github.com/moshest/p2p-index
- https://github.com/kgryte/awesome-peer-to-peer
- https://github.com/brandonhimpfen/awesome-p2p-networks
- https://github.com/retrohacker/awesome-p2p
- https://github.com/croqaz/awesome-decentralized
- https://github.com/libp2p/awesome-libp2p
- https://github.com/libp2p/libp2p
- https://github.com/libp2p/go-libp2p
- https://github.com/libp2p/js-libp2p
- https://github.com/libp2p/rust-libp2p
- https://github.com/n0-computer/iroh
- https://www.iroh.computer/
- https://github.com/holepunchto/hypercore
- https://github.com/holepunchto/hyperswarm
- https://github.com/ipfs/kubo
- https://github.com/ipfs/ipfs
- https://github.com/webtorrent/webtorrent
- https://github.com/yggdrasil-network/yggdrasil-go
- https://github.com/freenet/freenet-core
- https://github.com/i2p/i2p.i2p
- https://github.com/n2n-io/n2n
- https://github.com/schollz/croc
- https://github.com/dmotz/trystero
- https://github.com/pojntfx/weron
- https://github.com/libercoder/peertap
- https://github.com/tomvaneyck/p2p-mesh-network
- https://github.com/GamePad64/p2pnet
- https://github.com/alifarazz/N2P
- https://github.com/metanet/p2p
- https://github.com/Dan-J-D/wgmesh
- https://github.com/brendoncarroll/go-p2p
- https://github.com/PeerPigeon/PeerPigeon
- https://github.com/worldveil/peerchat
- https://github.com/RingsNetwork/rings
- https://github.com/olincollege/p2p-networking
- https://github.com/zarah-s/p2p
- https://github.com/xAlisher/peers
- https://github.com/bgraudt/murmuration
- https://github.com/borisgraudt/murmuration
- https://github.com/number571/go-peer
- https://github.com/tripped/mesh
- https://github.com/pairmesh/pairmesh
- https://github.com/samuelmaddock/swarm-peer-server
- https://github.com/Mesh-P2P/Mesh
- https://github.com/Mesh-P2P/Meshenger
- https://github.com/Fayob/p2p-chat
- https://github.com/Revertron/Yggdrasil-ng
- https://github.com/Avarok-Cybersecurity/Citadel-Protocol
- https://github.com/MostroP2P/mostro
- https://github.com/qaul/qaul.net
- https://github.com/nextgraph-org/nextgraph-rs
- https://github.com/gkbrk/smolmesh2
- https://github.com/bsv-blockchain/go-p2p
- https://github.com/ethresearch/sharding-p2p-poc
- https://github.com/pearl-research-labs/pearl
- https://github.com/FractalFuryan/ai-mesh
- https://github.com/meshenger-app/meshenger-android
- https://github.com/ramonaharrison/meshNYC
- https://github.com/costinm/dmesh
- https://github.com/costinm/dmesh-l2
- https://github.com/koneb71/meshchat
- https://github.com/SilentFURY-x/PeerConnect-App
- https://github.com/LinYaoTian/P2PChat
- https://github.com/OtterPeer/otter-peer
- https://github.com/MeshBase
- https://github.com/jtwolfe/MyMesh
- https://github.com/hugoArregui/p2p-mesh
- https://github.com/allenpeng0705/EnvoyMesh
- https://github.com/BARGHEST-ngo/MESH
- https://github.com/Zane96/P2P_UDP
- https://github.com/Breakend/echo
- https://github.com/Sujeet2007/SOS-p2p
- https://github.com/happy-fox-devs/mesh-lan-intercom
- https://github.com/codebutler/meshwork
- https://github.com/Astervia/proximity-internet-mesh
- https://github.com/redstone-md/moss
- https://github.com/redbco/mesh-core
- https://github.com/calvin-pietersen/gossip-mesh
- https://github.com/sparrow-platform/sparrow-mesh
- https://github.com/WorldTreeNetwork/lightning-mesh
- https://github.com/mudler/edgevpn
- https://github.com/meshtastic/firmware
- https://github.com/moarpepes/awesome-mesh
- https://github.com/nordicsemi/Kotlin-Mesh-Library
- https://github.com/0xProject/0x-mesh
- https://github.com/0xproject/0x-mesh
- https://github.com/nasa/meshNetwork
- https://github.com/pearopen/examples-p2p-mobile
- https://github.com/qadeer-cyber/TharMesh
- https://github.com/Tribler/app-to-app-communicator
- https://github.com/plainhub/plain-app
- https://github.com/w3-engineers/telemesh
- https://github.com/fwcd/distributed-chat
- https://github.com/nemke82/meshguard
- https://github.com/weaveworks/mesh
- https://github.com/meshcore-dev/MeshCore
- https://github.com/Oxule/Aura
- https://github.com/isaactzab/p2p-communication-framework-for-android
- https://github.com/denizetkar/walkie-talkie-app
- https://github.com/meshwave65/P2PTestbed-Android
- https://www.webgpu.com/tag/p2p/
- https://www.webgpu.com/showcase/browser-ai-llms-share-gpu-compute/
- https://www.w3.org/TR/webgpu/
- https://gpuweb.github.io/gpuweb/explainer/
- https://pur4v.github.io/p2ptokens/
- https://docs.hetu.org/parallel-net/p2p-network-guide
- https://felicitas.pojtinger.com/
- https://genosdb.com/webgpu-planet
- https://genosdb.com/dcode-p2p-collaborative-code-editor-no-server
- https://localaiops.com/posts/turn-idle-gpus-into-p2p-ai-grid-with-go-binary-tools/
- https://p2pcloud.io/docs/blog/what-is-p2p-cloud/
- https://www.hivenet.com/post/technology-peer-to-peer-file-systems-how-does-it-work
- https://tecnoblog.net/responde/o-que-e-p2p-entenda-como-funciona-o-modelo-de-rede-usado-em-torrents/
- https://www.computerworld.com/article/1720038/these-p2p-blockchain-based-services-want-your-computer-and-theyll-pay-you.html
- https://finst.com/pt/learn/articles/peer-to-peer-explained
- https://link.springer.com/chapter/10.1007/978-3-031-61014-1_9
- https://www.scitepress.org/Papers/2020/93431/93431.pdf
- https://thedefiant.io/news/research-and-opinion/the-death-of-cloud-complexity-begins-in-your-browser
- https://librats.com/
- https://learn.microsoft.com/en-us/archive/msdn-magazine/2001/february/net-p2p-writing-peer-to-peer-networked-apps-with-the-microsoft-net-framework
- https://medium.com/@visrow/building-p2p-ai-agents-with-webgpu-and-webrtc-live-demo-a49cf80596bf
- https://medium.com/@sameermatoria/i-turned-github-into-a-personal-cloud-drive-and-it-actually-works-8cc8e48cbf77
- https://dev.to/avinash_s_karanth/p2p-ai-distributed-peer-to-peer-ai-inference-network-f38
- https://dev.to/lostbeard/distributed-gpu-compute-across-devices-in-c-on-browser-and-desktop-1jon
- https://dev.to/lostbeard/me-tell-me-about-lostbeard-githubcomlostbeard-l68
- https://www.reddit.com/r/singularity/comments/1qwlbv0/ai_grid_run_llms_in_your_browser_share_gpu/
- https://www.reddit.com/r/LocalLLaMA/comments/1qwlcr4/ai_grid_run_llms_in_your_browser_share_gpu/
- https://www.reddit.com/r/MachineLearning/comments/1r6t0wk/p_i_built_a_distributed_p2p_ai_inference_network/
- https://news.ycombinator.com/item?id=47042729
- https://news.ycombinator.com/item?id=48533104
- https://news.ycombinator.com/item?id=47416077
- https://news.ycombinator.com/item?id=49672947

### Agent harness research

- https://www.harnesses.sh/?license=open-source
- https://www.harnesses.sh/?license=proprietary
- https://arize.com/blog/own-the-loop-field-guide-agent-harnesses/
- https://www.infoworld.com/article/3617664/surveying-the-llm-application-framework-landscape.html
- https://csuite.so/blog/ai-coding-tool-landscape
- https://blog.prompt20.com/posts/ai-coding-agents-ultimate-guide/
- https://cheatsheets.davidveksler.com/ai-coding-agents-compared.html
- https://codingclutch.com/ai-coding-assistants-compared-2026/
- https://www.developersdigest.tech/blog/what-is-an-ai-coding-agent-2026
- https://northflank.com/blog/opensandbox-alternatives
- https://northflank.com/blog/firecracker-vs-gvisor
- https://www.pandastack.ai/blog/best-open-source-code-sandboxes/
- https://www.pandastack.ai/blog/firecracker-vs-kata-vs-gvisor/
- https://wavect.io/blog/opensandbox-ai-agent-sandbox-review/
- https://engine.build/lab/agent-sandboxes
- https://www.turingpost.com/p/computer-use-ai-agents
- https://fazm.ai/blog/best-open-source-ai-computer-use-agent-2026
- https://www.ayautomate.com/blog/best-open-source-ai-agents-2026
- https://web.archive.org/web/20260620000000/https:/t3.codes/
- https://betterstack.com/community/guides/ai/t3-code/
- https://help.github.com/articles/listing-the-forks-of-a-repository/
- https://andremiras.github.io/gitpop3/
- https://gitpop2.vercel.app/
- https://useful-forks.github.io/
- https://findarepo.com/
- https://gitranks.com/
- https://githubawesome.com/
- https://starmapper.bruniaux.com/
- https://gitrelated.com/
- https://openma.dev/
- https://opensourceagent.net/
- https://webpeel.dev/
- https://www.socialcrawl.dev/
- https://smssync.ushahidi.com/
- https://alternativeto.net/software/httpsms/about/
- https://www.node-link.net/
- https://henningscheufler.github.io/pynodewidget/
- https://getutm.app/
- https://sandboxd.io/
- https://microsandbox.dev/
- https://cursor.com/help/ai-features/coding-agents.md

### Social posts and shares

- https://x.com/elijahmuraoka_/status/2089785071775387897
- https://x.com/theo/status/2084407973561196802
- https://x.com/theo/status/2092455706582499815
- https://x.com/theo/status/2092941730517746149
- https://x.com/theo/status/2093472431034044680
- https://x.com/theo/status/2076805395562287287
- https://x.com/theo/status/2038501745274565067
- https://x.com/theo/status/2044710197114097922
- https://x.com/theo/status/2049199261104140667
- https://x.com/theo/status/2089812034573815925
- https://x.com/theo/status/2084197114348028281
- https://x.com/sandepMachiraju/status/2085705708528636189
- https://x.com/sandepMachiraju/status/2087912237185061247
- https://x.com/trySynara/status/2086527939038863826
- https://x.com/trySynara/status/2084076280694153642
- https://x.com/emanueledpt/status/2086406381255397619
- https://x.com/emanueledpt/status/2076309459589116168
- https://x.com/emanueledpt/status/2081160604920787052
- https://x.com/jullerino/status/2084635331979088149
- https://x.com/jullerino/status/2084605257456177246
- https://x.com/jullerino/status/2085502198138433851
- https://x.com/trySynara
- https://x.com/emanueledpt
- https://github.blog/news-insights/company-news/an-update-on-github-availability/
- https://github.blog/news-insights/company-news/github-availability-report-may-2025/
- https://www.githubstatus.com/incidents/cg3wwz9dw5dg
- https://www.itpro.com/software/development/the-github-outage-explained-what-happened-who-was-affected-and-how-long-did-it-last
- https://www.itpro.com/software/development/github-outage-blamed-on-misconfigured-policy-as-firm-pledged-resilience-improvements
- https://grok.com/share/bGVnYWN5LWNvcHk_ef7e2a96-04bc-42c6-a616-a3ff06f916fc
- https://grok.com/share/bGVnYWN5LWNvcHk_73e5597b-d2e6-4158-a06b-10c5e5002879
- https://grok.com/share/bGVnYWN5LWNvcHk_382fc76a-5f86-4ffc-bac4-a8f82b95602c
- https://grok.com/share/bGVnYWN5LWNvcHk_694daf05-1eb3-406d-99eb-9f0719e2f527
- https://duck.ai
- https://duckduckgo.com/duckai/privacy-terms

### Engines, 3D and misc research

- https://github.com/ahujasid/mcp-for-blender
- https://engine.needle.tools/docs/ai/needle-mcp-server.html
- https://engine.needle.tools/docs/ai/needle-mcp-server.html#stdio
- https://github.com/DLR-RM/BlenderProc
- https://www.blender.org/lab/mcp-server/
- https://www.npmjs.com/~herbst
- https://www.npmjs.com/~marwi123
- https://viewer.needle.tools/
- https://chromewebstore.google.com/detail/needle-inspector-%E2%80%94-devtoo/jonplpbnhmanoekkgcepnedhghflblmo
- https://engine.needle.tools/docs/three/
- https://mesh-baker.needle.tools/
- https://usd-viewer.needle.tools/
- https://github.com/ArcticWinterSturm/opencode-compat-shim
- https://www.4shared.com/folder/1JpWuh6-/etc.html
- https://www.4shared.com/folder/ceDXoBA9/opt.html
- https://www.4shared.com/folder/9oyHovwD/sbin.html
- https://www.infoworld.com/article/4154031/local-first-browser-data-gets-real.html
- https://expo.dev/
- https://reactnative.dev/
- https://capacitorjs.com/
- https://tauri.app/
- https://www.npmjs.com/package/expo
- https://www.npmjs.com/package/@capacitor/core
- https://pypi.org/project/Kivy/
- https://www.assemblyscript.org/
- https://ckeditor.com/docs/ckeditor5/latest
- https://github.com/atlassian/react-beautiful-dnd
- https://github.com/request/request/issues/3142
- https://support.google.com/adsense/answer/7584263?hl=pt-BR
- https://support.google.com/adsense/answer/161351
- https://support.google.com/adsense/answer/10532
- https://support.google.com/adsense/answer/10961068
- https://support.google.com/adsense/answer/10924669
- https://support.google.com/adsense/answer/13554116
- https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8438553694808950
- https://cdn.ampproject.org/v0/amp-auto-ads-0.1.js
- https://a.magsrv.com/ad-provider.js
- https://s.magsrv.com
- https://actions.google.com/sounds/v1/alarms/beep_short.ogg
- https://soodesk.space.z.ai/api/ai-service

## Appendix D: Source Notes

Identical-hash copies were read once: 16 copies of the base voice rules, 8 copies of the older voice variant, 4 copies of `conversa agora`, 5 copies of `operacao`, 3 copies of `concorrentes`, 3 copies of `quasedefinicao`, 2 copies of `memoria.storage`, 2 copies of `definindo nomes`, 2 copies of `quase um contexto`, 2 copies of `MAPA-COMPLETO`, 2 copies of `package.10.descricoes`, plus reference config duplicates. Unique variants kept: `regras (6).txt`, `regras (13).txt`, `ARVORE-COMPLETA (2).md`, `ALTERNATIVA-AO-JEV (2).md`, `operacao.txt` versus the longer `operacao (2).txt` group. Generated artifacts (`package.10 (10).json`, `package.10.case.md`, `package.10.descricoes`, `package.10.repos`) are cited, not duplicated. Reference code specimens (`antigas/`, `js/`, `json/`, `ts/`, `yml/` and config folders) are recorded by purpose, not content.
