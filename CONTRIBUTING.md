# Contributing to DevThink

DevThink welcomes contributions that improve the merged workbench — the universal gateway library, the browser extension surfaces, the Antigravity engine, the terminal CLI, the documentation, the tests and the security posture. Contributions are licensed under the repository GPL-3.0-only license unless a different compatible arrangement is agreed in writing before acceptance.

A pull request should explain the change, include focused verification, preserve the layout conventions below and avoid credentials, private data or generated artifacts — `dist/` and `distpackage/` are build outputs of `node tests/build.mjs`, never hand-edited sources. Security vulnerabilities must use the private process in `SECURITY.md` rather than a public issue.

Keep the package library-first and dependency-light. New browser capabilities need a typed contract, a local policy gate, a user-visible consent state, a deterministic test and an audit event. A capability that needs a new permission must include a written least-privilege justification and manifest validation.

## Clean-room policy

Contributions must not import, paste, decompile or repackage source from third-party browser extensions unless the contributor has the right to do so and documents the applicable license and notices. Product behavior can be independently designed from public documentation and testable observations.

## Development setup

1. Fork the repository and create a branch from `main`.
2. Install the dependencies with `bun install`. The repository pins bun 1.4.0 through the `packageManager` field and keeps `bun.lock` as the single root lockfile; the static workbench under `web/` carries its own pnpm lockfile mirror (`pnpm --dir web install`).
3. Generate the Prisma client with `bun run db:generate` before running the type gate — the gateway family types ride the generated client of `web/schema.prisma` through `prisma.config.ts`.
4. The provider family suites run under node as well: `bun run test:node` (node `--experimental-strip-types --test` over the core and `tests/provider/`).

## Gates that must pass

Every change must pass the gates that continuous integration runs:

- `bun run check` — the secret scan plus the deterministic vitest suite (`check:secrets` + `vitest run`)
- `bun run lint` — biome lint
- `bun run typecheck` — `tsc --noEmit`, run after `db:generate` so the Prisma client types exist
- `node tests/build.mjs` — the root build: every dist target, the extension surface, the static site, the frozen schemas, the flat `distpackage/` staging and the checksums
- `npm run pack:check` — `npm pack --dry-run` over the staged flat package
- `pnpm validate` — the full candidate chain (`check:metadata`, `validate:runtime`, `check`, `build`, `validate:security`, `validate:agents`, `validate:workflow`, `validate:apifreeze`, `validate:docs`, `validate:candidate`, the recipes runner, the suite, the cli smoke and the packageextension verification)

Before opening a pull request, run the validate chain and the package check; `bun run lint` and `bun run typecheck` must pass for every contribution.

## Layout conventions

- The root `.ts` files hold the library surfaces, one file one responsibility: the extension family, the server family (`engine.ts`, `http.ts`, `config.ts`, `oauth.ts` and the `server.ts` library surface — the console cli, the opencode registrations and the barrel interned) and the provider family (`oauth.ts`, `devthink.ts`, `debug.ts`, `versionregistry.ts`, `antigravity.ts` and the `server.ts` barrel namespaces). Keep them free of provider-specific hardcoding.
- `web/` is organized as pages in folders; there is no `main.tsx` — the entry and app surfaces own React mounting.
- `web/gatewayview/` holds the embedded gateway console page (`Gateway.tsx`) with the shipped version catalog (`config.ts`) and its view-side structural contract (`definition.ts`); `web/schema.prisma` at the web root is the database schema, and `web/console/` draws the canonical design of the cli.
- `web/extension/` carries the extension surfaces (popup, sidepanel, options, dashboard, transparency) built from the one design file `web/index.html`.
- `docs/` holds the numbered reference documentation; `tests/` holds the flat suite with the `tests/server/` and `tests/provider/` family suites.

## Commit messages

Use conventional commits: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`, `ci:`.

## Adding a cli command

A new cli command lives behind the same contract as the existing surface: the pure logic (parsing, findings, summaries, exit code mapping) lands in `cli.ts` with its typed contracts in `types.ts`, the impure terminal work (argument parsing, file reads, stdout writes) stays in `devthink.ts`, the command shares the policy, protocol, memory or progress module it validates instead of keeping a copy, the vitest suite grows a case in `tests/clitools.test.ts`, the exit codes map onto the documented failure classes, the help lists the command with its one line description, and the docs update covers the configuration page and the readme command table. The merged family CLIs follow the same shape: a `gateway <command>` routes through the server console family, a `provider <command>` routes through the `devthink.ts` provider entry, and both answer the `devthink` router rather than shipping their own bins.

## Adding a build target

A new build target lives behind the same contract as the existing modes: the target registers in the build orchestrator (`tests/build.mjs`) with its output name, its format, its platform and its size budget line, the exports map of `package.json` carries its condition when it is a consumption entry, the tarball content check asserts it ships, the checksums file covers it, the naming check keeps it free of underscored identifiers, the sourcemap and the minified variant emit beside it, the bundlestamp reports its mode and target, the api surface snapshot compares its exports with the esm core, and the multi runtime matrix of the verify workflow exercises it when its runtime applies.

## Running the site locally from static files

The static site runs fully from its own assets: open `web/index.html` from a local file or serve the built `dist/site` directory from any static host, type the relay url of your relay and the pairing code from the extension options, and the chatbridge pairs through the servercontract. The test relay of the vitest suite (`tests/testrelay.mjs`) implements the same contract on a localhost random port for the e2e round trip, and the container runner of the one `Dockerfile` serves the static site for local bridge testing — no serverless function file exists in the repository.

## Adding a tool to the catalog

A new tool of the mcp toolcatalog lives behind the same contract as the existing surface: the tool definition lands in `tools.ts` with its namespaced name, its wrapped action kind, its json schema inputs, its consent metadata (the review text, the risk class that must match the policy grading exactly, the approval requirement for every side effect and the session origin scope) and its openapi style description; the vitest suite grows the schema and consent assertions; the approval gate test covers the sensitive grade; the `docs/16.mcpserver.md` list gains the tool with its consent requirement; and the mcp client example keeps listing it through the transports.

## Adding a native surface

A new native surface of the companion process lives behind the same contract as the existing desktop surfaces: the surface definition lands in the `nativesurfacecatalog()` of `bridge.ts` with its surface name, its call class (read, interaction or sensitive — the class must match the consent posture, because a dialog that addresses the user stays sensitive and a notification stays interaction) and its description; the companion answers it in `companion.ts` behind the consent stamps of the calling frame; the vitest suite grows the enumeration and the consent refusal assertions in `tests/nativebridge.test.ts`; the options page gains its consent checkbox beside the os dialog and notification surfaces; and the `docs/17.nativebridge.md` consent model gains the surface with its grant boundary. A surface never opens from a class grant alone, the sensitive class routes through the human approval gate, and the surface result returns to the plan engine as structured details with the secret exclusion applied.

## Adding a release channel

A new release channel lives behind the same contract as the existing ones: the pure channel logic (the artifact layout, the naming and the metadata check) lands in the packaging module (`pack.ts` — the vsix, maven, nuget and container channel families live there with their typed contracts in `types.ts`), the channel name joins the `artifactchannels` catalog and the channel resolution of the artifact manifest so the manifest and the notes map the artifacts of the channel, the release workflow gains a channel job that gates on the assemble job (with the `release-approval` environment when it publishes to a registry, and the bounded three attempt retry policy on its publish step), the attestation job needs the new channel so the provenance covers it, the workflowcheck asserts the job and its controls, the release notes generator lists the channel artifacts in its per channel sections, `docs/19.distribution.md` documents the channel and its artifact names, `docs/packagenaming.md` records the name pattern, and the vitest suite grows the channel layout and metadata assertions. A channel never publishes outside the reviewed release workflow and never names a vendor endpoint, a download url or a marketplace default — the operator supplies every destination and credential.

## Documentation requirements

Every documentation change runs through the doccheck gate (`node tests/doccheck.mjs` after the root build): the kind documentation must cover every action kind of the catalog exactly, every reference table must mirror the code it documents, every doc link must resolve, every code block must state its language, and the changelog must cover every released version. New action kinds, cli commands, mcp tools, protocol messages, audit kinds or configuration keys document in `docs/kinddocs.md` and `docs/refdocs.md` in the same change that introduces them — the gate refuses the release otherwise.

## Release process

1. Bump the `version` field in `package.json`.
2. Add the matching `## {version} — Title` section to `CHANGELOG.md`, newest first.
3. Run `bun run sync:metadata` so every root metadata file carries the version — the `pom.xml` `<revision>`, `devthink.csproj`, `devthink.gemspec`, `web/extension/manifest.json`, `web/package.json` and the mobile shell stay in lockstep with the package version (the envelopes gate enforces it).
4. Push to `main` and let the maintenance ladder cut the `v{version}` tag and dispatch the release workflow, or dispatch it directly with the tag input. The release workflow builds every artifact, verifies the channels, assembles the release with the curated notes extracted from the changelog, and publishes npmjs, GitHub Packages npm, Maven, NuGet, RubyGems and GHCR.
