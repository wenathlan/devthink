# DevThink 1.1.9 correction checklist

- [x] Reaudit OpenCode, Xyplugin, Kiwi plugin and `logo.md` file by file; record canonical evidence.
- [x] Preserve **DevThink** as the sole product and platform name; treat `v1.1.1` only as the release identifier.
- [x] Replace the generic route module with the embedded configuration and login contract evidenced by the canonical plugins.
- [x] Persist user-owned configuration in `~/.config/devthink/devthink.json` with atomic merge and credential redaction.
- [x] Migrate the web application to `/web` with no `src` directory or nested `client/src` structure.
- [x] Replace the current mark with the ANSI logo defined in `docs/logo.md` for CLI and web surfaces.
- [x] Correct README, changelog, workflow title and GitHub release metadata to DevThink v1.1.1.
- [x] Validate CLI, configuration persistence, web build and corrected release assets before delivery.

## Next architecture iteration

- [x] Read and index every supplied document and every file under `docs/`, including nested directories and non-text assets.
- [x] Extract a safe provider and endpoint matrix, excluding cookie capture, CAPTCHA bypass and browser-session automation.
- [x] Define one shared stable identifier for local project, session, tab, route and message records.
- [x] Add URL-addressable workspace, tab and section routes to the web workbench.
- [x] Extend the embedded gateway and CLI session contract to use the same stable identifiers.
- [x] Add user-owned local persistence for sessions and messages, with an explicit portable database adapter boundary.
- [x] Validate the CLI, gateway, URL routing, persistence, web build and release workflow before publication.

## Publication

- [x] Push commit `43c2a47` to the configured GitHub repository.
- [x] Realign `v1.1.1` to the published iteration and rebuild the three Bun binaries.
- [x] Provide the user with a safe manual test checklist for provider keys and local gateway connectivity.

## Auth JSON migration

- [x] Re-read all documented `auth.json` schemas and classify official credential fields separately from browser-session material.
- [x] Define and implement `~/.config/devthink/auth.json` for explicitly supplied API keys, bearer tokens, and provider-owned OAuth records only.
- [x] Migrate CLI credential commands, redaction, documentation, and tests to the separated auth store.

## Identity and synchronized workspaces

- [x] Define a stable public user identifier and device-bound local identity record.
- [x] Add short-lived one-time pairing codes that never persist as a reusable password.
- [ ] Create opt-in remote records for workspaces, sessions, tabs and messages, excluding provider credentials.
- [x] Add CLI commands to initiate, complete, inspect and revoke web pairing.
- [ ] Add web login, pairing, sync status and conflict-safe replication using the same IDs as the local gateway.
- [x] Validate device revocation, code expiration, local-only operation and bidirectional session replication.

## Static publication and sync boundary

- [x] Read and classify every documented YAML workflow relevant to Pages, releases, artifacts and API deployment.
- [x] Add a GitHub Pages workflow that builds and publishes the root `/web` application.
- [x] Implement local CLI-to-web pairing through the embedded gateway with one-time expiring codes.
- [x] Provide a configurable remote-sync adapter contract without claiming that GitHub Pages or Actions is a realtime database.
- [x] Document the external API and database requirement for cross-device synchronization.

## Final v1.1.1 rebuild

- [x] Realign the v1.1.1 tag to the final Pages and pairing commit.
- [x] Rebuild and verify the Linux, macOS, and Windows Bun artifacts from that tag.

## Public repository lowercase release repair

- [x] Confirm the lowercase repository identity, Pages status and current v1.1.1 tag state.
- [x] Confirm the converted TypeScript compatibility features are integrated into root modules.
- [x] Repair the Pages workflow and site enablement after the reported `configure-pages` failure.
- [x] Re-run checks and build the Linux x64, macOS arm64 and Windows x64 Bun artifacts.
- [x] Publish the v1.1.1 GitHub release and attach the verified binaries.

## Local-first entry and pairing

- [x] Add a first-visit entry screen that can create a temporary local DevThink identity without provider credentials.
- [x] Make the manual gateway endpoint an advanced optional setting rather than a required entry field.
- [x] Define short user, workspace, session and chat identifier rules with safe local persistence.
- [x] Add a CLI-issued pairing link that carries ephemeral connection metadata without exposing user credentials.
- [ ] Prepare QR and WebAuthn user interface boundaries without claiming a hosted authentication service exists.
- [ ] Document why durable web accounts, cross-device sync and email verification require a backend or user-operated service.
- [ ] Validate the entry flow, local pairing, security boundary, CLI tests and Pages build before public publication.

## Private data API boundary

- [ ] Keep database administrator, read and write credentials out of GitHub Pages bundles and browser storage.
- [ ] Define distinct service credentials and short-lived user sessions for any future database API.
- [ ] Select an authenticated API and database runtime before adding Prisma or Drizzle persistence.
- [ ] Do not claim that a static GitHub Pages build or repository secret is a private database service.
- [ ] Keep email verification out of scope until a separate delivery service is intentionally configured.

## Static portability boundary

- [ ] Keep `/web` deployable as a static build on GitHub Pages, Vercel and Netlify without platform functions.
- [ ] Keep Prisma, Drizzle, libSQL and SQLite server adapters outside browser bundles unless a browser-safe public-data adapter is explicitly selected.
- [ ] Keep all database write and administrator capability server-side or local to the user-owned CLI.
- [ ] Provide portable TypeScript contracts for a future API without treating static hosting as that API.

## Workflow catalog review

- [ ] Review Pages, automation, security, CI and deployment workflow templates from the GitHub catalog.
- [ ] Record which templates improve build, release, quality checks and static deployment.
- [ ] Keep workflow secrets restricted to jobs and prevent them from entering the published web artifact.
- [ ] Add only workflows that preserve static portability across GitHub Pages, Vercel and Netlify.

## DevThink workflow readaptation

- [x] Inventory every workflow and retain its release, build, Pages, CI or security responsibility.
- [x] Replace project-legacy metadata and presentation with DevThink/DevTink terminology.
- [x] Preserve Bun compilation for Linux x64, macOS arm64 and Windows x64 release artifacts.
- [x] Consolidate duplicated validation logic without removing a trigger, artifact or safety check.
- [x] Validate workflow YAML, manual triggers, release tag flow and static Pages deployment before publication.

## Expanded workflow reconciliation

- [x] Integrate the remote workflow expansion without overwriting user-added files.
- [x] Classify all new ecosystem and target workflows before deduplicating shared logic.
- [x] Preserve every added trigger, package target, artifact and security check during DevThink readaptation.
- [x] Validate the reconciled workflow collection before a non-force push to main.

## In-folder workflow consolidation correction

- [x] Restore every operational workflow capability to `.github/workflows` rather than treating docs as its replacement.
- [x] Merge duplicate YAML logic only into category-level DevThink workflows within the workflows directory.
- [x] Retain the Bun release methods, package publication capabilities and every active trigger after consolidation.
- [x] Readapt package scope, README and package metadata for `@wenathlan/devthink` before validation.

## Compact identity and web parity

- [x] Replace new shared record identifiers with compact 10–15 character IDs while preserving uniqueness and route safety.
- [x] Provide compatibility for existing longer local identifiers during the transition.
- [x] Implement functional web pages for providers, routes, usage and projects.
- [x] Map each web action to a CLI or gateway equivalent and document unsupported local-only operations.
- [x] Move this checklist from the repository root to `docs/todo.ts.md` without losing its completed history.
- [x] Validate compact routes, provider configuration, projects, usage and CLI parity before publication.

## DevThink 1.1.1 workflow and publication reconciliation

- [ ] Audit commit `ffd2c4fd`, active workflows, releases, branches and open pull requests before any remote cleanup.
- [x] Update the DevThink CLI and static workbench metadata to 1.1.1 without adding a second npm distribution surface.
- [ ] Refresh direct dependencies, lockfiles and GitHub Actions to current compatible releases, including the requested Node 26.7.0 runtime where supported.
- [ ] Restore and readapt supported npm, Maven, NuGet, RubyGems and container publication capabilities without publishing unsupported empty package targets.
- [ ] Validate CLI tests, web checks, static build, workflow syntax and package-release conditions for 1.1.1.
- [ ] Commit and push the 1.1.1 reconciliation after validation.
- [ ] Present the exact pull requests, releases and non-main branches slated for closure or deletion and obtain confirmation before the destructive remote cleanup.

## Distribution completion and remote cleanup

- [x] Remove `@wenathlan/devthink.web` from package metadata, documentation and npm publication workflows; retain only `@wenathlan/devthink` on npm.
- [ ] Audit GitHub Packages, GHCR, Maven, NuGet, RubyGems, container, extension, desktop, Android and iOS targets against real project source manifests.
- [ ] Add a portable `extension/` source surface derived from the static workbench and produce browser-extension artifacts.
- [ ] Define source-backed Bun-first artifact boundaries for desktop and mobile targets without fabricating Maven, NuGet or RubyGems packages.
- [ ] Attach supported target artifacts to tagged GitHub releases and keep unsupported targets explicitly skipped with source-detection evidence.
- [ ] Close pull requests #1, #2, #3, #4, #5, #7, #10 and #11 and delete their matching Dependabot branches, leaving only `main`.

## DevThink 1.1.7 security remediation

- [x] Verify available alert evidence: Dependabot GraphQL reports zero open alerts; web audit reports zero findings; current OSV, Trivy, verified-secret and CodeQL runs succeed. Repository alert REST endpoints remain unavailable to the active GitHub integration.
- [x] Resolve all remediable dependency, container and workflow findings without suppressing or downgrading active security gates.
- [x] Update all active product metadata, manifests and release documentation to 1.1.7.
- [x] Validate local tests, package audits, OSV, Trivy evidence and GitHub Actions security results before publication.
- [x] Commit and push the complete 1.1.7 security remediation.

## DevThink 1.1.8 workflow security and package completion

- [x] Remediate CodeQL alerts #202, #203 and #206 through #213 without disabling privileged workflow protections.
- [x] Verify every workflow checkout uses a trusted, explicit release reference before it accesses package or registry credentials.
- [x] Add source-backed Maven, NuGet and RubyGems package surfaces with distribution metadata and validation.
- [x] Update product manifests, release documentation and package wrappers to 1.1.8.
- [x] Validate CLI, workbench, package builds, YAML, CodeQL and security workflows before publishing.
- [x] Publish and verify all supported 1.1.8 packages and release artifacts.

## Workflow-owned package layout correction

- [x] Review Saddle publication workflows as read-only reference; do not modify the Saddle repository.
- [x] Remove the DevThink `packages/` directory and keep source manifests required by package ecosystems at the repository root.
- [x] Update Maven, NuGet and RubyGems workflows to build and publish root manifests on the GitHub runner.
- [x] Preserve the existing mobile, extension and container source surfaces and validate the reorganized workflows.

## Root runner configuration correction

- [x] Inspect the Saddle root in read-only mode to confirm its publication-support file layout.
- [x] Remove `lib/` from DevThink and create any Ruby package source only within the publishing workflow.
- [x] Add root `settings.xml`, `.npmrc` and `.nvmrc` files for deterministic GitHub Actions publication.
- [x] Validate the revised root layout and workflow-owned package construction.

## Saddle workflow adaptation and cache retention

- [x] Inventory all Saddle workflows and identify compatible capabilities absent from DevThink.
- [x] Compare cache-retention policy, release validation, dependency submission and workflow automation against DevThink.
- [x] Make cache cleanup more aggressive and remove accumulated GitHub Actions caches beyond the retained limit.
- [x] Adapt only compatible, secure and product-relevant workflow capabilities to DevThink.
- [x] Validate the resulting workflows, security boundaries and cache-retention behavior.

## DevThink workspace visual redesign

- [x] Study the supplied workspace, component, animation and shape references without copying third-party source verbatim.
- [x] Define a shared DevThink visual system for the web and CLI: black workspace surfaces, signature orange and restrained orb blue.
- [x] Redesign web entry, workspace navigation, tabs, terminal canvas, providers, projects, routes, usage and settings with parity to CLI concepts.
- [x] Modernize CLI presentation using the canonical ANSI logo and the same information hierarchy, commands and semantic states.
- [x] Validate responsive web behaviour, keyboard access, reduced-motion support, contrast and CLI snapshots.
- [x] Commit the redesign with a concise implementation and testing record.

## Unified terminal workspace release

- [x] Analyze the supplied package manifest and adopt only dependencies that are compatible with the DevThink CLI and Bun distribution.
- [x] Replace the multi-panel dashboard treatment with one sparse terminal-workspace grammar shared by web and CLI.
- [x] Build the web shell around category tabs, entry list, central empty or active state, large pixel DevThink mark and bottom command bar.
- [x] Build the CLI interactive shell around the same category tabs, active entry view, command line and semantic status language.
- [x] Preserve accessibility, local pairing, provider configuration, compact IDs and all existing product routes under the unified shell.
- [x] Update active release metadata to the next requested version and validate all supported builds before publication.
- [x] Commit, tag, publish and verify the unified terminal-workspace release.
