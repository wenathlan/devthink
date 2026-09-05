/*! devthink 2.0.0 — consent-first browser agent library — GPL-3.0-only — https://github.com/wenathlan/extension */

// debug.ts
function expireprofilerecords(input) {
  const retention = input.retention;
  if (retention === void 0) return { heaps: input.heaps, profiles: input.profiles, traces: input.traces };
  const expired = (at) => input.now - at > retention;
  return {
    heaps: input.heaps.map((heap) => expired(heap.capturedat) && heap.bytesexpired !== true ? { ...heap, bytesexpired: true } : heap),
    profiles: input.profiles.map((profile) => expired(profile.at) && profile.samplesexpired !== true ? { ...profile, samplesexpired: true } : profile),
    traces: input.traces.map((trace) => expired(trace.endedat) && trace.bytesexpired !== true ? { ...trace, bytesexpired: true } : trace)
  };
}

// environments.ts
function expirelayers(state, retention, now) {
  if (retention === void 0) return state;
  const layers = state.layers.map((layer) => {
    if (layer.revertedat === void 0 || layer.prior === void 0 || layer.priorexpired === true) return layer;
    if (now - layer.revertedat <= retention) return layer;
    const { prior, ...metadata } = layer;
    void prior;
    return { ...metadata, priorexpired: true };
  });
  return { ...state, layers, updatedat: now };
}

// session.ts
function searchsessionrecords(query, records) {
  const matches = [];
  for (const record of records) {
    if (query.from !== void 0 && record.createdat < query.from) continue;
    if (query.to !== void 0 && record.createdat > query.to) continue;
    const haystacks = [
      { field: "urls", text: record.tabs.map((tab) => tab.url).join(" ") },
      { field: "titles", text: record.tabs.map((tab) => tab.title).join(" ") },
      { field: "names", text: [record.name, record.folder ?? "", ...record.tags].join(" ") },
      { field: "text", text: record.tabs.flatMap((tab) => tab.forms.map((form) => form.value)).join(" ") }
    ];
    for (const haystack of haystacks) {
      if (!query.fields.includes(haystack.field)) continue;
      const lower = haystack.text.toLowerCase();
      for (const term of query.terms) {
        const at = lower.indexOf(term.toLowerCase());
        if (at < 0) continue;
        const start = Math.max(0, at - 30);
        matches.push({ sessionid: record.id, field: haystack.field, term, at: record.createdat, excerpt: haystack.text.slice(start, start + 80).trim() });
      }
    }
  }
  return matches;
}
function expiresessions(records, retention, now) {
  if (retention === void 0 || !Number.isFinite(retention)) return records;
  return records.map((record) => {
    if (record.sectionsexpired || now - record.createdat < retention) return record;
    return { id: record.id, name: record.name, createdat: record.createdat, tabs: [], captures: record.captures, storage: [], cookies: [], ...record.folder !== void 0 ? { folder: record.folder } : {}, tags: record.tags, ...record.auto === true ? { auto: true } : {}, ...record.restoredat !== void 0 ? { restoredat: record.restoredat } : {}, sectionsexpired: true };
  });
}
function filteredsessions(records, filter) {
  return records.filter((record) => {
    if (filter.name !== void 0 && !record.name.toLowerCase().includes(filter.name.toLowerCase())) return false;
    if (filter.folder !== void 0 && record.folder !== filter.folder) return false;
    if (filter.from !== void 0 && record.createdat < filter.from) return false;
    if (filter.to !== void 0 && record.createdat > filter.to) return false;
    return true;
  });
}

// security.ts
async function sha256(payload) {
  const bytes = new TextEncoder().encode(payload);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
function entrybody(entry) {
  return JSON.stringify({ id: entry.id, runid: entry.runid, kind: entry.kind, summary: entry.summary, origin: entry.origin, ...entry.stepid !== void 0 ? { stepid: entry.stepid } : {}, at: entry.at });
}
async function entryhashof(input) {
  return { previous: input.previous, current: await sha256(`${input.previous}
${entrybody(input.entry)}`), algorithm: "sha-256" };
}
async function verifylogchain(entries) {
  let previous = "0".repeat(64);
  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index];
    if (entry === void 0) continue;
    if (entry.hash.previous !== previous) return { valid: false, brokenat: index, reason: `The chain link of entry ${index} carries the previous hash ${entry.hash.previous} while its predecessor hashes to ${previous}; the chain reports tamper evidence.` };
    const expected = await entryhashof({ previous, entry: { id: entry.id, runid: entry.runid, kind: entry.kind, summary: entry.summary, origin: entry.origin, ...entry.stepid !== void 0 ? { stepid: entry.stepid } : {}, at: entry.at } });
    if (entry.hash.current !== expected.current) return { valid: false, brokenat: index, reason: `The entry hash of entry ${index} matches neither its body nor its predecessor hash; the chain reports tamper evidence.` };
    previous = entry.hash.current;
  }
  return { valid: true, reason: `The hash chain of ${entries.length} entr${entries.length === 1 ? "y" : "ies"} verifies from the genesis hash to the last entry.` };
}
async function readverifiedlog(log) {
  const verification = await verifylogchain(log.entries);
  if (!verification.valid) return { ok: false, entries: [], reason: verification.reason };
  return { ok: true, entries: [...log.entries], reason: verification.reason };
}
async function exportlogchain(log) {
  const read = await readverifiedlog(log);
  if (!read.ok) return { runid: log.runid, entries: 0, chainvalid: false, reason: read.reason, log: [] };
  return { runid: log.runid, entries: read.entries.length, chainvalid: true, reason: read.reason, ...log.seal !== void 0 ? { sealhash: log.seal.sealhash.current, sealedat: log.seal.sealedat } : {}, log: read.entries };
}

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

// run.ts
async function sealrunstate(state) {
  const payload = JSON.stringify(state);
  const digest = await sha2562(payload);
  return { payload, algorithm: "sha-256", digest, sealedat: state.updatedat };
}
async function openseal(sealed) {
  const digest = await sha2562(sealed.payload);
  if (digest !== sealed.digest) throw new Error("The sealed run state fails its integrity digest; a tampered run state never reaches the recovery.");
  const parsed = JSON.parse(sealed.payload);
  if (parsed === null || typeof parsed !== "object" || typeof parsed.runid !== "string" || typeof parsed.sessionid !== "string") throw new Error("The sealed run state carries no run record.");
  return parsed;
}
async function sha2562(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
function exportrunstate(states, now) {
  return {
    runs: states.length,
    urls: states.reduce((total, state) => total + state.urlhistory.length, 0),
    environments: states.reduce((total, state) => total + Object.keys(state.environments).length, 0),
    offloaded: states.reduce((total, state) => total + Object.values(state.turnarounds).length, 0),
    beats: states.reduce((total, state) => total + state.keepalive.beats, 0),
    exportedat: now
  };
}

// policy.ts
var sensitiveactions = /* @__PURE__ */ new Set(["click", "type", "navigate", "select", "presskey", "drag", "drop", "upload", "clear", "check", "uncheck", "toggle", "submit", "reload", "back", "forward", "writestorage", "setattribute", "removeattribute", "evaluate", "tabcreate", "tabactivate", "tabclose", "tabreload", "windowcreate", "windowclose", "windowresize", "downloadfile", "clickpoint", "shiftclick", "dismissdialog", "enterframe", "typetime", "appendtext", "setvalue", "typeedit", "keyhold", "keyrelease", "submitsearch", "selectmulti", "chooseradio", "setslider", "setdate", "setcolor", "openlink", "openprivate", "reloadcache", "stopnav", "followlink", "spanav", "rewritequery", "setfragment", "navlist", "navprofile", "handleauth", "printpdf", "prefetch", "preconnect", "deeplink", "reopentab", "pausenav", "navrate", "openclipboard", "batchopen", "duplicatetab", "closepattern", "pintab", "mutetab", "movetab", "movetabwindow", "grouptabs", "colorgroup", "collapsegroup", "discardtab", "reloadtabs", "zoomin", "zoomout", "switchtab", "maximizewindow", "minimizewindow", "restorewindow", "focuswindow", "scratchwindow", "incognitowindow", "restoretab", "restorelayout", "reopenrun", "badgetab", "fillform", "filllabel", "fillplaceholder", "submitform", "retryform", "runwizard", "selectchain", "picktypeahead", "pickdate", "attachfile", "fillcard", "fillcode", "consentpassword", "exportcsv", "exportjson", "exportexcel", "copytable", "pushsheets", "streamdisk", "paginateextract", "resumeextract", "batchdownload", "pausedownload", "resumedownload", "interceptmime", "readclipboard", "writeclipboard", "copyscreen", "quarantinedownload", "scanvirus", "cleanupartifacts", "recordscreen", "captureaudio", "downloadimages", "callrest", "callgraphql", "sendmessage", "blockrequest", "mockresponse", "rewriteheaders", "setcookies", "clearcookies", "authflow", "saveapikey", "routeproxy", "postform", "postfiles", "attachcdp", "detachcdp", "cdpcmd", "overridescript", "heapshot", "profilecpu", "capturesourcemaps", "emulatedevice", "emulatenetwork", "emulatelocate", "setuseragent", "overridepermission", "restoresession", "exportsessions", "importsessions", "runworkflow", "visitrule", "urlrule", "menurule", "keyrule", "buttonrule", "cronrule", "intervalrule", "urllistrule", "webhookrule", "eventrule"]);
var interactionactions = /* @__PURE__ */ new Set(["focus", "scroll", "hover", "clickdeep", "rightclick", "doubleclick", "scrollpage", "scrollby", "scrollend", "scrolltop", "fullscreen", "zoomset", "movepointer", "clicktext", "clickaria", "clickname", "expanddetails", "pierceshadow", "retryaction", "capturebodies", "setbreakpoint", "stepcode", "watchexpr", "loop", "repeatuntil", "whileloop", "foreach", "parallel", "trycatch"]);
var readactions = /* @__PURE__ */ new Set(["observe", "inspect", "extract", "wait", "waitfor", "waittext", "readattribute", "readstyle", "readgeometry", "readvalue", "readtext", "readhtml", "countelements", "readtable", "readlinks", "readimages", "readmeta", "readforms", "readstorage", "highlight", "tablist", "windowlist", "tabsnapshot", "mapclicks", "verifyvisible", "verifyenabled", "resolvexpath", "a11ytree", "readvisible", "readertree", "detectlists", "detecttables", "readjson", "watchmutate", "waitquiet", "watchbanner", "detectinfinitescroll", "detectvirtual", "detectlazy", "readscrollpos", "readlang", "readoutline", "countpages", "listshadow", "listframes", "classifypage", "fingerprintsection", "diffsnapshots", "readselection", "watchfocus", "detectsticky", "detectscrolllock", "readopengraph", "detectlanguage", "deriveselector", "waitload", "waiturl", "spawait", "detecthttp", "readredirects", "readfinalurl", "trailaudit", "navintent", "checksafe", "querytabs", "watchtab", "findclones", "searchtabs", "listaudio", "snapshotsession", "savelayout", "attachmeta", "detectfields", "generatevalues", "saveprofiles", "asksubmit", "readerrors", "skiphoneypot", "detectlogin", "detecttemplate", "handoffcaptcha", "scrapetable", "importcsv", "looprows", "transformvalues", "deduperows", "mergepages", "stamplerows", "previewgrid", "logprovenance", "verifydownload", "exportnetlog", "namecaptures", "shotview", "shotfullpage", "shotelement", "shotregion", "contactsheet", "capturepdf", "captureframe", "readmedia", "readassets", "probestream", "timelapse", "shotcanvas", "convertimage", "makethumbs", "fetchurl", "parsejson", "parsehtml", "opensocket", "waitmessage", "watchrequests", "readheaders", "mapapi", "subscribesse", "longpoll", "extractapi", "readcookies", "watchconsole", "watcherrors", "watchtasks", "watchcdp", "measureflow", "trackmemory", "watchshifts", "traceload", "annotatetrace", "replaytrace", "blackboxscripts", "persiststate", "capturesession", "namedsessions", "diffsessions", "searchsessions", "composeworkflow", "savetemplate", "dryrun", "delay", "waitelement", "compute", "extractvars", "listruns", "condition", "branch"]);
var allowedactions = /* @__PURE__ */ new Set([...sensitiveactions, ...interactionactions, ...readactions]);

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

// agent.ts
function swarmoverview(input) {
  const claimed = input.queue.items.filter((item) => item.state === "claimed").length;
  return {
    agents: input.agents.length,
    active: input.agents.filter((agent) => agent.state === "active").length,
    paused: input.agents.filter((agent) => agent.state === "paused").length,
    stopped: input.agents.filter((agent) => agent.state === "stopped").length,
    tasks: input.queue.items.length,
    queued: input.queue.items.filter((item) => item.state === "queued").length,
    claimed,
    done: input.queue.items.filter((item) => item.state === "done").length,
    cancelled: input.queue.items.filter((item) => item.state === "cancelled").length,
    messages: input.mailboxes.reduce((total, mailbox) => total + mailbox.inbox.length, 0),
    unread: input.mailboxes.reduce((total, mailbox) => total + mailbox.unread, 0)
  };
}

// memory.ts
var sessionmemory = class {
  constructor(adapter) {
    this.adapter = adapter;
  }
  adapter;
  async getconfig() {
    return this.adapter.get("config");
  }
  async setconfig(value) {
    return this.adapter.set("config", value);
  }
  async getsession() {
    return this.adapter.get("session");
  }
  async setsession(value) {
    return this.adapter.set("session", value);
  }
  async getplan() {
    return this.adapter.get("plan");
  }
  async setplan(value) {
    return this.adapter.set("plan", value);
  }
  async getdiagnostic() {
    return this.adapter.get("diagnostic");
  }
  async setdiagnostic(value) {
    return this.adapter.set("diagnostic", value);
  }
  async getprogress() {
    return this.adapter.get("progress");
  }
  async setprogress(value) {
    return this.adapter.set("progress", value);
  }
  async getcapabilities() {
    return this.adapter.get("capabilities");
  }
  async setcapabilities(value) {
    return this.adapter.set("capabilities", value);
  }
  async getsettings() {
    return this.adapter.get("settings");
  }
  async setsettings(value) {
    return this.adapter.set("settings", value);
  }
  async getaudit() {
    return await this.adapter.get("audit") ?? [];
  }
  async getoutcomes() {
    return await this.adapter.get("outcomes") ?? [];
  }
  /** Records one audit event; retention is a user setting and an absent setting keeps every event. */
  async addaudi(event) {
    const records = await this.getaudit();
    const combined = [event, ...records];
    const retention = (await this.getsettings())?.auditretention;
    await this.adapter.set("audit", retention === void 0 ? combined : combined.slice(0, retention));
  }
  /** Records one step outcome; retention is a user setting and an absent setting keeps every outcome. */
  async addoutcome(outcome) {
    const records = await this.getoutcomes();
    const combined = [outcome, ...records];
    const retention = (await this.getsettings())?.outcomeretention;
    await this.adapter.set("outcomes", retention === void 0 ? combined : combined.slice(0, retention));
  }
  /** Stores one clickable map under its observation version so every captured map stays available. */
  async setmap(map) {
    return this.adapter.set(`map${map.version}`, map);
  }
  /** Returns one stored clickable map by its observation version. */
  async getmap(version) {
    return this.adapter.get(`map${version}`);
  }
  /** Advances and persists the observation version counter used to stamp clickable maps. */
  async nextobservationversion() {
    const current = await this.adapter.get("observationversion") ?? 0;
    const next = current + 1;
    await this.adapter.set("observationversion", next);
    return next;
  }
  /** Returns the latest observation version used to stamp a clickable map. */
  async getobservationversion() {
    return this.adapter.get("observationversion");
  }
  /** Returns the key hold registry, persisted so holds survive service worker restarts. */
  async getholds() {
    return await this.adapter.get("holds") ?? [];
  }
  /** Replaces the key hold registry after one press or release transition. */
  async setholds(holds) {
    return this.adapter.set("holds", holds);
  }
  /** Returns every dialog decision recorded for the audit trail. */
  async getdialogs() {
    return await this.adapter.get("dialogs") ?? [];
  }
  /** Records one dialog decision with the reviewed answer and the observed dialog text. */
  async adddialog(decision) {
    const records = await this.getdialogs();
    await this.adapter.set("dialogs", [decision, ...records]);
  }
  /** Returns every retry outcome recorded with attempts and movement deltas. */
  async getretries() {
    return await this.adapter.get("retries") ?? [];
  }
  /** Records one retry outcome with the attempts made and the movement delta observed. */
  async addretry(outcome) {
    const records = await this.getretries();
    await this.adapter.set("retries", [outcome, ...records]);
  }
  /** Returns every resolution summary stored per target mode. */
  async getresolutions() {
    return await this.adapter.get("resolutions") ?? [];
  }
  /** Records one resolution summary for later selector derivation. */
  async addresolution(summary) {
    const records = await this.getresolutions();
    await this.adapter.set("resolutions", [summary, ...records]);
  }
  /** Returns the reviewed default dialog policy kept for the session auto handler. */
  async getdialogpolicy() {
    return this.adapter.get("dialogpolicy");
  }
  /** Stores the reviewed default dialog policy of the latest approved plan. */
  async setdialogpolicy(policy) {
    return this.adapter.set("dialogpolicy", policy);
  }
  /** Stores one observation capture under its version so every observation version stays available. */
  async setobservation(record) {
    return this.adapter.set(`observation${record.version}`, record);
  }
  /** Returns one stored observation version. */
  async getobservation(version) {
    return this.adapter.get(`observation${version}`);
  }
  /** Returns the observation retention window; an absent setting keeps every capture. */
  async observationretention() {
    return (await this.getsettings())?.observationretention;
  }
  /** Stores one accessibility tree capture; retention is a user setting and an absent setting keeps every tree. */
  async adda11ytree(capture) {
    const records = await this.geta11ytrees();
    const combined = [capture, ...records];
    const retention = await this.observationretention();
    await this.adapter.set("a11ytrees", retention === void 0 ? combined : combined.slice(0, retention));
  }
  /** Returns every stored accessibility tree capture, newest first. */
  async geta11ytrees() {
    return await this.adapter.get("a11ytrees") ?? [];
  }
  /** Stores one reader article capture; retention is a user setting and an absent setting keeps every article. */
  async addreaderarticle(capture) {
    const records = await this.getreaderarticles();
    const combined = [capture, ...records];
    const retention = await this.observationretention();
    await this.adapter.set("readerarticles", retention === void 0 ? combined : combined.slice(0, retention));
  }
  /** Returns every stored reader article capture, newest first. */
  async getreaderarticles() {
    return await this.adapter.get("readerarticles") ?? [];
  }
  /** Records one dom mutation observed inside a reviewed watch. */
  async addmutationevent(event) {
    const records = await this.getmutationevents();
    await this.adapter.set("mutationevents", [event, ...records]);
  }
  /** Returns the mutation event stream of every reviewed watch. */
  async getmutationevents() {
    return await this.adapter.get("mutationevents") ?? [];
  }
  /** Records one focus change observed inside a reviewed watch. */
  async addfocusevent(event) {
    const records = await this.getfocusevents();
    await this.adapter.set("focusevents", [event, ...records]);
  }
  /** Returns the focus event stream of every reviewed watch. */
  async getfocusevents() {
    return await this.adapter.get("focusevents") ?? [];
  }
  /** Records one consent banner observed by a reviewed banner watch. */
  async addbanner(event) {
    const records = await this.getbanners();
    await this.adapter.set("banners", [event, ...records]);
  }
  /** Returns every consent banner report observed so far. */
  async getbanners() {
    return await this.adapter.get("banners") ?? [];
  }
  /** Records one snapshot diff between two observation versions. */
  async adddiff(diff) {
    const records = await this.getdiffs();
    await this.adapter.set("diffs", [diff, ...records]);
  }
  /** Returns every stored snapshot diff, newest first. */
  async getdiffs() {
    return await this.adapter.get("diffs") ?? [];
  }
  /** Records one derived selector with its stability score for reuse. */
  async addselector(selector) {
    const records = await this.getselectors();
    await this.adapter.set("selectors", [selector, ...records]);
  }
  /** Returns every stored derived selector with its stability score, newest first. */
  async getselectors() {
    return await this.adapter.get("selectors") ?? [];
  }
  /** Records one detected template class or section fingerprint for its origin. */
  async addtemplate(profile) {
    const records = await this.gettemplates();
    await this.adapter.set("templates", [profile, ...records]);
  }
  /** Returns every stored template class and section fingerprint, newest first. */
  async gettemplates() {
    return await this.adapter.get("templates") ?? [];
  }
  /** Records one watch registration so it survives service worker restarts. */
  async addwatch(watch) {
    const records = await this.getwatches();
    await this.adapter.set("watches", [watch, ...records]);
  }
  /** Returns every watch registration, newest first, including closed windows. */
  async getwatches() {
    return await this.adapter.get("watches") ?? [];
  }
  /** Closes one watch registration by watch id once its reviewed lifetime window ends. */
  async closewatch(watchid, closedat) {
    const records = await this.getwatches();
    await this.adapter.set("watches", records.map((watch) => watch.watchid === watchid && watch.closedat === void 0 ? { ...watch, closedat } : watch));
  }
  /** Returns the live page signals of language, template, scroll lock and banner state. */
  async getsignals() {
    return this.adapter.get("signals");
  }
  /** Replaces the live page signals after an observation step refreshes them. */
  async setsignals(signals) {
    return this.adapter.set("signals", signals);
  }
  /** Appends one navigation trail entry of a session with its url, title, step ref and timestamp. */
  async addtrailentry(sessionid, entry) {
    const records = await this.gettrail(sessionid);
    await this.adapter.set(`trail${sessionid}`, [...records, entry]);
  }
  /** Returns the navigation trail of a session, oldest first. */
  async gettrail(sessionid) {
    return await this.adapter.get(`trail${sessionid}`) ?? [];
  }
  /** Stores one wait profile for an origin with user configured values, replacing the previous profile of that origin. */
  async setwaitprofile(record) {
    const records = (await this.getwaitprofiles()).filter((item) => item.origin !== record.origin);
    await this.adapter.set("waitprofiles", [...records, record]);
  }
  /** Returns every stored wait profile with its origin and user configured values, newest first. */
  async getwaitprofiles() {
    return await this.adapter.get("waitprofiles") ?? [];
  }
  /** Records one navigation step with its redirect chain and final url. */
  async addnavrecord(record) {
    const records = await this.getnavrecords();
    await this.adapter.set("navrecords", [record, ...records]);
  }
  /** Returns every stored navigation record with redirect chains and final urls, newest first. */
  async getnavrecords() {
    return await this.adapter.get("navrecords") ?? [];
  }
  /** Records one navigation intent detected from a plan for audit review. */
  async addnavintent(record) {
    const records = await this.getnavintents();
    await this.adapter.set("navintents", [record, ...records]);
  }
  /** Returns every stored navigation intent record, newest first. */
  async getnavintents() {
    return await this.adapter.get("navintents") ?? [];
  }
  /** Replaces the rate limit window state of one domain. */
  async setratestate(state) {
    const records = (await this.getratestates()).filter((item) => item.domain !== state.domain);
    await this.adapter.set("ratestates", [...records, state]);
  }
  /** Returns every rate limit window state per domain. */
  async getratestates() {
    return await this.adapter.get("ratestates") ?? [];
  }
  /** Records one curated link list with its review state before batch opening. */
  async addcurated(list) {
    const records = await this.getcurateds();
    await this.adapter.set("curated", [list, ...records]);
  }
  /** Returns every stored curated link list, newest first. */
  async getcurateds() {
    return await this.adapter.get("curated") ?? [];
  }
  /** Stores reviewed basic auth credentials for one origin, replacing the previous record of that origin. */
  async setauth(record) {
    const records = (await this.getauths()).filter((item) => item.origin !== record.origin);
    await this.adapter.set("auths", [...records, record]);
  }
  /** Returns every stored reviewed basic auth record per origin. */
  async getauths() {
    return await this.adapter.get("auths") ?? [];
  }
  /** Records one task artifact routed into the artifact store. */
  async addartifact(record) {
    const records = await this.getartifacts();
    await this.adapter.set("artifacts", [record, ...records]);
  }
  /** Returns every stored task artifact, newest first. */
  async getartifacts() {
    return await this.adapter.get("artifacts") ?? [];
  }
  /** Returns the navigation control state of paused navigation. */
  async getnavcontrol() {
    return this.adapter.get("navcontrol");
  }
  /** Replaces the navigation control state after a pause or resume transition. */
  async setnavcontrol(control) {
    return this.adapter.set("navcontrol", control);
  }
  /** Records one url safety verdict produced by a checksafe verification. */
  async addsafety(verdict) {
    const records = await this.getsafeties();
    await this.adapter.set("safeties", [verdict, ...records]);
  }
  /** Returns every stored url safety verdict, newest first. */
  async getsafeties() {
    return await this.adapter.get("safeties") ?? [];
  }
  /** Records one recently closed tab so a reopentab step can restore it. */
  async addrecenttab(tab) {
    const records = await this.getrecenttabs();
    await this.adapter.set("recenttabs", [tab, ...records]);
  }
  /** Returns every recently closed tab, newest first. */
  async getrecenttabs() {
    return await this.adapter.get("recenttabs") ?? [];
  }
  /** Returns the queued prefetch and batch open target counts shown in the popup badge. */
  async getnavqueues() {
    return this.adapter.get("navqueues");
  }
  /** Replaces the queued prefetch and batch open target counts. */
  async setnavqueues(queues) {
    return this.adapter.set("navqueues", queues);
  }
  /** Returns the last known navigation state of a tab, kept across service worker restarts. */
  async getnavstate(tabid) {
    return this.adapter.get(`navstate${tabid}`);
  }
  /** Replaces the last known navigation state of a tab. */
  async setnavstate(tabid, state) {
    return this.adapter.set(`navstate${tabid}`, state);
  }
  /** Stores one named tab layout with its window bounds and group states, replacing the previous layout of that name. */
  async setlayout(layout) {
    const records = (await this.getlayouts()).filter((item) => item.name !== layout.name);
    await this.adapter.set("layouts", [layout, ...records]);
  }
  /** Returns one saved tab layout by name with its timestamp. */
  async getlayout(name) {
    return (await this.getlayouts()).find((item) => item.name === name);
  }
  /** Returns every saved tab layout with its window bounds and group states. */
  async getlayouts() {
    return await this.adapter.get("layouts") ?? [];
  }
  /** Stores one tab group definition with its color choice and member tabs, replacing the previous definition of that name. */
  async settabgroup(group) {
    const records = (await this.gettabgroups()).filter((item) => item.name !== group.name);
    await this.adapter.set("tabgroups", [...records, group]);
  }
  /** Returns every stored tab group definition with its color choice, newest first. */
  async gettabgroups() {
    return await this.adapter.get("tabgroups") ?? [];
  }
  /** Records one tabmeta record with task provenance, replacing the previous metadata of that tab. */
  async settabmeta(meta) {
    const records = (await this.gettabmetas()).filter((item) => item.tabid !== meta.tabid);
    await this.adapter.set("tabmetas", [...records, meta]);
  }
  /** Returns every stored tabmeta record with task provenance. */
  async gettabmetas() {
    return await this.adapter.get("tabmetas") ?? [];
  }
  /** Records one session snapshot of tabs and windows for later restore. */
  async addsnapshot(snapshot) {
    const records = await this.getsnapshots();
    await this.adapter.set("snapshots", [snapshot, ...records]);
  }
  /** Returns every stored session snapshot, newest first. */
  async getsnapshots() {
    return await this.adapter.get("snapshots") ?? [];
  }
  /** Records one closed tab in the history kept for restoretab and reopenrun. */
  async addclosedtab(tab) {
    const records = await this.getclosedtabs();
    await this.adapter.set("closedtabs", [tab, ...records]);
  }
  /** Returns the closed tab history, newest first. */
  async getclosedtabs() {
    return await this.adapter.get("closedtabs") ?? [];
  }
  /** Stores one badge state per task, replacing the previous badge of that task. */
  async setbadge(badge) {
    const records = (await this.getbadges()).filter((item) => item.taskid !== badge.taskid);
    await this.adapter.set("badges", [...records, badge]);
  }
  /** Returns every stored badge state per task. */
  async getbadges() {
    return await this.adapter.get("badges") ?? [];
  }
  /** Records one tab event observed inside a reviewed watchtab registration. */
  async addtabwatchevent(event) {
    const records = await this.gettabwatchevents();
    await this.adapter.set("tabwatchevents", [event, ...records]);
  }
  /** Returns the tab event stream of every reviewed watchtab registration, newest first. */
  async gettabwatchevents() {
    return await this.adapter.get("tabwatchevents") ?? [];
  }
  /** Returns the ids of the scratch windows opened for split work. */
  async getscratchwindows() {
    return await this.adapter.get("scratchwindows") ?? [];
  }
  /** Replaces the scratch window id list after one scratch window opens or closes. */
  async setscratchwindows(ids) {
    return this.adapter.set("scratchwindows", ids);
  }
  /** Returns the pinned control tab state with the live task feed. */
  async getcontroltab() {
    return this.adapter.get("controltab");
  }
  /** Replaces the pinned control tab state. */
  async setcontroltab(state) {
    return this.adapter.set("controltab", state);
  }
  /** Stores one saved form profile under its reviewed name, replacing the previous profile of that name. */
  async setprofile(profile) {
    const records = (await this.getprofiles()).filter((item) => item.name !== profile.name);
    await this.adapter.set("formprofiles", [profile, ...records]);
  }
  /** Returns one saved form profile by its reviewed name. */
  async getprofile(name) {
    return (await this.getprofiles()).find((item) => item.name === name);
  }
  /** Returns every saved form profile with its origin grants, newest first. */
  async getprofiles() {
    return await this.adapter.get("formprofiles") ?? [];
  }
  /** Removes one saved form profile by its reviewed name. */
  async removeprofile(name) {
    const records = (await this.getprofiles()).filter((item) => item.name !== name);
    await this.adapter.set("formprofiles", records);
  }
  /** Records one wizard state with its step history. */
  async addwizard(state) {
    const records = await this.getwizards();
    await this.adapter.set("wizards", [state, ...records]);
  }
  /** Returns every stored wizard state with its step history, newest first. */
  async getwizards() {
    return await this.adapter.get("wizards") ?? [];
  }
  /** Stores one submission ticket with its values hash, replacing the previous ticket of that id. */
  async setticket(ticket) {
    const records = (await this.gettickets()).filter((item) => item.id !== ticket.id);
    await this.adapter.set("submittickets", [ticket, ...records]);
  }
  /** Returns every stored submission ticket with its values hash, newest first. */
  async gettickets() {
    return await this.adapter.get("submittickets") ?? [];
  }
  /** Records one collected error report for correction loops. */
  async adderrorreport(report) {
    const records = await this.geterrorreports();
    await this.adapter.set("errorreports", [report, ...records]);
  }
  /** Returns every stored error report, newest first. */
  async geterrorreports() {
    return await this.adapter.get("errorreports") ?? [];
  }
  /** Records one typeahead pick observed when a reviewed suggestion entry was chosen. */
  async addpick(pick) {
    const records = await this.getpicks();
    await this.adapter.set("typeaheadpicks", [pick, ...records]);
  }
  /** Returns every recorded typeahead pick, newest first. */
  async getpicks() {
    return await this.adapter.get("typeaheadpicks") ?? [];
  }
  /** Records one captcha handoff while the plan waits for the user. */
  async addcaptcha(handoff) {
    const records = await this.getcaptchas();
    await this.adapter.set("captchas", [handoff, ...records]);
  }
  /** Returns every captcha handoff record with its resolution state, newest first. */
  async getcaptchas() {
    return await this.adapter.get("captchas") ?? [];
  }
  /** Resolves one captcha handoff by id once the user finished it. */
  async resolvecaptcha(id, resolvedat) {
    const records = await this.getcaptchas();
    await this.adapter.set("captchas", records.map((handoff) => handoff.id === id && !handoff.resolved ? { ...handoff, resolved: true, resolvedat } : handoff));
  }
  /** Records one login or template detection for its origin. */
  async adddetection(record) {
    const records = await this.getdetections();
    await this.adapter.set("detections", [record, ...records]);
  }
  /** Returns every stored login and template detection per origin, newest first. */
  async getdetections() {
    return await this.adapter.get("detections") ?? [];
  }
  /** Stores the reviewed one time code behind the consent gate of an active session. */
  async setcodevalue(value) {
    return this.adapter.set("codevalue", value);
  }
  /** Returns the reviewed one time code, if the user stored one behind the consent gate. */
  async getcodevalue() {
    return this.adapter.get("codevalue");
  }
  /** Stores one dataset with its column specs and rows, replacing the previous record of that id. */
  async setdataset(value) {
    await this.adapter.set(`dataset${value.id}`, value);
    const ids = (await this.adapter.get("datasets") ?? []).filter((id) => id !== value.id);
    await this.adapter.set("datasets", [value.id, ...ids]);
  }
  /** Returns one stored dataset by its id with its column specs and row count. */
  async getdataset(id) {
    return this.adapter.get(`dataset${id}`);
  }
  /** Returns every stored dataset id, newest first. */
  async getdatasets() {
    const ids = await this.adapter.get("datasets") ?? [];
    const records = [];
    for (const id of ids) {
      const record = await this.adapter.get(`dataset${id}`);
      if (record) records.push(record);
    }
    return records;
  }
  /** Stores one imported csv dataset for fill loops beside the dataset store. */
  async addimport(value) {
    await this.setdataset(value);
    const ids = (await this.adapter.get("imports") ?? []).filter((id) => id !== value.id);
    await this.adapter.set("imports", [value.id, ...ids]);
  }
  /** Returns every imported csv dataset for fill loops, newest first. */
  async getimports() {
    const ids = await this.adapter.get("imports") ?? [];
    const records = [];
    for (const id of ids) {
      const record = await this.adapter.get(`dataset${id}`);
      if (record) records.push(record);
    }
    return records;
  }
  /** Stores one extraction session with its cursor and page history, replacing the previous session of that id. */
  async setextractsession(value) {
    await this.adapter.set(`extract${value.id}`, value);
    const ids = (await this.adapter.get("extracts") ?? []).filter((id) => id !== value.id);
    await this.adapter.set("extracts", [value.id, ...ids]);
  }
  /** Returns every extraction session with its cursor and page history, newest first. */
  async getextractsessions() {
    const ids = await this.adapter.get("extracts") ?? [];
    const records = [];
    for (const id of ids) {
      const record = await this.adapter.get(`extract${id}`);
      if (record) records.push(record);
    }
    return records;
  }
  /** Records one provenance record of an exported artifact. */
  async addprovenance(record) {
    const records = await this.getprovenances();
    await this.adapter.set("provenances", [record, ...records]);
  }
  /** Returns every provenance record per exported artifact, newest first. */
  async getprovenances() {
    return await this.adapter.get("provenances") ?? [];
  }
  /** Stores the transform rules and dedupe keys of one task, replacing the previous record of that task. */
  async settaskrules(value) {
    const records = (await this.adapter.get("taskrules") ?? []).filter((item) => item.taskid !== value.taskid);
    await this.adapter.set("taskrules", [value, ...records]);
  }
  /** Returns the transform rules and dedupe keys per task, newest first. */
  async gettaskrules() {
    return await this.adapter.get("taskrules") ?? [];
  }
  /** Stores one stream chunk state for resume, replacing the previous state of that dataset. */
  async setstream(state) {
    const records = (await this.adapter.get("streams") ?? []).filter((item) => item.datasetid !== state.datasetid);
    await this.adapter.set("streams", [state, ...records]);
  }
  /** Returns every stream chunk state persisted for resume, newest first. */
  async getstreams() {
    return await this.adapter.get("streams") ?? [];
  }
  /** Stores one reviewed sheet endpoint config behind its origin grant, replacing the previous config of that origin. */
  async setsheetendpoint(config) {
    const records = (await this.adapter.get("sheetendpoints") ?? []).filter((item) => item.origin !== config.origin);
    await this.adapter.set("sheetendpoints", [config, ...records]);
  }
  /** Returns every reviewed sheet endpoint config, newest first. */
  async getsheetendpoints() {
    return await this.adapter.get("sheetendpoints") ?? [];
  }
  /** Records one exported data artifact; artifact retention is a user setting and an absent setting keeps every artifact. */
  async addexport(artifact) {
    const records = await this.getexports();
    const combined = [artifact, ...records.filter((item) => item.id !== artifact.id)];
    const retention = (await this.getsettings())?.artifactretention;
    await this.adapter.set("exports", retention === void 0 ? combined : combined.slice(0, retention));
  }
  /** Returns every exported data artifact with its content and checksum, newest first. */
  async getexports() {
    return await this.adapter.get("exports") ?? [];
  }
  /** Removes one exported data artifact by id and reports whether it existed. */
  async removeexport(id) {
    const records = await this.getexports();
    const remaining = records.filter((item) => item.id !== id);
    await this.adapter.set("exports", remaining);
    return remaining.length !== records.length;
  }
  /** Removes one run store artifact by id and reports whether it existed. */
  async removeartifact(id) {
    const records = await this.getartifacts();
    const remaining = records.filter((item) => item.id !== id);
    await this.adapter.set("artifacts", remaining);
    return remaining.length !== records.length;
  }
  /** Stores one batch download file record with its state, path and checksum, replacing the previous record of that id. */
  async setdownload(record) {
    const records = (await this.adapter.get("downloads") ?? []).filter((item) => item.id !== record.id);
    await this.adapter.set("downloads", [record, ...records]);
  }
  /** Returns every batch download file record with its state, path and checksum, newest first. */
  async getdownloads() {
    return await this.adapter.get("downloads") ?? [];
  }
  /** Records one captured network log record; netlog retention is a user setting and an absent value keeps every record. */
  async addnetlog(record) {
    const records = await this.getnetlog();
    const combined = [record, ...records];
    const retention = (await this.getsettings())?.netlogretention;
    await this.adapter.set("netlog", retention === void 0 ? combined : combined.slice(0, retention));
  }
  /** Returns the captured network log of the run with its step correlation, newest first. */
  async getnetlog() {
    return await this.adapter.get("netlog") ?? [];
  }
  /** Stores one clipboard consent record with its prompt and origin, replacing the previous record of that id. */
  async setclipconsent(record) {
    const records = (await this.adapter.get("clipconsents") ?? []).filter((item) => item.id !== record.id);
    await this.adapter.set("clipconsents", [record, ...records]);
  }
  /** Returns every clipboard consent record with its prompt and origin, newest first. */
  async getclipconsents() {
    return await this.adapter.get("clipconsents") ?? [];
  }
  /** Records one clipboard entry hash with its origin provenance; the payload text itself never persists. */
  async addclip(entry) {
    const records = await this.getclips();
    await this.adapter.set("clips", [entry, ...records]);
  }
  /** Returns every clipboard entry hash with its kind and origin provenance, newest first. */
  async getclips() {
    return await this.adapter.get("clips") ?? [];
  }
  /** Stores one quarantine entry with its scan verdict, replacing the previous entry of that id. */
  async setquarantine(entry) {
    const records = (await this.adapter.get("quarantines") ?? []).filter((item) => item.id !== entry.id);
    await this.adapter.set("quarantines", [entry, ...records]);
  }
  /** Returns every quarantine entry with its scan verdict and release ref, newest first. */
  async getquarantines() {
    return await this.adapter.get("quarantines") ?? [];
  }
  /** Stores the reviewed cleanup rule set of the run, replacing the previous set. */
  async setcleanuprules(rules) {
    return this.adapter.set("cleanuprules", rules);
  }
  /** Returns the reviewed cleanup rule set of the run. */
  async getcleanuprules() {
    return await this.adapter.get("cleanuprules") ?? [];
  }
  /** Records one cleanup run in the run history. */
  async addcleanuprun(run) {
    const records = await this.getcleanupruns();
    await this.adapter.set("cleanupruns", [run, ...records]);
  }
  /** Returns every cleanup run history record with removed and kept counts, newest first. */
  async getcleanupruns() {
    return await this.adapter.get("cleanupruns") ?? [];
  }
  /** Stores the capture naming counters of one task, replacing the previous counters of that task. */
  async setcapturecounter(counter) {
    const records = (await this.adapter.get("capturecounters") ?? []).filter((item) => item.taskid !== counter.taskid);
    await this.adapter.set("capturecounters", [counter, ...records]);
  }
  /** Returns every stored capture naming counter per task, newest first. */
  async getcapturecounters() {
    return await this.adapter.get("capturecounters") ?? [];
  }
  /** Replaces the artifact inventory the cleanup sweeper plans against. */
  async setinventory(entries) {
    return this.adapter.set("inventory", entries);
  }
  /** Returns the artifact inventory with sizes and ages for the cleanup sweeper. */
  async getinventory() {
    return await this.adapter.get("inventory") ?? [];
  }
  /** Stores one user configured virus scanning hook, replacing the previous hook of that scanner name. */
  async setscanhook(config) {
    const records = (await this.adapter.get("scanhooks") ?? []).filter((item) => item.scanner !== config.scanner);
    await this.adapter.set("scanhooks", [config, ...records]);
  }
  /** Returns every configured virus scanning hook, newest first. */
  async getscanhooks() {
    return await this.adapter.get("scanhooks") ?? [];
  }
  /** Stores the armed mime interception filters of the run, newest first. */
  async setmimefilters(filters) {
    return this.adapter.set("mimefilters", filters);
  }
  /** Returns the armed mime interception filters of the run, newest first. */
  async getmimefilters() {
    return await this.adapter.get("mimefilters") ?? [];
  }
  /** Stores one capture record with its bytes and step linkage, replacing the previous record of that id; the user configured capture retention window expires the oldest bytes while the metadata always survives for the audit trail. */
  async addcapture(record) {
    const records = await this.getcaptures();
    const retention = (await this.getsettings())?.captureretention;
    const combined = [record, ...records.filter((item) => item.id !== record.id)];
    const stored = retention === void 0 ? combined : combined.map((item, index) => index < retention ? item : expirecapturebytes(item));
    await this.adapter.set("captures", stored);
  }
  /** Returns every stored capture record with its metadata, newest first. */
  async getcaptures() {
    return await this.adapter.get("captures") ?? [];
  }
  /** Returns one capture record with its bytes by its id. */
  async getcapture(id) {
    return (await this.getcaptures()).find((item) => item.id === id);
  }
  /** Returns the capture records filtered by run, step and kind. */
  async listcaptures(filter) {
    const records = await this.getcaptures();
    return records.filter((item) => (filter.runid === void 0 || item.runid === filter.runid) && (filter.stepid === void 0 || item.stepid === filter.stepid) && (filter.kind === void 0 || item.kind === filter.kind));
  }
  /** Records one before and after shotpair of the run with its action context. */
  async addpair(pair) {
    const records = await this.getpairs();
    await this.adapter.set("capturepairs", [pair, ...records.filter((item) => item.id !== pair.id)]);
  }
  /** Returns the shotpairs of one run resolved through their before records, newest first; an absent run returns every pair. */
  async getpairs(runid) {
    const records = await this.adapter.get("capturepairs") ?? [];
    if (runid === void 0) return records;
    const runs = /* @__PURE__ */ new Map();
    for (const capture of await this.getcaptures()) runs.set(capture.id, capture.runid);
    return records.filter((item) => runs.get(item.beforeid) === runid);
  }
  /** Stores one media record of the 1.1.41 family with its bytes and step linkage, replacing the previous record of that id; the user configured media retention window expires the oldest bytes while the metadata and the recording index always survive. */
  async addmedia(record) {
    const records = await this.getmediarecords();
    const retention = (await this.getsettings())?.mediaretention;
    const combined = [record, ...records.filter((item) => item.id !== record.id)];
    const stored = retention === void 0 ? combined : combined.map((item, index) => index < retention ? item : expiremediabytes(item));
    await this.adapter.set("media", stored);
  }
  /** Returns every stored media record, newest first. */
  async getmediarecords() {
    return await this.adapter.get("media") ?? [];
  }
  /** Returns the media records filtered by run and kind; an absent filter returns every record. */
  async listmedia(filter) {
    const records = await this.getmediarecords();
    return records.filter((item) => (filter.runid === void 0 || item.runid === filter.runid) && (filter.kind === void 0 || mediakindof(item) === filter.kind));
  }
  /** Returns one media record by its id. */
  async getmediarecord(id) {
    return (await this.getmediarecords()).find((item) => item.id === id);
  }
  /** Returns one recording with its file reference and frame index by its id. */
  async getrecording(id) {
    const found = await this.getmediarecord(id);
    return found !== void 0 && "startedat" in found ? found : void 0;
  }
  /** Removes one media record by its id; the audit trail keeps its outcome evidence. */
  async removemedia(id) {
    await this.adapter.set("media", (await this.getmediarecords()).filter((item) => item.id !== id));
  }
  /** Stores one observed image batch of a downloadimages step, replacing the previous batch of that id. */
  async addimagebatch(batch) {
    const records = await this.adapter.get("imagebatches") ?? [];
    await this.adapter.set("imagebatches", [batch, ...records.filter((item) => item.id !== batch.id)]);
  }
  /** Returns every observed image batch with its filter match counts, newest first. */
  async getimagebatches() {
    return await this.adapter.get("imagebatches") ?? [];
  }
  /** Stores one recording consent decision of an origin, replacing the previous record of that id. */
  async setrecordingconsent(record) {
    const records = (await this.adapter.get("recordingconsents") ?? []).filter((item) => item.id !== record.id);
    await this.adapter.set("recordingconsents", [record, ...records]);
  }
  /** Returns every recording consent decision with its prompt and origin, newest first. */
  async getrecordingconsents() {
    return await this.adapter.get("recordingconsents") ?? [];
  }
  /** Stores one outbound call record with its transport facts and body, replacing the previous record of that id; the user configured call retention window expires the oldest bodies while the metadata always survives. */
  async addcall(record) {
    const records = await this.getcalls();
    const retention = (await this.getsettings())?.callretention;
    const combined = [record, ...records.filter((item) => item.id !== record.id)];
    const stored = retention === void 0 ? combined : combined.map((item, index) => index < retention ? item : expirecallbody(item));
    await this.adapter.set("calls", stored);
  }
  /** Returns every stored outbound call record, newest first. */
  async getcalls() {
    return await this.adapter.get("calls") ?? [];
  }
  /** Returns one outbound call record with its body by its id. */
  async getcall(id) {
    return (await this.getcalls()).find((item) => item.id === id);
  }
  /** Returns the outbound call records filtered by run and origin; an absent filter returns every call. */
  async listcalls(filter) {
    const records = await this.getcalls();
    return records.filter((item) => (filter.runid === void 0 || item.runid === filter.runid) && (filter.origin === void 0 || item.origin === filter.origin));
  }
  /** Stores one typed endpoint definition version, appending to the version history of that endpoint name. */
  async setendpoint(record) {
    const records = await this.adapter.get("endpoints") ?? [];
    const prior = records.filter((item) => item.name === record.name);
    const version = prior.length > 0 ? Math.max(...prior.map((item) => item.version)) + 1 : 1;
    await this.adapter.set("endpoints", [{ ...record, version, at: record.at }, ...records]);
  }
  /** Returns the newest endpointrecord definition of one name with its payload schema and version. */
  async getendpoint(name) {
    const records = await this.adapter.get("endpoints") ?? [];
    return records.find((item) => item.name === name);
  }
  /** Returns the newest definition of every typed endpoint name with its schema and version history. */
  async getendpoints() {
    const records = await this.adapter.get("endpoints") ?? [];
    const latest = /* @__PURE__ */ new Map();
    for (const record of records) if (!latest.has(record.name)) latest.set(record.name, record);
    return [...latest.values()];
  }
  /** Stores one fetch consent decision per origin with its reviewed header names and values and its expiry window. */
  async setfetchconsent(consent) {
    const records = (await this.adapter.get("fetchconsents") ?? []).filter((item) => item.id !== consent.id);
    await this.adapter.set("fetchconsents", [consent, ...records]);
  }
  /** Returns every fetch consent decision with its origin, header names and expiry window, newest first. */
  async getfetchconsents() {
    return await this.adapter.get("fetchconsents") ?? [];
  }
  /** Stores one api key entry with its origin scope and created time, replacing the previous entry of that name; the key material stays behind its storage id. */
  async setapikey(entry) {
    const records = (await this.adapter.get("apikeys") ?? []).filter((item) => item.name !== entry.name);
    await this.adapter.set("apikeys", [entry, ...records]);
  }
  /** Returns every stored api key entry with its origin scope, header name, storage id and last use timestamp; key material never loads here. */
  async getapikeys() {
    return await this.adapter.get("apikeys") ?? [];
  }
  /** Stamps the last use timestamp of one stored api key entry without ever loading the key material. */
  async touchapikey(name, at) {
    const records = await this.getapikeys();
    const entry = records.find((item) => item.name === name);
    if (!entry) return;
    await this.adapter.set("apikeys", [{ ...entry, lastuse: at }, ...records.filter((item) => item.name !== name)]);
  }
  /** Removes one api key reference and its stored secret together. */
  async removeapikey(name) {
    const records = await this.getapikeys();
    const ref = records.find((item) => item.name === name);
    if (ref) await this.adapter.set(ref.storageid, void 0);
    await this.adapter.set("apikeys", records.filter((item) => item.name !== name));
  }
  /** Stores one api key secret under its storage id; the value never appears in reports, outcomes or the audit trail. */
  async setsecret(storageid, value) {
    return this.adapter.set(storageid, value);
  }
  /** Loads one api key secret under its storage id for the executor only. */
  async getsecret(storageid) {
    return this.adapter.get(storageid);
  }
  /** Stores one channel record of a socket or event stream, replacing the previous record of that id. */
  async addchannel(record) {
    const records = (await this.adapter.get("channels") ?? []).filter((item) => item.id !== record.id);
    await this.adapter.set("channels", [record, ...records]);
  }
  /** Returns every stored channel record, newest first. */
  async getchannels() {
    return await this.adapter.get("channels") ?? [];
  }
  /** Returns one channel record by its id. */
  async getchannel(id) {
    return (await this.getchannels()).find((item) => item.id === id);
  }
  /** Queues one message envelope of a channel stream, keeping the arrival order for the waitmessage matchers. */
  async addmessage(envelope) {
    const records = (await this.adapter.get("messages") ?? []).filter((item) => !(item.channelid === envelope.channelid && item.sequence === envelope.sequence));
    await this.adapter.set("messages", [...records, envelope]);
  }
  /** Returns every queued message envelope, oldest first, optionally filtered by channel and stream. */
  async getmessages(channelid, stream) {
    const records = await this.adapter.get("messages") ?? [];
    return records.filter((item) => (channelid === void 0 || item.channelid === channelid) && (stream === void 0 || item.stream === stream));
  }
  /** Drops the matched message envelopes of one channel from the queue once a waitmessage step consumed them. */
  async drainmessages(sequences) {
    const records = await this.adapter.get("messages") ?? [];
    const kept = records.filter((item) => !sequences.some((match) => match.channelid === item.channelid && match.sequence === item.sequence));
    await this.adapter.set("messages", kept);
  }
  /** Stores one observed exchange record, replacing the previous record of that id. */
  async addexchange(record) {
    const records = (await this.adapter.get("exchanges") ?? []).filter((item) => item.id !== record.id);
    await this.adapter.set("exchanges", [record, ...records]);
  }
  /** Returns every stored exchange record, newest first. */
  async getexchanges() {
    return await this.adapter.get("exchanges") ?? [];
  }
  /** Returns one exchange record by its id. */
  async getexchange(id) {
    return (await this.getexchanges()).find((item) => item.id === id);
  }
  /** Returns the exchange records filtered by run, origin and status; the status filter accepts one code or the failed class of every exchange with an error class. */
  async listexchanges(filter) {
    const records = await this.getexchanges();
    return records.filter((item) => (filter.runid === void 0 || item.runid === filter.runid) && (filter.origin === void 0 || item.origin === filter.origin) && (filter.status === void 0 || (filter.status === "failed" ? item.errorclass !== void 0 : item.status === filter.status)));
  }
  /** Stores one captured response body with its mime type and byte size; the user configured body retention window expires the oldest bodies while the exchange metadata always survives. */
  async addbody(record) {
    const records = await this.getbodies();
    const retention = (await this.getsettings())?.bodyretention;
    const combined = [record, ...records.filter((item) => item.ref !== record.ref)];
    const stored = retention === void 0 ? combined : combined.map((item, index) => index < retention ? item : expirebodybytes(item));
    await this.adapter.set("bodies", stored);
  }
  /** Returns every captured body record, newest first. */
  async getbodies() {
    return await this.adapter.get("bodies") ?? [];
  }
  /** Returns one captured body record with its stored text by its reference. */
  async getbody(ref) {
    return (await this.getbodies()).find((item) => item.ref === ref);
  }
  /** Stores the page api map of one origin, replacing the previous map of that origin. */
  async setapimap(origin, entries) {
    const records = (await this.adapter.get("apimap") ?? []).filter((item) => item.origin !== origin);
    await this.adapter.set("apimap", [...entries, ...records]);
  }
  /** Returns every stored page api map entry, newest first. */
  async getapimap() {
    return await this.adapter.get("apimap") ?? [];
  }
  /** Stores one event stream subscription record, replacing the previous record of that id. */
  async setsubscription(record) {
    const records = (await this.adapter.get("subscriptions") ?? []).filter((item) => item.id !== record.id);
    await this.adapter.set("subscriptions", [record, ...records]);
  }
  /** Returns every stored event stream subscription, newest first. */
  async getsubscriptions() {
    return await this.adapter.get("subscriptions") ?? [];
  }
  /** Stores one registered request block rule of a run, replacing the previous rule of that id; every rule reverts and stays auditable after the run ends. */
  async addblockrule(rule) {
    const records = (await this.adapter.get("blockrules") ?? []).filter((item) => item.id !== rule.id);
    await this.adapter.set("blockrules", [rule, ...records]);
  }
  /** Returns every stored block rule, newest first. */
  async getblockrules() {
    return await this.adapter.get("blockrules") ?? [];
  }
  /** Stores one registered response mock fixture of a run, replacing the previous fixture of that id; the fixture body stays out of every audit trail. */
  async addmockspec(spec) {
    const records = (await this.adapter.get("mockspecs") ?? []).filter((item) => item.id !== spec.id);
    await this.adapter.set("mockspecs", [spec, ...records]);
  }
  /** Returns every stored mock fixture, newest first. */
  async getmockspecs() {
    return await this.adapter.get("mockspecs") ?? [];
  }
  /** Stores one registered header rewrite rule of a run, replacing the previous rule of that id; the provenance of every applied rule stays auditable. */
  async addheaderule(rule) {
    const records = (await this.adapter.get("headerules") ?? []).filter((item) => item.id !== rule.id);
    await this.adapter.set("headerules", [rule, ...records]);
  }
  /** Returns every stored header rewrite rule, newest first. */
  async getheaderules() {
    return await this.adapter.get("headerules") ?? [];
  }
  /** Stores one cookie operation of a run per domain with its timestamp; cookie values never enter the operation record. */
  async addcookieop(operation) {
    const records = await this.adapter.get("cookieops") ?? [];
    await this.adapter.set("cookieops", [operation, ...records]);
  }
  /** Returns every stored cookie operation, newest first, optionally filtered by domain. */
  async getcookieops(domain) {
    const records = await this.adapter.get("cookieops") ?? [];
    return records.filter((item) => domain === void 0 || item.domain === domain);
  }
  /** Stores one token record of a provider with scopes, origin scope and expiry; the token values stay behind their storage ids. */
  async addtoken(record) {
    const records = (await this.adapter.get("tokens") ?? []).filter((item) => item.id !== record.id);
    await this.adapter.set("tokens", [record, ...records]);
  }
  /** Returns every stored token record, newest first, optionally filtered by provider; token values never load here. */
  async listtokens(provider) {
    const records = await this.adapter.get("tokens") ?? [];
    return records.filter((item) => provider === void 0 || item.provider === provider);
  }
  /** Stores one applied proxy route of a run with its apply time, replacing the previous route of that id; the history keeps the revert times. */
  async addproxyroute(route) {
    const records = (await this.adapter.get("proxyroutes") ?? []).filter((item) => item.id !== route.id);
    await this.adapter.set("proxyroutes", [route, ...records]);
  }
  /** Returns every stored proxy route with apply and revert times, newest first. */
  async getproxyroutes() {
    return await this.adapter.get("proxyroutes") ?? [];
  }
  /** Stores one parsed rate limit read per origin, replacing the previous read of that origin. */
  async setratelimit(read) {
    const records = (await this.adapter.get("ratelimits") ?? []).filter((item) => item.origin !== read.origin);
    await this.adapter.set("ratelimits", [read, ...records]);
  }
  /** Returns every stored rate limit read whose reset window has not passed yet; expired states drop out at their reset windows. */
  async getratelimits(now) {
    const records = await this.adapter.get("ratelimits") ?? [];
    const live = records.filter((item) => item.resetat > now);
    if (live.length !== records.length) await this.adapter.set("ratelimits", live);
    return live;
  }
  /** Stores one run timeline entry; the user configured timeline retention window expires the oldest entries while their level counts survive in the per run level summaries. */
  async addtimelineentry(entry) {
    const records = await this.gettimeline();
    const combined = [entry, ...records];
    const retention = (await this.getsettings())?.timelineretention;
    if (retention === void 0) {
      await this.adapter.set("timelineentries", combined);
      return;
    }
    const kept = combined.slice(0, retention);
    const expired = combined.slice(retention);
    if (expired.length > 0) {
      const expiredcounts = /* @__PURE__ */ new Map();
      for (const item of expired) {
        const counts = expiredcounts.get(item.runid) ?? {};
        counts[item.level] = (counts[item.level] ?? 0) + 1;
        expiredcounts.set(item.runid, counts);
      }
      for (const [runid, counts] of expiredcounts) await this.mergelevelsummary(runid, counts, Date.now());
    }
    await this.adapter.set("timelineentries", kept);
  }
  /** Returns every stored run timeline entry, newest first. */
  async gettimeline() {
    return await this.adapter.get("timelineentries") ?? [];
  }
  /** Returns the run timeline entries filtered by run, level and step id. */
  async listtimeline(filter) {
    const records = await this.gettimeline();
    return records.filter((item) => (filter.runid === void 0 || item.runid === filter.runid) && (filter.level === void 0 || item.level === filter.level) && (filter.stepid === void 0 || item.stepid === filter.stepid));
  }
  /** Stores one captured javascript error record with its stack frames, source url and line. */
  async adderrorrecord(record) {
    const records = await this.adapter.get("errorrecords") ?? [];
    await this.adapter.set("errorrecords", [record, ...records]);
  }
  /** Returns every stored error record, newest first. */
  async geterrorrecords() {
    return await this.adapter.get("errorrecords") ?? [];
  }
  /** Stores one captured unhandled rejection record with its reason and stack frames. */
  async addrejectionrecord(record) {
    const records = await this.adapter.get("rejectionrecords") ?? [];
    await this.adapter.set("rejectionrecords", [record, ...records]);
  }
  /** Returns every stored rejection record, newest first. */
  async getrejectionrecords() {
    return await this.adapter.get("rejectionrecords") ?? [];
  }
  /** Stores one captured long task entry with its duration, start time and attribution names. */
  async addlongtask(record) {
    const records = await this.adapter.get("longtasks") ?? [];
    await this.adapter.set("longtasks", [record, ...records]);
  }
  /** Returns every stored long task entry, newest first. */
  async getlongtasks() {
    return await this.adapter.get("longtasks") ?? [];
  }
  /** Stores one console diff result between two runs, replacing the previous one. */
  async addconsolediff(diff) {
    return this.adapter.set("consolediff", diff);
  }
  /** Returns the one stored console diff result. */
  async getdiff() {
    return this.adapter.get("consolediff");
  }
  /** Stores one log rotation target record with its overflow entry counts, replacing the previous record of that target and run. */
  async addrotationtarget(record) {
    const records = (await this.adapter.get("rotationtargets") ?? []).filter((item) => !(item.target === record.target && item.runid === record.runid));
    await this.adapter.set("rotationtargets", [record, ...records]);
  }
  /** Returns every stored rotation target record with its overflow entry counts, newest first. */
  async getrotationtargets() {
    return await this.adapter.get("rotationtargets") ?? [];
  }
  /** Stores one console capture consent decision per origin; the approved decision persists so console watching on that origin prompts once. */
  async setconsoleconsent(consent) {
    const records = (await this.adapter.get("consoleconsents") ?? []).filter((item) => item.id !== consent.id);
    await this.adapter.set("consoleconsents", [consent, ...records]);
  }
  /** Returns every console capture consent decision, newest first. */
  async getconsoleconsents() {
    return await this.adapter.get("consoleconsents") ?? [];
  }
  /** Stores one devtools session record with its enabled domains and detach state, replacing the previous record of its id. */
  async setcdpsession(session) {
    const records = (await this.adapter.get("cdpsessions") ?? []).filter((item) => item.id !== session.id);
    await this.adapter.set("cdpsessions", [session, ...records]);
  }
  /** Returns every stored devtools session record, newest first. */
  async getcdpsessions() {
    return await this.adapter.get("cdpsessions") ?? [];
  }
  /** Stores one raw command outcome with its duration and error class. */
  async addcdpcommand(command) {
    const records = await this.adapter.get("cdpcommands") ?? [];
    await this.adapter.set("cdpcommands", [command, ...records]);
  }
  /** Returns every stored raw command outcome, newest first. */
  async getcdpcommands() {
    return await this.adapter.get("cdpcommands") ?? [];
  }
  /** Stores one domain event rule with its match filter, replacing the previous rule of its id. */
  async setcdpeventrule(rule) {
    const records = (await this.adapter.get("cdpeventrules") ?? []).filter((item) => item.id !== rule.id);
    await this.adapter.set("cdpeventrules", [rule, ...records]);
  }
  /** Returns every stored domain event rule, newest first. */
  async getcdpeventrules() {
    return await this.adapter.get("cdpeventrules") ?? [];
  }
  /** Stores one breakpoint record with its condition and hit counter, replacing the previous record of its id. */
  async addbreakpoint(spec) {
    const records = (await this.adapter.get("breakpoints") ?? []).filter((item) => item.id !== spec.id);
    await this.adapter.set("breakpoints", [spec, ...records]);
  }
  /** Returns every stored breakpoint record, newest first. */
  async getbreakpoints() {
    return await this.adapter.get("breakpoints") ?? [];
  }
  /** Stores one pause state capture; the user configured pause retention window expires the call frames and the dom snapshot reference of the oldest captures while the pause reason and hit breakpoint survive. */
  async addpause(pause) {
    const records = await this.getpauses();
    const combined = [pause, ...records.filter((item) => item.id !== pause.id)];
    const retention = (await this.getsettings())?.pauseretention;
    if (retention === void 0) {
      await this.adapter.set("pauses", combined);
      return;
    }
    const kept = combined.slice(0, retention);
    const expired = combined.slice(retention).map((item) => {
      if (item.framesexpired === true) return item;
      const faded = { ...item, callframes: [], framesexpired: true };
      delete faded.domsnapshotid;
      return faded;
    });
    await this.adapter.set("pauses", [...kept, ...expired]);
  }
  /** Returns every stored pause state capture, newest first. */
  async getpauses() {
    return await this.adapter.get("pauses") ?? [];
  }
  /** Returns the pause state captures of one run, newest first. */
  async listpauses(runid) {
    const records = await this.getpauses();
    return records.filter((item) => item.runid === runid);
  }
  /** Stores one watch expression with its per pause values, replacing the previous expression of its id. */
  async setwatchexpression(expression) {
    const records = (await this.adapter.get("watchexpressions") ?? []).filter((item) => item.id !== expression.id);
    await this.adapter.set("watchexpressions", [expression, ...records]);
  }
  /** Returns every stored watch expression, newest first. */
  async getwatchexpressions() {
    return await this.adapter.get("watchexpressions") ?? [];
  }
  /** Stores one script override with its review provenance, replacing the previous override of its id. */
  async addscriptoverride(spec) {
    const records = (await this.adapter.get("scriptoverrides") ?? []).filter((item) => item.id !== spec.id);
    await this.adapter.set("scriptoverrides", [spec, ...records]);
  }
  /** Returns every stored script override, newest first. */
  async getscriptoverrides() {
    return await this.adapter.get("scriptoverrides") ?? [];
  }
  /** Stores one debugger consent decision per origin with the consented domain list, replacing the previous decision of its id. */
  async setdebuggergrant(grant) {
    const records = (await this.adapter.get("debuggergrants") ?? []).filter((item) => item.id !== grant.id);
    await this.adapter.set("debuggergrants", [grant, ...records]);
  }
  /** Returns every debugger consent decision, newest first. */
  async getdebuggergrants() {
    return await this.adapter.get("debuggergrants") ?? [];
  }
  /** Revokes every approved debugger consent of one origin: the revoke time stamps the records so the next attach needs a new reviewed prompt. */
  async revokedebuggergrants(origin, at) {
    const records = await this.getdebuggergrants();
    let revoked = 0;
    const updated = records.map((grant) => {
      if (grant.origin !== origin || grant.revokedat !== void 0) return grant;
      revoked += 1;
      return { ...grant, revokedat: at };
    });
    await this.adapter.set("debuggergrants", updated);
    return revoked;
  }
  /** Merges expired entry counts into the per run level count summary that survives the retention window. */
  async mergelevelsummary(runid, counts, now) {
    const records = await this.getlevelsummaries();
    const existing = records.find((item) => item.runid === runid);
    const merged = { ...existing?.counts ?? {} };
    for (const [level, count] of Object.entries(counts)) merged[level] = (merged[level] ?? 0) + count;
    const updated = { runid, counts: merged, at: now };
    await this.adapter.set("levelsummaries", [updated, ...records.filter((item) => item.runid !== runid)]);
  }
  /** Returns every per run level count summary, newest first. */
  async getlevelsummaries() {
    return await this.adapter.get("levelsummaries") ?? [];
  }
  /** Stores one measured flow metric of the run beside its step span; the flow series stays per run. */
  async addflowmetric(metric) {
    const records = await this.getflowmetrics();
    await this.adapter.set("flowmetrics", [metric, ...records]);
  }
  /** Returns every stored flow metric, newest first. */
  async getflowmetrics() {
    return await this.adapter.get("flowmetrics") ?? [];
  }
  /** Returns the flow metrics of one run, newest first. */
  async listflowmetrics(runid) {
    const records = await this.getflowmetrics();
    return records.filter((metric) => metric.runid === runid);
  }
  /** Stores one heap snapshot record with its byte and node counts; the user configured profile retention window expires the heavy snapshot bytes while the counts survive. */
  async setheaprecord(heap) {
    const records = (await this.adapter.get("heaprecords") ?? []).filter((item) => item.id !== heap.id);
    const retention = (await this.getsettings())?.profileretention;
    const { heaps } = expireprofilerecords({ heaps: [heap, ...records], profiles: [], traces: [], retention, now: Date.now() });
    await this.adapter.set("heaprecords", heaps);
  }
  /** Returns every stored heap snapshot record, newest first. */
  async getheaprecords() {
    return await this.adapter.get("heaprecords") ?? [];
  }
  /** Stores one heap growth sample taken beside a step. */
  async addgrowsample(sample) {
    const records = await this.adapter.get("growsamples") ?? [];
    await this.adapter.set("growsamples", [sample, ...records]);
  }
  /** Returns every stored heap growth sample, newest first. */
  async getgrowsamples() {
    return await this.adapter.get("growsamples") ?? [];
  }
  /** Returns the heap growth samples of one run, newest first. */
  async listgrowsamples(runid) {
    const records = await this.getgrowsamples();
    return records.filter((sample) => sample.runid === runid);
  }
  /** Stores one computed heap growth trend of a run with its slope and flagged steps, replacing the previous trend of the run. */
  async settrend(trend) {
    const records = await this.adapter.get("memorytrends") ?? [];
    await this.adapter.set("memorytrends", [trend, ...records.filter((item) => item.runid !== trend.runid)]);
  }
  /** Returns every stored heap growth trend, newest first. */
  async gettrends() {
    return await this.adapter.get("memorytrends") ?? [];
  }
  /** Stores one cpu profile record with its sample count and hot function list; the profile retention window expires the heavy sample payload while the counts and hot functions survive. */
  async setcpuprofile(profile) {
    const records = (await this.adapter.get("cpuprofiles") ?? []).filter((item) => item.id !== profile.id);
    const retention = (await this.getsettings())?.profileretention;
    const { profiles } = expireprofilerecords({ heaps: [], profiles: [profile, ...records], traces: [], retention, now: Date.now() });
    await this.adapter.set("cpuprofiles", profiles);
  }
  /** Returns every stored cpu profile record, newest first. */
  async getcpuprofiles() {
    return await this.adapter.get("cpuprofiles") ?? [];
  }
  /** Stores one layout shift entry with its score and impacted selectors. */
  async addshiftentry(entry) {
    const records = await this.adapter.get("shiftentries") ?? [];
    await this.adapter.set("shiftentries", [entry, ...records]);
  }
  /** Returns every stored layout shift entry, newest first. */
  async getshiftentries() {
    return await this.adapter.get("shiftentries") ?? [];
  }
  /** Stores one trace record with its category list, byte size and step annotations; the profile retention window expires the heavy trace bytes while the metadata and annotations survive. */
  async settracerecord(trace) {
    const records = (await this.adapter.get("tracerecords") ?? []).filter((item) => item.id !== trace.id);
    const retention = (await this.getsettings())?.profileretention;
    const { traces } = expireprofilerecords({ heaps: [], profiles: [], traces: [trace, ...records], retention, now: Date.now() });
    await this.adapter.set("tracerecords", traces);
  }
  /** Returns every stored trace record, newest first. */
  async gettracerecords() {
    return await this.adapter.get("tracerecords") ?? [];
  }
  /** Returns the trace records filtered by run and applied categories. */
  async listtraces(filter) {
    const records = await this.gettracerecords();
    return records.filter((trace) => (filter.runid === void 0 || trace.runid === filter.runid) && (filter.categories === void 0 || filter.categories.every((category) => trace.categories.includes(category))));
  }
  /** Stores the exported file content of one trace beside its record; the retention window drops the file bytes of expired traces while the record survives. */
  async settracefile(traceid, content) {
    const records = (await this.adapter.get("tracefiles") ?? []).filter((item) => item.traceid !== traceid);
    const trace = (await this.gettracerecords()).find((item) => item.id === traceid);
    const retention = (await this.getsettings())?.profileretention;
    const kept = retention === void 0 || trace === void 0 || Date.now() - trace.endedat <= retention ? [{ traceid, content, savedat: Date.now() }, ...records] : records;
    await this.adapter.set("tracefiles", kept);
  }
  /** Returns the exported file content of one trace, or undefined when the retention window dropped the bytes. */
  async gettracefile(traceid) {
    const records = await this.adapter.get("tracefiles") ?? [];
    return records.find((item) => item.traceid === traceid)?.content;
  }
  /** Stores one source map reference of a run with its script url, map url and parsed state. */
  async setsourcemapref(ref) {
    const records = (await this.adapter.get("sourcemaprefs") ?? []).filter((item) => item.id !== ref.id);
    await this.adapter.set("sourcemaprefs", [ref, ...records]);
  }
  /** Returns every stored source map reference, newest first. */
  async getsourcemaps() {
    return await this.adapter.get("sourcemaprefs") ?? [];
  }
  /** Stores one source map capture consent decision per origin, replacing the previous decision of its id. */
  async setsourcemapconsent(consent) {
    const records = (await this.adapter.get("sourcemapconsents") ?? []).filter((item) => item.id !== consent.id);
    await this.adapter.set("sourcemapconsents", [consent, ...records]);
  }
  /** Returns every source map capture consent decision, newest first. */
  async getsourcemapconsents() {
    return await this.adapter.get("sourcemapconsents") ?? [];
  }
  /** Revokes every approved source map consent of one origin so the next capture needs a new reviewed prompt. */
  async revokesourcemapconsents(origin, at) {
    const records = await this.getsourcemapconsents();
    let revoked = 0;
    const updated = records.map((consent) => {
      if (consent.origin !== origin || consent.revokedat !== void 0) return consent;
      revoked += 1;
      return { ...consent, revokedat: at };
    });
    await this.adapter.set("sourcemapconsents", updated);
    return revoked;
  }
  /** Stores the emulation state of one run keyed by its run id; the reverted layer prior states expire after the user configured retention window while the layer history always survives. */
  async setemulationstate(state) {
    const retention = (await this.getsettings())?.emulationretention;
    await this.adapter.set(`emulationstate${state.runid}`, expirelayers(state, retention, Date.now()));
  }
  /** Returns the persisted emulation state of one run so the layers survive service worker restarts. */
  async getemulationstate(runid) {
    return this.adapter.get(`emulationstate${runid}`);
  }
  /** Returns the active and past layers of one run, newest last in apply order; the listlayers accessor of the emulation memory. */
  async listlayers(runid) {
    const state = await this.getemulationstate(runid);
    return state?.layers ?? [];
  }
  /** Stores one user curated device preset by its name so the preset library stays user data instead of a hardcoded list. */
  async setdevicepreset(preset) {
    const records = (await this.adapter.get("devicepresets") ?? []).filter((item) => item.name !== preset.name);
    await this.adapter.set("devicepresets", [...records, preset]);
  }
  /** Returns every user curated device preset. */
  async getdevicepresets() {
    return await this.adapter.get("devicepresets") ?? [];
  }
  /** Stores one user curated network preset by its name with editable values. */
  async setnetworkpreset(preset) {
    const records = (await this.adapter.get("networkpresets") ?? []).filter((item) => item.name !== preset.name);
    await this.adapter.set("networkpresets", [...records, preset]);
  }
  /** Returns every user curated network preset. */
  async getnetworkpresets() {
    return await this.adapter.get("networkpresets") ?? [];
  }
  /** Stores one user curated location preset by its name. */
  async setlocationpreset(preset) {
    const records = (await this.adapter.get("locationpresets") ?? []).filter((item) => item.name !== preset.name);
    await this.adapter.set("locationpresets", [...records, preset]);
  }
  /** Returns every user curated location preset. */
  async getlocationpresets() {
    return await this.adapter.get("locationpresets") ?? [];
  }
  /** Stores one user curated agent preset by its name. */
  async setagentpreset(preset) {
    const records = (await this.adapter.get("agentpresets") ?? []).filter((item) => item.name !== preset.name);
    await this.adapter.set("agentpresets", [...records, preset]);
  }
  /** Returns every user curated agent preset. */
  async getagentpresets() {
    return await this.adapter.get("agentpresets") ?? [];
  }
  /** Replaces the blackbox rule set of one origin so third party script blackboxing stays scoped per origin. */
  async setblackboxrules(origin, rules) {
    const records = (await this.adapter.get("blackboxrules") ?? []).filter((item) => item.origin !== origin);
    await this.adapter.set("blackboxrules", [...records, { origin, rules }]);
  }
  /** Returns every stored blackbox rule set with its origin. */
  async getblackboxrules() {
    return await this.adapter.get("blackboxrules") ?? [];
  }
  /** Records one permission override of a run with its prior state captured for the exact restore. */
  async addpermissionoverride(record) {
    const records = (await this.adapter.get("permissionoverrides") ?? []).filter((item) => item.id !== record.id);
    await this.adapter.set("permissionoverrides", [record, ...records]);
  }
  /** Returns the permission override history with restore states, newest first. */
  async getpermissionoverrides() {
    return await this.adapter.get("permissionoverrides") ?? [];
  }
  /** Stores one location consent decision per origin, replacing the previous decision of its id. */
  async setlocationconsent(consent) {
    const records = (await this.adapter.get("locationconsents") ?? []).filter((item) => item.id !== consent.id);
    await this.adapter.set("locationconsents", [consent, ...records]);
  }
  /** Returns every location consent decision, newest first. */
  async getlocationconsents() {
    return await this.adapter.get("locationconsents") ?? [];
  }
  /** Returns the persisted task state checkpoint of one run so the run resumes after a service worker restart. */
  async gettaskstate(runid) {
    return this.adapter.get(`taskstate${runid}`);
  }
  /** Persists one task state checkpoint per run with its corruption checksum. */
  async settaskstate(state) {
    return this.adapter.set(`taskstate${state.runid}`, state);
  }
  /** Returns the session event history with timestamps, newest first. */
  async getsessionevents() {
    return await this.adapter.get("sessionevents") ?? [];
  }
  /** Records one session event of the run with its timestamp and detail. */
  async addsessionevent(event) {
    const records = await this.getsessionevents();
    await this.adapter.set("sessionevents", [event, ...records]);
  }
  /** Returns every saved session record with its sections, newest first. */
  async getsessionrecords() {
    return await this.adapter.get("sessionrecords") ?? [];
  }
  /** Adds one saved session record to the library. */
  async addsessionrecord(record) {
    const records = await this.getsessionrecords();
    await this.adapter.set("sessionrecords", [record, ...records]);
  }
  /** Replaces one saved session record by its id after a filing or restore touches it. */
  async updatesessionrecord(record) {
    const records = await this.getsessionrecords();
    await this.adapter.set("sessionrecords", records.map((item) => item.id === record.id ? record : item));
  }
  /** Lists saved sessions filtered by name substring, folder and time window; the filter stays a user choice with no result cap. */
  async listsessions(filter) {
    return filteredsessions(await this.getsessionrecords(), filter);
  }
  /** Returns one saved session with every section; an expired record carries its metadata only. */
  async getsessionrecord(id) {
    return (await this.getsessionrecords()).find((record) => record.id === id);
  }
  /** Runs the reviewed search query across every stored session and returns the matches with their session ids and time windows. */
  async searchmemory(query) {
    return searchsessionrecords(query, await this.getsessionrecords());
  }
  /** Returns the folder tree of the session library. */
  async getsessionfolders() {
    return await this.adapter.get("sessionfolders") ?? [];
  }
  /** Replaces the folder tree after a reviewed filing adds or moves one folder. */
  async setsessionfolders(folders) {
    return this.adapter.set("sessionfolders", folders);
  }
  /** Returns every stored session diff result, newest first. */
  async getsessiondiffs() {
    return await this.adapter.get("sessiondiffs") ?? [];
  }
  /** Stores one session diff result for later review. */
  async addsessiondiff(diff) {
    const records = await this.getsessiondiffs();
    await this.adapter.set("sessiondiffs", [diff, ...records]);
  }
  /** Returns the persisted auto snapshot state with the reviewed interval, the last snapshot time and the snapshot count. */
  async getautosnapshot() {
    return await this.adapter.get("autosnapshot") ?? void 0;
  }
  /** Stores the auto snapshot state of the reviewed interval. */
  async setautosnapshot(state) {
    return this.adapter.set("autosnapshot", state);
  }
  /** Clears the auto snapshot interval so on demand captures stay the only source of records. */
  async clearautosnapshot() {
    return this.adapter.set("autosnapshot", null);
  }
  /** Expires the heavy sections of saved sessions after the reviewed retention window while the record metadata survives. */
  async applysessionexpiry(retention, now) {
    const records = expiresessions(await this.getsessionrecords(), retention, now);
    await this.adapter.set("sessionrecords", records);
    return records;
  }
  /** Returns the crash marker of a run interrupted by a browser restart. */
  async getcrashflag() {
    return await this.adapter.get("crashed") ?? false;
  }
  /** Sets the crash marker so the sessions view offers the crash restore inside the consent model. */
  async setcrashflag(value) {
    return this.adapter.set("crashed", value);
  }
  /** Stores one composed workflow record version with its timestamp; re-composing the same version replaces it while older versions survive for the audit trail. */
  async addworkflowrecord(record) {
    const records = await this.getworkflowrecordversions();
    const remaining = records.filter((entry) => !(entry.id === record.id && entry.version === record.version));
    await this.adapter.set("workflowrecords", [record, ...remaining]);
  }
  /** Returns every stored workflow record version, newest first. */
  async getworkflowrecordversions() {
    return await this.adapter.get("workflowrecords") ?? [];
  }
  /** Returns the latest stored version of one workflow record. */
  async getworkflowrecord(id) {
    return (await this.getworkflowrecordversions()).find((entry) => entry.id === id);
  }
  /** Lists the saved workflow records, the latest version of each, newest first. */
  async listworkflows() {
    const seen = /* @__PURE__ */ new Set();
    const latest = [];
    for (const entry of await this.getworkflowrecordversions()) {
      if (seen.has(entry.id)) continue;
      seen.add(entry.id);
      latest.push(entry);
    }
    return latest;
  }
  /** Stores one workflow run with its state transition; a run replace keeps the full runlog of the same id. */
  async setworkflowrun(run) {
    const runs = await this.listworkflowruns();
    const remaining = runs.filter((entry) => entry.id !== run.id);
    await this.adapter.set("workflowruns", [run, ...remaining]);
  }
  /** Returns every stored workflow run, newest first. */
  async listworkflowruns() {
    return await this.adapter.get("workflowruns") ?? [];
  }
  /** Returns one run with its full step outcome list so the panel shows the timeline after and during a run. */
  async getrun(id) {
    const run = (await this.listworkflowruns()).find((entry) => entry.id === id);
    if (!run) return void 0;
    return { run, log: await this.getrunlog(id) };
  }
  /** Records one runlog entry of a run; the runlog retention window is a user setting and an absent window keeps every entry. */
  async addrunlogentry(runid, entry) {
    const entries = await this.getrunlog(runid);
    const combined = [...entries, entry];
    const retention = (await this.getsettings())?.runlogretention;
    await this.adapter.set(`runlog${runid}`, retention === void 0 ? combined : combined.slice(-retention));
  }
  /** Returns the runlog of one run, oldest first. */
  async getrunlog(runid) {
    return await this.adapter.get(`runlog${runid}`) ?? [];
  }
  /** Stores the variable values per scope of one run for inspection after the run. */
  async setrunscopes(runid, scopes) {
    return this.adapter.set(`runscopes${runid}`, scopes);
  }
  /** Returns the variable scopes of one run, oldest first. */
  async getrunscopes(runid) {
    return await this.adapter.get(`runscopes${runid}`) ?? [];
  }
  /** Records one provenance entry of a run: an expression result or a regex capture with its name, value and time. */
  async addworkflowprovenance(runid, entry) {
    const entries = await this.getworkflowprovenance(runid);
    await this.adapter.set(`workflowprovenance${runid}`, [...entries, entry]);
  }
  /** Returns every provenance entry of one run, oldest first. */
  async getworkflowprovenance(runid) {
    return await this.adapter.get(`workflowprovenance${runid}`) ?? [];
  }
  /** Stores one shareable step template under its unique name. */
  async addsteptemplate(template) {
    const templates = (await this.getsteptemplates()).filter((entry) => entry.name !== template.name);
    await this.adapter.set("steptemplates", [template, ...templates]);
  }
  /** Returns every stored step template, newest first. */
  async getsteptemplates() {
    return await this.adapter.get("steptemplates") ?? [];
  }
  /** Records one control flow decision of a run — a branch choice with its reason, the loop counters of an iteration trail, the retry attempts with their backoff durations, the timeout aborts with the exceeded budget, the join record with its strategy and conflicts or the catch handler execution — so the audit trail keeps every control flow turn. */
  async addcontroldecision(runid, decision) {
    const decisions = await this.listcontroldecisions(runid);
    await this.adapter.set(`controldecisions${runid}`, [...decisions, { ...decision, runid }]);
  }
  /** Returns every stored control flow decision of one run, oldest first. */
  async listcontroldecisions(runid) {
    return await this.adapter.get(`controldecisions${runid}`) ?? [];
  }
  /** Returns the past branch decisions of one workflow across every stored run, oldest first, so review can compare branch paths over time. */
  async getbranchhistory(workflowid) {
    const runs = await this.listworkflowruns();
    const ordered = [...runs].reverse().filter((run) => run.workflowid === workflowid);
    const history = [];
    for (const run of ordered) {
      const decisions = await this.listcontroldecisions(run.id);
      for (const decision of decisions) if (decision.kind === "branch" && decision.branch !== void 0) history.push(decision.branch);
    }
    return history;
  }
  /** Stores one armed trigger rule with its workflow reference; re-arming the same id replaces the rule while the fire history survives. */
  async addtriggerule(rule) {
    const rules = (await this.gettriggerules()).filter((entry) => entry.id !== rule.id);
    await this.adapter.set("triggerules", [rule, ...rules]);
  }
  /** Returns every armed trigger rule, newest first. */
  async gettriggerules() {
    return await this.adapter.get("triggerules") ?? [];
  }
  /** Returns one armed trigger rule by its id. */
  async gettriggerule(id) {
    return (await this.gettriggerules()).find((rule) => rule.id === id);
  }
  /** Replaces one stored rule after an enable, disable, pause, resume, cooldown or fire bookkeeping change. */
  async settriggerule(rule) {
    const rules = await this.gettriggerules();
    await this.adapter.set("triggerules", rules.map((entry) => entry.id === rule.id ? rule : entry));
  }
  /** Replaces every stored rule at once so the session pause and resume suspend and release the whole rule set atomically. */
  async settriggerules(rules) {
    return this.adapter.set("triggerules", rules);
  }
  /** Removes one armed rule when the user disarms it; the fire history survives for the audit trail. */
  async removetriggerule(id) {
    await this.adapter.set("triggerules", (await this.gettriggerules()).filter((rule) => rule.id !== id));
  }
  /** Lists every armed rule joined with the name of its composed workflow so the trigger list shows what each rule launches. */
  async listtriggers() {
    const rules = await this.gettriggerules();
    const names = new Map((await this.listworkflows()).map((record) => [record.id, record.name]));
    return rules.map((rule) => ({ rule, ...names.has(rule.workflowid) ? { workflowname: names.get(rule.workflowid) } : {} }));
  }
  /** Records one trigger fire with the reviewed retention window; an absent window keeps every fire record while the rule counters always survive. */
  async addtriggerfire(fire) {
    const fires = await this.listtriggerfires();
    const combined = [fire, ...fires];
    const retention = (await this.getsettings())?.triggerretention;
    await this.adapter.set("triggerfires", retention === void 0 ? combined : combined.slice(0, retention));
  }
  /** Returns every stored trigger fire record, newest first, optionally filtered to one rule. */
  async listtriggerfires(ruleid) {
    const fires = await this.adapter.get("triggerfires") ?? [];
    return ruleid === void 0 ? fires : fires.filter((fire) => fire.ruleid === ruleid);
  }
  /** Stores the pending trigger queue: fires that arrived while the target run was busy or the session paused; the resume drains them through the same gates. */
  async settriggerqueue(queue) {
    return this.adapter.set("triggerqueue", queue);
  }
  /** Returns the pending trigger queue, oldest first. */
  async gettriggerqueue() {
    return await this.adapter.get("triggerqueue") ?? [];
  }
  /** Stores one verified webhook payload of a rule; the executor verifies the shared secret and the schema before anything persists. */
  async addwebhookpayload(ruleid, payload, at) {
    const stored = await this.adapter.get("webhookpayloads") ?? [];
    await this.adapter.set("webhookpayloads", [{ ruleid, payload, at }, ...stored]);
  }
  /** Returns the stored webhook payloads of one rule, newest first; only secret verified deliveries ever reach this store. */
  async listwebhookpayloads(ruleid) {
    const stored = await this.adapter.get("webhookpayloads") ?? [];
    return stored.filter((entry) => entry.ruleid === ruleid);
  }
  /** Stores one manual run preview with its step list so the panel renders it before confirmation. */
  async addmanualrun(preview) {
    const runs = (await this.listmanualruns()).filter((entry) => entry.id !== preview.id);
    await this.adapter.set("manualruns", [preview, ...runs]);
  }
  /** Returns every stored manual run preview with its confirmation outcome, newest first. */
  async listmanualruns() {
    return await this.adapter.get("manualruns") ?? [];
  }
  /** Stores one workflow version record with its change note; saving the same version again replaces its note while older versions survive for the timeline. */
  async addworkflowversion(version) {
    const versions = (await this.listworkflowversions()).filter((entry) => !(entry.workflowid === version.workflowid && entry.version === version.version));
    await this.adapter.set("workflowversions", [version, ...versions]);
  }
  /** Returns every stored workflow version record, newest first, optionally filtered to one workflow. */
  async listworkflowversions(workflowid) {
    const versions = await this.adapter.get("workflowversions") ?? [];
    return workflowid === void 0 ? versions : versions.filter((entry) => entry.workflowid === workflowid);
  }
  /** Stores one version diff result for the history view. */
  async addversiondiff(diff) {
    const diffs = (await this.listversiondiffs()).filter((entry) => !(entry.workflowid === diff.workflowid && entry.from === diff.from && entry.to === diff.to));
    await this.adapter.set("versiondiffs", [diff, ...diffs]);
  }
  /** Returns every stored version diff result, newest first, optionally filtered to one workflow. */
  async listversiondiffs(workflowid) {
    const diffs = await this.adapter.get("versiondiffs") ?? [];
    return workflowid === void 0 ? diffs : diffs.filter((entry) => entry.workflowid === workflowid);
  }
  /** Records one run history entry — the outcome, duration and trigger cause of one execution — under the user configured retention window with no code ceiling. */
  async addrunhistory(entry) {
    const entries = await this.gethistory();
    const combined = [entry, ...entries];
    const retention = (await this.getsettings())?.runhistoryretention;
    await this.adapter.set("runhistory", retention === void 0 ? combined : combined.slice(0, retention));
  }
  /** Returns the stored run history, newest first, filtered by workflow, outcome and time floor; the filters stay user choices. */
  async gethistory(filter) {
    const entries = await this.adapter.get("runhistory") ?? [];
    let filtered = entries;
    if (filter?.workflowid !== void 0) filtered = filtered.filter((entry) => entry.workflowid === filter.workflowid);
    if (filter?.outcome !== void 0) filtered = filtered.filter((entry) => entry.outcome === filter.outcome);
    if (filter?.since !== void 0) filtered = filtered.filter((entry) => entry.endedat >= filter.since);
    if (filter?.limit !== void 0) filtered = filtered.slice(0, filter.limit);
    return filtered;
  }
  /** Stores the editor layout of one workflow so the canvas reopens exactly as left. */
  async seteditorlayout(workflowid, layout) {
    return this.adapter.set(`editorlayout${workflowid}`, layout);
  }
  /** Returns the stored editor layout of one workflow. */
  async geteditorlayout(workflowid) {
    return await this.adapter.get(`editorlayout${workflowid}`) ?? void 0;
  }
  /** Stores the breakpoint step ids of one workflow. */
  async setworkflowbreakpoints(workflowid, stepids) {
    return this.adapter.set(`workflowbreakpoints${workflowid}`, stepids);
  }
  /** Returns the stored breakpoint step ids of one workflow, oldest first. */
  async getworkflowbreakpoints(workflowid) {
    return await this.adapter.get(`workflowbreakpoints${workflowid}`) ?? [];
  }
  /** Stores one per site policy override; re-adding the same id replaces its deltas. */
  async addsiteoverride(override) {
    const overrides = (await this.listsiteoverrides()).filter((entry) => entry.id !== override.id);
    await this.adapter.set("siteoverrides", [override, ...overrides]);
  }
  /** Returns every stored per site override, newest first, optionally filtered to one workflow. */
  async listsiteoverrides(workflowid) {
    const overrides = await this.adapter.get("siteoverrides") ?? [];
    return workflowid === void 0 ? overrides : overrides.filter((entry) => entry.workflowid === workflowid);
  }
  /** Removes one per site override when the user deletes it. */
  async removesiteoverride(id) {
    await this.adapter.set("siteoverrides", (await this.listsiteoverrides()).filter((entry) => entry.id !== id));
  }
  /** Stores one watchdog event with its recovery outcome; the event history keeps the audit trail of every scan. */
  async addwatchdogevent(event) {
    const events = (await this.listwatchdogevents()).filter((entry) => entry.id !== event.id);
    await this.adapter.set("watchdogevents", [event, ...events]);
  }
  /** Returns every stored watchdog event, newest first. */
  async listwatchdogevents() {
    return await this.adapter.get("watchdogevents") ?? [];
  }
  /** Stores one pending workflow import held for review; approving it later stores the record as runnable. */
  async addworkflowimport(entry) {
    const imports = (await this.listworkflowimports()).filter((candidate) => candidate.id !== entry.id);
    await this.adapter.set("workflowimports", [entry, ...imports]);
  }
  /** Returns every pending workflow import, newest first. */
  async listworkflowimports() {
    return await this.adapter.get("workflowimports") ?? [];
  }
  /** Removes one pending import when the user approves or rejects it. */
  async removeworkflowimport(id) {
    await this.adapter.set("workflowimports", (await this.listworkflowimports()).filter((entry) => entry.id !== id));
  }
  /** Stores the per workflow background run flags so a workflow keeps running with the panel closed. */
  async setbackgroundruns(flags) {
    return this.adapter.set("backgroundruns", flags);
  }
  /** Returns the per workflow background run flags. */
  async getbackgroundruns() {
    return await this.adapter.get("backgroundruns") ?? {};
  }
  /** Removes one stored workflow record version; a rejected import or rollback disappears from the library while every other version survives. */
  async removeworkflowversion(id, version) {
    await this.adapter.set("workflowrecords", (await this.getworkflowrecordversions()).filter((entry) => !(entry.id === id && entry.version === version)));
  }
  /** Returns every stored mcp client record, newest first. */
  async getclients() {
    return await this.adapter.get("mcpclients") ?? [];
  }
  /** Upserts one mcp client record by its id so one clientrecord stays per connected transport. */
  async setclient(client) {
    const records = (await this.getclients()).filter((entry) => entry.id !== client.id);
    await this.adapter.set("mcpclients", [client, ...records]);
  }
  /** Returns the connected client records — every client whose disconnect time is absent. */
  async listclients() {
    return (await this.getclients()).filter((client) => client.disconnectedat === void 0);
  }
  /** Stores the negotiated capability set of one client on its record. */
  async setclientcapabilities(id, capabilities) {
    await this.adapter.set("mcpclients", (await this.getclients()).map((client) => client.id === id ? { ...client, capabilities } : client));
  }
  /** Drops every stored client record when the server stops. */
  async clearclients() {
    await this.adapter.set("mcpclients", []);
  }
  /** Records one stdio bridge launch event with its process id; a restart marker distinguishes the relaunch of a dead client process. */
  async addbridgelaunch(launch) {
    await this.adapter.set("mcbridgelaunches", [launch, ...await this.adapter.get("mcbridgelaunches") ?? []]);
  }
  /** Returns every stdio bridge launch event, newest first. */
  async listbridgelaunches() {
    return await this.adapter.get("mcbridgelaunches") ?? [];
  }
  /** Returns the user configured mcp server config; an absent record keeps the documented localhost default. */
  async getmcpconfig() {
    return this.adapter.get("mcpconfig");
  }
  /** Stores the user configured mcp server config: bind address, port, transports, frame size, queue depth and enablement all stay user choices. */
  async setmcpconfig(config) {
    return this.adapter.set("mcpconfig", config);
  }
  /** Returns the persisted mcp server runtime state. */
  async getmcpstate() {
    return this.adapter.get("mcpstate");
  }
  /** Stores the mcp server runtime state with the stdio bridge status. */
  async setmcpstate(state) {
    return this.adapter.set("mcpstate", state);
  }
  /** Records one mcp tool call — the client, the tool, the origin and the outcome without any payload — under the user configured call retention with no code ceiling. */
  async addtoolcall(record) {
    const records = await this.listtoolcalls();
    const retention = (await this.getmcpconfig())?.callretention;
    await this.adapter.set("mcptoolcalls", retention === void 0 ? [record, ...records] : [record, ...records].slice(0, retention));
  }
  /** Returns every stored mcp tool call record, newest first. */
  async listtoolcalls() {
    return await this.adapter.get("mcptoolcalls") ?? [];
  }
  /** Returns every stored session token of paired remote clients; the records carry only their tokenhash form so raw tokens never persist. */
  async getsessiontokens() {
    return await this.adapter.get("mcpsessiontokens") ?? [];
  }
  /** Replaces the stored session token set after one issue, revocation or expiry sweep. */
  async setsessiontokens(tokens) {
    return this.adapter.set("mcpsessiontokens", tokens);
  }
  /** Returns every stored pairing code with its single use state, newest first. */
  async getpairingcodes() {
    return await this.adapter.get("mcppairingcodes") ?? [];
  }
  /** Records one issued pairing code for the one time client pairing. */
  async addpairingcode(code) {
    return this.adapter.set("mcppairingcodes", [code, ...(await this.getpairingcodes()).filter((candidate) => candidate.code !== code.code)]);
  }
  /** Marks one pairing code used so it never pairs a second client; an unknown code stays untouched. */
  async usepairingcode(code, now) {
    await this.adapter.set("mcppairingcodes", (await this.getpairingcodes()).map((candidate) => candidate.code === code ? { ...candidate, usedat: now } : candidate));
  }
  /** Returns every client allowlist entry with its grant history. */
  async getallowlist() {
    return await this.adapter.get("mcpallowlist") ?? [];
  }
  /** Upserts one client allowlist entry by its fingerprint with the grant history riding the record. */
  async setallowlistentry(entry) {
    await this.adapter.set("mcpallowlist", [entry, ...(await this.getallowlist()).filter((candidate) => candidate.fingerprint !== entry.fingerprint)]);
  }
  /** Removes one client allowlist entry so its fingerprint stops passing the allowlist check. */
  async removeallowlistentry(fingerprint) {
    await this.adapter.set("mcpallowlist", (await this.getallowlist()).filter((entry) => entry.fingerprint !== fingerprint));
  }
  /** Returns every approval gate with its decision state — the pending and resolved gates of the approval view. */
  async listapprovals() {
    return await this.adapter.get("mcpapprovals") ?? [];
  }
  /** Records one raised approval gate or its resolved state, keyed by the gate id. */
  async setapproval(request) {
    await this.adapter.set("mcpapprovals", [request, ...(await this.listapprovals()).filter((candidate) => candidate.id !== request.id)]);
  }
  /** Records one approval execution — the decision, the actor, the time and the latency — beside its gate. */
  async addapprovalexec(exec) {
    return this.adapter.set("mcpapprovalexecs", [exec, ...await this.adapter.get("mcpapprovalexecs") ?? []]);
  }
  /** Returns every approval execution record, newest first. */
  async listapprovalexecs() {
    return await this.adapter.get("mcpapprovalexecs") ?? [];
  }
  /** Records one auth handshake event with its issued, verified or refused outcome. */
  async addauthhandshake(event) {
    return this.adapter.set("mcpauthhandshakes", [event, ...await this.adapter.get("mcpauthhandshakes") ?? []]);
  }
  /** Returns every auth handshake event with its outcome, newest first. */
  async listauthhandshakes() {
    return await this.adapter.get("mcpauthhandshakes") ?? [];
  }
  /** Returns every stored client identity with its fingerprint for allowlist matching. */
  async getclientidentities() {
    return await this.adapter.get("mcpidentities") ?? [];
  }
  /** Upserts one client identity by its fingerprint so the allowlist matches it. */
  async setclientidentity(identity) {
    await this.adapter.set("mcpidentities", [identity, ...(await this.getclientidentities()).filter((candidate) => candidate.fingerprint !== identity.fingerprint)]);
  }
  /** Returns every open and closed stream channel of the http stream transport. */
  async getstreamchannels() {
    return await this.adapter.get("mcpchannels") ?? [];
  }
  /** Replaces the stored stream channel set after one open, heartbeat or close sweep. */
  async setstreamchannels(channels) {
    return this.adapter.set("mcpchannels", channels);
  }
  /** Returns every client event subscription with its kinds and filters, newest first. */
  async geteventsubscriptions() {
    return await this.adapter.get("mcpeventsubscriptions") ?? [];
  }
  /** Replaces the stored event subscription set after one subscribe, unsubscribe or delivery sweep. */
  async seteventsubscriptions(subscriptions) {
    return this.adapter.set("mcpeventsubscriptions", subscriptions);
  }
  /** Returns every page state resource watcher with its baseline, newest first. */
  async getresourcewatches() {
    return await this.adapter.get("mcpresourcewatches") ?? [];
  }
  /** Replaces the stored resource watcher set after one watch, unwatch or delta push. */
  async setresourcewatches(watches) {
    return this.adapter.set("mcpresourcewatches", watches);
  }
  /** Returns every sampling request with its provenance, newest first. */
  async getsamplingrequests() {
    return await this.adapter.get("mcpsampling") ?? [];
  }
  /** Replaces the stored sampling request set after one request or answer. */
  async setsamplingrequests(requests) {
    return this.adapter.set("mcpsampling", requests);
  }
  /** Returns every stored idempotency record for replay, newest first. */
  async getidempotencyrecords() {
    return await this.adapter.get("mcpidempotency") ?? [];
  }
  /** Replaces the stored idempotency record set after one store or expiry sweep. */
  async setidempotencyrecords(records) {
    return this.adapter.set("mcpidempotency", records);
  }
  /** Returns every per client rate limit counter with its window and budget. */
  async getcallratelimits() {
    return await this.adapter.get("mcpcallratelimits") ?? [];
  }
  /** Replaces the stored per client rate limit set after one configuration or counted call. */
  async setcallratelimits(limits) {
    return this.adapter.set("mcpcallratelimits", limits);
  }
  /** Returns every stored batch call with its per item outcomes, newest first. */
  async getbatchcalls() {
    return await this.adapter.get("mcpbatchcalls") ?? [];
  }
  /** Upserts one batch call by its id with the per item outcomes riding the record. */
  async setbatchcall(batch) {
    await this.adapter.set("mcpbatchcalls", [batch, ...(await this.getbatchcalls()).filter((candidate) => candidate.id !== batch.id)]);
  }
  /** Returns every call context of the call runtime, newest first. */
  async getcallcontexts() {
    return await this.adapter.get("mcpcallcontexts") ?? [];
  }
  /** Replaces the stored call context set after one begin, end or cancellation. */
  async setcallcontexts(contexts) {
    return this.adapter.set("mcpcallcontexts", contexts);
  }
  /** Returns every stored tool mock for client testing. */
  async gettoolmocks() {
    return await this.adapter.get("mcptoolmocks") ?? [];
  }
  /** Upserts one tool mock by its tool name or removes it when the canned result is absent. */
  async settoolmock(mock) {
    await this.adapter.set("mcptoolmocks", [mock, ...(await this.gettoolmocks()).filter((candidate) => candidate.tool !== mock.tool)]);
  }
  /** Removes one tool mock so its tool returns to the real gates. */
  async removetoolmock(tool) {
    await this.adapter.set("mcptoolmocks", (await this.gettoolmocks()).filter((candidate) => candidate.tool !== tool));
  }
  /** Stores one stream chunk of a progressive tool result under the recent chunk window of 25 records. */
  async addstreamchunk(chunk) {
    await this.adapter.set("mcpstreamchunks", [chunk, ...(await this.getstreamchunks()).slice(0, 24)]);
  }
  /** Returns the recent stream chunks of progressive tool results, newest first. */
  async getstreamchunks() {
    return await this.adapter.get("mcpstreamchunks") ?? [];
  }
  /** Replaces the recent stream chunk window after one streaming sweep. */
  async setstreamchunks(chunks) {
    return this.adapter.set("mcpstreamchunks", chunks);
  }
  /** Returns the audited tool call log under the requested filters: the client, the tool, the outcome, the time floor and the newest bound, all optional. */
  async getcalllog(filters) {
    let records = await this.listtoolcalls();
    if (filters?.clientid !== void 0) records = records.filter((record) => record.clientid === filters.clientid);
    if (filters?.tool !== void 0) records = records.filter((record) => record.tool === filters.tool);
    if (filters?.ok !== void 0) records = records.filter((record) => record.ok === filters.ok);
    if (filters?.since !== void 0) records = records.filter((record) => record.at >= (filters.since ?? 0));
    return filters?.limit !== void 0 ? records.slice(0, filters.limit) : records;
  }
  /** Stores one progress notice of a long tool call under the recent notice window of 25 records. */
  async addprogressnotice(notice) {
    await this.adapter.set("mcpprogressnotices", [notice, ...(await this.getprogressnotices()).slice(0, 24)]);
  }
  /** Returns the recent progress notices of long tool calls, newest first. */
  async getprogressnotices() {
    return await this.adapter.get("mcpprogressnotices") ?? [];
  }
  /** Returns the tool dry run toggle of the next call: true once the user armed the dry run in the panel. */
  async getdryruntoggle() {
    return await this.adapter.get("mcpdryruntoggle") === true;
  }
  /** Arms or disarms the tool dry run of the next call. */
  async setdryruntoggle(enabled) {
    return this.adapter.set("mcpdryruntoggle", enabled);
  }
  /** Returns every client session binding of the 1.1.84 serve mode: one live binding per client so concurrent clients hold isolated extension sessions. */
  async getclientbindings() {
    return await this.adapter.get("mcpclientbindings") ?? [];
  }
  /** Replaces the stored client binding set after one bind or release; the released records stay for the audit trail. */
  async setclientbindings(bindings) {
    return this.adapter.set("mcpclientbindings", bindings);
  }
  /** Upserts one client session binding of the 1.1.84 serve mode by its client id. */
  async setclientbinding(binding) {
    await this.adapter.set("mcpclientbindings", [binding, ...(await this.getclientbindings()).filter((candidate) => candidate.clientid !== binding.clientid)]);
  }
  /** Returns the shutdown drain window of the 1.1.84 serve mode in milliseconds; an absent window keeps the drain unbounded because the wait stays a user choice. */
  async getdrainwindow() {
    return this.adapter.get("mcpdrainwindow");
  }
  /** Stores the shutdown drain window of the 1.1.84 serve mode as the user configured value with no code ceiling. */
  async setdrainwindow(window) {
    return this.adapter.set("mcpdrainwindow", window);
  }
  /** Returns every user configured provider config of the 1.1.57 llm integration; the api keys stay behind their storage id references, never inside these records. */
  async getproviders() {
    return await this.adapter.get("llmproviders") ?? [];
  }
  /** Replaces the stored provider config set after one save, test or removal. */
  async setproviders(providers) {
    return this.adapter.set("llmproviders", providers);
  }
  /** Returns the user configured local model endpoint of the browser reachable inference. */
  async getlocalmodel() {
    return this.adapter.get("llmlocalmodel");
  }
  /** Stores the local model endpoint config after one save or health check. */
  async setlocalmodel(config) {
    return this.adapter.set("llmlocalmodel", config);
  }
  /** Returns every model route entry of the routing table, newest update first. */
  async getmodelroutes() {
    return await this.adapter.get("llmmodelroutes") ?? [];
  }
  /** Replaces the stored routing table after one route edit. */
  async setmodelroutes(routes) {
    return this.adapter.set("llmmodelroutes", routes);
  }
  /** Appends one revision entry to the model route revision history so every routing change stays queryable for audit. */
  async addmodelrouterevision(route) {
    await this.adapter.set("llmmodelroutehistory", [route, ...await this.adapter.get("llmmodelroutehistory") ?? []].slice(0, 200));
  }
  /** Returns the model route revision history, newest first. */
  async getmodelroutehistory() {
    return await this.adapter.get("llmmodelroutehistory") ?? [];
  }
  /** Records one usage entry of a model call with its run and step ids; the newest call reads first and an absent retention keeps every record. */
  async addusagerecord(record) {
    await this.adapter.set("llmusage", [record, ...await this.adapter.get("llmusage") ?? []]);
  }
  /** Returns every stored usage record of model calls, newest first. */
  async getusagerecords() {
    return await this.adapter.get("llmusage") ?? [];
  }
  /** Returns the token and cost totals per period: the run, the step, the since floor and the until ceiling stay optional filters over the stored usage records. */
  async getusage(filter = {}) {
    const records = (await this.getusagerecords()).filter((record) => (filter.runid === void 0 || record.runid === filter.runid) && (filter.stepid === void 0 || record.stepid === filter.stepid) && (filter.since === void 0 || record.at >= filter.since) && (filter.until === void 0 || record.at <= filter.until));
    return records.reduce((totals, record) => ({ prompttokens: totals.prompttokens + record.prompttokens, completiontokens: totals.completiontokens + record.completiontokens, totaltokens: totals.totaltokens + record.totaltokens, cost: totals.cost + record.cost, calls: totals.calls + 1 }), { prompttokens: 0, completiontokens: 0, totaltokens: 0, cost: 0, calls: 0 });
  }
  /** Stores one model drafted plan for review and audit; newer drafts read first. */
  async addplandraft(draft) {
    await this.adapter.set("llmplandrafts", [draft, ...await this.adapter.get("llmplandrafts") ?? []]);
  }
  /** Replaces the stored draft set after one review decision. */
  async setplandrafts(drafts) {
    return this.adapter.set("llmplandrafts", drafts);
  }
  /** Returns every stored model drafted plan, newest first. */
  async getplandrafts() {
    return await this.adapter.get("llmplandrafts") ?? [];
  }
  /** Stores one replan record for the fresh review and the audit history; newer replans read first. */
  async addreplan(replan) {
    await this.adapter.set("llmreplans", [replan, ...await this.adapter.get("llmreplans") ?? []]);
  }
  /** Replaces the stored replan set after one fresh review decision. */
  async setreplans(replans) {
    return this.adapter.set("llmreplans", replans);
  }
  /** Returns every stored replan record, newest first. */
  async getreplans() {
    return await this.adapter.get("llmreplans") ?? [];
  }
  /** Stores one reflection note of an executed step under the recent note window of 100 records. */
  async addreflectnote(note) {
    await this.adapter.set("llmreflectnotes", [note, ...await this.adapter.get("llmreflectnotes") ?? []].slice(0, 100));
  }
  /** Returns the stored reflection notes, newest first. */
  async getreflectnotes() {
    return await this.adapter.get("llmreflectnotes") ?? [];
  }
  /** Replaces the stored prompt template library after one save or removal; every version with its change notes stays stored. */
  async setprompttemplates(templates) {
    return this.adapter.set("llmprompttemplates", templates);
  }
  /** Returns the stored prompt template library with every version, newest first. */
  async getprompttemplates() {
    return await this.adapter.get("llmprompttemplates") ?? [];
  }
  /** Returns the stored cost budget of the runs; the run scoped budget wins over the shared one when both exist. */
  async getcostbudget(runid) {
    const budgets = await this.adapter.get("llmcostbudgets") ?? [];
    return budgets.find((budget) => runid !== void 0 && budget.runid === runid) ?? budgets.find((budget) => budget.runid === void 0);
  }
  /** Stores one cost budget; a run scoped budget replaces the earlier budget of its run while the shared budget replaces the shared one. */
  async setcostbudget(budget) {
    const budgets = await this.adapter.get("llmcostbudgets") ?? [];
    const kept = budgets.filter((candidate) => candidate.runid !== budget.runid);
    await this.adapter.set("llmcostbudgets", [budget, ...kept]);
  }
  /** Returns the latest parsed natural language command with its intent badge payload. */
  async getcommandparse() {
    return this.adapter.get("llmcommandparse");
  }
  /** Stores the latest parsed natural language command. */
  async setcommandparse(parse) {
    return this.adapter.set("llmcommandparse", parse);
  }
  /** Returns the recent guard refusal notices of invalid or refused model output, newest first under a window of 50. */
  async getguardnotices() {
    return await this.adapter.get("llmguardnotices") ?? [];
  }
  /** Records one guard refusal notice for the panel; the verdict reason explains the parse failure and its retries. */
  async addguardnotice(output) {
    if (output.verdict === "valid") return;
    await this.adapter.set("llmguardnotices", [output, ...await this.getguardnotices()].slice(0, 50));
  }
  /** Returns every user configured provider gateway of the 1.1.83 family: the base url, the path prefix, the enable toggle, the consent stamp and the key reference — the key material stays behind the vault seam, never inside these records. */
  async getgatewayconfigs() {
    return await this.adapter.get("gatewayconfigs") ?? [];
  }
  /** Replaces the stored provider gateway configs after one save, consent or removal. */
  async setgatewayconfigs(configs) {
    return this.adapter.set("gatewayconfigs", configs);
  }
  /** Returns the cached model lists of the provider gateways, one record per provider. */
  async getgatewaymodelcaches() {
    return await this.adapter.get("gatewaymodelcaches") ?? [];
  }
  /** Replaces one provider model cache record, keeping every other provider record untouched. */
  async setgatewaymodelcache(record) {
    await this.adapter.set("gatewaymodelcaches", [record, ...(await this.getgatewaymodelcaches()).filter((entry) => entry.providerid !== record.providerid)]);
  }
  /** Returns the stored gateway chat exchanges, newest first under a window of 20; the states carry tokens and errors only, never key material. */
  async getgatewaychats() {
    return await this.adapter.get("gatewaychats") ?? [];
  }
  /** Stores one gateway chat exchange, newest first under a window of 20; a stored requestid replaces its earlier state so the stream cursor polls one record. */
  async addgatewaychat(state) {
    await this.adapter.set("gatewaychats", [state, ...(await this.getgatewaychats()).filter((entry) => entry.requestid !== state.requestid)].slice(0, 20));
  }
  /** Removes one gateway chat exchange by its request id; the cancel control drops the record the panel stops polling. */
  async removegatewaychat(requestid) {
    await this.adapter.set("gatewaychats", (await this.getgatewaychats()).filter((entry) => entry.requestid !== requestid));
  }
  /** Returns the user configured model cache refresh window in milliseconds; an absent window keeps every cache fresh forever because the window stays a user choice. */
  async getgatewaycachewindow() {
    return this.adapter.get("gatewaycachewindow");
  }
  /** Stores the user configured model cache refresh window in milliseconds. */
  async setgatewaycachewindow(window) {
    return this.adapter.set("gatewaycachewindow", window);
  }
  /** Returns every agent identity of the 1.1.58 swarm with its tab, role, depth, budget and scope. */
  async getagents() {
    return await this.adapter.get("swarmagents") ?? [];
  }
  /** Replaces the stored agent identities after one register, assign, bind, spawn or lifecycle change. */
  async setagents(agents) {
    return this.adapter.set("swarmagents", agents);
  }
  /** Returns the shared task queue of the swarm with its lanes, priorities, items and claims. */
  async gettaskqueue() {
    return this.adapter.get("swarmtaskqueue");
  }
  /** Replaces the stored task queue after one enqueue, claim, steal, complete, cancel or requeue. */
  async settaskqueue(queue) {
    return this.adapter.set("swarmtaskqueue", queue);
  }
  /** Returns every agent mailbox; retention is a user setting and an absent setting keeps every message. */
  async getmailboxes() {
    return await this.adapter.get("swarmmailboxes") ?? [];
  }
  /** Replaces the stored mailboxes after one send or receive, applying the user configured mailbox retention over the stored inbox and outbox messages. */
  async setmailboxes(mailboxes) {
    const retention = (await this.getsettings())?.mailboxretention;
    const trimmed = retention === void 0 ? mailboxes : mailboxes.map((mailbox) => ({ ...mailbox, inbox: mailbox.inbox.slice(0, retention), outbox: mailbox.outbox.slice(0, retention) }));
    return this.adapter.set("swarmmailboxes", trimmed);
  }
  /** Returns the blackboard shared memory of the swarm with its sections and entries. */
  async getblackboard() {
    return this.adapter.get("swarmblackboard");
  }
  /** Replaces the stored blackboard after one post, retire or sweep. */
  async setblackboard(board) {
    return this.adapter.set("swarmblackboard", board);
  }
  /** Returns the killswitch state of the swarm. */
  async getkillswitch() {
    return this.adapter.get("swarmkillswitch");
  }
  /** Stores the killswitch state after one engage or disarm. */
  async setkillswitch(state) {
    return this.adapter.set("swarmkillswitch", state);
  }
  /** Records one spawn of a sub agent with its depth for the audit history, newest first. */
  async addspawnrecord(record) {
    await this.adapter.set("swarmspawns", [record, ...await this.adapter.get("swarmspawns") ?? []]);
  }
  /** Returns the spawn and depth history of the swarm, newest first. */
  async getspawnrecords() {
    return await this.adapter.get("swarmspawns") ?? [];
  }
  /** Records one agent lifecycle event notification, newest first under a window of 200. */
  async addagentevent(event) {
    await this.adapter.set("swarmevents", [event, ...await this.adapter.get("swarmevents") ?? []].slice(0, 200));
  }
  /** Returns the recorded agent lifecycle events, newest first. */
  async getagentevents() {
    return await this.adapter.get("swarmevents") ?? [];
  }
  /** Replaces the stored per agent usage counters held against the agent budgets. */
  async setagentusage(usage) {
    return this.adapter.set("swarmusage", usage);
  }
  /** Returns the stored per agent usage counters held against the agent budgets. */
  async getagentusage() {
    return await this.adapter.get("swarmusage") ?? [];
  }
  /** Returns the swarm at a glance: the agents, the tasks by claim state and the message counters read from the stored swarm records. */
  async swarmoverview() {
    const agents = await this.getagents();
    const queue = await this.gettaskqueue();
    const mailboxes = await this.getmailboxes();
    return swarmoverview({ agents, queue: queue ?? { lanes: [], priorities: [], completionpolicy: "all", items: [], claims: [] }, mailboxes });
  }
  /** Returns the leader worker topology of the 1.1.59 swarm with its leader, worker, critic and verifier lanes and its worker assignments. */
  async gettopology() {
    return this.adapter.get("swarmtopology");
  }
  /** Replaces the stored leader worker topology after one election, assignment, collection or scaling change. */
  async settopology(topology) {
    return this.adapter.set("swarmtopology", topology);
  }
  /** Returns the stored planner executor splits of the 1.1.59 swarm with their step reports. */
  async getplannersplits() {
    return await this.adapter.get("swarmsplits") ?? [];
  }
  /** Replaces the stored planner executor splits after one split or one executor step report. */
  async setplannersplits(splits) {
    return this.adapter.set("swarmsplits", splits);
  }
  /** Records one critic review of an agent output, newest first. */
  async addcriticreview(review) {
    await this.adapter.set("swarmreviews", [review, ...await this.adapter.get("swarmreviews") ?? []]);
  }
  /** Returns the recorded critic reviews, newest first. */
  async getcriticreviews() {
    return await this.adapter.get("swarmreviews") ?? [];
  }
  /** Records one verifier check of a result claim, newest first. */
  async addverifiercheck(check) {
    await this.adapter.set("swarmverifierchecks", [check, ...await this.adapter.get("swarmverifierchecks") ?? []]);
  }
  /** Returns the recorded verifier checks with their pass and fail outcomes, newest first. */
  async getverifierchecks() {
    return await this.adapter.get("swarmverifierchecks") ?? [];
  }
  /** Replaces the stored review requests routed between agents after one request, ack, answer or timeout. */
  async setreviewrequests(requests) {
    return this.adapter.set("swarmreviewrequests", requests);
  }
  /** Returns the stored review requests routed between agents. */
  async getreviewrequests() {
    return await this.adapter.get("swarmreviewrequests") ?? [];
  }
  /** Records one tab handoff with its packaged task state and its resumed state. */
  async addhandoff(record) {
    await this.adapter.set("swarmhandoffs", [record, ...await this.adapter.get("swarmhandoffs") ?? []].filter((entry, index, all) => all.findIndex((candidate) => candidate.id === entry.id) === index));
  }
  /** Replaces one stored handoff record after its transfer or resume. */
  async updatehandoff(record) {
    await this.adapter.set("swarmhandoffs", (await this.adapter.get("swarmhandoffs") ?? []).map((entry) => entry.id === record.id ? record : entry));
  }
  /** Returns the handoff log of tab transfers between agents, newest first. */
  async gethandoffs() {
    return await this.adapter.get("swarmhandoffs") ?? [];
  }
  /** Replaces the stored resource locks after one acquire, release or expiry sweep. */
  async setlocks(locks) {
    return this.adapter.set("swarmlocks", locks);
  }
  /** Returns the held resource locks with their holders and expiries. */
  async getlocks() {
    return await this.adapter.get("swarmlocks") ?? [];
  }
  /** Records one conflict scan report of overlapping writes, newest first. */
  async addconflictscan(scan) {
    await this.adapter.set("swarmconflicts", [scan, ...await this.adapter.get("swarmconflicts") ?? []]);
  }
  /** Returns the recorded conflict scan reports, newest first. */
  async getconflictscans() {
    return await this.adapter.get("swarmconflicts") ?? [];
  }
  /** Stores the merged result report with its mergeentry provenance. */
  async setreport(report) {
    return this.adapter.set("swarmreport", report);
  }
  /** Returns the stored merged result report across agents. */
  async getreport() {
    return this.adapter.get("swarmreport");
  }
  /** Records one progressboard snapshot under the user configured retention window; an absent window keeps every snapshot. */
  async addboardsnapshot(board) {
    const retention = (await this.getsettings())?.boardretention;
    await this.adapter.set("swarmboards", [board, ...await this.adapter.get("swarmboards") ?? []].slice(0, retention ?? 100));
  }
  /** Returns the stored progressboard snapshots, newest first. */
  async getboardsnapshots() {
    return await this.adapter.get("swarmboards") ?? [];
  }
  /** Records one escalation lifted to the user, newest first. */
  async addescalation(escalation) {
    await this.adapter.set("swarmescalations", [escalation, ...await this.adapter.get("swarmescalations") ?? []]);
  }
  /** Replaces one stored escalation after its user decision. */
  async updateescalation(escalation) {
    await this.adapter.set("swarmescalations", (await this.adapter.get("swarmescalations") ?? []).map((entry) => entry.id === escalation.id ? escalation : entry));
  }
  /** Returns the escalations awaiting the user and the decided ones, newest first. */
  async getescalations() {
    return await this.adapter.get("swarmescalations") ?? [];
  }
  /** Records one consensus round or replaces the stored one after a vote. */
  async setconsensusround(round) {
    const rounds = await this.adapter.get("swarmconsensus") ?? [];
    await this.adapter.set("swarmconsensus", rounds.some((entry) => entry.id === round.id) ? rounds.map((entry) => entry.id === round.id ? round : entry) : [round, ...rounds]);
  }
  /** Returns the consensus rounds with their votes and quorum states, newest first. */
  async getconsensusrounds() {
    return await this.adapter.get("swarmconsensus") ?? [];
  }
  /** Appends one action to the interleaved timeline of swarm actions, oldest first under a window of 500. */
  async addswarmaction(action) {
    await this.adapter.set("swarmtimeline", [...await this.adapter.get("swarmtimeline") ?? [], action].slice(-500));
  }
  /** Returns the interleaved timeline of swarm actions with the optional agent and kind filters, oldest first. */
  async getswarmtimeline(filters) {
    const actions = await this.adapter.get("swarmtimeline") ?? [];
    return actions.filter((action) => filters?.agentid === void 0 || action.agentid === filters.agentid).filter((action) => filters?.kind === void 0 || action.kind === filters.kind).filter((action) => filters?.since === void 0 || action.at >= filters.since);
  }
  /** Stores one shared cost accounting snapshot of the swarm, newest first. */
  async addswarmcost(cost) {
    await this.adapter.set("swarmcosts", [cost, ...await this.adapter.get("swarmcosts") ?? []].slice(0, 100));
  }
  /** Returns the stored shared cost accounting snapshots of the swarm, newest first. */
  async getswarmcosts() {
    return await this.adapter.get("swarmcosts") ?? [];
  }
  /**
   * Execution environment persistence of the 1.1.60 family.
   * The run state store seals every persisted run state with its sha-256 integrity digest through the storage api (the browser offers no at-rest encryption for its storage areas, so the honest derivation is the integrity seal that makes tampering detectable before any recovery uses the record), scopes every run state per profile so parallel profiles never share it, expires stale run state past the user configured window while the keepalive summaries survive, tracks the storage quota usage of the run state and prunes the oldest finished run states under pressure.
   * The adapter seam keeps every accessor a one line storage delegation so a future worker state backend replaces the adapter only.
   */
  /** Returns the environment grant list of the active session; an absent list keeps the documented default posture. */
  async getenvironmentgrants() {
    return (await this.getsession())?.environmentgrants;
  }
  /** Replaces the environment grant list of the active session so the environment grants join the origin grants in the session record. */
  async setenvironmentgrants(grants) {
    const session = await this.getsession();
    if (!session) throw new Error("The environment grants need an active session to join.");
    await this.setsession({ ...session, environmentgrants: grants });
  }
  /** Seals and stores the run state of one profile: the payload travels beside its sha-256 digest so a tampered record at rest stays detectable before any recovery uses it. */
  async setrunstate(profileid, state) {
    const sealed = await sealrunstate(state);
    const index = await this.adapter.get("runstateindex") ?? [];
    await this.adapter.set(`runstate:${profileid}`, sealed);
    if (!index.includes(profileid)) await this.adapter.set("runstateindex", [...index, profileid]);
  }
  /** Opens the sealed run state of one profile; a missing or tampered seal returns undefined so the recovery never trusts a broken record. */
  async getrunstate(profileid) {
    const sealed = await this.adapter.get(`runstate:${profileid}`);
    if (!sealed) return void 0;
    try {
      return await openseal(sealed);
    } catch {
      return void 0;
    }
  }
  /** Removes the run state of one profile from the store and the index: the per profile key takes an empty seal that never opens, so the quota pruning drops the pruned records whole. */
  async removerunstate(profileid) {
    const index = await this.adapter.get("runstateindex") ?? [];
    await this.adapter.set("runstateindex", index.filter((entry) => entry !== profileid));
    await this.adapter.set(`runstate:${profileid}`, { payload: "", algorithm: "sha-256", digest: "", sealedat: 0 });
  }
  /** Lists the stored run state records of every profile, oldest update first. */
  async listrunstates() {
    const index = await this.adapter.get("runstateindex") ?? [];
    const states = [];
    for (const profileid of index) {
      const state = await this.getrunstate(profileid);
      if (state) states.push(state);
    }
    return states.sort((one, two) => one.updatedat - two.updatedat);
  }
  /** Expires the stale run states past the user configured window: the expired records reduce to their keepalive summaries while an absent window keeps every run state whole. */
  async expirerunstates(window, now) {
    if (window === void 0) return await this.listrunstates();
    const index = await this.adapter.get("runstateindex") ?? [];
    const kept = [];
    for (const profileid of index) {
      const state = await this.getrunstate(profileid);
      if (!state) continue;
      if (now - state.updatedat > window && state.keepalive.state === "stopped") {
        const summary = { runid: state.runid, sessionid: state.sessionid, planid: state.planid, profileid: state.profileid, state: "expired", urlhistory: [], environments: {}, turnarounds: {}, keepalive: state.keepalive, updatedat: now };
        const sealed = await sealrunstate(summary);
        await this.adapter.set(`runstate:${profileid}`, sealed);
      } else {
        kept.push(state);
      }
    }
    return kept;
  }
  /** Records one worker spawn or teardown event with its provenance beside the step outcomes. */
  async addworkerevent(event) {
    await this.adapter.set("workerevents", [event, ...await this.adapter.get("workerevents") ?? []].slice(0, 500));
  }
  /** Returns the recorded worker spawn and teardown events, newest first. */
  async getworkerevents() {
    return await this.adapter.get("workerevents") ?? [];
  }
  /** Records one spawned offscreen document with its reasons and justification in the registry. */
  async addoffscreenentry(entry) {
    await this.adapter.set("offscreenregistry", [entry, ...await this.adapter.get("offscreenregistry") ?? []]);
  }
  /** Replaces one registry entry after its offscreen document closes. */
  async updateoffscreenentry(entry) {
    await this.adapter.set("offscreenregistry", (await this.adapter.get("offscreenregistry") ?? []).map((candidate) => candidate.runid === entry.runid ? entry : candidate));
  }
  /** Returns the offscreen document registry with the reasons and justification of every spawn. */
  async getoffscreenentries() {
    return await this.adapter.get("offscreenregistry") ?? [];
  }
  /** Records one sandbox render with its provenance, source origin and nonce. */
  async addsandboxrender(render) {
    await this.adapter.set("sandboxrenders", [render, ...await this.adapter.get("sandboxrenders") ?? []].slice(0, 500));
  }
  /** Returns the recorded sandbox renders with their provenance, newest first. */
  async getsandboxrenders() {
    return await this.adapter.get("sandboxrenders") ?? [];
  }
  /** Replaces the stored run locks after one acquisition, release or expiry sweep. */
  async setrunlocks(locks) {
    return this.adapter.set("runlocks", locks);
  }
  /** Returns the held run locks with their sessions, runs and expiries. */
  async getrunlocks() {
    return await this.adapter.get("runlocks") ?? [];
  }
  /** Tracks the storage quota usage of the run state: the last measured bytes stay beside the user configured ceiling so the pruning reads both. */
  async trackrunstatequota(used) {
    const settings = await this.getsettings();
    await this.adapter.set("runstatequota", { used, ...settings?.runstatebytes !== void 0 ? { ceiling: settings.runstatebytes } : {}, trackedat: Date.now() });
  }
  /** Returns the last tracked storage quota usage of the run state with its ceiling when the user configured one. */
  async getrunstatequota() {
    return this.adapter.get("runstatequota");
  }
  /** Exports every stored run state as one single audit record through the runstate export envelope. */
  async exportrunstates() {
    return exportrunstate(await this.listrunstates(), Date.now());
  }
  /**
   * Security part one persistence of the 1.1.61 family.
   * The trust boundary records live here: the per origin automation allowlist scoped per profile workspace with one exact origin per entry, the per site originprofiles with their kind grants and denials, the active consentwindows with their expiry timestamps that expire closed past their boundary, the mid run revokerun events with the halted step ids that stay visible for later consent prompts, the fresh class consents per origin, the mask rules for field shapes per origin, and the sealed immutable run logs with their final hash.
   * The run log store exposes no update or delete path: appends land whole, the seal closes a log with its final hash and the read path verifies the chain before returning a single entry so a broken link refuses the read.
   * The adapter seam keeps every accessor a one line storage delegation so a future append only backend replaces the adapter only; the current storage areas offer no append only hardware, so the honest derivation is the hash chain that makes any rewrite detectable at read time.
   */
  /** Replaces the per origin automation allowlist of the profile workspaces; every entry carries one exact origin with no wildcard expansion. */
  async setautomationallowlist(entries) {
    return this.adapter.set("automationallowlist", entries);
  }
  /** Returns the per origin automation allowlist entries, oldest grant first. */
  async getautomationallowlist() {
    return await this.adapter.get("automationallowlist") ?? [];
  }
  /** Adds one exact origin to the automation allowlist of a profile workspace; a duplicate origin keeps its first grant. */
  async addallowlistorigin(entry) {
    const entries = await this.getautomationallowlist();
    if (entries.some((candidate) => candidate.origin === entry.origin && candidate.profileid === entry.profileid)) return;
    await this.setautomationallowlist([...entries, entry]);
  }
  /** Removes one origin from the automation allowlist; the denydefault posture refuses the origin again after the removal. */
  async removeallowlistorigin(origin, profileid) {
    await this.setautomationallowlist((await this.getautomationallowlist()).filter((entry) => !(entry.origin === origin && entry.profileid === profileid)));
  }
  /** Replaces the per site origin profiles with their kind grants and denials; one profile per origin. */
  async setoriginprofiles(profiles) {
    return this.adapter.set("originprofiles", profiles);
  }
  /** Returns the stored per site origin profiles, oldest update first. */
  async getoriginprofiles() {
    return await this.adapter.get("originprofiles") ?? [];
  }
  /** Upserts one origin profile: a profile of the same origin replaces its grants and denials while a new origin joins the list. */
  async saveoriginprofile(profile) {
    const profiles = await this.getoriginprofiles();
    await this.setoriginprofiles(profiles.some((candidate) => candidate.origin === profile.origin) ? profiles.map((candidate) => candidate.origin === profile.origin ? profile : candidate) : [...profiles, profile]);
  }
  /** Replaces the consent windows; active windows keep their expiry timestamps and closed windows stay for the audit trail. */
  async setconsentwindows(windows) {
    return this.adapter.set("consentwindows", windows);
  }
  /** Returns the stored consent windows, newest start first. */
  async getconsentwindows() {
    return await this.adapter.get("consentwindows") ?? [];
  }
  /** Expires every consent window past its duration boundary: the closed windows keep their records while their grants bind no step anymore. */
  async expireconsentwindows(now) {
    const windows = await this.getconsentwindows();
    const expired = windows.map((window) => window.state === "active" && now >= window.expiresat ? { ...window, state: "closed", closedat: now } : window);
    await this.setconsentwindows(expired);
    return expired;
  }
  /** Records one mid run revocation with its halted step ids; the history stays visible for later consent prompts. */
  async addrevocation(event) {
    await this.adapter.set("revocations", [event, ...await this.adapter.get("revocations") ?? []].slice(0, 500));
  }
  /** Returns the recorded mid run revocations with their halted step ids, newest first. */
  async getrevocations() {
    return await this.adapter.get("revocations") ?? [];
  }
  /** Replaces the fresh class consents per origin. */
  async setclassconsents(consents) {
    return this.adapter.set("classconsents", consents);
  }
  /** Returns the fresh class consents per origin, newest grant first. */
  async getclassconsents() {
    return await this.adapter.get("classconsents") ?? [];
  }
  /** Records one fresh class consent per origin; the prompt of one class never widens another class. */
  async addclassconsent(consent) {
    const consents = (await this.getclassconsents()).filter((candidate) => !(candidate.origin === consent.origin && candidate.sensitiveclass === consent.sensitiveclass));
    await this.setclassconsents([consent, ...consents]);
  }
  /** Replaces the mask rules for sensitive field shapes per origin. */
  async setmaskrules(rules) {
    return this.adapter.set("maskrules", rules);
  }
  /** Returns the stored mask rules for sensitive field shapes per origin, oldest rule first. */
  async getmaskrules() {
    return await this.adapter.get("maskrules") ?? [];
  }
  /** Adds one mask rule for field shapes, optionally scoped to one origin. */
  async addmaskrule(rule) {
    await this.setmaskrules([...await this.getmaskrules(), rule]);
  }
  /** Removes one mask rule by its id. */
  async removemaskrule(id) {
    await this.setmaskrules((await this.getmaskrules()).filter((rule) => rule.id !== id));
  }
  /** Stores the whole run log of one run: the append lands in one storage transaction so the entries and their chain links persist together. */
  async setimmutablelog(log) {
    return this.adapter.set(`immutablelog:${log.runid}`, log);
  }
  /** Returns the stored run log of one run; an absent log returns undefined. */
  async getimmutablelog(runid) {
    return this.adapter.get(`immutablelog:${runid}`);
  }
  /** Lists the stored run logs, oldest update first, with the sealed logs carrying their final hash. */
  async listimmutablelogs() {
    const index = await this.adapter.get("immutablelogindex") ?? [];
    const logs = [];
    for (const runid of index) {
      const log = await this.getimmutablelog(runid);
      if (log) logs.push(log);
    }
    return logs.sort((one, two) => one.updatedat - two.updatedat);
  }
  /** Stores the run log index entry of one run so the log listing reads every stored log. */
  async trackimmutablelog(runid) {
    const index = await this.adapter.get("immutablelogindex") ?? [];
    if (!index.includes(runid)) await this.adapter.set("immutablelogindex", [...index, runid]);
  }
  /** Exports the verified log chain of one run for the audit file: the read path verifies the whole hash chain first and a broken link refuses the export with no entries served. */
  async exportverifiedrunlog(runid) {
    const log = await this.getimmutablelog(runid);
    if (!log) throw new Error(`No run log exists for the run ${runid}.`);
    return exportlogchain(log);
  }
  /** Expires the sealed run logs past the user configured retention: the entries reduce to their chain summaries while the seal hash always survives. */
  async expireimmutablelogs(retention, now) {
    const logs = await this.listimmutablelogs();
    if (retention === void 0) return logs;
    const kept = [];
    for (const log of logs) {
      if (log.seal !== void 0 && now - log.seal.sealedat > retention) {
        const summary = { runid: log.runid, sessionid: log.sessionid, entries: [], seal: { ...log.seal, entries: log.seal.entries }, updatedat: now };
        await this.setimmutablelog(summary);
      } else {
        kept.push(log);
      }
    }
    return kept;
  }
  /**
   * Security part two persistence of the 1.1.62 family.
   * The protections for secrets, messages and money live here: the secretvault metadata with labels and scopes only and never values, scoped per profile workspace; the connectallow entries with their senders shipping empty by default; the ratelimit bucket state per origin and per session; the confirm gates with their resolution events and their human action provenance; the redactshot regions per origin and page template; the phishguard verdicts with their distance scores expiring past their freshness window; the permdiff records of each installed version; the safedefaults applications with their first seen origins; and the deferred command events waiting for their bucket reset.
   * The vault values never touch this seam: only metadata persists while the values stay behind the vault seam the background wires.
   */
  /** Replaces the secretvault metadata of the profile workspaces: labels, scopes, provenance and digests only, never values. */
  async setsecretvault(entries) {
    return this.adapter.set("secretvault", entries);
  }
  /** Returns the stored secretvault metadata, oldest record first; the values live behind the vault seam and never persist. */
  async getsecretvault() {
    return await this.adapter.get("secretvault") ?? [];
  }
  /** Adds one secretvault metadata record scoped to a profile workspace; a duplicate vault id keeps its first record. */
  async addsecret(entry) {
    const entries = await this.getsecretvault();
    if (entries.some((candidate) => candidate.vaultid === entry.vaultid)) return;
    await this.setsecretvault([...entries, entry]);
  }
  /** Removes one secretvault metadata record by its vault id; the background drops the value behind the seam in the same action. */
  async removesecret(vaultid) {
    await this.setsecretvault((await this.getsecretvault()).filter((entry) => entry.vaultid !== vaultid));
  }
  /** Stamps the last use of one secretvault record: the metadata notes when the vault last released its value while the value itself stays unrecorded. */
  async stampsecretuse(vaultid, at) {
    await this.setsecretvault((await this.getsecretvault()).map((entry) => entry.vaultid === vaultid ? { ...entry, lastusedat: at } : entry));
  }
  /** Replaces the connectallow entries of external senders; the list ships empty by default with user managed entries only. */
  async setconnectallow(entries) {
    return this.adapter.set("connectallow", entries);
  }
  /** Returns the stored connectallow entries, oldest add first. */
  async getconnectallow() {
    return await this.adapter.get("connectallow") ?? [];
  }
  /** Adds one connectallow entry for an external sender; a duplicate sender id keeps its first entry. */
  async addconnectallow(entry) {
    const entries = await this.getconnectallow();
    if (entries.some((candidate) => candidate.senderid === entry.senderid)) return;
    await this.setconnectallow([...entries, entry]);
  }
  /** Removes one connectallow entry by its sender id; the origincheck drops the sender again after the removal. */
  async removeconnectallow(senderid) {
    await this.setconnectallow((await this.getconnectallow()).filter((entry) => entry.senderid !== senderid));
  }
  /** Replaces the ratelimit bucket state per origin and per session: the user configured bounds and windows with their used counts. */
  async setratelimitbuckets(buckets) {
    return this.adapter.set("ratelimitbuckets", buckets);
  }
  /** Returns the stored ratelimit buckets per origin and per session. */
  async getratelimitbuckets() {
    return await this.adapter.get("ratelimitbuckets") ?? [];
  }
  /** Upserts one ratelimit bucket: a bucket of the same origin and session replaces its state while a new pair joins the list. */
  async saveratelimitbucket(bucket) {
    const buckets = await this.getratelimitbuckets();
    await this.setratelimitbuckets(buckets.some((candidate) => candidate.origin === bucket.origin && candidate.sessionid === bucket.sessionid) ? buckets.map((candidate) => candidate.origin === bucket.origin && candidate.sessionid === bucket.sessionid ? bucket : candidate) : [...buckets, bucket]);
  }
  /** Removes the ratelimit bucket of one origin and session; the origin runs without a bucket because the bounds stay user choices only. */
  async removeratelimitbucket(origin, sessionid) {
    await this.setratelimitbuckets((await this.getratelimitbuckets()).filter((bucket) => !(bucket.origin === origin && bucket.sessionid === sessionid)));
  }
  /** Replaces the confirm gates with their payloads and states; a resolved or refused gate stays terminal for the audit trail. */
  async setgates(gates) {
    return this.adapter.set("confirmgates", gates);
  }
  /** Returns the stored confirm gates, newest open first. */
  async getgates() {
    return await this.adapter.get("confirmgates") ?? [];
  }
  /** Upserts one confirm gate: a gate of the same step keeps its latest record because one gated step carries one live gate. */
  async savegate(gate) {
    const gates = await this.getgates();
    await this.setgates(gates.some((candidate) => candidate.stepid === gate.stepid && candidate.kind === gate.kind) ? gates.map((candidate) => candidate.stepid === gate.stepid && candidate.kind === gate.kind ? gate : candidate) : [gate, ...gates]);
  }
  /** Records one gate resolution event with its human action provenance; the resolution history stays visible for the audit trail. */
  async addgateresolution(resolution) {
    await this.adapter.set("gateresolutions", [resolution, ...await this.adapter.get("gateresolutions") ?? []].slice(0, 500));
  }
  /** Returns the recorded gate resolution events with their human action provenance, newest first. */
  async getgateresolutions() {
    return await this.adapter.get("gateresolutions") ?? [];
  }
  /** Replaces the redactshot regions per origin and page template. */
  async setredactregions(regions) {
    return this.adapter.set("redactregions", regions);
  }
  /** Returns the stored redactshot regions per origin and page template, oldest rule first. */
  async getredactregions() {
    return await this.adapter.get("redactregions") ?? [];
  }
  /** Adds one redactshot region, derived from a field shape or drawn by the user. */
  async addredactregion(region) {
    await this.setredactregions([...await this.getredactregions(), region]);
  }
  /** Removes one redactshot region by its id. */
  async removeredactregion(id) {
    await this.setredactregions((await this.getredactregions()).filter((region) => region.id !== id));
  }
  /** Records one phishguard verdict with its distance score; the records stay for the audit trail while the freshness window governs the live set. */
  async addphishverdict(verdict) {
    await this.adapter.set("phishverdicts", [verdict, ...(await this.adapter.get("phishverdicts") ?? []).filter((candidate) => candidate.origin !== verdict.origin)].slice(0, 500));
  }
  /** Returns the stored phishguard verdicts with their distance scores, newest first. */
  async getphishverdicts() {
    return await this.adapter.get("phishverdicts") ?? [];
  }
  /** Expires the phishguard verdicts past the user configured freshness window: the expired verdicts keep their records for the audit trail while the guard recomputes the next login step. */
  async expirephishverdicts(freshness, now) {
    const verdicts = await this.getphishverdicts();
    if (freshness === void 0) return verdicts;
    return verdicts.filter((verdict) => now - verdict.at < freshness);
  }
  /** Records one permdiff between two installed permission versions; the record of each installed update stays for the audit trail. */
  async addpermdiff(diff) {
    await this.adapter.set("permdiffs", [diff, ...await this.adapter.get("permdiffs") ?? []].slice(0, 500));
  }
  /** Returns the recorded permdiffs of each installed update, newest first. */
  async getpermdiffs() {
    return await this.adapter.get("permdiffs") ?? [];
  }
  /** Stores the last installed permission set the permdiff of the next update compares against. */
  async setlastpermissions(permissions, version) {
    await this.adapter.set("lastpermissions", { permissions, version });
  }
  /** Returns the last installed permission set with its version; an absent record returns undefined. */
  async getlastpermissions() {
    return this.adapter.get("lastpermissions");
  }
  /** Records one safedefaults application with its first seen origin; the first visit of an unknown origin stays visible. */
  async addsafedefaultapplication(application) {
    const applications = await this.adapter.get("safedefaults") ?? [];
    if (applications.some((candidate) => candidate.origin === application.origin)) return;
    await this.adapter.set("safedefaults", [...applications, application]);
  }
  /** Returns the recorded safedefaults applications with their first seen origins, oldest first. */
  async getsafedefaultapplications() {
    return await this.adapter.get("safedefaults") ?? [];
  }
  /** Records one deferred command event with the reset time it waits for. */
  async adddeferredevent(event) {
    await this.adapter.set("deferredevents", [event, ...await this.adapter.get("deferredevents") ?? []].slice(0, 500));
  }
  /** Returns the recorded deferred command events, newest first. */
  async getdeferredevents() {
    return await this.adapter.get("deferredevents") ?? [];
  }
  /** Serves the transparency data of the transparencypage in one read: every active grant with its origin, scope and boundary, every consent window ever granted with its expiry, the connectallow entries with their senders, the permdiff records of each installed update, the safedefaults applications and the secretvault metadata with labels and scopes only. */
  async gettransparencyview() {
    return {
      allowlist: await this.getautomationallowlist(),
      profiles: await this.getoriginprofiles(),
      windows: await this.getconsentwindows(),
      connectallow: await this.getconnectallow(),
      permdiffs: await this.getpermdiffs(),
      safedefaults: await this.getsafedefaultapplications(),
      vault: await this.getsecretvault(),
      gates: await this.getgates(),
      resolutions: await this.getgateresolutions(),
      deferred: await this.getdeferredevents(),
      phishverdicts: await this.getphishverdicts()
    };
  }
  /**
   * Session interface persistence of the 1.1.63 family.
   * The five session stores live here, scoped per profile workspace: the sitenotes per origin with sensitive bodies sealed at rest, the append only scratchpad entries per task with their step provenance, the distilled runsummaries per run and origin, the correctionmemory entries per origin and kind captured from plan review, and the consentmemory entries per origin with every grant, denial, expiry and revocation carrying its boundary; beside them the semanticrecall index with fingerprint deduplication answers ranked queries inside the run scope, the incremental historysearch corpus indexes session metadata, notes and summaries as they are written, the errorsurface payloads of failed steps keep their retry hints with the policy verdict, the per tab session references isolate parallel tabs, and the export bundles notes, summaries and corrections as one audit bundle.
   * The recall seam stays documented: the local fingerprint index answers every query today while a future remote recall backend can take the same shapes behind the seam without touching the callers.
   */
  /** Replaces the stored site notes; a sensitive note carries its sealedbody only so the plain body never persists. */
  async setsitenotes(notes) {
    return this.adapter.set("sitenotes", notes);
  }
  /** Returns the stored site notes, oldest update first. */
  async getsitenotes() {
    return await this.adapter.get("sitenotes") ?? [];
  }
  /** Reads the site notes of one origin only; the read gate keeps the origin inside the session grants. */
  async readsitenotes(origin) {
    return (await this.getsitenotes()).filter((note) => note.origin === origin);
  }
  /** Writes one site note: a note of the same id keeps its latest edit while a new note joins the store. */
  async writesitenote(note) {
    const notes = await this.getsitenotes();
    await this.setsitenotes(notes.some((candidate) => candidate.id === note.id) ? notes.map((candidate) => candidate.id === note.id ? note : candidate) : [...notes, note]);
  }
  /** Removes one site note by its id. */
  async removesitenote(id) {
    await this.setsitenotes((await this.getsitenotes()).filter((note) => note.id !== id));
  }
  /** Expires the site notes past the user configured window; an absent window keeps every note. */
  async expiresitenotes(retention, now) {
    if (retention === void 0) return await this.getsitenotes();
    const kept = (await this.getsitenotes()).filter((note) => now - note.updatedat < retention);
    await this.setsitenotes(kept);
    return kept;
  }
  /** Replaces the stored scratchpad entries per task. */
  async setscratchpad(entries) {
    return this.adapter.set("scratchpad", entries);
  }
  /** Returns every stored scratchpad entry, newest first. */
  async getscratchpadall() {
    return await this.adapter.get("scratchpad") ?? [];
  }
  /** Appends one scratchpad entry: the pad stays append only so no later write rewrites an earlier entry. */
  async appendscratchentry(entry) {
    await this.setscratchpad([entry, ...await this.getscratchpadall()]);
  }
  /** Reads the scratchpad of one task session, newest first; entries of another task never cross the boundary. */
  async readscratchpad(taskid, sessionid) {
    return (await this.getscratchpadall()).filter((entry) => entry.taskid === taskid && entry.sessionid === sessionid);
  }
  /** Prunes the scratchpad entries past the user configured window; an absent window keeps every entry. */
  async prunescratchentries(window, now) {
    if (window === void 0) return await this.getscratchpadall();
    const kept = (await this.getscratchpadall()).filter((entry) => now - entry.at < window);
    await this.setscratchpad(kept);
    return kept;
  }
  /** Stores one distilled run summary of a completed run. */
  async setrunsummary(summary) {
    return this.adapter.set(`runsummary:${summary.runid}`, summary);
  }
  /** Returns the stored run summary of one run; an absent summary returns undefined. */
  async getrunsummary(runid) {
    return this.adapter.get(`runsummary:${runid}`);
  }
  /** Lists the stored run summaries, oldest distillation first, optionally filtered by origin. */
  async listrunsummaries(origin) {
    const index = await this.adapter.get("runsummaryindex") ?? [];
    const summaries = [];
    for (const runid of index) {
      const summary = await this.getrunsummary(runid);
      if (summary) summaries.push(summary);
    }
    const filtered = origin === void 0 ? summaries : summaries.filter((summary) => summary.origins.includes(origin));
    return filtered.sort((one, two) => one.distilledat - two.distilledat);
  }
  /** Tracks one run in the run summary index so the listing reads every stored summary. */
  async trackrunsummary(runid) {
    const index = await this.adapter.get("runsummaryindex") ?? [];
    if (!index.includes(runid)) await this.adapter.set("runsummaryindex", [...index, runid]);
  }
  /** Expires the run summaries past the user configured window; an absent window keeps every summary. */
  async expirerunsummaries(retention, now) {
    const summaries = await this.listrunsummaries();
    if (retention === void 0) return summaries;
    const kept = [];
    for (const summary of summaries) {
      if (now - summary.distilledat > retention) await this.adapter.set(`runsummary:${summary.runid}`, { ...summary, steps: [], kinds: [], origins: summary.origins });
      else kept.push(summary);
    }
    return kept;
  }
  /** Replaces the semantic recall index with its fingerprint deduplicated entries. */
  async setrecallindex(index) {
    return this.adapter.set("recallindex", index);
  }
  /** Returns the stored semantic recall index entries, newest first. */
  async getrecallindex() {
    return await this.adapter.get("recallindex") ?? [];
  }
  /** Adds one recall index entry with fingerprint deduplication: a repeated extraction keeps its first entry. */
  async addrecallentry(entry) {
    const index = await this.getrecallindex();
    if (index.some((candidate) => candidate.fingerprint === entry.fingerprint && candidate.origin === entry.origin)) return;
    await this.setrecallindex([entry, ...index]);
  }
  /** Answers one semantic recall query across the extraction stores: the local index ranks by text similarity inside the run scope and returns the provenance of every match. */
  async semanticrecall(query, scope, rank) {
    return rank(await this.getrecallindex(), query, scope);
  }
  /** Expires the recall index entries past the user configured window; the extraction records themselves stay for the audit trail. */
  async expirerecallentries(window, now) {
    if (window === void 0) return await this.getrecallindex();
    const kept = (await this.getrecallindex()).filter((entry) => now - entry.at < window);
    await this.setrecallindex(kept);
    return kept;
  }
  /** Replaces the stored correction memory entries per origin and kind. */
  async setcorrections(corrections) {
    return this.adapter.set("corrections", corrections);
  }
  /** Returns the stored correction memory entries, newest first, optionally filtered by origin and kind. */
  async getcorrections(filter) {
    const entries = await this.adapter.get("corrections") ?? [];
    return entries.filter((entry) => (filter?.origin === void 0 || entry.origin === filter.origin) && (filter?.kind === void 0 || entry.kind === filter.kind));
  }
  /** Records one correction memory entry captured from a plan review edit or rejection. */
  async addcorrection(entry) {
    await this.setcorrections([entry, ...await this.adapter.get("corrections") ?? []]);
  }
  /** Expires the correction memory entries past the user configured window; an absent window keeps every correction. */
  async expirecorrectionentries(window, now) {
    if (window === void 0) return await this.getcorrections();
    const kept = (await this.getcorrections()).filter((entry) => now - entry.at < window);
    await this.setcorrections(kept);
    return kept;
  }
  /** Replaces the stored consent memory entries per origin. */
  async setconsentmemory(entries) {
    return this.adapter.set("consentmemory", entries);
  }
  /** Returns the stored consent memory entries, newest first, optionally filtered by origin. */
  async getconsentmemory(origin) {
    const entries = await this.adapter.get("consentmemory") ?? [];
    return origin === void 0 ? entries : entries.filter((entry) => entry.origin === origin);
  }
  /** Records one consent memory entry per origin: every grant, denial, expiry and revocation lands with its boundary and kinds. */
  async addconsentmemoryentry(entry) {
    await this.setconsentmemory([entry, ...await this.adapter.get("consentmemory") ?? []]);
  }
  /** Replaces the stored error surface payloads of failed steps. */
  async seterrorsurfaces(surfaces) {
    return this.adapter.set("errorsurfaces", surfaces);
  }
  /** Returns the stored error surface payloads, newest first, optionally filtered by step. */
  async geterrorsurfaces(stepid) {
    const surfaces = await this.adapter.get("errorsurfaces") ?? [];
    return stepid === void 0 ? surfaces : surfaces.filter((surface) => surface.stepid === stepid);
  }
  /** Records one error surface payload of a failed step with its retry hint and the policy verdict. */
  async adderrorsurface(surface) {
    await this.seterrorsurfaces([surface, ...await this.adapter.get("errorsurfaces") ?? []].slice(0, 500));
  }
  /** Replaces the incremental history search corpus of session metadata, notes and run summaries. */
  async sethistoryindex(corpus) {
    return this.adapter.set("historyindex", corpus);
  }
  /** Returns the incremental history search corpus, newest entry first. */
  async gethistoryindex() {
    return await this.adapter.get("historyindex") ?? [];
  }
  /** Adds one corpus entry to the incremental history index on each store write. */
  async addhistoryentry(entry) {
    const corpus = await this.gethistoryindex();
    await this.sethistoryindex([entry, ...corpus.filter((candidate) => !(candidate.source === entry.source && candidate.id === entry.id))]);
  }
  /** Answers one history search query against the incremental corpus with the matched terms highlighted. */
  async historysearch(query, search) {
    return search(await this.gethistoryindex(), query);
  }
  /** Stores one per tab session reference so parallel tabs never collide inside the session stores. */
  async settabsession(ref) {
    return this.adapter.set(`tabsession:${ref.tabid}`, ref);
  }
  /** Returns the per tab session reference of one tab; an absent reference returns undefined. */
  async gettabsession(tabid) {
    return this.adapter.get(`tabsession:${tabid}`);
  }
  /** Lists every per tab session reference so the sessiongrid reads the per tab lock state of concurrent sessions. */
  async listtabsessions() {
    const tabs = await this.adapter.get("tabsessionindex") ?? [];
    const refs = [];
    for (const tabid of tabs) {
      const ref = await this.gettabsession(tabid);
      if (ref) refs.push(ref);
    }
    return refs;
  }
  /** Tracks one tab in the per tab session index so the listing reads every isolated reference. */
  async tracktabsession(tabid) {
    const tabs = await this.adapter.get("tabsessionindex") ?? [];
    if (!tabs.includes(tabid)) await this.adapter.set("tabsessionindex", [...tabs, tabid]);
  }
  /** Exports the site notes, the run summaries and the correction memory as one audit bundle: sensitive note bodies stay sealed in the export. */
  async exportsessionbundle(exportedat) {
    return { kind: "sessionbundle", notes: await this.getsitenotes(), summaries: await this.listrunsummaries(), corrections: await this.getcorrections(), exportedat };
  }
  /**
   * Interface surface stores of the 1.1.64 family live here, scoped per profile workspace: the commandpalette usage counts the recent first ranking reads, the taskinput history of natural language goals, the onboarding completion state, the per surface layout preferences, the logstream filter preferences and the stepapprove resolution history per origin.
   */
  /** Returns every commandpalette usage record so the ranking lifts the recent commands first. */
  async getpaletteusage() {
    return await this.adapter.get("paletteusage") ?? [];
  }
  /** Replaces the commandpalette usage records after one use: the count grows and the last use time moves so the ranking reads both. */
  async setpaletteusage(records) {
    return this.adapter.set("paletteusage", records);
  }
  /** Returns the stored taskinput history, newest first. */
  async gettaskinputs() {
    return await this.adapter.get("taskinputs") ?? [];
  }
  /** Adds one taskinput submission to the per profile history; the retention window stays a user setting. */
  async addtaskinput(entry) {
    const retention = (await this.getsettings())?.taskinputretention;
    const history = [entry, ...await this.gettaskinputs()];
    await this.adapter.set("taskinputs", retention === void 0 ? history : history.filter((candidate) => entry.at - candidate.at < retention));
  }
  /** Returns the onboarding completion state; an absent state means the walkthrough never ran. */
  async getonboardingstate() {
    return this.adapter.get("onboarding");
  }
  /** Stores the onboarding completion state; a done walkthrough never runs again on its own. */
  async setonboardingstate(state) {
    return this.adapter.set("onboarding", state);
  }
  /** Returns the version one sunset notice record of the negotiation banner; an absent record means no version one client declared below the supported floor this browser session. */
  async getv1sunset() {
    return this.adapter.get("v1sunset");
  }
  /** Stores the version one sunset notice record; the dismissal resets it for the session while a later browser session marks it again on the next refusal. */
  async setv1sunset(state) {
    return this.adapter.set("v1sunset", state);
  }
  /** Returns the version one migration prompt record; an absent record means no affected updater met the one time prompt yet. */
  async getmigrationprompt() {
    return this.adapter.get("migrationprompt");
  }
  /** Stores the version one migration prompt record; the persistent migrationpromptdismissed flag keeps a dismissed prompt from ever appearing again. */
  async setmigrationprompt(state) {
    return this.adapter.set("migrationprompt", state);
  }
  /** Returns the layout preferences of one surface; an absent preference set returns undefined. */
  async getsurfacelayout(surface) {
    return this.adapter.get(`surfacelayout:${surface}`);
  }
  /** Stores the layout preferences of one surface, scoped per profile workspace. */
  async setsurfacelayout(layout) {
    return this.adapter.set(`surfacelayout:${layout.surface}`, layout);
  }
  /** Returns the stored logstream filter preferences of the live view. */
  async getlogstreamfilters() {
    return this.adapter.get("logstreamfilters");
  }
  /** Stores the logstream filter preferences of the live view. */
  async setlogstreamfilters(filter) {
    return this.adapter.set("logstreamfilters", filter);
  }
  /** Returns every stored stepapprove resolution, newest first, with its human provenance. */
  async getstepapproveresolutions() {
    return await this.adapter.get("stepapproveresolutions") ?? [];
  }
  /** Records one stepapprove resolution in the per origin history. */
  async addstepapproveresolution(resolution) {
    await this.adapter.set("stepapproveresolutions", [resolution, ...await this.getstepapproveresolutions()]);
  }
  /**
   * Interface surface stores of the 1.1.65 family live here, scoped per profile workspace: the siteprofiles with the per site interface preferences, the shortcutkeys bindings and the theme preference per profile, the recenttray entries with their configurable depth and the notification consent and preference per profile.
   */
  /** Returns the siteprofile of one origin; an absent profile keeps the global interface preferences. */
  async getsiteprofile(origin) {
    return this.adapter.get(`siteprofile:${origin}`);
  }
  /** Stores the siteprofile of one origin with its theme, shortcutkeys and default view; the profile never adjusts a policy gate. */
  async setsiteprofile(profile) {
    return this.adapter.set(`siteprofile:${profile.origin}`, profile);
  }
  /** Returns every stored siteprofile keyed by origin. */
  async listsiteprofiles() {
    const entries = Object.entries(await this.adapter.get("siteprofiles") ?? {});
    return entries.map(([, profile]) => profile);
  }
  /** Stores every siteprofile keyed by origin so the list view reads them in one call. */
  async setsiteprofiles(profiles) {
    await this.adapter.set("siteprofiles", Object.fromEntries(profiles.map((profile) => [profile.origin, profile])));
  }
  /** Returns the stored shortcutkeys bindings of the profile; an absent set keeps the shipped editable defaults. */
  async getshortcutbindings() {
    return await this.adapter.get("shortcutbindings") ?? [];
  }
  /** Stores the shortcutkeys bindings the user edited in the optionspage. */
  async setshortcutbindings(bindings) {
    return this.adapter.set("shortcutbindings", bindings);
  }
  /** Returns the stored darklight theme preference of the profile; an absent preference follows the os preference alone. */
  async getthemepreference() {
    return this.adapter.get("themepreference");
  }
  /** Stores the darklight theme preference of the profile with its manual override. */
  async setthemepreference(preference) {
    return this.adapter.set("themepreference", preference);
  }
  /** Returns the recenttray entries, newest first, with their resume and reopen offers. */
  async getrecenttray() {
    return await this.adapter.get("recenttray") ?? [];
  }
  /** Adds one recenttray entry with the user configured depth; an absent depth keeps every run. */
  async addrecenttrayentry(entry) {
    const depth = (await this.getsettings())?.recenttraydepth;
    const appended = [entry, ...(await this.getrecenttray()).filter((candidate) => candidate.runid !== entry.runid)];
    await this.adapter.set("recenttray", depth !== void 0 && Number.isInteger(depth) && depth > 0 ? appended.slice(0, depth) : appended);
  }
  /** Returns the notification consent and preference of the profile; an absent record keeps the notifications content free and on. */
  async getnotificationprefs() {
    return this.adapter.get("notificationprefs");
  }
  /** Stores the notification consent and preference of the profile; the content consent gates every page content bearing body. */
  async setnotificationprefs(prefs) {
    return this.adapter.set("notificationprefs", prefs);
  }
  /** Returns the notification payloads the surface history keeps for the user to open after a do not disturb quiet. */
  async getnotificationhistory() {
    return await this.adapter.get("notificationhistory") ?? [];
  }
  /** Records one notification payload in the history so its deep link stays reachable while the notifications permission stays outside the manifest. */
  async addnotificationhistory(payload) {
    await this.adapter.set("notificationhistory", [payload, ...await this.getnotificationhistory()]);
  }
  /**
   * Ecosystem stores of the 1.1.66 family live here, scoped per profile workspace: the flowlibrary entries with their manifest digests and provenance, the library install and removal events, the syncbridge hooks with their conflict records, the attentionfeed entries with their configurable retention, the runreplay cursors per viewed run, the outputcompare sessions with their metric results and the background run queue state for restart recovery.
   * The flowlibrary store deduplicates entries by manifest digest, every entry carries its publisher provenance, and the manifest list exports for audit; the memory adapter seam stays the documented marketplace backend boundary because a future remote registry replaces the adapter only.
   */
  /** Returns every flowlibrary entry of the profile workspace, newest first. */
  async getflowlibrary() {
    return await this.adapter.get("flowlibrary") ?? [];
  }
  /** Replaces the flowlibrary entries of the profile workspace. */
  async setflowlibrary(entries) {
    return this.adapter.set("flowlibrary", entries);
  }
  /** Adds one flowlibrary entry deduplicated by manifest digest: an entry whose digest already exists replaces its predecessor while its provenance keeps both records. */
  async addlibraryentry(entry) {
    const entries = await this.getflowlibrary();
    const deduped = entries.filter((candidate) => candidate.digest !== entry.digest);
    await this.setflowlibrary([entry, ...deduped]);
    return [entry, ...deduped];
  }
  /** Removes one flowlibrary entry by its id while the library events keep their record for the audit trail. */
  async removelibraryentry(entryid) {
    await this.setflowlibrary((await this.getflowlibrary()).filter((candidate) => candidate.id !== entryid));
  }
  /** Returns every library install, update and removal event, newest first. */
  async getlibraryevents() {
    return await this.adapter.get("libraryevents") ?? [];
  }
  /** Records one library lifecycle event beside the flowlibrary store. */
  async addlibraryevent(event) {
    await this.adapter.set("libraryevents", [event, ...await this.getlibraryevents()]);
  }
  /** Exports the manifest list of the flowlibrary for audit: one row per entry with its digest, publisher, version, state and provenance and no step payload. */
  async exportlibrarymanifests() {
    return (await this.getflowlibrary()).map((entry) => ({ id: entry.id, title: entry.manifest.title, publisher: entry.manifest.publisher, version: entry.manifest.version, digest: entry.digest, state: entry.state, provenance: entry.provenance, addedat: entry.addedat }));
  }
  /** Returns every syncbridge hook of the profile workspace; every hook keeps its explicit opt in with no default on. */
  async getsyncbridgehooks() {
    return await this.adapter.get("syncbridgehooks") ?? [];
  }
  /** Replaces the syncbridge hooks of the profile workspace. */
  async setsyncbridgehooks(hooks) {
    return this.adapter.set("syncbridgehooks", hooks);
  }
  /** Returns every syncbridge conflict record, newest first, with both versions instead of a silent overwrite. */
  async getsyncbridgeconflicts() {
    return await this.adapter.get("syncbridgeconflicts") ?? [];
  }
  /** Records one syncbridge conflict with both manifest versions. */
  async addsyncbridgeconflict(conflict) {
    await this.adapter.set("syncbridgeconflicts", [conflict, ...await this.getsyncbridgeconflicts()]);
  }
  /** Resolves one syncbridge conflict by its id with the resolution the user picked; one conflict resolves exactly once. */
  async resolvesyncbridgeconflict(id, resolution, now) {
    const conflicts = await this.getsyncbridgeconflicts();
    await this.adapter.set("syncbridgeconflicts", conflicts.map((conflict) => conflict.id === id && conflict.resolution === void 0 ? { ...conflict, resolution, resolvedat: now } : conflict));
    return this.getsyncbridgeconflicts();
  }
  /** Returns every attentionfeed entry, newest first, with its cause, refs and deep link. */
  async getattentionentries() {
    return await this.adapter.get("attentionfeed") ?? [];
  }
  /** Records one attentionfeed entry deduplicated by its cause, run and gate refs while the retention window stays a user setting. */
  async addattentionentry(entry) {
    const existing = (await this.getattentionentries()).filter((candidate) => candidate.id !== entry.id);
    await this.adapter.set("attentionfeed", [entry, ...existing]);
  }
  /** Dismisses one attentionfeed entry by its id: the dismissal removes the feed row only while the waiting cause keeps its own resolution path. */
  async dismissattentionentry(id) {
    const entries = (await this.getattentionentries()).filter((candidate) => candidate.id !== id);
    await this.adapter.set("attentionfeed", entries);
    return entries;
  }
  /** Prunes the attentionfeed entries past their retention window; an absent window keeps every entry while the pruned ids return for the audit note. */
  async pruneattentionentries(now) {
    const retention = (await this.getsettings())?.attentionretention;
    const entries = await this.getattentionentries();
    if (retention === void 0) return { kept: entries, pruned: [] };
    const kept = entries.filter((entry) => now - entry.at < retention);
    await this.adapter.set("attentionfeed", kept);
    return { kept, pruned: entries.filter((entry) => now - entry.at >= retention).map((entry) => entry.id) };
  }
  /** Returns the runreplay cursors per viewed run so a reopened replay stands where the viewer left it. */
  async getreplaycursors() {
    return await this.adapter.get("replaycursors") ?? {};
  }
  /** Stores one runreplay cursor for its viewed run. */
  async setreplaycursor(runid, cursor) {
    await this.adapter.set("replaycursors", { ...await this.getreplaycursors(), [runid]: cursor });
  }
  /** Returns every outputcompare session with its metric results, newest first. */
  async getcomparesessions() {
    return await this.adapter.get("comparesessions") ?? [];
  }
  /** Records one outputcompare session with the metric set it used. */
  async addcomparesession(session) {
    await this.adapter.set("comparesessions", [session, ...await this.getcomparesessions()]);
  }
  /** Returns the background run queue state for restart recovery: every entry with its state and its keepalive hold. */
  async getbackgroundqueue() {
    return await this.adapter.get("backgroundqueue") ?? [];
  }
  /** Replaces the background run queue state after every transition so the restart recovery reads it in one call. */
  async setbackgroundqueue(queue) {
    return this.adapter.set("backgroundqueue", queue);
  }
  /** Returns the selcache state of one run: the generation, the cached entries and the invalidation trail the 1.1.68 family keeps per run. */
  async getselcachestate(runid) {
    return await this.adapter.get(`selcache:${runid}`) ?? void 0;
  }
  /** Stores the selcache state of one run; every mutation batch advances the generation while a navigation drops the cache wholesale. */
  async setselcachestate(state) {
    await this.adapter.set(`selcache:${state.runid}`, state);
  }
  /** Prunes the selcache entries of one run at run end; the invalidation trail stays for the audit while no entry outlives its run. */
  async pruneselcache(runid) {
    await this.adapter.set(`selcache:${runid}`, { runid, generation: 0, entries: [], invalidations: [] });
  }
  /** Returns the incrsnapshot base refs per run the delta engine computes against. */
  async getsnapshotbases() {
    return await this.adapter.get("snapshotbases") ?? [];
  }
  /** Stores one incrsnapshot base ref record for its run so every later delta of the run references it. */
  async addsnapshotbase(base) {
    await this.adapter.set("snapshotbases", [...(await this.getsnapshotbases()).filter((candidate) => candidate.runid !== base.runid), base]);
  }
  /** Prunes the incrsnapshot base refs of one run at run end; the deltas of the run end with it. */
  async prunesnapshotbases(runid) {
    await this.adapter.set("snapshotbases", (await this.getsnapshotbases()).filter((candidate) => candidate.runid !== runid));
  }
  /** Stores one computed incrsnapshot delta of a run beside its base so the executor skips recomputation on an empty delta. */
  async addsnapshotdelta(delta) {
    await this.adapter.set(`snapshotdelta:${delta.runid}:${delta.baseref}`, delta);
  }
  /** Returns the stored incrsnapshot delta of one run and base ref, when the run computed one. */
  async getsnapshotdelta(runid, baseref) {
    return await this.adapter.get(`snapshotdelta:${runid}:${baseref}`) ?? void 0;
  }
  /** Returns the chunkextract cursors per table so an interrupted big table extraction resumes from its cursor. */
  async getchunkcursors() {
    return await this.adapter.get("chunkcursors") ?? {};
  }
  /** Stores one chunkextract cursor for its table so the next window resumes where the last window stopped. */
  async setchunkcursor(tableid, cursor) {
    await this.adapter.set("chunkcursors", { ...await this.getchunkcursors(), [tableid]: cursor });
  }
  /** Clears one chunkextract cursor once its table completes; the merged windows stay in the datagrid. */
  async clearchunkcursor(tableid) {
    const cursors = await this.getchunkcursors();
    delete cursors[tableid];
    await this.adapter.set("chunkcursors", cursors);
  }
  /** Returns the perf records of the profile workspace, newest first, for the run footers and the perf summaries. */
  async getperfrecords() {
    return await this.adapter.get("perfrecords") ?? [];
  }
  /** Records one perf record per step for profiling; the records stay inside the user configured retention window with their provenance attached. */
  async addperfrecord(record) {
    await this.adapter.set("perfrecords", [record, ...await this.getperfrecords()]);
  }
  /** Prunes the perf records past the user configured retention window; an absent window keeps every record. */
  async pruneperfrecords(retention, now) {
    const records = await this.getperfrecords();
    if (retention === void 0) return { kept: records, pruned: 0 };
    const kept = records.filter((record) => now - record.at < retention);
    await this.adapter.set("perfrecords", kept);
    return { kept, pruned: records.length - kept.length };
  }
  /** Returns the lazymods load telemetry records for startup analysis, newest first. */
  async getlazyloadrecords() {
    return await this.adapter.get("lazyloadrecords") ?? [];
  }
  /** Records one lazymods load telemetry record: which module loaded, why, and how long the resolution took. */
  async addlazyloadrecord(record) {
    await this.adapter.set("lazyloadrecords", [record, ...await this.getlazyloadrecords()]);
  }
  /** Returns the recorded worker queue depth samples over time for tuning. */
  async getqueuedepths() {
    return await this.adapter.get("queuedepths") ?? [];
  }
  /** Records one worker queue depth sample: the pending parse tasks and the deferred tasks the backpressure held at one moment. */
  async recordqueuedepth(sample) {
    await this.adapter.set("queuedepths", [...await this.getqueuedepths(), sample]);
  }
  /** Returns the virtlist height maps per surface so reopened surfaces reuse their measured row heights. */
  async getheightmaps() {
    return await this.adapter.get("heightmaps") ?? [];
  }
  /** Stores one virtlist height map for its surface; the measured row heights stay for the next open of the surface. */
  async setheightmap(record) {
    await this.adapter.set("heightmaps", [...(await this.getheightmaps()).filter((candidate) => candidate.surface !== record.surface), record]);
  }
  /**
   * The perf metrics seam of the 1.1.68 family: today every perf record, queue depth sample and lazy load telemetry record stays inside the per profile workspace of the local adapter, and the seam keeps the record and bundle shapes stable so a reviewed remote metrics backend can take the exports later without touching the callers.
   * Exports the perf records of one run as a single audit bundle with its summary and its provenance attached.
   */
  async exportperfbundle(runid) {
    return { runid, records: (await this.getperfrecords()).filter((record) => record.runid === runid) };
  }
  /** Returns the domain lanes of one batch run the 1.1.69 family schedules its concurrency slots through. */
  async getdomainlanes(runid) {
    return await this.adapter.get(`domainlanes:${runid}`) ?? [];
  }
  /** Stores the domain lanes of one batch run; every lane runs at most its user chosen slots while its overflow queues. */
  async setdomainlanes(runid, lanes) {
    await this.adapter.set(`domainlanes:${runid}`, lanes);
  }
  /** Returns the runbudget records of the profile workspace, newest first. */
  async getrunbudgets() {
    return await this.adapter.get("runbudgets") ?? [];
  }
  /** Records one runbudget record of a run: the step usage against the user budget beside the memory pressure the worker telemetry reported. */
  async addrunbudget(record) {
    await this.adapter.set("runbudgets", [record, ...(await this.getrunbudgets()).filter((candidate) => candidate.runid !== record.runid)]);
  }
  /** Returns the budgetalerts of the profile workspace, newest first, with their thresholds and severity levels. */
  async getbudgetalerts() {
    return await this.adapter.get("budgetalerts") ?? [];
  }
  /** Records one budgetalert of a run; the critical alert pauses the run pending a user choice. */
  async addbudgetalert(alert) {
    await this.adapter.set("budgetalerts", [alert, ...await this.getbudgetalerts()]);
  }
  /** Returns the timeoutcancel events of the profile workspace, newest first, beside their immutable log entries. */
  async gettimeoutevents() {
    return await this.adapter.get("timeoutevents") ?? [];
  }
  /** Records one timeoutcancel event: the aborted step, its user bound and its logged cancel entry beside the step outcome. */
  async addtimeoutevent(event) {
    await this.adapter.set("timeoutevents", [event, ...await this.gettimeoutevents()]);
  }
  /** Returns the tabsuspend states per run so a restore brings the suspended tab back before the step that needs it. */
  async getsuspendstates() {
    return await this.adapter.get("suspendstates") ?? [];
  }
  /** Stores one tabsuspend state of a run; the run state stays preserved across the suspend and restore. */
  async setsuspendstate(state) {
    await this.adapter.set("suspendstates", [...(await this.getsuspendstates()).filter((candidate) => candidate.runid !== state.runid), state]);
  }
  /** Clears one tabsuspend state once its tab restored before the step that needed it. */
  async clearsuspendstate(runid) {
    await this.adapter.set("suspendstates", (await this.getsuspendstates()).filter((candidate) => candidate.runid !== runid));
  }
  /** Returns the runcache entries of every run keyed by their resource digests. */
  async getruncache() {
    return await this.adapter.get("runcache") ?? [];
  }
  /** Stores one runcache entry of a run keyed by its digest; a repeat fetch of the same run serves from the entry. */
  async addruncacheentry(entry) {
    await this.adapter.set("runcache", [...(await this.getruncache()).filter((candidate) => candidate.runid !== entry.runid || candidate.resource !== entry.resource), entry]);
  }
  /** Sweeps the runcache entries of one run at run end; the pinned entries of the user profile cache survive. */
  async sweepruncache(runid, pin) {
    const entries = await this.getruncache();
    if (pin) return { cleared: 0 };
    const kept = entries.filter((entry) => entry.runid !== runid || entry.pinned);
    await this.adapter.set("runcache", kept);
    return { cleared: entries.length - kept.length };
  }
  /** Returns the efficientresume checkpoints of one run so a restart skips its completed steps. */
  async getresumepoints(runid) {
    return await this.adapter.get(`resumepoints:${runid}`) ?? [];
  }
  /** Stores one efficientresume checkpoint of a run at a step boundary with its cursor and page digest. */
  async addresumepoint(point) {
    await this.adapter.set(`resumepoints:${point.runid}`, [...(await this.getresumepoints(point.runid)).filter((candidate) => candidate.stepid !== point.stepid), point]);
  }
  /** Clears the efficientresume checkpoints of one run at run end. */
  async cleareresumepoints(runid) {
    await this.adapter.set(`resumepoints:${runid}`, []);
  }
  /** Returns the selectorprofile stats of the profile workspace per selector. */
  async getselectorprofiles() {
    return await this.adapter.get("selectorprofiles") ?? [];
  }
  /** Stores one selectorprofile stat; the flagged selectors report above the user latency threshold and never refuse. */
  async setselectorprofile(stats) {
    await this.adapter.set("selectorprofiles", [...(await this.getselectorprofiles()).filter((candidate) => candidate.selector !== stats.selector), stats]);
  }
  /** Returns the steptrace spans of one run for the timeline view and the trace file export. */
  async getsteptrace(runid) {
    return await this.adapter.get(`steptrace:${runid}`) ?? [];
  }
  /** Stores one steptrace span of a run; the spans nest per step and per worker task through their parent refs. */
  async addsteptracespan(span) {
    await this.adapter.set(`steptrace:${span.runid}`, [...await this.getsteptrace(span.runid), span]);
  }
  /** Clears the steptrace spans of one run; the exported trace files keep their events. */
  async clearsteptrace(runid) {
    await this.adapter.set(`steptrace:${runid}`, []);
  }
  /** Returns the startupmeter samples of the profile workspace, newest first, for the cold start view. */
  async getstartupsamples() {
    return await this.adapter.get("startupsamples") ?? [];
  }
  /** Records one startupmeter sample: the cold start duration from the startup event to ready with the lazymods budget it spent. */
  async addstartupsample(sample) {
    await this.adapter.set("startupsamples", [sample, ...await this.getstartupsamples()]);
  }
  /** Returns the slowmo replay sessions of the profile workspace, newest first. */
  async getslomosessions() {
    return await this.adapter.get("slomosessions") ?? [];
  }
  /** Stores one slowmo replay session; the pauses link to their steptrace spans for inspection. */
  async setslomosession(session) {
    await this.adapter.set("slomosessions", [session, ...(await this.getslomosessions()).filter((candidate) => candidate.runid !== session.runid)]);
  }
  /** Returns the sessionreuse grants of the profile workspace with their consent prompts. */
  async getsessionreusegrants() {
    return await this.adapter.get("sessionreusegrants") ?? [];
  }
  /** Stores one sessionreuse grant; the authenticated profile attaches to a run only through its per profile consent prompt. */
  async addsessionreusegrant(grant) {
    await this.adapter.set("sessionreusegrants", [...(await this.getsessionreusegrants()).filter((candidate) => candidate.profile !== grant.profile), grant]);
  }
  /** Returns the artifactcompress records of the profile workspace for the at rest codec view. */
  async getartifactcompress() {
    return await this.adapter.get("artifactcompress") ?? [];
  }
  /** Stores one artifactcompress record: the codec of the stored artifact with its lazy read flag. */
  async addartifactcompress(record) {
    await this.adapter.set("artifactcompress", [...(await this.getartifactcompress()).filter((candidate) => candidate.artifactid !== record.artifactid), record]);
  }
  /** Returns the run lifecycle record of one run id of the 1.1.70 resilience family. */
  async getrunrecord(runid) {
    return (await this.adapter.get("runs") ?? []).find((record) => record.runid === runid);
  }
  /** Persists one run lifecycle record; the run state survives every service worker restart through the adapter. */
  async setrunrecord(record) {
    await this.adapter.set("runs", [...(await this.adapter.get("runs") ?? []).filter((candidate) => candidate.runid !== record.runid), record]);
  }
  /** Returns every stored run record by recency, newest first. */
  async listruns() {
    return [...await this.adapter.get("runs") ?? []].sort((one, two) => two.updatedat - one.updatedat);
  }
  /** Returns the latest checkpoint of one run; a run without a checkpoint carries none. */
  async getcheckpoint(runid) {
    return (await this.adapter.get("checkpoints") ?? []).find((record) => record.runid === runid);
  }
  /** Persists the latest checkpoint of one run; every newer checkpoint replaces the stored one. */
  async setcheckpoint(record) {
    await this.adapter.set("checkpoints", [...(await this.adapter.get("checkpoints") ?? []).filter((candidate) => candidate.runid !== record.runid), record]);
  }
  /** Returns the offlinequeue of approved plans waiting for connectivity; the queue survives every restart through the adapter. */
  async getqueue() {
    return await this.adapter.get("offlinequeue") ?? [];
  }
  /** Persists the offlinequeue; the replay drains it in sequence order once connectivity returns. */
  async setqueue(queue) {
    await this.adapter.set("offlinequeue", queue);
  }
  /** Returns the latest heartbeat record of one run. */
  async getheartbeat(runid) {
    return (await this.adapter.get("heartbeats") ?? []).find((record) => record.runid === runid);
  }
  /** Persists the latest heartbeat record of one run; every beat replaces the stored one. */
  async setheartbeat(record) {
    await this.adapter.set("heartbeats", [...(await this.adapter.get("heartbeats") ?? []).filter((candidate) => candidate.runid !== record.runid), record]);
  }
  /** Records one rollback item of a failed or cancelled run; the compensating steps stay for the audit trail. */
  async addrollback(item) {
    await this.adapter.set("rollbackitems", [item, ...await this.adapter.get("rollbackitems") ?? []]);
  }
  /** Returns the rollback items of one run, newest first; a run without a rollback carries none. */
  async listrollbacks(runid) {
    return (await this.adapter.get("rollbackitems") ?? []).filter((item) => item.runid === runid);
  }
  /** Returns the user configured heartbeat staleness window; an absent window keeps the documented roadmap default because the window stays a user choice. */
  async getheartbeatwindow() {
    return (await this.getsettings())?.heartbeatwindow;
  }
  /** Persists the user configured heartbeat staleness window; the zombiecheck reads it with no code ceiling. */
  async setheartbeatwindow(window) {
    const settings = await this.getsettings() ?? {};
    await this.setsettings({ ...settings, heartbeatwindow: window });
  }
  /** Returns the user configured offline queue depth; an absent depth keeps the queue unbounded because the depth stays a user choice. */
  async getqueuedepthsetting() {
    return (await this.getsettings())?.queuedepth;
  }
  /** Persists the user configured offline queue depth; the depth reports and never refuses a queued plan. */
  async setqueuedepthsetting(depth) {
    const settings = await this.getsettings() ?? {};
    await this.setsettings({ ...settings, queuedepth: depth });
  }
  /** Prunes the failed and reaped run records past the user configured retention window; every run of another state stays and an absent window keeps every failed run for the audit trail. */
  async pruneruns(retention, now) {
    const runs = await this.listruns();
    if (retention === void 0) return { kept: runs, pruned: [] };
    const expired = runs.filter((run) => run.state === "failed" && now - run.updatedat >= retention);
    if (expired.length === 0) return { kept: runs, pruned: [] };
    const prunedids = new Set(expired.map((run) => run.runid));
    const kept = runs.filter((run) => !prunedids.has(run.runid));
    await this.adapter.set("runs", kept);
    return { kept, pruned: [...prunedids] };
  }
  /** Returns the idempotencykeys one run already executed so replays deduplicate on them. */
  async getexecutedkeys(runid) {
    return (await this.adapter.get("executedkeys") ?? []).find((entry) => entry.runid === runid)?.keys ?? [];
  }
  /** Records one executed idempotencykey of a run; a replay of the same key skips the duplicate. */
  async addexecutedkey(runid, key) {
    const entries = (await this.adapter.get("executedkeys") ?? []).filter((entry) => entry.runid !== runid);
    await this.adapter.set("executedkeys", [...entries, { runid, keys: [...await this.getexecutedkeys(runid), key] }]);
  }
  /** Returns the urlhistory of one run: one urlvisit per completed navigation with consecutive duplicates folded, scoped per run and never merged across runs. */
  async getvisits(runid) {
    return await this.adapter.get(`visits:${runid}`) ?? [];
  }
  /** Persists the urlhistory of one run; the visits survive every service worker restart through the adapter. */
  async setvisits(runid, visits) {
    await this.adapter.set(`visits:${runid}`, visits);
  }
  /** Returns the runtimeline stream of one run: the merged step results, audit events and url visits in their timestamp order. */
  async getruntimeline(runid) {
    return await this.adapter.get(`runtimeline:${runid}`) ?? [];
  }
  /** Persists the runtimeline stream of one run; the timeline view and the audit export read the same stream. */
  async setruntimeline(runid, events) {
    await this.adapter.set(`runtimeline:${runid}`, events);
  }
  /** Appends one runtimeline event to the stream of its run without reading the whole stream back. */
  async appendtimelineevent(event) {
    await this.setruntimeline(event.runid, [...await this.getruntimeline(event.runid), event]);
  }
  /** Returns the sessionlock of one session; a session without a lock carries none. */
  async getlock(sessionid) {
    return (await this.adapter.get("sessionlocks") ?? []).find((record) => record.sessionid === sessionid);
  }
  /** Persists the sessionlock of one session; every newer lock replaces the stored one and the lock survives every restart. */
  async setlock(lock) {
    await this.adapter.set("sessionlocks", [...(await this.adapter.get("sessionlocks") ?? []).filter((candidate) => candidate.sessionid !== lock.sessionid), lock]);
  }
  /** Clears the sessionlock of one session on completion, failure or cancel; the next reviewed run may acquire it again. */
  async clearlock(sessionid) {
    await this.adapter.set("sessionlocks", [...(await this.adapter.get("sessionlocks") ?? []).filter((candidate) => candidate.sessionid !== sessionid)]);
  }
  /** Returns every stored sessionlock; the startup pass reads them to expire the abandoned ones. */
  async listlocks() {
    return await this.adapter.get("sessionlocks") ?? [];
  }
  /** Returns the isolated tabstate of one tabid; a tab without an isolated namespace carries none. */
  async gettabstate(tabid) {
    return (await this.adapter.get("tabstates") ?? []).find((state) => state.tabid === tabid);
  }
  /** Stores the isolated tabstate of one tabid: the namespace, its copied config snapshot and the run it serves. */
  async settabstate(state) {
    await this.adapter.set("tabstates", [...(await this.adapter.get("tabstates") ?? []).filter((candidate) => candidate.tabid !== state.tabid), state]);
  }
  /** Returns every stored memory item of the profile workspace wrapped with its provenance record. */
  async getmemoryitems() {
    return await this.adapter.get("memoryitems") ?? [];
  }
  /** Stores one memory item wrapped with its provenance; the stored value encrypts at rest when the item carries its encrypted flag while the derived key itself never persists. */
  async setmemoryitem(item) {
    await this.adapter.set("memoryitems", [...(await this.getmemoryitems()).filter((candidate) => candidate.key !== item.key), item]);
  }
  /** Removes one memory item from the store; the purge keeps its summary and its provenance for the audit trail. */
  async removememoryitems(keys) {
    const gone = new Set(keys);
    await this.adapter.set("memoryitems", (await this.getmemoryitems()).filter((item) => !gone.has(item.key)));
  }
  /** Returns the user configured expiryrules of the memory workspace; an absent list keeps every item unexpired. */
  async getexpiry() {
    return await this.adapter.get("expiryrules") ?? [];
  }
  /** Persists the user configured expiryrules; every lifetime stays the user's choice with no forced ceiling. */
  async setexpiry(rules) {
    await this.adapter.set("expiryrules", rules);
  }
  /** Returns the quotareport of the last quotawatch pass; a fresh workspace carries none. */
  async getquotareport() {
    return await this.adapter.get("quotareport");
  }
  /** Persists the quotareport after each quotawatch pass; the cleanup candidates stay ranked for the next pass. */
  async setquotareport(report) {
    await this.adapter.set("quotareport", report);
  }
  /** Returns the at rest encryption flag of the memory workspace; the derived key never persists beside it. */
  async getencryptrest() {
    return (await this.getsettings())?.encryptrest === true;
  }
  /** Persists the at rest encryption flag of the memory workspace; the secret entry stays a consent prompt and the key stays in memory for the pass alone. */
  async setencryptrest(enabled) {
    const settings = await this.getsettings() ?? {};
    await this.setsettings({ ...settings, encryptrest: enabled });
  }
  /** Records one purge summary of the expirememory pass; the summary and the provenance of every purged item stay for the audit trail. */
  async addpurgesummary(summary) {
    await this.adapter.set("purgesummaries", [summary, ...await this.adapter.get("purgesummaries") ?? []]);
  }
  /** Returns the purge summaries of the expirememory passes, newest first; the values left while their provenance stays. */
  async listpurgesummaries() {
    return await this.adapter.get("purgesummaries") ?? [];
  }
  /** Returns the timestamp of the last expirememory pass; the interval pass reads it to decide whether the user interval passed. */
  async getlastexpirepass() {
    return await this.adapter.get("lastexpirepass");
  }
  /** Persists the timestamp of one expirememory pass. */
  async setlastexpirepass(at) {
    await this.adapter.set("lastexpirepass", at);
  }
  /** Returns one fleet agentrecord of the 1.1.72 family by its id; an unknown agent carries none. */
  async getagent(agentid) {
    return (await this.adapter.get("fleet") ?? []).find((record) => record.id === agentid);
  }
  /** Persists one fleet agentrecord; every newer record replaces the stored one and the registry survives every restart. */
  async setagent(record) {
    await this.adapter.set("fleet", [...(await this.adapter.get("fleet") ?? []).filter((candidate) => candidate.id !== record.id), record]);
  }
  /** Returns the fleet registry with its names, roles, origins and control states; the sidepanel and the protocol boundary read the same list. */
  async listagents() {
    return [...await this.adapter.get("fleet") ?? []].sort((one, two) => two.registeredat - one.registeredat);
  }
  /** Returns the budgetstate of one agent; an agent without a granted budget carries none. */
  async getbudget(agentid) {
    return (await this.adapter.get("agentbudgets") ?? []).find((state) => state.agentid === agentid);
  }
  /** Returns the fleet scope of one agent; an agent without a configured scope stays unbounded inside the session grants. */
  async getagentscope(agentid) {
    return (await this.adapter.get("agentscopes") ?? []).find((scope) => scope.agentid === agentid);
  }
  /** Persists the fleet scope of one agent; the intersection result with the session grants stays beside the registry. */
  async setagentscope(scope) {
    await this.adapter.set("agentscopes", [...(await this.adapter.get("agentscopes") ?? []).filter((candidate) => candidate.agentid !== scope.agentid), scope]);
  }
  /** Persists the budgetstate of one agent; every spend updates the stored state and every ceiling stays the user's choice. */
  async setbudget(state) {
    await this.adapter.set("agentbudgets", [...(await this.adapter.get("agentbudgets") ?? []).filter((candidate) => candidate.agentid !== state.agentid), state]);
  }
  /** Returns every stored fleet review record with the open ones first; the verdict controls read the same records. */
  async getreviews() {
    return [...await this.adapter.get("fleetreviews") ?? []].sort((one, two) => (one.state === "open" ? 0 : 1) - (two.state === "open" ? 0 : 1) || two.requestedat - one.requestedat);
  }
  /** Persists one fleet review record with the reviewer verdict recorded beside the original output. */
  async setreview(record) {
    await this.adapter.set("fleetreviews", [...(await this.adapter.get("fleetreviews") ?? []).filter((candidate) => candidate.id !== record.id), record]);
  }
  /** Returns the runreplay captures of one agent, newest first; the audit view and the reconstruction read the same captures. */
  async getreplays(agentid) {
    return [...await this.adapter.get(`fleetreplays:${agentid}`) ?? []].sort((one, two) => two.capturedat - one.capturedat);
  }
  /** Persists one runreplay capture per agent under the user configured replayretention window; an absent window keeps every capture of every agent. */
  async setreplay(record, retention) {
    const kept = [record, ...(await this.getreplays(record.agentid)).filter((candidate) => candidate.id !== record.id)];
    await this.adapter.set(`fleetreplays:${record.agentid}`, retention === void 0 ? kept : kept.slice(0, retention));
  }
  /** Returns every stored output comparison, newest first; the side by side view reads the same records. */
  async getcomparison() {
    return [...await this.adapter.get("fleetcomparisons") ?? []].sort((one, two) => two.comparedat - one.comparedat);
  }
  /** Persists one output comparison record; the field by field alignment stays for the audit trail. */
  async setcomparison(record) {
    await this.adapter.set("fleetcomparisons", [...(await this.adapter.get("fleetcomparisons") ?? []).filter((candidate) => candidate.id !== record.id), record]);
  }
  /** Returns every stored consensus record with the open rounds first; the vote tally view reads the same records. */
  async getvotes() {
    const records = await this.adapter.get("fleetvotes") ?? [];
    return [...records].sort((one, two) => (one.outcome === "open" ? 0 : 1) - (two.outcome === "open" ? 0 : 1) || Math.max(...two.votes.map((vote) => vote.castat), 0) - Math.max(...one.votes.map((vote) => vote.castat), 0));
  }
  /** Persists one consensus record; the votes, the tally and the outcome stay for the audit trail with every dissenting vote. */
  async setvote(record) {
    await this.adapter.set("fleetvotes", [...(await this.adapter.get("fleetvotes") ?? []).filter((candidate) => candidate.id !== record.id), record]);
  }
  /** Returns the timestamp of the last killswitch stop; the fleet view reads it to name when the user last halted everything. */
  async getkillswitchat() {
    return await this.adapter.get("killswitchat");
  }
  /** Persists the timestamp of one killswitch stop; one audit event per stopped agent lands beside it. */
  async setkillswitchat(at) {
    await this.adapter.set("killswitchat", at);
  }
  /** Returns the paused fleet agents by id; the executor skips only their queues while the peers keep running. */
  async getpausedagents() {
    return (await this.adapter.get("fleet") ?? []).filter((record) => record.state === "paused").map((record) => record.id);
  }
  /** Returns the spawn lineage of the 1.1.73 family: every fleet spawnrecord with its parent, child, depth and parent objective, newest first. */
  async getspawn() {
    return [...await this.adapter.get("fleetspawns") ?? []].sort((one, two) => two.at - one.at);
  }
  /** Persists one fleet spawnrecord of the lineage; every newer spawn replaces the stored one and the lineage survives every restart. */
  async setspawn(record) {
    await this.adapter.set("fleetspawns", [...(await this.adapter.get("fleetspawns") ?? []).filter((candidate) => candidate.id !== record.id), record]);
  }
  /** Returns every stored fleet aggregaterecord with the open ones first; the merged reports read newest first after them. */
  async getaggregate() {
    return [...await this.adapter.get("fleetaggregates") ?? []].sort((one, two) => (one.state === "open" ? 0 : 1) - (two.state === "open" ? 0 : 1) || two.createdat - one.createdat);
  }
  /** Persists one fleet aggregaterecord under the user configured aggregateretention window; an absent window keeps every merged report for the audit trail. */
  async setaggregate(record, retention) {
    const kept = [record, ...(await this.getaggregate()).filter((candidate) => candidate.id !== record.id)];
    await this.adapter.set("fleetaggregates", retention === void 0 ? kept : kept.slice(0, retention));
  }
  /** Returns the stored interleaved fleet timeline ordered by event time; the merged lanes read the same events. */
  async getinterleaved() {
    return [...await this.adapter.get("fleetinterleave") ?? []].sort((one, two) => two.at - one.at);
  }
  /** Persists the interleaved fleet timeline under the user configured interleveretention window; an absent window keeps every interleaved event. */
  async setinterleaved(events, retention) {
    await this.adapter.set("fleetinterleave", retention === void 0 ? events : events.slice(0, retention));
  }
  /** Returns every stored lesson of the lessonshare, the most reused first; the matching pass reads the same records. */
  async getlessons() {
    return [...await this.adapter.get("fleetlessons") ?? []].sort((one, two) => two.reusecount - one.reusecount || two.recordedat - one.recordedat);
  }
  /** Persists one lessonrecord of the lessonshare; the sanitized finding stays for every agent that serves it. */
  async setlesson(lesson) {
    await this.adapter.set("fleetlessons", [...(await this.adapter.get("fleetlessons") ?? []).filter((candidate) => candidate.id !== lesson.id), lesson]);
  }
  /** Returns every stored arbitration case with the open and granted ones first; the verdict view reads the same cases. */
  async getcases() {
    return [...await this.adapter.get("fleetcases") ?? []].sort((one, two) => (one.state === "released" ? 1 : 0) - (two.state === "released" ? 1 : 0) || two.openedat - one.openedat);
  }
  /** Persists one arbitrationcase with its verdict; the release keeps the closed case for the audit trail. */
  async setcase(record) {
    await this.adapter.set("fleetcases", [...(await this.adapter.get("fleetcases") ?? []).filter((candidate) => candidate.id !== record.id), record]);
  }
  /** Returns the user configured priority lanes of the task queue; the drain order reads the same lanes. */
  async getlanes() {
    return await this.adapter.get("fleetlanes") ?? [];
  }
  /** Persists the priority lanes of the task queue; the lane order and the interactive protection stay the user's choice. */
  async setlane(lanes) {
    await this.adapter.set("fleetlanes", lanes);
  }
  /** Returns the latest loadreport per origin; the scaleworkers pass reads the same samples. */
  async getload() {
    return (await this.adapter.get("fleetload") ?? []).sort((one, two) => two.sampledat - one.sampledat);
  }
  /** Persists one loadreport sample per origin; every newer sample replaces the stored one of its origin. */
  async setload(report) {
    await this.adapter.set("fleetload", [report, ...(await this.adapter.get("fleetload") ?? []).filter((candidate) => candidate.origin !== report.origin)].slice(0, 32));
  }
  /** Returns the shared fleet cost ledger, newest first; the split pass reads the same entries. */
  async getcosts() {
    return [...await this.adapter.get("fleetcosts") ?? []].sort((one, two) => two.at - one.at);
  }
  /** Persists one costentry of the shared ledger attributed to its agent; the accounting stays local and read only. */
  async setcost(entry) {
    await this.adapter.set("fleetcosts", [entry, ...await this.adapter.get("fleetcosts") ?? []].slice(0, 512));
  }
  /** Returns the user configured depthlimit of the sub agent recursion; an absent limit stays unbounded because the ceiling stays the user's choice. */
  async getdepthlimit() {
    return await this.adapter.get("fleetdepthlimit");
  }
  /** Persists the user configured depthlimit of the sub agent recursion; the spawn gates read it exactly. */
  async setdepthlimit(limit) {
    await this.adapter.set("fleetdepthlimit", limit);
  }
  /** Returns the stored closed tab records of the 1.1.74 family, newest first; the reopening path reads the same records after its grant recheck. */
  async getclosedtabrecords() {
    return [...await this.adapter.get("closedtabrecords") ?? []].sort((one, two) => two.closedat - one.closedat);
  }
  /** Persists one closedtabrecord of a closed tab under the user configured closedtabretention window in milliseconds; an absent window keeps every record while a reopened record keeps its stamp for the audit trail. */
  async addclosedtabrecord(record, retention) {
    const stored = (await this.getclosedtabrecords()).filter((candidate) => candidate.id !== record.id);
    const kept = retention !== void 0 && Number.isFinite(retention) && retention > 0 ? stored.filter((candidate) => record.closedat - candidate.closedat <= retention) : stored;
    await this.adapter.set("closedtabrecords", [record, ...kept]);
  }
  /** Stamps one closedtabrecord as reopened so a reopened record never reopens twice while the retention window keeps it for the audit trail. */
  async setclosedtabrecord(record) {
    await this.adapter.set("closedtabrecords", [record, ...(await this.getclosedtabrecords()).filter((candidate) => candidate.id !== record.id)]);
  }
  /** Returns the navigation trail of one run: every navtrailentry the run captured in order; the audit and the on demand replay read the same entries. */
  async getnavtrail(runid) {
    return await this.adapter.get(`navtrails:${runid}`) ?? [];
  }
  /** Persists one navtrailentry of the run trail; an entry the trail already carries stays once so repeated restores never double it. */
  async addnavtrailentry(runid, entry) {
    const records = await this.getnavtrail(runid);
    if (records.some((item) => item.url === entry.url && item.stepid === entry.stepid && item.at === entry.at)) return;
    await this.adapter.set(`navtrails:${runid}`, [...records, entry]);
  }
  /** Returns the live navigation rate windows per domain of the 1.1.74 family; the sliding windows survive restarts through the same records. */
  async getnavratelimits() {
    return await this.adapter.get("navratelimits") ?? [];
  }
  /** Persists one navigation rate window per domain; every newer window replaces the stored one of its domain. */
  async setnavratelimitwindow(window) {
    await this.adapter.set("navratelimits", [...(await this.adapter.get("navratelimits") ?? []).filter((candidate) => candidate.domain !== window.domain), window]);
  }
  /** Returns the stored deep link patterns of the 1.1.74 family; the deeplinkapp builder reads the same patterns beside its built in catalog. */
  async getdeeplinks() {
    return await this.adapter.get("deeplinkpatterns") ?? [];
  }
  /** Persists one deeplinkpattern; a stored pattern of the same app and route gives way to the newer one. */
  async setdeeplink(pattern) {
    await this.adapter.set("deeplinkpatterns", [...(await this.adapter.get("deeplinkpatterns") ?? []).filter((candidate) => !(candidate.app === pattern.app && candidate.route === pattern.route)), pattern]);
  }
  /** Returns the safety verdict history of the 1.1.74 family, newest first; the ui shows the same verdicts with their reasons before anything opens. */
  async getsafety() {
    return [...await this.adapter.get("safetyverdicts") ?? []].sort((one, two) => two.at - one.at);
  }
  /** Persists one safetyverdict of the checksafeurl history; every refusal keeps its reasons for the audit trail. */
  async setsafetyverdict(verdict) {
    await this.adapter.set("safetyverdicts", [verdict, ...await this.adapter.get("safetyverdicts") ?? []].slice(0, 256));
  }
  /** Returns the stored prefetchplan of the latest navintent pass; the predictions survive restarts so the warming resumes from the same set. */
  async getprefetch() {
    return this.adapter.get("prefetchplans");
  }
  /** Persists the prefetchplan of the latest navintent pass; a changed plan replaces the stored predictions because stale predictions never warm a page. */
  async setprefetch(plan) {
    return this.adapter.set("prefetchplans", plan);
  }
  /** Returns the navpause state with its pending url; the freeze and its queued navigation survive restarts through the same record. */
  async getnavpause() {
    return this.adapter.get("navpauserecord");
  }
  /** Persists the navpause state with its pending url; the queued navigation waits for the answer of the consent prompt across restarts. */
  async setnavpause(pause) {
    return this.adapter.set("navpauserecord", pause);
  }
  /** Returns the extractpipelines of the 1.1.75 family, newest first; a run id narrows the read to its own pipelines so the resume and the view read exactly their own extraction. */
  async getpipeline(runid) {
    const records = (await this.adapter.get("extractpipelines") ?? []).sort((one, two) => two.updatedat - one.updatedat);
    return runid !== void 0 && runid.trim() !== "" ? records.filter((record) => record.runid === runid) : records;
  }
  /** Persists one extractpipeline per run; every newer pipeline of the same id replaces the stored one so the pipeline state survives restarts. */
  async setpipeline(pipeline) {
    await this.adapter.set("extractpipelines", [pipeline, ...(await this.adapter.get("extractpipelines") ?? []).filter((candidate) => candidate.id !== pipeline.id)]);
  }
  /** Returns the streamcursor of one pipeline; the checkpointed position survives restarts so the resume continues exactly where the stream stopped. */
  async getcursor(pipelineid) {
    return this.adapter.get(`streamcursor:${pipelineid}`);
  }
  /** Persists the streamcursor of one pipeline after every chunk; the cursor checkpoints ride the same adapter so an interrupted stream never writes a row twice. */
  async setcursor(cursor) {
    await this.adapter.set(`streamcursor:${cursor.pipelineid}`, cursor);
  }
  /** Returns the stored transformrule list of one run; the pipeline layer applies only the rules the run review approved. */
  async gettransforms(runid) {
    return await this.adapter.get(`pipelinetransforms:${runid}`) ?? [];
  }
  /** Persists the transformrule list of one run; every newer list replaces the stored one so the transforms stay the reviewed set. */
  async settransforms(runid, rules) {
    await this.adapter.set(`pipelinetransforms:${runid}`, rules);
  }
  /** Returns the stored preview extractbatches of the 1.1.75 family, newest first; the grid preview reads the same batches without ever touching the stored extract. */
  async getrows() {
    return [...await this.adapter.get("previewbatches") ?? []].sort((one, two) => two.at - one.at);
  }
  /** Persists the latest preview extractbatch under the user configured previewretention window in milliseconds; an absent window keeps every batch for the audit trail. */
  async setrows(batch, retention) {
    const kept = [batch, ...(await this.adapter.get("previewbatches") ?? []).filter((candidate) => candidate.id !== batch.id)];
    await this.adapter.set("previewbatches", retention !== void 0 && Number.isFinite(retention) && retention > 0 ? kept.slice(0, retention) : kept);
  }
  /** Returns the provlog entries of one run in append order; the provenance queries read the same append only log. */
  async getprovlog(runid) {
    return (await this.adapter.get(`provlog:${runid}`) ?? []).sort((one, two) => one.at - two.at || (one.id < two.id ? -1 : 1));
  }
  /** Appends one provlogentry to the run log; the log stays append only — an entry whose id already sits in the log never rewrites — so the audit integrity holds across restarts. */
  async addprovlogentry(runid, entry) {
    const records = await this.getprovlog(runid);
    if (records.some((candidate) => candidate.id === entry.id)) return;
    await this.adapter.set(`provlog:${runid}`, [...records, entry]);
  }
  /** Returns the samplepolicy of one plan; the preview reads the row count and the strategy the user configured for exactly this plan. */
  async getsamplepolicy(planid) {
    return this.adapter.get(`samplepolicy:${planid}`);
  }
  /** Persists the samplepolicy of one plan; the row count stays a user choice with no code ceiling. */
  async setsamplepolicy(planid, policy) {
    await this.adapter.set(`samplepolicy:${planid}`, policy);
  }
  /** Returns the stored dedupereports of the 1.1.75 family, newest first; a run id narrows the read to its own passes. */
  async getdedupereports(runid) {
    const records = [...await this.adapter.get("dedupereports") ?? []].sort((one, two) => two.at - one.at);
    return runid !== void 0 && runid.trim() !== "" ? records.filter((record) => record.runid === runid) : records;
  }
  /** Persists one dedupereport with its dropped counts and dropped row keys; every pass keeps its report for the audit trail. */
  async setdedupereport(report) {
    await this.adapter.set("dedupereports", [report, ...(await this.adapter.get("dedupereports") ?? []).filter((candidate) => candidate.id !== report.id)]);
  }
  /** Returns the stream file metadata of the 1.1.75 family, newest first; the cleanup after a run reads exactly the disk sinks its pipelines streamed to. */
  async getstreamfiles(runid) {
    const records = [...await this.adapter.get("streamfiles") ?? []].sort((one, two) => two.at - one.at);
    return runid !== void 0 && runid.trim() !== "" ? records.filter((record) => record.runid === runid) : records;
  }
  /** Persists one streamfilerecord for the cleanup after its run; the metadata carries the filename inside the runid namespace and never the row payloads. */
  async addstreamfile(record) {
    await this.adapter.set("streamfiles", [record, ...(await this.adapter.get("streamfiles") ?? []).filter((candidate) => candidate.id !== record.id)]);
  }
  /** Returns the sourcestamprecords of one run, newest first; the stamps sit beside their rows so every cell answers the page and step that captured it. */
  async getsourcestamps(runid) {
    return (await this.adapter.get(`sourcestamps:${runid}`) ?? []).sort((one, two) => two.capturedat - one.capturedat);
  }
  /** Persists the sourcestamprecords of one run; a stamp never rewrites after stamping so the capture timestamps stay immutable. */
  async setsourcestamps(runid, stamps) {
    await this.adapter.set(`sourcestamps:${runid}`, stamps);
  }
  /** Returns one stored event subscription of the 1.1.76 family by its id; the record carries its lasteventid so a reconnect resumes exactly where the stream stopped. */
  async getsubscription(id) {
    return (await this.getsubscriptions()).find((record) => record.id === id);
  }
  /** Returns the per run cached responses of the 1.1.76 family, newest first; a run id narrows the read to its own namespace because every cache key embeds the run it serves. */
  async getcache(runid) {
    const records = (await this.adapter.get("webapicache") ?? []).sort((one, two) => two.at - one.at);
    return runid !== void 0 && runid.trim() !== "" ? records.filter((entry) => entry.runid === runid) : records;
  }
  /** Persists one cached response of the 1.1.76 family under the user configured cacheretention window in entries; an absent window keeps every cacheentry of the run until the run ends. */
  async setcacheentry(entry, retention) {
    const kept = [entry, ...(await this.adapter.get("webapicache") ?? []).filter((candidate) => candidate.key !== entry.key)];
    await this.adapter.set("webapicache", retention !== void 0 && Number.isFinite(retention) && retention > 0 ? kept.slice(0, retention) : kept);
  }
  /** Runs the cache expiry cleanup pass of the 1.1.76 family: every entry whose expiry passed drops while its metadata stays with the caller for the audit trail; an absent pass keeps every unexpired entry. */
  async expirycachepass(now) {
    const records = await this.adapter.get("webapicache") ?? [];
    const kept = records.filter((entry) => entry.expiry === void 0 || now < entry.expiry);
    const expired = records.filter((entry) => entry.expiry !== void 0 && now >= entry.expiry);
    if (expired.length > 0) await this.adapter.set("webapicache", kept);
    return { kept, expired };
  }
  /** Returns the per run correlation map of the 1.1.76 family; the request map stays read only inside the run and exports to the audit trail as one map. */
  async getcorrelation(runid) {
    return this.adapter.get(`webapicorrelation:${runid}`);
  }
  /** Persists the per run correlation map of the 1.1.76 family; every assigned request id and every joined response pair survive restarts through the same record. */
  async setcorrelation(context) {
    await this.adapter.set(`webapicorrelation:${context.runid}`, context);
  }
  /** Returns the stored ratelimitdirective records of the 1.1.76 family per origin whose reset window has not passed; expired directives drop out at their reset windows, composed beside the ratelimitread family. */
  async getratelimitdirectives(now) {
    const records = await this.adapter.get("webapiratelimits") ?? [];
    const live = records.filter((directive) => directive.resetat > now);
    if (live.length !== records.length) await this.adapter.set("webapiratelimits", live);
    return live;
  }
  /** Persists one ratelimitdirective of the 1.1.76 family per origin and scope, replacing the previous directive of the same origin and scope. */
  async setratelimitdirective(directive) {
    const records = (await this.adapter.get("webapiratelimits") ?? []).filter((candidate) => !(candidate.origin === directive.origin && candidate.scope === directive.scope));
    await this.adapter.set("webapiratelimits", [directive, ...records]);
  }
  /** Returns the observed page api calls of the 1.1.76 family, newest first; a run id narrows the read to its own observations while the records stay read only beside the discovered api map. */
  async getapicalls(runid) {
    const records = (await this.adapter.get("webapicalls") ?? []).sort((one, two) => two.at - one.at);
    return runid !== void 0 && runid.trim() !== "" ? records.filter((record) => record.runid === runid) : records;
  }
  /** Records one observed page api call of the 1.1.76 family under the user configured apicallretention window in records; an absent window keeps every apicallrecord for the audit trail. */
  async addapicall(record, retention) {
    const kept = [record, ...await this.adapter.get("webapicalls") ?? []];
    await this.adapter.set("webapicalls", retention !== void 0 && Number.isFinite(retention) && retention > 0 ? kept.slice(0, retention) : kept);
  }
  /** Returns the user configured poll choices of the 1.1.76 family: the timeout of one long poll request and the backoff between its retries; an absent choice leaves the poll unbounded because the bounds carry no code default. */
  async getpollchoices() {
    return await this.adapter.get("webapipollchoices") ?? {};
  }
  /** Persists the user configured poll choices of the 1.1.76 family; the timeout and the backoff stay exactly the user's values with no code default. */
  async setpollchoices(choices) {
    await this.adapter.set("webapipollchoices", choices);
  }
  /** Returns the stored ocr results of the 1.1.77 family, newest first; a run id narrows the read to its own recognitions. */
  async getocrs(runid) {
    const records = (await this.adapter.get("visionocr") ?? []).sort((one, two) => two.at - one.at);
    return runid !== void 0 && runid.trim() !== "" ? records.filter((record) => record.runid === runid) : records;
  }
  /** Records one ocr result of the 1.1.77 family under the user configured visionretention window in records; an absent window keeps every ocrresult for the audit trail. */
  async addocr(record, retention) {
    const kept = [record, ...await this.adapter.get("visionocr") ?? []];
    await this.adapter.set("visionocr", retention !== void 0 && Number.isInteger(retention) && retention > 0 ? kept.slice(0, retention) : kept);
  }
  /** Returns the stored vision descriptions of the 1.1.77 family, newest first; a run id narrows the read to its own model answers. */
  async getvisions(runid) {
    const records = (await this.adapter.get("visiondescriptions") ?? []).sort((one, two) => two.at - one.at);
    return runid !== void 0 && runid.trim() !== "" ? records.filter((record) => record.runid === runid) : records;
  }
  /** Records one vision description of the 1.1.77 family under the user configured visionretention window in records; an absent window keeps every visiondescription for the audit trail. */
  async addvision(record, retention) {
    const kept = [record, ...await this.adapter.get("visiondescriptions") ?? []];
    await this.adapter.set("visiondescriptions", retention !== void 0 && Number.isInteger(retention) && retention > 0 ? kept.slice(0, retention) : kept);
  }
  /** Returns the stored redaction masks of the 1.1.77 family, newest first; a run id narrows the read to its own masks while the mask evidence always survives for the audit trail. */
  async getmasks(runid) {
    const records = (await this.adapter.get("visionmasks") ?? []).sort((one, two) => two.at - one.at);
    return runid !== void 0 && runid.trim() !== "" ? records.filter((record) => record.runid === runid) : records;
  }
  /** Records one redaction mask of the 1.1.77 family under the user configured visionretention window in records; an absent window keeps every redactionmask because the mask evidence answers the audit. */
  async addmask(record, retention) {
    const kept = [record, ...await this.adapter.get("visionmasks") ?? []];
    await this.adapter.set("visionmasks", retention !== void 0 && Number.isInteger(retention) && retention > 0 ? kept.slice(0, retention) : kept);
  }
  /** Returns the stored screenshot pairs of the 1.1.77 family, newest first; the name composes with screenshotpair because the getpairs accessor of the 1.1.40 family already serves the beforeafter shotpair records — the same house rule of composed names on collision. */
  async getscreenshotpairs(runid) {
    const records = (await this.adapter.get("visionscreenshotpairs") ?? []).sort((one, two) => two.at - one.at);
    return runid !== void 0 && runid.trim() !== "" ? records.filter((record) => record.runid === runid) : records;
  }
  /** Records one screenshot pair of the 1.1.77 family under the user configured visionretention window in records; an absent window keeps every screenshotpair for the audit trail. */
  async addscreenshotpair(record, retention) {
    const kept = [record, ...await this.adapter.get("visionscreenshotpairs") ?? []];
    await this.adapter.set("visionscreenshotpairs", retention !== void 0 && Number.isInteger(retention) && retention > 0 ? kept.slice(0, retention) : kept);
  }
  /** Returns the stored grounding results of the 1.1.77 family, newest first; a run id narrows the read to its own groundings. */
  async getgroundings(runid) {
    const records = (await this.adapter.get("visiongroundings") ?? []).sort((one, two) => two.at - one.at);
    return runid !== void 0 && runid.trim() !== "" ? records.filter((record) => record.runid === runid) : records;
  }
  /** Records one grounding result of the 1.1.77 family under the user configured visionretention window in records; an absent window keeps every groundingresult for the audit trail. */
  async addgrounding(record, retention) {
    const kept = [record, ...await this.adapter.get("visiongroundings") ?? []];
    await this.adapter.set("visiongroundings", retention !== void 0 && Number.isInteger(retention) && retention > 0 ? kept.slice(0, retention) : kept);
  }
  /** Returns the stored frame reads of the 1.1.77 family, newest first; every framereference names the video selector and the position the run read so a frame position never re-reads blindly. */
  async getframereads(runid) {
    const records = (await this.adapter.get("visionframereads") ?? []).sort((one, two) => two.at - one.at);
    return runid !== void 0 && runid.trim() !== "" ? records.filter((record) => record.runid === runid) : records;
  }
  /** Records one frame read of the 1.1.77 family under the user configured frameretention window in milliseconds; a repeated read of the same selector and position replaces its record while an absent window keeps every framereference for the audit trail. */
  async addframeread(record, retention) {
    const previous = await this.adapter.get("visionframereads") ?? [];
    const fresh = retention !== void 0 && Number.isFinite(retention) && retention > 0 ? previous.filter((candidate) => record.at - candidate.at < retention) : previous;
    await this.adapter.set("visionframereads", [record, ...fresh.filter((candidate) => !(candidate.runid === record.runid && candidate.selector === record.selector && candidate.positionms === record.positionms))]);
  }
  /** Returns the persisted vision model configuration of the 1.1.77 family: the model name and the endpoint the user configured; an absent configuration keeps the model calls refused because no recognition ships inside the extension. */
  async getvisionconfig() {
    return await this.adapter.get("visionconfig") ?? {};
  }
  /** Persists the vision model configuration of the 1.1.77 family; the model and the endpoint stay exactly the user's values with no code default. */
  async setvisionconfig(config) {
    await this.adapter.set("visionconfig", config);
  }
  /** Returns the stored visioncache entries of the 1.1.77 family keyed by their image hashes, newest first; a run id narrows the read to its own namespace. */
  async getvisioncache(runid) {
    const records = (await this.adapter.get("visioncache") ?? []).sort((one, two) => two.at - one.at);
    return runid !== void 0 && runid.trim() !== "" ? records.filter((entry) => entry.runid === runid) : records;
  }
  /** Persists one visioncache entry of the 1.1.77 family by its image hash; a newer entry of the same hash replaces the older one so one image hash answers one recognition. */
  async setvisioncacheentry(entry) {
    const kept = [entry, ...(await this.adapter.get("visioncache") ?? []).filter((candidate) => candidate.hash !== entry.hash)];
    await this.adapter.set("visioncache", kept);
  }
  /** Runs the visioncache expiry pass of the 1.1.77 family: every entry older than the user configured visioncacheretention window in milliseconds drops while its metadata stays with the caller for the audit trail; an absent window keeps every entry. */
  async expirevisioncachepass(now, retention) {
    const records = await this.adapter.get("visioncache") ?? [];
    const kept = records.filter((entry) => retention === void 0 || now - entry.at < retention);
    const expired = records.filter((entry) => retention !== void 0 && now - entry.at >= retention);
    if (expired.length > 0) await this.adapter.set("visioncache", kept);
    return { kept, expired };
  }
  /** Returns the vision call records of the 1.1.77 family, newest first; every call names whether it rode the configured model endpoint so the visioncost count answers the costshare ledger. */
  async getvisioncalls(runid) {
    const records = (await this.adapter.get("visioncalls") ?? []).sort((one, two) => two.at - one.at);
    return runid !== void 0 && runid.trim() !== "" ? records.filter((record) => record.runid === runid) : records;
  }
  /** Records one vision call of the 1.1.77 family; the call log stays local and read only because the costshare ledger answers the user alone. */
  async addvisioncall(record) {
    await this.adapter.set("visioncalls", [record, ...await this.adapter.get("visioncalls") ?? []]);
  }
  /** Returns the stored beforeafter pairs of the 1.1.78 family, newest first; the name composes with beforeafter because the getpairs accessor of the 1.1.40 family already serves the shotpair records — the same house rule of composed names on collision. */
  async getbeforeafters(runid) {
    const records = (await this.adapter.get("forensicpairs") ?? []).sort((one, two) => two.at - one.at);
    return runid !== void 0 && runid.trim() !== "" ? records.filter((record) => record.runid === runid) : records;
  }
  /** Records one beforeafter pair of the 1.1.78 family under the user configured forensicretention window in records; an absent window keeps every pair for the audit trail. */
  async addbeforeafter(record, retention) {
    const kept = [record, ...await this.adapter.get("forensicpairs") ?? []];
    await this.adapter.set("forensicpairs", retention !== void 0 && Number.isInteger(retention) && retention > 0 ? kept.slice(0, retention) : kept);
  }
  /** Replaces the stored beforeafter pairs after the user cleanup pass of the 1.1.78 family; the prune answers the user configured retention alone and never a silent sweep. */
  async setbeforeafters(records) {
    await this.adapter.set("forensicpairs", records);
  }
  /** Returns the forensic console timeline of one run of the 1.1.78 family in capture order; the name composes with consoletimeline because the gettimeline accessor of the run timeline family and the consolediff of the console family already serve their own records. */
  async getconsoletimeline(runid) {
    return (await this.adapter.get(`forensicconsole:${runid}`) ?? []).sort((one, two) => one.sequence - two.sequence);
  }
  /** Records one console trace entry of the 1.1.78 family per run; the sequence numbers stamp in capture order so a page reload never resets the ordering while the retention answers the user choice alone. */
  async addconsoleentry(runid, entry, retention) {
    const kept = [...await this.adapter.get(`forensicconsole:${runid}`) ?? [], entry];
    await this.adapter.set(`forensicconsole:${runid}`, retention !== void 0 && Number.isInteger(retention) && retention > 0 ? kept.slice(-retention) : kept);
  }
  /** Returns the forensic net timeline of one run of the 1.1.78 family in capture order; the name composes with nettrace because the getnetlog accessor of the network family already serves the netlog records. */
  async getnettraces(runid) {
    return (await this.adapter.get(`forensicnet:${runid}`) ?? []).sort((one, two) => one.at - two.at);
  }
  /** Records one net trace entry of the 1.1.78 family per run; the correlation joining answers the correlateids map while the retention answers the user choice alone. */
  async addnettrace(runid, entry, retention) {
    const kept = [...await this.adapter.get(`forensicnet:${runid}`) ?? [], entry];
    await this.adapter.set(`forensicnet:${runid}`, retention !== void 0 && Number.isInteger(retention) && retention > 0 ? kept.slice(-retention) : kept);
  }
  /** Returns the stored diff baselines of the 1.1.78 family, newest first; the name composes with diffbase because the getdiffs accessor of the snapshot family already serves the snapshotdiff records. */
  async getdiffbases(runid) {
    const records = (await this.adapter.get("forensicdiffbases") ?? []).sort((one, two) => two.at - one.at);
    return runid !== void 0 && runid.trim() !== "" ? records.filter((record) => record.runid === runid) : records;
  }
  /** Persists one diff baseline of the 1.1.78 family; a new baseline of the same page state replaces the older one so one page state answers one frozen capture. */
  async setdiffbase(record) {
    const kept = [record, ...(await this.adapter.get("forensicdiffbases") ?? []).filter((candidate) => !(candidate.runid === record.runid && candidate.pagestate === record.pagestate))];
    await this.adapter.set("forensicdiffbases", kept);
  }
  /** Returns the stored diff results of the 1.1.78 family, newest first; a run id narrows the read to its own comparisons. */
  async getdiffresults(runid) {
    const records = (await this.adapter.get("forensicdiffresults") ?? []).sort((one, two) => two.at - one.at);
    return runid !== void 0 && runid.trim() !== "" ? records.filter((record) => record.runid === runid) : records;
  }
  /** Records one diff result of the 1.1.78 family under the user configured forensicretention window in records; an absent window keeps every diffresult for the audit trail. */
  async adddiffresult(record, retention) {
    const kept = [record, ...await this.adapter.get("forensicdiffresults") ?? []];
    await this.adapter.set("forensicdiffresults", retention !== void 0 && Number.isInteger(retention) && retention > 0 ? kept.slice(0, retention) : kept);
  }
  /** Replaces the stored diff results after the user cleanup pass of the 1.1.78 family; the prune answers the user configured retention alone and never a silent sweep. */
  async setdiffresults(records) {
    await this.adapter.set("forensicdiffresults", records);
  }
  /** Returns the stored thumbnails of the 1.1.78 family, newest first; every thumbnailrecord links back to its full capture through its captureid so the capture log shows the run at a glance. */
  async getthumbs(runid) {
    const records = (await this.adapter.get("forensicthumbs") ?? []).sort((one, two) => two.at - one.at);
    return runid !== void 0 && runid.trim() !== "" ? records.filter((record) => record.runid === runid) : records;
  }
  /** Records one thumbnail of the 1.1.78 family under the user configured forensicretention window in records; an absent window keeps every thumbnailrecord beside its full capture. */
  async addthumb(record, retention) {
    const kept = [record, ...await this.adapter.get("forensicthumbs") ?? []];
    await this.adapter.set("forensicthumbs", retention !== void 0 && Number.isInteger(retention) && retention > 0 ? kept.slice(0, retention) : kept);
  }
  /** Replaces the stored thumbnails after the user cleanup pass of the 1.1.78 family; the prune answers the user configured retention alone and never a silent sweep. */
  async setthumbs(records) {
    await this.adapter.set("forensicthumbs", records);
  }
  /** Returns the timelapse frame references of one run of the 1.1.78 family in their ordered sequence; the assembled lapse replays the page change in capture order. */
  async getlapse(runid) {
    return (await this.adapter.get(`forensiclapse:${runid}`) ?? []).sort((one, two) => one.sequence - two.sequence);
  }
  /** Appends one timelapse frame of the 1.1.78 family per run; the frame reference carries its ordered sequence number so a late stored frame lands in its place. */
  async addlapseframe(runid, frame) {
    const kept = [...(await this.adapter.get(`forensiclapse:${runid}`) ?? []).filter((candidate) => candidate.sequence !== frame.sequence), frame];
    await this.adapter.set(`forensiclapse:${runid}`, kept);
  }
  /** Returns the timelapse configuration of one run of the 1.1.78 family; the interval and the duration stay the user choices the lapse runs on. */
  async getlapseconfig(runid) {
    return this.adapter.get(`forensiclapseconfig:${runid}`);
  }
  /** Persists the timelapse configuration of one run of the 1.1.78 family; the started lapse survives service worker restarts through the same record. */
  async setlapseconfig(config) {
    await this.adapter.set(`forensiclapseconfig:${config.runid}`, config);
  }
  /** Returns the user configured capture naming rule of the 1.1.78 family: the lowercase pattern with the parts it stamps; an absent rule keeps the capturename grammar of the files family. */
  async getnames() {
    return this.adapter.get("forensicnames");
  }
  /** Persists the user configured capture naming rule of the 1.1.78 family; the pattern and its parts stay exactly the user's values with no code default. */
  async setnamerule(rule) {
    await this.adapter.set("forensicnames", rule);
  }
  /** Returns the user configured forensic choices of the 1.1.78 family: the diff threshold, the timelapse interval, the thumbnail edge and the forensic retention; an absent choice never hides a code default. */
  async getforensicchoices() {
    const settings = await this.getsettings();
    const choices = {};
    if (settings?.diffthreshold !== void 0) choices.diffthreshold = settings.diffthreshold;
    if (settings?.timelapseinterval !== void 0) choices.timelapseinterval = settings.timelapseinterval;
    if (settings?.thumbnailedge !== void 0) choices.thumbnailedge = settings.thumbnailedge;
    if (settings?.forensicretention !== void 0) choices.forensicretention = settings.forensicretention;
    return choices;
  }
  /** Persists the user configured forensic choices of the 1.1.78 family through the runsettings; the diff threshold, the timelapse interval, the thumbnail edge and the forensic retention stay exactly the user's values with no code default. */
  async setforensicchoices(choices) {
    const settings = await this.getsettings() ?? {};
    await this.setsettings({ ...settings, ...choices.diffthreshold !== void 0 ? { diffthreshold: choices.diffthreshold } : {}, ...choices.timelapseinterval !== void 0 ? { timelapseinterval: choices.timelapseinterval } : {}, ...choices.thumbnailedge !== void 0 ? { thumbnailedge: choices.thumbnailedge } : {}, ...choices.forensicretention !== void 0 ? { forensicretention: choices.forensicretention } : {} });
  }
  /** Lists every stored key of the 1.1.79 minimization family with its data class, its serialized size and its record count: the inventory reads the stored families the caller names so the purge and the exportall bundle scope exactly over what the device holds, while the artifact getinventory of the 1.1.68 family stays untouched for the cleanup sweeper. */
  async getdatainventory(families) {
    const now = Date.now();
    const inventory = [];
    for (const family of families) {
      const value = await this.adapter.get(family.key);
      const serialized = JSON.stringify(value ?? null) ?? "null";
      const records = Array.isArray(value) ? value.length : value === void 0 || value === null ? 0 : 1;
      inventory.push({ key: family.key, dataclass: family.dataclass, size: serialized.length, records, at: now });
    }
    return inventory;
  }
  /** Stores the minimization policies of the 1.1.79 family — the purge policy with its scope and typed confirmation, the cleanup schedule with its artifact classes and timing, and the sync settings with the opted in classes and the cadence — exactly as the user configured them with no code default. */
  async getminpolicies() {
    return await this.adapter.get("minpolicies") ?? {};
  }
  /** Persists the minimization policies of the 1.1.79 family; every scope, timing, cadence and confirmation phrase stays the user's choice with no code default. */
  async setminpolicies(policies) {
    return this.adapter.set("minpolicies", policies);
  }
  /** Lists the sync records of the 1.1.79 family: one record per synced payload with its opted in classes, its payload hash, its format tag and its sync time — a plaintext sync never enters this list. */
  async getsyncrecords() {
    return await this.adapter.get("syncrecords") ?? [];
  }
  /** Stores one sync record of the 1.1.79 family; the newest pass answers first so the sync view names the latest transport. */
  async addsyncrecord(record) {
    await this.adapter.set("syncrecords", [record, ...(await this.getsyncrecords()).filter((candidate) => candidate.id !== record.id)]);
  }
  /** Lists the cookie jar records of the 1.1.79 family — one jar per task run with its scoped cookie entries, its seal state and its expiry window. */
  async getjars() {
    return await this.adapter.get("cookiejars") ?? [];
  }
  /** Stores one cookie jar record of the 1.1.79 family; the jar keeps its run binding so one task run never shares its cookie state with another. */
  async setjar(jar) {
    await this.adapter.set("cookiejars", [...(await this.getjars()).filter((candidate) => candidate.jarid !== jar.jarid), jar]);
  }
  /** Expires the sealed jars of the 1.1.79 family whose user configured expiry window passed: the cookie entries leave while the jar record stays for the audit trail, and an unexpired or expiry-less jar keeps everything because the expiry never defaults in code. */
  async expirejarpass(now) {
    const jars = await this.getjars();
    let expired = 0;
    for (const jar of jars) {
      if (jar.sealed && jar.expiresat !== void 0 && jar.expiresat <= now && jar.cookies.length > 0) {
        await this.setjar({ ...jar, cookies: [], updatedat: now });
        expired += 1;
      }
    }
    return { expired };
  }
  /** Lists the local rule records of the 1.1.79 family: the field lists per origin that must never leave the device. */
  async getlocalrules() {
    return await this.adapter.get("localrules") ?? [];
  }
  /** Stores one local rule record of the 1.1.79 family per origin; the localfirst pass and the localgate read exactly these fields. */
  async setlocalrule(rule) {
    await this.adapter.set("localrules", [...(await this.getlocalrules()).filter((candidate) => candidate.origin !== rule.origin), rule]);
  }
  /** Reads the telemetry policy of the 1.1.79 family persisted fixed to off: the enabled literal stays false by construction and every counter keeps living inside the local memory. */
  async gettelemetrypolicy() {
    return await this.adapter.get("telemetrypolicy") ?? { enabled: false, counters: "local", at: Date.now() };
  }
  /** Persists the telemetry policy of the 1.1.79 family; only the fixed off record ever stores because the type makes an on state unrepresentable. */
  async settelemetrypolicy(policy) {
    return this.adapter.set("telemetrypolicy", policy);
  }
  /** Lists the exportall bundles of the 1.1.79 family: one record per portable file the user asked for with its record counts and byte sizes. */
  async getexportbundles() {
    return await this.adapter.get("exportallbundles") ?? [];
  }
  /** Stores one exportall bundle of the 1.1.79 family; the bundle links to its download record so the audit trail answers which download carried which bundle. */
  async addexportbundle(bundle) {
    await this.adapter.set("exportallbundles", [bundle, ...(await this.getexportbundles()).filter((candidate) => candidate.id !== bundle.id)]);
  }
  /** Links one exportall bundle of the 1.1.79 family to the download record that carried it, so the audit trail answers which download shipped which bundle. */
  async setbundledownload(bundleid, downloadid) {
    await this.adapter.set("exportalldownloads", { ...await this.adapter.get("exportalldownloads") ?? {}, [bundleid]: downloadid });
  }
  /** Lists the download links of the exportall bundles of the 1.1.79 family by bundle id. */
  async getbundledownloads() {
    return await this.adapter.get("exportalldownloads") ?? {};
  }
  /** Flags artifacts of the 1.1.79 family for retention: the flagged ids never enter a cleanup pass because the user asked to keep them. */
  async flagretainedartifacts(ids) {
    const kept = /* @__PURE__ */ new Set([...await this.adapter.get("retainedartifacts") ?? [], ...ids]);
    await this.adapter.set("retainedartifacts", [...kept]);
  }
  /** Lists the artifact ids the user flagged for retention of the 1.1.79 family; the cleanup pass keeps every one of them. */
  async getretainedartifacts() {
    return await this.adapter.get("retainedartifacts") ?? [];
  }
  /** Lists the storage keys the run families wrote, derived from the stored records: the run scoped keys of every known run, the session trail keys and the family keys the inventory scopes, because the adapter seam exposes no enumeration and the purge of a run trace names real keys only. */
  async storedkeys() {
    const runs = await this.adapter.get("runs") ?? [];
    const sessions = await this.adapter.get("sessionrecords") ?? [];
    const keys = /* @__PURE__ */ new Set(["runs", "memoryitems", "captures", "settings", "provlog", "audit"]);
    for (const run of runs) {
      keys.add(`runlog${run.runid}`);
      keys.add(`runscopes${run.runid}`);
      keys.add(`taskstate${run.runid}`);
      keys.add(`emulationstate${run.runid}`);
      keys.add(`workflowprovenance${run.runid}`);
      keys.add(`controldecisions${run.runid}`);
      keys.add(`runtimeline:${run.runid}`);
      keys.add(`provlog:${run.runid}`);
    }
    for (const session of sessions) keys.add(`trail${session.id}`);
    return [...keys].sort();
  }
  /** Purges the stored families of the 1.1.79 minimization family by storage key: the purgeonrequest pass resolved the scope and the typed confirmation before the caller lands here, every deleted key entered the audit trail through the caller, and the audit family never purges because the immutable hashes survive every pass. */
  async purgekeys(keys) {
    for (const key of keys) {
      if (key === "audit") continue;
      await this.adapter.set(key, key === "settings" ? {} : []);
    }
  }
  /** Builds the auditexportrecord of the workspace on demand: the runs with their visits, the memory items with their provenance, the expiry rules, the timeline streams of every run and the locks bundle into one record. */
  async getexport(now) {
    const runs = await this.listruns();
    const timeline = [];
    for (const run of runs) timeline.push(...await this.getruntimeline(run.runid));
    return { at: now, runs, memory: await this.getmemoryitems(), expiryrules: await this.getexpiry(), timeline, locks: await this.listlocks() };
  }
  /**
   * The site bridge seam of the 1.1.82 family: the relay session records, the pairing records with their one time codes, the relay token records stored only as sha-256 hashes scoped to the relay origin, the bridge event log with its minimized payloads, the offline bridge queue with its operation id deduplication and the bridge kill switch stamp persist through the same local adapter; the socket itself lives in the background service worker while every record survives its restarts.
   * The seam documents a relay session backend — a reviewed relay store can take the session and token registry over later, holding the pairing state and the token hashes beside the idle expiry sweeps on its own reviewed infrastructure behind the same bridge consent gate and the same origin scoping — without touching the callers, without ever persisting a raw token and without ever bypassing the review.
   * The bridge records below never hold page content: the event payloads carry plan text and statuses only unless the explicit page consent flag is set.
   */
  /** Lists the relay session records of the 1.1.82 site bridge: one record per paired relay session with its two member room and idle window. */
  async getbridgesessions() {
    return await this.adapter.get("bridgesessions") ?? [];
  }
  /** Stores the relay session records of the 1.1.82 site bridge in one pass so a restart never leaves a half written member room. */
  async setbridgesessions(records) {
    return this.adapter.set("bridgesessions", records);
  }
  /** Stores one relay session record of the 1.1.82 site bridge, replacing the record of the same session id. */
  async addbridgesession(record) {
    await this.adapter.set("bridgesessions", [record, ...(await this.getbridgesessions()).filter((candidate) => candidate.id !== record.id)]);
  }
  /** Lists the bridge pairing records of the 1.1.82 site bridge: the one time codes minted inside the extension options bound to the relay origin. */
  async getbridgepairings() {
    return await this.adapter.get("bridgepairings") ?? [];
  }
  /** Stores the bridge pairing records of the 1.1.82 site bridge in one pass. */
  async setbridgepairings(records) {
    return this.adapter.set("bridgepairings", records);
  }
  /** Stores one bridge pairing record of the 1.1.82 site bridge; a re-mint of the same origin replaces the earlier code. */
  async addbridgepairing(record) {
    await this.adapter.set("bridgepairings", [record, ...(await this.getbridgepairings()).filter((candidate) => candidate.origin !== record.origin)]);
  }
  /** Lists the relay token records of the 1.1.82 site bridge: the sha-256 hashes scoped to the relay origin, never a raw token. */
  async getbridgetokens() {
    return await this.adapter.get("bridgetokens") ?? [];
  }
  /** Stores the relay token records of the 1.1.82 site bridge in one pass; the raw values stay out of the store by construction. */
  async setbridgetokens(records) {
    return this.adapter.set("bridgetokens", records);
  }
  /** Lists the bridge event records of the 1.1.82 site bridge: the minimized chat, plan proposal, plan review and progress events with their operation ids. */
  async getbridgeevents() {
    return await this.adapter.get("bridgeevents") ?? [];
  }
  /** Stores one bridge event record of the 1.1.82 site bridge at the head of the log; the payloads carry plan text and statuses only. */
  async addbridgeevent(event) {
    await this.adapter.set("bridgeevents", [event, ...(await this.getbridgeevents()).filter((candidate) => candidate.opid !== event.opid)]);
  }
  /** Lists the offline bridge queue of the 1.1.82 site bridge: the buffered frames with their stable operation ids for the replay deduplication. */
  async getbridgequeue() {
    return await this.adapter.get("bridgequeue") ?? [];
  }
  /** Stores the offline bridge queue of the 1.1.82 site bridge in one pass so the replay and the buffer never race. */
  async setbridgequeue(records) {
    return this.adapter.set("bridgequeue", records);
  }
  /** Reads the bridge kill switch stamp of the 1.1.82 site bridge; an absent stamp leaves the switch released. */
  async getbridgeswitch() {
    return this.adapter.get("bridgeswitch");
  }
  /** Stores the bridge kill switch stamp of the 1.1.82 site bridge; one click disables the socket and the pairing instantly. */
  async setbridgeswitch(stamp) {
    return this.adapter.set("bridgeswitch", stamp);
  }
  /** Returns the install state of the 1.1.85 native host: the host name, the extension id, the installer and companion versions, the port state and the last errors; an absent record leaves the transport deny by default. */
  async getnativestate() {
    return this.adapter.get("nativestate");
  }
  /** Stores the install state of the 1.1.85 native host so the install state persists across service worker restarts; the record never carries key material or session tokens. */
  async setnativestate(state) {
    return this.adapter.set("nativestate", state);
  }
  /** Lists the native call records of the 1.1.85 audit trail: one record per call with its correlation id, surface, call class and outcome, newest first. */
  async getnativecalls() {
    return await this.adapter.get("nativecalls") ?? [];
  }
  /** Replaces the stored native call set after one recorded call so the audit trail survives the service worker restarts. */
  async setnativecalls(records) {
    return this.adapter.set("nativecalls", records);
  }
  /** Stores one native call record at the head of the audit trail; a repeated record id replaces the earlier entry and the record carries no payload bytes. */
  async addnativecall(record) {
    await this.adapter.set("nativecalls", [record, ...(await this.getnativecalls()).filter((candidate) => candidate.id !== record.id)]);
  }
  /** Reads the kill switch stamp of the 1.1.85 native transport; an absent stamp leaves the switch released. */
  async getnativeswitch() {
    return this.adapter.get("nativeswitch");
  }
  /** Stores the kill switch stamp of the 1.1.85 native transport; one press stops every native call instantly and no frame crosses until the release. */
  async setnativeswitch(stamp) {
    return this.adapter.set("nativeswitch", stamp);
  }
  /** Lists the wsbridge session records of the 1.1.85 native transport: the port, the token hash (never the raw token), the idle window and the connection counts. */
  async getnativebridgesessions() {
    return await this.adapter.get("nativebridgesessions") ?? [];
  }
  /** Replaces the stored wsbridge session set after one bind, connection or expiry sweep; the raw tokens stay out of the store by construction. */
  async setnativebridgesessions(sessions) {
    return this.adapter.set("nativebridgesessions", sessions);
  }
  /**
   * The resilience adapter seam of the 1.1.70 family: today the offlinequeue, the run records, the checkpoints, the heartbeats and the executed idempotencykeys persist through the same local adapter as every other record, and the seam keeps the queuedtask and runrecord shapes stable so a reviewed disk backed queue backend can take the offlinequeue over later — a browser restart or a service worker wake then drains the same sequence order — without touching the callers and without ever bypassing the review.
   * The state depth seam of the 1.1.71 family: the memoryitems, their provenance and their expiryrules persist through the same local adapter while the stored values encrypt at rest through the webcrypto derived key of encryptrest; the seam keeps the memoryitem shape stable so a reviewed encrypted backend implementation can take the whole memory store over later — the adapter then writes and reads only encrypted envelopes — without touching the callers, without persisting the derived key and without ever bypassing the review.
   * The fleet seam of the 1.1.72 family: the agentrecords, their budgetstates, the escalations, the reviewrecords, the runreplay captures under their user retention, the output comparisons, the consensusrecords and the killswitch stamp persist through the same local adapter; the seam keeps the fleet shapes stable so a reviewed shared backend can take the registry over later — a fleet of many browsers then reads one registry — without touching the callers and without ever bypassing the review.
   * The work seam of the 1.1.73 family: the fleet spawn lineage with its parent objectives, the aggregaterecords under their user retention, the interleaved timeline under its own retention, the lessonshare records, the arbitration cases with their verdicts, the priority lanes, the latest load reports per origin, the shared cost ledger and the user configured depthlimit persist through the same local adapter; the seam keeps the work shapes stable so a reviewed shared fleet backend can take the coordination state over later — many browsers then read one spawn lineage and one cost ledger — without touching the callers and without ever bypassing the review.
   * The navigation seam of the 1.1.74 family: the closedtabrecords under their user retention window, the navigation trails per run with their deduplicated entries, the per domain navigation rate windows, the deep link patterns, the safety verdict history, the prefetchplan of the latest navintent pass and the navpause state with its pending url persist through the same local adapter; the seam keeps the navigation shapes stable so a reviewed session restore backend can take the closed tab and trail state over later — a restarted browser then reopens the same closed tabs and replays the same trails — without touching the callers and without ever bypassing the review.
   * The pipeline seam of the 1.1.75 family: the extractpipelines per run, the streamcursor checkpointed after every chunk, the reviewed transformrule lists per run, the preview extractbatches under their user previewretention, the append only provlog entries per run, the samplepolicies per plan, the dedupereports with their dropped counts, the streamfilerecord metadata for the cleanup after each run and the sourcestamprecords beside their rows persist through the same local adapter; the seam keeps the pipeline shapes stable so a reviewed disk backed sink backend can take the stream files over later — the chunked writes then land on the same reviewed disk namespace while the cursor checkpoints and the provlog stay with the audit — without touching the callers and without ever bypassing the review.
   * The web api transport seam of the 1.1.76 family: the event subscription records with their persisted last event ids so a reconnect resumes exactly where the stream stopped, the per run cached responses namespaced through their run embedded cache keys under the user configured cacheretention, the cache expiry cleanup pass, the per run correlation maps with their assigned request ids and joined response pairs, the ratelimitdirective records per origin and scope, the observed page api calls under their user configured apicallretention and the user configured poll timeout and backoff choices persist through the same local adapter; the seam keeps the cacheentry shape stable so a reviewed cache backend can take the per run response cache over later — a shared or disk backed cache then serves the same run namespaced keys behind the same cachegate — without touching the callers and without ever bypassing the review.
   * The vision seam of the 1.1.77 family: the ocr results and the vision descriptions under their user configured visionretention, the redaction masks with their region evidence, the screenshot pairs binding each image to its dom snapshot, the grounding results with their ranked selectors, the frame reads with their video positions under their user configured frameretention, the vision model configuration, the visioncache entries keyed by their image hashes with the expiry pass tied to the user visioncacheretention window and the vision call log that feeds the costshare ledger persist through the same local adapter; the seam documents a model provider backend — a reviewed model provider can take the ocr read, the vision send and the pdf rasterize seams over later, running the recognition and the descriptions on its own reviewed infrastructure behind the same visiongate consent, while the recognition payloads and description texts stay opaque to this adapter — without touching the callers and without ever bypassing the review.
   * The forensic seam of the 1.1.78 family: the beforeafter pairs under the user configured forensicretention, the per run console and net timelines with their sequence and correlation linkage tied to the run heartbeat, the diff baselines with their page state labels and the diff results with their changed regions, the thumbnails linked back to their full captures, the per run timelapse configurations with their ordered frame references, the user configured capture naming rule and the forensic choices of the diff threshold, the timelapse interval, the thumbnail edge and the retention persist through the same local adapter; the seam documents a capture store backend — a reviewed disk backed capture store can take the forensic records over later, holding the pairs, the timelines and the diffs beside the capture bytes on the same reviewed namespace while the provenance stays with the provlog — without touching the callers, without a forced purge of its own and without ever bypassing the review.
   * The minimization seam of the 1.1.79 family: the data inventory over the stored families, the minimization policies of the purge scope with its typed confirmation, the cleanup schedule with its artifact classes and timing and the sync settings with the opted in classes and the cadence, the sync records with their payload hashes and format tags, the cookie jars per run with their seal state and expiry windows, the local rule field lists per origin, the telemetry policy fixed to off, the exportall bundles with their download links and the retained artifact flags persist through the same local adapter; the seam documents an encrypted sync backend — a reviewed sync backend can take the syncrecord transport over later, receiving only the encrypted envelopes the encryptsync pass built from the user passphrase while the passphrase itself never persists and the derived key never rides a payload — without touching the callers, without a plaintext transport and without ever bypassing the review.
   * The mcp serve seam of the 1.1.84 family: the client session bindings that pair one client with exactly one extension session so concurrent clients hold isolated sessions, the client records with their initialize declared name and version metadata for the audit trail, the tool call records that name the caller, the tool and the outcome of every serve call without any payload, the served resource watchers with their baselines, the approval gates with their pending state and the shutdown drain window the user configures persist through the same local adapter the extension engine uses; the serve mode shares the policy gates, the kind catalog, this memory store and the progress store with the live extension sessions instead of growing a second engine, and the seam documents a serve state backend — a reviewed serve backend can take the bindings and the call registry over later behind the same pairing approval, the same consent gates and the same audit trail — without touching the callers, without ever persisting a raw session token and without ever bypassing the review.
   * The native host seam of the 1.1.85 family: the install state that records the host name, the extension id, the installer and companion versions and the port state so the install survives every service worker restart, the native call records that name the correlation id, the surface, the call class and the outcome of every native call without any payload, the kill switch stamp and the wsbridge session records with their token hashes only persist through the same local adapter; the raw wsbridge token never persists because the advertisement frame stays the only carrier, and the seam documents a native state backend — a reviewed host state backend can take the install state and the call registry over later behind the same install consent, the same per class gates and the same audit trail — without touching the callers and without ever bypassing the review.
   */
};
function mediakindof(record) {
  if ("pages" in record) return "pdf";
  if ("startedat" in record) return "recording";
  if ("timestamp" in record) return "frame";
  if ("context" in record) return "canvas";
  if ("tracks" in record) return "stream";
  return "asset";
}
function expiremediabytes(record) {
  if ("dataurl" in record) {
    const source = record;
    const copy = { ...source };
    delete copy.dataurl;
    return { ...copy, bytesexpired: true };
  }
  if ("startedat" in record) {
    const source = record;
    const copy = { ...source };
    delete copy.bytes;
    return { ...copy, bytesexpired: true };
  }
  return record;
}
function expirecapturebytes(record) {
  const { bytes, ...metadata } = record;
  void bytes;
  return { ...metadata, bytesexpired: true };
}
function expirecallbody(record) {
  const { body, ...metadata } = record;
  void body;
  return { ...metadata, bodyexpired: true };
}
function expirebodybytes(record) {
  const { body, ...metadata } = record;
  void body;
  return { ...metadata, bodyexpired: true };
}
function randomid() {
  return crypto.randomUUID();
}
var sensitivememoryclasses = /* @__PURE__ */ new Set(["credential", "secret", "token", "body", "capture", "profile"]);
function provenanceof(input) {
  if (input.origin.trim() === "") throw new Error("The provenance record needs its origin.");
  if (input.runid.trim() === "") throw new Error("The provenance record needs its run id.");
  if (input.stepid.trim() === "") throw new Error("The provenance record needs its step id.");
  return { origin: input.origin, runid: input.runid, stepid: input.stepid, capturedat: input.now };
}
function memoryitemof(input) {
  if (input.key.trim() === "") throw new Error("The memory item needs its key.");
  return { key: input.key, value: input.value, provenance: input.provenance, ...input.memoryclass !== void 0 && input.memoryclass.trim() !== "" ? { memoryclass: input.memoryclass } : {}, ...input.expiresat !== void 0 ? { expiresat: input.expiresat } : {} };
}
function attachprovenance(item, provenance) {
  return { ...item, provenance };
}
function stepsummaryfor(item, steps) {
  const step = steps.find((candidate) => candidate.id === item.provenance.stepid);
  if (step === void 0) return `The provenance names the step ${item.provenance.stepid} of the run ${item.provenance.runid} which the current plan no longer carries; the item keeps its provenance for the audit trail.`;
  return step.summary !== "" ? step.summary : `The ${step.kind} step ${step.id} of the run ${item.provenance.runid} captured this item on ${item.provenance.origin}.`;
}
function matchingrule(rules, key) {
  return rules.find((rule) => rule.pattern !== "" && (rule.pattern === "*" || key.startsWith(rule.pattern)));
}
function expiryof(item, rules) {
  if (item.expiresat !== void 0) return item.expiresat;
  const rule = matchingrule(rules, item.key);
  if (rule === void 0) return void 0;
  return item.provenance.capturedat + rule.lifetime;
}
function expireditems(items, rules, now) {
  return items.filter((item) => {
    const expiry = expiryof(item, rules);
    return expiry !== void 0 && expiry <= now;
  });
}
function purgeitems(input) {
  if (!input.confirmed) return { kept: input.items, purged: [] };
  const expired = new Set(expireditems(input.items, input.rules, input.now).map((item) => item.key));
  const kept = input.items.filter((item) => !expired.has(item.key));
  const purged = input.items.filter((item) => expired.has(item.key)).map((item) => ({ key: item.key, summary: `The memory item ${item.key} of the ${item.memoryclass ?? "general"} class expired under its user expiryrule and purged; its value left while its provenance stays for the audit trail.`, provenance: item.provenance, at: input.now }));
  return { kept, purged };
}
function quotareportof(input) {
  const candidates = rankedcandidates(input.items, input.rules, input.now);
  const remaining = Math.max(0, input.quota - input.usage);
  return { usage: input.usage, quota: input.quota, remaining, ...candidates.length > 0 ? { candidates } : {} };
}
function rankedcandidates(items, rules, now) {
  const measured = items.map((item) => ({ item, bytes: JSON.stringify(item.value ?? null).length }));
  const expired = expireditems(items, rules, now).map((item) => item.key);
  const expiredset = new Set(expired);
  return measured.filter((entry) => expiredset.has(entry.item.key) || entry.item.memoryclass !== void 0).sort((one, two) => {
    const oneexpired = expiredset.has(one.item.key) ? 0 : 1;
    const twoexpired = expiredset.has(two.item.key) ? 0 : 1;
    if (oneexpired !== twoexpired) return oneexpired - twoexpired;
    return one.item.provenance.capturedat - two.item.provenance.capturedat;
  }).map((entry) => ({ key: entry.item.key, bytes: entry.bytes, reason: expiredset.has(entry.item.key) ? "The item expired under its user expiryrule; its purge reclaims its bytes while its summary stays for the audit trail." : `The ${entry.item.memoryclass ?? "general"} item of the run ${entry.item.provenance.runid} aged past its capture; the cleanup proposes it as a reclaimable candidate and the audit history never enters the batch.` }));
}
function cleanupbatch(candidates, batchsize) {
  const sized = batchsize !== void 0 && Number.isInteger(batchsize) && batchsize > 0 ? candidates.slice(0, batchsize) : candidates;
  return [...sized];
}
function bytesreclaimed(batch) {
  return batch.reduce((total, candidate) => total + candidate.bytes, 0);
}
function auditexportof(input) {
  return { at: input.now, runs: input.runs, memory: input.items, expiryrules: input.rules, timeline: input.timeline, locks: input.locks };
}
function exportchunks(record, chunksize) {
  if (!Number.isInteger(chunksize) || chunksize <= 0) throw new Error("The export chunk size must stay a positive whole number of characters; the size stays the caller's choice with no code cap.");
  const serialized = JSON.stringify(record);
  const chunks = [];
  for (let offset = 0; offset < serialized.length; offset += chunksize) {
    const payload = serialized.slice(offset, offset + chunksize);
    chunks.push({ index: chunks.length, payload, done: offset + chunksize >= serialized.length });
  }
  return chunks;
}
async function derivekey(secret, salt) {
  if (secret.length === 0) throw new Error("The encryption needs its user secret; the secret entry stays a consent prompt.");
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey({ name: "PBKDF2", salt: new TextEncoder().encode(salt), iterations: 1e5, hash: "SHA-256" }, material, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}
async function encryptvalue(key, value) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(JSON.stringify(value ?? null)));
  return { iv: btoa(String.fromCharCode(...iv)), payload: btoa(String.fromCharCode(...new Uint8Array(cipher))) };
}
async function decryptvalue(key, envelope) {
  const iv = Uint8Array.from(atob(envelope.iv), (char) => char.charCodeAt(0));
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, Uint8Array.from(atob(envelope.payload), (char) => char.charCodeAt(0)));
  return JSON.parse(new TextDecoder().decode(plain));
}
async function migrateitem(input) {
  if (!input.enabled || input.item.encrypted === true) return input.item;
  const envelope = await encryptvalue(input.key, input.item.value);
  return { ...input.item, value: envelope, encrypted: true };
}
function issensitiveclass(memoryclass) {
  return memoryclass !== void 0 && sensitivememoryclasses.has(memoryclass);
}
function exportready(items) {
  const missing = items.filter((item) => item.provenance.origin.trim() === "" || item.provenance.runid.trim() === "" || item.provenance.stepid.trim() === "").map((item) => item.key);
  return { ready: missing.length === 0, missing };
}
function openselcache(runid) {
  if (runid.trim() === "") throw new Error("The selcache needs its run id; a cache without a run scopes nothing.");
  return { runid, generation: 0, entries: [], invalidations: [] };
}
function cacheselentry(cache, entry) {
  if (entry.selector.trim() === "") throw new Error("The selcache entry needs its selector.");
  const entries = cache.entries.filter((candidate) => candidate.selector !== entry.selector);
  return { ...cache, entries: [...entries, { selector: entry.selector, resolution: entry.resolution, generation: cache.generation }] };
}
function advanceselcachegeneration(cache, now) {
  return { ...cache, generation: cache.generation + 1, invalidations: [...cache.invalidations, { reason: "generation", at: now, selectors: [] }] };
}
function selcachelookup(cache, selector) {
  const entry = cache.entries.find((candidate) => candidate.selector === selector);
  if (entry === void 0) return { hit: false, stale: false, reason: "The selcache holds no entry for the selector; the resolver runs its fresh query." };
  if (entry.generation !== cache.generation) return { hit: false, stale: true, reason: `The selcache entry for ${selector} resolves from generation ${entry.generation} while the run stands at generation ${cache.generation}; revalidate the entry or query the selector fresh.` };
  return { hit: true, resolution: entry.resolution, stale: false, reason: "The selcache entry resolves from the current generation; the revalidation query confirms it before the dispatch." };
}
function invalidateselcacheonnavigation(cache, now) {
  const selectors = cache.entries.map((entry) => entry.selector);
  return { ...cache, entries: [], invalidations: [...cache.invalidations, { reason: "navigation", at: now, selectors }] };
}
function invalidateselcacheonmutations(cache, fingerprints, now) {
  const matching = cache.entries.filter((entry) => fingerprints.some((fingerprint) => entry.selector.includes(fingerprint) || fingerprint.includes(entry.selector))).map((entry) => entry.selector);
  return { ...cache, entries: cache.entries.filter((entry) => !matching.includes(entry.selector)), invalidations: [...cache.invalidations, { reason: "mutation", at: now, selectors: matching }] };
}
function revalidateselentry(cache, input) {
  const entry = cache.entries.find((candidate) => candidate.selector === input.selector);
  if (entry === void 0) return cacheselentry(cache, { selector: input.selector, resolution: input.freshresolution });
  if (entry.resolution === input.freshresolution) return cache;
  return { ...cache, entries: cache.entries.map((candidate) => candidate.selector === input.selector ? { ...candidate, resolution: input.freshresolution, generation: cache.generation } : candidate) };
}
function selcachestats(cache, lookups) {
  return { hits: lookups.filter((lookup) => lookup.hit).length, stale: lookups.filter((lookup) => lookup.stale).length, total: lookups.length };
}
function selcacheentries(cache) {
  return cache.entries.filter((entry) => entry.generation === cache.generation);
}
function selcacheinvalidations(cache) {
  return [...cache.invalidations];
}
function stalegenerationfailure(input) {
  return {
    message: `The selcache entry for ${input.selector} resolves from generation ${input.entrygeneration} while the run ${input.runid} stands at generation ${input.currentgeneration}; the stale hit refused so the resolver never dispatches against an outdated resolution.`,
    retry: { allowed: true, reason: `Revalidate the ${input.selector} entry under generation ${input.currentgeneration} or query the selector fresh through a new reviewed dispatch; the retry rides the full consent gate chain.` },
    context: { selector: input.selector, entrygeneration: String(input.entrygeneration), currentgeneration: String(input.currentgeneration) }
  };
}
var migrationcommandtext = "devthink migrateplan <plan source> --format v1 --out <converted plan>";
function markv1sunset(existing, input) {
  if (existing !== void 0 && existing.dismissedat === void 0) return existing;
  return { at: input.now, declared: input.declared, clientid: input.clientid };
}
function dismissv1sunset(existing, now) {
  if (existing === void 0) return void 0;
  return { ...existing, dismissedat: now };
}
function v1sunsetvisible(state) {
  return state !== void 0 && state.dismissedat === void 0;
}
function migrationpromptof(existing, input) {
  if (existing !== void 0) return { prompt: false, state: existing };
  const previous = input.previous?.trim() ?? "";
  if (previous === "" || !previous.startsWith("1.")) return { prompt: false };
  return { prompt: true, state: { promptedat: input.now, previousversion: previous, command: migrationcommandtext } };
}
function dismissmigrationprompt(existing, now) {
  if (existing === void 0) return void 0;
  return { ...existing, migrationpromptdismissed: true, dismissedat: now };
}
function migrationpromptvisible(state) {
  return state !== void 0 && state.migrationpromptdismissed !== true && state.dismissedat === void 0;
}
export {
  advanceselcachegeneration,
  attachprovenance,
  auditexportof,
  bytesreclaimed,
  cacheselentry,
  cleanupbatch,
  decryptvalue,
  derivekey,
  dismissmigrationprompt,
  dismissv1sunset,
  encryptvalue,
  expireditems,
  expiryof,
  exportchunks,
  exportready,
  invalidateselcacheonmutations,
  invalidateselcacheonnavigation,
  issensitiveclass,
  markv1sunset,
  matchingrule,
  memoryitemof,
  migrateitem,
  migrationcommandtext,
  migrationpromptof,
  migrationpromptvisible,
  openselcache,
  provenanceof,
  purgeitems,
  quotareportof,
  randomid,
  rankedcandidates,
  revalidateselentry,
  selcacheentries,
  selcacheinvalidations,
  selcachelookup,
  selcachestats,
  sensitivememoryclasses,
  sessionmemory,
  stalegenerationfailure,
  stepsummaryfor,
  v1sunsetvisible
};
//# sourceMappingURL=memory.js.map
