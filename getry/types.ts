/**
 * types — the gateway engine type families of the getry ownership split
 * (wave/ownership.getry). the llm integration contracts (protocol styles,
 * provider configs, model routes, prompt library, usage accounting) and the
 * gateway engine configuration vocabulary (auth methods, model defs,
 * upstreams, rotation, retry, timeouts, thinking, body building, routes,
 * meta model, transport, db, headers and the top-level gatewayconfig
 * family) moved here from devthink/types.ts — the os module keeps the
 * action/protocol/policy families. the apikeyref of the fetch family moved
 * here with the split (every consumer of the kind is a gateway module since
 * the wave; the os surface no longer references it), while the os-owned
 * contracts the gateway still consumes (policyevaluation of the plan family,
 * secretvaultentry of the security family and tooldef of the mcp tools
 * family) are imported through the devthink library specifier — never
 * copied — so the two modules can never drift apart.
 */

import type { ThinkingLevelName } from "@wenathlan/getry/thinking";

/** One stored api key reference: name, origin scope, header name and the storage id of the secret; the key material itself never enters any audit trail. Moved from devthink/types.ts with the wave/ownership.getry split — every consumer of the kind is a gateway module. */
export interface apikeyref {
  name: string;
  origins: string[];
  header: string;
  storageid: string;
  configuredat: number;
}

/**
 * Llm integration contracts of the 1.1.57 family: provider configs with endpoint url, auth reference and model list, model routes that map task kinds to provider models, local model endpoints, openapi style tool briefs, natural language command parsing with intents, model drafted plans with replans and reflection, cost budgets with usage records, the prompt template library and the parse guardrails that keep model output honest.
 * Nothing here hardcodes a provider, an endpoint, a model or a key: every gateway url, base url, model name and parameter is a user configured value, the protocol styles are wire shapes the user picks for interoperability, api keys live behind storage id references and every model drafted plan still passes the same human review the local plans pass.
 */

/** The protocol request shapes a user may pick for a provider endpoint: the openai compatible chat completions shape, the openai responses shape, the anthropic messages shape and the google gemini shape. These are wire shapes for interoperability, never provider names, and any gateway speaking one of them works. */
export type protocolstyle = "chatcompletions" | "responses" | "messages" | "gemini";

/** One message of a model conversation: the system, user or assistant role with its content. */
export interface modelmessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/** One user configured provider of model completions: the endpoint url the user typed, the protocol shape it speaks, the model list the user maintains, the api key reference (never the key material), the extra headers the user reviewed and the availability status of the last test call. */
export interface providerconfig {
  id: string;
  name: string;
  /** The user configured endpoint url; no default and no built-in provider endpoint ever applies. */
  endpoint: string;
  style: protocolstyle;
  /** The user configured model list; every entry is a free text model name. */
  models: string[];
  /** Reference to the stored api key record; the key material lives in the browser credential store behind its storage id, never in memory files or audit trails. */
  authref?: apikeyref;
  /** Extra headers the user reviewed for gateways that need them; merged over the protocol shape headers. */
  headers?: Record<string, string>;
  status: "available" | "unavailable";
  lastcheckedat?: number;
  /** Optional user configured price per million tokens and its currency unit for the cost accounting of the usage records; absent pricing keeps the recorded cost at zero. */
  costpermilliontokens?: number;
  currency?: string;
  createdat: number;
}

/** One model route entry: the task kind it routes, the provider and model it prefers and the user configured fallback pair for refusals and outages; the revision history tracks every change. */
export interface modelroute {
  id: string;
  /** The task kind of the route: the internal kinds parsecommand, classifyintent, draftplan, replan, reflect and summarize plus any user defined task kind. */
  kind: string;
  providerid: string;
  model: string;
  fallbackproviderid?: string;
  fallbackmodel?: string;
  revision: number;
  updatedat: number;
}

/** One browser reachable local model endpoint: the endpoint url, the model name, the protocol shape and the optional key reference of gateways that ask one; the health block carries the last check. */
export interface localmodelconfig {
  endpoint: string;
  model: string;
  style: protocolstyle;
  authref?: apikeyref;
  health?: { checkedat: number; ok: boolean; detail?: string };
}

/** One openapi style tool brief for model consumption: the tool name, the summary, the description, the risk class and the typed parameter list. */
export interface toolbrief {
  tool: string;
  summary: string;
  description: string;
  risk: string;
  parameters: Array<{ name: string; type: string; description: string; required: boolean }>;
}

/** The intent kinds a natural language command may carry: navigate, extract, fill, monitor, automate and ask. */
export type intentkind = "navigate" | "extract" | "fill" | "monitor" | "automate" | "ask";

/** One entity of a parsed command: the entity name and its value. */
export interface commandentity {
  name: string;
  value: string;
}

/** One parsed natural language command: the source text, the classified intent, the extracted entities, the confidence between zero and one, the model that parsed it and the parse time. */
export interface commandparse {
  text: string;
  intent: intentkind;
  entities: commandentity[];
  confidence: number;
  model?: string;
  providerid?: string;
  parsedat: number;
}

/** One model drafted step: the action kind, the optional target and value, the summary and the fresh review marker a replan sets on revised steps. */
export interface draftstep {
  id: string;
  kind: string;
  target?: string;
  value?: string;
  summary: string;
  /** True on the revised steps of a replan; every marked step needs the fresh human review before it executes. */
  freshreview?: boolean;
}

/** One model drafted plan: the goal, the drafted steps, the open questions the model could not resolve, the lint findings of the grammar check, the model provenance and the review state. A draft never executes until the human review approves it and the plan review approves the plan it produces. */
export interface plandraft {
  id: string;
  goal: string;
  steps: draftstep[];
  openquestions: string[];
  providerid: string;
  model: string;
  state: "draft" | "approved" | "rejected";
  lintfindings: string[];
  createdat: number;
}

/** One replan record of a failed run: the draft it revises, the completed steps it keeps, the failed steps it replaces, the revised tail that needs fresh review, the failure reason and the model provenance. */
export interface replanrecord {
  id: string;
  draftid: string;
  completedstepids: string[];
  failedstepids: string[];
  tail: draftstep[];
  reason: string;
  providerid: string;
  model: string;
  state: "pending" | "approved" | "rejected";
  createdat: number;
}

/** One reflection note of an executed step: the step outcome, the lesson learned, the advice for the next step and the model provenance; the running lessons feed the next prompt. */
export interface reflectnote {
  id: string;
  runid: string;
  stepid: string;
  outcome: string;
  lesson: string;
  advice: string;
  providerid: string;
  model: string;
  createdat: number;
}

/** One cost budget of a run: the optional token ceiling, the optional currency ceiling with its currency, the warning threshold ratio of the 1.1.83 gateway family and the configuration time; every ceiling and threshold is a user choice and an absent ceiling stays unbounded. */
export interface costbudget {
  runid?: string;
  maxtokens?: number;
  maxcost?: number;
  currency?: string;
  /** Warning threshold ratio between zero and one of the gateway family: the budget tracking warns once the recorded usage crosses the share of its ceiling; an absent threshold never warns. */
  warnratio?: number;
  configuredat: number;
}

/** One usage record of a model call: the run and step it belongs to, the provider, the endpoint and the model called, the prompt, completion and total token counts, the cost in the user configured currency and the local marker. */
export interface usagerecord {
  id: string;
  runid?: string;
  stepid?: string;
  providerid: string;
  endpoint: string;
  model: string;
  prompttokens: number;
  completiontokens: number;
  totaltokens: number;
  cost: number;
  /** True when the call went to the local model endpoint. */
  local?: boolean;
  /** Session of the call of the 1.1.83 gateway family so the token budget reports its totals per session beside the per run totals. */
  sessionid?: string;
  /** Correlation request id of the 1.1.83 gateway family; every provider call carries one and the audit trail records it. */
  requestid?: string;
  at: number;
}

/** One prompt template of the library: the name, the body with double braced variables, the declared variable list, the version and the change notes of the version. */
export interface prompttemplate {
  id: string;
  name: string;
  body: string;
  variables: string[];
  version: number;
  notes?: string;
  createdat: number;
}

/** One parse guard of model output: the expected schema of the parsed payload, the retry count before refusal and the refusal markers the user reviews. */
export interface parseguard {
  schema: Record<string, { type: "string" | "number" | "boolean" | "object" | "array"; required?: boolean }>;
  retries: number;
  refusalmarkers?: string[];
}

/** One model output after the guardrails: the raw text, the parsed payload when it validated, the guard verdict of valid, invalid or refused, the verdict reason and the attempt count. */
export interface modeloutput {
  raw: string;
  parsed?: Record<string, unknown>;
  verdict: "valid" | "invalid" | "refused";
  reason?: string;
  attempts: number;
}

/** One token of a streamed model answer: the sequence number, the token text and the done marker. */
export interface tokenstream {
  seq: number;
  text: string;
  done: boolean;
}

/**
 * Model provider gateway contracts of the 1.1.83 family: the four provider adapters (the openai compatible chat completions shape, the anthropic messages shape, the gemini generate content shape and the local ollama runtime), the baseurlconfig one endpoint url per provider the user configures, the per provider key vault behind the secretvault seam, the modellist discovery with its cache window, the capabilityad tool catalog advertisement, the routing of task kinds onto providers with the local fallback, the token budget accounting with its warning threshold and the guardrails over every parsed model answer.
 * Nothing here hardcodes a provider endpoint: the base url of every remote provider is a user configured value with no default, the ollamalocal adapter alone defaults to the localhost machine and never to a cloud url, api keys live behind the vault seam and never inside a payload, a log or an export, and every model drafted plan still passes the same human review.
 */

/** The provider adapters of the gateway family: the openai compatible chat completions shape, the anthropic messages shape, the google gemini generate content shape and the local ollama runtime. These are wire shapes for interoperability, never vendor endorsements; any gateway speaking one of them works. */
export type gatewaykind = "openaicompat" | "anthropicgateway" | "geminigateway" | "ollamalocal";

/** One user configured provider gateway: the base url the user typed (no default cloud endpoint ever ships), the optional path prefix gateway deployments prepend, the enable toggle that defaults to disabled, the consent stamp of the first remote call and the key reference behind the vault seam. */
export interface baseurlconfig {
  providerid: string;
  kind: gatewaykind;
  /** The user configured base url; the ollamalocal adapter alone defaults to the localhost machine address and every remote kind refuses an empty base url. */
  baseurl: string;
  /** Per provider path prefix for gateway deployments that serve one adapter under a namespace; the prefix sits between the base url and the wire path of the adapter. */
  pathprefix?: string;
  /** Per provider enable toggle; every provider ships disabled until the user turns it on. */
  enabled: boolean;
  /** True once the user consented to the first remote call of this provider; a provider without the stamp never leaves the machine. */
  consented?: boolean;
  consentedat?: number;
  /** Reference to the stored api key of this provider; the key material lives behind the vault seam, never inside this record. */
  keyref?: apikeyref;
  /** Optional user configured price per million tokens for the cost accounting of the gateway calls. */
  costpermilliontokens?: number;
  currency?: string;
  updatedat: number;
}

/** One discovered model of a provider: the model id, the display label, the context window hint and the modality hints when the provider offers them. */
export interface gatewaymodelinfo {
  id: string;
  label?: string;
  /** Context window hint in tokens when the provider offers it. */
  contextwindow?: number;
  /** Modality hints when the provider offers them: text, image, audio, video or embedding entries. */
  modalities?: string[];
}

/** One cached model list of a provider: the models discovered at the fetch time; the configurable refresh window decides whether the cache still serves. */
export interface modelcacherecord {
  providerid: string;
  models: gatewaymodelinfo[];
  fetchedat: number;
}

/** The structured error surface of the gateway family: every gateway failure carries its code, its plain language message, the retry hint and the request id so the surfaces and the audit trail correlate the failure with its call. */
export interface gatewayerror {
  code:
    | "noconsent"
    | "notconfigured"
    | "notlocal"
    | "cancelled"
    | "timeout"
    | "ratelimited"
    | "unauthorized"
    | "transport"
    | "parse"
    | "guardrefused";
  message: string;
  /** Plain language hint whether and how a retry may succeed. */
  retryhint?: string;
  /** Milliseconds a rate limited call waited before its next attempt, when the provider answered one. */
  retryafter?: number;
  requestid: string;
}

/** One streamed token of a gateway chat: the sequence number, the token text and the arrival time; the sidepanel chat appends every token as it arrives. */
export interface gatewaychattoken {
  seq: number;
  text: string;
  at: number;
}

/** One gateway chat exchange: the request id, the provider and model that answered, the prompt text, the streamed tokens, the done marker and the structured error when the call failed; the state never carries key material. */
export interface gatewaychatstate {
  requestid: string;
  providerid: string;
  kind: gatewaykind;
  model: string;
  prompt: string;
  tokens: gatewaychattoken[];
  done: boolean;
  error?: gatewayerror;
  at: number;
}

/** One cost estimate of a provider and model pair: the projected cost per million tokens with its currency and the recorded totals the projection answers. */
export interface costestimate {
  providerid: string;
  model: string;
  /** Projected cost of one million tokens at the user configured price; absent pricing keeps the estimate at zero. */
  permillion: number;
  currency?: string;
  recordedtokens: number;
  recordedcost: number;
}

/* === section: the gateway engine configuration vocabulary (the embedded gateway of the grand merge) === */
// ---------------------------------------------------------------------------
// thinking levels
// ---------------------------------------------------------------------------

/** thinking levels ordered by budget ascending — the union is consumed from
 * the getry engine (the one owner of the registerable reasoning ladder,
 * pr16 and the pr5 engine freedom fold): the os speaks the owner's
 * ThinkingLevelName and never redeclares the rung names — the rungs are
 * what the person registers (any count), so the ladder can only ever drift
 * in one place. */
export type thinkinglevel = ThinkingLevelName;

// ---------------------------------------------------------------------------
// auth — 12 methods covering the whole llm api market
// ---------------------------------------------------------------------------

/**
 * gwauthmethod — every authentication pattern found in production llm apis
 * bearer covers ~90 percent of providers (openai nvidia groq mistral deepseek kimi xai etc)
 * apikeyheader covers anthropic (x-api-key) google gemini (x-goog-api-key) azure (api-key)
 * queryparam covers legacy google and saas apis that pass the key in the url
 * basic covers generic rest apis with user colon password base64
 * oauth2clientcredentials covers ibm watsonx azure entra auth0 m2m — token endpoint then bearer
 * jwtsign covers zhipu bigmodel legacy — hs256 signed tokens from keyid dot secret
 * sigv4 covers aws bedrock — aws4-hmac-sha256 request signing
 * hmacsign covers stripe github slack webhook style signatures
 * cookie covers session-cookie authenticated apis
 * mtls covers client certificate mutual tls
 * keylesssdk covers sdk-resolved auth like z-ai-web-dev-sdk (server side config file)
 * anonymous covers keyless free endpoints like opencode zen kilo
 * none covers local servers like ollama
 */
export type gwauthmethod =
  | "bearer"
  | "apikeyheader"
  | "queryparam"
  | "basic"
  | "oauth2clientcredentials"
  | "jwtsign"
  | "sigv4"
  | "hmacsign"
  | "cookie"
  | "mtls"
  | "keylesssdk"
  | "anonymous"
  | "none";

/** where keys are resolved from — order matters first hit wins */
export type keysource = "db" | "env" | "inline" | "ephemeralurl";

/** how multiple keys rotate across requests */
export type keyrotationmode = "single" | "roundrobin" | "lru";

/**
 * authconfig — full authentication configuration for one gateway version
 * supports every auth method via mode plus per-method extras
 */
export interface authconfig {
  /** authentication method — see gwauthmethod union for the full list */
  mode: gwauthmethod;
  /** header name for apikeyheader mode — e.g. x-api-key x-goog-api-key api-key */
  headername?: string;
  /** query param name for queryparam mode — e.g. key api_key */
  queryparamname?: string;
  /** environment variable holding the key or comma-separated keys — e.g. NVIDIA_API_KEY */
  envvar?: string;
  /** separator used when envvar holds multiple keys — default comma */
  envseparator?: string;
  /** ordered key sources — first source with keys wins per request */
  keysources?: keysource[];
  /** prisma model name for db-sourced keys — e.g. apiKey nvidiaKey */
  dbmodel?: string;
  /** max keys fetched from db per refresh — default 50 */
  dbtake?: number;
  /** key rotation strategy when multiple keys exist */
  keyrotation?: keyrotationmode;
  /** label format for rotated keys — e.g. nvapi-key-{idx} */
  keylabelformat?: string;
  /** reject requests when no key is resolvable — 401 key_required */
  required?: boolean;
  /** minimum key length to be considered valid — default 10 */
  minkeylength?: number;
  /** signup url shown in 401 responses — e.g. https://openrouter.ai */
  signupurl?: string;
  /** ephemeral key endpoint for ephemeralurl source — e.g. babel get_api_key */
  keyurl?: string;
  /** ephemeral key expiry minutes — default 60 */
  keyexpiryminutes?: number;
  /** whether ephemeral keys are ip bound */
  ipbound?: boolean;
  /** ride-along headers sent with every upstream request — e.g. http-referer x-title anthropic-version */
  extraheaders?: Record<string, string>;
  /** ride-along query params sent with every upstream request — e.g. azure api-version */
  extraparams?: Record<string, string>;
  /** oauth2 token endpoint for oauth2clientcredentials mode */
  tokenurl?: string;
  /** oauth2 client id for oauth2clientcredentials mode */
  clientid?: string;
  /** oauth2 client secret env var for oauth2clientcredentials mode */
  clientsecretenv?: string;
  /** jwt key id for jwtsign mode (zhipu keyid.secret format) */
  jwtkeyid?: string;
  /** aws region for sigv4 mode */
  awsignregion?: string;
  /** aws service name for sigv4 mode — e.g. bedrock */
  awsservice?: string;
  /** inline keys for testing or small deployments */
  inlinekeys?: string[];
}

// ---------------------------------------------------------------------------
// models
// ---------------------------------------------------------------------------

/** intelligence rank from artificial analysis style leaderboards */
export interface intelligencerank {
  score: number;
  tier: 1 | 2 | 3 | 4;
}

/** a single model entry in a version catalog */
export interface modeldef {
  /** model id as exposed on the gateway route — e.g. glm-5.3 moonshotai/kimi-k3 */
  id: string;
  /** upstream model id when different from the exposed id — e.g. babel mapping */
  upstream?: string;
  /** context window in tokens */
  context: number;
  /** max output tokens */
  maxoutput: number;
  /** supports vision input */
  vision?: boolean;
  /** supports reasoning output */
  reasoning?: boolean;
  /** free tier model */
  free?: boolean;
  /** leaderboard rank metadata */
  rank?: intelligencerank;
  /** model family — kimi deepseek nemotron etc */
  family?: string;
  /** modality list string — e.g. text image audio */
  modalities?: string;
  /** nvidia-style chat template kwargs — e.g. { enable_thinking: true } */
  chattemplatekwargs?: Record<string, unknown>;
  /** model is routed through nvidia infrastructure — drives pii warning */
  nvidiarouted?: boolean;
  /** exclusive to this provider — openrouter exclusives */
  exclusive?: boolean;
  /** which endpoint this model lives on — chat or responses */
  endpoint?: "chat" | "responses";
}

// ---------------------------------------------------------------------------
// upstreams
// ---------------------------------------------------------------------------

/** one upstream provider endpoint */
export interface upstreamdef {
  /** upstream name — opencode kilo nvidia zai openrouter etc */
  name: string;
  /** base url — e.g. https://integrate.api.nvidia.com/v1 */
  baseurl: string;
  /** endpoint path overrides — default /chat/completions */
  endpoints?: {
    chat?: string;
    completions?: string;
    embeddings?: string;
  };
  /** cross-provider fallback target name — v4 pattern opencode to kilo */
  fallback?: string;
  /** auth override per upstream — defaults to the version level auth */
  auth?: authconfig;
}

// ---------------------------------------------------------------------------
// rotation
// ---------------------------------------------------------------------------

/** rotation mode */
export type rotationmode = "none" | "persession" | "perrequest";

/** model rotation configuration */
export interface rotationconfig {
  /** rotation mode — none persession perrequest */
  mode: rotationmode;
  /** rotation pool — model ids that the meta model rotates across */
  models: string[];
  /** rotate every n messages within a session — v3 v4 use 6 */
  everynmessages?: number;
  /** max model rotations per request before giving up — v3 uses 4 */
  maxmodelrotations?: number;
  /** http statuses that trigger an immediate model rotation — v3 [529,404,410] */
  rotateonstatus?: number[];
  /** rotate model when the per-attempt timeout fires — v3 true */
  rotateontimeout?: boolean;
  /** stagger new sessions across the rotation pool — v4 devthinkcounter */
  staggernewsessions?: boolean;
  /** where session rotation state lives — memory or durable db */
  sessionstore?: "memory" | "db";
}

// ---------------------------------------------------------------------------
// retry and backoff
// ---------------------------------------------------------------------------

/** retry and backoff configuration */
export interface retryconfig {
  /** max retries per model before rotating or failing — v3 uses 3 */
  maxretries?: number;
  /** base backoff in ms — v3 uses 400 */
  backoffbasems?: number;
  /** backoff cap in ms — v3 uses 8000 */
  backoffcapms?: number;
  /** jitter fraction 0 to 1 — v3 uses 0.2 for plus minus 20 percent */
  jitter?: number;
  /** statuses that retry the same model with the next key — v3 [429,502,503,504] */
  statuses?: number[];
  /** statuses that never retry — v3 [400] */
  nonretryable?: number[];
  /** statuses that trigger the fallback strategy — v4 [404,429,500,502,503,529] */
  fallbackstatuses?: number[];
  /** fallback strategy — none or cross-provider swap */
  fallback?: "none" | "crossprovider";
  /** optional circuit breaker — opens after n consecutive failures for cooldown ms */
  circuitbreaker?: {
    failures: number;
    cooldownms: number;
  };
}

// ---------------------------------------------------------------------------
// timeouts
// ---------------------------------------------------------------------------

/** timeout configuration */
export interface timeoutconfig {
  /** per model attempt timeout in ms — v3 uses 60000 abort rotates model */
  modelswitchintervalms?: number;
  /** non-stream request timeout in ms — v4 v5 use 300000 */
  requestms?: number;
  /** stream timeout in ms — v4 v5 use 2147483647 infinite */
  streamms?: number;
  /** keepalive interval in ms — default 200 */
  keepaliveintervalms?: number;
  /** suppress keepalive when a write happened within this ms — default 1000 */
  keepalivesuppressms?: number;
  /** maximum duration constant — default 2147483647 */
  maxduration?: number;
}

// ---------------------------------------------------------------------------
// context and session
// ---------------------------------------------------------------------------

/** context window and session configuration */
export interface contextconfig {
  /** restore session history from db before each request — v3 v4 true */
  restoresessionhistory?: boolean;
  /** truncate messages to fit per-call context — defaults to true when restoresessionhistory is true */
  truncate?: boolean;
  /** max messages fetched from db history — v3 v4 use 1000 */
  historylimit?: number;
  /** truncate messages to fit per-call context minus this margin — 4096 */
  truncatemargin?: number;
  /** fallback per-call context when model is unknown — 1048576 */
  percallfallback?: number;
  /** mark contextshared flag in db for meta model requests */
  markshared?: boolean;
}

// ---------------------------------------------------------------------------
// thinking
// ---------------------------------------------------------------------------

/** thinking configuration */
export interface thinkingconfig {
  /** default thinking level when absent — high */
  defaultlevel?: thinkinglevel;
  /** budget in tokens per level — v1 canonical 7-level map */
  budgets?: Record<thinkinglevel, number>;
  /** two-calls pattern — call 1 thinking then call 2 fresh response */
  twocalls?: {
    /** trigger threshold in tokens — v1 uses 98304 glm max */
    threshold: number;
    /** guarantee thinking differs from response — force call 2 with original messages */
    freshresponseguarantee?: boolean;
  };
  /** how the thinking param is sent — thinking object or chat_template_kwargs */
  param?: "thinking" | "chattemplatekwargs";
}

// ---------------------------------------------------------------------------
// body building
// ---------------------------------------------------------------------------

/** request body building configuration */
export interface bodybuildconfig {
  /** only include sampling params when the user specified them — nvidia rejects immutable defaults */
  optionalparamspolicy?: "omit-unspecified" | "always";
  /** clamp max_tokens to model maxoutput — v1 true v4 v5 false */
  clampmaxtokens?: boolean;
  /** advisory max tokens cap reported in metadata — v3 68000 */
  maxtokenscap?: number;
}

// ---------------------------------------------------------------------------
// routes
// ---------------------------------------------------------------------------

/** per-route enable/disable configuration */
export interface routesconfig {
  /** embeddings route — disabled when upstream has no embeddings endpoint */
  embeddings?: "enabled" | "disabled";
  /** message shown when embeddings is disabled */
  embeddingsmessage?: string;
  /** paused status code — v2 uses 503 */
  pausedstatus?: number;
  /** paused message body */
  pausedmessage?: string;
  /** fallback route suggested when paused — v2 /v1/chat/completions */
  fallbackroute?: string;
}

// ---------------------------------------------------------------------------
// meta model
// ---------------------------------------------------------------------------

/** meta model (devthink pattern) configuration */
export interface metamodelconfig {
  /** meta model id exposed on the route — devthink */
  id: string;
  /** override the computed fusion context — v1 uses 2300000 not the sum */
  contextoverride?: number;
  /** fallback context when models list is empty — 1048576 */
  fallbackcontext?: number;
  /** meta model max output tokens — 32768 */
  maxoutput?: number;
  /** mask upstream model ids to the meta id in all responses */
  maskupstreammodel?: boolean;
  /** always display the meta id even for individually selected models — v4 v5 true v3 false */
  alwaysdisplay?: boolean;
  /** listed created timestamp — 1700000000 */
  listedcreated?: number;
  /** meta pattern description shown in info payloads */
  pattern?: string;
}

// ---------------------------------------------------------------------------
// transport
// ---------------------------------------------------------------------------

/** transport type — how the gateway reaches the upstream */
export type transporttype = "fetch" | "zai-sdk" | "custom";

/** transport configuration */
export interface transportconfig {
  /** transport type — fetch for standard rest apis zai-sdk for the zai sdk */
  type: transporttype;
  /** sdk config path for keylesssdk transports — default /etc/.z-ai-config */
  sdkconfigpath?: string;
  /** custom transport module name — must export a create function */
  custommodule?: string;
}

// ---------------------------------------------------------------------------
// logging
// ---------------------------------------------------------------------------

/** db persistence configuration */
export interface dbconfig {
  /** database url — libsql http https postgres or file prefix */
  url?: string;
  /** local sqlite path fallback — file:./devthink.db */
  localpath?: string;
  /** prisma model for chat message persistence — chatMessage */
  logmodel?: string;
  /** extra fields to persist per version — v3 rotation fields */
  extrafields?: string[];
}

/** user-agent and header configuration */
export interface headersconfig {
  /** user-agent sent upstream — e.g. DevThink-Gateway/3.0 */
  useragent?: string;
  /** accept header strategy — sse for stream deleted for non-stream */
  acceptstrategy?: "standard" | "eventstream";
}

// ---------------------------------------------------------------------------
// top-level gateway config
// ---------------------------------------------------------------------------

/** one gateway version — one route prefix with its own upstream and models */
export interface gatewayconfig {
  /** version id — path prefix segment — v1 v2 v3 up to v9 and beyond */
  id: string;
  /** display name shown in info payloads */
  name?: string;
  /** provider name persisted to db — zai nvidia opencode kilo openrouter */
  providername: string;
  /** transport configuration */
  transport?: transportconfig;
  /** upstream endpoints — multiple enables cross-provider fallback */
  upstreams: upstreamdef[];
  /** authentication configuration */
  auth: authconfig;
  /** full model catalog exposed on this version */
  models: modeldef[];
  /** default model when request omits one */
  defaultmodel?: string;
  /** default sampling values */
  defaults?: {
    primary?: string;
    fallback?: string;
    maxtokens?: number;
    maxtokensclamp?: number;
    temperature?: [number, number, number];
    topp?: [number, number, number];
  };
  /** paused kill-switch — all post routes return pausedstatus */
  paused?: boolean;
  /** model rotation configuration */
  rotation?: rotationconfig;
  /** retry and backoff configuration */
  retry?: retryconfig;
  /** timeout configuration */
  timeout?: timeoutconfig;
  /** context and session configuration */
  context?: contextconfig;
  /** thinking configuration */
  thinking?: thinkingconfig;
  /** body building configuration */
  bodybuild?: bodybuildconfig;
  /** meta model configuration */
  metamodel: metamodelconfig;
  /** per-route configuration */
  routes?: routesconfig;
  /** header configuration */
  headers?: headersconfig;
  /** db persistence configuration */
  db?: dbconfig;
  /** notes shown in info payloads */
  note?: string;
}

/** the full gateway definition — a map of version id to version config */
export interface gatewaydefinition {
  versions: Record<string, gatewayconfig>;
  /** gateway display name */
  name?: string;
  /** gateway description */
  description?: string;
}

/** resolved key material after auth resolution */
export interface resolvedkey {
  key: string;
  label: string;
  source: keysource;
}

/** session rotation state tracked by the engine */
export interface sessionstate {
  messagecount: number;
  rotationindex: number;
  model: string;
}

/** the 7 route handlers produced by the engine for one version */
export interface versionhandlers {
  handleinfo: (req: Request) => Promise<Response>;
  handlekeys: (req: Request) => Promise<Response>;
  handlemodels: (req: Request) => Promise<Response>;
  handlechatcompletions: (req: Request) => Promise<Response>;
  handlecompletions: (req: Request) => Promise<Response>;
  handlemessages: (req: Request) => Promise<Response>;
  handleresponses: (req: Request) => Promise<Response>;
  handleembeddings: (req: Request) => Promise<Response>;
}
