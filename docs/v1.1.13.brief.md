# DevThink v1.1.13 flat domain consolidation

## Objective

Version 1.1.13 removes the remaining generic web infrastructure folders and consolidates duplicated presentation or interaction code. The React workbench must remain a static portable client, while the local CLI and paired gateway remain the only owners of credentials and mutable local state.

## Required structure

| Concern | Required destination |
| --- | --- |
| React bootstrap and router | Flat `web/App.tsx` entry, mounted directly from `web/index.html` |
| Global stylesheet and browser document assets | Flat `web/index.css` and `web/index.html` only |
| Page interaction, local view models and owned visual elements | The relevant page domain: `home`, `providers`, `projects`, `routes`, `usage` or `notfound` |
| Reusable element used by more than one page | One explicitly named owner domain, not a generic primitives or components directory |
| Error boundary and browser-only fallback | Flat root application file unless its use becomes page-specific |
| Static public output | Build output only; no tracked `web/public` source directory |

## Rules

The repository must not retain `web/app`, `web/contexts`, `web/hooks`, `web/lib`, `web/primitives`, `web/public`, `web/components`, `web/pages`, or `web/src`. A file moved from one directory must have one final owner; compatibility copies are prohibited. The workbench must retain direct URL routes, static deployment compatibility, keyboard access, reduced-motion behavior, and the paired local gateway boundary.

## Web-CLI parity

Every safe browser action must correspond to an existing CLI command or an Ink workspace action. Every safe CLI operation that has a browser-safe representation must remain reachable from a browser route, tab, command palette action, or paired settings surface. Provider tokens, auth records, server lifecycle control, and filesystem-level operations remain local CLI-only capabilities.

## Completion criteria

The release is accepted only if the final web tree follows the structure above, has no stale imports or duplicates, passes TypeScript and static builds, preserves the CLI test suite, and records the exact 1.1.13 additions in release notes.
