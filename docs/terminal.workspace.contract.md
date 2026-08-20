# DevThink unified terminal workspace

## Intent

DevThink renders one operational workspace in two targets. The browser is the React rendering of the workspace. The interactive CLI is the terminal rendering of the same information architecture. Neither target is a generic dashboard.

## Shared frame

The frame contains a compact top category bar, a thin context line, a central active-or-empty canvas, a low-contrast DevThink pixel mark, and a fixed command rail at the bottom. The command rail is the primary interaction surface in both targets.

| Area | Web rendering | CLI rendering |
| --- | --- | --- |
| categories | focusable top tabs with route-aware selection | keyboard-selectable top tabs with identical names |
| context line | active category, entry count and workspace id | active category, entry count and workspace id |
| canvas | message, provider, project, route, usage or empty state | text stream, list state or empty state |
| pixel mark | CSS pixel wordmark in the empty canvas baseline | canonical ANSI wordmark in the same visual position |
| command rail | command input and run affordance | interactive input prompt and submit key |
| semantic state | orange intent, blue connection, muted text, red error | identical ANSI colors and labels |

## Category vocabulary

The shared tabs are `features`, `bugs`, `refactor`, `snippets`, `tasks`, `notes`, `all`, and `settings`. Existing DevThink providers, projects, sessions, routes and usage remain reachable through the `all` and `settings` contexts; no domain capability is removed.

## Interaction rules

The workspace starts in the `all` context. `Tab` and arrow controls move category focus, `Enter` selects it, and the command rail executes the selected command. The browser retains URL-addressable workspace, session, tab and section identifiers. The CLI keeps existing commands as the portable fallback and exposes the rich renderer only for interactive TTY use.

## Visual tokens

The base is `#090908`; panel is `#121211`; edge is `#282724`; primary text is `#e8e1d7`; muted text is `#746f66`; intent orange is `#ff5f00`; signal blue is `#8ab4f8`; success is `#3fe0a3`; and danger is `#ff6b6b`. Typography is a readable mono system with a pixel-display treatment limited to the wordmark.

## Accessibility and portability

Focus is always visible. Reduced motion disables all nonessential transitions. The command rail remains reachable by keyboard and screen-reader label. The web remains a static build. The CLI retains a no-native-dependency ANSI fallback when OpenTUI is unavailable or the terminal is not interactive.
