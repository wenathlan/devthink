# Saddle browser surface

The root `browser.ts` carries the transport-neutral browser-agent contracts of the engine: session state, context, snapshots, fingerprints, the virtual-browser request/decision/handoff/receipt family, the optional Playwright adapter, recording and agent orchestration (sections 1-9 of the grand merge). It is library logic and is shared by callers; it is not a second copy of the desktop UI.

The user-facing browser application is the existing Tauri shell in `desktop/`, which wraps the compiled `web/dist/public` surface on Windows, Linux and macOS. Android and iOS convert the same web output through Capacitor. This boundary keeps browser behavior in the library and keeps presentation and native packaging in their target surfaces.

## The Manifest V3 extension migrated to devthink (wave 2 regrouping)

The Chrome Manifest V3 extension surface — the former sections 10-17 of `browser.ts` (`extension/permissions`, `extension/protocol`, `extension/content`, `extension/popup`, `extension/pagebridge`, `extension/worker`, `extension/serviceworker`, `extension/build`) — now lives in **`devthink/browserextension.ts`** with every export under the same name and signature. The family rule that drove the move: the saddle is exclusively the virtualization engine (VM / sandbox / microVM / the ninety modalities / vGPU / vCPU) and never touches the browser, GPU, CPU or storage of the user — every feature that runs in the user's browser is not a VM modality and belongs to devthink, the owner of the family extension product (which already packages its own extension through `packageextension.ts` and `crossbrowser.ts`).

What moved with the surface:

| former saddle root file | devthink root file |
| --- | --- |
| `browser.ts` sections 10-17 | `devthink/browserextension.ts` |
| `manifest.json` (MV3 bridge manifest) | `devthink/extensionmanifest.json` |
| `popup.html` | `devthink/extensionpopup.html` |
| `popup.css` | `devthink/extensionpopup.css` |
| `icon32.png` / `icon64.png` / `icon128.png` | `devthink/extensionicon32.png` / `extensionicon64.png` / `extensionicon128.png` |
| `test/extension.test.ts` | `devthink/test/browserextension.test.ts` |

The tracked assets carry the `extension` prefix at the devthink root because devthink already owns its own extension surface (`manifest.json` of record, `popup.ts`, `design.html`) — no root name collides. The build adapter (section 17 of the migrated module) is self-referential: it extracts the seven script sections from `devthink/browserextension.ts` itself, reads `extensionmanifest.json` for the versioned manifest and copies the extension-prefixed assets into an isolated unpacked artifact (default output `build/browserextension`, so it never touches the `build/extension` directory owned by the devthink extension build). The `@wenathlan/saddle/extension` package export and the `extension:build` script retired with the migration — consumers import the surface from the devthink app.

Release filenames identify the user-facing desktop browser with the dotted lowercase pattern `saddle.browser.1.8.14.<format>`. Internal module filenames remain API-compatible unless a deliberate public compatibility migration is documented.
