# stealthhead

## Objective

Stealthhead is the FPS game platform of the family: matches, rounds, ranking ladders, weapons and world assets under one game shell. It imports the 3D engine from the video studio and the audio from the DAW via the published libraries — no engine file of its own, only game logics.

## Features

- Match platform — lobbies with title, region, state, capacity and nested rounds; seats with handle, squad, score and ping.
- Match lifecycle — lobby state machine (open, live, closed terminal) and round state machine (pending, live, scored) with one live round per lobby and typed failure codes for refused moves.
- Round operations — opening a pending round of a live lobby, scoring the live or named round, capacity enforcement and score deltas floored at zero.
- Tick simulator — advances a lobby one tick: round expiry past the budget, auto-advance of the next pending round, lobby close when all rounds are scored.
- Match intelligence — event kinds (lobby live, closed, round live, scored, expired), next-action hints, progress measure, lobby ordering, round counts, current round and the seat leaderboard.
- Ranking ladder — season entries with player, squad, region, score, wins, matches and kill/death; ladder sort, position stamping, season filter, win rate and the podium of three.
- Elo engine — expected score, k-factor bands over the rating axis, rating deltas clamped to the season ceiling, rating floor, rated duels with mirrored outcomes and projected rating replays — every parameter caller-supplied, zero hardcode.
- Weapons — a ten-weapon armory catalog across six kinds (rifle, smg, sniper, shotgun, sidearm, heavy) with damage, fire rate, range, magazine, recoil and reload stats; sustained DPS, kind scan and filter, handling index and damage ordering.
- Ballistics — damage falloff with exposed curve exponent, shots to kill with hit-zone multipliers, time to kill from first trigger pull, per-distance TTK sweeps and balance validation against configured bounds.
- World — an eight-asset precompiled catalog of maps, props, characters and effects with digest shape checks, canonical path forms and row verification before any asset enters the catalog.
- Spawner — twelve spawn points across three maps with seeded randomness (the same seed replays the same match), team filtering, minimum-distance safety filters, anti-camping death pressure, candidate scoring, shortlist and score-proportional lottery, death tracking, respawn escalation, spawn protection windows and wave scheduling.
- Physics — vector math, sphere/box collision queries, swept box tests, body integration with gravity, friction and restitution, drag, projectile stepping with first-hit-wins sweeps, a fixed-step accumulator with catch-up ceiling and an arena factory — pure and deterministic.
- Netcode — snapshot model with delta compression, entity interpolation with shortest-arc yaw lerp and no extrapolation, shared prediction (the exact server movement math), command replay, drift detection with a reconciliation threshold, a 32-frame rewind history for lag compensation, jitter measurement and a playout buffer that orders arrivals by tick.
- HUD — vitals with shields and tier bands, shield-first damage absorption, effective pool with absorption ratio, minimap bounds and rotated widget transform, hitmarker windows (body, headshot, kill) with pruning, a deduplicated six-row killfeed with expiry and directional damage sectors with fading strength.

## Game

- Construction honesty — every game page renders the one construction face (brand mark, scope reticle hologram, route eyebrow, in-construction chip and two actions) while the game is in development.
- Determinism law — Math.random is banned in simulation; the seeded PRNG replays identical matches.
- Engine imports — the 3D render rides the published video-studio library pinned at the pre-compiled stage; the audio rides the published DAW library.
- Armory balance — the balance validator reports every stat violation against inclusive bounds, so tuning stays honest.

## Interactions

- Route tree — intro, onboarding, home, match, ranking, weapons, world and the 404 page.
- Entry flow — entry gate hands unseen visitors to the intro splash and the three-step onboarding; both mark the stage seen.
- Shell — application shell hosting every fundamental route, brand mark, home scope hologram, toast surface, label store law, theme switch, reveal stagger and family rail with the sibling accents.
- Data accessors — the pages fetch over HTTPS with a bounded budget and fall back to the in-memory seeds.

## Data

- SQLite bootstrap on the shared storage lane: seven tables (matches, match players, ranking entries, weapons, world assets, onboarding state, labels) created idempotently on every boot.
- First-run seed persists the in-memory seeds inside one transaction; prepared statements only, typed getters per domain; the browser bundle never imports the database driver.
- Onboarding endpoint — flags read and written over HTTPS with host validation (private, loopback, CGNAT and reserved ranges refused) plus a local offline cache.

## Engine role

Game surface of the family: the platform logic (match, ranking, weapons, world) riding the published 3D and audio engines of its siblings.

Padrão: seguir o padrão moderno.
