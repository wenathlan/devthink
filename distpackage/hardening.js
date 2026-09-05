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

// security.ts
var maskmarker = "[redacted]";
function fieldshapekind(name) {
  const lowered = name.toLowerCase();
  if (lowered.includes("password") || lowered.includes("passwd") || lowered.includes("pwd") || lowered.includes("passphrase")) return "password";
  if (lowered.includes("token") || lowered.includes("apikey") || lowered.includes("api_key") || lowered.includes("auth") || lowered.includes("bearer")) return "token";
  if (lowered.includes("card") || lowered.includes("cvc") || lowered.includes("cvv") || lowered.includes("expiry") || lowered.includes("pan")) return "card";
  if (lowered.includes("secret")) return "secret";
  return void 0;
}
function maskingfield(name, shapes) {
  if (fieldshapekind(name) !== void 0) return true;
  const lowered = name.toLowerCase();
  return shapes.some((shape) => shape !== "" && lowered.includes(shape));
}
function maskvalue(value) {
  return value === "" ? "" : maskmarker;
}
function maskfield(input) {
  return maskingfield(input.name, input.shapes) ? maskvalue(input.value) : input.value;
}
function maskrecord(record, shapes) {
  const masked = {};
  for (const [key, value] of Object.entries(record)) {
    if (typeof value === "string") {
      const sibling = record.name;
      masked[key] = key === "value" && typeof sibling === "string" ? maskfield({ name: sibling, value, shapes }) : maskfield({ name: key, value, shapes });
    } else if (Array.isArray(value)) masked[key] = value.map((item) => Boolean(item) && typeof item === "object" && !Array.isArray(item) ? maskrecord(item, shapes) : item);
    else if (Boolean(value) && typeof value === "object") masked[key] = maskrecord(value, shapes);
    else masked[key] = value;
  }
  return masked;
}
function maskexport(record, shapes) {
  return maskrecord(record, shapes);
}

// hardening.ts
function masklogtext(input) {
  const maskedkeys = [];
  let text = input.text;
  const patterns = [
    [/(\w+)\s*:\s*"((?:[^"\\]|\\.)*)"/g, (match) => `${match[1]}: "${maskvalue(match[2] ?? "")}"`],
    [/(\w+)\s*=\s*([^\s&;]+)/g, (match) => `${match[1]}=${maskvalue(match[2] ?? "")}`],
    [/(\w+)\s*:\s*([^\s,;]+)/g, (match) => `${match[1]}: ${maskvalue(match[2] ?? "")}`]
  ];
  for (const [pattern, rewrite] of patterns) {
    text = text.replace(pattern, (full, key, ...rest) => {
      if (!maskingfield(String(key), input.shapes)) return full;
      maskedkeys.push(String(key));
      return rewrite([full, String(key), String(rest[0] ?? "")]);
    });
  }
  const unique = [...new Set(maskedkeys)];
  return { text, maskedkeys: unique, reason: unique.length === 0 ? "The log text carries no secret shaped key value pair; the masking pass changed nothing." : `The masking pass covered the log field${unique.length === 1 ? "" : "s"} ${unique.join(", ")} the text carried since the audit; the typed values answer the redaction marker.` };
}
function localscangate(input) {
  const signatures = input.hook?.localsignatures ?? [];
  if (signatures.length === 0) return { verdict: "pending", reason: "The scanning hook carries no local signature list; the verdict stays with the configured scanner endpoint and the file holds." };
  if (input.digest === void 0 || input.digest.trim() === "") return { verdict: "pending", reason: `The local signature check of ${input.hook?.scanner ?? "the scanning hook"} needs the file digest; a digest nobody computed flags nothing.` };
  if (signatures.includes(input.digest)) return { verdict: "flagged", reason: `The local signature list of ${input.hook?.scanner} matched the file digest; the quarantine deletes the file and no remote endpoint ever fires.` };
  return { verdict: "pending", reason: `The local signature list of ${input.hook?.scanner} matched no signature; the verdict falls back to the configured scanner endpoint and the file holds.` };
}
function hatchbannerof(input) {
  return { title: `Escape hatch: ${input.halted} in flight call${input.halted === 1 ? "" : "s"} halted`, explanation: `The escape hatch key stopped every native call in one press at ${new Date(input.at).toISOString()}; the transport detached until you reattach and the halt stays recorded in the audit trail.`, halted: input.halted, at: input.at };
}
function newdomainpausecard(input) {
  if (input.knownorigins.includes(input.origin)) return { pause: false, card: { title: "", explanation: "", origin: input.origin }, reason: `The domain ${input.origin} sits inside the recorded origins; the review mode runs the ${input.kind} step without the new domain pause.` };
  return { pause: true, card: { title: `New domain: ${input.origin}`, explanation: `The ${input.kind} step targets a domain the profile workspace never recorded. The run pauses here so you can review the new trust boundary: the safedefaults profile applied reads only, every sensitive class stays denied, and the next explicit grant opens the domain the same way the first one did.`, origin: input.origin }, reason: `The review mode paused the ${input.kind} step on the new domain ${input.origin} with the explanatory card; the run resumes after the domain review.` };
}
function runtracekeys(input) {
  if (input.runid.trim() === "") throw new Error("The run trace purge names its run; a nameless run trace purges nothing.");
  const runid = input.runid.trim();
  const keys = input.keys.filter((key) => key === runid || key.endsWith(runid));
  const kept = input.keys.filter((key) => !keys.includes(key));
  return { keys, kept, reason: keys.length === 0 ? `No stored key carries the trace of the run ${runid}; the run trace purge deletes nothing.` : `The run trace purge deletes ${keys.length} stored key${keys.length === 1 ? "" : "s"} carrying the trace of the run ${runid} \u2014 ${keys.join(", ")} \u2014 while ${kept.length} key${kept.length === 1 ? "" : "s"} of other runs survive.` };
}
function syncrotationgate(input) {
  if ((input.current ?? "").trim() === "" || (input.next ?? "").trim() === "") return { allowed: false, reason: "The key rotation names both the current passphrase and the next one; a rotation without either passphrase never rekeys because no key ever defaults in code." };
  if (input.current === input.next) return { allowed: false, reason: "The key rotation needs a next passphrase that differs from the current one; rotating onto the same key rekeys nothing." };
  return { allowed: true, reason: "The key rotation entry point opens with both passphrases present; the derived key rekeys the sync payloads while the passphrases never persist." };
}
function stdioclientsignaturegate(input) {
  if (input.signature === void 0 || input.platformverifier === void 0) return { verified: false, allowed: true, reason: "The platform carries no signature verifier the bridge can call; the local stdio bridge stays unverified while the record marks it." };
  if (!input.platformverifier(input.host, input.signature)) return { verified: false, allowed: false, reason: `The client signature of the ${input.host} bridge failed the platform verification; the local stdio bridge refuses the client and no frame relays.` };
  return { verified: true, allowed: true, reason: `The platform verifier confirmed the client signature of the ${input.host} bridge; the local stdio bridge relays its frames under the verified client.` };
}
function transparencyexportmask(input) {
  const payload = maskexport(input.report, input.shapes);
  const maskedfields = Object.keys(input.report).filter((key) => maskingfield(key, input.shapes));
  if (input.regions.length > 0 && Array.isArray(payload.captures)) payload.captures = payload.captures.map((entry) => Boolean(entry) && typeof entry === "object" && !Array.isArray(entry) ? { ...entry, redacted: true, redactedregions: input.regions.length } : entry);
  return { payload, maskedfields, redactedregions: input.regions.length, reason: `The transparency export left with the masking pass over ${maskedfields.length} shaped field${maskedfields.length === 1 ? "" : "s"} and ${input.regions.length} redact region${input.regions.length === 1 ? "" : "s"} covering its capture derived entries; the raw values stay behind the redaction marker.` };
}
export {
  hatchbannerof,
  localscangate,
  masklogtext,
  newdomainpausecard,
  runtracekeys,
  stdioclientsignaturegate,
  syncrotationgate,
  transparencyexportmask
};
//# sourceMappingURL=hardening.js.map
