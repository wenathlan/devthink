// # protocols — the protocol catalog of the vault storage engine (the https
// protocols pillar of the wave D rewire): every wire the domain speaks, one
// static-safe route per row — GET /api/v1/protocols/<scheme> answers the
// row's spec, read-only, no storage truth, no query execution. The corpus
// lives beside this module in protocols.types (the wave D growth): 1322 rows
// — the 231 curated rows of the family mesh (the governing specs and the
// security postures: encrypted, opportunistic or cleartext) plus the 1091
// service rows of the live IANA service name and transport protocol port
// number registry (the system port range 0-1023, the tcp preference over
// udp, descriptions and references verbatim). Real wires only, no filler:
// every row answers a registration a real registry carries.
//
// The route lane the pillar announces: one static-safe route per catalog row
// (1322 on the wave D corpus — above the thousand the pillar demands), plus
// the list route and the base api surface. The tls-capable count the family
// law pins above one hundred answers from the curated mesh postures.
//
// The node-only doctrine rides the import the storagelane law pins: the
// corpus reads from the filesystem through node:fs, so the browser graph
// never reaches this module.
//
// @section corpus — the registry corpus and its parse
// @section catalog — the rows and the counts the pillar announces
// @section lookups — the scheme index and the route lane

import { readFileSync } from "node:fs";
import path from "node:path";

/** @section corpus */

/** The corpus file the catalog parses (protocols.types beside this module). */
const CORPUS_FILE = "protocols.types";

/** The typed refusal a missing or malformed corpus answers — loud, never a
 * silent fallback to invented wires (the pillar serves every registry row or
 * refuses honestly). */
export class ProtocolCorpusError extends Error {}

/**
 * Reads the registry corpus: the protocols.types file beside this module.
 *
 * @returns the raw corpus text.
 * @throws ProtocolCorpusError when the corpus file never landed beside the module.
 */
function readCorpus(): string {
  const here = import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname);
  try {
    return readFileSync(path.resolve(here, CORPUS_FILE), "utf8");
  } catch (error) {
    throw new ProtocolCorpusError(
      `the protocol corpus never landed beside the module (${CORPUS_FILE}): ${
        error instanceof Error ? error.message : "the read refused"
      }`,
    );
  }
}

/** The security posture of a curated wire (encrypted covers TLS and
 * protocol-native crypto; opportunistic covers STARTTLS and TLS-on-demand). */
export type ProtocolSecurity = "encrypted" | "opportunistic" | "cleartext";

/** One row of the protocol catalog: the wire, its port, its governing spec,
 * its family, and (on the curated mesh) its security posture and state. */
export interface ProtocolRow {
  /** the scheme the row registers, lowercase ("https", "wss", "echo") */
  scheme: string;
  /** the display name of the protocol */
  name: string;
  /** the port label of the wire ("443", "7/tcp", "—" when it negotiates) */
  port: string;
  /** the governing spec or reference of the protocol */
  spec: string;
  /** the hierarchical family the protocol belongs to */
  group: string;
  /** the security posture of the wire (the curated mesh rows only — the
   * registry service rows pin no posture and answer undefined) */
  security?: ProtocolSecurity;
  /** the state of the listener ("live", "preferred", "planned", "opt-in",
   * "legacy" — the curated mesh rows only) */
  state?: string;
}

/**
 * Parses the corpus into the catalog rows: group heads run as "# group"
 * comments, every row rides one line of scheme|name|port|spec fields (the
 * curated mesh rows carry security and state as the fifth and sixth fields).
 *
 * @param corpus the raw corpus text.
 * @returns the catalog rows in corpus order (grouped, alphabetical inside every group).
 * @throws ProtocolCorpusError when a row carries fewer than four fields.
 */
export function parseProtocolCorpus(corpus: string): ProtocolRow[] {
  const rows: ProtocolRow[] = [];
  let group = "";
  for (const rawLine of corpus.split("\n")) {
    const line = rawLine.trim();
    if (line.length === 0) continue;
    if (line.startsWith("#")) {
      group = line.slice(1).trim().toLowerCase();
      continue;
    }
    const fields = line.split("|").map((field) => field.trim());
    if (fields.length < 4 || group.length === 0) {
      throw new ProtocolCorpusError(`the corpus line "${rawLine}" carries no protocol row`);
    }
    const row: ProtocolRow = {
      scheme: fields[0].toLowerCase(),
      name: fields[1],
      port: fields[2],
      spec: fields[3],
      group,
    };
    if (fields.length >= 5) {
      const security = fields[4].toLowerCase();
      if (security === "encrypted" || security === "opportunistic" || security === "cleartext") {
        row.security = security;
      }
      if (fields.length >= 6 && fields[5].length > 0) {
        row.state = fields[5];
      }
    }
    rows.push(row);
  }
  return rows;
}

/** @section catalog */

/** The catalog itself: every registry row in corpus order (grouped, alphabetical inside every group). */
export const PROTOCOLS: readonly ProtocolRow[] = parseProtocolCorpus(readCorpus());

/** The row count of the catalog (the registry wires the pillar serves). */
export const PROTOCOL_COUNT = PROTOCOLS.length;

/** The route prefix every protocol row answers under (the static-safe lane). */
export const PROTOCOL_ROUTE_PREFIX = "/api/v1/protocols";

/** The static-safe route of one protocol row. */
export function protocolRoute(scheme: string): string {
  return `${PROTOCOL_ROUTE_PREFIX}/${scheme}`;
}

/** The protocol route count the pillar serves: one static-safe route per
 * catalog row (above one thousand on the wave D corpus) plus the list route. */
export const PROTOCOL_ROUTE_COUNT = PROTOCOL_COUNT + 1;

/** The groups the catalog carries, in corpus order. */
export const PROTOCOL_GROUPS: readonly string[] = [...new Set(PROTOCOLS.map((row) => row.group))];

/** @section lookups */

/** The scheme index: every scheme (lowercase) to its row. */
const SCHEME_INDEX: ReadonlyMap<string, ProtocolRow> = new Map(
  PROTOCOLS.map((row) => [row.scheme, row]),
);

/**
 * The catalog row of one scheme.
 *
 * @param scheme the wire scheme ("https").
 * @returns the row, or undefined when the catalog holds no such scheme.
 */
export function findProtocol(scheme: string): ProtocolRow | undefined {
  return SCHEME_INDEX.get(scheme.trim().toLowerCase());
}

/**
 * The rows of one family group, catalog order.
 *
 * @param group the family keyword ("web", "service").
 * @returns the rows of the group.
 */
export function protocolsByGroup(group: string): ProtocolRow[] {
  return PROTOCOLS.filter((row) => row.group === group);
}

/**
 * The tls-capable wires of the catalog — the encrypted and the opportunistic
 * postures (the family law pins this count above one hundred; the registry
 * service rows pin no posture and never ride this lane).
 *
 * @returns the rows whose security posture upgrades to TLS.
 */
export function tlsCapableProtocols(): ProtocolRow[] {
  return PROTOCOLS.filter((row) => row.security === "encrypted" || row.security === "opportunistic");
}

/**
 * The static-safe route lane: resolves one pathname to the protocol row it
 * serves — the one read-only handler behind every route of the pillar (no
 * storage truth, no query execution, no mutation: the catalog row answers or
 * the lane refuses).
 *
 * @param pathname the request path ("/api/v1/protocols/https").
 * @returns the row the route serves, or undefined when the path rides no
 *   protocol route (the caller answers its own refusal).
 */
export function protocolRouteOf(pathname: string): ProtocolRow | undefined {
  if (!pathname.startsWith(`${PROTOCOL_ROUTE_PREFIX}/`)) return undefined;
  const scheme = pathname.slice(PROTOCOL_ROUTE_PREFIX.length + 1).toLowerCase();
  if (scheme.length === 0 || scheme.includes("/")) return undefined;
  return findProtocol(scheme);
}
