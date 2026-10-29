/**
 * labels.ts — every interface string lives in the label store, the wingets
 * and page anchors read through this typed accessor, and a hardcoded string
 * inside a widget is a defect. the manifest below is the english source of
 * truth extracted from the real strings of the Sol wingets and the page
 * anchors; the seed ingests it into the labels store (the site db through
 * db.ts on the server, the browser rows cache in the visitor machine) and
 * the seed never overwrites a translated row.
 *
 * the browser never imports db.ts (better-sqlite3 cannot ride the static
 * bundle): the type comes across erased, the browser seed mirrors the rows
 * into the local cache the way onboardingstate.ts mirrors the seen flags.
 *
 * the design is frozen: the manifest carries the verbatim strings the
 * wingets rendered before the copy wave — the exact same text renders,
 * only its source becomes the accessor. data stays data: lobby rows, seat
 * handles, weapon kinds, world asset paths, digests, the theme token and
 * the route hrefs keep flowing from the root logics; the prose and the
 * affordances around them ride here.
 */

import type { LabelRow } from "./db.ts";

/** the label revision of the manifest: bump on every copy wave so the seed
 * refreshes the store rows of the changed strings. */
export const LABELREVISION = 1;

/** the english manifest: the page.widget.key path answers the surface text.
 * every entry is the verbatim string the wingets and page anchors rendered
 * before the copy wave — zero invented copy. */
export const LABELMANIFEST = {
  // the app boundary (App.tsx, the boot anchor)
  "app.boundary.body": "stealthhead could not render this frame.",
  "app.boundary.reload": "reload the interface",
  // the window shell widget (the one chrome of the application)
  "shell.window.aria": "stealthhead",
  "shell.name": "stealthhead",
  "shell.role": "the FPS game platform of the wenathlan family",
  "shell.caption.minimize": "Minimize",
  "shell.caption.maximize": "Maximize",
  "shell.caption.restore": "Restore",
  "shell.caption.close": "Close",
  "shell.rail.aria": "Pages",
  "shell.rail.head": "pages",
  "shell.rail.home": "home",
  "shell.rail.homeDetail": "the FPS platform of the family",
  "shell.rail.match": "match",
  "shell.rail.matchDetail": "lobbies, rounds and live seats",
  "shell.rail.weapons": "weapons",
  "shell.rail.weaponsDetail": "armory grid with damage stats",
  "shell.rail.world": "world",
  "shell.rail.worldDetail": "hash-verified GLB world assets",
  "shell.rail.ranking": "ranking",
  "shell.rail.rankingDetail": "the competitive ladder of the season",
  "shell.family.head": "family",
  "shell.family.tip": "{slug} — opens in a new tab",
  "shell.family.aria": "open {slug} in a new tab",
  "shell.theme.aria": "toggle theme",
  "shell.chip.restoreAria": "Restore stealthhead",
  "shell.chip.name": "stealthhead",
  // the intro page anchor (the splash)
  "intro.aria": "stealthhead is opening",
  "intro.name": "stealthhead",
  "intro.role": "the FPS game platform of the wenathlan family",
  "intro.skip": "click or press any key to skip",
  // the onboarding page anchor (the first-run frames)
  "onboarding.aria": "stealthhead first run",
  "onboarding.title": "welcome to stealthhead",
  "onboarding.steps.is.eyebrow": "01 — the app",
  "onboarding.steps.is.title": "one window, the whole platform",
  "onboarding.steps.is.text":
    "stealthhead is the FPS game platform of the wenathlan family — not an operating system: one application window holding the match surfaces, the season ladder and the armory of the game.",
  "onboarding.steps.does.eyebrow": "02 — the surfaces",
  "onboarding.steps.does.title": "what the window hosts",
  "onboarding.steps.enter.eyebrow": "03 — enter",
  "onboarding.steps.enter.title": "ready to enter",
  "onboarding.steps.enter.text":
    "the window opens on the home dashboard and every page rides the same rail. the theme starts dark and stays in memory only — nothing is written to this machine.",
  "onboarding.skip": "skip",
  "onboarding.back": "back",
  "onboarding.next": "continue",
  "onboarding.enterCta": "enter stealthhead",
  // the home page anchor (the cinematic landing)
  "home.eyebrow": "stealthhead · fps platform",
  "home.title": "Sights on. Stage set.",
  "home.lede":
    "The first-person shooter platform of the family — it imports versawase from cadria and audio from debonair, carries no engine file of its own, and serves match, ranking, weapons and world from one DB layer.",
  "home.cta.match": "enter a match",
  "home.cta.dataCue": "how data reaches you",
  "home.data.toast": "the ladder answers from the site DB over HTTPS — nothing is stored on your machine",
  "home.badge.versawase": "versawase — imported from cadria",
  "home.badge.audio": "audio — imported from debonair",
  "home.badge.noEngine": "no engine file of its own",
  "home.badge.precompiled": "ships pre-compiled",
  "home.featured.aria": "featured match",
  "home.featured.wait": "reading the board from the site db…",
  "home.featured.tip": "open the board of {title}",
  "home.featured.eyebrow": "featured match",
  "home.featured.meta": "{region} · capacity {capacity} · rounds {scored} scored / {live} live / {pending} pending",
  "home.featured.settled": "settled",
  "home.featured.settledNote": "every round of this lobby is scored.",
  "home.featured.mode": "{mode} · r{index}",
  "home.featured.progressAria": "round progress {progress} of 100",
  "home.featured.cta": "open the board",
  "home.scope.title": "scope reticle",
  "home.domains.aria": "game domains",
  "home.domains.eyebrow": "the four domains",
  "home.domains.title": "One platform. Four consoles.",
  "home.domain.match": "match",
  "home.domain.matchAbout": "Lobbies, rounds and the live seat table of every running match.",
  "home.domain.matchMeta": "lobbies · rounds · seats",
  "home.domain.ranking": "ranking",
  "home.domain.rankingAbout": "The competitive ladder of the season, seeded and served by the site DB.",
  "home.domain.rankingMeta": "ladder · elo deltas",
  "home.domain.weapons": "weapons",
  "home.domain.weaponsAbout": "The armory ledger with damage, handling and kind helpers from the root logic.",
  "home.domain.weaponsMeta": "damage · ttk · falloff",
  "home.domain.world": "world",
  "home.domain.worldAbout": "Pre-compiled GLB world assets listed as hash-verified DB rows.",
  "home.domain.worldMeta": "glb rows · sha-256",
  "home.quad.aria": "platform index",
  "home.quad.platform": "platform",
  "home.quad.platformLine": "stealthhead — the fps game platform of the wenathlan family",
  "home.quad.domains": "domains",
  "home.quad.engine": "engine",
  "home.quad.doctrine": "doctrine",
  "home.quad.doctrineLine1": "pre-compiled on the family domains",
  "home.quad.doctrineLine2": "one db layer · zero client storage",
  "home.family.aria": "the family apps",
  "home.family.head": "the devthink family",
  "home.family.tip": "open {slug} in its own deploy",
  "home.family.ariaOpen": "open {slug} in a new tab",
  // the match page anchor (the scoreboard ledger)
  "match.eyebrow": "stealthhead · match",
  "match.title": "match lobby and round table",
  "match.lede":
    "Every running match of the platform: lobbies with their round tables and the live seat leaderboard. Rows are served by the site DB over HTTPS — the interface stores nothing on your machine.",
  "match.refresh.tip": "refetch the lobby rows from the site db over https",
  "match.refresh": "refresh the board",
  "match.toast.refreshed": "lobby board refreshed from the site DB",
  "match.toast.failed": "the site DB did not answer; the seed stays on",
  "match.empty": "No match is seated right now. The board answers as soon as the DB serves one.",
  "match.state.tipLive": "the match is running now",
  "match.state.tipOpen": "seats are open",
  "match.state.tipClosed": "the lobby is closed",
  "match.lobby.meta": "{region} · capacity {capacity} · rounds {scored} scored / {live} live / {pending} pending",
  "match.seats.caption": "seats of {title}",
  "match.table.seat": "seat",
  "match.table.handle": "handle",
  "match.table.squad": "squad",
  "match.table.score": "score",
  "match.table.ping": "ping",
  "match.seats.loading": "loading seats",
  "match.row.ping": "{ping} ms",
  "match.rail.liveRound": "live round",
  "match.rail.roundTable": "round table",
  "match.rail.settled": "settled",
  "match.rail.settledNote": "every round of this lobby is scored.",
  "match.rail.mode": "{mode} · r{index}",
  "match.rail.ledger": "round ledger",
  "match.ledger.scored": "scored",
  "match.ledger.live": "live",
  "match.ledger.pending": "pending",
  "match.ledger.capacity": "capacity",
  "match.ledger.region": "region",
  "match.rail.progressAria": "lobby progress {progress} of 100",
  "match.rail.next": "next actions",
  "match.rail.none": "none — the lobby is settled",
  // the ranking page anchor (the ladder ledger)
  "ranking.eyebrow": "stealthhead · ranking",
  "ranking.title": "the competitive ladder",
  "ranking.lede":
    "The season ladder of the platform, sorted and positioned by the root ranking logic. The rows live in the site DB and reach this table over HTTPS — your machine stores nothing.",
  "ranking.card.squad": "squad {squad} · {region}",
  "ranking.card.scoreLabel": "season score",
  "ranking.preview": "season preview: a win over {player} lifts the leader by +{delta} pts",
  "ranking.table.rank": "#",
  "ranking.table.player": "player",
  "ranking.table.squad": "squad",
  "ranking.table.region": "region",
  "ranking.table.season": "season",
  "ranking.table.score": "score",
  "ranking.table.wins": "wins",
  "ranking.table.matches": "matches",
  "ranking.table.winrate": "win rate",
  "ranking.table.kd": "k/d",
  "ranking.row.leaderAria": "season leader",
  "ranking.row.winrate": "{rate}%",
  "ranking.rail.aria": "season facts",
  "ranking.rail.facts": "season facts",
  "ranking.rail.rows": "rows served",
  "ranking.rail.season": "season",
  "ranking.rail.regions": "regions",
  "ranking.rail.squads": "squads",
  "ranking.rail.leader": "leader",
  "ranking.rail.answers": "the ladder answers",
  "ranking.rail.note":
    "The rows live in the site DB and reach this table over HTTPS — your machine stores nothing. Positions are stamped by the root ranking logic, deltas ride the season k bands.",
  // the weapons page anchor (the armory ledger)
  "weapons.eyebrow": "stealthhead · weapons",
  "weapons.title": "the armory",
  "weapons.lede":
    "Every weapon of the platform with the damage and kind helpers of the root armory logic. The catalog lives in the site DB and answers over HTTPS — the interface is read-only by doctrine.",
  "weapons.kinds.aria": "weapon kinds",
  "weapons.kind.all": "all",
  "weapons.kind.allTip": "every kind of the armory",
  "weapons.kind.filterTip": "filter the armory by {kind}",
  "weapons.row.stable": "stable",
  "weapons.row.wild": "wild",
  "weapons.meter.dmg": "dmg",
  "weapons.meter.rate": "rate",
  "weapons.meter.recoil": "recoil",
  "weapons.meter.damageAria": "damage {value} of {peak}",
  "weapons.meter.rateAria": "fire rate {value} of {peak} rpm",
  "weapons.meter.recoilAria": "recoil {value} of {peak}",
  "weapons.meter.rateValue": "{value} rpm",
  "weapons.stats.dps": "dps",
  "weapons.stats.ttk": "ttk {meters}m",
  "weapons.stats.ttkValue": "{value}s",
  "weapons.stats.range": "range",
  "weapons.stats.rangeValue": "{value} m",
  "weapons.stats.magazine": "magazine",
  "weapons.stats.reload": "reload",
  "weapons.stats.reloadValue": "{value}s",
  // the world page anchor (the map plates)
  "world.eyebrow": "stealthhead · world",
  "world.title": "world assets",
  "world.lede":
    "The GLB catalog of the platform as DB rows: name, kind, path and the sha-256 the build verifies against the downloaded binary. Every asset ships pre-compiled on the family domains — the visitor VGPU/VCPU never compiles anything, and the interface renders rows, not scenes.",
  "world.kinds.aria": "asset kinds",
  "world.kind.all": "all",
  "world.kind.allTip": "every kind of the catalog",
  "world.kind.filterTip": "filter the catalog by {kind}",
  "world.plate.precompiled": "pre-compiled",
  "world.plate.hash": "sha-256 {digest}",
  "world.plate.verified": "hash shape verified — the binary is cataloged in the site DB and tracked by git lfs.",
  "world.plate.unverified": "the digest of this row is not a well formed sha-256.",
  // the notfound page anchor (the 404 panel)
  "notfound.badge": "404",
  "notfound.title": "Page Not Found",
  "notfound.line1": "This frame of the platform does not exist.",
  "notfound.line2": "It may have been moved or never deployed.",
  "notfound.action": "back to home",
  // the toast widget (the in-memory notification surface)
  "toast.dismiss.aria": "dismiss notification",
  "toast.dismiss.tip": "dismiss",
} as const;

export type LabelKey = keyof typeof LABELMANIFEST & string;

/** the translation overrides the runtime loads from the store at boot: the
 * key answers the translated text when the person changed the language. */
const overrides = new Map<string, string>();

/** the browser cache of the labels table: the rows mirror the site db (the
 * db is the source of truth; the cache carries the translated rows offline —
 * the onboardingstate.ts precedent for the visitor machine). */
const CACHE_KEY = "stealthhead.labels.rows";

function readcache(): LabelRow[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? (parsed.filter((row): row is LabelRow => !!row && typeof row === "object") as LabelRow[])
      : [];
  } catch {
    return [];
  }
}

function writecache(rows: readonly LabelRow[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(rows));
  } catch {
    // the cache is best effort: the manifest always answers
  }
}

/** the typed accessor of the copy: the only door a widget or page anchor uses. */
export function label(key: LabelKey): string {
  return overrides.get(key) ?? LABELMANIFEST[key];
}

/** the placeholder door: fills the {token} slots of one format key with the
 * runtime values (the store keeps the sentence, the widget passes the data). */
export function labelfill(key: LabelKey, values: Record<string, string>): string {
  return label(key).replace(/\{(\w+)\}/g, (match, token: string) => values[token] ?? match);
}

/** the seed ingests the manifest into the labels store, idempotent, and the
 * translated rows stay protected from the overwrite. in the browser the rows
 * ride the local cache of the site db; on the server db.ts seeds the same
 * manifest into the labels table through seedlabelrows. */
export async function seedlabels(): Promise<{ seeded: number; protected: number }> {
  const stored = readcache();
  const rows = new Map<string, LabelRow>(stored.map((row) => [row.id, row]));
  let seeded = 0;
  let saved = 0;
  for (const [id, text] of Object.entries(LABELMANIFEST)) {
    const row = rows.get(id);
    overrides.set(id, row && row.translated ? row.text : text);
    if (!row || (!row.translated && row.text !== text)) {
      rows.set(id, {
        id,
        text,
        revision: LABELREVISION,
        updatedAt: new Date().toISOString(),
        ...(row?.translated ? { translated: true } : {}),
      });
      seeded += 1;
    }
    saved += 1;
  }
  writecache([...rows.values()]);
  return { seeded, protected: saved - seeded };
}
