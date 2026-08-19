# DevThink 1.1.0 correction checklist

- [x] Reaudit OpenCode, Xyplugin, Kiwi plugin and `logo.md` file by file; record canonical evidence.
- [x] Preserve **DevThink** as the sole product and platform name; treat `v1.1.0` only as the release identifier.
- [x] Replace the generic route module with the embedded configuration and login contract evidenced by the canonical plugins.
- [x] Persist user-owned configuration in `~/.config/devthink/devthink.json` with atomic merge and credential redaction.
- [x] Migrate the web application to `/web` with no `src` directory or nested `client/src` structure.
- [x] Replace the current mark with the ANSI logo defined in `docs/logo.md` for CLI and web surfaces.
- [x] Correct README, changelog, workflow title and GitHub release metadata to DevThink v1.1.0.
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
- [x] Realign `v1.1.0` to the published iteration and rebuild the three Bun binaries.
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

## Final v1.1.0 rebuild

- [x] Realign the v1.1.0 tag to the final Pages and pairing commit.
- [x] Rebuild and verify the Linux, macOS, and Windows Bun artifacts from that tag.

## Public repository lowercase release repair

- [x] Confirm the lowercase repository identity, Pages status and current v1.1.0 tag state.
- [x] Confirm the converted TypeScript compatibility features are integrated into root modules.
- [x] Repair the Pages workflow and site enablement after the reported `configure-pages` failure.
- [x] Re-run checks and build the Linux x64, macOS arm64 and Windows x64 Bun artifacts.
- [x] Publish the v1.1.0 GitHub release and attach the verified binaries.
