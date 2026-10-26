# Wave 1-c — Codebase Audit @ rung 2.0.150 (post-sync origin/main)

Task ID: 1-c · ANALYSIS ONLY (no repo code modified) · Repo: /home/z/my-project @ commit b475bf60 ("the 2.0.150 rung opens the registry walk to every family envelope (#79)").

Environment note (affects every "live" verdict below): the sandbox disk is **100% full** — `df -h /` = 9.8G/9.9G used, 0 avail. `/home/z/allan` (the allan clone) alone is 7.9G. Consequences measured live: `mkdir /home/z/.config` → ENOSPC; `bun server.ts serve` → "starting gateway on port 3001 / error: ENOSPC … mkdir '/home/z/.config'"; `bunx vite --port 3000` → "ENOSPC … mkdir 'devthink/node_modules/.vite-temp'". Nothing currently runs. devthink deps ARE installed (786 pkgs, `bun install` completed). Methodology note: bash stdout rendering in this sandbox strips `"[m"`-style sequences, which first looked like repo corruption ("branches: ain]", "@@index(odel])") — re-verified every suspect line with `sed 's/\[/BRK/g'` and `od -c`: **all are correct in the files** (e.g. ci.yml:23 is `branches: [main]`, schema.prisma:111 is `@@index([model])`). No such corruption exists.

---

## 1. LOGIN/AUTH SCREEN — VERDICT: REAL (server-first, declared offline fallback)

**Design (Windows 11 lock law, not a marketing card):**
- `Sol/widgets/AuthLockface.tsx:1-87` — lock face: wallpaper + clock + hint, nothing else. Clock on the LEFT (owner's law "o horário fica do lado esquerdo"), big time over date, "Swipe up to unlock" hint bottom center, full gesture surface (pointer swipe >56px, click, wheel, Enter/Space/ArrowUp).
- `Sol/widgets/AuthSignin.tsx:1-218` — sign-in face over dimmed+blurred wallpaper: centered avatar initials, `Welcome, {known}` / "Create your account", one rounded password cell with reveal-eye + arrow submit inside it, provider row (DevThink over google/github/gitlab), sign-in options disclosure with CLI pairing, back-to-clock.
- CSS kit `Sol/sol.css:11573-11900` (`dtw-login`): wallpaper = morning-sky multi-radial + linear gradient (`sol.css:11590-11608`); on `--signin` the wallpaper dims to `brightness(0.56) blur(26px)` = mica wash (`sol.css:11605-11610`); avatar `backdrop-filter: blur(10px)` acrylic; entrance on the 150ms micro curve. Light theme, fluent icons. No pink, no fake acrylic card.

**Mechanics (REAL server lane):**
- `devthink/authfamily.ts` (1676 lines) — the ONE keyed file of the auth family (merged from accountgate.ts, identity.ts, urlgate.ts, oauthrow.ts, accountlane.ts, accountclient.ts; header §1-§6). NOTE: `accountgate.ts` no longer exists — it lives on as `authfamily.ts` §1 (local browser account = declared offline fallback) and §5/§6 (server lane + browser client).
- Browser client: `createserveraccount` → POST /api/v1/accounts (authfamily.ts:1512), `signinserveraccount` → POST /api/v1/accounts/session (:1525), `exchangeoauthcodeclient` → POST /api/v1/auth/exchange (:1538), `accountsessionstate` GET (:1558), `revokeaccountsessionbearer` DELETE (:1574), `restoreonce` (:1650-1676) — all through `lanefetch` (gatewayfamily.ts:759, 10s bound, null-on-transport-failure) with `credentials: "include"`.
- Server: `devthink/server.ts:1255-1353` — create (201+session), sign-in (200+session), GET session with **rotation** (server.ts:1286-1305: live `devthinkfamily` cookie → rotated token `rotated:true`), DELETE revoke.
- Secret handling: **scryptSync** digest, 32-byte random salt per account, `timingSafeEqual` verify (authfamily.ts:1152-1207); session bearer stored server-side only as sha-256 digest; plaintext token answers once.
- Session cookie: `devthinkfamily`, `Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000` (+`Secure` on https) — server.ts:1228-1247. Session lifetime 30 days (authfamily.ts:1124).
- Store: raw SQLite `devthink-accounts.sqlite` in the data home beside the storage store, outside served roots (authfamily.ts:1067-1078); shared by a family deploy pointing the same data home → one login covers the family.
- Persistence verdict: login is **server-side persistent** — cookie survives browser restarts (rotation keeps it alive); cookie deletion/incognito → honest password re-entry restores the account (state lives server-side); visitor side holds only a disposable sessionStorage bearer cache (authfamily.ts:1459-1462: "never the canonical store"). The old browser-local account (SHA-256 digest bound to device id, authfamily.ts:71-90) remains ONLY as the declared offline fallback with the honest offline row (auth.tsx:120-167).
- OAuth callback: `Sol/callback/callback.tsx:38-66` — completes the round trip (PKCE verifier redemption via `exchangeoauthcodeclient`), honest faces: signedin / refused / offline / unknown-origin; no fake success. Client ids ride env `VITE_OAUTH_GOOGLE_ID` / `VITE_OAUTH_GITHUB_ID` / `VITE_OAUTH_GITLAB_ID`, callback base `VITE_OAUTH_CALLBACK` (default https://auth.devthink.pro/callback) — authfamily.ts:829-843; unconfigured providers render disabled, never an invented id.
- Anchor: `Sol/auth/auth.tsx:112-116` walks a returning visitor straight in via `restoreonce()`; settings revoke: `Sol/settings/settings.tsx:107-162`.
- Tests: `tests/server/accountlane.test.ts` (create/verify/refuse/duplicate/session issue-verify-revoke — 7 real tests), `tests/server/authentication.test.ts`.

## 2. INTRO/LANDING — VERDICT: REAL (redesigned; pink "Ever AI" hero is GONE)

- `Sol/intro/intro.tsx:1-82` — two faces, one interface: web targets → SaaS landing; owned targets (desktop/installer) → Windows boot (`IntroBoot.tsx`). Returning visitors skip straight to the handover (`intro.tsx:50-58`), handover = /auth (web) or /panel (owned).
- **"Ever AI" search: ZERO matches** in devthink/Sol, devthink/*.ts and all family apps (rg -i "ever ?ai" / "Build for"). The pink gradient "Build for Ever AI" hero does not exist at this rung.
- Current hero `Sol/widgets/IntroSaassections.tsx:24-51`: light `bg-[#F2F5FC]`, blurred multi-color gaussian shader band at the bottom (`hero-gaussian-shader`, IntroSaas.tsx:48), H1: "An OS ⚑ built for every AI [inline toggle switch] and your agents / and your studios", sub: "Create, stream and run every studio and AI team in one OS", tactile 3D navy CTA "Get started" (`btn-tactile-3d`, IntroSaas.tsx:35). Left vertical nav rail over the "saddle bridge" (IntroSaas.tsx:96-120). Landing ships its own scoped CSS injected once (`data-dt-saas` style tag, IntroSaas.tsx:78-91) — deliberately outside the OS token ladder.
- Landing sections: `IntroSaassections.tsx` (hero, why, workspace), `IntroSaasrails.tsx` (studio flow rails, Netflix-style deck, advisor) — see rails copy "Build 3D scenes and publish straight to Cadria" (:203).

## 3. NAMING — VERDICT: PARTIAL (dots/hyphens purged; 4 stutter remnants)

- **Dots in `devthink/Sol/**`: ZERO** (`find Sol -type f | rg '[^/]+\.[^/]+\.[^/]+$'` → empty). Also zero across argan/cadria/debonair/stealthhead/forge/foundry/vault/getry/saddle/cobaia. The 178-rename purge of rung 2.0.142 (CHANGELOG.md:44-46) held.
- **Hyphens in component files: ZERO** across all 11 apps.
- **"GatewayFamily" compound component names: ZERO.** `gatewayfamily.ts` (devthink root, 29 referencing files) is the intentional one-keyed-file-per-family doctrine (same as `authfamily.ts`, `storagefamily.ts` — CHANGELOG 2.0.148/2.0.149). Family apps do not reference it at all.
- **Stutter names remaining (devthink/Sol/widgets only):** `ImageImageengine.tsx`, `ImageImagestills.tsx`, `SettingsSettingstypes.ts`, `ShellShellchrome.tsx` — family prefix + old name stuttering the root word. Rules corpus (analysis/allan-md/rules.distilled.md G-set, commit 4457dc93 "one word english rule with the stutter dropped") says these should have been caught.
- Verdict: 4 violations; everything else clean.

## 4. MOCKED VS REAL — VERDICTS PER LANE

- **video/ — PARTIAL (honest queue, no playback/generation surface).** `Sol/video/video.tsx:1-73` + `Sol/widgets/VideoEngine.tsx` (catalog engine card: versawase owned by cadria, honest pending state) + `Sol/widgets/VideoAssets.tsx` (catalog rows: title/engine/duration + render action). Render = REAL lane call: `runner.ts:75-90` POST `${catalogbase}/studio/render` with honest refusal strings when no gateway is paired. **No `<video>` element, no playback, no in-app generation** (rg over Video*.tsx → zero matches).
- **files/ (My Files) — REAL records + REAL server storage lane; user-file writes not yet.** `Sol/files/files.tsx:1-1212` Win11 File Explorer: folders hold honest records (installed apps / docs modules / runner binaries / studio catalog rows — `fileexplorer.ts:55-70`), empty categories answer "empty folder". Capacity bar: server usage+quota when the lane is up, else `navigator.storage.estimate()` with a hatched honesty marker (files.tsx:181-217, 958). Server lane REAL: `/api/v1/storage/quota|objects(POST/GET/DELETE)|usage` (server.ts:1159-1210) over `storagefamily.ts` §2 (owner/key/content/bytes, plan-composed quota, 900MB floor, quota refusal) + 6 tests (`tests/server/storagelane.test.ts`). "New" = new drive only; "a Windows 'New folder' grammar lands with the database wave" (files.tsx:118-120) → no user file create/upload UI yet.
- **chat sandbox pane — REAL (server lane first, declared browser fallback).** `Sol/widgets/ChatSandboxpane.tsx:237-347`: boot/run try the real server lane via `sandboxboot/sandboxrun/sandboxmodalities` (gatewayfamily.ts §sandbox → /api/v1/sandbox/session|run|files|write|modalities, server.ts:1102-1157); offline → saddle browser simulator with an honest offline row declared once per session. Server side `sandboxlane.ts`: per-session jail under `.sandboxrun`, path containment, caps, real filesystem effects, honest refusals for the lanes it does not carry (sandboxlane.ts:1-13). 8 tests (`tests/server/sandboxlane.test.ts`).

## 5. SERVER — VERDICT: REAL code / dev-flow gap / env blocked

- **Routes in devthink/server.ts (5890 lines):** `/api/config` (:1008); `/api/v1/onboarding` GET+POST (:1021,1027); `/api/v1/copy` GET (:1047); `/api/v1/plan` GET+POST (:1055,1070); `/api/v1/sandbox/session|run|files|write|modalities` (:1102-1157); `/api/v1/storage/quota|objects|usage` (:1159-1210); `/api/v1/accounts` POST (:1255); `/api/v1/accounts/session` POST/GET/DELETE (:1275,1286,1313); `/api/v1/auth/exchange` POST (:1321); versioned `/v1/{keys,models,chat/completions,completions,messages,responses,embeddings}` via handlermap (:955-1361); static serve (:1373).
- **Dev wiring:** root `package.json` script `dev` = `cd devthink && bunx vite --port 3000`; vite proxy `/v1` + `/api` → `http://127.0.0.1:${GATEWAY_PORT||3001}` (vite.config.ts:181-192). The gateway itself is a separate process: `bun server.ts serve` (default 3001, server.ts:2404-2410; direct-entry guard server.ts:2612-2615). **The root dev script does NOT start the gateway** → in the default dev flow port 3000 proxies /api to a dead 3001 (the account/sandbox/storage/copy lanes all answer offline) unless `bun server.ts serve` is run by hand. E2E coverage exists (`tests/server/server.e2e.test.ts:173-330` over real http).
- **Live check now:** neither runs — ENOSPC (see header). Verdict: REAL design, BROKEN-ENV at audit time + one dev-orchestration gap.

## 6. DB — VERDICT: PARTIAL (copy served from DB; labels still seed code; accounts outside Prisma)

- Prisma: `devthink/schema.prisma` (sqlite, prisma.config.ts at root) — models: **ChatMessage** (huge interaction log), **NvidiaKey**, **TownKey**, **ApiKey**, **OnboardingState** (visitor seen flags, served at /api/v1/onboarding), **CopyRow** (key/text), **PlanState** (tier/storagemb/rammib). All indexes valid (verified bracket-safe).
- **No accounts/sessions/labels/windows/icons models** — accounts + sessions live in the raw node-sqlite store `devthink-accounts.sqlite` (authfamily.ts:1067-1078); storage objects in the storage sqlite (storagefamily.ts §2). Two persistence systems (Prisma + raw sqlite), documented but split.
- UI content from DB: **copy YES** — `copy.ts` "every user-visible string rides the database … /api/v1/copy … the seed answers the offline static build" (copy.ts:1-10) with CopyRow table; **labels NO** — `oslabels.ts:1-8` and chatlabels are typed code seeds ("the same rows answer the paired database endpoint when it comes online" — still pending); icons/windows = code registries (appregistry.ts), not DB.

## 7. WIDGETS — VERDICT: REAL (high craft, token discipline)

- `devthink/Sol/widgets/` = **101 files** (98 .tsx, 3 .ts incl. `index.ts` barrel). Every file carries a JSDoc craft header, controlled-props contracts, copy via `copy()/osText()` accessors (no hardcoded UI text in OS widgets; the Intro* SaaS kit intentionally carries its own scoped CSS + landing copy).
- `Sol/sol.css` = **19,959 lines** with the full Tailwind 4 `@theme` token ladder (sol.css:42-160): 8-step surface ladder `--color-s0 #242424 … s7 #494949`, ink ladder, hairlines via color-mix, signal silver, WINDOWS accent `--color-win #4cc2ff` (light #0067c0), close red, radius law 4/6/8/10/12/16/24, fluent shadow ladder, ease-window/micro/entry/exit curves; acrylic/mica recipes with -webkit- pairs, feTurbulence grain, win11 scrollbars, reduced-motion/transparency hard stops at file end. Token usage: **2,681 `var(--)`** references vs 376 raw hex (mostly icon gradients + landing kit).
- Raw hex in widgets outside Intro*: `ShellAppicons.tsx` (62 — the documented drawn-icon three-stop identity gradients), `ConsoleTerminalui.tsx` (34), `FilesFoldericons.tsx` (23), `ConsoleGraphview.tsx` (21), `ExploreSections/Launchdeck/AboutFamily` (~10 each) — icon/brand colors by grammar, chrome rides tokens.

## 8. WORKFLOWS — VERDICT: REAL (10 lanes, no broken references found)

- `.github/workflows/`: ci.yml (438L: CLI runtime matrix, web battery, family config parity + family test matrix `working-directory: ${{ matrix.app }}`), family-desktop.yml (356L), family-mobile.yml (501L), maintenance.yml (538L), pages.yml (383L), paths-filtered), publish.yml (4928L), release.yml (1081L, calls `./.github/workflows/verify.yml`, `needs: [metadata, verify]` etc.), security.yml (680L), verify.yml (491L), workflowlint.yml (51L). All branch filters are valid `branches: [main]` (bracket-safe verified — the "ain]" display was a rendering artifact, not file content). Actions are SHA-pinned (scorecard doctrine). None executed in this sandbox (no runner, disk full).

## 9. FAMILY DESIGN SYSTEM PARITY — VERDICT: REAL

- `argan/Sol/sol.css:1-60` and `cadria/Sol/sol.css:1-30` both declare "rebuilt on the DEVTHINK FOUNDATION (the 8-d rewrite is the family source of truth; this file carries the SAME exact values)": identical mica `#202020` radial + `[data-theme="light"]` flip, identical 8-step ladder #242424→#494949, hairlines 5%/10%, WINDOWS accent #4cc2ff governs focus/chrome, per-app identity tint confined to brand mark/content CTA/active indicator (argan jade `#34d8a8`, cadria rose `#e858c7`), same type stack (Inter Variable + Geist Mono), same motion curves, grain and guards. Parity holds.

## 10. LEFTOVER localStorage — VERDICT: preference cache only, no source-of-truth leakage

- `rg "localStorage" devthink/Sol` = **38 lines in 12 files**. What remains:
  - `SettingsPersonalstore.ts` (the house personalization store: wallpaper, accent, theme mirror, taskbar/devtools flags — one key per concern, validated loads),
  - `SettingsAccentrow/Backgroundpicker/Navbarposition.tsx` + `PanelDesktop.tsx` ("dt.desktop.icons.v1" icon positions as desktop-area percentages),
  - `ChatBody.tsx` (custom + project instructions via the house `useStoredState` hook), `ChatSidebar.tsx` (sidebar state).
- All ride `usestoredstate.ts` = "the ONE persistence mechanism of the os: localStorage plus a validating type-guard. Storage is optional" (usestoredstate.ts:1-30). Auth/data never touch localStorage (bearer in sessionStorage; accounts server-side). These are device preferences by design, not mocked truth.

---

## The 10 most urgent fixes (priority order)

1. **FREE THE DISK** — /home/z/allan clone = 7.9G of the 9.9G rootfs; the md corpus is already extracted to analysis/allan-md/. Until space is freed NOTHING runs (vite ENOSPC node_modules/.vite-temp; gateway ENOSPC /home/z/.config; git index.lock unwritable).
2. **Restart the dev server after freeing** — `cd devthink && bunx vite --port 3000` (deps installed: 786 packages).
3. **Start the gateway alongside vite in dev** — root `dev` only starts vite; `/api`+`/v1` proxy to 127.0.0.1:3001 which nothing launches → run `bun server.ts serve` too (or add a vite plugin/`concurrently` lane), else every "REAL" server lane answers offline in dev.
4. **Wire My Files to the storage write lane** — POST/GET/DELETE /api/v1/storage/objects exist + quota; the explorer only reads catalog records; the "New folder" grammar is still pending (files.tsx:118-120).
5. **Build the video playback/generation face** — currently only an honest queue POST (${base}/studio/render) and catalog rows; no <video>, no render status surface.
6. **Rename the 4 stutter widgets** — ImageImageengine/ImageImagestills/SettingsSettingstypes/ShellShellchrome (one-word rule, rules G3) + barrels/imports.
7. **Move oslabels/chatlabels onto the DB lane** (CopyRow precedent) if label-from-DB is the doctrine goal — today they are code seeds.
8. **Decide the accounts persistence split** — accounts/sessions in raw sqlite (devthink-accounts.sqlite) vs everything else in Prisma; either model Account/AccountSession in schema.prisma or document the split as law.
9. **Arm the OAuth row** — client ids ride VITE_OAUTH_{GOOGLE,GITHUB,GITLAB}_ID (currently unset → row renders disabled with the honest note); set them in env to activate the provider round trips against https://auth.devthink.pro/callback.
10. **Verify the family dev bridge after restart** — sibling apps mount at /{slug} via /@fs with the react dedupe wall (vite.config.ts:63-106, 160-170); confirm the power-clip windows load argan/cadria live once the disk is healed.
