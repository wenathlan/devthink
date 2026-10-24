# Web store listing

This draft records the chromium web store listing of the 2.0.x submission — the name, the summary, the description, the category, the icon set, the permission justification rows, the privacy posture, the screenshot checklist and the operator-published submission posture. The store package is the extension zip the packageextension gate verifies (`dist/devthink<version>.zip`, so `dist/devthink2.0.2.zip` when the release train stamps 2.0.2 — package.json stays the sole version source): the archive carries the manifest with the frozen permission set, the compiled surfaces, the fixture gallery and the six icon sizes the archive check asserts. This documents the web store package deliverable of the final polish; the store submission itself stays operator published, as the residual risks of [readiness.md](readiness.md) record — the release workflow publishes the registries and the github release, never the store.

## the listing fields

| Field | Draft value | Ground |
| --- | --- | --- |
| Name | Devthink | The `name` field of the manifest. |
| Summary | A consent-first bridge for reviewed browser-agent tasks. | The `description` field of the manifest (the store summary bound is 132 characters; this is 56). |
| Category | Productivity | The draft pick for a review-driven task automation tool; no store category ships in the repository, so the operator confirms it at submission. |
| Version | 2.0.2 | The release stamp package.json carries at submission time. |

## the description draft

Devthink turns a user-provided browser objective into a bounded, reviewable plan, and nothing reaches the browser before the review approves it. The user starts a short-lived session on one active https tab, the extension observes the page (every interactive element, every form control, the full page text), a plan is proposed — locally or through a user-configured endpoint — and the side panel renders every step with its kind, its target, its origin and its risk before any action executes. Sensitive steps carry their own consent prompts, every grant binds in time, and the kill switch stops everything with one press.

Every action lands in a local, hash-chained audit trail the transparency page verifies: which origin was granted, which step ran, what it touched and when. The extension is telemetry-free — no analytics, no remote endpoint of its own, no vendor url anywhere in the package — and the consent-first posture is the product, not a setting: the optional capabilities (tabs, downloads, clipboard, offscreen, native messaging) request at runtime with a justification row each, and the host permission is the explicit pairing flow that grants no origin at install.

The 2.0 release closes the chain from 1.1.31: the frozen protocolv2 contract, the migration bridge for plans authored outside devthink (`docs/migrationguide.md`), the example gallery of thirty six runnable recipes (`docs/gallery.md`) and the readiness review with its go decision (`docs/readiness.md`).

## the icon set

The zip ships six icon sizes — `icons/16.png`, `icons/19.png`, `icons/32.png`, `icons/38.png`, `icons/48.png` and `icons/128.png` — materialized from the base64 png payloads of the `icons.ts` module (the repository stays text only), and the manifest icons block, the action default icon and the notification icon path resolve against them. The packageextension gate verifies every archived icon carries a real png header and decodes to the exact pixel size of its key, so the store set provably renders at the required sizes inside the shipped archive; the store listing uses `icons/128.png` as the store icon and the smaller sizes for the toolbar, the notification and the management surfaces.

## the permission justification rows

The frozen permission set of the 2.0.x submission, with one justification row per permission mirroring [01.extensionpermissions.md](01.extensionpermissions.md):

| Permission | Set | Justification |
| --- | --- | --- |
| activeTab | required | The session scope itself: the user starts the reviewed session on the active tab and the extension reads it only while the session lives. |
| storage | required | The local stores: the session records, the memory families, the audit trail, the settings and the consent history stay in the extension's local storage. |
| scripting | required | The page seam: every reviewed step executes through the scripting api against the granted origin, and the observation snapshot rides the same seam. |
| sidePanel | required | The review surface: the plan review cards, the consent prompts and the run timeline render in the side panel. |
| tabs | optional | The tab and window command family reads tab titles, urls and ids beyond the active tab only through this capability, requested at runtime from the review panel when a reviewed step needs it, with every grant and refusal audited. |
| downloads | optional | The reviewed download flow — the download kinds, the batch grammar and the quarantine path — needs the downloads api only for steps the user reviewed. |
| clipboardRead | optional | `readclipboard` is consent bounded three times (a reviewed consent ref, an approved single use prompt and the optional capability itself) and the payload text never persists anywhere. |
| clipboardWrite | optional | `writeclipboard` writes reviewed text through the page bridge which reports the result with the payload hash. |
| offscreen | optional | The offscreen document pool runs background capture, parsing and rendering work behind its own capability grant; the pool degrades to the inline parser when the capability stays ungranted. |
| nativeMessaging | optional | The native host bridge declares it in the optional set only: nothing native runs until the user installs the companion host through the per install registration. |
| https://*/* | optional host | The explicit pairing flow: no origin is granted at install, the deny by default posture refuses every origin the user never granted and the active tab grant counts as exactly one single origin grant. |

## the privacy posture

The listing declares the single purpose "consent-first execution of user-reviewed browser tasks" and the following posture, every line of which the gates verify on each release:

- **Telemetry-free**: the telemetryfree gate of the candidate chain verifies the built bundles behind a block-all proxy — zero outbound attempts — and no analytics, tracking or crash reporting code exists in the package.
- **Local-first**: no vendor endpoint, no download url and no cloud default ships anywhere; remote planning and model providers are optional and user-configured, the audit trail stays in `chrome.storage.local`, and the transparency page works entirely offline.
- **No remote code**: manifest v3 prohibits remotely hosted executable code, and the extension packages every executable in the signed artifact; the strict content security policy (`script-src 'self'; object-src 'self'; frame-ancestors 'self'`) pins every extension page to the package, and the cspaudit gate verifies it.
- **Local audit**: every step transition, grant, expiry, revoke, deny and seal event lands in the append only loghash chain the transparency page verifies; exports carry the masking and redaction pass.
- **Declared data use**: the listing declares no sale of data, no ads and no analytics; stored data kinds with their purge and export links list on the transparency page.

## the screenshot checklist

The screenshots are taken at submission time from the loaded extension — the repository ships no image assets beside the icon family, so the operator captures the set against the 2.0.2 zip. Every capture is 1280x800:

| Surface | The shot shows |
| --- | --- |
| popup | The active tab session surface: the start control, the origin allowlist state of the active tab, the consent window countdown and the denydefault notice. |
| sidepanel review | The plan review surface: the steps with their kinds, targets, origins and sensitive marks, the consent prompts with their class badges, the one click gallery recipe import and the run timeline beside them. |
| dashboard | The newtab dashboard surface: the library browser with its search and filters and the multi agent dashboard panels with the fleet status cards, the shared task queue and the cost meter. |
| options | The options surface: the model provider gateway settings, the site bridge settings with the pairing controls and the native host bridge section. |
| transparency | The transparency page: the permission rows with their consuming surfaces, the stored data kinds with purge and export links, the audit trail integrity result and the grants list. |

## the operator-published submission posture

The store submission stays in the operator's hands, recorded as the operator-published lane: the release workflow creates the github release with every checksummed asset and publishes the npm, maven, nuget, container and gem channels, but no workflow step touches the web store — the firefox/amo lane carries the same posture. The operator uploads `dist/devthink2.0.2.zip` through the store dashboard, answers the permission disclosure with the justification rows above, attaches the screenshots from the checklist, publishes the privacy declaration from the posture above and submits for review; the listing draft and the package both ride the same release stamp, and the permdiff gate keeps the permission set of the submitted zip identical to the reviewed baseline of `tests/permdiff.json`.
