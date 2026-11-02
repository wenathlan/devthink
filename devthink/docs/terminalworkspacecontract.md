# DevThink entry and browser workspace

## Intent

DevThink opens as a landing-grade local command surface, then becomes a browser-shaped development workspace only after the first real request. The web and CLI remain two renderings of the same information architecture. The visual language is an original synthesis of editorial black surfaces, terminal clarity and calm browser chrome; it does not reproduce another product's assets or source.

## Entry state

The entry state contains the canonical DevThink ANSI art as a large, dim background layer. An oversized `DEVTHINK` wordmark sits above it in the foreground. The only primary operation is a natural-language command field with a direct run affordance. A nonempty submitted request creates the local identity, preserves the label as the first session intent, and opens the route-addressable workspace. The temporary workspace route remains available as a secondary local-first path.

## Browser workspace

The workspace uses two compact levels of navigation. The first level is a browser-like chrome with product identity, one active session tab, a new-tab affordance and a restrained local or paired state. The second level is a pill-shaped task strip for `all`, `features`, `bugs`, `refactor`, `snippets`, `tasks`, `notes` and `settings`. The active category becomes the URL section and stays keyboard reachable.

| Area | Web rendering | CLI rendering |
| --- | --- | --- |
| entry art | blurred ANSI backdrop behind the foreground wordmark | dim canonical ANSI mark behind the terminal title |
| first command | creates local identity and opens a workspace route | starts or labels the interactive local session |
| session tab | browser-style active tab with a small state signal | compact session label above the task strip |
| task strip | focusable rounded category controls | keyboard-selectable category controls |
| canvas | active stream, entry list or quiet empty state | streamed text, list state or quiet empty state |
| command rail | bottom command field, local provider signal and run control | input prompt, provider signal and submit key |

## Material and type

The base stays nearly black. Panels use layered charcoal rather than flat cards. Orange signifies deliberate work and active tabs; orb blue signifies local or paired connection state; warm white carries reading text. Rounded browser chrome is limited to tabs, command controls and state pills. The wordmark is a wide display face, while commands, routes, states and technical metadata use a mono system.

## Motion and accessibility

Entry artwork moves only through a slow opacity-and-transform drift. The accepted first command crosses into the workspace with a short fade and upward reveal; command execution itself remains immediate. Every interactive tab has an accessible name, visible focus and ordinary button semantics. Reduced-motion preferences remove all decorative movement. The web stays static-host portable, and the CLI retains the ANSI fallback when a full interactive terminal cannot render Ink.
