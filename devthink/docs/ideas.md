# DevThink visual direction

## Three possible approaches

| Name | Brief introduction | Probability |
| --- | --- | ---: |
| Copper Atelier | A warm editorial work browser, with graphite surfaces and copper details. It favors focus, materiality and traceability. | 0.08 |
| Orbital Signal Room | A dark, spatial workspace in which soft blue rings and a high-energy orange indicate presence, route and flow. It turns the session into a precise control desk. | 0.03 |
| Press Terminal | A monochrome system of typographic aesthetics, with printed borders, halftone and an editor's rhythm. It reinforces the feeling of a local, reliable tool. | 0.06 |

## Selected direction: Orbital Signal Room

### Design movement

DevThink adopts **editorial spatial instrumentalism**: the discipline of a technical workstation meets the contained glow of orbit navigation. The browser reference appears in the hierarchy of tabs and command bars; not as an imitation of Chrome or Opera, but as a recognizable grammar of continuity and context.

### Core principles

1. **Chrome, not dashboard:** the product is a work area with borders, tabs, rails and active context; never a centralized collection of cards.
2. **Signal before ornament:** orange indicates action and focus, orb-blue indicates connection or flow and green only confirms stability.
3. **Discreet depth:** black layers, SVG cutouts and dot textures explain hierarchy without generic gradients or excess glass.
4. **Command parity:** the web and the CLI use the same state names, the same ANSI brand, the same main actions and the same mental model of a workspace.

### Color philosophy

Mineral black sustains long sessions and creates visual silence. The **DevThink orange `#ff6a00`** is the property of action, selection and identity; that is why it is never used for passive decoration. The **orb-blue `#78a9ff`** is a cold state light, reserved for gateway, streaming and context relations. Grayish ivory and bluish grays sustain reading without turning the interface into pure white.

### Layout paradigm

The layout is an **orbital workbench**: a top bar of context and tabs passes over a thin navigation rail; the center is a conversation and execution canvas; an inspection column is an invocable layer, not a permanent third column. The entry screen is a contained central bench framed by a wide SVG opening, not a marketing hero.

### Signature elements

1. An original SVG opening, formed by asymmetric rounded blocks, creates depth behind the entry and the empty states.
2. Local orbital rings in SVG, from orange to orb-blue, indicate pairing, streaming and connection without depending on third-party effects.
3. A compact tab strip and a terminal command bar join the browser navigation to the CLI rhythm.

### Interaction philosophy

Every frequent action is immediate and keyboard-readable. Focus changes without delay; only the entry of a session, the opening of the inspector and the arrival of a stream receive a transition. Buttons keep light physical pressure; connection states use shape, text and color, never color alone.

### Animation

Panel transitions use 180–240 ms, `cubic-bezier(0.23, 1, 0.32, 1)` and only `transform` and `opacity`. Orbital rings use slow motion, with no mandatory cursor. The halftone reveal is limited to entries and empties; under `prefers-reduced-motion`, every non-essential movement is removed and the content is immediately visible.

### Typographic system

**Space Grotesk** leads titles, navigation and controls; **IBM Plex Mono** leads routes, prompts, states and execution data. Titles carry compact mass, with high contrast. Metadata uses lowercase mono with moderate spacing. The decorative ANSI brand never replaces an accessible label.

### Brand essence

**DevThink is the local AI development workspace for those who need to route providers, follow streams and keep execution under control.**

Personality: **precise, energetic, composed**.

### Brand voice

Messages are short, operational and verifiable. CTAs describe the next real action; they never promise fictional autonomy.

> Open a local route and choose the execution model.

> Pair the gateway. Keep the credentials on your computer.

### Wordmark and logo

The canonical brand is the ANSI composition `DEVTHINK` already rendered by the CLI. On the web, it appears as accessible text accompanied by a compact version of the same pixelated rhythm, always in DevThink orange or low-contrast gray.

### Signature color

**DevThink Orange — `#ff6a00`.**

## Implementation decisions

The references of 21st.dev, UIverse and React Bits guide hierarchy, rhythm and movement, but DevThink uses local components, SVGs and CSS. No third-party code is copied. The interface does not introduce a new visual dependency just to reproduce a reference effect.
