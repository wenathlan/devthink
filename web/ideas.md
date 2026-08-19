# DevThink web design direction

## Three possible directions

| Theme Name | Very Brief Intro | Probability |
| --- | --- | ---: |
| Copper Browser Atelier | A warm, editorial command center that treats AI work as crafted engineering rather than chat. Amber signature light, graphite surfaces and document-like density create calm authority. | 0.07 |
| Frosted Network Console | A cool, translucent operations surface with icy cyan telemetry and modular network maps. It favors a technical, quiet atmosphere for diagnostics and provider routing. | 0.04 |
| Archive Signal Room | A light, archival workspace inspired by lab notebooks and high-contrast print systems. Rich ink, warm paper and red correction marks make sessions feel traceable and deliberate. | 0.06 |

## Selected direction: Copper Browser Atelier

### Design Movement

The interface follows **editorial software design** with the layered chrome and tab vocabulary of Opera and Chrome. It uses the confident density of a professional IDE while replacing generic cyberpunk with a warm studio atmosphere.

### Core Principles

1. **Browser-native shell:** tabs, a compact address-like command field and a clearly layered workspace create an immediately legible operating surface.
2. **Warm technical contrast:** graphite, ash and ivory are structural colors; copper is reserved for identity, selection and action.
3. **Intentional asymmetry:** a narrow navigation rail, expansive conversation canvas and contextual inspector avoid a centered dashboard template.
4. **Evidence over decoration:** provider state, stream activity, route diagnostics and session provenance are visible, useful interface material.

### Color Philosophy

Near-black graphite makes long streaming sessions comfortable. Soft ivory is used only for high-attention document surfaces, while the signature copper creates one unmistakable visual thread across the logo, active tab, live stream cursor and primary actions. A muted sea-glass accent distinguishes safe network state from the brand accent without competing with it.

### Layout Paradigm

The product is a **three-zone browser workbench**: a slim vertical rail for workspaces and providers, a fluid center canvas for an active conversation, and an optional inspector column for model, route and context controls. Tabs sit above all zones and resemble a restrained browser window rather than a marketing navigation bar.

### Signature Elements

1. A copper gradient wordmark derived from the ANSI DevThink identity, rendered as an oversized terminal block on the empty state.
2. A live vertical stream rail that shifts from copper to sea-glass as events move from generation to completion.
3. Thin rounded browser tabs with a subtle inset top highlight and a compact command field modeled after an address bar.

### Interaction Philosophy

The shell responds like a precision instrument. Selection changes are immediate, keyboard actions are not animated, and only meaningful state transitions—opening an inspector, receiving a provider response, activating a new tab—use restrained motion. Every placeholder interaction explains its current boundary through a clear toast.

### Animation

Panels enter with 180–240ms opacity and translate transitions using `cubic-bezier(0.23, 1, 0.32, 1)`. The active stream cursor pulses through opacity only. Tab and button feedback use a 140ms transform response and a `scale(0.97)` active state. Motion is removed under `prefers-reduced-motion`.

### Typography System

**Space Grotesk** carries headings, navigation and controls because its geometry echoes browser chrome without looking generic. **IBM Plex Mono** carries provider IDs, routes, timestamps, prompts and code. Display headings use 600–700 weight; body copy uses 400–500 weight; metadata uses mono at a smaller scale with high letter spacing.

### Brand Essence

**DevThink is the AI development workbench for engineers who need traceable streams, provider-owned endpoints and focused execution.**

Personality: **precise, warm, composed**.

### Brand Voice

Headlines are concrete and operational; CTAs describe the next real action; microcopy states current system truth without hype.

Example lines:

> Route the work, not the browser.

> Open a clean session and choose its model path.

### Wordmark and Logo

The wordmark is the canonical `DEVTHINK` ANSI composition from `docs/logo.md`, rendered in copper with a compact preview at narrow widths. The full mark stays available to the terminal renderer; the web workbench preserves accessible text beside its compact rendering.

### Signature Brand Color

**DevThink Copper — `#e46f36`**.

## Style Decisions

The terminal-inspired wordmark is decorative and never substitutes accessible text. The web interface uses real text labels, high-contrast status colors and visible keyboard focus at every interactive control.
