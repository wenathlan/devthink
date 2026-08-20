# DevThink 1.1.12 web domain plan

## Universal router

`web/App.tsx` remains the only universal browser router. It imports page anchors only: `home/Home.tsx`, `providers/Providers.tsx`, `projects/Projects.tsx`, `routes/Routes.tsx`, `usage/Usage.tsx`, `settings/Settings.tsx` and `notfound/NotFound.tsx`.

## Page domains

| Current surface | Target domain | Local files |
| --- | --- | --- |
| `pages/Home.tsx`, `EntryScreen.tsx`, `TerminalWorkspace.tsx`, `CommandPalette.tsx`, `PairingPanel.tsx` | `web/home` | `Home.tsx`, `entry.tsx`, `workspace.tsx`, `palette.tsx`, `pairing.tsx`, `types.ts` |
| `pages/Providers.tsx` | `web/providers` | `Providers.tsx`, `form.tsx`, `state.ts` |
| `pages/Projects.tsx` | `web/projects` | `Projects.tsx`, `list.tsx`, `state.ts` |
| `pages/Routes.tsx` | `web/routes` | `Routes.tsx`, `list.tsx`, `state.ts` |
| `pages/Usage.tsx` | `web/usage` | `Usage.tsx`, `summary.tsx`, `state.ts` |
| New paired browser settings surface | `web/settings` | `Settings.tsx`, `pairing.tsx`, `preferences.tsx` |
| `pages/NotFound.tsx` | `web/notfound` | `NotFound.tsx` |

## Shared code boundary

The generic `web/components` directory is removed. The existing generic UI building blocks move to `web/primitives`, while application infrastructure moves to `web/app`: `ErrorBoundary`, theme context, shared local identity helpers and non-page utility contracts. A domain must not import private view files from another domain; it may only import an exported page anchor, root shared runtime contract or primitive.

## Interaction placement

Session and section tabs are owned by `web/home/workspace.tsx`. Provider mutation belongs to `web/providers/form.tsx`. Temporary browser pairing belongs to `web/settings/pairing.tsx` and may be summarized in the workspace without duplicating its logic. This removes duplicate header marks, keeps the page root understandable and preserves direct route paths through the universal router.
