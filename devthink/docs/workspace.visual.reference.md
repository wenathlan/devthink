# DevThink workspace visual reference

## Reference findings

The 21st.dev community catalog is used as a visual inventory only. Its relevant categories for DevThink are AI chats, dashboards, sidebars, tabs, cards, inputs, empty states, search bars and command-oriented components. The implementation will use local DevThink components rather than importing community source.

React Bits Magic Rings demonstrates a parameterised concentric-ring treatment with colour interpolation, line thickness, attenuation, parallax and optional pointer response. DevThink will translate that idea into a low-motion orange-to-orb-blue SVG background for entry and connection states. It will not copy the component implementation.

References: <https://21st.dev/community/components> and <https://reactbits.dev/animations/magic-rings>.

Halftone Reveal informs a subtle entry/reveal treatment rather than a permanent content filter. DevThink will use a local dot-grid mask for selected empty and onboarding states only, preserving readability and disabling animation for reduced-motion preferences.

Shape Magic demonstrates the useful export modes for original form experiments: SVG, React, CSS clip-path and mask SVG. The DevThink composition will use an original layered SVG "workspace aperture" behind the entry view, with low-contrast black geometry and orange/orb-blue edge lighting.

UIverse is an interaction reference for concise buttons, inputs, cards, loaders and tooltips. The local implementation will keep a single DevThink control language instead of importing site examples.

Additional references: <https://reactbits.dev/animations/halftone-reveal>, <https://reactbits.dev/tools/shape-magic>, and <https://uiverse.io/elements>.

## Preview observation

The local preview confirmed the entry hierarchy: the orange action is distinct, the blue state reads as connection rather than decoration, and the original aperture sits behind rather than competing with the copy. The workspace preserves its rail, browser tabs, route strip and composer. The pairing surface remains functional but must be spatially quieter on narrow workspace widths so it does not compete with the composer.

The pairing surface is now a compact disclosure beacon. It is expanded automatically only for an invitation or an already-paired state. Existing browser preview state can retain an open disclosure after hot reload; a new session opens it compactly.

## Unified terminal renderer decision

The supplied manifest contains Ink 7.1.1, React 19.2.8, `cliui`, `chalk`, `blessed` and `node-pty`. Only the component renderer direction is relevant to DevThink. The unrelated binaries, browser automation, CAPTCHA-related keywords and project-specific plugin metadata are explicitly excluded.

Ink is a React renderer for command-line applications and uses Yoga for Flexbox-style terminal layouts. OpenTUI is a Zig-native terminal UI core with TypeScript bindings; its React renderer provides boxes, terminal inputs, tab selection, scroll areas, code/diff renderers and keyboard hooks. OpenTUI documents Bun installation and React setup, matching DevThink's Bun build target more closely than the supplied manifest's mixed environment. The implementation will validate an OpenTUI-backed interactive shell as an optional rich terminal surface while preserving the existing ANSI renderer as the portable fallback for constrained terminals and compiled distribution.

Sources: <https://github.com/vadimdemedes/ink>, <https://opentui.com/>, <https://github.com/anomalyco/opentui>, and <https://www.npmjs.com/package/@opentui/react>.
