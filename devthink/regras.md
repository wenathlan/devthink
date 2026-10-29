# regras.md — the owner rules, hierarchical

Source: C:\allan2\devthink\StealHead\docs\StealHead\md\session7-so-user.txt (USER section, lines 1–1106, Sep 28 → Oct 18 2026), read in segments via sed. The raw map per segment lives in regras.mapa.md. The rules stay above; examples and states enter as a separate "for example".

## 1. General rules

The platform is a super platform, a direct competitor of Windows 10, Windows 11, Brave, Chrome, Codex, ChatGPT, OpenAI, Anthropic, ZAI, Google, Grok, T3, OpenCode, Supabase, Cloudflare, E2B and of every agent harness. DevThink is the complete os that hosts applications, and the other applications of the family are applications, never an os. Every feature of the competitors enters as our own feature, translated into applications inside the theme. All communication rides HTTPS and mimetypes, nothing touches the user's physical hardware (GPU, CPU, vGPU, vCPU, IndexedDB, localStorage, storage), the only thing that loads on their machine is the interface, and all processing and storage happen on our domains and engines.

| Rule | Content |
| --- | --- |
| Identity | Continue with DevThink; one single login on every site of the family; shared DBs |
| Domain fallback | devthink.pro down → redirects to the clones (Netlify, lifetime Vercel); the universal template serves any deploy |
| No captcha | The platform is free, no captcha |
| User permissions | Create teams, groups, users, virtual AIs, MCPs, APIs, sites, components; the system AI is universal; free, pro, enterprise (sponsor) hierarchy + donations |
| Opt-in | Everything configurable: LLM, sandbox, memory, GPU, CPU, threads, cores, themes (create, mix, import, export), keys, hostings; defaults hardcoded but customizable |
| Universal library | Logic at the root without hardcoding, distributed on npm, maven, containers, with a Spring Boot module; anyone uses and adapts it |

## 2. Design

The DevThink design is the fusion of Windows 10 and Windows 11 with trylle.com, and it is the only app with an os design. The other applications carry the application design, Apple Silicon standard, Awards Design, Webflow, pure trylle.com, at the level of the web index.html. The design is universal for web, TV, desktop, CLI, binary, extension and APK: only the aspect ratio changes (tablet, notebook and PC are horizontal, phone vertical), DPI, responsiveness and the build method. The current DevThink design is rejected: redo and rewrite from zero, without recycling, with beautiful animated icons, the same Windows interactions, animations and positions, rounded borders (no pill), floating start menu, floating elements, no dots, no hyphens, no verbosity, no amateur fonts, no generic purple or blue of vibe code, no neon, no brown gray, no rigid grid on the desktop, with shadows, glass effects and professional curves, professional textures and token recipes, defined dark and light, careful scroll and micro and macro animations everywhere, including the logo animation in the style of cline.bot and the icon fusion of the nineteen libraries (Iconic, Phosphor, Hero, Feather, Meteor, Material, Basicons, Flowbite, Nonicons, Sargam, Lucide, Mage, Fluent UI, Tabler, Iconoir, Hugeicons, MynaUI, Remix Icon, Radix Icons).

| Rule | Content |
| --- | --- |
| References | C:\allan\docs\neodevthink, neodocs\lookup.exdevthink, neodocs\outros.akash, neoskills, neoimg, web index.html, exemplo.txt, repositories.md, designeer.md, competitors cloned in C:\allan\docs\temp |
| Top bar | Windows style: applications pinned by icon, name only on hover |
| Start menu | Opens on the DevThink icon click (logo in front, no name), floating, no start button |
| Icons | Animated, three layers (paths, outline, inner background with a moving gradient), optional outer background |
| Windows | Every application opens in a Windows-like window, minimize, maximize, close; hover at the top of the screen shows the controls |
| No Lucide React | Forbidden; own, modern design |
| Taskbar | Clicking the logo opens the pinned box with Windows interaction, no undue highlight in the search box |
| Texts | Short, direct, clear; no dots, no "hover over", no "click the gear", no emojis |
| All in english | Translation only when the person changes the language in the settings, via the Google GTX API (translate.js) |

## 3. Screen flow

There are two intros and one single sequence. The web intro is the presentation page of the index.html, an institutional SaaS face, and the intro of the binary, the extension and the distribution is the same as the web. After the intro comes the clock screen with landscape, the Android-style lock screen where the person swipes up, the modern Windows-style login screen (profile, name, password), and last the panel. In the build compiled for binary or ISO the sequence is the Windows one: animated logo loading, landscape, lock, login, application start screen. The user saves credential and password in the DB on first use, no fake data.

| Stage | Web | Binary, ISO, extension, APK |
| --- | --- | --- |
| 1 | SaaS intro of the index.html | Animated logo loading |
| 2 | Click the bell → os login screen | Clock screen with landscape |
| 3 | Panel | Lock (swipe up), Windows login |
| 4 | — | Application start screen |

## 4. Architecture

The application folder carries the theme folder (Sol, name changeable), docs and tests, and nothing else: no src (Next template exception), no public, dist, assets, ui, build, deploy, db, data, prisma. The build happens at the root, over itself, on the GitHub machines. The general anchor is the App.tsx at the root, which imports the theme anchor, the sol.tsx inside the theme beside the sol.css; the sol.tsx imports the sub-anchors of each folder; the sub-anchor carries the folder's own name (settings.tsx inside settings) and imports the components of its own folder; always with an export at the end. Inside sol each folder is an application or page, no subfolder inside subfolder, no apps folder, no components folder: the component lives in the folder of the page it belongs to, or arrives imported from another folder adjusted to the context. The only TSX outside the theme is the App.tsx. The general logics live at the application root, before the theme, written in pure TypeScript, three hundred or nine hundred correlated logics grouped per file by responsibility, in hierarchical, linear, progressive and synchronized blocks, commented with hashtag, JSDoc 2026, everything lowercase, names with a dot instead of a hyphen (auth.ts, clean.url.ts), unique and short keywords, and the interface-specific logics live inside the theme. One CSS per theme, the sol.css, inside the theme; the index.html is the only HTML of the root; 404, terms and policies are TSX components compiled by the workflow.

| Rule | Content |
| --- | --- |
| Mandatory root files | redirects, robots.txt, keywords.txt, manifest.json, manifest.webmanifest, .npmrc, .nvmrc, .gitignore, .gitattributes, .dockerignore, biome.json, tsconfig, vercel.json, netlify.toml, wrangler, devthink.toml, prisma schema at the root, identical package.json in all |
| Forbidden folders | src (except Next), public, dist, assets, ui, build, deploy, db, data, prisma, components, apps, os |
| Workflows | YML inside .github/workflows, grouped by function (publishing, maintenance, next conversion), stages applied app by app, Saddle last; no hardcoded sha256; no paid workflows; immutable release with checksum |
| Releases | One DevThink tag and release with ~200 assets (iso, vsix, exe, dmg, deb, rpm, AppImage, ipa, apk, zip, next), maximum tar.xz + Brotli; delete tags, releases and npm packages of the other apps; next versions in <app>.next personalized, 50, zai, normal |
| Next conversion | The workflow converts the no-src pattern into the next formats and uploads it compressed in the assets, no duplicated folder |
| 2026 configs | Every dependency, devDependency and configuration file on the latest version, 2026 patterns and syntax, bump until all green |
| Domain | Never hardcode a domain in a sitemap, robots or code |

## 5. Data and storage

The DB is the virtual repo: it stores code, assets and information exactly like the repository, and it is where every hardcode happens. No component, engine or workflow hardcodes information; text, information, emoji, images and links are ingested into the DB and pulled by fetch, with markers in the component pointing to the table and the item, and the static build answers from an in-memory seed module, without writing browser storage. The storage stack is Git LFS with git objects and blobs inside the DBs, libgit2, Drizzle ORM, Prisma Schema, MySQL2, Better SQLite3 and JSON, everything in one unified logic, in the pattern of the db.ts, sandbox.ts, compiler.ts and ingest.ts files of the StealHead reference. The prisma schema stays at the root, no prisma folder, and the SQL tables are synchronized across all applications, with the same fields and pointers, BigInt for terabytes. Every user has their own DB, the DBs are treated as HDs inside the system, and the user creates new HDs in the settings. The DBs are encrypted, the APIs only answer to authorized sites registered by the owner, and accessing DevTools logs the IP and blocks the person on every site, blank sites, even with a VPN.

| Rule | Content |
| --- | --- |
| No Supabase | Own self-hosted infra, no limits |
| Sandbox | Twenty to thirty modalities: runtime via Wasm, Babel, Node, Bun, Deno and the engines; complete via Saddle with drivers and virtual CPU, GPU, light, max, balanced profiles; VFS sustained by Prisma and Git; via CDN (esm.sh and the forty-five CDNs) |
| Saddle | It is the E2B-like sandbox project, the Rune engine, runs any binary and sandbox, Docker containers and GHCR; Foundry is the E2B and Docker clone (interface and settings, engine in Saddle); Vault is the Supabase clone and the storage library everyone imports; Getry is the gateway (Next adaptation for the Z.ai deploy and plain next, bypass and Z.ai versions) |
| Cadria | VersaWaze engine, the 3D, image, video and animation motor, Blender, Remotion, DaVinci, After Effects, Gemini image, Veo references |
| Debonair | Suno-like audio and music engine, music studio |
| Imports | No duplicated logic: the app that needs image imports Cadria, audio imports Debonair, sandbox imports Saddle, storage imports Vault; DevThink joins all importing from them |
| Stealthhead | Pre-compiled FPS game (shaders and assets ready, verified hash), never compiles on the visitor's machine, only navigation to move |
| Cobaia | Monetization clone site (Google Ads, MRR, conversion, plans): clicks from the main sites redirect invisibly to it, which closes ads; main sites clean; it also runs an automation bot to sustain the domains |

## 6. Routes and interaction (GitHub Pages state)

The published DevThink routes are broken and follow the /app name rule. The panel route switches between the application box and the panel, alternating on its own; strange routes like w/l_id/s/l_id/t/l_id/chat appear where it should be /chat, because that belongs to the chat application; clicking Cadria, Debonair, Argan, Forge, Vault or Saddle must go to devthink/app name and open INSIDE the DevThink window, with the same interface, and today it exits to the wrong design; the os folder exists inside devthink and should not exist, everything in it goes into adapted sol and it is deleted; the panel exists but does not appear in the application grid; the panel screen goes black and psychedelic; the login box is bad; the native applications (video, image, audio, calculator, docs, chat, about, intro, onboarding, exploring) need to be redone from zero and equal to each other; the original logo text of the web intro returned in place of the thick text.

## 7. Operation

The operation is by reading segments with sed from line X to Y in the terminal, never with the file reading tool, up to six thousand lines per cut depending on the size, and subagents two or three at a time, launching the next one as soon as one ends, with the owner authorizing via pull auth with git commands when needed. Everything is read hierarchically, linearly, top to bottom, with beginning, middle and end, a to-do list per theme with subderivations up to one hundred steps each, and the test verifiers run first: tsc noEmit, biome, securities, all green before moving on. Nothing is installed inside the folders: the execution pulls from the global node_modules at C:\Users\nathalan\node_modules, the test scripts live in the tests folder of each application, written in TypeScript (cjs allowed), and the heavy builds happen on the GitHub machines. Document writing is paragraph followed by table, always ending in a table, without quoting a document or read line, without emoji, deduplicating equal concept, context and synonym, with correct spelling and grammar, professional tone in third person, and what departs from the current model enters as a previous plan, never struck through.

| Rule | Content |
| --- | --- |
| Verification | GitHub Code Security at zero; published pages truly tested (sandbox opens, chat answers, gateway works) |
| Simulation | Drive the owner's Brave in a new window, one tab at a time, open, capture, interact and close; map a site via DevTools before automating |
| Document per screen | screen.<site>.md with design, screens and interaction flow, later consolidated into screens-design.md |
| Code security | Public repository: nothing hardcoded in the code, generated in the pipelines; no hardcoded key |
