# DevThink v1.1.13 web inventory

## Current tracked structure

| Location | Files | Current responsibility | Consolidation decision |
| --- | ---: | --- | --- |
| `web/app` | 3 | Error boundary, unused Manus dialog and shared control-page shell | Inline the error boundary at root, remove the unused dialog, promote the control shell to one flat named root file. |
| `web/contexts` | 1 | A second theme provider | Remove it and make the paired preference state in Home the single theme authority. |
| `web/hooks` | 3 | IME, mobile breakpoint and stable callback helpers used only by old primitives or the map | Inline the map callback behavior; delete hooks used only by removed primitives. |
| `web/lib` | 1 | `cn` class-name helper | Inline the only required class join in the Routes map and remove the directory. |
| `web/primitives` | 53 | Former shadcn generator surface | Only button/card/toast/tooltip have direct product consumers; replace these with local semantic elements or direct package imports and delete unused wrappers. |
| `web/public` | 1 | Empty `.gitkeep` | Delete the directory. |
| `web/main.tsx` | 1 | React mount and stylesheet import | Move its three-line responsibility into `App.tsx`; point `index.html` directly at `App.tsx`. |
| `web/index.css` | 1 | Global styles | Consolidate repeated v1.1.10–v1.1.12 workspace selector blocks into one current grammar. |

## Duplicate patterns

The stylesheet contains multiple overlapping definitions for `terminal-workspace`, `browser-chrome`, `terminal-entry-screen`, `entry-command`, `terminal-canvas` and `workspace-rail`. Earlier workspace blocks remain before later override blocks, which makes the cascade carry duplicate frame logic. The release must retain one authoritative set of these selectors.

The generated primitives are not product-owned design. Their broad presence conflicts with the actual usage graph: Home has one button wrapper dependency, NotFound uses one button and one card wrapper, and the root uses toast and tooltip wrappers. Most primitive files are not direct product dependencies and should not remain as a generic library.

## Parity boundary

The web can represent sessions, providers, projects, routes, usage, pairing and workbench preferences. The CLI and Ink renderer own credentials, filesystem operations, server lifecycle and local secret-bearing stores. The consolidation may change file ownership but must not change that boundary.

## Entry decision

Vite requires a browser module in `index.html`, but it does not require a file named `main.tsx`. The static document can load `/App.tsx` directly. `App.tsx` will import the stylesheet and mount itself to `#root`, yielding one root application file and one mount path.
