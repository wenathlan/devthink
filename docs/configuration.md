# Configuration

Devthink has no baked-in deployment address. The extension is functional in local-plan mode without an endpoint. Remote planning is optional and configured by the user in the popup.

| Setting | Where configured | Rule |
| --- | --- | --- |
| Agent endpoint | Extension popup | Must be an explicit HTTPS URL with no URL credentials. |
| Endpoint permission | Chromium prompt | The user grants only the exact endpoint origin. |
| Browser session | Extension popup | Starts on one active HTTPS tab and expires after 15 minutes. |
| Plan approval | Side panel | Must occur after the plan is rendered and before any step can execute. |
| Stop control | Popup | Immediately stops the local session and cancels pending or approved plan state. |
| Ratelimit bound and window | Extension options | The per origin command bound and the window the bucket resets on stay user values; a command past the bound defers until the window resets, and no engine default ever caps a storm silently. |
| Phishguard threshold | Extension options | The lookalike distance threshold between zero and one stays the user's choice; a login origin whose distance to its closest granted origin crosses the threshold blocks the credential step with the matched origin named. |
| Quarantine and scanning | Extension options | Downloads the user quarantines hold until the local signature scan gate passes; the local signature check option runs before any remote scanner and a clean verdict releases the artifact through the review flow only. |
| Audit data | `chrome.storage.local` | Retains the latest 100 local decision and result events. |

The extension does not include Vercel, Netlify or provider-specific Function code. If a site or service is deployed elsewhere, its URL is supplied by the person operating the extension. The optional endpoint must implement the documented versioned JSON proposal response; it cannot bypass local origin, time or approval checks.

## Command line flags and exit codes (1.1.80)

The cli parses its global configuration and verbosity flags before dispatching any command: `--config path` reads the configuration file (the default location answers the configuration the operator saved), `--quiet` and `--verbose` set the verbosity of the streamed progress, and `--json` switches every command to structured json output. `devthink help` lists every command with a one line description and prints the version banner from package.json.

| Exit code | Failure class | Meaning |
| --- | --- | --- |
| 0 | ok | The command completed its work. |
| 1 | consentrefused | A consent gate refused the work before any effect. |
| 2 | stepfailed | A step of the run failed. |
| 3 | schemaerror | A document failed schemastrict or the run stayed unfinished. |
| 4 | unsupported | The target runtime cannot satisfy the requested kind. |
| 5 | cancelled | The operator cancelled the run. |

An unknown exit class refuses as a schema error because the mapping itself is contract. The runtime policy check allows the cli commands to read configuration only; no cli context issues a telemetry request from anywhere.

## Runtime specific configuration discovery (1.1.81)

The configuration discovery answers the runtime that loads the library: the node default adapter reads the configuration file the `--config` flag names or the default location of the operator environment, the browser default adapter reads the storage the host injected, and the deno adapter reads its configuration through the deno runtime permissions the deno.json compatibility map declares. The adapter seam keeps the discovery behind one contract — a cli, a browser agent and a deno script resolve the same configuration shapes through their own adapters, and no runtime imports leak into the policy or protocol modules.

## The serverurl setting and the pairing flow (1.1.82)

The `serverurl` setting stores the relay url of the site bridge in storage.local with no default value: an empty value disables the bridge completely, and any wss url the user chooses works without vendor assumptions after the scheme, host and port shape validate. The pairing flow lives in the extension options: the consent gate asks before the first socket connection, the mint button issues the pairing code with its expiry countdown, the revoke button revokes all sessions with one click, and the kill switch disables the socket and the pairing instantly. The idle window, the heartbeat interval, the rate cap with its window, the pairing code lifetime and the explicit page content consent flag stay the user's choices beside the url. See docs/14.servercontract.md for the wire protocol.

## Model provider gateways (1.1.83)

The provider gateways configure through the options page: each provider names its kind (openaicompat, anthropicgateway, geminigateway or ollamalocal), its base url (validated for scheme, host and path shape — a remote provider must speak https, the ollamalocal adapter accepts localhost only), its model list and its api key reference. The key material lives in the keyvault behind its storage id — never in memory files, audit trails or request logs — and the consent gate asks the user before the first call to any remote provider while the local runtime needs no remote consent. Every provider ships off until the user turns it on, the routing table maps each task kind onto its provider and model with the fallback pair, and the timeout, retry count, backoff base, jitter window and model list cache window stay the user's choices with no engine default.

## The serve command flags (1.1.84)

The `devthink serve` command starts the mcp server mode: `--stdio` speaks json rpc over stdin and stdout, `--http` speaks streamable http on a localhost bind with `--port`, `--cert` and `--key` enable tls with the user certificate, a non localhost bind requires the auth handshake, `--degraded` starts read only, and the shutdown drains the in flight calls before exit. See docs/16.mcpserver.md for the server, the transports and the catalog.

## Native transport settings and the kill switch (1.1.85)

The native host bridge settings live in the options page beside the site bridge: the native host name and the user profile directory name the host registration (the reviewed cli installer writes the manifest — `devthink native install --profile <dir> --host <name> --extension-id <id> --companion <path> --consent true` — because the extension never writes the profile), the install consent explains the scope before any write, the transport consent opens the first host attach, the read, interaction and sensitive call classes each carry their own grant, and the os dialog and notification surfaces carry their own consents on top. The idle window (ms), the heartbeat interval (ms), the rate cap and its window stay user choices with no code default — an absent window never expires a wsbridge session, an absent interval sends no heartbeat frames and an absent cap keeps the transport unbounded. The kill switch button and the escape hatch key stop every native call in one press: the port detaches, the wsbridge session closes and no frame crosses until the release; `devthink native uninstall` removes the host manifest and its preferences. See docs/17.nativebridge.md.

## Browser specific settings (1.1.86)

The cross browser build keeps one source manifest and per browser overlays. The firefox overlay (`manifest.json` → `browsers.firefox`) carries the browser specific settings with the generated extension id (`devthink@wenathlan`), the strict min version (`115.0`), the action key mapping (the default popup, default title and default icon shapes pass through), the event page background scripts (the firefox mv3 background semantics drop the service worker and load the background as an event page script), the optional permission names that differ (the `offscreen` permission drops because firefox lacks the offscreen api and the page falls back to the inline parser), the empty host permissions the deny by default posture keeps, and the web accessible resources firefox pattern syntax. The safari overlay (`manifest.json` → `browsers.safari`) carries the strict min version (`14.0`), the action popup, the empty host permissions, the optional permissions set and the csp overlay. The cross browser feature flags default to the intersection set across browsers — a feature surface a single browser lacks stays off everywhere by default; the user can widen the feature set per browser through the options page, the consent gate stays the reviewed surface and the audit trail records every grant. The sidepanel surface is chromium only — firefox and safari lack the `chrome.sidePanel` api, the polyfill layer opens a popup window with the same review gate layout, and the safari app extension renders the sidepanel surface as a popover equivalent. See docs/18.browsercoverage.md for the apimap table, the per browser permission differences and the signing and notarization path per browser.

## Container and vsix configuration (1.1.87)

The self hosting container configures entirely through environment variables — every bind, port and path is the operator's choice with documented defaults that keep the mcp listener loopback only. `DEVTHINK_HTTP_BIND` (default `0.0.0.0`) and `DEVTHINK_HTTP_PORT` (default `8080`) bind the http listener that serves the static site and upgrades the relay connections; `DEVTHINK_RELAY_PATH` (default `/relay`) names the websocket path the socket relay answers; `DEVTHINK_MCP_BIND` (default `127.0.0.1`), `DEVTHINK_MCP_PORT` (default `7436`) and `DEVTHINK_MCP_PATH` (default `/mcp`) bind the mcp server listener — widening the mcp bind past loopback is the operator's explicit choice and the remote gates of the mcp server mode apply unchanged; `DEVTHINK_RELAY_IDLE_MS` sets the idle sweep window of the relay connections (an absent or non-positive window never expires a connection because the bound stays the operator's choice). The `--check` mode of `container/run.mjs` boots every surface, probes each one and exits — the container build runs it as a build check so an image whose surfaces do not answer never ships.

The vs code extension configures through the `devthink.relayurl` setting: an empty value (the shipped default) keeps the webview fully offline and no url is ever assumed, and any wss or ws url of the relay the operator runs works after the scheme and host shape validate. The `devthink.settings` command opens the setting; the `devthink.openbridge` command opens the bridge webview panel; the consent gate stays visible inside the panel before any socket frame crosses and the pairing code comes from the extension options. The manifest declares telemetry off and no network default, and no marketplace url or download url appears anywhere in the package.

## The strict schema validation switch since 1.1.91

The strict schema validation switch of the 1.1.91 api freeze is the negotiated protocol major of the client: a client that declares protocol version two — or declares nothing, because the negotiation answers the frozen default of two to a new client — gets strict mode, where every inbound message runs schema validation before dispatch and an unknown field refuses with the params error naming the field; a client that declares a version one string keeps the tolerant window, where unknown fields pass through with the deprecation tolerance riding the negotiation answer. The tolerance closes at 2.0.0 with the deprecation window, and the switch never adds a configuration knob — the protocol line the client itself declares is the switch, so no silent default ever widens a frozen contract. The frame size bound and the queue depth stay the user configured values they always were, and the mcp server mode documents the same behavior for the stdio and the http transports. See `docs/apifreeze.md` and `docs/deprecation.md`.

## Quarantine and scanning options (1.1.95)

The virus scanning hook of the quarantine family configures through the transparency page: the scanner name and the HTTPS endpoint the verdicts come from stay the user's choice, and the 1.1.95 hardening adds the local signature list beside them — hex sha256 digests only, because the on device pass compares the digest of the held file against the list before any remote endpoint fires. A digest on the list flags the file (the quarantine deletes it and no remote call happens), a digest that matches nothing leaves the verdict to the configured scanner endpoint, and a hook with no local list behaves exactly as before. The review flow stays the only surface that exposes the quarantined contents: a download that lands outside the downloads folder holds in the sandbox folder with a pending verdict, the release gate refuses anything but a clean verdict, and hook failures keep the verdict pending instead of releasing.

The purge options of the minimization family carry the same posture: the purge command with a scope asks for the typed confirmation phrase (the full scope purge deletes every stored family with the immutable audit hashes surviving), the purge command with a run name removes every stored key that carries the run's trace — the run log, the run scopes, the task state, the emulation state, the workflow provenance, the control decisions, the timeline and the provenance log of that run alone — and the export action returns every stored record in one archive bundle. The quarantine verdict request accepts the reviewed digest so the on device check runs first, and every verdict, release and purge lands in the audit trail with its reason. See `docs/securityreview.md` for the security posture of the family and `docs/transparency.md` for the page that manages it.

## The fake clock mode of the coordination suite (1.1.96)

The agentcert gate of the coordination suite configures its own clock and never reads a user setting: the fake clock mode stays the default so every certification run replays byte identical — the clock starts at the fixed epoch 1_800_000_000_000 and every tick advances exactly one thousand milliseconds, the artifact carries no timestamp and reruns rewrite the same bytes. The real clock mode exists only for the live verification runs the operator drives with the explicit switch:

```text
node tests/agentcert.mjs --clock real
```

The fake tab provider needs no configuration either: it hands out one deterministic tab id per browser kind and per slot (chromium 101 and 102, firefox 201 and 202, safari 301) so the coordination scenarios bind tabs the same way on every browser kind the extension ships, through the same one tab one agent invariant the live surface enforces. The costcert gate shares the fixed epoch for its recorded evidence; the scenario docs of `docs/agentscenarios.md` reference the same setup for every topology, and the certification doc of `docs/agentcert.md` documents the rerun instructions.
