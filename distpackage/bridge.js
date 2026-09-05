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
function pairingcountdown(record, now) {
  const secondsleft = Math.max(0, Math.ceil((record.code.expiresat - now) / 1e3));
  const expired = now >= record.code.expiresat || record.code.usedat !== void 0;
  const minutes = Math.floor(secondsleft / 60);
  const seconds = secondsleft % 60;
  const label = expired ? `The pairing code ${record.code.code} expired.` : `The pairing code ${record.code.code} expires in ${minutes}m ${String(seconds).padStart(2, "0")}s.`;
  return { secondsleft, expired, label };
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

// serve.ts
function notificationframe(method, params) {
  return { jsonrpc: "2.0", method, ...params !== void 0 ? { params } : {} };
}

// net.ts
function reconnectwaits(attempts, base, ceiling) {
  const count = Math.max(0, Math.floor(attempts));
  const waits = [];
  let wait = Math.max(0, base);
  for (let index = 0; index < count; index += 1) {
    waits.push(wait);
    const next = wait * 2;
    wait = ceiling !== void 0 && Number.isFinite(ceiling) && ceiling >= 0 ? Math.min(next, ceiling) : next;
  }
  return waits;
}

// bridge.ts
var serveroperations = ["sessioncreate", "sessionjoin", "eventpost", "eventstream"];
var servereventtypes = ["chat", "planproposal", "planreview", "progress"];
var pagecontentkeys = ["html", "content", "body", "textpreview", "preview", "dom", "markup", "screenshot", "pagetext", "outerhtml", "innertext"];
function contractcapabilities(version = servercontractversion) {
  return { version, operations: [...serveroperations], events: [...servereventtypes], heartbeat: true, multiplex: true };
}
function stableopid(seed, sequence) {
  const trimmed = seed.trim();
  if (trimmed === "") throw new Error("The operation id names its sender seed; an empty seed never correlates a reply.");
  if (!Number.isInteger(sequence) || sequence < 1) throw new Error("The operation id sequence stays a positive whole number per sender.");
  return `op-${trimmed}-${sequence}`;
}
function negotiatecapabilities(ours, theirs) {
  if (!Number.isInteger(ours.version) || ours.version < 1 || !Number.isInteger(theirs.version) || theirs.version < 1) return { ok: false, version: 0, operations: [], events: [], heartbeat: false, multiplex: false, reason: "The servercontract version stays a positive whole number on both sides of the handshake." };
  const version = Math.min(ours.version, theirs.version);
  const operations = serveroperations.filter((operation) => ours.operations.includes(operation) && theirs.operations.includes(operation));
  const events = servereventtypes.filter((event) => ours.events.includes(event) && theirs.events.includes(event));
  if (version < 1) return { ok: false, version: 0, operations: [], events: [], heartbeat: false, multiplex: false, reason: "The two handshake sides share no servercontract version." };
  if (operations.length === 0) return { ok: false, version, operations: [], events: [], heartbeat: false, multiplex: false, reason: "The two handshake sides share no wire operation." };
  if (events.length === 0) return { ok: false, version, operations: [], events: [], heartbeat: false, multiplex: false, reason: "The two handshake sides share no event type." };
  return { ok: true, version, operations, events, heartbeat: ours.heartbeat === true && theirs.heartbeat === true, multiplex: ours.multiplex === true && theirs.multiplex === true };
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
function envelopeacceptance(value) {
  try {
    return { ok: true, envelope: parseenvelope(value) };
  } catch (error) {
    return { ok: false, reason: error instanceof Error ? error.message : String(error) };
  }
}
function sessioncreatebody(input) {
  const memberid = input.memberid.trim();
  if (memberid === "") throw new Error("The sessioncreate body names its member id.");
  if (input.role !== "extension" && input.role !== "site") throw new Error("The sessioncreate role is the extension or the site side.");
  return { role: input.role, memberid, capabilities: input.capabilities, ...input.pairingcode !== void 0 && input.pairingcode.trim() !== "" ? { pairingcode: input.pairingcode.trim() } : {} };
}
function sessionjoinbody(input) {
  const sessionid = (input.sessionid ?? "").trim();
  const pairingcode = (input.pairingcode ?? "").trim();
  if (sessionid === "" && pairingcode === "") throw new Error("The sessionjoin body names its session id or rides its pairing code; one of the two identifies the join.");
  const memberid = input.memberid.trim();
  if (memberid === "") throw new Error("The sessionjoin body names its member id.");
  if (input.role !== "extension" && input.role !== "site") throw new Error("The sessionjoin role is the extension or the site side.");
  return { ...sessionid !== "" ? { sessionid } : {}, role: input.role, memberid, capabilities: input.capabilities, ...pairingcode !== "" ? { pairingcode } : {} };
}
function eventpostbody(input) {
  if (!servereventtypes.includes(input.event.kind)) throw new Error(`The event type ${input.event.kind} sits outside the servercontract event types.`);
  const stream = input.event.stream.trim();
  if (stream === "") throw new Error("The eventpost body names its multiplexed stream.");
  if (!input.event.payload || typeof input.event.payload !== "object" || Array.isArray(input.event.payload)) throw new Error("The eventpost payload must be a json object.");
  return { kind: input.event.kind, stream, payload: input.event.payload };
}
function eventstreambody(input) {
  const streams = input.streams.map((stream) => stream.trim()).filter((stream) => stream !== "");
  if (streams.length === 0) throw new Error("The eventstream body names at least one multiplexed stream.");
  if (input.since !== void 0 && !Number.isFinite(input.since)) throw new Error("The eventstream resume timestamp stays a finite number.");
  return { streams, ...input.since !== void 0 ? { since: input.since } : {} };
}
function chateventpayload(input) {
  const text = input.text.trim();
  if (text === "") throw new Error("The chat event carries its task text.");
  const from = input.from.trim();
  if (from === "") throw new Error("The chat event names its sender.");
  return { text, from };
}
function planproposaleventpayload(card) {
  const proposalid = card.proposalid.trim();
  if (proposalid === "") throw new Error("The plan proposal names its proposal id.");
  const title = card.title.trim();
  if (title === "") throw new Error("The plan proposal names its plan title.");
  if (card.steps.length === 0) throw new Error("The plan proposal carries at least one step of its digest.");
  return { proposalid, title, steps: card.steps.map((step) => ({ id: step.id, kind: step.kind, origin: step.origin, sensitive: step.sensitive })), ...card.timeoutat !== void 0 ? { timeoutat: card.timeoutat } : {} };
}
function planrevieweventpayload(decision) {
  const proposalid = decision.proposalid.trim();
  if (proposalid === "") throw new Error("The plan review names its proposal id.");
  if (decision.decision !== "approved" && decision.decision !== "changes" && decision.decision !== "refused") throw new Error("The plan review decision is approved, changes or refused.");
  const by = decision.by.trim();
  if (by === "") throw new Error("The plan review names its reviewer.");
  return { proposalid, decision: decision.decision, by, ...decision.note !== void 0 && decision.note.trim() !== "" ? { note: decision.note.trim() } : {} };
}
function progresseventpayload(input) {
  const stepid = input.stepid.trim();
  if (stepid === "") throw new Error("The progress event names its step id.");
  const status = input.status.trim();
  if (status === "") throw new Error("The progress event names its status word.");
  return { stepid, status };
}
function heartbeatevent(now) {
  if (!Number.isFinite(now)) throw new Error("The heartbeat event carries its timestamp.");
  return { kind: "progress", stream: "heartbeat", payload: progresseventpayload({ stepid: "heartbeat", status: "alive" }) };
}
function bridgepayload(kind, payload, pageconsent) {
  if (kind === "chat") return { payload, held: [] };
  const held = [];
  const minimized = {};
  for (const [key, value] of Object.entries(payload)) {
    if (pagecontentkeys.includes(key) && pageconsent !== true) {
      held.push(key);
      continue;
    }
    minimized[key] = value;
  }
  return { payload: minimized, held };
}
function minimalplandigest(plan, statuses = {}) {
  const objective = plan.objective.trim();
  if (objective === "") throw new Error("The plan digest names its objective.");
  return { title: objective, steps: plan.steps.map((step) => ({ id: step.id, kind: step.kind, status: statuses[step.id] ?? "pending" })) };
}
function frameof(envelope) {
  return JSON.stringify(envelope);
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
function sitemanifestof(version = servercontractversion) {
  return { name: "devthink site", servercontract: version, capabilities: contractcapabilities(version) };
}
function relayorigin(url) {
  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol !== "wss:" && parsed.protocol !== "ws:") return "";
    const protocol = parsed.protocol === "wss:" ? "https:" : "http:";
    return `${protocol}//${parsed.host}`;
  } catch {
    return "";
  }
}
function newrelayclient(input) {
  const memberid = input.memberid.trim();
  if (memberid === "") throw new Error("The bridge client names its member id.");
  const url = input.url.trim();
  if (url !== "" && relayorigin(url) === "") throw new Error("The relay url must be a wss or ws url the user chose.");
  return { url, origin: relayorigin(url), sessionid: (input.sessionid ?? "").trim(), token: (input.token ?? "").trim(), memberid, role: input.role, state: url === "" ? "idle" : "connecting", attempts: 0, rotations: 0, sent: 0, received: 0, lastframeat: input.now, lastheartbeatat: input.now, streams: {}, acks: [], queue: [], capabilities: input.capabilities, rate: { used: 0, windowstartedat: input.now }, sequence: 0 };
}
function verifyframeauth(envelope, state) {
  if (state.sessionid === "" || state.token === "") return false;
  return envelope.sessionid === state.sessionid && envelope.token === state.token;
}
function frameauth(envelope, state) {
  return { ...envelope, sessionid: state.sessionid, token: state.token };
}
function bridgeframerate(input) {
  const window = input.window !== void 0 && Number.isFinite(input.window) && input.window > 0 ? input.window : void 0;
  if (window === void 0) return { allowed: true, used: input.rate.used, windowstartedat: input.rate.windowstartedat };
  if (input.now - input.rate.windowstartedat >= window) return { allowed: input.cap === void 0 || input.cap >= 1, used: input.cap === void 0 ? input.rate.used : 1, windowstartedat: input.now, resetsat: input.now + window };
  const used = input.rate.used + 1;
  if (input.cap !== void 0 && Number.isFinite(input.cap) && input.cap >= 1 && used > input.cap) return { allowed: false, used: input.rate.used, windowstartedat: input.rate.windowstartedat, resetsat: input.rate.windowstartedat + window };
  return { allowed: true, used, windowstartedat: input.rate.windowstartedat, resetsat: input.rate.windowstartedat + window };
}
function sendframe(state, socket, envelope, now) {
  if (state.state !== "connected") return { state, sent: false, reason: "The bridge socket stays down; the frame waits in the offline queue." };
  const stamped = frameauth(envelope, state);
  socket.send(frameof(stamped));
  return { state: { ...state, sent: state.sent + 1, lastframeat: now }, sent: true };
}
function receiveframe(state, frame, now) {
  let envelope;
  try {
    envelope = parsewireframe(frame);
  } catch (error) {
    return { state, rejection: error instanceof Error ? error.message : String(error) };
  }
  if (!verifyframeauth(envelope, state)) return { state, rejection: `The frame ${envelope.opid} failed the frame authentication of the session ${state.sessionid}.` };
  if (envelope.op === "eventpost" && envelope.body !== void 0) {
    const stream = typeof envelope.body.stream === "string" ? envelope.body.stream.trim() : "";
    const kind = typeof envelope.body.kind === "string" ? envelope.body.kind : "";
    if (stream !== "") {
      const record = { id: envelope.opid, sessionid: state.sessionid, kind, opid: envelope.opid, stream, payload: envelope.body.payload ?? {}, at: envelope.at, delivered: true };
      const next = { ...state, received: state.received + 1, lastframeat: now, acks: [...state.acks, envelope], streams: { ...state.streams, [stream]: [...state.streams[stream] ?? [], record] } };
      return { state: next, envelope };
    }
  }
  return { state: { ...state, received: state.received + 1, lastframeat: now, acks: [...state.acks, envelope] }, envelope };
}
function enqueuebridge(state, input) {
  if (state.queue.some((record2) => record2.opid === input.opid)) return state;
  const record = { opid: input.opid, op: input.op, sessionid: state.sessionid, body: input.body, queuedat: input.now, attempts: 0 };
  return { ...state, queue: [...state.queue, record] };
}
function replaybridgequeue(state, socket, now) {
  let replayed = 0;
  let deduped = 0;
  const seen = /* @__PURE__ */ new Set();
  const queue = [];
  let sent = state.sent;
  for (const record of state.queue) {
    if (seen.has(record.opid)) {
      deduped += 1;
      continue;
    }
    seen.add(record.opid);
    if (record.sentat !== void 0 || state.state !== "connected") {
      queue.push(record);
      continue;
    }
    socket.send(frameof(frameauth(composeenvelope({ op: record.op, opid: record.opid, at: now, body: record.body }), state)));
    queue.push({ ...record, attempts: record.attempts + 1, sentat: now });
    replayed += 1;
    sent += 1;
  }
  return { state: { ...state, queue, sent, lastframeat: now }, replayed, deduped };
}
function postevent(state, socket, event, now, rate) {
  const opid = `op-${state.memberid}-${state.sequence + 1}`;
  const body = eventpostbody({ event });
  if (state.state !== "connected" || socket === void 0) {
    return { state: enqueuebridge({ ...state, sequence: state.sequence + 1 }, { op: "eventpost", opid, body, now }), sent: false, queued: true, reason: "The bridge socket stays down; the event waits in the offline queue." };
  }
  const window = bridgeframerate({ rate: state.rate, ...rate?.cap !== void 0 ? { cap: rate.cap } : {}, ...rate?.window !== void 0 ? { window: rate.window } : {}, now });
  if (!window.allowed) {
    return { state: enqueuebridge({ ...state, sequence: state.sequence + 1, rate: { used: window.used, windowstartedat: window.windowstartedat } }, { op: "eventpost", opid, body, now }), sent: false, queued: true, reason: `The bridge rate window holds its ${rate?.cap} frame cap; the event waits for the window reset.` };
  }
  const sent = sendframe({ ...state, sequence: state.sequence + 1, rate: { used: window.used, windowstartedat: window.windowstartedat } }, socket, composeenvelope({ op: "eventpost", opid, at: now, body }), now);
  return { state: sent.state, sent: true, queued: false };
}
function heartbeattick(state, socket, now, interval) {
  if (state.state !== "connected" || socket === void 0) return { state, beat: false };
  if (interval === void 0 || !Number.isFinite(interval) || interval <= 0) return { state, beat: false };
  if (now - state.lastheartbeatat < interval) return { state, beat: false };
  const event = heartbeatevent(now);
  const opid = `op-${state.memberid}-heartbeat-${state.sent + 1}`;
  const sent = sendframe(state, socket, composeenvelope({ op: "eventpost", opid, at: now, body: eventpostbody({ event }) }), now);
  return { state: { ...sent.state, lastheartbeatat: now }, beat: true };
}
function idleexpired(state, now, idlewindow) {
  if (idlewindow === void 0 || !Number.isFinite(idlewindow) || idlewindow <= 0) return false;
  return now - state.lastframeat >= idlewindow;
}
function disconnectrelay(state, now, reason) {
  return { ...state, state: "closed", closedat: now, ...reason !== void 0 ? { lasterror: reason } : {} };
}
function bridgestatusview(state) {
  if (state.url === "") return { status: "disabled", paired: false, queued: state.queue.filter((record) => record.sentat === void 0).length };
  const paired = state.sessionid !== "" && state.token !== "";
  if (state.state === "connected") return { status: "connected", paired, queued: state.queue.filter((record) => record.sentat === void 0).length };
  if (paired) return { status: "paired", paired: true, queued: state.queue.filter((record) => record.sentat === void 0).length };
  return { status: "offline", paired: false, queued: state.queue.filter((record) => record.sentat === void 0).length };
}
async function connectrelay(input) {
  const sleep = input.sleep ?? ((milliseconds) => new Promise((resolve) => setTimeout(resolve, Math.max(0, milliseconds))));
  const now = input.now ?? Date.now;
  if (input.state.url.trim() === "") return { state: { ...input.state, state: "idle", lasterror: "The bridge stays disabled because no relay url is configured; the url is always the user's setting." }, error: "The bridge stays disabled because no relay url is configured; the url is always the user's setting." };
  const budget = Math.max(1, Math.floor(input.attempts ?? 1));
  const waits = reconnectwaits(budget - 1, input.backoffbase ?? 0, input.backoffceiling);
  let state = { ...input.state, state: "connecting" };
  let lasterror = "";
  for (let attempt = 0; attempt < budget; attempt += 1) {
    let socket;
    try {
      socket = await input.open(state.url);
    } catch (error) {
      lasterror = error instanceof Error ? error.message : String(error);
      if (attempt < budget - 1) {
        const wait = waits[attempt] ?? 0;
        if (wait > 0) await sleep(wait);
        state = { ...state, attempts: state.attempts + 1, state: "reconnecting" };
        if (input.rotate !== void 0) {
          try {
            state = { ...state, token: await input.rotate(), rotations: state.rotations + 1 };
          } catch {
          }
        }
      }
      continue;
    }
    state = { ...state, state: "authenticating" };
    const opid = `op-${state.memberid}-join-${state.attempts + 1}`;
    const firstjoin = state.sessionid === "";
    const reply = await new Promise((resolve) => {
      socket.onmessage = (frame) => resolve({ frame });
      socket.onclose = (code) => resolve({ error: `The relay socket closed with code ${code} before the ${firstjoin ? "session create" : "join"} reply.` });
      socket.onerror = (error) => resolve({ error });
      const createsession = firstjoin && state.role === "extension";
      const body = createsession ? { role: state.role, memberid: state.memberid, capabilities: state.capabilities, ...input.pairingcode !== void 0 && input.pairingcode.trim() !== "" ? { pairingcode: input.pairingcode.trim() } : {} } : firstjoin ? { role: state.role, memberid: state.memberid, capabilities: state.capabilities, ...input.pairingcode !== void 0 && input.pairingcode.trim() !== "" ? { pairingcode: input.pairingcode.trim() } : {} } : { sessionid: state.sessionid, role: state.role, memberid: state.memberid, capabilities: state.capabilities };
      socket.send(frameof(frameauth(composeenvelope({ op: createsession ? "sessioncreate" : "sessionjoin", opid, at: now(), body }), { ...state, token: state.token })));
    });
    if (reply.frame === void 0) {
      lasterror = reply.error ?? "The relay socket closed before the join reply.";
      try {
        socket.close(1e3);
      } catch {
      }
      if (attempt < budget - 1) {
        const wait = waits[attempt] ?? 0;
        if (wait > 0) await sleep(wait);
        state = { ...state, attempts: state.attempts + 1, state: "reconnecting" };
        if (input.rotate !== void 0) {
          try {
            state = { ...state, token: await input.rotate(), rotations: state.rotations + 1 };
          } catch {
          }
        }
      }
      continue;
    }
    let envelope;
    try {
      envelope = parsewireframe(reply.frame);
    } catch (error) {
      lasterror = error instanceof Error ? error.message : String(error);
      try {
        socket.close(1e3);
      } catch {
      }
      continue;
    }
    if (envelope.opid !== opid) {
      lasterror = `The join reply ${envelope.opid} does not correlate the join request ${opid}.`;
      try {
        socket.close(1e3);
      } catch {
      }
      continue;
    }
    if (envelope.body !== void 0 && typeof envelope.body.error === "string" && envelope.body.error.trim() !== "") {
      lasterror = envelope.body.error;
      try {
        socket.close(1e3);
      } catch {
      }
      if (attempt < budget - 1) {
        const wait = waits[attempt] ?? 0;
        if (wait > 0) await sleep(wait);
        state = { ...state, attempts: state.attempts + 1, state: "reconnecting" };
      }
      continue;
    }
    const rotatedtoken = envelope.body !== void 0 && typeof envelope.body.token === "string" ? envelope.body.token.trim() : "";
    const sessionid = envelope.body !== void 0 && typeof envelope.body.sessionid === "string" ? envelope.body.sessionid.trim() : state.sessionid;
    state = { ...state, state: "connected", sessionid: sessionid !== "" ? sessionid : state.sessionid, token: rotatedtoken !== "" ? rotatedtoken : state.token, rotations: rotatedtoken !== "" ? state.rotations + 1 : state.rotations, openedat: now(), lastframeat: now(), lastheartbeatat: now(), acks: [...state.acks, envelope] };
    return { state, socket };
  }
  return { state: { ...state, state: "closed", attempts: state.attempts, closedat: now(), lasterror }, error: lasterror };
}
function chatrowsof(events, memberid) {
  return events.filter((event) => event.kind === "chat").map((event) => ({ from: typeof event.payload.from === "string" ? event.payload.from : "", text: typeof event.payload.text === "string" ? event.payload.text : "", mine: typeof event.payload.from === "string" && event.payload.from === memberid, at: event.at }));
}
function reviewcardsof(events) {
  return events.filter((event) => event.kind === "planproposal").map((event) => {
    const steps = Array.isArray(event.payload.steps) ? event.payload.steps.filter((step) => typeof step.id === "string" && typeof step.kind === "string").map((step) => ({ id: String(step.id), kind: String(step.kind), origin: typeof step.origin === "string" ? step.origin : "", sensitive: step.sensitive === true })) : [];
    return { proposalid: typeof event.payload.proposalid === "string" ? event.payload.proposalid : "", title: typeof event.payload.title === "string" ? event.payload.title : "", steps, ...typeof event.payload.timeoutat === "number" ? { timeoutat: event.payload.timeoutat } : {}, at: event.at };
  }).filter((card) => card.proposalid !== "" && card.title !== "");
}
function carddecision(card, decision, by, now, note) {
  if (card.proposalid.trim() === "") throw new Error("The review decision names its proposal.");
  if (decision !== "approved" && decision !== "changes" && decision !== "refused") throw new Error("The review decision is approved, changes or refused.");
  const reviewer = by.trim();
  if (reviewer === "") throw new Error("The review decision names its reviewer.");
  return { proposalid: card.proposalid, decision, by: reviewer, ...note !== void 0 && note.trim() !== "" ? { note: note.trim() } : {}, at: now };
}
function decisionpayload(decision) {
  return planrevieweventpayload(decision);
}
function reviewgateoutcome(decision) {
  if (decision.decision === "approved") return { state: "approved", reason: `The site review approved the plan proposal ${decision.proposalid}${decision.note !== void 0 ? ` with the note ${decision.note}` : ""}; the extension review gate resolves as approved and the extension stays the only executor.` };
  return { state: "refused", reason: `The site review returned ${decision.decision} for the plan proposal ${decision.proposalid}${decision.note !== void 0 ? ` with the note ${decision.note}` : ""}; the proposal returns to the review surface and no step executes.` };
}
function chateventof(text, from) {
  return { kind: "chat", stream: "chat", payload: chateventpayload({ text, from }) };
}
function planproposaleventof(card) {
  return { kind: "planproposal", stream: "review", payload: planproposaleventpayload(card) };
}
function widgetview(input) {
  const cards = reviewcardsof(input.events);
  const answered = new Set(input.events.filter((event) => event.kind === "planreview").map((event) => typeof event.payload.proposalid === "string" ? event.payload.proposalid : "").filter((id) => id !== ""));
  return { status: input.status, rows: chatrowsof(input.events, input.memberid), cards, pending: cards.filter((card) => !answered.has(card.proposalid)).length };
}
function pairingpanel(record, now) {
  const countdown = pairingcountdown(record, now);
  return { code: record.code.code, secondsleft: countdown.secondsleft, expired: countdown.expired, label: countdown.label };
}
function sitemanifest() {
  return sitemanifestof();
}
function bridgestatuslabel(view) {
  if (view.status === "connected") return `Bridge: connected${view.paired ? " and paired" : ""}${view.queued > 0 ? ` \xB7 ${view.queued} queued frame${view.queued === 1 ? "" : "s"}` : ""}.`;
  if (view.status === "paired") return `Bridge: paired, socket offline${view.queued > 0 ? ` \xB7 ${view.queued} queued frame${view.queued === 1 ? "" : "s"}` : ""}.`;
  if (view.status === "offline") return `Bridge: offline${view.queued > 0 ? ` \xB7 ${view.queued} queued frame${view.queued === 1 ? "" : "s"}` : ""}.`;
  return "Bridge: disabled (no relay url set).";
}
var wsbridgelocalhosts = ["127.0.0.1", "localhost", "::1", "[::1]"];
var wsbridgestreamname = "nativetransport";
function wsbridgebindcheck(input) {
  const bind = (input.bind ?? "").trim() === "" ? "127.0.0.1" : (input.bind ?? "").trim();
  if (!wsbridgelocalhosts.includes(bind)) return { ok: false, bind, port: 0, reason: `The wsbridge binds a localhost address only; the ${bind} address accepts connections from other machines and the bridge never leaves the machine.` };
  const port = input.port ?? 0;
  if (!Number.isInteger(port) || port < 0 || port > 65535) return { ok: false, bind, port: 0, reason: `The wsbridge port stays a whole number between zero and 65535; the zero port asks the socket for a random free port.` };
  return { ok: true, bind, port };
}
function wsbridgesessionstart(input) {
  if (!Number.isInteger(input.port) || input.port < 0 || input.port > 65535) throw new Error("The wsbridge session port stays a whole number between zero and 65535.");
  const token = input.token.trim();
  if (token === "") throw new Error("The wsbridge session carries its per session token; an empty token authenticates nothing.");
  if (input.idlewindow !== void 0 && (!Number.isFinite(input.idlewindow) || input.idlewindow <= 0)) throw new Error("The wsbridge idle window stays a positive millisecond count the user chose.");
  return { id: input.id ?? `wsbridge-${input.now}`, port: input.port, tokenhash: input.hashof(token), boundat: input.now, ...input.idlewindow !== void 0 ? { idlewindow: input.idlewindow, expiresat: input.now + input.idlewindow } : {}, extensionconnected: false, connections: 0, received: 0, sent: 0 };
}
function wsbridgeconnection(session, now) {
  const idlewindow = session.idlewindow;
  return { ...session, connections: session.connections + 1, lastframeat: now, ...idlewindow !== void 0 ? { expiresat: now + idlewindow } : {} };
}
function wsbridgeextensionconnect(session, now) {
  if (session.extensionconnected) return { refused: `The wsbridge session holds one extension connection at a time; the extension side of the session ${session.id} stays taken.` };
  const connected = wsbridgeconnection(session, now);
  return { session: { ...connected, extensionconnected: true } };
}
function wsbridgeframeauth(session, token, hashof) {
  const trimmed = (token ?? "").trim();
  if (trimmed === "") return { ok: false, reason: "The wsbridge frame carries its session token; an anonymous frame refuses at the door." };
  if (hashof(trimmed) !== session.tokenhash) return { ok: false, reason: `The wsbridge frame token fails the session ${session.id} authentication; a wrong token never reaches the body.` };
  return { ok: true };
}
function wsbridgeidlesweep(session, now) {
  if (session.idlewindow === void 0 || session.expiresat === void 0) return { expired: false, session };
  if (session.lastframeat !== void 0 && session.lastframeat > session.expiresat - session.idlewindow) {
    const slid = { ...session, expiresat: session.lastframeat + session.idlewindow };
    if (now < slid.expiresat) return { expired: false, session: slid };
  }
  if (now >= session.expiresat) return { expired: true, session, reason: `The wsbridge session ${session.id} sat quiet past its ${session.idlewindow} millisecond idle window; the session expired and the token stopped verifying.` };
  return { expired: false, session };
}
function wsbridgeenvelopeof(input) {
  return composeenvelope({ op: "eventpost", opid: input.opid, at: input.at, version: input.version ?? servercontractversion, ...input.sessionid !== void 0 && input.sessionid !== "" ? { sessionid: input.sessionid } : {}, ...input.token !== void 0 && input.token !== "" ? { token: input.token } : {}, body: { kind: "progress", stream: wsbridgestreamname, payload: { frame: input.frame } } });
}
function wsbridgeframeof(envelope) {
  if (envelope.op !== "eventpost") return { reason: `The wsbridge envelope carries the eventpost operation; a ${envelope.op} envelope never reaches the native transport.` };
  const body = envelope.body ?? {};
  if (body.stream !== wsbridgestreamname) return { reason: `The wsbridge envelope rides the ${wsbridgestreamname} stream; a ${String(body.stream)} envelope stays outside the native transport.` };
  const frame = body.payload;
  if (frame === void 0 || frame === null || typeof frame !== "object" || Array.isArray(frame)) return { reason: "The wsbridge envelope payload carries the native frame object." };
  const candidate = frame.frame;
  if (candidate === void 0 || candidate === null || typeof candidate !== "object" || Array.isArray(candidate)) return { reason: "The wsbridge envelope payload wraps its native frame under the frame key." };
  const typed = candidate;
  if (typeof typed.kind !== "string" || typeof typed.correlationid !== "string") return { reason: "The wsbridge native frame carries its kind and its correlation id." };
  return { frame: { kind: typed.kind, correlationid: typed.correlationid, ...typeof typed.sessionid === "string" ? { sessionid: typed.sessionid } : {}, ...typed.body !== void 0 && typed.body !== null && typeof typed.body === "object" && !Array.isArray(typed.body) ? { body: typed.body } : {} } };
}
function wsbridgeadvertiseframe(session, token, correlationid) {
  const trimmed = token.trim();
  if (trimmed === "") throw new Error("The wsbridge advertisement carries the per session token; an empty token advertises nothing.");
  return { kind: "advertisement", correlationid, body: { port: session.port, token: trimmed, ...session.idlewindow !== void 0 ? { idlewindow: session.idlewindow } : {} } };
}
function wsbridgereport(session, now) {
  const sweep = wsbridgeidlesweep(session, now);
  return { id: session.id, port: session.port, connections: session.connections, extensionconnected: session.extensionconnected, expired: sweep.expired, received: session.received, sent: session.sent };
}
function wsbridgeframecounted(session, direction, now) {
  const idlewindow = session.idlewindow;
  return { ...session, received: session.received + (direction === "received" ? 1 : 0), sent: session.sent + (direction === "sent" ? 1 : 0), lastframeat: now, ...idlewindow !== void 0 ? { expiresat: now + idlewindow } : {} };
}
var nativebridgeprotocolmajor = 1;
var nativehostinstallerversion = protocolversion;
var nativehostidplaceholder = "__generated_extension_id__";
var nativemessagingdirname = "NativeMessagingHosts";
function nativesurfacecatalog() {
  return [
    { surface: "osdialog", callclass: "sensitive", description: "Opens one os dialog on the user desktop; the surface addresses the user directly, so the call class stays sensitive and the surface asks for its own consent grant." },
    { surface: "notification", callclass: "interaction", description: "Posts one os notification on the user desktop; the surface writes outside the browser, so the call class stays interaction and the surface asks for its own consent grant." }
  ];
}
function nativehostcapabilities() {
  return { protocol: nativebridgeprotocolmajor, surfaces: nativesurfacecatalog().map((entry) => entry.surface), heartbeat: true };
}
function nativehostmanifesttemplate(input) {
  const hostname = input.hostname.trim();
  if (hostname === "") throw new Error("The native host manifest names its host; an empty host name never registers.");
  if (!/^[a-z0-9][a-z0-9._-]*$/.test(hostname)) throw new Error(`The native host name ${hostname} stays a plain dns style token; a name with spaces or capitals never registers.`);
  const companionpath = input.companionpath.trim();
  if (companionpath === "") throw new Error("The native host manifest carries the companion path the user chose; an empty path never launches a host.");
  const extensionid = (input.extensionid ?? "").trim();
  const scheme = "chrome-extension:";
  const origin = extensionid === "" ? `${scheme}//${nativehostidplaceholder}/` : `${scheme}//${extensionid}/`;
  const manifest = { name: hostname, description: "The devthink companion process: an optional native host that speaks length prefixed json over stdio and never runs until the user installs it.", path: companionpath, type: "stdio", allowed_origins: [origin] };
  return { manifest, text: `${JSON.stringify(manifest, null, 2)}
` };
}
function trailslashes(value) {
  let end = value.length;
  while (end > 0) {
    const last = value.charCodeAt(end - 1);
    if (last !== 47 && last !== 92) break;
    end -= 1;
  }
  return value.slice(0, end);
}
function hostmanifestdestination(input) {
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
async function installnativehost(input) {
  if (!input.consent) return { state: nativedefaultstate(), manifestpath: "", refused: "The install consent gate explains the scope before any host registration; the installer writes no manifest without the recorded consent." };
  const extensionid = input.extensionid.trim();
  if (extensionid === "") return { state: nativedefaultstate(), manifestpath: "", refused: "The host manifest allows the origins of one extension id; an empty id never registers a host." };
  if (input.systemwide === true && (input.profiledir ?? "").trim() !== "") return { state: nativedefaultstate(), manifestpath: "", refused: "The install targets either the user profile directory or, with the explicit flag, the system directory; never both at once." };
  const destination = hostmanifestdestination({ hostname: input.hostname, ...input.profiledir !== void 0 ? { profiledir: input.profiledir } : {}, ...input.systemwide !== void 0 ? { systemwide: input.systemwide } : {}, ...input.platform !== void 0 ? { platform: input.platform } : {} });
  if (destination.refused !== void 0) return { state: nativedefaultstate(), manifestpath: "", refused: destination.refused };
  const template = nativehostmanifesttemplate({ hostname: input.hostname, companionpath: input.companionpath, extensionid });
  const dir = destination.path.slice(0, destination.path.lastIndexOf("/"));
  await input.io.mkdir(dir);
  await input.io.writefile(destination.path, template.text);
  const state = { installed: true, hostname: template.manifest.name, extensionid, installerversion: nativehostinstallerversion, port: "detached", installedat: input.now, updatedat: input.now, lasterrors: [] };
  return { state, manifestpath: destination.path };
}
async function uninstallnativehost(input) {
  const destination = hostmanifestdestination({ hostname: input.hostname, ...input.profiledir !== void 0 ? { profiledir: input.profiledir } : {}, ...input.systemwide !== void 0 ? { systemwide: input.systemwide } : {}, ...input.platform !== void 0 ? { platform: input.platform } : {} });
  if (destination.refused !== void 0) return { state: nativedefaultstate(), manifestpath: "", removed: false, refused: destination.refused };
  const present = await input.io.exists(destination.path);
  if (present) await input.io.removefile(destination.path);
  return { state: nativedefaultstate(), manifestpath: destination.path, removed: present };
}
function nativedefaultstate() {
  return { installed: false, port: "detached", lasterrors: [] };
}
function nativechoices(settings) {
  const current = settings ?? {};
  return { ...current.nativeinstallconsent !== void 0 ? { nativeinstallconsent: current.nativeinstallconsent } : {}, ...current.nativetransportconsent !== void 0 ? { nativetransportconsent: current.nativetransportconsent } : {}, ...current.nativecallclassconsents !== void 0 ? { nativecallclassconsents: current.nativecallclassconsents } : {}, ...current.nativesurfaceconsents !== void 0 ? { nativesurfaceconsents: current.nativesurfaceconsents } : {}, ...current.nativeidlewindow !== void 0 ? { nativeidlewindow: current.nativeidlewindow } : {}, ...current.nativeheartbeatinterval !== void 0 ? { nativeheartbeatinterval: current.nativeheartbeatinterval } : {}, ...current.nativecallratelimit !== void 0 ? { nativecallratelimit: current.nativecallratelimit } : {}, ...current.nativecallratewindow !== void 0 ? { nativecallratewindow: current.nativecallratewindow } : {} };
}
function nativetransportenabled(state, settings) {
  return (state?.installed ?? false) && settings?.nativetransportconsent === true;
}
function nativecorrelationid(seed, sequence) {
  const trimmed = seed.trim();
  if (trimmed === "") throw new Error("The correlation id names its sender seed; an empty seed never correlates a frame.");
  if (!Number.isInteger(sequence) || sequence < 1) throw new Error("The correlation id sequence stays a positive whole number per run.");
  return `run-${trimmed}-${sequence}`;
}
function nativeframeof(kind, correlationid, body, sessionid) {
  const trimmed = correlationid.trim();
  if (trimmed === "") throw new Error("The native frame carries its correlation id; an empty id never correlates a frame.");
  return { kind, correlationid: trimmed, ...sessionid !== void 0 && sessionid !== "" ? { sessionid } : {}, ...body !== void 0 ? { body } : {} };
}
function companionhandshakeframe(correlationid) {
  return nativeframeof("handshake", correlationid, { protocol: nativebridgeprotocolmajor });
}
function parsecompanionhandshake(frame, now) {
  if (frame.kind !== "handshake") return { error: nativeerrorof("handshake", `The handshake answer carries the handshake kind; a ${frame.kind} frame never completes a handshake.`, "reconnect", now) };
  const body = frame.body ?? {};
  const build = typeof body.build === "string" ? body.build.trim() : "";
  if (build === "") return { error: nativeerrorof("handshake", "The handshake answer carries the companion build version; an empty version never attaches.", "reconnect", now) };
  const protocol = typeof body.protocol === "number" ? body.protocol : Number.parseInt(String(body.protocol ?? ""), 10);
  if (!Number.isInteger(protocol) || protocol < 1) return { error: nativeerrorof("handshake", "The handshake answer carries its native bridge protocol version as a positive whole number.", "reconnect", now) };
  const surfaces = Array.isArray(body.surfaces) ? body.surfaces.filter((surface) => surface === "osdialog" || surface === "notification") : [];
  const wsbridgeport = typeof body.wsbridgeport === "number" ? body.wsbridgeport : 0;
  if (!Number.isInteger(wsbridgeport) || wsbridgeport < 0) return { error: nativeerrorof("handshake", "The handshake answer carries the wsbridge port as a whole number; zero keeps the bridge down.", "reconnect", now) };
  return { handshake: { build, protocol: String(protocol), surfaces, wsbridgeport } };
}
function nativemajorversion(protocol) {
  const value = typeof protocol === "number" ? String(protocol) : protocol.trim();
  const major = Number.parseInt(value.split(/[.\s]/)[0] ?? "", 10);
  return Number.isInteger(major) && major >= 1 ? major : 0;
}
function nativeprotocolcompatible(ours, theirs) {
  const ourmajor = nativemajorversion(ours);
  const theirmajor = nativemajorversion(theirs);
  return { ok: ourmajor === theirmajor && ourmajor >= 1, ours: ourmajor, theirs: theirmajor };
}
function negotiatenativecapabilities(input) {
  const ours = input.ours ?? nativehostcapabilities();
  const compat = nativeprotocolcompatible(ours.protocol, input.theirs.protocol);
  if (!compat.ok) return { ok: false, protocol: 0, surfaces: [], heartbeat: false, reason: `The companion speaks the native bridge protocol major version ${compat.theirs} while this build speaks ${compat.ours}; the upgrade path keeps compatibility for one major version and the run degrades with the transport off.` };
  const order = nativesurfacecatalog().map((entry) => entry.surface);
  const surfaces = order.filter((surface) => input.theirs.surfaces.includes(surface));
  return { ok: true, protocol: compat.ours, surfaces, heartbeat: ours.heartbeat && input.theirs.heartbeat === true };
}
function attachnativehost(state, handshake, now) {
  return { ...state, installed: true, port: "attached", companionversion: handshake.build, companionprotocol: handshake.protocol, wsbridgeport: handshake.wsbridgeport, attachedat: now, updatedat: now };
}
function crashnativehost(state, now) {
  return { ...state, port: "crashed", updatedat: now, lasterrors: [nativeerrorof("port", "The companion process crashed under the native port; the run stays alive and the extension reattaches on the next host start.", "reconnect", now), ...state.lasterrors ?? []].slice(0, 10) };
}
function reattachnativehost(state, handshake, now) {
  return { ...attachnativehost(state, handshake, now), updatedat: now };
}
function detachnativehost(state, now) {
  return { ...state, port: "detached", updatedat: now };
}
function nativeheartbeatframe(correlationid, now) {
  return nativeframeof("heartbeat", correlationid, { at: now });
}
function nativeportliveness(input) {
  if (input.interval === void 0) return { alive: true, reason: "The heartbeat interval stays unset; the liveness check never expires a host without the user configured cadence." };
  if (input.lastheartbeatat === void 0) return { alive: false, reason: "The native port heard no heartbeat yet; the host stays silent under the configured interval." };
  if (input.now - input.lastheartbeatat > input.interval) return { alive: false, reason: `The last heartbeat sits ${input.now - input.lastheartbeatat} milliseconds back, past the ${input.interval} millisecond interval; the host process stays silent and the extension reattaches on its restart.` };
  return { alive: true };
}
function nativeframecheck(frame, sessionid) {
  if (frame.correlationid.trim() === "") return { allowed: false, reason: "The native frame carries its correlation id; an anonymous frame never reaches the engine." };
  if (sessionid.trim() === "") return { allowed: false, reason: "The native transport pairs its frames with the session id; a transport without a session never accepts a frame." };
  if (frame.sessionid !== void 0 && frame.sessionid !== sessionid) return { allowed: false, reason: `The native frame session ${frame.sessionid} sits outside the paired session ${sessionid}; the origin and session checks refuse the frame.` };
  return { allowed: true };
}
var nativesecretkeys = ["apikey", "api_key", "key", "token", "secret", "password", "authorization", "credential", "privatekey"];
function nativesecretexclusion(frame) {
  const body = frame.body ?? {};
  const held = Object.keys(body).filter((key) => nativesecretkeys.includes(key.toLowerCase().replaceAll(" ", "").replaceAll("-", "")));
  return { ok: held.length === 0, held };
}
function redactnativeframe(frame) {
  const body = frame.body ?? {};
  const redacted = {};
  for (const [key, value] of Object.entries(body)) if (!nativesecretkeys.includes(key.toLowerCase().replaceAll(" ", "").replaceAll("-", ""))) redacted[key] = value;
  return { ...frame, body: redacted };
}
function nativeerrorof(family, message, retry, now) {
  return { family, message, retry, at: now };
}
function nativefailureof(error) {
  const retryhint = error.retry === "reconnect" ? "retry" : error.retry === "reinstall" ? "wait" : "none";
  return { retryhint, reason: `${error.family} failure: ${error.message}` };
}
function nativedegradationof(input) {
  if ((input.state?.installed ?? false) === false) return { degraded: true, reason: "The native host stays absent: nothing installed, the transport disabled and the run alive with every step inside the browser." };
  if (input.negotiated !== void 0 && !input.negotiated.ok) return { degraded: true, reason: input.negotiated.reason ?? "The native host speaks another native bridge protocol major version; the run stays alive with the transport off." };
  if (input.state?.port === "crashed") return { degraded: true, reason: "The native host crashed under the port; the run stays alive and waits for the reattach on the host restart." };
  return { degraded: false, reason: "The native host sits attached with a negotiated capability set; the transport carries the consented call classes." };
}
function nativeratecheck(input) {
  if (input.cap === void 0) return { allowed: true, used: input.calls.length };
  if (!Number.isFinite(input.cap) || input.cap < 1) return { allowed: false, used: input.calls.length, cap: input.cap, reason: `The native transport rate cap of ${String(input.cap)} stays a finite positive count.` };
  const window = input.window ?? Number.POSITIVE_INFINITY;
  const used = input.calls.filter((record) => window === Number.POSITIVE_INFINITY || input.now - record.at <= window).length;
  if (used >= input.cap) return { allowed: false, used, cap: input.cap, reason: `The native transport hit its ${input.cap} call cap with ${used} calls inside the window; the cap stays the user's choice and the session waits.` };
  return { allowed: true, used, cap: input.cap };
}
function nativecallrecordof(input) {
  return { id: input.id, correlationid: input.correlationid, surface: input.surface, callclass: input.callclass, outcome: input.outcome, ...input.reason !== void 0 && input.reason !== "" ? { reason: input.reason } : {}, at: input.now };
}
function recordnativecall(records, record) {
  return [record, ...records.filter((candidate) => candidate.id !== record.id)];
}
function nativecallevent(record) {
  return notificationframe("native/call", { surface: record.surface, callclass: record.callclass, outcome: record.outcome, correlationid: record.correlationid, at: record.at });
}
function nativesurfacegrant(surface, settings) {
  const known = nativesurfacecatalog().find((entry) => entry.surface === surface);
  if (known === void 0) return { allowed: false, reason: `The native surface ${surface} sits outside the surface catalog; an unknown surface never grants.` };
  if ((settings?.nativesurfaceconsents ?? []).includes(known.surface)) return { allowed: true, reason: `The user granted the ${known.surface} surface its own consent stamp; the surface runs behind the class gate too.` };
  return { allowed: false, reason: `The native surface ${known.surface} holds no consent grant; a desktop surface never opens from a class grant alone.` };
}
function nativeclassgrant(callclass, settings) {
  if ((settings?.nativecallclassconsents ?? []).includes(callclass)) return { allowed: true, reason: `The user consented to the ${callclass} call class over the native transport.` };
  return { allowed: false, reason: `The ${callclass} call class holds no consent grant over the native transport; the gate asks per class and never widens a read grant.` };
}
function nativesurfaceresult(input) {
  const catalog = nativesurfacecatalog().find((entry) => entry.surface === input.surface);
  const callclass = catalog?.callclass ?? input.callclass;
  const held = Object.keys(input.details).filter((key) => nativesecretkeys.includes(key.toLowerCase().replaceAll(" ", "").replaceAll("-", "")));
  const details = { ...input.details };
  for (const key of held) delete details[key];
  return { surface: input.surface, callclass, details, at: input.now };
}
function nativediagnostics(input) {
  const state = input.state ?? nativedefaultstate();
  const settings = input.settings;
  const sessions = (input.sessions ?? []).map((session) => ({ port: session.port, connections: session.connections, expired: session.expiresat !== void 0 && session.expiresat <= input.now }));
  return {
    installed: state.installed,
    port: state.port,
    ...state.hostname !== void 0 ? { hostname: state.hostname } : {},
    ...state.extensionid !== void 0 ? { extensionid: state.extensionid } : {},
    ...state.installerversion !== void 0 ? { installerversion: state.installerversion } : {},
    ...state.companionversion !== void 0 ? { companionversion: state.companionversion } : {},
    ...state.companionprotocol !== void 0 ? { companionprotocol: state.companionprotocol } : {},
    ...state.wsbridgeport !== void 0 ? { wsbridgeport: state.wsbridgeport } : {},
    nativebridgeprotocol: nativebridgeprotocolmajor,
    degraded: nativedegradationof({ state, ...input.negotiated !== void 0 ? { negotiated: input.negotiated } : {} }),
    transportconsent: settings?.nativetransportconsent === true,
    classconsents: settings?.nativecallclassconsents ?? [],
    surfaceconsents: settings?.nativesurfaceconsents ?? [],
    sessions,
    lasterrors: state.lasterrors ?? []
  };
}
export {
  attachnativehost,
  bridgeframerate,
  bridgepayload,
  bridgestatuslabel,
  bridgestatusview,
  carddecision,
  chateventof,
  chateventpayload,
  chatrowsof,
  companionhandshakeframe,
  composeenvelope,
  connectrelay,
  contractcapabilities,
  crashnativehost,
  decisionpayload,
  detachnativehost,
  disconnectrelay,
  enqueuebridge,
  envelopeacceptance,
  eventpostbody,
  eventstreambody,
  frameauth,
  frameof,
  heartbeatevent,
  heartbeattick,
  hostmanifestdestination,
  idleexpired,
  installnativehost,
  minimalplandigest,
  nativebridgeprotocolmajor,
  nativecallevent,
  nativecallrecordof,
  nativechoices,
  nativeclassgrant,
  nativecorrelationid,
  nativedefaultstate,
  nativedegradationof,
  nativediagnostics,
  nativeerrorof,
  nativefailureof,
  nativeframecheck,
  nativeframeof,
  nativeheartbeatframe,
  nativehostcapabilities,
  nativehostidplaceholder,
  nativehostinstallerversion,
  nativehostmanifesttemplate,
  nativemajorversion,
  nativemessagingdirname,
  nativeportliveness,
  nativeprotocolcompatible,
  nativeratecheck,
  nativesecretexclusion,
  nativesecretkeys,
  nativesurfacecatalog,
  nativesurfacegrant,
  nativesurfaceresult,
  nativetransportenabled,
  negotiatecapabilities,
  negotiatenativecapabilities,
  newrelayclient,
  pagecontentkeys,
  pairingpanel,
  parsecompanionhandshake,
  parseenvelope,
  parsewireframe,
  planproposaleventof,
  planproposaleventpayload,
  planrevieweventpayload,
  postevent,
  progresseventpayload,
  reattachnativehost,
  receiveframe,
  recordnativecall,
  redactnativeframe,
  relayorigin,
  replaybridgequeue,
  reviewcardsof,
  reviewgateoutcome,
  sendframe,
  servercontractversion,
  servereventtypes,
  serveroperations,
  sessioncreatebody,
  sessionjoinbody,
  sitemanifest,
  sitemanifestof,
  stableopid,
  uninstallnativehost,
  verifyframeauth,
  widgetview,
  wsbridgeadvertiseframe,
  wsbridgebindcheck,
  wsbridgeconnection,
  wsbridgeenvelopeof,
  wsbridgeextensionconnect,
  wsbridgeframeauth,
  wsbridgeframecounted,
  wsbridgeframeof,
  wsbridgeidlesweep,
  wsbridgelocalhosts,
  wsbridgereport,
  wsbridgesessionstart,
  wsbridgestreamname
};
//# sourceMappingURL=bridge.js.map
