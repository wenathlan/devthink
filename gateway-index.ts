/**
 * gateway-index — the npm library barrel of the @wenathlan/devthink gateway family
 * one file one responsibility — only exports live here
 *
 * the universal gateway library — any llm any baseurl any api key
 * (the gateway lineage of the grand merge: this barrel restores the library
 * surface the standalone gateway shipped at its root, re-exported from the
 * merged module names — auth became gateway-auth, http became gateway-http,
 * configloader became gateway-configloader and the cli became gateway-cli)
 *
 * quick start:
 *   import { createversion, loadconfig } from "@wenathlan/devthink/gateway-lib"
 *   const def = await loadconfig()
 *   const handlers = createversion(def.versions.v1)
 *   const response = await handlers.handlechatcompletions(request)
 *
 * or embed the full server:
 *   import { createserver } from "@wenathlan/devthink/gateway-lib"
 *   const app = await createserver()
 *   serve({ fetch: app.fetch, port: 3001 })
 *
 * or use the cli to scaffold a project:
 *   npx @wenathlan/devthink gateway init
 *
 * the barrel stays node only: the engine, the hono server and the prisma
 * persistence ride node adapters, so the family keeps its own entry beside
 * the neutral browser surface the root index.ts barrel freezes.
 */

// auth — universal key resolution and header building
export {
  appendqueryparams,
  buildauthheaders,
  buildauthqueryparams,
  extractchatid,
  extractrequestid,
  extractsessionid,
  extracttoken,
  getkey,
  getkeycount,
  masktoken,
  resolvekeys,
  validatetoken,
} from "./gateway-auth.js";
// config loading — bridge to the user customization layer
export { getversion, listversions, loadconfig, reloadconfig, validateconfig } from "./gateway-configloader.js";
// database — prisma persistence
export { db, getsession, getsessionmessages, savemsg } from "./database.js";
// engine — the universal request pipeline
export { createversion, engineinternals } from "./engine.js";
// http — hono server bootstrap + sse/ndjson stream utilities (one transport context)
export {
  createserver,
  discardheartbeat,
  extractdata,
  isdone,
  kams,
  kasuppressms,
  makechunk,
  makefinalchunk,
  makestreamresponse,
  maskmodel,
  ndjsonheaders,
  parsesseframes,
  runserver,
  safeclose,
  safeenqueue,
  sseheaders,
  writedone,
  writeevent,
  writekeepalive,
} from "./gateway-http.js";
export type { streamoptions, trackedstream } from "./gateway-http.js";
// types — the configuration surface
export type {
  authconfig,
  authmethod,
  bodybuildconfig,
  contextconfig,
  dbconfig,
  gatewayconfig,
  gatewaydefinition,
  headersconfig,
  intelligencerank,
  keysource,
  metamodelconfig,
  modeldef,
  resolvedkey,
  retryconfig,
  rotationconfig,
  rotationmode,
  routesconfig,
  sessionstate,
  thinkingconfig,
  thinkinglevel,
  timeoutconfig,
  transportconfig,
  transporttype,
  upstreamdef,
  versionhandlers,
} from "./types.js";

// utils — shared helpers
export {
  autofrequencypenalty,
  automaxtokens,
  auton,
  autopresencepenalty,
  autoseed,
  autotemp,
  autothinking,
  autotopp,
  clamp,
  corsheaders,
  defaultmaxtokens,
  detectcontenttype,
  esttokens,
  genid,
  getip,
  handlecors,
  jsonheaders,
  levenshtein,
  makethinker,
  safejsonparse,
  safestringify,
  thinkingbudget,
  truncatemessages,
} from "./utils.js";
