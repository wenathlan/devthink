# DESIGN CAMPAIGN — DevThink OS + the family (wave D1)

Mission: reformulate the design of every application. DevThink is THE OS — inside it
live its own sub-applications, and it redirects to the external family apps. Every
surface must speak ONE professional Windows 11 grammar with full mouse interaction.

## Non-negotiable rules for every agent

1. NO git commands (no commit, no push, no add). The orchestrator commits.
2. Touch ONLY the files listed in your ownership. Never edit outside it.
3. Never edit `devthink/tests/**`, `tests/*.mjs` gate sources, workflows, or gates —
   CI parses gate sources with regex; reformatting them breaks the suite.
4. DevThink agents: do NOT edit `devthink/Sol/sol.css` (a wave-2 agent owns it).
   Write TSX using the class contract below; wave 2 lands the CSS.
   Family-app agents: own their `Sol/sol.css` — APPEND a clearly named block at the
   end; never delete pre-existing rules (append-only overrides).
5. File naming: plain lowercase single-word names (`desktopmenu.tsx`), dotted
   compound names are forbidden in new files.
6. After editing: `cd /home/z/my-project/devthink && bunx @biomejs/biome@2.5.15 check --write <files>`
   (family agents: run biome inside their app folder). Fix everything it reports.
7. Run the app's targeted tests if directly related (`bun test tests/<file>`).
   Never launch the full suite (sandbox timeout).
8. Respect reduced motion (`prefers-reduced-motion`) on every new animation.
9. No emoji in UI. English copy, lowercase mono micro-labels per theme grammar.
10. Append your work record to `/home/z/my-project/worklog.md` ONCE at the end with
    a single `cat >> /home/z/my-project/worklog.md <<'EOF'` block (Task ID, agent,
    work log, stage summary). Keep it under 30 lines.

## The one Windows grammar (exact values — extracted doctrine)

- Taskbar/navbar: 48px; dark acrylic `rgba(32,32,32,.75)` + `saturate(3) blur(20px)`;
  dark bottom hairline; icons only (names on hover tooltip below).
- Pinned icons: 38×38 rounded squares; hover bg `rgb(255 255 255 / 9%)` .2s ease;
  press `scale(.7)` 100ms ease-in-out; ::after ladder 3px wide, 6px `#858585` when
  open, 12px accent when active.
- Menus (start/context/jump): 8px corners, acrylic, item height 28px, font 12px,
  enter/exit `cubic-bezier(.79,.14,.15,.86)` 200ms slide+fade; submenu arrow; shortcut
  column; hover `rgb(255 255 255 / 9%)`.
- Windows: ONE duration — `250ms cubic-bezier(0.85,0.14,0.14,0.85)` on
  transform/opacity only; open opacity 0 + scale .95 → 1; close reverse; minimize
  glides into the dock bar via getBoundingClientRect (daedal physics); notrans while
  dragging/resizing (`[data-moving="true"] { transition: none !important }`).
- Caption buttons: 44px wide rectangular, hairline dividers, ONLY close turns red
  `rgb(232,17,35)` on hover; minimize/maximize never red.
- Focus-graded shadows: focused `0 14px 50% rgb(0 0 0 / 50%)`; unfocused
  `0 10px 45% rgb(0 0 0 / 45%)` + inactive head `grayscale(80%)` (puter).
- Corners 4–8px, NEVER 12+ on windows/menus; resize handles 8px; min window 320×300.
- Desktop icon cell: 74×84px; label 12px with layered shadow
  `0 1px 2px rgb(0 0 0 / 90%), 0 0 8px rgb(0 0 0 / 60%)`; hover wash; selected wash +
  dotted focus border; press scale(.7) on the tile.
- Micro-feedback: hover 100–200ms ease; press 60–100ms; surfaces 250–300ms.
- One light source per view; no pure `#000`/`#fff`; no `transition: all`; no 999px
  pills; gradients subtle (5–10% alpha deltas).

## DevThink theme tokens (Sol/sol.css :root — reuse, never redefine)

`--dt-base #17191f` `--dt-panel #1d2029` `--dt-raised #242836`
`--dt-edge rgb(255 255 255 / 9%)` `--dt-edge-strong rgb(255 255 255 / 16%)`
`--dt-text #edf0f6` `--dt-muted #9aa3b5` `--dt-faint #6b7383`
`--dt-orange #ff5f00` `--dt-blue #8ab4f8` `--dt-mono "IBM Plex Mono"`
`--dt-sans "Space Grotesk"` `--dt-ease cubic-bezier(.23,1,.32,1)`

## DevThink class contract (wave-1 TSX consumes; wave-2 CSS implements)

Desktop interactions (Sol/panel):
- `.dsk-menu` `.dsk-menu__item` `.dsk-menu__sep` `.dsk-menu__label`
  `.dsk-menu__shortcut` `.dsk-menu__arrow` — Win11 context menu grammar.
- `.dsk-marquee` — rubber-band: 1px solid `rgb(138 180 248 / 80%)`,
  fill `rgb(138 180 248 / 15%)`.
- `.dsk-cell[data-selected="true"]` — wash + 1px inset highlight;
  `[data-dragging="true"]` — opacity .75, scale 1.04, transform notrans;
  `[data-marquee="true"]` — wash only (inside rubber band).
- `.dsk-cell__badge` — count badge on folder cells.
Snap layouts (windowframe):
- `.snap-flyout` `.snap-flyout__layout` `.snap-flyout__cell` — hover a layout to
  preview, click to apply; `[data-active="true"]` accent outline.
Tray (shell):
- `.tray-flyout` `.tray-flyout__tiles` `.tray-tile` (`[data-on="true"]` accent) —
  quick settings; `.tray-slider` — volume/brightness.
- `.cal-flyout` `.cal-head` `.cal-day` (`[data-today="true"]` accent circle) — clock.
- `.task-jump` — jump list reusing menu grammar.
- `.taskview` `.taskview__thumb` `.taskview__label` — task view overlay.
Pages:
- `.pagehead` `.pagehead__eyebrow` `.pagehead__title` `.pagehead__lede`
  `.pagehead__actions` `.page-container` — the ONE page hero grammar
  (eyebrow 10px mono uppercase tracked muted; title 28–32px sans -0.02em;
  lede 13px muted; actions right-aligned; container max-width 1180px, pad 24/32px).

## Page navbar standard (DevThink)

EVERY page mounts the ONE `ShellChrome` navbar — never a second topbar. Reuse the
existing wrappers: `ControlShell` (management pages), `InstitutionalChrome`
(public/legal). Pages that hand-roll a header migrate to the `.pagehead` grammar.
All internal links use wouter; deep routes keep clean-url doctrine.

## Family window recipe (the cadria reference)

Reference files to READ before editing (do not modify them):
- `cadria/Sol/shell/Shell.tsx` — the window shell: 48px acrylic title bar (mark +
  name + role line as drag surface, pointer capture, clamp, double-click maximize),
  Fluent caption buttons 44px (minimize → restore chip, maximize/restore, close →
  `/intro` relaunch), left rail 216px (page entries, active `--win-accent` ladder),
  ThemeToggle in rail foot, routed stage.
- `cadria/Sol/sol.css` tail — the `WINDOW APP PASS` block (tokens `--win-*`,
  `.appframe`, `.winapp`, `.winintro*`, `.winonboard*`, media queries, reduced-motion
  guards).
- `cadria/Sol/intro/intro.tsx` + `cadria/Sol/onboarding/onboarding.tsx` — entry flow
  (splash 1.6s, spring; 3-frame first-run dialog; flag `<app>.intro.seen`).
- `stealhead/Sol/sol.css` tail — second implementation of the pass.

Conversions (argan, debonair, saddle): replace the OS taskbar shell with the window
shell; map the app's NAV into rail entries; `/intro` → `/onboarding` → `/` flow; keep
every existing page and route alive inside the window stage; keep tests green.

Polish (cadria, stealhead, forge, foundry, vault, getry): verify EVERY page mounts the
one window shell; unify rail order and labels; same title bar grammar everywhere;
tokens consistent; toasts consistent; focus-visible rings; hover/press micro-feedback;
reduced-motion guards; the rail foot gains a family section linking the sibling apps
and the DevThink OS via `../../deploybase.ts` familyurl — the family redirects both ways.

## Reference material on disk (read-only)

- `/home/z/wormhole-read/competitors/` — 12 competitor apps (OpenCut, Remotion,
  photocraft, filmcraft, …) for app-level UI patterns (timeline, toolbars, panels).
- `/tmp/my-project` — an older copy of this repo (context only; do NOT edit).
- `/home/z/my-project/worklog.md` tail (last ~80 lines) — previous wave records.

## Identity accents (family)

argan jade `#1DCF64` · cadria rose `#f472b6` · debonair violet `#a78bfa` ·
stealhead red `#f87171` · forge orange `#fb923c` · foundry amber `#d97706` ·
vault yellow `#eab308` · getry sky `#60a5fa` · saddle sand `#d6b483`
