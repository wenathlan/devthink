# DevThink v1.1.11 web inventory

## Historical scope

The reachable repository history contains 40 commits. Sixteen commits altered `/web`, from the initial public workbench through the v1.1.10 browser-workspace release. A path-level history scan found no deleted or renamed `/web` files. The control pages and components therefore still exist in the current tree; the current issue is primarily visibility and integration inside the new workspace shell, not source deletion.

| Historical capability | Current source surface | Current route or access |
| --- | --- | --- |
| Local entry and first intention | `web/pages/Home.tsx`, `web/components/EntryScreen.tsx` | `/` and workspace route |
| Streamed local chat | `web/pages/Home.tsx`, `web/components/TerminalWorkspace.tsx` | `/w/:workspaceId/s/:sessionId/t/:tabId/:sectionId` |
| Provider selection | `web/pages/Providers.tsx` | `/providers` |
| Workspace and project index | `web/pages/Projects.tsx` | `/projects` |
| Local gateway route map | `web/pages/Routes.tsx` | `/routes` |
| Local usage ledger | `web/pages/Usage.tsx` | `/usage` |
| Pair and revoke browser access | `web/components/PairingPanel.tsx` | settings section of the home workspace |
| Command palette | `web/components/CommandPalette.tsx` | workspace keyboard interaction |
| Supporting browser components | `ChatCanvas`, `ControlShell`, `Inspector`, `OrbitAperture`, `ProviderRail`, `WorkspaceTabs` | retained in `/web/components` |

## Current navigation finding

The React router continues to expose `/providers`, `/projects`, `/routes`, `/usage` and the compact workspace route. The v1.1.10 home shell makes the categories and pairing settings visible, but it does not currently make the four control pages first-class destinations inside its workspace navigation. Version 1.1.11 will integrate those preserved pages into the same browser-shaped system rather than remove any direct route.

## CLI capability finding

The CLI already supports providers, projects, usage, routes, sessions, models, modes, config, auth, identity, pairing, sync, gateway, server start and chat. Its Ink renderer currently exposes only first intention, free-form chat, categories and a limited set of slash commands. Version 1.1.11 needs views or command affordances for the user-facing shared operations, while retaining CLI-only capability for local secrets, server lifecycle and credential-free snapshots.
