/**
 * The tools module of the 1.1.90 consolidation: every correlated variation of the tool catalog and call runtime logic interned in this one file, so the module family carries one surface without duplicate variations.
 * The correlation is the tools family: toolcatalog holds the catalog of the 1.1.54 agent protocol (the tool namespaces, the json schema layout of every tool def, the read and gated tools of the browser, workflow, memory and system domains, the catalog build, the name resolution and the per namespace listing); toolcalls holds the call runtime of the 1.1.56 agent protocol part three (the per client rate limits, the structured error mapping with its retry hints — exported here as callretryhintof so the session family keeps the canonical retryhintof — the idempotency replay window, the ordered batch calls, the tool dry runs, the tool mocks and the call contexts).
 * No budget, window or mock is ever invented: every rate limit and idempotency window stays the user's choice, and no tool call ever bypasses the dispatch gates.
 */

/* ── Merged from toolcatalog.ts ── */
import type {
  actionkind,
  actionrisk,
  toolcatalog,
  tooldef,
  toolnamespace,
  toolschema,
  toolschemaproperty,
  agentsession,
  agentplan,
  batchoutcome,
  callcontext,
  callratelimit,
  clientrecord,
  idempotencykey,
  idempotencyrecord,
  retryhint,
  structurederror,
  tooldryrun,
  toolmock,
  toolresult,
} from "./types.js";

/**
 * Tool catalog of the 1.1.54 and 1.1.55 agent protocol family, widened by the 1.1.84 mcp server mode.
 * Every mcp tool definition, version and json schema lives in this file: the four tool domains (browser, workflow, memory and system) with their namespace prefixes, the version appended to every tooldef for compatibility checks, the json schema generation that maps every tool input to typed properties with required markers and default values, the plain language descriptions that state the consent class and side effects of every tool and end with the openapi style field layout of their inputs, the consent metadata of the tools with side effects — the review requirement, the policy derived risk class, the approval gate requirement and the session origin scope — and the name resolution that keeps colliding base names apart through their namespace prefix. The 1.1.84 family adds the plan proposal tool with the full step grammar, the review gate tool that waits for the human answer, the observation read tool and the session record tool.
 * The catalog stays pure data: policy validates it against the action kind grammar and the server lists it through the tools/list handshake, while no tool bypasses review — read only tools run under the dryrun risk class and every tool with side effects names the approved plan step it executes.
 */

/** The catalog version of the 1.1.84 family; every tooldef appends its own version for compatibility checks, and the bump to 2 adds the plan proposal, review gate, observation and session tools with the openapi style field layout of every description. */
export const toolcatalogversion = 2;

/** The tool namespaces the catalog serves, in the documented order of the panel view. */
export const toolnamespaces: toolnamespace[] = ["browser", "workflow", "memory", "system"];

/** The reviewed action kinds of every namespace so policy can validate that tools stay in their domain. */
export const domainkinds: Record<toolnamespace, actionkind[]> = {
  browser: [
    "observe",
    "extract",
    "readtext",
    "readtable",
    "readlinks",
    "a11ytree",
    "tablist",
    "windowlist",
    "click",
    "type",
    "presskey",
    "navigate",
    "back",
    "forward",
    "reload",
    "tabcreate",
    "tabactivate",
    "tabclose",
    "windowcreate",
    "windowclose",
    "windowresize",
  ],
  workflow: ["composeworkflow", "runworkflow", "dryrun", "eventrule"],
  memory: ["listruns", "extractvars", "trailaudit"],
  system: ["observe", "readmeta"],
};

/** Builds the json schema of one tool input from its typed property map: required properties are listed and the options object carries the reviewed empty default. */
export function toolschemaof(properties: Record<string, toolschemaproperty>): toolschema {
  return {
    type: "object",
    properties,
    required: Object.entries(properties)
      .filter(([, property]) => property.required === true)
      .map(([name]) => name),
  };
}

/** Renders the openapi style field layout of one tool input schema: every property lists its name, its json schema type and its required star while a reviewed default renders after an equals sign, so every tool description ends with the same field layout an openapi document carries and a client reads the wire shape from the description alone. */
export function openapilayout(schema: toolschema): string {
  const fields = Object.entries(schema.properties).map(
    ([name, property]) =>
      `${name}:${property.type}${property.required === true ? "*" : ""}${property.default !== undefined ? `=${typeof property.default === "object" ? JSON.stringify(property.default) : String(property.default)}` : ""}`,
  );
  return `Fields: ${fields.join("; ")}.`;
}

/** Appends the openapi style field layout of its inputs to one tool description so every catalog description follows the same field layout grammar. */
function withfielddayout(tool: tooldef): tooldef {
  return { ...tool, description: `${tool.description} ${openapilayout(tool.inputschema)}` };
}

/** Builds one read only tool: read tools take their reviewed inputs from the wire and run under the dryrun risk class without extra approval. */
function readtool(
  name: string,
  kind: actionkind,
  description: string,
  inputs: Record<string, toolschemaproperty> = {},
): tooldef {
  return {
    name,
    version: toolcatalogversion,
    description,
    inputschema: toolschemaof({
      target: { type: "string", description: "Reviewed css selector the tool addresses." },
      value: { type: "string", description: "Reviewed literal value the tool carries." },
      options: {
        type: "object",
        description: "Reviewed json options of the wrapped action kind with the empty default.",
        default: {},
      },
      ...inputs,
    }),
    kind,
    risk: "read",
  };
}

/** Builds one tool with side effects: the tool takes only the id of the approved plan step whose reviewed payload it executes, so a client can never widen what the human approved; the consent metadata derives its risk class from the policy grading, marks the approval gate requirement and scopes the tool to the session grants. */
function gatedtool(name: string, kind: actionkind, risk: actionrisk, description: string, review: string): tooldef {
  return {
    name,
    version: toolcatalogversion,
    description,
    inputschema: toolschemaof({
      stepid: { type: "string", description: "Id of the approved plan step this tool executes.", required: true },
    }),
    kind,
    risk,
    consentmeta: { review, riskclass: risk, approvalrequired: true, originscope: "session" },
  };
}

/** The browser domain of the catalog: the snapshot, interaction, navigation, tab and window tools plus the read only extraction tools. */
function browserdomain() {
  return {
    namespace: "browser" as const,
    version: toolcatalogversion,
    tools: [
      readtool(
        "browser.snapshot",
        "observe",
        "Captures the semantic snapshot of the active tab: url, title, text preview, forms and interactive elements. Read only with no side effects; runs under the dryrun risk class once the session is approved.",
      ),
      readtool(
        "browser.extract",
        "extract",
        "Extracts the reviewed structured data of the page. Read only with no side effects.",
      ),
      readtool(
        "browser.readtext",
        "readtext",
        "Reads the text of the addressed element. Read only with no side effects.",
        { target: { type: "string", description: "Reviewed css selector of the element to read.", required: true } },
      ),
      readtool(
        "browser.readtable",
        "readtable",
        "Reads the rows of the addressed data table. Read only with no side effects.",
        { target: { type: "string", description: "Reviewed css selector of the table to read.", required: true } },
      ),
      readtool(
        "browser.readlinks",
        "readlinks",
        "Reads the link inventory of the page. Read only with no side effects.",
      ),
      readtool(
        "browser.a11ytree",
        "a11ytree",
        "Reads the accessibility tree of the page. Read only with no side effects.",
      ),
      readtool(
        "browser.observe",
        "observe",
        "Reads the structured observation record of the active tab — the url, the title, the page signals, the detected forms and the interactive elements — exactly as the evidence views render it. Read only with no side effects.",
      ),
      readtool("browser.tablist", "tablist", "Lists the open tabs. Read only with no side effects."),
      readtool("browser.windowlist", "windowlist", "Lists the open windows. Read only with no side effects."),
      gatedtool(
        "browser.click",
        "click",
        "sensitive",
        "Clicks the addressed element. Sensitive: it changes page state, so it executes exactly one approved plan step.",
        "The click runs only as the approved plan step it names; a paired client can never widen the reviewed target or options.",
      ),
      gatedtool(
        "browser.type",
        "type",
        "sensitive",
        "Types the reviewed text into the addressed element. Sensitive: it changes page state, so it executes exactly one approved plan step.",
        "The typing runs only as the approved plan step it names; the reviewed target, text and options stay fixed.",
      ),
      gatedtool(
        "browser.presskey",
        "presskey",
        "sensitive",
        "Presses the reviewed key. Sensitive: it changes page state, so it executes exactly one approved plan step.",
        "The key press runs only as the approved plan step it names.",
      ),
      gatedtool(
        "browser.navigate",
        "navigate",
        "sensitive",
        "Navigates the active tab to the reviewed url. Sensitive: it changes browser state, so it executes exactly one approved plan step.",
        "The navigation runs only as the approved plan step it names and stays inside the session origin grants.",
      ),
      gatedtool(
        "browser.back",
        "back",
        "sensitive",
        "Navigates back in the history of the active tab. Sensitive: it changes browser state, so it executes exactly one approved plan step.",
        "The history navigation runs only as the approved plan step it names.",
      ),
      gatedtool(
        "browser.forward",
        "forward",
        "sensitive",
        "Navigates forward in the history of the active tab. Sensitive: it changes browser state, so it executes exactly one approved plan step.",
        "The history navigation runs only as the approved plan step it names.",
      ),
      gatedtool(
        "browser.reload",
        "reload",
        "sensitive",
        "Reloads the active tab. Sensitive: it changes browser state, so it executes exactly one approved plan step.",
        "The reload runs only as the approved plan step it names.",
      ),
      gatedtool(
        "browser.tabcreate",
        "tabcreate",
        "sensitive",
        "Opens a new tab. Sensitive: it changes browser state, so it executes exactly one approved plan step.",
        "The tab creation runs only as the approved plan step it names.",
      ),
      gatedtool(
        "browser.tabactivate",
        "tabactivate",
        "sensitive",
        "Activates the reviewed tab. Sensitive: it moves focus, so it executes exactly one approved plan step.",
        "The tab activation runs only as the approved plan step it names.",
      ),
      gatedtool(
        "browser.tabclose",
        "tabclose",
        "sensitive",
        "Closes the reviewed tab. Sensitive: it destroys browser state, so it executes exactly one approved plan step.",
        "The tab close runs only as the approved plan step it names.",
      ),
      gatedtool(
        "browser.windowcreate",
        "windowcreate",
        "sensitive",
        "Opens a new window. Sensitive: it changes browser state, so it executes exactly one approved plan step.",
        "The window creation runs only as the approved plan step it names.",
      ),
      gatedtool(
        "browser.windowclose",
        "windowclose",
        "sensitive",
        "Closes the reviewed window. Sensitive: it destroys browser state, so it executes exactly one approved plan step.",
        "The window close runs only as the approved plan step it names.",
      ),
      gatedtool(
        "browser.windowresize",
        "windowresize",
        "sensitive",
        "Resizes the reviewed window. Sensitive: it changes browser state, so it executes exactly one approved plan step.",
        "The window resize runs only as the approved plan step it names.",
      ),
    ],
  };
}

/** The workflow domain of the catalog: the plan proposal tool with the full step grammar, the review gate tool that waits for the human answer, the workflow listing, run, dry run and trigger listing tools. */
function workflowdomain() {
  return {
    namespace: "workflow" as const,
    version: toolcatalogversion,
    tools: [
      readtool(
        "workflow.list",
        "composeworkflow",
        "Lists the composed workflows with their names, versions, origins and step counts. Read only with no side effects.",
      ),
      readtool(
        "workflow.plan",
        "composeworkflow",
        "Proposes a plan with the full reviewed step grammar — the title, the ordered steps of kind, target, value and reviewed options of the shared step grammar, and the origin the plan runs under — for the human review; the proposal changes no page state. Read only with no side effects.",
        {
          title: { type: "string", description: "Plain language title of the proposed plan.", required: true },
          steps: {
            type: "array",
            description:
              "Reviewed plan steps of the full shared grammar: each entry carries its id, its action kind, its target, its value and its reviewed options object.",
            required: true,
          },
          origin: {
            type: "string",
            description: "Origin the proposed plan runs under; the session grants check it.",
            required: true,
          },
        },
      ),
      readtool(
        "workflow.review",
        "composeworkflow",
        "Submits the proposed plan to the human review gate and waits for the answer: the call returns once the human approves or refuses while the gate refuses by default when the user configured window passes. Read only with no side effects — the run itself still names the approved plan step.",
        { planid: { type: "string", description: "Id of the proposed plan the review gate submits.", required: true } },
      ),
      readtool(
        "workflow.dryrun",
        "dryrun",
        "Runs a composed workflow as a dry run: read steps project their would be outcome and every step with side effects is refused. Read only with no side effects.",
      ),
      gatedtool(
        "workflow.run",
        "runworkflow",
        "sensitive",
        "Runs a composed workflow for real. Sensitive: it executes every step of the workflow, so it executes exactly one approved runworkflow plan step with its explicit run review.",
        "The workflow run needs the explicit run review: the approved runworkflow plan step with its expanded step list shown before the first step executes.",
      ),
      gatedtool(
        "workflow.triggers",
        "eventrule",
        "sensitive",
        "Lists the armed trigger rules with their schedules, cooldowns and fire counters so a client can inspect what launches runs automatically. Sensitive by its trigger family: automatic launchers stay behind the arm review class.",
        "The trigger listing runs behind the approved plan review because trigger rules launch runs automatically.",
      ),
    ],
  };
}

/** The memory domain of the catalog: the read accessors for stored runs, variable scopes and audit summaries. */
function memorydomain() {
  return {
    namespace: "memory" as const,
    version: toolcatalogversion,
    tools: [
      readtool(
        "memory.list",
        "listruns",
        "Lists the stored workflow run records with their states and step cursors from local memory. Read only with no page access.",
        {
          target: { type: "string", description: "Unused by the memory read; kept for schema uniformity." },
          value: { type: "string", description: "Unused by the memory read; kept for schema uniformity." },
          state: { type: "string", description: "Optional reviewed run state filter of the listing.", default: "" },
        },
      ),
      readtool(
        "memory.variables",
        "extractvars",
        "Reads the stored variable scopes of a run from local memory. Read only with no page access.",
      ),
      readtool(
        "memory.audit",
        "trailaudit",
        "Reads the audit summary of the session trail from local memory. Read only with no page access.",
      ),
    ],
  };
}

/** The system domain of the catalog: status, version, session record and capability reports. */
function systemdomain() {
  return {
    namespace: "system" as const,
    version: toolcatalogversion,
    tools: [
      readtool(
        "system.status",
        "observe",
        "Reports the mcp server status, the session state and the connected clients. Read only with no side effects.",
      ),
      readtool(
        "system.version",
        "readmeta",
        "Reports the protocol version, the catalog version and the extension version. Read only with no side effects.",
      ),
      readtool(
        "system.session",
        "observe",
        "Reports the live session record of the extension session the client pairs with: the session state, its origin grants and its expiry. Read only with no side effects.",
      ),
      readtool(
        "system.capabilities",
        "observe",
        "Reports the optional browser capabilities the user has granted. Read only with no side effects.",
      ),
    ],
  };
}

/** Builds the full mcp tool catalog of the four domains with the catalog version stamped on every record and the openapi style field layout of its inputs appended to every description. */
export function buildtoolcatalog(): toolcatalog {
  return {
    version: toolcatalogversion,
    domains: [browserdomain(), workflowdomain(), memorydomain(), systemdomain()].map((domain) => ({
      ...domain,
      tools: domain.tools.map(withfielddayout),
    })),
  };
}

/** Returns every tool of the catalog flattened across the domains. */
export function alltools(catalog: toolcatalog): tooldef[] {
  return catalog.domains.flatMap((domain) => domain.tools);
}

/** Prefixes one base tool name with its namespace so tool names never collide across domains. */
export function toolname(namespace: toolnamespace, base: string): string {
  return `${namespace}.${base}`;
}

/** Resolves one tool by its namespaced name; a bare name resolves only when exactly one tool of the catalog carries it, so colliding base names stay unambiguous through their prefix. */
export function resolvetool(catalog: toolcatalog, name: string): tooldef | undefined {
  if (name.includes(".")) return alltools(catalog).find((tool) => tool.name === name);
  const matches = alltools(catalog).filter((tool) => tool.name.split(".")[1] === name);
  return matches.length === 1 ? matches[0] : undefined;
}

/** Returns the namespace of one tool name; names without a dot carry no namespace. */
export function namespaceof(name: string): toolnamespace | undefined {
  const head = name.split(".")[0];
  return toolnamespaces.includes(head as toolnamespace) ? (head as toolnamespace) : undefined;
}

/** Groups the tools of the catalog by namespace for the panel view and the tools/list report. */
export function toolsbynamespace(
  catalog: toolcatalog,
): Array<{ namespace: toolnamespace; version: number; tools: tooldef[] }> {
  return catalog.domains.map((domain) => ({
    namespace: domain.namespace,
    version: domain.version,
    tools: domain.tools,
  }));
}

/* ── Merged from toolcalls.ts ── */
import { tooldispatchgate } from "./policy.js";
import { randomid } from "./memory.js";

/**
 * Tool call runtime of the 1.1.56 agent protocol part three.
 * Every call runtime concern lives in this file: the per client rate limits that count calls inside their window and answer excess with a structured error carrying its retry after, the structured error mapping that turns executor failures into codes with retry hints, the retry hint classification of retryable timeouts, busy windows and consent refusals, the idempotency keys that replay stored results inside their window and expire after it, the ordered batch calls that stop on the first error when the flag requests it, the tool dry runs that evaluate arguments and consent without side effects, the tool mocks that answer declared tools with canned results only in test contexts, and the call contexts that isolate the concurrent calls of concurrent clients while every call lands its audit entry with its idempotency key and outcome.
 * The runtime stays consent-first: a dry run never mutates the page, a mock never touches the browser and a rate limit never invents a budget the user did not configure.
 */

/** The default idempotency replay window of five minutes; any user configured window wins and an absent window keeps the replay forever. */
export const defaultidempotencywindowms = 300_000;

/** Counts one client tool call against its per client rate limit: a window past its end resets the counter, a configured budget refuses the call that would exceed it with its retry after window and an absent limit or budget keeps the client unbounded because no silent default ever applies. */
export function applyratelimit(input: { limits: callratelimit[]; clientid: string; now: number }): {
  allowed: boolean;
  used: number;
  budget?: number;
  retryafter?: number;
  limit?: callratelimit;
  limits: callratelimit[];
} {
  const existing = input.limits.find((limit) => limit.clientid === input.clientid);
  if (existing === undefined) return { allowed: true, used: 0, limits: input.limits };
  const elapsed = input.now - existing.windowstartedat;
  const limit: callratelimit =
    elapsed >= existing.windowms ? { ...existing, windowstartedat: input.now, used: 0 } : existing;
  if (limit.budget !== undefined && limit.used >= limit.budget) {
    const retryafter = Math.max(0, limit.windowms - (input.now - limit.windowstartedat));
    return {
      allowed: false,
      used: limit.used,
      budget: limit.budget,
      retryafter,
      limits: input.limits.map((candidate) => (candidate.clientid === input.clientid ? limit : candidate)),
    };
  }
  const counted: callratelimit = { ...limit, used: limit.used + 1 };
  return {
    allowed: true,
    used: counted.used,
    ...(counted.budget !== undefined ? { budget: counted.budget } : {}),
    limit: counted,
    limits: input.limits.map((candidate) => (candidate.clientid === input.clientid ? counted : candidate)),
  };
}

/** Builds one structured error with its code, message, retry hint and optional retry after window. */
export function structurederrorof(input: {
  code: string;
  message: string;
  retryhint: retryhint;
  retryafter?: number;
}): structurederror {
  return {
    code: input.code,
    message: input.message,
    retryhint: input.retryhint,
    ...(input.retryafter !== undefined ? { retryafter: input.retryafter } : {}),
  };
}

/** Classifies one failure into its retry hint: timeouts stay retryable, busy windows and rate limits wait for their retry after while consent refusals never retry. */
export function callretryhintof(failure: { code?: string; message?: string }): retryhint {
  const text = `${failure.code ?? ""} ${failure.message ?? ""}`.toLowerCase();
  if (
    text.includes("consent") ||
    text.includes("refus") ||
    text.includes("unpaired") ||
    text.includes("unapproved") ||
    text.includes("grant")
  )
    return "none";
  if (text.includes("rate") || text.includes("busy") || text.includes("queue") || text.includes("window"))
    return "wait";
  if (text.includes("timeout") || text.includes("timed out") || text.includes("internal") || text.includes("network"))
    return "retry";
  return "none";
}

/** Maps one executor failure onto its structured error: the code and message ride the answer while the retry hint classifies the retryable timeouts, busy windows and consent refusals. */
export function maptoolerror(input: {
  failure: { code?: string; message: string } | Error;
  retryafter?: number;
}): structurederror {
  const code = input.failure instanceof Error ? "internal" : (input.failure.code ?? "internal");
  const message = input.failure instanceof Error ? input.failure.message : input.failure.message;
  return structurederrorof({
    code,
    message,
    retryhint: callretryhintof({ code, message }),
    ...(input.retryafter !== undefined ? { retryafter: input.retryafter } : {}),
  });
}

/** Checks one idempotency key: a live record of the same client replays its stored result while an expired, foreign or unknown key reports why nothing replayed. */
export function checkidempotency(input: {
  records: idempotencyrecord[];
  key: idempotencykey;
  clientid: string;
  now: number;
}): { replay?: toolresult; record?: idempotencyrecord; reason?: string } {
  const match = input.records.find((record) => record.key === input.key && record.clientid === input.clientid);
  if (match !== undefined) {
    if (input.now >= match.expiresat)
      return { reason: "The idempotency record expired past its window and the call runs again." };
    return { replay: match.result, record: match };
  }
  if (input.records.some((record) => record.key === input.key))
    return { reason: "The idempotency key belongs to another client and never replays across clients." };
  return { reason: "The idempotency key names no stored record." };
}

/** Stores one idempotency record for replay: the key, the calling client, the tool and the result with its user configured window; a repeated key of the same client overwrites its record. */
export function recordidempotency(input: {
  records: idempotencyrecord[];
  key: idempotencykey;
  clientid: string;
  tool: string;
  result: toolresult;
  now: number;
  window?: number;
}): idempotencyrecord[] {
  const record: idempotencyrecord = {
    key: input.key,
    clientid: input.clientid,
    tool: input.tool,
    result: input.result,
    createdat: input.now,
    expiresat: input.now + (input.window ?? defaultidempotencywindowms),
  };
  return [
    record,
    ...input.records.filter((candidate) => !(candidate.key === input.key && candidate.clientid === input.clientid)),
  ];
}

/** Expires the idempotency records past their window: expired records leave the live set while their keys never replay. */
export function expireidempotency(records: idempotencyrecord[], now: number): idempotencyrecord[] {
  return records.filter((record) => now < record.expiresat);
}

/** Executes one ordered batch call: every member runs in order through the injected executor, each member lands its own outcome and the batch stops at the first error when the stop on error flag requests it. */
export async function runbatch(input: {
  calls: Array<{ id: string; name: string; params: Record<string, unknown> }>;
  stoponerror: boolean;
  now: number;
  execute: (
    call: { id: string; name: string; params: Record<string, unknown> },
    index: number,
  ) => Promise<{ ok: boolean; result?: toolresult; error?: structurederror }>;
}): Promise<{ outcomes: batchoutcome[]; stoppedat?: string }> {
  const outcomes: batchoutcome[] = [];
  for (let index = 0; index < input.calls.length; index += 1) {
    const call = input.calls[index];
    if (call === undefined) continue;
    const outcome = await input.execute(call, index);
    outcomes.push({
      callid: call.id,
      tool: call.name,
      ok: outcome.ok,
      ...(outcome.result !== undefined ? { result: outcome.result } : {}),
      ...(outcome.error !== undefined ? { error: outcome.error } : {}),
      at: input.now + index,
    });
    if (!outcome.ok && input.stoponerror) return { outcomes, stoppedat: call.id };
  }
  return { outcomes };
}

/** Runs one tool dry run: the arguments validate against the tool json schema, the same consent gates that guard execution evaluate the call and the record stays free of page mutations by construction because nothing ever executes. */
export function dryruntool(input: {
  tool: tooldef;
  params: Record<string, unknown>;
  client: clientrecord;
  session?: agentsession;
  plan?: agentplan;
  origin: string;
  stepid?: string;
  now: number;
  callid?: string;
}): tooldryrun {
  const findings: string[] = [];
  for (const required of input.tool.inputschema.required) {
    const value = input.params[required];
    if (value === undefined || value === null || (typeof value === "string" && value.trim() === ""))
      findings.push(`The required argument ${required} of ${input.tool.name} stays empty.`);
  }
  for (const [name, property] of Object.entries(input.tool.inputschema.properties)) {
    const value = input.params[name];
    if (value === undefined || value === null) continue;
    const expected = property.type;
    const actual = Array.isArray(value) ? "array" : typeof value;
    if (actual !== expected)
      findings.push(
        `The argument ${name} of ${input.tool.name} carries a ${actual} value where the schema asks a ${expected}.`,
      );
  }
  const stepid =
    input.stepid !== undefined
      ? input.stepid
      : typeof input.params.stepid === "string"
        ? input.params.stepid
        : undefined;
  const gate = tooldispatchgate({
    client: input.client,
    tool: input.tool,
    session: input.session,
    plan: input.plan,
    origin: input.origin,
    ...(stepid !== undefined ? { stepid } : {}),
    now: input.now,
  });
  if (!gate.allowed) findings.push(gate.reason ?? `The consent gates refused the ${input.tool.name} dry run.`);
  return {
    callid: input.callid ?? randomid(),
    tool: input.tool.name,
    argsvalid: findings.length === 0,
    consentok: gate.allowed,
    findings,
    executed: false,
    mutations: [],
    at: input.now,
  };
}

/** Applies one tool mock: a matching mock of a test context answers with its canned result without touching the browser while a mock outside a test context is refused and no mock leaves the call to the real gates. */
export function applymock(input: { mocks: toolmock[]; tool: string }): { result?: toolresult; reason?: string } {
  const mock = input.mocks.find((candidate) => candidate.tool === input.tool);
  if (mock === undefined) return {};
  if (mock.testcontext !== true)
    return {
      reason: `The ${input.tool} mock stays outside a test context and is refused; mocks never answer real calls.`,
    };
  return { result: mock.result };
}

/** Opens one isolated call context for a concurrent client call: the call id, the client, the tool and the markers of the 1.1.56 family ride the record while the chunk counter starts at zero. */
export function begincall(input: {
  clientid: string;
  tool: string;
  callid?: string;
  idempotencykey?: idempotencykey;
  dryrun?: boolean;
  batchid?: string;
  now: number;
}): callcontext {
  return {
    callid: input.callid ?? randomid(),
    clientid: input.clientid,
    tool: input.tool,
    state: "inflight",
    startedat: input.now,
    ...(input.idempotencykey !== undefined && input.idempotencykey.trim() !== ""
      ? { idempotencykey: input.idempotencykey }
      : {}),
    ...(input.dryrun === true ? { dryrun: true } : {}),
    ...(input.batchid !== undefined ? { batchid: input.batchid } : {}),
    chunks: 0,
  };
}

/** Closes one call context with its outcome: the context turns done or failed with its end time while the chunks counter and the partial result of a cancellation survive for the answer. */
export function endcall(input: {
  contexts: callcontext[];
  callid: string;
  ok: boolean;
  errorcode?: string;
  partial?: toolresult;
  now: number;
}): { contexts: callcontext[]; context?: callcontext; reason?: string } {
  const match = input.contexts.find((context) => context.callid === input.callid);
  if (match === undefined)
    return { contexts: input.contexts, reason: `The call context ${input.callid} never opened.` };
  if (match.state !== "inflight") return { contexts: input.contexts, context: match };
  const context: callcontext = {
    ...match,
    state: input.ok ? "done" : "failed",
    endedat: input.now,
    ...(input.errorcode !== undefined ? { errorcode: input.errorcode } : {}),
    ...(input.partial !== undefined ? { partial: input.partial } : {}),
  };
  return {
    contexts: input.contexts.map((candidate) => (candidate.callid === input.callid ? context : candidate)),
    context,
  };
}

/** Grades one batch call by its most sensitive member: the batch takes the sensitive grade when any member is sensitive and runs only behind the approval gates. */
export function batchrisk(calls: Array<{ risk: actionrisk }>): actionrisk {
  return calls.some((call) => call.risk === "sensitive") ? "sensitive" : "read";
}
