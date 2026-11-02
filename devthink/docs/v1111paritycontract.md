# DevThink v1.1.11 parity contract

## Shared interaction model

DevThink has one local domain model: identity, workspace, session, tab, message, provider selection and compact IDs. React web and React Ink are separate renderers of that model. Browser DOM components are not copied into the terminal; shared TypeScript contracts, command names, route semantics and local gateway operations provide parity.

## Capability matrix

| Capability | Browser workbench | Ink workspace | CLI command | v1.1.11 obligation |
| --- | --- | --- | --- | --- |
| First intention | Centered entry and local identity | Centered entry | `interactive` | Keep identical transition language and keyboard submit. |
| Chat and streaming | Session canvas with SSE gateway | Streamed transcript | `chat` | Keep current behavior and surface connection state. |
| Session history | Direct compact route only | `/sessions` reference only | `sessions list`, `sessions export` | Add an accessible history view or picker in both interactive renderers. |
| Tab lifecycle | Browser tabs with local fallback | `/new` only | session and tab records | Add create, activate and contextual tab controls in both renderers. |
| Providers | `/providers` control page | `/models` reference only | `providers`, `models`, `config` | Add provider/model inspection and active-provider selection affordance. Credentials remain CLI-only. |
| Projects | `/projects` control page | no interactive view | `projects` | Integrate project index into workspace navigation and command palette. |
| Usage | `/usage` control page | no interactive view | `usage` | Add local record count summary in both shells. |
| Routes and health | `/routes` control page | no interactive view | `routes`, `gateway status` | Add a route and gateway status view that never exposes credentials. |
| Pairing and identity | Settings pairing panel | no interactive view | `identity`, `pair create`, `pair revoke` | Present paired state and safe pairing instructions in both shells. |
| Auth and config | Guidance only | command reference | `auth`, `config` | Remain CLI-only because browser never accepts provider secrets. |
| Sync and server lifecycle | Guidance only | command reference | `sync`, `serve`, `init` | Remain CLI-only and be documented as intentional local boundaries. |

## Navigation contract

The web shell uses three levels: local session rail, browser tab strip and context destination. Direct routes remain available for bookmarks and static deployment. The rail exposes **Chat**, **History**, **Projects**, **Providers**, **Usage**, **Routes** and **Settings**. The browser-tab strip represents real session tabs, not just visual categories. The context destination uses the canonical session section values and maps category labels to meaningful views.

The Ink shell uses the same nouns. Arrow keys move across tabs or destinations; slash commands remain available; `/help` lists matching command names; `Enter` invokes the focused composer. Terminal width changes presentation density but not the underlying navigation model.

## Visual contract

The entry view is black-on-black with a quiet charcoal browser edge. The canonical DevThink ANSI mark sits behind or adjacent to the centered wordmark, never as an unrelated code icon. A single long composer is the dominant action. After the first command, the workspace uses an aligned left rail, a thin tab strip, a central canvas, optional contextual inspector and a bottom composer. Orange signals initiation and selected action. Orb blue signals a local connection, paired state or running stream. Every visual status must have text, not color alone.

## Explicit exclusions

This release does not add cookie capture, browser-session extraction, CAPTCHA bypass, hosted accounts, hidden remote synchronization, browser-side provider credentials or a new paid dependency. It does not claim automatic conversion between DOM React and terminal React; Ink remains the Bun-compatible React renderer for CLI output.
