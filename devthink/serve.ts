/**
 * The serve module of the 1.1.90 consolidation: every correlated variation of the mcp server surface interned in this one file, so the module family carries one surface without duplicate variations.
 * The correlation is the serve mode of the agent protocol: jsonrpc holds the wire framing layer (the message codec that encodes and decodes one frame or one ordered batch, the notification frames a server never answers, and the structured errors with their retry hints that ride the rpc error data so a client reads whether a failure retries, waits its retry after window or never retries); resourceexpose holds the served resource surface (the pagestate, plan, audit, session and health catalog with its read rendering, the resource subscriptions with their change notifications that reuse the watcher baselines of the agent stream family and the notification frames the changes ride); and promptexpose holds the served prompt surface (the walkthrough prompts of the common tasks, the user authored template library published as mcp prompts and the prompts/call rendering that substitutes the declared arguments through the template library).
 * No endpoint, transport, provider or built-in template body is ever hardcoded anywhere in the family: every route and prompt stays the user's choice, the audit resource carries summaries with no payload, and no served surface ever bypasses the consent gates.
 */

/* ── Merged from jsonrpc.ts ── */

import { parseframe, respond, rpcerrornumbers, rpcerrorof, serializeframe } from "./mcp.js";
import { structurederrorof } from "./tools.js";
import type { jsonrpcframe, rpcerror, rpcerrorcode, retryhint, structurederror, toolresult } from "./types.js";

/**
 * Json rpc framing layer of the 1.1.84 mcp server mode.
 * Every wire message concern of the serve mode lives in this file: the message codec that encodes and decodes every message a transport carries — one frame or one batch array of frames — on top of the frame grammar the agent protocol family owns, the notification frames that omit the id so a server never answers them, the batch assembly and flattening that keeps the member order, the structured errors with their retry hints that ride the rpc error data so a client reads exactly whether a failure retries, waits its retry after window or never retries, and the error mapping that turns a structured error into the rpc error frame and back.
 * The layer stays pure: the transports feed it raw wire text and write the encoded answers back through their own seams, the retry hints derive from the structured error surface of the call runtime, and no transport, endpoint or provider is ever hardcoded.
 */

/** One wire message of the serve mode: a single frame or an ordered batch of frames. */
export type jsonrpcmessage = jsonrpcframe | jsonrpcframe[];

/** Encodes one wire message — a frame or a batch — into its compact json rpc wire form. */
export function encodemessage(message: jsonrpcmessage): string {
  return Array.isArray(message) ? JSON.stringify(message) : serializeframe(message);
}

/** Decodes one raw wire message: a bare frame parses as itself while an array parses as a batch whose members must all be frames; anything else refuses. */
export function decodemessage(raw: string): { message?: jsonrpcmessage; error?: rpcerror } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    return { error: rpcerrorof("parse", "The wire message does not parse as json.") };
  }
  if (Array.isArray(parsed)) {
    if (parsed.length === 0) return { error: rpcerrorof("params", "A batch message carries at least one frame.") };
    const frames: jsonrpcframe[] = [];
    for (const entry of parsed) {
      try {
        frames.push(parseframe(JSON.stringify(entry)));
      } catch {
        return { error: rpcerrorof("parse", "Every batch member must be a json rpc frame.") };
      }
    }
    return { message: frames };
  }
  try {
    const frame = parseframe(raw);
    return { message: frame };
  } catch {
    return { error: rpcerrorof("parse", "The wire message must be one json rpc frame or one batch of frames.") };
  }
}

/** Flattens one wire message into its ordered frames: a bare frame yields itself while a batch yields its members in order. */
export function framesof(message: jsonrpcmessage): jsonrpcframe[] {
  return Array.isArray(message) ? message : [message];
}

/** Assembles one batch message from its ordered frames; an empty list refuses because a batch carries at least one frame. */
export function batchof(frames: jsonrpcframe[]): { message?: jsonrpcmessage; error?: rpcerror } {
  if (frames.length === 0) return { error: rpcerrorof("params", "A batch message carries at least one frame.") };
  return { message: frames.length === 1 ? (frames[0] as jsonrpcframe) : frames };
}

/** True when one frame is a notification: notifications omit the id and a server never answers them. */
export function isnotification(frame: jsonrpcframe): boolean {
  return frame.id === undefined;
}

/** Builds one notification frame: the method with its params and no id, so the transport writes it without waiting for an answer. */
export function notificationframe(method: string, params?: Record<string, unknown>): jsonrpcframe {
  return { jsonrpc: "2.0", method, ...(params !== undefined ? { params } : {}) };
}

/** Wraps one structured error with its retry hint into the rpc error frame a transport answers with: the structured surface rides the error data so the client reads the code name, the message, the retry hint and the retry after window from one frame. A code outside the json rpc code names answers as internal while the structured data keeps the original code. */
export function errorwithretry(input: {
  code: rpcerrorcode | string;
  message: string;
  retryhint: retryhint;
  retryafter?: number;
}): rpcerror {
  const known = (Object.keys(rpcerrornumbers) as rpcerrorcode[]).find((code) => code === input.code);
  const wirecode: rpcerrorcode = known ?? "internal";
  const structured = structurederrorof({
    code: input.code,
    message: input.message,
    retryhint: input.retryhint,
    ...(input.retryafter !== undefined ? { retryafter: input.retryafter } : {}),
  });
  return rpcerrorof(wirecode, input.message, structured);
}

/** Reads the structured error surface with its retry hint back out of one rpc error; an error without the structured data keeps its code name and never retries. */
export function structuredof(error: rpcerror): structurederror {
  if (error.data !== undefined && error.data !== null && typeof error.data === "object" && !Array.isArray(error.data)) {
    const data = error.data as Record<string, unknown>;
    if (
      typeof data.code === "string" &&
      typeof data.message === "string" &&
      (data.retryhint === "retry" || data.retryhint === "wait" || data.retryhint === "none")
    ) {
      return {
        code: data.code,
        message: data.message,
        retryhint: data.retryhint,
        ...(typeof data.retryafter === "number" ? { retryafter: data.retryafter } : {}),
      };
    }
  }
  return structurederrorof({ code: error.code, message: error.message, retryhint: "none" });
}

/** Builds the error response frame of one request id around the structured error with its retry hint. */
export function errorresponse(input: {
  id?: number | string | null;
  code: rpcerrorcode | string;
  message: string;
  retryhint: retryhint;
  retryafter?: number;
}): jsonrpcframe {
  return respond({
    ...(input.id === undefined ? {} : { id: input.id }),
    error: errorwithretry({
      code: input.code,
      message: input.message,
      retryhint: input.retryhint,
      ...(input.retryafter !== undefined ? { retryafter: input.retryafter } : {}),
    }),
  });
}

/** Builds the result response frame of one request id; a tool result keeps its structured payload intact so the client reads the same details the sidepanel steps read. */
export function resultresponse(id: number | string | null | undefined, result: unknown): jsonrpcframe {
  return respond({ ...(id === undefined ? {} : { id }), result });
}

/** Builds the tool result payload of one frame result: the content, the structured payload and the error flag ride the wire exactly as the sidepanel steps read them. */
export function toolresultof(result: unknown): toolresult | undefined {
  if (result !== undefined && result !== null && typeof result === "object" && !Array.isArray(result)) {
    const candidate = result as Record<string, unknown>;
    if (typeof candidate.content === "string" && typeof candidate.iserror === "boolean")
      return {
        content: candidate.content,
        iserror: candidate.iserror,
        ...(candidate.payload !== undefined &&
        candidate.payload !== null &&
        typeof candidate.payload === "object" &&
        !Array.isArray(candidate.payload)
          ? { payload: candidate.payload as Record<string, unknown> }
          : {}),
      };
  }
  return undefined;
}

/* ── Merged from resourceexpose.ts ── */

import { notifyresource, watchresource } from "./agent.js";
import { randomid } from "./memory.js";
import type { agentplan, agentsession, auditevent, resourcewatch, servedresource, servehealth } from "./types.js";

/**
 * Resource exposure of the 1.1.84 mcp server mode.
 * Every served resource concern lives in this file: the resource catalog the serve mode publishes — the page state of the session tab, the approved plan, the audit trail, the session record and the health line with its version and uptime — the resources/read rendering of every resource into its wire text, the resource subscriptions a paired client opens with their change notifications that reuse the watcher baselines of the agent stream family so a subscriber reads exactly the keys that changed, and the notification frames the changes ride.
 * The exposure stays pure and consent-first: the page state resource carries no page content the user granted none of, the audit trail resource carries the summaries with no payload, and a subscription never widens what the session grants because the watcher stays a read only observation.
 */

/** The resource uris the serve mode publishes, in the documented order of the resources/list report. */
export const resourceuris = [
  "devthink://pagestate",
  "devthink://plan",
  "devthink://audit",
  "devthink://session",
  "devthink://health",
] as const;

/** The resource catalog the serve mode publishes: the page state of the session tab, the approved plan, the audit trail, the session record and the health line. */
export function servedresources(): servedresource[] {
  return [
    {
      uri: "devthink://pagestate",
      name: "pagestate",
      description:
        "The page state of the session tab: the url, the title and the page signals of the observed page — never the page content the user granted none of.",
      mimetype: "application/json",
    },
    {
      uri: "devthink://plan",
      name: "plan",
      description: "The plan of the live session with its state, its origin, its objective and its reviewed steps.",
      mimetype: "application/json",
    },
    {
      uri: "devthink://audit",
      name: "audit",
      description: "The audit trail of the session: every entry summary with its kind and time and no payload.",
      mimetype: "application/json",
    },
    {
      uri: "devthink://session",
      name: "session",
      description:
        "The session record of the extension session the client pairs with: the state, the origin grants and the expiry.",
      mimetype: "application/json",
    },
    {
      uri: "devthink://health",
      name: "health",
      description:
        "The health line of the serve mode: the extension version, the protocol version, the server contract version, the uptime and the serve state.",
      mimetype: "application/json",
    },
  ];
}

/** Resolves one served resource by its uri; an unknown uri returns undefined so the read reports it. */
export function resourceof(uri: string): servedresource | undefined {
  return servedresources().find((resource) => resource.uri === uri);
}

/** Reads one served resource into its wire form: the page state carries the observed signals only, the plan its reviewed steps, the audit its summaries with no payload, the session its record and the health its line; an unknown uri refuses with its reason. */
export function readresource(input: {
  uri: string;
  pagestate?: Record<string, unknown>;
  plan?: agentplan;
  audit?: auditevent[];
  session?: agentsession;
  health?: servehealth;
}): { resource?: servedresource; text?: string; reason?: string } {
  const resource = resourceof(input.uri);
  if (resource === undefined) return { reason: `The serve mode publishes no resource named ${input.uri}.` };
  if (resource.uri === "devthink://pagestate") return { resource, text: JSON.stringify(input.pagestate ?? {}) };
  if (resource.uri === "devthink://plan") return { resource, text: JSON.stringify(input.plan ?? null) };
  if (resource.uri === "devthink://audit")
    return {
      resource,
      text: JSON.stringify(
        (input.audit ?? []).map((entry) => ({ id: entry.id, kind: entry.kind, at: entry.at, summary: entry.summary })),
      ),
    };
  if (resource.uri === "devthink://session") {
    if (input.session === undefined) return { resource, text: JSON.stringify(null) };
    return {
      resource,
      text: JSON.stringify({
        id: input.session.id,
        tabid: input.session.tabid,
        origin: input.session.origin,
        startedat: input.session.startedat,
        expiresat: input.session.expiresat,
        grants: input.session.grants,
        ...(input.session.stoppedat !== undefined ? { stoppedat: input.session.stoppedat } : {}),
        ...(input.session.pausedat !== undefined ? { pausedat: input.session.pausedat } : {}),
      }),
    };
  }
  return { resource, text: JSON.stringify(input.health ?? {}) };
}

/** Opens one resource subscription for a paired client: the uri must name a served resource and the baseline freezes the resource state at subscription time so later change notifications deliver exactly the keys that changed. */
export function subscriberesource(input: {
  clientid: string;
  uri: string;
  state?: Record<string, unknown>;
  now: number;
  id?: string;
}): { watch?: resourcewatch; reason?: string } {
  if (input.clientid.trim() === "")
    return { reason: "The resource subscription needs the paired client it belongs to." };
  if (resourceof(input.uri) === undefined)
    return { reason: `The serve mode publishes no resource named ${input.uri}.` };
  const watched = watchresource({
    clientid: input.clientid,
    resource: input.uri,
    ...(input.state !== undefined ? { state: input.state } : {}),
    now: input.now,
    id: input.id ?? randomid(),
  });
  return {
    ...(watched.watch !== undefined ? { watch: watched.watch } : {}),
    ...(watched.reason !== undefined ? { reason: watched.reason } : {}),
  };
}

/** Publishes one resource change to its active subscribers: every watcher of the resource receives the delta of the changed keys against its baseline while the baseline absorbs the new state; the delivery stamps the last delivery time. */
export function publishchange(input: {
  watches: resourcewatch[];
  uri: string;
  state: Record<string, unknown>;
  now: number;
}): {
  deliveries: Array<{ watchid: string; clientid: string; delta: Record<string, unknown>; frame: jsonrpcframe }>;
  watches: resourcewatch[];
} {
  const outcome = notifyresource({ watches: input.watches, resource: input.uri, state: input.state, now: input.now });
  return {
    deliveries: outcome.deliveries.map((delivery) => ({
      ...delivery,
      frame: resourcechangeframe(delivery.watchid, input.uri, delivery.delta, input.now),
    })),
    watches: outcome.watches,
  };
}

/** Builds the resources/updated notification frame of one delivered change: the watcher id, the resource uri, the changed keys and the time. */
export function resourcechangeframe(
  watchid: string,
  uri: string,
  delta: Record<string, unknown>,
  now: number,
): jsonrpcframe {
  return { jsonrpc: "2.0", method: "resources/updated", params: { watchid, uri, delta, at: now } };
}

/** Builds the resources/list result of the serve mode: every served resource with its uri, description and mimetype. */
export function resourceslist(): { resources: servedresource[] } {
  return { resources: servedresources() };
}

/* ── Merged from promptexpose.ts ── */

import { listprompts as agentprompts, renderprompt } from "./agent.js";
import { rendertemplate } from "./llm.js";
import type { promptdef, prompttemplate } from "./types.js";

/**
 * Prompt exposure of the 1.1.84 mcp server mode.
 * Every served prompt concern lives in this file: the prompt template library published as mcp prompts — every user saved template of the llm integration family becomes one prompt with its variables as declared arguments — the walkthrough prompts for the common tasks a client walks through (the first snapshot, the reviewed fill and the table extraction) with their ordered steps rendered in plain language, the combined prompts/list report of the library and the walkthroughs beside the protocol prompt tools, and the prompts/call rendering that substitutes the declared arguments through the template library so a client reads exactly the prompt the user authored.
 * The exposure stays pure: no built-in template body ever ships beyond the reviewed walkthrough steps, a sensitive library template keeps its consent notice requirement, and no prompt execution bypasses the consent gates.
 */

/** The walkthrough prompts of the common tasks: the ordered steps a client walks through, rendered from the declared arguments. */
export function walkthroughprompts(): promptdef[] {
  return [
    {
      name: "walkthrough.firstsnapshot",
      description:
        "Walks a client through the first reviewed snapshot: pair the client, read the page state and propose the plan behind the human review.",
      arguments: [{ name: "origin", description: "The origin of the page the walkthrough observes.", required: true }],
      template:
        "First snapshot walkthrough for {{origin}}. Steps: 1. the paired client calls browser.snapshot to read the semantic snapshot of the active tab; 2. the client reads the devthink://pagestate resource for the page signals; 3. the client proposes its plan through workflow.plan with the observed steps; 4. the human review approves or refuses the plan before any step with side effects runs.",
    },
    {
      name: "walkthrough.reviewedfill",
      description:
        "Walks a client through a reviewed form fill: propose the typed plan, wait for the review gate and execute exactly the approved steps.",
      arguments: [
        { name: "form", description: "The reviewed selector of the form the walkthrough fills.", required: true },
        { name: "fields", description: "The reviewed field values of the fill.", required: true },
      ],
      template:
        "Reviewed fill walkthrough for {{form}} with {{fields}}. Steps: 1. the client reads the form through browser.extract; 2. the client proposes the typed steps through workflow.plan naming every field value; 3. the client submits the plan through workflow.review and the call waits for the human answer; 4. the approved steps run exactly as reviewed while a refused gate never executes.",
    },
    {
      name: "walkthrough.tablextract",
      description:
        "Walks a client through a reviewed table extraction: read the table, stream the rows and keep the provenance.",
      arguments: [
        { name: "table", description: "The reviewed selector of the table the walkthrough extracts.", required: true },
      ],
      template:
        "Table extraction walkthrough for {{table}}. Steps: 1. the client reads the table through browser.readtable; 2. long results stream through the call chunks while the client reads them as they arrive; 3. the client reads the devthink://audit resource for the provenance of every read; 4. nothing leaves the machine because every step stays a read.",
    },
  ];
}

/** Publishes one prompt template of the library as one mcp prompt: the template name becomes the prompt name, the description states the user authored body and the declared arguments carry the template variables with their required markers. */
export function templateprompt(template: prompttemplate): promptdef {
  return {
    name: template.name,
    description: `The user authored template ${template.name} of the prompt library (version ${template.version})${template.notes !== undefined ? ` — ${template.notes}` : ""}; the declared arguments are its template variables.`,
    arguments: template.variables.map((variable) => ({
      name: variable,
      description: `The value the template substitutes for the {{${variable}}} placeholder.`,
      required: true,
    })),
    template: template.body,
  };
}

/** Lists every served prompt of the serve mode: the walkthrough prompts for the common tasks first, then the prompt template library the user authored, then the protocol prompt tools of the agent stream family. */
export function listmcpprompts(templates: prompttemplate[]): promptdef[] {
  return [...walkthroughprompts(), ...templates.map(templateprompt), ...agentprompts()];
}

/** Renders one served prompt with its arguments: a walkthrough or protocol prompt renders through its own template while a library template renders through the template library so its sensitive consent notice requirement stays intact; a required argument left empty keeps its placeholder so the review sees the gap. */
export function rendermcpprompt(input: { name: string; args?: Record<string, unknown>; templates: prompttemplate[] }): {
  prompt?: promptdef;
  rendered?: string;
  reason?: string;
} {
  const prompts = listmcpprompts(input.templates);
  const prompt = prompts.find((candidate) => candidate.name === input.name);
  if (prompt === undefined) return { reason: `The serve mode publishes no prompt named ${input.name}.` };
  const args = input.args ?? {};
  const template = input.templates.find(
    (candidate) =>
      candidate.name === input.name &&
      candidate.version ===
        Math.max(...input.templates.filter((entry) => entry.name === input.name).map((entry) => entry.version)),
  );
  if (template !== undefined) {
    const variables: Record<string, unknown> = {};
    for (const argument of prompt.arguments) {
      const value = args[argument.name];
      if (value !== undefined && value !== null) variables[argument.name] = value;
    }
    const outcome = rendertemplate({ template, variables, sensitive: false });
    if (outcome.text !== undefined) return { prompt, rendered: outcome.text };
    return { prompt, reason: outcome.reason ?? "The library template did not render." };
  }
  return { prompt, rendered: renderprompt(prompt, args) };
}

/** Builds the prompts/list result of the serve mode: every walkthrough prompt, every library template prompt and every protocol prompt with its declared arguments. */
export function promptsof(templates: prompttemplate[]): { prompts: promptdef[] } {
  return { prompts: listmcpprompts(templates) };
}
