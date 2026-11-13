# 25 — the wave plan: the ladder from 118 to 3.0

The owner doctrine of the batch: the ecosystem climbs to the competitor bar in
**waves** — each wave one selective grouping of actions (design, interaction,
logic), each wave one commit, each commit one patch rung on the version ladder,
each rung verified before the next wave opens. The campaign runs from the
current rung (2.0.118) to the 3.0 milestone. The patch ladder climbs one rung
per wave; when the patch counter passes 999 the ladder rolls into the next
minor house (2.0.999 → 2.1.0) and the climb continues until the phase ledger
closes at 3.0.0.

The campaign owns three priorities, in order, exactly as the owner dictated:

1. **The chat flagship** — the chat subapp must carry every feature the
   strongest competitors carry (Manus AI, ChatGPT, Meta AI, ZAI, with Grok and
   Claude as reference depth). The competitor matrix lives in the campaign
   worklog; the wave ledger below is its execution order.
2. **Truth in every surface** — no fake data, no silent seeds, no fabricated
   ladders or digests served as live. Every seeded surface declares itself or
   dies; every dead data layer is wired or deleted.
3. **The design and interaction grade** — the Windows 11 grammar of the house
   chrome (Fluent glyphs, flat wells, accent underlines, the 44px touch law,
   the slide-cum-fade mount grammar) applied with the micro-animation craft of
   the flagship surfaces, across every family app.

## The wave ledger

The ledger groups the campaign in three phases. Each wave line names its rung,
its scope and its acceptance. A wave closes only when the acceptance answers
green, the tests answer green and the commit rides the remote.

### Phase A — the chat flagship climbs to the competitor bar (rungs 119–145)

The chat audit and the competitor matrix drive the order: the self-contained
client craft first (stop, actions, markdown, pickers), then the data surfaces
(branching, management, memory), then the multimodal and agentic climbs
(attachments, voice, search, sandbox bridge).

| Rung | Wave | Scope | Acceptance |
| --- | --- | --- | --- |
| 119 | stop and regenerate | the AbortController rides runTurnStream to the composer; the Stop pill replaces Send while busy; per-turn regenerate on the last assistant turn | a busy turn stops mid-stream, the floor keeps the partial, regenerate re-answers |
| 120 | the message action row | copy-with-icon-morph, delete-own-turn, full timestamp on hover, the edited badge on branch turns | every action answers with a toast or a morph, no dead icons |
| 121 | date separators and clock craft | day separators between turns, locale time, the elapsed label while streaming | the thread reads like the flagship timelines |
| 122 | markdown v2 — block grammar | lists (ordered, unordered, nested), headings, blockquotes, hr | no raw asterisks on the floor, ever |
| 123 | markdown v2 — links, tables, code | safe links with citations grammar, tables, syntax highlighting on fenced code | competitor-grade rendering |
| 124 | the model picker | the microrow fetches /v1/models, the picker carries the gateway catalog, x-model rides the request | the 12-model catalog reaches the UI |
| 125 | the thinking picker and the token meter | effort high/medium/off in the microrow, the honest tokenestimate meter beside it | the user sees and steers cognition |
| 126 | the branch tree — surface | the checkpoint ladder surfaces: branch chips in the topbar, lineage switcher, checkpoint badge | the edit-branch data stops being invisible |
| 127 | the branch tree — map | the tree-map view of a session (the ChatGPT branch selector grammar) | any branch of any session reaches in two clicks |
| 128 | conversation search | the rail search box, title+content match, highlight | a 60-session list answers a query |
| 129 | session management | rename (inline), pin, duplicate, archive | the rail answers the competitor rail |
| 130 | export and share | .md and .json export of a session, the share-link stub | the conversation leaves the app intact |
| 131 | caps honesty | the trimmed-history affordance, delete-with-undo in the rail, the session-cap notice | nothing silent ever drops again |
| 132 | cognition retune | the drawer defaults collapsed with the elapsed shimmer, aria-live on the live turn | the flagship thinking grammar |
| 133 | the single error surface | one surface per failure (the inline row wins, the toast dies for chat errors), the one-h1 fix, the identity line dedupe | a11y-clean hierarchy |
| 134 | slash commands | the composer command palette (/model /think /clear /export /fork) | keyboard-first craft |
| 135 | attachments — the composer | the + lane, image chips, preview, the honest no-vision notice when the model refuses | files enter the conversation |
| 136 | attachments — the vision payload | content-parts to the engine, glm-5v declared and reachable | an image answers about itself |
| 137 | voice — dictation | the mic pill, ASR through the house sdk, the dictation shimmer | speech becomes draft text |
| 138 | voice — playback | the speaker pill per turn, TTS through the house sdk | the answer speaks |
| 139 | memory | persistent user facts, the memory panel, the system-prompt rider | the assistant remembers across sessions |
| 140 | web search | the search tool toggle, citations in the markdown grammar, the sourcing row | answers cite their sources |
| 141 | the sandbox bridge | sandbox output as conversation context, the spec picker, the cross-lane commands | chat and sandbox answer as one app |
| 142 | usage transparency | tokens/sec, elapsed, the per-turn cost line, the honest estimate label | the meter never lies about being an estimate |
| 143 | temporary chat and share links | the temp mode (no persistence), the published share page | the competitor privacy grammar |
| 144 | the chat polish pass | micro-animations, hover states, the light-theme completion, the scrollbar craft | the flagship bar |
| 145 | the chat regression battery | the tests that pin every wave above | the ladder is guarded |

### Phase B — truth in every family surface (rungs 146–165)

The family survey drives the order: the worst offenders first (stealthhead,
getry), then the disclosure passes (argan, debonair), then the dead layers,
then the shared-core unification and the per-app polish.

| Rung | Wave | Scope | Acceptance |
| --- | --- | --- | --- |
| 146 | stealthhead truth I | the ranking provenance badge, the honest refresh (no success toast on seed), the offline state | no fabricated ladder serves silently |
| 147 | stealthhead truth II | match/weapons/world seeds labeled or deleted; the fabricated digests die | every number on the page is real or labeled |
| 148 | getry truth | the key/session/message provenance markers, the seed disclosure on the tables | the gateway site stops serving fiction |
| 149 | argan truth | staging chips on the zone snapshot, the catalog wiring decision | the DNS ledger answers honestly |
| 150 | debonair truth | the demo row labeled, the fake statuses die, epoch dates fixed | the library answers honestly |
| 151 | cadria dead-layer | the catalog/seed/db trio wired or deleted | no dead code in the studio |
| 152 | forge dead-layer | db.ts wired or deleted | same |
| 153 | foundry dead-layer | db.ts wired or deleted | same |
| 154 | vault dead-layer | db.ts wired or deleted | same |
| 155 | saddle craft | the alert-based account panel climbs to the house toast grammar | no window.alert anywhere |
| 156 | the family shared core | Shell/BrandMark/sol.css/family.ts/reveal/zoomlock extracted to one package | the ×10 duplication dies |
| 157 | the icon grammar | Fluent glyphs across all ten apps | one grammar |
| 158 | cobaia billing | the honest checkout plumbing goes live | the monetization surface answers |
| 159–165 | the per-app polish passes | argan, cadria, debonair, forge, foundry, getry, vault — one rung each: micro-animations, hover craft, a11y, responsive | every app answers the A- bar |

### Phase C — the OS grade and the 3.0 stamp (rungs 166–198)

The OS subapps climb one by one to the flagship grade, then the campaign
closes with the cross-cutting sweeps and the release stamp.

| Rung | Wave | Scope |
| --- | --- | --- |
| 166–185 | the OS subapp passes | calculator, games, image, audio, video, usage, providers, projects, history, settings, console, gateway, docs, explore, onboarding, auth, intro, policy, terms, about — the Win11 grammar audit + micro-animation craft, one rung per surface group |
| 186 | the a11y sweep | roles, labels, focus order, the sr-only pass, the keyboard map |
| 187 | the responsive sweep | the mobile grammar of every surface, the 44px law verified |
| 188 | the performance pass | the bundle diet, the lazy mounts, the paint budget |
| 189 | the light-theme completion | every surface answers both themes |
| 190–196 | the regression and hardening waves | the battery grows with every phase, the smoke matrix, the cross-browser pass |
| 197 | the 3.0.0 release stamp | the changelog, the version family, the apifreeze re-freeze, the release metadata |
| 198 | the campaign close | the ledger answers green end to end |

## The wave discipline (the owner law)

1. **Fetch before and after.** `git fetch origin` opens the wave; the remote
   HEAD is verified before any work lands; a reset workspace is detected
   before it can eat a commit.
2. **One wave, one grouping, one commit.** The wave scope rides the ledger;
   the commit message names the wave and the rung.
3. **The rung climbs every wave.** package.json, the metadata family and the
   changelog carry the new patch number; the ladder never skips.
4. **Verified before the next wave opens.** The dev server answers, the tests
   answer, the commit rides the remote, and only then does the next wave
   start. No wave opens on a red pipeline.

The campaign worklog (the analysis corpus: the competitor matrix, the chat
audit, the family survey) rides the campaign folder outside the repository
tree; this ledger is the public face of the plan.
