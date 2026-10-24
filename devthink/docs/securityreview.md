# Security review

The security review of the 1.1.95 release (the roadmap security hardening release of section 1.1.94, landed as 1.1.95 because the real 1.1.94 shipped the single manifest consolidation) closes the hardening work with its evidence: the pentest execution and its findings, the content security audit results per surface, the permdiff history since the 1.1.31 baseline and the residual risks with their owners. Every claim below points at the gate, the test or the module that verifies it, and the review renews at every release candidate through the same three gates the package validate chain and the verify workflow run.

## Pentest execution

The automated checklist of `docs/pentest.md` executed end to end through `node tests/pentest.mjs` against the real compiled modules of `dist/`: all twenty one entries passed with zero failures, every executed entry and its outcome landed in `tests/artifacts/pentest.json` (the release, the checklist document, the entries with their family, module, outcome and detail, and the summary — deterministic, no timestamps, byte identical on reruns), and the gate exited zero. The chromium smoke run executes the same checklist end to end inside a live browser against the shipped bundles, the verify workflow runs the gate beside the api freeze, and `pnpm validate` runs it inside the `validate:security` chain. The manual half of the checklist — the install on a fresh profile, the consent window on screen, the escape hatch key press, the kill switch button, the human gates on a live flow, the transparency page on a live profile, the permdiff on a live update and the quarantine on a live download — lists its human verification steps in `docs/pentest.md` and stays the operator's responsibility before a release candidate ships.

## Findings and fixes

Every finding of the hardening review carries its fix and its verification:

| Finding | Fix | Verification |
| --- | --- | --- |
| The free form audit summaries a step, a body or a console line embeds could carry a secret shaped key value pair (a log field the families gained since the masking audit) unmasked into the audit trail. | `masklogtext` of `hardening.ts` masks every json shaped, query shaped and labeled key value pair whose key matches a mask shape, and the background audit path passes every free form summary through it with the settings and mask rules cache. | Pentest entry 12 (the secret store never leaks into the audit trail) and the masking case of `tests/policy.test.ts`. |
| The escape hatch key halted every native call with an audit entry but no visible confirmation the user sees. | `hatchbannerof` of `hardening.ts` builds the visible banner (title, explanation, halted count, time), the native view of the background returns it beside the audit entry and the options page renders it in the `#nativebanner` card. | Pentest entry 5 and the manual escape hatch entry of `docs/pentest.md`. |
| Review mode dispatched navigation steps to domains the profile workspace never recorded — a new domain is a new trust boundary the review should walk the user through. | `newdomainpausecard` of `hardening.ts` decides the pause with its explanatory card, and the background executor consults it for every navigation kind against the recorded origin profiles. | The new domain pause case of `tests/policy.test.ts` and pentest coverage of the safedefaults posture (entry 1). |
| The purge action removed the stored families but left the per run keys a run's trace writes (the run log, the run scopes, the task state, the emulation state, the workflow provenance, the control decisions, the timeline and the provenance log). | `storedkeys` of `memory.ts` enumerates the run scoped keys from the stored records, `runtracekeys` of `hardening.ts` selects every key that carries the run trace, and the purge command with a run name deletes exactly those keys while the immutable audit hashes survive. | Pentest entry 20 (the purge removes every trace of a run) and the purge and export completeness cases of `tests/memory.test.ts`. |
| The virus scanning hook answered its verdict only through the remote endpoint the user configured — no on device check existed. | `localscangate` of `hardening.ts` answers on the device first when the hook carries a local signature list: a digest on the list flags the file and no remote endpoint fires, the reviewed digest rides the quarantine entry, and the hook configuration accepts hex sha256 digests only. | Pentest entry 15 and the local signature cases of `tests/policy.test.ts`. |
| The stdio bridge launched local client processes with no client signature verification when the platform allows one. | `launchbridge` of `mcp.ts` accepts the presented signature with a platform verifier, a failed signature refuses the bridge outright, and a platform without a verifier keeps the bridge running while the bridge record marks it unverified (`clientverified`). | The stdio bridge cases of `tests/mcpserver.test.ts` and the transport posture entry of the pentest (entry 9). |
| The transparency page export left the device without the masking and redaction pass the captures carry. | `transparencyexportmask` of `hardening.ts` runs the shape masking over every typed field of the report and marks the capture derived entries with the redact regions of the origin before the export leaves. | The transparency export cases of `tests/policy.test.ts` and the transparency section of `tests/runtimepolicy.mjs`. |
| The root manifest declared its extension pages policy only inside the browser overlays — no root level strict policy and no framing refusal for the extension pages. | The root `manifest.json` gains `content_security_policy.extension_pages` of `script-src 'self'; object-src 'self'; frame-ancestors 'self'`, both overlays stay byte identical, and the shipped chromium manifest copy answers the same policy. | `tests/cspaudit.mjs` (all seven checks), the strict csp cases of `tests/manifest.test.ts` and the cspaudit policy set cases of `tests/cspaudit.test.ts`. |
| The encrypted sync path offered no key rotation entry point — rekeying meant disabling and re enabling the sync. | `syncrotationgate` of `hardening.ts` gates the rotation on both passphrases present and differing, the background rotate command re encrypts the payload under the next derived key and audits the rotation while the passphrases never persist. | The key rotation cases of `tests/policy.test.ts`. |

No finding of this review carried an unfixed gap: the checklist gates all answer green, and the residual risks below name the boundaries that stay open by design with their owners.

## Cspaudit results per surface

`tests/cspaudit.mjs` extracted every content security policy of the manifest and verified the shipped bundles (all seven checks green, exit zero):

| Surface | Policy | Result |
| --- | --- | --- |
| root `manifest.json` | `script-src 'self'; object-src 'self'; frame-ancestors 'self'` | pass — every script, object and frame source local, no wildcard, no remote source, no unsafe source, framing refused for remote origins. |
| `manifest.json` → `browsers.firefox` | byte identical to the root policy | pass — one dialect difference would weaken one browser. |
| `manifest.json` → `browsers.safari` | byte identical to the root policy | pass — same rule. |
| `dist/extension/manifest.json` (the shipped chromium copy) | byte identical to the root policy | pass — the packaged extension answers the same frozen policy. |

The bundle audit over the sixteen built extension bundles found `eval(` nowhere, remote `importScripts` and remote script tags nowhere, and the dynamic function construction confined to the two reviewed evaluate executors — `background.js` (2 sites, matching `background.ts`) and `pagebridge.js` (6 sites, matching `page.ts`) — with every other bundle at zero. The scripting api injects `pagebridge.js` alone (the only injected file), all seven built pages load package relative resources only with no inline event handler attribute, and the dashboard renders untrusted extracts inside the sandbox frame: `sandbox.html` is declared under the sandbox key, speaks the `devthinksandbox` channel and carries the fully sandboxed iframe (`sandbox=""`). See `docs/cspaudit.md` for the policy set and the audit rules.

## Permdiff history since 1.1.31

`tests/permdiff.mjs` compares the permission set of the current manifest against the versioned permission baseline of `tests/artifacts/permdiff.json` — the checked-in record of the released set, cross-checked against the git tag of the release it records whenever a repository is present, so the gate verifies inside the container builds that carry no git history — and `pnpm permdiff:sync` records the new baseline after every release bump and its justification review. The 1.1.95 diff is clean: zero added, zero removed, none reordered — the permission set hash `1d6e1579114bf176eba45a159e9f166c9c4a2587a53644bd2a63f880506a6262` over the eleven entries the manifest requests. The whole history since the 1.1.31 baseline:

| Release | Permission change | Justification |
| --- | --- | --- |
| 1.1.31 (baseline) | required `activeTab`, `storage`, `scripting`, `sidePanel`; optional none; optional host `https://*/*` | The initial consent first connector — active tab on a user gesture, local storage, the scripting surface of the reviewed steps and the side panel; the optional host pattern stays the explicit pairing flow. |
| 1.1.32 | optional gains `tabs`, `downloads`, `clipboardRead`, `clipboardWrite` | The optional capability model — each capability is requested at runtime from the review panel only when a reviewed step needs it, and every grant or refusal is audited. |
| 1.1.60 | optional gains `offscreen` | The offscreen document pool for background capture and parsing work behind its own capability grant. |
| 1.1.85 | optional gains `nativeMessaging` | The native host bridge declares it in the optional set only — the user grants the native transport per install through the host manifest registration and the deep manifest checks refuse it in the required set. |
| 1.1.88 | the manifest moves from `extension/manifest.json` to the root `manifest.json` (no permission change) | The repository consolidation — the permission set stayed byte identical through the move. |
| 1.1.95 | clean — zero added, zero removed, none reordered | The security hardening release adds no permission at all: the optional permission set gains no new entries and the host permissions stay limited to the active tab and the granted origins. |

Every permission addition since the baseline sits in the optional set, carries its justification row in the permdiff justification table of `docs/01.extensionpermissions.md`, and the audit trail records the permission set hash of each release beside the permdiff of each installed update (the transparency page lists them and the transparency export carries the history for the incident reviews).

## Residual risks and their owners

| Residual risk | Posture | Owner |
| --- | --- | --- |
| The virus scanning hook a user configures is a remote HTTPS endpoint — its verdict quality and its endpoint trust stay the user's choice. | The local signature list answers on the device first, the quarantine holds every file without a clean verdict, the review flow is the only surface that exposes the contents, and the hook origin must hold the optional host permission. | The user at configuration time; the quarantine gates hold the boundary (reviewed at every release by the pentest entry 15). |
| The dynamic function construction of the reviewed evaluate expressions in `background.ts` and `page.ts` stays dynamic by design — the isolated world executor and the page executor evaluate reviewed expressions. | The cspaudit gate counts the construction sites of every built bundle and matches them against the reviewed sources at every release, and the strict csp pins every script source to the package. | The cspaudit gate per release (the verify workflow runs it); the review owner is the repository maintainer. |
| The optional host permission `https://*/*` stays declared — the deny by default posture means no origin is granted until the user grants it, but the pattern itself stays broad in the optional set. | The per origin allowlist accepts exact origins only (a wildcard entry refuses the whole check), the active tab grant counts as exactly one single origin grant, and the permdiff gate blocks any unjustified addition. | The permdiff gate per release and the user at every grant; the justification table records the pattern's reason. |
| Platforms without a signature verifier keep the local stdio bridge running unverified. | The bridge record marks itself unverified (`clientverified` absent), the bridge binds the loopback only, and the per session token authenticates every frame. | The platform vendor; the boundary stays the loopback bind and the token authentication (pentest entries 9 through 11). |
| The sandbox frame renders untrusted markup inside a fully sandboxed iframe, but a sandbox escape in a future browser would expose the render surface. | The nonce handshake refuses replays, the render gate refuses ungranted source origins, and the cspaudit verifies the sandbox declaration and the fully sandboxed iframe at every release. | The browser vendor; the gate coverage renews per release (pentest entry 14). |
| A user can grant an origin that later turns hostile — the consent model trusts the user's grant. | The consent windows are time boxed with a named boundary, the revocation aborts the in flight step, the phishguard warns before login flows on lookalike origins and review mode pauses on new domains. | The user at every grant and expiry; the gates hold the boundary (pentest entries 1, 2, 7 and 17). |

The security workflows (codeql, dependency review, secret scanning and the sbom) keep running per change and per release beside this review; the triage flow of `docs/securitytriage.md` records the release candidate triage.

## The go decision checklist

The go decision of a release candidate walks its checklist before the release leaves the draft state, and the security review entry joins the set from this release on:

| Go decision entry | Evidence this release |
| --- | --- |
| Validation chain green | `pnpm validate` exit zero — typecheck, the full vitest suite, the build, the manifest and cli checks, the extension packaging and the workflow controls. |
| Api freeze stable | `node tests/apifreeze.mjs` exit zero — the frozen contracts hash stable since 1.1.91. |
| Security review | **The entry this release adds**: green pentest (21 of 21 entries, `tests/artifacts/pentest.json`), green cspaudit (7 of 7 checks, the policy set of `docs/cspaudit.md`) and green permdiff (clean diff, `tests/artifacts/permdiff.json`) — this document records the findings, the fixes, the per surface results and the residual risks with their owners. |
| Release notes truthful | The generated release notes carry only the current changelog version content and the per channel artifact sections. |

A release candidate with any red entry of the checklist stays in the draft state; the go decision itself stays the operator's explicit approval through the `release-approval` environment protection the publication gates hold.
