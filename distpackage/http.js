/*! devthink 2.0.0 — consent-first browser agent library — GPL-3.0-only — https://github.com/wenathlan/extension */

// version.ts
var packageversion = "2.0.0";
var protocolmajor = 2;
var protocolfloormajor = 2;

// types.ts
var protocolversion = packageversion;
var protocolmajorversion = protocolmajor;
var pinnedprotocolversion = Object.freeze({ protocolversion, protocolmajor: protocolmajorversion });
var actionkindids = Object.freeze([
  "observe",
  "inspect",
  "extract",
  "wait",
  "waitfor",
  "waittext",
  "readattribute",
  "readstyle",
  "readgeometry",
  "readvalue",
  "readtext",
  "readhtml",
  "countelements",
  "readtable",
  "readlinks",
  "readimages",
  "readmeta",
  "readforms",
  "readstorage",
  "highlight",
  "tablist",
  "windowlist",
  "tabsnapshot",
  "focus",
  "scroll",
  "hover",
  "clickdeep",
  "rightclick",
  "doubleclick",
  "scrollpage",
  "scrollby",
  "scrollend",
  "scrolltop",
  "fullscreen",
  "zoomset",
  "click",
  "type",
  "navigate",
  "select",
  "presskey",
  "drag",
  "drop",
  "upload",
  "clear",
  "check",
  "uncheck",
  "toggle",
  "submit",
  "reload",
  "back",
  "forward",
  "writestorage",
  "setattribute",
  "removeattribute",
  "evaluate",
  "tabcreate",
  "tabactivate",
  "tabclose",
  "tabreload",
  "windowcreate",
  "windowclose",
  "windowresize",
  "downloadfile",
  "movepointer",
  "clickpoint",
  "shiftclick",
  "clicktext",
  "clickaria",
  "clickname",
  "resolvexpath",
  "typetime",
  "appendtext",
  "setvalue",
  "typeedit",
  "keyhold",
  "keyrelease",
  "submitsearch",
  "selectmulti",
  "chooseradio",
  "setslider",
  "setdate",
  "setcolor",
  "expanddetails",
  "dismissdialog",
  "pierceshadow",
  "enterframe",
  "retryaction",
  "mapclicks",
  "verifyvisible",
  "verifyenabled",
  "a11ytree",
  "readvisible",
  "readertree",
  "detectlists",
  "detecttables",
  "readjson",
  "watchmutate",
  "waitquiet",
  "watchbanner",
  "detectinfinitescroll",
  "detectvirtual",
  "detectlazy",
  "readscrollpos",
  "readlang",
  "readoutline",
  "countpages",
  "listshadow",
  "listframes",
  "classifypage",
  "fingerprintsection",
  "diffsnapshots",
  "readselection",
  "watchfocus",
  "detectsticky",
  "detectscrolllock",
  "readopengraph",
  "detectlanguage",
  "deriveselector",
  "openlink",
  "openprivate",
  "reloadcache",
  "stopnav",
  "waitload",
  "waiturl",
  "followlink",
  "spanav",
  "spawait",
  "rewritequery",
  "setfragment",
  "navlist",
  "navprofile",
  "detecthttp",
  "readredirects",
  "readfinalurl",
  "handleauth",
  "printpdf",
  "prefetch",
  "preconnect",
  "deeplink",
  "reopentab",
  "trailaudit",
  "pausenav",
  "navintent",
  "navrate",
  "openclipboard",
  "checksafe",
  "batchopen",
  "querytabs",
  "duplicatetab",
  "closepattern",
  "pintab",
  "mutetab",
  "movetab",
  "movetabwindow",
  "grouptabs",
  "colorgroup",
  "collapsegroup",
  "discardtab",
  "reloadtabs",
  "zoomin",
  "zoomout",
  "watchtab",
  "switchtab",
  "maximizewindow",
  "minimizewindow",
  "restorewindow",
  "focuswindow",
  "scratchwindow",
  "incognitowindow",
  "restoretab",
  "savelayout",
  "restorelayout",
  "findclones",
  "searchtabs",
  "badgetab",
  "attachmeta",
  "listaudio",
  "reopenrun",
  "snapshotsession",
  "fillform",
  "filllabel",
  "fillplaceholder",
  "detectfields",
  "generatevalues",
  "saveprofiles",
  "asksubmit",
  "submitform",
  "readerrors",
  "retryform",
  "runwizard",
  "selectchain",
  "picktypeahead",
  "pickdate",
  "attachfile",
  "handoffcaptcha",
  "fillcard",
  "fillcode",
  "consentpassword",
  "skiphoneypot",
  "detectlogin",
  "detecttemplate",
  "scrapetable",
  "exportcsv",
  "exportjson",
  "exportexcel",
  "copytable",
  "pushsheets",
  "importcsv",
  "looprows",
  "transformvalues",
  "deduperows",
  "paginateextract",
  "mergepages",
  "stamplerows",
  "previewgrid",
  "streamdisk",
  "resumeextract",
  "logprovenance",
  "batchdownload",
  "pausedownload",
  "resumedownload",
  "verifydownload",
  "interceptmime",
  "exportnetlog",
  "readclipboard",
  "writeclipboard",
  "copyscreen",
  "quarantinedownload",
  "scanvirus",
  "namecaptures",
  "cleanupartifacts",
  "shotview",
  "shotfullpage",
  "shotelement",
  "shotregion",
  "contactsheet",
  "capturepdf",
  "recordscreen",
  "captureaudio",
  "captureframe",
  "downloadimages",
  "shotcanvas",
  "probestream",
  "readmedia",
  "readassets",
  "timelapse",
  "convertimage",
  "makethumbs",
  "fetchurl",
  "parsejson",
  "parsehtml",
  "callrest",
  "callgraphql",
  "opensocket",
  "sendmessage",
  "waitmessage",
  "watchrequests",
  "readheaders",
  "capturebodies",
  "subscribesse",
  "longpoll",
  "mapapi",
  "extractapi",
  "blockrequest",
  "mockresponse",
  "rewriteheaders",
  "setcookies",
  "readcookies",
  "clearcookies",
  "authflow",
  "saveapikey",
  "routeproxy",
  "postform",
  "postfiles",
  "watchconsole",
  "watcherrors",
  "watchtasks",
  "attachcdp",
  "detachcdp",
  "cdpcmd",
  "watchcdp",
  "setbreakpoint",
  "stepcode",
  "watchexpr",
  "overridescript",
  "measureflow",
  "heapshot",
  "trackmemory",
  "profilecpu",
  "watchshifts",
  "traceload",
  "annotatetrace",
  "replaytrace",
  "capturesourcemaps",
  "emulatedevice",
  "emulatenetwork",
  "emulatelocate",
  "setuseragent",
  "overridepermission",
  "blackboxscripts",
  "persiststate",
  "capturesession",
  "restoresession",
  "namedsessions",
  "diffsessions",
  "searchsessions",
  "exportsessions",
  "importsessions",
  "composeworkflow",
  "savetemplate",
  "runworkflow",
  "dryrun",
  "delay",
  "waitelement",
  "compute",
  "extractvars",
  "listruns",
  "condition",
  "branch",
  "loop",
  "repeatuntil",
  "whileloop",
  "foreach",
  "parallel",
  "trycatch",
  "visitrule",
  "urlrule",
  "menurule",
  "keyrule",
  "buttonrule",
  "cronrule",
  "intervalrule",
  "urllistrule",
  "webhookrule",
  "eventrule"
]);
var servercontractversion = 1;

// apifreeze.ts
var protocolsupported = Object.freeze({ minimum: protocolfloormajor, maximum: protocolmajorversion });
var apifreezerelease = "1.1.91";
var deprecationwindow = Object.freeze({ opens: apifreezerelease, closes: "2.0.0" });
var allhostspattern = `https://${"*"}/*`;
var permissioncoverage = Object.freeze({
  activeTab: Object.freeze({ surface: "popup", messages: ["startsession", "context", "observation"], kinds: ["observe", "inspect"] }),
  storage: Object.freeze({ surface: "background", messages: ["configure", "context", "sessions", "security", "state"], kinds: [] }),
  scripting: Object.freeze({ surface: "background", messages: ["execute", "preview", "map", "observation"], kinds: ["click", "type", "highlight"] }),
  sidePanel: Object.freeze({ surface: "sidepanel", messages: [], kinds: [] }),
  tabs: Object.freeze({ surface: "background", messages: ["tabsearch", "jumptotab", "savelayout", "windowstate", "controltab", "settasktabceiling"], kinds: ["tablist", "querytabs", "windowlist", "savelayout"] }),
  downloads: Object.freeze({ surface: "background", messages: ["downloadreport", "downloadaction"], kinds: ["downloadfile", "pausedownload", "resumedownload", "verifydownload", "quarantinedownload"] }),
  clipboardRead: Object.freeze({ surface: "background", messages: ["execute"], kinds: ["readclipboard"] }),
  clipboardWrite: Object.freeze({ surface: "background", messages: ["execute"], kinds: ["writeclipboard", "copyscreen"] }),
  offscreen: Object.freeze({ surface: "background", messages: ["environments"], kinds: [] }),
  nativeMessaging: Object.freeze({ surface: "background", messages: ["native"], kinds: [] }),
  [allhostspattern]: Object.freeze({ surface: "background", messages: [], kinds: ["fetchurl", "callrest", "callgraphql", "subscribesse", "longpoll", "postform", "postfiles"] })
});

// auth.ts
var tokenhashprefix = "sha256:";
var authrefusedmessage = "The remote frame failed its authentication handshake.";
async function tokenhashof(raw) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  return tokenhashprefix + [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
async function verifytoken(input) {
  const hash = await tokenhashof(input.raw);
  const match = input.tokens.find((candidate) => candidate.hash === hash);
  if (match === void 0) return { reason: authrefusedmessage };
  if (match.revokedat !== void 0) return { reason: authrefusedmessage };
  if (input.now >= match.expiresat) return { reason: authrefusedmessage };
  return { token: match };
}
function checkallowlist(input) {
  const entry = input.entries.find((candidate) => candidate.fingerprint === input.fingerprint);
  if (entry === void 0) return { allowed: false, reason: `The client fingerprint ${input.fingerprint} is not on the allowlist and is refused.` };
  if (input.namespace !== void 0 && !entry.namespaces.includes(input.namespace)) return { allowed: false, reason: `The allowlist entry ${entry.displayname} grants no ${input.namespace} tools.` };
  return { allowed: true };
}
function scopecheck(token, namespace) {
  if (namespace === void 0) return { allowed: false, fast: true, reason: "The tool call names no reviewed namespace." };
  if (token === void 0) return { allowed: false, reason: "The tool call carries no verified session token." };
  if (!token.scopes.includes(namespace)) return { allowed: false, reason: `The session token grants no ${namespace} tools.` };
  return { allowed: true };
}
function tlsstateof(tls) {
  return { mode: tls.mode, certificaterequired: tls.mode === "required" || tls.certificatefingerprint !== void 0, verified: tls.verifiedat !== void 0 };
}

// bridge.ts
var serveroperations = ["sessioncreate", "sessionjoin", "eventpost", "eventstream"];
var servereventtypes = ["chat", "planproposal", "planreview", "progress"];
function contractcapabilities(version = servercontractversion) {
  return { version, operations: [...serveroperations], events: [...servereventtypes], heartbeat: true, multiplex: true };
}
function composeenvelope(input) {
  const opid = input.opid.trim();
  if (opid === "") throw new Error("The envelope carries its stable operation id; an empty id never correlates a reply.");
  if (!serveroperations.includes(input.op)) throw new Error(`The envelope operation ${input.op} sits outside the servercontract operations.`);
  if (!Number.isFinite(input.at)) throw new Error("The envelope carries its timestamp.");
  return { version: input.version ?? servercontractversion, op: input.op, opid, at: input.at, ...input.sessionid !== void 0 && input.sessionid.trim() !== "" ? { sessionid: input.sessionid.trim() } : {}, ...input.token !== void 0 && input.token.trim() !== "" ? { token: input.token.trim() } : {}, ...input.body !== void 0 ? { body: input.body } : {} };
}
function parseenvelope(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("The servercontract envelope must be a json object.");
  const entry = value;
  if (!Number.isInteger(entry.version) || entry.version < 1) throw new Error("The envelope version must be a positive whole number.");
  if (typeof entry.op !== "string" || !serveroperations.includes(entry.op)) throw new Error(`The envelope operation ${String(entry.op)} sits outside the servercontract operations.`);
  if (typeof entry.opid !== "string" || entry.opid.trim() === "") throw new Error("The envelope operation id must be a non-empty string.");
  if (entry.sessionid !== void 0 && (typeof entry.sessionid !== "string" || entry.sessionid.trim() === "")) throw new Error("The envelope session id must be a non-empty string when present.");
  if (entry.token !== void 0 && (typeof entry.token !== "string" || entry.token.trim() === "")) throw new Error("The envelope frame token must be a non-empty string when present.");
  if (!Number.isFinite(entry.at)) throw new Error("The envelope timestamp must be a finite number.");
  if (entry.body !== void 0 && (!entry.body || typeof entry.body !== "object" || Array.isArray(entry.body))) throw new Error("The envelope body must be a json object when present.");
  return { version: entry.version, op: entry.op, opid: entry.opid.trim(), at: entry.at, ...entry.sessionid !== void 0 ? { sessionid: entry.sessionid.trim() } : {}, ...entry.token !== void 0 ? { token: entry.token.trim() } : {}, ...entry.body !== void 0 ? { body: entry.body } : {} };
}
function parsewireframe(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("The wire frame must be json text.");
  }
  return parseenvelope(parsed);
}

// protocol.ts
var responseenvelopeoutcomes = Object.freeze(["success", "error", "cancel"]);
var framingrules = Object.freeze({
  stdio: "One newline delimited json frame per block on stdin with one reply frame per line on stdout; the frame size bound stays the user configured limit with no code default.",
  http: "One json frame per http post body on the localhost listener with the reply in the response body under the same user configured frame size bound; no other verb carries frames."
});
var stabilityrules = Object.freeze({
  additive: "Inside protocolv2 every change stays additive: new optional fields, new message types, new tools and new permissions join the contract without touching a frozen entry, because the freeze artifact hashes every schema and refuses a changed hash on the same release version.",
  breaking: "A breaking change \u2014 removing a field, narrowing a type, refusing a message the contract accepted or renaming a frozen entry \u2014 requires a new major protocol version with its own release note, because the written rule is the only path the freeze gate accepts.",
  window: "The deprecation window spans the release candidates until 2.0.0: version one messages stay accepted with one warning per session and every deprecated field carries its sunset release in docs/deprecation.md."
});

// policy.ts
var sensitiveactions = /* @__PURE__ */ new Set(["click", "type", "navigate", "select", "presskey", "drag", "drop", "upload", "clear", "check", "uncheck", "toggle", "submit", "reload", "back", "forward", "writestorage", "setattribute", "removeattribute", "evaluate", "tabcreate", "tabactivate", "tabclose", "tabreload", "windowcreate", "windowclose", "windowresize", "downloadfile", "clickpoint", "shiftclick", "dismissdialog", "enterframe", "typetime", "appendtext", "setvalue", "typeedit", "keyhold", "keyrelease", "submitsearch", "selectmulti", "chooseradio", "setslider", "setdate", "setcolor", "openlink", "openprivate", "reloadcache", "stopnav", "followlink", "spanav", "rewritequery", "setfragment", "navlist", "navprofile", "handleauth", "printpdf", "prefetch", "preconnect", "deeplink", "reopentab", "pausenav", "navrate", "openclipboard", "batchopen", "duplicatetab", "closepattern", "pintab", "mutetab", "movetab", "movetabwindow", "grouptabs", "colorgroup", "collapsegroup", "discardtab", "reloadtabs", "zoomin", "zoomout", "switchtab", "maximizewindow", "minimizewindow", "restorewindow", "focuswindow", "scratchwindow", "incognitowindow", "restoretab", "restorelayout", "reopenrun", "badgetab", "fillform", "filllabel", "fillplaceholder", "submitform", "retryform", "runwizard", "selectchain", "picktypeahead", "pickdate", "attachfile", "fillcard", "fillcode", "consentpassword", "exportcsv", "exportjson", "exportexcel", "copytable", "pushsheets", "streamdisk", "paginateextract", "resumeextract", "batchdownload", "pausedownload", "resumedownload", "interceptmime", "readclipboard", "writeclipboard", "copyscreen", "quarantinedownload", "scanvirus", "cleanupartifacts", "recordscreen", "captureaudio", "downloadimages", "callrest", "callgraphql", "sendmessage", "blockrequest", "mockresponse", "rewriteheaders", "setcookies", "clearcookies", "authflow", "saveapikey", "routeproxy", "postform", "postfiles", "attachcdp", "detachcdp", "cdpcmd", "overridescript", "heapshot", "profilecpu", "capturesourcemaps", "emulatedevice", "emulatenetwork", "emulatelocate", "setuseragent", "overridepermission", "restoresession", "exportsessions", "importsessions", "runworkflow", "visitrule", "urlrule", "menurule", "keyrule", "buttonrule", "cronrule", "intervalrule", "urllistrule", "webhookrule", "eventrule"]);
var interactionactions = /* @__PURE__ */ new Set(["focus", "scroll", "hover", "clickdeep", "rightclick", "doubleclick", "scrollpage", "scrollby", "scrollend", "scrolltop", "fullscreen", "zoomset", "movepointer", "clicktext", "clickaria", "clickname", "expanddetails", "pierceshadow", "retryaction", "capturebodies", "setbreakpoint", "stepcode", "watchexpr", "loop", "repeatuntil", "whileloop", "foreach", "parallel", "trycatch"]);
var readactions = /* @__PURE__ */ new Set(["observe", "inspect", "extract", "wait", "waitfor", "waittext", "readattribute", "readstyle", "readgeometry", "readvalue", "readtext", "readhtml", "countelements", "readtable", "readlinks", "readimages", "readmeta", "readforms", "readstorage", "highlight", "tablist", "windowlist", "tabsnapshot", "mapclicks", "verifyvisible", "verifyenabled", "resolvexpath", "a11ytree", "readvisible", "readertree", "detectlists", "detecttables", "readjson", "watchmutate", "waitquiet", "watchbanner", "detectinfinitescroll", "detectvirtual", "detectlazy", "readscrollpos", "readlang", "readoutline", "countpages", "listshadow", "listframes", "classifypage", "fingerprintsection", "diffsnapshots", "readselection", "watchfocus", "detectsticky", "detectscrolllock", "readopengraph", "detectlanguage", "deriveselector", "waitload", "waiturl", "spawait", "detecthttp", "readredirects", "readfinalurl", "trailaudit", "navintent", "checksafe", "querytabs", "watchtab", "findclones", "searchtabs", "listaudio", "snapshotsession", "savelayout", "attachmeta", "detectfields", "generatevalues", "saveprofiles", "asksubmit", "readerrors", "skiphoneypot", "detectlogin", "detecttemplate", "handoffcaptcha", "scrapetable", "importcsv", "looprows", "transformvalues", "deduperows", "mergepages", "stamplerows", "previewgrid", "logprovenance", "verifydownload", "exportnetlog", "namecaptures", "shotview", "shotfullpage", "shotelement", "shotregion", "contactsheet", "capturepdf", "captureframe", "readmedia", "readassets", "probestream", "timelapse", "shotcanvas", "convertimage", "makethumbs", "fetchurl", "parsejson", "parsehtml", "opensocket", "waitmessage", "watchrequests", "readheaders", "mapapi", "subscribesse", "longpoll", "extractapi", "readcookies", "watchconsole", "watcherrors", "watchtasks", "watchcdp", "measureflow", "trackmemory", "watchshifts", "traceload", "annotatetrace", "replaytrace", "blackboxscripts", "persiststate", "capturesession", "namedsessions", "diffsessions", "searchsessions", "composeworkflow", "savetemplate", "dryrun", "delay", "waitelement", "compute", "extractvars", "listruns", "condition", "branch"]);
var allowedactions = /* @__PURE__ */ new Set([...sensitiveactions, ...interactionactions, ...readactions]);

// tools.ts
var toolnamespaces = ["browser", "workflow", "memory", "system"];
function namespaceof(name) {
  const head = name.split(".")[0];
  return toolnamespaces.includes(head) ? head : void 0;
}

// serve.ts
function encodemessage(message) {
  return Array.isArray(message) ? JSON.stringify(message) : serializeframe(message);
}
function decodemessage(raw) {
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { error: rpcerrorof("parse", "The wire message does not parse as json.") };
  }
  if (Array.isArray(parsed)) {
    if (parsed.length === 0) return { error: rpcerrorof("params", "A batch message carries at least one frame.") };
    const frames = [];
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
function framesof(message) {
  return Array.isArray(message) ? message : [message];
}
function isnotification(frame) {
  return frame.id === void 0;
}

// mcp.ts
var localhostbind = "127.0.0.1";
function rpcerrorof(code, message, data) {
  return { code, message, ...data !== void 0 ? { data } : {} };
}
function unwraphttppost(value) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const candidate = value;
    if (candidate.transport === "http" && candidate.frame && typeof candidate.frame === "object" && !Array.isArray(candidate.frame)) return candidate.frame;
  }
  return value;
}
function parseframe(raw) {
  const parsed = unwraphttppost(JSON.parse(raw));
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("A json rpc frame must be an object.");
  return parsed;
}
function serializeframe(frame) {
  return JSON.stringify(frame);
}
function bindlocalhost(config) {
  const bind = config.bind !== void 0 && config.bind.trim() !== "" ? config.bind.trim() : localhostbind;
  return { bind, port: config.port, localhost: bind === localhostbind || bind === "localhost" || bind === "::1" };
}

// http.ts
var httpkinds = ["fetchurl", "parsejson", "parsehtml", "callrest", "callgraphql"];
var redirectstatuses = /* @__PURE__ */ new Set([301, 302, 303, 307, 308]);
var bodilessmethods = /* @__PURE__ */ new Set(["GET", "HEAD"]);
function statusclassof(status) {
  if (status >= 100 && status < 200) return "informational";
  if (status >= 200 && status < 300) return "success";
  if (status >= 300 && status < 400) return "redirect";
  if (status >= 400 && status < 500) return "clienterror";
  if (status >= 500 && status < 600) return "servererror";
  return "unknown";
}
function templateurl(template, values) {
  return template.replace(/\{([a-z0-9_]+)\}/gi, (whole, name) => values[name] === void 0 ? whole : String(values[name]));
}
function fetchrequestof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const options = value;
  if (typeof options.url !== "string" || !options.url.trim()) return void 0;
  const request = { url: options.url.trim() };
  if (typeof options.method === "string" && options.method.trim()) request.method = options.method.trim().toUpperCase();
  if (options.headers && typeof options.headers === "object" && !Array.isArray(options.headers)) {
    const headers = {};
    for (const [name, headervalue] of Object.entries(options.headers)) {
      if (typeof headervalue === "string") headers[name] = headervalue;
    }
    request.headers = headers;
  }
  if (typeof options.body === "string") request.body = options.body;
  if (options.mode === "cors" || options.mode === "no-cors" || options.mode === "same-origin") request.mode = options.mode;
  return request;
}
function fetchoptionsof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const options = value;
  const normalized = {};
  if (typeof options.timeout === "number" && Number.isFinite(options.timeout)) normalized.timeout = options.timeout;
  if (typeof options.retries === "number" && Number.isFinite(options.retries)) normalized.retries = options.retries;
  if (typeof options.backoff === "number" && Number.isFinite(options.backoff)) normalized.backoff = options.backoff;
  if (typeof options.follow === "number" && Number.isFinite(options.follow)) normalized.follow = options.follow;
  return normalized;
}
function streamwindowof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const options = value;
  const window = {};
  if (typeof options.budget === "number" && Number.isFinite(options.budget)) window.budget = options.budget;
  return window;
}
function jsonpathrulesof(value) {
  if (!Array.isArray(value)) return [];
  const rules = [];
  for (const item of value) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const entry = item;
    if (typeof entry.name !== "string" || !entry.name.trim()) continue;
    if (typeof entry.path !== "string" || !entry.path.trim()) continue;
    const rule = { name: entry.name.trim(), path: entry.path.trim() };
    if (entry.kind === "text" || entry.kind === "number" || entry.kind === "boolean" || entry.kind === "json") rule.kind = entry.kind;
    if (entry.default !== void 0) rule.default = entry.default;
    rules.push(rule);
  }
  return rules;
}
function htmlqueriesof(value) {
  if (!Array.isArray(value)) return [];
  const queries = [];
  for (const item of value) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const entry = item;
    if (typeof entry.selector !== "string" || !entry.selector.trim()) continue;
    const query = { selector: entry.selector.trim() };
    if (typeof entry.attribute === "string" && entry.attribute.trim()) query.attribute = entry.attribute.trim();
    if (entry.multi === true) query.multi = true;
    queries.push(query);
  }
  return queries;
}
function graphqlrequestof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const options = value;
  if (typeof options.query !== "string" || !options.query.trim()) return void 0;
  if (options.operationkind !== "query" && options.operationkind !== "mutation") return void 0;
  const request = { query: options.query, operationkind: options.operationkind };
  if (options.variables && typeof options.variables === "object" && !Array.isArray(options.variables)) request.variables = options.variables;
  if (typeof options.operationname === "string" && options.operationname.trim()) request.operationname = options.operationname.trim();
  return request;
}
var realsleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, Math.max(0, milliseconds)));
async function sendfetch(input) {
  const options = input.options ?? {};
  const sleep = input.sleep ?? realsleep;
  const now = input.now ?? Date.now;
  const attempts = Math.max(1, Math.floor(options.retries ?? 0) + 1);
  const backoff = options.backoff ?? 0;
  const follow = options.follow ?? Number.POSITIVE_INFINITY;
  let url = input.request.url;
  let method = (input.request.method ?? "GET").toUpperCase();
  let retries = 0;
  let redirects = 0;
  let lastreason = "";
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    let hops = 0;
    const startedat = now();
    let response;
    try {
      const init = { method, headers: { ...input.request.headers ?? {} }, ...input.request.body !== void 0 && !bodilessmethods.has(method) ? { body: input.request.body } : {}, ...input.request.mode !== void 0 ? { mode: input.request.mode } : {}, redirect: follow <= 0 ? "error" : "follow" };
      const sent = input.transport(url, init);
      if (options.timeout !== void 0 && Number.isFinite(options.timeout) && options.timeout >= 0) {
        let timedout = false;
        response = await Promise.race([sent, sleep(options.timeout).then(() => {
          timedout = true;
          return void 0;
        })]).then((value) => value ?? (timedout ? (() => {
          throw new Error(`The request timed out after ${options.timeout} milliseconds.`);
        })() : value));
      } else {
        response = await sent;
      }
      while (response !== void 0 && redirectstatuses.has(response.status) && typeof response.location === "string" && response.location) {
        hops += 1;
        if (hops > follow) throw new Error(`The redirect chain exceeded the reviewed follow limit of ${follow}.`);
        url = new URL(response.location, url).toString();
        if (method === "POST" && [301, 302, 303].includes(response.status)) method = "GET";
        const hopinit = { ...init, method };
        if (bodilessmethods.has(method)) delete hopinit.body;
        response = await input.transport(url, hopinit);
      }
      redirects = hops;
    } catch (error) {
      lastreason = error instanceof Error ? error.message : String(error);
      response = void 0;
    }
    if (response !== void 0) {
      const body = response.body;
      return { url, status: response.status, statusclass: statusclassof(response.status), headernames: Object.keys(response.headers), body, bytes: body.length, duration: now() - startedat, retries, redirects };
    }
    if (attempt < attempts) {
      const wait = backoff * attempt;
      if (wait > 0) await sleep(wait);
      input.onretry?.(attempt, wait, lastreason);
      retries = attempt;
    }
  }
  throw new Error(`The request failed after ${attempts} attempt${attempts === 1 ? "" : "s"} with ${retries} retr${retries === 1 ? "y" : "ies"}: ${lastreason}`);
}
async function readstream(input) {
  const pull = typeof input.chunks === "function" ? input.chunks : /* @__PURE__ */ ((source) => {
    let index = 0;
    return async () => source[index++];
  })(input.chunks);
  let count = 0;
  let total = 0;
  for (; ; ) {
    if (input.window.abort?.() === true) return { chunks: count, bytes: total, aborted: true, reason: "The reviewed abort flag stopped the stream." };
    const chunk = await pull();
    if (chunk === void 0) return { chunks: count, bytes: total, aborted: false };
    const next = total + chunk.length;
    if (input.window.budget !== void 0 && next > input.window.budget) return { chunks: count, bytes: total, aborted: true, reason: `The stream aborted at ${next} bytes past the reviewed byte budget of ${input.window.budget}.` };
    total = next;
    count += 1;
    input.window.onchunk?.(chunk, total);
  }
}
function pathstep(current, segment) {
  if (Array.isArray(current) && /^\d+$/.test(segment)) return current[Number.parseInt(segment, 10)];
  if (current && typeof current === "object" && !Array.isArray(current)) return current[segment];
  return void 0;
}
function coerce(value, kind, fallback) {
  if (value === void 0 || value === null) return { value: fallback, missing: true };
  if (kind === "text") return { value: String(value), missing: false };
  if (kind === "number") {
    const numeric = typeof value === "number" ? value : Number(value);
    return Number.isFinite(numeric) ? { value: numeric, missing: false } : { value: fallback, missing: true };
  }
  if (kind === "boolean") return { value: value === true || value === "true", missing: false };
  return { value, missing: false };
}
function readpath(parsed, rules) {
  const fields = [];
  for (const rule of rules) {
    const kind = rule.kind ?? "text";
    let current = parsed;
    let missing = false;
    for (const segment of rule.path.split(".")) {
      const next = pathstep(current, segment);
      if (next === void 0) {
        missing = true;
        break;
      }
      current = next;
    }
    if (missing) fields.push({ name: rule.name, path: rule.path, kind, ...rule.default !== void 0 ? { value: rule.default } : {}, missing: true });
    else {
      const resolved = coerce(current, kind, rule.default);
      fields.push({ name: rule.name, path: rule.path, kind, ...resolved.value !== void 0 ? { value: resolved.value } : {}, ...resolved.missing ? { missing: true } : {} });
    }
  }
  return fields;
}
function defaultparse() {
  const parser = globalThis.DOMParser;
  if (!parser) throw new Error("parsehtml needs a domparser seam outside the page context.");
  return (markup) => {
    const document = new parser().parseFromString(markup, "text/html");
    return { query: (selector) => Array.from(document.querySelectorAll(selector)).map((element) => ({ text: element.textContent ?? "", attributes: Object.fromEntries(Array.from(element.attributes).map((attribute) => [attribute.name, attribute.value])) })) };
  };
}
function parsehtmlbody(input) {
  const parse = input.parse ?? defaultparse();
  const document = parse(input.body);
  return input.queries.map((query) => {
    const matches = document.query(query.selector);
    const chosen = query.multi === true ? matches : matches.slice(0, 1);
    const values = chosen.map((match) => query.attribute !== void 0 ? match.attributes[query.attribute] ?? "" : match.text);
    return { selector: query.selector, ...query.attribute !== void 0 ? { attribute: query.attribute } : {}, multi: query.multi === true, count: matches.length, values };
  });
}
function payloadvalid(payload, schema) {
  if (!schema) return { ok: false, errors: ["The typed endpoint call needs a reviewed payload schema before it runs."] };
  const errors = [];
  for (const field of schema.fields) {
    const value = payload[field.name];
    if (value === void 0 || value === null) {
      if (field.required === true) errors.push(`The required field ${field.name} of kind ${field.kind} is missing.`);
      continue;
    }
    if (field.kind === "string" && typeof value !== "string") errors.push(`The field ${field.name} must be a string.`);
    if (field.kind === "number" && (typeof value !== "number" || !Number.isFinite(value))) errors.push(`The field ${field.name} must be a finite number.`);
    if (field.kind === "boolean" && typeof value !== "boolean") errors.push(`The field ${field.name} must be a boolean.`);
  }
  return { ok: errors.length === 0, errors };
}
function payloadwithdefaults(payload, schema) {
  if (!schema) return payload;
  const merged = { ...payload };
  for (const field of schema.fields) {
    if (merged[field.name] === void 0 && field.default !== void 0) merged[field.name] = field.default;
  }
  return merged;
}
function errorsof(body) {
  try {
    const parsed = JSON.parse(body);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return [body];
    const record = parsed;
    for (const key of ["errors", "messages", "error", "message"]) {
      const value = record[key];
      if (Array.isArray(value)) return value.map((item) => typeof item === "string" ? item : item && typeof item === "object" && typeof item.message === "string" ? item.message : String(item));
      if (typeof value === "string") return [value];
    }
    return [body];
  } catch {
    return [body];
  }
}
async function callrest(input) {
  const check = payloadvalid(input.payload, input.endpoint.schema);
  if (!check.ok) throw new Error(check.errors.join(" "));
  const payload = payloadwithdefaults(input.payload, input.endpoint.schema);
  const url = templateurl(input.endpoint.url, payload);
  const method = input.endpoint.method.toUpperCase();
  const request = { url, method, ...input.endpoint.headers !== void 0 ? { headers: input.endpoint.headers } : {}, ...bodilessmethods.has(method) ? {} : { body: JSON.stringify(payload) } };
  const transport = await sendfetch({ request, ...input.options !== void 0 ? { options: input.options } : {}, transport: input.transport, ...input.sleep !== void 0 ? { sleep: input.sleep } : {}, ...input.onretry !== void 0 ? { onretry: input.onretry } : {}, ...input.now !== void 0 ? { now: input.now } : {} });
  const ok = input.success !== void 0 ? input.success.includes(transport.status) : transport.statusclass === "success";
  return { transport, url, payload, ok, errors: ok ? [] : errorsof(transport.body) };
}
function graphqlopenvelope(request) {
  return JSON.stringify({ query: request.query, ...request.variables !== void 0 ? { variables: request.variables } : {}, ...request.operationname !== void 0 ? { operationName: request.operationname } : {} });
}
function unwrapgraphql(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { errors: ["The graphql response is not a json object."] };
  const record = value;
  const errors = Array.isArray(record.errors) ? record.errors.map((item) => typeof item === "string" ? item : item && typeof item === "object" && typeof item.message === "string" ? item.message : String(item)) : [];
  return { ...record.data !== void 0 ? { data: record.data } : {}, errors };
}
async function callgraphql(input) {
  const request = { url: input.endpoint.url, method: "POST", ...input.endpoint.headers !== void 0 ? { headers: input.endpoint.headers } : {}, body: graphqlopenvelope(input.request) };
  const transport = await sendfetch({ request, ...input.options !== void 0 ? { options: input.options } : {}, transport: input.transport, ...input.sleep !== void 0 ? { sleep: input.sleep } : {}, ...input.onretry !== void 0 ? { onretry: input.onretry } : {}, ...input.now !== void 0 ? { now: input.now } : {} });
  try {
    const unwrapped = unwrapgraphql(JSON.parse(transport.body));
    return { transport, ...unwrapped.data !== void 0 ? { data: unwrapped.data } : {}, errors: unwrapped.errors };
  } catch {
    return { transport, errors: [transport.body] };
  }
}
function httpendpoint(config) {
  const binding = bindlocalhost(config);
  const path = config.httpstream?.endpoint !== void 0 && config.httpstream.endpoint.trim() !== "" ? config.httpstream.endpoint.trim() : "/mcp";
  return { kind: "http", endpoint: `http://${binding.bind}:${binding.port}${path}`, bind: binding.bind, port: binding.port, localhost: binding.localhost, path };
}
function tlsdecision(input) {
  return starttls({ config: input.config, ...input.presented !== void 0 ? { presented: input.presented } : {}, now: input.now });
}
async function postauth(input) {
  if (input.local) return {};
  if (input.fingerprint === void 0 || input.fingerprint.trim() === "") return { error: { code: "consentrefused", message: "A non localhost connection must complete the auth handshake before any frame routes.", retryhint: "none" } };
  const pipeline = await httpframepipeline({ config: input.config, tokens: input.tokens, ...input.rawtoken !== void 0 ? { rawtoken: input.rawtoken } : {}, allowlist: [], fingerprint: input.fingerprint, ...input.toolname !== void 0 ? { toolname: input.toolname } : {}, now: input.now });
  if (pipeline.error !== void 0) return { error: { code: pipeline.error.code, message: pipeline.error.message, retryhint: "none" } };
  return pipeline.token !== void 0 ? { token: pipeline.token } : {};
}
function parsepost(body) {
  try {
    const parsed = JSON.parse(body);
    if (Array.isArray(parsed)) {
      if (parsed.length === 0) return { error: { code: "parse", message: "The posted body does not parse as one json rpc message." } };
      const frames = [];
      for (const entry of parsed) frames.push(parseframe(JSON.stringify(entry)));
      return { message: frames };
    }
    return { message: parseframe(body) };
  } catch {
    return { error: { code: "parse", message: "The posted body does not parse as one json rpc message." } };
  }
}
function httpanswer(frame) {
  return `${encodemessage(frame)}
`;
}
function sseframe(input) {
  return `id: ${input.id}
event: ${input.event}
data: ${JSON.stringify(input.frame)}

`;
}
function streampathof(config) {
  const binding = bindlocalhost(config);
  const path = config.httpstream?.streampath !== void 0 && config.httpstream.streampath.trim() !== "" ? config.httpstream.streampath.trim() : "/mcp/stream";
  return { path, bind: binding.bind, port: binding.port, localhost: binding.localhost };
}
function routepath(config, path) {
  const endpoint = httpendpoint(config).path;
  const stream = streampathof(config).path;
  if (path === endpoint) return "endpoint";
  if (path === stream) return "stream";
  return void 0;
}
var documentedbind = localhostbind;
var defaultheartbeatms = 3e4;
var defaultidlewindowms = 9e4;
function defaulthttpstream() {
  return { endpoint: "/mcp", streampath: "/mcp/stream", tls: { mode: "off" }, heartbeatms: defaultheartbeatms, idlewindowms: defaultidlewindowms };
}
function openstreamchannel(input) {
  return { id: input.id ?? `channel-${randomchannelid()}`, clientid: input.clientid, openedat: input.now, lastbeatat: input.now };
}
function randomchannelid() {
  return crypto.randomUUID();
}
function heartbeat(input) {
  return input.channels.map((channel) => channel.clientid === input.clientid && channel.closedat === void 0 ? { ...channel, lastbeatat: input.now } : channel);
}
function channellive(channel, now, idlewindow) {
  if (channel.closedat !== void 0) return false;
  return now - channel.lastbeatat < (idlewindow ?? defaultidlewindowms);
}
function closeidlechannels(input) {
  return input.channels.map((channel) => channel.closedat === void 0 && !channellive(channel, input.now, input.idlewindow) ? { ...channel, closedat: input.now } : channel);
}
function starttls(input) {
  if (input.config.mode === "off") return { tls: false, verified: false };
  if (input.config.mode === "required" && input.presented?.fingerprint === void 0) return { tls: false, verified: false, reason: "The remote transport requires tls and the peer presented no certificate." };
  if (input.config.certificatefingerprint !== void 0 && input.presented?.fingerprint !== input.config.certificatefingerprint) return { tls: false, verified: false, reason: "The peer certificate does not match the user configured fingerprint and the remote traffic is refused." };
  return { tls: true, verified: true };
}
function enforcemaxclients(input) {
  if (input.maxclients === void 0) return { allowed: true };
  if (!Number.isFinite(input.maxclients)) return { allowed: false, reason: `The user configured maximum of ${input.maxclients} remote clients is invalid and the connection is refused.` };
  const connected = input.clients.filter((client) => client.disconnectedat === void 0).length;
  if (connected >= input.maxclients) return { allowed: false, reason: `The user configured maximum of ${input.maxclients} remote clients is reached and the connection is refused.` };
  return { allowed: true };
}
function listremotestatus(input) {
  const stream = input.config.httpstream ?? defaulthttpstream();
  const remote = input.config.remoteaccess;
  const idlewindow = stream.idlewindowms;
  const open = input.channels.filter((channel) => channellive(channel, input.now, idlewindow));
  return { endpoint: remote?.endpoint ?? stream.endpoint, tls: tlsstateof(remote?.tls ?? stream.tls), clients: input.clients.filter((client) => client.disconnectedat === void 0).length, paired: input.clients.filter((client) => client.paired && client.disconnectedat === void 0).length, channelsopen: open.length, channelsdead: input.channels.length - open.length, tokenslive: input.tokens.filter((token) => token.revokedat === void 0 && input.now < token.expiresat).length };
}
async function httpframepipeline(input) {
  const stream = input.config.httpstream ?? defaulthttpstream();
  const tls = starttls({ config: input.config.remoteaccess?.tls ?? stream.tls, ...input.presented !== void 0 ? { presented: input.presented } : {}, now: input.now });
  if (tls.reason !== void 0) return { error: rpcerrorof("consentrefused", tls.reason) };
  if (input.rawtoken === void 0) return { error: rpcerrorof("consentrefused", authrefusedmessage) };
  const verified = await verifytoken({ tokens: input.tokens, raw: input.rawtoken, now: input.now });
  if (verified.token === void 0) return { error: rpcerrorof("consentrefused", verified.reason ?? authrefusedmessage) };
  const namespace = input.toolname !== void 0 ? namespaceof(input.toolname) : void 0;
  const listed = checkallowlist({ entries: input.allowlist, fingerprint: input.fingerprint, ...namespace !== void 0 ? { namespace } : {} });
  if (!listed.allowed) return { error: rpcerrorof("consentrefused", listed.reason ?? "The allowlist refused the client.") };
  const scoped = scopecheck(verified.token, namespace);
  if (!scoped.allowed) return { error: rpcerrorof(scoped.fast === true ? "params" : "consentrefused", scoped.reason ?? "The tool call stayed outside the granted scopes.") };
  return { token: verified.token };
}
function newrelayserverstate() {
  return { sessions: [], pairings: [], connections: [], tokens: [], issued: 0 };
}
function relayconnectionopen(state, connectionid, now) {
  if (connectionid.trim() === "") throw new Error("The relay names every connection; an empty connection id never registers.");
  if (state.connections.some((connection) => connection.id === connectionid)) return state;
  return { ...state, connections: [...state.connections, { id: connectionid, role: "", sessionid: "", tokenhash: "", lastframeat: now }] };
}
function relayconnectionclose(state, connectionid) {
  return { ...state, connections: state.connections.filter((connection) => connection.id !== connectionid), tokens: state.tokens.filter((record) => record.connectionid !== connectionid) };
}
function relaylivetokens(session) {
  return session.tokenhashes.filter((hash) => !session.revoked.includes(hash));
}
function relayframeof(envelope) {
  return JSON.stringify(composeenvelope({ ...envelope, version: envelope.version ?? servercontractversion }));
}
function relayserverframe(input) {
  const idof = input.idof ?? (() => {
    const next = input.state.issued + 1;
    return `${next}`;
  });
  const hashof = input.hashof ?? ((token) => token);
  const connection = input.state.connections.find((entry) => entry.id === input.connectionid);
  if (connection === void 0) return { state: input.state, replies: [], routed: [] };
  let envelope;
  try {
    envelope = parsewireframe(input.frame);
  } catch {
    return { state: input.state, replies: [relayframeof({ op: "eventpost", opid: "op-relay-parse", at: input.now, body: { error: "The frame does not parse as a servercontract envelope." } })], routed: [] };
  }
  const touched = { ...connection, lastframeat: input.now };
  const base = { ...input.state, connections: input.state.connections.map((entry) => entry.id === touched.id ? touched : entry), issued: input.state.issued + 1 };
  if (envelope.op === "sessioncreate") {
    const body = envelope.body ?? {};
    if (body.role !== "extension") {
      return { state: base, replies: [relayframeof({ op: "sessioncreate", opid: envelope.opid, at: input.now, body: { error: "The sessioncreate operation serves the extension member only." } })], routed: [] };
    }
    const sessionid = `session-${idof()}`;
    const token = `token-${idof()}`;
    const tokenhash2 = hashof(token);
    const session2 = { id: sessionid, extension: touched.id, site: void 0, events: [], tokenhashes: [tokenhash2], revoked: [] };
    let pairings = base.pairings;
    const pairingcode = typeof body.pairingcode === "string" ? body.pairingcode.trim() : "";
    if (pairingcode !== "") pairings = [...pairings, { code: pairingcode, sessionid, expiresat: input.now + 3e5, used: false }];
    const memberid = typeof body.memberid === "string" ? body.memberid : "";
    const reply = relayframeof({ op: "sessioncreate", opid: envelope.opid, sessionid, token, at: input.now, body: { sessionid, token, capabilities: contractcapabilities(), members: [{ role: "extension", id: memberid, joinedat: input.now }] } });
    return {
      state: {
        ...base,
        sessions: [...base.sessions, session2],
        pairings,
        connections: base.connections.map((entry) => entry.id === touched.id ? { ...entry, role: "extension", sessionid, tokenhash: tokenhash2 } : entry),
        tokens: [...base.tokens.filter((record) => record.connectionid !== touched.id), { connectionid: touched.id, token }]
      },
      replies: [reply],
      routed: []
    };
  }
  if (envelope.op === "sessionjoin") {
    const body = envelope.body ?? {};
    const pairingcode = typeof body.pairingcode === "string" ? body.pairingcode.trim() : "";
    if (pairingcode !== "" && body.role === "site") {
      const pairing = base.pairings.find((entry) => entry.code === pairingcode && !entry.used && input.now < entry.expiresat);
      const session3 = pairing === void 0 ? void 0 : base.sessions.find((entry) => entry.id === pairing.sessionid);
      if (pairing === void 0 || session3 === void 0) {
        return { state: base, replies: [relayframeof({ op: "sessionjoin", opid: envelope.opid, at: input.now, body: { error: "The pairing code matches no pending session of this relay." } })], routed: [] };
      }
      if (session3.site !== void 0) {
        return { state: base, replies: [relayframeof({ op: "sessionjoin", opid: envelope.opid, at: input.now, body: { error: "The relay session holds at most one site member." } })], routed: [] };
      }
      const token2 = `token-${idof()}`;
      const tokenhash3 = hashof(token2);
      const reply2 = relayframeof({ op: "sessionjoin", opid: envelope.opid, sessionid: session3.id, token: token2, at: input.now, body: { sessionid: session3.id, token: token2, capabilities: contractcapabilities() } });
      return {
        state: {
          ...base,
          sessions: base.sessions.map((entry) => entry.id === session3.id ? { ...entry, site: touched.id, tokenhashes: [...entry.tokenhashes, tokenhash3] } : entry),
          pairings: base.pairings.map((entry) => entry.code === pairingcode ? { ...entry, used: true } : entry),
          connections: base.connections.map((entry) => entry.id === touched.id ? { ...entry, role: "site", sessionid: session3.id, tokenhash: tokenhash3 } : entry),
          tokens: [...base.tokens.filter((record) => record.connectionid !== touched.id), { connectionid: touched.id, token: token2 }]
        },
        replies: [reply2],
        routed: []
      };
    }
    const session2 = base.sessions.find((entry) => entry.id === envelope.sessionid);
    const tokenhash2 = typeof envelope.token === "string" ? hashof(envelope.token) : "";
    if (session2 === void 0 || tokenhash2 === "" || !relaylivetokens(session2).includes(tokenhash2)) {
      return { state: base, replies: [relayframeof({ op: "sessionjoin", opid: envelope.opid, at: input.now, body: { error: "The sessionjoin frame failed the token authentication." } })], routed: [] };
    }
    const token = `token-${idof()}`;
    const nexttokenhash = hashof(token);
    const role = body.role === "extension" || body.role === "site" ? body.role : touched.role;
    const reply = relayframeof({ op: "sessionjoin", opid: envelope.opid, sessionid: session2.id, token, at: input.now, body: { sessionid: session2.id, token, capabilities: contractcapabilities(), rotated: true } });
    return {
      state: {
        ...base,
        sessions: base.sessions.map((entry) => entry.id === session2.id ? { ...entry, tokenhashes: [...entry.tokenhashes, nexttokenhash], revoked: [...entry.revoked, tokenhash2], ...role === "extension" ? { extension: touched.id } : role === "site" ? { site: touched.id } : {} } : entry),
        connections: base.connections.map((entry) => entry.id === touched.id ? { ...entry, role: role === "" ? entry.role : role, sessionid: session2.id, tokenhash: nexttokenhash } : entry),
        tokens: [...base.tokens.filter((record) => record.connectionid !== touched.id), { connectionid: touched.id, token }]
      },
      replies: [reply],
      routed: []
    };
  }
  const session = base.sessions.find((entry) => entry.id === envelope.sessionid);
  const tokenhash = typeof envelope.token === "string" ? hashof(envelope.token) : "";
  if (session === void 0 || tokenhash === "" || !relaylivetokens(session).includes(tokenhash)) {
    return { state: base, replies: [relayframeof({ op: envelope.op, opid: envelope.opid, at: input.now, body: { error: "The frame failed the token authentication of its session." } })], routed: [] };
  }
  if (envelope.op === "eventstream") {
    const streams = Array.isArray(envelope.body?.streams) ? envelope.body?.streams : [];
    const reply = relayframeof({ op: "eventstream", opid: envelope.opid, sessionid: session.id, ...envelope.token !== void 0 ? { token: envelope.token } : {}, at: input.now, body: { streams, subscribed: true } });
    return { state: base, replies: [reply], routed: [] };
  }
  if (envelope.op === "eventpost") {
    const kind = typeof envelope.body?.kind === "string" ? envelope.body.kind : "";
    const stream = typeof envelope.body?.stream === "string" ? envelope.body.stream : "";
    const event = { opid: envelope.opid, kind, stream, at: input.now };
    const routed = [session.extension, session.site].filter((id) => id !== void 0 && id !== touched.id).map((memberid) => {
      const membertoken = base.tokens.find((record) => record.connectionid === memberid)?.token ?? "";
      return { connectionid: memberid, frame: relayframeof({ op: "eventpost", opid: envelope.opid, sessionid: session.id, token: membertoken, at: input.now, body: envelope.body ?? {} }) };
    });
    const reply = relayframeof({ op: "eventpost", opid: envelope.opid, sessionid: session.id, ...envelope.token !== void 0 ? { token: envelope.token } : {}, at: input.now, body: { accepted: true } });
    return {
      state: { ...base, sessions: base.sessions.map((entry) => entry.id === session.id ? { ...entry, events: [...entry.events, event] } : entry) },
      replies: [reply],
      routed
    };
  }
  return { state: base, replies: [relayframeof({ op: envelope.op, opid: envelope.opid, at: input.now, body: { error: "The operation sits outside the servercontract." } })], routed: [] };
}
function relayidleconnections(state, now, idlewindow) {
  if (idlewindow === void 0 || !Number.isFinite(idlewindow) || idlewindow <= 0) return [];
  return state.connections.filter((connection) => now - connection.lastframeat >= idlewindow).map((connection) => connection.id);
}
function relaypendingpairings(state, now) {
  return state.pairings.filter((pairing) => !pairing.used && now < pairing.expiresat).map((pairing) => pairing.code);
}
function splitlines(buffer) {
  if (!buffer.includes("\n")) return { lines: [], rest: buffer };
  const parts = buffer.split("\n");
  const rest = parts.pop() ?? "";
  const lines = parts.map((line) => line.trim()).filter((line) => line !== "");
  return { lines, rest };
}
function stdiotransport(now) {
  return { kind: "stdio", endpoint: "stdio://devthink", startedat: now, received: 0, sent: 0 };
}
function createlinepump(input) {
  let buffer = "";
  let record = stdiotransport(input.now);
  const feed = async (chunk) => {
    buffer = `${buffer}${chunk}`;
    for (; ; ) {
      const newline = buffer.indexOf("\n");
      if (newline < 0) return;
      const line = buffer.slice(0, newline).trim();
      buffer = buffer.slice(newline + 1);
      if (line === "") continue;
      record = { ...record, received: record.received + 1, lastframeat: input.now };
      const decoded = decodemessage(line);
      if (decoded.error !== void 0) {
        input.write(`${JSON.stringify({ jsonrpc: "2.0", id: null, error: decoded.error })}
`);
        record = { ...record, sent: record.sent + 1 };
        continue;
      }
      const frames = framesof(decoded.message);
      const answers = [];
      for (const frame of frames) {
        if (isnotification(frame)) continue;
        try {
          const answer = await input.handle(frame);
          if (answer !== void 0) answers.push(answer);
        } catch (error) {
          answers.push({ jsonrpc: "2.0", id: frame.id ?? null, error: { code: "internal", message: error instanceof Error ? error.message : String(error) } });
        }
      }
      for (const answer of answers) {
        input.write(`${encodemessage(answer)}
`);
        record = { ...record, sent: record.sent + 1 };
      }
    }
  };
  return { feed, record: () => record, close: (now) => {
    record = { ...record, closedat: now };
    return record;
  } };
}
export {
  callgraphql,
  callrest,
  channellive,
  closeidlechannels,
  createlinepump,
  defaultheartbeatms,
  defaulthttpstream,
  defaultidlewindowms,
  documentedbind,
  enforcemaxclients,
  fetchoptionsof,
  fetchrequestof,
  graphqlopenvelope,
  graphqlrequestof,
  heartbeat,
  htmlqueriesof,
  httpanswer,
  httpendpoint,
  httpframepipeline,
  httpkinds,
  jsonpathrulesof,
  listremotestatus,
  newrelayserverstate,
  openstreamchannel,
  parsehtmlbody,
  parsepost,
  payloadvalid,
  payloadwithdefaults,
  postauth,
  readpath,
  readstream,
  relayconnectionclose,
  relayconnectionopen,
  relayframeof,
  relayidleconnections,
  relaylivetokens,
  relaypendingpairings,
  relayserverframe,
  routepath,
  sendfetch,
  splitlines,
  sseframe,
  starttls,
  statusclassof,
  stdiotransport,
  streampathof,
  streamwindowof,
  templateurl,
  tlsdecision,
  unwrapgraphql
};
//# sourceMappingURL=http.js.map
