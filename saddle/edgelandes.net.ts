// # edgelandes.net.ts — the network resolution lanes of the ninety-two
// modalities wave (group d, the saddle ownership audit): the two
// lane-less network modalities the registry declared live (network-dns
// and network-doh) wired as honest resolution executors. The lanes
// answer real server-side resolution only: the dns lane rides the
// node:dns resolver (resolve4/resolve6 through the resolver the node
// runtime carries, under the caller's deadline) and the doh lane rides
// one real dns-over-https query (the rfc 8484 json shape the public
// resolvers answer, fetched through the engine's own fetch under the
// deadline). The laws every lane keeps:
// - the visitor law: everything resolves server-side in the engine
//   process, the visitor browser, gpu, cpu and storage are never touched;
// - the honest payload law: the code field is the json resolution
//   manifest ({"host":"example.com","type":"A"}), a non-json or non-shape
//   manifest answers INVALID_LANE_PAYLOAD naming the field, and a
//   hostname that is not a hostname refuses before any wire rides;
// - the honest wire law: a resolver that refuses answers the coded
//   RESOLUTION_FAILED carrying the resolver's own message, a blown
//   deadline answers RUN_DEADLINE_EXCEEDED — a lane never invents an
//   address the resolver did not answer;
// - the artifact law: every lane answers one artifact under the mime its
//   registry record declares, carrying the resolution record the lane
//   honestly observed (answers, ttl class, resolver surface).

import { Resolver } from "node:dns/promises";
import { type EdgeLaneExecutor, type EdgeLaneOutput, edgelaneerror } from "./edgelandes.ts";

/* ════════════════════════════════════════════════════════════════════ */
/* Section 1: the lane contract — the net lane spec surface.           */
/* ════════════════════════════════════════════════════════════════════ */

/** one net lane declaration: the modality id the registry and the
 * dispatcher read, the kind (every lane here resolves live), the runtime
 * surface it rides and the honest presence probe of that surface. */
export interface NetLaneSpec {
  /** the modality id of the registry record the lane wires. */
  modality: string;
  /** live lanes resolve in-process; host lanes probe (none live here). */
  kind: "live" | "host";
  /** the runtime surface the lane rides ("node:dns", "doh-json"). */
  runtime: string;
  /** the honest presence probe of the resolution surface. */
  present: () => boolean;
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 2: the shared manifest law — parse, validate, budget.       */
/* ════════════════════════════════════════════════════════════════════ */

/** the artifact mime of the network family (the registry record declares it). */
const netmime = "application/vnd.devthink.net+json";

/** the shared utf8 encoder of the lane surfaces. */
const utf8 = new TextEncoder();

/** the safe message of an unknown thrown value (no stack rides a lane answer). */
function errormessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error ?? "unknown lane failure");
}

/** the hostname grammar the lanes accept: the rfc 1123 dns label law
 * (letters, digits and hyphens, no leading or trailing hyphen, at least
 * one label, every label at most 63 chars, the whole name at most 253)
 * and a single trailing dot the dns grammar permits. */
const HOSTNAMEREF = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}\.?$/i;

/** one parsed resolution manifest: the hostname to resolve and the
 * record type the lane answers (A or AAAA — the address families the
 * two lanes honestly carry). */
interface resolutionmanifest {
  host: string;
  type: "A" | "AAAA";
}

/** parses the code field as the resolution manifest: a json object
 * carrying the host and the optional type (default A); anything else
 * answers INVALID_LANE_PAYLOAD naming the law. */
function parsemanifest(lane: string, code: string): resolutionmanifest {
  let parsed: unknown;
  try {
    parsed = JSON.parse(code);
  } catch (error) {
    throw edgelaneerror(
      "INVALID_LANE_PAYLOAD",
      `the lane ${lane} requires a json resolution manifest in the code field: ${errormessage(error)}`,
    );
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw edgelaneerror(
      "INVALID_LANE_PAYLOAD",
      `the lane ${lane} requires a json resolution manifest in the code field`,
    );
  }
  const raw = parsed as Record<string, unknown>;
  const host = typeof raw.host === "string" ? raw.host.trim().replace(/\.$/, "") : "";
  if (host.length === 0 || !HOSTNAMEREF.test(host)) {
    throw edgelaneerror(
      "INVALID_LANE_PAYLOAD",
      `the lane ${lane} requires a valid dns hostname in the manifest field host (rfc 1123 labels), received "${host}"`,
    );
  }
  const type = raw.type === "AAAA" ? "AAAA" : raw.type === undefined || raw.type === "A" ? "A" : "";
  if (type === "") {
    throw edgelaneerror(
      "INVALID_LANE_PAYLOAD",
      `the lane ${lane} carries the manifest field type A or AAAA only, received "${String(raw.type)}"`,
    );
  }
  return { host, type };
}

/** races one promise against the lane deadline: a slow resolver answers
 * RUN_DEADLINE_EXCEEDED honestly while the underlying query settles in
 * the background. */
async function racedeadline<T>(work: Promise<T>, deadline: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      work,
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(edgelaneerror("RUN_DEADLINE_EXCEEDED", `the lane exceeded its ${deadline} ms deadline`)),
          deadline,
        );
      }),
    ]);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}

/** answers one lane output whose stdout is the json resolution record
 * and whose artifact is the same record under the net mime. */
function resolutionreport(record: Record<string, unknown>): EdgeLaneOutput {
  const text = JSON.stringify(record);
  return { stdout: text, artifact: { mime: netmime, bytes: utf8.encode(text) } };
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 3: the lane executors — the dns resolver and the doh query. */
/* ════════════════════════════════════════════════════════════════════ */

/** network-dns: the dns resolver lane. The code field is the resolution
 * manifest {"host":"example.com","type":"A"}: the lane asks the node
 * resolver for the address records of the host (resolve4 for A,
 * resolve6 for AAAA) under the caller's deadline and answers the
 * addresses the resolver really returned — the lane never invents an
 * address, never caches one, and a resolver refusal answers
 * RESOLUTION_FAILED carrying the resolver's own message. */
async function networkdnslane(code: string, _inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  const manifest = parsemanifest("network-dns", code);
  const resolver = new Resolver();
  const type = manifest.type === "AAAA" ? "AAAA" : "A";
  let addresses: string[];
  try {
    addresses = await racedeadline(
      manifest.type === "AAAA" ? resolver.resolve6(manifest.host) : resolver.resolve4(manifest.host),
      deadline,
    );
  } catch (error) {
    const laneerror = error as { code?: string };
    if (laneerror?.code === "RUN_DEADLINE_EXCEEDED") throw error;
    throw edgelaneerror(
      "RESOLUTION_FAILED",
      `the dns resolver refused the ${type} query for ${manifest.host}: ${errormessage(error)}`,
    );
  }
  return resolutionreport({
    lane: "network-dns",
    surface: "node:dns",
    host: manifest.host,
    type,
    addresses,
    answercount: addresses.length,
  });
}

/** the default dns-over-https endpoint the doh lane queries: the google
 * public resolver json api (the rfc 8484 json shape every public doh
 * resolver answers), overridable through inputs.endpoint. */
const DEFAULTDOHENDPOINT = "https://dns.google/resolve";

/** the typed slice of one doh json answer. */
interface DohAnswer {
  name?: unknown;
  type?: unknown;
  TTL?: unknown;
  data?: unknown;
}

/** network-doh: the dns-over-https lane. The code field is the same
 * resolution manifest; the lane asks one real doh endpoint (the rfc
 * 8484 json shape, the google resolver by default and any https
 * endpoint the caller pins through inputs.endpoint) through the
 * engine's own fetch under the deadline, and answers the address
 * records the endpoint really returned (the answer data with the ttl
 * class), never a pinned or invented address. An endpoint that answers
 * no 200 answers RESOLUTION_FAILED carrying the status. */
async function networkdohlane(code: string, inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  const manifest = parsemanifest("network-doh", code);
  const endpointinput =
    typeof inputs === "object" && inputs !== null ? (inputs as Record<string, unknown>).endpoint : undefined;
  const endpoint = typeof endpointinput === "string" && /^https:\/\//.test(endpointinput) ? endpointinput : DEFAULTDOHENDPOINT;
  const url = `${endpoint}?name=${encodeURIComponent(manifest.host)}&type=${manifest.type}`;
  let answers: DohAnswer[];
  try {
    answers = await racedeadline(
      (async () => {
        const response = await fetch(url, {
          headers: { accept: "application/dns-json" },
          signal: AbortSignal.timeout(deadline),
        });
        if (!response.ok) {
          throw edgelaneerror(
            "RESOLUTION_FAILED",
            `the doh endpoint ${endpoint} answered status ${response.status} for the ${manifest.type} query of ${manifest.host}`,
          );
        }
        const document = (await response.json()) as { Answer?: unknown };
        if (!Array.isArray(document?.Answer)) {
          throw edgelaneerror(
            "RESOLUTION_FAILED",
            `the doh endpoint ${endpoint} answered no Answer array for the ${manifest.type} query of ${manifest.host}`,
          );
        }
        return document.Answer as DohAnswer[];
      })(),
      deadline,
    );
  } catch (error) {
    const laneerror = error as { code?: string };
    if (laneerror?.code === "RUN_DEADLINE_EXCEEDED" || laneerror?.code === "RESOLUTION_FAILED") throw error;
    throw edgelaneerror(
      "RESOLUTION_FAILED",
      `the doh endpoint ${endpoint} refused the ${manifest.type} query for ${manifest.host}: ${errormessage(error)}`,
    );
  }
  const addresses = answers
    .filter((answer) => answer.data !== undefined)
    .map((answer) => String(answer.data));
  return resolutionreport({
    lane: "network-doh",
    surface: "doh-json",
    endpoint,
    host: manifest.host,
    type: manifest.type,
    addresses,
    answercount: addresses.length,
    ttl: typeof answers[0]?.TTL === "number" ? (answers[0].TTL as number) : null,
  });
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 4: the lane tables — the specs, the executors and the ids.  */
/* ════════════════════════════════════════════════════════════════════ */

/** the net lane specs: one row per wired modality, the source of truth
 * of the lane order — every lane resolves live, the dns lane rides the
 * node resolver and the doh lane rides the engine's own fetch. */
export const netlanespecs: readonly NetLaneSpec[] = Object.freeze([
  {
    modality: "network-dns",
    kind: "live",
    runtime: "node:dns",
    present: () => true,
  },
  {
    modality: "network-doh",
    kind: "live",
    runtime: "doh-json",
    present: () => typeof fetch === "function",
  },
]);

/** the net lane executor table: every lane of the group d contract,
 * keyed by modality id — the dispatcher refuses to boot over a lane it
 * cannot wire. */
export const edgelaneexecutorsnet: Readonly<Record<string, EdgeLaneExecutor>> = Object.freeze({
  "network-dns": networkdnslane,
  "network-doh": networkdohlane,
});

/** the net lane ids in spec order — the pinned contract the dispatcher
 * merge and the api surface read exactly. */
export const netlaneids: readonly string[] = Object.freeze(netlanespecs.map((spec) => spec.modality));

/* the wiring self-check: the net lane table refuses to load over a gap
 * between the specs and the executors (a spec without an executor is a
 * miswired lane, and miswiring must fail loud at boot, never silently
 * at run time). */
for (const lane of netlanespecs) {
  if (edgelaneexecutorsnet[lane.modality] === undefined) {
    throw new Error(`the net lane plane is miswired: no executor for the lane ${lane.modality}`);
  }
}
for (const id of Object.keys(edgelaneexecutorsnet)) {
  if (!netlaneids.includes(id)) {
    throw new Error(`the net lane plane is miswired: the executor ${id} carries no spec`);
  }
}
