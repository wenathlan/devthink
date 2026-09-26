# DevThink v1.1.11 external reference notes

The following sources inform principles only. DevThink retains its own branding, information architecture, code and interaction behavior.

| Source | Observed principle | DevThink interpretation |
| --- | --- | --- |
| [OpenCode TUI](https://opencode.ai/docs/tui/) | An interactive TUI keeps a primary prompt, an explicit command vocabulary, keyboard affordances, file context and session actions close to the active conversation. | Expand the Ink command reference and add accessible views for existing local providers, models, sessions, projects, routes and usage. Do not add shell execution or unrelated third-party behavior. |
| [Cline](https://cline.bot/) | A product can make multiple surfaces legible through clear mode selection, a stable top navigation and one prominent task surface. | Give web and CLI the same navigational nouns and modes, preserving DevThink's local-first boundary and compact records. |
| [ChatGPT Atlas](https://openai.com/index/introducing-chatgpt-atlas/) | A browser-shaped product begins from one decisive entry surface, then lets context, tabs and an assistant coexist without forcing a user to leave the active work. | Use a clearly differentiated entry, session tabs, contextual side navigation and a persistent composer; keep any saved local context opt-in and controllable. |
| [`devakadion/tm`](https://github.com/devakadion/tm/) | The supplied example is a TypeScript repository organized around React components for tabs, terminal, settings, thoughts and workspace state. | Keep the existing React web and React Ink approach; extract shared domain contracts and renderer-specific components rather than attempting an automatic conversion of browser DOM into a terminal. |

## References

[1] [OpenCode TUI documentation](https://opencode.ai/docs/tui/)

[2] [Cline product site](https://cline.bot/)

[3] [Introducing ChatGPT Atlas](https://openai.com/index/introducing-chatgpt-atlas/)

[4] [devakadion/tm repository](https://github.com/devakadion/tm/)

## Supplied workspace-reference observations

The examined dark workspace references prioritize a narrow persistent left rail, quiet central conversation canvas, a single elevated response or artifact card, restrained secondary actions, and a composer anchored low in the visual field. The assistant state is present but does not dominate the page. For DevThink, the same hierarchy will become a local session rail, a browser-tab strip, a contextual work canvas, a compact artifact or activity card, and a keyboard-first composer. The DevThink ANSI mark remains product-owned and is not replaced by any reference brand treatment.

Additional supplied examples reinforce two constraints: a browser frame can support an adjacent contextual assistant pane without turning the workspace into a dashboard, and visibility or permission state must remain explicit. DevThink will express this through an optional, dismissible local-context panel and clear paired or unpaired connection affordances. It will not read browser cookies, capture browser sessions or access webpage content automatically.

The supplied new-tab examples establish the desired entry balance: one centered product mark, ample negative space, a horizontal prompt as the principal interactive element, optional suggestions beneath it, and an explicit local/privacy boundary. DevThink will keep the existing dark palette rather than the light reference variant, place the canonical ANSI mark behind the wordmark, and show only local-first guidance rather than imported browser-history or website-visibility behavior.

Two additional supplied new-tab images repeat the same hierarchy. Their repetition confirms that the v1.1.11 entry should avoid dashboard density and lead with one command surface rather than several equal actions.

The final inspected references add two useful details: suggestion rows can remain secondary beneath a focused input, and a dark agent workspace benefits from a calm left session rail with a visibly separate conversational canvas. DevThink will use these principles with compact local session IDs and owned orange/blue semantic tokens, rather than copying layout details, icons or wordmarks.

The final Cline reference confirms the usefulness of a legible hierarchy across CLI, IDE and SDK modes. For DevThink, that becomes explicit Web, CLI and local-gateway capability labels, not an imitation of Cline's visual identity.

The inspected `App.tsx` example confirms a useful composition pattern: one `entered` state gates a landing-to-workspace transition, tabs are stateful, and a single input dispatches the active operation. Its `framer-motion`, browser input and Tailwind-specific code cannot be moved directly into Ink or a Bun binary. DevThink will preserve Ink for terminal React rendering and share only data contracts, navigation semantics and command dispatch behavior.
