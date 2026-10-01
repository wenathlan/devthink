/**
 * db.ts — the self-hosted database bootstrap of stealhead (root layer).
 *
 * one sqlite database (better-sqlite3 driver) carries the tables of the
 * game domains: Match, MatchPlayer, RankingEntry, Weapon and WorldAsset.
 * the world table catalogs the GLB binaries that live in git lfs (the
 * virtual-repo doctrine: the row is the source of truth, the binary
 * downloads separately and is verified against the row sha-256). on
 * first run the idempotent schema is created and the small typed
 * in-memory seeds of the domain modules (match.ts, ranking.ts,
 * weapons.ts, world.ts) are persisted, so the site DB and the static
 * seed answer with the same rows. every statement here is a prepared
 * statement with bound parameters — sql is never assembled by string
 * concatenation. the database location comes from the DATABASE_URL
 * environment (default file:./stealhead.db, never hardcodado). the
 * static interface never imports this module: the pages receive the
 * rows over HTTPS from the self-hosted answer and fall back to the
 * in-memory seeds, and the visitor machine stores nothing.
 */
import Database from "better-sqlite3";
import process from "node:process";
import { MATCHPLAYERSEED, MATCHSEED, type MatchLobby, type MatchPlayer, type MatchRound } from "./match.ts";
import { RANKINGSEED, type RankingEntry } from "./ranking.ts";
import { WEAPONCATALOG, type Weapon } from "./weapons.ts";
import { WORLDCATALOG, type WorldAsset } from "./world.ts";

/**
 * resolves the database location from the environment.
 *
 * @returns the configured DATABASE_URL (default file:./stealhead.db).
 */
function resolvedatabaseurl(): string {
  return process.env.DATABASE_URL?.trim() || "file:./stealhead.db";
}

/** the sqlite connection (synchronous, wal by pragma below). */
const sqlite = new Database(resolvedatabaseurl().replace(/^file:/, ""));

sqlite.pragma("journal_mode = wal");

/** the schema ddl: static strings only, safe to run on every boot. */
sqlite.exec(`
  create table if not exists matches (
    id text primary key,
    title text not null,
    region text not null,
    state text not null,
    capacity integer not null,
    rounds text not null default '[]'
  );
  create table if not exists matchplayers (
    id text primary key,
    lobbyid text not null references matches(id),
    handle text not null,
    squad text not null,
    score integer not null,
    ping integer not null
  );
  create table if not exists rankingentries (
    id text primary key,
    player text not null,
    squad text not null,
    region text not null,
    season text not null,
    score integer not null,
    wins integer not null,
    matches integer not null,
    kd real not null
  );
  create table if not exists weapons (
    id text primary key,
    name text not null,
    kind text not null,
    damage integer not null,
    firerate integer not null,
    rangemeters integer not null,
    magazine integer not null,
    recoil integer not null,
    reloadseconds real not null,
    size bigint,
    hash text
  );
  create table if not exists worldassets (
    name text not null,
    kind text not null,
    path text primary key,
    sha256 text not null,
    size bigint not null,
    precompiled integer not null default 1
  );
`);

/** every write below is a prepared statement with bound parameters. */
const insertmatch = sqlite.prepare("insert or replace into matches (id, title, region, state, capacity, rounds) values (?, ?, ?, ?, ?, ?)");
const insertplayer = sqlite.prepare("insert or replace into matchplayers (id, lobbyid, handle, squad, score, ping) values (?, ?, ?, ?, ?, ?)");
const insertranking = sqlite.prepare("insert or replace into rankingentries (id, player, squad, region, season, score, wins, matches, kd) values (?, ?, ?, ?, ?, ?, ?, ?, ?)");
const insertweapon = sqlite.prepare("insert or replace into weapons (id, name, kind, damage, firerate, rangemeters, magazine, recoil, reloadseconds) values (?, ?, ?, ?, ?, ?, ?, ?, ?)");
const insertworldasset = sqlite.prepare("insert or replace into worldassets (name, kind, path, sha256, size, precompiled) values (?, ?, ?, ?, ?, ?)");

/** every read below is a prepared statement with bound parameters. */
const selectmatchbyid = sqlite.prepare("select id, title, region, state, capacity, rounds from matches where id = ?");
const selectplayersbylobby = sqlite.prepare("select id, lobbyid, handle, squad, score, ping from matchplayers where lobbyid = ? order by score desc");
const selectallplayers = sqlite.prepare("select id, lobbyid, handle, squad, score, ping from matchplayers order by lobbyid, score desc");
const selectranking = sqlite.prepare("select id, player, squad, region, season, score, wins, matches, kd from rankingentries order by score desc");
const selectweaponbykind = sqlite.prepare("select id, name, kind, damage, firerate, rangemeters, magazine, recoil, reloadseconds from weapons where kind = ? order by damage desc");
const selectallweapons = sqlite.prepare("select id, name, kind, damage, firerate, rangemeters, magazine, recoil, reloadseconds from weapons order by damage desc");
const selectworldassets = sqlite.prepare("select name, kind, path, sha256, size, precompiled from worldassets order by kind, name");

/** true once the seed pass has run for this boot. */
let seeded = false;

/**
 * persists the in-memory seeds of the game domains on first run. the
 * pass is idempotent: insert or replace keeps the database aligned with
 * the repository rows.
 */
function seedonfirstrun(): void {
  if (seeded) return;
  const persistall = sqlite.transaction(() => {
    for (const lobby of MATCHSEED) {
      insertmatch.run(lobby.id, lobby.title, lobby.region, lobby.state, lobby.capacity, JSON.stringify(lobby.rounds));
    }
    for (const player of MATCHPLAYERSEED) {
      insertplayer.run(player.id, player.lobbyid, player.handle, player.squad, player.score, player.ping);
    }
    for (const entry of RANKINGSEED) {
      insertranking.run(entry.id, entry.player, entry.squad, entry.region, entry.season, entry.score, entry.wins, entry.matches, entry.kd);
    }
    for (const weapon of WEAPONCATALOG) {
      insertweapon.run(weapon.id, weapon.name, weapon.kind, weapon.damage, weapon.firerate, weapon.rangemeters, weapon.magazine, weapon.recoil, weapon.reloadseconds);
    }
    for (const asset of WORLDCATALOG) {
      insertworldasset.run(asset.name, asset.kind, asset.path, asset.sha256, asset.size, asset.precompiled ? 1 : 0);
    }
  });
  persistall();
  seeded = true;
}

seedonfirstrun();

/**
 * reads one lobby with its rounds (bound parameters only).
 *
 * @param id the lobby id.
 * @returns the lobby row or null.
 */
export function getlobby(id: string): MatchLobby | null {
  const row = selectmatchbyid.get(id) as { id: string; title: string; region: string; state: MatchLobby["state"]; capacity: number; rounds: string } | undefined;
  if (!row) return null;
  const rounds = JSON.parse(row.rounds) as MatchRound[];
  return { id: row.id, title: row.title, region: row.region, state: row.state, capacity: row.capacity, rounds };
}

/**
 * reads the seats of one lobby ordered by score (bound parameters
 * only); without a lobby id, every seated player of every lobby.
 *
 * @param lobbyid the optional lobby id.
 * @returns the player rows.
 */
export function getlobbyplayers(lobbyid?: string): MatchPlayer[] {
  return (lobbyid ? (selectplayersbylobby.all(lobbyid) as MatchPlayer[]) : (selectallplayers.all() as MatchPlayer[]));
}

/**
 * reads the ladder ordered by score.
 *
 * @returns the ranking rows.
 */
export function getranking(): RankingEntry[] {
  return selectranking.all() as RankingEntry[];
}

/**
 * reads the armory filtered by kind (bound parameters only).
 *
 * @param kind the optional kind filter.
 * @returns the weapon rows.
 */
export function getweapons(kind?: Weapon["kind"]): Weapon[] {
  return kind ? (selectweaponbykind.all(kind) as Weapon[]) : (selectallweapons.all() as Weapon[]);
}

/**
 * reads the world catalog: the DB rows that catalog the GLB binaries
 * tracked by git lfs (the virtual-repo doctrine).
 *
 * @returns the world asset rows.
 */
export function getworldassets(): WorldAsset[] {
  return (selectworldassets.all() as Array<WorldAsset & { precompiled: number }>).map((row) => ({ ...row, precompiled: true }));
}

/** the raw driver, exported for the migration and backup tooling. */
export { sqlite };
