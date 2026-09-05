# Accessibility sweep walkthrough

This walkthrough drives the accessibility sweep of the 2.0.0 roadmap item 55: every ui surface audits against the WCAG checklist. The gate of `tests/wcag.mjs` reads the one design file `web/index.html`, extracts every surface template the build splits into the extension pages — the site, the popup, the sidepanel, the dashboardpage, the optionspage, the transparencypage, the sandbox host and the offscreen host — and audits each surface statically: the images, the button names, the field labels, the heading hierarchy, the computed contrast of the default theme tokens, the focus visible outlines, the tabindex order, the html lang stamp and the decorative markers. The evidence lands in `tests/artifacts/wcag.json` with no timestamps so reruns stay byte identical, and the gate exits nonzero on any failed check.

## 1. Run the sweep after the build

```bash
pnpm build
node tests/wcag.mjs
```

The sweep reads the design file, the embedded stylesheet, the view sources and the built surface pages of `dist/extension`, so the build runs first. The gate prints one line per executed check with its outcome and answers the final JSON summary; any failed check prints to stderr, sets the exit code nonzero and lands in the artifact with its failure detail. The artifact is `tests/artifacts/wcag.json`.

## 2. The checklist and its success criteria

Every check of the sweep carries its WCAG 2.1 success criterion reference:

| Checkpoint | Criterion | What the gate audits |
| --- | --- | --- |
| Non-text content | 1.1.1 | Every `img` element of every surface template carries its `alt` attribute, and every decorative marker (`aria-hidden="true"`, in the markup or set by a surface script) sits on a non-interactive element with no tabindex and stays hidden. |
| Info and relationships | 1.3.1 | Every `button` carries an accessible name (its text content, its `aria-label` or its `title`); every `input`, `textarea` and `select` carries a label (a `label for` element, an `aria-label` or an `aria-labelledby`); every surface heading hierarchy starts at its single `h1` and never skips a level; the class names the templates and the generated view markup reference resolve to real stylesheet rules so the rendered relationships carry their styling. |
| Contrast minimum | 1.4.3 | The default theme tokens meet the computed ratios: the text and muted tokens over the surface and elevated backgrounds answer at least 4.5:1, the accent token over the same backgrounds answers at least 3:1, and every literal button ink over the accent background answers at least 4.5:1. The gate recomputes the WCAG relative luminance ratio from the token values parsed out of the stylesheet, so a token change re-audits. |
| Focus order | 2.4.3 | No positive `tabindex` value appears in any surface template, in the shell or in the built pages, so the focus order stays the document order; the shell navigation landmark carries its `aria-label`. |
| Focus visible | 2.4.7 | The stylesheet carries the shared focus visible rule — `button:focus-visible`, `input:focus-visible` and `textarea:focus-visible` with a three pixel outline and its offset — so keyboard focus stays visible on every control. |
| Language of page | 3.1.1 | The design document stamps `lang="en"`, the build writes the stamp into every built surface page, and no template body carries its own `html` element that would override the stamp. |

Beside the referenced criteria the sweep audits the non-text contrast of the focus outline against the surface (at least 3:1, the companion of 1.4.11) and that the fallback tokens of the stylesheet mirror the theme tokens so a surface without tokens renders the same design.

## 3. The surfaces the sweep covers

The one design file carries the eight surface templates the build splits: the deployed site surface (the chatbridge page with its relay settings, chat and plan review), the popup, the sidepanel, the dashboardpage, the optionspage and the transparencypage (the five styled interface pages), and the sandbox and offscreen hosts (the unstyled document hosts whose inline scripts render hidden frames and worker logic). The sweep audits every template the same way — the script hosts answer their checks with zero controls and no headings, which the artifact records honestly instead of skipping.

## 4. The generated markup cross-check

The surface scripts (views.ts, sidepanel.ts, popup.ts, dashboardpage.ts, optionspage.ts and transparencypage.ts) generate markup at runtime: they assign class names through `className` and toggle state classes through `classList`. The sweep cross-checks the generated markup against the stylesheet the one design ships: every class name a template references, every state class a view script toggles and every class of the shared vocabulary the view scripts assign must resolve to a real stylesheet rule, so the generated markup renders with the rules the design declares and a renamed rule fails the gate instead of silently dropping the styling.

## 5. The honest limits

The sweep is static analysis of the surface templates, the embedded stylesheet, the view sources and the built pages. It audits no screen reader emulation (no NVDA, VoiceOver or ax query runs), no runtime focus walk (the tab order is proven from the document order and the absence of positive tabindex values, not from a driven keyboard), no rendered layout reflow (the virtualized lists and the dynamic panels of the sidepanel are audited through their templates and their class resolution, not through their painted geometry) and no localization beyond the language stamp (the locale bundles of the interface options are outside this checklist). The high contrast theme variants another release lane owns stay outside this sweep — the gate audits the default tokens only, exactly as the roadmap item scopes it.

## The automated checklist

| Check | Criterion | Family | Verification |
| --- | --- | --- | --- |
| 1 | 2.4.3 | surfaces | Every ui surface template the build splits is present and named: the design file carries all eight surface templates beside the shell navigation landmark with its aria-label and the switcher that names every nav button it creates. |
| 2 | 1.1.1 | non-text content | Every image carries its alt text and the decorative markers stay off the interactive elements: the audited images carry their alt attributes and the decorative markers (the hidden sandbox frame among them) sit on no interactive element, carry no tabindex and stay hidden. |
| 3 | 1.3.1 | names and labels | Every button carries an accessible name and every field carries its label: the audited buttons name themselves through their text content or their aria-label and the audited input, textarea and select fields carry their label element or their aria-label. |
| 4 | 1.3.1 | structure | Every surface heading hierarchy starts at the h1 with no skipped level: the audited surfaces answer one h1 followed by descending levels with no jump. |
| 5 | 1.4.3 | contrast | The default theme tokens meet the computed contrast ratios: the parsed tokens answer the required ratios (the text and muted pairs over both backgrounds at 4.5:1, the accent pairs at 3:1, the button ink over the accent at 4.5:1 and the focus outline at 3:1) with the fallback tokens mirroring the theme. |
| 6 | 2.4.7 | focus visible | The stylesheet carries the focus visible outlines: the shared rule covers the button, input and textarea selectors with its outline and its outline offset. |
| 7 | 2.4.3 | focus order | No positive tabindex reorders the focus order of any surface: the scanned tabindex attributes across the templates, the shell and the built pages answer zero positive values. |
| 8 | 3.1.1 | language | Every built surface page stamps its html lang and no template overrides it: the design document and every built page carry the lang stamp and no template body carries its own html element. |
| 9 | 1.3.1 | generated markup | The generated markup classes resolve to real stylesheet rules: every template class, every runtime state class the view scripts toggle and every shared vocabulary class resolves to a declared rule. |
| 10 | 2.4.3 | report | The sweep report records every check and the exit answers the failures: the report carries the executed checks with their outcomes, details and success criterion references and the gate sets its nonzero exit the moment any failed check lands in the artifact. |

The interface surfaces the templates render live in `docs/18.interfacesurfaces.md`, the site surface contract lives in `docs/14.servercontract.md`, and the release gate row that lands this walkthrough lives in `docs/releasegates.md`.
