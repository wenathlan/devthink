# Browser Coverage

Devthink 1.1.86 removes the chromium only assumption in packaging. The same consent first library, the same kind catalog, the same policy gates, the same observation schema and the same audit trail format speak on chromium, firefox and safari through one source manifest with per browser overlays. No vendor endpoint, no download url and no cloud endpoint ever ships in the code.

## Source manifest and per browser overlays

The root `manifest.json` file stays the single source of truth. The per browser overlays live inside the root manifest under the `browsers` key — one manifest speaks every webextension dialect and no second hand maintained manifest file exists:

| Browser | Overlay file | Adapter module | Artifact |
| --- | --- | --- | --- |
| Chromium (source) | `manifest.json` (root, the source) | none — the source manifest | `extension/devthink<version>.zip` |
| Firefox | `manifest.json` → `browsers.firefox` | `firefoxprep.ts` | `extension/devthink-firefox-<version>.xpi` |
| Safari | `manifest.json` → `browsers.safari` | `safariskeleton.ts` | `extension/devthink-safari-<version>.zip` |

The firefox overlay layers the `browser_specific_settings` with the generated extension id, the strict min version, the action key mapping, the event page background scripts, the optional permission names that differ, the empty host permissions the deny by default posture keeps, and the web accessible resources firefox pattern syntax — the `firefoxprep` adapter strips the `browsers` and `vsix` metadata keys from the adapted manifest so the shipped firefox extension copy carries no packaging metadata. The safari overlay carries the strict min version, the action popup, the empty host permissions, the optional permissions set and the csp overlay.

## The apimap table

The `apimap.ts` module records every webextension api the codebase touches with its chromium, firefox and safari equivalent. The catalog is the source of truth the apimap build check reads; an api without a chromium and firefox mapping fails the build before the cross browser artifacts ship.

| Api | Chromium | Firefox | Safari |
| --- | --- | --- | --- |
| `runtime.geturl` | `chrome.runtime.getURL` | `browser.runtime.getURL` | `browser.runtime.getURL` |
| `tabs.query` | `chrome.tabs.query` | `browser.tabs.query` | `browser.tabs.query` |
| `scripting.executeScript` | `chrome.scripting.executeScript` | `browser.scripting.executeScript` | `browser.scripting.executeScript` |
| `storage.local` | `chrome.storage.local` | `browser.storage.local` | `browser.storage.local` |
| `storage.session` | `chrome.storage.session` | `browser.storage.session` | `browser.storage.session` |
| `windows.create` | `chrome.windows.create` | `browser.windows.create` | `browser.windows.create` |
| `notifications.create` | `chrome.notifications.create` | `browser.notifications.create` | `browser.notifications.create` |
| `downloads.download` | `chrome.downloads.download` | `browser.downloads.download` | `browser.downloads.download` |
| `contextMenus.create` | `chrome.contextMenus.create` | `browser.contextMenus.create` | `browser.contextMenus.create` |
| `sidePanel.open` | `chrome.sidePanel.open` | `browserpolyfill.sidepanel.open` (popup window fallback) | `browserpolyfill.sidepanel.open` (popup window fallback) |
| `offscreen.createDocument` | `chrome.offscreen.createDocument` | `browserpolyfill.offscreen.inline` (inline parser) | `browserpolyfill.offscreen.inline` (inline parser) |
| `runtime.sendmessage` | `chrome.runtime.sendMessage` | `browser.runtime.sendMessage` | `browser.runtime.sendMessage` |
| `clipboard.read` | `navigator.clipboard.readText` | `navigator.clipboard.readText` | `navigator.clipboard.readText` |
| `i18n.getmessage` | `chrome.i18n.getMessage` | `browser.i18n.getMessage` | `browser.i18n.getMessage` |
| `permissions.request` | `chrome.permissions.request` | `browser.permissions.request` | `browser.permissions.request` |
| `commands.onCommand` | `chrome.commands.onCommand` | `browser.commands.onCommand` | `browser.commands.onCommand` |

The runtime browser probe (`apimapbrowserof`) resolves the running browser from the runtime seam (the `chrome` or `browser` namespace) and the user agent the probe reads. The in memory cached browser probe (`apimapbrowsercacheprobe`) holds the resolved browser for the rest of the run.

## Per browser permission differences

| Permission | Chromium | Firefox | Safari |
| --- | --- | --- | --- |
| `tabs` | optional | optional | optional |
| `downloads` | optional | optional | optional |
| `clipboardRead` | optional | optional | optional |
| `clipboardWrite` | optional | optional | optional |
| `offscreen` | optional | dropped (inline parser fallback) | dropped (inline parser fallback) |
| `nativeMessaging` | optional | optional | unsupported — the native transport stays chromium first and reports `unsupported` elsewhere |
| `sidePanel` | required (chromium only) | dropped (popup window fallback) | dropped (popover equivalent) |

The deny by default posture keeps host permissions empty on every browser. The permission deny list (`debugger`, `cookies`, `webRequest`, `history`, `bookmarks`, `proxy`, `management`) stays in force across overlays — a forbidden permission the overlay widens into the required set fails the build before the firefox manifest ships.

## Sidepanel fallback behavior

The sidepanel surface is chromium only — firefox and safari lack the `chrome.sidePanel` api. The `browserpolyfills.ts` module opens a popup window with the same review gate layout when the sidepanel api is missing on firefox, and the safari app extension renders the sidepanel surface as a popover equivalent. The consent gate, the review cards, the approval flow and the kill switch work identically inside the popup window the polyfill opens.

## Signing and notarization path per browser

| Browser | Signing path | Notarization |
| --- | --- | --- |
| Chromium | the chromium build ships as an unpacked zip the user loads in dev mode or the chrome web store signs on submission | none |
| Firefox | the firefox build ships as an xpi the user loads through `about:debugging` for development, and the firefox addon store signs on submission through the addons linter pass | none |
| Safari | the safari app extension ships as an xcode project wrapper the developer opens in xcode, signs with the developer certificate and notarizes through the apple notarization service | required — the safari app extension refuses to load without the developer signature and the apple notarization |

The addons linter runs over the xpipack output in the verify workflow when the linter is installed, and the local suite covers the markers check (errors zero, warnings inside the budget the user chose). The safari skeleton carries the app entitlements and the minimal app shell the wrapper declares for the extension distribution.

## Cross browser invariants

- The kind catalog stays identical on every browser — the 334 action kinds the policy gates audit ship on every build.
- The policy gates stay identical on every browser — the consent, the budget, the rate cap and the kill switch gates read the same shape on every build.
- The observation schema stays byte identical across browsers — the page state, the plan and the audit trail format ship the same bytes on every build.
- The audit trail format stays identical across browsers — the structured records with their class and outcome never change between browsers.
- The extension id per browser feeds the servercontract handshake — the bridge pairing works from any browser build to the same relay through the same negotiated contract version.
- The gateway adapters and the mcpmode run unchanged on every browser through the fetch seam — no browser specific code path lives in the gateway or the mcp surface.
- The native transport stays chromium first and reports `unsupported` elsewhere — the native messaging permission stays in the optional set on chromium only, the native transport ships deny by default, and a firefox or safari build degrades with the run alive when the native host is absent.
- The root manifest's `version` is the single version source for every browser manifest — `package.json` is the canonical version source the release workflow syncs into the root `manifest.json`, the firefox and safari overlays under the `browsers` key carry no version of their own (no drift between the browser manifests is possible), and the safari skeleton wrapper stamps the same version into its `Info.plist`.

## Feature flags and the intersection set

The cross browser feature flags gate surfaces a browser cannot host. The default set is the intersection across chromium, firefox and safari — a feature surface a single browser lacks stays off everywhere by default. The user can widen the feature set per browser through the options page; the consent gate stays the reviewed surface and the audit trail records every grant.

| Feature flag | Chromium | Firefox | Safari | Default |
| --- | --- | --- | --- | --- |
| `sidepanel` | present (sidePanel api) | polyfill (popup window) | polyfill (popover equivalent) | on (intersection) |
| `scripting` | present | present | present | on |
| `storage.session` | present | present | present | on |
| `tabs.executeScript` fallback | present | present | present | on |
| `notifications` | present | present | present | on |
| `contextMenus` | present | present | present | on |
| `clipboard` | present | present | present | on |
| `downloads` | present | present | present | on |
| `runtime.messaging` | present | present | present | on |
| `runtime.geturl` | present | present | present | on |
| `nativeMessaging` (native transport) | present (optional) | unsupported | unsupported | off (chromium first, deny by default) |

## Build and verification

`tests/build.mjs` gains the firefox and the safari targets. The firefox target reads the source manifest, layers the firefox overlay through the `firefoxprep` adapter, assembles the xpi through the `xpipack` assembler with the adapted manifest and the hashed extension dist bundles, and writes the artifact beside the chromium extension zip. The safari target embeds the chromium extension payload into the safari app extension wrapper through the `safariskeleton` module, and the wrapper ships beside the chromium zip and the firefox xpi with the bundle id, the entitlements and the minimal app shell.

The per browser size budgets the build asserts: apimap 60000b, browserpolyfills 120000b, firefoxprep 60000b, xpipack 90000b, safariskeleton 90000b. The no underscore bundle naming check fires on every cross browser bundle. The checksum step records the digests for the firefox and the safari artifacts beside the existing checksum lines.

The verify workflow runs the firefox prep step offline, runs the addons linter over the xpipack output when installed, installs firefox and runs a load smoke on the xpipack build when available. The release workflow attaches the xpi and the safari skeleton as release assets beside the existing artifacts. The containerfile smoke runs the firefox prep step offline. The workflowcheck covers the firefox and safari jobs. The npmgate check allows the cross browser build scripts and the single root `manifest.json` with the embedded browser overlays in the tarball.
