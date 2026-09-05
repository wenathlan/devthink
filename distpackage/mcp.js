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
function protocolmajorof(declaration) {
  if (typeof declaration === "number") return Number.isInteger(declaration) && declaration >= 0 ? declaration : void 0;
  if (declaration === void 0 || declaration.trim() === "") return void 0;
  const match = /^(\d+)/.exec(declaration.trim());
  if (match === null) return void 0;
  const major = Number(match[1]);
  return major >= 0 ? major : void 0;
}
function negotiateprotocol(input) {
  const declared = protocolmajorof(input.client);
  if (declared === void 0) return { agreed: true, major: protocolmajorversion };
  if (declared > protocolsupported.maximum) return { agreed: false, reason: `The client speaks protocol version ${declared} while the server stops at ${protocolsupported.maximum}; the supported protocol versions are ${protocolsupported.minimum} through ${protocolsupported.maximum} until a future major bump.` };
  if (declared < protocolsupported.minimum) return { agreed: false, reason: `The client speaks protocol version ${declared} below the supported floor of ${protocolsupported.minimum}; the supported protocol versions are ${protocolsupported.minimum} through ${protocolsupported.maximum}, and a version one client converts its assets through the migrateplan command and docs/migrationguide.md.` };
  if (declared < protocolmajorversion) {
    const notice = deprecationnoticeof("mcp", "protocolversion");
    return { agreed: true, major: declared, ...notice !== void 0 ? { deprecation: notice } : {} };
  }
  return { agreed: true, major: protocolmajorversion };
}
var deprecatedfields = [];
var deprecationwindow = Object.freeze({ opens: apifreezerelease, closes: "2.0.0" });
function deprecationnoticeof(surface, field) {
  return deprecatedfields.find((candidate) => candidate.surface === surface && candidate.field === field)?.notice;
}
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

// debug.ts
var cdpdomains = ["Runtime", "Log", "Debugger", "DOM", "Network", "Page"];
function methoddomain(method) {
  const match = /^([A-Z][A-Za-z]*)\.([a-zA-Z][A-Za-z0-9]*)$/.exec(method.trim());
  return match?.[1];
}
function cdpallowlistof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const entry = value;
  const domains = Array.isArray(entry.domains) ? entry.domains.filter((domain) => typeof domain === "string" && cdpdomains.includes(domain)) : [];
  if (domains.length === 0) return void 0;
  if (entry.methods === void 0) return { domains };
  const methods = Array.isArray(entry.methods) ? entry.methods.filter((method) => typeof method === "string" && methoddomain(method) !== void 0 && domains.includes(methoddomain(method))) : [];
  if (methods.length === 0) return void 0;
  return { domains, methods };
}
function allowlistcovers(allowlist, method) {
  const domain = methoddomain(method);
  if (domain === void 0) return false;
  if (!allowlist.domains.includes(domain)) return false;
  if (allowlist.methods !== void 0 && !allowlist.methods.includes(method)) return false;
  return true;
}
function cdpeventruleof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const entry = value;
  const domain = typeof entry.domain === "string" && cdpdomains.includes(entry.domain) ? entry.domain : void 0;
  const event = typeof entry.event === "string" && entry.event.trim() ? entry.event.trim() : void 0;
  if (domain === void 0 || event === void 0) return void 0;
  const match = typeof entry.match === "string" && entry.match.trim() ? entry.match.trim() : void 0;
  return { domain, event, ...match !== void 0 ? { match } : {} };
}
function breakpointinputof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const entry = value;
  const url = typeof entry.url === "string" && entry.url.trim() ? entry.url.trim() : void 0;
  const line = typeof entry.line === "number" && Number.isInteger(entry.line) && entry.line >= 0 ? entry.line : void 0;
  if (url === void 0 || line === void 0) return void 0;
  const column = typeof entry.column === "number" && Number.isInteger(entry.column) && entry.column >= 0 ? entry.column : void 0;
  const condition = typeof entry.condition === "string" && entry.condition.trim() ? entry.condition.trim() : void 0;
  return { url, line, ...column !== void 0 ? { column } : {}, ...condition !== void 0 ? { condition } : {} };
}
function stepmodeof(value) {
  const modes = ["stepover", "stepinto", "stepout", "resume"];
  return typeof value === "string" && modes.includes(value) ? value : void 0;
}
function watchexpressionof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const entry = value;
  const expression = typeof entry.expression === "string" && entry.expression.trim() ? entry.expression.trim() : void 0;
  if (expression === void 0) return void 0;
  const scope = typeof entry.scope === "string" && entry.scope.trim() ? entry.scope.trim() : "topframe";
  return { expression, scope };
}
function overrideinputof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const entry = value;
  const urlpattern = typeof entry.urlpattern === "string" && entry.urlpattern.trim() ? entry.urlpattern.trim() : void 0;
  const source = typeof entry.source === "string" ? entry.source : void 0;
  if (urlpattern === void 0 || source === void 0 || source.trim().length === 0) return void 0;
  return { urlpattern, source };
}
function teardownplanof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const entry = value;
  const revertsteps = Array.isArray(entry.revertsteps) ? entry.revertsteps.filter((step) => typeof step === "string" && step.trim().length > 0) : [];
  const policy = entry.resumepolicy;
  if (revertsteps.length === 0) return void 0;
  if (policy !== void 0 && policy !== "resume" && policy !== "pause" && policy !== "ask") return void 0;
  return { revertsteps, resumepolicy: policy ?? "ask" };
}
var flowmetricnames = ["navigation", "paint", "lcp", "fid", "interaction", "blocking"];
var tracecategories = ["navigation", "scripting", "rendering", "painting", "loading", "network"];
function attachtargetof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const entry = value;
  const kinds = ["page", "iframe", "worker", "serviceworker"];
  const kind = typeof entry.kind === "string" && kinds.includes(entry.kind) ? entry.kind : void 0;
  const url = typeof entry.url === "string" && entry.url.trim() ? entry.url.trim() : void 0;
  if (kind === void 0 || url === void 0) return void 0;
  if (kind !== "page" && !/^https:\/\//.test(url)) return void 0;
  return { kind, url };
}
function flowspecof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const entry = value;
  const prefix = typeof entry.prefix === "string" && entry.prefix.trim() ? entry.prefix.trim() : void 0;
  const steps = Array.isArray(entry.steps) ? entry.steps.filter((step) => typeof step === "string" && step.trim().length > 0) : [];
  const metrics = Array.isArray(entry.metrics) ? entry.metrics.filter((metric) => typeof metric === "string" && flowmetricnames.includes(metric)) : [];
  if (prefix === void 0 || steps.length === 0 || metrics.length === 0) return void 0;
  return { prefix, steps, metrics };
}
function annotationof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const entry = value;
  const stepid = typeof entry.stepid === "string" && entry.stepid.trim() ? entry.stepid.trim() : void 0;
  const label = typeof entry.label === "string" && entry.label.trim() ? entry.label.trim() : void 0;
  if (stepid === void 0 || label === void 0) return void 0;
  const offset = typeof entry.offset === "number" && Number.isFinite(entry.offset) && entry.offset >= 0 ? entry.offset : 0;
  return { stepid, label, offset };
}

// environments.ts
var offloadfamilies = [
  { task: "htmlsnapshot", kinds: ["readhtml", "parsehtml", "readertree", "readoutline", "classifypage"] },
  { task: "jsonpayload", kinds: ["readjson", "parsejson"] },
  { task: "tablerows", kinds: ["readtable", "scrapetable", "detecttables", "deduperows", "transformvalues"] },
  { task: "a11ytree", kinds: ["a11ytree"] },
  { task: "complexselector", kinds: ["resolvexpath", "deriveselector", "detectvirtual"] },
  { task: "stitchshots", kinds: ["contactsheet", "timelapse", "makethumbs"] }
];
function offfamilyof(kind) {
  return offloadfamilies.find((family) => family.kinds.includes(kind))?.task;
}
function environmentsof(step) {
  if (markuprenderstep(step)) return ["sandboxframe"];
  if (step.kind === "evaluate") return ["isolatedworld"];
  if (offfamilyof(step.kind) !== void 0) return ["pagecontext", "offscreenworker"];
  return ["pagecontext"];
}
function defaultenvironment(step) {
  if (markuprenderstep(step)) return "sandboxframe";
  if (step.kind === "evaluate") return "isolatedworld";
  return "pagecontext";
}
function markuprenderstep(step) {
  if (!step.options) return false;
  try {
    const parsed = JSON.parse(step.options);
    return Boolean(parsed && typeof parsed === "object" && !Array.isArray(parsed) && typeof parsed.markup === "string" && parsed.markup.trim() !== "");
  } catch {
    return false;
  }
}
function environmentrequirementsof(kinds) {
  return kinds.map((kind) => {
    const bare = { kind };
    const environments = environmentsof(bare);
    return { kind, environments, defaultenvironment: defaultenvironment(bare) };
  });
}
var browserpermissions = ["geolocation", "notifications", "camera", "microphone", "clipboard-read", "clipboard-write", "midi", "persistent-storage"];
var permissionstates = ["granted", "denied", "prompt"];
function devicepresetof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const entry = value;
  const name = typeof entry.name === "string" && entry.name.trim() ? entry.name.trim() : void 0;
  const width = typeof entry.width === "number" && Number.isInteger(entry.width) && entry.width > 0 ? entry.width : void 0;
  const height = typeof entry.height === "number" && Number.isInteger(entry.height) && entry.height > 0 ? entry.height : void 0;
  const pixelratio = typeof entry.pixelratio === "number" && Number.isFinite(entry.pixelratio) && entry.pixelratio > 0 ? entry.pixelratio : void 0;
  if (name === void 0 || width === void 0 || height === void 0 || pixelratio === void 0) return void 0;
  return { name, width, height, pixelratio, mobile: entry.mobile === true };
}
function networkpresetof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const entry = value;
  const name = typeof entry.name === "string" && entry.name.trim() ? entry.name.trim() : void 0;
  const latency = typeof entry.latency === "number" && Number.isFinite(entry.latency) && entry.latency >= 0 ? entry.latency : void 0;
  const download = typeof entry.download === "number" && Number.isFinite(entry.download) && entry.download >= 0 ? entry.download : void 0;
  const upload = typeof entry.upload === "number" && Number.isFinite(entry.upload) && entry.upload >= 0 ? entry.upload : void 0;
  if (name === void 0 || latency === void 0 || download === void 0 || upload === void 0) return void 0;
  return { name, latency, download, upload, offline: entry.offline === true };
}
function locationpresetof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const entry = value;
  const name = typeof entry.name === "string" && entry.name.trim() ? entry.name.trim() : void 0;
  const latitude = typeof entry.latitude === "number" && Number.isFinite(entry.latitude) ? entry.latitude : void 0;
  const longitude = typeof entry.longitude === "number" && Number.isFinite(entry.longitude) ? entry.longitude : void 0;
  const accuracy = typeof entry.accuracy === "number" && Number.isFinite(entry.accuracy) && entry.accuracy >= 0 ? entry.accuracy : void 0;
  if (name === void 0 || latitude === void 0 || longitude === void 0 || accuracy === void 0) return void 0;
  if (!locationrangevalid(latitude, longitude)) return void 0;
  return { name, latitude, longitude, accuracy };
}
function agentpresetof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const entry = value;
  const name = typeof entry.name === "string" && entry.name.trim() ? entry.name.trim() : void 0;
  const useragent = typeof entry.useragent === "string" ? entry.useragent : void 0;
  const platform = typeof entry.platform === "string" && entry.platform.trim() ? entry.platform.trim() : void 0;
  const brands = Array.isArray(entry.brands) ? entry.brands.filter((brand) => typeof brand === "string" && brand.trim().length > 0) : [];
  if (name === void 0 || useragent === void 0 || platform === void 0 || brands.length === 0) return void 0;
  if (!agentgrammarvalid(useragent)) return void 0;
  return { name, useragent, platform, brands: [...new Set(brands)] };
}
function permissiongrantof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const entry = value;
  const name = typeof entry.name === "string" && browserpermissions.includes(entry.name) ? entry.name : void 0;
  const state = typeof entry.state === "string" && permissionstates.includes(entry.state) ? entry.state : void 0;
  if (name === void 0 || state === void 0) return void 0;
  return { name, state, runscope: entry.runscope !== false };
}
function blackboxruleof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const entry = value;
  const urlpatterns = Array.isArray(entry.urlpatterns) ? entry.urlpatterns.filter((pattern) => typeof pattern === "string" && /^https:\/\//.test(pattern)) : [];
  const tracescope = entry.tracescope;
  if (urlpatterns.length === 0) return void 0;
  if (tracescope !== "profiles" && tracescope !== "traces" && tracescope !== "both") return void 0;
  return { urlpatterns: [...new Set(urlpatterns)], tracescope };
}
function revertplanof(value) {
  const steps = Array.isArray(value) ? value.filter((step) => typeof step === "string" && step.trim().length > 0) : [];
  return steps.length > 0 ? steps : void 0;
}
function locationrangevalid(latitude, longitude) {
  return Number.isFinite(latitude) && Number.isFinite(longitude) && latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
}
function agentgrammarvalid(useragent) {
  const text = useragent.trim();
  if (text.length === 0 || text.length > 512) return false;
  if (/[\r\n]/.test(text)) return false;
  if (!/^[A-Za-z0-9][A-Za-z0-9._+\-()/:; ,]*$/.test(text)) return false;
  return /\/\d/.test(text) || /\d+\.\d+/.test(text);
}
function permissiongrade(name) {
  return name === "geolocation" || name === "camera" || name === "microphone" || name === "notifications" ? "powerful" : "standard";
}
function locationconsentcovers(origin, latitude, longitude, consents) {
  return consents.some((consent) => consent.origin === origin && consent.approved === true && consent.revokedat === void 0 && consent.latitude === latitude && consent.longitude === longitude);
}

// session.ts
var sessionfileversion = 1;
var snapshotsections = ["tabs", "scroll", "forms", "storage", "cookies"];
var searchfields = ["urls", "titles", "names", "text"];
function checksumtext(payload) {
  let hash = 2166136261;
  for (let index = 0; index < payload.length; index += 1) {
    hash ^= payload.charCodeAt(index);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}
function sessiontabof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const candidate = value;
  if (typeof candidate.url !== "string" || !candidate.url.trim()) return void 0;
  if (typeof candidate.title !== "string") return void 0;
  if (typeof candidate.index !== "number" || !Number.isInteger(candidate.index) || candidate.index < 0) return void 0;
  const scrollx = typeof candidate.scrollx === "number" && Number.isFinite(candidate.scrollx) ? candidate.scrollx : 0;
  const scrolly = typeof candidate.scrolly === "number" && Number.isFinite(candidate.scrolly) ? candidate.scrolly : 0;
  const forms = Array.isArray(candidate.forms) ? candidate.forms.flatMap((entry) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) return [];
    const form = entry;
    if (typeof form.selector !== "string" || !form.selector.trim()) return [];
    return [{ selector: form.selector, value: typeof form.value === "string" ? form.value : "" }];
  }) : [];
  return { url: candidate.url, title: candidate.title, index: candidate.index, scrollx, scrolly, forms };
}
function autointervalof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const candidate = value;
  if (typeof candidate.period !== "number" || !Number.isFinite(candidate.period) || candidate.period <= 0) return void 0;
  if (typeof candidate.maxsnapshots !== "number" || !Number.isInteger(candidate.maxsnapshots) || candidate.maxsnapshots < 1) return void 0;
  if (typeof candidate.expiry !== "number" || !Number.isFinite(candidate.expiry) || candidate.expiry < 0) return void 0;
  return { period: candidate.period, maxsnapshots: candidate.maxsnapshots, expiry: candidate.expiry };
}
function snapshotplanof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const candidate = value;
  if (candidate.scope !== "tab" && candidate.scope !== "run" && candidate.scope !== "all") return void 0;
  const sections = Array.isArray(candidate.sections) ? candidate.sections.flatMap((section) => typeof section === "string" && snapshotsections.includes(section) ? [section] : []) : [];
  if (sections.length === 0) return void 0;
  if (typeof candidate.captures !== "boolean") return void 0;
  const auto = candidate.auto === void 0 ? void 0 : autointervalof(candidate.auto);
  if (candidate.auto !== void 0 && auto === void 0) return void 0;
  return { scope: candidate.scope, sections, captures: candidate.captures, ...auto !== void 0 ? { auto } : {} };
}
function restoreplanof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const candidate = value;
  if (candidate.tabpolicy !== "reopen" && candidate.tabpolicy !== "skip") return void 0;
  if (candidate.formpolicy !== "restore" && candidate.formpolicy !== "skip") return void 0;
  if (candidate.capturepolicy !== "link" && candidate.capturepolicy !== "skip") return void 0;
  return { tabpolicy: candidate.tabpolicy, formpolicy: candidate.formpolicy, capturepolicy: candidate.capturepolicy };
}
function searchqueryof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const candidate = value;
  const terms = Array.isArray(candidate.terms) ? candidate.terms.flatMap((term) => typeof term === "string" && term.trim() ? [term.trim()] : []) : [];
  if (terms.length === 0) return void 0;
  const fields = Array.isArray(candidate.fields) ? candidate.fields.flatMap((field) => typeof field === "string" && searchfields.includes(field) ? [field] : []) : [...searchfields];
  if (fields.length === 0) return void 0;
  const from = typeof candidate.from === "number" && Number.isFinite(candidate.from) ? candidate.from : void 0;
  const to = typeof candidate.to === "number" && Number.isFinite(candidate.to) ? candidate.to : void 0;
  if (from !== void 0 && to !== void 0 && from > to) return void 0;
  return { terms, fields, ...from !== void 0 ? { from } : {}, ...to !== void 0 ? { to } : {} };
}
function importsessionfile(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const candidate = value;
  if (candidate.formatversion !== sessionfileversion) return void 0;
  const records = Array.isArray(candidate.records) ? candidate.records.flatMap((record) => sessionrecordvalid(record) ? [record] : []) : [];
  if (records.length === 0) return void 0;
  if (!Array.isArray(candidate.recordids) || candidate.recordids.length !== records.length || !candidate.recordids.every((id, index) => id === records[index]?.id)) return void 0;
  const bytesize = typeof candidate.bytesize === "number" && Number.isFinite(candidate.bytesize) ? candidate.bytesize : -1;
  if (bytesize < 0) return void 0;
  const checksum = typeof candidate.checksum === "string" ? candidate.checksum : "";
  if (checksum !== checksumtext(`${sessionfileversion}:${candidate.recordids.join(",")}:${bytesize}`)) return void 0;
  return { formatversion: sessionfileversion, records, recordids: candidate.recordids, bytesize, checksum, exportedat: typeof candidate.exportedat === "number" && Number.isFinite(candidate.exportedat) ? candidate.exportedat : 0 };
}
function sessionrecordvalid(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const candidate = value;
  if (typeof candidate.id !== "string" || !candidate.id.trim()) return false;
  if (typeof candidate.name !== "string" || !candidate.name.trim()) return false;
  if (typeof candidate.createdat !== "number" || !Number.isFinite(candidate.createdat)) return false;
  if (!Array.isArray(candidate.tabs) || !candidate.tabs.every((tab) => sessiontabof(tab) !== void 0)) return false;
  if (!Array.isArray(candidate.captures) || !candidate.captures.every((id) => typeof id === "string")) return false;
  if (!Array.isArray(candidate.tags) || !candidate.tags.every((tag) => typeof tag === "string")) return false;
  return true;
}

// auth.ts
var tokenhashprefix = "sha256:";
var defaulttokenlifetimems = 36e5;
var defaultpairinglifetimems = 3e5;
var defaultchallengelifetimems = 12e4;
var authrefusedmessage = "The remote frame failed its authentication handshake.";
async function tokenhashof(raw) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  return tokenhashprefix + [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
function issuepairingcode(input) {
  const scopes = input.scopes.filter((scope) => toolnamespaces.includes(scope));
  return { code: input.code ?? `DT-${randomid().replace(/-/g, "").slice(0, 8).toUpperCase()}`, scopes, issuedat: input.now, expiresat: input.now + (input.lifetime ?? defaultpairinglifetimems) };
}
function redeempairingcode(input) {
  const match = input.codes.find((candidate) => candidate.code === input.code);
  if (match === void 0) return { reason: authrefusedmessage };
  if (match.usedat !== void 0) return { reason: "The pairing code was already used once and never pairs a second client." };
  if (input.now >= match.expiresat) return { reason: "The pairing code expired before the exchange completed." };
  return { code: { ...match, usedat: input.now } };
}
async function issuetoken(input) {
  const raw = input.raw ?? `${randomid()}.${randomid()}`;
  const token = { id: input.id ?? randomid(), clientid: input.clientid, hash: await tokenhashof(raw), scopes: input.scopes.filter((scope) => toolnamespaces.includes(scope)), issuedat: input.now, expiresat: input.now + (input.lifetime ?? defaulttokenlifetimems) };
  return { token, raw };
}
async function verifytoken(input) {
  const hash = await tokenhashof(input.raw);
  const match = input.tokens.find((candidate) => candidate.hash === hash);
  if (match === void 0) return { reason: authrefusedmessage };
  if (match.revokedat !== void 0) return { reason: authrefusedmessage };
  if (input.now >= match.expiresat) return { reason: authrefusedmessage };
  return { token: match };
}
function revokeclient(tokens, clientid, now) {
  return tokens.map((token) => token.clientid === clientid && token.revokedat === void 0 ? { ...token, revokedat: now } : token);
}
function expiretokens(input) {
  const expired = input.tokens.filter((token) => token.revokedat === void 0 && input.now >= token.expiresat);
  return { live: input.tokens.filter((token) => !expired.includes(token)), expired };
}
function checkallowlist(input) {
  const entry = input.entries.find((candidate) => candidate.fingerprint === input.fingerprint);
  if (entry === void 0) return { allowed: false, reason: `The client fingerprint ${input.fingerprint} is not on the allowlist and is refused.` };
  if (input.namespace !== void 0 && !entry.namespaces.includes(input.namespace)) return { allowed: false, reason: `The allowlist entry ${entry.displayname} grants no ${input.namespace} tools.` };
  return { allowed: true };
}
function grantallowlistentry(input) {
  const scopes = input.namespaces.filter((scope) => toolnamespaces.includes(scope));
  const existing = input.entries.find((entry) => entry.fingerprint === input.identity.fingerprint);
  if (existing === void 0) {
    return [{ fingerprint: input.identity.fingerprint, displayname: input.identity.displayname, namespaces: scopes, grantedat: input.now, history: [{ at: input.now, actor: input.actor, change: `Granted the ${scopes.length > 0 ? scopes.join(", ") : "no"} namespaces.` }] }, ...input.entries];
  }
  return input.entries.map((entry) => entry.fingerprint !== input.identity.fingerprint ? entry : { ...entry, displayname: input.identity.displayname, namespaces: scopes, history: [{ at: input.now, actor: input.actor, change: `Rescoped to ${scopes.length > 0 ? scopes.join(", ") : "no"} namespaces.` }, ...entry.history] });
}
function issuechallenge(input) {
  return { nonce: input.nonce ?? randomid(), method: input.method, issuedat: input.now, expiresat: input.now + (input.lifetime ?? defaultchallengelifetimems) };
}
async function verifyauth(input) {
  if (input.nonce !== input.challenge.nonce) return { verified: false, reason: authrefusedmessage };
  if (input.now >= input.challenge.expiresat) return { verified: false, reason: "The auth challenge expired before the handshake completed." };
  const checked = await verifytoken({ tokens: input.tokens, raw: input.rawtoken, now: input.now });
  if (checked.token === void 0) return { verified: false, reason: authrefusedmessage };
  return { verified: true, clientid: checked.token.clientid };
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
function oauthflowof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const options = value;
  if (typeof options.provider !== "string" || !options.provider.trim()) return void 0;
  if (typeof options.authorizeurl !== "string" || !options.authorizeurl.trim()) return void 0;
  if (typeof options.tokenurl !== "string" || !options.tokenurl.trim()) return void 0;
  if (!Array.isArray(options.scopes) || options.scopes.length === 0 || !options.scopes.every((item) => typeof item === "string" && item.trim().length > 0)) return void 0;
  if (typeof options.redirectorigin !== "string" || !options.redirectorigin.trim()) return void 0;
  return { provider: options.provider.trim(), authorizeurl: options.authorizeurl.trim(), tokenurl: options.tokenurl.trim(), scopes: options.scopes.map((item) => item.trim()), redirectorigin: options.redirectorigin.trim() };
}
function authorizeurl(flow, state) {
  const url = new URL(flow.authorizeurl);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", flow.redirectorigin);
  url.searchParams.set("scope", flow.scopes.join(" "));
  url.searchParams.set("state", state);
  return url.toString();
}
function capturecode(url, redirectorigin, state) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return { error: "The redirect url does not parse for the code capture." };
  }
  const granted = redirectorigin.includes("/", redirectorigin.indexOf("://") + 3) ? `${parsed.origin}${parsed.pathname}`.startsWith(redirectorigin) : parsed.origin === redirectorigin;
  if (!granted) return { error: `The redirect landed on ${parsed.origin} outside the granted redirect origin ${redirectorigin}.` };
  const returned = parsed.searchParams.get("state");
  if (returned !== state) return { error: "The redirect state token does not match the reviewed flow." };
  const error = parsed.searchParams.get("error");
  if (error) return { error: `The provider refused the flow: ${error}.` };
  const code = parsed.searchParams.get("code");
  if (!code) return { error: "The redirect carries no authorization code." };
  return { code };
}
function parsetokens(body) {
  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch {
    return void 0;
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return void 0;
  const record = parsed;
  const tokens = {};
  if (typeof record["access_token"] === "string" && record["access_token"]) tokens.accesstoken = record["access_token"];
  if (typeof record["refresh_token"] === "string" && record["refresh_token"]) tokens.refreshtoken = record["refresh_token"];
  if (typeof record["expires_in"] === "number" && Number.isFinite(record["expires_in"]) && record["expires_in"] >= 0) tokens.expiresin = record["expires_in"];
  if (typeof record.scope === "string" && record.scope.trim()) tokens.scopes = record.scope.trim().split(/\s+/);
  if (tokens.accesstoken === void 0 && tokens.refreshtoken === void 0) return void 0;
  return tokens;
}
function tokenrequest(flow, input) {
  if (input.refreshtoken !== void 0) return { url: flow.tokenurl, body: urlencodeform([{ name: "grant_type", value: "refresh_token" }, { name: "refresh_token", value: input.refreshtoken }]) };
  return { url: flow.tokenurl, body: urlencodeform([{ name: "grant_type", value: "authorization_code" }, { name: "code", value: input.code ?? "" }, { name: "redirect_uri", value: flow.redirectorigin }]) };
}
function revocationruleof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const options = value;
  if (!Array.isArray(options.tokenids) || options.tokenids.length === 0 || !options.tokenids.every((item) => typeof item === "string" && item.trim().length > 0)) return void 0;
  if (typeof options.reason !== "string" || !options.reason.trim()) return void 0;
  return { tokenids: options.tokenids.map((item) => item.trim()), reason: options.reason.trim(), revokedat: Date.now() };
}
function formpayloadof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const options = value;
  if (typeof options.url !== "string" || !options.url.trim()) return void 0;
  if (!Array.isArray(options.fields) || options.fields.length === 0) return void 0;
  const fields = [];
  for (const item of options.fields) {
    if (!item || typeof item !== "object" || Array.isArray(item)) return void 0;
    const field = item;
    if (typeof field.name !== "string" || !field.name.trim()) return void 0;
    if (typeof field.value !== "string") return void 0;
    fields.push({ name: field.name.trim(), value: field.value });
  }
  return { url: options.url.trim(), fields, ...typeof options.encoding === "string" && options.encoding.trim() ? { encoding: options.encoding.trim() } : {} };
}
function urlencodeform(fields) {
  return fields.map((field) => `${formencode(field.name)}=${formencode(field.value)}`).join("&");
}
function formencode(value) {
  const bytes = [...new TextEncoder().encode(value)];
  return bytes.map((byte) => byte >= 65 && byte <= 90 || byte >= 97 && byte <= 122 || byte >= 48 && byte <= 57 || byte === 45 || byte === 95 || byte === 46 || byte === 126 ? String.fromCharCode(byte) : `%${byte.toString(16).toUpperCase().padStart(2, "0")}`).join("");
}
function multipartpayloadof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const options = value;
  if (typeof options.url !== "string" || !options.url.trim()) return void 0;
  if (!Array.isArray(options.files) || options.files.length === 0) return void 0;
  const fields = [];
  for (const item of Array.isArray(options.fields) ? options.fields : []) {
    if (!item || typeof item !== "object" || Array.isArray(item)) return void 0;
    const field = item;
    if (typeof field.name !== "string" || !field.name.trim()) return void 0;
    if (typeof field.value !== "string") return void 0;
    fields.push({ name: field.name.trim(), value: field.value });
  }
  const files = [];
  for (const item of options.files) {
    if (!item || typeof item !== "object" || Array.isArray(item)) return void 0;
    const file = item;
    if (typeof file.name !== "string" || !file.name.trim()) return void 0;
    if (typeof file.filename !== "string" || !file.filename.trim()) return void 0;
    if (typeof file.mime !== "string" || !file.mime.trim()) return void 0;
    if (typeof file.content !== "string") return void 0;
    if (file.reviewed !== true) return void 0;
    files.push({ name: file.name.trim(), filename: file.filename.trim(), mime: file.mime.trim(), content: file.content, reviewed: true });
  }
  const payload = { url: options.url.trim(), fields, files, ...typeof options.boundary === "string" && options.boundary.trim() ? { boundary: options.boundary.trim() } : {} };
  return payload;
}
function newboundary() {
  return `----devthink${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`;
}
function multipartchunks(payload) {
  const boundary = payload.boundary ?? newboundary();
  const chunks = [];
  for (const field of payload.fields) chunks.push(`--${boundary}\r
content-disposition: form-data; name="${field.name}"\r
\r
${field.value}\r
`);
  for (const file of payload.files) chunks.push(`--${boundary}\r
content-disposition: form-data; name="${file.name}"; filename="${file.filename}"\r
content-type: ${file.mime}\r
\r
${file.content}\r
`);
  chunks.push(`--${boundary}--\r
`);
  return { chunks, boundary, bytes: chunks.reduce((total, chunk) => total + chunk.length, 0) };
}
var bridgepairingscopes = ["browser"];
function mintbridgepairing(input) {
  const origin = input.origin.trim();
  if (origin === "") throw new Error("The bridge pairing names its relay origin; the origin is the user configured relay url the code binds to.");
  return { origin, code: issuepairingcode({ now: input.now, scopes: [...bridgepairingscopes], ...input.lifetime !== void 0 ? { lifetime: input.lifetime } : {}, ...input.code !== void 0 ? { code: input.code } : {} }), at: input.now };
}
function pairingcountdown(record, now) {
  const secondsleft = Math.max(0, Math.ceil((record.code.expiresat - now) / 1e3));
  const expired = now >= record.code.expiresat || record.code.usedat !== void 0;
  const minutes = Math.floor(secondsleft / 60);
  const seconds = secondsleft % 60;
  const label = expired ? `The pairing code ${record.code.code} expired.` : `The pairing code ${record.code.code} expires in ${minutes}m ${String(seconds).padStart(2, "0")}s.`;
  return { secondsleft, expired, label };
}
async function exchangebridgepairing(input) {
  const origin = input.origin.trim();
  if (origin === "") return { reason: "The pairing exchange names its relay origin." };
  const sessionid = input.sessionid.trim();
  if (sessionid === "") return { reason: "The pairing exchange names its session." };
  const match = input.records.find((record2) => record2.origin === origin && record2.code.code === input.code.trim());
  if (match === void 0) return { reason: `No pending pairing code of the origin ${origin} matches the typed code.` };
  const redemption = redeempairingcode({ codes: input.records.map((record2) => record2.code), code: input.code.trim(), now: input.now });
  if (redemption.reason !== void 0) return { reason: redemption.reason };
  if (redemption.code === void 0) return { reason: "The pairing code redeemed no session." };
  const raw = `${randomid()}.${randomid()}`;
  const record = { id: randomid(), sessionid, origin, hash: await tokenhashof(raw), issuedat: input.now, ...input.lifetime !== void 0 && Number.isFinite(input.lifetime) && input.lifetime > 0 ? { expiresat: input.now + input.lifetime } : {} };
  return { record, raw, used: redemption.code };
}
async function rotatebridgetoken(input) {
  const sessionid = input.sessionid.trim();
  if (sessionid === "") throw new Error("The token rotation names its session.");
  const origin = input.origin.trim();
  if (origin === "") throw new Error("The token rotation names its relay origin.");
  const current = input.tokens.filter((token) => token.sessionid === sessionid && token.origin === origin && token.revokedat === void 0).pop();
  const raw = input.raw ?? `${randomid()}.${randomid()}`;
  const record = { id: randomid(), sessionid, origin, hash: await tokenhashof(raw), issuedat: input.now, ...current !== void 0 ? { rotatedfrom: current.id } : {}, ...input.lifetime !== void 0 && Number.isFinite(input.lifetime) && input.lifetime > 0 ? { expiresat: input.now + input.lifetime } : {} };
  const tokens = input.tokens.map((token) => token.id === current?.id ? { ...token, revokedat: input.now } : token);
  return { tokens: [...tokens, record], raw, record };
}
async function verifybridgetoken(input) {
  const hash = await tokenhashof(input.raw);
  const match = input.tokens.find((token) => token.hash === hash);
  if (match === void 0) return { ok: false, reason: "The frame token matches no pairing of this bridge." };
  if (match.origin !== input.origin) return { ok: false, reason: "The frame token stays scoped to its relay origin and never crosses to another relay." };
  if (match.sessionid !== input.sessionid) return { ok: false, reason: "The frame token stays scoped to its session and never crosses to another session." };
  if (match.revokedat !== void 0) return { ok: false, reason: "The frame token carries its revocation; a rotated or revoked token never passes again." };
  if (match.expiresat !== void 0 && input.now >= match.expiresat) return { ok: false, reason: "The frame token expired before the frame arrived." };
  return { ok: true, token: match };
}
function tokenscopedkey(origin) {
  const trimmed = origin.trim();
  if (trimmed === "") throw new Error("The token storage key names its relay origin.");
  return `bridgetokens:${trimmed}`;
}
function revokeallsessions(tokens, now) {
  return tokens.map((token) => token.revokedat === void 0 ? { ...token, revokedat: now } : token);
}
function livetokensof(tokens, origin, now) {
  return tokens.filter((token) => token.origin === origin && token.revokedat === void 0 && (token.expiresat === void 0 || now < token.expiresat));
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

// net.ts
var privatemimes = /* @__PURE__ */ new Set(["text/html", "text/plain", "text/xml", "application/xml", "application/json", "text/json", "application/x-www-form-urlencoded", "application/graphql", "multipart/form-data"]);
function privatemime(mime) {
  return privatemimes.has((mime.split(";")[0] ?? "").trim().toLowerCase());
}
function apireplayspecof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const entry = value;
  if (typeof entry.endpoint !== "string" || !entry.endpoint.trim()) return void 0;
  const spec = { endpoint: entry.endpoint.trim() };
  if (typeof entry.verb === "string" && entry.verb.trim()) spec.verb = entry.verb.trim().toUpperCase();
  if (entry.overrides !== void 0 && entry.overrides !== null && typeof entry.overrides === "object" && !Array.isArray(entry.overrides)) {
    const overrides = {};
    for (const [name, override] of Object.entries(entry.overrides)) {
      if (typeof override === "string") overrides[name] = override;
    }
    spec.overrides = overrides;
  }
  if (Array.isArray(entry.paths)) spec.paths = entry.paths.filter((path) => typeof path === "string" && path.trim().length > 0);
  return spec;
}
function channelorigin(url) {
  try {
    const parsed = new URL(url);
    const protocol = parsed.protocol === "wss:" ? "https:" : parsed.protocol === "ws:" ? "http:" : parsed.protocol;
    return `${protocol}//${parsed.host}`;
  } catch {
    return "";
  }
}
function channeloptionsof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const entry = value;
  if (typeof entry.url !== "string" || !entry.url.trim()) return void 0;
  const options = {};
  if (Array.isArray(entry.protocols)) options.protocols = entry.protocols.filter((item) => typeof item === "string" && item.trim().length > 0);
  if (typeof entry.reconnect === "number" && Number.isFinite(entry.reconnect)) options.reconnect = entry.reconnect;
  if (typeof entry.backoff === "number" && Number.isFinite(entry.backoff)) options.backoff = entry.backoff;
  if (typeof entry.backoffceiling === "number" && Number.isFinite(entry.backoffceiling)) options.backoffceiling = entry.backoffceiling;
  if (typeof entry.lifetime === "number" && Number.isFinite(entry.lifetime)) options.lifetime = entry.lifetime;
  return { url: entry.url.trim(), options };
}
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
function subscriptionoptionsof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const entry = value;
  if (typeof entry.url !== "string" || !entry.url.trim()) return void 0;
  const cancel = entry.cancel;
  if (!cancel || typeof cancel !== "object" || Array.isArray(cancel)) return void 0;
  const cancelrecord = cancel;
  if (cancelrecord.kind !== "stop" && cancelrecord.kind !== "lifetime") return void 0;
  if (typeof cancelrecord.value !== "string" && typeof cancelrecord.value !== "number") return void 0;
  const result = { url: entry.url.trim(), cancel: { kind: cancelrecord.kind, value: cancelrecord.value } };
  if (typeof entry.lifetime === "number" && Number.isFinite(entry.lifetime) && entry.lifetime > 0) result.lifetime = entry.lifetime;
  if (typeof entry.lasteventid === "string" && entry.lasteventid.trim()) result.lasteventid = entry.lasteventid.trim();
  return result;
}
function pollcursorof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const entry = value;
  if (typeof entry.url !== "string" || !entry.url.trim()) return void 0;
  if (typeof entry.cursorfield !== "string" || !entry.cursorfield.trim()) return void 0;
  if (typeof entry.interval !== "number" || !Number.isFinite(entry.interval) || entry.interval <= 0) return void 0;
  const stop = entry.stop;
  if (!stop || typeof stop !== "object" || Array.isArray(stop)) return void 0;
  const stoprecord = stop;
  if (typeof stoprecord.field !== "string" || !stoprecord.field.trim()) return void 0;
  if (typeof stoprecord.equals !== "string") return void 0;
  const cursor = { url: entry.url.trim(), cursorfield: entry.cursorfield.trim(), interval: entry.interval, stop: { field: stoprecord.field.trim(), equals: stoprecord.equals } };
  if (typeof entry.maxpolls === "number" && Number.isFinite(entry.maxpolls) && entry.maxpolls >= 1) cursor.maxpolls = Math.floor(entry.maxpolls);
  if (typeof entry.param === "string" && entry.param.trim()) cursor.param = entry.param.trim();
  return cursor;
}
function patternorigin(pattern) {
  const trimmed = pattern.trim();
  if (!trimmed.startsWith("https://")) return void 0;
  const rest = trimmed.slice("https://".length);
  const host = rest.split("/")[0] ?? "";
  if (!host.trim()) return void 0;
  return `https://${host.toLowerCase()}`;
}
function blockruleof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const options = value;
  if (typeof options.urlpattern !== "string" || !options.urlpattern.trim()) return void 0;
  const rule = { urlpattern: options.urlpattern.trim() };
  if (Array.isArray(options.resourcetypes)) {
    const types = options.resourcetypes.filter((item) => typeof item === "string" && item.trim().length > 0);
    if (types.length === 0) return void 0;
    rule.resourcetypes = types;
  }
  return rule;
}
function mockspecof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const options = value;
  if (typeof options.urlpattern !== "string" || !options.urlpattern.trim()) return void 0;
  if (typeof options.status !== "number" || !Number.isInteger(options.status) || options.status < 100 || options.status > 599) return void 0;
  const hasbody = typeof options.body === "string";
  const bodyref = typeof options.bodyref === "string" ? options.bodyref.trim() : "";
  if (!hasbody && bodyref === "") return void 0;
  const spec = { urlpattern: options.urlpattern.trim(), status: options.status };
  if (hasbody) spec.body = options.body;
  if (bodyref !== "") spec.bodyref = bodyref;
  if (options.headers && typeof options.headers === "object" && !Array.isArray(options.headers)) spec.headers = options.headers;
  if (options.reviewed === true) spec.reviewed = true;
  return spec;
}
function headeruleof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const options = value;
  if (typeof options.urlpattern !== "string" || !options.urlpattern.trim()) return void 0;
  if (typeof options.name !== "string" || !options.name.trim()) return void 0;
  if (options.operation !== "set" && options.operation !== "append" && options.operation !== "remove") return void 0;
  if (options.operation === "remove" && options.value !== void 0) return void 0;
  if (options.operation !== "remove" && typeof options.value !== "string") return void 0;
  const rule = { urlpattern: options.urlpattern.trim(), name: options.name.trim(), operation: options.operation };
  if (options.operation !== "remove") rule.value = typeof options.value === "string" ? options.value : "";
  return rule;
}
function cookierecordof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const options = value;
  if (typeof options.name !== "string" || !options.name.trim()) return void 0;
  if (typeof options.domain !== "string" || !options.domain.trim()) return void 0;
  if (typeof options.path !== "string" || !options.path.trim()) return void 0;
  if (typeof options.value !== "string") return void 0;
  const record = { name: options.name.trim(), domain: options.domain.trim().toLowerCase(), path: options.path.trim(), value: options.value };
  if (typeof options.expiresat === "number" && Number.isFinite(options.expiresat)) record.expiresat = options.expiresat;
  return record;
}
function cookiedomaingranted(domain, grants) {
  const host = domain.trim().toLowerCase().replace(/^\./, "");
  return grants.some((grant) => {
    let granthost = "";
    try {
      granthost = new URL(grant).hostname.toLowerCase();
    } catch {
      return false;
    }
    return host === granthost || host.endsWith(`.${granthost}`);
  });
}
function proxyrouteof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const options = value;
  if (options.scheme !== "http" && options.scheme !== "https" && options.scheme !== "socks4" && options.scheme !== "socks5") return void 0;
  if (typeof options.host !== "string" || !options.host.trim()) return void 0;
  if (typeof options.port !== "number" || !Number.isInteger(options.port) || options.port < 1 || options.port > 65535) return void 0;
  if (!Array.isArray(options.bypass) || options.bypass.length === 0 || !options.bypass.every((item) => typeof item === "string" && item.trim().length > 0)) return void 0;
  return { scheme: options.scheme, host: options.host.trim(), port: options.port, bypass: options.bypass.map((item) => item.trim()) };
}

// run.ts
var loglevels = ["error", "warn", "info", "log", "debug", "trace"];
var timelinesources = ["console", "error", "rejection", "resource", "longtask", "network", "cdp"];

// gates.ts
function stepoptions(step) {
  if (!step.options) return {};
  try {
    const parsed = JSON.parse(step.options);
    return Boolean(parsed) && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}
function gatekindfor(classes) {
  if (classes.includes("payment")) return "confirmpay";
  if (classes.includes("delete")) return "confirmdelete";
  if (classes.includes("credential")) return "confirmcreds";
  return void 0;
}
function paypayload(input) {
  const payload = { payeeorigin: input.payeeorigin };
  if (input.amount !== void 0 && input.amount.trim() !== "") payload.amount = input.amount.trim();
  if (input.target !== void 0 && input.target.trim() !== "") payload.target = input.target.trim();
  return payload;
}
function deletepayload(input) {
  const payload = { scope: input.scope, irreversibility: input.irreversibility };
  if (input.target !== void 0 && input.target.trim() !== "") payload.target = input.target.trim();
  return payload;
}
function credspayload(label) {
  if (label.trim() === "") throw new Error("The confirmcreds gate names its credential label; the value never appears.");
  return { label: label.trim() };
}
function opengate(input) {
  if (input.stepid.trim() === "" || input.runid.trim() === "" || input.origin.trim() === "") throw new Error("The confirm gate needs its step, run and origin.");
  if (Object.keys(input.payload).length === 0) throw new Error("The confirm gate carries the payload the human reviews.");
  return { gateid: input.gateid ?? randomid(), kind: input.kind, stepid: input.stepid, runid: input.runid, origin: input.origin, payload: { ...input.payload }, state: "open", openedat: input.now };
}
function gatestateof(gates, stepid) {
  const gate = [...gates].reverse().find((candidate) => candidate.stepid === stepid);
  if (gate === void 0) return { state: "none" };
  return { state: gate.state, gate };
}
function resolvegate(input) {
  if (input.actor.trim() === "") throw new Error("The gate resolution names its acting user; only a human resolves a gate.");
  const gate = input.gates.find((candidate) => candidate.gateid === input.gateid);
  if (gate === void 0) return { gates: input.gates };
  if (gate.state !== "open") return { gates: input.gates };
  const resolution = { gateid: gate.gateid, kind: gate.kind, stepid: gate.stepid, decision: input.decision, actor: input.actor, at: input.now };
  return { gates: input.gates.map((candidate) => candidate.gateid === input.gateid ? { ...candidate, state: input.decision, resolvedat: input.now, actor: input.actor } : candidate), resolution };
}
function nobatchresolution(gateids) {
  if (gateids.length > 1) return { allowed: false, reason: `One human action resolves exactly one gate; the batch of ${gateids.length} gates refuses in full because no batch approval exists.` };
  if (gateids.length === 0) return { allowed: false, reason: "A gate resolution names its single gate." };
  return { allowed: true, reason: "The resolution names exactly one gate; the distinct human action resolves it alone." };
}
function gateprompttext(gate) {
  if (gate.kind === "confirmpay") {
    const amount = gate.payload.amount !== void 0 ? `the amount ${gate.payload.amount}` : "an amount the step options name";
    const target = gate.payload.target !== void 0 ? ` on ${gate.payload.target}` : "";
    return `Approve the payment of ${amount} to ${gate.payload.payeeorigin}${target}? The step dispatches only after this distinct human action.`;
  }
  if (gate.kind === "confirmdelete") {
    const target = gate.payload.target !== void 0 ? ` on ${gate.payload.target}` : "";
    return `Approve the destructive delete${target} scoped to ${gate.payload.scope}? ${gate.payload.irreversibility} The step dispatches only after this distinct human action.`;
  }
  return `Approve the use of the credential ${gate.payload.label} on ${gate.origin}? The value stays behind the vault; the label is everything this prompt shows.`;
}
function gateforstep(input) {
  const kind = gatekindfor(input.classes);
  if (kind === void 0) return void 0;
  const options = stepoptions(input.step);
  if (kind === "confirmpay") {
    const amount = typeof options.amount === "string" ? options.amount : typeof options.value === "string" ? options.value : void 0;
    return opengate({ kind, stepid: input.step.id, runid: input.runid, origin: input.origin, payload: paypayload({ ...amount !== void 0 && amount !== "" ? { amount } : {}, payeeorigin: String(options.payeeorigin ?? input.origin), ...input.step.target !== void 0 && input.step.target !== "" ? { target: input.step.target } : {} }), now: input.now });
  }
  if (kind === "confirmdelete") {
    return opengate({ kind, stepid: input.step.id, runid: input.runid, origin: input.origin, payload: deletepayload({ ...input.step.target !== void 0 && input.step.target !== "" ? { target: input.step.target } : {}, scope: String(options.scope ?? input.origin), irreversibility: String(options.irreversibility ?? "A destructive delete destroys state the page cannot restore.") }), now: input.now });
  }
  if (input.credentiallabel === void 0 || input.credentiallabel.trim() === "") return void 0;
  return opengate({ kind, stepid: input.step.id, runid: input.runid, origin: input.origin, payload: credspayload(input.credentiallabel), now: input.now });
}
var defaultapprovalwindowms = 12e4;
function requireapproval(input) {
  return { id: input.id ?? randomid(), clientid: input.clientid, tool: input.tool, reason: input.reason, params: input.params, ...input.secretfields !== void 0 && input.secretfields.length > 0 ? { secretfields: input.secretfields } : {}, state: "pending", raisedat: input.now, ...input.timeout !== void 0 ? { timeoutat: input.now + input.timeout } : {} };
}
function resolveapproval(input) {
  const gate = input.requests.find((request) => request.id === input.id);
  if (gate === void 0 || gate.state !== "pending") return { requests: input.requests };
  const decision = input.decision;
  const requests = input.requests.map((request) => request.id === input.id ? { ...request, state: decision, decidedat: input.now, actor: input.actor } : request);
  return { requests, exec: { requestid: input.id, decision, actor: input.actor, at: input.now, latencyms: input.now - gate.raisedat } };
}
function expireapprovals(requests, now) {
  return requests.map((request) => request.state === "pending" && request.timeoutat !== void 0 && now >= request.timeoutat ? { ...request, state: "expired" } : request);
}
function listapprovals(requests) {
  return [...requests].sort((one, two) => two.raisedat - one.raisedat);
}
function redactparams(params, secretfields) {
  const redacted = {};
  for (const [name, value] of Object.entries(params)) redacted[name] = secretfields.includes(name) ? "[redacted]" : value;
  return redacted;
}
function approvalprompt(request, identity) {
  const who = identity !== void 0 ? `the client ${identity.displayname} (${identity.fingerprint})` : `the client ${request.clientid}`;
  const params = JSON.stringify(redactparams(request.params, request.secretfields ?? []));
  return `${who} calls ${request.tool}: ${request.reason} Arguments: ${params}`;
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

// workflow.ts
function nestedparamof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const candidate = value;
  if (typeof candidate.name !== "string" || !/^[a-z][a-z0-9]*$/.test(candidate.name)) return void 0;
  if (!variablekinds.includes(candidate.kind)) return void 0;
  if (candidate.default !== void 0 && !["string", "number", "boolean"].includes(typeof candidate.default) && !Array.isArray(candidate.default)) return void 0;
  return { name: candidate.name, kind: candidate.kind, ...candidate.default !== void 0 ? { default: candidate.default } : {} };
}
function workflowstepof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const candidate = value;
  if (typeof candidate.id !== "string" || !candidate.id.trim()) return void 0;
  if (typeof candidate.kind !== "string" || !/^[a-z]+$/.test(candidate.kind)) return void 0;
  if (typeof candidate.label !== "string" || !candidate.label.trim()) return void 0;
  if (candidate.target !== void 0 && (typeof candidate.target !== "string" || !candidate.target)) return void 0;
  if (candidate.value !== void 0 && typeof candidate.value !== "string") return void 0;
  if (candidate.options !== void 0 && typeof candidate.options !== "string") return void 0;
  if (candidate.breakpoint !== void 0 && typeof candidate.breakpoint !== "boolean") return void 0;
  const bindings = Array.isArray(candidate.bindings) ? candidate.bindings.flatMap((binding) => bindingof(binding) !== void 0 ? [bindingof(binding)] : []) : void 0;
  if (candidate.bindings !== void 0 && bindings === void 0) return void 0;
  if (Array.isArray(candidate.bindings) && bindings !== void 0 && bindings.length !== candidate.bindings.length) return void 0;
  const expression = candidate.expression === void 0 ? void 0 : expressionof(candidate.expression);
  if (candidate.expression !== void 0 && expression === void 0) return void 0;
  const extract = candidate.extract === void 0 ? void 0 : regexruleof(candidate.extract);
  if (candidate.extract !== void 0 && extract === void 0) return void 0;
  const params = Array.isArray(candidate.params) ? candidate.params.flatMap((param) => nestedparamof(param) !== void 0 ? [nestedparamof(param)] : []) : void 0;
  if (candidate.params !== void 0 && params === void 0) return void 0;
  if (Array.isArray(candidate.params) && params !== void 0 && params.length !== candidate.params.length) return void 0;
  return { id: candidate.id, kind: candidate.kind, label: candidate.label, ...candidate.target !== void 0 ? { target: candidate.target } : {}, ...candidate.value !== void 0 ? { value: candidate.value } : {}, ...candidate.options !== void 0 ? { options: candidate.options } : {}, ...bindings !== void 0 && bindings.length > 0 ? { bindings } : {}, ...expression !== void 0 ? { expression } : {}, ...extract !== void 0 ? { extract } : {}, ...candidate.breakpoint === true ? { breakpoint: true } : {}, ...params !== void 0 && params.length > 0 ? { params } : {} };
}
function blockinvocationof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const candidate = value;
  if (typeof candidate.block !== "string" || !candidate.block.trim()) return void 0;
  if (typeof candidate.label !== "string" || !candidate.label.trim()) return void 0;
  const params = Array.isArray(candidate.params) ? candidate.params.flatMap((param) => nestedparamof(param) !== void 0 ? [nestedparamof(param)] : []) : void 0;
  if (candidate.params !== void 0 && params === void 0) return void 0;
  if (Array.isArray(candidate.params) && params !== void 0 && params.length !== candidate.params.length) return void 0;
  return { block: candidate.block, label: candidate.label, ...params !== void 0 && params.length > 0 ? { params } : {} };
}
function workflowblockof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const candidate = value;
  if (typeof candidate.name !== "string" || !/^[a-z][a-z0-9]*$/.test(candidate.name)) return void 0;
  if (typeof candidate.label !== "string" || !candidate.label.trim()) return void 0;
  if (!Array.isArray(candidate.steps)) return void 0;
  const steps = [];
  for (const entry of candidate.steps) {
    const step = workflowstepof(entry);
    if (step) {
      steps.push(step);
      continue;
    }
    const invocation = blockinvocationof(entry);
    if (invocation) {
      steps.push(invocation);
      continue;
    }
    return void 0;
  }
  return { name: candidate.name, label: candidate.label, steps };
}
function steptemplateof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const candidate = value;
  if (typeof candidate.id !== "string" || !candidate.id.trim()) return void 0;
  if (typeof candidate.name !== "string" || !candidate.name.trim()) return void 0;
  if (typeof candidate.origin !== "string" || !candidate.origin.trim()) return void 0;
  const step = workflowstepof(candidate.step);
  if (!step) return void 0;
  if (typeof candidate.sharedat !== "number" || !Number.isFinite(candidate.sharedat)) return void 0;
  return { id: candidate.id, name: candidate.name, origin: candidate.origin, step, sharedat: candidate.sharedat };
}
function bindingof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const candidate = value;
  if (typeof candidate.variable !== "string" || !/^[a-z][a-z0-9]*$/.test(candidate.variable)) return void 0;
  if (!variablekinds.includes(candidate.kind)) return void 0;
  if (typeof candidate.stepid !== "string" || !candidate.stepid.trim()) return void 0;
  if (candidate.path !== void 0 && (typeof candidate.path !== "string" || !candidate.path.trim())) return void 0;
  return { variable: candidate.variable, kind: candidate.kind, stepid: candidate.stepid, ...candidate.path !== void 0 ? { path: candidate.path } : {} };
}
var variablekinds = ["string", "number", "boolean", "list", "element"];
var expressionoperators = ["add", "subtract", "multiply", "divide", "modulo", "equal", "notequal", "less", "greater", "lessequal", "greaterequal", "and", "or", "not", "concat", "contains", "length"];
function expressionof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const candidate = value;
  const left = operandof(candidate.left);
  if (!left) return void 0;
  const right = candidate.right === void 0 ? void 0 : operandof(candidate.right);
  if (candidate.right !== void 0 && right === void 0) return void 0;
  if (typeof candidate.operator !== "string" || !expressionoperators.includes(candidate.operator)) return void 0;
  if (typeof candidate.result !== "string" || !/^[a-z][a-z0-9]*$/.test(candidate.result)) return void 0;
  if (!variablekinds.includes(candidate.resultkind)) return void 0;
  return { left, ...right !== void 0 ? { right } : {}, operator: candidate.operator, result: candidate.result, resultkind: candidate.resultkind };
}
function operandof(value) {
  if (value === void 0) return void 0;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return { literal: value };
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const candidate = value;
  if (typeof candidate.ref === "string" && /^[a-z][a-z0-9]*$/.test(candidate.ref)) return { ref: candidate.ref };
  if (typeof candidate.literal === "string" || typeof candidate.literal === "number" || typeof candidate.literal === "boolean") return { literal: candidate.literal };
  return void 0;
}
function regexruleof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const candidate = value;
  if (typeof candidate.pattern !== "string" || !candidate.pattern.trim()) return void 0;
  if (typeof candidate.flags !== "string" || !/^[dgimsuvy]*$/.test(candidate.flags)) return void 0;
  const groups = Array.isArray(candidate.groups) ? candidate.groups.flatMap((group) => typeof group === "string" && /^[a-z][a-z0-9]*$/.test(group) ? [group] : []) : [];
  if (candidate.groups !== void 0 && groups.length !== candidate.groups.length) return void 0;
  return { pattern: candidate.pattern, flags: candidate.flags, groups };
}
function expandblocks(steps, blocks) {
  const byname = new Map(blocks.map((block) => [block.name, block]));
  const expanded = [];
  const visit = (entries, path, inside, params) => {
    let stamped = params === void 0;
    for (const entry of entries) {
      if ("kind" in entry && "label" in entry && !("block" in entry)) {
        const marked = inside === void 0 ? entry : { ...entry, block: inside };
        if (!stamped && params !== void 0) {
          expanded.push({ ...marked, params });
          stamped = true;
        } else expanded.push(marked);
        continue;
      }
      const invocation = blockinvocationof(entry);
      if (!invocation) throw new Error("The step list entry is neither a reviewed step nor a block invocation.");
      if (path.includes(invocation.block)) throw new Error(`The block ${invocation.block} recurs inside itself and cannot expand.`);
      const block = byname.get(invocation.block);
      if (!block) throw new Error(`The block ${invocation.block} is not defined in the workflow.`);
      visit(block.steps, [...path, invocation.block], invocation.block, invocation.params ?? params);
    }
  };
  visit(steps, [], void 0);
  if (expanded.length === 0) throw new Error("A workflow needs at least one executable step after block expansion.");
  return expanded;
}
function composeworkflow(input) {
  if (typeof input.name !== "string" || !input.name.trim()) throw new Error("The workflow name must be a non-empty string.");
  if (typeof input.version !== "number" || !Number.isInteger(input.version) || input.version < 1) throw new Error("The workflow version must be a positive integer.");
  if (!Array.isArray(input.origins) || input.origins.length === 0) throw new Error("A workflow needs at least one granted HTTPS origin.");
  const origins = input.origins.map((origin) => {
    try {
      return new URL(origin).origin;
    } catch {
      throw new Error(`The workflow origin ${origin} is not a valid url.`);
    }
  });
  if (origins.some((origin) => !origin.startsWith("https://"))) throw new Error("Workflow origins must use HTTPS.");
  const blocks = input.blocks ?? [];
  if (blocks.some((block, index) => blocks.findIndex((other) => other.name === block.name) !== index)) throw new Error("Workflow block names must stay unique.");
  for (const entry of input.steps) {
    if ("kind" in entry && "label" in entry && !("block" in entry)) {
      if (input.kindallowed && !input.kindallowed(entry.kind)) throw new Error(`The workflow step kind ${entry.kind} is not a reviewed action kind.`);
    }
  }
  for (const block of blocks) for (const entry of block.steps) {
    if ("kind" in entry && "label" in entry && !("block" in entry) && input.kindallowed && !input.kindallowed(entry.kind)) throw new Error(`The workflow step kind ${entry.kind} inside block ${block.name} is not a reviewed action kind.`);
  }
  const steps = expandblocks(input.steps, blocks);
  for (const step of steps) {
    if (input.kindallowed && !input.kindallowed(step.kind)) throw new Error(`The workflow step kind ${step.kind} is not a reviewed action kind.`);
    if (iscontrolflowkind(step.kind)) {
      validatecontrolpayload(step);
      for (const child of controlsteps(step)) {
        if (input.kindallowed && !input.kindallowed(child.kind)) throw new Error(`The workflow step kind ${child.kind} inside the control payload of ${step.id} is not a reviewed action kind.`);
      }
    }
    if (step.bindings) for (const binding of step.bindings) {
      if (!steps.some((other) => other.id === binding.stepid)) throw new Error(`The binding of ${binding.variable} references the unknown step ${binding.stepid}.`);
    }
  }
  const riskof = input.riskof ?? (() => "sensitive");
  const gradedkinds = steps.flatMap((step) => [step.kind, ...controlsteps(step).map((child) => child.kind)]);
  const risk = gradedkinds.some((kind) => riskof(kind) === "sensitive") ? "sensitive" : gradedkinds.some((kind) => riskof(kind) === "interaction") ? "interaction" : "read";
  const record = { id: input.id ?? crypto.randomUUID(), name: input.name, version: input.version, origins: [...new Set(origins)], steps, blocks, risk, createdat: input.now };
  return deepfreeze(record);
}
function deepfreeze(record) {
  for (const step of record.steps) Object.freeze(step);
  for (const block of record.blocks) for (const entry of block.steps) if ("kind" in entry && "label" in entry && !("block" in entry)) Object.freeze(entry);
  Object.freeze(record.blocks);
  Object.freeze(record.steps);
  return Object.freeze(record);
}
function validateworkflow(record, options) {
  if (record.steps.length === 0) return { allowed: false, reason: "A workflow needs at least one reviewed step." };
  const defined = new Set(options?.inputs ?? []);
  const byid = new Map(record.steps.map((step, index) => [step.id, { step, index }]));
  for (let index = 0; index < record.steps.length; index += 1) {
    const step = record.steps[index];
    if (options?.kindallowed && !options.kindallowed(step.kind)) return { allowed: false, reason: `The workflow step kind ${step.kind} is not a reviewed action kind.` };
    if (step.bindings) for (const binding of step.bindings) {
      const source = byid.get(binding.stepid);
      if (!source) return { allowed: false, reason: `The binding of ${binding.variable} references the unknown step ${binding.stepid}.` };
      if (source.index >= index) return { allowed: false, reason: `The binding of ${binding.variable} must link an earlier step than ${step.id}.` };
      defined.add(binding.variable);
    }
    if (step.expression) {
      for (const operand of [step.expression.left, step.expression.right]) {
        if (operand?.ref && !defined.has(operand.ref)) return { allowed: false, reason: `The expression of step ${step.id} references the undefined variable ${operand.ref}.` };
      }
      defined.add(step.expression.result);
    }
    if (step.extract) for (const group of step.extract.groups) defined.add(group);
  }
  return { allowed: true };
}
function newworkflowrun(input) {
  return { id: input.id ?? crypto.randomUUID(), workflowid: input.workflowid, state: "pending", cursor: 0, startedat: input.now, ...input.dryrun === true ? { dryrun: true } : {} };
}
var controlflowkinds = ["condition", "branch", "loop", "repeatuntil", "whileloop", "foreach", "parallel", "trycatch"];
function iscontrolflowkind(kind) {
  return controlflowkinds.includes(kind);
}
function controlname(value) {
  return typeof value === "string" && /^[a-z][a-z0-9]*$/.test(value) ? value : void 0;
}
function controlstepslist(value) {
  if (!Array.isArray(value) || value.length === 0) return void 0;
  const steps = [];
  for (const entry of value) {
    const parsed = workflowstepof(entry);
    if (!parsed) return void 0;
    steps.push(parsed);
  }
  return steps;
}
function controlbound(value) {
  if (value === void 0) return void 0;
  return typeof value === "number" && Number.isInteger(value) && value > 0 ? value : void 0;
}
function conditionof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const candidate = value;
  const expression = expressionof(candidate.expression);
  if (!expression) return void 0;
  if (expression.resultkind !== "boolean") return void 0;
  return { expression };
}
function elseof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const candidate = value;
  const name = controlname(candidate.name);
  if (!name) return void 0;
  if (candidate.when !== void 0) return void 0;
  if (!Array.isArray(candidate.steps)) return void 0;
  const steps = [];
  for (const entry of candidate.steps) {
    const parsed = workflowstepof(entry);
    if (!parsed) return void 0;
    steps.push(parsed);
  }
  return { name, steps };
}
function branchof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const candidate = value;
  if (!Array.isArray(candidate.paths) || candidate.paths.length === 0) return void 0;
  const paths = [];
  for (const entry of candidate.paths) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) return void 0;
    const path = entry;
    const name = controlname(path.name);
    if (!name) return void 0;
    const when = path.when === void 0 ? void 0 : expressionof(path.when);
    if (path.when !== void 0 && when === void 0) return void 0;
    if (when !== void 0 && when.resultkind !== "boolean") return void 0;
    const steps = controlstepslist(path.steps);
    if (!steps) return void 0;
    paths.push({ name, ...when !== void 0 ? { when } : {}, steps });
  }
  const names = paths.map((path) => path.name);
  if (new Set(names).size !== names.length) return void 0;
  const elsepath = elseof(candidate.else);
  if (!elsepath) return void 0;
  if (names.includes(elsepath.name)) return void 0;
  return { paths, else: elsepath };
}
function loopof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const candidate = value;
  const list = controlname(candidate.list);
  const item = controlname(candidate.item);
  const index = controlname(candidate.index);
  if (!list || !item || !index) return void 0;
  if (item === list || index === list || item === index) return void 0;
  const bound = controlbound(candidate.bound);
  if (candidate.bound !== void 0 && bound === void 0) return void 0;
  const steps = controlstepslist(candidate.steps);
  if (!steps) return void 0;
  return { list, item, index, ...bound !== void 0 ? { bound } : {}, steps };
}
function repeatuntilof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const candidate = value;
  const until = expressionof(candidate.until);
  if (!until || until.resultkind !== "boolean") return void 0;
  const bound = controlbound(candidate.bound);
  if (candidate.bound !== void 0 && bound === void 0) return void 0;
  const steps = controlstepslist(candidate.steps);
  if (!steps) return void 0;
  return { until, ...bound !== void 0 ? { bound } : {}, steps };
}
function whileof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const candidate = value;
  const condition = expressionof(candidate.while);
  if (!condition || condition.resultkind !== "boolean") return void 0;
  const bound = controlbound(candidate.bound);
  if (bound === void 0) return void 0;
  const steps = controlstepslist(candidate.steps);
  if (!steps) return void 0;
  return { while: condition, bound, steps };
}
function foreachof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const candidate = value;
  if (typeof candidate.selector !== "string" || !candidate.selector.trim()) return void 0;
  const item = controlname(candidate.item);
  const index = controlname(candidate.index);
  if (!item || !index || item === index) return void 0;
  const steps = controlstepslist(candidate.steps);
  if (!steps) return void 0;
  return { selector: candidate.selector, item, index, steps };
}
function parallelof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const candidate = value;
  if (!Array.isArray(candidate.branches) || candidate.branches.length === 0) return void 0;
  const branches = [];
  for (const entry of candidate.branches) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) return void 0;
    const branch = entry;
    const id = controlname(branch.id);
    if (!id) return void 0;
    const steps = controlstepslist(branch.steps);
    if (!steps) return void 0;
    branches.push({ id, steps });
  }
  if (new Set(branches.map((branch) => branch.id)).size !== branches.length) return void 0;
  const join = candidate.join && typeof candidate.join === "object" && !Array.isArray(candidate.join) ? candidate.join : void 0;
  if (!join) return void 0;
  if (join.strategy !== "first" && join.strategy !== "last" && join.strategy !== "fail") return void 0;
  if (join.onfail !== "cancel" && join.onfail !== "continue") return void 0;
  return { branches, join: { strategy: join.strategy, onfail: join.onfail } };
}
function tryof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const candidate = value;
  const steps = controlstepslist(candidate.steps);
  if (!steps) return void 0;
  const catchcandidate = candidate.catch && typeof candidate.catch === "object" && !Array.isArray(candidate.catch) ? candidate.catch : void 0;
  if (!catchcandidate) return void 0;
  const catchsteps = controlstepslist(catchcandidate.steps);
  if (!catchsteps) return void 0;
  if (catchcandidate.rerun !== void 0 && typeof catchcandidate.rerun !== "boolean") return void 0;
  const catchvalue = { steps: catchsteps, ...catchcandidate.rerun === true ? { rerun: true } : {} };
  let retry;
  if (candidate.retry !== void 0) {
    const retrycandidate = candidate.retry && typeof candidate.retry === "object" && !Array.isArray(candidate.retry) ? candidate.retry : void 0;
    if (!retrycandidate) return void 0;
    if (typeof retrycandidate.attempts !== "number" || !Number.isInteger(retrycandidate.attempts) || retrycandidate.attempts < 1) return void 0;
    const backoff = retrycandidate.backoff && typeof retrycandidate.backoff === "object" && !Array.isArray(retrycandidate.backoff) ? retrycandidate.backoff : void 0;
    if (!backoff) return void 0;
    if (backoff.shape !== "fixed" && backoff.shape !== "exponential") return void 0;
    if (typeof backoff.base !== "number" || !Number.isFinite(backoff.base) || backoff.base < 0) return void 0;
    if (typeof backoff.jitter !== "number" || !Number.isFinite(backoff.jitter) || backoff.jitter < 0) return void 0;
    if (!Array.isArray(retrycandidate.retryable) || !retrycandidate.retryable.every((entry) => typeof entry === "string" && entry.trim())) return void 0;
    retry = { attempts: retrycandidate.attempts, backoff: { shape: backoff.shape, base: backoff.base, jitter: backoff.jitter }, retryable: retrycandidate.retryable };
  }
  let timeout;
  if (candidate.timeout !== void 0) {
    const timeoutcandidate = candidate.timeout && typeof candidate.timeout === "object" && !Array.isArray(candidate.timeout) ? candidate.timeout : void 0;
    if (!timeoutcandidate) return void 0;
    const stepms = timeoutcandidate.stepms === void 0 ? void 0 : typeof timeoutcandidate.stepms === "number" && Number.isFinite(timeoutcandidate.stepms) && timeoutcandidate.stepms > 0 ? timeoutcandidate.stepms : void 0;
    const runms = timeoutcandidate.runms === void 0 ? void 0 : typeof timeoutcandidate.runms === "number" && Number.isFinite(timeoutcandidate.runms) && timeoutcandidate.runms > 0 ? timeoutcandidate.runms : void 0;
    if (stepms === void 0 && runms === void 0) return void 0;
    if (timeoutcandidate.stepms !== void 0 && stepms === void 0) return void 0;
    if (timeoutcandidate.runms !== void 0 && runms === void 0) return void 0;
    timeout = { ...stepms !== void 0 ? { stepms } : {}, ...runms !== void 0 ? { runms } : {} };
  }
  return { steps, catch: catchvalue, ...retry !== void 0 ? { retry } : {}, ...timeout !== void 0 ? { timeout } : {} };
}
function controloptions(step) {
  if (step.options === void 0) throw new Error(`The ${step.kind} step needs its reviewed control payload in options.`);
  let parsed;
  try {
    parsed = JSON.parse(step.options);
  } catch {
    throw new Error(`The ${step.kind} control payload must be a JSON object.`);
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error(`The ${step.kind} control payload must be a JSON object.`);
  return parsed;
}
function validatecontrolpayload(step) {
  if (!iscontrolflowkind(step.kind)) return;
  const payload = controloptions(step);
  if (step.kind === "condition" && conditionof(payload.condition) === void 0) throw new Error("The condition step needs a reviewed boolean expression in its options.");
  if (step.kind === "branch" && branchof(payload.branch) === void 0) throw new Error("The branch step needs reviewed unique paths with boolean match expressions and an else path in its options.");
  if (step.kind === "loop" && loopof(payload.loop) === void 0) throw new Error("The loop step needs a reviewed list variable, distinct item and index variables, an optional positive safety bound and a non-empty body in its options.");
  if (step.kind === "repeatuntil" && repeatuntilof(payload.repeatuntil) === void 0) throw new Error("The repeat until step needs a reviewed convergence expression, an optional positive safety bound and a non-empty body in its options.");
  if (step.kind === "whileloop" && whileof(payload.while) === void 0) throw new Error("The while step needs a reviewed condition, a mandatory positive safety bound and a non-empty body in its options.");
  if (step.kind === "foreach" && foreachof(payload.foreach) === void 0) throw new Error("The foreach step needs a reviewed non-empty selector, distinct item and index variables and a non-empty body in its options.");
  if (step.kind === "parallel" && parallelof(payload.parallel) === void 0) throw new Error("The parallel step needs uniquely identified branches with bodies and a join policy of the first, last or fail strategy with cancel or continue on branch failure in its options.");
  if (step.kind === "trycatch" && tryof(payload.try) === void 0) throw new Error("The try step needs a fragile body, a catch handler and optional retry and timeout policies in its options.");
}
function controlsteps(step) {
  if (!iscontrolflowkind(step.kind)) return [];
  let payload;
  try {
    payload = controloptions(step);
  } catch {
    return [];
  }
  const children = [];
  const collect = (steps) => {
    for (const child of steps) {
      children.push(child);
      collect(controlsteps(child));
    }
  };
  if (step.kind === "condition") return children;
  if (step.kind === "branch") {
    const branch = branchof(payload.branch);
    if (!branch) return children;
    for (const path of branch.paths) collect(path.steps);
    collect(branch.else.steps);
    return children;
  }
  if (step.kind === "loop") {
    const loop = loopof(payload.loop);
    if (loop) collect(loop.steps);
    return children;
  }
  if (step.kind === "repeatuntil") {
    const repeat = repeatuntilof(payload.repeatuntil);
    if (repeat) collect(repeat.steps);
    return children;
  }
  if (step.kind === "whileloop") {
    const condition = whileof(payload.while);
    if (condition) collect(condition.steps);
    return children;
  }
  if (step.kind === "foreach") {
    const foreach = foreachof(payload.foreach);
    if (foreach) collect(foreach.steps);
    return children;
  }
  if (step.kind === "parallel") {
    const parallel = parallelof(payload.parallel);
    if (parallel) for (const branch of parallel.branches) collect(branch.steps);
    return children;
  }
  const fragile = tryof(payload.try);
  if (fragile) {
    collect(fragile.steps);
    collect(fragile.catch.steps);
  }
  return children;
}
var triggerkinds = ["visitrule", "urlrule", "menurule", "keyrule", "buttonrule", "cronrule", "intervalrule", "urllistrule", "webhookrule", "eventrule"];
var triggerfamilies = ["visit", "url", "menu", "key", "button", "cron", "interval", "urllist", "webhook", "event"];
var triggereventcatalog = ["mutate", "focus", "banner", "console", "error", "navigate"];
var defaulttriggercooldown = 1e4;
function triggerfamilyof(kind) {
  const index = triggerkinds.indexOf(kind);
  return index >= 0 ? triggerfamilies[index] : void 0;
}
function triggerlabel(value) {
  return typeof value === "string" && value.trim() ? value.trim() : void 0;
}
function positivewindow(value) {
  if (value === void 0) return void 0;
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : void 0;
}
function jitterwindow(value) {
  if (value === void 0) return void 0;
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : void 0;
}
function httpsorigin(value) {
  if (typeof value !== "string" || !value.trim()) return void 0;
  try {
    const parsed = new URL(value.trim());
    if (parsed.protocol !== "https:") return void 0;
    return parsed.origin;
  } catch {
    return void 0;
  }
}
function webhookfieldof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const candidate = value;
  if (typeof candidate.name !== "string" || !/^[a-z][a-z0-9]*$/i.test(candidate.name)) return void 0;
  if (candidate.kind !== "string" && candidate.kind !== "number" && candidate.kind !== "boolean") return void 0;
  if (candidate.required !== void 0 && typeof candidate.required !== "boolean") return void 0;
  return { name: candidate.name, kind: candidate.kind, ...candidate.required === true ? { required: true } : {} };
}
function triggerpayloadof(family, value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const candidate = value;
  if (family === "visit") {
    if (!Array.isArray(candidate.origins) || candidate.origins.length === 0) return void 0;
    const origins = candidate.origins.map((origin) => httpsorigin(origin));
    if (origins.some((origin) => origin === void 0)) return void 0;
    return { origins: [...new Set(origins)] };
  }
  if (family === "url") {
    if (typeof candidate.pattern !== "string" || !candidate.pattern.trim()) return void 0;
    if (httpsorigin(candidate.pattern) === void 0) return void 0;
    return { pattern: candidate.pattern.trim() };
  }
  if (family === "menu") {
    const title = triggerlabel(candidate.title);
    if (!title) return void 0;
    return { title };
  }
  if (family === "key") {
    if (typeof candidate.command !== "string" || !/^[a-z][a-z0-9-]*$/.test(candidate.command)) return void 0;
    if (candidate.key !== void 0 && (typeof candidate.key !== "string" || !candidate.key.trim())) return void 0;
    return { command: candidate.command, ...candidate.key !== void 0 ? { key: candidate.key } : {} };
  }
  if (family === "button") return {};
  if (family === "cron") {
    if (typeof candidate.cron !== "string" || !candidate.cron.trim()) return void 0;
    if (cronparse(candidate.cron) === void 0) return void 0;
    if (candidate.timezone !== void 0 && (typeof candidate.timezone !== "string" || !timezonevalid(candidate.timezone))) return void 0;
    return { cron: candidate.cron.trim(), ...candidate.timezone !== void 0 ? { timezone: candidate.timezone } : {} };
  }
  if (family === "interval") {
    const period = positivewindow(candidate.period);
    if (period === void 0) return void 0;
    const jitter = jitterwindow(candidate.jitter);
    if (candidate.jitter !== void 0 && jitter === void 0) return void 0;
    return { period, ...jitter !== void 0 ? { jitter } : {} };
  }
  if (family === "urllist") {
    if (!Array.isArray(candidate.urls) || candidate.urls.length === 0) return void 0;
    const urls = candidate.urls.map((url) => httpsorigin(url) === void 0 ? void 0 : url.trim());
    if (urls.some((url) => url === void 0)) return void 0;
    return { urls };
  }
  if (family === "webhook") {
    if (typeof candidate.secret !== "string" || !webhooksecretok(candidate.secret)) return void 0;
    if (!Array.isArray(candidate.schema) || candidate.schema.length === 0) return void 0;
    const schema = candidate.schema.map((field) => webhookfieldof(field));
    if (schema.some((field) => field === void 0)) return void 0;
    const names = schema.map((field) => field.name);
    if (new Set(names).size !== names.length) return void 0;
    return { secret: candidate.secret, schema };
  }
  const events = candidate.events;
  if (!Array.isArray(events) || events.length === 0) return void 0;
  if (!events.every((name) => typeof name === "string" && triggereventcatalog.includes(name))) return void 0;
  return { events: [...new Set(events)] };
}
function webhooksecretok(secret) {
  if (secret.length < 24) return false;
  if (/^(.)\1+$/.test(secret)) return false;
  return /[a-z]/i.test(secret) && /\d/.test(secret);
}
function timezonevalid(timezone) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}
function armrule(input) {
  if (typeof input.workflowid !== "string" || !input.workflowid.trim()) return void 0;
  const payload = triggerpayloadof(input.family, input.payload);
  if (!payload) return void 0;
  if (input.cooldown !== void 0 && (typeof input.cooldown !== "number" || !Number.isFinite(input.cooldown) || input.cooldown <= 0)) return void 0;
  const cooldown = input.cooldown ?? (input.family === "webhook" || input.family === "event" ? defaulttriggercooldown : 0);
  const label = input.label ?? `The ${input.family} rule of ${input.workflowid}`;
  return { id: input.id ?? crypto.randomUUID(), kind: input.family, workflowid: input.workflowid, label, ...payload, cooldown, state: { enabled: true, cooldown }, stats: { fires: 0, launches: 0, suppressions: 0 }, createdat: input.now };
}
function cronparse(expression) {
  const fields = expression.trim().split(/\s+/);
  if (fields.length !== 5) return void 0;
  const minutes = cronfield(fields[0] ?? "", 0, 59);
  const hours = cronfield(fields[1] ?? "", 0, 23);
  const daysofmonth = cronfield(fields[2] ?? "", 1, 31);
  const months = cronfield(fields[3] ?? "", 1, 12, monthnames);
  const daysofweek = cronfield(fields[4] ?? "", 0, 7, weekdaynames, true);
  if (!minutes || !hours || !daysofmonth || !months || !daysofweek) return void 0;
  return { minutes, hours, daysofmonth, months, daysofweek: [...new Set(daysofweek.map((day) => day % 7))].sort((left, right) => left - right) };
}
var weekdaynames = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
var monthnames = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
function cronfield(field, min, max, names, sundayseven = false) {
  const values = /* @__PURE__ */ new Set();
  for (const part of field.split(",")) {
    if (!part) return void 0;
    const [range, stepstring] = part.split("/");
    const step = stepstring === void 0 ? 1 : Number(stepstring);
    if (!Number.isInteger(step) || step < 1) return void 0;
    let low = min;
    let high = max;
    if (range !== void 0 && range !== "*") {
      const bounds = range.split("-");
      if (bounds.length > 2) return void 0;
      const lowvalue = cronvalue(bounds[0] ?? "", min, max, names);
      if (lowvalue === void 0) return void 0;
      low = lowvalue;
      high = lowvalue;
      if (bounds.length === 2) {
        const highvalue = cronvalue(bounds[1] ?? "", min, max, names);
        if (highvalue === void 0 || highvalue < lowvalue) return void 0;
        high = highvalue;
      }
    }
    for (let value = low; value <= high; value += step) values.add(value);
  }
  const list = [...values];
  if (list.some((value) => value < min || value > max)) return void 0;
  if (sundayseven && values.has(7)) {
    values.delete(7);
    values.add(0);
  }
  return [...values].sort((left, right) => left - right);
}
function cronvalue(value, min, max, names) {
  const candidate = names?.[value.toLowerCase()];
  if (candidate !== void 0) return candidate;
  if (!/^\d+$/.test(value)) return void 0;
  const parsed = Number(value);
  if (parsed < min || parsed > max) return void 0;
  return parsed;
}

// swarm.ts
var blackboardsections = ["goals", "facts", "findings", "scratch"];
function postentry(input) {
  if (input.key.trim() === "") throw new Error("The blackboard entry needs its key.");
  if (input.value.trim() === "") throw new Error("The blackboard entry needs its value.");
  if (input.author.trim() === "") throw new Error("The blackboard entry needs its author.");
  if (!blackboardsections.includes(input.section)) throw new Error(`The section ${input.section} is not one of the shared blackboard sections.`);
  if (input.board.entries.some((entry2) => entry2.id === input.id)) throw new Error(`The blackboard entry id ${input.id} already exists.`);
  if (input.valuekind === "json") {
    try {
      JSON.parse(input.value);
    } catch {
      throw new Error("The json blackboard entry needs a well-formed json value.");
    }
  }
  const entry = { id: input.id, key: input.key.trim(), valuekind: input.valuekind ?? "text", value: input.value, author: input.author, section: input.section, consentclass: input.consentclass ?? "read", postedat: input.now };
  return { ...input.board, sections: input.board.sections.includes(input.section) ? input.board.sections : [...input.board.sections, input.section], entries: [entry, ...input.board.entries] };
}

// agent.ts
var reservedagentnames = /* @__PURE__ */ new Set(["user", "operator", "human", "system"]);
function agentname(input) {
  const name = input.proposed.trim().toLowerCase();
  if (name === "") throw new Error("The agent needs its user chosen name; agent naming stays a user choice.");
  if (!/^[a-z][a-z0-9]*$/.test(name)) throw new Error(`The agent name ${input.proposed.trim()} must stay a lowercase identifier of letters and digits starting with a letter.`);
  if (reservedagentnames.has(name)) throw new Error(`The agent name ${name} is reserved; the user, the operator, the human and the system identities never belong to an agent.`);
  if (input.records.some((record) => record.name === name)) throw new Error(`The agent name ${name} is already registered; fleet names stay unique.`);
  if (input.id.trim() === "") throw new Error("The fleet record needs its id.");
  if (input.origin.trim() === "") throw new Error("The fleet record needs its home origin; every agent works from the origin its scope intersects with the session grants.");
  return { id: input.id.trim(), name, role: input.role ?? "worker", origin: input.origin.trim(), state: "active", registeredat: input.now, lastseenat: input.now };
}
function agentscopeof(input) {
  if (input.agentid.trim() === "") throw new Error("The scope needs its agent id.");
  const requested = input.requested ?? {};
  const requestedorigins = (requested.origins ?? []).map((origin) => origin.trim()).filter((origin) => origin !== "");
  const origins = input.grants === void 0 ? requestedorigins : requestedorigins.filter((origin) => input.grants.includes(origin));
  if (input.grants !== void 0 && requestedorigins.length > 0 && origins.length === 0) throw new Error(`The requested origins ${requestedorigins.join(", ")} sit outside the session grants ${input.grants.join(", ")}; the scope never widens past the grants.`);
  const requestedkinds = (requested.actionkinds ?? []).map((kind) => kind.trim()).filter((kind) => kind !== "");
  const actionkinds = input.allowedkinds === void 0 ? requestedkinds : requestedkinds.filter((kind) => input.allowedkinds.includes(kind));
  if (input.allowedkinds !== void 0 && requestedkinds.length > 0 && actionkinds.length === 0) throw new Error(`The requested action kinds ${requestedkinds.join(", ")} sit outside the allowed catalog; the scope narrows every step to the allowed kinds only.`);
  const toolnamespaces2 = requested.toolnamespaces ?? [];
  return { agentid: input.agentid.trim(), origins, toolnamespaces: toolnamespaces2, ...actionkinds.length > 0 ? { actionkinds } : {} };
}
function readonlyscope(input) {
  if (input.agentid.trim() === "") throw new Error("The read only scope needs its agent id.");
  const readkinds = input.readkinds.map((kind) => kind.trim()).filter((kind) => kind !== "");
  if (readkinds.length === 0) throw new Error("The read only scope needs its read side action kinds; an observer with no kinds reads nothing.");
  return { agentid: input.agentid.trim(), origins: [], toolnamespaces: ["memory", "system"], actionkinds: readkinds, readonly: true };
}
function agentbudgetof(input) {
  if (input.agentid.trim() === "") throw new Error("The budget needs its agent id.");
  const ceilings = [["maxsteps", input.maxsteps], ["maxtokens", input.maxtokens], ["maxdurationms", input.maxdurationms]];
  for (const [label, value] of ceilings) {
    if (value !== void 0 && (!Number.isFinite(value) || value <= 0)) throw new Error(`The ${label} ceiling must stay a positive number; every ceiling stays the user's choice with no engine default.`);
  }
  const agentid = input.agentid.trim();
  return {
    budget: { agentid, ...input.maxtokens !== void 0 ? { maxtokens: input.maxtokens } : {}, ...input.maxsteps !== void 0 ? { maxsteps: input.maxsteps } : {}, ...input.maxdurationms !== void 0 ? { maxdurationms: input.maxdurationms } : {}, ...input.currency !== void 0 && input.currency.trim() !== "" ? { currency: input.currency.trim() } : {}, configuredat: input.now },
    state: { agentid, spentsteps: 0, spenttokens: 0, spentdurationms: 0, ...input.maxsteps !== void 0 ? { maxsteps: input.maxsteps } : {}, ...input.maxtokens !== void 0 ? { maxtokens: input.maxtokens } : {}, ...input.maxdurationms !== void 0 ? { maxdurationms: input.maxdurationms } : {}, updatedat: input.now }
  };
}
function spendbudget(input) {
  const steps = input.steps ?? 1;
  const tokens = input.tokens ?? 0;
  const durationms = input.durationms ?? 0;
  for (const [label, value] of [["steps", steps], ["tokens", tokens], ["durationms", durationms]]) {
    if (!Number.isFinite(value) || value < 0) throw new Error(`The ${label} spend stays a finite non negative number; the budget never recharges or takes a nonsensical amount.`);
  }
  const nextsteps = input.state.spentsteps + steps;
  const nexttokens = input.state.spenttokens + tokens;
  const nextduration = input.state.spentdurationms + durationms;
  if (input.state.maxsteps !== void 0 && nextsteps > input.state.maxsteps) throw new Error(`The agent ${input.state.agentid} already executed ${input.state.spentsteps} of its ${input.state.maxsteps} budgeted steps; the user raises the ceiling or stops the agent.`);
  if (input.state.maxtokens !== void 0 && nexttokens > input.state.maxtokens) throw new Error(`The agent ${input.state.agentid} already spent ${input.state.spenttokens} of its ${input.state.maxtokens} budgeted tokens; the user raises the ceiling or stops the agent.`);
  if (input.state.maxdurationms !== void 0 && nextduration > input.state.maxdurationms) throw new Error(`The agent ${input.state.agentid} already spent ${input.state.spentdurationms} of its ${input.state.maxdurationms} budgeted milliseconds; the user raises the ceiling or stops the agent.`);
  return { ...input.state, spentsteps: nextsteps, spenttokens: nexttokens, spentdurationms: nextduration, updatedat: input.now };
}
function budgetremaining(state) {
  const steps = state.maxsteps === void 0 ? void 0 : Math.max(0, state.maxsteps - state.spentsteps);
  const tokens = state.maxtokens === void 0 ? void 0 : Math.max(0, state.maxtokens - state.spenttokens);
  const durationms = state.maxdurationms === void 0 ? void 0 : Math.max(0, state.maxdurationms - state.spentdurationms);
  const parts = [];
  parts.push(steps === void 0 ? "steps unbounded" : `${steps} of ${state.maxsteps} steps left`);
  parts.push(tokens === void 0 ? "tokens unbounded" : `${tokens} of ${state.maxtokens} tokens left`);
  parts.push(durationms === void 0 ? "duration unbounded" : `${durationms} of ${state.maxdurationms} milliseconds left`);
  return { ...steps !== void 0 ? { steps } : {}, ...tokens !== void 0 ? { tokens } : {}, ...durationms !== void 0 ? { durationms } : {}, reason: `The agent ${state.agentid} spent ${state.spentsteps} steps, ${state.spenttokens} tokens and ${state.spentdurationms} milliseconds: ${parts.join(", ")}.` };
}
function pauseagent(input) {
  const agent = input.records.find((record) => record.id === input.agentid);
  if (!agent) throw new Error(`The agent ${input.agentid} is not registered in the fleet.`);
  if (agent.state === "stopped") throw new Error(`The agent ${agent.name} is stopped; a stopped agent needs no pause.`);
  return input.records.map((record) => record.id === input.agentid ? { ...record, state: "paused", lastseenat: input.now } : record);
}
function unpauseagent(input) {
  const agent = input.records.find((record) => record.id === input.agentid);
  if (!agent) throw new Error(`The agent ${input.agentid} is not registered in the fleet.`);
  if (agent.state !== "paused") throw new Error(`The agent ${agent.name} is not paused.`);
  return input.records.map((record) => record.id === input.agentid ? { ...record, state: "active", lastseenat: input.now } : record);
}
function engagekillswitch(input) {
  const reason = input.reason !== void 0 && input.reason.trim() !== "" ? input.reason.trim() : "The user engaged the killswitch.";
  const terminal = ["completed", "failed", "cancelled", "rolledback", "done"];
  const runs = input.runs.map((run) => run.agentid !== void 0 && !terminal.includes(run.state) ? { ...run, state: "cancelled", updatedat: input.now } : run);
  const cancelled = runs.filter((run) => run.agentid !== void 0 && run.state === "cancelled" && input.runs.find((original) => original.runid === run.runid)?.state !== "cancelled");
  const queues = (input.queues ?? []).map((queue) => ({ ...queue, items: [], claims: [] }));
  const queuedperagent = /* @__PURE__ */ new Map();
  for (const queue of input.queues ?? []) {
    for (const claim of queue.claims) queuedperagent.set(claim.agentid, (queuedperagent.get(claim.agentid) ?? 0) + 1);
    for (const item of queue.items) if (item.state === "queued") queuedperagent.set("fleet", (queuedperagent.get("fleet") ?? 0) + 1);
  }
  const stopped = input.records.map((record) => ({ agentid: record.id, name: record.name, runs: cancelled.filter((run) => run.agentid === record.id).map((run) => run.runid), queued: (queuedperagent.get(record.id) ?? 0) + (record.state === "active" || record.state === "paused" ? queuedperagent.get("fleet") ?? 0 : 0) }));
  return { records: input.records.map((record) => ({ ...record, state: "stopped", lastseenat: input.now })), runs, queues, stopped, engagedat: input.now, reason };
}
function fleetoverview(input) {
  return {
    agents: input.records.length,
    active: input.records.filter((record) => record.state === "active").length,
    paused: input.records.filter((record) => record.state === "paused").length,
    stopped: input.records.filter((record) => record.state === "stopped").length,
    openescalations: input.openescalations,
    openreviews: input.openreviews,
    ...input.killswitchat !== void 0 ? { lastkillswitchat: input.killswitchat } : {}
  };
}
var broadcastrecipient = "*";
function mailboxof(mailboxes, agentid) {
  return mailboxes.find((mailbox) => mailbox.agentid === agentid) ?? { agentid, inbox: [], outbox: [], unread: 0 };
}
function roleaddress(agents, role) {
  return agents.filter((agent) => agent.role === role && agent.state !== "stopped").map((agent) => agent.id);
}
function resolverecipients(input) {
  if (input.routing === "broadcast") return input.agents.filter((agent) => agent.id !== input.senderid && agent.state !== "stopped").map((agent) => agent.id);
  if (input.routing === "role") return roleaddress(input.agents, input.recipient);
  const direct = input.agents.find((agent) => agent.id === input.recipient);
  if (!direct) throw new Error(`The direct message names the recipient ${input.recipient} which is not registered.`);
  return [direct.id];
}
function sendmessage(input) {
  if (input.payload.trim() === "") throw new Error("The agent message needs its payload.");
  if (input.routing === "direct" && input.senderid === input.recipient) throw new Error("A direct message never addresses its own sender.");
  const message = { id: input.id, senderid: input.senderid, recipient: input.recipient, routing: input.routing, payload: input.payload, sentat: input.now };
  const recipients = resolverecipients({ agents: input.agents, senderid: input.senderid, recipient: input.recipient, routing: input.routing });
  const known = /* @__PURE__ */ new Set([...input.mailboxes.map((mailbox) => mailbox.agentid), ...recipients, ...input.agents.some((agent) => agent.id === input.senderid) ? [input.senderid] : []]);
  return [...known].map((agentid) => {
    const mailbox = mailboxof(input.mailboxes, agentid);
    const delivered = recipients.includes(agentid);
    const sent = agentid === input.senderid;
    return {
      agentid,
      inbox: delivered ? [message, ...mailbox.inbox] : mailbox.inbox,
      outbox: sent ? [message, ...mailbox.outbox] : mailbox.outbox,
      unread: delivered ? mailbox.unread + 1 : mailbox.unread
    };
  });
}
function receivemessages(input) {
  const mailbox = mailboxof(input.mailboxes, input.agentid);
  const messages = [...mailbox.inbox].sort((one, two) => one.sentat - two.sentat).map((message) => ({ ...message, ...message.readat === void 0 ? { readat: input.now } : {} }));
  const drained = { agentid: input.agentid, inbox: messages, outbox: mailbox.outbox, unread: 0 };
  return { mailboxes: input.mailboxes.map((entry) => entry.agentid === input.agentid ? drained : entry), messages };
}
function unreadcount(mailboxes, agentid) {
  return mailboxof(mailboxes, agentid).unread;
}
function escalationblock(input) {
  const open = input.escalations.filter((escalation) => escalation.agentid === input.agentid && escalation.state === "open");
  if (open.length === 0) return { blocked: false, open: 0, reason: `The agent ${input.agentid} carries no open escalation; its steps continue through the same review.` };
  return { blocked: true, open: open.length, reason: `The agent ${input.agentid} waits behind ${open.length} open escalation${open.length === 1 ? "" : "s"}: ${open.map((escalation) => escalation.subject).join("; ")}; only the human answer lifts the hold.` };
}
function reviewrecordof(input) {
  if (input.id.trim() === "") throw new Error("The review request needs its id.");
  if (input.fromagentid.trim() === "") throw new Error("The review request names the agent whose output it carries.");
  if (input.toagentid.trim() === "") throw new Error("The review request names the reviewing agent.");
  if (input.fromagentid === input.toagentid) throw new Error("A review request moves one output between two different agents; an agent never reviews its own output.");
  if (input.subject.trim() === "") throw new Error("The review request needs its subject in plain language.");
  if (input.output.trim() === "") throw new Error("The review request needs the original output under review; the verdict lands beside it.");
  return { id: input.id.trim(), fromagentid: input.fromagentid.trim(), toagentid: input.toagentid.trim(), subject: input.subject.trim(), output: input.output, state: "open", requestedat: input.now };
}
function recordverdict(input) {
  const record = input.records.find((entry) => entry.id === input.id);
  if (!record) throw new Error(`The review request ${input.id} does not exist.`);
  if (record.state === "answered") throw new Error(`The review request ${record.id} already carries its verdict; the verdict never rewrites.`);
  if (input.reviewerid.trim() === "") throw new Error("The verdict names the reviewing agent that recorded it.");
  if (input.reviewerid !== record.toagentid) throw new Error(`The review request ${record.id} waits for the agent ${record.toagentid}; the agent ${input.reviewerid} never answers a review addressed to another agent.`);
  const issues = (input.issues ?? []).map((issue) => issue.trim()).filter((issue) => issue !== "");
  if (input.verdict !== "approve" && issues.length === 0) throw new Error(`A ${input.verdict} verdict names its issues in plain language; the requesting agent reads exactly what failed the review.`);
  return { ...record, state: "answered", verdict: input.verdict, ...issues.length > 0 ? { issues } : {}, answeredat: input.now };
}
function runreplay(input) {
  if (input.id.trim() === "") throw new Error("The runreplay capture needs its id.");
  if (input.agentid.trim() === "") throw new Error("The runreplay capture names its agent.");
  if (input.runid.trim() === "") throw new Error("The runreplay capture names its run.");
  if (input.steps.length === 0) throw new Error("The runreplay capture needs at least one recorded step; an empty run replays nothing.");
  const steps = [...input.steps].sort((one, two) => one.at - two.at || (one.stepid < two.stepid ? -1 : 1));
  return { id: input.id.trim(), agentid: input.agentid.trim(), runid: input.runid.trim(), steps, capturedat: input.now };
}
function reconstructreplay(input) {
  const owned = input.events.filter((event) => event.agentid === input.agentid && (event.planid === void 0 || event.planid === input.runid));
  if (owned.length === 0) throw new Error(`The audit trail carries no event of the agent ${input.agentid} for the run ${input.runid}; the reconstruction replays only what the trail recorded.`);
  const steps = owned.filter((event) => event.stepid !== void 0).map((event) => ({ stepid: event.stepid, kind: event.kind, summary: event.summary, state: event.kind === "action" || event.kind === "complete" ? "done" : event.kind === "error" ? "failed" : "recorded", at: event.at })).sort((one, two) => one.at - two.at || (one.stepid < two.stepid ? -1 : 1));
  if (steps.length === 0) throw new Error(`The audit trail of the agent ${input.agentid} names no step of the run ${input.runid}; the reconstruction needs the step ids the trail carried.`);
  return { id: input.id.trim(), agentid: input.agentid.trim(), runid: input.runid.trim(), steps, reconstructed: true, capturedat: input.now };
}
function outputcompare(input) {
  if (input.id.trim() === "") throw new Error("The output comparison needs its id.");
  if (input.subject.trim() === "") throw new Error("The output comparison needs its subject in plain language.");
  if (input.left.agentid.trim() === "" || input.right.agentid.trim() === "") throw new Error("The output comparison names both agents of its competing outputs.");
  if (input.left.agentid === input.right.agentid) throw new Error("The output comparison contrasts two different agents; one agent never competes with itself.");
  const keys = [.../* @__PURE__ */ new Set([...Object.keys(input.left.fields), ...Object.keys(input.right.fields)])].sort();
  const matching = [];
  const conflicting = [];
  const missing = [];
  for (const key of keys) {
    const left = input.left.fields[key];
    const right = input.right.fields[key];
    if (left !== void 0 && right !== void 0) (left === right ? matching : conflicting).push(key);
    else missing.push(key);
  }
  return { id: input.id.trim(), subject: input.subject.trim(), left: { agentid: input.left.agentid.trim(), fields: input.left.fields }, right: { agentid: input.right.agentid.trim(), fields: input.right.fields }, matching, conflicting, missing, comparedat: input.now };
}
function consensusrecordof(input) {
  if (input.id.trim() === "") throw new Error("The consensus record needs its id.");
  if (input.proposal.trim() === "") throw new Error("The consensus record needs its proposal in plain language.");
  if (!Number.isInteger(input.quorum) || input.quorum < 1) throw new Error("The consensus quorum stays a positive whole number the user configured.");
  const seen = /* @__PURE__ */ new Set();
  const votes = [];
  for (const vote of input.votes) {
    if (vote.agentid.trim() === "") throw new Error("Every vote names its agent; the weight stays one vote per agent.");
    if (seen.has(vote.agentid)) throw new Error(`The agent ${vote.agentid} already voted; the vote weight stays one per agent.`);
    seen.add(vote.agentid);
    votes.push({ agentid: vote.agentid.trim(), vote: vote.vote, ...vote.reason !== void 0 && vote.reason.trim() !== "" ? { reason: vote.reason.trim() } : {}, castat: vote.castat });
  }
  const tally = { yes: votes.filter((vote) => vote.vote === "yes").length, no: votes.filter((vote) => vote.vote === "no").length, abstain: votes.filter((vote) => vote.vote === "abstain").length };
  const complete = input.voters !== void 0 && votes.length >= input.voters;
  const outcome = tally.yes >= input.quorum ? "carried" : complete ? "failed" : "open";
  return { id: input.id.trim(), proposal: input.proposal.trim(), votes, tally, quorum: input.quorum, outcome, ...outcome !== "open" ? { closedat: input.now } : {} };
}
var protocoleventkinds = ["callstarted", "callresult", "streamchunk", "progress", "resourcedelta", "sampling", "cancellation"];
var readonlyeventkinds = ["callresult", "streamchunk", "progress", "resourcedelta", "sampling", "cancellation"];
function subscriberegister(input) {
  if (input.clientid.trim() === "") return { reason: "The event subscription needs the paired client it belongs to." };
  const kinds = input.kinds === void 0 || input.kinds.length === 0 ? [...readonlyeventkinds] : [...new Set(input.kinds)];
  for (const kind of kinds) {
    if (!protocoleventkinds.includes(kind)) return { reason: `The event kind ${kind} is not a protocol event kind.` };
  }
  if (input.origin !== void 0 && input.origin.trim() === "") return { reason: "The origin filter of an event subscription must name an origin or stay absent." };
  if (input.tool !== void 0 && input.tool.trim() === "") return { reason: "The tool filter of an event subscription must name a tool or stay absent." };
  return { subscription: { id: input.id ?? randomid(), clientid: input.clientid, kinds, ...input.origin !== void 0 ? { origin: input.origin } : {}, ...input.tool !== void 0 ? { tool: input.tool } : {}, createdat: input.now } };
}
function unsubscriberegister(subscriptions, id, now) {
  return subscriptions.map((subscription) => subscription.id === id && subscription.canceledat === void 0 ? { ...subscription, canceledat: now } : subscription);
}
function notifyevent(input) {
  const deliveries = [];
  const subscriptions = input.subscriptions.map((subscription) => {
    if (subscription.canceledat !== void 0) return subscription;
    if (!subscription.kinds.includes(input.kind)) return subscription;
    if (subscription.origin !== void 0 && input.origin !== void 0 && subscription.origin !== input.origin) return subscription;
    if (subscription.tool !== void 0 && input.tool !== void 0 && subscription.tool !== input.tool) return subscription;
    deliveries.push({ subscriptionid: subscription.id, clientid: subscription.clientid, frame: { jsonrpc: "2.0", method: "events/notify", params: { subscriptionid: subscription.id, kind: input.kind, ...input.origin !== void 0 ? { origin: input.origin } : {}, ...input.tool !== void 0 ? { tool: input.tool } : {}, ...input.payload !== void 0 ? { payload: input.payload } : {}, at: input.now } } });
    return { ...subscription, lastdeliveredat: input.now };
  });
  return { deliveries, subscriptions };
}
function watchresource(input) {
  if (input.clientid.trim() === "") return { reason: "The resource watcher needs the paired client it belongs to." };
  if (input.resource.trim() === "") return { reason: "The resource watcher needs the page state resource it watches." };
  return { watch: { id: input.id ?? randomid(), clientid: input.clientid, resource: input.resource, baseline: input.state ?? {}, createdat: input.now } };
}
function unwatchresource(watches, id, now) {
  return watches.map((watch) => watch.id === id && watch.canceledat === void 0 ? { ...watch, canceledat: now } : watch);
}
function notifyresource(input) {
  const deliveries = [];
  const watches = input.watches.map((watch) => {
    if (watch.canceledat !== void 0 || watch.resource !== input.resource) return watch;
    const delta = {};
    for (const [key, value] of Object.entries(input.state)) {
      if (!(key in watch.baseline) || watch.baseline[key] !== value) delta[key] = value;
    }
    if (Object.keys(delta).length === 0) return watch;
    deliveries.push({ watchid: watch.id, clientid: watch.clientid, delta });
    return { ...watch, baseline: { ...input.state }, lastdeliveredat: input.now };
  });
  return { deliveries, watches };
}
function requestsampling(input) {
  if (input.clientid.trim() === "") return { reason: "The sampling callback needs the paired client it addresses." };
  if (input.prompt.trim() === "") return { reason: "The sampling callback needs its prompt." };
  if (input.capabilities?.sampling === false) return { reason: "The client declared no sampling capability and the callback is refused." };
  if (input.maxtokens !== void 0 && (!Number.isFinite(input.maxtokens) || input.maxtokens <= 0)) return { reason: "The granted maximum tokens of a sampling callback must stay a positive user value." };
  const granted = input.pagegrant === true;
  const pagecontent = granted ? input.pagecontent : void 0;
  const prompt = granted || input.pagecontent === void 0 ? input.prompt : `${input.prompt}
The page content stays stripped because the user granted none.`;
  return { request: { id: input.id ?? randomid(), clientid: input.clientid, prompt, ...input.system !== void 0 ? { system: input.system } : {}, ...pagecontent !== void 0 ? { pagecontent } : {}, ...input.maxtokens !== void 0 ? { maxtokens: input.maxtokens } : {}, state: "pending", requestedat: input.now } };
}
function answersampling(input) {
  const match = input.requests.find((request2) => request2.id === input.id);
  if (match === void 0) return { requests: input.requests, reason: "The sampling answer names no stored request." };
  if (match.state !== "pending") return { requests: input.requests, reason: "The sampling request already closed its round trip." };
  const request = { ...match, state: input.refused === true ? "refused" : "answered", answeredat: input.now, ...input.refused !== true && input.answer !== void 0 ? { answer: input.answer } : {} };
  return { requests: input.requests.map((candidate) => candidate.id === input.id ? request : candidate), request };
}
function listprompts() {
  return [
    { name: "runreview", description: "Renders the run review prompt that asks the user model to summarize the executed steps of the approved plan behind the consent gates.", arguments: [{ name: "objective", description: "The objective of the approved plan under review.", required: true }, { name: "steps", description: "The executed step summaries the review covers.", required: true }, { name: "tone", description: "The tone of the summary.", default: "plain" }], template: "Review the run of the objective {{objective}}. Summarize the executed steps: {{steps}}. Keep the tone {{tone}} and state every refusal the consent gates raised." },
    { name: "pagesummary", description: "Renders the page summary prompt that condenses the observed page state of the session tab into the summary the client model asked for.", arguments: [{ name: "url", description: "The url of the observed page.", required: true }, { name: "observations", description: "The observed page state sections the summary condenses.", required: true }], template: "Summarize the page at {{url}} from the observations: {{observations}}. Name nothing the observations leave out." },
    { name: "failuretriage", description: "Renders the failure triage prompt that classifies a failed tool call through the retry hints of the structured error it produced.", arguments: [{ name: "tool", description: "The namespaced tool that failed.", required: true }, { name: "error", description: "The structured error of the failed call.", required: true }], template: "Triage the failure of the {{tool}} tool: {{error}}. Classify it as retryable, a busy window or a consent refusal and propose the next reviewed step." }
  ];
}
function renderprompt(prompt, args) {
  return prompt.template.replace(/\{\{\s*([a-z0-9]+)\s*\}\}/g, (whole, name) => {
    const value = args[name];
    if (value === void 0 || value === null) return whole;
    return typeof value === "string" ? value : JSON.stringify(value);
  });
}
function callprompt(input) {
  const prompt = listprompts().find((candidate) => candidate.name === input.name);
  if (prompt === void 0) return { reason: `The server exposes no prompt named ${input.name}.` };
  const args = input.args ?? {};
  const findings = [];
  const resolved = {};
  for (const argument of prompt.arguments) {
    const value = args[argument.name];
    if (value === void 0 || value === null || typeof value === "string" && value.trim() === "") {
      if (argument.default !== void 0) resolved[argument.name] = argument.default;
      else if (argument.required === true) findings.push(`The prompt argument ${argument.name} is required and stays empty.`);
      else resolved[argument.name] = "";
    } else {
      resolved[argument.name] = value;
    }
  }
  if (findings.length > 0) return { reason: findings.join(" ") };
  return { rendered: renderprompt(prompt, resolved), toolcall: { name: `prompts.${prompt.name}`, params: { prompt: prompt.name, arguments: resolved, rendered: renderprompt(prompt, resolved) } } };
}
function streamchunkof(input) {
  return { callid: input.callid, seq: input.seq, content: input.content, done: input.done === true, at: input.now };
}
function chunkcontent(input) {
  const size = input.size !== void 0 && Number.isFinite(input.size) && input.size > 0 ? Math.floor(input.size) : 80;
  const parts = [];
  for (let index = 0; index < input.content.length; index += size) parts.push(input.content.slice(index, index + size));
  const slices = parts.length > 0 ? parts : [""];
  return slices.map((content, index) => streamchunkof({ callid: input.callid, seq: index + 1, content, done: index === slices.length - 1, now: input.now + index }));
}
function assemblechunks(chunks) {
  return [...chunks].sort((one, two) => one.seq - two.seq).map((chunk) => chunk.content).join("");
}
function notifyprogress(input) {
  return { callid: input.callid, ...input.percent !== void 0 ? { percent: input.percent } : {}, message: input.message, cancellable: input.cancellable !== false, at: input.now };
}
function cancelframeof(input) {
  return { callid: input.callid, ...input.reason !== void 0 ? { reason: input.reason } : {}, at: input.now };
}
function canceltool(input) {
  const match = input.contexts.find((context2) => context2.callid === input.callid);
  if (match === void 0) return { contexts: input.contexts, reason: `The cancellation frame names no call context ${input.callid}.` };
  if (match.state !== "inflight") return { contexts: input.contexts, reason: `The call ${input.callid} already left the in flight state.` };
  const context = { ...match, state: "cancelled", endedat: input.now, ...input.partial !== void 0 ? { partial: input.partial } : {} };
  return { contexts: input.contexts.map((candidate) => candidate.callid === input.callid ? context : candidate), context };
}
function spawnsubagent(input) {
  const parent = input.records.find((record2) => record2.id === input.spec.parentid);
  if (!parent) throw new Error(`The spawn request names the parent ${input.spec.parentid} which the fleet registry does not carry.`);
  if (input.spec.objective.trim() === "") throw new Error("The spawn request needs its parent objective in plain language; the child works on the objective its parent handed over.");
  const parentdepth = depthoflineage({ spawns: input.spawns, agentid: parent.id });
  if (!Number.isInteger(input.spec.depth) || input.spec.depth <= 0) throw new Error("The spawn depth stays a positive whole number of the lineage.");
  if (input.spec.depth !== parentdepth + 1) throw new Error(`The spawn request depth ${input.spec.depth} must sit exactly one level under the parent lineage depth ${parentdepth}.`);
  if (parent.state === "paused") throw new Error(`The parent ${parent.name} sits paused; a paused parent spawns no child until its resume.`);
  if (parent.state === "stopped") throw new Error(`The parent ${parent.name} is stopped; a stopped parent spawns no child.`);
  const record = agentname({ records: input.records, id: input.id, proposed: input.name !== void 0 && input.name.trim() !== "" ? input.name : `${parent.name}sub${input.spec.depth}`, ...input.spec.role !== void 0 ? { role: input.spec.role } : { role: "worker" }, origin: parent.origin, now: input.now });
  const scope = childscopeof({ agentid: record.id, ...input.parentscope !== void 0 ? { parent: input.parentscope } : {}, ...input.spec.narrowscope !== void 0 ? { narrowed: input.spec.narrowscope } : {} });
  const spawn2 = { id: `${record.id}:spawn`, parentid: parent.id, childid: record.id, role: record.role, depth: input.spec.depth, objective: input.spec.objective.trim(), at: input.now };
  return { record, scope, spawn: spawn2 };
}
function childscopeof(input) {
  if (input.agentid.trim() === "") throw new Error("The child scope needs its agent id.");
  const parent = input.parent;
  if (parent === void 0) return { agentid: input.agentid.trim(), origins: [], toolnamespaces: [] };
  const narrowedorigins = (input.narrowed?.origins ?? []).map((origin) => origin.trim()).filter((origin) => origin !== "");
  const origins = narrowedorigins.length > 0 ? narrowedorigins.filter((origin) => parent.origins.includes(origin)) : parent.origins;
  if (narrowedorigins.length > 0 && origins.length === 0) throw new Error(`The narrowed origins ${narrowedorigins.join(", ")} sit outside the parent scope ${parent.origins.join(", ")}; the child scope never widens past its parent.`);
  const narrowedkinds = (input.narrowed?.actionkinds ?? []).map((kind) => kind.trim()).filter((kind) => kind !== "");
  const parentkinds = parent.actionkinds ?? [];
  const actionkinds = narrowedkinds.length > 0 ? narrowedkinds.filter((kind) => parentkinds.includes(kind)) : parentkinds;
  if (narrowedkinds.length > 0 && actionkinds.length === 0) throw new Error(`The narrowed action kinds ${narrowedkinds.join(", ")} sit outside the parent scope; the child scope never widens past its parent.`);
  return { agentid: input.agentid.trim(), origins, toolnamespaces: parent.toolnamespaces, ...actionkinds.length > 0 ? { actionkinds } : {}, ...parent.readonly === true ? { readonly: true } : {} };
}
function depthoflineage(input) {
  let current = input.agentid;
  let depth = 0;
  const seen = /* @__PURE__ */ new Set([current]);
  for (; ; ) {
    const spawn2 = input.spawns.find((entry) => entry.childid === current);
    if (!spawn2) return depth;
    if (seen.has(spawn2.parentid)) throw new Error(`The spawn lineage of the agent ${input.agentid} carries a cycle at ${spawn2.parentid}; the depth never loops.`);
    seen.add(spawn2.parentid);
    current = spawn2.parentid;
    depth += 1;
  }
}
function depthlimitof(input) {
  const depth = depthoflineage({ spawns: input.spawns, agentid: input.agentid });
  if (input.limit.maxdepth === void 0) return { depth, allowed: true, reason: `The lineage depth of the agent ${input.agentid} sits at ${depth}; the user configured no depth ceiling so the spawn recursion stays unbounded.` };
  if (depth > input.limit.maxdepth) return { depth, allowed: false, reason: `The lineage depth ${depth} of the agent ${input.agentid} passes the user configured depth limit ${input.limit.maxdepth}; the spawn refuses until the user raises the limit.` };
  return { depth, allowed: true, reason: `The lineage depth ${depth} of the agent ${input.agentid} sits inside the user configured depth limit ${input.limit.maxdepth}.` };
}
function aggregatereport(input) {
  if (input.id.trim() === "") throw new Error("The aggregatereport needs its id.");
  if (input.subject.trim() === "") throw new Error("The aggregatereport needs its subject in plain language.");
  const cells = input.cells.filter((cell) => cell.agentid.trim() !== "" && cell.section.trim() !== "");
  if (cells.length === 0) throw new Error("The aggregatereport merges at least one agent output; an empty parallel run aggregates nothing.");
  const sections = /* @__PURE__ */ new Map();
  for (const cell of cells) {
    const key = cell.section.trim();
    sections.set(key, [...sections.get(key) ?? [], { ...cell, agentid: cell.agentid.trim(), section: key }]);
  }
  const conflicts = [];
  for (const [key, writers] of [...sections.entries()].sort((one, two) => one[0] < two[0] ? -1 : 1)) {
    if (writers.length < 2) continue;
    const ordered = input.conflictorder !== void 0 ? writers.slice().sort((one, two) => {
      const oneindex = input.conflictorder.indexOf(one.agentid);
      const twoindex = input.conflictorder.indexOf(two.agentid);
      return (oneindex === -1 ? Number.MAX_SAFE_INTEGER : oneindex) - (twoindex === -1 ? Number.MAX_SAFE_INTEGER : twoindex);
    }) : writers;
    const winner = ordered[0];
    const resolved = input.conflictorder !== void 0 && input.conflictorder.includes(winner.agentid);
    conflicts.push({ key, ...resolved ? { resolvedby: winner.agentid } : {} });
  }
  const unresolved = conflicts.filter((conflict) => conflict.resolvedby === void 0);
  const complete = input.expected === void 0 || input.expected.every((agentid) => cells.some((cell) => cell.agentid === agentid));
  const state = unresolved.length > 0 || !complete ? "open" : "merged";
  return { id: input.id.trim(), subject: input.subject.trim(), cells, conflicts, ...input.expected !== void 0 ? { expected: input.expected } : {}, state, ...state === "merged" ? { mergedat: input.now } : {}, createdat: input.now };
}
function interleave(input) {
  const lanemap = /* @__PURE__ */ new Map();
  for (const lane of input.lanes) for (const agentid of lane.agentids ?? []) lanemap.set(agentid, lane.name);
  const events = input.events.map((event, index) => ({ id: event.id !== void 0 && event.id.trim() !== "" ? event.id.trim() : `ie${index}`, agentid: event.agentid, kind: event.kind, summary: event.summary, lane: event.lane !== void 0 && event.lane.trim() !== "" ? event.lane.trim() : lanemap.get(event.agentid) ?? "background", at: event.at }));
  if (events.length === 0) throw new Error("The interleaved timeline orders at least one agent action; an empty fleet view interleaves nothing.");
  return events.sort((one, two) => one.at - two.at || (one.id < two.id ? -1 : 1));
}
function lessonrecordof(input) {
  if (input.id.trim() === "") throw new Error("The lesson needs its id.");
  if (input.agentid.trim() === "") throw new Error("The lesson names the agent that found it.");
  if (input.finding.trim() === "") throw new Error("The lesson needs its finding in plain language; the fleet reads exactly what the run learned.");
  if (input.origin.trim() === "") throw new Error("The lesson names its origin; the matches prefer the lessons of the same site.");
  return { id: input.id.trim(), agentid: input.agentid.trim(), finding: input.finding.trim(), origin: input.origin.trim(), reusecount: 0, recordedat: input.now };
}
function lessonmatches(input) {
  if (input.task.trim() === "") return [];
  const words = new Set(input.task.toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 3));
  const scored = input.lessons.map((lesson) => {
    const lessonwords = lesson.finding.toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 3);
    const overlap = lessonwords.filter((word) => words.has(word)).length;
    const originmatch = input.origin !== void 0 && lesson.origin === input.origin ? 1 : 0;
    return { lesson, score: originmatch * 2 + overlap };
  }).filter((entry) => entry.score > 0).sort((one, two) => two.score - one.score || two.lesson.reusecount - one.lesson.reusecount);
  const limit = input.limit !== void 0 && Number.isFinite(input.limit) && input.limit > 0 ? Math.floor(input.limit) : scored.length;
  return scored.slice(0, limit).map((entry) => entry.lesson);
}
function lessonreuse(input) {
  const lesson = input.lessons.find((entry) => entry.id === input.id);
  if (!lesson) throw new Error(`The lesson ${input.id} does not exist; the reuse counts only the served lessons.`);
  return input.lessons.map((entry) => entry.id === input.id ? { ...entry, reusecount: entry.reusecount + 1, lastusedat: input.now } : entry);
}
function lessondecay(input) {
  if (input.stalewindow === void 0 || !Number.isFinite(input.stalewindow) || input.stalewindow <= 0) return input.lessons;
  const stalewindow = input.stalewindow;
  return input.lessons.filter((lesson) => {
    if (lesson.reusecount > 0) return true;
    const age = input.now - (lesson.lastusedat ?? lesson.recordedat);
    return age <= stalewindow;
  });
}
function arbitrationcaseof(input) {
  if (input.id.trim() === "") throw new Error("The arbitration case needs its id.");
  if (input.resource.trim() === "") throw new Error("The arbitration case names its contested resource.");
  if (input.origin.trim() === "") throw new Error("The arbitration case names the origin of its contested resource.");
  const requesters = [...new Set(input.requesters.map((id) => id.trim()).filter((id) => id !== ""))];
  if (requesters.length < 2) throw new Error(`The arbitration case of ${input.resource.trim()} needs at least two requesting agents; one requester contests nothing.`);
  const lanepriority = /* @__PURE__ */ new Map();
  for (const lane2 of input.lanes) for (const agentid of lane2.agentids ?? []) lanepriority.set(agentid, lane2.priority);
  const first = requesters[0];
  const winner = requesters.slice(1).reduce((lead, candidate) => (lanepriority.get(candidate) ?? 0) > (lanepriority.get(lead) ?? 0) ? candidate : lead, first);
  const lane = input.lanes.find((entry) => (entry.agentids ?? []).includes(winner));
  const verdict = { holderagentid: winner, lane: lane?.name ?? "background", reason: winner === first ? `The first requester ${winner} holds ${input.resource.trim()} by default; no lane of a peer outranks it.` : `The requester ${winner} of the ${lane?.name ?? "background"} lane outranks the first requester through its user configured priority; the verdict honors the lane.`, grantedat: input.now };
  return { id: input.id.trim(), resource: input.resource.trim(), origin: input.origin.trim(), requesterids: requesters, state: "granted", verdict, openedat: input.now };
}
function releasecase(input) {
  const record = input.cases.find((entry) => entry.id === input.id);
  if (!record) throw new Error(`The arbitration case ${input.id} does not exist.`);
  if (record.state !== "granted") throw new Error(`The arbitration case ${record.id} carries no granted verdict to release.`);
  if (!input.holderfinished) throw new Error(`The holder ${record.verdict?.holderagentid} of ${record.resource} still works; the verdict releases only when the holder finishes.`);
  return { ...record, state: "released", closedat: input.now };
}
function prioritylaneof(input) {
  const tasks = input.tasks.map((task) => ({ ...task, lane: task.sensitive === true ? "interactive" : task.lane }));
  const order = (lane) => {
    const found = input.lanes.find((entry) => entry.name === lane);
    if (found?.interactive === true) return Number.MAX_SAFE_INTEGER;
    return found?.priority ?? 0;
  };
  const groups = [...new Set(tasks.map((task) => task.lane))].sort((one, two) => order(two) - order(one));
  const queues = /* @__PURE__ */ new Map();
  for (const lane of groups) queues.set(lane, tasks.filter((task) => task.lane === lane).sort((one, two) => (two.priority ?? 0) - (one.priority ?? 0) || one.enqueuedat - two.enqueuedat));
  const ordered = [];
  for (; ; ) {
    let served = false;
    for (const lane of groups) {
      const queue = queues.get(lane) ?? [];
      const next = queue.shift();
      if (next !== void 0) {
        ordered.push(next);
        served = true;
      }
    }
    if (!served) return ordered;
  }
}
function loadreportof(input) {
  if (input.origin.trim() === "") throw new Error("The load report names its origin.");
  if (!Number.isFinite(input.concurrency) || input.concurrency < 0) throw new Error("The load report concurrency stays zero or positive.");
  if (!Number.isFinite(input.latency) || input.latency < 0) throw new Error("The load report latency stays zero or positive milliseconds.");
  return { origin: input.origin.trim(), concurrency: Math.floor(input.concurrency), latency: Math.round(input.latency), sampledat: input.now };
}
function scalesuggestion(input) {
  return input.reports.map((report) => {
    if (input.throttlethreshold !== void 0 && Number.isFinite(input.throttlethreshold) && input.throttlethreshold > 0 && report.latency >= input.throttlethreshold) return { origin: report.origin, suggestion: "pause", reason: `The origin ${report.origin} throttles at ${report.latency} milliseconds of latency past the threshold ${input.throttlethreshold}; pausing one worker eases the site, and the pause needs the user.` };
    if (input.lowthreshold !== void 0 && Number.isFinite(input.lowthreshold) && input.lowthreshold > 0 && report.concurrency <= input.lowthreshold && report.latency < input.lowthreshold) return { origin: report.origin, suggestion: "spawn", reason: `The origin ${report.origin} carries its load of ${report.concurrency} worker${report.concurrency === 1 ? "" : "s"} with ${report.latency} milliseconds of latency; spawning one more worker shares the work, and the spawn needs the user consent.` };
    return { origin: report.origin, suggestion: "hold", reason: `The origin ${report.origin} carries ${report.concurrency} worker${report.concurrency === 1 ? "" : "s"} at ${report.latency} milliseconds of latency; the fleet holds its size.` };
  });
}
function costentryof(input) {
  if (input.agentid.trim() === "") throw new Error("The cost entry names the agent that caused it.");
  if (!Number.isFinite(input.units) || input.units <= 0) throw new Error("The cost entry carries a positive number of units; a zero cost never enters the ledger.");
  if (input.description.trim() === "") throw new Error("The cost entry describes what its units bought in plain language.");
  return { agentid: input.agentid.trim(), ...input.runid !== void 0 && input.runid.trim() !== "" ? { runid: input.runid.trim() } : {}, units: input.units, description: input.description.trim(), at: input.now };
}
function sharedcostsplit(input) {
  const solo = /* @__PURE__ */ new Map();
  const groups = /* @__PURE__ */ new Map();
  for (const entry of input.entries) {
    const group = groups.get(entry.description) ?? /* @__PURE__ */ new Map();
    group.set(entry.agentid, (group.get(entry.agentid) ?? 0) + entry.units);
    groups.set(entry.description, group);
  }
  for (const group of groups.values()) {
    const agents = [...group.keys()];
    if (agents.length === 1) {
      const agentid = agents[0];
      solo.set(agentid, (solo.get(agentid) ?? 0) + (group.get(agentid) ?? 0));
    }
  }
  const shared = /* @__PURE__ */ new Map();
  for (const group of groups.values()) {
    const agents = [...group.keys()];
    if (agents.length < 2) continue;
    const total = [...group.values()].reduce((sum, units) => sum + units, 0);
    const share = total / agents.length;
    for (const agentid of agents) {
      const current = shared.get(agentid) ?? { units: 0, peers: /* @__PURE__ */ new Set() };
      current.units += share;
      for (const peer of agents) if (peer !== agentid) current.peers.add(peer);
      shared.set(agentid, current);
    }
  }
  const agentids = [.../* @__PURE__ */ new Set([...solo.keys(), ...shared.keys()])].sort();
  return agentids.map((agentid) => {
    const soloamount = solo.get(agentid) ?? 0;
    const sharedamount = shared.get(agentid);
    return { agentid, units: soloamount + (sharedamount?.units ?? 0), share: soloamount, ...sharedamount !== void 0 ? { sharedwith: [...sharedamount.peers].sort() } : {} };
  });
}
function roledefaults(role) {
  if (role === "planner") return { toolnamespaces: ["workflow", "memory", "system"], description: "Planners compose reviewed plans and read memory; they never act on the page themselves." };
  if (role === "observer") return { toolnamespaces: ["memory", "system"], description: "Observers read the shared memory and the system reports only." };
  if (role === "critic") return { toolnamespaces: ["workflow", "memory", "system"], description: "Critics review the outputs of the other agents read only; they never act on the page themselves." };
  if (role === "verifier") return { toolnamespaces: ["browser", "memory", "system"], description: "Verifiers re-read the page to check the claims of the other agents; their checks stay read side." };
  return { toolnamespaces: ["browser", "workflow", "memory", "system"], description: role === "worker" ? "Workers execute the reviewed steps of approved plans." : `The custom role ${role} carries the worker defaults until the user narrows its scope.` };
}
function registeragent(input) {
  if (input.name.trim() === "") throw new Error("The agent needs the user chosen name; agent naming stays a user choice.");
  if (input.tabid !== void 0 && input.agents.some((agent2) => agent2.tabid === input.tabid && agent2.state !== "stopped")) throw new Error(`Tab ${input.tabid} already holds the agent ${input.agents.find((agent2) => agent2.tabid === input.tabid)?.name ?? "another agent"}; one tab binds one agent.`);
  if (input.id !== "" && input.agents.some((agent2) => agent2.id === input.id)) throw new Error(`The agent id ${input.id} is already registered.`);
  const agent = { id: input.id, name: input.name.trim(), role: input.role ?? "worker", depth: 0, state: "active", ...input.tabid !== void 0 ? { tabid: input.tabid } : {}, ...input.sessionid !== void 0 ? { sessionid: input.sessionid } : {}, registeredat: input.now, heartbeatat: input.now };
  return [agent, ...input.agents];
}
function assignrole(input) {
  const agent = input.agents.find((entry) => entry.id === input.agentid);
  if (!agent) throw new Error(`The agent ${input.agentid} is not registered.`);
  return input.agents.map((entry) => entry.id === input.agentid ? { ...entry, role: input.role, heartbeatat: input.now } : entry);
}
function opentabagent(input) {
  const agent = input.agents.find((entry) => entry.id === input.agentid);
  if (!agent) throw new Error(`The agent ${input.agentid} is not registered.`);
  const holder = input.agents.find((entry) => entry.tabid === input.tabid && entry.id !== input.agentid && entry.state !== "stopped");
  if (holder) throw new Error(`Tab ${input.tabid} already holds the agent ${holder.name}; one tab binds one agent.`);
  return input.agents.map((entry) => entry.id === input.agentid ? { ...entry, tabid: input.tabid, ...input.sessionid !== void 0 ? { sessionid: input.sessionid } : {}, heartbeatat: input.now } : entry);
}
function spawn(input) {
  const parent = input.agents.find((entry) => entry.id === input.request.parentid);
  if (!parent) throw new Error(`The spawn request names the parent ${input.request.parentid} which is not registered.`);
  if (input.request.task.trim() === "") throw new Error("The spawn request needs its task in plain language.");
  if (input.request.depth !== parent.depth + 1) throw new Error(`The spawn request depth ${input.request.depth} must sit exactly one level under the parent depth ${parent.depth}.`);
  if (input.limit.maxdepth !== void 0 && input.request.depth > input.limit.maxdepth) throw new Error(`The spawn refuses recursion at depth ${input.request.depth}: the user configured depth limit stops at ${input.limit.maxdepth}.`);
  const child = { id: input.id, name: input.name?.trim() !== "" && input.name !== void 0 ? input.name.trim() : `${parent.name} sub ${input.request.depth}`, role: input.request.role, parentid: parent.id, depth: input.request.depth, state: "active", registeredat: input.now, heartbeatat: input.now };
  return [child, ...input.agents];
}
function pauseone(input) {
  const agent = input.agents.find((entry) => entry.id === input.agentid);
  if (!agent) throw new Error(`The agent ${input.agentid} is not registered.`);
  if (agent.state === "stopped") throw new Error(`The agent ${agent.name} is stopped; a stopped agent needs no pause.`);
  return input.agents.map((entry) => entry.id === input.agentid ? { ...entry, state: "paused", heartbeatat: input.now } : entry);
}
function resumeone(input) {
  const agent = input.agents.find((entry) => entry.id === input.agentid);
  if (!agent) throw new Error(`The agent ${input.agentid} is not registered.`);
  if (agent.state !== "paused") throw new Error(`The agent ${agent.name} is not paused.`);
  return input.agents.map((entry) => entry.id === input.agentid ? { ...entry, state: "active", heartbeatat: input.now } : entry);
}
function stopone(input) {
  const agent = input.agents.find((entry) => entry.id === input.agentid);
  if (!agent) throw new Error(`The agent ${input.agentid} is not registered.`);
  return input.agents.map((entry) => entry.id === input.agentid ? { ...entry, state: "stopped", heartbeatat: input.now } : entry);
}
function killall(input) {
  return {
    agents: input.agents.map((agent) => ({ ...agent, state: "stopped", heartbeatat: input.now })),
    killswitch: { engaged: true, engagedat: input.now, ...input.reason !== void 0 && input.reason.trim() !== "" ? { reason: input.reason } : {} }
  };
}
function disarmkillswitch(now) {
  return { engaged: false, engagedat: now };
}
function agentbudgetcheck(input) {
  const budget = input.agent.budget;
  const usage = input.usage;
  if (!budget || !usage) return { halted: false };
  if (budget.maxtokens !== void 0 && usage.tokens > budget.maxtokens) return { halted: true, reason: `The agent ${input.agent.name} spent ${usage.tokens} tokens past its ceiling of ${budget.maxtokens}; the user raises the ceiling or stops the agent.` };
  if (budget.maxcost !== void 0 && usage.cost > budget.maxcost) return { halted: true, reason: `The agent ${input.agent.name} spent ${usage.cost} past its cost ceiling of ${budget.maxcost}; the user raises the ceiling or stops the agent.` };
  if (budget.maxsteps !== void 0 && usage.steps > budget.maxsteps) return { halted: true, reason: `The agent ${input.agent.name} executed ${usage.steps} steps past its ceiling of ${budget.maxsteps}; the user raises the ceiling or stops the agent.` };
  return { halted: false };
}
function scopegate(input) {
  if (!input.scope) return { allowed: true };
  if (input.origin !== void 0 && input.scope.origins.length > 0 && !input.scope.origins.includes(input.origin)) return { allowed: false, reason: `The agent scope grants no access to the origin ${input.origin}.` };
  if (input.namespace !== void 0 && input.scope.toolnamespaces.length > 0 && !input.scope.toolnamespaces.includes(input.namespace)) return { allowed: false, reason: `The agent scope grants no access to the ${input.namespace} tool namespace.` };
  return { allowed: true };
}
function agentheartbeat(input) {
  return input.agents.map((entry) => entry.id === input.agentid ? { ...entry, heartbeatat: input.now } : entry);
}
function recordagentusage(input) {
  const base = input.usage ?? { agentid: input.agentid, tokens: 0, cost: 0, steps: 0, updatedat: input.now };
  return { agentid: input.agentid, tokens: base.tokens + (input.tokens ?? 0), cost: base.cost + (input.cost ?? 0), steps: base.steps + (input.steps ?? 0), updatedat: input.now };
}
function agentruncontext(input) {
  return { agentid: input.agent.id, taskid: input.task.id, run: newworkflowrun({ id: `${input.agent.id}:${input.task.id}`, workflowid: input.task.lane, now: input.now }) };
}
function agenteventof(input) {
  return { id: input.id, kind: input.kind, summary: input.summary, ...input.agentid !== void 0 ? { agentid: input.agentid } : {}, ...input.taskid !== void 0 ? { taskid: input.taskid } : {}, at: input.now };
}
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
function swarmstateof(input) {
  return { agents: input.agents, queue: input.queue, mailboxes: input.mailboxes, killswitch: input.killswitch };
}
function lockkey(origin, selector) {
  return `${origin}|${selector}`;
}
function preparehandoff(input) {
  if (!input.agents.some((agent) => agent.id === input.fromagentid)) throw new Error(`The handoff names the transferring agent ${input.fromagentid} which is not registered.`);
  if (!input.agents.some((agent) => agent.id === input.toagentid)) throw new Error(`The handoff names the receiving agent ${input.toagentid} which is not registered.`);
  if (input.fromagentid === input.toagentid) throw new Error("A handoff moves a task between two different agents; an agent never hands off to itself.");
  if (input.taskstate.trim() === "") throw new Error("The handoff needs its packaged task state in plain language; the resume continues exactly from it.");
  const from = input.agents.find((agent) => agent.id === input.fromagentid);
  const tabid = input.tabid ?? from.tabid;
  if (tabid === void 0) throw new Error("The handoff needs its tab id; the transferring agent holds no tab to hand off.");
  return { id: input.id, fromagentid: input.fromagentid, toagentid: input.toagentid, tabid, taskstate: input.taskstate, state: "prepared", ...input.reason !== void 0 && input.reason.trim() !== "" ? { reason: input.reason } : {}, createdat: input.now };
}
function transferhandoff(input) {
  const record = input.handoffs.find((entry) => entry.id === input.id);
  if (!record) throw new Error(`The handoff ${input.id} does not exist.`);
  if (record.state !== "prepared") throw new Error(`The handoff ${record.id} is ${record.state}; only a prepared handoff transfers.`);
  const receiver = input.agents.find((agent) => agent.id === record.toagentid);
  if (!receiver) throw new Error(`The receiving agent ${record.toagentid} is not registered.`);
  if (receiver.state === "stopped") throw new Error(`The receiving agent ${receiver.name} is stopped; the handoff waits for its resume or another receiver.`);
  const holder = input.agents.find((agent) => agent.tabid === record.tabid && agent.id !== record.fromagentid && agent.state !== "stopped");
  if (holder) throw new Error(`Tab ${record.tabid} already holds the agent ${holder.name}; one tab binds one agent.`);
  const agents = input.agents.map((agent) => {
    if (agent.id === record.fromagentid) {
      const { tabid, ...rest } = agent;
      void tabid;
      return rest;
    }
    if (agent.id === record.toagentid && record.tabid !== void 0) return { ...agent, tabid: record.tabid };
    return agent;
  });
  return { agents, handoffs: input.handoffs.map((entry) => entry.id === input.id ? { ...entry, state: "transferred", transferredat: input.now } : entry) };
}
function resumehandoff(input) {
  const record = input.handoffs.find((entry) => entry.id === input.id);
  if (!record) throw new Error(`The handoff ${input.id} does not exist.`);
  if (record.state !== "transferred") throw new Error(`The handoff ${record.id} is ${record.state}; only a transferred handoff resumes.`);
  return { ...record, state: "resumed", resumedat: input.now };
}
function acquirelock(input) {
  if (input.holder.trim() === "") throw new Error("The lock needs its holder agent id.");
  if (input.origin.trim() === "") throw new Error("The lock needs its origin; a lock never spans unrelated origins.");
  if (input.selector.trim() === "") throw new Error("The lock needs its selector of the origin.");
  const kind = input.kind ?? "exclusive";
  const key = lockkey(input.origin.trim(), input.selector.trim());
  const held = input.locks.filter((lock2) => lock2.key === key);
  if (held.some((lock2) => lock2.holder === input.holder)) return { locks: input.locks, acquired: false, reason: `The agent ${input.holder} already holds the lock ${key}.` };
  if (held.length > 0) {
    if (held.some((lock2) => lock2.kind === "exclusive") || kind === "exclusive") return { locks: input.locks, acquired: false, reason: `The lock ${key} is held ${held.some((lock2) => lock2.kind === "exclusive") ? "exclusively" : "shared"}; the ${kind} request of ${input.holder} refuses.` };
  }
  const lock = { key, holder: input.holder, kind, origin: input.origin.trim(), selector: input.selector.trim(), acquiredat: input.now, ...input.expiresat !== void 0 ? { expiresat: input.expiresat } : {} };
  return { locks: [...input.locks, lock], acquired: true, reason: `The ${kind} lock ${key} went to the agent ${input.holder}.` };
}
function releaselock(input) {
  const lock = input.locks.find((entry) => entry.key === input.key && entry.holder === input.holder);
  if (!lock) return { locks: input.locks, released: false };
  return { locks: input.locks.filter((entry) => entry.key !== input.key || entry.holder !== input.holder), released: true };
}
function expirelocks(input) {
  const stale = input.locks.filter((lock) => lock.expiresat !== void 0 && input.now > lock.expiresat);
  if (stale.length === 0) return { locks: input.locks, expired: [] };
  const keys = new Set(stale.map((lock) => `${lock.key}:${lock.holder}`));
  return { locks: input.locks.filter((lock) => !keys.has(`${lock.key}:${lock.holder}`)), expired: [...keys] };
}
function scanconflicts(input) {
  const targets = /* @__PURE__ */ new Map();
  for (const writer of input.writers) {
    const key = lockkey(writer.origin, writer.selector);
    targets.set(key, [...targets.get(key) ?? [], writer]);
  }
  const overlaps = [...targets.entries()].filter(([, writers]) => writers.length > 1).map(([key, writers]) => ({ origin: writers[0].origin, selector: writers[0].selector, writers: writers.map((writer) => writer.agentid) }));
  const overlappingagents = new Set(overlaps.flatMap((entry) => entry.writers));
  return {
    id: input.id,
    writers: input.writers,
    overlaps,
    suggestedorder: input.writers.filter((writer) => overlappingagents.has(writer.agentid)).map((writer) => writer.agentid).filter((agentid, index, all) => all.indexOf(agentid) === index).sort((one, two) => one < two ? -1 : 1),
    clean: overlaps.length === 0,
    scannedat: input.now
  };
}
function mergeresults(input) {
  const keys = /* @__PURE__ */ new Map();
  for (const entry of input.entries) {
    keys.set(entry.key, [...keys.get(entry.key) ?? [], entry]);
  }
  const conflicts = [];
  const merged = [];
  for (const [key, entries] of keys) {
    const ordered = [...entries].sort((one, two) => one.mergedat - two.mergedat);
    if (ordered.length === 1) {
      merged.push(ordered[0]);
      continue;
    }
    if (input.rule === "fail") {
      conflicts.push(`The key ${key} carries ${ordered.length} parallel values from ${ordered.map((entry) => entry.agentid).join(", ")}; the fail rule refuses the fold.`);
      continue;
    }
    const winner = input.rule === "first" ? ordered[0] : input.rule === "last" ? ordered[ordered.length - 1] : ordered.find((entry) => entry.agentid === input.preferagent) ?? ordered[ordered.length - 1];
    const note = input.rule === "preferagent" && input.preferagent !== void 0 && !ordered.some((entry) => entry.agentid === input.preferagent) ? `The preferagent rule names the agent ${input.preferagent} which wrote no value; the latest value of ${winner.agentid} stayed.` : `The ${input.rule} rule kept the value of ${winner.agentid} from ${ordered.map((entry) => entry.agentid).join(", ")}.`;
    conflicts.push(`The key ${key}: ${note}`);
    merged.push({ ...winner, id: `${winner.id}:merged`, conflict: note });
  }
  return { entries: merged, conflicts, refused: input.rule === "fail" && conflicts.length > 0 };
}
function swarmreport(input) {
  if (input.title.trim() === "") throw new Error("The report needs its title.");
  const fold = mergeresults({ entries: input.outputs, rule: input.rule, ...input.preferagent !== void 0 ? { preferagent: input.preferagent } : {}, now: input.now });
  const groups = /* @__PURE__ */ new Map();
  for (const entry of fold.entries) {
    const group = entry.taskid ?? "general";
    groups.set(group, [...groups.get(group) ?? [], entry]);
  }
  const sections = [...groups.entries()].map(([taskid, entries]) => ({ title: `Task ${taskid}`, entries, sources: [...new Set(input.outputs.filter((output) => (output.taskid ?? "general") === taskid).map((output) => output.agentid))] }));
  return {
    report: { id: input.id, title: input.title.trim(), sections, sources: [...new Set(input.outputs.map((output) => output.agentid))], ...input.confidence !== void 0 && input.confidence.trim() !== "" ? { confidence: input.confidence } : {}, createdat: input.now },
    conflicts: fold.conflicts,
    refused: fold.refused
  };
}
function compareoutputs(input) {
  if (input.subject.trim() === "") throw new Error("The comparison needs its subject.");
  if (input.outputs.length < 2) throw new Error("The comparison contrasts at least two competing outputs.");
  const differences = input.outputs.filter((output) => output.value !== input.outputs[0]?.value).map((output) => `The agent ${output.agentid} answers ${output.value} while the agent ${input.outputs[0].agentid} answers ${input.outputs[0].value}.`);
  return { id: input.id, subject: input.subject, outputs: input.outputs, differences, comparedat: input.now };
}
function interleavetimeline(actions) {
  return [...actions].sort((one, two) => one.at - two.at || (one.id < two.id ? -1 : 1));
}
function sharelesson(input) {
  if (input.statement.trim() === "") throw new Error("The lesson needs its statement in plain language.");
  if (input.verifiedby.trim() === "") throw new Error("The lesson needs its verifier; only a verified lesson lands on the board.");
  return postentry({ board: input.board, id: input.id, key: `lesson:${input.statement.trim().slice(0, 40)}`, value: `${input.statement.trim()} (verified by ${input.verifiedby.trim()})`, section: input.section ?? "findings", author: input.agentid.trim() === "" ? "user" : input.agentid, consentclass: input.consentclass ?? "read", now: input.now });
}
function swarmcosts(input) {
  return {
    agents: input.usage.length,
    tokens: input.usage.reduce((total, usage) => total + usage.tokens, 0),
    cost: input.usage.reduce((total, usage) => total + usage.cost, 0),
    steps: input.usage.reduce((total, usage) => total + usage.steps, 0),
    ...input.currency !== void 0 && input.currency.trim() !== "" ? { currency: input.currency } : {},
    computedat: input.now
  };
}
function replayagentrun(input) {
  return interleavetimeline(input.events.filter((event) => event.agentid === input.agentid).map((event) => ({ id: event.id, kind: event.kind, summary: event.summary, at: event.at, ...event.agentid !== void 0 ? { agentid: event.agentid } : {} })));
}

// memory.ts
function randomid() {
  return crypto.randomUUID();
}
var sensitivememoryclasses = /* @__PURE__ */ new Set(["credential", "secret", "token", "body", "capture", "profile"]);

// security.ts
function exactorigin(origin, entry) {
  return origin.trim() !== "" && origin === entry;
}
function wildcardentry(entry) {
  return entry.includes("*") || entry.includes("://*.") || entry.trim() === "" || entry.trim() === "https://" || entry.trim() === "http://";
}
function allowlistcheck(input) {
  if (input.origin.trim() === "") return { allowed: false, reason: "The step needs the exact origin it targets." };
  for (const entry of input.allowlist) {
    if (wildcardentry(entry.origin)) return { allowed: false, reason: `The allowlist entry ${entry.origin} carries a wildcard; every grant binds to one exact origin with no wildcard expansion.` };
  }
  const scoped = input.profileid === void 0 ? input.allowlist : input.allowlist.filter((entry) => entry.profileid === input.profileid);
  const granted = scoped.some((entry) => exactorigin(input.origin, entry.origin));
  if (granted) return { allowed: true, reason: `The origin ${input.origin} sits inside the automation allowlist the user granted.` };
  if (input.sessionorigin !== void 0 && exactorigin(input.origin, input.sessionorigin)) return { allowed: true, reason: `The active tab grant covers ${input.origin} as exactly one explicit single origin grant.` };
  return { allowed: false, reason: `The denydefault posture refuses ${input.origin} because the origin sits absent from the automation allowlist; grant the origin first.` };
}
function profilegrade(input) {
  if (!input.sensitive) return { allowed: true, consult: false, reason: `The ${input.kind} kind grades non-sensitive and the origin profile needs no consult.` };
  if (input.profile === void 0) return { allowed: true, consult: true, reason: `No origin profile exists for the ${input.kind} kind, so the fresh class consent gate alone routes the sensitive step.` };
  if (input.profile.denials.includes(input.kind)) return { allowed: false, consult: true, reason: `The origin profile of ${input.profile.origin} denies the ${input.kind} kind; a denied kind never runs on that origin.` };
  if (input.profile.grants.includes(input.kind)) return { allowed: true, consult: true, reason: `The origin profile of ${input.profile.origin} grants the ${input.kind} kind the user reviewed.` };
  return { allowed: true, consult: true, reason: `The origin profile of ${input.profile.origin} carries no ${input.kind} decision, so the fresh class consent gate alone routes the sensitive step.` };
}
function stepoptions2(step) {
  if (!step.options) return {};
  try {
    const parsed = JSON.parse(step.options);
    return Boolean(parsed) && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}
var paymentkinds = /* @__PURE__ */ new Set(["fillcard", "fillcode"]);
var credentialkinds = /* @__PURE__ */ new Set(["consentpassword", "saveapikey", "handleauth", "authflow"]);
var deletekinds = /* @__PURE__ */ new Set(["discardtab", "closepattern", "clearcookies", "removeattribute", "cleanupartifacts"]);
var publishkinds = /* @__PURE__ */ new Set(["postform", "postfiles", "sendmessage", "submitform", "submitsearch", "writeclipboard"]);
var defaultsensitivekinds = /* @__PURE__ */ new Set(["attachfile", "uploadfile", "uploadfiles", "downloadfile", "downloadimages", "batchdownload", "pausedownload", "resumedownload", "quarantinedownload", "evaluate"]);
function sensitiveclassesof(step) {
  const options = stepoptions2(step);
  const fields = Array.isArray(options.fields) ? options.fields.filter((item) => Boolean(item) && typeof item === "object") : [];
  const names = [...fields.map((field) => typeof field.name === "string" ? field.name : ""), typeof options.field === "string" ? options.field : "", typeof options.target === "string" ? options.target : ""].map((name) => name.toLowerCase());
  const carries = (shape) => names.some((name) => name.includes(shape));
  const classes = /* @__PURE__ */ new Set();
  if (paymentkinds.has(step.kind) || carries("card") || carries("cvc") || carries("cvv")) classes.add("payment");
  const credentialshape = carries("password") || carries("token") || carries("secret") || carries("apikey") || carries("passphrase");
  const submits = step.kind === "submitform" || step.kind === "postform" || step.kind === "submitsearch" || step.kind === "fillform" || step.kind === "filllabel" || step.kind === "fillplaceholder";
  if (credentialkinds.has(step.kind) || submits && credentialshape) classes.add("credential");
  if (deletekinds.has(step.kind)) classes.add("delete");
  if (publishkinds.has(step.kind) || step.kind === "callrest" || step.kind === "callgraphql") {
    const verb = typeof options.method === "string" ? options.method.trim().toUpperCase() : typeof options.verb === "string" ? options.verb.trim().toUpperCase() : "";
    if (step.kind === "callrest" || step.kind === "callgraphql") {
      if (verb !== "" && !["GET", "HEAD", "OPTIONS"].includes(verb)) classes.add("publish");
    } else classes.add("publish");
  }
  const bydefault = defaultsensitivekinds.has(step.kind);
  const list = [...classes];
  if (list.length === 0 && !bydefault) return { classes: [], bydefault: false, sensitive: false, reason: `The ${step.kind} kind carries no sensitive class and no default sensitive grade.` };
  return { classes: list, bydefault, sensitive: true, reason: `The ${step.kind} kind grades sensitive${list.length > 0 ? ` through the ${list.join(", ")} class${list.length === 1 ? "" : "es"}` : ""}${bydefault ? " by default" : ""}.` };
}
function classconsentcovers(consents, origin, sensitiveclass, now) {
  return consents.some((consent) => consent.origin === origin && consent.sensitiveclass === sensitiveclass && consent.grantedat <= now && (consent.expiresat === void 0 || now < consent.expiresat));
}
function missingclassconsents(input) {
  const missing = input.classes.filter((kind) => !classconsentcovers(input.consents, input.origin, kind, input.now));
  if (missing.length > 0) return { needed: true, missing, reason: `The sensitive classes ${missing.join(", ")} need one fresh consent prompt each on ${input.origin}.` };
  if (input.bydefault && input.classes.length === 0) return { needed: true, missing: [], reason: `The ${input.origin} step grades sensitive by default and needs its fresh consent window prompt.` };
  return { needed: false, missing: [], reason: `The fresh class consents of ${input.origin} cover every class the step names.` };
}
function consentwindowstate(window, now) {
  if (window.state === "closed" || now >= window.expiresat) return { state: "expired", remaining: 0, reason: `The consent window of ${window.origin} closed at its ${window.boundary} boundary; the run suspends until a new explicit prompt renews it.` };
  return { state: "active", remaining: window.expiresat - now, reason: `The consent window of ${window.origin} stays active with ${window.expiresat - now} milliseconds left of its ${window.boundary} boundary.` };
}
function windowgatesstep(input) {
  if (input.window === void 0) return { allowed: false, suspended: false, reason: `No active consent window covers ${input.origin}; the consent prompt opens one before any step dispatches.` };
  if (input.window.sessionid !== input.sessionid) return { allowed: false, suspended: false, reason: `The consent window scopes to the session ${input.window.sessionid} only and never widens to another session.` };
  if (input.window.origin !== input.origin) return { allowed: false, suspended: false, reason: `The consent window scopes to the origin ${input.window.origin} only and never widens to another origin.` };
  const state = consentwindowstate(input.window, input.now);
  if (state.state === "expired") return { allowed: false, suspended: true, reason: state.reason };
  return { allowed: true, suspended: false, reason: state.reason };
}
function origincheckof(input) {
  const sender = input.senderid ?? "an unknown sender";
  const origin = input.senderorigin ?? "";
  if (input.senderid === input.extensionid) return { accepted: true, sender, origin, reason: "The sender is this extension itself; the internal surface accepts." };
  if (input.senderid !== void 0 && input.connectallow.some((entry) => entry.senderid === input.senderid && (entry.origin === void 0 || entry.origin === origin))) {
    return { accepted: true, sender, origin, reason: `The sender ${sender} sits in the connectallow list the user manages${origin !== "" ? ` for ${origin}` : ""}; the message accepts.` };
  }
  if (input.senderid === void 0) return { accepted: false, sender, origin, reason: "The message carries no sender identity; the guard drops it before any handler runs." };
  return { accepted: false, sender, origin, reason: `The sender ${sender} sits absent from the connectallow list; the guard drops the message without handler execution.` };
}
function bucketboundsvalid(limit, window) {
  if (!Number.isFinite(limit) || limit <= 0) return { valid: false, reason: "The ratelimit bucket limit stays a positive user value; no hidden ceiling exists." };
  if (!Number.isFinite(window) || window <= 0) return { valid: false, reason: "The ratelimit bucket window stays a positive user value in milliseconds; the window reset stays the user's choice." };
  return { valid: true, reason: `The bucket bound of ${limit} commands per ${window} milliseconds stays the user configured choice with no hidden ceiling.` };
}
function phishthresholdvalid(threshold) {
  if (!Number.isFinite(threshold) || threshold <= 0 || threshold >= 1) return { valid: false, reason: "The phishguard threshold stays a user choice between zero and one; the lookalike line never defaults." };
  return { valid: true, reason: `The lookalike threshold ${threshold} stays the user configured line a login origin crosses at its own risk.` };
}

// llm.ts
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
function longpollrequestof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const entry = value;
  if (typeof entry.url !== "string" || !entry.url.trim()) return void 0;
  const request = { url: entry.url.trim() };
  if (typeof entry.timeout === "number" && Number.isFinite(entry.timeout) && entry.timeout > 0) request.timeout = entry.timeout;
  if (typeof entry.cursor === "string" && entry.cursor.trim()) request.cursor = entry.cursor.trim();
  return request;
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

// policy.ts
var sensitiveactions = /* @__PURE__ */ new Set(["click", "type", "navigate", "select", "presskey", "drag", "drop", "upload", "clear", "check", "uncheck", "toggle", "submit", "reload", "back", "forward", "writestorage", "setattribute", "removeattribute", "evaluate", "tabcreate", "tabactivate", "tabclose", "tabreload", "windowcreate", "windowclose", "windowresize", "downloadfile", "clickpoint", "shiftclick", "dismissdialog", "enterframe", "typetime", "appendtext", "setvalue", "typeedit", "keyhold", "keyrelease", "submitsearch", "selectmulti", "chooseradio", "setslider", "setdate", "setcolor", "openlink", "openprivate", "reloadcache", "stopnav", "followlink", "spanav", "rewritequery", "setfragment", "navlist", "navprofile", "handleauth", "printpdf", "prefetch", "preconnect", "deeplink", "reopentab", "pausenav", "navrate", "openclipboard", "batchopen", "duplicatetab", "closepattern", "pintab", "mutetab", "movetab", "movetabwindow", "grouptabs", "colorgroup", "collapsegroup", "discardtab", "reloadtabs", "zoomin", "zoomout", "switchtab", "maximizewindow", "minimizewindow", "restorewindow", "focuswindow", "scratchwindow", "incognitowindow", "restoretab", "restorelayout", "reopenrun", "badgetab", "fillform", "filllabel", "fillplaceholder", "submitform", "retryform", "runwizard", "selectchain", "picktypeahead", "pickdate", "attachfile", "fillcard", "fillcode", "consentpassword", "exportcsv", "exportjson", "exportexcel", "copytable", "pushsheets", "streamdisk", "paginateextract", "resumeextract", "batchdownload", "pausedownload", "resumedownload", "interceptmime", "readclipboard", "writeclipboard", "copyscreen", "quarantinedownload", "scanvirus", "cleanupartifacts", "recordscreen", "captureaudio", "downloadimages", "callrest", "callgraphql", "sendmessage", "blockrequest", "mockresponse", "rewriteheaders", "setcookies", "clearcookies", "authflow", "saveapikey", "routeproxy", "postform", "postfiles", "attachcdp", "detachcdp", "cdpcmd", "overridescript", "heapshot", "profilecpu", "capturesourcemaps", "emulatedevice", "emulatenetwork", "emulatelocate", "setuseragent", "overridepermission", "restoresession", "exportsessions", "importsessions", "runworkflow", "visitrule", "urlrule", "menurule", "keyrule", "buttonrule", "cronrule", "intervalrule", "urllistrule", "webhookrule", "eventrule"]);
var interactionactions = /* @__PURE__ */ new Set(["focus", "scroll", "hover", "clickdeep", "rightclick", "doubleclick", "scrollpage", "scrollby", "scrollend", "scrolltop", "fullscreen", "zoomset", "movepointer", "clicktext", "clickaria", "clickname", "expanddetails", "pierceshadow", "retryaction", "capturebodies", "setbreakpoint", "stepcode", "watchexpr", "loop", "repeatuntil", "whileloop", "foreach", "parallel", "trycatch"]);
var readactions = /* @__PURE__ */ new Set(["observe", "inspect", "extract", "wait", "waitfor", "waittext", "readattribute", "readstyle", "readgeometry", "readvalue", "readtext", "readhtml", "countelements", "readtable", "readlinks", "readimages", "readmeta", "readforms", "readstorage", "highlight", "tablist", "windowlist", "tabsnapshot", "mapclicks", "verifyvisible", "verifyenabled", "resolvexpath", "a11ytree", "readvisible", "readertree", "detectlists", "detecttables", "readjson", "watchmutate", "waitquiet", "watchbanner", "detectinfinitescroll", "detectvirtual", "detectlazy", "readscrollpos", "readlang", "readoutline", "countpages", "listshadow", "listframes", "classifypage", "fingerprintsection", "diffsnapshots", "readselection", "watchfocus", "detectsticky", "detectscrolllock", "readopengraph", "detectlanguage", "deriveselector", "waitload", "waiturl", "spawait", "detecthttp", "readredirects", "readfinalurl", "trailaudit", "navintent", "checksafe", "querytabs", "watchtab", "findclones", "searchtabs", "listaudio", "snapshotsession", "savelayout", "attachmeta", "detectfields", "generatevalues", "saveprofiles", "asksubmit", "readerrors", "skiphoneypot", "detectlogin", "detecttemplate", "handoffcaptcha", "scrapetable", "importcsv", "looprows", "transformvalues", "deduperows", "mergepages", "stamplerows", "previewgrid", "logprovenance", "verifydownload", "exportnetlog", "namecaptures", "shotview", "shotfullpage", "shotelement", "shotregion", "contactsheet", "capturepdf", "captureframe", "readmedia", "readassets", "probestream", "timelapse", "shotcanvas", "convertimage", "makethumbs", "fetchurl", "parsejson", "parsehtml", "opensocket", "waitmessage", "watchrequests", "readheaders", "mapapi", "subscribesse", "longpoll", "extractapi", "readcookies", "watchconsole", "watcherrors", "watchtasks", "watchcdp", "measureflow", "trackmemory", "watchshifts", "traceload", "annotatetrace", "replaytrace", "blackboxscripts", "persiststate", "capturesession", "namedsessions", "diffsessions", "searchsessions", "composeworkflow", "savetemplate", "dryrun", "delay", "waitelement", "compute", "extractvars", "listruns", "condition", "branch"]);
var allowedactions = /* @__PURE__ */ new Set([...sensitiveactions, ...interactionactions, ...readactions]);
var watchactions = /* @__PURE__ */ new Set(["watchmutate", "watchbanner", "watchfocus", "watchtab"]);
var targetactions = /* @__PURE__ */ new Set(["inspect", "focus", "click", "type", "scroll", "select", "hover", "clickdeep", "rightclick", "doubleclick", "drag", "drop", "upload", "clear", "check", "uncheck", "toggle", "submit", "readattribute", "readstyle", "readgeometry", "readvalue", "readtext", "readhtml", "countelements", "readtable", "highlight", "setattribute", "removeattribute", "waitfor", "shiftclick", "typetime", "appendtext", "setvalue", "typeedit", "submitsearch", "selectmulti", "chooseradio", "setslider", "setdate", "setcolor", "expanddetails", "verifyvisible", "verifyenabled", "pierceshadow", "deriveselector", "fingerprintsection", "submitform", "retryform", "selectchain", "picktypeahead", "pickdate", "attachfile", "fillcode", "consentpassword", "scrapetable", "paginateextract", "shotelement", "captureframe", "shotcanvas"]);
var valueactions = /* @__PURE__ */ new Set(["presskey", "drag", "drop", "upload", "readattribute", "removeattribute", "waittext", "evaluate", "zoomset", "tabactivate", "tabclose", "tabreload", "windowclose", "windowresize", "tabcreate", "windowcreate", "downloadfile", "typetime", "appendtext", "setvalue", "typeedit", "keyhold", "keyrelease", "chooseradio", "setslider", "setdate", "setcolor", "followlink", "setfragment", "handleauth", "navintent", "openclipboard", "checksafe", "reopentab", "spanav", "duplicatetab", "pintab", "mutetab", "movetab", "movetabwindow", "searchtabs", "badgetab", "attachmeta", "focuswindow", "maximizewindow", "minimizewindow", "restorewindow", "incognitowindow", "asksubmit", "selectchain", "picktypeahead", "pickdate", "attachfile", "fillcode", "consentpassword", "pausedownload", "resumedownload", "verifydownload", "writeclipboard", "quarantinedownload", "scanvirus"]);
var tabscommandactions = /* @__PURE__ */ new Set(["querytabs", "duplicatetab", "closepattern", "pintab", "mutetab", "movetab", "movetabwindow", "grouptabs", "colorgroup", "collapsegroup", "discardtab", "reloadtabs", "zoomin", "zoomout", "watchtab", "switchtab", "maximizewindow", "minimizewindow", "restorewindow", "focuswindow", "scratchwindow", "incognitowindow", "restoretab", "savelayout", "restorelayout", "findclones", "searchtabs", "badgetab", "attachmeta", "listaudio", "reopenrun", "snapshotsession"]);
var formactions = /* @__PURE__ */ new Set(["fillform", "filllabel", "fillplaceholder", "detectfields", "generatevalues", "saveprofiles", "asksubmit", "submitform", "readerrors", "retryform", "runwizard", "selectchain", "picktypeahead", "pickdate", "attachfile", "handoffcaptcha", "fillcard", "fillcode", "consentpassword", "skiphoneypot", "detectlogin", "detecttemplate"]);
var datasetactions = /* @__PURE__ */ new Set(["scrapetable", "exportcsv", "exportjson", "exportexcel", "copytable", "pushsheets", "importcsv", "looprows", "transformvalues", "deduperows", "paginateextract", "mergepages", "stamplerows", "previewgrid", "streamdisk", "resumeextract", "logprovenance"]);
var exportactions = /* @__PURE__ */ new Set(["exportcsv", "exportjson", "exportexcel", "copytable", "pushsheets", "streamdisk"]);
var filesactions = /* @__PURE__ */ new Set(["batchdownload", "pausedownload", "resumedownload", "verifydownload", "interceptmime", "exportnetlog", "readclipboard", "writeclipboard", "copyscreen", "quarantinedownload", "scanvirus", "namecaptures", "cleanupartifacts"]);
var captureactions = /* @__PURE__ */ new Set(["shotview", "shotfullpage", "shotelement", "shotregion", "contactsheet"]);
var mediaactions = /* @__PURE__ */ new Set(["capturepdf", "recordscreen", "captureaudio", "captureframe", "downloadimages", "shotcanvas", "probestream", "readmedia", "readassets", "timelapse", "convertimage", "makethumbs"]);
var httpactions = /* @__PURE__ */ new Set(["fetchurl", "parsejson", "parsehtml", "callrest", "callgraphql"]);
var socketactions = /* @__PURE__ */ new Set(["opensocket", "sendmessage", "waitmessage", "subscribesse", "longpoll"]);
var netwatchactions = /* @__PURE__ */ new Set(["watchrequests", "readheaders", "capturebodies", "mapapi", "extractapi"]);
var controlactions = /* @__PURE__ */ new Set(["blockrequest", "mockresponse", "rewriteheaders", "setcookies", "readcookies", "clearcookies", "authflow", "saveapikey", "routeproxy", "postform", "postfiles"]);
var debugactions = /* @__PURE__ */ new Set(["watchconsole", "watcherrors", "watchtasks"]);
var cdpactions = /* @__PURE__ */ new Set(["attachcdp", "detachcdp", "cdpcmd", "watchcdp", "setbreakpoint", "stepcode", "watchexpr", "overridescript"]);
var profileractions = /* @__PURE__ */ new Set(["measureflow", "heapshot", "trackmemory", "profilecpu", "watchshifts", "traceload", "annotatetrace", "replaytrace", "capturesourcemaps"]);
var emulationactions = /* @__PURE__ */ new Set(["emulatedevice", "emulatenetwork", "emulatelocate", "setuseragent", "overridepermission", "blackboxscripts"]);
var sessionactions = /* @__PURE__ */ new Set(["persiststate", "capturesession", "restoresession", "namedsessions", "diffsessions", "searchsessions", "exportsessions", "importsessions"]);
var workflowactions = /* @__PURE__ */ new Set(["composeworkflow", "savetemplate", "runworkflow", "dryrun", "delay", "waitelement", "compute", "extractvars", "condition", "branch", "loop", "repeatuntil", "whileloop", "foreach", "parallel", "trycatch"]);
var triggeractions = /* @__PURE__ */ new Set(["visitrule", "urlrule", "menurule", "keyrule", "buttonrule", "cronrule", "intervalrule", "urllistrule", "webhookrule", "eventrule"]);
var credentialheaders = /* @__PURE__ */ new Set(["authorization", "proxy-authorization", "cookie", "cookie2", "set-cookie", "api-key", "x-api-key", "x-auth-token", "x-session-token", "proxy-authorization"]);
var fieldkinds = ["text", "email", "phone", "date", "number", "select", "check", "radio", "file", "password", "card", "code"];
var layoutmutationactions = /* @__PURE__ */ new Set(["grouptabs", "colorgroup", "collapsegroup", "savelayout", "restorelayout"]);
var groupcolors = ["grey", "blue", "red", "yellow", "green", "pink", "purple", "cyan", "orange"];
function normalizeendpoint(value) {
  const endpoint = new URL(value.trim());
  if (endpoint.protocol !== "https:") throw new Error("Devthink accepts HTTPS endpoints only.");
  if (endpoint.username || endpoint.password) throw new Error("Endpoint credentials are not allowed in the URL.");
  return { endpoint: endpoint.toString(), origin: endpoint.origin, configuredat: Date.now() };
}
function hostpattern(origin) {
  const parsed = new URL(origin);
  if (parsed.protocol !== "https:") throw new Error("Only HTTPS origins can be granted.");
  return `${parsed.origin}/*`;
}
function issessionkind(kind) {
  return sessionactions.has(kind);
}
function isworkflowkind(kind) {
  return workflowactions.has(kind);
}
function istriggeraction(kind) {
  return triggeractions.has(kind);
}
function iswatchkind(kind) {
  return watchactions.has(kind);
}
function isdebugkind(kind) {
  return debugactions.has(kind);
}
function iscdpkind(kind) {
  return cdpactions.has(kind);
}
function isprofilekind(kind) {
  return profileractions.has(kind);
}
function isemulationkind(kind) {
  return emulationactions.has(kind);
}
function observationmodeof(kind) {
  if (watchactions.has(kind) || debugactions.has(kind) || profileractions.has(kind) && kind !== "heapshot" && kind !== "replaytrace" && kind !== "annotatetrace" && kind !== "capturesourcemaps" && kind !== "profilecpu" || cdpactions.has(kind) && kind === "watchcdp" || kind === "waitquiet") return "watching";
  if (kind === "diffsnapshots") return "diffing";
  return "passive";
}
function actionrisk(kind) {
  if (!allowedactions.has(kind)) throw new Error("Unsupported browser action.");
  if (sensitiveactions.has(kind)) return "sensitive";
  return interactionactions.has(kind) ? "interaction" : "read";
}
function needstarget(kind) {
  return targetactions.has(kind);
}
function parseoptions(step) {
  if (step.options === void 0) return {};
  let parsed;
  try {
    parsed = JSON.parse(step.options);
  } catch {
    throw new Error("Step options must be a JSON object.");
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Step options must be a JSON object.");
  return parsed;
}
function requiredcapability(kind) {
  if (kind === "tablist") return "tabs";
  if (kind === "downloadfile") return "downloads";
  if (kind === "openclipboard") return "clipboardRead";
  if (kind === "copytable") return "clipboardWrite";
  if (kind === "batchdownload" || kind === "pausedownload" || kind === "resumedownload" || kind === "verifydownload" || kind === "interceptmime" || kind === "quarantinedownload" || kind === "scanvirus") return "downloads";
  if (kind === "readclipboard") return "clipboardRead";
  if (kind === "writeclipboard" || kind === "copyscreen") return "clipboardWrite";
  if (kind === "downloadimages") return "downloads";
  if (kind === "authflow") return "tabs";
  if (kind === "capturesession" || kind === "restoresession") return "tabs";
  if (kind === "exportsessions") return "downloads";
  if (kind === "openlink" || kind === "openprivate" || kind === "navlist" || kind === "batchopen" || kind === "reopentab" || kind === "deeplink") return "tabs";
  if (tabscommandactions.has(kind)) return "tabs";
  return void 0;
}
function istabscommandkind(kind) {
  return tabscommandactions.has(kind);
}
function islayoutkind(kind) {
  return layoutmutationactions.has(kind);
}
function isformkind(kind) {
  return formactions.has(kind);
}
function isdatasetkind(kind) {
  return datasetactions.has(kind);
}
function isexportkind(kind) {
  return exportactions.has(kind);
}
function isfileskind(kind) {
  return filesactions.has(kind);
}
function iscapturekind(kind) {
  return captureactions.has(kind);
}
function capturegate(session, tabid, origin, now) {
  if (!session || session.stoppedat) return { allowed: false, reason: "No active browser session exists for the capture." };
  if (session.expiresat <= now) return { allowed: false, reason: "The browser session has expired and cannot capture." };
  if (session.pausedat) return { allowed: false, reason: "The browser session is paused and cannot capture." };
  if (session.tabid !== tabid) return { allowed: false, reason: `The capture needs the active tab grant of session tab ${session.tabid} and refuses tab ${tabid}.` };
  if (!origingranted(session, origin)) return { allowed: false, reason: `The capture of ${origin} needs the session origin grants first.` };
  return { allowed: true };
}
function validatecaptureoptions(value) {
  if (value === void 0) return { allowed: true };
  if (!value || typeof value !== "object" || Array.isArray(value)) return { allowed: false, reason: "The reviewed capture options must be an object in options.capture." };
  const options = value;
  if (options.format !== void 0 && options.format !== "png" && options.format !== "jpeg" && options.format !== "webp") return { allowed: false, reason: "The reviewed capture format must be png, jpeg or webp." };
  if (options.quality !== void 0 && (typeof options.quality !== "number" || !Number.isFinite(options.quality) || options.quality < 0 || options.quality > 100)) return { allowed: false, reason: "The reviewed capture quality must stay between zero and one hundred; any value in that range is the user choice with no code cap." };
  if (options.pixelratio !== void 0 && (typeof options.pixelratio !== "number" || !Number.isFinite(options.pixelratio) || options.pixelratio < 1)) return { allowed: false, reason: "The reviewed pixel ratio starts at one and climbs to any user configured ceiling with no code ceiling." };
  if (options.annotate !== void 0 && typeof options.annotate !== "boolean") return { allowed: false, reason: "The reviewed capture annotation flag must be a boolean." };
  if (options.exporttarget !== void 0 && options.exporttarget !== "memory" && options.exporttarget !== "download" && options.exporttarget !== "clipboard") return { allowed: false, reason: "The reviewed capture export target must be memory, download or clipboard." };
  return { allowed: true };
}
function validateregionrect(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { allowed: false, reason: "A reviewed regionrect with x, y, width and height in css pixels is required in options." };
  const rect = value;
  for (const field of ["x", "y", "width", "height"]) {
    if (typeof rect[field] !== "number" || !Number.isFinite(rect[field])) return { allowed: false, reason: `The reviewed regionrect needs a numeric ${field} in css pixels.` };
  }
  if (rect.x < 0 || rect.y < 0) return { allowed: false, reason: "The reviewed regionrect refuses negative coordinates." };
  if (rect.width <= 0 || rect.height <= 0) return { allowed: false, reason: "The reviewed regionrect needs positive width and height values." };
  return { allowed: true };
}
function validatecapturenaming(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { allowed: false, reason: "A reviewed capturenaming rule with run, step, sequence and kind flags is required." };
  const rule = value;
  const segments = ["run", "step", "sequence", "kind"];
  for (const key of Object.keys(rule)) {
    if (!segments.includes(key)) return { allowed: false, reason: `The reviewed capturenaming rule refuses the unknown ${key} segment; only run, step, sequence and kind participate.` };
  }
  for (const segment of segments) {
    if (rule[segment] !== void 0 && typeof rule[segment] !== "boolean") return { allowed: false, reason: `The reviewed capturenaming ${segment} flag must be a boolean.` };
  }
  if (!segments.some((segment) => rule[segment] === true)) return { allowed: false, reason: "The reviewed capturenaming rule needs at least one enabled segment of run, step, sequence and kind." };
  return { allowed: true };
}
function captureexportgranted(target) {
  if (target === void 0 || target === "memory") return { allowed: true };
  if (target === "clipboard") return { allowed: true, reason: "The clipboard capture export runs behind the optional clipboardwrite capability, negotiated through the permissions api before the copy." };
  if (target === "download") return { allowed: true, reason: "The download capture export runs only through the reviewed download flow behind the optional downloads capability." };
  return { allowed: false, reason: "The capture export target must be memory, download or clipboard; no other disk route exists." };
}
function stitchbudgetallowed(tiles, settle, wait) {
  if (tiles <= 0) return { allowed: false, reason: "The stitch budget needs at least one tile." };
  if (settle < 0 || wait < 0) return { allowed: false, reason: "The reviewed settle and wait windows must be zero or positive milliseconds." };
  if (tiles * settle > wait) return { allowed: false, reason: `The stitching scroll budget of ${tiles} tiles at ${settle} milliseconds exceeds the reviewed wait window of ${wait} milliseconds; review a wider window or a smaller settle.` };
  return { allowed: true };
}
function beforeafterwrapallowed(kind) {
  return allowedactions.has(kind) && !captureactions.has(kind);
}
function captureretentionwindow(settings) {
  return settings?.captureretention;
}
function validatecapturegrammar(step, options) {
  const kind = step.kind;
  const optioncheck = validatecaptureoptions(options.capture);
  if (!optioncheck.allowed) return optioncheck;
  if (options.settle !== void 0 && (typeof options.settle !== "number" || !Number.isFinite(options.settle) || options.settle < 0)) return { allowed: false, reason: "The reviewed capture settle window must be zero or a positive number of milliseconds." };
  if (options.overlap !== void 0 && (typeof options.overlap !== "number" || !Number.isInteger(options.overlap) || options.overlap < 0)) return { allowed: false, reason: "The reviewed stitch overlap must be zero or a positive number of rows." };
  if (options.wait !== void 0 && (typeof options.wait !== "number" || !Number.isFinite(options.wait) || options.wait < 0)) return { allowed: false, reason: "The reviewed capture wait window must be zero or a positive number of milliseconds." };
  if (options.naming !== void 0) {
    const namingcheck = validatecapturenaming(options.naming);
    if (!namingcheck.allowed) return namingcheck;
  }
  if (kind === "shotregion") {
    const rectcheck = validateregionrect(options.regionrect);
    if (!rectcheck.allowed) return rectcheck;
    if (options.reviewed !== true) return { allowed: false, reason: "Every reviewed regionrect needs the explicit reviewed flag before shotregion runs." };
    if (options.container !== void 0 && !isnonempty(options.container)) return { allowed: false, reason: "The reviewed scrollable container selector must be a non-empty string." };
    if (options.steps !== void 0 && (typeof options.steps !== "number" || !Number.isInteger(options.steps) || options.steps < 1)) return { allowed: false, reason: "The reviewed container scroll steps must be a positive integer with no code ceiling." };
  }
  if (kind === "contactsheet") {
    const elements = options.elements;
    if (!Array.isArray(elements) || elements.length === 0 || !elements.every((item) => isnonempty(item))) return { allowed: false, reason: "A reviewed non-empty list of element selectors is required in options for the contact sheet; the cell count stays the user choice." };
    const layout = options.sheet;
    if (layout !== void 0) {
      if (!layout || typeof layout !== "object" || Array.isArray(layout)) return { allowed: false, reason: "The reviewed sheetlayout must be an object with cellsize, columns and label." };
      const sheet = layout;
      if (typeof sheet.cellsize !== "number" || !Number.isFinite(sheet.cellsize) || sheet.cellsize <= 0) return { allowed: false, reason: "The reviewed contact sheet cell size must be a positive number of pixels." };
      if (typeof sheet.columns !== "number" || !Number.isInteger(sheet.columns) || sheet.columns < 1) return { allowed: false, reason: "The reviewed contact sheet column count must be a positive integer with no code ceiling." };
      if (sheet.label !== void 0 && sheet.label !== "none" && sheet.label !== "index" && sheet.label !== "selector" && sheet.label !== "both") return { allowed: false, reason: "The reviewed contact sheet label style must be none, index, selector or both." };
    }
  }
  return { allowed: true };
}
function exportgranted(session, origin) {
  if (!origingranted(session, origin)) return { allowed: false, reason: `The export of extracted data from ${origin} needs the session origin grants before it leaves local memory.` };
  return { allowed: true };
}
function validatefieldmatch(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { allowed: false, reason: "A reviewed field match is required in options." };
  const match = value;
  if (match.mode !== "label" && match.mode !== "placeholder" && match.mode !== "arialabel" && match.mode !== "name") return { allowed: false, reason: "The reviewed field match mode must be label, placeholder, arialabel or name." };
  const key = match.mode === "label" ? "label" : match.mode === "placeholder" ? "placeholder" : match.mode === "arialabel" ? "arialabel" : "name";
  if (!isnonempty(match[key])) return { allowed: false, reason: `The reviewed ${match.mode} field match needs a non-empty ${key}.` };
  return { allowed: true };
}
function validateformrecord(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { allowed: false, reason: "A reviewed form record with entries is required in options." };
  const record = value;
  if (record.form !== void 0 && !isnonempty(record.form)) return { allowed: false, reason: "The reviewed form record form selector must be a non-empty string." };
  if (!Array.isArray(record.entries) || record.entries.length === 0) return { allowed: false, reason: "The reviewed form record needs a non-empty list of entries." };
  for (const item of record.entries) {
    if (!item || typeof item !== "object" || Array.isArray(item)) return { allowed: false, reason: "Every reviewed form record entry must be an object." };
    const entry = item;
    const matchcheck = validatefieldmatch(entry.match);
    if (!matchcheck.allowed) return matchcheck;
    if (typeof entry.kind !== "string" || !fieldkinds.includes(entry.kind)) return { allowed: false, reason: "Every reviewed form record entry needs a known field kind." };
    if (typeof entry.value !== "string") return { allowed: false, reason: "Every reviewed form record entry needs a string value." };
    if (entry.kind === "password") return { allowed: false, reason: "Password entries are refused inside form records; use consentpassword with a reviewed consent ref." };
  }
  return { allowed: true };
}
function validatevaluegen(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { allowed: false, reason: "A reviewed valuegen rule with a field kind is required in options." };
  const rule = value;
  if (typeof rule.kind !== "string" || !fieldkinds.includes(rule.kind)) return { allowed: false, reason: "The reviewed valuegen kind must be a known field kind." };
  if (rule.locale !== void 0 && !isnonempty(rule.locale)) return { allowed: false, reason: "The reviewed valuegen locale must be a non-empty string." };
  if (rule.seed !== void 0 && (typeof rule.seed !== "number" || !Number.isFinite(rule.seed))) return { allowed: false, reason: "The reviewed valuegen seed must be a finite number." };
  return { allowed: true };
}
function validatefieldpairs(options, mode) {
  const pairs = options.fields;
  if (!Array.isArray(pairs) || pairs.length === 0) return { allowed: false, reason: "A reviewed non-empty list of field pairs is required in options." };
  for (const item of pairs) {
    if (!item || typeof item !== "object" || Array.isArray(item)) return { allowed: false, reason: "Every reviewed field pair must be an object." };
    const pair = item;
    if (!isnonempty(pair[mode])) return { allowed: false, reason: `Every reviewed field pair needs a non-empty ${mode}.` };
    if (typeof pair.value !== "string" || !pair.value.trim()) return { allowed: false, reason: "Every reviewed field pair needs a non-empty value." };
  }
  return { allowed: true };
}
function validatecardsegments(value) {
  if (!Array.isArray(value) || value.length === 0) return { allowed: false, reason: "A reviewed non-empty list of card segments is required in options." };
  for (const item of value) {
    if (!item || typeof item !== "object" || Array.isArray(item)) return { allowed: false, reason: "Every reviewed card segment must be an object." };
    const segment = item;
    const matchcheck = validatefieldmatch(segment.match);
    if (!matchcheck.allowed) return matchcheck;
    if (typeof segment.value !== "string" || !segment.value.trim()) return { allowed: false, reason: "Every reviewed card segment needs a non-empty value." };
  }
  return { allowed: true };
}
function validateformgrammar(step, options) {
  const kind = step.kind;
  if (kind === "fillform" || kind === "saveprofiles" && options.formrecord !== void 0) {
    const recordcheck = validateformrecord(options.formrecord);
    if (!recordcheck.allowed) return recordcheck;
  }
  if (kind === "filllabel" || kind === "fillplaceholder") {
    const paircheck = validatefieldpairs(options, kind === "filllabel" ? "label" : "placeholder");
    if (!paircheck.allowed) return paircheck;
  }
  if (kind === "generatevalues" && options.valuegen !== void 0) {
    const rulecheck = validatevaluegen(options.valuegen);
    if (!rulecheck.allowed) return rulecheck;
  }
  if (kind === "saveprofiles" && !isnonempty(options.name)) return { allowed: false, reason: "A reviewed profile name is required in options." };
  if (kind === "submitform" && !isnonempty(options.consentref)) return { allowed: false, reason: "A reviewed consent ref of an approved asksubmit ticket is required in options." };
  if (kind === "retryform") {
    const backoff = options.backoff;
    if (!backoff || typeof backoff !== "object" || Array.isArray(backoff)) return { allowed: false, reason: "A reviewed backoff rule with wait and factor is required in options." };
    const rule = backoff;
    if (typeof rule.wait !== "number" || !Number.isFinite(rule.wait) || rule.wait <= 0) return { allowed: false, reason: "The reviewed retry backoff wait must be a positive number of milliseconds with no code ceiling." };
    if (typeof rule.factor !== "number" || !Number.isFinite(rule.factor) || rule.factor < 1) return { allowed: false, reason: "The reviewed retry backoff factor must be one or greater with no code ceiling." };
    if (options.attempts !== void 0 && (typeof options.attempts !== "number" || !Number.isInteger(options.attempts) || options.attempts < 1)) return { allowed: false, reason: "The reviewed retry attempts must be a positive integer with no code ceiling." };
  }
  if (kind === "runwizard" && options.steps !== void 0 && (typeof options.steps !== "number" || !Number.isInteger(options.steps) || options.steps < 1)) return { allowed: false, reason: "The reviewed wizard step count must be a positive integer with no code ceiling." };
  if (kind === "selectchain") {
    if (!isnonempty(options.child)) return { allowed: false, reason: "A reviewed child selector of the dependent control is required in options." };
    if (!nonnegativeoption(options, "wait")) return { allowed: false, reason: "The reviewed dependent wait must be zero or a positive number of milliseconds." };
  }
  if (kind === "picktypeahead") {
    if (!isnonempty(options.pick)) return { allowed: false, reason: "A reviewed suggestion entry to pick is required in options." };
    if (!nonnegativeoption(options, "timeout")) return { allowed: false, reason: "The reviewed typeahead timeout must be zero or a positive number of milliseconds." };
  }
  if (kind === "pickdate" && !/^\d{4}-\d{2}-\d{2}$/.test(step.value ?? "")) return { allowed: false, reason: "The reviewed date must use the yyyy-mm-dd form." };
  if (kind === "fillcard") {
    const segmentcheck = validatecardsegments(options.segments);
    if (!segmentcheck.allowed) return segmentcheck;
    if (!nonnegativeoption(options, "pause")) return { allowed: false, reason: "The reviewed card typing pause must be zero or a positive number of milliseconds." };
  }
  if (kind === "fillcode" && !isnonempty(options.source)) return { allowed: false, reason: "A reviewed one time code source is required in options." };
  if (kind === "consentpassword" && !isnonempty(options.consentref)) return { allowed: false, reason: "A reviewed consent ref is required in options before any password is filled." };
  return { allowed: true };
}
function validatetransformrule(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { allowed: false, reason: "A reviewed transform rule with an expression, sources and a target is required in options." };
  const rule = value;
  const expression = rule.expression;
  if (typeof expression !== "string" || !/^(trim|upper|lower|number|prefix|suffix|replace)(?::.+)?$/.test(expression)) return { allowed: false, reason: "The reviewed transform expression must be trim, upper, lower, number, prefix, suffix or replace with an optional argument." };
  if (expression.startsWith("replace") && !expression.slice("replace".length).includes("=>")) return { allowed: false, reason: "The reviewed replace expression needs the from=>to separator." };
  if (expression.startsWith("replace") && expression.slice("replace:".length).split("=>")[0] === "") return { allowed: false, reason: "The reviewed replace expression needs a non-empty from part." };
  if (!Array.isArray(rule.sources) || rule.sources.length === 0 || !rule.sources.every((source) => isnonempty(source))) return { allowed: false, reason: "Every reviewed transform rule needs a non-empty list of source columns." };
  if (!isnonempty(rule.target)) return { allowed: false, reason: "Every reviewed transform rule needs a non-empty target column." };
  return { allowed: true };
}
function validatedatasetids(options, key) {
  const ids = options[key];
  if (!Array.isArray(ids) || ids.length === 0 || !ids.every((id) => isnonempty(id))) return { allowed: false, reason: `A reviewed non-empty list of dataset ids is required in options as ${key}.` };
  return { allowed: true };
}
function validatedatagrammar(step, options, origin) {
  const kind = step.kind;
  if (kind === "scrapetable") {
    if (options.name !== void 0 && !isnonempty(options.name)) return { allowed: false, reason: "The reviewed dataset name must be a non-empty string." };
    if (options.rowlimit !== void 0 && (typeof options.rowlimit !== "number" || !Number.isInteger(options.rowlimit) || options.rowlimit < 1)) return { allowed: false, reason: "The reviewed row limit must be a positive integer with no code ceiling." };
  }
  if (kind === "paginateextract") {
    if (!isnonempty(options.next)) return { allowed: false, reason: "A reviewed next control selector is required in options." };
    if (options.pages !== void 0 && (typeof options.pages !== "number" || !Number.isInteger(options.pages) || options.pages < 1)) return { allowed: false, reason: "The reviewed page count must be a positive integer with no code ceiling." };
    if (!nonnegativeoption(options, "wait")) return { allowed: false, reason: "The reviewed row freshness wait must be zero or a positive number of milliseconds." };
  }
  if (kind === "exportcsv" || kind === "exportjson" || kind === "exportexcel" || kind === "copytable" || kind === "streamdisk") {
    if (!isnonempty(options.dataset)) return { allowed: false, reason: "A reviewed dataset id is required in options." };
    if (options.name !== void 0 && !isnonempty(options.name)) return { allowed: false, reason: "The reviewed artifact name must be a non-empty string." };
  }
  if (kind === "exportcsv" && options.delimiter !== void 0 && (typeof options.delimiter !== "string" || options.delimiter.length !== 1)) return { allowed: false, reason: "The reviewed csv delimiter must be a single character." };
  if (kind === "streamdisk" && (typeof options.chunk !== "number" || !Number.isInteger(options.chunk) || options.chunk < 1)) return { allowed: false, reason: "The reviewed streaming chunk size must be a positive integer with no code ceiling." };
  if (kind === "pushsheets") {
    if (!isnonempty(options.dataset)) return { allowed: false, reason: "A reviewed dataset id is required in options." };
    if (!isnonempty(options.sheet)) return { allowed: false, reason: "A reviewed sheet endpoint url is required in options." };
    if (!ishttpsurl(options.sheet)) return { allowed: false, reason: "The reviewed sheet endpoint url must use HTTPS." };
    if (options.reviewed !== true) return { allowed: false, reason: "The sheet push needs the explicit reviewed flag before any data leaves local memory." };
  }
  if (kind === "importcsv") {
    if (typeof options.csv !== "string" || !options.csv.trim()) return { allowed: false, reason: "Reviewed csv content is required in options." };
    if (options.name !== void 0 && !isnonempty(options.name)) return { allowed: false, reason: "The reviewed dataset name must be a non-empty string." };
    if (options.mapping !== void 0) {
      const mapping = options.mapping;
      if (!mapping || typeof mapping !== "object" || Array.isArray(mapping) || !Object.values(mapping).every((item) => typeof item === "string")) return { allowed: false, reason: "The reviewed csv column mapping must be an object of string values." };
    }
  }
  if (kind === "looprows") {
    if (!isnonempty(options.dataset)) return { allowed: false, reason: "A reviewed dataset id is required in options." };
    if (options.variable !== void 0 && !isnonempty(options.variable)) return { allowed: false, reason: "The reviewed row variable name must be a non-empty string." };
    const inner = validateinnerstep(options, origin);
    if (!inner.allowed) return inner;
  }
  if (kind === "transformvalues") {
    if (!isnonempty(options.dataset)) return { allowed: false, reason: "A reviewed dataset id is required in options." };
    const rules = options.rules;
    if (!Array.isArray(rules) || rules.length === 0) return { allowed: false, reason: "A reviewed non-empty list of transform rules is required in options." };
    for (const item of rules) {
      const rulecheck = validatetransformrule(item);
      if (!rulecheck.allowed) return rulecheck;
    }
  }
  if (kind === "deduperows") {
    if (!isnonempty(options.dataset)) return { allowed: false, reason: "A reviewed dataset id is required in options." };
    const keys = options.keys;
    if (!Array.isArray(keys) || keys.length === 0 || !keys.every((key) => isnonempty(key))) return { allowed: false, reason: "A reviewed non-empty list of dedupe column keys is required in options." };
  }
  if (kind === "mergepages") {
    const listcheck = validatedatasetids(options, "datasets");
    if (!listcheck.allowed) return listcheck;
  }
  if (kind === "stamplerows") {
    if (!isnonempty(options.dataset)) return { allowed: false, reason: "A reviewed dataset id is required in options." };
    if (options.url !== void 0 && !ishttpsurl(options.url)) return { allowed: false, reason: "The reviewed source url must use HTTPS." };
  }
  if (kind === "previewgrid") {
    if (!isnonempty(options.dataset)) return { allowed: false, reason: "A reviewed dataset id is required in options." };
    if (options.sample !== void 0 && (typeof options.sample !== "number" || !Number.isInteger(options.sample) || options.sample < 1)) return { allowed: false, reason: "The reviewed sample row count must be a positive integer with no code ceiling." };
  }
  if (kind === "resumeextract" && !isnonempty(options.session)) return { allowed: false, reason: "A reviewed extract session id is required in options." };
  if (kind === "logprovenance" && !isnonempty(options.artifact)) return { allowed: false, reason: "A reviewed artifact id or name is required in options." };
  return { allowed: true };
}
function validatedownloadspec(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { allowed: false, reason: "A reviewed downloadspec with a url list is required in options." };
  const spec = value;
  if (!Array.isArray(spec.urls) || spec.urls.length === 0 || !spec.urls.every((url) => ishttpsurl(url))) return { allowed: false, reason: "The reviewed downloadspec needs a non-empty list of HTTPS urls." };
  if (spec.filename !== void 0 && !isnonempty(spec.filename)) return { allowed: false, reason: "The reviewed downloadspec filename rule must be a non-empty string." };
  if (spec.complete !== void 0 && spec.complete !== "size" && spec.complete !== "checksum") return { allowed: false, reason: "The reviewed downloadspec completion criterion must be size or checksum." };
  return { allowed: true };
}
function validatemimefilter(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { allowed: false, reason: "A reviewed mimefilter with include and exclude patterns is required in options." };
  const filter = value;
  if (!Array.isArray(filter.include) || filter.include.length === 0 || !filter.include.every((pattern) => isnonempty(pattern))) return { allowed: false, reason: "The reviewed mimefilter needs a non-empty list of include patterns." };
  if (filter.exclude !== void 0 && (!Array.isArray(filter.exclude) || !filter.exclude.every((pattern) => isnonempty(pattern)))) return { allowed: false, reason: "The reviewed mimefilter exclude patterns must be a list of non-empty strings." };
  if (filter.default !== "deny" && filter.default !== "allow") return { allowed: false, reason: "The reviewed mimefilter needs the deny or allow default for unlisted mime types." };
  return { allowed: true };
}
function validatecleanuprule(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { allowed: false, reason: "A reviewed cleanuprule with an age, a kind and a keep policy is required." };
  const rule = value;
  if (typeof rule.age !== "number" || !Number.isFinite(rule.age) || rule.age <= 0) return { allowed: false, reason: "The reviewed cleanup age window must be a positive number of milliseconds with no code ceiling." };
  if (!isnonempty(rule.kind)) return { allowed: false, reason: "The reviewed cleanup rule needs a non-empty artifact kind, or any to match every kind." };
  if (rule.keep !== "none" && rule.keep !== "latest" && rule.keep !== "all") return { allowed: false, reason: "The reviewed cleanup keep policy must be none, latest or all." };
  return { allowed: true };
}
function validatefilesgrammar(step, options) {
  const kind = step.kind;
  if (kind === "batchdownload") {
    const speccheck = validatedownloadspec(options.downloadspec);
    if (!speccheck.allowed) return speccheck;
    if (options.concurrent !== void 0 && (typeof options.concurrent !== "number" || !Number.isInteger(options.concurrent) || options.concurrent < 1)) return { allowed: false, reason: "The reviewed concurrent download window must be a positive integer with no code ceiling." };
  }
  if (kind === "pausedownload" || kind === "resumedownload" || kind === "verifydownload" || kind === "quarantinedownload" || kind === "scanvirus") {
    if (!isnonempty(step.value)) return { allowed: false, reason: "A reviewed download or quarantine reference is required." };
    if (kind === "verifydownload") {
      if (options.checksum !== void 0 && !isnonempty(options.checksum)) return { allowed: false, reason: "The reviewed expected checksum must be a non-empty string." };
      if (options.bytes !== void 0 && (typeof options.bytes !== "number" || !Number.isFinite(options.bytes) || options.bytes < 0)) return { allowed: false, reason: "The reviewed expected size must be zero or a positive number of bytes." };
    }
    if (kind === "scanvirus" && options.scanner !== void 0 && !isnonempty(options.scanner)) return { allowed: false, reason: "The reviewed scanner name must be a non-empty string." };
    if (kind === "quarantinedownload" && options.reason !== void 0 && !isnonempty(options.reason)) return { allowed: false, reason: "The reviewed quarantine reason must be a non-empty string." };
  }
  if (kind === "interceptmime") {
    const filtercheck = validatemimefilter(options.mimefilter);
    if (!filtercheck.allowed) return filtercheck;
  }
  if (kind === "readclipboard") {
    if (!isnonempty(options.consentref)) return { allowed: false, reason: "A clipboard read requires a reviewed consent ref of an approved consent prompt in options." };
    if (options.prompt !== void 0 && !isnonempty(options.prompt)) return { allowed: false, reason: "The reviewed clipboard consent prompt must be a non-empty string." };
  }
  if (kind === "exportnetlog" && options.stepid !== void 0 && !isnonempty(options.stepid)) return { allowed: false, reason: "The reviewed netlog step filter must be a non-empty step id." };
  if (kind === "namecaptures") {
    if (!isnonempty(options.task)) return { allowed: false, reason: "A reviewed task id is required in options for capture naming." };
    if (options.steps !== void 0 && (!Array.isArray(options.steps) || options.steps.length === 0 || !options.steps.every((item) => isnonempty(item)))) return { allowed: false, reason: "The reviewed capture steps must be a non-empty list of step ids when present." };
    if (options.extension !== void 0 && !isnonempty(options.extension)) return { allowed: false, reason: "The reviewed capture extension must be a non-empty string." };
  }
  if (kind === "cleanupartifacts" && options.rules !== void 0) {
    const rules = options.rules;
    if (!Array.isArray(rules) || rules.length === 0) return { allowed: false, reason: "The reviewed cleanup rules must be a non-empty list when present." };
    for (const item of rules) {
      const rulecheck = validatecleanuprule(item);
      if (!rulecheck.allowed) return rulecheck;
    }
  }
  return { allowed: true };
}
function clipboardconsentgranted(step) {
  let options = {};
  try {
    options = parseoptions(step);
  } catch {
    options = {};
  }
  const consentref = options.consentref;
  if (typeof consentref !== "string" || !consentref.trim()) return { allowed: false, reason: "A clipboard read requires a reviewed consent ref in options." };
  return { allowed: true };
}
function quarantinereleasegranted(entry) {
  if (entry.scan !== "clean") return { allowed: false, reason: `The quarantined file ${entry.path} cannot leave quarantine with the ${entry.scan} scan verdict; only a clean verdict releases it.` };
  return { allowed: true };
}
function downloadgranted(session, url) {
  let origin = "";
  try {
    origin = new URL(url).origin;
  } catch {
    return { allowed: false, reason: "The reviewed download URL is invalid." };
  }
  if (!origingranted(session, origin)) return { allowed: false, reason: `The download from ${origin} leaves the session origin grants and needs a session grant first.` };
  return { allowed: true };
}
function maskclipboard(payload) {
  return `[clipboard payload of ${payload.length} character${payload.length === 1 ? "" : "s"}]`;
}
function submitreviewgranted(steps, submitid) {
  const position = steps.findIndex((candidate) => candidate.id === submitid);
  const asked = steps.some((candidate, index) => candidate.kind === "asksubmit" && (position === -1 || index < position));
  return asked ? { allowed: true } : { allowed: false, reason: "Form submission requires an asksubmit review step before it." };
}
function passwordconsentgranted(step) {
  let options = {};
  try {
    options = parseoptions(step);
  } catch {
    options = {};
  }
  const consentref = options.consentref;
  if (typeof consentref !== "string" || !consentref.trim()) return { allowed: false, reason: "A password fill requires a reviewed consent ref in options." };
  return { allowed: true };
}
function luhnvalid(digits) {
  let sum = 0;
  let double = false;
  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let value = Number.parseInt(digits[index] ?? "", 10);
    if (!Number.isFinite(value)) return false;
    if (double) {
      value *= 2;
      if (value > 9) value -= 9;
    }
    sum += value;
    double = !double;
  }
  return sum % 10 === 0;
}
function generatedvalueallowed(value) {
  const compact = value.replace(/[\s-]/g, "");
  if (/^\d{13,19}$/.test(compact) && luhnvalid(compact) && !compact.startsWith("4111")) return { allowed: false, reason: "The generated value looks like a real card number and is refused; generated card values use the 4111 test prefix." };
  if (/^\d{3}-\d{2}-\d{4}$/.test(value.trim())) return { allowed: false, reason: "The generated value looks like a personal identifier and is refused." };
  return { allowed: true };
}
function profilegrantgranted(profile, origin) {
  if (!profile.grants.includes(origin)) return { allowed: false, reason: `The saved profile ${profile.name} is not granted to ${origin}; add the origin to the profile grants first.` };
  return { allowed: true };
}
function layoutmutationgranted(session, now) {
  if (!session || session.stoppedat || session.expiresat <= now) return { allowed: false, reason: "Group and layout mutations stay inside the active session." };
  return { allowed: true };
}
function windowclosegate(tasktabcount, reviewed) {
  if (tasktabcount > 1 && !reviewed) return { allowed: false, reason: `The window holds ${tasktabcount} task tabs and needs explicit review before it closes.` };
  return { allowed: true };
}
function tasktabceiling(settings) {
  const ceiling = settings?.tasktabceiling;
  return typeof ceiling === "number" && Number.isFinite(ceiling) && ceiling >= 0 ? ceiling : void 0;
}
function waitduration(step) {
  const requested = step.value ? Number.parseInt(step.value, 10) : 250;
  if (!Number.isFinite(requested) || requested < 0) throw new Error("Wait duration must be zero or a positive number of milliseconds.");
  return requested;
}
function isnumericid(value) {
  return typeof value === "string" && /^\d+$/.test(value);
}
function numericoption(options, key) {
  return options[key] === void 0 || typeof options[key] === "number" && Number.isFinite(options[key]);
}
function nonnegativeoption(options, key) {
  return numericoption(options, key) && !(typeof options[key] === "number" && options[key] < 0);
}
function isnonempty(value) {
  return typeof value === "string" && value.trim().length > 0;
}
function ispoint(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const point = value;
  return typeof point.x === "number" && Number.isFinite(point.x) && typeof point.y === "number" && Number.isFinite(point.y);
}
function resolutionverdict(count) {
  if (!Number.isFinite(count) || count <= 0) return "absent";
  return count === 1 ? "resolved" : "ambiguous";
}
function validatetargetref(reference) {
  if (!reference || typeof reference !== "object" || Array.isArray(reference)) return { allowed: false, reason: "The reviewed target reference must be an object." };
  const ref = reference;
  if (ref.mode === "selector") return isnonempty(ref.selector) ? { allowed: true } : { allowed: false, reason: "The selector target reference needs a non-empty selector." };
  if (ref.mode === "text") return isnonempty(ref.text) ? { allowed: true } : { allowed: false, reason: "The text target reference needs non-empty text." };
  if (ref.mode === "aria") {
    if (!isnonempty(ref.role)) return { allowed: false, reason: "The aria target reference needs a non-empty role." };
    return isnonempty(ref.name) ? { allowed: true } : { allowed: false, reason: "The aria target reference needs a non-empty name." };
  }
  if (ref.mode === "name") return isnonempty(ref.name) ? { allowed: true } : { allowed: false, reason: "The name target reference needs a non-empty name." };
  if (ref.mode === "xpath") return isnonempty(ref.xpath) ? { allowed: true } : { allowed: false, reason: "The xpath target reference needs a non-empty expression." };
  if (ref.mode === "index") {
    const index = ref.index;
    return typeof index === "number" && Number.isInteger(index) && index >= 1 ? { allowed: true } : { allowed: false, reason: "The index target reference needs a positive integer map number." };
  }
  if (ref.mode === "point") {
    const pointok = typeof ref.x === "number" && Number.isFinite(ref.x) && typeof ref.y === "number" && Number.isFinite(ref.y);
    return pointok ? { allowed: true } : { allowed: false, reason: "The point target reference needs numeric x and y coordinates." };
  }
  return { allowed: false, reason: "The target reference mode must be selector, text, aria, name, xpath, index or point." };
}
function origingranted(session, origin) {
  if (!session) return false;
  const grants = session.grants ?? [session.origin];
  return grants.includes(origin);
}
function originverified(url, grants, verdicts) {
  let origin = "";
  try {
    origin = new URL(url).origin;
  } catch {
    return { allowed: false, reason: "The reviewed navigation URL is invalid." };
  }
  if (grants.includes(origin)) return { allowed: true };
  const covered = verdicts.find((verdict) => verdict.safe && (verdict.url === url || safeorigin(verdict.url) === origin));
  if (covered) return { allowed: true };
  return { allowed: false, reason: `The origin ${origin} is outside the session grants and has no safe checksafe verdict; run checksafe and review it first.` };
}
function safeorigin(url) {
  try {
    return new URL(url).origin;
  } catch {
    return "";
  }
}
function navigationgranted(session, url) {
  let origin = "";
  try {
    origin = new URL(url).origin;
  } catch {
    return { allowed: false, reason: "The reviewed navigation URL is invalid." };
  }
  if (origingranted(session, origin)) return { allowed: true };
  return { allowed: false, reason: `Navigation to ${origin} leaves the task tab origins and needs the user consent of a session grant first.` };
}
function validateinnerstep(options, origin) {
  const stepid = options.stepid;
  const kind = options.kind;
  if (isnonempty(stepid)) {
    if (kind !== void 0) return { allowed: false, reason: "The reviewed wrapper must reference a step id or an inline step, not both." };
    return { allowed: true };
  }
  if (typeof kind !== "string" || !kind.trim()) return { allowed: false, reason: "A reviewed step id or inline step kind is required in options." };
  if (kind === "retryaction" || kind === "enterframe" || kind === "looprows") return { allowed: false, reason: "The reviewed inner step cannot be another wrapper kind." };
  if (!allowedactions.has(kind)) return { allowed: false, reason: "The reviewed inner step kind is unsupported." };
  const inneroptions = options.options;
  if (inneroptions !== void 0 && (!inneroptions || typeof inneroptions !== "object" || Array.isArray(inneroptions))) return { allowed: false, reason: "The reviewed inner step options must be an object." };
  const inner = {
    id: "inner",
    kind,
    summary: "Reviewed inner step.",
    risk: actionrisk(kind),
    ...isnonempty(options.target) ? { target: options.target } : {},
    ...isnonempty(options.value) ? { value: options.value } : {},
    ...inneroptions !== void 0 ? { options: JSON.stringify(inneroptions) } : {}
  };
  return validatestep(inner, origin);
}
function ishttpsurl(value) {
  if (typeof value !== "string" || !value.trim()) return false;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}
function validatenavtarget(value, kind) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { allowed: false, reason: "A reviewed navtarget with a url is required in options." };
  const target = value;
  if (!ishttpsurl(target.url)) return { allowed: false, reason: "The reviewed navtarget url must use HTTPS." };
  const container = target.container ?? "tab";
  if (container !== "current" && container !== "tab" && container !== "window" && container !== "private") return { allowed: false, reason: "The reviewed navtarget container must be current, tab, window or private." };
  if (target.position !== void 0 && target.position !== "adjacent" && target.position !== "end") return { allowed: false, reason: "The reviewed navtarget position must be adjacent or end." };
  if (kind === "openprivate" && container !== "private") return { allowed: false, reason: "The openprivate step requires the private container." };
  if (kind === "openlink" && container === "private") return { allowed: false, reason: "The openlink step cannot open the private container; use openprivate." };
  return { allowed: true };
}
function validatewaitprofile(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { allowed: false, reason: "A reviewed waitprofile with load signals is required in options." };
  const profile = value;
  if (!Array.isArray(profile.signals) || profile.signals.length === 0 || !profile.signals.every((signal) => isnonempty(signal))) return { allowed: false, reason: "The reviewed waitprofile needs a non-empty list of load signals." };
  if (!nonnegativeoption(profile, "idle")) return { allowed: false, reason: "The reviewed waitprofile idle threshold must be zero or a positive number of milliseconds." };
  if (!nonnegativeoption(profile, "timeout")) return { allowed: false, reason: "The reviewed waitprofile timeout must be zero or a positive number of milliseconds." };
  if (profile.overrides !== void 0) {
    if (!Array.isArray(profile.overrides) || profile.overrides.length === 0) return { allowed: false, reason: "The reviewed waitprofile overrides must be a non-empty list when present." };
    for (const entry of profile.overrides) {
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) return { allowed: false, reason: "Every reviewed waitprofile override must be an object with an origin." };
      const override = entry;
      if (!ishttpsurl(override.origin)) return { allowed: false, reason: "Every reviewed waitprofile override origin must use HTTPS." };
      if (override.signals !== void 0 && (!Array.isArray(override.signals) || !override.signals.every((signal) => isnonempty(signal)))) return { allowed: false, reason: "The reviewed waitprofile override signals must be a list of non-empty strings." };
      if (!nonnegativeoption(override, "idle") || !nonnegativeoption(override, "timeout")) return { allowed: false, reason: "The reviewed waitprofile override thresholds must be zero or positive numbers." };
    }
  }
  return { allowed: true };
}
function validateurlpattern(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { allowed: false, reason: "A reviewed urlpattern is required in options." };
  const pattern = value;
  if (pattern.mode !== "exact" && pattern.mode !== "prefix" && pattern.mode !== "host" && pattern.mode !== "pattern") return { allowed: false, reason: "The reviewed urlpattern mode must be exact, prefix, host or pattern." };
  if (!ishttpsurl(pattern.url)) return { allowed: false, reason: "The reviewed urlpattern url must use HTTPS." };
  if (pattern.query !== void 0) {
    if (!pattern.query || typeof pattern.query !== "object" || Array.isArray(pattern.query)) return { allowed: false, reason: "The reviewed urlpattern query part must be an object of parameter names and values." };
    for (const item of Object.values(pattern.query)) if (typeof item !== "string") return { allowed: false, reason: "The reviewed urlpattern query values must be strings." };
  }
  if (pattern.fragment !== void 0 && !isnonempty(pattern.fragment)) return { allowed: false, reason: "The reviewed urlpattern fragment must be a non-empty string." };
  return { allowed: true };
}
function validateurllist(options, key) {
  const urls = options[key];
  if (!Array.isArray(urls) || urls.length === 0 || !urls.every((url) => ishttpsurl(url))) return { allowed: false, reason: `A reviewed non-empty list of HTTPS urls is required in options as ${key}.` };
  return { allowed: true };
}
function validateratelimit(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { allowed: false, reason: "A reviewed ratelimit with a window and a ceiling is required in options." };
  const limit = value;
  if (limit.domain !== void 0 && !isnonempty(limit.domain)) return { allowed: false, reason: "The reviewed ratelimit domain must be a non-empty string." };
  if (typeof limit.window !== "number" || !Number.isFinite(limit.window) || limit.window <= 0) return { allowed: false, reason: "The reviewed ratelimit window must be a positive number of milliseconds with no code ceiling." };
  if (typeof limit.ceiling !== "number" || !Number.isInteger(limit.ceiling) || limit.ceiling < 1) return { allowed: false, reason: "The reviewed ratelimit ceiling must be a positive integer with no code ceiling." };
  return { allowed: true };
}
function validatetabquery(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { allowed: false, reason: "A reviewed tabquery with at least one matcher is required in options." };
  const query = value;
  const hasmatcher = query.url !== void 0 || query.title !== void 0 || query.id !== void 0 || query.pattern !== void 0;
  if (!hasmatcher) return { allowed: false, reason: "The reviewed tabquery needs a url, title, id or pattern matcher." };
  if (query.url !== void 0 && !isnonempty(query.url)) return { allowed: false, reason: "The reviewed tabquery url matcher must be a non-empty string." };
  if (query.title !== void 0 && !isnonempty(query.title)) return { allowed: false, reason: "The reviewed tabquery title matcher must be a non-empty string." };
  if (query.pattern !== void 0 && !isnonempty(query.pattern)) return { allowed: false, reason: "The reviewed tabquery pattern matcher must be a non-empty string." };
  if (query.id !== void 0 && (typeof query.id !== "number" || !Number.isInteger(query.id) || query.id < 0)) return { allowed: false, reason: "The reviewed tabquery id matcher must be a non-negative integer tab id." };
  return { allowed: true };
}
function validategroupcolor(value) {
  return typeof value === "string" && groupcolors.includes(value);
}
function validateidlist(options, key) {
  const ids = options[key];
  return Array.isArray(ids) && ids.length > 0 && ids.every((id) => typeof id === "number" && Number.isInteger(id) && id >= 0);
}
function validatetabsgrammar(step, options) {
  const kind = step.kind;
  if (kind === "querytabs" || kind === "closepattern") {
    const querycheck = validatetabquery(options.tabquery);
    if (!querycheck.allowed) return querycheck;
    if (kind === "closepattern" && options.reviewed !== true) return { allowed: false, reason: "The close pattern needs the explicit reviewed flag before any tab closes." };
  }
  if (kind === "duplicatetab" || kind === "pintab" || kind === "mutetab" || kind === "movetab" || kind === "movetabwindow" || kind === "badgetab" || kind === "attachmeta") {
    if (!isnumericid(step.value)) return { allowed: false, reason: "A numeric browser tab id is required." };
  }
  if (kind === "focuswindow" || kind === "maximizewindow" || kind === "minimizewindow" || kind === "restorewindow") {
    if (!isnumericid(step.value)) return { allowed: false, reason: "A numeric browser window id is required." };
  }
  if (kind === "pintab" && typeof options.pinned !== "boolean") return { allowed: false, reason: "A reviewed pinned flag is required in options." };
  if (kind === "mutetab" && typeof options.muted !== "boolean") return { allowed: false, reason: "A reviewed muted flag is required in options." };
  if (kind === "movetab") {
    if (typeof options.index !== "number" || !Number.isInteger(options.index) || options.index < 0) return { allowed: false, reason: "A reviewed non-negative target index is required in options." };
  }
  if (kind === "movetabwindow") {
    if (typeof options.windowid !== "number" || !Number.isInteger(options.windowid) || options.windowid < 0) return { allowed: false, reason: "A reviewed target window id is required in options." };
  }
  if (kind === "grouptabs") {
    const group = options.group;
    if (!group || typeof group !== "object" || Array.isArray(group)) return { allowed: false, reason: "A reviewed group with a name is required in options." };
    const spec = group;
    if (!isnonempty(spec.name)) return { allowed: false, reason: "The reviewed group needs a non-empty name." };
    if (!validategroupcolor(spec.color)) return { allowed: false, reason: "The reviewed group color must be a Chromium tab group color." };
    if (!validateidlist(spec, "tabids")) return { allowed: false, reason: "The reviewed group needs a non-empty list of member tab ids." };
  }
  if (kind === "colorgroup") {
    if (!isnonempty(options.name)) return { allowed: false, reason: "A reviewed group name is required in options." };
    if (!validategroupcolor(options.color)) return { allowed: false, reason: "The reviewed group color must be a Chromium tab group color." };
  }
  if (kind === "collapsegroup") {
    if (!isnonempty(options.name)) return { allowed: false, reason: "A reviewed group name is required in options." };
    if (typeof options.collapsed !== "boolean") return { allowed: false, reason: "A reviewed collapsed flag is required in options." };
  }
  if (kind === "discardtab" || kind === "reloadtabs") {
    if (!isnumericid(step.value) && !validateidlist(options, "tabs")) return { allowed: false, reason: "A numeric tab id or a reviewed list of tab ids is required." };
  }
  if (kind === "zoomin" || kind === "zoomout") {
    if (options.step !== void 0 && (typeof options.step !== "number" || !Number.isFinite(options.step) || options.step <= 0)) return { allowed: false, reason: "The reviewed zoom step must be a positive number with no code ceiling." };
    if (step.value !== void 0 && step.value !== "" && !isnumericid(step.value)) return { allowed: false, reason: "The reviewed zoom target must be a numeric tab id." };
  }
  if (kind === "switchtab") {
    if (options.direction !== "next" && options.direction !== "previous") return { allowed: false, reason: "A reviewed switch direction of next or previous is required in options." };
  }
  if (kind === "restorewindow") {
    const bounds = options.bounds;
    if (bounds !== void 0) {
      if (!bounds || typeof bounds !== "object" || Array.isArray(bounds)) return { allowed: false, reason: "The reviewed window bounds must be an object." };
      const shape = bounds;
      for (const field of ["left", "top", "width", "height"]) {
        if (typeof shape[field] !== "number" || !Number.isFinite(shape[field])) return { allowed: false, reason: "The reviewed window bounds need numeric left, top, width and height." };
      }
    }
  }
  if (kind === "scratchwindow") {
    if (step.value !== void 0 && step.value !== "" && !ishttpsurl(step.value)) return { allowed: false, reason: "The reviewed scratch window url must use HTTPS." };
  }
  if (kind === "incognitowindow" && !ishttpsurl(step.value)) return { allowed: false, reason: "A reviewed HTTPS url is required to open an incognito window." };
  if (kind === "restoretab" && step.value !== void 0 && step.value !== "" && !ishttpsurl(step.value)) return { allowed: false, reason: "The reviewed restore url must use HTTPS." };
  if (kind === "savelayout" || kind === "restorelayout") {
    if (!isnonempty(options.name)) return { allowed: false, reason: "A reviewed layout name is required in options." };
  }
  if (kind === "badgetab") {
    if (!isnonempty(options.label)) return { allowed: false, reason: "A reviewed badge label is required in options." };
    if (options.taskid !== void 0 && !isnonempty(options.taskid)) return { allowed: false, reason: "The reviewed badge task id must be a non-empty string." };
  }
  if (kind === "attachmeta") {
    const labels = options.labels;
    const taskrefs = options.taskrefs;
    const haslabels = Array.isArray(labels) && labels.length > 0 && labels.every((label) => isnonempty(label));
    const hastaskrefs = Array.isArray(taskrefs) && taskrefs.length > 0 && taskrefs.every((ref) => isnonempty(ref));
    if (!haslabels && !hastaskrefs) return { allowed: false, reason: "Reviewed labels or task refs are required in options to attach metadata." };
    if (options.provenance !== void 0 && !isnonempty(options.provenance)) return { allowed: false, reason: "The reviewed provenance must be a non-empty string." };
  }
  if (kind === "reopenrun" && !isnonempty(options.run)) return { allowed: false, reason: "A reviewed run id is required in options to reopen its tabs." };
  return { allowed: true };
}
function ismediakind(kind) {
  return mediaactions.has(kind);
}
function ishttpkind(kind) {
  return httpactions.has(kind);
}
function issocketkind(kind) {
  return socketactions.has(kind);
}
function isnetwatchkind(kind) {
  return netwatchactions.has(kind);
}
function iscontrolkind(kind) {
  return controlactions.has(kind);
}
function resolvedrisk(step) {
  if (step.kind === "capturebodies") {
    let options = {};
    try {
      options = parseoptions(step);
    } catch {
      options = {};
    }
    const body = options.body;
    const mimes = body && typeof body === "object" && !Array.isArray(body) ? body.mimes : void 0;
    if (Array.isArray(mimes) && mimes.some((mime) => typeof mime === "string" && privatemime(mime))) return "sensitive";
    return "interaction";
  }
  if (step.kind === "extractapi") {
    let options = {};
    try {
      options = parseoptions(step);
    } catch {
      options = {};
    }
    const replay = options.replay;
    const verb = replay && typeof replay === "object" && !Array.isArray(replay) ? replay.verb : void 0;
    if (typeof verb === "string" && !["GET", "HEAD", "OPTIONS"].includes(verb.trim().toUpperCase())) return "sensitive";
    return "read";
  }
  return actionrisk(step.kind);
}
function socketgate(session, url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return { allowed: false, reason: "The channel needs a valid url before it can be reviewed." };
  }
  if (parsed.protocol !== "wss:" && parsed.protocol !== "https:") return { allowed: false, reason: "Channels use wss websocket urls or https event stream urls only." };
  if (parsed.username || parsed.password) return { allowed: false, reason: "Channel credentials are not allowed in the url." };
  const origin = channelorigin(url);
  if (!origingranted(session, origin)) return { allowed: false, reason: `The channel to ${origin} stays outside the session origin grants.` };
  return { allowed: true };
}
function watchgate(session, settings, now) {
  if (!session || session.stoppedat) return { allowed: false, reason: "No active browser session exists for the request watch." };
  if (session.expiresat <= now) return { allowed: false, reason: "The browser session has expired and cannot watch requests." };
  if (session.pausedat) return { allowed: false, reason: "The browser session is paused and cannot watch requests." };
  if (settings?.webrequestgrant !== true) return { allowed: false, reason: "Request watching needs the webrequest grant in the review panel first; the observation derives from the page timing buffers and adds no manifest permission." };
  return { allowed: true };
}
function observedorigingranted(session, url) {
  let origin = "";
  try {
    origin = new URL(url).origin;
  } catch {
    return { allowed: false, reason: "The observed exchange url does not parse for an origin check." };
  }
  if (!origingranted(session, origin)) return { allowed: false, reason: `The observed origin ${origin} stays outside the session origin grants; grant it before reading headers, bodies or replays.` };
  return { allowed: true };
}
function origincheck(session, url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return { allowed: false, reason: "The outbound request needs a valid url before it can be reviewed." };
  }
  if (parsed.protocol !== "https:") return { allowed: false, reason: "Outbound requests use HTTPS urls only." };
  if (parsed.username || parsed.password) return { allowed: false, reason: "Endpoint credentials are not allowed in the url." };
  if (!origingranted(session, parsed.origin)) return { allowed: false, reason: `The outbound request to ${parsed.origin} stays outside the session origin grants.` };
  return { allowed: true };
}
function credentialheadername(name) {
  return credentialheaders.has(name.trim().toLowerCase());
}
function fetchconsentrefgranted(step) {
  let options = {};
  try {
    options = parseoptions(step);
  } catch {
    options = {};
  }
  const request = options.fetch;
  const headers = request && typeof request === "object" && !Array.isArray(request) ? request.headers : void 0;
  const names = headers && typeof headers === "object" && !Array.isArray(headers) ? Object.keys(headers) : [];
  if (names.length === 0) return { allowed: true };
  const empty = names.some((name) => !name.trim());
  if (empty) return { allowed: false, reason: "Header allowlists with empty names are refused." };
  const credential = names.find((name) => credentialheadername(name));
  if (credential !== void 0 && !isnonempty(options.consentref)) return { allowed: false, reason: `The credential bearing header ${credential} needs the explicit reviewed consent that names it before it is sent.` };
  if (!isnonempty(options.consentref)) return { allowed: false, reason: `The ${names.length} reviewed custom header${names.length === 1 ? "" : "s"} need a reviewed consent ref in options before any send.` };
  return { allowed: true };
}
function fetchconsentcovers(consent, origin, headernames, now) {
  if (consent.approved !== true) return false;
  if (consent.expiresat <= now) return false;
  if (consent.origin !== origin) return false;
  const covered = new Set(consent.headers.map((header) => header.name.trim().toLowerCase()));
  return headernames.every((name) => covered.has(name.trim().toLowerCase()));
}
function mutationcallof(step) {
  let options = {};
  try {
    options = parseoptions(step);
  } catch {
    options = {};
  }
  if (step.kind === "callgraphql") {
    const request = options.graphql;
    return Boolean(request && typeof request === "object" && !Array.isArray(request) && request.operationkind === "mutation");
  }
  if (step.kind === "callrest") {
    const method = typeof options.method === "string" ? options.method.trim().toUpperCase() : void 0;
    if (method !== void 0) return !["GET", "HEAD", "OPTIONS"].includes(method);
  }
  return false;
}
function fetchbudgetallowed(timeout, retries, backoff, wait) {
  for (const [label, value] of [["timeout", timeout], ["retries", retries], ["backoff", backoff]]) {
    if (value !== void 0 && (typeof value !== "number" || !Number.isFinite(value) || value < 0)) return { allowed: false, reason: `The reviewed fetch ${label} must be zero or a positive number with no code ceiling.` };
  }
  if (wait !== void 0 && (typeof wait !== "number" || !Number.isFinite(wait) || wait < 0)) return { allowed: false, reason: "The reviewed fetch wait budget must be zero or a positive number of milliseconds." };
  if (wait === void 0 || timeout === void 0) return { allowed: true };
  const attempts = Math.max(1, Math.floor(retries ?? 0) + 1);
  const waits = (backoff ?? 0) * (attempts * (attempts - 1)) / 2;
  const worstcase = timeout * attempts + waits;
  if (worstcase > wait) return { allowed: false, reason: `The fetch worst case of ${worstcase} milliseconds exceeds the reviewed wait budget of ${wait} milliseconds; review a wider budget or fewer retries.` };
  return { allowed: true };
}
function outboundtarget(step) {
  let options = {};
  try {
    options = parseoptions(step);
  } catch {
    options = {};
  }
  const request = options.fetch;
  if (request && typeof request === "object" && !Array.isArray(request)) {
    const url = request.url;
    if (typeof url === "string" && url.trim()) return url.trim();
  }
  return void 0;
}
function validateendpointrecord(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { allowed: false, reason: "A reviewed endpoint record is required." };
  const record = value;
  if (!isnonempty(record.name)) return { allowed: false, reason: "The endpoint record needs a reviewed non-empty name." };
  if (!isnonempty(record.method)) return { allowed: false, reason: "The endpoint record needs a reviewed method." };
  if (!ishttpsurl(record.url)) return { allowed: false, reason: "The endpoint record url template must be an HTTPS url." };
  if (record.headers !== void 0) {
    if (!record.headers || typeof record.headers !== "object" || Array.isArray(record.headers)) return { allowed: false, reason: "The endpoint header allowlist must be an object of reviewed headers." };
    for (const name of Object.keys(record.headers)) {
      if (!name.trim()) return { allowed: false, reason: "Endpoint header allowlists with empty names are refused." };
      const headervalue = record.headers[name];
      if (typeof headervalue !== "string") return { allowed: false, reason: `The endpoint header ${name} needs a reviewed string value.` };
    }
  }
  const schema = record.schema;
  if (!schema || typeof schema !== "object" || Array.isArray(schema)) return { allowed: false, reason: "Every typed endpoint call needs a reviewed payload schema; endpoint records without schemas are refused." };
  const fields = schema.fields;
  if (!Array.isArray(fields) || fields.length === 0) return { allowed: false, reason: "The endpoint payload schema needs a non-empty field list." };
  for (const item of fields) {
    if (!item || typeof item !== "object" || Array.isArray(item)) return { allowed: false, reason: "Every payload schema field must be an object." };
    const field = item;
    if (!isnonempty(field.name)) return { allowed: false, reason: "Every payload schema field needs a non-empty name." };
    if (field.kind !== "string" && field.kind !== "number" && field.kind !== "boolean") return { allowed: false, reason: `The payload schema field ${field.name} must be a string, number or boolean kind.` };
    if (field.required !== void 0 && typeof field.required !== "boolean") return { allowed: false, reason: `The payload schema field ${field.name} required flag must be a boolean.` };
    if (field.default !== void 0 && typeof field.default !== "string" && typeof field.default !== "number" && typeof field.default !== "boolean") return { allowed: false, reason: `The payload schema field ${field.name} default must match its kind.` };
  }
  return { allowed: true };
}
function validpath(path) {
  return path.split(".").every((segment) => /^[A-Za-z0-9_-]+$/.test(segment));
}
function validatehttpgrammar(step, options) {
  const kind = step.kind;
  if (kind === "fetchurl") {
    const request = options.fetch;
    if (!request || typeof request !== "object" || Array.isArray(request)) return { allowed: false, reason: "A reviewed fetch request with a url is required in options.fetch." };
    const fetchrequest = request;
    if (typeof fetchrequest.url !== "string" || !fetchrequest.url.trim()) return { allowed: false, reason: "The reviewed fetch request needs a non-empty url." };
    if (fetchrequest.method !== void 0 && (typeof fetchrequest.method !== "string" || !["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"].includes(fetchrequest.method.trim().toUpperCase()))) return { allowed: false, reason: "The reviewed fetch method must be a known HTTP verb." };
    if (fetchrequest.headers !== void 0) {
      if (!fetchrequest.headers || typeof fetchrequest.headers !== "object" || Array.isArray(fetchrequest.headers)) return { allowed: false, reason: "The reviewed header allowlist must be an object of custom headers." };
      for (const name of Object.keys(fetchrequest.headers)) {
        if (!name.trim()) return { allowed: false, reason: "Header allowlists with empty names are refused." };
        if (typeof fetchrequest.headers[name] !== "string") return { allowed: false, reason: `The reviewed header ${name} needs a string value.` };
      }
    }
    if (fetchrequest.body !== void 0 && typeof fetchrequest.body !== "string") return { allowed: false, reason: "The reviewed fetch body must be a string." };
    if (fetchrequest.mode !== void 0 && fetchrequest.mode !== "cors" && fetchrequest.mode !== "no-cors" && fetchrequest.mode !== "same-origin") return { allowed: false, reason: "The reviewed fetch mode must be cors, no-cors or same-origin." };
    const consentgate = fetchconsentrefgranted(step);
    if (!consentgate.allowed) return consentgate;
    const policycheck = validatefetchoptions(options.fetchoptions);
    if (!policycheck.allowed) return policycheck;
    const fetchpolicy = fetchoptionsvalues(options.fetchoptions);
    const budget = fetchbudgetallowed(fetchpolicy.timeout, fetchpolicy.retries, fetchpolicy.backoff, fetchnumeric(options, "wait"));
    if (!budget.allowed) return budget;
    if (options.stream !== void 0) {
      if (!options.stream || typeof options.stream !== "object" || Array.isArray(options.stream)) return { allowed: false, reason: "The reviewed stream window must be an object with an optional byte budget." };
      const streambudget = options.stream.budget;
      if (streambudget !== void 0 && (typeof streambudget !== "number" || !Number.isFinite(streambudget) || streambudget < 0)) return { allowed: false, reason: "The reviewed stream byte budget must be zero or a positive number of bytes with no code ceiling." };
    }
  }
  if (kind === "parsejson") {
    if (!isnonempty(options.call)) return { allowed: false, reason: "A reviewed stored call id is required in options.call before the body parses." };
    const fields = options.fields;
    if (!Array.isArray(fields) || fields.length === 0) return { allowed: false, reason: "A reviewed non-empty list of json path rules is required in options.fields." };
    for (const item of fields) {
      if (!item || typeof item !== "object" || Array.isArray(item)) return { allowed: false, reason: "Every json path rule must be an object." };
      const rule = item;
      if (!isnonempty(rule.name)) return { allowed: false, reason: "Every json path rule needs a non-empty field name." };
      if (typeof rule.path !== "string" || !rule.path.trim() || !validpath(rule.path.trim())) return { allowed: false, reason: `The json path of ${rule.name} must be a dotted path of non-empty segments.` };
      if (rule.kind !== void 0 && rule.kind !== "text" && rule.kind !== "number" && rule.kind !== "boolean" && rule.kind !== "json") return { allowed: false, reason: `The json path kind of ${rule.name} must be text, number, boolean or json.` };
    }
  }
  if (kind === "parsehtml") {
    if (!isnonempty(options.call)) return { allowed: false, reason: "A reviewed stored call id is required in options.call before the markup parses." };
    const queries = options.queries;
    if (!Array.isArray(queries) || queries.length === 0) return { allowed: false, reason: "A reviewed non-empty list of html queries is required in options.queries." };
    for (const item of queries) {
      if (!item || typeof item !== "object" || Array.isArray(item)) return { allowed: false, reason: "Every html query must be an object." };
      const query = item;
      if (!isnonempty(query.selector)) return { allowed: false, reason: "Every html query needs a selector from the reviewed selector grammar." };
      if (query.attribute !== void 0 && !isnonempty(query.attribute)) return { allowed: false, reason: "The reviewed html query attribute must be a non-empty attribute name." };
      if (query.multi !== void 0 && typeof query.multi !== "boolean") return { allowed: false, reason: "The reviewed html query multi flag must be a boolean." };
    }
  }
  if (kind === "callrest" || kind === "callgraphql") {
    if (!isnonempty(options.endpoint)) return { allowed: false, reason: "A reviewed typed endpoint name is required in options.endpoint." };
    if (kind === "callrest") {
      if (options.payload !== void 0 && (!options.payload || typeof options.payload !== "object" || Array.isArray(options.payload))) return { allowed: false, reason: "The reviewed rest payload must be an object of reviewed values." };
      if (options.method !== void 0 && (typeof options.method !== "string" || !["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"].includes(options.method.trim().toUpperCase()))) return { allowed: false, reason: "The reviewed endpoint method override must be a known HTTP verb." };
      if (options.success !== void 0 && (!Array.isArray(options.success) || !options.success.every((code) => typeof code === "number" && Number.isInteger(code)))) return { allowed: false, reason: "The reviewed success status list must be a list of integer status codes." };
    }
    if (kind === "callgraphql") {
      const request = options.graphql;
      if (!request || typeof request !== "object" || Array.isArray(request)) return { allowed: false, reason: "A reviewed graphql request with an operation is required in options.graphql." };
      const graphql = request;
      if (typeof graphql.query !== "string" || !graphql.query.trim()) return { allowed: false, reason: "The reviewed graphql operation text must be a non-empty string." };
      if (graphql.operationkind !== "query" && graphql.operationkind !== "mutation") return { allowed: false, reason: "The reviewed graphql operation kind must be query or mutation; unknown operation kinds are refused." };
      if (graphql.variables !== void 0 && (!graphql.variables || typeof graphql.variables !== "object" || Array.isArray(graphql.variables))) return { allowed: false, reason: "The reviewed graphql variables must be an object of reviewed values." };
      if (graphql.operationname !== void 0 && !isnonempty(graphql.operationname)) return { allowed: false, reason: "The reviewed graphql operation name must be a non-empty string." };
    }
    if (options.apikeys !== void 0 && (!Array.isArray(options.apikeys) || !options.apikeys.every((name) => isnonempty(name)))) return { allowed: false, reason: "The reviewed api key reference list must be a list of non-empty stored names." };
    const policycheck = validatefetchoptions(options.fetchoptions);
    if (!policycheck.allowed) return policycheck;
    const fetchpolicy = fetchoptionsvalues(options.fetchoptions);
    const budget = fetchbudgetallowed(fetchpolicy.timeout, fetchpolicy.retries, fetchpolicy.backoff, fetchnumeric(options, "wait"));
    if (!budget.allowed) return budget;
  }
  return { allowed: true };
}
function validatefetchoptions(value) {
  if (value === void 0) return { allowed: true };
  if (!value || typeof value !== "object" || Array.isArray(value)) return { allowed: false, reason: "The reviewed fetch options must be an object with timeout, retries, backoff and follow." };
  const options = value;
  for (const key of ["timeout", "backoff"]) {
    if (options[key] !== void 0 && (typeof options[key] !== "number" || !Number.isFinite(options[key]) || options[key] < 0)) return { allowed: false, reason: `The reviewed fetch ${key} must be zero or a positive number with no code ceiling.` };
  }
  for (const key of ["retries", "follow"]) {
    if (options[key] !== void 0 && (typeof options[key] !== "number" || !Number.isInteger(options[key]) || options[key] < 0)) return { allowed: false, reason: `The reviewed fetch ${key} must be zero or a positive integer with no code ceiling.` };
  }
  return { allowed: true };
}
function fetchoptionsvalues(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const options = value;
  return { timeout: fetchnumeric(options, "timeout"), retries: fetchnumeric(options, "retries"), backoff: fetchnumeric(options, "backoff") };
}
function fetchnumeric(options, key) {
  const value = options[key];
  return typeof value === "number" && Number.isFinite(value) ? value : void 0;
}
function isrecordingkind(kind) {
  return kind === "recordscreen" || kind === "captureaudio";
}
function validatesocketgrammar(step, options) {
  const kind = step.kind;
  if (kind === "opensocket") {
    const channel = channeloptionsof(options.socket);
    if (!channel) return { allowed: false, reason: "A reviewed socket with a url is required in options.socket." };
    if (channel.options.reconnect !== void 0 && !Number.isInteger(channel.options.reconnect)) return { allowed: false, reason: "The reviewed socket reconnect budget must be an integer attempt count with no code ceiling." };
    for (const label of ["backoff", "backoffceiling"]) {
      const value = channel.options[label];
      if (value !== void 0 && (typeof value !== "number" || !Number.isFinite(value) || value < 0)) return { allowed: false, reason: `The reviewed socket ${label} must be zero or a positive number of milliseconds with no code ceiling.` };
    }
    if (channel.options.lifetime !== void 0 && (typeof channel.options.lifetime !== "number" || !Number.isFinite(channel.options.lifetime) || channel.options.lifetime <= 0)) return { allowed: false, reason: "The reviewed socket lifetime window must be a positive number of milliseconds." };
    if (options.graphql !== void 0) {
      const subscription = graphqlsubscriptionof(options.graphql);
      if (!subscription) return { allowed: false, reason: "A reviewed graphql subscription with a query and its websocket channel is required in options.graphql." };
      if (!isnonempty(subscription.channel)) return { allowed: false, reason: "The graphql subscription names its websocket channel in options.graphql.channel; a subscription without its channel rides nothing." };
    }
  }
  if (kind === "sendmessage") {
    const message = options.message;
    if (!message || typeof message !== "object" || Array.isArray(message)) return { allowed: false, reason: "A reviewed message with a channel, stream and payload is required in options.message." };
    const envelope = message;
    if (!isnonempty(envelope.channel)) return { allowed: false, reason: "The reviewed message needs the open channel id in options.message.channel." };
    if (envelope.stream !== void 0 && !isnonempty(envelope.stream)) return { allowed: false, reason: "The reviewed message stream name must be a non-empty string." };
    if (typeof envelope.payload !== "string") return { allowed: false, reason: "The reviewed message payload must be a string." };
  }
  if (kind === "waitmessage") {
    if (options.filter !== void 0) {
      const filter = options.filter;
      if (!filter || typeof filter !== "object" || Array.isArray(filter)) return { allowed: false, reason: "The reviewed message filter must be an object of stream, path and limit." };
      const reviewed = filter;
      if (reviewed.stream !== void 0 && !isnonempty(reviewed.stream)) return { allowed: false, reason: "The reviewed message filter stream name must be a non-empty string." };
      if (reviewed.path !== void 0 && (typeof reviewed.path !== "string" || !validpath(reviewed.path.trim()))) return { allowed: false, reason: "The reviewed message filter path must be a dotted path of non-empty segments." };
      if (reviewed.limit !== void 0 && (typeof reviewed.limit !== "number" || !Number.isInteger(reviewed.limit) || reviewed.limit < 1)) return { allowed: false, reason: "The reviewed message match limit must be a positive integer with no code ceiling." };
    }
    if (options.wait !== void 0 && (typeof options.wait !== "number" || !Number.isFinite(options.wait) || options.wait < 0)) return { allowed: false, reason: "The reviewed message wait budget must be zero or a positive number of milliseconds." };
  }
  if (kind === "subscribesse") {
    const subscription = subscriptionoptionsof(options.subscription);
    if (!subscription) return { allowed: false, reason: "A reviewed subscription with an event stream url and a cancellation path is required in options.subscription." };
    const rawlifetime = options.subscription && typeof options.subscription === "object" && !Array.isArray(options.subscription) ? options.subscription.lifetime : void 0;
    if (rawlifetime !== void 0 && (typeof rawlifetime !== "number" || !Number.isFinite(rawlifetime) || rawlifetime <= 0)) return { allowed: false, reason: "The reviewed subscription lifetime window must be a positive number of milliseconds." };
  }
  if (kind === "longpoll") {
    const cursor = pollcursorof(options.poll);
    if (!cursor) return { allowed: false, reason: "A reviewed poll cursor with a url, cursor field, interval and stop condition is required in options.poll." };
    const wait = options.wait;
    if (wait !== void 0 && (typeof wait !== "number" || !Number.isFinite(wait) || wait < 0)) return { allowed: false, reason: "The reviewed long poll wait budget must be zero or a positive number of milliseconds." };
    if (wait !== void 0 && cursor.interval > wait) return { allowed: false, reason: `The long poll interval of ${cursor.interval} milliseconds exceeds the reviewed wait budget of ${wait} milliseconds; review a wider budget or a shorter interval.` };
    if (options.pollrequest !== void 0) {
      const request = longpollrequestof(options.pollrequest);
      if (!request) return { allowed: false, reason: "A reviewed poll request with a url is required in options.pollrequest; the timeout and the resume cursor stay optional user choices." };
      if (request.timeout !== void 0 && (typeof request.timeout !== "number" || !Number.isFinite(request.timeout) || request.timeout <= 0)) return { allowed: false, reason: "The reviewed poll request timeout must be a positive number of milliseconds with no code default." };
    }
  }
  return { allowed: true };
}
function validatenetwatchgrammar(step, options) {
  const kind = step.kind;
  if (kind === "watchrequests") {
    if (options.watch !== void 0) {
      const watch = options.watch;
      if (!watch || typeof watch !== "object" || Array.isArray(watch)) return { allowed: false, reason: "The reviewed watch window must be an object." };
      const reviewed = watch;
      if (reviewed.window !== void 0 && (typeof reviewed.window !== "number" || !Number.isFinite(reviewed.window) || reviewed.window < 0)) return { allowed: false, reason: "The reviewed watch window must be zero or a positive number of milliseconds." };
    }
    if (options.limit !== void 0 && (typeof options.limit !== "number" || !Number.isInteger(options.limit) || options.limit < 1)) return { allowed: false, reason: "The reviewed watch match limit must be a positive integer with no code ceiling." };
  }
  if (kind === "readheaders") {
    const headers = options.headers;
    if (!headers || typeof headers !== "object" || Array.isArray(headers)) return { allowed: false, reason: "A reviewed header filter with a name allowlist and a redaction list is required in options.headers." };
    const reviewed = headers;
    if (!Array.isArray(reviewed.allow) || reviewed.allow.length === 0 || !reviewed.allow.every((name) => isnonempty(name))) return { allowed: false, reason: "The reviewed header allowlist must be a non-empty list of header names." };
    if (!Array.isArray(reviewed.redact) || reviewed.redact.length === 0 || !reviewed.redact.every((name) => isnonempty(name))) return { allowed: false, reason: "Header capture requires a reviewed redaction list before any header value is stored." };
  }
  if (kind === "capturebodies") {
    const body = options.body;
    if (!body || typeof body !== "object" || Array.isArray(body)) return { allowed: false, reason: "A reviewed body filter with a url pattern, mime list and byte ceiling is required in options.body." };
    const reviewed = body;
    if (reviewed.urlpattern !== void 0 && !isnonempty(reviewed.urlpattern)) return { allowed: false, reason: "The reviewed body url pattern must be a non-empty string." };
    if (reviewed.mimes !== void 0 && (!Array.isArray(reviewed.mimes) || reviewed.mimes.length === 0 || !reviewed.mimes.every((mime) => isnonempty(mime)))) return { allowed: false, reason: "The reviewed body mime list must be a non-empty list of mime types." };
    if (reviewed.ceiling !== void 0 && (typeof reviewed.ceiling !== "number" || !Number.isFinite(reviewed.ceiling) || reviewed.ceiling < 0)) return { allowed: false, reason: "The reviewed body byte ceiling must be zero or a positive number of bytes with no code ceiling." };
  }
  if (kind === "mapapi") {
    if (options.limit !== void 0 && (typeof options.limit !== "number" || !Number.isInteger(options.limit) || options.limit < 1)) return { allowed: false, reason: "The reviewed mapapi match limit must be a positive integer with no code ceiling." };
  }
  if (kind === "extractapi") {
    const replay = apireplayspecof(options.replay);
    if (!replay) return { allowed: false, reason: "A reviewed replay spec with an endpoint is required in options.replay." };
    if (!ishttpsurl(replay.endpoint)) return { allowed: false, reason: "The reviewed replay endpoint must be an HTTPS url." };
    if (replay.verb !== void 0 && !["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"].includes(replay.verb)) return { allowed: false, reason: "The reviewed replay verb must be a known HTTP verb." };
    for (const path of replay.paths ?? []) {
      if (!validpath(path.trim())) return { allowed: false, reason: `The reviewed replay extraction path ${path} must be a dotted path of non-empty segments.` };
    }
  }
  return { allowed: true };
}
function validatecontrolgrammar(step, options) {
  const kind = step.kind;
  if (kind === "blockrequest") {
    const rule = blockruleof(options.block);
    if (!rule) return { allowed: false, reason: "A reviewed block rule with a url pattern is required in options.block." };
    if (patternorigin(rule.urlpattern) === void 0) return { allowed: false, reason: "Block rules need an https origin pattern; patterns without a named origin are refused." };
    if (options.block.reviewed !== true) return { allowed: false, reason: "The block rule carries the explicit reviewed flag before any request is blocked." };
  }
  if (kind === "mockresponse") {
    const spec = mockspecof(options.mock);
    if (!spec) return { allowed: false, reason: "A reviewed mock fixture with a url pattern, status and its reviewed body or a captured body ref is required in options.mock." };
    if (patternorigin(spec.urlpattern) === void 0) return { allowed: false, reason: "Mock fixtures need an https origin pattern; patterns without a named origin are refused." };
    if (spec.reviewed !== true) return { allowed: false, reason: "Every mock fixture is reviewed with its full body or the referenced captured body through the explicit reviewed flag before it serves." };
  }
  if (kind === "rewriteheaders") {
    const rules = options.rules;
    if (!Array.isArray(rules) || rules.length === 0) return { allowed: false, reason: "A reviewed non-empty list of header rewrite rules is required in options.rules." };
    for (const item of rules) {
      const rule = headeruleof(item);
      if (!rule) return { allowed: false, reason: "Every header rewrite rule needs a url pattern, header name, a set, append or remove operation and its value." };
      if (patternorigin(rule.urlpattern) === void 0) return { allowed: false, reason: "Header rewrite rules must name their origin pattern explicitly; patterns without a named origin are refused." };
    }
  }
  if (kind === "setcookies") {
    const cookies = options.cookies;
    if (!Array.isArray(cookies) || cookies.length === 0) return { allowed: false, reason: "A reviewed non-empty list of cookie records is required in options.cookies." };
    for (const item of cookies) {
      if (!cookierecordof(item)) return { allowed: false, reason: "Every cookie record needs a name, domain, path and reviewed string value with an optional expiry." };
    }
  }
  if (kind === "readcookies" && options.domain !== void 0 && !isnonempty(options.domain)) return { allowed: false, reason: "The reviewed cookie read domain must be a non-empty host." };
  if (kind === "clearcookies") {
    if (!isnonempty(options.domain)) return { allowed: false, reason: "A reviewed cookie domain is required before cookies are cleared." };
    if (options.names !== void 0 && (!Array.isArray(options.names) || options.names.length === 0 || !options.names.every((name) => isnonempty(name)))) return { allowed: false, reason: "The reviewed cookie clear list must be a non-empty list of cookie names when present." };
  }
  if (kind === "authflow") {
    const flow = oauthflowof(options.oauth);
    if (!flow) return { allowed: false, reason: "A reviewed oauth flow with provider, authorize url, token url, scopes and redirect origin is required in options.oauth." };
    if (!ishttpsurl(flow.authorizeurl) || !ishttpsurl(flow.tokenurl)) return { allowed: false, reason: "The oauth authorize and token urls must use HTTPS." };
    if (!ishttpsurl(flow.redirectorigin) && !/^https:\/\/[^/]+\/?$/.test(flow.redirectorigin)) return { allowed: false, reason: "The oauth redirect origin must be an HTTPS origin inside the grants." };
    const consent = authconsentgranted(step);
    if (!consent.allowed) return consent;
  }
  if (kind === "saveapikey") {
    const key = options.key;
    if (!key || typeof key !== "object" || Array.isArray(key)) return { allowed: false, reason: "A reviewed api key entry with name, origin scopes and header is required in options.key." };
    const entry = key;
    if (!isnonempty(entry.name)) return { allowed: false, reason: "The api key entry needs a reviewed non-empty name." };
    if (!Array.isArray(entry.origins) || entry.origins.length === 0 || !entry.origins.every((item) => ishttpsurl(item))) return { allowed: false, reason: "The api key needs a reviewed non-empty list of HTTPS origin scopes." };
    if (!isnonempty(entry.header)) return { allowed: false, reason: "The api key entry needs a reviewed non-empty header name." };
    if (typeof entry.value !== "string" || !entry.value) return { allowed: false, reason: "The api key needs its secret value in the reviewed options; it never enters the audit trail." };
    const consent = apikeyconsentgranted(step);
    if (!consent.allowed) return consent;
  }
  if (kind === "routeproxy") {
    if (!proxyrouteof(options.proxy)) return { allowed: false, reason: "A reviewed proxy route with scheme, host, port and a non-empty bypass list is required in options.proxy." };
    if (!isnonempty(options.consentref)) return { allowed: false, reason: "Proxy routing needs the explicit reviewed consent ref before any route applies." };
  }
  if (kind === "postform") {
    const form = formpayloadof(options.form);
    if (!form) return { allowed: false, reason: "A reviewed form payload with a url and a non-empty field list is required in options.form." };
    if (!ishttpsurl(form.url)) return { allowed: false, reason: "The form submission target must use HTTPS." };
    const encoding = options.form && typeof options.form === "object" && !Array.isArray(options.form) ? options.form.encoding : void 0;
    if (encoding !== void 0 && !isnonempty(encoding)) return { allowed: false, reason: "The reviewed form payload encoding must be a non-empty name such as urlencoded." };
    if (options.wait !== void 0 && (typeof options.wait !== "number" || !Number.isFinite(options.wait) || options.wait < 0)) return { allowed: false, reason: "The reviewed rate limit wait budget must be zero or a positive number of milliseconds." };
  }
  if (kind === "postfiles") {
    const upload = multipartpayloadof(options.upload);
    if (!upload) return { allowed: false, reason: "A reviewed multipart upload with a url and reviewed files is required in options.upload; every file carries the explicit reviewed flag." };
    if (!ishttpsurl(upload.url)) return { allowed: false, reason: "The multipart upload target must use HTTPS." };
    if (options.wait !== void 0 && (typeof options.wait !== "number" || !Number.isFinite(options.wait) || options.wait < 0)) return { allowed: false, reason: "The reviewed rate limit wait budget must be zero or a positive number of milliseconds." };
  }
  return { allowed: true };
}
function blockgate(session, step, now) {
  if (!session || session.stoppedat) return { allowed: false, reason: "No active browser session exists for the request block." };
  if (session.expiresat <= now) return { allowed: false, reason: "The browser session has expired and cannot block requests." };
  if (session.pausedat) return { allowed: false, reason: "The browser session is paused and cannot block requests." };
  let options = {};
  try {
    options = parseoptions(step);
  } catch {
    options = {};
  }
  const rule = options.block;
  if (!rule || typeof rule !== "object" || Array.isArray(rule) || rule.reviewed !== true) return { allowed: false, reason: "Request blocking needs its reviewed block rule with the explicit reviewed flag before any rule applies." };
  if (!blockruleof(rule)) return { allowed: false, reason: "The block rule needs a url pattern and an optional resource type list." };
  return { allowed: true };
}
function cookiegate(session, domain, now) {
  if (!session || session.stoppedat) return { allowed: false, reason: "No active browser session exists for the cookie operation." };
  if (session.expiresat <= now) return { allowed: false, reason: "The browser session has expired and cannot touch cookies." };
  if (session.pausedat) return { allowed: false, reason: "The browser session is paused and cannot touch cookies." };
  const grants = session.grants ?? [session.origin];
  if (!cookiedomaingranted(domain, grants)) return { allowed: false, reason: `The cookie domain ${domain} stays outside the session origin grants; cookie control refuses domains beyond the grants.` };
  return { allowed: true };
}
function proxygate(session, step, now) {
  if (!session || session.stoppedat) return { allowed: false, reason: "No active browser session exists for the proxy route." };
  if (session.expiresat <= now) return { allowed: false, reason: "The browser session has expired and cannot change routing." };
  if (session.pausedat) return { allowed: false, reason: "The browser session is paused and cannot change routing." };
  let options = {};
  try {
    options = parseoptions(step);
  } catch {
    options = {};
  }
  if (!isnonempty(options.consentref)) return { allowed: false, reason: "Proxy routing needs the explicit reviewed consent ref before any route applies." };
  if (!proxyrouteof(options.proxy)) return { allowed: false, reason: "The proxy route needs a scheme, host, port and a non-empty bypass list of origins that stay direct." };
  return { allowed: true };
}
function authconsentgranted(step) {
  let options = {};
  try {
    options = parseoptions(step);
  } catch {
    options = {};
  }
  const consentref = options.consentref;
  if (typeof consentref !== "string" || !consentref.trim()) return { allowed: false, reason: "An oauth flow requires the reviewed provider consent prompt ref in options before it starts." };
  return { allowed: true };
}
function apikeyconsentgranted(step) {
  let options = {};
  try {
    options = parseoptions(step);
  } catch {
    options = {};
  }
  const consentref = options.consentref;
  if (typeof consentref !== "string" || !consentref.trim()) return { allowed: false, reason: "Storing an api key requires the explicit reviewed consent prompt ref in options before anything is stored." };
  return { allowed: true };
}
function ratelimitbudgetallowed(wait, budget) {
  if (wait !== void 0 && (typeof wait !== "number" || !Number.isFinite(wait) || wait < 0)) return { allowed: false, reason: "The rate limit wait must be zero or a positive number of milliseconds." };
  if (budget !== void 0 && (typeof budget !== "number" || !Number.isFinite(budget) || budget < 0)) return { allowed: false, reason: "The reviewed rate limit budget must be zero or a positive number of milliseconds." };
  if (wait !== void 0 && budget !== void 0 && wait > budget) return { allowed: false, reason: `The rate limit wait of ${wait} milliseconds exceeds the reviewed budget of ${budget} milliseconds; review a wider budget or submit later.` };
  return { allowed: true };
}
function timelinegate(session, tabid, origin, now) {
  if (!session || session.stoppedat) return { allowed: false, reason: "No active browser session exists for the timeline capture." };
  if (session.expiresat <= now) return { allowed: false, reason: "The browser session has expired and cannot capture the timeline." };
  if (session.pausedat) return { allowed: false, reason: "The browser session is paused and cannot capture the timeline." };
  if (session.tabid !== tabid) return { allowed: false, reason: `The timeline capture needs the run tab ${session.tabid} and refuses tab ${tabid}.` };
  if (!origingranted(session, origin)) return { allowed: false, reason: `The timeline capture of ${origin} needs the session origin grants first.` };
  return { allowed: true };
}
function consoleconsentcovers(origin, consents) {
  if (consents.some((consent) => consent.origin === origin && consent.approved === true)) return { allowed: true };
  return { allowed: false, reason: `Console capture on ${origin} needs the reviewed console consent first; approve the prompt in the review panel.` };
}
function stackgate(session, origin) {
  if (!origingranted(session, origin)) return { allowed: false, reason: `Stack capture of ${origin} stays outside the session origin grants.` };
  return { allowed: true };
}
function debugwaitbudgetallowed(watchwindow, wait) {
  if (watchwindow !== void 0 && (typeof watchwindow !== "number" || !Number.isFinite(watchwindow) || watchwindow < 0)) return { allowed: false, reason: "The debug watch window must be zero or a positive number of milliseconds." };
  if (wait !== void 0 && (typeof wait !== "number" || !Number.isFinite(wait) || wait < 0)) return { allowed: false, reason: "The reviewed debug wait budget must be zero or a positive number of milliseconds." };
  if (watchwindow !== void 0 && wait !== void 0 && watchwindow > wait) return { allowed: false, reason: `The debug watch window of ${watchwindow} milliseconds exceeds the reviewed wait budget of ${wait} milliseconds; review a wider budget or a shorter window.` };
  return { allowed: true };
}
function timelineretentionwindow(settings) {
  return settings?.timelineretention;
}
function diffreviewgrade() {
  return { risk: "read", mode: "diffing", evidence: "comparison" };
}
function validatetimelinegrammar(step, options) {
  const kind = step.kind;
  let watchwindow;
  if (options.watch !== void 0) {
    const watch = options.watch;
    if (!watch || typeof watch !== "object" || Array.isArray(watch)) return { allowed: false, reason: "The reviewed debug watch window must be an object." };
    const reviewed = watch;
    if (reviewed.window !== void 0) {
      if (typeof reviewed.window !== "number" || !Number.isFinite(reviewed.window) || reviewed.window < 0) return { allowed: false, reason: "The reviewed debug watch window must be zero or a positive number of milliseconds." };
      watchwindow = reviewed.window;
    }
  }
  const budgetcheck2 = debugwaitbudgetallowed(watchwindow, typeof options.wait === "number" ? options.wait : void 0);
  if (!budgetcheck2.allowed) return budgetcheck2;
  if (options.level !== void 0 && !loglevels.includes(options.level)) return { allowed: false, reason: `The reviewed level floor must be one of ${loglevels.join(", ")}.` };
  if (options.sources !== void 0) {
    if (!Array.isArray(options.sources) || options.sources.length === 0 || !options.sources.every((source) => timelinesources.includes(source))) return { allowed: false, reason: `The reviewed source filters must be a non-empty list of the reviewed timeline sources: ${timelinesources.join(", ")}.` };
  }
  if (kind === "watchconsole") {
    if (options.redact === void 0 || !Array.isArray(options.redact) || options.redact.length === 0 || !options.redact.every((pattern) => isnonempty(pattern))) return { allowed: false, reason: "Console capture requires a reviewed non-empty redaction pattern list before any console text is captured." };
    if (options.depth !== void 0 && (typeof options.depth !== "number" || !Number.isInteger(options.depth) || options.depth < 1)) return { allowed: false, reason: "The reviewed serialization depth bound must be a positive integer with no code ceiling." };
    if (options.spam !== void 0) {
      const rule = spamruleof(options.spam);
      if (!rule) return { allowed: false, reason: "The reviewed spam rule needs a pattern, a window size and a collapse threshold." };
      if (rule.collapse < 1) return { allowed: false, reason: "The reviewed spam collapse threshold must be a positive integer of user configured value with no code ceiling." };
    }
    if (options.rotation !== void 0) {
      const rule = rotationruleof(options.rotation);
      if (!rule) return { allowed: false, reason: "The reviewed rotation rule needs a max entry count and an overflow target." };
    }
  }
  if (kind === "watchtasks") {
    if (options.threshold !== void 0 && (typeof options.threshold !== "number" || !Number.isFinite(options.threshold) || options.threshold < 0)) return { allowed: false, reason: "The reviewed long task threshold must be zero or a positive number of milliseconds with no code ceiling." };
  }
  return { allowed: true };
}
function spamruleof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const entry = value;
  const pattern = typeof entry.pattern === "string" ? entry.pattern : "";
  const windowsize = typeof entry.windowsize === "number" && Number.isFinite(entry.windowsize) && entry.windowsize >= 0 ? entry.windowsize : void 0;
  const collapse = typeof entry.collapse === "number" && Number.isInteger(entry.collapse) ? entry.collapse : void 0;
  if (windowsize === void 0 || collapse === void 0) return void 0;
  return { pattern, windowsize, collapse };
}
function rotationruleof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const entry = value;
  const maxentries = typeof entry.maxentries === "number" && Number.isInteger(entry.maxentries) && entry.maxentries >= 1 ? entry.maxentries : void 0;
  const overflowtarget = typeof entry.overflowtarget === "string" && entry.overflowtarget.trim() ? entry.overflowtarget.trim() : void 0;
  if (maxentries === void 0 || overflowtarget === void 0) return void 0;
  return { maxentries, overflowtarget };
}
function debuggate(session, tabid, origin, now) {
  if (!session || session.stoppedat) return { allowed: false, reason: "No active browser session exists for the devtools protocol step." };
  if (session.expiresat <= now) return { allowed: false, reason: "The browser session has expired and cannot run a devtools protocol step." };
  if (session.pausedat) return { allowed: false, reason: "The browser session is paused and cannot run a devtools protocol step." };
  if (session.tabid !== tabid) return { allowed: false, reason: `The devtools protocol step needs the run tab ${session.tabid} and refuses tab ${tabid}.` };
  if (!origingranted(session, origin)) return { allowed: false, reason: `The devtools protocol step on ${origin} needs the session origin grants first.` };
  return { allowed: true };
}
function debuggerconsentcovers(origin, domains, grants) {
  const needed = [...new Set(domains)];
  const covering = grants.find((grant) => grant.origin === origin && grant.approved === true && grant.revokedat === void 0 && needed.every((domain) => grant.domains.includes(domain)));
  if (covering) return { allowed: true };
  if (grants.some((grant) => grant.origin === origin && grant.revokedat !== void 0)) return { allowed: false, reason: `The debugger consent on ${origin} was revoked; approve a new prompt before the devtools protocol runs again.` };
  return { allowed: false, reason: `The devtools protocol on ${origin} needs the reviewed debugger consent for ${needed.join(", ")} first; approve the prompt with the domain allowlist shown in the review panel.` };
}
function targetgate(input) {
  const base = debuggate(input.session, input.tabid, input.origin, input.now);
  if (!base.allowed) return base;
  for (const target of input.targets) {
    if (target.kind === "page") continue;
    const origincheckresult = origincheck(input.session, target.url);
    if (!origincheckresult.allowed) return { allowed: false, reason: `The ${target.kind} target ${target.url} stays outside the granted origins; profiling refuses to attach.` };
  }
  if (input.grants === void 0) return { allowed: true };
  const consent = debuggerconsentcovers(input.origin, [], input.grants);
  if (!consent.allowed) return { allowed: false, reason: `The profiling step on ${input.origin} needs the reviewed debugger grant of the origin first; approve the prompt with the profiling derivation shown in the review panel.` };
  return { allowed: true };
}
function sourcemapconsentcovers(origin, consents) {
  const covering = consents.find((consent) => consent.origin === origin && consent.approved === true && consent.revokedat === void 0);
  if (covering) return { allowed: true };
  if (consents.some((consent) => consent.origin === origin && consent.revokedat !== void 0)) return { allowed: false, reason: `The source map capture consent on ${origin} was revoked; approve a new prompt before another map file is fetched.` };
  return { allowed: false, reason: `The source map capture on ${origin} needs the reviewed per origin consent first; approve the prompt shown in the review panel.` };
}
function profileretentionwindow(settings) {
  return settings?.profileretention;
}
function traceceilingof(settings) {
  return settings?.traceceiling;
}
function validatebreakpointcondition(condition) {
  const expression = condition.trim();
  if (expression.length === 0) return { allowed: false, reason: "The breakpoint condition must not be empty." };
  if (/(?<![=!<>])=(?!=)/.test(expression)) return { allowed: false, reason: "Breakpoint conditions refuse assignment because the reviewed grammar is comparison only." };
  if (conditioncallshape(expression)) return { allowed: false, reason: "Breakpoint conditions refuse calls because the reviewed grammar is comparison only." };
  const literal = /^(?:-?\d+(?:\.\d+)?|true|false|null)$/;
  const scan = conditiontokens(expression);
  if (!scan.complete || scan.tokens.join("") !== expression.replace(/\s+/g, "")) return { allowed: false, reason: "The breakpoint condition must use the reviewed expression grammar of member chains, literals, comparisons, logic operators, negation and parentheses." };
  const identifierlike = /^(?:true|false|null)$/;
  for (const token of scan.tokens) {
    if (token.startsWith('"') || token.startsWith("'")) continue;
    if (literal.test(token) || identifierlike.test(token)) continue;
    if (["===", "!==", "==", "!=", ">=", "<=", "&&", "||", "!", ".", "(", ")", "<", ">", "+", "-", "*", "/", "%"].includes(token)) continue;
    if (/^[A-Za-z_$][\w$]*$/.test(token)) continue;
    return { allowed: false, reason: `The token ${token} of the breakpoint condition stays outside the reviewed expression grammar.` };
  }
  return { allowed: true };
}
function conditioncallshape(expression) {
  let paren = expression.indexOf("(");
  while (paren !== -1) {
    let end = paren - 1;
    while (end >= 0) {
      const char = expression[end] ?? "";
      if (char !== " " && char !== "	" && char !== "\n" && char !== "\r") break;
      end -= 1;
    }
    let start = end;
    while (start >= 0) {
      const code = expression.charCodeAt(start);
      const part = code >= 97 && code <= 122 || code >= 65 && code <= 90 || code >= 48 && code <= 57 || code === 95 || code === 36;
      if (!part) break;
      start -= 1;
    }
    const chunk = expression.slice(start + 1, end + 1);
    if (chunk.length > 0 && /[A-Za-z_$]/.test(chunk)) return true;
    paren = expression.indexOf("(", paren + 1);
  }
  return false;
}
function conditiontokens(expression) {
  const tokens = [];
  let index = 0;
  while (index < expression.length) {
    const char = expression[index] ?? "";
    if (char === " " || char === "	" || char === "\n" || char === "\r") {
      index += 1;
      continue;
    }
    const code = char.charCodeAt(0);
    const identifierstart = code >= 97 && code <= 122 || code >= 65 && code <= 90 || code === 95 || code === 36;
    if (identifierstart) {
      let end = index + 1;
      while (end < expression.length) {
        const c = expression.charCodeAt(end);
        const part = c >= 97 && c <= 122 || c >= 65 && c <= 90 || c >= 48 && c <= 57 || c === 95 || c === 36;
        if (!part) break;
        end += 1;
      }
      tokens.push(expression.slice(index, end));
      index = end;
      continue;
    }
    const digitafter = index + 1 < expression.length ? expression.charCodeAt(index + 1) : 0;
    const numberstart = code >= 48 && code <= 57 || char === "-" && digitafter >= 48 && digitafter <= 57;
    if (numberstart) {
      let end = index + (char === "-" ? 1 : 0);
      while (end < expression.length && expression.charCodeAt(end) >= 48 && expression.charCodeAt(end) <= 57) end += 1;
      const fractiondot = expression[end] === "." && end + 1 < expression.length && expression.charCodeAt(end + 1) >= 48 && expression.charCodeAt(end + 1) <= 57;
      if (fractiondot) {
        end += 2;
        while (end < expression.length && expression.charCodeAt(end) >= 48 && expression.charCodeAt(end) <= 57) end += 1;
      }
      tokens.push(expression.slice(index, end));
      index = end;
      continue;
    }
    if (char === '"' || char === "'") {
      let end = index + 1;
      let closed = false;
      while (end < expression.length) {
        const inner = expression[end] ?? "";
        if (inner === "\\") {
          end += 2;
          continue;
        }
        if (inner === char) {
          closed = true;
          end += 1;
          break;
        }
        end += 1;
      }
      if (!closed) return { tokens, complete: false };
      tokens.push(expression.slice(index, end));
      index = end;
      continue;
    }
    const three = expression.slice(index, index + 3);
    if (three === "===" || three === "!==") {
      tokens.push(three);
      index += 3;
      continue;
    }
    const two = expression.slice(index, index + 2);
    if (two === "==" || two === "!=" || two === ">=" || two === "<=" || two === "&&" || two === "||") {
      tokens.push(two);
      index += 2;
      continue;
    }
    if ("!.<>()+-*/%".includes(char)) {
      tokens.push(char);
      index += 1;
      continue;
    }
    return { tokens, complete: false };
  }
  return { tokens, complete: true };
}
function breakpointbudgetallowed(active, ceiling) {
  if (ceiling === void 0) return { allowed: true };
  if (typeof ceiling !== "number" || !Number.isInteger(ceiling) || ceiling < 0) return { allowed: false, reason: "The reviewed breakpoint ceiling must be zero or a positive integer of user configured value with no code ceiling." };
  if (active >= ceiling) return { allowed: false, reason: `The run already holds ${active} active breakpoint${active === 1 ? "" : "s"} and the reviewed breakpoint ceiling is ${ceiling}; revert one or review a wider ceiling.` };
  return { allowed: true };
}
function pauseretentionwindow(settings) {
  return settings?.pauseretention;
}
function breakpointceilingof(settings) {
  return settings?.breakpointceiling;
}
function emugate(input) {
  const gate = sessiongate({ session: input.session, tabid: input.tabid, origin: input.origin, now: input.now, action: "emulate the run tab" });
  if (!gate.allowed) return gate;
  if (!input.plan || input.plan.state !== "approved") return { allowed: false, reason: "Emulation layers need an approved plan before they apply." };
  let options = {};
  try {
    options = parseoptions(input.step);
  } catch {
    options = {};
  }
  if (options.reviewed !== true) return { allowed: false, reason: `The ${input.step.kind} layer needs the explicit reviewed flag before any mask applies.` };
  if (revertplanof(options.revertplan) === void 0) return { allowed: false, reason: `Every ${input.step.kind} layer needs a reviewed revert plan beside it before any mask applies.` };
  return { allowed: true };
}
function emulationstackallowed(plan, kind, active) {
  if (!plan) return { allowed: false, reason: "Layer stacking needs the reviewed plan first." };
  const listed = plan.steps.filter((step) => step.kind === kind).length;
  if (active >= listed) return { allowed: false, reason: `The plan lists ${listed} reviewed ${kind} step${listed === 1 ? "" : "s"} and ${active} layer${active === 1 ? "" : "s"} of that family are already active; stacking beyond the reviewed plan is refused.` };
  return { allowed: true };
}
function locationconsentgate(origin, latitude, longitude, consents) {
  if (consents.some((consent) => consent.origin === origin && consent.revokedat !== void 0)) return { allowed: false, reason: `The location consent on ${origin} was revoked; approve a new prompt before the location override runs again.` };
  if (locationconsentcovers(origin, latitude, longitude, consents)) return { allowed: true };
  return { allowed: false, reason: `The location override of ${latitude}, ${longitude} on ${origin} needs the reviewed location consent first; approve the prompt with the coordinates shown in the review panel.` };
}
function emulationretentionwindow(settings) {
  return settings?.emulationretention;
}
function validateemulationgrammar(step, options) {
  const kind = step.kind;
  if (revertplanof(options.revertplan) === void 0) return { allowed: false, reason: `Every ${kind} layer needs a reviewed revert plan before any mask applies.` };
  if (kind === "emulatedevice") {
    const preset = devicepresetof(options.device);
    if (!preset) return { allowed: false, reason: "The device layer needs a reviewed preset with a name, positive integer width and height and a positive pixel ratio." };
    if (options.reload !== void 0 && typeof options.reload !== "boolean") return { allowed: false, reason: "The reviewed reload flag must be a boolean; the page reloads only when the reviewed plan asks." };
    return { allowed: true };
  }
  if (kind === "emulatenetwork") {
    const preset = networkpresetof(options.network);
    if (!preset) return { allowed: false, reason: "The network layer needs a reviewed preset with a name and zero or positive latency, download and upload bounds." };
    if (options.window !== void 0 && (typeof options.window !== "number" || !Number.isFinite(options.window) || options.window < 0)) return { allowed: false, reason: "The reviewed offline window must be zero or a positive number of milliseconds with no code ceiling." };
    return { allowed: true };
  }
  if (kind === "emulatelocate") {
    const preset = locationpresetof(options.location);
    if (!preset) return { allowed: false, reason: "The location layer needs a reviewed preset with a name, a latitude inside -90 and 90, a longitude inside -180 and 180 and a zero or positive accuracy radius." };
    if (!locationrangevalid(preset.latitude, preset.longitude)) return { allowed: false, reason: "The reviewed latitude must stay inside -90 and 90 degrees and the longitude inside -180 and 180 degrees." };
    return { allowed: true };
  }
  if (kind === "setuseragent") {
    const preset = agentpresetof(options.agent);
    if (!preset) return { allowed: false, reason: "The agent layer needs a reviewed preset with a user agent string of the reviewed grammar, a platform and a non-empty brand list." };
    if (!agentgrammarvalid(preset.useragent)) return { allowed: false, reason: "The reviewed user agent string must use the reviewed grammar of tokens, separators and version marks without line breaks." };
    return { allowed: true };
  }
  if (kind === "overridepermission") {
    const grant = permissiongrantof(options.permission);
    if (!grant) return { allowed: false, reason: `The permission override needs a reviewed name of the browser permission set (${browserpermissions.join(", ")}) and a state of ${permissionstates.join(", ")}.` };
    void permissiongrade(grant.name);
    return { allowed: true };
  }
  if (kind === "blackboxscripts") {
    const rules = Array.isArray(options.rules) ? options.rules.flatMap((rule) => {
      const parsed = blackboxruleof(rule);
      return parsed !== void 0 ? [parsed] : [];
    }) : [];
    if (rules.length === 0) return { allowed: false, reason: "The blackbox layer needs a reviewed non-empty rule list where every pattern names its origin explicitly and carries a trace scope." };
    return { allowed: true };
  }
  return { allowed: true };
}
function permissionnamevalid(name) {
  if (!browserpermissions.includes(name)) return { allowed: false, reason: `The permission ${name} stays outside the reviewed browser permission set: ${browserpermissions.join(", ")}.` };
  return { allowed: true };
}
function validatesessiongrammar(step, options) {
  const kind = step.kind;
  if (kind === "persiststate") {
    if (options.resume !== void 0 && typeof options.resume !== "boolean") return { allowed: false, reason: "The reviewed resume flag must be a boolean." };
    return { allowed: true };
  }
  if (kind === "capturesession") {
    const plan = snapshotplanof(options.snapshot);
    if (!plan) return { allowed: false, reason: "The session capture needs a reviewed snapshot plan with its scope, a non-empty section list of the reviewed grammar (tabs, scroll, forms, storage, cookies) and the capture link flag." };
    if (plan.auto !== void 0) {
      const interval = autointervalof(options.snapshot.auto);
      if (interval === void 0) return { allowed: false, reason: "The reviewed auto snapshot interval needs a positive period, a positive maximum snapshot count and a zero or positive expiry window with no code ceiling." };
    }
    return { allowed: true };
  }
  if (kind === "restoresession") {
    if (typeof options.sessionid !== "string" || !options.sessionid.trim()) return { allowed: false, reason: "The session restore needs the reviewed session id of the saved record." };
    if (restoreplanof(options.restore) === void 0) return { allowed: false, reason: "The session restore needs a reviewed restore plan with its tab, form and capture policies." };
    if (options.reviewed !== true) return { allowed: false, reason: "Every session restore needs the explicit restore review with its tabs, form state and captures listed before it reopens anything." };
    return { allowed: true };
  }
  if (kind === "namedsessions") {
    if (typeof options.sessionid !== "string" || !options.sessionid.trim()) return { allowed: false, reason: "The session filing needs the reviewed session id of the saved record." };
    if (typeof options.name !== "string" || !options.name.trim()) return { allowed: false, reason: "The session filing needs a reviewed non-empty session name." };
    if (options.folder !== void 0 && (typeof options.folder !== "string" || !options.folder.trim())) return { allowed: false, reason: "The reviewed folder name must be a non-empty string." };
    if (options.tags !== void 0 && (!Array.isArray(options.tags) || !options.tags.every((tag) => typeof tag === "string" && tag.trim()))) return { allowed: false, reason: "The reviewed tag list must be a list of non-empty strings." };
    return { allowed: true };
  }
  if (kind === "diffsessions") {
    if (typeof options.left !== "string" || !options.left.trim() || typeof options.right !== "string" || !options.right.trim()) return { allowed: false, reason: "The session diff needs the reviewed ids of both saved sessions." };
    return { allowed: true };
  }
  if (kind === "searchsessions") {
    if (searchqueryof(options.query) === void 0) return { allowed: false, reason: "The session search needs a reviewed query with a non-empty term list, fields of the reviewed grammar (urls, titles, names, text) and an optional time window." };
    return { allowed: true };
  }
  if (kind === "exportsessions") {
    if (options.reviewed !== true) return { allowed: false, reason: "Session exports need the explicit export review before any session file leaves the device." };
    if (options.ids !== void 0 && (!Array.isArray(options.ids) || options.ids.length === 0 || !options.ids.every((id) => typeof id === "string" && id.trim()))) return { allowed: false, reason: "The reviewed export id list must be a non-empty list of saved session ids." };
    return { allowed: true };
  }
  if (kind === "importsessions") {
    if (options.reviewed !== true) return { allowed: false, reason: "Session imports need the explicit full record review before any record joins the library." };
    if (importsessionfile(options.file) === void 0) return { allowed: false, reason: "The session import needs a reviewed file of the known format version with an intact checksum." };
    return { allowed: true };
  }
  return { allowed: true };
}
function restorereviewgranted(step) {
  let options = {};
  try {
    options = parseoptions(step);
  } catch {
    options = {};
  }
  if (restoreplanof(options.restore) === void 0) return { allowed: false, reason: "Every session restore needs a reviewed restore plan with its tab, form and capture policies." };
  if (options.reviewed !== true) return { allowed: false, reason: "The session restore needs the explicit restore review of its tabs, form state and captures before it reopens anything." };
  return { allowed: true };
}
function sessionrestoregate(input) {
  const gate = sessiongate({ session: input.session, tabid: input.tabid, origin: input.origin, now: input.now, action: "run the session memory step" });
  if (!gate.allowed) return gate;
  if (!input.plan || input.plan.state !== "approved") return { allowed: false, reason: "Session memory steps need an approved plan before they run." };
  if (input.step.kind === "restoresession") return restorereviewgranted(input.step);
  return { allowed: true };
}
function restoreoriginsgranted(urls, grants) {
  const covered = new Set(grants);
  const skippedorigins = [];
  for (const url of urls) {
    let origin = "";
    try {
      origin = new URL(url).origin;
    } catch {
      origin = "";
    }
    if (!origin || !covered.has(origin)) skippedorigins.push(origin || url);
  }
  return { allowed: skippedorigins.length === 0, skippedorigins: [...new Set(skippedorigins)] };
}
function sessionnameunique(name, records, recordid) {
  if (records.some((record) => record.name === name && record.id !== recordid)) return { allowed: false, reason: `The session name ${name} already exists in the library; review a unique name.` };
  return { allowed: true };
}
function sessionfolderunique(name, folders) {
  if (folders.some((folder) => folder.name === name)) return { allowed: false, reason: `The folder name ${name} already exists in the library; review a unique folder name.` };
  return { allowed: true };
}
function snapshotretentionwindow(settings) {
  return settings?.sessionretention;
}
function validateworkflowgrammar(step, options) {
  const kind = step.kind;
  if (kind === "composeworkflow") {
    const payload = options.workflow;
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) return { allowed: false, reason: "The workflow composition needs the reviewed workflow payload with its name, version, origins, steps and blocks." };
    const candidate = payload;
    if (typeof candidate.name !== "string" || !candidate.name.trim()) return { allowed: false, reason: "The workflow composition needs a reviewed non-empty name." };
    if (typeof candidate.version !== "number" || !Number.isInteger(candidate.version) || candidate.version < 1) return { allowed: false, reason: "The workflow version must be a positive integer." };
    if (!Array.isArray(candidate.origins) || candidate.origins.length === 0 || !candidate.origins.every((origin) => typeof origin === "string" && origin.startsWith("https://"))) return { allowed: false, reason: "The workflow needs at least one granted HTTPS origin so every step stays inside the grants." };
    if (!Array.isArray(candidate.steps) || candidate.steps.length === 0 || !candidate.steps.every((entry) => workflowstepof(entry) !== void 0 || entry && typeof entry === "object" && typeof entry.block === "string")) return { allowed: false, reason: "The workflow needs a non-empty reviewed step list of the workflow step grammar or block invocations." };
    const blocks = Array.isArray(candidate.blocks) ? candidate.blocks.flatMap((block) => {
      const parsed = workflowblockof(block);
      return parsed !== void 0 ? [parsed] : [];
    }) : [];
    if (Array.isArray(candidate.blocks) && blocks.length !== candidate.blocks.length) return { allowed: false, reason: "The reviewed block list must carry unique lowercase names, labels and valid child steps." };
    try {
      const record = composeworkflow({ name: candidate.name, version: candidate.version, origins: candidate.origins, steps: candidate.steps.map((entry) => "block" in entry ? { block: entry.block, label: typeof entry.label === "string" ? entry.label : entry.block } : workflowstepof(entry)), blocks, now: 0, kindallowed: (candidatekind) => {
        try {
          actionrisk(candidatekind);
          return true;
        } catch {
          return false;
        }
      }, riskof: (candidatekind) => actionrisk(candidatekind) });
      const inputs = Array.isArray(candidate.inputs) ? candidate.inputs.flatMap((name) => typeof name === "string" ? [name] : []) : void 0;
      const checked = validateworkflow(record, { kindallowed: (workflowkind) => {
        try {
          actionrisk(workflowkind);
          return true;
        } catch {
          return false;
        }
      }, ...inputs !== void 0 ? { inputs } : {} });
      if (!checked.allowed) return checked;
    } catch (error) {
      return { allowed: false, reason: error instanceof Error ? error.message : "The workflow payload failed its composition validation." };
    }
    return { allowed: true };
  }
  if (kind === "savetemplate") {
    const payload = options.template && typeof options.template === "object" && !Array.isArray(options.template) ? options.template : {};
    const template = steptemplateof({ id: "templatereview", origin: "https://example.com", sharedat: 0, ...payload });
    if (!template) return { allowed: false, reason: "The step template needs a reviewed name and a valid workflow step it shares across workflows." };
    return { allowed: true };
  }
  if (kind === "runworkflow") {
    if (typeof options.workflowid !== "string" || !options.workflowid.trim()) return { allowed: false, reason: "The workflow run needs the reviewed id of the composed workflow." };
    if (options.reviewed !== true) return { allowed: false, reason: "Every real workflow run needs the explicit run review with its expanded step list shown before the first step executes." };
    if (options.variables !== void 0 && (!options.variables || typeof options.variables !== "object" || Array.isArray(options.variables) || !Object.values(options.variables).every((value) => typeof value === "string" || typeof value === "number" || typeof value === "boolean"))) return { allowed: false, reason: "The reviewed run variables must be an object of string, number or boolean values." };
    return { allowed: true };
  }
  if (kind === "dryrun") {
    if (typeof options.workflowid !== "string" || !options.workflowid.trim()) return { allowed: false, reason: "The dry run needs the reviewed id of the composed workflow." };
    return { allowed: true };
  }
  if (kind === "delay") {
    const delay = options.delay;
    if (!delay || typeof delay !== "object" || Array.isArray(delay)) return { allowed: false, reason: "The delay needs a reviewed base and jitter window in options." };
    const reviewed = delay;
    if (typeof reviewed.base !== "number" || !Number.isFinite(reviewed.base) || reviewed.base < 0) return { allowed: false, reason: "The reviewed delay base must be zero or a positive number of milliseconds." };
    if (typeof reviewed.jitter !== "number" || !Number.isFinite(reviewed.jitter) || reviewed.jitter < 0) return { allowed: false, reason: "The reviewed delay jitter window must be zero or a positive number of milliseconds with no code ceiling." };
    return { allowed: true };
  }
  if (kind === "waitelement") {
    const wait = options.wait;
    if (!wait || typeof wait !== "object" || Array.isArray(wait)) return { allowed: false, reason: "The element wait needs a reviewed selector, timeout and poll interval in options." };
    const reviewed = wait;
    if (typeof reviewed.selector !== "string" || !reviewed.selector.trim()) return { allowed: false, reason: "The element wait needs a reviewed non-empty selector." };
    if (typeof reviewed.timeout !== "number" || !Number.isFinite(reviewed.timeout) || reviewed.timeout < 0) return { allowed: false, reason: "The reviewed element wait timeout must be zero or a positive number of milliseconds with no code ceiling." };
    if (typeof reviewed.poll !== "number" || !Number.isFinite(reviewed.poll) || reviewed.poll < 0) return { allowed: false, reason: "The reviewed element wait poll interval must be zero or a positive number of milliseconds with no code ceiling." };
    return { allowed: true };
  }
  if (kind === "compute") {
    const expression = expressionof(options.expression);
    if (!expression) return { allowed: false, reason: `The expression step needs a reviewed expression with operands, an operator of the reviewed set (${expressionoperators.join(", ")}) and a result variable of a reviewed kind.` };
    const operatorcheck = validatexpressionoperators(expression);
    if (!operatorcheck.allowed) return operatorcheck;
    return { allowed: true };
  }
  if (kind === "extractvars") {
    const rule = regexruleof(options.rule);
    if (!rule) return { allowed: false, reason: "The variable extraction needs a reviewed regex rule with its pattern, flags and named capture groups." };
    const shapecheck = validateregexrule(rule.pattern);
    if (!shapecheck.allowed) return shapecheck;
    if (typeof options.text !== "string") return { allowed: false, reason: "The variable extraction needs the reviewed text the regex rule applies to." };
    return { allowed: true };
  }
  if (kind === "condition") {
    const condition = conditionof(options.condition);
    if (!condition) return { allowed: false, reason: "The condition step needs a reviewed boolean expression in its options." };
    const operatorcheck = validatexpressionoperators(condition.expression);
    if (!operatorcheck.allowed) return operatorcheck;
    return { allowed: true };
  }
  if (kind === "branch") {
    const branch = branchof(options.branch);
    if (!branch) return { allowed: false, reason: "The branch step needs reviewed unique paths with boolean match expressions and an else path in its options so every branch terminates." };
    for (const path of [...branch.paths, branch.else]) {
      if (path.when === void 0) continue;
      const operatorcheck = validatexpressionoperators(path.when);
      if (!operatorcheck.allowed) return operatorcheck;
    }
    return controlchildkinds(step);
  }
  if (kind === "loop") {
    const loop = loopof(options.loop);
    if (!loop) return { allowed: false, reason: "The loop step needs a reviewed list variable, distinct item and index variables, an optional positive safety bound and a non-empty body in its options; an absent bound keeps the documented default." };
    return controlchildkinds(step);
  }
  if (kind === "repeatuntil") {
    const repeat = repeatuntilof(options.repeatuntil);
    if (!repeat) return { allowed: false, reason: "The repeat until step needs a reviewed convergence expression, an optional positive safety bound and a non-empty body in its options." };
    const operatorcheck = validatexpressionoperators(repeat.until);
    if (!operatorcheck.allowed) return operatorcheck;
    return controlchildkinds(step);
  }
  if (kind === "whileloop") {
    const condition = whileof(options.while);
    if (!condition) return { allowed: false, reason: "The while step needs a reviewed condition, a mandatory positive safety bound and a non-empty body in its options; a while loop without a safety bound is refused." };
    const operatorcheck = validatexpressionoperators(condition.while);
    if (!operatorcheck.allowed) return operatorcheck;
    return controlchildkinds(step);
  }
  if (kind === "foreach") {
    const foreach = foreachof(options.foreach);
    if (!foreach) return { allowed: false, reason: "The foreach step needs a reviewed non-empty selector, distinct item and index variables and a non-empty body in its options." };
    return controlchildkinds(step);
  }
  if (kind === "parallel") {
    const parallel = parallelof(options.parallel);
    if (!parallel) return { allowed: false, reason: "The parallel step needs uniquely identified branches with bodies and a join policy of the first, last or fail strategy with cancel or continue on branch failure in its options." };
    return controlchildkinds(step);
  }
  if (kind === "trycatch") {
    const fragile = tryof(options.try);
    if (!fragile) return { allowed: false, reason: "The try step needs a fragile body, a catch handler and optional retry and timeout policies in its options: attempts stay user configured with no code ceiling, backoff is fixed or exponential and budgets are positive." };
    return controlchildkinds(step);
  }
  return { allowed: true };
}
function controlchildkinds(step) {
  const children = controlsteps({ id: step.id, kind: step.kind, label: step.summary, ...step.options !== void 0 ? { options: step.options } : {} });
  for (const child of children) {
    try {
      actionrisk(child.kind);
    } catch {
      return { allowed: false, reason: `The ${child.kind} step inside the control payload of the ${step.kind} step is not a reviewed action kind.` };
    }
  }
  return { allowed: true };
}
function validateregexrule(pattern) {
  try {
    new RegExp(pattern);
  } catch {
    return { allowed: false, reason: "The reviewed regex pattern does not compile." };
  }
  if (nestedquantifiershape(pattern) || /\(\)[+*{]/.test(pattern)) return { allowed: false, reason: "The reviewed regex pattern nests an unbounded quantifier inside a quantified group and is refused because adversarial text could explode the backtracking." };
  if (/\{\d+,\}/.test(pattern) && unboundedgrouprepeat(pattern)) return { allowed: false, reason: "The reviewed regex pattern repeats an unbounded group and is refused because adversarial text could explode the backtracking." };
  return { allowed: true };
}
function nestedquantifiershape(pattern) {
  let open = pattern.indexOf("(");
  while (open !== -1) {
    const close = pattern.indexOf(")", open);
    if (close === -1) return false;
    const after = pattern[close + 1] ?? "";
    if (after === "+" || after === "*" || after === "{") {
      let backslashes = 0;
      let position = close - 2;
      while (position > open && pattern[position] === "\\") {
        backslashes += 1;
        position -= 1;
      }
      const last = pattern[close - 1] ?? "";
      if (backslashes % 2 === 0 && (last === "+" || last === "*" || last === "}")) return true;
    }
    open = pattern.indexOf("(", open + 1);
  }
  return false;
}
function unboundedgrouprepeat(pattern) {
  let open = pattern.indexOf("(");
  while (open !== -1) {
    const close = pattern.indexOf(")", open);
    if (close === -1) return false;
    const after = pattern[close + 1] ?? "";
    if ((after === "+" || after === "*" || after === "{") && /\{\d+,\}/.test(pattern.slice(open + 1, close))) return true;
    open = pattern.indexOf("(", open + 1);
  }
  return false;
}
function validatexpressionoperators(expression) {
  const numeric = /* @__PURE__ */ new Set(["add", "subtract", "multiply", "divide", "modulo"]);
  const logic = /* @__PURE__ */ new Set(["and", "or", "not"]);
  const comparison = /* @__PURE__ */ new Set(["less", "greater", "lessequal", "greaterequal"]);
  const text = /* @__PURE__ */ new Set(["concat", "contains"]);
  const operator = expression.operator;
  if (numeric.has(operator)) {
    for (const operand of [expression.left, expression.right]) {
      if (operand === void 0) continue;
      if (operand.literal !== void 0 && typeof operand.literal === "boolean") return { allowed: false, reason: `The ${operator} operator needs numeric operands; boolean literals are refused.` };
    }
    if (expression.resultkind !== "number" && expression.resultkind !== "string") return { allowed: false, reason: `The ${operator} operator needs a number result kind.` };
  }
  if (logic.has(operator)) {
    for (const operand of [expression.left, expression.right]) {
      if (operand === void 0) continue;
      if (operand.literal !== void 0 && typeof operand.literal !== "boolean") return { allowed: false, reason: `The ${operator} operator needs boolean operands; non boolean literals are refused.` };
    }
    if (expression.resultkind !== "boolean") return { allowed: false, reason: `The ${operator} operator needs a boolean result kind.` };
    if (operator === "not" && expression.right !== void 0) return { allowed: false, reason: "The not operator takes one operand only." };
  }
  if (comparison.has(operator) && expression.resultkind !== "boolean") return { allowed: false, reason: `The ${operator} operator needs a boolean result kind.` };
  if (text.has(operator) && expression.resultkind !== "boolean" && expression.resultkind !== "string") return { allowed: false, reason: `The ${operator} operator needs a string or boolean result kind.` };
  if (operator === "contains" && expression.resultkind !== "boolean") return { allowed: false, reason: "The contains operator needs a boolean result kind." };
  if (operator === "length") {
    if (expression.right !== void 0) return { allowed: false, reason: "The length operator takes one operand only." };
    if (expression.resultkind !== "number") return { allowed: false, reason: "The length operator needs a number result kind." };
  }
  if ((operator === "equal" || operator === "notequal") && !(/* @__PURE__ */ new Set(["boolean", "string", "number"])).has(expression.resultkind)) return { allowed: false, reason: "The equality operator needs a primitive result kind." };
  return { allowed: true };
}
function workflowgate(input) {
  const gate = sessiongate({ session: input.session, tabid: input.tabid, origin: input.origin, now: input.now, action: "run the workflow step" });
  if (!gate.allowed) return gate;
  if (!input.plan || input.plan.state !== "approved") return { allowed: false, reason: "Workflow steps need the approved plan review before they run." };
  if (input.step.kind === "runworkflow") {
    let runoptions = {};
    try {
      runoptions = parseoptions(input.step);
    } catch {
      runoptions = {};
    }
    if (runoptions.reviewed !== true) return { allowed: false, reason: "Every real workflow run needs the explicit run review with its expanded step list shown before the first step executes." };
  }
  return { allowed: true };
}
function validatetriggergrammar(step, options) {
  const family = triggerfamilyof(step.kind);
  if (family === void 0) return { allowed: false, reason: "The trigger step is not a reviewed trigger kind." };
  if (typeof options.workflowid !== "string" || !options.workflowid.trim()) return { allowed: false, reason: "Every trigger rule needs the reviewed id of the composed workflow it launches." };
  if (options.reviewed !== true) return { allowed: false, reason: "Every trigger rule needs the explicit arm review with its match fields and bound workflow shown before it arms." };
  if (options.label !== void 0 && (typeof options.label !== "string" || !options.label.trim())) return { allowed: false, reason: "The reviewed trigger label must be a non-empty string." };
  if (options.cooldown !== void 0 && (typeof options.cooldown !== "number" || !Number.isFinite(options.cooldown) || options.cooldown <= 0)) return { allowed: false, reason: "The reviewed cooldown window must be a positive number of milliseconds with no code ceiling; the webhook and event families keep the documented default when the review configures none." };
  const payload = options.rule;
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return { allowed: false, reason: `The ${step.kind} step needs its reviewed rule payload in options.` };
  if (triggerpayloadof(family, payload) === void 0) {
    if (family === "visit") return { allowed: false, reason: "The visit rule needs a non-empty reviewed list of HTTPS origins it fires on." };
    if (family === "url") return { allowed: false, reason: "The url rule needs a reviewed HTTPS glob url pattern; `*` spans one path segment and `**` spans across segments." };
    if (family === "menu") return { allowed: false, reason: "The menu rule needs a reviewed non-empty context menu entry title." };
    if (family === "key") return { allowed: false, reason: "The keyboard shortcut rule needs a reviewed lowercase command name and an optional suggested key binding." };
    if (family === "cron") return { allowed: false, reason: "The cron rule needs a reviewed five field cron expression of minutes, hours, days, months and weekdays with named weekdays and months and an optional resolvable timezone; unparseable schedules are refused." };
    if (family === "interval") return { allowed: false, reason: "The interval rule needs a reviewed positive period in milliseconds with an optional zero or positive jitter window." };
    if (family === "urllist") return { allowed: false, reason: "The url list rule needs a reviewed non-empty list of HTTPS urls its workflow runs across." };
    if (family === "webhook") return { allowed: false, reason: `The webhook rule needs a reviewed shared secret of at least twenty four characters mixing letters and digits and a non-empty payload schema of named string, number or boolean fields.` };
    if (family === "event") return { allowed: false, reason: `The page event rule needs a reviewed non-empty list of event names of the observed event catalog: ${triggereventcatalog.join(", ")}.` };
    return { allowed: false, reason: "The trigger rule payload does not follow its family grammar." };
  }
  if (family === "cron") {
    const candidate = payload;
    if (typeof candidate.cron === "string" && cronparse(candidate.cron) === void 0) return { allowed: false, reason: "The cron expression does not parse as a five field schedule and is refused." };
  }
  if (family === "webhook") {
    const candidate = payload;
    if (typeof candidate.secret === "string" && !webhooksecretok(candidate.secret)) return { allowed: false, reason: "The webhook shared secret must hold at least twenty four characters mixing letters and digits; the entropy floor is a floor, never a cap." };
  }
  const armed = armrule({ family, workflowid: options.workflowid, ...typeof options.label === "string" && options.label.trim() ? { label: options.label } : {}, payload, ...typeof options.cooldown === "number" ? { cooldown: options.cooldown } : {}, now: 0 });
  if (armed === void 0) return { allowed: false, reason: "The trigger rule payload does not arm as a reviewed rule." };
  return { allowed: true };
}
function triggergate(input) {
  const gate = sessiongate({ session: input.session, tabid: input.tabid, origin: input.origin, now: input.now, action: "arm the trigger rule" });
  if (!gate.allowed) return gate;
  if (!input.plan || input.plan.state !== "approved") return { allowed: false, reason: "Trigger rules need the approved plan review before they arm." };
  let triggeroptions = {};
  try {
    triggeroptions = parseoptions(input.step);
  } catch {
    triggeroptions = {};
  }
  if (triggeroptions.reviewed !== true) return { allowed: false, reason: "Every trigger rule needs the explicit arm review with its match fields and bound workflow shown before it arms." };
  return { allowed: true };
}
function triggerorigins(step) {
  let triggeroptions = {};
  try {
    triggeroptions = parseoptions(step);
  } catch {
    return [];
  }
  const family = triggerfamilyof(step.kind);
  if (family === void 0) return [];
  const armed = armrule({ family, workflowid: typeof triggeroptions.workflowid === "string" ? triggeroptions.workflowid : "", payload: triggeroptions.rule, ...typeof triggeroptions.cooldown === "number" ? { cooldown: triggeroptions.cooldown } : {}, now: 0 });
  if (armed === void 0) return [];
  const origins = [];
  for (const origin of armed.origins ?? []) origins.push(origin);
  if (armed.pattern !== void 0) {
    try {
      origins.push(new URL(armed.pattern).origin);
    } catch {
    }
  }
  for (const url of armed.urls ?? []) {
    try {
      origins.push(new URL(url).origin);
    } catch {
    }
  }
  return [...new Set(origins)];
}
function dryrunprojection(step) {
  if (iscontrolflowkind(step.kind)) {
    for (const child of controlsteps(step)) {
      const childrisk = resolvedrisk({ id: child.id, kind: child.kind, summary: child.label, risk: "read", ...child.target !== void 0 ? { target: child.target } : {}, ...child.value !== void 0 ? { value: child.value } : {}, ...child.options !== void 0 ? { options: child.options } : {} });
      if (childrisk !== "read") return void 0;
    }
    if (step.kind === "condition") return "The condition step would evaluate its reviewed expression over the extracted values with no page side effect.";
    if (step.kind === "branch") return "The branch step would choose one reviewed path by page state and only the chosen path would run.";
    if (step.kind === "loop") return "The loop step would iterate its reviewed list binding the item and index variables per iteration inside the safety bound.";
    if (step.kind === "repeatuntil") return "The repeat until step would rerun its body until the convergence expression holds inside the safety bound.";
    if (step.kind === "whileloop") return "The while step would loop while its condition holds inside the reviewed safety bound.";
    if (step.kind === "foreach") return "The foreach step would iterate the elements of its reviewed selector binding the item and index variables per iteration.";
    if (step.kind === "parallel") return "The parallel step would run its branches concurrently and join their outcomes under the reviewed strategy.";
    return "The try step would run its fragile body and only the catch handler on failure.";
  }
  const risk = resolvedrisk({ id: step.id, kind: step.kind, summary: step.label, risk: "read", ...step.target !== void 0 ? { target: step.target } : {}, ...step.value !== void 0 ? { value: step.value } : {}, ...step.options !== void 0 ? { options: step.options } : {} });
  if (risk !== "read") return void 0;
  if (step.kind === "delay") return `The delay step would sleep its reviewed base inside the jitter window.`;
  if (step.kind === "waitelement") return `The element wait step would poll ${step.target ?? "the reviewed selector"} until appearance or the reviewed timeout.`;
  if (step.kind === "compute") return `The compute step would evaluate its reviewed expression into the result variable.`;
  if (step.kind === "extractvars") return `The variable extraction step would apply its reviewed regex rule and store the named captures.`;
  return `The ${step.kind} step would run read only and mutate nothing.`;
}
function permissionstatevalid(state) {
  if (!permissionstates.includes(state)) return { allowed: false, reason: `The reviewed permission state must be one of ${permissionstates.join(", ")}.` };
  return { allowed: true };
}
function validatecdpgrammar(step, options) {
  const kind = step.kind;
  if (kind === "attachcdp") {
    if (!Array.isArray(options.domains) || options.domains.length === 0 || !options.domains.every((domain) => typeof domain === "string" && cdpdomains.includes(domain))) return { allowed: false, reason: `The attach needs a non-empty enabled domain list of the reviewed domain grammar: ${cdpdomains.join(", ")}.` };
    if (teardownplanof(options.teardown) === void 0) return { allowed: false, reason: "Every attach needs a reviewed teardown plan with its revert steps and resume policy before approval." };
    if (options.allowlist !== void 0) {
      const allowlist = cdpallowlistof(options.allowlist);
      if (!allowlist || !allowlist.domains.every((domain) => options.domains.includes(domain))) return { allowed: false, reason: "The reviewed method allowlist must stay inside the enabled domains of the attach." };
    }
    const budgetcheck2 = debugwaitbudgetallowed(typeof options.wait === "number" ? options.wait : void 0, void 0);
    if (!budgetcheck2.allowed) return budgetcheck2;
    return { allowed: true };
  }
  if (kind === "detachcdp") return { allowed: true };
  if (kind === "cdpcmd") {
    const command = options.command && typeof options.command === "object" && !Array.isArray(options.command) ? options.command : void 0;
    if (!command || typeof command.method !== "string" || methoddomain(command.method) === void 0) return { allowed: false, reason: "The raw command needs a reviewed method of the Domain.method form." };
    if (command.params !== void 0 && (typeof command.params !== "object" || Array.isArray(command.params))) return { allowed: false, reason: "The raw command params must be a JSON object." };
    if (command.resultpath !== void 0 && typeof command.resultpath !== "string") return { allowed: false, reason: "The reviewed result path must be a dotted path string." };
    return { allowed: true };
  }
  if (kind === "watchcdp") {
    if (!Array.isArray(options.events) || options.events.length === 0 || !options.events.every((rule) => cdpeventruleof(rule) !== void 0)) return { allowed: false, reason: "The event watch needs a non-empty reviewed list of domain event rules of the reviewed domain grammar." };
    let watchwindow;
    if (options.watch !== void 0) {
      const watch = options.watch;
      if (!watch || typeof watch !== "object" || Array.isArray(watch)) return { allowed: false, reason: "The reviewed event watch window must be an object." };
      const reviewed = watch;
      if (reviewed.window !== void 0) {
        if (typeof reviewed.window !== "number" || !Number.isFinite(reviewed.window) || reviewed.window < 0) return { allowed: false, reason: "The reviewed event watch window must be zero or a positive number of milliseconds." };
        watchwindow = reviewed.window;
      }
    }
    if (watchwindow === void 0) return { allowed: false, reason: "The event watch needs a reviewed lifetime window before any domain event is observed." };
    const budgetcheck2 = debugwaitbudgetallowed(watchwindow, typeof options.wait === "number" ? options.wait : void 0);
    if (!budgetcheck2.allowed) return budgetcheck2;
    return { allowed: true };
  }
  if (kind === "setbreakpoint") {
    const breakpoint = breakpointinputof(options.breakpoint);
    if (!breakpoint) return { allowed: false, reason: "The breakpoint needs a reviewed script url and a zero based line." };
    if (!ishttpsurl(breakpoint.url)) return { allowed: false, reason: "The breakpoint script url must be a reviewed HTTPS url." };
    if (breakpoint.condition !== void 0) {
      const conditioncheck = validatebreakpointcondition(breakpoint.condition);
      if (!conditioncheck.allowed) return conditioncheck;
    }
    return { allowed: true };
  }
  if (kind === "stepcode") {
    if (stepmodeof(options.mode) === void 0) return { allowed: false, reason: "The step code mode must be one of stepover, stepinto, stepout or resume." };
    return { allowed: true };
  }
  if (kind === "watchexpr") {
    if (watchexpressionof(options.expression) === void 0) return { allowed: false, reason: "The watch expression needs the reviewed expression text." };
    if (options.reviewed !== true) return { allowed: false, reason: "Watch expressions must be reviewed before evaluation; set the explicit reviewed flag on the step." };
    return { allowed: true };
  }
  if (kind === "overridescript") {
    const override = overrideinputof(options.override);
    if (!override) return { allowed: false, reason: "The script override needs a reviewed url pattern and its full fixture source." };
    if (patternorigin(override.urlpattern) === void 0) return { allowed: false, reason: "Script overrides without a named https origin pattern are refused." };
    if (options.reviewed !== true) return { allowed: false, reason: "The full fixture source must be reviewed before the script override runs; set the explicit reviewed flag on the step." };
    return { allowed: true };
  }
  return { allowed: true };
}
function validateprofilegrammar(step, options) {
  const kind = step.kind;
  if (kind === "measureflow") {
    if (flowspecof(options.flow) === void 0) return { allowed: false, reason: `The flow measurement needs a reviewed flow spec with its mark prefix, step window and metric list of the reviewed metric set: navigation, paint, lcp, fid, interaction, blocking.` };
    const watch = options.watch && typeof options.watch === "object" && !Array.isArray(options.watch) ? options.watch : {};
    if (typeof watch.window !== "number" || !Number.isFinite(watch.window) || watch.window < 0) return { allowed: false, reason: "The flow measurement needs a reviewed watch window of zero or more milliseconds." };
    const budgetcheck2 = debugwaitbudgetallowed(watch.window, typeof options.wait === "number" ? options.wait : void 0);
    if (!budgetcheck2.allowed) return budgetcheck2;
    return { allowed: true };
  }
  if (kind === "heapshot") {
    const heap = options.heap && typeof options.heap === "object" && !Array.isArray(options.heap) ? options.heap : {};
    if (heap.interval !== void 0 && (typeof heap.interval !== "number" || !Number.isFinite(heap.interval) || heap.interval < 0)) return { allowed: false, reason: "The reviewed heap snapshot interval must be zero or a positive number of milliseconds and stays a user choice with no code ceiling." };
    return { allowed: true };
  }
  if (kind === "trackmemory") {
    const growth = options.growth && typeof options.growth === "object" && !Array.isArray(options.growth) ? options.growth : void 0;
    if (!growth || typeof growth.slope !== "number" || !Number.isFinite(growth.slope) || growth.slope < 0) return { allowed: false, reason: "Memory growth tracking needs the reviewed slope in bytes per millisecond before any sample is flagged." };
    if (growth.interval !== void 0 && (typeof growth.interval !== "number" || !Number.isFinite(growth.interval) || growth.interval < 0)) return { allowed: false, reason: "The reviewed sampling interval must be zero or a positive number of milliseconds and stays a user choice with no code ceiling." };
    return { allowed: true };
  }
  if (kind === "profilecpu") {
    const profile = options.profile && typeof options.profile === "object" && !Array.isArray(options.profile) ? options.profile : void 0;
    if (!profile || typeof profile.duration !== "number" || !Number.isFinite(profile.duration) || profile.duration < 0) return { allowed: false, reason: "The cpu profile needs a reviewed duration of zero or more milliseconds." };
    const budgetcheck2 = debugwaitbudgetallowed(profile.duration, typeof options.wait === "number" ? options.wait : void 0);
    if (!budgetcheck2.allowed) return budgetcheck2;
    return { allowed: true };
  }
  if (kind === "watchshifts") {
    const watch = options.watch && typeof options.watch === "object" && !Array.isArray(options.watch) ? options.watch : {};
    if (typeof watch.window !== "number" || !Number.isFinite(watch.window) || watch.window < 0) return { allowed: false, reason: "The layout shift watch needs a reviewed observation window of zero or more milliseconds; the window stays a user choice with no code ceiling." };
    if (options.threshold !== void 0 && (typeof options.threshold !== "number" || !Number.isFinite(options.threshold) || options.threshold < 0)) return { allowed: false, reason: "The reviewed shift score threshold must be zero or a positive number." };
    const budgetcheck2 = debugwaitbudgetallowed(watch.window, typeof options.wait === "number" ? options.wait : void 0);
    if (!budgetcheck2.allowed) return budgetcheck2;
    return { allowed: true };
  }
  if (kind === "traceload") {
    const trace = options.trace && typeof options.trace === "object" && !Array.isArray(options.trace) ? options.trace : void 0;
    if (!trace || !Array.isArray(trace.categories) || trace.categories.length === 0 || !trace.categories.every((category) => typeof category === "string" && tracecategories.includes(category))) return { allowed: false, reason: `The trace record needs a non-empty reviewed category list of the reviewed category grammar: ${tracecategories.join(", ")}.` };
    if (typeof trace.window !== "number" || !Number.isFinite(trace.window) || trace.window < 0) return { allowed: false, reason: "The trace record needs a reviewed window of zero or more milliseconds and stops at the reviewed window end." };
    if (trace.exporttarget !== void 0 && trace.exporttarget !== "memory" && trace.exporttarget !== "download") return { allowed: false, reason: "The trace export target must be memory or download." };
    const budgetcheck2 = debugwaitbudgetallowed(trace.window, typeof options.wait === "number" ? options.wait : void 0);
    if (!budgetcheck2.allowed) return budgetcheck2;
    return { allowed: true };
  }
  if (kind === "annotatetrace" || kind === "replaytrace") {
    const trace = options.trace && typeof options.trace === "object" && !Array.isArray(options.trace) ? options.trace : void 0;
    if (!trace || typeof trace.traceid !== "string" || !trace.traceid.trim()) return { allowed: false, reason: `The ${kind === "annotatetrace" ? "trace annotation" : "trace replay"} needs the stored trace id of a recorded trace.` };
    if (kind === "replaytrace") return { allowed: true };
    if (!Array.isArray(options.annotations) || options.annotations.length === 0 || !options.annotations.every((annotation) => annotationof(annotation) !== void 0)) return { allowed: false, reason: "Exported traces carry their step annotations: every annotation needs a step id, a label and an optional offset from the trace start." };
    return { allowed: true };
  }
  if (kind === "capturesourcemaps") {
    if (options.scripts !== void 0) {
      if (!Array.isArray(options.scripts) || options.scripts.length === 0 || !options.scripts.every((url) => typeof url === "string" && ishttpsurl(url))) return { allowed: false, reason: "The source map capture scripts must be a non-empty list of reviewed HTTPS urls." };
    }
    return { allowed: true };
  }
  return { allowed: true };
}
function planallowlist(steps) {
  const attach = steps.find((step) => step.kind === "attachcdp");
  if (!attach) return void 0;
  let options = {};
  try {
    options = parseoptions(attach);
  } catch {
    options = {};
  }
  const domains = Array.isArray(options.domains) ? options.domains.filter((domain) => typeof domain === "string" && cdpdomains.includes(domain)) : [];
  if (domains.length === 0) return void 0;
  const gated = cdpallowlistof(options.allowlist);
  return { domains, ...gated?.methods !== void 0 ? { methods: gated.methods } : {} };
}
function controltarget(step) {
  let options = {};
  try {
    options = parseoptions(step);
  } catch {
    options = {};
  }
  for (const key of ["form", "upload"]) {
    const value = options[key];
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const url = value.url;
      if (typeof url === "string" && url.trim()) return url.trim();
    }
  }
  if (step.kind === "authflow") {
    const flow = oauthflowof(options.oauth);
    if (flow) return flow.tokenurl;
  }
  return void 0;
}
function sockettarget(step) {
  let options = {};
  try {
    options = parseoptions(step);
  } catch {
    options = {};
  }
  for (const key of ["socket", "subscription", "poll"]) {
    const value = options[key];
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const url = value.url;
      if (typeof url === "string" && url.trim()) return url.trim();
    }
  }
  return void 0;
}
function mediagate(session, tabid, origin, now) {
  if (!session || session.stoppedat) return { allowed: false, reason: "No active browser session exists for the media capture." };
  if (session.expiresat <= now) return { allowed: false, reason: "The browser session has expired and cannot capture media." };
  if (session.pausedat) return { allowed: false, reason: "The browser session is paused and cannot capture media." };
  if (session.tabid !== tabid) return { allowed: false, reason: `The media capture needs the active tab grant of session tab ${session.tabid} and refuses tab ${tabid}.` };
  if (!origingranted(session, origin)) return { allowed: false, reason: `The media capture of ${origin} needs the session origin grants first.` };
  return { allowed: true };
}
function recordingconsentgranted(step) {
  let options = {};
  try {
    options = parseoptions(step);
  } catch {
    options = {};
  }
  const consentref = options.consentref;
  if (typeof consentref !== "string" || !consentref.trim()) return { allowed: false, reason: "A recording of user activity requires a reviewed consent ref in options before it starts." };
  return { allowed: true };
}
function recordingwindow(settings) {
  const window = settings?.recordingwindow;
  return typeof window === "number" && Number.isFinite(window) && window > 0 ? window : void 0;
}
function lapsebudgetallowed(interval, duration, wait) {
  if (!(interval > 0)) return { allowed: false, reason: "The reviewed lapse interval must be a positive number of milliseconds." };
  if (!(duration > 0)) return { allowed: false, reason: "The reviewed lapse duration must be a positive number of milliseconds." };
  if (wait !== void 0 && !(wait >= 0)) return { allowed: false, reason: "The reviewed wait budget must be zero or a positive number of milliseconds." };
  if (wait !== void 0 && duration > wait) return { allowed: false, reason: `The lapse duration of ${duration} milliseconds exceeds the reviewed wait budget of ${wait} milliseconds; review a wider budget or a shorter duration.` };
  return { allowed: true };
}
function validatemediagrammar(step, options) {
  const kind = step.kind;
  if (kind === "capturepdf") {
    const pdf = options.pdf;
    if (pdf !== void 0) {
      if (!pdf || typeof pdf !== "object" || Array.isArray(pdf)) return { allowed: false, reason: "The reviewed pdf options must be an object in options.pdf." };
      const pdfoptions = pdf;
      if (pdfoptions.paperwidth !== void 0 && (typeof pdfoptions.paperwidth !== "number" || !Number.isFinite(pdfoptions.paperwidth) || pdfoptions.paperwidth <= 0)) return { allowed: false, reason: "The reviewed pdf paper width must be a positive number of inches with no code cap." };
      if (pdfoptions.paperheight !== void 0 && (typeof pdfoptions.paperheight !== "number" || !Number.isFinite(pdfoptions.paperheight) || pdfoptions.paperheight <= 0)) return { allowed: false, reason: "The reviewed pdf paper height must be a positive number of inches with no code cap." };
      if (pdfoptions.margins !== void 0) {
        const margins = pdfoptions.margins;
        if (!margins || typeof margins !== "object" || Array.isArray(margins)) return { allowed: false, reason: "The reviewed pdf margins must be an object with top, right, bottom and left inches." };
        for (const side of ["top", "right", "bottom", "left"]) {
          const value = margins[side];
          if (value === void 0) continue;
          if (typeof value !== "number" || !Number.isFinite(value) || value < 0) return { allowed: false, reason: `The reviewed pdf ${side} margin must be zero or a positive number of inches; negative margins are refused.` };
        }
      }
      if (pdfoptions.scale !== void 0 && (typeof pdfoptions.scale !== "number" || !Number.isFinite(pdfoptions.scale) || pdfoptions.scale <= 0)) return { allowed: false, reason: "The reviewed pdf scale must be a positive number with no code cap." };
      if (pdfoptions.landscape !== void 0 && typeof pdfoptions.landscape !== "boolean") return { allowed: false, reason: "The reviewed pdf landscape flag must be a boolean." };
      if (pdfoptions.paginate !== void 0 && typeof pdfoptions.paginate !== "boolean") return { allowed: false, reason: "The reviewed pdf paginate flag must be a boolean." };
    }
    if (options.breakpoints !== void 0 && (!Array.isArray(options.breakpoints) || options.breakpoints.length === 0 || !options.breakpoints.every((item) => isnonempty(item)))) return { allowed: false, reason: "The reviewed pdf break points must be a non-empty list of selectors when present." };
    if (options.exporttarget !== void 0 && options.exporttarget !== "memory" && options.exporttarget !== "download") return { allowed: false, reason: "The reviewed pdf export target must be memory or download; pdf documents do not route to the clipboard." };
    if (options.name !== void 0 && !isnonempty(options.name)) return { allowed: false, reason: "The reviewed pdf artifact name must be a non-empty string." };
  }
  if (kind === "recordscreen" || kind === "captureaudio") {
    const recording = options.recording;
    if (recording !== void 0) {
      if (!recording || typeof recording !== "object" || Array.isArray(recording)) return { allowed: false, reason: "The reviewed recording options must be an object in options.recording." };
      const recordoptions = recording;
      if (recordoptions.scope !== void 0 && recordoptions.scope !== "tab" && recordoptions.scope !== "run") return { allowed: false, reason: "The reviewed recording scope must be tab or run." };
      if (recordoptions.fps !== void 0 && (typeof recordoptions.fps !== "number" || !Number.isFinite(recordoptions.fps) || recordoptions.fps <= 0)) return { allowed: false, reason: "The reviewed recording fps must be a positive number with no code ceiling." };
      if (recordoptions.bitrate !== void 0 && (typeof recordoptions.bitrate !== "number" || !Number.isFinite(recordoptions.bitrate) || recordoptions.bitrate <= 0)) return { allowed: false, reason: "The reviewed recording bitrate must be a positive number with no code ceiling." };
      if (recordoptions.audio !== void 0 && typeof recordoptions.audio !== "boolean") return { allowed: false, reason: "The reviewed recording audio flag must be a boolean." };
    }
    if (options.duration !== void 0 && (typeof options.duration !== "number" || !Number.isFinite(options.duration) || options.duration <= 0)) return { allowed: false, reason: "The reviewed recording duration must be a positive number of milliseconds with no code ceiling." };
    const consent = recordingconsentgranted(step);
    if (!consent.allowed) return consent;
  }
  if (kind === "captureframe") {
    if (options.timestamp !== void 0 && (typeof options.timestamp !== "number" || !Number.isFinite(options.timestamp) || options.timestamp < 0)) return { allowed: false, reason: "The reviewed frame timestamp must be zero or a positive number of seconds." };
    if (options.poster !== void 0 && typeof options.poster !== "boolean") return { allowed: false, reason: "The reviewed poster flag must be a boolean." };
    const capturecheck = validatecaptureoptions(options.capture);
    if (!capturecheck.allowed) return capturecheck;
  }
  if (kind === "downloadimages") {
    const filter = options.imagefilter;
    if (!filter || typeof filter !== "object" || Array.isArray(filter)) return { allowed: false, reason: "A reviewed imagefilter is required in options before any image downloads." };
    const imagefilter = filter;
    if (imagefilter.selector !== void 0 && !isnonempty(imagefilter.selector)) return { allowed: false, reason: "The reviewed imagefilter selector must be a non-empty selector from the reviewed selector grammar." };
    if (imagefilter.minwidth !== void 0 && (typeof imagefilter.minwidth !== "number" || !Number.isFinite(imagefilter.minwidth) || imagefilter.minwidth < 0)) return { allowed: false, reason: "The reviewed imagefilter minimum width must be zero or a positive number of pixels." };
    if (imagefilter.minheight !== void 0 && (typeof imagefilter.minheight !== "number" || !Number.isFinite(imagefilter.minheight) || imagefilter.minheight < 0)) return { allowed: false, reason: "The reviewed imagefilter minimum height must be zero or a positive number of pixels." };
    if (imagefilter.formats !== void 0 && (!Array.isArray(imagefilter.formats) || imagefilter.formats.length === 0 || !imagefilter.formats.every((item) => isnonempty(item)))) return { allowed: false, reason: "The reviewed imagefilter format list must be a non-empty list of mime or extension patterns when present." };
    if (options.naming !== void 0) {
      const namingcheck = validatecapturenaming(options.naming);
      if (!namingcheck.allowed) return namingcheck;
    }
  }
  if (kind === "shotcanvas") {
    const capturecheck = validatecaptureoptions(options.capture);
    if (!capturecheck.allowed) return capturecheck;
  }
  if (kind === "probestream" && options.selector !== void 0 && !isnonempty(options.selector)) return { allowed: false, reason: "The reviewed stream probe scope selector must be a non-empty string." };
  if (kind === "timelapse") {
    const lapse = options.lapse;
    if (!lapse || typeof lapse !== "object" || Array.isArray(lapse)) return { allowed: false, reason: "A reviewed lapse plan with interval, duration and format is required in options." };
    const plan = lapse;
    if (typeof plan.interval !== "number" || !Number.isFinite(plan.interval) || plan.interval <= 0) return { allowed: false, reason: "The reviewed lapse interval must be a positive number of milliseconds with no code ceiling." };
    if (typeof plan.duration !== "number" || !Number.isFinite(plan.duration) || plan.duration <= 0) return { allowed: false, reason: "The reviewed lapse duration must be a positive number of milliseconds with no code ceiling." };
    if (plan.format !== void 0 && plan.format !== "png" && plan.format !== "jpeg" && plan.format !== "webp") return { allowed: false, reason: "The reviewed lapse format must be png, jpeg or webp." };
    const budget = lapsebudgetallowed(plan.interval, plan.duration, typeof options.wait === "number" ? options.wait : void 0);
    if (!budget.allowed) return budget;
    const capturecheck = validatecaptureoptions(options.capture);
    if (!capturecheck.allowed) return capturecheck;
  }
  if (kind === "convertimage" || kind === "makethumbs") {
    const single = options.capture;
    const list = options.captures;
    const hasone = isnonempty(single);
    const haslist = Array.isArray(list) && list.length > 0 && list.every((item) => isnonempty(item));
    if (!hasone && !haslist) return { allowed: false, reason: "A reviewed capture id or a reviewed non-empty capture id list is required in options." };
    if (hasone && haslist) return { allowed: false, reason: "The reviewed step needs one capture id or a capture id list, not both." };
  }
  if (kind === "convertimage") {
    const convert = options.convert;
    if (!convert || typeof convert !== "object" || Array.isArray(convert)) return { allowed: false, reason: "A reviewed convert directive with a target format is required in options." };
    const directive = convert;
    if (directive.target !== "png" && directive.target !== "jpeg" && directive.target !== "webp") return { allowed: false, reason: "The reviewed conversion target must be png, jpeg or webp." };
    if (directive.source !== void 0 && directive.source !== "png" && directive.source !== "jpeg" && directive.source !== "webp") return { allowed: false, reason: "The reviewed conversion source must be png, jpeg or webp." };
    if (directive.quality !== void 0 && (typeof directive.quality !== "number" || !Number.isFinite(directive.quality) || directive.quality < 0 || directive.quality > 100)) return { allowed: false, reason: "The reviewed conversion quality must stay between zero and one hundred with no code cap inside that range." };
  }
  if (kind === "makethumbs") {
    const thumb = options.thumb;
    if (!thumb || typeof thumb !== "object" || Array.isArray(thumb)) return { allowed: false, reason: "A reviewed thumb directive with size, fit and suffix is required in options." };
    const directive = thumb;
    if (typeof directive.size !== "number" || !Number.isFinite(directive.size) || directive.size <= 0) return { allowed: false, reason: "The reviewed thumbnail size must be a positive number of pixels with no fixed set." };
    if (directive.fit !== "cover" && directive.fit !== "contain") return { allowed: false, reason: "The reviewed thumbnail fit must be cover or contain." };
    if (!isnonempty(directive.suffix)) return { allowed: false, reason: "The reviewed thumbnail naming suffix must be a non-empty string." };
  }
  return { allowed: true };
}
function validatestep(step, origin) {
  if (!allowedactions.has(step.kind)) return { allowed: false, reason: "Unsupported action kind." };
  if (!step.summary.trim()) return { allowed: false, reason: "A human-readable action summary is required." };
  let options;
  try {
    options = parseoptions(step);
  } catch {
    return { allowed: false, reason: "Step options must be a JSON object." };
  }
  const hastargetref = options.targetref !== void 0;
  if (targetactions.has(step.kind) && !step.target?.trim() && !hastargetref) return { allowed: false, reason: "A page target is required." };
  if (valueactions.has(step.kind) && !step.value?.trim()) return { allowed: false, reason: "A reviewed value is required." };
  if (step.kind === "select" && !step.value?.trim()) return { allowed: false, reason: "A reviewed option value is required." };
  if (step.kind === "navigate" && !step.value) return { allowed: false, reason: "A navigation URL is required." };
  if (hastargetref) {
    const reference = validatetargetref(options.targetref);
    if (!reference.allowed) return reference;
  }
  if (step.kind === "wait") {
    try {
      waitduration(step);
    } catch {
      return { allowed: false, reason: "Wait duration must be zero or a positive number of milliseconds." };
    }
  }
  if (step.kind === "navigate") {
    try {
      if (new URL(step.value ?? "").origin !== origin) return { allowed: false, reason: "Navigation must remain within the approved origin." };
    } catch {
      return { allowed: false, reason: "Navigation URL is invalid." };
    }
  }
  if (step.kind === "tabcreate" || step.kind === "windowcreate" || step.kind === "downloadfile") {
    try {
      const url = new URL(step.value ?? "");
      if (url.protocol !== "https:") return { allowed: false, reason: "The reviewed URL must use HTTPS." };
    } catch {
      return { allowed: false, reason: "The reviewed URL is invalid." };
    }
  }
  if (step.kind === "tabactivate" || step.kind === "tabclose" || step.kind === "tabreload" || step.kind === "windowclose" || step.kind === "windowresize") {
    if (!isnumericid(step.value)) return { allowed: false, reason: "A numeric browser id is required." };
  }
  if (step.kind === "zoomset") {
    const zoom = Number(step.value);
    if (!Number.isFinite(zoom) || zoom <= 0) return { allowed: false, reason: "The reviewed zoom must be a positive number." };
  }
  if (step.kind === "setattribute" || step.kind === "writestorage") {
    const keyname = step.kind === "setattribute" ? "name" : "key";
    if (typeof options[keyname] !== "string" || !options[keyname].trim()) return { allowed: false, reason: `A reviewed ${keyname} is required in options.` };
    if (typeof options.value !== "string") return { allowed: false, reason: "A reviewed value is required in options." };
  }
  if (step.kind === "windowresize") {
    if (typeof options.width !== "number" || typeof options.height !== "number" || !Number.isFinite(options.width) || !Number.isFinite(options.height)) return { allowed: false, reason: "Reviewed width and height numbers are required in options." };
  }
  if ((step.kind === "scrollpage" || step.kind === "scrollby") && (!numericoption(options, "x") || !numericoption(options, "y"))) return { allowed: false, reason: "Scroll amounts must be numbers in options." };
  if (step.kind === "waitfor" && options.timeout !== void 0 && (typeof options.timeout !== "number" || options.timeout < 0)) return { allowed: false, reason: "The waitfor timeout must be zero or a positive number of milliseconds." };
  if (step.kind === "movepointer") {
    const path = options.pointpath;
    if (!path || typeof path !== "object" || Array.isArray(path)) return { allowed: false, reason: "A reviewed pointpath with start and end points is required in options." };
    const points = path;
    if (!ispoint(points.start) || !ispoint(points.end)) return { allowed: false, reason: "The reviewed pointpath needs numeric start and end points." };
    if (points.waypoints !== void 0 && (!Array.isArray(points.waypoints) || !points.waypoints.every((waypoint) => ispoint(waypoint)))) return { allowed: false, reason: "The reviewed pointpath waypoints must be numeric points." };
    if (!nonnegativeoption(points, "duration")) return { allowed: false, reason: "The reviewed pointpath duration must be zero or a positive number of milliseconds." };
    const speed = options.speedprofile;
    if (speed !== void 0) {
      if (!speed || typeof speed !== "object" || Array.isArray(speed)) return { allowed: false, reason: "The reviewed speed profile must be an object." };
      const profile = speed;
      if (profile.easing !== void 0 && profile.easing !== "linear" && profile.easing !== "easeinout") return { allowed: false, reason: "The reviewed easing must be linear or easeinout." };
      if (!nonnegativeoption(profile, "peak")) return { allowed: false, reason: "The reviewed peak velocity must be zero or a positive number." };
      if (!nonnegativeoption(profile, "jitter")) return { allowed: false, reason: "The reviewed jitter window must be zero or a positive number of milliseconds." };
    }
  }
  if (step.kind === "clickpoint" && (!hastargetref || options.targetref.mode !== "point")) return { allowed: false, reason: "A reviewed point target reference is required in options." };
  if (step.kind === "clicktext" && (!hastargetref || options.targetref.mode !== "text")) return { allowed: false, reason: "A reviewed text target reference is required in options." };
  if (step.kind === "clickaria" && (!hastargetref || options.targetref.mode !== "aria")) return { allowed: false, reason: "A reviewed aria target reference is required in options." };
  if (step.kind === "clickname" && (!hastargetref || options.targetref.mode !== "name")) return { allowed: false, reason: "A reviewed name target reference is required in options." };
  if (step.kind === "resolvexpath" && (!hastargetref || options.targetref.mode !== "xpath")) return { allowed: false, reason: "A reviewed xpath target reference is required in options." };
  if (step.kind === "typetime" && options.delay !== void 0 && (typeof options.delay !== "number" || !Number.isFinite(options.delay) || options.delay < 0)) return { allowed: false, reason: "The reviewed per keystroke delay must be zero or a positive number of milliseconds." };
  if (step.kind === "submitsearch") {
    if (!isnonempty(options.results)) return { allowed: false, reason: "A reviewed results region selector is required in options." };
    if (options.timeout !== void 0 && (typeof options.timeout !== "number" || !Number.isFinite(options.timeout) || options.timeout < 0)) return { allowed: false, reason: "The submitsearch timeout must be zero or a positive number of milliseconds." };
  }
  if (step.kind === "selectmulti") {
    const values = options.values;
    if (!Array.isArray(values) || values.length === 0 || !values.every((value) => isnonempty(value))) return { allowed: false, reason: "A reviewed list of option values is required in options." };
  }
  if (step.kind === "setslider") {
    const slider = Number(step.value);
    if (!Number.isFinite(slider)) return { allowed: false, reason: "The reviewed slider value must be a number." };
  }
  if (step.kind === "setdate" && !/^\d{4}-\d{2}-\d{2}$/.test(step.value ?? "")) return { allowed: false, reason: "The reviewed date must use the yyyy-mm-dd form." };
  if (step.kind === "setcolor" && !/^#[0-9a-fA-F]{6}$/.test(step.value ?? "")) return { allowed: false, reason: "The reviewed color must use the #rrggbb form." };
  if (step.kind === "keyhold" && options.holdid !== void 0 && !isnonempty(options.holdid)) return { allowed: false, reason: "The reviewed hold id must be a non-empty string." };
  if (step.kind === "dismissdialog") {
    const accept = options.accept;
    const answer = options.answer;
    if (accept === void 0 && !isnonempty(answer)) return { allowed: false, reason: "A reviewed accept flag or prompt answer is required in options." };
    if (accept !== void 0 && typeof accept !== "boolean") return { allowed: false, reason: "The reviewed dialog accept flag must be a boolean." };
    if (answer !== void 0 && !isnonempty(answer)) return { allowed: false, reason: "The reviewed prompt answer must be a non-empty string." };
  }
  if (step.kind === "pierceshadow" && options.shadow !== void 0) {
    if (!Array.isArray(options.shadow) || !options.shadow.every((item) => isnonempty(item))) return { allowed: false, reason: "The reviewed shadow path must be a list of non-empty selectors." };
  }
  if (step.kind === "enterframe") {
    const path = options.framepath;
    if (!Array.isArray(path) || path.length === 0 || !path.every((item) => typeof item === "number" && Number.isInteger(item) && item >= 0)) return { allowed: false, reason: "A reviewed frame path of frame indexes is required in options." };
    return validateinnerstep(options, origin);
  }
  if (step.kind === "retryaction") {
    const inner = validateinnerstep(options, origin);
    if (!inner.allowed) return inner;
    const rule = options.retryrule;
    if (!rule || typeof rule !== "object" || Array.isArray(rule)) return { allowed: false, reason: "A reviewed retry rule with attempts is required in options." };
    const retry = rule;
    if (typeof retry.attempts !== "number" || !Number.isInteger(retry.attempts) || retry.attempts < 1) return { allowed: false, reason: "The reviewed retry attempts must be a positive integer with no code ceiling." };
    if (!nonnegativeoption(retry, "settle")) return { allowed: false, reason: "The reviewed retry settle window must be zero or a positive number of milliseconds." };
    if (!nonnegativeoption(retry, "tolerance")) return { allowed: false, reason: "The reviewed retry movement tolerance must be zero or a positive number of pixels." };
  }
  if (watchactions.has(step.kind)) {
    if (typeof options.lifetime !== "number" || !Number.isFinite(options.lifetime) || options.lifetime <= 0) return { allowed: false, reason: "A reviewed watch lifetime window in milliseconds is required in options." };
    if (options.scopes !== void 0 && (!Array.isArray(options.scopes) || !options.scopes.every((scope) => isnonempty(scope)))) return { allowed: false, reason: "The reviewed watch scopes must be a list of non-empty selectors." };
    if (options.events !== void 0 && (!Array.isArray(options.events) || !options.events.every((event) => isnonempty(event)))) return { allowed: false, reason: "The reviewed watch event kinds must be a list of non-empty strings." };
    if (!nonnegativeoption(options, "poll")) return { allowed: false, reason: "The reviewed watch poll interval must be zero or a positive number of milliseconds." };
  }
  if (step.kind === "waitquiet") {
    const rule = options.quietrule;
    if (!rule || typeof rule !== "object" || Array.isArray(rule)) return { allowed: false, reason: "A reviewed quietrule with an idle threshold is required in options." };
    const quiet = rule;
    if (typeof quiet.idle !== "number" || !Number.isFinite(quiet.idle) || quiet.idle <= 0) return { allowed: false, reason: "The reviewed quiet idle threshold must be a positive number of milliseconds with no code ceiling." };
    if (!nonnegativeoption(quiet, "poll")) return { allowed: false, reason: "The reviewed quiet poll interval must be zero or a positive number of milliseconds." };
    if (!nonnegativeoption(quiet, "timeout")) return { allowed: false, reason: "The reviewed quiet timeout must be zero or a positive number of milliseconds." };
  }
  if (step.kind === "diffsnapshots") {
    const versions = options.versions;
    if (!Array.isArray(versions) || versions.length !== 2 || !versions.every((version) => typeof version === "number" && Number.isInteger(version) && version >= 1)) return { allowed: false, reason: "Two reviewed observation version numbers are required in options." };
  }
  if (step.kind === "openlink" || step.kind === "openprivate" || step.kind === "deeplink") {
    const targetcheck = validatenavtarget(options.navtarget, step.kind);
    if (!targetcheck.allowed) return targetcheck;
    if (step.kind === "deeplink") {
      const app = options.app;
      if (!isnonempty(app)) return { allowed: false, reason: "A reviewed deep link app pattern is required in options." };
      const params = options.params;
      if (params !== void 0 && (!params || typeof params !== "object" || Array.isArray(params) || !Object.values(params).every((item) => typeof item === "string"))) return { allowed: false, reason: "The reviewed deep link params must be an object of string values." };
    }
  }
  if (step.kind === "waitload" && !nonnegativeoption(options, "timeout")) return { allowed: false, reason: "The waitload timeout must be zero or a positive number of milliseconds." };
  if (step.kind === "waiturl" || step.kind === "spawait") {
    if (step.kind === "waiturl") {
      const patterncheck = validateurlpattern(options.urlpattern);
      if (!patterncheck.allowed) return patterncheck;
    }
    if (!nonnegativeoption(options, "timeout")) return { allowed: false, reason: "The wait timeout must be zero or a positive number of milliseconds." };
    if (!nonnegativeoption(options, "poll")) return { allowed: false, reason: "The wait poll interval must be zero or a positive number of milliseconds." };
  }
  if (step.kind === "followlink") {
    if (options.fragment !== void 0 && typeof options.fragment !== "boolean") return { allowed: false, reason: "The reviewed followlink fragment flag must be a boolean." };
  }
  if (step.kind === "spanav") {
    if (options.routepattern !== void 0) {
      const routecheck = validateurlpattern(options.routepattern);
      if (!routecheck.allowed) return routecheck;
    }
    if (!nonnegativeoption(options, "timeout")) return { allowed: false, reason: "The spanav route timeout must be zero or a positive number of milliseconds." };
  }
  if (step.kind === "rewritequery") {
    const set = options.set;
    const remove = options.remove;
    if (set === void 0 && remove === void 0) return { allowed: false, reason: "Reviewed query parameters to set or remove are required in options." };
    if (set !== void 0 && (!set || typeof set !== "object" || Array.isArray(set) || !Object.values(set).every((item) => typeof item === "string"))) return { allowed: false, reason: "The reviewed query parameters to set must be an object of string values." };
    if (remove !== void 0 && (!Array.isArray(remove) || !remove.every((item) => isnonempty(item)))) return { allowed: false, reason: "The reviewed query parameters to remove must be a list of non-empty names." };
  }
  if (step.kind === "navlist") {
    const listcheck = validateurllist(options, "urls");
    if (!listcheck.allowed) return listcheck;
  }
  if (step.kind === "navprofile") {
    const profilecheck = validatewaitprofile(options.waitprofile);
    if (!profilecheck.allowed) return profilecheck;
  }
  if (step.kind === "handleauth" && !ishttpsurl(step.value)) return { allowed: false, reason: "A reviewed HTTPS origin or url is required as the auth target." };
  if (step.kind === "printpdf" && options.name !== void 0 && !isnonempty(options.name)) return { allowed: false, reason: "The reviewed artifact name must be a non-empty string." };
  if (step.kind === "prefetch") {
    const listcheck = validateurllist(options, "urls");
    if (!listcheck.allowed) return listcheck;
  }
  if (step.kind === "preconnect") {
    const origins = options.origins;
    if (!Array.isArray(origins) || origins.length === 0 || !origins.every((originurl) => ishttpsurl(originurl))) return { allowed: false, reason: "A reviewed non-empty list of HTTPS origins is required in options." };
  }
  if (step.kind === "reopentab" && step.value !== void 0 && !ishttpsurl(step.value)) return { allowed: false, reason: "The reviewed reopen url must use HTTPS." };
  if (step.kind === "navrate") {
    const limitcheck = validateratelimit(options.ratelimit);
    if (!limitcheck.allowed) return limitcheck;
  }
  if (step.kind === "checksafe" && !ishttpsurl(step.value)) return { allowed: false, reason: "A reviewed HTTPS url is required for the safety check." };
  if (step.kind === "batchopen") {
    const listcheck = validateurllist(options, "urls");
    if (!listcheck.allowed) return listcheck;
  }
  if (istabscommandkind(step.kind)) {
    const tabscheck = validatetabsgrammar(step, options);
    if (!tabscheck.allowed) return tabscheck;
  }
  if (isformkind(step.kind)) {
    const formcheck = validateformgrammar(step, options);
    if (!formcheck.allowed) return formcheck;
  }
  if (isdatasetkind(step.kind)) {
    const datacheck = validatedatagrammar(step, options, origin);
    if (!datacheck.allowed) return datacheck;
  }
  if (isfileskind(step.kind)) {
    const filescheck = validatefilesgrammar(step, options);
    if (!filescheck.allowed) return filescheck;
  }
  if (iscapturekind(step.kind)) {
    const capturecheck = validatecapturegrammar(step, options);
    if (!capturecheck.allowed) return capturecheck;
  }
  if (ismediakind(step.kind)) {
    const mediacheck = validatemediagrammar(step, options);
    if (!mediacheck.allowed) return mediacheck;
  }
  if (ishttpkind(step.kind)) {
    const httpcheck = validatehttpgrammar(step, options);
    if (!httpcheck.allowed) return httpcheck;
  }
  if (issocketkind(step.kind)) {
    const socketcheck = validatesocketgrammar(step, options);
    if (!socketcheck.allowed) return socketcheck;
  }
  if (isnetwatchkind(step.kind)) {
    const netwatchcheck = validatenetwatchgrammar(step, options);
    if (!netwatchcheck.allowed) return netwatchcheck;
  }
  if (iscontrolkind(step.kind)) {
    const controlcheck = validatecontrolgrammar(step, options);
    if (!controlcheck.allowed) return controlcheck;
  }
  if (isdebugkind(step.kind)) {
    const timelinecheck = validatetimelinegrammar(step, options);
    if (!timelinecheck.allowed) return timelinecheck;
  }
  if (iscdpkind(step.kind)) {
    const cdpcheck = validatecdpgrammar(step, options);
    if (!cdpcheck.allowed) return cdpcheck;
  }
  if (isprofilekind(step.kind)) {
    const profilecheck = validateprofilegrammar(step, options);
    if (!profilecheck.allowed) return profilecheck;
  }
  if (isemulationkind(step.kind)) {
    const emulationcheck = validateemulationgrammar(step, options);
    if (!emulationcheck.allowed) return emulationcheck;
  }
  if (issessionkind(step.kind)) {
    const sessioncheck = validatesessiongrammar(step, options);
    if (!sessioncheck.allowed) return sessioncheck;
  }
  if (isworkflowkind(step.kind)) {
    const workflowcheck = validateworkflowgrammar(step, options);
    if (!workflowcheck.allowed) return workflowcheck;
  }
  if (istriggeraction(step.kind)) {
    const triggercheck = validatetriggergrammar(step, options);
    if (!triggercheck.allowed) return triggercheck;
  }
  if (step.kind === "tabcreate") {
    if (options.background !== void 0 && typeof options.background !== "boolean") return { allowed: false, reason: "The reviewed background flag must be a boolean." };
    if (options.window !== void 0 && (typeof options.window !== "number" || !Number.isInteger(options.window) || options.window < 0)) return { allowed: false, reason: "The reviewed target window id must be a non-negative integer." };
  }
  if (step.kind === "windowcreate") {
    for (const field of ["left", "top", "width", "height"]) {
      if (options[field] !== void 0 && (typeof options[field] !== "number" || !Number.isFinite(options[field]))) return { allowed: false, reason: `The reviewed window ${field} must be a number.` };
    }
    if (options.state !== void 0 && !["normal", "maximized", "minimized", "fullscreen"].includes(options.state)) return { allowed: false, reason: "The reviewed window state must be normal, maximized, minimized or fullscreen." };
  }
  return { allowed: true };
}
function sessiongate(input) {
  if (!input.session || input.session.stoppedat) return { allowed: false, reason: "No active browser session exists." };
  if (input.session.expiresat <= input.now) return { allowed: false, reason: "The browser session has expired." };
  if (input.session.pausedat) return { allowed: false, reason: `The browser session is paused and cannot ${input.action}.` };
  if (input.session.tabid !== input.tabid || input.session.origin !== input.origin) return { allowed: false, reason: `The ${input.action} is outside the approved tab or origin.` };
  return { allowed: true };
}
function canexecute(input) {
  const now = input.now ?? Date.now();
  const gate = sessiongate({ session: input.session, tabid: input.tabid, origin: input.origin, now, action: "execute an action" });
  if (!gate.allowed) return gate;
  if (!input.plan || input.plan.state !== "approved") return { allowed: false, reason: "The plan has not received explicit approval." };
  if (input.plan.expiresat <= now) return { allowed: false, reason: "The approved plan has expired." };
  if (input.run !== void 0 && input.run.state === "queued") return { allowed: false, reason: `The run ${input.run.runid} sits queued in the offlinequeue; a queued run executes no step before the replay or the executor moves it to running.` };
  if (input.run !== void 0 && (input.run.state === "cancelled" || input.run.state === "rolledback")) return { allowed: false, reason: `The run ${input.run.runid} is ${input.run.state}; a stopped run executes no further step.` };
  if (input.run !== void 0 && input.step.risk === "sensitive") {
    if (input.heartbeat === void 0) return { allowed: false, reason: `The sensitive step ${input.step.id} needs a fresh run heartbeat; no heartbeat stands on record for the run ${input.run.runid}.` };
    const window = input.settings?.heartbeatwindow ?? 6e4;
    if (now - input.heartbeat.at > window) return { allowed: false, reason: `The heartbeat of the run ${input.run.runid} is stale past the user window of ${window} milliseconds; the sensitive step ${input.step.id} waits for a fresh beat.` };
  }
  if ((input.step.kind === "pierceshadow" || input.step.kind === "enterframe") && !origingranted(input.session, input.origin)) return { allowed: false, reason: "The shadow or frame step is outside the session origin grants." };
  if (input.step.kind === "readjson" && !origingranted(input.session, input.origin)) return { allowed: false, reason: "The json state read is outside the session origin grants." };
  if (isexportkind(input.step.kind)) {
    const exportgate = exportgranted(input.session, input.origin);
    if (!exportgate.allowed) return exportgate;
  }
  if (input.step.kind === "navlist") {
    let options = {};
    try {
      options = parseoptions(input.step);
    } catch {
      options = {};
    }
    for (const url of Array.isArray(options.urls) ? options.urls : []) {
      if (typeof url !== "string") continue;
      const navigation = navigationgranted(input.session, url);
      if (!navigation.allowed) return navigation;
    }
  }
  if (islayoutkind(input.step.kind) && !layoutmutationgranted(input.session, now).allowed) return { allowed: false, reason: "Group and layout mutations stay inside the active session." };
  if (input.step.kind === "submitform" || input.step.kind === "retryform") {
    if (!input.plan) return { allowed: false, reason: "Form submission requires an asksubmit review step before it." };
    const reviewgate = submitreviewgranted(input.plan.steps, input.step.id);
    if (!reviewgate.allowed) return reviewgate;
  }
  if (input.step.kind === "consentpassword") {
    const consentgate = passwordconsentgranted(input.step);
    if (!consentgate.allowed) return consentgate;
  }
  if (input.step.kind === "readclipboard") {
    const clipgate = clipboardconsentgranted(input.step);
    if (!clipgate.allowed) return clipgate;
  }
  if (input.step.kind === "interceptmime" && !origingranted(input.session, input.origin)) return { allowed: false, reason: "The download interception is outside the session origin grants." };
  if (iscapturekind(input.step.kind)) {
    const capturegatecheck = capturegate(input.session, input.tabid, input.origin, now);
    if (!capturegatecheck.allowed) return capturegatecheck;
    let captureoptions = {};
    try {
      captureoptions = parseoptions(input.step);
    } catch {
      captureoptions = {};
    }
    const target = captureoptions.capture?.exporttarget;
    if (target !== void 0 && target !== "memory" && target !== "download" && target !== "clipboard") return { allowed: false, reason: "The capture export target must be memory, download or clipboard." };
  }
  if (ismediakind(input.step.kind)) {
    const mediagatecheck = mediagate(input.session, input.tabid, input.origin, now);
    if (!mediagatecheck.allowed) return mediagatecheck;
  }
  if (isrecordingkind(input.step.kind)) {
    const recordinggate = recordingconsentgranted(input.step);
    if (!recordinggate.allowed) return recordinggate;
  }
  if (ishttpkind(input.step.kind)) {
    const target = outboundtarget(input.step);
    if (target !== void 0) {
      const outboundgate = origincheck(input.session, target);
      if (!outboundgate.allowed) return outboundgate;
    }
    if (input.step.kind === "fetchurl" || input.step.kind === "callrest" || input.step.kind === "callgraphql") {
      const consentgate = fetchconsentrefgranted(input.step);
      if (!consentgate.allowed) return consentgate;
    }
  }
  if (issocketkind(input.step.kind)) {
    const channelurl = sockettarget(input.step);
    if (channelurl !== void 0) {
      const channelgate = socketgate(input.session, channelurl);
      if (!channelgate.allowed) return channelgate;
    }
  }
  if (input.step.kind === "watchrequests") {
    const watchgatecheck = watchgate(input.session, input.settings, now);
    if (!watchgatecheck.allowed) return watchgatecheck;
  }
  if (isdebugkind(input.step.kind)) {
    const timelinegatecheck = timelinegate(input.session, input.tabid, input.origin, now);
    if (!timelinegatecheck.allowed) return timelinegatecheck;
  }
  if (iscdpkind(input.step.kind)) {
    const debuggatecheck = debuggate(input.session, input.tabid, input.origin, now);
    if (!debuggatecheck.allowed) return debuggatecheck;
    if (!input.plan) return { allowed: false, reason: "The devtools protocol steps need an approved plan." };
    const allowlist = planallowlist(input.plan.steps);
    if (input.step.kind !== "attachcdp") {
      if (allowlist === void 0) return { allowed: false, reason: "The devtools protocol step needs the attachcdp step of the same plan with its enabled domains first." };
      if (input.step.kind === "cdpcmd") {
        let cdpoptions2 = {};
        try {
          cdpoptions2 = parseoptions(input.step);
        } catch {
          cdpoptions2 = {};
        }
        const command = cdpoptions2.command && typeof cdpoptions2.command === "object" && !Array.isArray(cdpoptions2.command) ? cdpoptions2.command : void 0;
        const method = typeof command?.method === "string" ? command.method : "";
        if (methoddomain(method) === void 0 || !allowlistcovers(allowlist, method)) return { allowed: false, reason: `The raw command ${method || ""} stays outside the enabled domain allowlist of the plan attach; review the attach domains or the method gates.` };
      }
    }
    let cdpoptions = {};
    try {
      cdpoptions = parseoptions(input.step);
    } catch {
      cdpoptions = {};
    }
    if (input.step.kind === "setbreakpoint") {
      const breakpoint = breakpointinputof(cdpoptions.breakpoint);
      if (breakpoint) {
        const targetgate2 = origincheck(input.session, breakpoint.url);
        if (!targetgate2.allowed) return targetgate2;
      }
    }
    if (input.step.kind === "overridescript") {
      const override = overrideinputof(cdpoptions.override);
      if (override) {
        const targetgate2 = origincheck(input.session, override.urlpattern);
        if (!targetgate2.allowed) return targetgate2;
      }
    }
  }
  if (isprofilekind(input.step.kind)) {
    let profileoptions = {};
    try {
      profileoptions = parseoptions(input.step);
    } catch {
      profileoptions = {};
    }
    const targets = [
      ...attachtargetof(profileoptions.target) !== void 0 ? [attachtargetof(profileoptions.target)] : [],
      ...Array.isArray(profileoptions.attachtargets) ? profileoptions.attachtargets.flatMap((target) => {
        const parsed = attachtargetof(target);
        return parsed !== void 0 ? [parsed] : [];
      }) : []
    ];
    const targetgatecheck = targetgate({ session: input.session, tabid: input.tabid, origin: input.origin, targets, grants: void 0, now });
    if (!targetgatecheck.allowed) return targetgatecheck;
    if (input.step.kind === "capturesourcemaps") {
      for (const url of Array.isArray(profileoptions.scripts) ? profileoptions.scripts : []) {
        if (typeof url !== "string") continue;
        const scriptgate = origincheck(input.session, url);
        if (!scriptgate.allowed) return scriptgate;
      }
    }
  }
  if (isemulationkind(input.step.kind)) {
    const emugatecheck = emugate({ session: input.session, plan: input.plan, step: input.step, tabid: input.tabid, origin: input.origin, now });
    if (!emugatecheck.allowed) return emugatecheck;
  }
  if (issessionkind(input.step.kind)) {
    const sessiongatecheck = sessionrestoregate({ session: input.session, plan: input.plan, step: input.step, tabid: input.tabid, origin: input.origin, now });
    if (!sessiongatecheck.allowed) return sessiongatecheck;
    if (input.step.kind === "restoresession") {
      let restoreoptions = {};
      try {
        restoreoptions = parseoptions(input.step);
      } catch {
        restoreoptions = {};
      }
      for (const url of Array.isArray(restoreoptions.origins) ? restoreoptions.origins : []) {
        if (typeof url !== "string" || !url) continue;
        const origingate = origincheck(input.session, url);
        if (!origingate.allowed) return { allowed: false, reason: `The session restore reopens ${url} outside the session origin grants; review the restore record or grant the origin.` };
      }
    }
  }
  if (isworkflowkind(input.step.kind)) {
    const workflowgatecheck = workflowgate({ session: input.session, plan: input.plan, step: input.step, tabid: input.tabid, origin: input.origin, now });
    if (!workflowgatecheck.allowed) return workflowgatecheck;
  }
  if (istriggeraction(input.step.kind)) {
    const triggergatecheck = triggergate({ session: input.session, plan: input.plan, step: input.step, tabid: input.tabid, origin: input.origin, now });
    if (!triggergatecheck.allowed) return triggergatecheck;
  }
  if (iscontrolkind(input.step.kind)) {
    const controlgate = sessiongate({ session: input.session, tabid: input.tabid, origin: input.origin, now, action: "control the network" });
    if (!controlgate.allowed) return controlgate;
    let controloptions2 = {};
    try {
      controloptions2 = parseoptions(input.step);
    } catch {
      controloptions2 = {};
    }
    if (input.step.kind === "blockrequest") {
      const blockgatecheck = blockgate(input.session, input.step, now);
      if (!blockgatecheck.allowed) return blockgatecheck;
      const rule = blockruleof(controloptions2.block);
      if (rule) {
        const blockorigin = origincheck(input.session, rule.urlpattern);
        if (!blockorigin.allowed) return blockorigin;
      }
    }
    if (input.step.kind === "mockresponse" || input.step.kind === "rewriteheaders") {
      const patterns = input.step.kind === "mockresponse" ? [mockspecof(controloptions2.mock)?.urlpattern ?? ""] : Array.isArray(controloptions2.rules) ? controloptions2.rules.map((item) => item && typeof item === "object" && !Array.isArray(item) ? String(item.urlpattern ?? "") : "") : [];
      for (const pattern of patterns) {
        const patterngate = origincheck(input.session, pattern);
        if (!patterngate.allowed) return patterngate;
      }
    }
    if (input.step.kind === "setcookies" || input.step.kind === "readcookies" || input.step.kind === "clearcookies") {
      const domain = typeof controloptions2.domain === "string" && controloptions2.domain.trim() ? controloptions2.domain : Array.isArray(controloptions2.cookies) ? String(controloptions2.cookies[0]?.domain ?? "") : "";
      if (!domain) return { allowed: false, reason: "A reviewed cookie domain is required before cookie control runs." };
      const cookiegatecheck = cookiegate(input.session, domain, now);
      if (!cookiegatecheck.allowed) return cookiegatecheck;
    }
    if (input.step.kind === "authflow") {
      const authconsent = authconsentgranted(input.step);
      if (!authconsent.allowed) return authconsent;
    }
    if (input.step.kind === "saveapikey") {
      const keyconsent = apikeyconsentgranted(input.step);
      if (!keyconsent.allowed) return keyconsent;
    }
    if (input.step.kind === "routeproxy") {
      const proxygatecheck = proxygate(input.session, input.step, now);
      if (!proxygatecheck.allowed) return proxygatecheck;
    }
    const target = controltarget(input.step);
    if (target !== void 0) {
      const targetgate2 = origincheck(input.session, target);
      if (!targetgate2.allowed) return targetgate2;
    }
  }
  if (input.step.kind === "extractapi") {
    let replayoptions = {};
    try {
      replayoptions = parseoptions(input.step);
    } catch {
      replayoptions = {};
    }
    const replay = apireplayspecof(replayoptions.replay);
    if (replay !== void 0) {
      const replaygate = origincheck(input.session, replay.endpoint);
      if (!replaygate.allowed) return replaygate;
    }
  }
  if (input.step.kind === "openlink" || input.step.kind === "openprivate" || input.step.kind === "batchopen" || input.step.kind === "prefetch" || input.step.kind === "deeplink" || input.step.kind === "reopentab") {
    let options = {};
    try {
      options = parseoptions(input.step);
    } catch {
      options = {};
    }
    const grammar = validatestep(input.step, input.origin);
    if (!grammar.allowed) return grammar;
    const grants = input.session?.grants ?? [input.session?.origin ?? input.origin];
    const targets = input.step.kind === "batchopen" || input.step.kind === "prefetch" ? Array.isArray(options.urls) ? options.urls : [] : input.step.kind === "reopentab" ? [input.step.value] : [options.navtarget?.url];
    for (const target of targets) {
      if (typeof target !== "string" || !target) continue;
      const verified = originverified(target, grants, input.verdicts ?? []);
      if (!verified.allowed) return verified;
    }
  }
  return validatestep(input.step, input.origin);
}
function canpreview(input) {
  const now = input.now ?? Date.now();
  const gate = sessiongate({ session: input.session, tabid: input.tabid, origin: input.origin, now, action: "preview a target" });
  if (!gate.allowed) return gate;
  if (!input.plan || !["pending", "approved"].includes(input.plan.state)) return { allowed: false, reason: "Only a reviewed pending or approved plan can be previewed." };
  if (input.plan.expiresat <= now) return { allowed: false, reason: "The reviewed plan has expired." };
  let options = {};
  try {
    options = parseoptions(input.step);
  } catch {
    options = {};
  }
  if (!targetactions.has(input.step.kind) && options.targetref === void 0) return { allowed: false, reason: "Only a target-based action can be previewed." };
  return validatestep(input.step, input.origin);
}
function reviewedkinds() {
  return [...allowedactions].sort();
}
function readonlyactionkinds() {
  return [...readactions].sort();
}
function editorsavegate(input) {
  const gate = sessiongate({ session: input.session, tabid: input.session?.tabid ?? 0, origin: input.session?.origin ?? "https://example.com", now: input.now, action: "save the workflow editor canvas" });
  if (!gate.allowed) return gate;
  if (!input.plan || input.plan.state !== "approved") return { allowed: false, reason: "Editor saves need the approved plan review before a new workflow version composes." };
  const model = input.model;
  if (typeof model.name !== "string" || !model.name.trim()) return { allowed: false, reason: "The workflow name of the canvas must be a non-empty string." };
  if (typeof model.version !== "number" || !Number.isInteger(model.version) || model.version < 1) return { allowed: false, reason: "The workflow version of the canvas must be a positive integer." };
  if (!Array.isArray(model.origins) || model.origins.length === 0) return { allowed: false, reason: "The canvas needs at least one granted HTTPS origin." };
  const ids = /* @__PURE__ */ new Set();
  for (const node of model.nodes) {
    if (node.step === void 0 === (node.invocation === void 0)) return { allowed: false, reason: "Every canvas node must be exactly one workflow step or one block invocation." };
    const id = node.id ?? (node.step !== void 0 ? node.step.id : node.invocation.block);
    if (!id || ids.has(id)) return { allowed: false, reason: `The canvas node id ${id || "(empty)"} must be unique.` };
    ids.add(id);
  }
  const reachable = /* @__PURE__ */ new Set();
  for (const node of model.nodes) {
    if (node.step !== void 0) {
      reachable.add(node.step.id);
      continue;
    }
    const walk = (entries) => {
      for (const entry of entries) {
        if (typeof entry.id === "string" && typeof entry.kind === "string") {
          reachable.add(entry.id);
          continue;
        }
        if (typeof entry.block === "string") {
          const nested = model.blocks.find((candidate) => candidate.name === entry.block);
          if (nested) walk(nested.steps);
        }
      }
    };
    const block = model.blocks.find((candidate) => candidate.name === node.invocation.block);
    if (!block) return { allowed: false, reason: `The block ${node.invocation.block} of the canvas has no definition.` };
    walk(block.steps);
  }
  let order = 0;
  const positionof = /* @__PURE__ */ new Map();
  for (const node of model.nodes) {
    if (node.step !== void 0) {
      positionof.set(node.step.id, order);
      order += 1;
      continue;
    }
    const walk = (entries) => {
      for (const entry of entries) {
        if (typeof entry.id === "string" && typeof entry.kind === "string") {
          positionof.set(entry.id, order);
          order += 1;
          continue;
        }
        if (typeof entry.block === "string") {
          const nested = model.blocks.find((candidate) => candidate.name === entry.block);
          if (nested) walk(nested.steps);
        }
      }
    };
    walk(model.blocks.find((candidate) => candidate.name === node.invocation.block).steps);
  }
  for (const edge of model.edges) {
    if (!reachable.has(edge.from)) return { allowed: false, reason: `The canvas edge of ${edge.variable} references the unknown source step ${edge.from}.` };
    if (!reachable.has(edge.to)) return { allowed: false, reason: `The canvas edge of ${edge.variable} references the unknown target step ${edge.to}.` };
    if ((positionof.get(edge.from) ?? -1) >= (positionof.get(edge.to) ?? -1)) return { allowed: false, reason: `The canvas edge of ${edge.variable} runs backwards and would form a cycle.` };
  }
  return { allowed: true };
}
function runreviewgranted(record) {
  if (record.reviewstate === "pending") return { allowed: false, reason: "The workflow stays unreviewed: the import or rollback review must approve its expanded step list before any run." };
  return { allowed: true };
}
var overrideknobs = ["loopbound", "stepms", "runms", "waitms", "delaybase"];
function validatesiteoverride(override) {
  if (typeof override.pattern !== "string" || !override.pattern.startsWith("https://") || !/[a-z0-9.-]+/i.test(override.pattern.slice(8))) return { allowed: false, reason: "The override pattern must be an https origin or a `*` subdomain glob of one." };
  if (!override.pattern.includes("*")) {
    try {
      if (new URL(override.pattern).origin !== override.pattern) return { allowed: false, reason: "The override pattern must be a bare https origin or a `*` subdomain glob, never a path." };
    } catch {
      return { allowed: false, reason: "The override pattern must parse as an https origin or a `*` subdomain glob of one." };
    }
  }
  for (const [knob, delta] of Object.entries(override.deltas)) {
    if (!overrideknobs.includes(knob)) return { allowed: false, reason: `The override knob ${knob} is not one of the reviewed knobs: ${overrideknobs.join(", ")}.` };
    if (typeof delta !== "number" || !Number.isFinite(delta) || delta <= 0) return { allowed: false, reason: `The override delta of ${knob} must be a positive user value with no code ceiling.` };
  }
  return { allowed: true };
}
function exportcontentreview(file) {
  const secretkeys = /(secret|token|apikey|api_key|password|authorization|credential)/i;
  const scan = (label, options) => {
    if (options === void 0) return void 0;
    let payload;
    try {
      payload = JSON.parse(options);
    } catch {
      return void 0;
    }
    const walk = (value, path) => {
      if (!value || typeof value !== "object") return void 0;
      for (const [key, entry] of Object.entries(value)) {
        if (secretkeys.test(key)) return { allowed: false, reason: `The export of ${label} carries the secret field ${path}${key} and secrets never leave the browser.` };
        const nested = walk(entry, `${path}${key}.`);
        if (nested !== void 0) return nested;
      }
      return void 0;
    };
    return walk(payload, "");
  };
  for (const step of file.workflow.steps) {
    const refusal = scan(`the step ${step.id}`, step.options);
    if (refusal !== void 0) return refusal;
  }
  for (const template of file.templates) {
    const refusal = scan(`the template ${template.name}`, template.step.options);
    if (refusal !== void 0) return refusal;
  }
  return { allowed: true };
}
function watchdogconfigvalid(config) {
  if (typeof config.enabled !== "boolean") return { allowed: false, reason: "The watchdog enabled flag must be a boolean." };
  if (typeof config.stallthreshold !== "number" || !Number.isFinite(config.stallthreshold) || config.stallthreshold <= 0) return { allowed: false, reason: "The watchdog stall threshold must be a positive number of milliseconds with no code ceiling." };
  if (!["retry", "pause", "cancel"].includes(config.action)) return { allowed: false, reason: "The watchdog recovery action must be retry, pause or cancel." };
  if (config.zombiewindow !== void 0 && (typeof config.zombiewindow !== "number" || !Number.isFinite(config.zombiewindow) || config.zombiewindow <= 0)) return { allowed: false, reason: "The watchdog zombie window, when configured, must be a positive number of milliseconds with no code ceiling." };
  return { allowed: true };
}
function validatetoolcatalog(catalog) {
  if (!Array.isArray(catalog.domains) || catalog.domains.length === 0) return { allowed: false, reason: "The tool catalog needs its tool domains." };
  const seen = /* @__PURE__ */ new Set();
  for (const domain of catalog.domains) {
    if (!toolnamespaces.includes(domain.namespace)) return { allowed: false, reason: `The tool domain ${String(domain.namespace)} is not a reviewed namespace.` };
    if (!Array.isArray(domain.tools) || domain.tools.length === 0) return { allowed: false, reason: `The ${domain.namespace} domain exposes no tools.` };
    for (const tool of domain.tools) {
      if (typeof tool.name !== "string" || !tool.name.startsWith(`${domain.namespace}.`)) return { allowed: false, reason: `The tool ${String(tool.name)} does not carry its ${domain.namespace} namespace prefix.` };
      if (seen.has(tool.name)) return { allowed: false, reason: `The tool name ${tool.name} is not unique across the catalog.` };
      seen.add(tool.name);
      if (!allowedactions.has(tool.kind)) return { allowed: false, reason: `The tool ${tool.name} wraps ${String(tool.kind)} which is outside the reviewed action kind grammar.` };
      if (!domainkinds[domain.namespace].includes(tool.kind)) return { allowed: false, reason: `The tool ${tool.name} wraps ${String(tool.kind)} which does not belong to the ${domain.namespace} domain.` };
      if (typeof tool.description !== "string" || tool.description.trim() === "") return { allowed: false, reason: `The tool ${tool.name} needs its plain language description.` };
      const schema = tool.inputschema;
      if (!schema || schema.type !== "object" || schema.properties === void 0 || schema.properties === null || typeof schema.properties !== "object" || Array.isArray(schema.properties) || Object.keys(schema.properties).length === 0) return { allowed: false, reason: `The tool ${tool.name} needs its json schema inputs of at least one typed property.` };
      for (const [name, property] of Object.entries(schema.properties)) {
        if (!["string", "number", "boolean", "object", "array"].includes(property.type)) return { allowed: false, reason: `The ${tool.name} input ${name} carries an untyped property.` };
        if (typeof property.description !== "string" || property.description.trim() === "") return { allowed: false, reason: `The ${tool.name} input ${name} needs its plain language description.` };
      }
      for (const name of schema.required) {
        if (!(name in schema.properties)) return { allowed: false, reason: `The tool ${tool.name} marks ${name} required outside its properties.` };
      }
    }
  }
  return { allowed: true };
}
function toolriskgrade(tool) {
  const grade = actionrisk(tool.kind);
  if (grade !== tool.risk) return { allowed: false, reason: `The tool ${tool.name} declares the ${tool.risk} grade while its kind ${String(tool.kind)} grades ${grade}.` };
  return { allowed: true };
}
function toolconsentrequired(tool) {
  if (tool.risk === "read") return { allowed: true };
  if (tool.consentmeta === void 0 || typeof tool.consentmeta.review !== "string" || tool.consentmeta.review.trim() === "") return { allowed: false, reason: `The tool ${tool.name} has side effects and needs its consent metadata with the review requirement.` };
  return { allowed: true };
}
function serverbindgate(config) {
  const bind = config.bind !== void 0 && config.bind.trim() !== "" ? config.bind.trim() : "127.0.0.1";
  const local = bind === "127.0.0.1" || bind === "localhost" || bind === "::1";
  if (!local && config.remote !== true) return { allowed: false, reason: `The bind ${bind} leaves localhost and grades sensitive: the explicit remote review must approve it first.` };
  return { allowed: true };
}
function toolversionfloor(tool, floor) {
  if (typeof floor === "number" && Number.isFinite(floor) && tool.version < floor) return { allowed: false, reason: `The tool ${tool.name} of version ${tool.version} stays below the negotiated compatibility floor of ${floor}.` };
  return { allowed: true };
}
function serverenablementgate(config) {
  if (config.enabled !== true) return { allowed: false, reason: "The mcp server starts only after the user enables it; the protocol surface stays closed by default." };
  const bind = serverbindgate(config);
  if (!bind.allowed) return bind;
  if (!Array.isArray(config.transports) || config.transports.length === 0) return { allowed: false, reason: "The mcp server needs at least one allowed transport of stdio or http." };
  if (!config.transports.every((transport) => transport === "stdio" || transport === "http")) return { allowed: false, reason: "The allowed transports of the mcp server are stdio and http." };
  if (typeof config.port !== "number" || !Number.isFinite(config.port) || config.port <= 0 || config.port > 65535) return { allowed: false, reason: "The http listener port must be a valid port number." };
  if (config.framesize !== void 0 && (typeof config.framesize !== "number" || !Number.isFinite(config.framesize) || config.framesize <= 0)) return { allowed: false, reason: "The user configured frame size must stay a positive number with no code ceiling." };
  if (config.queuedepth !== void 0 && (typeof config.queuedepth !== "number" || !Number.isFinite(config.queuedepth) || config.queuedepth <= 0)) return { allowed: false, reason: "The user configured queue depth must stay a positive number with no code ceiling." };
  const remote = remoteenablementgate(config);
  if (!remote.allowed) return remote;
  return { allowed: true };
}
function toolnamespacegate(tool) {
  const namespace = tool.name.split(".")[0];
  if (!toolnamespaces.includes(namespace)) return { allowed: false, reason: `The tool ${tool.name} carries no reviewed namespace prefix.` };
  if (!domainkinds[namespace].includes(tool.kind)) return { allowed: false, reason: `The tool ${tool.name} wraps ${String(tool.kind)} which does not belong to the ${namespace} domain.` };
  return { allowed: true };
}
function tooldispatchgate(input) {
  if (input.client.disconnectedat !== void 0) return { allowed: false, reason: "The mcp client is disconnected and its tool calls are refused." };
  if (!input.client.paired) return { allowed: false, reason: "The mcp client waits for the user pairing approval; unpaired clients never dispatch tools." };
  if (!input.session || input.session.stoppedat || input.session.pausedat) return { allowed: false, reason: "Tool dispatch needs the live browser session behind the consent gates." };
  if (input.session.expiresat <= input.now) return { allowed: false, reason: "The browser session has expired and tool dispatch is refused." };
  if (!input.plan || input.plan.state !== "approved") return { allowed: false, reason: "Tool dispatch needs the approved plan review before any tool runs." };
  if (!origingranted(input.session, input.origin)) return { allowed: false, reason: `The tool call origin ${input.origin} stays outside the session grants and is refused.` };
  if (input.tool.risk === "read") return { allowed: true };
  if (input.stepid === void 0 || input.stepid.trim() === "") return { allowed: false, reason: `The ${input.tool.name} tool has side effects and needs the id of the approved plan step it executes.` };
  const step = input.plan.steps.find((candidate) => candidate.id === input.stepid);
  if (step === void 0) return { allowed: false, reason: `The tool call names the step ${input.stepid} which the approved plan does not carry.` };
  if (step.kind !== input.tool.kind) return { allowed: false, reason: `The tool call names the step ${input.stepid} whose kind ${String(step.kind)} does not match the ${input.tool.name} tool.` };
  return { allowed: true };
}
function consentmetagrade(tool) {
  if (tool.risk === "read") return { allowed: true };
  if (tool.consentmeta === void 0) return { allowed: false, reason: `The tool ${tool.name} has side effects and needs its consent metadata.` };
  if (tool.consentmeta.riskclass !== actionrisk(tool.kind)) return { allowed: false, reason: `The consent metadata of ${tool.name} declares the ${String(tool.consentmeta.riskclass)} risk class while policy grades its kind ${String(tool.kind)} as ${actionrisk(tool.kind)}.` };
  if (tool.consentmeta.approvalrequired !== true) return { allowed: false, reason: `The tool ${tool.name} has side effects and its consent metadata must require the explicit approval gate.` };
  if (tool.consentmeta.originscope !== "session") return { allowed: false, reason: `The tool ${tool.name} must scope its calls to the session grants.` };
  return { allowed: true };
}
function allowlistentryvalid(entry, identities) {
  if (typeof entry.fingerprint !== "string" || entry.fingerprint.trim() === "") return { allowed: false, reason: "The allowlist entry needs the client fingerprint it grants." };
  if (!identities.some((identity) => identity.fingerprint === entry.fingerprint)) return { allowed: false, reason: `The allowlist entry ${entry.fingerprint} matches no known client identity.` };
  if (typeof entry.displayname !== "string" || entry.displayname.trim() === "") return { allowed: false, reason: `The allowlist entry ${entry.fingerprint} needs its display name.` };
  if (!Array.isArray(entry.namespaces) || entry.namespaces.length === 0) return { allowed: false, reason: `The allowlist entry ${entry.displayname} grants no tool namespace.` };
  if (!entry.namespaces.every((namespace) => toolnamespaces.includes(namespace))) return { allowed: false, reason: `The allowlist entry ${entry.displayname} grants an unreviewed namespace.` };
  return { allowed: true };
}
function tokenlifetimevalid(lifetime) {
  if (lifetime === void 0) return { allowed: true };
  if (typeof lifetime !== "number" || !Number.isFinite(lifetime) || lifetime <= 0) return { allowed: false, reason: "The token lifetime must stay a positive user value with no code ceiling." };
  return { allowed: true };
}
function remotetransporttls(config) {
  const bind = config.bind !== void 0 && config.bind.trim() !== "" ? config.bind.trim() : "127.0.0.1";
  const local = bind === "127.0.0.1" || bind === "localhost" || bind === "::1";
  const tls = config.remoteaccess?.tls ?? config.httpstream?.tls;
  if ((config.remoteaccess !== void 0 || !local) && (tls === void 0 || tls.mode === "off")) return { allowed: false, reason: `The ${config.remoteaccess !== void 0 ? "remote transport" : `bind ${bind}`} leaves localhost and every non localhost transport requires tls before any remote traffic.` };
  return { allowed: true };
}
function pairingreadinessgate(session, now) {
  if (!session || session.stoppedat || session.pausedat) return { allowed: false, reason: "The pairing flow needs the live browser session before any code issues." };
  if (session.expiresat <= now) return { allowed: false, reason: "The browser session has expired and the pairing flow is refused." };
  return { allowed: true };
}
function remoteenablementgate(config) {
  if (config.remoteaccess === void 0) return { allowed: true };
  if (config.remote !== true) return { allowed: false, reason: "The remote transport enablement is a sensitive user choice and needs the explicit remote review." };
  const tls = remotetransporttls(config);
  if (!tls.allowed) return tls;
  if (typeof config.remoteaccess.endpoint !== "string" || config.remoteaccess.endpoint.trim() === "") return { allowed: false, reason: "The remote access policy needs its user configured endpoint." };
  if (config.remoteaccess.maxclients !== void 0 && (typeof config.remoteaccess.maxclients !== "number" || !Number.isFinite(config.remoteaccess.maxclients) || config.remoteaccess.maxclients <= 0)) return { allowed: false, reason: "The user configured client ceiling must stay a positive value with no code ceiling." };
  const lifetime = tokenlifetimevalid(config.remoteaccess.tokenlifetimems);
  if (!lifetime.allowed) return lifetime;
  const timeout = approvaltimeoutvalid(config.remoteaccess.approvaltimeout);
  if (!timeout.allowed) return timeout;
  return { allowed: true };
}
function tokenscopevalid(scopes, granted) {
  if (!Array.isArray(scopes) || scopes.length === 0) return { allowed: false, reason: "A session token needs at least one granted tool namespace." };
  for (const scope of scopes) {
    if (!toolnamespaces.includes(scope)) return { allowed: false, reason: `The scope ${String(scope)} is not a reviewed tool namespace.` };
    if (!granted.includes(scope)) return { allowed: false, reason: `The scope ${scope} stays outside the namespaces the user granted.` };
  }
  return { allowed: true };
}
function approvaltimeoutvalid(timeout) {
  if (timeout === void 0) return { allowed: true };
  if (typeof timeout.windowms !== "number" || !Number.isFinite(timeout.windowms) || timeout.windowms <= 0) return { allowed: false, reason: "The approval timeout must stay a positive user window with no code ceiling." };
  if (timeout.ontimeout !== "refuse") return { allowed: false, reason: "The documented disposition of an unanswered approval gate is refusal." };
  return { allowed: true };
}
function revocationgate() {
  return { allowed: true };
}
function subscriptiongrade(subscription) {
  if (!Array.isArray(subscription.kinds) || subscription.kinds.length === 0) return { allowed: false, reason: "An event subscription needs at least one protocol event kind." };
  if (subscription.kinds.includes("callstarted") && subscription.origin === void 0 && subscription.tool === void 0) return { allowed: false, reason: "An event subscription that mirrors the callstarted events of tools with side effects needs its origin or tool filter so it never widens what the session grants." };
  return { allowed: true };
}
function samplinggrade(input) {
  if (!input.pagegrant && input.request.pagecontent !== void 0) return { allowed: false, reason: "The sampling callback carries page content the user never granted and is refused." };
  if (input.request.maxtokens !== void 0 && (!Number.isFinite(input.request.maxtokens) || input.request.maxtokens <= 0)) return { allowed: false, reason: "The granted maximum tokens of a sampling callback must stay a positive user value with no code ceiling." };
  if (input.request.prompt.trim() === "") return { allowed: false, reason: "A sampling callback needs its prompt." };
  return { allowed: true };
}
function callratelimitvalid(limit) {
  if (limit === void 0) return { allowed: true };
  if (typeof limit.windowms !== "number" || !Number.isFinite(limit.windowms) || limit.windowms <= 0) return { allowed: false, reason: "The rate limit window must stay a positive user value with no code ceiling." };
  if (limit.budget !== void 0 && (typeof limit.budget !== "number" || !Number.isFinite(limit.budget) || limit.budget <= 0)) return { allowed: false, reason: "The rate limit budget must stay a positive user value with no code ceiling." };
  if (limit.clientid.trim() === "") return { allowed: false, reason: "A per client rate limit needs the client it counts." };
  return { allowed: true };
}
function callauditcomplete(input) {
  const audited = new Set(input.audit.map((record) => record.id));
  const missing = input.calls.filter((record) => !audited.has(record.id));
  if (missing.length > 0) return { allowed: false, reason: `${missing.length} tool call${missing.length === 1 ? "" : "s"} carry no audit entry and the audit trail must name every call without exception.` };
  return { allowed: true };
}
function batchgrade(input) {
  if (input.calls.length === 0) return { allowed: false, reason: "A batch call needs at least one ordered tool call." };
  const sensitive = input.calls.some((call) => call.risk === "sensitive");
  if (sensitive && !input.approved) return { allowed: false, reason: "The batch grades sensitive through its most sensitive member and runs only behind the approval gates." };
  return { allowed: true };
}
function dryrunpurity(dryrun) {
  if (dryrun.executed) return { allowed: false, reason: `The ${dryrun.tool} dry run claims execution and a dry run never executes anything.` };
  if (dryrun.mutations.length > 0) return { allowed: false, reason: `The ${dryrun.tool} dry run lists ${dryrun.mutations.length} page mutation${dryrun.mutations.length === 1 ? "" : "s"} and a dry run leaves the page untouched.` };
  return { allowed: true };
}
function mockusagevalid(mock) {
  if (mock.testcontext !== true) return { allowed: false, reason: `The ${mock.tool} mock stays outside a test context and is refused; tool mocks never answer real calls.` };
  if (mock.tool.trim() === "") return { allowed: false, reason: "A tool mock needs the namespaced tool it stands in for." };
  if (typeof mock.result.content !== "string") return { allowed: false, reason: "A tool mock needs its canned result content." };
  return { allowed: true };
}
function mcpmodegate(config) {
  const enablement = serverenablementgate(config);
  if (!enablement.allowed) return enablement;
  if (config.drainwindow !== void 0 && (typeof config.drainwindow !== "number" || !Number.isFinite(config.drainwindow) || config.drainwindow <= 0)) return { allowed: false, reason: "The shutdown drain window must stay a positive user value in milliseconds with no code ceiling." };
  return { allowed: true };
}
function degradationgate(input) {
  if (input.origin === void 0 || input.origin.trim() === "") return { allowed: false, reason: "The serve mode needs the session origin before it decides the degradation; without it the serve stays read only." };
  const grants = input.grants ?? [];
  if (!grants.includes(input.origin)) return { allowed: false, reason: `The origin ${input.origin} stays outside the session grants and the serve degrades to the read only tools.` };
  return { allowed: true };
}
function resourceexposuregate(input) {
  if (input.client.disconnectedat !== void 0) return { allowed: false, reason: "A disconnected client reads no served resource." };
  if (!input.client.paired) return { allowed: false, reason: "The resource exposure waits for the user pairing approval; unpaired clients read no resource." };
  if (input.served !== void 0 && !input.served.includes(input.uri)) return { allowed: false, reason: `The serve mode publishes no resource named ${input.uri}.` };
  return { allowed: true };
}
function promptexposuregate(client) {
  if (client.disconnectedat !== void 0) return { allowed: false, reason: "A disconnected client reads no served prompt." };
  if (!client.paired) return { allowed: false, reason: "The prompt exposure waits for the user pairing approval; unpaired clients read no prompt." };
  return { allowed: true };
}
function providervalid(config) {
  if (config.name.trim() === "") return { allowed: false, reason: "The provider config needs its name." };
  if (config.endpoint.trim() === "") return { allowed: false, reason: "The provider config needs the user configured endpoint url; no default endpoint ever applies." };
  let parsed;
  try {
    parsed = new URL(config.endpoint);
  } catch {
    return { allowed: false, reason: "The provider endpoint must be a well-formed url." };
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return { allowed: false, reason: "The provider endpoint must speak http or https." };
  if (config.models.length === 0) return { allowed: false, reason: "The provider config needs at least one user configured model name." };
  if (config.models.some((model) => model.trim() === "")) return { allowed: false, reason: "Every provider model name must stay non-empty free text." };
  if (config.style !== "chatcompletions" && config.style !== "responses" && config.style !== "messages" && config.style !== "gemini") return { allowed: false, reason: "The provider protocol shape must be one of the four wire shapes the user picks." };
  if (config.authref !== void 0 && config.authref.storageid.trim() === "") return { allowed: false, reason: "The provider auth reference needs the storage id of the stored key; the key material never enters the config." };
  return { allowed: true };
}
function provideregressgrade(input) {
  const valid = providervalid(input.provider);
  if (!valid.allowed) return valid;
  return { allowed: true, reason: input.local ? "The model call stays on the local machine endpoint and grades as the local data egress preference." : "The model call leaves the browser for the user configured endpoint and grades as a data egress event with its endpoint, model and token counts in the audit trail." };
}
function egressconsentgate(input) {
  if (input.pagecontent !== void 0 && input.pagecontent.trim() !== "" && input.granted !== true) return { allowed: false, reason: "The model call carries page content the user has not granted, so the content stays in the browser and the call refuses." };
  return { allowed: true };
}
function localsensitivegrade(input) {
  if (input.sensitive && !input.local) return { allowed: true, reason: "The sensitive extraction prefers the local model endpoint; the user keeps the choice of the remote provider." };
  return { allowed: true, reason: input.local ? "The local model endpoint satisfies the sensitive extraction preference." : "The extraction stays non-sensitive and every configured endpoint serves it." };
}
function plandraftreviewgate(draft) {
  if (draft.state !== "approved") return { allowed: false, reason: "The model drafted plan stays unreviewed; the human review approves the draft before any step executes." };
  if (draft.steps.length === 0) return { allowed: false, reason: "The model drafted plan carries no step, so nothing executes." };
  return { allowed: true };
}
function replanreviewgate(replan) {
  if (replan.state !== "approved") return { allowed: false, reason: "The replanned tail stays unreviewed; the fresh review approves the changed steps before any of them executes." };
  if (replan.tail.some((step) => step.freshreview !== true)) return { allowed: false, reason: "Every revised step of a replan must carry the fresh review marker." };
  return { allowed: true };
}
function costbudgetvalid(budget) {
  if (budget.maxtokens !== void 0 && (!Number.isFinite(budget.maxtokens) || budget.maxtokens <= 0)) return { allowed: false, reason: "The token ceiling of a cost budget must stay a positive user value." };
  if (budget.maxcost !== void 0 && (!Number.isFinite(budget.maxcost) || budget.maxcost <= 0)) return { allowed: false, reason: "The cost ceiling of a cost budget must stay a positive user value." };
  if (budget.maxcost !== void 0 && (budget.currency === void 0 || budget.currency.trim() === "")) return { allowed: false, reason: "The cost ceiling of a cost budget needs its currency unit." };
  if (budget.maxtokens === void 0 && budget.maxcost === void 0) return { allowed: false, reason: "The cost budget needs at least one ceiling the user configured; an absent budget stays the documented unbounded choice." };
  return { allowed: true };
}
function guardverdictgate(output) {
  if (output.verdict === "invalid") return { allowed: false, reason: output.reason ?? "The guardrails marked the model output invalid." };
  if (output.verdict === "refused") return { allowed: false, reason: output.reason ?? "The model refused the request, so nothing executes." };
  return { allowed: true };
}
function draftriskof(step) {
  try {
    return resolvedrisk({ id: step.id, kind: step.kind, ...step.target !== void 0 ? { target: step.target } : {}, ...step.value !== void 0 ? { value: step.value } : {}, summary: step.summary, risk: "sensitive" });
  } catch {
    return "sensitive";
  }
}
function planlint(draft, origin) {
  const findings = [];
  if (draft.goal.trim() === "") findings.push("The drafted plan carries no goal.");
  if (draft.steps.length === 0) findings.push("The drafted plan carries no step.");
  for (const step of draft.steps) {
    const mapped = { id: step.id, kind: step.kind, ...step.target !== void 0 ? { target: step.target } : {}, ...step.value !== void 0 ? { value: step.value } : {}, summary: step.summary, risk: draftriskof(step) };
    const verdict = validatestep(mapped, origin);
    if (!verdict.allowed) findings.push(`The drafted step ${step.id || "without id"} of kind ${step.kind || "unknown"} violates the action grammar: ${verdict.reason ?? "the step failed its grammar check."}`);
  }
  return findings;
}
function queuelanesvalid(queue) {
  if (queue.lanes.some((lane) => lane.trim() === "")) return { allowed: false, reason: "Every queue lane needs its user configured name." };
  if (new Set(queue.lanes).size !== queue.lanes.length) return { allowed: false, reason: "The queue lane names must stay unique." };
  if (queue.priorities.some((priority) => !Number.isFinite(priority))) return { allowed: false, reason: "Every queue priority must stay a finite user value." };
  if (queue.completionpolicy !== "all" && queue.completionpolicy !== "any") return { allowed: false, reason: "The queue completion policy must stay all or any." };
  for (const item of queue.items) {
    if (item.payload.trim() === "") return { allowed: false, reason: `The task ${item.id} carries no payload.` };
    if (queue.lanes.length > 0 && !queue.lanes.includes(item.lane)) return { allowed: false, reason: `The task ${item.id} waits in the lane ${item.lane} which the user did not configure.` };
    if (queue.priorities.length > 0 && !queue.priorities.includes(item.priority)) return { allowed: false, reason: `The task ${item.id} carries the priority ${item.priority} which the user did not configure.` };
  }
  return { allowed: true };
}
function workstealgrade(input) {
  if (!input.swarmapproved) return { allowed: false, reason: "Work stealing runs only inside one user approved swarm; an unapproved swarm keeps every lane closed." };
  const rule = (input.ownership ?? []).find((entry) => entry.lane === input.lane);
  if (rule && !rule.roles.includes(input.agentrole)) return { allowed: false, reason: `The lane ${input.lane} only opens its tasks to the roles ${rule.roles.join(", ")} the user configured; the ${input.agentrole} agent may not steal.` };
  return { allowed: true, reason: rule === void 0 ? `The lane ${input.lane} carries no ownership rule, so every agent of the approved swarm may steal its tasks.` : `The lane ${input.lane} opens its tasks to the ${input.agentrole} role the user configured.` };
}
function agentbudgetvalid(budget) {
  if (budget.agentid.trim() === "") return { allowed: false, reason: "The agent budget needs its agent id." };
  if (budget.maxtokens !== void 0 && (!Number.isFinite(budget.maxtokens) || budget.maxtokens <= 0)) return { allowed: false, reason: "The token ceiling of an agent budget must stay a positive user value." };
  if (budget.maxcost !== void 0 && (!Number.isFinite(budget.maxcost) || budget.maxcost <= 0)) return { allowed: false, reason: "The cost ceiling of an agent budget must stay a positive user value." };
  if (budget.maxsteps !== void 0 && (!Number.isFinite(budget.maxsteps) || budget.maxsteps <= 0)) return { allowed: false, reason: "The step ceiling of an agent budget must stay a positive user value." };
  if (budget.maxcost !== void 0 && (budget.currency === void 0 || budget.currency.trim() === "")) return { allowed: false, reason: "The cost ceiling of an agent budget needs its currency unit." };
  if (budget.maxtokens === void 0 && budget.maxcost === void 0 && budget.maxsteps === void 0) return { allowed: false, reason: "The agent budget needs at least one ceiling the user configured; an absent budget stays the documented unbounded choice." };
  return { allowed: true };
}
function agentscopevalid(input) {
  if (input.scope.agentid.trim() === "") return { allowed: false, reason: "The agent scope needs its agent id." };
  if (input.scope.origins.some((origin) => origin.trim() === "")) return { allowed: false, reason: "Every origin of an agent scope needs its user configured name." };
  if (input.scope.toolnamespaces.some((namespace) => !toolnamespaces.includes(namespace))) return { allowed: false, reason: "Every tool namespace of an agent scope must be one of the catalog namespaces." };
  const outside = input.scope.origins.filter((origin) => input.grants.length > 0 && !input.grants.includes(origin));
  if (outside.length > 0) return { allowed: false, reason: `The agent scope grants the origins ${outside.join(", ")} which the session grant list does not carry; no agent scope widens the session.` };
  return { allowed: true };
}
function spawngrade(request) {
  if (request.parentid.trim() === "") return { allowed: false, reason: "The spawn request needs its parent agent id." };
  if (request.task.trim() === "") return { allowed: false, reason: "The spawn request needs its task in plain language." };
  if (request.depth < 1) return { allowed: false, reason: "The spawn request depth must sit at one or deeper because every sub agent lives under a parent." };
  const risk = request.role === "planner" || request.role === "observer" ? "read" : "sensitive";
  return { allowed: true, reason: risk === "read" ? `The spawn of the ${request.role} sub agent grades read side: the role composes or observes and never executes page actions.` : `The spawn of the ${request.role} sub agent grades sensitive: the role may execute reviewed steps, so every proposal it drafts still passes the same human review.` };
}
function killswitchgate(input) {
  if (input?.triggeredby === "agent") return { allowed: false, reason: "The killswitch stays user triggered only: no agent ever engages the switch, because the halt of the whole fleet stays a human action." };
  const paused = input?.pausedagents ?? 0;
  return { allowed: true, reason: `The killswitch stays available with no configuration barrier: the user halts every agent of the fleet at once at any time${paused > 0 ? `, and the switch stays effective over the ${paused} paused agent${paused === 1 ? "" : "s"} because a pause never shields an agent from the stop` : ""}.` };
}
function messageegressgrade(input) {
  if (input.message.payload.trim() === "") return { allowed: false, reason: "The agent message needs its payload." };
  if (input.carriespagecontent) return { allowed: true, reason: `The message ${input.message.id} from ${input.message.senderid} to ${input.message.recipient} carries page content and grades as a data egress event with its sender, recipient and routing in the audit trail.` };
  return { allowed: true, reason: `The message ${input.message.id} from ${input.message.senderid} to ${input.message.recipient} carries no page content and stays a plain swarm delivery.` };
}
function blackboardconsentgrade(entry) {
  if (entry.key.trim() === "") return { allowed: false, reason: "The blackboard entry needs its key." };
  if (entry.consentclass !== "read" && entry.consentclass !== "interaction" && entry.consentclass !== "sensitive") return { allowed: false, reason: "The blackboard entry inherits one of the three consent classes of its source extraction." };
  if (entry.consentclass === "sensitive") return { allowed: true, reason: `The blackboard entry ${entry.key} inherits the sensitive class of its source extraction; every agent reads the class beside the value.` };
  return { allowed: true, reason: `The blackboard entry ${entry.key} inherits the ${entry.consentclass} class of its source extraction; every agent reads the class beside the value.` };
}
function leaderelectionvalid(input) {
  if (input.rule.kind !== "first" && input.rule.kind !== "named") return { allowed: false, reason: "The leader election rule stays first or named as the user configured it." };
  if (input.rule.kind === "named") {
    if (input.rule.agentid === void 0 || input.rule.agentid.trim() === "") return { allowed: false, reason: "The named leader election rule needs the agent id the user named." };
    if (!input.agents.some((agent) => agent.id === input.rule.agentid && agent.state !== "stopped")) return { allowed: false, reason: `The named leader election rule names the agent ${input.rule.agentid} which is not a live agent of the swarm.` };
  }
  return { allowed: true, reason: input.rule.kind === "first" ? "The first registration rule elects the leader exactly as the user configured." : `The named rule elects the agent ${input.rule.agentid} exactly as the user configured.` };
}
function criticreviewgrade(review) {
  if (review.reviewerid.trim() === "") return { allowed: false, reason: "The critic review needs its reviewing agent." };
  if (review.subjectagentid.trim() === "") return { allowed: false, reason: "The critic review needs the subject agent whose output it reviews." };
  if (review.verdict !== "approve" && review.verdict !== "changes" && review.verdict !== "reject") return { allowed: false, reason: "The critic review carries one of the three verdicts approve, changes or reject." };
  if (review.verdict === "changes" && review.requiredchanges.length === 0) return { allowed: false, reason: "A changes verdict needs its required changes in plain language." };
  if (review.verdict === "reject" && review.issues.length === 0) return { allowed: false, reason: "A reject verdict needs the issues the critic found." };
  return { allowed: true, reason: `The critic review of the output of ${review.subjectagentid} stays read only: the critic ${review.reviewerid} returns its ${review.verdict} verdict and never acts on the page; the rework still passes the same human review.` };
}
function verifiermethodgrade(input) {
  if (input.method.trim() === "") return { allowed: false, reason: "The verifier check needs the method it used." };
  if (input.allowed.length > 0 && !input.allowed.includes(input.method)) return { allowed: false, reason: `The verifier method ${input.method} is not one of the methods the user allowed: ${input.allowed.join(", ")}.` };
  return { allowed: true, reason: input.allowed.length === 0 ? `The verifier method ${input.method} runs under the documented open method list the user chose not to narrow.` : `The verifier method ${input.method} sits inside the methods the user allowed.` };
}
function handoffgrantgate(input) {
  if (input.record.toagentid.trim() === "" || input.record.fromagentid.trim() === "") return { allowed: false, reason: "The handoff names its transferring and receiving agents." };
  if (input.toscope === void 0) return { allowed: true, reason: `The receiving agent ${input.record.toagentid} carries no narrowed scope, so the handoff stays unbounded inside the original session grants.` };
  const outside = input.toscope.origins.filter((origin) => input.sessiongrants.length > 0 && !input.sessiongrants.includes(origin));
  if (outside.length > 0) return { allowed: false, reason: `The handoff to ${input.record.toagentid} would need the origins ${outside.join(", ")} which the session grant list does not carry; a tab transfer never widens the session grants.` };
  return { allowed: true, reason: `The handoff from ${input.record.fromagentid} to ${input.record.toagentid} preserves the original session grants; the receiving scope stays inside them.` };
}
function lockscopevalid(lock) {
  if (lock.key.trim() === "") return { allowed: false, reason: "The resource lock needs its key." };
  if (lock.origin.trim() === "" || lock.selector.trim() === "") return { allowed: false, reason: "The resource lock names exactly one origin and one selector; a lock never spans unrelated origins." };
  if (lock.key !== `${lock.origin}|${lock.selector}`) return { allowed: false, reason: "The lock key must compose of its one origin and its one selector so the scope never spans unrelated origins." };
  if (lock.kind !== "exclusive" && lock.kind !== "shared") return { allowed: false, reason: "The lock kind stays exclusive or shared." };
  return { allowed: true, reason: `The lock ${lock.key} spans exactly one target of one origin for the holder ${lock.holder}.` };
}
function conflictresolutiongrade(rule) {
  if (rule !== "first" && rule !== "last" && rule !== "preferagent" && rule !== "fail") return { allowed: false, reason: "The conflict resolution rule stays first, last, preferagent or fail as the user configured it." };
  if (rule === "last" || rule === "preferagent") return { allowed: true, reason: `The ${rule} conflict resolution rule overwrites one parallel value with another, so it grades sensitive and the merged report still passes the human review.` };
  return { allowed: true, reason: `The ${rule} conflict resolution rule keeps or refuses the parallel values without overwriting, so it grades read side.` };
}
function escalationgate(escalation) {
  if (escalation.agentid.trim() === "") return { allowed: false, reason: "The escalation names the agent whose decision it lifts." };
  if (escalation.subject.trim() === "") return { allowed: false, reason: "The escalation needs its subject." };
  if (escalation.context.trim() === "") return { allowed: false, reason: "The escalation needs its full context in plain language; the user decides on what the agent saw." };
  if (escalation.state === "decided" && (escalation.decision === void 0 || escalation.decision.trim() === "")) return { allowed: false, reason: "A decided escalation carries the decision the user wrote." };
  return { allowed: true, reason: `The escalation of ${escalation.agentid} stays human decided: the agent lifts the stalled decision with its full context and the user alone writes the outcome.` };
}
function consensusquorumvalid(input) {
  if (!Number.isInteger(input.quorum) || input.quorum < 1) return { allowed: false, reason: "The consensus quorum stays a positive whole number the user configured." };
  if (input.quorum > input.voters) return { allowed: false, reason: `The consensus quorum ${input.quorum} exceeds the ${input.voters} voting agents the user counted; an unreachable quorum never carries.` };
  return { allowed: true, reason: `The consensus quorum ${input.quorum} of ${input.voters} voting agents stays the user configured value with no engine default.` };
}
function workerscalevalid(bound) {
  if (bound === void 0) return { allowed: true, reason: "No worker bound is configured, so the worker scale stays the user choice alone with no engine cap." };
  if (!Number.isFinite(bound) || bound < 1) return { allowed: false, reason: "The worker scale bound stays a positive user value; no engine cap exists." };
  return { allowed: true, reason: `The worker scale bound ${bound} stays the user configured value; the scaling never passes it and no engine cap exists.` };
}
function mergeegressgrade(input) {
  if (input.report.title.trim() === "") return { allowed: false, reason: "The merged report needs its title before any export." };
  if (input.carriespagecontent) return { allowed: true, reason: `The export of the report ${input.report.title} carries page content from the sources ${input.report.sources.join(", ")} and grades as a data egress event in the audit trail.` };
  return { allowed: true, reason: `The export of the report ${input.report.title} carries no page content and stays a plain report export.` };
}
function stepenvironmentvalid(step) {
  if (step.environment !== void 0 && step.environment !== "pagecontext" && step.environment !== "isolatedworld" && step.environment !== "offscreenworker" && step.environment !== "sandboxframe") return { allowed: false, reason: "The step environment stays one of pagecontext, isolatedworld, offscreenworker and sandboxframe." };
  const allowed = environmentsof(step);
  if (step.environment !== void 0 && !allowed.includes(step.environment)) return { allowed: false, reason: `The ${step.environment} environment sits outside the ${allowed.join(", ")} the ${step.kind} kind permits; the review sees the environment of every step.` };
  return { allowed: true, reason: step.environment === void 0 ? `The ${step.kind} step carries no environment field and routes to its ${defaultenvironment(step)} default.` : `The ${step.environment} environment of the ${step.kind} step sits inside the ${allowed.join(", ")} the kind permits.` };
}
function environmentgrantgate(step, grants) {
  if (grants === void 0 || grants.length === 0) return { allowed: true, reason: `The session carries no environment grant list, so the ${defaultenvironment(step)} default of the ${step.kind} step stays the documented posture behind the same review.` };
  const environment = step.environment ?? defaultenvironment(step);
  if (!grants.includes(environment)) return { allowed: false, reason: `The ${environment} environment sits outside the ${grants.join(", ")} the session granted; no step ever widens the environment grants.` };
  return { allowed: true, reason: `The ${environment} environment of the ${step.kind} step sits inside the ${grants.join(", ")} the session granted.` };
}
function offscreencapabilitygate(input) {
  if (input.environment !== "offscreenworker") return { allowed: true, reason: `The ${input.environment} environment needs no offscreen capability grant.` };
  if (!input.granted) return { allowed: false, reason: "The offscreen worker pool runs only under the user granted offscreen capability; the step falls back to inline parsing inside the page." };
  return { allowed: true, reason: "The offscreen worker pool runs under the user granted offscreen capability." };
}
function keepalivegate(input) {
  if (!input.session) return { allowed: false, reason: "The keepalive port opens only inside an active session." };
  if (input.session.stoppedat !== void 0) return { allowed: false, reason: "The keepalive port stays closed for a stopped session." };
  if (input.session.pausedat !== void 0) return { allowed: false, reason: "The keepalive port stays closed while the session pauses; a resumed run reattaches it." };
  if (input.now > input.session.expiresat) return { allowed: false, reason: "The keepalive port stays closed for an expired session." };
  if (!input.plan || input.plan.state !== "approved") return { allowed: false, reason: "The keepalive port opens only behind an active reviewed plan; unreviewed work never holds the service worker alive." };
  return { allowed: true, reason: `The approved plan ${input.plan.id} of the active session holds the keepalive port open for its whole run.` };
}
function keepaliveintervalvalid(interval) {
  if (!Number.isFinite(interval) || interval <= 0) return { allowed: false, reason: "The keepalive heartbeat interval stays a positive user value in milliseconds." };
  return { allowed: true, reason: `The keepalive heartbeat interval ${interval} milliseconds stays the user configured value; the roadmap documents thirty seconds while the choice stays the user's.` };
}
function workerpoolsizevalid(size) {
  if (size === void 0) return { allowed: true, reason: "No worker pool size is configured, so the pool follows the pending parse queue alone with no engine cap." };
  if (!Number.isInteger(size) || size < 1) return { allowed: false, reason: "The worker pool size stays a positive whole number the user configured; no engine cap exists." };
  return { allowed: true, reason: `The worker pool size ${size} stays the user configured value; no engine cap exists.` };
}
function sandboxorigingate(input) {
  if (input.origin.trim() === "") return { allowed: false, reason: "The sandbox render needs the source origin of its untrusted markup." };
  if (input.allowed.length > 0 && !input.allowed.includes(input.origin)) return { allowed: false, reason: `The origin ${input.origin} sits outside the origins the user allows to render untrusted markup: ${input.allowed.join(", ")}.` };
  return { allowed: true, reason: input.allowed.length === 0 ? `The origin ${input.origin} renders untrusted markup under the documented open origin list the user chose not to narrow.` : `The origin ${input.origin} sits inside the origins the user allows to render untrusted markup.` };
}
function environmentrequirements() {
  return environmentrequirementsof([...allowedactions]);
}
function automationallowlistgate(input) {
  const verdict = allowlistcheck({ origin: input.origin, allowlist: input.allowlist, ...input.session !== void 0 ? { sessionorigin: input.session.origin } : {} });
  if (!verdict.allowed) return { allowed: false, reason: verdict.reason };
  return { allowed: true, reason: verdict.reason };
}
function originprofilegate(input) {
  const verdict = profilegrade(input);
  if (!verdict.allowed) return { allowed: false, reason: verdict.reason };
  return { allowed: true, reason: verdict.reason };
}
function consentwindowgate(input) {
  if (!input.sensitive) return { allowed: true, reason: "The non-sensitive step rides the session origin grants and needs no consent window of its own." };
  const verdict = windowgatesstep({ window: input.window, sessionid: input.sessionid, origin: input.origin, now: input.now });
  if (!verdict.allowed) return { allowed: false, reason: verdict.reason };
  return { allowed: true, reason: verdict.reason };
}
function revokerungate(input) {
  if (input.revocation === void 0) return { allowed: true, reason: "No revocation halted the run; the steps keep their reviewed order." };
  if (input.revocation.sessionid !== input.sessionid) return { allowed: true, reason: "The revocation belongs to another session and halts nothing here." };
  if (input.revocation.runid !== input.runid) return { allowed: true, reason: "The revocation belongs to another run and halts nothing here." };
  return { allowed: false, reason: `The revocation of ${input.revocation.actor} halted the pending step and ${Math.max(0, input.revocation.haltedstepids.length - 1)} queued step${Math.max(0, input.revocation.haltedstepids.length - 1) === 1 ? "" : "s"} without executing them: ${input.revocation.haltedstepids.join(", ")}.` };
}
function sensitiveclassgate(input) {
  if (!input.sensitive) return { allowed: true, reason: "The step carries no sensitive class and needs no fresh consent prompt." };
  const verdict = missingclassconsents({ origin: input.origin, classes: input.classes, bydefault: input.bydefault, consents: input.consents, now: input.now });
  if (verdict.needed) return { allowed: false, reason: verdict.reason };
  return { allowed: true, reason: verdict.reason };
}
function consentdurationvalid(duration) {
  if (!Number.isFinite(duration) || duration <= 0) return { allowed: false, reason: "The consent window duration stays a positive user value in milliseconds; no grant ever defaults to unlimited." };
  return { allowed: true, reason: `The consent window duration ${duration} milliseconds stays the user configured boundary the prompt names.` };
}
function logreadgate(input) {
  if (!input.valid) return { allowed: false, reason: input.brokenat !== void 0 ? `The log chain breaks at entry ${input.brokenat}; the audit accessor refuses the read of a forged record.` : "The log chain fails its verification; the audit accessor refuses the read of a forged record." };
  return { allowed: true, reason: "The log chain verifies from the genesis hash to the last entry; the audit accessor serves the entries." };
}
function sensitivepipelingate(input) {
  const classification = sensitiveclassesof(input.step);
  const profileverdict = originprofilegate({ profile: input.profile, kind: input.step.kind, sensitive: classification.sensitive });
  if (!profileverdict.allowed) return { allowed: false, reason: profileverdict.reason ?? "" };
  const consentverdict = sensitiveclassgate({ origin: input.origin, classes: classification.classes, bydefault: classification.bydefault, sensitive: classification.sensitive, consents: input.consents, now: input.now });
  if (!consentverdict.allowed) return { allowed: false, reason: `${classification.reason} ${consentverdict.reason}` };
  return { allowed: true, reason: `${classification.reason} ${consentverdict.reason}` };
}
function schemaguardgate(input) {
  if (input.errors.length === 0) return { allowed: true, reason: "The inbound command matches its declared schemastrict grammar field by field." };
  const first = input.errors[0];
  return { allowed: false, reason: `${input.errors.length} schema error${input.errors.length === 1 ? "" : "s"} refuse the command before dispatch: ${input.errors.map((error) => error.reason).join(" ")}${first !== void 0 ? ` The first error sits at ${first.path} expecting ${first.expected}.` : ""}` };
}
function protocolnegotiationgate(input) {
  const declared = typeof input.client === "string" || typeof input.client === "number" ? String(input.client) : void 0;
  if (declared === void 0 || declared.trim() === "") return { allowed: true, reason: `The client declared no protocol version, so the negotiation answers the frozen protocolv2 default of ${protocolmajor}.`, major: protocolmajor };
  const match = /^(\d+)/.exec(declared.trim());
  const major = match === null ? void 0 : Number(match[1]);
  if (major === void 0 || major < protocolfloormajor) return { allowed: false, reason: `The client speaks protocol version ${declared} below the supported floor; the supported protocol versions are ${protocolfloormajor} through ${protocolmajor}, and version one assets convert through the migrateplan command and docs/migrationguide.md.` };
  if (major > protocolmajor) return { allowed: false, reason: `The client speaks protocol version ${major} while the server stops at ${protocolmajor}; the supported protocol versions are ${protocolfloormajor} through ${protocolmajor} until a future major bump.` };
  if (major < protocolmajor) return { allowed: true, major, reason: `The client speaks protocol version ${major}: the negotiation agrees inside a compatibility window below the frozen line \u2014 the 2.0.0 sunset closed the version one window the line last carried, so the major two line never reaches this branch and version one assets convert through the migrateplan command and docs/migrationguide.md.` };
  return { allowed: true, major: protocolmajor, reason: "The client speaks the frozen protocolv2 major." };
}
function unknownfieldsgate(input) {
  if (input.unknown.length === 0) return { allowed: true, reason: "The inbound message carries no unknown field." };
  if (input.major >= protocolmajor) return { allowed: false, reason: `Strict schema validation for protocol version ${input.major} refuses the unknown field${input.unknown.length === 1 ? "" : "s"} ${input.unknown.join(", ")} before dispatch; a frozen contract field joins only through a release bump.` };
  return { allowed: false, reason: `Strict schema validation for protocol version ${input.major} refuses the unknown field${input.unknown.length === 1 ? "" : "s"} ${input.unknown.join(", ")} before dispatch; the version one tolerance of the deprecation window closed at 2.0.0, so no protocol major the line accepts tolerates an unknown field.` };
}
function capmanifestdriftgate(input) {
  if (input.drift.length === 0) return { allowed: true, reason: "The capability manifest matches its frozen surface entry for entry." };
  return { allowed: false, reason: `Capability drift of ${input.drift.length} entr${input.drift.length === 1 ? "y" : "ies"} between the frozen manifests: ${input.drift.join("; ")}.` };
}
function origincheckgate(input) {
  if (!input.verdict.accepted) return { allowed: false, reason: input.verdict.reason };
  return { allowed: true, reason: input.verdict.reason };
}
function connectallowgate(input) {
  const verdict = origincheckof(input);
  if (!verdict.accepted) return { allowed: false, reason: verdict.reason };
  return { allowed: true, reason: verdict.reason };
}
function ratelimitboundsvalid(limit, window) {
  const bounds = bucketboundsvalid(limit, window);
  if (!bounds.valid) return { allowed: false, reason: bounds.reason };
  return { allowed: true, reason: bounds.reason };
}
function ratelimitgate(input) {
  if (input.bucket === void 0) return { allowed: true, reason: "No ratelimit bucket covers the origin of the command; the bounds stay user configured choices only." };
  if (input.now >= input.bucket.resetsat) return { allowed: true, reason: `The bucket window of ${input.bucket.origin} reset at ${input.bucket.resetsat}; the command consumes the first slot of its fresh window.` };
  if (input.bucket.used < input.bucket.limit) return { allowed: true, reason: `The command consumes slot ${input.bucket.used + 1} of ${input.bucket.limit} in the bucket of ${input.bucket.origin}.` };
  return { allowed: false, reason: `The bucket of ${input.bucket.origin} holds its ${input.bucket.limit} command bound; the command defers until the window resets at ${input.bucket.resetsat}.` };
}
function confirmpaygate(input) {
  const kind = gatekindfor(input.classes);
  if (kind !== "confirmpay") return { allowed: true, reason: "The step carries no payment class and needs no confirmpay gate." };
  if (input.state === "resolved") return { allowed: true, reason: "The human resolved the confirmpay gate of the payment step; the step dispatches with its reviewed amount, payee origin and target." };
  if (input.state === "refused") return { allowed: false, reason: "The human refused the confirmpay gate of the payment step; the payment never dispatches." };
  if (input.state === "open") return { allowed: false, reason: "The confirmpay gate of the payment step stays open with the amount, the payee origin and the target element; the executor pauses until the human resolves it and no timeout ever resolves a gate." };
  return { allowed: false, reason: "The payment step opens its confirmpay gate with the amount, the payee origin and the target element; the executor pauses until one distinct human action resolves it." };
}
function confirmdeletegate(input) {
  const kind = gatekindfor(input.classes);
  if (kind !== "confirmdelete") return { allowed: true, reason: "The step carries no delete class and needs no confirmdelete gate." };
  if (input.state === "resolved") return { allowed: true, reason: "The human resolved the confirmdelete gate of the destructive step; the step dispatches with its reviewed target, scope and irreversibility." };
  if (input.state === "refused") return { allowed: false, reason: "The human refused the confirmdelete gate of the destructive step; the deletion never dispatches." };
  if (input.state === "open") return { allowed: false, reason: "The confirmdelete gate of the destructive step stays open with the target, the scope and the irreversibility; the executor pauses until the human resolves it and no timeout ever resolves a gate." };
  return { allowed: false, reason: "The destructive step opens its confirmdelete gate with the target, the scope and the irreversibility; the executor pauses until one distinct human action resolves it." };
}
function confirmcredsgate(input) {
  const kind = gatekindfor(input.classes);
  if (kind !== "confirmcreds") return { allowed: true, reason: "The step carries no credential class and needs no confirmcreds gate." };
  if (input.state === "resolved") return { allowed: true, reason: "The human resolved the confirmcreds gate of the credential step; the step reads its value from the vault at the last possible moment and no log records it." };
  if (input.state === "refused") return { allowed: false, reason: "The human refused the confirmcreds gate of the credential step; the credential never dispatches." };
  if (input.state === "open") return { allowed: false, reason: "The confirmcreds gate of the credential step stays open with its credential label only; the executor pauses until the human resolves it and no timeout ever resolves a gate." };
  return { allowed: false, reason: "The credential step opens its confirmcreds gate with its credential label only; the executor pauses until one distinct human action resolves it." };
}
function gatebatchgate(input) {
  if (input.gateids.length === 0) return { allowed: false, reason: "A gate resolution names its single gate." };
  if (input.gateids.length > 1) return { allowed: false, reason: `One human action resolves exactly one gate; the batch of ${input.gateids.length} gates refuses in full because no batch approval exists.` };
  return { allowed: true, reason: "The resolution names exactly one gate; the distinct human action resolves it alone." };
}
function phishthresholdgate(threshold) {
  const verdict = phishthresholdvalid(threshold);
  if (!verdict.valid) return { allowed: false, reason: verdict.reason };
  return { allowed: true, reason: verdict.reason };
}
function phishguardgate(input) {
  if (input.verdict.blocked) return { allowed: false, reason: input.verdict.reason };
  return { allowed: true, reason: input.verdict.reason };
}
function safedefaultsgate(input) {
  if (input.profile !== void 0) return { allowed: true, reason: `The origin profile of ${input.profile.origin} exists; the safedefaults posture stays out of the decision.` };
  if (!input.sensitive) return { allowed: true, reason: "The non-sensitive step rides the reads only baseline of the safedefaults posture; the first visit grants reads alone." };
  return { allowed: false, reason: `No origin profile exists and the safedefaults posture denies the sensitive ${input.classes.length > 0 ? input.classes.join(" and ") : "by default"} step; open the originprofile editor to widen the profile the user controls.` };
}
function vaultsecretgate(input) {
  if (input.leaks.length > 0) return { allowed: false, reason: `The plan carries ${input.leaks.length} plaintext secret value${input.leaks.length === 1 ? "" : "s"} that digest to vault records; secrets never ride step options, variables or plan texts, only the vault holds them.` };
  if (input.carries) return { allowed: false, reason: "The step types a raw value into a masked field shape; credential steps read their value from the vault at the last possible moment and never carry it in the options." };
  return { allowed: true, reason: "The step and the plan carry no secret outside the vault; the values stay behind the seam." };
}
function untrustedrendergate(input) {
  if (input.environment === "sandboxframe") return { allowed: true, reason: "The extracted markup renders inside the sandboxframe under its nonce with scripts and handlers stripped; the untrusted content never reenters the page context." };
  return { allowed: false, reason: `The extracted markup grades untrusted and refuses to render inside the ${input.environment}; every untrusted render routes through the sandboxframe.` };
}
function sitenotesreadgate(input) {
  if (input.grants.includes(input.origin)) return { allowed: true, reason: `The session granted ${input.origin}, so the site notes of the origin read.` };
  return { allowed: false, reason: `The session never granted ${input.origin}; the site notes of the origin refuse the read.` };
}
function sitenoteswritegate(input) {
  if (!input.consent) return { allowed: false, reason: `The site note write for ${input.origin} needs the explicit consent of the user; no note lands without a reviewed write.` };
  return { allowed: true, reason: `The user consented to the site note write for ${input.origin}; the note keeps its author provenance and its timestamps.` };
}
function scratchpadscopegate(input) {
  if (input.taskid !== input.entrytaskid || input.sessionid !== input.entrysessionid) return { allowed: false, reason: `The scratchpad entry belongs to the task ${input.entrytaskid} of the session ${input.entrysessionid}; the task ${input.taskid} of the session ${input.sessionid} never crosses that boundary.` };
  return { allowed: true, reason: `The scratchpad entry belongs to the task ${input.taskid} of the session ${input.sessionid} that asks for it.` };
}
function memoryreadscopegate(input) {
  if (input.phase === "planning" || input.phase === "prompting") return { allowed: true, reason: `The ${input.phase} phase reads the correction and consent memory so the proposal and the prompt carry the prior decisions.` };
  return { allowed: false, reason: `The ${input.phase} phase reads no correction or consent memory; the history serves the planning and the prompting alone.` };
}
function semanticrecallscopegate(input) {
  if (input.origin === void 0) return { allowed: true, reason: `The recall query names no origin, so it ranks the ${input.scope.length} origin${input.scope.length === 1 ? "" : "s"} of the run scope only.` };
  if (!input.scope.includes(input.origin)) return { allowed: false, reason: `The recall query asks for ${input.origin} while the run scope holds ${input.scope.length > 0 ? input.scope.join(", ") : "no origin"}; a recall across origins outside the run scope refuses.` };
  return { allowed: true, reason: `The recall query asks for ${input.origin} inside the run scope; the ranking stays scoped.` };
}
function summarywindowvalid(window) {
  if (window === void 0) return { allowed: true, reason: "No runsummary window is configured, so the distillation keeps every step with no fixed cap." };
  if (!Number.isInteger(window) || window < 0) return { allowed: false, reason: "The runsummary window stays a whole number of steps the user chose; no engine cap exists." };
  return { allowed: true, reason: `The runsummary window of ${window} step${window === 1 ? "" : "s"} stays the user configured choice; no engine cap exists.` };
}
function sessionretentionvalid(window) {
  if (window === void 0) return { allowed: true, reason: "No retention window is configured, so the session store keeps every record forever." };
  if (!Number.isFinite(window) || window <= 0) return { allowed: false, reason: "The retention window stays a positive user value in milliseconds; no engine boundary expires a record." };
  return { allowed: true, reason: `The retention window of ${window} milliseconds stays the user configured choice.` };
}
function consentmemoryadvisorygate(input) {
  if (input.auto) return { allowed: false, reason: `The consent memory never auto grants: the prior decisions of ${input.latest?.origin ?? "the origin"} stay advisory and every grant needs its own prompt.` };
  if (input.latest !== void 0 && input.latest.decision === "deny") return { allowed: true, reason: `The consent memory holds a prior denial for ${input.latest.origin} with the same weight as a grant; the prompt shows the refusal and the user decides again.` };
  return { allowed: true, reason: "The consent memory stays advisory; the prompt opens with the prior decisions and the user decides." };
}
function cancelrungate(input) {
  if (input.rollbackscope === "none") return { allowed: true, reason: `The cancelrun stops the run with no rollback; the ${input.queuedstepids.length} queued step${input.queuedstepids.length === 1 ? "" : "s"} stay as the run left them and the ${input.executedstepids.length} executed step${input.executedstepids.length === 1 ? "" : "s"} stay in the sealed log.` };
  return { allowed: true, reason: `The cancelrun rolls the ${input.queuedstepids.length} queued step${input.queuedstepids.length === 1 ? "" : "s"} back${input.queuedstepids.length > 0 ? ` (${input.queuedstepids.join(", ")})` : ""} while the ${input.executedstepids.length} executed step${input.executedstepids.length === 1 ? "" : "s"} stay untouched in the sealed log.` };
}
function retrydispatchgate(input) {
  if (!input.reviewed) return { allowed: false, reason: `The retry of the step ${input.stepid} passes only through a new reviewed dispatch; an automatic retry never bypasses the review.` };
  return { allowed: true, reason: `The retry of the step ${input.stepid} dispatches again through the full consent gate chain: the session, the plan and the origin gates all recheck the step.` };
}
function paletteactiongate(input) {
  if (input.action.permission !== void 0 && !input.granted.includes(input.action.permission)) return { allowed: false, reason: `The ${input.action.command} command needs the ${input.action.permission} capability granted before the palette lists it; the palette never offers an action the current capability set refuses.` };
  if (input.action.session === true && !input.sessionactive) return { allowed: false, reason: `The ${input.action.command} command needs an active browser session before the palette lists it; the palette never offers a run action without its session.` };
  return { allowed: true, reason: `The ${input.action.command} command rides its granted permissions and lists in the palette.` };
}
function taskinputproposalgate(input) {
  if (input.direct) return { allowed: false, reason: "The taskinput never executes a goal directly; every natural language goal routes through the same proposal flow as the api and becomes a reviewed plan first." };
  if (input.text.trim() === "") return { allowed: false, reason: "The taskinput submission needs its natural language goal; an empty goal never reaches the proposal flow." };
  if (input.origin.trim() === "") return { allowed: false, reason: "The taskinput submission needs its active origin scope; a goal without an origin never reaches the proposal flow." };
  return { allowed: true, reason: `The taskinput goal for ${input.origin} rides the same proposal flow as the api: the observation, the capabilities and the plan review all recheck it.` };
}
function planreviewgate(input) {
  if (input.state === "approved") return { allowed: true, reason: "The plan already passed its review: the approval is the review of record and the execution proceeds." };
  if (!input.reviewed) return { allowed: false, reason: "The pending plan has no plancard review yet; every step renders its card with the risk class, the environment and the options before any execution." };
  return { allowed: true, reason: "The plancard review of the pending plan is open; the resolution of each step stays a distinct human action." };
}
function stepapprovegate(input) {
  if (input.stepids.length === 0) return { allowed: false, reason: "A stepapprove resolution names its single step." };
  if (input.stepids.length > 1) return { allowed: false, reason: `One human action resolves exactly one step; the batch of ${input.stepids.length} steps refuses in full because no batch approval exists.` };
  if (input.surface === "background") return { allowed: false, reason: `The ${input.resolution} resolution of the step ${input.stepids[0]} needs its distinct human action from a surface; the background never resolves a review on its own.` };
  if (input.resolution === "edit") return { allowed: true, reason: `The user edits the step ${input.stepids[0]} from the ${input.surface} before approving; the corrected shape rides the plan and the resolution keeps its human provenance.` };
  return { allowed: true, reason: `The user ${input.resolution === "approve" ? "approved" : "rejected"} the step ${input.stepids[0]} from the ${input.surface}; one distinct human action resolved the step alone.` };
}
function diffpreviewgate(input) {
  if (input.risk !== "sensitive") return { allowed: false, reason: `The ${input.risk} step changes no page or browser state; the diffpreview compares the observed before state with the predicted after state of write class steps only.` };
  return { allowed: true, reason: "The write class step changes page or browser state, so the diffpreview compares its observed before state with its predicted after state." };
}
function onboardingconsentgate(input) {
  if (input.consentevents.length === 0) return { allowed: true, reason: "The onboarding completion writes its single consent scoped event; no consent event exists yet." };
  if (input.consentevents.length === 1) return { allowed: false, reason: `The onboarding already wrote its single consent scoped event ${input.consentevents[0]}; a walkthrough never writes a second one.` };
  return { allowed: false, reason: `The onboarding found ${input.consentevents.length} consent scoped events; a walkthrough writes exactly one and the extra events refuse.` };
}
function logbufferboundvalid(bound) {
  if (bound === void 0) return { allowed: true, reason: "No logstream buffer bound is configured, so the live window keeps every event while the full history stays in memory." };
  if (!Number.isInteger(bound) || bound <= 0) return { allowed: false, reason: "The logstream buffer bound stays a positive whole number of events the user chose; no engine cap exists." };
  return { allowed: true, reason: `The logstream buffer bound of ${bound} event${bound === 1 ? "" : "s"} stays the user configured choice; the full history stays in memory.` };
}
function logstreamegressgate(input) {
  if (input.entries === 0) return { allowed: false, reason: "The audit excerpt names no event of the logstream; an empty range never copies." };
  if (!input.verified) return { allowed: false, reason: "The logstream chain failed its live verification; the audit excerpt refuses the copy because only a verified range leaves the stream." };
  return { allowed: true, reason: `The logstream chain verifies across the ${input.entries} event${input.entries === 1 ? "" : "s"} of the range; the audit excerpt copies as one verified record.` };
}
function quickactiongate(input) {
  if (input.action.origin.trim() === "") return { allowed: false, reason: `The ${input.action.command} quickaction needs the origin of the clicked tab; an originless entry never registers.` };
  if (!input.granted.includes(input.action.origin)) return { allowed: false, reason: `The ${input.action.command} quickaction stays off the ${input.action.origin} tab because its origin holds no allowlist entry; only permitted actions surface.` };
  if (input.action.session === true && !input.sessionactive) return { allowed: false, reason: `The ${input.action.command} quickaction needs an active browser session before it registers; the context menu never offers a run action without its session.` };
  if (input.action.permission !== void 0 && !(input.capabilities ?? []).includes(input.action.permission)) return { allowed: false, reason: `The ${input.action.command} quickaction needs the ${input.action.permission} capability granted before it registers; the context menu never offers an action the current capability set refuses.` };
  return { allowed: true, reason: `The ${input.action.command} quickaction rides the origin allowlist of the clicked ${input.action.origin} tab and registers.` };
}
function omniboxtaskgate(input) {
  if (input.direct) return { allowed: false, reason: "The omnibox keyword never executes a goal directly; every keyword goal routes through the same proposal and review flow as the api and becomes a reviewed plan first." };
  if (input.text.trim() === "") return { allowed: false, reason: "The omnibox task needs its natural language goal after the keyword; an empty goal never reaches the proposal flow." };
  if (input.origin.trim() === "") return { allowed: false, reason: "The omnibox task needs its active origin scope; a goal without an origin never reaches the proposal flow." };
  return { allowed: true, reason: `The omnibox goal for ${input.origin} rides the same proposal flow as the api: the observation, the capabilities and the plan review all recheck it.` };
}
function shortcutkeygate(input) {
  if (!input.palettecommands.includes(input.command)) return { allowed: false, reason: `The ${input.command} shortcut binds no commandpalette command; a shortcut may only trigger a command the palette catalog knows.` };
  if (input.action?.permission !== void 0 && !input.granted.includes(input.action.permission)) return { allowed: false, reason: `The ${input.command} shortcut needs the ${input.action.permission} capability granted before it dispatches; the shortcut never bypasses the palette action gate.` };
  if (input.action?.session === true && !input.sessionactive) return { allowed: false, reason: `The ${input.command} shortcut needs an active browser session before it dispatches; the shortcut never bypasses the palette action gate.` };
  return { allowed: true, reason: `The ${input.command} shortcut dispatches through the same palette action gate the commandpalette rides; its gates stay intact.` };
}
function notificationcontentgate(input) {
  if (!input.content) return { allowed: true, reason: "The notification body carries no page content, so no content consent is needed and it shows." };
  if (!input.consent) return { allowed: false, reason: "The notification body carries page content and no content consent exists; a content bearing notification never shows without its consent." };
  return { allowed: true, reason: "The notification body carries page content and its consent exists, so it shows with the content the user agreed to." };
}
function pickeroverlaygate(input) {
  if (input.origin.trim() === "") return { allowed: false, reason: "The pickeroverlay session needs its origin; an originless read never starts." };
  if (!input.granted.includes(input.origin)) return { allowed: false, reason: `The pickeroverlay reads no element candidate of ${input.origin} because the origin holds no allowlist entry; picker reads stay inside the granted origins.` };
  return { allowed: true, reason: `The pickeroverlay lists the element candidates of the granted origin ${input.origin} with their stability scored selectors.` };
}
function shotpanelgate(input) {
  if (input.captureorigin.trim() === "") return { allowed: false, reason: "The shotpanel view needs the origin of its capture; an originless capture never opens." };
  if (!input.granted.includes(input.captureorigin)) return { allowed: false, reason: `The shotpanel opens no capture of ${input.captureorigin} because the origin holds no allowlist entry; capture views stay inside the granted origins.` };
  return { allowed: true, reason: `The shotpanel previews the capture of the granted origin ${input.captureorigin} with its redaction verdicts.` };
}
function siteprofilegate(input) {
  const origin = input.origin.trim();
  if (origin === "") return { allowed: false, reason: "The siteprofile needs its origin; an originless profile never stores." };
  if (!origin.startsWith("https://") || origin.length <= "https://".length) return { allowed: false, reason: `The siteprofile stores per site interface preferences of https origins only; ${origin} holds no https origin shape.` };
  return { allowed: true, reason: `The siteprofile of ${origin} stores its theme, shortcutkeys and default view beside the originprofiles policy preferences; no profile ever adjusts a policy gate.` };
}
function importexportgate(input) {
  if (input.containssecrets) return { allowed: false, reason: "The importexport bundle carries a secretvault value shape; secret values never leave the browser under any flag, so the bundle refuses in full." };
  if (input.unmaskedlogs) return { allowed: false, reason: "The importexport bundle carries unmasked log entries; only masked summaries ever move between profiles, so the bundle refuses in full." };
  return { allowed: true, reason: "The importexport bundle carries no secretvault value and no unmasked log; the originprofiles, the siteprofiles, the notes and the preferences move with their honest exclusion list." };
}
function librarymanifestgate(input) {
  if (input.errors.length > 0) return { allowed: false, reason: `The flowlibrary manifest fails schemastrict with ${input.errors.length} error${input.errors.length === 1 ? "" : "s"}: ${input.errors.slice(0, 3).map((error) => `${error.path} expected ${error.expected}`).join("; ")}; the import refuses before anything else.` };
  return { allowed: true, reason: "The flowlibrary manifest passes schemastrict with no shape error; the validation names every field it checked." };
}
function librarycapabilitygate(input) {
  const missing = [...new Set(input.kinds)].filter((kind) => !input.capabilities.includes(kind));
  if (missing.length > 0) return { allowed: false, reason: `The flowlibrary manifest uses the kind${missing.length === 1 ? "" : "s"} ${missing.join(", ")} the installed capability set lacks; the import refuses in full.` };
  return { allowed: true, reason: `Every kind of the flowlibrary manifest sits inside the installed capability set of ${input.capabilities.length} kind${input.capabilities.length === 1 ? "" : "s"}.` };
}
function librarygrantgate(input) {
  const missing = [...new Set(input.requiredgrants)].filter((origin) => !input.heldgrants.includes(origin));
  if (missing.length > 0) return { allowed: false, reason: `The flowlibrary manifest requires the grant${missing.length === 1 ? "" : "s"} ${missing.join(", ")} the profile does not hold; the grant diff shows them and the user grants them before the import completes.` };
  return { allowed: true, reason: `The profile holds every grant the flowlibrary manifest requires${input.requiredgrants.length === 0 ? " and the manifest requires none" : ""}.` };
}
function librarysensitivegate(input) {
  if (!input.sensitive) return { allowed: true, reason: "The flowlibrary manifest carries no sensitive mark, so no fresh consent prompt stands before its import." };
  if (!input.freshconsent) return { allowed: false, reason: "The flowlibrary manifest is marked sensitive; its import needs a fresh consent prompt the user answers before anything lands." };
  return { allowed: true, reason: "The user answered the fresh consent prompt of the sensitive flowlibrary manifest; the import proceeds behind the same review." };
}
function libraryquarantinegate(input) {
  if (!input.signaturepresent && !input.verified) return { allowed: false, reason: "The flowlibrary entry carries no publisher signature; the entry quarantines until the user verifies its publisher, and a quarantined entry never installs on its own." };
  if (input.signaturepresent && !input.signaturevalid) return { allowed: false, reason: "The publisher signature of the flowlibrary entry failed its verification; the entry quarantines and never installs under any flag." };
  return { allowed: true, reason: "The publisher signature of the flowlibrary entry verified over its manifest digest; the entry stays available for the grant diff and the import." };
}
function libraryimportgate(input) {
  if (!input.proposal) return { allowed: false, reason: "A library import lands as a proposal only; no template ever executes directly and the plan review gates every step as always." };
  if (!input.planreviewed) return { allowed: false, reason: "The library import proposal has no plan review yet; the plancards render and the user approves one step at a time before any execution." };
  return { allowed: true, reason: "The library import landed as a proposal and its plan passed the same review as every native task; the consent gates never moved." };
}
function syncbridgeoptingate(input) {
  if (!input.optin) return { allowed: false, reason: "The syncbridge hook stays off because no explicit opt in exists; no hook ever defaults on and no manifest moves without the user turning the hook on." };
  return { allowed: true, reason: "The user explicitly opted the syncbridge hook in; the hook moves manifests only and never secrets or logs." };
}
function syncbridgescopegate(input) {
  if (input.carriessecrets) return { allowed: false, reason: "The syncbridge payload carries a secretvault value shape; the bridge moves manifests only, so the payload refuses in full." };
  if (input.carrieslogs) return { allowed: false, reason: "The syncbridge payload carries log entries; the bridge moves manifests only, so the payload refuses in full." };
  return { allowed: true, reason: "The syncbridge payload carries manifests only; secrets and logs never ride the bridge under any flag." };
}
function runreplaygate(input) {
  if (!input.sealed) return { allowed: false, reason: "The runreplay walks sealed runs only; an open run keeps moving and its replay would show a chain that still grows." };
  if (!input.chainvalid) return { allowed: false, reason: "The sealed chain of the run failed its verification; the replay refuses the walk because only a verified chain stands as audit evidence." };
  return { allowed: true, reason: "The run sealed and its chain verified from the genesis hash to the seal; the replay walks it read only, restoring the observation and capture of each step." };
}
function outputcomparegate(input) {
  if (input.signaturea.trim() === "" || input.signatureb.trim() === "") return { allowed: false, reason: "The outputcompare needs the task input signature of both runs; a signatureless run never compares." };
  if (input.signaturea !== input.signatureb) return { allowed: false, reason: "The two runs carry different task input signatures; only runs that started from the same input compare their outcomes." };
  return { allowed: true, reason: "The two runs share their task input signature, so their step outcomes compare under the recorded metric set." };
}
function outputcomparereadonlygate(input) {
  if (input.executessteps) return { allowed: false, reason: "The outputcompare never executes a step; it reads the stored outcomes of both runs only, so any executing path refuses in full." };
  return { allowed: true, reason: "The outputcompare joins the stored outcomes of both runs without touching the page; no step executes inside a comparison." };
}
function backgroundrungate(input) {
  if (!input.reviewed) return { allowed: false, reason: "The background run queue executes reviewed workflows only; an unreviewed workflow never starts, with or without an open surface." };
  if (!input.keepaliveheld) return { allowed: false, reason: "A background run holds the keepalive signal for its whole duration; a run that releases the signal early stops being a background run." };
  return { allowed: true, reason: "The reviewed workflow runs in the background with the keepalive signal held and every checkpoint restoring it on each worker wake." };
}
var portablerulefamilies = ["origin", "consent", "capability", "schema", "gate", "selector", "control"];
function portablerulesetof(now) {
  return {
    version: packageversion,
    compiledat: now,
    rules: [
      { id: "originprofilegrade", family: "origin", validates: "Every step grades against the originprofile of the plan origin exactly the way the extension grades it." },
      { id: "classconsent", family: "consent", validates: "Every sensitive class of a step needs a fresh consent that covers the origin, the way the extension demands it." },
      { id: "portablecapability", family: "capability", validates: "Every step kind stays inside the capability set the target runtime can execute." },
      { id: "schemastrict", family: "schema", validates: "Every step carries known fields only under schemastrict; unknown fields refuse in full." },
      { id: "gatedeclaration", family: "gate", validates: "Every sensitive step declares its gate explicitly so nothing sensitive runs ungated." },
      { id: "staticselector", family: "selector", validates: "Selectors that cannot resolve without a live page flag so the plan author knows what stays dynamic." },
      { id: "loopbound", family: "control", validates: "Every loop step carries its user configured bound; an unbounded loop refuses." },
      { id: "retrybound", family: "control", validates: "Every retrying step carries its user configured attempts; missing retry bounds flag." }
    ]
  };
}
function portablerulesetgate(ruleset) {
  if (ruleset.rules.length === 0) return { allowed: false, reason: "The portable rule set carries no rule; the cli and the extension share one compiled set and an empty set lints nothing." };
  if (ruleset.version !== packageversion) return { allowed: false, reason: `The portable rule set version ${ruleset.version} does not match the package version ${packageversion}; a cached set from another release refuses in full.` };
  const ids = ruleset.rules.map((rule) => rule.id);
  if (ids.some((id) => id.trim() === "")) return { allowed: false, reason: "Every portable rule needs its id so a diagnostic names the rule that raised it." };
  if (new Set(ids).size !== ids.length) return { allowed: false, reason: "The portable rule ids must stay unique; a duplicated id makes the cached set ambiguous." };
  const families = new Set(ruleset.rules.map((rule) => rule.family));
  for (const family of portablerulefamilies) if (!families.has(family)) return { allowed: false, reason: `The portable rule set lacks its ${family} family rule; the set covers every family or refuses in full.` };
  return { allowed: true, reason: `The portable rule set compiles ${ruleset.rules.length} rules across ${families.size} families at the package version ${ruleset.version}.` };
}
function portablecapabilitygate(input) {
  if (input.kind.trim() === "") return { allowed: false, reason: "The plan step carries no kind; a kindless step maps onto no capability." };
  if (!input.capabilities.includes(input.kind)) return { allowed: false, reason: `The step kind ${input.kind} exceeds the portable capability set; the target runtime executes the kinds ${input.capabilities.join(", ")} only.` };
  return { allowed: true, reason: `The step kind ${input.kind} stays inside the portable capability set of the target runtime.` };
}
function flowrungrantgate(input) {
  if (input.origin.trim() === "") return { allowed: false, reason: "The flowrun needs the origin its plan addresses; an originless run matches no grant." };
  if (input.grantsource === "none") return { allowed: false, reason: "The flowrun needs an origin grant file or an interactive grant prompt; a run without a granted origin never starts, in a terminal or anywhere else." };
  return { allowed: true, reason: `The flowrun reads its origin grant from the ${input.grantsource === "file" ? "grant file" : "interactive prompt"} and holds it for the whole run.` };
}
function exportchaingate(input) {
  if (!input.chainvalid) return { allowed: false, reason: input.reason ?? "The log chain failed its verification; an export of an unverified chain writes nothing." };
  return { allowed: true, reason: "The log chain verified from the genesis hash to the seal; the export writes the verified entries only." };
}
function exportmaskgate(input) {
  if (input.unmasked.length > 0) return { allowed: false, reason: `The export refuses ${input.unmasked.length} unmasked value${input.unmasked.length === 1 ? "" : "s"} (${input.unmasked.join(", ")}); every format honors the mask verdicts or writes nothing.` };
  return { allowed: true, reason: "Every exported value carries its mask verdict; the export writes masked values only." };
}
function headlessconsentgate(input) {
  if (!input.providerpresent) return { allowed: false, reason: "The headless session waits at its consent gate with no provider attached; denydefault refuses the step because no consent gate ever resolves itself." };
  if (input.resolution === "refuse") return { allowed: false, reason: "The consent provider refused the gate; the headless run stops exactly where the extension would stop." };
  return { allowed: true, reason: "The consent provider approved the gate through the host callback; the headless run proceeds with the resolution recorded." };
}
function headlesstelemetrygate(input) {
  if (input.telemetry && !input.hostoptin) return { allowed: false, reason: "The library bundle carries no telemetry by default; a reporting bundle needs the host opt in first." };
  return { allowed: true, reason: input.telemetry ? "Telemetry runs under the host opt in." : "Telemetry stays off; the library bundle reports nothing by default." };
}
function platformmatrixgate(targets) {
  const runtimes = targets.map((target) => target.runtime);
  for (const runtime of ["browser", "node", "bun", "deno"]) {
    const declared = runtimes.filter((value) => value === runtime).length;
    if (declared === 0) return { allowed: false, reason: `The platform matrix lacks its ${runtime} target; the matrix declares every runtime or refuses in full.` };
    if (declared > 1) return { allowed: false, reason: `The platform matrix declares the ${runtime} target ${declared} times; every runtime declares exactly one target.` };
  }
  for (const target of targets) {
    if (target.entry.trim() === "") return { allowed: false, reason: `The ${target.runtime} platform target needs its entry file.` };
    if (target.format === "umd" && target.runtime !== "browser") return { allowed: false, reason: "The umd format serves script tag consumers of the browser target only." };
    if (target.declarations !== true) return { allowed: false, reason: `The ${target.runtime} platform target must emit its declaration files; typedefs cover every entry point.` };
  }
  return { allowed: true, reason: `The platform matrix declares one target per runtime of browser, node, bun and deno with every entry, format and declaration set in place.` };
}
function adaptermappinggate(input) {
  const expected = {
    browser: { storage: "chrome", worker: "webworker", dom: input.headless === true ? "remote" : "livepage" },
    node: { storage: "filesystem", worker: "workerthreads", dom: "remote" },
    bun: { storage: "filesystem", worker: "workerthreads", dom: "remote" },
    deno: { storage: "denokv", worker: "webworker", dom: "remote" }
  };
  const wanted = expected[input.adapter.runtime];
  if (input.adapter.storage !== wanted.storage) return { allowed: false, reason: `The ${input.adapter.runtime} adapter maps its storage to ${input.adapter.storage}; the platform provides ${wanted.storage}.` };
  if (input.adapter.worker !== wanted.worker) return { allowed: false, reason: `The ${input.adapter.runtime} adapter maps its workers to ${input.adapter.worker}; the platform provides ${wanted.worker}.` };
  if (input.adapter.dom !== wanted.dom) return { allowed: false, reason: `The ${input.adapter.runtime} adapter maps its dom to ${input.adapter.dom}; the ${input.headless === true ? "headless session drives a remote browser" : "platform provides a " + wanted.dom}.` };
  if (input.adapter.fetch !== "platform" || input.adapter.timer !== "platform") return { allowed: false, reason: "Every adapter maps its fetch and timer to the platform primitive; no shim wraps them." };
  return { allowed: true, reason: `The ${input.adapter.runtime} adapter maps storage to ${wanted.storage}, workers to ${wanted.worker} and the dom to ${wanted.dom} exactly as its platform provides them.` };
}
function capabilitydowngradegate(input) {
  if (input.failed.length > 0) return { allowed: false, reason: `The capabilities ${input.failed.join(", ")} failed instead of downgrading; a missing capability downgrades its feature and the runtime keeps running.` };
  return { allowed: true, reason: input.downgraded.length === 0 ? "Every capability is present; no feature downgrades." : `The capabilities downgraded ${input.downgraded.length} feature${input.downgraded.length === 1 ? "" : "s"} without failing the runtime.` };
}
function actionkindcatalog() {
  return [...allowedactions].sort();
}
function lazyloadgate(input) {
  if (input.module.id.trim() === "") return { allowed: false, reason: "The lazy module needs its id; an idless module maps onto no command." };
  const missing = input.module.capabilities.filter((capability) => !input.granted.includes(capability));
  if (missing.length > 0) return { allowed: false, reason: `The lazy module ${input.module.id} declares the capabilit${missing.length === 1 ? "y" : "ies"} ${missing.join(", ")} the user never granted; lazy loading never hides a capability from the check.` };
  return { allowed: true, reason: `The lazy module ${input.module.id} resolves under the same capability check the eager path runs; the load stays transparent to the review.` };
}
function debouncewindowvalid(input) {
  if (input.window === void 0) return { allowed: true, reason: `The ${input.kind} events pass through uncoalesced; the user set no debouncedom window and the engine sets none.` };
  if (!Number.isFinite(input.window) || input.window <= 0) return { allowed: false, reason: `The ${input.kind} debouncedom window must stay a positive number of milliseconds; the window stays the user's choice.` };
  return { allowed: true, reason: `The ${input.kind} debouncedom window of ${input.window} milliseconds stays the user's choice with no engine cap.` };
}
function batchqueryplangate(plan) {
  if (plan.selectors.length === 0) return { allowed: false, reason: "The batchquery plan carries no selector; a selectorless pass queries nothing." };
  const distinct = new Set(plan.selectors);
  if (distinct.size !== plan.selectors.length) return { allowed: false, reason: "The batchquery plan carries a repeated selector; the plan folds every duplicate into one distinct selector." };
  if (!plan.onepass) return { allowed: false, reason: "The batchquery plan executes its grouped selectors in one pass; a multi pass plan recomputes what it could fold." };
  return { allowed: true, reason: `The batchquery plan folds ${plan.folded} duplicate selector${plan.folded === 1 ? "" : "s"} into one pass of ${plan.selectors.length} distinct selector${plan.selectors.length === 1 ? "" : "s"}.` };
}
function incrsnapshotgate(input) {
  if (!input.baseexists) return { allowed: false, reason: `The incrsnapshot delta needs its base snapshot ref ${input.delta.baseref}; a baseless delta recomputes nothing.` };
  if (input.delta.runid !== input.runid) return { allowed: false, reason: `The incrsnapshot delta belongs to the run ${input.delta.runid} while the run ${input.runid} asked for it; a delta never crosses runs.` };
  return { allowed: true, reason: input.delta.full ? "The incrsnapshot cadence elapsed and the builder emits one full snapshot under the same run." : `The incrsnapshot delta carries ${input.delta.changes.length} changed region${input.delta.changes.length === 1 ? "" : "s"} against the base ${input.delta.baseref} of the same run.` };
}
function selcachegate(entry, generation) {
  if (entry.selector.trim() === "") return { allowed: false, reason: "The selcache entry needs its selector; a selectorless entry resolves nothing." };
  if (entry.generation !== generation) return { allowed: false, reason: `The selcache entry for ${entry.selector} resolves from generation ${entry.generation} while the run stands at generation ${generation}; revalidate the entry or query the selector fresh.` };
  return { allowed: true, reason: `The selcache entry for ${entry.selector} resolves from the current generation ${generation}; the revalidation query confirms it before the dispatch.` };
}
function streamparsegate(input) {
  if (input.chunk.index !== input.expectedindex) return { allowed: false, reason: `The streamparse chunk carries index ${input.chunk.index} while the stream expects ${input.expectedindex}; an out of order chunk never yields observations.` };
  if (input.chunk.bytes <= 0) return { allowed: false, reason: `The streamparse chunk ${input.chunk.index} carries no bytes; an empty chunk never passes schemastrict.` };
  return { allowed: true, reason: `The streamparse chunk ${input.chunk.index} passes the schemastrict shape with ${input.chunk.tokens.length} token${input.chunk.tokens.length === 1 ? "" : "s"} and yields its observations progressively.` };
}
function chunkextractgate(input) {
  if (input.cursor.tableid.trim() === "") return { allowed: false, reason: "The chunkextract cursor needs its table id; a cursorless window extracts nothing." };
  if (input.cursor.fingerprint.trim() === "") return { allowed: false, reason: "The chunkextract cursor needs its table fingerprint; a fingerprintless resume never continues." };
  if (input.cursor.tableid !== input.tableid) return { allowed: false, reason: `The chunkextract cursor belongs to the table ${input.cursor.tableid} while the resume addresses ${input.tableid}; open a fresh cursor.` };
  if (input.cursor.fingerprint !== input.fingerprint) return { allowed: false, reason: "The table fingerprint changed since the cursor stopped; the resume refuses so no window mixes two table states." };
  return { allowed: true, reason: `The chunkextract cursor resumes at row ${input.cursor.rowindex} of the unchanged table ${input.tableid} with its ${input.cursor.window} row window.` };
}
function workerbackpressuregate(input) {
  if (input.depth === void 0) return { allowed: true, reason: `The worker queue runs unbounded at ${input.pending} pending parse task${input.pending === 1 ? "" : "s"}; the user set no depth and the engine sets none.` };
  if (!Number.isFinite(input.depth) || input.depth <= 0) return { allowed: false, reason: "The worker queue depth must stay a positive task count; the depth stays the user's choice." };
  return { allowed: true, reason: `The worker queue admits ${Math.min(input.pending, input.depth)} of ${input.pending} pending parse task${input.pending === 1 ? "" : "s"} under the user depth of ${input.depth}; the overflow defers and never refuses.` };
}
function virtlistwindowvalid(input) {
  if (input.rows === void 0) return { allowed: true, reason: `The ${input.surface} list renders every row; the user set no virtlist window and the engine sets none.` };
  if (!Number.isFinite(input.rows) || input.rows <= 0) return { allowed: false, reason: `The ${input.surface} virtlist window must stay a positive row count; the window stays the user's choice.` };
  return { allowed: true, reason: `The ${input.surface} virtlist window renders ${input.rows} row${input.rows === 1 ? "" : "s"} at a time while the full list stays in memory.` };
}
function perfprovenancegate(record) {
  if (record.runid.trim() === "") return { allowed: false, reason: "The perf record needs its run id; a runless record measures nothing." };
  if (record.stepid.trim() === "") return { allowed: false, reason: "The perf record needs its step id; a stepless record attributes nothing." };
  if (record.provenance === void 0 || Object.keys(record.provenance).length === 0) return { allowed: false, reason: "The perf record attaches its provenance; a record without provenance never enters the tuning view." };
  return { allowed: true, reason: `The perf record of the step ${record.stepid} carries its duration, queries, cache hits and its ${Object.keys(record.provenance).length} provenance field${Object.keys(record.provenance).length === 1 ? "" : "s"}.` };
}
function lazybudgetvalid(input) {
  if (input.budget === void 0) return { allowed: true, reason: `The startup path carries ${input.prewarmed} prewarmed module${input.prewarmed === 1 ? "" : "s"}; the user set no budget and the engine sets none.` };
  if (!Number.isFinite(input.budget) || input.budget <= 0) return { allowed: false, reason: "The startup module budget must stay a positive module count; the budget stays the user's choice." };
  return { allowed: true, reason: input.prewarmed > input.budget ? `The prewarm set of ${input.prewarmed} modules exceeds the user startup budget of ${input.budget}; the view reports the overrun while every load stays allowed.` : `The prewarm set of ${input.prewarmed} modules stays inside the user startup budget of ${input.budget}.` };
}
function batchwindowvalid(input) {
  if (input.window === void 0) return { allowed: true, reason: "The batch run queue never pauses; the user set no backpressure window and the engine sets none." };
  if (!Number.isFinite(input.window) || input.window <= 0) return { allowed: false, reason: "The batch backpressure window must stay a positive step count; the window stays the user's choice." };
  return { allowed: true, reason: `The batch run queue pauses its enqueueing when the completed outcomes fall more than ${input.window} step${input.window === 1 ? "" : "s"} behind; the pause never drops a queued step.` };
}
function domainlimitsvalid(input) {
  if (input.slots === void 0) return { allowed: true, reason: `The domain ${input.domain} runs unbounded; the user set no concurrency limit and the engine sets none.` };
  if (!Number.isFinite(input.slots) || input.slots <= 0) return { allowed: false, reason: `The concurrency limit of the domain ${input.domain} must stay a positive slot count; the limit stays the user's choice.` };
  return { allowed: true, reason: `The domain ${input.domain} runs at most ${input.slots} concurrent step${input.slots === 1 ? "" : "s"} while its overflow queues per lane; the queue never refuses a step.` };
}
function politedelayvalid(input) {
  if (input.base === void 0 && input.floor === void 0 && input.jitter === void 0) return { allowed: true, reason: `The requests of the domain ${input.domain} run unspaced; the user set no politedelay and the engine sets none.` };
  if (input.base !== void 0 && (!Number.isFinite(input.base) || input.base < 0)) return { allowed: false, reason: `The politedelay base of the domain ${input.domain} must stay a non negative millisecond count; the delay stays the user's choice.` };
  if (input.jitter !== void 0 && (!Number.isFinite(input.jitter) || input.jitter < 0)) return { allowed: false, reason: `The politedelay jitter of the domain ${input.domain} must stay a non negative millisecond window; the jitter stays the user's choice.` };
  return { allowed: true, reason: `The requests of the domain ${input.domain} space themselves through the user politedelay${input.base !== void 0 ? ` of ${input.base} milliseconds` : ""}${input.jitter !== void 0 ? ` with a jitter window of ${input.jitter} milliseconds` : ""}${input.floor !== void 0 ? ` above the per domain floor of ${input.floor} milliseconds` : ""}.` };
}
function adaptivepollvalid(input) {
  if (input.window === void 0) return { allowed: true, reason: "The poll interval stays fixed; the user set no adaptivepoll window and the engine sets none." };
  const { floor, ceiling, growth } = input.window;
  if (!Number.isFinite(floor) || floor <= 0 || !Number.isFinite(ceiling) || ceiling <= 0) return { allowed: false, reason: "The adaptivepoll floor and ceiling must stay positive millisecond counts; the window stays the user's choice." };
  if (floor > ceiling) return { allowed: false, reason: "The adaptivepoll floor must stay at or under its ceiling; the window stays the user's choice." };
  if (growth <= 1) return { allowed: false, reason: "The adaptivepoll growth factor must stay above one so the interval widens and narrows; the factor stays the user's choice." };
  return { allowed: true, reason: `The adaptivepoll window widens to ${ceiling} milliseconds and narrows to ${floor} milliseconds through the user growth factor of ${growth}.` };
}
function runbudgetvalid(input) {
  if (input.stepbudget === void 0 && input.memorybudget === void 0) return { allowed: true, reason: "The runbudget tracker stays informational; the user set no budget and the engine sets none." };
  if (input.stepbudget !== void 0 && (!Number.isFinite(input.stepbudget) || input.stepbudget <= 0)) return { allowed: false, reason: "The step budget must stay a positive step count; the budget stays the user's choice." };
  if (input.memorybudget !== void 0 && (!Number.isFinite(input.memorybudget) || input.memorybudget <= 0 || input.memorybudget > 1)) return { allowed: false, reason: "The memory budget must stay a ratio between zero and one; the budget stays the user's choice." };
  return { allowed: true, reason: `The runbudget tracker reports against the user budget${input.stepbudget !== void 0 ? ` of ${input.stepbudget} step${input.stepbudget === 1 ? "" : "s"}` : ""}${input.memorybudget !== void 0 ? ` and the memory ratio of ${input.memorybudget}` : ""}; the alerts report and the critical threshold pauses pending a user choice.` };
}
function budgetthresholdsvalid(input) {
  if (input.thresholds === void 0) return { allowed: true, reason: "The budgetalerts stay informational; the user set no thresholds and the engine sets none." };
  const { warning, critical } = input.thresholds;
  if (warning !== void 0 && (!Number.isFinite(warning) || warning <= 0 || warning > 1)) return { allowed: false, reason: "The warning threshold must stay a ratio between zero and one; the threshold stays the user's choice." };
  if (critical !== void 0 && (!Number.isFinite(critical) || critical <= 0 || critical > 1)) return { allowed: false, reason: "The critical threshold must stay a ratio between zero and one; the threshold stays the user's choice." };
  if (warning !== void 0 && critical !== void 0 && warning > critical) return { allowed: false, reason: "The warning threshold must stay at or under the critical threshold so the severity levels keep their order." };
  return { allowed: true, reason: `The budgetalerts fire at the user thresholds${warning !== void 0 ? ` with the warning at ${warning}` : ""}${critical !== void 0 ? ` and the critical pause at ${critical}` : ""}.` };
}
function timeoutboundvalid(input) {
  if (input.bound === void 0) return { allowed: true, reason: "The steps never abort on time; the user set no timeout bound and the engine sets none." };
  if (!Number.isFinite(input.bound) || input.bound <= 0) return { allowed: false, reason: "The timeout bound must stay a positive millisecond count; the bound stays the user's choice." };
  return { allowed: true, reason: `A step that runs past the user timeout bound of ${input.bound} milliseconds aborts with its cancel event recorded in the immutable log beside its outcome.` };
}
function timeoutrecordeventgate(input) {
  if (input.event.stepid.trim() === "") return { allowed: false, reason: "The timeoutcancel event needs its step id; a stepless abort attributes nothing." };
  if (!input.event.logged) return { allowed: false, reason: `The timeoutcancel of the step ${input.event.stepid} carries no immutable log entry; the abort must record its cancel event beside the step outcome.` };
  return { allowed: true, reason: `The timeoutcancel of the step ${input.event.stepid} recorded its cancel event in the immutable log beside the step outcome.` };
}
function suspendwindowvalid(input) {
  if (input.window === void 0) return { allowed: true, reason: "The tabs never suspend during a wait; the user set no suspend window and the engine sets none." };
  if (!Number.isFinite(input.window) || input.window <= 0) return { allowed: false, reason: "The tab suspend window must stay a positive millisecond count; the window stays the user's choice." };
  return { allowed: true, reason: `An idle tab suspends only during a wait longer than the user window of ${input.window} milliseconds; the run state stays preserved across the suspend and restore.` };
}
function sessionreusegate(input) {
  if (input.grant.profile.trim() === "") return { allowed: false, reason: "The sessionreuse grant needs its profile; a profileless grant attaches nothing." };
  if (input.grant.promptid.trim() === "") return { allowed: false, reason: `The sessionreuse of the profile ${input.grant.profile} carries no consent prompt; an authenticated profile attaches only through its explicit per profile prompt.` };
  if (!Number.isFinite(input.grant.consentedat) || input.grant.consentedat <= 0) return { allowed: false, reason: `The consent prompt of the profile ${input.grant.profile} never resolved; the sessionreuse waits for the explicit user answer.` };
  return { allowed: true, reason: `The profile ${input.grant.profile} attaches to the run${input.grant.runid !== void 0 ? ` ${input.grant.runid}` : ""} through its consented prompt ${input.grant.promptid} with its cookies isolated in its own container.` };
}
function resumefingerprintgate(input) {
  if (input.checkpoint.digest.trim() === "") return { allowed: false, reason: `The resume checkpoint of the step ${input.checkpoint.stepid} carries no page digest; a digestless resume never revalidates.` };
  if (input.checkpoint.digest !== input.fingerprint) return { allowed: false, reason: `The page fingerprint changed since the checkpoint of the step ${input.checkpoint.stepid}; the resume refuses so the run never continues against a different page.` };
  return { allowed: true, reason: `The page fingerprint matches the checkpoint digest of the step ${input.checkpoint.stepid}; the resume skips the completed steps and continues.` };
}
function logprunegate(input) {
  const prunedunsealed = input.sealed.filter((run) => input.plan.prune.includes(run.runid) && !run.sealed);
  if (prunedunsealed.length > 0) return { allowed: false, reason: `The logprune plan prunes the unsealed run${prunedunsealed.length === 1 ? "" : "s"} ${prunedunsealed.map((run) => run.runid).join(", ")}; the prune removes whole sealed runs only so the chain stays verifiable.` };
  return { allowed: true, reason: `The logprune plan removes ${input.plan.prune.length} whole sealed run${input.plan.prune.length === 1 ? "" : "s"} past the user window${input.plan.refused.length > 0 ? ` while ${input.plan.refused.length} unsealed run${input.plan.refused.length === 1 ? " stays" : "s stay"}` : ""}; the chain verification summaries always survive.` };
}
function stepprefetchgate(input) {
  if (input.hint.page !== void 0 && !input.plannedpages.includes(input.hint.page)) return { allowed: false, reason: `The stepprefetch hint warms ${input.hint.page} which the reviewed plan never names; the prefetch never reaches an unreviewed page.` };
  const outside = input.hint.selectors.filter((selector) => !input.plannedselectors.includes(selector));
  if (outside.length > 0) return { allowed: false, reason: `The stepprefetch hint precomputes the selector${outside.length === 1 ? "" : "s"} ${outside.join(", ")} which the reviewed plan never names; the prefetch never precomputes an unreviewed selector.` };
  return { allowed: true, reason: `The stepprefetch hint warms its likely next page and its likely next selectors from the plan structure alone; every warming stays inside the reviewed plan.` };
}
function slowmofactorvalid(input) {
  if (input.factor === void 0) return { allowed: true, reason: "The replay keeps its recorded speed; the user set no slowmo factor and the engine sets none." };
  if (!Number.isFinite(input.factor) || input.factor <= 0) return { allowed: false, reason: "The slowmo factor must stay a positive speed multiplier; the factor stays the user's choice." };
  return { allowed: true, reason: `The replay runs at the user slowmo factor of ${input.factor} with its pauses linked to their steptrace spans.` };
}
function replaycheck(input) {
  if (input.key.trim() === "") return { allowed: false, reason: "The replayed step carries no idempotencykey; a keyless replay never deduplicates." };
  if (input.executedkeys.includes(input.key)) return { allowed: false, reason: `The idempotencykey ${input.key} already executed inside the run; the replay skips the duplicate so the side effect never repeats.` };
  return { allowed: true, reason: `The idempotencykey ${input.key} is unknown to the run; the replay runs the step exactly once.` };
}
function checkpointgate(input) {
  if (input.checkpoint.runid !== input.runid) return { allowed: false, reason: `The checkpoint belongs to the run ${input.checkpoint.runid} and not to the run ${input.runid}; the resume refuses a foreign checkpoint.` };
  if (input.checkpoint.digest !== input.digest) return { allowed: false, reason: `The page digest changed since the checkpoint of the step ${input.checkpoint.stepid}; the resume refuses so the run never continues against a different page.` };
  return { allowed: true, reason: `The page digest matches the checkpoint of the step ${input.checkpoint.stepid}; the resume skips its completed steps and continues at the first open step.` };
}
function rollbackgate(input) {
  if (input.choice === "none") return { allowed: false, reason: "The user chose no rollback; the compensating steps stay proposals beside the frozen run state." };
  if (input.failed !== true) return { allowed: false, reason: "The rollback choice names a run that has not failed or cancelled; a running run never compensates." };
  return { allowed: true, reason: "The user explicitly chose the rollback; the compensating steps run inside the origin the approved plan named." };
}
function zombiegate(input) {
  if (input.zombies.length > 0) return { allowed: false, reason: `The zombiecheck reports ${input.zombies.length} unresolved reap${input.zombies.length === 1 ? "" : "s"} (${input.zombies.join(", ")}); the user resolves the reaped run${input.zombies.length === 1 ? "" : "s"} before a new run starts.` };
  return { allowed: true, reason: "The zombiecheck reports no unresolved reap; a new reviewed run may start." };
}
function rollbackorigingate(input) {
  const outside = input.items.filter((item) => item.origin !== input.origin);
  if (outside.length > 0) return { allowed: false, reason: `${outside.length} compensating step${outside.length === 1 ? "" : "s"} target an origin outside ${input.origin}; the rollback stays inside the origin the approved plan named.` };
  return { allowed: true, reason: `Every compensating step stays inside the approved origin ${input.origin}.` };
}
function heartbeatwindowvalid(input) {
  if (input.window === void 0) return { allowed: true, reason: "The heartbeat staleness window keeps the documented roadmap default; the user sets no window and the engine caps nothing." };
  if (!Number.isFinite(input.window) || input.window <= 0) return { allowed: false, reason: "The heartbeat staleness window must stay a positive user value in milliseconds; the window carries no code ceiling." };
  return { allowed: true, reason: `The zombiecheck reaps a running run whose heartbeat stays silent past the user window of ${input.window} milliseconds.` };
}
function offlinegate(input) {
  if (input.reachable) return { action: "execute", reason: "The endpoint answers; the approved plan executes through the reviewed path." };
  return { action: "queue", reason: "The endpoint is unreachable; the approved plan queues in the offlinequeue and replays once connectivity returns." };
}
function queuedtaskexpirygate(input) {
  if (input.task.expiresat <= input.now) return { allowed: false, reason: `The plan window of the queued task ${input.task.planid} passed while offline; the task expires instead of replaying and its run fails for the audit trail.` };
  return { allowed: true, reason: `The plan window of the queued task ${input.task.planid} still holds; the replay drains it in sequence order once connectivity returns.` };
}
function queuedepthvalid(input) {
  if (input.depth === void 0) return { allowed: true, reason: "The offline queue keeps no user depth; every waiting approved plan stays queued and none ever refuses." };
  if (!Number.isInteger(input.depth) || input.depth < 0) return { allowed: false, reason: "The offline queue depth must stay a non-negative whole number of tasks; the depth stays the user's choice with no code cap." };
  return { allowed: true, reason: `The offline queue reports its waiting tasks against the user depth of ${input.depth}; the depth informs and never refuses a queued plan.` };
}
function sessionlockgate(input) {
  if (input.lock === void 0) return { allowed: true, reason: "No sessionlock stands on the session; the run starts through the reviewed path." };
  if (input.lock.runid === input.runid) return { allowed: true, reason: `The sessionlock already belongs to the run ${input.runid}; the run holds its own lock.` };
  if (input.lock.expiresat <= input.now) return { allowed: true, reason: `The sessionlock of the run ${input.lock.holder} expired past its user window; the stale lock leaves before the new run starts.` };
  return { allowed: false, reason: `The sessionlock of the session ${input.lock.sessionid} stays held by the run ${input.lock.holder}; the concurrent run ${input.runid} waits because one session never runs two runs at once.` };
}
function tabisolategate(input) {
  if (input.namespace.trim() === "") return { allowed: true, reason: "The run carries no isolated tab namespace yet; the step runs inside the reviewed tab context." };
  const expected = `tab:${input.tabid}`;
  if (input.namespace !== expected) return { allowed: false, reason: `The run ${input.runid ?? ""} runs inside the isolated namespace ${input.namespace} and the step targets the tab ${input.tabid} of the namespace ${expected}; a run never reaches outside its isolated tab.` };
  return { allowed: true, reason: `The step targets the tab ${input.tabid} of the isolated namespace ${input.namespace} the run owns.` };
}
function urlhistorygate(input) {
  let visitorigin = "";
  try {
    visitorigin = new URL(input.visit.url).origin;
  } catch {
    visitorigin = "";
  }
  const covered = /* @__PURE__ */ new Set([input.origin, ...input.grants ?? []]);
  if (visitorigin === "" || !covered.has(visitorigin)) return { allowed: false, reason: `The url ${input.visit.url} sits outside the approved origin ${input.origin} of the run ${input.visit.runid}; the urlhistory confines every visit to the granted origins.` };
  return { allowed: true, reason: `The visit of ${input.visit.url} stays inside the approved origin ${input.origin}; the urlhistory records it for its run.` };
}
function timelinereadonlygate(input) {
  const readonly = ["view", "render", "bucket", "merge", "export"].some((prefix) => input.operation.toLowerCase().startsWith(prefix));
  if (!readonly) return { allowed: false, reason: `The timeline operation ${input.operation} is not a read only rendering operation; the runtimeline never executes or mutates anything.` };
  return { allowed: true, reason: `The timeline operation ${input.operation} reads the merged stream only; the runtimeline renders and never executes.` };
}
function expirygate(input) {
  if (input.count === 0) return { allowed: false, reason: "No memory item expired under the user expiryrules; the purge pass carries nothing to confirm." };
  if (!input.confirmed) return { allowed: false, reason: `${input.count} memory item${input.count === 1 ? "" : "s"} expired under the user expiryrules; the purge waits behind the explicit confirmation because the expiry never purges on its own.` };
  return { allowed: true, reason: `The user confirmed the purge of ${input.count} expired memory item${input.count === 1 ? "" : "s"}; every purge keeps its summary and its provenance for the audit trail.` };
}
function encryptmemorygate(input) {
  if (!sensitivememoryclassesof(input.memoryclass)) return { allowed: true, reason: `The ${input.memoryclass ?? "general"} memory class stays outside the sensitive classes; the write runs as reviewed${input.encrypted ? " and encrypted" : ""}.` };
  if (!input.enabled) return { allowed: true, reason: `The ${input.memoryclass} memory class is sensitive while encryptrest stays off; the write runs plaintext exactly as the user configured.` };
  if (!input.encrypted) return { allowed: false, reason: `The ${input.memoryclass} memory class is sensitive and encryptrest stays enabled; the plaintext write refuses because the item encrypts at rest.` };
  return { allowed: true, reason: `The sensitive ${input.memoryclass} memory item encrypts at rest through the webcrypto derived key; the key itself never persists.` };
}
function sensitivememoryclassesof(memoryclass) {
  return memoryclass !== void 0 && sensitivememoryclasses.has(memoryclass);
}
function quotacleanupgate(input) {
  if (input.batch.length === 0) return { allowed: false, reason: "The quotawatch proposes no cleanup candidate; the batch carries nothing to approve." };
  if (input.touchesaudit) return { allowed: false, reason: "The cleanup batch touches the audit history; the quotawatch never purges the audit trail and the batch refuses." };
  if (!input.approved) return { allowed: false, reason: `The cleanup batch of ${input.batch.length} candidate${input.batch.length === 1 ? "" : "s"} waits behind the explicit per batch approval; the quota never purges on its own.` };
  return { allowed: true, reason: `The user approved the cleanup batch of ${input.batch.length} candidate${input.batch.length === 1 ? "" : "s"}; the audit history stays untouched while the batch reclaims its bytes.` };
}
function auditexportgate(input) {
  if (!input.useraction) return { allowed: false, reason: "The audit export waits behind an explicit user action; the bundle never streams on its own." };
  return { allowed: true, reason: "The user action opened the audit export; the bundle streams its record without a size cap." };
}
function lockwindowvalid(input) {
  if (input.window === void 0) return { allowed: true, reason: "The sessionlock expiry window keeps the documented roadmap default; the user sets no window and the engine caps nothing." };
  if (!Number.isFinite(input.window) || input.window <= 0) return { allowed: false, reason: "The sessionlock expiry window must stay a positive user value in milliseconds; the window carries no code ceiling." };
  return { allowed: true, reason: `The startup pass expires an abandoned sessionlock whose window of ${input.window} milliseconds passed before the zombiecheck runs.` };
}
function encryptionsecretgate(input) {
  if (input.secret.length === 0) return { allowed: false, reason: "The encryption needs its user secret; the secret entry is a consent prompt and never an optional field." };
  if (!input.consented) return { allowed: false, reason: "The secret entry stays a consent prompt; the user confirms the entry before the key derivation runs." };
  return { allowed: true, reason: "The user entered the encryption secret through its consent prompt; the derived key serves the pass and never persists." };
}
function urlhistoryscopegate(input) {
  const foreign = input.visits.filter((visit) => visit.runid !== input.runid);
  if (foreign.length > 0) return { allowed: false, reason: `${foreign.length} url visit${foreign.length === 1 ? "" : "s"} of another run entered the urlhistory of the run ${input.runid}; the urlhistory stays scoped per run and never merges runs.` };
  return { allowed: true, reason: `Every url visit of the history belongs to the run ${input.runid}; the urlhistory never merges runs.` };
}
function exportprovenancegate(input) {
  const missing = input.items.filter((item) => item.provenance.origin.trim() === "" || item.provenance.runid.trim() === "" || item.provenance.stepid.trim() === "");
  if (missing.length > 0) return { allowed: false, reason: `${missing.length} memory item${missing.length === 1 ? "" : "s"} (${missing.slice(0, 3).map((item) => item.key).join(", ")}) lack${missing.length === 1 ? "s" : ""} provenance; the audit export refuses because the audit trail could not name their origin.` };
  return { allowed: true, reason: "Every memory item of the export carries its provenance; the audit trail names the origin, the run and the step of every stored value." };
}
function agentscopegate(input) {
  if (input.scope === void 0) return { allowed: true, reason: "The step runs under no agent scope; the session grants alone bound it." };
  if (input.scope.readonly === true && input.risk !== void 0 && input.risk !== "read") return { allowed: false, reason: `The read only scope of the agent ${input.scope.agentid} refuses the ${input.kind} step; an observer never acts on the page.` };
  if (input.scope.actionkinds !== void 0 && input.scope.actionkinds.length > 0 && !input.scope.actionkinds.includes(input.kind)) return { allowed: false, reason: `The agent scope of ${input.scope.agentid} grants no ${input.kind} step; the narrowed action kinds stay ${input.scope.actionkinds.slice(0, 5).join(", ")}${input.scope.actionkinds.length > 5 ? " and more" : ""}.` };
  if (input.origin !== void 0 && input.scope.origins.length > 0 && !input.scope.origins.includes(input.origin)) return { allowed: false, reason: `The agent scope of ${input.scope.agentid} grants no access to the origin ${input.origin}.` };
  return { allowed: true, reason: `The ${input.kind} step of ${input.origin ?? "the granted origin"} sits inside the agent scope of ${input.scope.agentid}.` };
}
function budgetgate(input) {
  if (input.state === void 0) return { allowed: true, reason: "The step runs under no agent budget; the user set none and the engine sets none." };
  const steps = input.steps ?? 1;
  const tokens = input.tokens ?? 0;
  const durationms = input.durationms ?? 0;
  if (input.state.maxsteps !== void 0 && input.state.spentsteps + steps > input.state.maxsteps) return { allowed: false, reason: `The agent ${input.state.agentid} already executed ${input.state.spentsteps} of its ${input.state.maxsteps} user configured steps; the user raises the ceiling or stops the agent.` };
  if (input.state.maxtokens !== void 0 && input.state.spenttokens + tokens > input.state.maxtokens) return { allowed: false, reason: `The agent ${input.state.agentid} already spent ${input.state.spenttokens} of its ${input.state.maxtokens} user configured tokens; the user raises the ceiling or stops the agent.` };
  if (input.state.maxdurationms !== void 0 && input.state.spentdurationms + durationms > input.state.maxdurationms) return { allowed: false, reason: `The agent ${input.state.agentid} already spent ${input.state.spentdurationms} of its ${input.state.maxdurationms} user configured milliseconds; the user raises the ceiling or stops the agent.` };
  return { allowed: true, reason: `The step charges the agent budget of ${input.state.agentid}: ${input.state.spentsteps} steps, ${input.state.spenttokens} tokens and ${input.state.spentdurationms} milliseconds spent under the user configured ceilings.` };
}
function escalateholdgate(input) {
  const open = input.escalations.filter((escalation) => escalation.agentid === input.agentid && escalation.state === "open");
  if (open.length > 0) return { allowed: false, reason: `The agent ${input.agentid} waits behind ${open.length} open escalation${open.length === 1 ? "" : "s"} (${open.map((escalation) => escalation.subject).slice(0, 3).join("; ")}); only the human answer lifts the hold.` };
  return { allowed: true, reason: `The agent ${input.agentid} carries no open escalation; its steps continue through the same review.` };
}
function reviewrequestgate(input) {
  if (input.from.origin !== input.to.origin) return { allowed: false, reason: `The review request crosses origins: the agent ${input.from.name} works from ${input.from.origin} while the agent ${input.to.name} works from ${input.to.origin}; a review stays inside the shared origin grant.` };
  return { allowed: true, reason: `The review request stays inside the shared origin ${input.from.origin} of the agents ${input.from.name} and ${input.to.name}; the verdict records beside the original output.` };
}
function pauseagentgate(input) {
  const agent = input.records.find((record) => record.id === input.agentid);
  if (!agent) return { allowed: false, reason: `The agent ${input.agentid} is not registered in the fleet; a pause needs its agent.` };
  const peers = input.records.filter((record) => record.id !== input.agentid && record.state === "active");
  return { allowed: true, reason: `The pause holds only the agent ${agent.name}; its ${peers.length} peer${peers.length === 1 ? "" : "s"} stay runnable and their run records stay untouched.` };
}
function agentnamevalid(input) {
  const name = input.name.trim().toLowerCase();
  if (name === "") return { allowed: false, reason: "The agent needs its user chosen name; agent naming stays a user choice." };
  if (!/^[a-z][a-z0-9]*$/.test(name)) return { allowed: false, reason: `The agent name ${input.name.trim()} must stay a lowercase identifier of letters and digits starting with a letter.` };
  if (reservedagentnames.has(name)) return { allowed: false, reason: `The agent name ${name} is reserved; the user, the operator, the human and the system identities never belong to an agent.` };
  if ((input.records ?? []).some((record) => record.name === name)) return { allowed: false, reason: `The agent name ${name} is already registered; fleet names stay unique.` };
  return { allowed: true, reason: `The fleet name ${name} stays a unique lowercase identifier clear of the reserved identities.` };
}
function fleetoperationgrade(operation) {
  const readonly = /* @__PURE__ */ new Set(["outputcompare", "consensusvote", "runreplay", "reconstructreplay", "reviewrequest", "recordverdict", "escalate", "escalationblock"]);
  if (!readonly.has(operation)) return { allowed: false, reason: `The fleet operation ${operation} is no read side operation of the 1.1.72 family; the grade knows outputcompare, consensusvote, runreplay, reviewrequest and escalate only.` };
  return { allowed: true, reason: `The fleet operation ${operation} grades read only: it aligns, tallies, replays or records records and never touches the page.` };
}
function replayexportgate(input) {
  if (!input.consent) return { allowed: false, reason: `The runreplay export of the agent ${input.agentid} carries the audit trail of its runs; the export leaves only behind the explicit user consent.` };
  return { allowed: true, reason: `The user consented to the runreplay export of the agent ${input.agentid}; the capture leaves with its ordered steps and its reconstruction marker.` };
}
function voteweightvalid(input) {
  const seen = /* @__PURE__ */ new Set();
  const duplicates = [];
  for (const vote of input.votes) {
    if (vote.agentid.trim() === "") return { allowed: false, reason: "Every vote names its agent; an anonymous vote weighs nothing." };
    if (seen.has(vote.agentid)) duplicates.push(vote.agentid);
    seen.add(vote.agentid);
  }
  if (duplicates.length > 0) return { allowed: false, reason: `The agents ${[...new Set(duplicates)].join(", ")} voted twice; the vote weight stays one per agentrecord.` };
  return { allowed: true, reason: `${seen.size} agent${seen.size === 1 ? " votes" : "s vote"} once each; the tally weighs every agentrecord exactly once.` };
}
function spawngate(input) {
  if (input.parentstate === "paused") return { allowed: false, reason: "The parent sits paused; a paused parent spawns no child until its resume." };
  if (input.parentstate === "stopped") return { allowed: false, reason: "The parent is stopped; a stopped parent spawns no child." };
  if (input.parentscope === void 0 || input.parentscope.origins.length === 0) return { allowed: true, reason: "The parent scope stays unbounded inside the session grants; the child objective origin needs no extra coverage." };
  if (!input.parentscope.origins.includes(input.objectiveorigin)) return { allowed: false, reason: `The parent scope grants no access to the objective origin ${input.objectiveorigin}; a spawn never widens past what its parent covers.` };
  return { allowed: true, reason: `The parent scope covers the objective origin ${input.objectiveorigin}; the child stays inside its parent's grants.` };
}
function depthgate(input) {
  if (input.limit.maxdepth === void 0) return { allowed: true, reason: `The lineage depth ${input.depth} sits unbounded; the user configured no depth ceiling.` };
  if (input.depth > input.limit.maxdepth) return { allowed: false, reason: `The lineage depth ${input.depth} passes the user configured depth limit ${input.limit.maxdepth}; the spawn refuses until the user raises the limit.` };
  return { allowed: true, reason: `The lineage depth ${input.depth} sits inside the user configured depth limit ${input.limit.maxdepth}.` };
}
function aggregatemergegrade(operation) {
  if (operation === "aggregatereport") return { allowed: true, reason: "The aggregatereport merges the parallel agent outputs read only; every section keeps its per agent provenance and no original output rewrites." };
  return { allowed: false, reason: `The operation ${operation} never grades as a read only aggregation; the merge stays reserved for the aggregatereport.` };
}
function aggregateconflictescalationgate(input) {
  if (input.unresolved.length === 0) return { allowed: true, reason: "The aggregation carries no unresolved conflict; the merge closes with every conflict resolved by its policy order." };
  return { allowed: false, reason: `The aggregation carries ${input.unresolved.length} unresolved conflict${input.unresolved.length === 1 ? "" : "s"} on ${input.unresolved.join(", ")}; the merge stays open and the escalation lifts the conflict to the user.` };
}
function arbitrationverdictgate(input) {
  if (input.sessionlockholder !== void 0 && input.sessionlockholder !== input.holderagentid) return { allowed: false, reason: `The run lock of ${input.origin} stays held by ${input.sessionlockholder}; the verdict grants a queue position and never bypasses the sessionlock.` };
  if (input.origingrants !== void 0 && input.origingrants.length > 0 && !input.origingrants.includes(input.origin)) return { allowed: false, reason: `The origin ${input.origin} sits outside the session grants; the verdict grants a queue position and never widens the origin grants.` };
  return { allowed: true, reason: `The verdict of the agent ${input.holderagentid} stays inside the sessionlock and the origin grants of ${input.origin}; the case grants a queue position only.` };
}
function lanechangegate(input) {
  if (!input.sensitive) return { allowed: true, reason: `The lane change of ${input.lane.name} carries no sensitive step; the user reorders the lanes freely.` };
  if (input.lane.interactive === true) return { allowed: true, reason: `The sensitive steps stay in the interactive lane ${input.lane.name}; the lane change holds their protection.` };
  if (!input.confirmed) return { allowed: false, reason: `The lane change moves sensitive steps out of the interactive lane ${input.lane.name}; the explicit user confirmation decides, never the engine.` };
  return { allowed: true, reason: `The user confirmed the lane change of the sensitive steps into ${input.lane.name}; the confirmation reads in the audit trail.` };
}
function scaleconsentgate(input) {
  if (!input.userconsented) return { allowed: false, reason: `The scaleworkers suggestion of ${input.origin} stays a suggestion; the spawn or pause needs the user consent because the fleet size never changes alone.` };
  return { allowed: true, reason: `The user consented to the scaleworkers change of ${input.origin}; the fleet size changes through the user action.` };
}
function lessonsecretgate(input) {
  const patterns = [["token", /\b(?:api[- ]?key|token|secret|password|passwd|bearer|authorization)\b\s*[:=]\s*\S+/i], ["credential", /\b(?:sk-[a-z0-9]{16,}|gh[pousr]_[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----)/i]];
  for (const [label, pattern] of patterns) if (pattern.test(input.text)) return { allowed: false, reason: `The lesson carries a ${label} shaped secret; the lessons spread across the fleet so a secret never enters the store.` };
  return { allowed: true, reason: "The lesson carries no secret shape; the finding shares across the fleet." };
}
function lessonsanitizestep(text) {
  return text.replace(/\b(api[- ]?key|token|secret|password|passwd|bearer|authorization)\b(\s*[:=]\s*)\S+/gi, "$1$2[redacted]").replace(/\bsk-[a-z0-9]{16,}\b/gi, "[redacted key]").replace(/\bgh[pousr]_[A-Za-z0-9]{20,}\b/g, "[redacted token]").replace(/-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g, "[redacted private key]");
}
function costsharegate(operation) {
  if (operation === "costshare") return { allowed: true, reason: "The costshare accounting stays local and read only; the ledger splits the shared costs among their causers and never acts outside the extension." };
  return { allowed: false, reason: `The operation ${operation} never grades as the costshare accounting; the ledger stays read only.` };
}
function subsetscopegate(input) {
  const outsideorigins = input.child.origins.filter((origin) => !input.parent.origins.includes(origin));
  if (input.parent.origins.length > 0 && outsideorigins.length > 0) return { allowed: false, reason: `The child scope reaches the origins ${outsideorigins.join(", ")} outside its parent scope; a subagent scope stays a subset of its parent.` };
  const parentkinds = input.parent.actionkinds ?? [];
  const childkinds = input.child.actionkinds ?? [];
  const outsidekinds = parentkinds.length > 0 ? childkinds.filter((kind) => !parentkinds.includes(kind)) : [];
  if (outsidekinds.length > 0) return { allowed: false, reason: `The child scope reaches the action kinds ${outsidekinds.join(", ")} outside its parent scope; a subagent scope stays a subset of its parent.` };
  if (input.parent.readonly === true && input.child.readonly !== true) return { allowed: false, reason: "The parent scope stays read only; a child of an observer never gains the write side." };
  return { allowed: true, reason: "The subagent scope sits inside its parent scope; the narrowing keeps every step of the child covered." };
}
function interleavereadonlygate(operation) {
  if (operation === "interleave") return { allowed: true, reason: "The interleaved timeline view stays read only; the merged lanes order the agent actions for the audit and never feed back into a queue or a step." };
  return { allowed: false, reason: `The operation ${operation} never grades as the read only interleaved view; the timeline stays for the audit.` };
}
function prefetchgate(input) {
  const outside = input.urls.filter((url) => {
    try {
      return !input.grants.includes(new URL(url).origin);
    } catch {
      return true;
    }
  });
  if (outside.length > 0) return { allowed: false, reason: `${outside.length} prefetch candidate${outside.length === 1 ? "" : "s"} (${outside.slice(0, 3).join(", ")}) sit outside the session grants; the warming never reaches an origin the user did not grant.` };
  return { allowed: true, reason: `Every prefetch candidate sits inside the session grants; the speculative dns warming observes the granted origins only.` };
}
function preconnectgate(input) {
  const revoked = input.targets.filter((target) => target.revokedat !== void 0);
  if (revoked.length > 0) return { allowed: false, reason: `${revoked.length} preconnect target${revoked.length === 1 ? "" : "s"} (${revoked.map((target) => target.origin).slice(0, 3).join(", ")}) carry a revoked stamp; a revoked socket opens no further connection.` };
  const grants = input.grants;
  const outside = grants !== void 0 ? input.targets.filter((target) => target.origin.trim() !== "" && !grants.includes(target.origin)) : [];
  if (outside.length > 0) return { allowed: false, reason: `${outside.length} preconnect target${outside.length === 1 ? "" : "s"} (${outside.map((target) => target.origin).slice(0, 3).join(", ")}) sit outside the host grants of the session; the preconnect honors the grants the user gave.` };
  return { allowed: true, reason: `Every preconnect socket stays read only and revocable; the targets honor the host grants of the session and warm the transport ahead of the steps that need it.` };
}
function deeplinkgate(input) {
  if (!input.grants.includes(input.pattern.origin)) return { allowed: false, reason: `The deep link pattern of ${input.pattern.app} builds into the origin ${input.pattern.origin} which sits outside the session grants; the reviewed parameters never widen the grants.` };
  return { allowed: true, reason: `The deep link pattern of ${input.pattern.app} builds into the granted origin ${input.pattern.origin} from its reviewed parameters only.` };
}
function reopentabgate(input) {
  let origin = "";
  try {
    origin = new URL(input.record.url).origin;
  } catch {
    origin = "";
  }
  if (origin === "" || !input.grants.includes(origin)) return { allowed: false, reason: `The closed tab ${input.record.url} carries the origin ${origin || "an unparsable url"} which the session no longer grants; the reopening rechecks the consent and refuses.` };
  return { allowed: true, reason: `The closed tab of ${origin} sits inside the session grants; the reopening restores it under the consent the session still carries.` };
}
function pausenavconsentgate(input) {
  const navkinds = /* @__PURE__ */ new Set(["openlink", "openprivate", "followlink", "spanav", "navlist", "openclipboard", "batchopen", "prefetch", "preconnect", "deeplink", "reopentab"]);
  const pause = input.pause;
  if (pause === void 0 || pause.pausedat === void 0 || !navkinds.has(input.kind)) return { allowed: true, reason: `The ${input.kind} step runs under no open consent freeze; the navigation pause holds the navigation kinds only.` };
  return { allowed: false, reason: `Navigation is paused while ${pause.reason}${pause.pendingurl !== void 0 ? `; the pending navigation ${pause.pendingurl} queues until the answer` : ""}; resume navigation first.` };
}
function navratelimitgate(input) {
  if (input.allowed) return { allowed: true, reason: `The sliding window of ${input.domain} carries room for the navigation; the step counts against the window and runs.` };
  return { allowed: false, reason: `The sliding window of ${input.domain} is full; the step waits ${input.waitms} millisecond${input.waitms === 1 ? "" : "s"} for the oldest navigation to age out, the wait rides in the response envelope and the navigation never drops silently.` };
}
function clipboardgate(input) {
  if (!input.usergesture) return { allowed: false, reason: "The clipboard url opens only from the explicit user action of the reviewed step; an autonomous clipboard read never opens a page." };
  let origin = "";
  try {
    origin = new URL(input.url).origin;
  } catch {
    origin = "";
  }
  if (origin === "" || !input.grants.includes(origin)) return { allowed: false, reason: `The clipboard url ${input.url} carries the origin ${origin || "an unparsable url"} which sits outside the session grants; the opening requires the origin grant.` };
  return { allowed: true, reason: `The clipboard url of ${origin} opens behind the explicit user action and the origin grant.` };
}
function safetygate(input) {
  if (!input.verdict.safe) return { allowed: false, reason: `The url ${input.verdict.url} is unsafe: ${input.verdict.reasons.join("; ")}; the opening refuses.` };
  return { allowed: true, reason: `The url ${input.verdict.url} passed every safety check; the reasons list stays empty and the url may open.` };
}
function batchsizelimitgate(input) {
  if (input.limit === void 0) return { allowed: true, reason: `The batch of ${input.size} url${input.size === 1 ? "" : "s"} runs under no user ceiling; the batch size bound stays a user choice with no code default.` };
  if (input.size > input.limit) return { allowed: false, reason: `The batch of ${input.size} url${input.size === 1 ? "" : "s"} passes the user configured ceiling of ${input.limit}; the user raises the ceiling or trims the batch.` };
  return { allowed: true, reason: `The batch of ${input.size} url${input.size === 1 ? "" : "s"} sits inside the user configured ceiling of ${input.limit}.` };
}
function navigationobservationgrade(operation) {
  if (operation === "navintent" || operation === "prefetchpage") return { allowed: true, reason: `The ${operation} operation grades read only: it predicts or computes a warming set and never issues a request of its own.` };
  return { allowed: false, reason: `The operation ${operation} never grades as a read only navigation observation; the prediction and the warming stay reserved for navintent and prefetchpage.` };
}
function trailexportgate(input) {
  if (!input.consent) return { allowed: false, reason: `The restoretrail export of the run ${input.runid} carries its whole navigation trail; the export leaves only behind the explicit user consent.` };
  return { allowed: true, reason: `The user consented to the restoretrail export of the run ${input.runid}; the trail leaves with its ordered entries and its replay marker.` };
}
function trailorigingate(input) {
  const outside = input.entries.filter((entry) => {
    try {
      return !input.origins.includes(new URL(entry.url).origin);
    } catch {
      return true;
    }
  });
  if (outside.length > 0) return { allowed: false, reason: `${outside.length} navtrail entr${outside.length === 1 ? "y sits" : "ies sit"} outside the session origins (${outside.slice(0, 3).map((entry) => entry.url).join(", ")}); the trail never records a path the user did not grant.` };
  return { allowed: true, reason: `Every navtrail entry stays inside the session origins; the trail records exactly the path the grants cover.` };
}
function streamgate(input) {
  if (!input.revieweddownload) return { allowed: false, reason: `The pipeline write to ${input.sink} carries no reviewed download flow; the stream passes through the reviewed export machinery or refuses.` };
  return { allowed: true, reason: `The pipeline write to ${input.sink} flows through the reviewed download flow; no side channel ever bypasses the export review.` };
}
function transformgate(input) {
  const known = input.reviewed.some((candidate) => (candidate.field ?? candidate.target) === (input.rule.field ?? input.rule.target) && candidate.operation === input.rule.operation);
  if (!known) return { allowed: false, reason: `The transform of ${input.rule.field ?? input.rule.target} through ${input.rule.operation ?? "its expression"} sits outside the reviewed rule list; the pipeline applies only what the plan review approved.` };
  return { allowed: true, reason: `The transform of ${input.rule.field ?? input.rule.target} through ${input.rule.operation ?? "its expression"} sits inside the reviewed rule list of the pipeline.` };
}
function dedupeconfiggate(input) {
  if (input.key === void 0 || input.key.columns.filter((column) => column.trim() !== "").length === 0) return { allowed: false, reason: `The pipeline ${input.pipelineid} carries no configured dedupe key; the deduplication stays a user choice per pipeline and an implicit key never drops rows.` };
  return { allowed: true, reason: `The pipeline ${input.pipelineid} deduplicates by ${input.key.columns.join(", ")} under the ${input.key.normalization} normalization the user configured; the choice stays per pipeline.` };
}
function samplegate(operation) {
  if (operation === "samplerows") return { allowed: true, reason: "The samplerows pass grades as a read only preview; the subset copies its rows and the stored extract stays exactly what it held." };
  return { allowed: false, reason: `The operation ${operation} never grades as a read only sampling preview; the samplerows stays the only read only pass of the family.` };
}
function provgate(input) {
  const logged = new Set(input.entries.flatMap((entry) => entry.rowkeys));
  const bare = input.rows.filter((row) => row.provenance.length === 0 || !logged.has(row.key));
  if (bare.length > 0) return { allowed: false, reason: `${bare.length} of ${input.rows.length} exported row${bare.length === 1 ? " carries" : "s carry"} no provenance the provlog holds (${bare.slice(0, 3).map((row) => row.key).join(", ")}); the export refuses in full.` };
  return { allowed: true, reason: `Every exported row carries its provlog provenance; the export leaves with the url, the step and the operations of every row answered.` };
}
function resumegate(input) {
  if (input.pipeline.planid !== void 0 && input.planid !== void 0 && input.pipeline.planid !== input.planid) return { allowed: false, reason: `The pipeline ${input.pipeline.name} belongs to the plan ${input.pipeline.planid} while the resume names ${input.planid}; a resume continues exactly the plan it came from.` };
  if (input.pipeline.origin !== input.origin) return { allowed: false, reason: `The pipeline ${input.pipeline.name} extracts from ${input.pipeline.origin} while the resume names ${input.origin}; a resume never moves the extraction to another origin.` };
  return { allowed: true, reason: `The resume of the pipeline ${input.pipeline.name} continues the same plan of the same origin ${input.origin}; the extraction stays exactly where it started.` };
}
function pipelinetargetgate(input) {
  const outside = input.fields.filter((field) => field.trim() !== "" && !input.target.includes(field));
  if (outside.length > 0) return { allowed: false, reason: `The pipeline ${input.pipelineid} extracts the fields ${outside.join(", ")} outside its reviewed target; the extraction reads exactly the fields the review approved.` };
  return { allowed: true, reason: `Every field of the pipeline ${input.pipelineid} sits inside its reviewed target; the extraction reads exactly what the review approved.` };
}
function gridexportconfirmgate(input) {
  if (!input.confirmed) return { allowed: false, reason: `The grid preview of ${input.rows} row${input.rows === 1 ? "" : "s"} stays a read only projection; the export needs the explicit user confirmation.` };
  return { allowed: true, reason: `The user confirmed the export of the ${input.rows} previewed row${input.rows === 1 ? "" : "s"}; the preview ships exactly what the user inspected.` };
}
function streamchunkgate(input) {
  if (input.limit === void 0) return { allowed: true, reason: `The stream chunk of ${input.chunk} row${input.chunk === 1 ? "" : "s"} runs under no user ceiling; the chunk size stays a user choice with no code default.` };
  if (input.chunk > input.limit) return { allowed: false, reason: `The stream chunk of ${input.chunk} row${input.chunk === 1 ? "" : "s"} passes the user configured ceiling of ${input.limit}; the user raises the ceiling or trims the chunk.` };
  return { allowed: true, reason: `The stream chunk of ${input.chunk} row${input.chunk === 1 ? "" : "s"} sits inside the user configured ceiling of ${input.limit}.` };
}
function provlogappendonlygate(input) {
  if (input.entries.some((entry) => entry.id === input.entryid)) return { allowed: false, reason: `The provlog entry ${input.entryid} already sits in the log; the provenance log stays append only and an entry never rewrites.` };
  return { allowed: true, reason: `The provlog entry ${input.entryid} appends to the log; the provenance record of every operation stays immutable for the audit.` };
}
function rowstampgate(input) {
  const existing = input.stored.find((candidate) => candidate.key === input.row.key);
  if (existing !== void 0 && existing.capturedat !== input.row.capturedat) return { allowed: false, reason: `The row ${input.row.key} already carries its stamp at ${existing.capturedat} while the restamp names ${input.row.capturedat}; a stamped timestamp never rewrites.` };
  return { allowed: true, reason: `The stamp of the row ${input.row.key} stays immutable; the capture time answers the moment the extraction observed it.` };
}
function streamnamespacegate(input) {
  const namespace = input.runid.trim();
  if (namespace === "") return { allowed: false, reason: "The stream file names its run namespace; an unnamespaced stream answers no run." };
  if (!input.filename.includes(namespace)) return { allowed: false, reason: `The stream file ${input.filename} leaves the runid namespace ${namespace}; the disk sink stays bound to the run that streamed it.` };
  return { allowed: true, reason: `The stream file ${input.filename} sits inside the runid namespace ${namespace}; the disk sink answers exactly the run that streamed it.` };
}
function transportgate(input) {
  try {
    const origin = new URL(input.url).origin;
    const covered = input.grants.some((pattern) => {
      try {
        return origin === new URL(pattern).origin;
      } catch {
        return false;
      }
    });
    if (!covered) return { allowed: false, reason: `The api transport call to ${origin} targets an origin outside the session grants; the transport layer never widens the grants.` };
    return { allowed: true };
  } catch {
    return { allowed: false, reason: `The api transport call url ${input.url} does not parse; an unparseable url never carries a request.` };
  }
}
function subscribegate(input) {
  try {
    const origin = new URL(input.url).origin;
    const covered = input.grants.some((pattern) => {
      try {
        return origin === new URL(pattern).origin;
      } catch {
        return false;
      }
    });
    if (!covered) return { allowed: false, reason: `The subscription channel of ${origin} sits outside the session origin grants; a channel the grants do not cover never opens.` };
    return { allowed: true };
  } catch {
    return { allowed: false, reason: `The subscription channel url ${input.url} does not parse; an unparseable channel never opens.` };
  }
}
function postgate(kind) {
  if (kind === "formpost" || kind === "postform" || kind === "multipartpost" || kind === "postfiles") return { allowed: true, reason: `The ${kind} step mutates a remote state through its reviewed payload; the review grades it sensitive.` };
  return { allowed: false, reason: `The ${kind} operation is no post of the web api family; the sensitive grade covers formpost and multipartpost only.` };
}
function uploadgate(input) {
  if (input.count === 0) return { allowed: false, reason: "A multipart upload carries at least one reviewed file; an empty upload encodes nothing." };
  const unreviewed = input.files.filter((file) => file.reviewed !== true).length;
  if (unreviewed > 0) return { allowed: false, reason: `${unreviewed} of ${input.count} file${input.count === 1 ? "" : "s"} of the multipart upload carry no explicit review; the upload waits for the file review.` };
  return { allowed: true, reason: `Every one of the ${input.count} reviewed file${input.count === 1 ? "" : "s"} of the multipart upload carries its explicit review.` };
}
function cachegate(input) {
  if (input.credentials) return { allowed: false, reason: `The response of ${input.url} carries credentials; the per run cache refuses it because a served copy would bypass the consent the credential represents.` };
  return { allowed: true, reason: `The response of ${input.url} carries no credential fact; the per run cache may store it inside its run namespace.` };
}
function ratelimitrespectgate(input) {
  if (input.waitms < 0) return { allowed: false, reason: "The rate limit wait never runs negative; a broken directive refuses instead of rushing the call." };
  if (input.budget !== void 0 && input.waitms > input.budget) return { allowed: false, reason: `The rate limit wait of ${input.waitms} milliseconds on ${input.origin} exceeds the reviewed wait budget of ${input.budget} milliseconds; review a wider budget or let the window reset.` };
  return { allowed: true, reason: `The rate limit wait of ${input.waitms} milliseconds on ${input.origin} holds the call until the reset window passes; the wait rides the audit trail.` };
}
function correlationmappinggate(operation) {
  if (operation === "assign" || operation === "join" || operation === "export") return { allowed: true, reason: `The correlation map ${operation} stays read only inside the run; the mapping answers the audit, it never drives a step.` };
  return { allowed: false, reason: `The ${operation} operation is no correlation mapping pass; the map assigns, joins and exports only.` };
}
function pollchoices(settings) {
  const timeout = settings?.polltimeout;
  const backoff = settings?.pollbackoff;
  return { ...typeof timeout === "number" && Number.isFinite(timeout) && timeout > 0 ? { timeout } : {}, ...typeof backoff === "number" && Number.isFinite(backoff) && backoff >= 0 ? { backoff } : {} };
}
function subscriptionboundgate(input) {
  if (input.limit === void 0) return { allowed: true, reason: "The open subscription count stays unbounded because no user ceiling is configured." };
  if (!(input.limit >= 1)) return { allowed: false, reason: "The subscription ceiling must be a positive count when configured; a broken ceiling refuses instead of guessing." };
  if (input.count > input.limit) return { allowed: false, reason: `The run holds ${input.count} open subscription${input.count === 1 ? "" : "s"} past the user configured ceiling of ${input.limit}; raise the ceiling or close a channel before another subscription opens.` };
  return { allowed: true, reason: `The run holds ${input.count} open subscription${input.count === 1 ? "" : "s"} inside the user configured ceiling of ${input.limit}.` };
}
function apicallgrade(operation) {
  if (operation === "observeapicalls" || operation === "apicallrecord") return { allowed: true, reason: "The page api call observation stays read only; the recorded endpoints answer the review and never replay." };
  return { allowed: false, reason: `The ${operation} operation is no page api call observation; the observation grade covers the read only recording only.` };
}
function transportcancelgate(input) {
  if (input.hascancel) return { allowed: true, reason: `The ${input.kind} transport carries its cancellation path; the channel closes cleanly when the step, the run or the killswitch asks.` };
  return { allowed: false, reason: `The ${input.kind} transport opens no channel without its cancellation path; a transport that cannot close on the step, the run or the killswitch never opens.` };
}
function pollwaitbudgetgate(input) {
  if (!(input.interval > 0)) return { allowed: false, reason: "The reviewed long poll interval must be a positive number of milliseconds." };
  if (input.timeout !== void 0 && !(input.timeout >= 0)) return { allowed: false, reason: "The reviewed long poll timeout must be zero or a positive number of milliseconds." };
  if (input.wait !== void 0 && !(input.wait >= 0)) return { allowed: false, reason: "The reviewed wait budget must be zero or a positive number of milliseconds." };
  if (input.wait !== void 0 && input.interval > input.wait) return { allowed: false, reason: `The long poll interval of ${input.interval} milliseconds exceeds the reviewed wait budget of ${input.wait} milliseconds; review a wider budget or a shorter interval.` };
  const total = input.timeout !== void 0 ? input.interval + input.timeout : input.interval;
  if (input.wait !== void 0 && total > input.wait) return { allowed: false, reason: `The long poll interval of ${input.interval} milliseconds with its ${input.timeout ?? 0} millisecond timeout exceeds the reviewed wait budget of ${input.wait} milliseconds; review a wider budget or a shorter loop.` };
  return { allowed: true, reason: `The long poll waits of ${total} milliseconds sit inside the reviewed wait budget${input.wait !== void 0 ? ` of ${input.wait} milliseconds` : ""}.` };
}
function visiongate(input) {
  if (input.model.trim() === "") return { allowed: false, reason: "The vision model stays unconfigured; no recognition or description ships inside the extension, so the model call refuses until the user configures one." };
  if (input.endpoint.trim() === "") return { allowed: false, reason: "The vision model endpoint stays unconfigured; the model call refuses until the user names the endpoint its frames may travel to." };
  try {
    const origin = new URL(input.endpoint).origin;
    const covered = input.granted.some((pattern) => {
      try {
        return origin === new URL(pattern).origin;
      } catch {
        return false;
      }
    });
    if (!covered) return { allowed: false, reason: `The vision model endpoint of ${origin} sits outside the session grants; the frames never leave the device for an endpoint the review did not grant.` };
    return { allowed: true, reason: `The configured vision model ${input.model.trim()} of ${origin} sits inside the session grants; the frames travel only to the endpoint the user configured.` };
  } catch {
    return { allowed: false, reason: `The vision model endpoint ${input.endpoint} does not parse; an unparseable endpoint carries no frame.` };
  }
}
function ocrgate(kind) {
  if (kind === "imageocr" || kind === "regionocr" || kind === "pdfocr" || kind === "frameocr") return { allowed: true, reason: `The ${kind} pass reads pixels read only; the recognition never writes the page or sends a frame on its own.` };
  return { allowed: false, reason: `The ${kind} operation is no ocr pass of the vision family; the read only grade covers imageocr, regionocr, pdfocr and frameocr only.` };
}
function redactgate(input) {
  const external = input.destination === "clipboard" || input.destination === "download" || input.destination === "export";
  if (!external) return { allowed: true, reason: `The ${input.destination} destination keeps the capture inside the session; no external share needs a redaction mask.` };
  if (!input.redacted) return { allowed: false, reason: `The share to ${input.destination} carries no reviewed redaction mask; an unredacted screenshot never leaves the device.` };
  return { allowed: true, reason: `The share to ${input.destination} carries its reviewed redaction mask; the masked regions never reach the shared bytes.` };
}
function groundgate(operation) {
  if (operation === "groundshot" || operation === "groundingrecord") return { allowed: true, reason: `The ${operation} pass grounds description labels into read only page selectors; the grounding observes and never acts.` };
  return { allowed: false, reason: `The ${operation} operation is no grounding pass; the read only grade covers the groundshot mapping and its records only.` };
}
function pairgate(input) {
  if (input.runid.trim() === "") return { allowed: false, reason: "The pair names its run; an unnamespaced pair answers no run." };
  if (input.snapshot.runid !== input.runid) return { allowed: false, reason: `The dom snapshot of the run ${input.snapshot.runid} never pairs with the image of the run ${input.runid}; the pair stays inside the session boundary.` };
  return { allowed: true, reason: `The dom snapshot and the image both belong to the run ${input.runid}; the pair stays inside the session boundary.` };
}
function visionchoices(settings) {
  const model = settings?.visionmodel;
  const endpoint = settings?.visionendpoint;
  return { ...typeof model === "string" && model.trim() !== "" ? { model: model.trim() } : {}, ...typeof endpoint === "string" && endpoint.trim() !== "" ? { endpoint: endpoint.trim() } : {} };
}
function visioncostgrade(operation) {
  if (operation === "visioncost" || operation === "costshare") return { allowed: true, reason: `The ${operation} reporting stays local and read only; the vision cost ledger answers the user and ships nowhere.` };
  return { allowed: false, reason: `The ${operation} operation is no vision cost pass; the local grade covers the visioncost count and its costshare entries only.` };
}
function visionconsentgate(input) {
  if (!input.frames) return { allowed: true, reason: "No frame leaves the device; the local pass needs no consent." };
  if (!input.consented) return { allowed: false, reason: "The frames would leave the device without the recorded user consent; the vision pass refuses instead of shipping pixels the user never approved." };
  return { allowed: true, reason: "The recorded user consent covers the frames leaving the device; the pass rides the configured endpoint only." };
}
function visionsensitivegrade(operation) {
  if (operation === "visionshot" || operation === "visionpayload") return { allowed: true, reason: `The ${operation} payload grades sensitive; the audit trail records the call and its provenance while the image bytes and the description text never ride the summaries.` };
  return { allowed: false, reason: `The ${operation} operation carries no vision payload; the sensitive grade covers the visionshot model calls only.` };
}
function regionboundsgate(input) {
  for (const value of [input.region.x, input.region.y, input.region.width, input.region.height]) {
    if (!Number.isFinite(value) || value < 0) return { allowed: false, reason: `The ocrregion needs finite, non-negative geometry in css pixels; the region read refuses broken numbers.` };
  }
  if (input.region.width <= 0 || input.region.height <= 0) return { allowed: false, reason: "The ocrregion needs a positive width and height so the recognition reads a real area." };
  if (input.region.x >= input.viewport.width || input.region.y >= input.viewport.height) return { allowed: false, reason: `The ocrregion of x ${input.region.x}, y ${input.region.y} starts past the ${input.viewport.width} by ${input.viewport.height} viewport; the region read refuses wrong pixels.` };
  if (input.region.x + input.region.width > input.viewport.width || input.region.y + input.region.height > input.viewport.height) return { allowed: true, reason: `The ocrregion crosses the ${input.viewport.width} by ${input.viewport.height} viewport edge; the read clamps to the visible part and names the crossing.` };
  return { allowed: true, reason: `The ocrregion sits inside the ${input.viewport.width} by ${input.viewport.height} viewport; the recognition reads exactly the reviewed rectangle.` };
}
function framebudgetgate(input) {
  if (!(input.waitms >= 0)) return { allowed: false, reason: "The frameocr wait never runs negative; a broken seek refuses instead of rushing the frame." };
  if (input.budget !== void 0 && input.waitms > input.budget) return { allowed: false, reason: `The frameocr wait of ${input.waitms} milliseconds exceeds the reviewed wait budget of ${input.budget} milliseconds; review a wider budget or a nearer position.` };
  return { allowed: true, reason: `The frameocr wait of ${input.waitms} milliseconds sits inside the reviewed wait budget${input.budget !== void 0 ? ` of ${input.budget} milliseconds` : ""}.` };
}
function visioncacheexpirygate(input) {
  if (input.retention === void 0) return { allowed: true, reason: "The visioncache entry stays forever because no user retention window is configured." };
  if (!(input.retention >= 0)) return { allowed: false, reason: "The visioncache retention must be zero or a positive number of milliseconds when configured; a broken window refuses instead of guessing." };
  if (input.now - input.entryat >= input.retention) return { allowed: false, reason: `The visioncache entry of ${new Date(input.entryat).toISOString()} aged past the user retention window of ${input.retention} milliseconds; the pass expires it.` };
  return { allowed: true, reason: `The visioncache entry sits inside the user retention window of ${input.retention} milliseconds; the pass keeps it serving.` };
}
function forensicscopegate(input) {
  if (input.runid.trim() === "") return { allowed: false, reason: "The forensic record names its run; an unnamespaced record answers no review." };
  if (input.record.runid !== input.runid) return { allowed: false, reason: `The forensic record of the run ${input.record.runid} never joins the run ${input.runid}; the capture forensics stay inside the reviewed plan scope.` };
  return { allowed: true, reason: `The forensic record belongs to the run ${input.runid}; the capture forensics stay inside the reviewed plan scope.` };
}
function forensicsreadonlygate(operation) {
  if (operation === "beforeafter" || operation === "consoletimeline" || operation === "nettimeline" || operation === "thumbshot" || operation === "namecaptures") return { allowed: true, reason: `The ${operation} pass records what the run already showed read only; the forensic observation never writes the page or issues a request of its own.` };
  return { allowed: false, reason: `The ${operation} operation is no forensic observation pass; the read only grade covers beforeafter, consoletimeline, nettimeline, thumbshot and namecaptures only.` };
}
function diffbasegate(input) {
  if (!input.confirmed) return { allowed: false, reason: `The diff baseline for the page state ${input.pagestate} waits for the user confirmation; a baseline the review never saw flags nothing honestly.` };
  return { allowed: true, reason: `The user confirmed the diff baseline for the page state ${input.pagestate}; the frozen capture answers the review.` };
}
function timelapsegate(input) {
  if (!input.userstarted) return { allowed: false, reason: "The timelapse waits for the explicit user start; a capture cadence the review never started never starts." };
  if (input.interval !== void 0 && !(input.interval > 0)) return { allowed: false, reason: "The timelapse interval stays a positive number of milliseconds the user chose; the interval carries no code floor." };
  return { allowed: true, reason: `The user started the timelapse${input.interval !== void 0 ? ` on the ${input.interval} millisecond interval` : ""}; the lapse captures on the reviewed cadence only.` };
}
function captureexportgate(input) {
  if (!input.useraction) return { allowed: false, reason: "The capture bundle waits for the explicit user action; an export nobody asked for never leaves the device." };
  if (!input.redacted) return { allowed: false, reason: `The capture bundle of ${input.captures} capture${input.captures === 1 ? "" : "s"} carries no redactshot mask review; an unmasked capture never exports.` };
  if (!input.provenance) return { allowed: false, reason: `The capture bundle of ${input.captures} capture${input.captures === 1 ? "" : "s"} carries no provlog provenance entries; an export payload without provenance never leaves the device.` };
  return { allowed: true, reason: `The user asked for the capture bundle of ${input.captures} capture${input.captures === 1 ? "" : "s"} with its redaction masks and its provlog provenance; the bundle exports through the reviewed download flow.` };
}
function consolemaskgate(input) {
  if (!input.masked) return { allowed: false, reason: "The console timeline stores its text through the masking rules first; an unmasked console line never enters the forensic evidence." };
  return { allowed: true, reason: "The console timeline stores its masked text only; the secret shaped values never enter the forensic evidence." };
}
function nettraceorigingate(input) {
  try {
    const origin = new URL(input.url).origin;
    const covered = input.granted.some((pattern) => {
      try {
        return origin === new URL(pattern).origin;
      } catch {
        return false;
      }
    });
    if (!covered) return { allowed: false, reason: `The traced url of ${origin} sits outside the session grants; the net timeline never widens the origin grants.` };
    return { allowed: true, reason: `The traced url of ${origin} sits inside the session grants; the net timeline records it read only.` };
  } catch {
    return { allowed: false, reason: `The traced url ${input.url} does not parse; an unparseable url carries no trace.` };
  }
}
function captureretentiongrade(input) {
  if (input.retention === void 0) return { allowed: true, reason: `The forensic retention stays unconfigured so every record survives; the pass pruned ${input.pruned} record${input.pruned === 1 ? "" : "s"} only because the user asked for the cleanup.` };
  if (!(input.retention >= 1)) return { allowed: false, reason: "The forensic retention stays a positive whole number of records when configured; a broken window refuses instead of guessing." };
  return { allowed: true, reason: `The forensic retention window of ${input.retention} record${input.retention === 1 ? "" : "s"} answered the user cleanup pass that pruned ${input.pruned} record${input.pruned === 1 ? "" : "s"}; no silent sweep ever prunes on its own.` };
}
function thumbnailsizereadonlygrade(input) {
  if (input.edge === void 0) return { allowed: true, reason: "The thumbnail edge stays unconfigured so every thumbnail keeps its capture size; the bound never defaults in code." };
  if (!(input.edge >= 1)) return { allowed: false, reason: "The thumbnail edge stays a positive number of pixels when configured; a broken edge refuses instead of guessing." };
  return { allowed: true, reason: `The thumbnail edge of ${input.edge} pixels stays the user's choice; the thumbshot scales inside the reviewed bound only.` };
}
function diffthresholdgrade(input) {
  if (input.threshold === void 0) return { allowed: true, reason: "The diff threshold stays unconfigured so no regression flags on its own; the bound never defaults in code." };
  if (!(input.threshold >= 0 && input.threshold <= 1)) return { allowed: false, reason: "The diff threshold stays a similarity score between zero and one when configured; a broken threshold refuses instead of guessing." };
  return { allowed: true, reason: `The diff threshold of ${input.threshold} stays the user's choice; the regression flag answers the reviewed bound only.` };
}
function timelapseintervalgrade(input) {
  if (input.interval === void 0) return { allowed: true, reason: "The timelapse interval stays unconfigured so the lapse waits for the explicit user start; the interval carries no code floor." };
  if (!(input.interval > 0)) return { allowed: false, reason: "The timelapse interval stays a positive number of milliseconds when configured; a broken interval refuses instead of guessing." };
  return { allowed: true, reason: `The timelapse interval of ${input.interval} milliseconds stays the user's choice; the lapse captures on the reviewed cadence only.` };
}
function forensicchoices(settings) {
  const diffthreshold = settings?.diffthreshold;
  const timelapseinterval = settings?.timelapseinterval;
  const thumbnailedge = settings?.thumbnailedge;
  const forensicretention = settings?.forensicretention;
  return { ...typeof diffthreshold === "number" && Number.isFinite(diffthreshold) ? { diffthreshold } : {}, ...typeof timelapseinterval === "number" && Number.isFinite(timelapseinterval) && timelapseinterval > 0 ? { timelapseinterval } : {}, ...typeof thumbnailedge === "number" && Number.isFinite(thumbnailedge) && thumbnailedge >= 1 ? { thumbnailedge } : {}, ...typeof forensicretention === "number" && Number.isInteger(forensicretention) && forensicretention >= 1 ? { forensicretention } : {} };
}
function localgate(input) {
  const keys = Object.keys(input.payload).map((key) => key.trim().toLowerCase());
  const carried = input.rules.flatMap((rule) => rule.fields.map((field) => field.trim().toLowerCase())).filter((field) => field !== "" && keys.includes(field));
  if (carried.length > 0) return { allowed: false, reason: `The outbound payload carries the local rule field${carried.length === 1 ? "" : "s"} ${carried.join(", ")}; a field marked local never leaves the device.` };
  return { allowed: true, reason: "The outbound payload carries no local rule field; every field marked local stayed on the device." };
}
function syncgate(input) {
  const enabled = input.settings?.enabled ?? [];
  if (enabled.length === 0) return { allowed: false, reason: "The sync stays off until the user opts in per data class; a sync nobody turned on never transports." };
  if (!enabled.some((item) => item.toLowerCase() === input.dataclass.toLowerCase())) return { allowed: false, reason: `The ${input.dataclass} data class never entered the sync opt in; an unconsented class never leaves the device.` };
  return { allowed: true, reason: `The ${input.dataclass} data class sits among the opted in classes with its consent stamp; the sync transports only what the user enabled.` };
}
function encryptsyncgate(input) {
  if (!input.encrypted) return { allowed: false, reason: "The sync payload ships plaintext; every payload encrypts with the user passphrase before the transport." };
  if (input.formattag === void 0 || input.formattag.trim() === "") return { allowed: false, reason: "The sync payload carries no format version tag; an envelope that cannot name its format answers no decoder." };
  return { allowed: true, reason: `The sync payload encrypts under the ${input.formattag} format tag; the transport carries cipher text only.` };
}
function purgegate(input) {
  const scope = input.scope.map((item) => item.trim().toLowerCase()).filter((item) => item !== "");
  if (scope.length === 0) return { allowed: false, reason: "The purge names its scope; a purge without a scope deletes nothing." };
  const full = scope.includes("all") || scope.includes("runs") && scope.includes("memory") && scope.includes("captures") && scope.includes("settings") && scope.includes("provenance");
  if (!full) return { allowed: true, reason: `The partial purge of the ${scope.join(", ")} scope runs on the user request; the immutable audit hashes survive every scope.` };
  if (input.typed.trim() !== input.confirmation) return { allowed: false, reason: "The full scope purge needs the typed confirmation phrase; a purge nobody typed out never runs." };
  return { allowed: true, reason: "The user typed the confirmation phrase so the full scope purge runs; the immutable audit hashes still survive." };
}
function exportallgate(input) {
  if (!input.useraction) return { allowed: false, reason: "The exportall bundle waits for the explicit user action; a bundle nobody asked for never leaves the device." };
  if (input.records <= 0) return { allowed: false, reason: "The exportall bundle carries stored records; a device holding nothing exports nothing." };
  return { allowed: true, reason: `The user asked for the exportall bundle of ${input.records} record${input.records === 1 ? "" : "s"}; the bundle streams through the reviewed download flow without a size cap.` };
}
function jargate(input) {
  if (input.jarid === void 0) return { allowed: false, reason: "The cookie access needs the session jar; a session without a jar never touches the cookie state of a run." };
  if (input.jar === void 0) return { allowed: false, reason: `No cookie jar matches the jar id ${input.jarid}; the cookie access stays bound to the jar the run owns.` };
  if (input.jar.runid !== input.runid) return { allowed: false, reason: `The jar ${input.jar.jarid} of the run ${input.jar.runid} never joins the run ${input.runid}; one task run never shares its cookie state with another.` };
  if (input.operation === "write" && input.jar.sealed) return { allowed: false, reason: `The jar ${input.jar.jarid} sealed at the run completion; a sealed jar refuses every write.` };
  return { allowed: true, reason: `The ${input.operation} stays scoped to the jar ${input.jar.jarid} of the run ${input.runid}${input.jar.sealed ? " while the sealed state refuses writes" : ""}.` };
}
function cleanupgate(input) {
  if (input.touchesaudit && !input.consent) return { allowed: false, reason: "The cleanup would touch the audit history; the immutable log hashes survive every pass without the explicit user consent." };
  if (input.touchesaudit) return { allowed: true, reason: "The user consented to the audit touching cleanup; the immutable log hashes still verify after the pass." };
  return { allowed: true, reason: "The cleanup touches no audit history; the immutable log hashes survive every pass." };
}
function quarantineopengate(input) {
  if (input.verdict === "clean") return { allowed: true, reason: "The scanner verdict read clean; the quarantined file releases from the sandbox folder." };
  if (input.verdict === "flagged") return { allowed: false, reason: "The scanner verdict read flagged; the quarantined file deletes and never opens." };
  return { allowed: false, reason: `The scanner verdict reads ${input.verdict}; a file without a clean verdict never opens.` };
}
function scannerhookgate(input) {
  if (input.hook === void 0) return { allowed: false, reason: "The quarantine scan needs the user configured scanner hook; an unconfigured scanner keeps the verdict pending and the file held." };
  if (!input.granted) return { allowed: false, reason: `The scanner hook ${input.hook.scanner} of ${input.hook.origin} holds no origin grant; the verdict stays pending and the file held.` };
  return { allowed: true, reason: `The scanner hook ${input.hook.scanner} of ${input.hook.origin} sits configured and granted; the verdict records through the user endpoint only.` };
}
function notelemetryinvariant(input) {
  if (input.outboundcalls > 0) return { allowed: false, reason: `The worker issued ${input.outboundcalls} outbound usage call${input.outboundcalls === 1 ? "" : "s"}; the telemetry stays off so every counter keeps living inside the local memory.` };
  return { allowed: true, reason: "The worker issued no outbound usage call; the telemetry stays off and every counter keeps living inside the local memory." };
}
function minimizationstripgrade(input) {
  const reviewed = new Set(input.reviewed.map((field) => field.trim().toLowerCase()).filter((field) => field !== ""));
  const outside = input.fields.map((field) => field.trim().toLowerCase()).filter((field) => field !== "" && !reviewed.has(field));
  if (outside.length > 0) return { allowed: false, reason: `The extraction carries ${outside.length} field${outside.length === 1 ? "" : "s"} outside the reviewed set: ${outside.join(", ")}; the localfirst pass strips them before any export.` };
  return { allowed: true, reason: `Every field of the extraction sits inside the reviewed set of ${reviewed.size} field${reviewed.size === 1 ? "" : "s"}; the minimization strips nothing further.` };
}
function minimizationchoices(settings) {
  const synccadence = settings?.synccadence;
  const cleanupdelay = settings?.cleanupdelay;
  const jarexpiry = settings?.jarexpiry;
  return { ...typeof synccadence === "number" && Number.isFinite(synccadence) && synccadence > 0 ? { synccadence } : {}, ...typeof cleanupdelay === "number" && Number.isFinite(cleanupdelay) && cleanupdelay > 0 ? { cleanupdelay } : {}, ...typeof jarexpiry === "number" && Number.isFinite(jarexpiry) && jarexpiry > 0 ? { jarexpiry } : {} };
}
function cssselectorvalid(selector) {
  const trimmed = selector.trim();
  if (trimmed === "") return { allowed: false, reason: "The selector is empty; a step that addresses the page names its selector." };
  if (/\{\{[^{}]*\}\}/.test(trimmed) || /\$\{[^{}]*\}/.test(trimmed)) return { allowed: false, reason: `The selector ${trimmed} carries a template placeholder; a templated selector resolves only against the live page of the run, never statically.` };
  const tokens = trimmed.replace(/\s+/g, " ").replace(/([>+~])/g, " $1 ").split(/\s+/).filter((token) => token !== "");
  for (const token of tokens) {
    if (token === ">" || token === "+" || token === "~") continue;
    if (token.length > 512) return { allowed: false, reason: `The selector compound ${token.slice(0, 32)}... runs past the reviewed length; a selector names one region of the page.` };
    if (!compoundconsumes(token)) return { allowed: false, reason: `The selector ${trimmed} stays outside the reviewed grammar of types, ids, classes, attributes and their combinators.` };
    if (/::?(?:has|is|where|matches|any)\(/.test(token)) return { allowed: false, reason: `The selector ${trimmed} carries the unreviewed functional pseudo class ${token}; the reviewed grammar keeps the simple structural pseudo classes only.` };
  }
  return { allowed: true, reason: `The selector ${trimmed} stays inside the reviewed grammar the live resolution and the plan lint share.` };
}
function compoundconsumes(token) {
  let index = 0;
  const first = token.charCodeAt(0);
  if (first === 42) index = 1;
  else if (first >= 97 && first <= 122) {
    index = 1;
    while (index < token.length) {
      const code = token.charCodeAt(index);
      if (!(code >= 97 && code <= 122 || code >= 48 && code <= 57 || code === 45)) break;
      index += 1;
    }
  }
  while (index < token.length) {
    const char = token[index] ?? "";
    if (char === "#" || char === ".") {
      const start = index + 1;
      const code = token.charCodeAt(start);
      if (!(code >= 97 && code <= 122 || code >= 65 && code <= 90 || code === 95)) return false;
      let end = start + 1;
      while (end < token.length) {
        const c = token.charCodeAt(end);
        if (!(c >= 97 && c <= 122 || c >= 65 && c <= 90 || c >= 48 && c <= 57 || c === 95 || c === 45)) break;
        end += 1;
      }
      index = end;
      continue;
    }
    if (char === "[") {
      const close = token.indexOf("]", index + 1);
      if (close === -1 || close === index + 1) return false;
      index = close + 1;
      continue;
    }
    if (char === ":") {
      let cursor = index + 1;
      if (token[cursor] === ":") cursor += 1;
      let letters = 0;
      while (cursor < token.length) {
        const code = token.charCodeAt(cursor);
        if (!(code >= 97 && code <= 122 || code >= 65 && code <= 90 || code === 45)) break;
        letters += 1;
        cursor += 1;
      }
      if (letters === 0) return false;
      if (token[cursor] === "(") {
        const close = token.indexOf(")", cursor + 1);
        if (close === -1) return false;
        if (token.indexOf("(", cursor + 1) !== -1 && token.indexOf("(", cursor + 1) < close) return false;
        index = close + 1;
        continue;
      }
      index = cursor;
      continue;
    }
    return false;
  }
  return true;
}
function kindoptionfields(kind) {
  const required = {
    waitelement: ["wait"],
    delay: ["delay"],
    compute: ["expression"],
    extractvars: ["rule", "text"],
    runworkflow: ["workflowid", "reviewed"],
    dryrun: ["workflowid"],
    condition: ["condition"],
    branch: ["branch"],
    loop: ["loop"],
    repeatuntil: ["repeatuntil"],
    whileloop: ["while"],
    foreach: ["foreach"],
    parallel: ["parallel"],
    trycatch: ["try"]
  };
  return required[kind] ?? [];
}
function fixtureconsentgate(input) {
  if (!input.grants.includes(input.kind)) return { allowed: false, reason: `The kind ${input.kind} stays outside the fixture grants ${input.grants.join(", ") || "(none)"}; the recorded page state grants only the kinds its review listed.` };
  let risk;
  try {
    risk = input.riskof(input.kind);
  } catch {
    return { allowed: false, reason: `The kind ${input.kind} is not a reviewed action kind; the fixture replays only the reviewed vocabulary.` };
  }
  if (risk !== "read") return { allowed: false, reason: `The kind ${input.kind} grades ${risk} and needs a live tab; a recorded page state satisfies only the read only vocabulary.` };
  return { allowed: true, reason: `The kind ${input.kind} stays read only inside the fixture grants of ${input.fixtureorigin}; the headless replay runs it against the recorded state.` };
}
function serverurlgate(url) {
  const trimmed = url.trim();
  if (trimmed === "") return { allowed: true, reason: "The empty relay url disables the site bridge completely; no socket opens and no pairing mints until the user sets one." };
  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { allowed: false, reason: `The relay url ${trimmed} does not parse as a url; the serverurl setting refuses it before saving.` };
  }
  if (parsed.protocol !== "wss:" && parsed.protocol !== "ws:") return { allowed: false, reason: `The relay url must ride wss; the ${parsed.protocol} url the user typed refuses before saving.` };
  if (parsed.protocol === "ws:" && parsed.hostname !== "localhost" && parsed.hostname !== "127.0.0.1" && parsed.hostname !== "[::1]") return { allowed: false, reason: `A plain ws relay url stays reserved for the localhost hosts of local bridge testing; ${parsed.hostname} needs wss.` };
  if (parsed.hostname === "") return { allowed: false, reason: "The relay url names its host; a hostless url refuses before saving." };
  if (parsed.port !== "" && !/^\d{1,5}$/.test(parsed.port)) return { allowed: false, reason: `The relay url port ${parsed.port} stays numeric or absent; the shape refuses before saving.` };
  return { allowed: true, reason: `The relay url ${trimmed} carries the ${parsed.protocol} scheme, the host ${parsed.host} and the shape the serverurl setting accepts; the url stays the user's choice with no default anywhere in the code.` };
}
function bridgeconsentgate(input) {
  if (input.connected) return { allowed: true, reason: "The bridge socket is already connected; the consent gate passed before the first connection and stays recorded." };
  if (input.consent !== true) return { allowed: false, reason: "The site bridge stays disabled until the user consents to the first socket connection; no code path opens the socket without the recorded consent." };
  return { allowed: true, reason: "The user consented to the first socket connection of the site bridge; the connect may open the socket to the user configured relay url." };
}
function bridgemembergate(input) {
  if (input.extension !== 1) return { allowed: false, reason: `The relay session holds exactly one extension side; ${input.extension} extension member${input.extension === 1 ? "" : "s"} refuse.` };
  if (input.site > 1) return { allowed: false, reason: `The relay session holds at most one site side; ${input.site} site members refuse.` };
  return { allowed: true, reason: "The relay session holds one extension side and at most one site side; the two member room stays intact." };
}
function bridgecontentgate(input) {
  const held = Object.keys(input.payload).filter((key) => pagecontentkeys.includes(key));
  if (held.length === 0) return { allowed: true, reason: "The bridge payload carries plan text and statuses only; no page content key rides the frame." };
  if (input.pageconsent !== true) return { allowed: false, reason: `The bridge payload holds the page content key${held.length === 1 ? "" : "s"} ${held.join(", ")}; page content never crosses the bridge without the explicit consent flag.` };
  return { allowed: true, reason: `The user set the explicit page consent flag, so the payload keys ${held.join(", ")} cross the bridge under the recorded consent.` };
}
function bridgepairingwindowvalid(lifetime) {
  if (!Number.isFinite(lifetime) || lifetime <= 0) return { allowed: false, reason: "The bridge pairing lifetime stays a positive number of milliseconds the user chose." };
  return { allowed: true, reason: `The bridge pairing lifetime of ${lifetime} milliseconds stays the user's choice.` };
}
function bridgeidlewindowvalid(window) {
  if (!Number.isFinite(window) || window <= 0) return { allowed: false, reason: "The bridge idle window stays a positive number of milliseconds the user chose." };
  return { allowed: true, reason: `The bridge idle window of ${window} milliseconds stays the user's choice.` };
}
function bridgeheartbeatvalid(interval) {
  if (!Number.isFinite(interval) || interval <= 0) return { allowed: false, reason: "The bridge heartbeat interval stays a positive number of milliseconds the user chose." };
  return { allowed: true, reason: `The bridge heartbeat interval of ${interval} milliseconds stays the user's choice.` };
}
function bridgeratecapvalid(limit, window) {
  if (!Number.isInteger(limit) || limit < 1) return { allowed: false, reason: "The bridge rate cap stays a positive whole number of frames the user chose." };
  if (!Number.isFinite(window) || window <= 0) return { allowed: false, reason: "The bridge rate window stays a positive number of milliseconds the user chose." };
  return { allowed: true, reason: `The bridge rate cap of ${limit} frames per ${window} millisecond window stays the user's choice.` };
}
function bridgekillswitchgate(input) {
  if (input.engaged) return { allowed: false, reason: `The bridge kill switch stays engaged; the ${input.operation} refuses until the user releases the switch.` };
  return { allowed: true, reason: `The bridge kill switch stays released; the ${input.operation} runs inside the consent gates.` };
}
function bridgeframeorigingate(input) {
  if (!input.paired) return { allowed: false, reason: `The sender of the frame holds no pairing of the origin ${input.origin}; an unpaired sender never reaches the extension.` };
  if (input.framesession !== void 0 && input.framesession !== input.sessionid) return { allowed: false, reason: `The frame session ${input.framesession} sits outside the paired session ${input.sessionid}; the origin check refuses the frame.` };
  if (input.framesender !== void 0 && input.framesender.trim() === "") return { allowed: false, reason: "The frame names its sender; an anonymous frame never reaches the extension." };
  return { allowed: true, reason: `The frame of the session ${input.sessionid} carries the pairing of the origin ${input.origin}; the origin check passes.` };
}
function bridgechoices(settings) {
  const current = settings ?? {};
  return { ...current.serverurl !== void 0 ? { serverurl: current.serverurl } : {}, ...current.bridgeconsent !== void 0 ? { bridgeconsent: current.bridgeconsent } : {}, ...current.bridgepageconsent !== void 0 ? { bridgepageconsent: current.bridgepageconsent } : {}, ...current.bridgeidlewindow !== void 0 ? { bridgeidlewindow: current.bridgeidlewindow } : {}, ...current.bridgeheartbeatinterval !== void 0 ? { bridgeheartbeatinterval: current.bridgeheartbeatinterval } : {}, ...current.bridgeratelimit !== void 0 ? { bridgeratelimit: current.bridgeratelimit } : {}, ...current.bridgeratewindow !== void 0 ? { bridgeratewindow: current.bridgeratewindow } : {}, ...current.bridgepairinglifetime !== void 0 ? { bridgepairinglifetime: current.bridgepairinglifetime } : {} };
}
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
function gatewaycachewindowvalid2(window) {
  if (window === void 0) return { allowed: true };
  if (!Number.isFinite(window) || window <= 0) return { allowed: false, reason: `The configured model cache window of ${String(window)} is not a finite positive millisecond count.` };
  return { allowed: true };
}
function nativeinstallconsentgate(input) {
  if (input.hostname.trim() === "") return { allowed: false, reason: "The host registration names its native host; an empty host name never registers." };
  if (input.profiledir.trim() === "") return { allowed: false, reason: "The host registration writes into the user profile directory the user named; the installer never guesses a target." };
  if (input.consent !== true) return { allowed: false, reason: `The install consent gate explains the scope of the ${input.hostname} host registration before any write: the companion process the manifest launches, the ${input.profiledir} profile directory it writes into and the extension origins it allows; no host manifest registers without the recorded consent.` };
  return { allowed: true, reason: `The user consented to the ${input.hostname} host registration into ${input.profiledir} with the scope explained; the installer may write the host manifest.` };
}
function nativetransportconsentgate(input) {
  if (input.killswitch === true) return { allowed: false, reason: `The native transport kill switch stays engaged; every ${input.callclass} call stops instantly until the user releases the switch.` };
  if (!input.installed) return { allowed: false, reason: `The native host stays uninstalled; the ${input.callclass} call refuses because the transport keeps its deny by default posture until the user installs the host.` };
  if (input.consent !== true) return { allowed: false, reason: "The native transport stays disabled until the user consents to the first host attach; no code path opens the native port without the recorded consent." };
  if (!(input.classconsents ?? []).includes(input.callclass)) return { allowed: false, reason: `The ${input.callclass} call class holds no consent grant over the native transport; the gate asks per class and never widens a read grant into an interaction or a sensitive surface.` };
  return { allowed: true, reason: `The user consented to the ${input.callclass} call class over the native transport; the call runs behind the class gate.` };
}
function nativesensitiveapprovalgate(input) {
  if (input.callclass !== "sensitive") return { allowed: true, reason: "The native call carries no sensitive class and needs no human approval beyond its class grant." };
  if (input.approval !== true) return { allowed: false, reason: "The sensitive native call routes through the human approval gate; a desktop surface that addresses the user never runs on the class grant alone." };
  return { allowed: true, reason: "The human approval gate answered the sensitive native call; the surface runs under the recorded approval." };
}
function nativekillswitchgate(input) {
  if (input.engaged) return { allowed: false, reason: `The native transport kill switch stays engaged; the ${input.operation} refuses until the user releases the switch.` };
  return { allowed: true, reason: `The native transport kill switch stays released; the ${input.operation} runs inside the consent gates.` };
}
function nativeescapehatchgate(input) {
  if (!input.pressed) return { allowed: true, reason: "The escape hatch stays unpressed; the in flight native calls run inside the consent gates." };
  return { allowed: false, reason: `The escape hatch key stops every native call in one press: ${input.inflight} in flight call${input.inflight === 1 ? "" : "s"} halted at once and the native transport detached until the user reattaches.` };
}
function nativeheadlessgate(input) {
  if (!input.headless) return { allowed: true, reason: "The run stays live; the native transport follows its own consent gates." };
  if (!input.hostconfigured) return { allowed: false, reason: "The native transport stays disabled in headless mode without a configured host; a headless run never attaches a desktop host the user did not name." };
  return { allowed: true, reason: "The headless run names its host; the native transport follows the same consent gates as the live run." };
}
function nativeidlewindowvalid(window) {
  if (window === void 0) return { allowed: true };
  if (!Number.isFinite(window) || window <= 0) return { allowed: false, reason: `The configured native idle window of ${String(window)} is not a finite positive millisecond count.` };
  return { allowed: true };
}
function nativeheartbeatintervalvalid(interval) {
  if (interval === void 0) return { allowed: true };
  if (!Number.isFinite(interval) || interval <= 0) return { allowed: false, reason: `The configured native heartbeat interval of ${String(interval)} is not a finite positive millisecond count.` };
  return { allowed: true };
}
function nativeratecapvalid(cap) {
  if (cap === void 0) return { allowed: true };
  if (!Number.isFinite(cap) || cap < 1 || Math.floor(cap) !== cap) return { allowed: false, reason: `The configured native rate cap of ${String(cap)} is not a finite positive whole count.` };
  return { allowed: true };
}

// tools.ts
var toolcatalogversion = 2;
var toolnamespaces = ["browser", "workflow", "memory", "system"];
var domainkinds = {
  browser: ["observe", "extract", "readtext", "readtable", "readlinks", "a11ytree", "tablist", "windowlist", "click", "type", "presskey", "navigate", "back", "forward", "reload", "tabcreate", "tabactivate", "tabclose", "windowcreate", "windowclose", "windowresize"],
  workflow: ["composeworkflow", "runworkflow", "dryrun", "eventrule"],
  memory: ["listruns", "extractvars", "trailaudit"],
  system: ["observe", "readmeta"]
};
function toolschemaof(properties) {
  return { type: "object", properties, required: Object.entries(properties).filter(([, property]) => property.required === true).map(([name]) => name) };
}
function openapilayout(schema) {
  const fields = Object.entries(schema.properties).map(([name, property]) => `${name}:${property.type}${property.required === true ? "*" : ""}${property.default !== void 0 ? `=${typeof property.default === "object" ? JSON.stringify(property.default) : String(property.default)}` : ""}`);
  return `Fields: ${fields.join("; ")}.`;
}
function withfielddayout(tool) {
  return { ...tool, description: `${tool.description} ${openapilayout(tool.inputschema)}` };
}
function readtool(name, kind, description, inputs = {}) {
  return { name, version: toolcatalogversion, description, inputschema: toolschemaof({ target: { type: "string", description: "Reviewed css selector the tool addresses." }, value: { type: "string", description: "Reviewed literal value the tool carries." }, options: { type: "object", description: "Reviewed json options of the wrapped action kind with the empty default.", default: {} }, ...inputs }), kind, risk: "read" };
}
function gatedtool(name, kind, risk, description, review) {
  return { name, version: toolcatalogversion, description, inputschema: toolschemaof({ stepid: { type: "string", description: "Id of the approved plan step this tool executes.", required: true } }), kind, risk, consentmeta: { review, riskclass: risk, approvalrequired: true, originscope: "session" } };
}
function browserdomain() {
  return {
    namespace: "browser",
    version: toolcatalogversion,
    tools: [
      readtool("browser.snapshot", "observe", "Captures the semantic snapshot of the active tab: url, title, text preview, forms and interactive elements. Read only with no side effects; runs under the dryrun risk class once the session is approved."),
      readtool("browser.extract", "extract", "Extracts the reviewed structured data of the page. Read only with no side effects."),
      readtool("browser.readtext", "readtext", "Reads the text of the addressed element. Read only with no side effects.", { target: { type: "string", description: "Reviewed css selector of the element to read.", required: true } }),
      readtool("browser.readtable", "readtable", "Reads the rows of the addressed data table. Read only with no side effects.", { target: { type: "string", description: "Reviewed css selector of the table to read.", required: true } }),
      readtool("browser.readlinks", "readlinks", "Reads the link inventory of the page. Read only with no side effects."),
      readtool("browser.a11ytree", "a11ytree", "Reads the accessibility tree of the page. Read only with no side effects."),
      readtool("browser.observe", "observe", "Reads the structured observation record of the active tab \u2014 the url, the title, the page signals, the detected forms and the interactive elements \u2014 exactly as the evidence views render it. Read only with no side effects."),
      readtool("browser.tablist", "tablist", "Lists the open tabs. Read only with no side effects."),
      readtool("browser.windowlist", "windowlist", "Lists the open windows. Read only with no side effects."),
      gatedtool("browser.click", "click", "sensitive", "Clicks the addressed element. Sensitive: it changes page state, so it executes exactly one approved plan step.", "The click runs only as the approved plan step it names; a paired client can never widen the reviewed target or options."),
      gatedtool("browser.type", "type", "sensitive", "Types the reviewed text into the addressed element. Sensitive: it changes page state, so it executes exactly one approved plan step.", "The typing runs only as the approved plan step it names; the reviewed target, text and options stay fixed."),
      gatedtool("browser.presskey", "presskey", "sensitive", "Presses the reviewed key. Sensitive: it changes page state, so it executes exactly one approved plan step.", "The key press runs only as the approved plan step it names."),
      gatedtool("browser.navigate", "navigate", "sensitive", "Navigates the active tab to the reviewed url. Sensitive: it changes browser state, so it executes exactly one approved plan step.", "The navigation runs only as the approved plan step it names and stays inside the session origin grants."),
      gatedtool("browser.back", "back", "sensitive", "Navigates back in the history of the active tab. Sensitive: it changes browser state, so it executes exactly one approved plan step.", "The history navigation runs only as the approved plan step it names."),
      gatedtool("browser.forward", "forward", "sensitive", "Navigates forward in the history of the active tab. Sensitive: it changes browser state, so it executes exactly one approved plan step.", "The history navigation runs only as the approved plan step it names."),
      gatedtool("browser.reload", "reload", "sensitive", "Reloads the active tab. Sensitive: it changes browser state, so it executes exactly one approved plan step.", "The reload runs only as the approved plan step it names."),
      gatedtool("browser.tabcreate", "tabcreate", "sensitive", "Opens a new tab. Sensitive: it changes browser state, so it executes exactly one approved plan step.", "The tab creation runs only as the approved plan step it names."),
      gatedtool("browser.tabactivate", "tabactivate", "sensitive", "Activates the reviewed tab. Sensitive: it moves focus, so it executes exactly one approved plan step.", "The tab activation runs only as the approved plan step it names."),
      gatedtool("browser.tabclose", "tabclose", "sensitive", "Closes the reviewed tab. Sensitive: it destroys browser state, so it executes exactly one approved plan step.", "The tab close runs only as the approved plan step it names."),
      gatedtool("browser.windowcreate", "windowcreate", "sensitive", "Opens a new window. Sensitive: it changes browser state, so it executes exactly one approved plan step.", "The window creation runs only as the approved plan step it names."),
      gatedtool("browser.windowclose", "windowclose", "sensitive", "Closes the reviewed window. Sensitive: it destroys browser state, so it executes exactly one approved plan step.", "The window close runs only as the approved plan step it names."),
      gatedtool("browser.windowresize", "windowresize", "sensitive", "Resizes the reviewed window. Sensitive: it changes browser state, so it executes exactly one approved plan step.", "The window resize runs only as the approved plan step it names.")
    ]
  };
}
function workflowdomain() {
  return {
    namespace: "workflow",
    version: toolcatalogversion,
    tools: [
      readtool("workflow.list", "composeworkflow", "Lists the composed workflows with their names, versions, origins and step counts. Read only with no side effects."),
      readtool("workflow.plan", "composeworkflow", "Proposes a plan with the full reviewed step grammar \u2014 the title, the ordered steps of kind, target, value and reviewed options of the shared step grammar, and the origin the plan runs under \u2014 for the human review; the proposal changes no page state. Read only with no side effects.", { title: { type: "string", description: "Plain language title of the proposed plan.", required: true }, steps: { type: "array", description: "Reviewed plan steps of the full shared grammar: each entry carries its id, its action kind, its target, its value and its reviewed options object.", required: true }, origin: { type: "string", description: "Origin the proposed plan runs under; the session grants check it.", required: true } }),
      readtool("workflow.review", "composeworkflow", "Submits the proposed plan to the human review gate and waits for the answer: the call returns once the human approves or refuses while the gate refuses by default when the user configured window passes. Read only with no side effects \u2014 the run itself still names the approved plan step.", { planid: { type: "string", description: "Id of the proposed plan the review gate submits.", required: true } }),
      readtool("workflow.dryrun", "dryrun", "Runs a composed workflow as a dry run: read steps project their would be outcome and every step with side effects is refused. Read only with no side effects."),
      gatedtool("workflow.run", "runworkflow", "sensitive", "Runs a composed workflow for real. Sensitive: it executes every step of the workflow, so it executes exactly one approved runworkflow plan step with its explicit run review.", "The workflow run needs the explicit run review: the approved runworkflow plan step with its expanded step list shown before the first step executes."),
      gatedtool("workflow.triggers", "eventrule", "sensitive", "Lists the armed trigger rules with their schedules, cooldowns and fire counters so a client can inspect what launches runs automatically. Sensitive by its trigger family: automatic launchers stay behind the arm review class.", "The trigger listing runs behind the approved plan review because trigger rules launch runs automatically.")
    ]
  };
}
function memorydomain() {
  return {
    namespace: "memory",
    version: toolcatalogversion,
    tools: [
      readtool("memory.list", "listruns", "Lists the stored workflow run records with their states and step cursors from local memory. Read only with no page access.", { target: { type: "string", description: "Unused by the memory read; kept for schema uniformity." }, value: { type: "string", description: "Unused by the memory read; kept for schema uniformity." }, state: { type: "string", description: "Optional reviewed run state filter of the listing.", default: "" } }),
      readtool("memory.variables", "extractvars", "Reads the stored variable scopes of a run from local memory. Read only with no page access."),
      readtool("memory.audit", "trailaudit", "Reads the audit summary of the session trail from local memory. Read only with no page access.")
    ]
  };
}
function systemdomain() {
  return {
    namespace: "system",
    version: toolcatalogversion,
    tools: [
      readtool("system.status", "observe", "Reports the mcp server status, the session state and the connected clients. Read only with no side effects."),
      readtool("system.version", "readmeta", "Reports the protocol version, the catalog version and the extension version. Read only with no side effects."),
      readtool("system.session", "observe", "Reports the live session record of the extension session the client pairs with: the session state, its origin grants and its expiry. Read only with no side effects."),
      readtool("system.capabilities", "observe", "Reports the optional browser capabilities the user has granted. Read only with no side effects.")
    ]
  };
}
function buildtoolcatalog() {
  return { version: toolcatalogversion, domains: [browserdomain(), workflowdomain(), memorydomain(), systemdomain()].map((domain) => ({ ...domain, tools: domain.tools.map(withfielddayout) })) };
}
function alltools(catalog) {
  return catalog.domains.flatMap((domain) => domain.tools);
}
function toolname(namespace, base) {
  return `${namespace}.${base}`;
}
function resolvetool(catalog, name) {
  if (name.includes(".")) return alltools(catalog).find((tool) => tool.name === name);
  const matches = alltools(catalog).filter((tool) => tool.name.split(".")[1] === name);
  return matches.length === 1 ? matches[0] : void 0;
}
function namespaceof(name) {
  const head = name.split(".")[0];
  return toolnamespaces.includes(head) ? head : void 0;
}
function toolsbynamespace(catalog) {
  return catalog.domains.map((domain) => ({ namespace: domain.namespace, version: domain.version, tools: domain.tools }));
}
var defaultidempotencywindowms = 3e5;
function applyratelimit(input) {
  const existing = input.limits.find((limit2) => limit2.clientid === input.clientid);
  if (existing === void 0) return { allowed: true, used: 0, limits: input.limits };
  const elapsed = input.now - existing.windowstartedat;
  const limit = elapsed >= existing.windowms ? { ...existing, windowstartedat: input.now, used: 0 } : existing;
  if (limit.budget !== void 0 && limit.used >= limit.budget) {
    const retryafter = Math.max(0, limit.windowms - (input.now - limit.windowstartedat));
    return { allowed: false, used: limit.used, budget: limit.budget, retryafter, limits: input.limits.map((candidate) => candidate.clientid === input.clientid ? limit : candidate) };
  }
  const counted = { ...limit, used: limit.used + 1 };
  return { allowed: true, used: counted.used, ...counted.budget !== void 0 ? { budget: counted.budget } : {}, limit: counted, limits: input.limits.map((candidate) => candidate.clientid === input.clientid ? counted : candidate) };
}
function structurederrorof(input) {
  return { code: input.code, message: input.message, retryhint: input.retryhint, ...input.retryafter !== void 0 ? { retryafter: input.retryafter } : {} };
}
function callretryhintof(failure) {
  const text = `${failure.code ?? ""} ${failure.message ?? ""}`.toLowerCase();
  if (text.includes("consent") || text.includes("refus") || text.includes("unpaired") || text.includes("unapproved") || text.includes("grant")) return "none";
  if (text.includes("rate") || text.includes("busy") || text.includes("queue") || text.includes("window")) return "wait";
  if (text.includes("timeout") || text.includes("timed out") || text.includes("internal") || text.includes("network")) return "retry";
  return "none";
}
function maptoolerror(input) {
  const code = input.failure instanceof Error ? "internal" : input.failure.code ?? "internal";
  const message = input.failure instanceof Error ? input.failure.message : input.failure.message;
  return structurederrorof({ code, message, retryhint: callretryhintof({ code, message }), ...input.retryafter !== void 0 ? { retryafter: input.retryafter } : {} });
}
function checkidempotency(input) {
  const match = input.records.find((record) => record.key === input.key && record.clientid === input.clientid);
  if (match !== void 0) {
    if (input.now >= match.expiresat) return { reason: "The idempotency record expired past its window and the call runs again." };
    return { replay: match.result, record: match };
  }
  if (input.records.some((record) => record.key === input.key)) return { reason: "The idempotency key belongs to another client and never replays across clients." };
  return { reason: "The idempotency key names no stored record." };
}
function recordidempotency(input) {
  const record = { key: input.key, clientid: input.clientid, tool: input.tool, result: input.result, createdat: input.now, expiresat: input.now + (input.window ?? defaultidempotencywindowms) };
  return [record, ...input.records.filter((candidate) => !(candidate.key === input.key && candidate.clientid === input.clientid))];
}
function expireidempotency(records, now) {
  return records.filter((record) => now < record.expiresat);
}
async function runbatch(input) {
  const outcomes = [];
  for (let index = 0; index < input.calls.length; index += 1) {
    const call = input.calls[index];
    if (call === void 0) continue;
    const outcome = await input.execute(call, index);
    outcomes.push({ callid: call.id, tool: call.name, ok: outcome.ok, ...outcome.result !== void 0 ? { result: outcome.result } : {}, ...outcome.error !== void 0 ? { error: outcome.error } : {}, at: input.now + index });
    if (!outcome.ok && input.stoponerror) return { outcomes, stoppedat: call.id };
  }
  return { outcomes };
}
function dryruntool(input) {
  const findings = [];
  for (const required of input.tool.inputschema.required) {
    const value = input.params[required];
    if (value === void 0 || value === null || typeof value === "string" && value.trim() === "") findings.push(`The required argument ${required} of ${input.tool.name} stays empty.`);
  }
  for (const [name, property] of Object.entries(input.tool.inputschema.properties)) {
    const value = input.params[name];
    if (value === void 0 || value === null) continue;
    const expected = property.type;
    const actual = Array.isArray(value) ? "array" : typeof value;
    if (actual !== expected) findings.push(`The argument ${name} of ${input.tool.name} carries a ${actual} value where the schema asks a ${expected}.`);
  }
  const stepid = input.stepid !== void 0 ? input.stepid : typeof input.params.stepid === "string" ? input.params.stepid : void 0;
  const gate = tooldispatchgate({ client: input.client, tool: input.tool, session: input.session, plan: input.plan, origin: input.origin, ...stepid !== void 0 ? { stepid } : {}, now: input.now });
  if (!gate.allowed) findings.push(gate.reason ?? `The consent gates refused the ${input.tool.name} dry run.`);
  return { callid: input.callid ?? randomid(), tool: input.tool.name, argsvalid: findings.length === 0, consentok: gate.allowed, findings, executed: false, mutations: [], at: input.now };
}
function applymock(input) {
  const mock = input.mocks.find((candidate) => candidate.tool === input.tool);
  if (mock === void 0) return {};
  if (mock.testcontext !== true) return { reason: `The ${input.tool} mock stays outside a test context and is refused; mocks never answer real calls.` };
  return { result: mock.result };
}
function begincall(input) {
  return { callid: input.callid ?? randomid(), clientid: input.clientid, tool: input.tool, state: "inflight", startedat: input.now, ...input.idempotencykey !== void 0 && input.idempotencykey.trim() !== "" ? { idempotencykey: input.idempotencykey } : {}, ...input.dryrun === true ? { dryrun: true } : {}, ...input.batchid !== void 0 ? { batchid: input.batchid } : {}, chunks: 0 };
}
function endcall(input) {
  const match = input.contexts.find((context2) => context2.callid === input.callid);
  if (match === void 0) return { contexts: input.contexts, reason: `The call context ${input.callid} never opened.` };
  if (match.state !== "inflight") return { contexts: input.contexts, context: match };
  const context = { ...match, state: input.ok ? "done" : "failed", endedat: input.now, ...input.errorcode !== void 0 ? { errorcode: input.errorcode } : {}, ...input.partial !== void 0 ? { partial: input.partial } : {} };
  return { contexts: input.contexts.map((candidate) => candidate.callid === input.callid ? context : candidate), context };
}
function batchrisk(calls) {
  return calls.some((call) => call.risk === "sensitive") ? "sensitive" : "read";
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
function batchof(frames) {
  if (frames.length === 0) return { error: rpcerrorof("params", "A batch message carries at least one frame.") };
  return { message: frames.length === 1 ? frames[0] : frames };
}
function isnotification(frame) {
  return frame.id === void 0;
}
function notificationframe(method, params) {
  return { jsonrpc: "2.0", method, ...params !== void 0 ? { params } : {} };
}
function errorwithretry(input) {
  const known = Object.keys(rpcerrornumbers).find((code) => code === input.code);
  const wirecode = known ?? "internal";
  const structured = structurederrorof({ code: input.code, message: input.message, retryhint: input.retryhint, ...input.retryafter !== void 0 ? { retryafter: input.retryafter } : {} });
  return rpcerrorof(wirecode, input.message, structured);
}
function structuredof(error) {
  if (error.data !== void 0 && error.data !== null && typeof error.data === "object" && !Array.isArray(error.data)) {
    const data = error.data;
    if (typeof data.code === "string" && typeof data.message === "string" && (data.retryhint === "retry" || data.retryhint === "wait" || data.retryhint === "none")) {
      return { code: data.code, message: data.message, retryhint: data.retryhint, ...typeof data.retryafter === "number" ? { retryafter: data.retryafter } : {} };
    }
  }
  return structurederrorof({ code: error.code, message: error.message, retryhint: "none" });
}
function errorresponse(input) {
  return respond({ ...input.id === void 0 ? {} : { id: input.id }, error: errorwithretry({ code: input.code, message: input.message, retryhint: input.retryhint, ...input.retryafter !== void 0 ? { retryafter: input.retryafter } : {} }) });
}
function resultresponse(id, result) {
  return respond({ ...id === void 0 ? {} : { id }, result });
}
function toolresultof(result) {
  if (result !== void 0 && result !== null && typeof result === "object" && !Array.isArray(result)) {
    const candidate = result;
    if (typeof candidate.content === "string" && typeof candidate.iserror === "boolean") return { content: candidate.content, iserror: candidate.iserror, ...candidate.payload !== void 0 && candidate.payload !== null && typeof candidate.payload === "object" && !Array.isArray(candidate.payload) ? { payload: candidate.payload } : {} };
  }
  return void 0;
}
var resourceuris = ["devthink://pagestate", "devthink://plan", "devthink://audit", "devthink://session", "devthink://health"];
function servedresources() {
  return [
    { uri: "devthink://pagestate", name: "pagestate", description: "The page state of the session tab: the url, the title and the page signals of the observed page \u2014 never the page content the user granted none of.", mimetype: "application/json" },
    { uri: "devthink://plan", name: "plan", description: "The plan of the live session with its state, its origin, its objective and its reviewed steps.", mimetype: "application/json" },
    { uri: "devthink://audit", name: "audit", description: "The audit trail of the session: every entry summary with its kind and time and no payload.", mimetype: "application/json" },
    { uri: "devthink://session", name: "session", description: "The session record of the extension session the client pairs with: the state, the origin grants and the expiry.", mimetype: "application/json" },
    { uri: "devthink://health", name: "health", description: "The health line of the serve mode: the extension version, the protocol version, the server contract version, the uptime and the serve state.", mimetype: "application/json" }
  ];
}
function resourceof(uri) {
  return servedresources().find((resource) => resource.uri === uri);
}
function readresource(input) {
  const resource = resourceof(input.uri);
  if (resource === void 0) return { reason: `The serve mode publishes no resource named ${input.uri}.` };
  if (resource.uri === "devthink://pagestate") return { resource, text: JSON.stringify(input.pagestate ?? {}) };
  if (resource.uri === "devthink://plan") return { resource, text: JSON.stringify(input.plan ?? null) };
  if (resource.uri === "devthink://audit") return { resource, text: JSON.stringify((input.audit ?? []).map((entry) => ({ id: entry.id, kind: entry.kind, at: entry.at, summary: entry.summary }))) };
  if (resource.uri === "devthink://session") {
    if (input.session === void 0) return { resource, text: JSON.stringify(null) };
    return { resource, text: JSON.stringify({ id: input.session.id, tabid: input.session.tabid, origin: input.session.origin, startedat: input.session.startedat, expiresat: input.session.expiresat, grants: input.session.grants, ...input.session.stoppedat !== void 0 ? { stoppedat: input.session.stoppedat } : {}, ...input.session.pausedat !== void 0 ? { pausedat: input.session.pausedat } : {} }) };
  }
  return { resource, text: JSON.stringify(input.health ?? {}) };
}
function subscriberesource(input) {
  if (input.clientid.trim() === "") return { reason: "The resource subscription needs the paired client it belongs to." };
  if (resourceof(input.uri) === void 0) return { reason: `The serve mode publishes no resource named ${input.uri}.` };
  const watched = watchresource({ clientid: input.clientid, resource: input.uri, ...input.state !== void 0 ? { state: input.state } : {}, now: input.now, id: input.id ?? randomid() });
  return { ...watched.watch !== void 0 ? { watch: watched.watch } : {}, ...watched.reason !== void 0 ? { reason: watched.reason } : {} };
}
function publishchange(input) {
  const outcome = notifyresource({ watches: input.watches, resource: input.uri, state: input.state, now: input.now });
  return { deliveries: outcome.deliveries.map((delivery) => ({ ...delivery, frame: resourcechangeframe(delivery.watchid, input.uri, delivery.delta, input.now) })), watches: outcome.watches };
}
function resourcechangeframe(watchid, uri, delta, now) {
  return { jsonrpc: "2.0", method: "resources/updated", params: { watchid, uri, delta, at: now } };
}
function resourceslist() {
  return { resources: servedresources() };
}
function walkthroughprompts() {
  return [
    { name: "walkthrough.firstsnapshot", description: "Walks a client through the first reviewed snapshot: pair the client, read the page state and propose the plan behind the human review.", arguments: [{ name: "origin", description: "The origin of the page the walkthrough observes.", required: true }], template: "First snapshot walkthrough for {{origin}}. Steps: 1. the paired client calls browser.snapshot to read the semantic snapshot of the active tab; 2. the client reads the devthink://pagestate resource for the page signals; 3. the client proposes its plan through workflow.plan with the observed steps; 4. the human review approves or refuses the plan before any step with side effects runs." },
    { name: "walkthrough.reviewedfill", description: "Walks a client through a reviewed form fill: propose the typed plan, wait for the review gate and execute exactly the approved steps.", arguments: [{ name: "form", description: "The reviewed selector of the form the walkthrough fills.", required: true }, { name: "fields", description: "The reviewed field values of the fill.", required: true }], template: "Reviewed fill walkthrough for {{form}} with {{fields}}. Steps: 1. the client reads the form through browser.extract; 2. the client proposes the typed steps through workflow.plan naming every field value; 3. the client submits the plan through workflow.review and the call waits for the human answer; 4. the approved steps run exactly as reviewed while a refused gate never executes." },
    { name: "walkthrough.tablextract", description: "Walks a client through a reviewed table extraction: read the table, stream the rows and keep the provenance.", arguments: [{ name: "table", description: "The reviewed selector of the table the walkthrough extracts.", required: true }], template: "Table extraction walkthrough for {{table}}. Steps: 1. the client reads the table through browser.readtable; 2. long results stream through the call chunks while the client reads them as they arrive; 3. the client reads the devthink://audit resource for the provenance of every read; 4. nothing leaves the machine because every step stays a read." }
  ];
}
function templateprompt(template) {
  return { name: template.name, description: `The user authored template ${template.name} of the prompt library (version ${template.version})${template.notes !== void 0 ? ` \u2014 ${template.notes}` : ""}; the declared arguments are its template variables.`, arguments: template.variables.map((variable) => ({ name: variable, description: `The value the template substitutes for the {{${variable}}} placeholder.`, required: true })), template: template.body };
}
function listmcpprompts(templates) {
  return [...walkthroughprompts(), ...templates.map(templateprompt), ...listprompts()];
}
function rendermcpprompt(input) {
  const prompts = listmcpprompts(input.templates);
  const prompt = prompts.find((candidate) => candidate.name === input.name);
  if (prompt === void 0) return { reason: `The serve mode publishes no prompt named ${input.name}.` };
  const args = input.args ?? {};
  const template = input.templates.find((candidate) => candidate.name === input.name && candidate.version === Math.max(...input.templates.filter((entry) => entry.name === input.name).map((entry) => entry.version)));
  if (template !== void 0) {
    const variables = {};
    for (const argument of prompt.arguments) {
      const value = args[argument.name];
      if (value !== void 0 && value !== null) variables[argument.name] = value;
    }
    const outcome = rendertemplate({ template, variables, sensitive: false });
    if (outcome.text !== void 0) return { prompt, rendered: outcome.text };
    return { prompt, reason: outcome.reason ?? "The library template did not render." };
  }
  return { prompt, rendered: renderprompt(prompt, args) };
}
function promptsof(templates) {
  return { prompts: listmcpprompts(templates) };
}

// mcp.ts
function servemethods() {
  return [
    { method: "initialize", handler: "initialize", description: "Completes the mcp handshake, records the client metadata and returns the server info with the server contract version." },
    { method: "ping", handler: "ping", description: "Answers keepalive frames with pong." },
    { method: "tools/list", handler: "listtools", description: "Returns every exposed tool the current grants cover with its version, json schema inputs and consent metadata." },
    { method: "negotiate", handler: "negotiate", description: "Exchanges capability sets with the client." },
    { method: "tools/call", handler: "dispatch", description: "Invokes one tool behind the consent gates with the mock, dry run, idempotency and approval composition." },
    { method: "prompts/list", handler: "listprompts", description: "Lists the walkthrough prompts, the user authored template library and the protocol prompt tools." },
    { method: "prompts/call", handler: "callprompt", description: "Renders one served prompt with its declared arguments." },
    { method: "resources/list", handler: "listresources", description: "Lists every served resource with its uri, description and mimetype." },
    { method: "resources/read", handler: "readresource", description: "Reads one served resource into its wire text." },
    { method: "resources/subscribe", handler: "subscriberesource", description: "Opens one resource subscription with its change notifications." },
    { method: "resources/unsubscribe", handler: "unsubscriberesource", description: "Closes one resource subscription." },
    { method: "calls/cancel", handler: "cancel", description: "Aborts one in flight tool call and preserves its partial result." },
    { method: "calls/batch", handler: "batch", description: "Runs an ordered batch of tool calls in one request with the stop on first error flag." },
    { method: "health", handler: "health", description: "Returns the health resource with the version and the uptime." }
  ];
}
function servemetadata(input) {
  const capabilities = servercapabilities({ config: input.config, catalog: input.catalog });
  return {
    serverinfo: { ...capabilities, servercontractversion, resourcecount: servedresources().length, promptcount: listmcpprompts(input.templates).length },
    protocolversion,
    servercontractversion,
    instructions: `Devthink serves its browser tools, resources and prompts behind the human review gates: read only tools run once a session is approved, every tool with side effects executes exactly the approved plan step it names and blocks until the human approval gate answers, the served resources carry no page content the user granted none of, and every call lands in the audit trail with its caller, tool and outcome. The server contract version ${servercontractversion} rides beside the mcp version ${protocolversion} on every event envelope. No endpoint, provider or key is hardcoded; the user pairs every client.`
  };
}
function clientmetadataof(params) {
  const info = params?.clientinfo ?? params?.client;
  if (info === void 0 || info === null || typeof info !== "object" || Array.isArray(info)) return {};
  const candidate = info;
  const name = typeof candidate.name === "string" && candidate.name.trim() !== "" ? candidate.name.trim() : void 0;
  const version = typeof candidate.version === "string" && candidate.version.trim() !== "" ? candidate.version.trim() : void 0;
  return { ...name !== void 0 ? { name } : {}, ...version !== void 0 ? { version } : {} };
}
function recordclientmetadata(client, metadata) {
  return { ...client, ...metadata.name !== void 0 ? { name: metadata.name } : {}, ...metadata.version !== void 0 ? { clientversion: metadata.version } : {} };
}
function serveinitialize(input) {
  return { handshake: servemetadata({ config: input.config, catalog: input.catalog, templates: input.templates }), client: (client) => recordclientmetadata(client, clientmetadataof(input.params)) };
}
function transportendpoints(input) {
  const transports = [];
  if (input.config.transports.includes("stdio")) transports.push({ kind: "stdio", endpoint: "stdio://devthink", startedat: input.now });
  if (input.config.transports.includes("http")) {
    const bind = input.config.bind !== void 0 && input.config.bind.trim() !== "" ? input.config.bind.trim() : "127.0.0.1";
    const path = input.config.httpstream?.endpoint !== void 0 && input.config.httpstream.endpoint.trim() !== "" ? input.config.httpstream.endpoint.trim() : "/mcp";
    transports.push({ kind: "http", endpoint: `http://${bind}:${input.config.port}${path}`, startedat: input.now });
  }
  return transports;
}
function startserve(input) {
  const gate = mcpmodegate(input.config);
  if (!gate.allowed) return { reason: gate.reason ?? "The serve mode failed its gate." };
  const degradation = degradationgate({ ...input.grants !== void 0 ? { grants: input.grants } : {}, ...input.origin !== void 0 ? { origin: input.origin } : {} });
  return { state: { state: "running", transports: transportendpoints({ config: input.config, now: input.now }), startedat: input.now, degraded: !degradation.allowed } };
}
function shutdowndrain(input) {
  const waiting = input.inflight.filter((context) => context.state === "inflight").length;
  if (waiting === 0) return { phase: "stopped", waiting: 0 };
  if (input.window !== void 0 && input.drainstart !== void 0 && input.now - input.drainstart >= input.window) return { phase: "stopped", waiting };
  return { phase: "draining", waiting };
}
function healthof(input) {
  return { version: packageversion, protocolversion, servercontractversion, uptime: Math.max(0, input.now - input.startedat), state: input.state, at: input.now };
}
function bindclientsession(input) {
  const degradation = degradationgate({ ...input.grants !== void 0 ? { grants: input.grants } : {}, ...input.origin !== void 0 ? { origin: input.origin } : {} });
  return { clientid: input.clientid, sessionid: input.sessionid, ...input.tokenid !== void 0 ? { tokenid: input.tokenid } : {}, readonly: !degradation.allowed, boundat: input.now };
}
function releasebinding(bindings, clientid, now) {
  return bindings.map((binding) => binding.clientid === clientid && binding.releasedat === void 0 ? { ...binding, releasedat: now } : binding);
}
function isolatedsessions(bindings) {
  const live = bindings.filter((binding) => binding.releasedat === void 0);
  return new Set(live.map((binding) => binding.sessionid)).size === live.length;
}
function exposedtools(catalog, options = {}) {
  const exposed = alltools(catalog).filter((tool) => (options.readonly !== true || tool.risk === "read") && (options.scopes === void 0 || options.scopes.includes(namespaceof(tool.name))));
  return { version: catalog.version, domains: catalog.domains.map((domain) => ({ ...domain, tools: domain.tools.filter((tool) => exposed.some((entry) => entry.name === tool.name)) })).filter((domain) => domain.tools.length > 0) };
}
function planprogressevent(input) {
  const envelope = composeenvelope({ op: "eventpost", opid: stableopid(`mcpmode-progress-${input.stepid}`, input.sequence), at: input.at, version: servercontractversion, ...input.sessionid !== void 0 ? { sessionid: input.sessionid } : {}, body: eventpostbody({ event: { kind: "progress", stream: "mcpmode", payload: progresseventpayload({ stepid: input.stepid, status: input.status }) } }) });
  return { envelope, wire: `${frameof(envelope)}
` };
}
function samplingframe(input) {
  const requested = requestsampling({ clientid: input.clientid, ...input.capabilities !== void 0 ? { capabilities: input.capabilities } : {}, prompt: input.prompt, ...input.system !== void 0 ? { system: input.system } : {}, ...input.pagecontent !== void 0 ? { pagecontent: input.pagecontent } : {}, ...input.pagegrant !== void 0 ? { pagegrant: input.pagegrant } : {}, ...input.maxtokens !== void 0 ? { maxtokens: input.maxtokens } : {}, now: input.now });
  if (requested.request === void 0) return { ...requested.reason !== void 0 ? { reason: requested.reason } : {} };
  return { request: requested.request, frame: { jsonrpc: "2.0", id: requested.request.id, method: "sampling/create", params: { id: requested.request.id, prompt: requested.request.prompt, ...requested.request.system !== void 0 ? { system: requested.request.system } : {}, ...requested.request.pagecontent !== void 0 ? { pagecontent: requested.request.pagecontent } : {}, ...requested.request.maxtokens !== void 0 ? { maxtokens: requested.request.maxtokens } : {} } } };
}
function chunkframes(chunks) {
  return chunks.map((chunk) => notificationframe("calls/streamchunk", { callid: chunk.callid, seq: chunk.seq, content: chunk.content, done: chunk.done, at: chunk.at }));
}
function progressframe(notice) {
  return notificationframe("calls/progress", { callid: notice.callid, ...notice.percent !== void 0 ? { percent: notice.percent } : {}, message: notice.message, cancellable: notice.cancellable, at: notice.at });
}
function chunkof(input) {
  const chunk = streamchunkof(input);
  return { chunk, frame: chunkframes([chunk])[0] };
}
function progressof(input) {
  const notice = notifyprogress(input);
  return { notice, frame: progressframe(notice) };
}
function servecallevent(input) {
  return { id: randomid(), clientid: input.client.id, tool: input.tool, origin: input.origin, ok: input.ok, ...input.code !== void 0 ? { code: input.code } : {}, at: input.now, ...input.callid !== void 0 ? { callid: input.callid } : {}, ...input.idempotencykey !== void 0 && input.idempotencykey.trim() !== "" ? { idempotencykey: input.idempotencykey } : {}, ...input.dryrun === true ? { dryrun: true } : {}, ...input.mocked === true ? { mocked: true } : {}, ...input.batchid !== void 0 ? { batchid: input.batchid } : {}, ...input.replayed === true ? { replayed: true } : {} };
}
function auditline(record, client) {
  const caller = client !== void 0 ? `${client.name ?? client.id}${client.clientversion !== void 0 ? ` (${client.clientversion})` : ""}` : record.clientid;
  return `The client ${caller} called ${record.tool} on ${record.origin} with the outcome ${record.ok ? "ok" : `refused (${String(record.code ?? "internal")})`}${record.dryrun === true ? " as a dry run" : ""}${record.mocked === true ? " through a test mock" : ""}${record.replayed === true ? " as an idempotent replay" : ""}${record.batchid !== void 0 ? ` in the batch ${record.batchid}` : ""}.`;
}
function stepdetails(step, result) {
  return { ...result, payload: { ...result.payload ?? {}, stepid: step.id, kind: step.kind, risk: step.risk, summary: step.summary } };
}
async function dispatchcall(input) {
  const params = input.params;
  const id = input.id;
  const answer = (result2) => ({ response: respond({ ...id !== void 0 ? { id } : {}, result: result2 }) });
  const fail = (code, message) => ({ response: respond({ ...id !== void 0 ? { id } : {}, error: rpcerrorof(code, message) }) });
  if (!params || typeof params !== "object" || Array.isArray(params)) return fail("params", "The tool call needs its params object.");
  const name = typeof params.name === "string" ? params.name.trim() : "";
  if (name === "") return fail("params", "The tool call needs the namespaced name of the tool it invokes.");
  const tool = resolvetool(input.catalog, name);
  if (tool === void 0) return fail("params", `The catalog holds no unambiguous tool named ${name}.`);
  if (input.readonly === true && tool.risk !== "read") return fail("consentrefused", `The serve runs degraded to the read only tools and refuses ${name}.`);
  const namespace = namespaceof(tool.name);
  if (input.scopes !== void 0 && namespace !== void 0 && !input.scopes.includes(namespace)) return fail("consentrefused", `The session token grants no ${namespace} tools.`);
  const key = typeof params.idempotencykey === "string" && params.idempotencykey.trim() !== "" ? params.idempotencykey : void 0;
  if (key !== void 0) {
    const replay = checkidempotency({ records: input.idempotency ?? [], key, clientid: input.client.id, now: input.now });
    if (replay.replay !== void 0) {
      const record2 = servecallevent({ client: input.client, tool: tool.name, origin: input.origin, ok: !replay.replay.iserror, now: input.now, idempotencykey: key, replayed: true });
      return { ...answer(replay.replay), record: record2 };
    }
  }
  const mocked = applymock({ mocks: input.mocks ?? [], tool: tool.name });
  if (mocked.result !== void 0) {
    const record2 = servecallevent({ client: input.client, tool: tool.name, origin: input.origin, ok: !mocked.result.iserror, now: input.now, mocked: true });
    return { ...answer(mocked.result), record: record2 };
  }
  if (params.dryrun === true) {
    const dryrun = dryruntool({ tool, params, client: input.client, ...input.session !== void 0 ? { session: input.session } : {}, ...input.plan !== void 0 ? { plan: input.plan } : {}, origin: input.origin, ...typeof params.stepid === "string" ? { stepid: params.stepid } : {}, now: input.now });
    const ok = dryrun.argsvalid && dryrun.consentok;
    const record2 = servecallevent({ client: input.client, tool: tool.name, origin: input.origin, ok, now: input.now, ...ok ? {} : { code: "consentrefused" }, dryrun: true });
    return { response: respond({ ...id !== void 0 ? { id } : {}, result: { content: JSON.stringify(dryrun), iserror: !ok } }), record: record2 };
  }
  if (input.limits !== void 0 && input.limits.length > 0) {
    const limited = applyratelimit({ limits: input.limits, clientid: input.client.id, now: input.now });
    if (!limited.allowed) return fail("params", `The client exhausted its call budget of ${String(limited.budget ?? 0)} for the ${String(limited.limit?.windowms ?? 0)} millisecond window; retry after ${String(limited.retryafter ?? 0)} milliseconds.`);
  }
  if (input.client.fingerprint !== void 0 && input.allowlist !== void 0 && input.allowlist.length > 0) {
    const admitted = checkallowlist({ entries: input.allowlist, fingerprint: input.client.fingerprint, ...namespace !== void 0 ? { namespace } : {} });
    if (!admitted.allowed) return fail("consentrefused", admitted.reason ?? "The client fingerprint stays outside the allowlist.");
  }
  const stepid = typeof params.stepid === "string" ? params.stepid : void 0;
  const gate = tooldispatchgate({ client: input.client, tool, session: input.session, plan: input.plan, origin: input.origin, ...stepid !== void 0 ? { stepid } : {}, now: input.now });
  if (!gate.allowed) {
    const record2 = servecallevent({ client: input.client, tool: tool.name, origin: input.origin, ok: false, now: input.now, code: "consentrefused" });
    return { ...fail("consentrefused", gate.reason ?? "The consent gates refused the tool call."), record: record2 };
  }
  if (tool.risk !== "read" && tool.consentmeta?.approvalrequired === true) {
    const approval = requireapproval({ clientid: input.client.id, tool: tool.name, reason: tool.consentmeta.review, params, now: input.now, ...input.approvaltimeout !== void 0 ? { timeout: input.approvaltimeout } : {} });
    return { blocked: true, approval, approvals: [...(input.approvals ?? []).filter((candidate) => candidate.id !== approval.id), approval] };
  }
  const step = tool.risk === "read" ? { id: `mcp-${input.client.id}-${input.now}`, kind: tool.kind, summary: tool.description.split(".")[0] ?? tool.description, risk: "read", ...typeof params.target === "string" ? { target: params.target } : {}, ...typeof params.value === "string" ? { value: params.value } : {}, ...params.options !== void 0 && typeof params.options === "object" && !Array.isArray(params.options) ? { options: JSON.stringify(params.options) } : {} } : input.plan?.steps.find((candidate) => candidate.id === stepid);
  if (step === void 0) return fail("consentrefused", "The tool call names a step the approved plan does not carry.");
  const callid = `call-${input.now}-${randomid().slice(0, 6)}`;
  const contexts = [...input.contexts ?? [], begincall({ clientid: input.client.id, tool: tool.name, callid, ...key !== void 0 ? { idempotencykey: key } : {}, now: input.now })];
  let result;
  try {
    result = await input.execute(step);
  } catch (error) {
    const closed2 = endcall({ contexts, callid, ok: false, errorcode: "internal", now: input.now });
    return { response: respond({ ...id !== void 0 ? { id } : {}, error: rpcerrorof("internal", error instanceof Error ? error.message : String(error)) }), contexts: closed2.contexts, record: servecallevent({ client: input.client, tool: tool.name, origin: input.origin, ok: false, now: input.now, code: "internal", callid }) };
  }
  const closed = endcall({ contexts, callid, ok: !result.iserror, now: input.now });
  const detailed = stepdetails(step, result);
  const record = servecallevent({ client: input.client, tool: tool.name, origin: input.origin, ok: !result.iserror, now: input.now, callid, ...key !== void 0 ? { idempotencykey: key } : {} });
  const records = key !== void 0 ? recordidempotency({ records: input.idempotency ?? [], key, clientid: input.client.id, tool: tool.name, result: detailed, now: input.now, ...input.idempotencywindow !== void 0 ? { window: input.idempotencywindow } : {} }) : input.idempotency;
  return { ...answer(detailed), record, contexts: closed.contexts, ...records !== void 0 ? { records } : {} };
}
async function resumegatedcall(input) {
  if (input.approval.state !== "approved") {
    return { response: respond({ error: rpcerrorof("consentrefused", `The approval gate ${input.approval.id} answered ${input.approval.state} and the call never executes.`) }), record: servecallevent({ client: input.client, tool: input.approval.tool, origin: input.origin, ok: false, now: input.now, code: "consentrefused" }) };
  }
  const tool = resolvetool(input.catalog, input.approval.tool);
  if (tool === void 0) return { response: respond({ error: rpcerrorof("params", `The catalog holds no unambiguous tool named ${input.approval.tool}.`) }) };
  const stepid = typeof input.approval.params.stepid === "string" ? input.approval.params.stepid : void 0;
  const gate = tooldispatchgate({ client: input.client, tool, session: input.session, plan: input.plan, origin: input.origin, ...stepid !== void 0 ? { stepid } : {}, now: input.now });
  if (!gate.allowed) {
    return { response: respond({ error: rpcerrorof("consentrefused", gate.reason ?? "The consent gates refused the tool call.") }), record: servecallevent({ client: input.client, tool: tool.name, origin: input.origin, ok: false, now: input.now, code: "consentrefused" }) };
  }
  const step = input.plan?.steps.find((candidate) => candidate.id === stepid);
  if (step === void 0) return { response: respond({ error: rpcerrorof("consentrefused", "The approved gate names no step the approved plan carries.") }) };
  const result = await input.execute(step);
  return { response: respond({ ...input.approval.params.id !== void 0 ? { id: input.approval.params.id } : {}, result: stepdetails(step, result) }), record: servecallevent({ client: input.client, tool: tool.name, origin: input.origin, ok: !result.iserror, now: input.now }) };
}
async function runcallsbatch(input) {
  const batchid = `batch-${input.now}-${randomid().slice(0, 6)}`;
  const batch = { id: batchid, clientid: input.client.id, calls: input.calls.map((call) => ({ id: call.id, name: call.name, params: call.params })), stoponerror: input.stoponerror, state: "running", createdat: input.now, outcomes: [] };
  const outcome = await runbatch({ calls: input.calls, stoponerror: input.stoponerror, now: input.now, execute: input.execute });
  return { batch: { ...batch, state: outcome.stoppedat !== void 0 ? "stopped" : "done", finishedat: input.now, outcomes: outcome.outcomes }, outcomes: outcome.outcomes };
}
async function routeserveframe(input) {
  const frame = input.frame;
  const state = input.state;
  const id = frame.id;
  const params = frame.params;
  const answer = (result) => ({ response: respond({ ...id !== void 0 ? { id } : {}, result }), state });
  const fail = (error) => ({ response: respond({ ...id !== void 0 ? { id } : {}, error }), state });
  if (frame.method === void 0) return fail(rpcerrorof("method", "The serve frame carries no method to route."));
  const entry = servemethods().find((candidate) => candidate.method === frame.method);
  if (entry === void 0) return fail(rpcerrorof("method", `The serve mode routes no method named ${frame.method}.`));
  if (entry.handler === "initialize") {
    const handshake = serveinitialize({ ...params !== void 0 ? { params } : {}, config: state.config, catalog: state.catalog, templates: state.templates });
    return { response: respond({ ...id !== void 0 ? { id } : {}, result: { serverinfo: handshake.handshake.serverinfo, protocolversion: handshake.handshake.protocolversion, servercontractversion: handshake.handshake.servercontractversion, instructions: handshake.handshake.instructions } }), state: { ...state, client: handshake.client(state.client) } };
  }
  if (entry.handler === "ping") return answer(ping({ now: input.now }));
  if (entry.handler === "health") return answer(healthof({ startedat: state.startedat, now: input.now, state: "running" }));
  if (entry.handler === "listtools") {
    const binding = state.bindings.find((candidate) => candidate.clientid === state.client.id && candidate.releasedat === void 0);
    const degraded = binding?.readonly === true;
    const scopes = state.client.capabilities?.namespaces;
    const exposed = exposedtools(state.catalog, { ...degraded ? { readonly: true } : {}, ...scopes !== void 0 ? { scopes } : {} });
    return answer(listtools(exposed));
  }
  if (entry.handler === "negotiate") {
    const server = servercapabilities({ config: state.config, catalog: state.catalog });
    const clientcaps = params?.capabilities && typeof params.capabilities === "object" && !Array.isArray(params.capabilities) ? params.capabilities : void 0;
    const outcome2 = negotiate({ ...clientcaps !== void 0 ? { client: clientcaps } : {}, server });
    return outcome2.agreed ? answer(outcome2.capabilities) : fail(rpcerrorof("params", outcome2.mismatch ?? "The capability negotiation did not agree."));
  }
  if (entry.handler === "listresources") {
    const gate = resourceexposuregate({ client: state.client, uri: "devthink://health", served: servedresources().map((resource) => resource.uri) });
    if (!gate.allowed) return fail(rpcerrorof("consentrefused", gate.reason ?? "The resource exposure was refused."));
    return answer(resourceslist());
  }
  if (entry.handler === "readresource") {
    const uri = typeof params?.uri === "string" ? params.uri : "";
    const gate = resourceexposuregate({ client: state.client, uri, served: servedresources().map((resource) => resource.uri) });
    if (!gate.allowed) return fail(rpcerrorof("consentrefused", gate.reason ?? "The resource exposure was refused."));
    const read = readresource({ uri, ...state.pagestate !== void 0 ? { pagestate: state.pagestate } : {}, ...state.plan !== void 0 ? { plan: state.plan } : {}, ...state.audit !== void 0 ? { audit: state.audit } : {}, ...state.session !== void 0 ? { session: state.session } : {}, health: healthof({ startedat: state.startedat, now: input.now, state: "running" }) });
    if (read.resource === void 0 || read.text === void 0) return fail(rpcerrorof("params", read.reason ?? "The resource read failed."));
    return answer({ uri: read.resource.uri, mimetype: read.resource.mimetype, text: read.text });
  }
  if (entry.handler === "subscriberesource") {
    const uri = typeof params?.uri === "string" ? params.uri : "";
    const gate = resourceexposuregate({ client: state.client, uri, served: servedresources().map((resource) => resource.uri) });
    if (!gate.allowed) return fail(rpcerrorof("consentrefused", gate.reason ?? "The resource exposure was refused."));
    const subscribed = subscriberesource({ clientid: state.client.id, uri, ...state.pagestate !== void 0 && uri === "devthink://pagestate" ? { state: state.pagestate } : {}, now: input.now });
    if (subscribed.watch === void 0) return fail(rpcerrorof("params", subscribed.reason ?? "The resource subscription did not open."));
    return { response: respond({ ...id !== void 0 ? { id } : {}, result: { watchid: subscribed.watch.id, uri } }), state: { ...state, watches: [subscribed.watch, ...state.watches] } };
  }
  if (entry.handler === "unsubscriberesource") {
    const watchid = typeof params?.watchid === "string" ? params.watchid : "";
    if (watchid === "") return fail(rpcerrorof("params", "The unsubscribe needs the watcher id."));
    return { response: respond({ ...id !== void 0 ? { id } : {}, result: { watchid, canceled: true } }), state: { ...state, watches: state.watches.map((watch) => watch.id === watchid && watch.canceledat === void 0 ? { ...watch, canceledat: input.now } : watch) } };
  }
  if (entry.handler === "listprompts") {
    const gate = promptexposuregate(state.client);
    if (!gate.allowed) return fail(rpcerrorof("consentrefused", gate.reason ?? "The prompt exposure was refused."));
    return answer({ prompts: listmcpprompts(state.templates) });
  }
  if (entry.handler === "callprompt") {
    const gate = promptexposuregate(state.client);
    if (!gate.allowed) return fail(rpcerrorof("consentrefused", gate.reason ?? "The prompt exposure was refused."));
    const name = typeof params?.name === "string" ? params.name : "";
    const args = params?.arguments && typeof params.arguments === "object" && !Array.isArray(params.arguments) ? params.arguments : void 0;
    const rendered = rendermcpprompt({ name, ...args !== void 0 ? { args } : {}, templates: state.templates });
    if (rendered.rendered === void 0 || rendered.prompt === void 0) return fail(rpcerrorof("params", rendered.reason ?? "The prompt call did not render."));
    return answer({ prompt: rendered.prompt.name, rendered: rendered.rendered, arguments: rendered.prompt.arguments });
  }
  if (entry.handler === "cancel") {
    const callid = typeof params?.callid === "string" ? params.callid : "";
    if (callid.trim() === "") return fail(rpcerrorof("params", "The cancellation frame needs the call id it aborts."));
    const aborted = canceltool({ contexts: state.contexts, callid, ...typeof params?.reason === "string" ? { reason: params.reason } : {}, now: input.now });
    if (aborted.context === void 0) return fail(rpcerrorof("params", aborted.reason ?? "The cancellation frame named no in flight tool call."));
    return { response: respond({ ...id !== void 0 ? { id } : {}, result: { cancelled: true, callid, ...aborted.context.partial !== void 0 ? { partial: aborted.context.partial } : {} } }), state: { ...state, contexts: aborted.contexts } };
  }
  if (entry.handler === "batch") {
    const rawcalls = params !== void 0 && Array.isArray(params.calls) ? params.calls : [];
    const calls = rawcalls.filter((call) => call !== null && typeof call === "object" && typeof call.name === "string").map((call, index) => ({ id: typeof call.id === "string" ? call.id : `member-${index + 1}`, name: call.name, params: call.params !== void 0 && typeof call.params === "object" && !Array.isArray(call.params) ? call.params : {} }));
    if (calls.length === 0) return fail(rpcerrorof("params", "The batch call needs its ordered tool calls."));
    const run = await runcallsbatch({ calls, client: state.client, now: input.now, stoponerror: params?.stoponerror !== false, execute: async (call) => {
      const outcome2 = await dispatchcall({ params: { ...call.params, name: call.name }, ...id !== void 0 ? { id } : {}, client: state.client, catalog: state.catalog, ...state.session !== void 0 ? { session: state.session } : {}, ...state.plan !== void 0 ? { plan: state.plan } : {}, origin: state.origin, now: input.now, ...state.mocks.length > 0 ? { mocks: state.mocks } : {}, ...state.idempotency.length > 0 ? { idempotency: state.idempotency } : {}, ...state.limits.length > 0 ? { limits: state.limits } : {}, ...state.allowlist.length > 0 ? { allowlist: state.allowlist } : {}, approvals: state.approvals, contexts: state.contexts, execute: input.execute });
      if (outcome2.response?.error !== void 0) return { ok: false, error: { code: outcome2.response.error.code, message: outcome2.response.error.message, retryhint: "none" } };
      const result = outcome2.response?.result;
      return result !== void 0 ? { ok: !result.iserror, result } : { ok: false, error: { code: "internal", message: "The batch member produced no result.", retryhint: "none" } };
    } });
    return answer({ batchid: run.batch.id, state: run.batch.state, outcomes: run.outcomes });
  }
  const outcome = await dispatchcall({ ...params !== void 0 ? { params } : {}, ...id !== void 0 ? { id } : {}, client: state.client, catalog: state.catalog, ...state.session !== void 0 ? { session: state.session } : {}, ...state.plan !== void 0 ? { plan: state.plan } : {}, origin: state.origin, now: input.now, ...state.bindings.find((binding) => binding.clientid === state.client.id && binding.releasedat === void 0)?.readonly === true ? { readonly: true } : {}, ...state.mocks.length > 0 ? { mocks: state.mocks } : {}, ...state.idempotency.length > 0 ? { idempotency: state.idempotency } : {}, ...state.limits.length > 0 ? { limits: state.limits } : {}, ...state.allowlist.length > 0 ? { allowlist: state.allowlist } : {}, approvals: state.approvals, ...state.config.remoteaccess?.approvaltimeout?.windowms !== void 0 ? { approvaltimeout: state.config.remoteaccess.approvaltimeout.windowms } : {}, contexts: state.contexts, execute: input.execute });
  return { ...outcome.response !== void 0 ? { response: outcome.response } : {}, state: { ...state, ...outcome.approvals !== void 0 ? { approvals: outcome.approvals } : {}, ...outcome.contexts !== void 0 ? { contexts: outcome.contexts } : {}, ...outcome.records !== void 0 ? { idempotency: outcome.records } : {} } };
}
function publishresourcechange(input) {
  const published = publishchange({ watches: input.state.watches, uri: input.uri, state: input.changed, now: input.now });
  return { notifications: published.deliveries.map((delivery) => delivery.frame), state: { ...input.state, watches: published.watches } };
}
function createservesession(input) {
  return { config: input.config, catalog: input.catalog ?? buildtoolcatalog(), templates: input.templates ?? [], client: input.client, ...input.session !== void 0 ? { session: input.session } : {}, ...input.plan !== void 0 ? { plan: input.plan } : {}, origin: input.origin, bindings: [], approvals: [], watches: [], contexts: [], idempotency: [], limits: [], mocks: [], allowlist: [], startedat: input.now };
}
function healthresourceof() {
  return resourceof("devthink://health");
}
var localhostbind = "127.0.0.1";
var defaultmcpport = 7436;
var rpcerrornumbers = { parse: -32700, method: -32601, params: -32602, internal: -32603, consentrefused: -32001 };
function rpcerrorof(code, message, data) {
  return { code, message, ...data !== void 0 ? { data } : {} };
}
function rpcerrorcodeof(number) {
  const entry = Object.entries(rpcerrornumbers).find(([, value]) => value === number);
  return entry?.[0];
}
function defaultmcpconfig() {
  return { port: defaultmcpport, transports: ["stdio", "http"], enabled: false };
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
function parsewire(raw) {
  return raw.split("\n").map((line) => line.trim()).filter((line) => line.length > 0).map((line) => parseframe(line));
}
function serializeframe(frame) {
  return JSON.stringify(frame);
}
function wireformat(frame, format) {
  return format === "newline" ? `${serializeframe(frame)}
` : JSON.stringify({ transport: "http", frame });
}
function validateframe(frame, methods, config) {
  if (frame.jsonrpc !== "2.0") return rpcerrorof("parse", "The frame must carry the jsonrpc 2.0 tag.");
  if (frame.id !== void 0 && typeof frame.id !== "number" && typeof frame.id !== "string" && frame.id !== null) return rpcerrorof("parse", "The frame id must be a number, a string or null.");
  if (frame.method === void 0 || frame.method.trim() === "") return rpcerrorof("method", "The frame carries no method to route.");
  if (!methods.some((entry) => entry.method === frame.method)) return rpcerrorof("method", `The server routes no method named ${frame.method}.`);
  if (frame.params !== void 0 && (typeof frame.params !== "object" || Array.isArray(frame.params))) return rpcerrorof("params", "The frame params must be an object.");
  if (config?.framesize !== void 0 && serializeframe(frame).length > config.framesize) return rpcerrorof("params", `The serialized frame exceeds the user configured frame size of ${config.framesize} characters.`);
  return void 0;
}
function respond(input) {
  return { jsonrpc: "2.0", ...input.id === void 0 ? input.error !== void 0 ? { id: null } : {} : { id: input.id }, ...input.error !== void 0 ? { error: input.error } : { result: input.result } };
}
function servermethods() {
  return [
    { method: "initialize", handler: "initialize", description: "Completes the mcp handshake and returns the server info." },
    { method: "ping", handler: "ping", description: "Answers keepalive frames with pong." },
    { method: "tools/list", handler: "listtools", description: "Returns every tool with its version and json schema inputs." },
    { method: "negotiate", handler: "negotiate", description: "Exchanges capability sets with the client." },
    { method: "tools/call", handler: "dispatch", description: "Invokes one tool behind the consent gates." },
    { method: "prompts/list", handler: "listprompts", description: "Lists the prompt defs the server exposes as callable tools." },
    { method: "prompts/call", handler: "callprompt", description: "Renders one prompt and returns its arguments as a tool call." },
    { method: "calls/cancel", handler: "cancel", description: "Aborts one in flight tool call and preserves its partial result." }
  ];
}
function servercapabilities(input) {
  return { protocolversion, name: "devthink", version: protocolversion, toolversion: input.catalog.version, tools: alltools(input.catalog).length, namespaces: toolnamespaces, transports: input.config.transports };
}
function initialize(input) {
  void input.params;
  return { serverinfo: servercapabilities({ config: input.config, catalog: input.catalog }), protocolversion, protocolmajor: protocolmajorversion, instructions: "Devthink serves browser tools behind the human review gates: read only tools run once a session is approved while every tool with side effects executes exactly the approved plan step it names. No endpoint, provider or key is hardcoded; the user pairs every client." };
}
function ping(input) {
  return { pong: true, at: input.now };
}
function listtools(catalog) {
  return { tools: alltools(catalog).map((tool) => ({ name: tool.name, version: tool.version, description: tool.description, inputschema: tool.inputschema, risk: tool.risk, ...tool.consentmeta !== void 0 ? { consentmeta: { review: tool.consentmeta.review, riskclass: tool.consentmeta.riskclass ?? tool.risk, approvalrequired: tool.consentmeta.approvalrequired ?? true, originscope: tool.consentmeta.originscope ?? "session" } } : {} })) };
}
function unknownframefields(frame) {
  return Object.keys(frame).filter((key) => key !== "jsonrpc" && key !== "id" && key !== "method" && key !== "params" && key !== "result" && key !== "error");
}
function clientprotocolmajor(client) {
  return protocolmajorof(client.capabilities?.protocolmajor) ?? protocolmajorversion;
}
function negotiate(input) {
  const client = input.client;
  const negotiation = negotiateprotocol({ ...client?.protocolmajor !== void 0 ? { client: client.protocolmajor } : {} });
  if (!negotiation.agreed) return { agreed: false, ...negotiation.reason !== void 0 ? { mismatch: negotiation.reason } : {} };
  if (client?.toolversion !== void 0 && client.toolversion > input.server.toolversion) return { agreed: false, mismatch: `The client requires tool version ${String(client.toolversion)} while the server offers ${String(input.server.toolversion)}.` };
  if (client?.transports !== void 0 && client.transports.some((transport) => !input.server.transports.includes(transport))) return { agreed: false, mismatch: "The client requires a transport the server configuration does not allow." };
  return { agreed: true, capabilities: input.server, ...negotiation.major !== void 0 ? { protocolmajor: negotiation.major } : {}, ...negotiation.deprecation !== void 0 ? { deprecation: negotiation.deprecation } : {} };
}
function connectclient(input) {
  return { id: input.id ?? `client-${input.now}`, transport: input.transport, paired: false, connectedat: input.now };
}
function pairclient(clients, id, approved, now) {
  return clients.map((client) => client.id !== id || client.disconnectedat !== void 0 ? client : approved ? { ...client, paired: true, pairedat: now } : { ...client, paired: false, disconnectedat: now });
}
function disconnectclient(clients, id, now) {
  return clients.map((client) => client.id === id && client.disconnectedat === void 0 ? { ...client, disconnectedat: now } : client);
}
function enqueuerequest(input) {
  if (input.depth !== void 0 && input.queue.length + 1 > input.depth) return void 0;
  return [...input.queue, input.frame];
}
function nextrequest(queue) {
  return queue.length === 0 ? void 0 : { frame: queue[0], remaining: queue.slice(1) };
}
function negotiatetoolfloor(clientfloor, catalogversion) {
  if (clientfloor === void 0) return { floor: catalogversion };
  if (clientfloor > catalogversion) return { mismatch: `The client requires the tool version floor ${clientfloor} while the catalog serves version ${catalogversion}.` };
  return { floor: clientfloor };
}
async function dispatchtool(input) {
  const params = input.params;
  if (!params || typeof params !== "object" || Array.isArray(params)) return { error: rpcerrorof("params", "The tool call needs its params object.") };
  if (typeof params.name !== "string" || !params.name.trim()) return { error: rpcerrorof("params", "The tool call needs the namespaced name of the tool it invokes.") };
  const tool = resolvetool(input.catalog, params.name.trim());
  if (tool === void 0) return { error: rpcerrorof("params", `The catalog holds no unambiguous tool named ${params.name.trim()}.`) };
  const namespace = namespaceof(tool.name);
  if (namespace === void 0) return { error: rpcerrorof("params", `The tool ${tool.name} carries no reviewed namespace.`) };
  if (input.scopes !== void 0 && !input.scopes.includes(namespace)) return { error: rpcerrorof("consentrefused", `The session token grants no ${namespace} tools.`) };
  const floor = input.client.toolfloor ?? input.client.capabilities?.toolversion ?? input.catalog.version;
  if (tool.version < floor) return { error: rpcerrorof("params", `The tool ${tool.name} of version ${tool.version} stays below the negotiated compatibility floor of ${floor}.`) };
  const stepid = typeof params.stepid === "string" ? params.stepid : void 0;
  const gate = tooldispatchgate({ client: input.client, tool, session: input.session, plan: input.plan, origin: input.origin, ...stepid !== void 0 ? { stepid } : {}, now: input.now });
  if (!gate.allowed) return { error: rpcerrorof("consentrefused", gate.reason ?? "The consent gates refused the tool call.") };
  const step = tool.risk === "read" ? { id: `mcp-${input.client.id}-${input.now}`, kind: tool.kind, summary: tool.description.split(".")[0] ?? tool.description, risk: "read", ...typeof params.target === "string" ? { target: params.target } : {}, ...typeof params.value === "string" ? { value: params.value } : {}, ...params.options !== void 0 && typeof params.options === "object" && !Array.isArray(params.options) ? { options: JSON.stringify(params.options) } : {} } : input.plan?.steps.find((candidate) => candidate.id === stepid);
  if (step === void 0) return { error: rpcerrorof("consentrefused", "The tool call names a step the approved plan does not carry.") };
  try {
    const result = await input.execute(step);
    return { result, step };
  } catch (error) {
    return { error: rpcerrorof("internal", error instanceof Error ? error.message : String(error)) };
  }
}
async function handleframe(input) {
  if (input.raw !== void 0 && input.config.framesize !== void 0 && input.raw.length > input.config.framesize) return respond({ id: null, error: rpcerrorof("params", `The wire frame exceeds the user configured frame size of ${input.config.framesize} characters.`) });
  let frame;
  if (input.raw !== void 0) {
    try {
      frame = parseframe(input.raw);
    } catch {
      return respond({ id: null, error: rpcerrorof("parse", "The wire frame does not parse as json.") });
    }
  } else if (input.frame !== void 0) {
    frame = input.frame;
  } else {
    return respond({ id: null, error: rpcerrorof("parse", "The server received no frame to route.") });
  }
  const invalid = validateframe(frame, servermethods(), input.config);
  if (invalid !== void 0) return respond({ ...frame.id !== void 0 ? { id: frame.id } : {}, error: invalid });
  const unknown = unknownframefields(frame);
  if (unknown.length > 0) {
    const strictness = unknownfieldsgate({ unknown, major: clientprotocolmajor(input.client) });
    if (!strictness.allowed) return respond({ ...frame.id !== void 0 ? { id: frame.id } : {}, error: rpcerrorof("params", strictness.reason ?? "The frame carries unknown fields the frozen schema declares nowhere.") });
  }
  const entry = servermethods().find((candidate) => candidate.method === frame.method);
  if (entry === void 0) return respond({ ...frame.id !== void 0 ? { id: frame.id } : {}, error: rpcerrorof("method", `The server routes no method named ${String(frame.method)}.`) });
  const params = frame.params;
  if (entry.handler === "initialize") return respond({ ...frame.id !== void 0 ? { id: frame.id } : {}, result: initialize({ ...params !== void 0 ? { params } : {}, config: input.config, catalog: input.catalog }) });
  if (entry.handler === "ping") return respond({ ...frame.id !== void 0 ? { id: frame.id } : {}, result: ping({ now: input.now }) });
  if (entry.handler === "listtools") return respond({ ...frame.id !== void 0 ? { id: frame.id } : {}, result: listtools(input.catalog) });
  if (entry.handler === "negotiate") {
    const server = servercapabilities({ config: input.config, catalog: input.catalog });
    const clientcaps = params?.capabilities && typeof params.capabilities === "object" && !Array.isArray(params.capabilities) ? params.capabilities : void 0;
    const outcome = negotiate({ ...clientcaps !== void 0 ? { client: clientcaps } : {}, server });
    return respond({ ...frame.id !== void 0 ? { id: frame.id } : {}, ...outcome.agreed ? { result: outcome.capabilities } : { error: rpcerrorof("params", outcome.mismatch ?? "The capability negotiation did not agree.") } });
  }
  if (entry.handler === "listprompts") return respond({ ...frame.id !== void 0 ? { id: frame.id } : {}, result: { prompts: listprompts() } });
  if (entry.handler === "callprompt") {
    const name = typeof params?.name === "string" ? params.name : "";
    const args = params?.arguments && typeof params.arguments === "object" && !Array.isArray(params.arguments) ? params.arguments : void 0;
    const called = name === "" ? { reason: "The prompt call needs the prompt name." } : callprompt({ name, ...args !== void 0 ? { args } : {} });
    if (called.toolcall === void 0) return respond({ ...frame.id !== void 0 ? { id: frame.id } : {}, error: rpcerrorof("params", called.reason ?? "The prompt call did not render.") });
    return respond({ ...frame.id !== void 0 ? { id: frame.id } : {}, result: { toolcall: called.toolcall, rendered: called.rendered } });
  }
  if (entry.handler === "cancel") {
    const callid = typeof params?.callid === "string" ? params.callid : "";
    const reason = typeof params?.reason === "string" ? params.reason : void 0;
    if (callid.trim() === "") return respond({ ...frame.id !== void 0 ? { id: frame.id } : {}, error: rpcerrorof("params", "The cancellation frame needs the call id it aborts.") });
    const aborted = canceltool({ contexts: input.contexts ?? [], callid, ...reason !== void 0 ? { reason } : {}, now: input.now });
    if (aborted.context === void 0) return respond({ ...frame.id !== void 0 ? { id: frame.id } : {}, error: rpcerrorof("params", aborted.reason ?? "The cancellation frame named no in flight tool call.") });
    return respond({ ...frame.id !== void 0 ? { id: frame.id } : {}, result: { cancelled: true, callid, ...reason !== void 0 ? { reason } : {}, ...aborted.context.partial !== void 0 ? { partial: aborted.context.partial } : {} } });
  }
  const dispatched = await dispatchtool({ ...params !== void 0 ? { params } : {}, client: input.client, catalog: input.catalog, ...input.session !== void 0 ? { session: input.session } : {}, ...input.plan !== void 0 ? { plan: input.plan } : {}, ...input.scopes !== void 0 ? { scopes: input.scopes } : {}, origin: input.origin, now: input.now, execute: input.execute });
  return respond({ ...frame.id !== void 0 ? { id: frame.id } : {}, ...dispatched.error !== void 0 ? { error: dispatched.error } : { result: dispatched.result } });
}
function bindlocalhost(config) {
  const bind = config.bind !== void 0 && config.bind.trim() !== "" ? config.bind.trim() : localhostbind;
  return { bind, port: config.port, localhost: bind === localhostbind || bind === "localhost" || bind === "::1" };
}
function launchbridge(input) {
  if (input.signature !== void 0 && input.verifier !== void 0 && !input.verifier(input.host, input.signature)) throw new Error(`The client signature of the ${input.host} bridge failed the platform verification; the local stdio bridge refuses the client and no frame relays.`);
  return { id: input.id ?? `bridge-${input.now}`, host: input.host, connected: true, ...input.pid !== void 0 ? { pid: input.pid } : {}, startedat: input.now, restarts: 0, received: 0, sent: 0, ...input.signature !== void 0 && input.verifier !== void 0 ? { clientverified: input.verifier(input.host, input.signature) } : {} };
}
function relayframe(input) {
  return { ...input.bridge, connected: true, received: input.bridge.received + (input.direction === "inbound" ? 1 : 0), sent: input.bridge.sent + (input.direction === "outbound" ? 1 : 0), lastframeat: input.now };
}
function restartbridge(input) {
  return { ...input.bridge, connected: true, pid: input.pid, restarts: input.bridge.restarts + 1, startedat: input.now };
}
function framedlog(event, at, fields) {
  return JSON.stringify({ at, event, ...fields ?? {} });
}
function toolcallevent(input) {
  return { id: input.id, clientid: input.clientid, tool: input.tool, origin: input.origin, ok: input.ok, ...input.code !== void 0 ? { code: input.code } : {}, at: input.now, ...input.callid !== void 0 ? { callid: input.callid } : {}, ...input.idempotencykey !== void 0 && input.idempotencykey.trim() !== "" ? { idempotencykey: input.idempotencykey } : {}, ...input.dryrun === true ? { dryrun: true } : {}, ...input.mocked === true ? { mocked: true } : {}, ...input.batchid !== void 0 ? { batchid: input.batchid } : {}, ...input.replayed === true ? { replayed: true } : {} };
}
export {
  acquirelock,
  actionkindcatalog,
  actionrisk,
  adaptermappinggate,
  adaptivepollvalid,
  agentbudgetcheck,
  agentbudgetof,
  agentbudgetvalid,
  agenteventof,
  agentheartbeat,
  agentname,
  agentnamevalid,
  agentruncontext,
  agentscopegate,
  agentscopeof,
  agentscopevalid,
  aggregateconflictescalationgate,
  aggregatemergegrade,
  aggregatereport,
  allowlistentryvalid,
  alltools,
  answersampling,
  apicallgrade,
  apikeyconsentgranted,
  applymock,
  applyratelimit,
  approvalprompt,
  approvaltimeoutvalid,
  arbitrationcaseof,
  arbitrationverdictgate,
  assemblechunks,
  assignrole,
  attachnativehost,
  auditexportgate,
  auditline,
  authconsentgranted,
  authorizeurl,
  authrefusedmessage,
  automationallowlistgate,
  backgroundrungate,
  batchgrade,
  batchof,
  batchqueryplangate,
  batchrisk,
  batchsizelimitgate,
  batchwindowvalid,
  beforeafterwrapallowed,
  begincall,
  bindclientsession,
  bindlocalhost,
  blackboardconsentgrade,
  blockgate,
  breakpointbudgetallowed,
  breakpointceilingof,
  bridgechoices,
  bridgeconsentgate,
  bridgecontentgate,
  bridgeframeorigingate,
  bridgeframerate,
  bridgeheartbeatvalid,
  bridgeidlewindowvalid,
  bridgekillswitchgate,
  bridgemembergate,
  bridgepairingscopes,
  bridgepairingwindowvalid,
  bridgepayload,
  bridgeratecapvalid,
  bridgestatuslabel,
  bridgestatusview,
  broadcastrecipient,
  budgetgate,
  budgetremaining,
  budgetthresholdsvalid,
  buildtoolcatalog,
  cachegate,
  callauditcomplete,
  callgraphql,
  callprompt,
  callratelimitvalid,
  callrest,
  callretryhintof,
  cancelframeof,
  cancelrungate,
  canceltool,
  canexecute,
  canpreview,
  capabilitydowngradegate,
  capmanifestdriftgate,
  capturecode,
  captureexportgate,
  captureexportgranted,
  capturegate,
  captureretentiongrade,
  captureretentionwindow,
  carddecision,
  channellive,
  chateventof,
  chateventpayload,
  chatrowsof,
  checkallowlist,
  checkidempotency,
  checkpointgate,
  childscopeof,
  chunkcontent,
  chunkextractgate,
  chunkframes,
  chunkof,
  cleanupgate,
  clientmetadataof,
  clientprotocolmajor,
  clipboardconsentgranted,
  clipboardgate,
  closeidlechannels,
  companionhandshakeframe,
  compareoutputs,
  composeenvelope,
  confirmcredsgate,
  confirmdeletegate,
  confirmpaygate,
  conflictresolutiongrade,
  connectallowgate,
  connectclient,
  connectrelay,
  consensusquorumvalid,
  consensusrecordof,
  consentdurationvalid,
  consentmemoryadvisorygate,
  consentmetagrade,
  consentwindowgate,
  consoleconsentcovers,
  consolemaskgate,
  contractcapabilities,
  controltarget,
  cookiegate,
  correlationmappinggate,
  costbudgetvalid,
  costentryof,
  costsharegate,
  crashnativehost,
  createlinepump,
  createservesession,
  credentialheadername,
  credspayload,
  criticreviewgrade,
  cssselectorvalid,
  debouncewindowvalid,
  debuggate,
  debuggerconsentcovers,
  debugwaitbudgetallowed,
  decisionpayload,
  decodemessage,
  dedupeconfiggate,
  deeplinkgate,
  defaultapprovalwindowms,
  defaultchallengelifetimems,
  defaultheartbeatms,
  defaulthttpstream,
  defaultidempotencywindowms,
  defaultidlewindowms,
  defaultmcpconfig,
  defaultmcpport,
  defaultpairinglifetimems,
  defaulttokenlifetimems,
  degradationgate,
  deletepayload,
  depthgate,
  depthlimitof,
  depthoflineage,
  detachnativehost,
  diffbasegate,
  diffpreviewgate,
  diffreviewgrade,
  diffthresholdgrade,
  disarmkillswitch,
  disconnectclient,
  disconnectrelay,
  dispatchcall,
  dispatchtool,
  documentedbind,
  domainkinds,
  domainlimitsvalid,
  downloadgranted,
  dryrunprojection,
  dryrunpurity,
  dryruntool,
  editorsavegate,
  egressconsentgate,
  emugate,
  emulationretentionwindow,
  emulationstackallowed,
  encodemessage,
  encryptionsecretgate,
  encryptmemorygate,
  encryptsyncgate,
  endcall,
  enforcemaxclients,
  engagekillswitch,
  enqueuebridge,
  enqueuerequest,
  envelopeacceptance,
  environmentgrantgate,
  environmentrequirements,
  errorresponse,
  errorwithretry,
  escalateholdgate,
  escalationblock,
  escalationgate,
  eventpostbody,
  eventstreambody,
  exchangebridgepairing,
  expireapprovals,
  expireidempotency,
  expirelocks,
  expiretokens,
  expirygate,
  exportallgate,
  exportchaingate,
  exportcontentreview,
  exportgranted,
  exportmaskgate,
  exportprovenancegate,
  exposedtools,
  fetchbudgetallowed,
  fetchconsentcovers,
  fetchconsentrefgranted,
  fetchoptionsof,
  fetchrequestof,
  fixtureconsentgate,
  fleetoperationgrade,
  fleetoverview,
  flowrungrantgate,
  forensicchoices,
  forensicscopegate,
  forensicsreadonlygate,
  formpayloadof,
  frameauth,
  framebudgetgate,
  framedlog,
  frameof,
  framesof,
  gatebatchgate,
  gateforstep,
  gatekindfor,
  gateprompttext,
  gatestateof,
  gatewaybaseurlgate,
  gatewaycachewindowvalid2 as gatewaycachewindowvalid,
  gatewayconsentgate,
  gatewaykeyconsentgate,
  gatewayprefixgate,
  gatewayretrycapvalid,
  generatedvalueallowed,
  grantallowlistentry,
  graphqlopenvelope,
  graphqlrequestof,
  gridexportconfirmgate,
  groundgate,
  guardverdictgate,
  handleframe,
  handoffgrantgate,
  headlessconsentgate,
  headlesstelemetrygate,
  healthof,
  healthresourceof,
  heartbeat,
  heartbeatevent,
  heartbeattick,
  heartbeatwindowvalid,
  hostmanifestdestination,
  hostpattern,
  htmlqueriesof,
  httpanswer,
  httpendpoint,
  httpframepipeline,
  httpkinds,
  idleexpired,
  importexportgate,
  incrsnapshotgate,
  initialize,
  installnativehost,
  interleave,
  interleavereadonlygate,
  interleavetimeline,
  iscapturekind,
  iscdpkind,
  iscontrolkind,
  isdatasetkind,
  isdebugkind,
  isemulationkind,
  isexportkind,
  isfileskind,
  isformkind,
  ishttpkind,
  islayoutkind,
  ismediakind,
  isnetwatchkind,
  isnotification,
  isolatedsessions,
  isprofilekind,
  isrecordingkind,
  issessionkind,
  issocketkind,
  issuechallenge,
  issuepairingcode,
  issuetoken,
  istabscommandkind,
  istriggeraction,
  iswatchkind,
  isworkflowkind,
  jargate,
  jsonpathrulesof,
  keepalivegate,
  keepaliveintervalvalid,
  killall,
  killswitchgate,
  kindoptionfields,
  lanechangegate,
  lapsebudgetallowed,
  launchbridge,
  layoutmutationgranted,
  lazybudgetvalid,
  lazyloadgate,
  leaderelectionvalid,
  lessondecay,
  lessonmatches,
  lessonrecordof,
  lessonreuse,
  lessonsanitizestep,
  lessonsecretgate,
  librarycapabilitygate,
  librarygrantgate,
  libraryimportgate,
  librarymanifestgate,
  libraryquarantinegate,
  librarysensitivegate,
  listapprovals,
  listmcpprompts,
  listprompts,
  listremotestatus,
  listtools,
  livetokensof,
  loadreportof,
  localgate,
  localhostbind,
  localsensitivegrade,
  locationconsentgate,
  lockkey,
  lockscopevalid,
  lockwindowvalid,
  logbufferboundvalid,
  logprunegate,
  logreadgate,
  logstreamegressgate,
  mailboxof,
  maptoolerror,
  maskclipboard,
  mcpmodegate,
  mediagate,
  memoryreadscopegate,
  mergeegressgrade,
  mergeresults,
  messageegressgrade,
  minimalplandigest,
  minimizationchoices,
  minimizationstripgrade,
  mintbridgepairing,
  mockusagevalid,
  multipartchunks,
  multipartpayloadof,
  mutationcallof,
  namespaceof,
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
  nativeescapehatchgate,
  nativefailureof,
  nativeframecheck,
  nativeframeof,
  nativeheadlessgate,
  nativeheartbeatframe,
  nativeheartbeatintervalvalid,
  nativehostcapabilities,
  nativehostidplaceholder,
  nativehostinstallerversion,
  nativehostmanifesttemplate,
  nativeidlewindowvalid,
  nativeinstallconsentgate,
  nativekillswitchgate,
  nativemajorversion,
  nativemessagingdirname,
  nativeportliveness,
  nativeprotocolcompatible,
  nativeratecapvalid,
  nativeratecheck,
  nativesecretexclusion,
  nativesecretkeys,
  nativesensitiveapprovalgate,
  nativesurfacecatalog,
  nativesurfacegrant,
  nativesurfaceresult,
  nativetransportconsentgate,
  nativetransportenabled,
  navigationgranted,
  navigationobservationgrade,
  navratelimitgate,
  needstarget,
  negotiate,
  negotiatecapabilities,
  negotiatenativecapabilities,
  negotiatetoolfloor,
  nettraceorigingate,
  newrelayclient,
  newrelayserverstate,
  nextrequest,
  nobatchresolution,
  normalizeendpoint,
  notelemetryinvariant,
  notificationcontentgate,
  notificationframe,
  notifyevent,
  notifyprogress,
  notifyresource,
  oauthflowof,
  observationmodeof,
  observedorigingranted,
  ocrgate,
  offlinegate,
  offscreencapabilitygate,
  omniboxtaskgate,
  onboardingconsentgate,
  openapilayout,
  opengate,
  openstreamchannel,
  opentabagent,
  origincheck,
  origincheckgate,
  origingranted,
  originprofilegate,
  originverified,
  outboundtarget,
  outputcompare,
  outputcomparegate,
  outputcomparereadonlygate,
  pagecontentkeys,
  pairclient,
  pairgate,
  pairingcountdown,
  pairingpanel,
  pairingreadinessgate,
  paletteactiongate,
  parsecompanionhandshake,
  parseenvelope,
  parseframe,
  parsehtmlbody,
  parseoptions,
  parsepost,
  parsetokens,
  parsewire,
  parsewireframe,
  passwordconsentgranted,
  pauseagent,
  pauseagentgate,
  pausenavconsentgate,
  pauseone,
  pauseretentionwindow,
  payloadvalid,
  payloadwithdefaults,
  paypayload,
  perfprovenancegate,
  permissionnamevalid,
  permissionstatevalid,
  phishguardgate,
  phishthresholdgate,
  pickeroverlaygate,
  ping,
  pipelinetargetgate,
  planallowlist,
  plandraftreviewgate,
  planlint,
  planprogressevent,
  planproposaleventof,
  planproposaleventpayload,
  planrevieweventpayload,
  planreviewgate,
  platformmatrixgate,
  politedelayvalid,
  pollchoices,
  pollwaitbudgetgate,
  portablecapabilitygate,
  portablerulefamilies,
  portablerulesetgate,
  portablerulesetof,
  postauth,
  postevent,
  postgate,
  preconnectgate,
  prefetchgate,
  preparehandoff,
  prioritylaneof,
  profilegrantgranted,
  profileretentionwindow,
  progresseventpayload,
  progressframe,
  progressof,
  promptexposuregate,
  promptsof,
  protocoleventkinds,
  protocolnegotiationgate,
  provgate,
  provideregressgrade,
  providervalid,
  provlogappendonlygate,
  proxygate,
  publishchange,
  publishresourcechange,
  purgegate,
  quarantineopengate,
  quarantinereleasegranted,
  queuedepthvalid,
  queuedtaskexpirygate,
  queuelanesvalid,
  quickactiongate,
  quotacleanupgate,
  ratelimitboundsvalid,
  ratelimitbudgetallowed,
  ratelimitgate,
  ratelimitrespectgate,
  readonlyactionkinds,
  readonlyeventkinds,
  readonlyscope,
  readpath,
  readresource,
  readstream,
  reattachnativehost,
  receiveframe,
  receivemessages,
  reconstructreplay,
  recordagentusage,
  recordclientmetadata,
  recordidempotency,
  recordingconsentgranted,
  recordingwindow,
  recordnativecall,
  recordverdict,
  redactgate,
  redactnativeframe,
  redactparams,
  redeempairingcode,
  regionboundsgate,
  registeragent,
  relayconnectionclose,
  relayconnectionopen,
  relayframe,
  relayframeof,
  relayidleconnections,
  relaylivetokens,
  relayorigin,
  relaypendingpairings,
  relayserverframe,
  releasebinding,
  releasecase,
  releaselock,
  remoteenablementgate,
  remotetransporttls,
  rendermcpprompt,
  renderprompt,
  reopentabgate,
  replanreviewgate,
  replayagentrun,
  replaybridgequeue,
  replaycheck,
  replayexportgate,
  requestsampling,
  requireapproval,
  requiredcapability,
  reservedagentnames,
  resolutionverdict,
  resolveapproval,
  resolvedrisk,
  resolvegate,
  resolverecipients,
  resolvetool,
  resourcechangeframe,
  resourceexposuregate,
  resourceof,
  resourceslist,
  resourceuris,
  respond,
  restartbridge,
  restoreoriginsgranted,
  restorereviewgranted,
  resultresponse,
  resumefingerprintgate,
  resumegate,
  resumegatedcall,
  resumehandoff,
  resumeone,
  retrydispatchgate,
  reviewcardsof,
  reviewedkinds,
  reviewgateoutcome,
  reviewrecordof,
  reviewrequestgate,
  revocationgate,
  revocationruleof,
  revokeallsessions,
  revokeclient,
  revokerungate,
  roleaddress,
  roledefaults,
  rollbackgate,
  rollbackorigingate,
  rotatebridgetoken,
  rotationruleof,
  routepath,
  routeserveframe,
  rowstampgate,
  rpcerrorcodeof,
  rpcerrornumbers,
  rpcerrorof,
  runbatch,
  runbudgetvalid,
  runcallsbatch,
  runreplay,
  runreplaygate,
  runreviewgranted,
  safedefaultsgate,
  safetygate,
  samplegate,
  samplingframe,
  samplinggrade,
  sandboxorigingate,
  scaleconsentgate,
  scalesuggestion,
  scanconflicts,
  scannerhookgate,
  schemaguardgate,
  scopecheck,
  scopegate,
  scratchpadscopegate,
  selcachegate,
  semanticrecallscopegate,
  sendfetch,
  sendframe,
  sendmessage,
  sensitiveclassgate,
  sensitivepipelingate,
  serializeframe,
  servecallevent,
  servedresources,
  serveinitialize,
  servemetadata,
  servemethods,
  serverbindgate,
  servercapabilities,
  servercontractversion,
  serverenablementgate,
  servereventtypes,
  servermethods,
  serveroperations,
  serverurlgate,
  sessioncreatebody,
  sessionfolderunique,
  sessionjoinbody,
  sessionlockgate,
  sessionnameunique,
  sessionrestoregate,
  sessionretentionvalid,
  sessionreusegate,
  sharedcostsplit,
  sharelesson,
  shortcutkeygate,
  shotpanelgate,
  shutdowndrain,
  sitemanifest,
  sitemanifestof,
  sitenotesreadgate,
  sitenoteswritegate,
  siteprofilegate,
  slowmofactorvalid,
  snapshotretentionwindow,
  socketgate,
  sockettarget,
  sourcemapconsentcovers,
  spamruleof,
  spawn,
  spawngate,
  spawngrade,
  spawnsubagent,
  spendbudget,
  splitlines,
  sseframe,
  stableopid,
  stackgate,
  startserve,
  starttls,
  statusclassof,
  stdiotransport,
  stepapprovegate,
  stepdetails,
  stepenvironmentvalid,
  stepprefetchgate,
  stitchbudgetallowed,
  stopone,
  streamchunkgate,
  streamchunkof,
  streamgate,
  streamnamespacegate,
  streamparsegate,
  streampathof,
  streamwindowof,
  structurederrorof,
  structuredof,
  submitreviewgranted,
  subscribegate,
  subscriberegister,
  subscriberesource,
  subscriptionboundgate,
  subscriptiongrade,
  subsetscopegate,
  summarywindowvalid,
  suspendwindowvalid,
  swarmcosts,
  swarmoverview,
  swarmreport,
  swarmstateof,
  syncbridgeoptingate,
  syncbridgescopegate,
  syncgate,
  tabisolategate,
  targetgate,
  taskinputproposalgate,
  tasktabceiling,
  templateprompt,
  templateurl,
  thumbnailsizereadonlygrade,
  timelapsegate,
  timelapseintervalgrade,
  timelinegate,
  timelinereadonlygate,
  timelineretentionwindow,
  timeoutboundvalid,
  timeoutrecordeventgate,
  tlsdecision,
  tlsstateof,
  tokenhashof,
  tokenhashprefix,
  tokenlifetimevalid,
  tokenrequest,
  tokenscopedkey,
  tokenscopevalid,
  toolcallevent,
  toolcatalogversion,
  toolconsentrequired,
  tooldispatchgate,
  toolname,
  toolnamespacegate,
  toolnamespaces,
  toolresultof,
  toolriskgrade,
  toolsbynamespace,
  toolschemaof,
  toolversionfloor,
  traceceilingof,
  trailexportgate,
  trailorigingate,
  transferhandoff,
  transformgate,
  transportcancelgate,
  transportendpoints,
  transportgate,
  triggergate,
  triggerorigins,
  uninstallnativehost,
  unknownfieldsgate,
  unknownframefields,
  unpauseagent,
  unreadcount,
  unsubscriberegister,
  untrustedrendergate,
  unwatchresource,
  unwrapgraphql,
  uploadgate,
  urlencodeform,
  urlhistorygate,
  urlhistoryscopegate,
  validatebreakpointcondition,
  validatecapturenaming,
  validatecaptureoptions,
  validatecleanuprule,
  validatedownloadspec,
  validateendpointrecord,
  validatefieldmatch,
  validateformrecord,
  validateframe,
  validatemimefilter,
  validateregexrule,
  validateregionrect,
  validatesiteoverride,
  validatestep,
  validatetabquery,
  validatetargetref,
  validatetoolcatalog,
  validatetransformrule,
  validateurlpattern,
  validatevaluegen,
  vaultsecretgate,
  verifiermethodgrade,
  verifyauth,
  verifybridgetoken,
  verifyframeauth,
  verifytoken,
  virtlistwindowvalid,
  visioncacheexpirygate,
  visionchoices,
  visionconsentgate,
  visioncostgrade,
  visiongate,
  visionsensitivegrade,
  voteweightvalid,
  waitduration,
  walkthroughprompts,
  watchdogconfigvalid,
  watchgate,
  watchresource,
  widgetview,
  windowclosegate,
  wireformat,
  workerbackpressuregate,
  workerpoolsizevalid,
  workerscalevalid,
  workflowgate,
  workstealgrade,
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
  wsbridgestreamname,
  zombiegate
};
//# sourceMappingURL=mcp.js.map
