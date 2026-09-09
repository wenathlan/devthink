/**
 * gatewayview definition — the view-side structural contract of the gateway
 * catalog the console page renders.
 *
 * the engine contract (the full gatewaydefinition family of types.ts at the
 * repository root) stays the property of the root library: importing it here
 * would pull the whole engine module graph into the web typecheck. this file
 * carries the projection the shipped v1–v5 catalog (config.ts beside it)
 * actually exercises, with the field names kept identical to the engine so
 * the two never drift in vocabulary: a field renamed in the engine shows up
 * here as a type error on the catalog the page renders.
 */

/* ── the catalog shapes — field names mirror the root types.ts contract ── */

/** one upstream endpoint: multiple entries enable cross-provider fallback. */
export interface upstreamdef {
  name: string;
  baseurl: string;
  fallback?: string;
}

/** one auth block: the mode, the key sources and the resolution hints. */
export interface authconfig {
  mode: string;
  required: boolean;
  headername?: string;
  keysources?: string[];
  keyurl?: string;
  keyexpiryminutes?: number;
  ipbound?: boolean;
  dbmodel?: string;
  dbtake?: number;
  envvar?: string;
  envseparator?: string;
  keyrotation?: string;
  keylabelformat?: string;
  minkeylength?: number;
  signupurl?: string;
  extraheaders?: Record<string, string>;
}

/** one model catalog entry: identity, windows and the rank the intelligence uses. */
export interface modeldef {
  id: string;
  upstream?: string;
  context: number;
  maxoutput: number;
  vision?: boolean;
  reasoning?: boolean;
  free?: boolean;
  rank?: { score: number; tier: number };
  family?: string;
  chattemplatekwargs?: Record<string, boolean>;
  endpoint?: string;
  nvidiarouted?: boolean;
  exclusive?: boolean;
}

/** the meta model entry: the devthink-masked face a version answers. */
export interface metamodelconfig {
  id: string;
  contextoverride?: number;
  fallbackcontext?: number;
  maxoutput: number;
  maskupstreammodel: boolean;
  alwaysdisplay: boolean;
  pattern?: string;
}

/** the thinking configuration: the levels, the budgets and the 2-calls pattern. */
export interface thinkingconfig {
  defaultlevel: string;
  param?: string;
  budgets?: Record<string, number>;
  twocalls?: { threshold: number; freshresponseguarantee: boolean };
}

/** the model rotation strategy of a version. */
export interface rotationconfig {
  mode: string;
  models: string[];
  everynmessages?: number;
  maxmodelrotations?: number;
  rotateonstatus?: number[];
  rotateontimeout?: boolean;
  staggernewsessions?: boolean;
  sessionstore?: string;
}

/** the retry and backoff policy of a version. */
export interface retryconfig {
  maxretries?: number;
  backoffbasems?: number;
  backoffcapms?: number;
  jitter?: number;
  statuses?: number[];
  nonretryable?: number[];
  fallbackstatuses?: number[];
  fallback?: string;
}

/** the timeout windows of a version. */
export interface timeoutconfig {
  modelswitchintervalms?: number;
  requestms?: number;
  streamms?: number;
}

/** the context and session history policy of a version. */
export interface contextconfig {
  restoresessionhistory?: boolean;
  historylimit?: number;
  truncatemargin?: number;
  percallfallback?: number;
  markshared?: boolean;
  truncate?: boolean;
}

/** the request body building policy of a version. */
export interface bodybuildconfig {
  optionalparamspolicy?: string;
  clampmaxtokens?: boolean;
  maxtokenscap?: number;
}

/** the per-route configuration: the embeddings posture and the paused state. */
export interface routesconfig {
  embeddings?: string;
  embeddingsmessage?: string;
  pausedstatus?: number;
  pausedmessage?: string;
  fallbackroute?: string;
}

/** the user-agent and header configuration of a version. */
export interface headersconfig {
  useragent?: string;
}

/** the transport declaration of a version (the zai-sdk keyless transport and the rest). */
export interface transportconfig {
  type: string;
}

/** one gateway version: one route prefix with its own upstreams and models. */
export interface gatewayconfig {
  id: string;
  name?: string;
  providername: string;
  note?: string;
  paused?: boolean;
  transport?: transportconfig;
  upstreams: upstreamdef[];
  auth: authconfig;
  models: modeldef[];
  defaultmodel?: string;
  metamodel: metamodelconfig;
  thinking?: thinkingconfig;
  bodybuild?: bodybuildconfig;
  routes?: routesconfig;
  headers?: headersconfig;
  rotation?: rotationconfig;
  retry?: retryconfig;
  timeout?: timeoutconfig;
  context?: contextconfig;
}

/** the full gateway definition: a map of version id to version config. */
export interface gatewaydefinition {
  versions: Record<string, gatewayconfig>;
  name?: string;
  description?: string;
}
