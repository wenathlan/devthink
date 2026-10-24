# Interface inventory

The 1.1.65 family finishes the interface layer of the 1.1.64 surfaces. This document inventories every surface element with its a11ylabel: the role, the accessible name, the state and the value each control exposes to screen readers, resolved through the locale bundles so the labels follow the language of the interface. The consent gates do not move: no element in this inventory ever bypasses the human review, and every read, capture or export rides its gate.

## How the inventory reads

Every control carries one a11ylabel from `tourviews.ts`: the control id, the wai-aria role, the accessible name (a locale key resolved in the interface language with the english fallback), and the optional state and value. The tables below list the shipped labels per surface; the surfaces extend the sets as the interface grows, and a missing name never renders because the english bundle backs every key.

## Popup (command surface)

| Element | Role | Name key | State or value |
| --- | --- | --- | --- |
| taskinput | textbox | popup.taskinput.placeholder | state: idle |
| submit | button | popup.taskinput.submit | — |
| palette | button | popup.palette.open | — |
| recenttray | list | popup.recent.title | value: 0 runs (grows with the tray) |

The recenttray entries offer resume for a halted run and reopen for a completed one; both buttons carry the popup.recent.resume and popup.recent.reopen names.

## Sidepanel (workspace)

| Element | Role | Name key | State or value |
| --- | --- | --- | --- |
| plantab | tab | sidepanel.tab.plan | state: selected |
| runtab | tab | sidepanel.tab.run | state: unselected |
| reviewtab | tab | sidepanel.tab.review | state: unselected |
| datagrid | table | grid.empty (or the grid title) | — |
| compareviewer | slider | sidepanel.data.compare | value: 50 (the slider position) |
| picker | button | sidepanel.data.picker | — |

The plan tab keeps the 1.1.64 elements (the taskinput box, the plancards with stepapprove and diffpreview), the run tab keeps the stepstimeline and the evidence views, and the review tab keeps the logstream; the 1.1.65 data tab adds the datagrid preview with its local filter, the compareviewer slider, the shotpanel preview and the picker session list.

## Dashboardpage (full page view)

| Element | Role | Name key | State or value |
| --- | --- | --- | --- |
| sessiongrid | table | dashboard.title | value: 0 runs (grows with the grid) |
| historysearch | search | dashboard.history | — |
| dropzone | region | options.importexport.label | — |

## Optionspage

| Element | Role | Name key | State or value |
| --- | --- | --- | --- |
| theme | radiogroup | options.theme.label | value: system (the resolved preference) |
| locale | combobox | options.locale.label | value: en (the interface language) |
| shortcuts | group | options.shortcuts.label | — |
| notifications | switch | options.notifications.label | state: off (the stored preference) |
| importexport | region | options.importexport.label | — |
| tour | button | options.tour.label | — |

## Onboarding, omnibox and page

| Element | Role | Name key | State or value |
| --- | --- | --- | --- |
| onboarding | dialog | options.tour.label | state: open (while the walkthrough runs) |
| omnibox | textbox | popup.taskinput.placeholder | — |
| pagechip | group | pagechip.approve | state: pending (until the resolution) |

The pagechip exposes pagechip.approve and pagechip.reject actions anchored to the target element; the resolution writes to the immutable log exactly like a stepapprove resolution.

## Review controls across the surfaces

The stepapprove buttons (stepapprove.approve, stepapprove.reject, stepapprove.edit) and the pagechip actions share one grammar: one distinct human action resolves exactly one step, the background never resolves a review on its own, and the resolution lands in the immutable log under the review kind.

## Locale coverage

The shipped bundles cover english (en) and portuguese (pt); `localestring` resolves every key in the requested language and falls back to english for a missing string, so no control ever renders an empty name. `localeformat` renders dates, numbers and durations per language. The a11ylabels localize through the same bundles (`a11ylabelslocalizedfor`), so the screen reader names follow the interface language the user chose in the optionspage.
