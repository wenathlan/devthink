// # engines — the ownership manifest of the family (root layer, the pr16 law).
//
// THE LAW (the no-duplication principle, pr16): every app is the EXCLUSIVE
// OWNER of its engine and the rest of the family CONSUMES it as a library.
// One engine, one owner — an engine implemented in more than one app is a
// duplication, and the non-owner app must import the owner's published
// library instead (never a sibling path: the library specifier, bridged to
// the monorepo source while the published envelope catches up, exactly the
// way @wenathlan/saddle/sandbox rides the chat sandbox lane).
//
// This manifest is the one registry the whole family answers: owner →
// engine → consumers. Every official app declares its engine here, no
// engine ever carries two owners, and every consumer row is an official
// app slug that is not the owner itself. The vitest gate
// (testes/devthink.engineowners.test.ts) walks this table and refuses the
// drift before any pipeline runs. Pure data, zero imports: the manifest
// never depends on the engines it describes.

/** the official app slugs of the monorepo — the deploy units of the family. */
export const OFFICIALAPPS: readonly string[] = [
  "argan",
  "cadria",
  "cobaia",
  "debonair",
  "devthink",
  "forge",
  "foundry",
  "getry",
  "saddle",
  "stealthhead",
  "vault",
];

/** one row of the ownership manifest: the owner app, its engine, and the
 * family apps that consume that engine as a library. */
export type engineownerrow = {
  /** the one app that owns the engine — the exclusive owner. */
  owner: string;
  /** the canonical engine name the family speaks. */
  engine: string;
  /** the engine module at the owner root (the source of truth). */
  module: string;
  /** the published library the consumers import (absent when the engine is
   * a deployable clone surface nobody imports). */
  library?: string;
  /** the apps that consume the engine as a library — never the owner. */
  consumers: readonly string[];
  /** what the engine owns, in one sentence. */
  role: string;
  /** explicit duplication debt: what still carries a copy, and the honest
   * migration path that retires it (absent when the row is debt-free). */
  debt?: string;
};

/** the ownership manifest: eleven owners, one engine each. */
export const ENGINEOWNERS: readonly engineownerrow[] = [
  {
    owner: "devthink",
    engine: "the os envelope",
    module: "engine.ts",
    library: "@wenathlan/devthink",
    consumers: [
      "argan",
      "cadria",
      "cobaia",
      "debonair",
      "forge",
      "foundry",
      "getry",
      "saddle",
      "stealthhead",
      "vault",
    ],
    role:
      "the supreme operating system, the monorepo envelope and the native page suite: the maestro (devthink.ts) commands the root engines — the universal gateway pipeline (engine.ts), the graph runner, the streaming parser, the queue family, the mcp registry — and every family app rides the envelope.",
  },
  {
    owner: "argan",
    engine: "argan",
    module: "argan.ts",
    library: "@wenathlan/argan",
    consumers: ["devthink"],
    role:
      "the network library and the dns gateway: zones, records, dnssec, transports and the hung model — the family imports it for names, zones and records on the os surfaces.",
  },
  {
    owner: "cadria",
    engine: "versawaze",
    module: "versawase.ts",
    library: "@wenathlan/versawaze",
    consumers: ["devthink", "stealthhead"],
    role:
      "the versawaze engine: the video, image, 3d mesh generator, shaders and visual ai studio — devthink renders its video surfaces through the catalog gateway over https, and stealthhead declares every 3d, animation and render concern through the published @wenathlan/cadria library.",
  },
  {
    owner: "cobaia",
    engine: "cobaia",
    module: "checkoutlinks.ts",
    library: "@wenathlan/cobaia",
    consumers: ["devthink"],
    role:
      "the public monetization surface: mrr plans, honest ad slots and the support links (github sponsors, ko-fi) — the os imports it for plans, quotas and billing surfaces.",
  },
  {
    owner: "debonair",
    engine: "kathesis",
    module: "katexis.ts",
    library: "@wenathlan/kathesis",
    consumers: ["devthink"],
    role:
      "the kathesis engine: the audio infrastructure, the music, the full daw and the sonic ai — devthink renders its audio surfaces through the catalog gateway over https; the engine itself is never bundled twice.",
  },
  {
    owner: "forge",
    engine: "forge",
    module: "fleet.ts",
    consumers: [],
    role:
      "the deployable execution clone: the pure binary runner surface in a sandbox with saddle — a leaf deploy unit the family never imports; it consumes the saddle engine and the vault storage as libraries.",
  },
  {
    owner: "foundry",
    engine: "foundry",
    module: "graphplan.ts",
    consumers: [],
    role:
      "the deployable pipeline clone: the full pipeline surface — sandbox plus the network database — a leaf deploy unit the family never imports; the engine logic lives in saddle, the storage in vault, and only the plan graph is its own.",
  },
  {
    owner: "getry",
    engine: "getry",
    module: "thinking.ts",
    library: "@wenathlan/getry",
    consumers: ["devthink"],
    role:
      "the universal ai gateway: five providers, thirty-five routes, the 7-level reasoning ladder — devthink imports the thinking ladder (thinking.ts) through the library specifier @wenathlan/getry/thinking and derives its default budget map from the owner's THINKINGLEVELS, never from a local copy.",
    debt:
      "getry/streamfallback.ts still reimplements the devthink retry.backoff discipline (doubling backoff, ±20% jitter, retry-after hint — the file header says 'reimplemented here, never imported across apps'). migration path: getry consumes the published @wenathlan/devthink queue export (the request queue family owns the retry backoff) and streamfallback keeps only the omniroute verdict vocabulary; the local backoff copy retires the day the gateway app rides the library like the os already rides getry.",
  },
  {
    owner: "saddle",
    engine: "saddle",
    module: "sandbox.ts",
    library: "@wenathlan/saddle",
    consumers: ["devthink", "forge", "foundry", "getry"],
    role:
      "the master virtualization engine and the vm runner: devthink imports the sandbox lane through the library specifier @wenathlan/saddle/sandbox (the chat sandbox pane), and forge, foundry and getry declare the published dependency — the virtualization logic is never duplicated outside the saddle root.",
  },
  {
    owner: "stealthhead",
    engine: "stealthhead",
    module: "world.ts",
    library: "@wenathlan/stealthhead",
    consumers: ["devthink"],
    role:
      "the fps game platform: match logics, ranking, weapons and the pre-compiled world — it owns the game domain and renders through the versawaze engine of cadria (the one rendering engine of the family); the os surfaces link the platform through the app registry.",
  },
  {
    owner: "vault",
    engine: "vault",
    module: "objectsledger.ts",
    library: "@wenathlan/vault",
    consumers: ["devthink", "forge", "foundry", "getry"],
    role:
      "the deployable storage clone: the network database and the edge storage — the content-addressed object ledger with sha-256 digests, window chunking and ref counting; the family declares the file:../vault dependency and never reimplements the safe.",
  },
];

/** maps every engine name to its one owner — a second owner for any engine
 * name is the duplication the law refuses. */
export function ownersbyengine(): ReadonlyMap<string, string> {
  return new Map(ENGINEOWNERS.map((row) => [row.engine, row.owner]));
}

/** the engine row one app owns — every official app answers exactly one. */
export function engineof(owner: string): engineownerrow | undefined {
  return ENGINEOWNERS.find((row) => row.owner === owner);
}

/** the flattened consumer pairs (engine, consumer) of the manifest — every
 * consumer is an official app slug and never the owner itself. */
export function consumerpairs(): readonly { engine: string; owner: string; consumer: string }[] {
  const pairs: { engine: string; owner: string; consumer: string }[] = [];
  for (const row of ENGINEOWNERS) {
    for (const consumer of row.consumers) {
      pairs.push({ engine: row.engine, owner: row.owner, consumer });
    }
  }
  return pairs;
}
