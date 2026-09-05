/**
 * The bridge module of the 1.1.90 consolidation: every correlated variation of the bridge logic interned in this one file, so the module family carries one surface without duplicate variations.
 * The correlation is the bridge chain from the wire contract outward to the native host: servercontract holds the wire contract the static site and the extension speak (the versioned envelope with its stable operation ids, the capability negotiation, the session and event operation bodies with their schema validation and the payload minimization that keeps page content on the device without the explicit consent flag); socketrelay holds the site relay client (the wss connection through an injected socket seam, the frame authentication, the reconnect backoff with token rotation, the multiplexed streams, the offline queue with operation id deduplication, the heartbeat frames and the idle expiry); chatbridge holds the chat surface of the site (the chat rows, the plan review cards, the review decisions and the pairing panel, render and collect only, never execute); wsbridge holds the localhost native relay (the loopback bind check, the per session token with its hash only records, the one extension connection rule and the envelope translation that reuses the servercontract shapes); and nativehost holds the native host itself (the manifest installer and uninstaller, the runtime port lifecycle with its attach, crash and reattach states, the companion handshake with its one major version window, the surface catalog behind consent, the correlation ids, the heartbeats, the origin and session checks, the secret exclusion and the graceful degradation).
 * No relay url, host, vendor endpoint, port, window or cap is ever hardcoded anywhere in the family: the relay url stays the user's setting, the wsbridge binds localhost only, the raw session token never enters a log or audit entry, and no bridge path ever bypasses the human review.
 */
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
export declare const serveroperations: serveroperation[];
/** The event types the bridge carries, in the stable order the capability intersection keeps. */
export declare const servereventtypes: servereventtype[];
/** The field keys page content hides behind: a payload key of this shape never crosses the bridge unless the explicit page consent flag is set, so plan text and statuses stay the default payload. */
export declare const pagecontentkeys: string[];
/** The capabilities this side of the servercontract declares: every operation, every event type, heartbeat frames and stream multiplexing over one socket. */
export declare function contractcapabilities(version?: number): servercontractcapabilities;
/** Builds the stable operation id one reply correlates: the sender seed and the per sender sequence compose an id that stays unique inside one session without any randomness on the wire. */
export declare function stableopid(seed: string, sequence: number): string;
/** Negotiates the shared contract of the two handshake sides: the version is the newest both sides speak, the operations and event types are the intersection in the stable contract order, and a handshake with no shared version, no shared operation or no shared event type refuses instead of degrading silently. */
export declare function negotiatecapabilities(ours: servercontractcapabilities, theirs: servercontractcapabilities): {
    ok: boolean;
    version: number;
    operations: serveroperation[];
    events: servereventtype[];
    heartbeat: boolean;
    multiplex: boolean;
    reason?: string;
};
/** Composes one servercontract envelope: the version defaults to this build's contract version, the operation id stays exactly the caller's stable id and the body rides as reviewed json. */
export declare function composeenvelope(input: {
    op: serveroperation;
    opid: string;
    at: number;
    version?: number;
    sessionid?: string;
    token?: string;
    body?: Record<string, unknown>;
}): serverenvelope;
/** Parses one unknown value into a servercontract envelope with full schema validation: the value must be an object, the version a positive whole number, the operation one of the four wire operations, the operation id a non-empty string, the session id and token non-empty strings when present, the timestamp a finite number and the body a json object when present; every failure rejects the envelope with the field that named it. */
export declare function parseenvelope(value: unknown): serverenvelope;
/** Reads one envelope acceptance without throwing: the accepted envelope returns with ok true while every schema failure returns the rejection reason the wire logs correlate. */
export declare function envelopeacceptance(value: unknown): {
    ok: boolean;
    envelope?: serverenvelope;
    reason?: string;
};
/** Builds the sessioncreate body: the member role, the member id and the capabilities the joining side declares, so the relay answers the session id and the negotiated contract. */
export declare function sessioncreatebody(input: {
    role: "extension" | "site";
    memberid: string;
    capabilities: servercontractcapabilities;
    pairingcode?: string;
}): Record<string, unknown>;
/** Builds the sessionjoin body: the session the member joins (empty when the pairing code alone identifies the session), the member role and id, the declared capabilities and the pairing code the site side exchanges for its session token. */
export declare function sessionjoinbody(input: {
    sessionid?: string;
    role: "extension" | "site";
    memberid: string;
    capabilities: servercontractcapabilities;
    pairingcode?: string;
}): Record<string, unknown>;
/** Builds the eventpost body: the event type, the multiplexed stream name and the minimized payload; the event type must be one of the four wire event types and the stream a non-empty name. */
export declare function eventpostbody(input: {
    event: {
        kind: servereventtype;
        stream: string;
        payload: Record<string, unknown>;
    };
}): Record<string, unknown>;
/** Builds the eventstream body: the multiplexed streams one side subscribes to and the optional timestamp the subscription resumes after. */
export declare function eventstreambody(input: {
    streams: string[];
    since?: number;
}): Record<string, unknown>;
/** Builds the chat event payload: the task text the human typed and the sender name; the chat text is the reviewed task text itself, never captured page content. */
export declare function chateventpayload(input: {
    text: string;
    from: string;
}): Record<string, unknown>;
/** Builds the plan proposal event payload from the review card: the proposal id, the plan title and the step digest with kinds, origins and sensitive flags — plan text and statuses only, so no page content rides the proposal. */
export declare function planproposaleventpayload(card: bridgereviewcard): Record<string, unknown>;
/** Builds the plan review event payload from the returned decision: the proposal id, the decision, the reviewer and the optional note. */
export declare function planrevieweventpayload(decision: bridgereviewdecision): Record<string, unknown>;
/** Builds the progress event payload: the step id and its status word — statuses only, so the run progress never carries observation bytes. */
export declare function progresseventpayload(input: {
    stepid: string;
    status: string;
}): Record<string, unknown>;
/** Builds the heartbeat event the bridge socket keeps alive with: a progress event on the heartbeat stream, so the four wire operations and event types stay complete with no extra kind. */
export declare function heartbeatevent(now: number): {
    kind: servereventtype;
    stream: string;
    payload: Record<string, unknown>;
};
/** Minimizes one payload for the bridge: the chat task text rides as the human typed it while every other event keeps plan text and statuses only — a page content key never crosses the bridge unless the explicit page consent flag is set, and the strip report names every field the minimization held. */
export declare function bridgepayload(kind: servereventtype, payload: Record<string, unknown>, pageconsent?: boolean): {
    payload: Record<string, unknown>;
    held: string[];
};
/** Reduces one approved plan to its bridge digest: the objective text and every step with its kind and status word — the plan text and statuses the review needs, never the observation bytes the steps read. */
export declare function minimalplandigest(plan: agentplan, statuses?: Record<string, string>): {
    title: string;
    steps: Array<{
        id: string;
        kind: string;
        status: string;
    }>;
};
/** Serializes one envelope to its wire frame: plain json text, one frame per message, no binary codec. */
export declare function frameof(envelope: serverenvelope): string;
/** Parses one wire frame back into a validated envelope: the frame must be json text that passes the envelope schema validation. */
export declare function parsewireframe(text: string): serverenvelope;
/** Builds the site manifest the static site declares: the name, the servercontract version the site speaks and the capabilities it offers, so the extension reads the contract version before the first frame. */
export declare function sitemanifestof(version?: number): {
    name: string;
    servercontract: number;
    capabilities: servercontractcapabilities;
};
import type { bridgeeventrecord, bridgequeuerecord } from "./types.js";
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
    rate: {
        used: number;
        windowstartedat: number;
    };
    sequence: number;
    lasterror?: string;
    openedat?: number;
    closedat?: number;
}
/** Resolves the origin of one relay url: a wss url maps onto its https origin and a ws url onto its http origin so the origin scoping of the sharedauth tokens covers both; an unparsable url resolves to the empty origin the gates refuse. */
export declare function relayorigin(url: string): string;
/** Creates the client state of one bridge socket: the url is the caller's user setting (an empty url leaves the bridge disabled), the session and token start empty until the pairing exchange fills them and every counter starts at zero. */
export declare function newrelayclient(input: {
    url: string;
    memberid: string;
    role: "extension" | "site";
    capabilities: servercontractcapabilities;
    sessionid?: string;
    token?: string;
    now: number;
}): relayclientstate;
/** Verifies the frame authentication of one incoming envelope: the frame carries the session id and the token of the live client state, so a frame of another session or another token never passes. */
export declare function verifyframeauth(envelope: serverenvelope, state: relayclientstate): boolean;
/** Stamps the frame authentication on one outgoing envelope: the session id and the session token ride every frame the client sends. */
export declare function frameauth(envelope: serverenvelope, state: relayclientstate): serverenvelope;
/** Reads the per session rate window: the window resets once it ages out, the used count grows with every accepted frame and a cap the user chose refuses the frame that crosses it while an absent cap keeps the bridge unbounded as the documented user choice. */
export declare function bridgeframerate(input: {
    rate: {
        used: number;
        windowstartedat: number;
    };
    cap?: number;
    window?: number;
    now: number;
}): {
    allowed: boolean;
    used: number;
    windowstartedat: number;
    resetsat?: number;
};
/** Sends one envelope through the open socket: the frame authentication stamps the session and token, the sent counter and the frame clock advance, and the wire frame is the plain json text of the servercontract codec. */
export declare function sendframe(state: relayclientstate, socket: relaysocket, envelope: serverenvelope, now: number): {
    state: relayclientstate;
    sent: boolean;
    reason?: string;
};
/** Receives one wire frame: the frame parses through the servercontract schema validation, the frame authentication must match the live session and token, the multiplexed streams collect every eventpost by its stream name while the correlation acks collect the operation replies, and a rejected frame returns its reason without touching the stream state. */
export declare function receiveframe(state: relayclientstate, frame: string, now: number): {
    state: relayclientstate;
    envelope?: serverenvelope;
    rejection?: string;
};
/** Buffers one frame body into the offline queue while the socket is down: the stable operation id deduplicates the buffer, so the same review request queued twice replays once. */
export declare function enqueuebridge(state: relayclientstate, input: {
    op: serveroperation;
    opid: string;
    body: Record<string, unknown>;
    now: number;
}): relayclientstate;
/** Replays the offline queue over the reconnected socket: every unsent frame sends once with its stable operation id, the replay deduplicates by operation id, the attempts grow and the send time records; the queue keeps the sent records for the audit trail. */
export declare function replaybridgequeue(state: relayclientstate, socket: relaysocket, now: number): {
    state: relayclientstate;
    replayed: number;
    deduped: number;
};
/** Posts one bridge event: a connected socket sends the eventpost frame inside the rate window while a down socket buffers the frame into the offline queue, so no event drops and no frame crosses an exhausted window. */
export declare function postevent(state: relayclientstate, socket: relaysocket | undefined, event: {
    kind: bridgeeventrecord["kind"];
    stream: string;
    payload: Record<string, unknown>;
}, now: number, rate?: {
    cap?: number;
    window?: number;
}): {
    state: relayclientstate;
    sent: boolean;
    queued: boolean;
    reason?: string;
};
/** Sends one heartbeat frame when the user configured interval elapsed: the heartbeat is a progress event on the heartbeat stream, so the socket stays alive inside the four wire operations without a new kind. */
export declare function heartbeattick(state: relayclientstate, socket: relaysocket | undefined, now: number, interval?: number): {
    state: relayclientstate;
    beat: boolean;
};
/** Reads whether the bridge session expired inside the user configured idle window: a session quiet past the window expires while an absent window never expires a session because the bound stays a user choice. */
export declare function idleexpired(state: relayclientstate, now: number, idlewindow?: number): boolean;
/** Closes the bridge socket state: the close records its time and reason, the lifecycle lands on closed and every counter stays for the audit trail. */
export declare function disconnectrelay(state: relayclientstate, now: number, reason?: string): relayclientstate;
/** Reads the popup bridge status of one client state: disabled when no relay url is configured, connected while the socket is live, paired when the pairing exchange holds a session token and offline while a configured bridge has no live socket. */
export declare function bridgestatusview(state: relayclientstate): {
    status: "connected" | "paired" | "offline" | "disabled";
    paired: boolean;
    queued: number;
};
/**
 * Connects the bridge socket through the injected socket seam: the open resolves to a live socket, the client sends its first frame — a sessioncreate with the pairing code when no session exists yet, a sessionjoin with the session id on every reconnect — with the session token as the frame authentication and waits for the reply that quotes the operation id, the negotiated capabilities land on the state and a reply that carries a fresh token rotates the frame authentication. A failed open waits the exponential backoff of the reviewed socketbus family — the rotation seam supplies a fresh token for every retry — until the attempt budget exhausts and the state closes with the last error class.
 */
export declare function connectrelay(input: {
    state: relayclientstate;
    open: socketopen;
    pairingcode?: string;
    attempts?: number;
    backoffbase?: number;
    backoffceiling?: number;
    rotate?: tokenrotation;
    sleep?: relaysleep;
    now?: () => number;
}): Promise<{
    state: relayclientstate;
    socket?: relaysocket;
    error?: string;
}>;
import { pairingcountdown } from "./auth.js";
/**
 * Chatbridge of the 1.1.82 site integration family.
 * Every render and decision rule of the site conversation surface lives in this one pure module: the chat rows the widget renders from the bridge events, the plan review cards the plan proposal events become, the review decisions the cards collect and return to the extension review gate, and the pairing panel the options countdown renders. The widget renders and collects only — it never executes an action, never holds a socket and never touches a page: the extension stays the only executor, a sensitive step approves only through the extension approval flow, and every payload the widget builds rides the data minimization of the servercontract so plan text and statuses cross while page content stays on the device without the explicit consent flag.
 * Example: `const cards = reviewcardsof(events); const decision = carddecision(cards[0], "approved", "site user", now); const outcome = reviewgateoutcome(decision);`
 */
/** Reads the chat rows the widget renders: every chat event becomes one row with its sender, its task text, the mine flag of the member that typed it and its timestamp; non chat events never render as chat. */
export declare function chatrowsof(events: bridgeeventrecord[], memberid: string): Array<{
    from: string;
    text: string;
    mine: boolean;
    at: number;
}>;
/** Reads the plan review cards the widget renders: every plan proposal event becomes one card with its proposal id, its plan title and its step digest; the card renders the review surface only and collects the decision. */
export declare function reviewcardsof(events: bridgeeventrecord[]): bridgereviewcard[];
/** Collects one review decision from a rendered card: the decision carries the proposal id, the verdict, the reviewer and the optional note; the card never executes anything and the decision never names an action, only the review verdict. */
export declare function carddecision(card: bridgereviewcard, decision: bridgereviewdecision["decision"], by: string, now: number, note?: string): bridgereviewdecision;
/** Builds the wire payload of one review decision: the plan review event payload the servercontract validates, so the decision crosses the bridge as plan text only. */
export declare function decisionpayload(decision: bridgereviewdecision): Record<string, unknown>;
/** Reads the extension review gate outcome of one bridge decision: an approved decision resolves the gate as approved while a changes or refused decision returns the proposal to the review surface — the outcome is a resolution request only, the extension approval flow stays the only executor of any step. */
export declare function reviewgateoutcome(decision: bridgereviewdecision): {
    state: "approved" | "refused";
    reason: string;
};
/** Builds the task text event the site sends through the relay: the chat event payload of the servercontract, so the human typed task text crosses as reviewed text while page content never rides it. */
export declare function chateventof(text: string, from: string): {
    kind: servereventtype;
    stream: string;
    payload: Record<string, unknown>;
};
/** Builds the plan proposal event the extension posts: the review card payload of the servercontract, so the plan text and the step statuses cross while the observation bytes stay on the device. */
export declare function planproposaleventof(card: bridgereviewcard): {
    kind: servereventtype;
    stream: string;
    payload: Record<string, unknown>;
};
/** Reads the whole widget view in one pass: the status word, the chat rows, the review cards and the pending decision count, so the static site renders one frame of the conversation surface from one record list. */
export declare function widgetview(input: {
    status: string;
    events: bridgeeventrecord[];
    memberid: string;
}): {
    status: string;
    rows: Array<{
        from: string;
        text: string;
        mine: boolean;
        at: number;
    }>;
    cards: bridgereviewcard[];
    pending: number;
};
/** Reads the pairing panel the options page and the site render beside the code: the countdown display model of the sharedauth family, so both surfaces show the same expiry window. */
export declare function pairingpanel(record: Parameters<typeof pairingcountdown>[0], now: number): {
    code: string;
    secondsleft: number;
    expired: boolean;
    label: string;
};
/** Reads the site manifest the static site declares: the servercontract version and the capabilities the site speaks, fetched from the manifest link of the page before the first frame. */
export declare function sitemanifest(): ReturnType<typeof sitemanifestof>;
/** Reads the popup status label of one bridge status view: the connected, paired, offline and disabled words the popup icon renders. */
export declare function bridgestatuslabel(view: {
    status: string;
    paired: boolean;
    queued: number;
}): string;
import type { nativeframe, wsbridgesession } from "./types.js";
/**
 * Wsbridge of the 1.1.85 native host bridge family.
 * Every localhost relay concern of the native transport lives in this one pure module: the bind check that keeps the listener on localhost and refuses every other address, the session start that binds a random free port (the zero port the socket seam reports back), the per session token with its hash only record (the raw token never enters a log or an audit entry), the frame authentication that validates every incoming frame against the session token, the advertisement frame that tells the extension the port and the token over the native port, the idle expiry that closes a quiet session after the user configured window, the one extension connection rule that refuses a second extension side, and the envelope translation that reuses the servercontract envelopes of the 1.1.82 family so the wsbridge frames carry the same negotiated version, operation id and correlation shape the relay family speaks. The module stays pure: the socket, the random port and the token source reach it through injected seams only, the bind address and the idle window stay user choices with no code default, and no relay url, vendor endpoint or machine outside localhost ever appears here — a connection from another machine refuses at the bind itself.
 * Example: `const bind = wsbridgebindcheck("127.0.0.1"); const session = wsbridgesessionstart({ port: 0, now, token, hashof }); const ad = wsbridgeadvertiseframe(session, token, "run-ext-1");`
 */
/** The localhost addresses the wsbridge may bind: the loopback v4, its name and the loopback v6; every other address refuses because the bridge never leaves the machine. */
export declare const wsbridgelocalhosts: string[];
/** The stream name the wsbridge events multiplex over: the native transport frames ride the servercontract eventpost stream of this name. */
export declare const wsbridgestreamname = "nativetransport";
/** Checks one wsbridge bind address: the listener binds a localhost address only, a zero port asks the socket seam for a random free port and every other address refuses because the wsbridge never accepts a connection from another machine. */
export declare function wsbridgebindcheck(input: {
    bind?: string;
    port?: number;
}): {
    ok: boolean;
    bind: string;
    port: number;
    reason?: string;
};
/** Starts one wsbridge session: the socket seam reports the bound port (the zero request becomes the random free port it chose), the token hash records instead of the raw token and the idle window the user configured computes the expiry; an absent window never expires the session. */
export declare function wsbridgesessionstart(input: {
    port: number;
    now: number;
    token: string;
    hashof: (text: string) => string;
    idlewindow?: number;
    id?: string;
}): wsbridgesession;
/** Records one authenticated connection on the session: the frame counters and the idle clock move, and the idle expiry slides its window from the fresh frame time. */
export declare function wsbridgeconnection(session: wsbridgesession, now: number): wsbridgesession;
/** Connects the extension side of one session: exactly one extension connection holds a session, so a second extension side refuses and the first keeps its slot. */
export declare function wsbridgeextensionconnect(session: wsbridgesession, now: number): {
    session?: wsbridgesession;
    refused?: string;
};
/** Checks the per session token of one incoming frame: the frame token must match the session token exactly, and a frame without its token refuses before any body reads. */
export declare function wsbridgeframeauth(session: wsbridgesession, token: string, hashof: (text: string) => string): {
    ok: boolean;
    reason?: string;
};
/** Sweeps the idle expiry of one session: a quiet session past its expiry closes while a session without an idle window never expires, and the last frame time slides the window so an active session survives the sweep. */
export declare function wsbridgeidlesweep(session: wsbridgesession, now: number): {
    expired: boolean;
    session: wsbridgesession;
    reason?: string;
};
/** Wraps one native frame into the servercontract envelope the wsbridge carries: the eventpost operation with the negotiated contract version, the stable operation id and the native frame as the multiplexed stream payload, so the wsbridge frames and the relay frames speak the same envelope shape. */
export declare function wsbridgeenvelopeof(input: {
    opid: string;
    at: number;
    frame: nativeframe;
    sessionid?: string;
    token?: string;
    version?: number;
}): ReturnType<typeof composeenvelope>;
/** Reads the native frame back out of one servercontract envelope: only the eventpost operation of the wsbridge stream unwraps, and every other envelope refuses so a foreign frame never reaches the native transport. */
export declare function wsbridgeframeof(envelope: {
    op: string;
    body?: Record<string, unknown>;
}): {
    frame?: nativeframe;
    reason?: string;
};
/** Builds the advertisement frame the wsbridge sends the extension over the native port: the bound port and the per session token ride the native frame body, the only place the raw token ever appears — the logs, the audit entries and the session records keep its hash only. */
export declare function wsbridgeadvertiseframe(session: wsbridgesession, token: string, correlationid: string): nativeframe;
/** Reads the session report the settings panel and the diagnostics command show: the port, the connection counts and the expiry state ride the report while the raw token and its hash stay out, so a logged report never carries session material. */
export declare function wsbridgereport(session: wsbridgesession, now: number): {
    id: string;
    port: number;
    connections: number;
    extensionconnected: boolean;
    expired: boolean;
    received: number;
    sent: number;
};
/** Counts one frame on the session of the direction it travelled: the counters and the idle clock move together so the report and the expiry read the same state. */
export declare function wsbridgeframecounted(session: wsbridgesession, direction: "received" | "sent", now: number): wsbridgesession;
import { type companionhandshake, type nativecallclass, type nativecallrecord, type nativeerror, type nativehoststate, type nativesurfacekind, type runsettings } from "./types.js";
import type { jsonrpcframe } from "./types.js";
/**
 * Nativehost of the 1.1.85 native host bridge family.
 * Every native messaging concern lives in this one pure module: the host manifest template with its generated extension id placeholder, the installer that writes the host manifest into the user profile directory and refuses system wide installs without the explicit flag, the uninstaller that removes the host manifest and its preferences, the runtime native messaging port with its attach, detach, crash and reattach states, the companion handshake with the build and protocol version negotiation and the one major version upgrade window, the capability negotiation that lists the host features and enumerates the native surfaces on connect, the os dialog and notification surfaces behind their own consent grants, the correlation ids one run stamps on every frame, the heartbeat frames that detect host process liveness, the origin and session checks that validate every incoming native frame, the secret exclusion that keeps key vault material out of every frame, the structured errors with their retry hints, the graceful degradation that keeps runs alive when the host is absent or outdated, the per session rate cap accounting, the native call records the audit trail keeps with class and outcome, the native call events that stream to subscribed mcp clients and the diagnostics report of port state, versions and last errors. The module stays pure: the filesystem, the process spawning and the native messaging port itself reach it through injected seams only, every path, window and bound stays a user choice with no code default, the transport stays deny by default until the user installs the host, and no vendor endpoint, no download url and no binary blob ever appears here — the companionbin recipe builds from source with plain node because nothing native runs until the user builds and installs it.
 * Example: `const manifest = nativehostmanifesttemplate({ hostname: "com.example.devthink", companionpath: "/home/user/devthink/dist/companion.js" }); const installed = await installnativehost({ profiledir, hostname: "com.example.devthink", extensionid, companionpath, consent: true, now, io });`
 */
/** The native bridge protocol major version this build speaks: the handshake reports it, the upgrade path keeps compatibility for exactly one major version, and a host that speaks another major version degrades instead of breaking the run. */
export declare const nativebridgeprotocolmajor = 1;
/** The installer version the installer stamps into the install state; the upgrade path compares it so a manifest written by an older installer reports before it overwrites. */
export declare const nativehostinstallerversion: "2.0.0";
/** The generated extension id placeholder the host manifest template carries: the installer replaces the token with the extension id of the installed build, so the template never pins an identity the user did not generate. */
export declare const nativehostidplaceholder = "__generated_extension_id__";
/** The native messaging directory name of the chromium user profile: the installer writes the host manifest beside it, never into a system directory without the explicit flag. */
export declare const nativemessagingdirname = "NativeMessagingHosts";
/** The native surface catalog of the companion process: every surface with its call class and its consent question, so the capability negotiation enumerates what the host offers and the consent gate asks per surface. */
export interface nativesurfacedef {
    surface: nativesurfacekind;
    callclass: nativecallclass;
    description: string;
}
/** The native surfaces the companion process exposes behind consent: the os dialog surface opens a desktop dialog (a sensitive class call because it addresses the user directly) and the notification surface posts a desktop notification (an interaction class call). */
export declare function nativesurfacecatalog(): nativesurfacedef[];
/** The capabilities this side of the native transport declares: the native bridge protocol major version, the surfaces of the catalog and the heartbeat support. */
export declare function nativehostcapabilities(): {
    protocol: number;
    surfaces: nativesurfacekind[];
    heartbeat: boolean;
};
/** Builds the host manifest template: the native messaging host manifest of the companion process with its name, description, stdio type, the companion path the user chose and the allowed origins list that carries the generated extension id placeholder until the installer fills it. */
export declare function nativehostmanifesttemplate(input: {
    hostname: string;
    companionpath: string;
    extensionid?: string;
}): {
    manifest: {
        name: string;
        description: string;
        path: string;
        type: "stdio";
        allowed_origins: string[];
    };
    text: string;
};
/** Computes the destination of one host manifest: the user profile directory carries the manifest under its NativeMessagingHosts folder while a system wide install needs the explicit flag and computes the platform system directory; a missing profile directory with no system wide flag refuses because the installer never guesses a target. */
export declare function hostmanifestdestination(input: {
    hostname: string;
    profiledir?: string;
    systemwide?: boolean;
    platform?: "linux" | "macos" | "windows";
}): {
    path: string;
    systemwide: boolean;
    refused?: string;
};
/** Writes the host manifest into the user profile directory behind the install consent: the consent stamp must exist before any host registration, the extension id fills the placeholder of the template, a system wide install refuses without its explicit flag and the returned install state records the installer version for the upgrade path. */
export declare function installnativehost(input: {
    profiledir?: string;
    hostname: string;
    extensionid: string;
    companionpath: string;
    consent: boolean;
    now: number;
    systemwide?: boolean;
    platform?: "linux" | "macos" | "windows";
    io: {
        writefile: (path: string, text: string) => Promise<void>;
        mkdir: (dir: string) => Promise<void>;
    };
}): Promise<{
    state: nativehoststate;
    manifestpath: string;
    refused?: string;
}>;
/** Removes the host manifest and its preferences: the uninstaller deletes the manifest of the user profile directory (or, with the explicit flag, the system directory), clears the recorded install state and returns the deny by default posture the extension keeps afterwards. */
export declare function uninstallnativehost(input: {
    profiledir?: string;
    hostname: string;
    now: number;
    systemwide?: boolean;
    platform?: "linux" | "macos" | "windows";
    io: {
        removefile: (path: string) => Promise<void>;
        exists: (path: string) => Promise<boolean>;
    };
}): Promise<{
    state: nativehoststate;
    manifestpath: string;
    removed: boolean;
    refused?: string;
}>;
/** The deny by default state of the native transport: no host installed, no port attached and no versions recorded, so the transport stays disabled until the user installs the host. */
export declare function nativedefaultstate(): nativehoststate;
/** Reads the native transport choices of one settings record: the consent stamps, the class and surface grants, the idle window, the heartbeat interval and the rate cap with its window — every bound the user set with no code default beside it. */
export declare function nativechoices(settings: runsettings | undefined): {
    nativeinstallconsent?: boolean;
    nativetransportconsent?: boolean;
    nativecallclassconsents?: nativecallclass[];
    nativesurfaceconsents?: nativesurfacekind[];
    nativeidlewindow?: number;
    nativeheartbeatinterval?: number;
    nativecallratelimit?: number;
    nativecallratewindow?: number;
};
/** True when the native transport may attach at all: the host must sit installed and the user must hold the transport consent, because the deny by default posture keeps the bridge disabled until both hold. */
export declare function nativetransportenabled(state: nativehoststate | undefined, settings: runsettings | undefined): boolean;
/** Builds the correlation id one run stamps on every native frame: the sender seed and the per run sequence compose an id that stays unique across a whole run without any randomness on the wire. */
export declare function nativecorrelationid(seed: string, sequence: number): string;
/** Builds one native frame of the transport: the kind, the correlation id of the run and the body ride the frame the servercontract envelopes carry. */
export declare function nativeframeof(kind: nativeframe["kind"], correlationid: string, body?: Record<string, unknown>, sessionid?: string): nativeframe;
/** Builds the handshake request frame the extension sends on attach: the protocol major version of this build rides the body so the companion answers with its own build and protocol version. */
export declare function companionhandshakeframe(correlationid: string): nativeframe;
/** Parses the handshake answer of the companion process: the build version, the protocol major version, the surfaces and the wsbridge port validate their shapes, and a malformed handshake answers the structured error instead of a bare throw. */
export declare function parsecompanionhandshake(frame: nativeframe, now: number): {
    handshake?: companionhandshake;
    error?: nativeerror;
};
/** Reads the major version of one protocol version string: the digits before the first separator stay the major version the upgrade window compares. */
export declare function nativemajorversion(protocol: string | number): number;
/** Checks the protocol compatibility of the upgrade path: a host keeps compatibility for exactly one major version, so a companion of the same major version attaches whatever its build says while a host of another major version degrades instead of breaking the run. */
export declare function nativeprotocolcompatible(ours: string | number, theirs: string | number): {
    ok: boolean;
    ours: number;
    theirs: number;
};
/** Negotiates the native capabilities on connect: the protocol version takes the upgrade window, the surfaces intersect in the stable catalog order and the heartbeat support needs both sides, so the negotiation lists exactly the host features the run may use. */
export declare function negotiatenativecapabilities(input: {
    ours?: {
        protocol: number;
        surfaces: nativesurfacekind[];
        heartbeat: boolean;
    };
    theirs: {
        protocol: string | number;
        surfaces: nativesurfacekind[];
        heartbeat?: boolean;
    };
}): {
    ok: boolean;
    protocol: number;
    surfaces: nativesurfacekind[];
    heartbeat: boolean;
    reason?: string;
};
/** Attaches the runtime native messaging port to a healthy host: the handshake answer fills the companion version, the protocol version and the wsbridge port while the port state moves to attached. */
export declare function attachnativehost(state: nativehoststate, handshake: companionhandshake, now: number): nativehoststate;
/** Marks the native port crashed: the host process died under the extension, the state keeps the install facts and the run stays alive with the transport off until the reattach. */
export declare function crashnativehost(state: nativehoststate, now: number): nativehoststate;
/** Reattaches the native port after a crash or a restart: the fresh handshake answer fills the versions and the port while the state keeps the crash history for the diagnostics report. */
export declare function reattachnativehost(state: nativehoststate, handshake: companionhandshake, now: number): nativehoststate;
/** Detaches the native port on demand: the user closed the transport, the port state returns to detached and the install facts stay for the next attach. */
export declare function detachnativehost(state: nativehoststate, now: number): nativehoststate;
/** Builds one heartbeat frame of the liveness check: the correlation id of the run and the timestamp ride the body so both sides detect a silent peer. */
export declare function nativeheartbeatframe(correlationid: string, now: number): nativeframe;
/** Checks the host process liveness from the heartbeat timestamps: a last heartbeat older than the user configured interval marks the host silent while an absent interval never expires the check because the cadence stays a user choice. */
export declare function nativeportliveness(input: {
    lastheartbeatat?: number;
    now: number;
    interval?: number;
}): {
    alive: boolean;
    reason?: string;
};
/** Validates one incoming native frame with the origin and session checks: the correlation id stays present, the frame session matches the session the transport paired with and an anonymous frame refuses, so a frame of another session never reaches the engine. */
export declare function nativeframecheck(frame: nativeframe, sessionid: string): {
    allowed: boolean;
    reason?: string;
};
/** The field keys key vault material hides behind: a native frame body of this shape never crosses the port because the native host never receives key vault material. */
export declare const nativesecretkeys: string[];
/** Checks one native frame body for key vault material: a body key of the secret shape refuses the whole frame, so the native host never receives key material and the wsbridge token never rides a call frame. */
export declare function nativesecretexclusion(frame: nativeframe): {
    ok: boolean;
    held: string[];
};
/** Redacts one native frame for the logs and the audit entries: the secret shaped keys and the token field drop, so a recorded frame carries its shape and its outcome but never its key material. */
export declare function redactnativeframe(frame: nativeframe): nativeframe;
/** Builds one structured native error with its retry hint: the family names where the failure belongs and the retry hint maps the failure to its next action. */
export declare function nativeerrorof(family: nativeerror["family"], message: string, retry: nativeerror["retry"], now: number): nativeerror;
/** Maps one native failure to its retry hint: a handshake or port failure reconnects, an installer failure reinstalls and the rest never retry, so the caller reads the next action from the error itself. */
export declare function nativefailureof(error: nativeerror): {
    retryhint: "retry" | "wait" | "none";
    reason: string;
};
/** Reads the graceful degradation posture of the native transport: an absent host (nothing installed) or an outdated host (another protocol major version) keeps the run alive with the transport off, because the engine degrades instead of failing the run. */
export declare function nativedegradationof(input: {
    state: nativehoststate | undefined;
    negotiated?: {
        ok: boolean;
        reason?: string;
    };
}): {
    degraded: boolean;
    reason: string;
};
/** Checks the per session rate cap of the native transport: the calls of the window count against the user configured cap, an absent cap keeps the transport unbounded and the window slides from the newest call. */
export declare function nativeratecheck(input: {
    calls: nativecallrecord[];
    cap?: number;
    window?: number;
    now: number;
}): {
    allowed: boolean;
    used: number;
    cap?: number;
    reason?: string;
};
/** Builds one native call record of the audit trail: the correlation id of the run, the surface, the call class and the outcome with its refusal reason — the record never carries payload bytes. */
export declare function nativecallrecordof(input: {
    id: string;
    correlationid: string;
    surface: string;
    callclass: nativecallclass;
    outcome: nativecallrecord["outcome"];
    reason?: string;
    now: number;
}): nativecallrecord;
/** Stores one native call record at the head of the audit list; a repeated record id replaces the earlier entry so the trail keeps one record per call. */
export declare function recordnativecall(records: nativecallrecord[], record: nativecallrecord): nativecallrecord[];
/** Builds the native call event that streams to subscribed mcp clients: the surface, the class and the outcome ride one notification frame without any payload, so a subscribed client follows the native transport without seeing call bodies. */
export declare function nativecallevent(record: nativecallrecord): jsonrpcframe;
/** Reads the consent grant of one native surface: the surface needs its own grant stamp because a class grant never widens into a desktop surface, and an unknown surface never grants. */
export declare function nativesurfacegrant(surface: string, settings: runsettings | undefined): {
    allowed: boolean;
    reason: string;
};
/** Reads the call class consent of one native call: read, interaction and sensitive stay separate grants so every class asks on its own. */
export declare function nativeclassgrant(callclass: nativecallclass, settings: runsettings | undefined): {
    allowed: boolean;
    reason: string;
};
/** Shapes one native surface result for the plan engine: the surface, the call class and the structured details compose the step outcome the plan engine records, with the secret exclusion applied to the details. */
export declare function nativesurfaceresult(input: {
    surface: string;
    callclass: nativecallclass;
    details: Record<string, unknown>;
    now: number;
}): {
    surface: string;
    callclass: nativecallclass;
    details: Record<string, unknown>;
    at: number;
};
/** Builds the diagnostics report of the native transport: the port state, the install versions, the installer version, the wsbridge port, the degradation posture, the consent grants and the last errors one line each, so the settings panel and the cli native command read the same report. */
export declare function nativediagnostics(input: {
    state: nativehoststate | undefined;
    settings?: runsettings | undefined;
    sessions?: wsbridgesession[] | undefined;
    negotiated?: {
        ok: boolean;
        reason?: string;
    } | undefined;
    now: number;
}): {
    installed: boolean;
    port: string;
    hostname?: string;
    extensionid?: string;
    installerversion?: string;
    companionversion?: string;
    companionprotocol?: string;
    wsbridgeport?: number;
    nativebridgeprotocol: number;
    degraded: {
        degraded: boolean;
        reason: string;
    };
    transportconsent: boolean;
    classconsents: nativecallclass[];
    surfaceconsents: nativesurfacekind[];
    sessions: Array<{
        port: number;
        connections: number;
        expired: boolean;
    }>;
    lasterrors: nativeerror[];
};
//# sourceMappingURL=bridge.d.ts.map