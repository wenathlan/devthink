# stealthhead — features

real feature list from the code, grouped by category. every entry names a function, type or component that exists in the source.

## match

- lobby model — `MatchLobby` rows with title, region, state, capacity and nested rounds.
- round model — `MatchRound` rows with map, mode, index and pending/live/scored state.
- seat model — `MatchPlayer` rows with handle, squad, score and ping per lobby.
- lobby lifecycle — `LOBBYTRANSITIONS` state machine: open → live → closed, closed terminal.
- round lifecycle — `ROUNDTRANSITIONS` state machine: pending → live → scored, one live round per lobby.
- typed failures — `matchruleserror` with codes bad-transition, unknown-round, lobby-full, closed-lobby, bad-input.
- lobby transitions — `canlobbytransition` / `transitionlobby` validate and apply lobby moves without mutating input.
- round opening — `openround` opens a pending round of a live lobby, refusing double-live rounds.
- round scoring — `scoreround` scores the live round (or a named one).
- capacity enforcement — `seatplayers` rejects seat lists past the lobby capacity.
- score deltas — `addscore` adds points to a seat, floored at zero, rejecting non-finite input.
- tick simulator — `advancelobby` advances a lobby one tick: round expiry past the budget, autoadvance of the next pending round, lobby close when all rounds are scored.
- match events — `MatchEvent` kinds lobby-live, lobby-closed, round-live, round-scored, round-expired.
- next-action hints — `nextactions` returns start the match / open the next round / score the live round / close the lobby.
- progress measure — `progressof` returns the scored-round percentage of a lobby.
- lobby ordering — `orderlobbies` sorts live first, then open, then closed, ties by id.
- round counts — `roundcounts` counts pending/live/scored rounds of a lobby.
- current round — `currentround` finds the live round, else the first pending.
- seat leaderboard — `seatleaderboard` ranks the seats of one lobby by score, best first.
- seed data — `MATCHSEED` (4 lobbies, 9 rounds) and `MATCHPLAYERSEED` (8 players) as the in-memory seed.
- https accessors — `listmatches` / `listmatchplayers` fetch the site DB over HTTPS with a 2500 ms budget, falling back to the seed.

## ranking

- entry model — `RankingEntry` rows with player, squad, region, season, score, wins, matches, kd.
- seed ladder — `RANKINGSEED` with 10 rows of season s6 across four squads and four regions.
- https accessor — `listranking` fetches the site DB over HTTPS, falling back to the seed.
- ladder sort — `sortentries` orders by score, then wins, then player name.
- position stamping — `assignpositions` stamps 1-based positions onto sorted entries.
- season filter — `filterbyseason` keeps one season tag.
- win rate — `winrate` computes the 0-100 win percentage of an entry.
- podium — `podium` keeps the top three of a sorted ladder.

## ranking ladder

- expected score — `expectedscore` computes the elo expectation `1/(1 + 10^((opponent − rating)/scale))`.
- k-factor bands — `kfactor` picks k from a caller-supplied band table covering the rating axis.
- rating delta — `ratingdelta` computes `k × (observed − expected)` for win/loss/draw, clamped to the season ceiling.
- rating floor — `applydelta` applies a delta without dropping below the configured floor.
- rated duels — `rankduel` rates both sides with mirrored outcomes and returns deltas plus the expected score.
- projected runs — `projectedrating` replays a match run against the running rating.
- typed failures — `laddererror` with codes bad-rating, bad-outcome, bad-ktable, bad-options.
- zero hardcode — `LadderOptions` carries ktable, maxdelta, floorrating and scale as parameters, so each season tunes its own ladder.

## weapons

- weapon model — `Weapon` rows with kind, damage, fire rate, range, magazine, recoil and reload seconds.
- six kinds — `WeaponKind`: rifle, smg, sniper, shotgun, sidearm, heavy.
- armory catalog — `WEAPONCATALOG` with 10 seeded weapons (emberline ar, solstice dmr, glassjack smg, coldsnap break, quietfurnace sidearm, riftyard lmg, northglow marksman, duskwake compact, harbor twelve, atoll rifle).
- https accessor — `listweapons` fetches the site DB over HTTPS, falling back to the catalog.
- sustained dps — `dps` computes damage × fire rate / 60, rounded to one decimal.
- kind scan — `kinds` lists the distinct kinds of a row set in armory order.
- kind filter — `filterbykind` keeps one kind, or all rows when omitted.
- handling index — `handling` scores firerate against recoil on a 0-100 scale.
- damage order — `bydamage` orders the armory hardest hitting first.

## weapons ballistics

- damage falloff — `damageatmeters` interpolates full damage to the retained fraction between start and end meters, with an exposed curve exponent (1 linear, 2 quadratic).
- shots to kill — `shotstokill` divides the health pool by the falloff damage, applying the vital (hit-zone) multiplier.
- time to kill — `timetokill` returns shots, reload cycles and seconds from first trigger pull to kill.
- ttk sweep — `ttkbydistance` produces the per-distance ttk table over a distance ladder.
- balance validation — `validatebalance` checks each stat field against configured inclusive bounds and reports every violation.
- typed failures — `weaponstatserror` with codes bad-weapon, bad-health, bad-falloff, bad-bounds.

## world

- asset model — `WorldAsset` rows with name, kind, lfs path, sha-256 digest, size and a precompiled flag that is always true.
- four kinds — `WorldAssetKind`: map, prop, character, effect.
- asset catalog — `WORLDCATALOG` with 8 seeded GLB assets: 3 maps, 1 prop, 2 operators, 2 effects.
- render intent — `RENDERINTENT` pins the versawase engine of `@wenathlan/cadria` at the pre-compiled stage.
- digest shape check — `ishashshape` validates 64-character hex sha-256 digests.
- path normalization — `normalizepath` and `glbpath` produce the canonical assets/glb/ repository form.
- row builder — `catalogasset` builds a verified catalog row from its pieces.
- row verification — `verifyasset` checks digest shape, path form, .glb suffix and the precompiled flag before a row enters the catalog.
- kind filter — `filterbykind` keeps one asset kind, or all rows when omitted.
- size labels — `humansize` formats byte sizes for the gallery badges.
- https accessor — `listworldassets` fetches the site DB over HTTPS, falling back to the catalog.

## spawner

- spawn catalog — `SPAWNSEED` with 12 spawn points across steelhead dam, cold harbor and rift yard (ember, tide and neutral sides).
- seeded randomness — `makerng` builds a mulberry32 prng so the same seed replays the same match; Math.random is banned in simulation.
- team filtering — `spawnpointsformap` / `spawnpointsforteam` filter catalog rows, neutral points flowing to both sides.
- hard safety filters — `filterbymindistance` drops points inside the minimum radius of occupied spawns or living enemies.
- anti-camping pressure — `campscore` sums decaying death pressure inside the camp radius with a tick half-life.
- candidate scoring — `scorepoints` weighs base weight against camp pressure and enemy proximity.
- shortlist and lottery — `shortlist` keeps the top n, `pickspawn` runs the score-proportional seeded lottery.
- full pipeline — `selectspawn` chains filters, scoring, shortlist and lottery into one pure call.
- death tracking — `withdeath` appends death marks and prunes them past the window.
- respawn escalation — `respawnwait` grows the wait 1.5× per recent death up to the mode cap.
- spawn protection — `protectionuntil` / `isprotected` cover the protection window after a spawn tick.
- wave scheduling — `buildwave` / `duewaves` schedule wave-mode spawns on a fixed tick interval.

## physics

- vector math — vec3, add, scale, dot, length, normalize, distance over the minimal 3d vector type.
- collision queries — `sphereboxhit`, `spherespherehit`, `boxboxhit` plus `closestpoint` and `aabbcenter` support.
- swept box test — `sweepbox` returns the slab-method entry fraction of a moving box against a static box.
- body integration — `stepbody` advances one body per fixed step with gravity, grounded friction and restitution bounces off the arena bounds.
- drag model — `applydrag` decays velocity linearly per second, shared by projectiles and airborne bodies.
- projectile step — `stepprojectile` integrates gravity and drag, then sweeps the arena bounds and every body box, first hit wins.
- fixed-step accumulator — `fixedsteps` converts a frame delta into whole fixed steps with a carried remainder and a catch-up ceiling.
- arena factory — `createworld` builds the empty arena with the default gravity of -19.6 units/s² (about 2g, arcade feel).
- determinism — pure functions over plain structs; identical inputs always replay identical outputs.

## netcode

- snapshot model — `Snapshot` carries every entity at one tick.
- snapshot deltas — `makedelta` / `applydelta` compress and rebuild snapshots as changed-plus-removed lists.
- latest snapshot — `latestsnapshot` returns the newest snapshot of a stream.
- entity interpolation — `interpolateat` renders the entity states at a time, bracketing snapshot pairs with shortest-arc yaw lerp and a default 100 ms delay, no extrapolation.
- shared prediction — `simulatecmd` runs the exact server movement math at 6 units/s so client and server never diverge.
- command replay — `replaycmds` re-runs a command list over a state.
- drift detection — `positionerror` and `needsreconcile` measure predicted-versus-server error against the 0.1-unit threshold.
- reconciliation — `reconcile` keeps the prediction below threshold and replays the unacknowledged commands above it.
- lag compensation — `pushrewind`, `rewindattick` and `entityattick` keep and query a 32-frame rewind history.
- jitter measurement — `jitterof` computes the mean absolute drift of inter-arrival gaps.
- playout buffer — `makejitterbuffer`, `pushpacket` and `duepackets` order arrivals by tick, drop duplicates and release them after the configured delay.

## hud

- vitals model — `Vitals` with health and shields plus per-bar fractions and the alive check.
- vital bands — `vitaltier` maps the combined pool fraction to critical, low, wounded or healthy against 0.25 / 0.5 / 0.75 thresholds.
- damage application — `applydamage` absorbs into shields first and reports absorbed and overflow.
- effective pool — `effectivepool` computes the pool at a shield absorption ratio (the armor perk math).
- minimap bounds — `minimapbounds` derives the world extent of a position cloud with padding.
- minimap transform — `minimapconfig` / `tominimap` map world positions into the rotated, clamped widget space.
- hitmarker windows — `hitmarkerwindow` returns 220 / 320 / 520 ms for body, headshot and kill; `hitmarkerfor` ranks kill over headshot over body.
- hitmarker lists — `pushhitmarker` / `activehitmarkers` grow and prune the marker list by clock time.
- killfeed — `pushkillfeed` dedups by killer-victim-weapon-tick, caps at 6 rows; `prunekillfeed` expires rows after 8000 ms; `killfeedline` renders the plain-text line.
- directional damage — `directionaldamage` / `sectorof` map a threat to a relative angle and a front/right/behind/left sector, fading to the 0.2 strength floor.

## ui (sol theme)

- route table — Sol mounts /intro, /onboarding, then the shell with /, /match, /ranking, /weapons, /world, /404 and the catch-all.
- application shell — the Shell component hosts every fundamental route inside the one application window.
- entry gate — the HomeEntrygate hands unseen visitors to /intro then /onboarding, renders null while resolving and steps out for embedded frames.
- intro splash — the animated first-run intro page that marks introseen.
- onboarding frames — the three-step first-run onboarding that marks onboardingseen.
- construction face — the one Constructionface widget every game page (home, match, ranking, weapons, world) renders while the game is in development: brand mark, scope reticle hologram, route eyebrow, pulsing in-construction chip and two actions.
- 404 face — the notfound page answers /404 and every unknown route.
- toast surface — the toast component of the theme.
- brand mark — the ShellBrandmark widget (coral squircle with the scope glyph and flow band).
- home scope — the HomeScope widget (the drawn reticle the construction face hangs as a hologram).
- label store — every interface string rides the typed label accessor from labels.ts (revision 4); a hardcoded string inside a widget is a defect.
- theme switch — theme.ts flips dark/light in memory only, dark by default.
- reveal stagger — reveal.ts drives the shared scroll-reveal observer.
- family rail — family.ts / familyurl.ts carry the family accents and the relative sibling links.

## data layer

- sqlite bootstrap — db.ts opens one better-sqlite3 database on the vault storage lane from `DATABASE_URL` (default `file:./stealthhead.db`).
- idempotent schema — seven tables (matches, matchplayers, rankingentries, weapons, worldassets, onboardingstate, labels) created on every boot.
- first-run seed — the in-memory seeds of match, ranking, weapons and world persist inside one transaction, idempotent by insert-or-replace.
- prepared statements only — every read and write binds parameters; sql is never concatenated.
- typed getters — getlobby, getlobbyplayers, getranking, getweapons, getworldassets serve the domains.
- onboarding rows — getonboardingstate / setonboardingstage persist the visitor seen flags with a seen-wins upsert.
- label rows — savelabel, readlabel, readalllabels and seedlabelrows run the interface copy store without overwriting translated rows.
- onboarding endpoint — onboardingstate.ts reads and writes the flags over HTTPS /api/v1/onboarding with host validation (private, loopback, CGNAT and reserved ranges refused) plus a localStorage offline cache.
- static fallback — the browser bundle never imports db.ts; the pages fetch over HTTPS with a 2500 ms budget and fall back to the in-memory seeds.

## tests

- logic tests — matchrules, rankingladder, weaponstats, physics, netcode, spawner and hud test files pin the pure logics.
- contract tests — design, family, familyurl, sandboxmodality and onboardingstate test files pin the design contract, the family rail and the entry flow.
