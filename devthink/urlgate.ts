/**
 * urlgate.ts — the one door for the server url requests (root layer).
 *
 * Every outbound http request the server side makes rides this gate and
 * only this gate. The law the gate enforces: http and https only; EVERY
 * hostname resolves through node:dns/promises lookup with all:true, and
 * every resolved address must answer PUBLIC — loopback, private, link-
 * local, unique-local, v4-mapped, v4-compatible, this-network, cgnat,
 * benchmark, documentation, nat64, discard-only, multicast, broadcast and
 * reserved addresses refuse BY ADDRESS. The classification reads the
 * resolved octets and groups the lookup answered, never the hostname
 * text — a name is never trusted, no textual allowlist or denylist runs,
 * and no hostname literal exists in this module at all. A host that does
 * not resolve refuses; embedded credentials refuse. gatedrequest carries
 * the request with bounded, re-validated redirects (every hop resolves
 * and classifies again, a cross-origin hop starts clean), a byte cap on
 * the answer and a wall clock cap on the whole trip. GateError is the
 * refusal shape the callers map to honest answers.
 *
 * @section addresses — the resolved-address classification (public or refuse)
 * @section door — the url gate and the bounded request surface
 */

import { lookup } from "node:dns/promises";

/**
 * @section addresses — the resolved-address classification (public or
 * refuse). Every check below reads the ADDRESS the resolver answered:
 * octets for ipv4, expanded groups for ipv6.
 */

/** MAXANSWERBYTES — the answer byte cap the gate enforces on every read. */
export const MAXANSWERBYTES = 2_000_000;

/** GATETIMEOUTMS — the wall clock cap of one gated trip. */
export const GATETIMEOUTMS = 15_000;

/** MAXREDIRECTS — the redirect hops one gated trip may walk. */
export const MAXREDIRECTS = 5;

/** GateError — the gate's own refusal: the message stays honest and short. */
export class GateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GateError";
  }
}

/** IPV4PATTERN — the dotted quad shape the octet classification reads. */
const IPV4PATTERN = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;

/** IPV4TAILPATTERN — an embedded dotted quad of a v4-mapped or compatible v6. */
const IPV4TAILPATTERN = /^(.*:)(\d{1,3}(?:\.\d{1,3}){3})$/;

/** GROUPPATTERN — one hexadecimal ipv6 group. */
const GROUPPATTERN = /^[0-9a-f]{1,4}$/;

/** ipv4public — the verdict for four resolved octets: false is a refusal. */
function ipv4public(octets: number[]): boolean {
  const first = octets[0];
  const second = octets[1];
  const third = octets[2];
  if (first === 0) return false; // this-network
  if (first === 10) return false; // private
  if (first === 127) return false; // loopback
  if (first === 169 && second === 254) return false; // link-local
  if (first === 172 && second >= 16 && second <= 31) return false; // private
  if (first === 192 && second === 168) return false; // private
  if (first === 100 && second >= 64 && second <= 127) return false; // cgnat shared space
  if (first === 192 && second === 0 && (third === 0 || third === 2)) return false; // protocol assignments, documentation
  if (first === 198 && (second === 18 || second === 19)) return false; // benchmark
  if (first === 198 && second === 51 && third === 100) return false; // documentation
  if (first === 203 && second === 0 && third === 113) return false; // documentation
  if (first >= 224) return false; // multicast, reserved, broadcast
  return true;
}

/** ipv6public — the verdict for eight resolved groups: false is a refusal. */
function ipv6public(groups: number[]): boolean {
  const g0 = groups[0];
  const g1 = groups[1];
  const g2 = groups[2];
  const g3 = groups[3];
  const g4 = groups[4];
  const g5 = groups[5];
  const g6 = groups[6];
  if (g0 === 0 && g1 === 0 && g2 === 0 && g3 === 0 && g4 === 0 && g5 === 0 && g6 === 0) return false; // unspecified, loopback, v4-compatible
  if (g0 === 0 && g1 === 0 && g2 === 0 && g3 === 0 && g4 === 0 && g5 === 0xffff) return false; // v4-mapped
  if ((g0 & 0xfe00) === 0xfc00) return false; // unique-local fc00::/7
  if ((g0 & 0xffc0) === 0xfe80) return false; // link-local fe80::/10
  if ((g0 & 0xff00) === 0xff00) return false; // multicast ff00::/8
  if (g0 === 0x2001 && g1 === 0x0db8) return false; // documentation 2001:db8::/32
  if (g0 === 0x2001 && g1 === 0x0000) return false; // reserved 2001:0000::/32
  if (g0 === 0x0064 && g1 === 0xff9b) return false; // nat64 64:ff9b::/96
  if (g0 === 0x0100 && g1 === 0 && g2 === 0 && g3 === 0) return false; // discard-only 100::/64
  return true;
}

/** ipv6groups — expand one ipv6 address into its eight numeric groups. */
function ipv6groups(address: string): number[] | null {
  let text = address.toLowerCase();
  if (text.includes(".")) {
    const tail = text.match(IPV4TAILPATTERN);
    if (!tail) return null;
    const octets = tail[2].split(".").map(Number);
    if (
      octets.length !== 4 ||
      octets.some((value) => !Number.isInteger(value) || value < 0 || value > 255)
    ) {
      return null;
    }
    const high = ((octets[0] << 8) | octets[1]).toString(16);
    const low = ((octets[2] << 8) | octets[3]).toString(16);
    text = [tail[1], high, low].join("");
  }
  const halves = text.split("::");
  if (halves.length > 2) return null;
  let groups: string[];
  if (halves.length === 2) {
    const left = halves[0] ? halves[0].split(":") : [];
    const right = halves[1] ? halves[1].split(":") : [];
    const fill = 8 - left.length - right.length;
    if (fill < 0) return null;
    const filler: string[] = [];
    for (let index = 0; index < fill; index += 1) filler.push("0");
    groups = [...left, ...filler, ...right];
  } else {
    groups = text.split(":");
  }
  if (groups.length !== 8) return null;
  const numbers: number[] = [];
  for (const group of groups) {
    if (!GROUPPATTERN.test(group)) return null;
    numbers.push(parseInt(group, 16));
  }
  return numbers;
}

/**
 * ispublicaddress — the one verdict the gate asks of every resolved
 * address: the family picks the classifier, anything else refuses.
 *
 * @param address the resolved address the lookup answered.
 * @param family the address family (4 or 6).
 * @returns true only when the address is public unicast space.
 */
export function ispublicaddress(address: string, family: number): boolean {
  if (family === 4) {
    const match = address.match(IPV4PATTERN);
    if (!match) return false;
    const octets = [match[1], match[2], match[3], match[4]].map(Number);
    if (octets.some((value) => !Number.isInteger(value) || value < 0 || value > 255)) return false;
    return ipv4public(octets);
  }
  if (family === 6) {
    const groups = ipv6groups(address);
    if (!groups) return false;
    return ipv6public(groups);
  }
  return false;
}

/**
 * resolvepublichost — resolve one hostname through dns lookup all:true and
 * refuse unless EVERY resolved address is public. A non-resolving host
 * refuses; a host answering one non-public address refuses — the verdict
 * rides the resolved addresses alone, never the hostname text.
 */
async function resolvepublichost(hostname: string): Promise<void> {
  let answers: Array<{ address: string; family: number }>;
  try {
    answers = await lookup(hostname, { all: true, verbatim: true });
  } catch {
    throw new GateError("the host did not resolve");
  }
  if (!Array.isArray(answers) || answers.length === 0) throw new GateError("the host did not resolve");
  for (const answer of answers) {
    if (!ispublicaddress(answer.address, answer.family)) {
      throw new GateError("the host resolved to a non-public address");
    }
  }
}

/**
 * @section door — the url gate and the bounded request surface.
 */

/**
 * gateurl — the shape guard of one url: absolute http or https, no
 * embedded credentials, a host present. Anything else is a GateError.
 *
 * @param value the url to gate.
 * @returns the parsed url, safe to resolve and fetch.
 */
export function gateurl(value: string | URL): URL {
  let url: URL;
  try {
    url = value instanceof URL ? new URL(value.toString()) : new URL(value);
  } catch {
    throw new GateError("the url did not parse");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new GateError("only http and https ride the gate");
  }
  if (url.username || url.password) throw new GateError("the url carries embedded credentials");
  if (!url.hostname) throw new GateError("the url carries no host");
  return url;
}

/** gatedrequestoptions — the knobs one gated trip accepts. */
export type gatedrequestoptions = {
  /** the http method (default GET). */
  method?: string;
  /** form fields encoded as the urlencoded body of a POST/PUT/PATCH. */
  form?: Record<string, string>;
  /** extra request headers. */
  headers?: Record<string, string>;
  /** the answer byte cap (default MAXANSWERBYTES). */
  maxbytes?: number;
  /** the whole-trip wall clock cap in ms (default GATETIMEOUTMS). */
  timeoutms?: number;
};

/** gatedanswer — the capped answer one gated trip returns. */
export type gatedanswer = { status: number; headers: Headers; body: string };

/** REDIRECTSTATUSES — the statuses the gate walks, re-validating every hop. */
const REDIRECTSTATUSES = [301, 302, 303, 307, 308];

/** BODYMETHODS — the methods that carry the form body. */
const BODYMETHODS = ["POST", "PUT", "PATCH"];

/** boundedanswer — read the response body under the byte cap. */
async function boundedanswer(response: Response, maxbytes: number): Promise<string> {
  const declared = Number(response.headers.get("content-length") || "0");
  if (Number.isFinite(declared) && declared > maxbytes) throw new GateError("the answer rode past the byte cap");
  const reader = response.body?.getReader();
  if (!reader) return "";
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxbytes) {
      try {
        await reader.cancel();
      } catch {
        /* the read is over either way */
      }
      throw new GateError("the answer rode past the byte cap");
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks.map((chunk) => Buffer.from(chunk))).toString("utf8");
}

/**
 * gatedrequest — the one door: resolve the host public, fetch with
 * redirects held manual, re-validate every hop (a cross-origin hop starts
 * clean), bound the answer bytes and the trip wall clock. The refusal is
 * always a GateError, never a silent pass.
 *
 * @param target the url to request.
 * @param options the method, form, headers and caps of the trip.
 * @returns the status, headers and capped body text of the final answer.
 */
export async function gatedrequest(target: string | URL, options: gatedrequestoptions = {}): Promise<gatedanswer> {
  let current = gateurl(target);
  let method = (options.method || "GET").toUpperCase();
  let form = options.form;
  let callerheaders = options.headers;
  const maxbytes = options.maxbytes ?? MAXANSWERBYTES;
  const timeoutms = options.timeoutms ?? GATETIMEOUTMS;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutms);
  try {
    for (let hop = 0; ; hop += 1) {
      if (hop > MAXREDIRECTS) throw new GateError("the redirect chain ran past the bound");
      await resolvepublichost(current.hostname);
      const headers = new Headers(callerheaders || {});
      let body: string | undefined;
      if (form && BODYMETHODS.includes(method)) {
        body = new URLSearchParams(form).toString();
        headers.set("content-type", "application/x-www-form-urlencoded");
      }
      let response: Response;
      try {
        response = await fetch(current.toString(), {
          method,
          headers,
          body,
          redirect: "manual",
          signal: ctrl.signal,
        });
      } catch {
        if (ctrl.signal.aborted) throw new GateError("the gated trip ran past the time cap");
        throw new GateError("the gated request did not answer");
      }
      if (REDIRECTSTATUSES.includes(response.status)) {
        const location = response.headers.get("location");
        if (!location) throw new GateError("the redirect carried no location");
        const next = gateurl(new URL(location, current).toString());
        if (next.origin !== current.origin) {
          // a cross origin hop starts clean: no caller headers ride along
          callerheaders = undefined;
        }
        if (response.status === 303 || ((response.status === 301 || response.status === 302) && method !== "GET")) {
          method = "GET";
          form = undefined;
        }
        current = next;
        continue;
      }
      const bodytext = await boundedanswer(response, maxbytes);
      return { status: response.status, headers: response.headers, body: bodytext };
    }
  } finally {
    clearTimeout(timer);
  }
}
