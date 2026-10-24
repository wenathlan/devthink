# Example plans, workflows and fixtures

This directory ships the sample files the terminal commands operate on: the plans `devthink planlint` lints, the workflows `devthink runworkflow` replays in dry run mode and the recorded page state fixtures `devthink headless` executes read only steps against. Every file is a reviewed example: the plans grant only read kinds, the workflows compose only read steps and the fixtures scope their grants to the kinds their observation satisfies.

## Plan files

A plan file is the schema the `planlint` command parses under schemastrict: the version, the goal, the HTTPS origin, the optional grants and denials of action kinds and the step list. A step carries its id, its kind from the reviewed catalog, its label and its optional target selector, value, options, gate, loop bound and retry attempts. Unknown fields refuse with the path that names them.

```json
{
  "version": "1.1.79",
  "goal": "Read the release notes of the example project",
  "origin": "https://example.org",
  "grants": ["observe", "readtext", "countelements"],
  "steps": [
    { "id": "observe", "kind": "observe", "label": "Observe the release page" },
    { "id": "read", "kind": "readtext", "label": "Read the release notes text", "target": "main" }
  ]
}
```

Lint the whole directory with `node dist/cli.js planlint dist/fixtures/plans`; any error diagnostic exits non zero.

## Workflow documents

A workflow document is the schema the `runworkflow` command loads: the version beside the workflow payload of the composeworkflow grammar — the name, the positive integer version, the granted HTTPS origins and the step list. The command composes the document through the same engine the extension runs, so the kinds verify against the reviewed catalog and the risk grades flow through the same policy table.

```json
{
  "version": "1.1.79",
  "workflow": {
    "name": "changelog digest",
    "version": 1,
    "origins": ["https://example.org"],
    "steps": [
      { "id": "observe", "kind": "observe", "label": "Observe the changelog page" },
      { "id": "read", "kind": "readtext", "label": "Read the changelog text", "target": "main" }
    ]
  }
}
```

Replay a workflow with no side effects with `node dist/cli.js runworkflow dist/fixtures/workflows/changelog-digest-workflow.json --dryrun --quiet`; the command writes its audit trail file beside the workflow after each run and persists its checkpoints so `--resume <runid>` continues from the last checkpoint.

## Fixture files

A fixture file records one page state through the observation schema the live snapshot pipeline writes: the fixture identity, the HTTPS origin it recorded, the observation payload, the fixture scoped grants and the recording time. The observation carries the fields the snapshot captures — the schema version, the url, the title, the text preview and length, the form controls, the interactive elements and the capture time — so the headless replay answers read only kinds from recorded state with no live tab. The grants list scopes what the fixture allows: a kind outside the grants refuses through the fixture consent gate exactly as a live session refuses it.

```json
{
  "id": "example-org-pagestate",
  "origin": "https://example.org",
  "recordedat": 1800000000000,
  "grants": ["observe", "readtext", "readforms", "inspect", "countelements"],
  "observation": {
    "schemaversion": 1,
    "url": "https://example.org/releases",
    "title": "Example releases",
    "textpreview": "Release notes of the example project.",
    "textlength": 512,
    "forms": [{ "label": "email", "type": "email", "name": "email" }],
    "interactive": [{ "selector": "main a", "role": "link", "label": "latest release" }],
    "capturedat": 1800000000000
  }
}
```

Replay a plan against the fixtures with `node dist/cli.js headless dist/fixtures/plans/release-notes-plan.json --fixtures dist/fixtures`; a read only kind with a recorded projection executes, a kind the fixture cannot satisfy reports unsupported and a kind outside the fixture grants refuses under the consent gate.

## Consumption mode examples

The 1.1.81 family ships one runnable example per consumption mode: `cjs.js` requires the library in a plain node script, `bun.ts` imports it through the bun runtime, `deno.ts` imports it through npm specifiers under deno (the sources live in `tests/code`), and the umd example page the build emits as `dist/umd-example.html` loads the umd bundle from a file url with the `window.devthink` global. Every mode exposes the same named exports through the same consent gates; only the adapter seam differs (the node default adapters bind to node apis, the browser build binds to browser apis and the deno adapter reads its configuration through the deno runtime).

## Bridge pairing walkthrough

The `bridge-pairing.md` file walks through the site pairing: the relay url in the extension options, the consent to the first socket connection, the pairing code mint with its countdown, the site join through the code, the chat and review round trip, and the one click revocation.

## Mcp examples

The `mcp-client.mjs` script lists the devthink tools over stdio against the serve command, and the `toolcatalog-walkthrough.md` text walks a client through the catalog namespaces, the consent metadata, the approval gate and the progress subscriptions.

## Native install walkthrough

The `native-install.md` file walks through the native host bridge end to end: the plain node companion build, the install consent with the scope explanation, the reviewed cli installer that writes the host manifest into the user profile directory (with the generated extension id placeholder filled), the attach of the native port behind the per class and per surface consents, the diagnostics report, and the kill switch, the escape hatch and the uninstaller that removes the manifest and its preferences.

## Cross browser smoke walkthrough

The `cross-browser-smoke.md` file walks through the 1.1.86 cross browser build end to end offline: the build that emits the chromium zip, the firefox xpi and the safari skeleton zip beside the existing dist bundles, the apimap build check that asserts every recorded webextension api carries a chromium and a firefox mapping, the firefox prep step that layers the firefox overlay on top of the source manifest, the xpi layout inspection with the addons linter markers inside the budget, the safari skeleton wrapper inspection with the bundle id and the app entitlements, the intersection default set the cross browser feature flags ship, and the load of each artifact into its matching browser (chromium dev mode, firefox `about:debugging`, safari xcode wrapper) — every step proves the kind catalog, the policy gates, the observation schema and the audit trail format stay identical on every browser.

## Self hosted container walkthrough

The `selfhosted-container.md` file walks through the 1.1.87 self hosting container end to end: the multi stage image build whose builder stage runs the whole validation chain (the cli manifest, the cjs require check, the headless smoke, the native smoke and the firefox prep check) before the runtime stage copies the lean output, the three runtime surfaces behind the operator chosen environment (the static site with its immutable cache headers, the socket relay speaking the servercontract at the relay path with the pairing exchange and the token rotation, and the mcp server listener that stays loopback until the operator widens the bind), the pairing of the extension and the site members through the relay, and the digest, sbom and artifact manifest assets the release publishes for the channel.
