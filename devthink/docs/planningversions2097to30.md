# The version ladder — 2.0.97 to 3.0

The owner's order (2026-10-12): the commits ride a hierarchical ladder of
"casinhas" (minor houses). Each house carries 200 patch steps. The current
house is 2.0 and it started at 2.0.97. When a house reaches .200 the next
house opens at .0. The last house closes into 3.0.

## The ladder

| house | steps | closes into |
| --- | --- | --- |
| 2.0 (running) | 2.0.97 → 2.0.200 | opens 2.1.0 |
| 2.1 | 2.1.0 → 2.1.200 | opens 2.2.0 |
| 2.2 | 2.2.0 → 2.2.200 | opens 2.3.0 |
| 2.3 | 2.3.0 → 2.3.200 | opens 2.4.0 |
| 2.4 | 2.4.0 → 2.4.200 | opens 2.5.0 |
| 2.5 | 2.5.0 → 2.5.200 | opens 2.6.0 |
| 2.6 | 2.6.0 → 2.6.200 | opens 2.7.0 |
| 2.7 | 2.7.0 → 2.7.200 | opens 2.8.0 |
| 2.8 | 2.8.0 → 2.8.200 | opens 2.9.0 |
| 2.9 | 2.9.0 → 2.9.200 | opens 3.0 |

Total: ~2.104 hierarchical steps from 2.0.97 to 3.0.0.

## The rules of the ladder

- One commit answers one step; the step number rides the commit message
  footer as `step: 2.0.NN`.
- A release tag only cuts when its gate ladder is green (permdiff +
  apifreeze synced AFTER every bump — the 2.0.97 publish skipped for
  exactly this reason and the lesson is law now).
- Every house closes with: release notes carrying 300+ assets, the Brave
  control extension shipped in the assets, the family fully functional.
- No house opens while the previous house still has a red gate.

## The milestones per house

- **2.0.97 → 2.0.120 — the eradication wave**: the current design dies in
  every app. The neodevthink doctrine (decompose the reference into
  properties, redistribute section by section, index by index, layer by
  layer) replaces the vibe-code passes. Zero dots, zero ragged, zero emoji,
  zero special characters standing in for icons — animated icons only.
- **2.0.120 → 2.0.150 — the standardization wave**: one design grammar in
  every app; the DevThink OS keeps the Windows 10/11 + trylle presentation
  with the web face AND the installed face (app, CLI, extension share the
  design, the screens and responsiveness differ per target).
- **2.0.150 → 2.0.180 — the library wave**: the shared logics move into the
  published library; apps import from the library, never from a direct
  path into a sibling folder.
- **2.0.180 → 2.0.200 — the functional wave**: Debonair answers as the AI
  music studio (the suno.com shape), every family app answers its real
  function end to end.
- **2.1 → 2.9 — the depth waves**: graphs and nodes methodology per app
  (~300 correlated logics each), the extension lane, the 300+ asset
  release lanes hardened, the OS surfaces per target.
- **3.0 — the platform stamp**: the super platform certified.

## The library law (registered 2026-10-12)

When the apps interact with each other, the logics ride the PUBLISHED
library package — never a direct import path across sibling folders. The
shared modules (family, theme, onboardingstate, zoomlock, cleanurl,
gateway clients) converge into the library; the apps consume its public
surface. A direct cross-folder import is a defect.
