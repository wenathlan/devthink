/**
 * The bridge module of the 1.1.90 consolidation: every correlated variation of the bridge logic interned in this one file, so the module family carries one surface without duplicate variations.
 * The correlation is the bridge chain from the wire contract outward to the native host: servercontract holds the wire contract the static site and the extension speak (the versioned envelope with its stable operation ids, the capability negotiation, the session and event operation bodies with their schema validation and the payload minimization that keeps page content on the device without the explicit consent flag); socketrelay holds the site relay client (the wss connection through an injected socket seam, the frame authentication, the reconnect backoff with token rotation, the multiplexed streams, the offline queue with operation id deduplication, the heartbeat frames and the idle expiry); chatbridge holds the chat surface of the site (the chat rows, the plan review cards, the review decisions and the pairing panel, render and collect only, never execute); wsbridge holds the localhost native relay (the loopback bind check, the per session token with its hash only records, the one extension connection rule and the envelope translation that reuses the servercontract shapes); and nativehost holds the native host itself (the manifest installer and uninstaller, the runtime port lifecycle with its attach, crash and reattach states, the companion handshake with its one major version window, the surface catalog behind consent, the correlation ids, the heartbeats, the origin and session checks, the secret exclusion and the graceful degradation).
 * No relay url, host, vendor endpoint, port, window or cap is ever hardcoded anywhere in the family: the relay url stays the user's setting, the wsbridge binds localhost only, the raw session token never enters a log or audit entry, and no bridge path ever bypasses the human review.
 */

/* ── Merged from servercontract.ts ── */

import type { agentplan, bridgereviewcard, bridgereviewdecision, servercontractcapabilities, serverenvelope, servereventtype, serveroperation } from "./types.js";
import { servercontractversion } from "./types.js";

/** Re-exports the servercontract version of the types module so the contract surface reads from one module. */
export { servercontractversion };

/**
 * Servercontract of the 1.1.82 site integration family.
 * Every wire rule the static devthink.pro site and the extension speak lives in this one pure module: the message envelope with the negotiated version, one wire operation and the stable operation id every reply quotes for correlation; the capability negotiation that intersects the operations and event types of both handshake sides; the sessioncreate, sessionjoin, eventpost and eventstream operation bodies with their schema validation that rejects every malformed envelope; the chat, plan proposal, plan review and progress event payloads; and the data minimization that keeps every payload to plan text and statuses so page content never crosses the bridge without the explicit consent flag. The relay server url is always a user setting with no default — this module never names a relay, a host or a vendor endpoint, and the frame codec is pure json so the socket seam in socketrelay stays the only impure boundary.
 * Example: `const envelope = composeenvelope({ op: "eventpost", opid: stableopid("ext", 1), at: now, sessionid, token, body: eventpostbody({ event: chateventpayload({ text, from }) }) }); negotiatecapabilities(contractcapabilities(), sitecapabilities).ok;`
 */

/** The wire operations the servercontract defines, in the stable order the capability intersection keeps. */
export const serveroperations: serveroperation[] = ["sessioncreate", "sessionjoin", "eventpost", "eventstream"];

/** The event types the bridge carries, in the stable order the capability intersection keeps. */
export const servereventtypes: servereventtype[] = ["chat", "planproposal", "planreview", "progress"];

/** The field keys page content hides behind: a payload key of this shape never crosses the bridge unless the explicit page consent flag is set, so plan text and statuses stay the default payload. */
export const pagecontentkeys: string[] = ["html", "content", "body", "textpreview", "preview", "dom", "markup", "screenshot", "pagetext", "outerhtml", "innertext"];

/** The capabilities this side of the servercontract declares: every operation, every event type, heartbeat frames and stream multiplexing over one socket. */
export function contractcapabilities(version: number = servercontractversion): servercontractcapabilities {
  return { version, operations: [...serveroperations], events: [...servereventtypes], heartbeat: true, multiplex: true };
}

/** Builds the stable operation id one reply correlates: the sender seed and the per sender sequence compose an id that stays unique inside one session without any randomness on the wire. */
export function stableopid(seed: string, sequence: number): string {
  const trimmed = seed.trim();
  if (trimmed === "") throw new Error("The operation id names its sender seed; an empty seed never correlates a reply.");
  if (!Number.isInteger(sequence) || sequence < 1) throw new Error("The operation id sequence stays a positive whole number per sender.");
  return `op-${trimmed}-${sequence}`;
}

/** Negotiates the shared contract of the two handshake sides: the version is the newest both sides speak, the operations and event types are the intersection in the stable contract order, and a handshake with no shared version, no shared operation or no shared event type refuses instead of degrading silently. */
export function negotiatecapabilities(ours: servercontractcapabilities, theirs: servercontractcapabilities): { ok: boolean; version: number; operations: serveroperation[]; events: servereventtype[]; heartbeat: boolean; multiplex: boolean; reason?: string } {
  if (!Number.isInteger(ours.version) || ours.version < 1 || !Number.isInteger(theirs.version) || theirs.version < 1) return { ok: false, version: 0, operations: [], events: [], heartbeat: false, multiplex: false, reason: "The servercontract version stays a positive whole number on both sides of the handshake." };
  const version = Math.min(ours.version, theirs.version);
  const operations = serveroperations.filter(operation => ours.operations.includes(operation) && theirs.operations.includes(operation));
  const events = servereventtypes.filter(event => ours.events.includes(event) && theirs.events.includes(event));
  if (version < 1) return { ok: false, version: 0, operations: [], events: [], heartbeat: false, multiplex: false, reason: "The two handshake sides share no servercontract version." };
  if (operations.length === 0) return { ok: false, version, operations: [], events: [], heartbeat: false, multiplex: false, reason: "The two handshake sides share no wire operation." };
  if (events.length === 0) return { ok: false, version, operations: [], events: [], heartbeat: false, multiplex: false, reason: "The two handshake sides share no event type." };
  return { ok: true, version, operations, events, heartbeat: ours.heartbeat === true && theirs.heartbeat === true, multiplex: ours.multiplex === true && theirs.multiplex === true };
}

/** Composes one servercontract envelope: the version defaults to this build's contract version, the operation id stays exactly the caller's stable id and the body rides as reviewed json. */
export function composeenvelope(input: { op: serveroperation; opid: string; at: number; version?: number; sessionid?: string; token?: string; body?: Record<string, unknown> }): serverenvelope {
  const opid = input.opid.trim();
  if (opid === "") throw new Error("The envelope carries its stable operation id; an empty id never correlates a reply.");
  if (!serveroperations.includes(input.op)) throw new Error(`The envelope operation ${input.op} sits outside the servercontract operations.`);
  if (!Number.isFinite(input.at)) throw new Error("The envelope carries its timestamp.");
  return { version: input.version ?? servercontractversion, op: input.op, opid, at: input.at, ...(input.sessionid !== undefined && input.sessionid.trim() !== "" ? { sessionid: input.sessionid.trim() } : {}), ...(input.token !== undefined && input.token.trim() !== "" ? { token: input.token.trim() } : {}), ...(input.body !== undefined ? { body: input.body } : {}) };
}

/** Parses one unknown value into a servercontract envelope with full schema validation: the value must be an object, the version a positive whole number, the operation one of the four wire operations, the operation id a non-empty string, the session id and token non-empty strings when present, the timestamp a finite number and the body a json object when present; every failure rejects the envelope with the field that named it. */
export function parseenvelope(value: unknown): serverenvelope {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("The servercontract envelope must be a json object.");
  const entry = value as Record<string, unknown>;
  if (!Number.isInteger(entry.version) || (entry.version as number) < 1) throw new Error("The envelope version must be a positive whole number.");
  if (typeof entry.op !== "string" || !serveroperations.includes(entry.op as serveroperation)) throw new Error(`The envelope operation ${String(entry.op)} sits outside the servercontract operations.`);
  if (typeof entry.opid !== "string" || entry.opid.trim() === "") throw new Error("The envelope operation id must be a non-empty string.");
  if (entry.sessionid !== undefined && (typeof entry.sessionid !== "string" || entry.sessionid.trim() === "")) throw new Error("The envelope session id must be a non-empty string when present.");
  if (entry.token !== undefined && (typeof entry.token !== "string" || entry.token.trim() === "")) throw new Error("The envelope frame token must be a non-empty string when present.");
  if (!Number.isFinite(entry.at)) throw new Error("The envelope timestamp must be a finite number.");
  if (entry.body !== undefined && (!entry.body || typeof entry.body !== "object" || Array.isArray(entry.body))) throw new Error("The envelope body must be a json object when present.");
  return { version: entry.version as number, op: entry.op as serveroperation, opid: entry.opid.trim(), at: entry.at as number, ...(entry.sessionid !== undefined ? { sessionid: (entry.sessionid as string).trim() } : {}), ...(entry.token !== undefined ? { token: (entry.token as string).trim() } : {}), ...(entry.body !== undefined ? { body: entry.body as Record<string, unknown> } : {}) };
}

/** Reads one envelope acceptance without throwing: the accepted envelope returns with ok true while every schema failure returns the rejection reason the wire logs correlate. */
export function envelopeacceptance(value: unknown): { ok: boolean; envelope?: serverenvelope; reason?: string } {
  try {
    return { ok: true, envelope: parseenvelope(value) };
  } catch (error) {
    return { ok: false, reason: error instanceof Error ? error.message : String(error) };
  }
}

/** Builds the sessioncreate body: the member role, the member id and the capabilities the joining side declares, so the relay answers the session id and the negotiated contract. */
export function sessioncreatebody(input: { role: "extension" | "site"; memberid: string; capabilities: servercontractcapabilities; pairingcode?: string }): Record<string, unknown> {
  const memberid = input.memberid.trim();
  if (memberid === "") throw new Error("The sessioncreate body names its member id.");
  if (input.role !== "extension" && input.role !== "site") throw new Error("The sessioncreate role is the extension or the site side.");
  return { role: input.role, memberid, capabilities: input.capabilities, ...(input.pairingcode !== undefined && input.pairingcode.trim() !== "" ? { pairingcode: input.pairingcode.trim() } : {}) };
}

/** Builds the sessionjoin body: the session the member joins (empty when the pairing code alone identifies the session), the member role and id, the declared capabilities and the pairing code the site side exchanges for its session token. */
export function sessionjoinbody(input: { sessionid?: string; role: "extension" | "site"; memberid: string; capabilities: servercontractcapabilities; pairingcode?: string }): Record<string, unknown> {
  const sessionid = (input.sessionid ?? "").trim();
  const pairingcode = (input.pairingcode ?? "").trim();
  if (sessionid === "" && pairingcode === "") throw new Error("The sessionjoin body names its session id or rides its pairing code; one of the two identifies the join.");
  const memberid = input.memberid.trim();
  if (memberid === "") throw new Error("The sessionjoin body names its member id.");
  if (input.role !== "extension" && input.role !== "site") throw new Error("The sessionjoin role is the extension or the site side.");
  return { ...(sessionid !== "" ? { sessionid } : {}), role: input.role, memberid, capabilities: input.capabilities, ...(pairingcode !== "" ? { pairingcode } : {}) };
}

/** Builds the eventpost body: the event type, the multiplexed stream name and the minimized payload; the event type must be one of the four wire event types and the stream a non-empty name. */
export function eventpostbody(input: { event: { kind: servereventtype; stream: string; payload: Record<string, unknown> } }): Record<string, unknown> {
  if (!servereventtypes.includes(input.event.kind)) throw new Error(`The event type ${input.event.kind} sits outside the servercontract event types.`);
  const stream = input.event.stream.trim();
  if (stream === "") throw new Error("The eventpost body names its multiplexed stream.");
  if (!input.event.payload || typeof input.event.payload !== "object" || Array.isArray(input.event.payload)) throw new Error("The eventpost payload must be a json object.");
  return { kind: input.event.kind, stream, payload: input.event.payload };
}

/** Builds the eventstream body: the multiplexed streams one side subscribes to and the optional timestamp the subscription resumes after. */
export function eventstreambody(input: { streams: string[]; since?: number }): Record<string, unknown> {
  const streams = input.streams.map(stream => stream.trim()).filter(stream => stream !== "");
  if (streams.length === 0) throw new Error("The eventstream body names at least one multiplexed stream.");
  if (input.since !== undefined && !Number.isFinite(input.since)) throw new Error("The eventstream resume timestamp stays a finite number.");
  return { streams, ...(input.since !== undefined ? { since: input.since } : {}) };
}

/** Builds the chat event payload: the task text the human typed and the sender name; the chat text is the reviewed task text itself, never captured page content. */
export function chateventpayload(input: { text: string; from: string }): Record<string, unknown> {
  const text = input.text.trim();
  if (text === "") throw new Error("The chat event carries its task text.");
  const from = input.from.trim();
  if (from === "") throw new Error("The chat event names its sender.");
  return { text, from };
}

/** Builds the plan proposal event payload from the review card: the proposal id, the plan title and the step digest with kinds, origins and sensitive flags — plan text and statuses only, so no page content rides the proposal. */
export function planproposaleventpayload(card: bridgereviewcard): Record<string, unknown> {
  const proposalid = card.proposalid.trim();
  if (proposalid === "") throw new Error("The plan proposal names its proposal id.");
  const title = card.title.trim();
  if (title === "") throw new Error("The plan proposal names its plan title.");
  if (card.steps.length === 0) throw new Error("The plan proposal carries at least one step of its digest.");
  return { proposalid, title, steps: card.steps.map(step => ({ id: step.id, kind: step.kind, origin: step.origin, sensitive: step.sensitive })), ...(card.timeoutat !== undefined ? { timeoutat: card.timeoutat } : {}) };
}

/** Builds the plan review event payload from the returned decision: the proposal id, the decision, the reviewer and the optional note. */
export function planrevieweventpayload(decision: bridgereviewdecision): Record<string, unknown> {
  const proposalid = decision.proposalid.trim();
  if (proposalid === "") throw new Error("The plan review names its proposal id.");
  if (decision.decision !== "approved" && decision.decision !== "changes" && decision.decision !== "refused") throw new Error("The plan review decision is approved, changes or refused.");
  const by = decision.by.trim();
  if (by === "") throw new Error("The plan review names its reviewer.");
  return { proposalid, decision: decision.decision, by, ...(decision.note !== undefined && decision.note.trim() !== "" ? { note: decision.note.trim() } : {}) };
}

/** Builds the progress event payload: the step id and its status word — statuses only, so the run progress never carries observation bytes. */
export function progresseventpayload(input: { stepid: string; status: string }): Record<string, unknown> {
  const stepid = input.stepid.trim();
  if (stepid === "") throw new Error("The progress event names its step id.");
  const status = input.status.trim();
  if (status === "") throw new Error("The progress event names its status word.");
  return { stepid, status };
}

/** Builds the heartbeat event the bridge socket keeps alive with: a progress event on the heartbeat stream, so the four wire operations and event types stay complete with no extra kind. */
export function heartbeatevent(now: number): { kind: servereventtype; stream: string; payload: Record<string, unknown> } {
  if (!Number.isFinite(now)) throw new Error("The heartbeat event carries its timestamp.");
  return { kind: "progress", stream: "heartbeat", payload: progresseventpayload({ stepid: "heartbeat", status: "alive" }) };
}

/** Minimizes one payload for the bridge: the chat task text rides as the human typed it while every other event keeps plan text and statuses only — a page content key never crosses the bridge unless the explicit page consent flag is set, and the strip report names every field the minimization held. */
export function bridgepayload(kind: servereventtype, payload: Record<string, unknown>, pageconsent?: boolean): { payload: Record<string, unknown>; held: string[] } {
  if (kind === "chat") return { payload, held: [] };
  const held: string[] = [];
  const minimized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (pagecontentkeys.includes(key) && pageconsent !== true) { held.push(key); continue; }
    minimized[key] = value;
  }
  return { payload: minimized, held };
}

/** Reduces one approved plan to its bridge digest: the objective text and every step with its kind and status word — the plan text and statuses the review needs, never the observation bytes the steps read. */
export function minimalplandigest(plan: agentplan, statuses: Record<string, string> = {}): { title: string; steps: Array<{ id: string; kind: string; status: string }> } {
  const objective = plan.objective.trim();
  if (objective === "") throw new Error("The plan digest names its objective.");
  return { title: objective, steps: plan.steps.map(step => ({ id: step.id, kind: step.kind, status: statuses[step.id] ?? "pending" })) };
}

/** Serializes one envelope to its wire frame: plain json text, one frame per message, no binary codec. */
export function frameof(envelope: serverenvelope): string {
  return JSON.stringify(envelope);
}

/** Parses one wire frame back into a validated envelope: the frame must be json text that passes the envelope schema validation. */
export function parsewireframe(text: string): serverenvelope {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("The wire frame must be json text.");
  }
  return parseenvelope(parsed);
}

/** Builds the site manifest the static site declares: the name, the servercontract version the site speaks and the capabilities it offers, so the extension reads the contract version before the first frame. */
export function sitemanifestof(version: number = servercontractversion): { name: string; servercontract: number; capabilities: servercontractcapabilities } {
  return { name: "devthink site", servercontract: version, capabilities: contractcapabilities(version) };
}

/* ── Merged from socketrelay.ts ── */

import type { bridgeeventrecord, bridgequeuerecord } from "./types.js";
import { reconnectwaits } from "./net.js";

/**
 * Socket relay client of the 1.1.82 site integration family.
 * Every correlated rule of the bridge socket lives in this one module: the connection to the user configured relay url over wss through an injected socket seam (the extension executor wires the browser websocket, tests wire plain fixtures or the local testrelay); the frame authentication that stamps the sharedauth session token on every outgoing frame and verifies the session and token of every incoming frame; the reconnect with exponential backoff that reuses the reviewed backoff family of the socketbus module and asks the injected rotation seam for a fresh token on every reconnect; the multiplexing of the chat, review, progress and heartbeat streams over one socket; the per session rate window that caps the frames one window accepts; the offline queue that buffers frames while the socket is down and replays them with operation id deduplication on reconnect; and the heartbeat frames and the idle expiry that close a quiet session inside the user configured window. The relay url is always the caller's user setting — this module never names a relay, a host or a vendor endpoint, and no url, token or page content enters any log line it builds.
 * Example: `const opened = await connectrelay({ state: client, open: socketseam, sleep, now }); const posted = postevent(opened.state, opened.socket, { kind: "chat", stream: "chat", payload: { text, from } }, now);`
 */

/** The socket seam the impure boundary injects: one url resolves to an open socket that sends text frames, closes with a code and reports its frames, closes and errors through callbacks; the extension executor wires the browser websocket, tests wire plain fixtures. */
export interface relaysocket {
  send(frame: string): void;
  close(code?: number): void;
  onmessage?: (frame: string) => void;
  onclose?: (code: number) => void;
  onerror?: (error: string) => void;
}

/** The socket open seam signature: one reviewed relay url resolves to an open socket or throws the connection error; the impure open lives behind this seam. */
export type socketopen = (url: string) => Promise<relaysocket>;

/** The token rotation seam signature: the reconnect asks this seam for the fresh session token the sharedauth family rotated; an absent seam keeps the current token. */
export type tokenrotation = () => Promise<string>;

/** The sleep seam signature of the reconnect backoff: tests inject a fake clock, the executor wires the platform timer. */
export type relaysleep = (milliseconds: number) => Promise<void>;

/** The client state of one bridge socket: the user configured url, its origin, the session and frame token, the member identity, the lifecycle state, the frame counters, the multiplexed stream queues, the correlation acks, the offline queue, the rate window and the heartbeat clock. */
export interface relayclientstate {
  url: string;
  origin: string;
  sessionid: string;
  token: string;
  memberid: string;
  role: "extension" | "site";
  state: "idle" | "connecting" | "authenticating" | "connected" | "reconnecting" | "closed";
  attempts: number;
  rotations: number;
  sent: number;
  received: number;
  lastframeat: number;
  lastheartbeatat: number;
  streams: Record<string, bridgeeventrecord[]>;
  acks: serverenvelope[];
  queue: bridgequeuerecord[];
  capabilities: servercontractcapabilities;
  rate: { used: number; windowstartedat: number };
  sequence: number;
  lasterror?: string;
  openedat?: number;
  closedat?: number;
}

/** Resolves the origin of one relay url: a wss url maps onto its https origin and a ws url onto its http origin so the origin scoping of the sharedauth tokens covers both; an unparsable url resolves to the empty origin the gates refuse. */
export function relayorigin(url: string): string {
  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol !== "wss:" && parsed.protocol !== "ws:") return "";
    const protocol = parsed.protocol === "wss:" ? "https:" : "http:";
    return `${protocol}//${parsed.host}`;
  } catch {
    return "";
  }
}

/** Creates the client state of one bridge socket: the url is the caller's user setting (an empty url leaves the bridge disabled), the session and token start empty until the pairing exchange fills them and every counter starts at zero. */
export function newrelayclient(input: { url: string; memberid: string; role: "extension" | "site"; capabilities: servercontractcapabilities; sessionid?: string; token?: string; now: number }): relayclientstate {
  const memberid = input.memberid.trim();
  if (memberid === "") throw new Error("The bridge client names its member id.");
  const url = input.url.trim();
  if (url !== "" && relayorigin(url) === "") throw new Error("The relay url must be a wss or ws url the user chose.");
  return { url, origin: relayorigin(url), sessionid: (input.sessionid ?? "").trim(), token: (input.token ?? "").trim(), memberid, role: input.role, state: url === "" ? "idle" : "connecting", attempts: 0, rotations: 0, sent: 0, received: 0, lastframeat: input.now, lastheartbeatat: input.now, streams: {}, acks: [], queue: [], capabilities: input.capabilities, rate: { used: 0, windowstartedat: input.now }, sequence: 0 };
}

/** Verifies the frame authentication of one incoming envelope: the frame carries the session id and the token of the live client state, so a frame of another session or another token never passes. */
export function verifyframeauth(envelope: serverenvelope, state: relayclientstate): boolean {
  if (state.sessionid === "" || state.token === "") return false;
  return envelope.sessionid === state.sessionid && envelope.token === state.token;
}

/** Stamps the frame authentication on one outgoing envelope: the session id and the session token ride every frame the client sends. */
export function frameauth(envelope: serverenvelope, state: relayclientstate): serverenvelope {
  return { ...envelope, sessionid: state.sessionid, token: state.token };
}

/** Reads the per session rate window: the window resets once it ages out, the used count grows with every accepted frame and a cap the user chose refuses the frame that crosses it while an absent cap keeps the bridge unbounded as the documented user choice. */
export function bridgeframerate(input: { rate: { used: number; windowstartedat: number }; cap?: number; window?: number; now: number }): { allowed: boolean; used: number; windowstartedat: number; resetsat?: number } {
  const window = input.window !== undefined && Number.isFinite(input.window) && input.window > 0 ? input.window : undefined;
  if (window === undefined) return { allowed: true, used: input.rate.used, windowstartedat: input.rate.windowstartedat };
  if (input.now - input.rate.windowstartedat >= window) return { allowed: input.cap === undefined || input.cap >= 1, used: input.cap === undefined ? input.rate.used : 1, windowstartedat: input.now, resetsat: input.now + window };
  const used = input.rate.used + 1;
  if (input.cap !== undefined && Number.isFinite(input.cap) && input.cap >= 1 && used > input.cap) return { allowed: false, used: input.rate.used, windowstartedat: input.rate.windowstartedat, resetsat: input.rate.windowstartedat + window };
  return { allowed: true, used, windowstartedat: input.rate.windowstartedat, resetsat: input.rate.windowstartedat + window };
}

/** Sends one envelope through the open socket: the frame authentication stamps the session and token, the sent counter and the frame clock advance, and the wire frame is the plain json text of the servercontract codec. */
export function sendframe(state: relayclientstate, socket: relaysocket, envelope: serverenvelope, now: number): { state: relayclientstate; sent: boolean; reason?: string } {
  if (state.state !== "connected") return { state, sent: false, reason: "The bridge socket stays down; the frame waits in the offline queue." };
  const stamped = frameauth(envelope, state);
  socket.send(frameof(stamped));
  return { state: { ...state, sent: state.sent + 1, lastframeat: now }, sent: true };
}

/** Receives one wire frame: the frame parses through the servercontract schema validation, the frame authentication must match the live session and token, the multiplexed streams collect every eventpost by its stream name while the correlation acks collect the operation replies, and a rejected frame returns its reason without touching the stream state. */
export function receiveframe(state: relayclientstate, frame: string, now: number): { state: relayclientstate; envelope?: serverenvelope; rejection?: string } {
  let envelope: serverenvelope;
  try {
    envelope = parsewireframe(frame);
  } catch (error) {
    return { state, rejection: error instanceof Error ? error.message : String(error) };
  }
  if (!verifyframeauth(envelope, state)) return { state, rejection: `The frame ${envelope.opid} failed the frame authentication of the session ${state.sessionid}.` };
  if (envelope.op === "eventpost" && envelope.body !== undefined) {
    const stream = typeof envelope.body.stream === "string" ? envelope.body.stream.trim() : "";
    const kind = typeof envelope.body.kind === "string" ? envelope.body.kind : "";
    if (stream !== "") {
      const record: bridgeeventrecord = { id: envelope.opid, sessionid: state.sessionid, kind: kind as bridgeeventrecord["kind"], opid: envelope.opid, stream, payload: (envelope.body.payload as Record<string, unknown>) ?? {}, at: envelope.at, delivered: true };
      const next: relayclientstate = { ...state, received: state.received + 1, lastframeat: now, acks: [...state.acks, envelope], streams: { ...state.streams, [stream]: [...(state.streams[stream] ?? []), record] } };
      return { state: next, envelope };
    }
  }
  return { state: { ...state, received: state.received + 1, lastframeat: now, acks: [...state.acks, envelope] }, envelope };
}

/** Buffers one frame body into the offline queue while the socket is down: the stable operation id deduplicates the buffer, so the same review request queued twice replays once. */
export function enqueuebridge(state: relayclientstate, input: { op: serveroperation; opid: string; body: Record<string, unknown>; now: number }): relayclientstate {
  if (state.queue.some(record => record.opid === input.opid)) return state;
  const record: bridgequeuerecord = { opid: input.opid, op: input.op, sessionid: state.sessionid, body: input.body, queuedat: input.now, attempts: 0 };
  return { ...state, queue: [...state.queue, record] };
}

/** Replays the offline queue over the reconnected socket: every unsent frame sends once with its stable operation id, the replay deduplicates by operation id, the attempts grow and the send time records; the queue keeps the sent records for the audit trail. */
export function replaybridgequeue(state: relayclientstate, socket: relaysocket, now: number): { state: relayclientstate; replayed: number; deduped: number } {
  let replayed = 0;
  let deduped = 0;
  const seen = new Set<string>();
  const queue: bridgequeuerecord[] = [];
  let sent = state.sent;
  for (const record of state.queue) {
    if (seen.has(record.opid)) { deduped += 1; continue; }
    seen.add(record.opid);
    if (record.sentat !== undefined || state.state !== "connected") { queue.push(record); continue; }
    socket.send(frameof(frameauth(composeenvelope({ op: record.op, opid: record.opid, at: now, body: record.body }), state)));
    queue.push({ ...record, attempts: record.attempts + 1, sentat: now });
    replayed += 1;
    sent += 1;
  }
  return { state: { ...state, queue, sent, lastframeat: now }, replayed, deduped };
}

/** Posts one bridge event: a connected socket sends the eventpost frame inside the rate window while a down socket buffers the frame into the offline queue, so no event drops and no frame crosses an exhausted window. */
export function postevent(state: relayclientstate, socket: relaysocket | undefined, event: { kind: bridgeeventrecord["kind"]; stream: string; payload: Record<string, unknown> }, now: number, rate?: { cap?: number; window?: number }): { state: relayclientstate; sent: boolean; queued: boolean; reason?: string } {
  const opid = `op-${state.memberid}-${state.sequence + 1}`;
  const body = eventpostbody({ event });
  if (state.state !== "connected" || socket === undefined) {
    return { state: enqueuebridge({ ...state, sequence: state.sequence + 1 }, { op: "eventpost", opid, body, now }), sent: false, queued: true, reason: "The bridge socket stays down; the event waits in the offline queue." };
  }
  const window = bridgeframerate({ rate: state.rate, ...(rate?.cap !== undefined ? { cap: rate.cap } : {}), ...(rate?.window !== undefined ? { window: rate.window } : {}), now });
  if (!window.allowed) {
    return { state: enqueuebridge({ ...state, sequence: state.sequence + 1, rate: { used: window.used, windowstartedat: window.windowstartedat } }, { op: "eventpost", opid, body, now }), sent: false, queued: true, reason: `The bridge rate window holds its ${rate?.cap} frame cap; the event waits for the window reset.` };
  }
  const sent = sendframe({ ...state, sequence: state.sequence + 1, rate: { used: window.used, windowstartedat: window.windowstartedat } }, socket, composeenvelope({ op: "eventpost", opid, at: now, body }), now);
  return { state: sent.state, sent: true, queued: false };
}

/** Sends one heartbeat frame when the user configured interval elapsed: the heartbeat is a progress event on the heartbeat stream, so the socket stays alive inside the four wire operations without a new kind. */
export function heartbeattick(state: relayclientstate, socket: relaysocket | undefined, now: number, interval?: number): { state: relayclientstate; beat: boolean } {
  if (state.state !== "connected" || socket === undefined) return { state, beat: false };
  if (interval === undefined || !Number.isFinite(interval) || interval <= 0) return { state, beat: false };
  if (now - state.lastheartbeatat < interval) return { state, beat: false };
  const event = heartbeatevent(now);
  const opid = `op-${state.memberid}-heartbeat-${state.sent + 1}`;
  const sent = sendframe(state, socket, composeenvelope({ op: "eventpost", opid, at: now, body: eventpostbody({ event }) }), now);
  return { state: { ...sent.state, lastheartbeatat: now }, beat: true };
}

/** Reads whether the bridge session expired inside the user configured idle window: a session quiet past the window expires while an absent window never expires a session because the bound stays a user choice. */
export function idleexpired(state: relayclientstate, now: number, idlewindow?: number): boolean {
  if (idlewindow === undefined || !Number.isFinite(idlewindow) || idlewindow <= 0) return false;
  return now - state.lastframeat >= idlewindow;
}

/** Closes the bridge socket state: the close records its time and reason, the lifecycle lands on closed and every counter stays for the audit trail. */
export function disconnectrelay(state: relayclientstate, now: number, reason?: string): relayclientstate {
  return { ...state, state: "closed", closedat: now, ...(reason !== undefined ? { lasterror: reason } : {}) };
}

/** Reads the popup bridge status of one client state: disabled when no relay url is configured, connected while the socket is live, paired when the pairing exchange holds a session token and offline while a configured bridge has no live socket. */
export function bridgestatusview(state: relayclientstate): { status: "connected" | "paired" | "offline" | "disabled"; paired: boolean; queued: number } {
  if (state.url === "") return { status: "disabled", paired: false, queued: state.queue.filter(record => record.sentat === undefined).length };
  const paired = state.sessionid !== "" && state.token !== "";
  if (state.state === "connected") return { status: "connected", paired, queued: state.queue.filter(record => record.sentat === undefined).length };
  if (paired) return { status: "paired", paired: true, queued: state.queue.filter(record => record.sentat === undefined).length };
  return { status: "offline", paired: false, queued: state.queue.filter(record => record.sentat === undefined).length };
}

/**
 * Connects the bridge socket through the injected socket seam: the open resolves to a live socket, the client sends its first frame — a sessioncreate with the pairing code when no session exists yet, a sessionjoin with the session id on every reconnect — with the session token as the frame authentication and waits for the reply that quotes the operation id, the negotiated capabilities land on the state and a reply that carries a fresh token rotates the frame authentication. A failed open waits the exponential backoff of the reviewed socketbus family — the rotation seam supplies a fresh token for every retry — until the attempt budget exhausts and the state closes with the last error class.
 */
export async function connectrelay(input: { state: relayclientstate; open: socketopen; pairingcode?: string; attempts?: number; backoffbase?: number; backoffceiling?: number; rotate?: tokenrotation; sleep?: relaysleep; now?: () => number }): Promise<{ state: relayclientstate; socket?: relaysocket; error?: string }> {
  const sleep: relaysleep = input.sleep ?? ((milliseconds: number): Promise<void> => new Promise(resolve => setTimeout(resolve, Math.max(0, milliseconds))));
  const now = input.now ?? Date.now;
  if (input.state.url.trim() === "") return { state: { ...input.state, state: "idle", lasterror: "The bridge stays disabled because no relay url is configured; the url is always the user's setting." }, error: "The bridge stays disabled because no relay url is configured; the url is always the user's setting." };
  const budget = Math.max(1, Math.floor(input.attempts ?? 1));
  const waits = reconnectwaits(budget - 1, input.backoffbase ?? 0, input.backoffceiling);
  let state: relayclientstate = { ...input.state, state: "connecting" };
  let lasterror = "";
  for (let attempt = 0; attempt < budget; attempt += 1) {
    let socket: relaysocket;
    try {
      socket = await input.open(state.url);
    } catch (error) {
      lasterror = error instanceof Error ? error.message : String(error);
      if (attempt < budget - 1) {
        const wait = waits[attempt] ?? 0;
        if (wait > 0) await sleep(wait);
        state = { ...state, attempts: state.attempts + 1, state: "reconnecting" };
        if (input.rotate !== undefined) {
          try { state = { ...state, token: await input.rotate(), rotations: state.rotations + 1 }; } catch { /* the rotation seam failure keeps the current token for the next attempt */ }
        }
      }
      continue;
    }
    state = { ...state, state: "authenticating" };
    const opid = `op-${state.memberid}-join-${state.attempts + 1}`;
    const firstjoin = state.sessionid === "";
    const reply = await new Promise<{ frame?: string; error?: string }>(resolve => {
      socket.onmessage = frame => resolve({ frame });
      socket.onclose = code => resolve({ error: `The relay socket closed with code ${code} before the ${firstjoin ? "session create" : "join"} reply.` });
      socket.onerror = error => resolve({ error });
      const createsession = firstjoin && state.role === "extension";
      const body = createsession
        ? { role: state.role, memberid: state.memberid, capabilities: state.capabilities, ...(input.pairingcode !== undefined && input.pairingcode.trim() !== "" ? { pairingcode: input.pairingcode.trim() } : {}) }
        : firstjoin
          ? { role: state.role, memberid: state.memberid, capabilities: state.capabilities, ...(input.pairingcode !== undefined && input.pairingcode.trim() !== "" ? { pairingcode: input.pairingcode.trim() } : {}) }
          : { sessionid: state.sessionid, role: state.role, memberid: state.memberid, capabilities: state.capabilities };
      socket.send(frameof(frameauth(composeenvelope({ op: createsession ? "sessioncreate" : "sessionjoin", opid, at: now(), body }), { ...state, token: state.token })));
    });
    if (reply.frame === undefined) {
      lasterror = reply.error ?? "The relay socket closed before the join reply.";
      try { socket.close(1000); } catch { /* an already closed socket needs no close */ }
      if (attempt < budget - 1) {
        const wait = waits[attempt] ?? 0;
        if (wait > 0) await sleep(wait);
        state = { ...state, attempts: state.attempts + 1, state: "reconnecting" };
        if (input.rotate !== undefined) {
          try { state = { ...state, token: await input.rotate(), rotations: state.rotations + 1 }; } catch { /* the rotation seam failure keeps the current token for the next attempt */ }
        }
      }
      continue;
    }
    let envelope: serverenvelope;
    try {
      envelope = parsewireframe(reply.frame);
    } catch (error) {
      lasterror = error instanceof Error ? error.message : String(error);
      try { socket.close(1000); } catch { /* an already closed socket needs no close */ }
      continue;
    }
    if (envelope.opid !== opid) {
      lasterror = `The join reply ${envelope.opid} does not correlate the join request ${opid}.`;
      try { socket.close(1000); } catch { /* an already closed socket needs no close */ }
      continue;
    }
    if (envelope.body !== undefined && typeof envelope.body.error === "string" && envelope.body.error.trim() !== "") {
      lasterror = envelope.body.error;
      try { socket.close(1000); } catch { /* an already closed socket needs no close */ }
      if (attempt < budget - 1) {
        const wait = waits[attempt] ?? 0;
        if (wait > 0) await sleep(wait);
        state = { ...state, attempts: state.attempts + 1, state: "reconnecting" };
      }
      continue;
    }
    const rotatedtoken = envelope.body !== undefined && typeof envelope.body.token === "string" ? envelope.body.token.trim() : "";
    const sessionid = envelope.body !== undefined && typeof envelope.body.sessionid === "string" ? envelope.body.sessionid.trim() : state.sessionid;
    state = { ...state, state: "connected", sessionid: sessionid !== "" ? sessionid : state.sessionid, token: rotatedtoken !== "" ? rotatedtoken : state.token, rotations: rotatedtoken !== "" ? state.rotations + 1 : state.rotations, openedat: now(), lastframeat: now(), lastheartbeatat: now(), acks: [...state.acks, envelope] };
    return { state, socket };
  }
  return { state: { ...state, state: "closed", attempts: state.attempts, closedat: now(), lasterror: lasterror }, error: lasterror };
}

/* ── Merged from chatbridge.ts ── */

import { pairingcountdown } from "./auth.js";

/**
 * Chatbridge of the 1.1.82 site integration family.
 * Every render and decision rule of the site conversation surface lives in this one pure module: the chat rows the widget renders from the bridge events, the plan review cards the plan proposal events become, the review decisions the cards collect and return to the extension review gate, and the pairing panel the options countdown renders. The widget renders and collects only — it never executes an action, never holds a socket and never touches a page: the extension stays the only executor, a sensitive step approves only through the extension approval flow, and every payload the widget builds rides the data minimization of the servercontract so plan text and statuses cross while page content stays on the device without the explicit consent flag.
 * Example: `const cards = reviewcardsof(events); const decision = carddecision(cards[0], "approved", "site user", now); const outcome = reviewgateoutcome(decision);`
 */

/** Reads the chat rows the widget renders: every chat event becomes one row with its sender, its task text, the mine flag of the member that typed it and its timestamp; non chat events never render as chat. */
export function chatrowsof(events: bridgeeventrecord[], memberid: string): Array<{ from: string; text: string; mine: boolean; at: number }> {
  return events.filter(event => event.kind === "chat").map(event => ({ from: typeof event.payload.from === "string" ? event.payload.from : "", text: typeof event.payload.text === "string" ? event.payload.text : "", mine: typeof event.payload.from === "string" && event.payload.from === memberid, at: event.at }));
}

/** Reads the plan review cards the widget renders: every plan proposal event becomes one card with its proposal id, its plan title and its step digest; the card renders the review surface only and collects the decision. */
export function reviewcardsof(events: bridgeeventrecord[]): bridgereviewcard[] {
  return events.filter(event => event.kind === "planproposal").map(event => {
    const steps = Array.isArray(event.payload.steps) ? (event.payload.steps as Array<Record<string, unknown>>).filter(step => typeof step.id === "string" && typeof step.kind === "string").map(step => ({ id: String(step.id), kind: String(step.kind), origin: typeof step.origin === "string" ? step.origin : "", sensitive: step.sensitive === true })) : [];
    return { proposalid: typeof event.payload.proposalid === "string" ? event.payload.proposalid : "", title: typeof event.payload.title === "string" ? event.payload.title : "", steps, ...(typeof event.payload.timeoutat === "number" ? { timeoutat: event.payload.timeoutat } : {}), at: event.at };
  }).filter(card => card.proposalid !== "" && card.title !== "");
}

/** Collects one review decision from a rendered card: the decision carries the proposal id, the verdict, the reviewer and the optional note; the card never executes anything and the decision never names an action, only the review verdict. */
export function carddecision(card: bridgereviewcard, decision: bridgereviewdecision["decision"], by: string, now: number, note?: string): bridgereviewdecision {
  if (card.proposalid.trim() === "") throw new Error("The review decision names its proposal.");
  if (decision !== "approved" && decision !== "changes" && decision !== "refused") throw new Error("The review decision is approved, changes or refused.");
  const reviewer = by.trim();
  if (reviewer === "") throw new Error("The review decision names its reviewer.");
  return { proposalid: card.proposalid, decision, by: reviewer, ...(note !== undefined && note.trim() !== "" ? { note: note.trim() } : {}), at: now };
}

/** Builds the wire payload of one review decision: the plan review event payload the servercontract validates, so the decision crosses the bridge as plan text only. */
export function decisionpayload(decision: bridgereviewdecision): Record<string, unknown> {
  return planrevieweventpayload(decision);
}

/** Reads the extension review gate outcome of one bridge decision: an approved decision resolves the gate as approved while a changes or refused decision returns the proposal to the review surface — the outcome is a resolution request only, the extension approval flow stays the only executor of any step. */
export function reviewgateoutcome(decision: bridgereviewdecision): { state: "approved" | "refused"; reason: string } {
  if (decision.decision === "approved") return { state: "approved", reason: `The site review approved the plan proposal ${decision.proposalid}${decision.note !== undefined ? ` with the note ${decision.note}` : ""}; the extension review gate resolves as approved and the extension stays the only executor.` };
  return { state: "refused", reason: `The site review returned ${decision.decision} for the plan proposal ${decision.proposalid}${decision.note !== undefined ? ` with the note ${decision.note}` : ""}; the proposal returns to the review surface and no step executes.` };
}

/** Builds the task text event the site sends through the relay: the chat event payload of the servercontract, so the human typed task text crosses as reviewed text while page content never rides it. */
export function chateventof(text: string, from: string): { kind: servereventtype; stream: string; payload: Record<string, unknown> } {
  return { kind: "chat", stream: "chat", payload: chateventpayload({ text, from }) };
}

/** Builds the plan proposal event the extension posts: the review card payload of the servercontract, so the plan text and the step statuses cross while the observation bytes stay on the device. */
export function planproposaleventof(card: bridgereviewcard): { kind: servereventtype; stream: string; payload: Record<string, unknown> } {
  return { kind: "planproposal", stream: "review", payload: planproposaleventpayload(card) };
}

/** Reads the whole widget view in one pass: the status word, the chat rows, the review cards and the pending decision count, so the static site renders one frame of the conversation surface from one record list. */
export function widgetview(input: { status: string; events: bridgeeventrecord[]; memberid: string }): { status: string; rows: Array<{ from: string; text: string; mine: boolean; at: number }>; cards: bridgereviewcard[]; pending: number } {
  const cards = reviewcardsof(input.events);
  const answered = new Set(input.events.filter(event => event.kind === "planreview").map(event => typeof event.payload.proposalid === "string" ? event.payload.proposalid : "").filter(id => id !== ""));
  return { status: input.status, rows: chatrowsof(input.events, input.memberid), cards, pending: cards.filter(card => !answered.has(card.proposalid)).length };
}

/** Reads the pairing panel the options page and the site render beside the code: the countdown display model of the sharedauth family, so both surfaces show the same expiry window. */
export function pairingpanel(record: Parameters<typeof pairingcountdown>[0], now: number): { code: string; secondsleft: number; expired: boolean; label: string } {
  const countdown = pairingcountdown(record, now);
  return { code: record.code.code, secondsleft: countdown.secondsleft, expired: countdown.expired, label: countdown.label };
}

/** Reads the site manifest the static site declares: the servercontract version and the capabilities the site speaks, fetched from the manifest link of the page before the first frame. */
export function sitemanifest(): ReturnType<typeof sitemanifestof> {
  return sitemanifestof();
}

/** Reads the popup status label of one bridge status view: the connected, paired, offline and disabled words the popup icon renders. */
export function bridgestatuslabel(view: { status: string; paired: boolean; queued: number }): string {
  if (view.status === "connected") return `Bridge: connected${view.paired ? " and paired" : ""}${view.queued > 0 ? ` · ${view.queued} queued frame${view.queued === 1 ? "" : "s"}` : ""}.`;
  if (view.status === "paired") return `Bridge: paired, socket offline${view.queued > 0 ? ` · ${view.queued} queued frame${view.queued === 1 ? "" : "s"}` : ""}.`;
  if (view.status === "offline") return `Bridge: offline${view.queued > 0 ? ` · ${view.queued} queued frame${view.queued === 1 ? "" : "s"}` : ""}.`;
  return "Bridge: disabled (no relay url set).";
}

/* ── Merged from wsbridge.ts ── */

import type { nativeframe, wsbridgesession } from "./types.js";

/**
 * Wsbridge of the 1.1.85 native host bridge family.
 * Every localhost relay concern of the native transport lives in this one pure module: the bind check that keeps the listener on localhost and refuses every other address, the session start that binds a random free port (the zero port the socket seam reports back), the per session token with its hash only record (the raw token never enters a log or an audit entry), the frame authentication that validates every incoming frame against the session token, the advertisement frame that tells the extension the port and the token over the native port, the idle expiry that closes a quiet session after the user configured window, the one extension connection rule that refuses a second extension side, and the envelope translation that reuses the servercontract envelopes of the 1.1.82 family so the wsbridge frames carry the same negotiated version, operation id and correlation shape the relay family speaks. The module stays pure: the socket, the random port and the token source reach it through injected seams only, the bind address and the idle window stay user choices with no code default, and no relay url, vendor endpoint or machine outside localhost ever appears here — a connection from another machine refuses at the bind itself.
 * Example: `const bind = wsbridgebindcheck("127.0.0.1"); const session = wsbridgesessionstart({ port: 0, now, token, hashof }); const ad = wsbridgeadvertiseframe(session, token, "run-ext-1");`
 */

/** The localhost addresses the wsbridge may bind: the loopback v4, its name and the loopback v6; every other address refuses because the bridge never leaves the machine. */
export const wsbridgelocalhosts: string[] = ["127.0.0.1", "localhost", "::1", "[::1]"];

/** The stream name the wsbridge events multiplex over: the native transport frames ride the servercontract eventpost stream of this name. */
export const wsbridgestreamname = "nativetransport";

/** Checks one wsbridge bind address: the listener binds a localhost address only, a zero port asks the socket seam for a random free port and every other address refuses because the wsbridge never accepts a connection from another machine. */
export function wsbridgebindcheck(input: { bind?: string; port?: number }): { ok: boolean; bind: string; port: number; reason?: string } {
  const bind = (input.bind ?? "").trim() === "" ? "127.0.0.1" : (input.bind ?? "").trim();
  if (!wsbridgelocalhosts.includes(bind)) return { ok: false, bind, port: 0, reason: `The wsbridge binds a localhost address only; the ${bind} address accepts connections from other machines and the bridge never leaves the machine.` };
  const port = input.port ?? 0;
  if (!Number.isInteger(port) || port < 0 || port > 65535) return { ok: false, bind, port: 0, reason: `The wsbridge port stays a whole number between zero and 65535; the zero port asks the socket for a random free port.` };
  return { ok: true, bind, port };
}

/** Starts one wsbridge session: the socket seam reports the bound port (the zero request becomes the random free port it chose), the token hash records instead of the raw token and the idle window the user configured computes the expiry; an absent window never expires the session. */
export function wsbridgesessionstart(input: { port: number; now: number; token: string; hashof: (text: string) => string; idlewindow?: number; id?: string }): wsbridgesession {
  if (!Number.isInteger(input.port) || input.port < 0 || input.port > 65535) throw new Error("The wsbridge session port stays a whole number between zero and 65535.");
  const token = input.token.trim();
  if (token === "") throw new Error("The wsbridge session carries its per session token; an empty token authenticates nothing.");
  if (input.idlewindow !== undefined && (!Number.isFinite(input.idlewindow) || input.idlewindow <= 0)) throw new Error("The wsbridge idle window stays a positive millisecond count the user chose.");
  return { id: input.id ?? `wsbridge-${input.now}`, port: input.port, tokenhash: input.hashof(token), boundat: input.now, ...(input.idlewindow !== undefined ? { idlewindow: input.idlewindow, expiresat: input.now + input.idlewindow } : {}), extensionconnected: false, connections: 0, received: 0, sent: 0 };
}

/** Records one authenticated connection on the session: the frame counters and the idle clock move, and the idle expiry slides its window from the fresh frame time. */
export function wsbridgeconnection(session: wsbridgesession, now: number): wsbridgesession {
  const idlewindow = session.idlewindow;
  return { ...session, connections: session.connections + 1, lastframeat: now, ...(idlewindow !== undefined ? { expiresat: now + idlewindow } : {}) };
}

/** Connects the extension side of one session: exactly one extension connection holds a session, so a second extension side refuses and the first keeps its slot. */
export function wsbridgeextensionconnect(session: wsbridgesession, now: number): { session?: wsbridgesession; refused?: string } {
  if (session.extensionconnected) return { refused: `The wsbridge session holds one extension connection at a time; the extension side of the session ${session.id} stays taken.` };
  const connected = wsbridgeconnection(session, now);
  return { session: { ...connected, extensionconnected: true } };
}

/** Checks the per session token of one incoming frame: the frame token must match the session token exactly, and a frame without its token refuses before any body reads. */
export function wsbridgeframeauth(session: wsbridgesession, token: string, hashof: (text: string) => string): { ok: boolean; reason?: string } {
  const trimmed = (token ?? "").trim();
  if (trimmed === "") return { ok: false, reason: "The wsbridge frame carries its session token; an anonymous frame refuses at the door." };
  if (hashof(trimmed) !== session.tokenhash) return { ok: false, reason: `The wsbridge frame token fails the session ${session.id} authentication; a wrong token never reaches the body.` };
  return { ok: true };
}

/** Sweeps the idle expiry of one session: a quiet session past its expiry closes while a session without an idle window never expires, and the last frame time slides the window so an active session survives the sweep. */
export function wsbridgeidlesweep(session: wsbridgesession, now: number): { expired: boolean; session: wsbridgesession; reason?: string } {
  if (session.idlewindow === undefined || session.expiresat === undefined) return { expired: false, session };
  if (session.lastframeat !== undefined && session.lastframeat > session.expiresat - session.idlewindow) {
    const slid = { ...session, expiresat: session.lastframeat + session.idlewindow };
    if (now < slid.expiresat) return { expired: false, session: slid };
  }
  if (now >= session.expiresat) return { expired: true, session, reason: `The wsbridge session ${session.id} sat quiet past its ${session.idlewindow} millisecond idle window; the session expired and the token stopped verifying.` };
  return { expired: false, session };
}

/** Wraps one native frame into the servercontract envelope the wsbridge carries: the eventpost operation with the negotiated contract version, the stable operation id and the native frame as the multiplexed stream payload, so the wsbridge frames and the relay frames speak the same envelope shape. */
export function wsbridgeenvelopeof(input: { opid: string; at: number; frame: nativeframe; sessionid?: string; token?: string; version?: number }): ReturnType<typeof composeenvelope> {
  return composeenvelope({ op: "eventpost", opid: input.opid, at: input.at, version: input.version ?? servercontractversion, ...(input.sessionid !== undefined && input.sessionid !== "" ? { sessionid: input.sessionid } : {}), ...(input.token !== undefined && input.token !== "" ? { token: input.token } : {}), body: { kind: "progress", stream: wsbridgestreamname, payload: { frame: input.frame } } });
}

/** Reads the native frame back out of one servercontract envelope: only the eventpost operation of the wsbridge stream unwraps, and every other envelope refuses so a foreign frame never reaches the native transport. */
export function wsbridgeframeof(envelope: { op: string; body?: Record<string, unknown> }): { frame?: nativeframe; reason?: string } {
  if (envelope.op !== "eventpost") return { reason: `The wsbridge envelope carries the eventpost operation; a ${envelope.op} envelope never reaches the native transport.` };
  const body = envelope.body ?? {};
  if (body.stream !== wsbridgestreamname) return { reason: `The wsbridge envelope rides the ${wsbridgestreamname} stream; a ${String(body.stream)} envelope stays outside the native transport.` };
  const frame = body.payload;
  if (frame === undefined || frame === null || typeof frame !== "object" || Array.isArray(frame)) return { reason: "The wsbridge envelope payload carries the native frame object." };
  const candidate = (frame as Record<string, unknown>).frame;
  if (candidate === undefined || candidate === null || typeof candidate !== "object" || Array.isArray(candidate)) return { reason: "The wsbridge envelope payload wraps its native frame under the frame key." };
  const typed = candidate as Record<string, unknown>;
  if (typeof typed.kind !== "string" || typeof typed.correlationid !== "string") return { reason: "The wsbridge native frame carries its kind and its correlation id." };
  return { frame: { kind: typed.kind as nativeframe["kind"], correlationid: typed.correlationid, ...(typeof typed.sessionid === "string" ? { sessionid: typed.sessionid } : {}), ...(typed.body !== undefined && typed.body !== null && typeof typed.body === "object" && !Array.isArray(typed.body) ? { body: typed.body as Record<string, unknown> } : {}) } };
}

/** Builds the advertisement frame the wsbridge sends the extension over the native port: the bound port and the per session token ride the native frame body, the only place the raw token ever appears — the logs, the audit entries and the session records keep its hash only. */
export function wsbridgeadvertiseframe(session: wsbridgesession, token: string, correlationid: string): nativeframe {
  const trimmed = token.trim();
  if (trimmed === "") throw new Error("The wsbridge advertisement carries the per session token; an empty token advertises nothing.");
  return { kind: "advertisement", correlationid, body: { port: session.port, token: trimmed, ...(session.idlewindow !== undefined ? { idlewindow: session.idlewindow } : {}) } };
}

/** Reads the session report the settings panel and the diagnostics command show: the port, the connection counts and the expiry state ride the report while the raw token and its hash stay out, so a logged report never carries session material. */
export function wsbridgereport(session: wsbridgesession, now: number): { id: string; port: number; connections: number; extensionconnected: boolean; expired: boolean; received: number; sent: number } {
  const sweep = wsbridgeidlesweep(session, now);
  return { id: session.id, port: session.port, connections: session.connections, extensionconnected: session.extensionconnected, expired: sweep.expired, received: session.received, sent: session.sent };
}

/** Counts one frame on the session of the direction it travelled: the counters and the idle clock move together so the report and the expiry read the same state. */
export function wsbridgeframecounted(session: wsbridgesession, direction: "received" | "sent", now: number): wsbridgesession {
  const idlewindow = session.idlewindow;
  return { ...session, received: session.received + (direction === "received" ? 1 : 0), sent: session.sent + (direction === "sent" ? 1 : 0), lastframeat: now, ...(idlewindow !== undefined ? { expiresat: now + idlewindow } : {}) };
}

/* ── Merged from nativehost.ts ── */

import { protocolversion, type companionhandshake, type nativecallclass, type nativecallrecord, type nativeerror, type nativehoststate, type nativesurfacekind, type runsettings } from "./types.js";
import { notificationframe } from "./serve.js";
import type { jsonrpcframe } from "./types.js";

/**
 * Nativehost of the 1.1.85 native host bridge family.
 * Every native messaging concern lives in this one pure module: the host manifest template with its generated extension id placeholder, the installer that writes the host manifest into the user profile directory and refuses system wide installs without the explicit flag, the uninstaller that removes the host manifest and its preferences, the runtime native messaging port with its attach, detach, crash and reattach states, the companion handshake with the build and protocol version negotiation and the one major version upgrade window, the capability negotiation that lists the host features and enumerates the native surfaces on connect, the os dialog and notification surfaces behind their own consent grants, the correlation ids one run stamps on every frame, the heartbeat frames that detect host process liveness, the origin and session checks that validate every incoming native frame, the secret exclusion that keeps key vault material out of every frame, the structured errors with their retry hints, the graceful degradation that keeps runs alive when the host is absent or outdated, the per session rate cap accounting, the native call records the audit trail keeps with class and outcome, the native call events that stream to subscribed mcp clients and the diagnostics report of port state, versions and last errors. The module stays pure: the filesystem, the process spawning and the native messaging port itself reach it through injected seams only, every path, window and bound stays a user choice with no code default, the transport stays deny by default until the user installs the host, and no vendor endpoint, no download url and no binary blob ever appears here — the companionbin recipe builds from source with plain node because nothing native runs until the user builds and installs it.
 * Example: `const manifest = nativehostmanifesttemplate({ hostname: "com.example.devthink", companionpath: "/home/user/devthink/dist/companion.js" }); const installed = await installnativehost({ profiledir, hostname: "com.example.devthink", extensionid, companionpath, consent: true, now, io });`
 */

/** The native bridge protocol major version this build speaks: the handshake reports it, the upgrade path keeps compatibility for exactly one major version, and a host that speaks another major version degrades instead of breaking the run. */
export const nativebridgeprotocolmajor = 1;

/** The installer version the installer stamps into the install state; the upgrade path compares it so a manifest written by an older installer reports before it overwrites. */
export const nativehostinstallerversion = protocolversion;

/** The generated extension id placeholder the host manifest template carries: the installer replaces the token with the extension id of the installed build, so the template never pins an identity the user did not generate. */
export const nativehostidplaceholder = "__generated_extension_id__";

/** The native messaging directory name of the chromium user profile: the installer writes the host manifest beside it, never into a system directory without the explicit flag. */
export const nativemessagingdirname = "NativeMessagingHosts";

/** The native surface catalog of the companion process: every surface with its call class and its consent question, so the capability negotiation enumerates what the host offers and the consent gate asks per surface. */
export interface nativesurfacedef {
  surface: nativesurfacekind;
  callclass: nativecallclass;
  description: string;
}

/** The native surfaces the companion process exposes behind consent: the os dialog surface opens a desktop dialog (a sensitive class call because it addresses the user directly) and the notification surface posts a desktop notification (an interaction class call). */
export function nativesurfacecatalog(): nativesurfacedef[] {
  return [
    { surface: "osdialog", callclass: "sensitive", description: "Opens one os dialog on the user desktop; the surface addresses the user directly, so the call class stays sensitive and the surface asks for its own consent grant." },
    { surface: "notification", callclass: "interaction", description: "Posts one os notification on the user desktop; the surface writes outside the browser, so the call class stays interaction and the surface asks for its own consent grant." }
  ];
}

/** The capabilities this side of the native transport declares: the native bridge protocol major version, the surfaces of the catalog and the heartbeat support. */
export function nativehostcapabilities(): { protocol: number; surfaces: nativesurfacekind[]; heartbeat: boolean } {
  return { protocol: nativebridgeprotocolmajor, surfaces: nativesurfacecatalog().map(entry => entry.surface), heartbeat: true };
}

/** Builds the host manifest template: the native messaging host manifest of the companion process with its name, description, stdio type, the companion path the user chose and the allowed origins list that carries the generated extension id placeholder until the installer fills it. */
export function nativehostmanifesttemplate(input: { hostname: string; companionpath: string; extensionid?: string }): { manifest: { name: string; description: string; path: string; type: "stdio"; allowed_origins: string[] }; text: string } {
  const hostname = input.hostname.trim();
  if (hostname === "") throw new Error("The native host manifest names its host; an empty host name never registers.");
  if (!/^[a-z0-9][a-z0-9._-]*$/.test(hostname)) throw new Error(`The native host name ${hostname} stays a plain dns style token; a name with spaces or capitals never registers.`);
  const companionpath = input.companionpath.trim();
  if (companionpath === "") throw new Error("The native host manifest carries the companion path the user chose; an empty path never launches a host.");
  const extensionid = (input.extensionid ?? "").trim();
  const scheme = "chrome-extension:";
  const origin = extensionid === "" ? `${scheme}//${nativehostidplaceholder}/` : `${scheme}//${extensionid}/`;
  const manifest = { name: hostname, description: "The devthink companion process: an optional native host that speaks length prefixed json over stdio and never runs until the user installs it.", path: companionpath, type: "stdio" as const, allowed_origins: [origin] };
  return { manifest, text: `${JSON.stringify(manifest, null, 2)}\n` };
}

/** Trims the trailing path separators of one directory string through a plain character walk, because a trailing slash regex would itself read as polynomial on adversarial paths. */
function trailslashes(value: string): string {
  let end = value.length;
  while (end > 0) { const last = value.charCodeAt(end - 1); if (last !== 0x2f /* / */ && last !== 0x5c /* \ */) break; end -= 1; }
  return value.slice(0, end);
}

/** Computes the destination of one host manifest: the user profile directory carries the manifest under its NativeMessagingHosts folder while a system wide install needs the explicit flag and computes the platform system directory; a missing profile directory with no system wide flag refuses because the installer never guesses a target. */
export function hostmanifestdestination(input: { hostname: string; profiledir?: string; systemwide?: boolean; platform?: "linux" | "macos" | "windows" }): { path: string; systemwide: boolean; refused?: string } {
  const hostname = input.hostname.trim();
  if (hostname === "") return { path: "", systemwide: false, refused: "The host manifest destination names its host; an empty host name never writes." };
  const systemwide = input.systemwide === true;
  const profiledir = (input.profiledir ?? "").trim();
  if (!systemwide && profiledir === "") return { path: "", systemwide: false, refused: "The installer writes the host manifest into the user profile directory; a system wide install needs the explicit flag and the user never gets one silently." };
  if (systemwide) {
    const platform = input.platform ?? "linux";
    const base = platform === "linux" ? "/etc/opt/chrome/native-messaging-hosts" : platform === "macos" ? "/Library/Google/Chrome/NativeMessagingHosts" : "C:\\Program Files\\Google\\Chrome\\Application\\native-messaging-hosts";
    return { path: `${base}/${hostname}.json`, systemwide: true };
  }
  return { path: `${trailslashes(profiledir)}/${nativemessagingdirname}/${hostname}.json`, systemwide: false };
}

/** Writes the host manifest into the user profile directory behind the install consent: the consent stamp must exist before any host registration, the extension id fills the placeholder of the template, a system wide install refuses without its explicit flag and the returned install state records the installer version for the upgrade path. */
export async function installnativehost(input: { profiledir?: string; hostname: string; extensionid: string; companionpath: string; consent: boolean; now: number; systemwide?: boolean; platform?: "linux" | "macos" | "windows"; io: { writefile: (path: string, text: string) => Promise<void>; mkdir: (dir: string) => Promise<void> } }): Promise<{ state: nativehoststate; manifestpath: string; refused?: string }> {
  if (!input.consent) return { state: nativedefaultstate(), manifestpath: "", refused: "The install consent gate explains the scope before any host registration; the installer writes no manifest without the recorded consent." };
  const extensionid = input.extensionid.trim();
  if (extensionid === "") return { state: nativedefaultstate(), manifestpath: "", refused: "The host manifest allows the origins of one extension id; an empty id never registers a host." };
  if (input.systemwide === true && (input.profiledir ?? "").trim() !== "") return { state: nativedefaultstate(), manifestpath: "", refused: "The install targets either the user profile directory or, with the explicit flag, the system directory; never both at once." };
  const destination = hostmanifestdestination({ hostname: input.hostname, ...(input.profiledir !== undefined ? { profiledir: input.profiledir } : {}), ...(input.systemwide !== undefined ? { systemwide: input.systemwide } : {}), ...(input.platform !== undefined ? { platform: input.platform } : {}) });
  if (destination.refused !== undefined) return { state: nativedefaultstate(), manifestpath: "", refused: destination.refused };
  const template = nativehostmanifesttemplate({ hostname: input.hostname, companionpath: input.companionpath, extensionid });
  const dir = destination.path.slice(0, destination.path.lastIndexOf("/"));
  await input.io.mkdir(dir);
  await input.io.writefile(destination.path, template.text);
  const state: nativehoststate = { installed: true, hostname: template.manifest.name, extensionid, installerversion: nativehostinstallerversion, port: "detached", installedat: input.now, updatedat: input.now, lasterrors: [] };
  return { state, manifestpath: destination.path };
}

/** Removes the host manifest and its preferences: the uninstaller deletes the manifest of the user profile directory (or, with the explicit flag, the system directory), clears the recorded install state and returns the deny by default posture the extension keeps afterwards. */
export async function uninstallnativehost(input: { profiledir?: string; hostname: string; now: number; systemwide?: boolean; platform?: "linux" | "macos" | "windows"; io: { removefile: (path: string) => Promise<void>; exists: (path: string) => Promise<boolean> } }): Promise<{ state: nativehoststate; manifestpath: string; removed: boolean; refused?: string }> {
  const destination = hostmanifestdestination({ hostname: input.hostname, ...(input.profiledir !== undefined ? { profiledir: input.profiledir } : {}), ...(input.systemwide !== undefined ? { systemwide: input.systemwide } : {}), ...(input.platform !== undefined ? { platform: input.platform } : {}) });
  if (destination.refused !== undefined) return { state: nativedefaultstate(), manifestpath: "", removed: false, refused: destination.refused };
  const present = await input.io.exists(destination.path);
  if (present) await input.io.removefile(destination.path);
  return { state: nativedefaultstate(), manifestpath: destination.path, removed: present };
}

/** The deny by default state of the native transport: no host installed, no port attached and no versions recorded, so the transport stays disabled until the user installs the host. */
export function nativedefaultstate(): nativehoststate {
  return { installed: false, port: "detached", lasterrors: [] };
}

/** Reads the native transport choices of one settings record: the consent stamps, the class and surface grants, the idle window, the heartbeat interval and the rate cap with its window — every bound the user set with no code default beside it. */
export function nativechoices(settings: runsettings | undefined): { nativeinstallconsent?: boolean; nativetransportconsent?: boolean; nativecallclassconsents?: nativecallclass[]; nativesurfaceconsents?: nativesurfacekind[]; nativeidlewindow?: number; nativeheartbeatinterval?: number; nativecallratelimit?: number; nativecallratewindow?: number } {
  const current = settings ?? {};
  return { ...(current.nativeinstallconsent !== undefined ? { nativeinstallconsent: current.nativeinstallconsent } : {}), ...(current.nativetransportconsent !== undefined ? { nativetransportconsent: current.nativetransportconsent } : {}), ...(current.nativecallclassconsents !== undefined ? { nativecallclassconsents: current.nativecallclassconsents } : {}), ...(current.nativesurfaceconsents !== undefined ? { nativesurfaceconsents: current.nativesurfaceconsents } : {}), ...(current.nativeidlewindow !== undefined ? { nativeidlewindow: current.nativeidlewindow } : {}), ...(current.nativeheartbeatinterval !== undefined ? { nativeheartbeatinterval: current.nativeheartbeatinterval } : {}), ...(current.nativecallratelimit !== undefined ? { nativecallratelimit: current.nativecallratelimit } : {}), ...(current.nativecallratewindow !== undefined ? { nativecallratewindow: current.nativecallratewindow } : {}) };
}

/** True when the native transport may attach at all: the host must sit installed and the user must hold the transport consent, because the deny by default posture keeps the bridge disabled until both hold. */
export function nativetransportenabled(state: nativehoststate | undefined, settings: runsettings | undefined): boolean {
  return (state?.installed ?? false) && settings?.nativetransportconsent === true;
}

/** Builds the correlation id one run stamps on every native frame: the sender seed and the per run sequence compose an id that stays unique across a whole run without any randomness on the wire. */
export function nativecorrelationid(seed: string, sequence: number): string {
  const trimmed = seed.trim();
  if (trimmed === "") throw new Error("The correlation id names its sender seed; an empty seed never correlates a frame.");
  if (!Number.isInteger(sequence) || sequence < 1) throw new Error("The correlation id sequence stays a positive whole number per run.");
  return `run-${trimmed}-${sequence}`;
}

/** Builds one native frame of the transport: the kind, the correlation id of the run and the body ride the frame the servercontract envelopes carry. */
export function nativeframeof(kind: nativeframe["kind"], correlationid: string, body?: Record<string, unknown>, sessionid?: string): nativeframe {
  const trimmed = correlationid.trim();
  if (trimmed === "") throw new Error("The native frame carries its correlation id; an empty id never correlates a frame.");
  return { kind, correlationid: trimmed, ...(sessionid !== undefined && sessionid !== "" ? { sessionid } : {}), ...(body !== undefined ? { body } : {}) };
}

/** Builds the handshake request frame the extension sends on attach: the protocol major version of this build rides the body so the companion answers with its own build and protocol version. */
export function companionhandshakeframe(correlationid: string): nativeframe {
  return nativeframeof("handshake", correlationid, { protocol: nativebridgeprotocolmajor });
}

/** Parses the handshake answer of the companion process: the build version, the protocol major version, the surfaces and the wsbridge port validate their shapes, and a malformed handshake answers the structured error instead of a bare throw. */
export function parsecompanionhandshake(frame: nativeframe, now: number): { handshake?: companionhandshake; error?: nativeerror } {
  if (frame.kind !== "handshake") return { error: nativeerrorof("handshake", `The handshake answer carries the handshake kind; a ${frame.kind} frame never completes a handshake.`, "reconnect", now) };
  const body = frame.body ?? {};
  const build = typeof body.build === "string" ? body.build.trim() : "";
  if (build === "") return { error: nativeerrorof("handshake", "The handshake answer carries the companion build version; an empty version never attaches.", "reconnect", now) };
  const protocol = typeof body.protocol === "number" ? body.protocol : Number.parseInt(String(body.protocol ?? ""), 10);
  if (!Number.isInteger(protocol) || protocol < 1) return { error: nativeerrorof("handshake", "The handshake answer carries its native bridge protocol version as a positive whole number.", "reconnect", now) };
  const surfaces = Array.isArray(body.surfaces) ? body.surfaces.filter((surface): surface is nativesurfacekind => surface === "osdialog" || surface === "notification") : [];
  const wsbridgeport = typeof body.wsbridgeport === "number" ? body.wsbridgeport : 0;
  if (!Number.isInteger(wsbridgeport) || wsbridgeport < 0) return { error: nativeerrorof("handshake", "The handshake answer carries the wsbridge port as a whole number; zero keeps the bridge down.", "reconnect", now) };
  return { handshake: { build, protocol: String(protocol), surfaces, wsbridgeport } };
}

/** Reads the major version of one protocol version string: the digits before the first separator stay the major version the upgrade window compares. */
export function nativemajorversion(protocol: string | number): number {
  const value = typeof protocol === "number" ? String(protocol) : protocol.trim();
  const major = Number.parseInt(value.split(/[.\s]/)[0] ?? "", 10);
  return Number.isInteger(major) && major >= 1 ? major : 0;
}

/** Checks the protocol compatibility of the upgrade path: a host keeps compatibility for exactly one major version, so a companion of the same major version attaches whatever its build says while a host of another major version degrades instead of breaking the run. */
export function nativeprotocolcompatible(ours: string | number, theirs: string | number): { ok: boolean; ours: number; theirs: number } {
  const ourmajor = nativemajorversion(ours);
  const theirmajor = nativemajorversion(theirs);
  return { ok: ourmajor === theirmajor && ourmajor >= 1, ours: ourmajor, theirs: theirmajor };
}

/** Negotiates the native capabilities on connect: the protocol version takes the upgrade window, the surfaces intersect in the stable catalog order and the heartbeat support needs both sides, so the negotiation lists exactly the host features the run may use. */
export function negotiatenativecapabilities(input: { ours?: { protocol: number; surfaces: nativesurfacekind[]; heartbeat: boolean }; theirs: { protocol: string | number; surfaces: nativesurfacekind[]; heartbeat?: boolean } }): { ok: boolean; protocol: number; surfaces: nativesurfacekind[]; heartbeat: boolean; reason?: string } {
  const ours = input.ours ?? nativehostcapabilities();
  const compat = nativeprotocolcompatible(ours.protocol, input.theirs.protocol);
  if (!compat.ok) return { ok: false, protocol: 0, surfaces: [], heartbeat: false, reason: `The companion speaks the native bridge protocol major version ${compat.theirs} while this build speaks ${compat.ours}; the upgrade path keeps compatibility for one major version and the run degrades with the transport off.` };
  const order = nativesurfacecatalog().map(entry => entry.surface);
  const surfaces = order.filter(surface => input.theirs.surfaces.includes(surface));
  return { ok: true, protocol: compat.ours, surfaces, heartbeat: ours.heartbeat && input.theirs.heartbeat === true };
}

/** Attaches the runtime native messaging port to a healthy host: the handshake answer fills the companion version, the protocol version and the wsbridge port while the port state moves to attached. */
export function attachnativehost(state: nativehoststate, handshake: companionhandshake, now: number): nativehoststate {
  return { ...state, installed: true, port: "attached", companionversion: handshake.build, companionprotocol: handshake.protocol, wsbridgeport: handshake.wsbridgeport, attachedat: now, updatedat: now };
}

/** Marks the native port crashed: the host process died under the extension, the state keeps the install facts and the run stays alive with the transport off until the reattach. */
export function crashnativehost(state: nativehoststate, now: number): nativehoststate {
  return { ...state, port: "crashed", updatedat: now, lasterrors: [nativeerrorof("port", "The companion process crashed under the native port; the run stays alive and the extension reattaches on the next host start.", "reconnect", now), ...(state.lasterrors ?? [])].slice(0, 10) };
}

/** Reattaches the native port after a crash or a restart: the fresh handshake answer fills the versions and the port while the state keeps the crash history for the diagnostics report. */
export function reattachnativehost(state: nativehoststate, handshake: companionhandshake, now: number): nativehoststate {
  return { ...attachnativehost(state, handshake, now), updatedat: now };
}

/** Detaches the native port on demand: the user closed the transport, the port state returns to detached and the install facts stay for the next attach. */
export function detachnativehost(state: nativehoststate, now: number): nativehoststate {
  return { ...state, port: "detached", updatedat: now };
}

/** Builds one heartbeat frame of the liveness check: the correlation id of the run and the timestamp ride the body so both sides detect a silent peer. */
export function nativeheartbeatframe(correlationid: string, now: number): nativeframe {
  return nativeframeof("heartbeat", correlationid, { at: now });
}

/** Checks the host process liveness from the heartbeat timestamps: a last heartbeat older than the user configured interval marks the host silent while an absent interval never expires the check because the cadence stays a user choice. */
export function nativeportliveness(input: { lastheartbeatat?: number; now: number; interval?: number }): { alive: boolean; reason?: string } {
  if (input.interval === undefined) return { alive: true, reason: "The heartbeat interval stays unset; the liveness check never expires a host without the user configured cadence." };
  if (input.lastheartbeatat === undefined) return { alive: false, reason: "The native port heard no heartbeat yet; the host stays silent under the configured interval." };
  if (input.now - input.lastheartbeatat > input.interval) return { alive: false, reason: `The last heartbeat sits ${input.now - input.lastheartbeatat} milliseconds back, past the ${input.interval} millisecond interval; the host process stays silent and the extension reattaches on its restart.` };
  return { alive: true };
}

/** Validates one incoming native frame with the origin and session checks: the correlation id stays present, the frame session matches the session the transport paired with and an anonymous frame refuses, so a frame of another session never reaches the engine. */
export function nativeframecheck(frame: nativeframe, sessionid: string): { allowed: boolean; reason?: string } {
  if (frame.correlationid.trim() === "") return { allowed: false, reason: "The native frame carries its correlation id; an anonymous frame never reaches the engine." };
  if (sessionid.trim() === "") return { allowed: false, reason: "The native transport pairs its frames with the session id; a transport without a session never accepts a frame." };
  if (frame.sessionid !== undefined && frame.sessionid !== sessionid) return { allowed: false, reason: `The native frame session ${frame.sessionid} sits outside the paired session ${sessionid}; the origin and session checks refuse the frame.` };
  return { allowed: true };
}

/** The field keys key vault material hides behind: a native frame body of this shape never crosses the port because the native host never receives key vault material. */
export const nativesecretkeys: string[] = ["apikey", "api_key", "key", "token", "secret", "password", "authorization", "credential", "privatekey"];

/** Checks one native frame body for key vault material: a body key of the secret shape refuses the whole frame, so the native host never receives key material and the wsbridge token never rides a call frame. */
export function nativesecretexclusion(frame: nativeframe): { ok: boolean; held: string[] } {
  const body = frame.body ?? {};
  const held = Object.keys(body).filter(key => nativesecretkeys.includes(key.toLowerCase().replaceAll(" ", "").replaceAll("-", "")));
  return { ok: held.length === 0, held };
}

/** Redacts one native frame for the logs and the audit entries: the secret shaped keys and the token field drop, so a recorded frame carries its shape and its outcome but never its key material. */
export function redactnativeframe(frame: nativeframe): nativeframe {
  const body = frame.body ?? {};
  const redacted: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body)) if (!nativesecretkeys.includes(key.toLowerCase().replaceAll(" ", "").replaceAll("-", ""))) redacted[key] = value;
  return { ...frame, body: redacted };
}

/** Builds one structured native error with its retry hint: the family names where the failure belongs and the retry hint maps the failure to its next action. */
export function nativeerrorof(family: nativeerror["family"], message: string, retry: nativeerror["retry"], now: number): nativeerror {
  return { family, message, retry, at: now };
}

/** Maps one native failure to its retry hint: a handshake or port failure reconnects, an installer failure reinstalls and the rest never retry, so the caller reads the next action from the error itself. */
export function nativefailureof(error: nativeerror): { retryhint: "retry" | "wait" | "none"; reason: string } {
  const retryhint = error.retry === "reconnect" ? "retry" : error.retry === "reinstall" ? "wait" : "none";
  return { retryhint, reason: `${error.family} failure: ${error.message}` };
}

/** Reads the graceful degradation posture of the native transport: an absent host (nothing installed) or an outdated host (another protocol major version) keeps the run alive with the transport off, because the engine degrades instead of failing the run. */
export function nativedegradationof(input: { state: nativehoststate | undefined; negotiated?: { ok: boolean; reason?: string } }): { degraded: boolean; reason: string } {
  if ((input.state?.installed ?? false) === false) return { degraded: true, reason: "The native host stays absent: nothing installed, the transport disabled and the run alive with every step inside the browser." };
  if (input.negotiated !== undefined && !input.negotiated.ok) return { degraded: true, reason: input.negotiated.reason ?? "The native host speaks another native bridge protocol major version; the run stays alive with the transport off." };
  if (input.state?.port === "crashed") return { degraded: true, reason: "The native host crashed under the port; the run stays alive and waits for the reattach on the host restart." };
  return { degraded: false, reason: "The native host sits attached with a negotiated capability set; the transport carries the consented call classes." };
}

/** Checks the per session rate cap of the native transport: the calls of the window count against the user configured cap, an absent cap keeps the transport unbounded and the window slides from the newest call. */
export function nativeratecheck(input: { calls: nativecallrecord[]; cap?: number; window?: number; now: number }): { allowed: boolean; used: number; cap?: number; reason?: string } {
  if (input.cap === undefined) return { allowed: true, used: input.calls.length };
  if (!Number.isFinite(input.cap) || input.cap < 1) return { allowed: false, used: input.calls.length, cap: input.cap, reason: `The native transport rate cap of ${String(input.cap)} stays a finite positive count.` };
  const window = input.window ?? Number.POSITIVE_INFINITY;
  const used = input.calls.filter(record => window === Number.POSITIVE_INFINITY || input.now - record.at <= window).length;
  if (used >= input.cap) return { allowed: false, used, cap: input.cap, reason: `The native transport hit its ${input.cap} call cap with ${used} calls inside the window; the cap stays the user's choice and the session waits.` };
  return { allowed: true, used, cap: input.cap };
}

/** Builds one native call record of the audit trail: the correlation id of the run, the surface, the call class and the outcome with its refusal reason — the record never carries payload bytes. */
export function nativecallrecordof(input: { id: string; correlationid: string; surface: string; callclass: nativecallclass; outcome: nativecallrecord["outcome"]; reason?: string; now: number }): nativecallrecord {
  return { id: input.id, correlationid: input.correlationid, surface: input.surface, callclass: input.callclass, outcome: input.outcome, ...(input.reason !== undefined && input.reason !== "" ? { reason: input.reason } : {}), at: input.now };
}

/** Stores one native call record at the head of the audit list; a repeated record id replaces the earlier entry so the trail keeps one record per call. */
export function recordnativecall(records: nativecallrecord[], record: nativecallrecord): nativecallrecord[] {
  return [record, ...records.filter(candidate => candidate.id !== record.id)];
}

/** Builds the native call event that streams to subscribed mcp clients: the surface, the class and the outcome ride one notification frame without any payload, so a subscribed client follows the native transport without seeing call bodies. */
export function nativecallevent(record: nativecallrecord): jsonrpcframe {
  return notificationframe("native/call", { surface: record.surface, callclass: record.callclass, outcome: record.outcome, correlationid: record.correlationid, at: record.at });
}

/** Reads the consent grant of one native surface: the surface needs its own grant stamp because a class grant never widens into a desktop surface, and an unknown surface never grants. */
export function nativesurfacegrant(surface: string, settings: runsettings | undefined): { allowed: boolean; reason: string } {
  const known = nativesurfacecatalog().find(entry => entry.surface === surface);
  if (known === undefined) return { allowed: false, reason: `The native surface ${surface} sits outside the surface catalog; an unknown surface never grants.` };
  if ((settings?.nativesurfaceconsents ?? []).includes(known.surface)) return { allowed: true, reason: `The user granted the ${known.surface} surface its own consent stamp; the surface runs behind the class gate too.` };
  return { allowed: false, reason: `The native surface ${known.surface} holds no consent grant; a desktop surface never opens from a class grant alone.` };
}

/** Reads the call class consent of one native call: read, interaction and sensitive stay separate grants so every class asks on its own. */
export function nativeclassgrant(callclass: nativecallclass, settings: runsettings | undefined): { allowed: boolean; reason: string } {
  if ((settings?.nativecallclassconsents ?? []).includes(callclass)) return { allowed: true, reason: `The user consented to the ${callclass} call class over the native transport.` };
  return { allowed: false, reason: `The ${callclass} call class holds no consent grant over the native transport; the gate asks per class and never widens a read grant.` };
}

/** Shapes one native surface result for the plan engine: the surface, the call class and the structured details compose the step outcome the plan engine records, with the secret exclusion applied to the details. */
export function nativesurfaceresult(input: { surface: string; callclass: nativecallclass; details: Record<string, unknown>; now: number }): { surface: string; callclass: nativecallclass; details: Record<string, unknown>; at: number } {
  const catalog = nativesurfacecatalog().find(entry => entry.surface === input.surface);
  const callclass = catalog?.callclass ?? input.callclass;
  const held = Object.keys(input.details).filter(key => nativesecretkeys.includes(key.toLowerCase().replaceAll(" ", "").replaceAll("-", "")));
  const details = { ...input.details };
  for (const key of held) delete details[key];
  return { surface: input.surface, callclass, details, at: input.now };
}

/** Builds the diagnostics report of the native transport: the port state, the install versions, the installer version, the wsbridge port, the degradation posture, the consent grants and the last errors one line each, so the settings panel and the cli native command read the same report. */
export function nativediagnostics(input: { state: nativehoststate | undefined; settings?: runsettings | undefined; sessions?: wsbridgesession[] | undefined; negotiated?: { ok: boolean; reason?: string } | undefined; now: number }): { installed: boolean; port: string; hostname?: string; extensionid?: string; installerversion?: string; companionversion?: string; companionprotocol?: string; wsbridgeport?: number; nativebridgeprotocol: number; degraded: { degraded: boolean; reason: string }; transportconsent: boolean; classconsents: nativecallclass[]; surfaceconsents: nativesurfacekind[]; sessions: Array<{ port: number; connections: number; expired: boolean }>; lasterrors: nativeerror[] } {
  const state = input.state ?? nativedefaultstate();
  const settings = input.settings;
  const sessions = (input.sessions ?? []).map(session => ({ port: session.port, connections: session.connections, expired: session.expiresat !== undefined && session.expiresat <= input.now }));
  return {
    installed: state.installed,
    port: state.port,
    ...(state.hostname !== undefined ? { hostname: state.hostname } : {}),
    ...(state.extensionid !== undefined ? { extensionid: state.extensionid } : {}),
    ...(state.installerversion !== undefined ? { installerversion: state.installerversion } : {}),
    ...(state.companionversion !== undefined ? { companionversion: state.companionversion } : {}),
    ...(state.companionprotocol !== undefined ? { companionprotocol: state.companionprotocol } : {}),
    ...(state.wsbridgeport !== undefined ? { wsbridgeport: state.wsbridgeport } : {}),
    nativebridgeprotocol: nativebridgeprotocolmajor,
    degraded: nativedegradationof({ state, ...(input.negotiated !== undefined ? { negotiated: input.negotiated } : {}) }),
    transportconsent: settings?.nativetransportconsent === true,
    classconsents: settings?.nativecallclassconsents ?? [],
    surfaceconsents: settings?.nativesurfaceconsents ?? [],
    sessions,
    lasterrors: state.lasterrors ?? []
  };
}
