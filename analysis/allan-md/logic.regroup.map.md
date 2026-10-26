# logic.regroup.map — the one-keyed-file-per-family map of the devthink root

Tree: `C:\allan\devthink` (branch `main`, version `2.0.146`). Target: the root TypeScript of
`devthink/devthink/*.ts` (169 files, plus the config/entry pair files). NOT `Sol/`, NOT `tests/`.

The owner's law: every family of correlated logic lives in ONE keyed file with a name that says
the family — ordinal sections, JSDoc on every block, every export preserved with the same name
and signature, duplicated helpers deduped to ONE survivor, old member files DELETED (no shims,
no indirection). Each wave: merge one family, repoint every importer, delete the members, run
`npm run typecheck` (0 errors) plus the tests that pin the family, and keep `npm test` at the
Windows baseline (22 failures in 7 files).

## 1. Method

1. Header census of all 169 root files (first JSDoc block = the family statement; most files
   already announce their domain).
2. Import graph via grep of `from "./x.js|./x.ts"` across root, `Sol/`, `tests/`.
3. Duplication ledger via targeted greps of the known twin helpers (sha256 hex, base64url,
   bearer patterns, slug patterns, scrypt+timingSafeEqual, lane base resolution).
4. Test-pin census: every root module the test suite imports (the pin vector that decides
   merge order and the "keep the pinned source strings" rule).

### 1.1 Test-pin census (root modules imported by tests/, count of test files)

`types` 87 · `policy` 61 · `memory` 23 · `protocol` 21 · `security` 15 · `views` 13 ·
`tools` 11 · `run` 10 · `progress` 10 · `http` 9 · `agent` 9 · `swarm` 8 · `pack` 8 ·
`perf` 7 · `crossbrowser` 7 · `environments` 6 · `auth` 6 · `workflow` 5 · `mcp` 5 ·
`llm` 5 · `export` 5 · `version` 4 · `plan` 4 · `data` 4 · `session` 3 · `runtime` 3 ·
`flow` 3 · `commands` 3 · `cli` 3 · `capture` 3 · `bridge` 3 · `apifreeze` 3 ·
`jsondecision` 2 · `headless` 2 · `graphnodes` 2 · `gates` 2 · `evidence` 2 · and 1 each:
`workbenchsession workbenchmemory window tokenestimate streaming sse server retrybackoff
requestqueue pythonscripts planstate page net modes mcpregistry jsonschema jsonpolicy
jsonparse jsonengine ids identity hardening graphrunner devtoolsguard deploybase deno debug
dashdone copy conversationcompact config compatibility catalog calculator` — plus
`tests/server/`: `accountlane` 1, `sandboxlane` 2, `storagelane` 1, `utils` 2, `engine` 1,
`server` 3, `types` 3, `config` 1.

**Rule for every wave:** before merging a family, `grep -rn "<member-name>" devthink/tests/`
for every member file name AND for any `readFileSync`-based assertion over the member's
source. Tests that pin a member's source strings keep those strings verbatim inside the
merged file (the pinned section carries its original JSDoc).

## 2. Duplication ledger — helpers living twice or more, and the canonical survivor

| # | Duplicated logic | Files carrying it | Canonical survivor |
|---|---|---|---|
| D1 | `normalizeaccountowner` + `ACCOUNTPATTERN` (`/^[a-z0-9][a-z0-9-]{2,63}$/i`) — byte-identical client twin and server twin | accountclient.ts, accountlane.ts | ONE export `normalizeaccountowner` in authfamily.ts (§accounts) — both runtimes call the same one |
| D2 | Bearer shape `/^[a-f0-9]{64}$/i` (`BEARERPATTERN` client vs `SESSIONTOKENPATTERN` lane) | accountclient.ts, accountlane.ts | ONE const `SESSIONTOKENPATTERN` in authfamily.ts; the client-side `accountbearer()` reads it |
| D3 | sha-256 hex digest, node form (`createHash("sha256").update(v).digest("hex")`) — 12 private copies | accountlane.ts (`sha256hex`), identity.ts (`digest`), admins.ts, companion.ts, cli.ts, models.ts, oauth.ts, project.ts, quota.ts, recovery.ts, search.ts, streaming.ts | In the pilot: one `sha256hex` inside authfamily.ts serving identity §pairing and accountlane §sessions. Repo-wide (wave H): one `hashkit.ts` family file, every merged family imports it |
| D4 | sha-256 digest, web-crypto async form (`crypto.subtle.digest("SHA-256")` → hex) | accountgate.ts (`digest`) | stays the browser-side primitive inside authfamily.ts §accountgate (distinct primitive from D3 — different runtime, both documented in place) |
| D5 | base64url encoder | oauthrow.ts (browser `btoa` twin), oauth.ts (node `Buffer` twin, RE DoS-hardened) | runtime twins BY DESIGN (oauthrow header states the web-crypto law); after wave H both re-export from hashkit.ts's two runtime halves; no behavior change |
| D6 | salted scrypt secret digest + `timingSafeEqual` verify | accountlane.ts (32-byte salt, 64-byte key, sqlite), admins.ts (16-byte salt `salt:digest` rows), panelsync.ts | wave A2 (authcontrol family): one `scryptpair(secret, salt)` helper; storage shapes stay per-family (do NOT unify salts — that changes stored verifiers = behavior) |
| D7 | gateway-url normalizer (`trim` + strip one trailing slash) | gatewaybase.ts `normalizeGatewayBase`, authgate.ts `normalizeGateway` | executed wave B: survivor `normalizeGatewayBase` in gatewayfamily.ts §1; `normalizeGateway` kept VERBATIM as a deliberate twin (tests/authflow.test.ts pins one-slash semantics the survivor would change — see §B) |
| D8 | the lane-client seam (gatewayContext → registered preference fallback + bounded fetch with bearer + timeout + null answer) | accountclient.ts `accountlane()/accountfetch()`, sandboxclient.ts `sandboxlane()/…`, storageusageclient.ts | executed wave B: ONE laneclient section in gatewayfamily.ts (`resolvelane()`, `lanefetch()`); the three clients keep their thin typed wrappers (sandboxclient + storageusageclient in-family, accountclient inside authfamily.ts importing `lanefetch`) |
| D9 | display-handle slug (`trim().toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+\|-+$/g,"")`) | accountclient.ts, accountlane.ts (the same two), capture.ts, agent.ts, background.ts, llm.ts, session.ts | D1 dedupes the account twins; repo-wide (wave H): `slugof()` in hashkit.ts/utilfamily, adopted family by family |
| D10 | PKCE pair mint (64 random bytes → base64url verifier → SHA-256 challenge) | oauth.ts `generatePKCE` (node), oauthrow.ts `mintPkcePair` (web crypto) | runtime twins BY DESIGN (the RFC 7636 shape is documented in both); noted, not deduped |
| D11 | resolved-address public/private classification | urlgate.ts only (`ipv4public/ipv6public/ispublicaddress`) — grep proves NO duplicate in net/security/policy/request/http | unique — survivor is urlgate §addresses as-is |

## 3. The family files (proposed keyed names)

Merge order = risk order: low-traffic pure logic first, the pinned mega-files last. The pilot
(AUTH) runs first as the pattern-setter.

### A. authfamily.ts — WAVE 4, THE PILOT (executed)

Members (root, ~72 KB total):
| member | size | role |
|---|---|---|
| accountgate.ts | 3.0 KB | the LOCAL browser account (os HD credential vault via db.ts; salted web-crypto SHA-256) |
| accountclient.ts | ~14 KB | the browser client of the account lane (verdict union, sessionStorage cache, `restoreonce()` persistent sign-in) |
| accountlane.ts | 18.7 KB | the server lane (sqlite accounts, scrypt, family sessions, oauth exchange over the url gate) |
| identity.ts | 12.1 KB | device identity + pairing ledger (0600 atomic writes, pairing codes, browser sessions) |
| oauthrow.ts | 10.4 KB | the provider row contract (endpoints/scopes/state/PKCE for the browser row) |
| urlgate.ts | 13.1 KB | the one SSRF door (resolved-address classification, bounded `gatedrequest`) |

Section order (ordinal): 1 accountgate, 2 identity, 3 urlgate, 4 oauthrow, 5 accountlane,
6 accountclient — node sections first (1–5; accountlane last of the node halves because it
consumes urlgate + oauthrow), the browser client last.

Dedupe applied: D1 (one `normalizeaccountowner`), D2 (one `SESSIONTOKENPATTERN`), D3
(one node `sha256hex`). Behavior: unchanged, byte-for-byte on every exported surface.

Importers repointed (all of them, grepped 2026-10-25):
- `devthink/server.ts` — identity.js (6 names), accountlane.js (9 names), urlgate.js (`GateError`), oauthrow.ts (2 names) → one block from `./authfamily.js`
- `devthink/devthink.ts` — identity.js (6 names) → `./authfamily.js`
- `devthink/sync.ts` — identity.js (`getIdentity`) → `./authfamily.js`
- `Sol/auth/auth.tsx` — accountgate.ts + accountclient.ts + oauthrow.ts → `../../authfamily.ts` (page also carries a pre-existing `export * from "../../accountgate.ts"` → repointed)
- `Sol/settings/settings.tsx` — accountclient.ts (6 names incl. `restoreonce`) → `../../authfamily.ts`
- `Sol/callback/callback.tsx` — oauthrow.ts + accountclient.ts → `../../authfamily.ts`
- `Sol/widgets/AuthSignin.tsx` — accountgate.ts (`AccountState`) → `../../authfamily.ts`
- `Sol/widgets/AuthProviderrow.tsx` — oauthrow.ts (2 types) → `../../authfamily.ts`
- `Sol/widgets/ConsoleTerminalui.tsx` — identity.js (2 names) → `../../authfamily.js`
- `Sol/widgets/SettingsAccountscategory.tsx` — accountclient.ts (`AccountSessionState`) → `../../authfamily.ts`
- `tests/core.test.ts` — `../identity.js` → `../authfamily.js`
- `tests/server/accountlane.test.ts` — `../../accountlane.js` → `../../authfamily.js`

Test pins found (grep of tests/ for all six member names): ONLY `tests/server/accountlane.test.ts`
imports a member; `tests/bridge.test.ts` (`serverurlgate`) and `tests/gateway.test.ts`
(`gatewaybaseurlgate`) pin OTHER files' same-named exports (policy.js/bridge.js — untouched);
no test reads the members' source via readFileSync; no config/manifest (devthink.toml,
csproj, build.mjs entries, apifreeze manifests, familylanes.mjs) references the member file
names. Risk: LOW. Verification: typecheck 0; accountlane+storagelane+sandboxlane suites;
full `npm test` at the 22-failures-in-7-files baseline.

Wave A2 — authcontrol.ts (follow-up, same family umbrella): ~~authgate.ts~~ (merged into
gatewayfamily.ts §2 by wave B, 2026-10-25 — see §B), admins.ts (9.2 KB), panelsync.ts
(1.9 KB). Dedupe D6 applies here (D7 rode wave B). Pins: tests/authflow.test.ts pinned
authgate behaviors (now served from gatewayfamily §2, verbatim); admins/panelsync have no
direct test imports. Risk: MEDIUM (admins owns the CODEOWNERS control
plane read at boot).

Explicitly NOT merged into authfamily: oauth.ts, accounts.ts, project.ts, quota.ts, recovery.ts,
search.ts, models.ts, constants.ts, request.ts, streaming.ts, fingerprint.ts, versionregistry.ts,
antigravity.ts — these are the PROVIDER lineage (`@module provider/*|auth/*` in the merged
Antigravity/Gemini-CLI sense), a different family (see F).

### B. gatewayfamily.ts — WAVE 5, EXECUTED (2026-10-25)

Members (root, ~55 KB): gateway.ts (3.5 KB browser pairing client), gatewaybase.ts (10.0 KB the
ONE opt-in contract), gatewayviewdefinition.ts (4.8 KB), sandboxclient.ts (7.3 KB),
storageusageclient.ts (4.8 KB), compatibility.ts (1.7 KB), deploybase.ts (5.2 KB), routebase.ts
(1.2 KB), PLUS authgate.ts (5.3 KB entry guards — moved into this wave from the planned A2
authcontrol merge by the wave order, so D7 resolves inside one family file).

Merged: `devthink/devthink/gatewayfamily.ts` — sections 1 gatewaybase, 2 authgate, 3 gateway
(pairing client), 4 gatewayviewdefinition, 5 laneclient (the D8 seam), 6 sandboxclient,
7 storageusageclient, 8 compatibility, 9 deploybase, 10 routebase. Every export preserved
under the same name and signature; members `git rm`-ed, no shims.

Deviations taken (both forced by discoveries the pre-wave greps demanded):
- **gateway.config.ts EXCLUDED from the merge and NOT deleted.** It is not an imported module
  but a runtime-discovered CONFIG FILE: config.ts `loadconfig()` (lines ~3056–3075) and
  server.ts `confignames` (~1798–1808) probe the literal file name `gateway.config.mjs|ts|js`
  on disk (cwd / source root / dist parent), no `config.mjs` shadows it, so the root file IS
  the live embedded-gateway definition in dev-from-source; tests/server/server.e2e.test.ts
  also writes its own fixture under that exact name. Merging it would change runtime behavior
  (dev falls back to the empty builtin default) — the family law forbids that. It stays a
  standalone config-file convention, like vite.config.ts. (gatewayviewconfig.ts — the Sol
  catalog — is a different file and was never a member.)
- **D7 resolved as survivor + documented deliberate twin, not delegation.** The survivor
  `normalizeGatewayBase` (§1) is the one all-slashes + http(s)-gated normalizer. authgate's
  `normalizeGateway` (§2) is kept VERBATIM: tests/authflow.test.ts pins
  `normalizeGateway("http://127.0.0.1:8787//") === "http://127.0.0.1:8787/"` (strips exactly
  ONE slash, no scheme gate) — delegating to the survivor would strip both slashes and change
  pinned behavior. Both facts documented in place in the family file.

Dedupe applied: D7 (above) and D8 — ONE laneclient section (§5): `resolvelane()` (context
first, registered preference second — the exact resolution order kept) + `lanefetch()`
(bounded fetch with bearer + `LANETIMEOUTMS` = 10_000, null on transport failure; answers the
raw Response). The three clients keep thin typed wrappers: sandboxclient (§6,
`sandboxbody()` wrapper + the four route calls) and storageusageclient (§7) inside the family;
accountclient inside authfamily.ts §6 imports `lanefetch` and keeps its own wrapper (adds
`credentials: "include"` and the status+payload answer its verdict union reads). The former
per-client TIMEOUTMS / accountlane / sandboxlane / usagelane / sandboxfetch twins are gone.

Importers repointed (26 files, grepped 2026-10-25):
- root: authfamily.ts (gatewaybase+gateway imports → one `lanefetch` import from
  ./gatewayfamily.ts), chatstate.ts (re-export line), gatewayviewconfig.ts, providers.ts,
  server.ts, sync.ts
- Sol: auth/auth.tsx (import + the pre-existing `export *`), panel/panel.tsx (authgate +
  routebase lines), widgets/{ChatBody, ChatSandboxpane, ChatSessionpanel, SettingsGatewaycard,
  AuthPairing, PanelDesktop, ShellJumpmenu, ShellFamilyframe}.tsx, files/files.tsx,
  gateway/gateway.tsx, projects/projects.tsx, providers/providers.tsx, settings/settings.tsx,
  usage/usage.tsx, console/console.tsx
- tests: authflow.test.ts (`../gatewayfamily`), deploybase.test.ts, core.test.ts

Test pins honored: tests/authflow.test.ts (authgate — behavior pins kept verbatim),
tests/deploybase.test.ts, tests/core.test.ts (compatibility's five exports),
tests/gateway.test.ts + tests/bridge.test.ts pin OTHER files' same-named exports
(policy.js/bridge.js — untouched, verified by grep). Risk was MEDIUM; the D8 extraction kept
the exact resolution order.

Verification: `npm run typecheck` 0 errors; `npx vitest run tests/authflow.test.ts
tests/deploybase.test.ts tests/gateway.test.ts tests/bridge.test.ts` 54/54 green;
tests/core.test.ts 21/21 green; `npm test` at the known Windows baseline — 22 failures in 7
files (server/cli, server/engine, server/persistence, server.e2e, librarymodes, nativebridge,
publishingpipeline — identical set and count as before the wave).

Note for wave A2 (authcontrol): authgate.ts is already merged (gatewayfamily §2) — the A2
membership shrinks to admins.ts + panelsync.ts; the D6 scrypt dedupe and the authcontrol
umbrella decision stay with that wave.

### C. storagefamily.ts — WAVE 6, EXECUTED (2026-10-25)

Members (root, ~68 KB): storage.ts (8.1 KB node sqlite mirror), storagelane.ts (8.1 KB the platform
lane), database.ts (11.1 KB prisma), db.ts (20.4 KB browser IndexedDB), harddrives.ts (4.7 KB),
workbenchsession.ts (9.9 KB), workbenchmemory.ts (3.9 KB), sync.ts (1.9 KB — imports identity;
after wave 4 it imports authfamily).

Merged: `devthink/devthink/storagefamily.ts` — sections 1 storage, 2 storagelane, 3 database,
4 db (browser IndexedDB), 5 harddrives, 6 workbenchsession, 7 workbenchmemory, 8 sync (the map's
member order, which is also topological: every intra-family reference points upward). Every export
preserved under the same name and signature — including harddrives' typo-named `renamerive`
(kept verbatim; renaming it would break the export contract) — members `git rm`-ed, no shims.

Dedupe applied (family-local; no D-ledger row names this family):
- The sqlite driver types: storage.ts and storagelane.ts each declared a private `Statement`
  (byte-identical) and a `Database` (the mirror's exec/prepare/close shape vs the lane's
  prepare-only subset of the same driver object). ONE pair survives in §1; §2 rides it and
  calls `databasedriver()` directly (the `sharedatabasedriver` alias names the export the
  account lane imports — it creates no local binding).
- `compactToken()` (§4 db) vs `midentity()` (§5 harddrives): DELIBERATE near-twins kept verbatim,
  documented in place (gateway-wave precedent): same 32-letter alphabet but different
  crypto-unavailable fallbacks (per-byte Date.now vs whole-token Math.random) — converging them
  would change the fallback path.
- storagelane's internal `@section store/keys/objects` markers kept verbatim inside §2 (the
  member-JSDoc law; the family header's ordinal list governs).

Cross-family seams (both lazy — every cross-family reference sits inside a function body, so the
module cycles evaluate without an import-time touch; the repo already carries the
engine.ts↔server.ts cycle):
- authfamily.ts → storagefamily.ts: `sharedatabasedriver` (§1) + `browserIdentity`,
  `readBrowserCredential`, `saveBrowserCredential`, `saveBrowserPreference` (§4). One-directional
  at the call level, exactly as the members had it.
- storagefamily.ts §8 (sync) → authfamily.ts `getIdentity` and gatewayfamily.ts
  `isSecureRemoteEndpoint`, as sync.ts did after wave 5.
- gatewayfamily.ts → storagefamily.ts: `readBrowserPreferences`, `saveBrowserPreference` (§4).

Deviations taken (one forced):
- **authfamily.ts and gatewayfamily.ts were touched — import specifiers ONLY.** The wave's
  do-not-touch caution covers their logic; deleting db.ts/storage.ts without repointing their
  member imports would have broken the build, and the wave law itself says repoint every
  importer. Each edit is the single import line/block renamed to `./storagefamily.ts`
  (authfamily: the two member import lines merged into one block; gatewayfamily: one line).
  Nothing else in either file changed (verified by diff).

Importers repointed (24 files, grepped 2026-10-25):
- root: authfamily.ts, gatewayfamily.ts, engine.ts, labels.ts, server.ts (two import regions:
  the session/preferences block + the merged lane/database block, plus the `keysfromdb` dynamic
  import and the `export { db, getsession, getsessionmessages, savemsg }` re-export line),
  devthink.ts (workbenchmemory + workbenchsession + storage + sync merged into one block)
- Sol: auth/auth.tsx, files/files.tsx (imports + two dynamic imports + the header comment that
  named harddrives.ts/db.ts), usage/usage.tsx, panel/panel.tsx, projects/projects.tsx,
  providers/providers.tsx, settings/settings.tsx, widgets/{ChatBody, IntroBoot, SettingsAbout,
  SettingsGatewaypairing, SettingsHarddrives, SettingsIdentity, ConsoleTerminalui}.tsx
- tests: core.test.ts (workbenchmemory + workbenchsession → one storagefamily line),
  server/storagelane.test.ts, server/persistence.test.ts (dynamic import),
  registernvidiakeys.ts (`../database` → `../storagefamily`, extensionless style kept)
- NOT touched: tests/scripts/scaffoldtemplates.ts (its "db.ts" strings are scaffold templates
  for generated projects, not this repo's module); no config/manifest/export-map references
  existed (grep of *.json/*.mjs/*.toml/*.csproj found only a CHANGELOG history mention).

Test pins honored: tests/server/storagelane.test.ts (behavioral, 6/6), tests/core.test.ts
(workbenchmemory + workbenchsession, behavioral), tests/server/persistence.test.ts (dynamic
database.js import), tests/registernvidiakeys.ts (db). No test reads any member's source via
readFileSync.

Verification: `npm run typecheck` 0 errors; storagelane 6/6 + sandboxlane 9/9 + accountlane 7/7
green; authflow + gateway + bridge + deploybase + core 75/75 green; tests/server/persistence
fails at its `bunx prisma generate` setup step — the pre-existing Windows baseline failure (it is
one of the baseline 7 files, same failure mode as before the wave); full `npm test` at the known
Windows baseline — 22 failures in 7 files (server/cli, server/engine, server/persistence,
server.e2e, librarymodes, nativebridge, publishingpipeline — identical set and count),
3209 passed, 9 skipped.

### D. queuefamily.ts — wave 7 (low risk, pure)

Members: requestqueue.ts (5.6 KB), retrybackoff.ts (7.7 KB), tokenestimate.ts (6.7 KB),
conversationcompact.ts (8.9 KB), sse.ts (8.4 KB), core.ts (51.7 KB shared pure utils — absorb
as §primitives or keep as the base layer; decide at the wave), ids.ts (1.1 KB).
Pins: 1 test each; all pure logic. Risk: LOW.

### E. jsonfamily.ts — wave 8 (low risk, pure)

Members: jsondecision.ts (5.0 KB), jsonengine.ts (4.7 KB), jsonparse.ts (4.5 KB),
jsonpolicy.ts (4.9 KB), jsonschema.ts (4.8 KB).
Pins: jsondecision 2, jsonschema/jsonpolicy/jsonparse/jsonengine 1 each — all behavioral
(pure functions), no source pins. Risk: LOW.

### F. providerfamily.ts — waves 9–12 (the giant, split per sub-merge)

The provider lineage (Antigravity/Gemini-CLI merged library): request.ts (159 KB),
streaming.ts (134 KB), llm.ts (125.6 KB), models.ts (120.6 KB), oauth.ts (85 KB),
recovery.ts (82.8 KB), antigravity.ts (90.6 KB), search.ts (62.3 KB), quota.ts (66.9 KB),
accounts.ts (72.3 KB), project.ts (48 KB), fingerprint.ts (56.9 KB), versionregistry.ts
(43.8 KB), constants.ts (39.6 KB). Already "one file per correlated domain" internally —
the regroup here is CONSERVATIVE: merge the small twins first (models+constants; project+quota;
oauth+recovery), keep the mega-files single, dedupe D3/D5 via hashkit.ts.
Pins: auth 6 test files, llm 5, streaming 1 + tests/provider/*.test.ts family. Risk: HIGH —
apifreeze manifests and versionregistry pin export surfaces; merge behind `apifreeze:sync`
check.

### G. graphfamily.ts — wave 13 (low risk)

Members: graphnodes.ts (24.9 KB), graphrunner.ts (11.1 KB), graphviewstate.ts (8.6 KB).
Pins: graphnodes 2, graphrunner 1. Risk: LOW.

### H. hashkit.ts + utilfamily.ts — wave 14 (the dedupe sweep)

hashkit.ts: the node `sha256hex` (D3), the two base64url twins (D5), `slugof` (D9) — then the
already-merged families swap their private copies for the import (mechanical, behavior-identical).
Pins: none direct. Risk: LOW but wide; ride last so each consumer family is already stable.

### I. shellfamily.ts / copyfamily.ts / translatefamily.ts — waves 15–17 (browser-pure)

- shellfamily.ts: alttab (2.8 K), window (3.2 K), desktopstate (10.4 K), recentapps (2.0 K),
  fileexplorer (9.9 K), appregistry (8.5 K), osapps, osevents (3.2 K), ostypes (2.1 K),
  osreveal (1.9 K), zoomlock (7.6 K), guard (2.8 K), devtoolsguard (4.8 K), calculator (11.9 K),
  akash (3.8 K), introtarget (1.7 K), cleanurl (5.7 K), usestoredstate (3.9 K), useismobile (0.8 K),
  onboardingstate (10.9 K). Pins: window 1, devtoolsguard 1, calculator 1, catalog 1, copy 1,
  dashdone 1 — browser-pure, LOW risk.
- copyfamily.ts: copy.ts (9.7 K), labels.ts (11.9 K), chatlabels.ts (11.0 K), oslabels.ts (44.5 K),
  catalog.ts (7.1 K), seedcatalog.ts, saascontent.ts (8.3 K), familyaccent.ts (2.1 K),
  paneltypes.ts (0.7 K), workspace.ts (1.4 K), views.ts? NO — views.ts (100.6 KB) is pinned by
  13 test files; it joins the extension surface family instead.
  Risk: LOW (data tables), but oslabels is large and generated-adjacent — grep for generators
  (`tests/*catalog*.mjs`) before moving.
- translatefamily.ts: translatedom (6.6 K), translatefx (1.7 K), translategtx (4.6 K).
  No test pins. Risk: LOW.

### J. climfamily.ts — wave 18

Members: cli.ts (165.6 KB), commandcatalog.ts (18.1 KB), consoleboot.ts (2.0 KB),
consolebootgraph.ts (3.7 KB), modes.ts (2.0 KB). devthink.ts (maestro) stays the entry.
Pins: cli 3, modes 1. Risk: MEDIUM (cli is the published bin surface — `dist/cli.js`).

### K. The pinned mega-files — waves 19+ (each rides its own wave, full test suite after)

policy.ts (616.9 KB, 61 pinning test files), types.ts (392.9 KB, 87), protocol.ts (229 KB, 21),
memory.ts (354.6 KB, 23), background.ts (1.6 MB, the extension service worker), page.ts (331 KB),
sidepanel.ts (643.7 KB), server.ts (227.5 KB, the loopback server), workflow.ts (199 KB),
agent.ts (109.9 KB), http.ts (95.8 KB), run.ts (96 KB), bridge.ts (104 KB), security.ts (77 KB),
capture.ts (76 KB), session.ts (53 KB), mcp.ts (83 KB), pack.ts (58 KB), engine.ts (59.2 KB),
serve.ts (23.3 KB), commands.ts (51.2 KB), tools.ts (33.8 KB), progress.ts (55 KB), flow.ts
(51.2 KB), swarm.ts (40.3 KB), llm.ts etc. under F, crossbrowser.ts (68 KB), export.ts (43.5 KB),
debug.ts (39.1 KB), perf.ts (47.4 KB), runtime.ts (27.1 KB), environments.ts (49.3 KB),
evidence.ts (32.3 KB), plan.ts (31.6 KB), apifreeze.ts (96.6 KB, 3 test pins + validate gate),
popup.ts (83 KB), optionspage.ts (68 KB), dashboardpage.ts (46.6 KB), transparencypage.ts
(22.3 KB), offscreen.ts (8.3 KB), pagebridge.ts (46.3 KB), panel logic.
These are ALREADY the house pattern (one optimized file per correlated domain, ordinal
sections, JSDoc). The map assigns them NO further merge unless a duplication ledger entry
names them; their waves are importer-repoint + dedupe-only (D3/D9 adoption).

### L. Entries and build glue — never merged

index.ts, node.ts, bun.ts, deno.ts, cjs.ts, umd.ts, neutral.ts, headless.ts, build.ts,
vite.config.ts, vitest.config.ts, capacitor.config.ts, prisma.config.ts, version.ts (692 B,
pinned 4x), checksecrets.ts. These are the package `exports` map and tool configs — merging
them breaks the published contract. OUT OF SCOPE permanently.

## 4. Wave sequence (the order the merges ride)

| wave | family | risk | gate |
|---|---|---|---|
| 4 (done) | authfamily.ts (pilot) | LOW | typecheck + accountlane/storagelane/sandboxlane suites + full npm test baseline |
| 5 (done) | gatewayfamily.ts | MED | + gateway/bridge suites |
| 6 (done) | storagefamily.ts | MED-HIGH | + storagelane/persistence suites |
| 7 | queuefamily.ts | LOW | + sse/retrybackoff/tokenestimate suites |
| 8 | jsonfamily.ts | LOW | + json suites |
| 9–12 | providerfamily.ts sub-merges | HIGH | + tests/provider + apifreeze gate |
| 13 | graphfamily.ts | LOW | + graph suites |
| 14 | hashkit.ts + utilfamily dedupe sweep | LOW/wide | full npm test |
| 15–17 | shell/copy/translate families | LOW | full npm test |
| 18 | climfamily.ts | MED | + cli suites |
| 19+ | mega-file dedupe-only waves | HIGH each | full npm test + validate:docs |

Per-wave protocol (the pilot set it): grep tests for every member name → merge with ordinal
sections + original JSDoc → repoint every importer (root uses `./x.js`, Sol uses `../../x.ts`
— both resolve under `moduleResolution: Bundler` + `allowImportingTsExtensions`) → delete the
members (`git rm`, no shims) → `npm run typecheck` 0 errors → targeted vitest → full
`npm test` at the 22-failures-in-7-files Windows baseline → `git status` reported.

## 5. Pilot record (wave 4, executed)

- Merged: `devthink/devthink/authfamily.ts` — sections 1 accountgate, 2 identity, 3 urlgate,
  4 oauthrow, 5 accountlane, 6 accountclient (incl. the persistent-restore section with
  `restoreonce()` and the rotated family-cookie restore).
- Dedupe survivors: `normalizeaccountowner` (one), `SESSIONTOKENPATTERN` (one), node
  `sha256hex` (one; identity's pairing digests call it), browser `digest` kept distinct (web
  crypto primitive of accountgate).
- Deletions: accountgate.ts, accountclient.ts, accountlane.ts, identity.ts, oauthrow.ts,
  urlgate.ts — `git rm`, no shims.
- Importers repointed: the 12 files listed in §A.
- Verification: `npm run typecheck` 0 errors; `npx vitest run
  tests/server/accountlane.test.ts tests/server/storagelane.test.ts tests/server/sandboxlane.test.ts`
  green; `npm test` at the known Windows baseline (22 failures in 7 files).
