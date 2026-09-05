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
function urlencodeform(fields) {
  return fields.map((field) => `${formencode(field.name)}=${formencode(field.value)}`).join("&");
}
function formencode(value) {
  const bytes = [...new TextEncoder().encode(value)];
  return bytes.map((byte) => byte >= 65 && byte <= 90 || byte >= 97 && byte <= 122 || byte >= 48 && byte <= 57 || byte === 45 || byte === 95 || byte === 46 || byte === 126 ? String.fromCharCode(byte) : `%${byte.toString(16).toUpperCase().padStart(2, "0")}`).join("");
}

// net.ts
function pathstep(current, segment) {
  if (Array.isArray(current) && /^\d+$/.test(segment)) return current[Number.parseInt(segment, 10)];
  if (current && typeof current === "object" && !Array.isArray(current)) return current[segment];
  return void 0;
}
function parsessetext(text) {
  const separator = text.lastIndexOf("\n\n");
  const complete = separator === -1 ? "" : text.slice(0, separator + 2);
  const rest = separator === -1 ? text : text.slice(separator + 2);
  const events = [];
  for (const block of complete.split(/\n\n/)) {
    const id = [];
    const names = [];
    const data = [];
    let retry;
    for (const line of block.split("\n")) {
      if (line === "" || line.startsWith(":")) continue;
      const colon = line.indexOf(":");
      const field = colon === -1 ? line : line.slice(0, colon);
      let value = colon === -1 ? "" : line.slice(colon + 1);
      if (value.startsWith(" ")) value = value.slice(1);
      if (field === "id" && value !== "") id.push(value);
      if (field === "event" && value !== "") names.push(value);
      if (field === "data") data.push(value);
      if (field === "retry" && /^\d+$/.test(value)) retry = Number.parseInt(value, 10);
    }
    if (id.length === 0 && names.length === 0 && data.length === 0) continue;
    events.push({ ...id.length > 0 ? { id: id[id.length - 1] } : {}, ...names.length > 0 ? { event: names[names.length - 1] } : {}, data: data.join("\n"), ...retry !== void 0 ? { retry } : {} });
  }
  return { events, rest };
}
function sserequestheaders(record) {
  return { accept: "text/event-stream", ...record.lasteventid !== void 0 && record.lasteventid !== "" ? { "last-event-id": record.lasteventid } : {} };
}
function cursorfrom(response, field) {
  let current = response;
  for (const segment of field.split(".")) {
    const next = pathstep(current, segment);
    if (next === void 0) return void 0;
    current = next;
  }
  return current === void 0 || current === null ? void 0 : String(current);
}
function pollurl(cursor, value) {
  if (cursor.param === void 0 || value === void 0) {
    return { url: cursor.url, ...value !== void 0 ? { body: JSON.stringify({ [cursor.cursorfield]: value }) } : {} };
  }
  const url = new URL(cursor.url);
  url.searchParams.set(cursor.param, value);
  return { url: url.toString() };
}
function polldecision(input) {
  if (input.cancelled?.() === true) return { continue: false, reason: "The long poll loop was cancelled." };
  if (input.expiresat !== void 0 && input.now >= input.expiresat) return { continue: false, reason: "The long poll loop stopped at the reviewed plan expiry." };
  const stopvalue = cursorfrom(input.response, input.cursor.stop.field);
  if (stopvalue !== void 0 && stopvalue === input.cursor.stop.equals) return { continue: false, reason: `The stop condition matched ${input.cursor.stop.field} ${stopvalue}.` };
  if (input.cursor.maxpolls !== void 0 && input.polls + 1 >= input.cursor.maxpolls) return { continue: false, reason: `The long poll loop reached the reviewed poll ceiling of ${input.cursor.maxpolls}.` };
  const value = cursorfrom(input.response, input.cursor.cursorfield);
  const next = pollurl(input.cursor, value);
  return { continue: true, reason: "The long poll loop continues.", ...value !== void 0 ? { cursor: value } : {}, next: { ...next, wait: input.cursor.interval } };
}
function retryafterof(status, headers) {
  if (status !== 429 && status !== 503) return void 0;
  for (const key of Object.keys(headers)) {
    if (key.toLowerCase() !== "retry-after") continue;
    const raw = headers[key];
    if (raw === void 0) continue;
    const value = raw.trim();
    const seconds = Number(value);
    if (Number.isFinite(seconds) && seconds >= 0) return seconds * 1e3;
    const date = Date.parse(value);
    if (Number.isFinite(date)) return Math.max(0, date - Date.now());
    return void 0;
  }
  return void 0;
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

// memory.ts
function randomid() {
  return crypto.randomUUID();
}

// security.ts
var vaultdigestprefix = "sha256:";
async function vaultdigestof(value) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return vaultdigestprefix + [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
function vaultentryof(input) {
  if (input.label.trim() === "") throw new Error("The vault record needs its label; the surfaces show the label only.");
  if (input.scope.trim() === "") throw new Error("The vault record needs its exact origin scope; a secret never rides every origin.");
  if (!input.digest.startsWith(vaultdigestprefix)) throw new Error("The vault record carries its sha-256 digest, never its value.");
  return { vaultid: input.vaultid ?? randomid(), label: input.label.trim(), scope: input.scope.trim(), profileid: input.profileid, provenance: input.provenance, algorithm: "sha-256", digest: input.digest, createdat: input.now };
}
async function vaultstore(input) {
  if (input.value === "") throw new Error("The vault stores a secret value the user supplied; an empty value stores nothing.");
  const entry = vaultentryof({ label: input.label, scope: input.scope, profileid: input.profileid, provenance: input.provenance, digest: await vaultdigestof(input.value), now: input.now });
  await input.seam.put(entry.vaultid, input.value);
  return entry;
}
async function vaultvaluefor(input) {
  const value = await input.seam.fetch(input.entry.vaultid);
  if (value === void 0) return { ok: false, reason: `The vault holds no value behind the label ${input.entry.label}; add the secret again.` };
  return { ok: true, value, reason: `The vault released the value behind the label ${input.entry.label} at the last possible moment; the value reaches the credential field only and no log records it.` };
}
async function vaultdelete(input) {
  await input.seam.drop(input.entry.vaultid);
  return { dropped: true, label: input.entry.label, reason: `The vault dropped the secret ${input.entry.label} of ${input.entry.scope}; no value and no copy remains behind the seam.` };
}
async function secretleakscan(input) {
  const leaks = [];
  for (const candidate of input.candidates) {
    if (candidate.trim() === "") continue;
    const digest = await vaultdigestof(candidate);
    if (input.entries.some((entry) => entry.digest === digest)) leaks.push(candidate);
  }
  if (leaks.length > 0) return { leaks, reason: `The plan carries ${leaks.length} plaintext value${leaks.length === 1 ? "" : "s"} that digest to vault records; secrets never ride step options, variables or plan texts, only the vault holds them.` };
  return { leaks: [], reason: "No candidate value digests to a vault record; the plan carries no leaked secret." };
}

// policy.ts
var sensitiveactions = /* @__PURE__ */ new Set(["click", "type", "navigate", "select", "presskey", "drag", "drop", "upload", "clear", "check", "uncheck", "toggle", "submit", "reload", "back", "forward", "writestorage", "setattribute", "removeattribute", "evaluate", "tabcreate", "tabactivate", "tabclose", "tabreload", "windowcreate", "windowclose", "windowresize", "downloadfile", "clickpoint", "shiftclick", "dismissdialog", "enterframe", "typetime", "appendtext", "setvalue", "typeedit", "keyhold", "keyrelease", "submitsearch", "selectmulti", "chooseradio", "setslider", "setdate", "setcolor", "openlink", "openprivate", "reloadcache", "stopnav", "followlink", "spanav", "rewritequery", "setfragment", "navlist", "navprofile", "handleauth", "printpdf", "prefetch", "preconnect", "deeplink", "reopentab", "pausenav", "navrate", "openclipboard", "batchopen", "duplicatetab", "closepattern", "pintab", "mutetab", "movetab", "movetabwindow", "grouptabs", "colorgroup", "collapsegroup", "discardtab", "reloadtabs", "zoomin", "zoomout", "switchtab", "maximizewindow", "minimizewindow", "restorewindow", "focuswindow", "scratchwindow", "incognitowindow", "restoretab", "restorelayout", "reopenrun", "badgetab", "fillform", "filllabel", "fillplaceholder", "submitform", "retryform", "runwizard", "selectchain", "picktypeahead", "pickdate", "attachfile", "fillcard", "fillcode", "consentpassword", "exportcsv", "exportjson", "exportexcel", "copytable", "pushsheets", "streamdisk", "paginateextract", "resumeextract", "batchdownload", "pausedownload", "resumedownload", "interceptmime", "readclipboard", "writeclipboard", "copyscreen", "quarantinedownload", "scanvirus", "cleanupartifacts", "recordscreen", "captureaudio", "downloadimages", "callrest", "callgraphql", "sendmessage", "blockrequest", "mockresponse", "rewriteheaders", "setcookies", "clearcookies", "authflow", "saveapikey", "routeproxy", "postform", "postfiles", "attachcdp", "detachcdp", "cdpcmd", "overridescript", "heapshot", "profilecpu", "capturesourcemaps", "emulatedevice", "emulatenetwork", "emulatelocate", "setuseragent", "overridepermission", "restoresession", "exportsessions", "importsessions", "runworkflow", "visitrule", "urlrule", "menurule", "keyrule", "buttonrule", "cronrule", "intervalrule", "urllistrule", "webhookrule", "eventrule"]);
var interactionactions = /* @__PURE__ */ new Set(["focus", "scroll", "hover", "clickdeep", "rightclick", "doubleclick", "scrollpage", "scrollby", "scrollend", "scrolltop", "fullscreen", "zoomset", "movepointer", "clicktext", "clickaria", "clickname", "expanddetails", "pierceshadow", "retryaction", "capturebodies", "setbreakpoint", "stepcode", "watchexpr", "loop", "repeatuntil", "whileloop", "foreach", "parallel", "trycatch"]);
var readactions = /* @__PURE__ */ new Set(["observe", "inspect", "extract", "wait", "waitfor", "waittext", "readattribute", "readstyle", "readgeometry", "readvalue", "readtext", "readhtml", "countelements", "readtable", "readlinks", "readimages", "readmeta", "readforms", "readstorage", "highlight", "tablist", "windowlist", "tabsnapshot", "mapclicks", "verifyvisible", "verifyenabled", "resolvexpath", "a11ytree", "readvisible", "readertree", "detectlists", "detecttables", "readjson", "watchmutate", "waitquiet", "watchbanner", "detectinfinitescroll", "detectvirtual", "detectlazy", "readscrollpos", "readlang", "readoutline", "countpages", "listshadow", "listframes", "classifypage", "fingerprintsection", "diffsnapshots", "readselection", "watchfocus", "detectsticky", "detectscrolllock", "readopengraph", "detectlanguage", "deriveselector", "waitload", "waiturl", "spawait", "detecthttp", "readredirects", "readfinalurl", "trailaudit", "navintent", "checksafe", "querytabs", "watchtab", "findclones", "searchtabs", "listaudio", "snapshotsession", "savelayout", "attachmeta", "detectfields", "generatevalues", "saveprofiles", "asksubmit", "readerrors", "skiphoneypot", "detectlogin", "detecttemplate", "handoffcaptcha", "scrapetable", "importcsv", "looprows", "transformvalues", "deduperows", "mergepages", "stamplerows", "previewgrid", "logprovenance", "verifydownload", "exportnetlog", "namecaptures", "shotview", "shotfullpage", "shotelement", "shotregion", "contactsheet", "capturepdf", "captureframe", "readmedia", "readassets", "probestream", "timelapse", "shotcanvas", "convertimage", "makethumbs", "fetchurl", "parsejson", "parsehtml", "opensocket", "waitmessage", "watchrequests", "readheaders", "mapapi", "subscribesse", "longpoll", "extractapi", "readcookies", "watchconsole", "watcherrors", "watchtasks", "watchcdp", "measureflow", "trackmemory", "watchshifts", "traceload", "annotatetrace", "replaytrace", "blackboxscripts", "persiststate", "capturesession", "namedsessions", "diffsessions", "searchsessions", "composeworkflow", "savetemplate", "dryrun", "delay", "waitelement", "compute", "extractvars", "listruns", "condition", "branch"]);
var allowedactions = /* @__PURE__ */ new Set([...sensitiveactions, ...interactionactions, ...readactions]);
function gatewaybaseurlgate(input) {
  const url = input.baseurl.trim();
  if (url === "") return { allowed: false, reason: `The ${input.kind} provider needs the user configured base url; no provider endpoint is contacted unless the user configured one.` };
  if (/(^|\/)\.\.?(\/|$)/.test(url)) return { allowed: false, reason: `The ${input.kind} base url path carries a relative segment; the per provider path prefix stays a plain namespace.` };
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return { allowed: false, reason: `The ${input.kind} base url ${url} does not parse as an absolute url.` };
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return { allowed: false, reason: `The ${input.kind} base url must speak http or https; the ${parsed.protocol} scheme never leaves the gate.` };
  if (parsed.hostname === "") return { allowed: false, reason: `The ${input.kind} base url carries no host.` };
  if (parsed.search !== "" || parsed.hash !== "") return { allowed: false, reason: `The ${input.kind} base url carries a query or a fragment; the base url holds the scheme, the host and its path shape only.` };
  const segments = parsed.pathname.split("/");
  if (segments.some((segment) => segment === ".." || segment === ".")) return { allowed: false, reason: `The ${input.kind} base url path carries a relative segment; the per provider path prefix stays a plain namespace.` };
  const local = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1" || parsed.hostname === "::1" || parsed.hostname === "[::1]" || parsed.hostname.endsWith(".localhost");
  if (input.kind === "ollamalocal" && !local) return { allowed: false, reason: `The ollamalocal adapter speaks to a localhost endpoint only; the ${parsed.hostname} host is a cloud address the adapter never contacts.` };
  if (input.kind !== "ollamalocal" && !local && parsed.protocol !== "https:") return { allowed: false, reason: `The ${input.kind} provider is a remote endpoint and must speak https; a plain http url never carries a provider key.` };
  return { allowed: true };
}
function gatewayprefixgate(prefix) {
  const value = prefix.trim();
  if (value === "") return { allowed: true };
  if (value.includes("?") || value.includes("#")) return { allowed: false, reason: "The gateway path prefix carries a query or a fragment; the prefix stays a plain namespace path." };
  const segments = value.replace(/^\//, "").replace(/\/$/, "").split("/");
  if (segments.some((segment) => segment === ".." || segment === "." || segment === "")) return { allowed: false, reason: "The gateway path prefix carries a relative or empty segment; the prefix stays a plain namespace path." };
  return { allowed: true };
}
function gatewayconsentgate(input) {
  if (!input.config.enabled) return { allowed: false, reason: `The ${input.config.kind} provider stays disabled; every provider ships off until the user turns it on.` };
  const local = input.local ?? input.config.kind === "ollamalocal";
  if (local) return { allowed: true, reason: "The local runtime call never leaves the machine, so no remote consent applies." };
  if (input.config.consented !== true) return { allowed: false, reason: `The ${input.config.kind} provider has no consent stamp yet; the gate asks the user before the first call to any remote provider.` };
  return { allowed: true };
}
function gatewaykeyconsentgate(input) {
  if (!input.consent) return { allowed: false, reason: `The provider key of ${input.providerid} enters the vault only under the explicit consent of the user; a standing credential never stores silently.` };
  return { allowed: true };
}
function gatewayretrycapvalid(retries) {
  if (retries === void 0) return { allowed: true };
  if (!Number.isFinite(retries) || retries < 0 || Math.floor(retries) !== retries) return { allowed: false, reason: `The configured retry cap of ${String(retries)} is not a finite non negative count.` };
  return { allowed: true };
}

// llm.ts
var defaultrefusalmarkers = ["i cannot", "i can't", "i'm unable", "refusal:", "cannot comply"];
function buildrequest(input) {
  const headers = { "content-type": "application/json" };
  let url = input.provider.endpoint;
  const style = input.provider.style;
  if (style === "chatcompletions") {
    if (input.apikey !== void 0 && input.apikey.trim() !== "") headers.authorization = `Bearer ${input.apikey}`;
    const body2 = { model: input.model, messages: input.messages.map((message) => ({ role: message.role, content: message.content })), ...input.temperature !== void 0 ? { temperature: input.temperature } : {}, ...input.maxtokens !== void 0 ? { "max_tokens": input.maxtokens } : {}, ...input.stream === true ? { stream: true } : {} };
    return { url, method: "POST", headers: { ...headers, ...input.provider.headers ?? {} }, body: JSON.stringify(body2) };
  }
  if (style === "responses") {
    if (input.apikey !== void 0 && input.apikey.trim() !== "") headers.authorization = `Bearer ${input.apikey}`;
    const system2 = input.messages.filter((message) => message.role === "system").map((message) => message.content).join("\n");
    const turns2 = input.messages.filter((message) => message.role !== "system").map((message) => ({ role: message.role === "assistant" ? "assistant" : "user", content: message.content }));
    const body2 = { model: input.model, input: turns2, ...system2.trim() !== "" ? { instructions: system2 } : {}, ...input.temperature !== void 0 ? { temperature: input.temperature } : {}, ...input.maxtokens !== void 0 ? { "max_output_tokens": input.maxtokens } : {}, ...input.stream === true ? { stream: true } : {} };
    return { url, method: "POST", headers: { ...headers, ...input.provider.headers ?? {} }, body: JSON.stringify(body2) };
  }
  if (style === "messages") {
    if (input.apikey !== void 0 && input.apikey.trim() !== "") headers["x-api-key"] = input.apikey;
    const system2 = input.messages.filter((message) => message.role === "system").map((message) => message.content).join("\n");
    const turns2 = input.messages.filter((message) => message.role !== "system").map((message) => ({ role: message.role, content: message.content }));
    const body2 = { model: input.model, messages: turns2, ...system2.trim() !== "" ? { system: system2 } : {}, ...input.temperature !== void 0 ? { temperature: input.temperature } : {}, ...input.maxtokens !== void 0 ? { "max_tokens": input.maxtokens } : {}, ...input.stream === true ? { stream: true } : {} };
    return { url, method: "POST", headers: { ...headers, ...input.provider.headers ?? {} }, body: JSON.stringify(body2) };
  }
  if (input.apikey !== void 0 && input.apikey.trim() !== "") url = `${url}${url.includes("?") ? "&" : "?"}key=${encodeURIComponent(input.apikey)}`;
  const system = input.messages.filter((message) => message.role === "system").map((message) => message.content).join("\n");
  const turns = input.messages.filter((message) => message.role !== "system").map((message) => ({ role: message.role === "assistant" ? "model" : "user", parts: [{ text: message.content }] }));
  const body = { contents: turns, ...system.trim() !== "" ? { systemInstruction: { parts: [{ text: system }] } } : {}, ...input.temperature !== void 0 ? { generationConfig: { temperature: input.temperature, ...input.maxtokens !== void 0 ? { maxOutputTokens: input.maxtokens } : {} } } : input.maxtokens !== void 0 ? { generationConfig: { maxOutputTokens: input.maxtokens } } : {} };
  return { url, method: "POST", headers: { ...headers, ...input.provider.headers ?? {} }, body: JSON.stringify(body) };
}
function numberof(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : void 0;
}
function parsecompletion(style, body) {
  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch {
    return { reason: "The provider answer is not json." };
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return { reason: "The provider answer is not a json object." };
  const record = parsed;
  if (style === "chatcompletions") {
    const choice = Array.isArray(record.choices) ? record.choices[0] : void 0;
    const message = choice !== void 0 && choice.message !== void 0 && typeof choice.message === "object" ? choice.message : void 0;
    if (message === void 0 || typeof message.content !== "string") return { reason: "The chat completions answer carries no message content." };
    const usage2 = record.usage !== void 0 && typeof record.usage === "object" ? record.usage : void 0;
    const prompttokens2 = usage2 !== void 0 ? numberof(usage2["prompt_tokens"]) : void 0;
    const completiontokens2 = usage2 !== void 0 ? numberof(usage2["completion_tokens"]) : void 0;
    const totaltokens2 = usage2 !== void 0 ? numberof(usage2["total_tokens"]) : void 0;
    return { text: message.content, ...prompttokens2 !== void 0 || completiontokens2 !== void 0 || totaltokens2 !== void 0 ? { usage: { prompttokens: prompttokens2 ?? 0, completiontokens: completiontokens2 ?? 0, totaltokens: totaltokens2 ?? (prompttokens2 ?? 0) + (completiontokens2 ?? 0) } } : {} };
  }
  if (style === "responses") {
    const direct = typeof record["output_text"] === "string" ? record["output_text"] : void 0;
    let text = direct;
    if (text === void 0 && Array.isArray(record.output)) {
      const parts2 = [];
      for (const item of record.output) {
        if (item && typeof item === "object" && Array.isArray(item.content)) {
          for (const part of item.content) {
            if (part && typeof part === "object" && part.type === "output_text" && typeof part.text === "string") parts2.push(part.text);
          }
        }
      }
      if (parts2.length > 0) text = parts2.join("");
    }
    if (text === void 0) return { reason: "The responses answer carries no output text." };
    const usage2 = record.usage !== void 0 && typeof record.usage === "object" ? record.usage : void 0;
    const prompttokens2 = usage2 !== void 0 ? numberof(usage2["input_tokens"]) : void 0;
    const completiontokens2 = usage2 !== void 0 ? numberof(usage2["output_tokens"]) : void 0;
    const totaltokens2 = usage2 !== void 0 ? numberof(usage2["total_tokens"]) : void 0;
    return { text, ...prompttokens2 !== void 0 || completiontokens2 !== void 0 || totaltokens2 !== void 0 ? { usage: { prompttokens: prompttokens2 ?? 0, completiontokens: completiontokens2 ?? 0, totaltokens: totaltokens2 ?? (prompttokens2 ?? 0) + (completiontokens2 ?? 0) } } : {} };
  }
  if (style === "messages") {
    const parts2 = [];
    if (Array.isArray(record.content)) {
      for (const part of record.content) {
        if (part && typeof part === "object" && part.type === "text" && typeof part.text === "string") parts2.push(part.text);
      }
    }
    if (parts2.length === 0) return { reason: "The messages answer carries no text block." };
    const usage2 = record.usage !== void 0 && typeof record.usage === "object" ? record.usage : void 0;
    const prompttokens2 = usage2 !== void 0 ? numberof(usage2["input_tokens"]) : void 0;
    const completiontokens2 = usage2 !== void 0 ? numberof(usage2["output_tokens"]) : void 0;
    return { text: parts2.join(""), ...prompttokens2 !== void 0 || completiontokens2 !== void 0 ? { usage: { prompttokens: prompttokens2 ?? 0, completiontokens: completiontokens2 ?? 0, totaltokens: (prompttokens2 ?? 0) + (completiontokens2 ?? 0) } } : {} };
  }
  const candidate = Array.isArray(record.candidates) ? record.candidates[0] : void 0;
  const content = candidate !== void 0 && candidate.content !== void 0 && typeof candidate.content === "object" ? candidate.content.parts : void 0;
  const parts = [];
  if (Array.isArray(content)) {
    for (const part of content) {
      if (part && typeof part === "object" && typeof part.text === "string") parts.push(part.text);
    }
  }
  if (parts.length === 0) return { reason: "The gemini answer carries no candidate text." };
  const usage = record.usageMetadata !== void 0 && typeof record.usageMetadata === "object" ? record.usageMetadata : void 0;
  const prompttokens = usage !== void 0 ? numberof(usage.promptTokenCount) : void 0;
  const completiontokens = usage !== void 0 ? numberof(usage.candidatesTokenCount) : void 0;
  const totaltokens = usage !== void 0 ? numberof(usage.totalTokenCount) : void 0;
  return { text: parts.join(""), ...prompttokens !== void 0 || completiontokens !== void 0 || totaltokens !== void 0 ? { usage: { prompttokens: prompttokens ?? 0, completiontokens: completiontokens ?? 0, totaltokens: totaltokens ?? (prompttokens ?? 0) + (completiontokens ?? 0) } } : {} };
}
function islocalorigin(url) {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host === "localhost" || host === "127.0.0.1" || host === "::1" || host === "[::1]" || host.endsWith(".localhost");
  } catch {
    return false;
  }
}
function streamdelta(style, event) {
  let parsed;
  try {
    parsed = JSON.parse(event);
  } catch {
    return "";
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return "";
  const record = parsed;
  if (style === "chatcompletions") {
    const choice = Array.isArray(record.choices) ? record.choices[0] : void 0;
    const delta = choice !== void 0 && choice.delta !== void 0 && typeof choice.delta === "object" ? choice.delta.content : void 0;
    return typeof delta === "string" ? delta : "";
  }
  if (style === "responses") {
    if (record.type === "response.output_text.delta" && typeof record.delta === "string") return record.delta;
    return "";
  }
  if (style === "messages") {
    if (record.type === "content_block_delta" && record.delta !== void 0 && typeof record.delta === "object" && typeof record.delta.text === "string") return record.delta.text;
    return "";
  }
  const candidate = Array.isArray(record.candidates) ? record.candidates[0] : void 0;
  const content = candidate !== void 0 && candidate.content !== void 0 && typeof candidate.content === "object" ? candidate.content.parts : void 0;
  if (!Array.isArray(content)) return "";
  const parts = [];
  for (const part of content) {
    if (part && typeof part === "object" && typeof part.text === "string") parts.push(part.text);
  }
  return parts.join("");
}
function parsestream(style, body) {
  const tokens = [];
  let seq = 0;
  let done = false;
  for (const line of body.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed === "") continue;
    if (!trimmed.startsWith("data:")) continue;
    const payload = trimmed.slice(5).trim();
    if (payload === "[DONE]") {
      done = true;
      continue;
    }
    const text = streamdelta(style, payload);
    if (text === "") continue;
    seq += 1;
    tokens.push({ seq, text, done: false });
  }
  if (tokens.length > 0 && done) tokens[tokens.length - 1] = { ...tokens[tokens.length - 1], done: true };
  return tokens;
}
function stripguardrails(text) {
  let candidate = text;
  const open = text.indexOf("```");
  if (open !== -1) {
    let cursor = open + 3;
    while (cursor < text.length) {
      const tag = text[cursor] ?? "";
      if (!(tag >= "a" && tag <= "z" || tag >= "A" && tag <= "Z")) break;
      cursor += 1;
    }
    while (cursor < text.length) {
      const space = text[cursor] ?? "";
      if (space !== " " && space !== "	" && space !== "\r" && space !== "\n") break;
      cursor += 1;
    }
    const close = text.indexOf("```", cursor);
    if (close !== -1) candidate = text.slice(cursor, close);
  }
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start >= 0 && end > start) return candidate.slice(start, end + 1);
  const arraystart = candidate.indexOf("[");
  const arrayend = candidate.lastIndexOf("]");
  if (arraystart >= 0 && arrayend > arraystart) return candidate.slice(arraystart, arrayend + 1);
  return candidate.trim();
}
function parseoutput(input) {
  const raw = input.text;
  const stripped = stripguardrails(raw);
  const markers = input.guard.refusalmarkers ?? defaultrefusalmarkers;
  const lowered = stripped.toLowerCase();
  for (const marker of markers) if (marker.trim() !== "" && lowered.includes(marker.toLowerCase())) return { raw, verdict: "refused", reason: `The model answer carries the refusal marker ${marker}.`, attempts: 1 };
  let parsed;
  try {
    parsed = JSON.parse(stripped);
  } catch {
    return { raw, verdict: "invalid", reason: "The model answer is not json after the guardrail strip.", attempts: 1 };
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return { raw, verdict: "invalid", reason: "The model answer is not a json object.", attempts: 1 };
  const record = parsed;
  for (const [name, field] of Object.entries(input.guard.schema)) {
    const value = record[name];
    if (value === void 0 || value === null) {
      if (field.required === true) return { raw, verdict: "invalid", reason: `The required field ${name} of the expected schema is missing.`, attempts: 1 };
      continue;
    }
    const actual = Array.isArray(value) ? "array" : typeof value;
    if (actual !== field.type) return { raw, verdict: "invalid", reason: `The field ${name} carries a ${actual} value where the schema asks a ${field.type}.`, attempts: 1 };
  }
  return { raw, parsed: record, verdict: "valid", attempts: 1 };
}
function guardoutput(input) {
  const limit = Math.max(1, Math.floor(input.guard.retries) + 1);
  const attempts = input.attempts.slice(0, limit);
  let last;
  for (let index = 0; index < attempts.length; index += 1) {
    const output = parseoutput({ guard: input.guard, text: attempts[index] ?? "" });
    last = { ...output, attempts: index + 1 };
    if (output.verdict === "valid") return last;
    if (output.verdict === "refused") return { ...output, attempts: index + 1 };
  }
  const exhausted = last === void 0 ? { raw: "", verdict: "invalid", reason: "The model answer never arrived.", attempts: 0 } : { ...last, verdict: "invalid", reason: `${last.reason ?? "The model answer failed its guard."} Every retry attempt failed, so the guard refuses the output and nothing executes.` };
  return exhausted;
}
function budgetcheck(input) {
  if (input.budget === void 0) return { allowed: true, halted: false, asksuser: false };
  if (input.budget.maxtokens !== void 0 && Number.isFinite(input.budget.maxtokens) && input.totals.totaltokens >= input.budget.maxtokens) return { allowed: false, halted: true, asksuser: true, reason: `The run reached the user configured token ceiling of ${input.budget.maxtokens} and halts until the user answers.` };
  if (input.budget.maxcost !== void 0 && Number.isFinite(input.budget.maxcost) && input.totals.cost >= input.budget.maxcost) return { allowed: false, halted: true, asksuser: true, reason: `The run reached the user configured cost ceiling of ${input.budget.maxcost} and halts until the user answers.` };
  return { allowed: true, halted: false, asksuser: false };
}
function routevalid(route) {
  if (route.kind.trim() === "") return { allowed: false, reason: "The model route needs its task kind." };
  if (route.providerid.trim() === "") return { allowed: false, reason: "The model route needs the provider it routes to." };
  if (route.model.trim() === "") return { allowed: false, reason: "The model route needs the model name it routes to." };
  const hasfallbackprovider = route.fallbackproviderid !== void 0 && route.fallbackproviderid.trim() !== "";
  const hasfallbackmodel = route.fallbackmodel !== void 0 && route.fallbackmodel.trim() !== "";
  if (hasfallbackprovider !== hasfallbackmodel) return { allowed: false, reason: "The fallback of a model route needs its provider and its model together." };
  return { allowed: true };
}
function routesfor(routes, kind) {
  return routes.filter((route) => route.kind === kind).sort((one, two) => two.revision - one.revision);
}
function resolveroute(input) {
  const candidates = routesfor(input.routes, input.kind);
  if (candidates.length === 0) return { reason: `No model route configures the task kind ${input.kind}; the user picks the provider and model pair.` };
  for (const route of candidates) {
    if (!routevalid(route).allowed) continue;
    const provider = input.providers.find((candidate) => candidate.id === route.providerid);
    if (provider === void 0) return { reason: `The route of ${input.kind} names the missing provider ${route.providerid}.` };
    if (provider.status === "unavailable") return { reason: `The provider ${provider.name} of the route of ${input.kind} stays marked unavailable from its last failure.` };
    if (!provider.models.includes(route.model)) return { reason: `The route of ${input.kind} names the model ${route.model} outside the model list of ${provider.name}.` };
    return { route, provider, model: route.model };
  }
  return { reason: `Every route of the task kind ${input.kind} failed its validation.` };
}
function fallbackroute(input) {
  const candidates = routesfor(input.routes, input.kind);
  const primary = candidates.find((route) => routevalid(route).allowed);
  if (primary === void 0) return { reason: `No valid route configures the task kind ${input.kind}, so no fallback applies.` };
  if (primary.fallbackproviderid === void 0 || primary.fallbackmodel === void 0) return { reason: `The route of ${input.kind} carries no user configured fallback pair.` };
  const provider = input.providers.find((candidate) => candidate.id === primary.fallbackproviderid);
  if (provider === void 0) return { reason: `The fallback names the missing provider ${primary.fallbackproviderid}.` };
  if (provider.status === "unavailable") return { reason: `The fallback provider ${provider.name} stays marked unavailable from its last failure.` };
  if (!provider.models.includes(primary.fallbackmodel)) return { reason: `The fallback names the model ${primary.fallbackmodel} outside the model list of ${provider.name}.` };
  return { route: primary, provider, model: primary.fallbackmodel };
}
function rendertemplate(input) {
  if (input.sensitive === true && (input.consentnotice === void 0 || input.consentnotice.trim() === "")) return { reason: "The sensitive flow needs its consent notice before the template renders." };
  const variables = input.variables ?? {};
  const missing = input.template.variables.filter((name) => variables[name] === void 0 || variables[name] === null || typeof variables[name] === "string" && variables[name].trim() === "");
  if (missing.length > 0) return { reason: `The template variables ${missing.join(", ")} stay empty.` };
  let text = input.template.body.replace(/\{\{\s*([a-z0-9]+)\s*\}\}/g, (whole, name) => {
    const value = variables[name];
    if (value === void 0 || value === null) return whole;
    return typeof value === "string" ? value : JSON.stringify(value);
  });
  if (input.sensitive === true && input.consentnotice !== void 0) text = `${text}
Consent notice: ${input.consentnotice}`;
  return { text };
}

// gateway.ts
var ollamalocaldefault = "http://localhost:11434";
var gatewaykinds = ["openaicompat", "anthropicgateway", "geminigateway", "ollamalocal"];
function defaultbaseurl(kind) {
  return kind === "ollamalocal" ? ollamalocaldefault : "";
}
function gatewayurl(config, path) {
  const base = trailingslashes(config.baseurl.trim());
  const trimmedprefix = (config.pathprefix ?? "").trim();
  const prefix = leadingslashes(trailingslashes(trimmedprefix));
  const wire = path.startsWith("/") ? path : `/${path}`;
  return `${base}${prefix !== "" ? `/${prefix}` : ""}${wire}`;
}
function trailingslashes(value) {
  let end = value.length;
  while (end > 0 && value.charCodeAt(end - 1) === 47) end -= 1;
  return value.slice(0, end);
}
function leadingslashes(value) {
  let start = 0;
  while (start < value.length && value.charCodeAt(start) === 47) start += 1;
  return value.slice(start);
}
function recordof(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value : void 0;
}
function numberof2(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : void 0;
}
function withbody(request, merge) {
  let parsed;
  try {
    parsed = JSON.parse(request.body);
  } catch {
    return request;
  }
  const record = recordof(parsed);
  if (record === void 0) return request;
  merge(record);
  return { ...request, body: JSON.stringify(record) };
}
var openaicompatadapter = {
  kind: "openaicompat",
  style: "chatcompletions",
  chatpath: () => "/chat/completions",
  modelspath: () => "/models",
  build: (input) => {
    const shaped = buildrequest({ provider: { endpoint: gatewayurl(input.config, "/chat/completions"), style: "chatcompletions", ...input.headers !== void 0 ? { headers: input.headers } : {} }, model: input.model, messages: input.messages, ...input.apikey !== void 0 ? { apikey: input.apikey } : {}, ...input.temperature !== void 0 ? { temperature: input.temperature } : {}, ...input.maxtokens !== void 0 ? { maxtokens: input.maxtokens } : {}, ...input.stream === true ? { stream: true } : {} });
    if (input.tools === void 0 || input.tools.length === 0) return shaped;
    return withbody(shaped, (body) => {
      body.tools = input.tools?.map((tool) => ({ type: "function", function: { name: tool.name, description: tool.description, parameters: { type: "object", properties: Object.fromEntries(Object.entries(tool.inputschema.properties).map(([name, property]) => [name, { type: property.type, description: property.description, ...property.required === true ? { required: true } : {}, ...property.default !== void 0 ? { "default": property.default } : {} }])), required: tool.inputschema.required } } }));
    });
  },
  parseanswer: (body) => parsecompletion("chatcompletions", body),
  parsestream: (body) => parsestream("chatcompletions", body),
  parsemodellist: (body) => {
    let parsed;
    try {
      parsed = JSON.parse(body);
    } catch {
      return [];
    }
    const record = recordof(parsed);
    const list = record !== void 0 && Array.isArray(record.data) ? record.data : void 0;
    if (list === void 0) return [];
    const models = [];
    for (const item of list) {
      const entry = recordof(item);
      if (entry === void 0 || typeof entry.id !== "string" || entry.id.trim() === "") continue;
      const context = numberof2(entry["context_length"]) ?? numberof2(entry["context_window"]);
      models.push({ id: entry.id, ...typeof entry.label === "string" && entry.label.trim() !== "" ? { label: entry.label } : {}, ...context !== void 0 ? { contextwindow: context } : {}, ...Array.isArray(entry.modalities) ? { modalities: entry.modalities.filter((kind) => typeof kind === "string") } : {} });
    }
    return models;
  },
  toolcatalog: (tools) => tools.map((tool) => ({ type: "function", function: { name: tool.name, description: tool.description, parameters: { type: "object", properties: Object.fromEntries(Object.entries(tool.inputschema.properties).map(([name, property]) => [name, { type: property.type, description: property.description, ...property.required === true ? { required: true } : {} }])), required: tool.inputschema.required } } }))
};
var anthropicgatewayadapter = {
  kind: "anthropicgateway",
  style: "messages",
  chatpath: () => "/v1/messages",
  modelspath: () => "/v1/models",
  build: (input) => {
    const shaped = buildrequest({ provider: { endpoint: gatewayurl(input.config, "/v1/messages"), style: "messages", ...input.headers !== void 0 ? { headers: input.headers } : {} }, model: input.model, messages: input.messages, ...input.apikey !== void 0 ? { apikey: input.apikey } : {}, ...input.temperature !== void 0 ? { temperature: input.temperature } : {}, ...input.maxtokens !== void 0 ? { maxtokens: input.maxtokens } : {}, ...input.stream === true ? { stream: true } : {} });
    if (input.tools === void 0 || input.tools.length === 0) return shaped;
    return withbody(shaped, (body) => {
      body.tools = input.tools?.map((tool) => ({ name: tool.name, description: tool.description, "input_schema": { type: "object", properties: Object.fromEntries(Object.entries(tool.inputschema.properties).map(([name, property]) => [name, { type: property.type, description: property.description, ...property.required === true ? { required: true } : {} }])), required: tool.inputschema.required } }));
    });
  },
  parseanswer: (body) => parsecompletion("messages", body),
  parsestream: (body) => parsestream("messages", body),
  parsemodellist: (body) => {
    let parsed;
    try {
      parsed = JSON.parse(body);
    } catch {
      return [];
    }
    const record = recordof(parsed);
    const list = record !== void 0 && Array.isArray(record.data) ? record.data : void 0;
    if (list === void 0) return [];
    const models = [];
    for (const item of list) {
      const entry = recordof(item);
      if (entry === void 0 || typeof entry.id !== "string" || entry.id.trim() === "") continue;
      const context = numberof2(entry["context_window"]);
      models.push({ id: entry.id, ...typeof entry["display_name"] === "string" && entry["display_name"].trim() !== "" ? { label: entry["display_name"] } : {}, ...context !== void 0 ? { contextwindow: context } : {} });
    }
    return models;
  },
  toolcatalog: (tools) => tools.map((tool) => ({ name: tool.name, description: tool.description, "input_schema": { type: "object", properties: Object.fromEntries(Object.entries(tool.inputschema.properties).map(([name, property]) => [name, { type: property.type, description: property.description, ...property.required === true ? { required: true } : {} }])), required: tool.inputschema.required } }))
};
var geminigatewayadapter = {
  kind: "geminigateway",
  style: "gemini",
  chatpath: (model) => `/v1beta/models/${encodeURIComponent(model)}:generateContent`,
  modelspath: () => "/v1beta/models",
  build: (input) => {
    const shaped = buildrequest({ provider: { endpoint: gatewayurl(input.config, geminigatewayadapter.chatpath(input.model)), style: "gemini", ...input.headers !== void 0 ? { headers: input.headers } : {} }, model: input.model, messages: input.messages, ...input.apikey !== void 0 ? { apikey: input.apikey } : {}, ...input.temperature !== void 0 ? { temperature: input.temperature } : {}, ...input.maxtokens !== void 0 ? { maxtokens: input.maxtokens } : {}, ...input.stream === true ? { stream: true } : {} });
    if (input.tools === void 0 || input.tools.length === 0) return shaped;
    return withbody(shaped, (body) => {
      body.tools = [{ functionDeclarations: input.tools?.map((tool) => ({ name: tool.name, description: tool.description, parameters: { type: "object", properties: Object.fromEntries(Object.entries(tool.inputschema.properties).map(([name, property]) => [name, { type: property.type, description: property.description, ...property.required === true ? { required: true } : {} }])), required: tool.inputschema.required } })) }];
    });
  },
  parseanswer: (body) => parsecompletion("gemini", body),
  parsestream: (body) => parsestream("gemini", body),
  parsemodellist: (body) => {
    let parsed;
    try {
      parsed = JSON.parse(body);
    } catch {
      return [];
    }
    const record = recordof(parsed);
    const list = record !== void 0 && Array.isArray(record.models) ? record.models : void 0;
    if (list === void 0) return [];
    const models = [];
    for (const item of list) {
      const entry = recordof(item);
      if (entry === void 0 || typeof entry.name !== "string" || entry.name.trim() === "") continue;
      const inputlimit = numberof2(entry["inputTokenLimit"]);
      const methods = Array.isArray(entry["supportedGenerationMethods"]) ? entry["supportedGenerationMethods"].filter((kind) => typeof kind === "string") : void 0;
      models.push({ id: entry.name.replace(/^models\//, ""), ...typeof entry.displayName === "string" && entry.displayName.trim() !== "" ? { label: entry.displayName } : {}, ...inputlimit !== void 0 ? { contextwindow: inputlimit } : {}, ...methods !== void 0 ? { modalities: methods } : {} });
    }
    return models;
  },
  toolcatalog: (tools) => [{ functionDeclarations: tools.map((tool) => ({ name: tool.name, description: tool.description, parameters: { type: "object", properties: Object.fromEntries(Object.entries(tool.inputschema.properties).map(([name, property]) => [name, { type: property.type, description: property.description, ...property.required === true ? { required: true } : {} }])), required: tool.inputschema.required } })) }]
};
var ollamalocaladapter = {
  kind: "ollamalocal",
  chatpath: () => "/api/chat",
  modelspath: () => "/api/tags",
  build: (input) => {
    const headers = { "content-type": "application/json", ...input.headers ?? {} };
    if (input.apikey !== void 0 && input.apikey.trim() !== "") headers.authorization = `Bearer ${input.apikey}`;
    const body = { model: input.model, messages: input.messages.map((message) => ({ role: message.role, content: message.content })), ...input.stream === true ? { stream: true } : {} };
    if (input.tools !== void 0 && input.tools.length > 0) body.tools = input.tools.map((tool) => ({ type: "function", function: { name: tool.name, description: tool.description, parameters: { type: "object", properties: Object.fromEntries(Object.entries(tool.inputschema.properties).map(([name, property]) => [name, { type: property.type, description: property.description, ...property.required === true ? { required: true } : {} }])), required: tool.inputschema.required } } }));
    return { url: gatewayurl(input.config, "/api/chat"), method: "POST", headers, body: JSON.stringify(body) };
  },
  parseanswer: (body) => {
    let parsed;
    try {
      parsed = JSON.parse(body);
    } catch {
      return { reason: "The ollama answer is not json." };
    }
    const record = recordof(parsed);
    if (record === void 0) return { reason: "The ollama answer is not a json object." };
    const message = recordof(record.message);
    if (message === void 0 || typeof message.content !== "string") return { reason: "The ollama answer carries no message content." };
    const prompttokens = numberof2(record["prompt_eval_count"]);
    const completiontokens = numberof2(record["eval_count"]);
    return { text: message.content, ...prompttokens !== void 0 || completiontokens !== void 0 ? { usage: { prompttokens: prompttokens ?? 0, completiontokens: completiontokens ?? 0, totaltokens: (prompttokens ?? 0) + (completiontokens ?? 0) } } : {} };
  },
  parsestream: (body) => {
    const tokens = [];
    let seq = 0;
    let done = false;
    for (const line of body.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (trimmed === "") continue;
      let parsed;
      try {
        parsed = JSON.parse(trimmed);
      } catch {
        continue;
      }
      const record = recordof(parsed);
      if (record === void 0) continue;
      const message = recordof(record.message);
      const text = message !== void 0 && typeof message.content === "string" ? message.content : "";
      if (record.done === true) done = true;
      if (text === "") continue;
      seq += 1;
      tokens.push({ seq, text, done: false });
    }
    if (tokens.length > 0 && done) tokens[tokens.length - 1] = { ...tokens[tokens.length - 1], done: true };
    return tokens;
  },
  parsemodellist: (body) => {
    let parsed;
    try {
      parsed = JSON.parse(body);
    } catch {
      return [];
    }
    const record = recordof(parsed);
    const list = record !== void 0 && Array.isArray(record.models) ? record.models : void 0;
    if (list === void 0) return [];
    const models = [];
    for (const item of list) {
      const entry = recordof(item);
      if (entry === void 0 || typeof entry.name !== "string" || entry.name.trim() === "") continue;
      const details = recordof(entry.details);
      const families = details !== void 0 && Array.isArray(details.families) ? details.families.filter((kind) => typeof kind === "string") : void 0;
      models.push({ id: entry.name, ...details !== void 0 && typeof details["parameter_size"] === "string" ? { label: `${entry.name} (${details["parameter_size"]})` } : {}, ...families !== void 0 ? { modalities: families } : {} });
    }
    return models;
  },
  toolcatalog: (tools) => tools.map((tool) => ({ type: "function", function: { name: tool.name, description: tool.description, parameters: { type: "object", properties: Object.fromEntries(Object.entries(tool.inputschema.properties).map(([name, property]) => [name, { type: property.type, description: property.description, ...property.required === true ? { required: true } : {} }])), required: tool.inputschema.required } } }))
};
var gatewayadapters = { openaicompat: openaicompatadapter, anthropicgateway: anthropicgatewayadapter, geminigateway: geminigatewayadapter, ollamalocal: ollamalocaladapter };
function adapterof(kind) {
  const adapter = gatewayadapters[kind];
  if (adapter === void 0) throw new Error(`The gateway family carries no ${kind} adapter.`);
  return adapter;
}
function gatewaycancel() {
  let cancelled = false;
  let reason = "The user cancelled the provider call.";
  return {
    cancelled: () => cancelled,
    cancel: (why) => {
      cancelled = true;
      if (why !== void 0 && why.trim() !== "") reason = why.trim();
    },
    reason: () => reason
  };
}
function gatewayerrorof(code, message, requestid, retryhint, retryafter) {
  return { code, message, requestid, ...retryhint !== void 0 && retryhint.trim() !== "" ? { retryhint } : {}, ...retryafter !== void 0 && Number.isFinite(retryafter) ? { retryafter } : {} };
}
function gatewayerrorfrom(error, requestid) {
  if (error !== null && typeof error === "object" && "code" in error && "requestid" in error && typeof error.code === "string") return error;
  const message = error instanceof Error ? error.message : String(error);
  const code = message.includes("timed out") ? "timeout" : "transport";
  return gatewayerrorof(code, message, requestid, "A transient network failure may succeed on a retry; the caller decides whether one runs.");
}
function gatewayretryafterof(headers) {
  for (const [name, value] of Object.entries(headers)) {
    if (name.toLowerCase() !== "retry-after") continue;
    const trimmed = value.trim();
    if (/^\d+$/.test(trimmed)) {
      const parsed = Number.parseInt(trimmed, 10);
      return parsed > 1e7 ? parsed : parsed * 1e3;
    }
    const date = Date.parse(trimmed);
    if (Number.isFinite(date)) return Math.max(0, date - Date.now());
  }
  return void 0;
}
function maskkey(key) {
  return `vault-key(${key.length} chars, material never prints)`;
}
function maskrequest(request) {
  const headers = {};
  for (const [name, value] of Object.entries(request.headers)) {
    const lowered = name.toLowerCase();
    headers[name] = lowered === "authorization" || lowered === "x-api-key" || lowered.includes("token") || lowered.includes("secret") ? maskkey(value) : value;
  }
  const url = request.url.replace(/([?&])key=[^&]*/g, "$1key=masked");
  return { url, method: request.method, headers, body: request.body };
}
async function storeproviderkey(input) {
  const gate = gatewaykeyconsentgate({ consent: input.consent, providerid: input.config.providerid });
  if (!gate.allowed) throw new Error(gate.reason ?? "The provider key needs its explicit consent before the vault stores it.");
  if (input.value === "") throw new Error("The provider key needs its key material; an empty value stores nothing.");
  let scope = input.config.providerid;
  try {
    scope = new URL(input.config.baseurl).origin;
  } catch {
  }
  return vaultstore({ seam: input.seam, label: input.config.providerid, scope, profileid: input.profileid, provenance: "user", value: input.value, now: input.now });
}
async function resolveproviderkey(input) {
  const resolved = await vaultvaluefor({ seam: input.seam, entry: input.entry });
  return { ok: resolved.ok, ...resolved.value !== void 0 ? { value: resolved.value } : {}, reason: resolved.reason };
}
async function revokeproviderkey(input) {
  return vaultdelete({ seam: input.seam, entry: input.entry });
}
async function keyexportcheck(input) {
  return secretleakscan({ candidates: input.candidates, entries: input.entries });
}
async function dispatch(input) {
  const requestid = input.requestid ?? randomid();
  const adapter = adapterof(input.config.kind);
  const sleep = input.sleep ?? ((milliseconds) => new Promise((resolve) => setTimeout(resolve, Math.max(0, milliseconds))));
  const jitter = input.jitter ?? (() => 0);
  const now = input.now ?? Date.now;
  const consent = gatewayconsentgate({ config: input.config });
  if (!consent.allowed) throw gatewayerrorof("noconsent", consent.reason ?? "The provider call stayed behind the consent gate.", requestid, "Grant the provider consent from the options and the call runs.");
  const baseurl = gatewaybaseurlgate({ kind: input.config.kind, baseurl: input.config.baseurl });
  if (!baseurl.allowed) throw gatewayerrorof("notconfigured", baseurl.reason ?? "The provider base url failed its validation.", requestid);
  const shaped = adapter.build({ config: input.config, model: input.model, messages: input.messages, ...input.apikey !== void 0 ? { apikey: input.apikey } : {}, ...input.tools !== void 0 ? { tools: input.tools } : {}, ...input.temperature !== void 0 ? { temperature: input.temperature } : {}, ...input.maxtokens !== void 0 ? { maxtokens: input.maxtokens } : {}, ...input.stream === true ? { stream: true } : {}, ...input.options?.headers !== void 0 ? { headers: input.options.headers } : {} });
  const attempts = Math.max(1, Math.floor(input.options?.retries ?? 0) + 1);
  const backoff = input.options?.backoff ?? 0;
  const jitterwindow = input.options?.jitter ?? 0;
  let retries = 0;
  let lasterror;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    if (input.cancel?.cancelled() === true) throw gatewayerrorof("cancelled", input.cancel.reason(), requestid);
    const startedat = now();
    let response;
    try {
      const sent = input.transport(shaped.url, { method: shaped.method, headers: shaped.headers, body: shaped.body, redirect: "follow" });
      const timeout = input.options?.timeout;
      if (timeout !== void 0 && Number.isFinite(timeout) && timeout >= 0) {
        let timedout = false;
        response = await Promise.race([sent, sleep(timeout).then(() => {
          timedout = true;
          return void 0;
        })]).then((value) => value ?? (timedout ? (() => {
          throw new Error(`The request timed out after ${timeout} milliseconds.`);
        })() : value));
      } else {
        response = await sent;
      }
    } catch (error) {
      lasterror = gatewayerrorfrom(error, requestid);
    }
    if (response !== void 0) {
      if (response.status === 429) {
        const wait = gatewayretryafterof(response.headers) ?? 0;
        if (attempt < attempts) {
          retries = attempt;
          await sleep(wait + (jitterwindow > 0 ? Math.floor(jitter() * jitterwindow) : 0));
          continue;
        }
        throw gatewayerrorof("ratelimited", `The provider answered rate limited and the retry budget of ${attempts - 1} attempt${attempts - 1 === 1 ? "" : "s"} is exhausted.`, requestid, "Wait the announced window and send the request again.", wait);
      }
      if (response.status === 401 || response.status === 403) throw gatewayerrorof("unauthorized", `The provider answered ${response.status}: the key the vault resolved did not authorize the call.`, requestid, "Check the stored key of the provider and revoke it if it rotated.");
      if (response.status >= 200 && response.status < 300) {
        if (input.cancel?.cancelled() === true) throw gatewayerrorof("cancelled", input.cancel.reason(), requestid);
        return { response, requestid, request: shaped, duration: now() - startedat, retries };
      }
      lasterror = gatewayerrorof("transport", `The provider answered ${response.status}: ${response.body.slice(0, 200)}`, requestid, "A transient server failure may succeed on a retry; the caller decides whether one runs.");
    }
    if (attempt < attempts) {
      const wait = backoff * attempt + (jitterwindow > 0 ? Math.floor(jitter() * jitterwindow) : 0);
      if (wait > 0) await sleep(wait);
      retries = attempt;
    }
  }
  throw lasterror ?? gatewayerrorof("transport", "The provider call failed without an answer.", requestid);
}
async function gatewaycall(input) {
  const adapter = adapterof(input.config.kind);
  const outcome = await dispatch({ config: input.config, model: input.model, messages: input.messages, ...input.apikey !== void 0 ? { apikey: input.apikey } : {}, ...input.tools !== void 0 ? { tools: input.tools } : {}, ...input.temperature !== void 0 ? { temperature: input.temperature } : {}, ...input.maxtokens !== void 0 ? { maxtokens: input.maxtokens } : {}, ...input.options !== void 0 ? { options: input.options } : {}, ...input.requestid !== void 0 ? { requestid: input.requestid } : {}, ...input.cancel !== void 0 ? { cancel: input.cancel } : {}, transport: input.transport, ...input.sleep !== void 0 ? { sleep: input.sleep } : {}, ...input.jitter !== void 0 ? { jitter: input.jitter } : {}, ...input.now !== void 0 ? { now: input.now } : {} });
  const parsed = adapter.parseanswer(outcome.response.body);
  if (parsed.text === void 0) throw gatewayerrorof("parse", parsed.reason ?? "The provider answer did not parse.", outcome.requestid, "A retried request may parse; the caller decides whether one runs.");
  return { text: parsed.text, ...parsed.usage !== void 0 ? { usage: parsed.usage } : {}, requestid: outcome.requestid, request: outcome.request, status: outcome.response.status, duration: outcome.duration, retries: outcome.retries };
}
async function gatewaystream(input) {
  const adapter = adapterof(input.config.kind);
  const outcome = await dispatch({ config: input.config, model: input.model, messages: input.messages, ...input.apikey !== void 0 ? { apikey: input.apikey } : {}, ...input.tools !== void 0 ? { tools: input.tools } : {}, ...input.temperature !== void 0 ? { temperature: input.temperature } : {}, ...input.maxtokens !== void 0 ? { maxtokens: input.maxtokens } : {}, stream: true, ...input.options !== void 0 ? { options: input.options } : {}, ...input.requestid !== void 0 ? { requestid: input.requestid } : {}, ...input.cancel !== void 0 ? { cancel: input.cancel } : {}, transport: input.transport, ...input.sleep !== void 0 ? { sleep: input.sleep } : {}, ...input.jitter !== void 0 ? { jitter: input.jitter } : {}, ...input.now !== void 0 ? { now: input.now } : {} });
  const tokens = [];
  for (const token of adapter.parsestream(outcome.response.body)) {
    if (input.cancel?.cancelled() === true) break;
    tokens.push(token);
    input.onevent?.(token);
  }
  return { tokens, text: tokens.map((token) => token.text).join(""), requestid: outcome.requestid, request: outcome.request, status: outcome.response.status, retries: outcome.retries };
}
async function fetchmodellist(input) {
  const now = input.now ?? Date.now;
  const adapter = adapterof(input.config.kind);
  if (input.cache !== void 0) {
    const window = input.cachewindow;
    if (window !== void 0 && Number.isFinite(window) && window > 0 && now() - input.cache.fetchedat < window) return { models: input.cache.models, cached: true, fetchedat: input.cache.fetchedat };
  }
  const baseurl = gatewaybaseurlgate({ kind: input.config.kind, baseurl: input.config.baseurl });
  if (!baseurl.allowed) return { models: [], cached: false, fetchedat: now(), ...baseurl.reason !== void 0 ? { reason: baseurl.reason } : {} };
  const headers = { ...input.options?.headers ?? {} };
  let url = gatewayurl(input.config, adapter.modelspath());
  if (input.apikey !== void 0 && input.apikey.trim() !== "") {
    if (input.config.kind === "geminigateway") url = `${url}${url.includes("?") ? "&" : "?"}key=${encodeURIComponent(input.apikey)}`;
    else headers.authorization = `Bearer ${input.apikey}`;
  }
  let response;
  try {
    response = await input.transport(url, { method: "GET", headers, redirect: "follow" });
  } catch (error) {
    return { models: [], cached: false, fetchedat: now(), reason: `The model list fetch failed: ${error instanceof Error ? error.message : String(error)}` };
  }
  if (response.status < 200 || response.status >= 300) return { models: [], cached: false, fetchedat: now(), reason: `The model list endpoint answered ${response.status}.` };
  const models = adapter.parsemodellist(response.body);
  return { models, cached: false, fetchedat: now() };
}
function capabilityadvertisement(input) {
  const adapter = adapterof(input.kind);
  return {
    kind: input.kind,
    tools: adapter.toolcatalog(input.tools),
    consent: input.tools.map((tool) => ({ tool: tool.name, review: tool.consentmeta?.review ?? `${tool.name} is a ${tool.risk} tool; it runs only behind its reviewed plan step.`, ...tool.consentmeta?.riskclass !== void 0 ? { riskclass: tool.consentmeta.riskclass } : {}, ...tool.consentmeta?.approvalrequired === true ? { approvalrequired: true } : {} })),
    requiredcapabilities: ["planreview"]
  };
}
function resolvegatewayroute(input) {
  const remoteallowed = input.remoteallowed !== false;
  const configof = (providerid) => input.configs.find((config) => config.providerid === providerid);
  const primary = resolveroute({ routes: input.routes, providers: input.providers, kind: input.kind });
  if (primary.provider !== void 0 && primary.model !== void 0) {
    const config = configof(primary.provider.id);
    if (remoteallowed && (config === void 0 || gatewayconsentgate({ config }).allowed)) return { source: "route", provider: primary.provider, model: primary.model, ...config !== void 0 ? { config } : {} };
  }
  const fallback = fallbackroute({ routes: input.routes, providers: input.providers, kind: input.kind });
  if (fallback.provider !== void 0 && fallback.model !== void 0 && remoteallowed) {
    const config = configof(fallback.provider.id);
    if (config === void 0 || gatewayconsentgate({ config }).allowed) return { source: "fallback", provider: fallback.provider, model: fallback.model, ...config !== void 0 ? { config } : {} };
  }
  if (input.local !== void 0 && input.local.endpoint.trim() !== "") return { source: "local", local: input.local, model: input.local.model, reason: remoteallowed ? `The remote route of ${input.kind} stayed behind its gates, so the resolution fell back to the local provider.` : `Remote calls are not allowed, so the ${input.kind} task fell back to the local provider.` };
  return { source: "route", reason: primary.reason ?? `No model route configures the task kind ${input.kind} and no local provider stands in.` };
}
function gatewayusagerecord(input) {
  const prompttokens = input.usage?.prompttokens ?? 0;
  const completiontokens = input.usage?.completiontokens ?? 0;
  const totaltokens = input.usage?.totaltokens ?? prompttokens + completiontokens;
  const cost = input.costpermilliontokens !== void 0 && Number.isFinite(input.costpermilliontokens) ? (prompttokens + completiontokens) / 1e6 * input.costpermilliontokens : 0;
  return { id: randomid(), ...input.runid !== void 0 ? { runid: input.runid } : {}, ...input.stepid !== void 0 ? { stepid: input.stepid } : {}, ...input.sessionid !== void 0 ? { sessionid: input.sessionid } : {}, requestid: input.requestid, providerid: input.providerid, endpoint: input.endpoint, model: input.model, prompttokens, completiontokens, totaltokens, cost, ...input.local === true ? { local: true } : {}, at: input.now };
}
function gatewaybudgetwarning(input) {
  const budget = input.budget;
  if (budget === void 0 || budget.warnratio === void 0 || !Number.isFinite(budget.warnratio) || budget.warnratio <= 0) return { warned: false };
  const ratio = Math.min(1, Math.max(0, budget.warnratio));
  const tokenratio = budget.maxtokens !== void 0 && Number.isFinite(budget.maxtokens) && budget.maxtokens > 0 ? input.totals.totaltokens / budget.maxtokens : void 0;
  const costratio = budget.maxcost !== void 0 && Number.isFinite(budget.maxcost) && budget.maxcost > 0 ? input.totals.cost / budget.maxcost : void 0;
  const warned = tokenratio !== void 0 && tokenratio >= ratio || costratio !== void 0 && costratio >= ratio;
  if (!warned) return { warned: false, ...tokenratio !== void 0 ? { tokenratio } : {}, ...costratio !== void 0 ? { costratio } : {} };
  return { warned: true, ...tokenratio !== void 0 ? { tokenratio } : {}, ...costratio !== void 0 ? { costratio } : {}, reason: `The recorded usage crossed the user configured warning threshold of ${Math.round(ratio * 100)} percent${tokenratio !== void 0 && tokenratio >= ratio ? ` at ${Math.round(tokenratio * 100)} percent of the token ceiling` : ""}${costratio !== void 0 && costratio >= ratio ? ` at ${Math.round(costratio * 100)} percent of the cost ceiling` : ""}.` };
}
function costestimates(input) {
  const pairs = /* @__PURE__ */ new Map();
  const pricingof = (providerid, model) => {
    const config = input.configs.find((entry) => entry.providerid === providerid);
    if (config !== void 0 && config.costpermilliontokens !== void 0 && Number.isFinite(config.costpermilliontokens)) return { permillion: config.costpermilliontokens, ...config.currency !== void 0 && config.currency.trim() !== "" ? { currency: config.currency.trim() } : {} };
    const provider = input.providers.find((entry) => entry.id === providerid);
    if (provider !== void 0 && provider.costpermilliontokens !== void 0 && Number.isFinite(provider.costpermilliontokens) && provider.models.includes(model)) return { permillion: provider.costpermilliontokens, ...provider.currency !== void 0 && provider.currency.trim() !== "" ? { currency: provider.currency.trim() } : {} };
    return void 0;
  };
  for (const record of input.records) {
    const key = `${record.providerid}::${record.model}`;
    const entry = pairs.get(key) ?? { providerid: record.providerid, model: record.model, permillion: 0, recordedtokens: 0, recordedcost: 0 };
    entry.recordedtokens += record.totaltokens;
    entry.recordedcost += record.cost;
    const pricing = pricingof(record.providerid, record.model);
    if (pricing !== void 0) {
      entry.permillion = pricing.permillion;
      if (pricing.currency !== void 0) entry.currency = pricing.currency;
    }
    pairs.set(key, entry);
  }
  for (const provider of input.providers) {
    if (provider.costpermilliontokens === void 0 || !Number.isFinite(provider.costpermilliontokens)) continue;
    for (const model of provider.models) {
      const key = `${provider.id}::${model}`;
      if (pairs.has(key)) continue;
      pairs.set(key, { providerid: provider.id, model, permillion: provider.costpermilliontokens, ...provider.currency !== void 0 && provider.currency.trim() !== "" ? { currency: provider.currency.trim() } : {}, recordedtokens: 0, recordedcost: 0 });
    }
  }
  return [...pairs.values()];
}
var gatewayplanguard = { schema: { goal: { type: "string", required: true }, steps: { type: "array", required: true }, openquestions: { type: "array" } }, retries: 1 };
function guardretryprompt(output) {
  return `Your previous answer failed its guard: ${output.reason ?? "the answer did not match the expected schema."} Answer again with a single json object that carries the required fields with their declared types \u2014 the goal as a string, the steps as an array of { kind, target, value, summary } objects using browser action kinds and the openquestions as an array of strings \u2014 and nothing else around it.`;
}
function gatewayguard(input) {
  const guard = input.guard ?? gatewayplanguard;
  const capcheck = gatewayretrycapvalid(guard.retries);
  if (!capcheck.allowed) throw new Error(capcheck.reason ?? "The configured retry cap failed its validation.");
  const cap = Math.max(1, Math.floor(guard.retries) + 1);
  const attempts = input.attempts.slice(0, cap);
  const output = guardoutput({ guard, attempts });
  if (output.verdict === "invalid" && attempts.length < cap) return { output, retryprompt: guardretryprompt(output), cappedat: cap };
  return { output, cappedat: cap };
}
function gatewaytemplates(now) {
  return [
    { id: randomid(), name: "gateway.parsecommand", body: "Parse the user command into json with the fields intent (one of navigate, extract, fill, monitor, automate, ask), entities (an array of { name, value } objects) and confidence (a number between 0 and 1). The command: {{command}}. Answer with the json object only.", variables: ["command"], version: 1, notes: "The gateway parsecommand template of the 1.1.83 family.", createdat: now },
    { id: randomid(), name: "gateway.draftplan", body: "Draft a browser agent plan for the goal {{goal}} as json with the fields goal (string), steps (an array of { kind, target, value, summary } objects using browser action kinds) and openquestions (an array of strings for what stays unclear). The tool catalog: {{tools}}. Answer with the json object only.", variables: ["goal", "tools"], version: 1, notes: "The gateway draftplan template of the 1.1.83 family.", createdat: now },
    { id: randomid(), name: "gateway.replan", body: "The plan for {{goal}} failed at the steps {{failed}} with the reason {{reason}}. The completed steps stay: {{completed}}. Draft the revised tail steps as json with the field steps (an array of { kind, target, value, summary } objects using browser action kinds). Answer with the json object only.", variables: ["goal", "failed", "reason", "completed"], version: 1, notes: "The gateway replan template of the 1.1.83 family.", createdat: now },
    { id: randomid(), name: "gateway.reflect", body: "Reflect on the executed step {{stepid}} of the run {{runid}} with the outcome: {{outcome}}. Answer as json with the fields outcome (string), lesson (string) and advice (string) for the next step. Answer with the json object only.", variables: ["stepid", "runid", "outcome"], version: 1, notes: "The gateway reflect template of the 1.1.83 family.", createdat: now },
    { id: randomid(), name: "gateway.chat", body: "{{prompt}}", variables: ["prompt"], version: 1, notes: "The gateway chat template of the 1.1.83 family; the streamed answers render token by token in the sidepanel chat.", createdat: now }
  ];
}
function composegatewayprompt(input) {
  const template = input.templates.find((entry) => entry.name === input.name);
  if (template === void 0) return { reason: `No stored prompt template answers the name ${input.name}.` };
  return rendertemplate({ template, variables: input.variables });
}
function streamrender(tokens, cursor, finished) {
  const fresh = tokens.filter((token) => token.seq > cursor);
  const nextcursor = fresh.length > 0 ? fresh[fresh.length - 1].seq : cursor;
  const last = tokens.length > 0 ? tokens[tokens.length - 1].seq : 0;
  return { text: fresh.map((token) => token.text).join(""), nextcursor, done: finished && nextcursor >= last };
}
function gatewaychatstateof(input) {
  return { requestid: input.requestid, providerid: input.config.providerid, kind: input.config.kind, model: input.model, prompt: input.prompt, tokens: input.tokens ?? [], done: input.done === true, ...input.error !== void 0 ? { error: input.error } : {}, at: input.now };
}
function gatewayislocal(config) {
  return islocalorigin(config.baseurl);
}
function gatewaybudgetcheck(input) {
  return budgetcheck({ budget: input.budget, totals: input.totals });
}
function validategatewayconfig(config) {
  const baseurl = config.baseurl.trim() !== "" ? config.baseurl.trim() : defaultbaseurl(config.kind);
  const normalized = { ...config, baseurl };
  const prefix = gatewayprefixgate(normalized.pathprefix ?? "");
  if (!prefix.allowed) return { ok: false, config, ...prefix.reason !== void 0 ? { reason: prefix.reason } : {} };
  const gate = gatewaybaseurlgate({ kind: normalized.kind, baseurl });
  if (!gate.allowed) return { ok: false, config, ...gate.reason !== void 0 ? { reason: gate.reason } : {} };
  return { ok: true, config: normalized };
}
function gatewaykeyref(name, baseurl, storageid, configuredat) {
  let origins = [baseurl];
  try {
    origins = [new URL(baseurl).origin];
  } catch {
  }
  return { name, origins, header: "authorization", storageid, configuredat };
}
async function subevents(input) {
  const now = input.now ?? Date.now;
  let current = { ...input.record, state: "open" };
  const events = [];
  let buffer = "";
  let error;
  const lifetimeelapsed = () => current.lifetime !== void 0 && now() - current.openedat >= current.lifetime;
  try {
    const opened = await input.open(current.url, sserequestheaders(current));
    if (!opened.ok) {
      return { record: { ...current, state: "failed", closedat: now(), ...opened.error !== void 0 ? { error: opened.error } : {} }, events, error: opened.error ?? `The event stream channel refused the subscription with status ${opened.status}.` };
    }
    for (; ; ) {
      if (input.cancelled?.() === true) break;
      if (lifetimeelapsed()) break;
      const chunk = await opened.read();
      if (chunk.done) break;
      buffer += chunk.text ?? "";
      const parsed = parsessetext(buffer);
      buffer = parsed.rest;
      for (const event of parsed.events) {
        const names = event.event !== void 0 && !current.names.includes(event.event) ? [...current.names, event.event] : current.names;
        current = { ...current, events: current.events + 1, names, ...event.id !== void 0 ? { lasteventid: event.id } : {} };
        events.push(event);
      }
    }
  } catch (failure) {
    if (input.cancelled?.() !== true && !lifetimeelapsed()) error = failure instanceof Error ? failure.message : String(failure);
  }
  const state = error !== void 0 ? "failed" : "closed";
  const closed = { ...current, state, closedat: now() };
  return { record: closed, events, ...error !== void 0 ? { error } : {} };
}
function longpollrequestof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const entry = value;
  if (typeof entry.url !== "string" || !entry.url.trim()) return void 0;
  const request = { url: entry.url.trim() };
  if (typeof entry.timeout === "number" && Number.isFinite(entry.timeout) && entry.timeout > 0) request.timeout = entry.timeout;
  if (typeof entry.cursor === "string" && entry.cursor.trim()) request.cursor = entry.cursor.trim();
  return request;
}
async function longpoll(input) {
  const now = input.now ?? Date.now;
  const sleep = input.sleep ?? ((milliseconds) => new Promise((resolve) => setTimeout(resolve, Math.max(0, milliseconds))));
  const exchanges = [];
  let polls = 0;
  let retries = 0;
  let reason = "The long poll loop stopped.";
  let cursorvalue = input.request.cursor;
  let next = pollurl(input.cursor, cursorvalue);
  let error;
  for (; ; ) {
    if (input.cancelled?.() === true) {
      reason = "The long poll loop was cancelled.";
      break;
    }
    if (input.expiresat !== void 0 && now() >= input.expiresat) {
      reason = "The long poll loop stopped at the reviewed plan expiry.";
      break;
    }
    let response;
    try {
      response = await input.fetchpoll(next.url, next.body);
    } catch (failure) {
      if (input.cancelled?.() === true) {
        reason = "The long poll loop was cancelled.";
        break;
      }
      error = failure instanceof Error ? failure.message : String(failure);
      reason = `The long poll request failed: ${error}`;
      break;
    }
    if (response.timeout === true && input.request.timeout !== void 0) {
      retries += 1;
      exchanges.push({ url: next.url, status: response.status, body: response.body, timeout: true });
      if (input.backoff !== void 0 && input.backoff > 0) await sleep(input.backoff);
      continue;
    }
    polls += 1;
    exchanges.push({ url: next.url, status: response.status, body: response.body, timeout: false });
    let parsed;
    try {
      parsed = JSON.parse(response.body);
    } catch {
      parsed = void 0;
    }
    const decision = polldecision({ cursor: input.cursor, polls: polls - 1, response: parsed, cancelled: () => input.cancelled?.() === true, ...input.expiresat !== void 0 ? { expiresat: input.expiresat } : {}, now: now() });
    if (!decision.continue) {
      reason = decision.reason;
      break;
    }
    cursorvalue = decision.cursor;
    const following = decision.next ?? { url: next.url, wait: input.cursor.interval };
    await sleep(following.wait);
    next = { url: following.url, ...following.body !== void 0 ? { body: following.body } : {} };
  }
  return { polls, retries, reason, ...cursorvalue !== void 0 ? { cursor: cursorvalue } : {}, exchanges, ...error !== void 0 ? { error } : {} };
}
function graphqlsubscriptionof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const entry = value;
  if (typeof entry.query !== "string" || !entry.query.trim()) return void 0;
  if (typeof entry.channel !== "string" || !entry.channel.trim()) return void 0;
  const variables = {};
  if (entry.variables !== void 0) {
    if (!entry.variables || typeof entry.variables !== "object" || Array.isArray(entry.variables)) return void 0;
    for (const [name, item] of Object.entries(entry.variables)) {
      if (typeof item !== "string") return void 0;
      variables[name] = item;
    }
  }
  return { query: entry.query.trim(), ...Object.keys(variables).length > 0 ? { variables } : {}, channel: entry.channel.trim() };
}
function parsegraphqlmessage(payload) {
  let parsed;
  try {
    parsed = JSON.parse(payload);
  } catch {
    return { kind: "error", errors: ["The graphql subscription message does not parse as json."] };
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return { kind: "error", errors: ["The graphql subscription message is not an object."] };
  const entry = parsed;
  const id = typeof entry.id === "string" && entry.id.trim() !== "" ? entry.id.trim() : void 0;
  if (entry.type === "complete" || entry.type === "stop") return { kind: "complete", ...id !== void 0 ? { id } : {} };
  if (entry.type === "error") {
    const raw = entry.payload;
    const messages = Array.isArray(raw) ? raw.map((item) => item instanceof Error ? item.message : typeof item === "object" && item !== null && "message" in item ? String(item.message) : String(item)) : raw !== void 0 ? [String(raw)] : ["The graphql subscription reported an error without a message."];
    return { kind: "error", ...id !== void 0 ? { id } : {}, errors: messages };
  }
  if (entry.type === "next" || entry.type === "data") return { kind: "next", ...id !== void 0 ? { id } : {}, payload: entry.payload };
  return { kind: "error", errors: [`The graphql subscription message carries the unknown type ${String(entry.type)}.`] };
}
function graphqlsubscribeframe(subscription, operationid) {
  return JSON.stringify({ id: operationid, type: "subscribe", payload: { query: subscription.query, ...subscription.variables !== void 0 ? { variables: subscription.variables } : {} } });
}
function graphqlsub(input) {
  const results = [];
  const errors = [];
  let completed = false;
  for (const message of input.messages) {
    const parsed = parsegraphqlmessage(message);
    if (parsed.kind === "next") results.push({ ...parsed.id !== void 0 ? { id: parsed.id } : {}, data: parsed.payload });
    if (parsed.kind === "error") errors.push(...parsed.errors ?? ["The graphql subscription reported an error."]);
    if (parsed.kind === "complete") completed = true;
  }
  return { results, errors, completed };
}
function granted(url, grants) {
  let origin = "";
  try {
    origin = new URL(url).origin;
  } catch {
    return false;
  }
  return grants.some((pattern) => {
    try {
      return origin === new URL(pattern).origin;
    } catch {
      return false;
    }
  });
}
function formpost(input) {
  if (!granted(input.payload.url, input.grants)) return { ok: false, refusal: `The form post to ${input.payload.url} targets an origin outside the session grants; the transport never widens the grants.` };
  return { ok: true, url: input.payload.url, method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: urlencodeform(input.payload.fields) };
}
function multipartfieldheader(field) {
  return `--BOUNDARY\r
content-disposition: form-data; name="${field.name}"; filename="${field.filename}"\r
content-type: ${field.contenttype}\r
\r
`;
}
function multipartpost(input) {
  if (!granted(input.payload.url, input.grants)) return { ok: false, refusal: `The multipart upload to ${input.payload.url} targets an origin outside the session grants; the transport never widens the grants.` };
  if (input.payload.files.some((file) => file.reviewed !== true)) return { ok: false, refusal: "Every file of a multipart upload carries its explicit reviewed flag before the payload encodes." };
  const boundary = input.payload.boundary ?? `----devthink${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`;
  const chunks = [];
  for (const field of input.payload.fields) chunks.push(`--${boundary}\r
content-disposition: form-data; name="${field.name}"\r
\r
${field.value}\r
`);
  for (const file of input.payload.files) chunks.push(multipartfieldheader({ name: file.name, filename: file.filename, contenttype: file.mime }).replaceAll("BOUNDARY", boundary) + `${file.content}\r
`);
  chunks.push(`--${boundary}--\r
`);
  const bytes = chunks.reduce((total, chunk) => total + chunk.length, 0);
  let sent = 0;
  for (const [index, chunk] of chunks.entries()) {
    sent += chunk.length;
    input.onprogress?.({ chunk: index + 1, chunks: chunks.length, sent, total: bytes });
  }
  return { ok: true, url: input.payload.url, method: "POST", headers: { "content-type": `multipart/form-data; boundary=${boundary}` }, chunks, boundary, bytes };
}
function correlateids(input) {
  let origin = "";
  try {
    origin = new URL(input.url).origin;
  } catch {
    origin = "";
  }
  const index = input.context.requests.length + 1;
  const requestid = `req-${index}`;
  const request = { requestid, correlationid: `${input.context.runid}-${index}`, stepid: input.stepid, url: input.url, origin, method: input.method, at: input.now };
  return { context: { runid: input.context.runid, requests: [...input.context.requests, request] }, requestid };
}
function joincorrelation(input) {
  const request = input.context.requests.find((entry) => entry.requestid === input.requestid);
  if (!request) throw new Error(`The correlation map of the run carries no request ${input.requestid}; the response joins only its own request.`);
  const joined = { ...request, ...input.responseid !== void 0 ? { responseid: input.responseid } : {}, status: input.status };
  return { runid: input.context.runid, requests: input.context.requests.map((entry) => entry.requestid === input.requestid ? joined : entry) };
}
function correlationexport(context) {
  const map = context.requests.map((request) => ({ requestid: request.requestid, correlationid: request.correlationid, stepid: request.stepid, url: request.url, origin: request.origin, method: request.method, paired: request.responseid !== void 0, ...request.status !== void 0 ? { status: request.status } : {}, at: request.at }));
  return { runid: context.runid, requests: map.length, pairs: map.filter((entry) => entry.paired).length, map };
}
function ratelimitdirectiveof(headers, origin, status, now) {
  const pick = (name) => {
    for (const key of Object.keys(headers)) {
      if (key.toLowerCase() !== name) continue;
      const value = Number(headers[key]);
      if (Number.isFinite(value) && value >= 0) return value;
    }
    return void 0;
  };
  const remaining = pick("x-ratelimit-remaining");
  const reset = pick("x-ratelimit-reset");
  const retryafter = retryafterof(status, headers);
  if (remaining === void 0 && reset === void 0 && retryafter === void 0) return void 0;
  let resetat = now;
  if (reset !== void 0) resetat = reset > Math.floor(now / 1e3) ? reset * 1e3 : now + reset * 1e3;
  if (retryafter !== void 0) resetat = Math.max(resetat, now + retryafter);
  return { origin, scope: origin, ...remaining !== void 0 ? { remaining } : {}, resetat, ...retryafter !== void 0 ? { retryafter } : {}, at: now };
}
function ratelimitwaitof(directives, origin, now) {
  const scoped = directives.filter((directive) => directive.origin === origin);
  let newest;
  for (const directive of scoped) if (newest === void 0 || directive.at > newest.at) newest = directive;
  if (newest === void 0) return { waitms: 0 };
  return { waitms: Math.max(0, newest.resetat - now), ...newest !== void 0 ? { directive: newest } : {} };
}
async function ratelimitrespect(input) {
  const now = input.now ?? Date.now;
  const sleep = input.sleep ?? ((milliseconds) => new Promise((resolve) => setTimeout(resolve, Math.max(0, milliseconds))));
  const resolved = ratelimitwaitof(input.directives, input.origin, now());
  if (resolved.waitms > 0) await sleep(resolved.waitms);
  return resolved;
}
function bodyhashof(body) {
  let hash = 5381;
  for (let index = 0; index < body.length; index += 1) hash = (hash * 33 ^ body.charCodeAt(index)) & 2147483647;
  return hash.toString(36);
}
function cachekeyof(input) {
  return `${input.runid}:${input.method}:${input.url}:${bodyhashof(input.body)}`;
}
function cacheexpiryof(headers, now, retention) {
  let candidates = [];
  for (const key of Object.keys(headers)) {
    const lowered = key.toLowerCase();
    const value = headers[key];
    if (lowered === "cache-control") {
      const match = /max-age\s*=\s*(\d+)/i.exec(value ?? "");
      if (match !== null) candidates.push(now + Number.parseInt(match[1] ?? "0", 10) * 1e3);
    }
    if (lowered === "expires") {
      const date = Date.parse(value ?? "");
      if (Number.isFinite(date)) candidates.push(date);
    }
  }
  if (retention !== void 0 && Number.isFinite(retention) && retention > 0) candidates.push(now + retention);
  const valid = candidates.filter((candidate) => Number.isFinite(candidate) && candidate > now);
  return valid.length > 0 ? Math.min(...valid) : void 0;
}
function readmethod(method) {
  const upper = method.toUpperCase();
  return upper === "GET" || upper === "HEAD";
}
function cacheresponse(input) {
  if (!readmethod(input.method)) return { entries: input.entries, refusal: `The ${input.method} response of ${input.url} follows a mutation verb and never caches.` };
  if (input.credentials === true) return { entries: input.entries, refusal: `The response of ${input.url} carries credentials and the cache refuses it.` };
  if (input.mutatedat !== void 0 && input.mutatedat > 0) {
    return { entries: input.entries.filter((entry2) => !(entry2.runid === input.runid && sameorigin(entry2, input.url))), refusal: `A mutation landed on the origin of ${input.url}; the responses that follow a mutation never cache and the invalidated entries drop.` };
  }
  const key = cachekeyof({ runid: input.runid, url: input.url, method: input.method, body: input.body });
  const expiry = cacheexpiryof(input.headers, input.now, input.retention);
  const entry = { key, runid: input.runid, url: input.url, method: input.method.toUpperCase(), body: input.body, headers: input.headers, status: input.status, ...expiry !== void 0 ? { expiry } : {}, hits: 0, at: input.now };
  const entries = [entry, ...input.entries.filter((candidate) => candidate.key !== key)];
  return { entries, entry };
}
function cacheserv(input) {
  if (!readmethod(input.method)) return { entries: input.entries };
  const key = cachekeyof({ runid: input.runid, url: input.url, method: input.method, body: input.body });
  const found = input.entries.find((entry) => entry.key === key);
  if (found === void 0) return { entries: input.entries };
  if (input.mutatedat !== void 0 && found.at < input.mutatedat) {
    return { entries: input.entries.filter((entry) => entry.key !== key), expired: found };
  }
  if (found.expiry !== void 0 && input.now >= found.expiry) {
    return { entries: input.entries.filter((entry) => entry.key !== key), expired: found };
  }
  const served = { ...found, hits: found.hits + 1 };
  return { entries: input.entries.map((entry) => entry.key === key ? served : entry), entry: served };
}
function cachecleanup(entries, now) {
  const kept = [];
  const expired = [];
  for (const entry of entries) {
    if (entry.expiry !== void 0 && now >= entry.expiry) expired.push(entry);
    else kept.push(entry);
  }
  return { kept, expired };
}
function apicallrecordof(input) {
  let origin = "";
  let endpoint = "";
  try {
    const parsed = new URL(input.url);
    origin = parsed.origin;
    endpoint = `${parsed.pathname}${parsed.search}`;
  } catch {
    origin = "";
    endpoint = input.url;
  }
  return { id: input.id, runid: input.runid, stepid: input.stepid, url: input.url, origin, endpoint, method: input.method, status: input.status, ...input.mime !== void 0 && input.mime !== "" ? { mime: input.mime } : {}, at: input.at };
}
function sameorigin(entry, url) {
  try {
    return new URL(entry.url).origin === new URL(url).origin;
  } catch {
    return false;
  }
}
function apimapkinds() {
  return ["namespace", "method", "event", "property"];
}
function apimapentries() {
  return [
    { api: "runtime", chromium: "chrome.runtime", firefox: "browser.runtime", safari: "browser.runtime", kind: "namespace" },
    { api: "runtime.geturl", chromium: "chrome.runtime.getURL", firefox: "browser.runtime.getURL", safari: "browser.runtime.getURL", kind: "method" },
    { api: "runtime.connect", chromium: "chrome.runtime.connect", firefox: "browser.runtime.connect", safari: "browser.runtime.connect", kind: "method" },
    { api: "runtime.sendmessage", chromium: "chrome.runtime.sendMessage", firefox: "browser.runtime.sendMessage", safari: "browser.runtime.sendMessage", kind: "method" },
    { api: "runtime.onmessage", chromium: "chrome.runtime.onMessage", firefox: "browser.runtime.onMessage", safari: "browser.runtime.onMessage", kind: "event" },
    { api: "runtime.id", chromium: "chrome.runtime.id", firefox: "browser.runtime.id", safari: "browser.runtime.id", kind: "property" },
    { api: "tabs", chromium: "chrome.tabs", firefox: "browser.tabs", safari: "browser.tabs", kind: "namespace" },
    { api: "tabs.query", chromium: "chrome.tabs.query", firefox: "browser.tabs.query", safari: "browser.tabs.query", kind: "method" },
    { api: "tabs.create", chromium: "chrome.tabs.create", firefox: "browser.tabs.create", safari: "browser.tabs.create", kind: "method" },
    { api: "tabs.update", chromium: "chrome.tabs.update", firefox: "browser.tabs.update", safari: "browser.tabs.update", kind: "method" },
    { api: "tabs.executeScript", chromium: "chrome.tabs.executeScript", firefox: "browser.tabs.executeScript", safari: "", kind: "method" },
    { api: "scripting", chromium: "chrome.scripting", firefox: "browser.scripting", safari: "browser.scripting", kind: "namespace" },
    { api: "scripting.executeScript", chromium: "chrome.scripting.executeScript", firefox: "browser.scripting.executeScript", safari: "browser.scripting.executeScript", kind: "method" },
    { api: "storage", chromium: "chrome.storage", firefox: "browser.storage", safari: "browser.storage", kind: "namespace" },
    { api: "storage.local", chromium: "chrome.storage.local", firefox: "browser.storage.local", safari: "browser.storage.local", kind: "namespace" },
    { api: "storage.session", chromium: "chrome.storage.session", firefox: "browser.storage.session", safari: "browser.storage.session", kind: "namespace" },
    { api: "windows", chromium: "chrome.windows", firefox: "browser.windows", safari: "browser.windows", kind: "namespace" },
    { api: "windows.create", chromium: "chrome.windows.create", firefox: "browser.windows.create", safari: "browser.windows.create", kind: "method" },
    { api: "windows.update", chromium: "chrome.windows.update", firefox: "browser.windows.update", safari: "browser.windows.update", kind: "method" },
    { api: "notifications", chromium: "chrome.notifications", firefox: "browser.notifications", safari: "browser.notifications", kind: "namespace" },
    { api: "notifications.create", chromium: "chrome.notifications.create", firefox: "browser.notifications.create", safari: "browser.notifications.create", kind: "method" },
    { api: "downloads", chromium: "chrome.downloads", firefox: "browser.downloads", safari: "browser.downloads", kind: "namespace" },
    { api: "downloads.download", chromium: "chrome.downloads.download", firefox: "browser.downloads.download", safari: "browser.downloads.download", kind: "method" },
    { api: "contextMenus", chromium: "chrome.contextMenus", firefox: "browser.contextMenus", safari: "browser.contextMenus", kind: "namespace" },
    { api: "contextMenus.create", chromium: "chrome.contextMenus.create", firefox: "browser.contextMenus.create", safari: "browser.contextMenus.create", kind: "method" },
    { api: "sidePanel", chromium: "chrome.sidePanel", firefox: "browserpolyfill.sidepanel", safari: "browserpolyfill.sidepanel", kind: "namespace" },
    { api: "sidePanel.open", chromium: "chrome.sidePanel.open", firefox: "browserpolyfill.sidepanel.open", safari: "browserpolyfill.sidepanel.open", kind: "method" },
    { api: "sidePanel.setoptions", chromium: "chrome.sidePanel.setOptions", firefox: "browserpolyfill.sidepanel.setoptions", safari: "browserpolyfill.sidepanel.setoptions", kind: "method" },
    { api: "offscreen", chromium: "chrome.offscreen", firefox: "browserpolyfill.offscreen", safari: "browserpolyfill.offscreen", kind: "namespace" },
    { api: "offscreen.createDocument", chromium: "chrome.offscreen.createDocument", firefox: "browserpolyfill.offscreen.inline", safari: "browserpolyfill.offscreen.inline", kind: "method" },
    { api: "action", chromium: "chrome.action", firefox: "browser.action", safari: "browser.action", kind: "namespace" },
    { api: "action.setpopup", chromium: "chrome.action.setPopup", firefox: "browser.action.setPopup", safari: "browser.action.setPopup", kind: "method" },
    { api: "clipboardRead", chromium: "navigator.clipboard.readText", firefox: "navigator.clipboard.readText", safari: "navigator.clipboard.readText", kind: "method" },
    { api: "clipboardWrite", chromium: "navigator.clipboard.writeText", firefox: "navigator.clipboard.writeText", safari: "navigator.clipboard.writeText", kind: "method" },
    { api: "i18n", chromium: "chrome.i18n", firefox: "browser.i18n", safari: "browser.i18n", kind: "namespace" },
    { api: "i18n.getmessage", chromium: "chrome.i18n.getMessage", firefox: "browser.i18n.getMessage", safari: "browser.i18n.getMessage", kind: "method" },
    { api: "permissions", chromium: "chrome.permissions", firefox: "browser.permissions", safari: "browser.permissions", kind: "namespace" },
    { api: "permissions.request", chromium: "chrome.permissions.request", firefox: "browser.permissions.request", safari: "browser.permissions.request", kind: "method" },
    { api: "permissions.contains", chromium: "chrome.permissions.contains", firefox: "browser.permissions.contains", safari: "browser.permissions.contains", kind: "method" },
    { api: "management", chromium: "chrome.management", firefox: "browser.management", safari: "browser.management", kind: "namespace" },
    { api: "commands", chromium: "chrome.commands", firefox: "browser.commands", safari: "browser.commands", kind: "namespace" },
    { api: "commands.onCommand", chromium: "chrome.commands.onCommand", firefox: "browser.commands.onCommand", safari: "browser.commands.onCommand", kind: "event" },
    { api: "nativeMessaging", chromium: "chrome.runtime.connectNative", firefox: "browser.runtime.connectNative", safari: "", kind: "method" }
  ];
}
function apifeatureflagintersection() {
  const entries = apimapentries();
  const browsers = ["chromium", "firefox", "safari"];
  const flags = [];
  for (const entry of entries) {
    let all = true;
    for (const browser of browsers) {
      const value = browser === "chromium" ? entry.chromium : browser === "firefox" ? entry.firefox : entry.safari;
      if (value === "") {
        all = false;
        break;
      }
    }
    if (all) flags.push(entry.api);
  }
  return flags.sort();
}
function apimapentryof(api) {
  return apimapentries().find((entry) => entry.api === api);
}
function apimapresolve(input) {
  const api = (input.api ?? "").trim();
  if (api === "") return { ok: false, browser: input.browser ?? "chromium", reason: "The apimap resolution names its api; an empty api resolves nothing.", retry: "none" };
  const entry = apimapentryof(api);
  if (entry === void 0) return { ok: false, browser: input.browser ?? "chromium", reason: `The apimap carries no row for the ${api} api; the catalog must record every api the codebase touches.`, retry: "none" };
  const browser = input.browser ?? apimapbrowserof({ ...input.runtime !== void 0 ? { runtime: input.runtime } : {}, ...input.probeuseragent !== void 0 ? { probeuseragent: input.probeuseragent } : {} });
  const value = browser === "chromium" ? entry.chromium : browser === "firefox" ? entry.firefox : entry.safari;
  if (value === "") return { ok: false, browser, reason: `The ${api} api has no ${browser} equivalent in the apimap; the feature flag stays off and the call surfaces a structured error.`, retry: "none" };
  return { ok: true, browser, api, equivalent: value };
}
function apimapunmapped(entries = apimapentries()) {
  const rows = entries.map((entry) => ({ api: entry.api, chromium: entry.chromium !== "", firefox: entry.firefox !== "", safari: entry.safari !== "" }));
  const missingchromium = rows.filter((row) => !row.chromium).map((row) => row.api);
  const missingfirefox = rows.filter((row) => !row.firefox).map((row) => row.api);
  const missingsafari = rows.filter((row) => !row.safari).map((row) => row.api);
  const failed = missingchromium.length > 0 || missingfirefox.length > 0;
  const reason = failed ? `The apimap carries apis without a chromium or firefox mapping: ${[...missingchromium, ...missingfirefox].filter((name, index, source) => source.indexOf(name) === index).slice(0, 5).join(", ")}; every webextension api the codebase touches needs a chromium and firefox row.` : "";
  return { rows, missingchromium, missingfirefox, missingsafari, failed, reason };
}
function apimapbrowserof(input = {}) {
  if (input.runtime !== void 0 && input.runtime !== null) {
    const record = input.runtime;
    if (typeof record.browser === "object" && record.browser !== null) return "firefox";
    if (typeof record.chrome === "object" && record.chrome !== null) return "chromium";
    if (typeof record.sidePanel === "object" && record.sidePanel !== null) return "chromium";
  }
  const useragent = input.probeuseragent !== void 0 ? input.probeuseragent() : "";
  if (useragent !== "") {
    if (/firefox/i.test(useragent)) return "firefox";
    if (/safari/i.test(useragent) && !/chrome/i.test(useragent)) return "safari";
  }
  return "chromium";
}
function apimapbrowsercacheprobe(input = {}) {
  let cached;
  const probe = () => {
    if (cached === void 0) cached = apimapbrowserof(input);
    return cached;
  };
  const refresh = () => {
    cached = apimapbrowserof(input);
    return cached;
  };
  return { probe, refresh };
}
function apimapstructerrorof(input) {
  const message = input.reason !== void 0 && input.reason !== "" ? input.reason : `The ${input.api} api has no ${input.browser} equivalent; the feature flag stays off and the call surfaces a structured error.`;
  return { family: "apimap", message, retry: "none", browser: input.browser, api: input.api, at: input.now };
}
export {
  adapterof,
  anthropicgatewayadapter,
  apicallrecordof,
  apifeatureflagintersection,
  apimapbrowsercacheprobe,
  apimapbrowserof,
  apimapentries,
  apimapentryof,
  apimapkinds,
  apimapresolve,
  apimapstructerrorof,
  apimapunmapped,
  bodyhashof,
  cachecleanup,
  cacheexpiryof,
  cachekeyof,
  cacheresponse,
  cacheserv,
  capabilityadvertisement,
  composegatewayprompt,
  correlateids,
  correlationexport,
  costestimates,
  defaultbaseurl,
  fetchmodellist,
  formpost,
  gatewayadapters,
  gatewaybudgetcheck,
  gatewaybudgetwarning,
  gatewaycall,
  gatewaycancel,
  gatewaychatstateof,
  gatewayerrorfrom,
  gatewayerrorof,
  gatewayguard,
  gatewayislocal,
  gatewaykeyref,
  gatewaykinds,
  gatewayplanguard,
  gatewayretryafterof,
  gatewaystream,
  gatewaytemplates,
  gatewayurl,
  gatewayusagerecord,
  geminigatewayadapter,
  graphqlsub,
  graphqlsubscribeframe,
  graphqlsubscriptionof,
  guardretryprompt,
  joincorrelation,
  keyexportcheck,
  longpoll,
  longpollrequestof,
  maskkey,
  maskrequest,
  multipartfieldheader,
  multipartpost,
  ollamalocaladapter,
  ollamalocaldefault,
  openaicompatadapter,
  parsegraphqlmessage,
  ratelimitdirectiveof,
  ratelimitrespect,
  ratelimitwaitof,
  readmethod,
  resolvegatewayroute,
  resolveproviderkey,
  revokeproviderkey,
  storeproviderkey,
  streamrender,
  subevents,
  validategatewayconfig
};
//# sourceMappingURL=gateway.js.map
