# the chat design references — the zcode, synara and t3code standard

the owner named the three references the aura chat surface copies and the
family standard extends: zai-org/zcode, emanuele-web04/synara and
pingdotgg/t3code. the three repos were cloned outside the tree, studied and
bound into this dossier so the redesign wave answers a written standard, not
a memory. the clones stay outside the tree as reference material exactly as
the doctrine orders; nothing is vendored, everything is implemented.

## the three references and what each carries

| reference | what it is | what it lends the standard |
| --- | --- | --- |
| zcode | the desktop-first, web-compatible ai workspace of z.ai | the complete design doctrine: the semantic token system, the text-ui scale, the radius nesting law, the spacing rhythm, the composer as the sanctioned 2xl exception |
| synara | the focused workspace for coding agents (projects, threads, provider sessions) | the calm neutral palette (the codex material with the zero-contrast default), the rail navigation, the workspace layering (project, thread, provider session, tools) |
| t3code | the agent harness control surface (mobile, web, desktop) | the glass treatment (blur 12px, opacity 80 percent, saturation 1.14), the compact ui geometry tokens, the view-transition composer morphing, the z-layer discipline |

## the common dna (the standard the owner calls professional)

the three references agree on the same grammar, and the agreement is the
standard:

. calm, dense, operational surfaces — long sessions, high information
  density, readable chat and tool output, keyboard-driven workflows. no
  oversized marketing spacing, no playful gradients, no bright full-surface
  brand fills.
. a neutral material: the backgrounds sit one step off white (or off black),
  the ink is near absolute, the accent is one saturated hue used sparsely.
. a three-pane chat anatomy: the conversation sidebar (left), the message
  canvas with a bounded content column (center), the context panel
  (right, collapsible).
. the composer as the hero: the one surface allowed the largest radius, the
  most presence, the focus treatment. everything else recedes.
. a token discipline: no raw hex, no ad-hoc alpha, every color a semantic
  name, every size a scale step, every radius a nesting level.
. light and dark answer the same structure: only the values move, never the
  layout.

## the token tables (the measured values)

### the zcode material (zai light and zai dark)

| role | zai light | zai dark |
| --- | --- | --- |
| background | #f8f8f8 | #161616 |
| header / panel | #ffffff | #202020 |
| sidebar | #f0f0f0 | #161616 |
| card / popover / input | #ffffff | #2b2b2b |
| surface | rgba(13,13,13,0.03) | rgba(255,255,255,0.05) |
| border | rgba(13,13,13,0.1) | rgba(255,255,255,0.1) |
| border hover | rgba(13,13,13,0.15) | rgba(255,255,255,0.15) |
| hover / selected | rgba(13,13,13,0.05) | rgba(255,255,255,0.05) / 0.1 |
| accent surface | #ebf4ff | #001d3d |
| brand | #000000 | #ffffff |
| ink | near #0d0d0d | near #fcfcfc |

the trajectory ramp (the chat semantics): user #2563eb / #60a5fa, assistant
#0f766e / #2dd4bf, reasoning #7c3aed / #a78bfa, tool call #d97706 / #f59e0b,
tool result #0284c7 / #38bdf8.

### the synara material (the codex palette)

| role | light | dark |
| --- | --- | --- |
| surface | #ffffff | #111111 |
| ink | #0d0d0d | #fcfcfc |
| accent | #0169cc | #0169cc |
| diff added | #00a240 | #00c853 family |
| diff removed | #e02e2a | #ff5f38 family |
| skill | #751ed9 | #b06dff |

the zero-contrast default: the chrome carries no tint against the surface,
the accent alone colors the interactive.

### the t3code geometry

| token | value | meaning |
| --- | --- | --- |
| --control-radius | 0.5rem | the control baseline (8px) |
| --sidebar-content-inset | 0.5rem | the sidebar rail inset |
| --sidebar-row-content-inset | 0.625rem | the row inset (10px) |
| --command-shell-inset / content | 0.5rem / 1rem | the command palette insets |
| --floating-content-inset | 0.75rem | the floating surfaces |
| --glass-blur | 12px | the acrylic blur |
| --glass-opacity | 80% | the acrylic body |
| --glass-saturation | 1.14 | the acrylic color lift |
| --app-scrollbar-width | 6px | the thin scrollbar |
| --z-sheet | 46 | the sheet layer (dialogs 50+) |

the material is the zinc ladder (zinc-25 above white at oklch 99.2 percent)
with the accent as zinc-100 light and white-4-percent dark: the quietest of
the three, the most os-like.

## the typography law (the zcode scale, the one to copy)

one scale driver, six steps, the appearance setting moves the driver and
nothing else:

| token | formula | default | the roles |
| --- | --- | --- | --- |
| text-ui-xl | driver + 4px | 18px | markdown h1, first-level reading headings |
| text-ui-lg | driver + 2px | 16px | markdown h2, second-level headings |
| text-ui-base | driver | 14px | body copy, common buttons, workspace titles |
| text-ui-caption | driver - 1px | 13px | compact supporting copy one step below body |
| text-ui-sm | driver - 2px | 12px | secondary copy, helper text, tooltip copy, inline code |
| text-ui-xs | driver - 4px | 10px | shortcuts, badges, counters, weak metadata |

the weight discipline: h3 and h4 semibold, h5 medium, h6 normal; body and
controls normal; titles and labels may strengthen weight without changing
the size role. the font-mono stack carries the paths, commands, code,
identifiers, shortcuts, commit hashes, model ids. the driver is 14px by
default and the interface font setting moves only the driver: icons,
spacing, radii and every rem-based geometry stay fixed.

the devthink marriage: the house body type answers 13px/450 today (the
design.spec.win11.md ladder); the chat surfaces adopt the driver scale with
the driver at 13px so the os body and the chat body stay one voice, and the
markdown reading column keeps the h1 xl / h2 lg / body base ramp.

## the radius law (the nesting discipline)

radius follows the nesting of visible rounded containers, never the
importance of the component:

. the first rounded container in any region starts at xl (12px).
. each nested rounded container steps down: lg (8px) then md (6px) then sm
  (4px, the floor).
. basic controls (buttons, inputs, selects, menu triggers) sit one level
  under their nearest rounded parent: no parent or xl parent gives lg
  controls, an lg parent gives md controls, an md or sm parent gives sm
  controls.
. menus, dropdowns, select panels and the mention suggestion overlays use
  lg shells with md items.
. dialogs carry 2xl (16px) shells and restart the hierarchy inside.
. full (pill) is reserved for deliberate pills and circles only.
. the sanctioned 2xl exceptions: the main chat input shell (the composer),
  the conversation status floating panel, the toast, the brand backplates.
  the composer is the only content surface that earns it.

## the spacing rhythm

the base unit is 4px and the repeated set is small:

| step | use |
| --- | --- |
| 4px | tight icon and text pairing |
| 8px | compact control padding, inline gaps |
| 12px | dense list items, menu rows |
| 16px | standard card and panel padding |
| 20-24px | larger sections, dialog interiors |

flex text layouts carry min-w-0 where truncation lives; nested scroll
regions carry min-h-0; content widths ride w-full with max-w bounds, never
hard-coded widths.

## the composer (the hero, the measured shape)

the zcode input shell, measured from the source:

```tsx
relative flex flex-col gap-3 overflow-hidden rounded-2xl
border border-input-border bg-input p-3
transition-colors
hover:border-input-border-hover
focus-within:border-input-border-focused
focus-within:bg-input-focused
```

the drag overlay answers the same shell: rounded-2xl with the accent surface
at 55 percent and backdrop-blur-sm. the content column above it rides
max-w-3xl (768px) centered. the toolbar under the input carries the model
menu, the provider menu, the effort heading and the trigger transitions as
compact labeled controls.

the t3code composer morphs on mobile through view transitions: the expanded
hero and the docked compact composer share a named transition group with a
cubic-bezier(0.4, 0, 0.2, 1) crossfade while the app stays visually
stationary. the devthink chat answers the same contract through its three
faces (desktop, app, android): one composer, three presentations, the
transition never cuts.

## the chat anatomy (the layout to rebuild)

. the sidebar: the conversation list with search, pinned threads, the new
  chat action, the account footer with the plan badge and the usage summary.
. the canvas: the bounded reading column (max-w-3xl centered on desktop),
  the message stream, the markdown ramp, the tool blocks, the citation
  chips, the selection toolbar.
. the right panel: the context surface (files, diffs, preview, terminal),
  collapsible, full-view floating on narrow screens.
. the top strip: the workspace header with the window controls (the windows
  desktop keeps the caption buttons reachable), the model trajectory access.
. the rail (synara): the app navigation as a narrow icon rail with the usage
  meter, the more menu, the settings at the foot — the os taskbar grammar
  the devthink shell already carries.

## the trajectory colors (the chat semantics)

the zcode ramp maps the message kinds to color roles and the devthink chat
adopts the same semantics under the --sol- namespace:

| kind | light | dark | use |
| --- | --- | --- | --- |
| user | #2563eb | #60a5fa | the user messages and the user turn markers |
| assistant | #0f766e | #2dd4bf | the assistant turns |
| reasoning | #7c3aed | #a78bfa | the reasoning traces |
| tool call | #d97706 | #f59e0b | the tool invocations |
| tool result | #0284c7 | #38bdf8 | the tool outputs |

## the glass law (the windows eleven marriage)

the t3code glass tokens answer the windows eleven acrylic the devthink
design-spec already pins: blur 12px, opacity 80 percent, saturation 1.14.
the chat surfaces ride the acrylic on the overlays (menus, palettes, the
floating panels) and the mica on the shell chrome (the sidebar, the top
strip), the way the os shell does. the glass never carries content text
without a solid-enough body behind it: the contrast contract holds on both
themes.

## the mapping to the devthink family

the owner's order: the chat design example serves the aura chat surface
first, then the same standard extends to every family app. the mapping:

. the token namespace: the zcode semantic roles land as the --sol- token
  family the foundation already carries (canvas, hairline, muted, accent per
  theme) — no second namespace, the 900-step plan phase 1 steps 014 to 033
  already bind this.
. the type driver: the appearance setting drives one --sol-type-driver
  variable, the six steps derive from it, the os body stays at the 13px
  driver.
. the radius nesting: the foundation radius tokens answer the xl-lg-md-sm
  ladder with the composer, the toasts and the dialogs as the only 2xl
  surfaces — the same exceptions list the zcode doctrine sanctions.
. the chat anatomy: the aura surface rebuilds as the sidebar, the bounded
  canvas and the context panel with the composer hero; the mobile faces
  morph through the view-transition pattern t3code demonstrates.
. the family extension: each app receives the same grammar in its wave (the
  calendar waves 018 to 045 of the 900 plan), the design.spec.win11.md
  grammar above it (the taskbar, the window chrome, the acrylic and mica)
  and this standard inside it.

## to visit

. zai-org/zcode — the design.md doctrine and packages/ui/src/styles.css.
. emanuele-web04/synara — apps/web/src/theme/theme.seed.generated.ts and
  the apprail.
. pingdotgg/t3code — apps/web/src/index.css (the geometry and glass tokens)
  and apps/web/src/components/chat.
. devthink/docs/design.spec.win11.md — the windows grammar above this
  standard.
. devthink/docs/planning.operation.900.md — the waves that consume this
  dossier (phase 4, the native pages, and phase 5, the engines).
