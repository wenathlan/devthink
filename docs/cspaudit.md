# Content security audit

The extension ships a content security policy set the cspaudit gate verifies at every release: the root manifest declares one extension pages policy, both browser overlays (the `browsers.firefox` and the `browsers.safari` sections of the root `manifest.json`) carry the same policy so every webextension dialect answers the identical frozen rules, and the shipped chromium manifest copy answers the same audit. `tests/cspaudit.mjs` extracts every policy, parses its directives and refuses the release on any violation; the results per surface land in the audit report the gate prints and in `docs/securityreview.md`.

## The policy set

| Surface | Policy |
| --- | --- |
| root `manifest.json` | `script-src 'self'; object-src 'self'; frame-ancestors 'self'` |
| `manifest.json` → `browsers.firefox` | `script-src 'self'; object-src 'self'; frame-ancestors 'self'` |
| `manifest.json` → `browsers.safari` | `script-src 'self'; object-src 'self'; frame-ancestors 'self'` |
| `dist/extension/manifest.json` (the shipped copy) | identical to the root policy |

The `script-src 'self'` and `object-src 'self'` sources pin every script and object to the local extension package: no remote script, no data url, no inline script and no wildcard ever loads on an extension page. The `frame-ancestors 'self'` directive refuses framing by remote origins — only the extension's own pages frame each other (the options page embeds the transparency page), so a remote page can never embed a devthink surface.

## The audit rules

The gate enforces one rule per check, and any failure exits nonzero:

1. **every policy parses**: each directive appears at most once and every policy splits into its name and its source list.
2. **no eval, no remote code, no unsafe sources, no wildcards**: every script, style, connect, frame, image and font source stays `'self'`; any `*`, any `http(s)://` source, any `unsafe-eval`, `unsafe-inline` or `data:` url in a frozen policy refuses the release.
3. **the overlays and the shipped copy stay consistent**: one dialect difference would weaken one browser, so the firefox overlay, the safari overlay and the packaged chromium manifest must carry the byte identical policy of the root manifest.
4. **no injected code path uses eval or remote code**: every built bundle under `dist/extension` refuses `eval(` calls, remote `importScripts`, remote script tag injection; the dynamic function construction of reviewed evaluate expressions stays confined to the two executors the design names — the isolated world executor of the background and the page executor of the pagebridge — with the site counts matching their reviewed sources (`background.ts` and `page.ts`), so every dynamic construction traces to a reviewed evaluate step.
5. **the pagebridge script stays the only injected file**: every `files` array the scripting api injects names `pagebridge.js` alone, and the built pagebridge bundle ships.
6. **every extension page loads local resources only**: every `src` and `href` of every built page stays a package relative file — no remote resource, no absolute path, no inline event handler attribute.
7. **the dashboard renders untrusted extracts inside the sandbox frame**: the manifest declares `sandbox.html` under the sandbox key, the built sandbox page speaks the `devthinksandbox` channel with a fully sandboxed iframe (`sandbox=""`), and the one web design file carries both the sandbox and the dashboardpage surface templates.

## Rerunning the audit

```bash
pnpm build && node tests/cspaudit.mjs
```text

The gate runs against the built extension bundles so it answers for the shipped artifacts, prints one deterministic json report with every extracted policy, its directives, the audited bundle and page sets, the dynamic function site counts and the sandbox frame declaration, and exits nonzero on any failure. The audit joins `pnpm validate` through the `validate:security` chain and the verify workflow beside the api freeze.
