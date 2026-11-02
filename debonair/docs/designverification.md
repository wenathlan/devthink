# design.verification — the live proof of the design reform (waves PV5.007 + PV5.008)

> the verification session of the debonair surface, run live in the browser
> against the vite dev server (port 4173, 1440×900 desktop and 390×844
> narrow passes) on 30 october 2026: every route of the app walked
> standalone at its own url AND inside the os power clip (the iframe mount
> the devthink window draws), the dark face and the light face compared per
> route, the interactions pressed (the rail and footer navigation, the hero
> prompt handoff, the composer, the play keys of the cards, rows and the
> shared bar, the transport and the mixer keys, the export bounce, the
> ingest bench with a real wav, the settings switches and the clean-url
> demo) and the console read after every step — zero errors, zero warnings
> for the whole session. the same pass cleared the residual biome debt of
> the Sol tree to zero findings. the screenshots of the session live in the
> wave record; the table below is the verdict the owner reads.

## the route table — the standalone faces

every route booted from a bare url on the vite server (a fresh profile for
the entry flow, the flow then completed so the platform pages answer
directly). dark = the sol default face; light = the rail-foot toggle (or
the settings appearance switch on the pages that own it), the same token
ladder flipped through `[data-theme="light"]`. console = the filtered
browser console after the route settled (the vite connect notices and the
react devtools tip excluded — no other line printed all session).

| route | dark ok | light ok | console clean | notes |
| --- | --- | --- | --- | --- |
| `/` (home) | yes | yes | yes | hero prompt, genre chips, badges, waveform strip, the six-row song grid with the play-on-hover key, the flow, the ledger, the spec proof and the family footer all answer; the hero draft hands to the composer through the session note (verified); the card play key drives the shared bar and the live ring |
| `/generate` | yes | yes | yes | the composer answers the handed draft (text + genre chip), the compose key renders a real take onto the session shelf (toast + row with the engine numbers), the open-in-studio key hands the take over; the genre lane carries all sixteen chips |
| `/ingest` | yes | yes | yes | the bench walked a real 3-second wav through decode → separate → analyze → segment → ready (the meter steps turning done/live), the three stem cards rendered, the audition keys soloed the harmonic stem through the shared bus, the mix key played the conserved sum, the store key answered with the offline mirror badge (the gateway is away on the dev server — the honest lane) and the shelf row landed |
| `/library` | yes | yes (after the sparkbar fix) | yes | the demo take, the composed takes and the sample rows render in the three shelves; the play key wears the live state on the bar and the row; the search filter answers over names, genres, keys and seeds with the honest empty states |
| `/studio` | yes | yes | yes | the take from the composer opened selected (readouts: clock, playhead, bpm, key, lufs); the transport play/stop/loop answered, the five strips (four roles + master) rendered faders, mute/solo keys and the live VU columns while playing, the timeline split key answered, the wav-16 export bounced a real file with the notice; the stage stepper carries the running grid |
| `/settings` | yes | yes | yes | the light and reduce-motion switches flip the document flags (data-theme / data-motion) with the toasts; the clean-url demo showed the dirty url and cleaned it through applyNow (the address bar verified); the region select and the save key answer |
| `/intro` | yes | n/a (session splash) | yes | replayed with the seen flags cleared: the mark lands, holds ~1.6s, slides up and hands to /onboarding; the skip law and the reduced-motion bypass ride the same leave path |
| `/onboarding` | yes | n/a (first-run card) | yes | the three steps walked (what / the surfaces ledger / enter), the skip key lands home, the finish key lands home |
| `/404` + dead routes | yes | yes | yes | the catch-all answers "dead air" with the two keys (home / studio), the shell, rail and bar intact at any unknown path |

the narrow pass (390px): every route holds with zero horizontal overflow —
the rail stays, the grids stack, the role line steps aside per the media
law.

## the power clip — the embedded seat (the ?arrive handoff)

the devthink os window mounts its family apps as iframes through the
relative familyurl contract, so the embedded law was verified against a
host page carrying the same mount the os draws (a window frame with the
title bar and the app in the frame at `/?arrive` — same-origin on the dev
server so the session could read inside the frame). the verdict:

| check | verdict |
| --- | --- |
| the seat | `shell shell--embedded` answers inside the frame (the standalone boots `shell--standalone` — the surface tree identical, the seat class alone differs, the window-era law) |
| the entry flow | the first-run gate lands straight home inside the frame (no intro, no onboarding — the flow belongs to the os shell, verified with the seen flags cleared) |
| the routes | home, generate, ingest, library, studio and settings all walked inside the clip by the rail links — every route answers, no horizontal overflow at the 1180px clip width |
| the light face | the rail-foot toggle flips the theme inside the frame (verified on the library face) |
| the console | zero errors inside the frame for the whole walk |

the honest limit of this sandbox: the devthink os deploy unit itself is not
running here, so the two-app session (the os barra typing `debonair`, the
os consuming the ?arrive param to focus its window, the ?independent
escape opening the app at its own url outside the frame) could not run
end-to-end. what the standalone session proves instead: the app boots
clean with either param in the address (`/?arrive` and `/?independent`
both render the full standalone face, the param inert, nothing stripped —
the params are the os host's contract, not the app's), and the embedded
seat answers the iframe mount exactly as the os power clip draws it. a
two-app session would add the real os chrome around the frame, the barra
routing and the window focus law — the debonair side of that contract
(the seat, the flow skip, the full surface inside the frame) is what this
session verified.

## the defects found and fixed

| defect | where | the fix |
| --- | --- | --- |
| the light face washed the library sparkbars out: the ready waveform mixed 38% of the dark signal over near-white (≈2.5:1 presence, flagged illegible in the session compare) and the draft waveform filled with the light ladder's surface-6 (#f1f1f2 on #f3f3f3 — invisible) | `Sol/sol.css` (the sparkbar ladder) | light-face overrides riding the same tokens: base 68% of the accent, ready 84%, draft a 26% ink mix over surface-2 — the waveform keeps the presence it owns on the dark floor (verified in the session: ready ≈5.8:1, draft quiet but visible, the compare clean) |

one candidate defect was judged a false positive and left untouched: the
player bar title truncates with an ellipsis — that is the design (the
single-line clamp of `.pbar-title`), not a clip.

## the biome debt of the sol tree (cleared to zero)

the design reform wave cleared its five files; the residual findings on
the rest of the tree were 11 errors + 2 warnings (13 diagnostics across 11
files: the unused STEP_LEADS constant of the onboarding, the role="meter"
div of the VU column, eight organize-imports/export sorts and four format
passes). all cleared, zero behavior changes except the one honest upgrade:

| finding | file | the fix |
| --- | --- | --- |
| `lint/correctness/noUnusedVariables` — STEP_LEADS never read | `Sol/onboarding/onboarding.tsx` | the dead constant removed (the titles ride the manifest keys inline) |
| `lint/a11y/useSemanticElements` — a div wearing role="meter" | `Sol/wingets/StudioVumeter.tsx` | the honest family fix: the painted column turns presentational (aria-hidden) and a real native `<meter>` carries the reading (sr-only beside it, min/max/value live) — verified in the session: the five columns paint and the five native meters carry the same levels [12, 72, 48, 0, 72] while the transport runs |
| `assist/source/organizeImports` + format (9 findings) | `App.tsx`, `Sol/generate`, `Sol/intro`, `Sol/notfound`, `Sol/settings`, `Sol/studio`, `Sol/wingets/index.ts`, `StudioPianoroll`, `StudioTimeline` | the deterministic sorts and line wraps applied (`biome check --write`) |

the gates after the wave: `pnpm typecheck` clean, `pnpm test` 548/548
green (the solcss contract included — the banned palette, the motion law,
the trylle foundation, the standalone law all still pinned), `npx biome
check Sol/ App.tsx` zero findings.
