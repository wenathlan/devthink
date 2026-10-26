# akash devtools-blocking study — what the owner's examples really do, what still works in 2026, and how devthink should adopt it

Studied read-only via the GitHub API (blobs fetched by sha, decoded in memory; nothing cloned, nothing edited). This is the relaunch pass: every file below was re-fetched and re-read against the live tree on 2026-10-25, the 3 MB bundle was grepped in memory twice, and the earlier draft's claims were corrected where the bytes disagreed (see T2, T13 and §4.1 for the deltas).

- Source repo: `github.com/iakadion/devthink`, branch `main`, folder `akash/` (145 entries; tree not truncated)
- Integration target: `github.com/wenathlan/devthink`, branch `main`, app at `devthink/` (2,292 entries)

---

## 1. Inventory — the security-relevant files in akash/

| File | Size | Verified role |
|---|---|---|
| `akash/index.html` | 330 B | Loads `ak.js` synchronously in `<head>`; also pins `user-scalable=no, maximum-scale=1.0` (pinch-zoom lock) |
| `akash/ak.js` | 210 B | Boot-splitter (see T1) |
| `akash/core-hidden.js` | 3,017,596 B | The entire production app as one obfuscated blob (string-table obfuscation, `_0x…` names, embedded `disable-devtool` v0.3.9 + supabase-js + FingerprintJS) |
| `akash/App.tsx` | 13,725 B | Dev root; wires `initSecurity()` at module top and `initDevToolsBlocker()` behind a hostname gate |
| `akash/plugins/index.ts` | 5,461 B | `initSecurity()` — disable-devtool integration, FingerprintJS + ipify, Supabase remote ban table, local ban mirrors, `nukeEverything()` |
| `akash/plugins/devtools-blocker.ts` | 6,782 B | The hand-rolled wall: shortcut blocking, context menu, debugger timing, size heuristic, console nooping, copy/select/drag blocks |
| `akash/plugins/aesthetic.ts` | 1,980 B | CSS layer: global `user-select:none`, hidden scrollbars, `user-drag:none`, focus-outline removal, dark-mode enforcement |
| `akash/plugins/AntiBorder.ts` | 1,193 B | CSS layer: tap-highlight removal, focus/ring removal |
| `akash/_headers` | 1,717 B | Deploy-layer headers: `X-Frame-Options: DENY`, nosniff, no-referrer, Permissions-Policy lockdown, plus noindex/no-store rules over the source globs (see T13) |

Everything else in `akash/` (3D, dashboard, login, etc.) is ordinary app code; the security surface is exactly the files above.

---

## 2. Technique catalog (what the code actually does, path by path)

### T1 — Boot-splitter + obfuscated production blob
`akash/ak.js`, loaded by `akash/index.html` before anything else:

```js
(document,'script',(location.hostname.length<10)?'/App.tsx':'core-hidden.js', ...)
```

Hostnames shorter than 10 chars (`localhost` = 9) get the readable dev entry `/App.tsx` as a module; every production host gets `core-hidden.js` (3 MB, string-table obfuscated) as a classic script, before the normal bundle mounts. In production the readable source never ships — all logic, including every guard below, hides inside the blob.

### T2 — disable-devtool library integration (the real engine)
`akash/plugins/index.ts` → `initSecurity()` calls `DisableDevtool` (theajack's `disable-devtool`, **v0.3.9** per the blob) with:

```js
DisableDevtool({ ondevtoolopen: type => { nukeEverything(true); handleViolation(String(type), visitorInfo); },
  interval: 50, disableMenu: true, disableSelect: true, disableCopy: true,
  disableCut: true, disablePaste: true, disableIframeParents: true, clearLog: true });
```

The blob confirms the embedded library's **default** config `detectors:[1,3,4,5,6,7]` (default `interval:500`, `stopIntervalTime:5e3`) which the app call inherits by not overriding, and its detector enum: **1 RegToString, 3 Size, 4 FuncToString, 5 Debugger (statement timing), 6 Performance (timing), 7 DebugLib** — 7 is the eruda/vconsole sniffer (`window.eruda._devTools._isShow`, `window._vcOrigConsole` + `#__vconsole.vc-toggle` DOM probe, both verified verbatim in the blob). The blob also carries the `localhost`/`127.0.0.1` hostname gate — it sits directly **after** the library call and wraps the following (obfuscated) init, which is structurally identical to the checked-in `App.tsx` (ungated `initSecurity()` at module top, gated `initDevToolsBlocker`). Correction to the earlier draft: the blob does not gate the library init itself; it was not built from a different variant. The library exposes an `isSuspend` seam and the app never touches it.

Obfuscation caveat, verified: `pushState`, `banned_users` and `ipify` have **zero plaintext hits** in the blob because strings live in the computed string table (`_w(l-527)` style) — absence is not evidence of absence. What is plainly visible in the blob: the FingerprintJS font/canvas probing (the `TRAJAN PRO`-style font list, `toDataURL` canvas probes) and the whole supabase-js client (45 hits).

### T3 — Keyboard shortcut wall
`akash/plugins/devtools-blocker.ts` → `blockKeyboardShortcuts()`: capture-phase `keydown` listener that `preventDefault`s **F12, Ctrl+Shift+I/J/C/K, Ctrl+U (view source), Ctrl+S (save)**. Active in production via `App.tsx`.

### T4 — Context-menu suppression
Same file, `disableContextMenu()`: capture-phase `contextmenu` preventDefault; plus `disableMenu` in the library. Nuance from the blob: the library's own suppressor skips touch pointers (`if("touch"!==e.pointerType)`), so mobile long-press menus survive the library layer — only the hand-rolled layer blocks them.

### T5 — `debugger`-statement timing trap
Two layers:
- Hand-rolled: `detectDevTools()` — `const start = performance.now(); debugger; const end = ...` with a 50 ms threshold on a 1 s interval. **Dead code in practice**: `initDevToolsBlocker` defaults `detectDevTools:false`, the only call site (`App.tsx`) passes `false`, and the init maps that flag to the *size* detector anyway (`if (config.detectDevTools) detectDevToolsBySize();`) — the function is never invoked.
- Library (live): the blob shows real `debugger;` statements wrapped in obfuscated `performance.now()` brackets — the `Debugger` (5) and `Performance` (6) detectors polling every **50 ms** (app override; lib default 500).

### T6 — Window-size heuristic
- Hand-rolled: `detectDevToolsBySize()` — `outerWidth - innerWidth > 160 || outerHeight - innerHeight > 160`, 500 ms interval + resize listener. Also effectively unwired (flag false).
- Library (live): the `Size` detector in the blob uses **200 px horizontal / 300 px vertical** thresholds with a `deviceXDPI/logicalXDPI` zoom-compensation factor (IE-era technique that no longer compensates modern browser zoom) — verified verbatim: `200<window.outerWidth-window.innerWidth*t` / `300<window.outerHeight-window.innerHeight*t`.

### T7 — Console-getter probes (RegToString / FuncToString / DebugLib)
The library's detector family: log an object whose `toString` (or a getter) records invocation — DevTools, when open, formats the logged value and trips the trap. Detector 7 additionally sniffs eruda/vconsole globals.

### T8 — Console nooping
`devtools-blocker.ts` → `disableConsole()`: replaces 23 `console.*` methods with a noop (verified list: log, debug, info, warn, error, table, trace, dir, dirxml, group, groupCollapsed, groupEnd, clear, count, countReset, assert, profile, profileEnd, time, timeLog, timeEnd, timeStamp). Plus `clearLog` in the library and a console silencing pass in `nukeEverything`.

### T9 — Copy / paste / selection / drag lockout (visitor-surface lock)
Three stacked layers:
- `devtools-blocker.ts`: `copy`/`cut` preventDefault (opt-in, off by default), `selectstart`, `dragstart`, plus an injected stylesheet making everything `user-select:none` except `input, textarea`.
- The library config: `disableSelect`, `disableCopy`, `disableCut`, **`disablePaste`** — all on.
- `aesthetic.ts` / `AntiBorder.ts` CSS: selection/drag/tap-highlight/focus-outline removal, hidden scrollbars; `index.html` adds `user-scalable=no`.

### T10 — Punishment stack on detection
`akash/plugins/index.ts` → `nukeEverything(crash)` and `devtools-blocker.ts` → `onDevToolsOpen()`:
1. noop the console;
2. wipe the DOM (`documentElement.innerHTML` / `document.body.innerHTML`) and paint "Você abriu o DevTools. / Seu IP foi bloqueado por 1 hora." (a claim the client cannot enforce);
3. **infinite `while (true)` loop**: every 100 ms it pushes 20 `history.pushState('/access-denied-N')` entries and allocates `new Array(1000000).fill(0.1)` — deliberate history flood + memory pressure to hang the tab (verified in the checked-in source; the blob's copy, if present, is hidden behind the string table);
4. catch-all redirects to `about:blank` (the one `about:blank` plaintext hit in the blob is supabase iframe code, not the nuke).

### T11 — Visitor identity + ban persistence
`initSecurity()` gathers **FingerprintJS visitorId + ipify IP + UA**, then:
- local ban mirrors in `localStorage` + `sessionStorage` + cookie (`ak_sec_ban`, 1 h), checked before anything renders;
- remote ban table in **Supabase** (`banned_users`), queried by `ip OR fingerprint` within 1 h; violations inserted client-side with reason `DT_<type>`. The URL and a publishable key (`sb_publishable_…`) are hardcoded in the plugin.

### T12 — Environment gating
`App.tsx` arms the hand-rolled blocker only when hostname is not `localhost`/`127.0.0.1`; the blob carries the same gate for the init that follows the library call (see T2).

### T13 — Deploy-layer headers (new in this pass)
`akash/_headers` (Netlify): `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, `Permissions-Policy: geolocation=(), microphone=(), camera=()` globally — these four are genuinely good. Then theater: `X-Robots-Tag: noindex, nofollow` + `Cache-Control: no-store` over `/*.ts`, `/*.tsx`, `/vite.config.*`, `/package*.json`, `/.env*` and every component folder. `X-Robots-Tag` hides files from search engines, not from visitors — the files are still served; the only real source protection is that production hosts load `core-hidden.js` instead of `App.tsx` (T1).

### Not present (verified by in-memory grep of the 3 MB blob)
- **No web-worker traps** — all four `Worker(` hits are the Supabase realtime keepalive worker (`"keepAlive"===e.data.event`).
- **No blur/focus reactions** — `onblur` has zero hits; the 199 `blur` hits are Tailwind CSS tokens. `visibilitychange` hits are a cross-browser page-visibility shim plus the library's own `isSuspend` machinery — no visitor-facing reaction rides visibility.
- **No devtools-detect / firebug-era probes**, no `serviceWorker`.

---

## 3. Verdicts — effective in 2026? bypasses? false positives?

| # | Technique | 2026 effectiveness | Bypass | False-positive / collateral cost |
|---|---|---|---|---|
| T1 | Obfuscated 3 MB blob + boot splitter | Speed bump only. Raises effort, kills source maps, no code splitting | Pretty-print + deobfuscators; `view-source`/curl gets the HTML anyway | 3 MB parse cost on every mobile visitor; maintainability zero |
| T2 | disable-devtool @ 50 ms | Still the best-of-breed client detector; catches docked casual opens | Deactivate breakpoints (Ctrl+F8) neuters the `debugger` detectors; clearing timers from console kills the loop; undocked DevTools defeats Size; menu-opened DevTools beats everything | 50 ms polling with timing checks = measurable CPU/battery; the lib's `stopIntervalTime` (5 s) eventually rests after a trip |
| T3 | Shortcut wall | Partial. Chromium lets pages suppress F12/Ctrl+Shift+I keydowns; Firefox and Safari treat these as browser-reserved and the page cannot stop them | Browser menu ⋮ → More Tools → DevTools; `chrome://inspect`; remote debugging; keyboard remaps; second device | Blocks Ctrl+U/Ctrl+S which have legit uses; blocks nothing on mobile (no keys) |
| T4 | Context-menu off | Cosmetic only; unrelated to DevTools (DevTools opens from the keyboard/menu) | Long-press menus on some mobile browsers still fire (the lib layer explicitly skips touch); browser menu | Hurts translators, spell-checkers, power users, screen-reader workflows — pure UX damage, zero security |
| T5 | `debugger` timing trap | Genuinely works in Chrome/Edge/Safari/Firefox **while a debugging session is attached** — the pause is measurable | DevTools "deactivate breakpoints" / "Never pause here"; kill the interval (`for(let i=0;i<1e5;i++)clearInterval(i)`) once you can type; open DevTools detached from that tab; or never open DevTools and take the DOM with curl | Zero for normal visitors at ≥1 s intervals; the 50 ms library variant costs CPU constantly |
| T6 | Size heuristic | Weak. Only fires for **docked** DevTools | Undocked window; DevTools in another window via remote debugging; responsive mode | **High**: browser zoom (inner shrinks in CSS px, outer doesn't), Edge sidebar/split-screen, snapped/tiled windows, display-scaling changes, some extension sidebars — all impersonate docked DevTools. Never act on it alone |
| T7 | Console-getter probes | Degrading. Modern Chrome renders logged values lazily; RegExp-style `toString` overrides are often never invoked until expanded; object-getter variants still mostly trip in Chromium, less so Firefox/Safari | Console closed while inspecting via other means; changed rendering heuristics per release | ~None when gated to production |
| T8 | Console nooping | Not a detector at all — hides logs from yourself | Console evaluation is unaffected; `debugger` + watch expressions replace logs | Blinds your own error monitoring (Sentry-style tools) and legitimate support ("open the console and paste the red text") |
| T9 | Copy/paste/select/drag lock | Anti-casual-copy only; orthogonal to DevTools | DevTools DOM inspector; curl; screenshot; reader mode | **Severe**: blocking paste breaks logins, chat input, search; blocking selection breaks quote/cite/accessibility; `user-scalable=no` is ignored by iOS anyway and is an a11y flag on Android |
| T10 | Nuke loop (history flood + memory bomb) | The tab genuinely hangs — and that is the problem | Task manager kills one tab; clear site data or open a private window and the "1 h ban" is gone in 5 s | Hostile-UX territory: reported sites, lost visitors, OOM on weak devices; the frozen loop also races the very fetch that records the ban |
| T11 | Fingerprint + IP + Supabase ban | The only layer with teeth (server-side persistence) — and the most dangerous | New profile/container/incognito = new fingerprint; most mobile users sit behind CGNAT so IPs are shared | **CGNAT collateral**: one ban can lock out thousands of innocent mobile visitors. Client-side insert with a publishable key means, depending on RLS: anyone can **read the table (harvests every visitor's IP + fingerprint)** or **insert rows (mass-ban griefing)**. Verify RLS before admiring this layer |
| T12 | Hostname/PROD gating | Good hygiene — keep it | n/a | None |
| T13 | `_headers` lockdown | The four real headers (DENY/nosniff/no-referrer/Permissions-Policy) are the most cost-effective lines in the whole folder; the noindex globs are theater | Direct URL fetch ignores `X-Robots-Tag` entirely | None — copy the four headers, skip the rest |

**Bottom line**: in 2026 the only techniques that still detect a competent attacker are the `debugger` timing trap (until they deactivate breakpoints) and, marginally, console-getter probes — and *no* client-side technique survives a visitor who simply takes the DOM with curl or never opens DevTools on the page. Everything Akash stacks on top of detection (freeze, flood, fingerprint bans) punishes the innocent more often than the guilty.

---

## 4. Integration plan for devthink (wenathlan/devthink)

### 4.1 What is already there (every line re-verified from the repo this pass)

- **`devthink/devtoolsguard.ts`** (4,774 B) — the newer wall, **never armed**: GitHub code search for `armdevtoolsguard` returns exactly one hit — the module itself. Three prongs: `armdebuggertrap` (interval 1200 ms default, `Date.now()` bracket around `debugger`, trips when a tick exceeds interval+60 ms), `armsizethreshold` — **misnamed: despite the name it is the console-getter probe** (RegExp with an overridden `toString` fed to `console.log("%c", probe)` every 1500 ms, the devtools-detector technique reimplemented; there is **no window-size heuristic** in this module, which is exactly right given T6's false-positive profile), and `armshortcuts` (capture `keydown` F12 / Ctrl+Shift+I/J/C/U — note: "U" only trips with Shift held, so plain Ctrl+U slips through — plus `contextmenu`). PROD-only via `import.meta.env.PROD`, `suspend` seam, `ondevtoolstrip` listener set, disarm function, `devtoolstripped()` state. Zero storage, zero network. Tests exist at `devthink/tests/devtoolsguard.test.ts` (two dev-build contract cases).
- **`devthink/guard.ts`** (2,783 B) — the shield currently wired in `devthink/App.tsx` (`void guardStatus(); armGuard();` inside `App()`): one-shot boot check (debugger timing once at 120 ms, size delta > 220 once, console-getter probe), server report to `/guard/strike` + `/guard/status` on `VITE_CATALOG_URL`, `blank()` reaction (clears `#root`, white background). **Confirmed defect, not just suspected**: the probe does `void String(probe)` after overriding `probe.toString` — `String(x)` invokes the override synchronously, so `detectOnce("console.getter")` → `strike()` → `blank()` runs for **every visitor on every boot**, unconditionally as read, and `strike()` blanks before the server even answers. The only escape would be dead code elimination that also removes the trap. This is the first thing to fix or retire.
- **`devthink/App.tsx`** (3,971 B) — the global anchor: arms `guard.ts` (`guardStatus(); armGuard()`), installs `zoomlock.ts` before first render, `seedLabels()`, renders `Sol` inside the `WorkbenchErrorBoundary` (the `workbench-failure` interstitial), the sonner Toaster and the wouter router. It does **not** import `devtoolsguard.ts`.
- **Settings surface**: `devthink/Sol/settings/settings.tsx` (8.5 KB) with the Windows 11 rail; `SettingsSettingstypes.ts` defines `SettingsSnapshot.preferences` (theme, railMode, interfaceZoom — all strings) and category ids (personalization, accounts, gateway, drives, automation, about). `SettingsPersonalization.tsx` renders `dtw-card` sections and delegates the boolean-ish rows to `ComponentOptions` (`SettingsComponentoptions`) with a `save(PreferenceKey, value)` seam. `SettingsPersonalstore.ts` is the device-local personalization channel — one localStorage key per concern, validated loads.
- **`devthink/usestoredstate.ts`** — the house persistence mechanism: `useStoredState<T>(key, fallback, validate)` plus **`useStoredFlag(key, fallback)`** — the ready-made persisted-boolean hook the toggle below should ride.
- **Chat surface**: the Sol theme owns `ChatSolboticon`, `ConsoleTerminal`, `ConsoleTerminalui`, `chatstate.ts` — paste, selection and copy are core interactions there.

### 4.2 The plan — one module, wired once, owner-switchable

**Keep `devtoolsguard.ts` as the single dot-free module (name already matches house style); fold `guard.ts`'s reporting into it and retire `guard.ts`.**

1. **Arm it where the old shield arms today.** In `devthink/App.tsx`, replace `void guardStatus(); armGuard();` with:
   - `armdevtoolsguard()` called once before the first render (it already no-ops on dev builds via `guardarmed()`);
   - register the Sol reaction with `ondevtoolstrip(...)` — the theme, not the guard, decides the answer.
2. **The reaction rides the Sol theme — no nuking, ever.** On a trip: render the Sol-styled interstitial (the same visual grammar as `WorkbenchErrorBoundary` in `App.tsx`), keep the router and chat state alive (`chatstate.ts` must not be unmounted by a DOM wipe — never do `document.body.innerHTML = ...`). Absolutely none of Akash's `while(true)`, `history.pushState` floods, or `Array(1e6)` allocations. A calm surface + a server-side signal is strictly better: the visitor loses nothing destructive, the owner gains the telemetry.
3. **Prong policy (adopt Akash's winners, refuse its collateral):**
   - keep the **debugger trap** at the existing 1200 ms (Akash's 50 ms buys ~nothing detection-wise and costs battery);
   - keep the **console-getter probe** as the second signal (it is already the module's real prong 2; rename `armsizethreshold` to `armconsoleprobe` for honesty) — and never wire a window-size heuristic (T6 is the false-positive factory; zoom, Edge split-screen and snapped windows all impersonate docked DevTools);
   - keep the **shortcut wall** to F12 + Ctrl+Shift+I/J/C (drop U and S — view-source and save are neither stoppable nor worth the UX; fix the Shift+U quirk by testing `event.key` without assuming shift), and a trip from a shortcut should *report*, not blank — the browser opens DevTools anyway on the reserved paths;
   - drop `contextmenu` suppression or keep it opt-in; **never** block copy/cut/paste/selection/drag — that is Akash's worst trade (it breaks the chat surface's paste box and copyable answers for zero security).
4. **Settings toggle (the owner's off switch).** Add a boolean row through the house pattern: `useStoredFlag("devthink.devtoolswall", true)` from `usestoredstate.ts` (or a dedicated key in `SettingsPersonalstore.ts`'s one-key-per-concern store), rendered in the personalization pane's `ComponentOptions` card (`SettingsComponentoptions`) next to the other component toggles. When off: call the disarm function `armdevtoolsguard()` already returns (the `suspend` seam exists precisely for this — the disarm flips `state.suspended`, every prong checks it before acting). Default **on** in production, always disarmed in dev via `guardarmed()`. If the settings surface is reachable by non-owners, gate the row behind the owner identity check the settings app already has.
5. **Optional server reporting, done right.** Port `guard.ts`'s `/guard/strike` idea into the trip listener, but: rate-limited, keyed by a hashed session id (not IP — CGNAT bans innocents; not a raw fingerprint — GDPR exposure), and never let a client write a shared ban table with a publishable key the way Akash's Supabase `banned_users` does (readable = visitor-IP harvest, writable = mass-ban griefing). Keep `guardStatus()`'s server answer authoritative for real bans, with the blank replaced by the Sol interstitial.
6. **Tests.** Extend `devthink/tests/devtoolsguard.test.ts`: the prod-only arming contract, the disarm/suspend seam, the no-size-heuristic contract, and the guarantee that no trip path blocks clipboard events on `input`/`textarea` (the chat-surface contract).
7. **First commit, before any of the above**: fix or retire the `String(probe)` self-trip in `guard.ts` — as read, production blanks for everyone on every boot.
8. **Copy Akash's one cheap win verbatim**: the four real `_headers` lines (X-Frame-Options DENY, nosniff, no-referrer, Permissions-Policy) onto devthink's host config. Skip the noindex theater.

**Net**: devthink ends with the strongest thing Akash actually proves out (the `debugger` timing wall plus the console probe, gated to production, switchable by the owner), wearing Sol's visual language, with the chat surface untouched — and none of the freeze-loops, fingerprint bans, copy-hostility or header theater that make Akash's own visitor surface a liability.
