# stealthhead — game documentation

stealthhead is the FPS game platform of the wenathlan family: match, ranking, weapons and world logics with a precompiled world. it owns no engine file — rendering rides the versawase engine imported from the published library `@wenathlan/cadria` — and it ships precompiled, so the visitor machine compiles nothing. the web surface is the Sol theme, a Vite + React SPA.

## module inventory (root layer)

- `match.ts` — the lobby/round/player model plus the seed rows (4 lobbies, 9 rounds, 8 seated players) and the HTTPS accessors with in-memory fallback.
- `matchrules.ts` — the pure match state machine: lobby and round transition tables, seat capacity checks, score deltas, the one-tick lobby simulator and the next-action hints.
- `physics.ts` — the deterministic physics kernel: fixed-step integration, aabb/sphere collision queries, one swept-box test, friction and restitution, gravity/drag projectiles.
- `netcode.ts` — the deterministic network layer: snapshot deltas, entity interpolation, input reconciliation and lag compensation by buffer rewind, plus the jitter playout buffer.
- `ranking.ts` — the leaderboard domain: the ladder entry model, the season seed (10 rows, season `s6`) and the sort/rank/filter/podium helpers.
- `rankingladder.ts` — the elo ladder arithmetic: expected score, k-factor band table, clamped deltas with rating floor, zero-sum duels and projected rating runs. every constant is a parameter.
- `weapons.ts` — the armory domain: the weapon model (6 kinds) and the 10-row catalog plus dps, handling and filter helpers.
- `weaponstats.ts` — the terminal ballistics math: damage falloff over distance, shots to kill, time to kill (with reload cycles), the per-distance ttk sweep and balance validation against configured bounds.
- `world.ts` — the world asset storage and precompilation surface: the GLB catalog (name, kind, lfs path, sha-256, size), digest and path verification, and the render intent (versawase, pre-compiled stage).
- `spawner.ts` — spawn selection and respawn pacing: seeded prng lottery, team weighting, minimum-distance hard filters, anti-camping pressure, respawn escalation with protection windows and wave scheduling.
- `hud.ts` — the hud state logic: vital bands for health/shields, minimap coordinate transforms, hitmarker windows, the deduped killfeed with ttl and directional damage indicators.
- `db.ts` — the self-hosted database bootstrap (better-sqlite3 through the vault storage lane) with the idempotent schema and seed pass.
- `onboardingstate.ts` — the one writer of the visitor seen flags (intro, onboarding) over the HTTPS onboarding endpoint, with offline cache and seen-wins merge.
- `labels.ts` — the label store manifest: every interface string rides the typed accessor, revision 4.
- `theme.ts` — the dark/light theme switch, in memory only, dark by default.
- `family.ts` / `familyurl.ts` / `reveal.ts` / `sandboxmodality.ts` — family accents, sibling links, scroll reveal and sandbox modality of the Sol surface.

## match model and rules

- lobby states: `open` → `live` → `closed` (transition table `LOBBYTRANSITIONS`; closed is terminal).
- round states: `pending` → `live` → `scored` (`ROUNDTRANSITIONS`; scored is terminal); only one live round per lobby.
- failure codes of `matchruleserror`: `bad-transition`, `unknown-round`, `lobby-full`, `closed-lobby`, `bad-input`.
- `seatplayers` enforces the lobby capacity; `addscore` adds points floored at zero.
- `advancelobby` is the one-tick simulator: a live round past `roundbudgetseconds` expires, `autoadvance` opens the next pending round, and the lobby closes when every round is scored. events: `lobby-live`, `lobby-closed`, `round-live`, `round-scored`, `round-expired`.
- next-action hints: `start the match`, `open the next round`, `score the live round`, `close the lobby`.
- seed lobbies: `m-2201` dawn raid ranked (sa-east, live, cap 10), `m-2202` nightfall wingman (us-east, open, cap 8), `m-2203` emberline casual (eu-west, open, cap 12), `m-2204` solstice cup finals (sa-east, closed, cap 10).
- game modes in the seed: domination, team deathmatch, search, duel, control.
- maps in the seed: steelhead dam, cold harbor, rift yard, vertigo stacks, glass atoll, emberline.
- helper reads: `orderlobbies` (live → open → closed), `roundcounts`, `currentround`, `seatleaderboard` (score, best first).

## physics kernel

- pure functions over plain structs; identical inputs replay identical outputs.
- default gravity `DEFAULTGRAVITY` = { 0, -19.6, 0 } units/s² (about 2g, arcade feel).
- bodies: inverse mass (0 pins to the world), restitution, grounded friction; `stepbody` integrates and bounces off the arena bounds.
- projectiles: gravity plus linear drag; `stepprojectile` sweeps against the arena bounds and every body box, first hit wins.
- `sweepbox`: the slab-method entry fraction of a moving box against a wall box.
- collision queries: sphere-box, sphere-sphere, box-box.
- `fixedsteps`: the fixed-step accumulator with a catch-up ceiling (default 5 steps per frame).

## netcode

- snapshot model: full `Snapshot` per tick, `SnapshotDelta` carries only movers, spawns and removals (`makedelta` / `applydelta`).
- client interpolation: renders `DEFAULTINTERPDELAY` = 100 ms behind, bracketing snapshot pairs, shortest-arc yaw lerp, no extrapolation.
- prediction: `simulatecmd` runs the exact server movement math at `CMDSPEED` = 6 units/s; both sides share it.
- reconciliation: triggers past `RECONCILETHRESHOLD` = 0.1 world units; the server state wins and the unacknowledged commands replay.
- lag compensation: the server keeps a rewind history of `REWINDCAP` = 32 snapshots and answers entity state at any stored tick.
- jitter buffer: `jitterof` measures the mean absolute drift of inter-arrival gaps (simplified RFC 3550 flavor); the playout buffer orders arrivals by tick, drops duplicates and releases them after the configured delay.
- non-goals (by design): no sockets, no wire serialization, no encryption — transport stays outside.

## ranking

- entry shape: player, squad, region, season, score, wins, matches, kd.
- seed: 10 rows, all season `s6`, squads ember / tide / ash / sol, regions sa-east / us-east / eu-west / us-west. leader: vanta.k, 48120 points, 214 wins of 331, kd 2.41.
- helpers: `sortentries` (score, then wins, then name), `assignpositions` (1-based), `filterbyseason`, `winrate` (0-100), `podium` (top three).

## ranking ladder (elo arithmetic)

- expected score: `1 / (1 + 10^((opponent - rating) / scale))` — the classic elo form, scale is a parameter (400 in the classic shape).
- k factor: picked from a caller-supplied band table (`KBand` minrating/maxrating/k); nothing is hardcoded.
- rating delta: `k * (observed - expected)` for win / loss / draw, clamped to the season `maxdelta`.
- `applydelta` honors the `floorrating`; `rankduel` rates both sides of a duel with mirrored outcomes; `projectedrating` replays a match run against the running rating.
- failure codes of `laddererror`: `bad-rating`, `bad-outcome`, `bad-ktable`, `bad-options`.

## weapons

six kinds: `rifle`, `smg`, `sniper`, `shotgun`, `sidearm`, `heavy`.

the armory catalog (`WEAPONCATALOG`, 10 weapons):

| id | name | kind | damage | fire rate (rpm) | range (m) | magazine | recoil | reload (s) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| w-1 | emberline ar | rifle | 28 | 660 | 48 | 30 | 34 | 2.1 |
| w-2 | solstice dmr | sniper | 88 | 90 | 120 | 8 | 72 | 3.2 |
| w-3 | glassjack smg | smg | 19 | 900 | 26 | 34 | 22 | 1.7 |
| w-4 | coldsnap break | shotgun | 96 | 70 | 14 | 6 | 81 | 2.8 |
| w-5 | quietfurnace sidearm | sidearm | 32 | 320 | 32 | 12 | 27 | 1.4 |
| w-6 | riftyard lmg | heavy | 34 | 540 | 60 | 80 | 48 | 4.6 |
| w-7 | northglow marksman | sniper | 74 | 110 | 96 | 10 | 63 | 2.9 |
| w-8 | duskwake compact | smg | 17 | 960 | 22 | 38 | 19 | 1.6 |
| w-9 | harbor twelve | shotgun | 84 | 85 | 16 | 8 | 76 | 2.5 |
| w-10 | atoll rifle | rifle | 31 | 600 | 54 | 25 | 37 | 2.3 |

- derived stats: `dps` (damage × fire rate / 60), `handling` (firerate against recoil, 0-100), `bydamage` ordering.
- ballistics (`weaponstats.ts`): damage falloff spec per catalog slice — full damage to `startmeters`, settling at `retainfraction` by `endmeters`, curve exponent 1 linear (2 quadratic available).
- time to kill: `shotstokill` (ceil of health over per-shot damage, vital multiplier applied), `timetokill` (shot gaps plus one reload per magazine cycle), `ttkbydistance` sweeps a distance ladder.
- balance: `validatebalance` checks each row field against configured `BalanceBounds` (min/max per field; unbounded fields are never checked).

## world (precompiled assets)

- the world gallery catalogs GLB scene assets as DB rows; the binaries live in git lfs and download separately, verified against the row sha-256 (the row is the source of truth).
- render intent: engine `versawase`, library `@wenathlan/cadria`, stage `pre-compiled` — every asset ships precompiled, always.
- catalog (`WORLDCATALOG`): the honest empty shelf — zero seeded assets. A world row is an attestation (digest + byte size of a binary that exists); digests are computed during the build that ships the binary (sha256sum law), never hardcoded, so no row ships until a real GLB lands.
- verification: `ishashshape` (64 hex chars), `normalizepath`, `glbpath` (assets/glb/...), `catalogasset` row builder, `verifyasset` (digest shape, path form, `.glb` suffix, precompiled flag).
- `humansize` formats the byte sizes for the gallery badges.

## spawner

- teams: `ember`, `tide`, `neutral` (neutral points always flow to either side).
- seed: 12 spawn points across the three catalog maps — 4 per map (steelhead dam and cold harbor split ember/tide, rift yard all neutral).
- determinism: `makerng` is a mulberry32 seeded prng; Math.random is banned in simulation, so the same seed replays the same match.
- default tuning (`DEFAULTSPAWNCONFIG`): mindistance 12, campradius 10, camphalflife 400 ticks, respawnbase 50, respawncap 400, protectionticks 60, topn 3.
- selection pipeline (`selectspawn`): team filter → hard minimum-distance filters against occupied points and living enemies → scoring (base weight × anti-camp discount × enemy-distance factor) → top-n shortlist → score-proportional seeded lottery.
- anti-camping: each recent death inside the camp radius adds pressure that decays by half every `camphalflife` ticks.
- respawn pacing: the wait escalates 1.5× per recent death, capped at `respawncap`; spawn protection covers `protectionticks` after the spawn tick.
- wave mode: `buildwave` / `duewaves` schedule `countperwave` spawns every `intervalticks` for `waves` waves.

## hud

- vitals: health plus shields; damage applies shields first (`applydamage` reports absorbed and overflow).
- vital bands over the combined pool fraction: critical < 0.25, low < 0.5, wounded < 0.75, healthy above.
- minimap: world-to-widget transform with receiver yaw rotation, padding ring and off-map clamping; bounds derive from a position cloud.
- hitmarkers: body / headshot / kill with windows 220 / 320 / 520 ms; kill outranks headshot outranks body.
- killfeed: dedup by killer-victim-weapon-tick, ttl 8000 ms, cap 6 rows, plain-text line rendering.
- directional damage: relative angle on the x/z plane mapped to front / right / behind / left quadrants, strength fading to the 0.2 floor.

## data layer

- one sqlite database through better-sqlite3, opened on the vault storage lane (`@wenathlan/vault/storagelane`); location from `DATABASE_URL` (default `file:./stealthhead.db`).
- tables: `matches`, `matchplayers`, `rankingentries`, `weapons`, `worldassets`, `onboardingstate`, `labels` — created idempotently on every boot.
- the first run persists the in-memory seeds of match, ranking, weapons and world inside one transaction (insert or replace, idempotent).
- every statement is a prepared statement with bound parameters; sql is never assembled by string concatenation.
- the static browser bundle never imports db.ts: the pages fetch the rows over HTTPS (`/api/v1/matches`, `/api/v1/matches/players`, `/api/v1/ranking`, `/api/v1/weapons`, `/api/v1/world`) with a 2500 ms budget and fall back to the in-memory seeds when the endpoint is absent.
- onboarding flags ride `GET` / `POST /api/v1/onboarding` (HTTPS only, host-validated: localhost, loopback, private, CGNAT, link-local and reserved ranges are refused), with a localStorage offline cache and a seen-wins merge.

## sol subapps (the web surface)

- `sol/Sol.tsx` — the theme anchor and route table: `/intro`, `/onboarding`, then the shell with `/`, `/match`, `/ranking`, `/weapons`, `/world`, `/404` and the catch-all.
- `sol/shell` — the application window hosting every fundamental route.
- `sol/intro` — the animated first-run splash.
- `sol/onboarding` — the three-step first-run frames.
- `sol/home` — the gated home (entry gate decides intro → onboarding → home).
- `sol/match`, `sol/ranking`, `sol/weapons`, `sol/world` — the four game domain pages.
- `sol/notfound` — the 404 and catch-all face.
- `sol/toast` — the toast surface.
- `sol/wingets` — the shared widgets: `Constructionface` (the in-construction face), `HomeEntrygate`, `HomeScope`, `ShellBrandmark`.

## current construction state

- the game is presented as in construction: every game page (home, match, ranking, weapons, world) renders the one `Constructionface` component instead of its retired ledger face.
- the face answers as a drawn scene: the brand mark (coral squircle with the scope glyph), a slow-sweeping scope reticle hologram, the route eyebrow, the `stealthhead` title, a pulsing `in construction` chip, the line "the FPS platform is in construction." and two ways on (back to home, replay the intro).
- the retirement is face-only: the root game logics (match, physics, netcode, ranking, weapons, world, spawner, hud) keep riding their own files untouched under the hood; nothing was deleted.
- the first-run flow (intro, onboarding) and the shell rail stay live; the entry gate hands unseen visitors to `/intro` then `/onboarding`, and embedded frames (iframes) land straight home.

## tests

12 test files pin the logics and the design contract: design, family, familyurl, hud, matchrules, netcode, onboardingstate, physics, rankingladder, sandboxmodality, spawner, weaponstats.
