import type {
  capabilityprobe,
  featuredowngrade,
  gatewaykind,
  platformtarget,
  portableruleset,
  runtimeadapterdeclaration,
  actionkind,
  agentbudget,
  agentidentity,
  agentrecord,
  agentmessage,
  agentplan,
  agentscope,
  agentsession,
  agentusage,
  allowlistentry,
  approvaltimeout,
  arbitrationrule,
  attachtarget,
  blackboardentry,
  callratelimit,
  captureexport,
  automationallowlistentry,
  budgetstate,
  checkpointrecord,
  classconsent,
  closedtabrecord,
  lockrecord,
  conflictwriter,
  connectallowentry,
  consentwindow,
  costbudget,
  criticreview,
  deeplinkpattern,
  depthlimit,
  draftstep,
  environmentkind,
  environmentrequirement,
  escalationrecord,
  handoffrecord,
  heartbeatrecord,
  incrsnapshotdelta,
  lazymoddescriptor,
  lockkind,
  mergerule,
  modeloutput,
  nativecallclass,
  ocrregion,
  origincheckverdict,
  originprofile,
  perfrecord,
  phishverdict,
  plandraft,
  preconnecttarget,
  providerconfig,
  replanrecord,
  resourcelock,
  resultreport,
  reviewrequest,
  revokerunevent,
  ratelimitbucket,
  ratelimitwindow,
  rollbackitem,
  runrecord,
  runsettings,
  safetyverdict,
  samplingrequest,
  selcacheentry,
  sensitiveclass,
  siteoverride,
  sourcemapconsent,
  spamrule,
  steptemplate,
  streamparsechunk,
  tasklane,
  toolcallrecord,
  toolcatalog,
  tooldef,
  toolmock,
  toolnamespace,
  toolstep,
  tooldryrun,
  transformrule,
  dedupekey,
  extractpipeline,
  extractrow,
  provlogentry,
  samplepolicy,
  streamcursor,
  verifiercheck,
  virtlistwindow,
  waitstep,
  watchdogconfig,
  workerassignment,
  workflowrecord,
  workflowstep,
  schemaerror,
  spawnrequest,
  swarmaction,
  taskqueue,
  captureformat,
  capturenaming,
  captureoptions,
  cdpallowlist,
  chunkextractcursor,
  cleanuprule,
  clientidentity,
  clientrecord,
  consoleconsentrecord,
  debuggergrant,
  delaystep,
  downloadspec,
  editormodel,
  endpointconfig,
  fieldkind,
  formprofile,
  locationconsent,
  loglevel,
  loglevelset,
  mimefilter,
  mcpserverconfig,
  navpause,
  navtrailentry,
  observationmode,
  permissionstate,
  policyevaluation,
  protocoleventsubscription,
  quarantineentry,
  regionrect,
  rotationrule,
  localrule,
  scanverdict,
  syncsettings,
} from "./types.js";
import { allowlistcheck, missingclassconsents, profilegrade, sensitiveclassesof, windowgatesstep } from "./security.js";
import { sensitivememoryclasses } from "./memory.js";
import { reservedagentnames } from "./agent.js";
import { defaultenvironment, environmentrequirementsof, environmentsof } from "./environments.js";
import { domainkinds, toolnamespaces } from "./tools.js";
import { channeloptionsof, channelorigin, pollcursorof, subscriptionoptionsof } from "./net.js";
import { pagecontentkeys } from "./bridge.js";
import { protocolfloormajor, protocolmajor } from "./version.js";
import { graphqlsubscriptionof, longpollrequestof } from "./http.js";
import { apireplayspecof, privatemime } from "./net.js";
import {
  blockruleof,
  cookiedomaingranted,
  cookierecordof,
  mockspecof,
  patternorigin,
  proxyrouteof,
  headeruleof,
} from "./net.js";
import {
  allowlistcovers,
  breakpointinputof,
  cdpallowlistof,
  cdpdomains,
  cdpeventruleof,
  methoddomain,
  overrideinputof,
  stepmodeof,
  teardownplanof,
  watchexpressionof,
} from "./debug.js";
import { annotationof, attachtargetof, flowspecof, tracecategories } from "./debug.js";
import {
  agentgrammarvalid,
  agentpresetof,
  blackboxruleof,
  browserpermissions,
  devicepresetof,
  familyofkind,
  locationconsentcovers,
  locationpresetof,
  locationrangevalid,
  networkpresetof,
  permissiongrantof,
  permissiongrade,
  permissionstates,
  revertplanof,
} from "./environments.js";
import {
  autointervalof,
  importsessionfile,
  restoreplanof,
  searchqueryof,
  sessionkinds,
  snapshotplanof,
} from "./session.js";
import {
  composeworkflow,
  expressionof,
  expressionoperators,
  regexruleof,
  steptemplateof,
  validateworkflow,
  workflowblockof,
  workflowstepof,
} from "./workflow.js";
import {
  branchof,
  conditionof,
  controlsteps,
  foreachof,
  iscontrolflowkind,
  loopof,
  parallelof,
  repeatuntilof,
  tryof,
  whileof,
} from "./workflow.js";
import {
  armrule,
  cronparse,
  triggerfamilyof,
  triggerpayloadof,
  triggereventcatalog,
  webhooksecretok,
} from "./workflow.js";
import { formpayloadof, multipartpayloadof, oauthflowof } from "./auth.js";
import { loglevels, timelinesources } from "./run.js";
import { bucketboundsvalid, origincheckof } from "./security.js";
import { gatekindfor } from "./gates.js";
import { phishthresholdvalid } from "./security.js";
import { packageversion } from "./version.js";

const sensitiveactions = new Set<actionkind>([
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
  "clickpoint",
  "shiftclick",
  "dismissdialog",
  "enterframe",
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
  "openlink",
  "openprivate",
  "reloadcache",
  "stopnav",
  "followlink",
  "spanav",
  "rewritequery",
  "setfragment",
  "navlist",
  "navprofile",
  "handleauth",
  "printpdf",
  "prefetch",
  "preconnect",
  "deeplink",
  "reopentab",
  "pausenav",
  "navrate",
  "openclipboard",
  "batchopen",
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
  "switchtab",
  "maximizewindow",
  "minimizewindow",
  "restorewindow",
  "focuswindow",
  "scratchwindow",
  "incognitowindow",
  "restoretab",
  "restorelayout",
  "reopenrun",
  "badgetab",
  "fillform",
  "filllabel",
  "fillplaceholder",
  "submitform",
  "retryform",
  "runwizard",
  "selectchain",
  "picktypeahead",
  "pickdate",
  "attachfile",
  "fillcard",
  "fillcode",
  "consentpassword",
  "exportcsv",
  "exportjson",
  "exportexcel",
  "copytable",
  "pushsheets",
  "streamdisk",
  "paginateextract",
  "resumeextract",
  "batchdownload",
  "pausedownload",
  "resumedownload",
  "interceptmime",
  "readclipboard",
  "writeclipboard",
  "copyscreen",
  "quarantinedownload",
  "scanvirus",
  "cleanupartifacts",
  "recordscreen",
  "captureaudio",
  "downloadimages",
  "callrest",
  "callgraphql",
  "sendmessage",
  "blockrequest",
  "mockresponse",
  "rewriteheaders",
  "setcookies",
  "clearcookies",
  "authflow",
  "saveapikey",
  "routeproxy",
  "postform",
  "postfiles",
  "attachcdp",
  "detachcdp",
  "cdpcmd",
  "overridescript",
  "heapshot",
  "profilecpu",
  "capturesourcemaps",
  "emulatedevice",
  "emulatenetwork",
  "emulatelocate",
  "setuseragent",
  "overridepermission",
  "restoresession",
  "exportsessions",
  "importsessions",
  "runworkflow",
  "visitrule",
  "urlrule",
  "menurule",
  "keyrule",
  "buttonrule",
  "cronrule",
  "intervalrule",
  "urllistrule",
  "webhookrule",
  "eventrule",
]);
const interactionactions = new Set<actionkind>([
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
  "movepointer",
  "clicktext",
  "clickaria",
  "clickname",
  "expanddetails",
  "pierceshadow",
  "retryaction",
  "capturebodies",
  "setbreakpoint",
  "stepcode",
  "watchexpr",
  "loop",
  "repeatuntil",
  "whileloop",
  "foreach",
  "parallel",
  "trycatch",
]);
const readactions = new Set<actionkind>([
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
  "mapclicks",
  "verifyvisible",
  "verifyenabled",
  "resolvexpath",
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
  "waitload",
  "waiturl",
  "spawait",
  "detecthttp",
  "readredirects",
  "readfinalurl",
  "trailaudit",
  "navintent",
  "checksafe",
  "querytabs",
  "watchtab",
  "findclones",
  "searchtabs",
  "listaudio",
  "snapshotsession",
  "savelayout",
  "attachmeta",
  "detectfields",
  "generatevalues",
  "saveprofiles",
  "asksubmit",
  "readerrors",
  "skiphoneypot",
  "detectlogin",
  "detecttemplate",
  "handoffcaptcha",
  "scrapetable",
  "importcsv",
  "looprows",
  "transformvalues",
  "deduperows",
  "mergepages",
  "stamplerows",
  "previewgrid",
  "logprovenance",
  "verifydownload",
  "exportnetlog",
  "namecaptures",
  "shotview",
  "shotfullpage",
  "shotelement",
  "shotregion",
  "contactsheet",
  "capturepdf",
  "captureframe",
  "readmedia",
  "readassets",
  "probestream",
  "timelapse",
  "shotcanvas",
  "convertimage",
  "makethumbs",
  "fetchurl",
  "parsejson",
  "parsehtml",
  "opensocket",
  "waitmessage",
  "watchrequests",
  "readheaders",
  "mapapi",
  "subscribesse",
  "longpoll",
  "extractapi",
  "readcookies",
  "watchconsole",
  "watcherrors",
  "watchtasks",
  "watchcdp",
  "measureflow",
  "trackmemory",
  "watchshifts",
  "traceload",
  "annotatetrace",
  "replaytrace",
  "blackboxscripts",
  "persiststate",
  "capturesession",
  "namedsessions",
  "diffsessions",
  "searchsessions",
  "composeworkflow",
  "savetemplate",
  "dryrun",
  "delay",
  "waitelement",
  "compute",
  "extractvars",
  "listruns",
  "condition",
  "branch",
]);
const allowedactions = new Set<actionkind>([...sensitiveactions, ...interactionactions, ...readactions]);
const watchactions = new Set<actionkind>(["watchmutate", "watchbanner", "watchfocus", "watchtab"]);
const targetactions = new Set<actionkind>([
  "inspect",
  "focus",
  "click",
  "type",
  "scroll",
  "select",
  "hover",
  "clickdeep",
  "rightclick",
  "doubleclick",
  "drag",
  "drop",
  "upload",
  "clear",
  "check",
  "uncheck",
  "toggle",
  "submit",
  "readattribute",
  "readstyle",
  "readgeometry",
  "readvalue",
  "readtext",
  "readhtml",
  "countelements",
  "readtable",
  "highlight",
  "setattribute",
  "removeattribute",
  "waitfor",
  "shiftclick",
  "typetime",
  "appendtext",
  "setvalue",
  "typeedit",
  "submitsearch",
  "selectmulti",
  "chooseradio",
  "setslider",
  "setdate",
  "setcolor",
  "expanddetails",
  "verifyvisible",
  "verifyenabled",
  "pierceshadow",
  "deriveselector",
  "fingerprintsection",
  "submitform",
  "retryform",
  "selectchain",
  "picktypeahead",
  "pickdate",
  "attachfile",
  "fillcode",
  "consentpassword",
  "scrapetable",
  "paginateextract",
  "shotelement",
  "captureframe",
  "shotcanvas",
]);
const valueactions = new Set<actionkind>([
  "presskey",
  "drag",
  "drop",
  "upload",
  "readattribute",
  "removeattribute",
  "waittext",
  "evaluate",
  "zoomset",
  "tabactivate",
  "tabclose",
  "tabreload",
  "windowclose",
  "windowresize",
  "tabcreate",
  "windowcreate",
  "downloadfile",
  "typetime",
  "appendtext",
  "setvalue",
  "typeedit",
  "keyhold",
  "keyrelease",
  "chooseradio",
  "setslider",
  "setdate",
  "setcolor",
  "followlink",
  "setfragment",
  "handleauth",
  "navintent",
  "openclipboard",
  "checksafe",
  "reopentab",
  "spanav",
  "duplicatetab",
  "pintab",
  "mutetab",
  "movetab",
  "movetabwindow",
  "searchtabs",
  "badgetab",
  "attachmeta",
  "focuswindow",
  "maximizewindow",
  "minimizewindow",
  "restorewindow",
  "incognitowindow",
  "asksubmit",
  "selectchain",
  "picktypeahead",
  "pickdate",
  "attachfile",
  "fillcode",
  "consentpassword",
  "pausedownload",
  "resumedownload",
  "verifydownload",
  "writeclipboard",
  "quarantinedownload",
  "scanvirus",
]);
const tabscommandactions = new Set<actionkind>([
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
]);
const formactions = new Set<actionkind>([
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
]);
/** Extraction, transform, export and provenance kinds of the forms and data part two family. */
const datasetactions = new Set<actionkind>([
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
]);
/** Export kinds that move extracted data out of local memory to disk, the clipboard or a reviewed sheet endpoint. */
const exportactions = new Set<actionkind>([
  "exportcsv",
  "exportjson",
  "exportexcel",
  "copytable",
  "pushsheets",
  "streamdisk",
]);
/** Files, clipboard and downloads kinds of the batch queue, interception, clipboard, quarantine, naming and cleanup family. */
const filesactions = new Set<actionkind>([
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
]);
const captureactions = new Set<actionkind>(["shotview", "shotfullpage", "shotelement", "shotregion", "contactsheet"]);
/** Media capture part two kinds of the pdf, recording, image, canvas, stream, asset, lapse, conversion and thumbnail family. */
const mediaactions = new Set<actionkind>([
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
]);

const httpactions = new Set<actionkind>(["fetchurl", "parsejson", "parsehtml", "callrest", "callgraphql"]);

const socketactions = new Set<actionkind>(["opensocket", "sendmessage", "waitmessage", "subscribesse", "longpoll"]);

const netwatchactions = new Set<actionkind>(["watchrequests", "readheaders", "capturebodies", "mapapi", "extractapi"]);

/** Network control kinds of the 1.1.44 family: blocking, mocking, header rewriting, cookies, auth, api keys, proxy routing and uploads. */
const controlactions = new Set<actionkind>([
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
]);

/** Debugging kinds of the 1.1.45 family: console, error and task watching stays read only timeline capture. */
const debugactions = new Set<actionkind>(["watchconsole", "watcherrors", "watchtasks"]);

/** The devtools protocol kinds of the 1.1.46 debugging family: attach, detach, raw commands, event watches, breakpoints, stepping, watch expressions and script overrides. */
const cdpactions = new Set<actionkind>([
  "attachcdp",
  "detachcdp",
  "cdpcmd",
  "watchcdp",
  "setbreakpoint",
  "stepcode",
  "watchexpr",
  "overridescript",
]);

/** The profiling kinds of the 1.1.47 debugging part three family: flow measurement, heap snapshots, memory growth tracking, cpu profiles, layout shift watches, trace records, trace annotation, offline trace replay and source map capture. */
const profileractions = new Set<actionkind>([
  "measureflow",
  "heapshot",
  "trackmemory",
  "profilecpu",
  "watchshifts",
  "traceload",
  "annotatetrace",
  "replaytrace",
  "capturesourcemaps",
]);

const emulationactions = new Set<actionkind>([
  "emulatedevice",
  "emulatenetwork",
  "emulatelocate",
  "setuseragent",
  "overridepermission",
  "blackboxscripts",
]);

/** The session memory kinds of the 1.1.49 family: task state persistence, session capture, restore, naming, diffing, search, export and import. */
const sessionactions = new Set<actionkind>([
  "persiststate",
  "capturesession",
  "restoresession",
  "namedsessions",
  "diffsessions",
  "searchsessions",
  "exportsessions",
  "importsessions",
]);

/** The workflow kinds of the 1.1.50 and 1.1.51 families: composition, templates, runs, dry runs, jittered delays, element waits, expressions, variable extraction, and the control flow family of conditionals, branching, loops, parallel branches with joins and try catch with retries and timeouts. */
const workflowactions = new Set<actionkind>([
  "composeworkflow",
  "savetemplate",
  "runworkflow",
  "dryrun",
  "delay",
  "waitelement",
  "compute",
  "extractvars",
  "condition",
  "branch",
  "loop",
  "repeatuntil",
  "whileloop",
  "foreach",
  "parallel",
  "trycatch",
]);

/** The trigger kinds of the 1.1.52 family: page visit, url pattern, context menu, keyboard shortcut, toolbar button, cron, interval, url list, webhook and page event rules that launch reviewed workflows; every rule arms behind the explicit arm review and grades sensitive because it launches runs automatically. */
const triggeractions = new Set<actionkind>([
  "visitrule",
  "urlrule",
  "menurule",
  "keyrule",
  "buttonrule",
  "cronrule",
  "intervalrule",
  "urllistrule",
  "webhookrule",
  "eventrule",
]);

/** Header names that carry credentials; sending any of them needs the explicit consent that names the header. */
const credentialheaders = new Set([
  "authorization",
  "proxy-authorization",
  "cookie",
  "cookie2",
  "set-cookie",
  "api-key",
  "x-api-key",
  "x-auth-token",
  "x-session-token",
  "proxy-authorization",
]);
/** Field kinds the form grammar accepts inside records, profiles and value rules. */
const fieldkinds: fieldkind[] = [
  "text",
  "email",
  "phone",
  "date",
  "number",
  "select",
  "check",
  "radio",
  "file",
  "password",
  "card",
  "code",
];
const layoutmutationactions = new Set<actionkind>([
  "grouptabs",
  "colorgroup",
  "collapsegroup",
  "savelayout",
  "restorelayout",
]);
/** Chromium tab group colors accepted as reviewed group color choices. */
const groupcolors = ["grey", "blue", "red", "yellow", "green", "pink", "purple", "cyan", "orange"];

/** Normalizes a user supplied HTTPS endpoint without preserving a provider lock-in. */
export function normalizeendpoint(value: string): endpointconfig {
  const endpoint = new URL(value.trim());
  if (endpoint.protocol !== "https:") throw new Error("Devthink accepts HTTPS endpoints only.");
  if (endpoint.username || endpoint.password) throw new Error("Endpoint credentials are not allowed in the URL.");
  return { endpoint: endpoint.toString(), origin: endpoint.origin, configuredat: Date.now() };
}

/** Creates the exact optional host pattern requested from Chromium. */
export function hostpattern(origin: string): string {
  const parsed = new URL(origin);
  if (parsed.protocol !== "https:") throw new Error("Only HTTPS origins can be granted.");
  return `${parsed.origin}/*`;
}

/** True when the kind belongs to the session memory family of the 1.1.49 release. */
export function issessionkind(kind: actionkind): boolean {
  return sessionactions.has(kind);
}

/** True when the kind belongs to the workflow family of the 1.1.50 release. */
export function isworkflowkind(kind: actionkind): boolean {
  return workflowactions.has(kind);
}

/** True when the kind belongs to the trigger family of the 1.1.52 release: every trigger kind arms an automatic launcher and needs the explicit arm review. */
export function istriggeraction(kind: actionkind): boolean {
  return triggeractions.has(kind);
}

/** True when the action kind observes the page over a reviewed lifetime window. */
export function iswatchkind(kind: actionkind): boolean {
  return watchactions.has(kind);
}

/** True when the kind belongs to the debugging family of console, error and task watching. */
export function isdebugkind(kind: actionkind): boolean {
  return debugactions.has(kind);
}

/** True when the kind belongs to the devtools protocol family of attaches, raw commands, event watches, breakpoints, stepping, watch expressions and script overrides. */
export function iscdpkind(kind: actionkind): boolean {
  return cdpactions.has(kind);
}

/** True when the kind belongs to the profiling family of flow, heap, cpu, shift, trace and source map instruments. */
export function isprofilekind(kind: actionkind): boolean {
  return profileractions.has(kind);
}

/** True when the kind belongs to the emulation family of device, network, location, agent and permission layers plus blackbox trace shaping. */
export function isemulationkind(kind: actionkind): boolean {
  return emulationactions.has(kind);
}

/** Grades the observation mode of a kind: passive capture, watched lifetimes or diffing passes. */
export function observationmodeof(kind: actionkind): observationmode {
  if (
    watchactions.has(kind) ||
    debugactions.has(kind) ||
    (profileractions.has(kind) &&
      kind !== "heapshot" &&
      kind !== "replaytrace" &&
      kind !== "annotatetrace" &&
      kind !== "capturesourcemaps" &&
      kind !== "profilecpu") ||
    (cdpactions.has(kind) && kind === "watchcdp") ||
    kind === "waitquiet"
  )
    return "watching";
  if (kind === "diffsnapshots") return "diffing";
  return "passive";
}

/** Defines action risk from the fixed local allowlist. */
export function actionrisk(kind: actionkind): "read" | "interaction" | "sensitive" {
  if (!allowedactions.has(kind)) throw new Error("Unsupported browser action.");
  if (sensitiveactions.has(kind)) return "sensitive";
  return interactionactions.has(kind) ? "interaction" : "read";
}

/** True when the action kind accepts a css selector target or a reviewed targetref. */
export function needstarget(kind: actionkind): boolean {
  return targetactions.has(kind);
}

/** Parses the reviewed JSON options of a step; malformed payloads are rejected early. */
export function parseoptions(step: toolstep): Record<string, unknown> {
  if (step.options === undefined) return {};
  let parsed: unknown;
  try {
    parsed = JSON.parse(step.options);
  } catch {
    throw new Error("Step options must be a JSON object.");
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
    throw new Error("Step options must be a JSON object.");
  return parsed as Record<string, unknown>;
}

/** Maps an action kind to the optional browser permission it requires, if any. */
export function requiredcapability(kind: actionkind): string | undefined {
  if (kind === "tablist") return "tabs";
  if (kind === "downloadfile") return "downloads";
  if (kind === "openclipboard") return "clipboardRead";
  if (kind === "copytable") return "clipboardWrite";
  if (
    kind === "batchdownload" ||
    kind === "pausedownload" ||
    kind === "resumedownload" ||
    kind === "verifydownload" ||
    kind === "interceptmime" ||
    kind === "quarantinedownload" ||
    kind === "scanvirus"
  )
    return "downloads";
  if (kind === "readclipboard") return "clipboardRead";
  if (kind === "writeclipboard" || kind === "copyscreen") return "clipboardWrite";
  if (kind === "downloadimages") return "downloads";
  if (kind === "authflow") return "tabs";
  if (kind === "capturesession" || kind === "restoresession") return "tabs";
  if (kind === "exportsessions") return "downloads";
  if (
    kind === "openlink" ||
    kind === "openprivate" ||
    kind === "navlist" ||
    kind === "batchopen" ||
    kind === "reopentab" ||
    kind === "deeplink"
  )
    return "tabs";
  if (tabscommandactions.has(kind)) return "tabs";
  return undefined;
}

/** True when the kind commands tabs or windows beyond the active tab and needs the optional tabs capability. */
export function istabscommandkind(kind: actionkind): boolean {
  return tabscommandactions.has(kind);
}

/** True when the kind mutates tab groups or layouts and therefore stays inside the active session. */
export function islayoutkind(kind: actionkind): boolean {
  return layoutmutationactions.has(kind);
}

/** True when the kind belongs to the forms and data family. */
export function isformkind(kind: actionkind): boolean {
  return formactions.has(kind);
}

/** True when the kind belongs to the extraction, transform, export and provenance family. */
export function isdatasetkind(kind: actionkind): boolean {
  return datasetactions.has(kind);
}

/** True when the kind exports extracted data out of local memory to disk, the clipboard or a reviewed sheet endpoint. */
export function isexportkind(kind: actionkind): boolean {
  return exportactions.has(kind);
}

/** True when the kind belongs to the files, clipboard and downloads family. */
export function isfileskind(kind: actionkind): boolean {
  return filesactions.has(kind);
}

/** True when the kind belongs to the media capture family of viewport, full page, element, region and contact sheet shots. */
export function iscapturekind(kind: actionkind): boolean {
  return captureactions.has(kind);
}

/** Requires the active tab grant of the live session before any capture kind runs: the session tab and origin must match and the origin grant must cover the active origin. */
export function capturegate(
  session: agentsession | undefined,
  tabid: number,
  origin: string,
  now: number,
): policyevaluation {
  if (!session || session.stoppedat)
    return { allowed: false, reason: "No active browser session exists for the capture." };
  if (session.expiresat <= now)
    return { allowed: false, reason: "The browser session has expired and cannot capture." };
  if (session.pausedat) return { allowed: false, reason: "The browser session is paused and cannot capture." };
  if (session.tabid !== tabid)
    return {
      allowed: false,
      reason: `The capture needs the active tab grant of session tab ${session.tabid} and refuses tab ${tabid}.`,
    };
  if (!origingranted(session, origin))
    return { allowed: false, reason: `The capture of ${origin} needs the session origin grants first.` };
  return { allowed: true };
}

/** Validates one reviewed capture options payload: format inside the png, jpeg and webp set, quality bounded only by the format range, pixel ratio from one up with no code ceiling, and a known export target. */
export function validatecaptureoptions(value: unknown): policyevaluation {
  if (value === undefined) return { allowed: true };
  if (!value || typeof value !== "object" || Array.isArray(value))
    return { allowed: false, reason: "The reviewed capture options must be an object in options.capture." };
  const options = value as Record<string, unknown>;
  if (
    options.format !== undefined &&
    options.format !== "png" &&
    options.format !== "jpeg" &&
    options.format !== "webp"
  )
    return { allowed: false, reason: "The reviewed capture format must be png, jpeg or webp." };
  if (
    options.quality !== undefined &&
    (typeof options.quality !== "number" ||
      !Number.isFinite(options.quality) ||
      options.quality < 0 ||
      options.quality > 100)
  )
    return {
      allowed: false,
      reason:
        "The reviewed capture quality must stay between zero and one hundred; any value in that range is the user choice with no code cap.",
    };
  if (
    options.pixelratio !== undefined &&
    (typeof options.pixelratio !== "number" || !Number.isFinite(options.pixelratio) || options.pixelratio < 1)
  )
    return {
      allowed: false,
      reason: "The reviewed pixel ratio starts at one and climbs to any user configured ceiling with no code ceiling.",
    };
  if (options.annotate !== undefined && typeof options.annotate !== "boolean")
    return { allowed: false, reason: "The reviewed capture annotation flag must be a boolean." };
  if (
    options.exporttarget !== undefined &&
    options.exporttarget !== "memory" &&
    options.exporttarget !== "download" &&
    options.exporttarget !== "clipboard"
  )
    return { allowed: false, reason: "The reviewed capture export target must be memory, download or clipboard." };
  return { allowed: true };
}

/** Validates one reviewed region rectangle in css pixels; negative coordinates and non positive sizes are refused. */
export function validateregionrect(value: unknown): policyevaluation {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return {
      allowed: false,
      reason: "A reviewed regionrect with x, y, width and height in css pixels is required in options.",
    };
  const rect = value as Record<string, unknown>;
  for (const field of ["x", "y", "width", "height"]) {
    if (typeof rect[field] !== "number" || !Number.isFinite(rect[field] as number))
      return { allowed: false, reason: `The reviewed regionrect needs a numeric ${field} in css pixels.` };
  }
  if ((rect.x as number) < 0 || (rect.y as number) < 0)
    return { allowed: false, reason: "The reviewed regionrect refuses negative coordinates." };
  if ((rect.width as number) <= 0 || (rect.height as number) <= 0)
    return { allowed: false, reason: "The reviewed regionrect needs positive width and height values." };
  return { allowed: true };
}

/** Validates one reviewed capture naming rule against the allowed segment set: run, step, sequence and kind flags only. */
export function validatecapturenaming(value: unknown): policyevaluation {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return {
      allowed: false,
      reason: "A reviewed capturenaming rule with run, step, sequence and kind flags is required.",
    };
  const rule = value as Record<string, unknown>;
  const segments = ["run", "step", "sequence", "kind"];
  for (const key of Object.keys(rule)) {
    if (!segments.includes(key))
      return {
        allowed: false,
        reason: `The reviewed capturenaming rule refuses the unknown ${key} segment; only run, step, sequence and kind participate.`,
      };
  }
  for (const segment of segments) {
    if (rule[segment] !== undefined && typeof rule[segment] !== "boolean")
      return { allowed: false, reason: `The reviewed capturenaming ${segment} flag must be a boolean.` };
  }
  if (!segments.some((segment) => rule[segment] === true))
    return {
      allowed: false,
      reason: "The reviewed capturenaming rule needs at least one enabled segment of run, step, sequence and kind.",
    };
  return { allowed: true };
}

/** Routes the capture export target: memory stays local, clipboard needs the clipboardwrite grant and disk writes only run through the reviewed download flow. */
export function captureexportgranted(target: captureexport | undefined): policyevaluation {
  if (target === undefined || target === "memory") return { allowed: true };
  if (target === "clipboard")
    return {
      allowed: true,
      reason:
        "The clipboard capture export runs behind the optional clipboardwrite capability, negotiated through the permissions api before the copy.",
    };
  if (target === "download")
    return {
      allowed: true,
      reason:
        "The download capture export runs only through the reviewed download flow behind the optional downloads capability.",
    };
  return {
    allowed: false,
    reason: "The capture export target must be memory, download or clipboard; no other disk route exists.",
  };
}

/** Keeps the stitching scroll budget inside the reviewed wait window: the settle windows of every tile must fit the reviewed wait window with no code ceiling on either side. */
export function stitchbudgetallowed(tiles: number, settle: number, wait: number): policyevaluation {
  if (tiles <= 0) return { allowed: false, reason: "The stitch budget needs at least one tile." };
  if (settle < 0 || wait < 0)
    return { allowed: false, reason: "The reviewed settle and wait windows must be zero or positive milliseconds." };
  if (tiles * settle > wait)
    return {
      allowed: false,
      reason: `The stitching scroll budget of ${tiles} tiles at ${settle} milliseconds exceeds the reviewed wait window of ${wait} milliseconds; review a wider window or a smaller settle.`,
    };
  return { allowed: true };
}

/** Allows beforeafter state capture to wrap any existing action kind except the capture kinds themselves; pixel evidence around sensitive actions grades as reviewable evidence. */
export function beforeafterwrapallowed(kind: actionkind): boolean {
  return allowedactions.has(kind) && !captureactions.has(kind);
}

/** Exposes the capture retention window as a user configured choice; an absent value keeps every capture byte forever with no code ceiling. */
export function captureretentionwindow(settings: runsettings | undefined): number | undefined {
  return settings?.captureretention;
}

/** Validates the reviewed media capture parameter grammar; pixel ratios, quality values, cell counts and retention windows stay user choices with no code ceilings. */
function validatecapturegrammar(step: toolstep, options: Record<string, unknown>): policyevaluation {
  const kind = step.kind;
  const optioncheck = validatecaptureoptions(options.capture);
  if (!optioncheck.allowed) return optioncheck;
  if (
    options.settle !== undefined &&
    (typeof options.settle !== "number" || !Number.isFinite(options.settle) || options.settle < 0)
  )
    return {
      allowed: false,
      reason: "The reviewed capture settle window must be zero or a positive number of milliseconds.",
    };
  if (
    options.overlap !== undefined &&
    (typeof options.overlap !== "number" || !Number.isInteger(options.overlap) || options.overlap < 0)
  )
    return { allowed: false, reason: "The reviewed stitch overlap must be zero or a positive number of rows." };
  if (
    options.wait !== undefined &&
    (typeof options.wait !== "number" || !Number.isFinite(options.wait) || options.wait < 0)
  )
    return {
      allowed: false,
      reason: "The reviewed capture wait window must be zero or a positive number of milliseconds.",
    };
  if (options.naming !== undefined) {
    const namingcheck = validatecapturenaming(options.naming);
    if (!namingcheck.allowed) return namingcheck;
  }
  if (kind === "shotregion") {
    const rectcheck = validateregionrect(options.regionrect);
    if (!rectcheck.allowed) return rectcheck;
    if (options.reviewed !== true)
      return {
        allowed: false,
        reason: "Every reviewed regionrect needs the explicit reviewed flag before shotregion runs.",
      };
    if (options.container !== undefined && !isnonempty(options.container))
      return { allowed: false, reason: "The reviewed scrollable container selector must be a non-empty string." };
    if (
      options.steps !== undefined &&
      (typeof options.steps !== "number" || !Number.isInteger(options.steps) || options.steps < 1)
    )
      return {
        allowed: false,
        reason: "The reviewed container scroll steps must be a positive integer with no code ceiling.",
      };
  }
  if (kind === "contactsheet") {
    const elements = options.elements;
    if (!Array.isArray(elements) || elements.length === 0 || !elements.every((item) => isnonempty(item)))
      return {
        allowed: false,
        reason:
          "A reviewed non-empty list of element selectors is required in options for the contact sheet; the cell count stays the user choice.",
      };
    const layout = options.sheet;
    if (layout !== undefined) {
      if (!layout || typeof layout !== "object" || Array.isArray(layout))
        return {
          allowed: false,
          reason: "The reviewed sheetlayout must be an object with cellsize, columns and label.",
        };
      const sheet = layout as Record<string, unknown>;
      if (typeof sheet.cellsize !== "number" || !Number.isFinite(sheet.cellsize) || sheet.cellsize <= 0)
        return { allowed: false, reason: "The reviewed contact sheet cell size must be a positive number of pixels." };
      if (typeof sheet.columns !== "number" || !Number.isInteger(sheet.columns) || sheet.columns < 1)
        return {
          allowed: false,
          reason: "The reviewed contact sheet column count must be a positive integer with no code ceiling.",
        };
      if (
        sheet.label !== undefined &&
        sheet.label !== "none" &&
        sheet.label !== "index" &&
        sheet.label !== "selector" &&
        sheet.label !== "both"
      )
        return {
          allowed: false,
          reason: "The reviewed contact sheet label style must be none, index, selector or both.",
        };
    }
  }
  return { allowed: true };
}

/** Refuses any export that would leave local memory while the session origin grants do not cover the active origin. */
export function exportgranted(session: agentsession | undefined, origin: string): policyevaluation {
  if (!origingranted(session, origin))
    return {
      allowed: false,
      reason: `The export of extracted data from ${origin} needs the session origin grants before it leaves local memory.`,
    };
  return { allowed: true };
}

/** Validates the reviewed fieldmatch grammar of one form field entry. */
export function validatefieldmatch(value: unknown): policyevaluation {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return { allowed: false, reason: "A reviewed field match is required in options." };
  const match = value as Record<string, unknown>;
  if (match.mode !== "label" && match.mode !== "placeholder" && match.mode !== "arialabel" && match.mode !== "name")
    return { allowed: false, reason: "The reviewed field match mode must be label, placeholder, arialabel or name." };
  const key =
    match.mode === "label"
      ? "label"
      : match.mode === "placeholder"
        ? "placeholder"
        : match.mode === "arialabel"
          ? "arialabel"
          : "name";
  if (!isnonempty(match[key]))
    return { allowed: false, reason: `The reviewed ${match.mode} field match needs a non-empty ${key}.` };
  return { allowed: true };
}

/** Validates a reviewed structured form record; password entries are refused because passwords need the explicit consentpassword consent. */
export function validateformrecord(value: unknown): policyevaluation {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return { allowed: false, reason: "A reviewed form record with entries is required in options." };
  const record = value as Record<string, unknown>;
  if (record.form !== undefined && !isnonempty(record.form))
    return { allowed: false, reason: "The reviewed form record form selector must be a non-empty string." };
  if (!Array.isArray(record.entries) || record.entries.length === 0)
    return { allowed: false, reason: "The reviewed form record needs a non-empty list of entries." };
  for (const item of record.entries) {
    if (!item || typeof item !== "object" || Array.isArray(item))
      return { allowed: false, reason: "Every reviewed form record entry must be an object." };
    const entry = item as Record<string, unknown>;
    const matchcheck = validatefieldmatch(entry.match);
    if (!matchcheck.allowed) return matchcheck;
    if (typeof entry.kind !== "string" || !fieldkinds.includes(entry.kind as fieldkind))
      return { allowed: false, reason: "Every reviewed form record entry needs a known field kind." };
    if (typeof entry.value !== "string")
      return { allowed: false, reason: "Every reviewed form record entry needs a string value." };
    if (entry.kind === "password")
      return {
        allowed: false,
        reason: "Password entries are refused inside form records; use consentpassword with a reviewed consent ref.",
      };
  }
  return { allowed: true };
}

/** Validates the reviewed valuegen grammar of a generatevalues step. */
export function validatevaluegen(value: unknown): policyevaluation {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return { allowed: false, reason: "A reviewed valuegen rule with a field kind is required in options." };
  const rule = value as Record<string, unknown>;
  if (typeof rule.kind !== "string" || !fieldkinds.includes(rule.kind as fieldkind))
    return { allowed: false, reason: "The reviewed valuegen kind must be a known field kind." };
  if (rule.locale !== undefined && !isnonempty(rule.locale))
    return { allowed: false, reason: "The reviewed valuegen locale must be a non-empty string." };
  if (rule.seed !== undefined && (typeof rule.seed !== "number" || !Number.isFinite(rule.seed)))
    return { allowed: false, reason: "The reviewed valuegen seed must be a finite number." };
  return { allowed: true };
}

/** Validates a reviewed list of label or placeholder value pairs for filllabel and fillplaceholder steps. */
function validatefieldpairs(options: Record<string, unknown>, mode: "label" | "placeholder"): policyevaluation {
  const pairs = options.fields;
  if (!Array.isArray(pairs) || pairs.length === 0)
    return { allowed: false, reason: "A reviewed non-empty list of field pairs is required in options." };
  for (const item of pairs) {
    if (!item || typeof item !== "object" || Array.isArray(item))
      return { allowed: false, reason: "Every reviewed field pair must be an object." };
    const pair = item as Record<string, unknown>;
    if (!isnonempty(pair[mode]))
      return { allowed: false, reason: `Every reviewed field pair needs a non-empty ${mode}.` };
    if (typeof pair.value !== "string" || !pair.value.trim())
      return { allowed: false, reason: "Every reviewed field pair needs a non-empty value." };
  }
  return { allowed: true };
}

/** Validates the reviewed card segment grammar of a fillcard step. */
function validatecardsegments(value: unknown): policyevaluation {
  if (!Array.isArray(value) || value.length === 0)
    return { allowed: false, reason: "A reviewed non-empty list of card segments is required in options." };
  for (const item of value) {
    if (!item || typeof item !== "object" || Array.isArray(item))
      return { allowed: false, reason: "Every reviewed card segment must be an object." };
    const segment = item as Record<string, unknown>;
    const matchcheck = validatefieldmatch(segment.match);
    if (!matchcheck.allowed) return matchcheck;
    if (typeof segment.value !== "string" || !segment.value.trim())
      return { allowed: false, reason: "Every reviewed card segment needs a non-empty value." };
  }
  return { allowed: true };
}

/** Validates the reviewed forms and data parameter grammar of the form family. */
function validateformgrammar(step: toolstep, options: Record<string, unknown>): policyevaluation {
  const kind = step.kind;
  if (kind === "fillform" || (kind === "saveprofiles" && options.formrecord !== undefined)) {
    const recordcheck = validateformrecord(options.formrecord);
    if (!recordcheck.allowed) return recordcheck;
  }
  if (kind === "filllabel" || kind === "fillplaceholder") {
    const paircheck = validatefieldpairs(options, kind === "filllabel" ? "label" : "placeholder");
    if (!paircheck.allowed) return paircheck;
  }
  if (kind === "generatevalues" && options.valuegen !== undefined) {
    const rulecheck = validatevaluegen(options.valuegen);
    if (!rulecheck.allowed) return rulecheck;
  }
  if (kind === "saveprofiles" && !isnonempty(options.name))
    return { allowed: false, reason: "A reviewed profile name is required in options." };
  if (kind === "submitform" && !isnonempty(options.consentref))
    return { allowed: false, reason: "A reviewed consent ref of an approved asksubmit ticket is required in options." };
  if (kind === "retryform") {
    const backoff = options.backoff;
    if (!backoff || typeof backoff !== "object" || Array.isArray(backoff))
      return { allowed: false, reason: "A reviewed backoff rule with wait and factor is required in options." };
    const rule = backoff as Record<string, unknown>;
    if (typeof rule.wait !== "number" || !Number.isFinite(rule.wait) || rule.wait <= 0)
      return {
        allowed: false,
        reason: "The reviewed retry backoff wait must be a positive number of milliseconds with no code ceiling.",
      };
    if (typeof rule.factor !== "number" || !Number.isFinite(rule.factor) || rule.factor < 1)
      return {
        allowed: false,
        reason: "The reviewed retry backoff factor must be one or greater with no code ceiling.",
      };
    if (
      options.attempts !== undefined &&
      (typeof options.attempts !== "number" || !Number.isInteger(options.attempts) || options.attempts < 1)
    )
      return { allowed: false, reason: "The reviewed retry attempts must be a positive integer with no code ceiling." };
  }
  if (
    kind === "runwizard" &&
    options.steps !== undefined &&
    (typeof options.steps !== "number" || !Number.isInteger(options.steps) || options.steps < 1)
  )
    return {
      allowed: false,
      reason: "The reviewed wizard step count must be a positive integer with no code ceiling.",
    };
  if (kind === "selectchain") {
    if (!isnonempty(options.child))
      return { allowed: false, reason: "A reviewed child selector of the dependent control is required in options." };
    if (!nonnegativeoption(options, "wait"))
      return {
        allowed: false,
        reason: "The reviewed dependent wait must be zero or a positive number of milliseconds.",
      };
  }
  if (kind === "picktypeahead") {
    if (!isnonempty(options.pick))
      return { allowed: false, reason: "A reviewed suggestion entry to pick is required in options." };
    if (!nonnegativeoption(options, "timeout"))
      return {
        allowed: false,
        reason: "The reviewed typeahead timeout must be zero or a positive number of milliseconds.",
      };
  }
  if (kind === "pickdate" && !/^\d{4}-\d{2}-\d{2}$/.test(step.value ?? ""))
    return { allowed: false, reason: "The reviewed date must use the yyyy-mm-dd form." };
  if (kind === "fillcard") {
    const segmentcheck = validatecardsegments(options.segments);
    if (!segmentcheck.allowed) return segmentcheck;
    if (!nonnegativeoption(options, "pause"))
      return {
        allowed: false,
        reason: "The reviewed card typing pause must be zero or a positive number of milliseconds.",
      };
  }
  if (kind === "fillcode" && !isnonempty(options.source))
    return { allowed: false, reason: "A reviewed one time code source is required in options." };
  if (kind === "consentpassword" && !isnonempty(options.consentref))
    return { allowed: false, reason: "A reviewed consent ref is required in options before any password is filled." };
  return { allowed: true };
}

/** Validates one reviewed transform rule: a supported expression, source columns and a target column. */
export function validatetransformrule(value: unknown): policyevaluation {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return {
      allowed: false,
      reason: "A reviewed transform rule with an expression, sources and a target is required in options.",
    };
  const rule = value as Record<string, unknown>;
  const expression = rule.expression;
  if (typeof expression !== "string" || !/^(trim|upper|lower|number|prefix|suffix|replace)(?::.+)?$/.test(expression))
    return {
      allowed: false,
      reason:
        "The reviewed transform expression must be trim, upper, lower, number, prefix, suffix or replace with an optional argument.",
    };
  if (expression.startsWith("replace") && !expression.slice("replace".length).includes("=>"))
    return { allowed: false, reason: "The reviewed replace expression needs the from=>to separator." };
  if (expression.startsWith("replace") && expression.slice("replace:".length).split("=>")[0] === "")
    return { allowed: false, reason: "The reviewed replace expression needs a non-empty from part." };
  if (!Array.isArray(rule.sources) || rule.sources.length === 0 || !rule.sources.every((source) => isnonempty(source)))
    return { allowed: false, reason: "Every reviewed transform rule needs a non-empty list of source columns." };
  if (!isnonempty(rule.target))
    return { allowed: false, reason: "Every reviewed transform rule needs a non-empty target column." };
  return { allowed: true };
}

/** Validates a reviewed dataset id list in options. */
function validatedatasetids(options: Record<string, unknown>, key: string): policyevaluation {
  const ids = options[key];
  if (!Array.isArray(ids) || ids.length === 0 || !ids.every((id) => isnonempty(id)))
    return { allowed: false, reason: `A reviewed non-empty list of dataset ids is required in options as ${key}.` };
  return { allowed: true };
}

/** Validates the reviewed extraction, transform, export and provenance parameter grammar of the data family. */
function validatedatagrammar(step: toolstep, options: Record<string, unknown>, origin: string): policyevaluation {
  const kind = step.kind;
  if (kind === "scrapetable") {
    if (options.name !== undefined && !isnonempty(options.name))
      return { allowed: false, reason: "The reviewed dataset name must be a non-empty string." };
    if (
      options.rowlimit !== undefined &&
      (typeof options.rowlimit !== "number" || !Number.isInteger(options.rowlimit) || options.rowlimit < 1)
    )
      return { allowed: false, reason: "The reviewed row limit must be a positive integer with no code ceiling." };
  }
  if (kind === "paginateextract") {
    if (!isnonempty(options.next))
      return { allowed: false, reason: "A reviewed next control selector is required in options." };
    if (
      options.pages !== undefined &&
      (typeof options.pages !== "number" || !Number.isInteger(options.pages) || options.pages < 1)
    )
      return { allowed: false, reason: "The reviewed page count must be a positive integer with no code ceiling." };
    if (!nonnegativeoption(options, "wait"))
      return {
        allowed: false,
        reason: "The reviewed row freshness wait must be zero or a positive number of milliseconds.",
      };
  }
  if (
    kind === "exportcsv" ||
    kind === "exportjson" ||
    kind === "exportexcel" ||
    kind === "copytable" ||
    kind === "streamdisk"
  ) {
    if (!isnonempty(options.dataset))
      return { allowed: false, reason: "A reviewed dataset id is required in options." };
    if (options.name !== undefined && !isnonempty(options.name))
      return { allowed: false, reason: "The reviewed artifact name must be a non-empty string." };
  }
  if (
    kind === "exportcsv" &&
    options.delimiter !== undefined &&
    (typeof options.delimiter !== "string" || options.delimiter.length !== 1)
  )
    return { allowed: false, reason: "The reviewed csv delimiter must be a single character." };
  if (
    kind === "streamdisk" &&
    (typeof options.chunk !== "number" || !Number.isInteger(options.chunk) || options.chunk < 1)
  )
    return {
      allowed: false,
      reason: "The reviewed streaming chunk size must be a positive integer with no code ceiling.",
    };
  if (kind === "pushsheets") {
    if (!isnonempty(options.dataset))
      return { allowed: false, reason: "A reviewed dataset id is required in options." };
    if (!isnonempty(options.sheet))
      return { allowed: false, reason: "A reviewed sheet endpoint url is required in options." };
    if (!ishttpsurl(options.sheet))
      return { allowed: false, reason: "The reviewed sheet endpoint url must use HTTPS." };
    if (options.reviewed !== true)
      return {
        allowed: false,
        reason: "The sheet push needs the explicit reviewed flag before any data leaves local memory.",
      };
  }
  if (kind === "importcsv") {
    if (typeof options.csv !== "string" || !options.csv.trim())
      return { allowed: false, reason: "Reviewed csv content is required in options." };
    if (options.name !== undefined && !isnonempty(options.name))
      return { allowed: false, reason: "The reviewed dataset name must be a non-empty string." };
    if (options.mapping !== undefined) {
      const mapping = options.mapping;
      if (
        !mapping ||
        typeof mapping !== "object" ||
        Array.isArray(mapping) ||
        !Object.values(mapping).every((item) => typeof item === "string")
      )
        return { allowed: false, reason: "The reviewed csv column mapping must be an object of string values." };
    }
  }
  if (kind === "looprows") {
    if (!isnonempty(options.dataset))
      return { allowed: false, reason: "A reviewed dataset id is required in options." };
    if (options.variable !== undefined && !isnonempty(options.variable))
      return { allowed: false, reason: "The reviewed row variable name must be a non-empty string." };
    const inner = validateinnerstep(options, origin);
    if (!inner.allowed) return inner;
  }
  if (kind === "transformvalues") {
    if (!isnonempty(options.dataset))
      return { allowed: false, reason: "A reviewed dataset id is required in options." };
    const rules = options.rules;
    if (!Array.isArray(rules) || rules.length === 0)
      return { allowed: false, reason: "A reviewed non-empty list of transform rules is required in options." };
    for (const item of rules) {
      const rulecheck = validatetransformrule(item);
      if (!rulecheck.allowed) return rulecheck;
    }
  }
  if (kind === "deduperows") {
    if (!isnonempty(options.dataset))
      return { allowed: false, reason: "A reviewed dataset id is required in options." };
    const keys = options.keys;
    if (!Array.isArray(keys) || keys.length === 0 || !keys.every((key) => isnonempty(key)))
      return { allowed: false, reason: "A reviewed non-empty list of dedupe column keys is required in options." };
  }
  if (kind === "mergepages") {
    const listcheck = validatedatasetids(options, "datasets");
    if (!listcheck.allowed) return listcheck;
  }
  if (kind === "stamplerows") {
    if (!isnonempty(options.dataset))
      return { allowed: false, reason: "A reviewed dataset id is required in options." };
    if (options.url !== undefined && !ishttpsurl(options.url))
      return { allowed: false, reason: "The reviewed source url must use HTTPS." };
  }
  if (kind === "previewgrid") {
    if (!isnonempty(options.dataset))
      return { allowed: false, reason: "A reviewed dataset id is required in options." };
    if (
      options.sample !== undefined &&
      (typeof options.sample !== "number" || !Number.isInteger(options.sample) || options.sample < 1)
    )
      return {
        allowed: false,
        reason: "The reviewed sample row count must be a positive integer with no code ceiling.",
      };
  }
  if (kind === "resumeextract" && !isnonempty(options.session))
    return { allowed: false, reason: "A reviewed extract session id is required in options." };
  if (kind === "logprovenance" && !isnonempty(options.artifact))
    return { allowed: false, reason: "A reviewed artifact id or name is required in options." };
  return { allowed: true };
}

/** Validates a reviewed batch download specification: a non-empty HTTPS url list, an optional filename rule and an optional completion criterion. */
export function validatedownloadspec(value: unknown): policyevaluation {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return { allowed: false, reason: "A reviewed downloadspec with a url list is required in options." };
  const spec = value as Record<string, unknown>;
  if (!Array.isArray(spec.urls) || spec.urls.length === 0 || !spec.urls.every((url) => ishttpsurl(url)))
    return { allowed: false, reason: "The reviewed downloadspec needs a non-empty list of HTTPS urls." };
  if (spec.filename !== undefined && !isnonempty(spec.filename))
    return { allowed: false, reason: "The reviewed downloadspec filename rule must be a non-empty string." };
  if (spec.complete !== undefined && spec.complete !== "size" && spec.complete !== "checksum")
    return { allowed: false, reason: "The reviewed downloadspec completion criterion must be size or checksum." };
  return { allowed: true };
}

/** Validates a reviewed mime interception filter: include and exclude patterns plus the deny default for unlisted mime types. */
export function validatemimefilter(value: unknown): policyevaluation {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return {
      allowed: false,
      reason: "A reviewed mimefilter with include and exclude patterns is required in options.",
    };
  const filter = value as Record<string, unknown>;
  if (
    !Array.isArray(filter.include) ||
    filter.include.length === 0 ||
    !filter.include.every((pattern) => isnonempty(pattern))
  )
    return { allowed: false, reason: "The reviewed mimefilter needs a non-empty list of include patterns." };
  if (
    filter.exclude !== undefined &&
    (!Array.isArray(filter.exclude) || !filter.exclude.every((pattern) => isnonempty(pattern)))
  )
    return { allowed: false, reason: "The reviewed mimefilter exclude patterns must be a list of non-empty strings." };
  if (filter.default !== "deny" && filter.default !== "allow")
    return {
      allowed: false,
      reason: "The reviewed mimefilter needs the deny or allow default for unlisted mime types.",
    };
  return { allowed: true };
}

/** Validates one reviewed cleanup rule: a positive age window with no code ceiling, an artifact kind and a keep policy. */
export function validatecleanuprule(value: unknown): policyevaluation {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return { allowed: false, reason: "A reviewed cleanuprule with an age, a kind and a keep policy is required." };
  const rule = value as Record<string, unknown>;
  if (typeof rule.age !== "number" || !Number.isFinite(rule.age) || rule.age <= 0)
    return {
      allowed: false,
      reason: "The reviewed cleanup age window must be a positive number of milliseconds with no code ceiling.",
    };
  if (!isnonempty(rule.kind))
    return {
      allowed: false,
      reason: "The reviewed cleanup rule needs a non-empty artifact kind, or any to match every kind.",
    };
  if (rule.keep !== "none" && rule.keep !== "latest" && rule.keep !== "all")
    return { allowed: false, reason: "The reviewed cleanup keep policy must be none, latest or all." };
  return { allowed: true };
}

/** Validates the reviewed files, clipboard and downloads parameter grammar; batch sizes, concurrent windows and cleanup ages stay user configured with no code ceilings. */
function validatefilesgrammar(step: toolstep, options: Record<string, unknown>): policyevaluation {
  const kind = step.kind;
  if (kind === "batchdownload") {
    const speccheck = validatedownloadspec(options.downloadspec);
    if (!speccheck.allowed) return speccheck;
    if (
      options.concurrent !== undefined &&
      (typeof options.concurrent !== "number" || !Number.isInteger(options.concurrent) || options.concurrent < 1)
    )
      return {
        allowed: false,
        reason: "The reviewed concurrent download window must be a positive integer with no code ceiling.",
      };
  }
  if (
    kind === "pausedownload" ||
    kind === "resumedownload" ||
    kind === "verifydownload" ||
    kind === "quarantinedownload" ||
    kind === "scanvirus"
  ) {
    if (!isnonempty(step.value))
      return { allowed: false, reason: "A reviewed download or quarantine reference is required." };
    if (kind === "verifydownload") {
      if (options.checksum !== undefined && !isnonempty(options.checksum))
        return { allowed: false, reason: "The reviewed expected checksum must be a non-empty string." };
      if (
        options.bytes !== undefined &&
        (typeof options.bytes !== "number" || !Number.isFinite(options.bytes) || options.bytes < 0)
      )
        return { allowed: false, reason: "The reviewed expected size must be zero or a positive number of bytes." };
    }
    if (kind === "scanvirus" && options.scanner !== undefined && !isnonempty(options.scanner))
      return { allowed: false, reason: "The reviewed scanner name must be a non-empty string." };
    if (kind === "quarantinedownload" && options.reason !== undefined && !isnonempty(options.reason))
      return { allowed: false, reason: "The reviewed quarantine reason must be a non-empty string." };
  }
  if (kind === "interceptmime") {
    const filtercheck = validatemimefilter(options.mimefilter);
    if (!filtercheck.allowed) return filtercheck;
  }
  if (kind === "readclipboard") {
    if (!isnonempty(options.consentref))
      return {
        allowed: false,
        reason: "A clipboard read requires a reviewed consent ref of an approved consent prompt in options.",
      };
    if (options.prompt !== undefined && !isnonempty(options.prompt))
      return { allowed: false, reason: "The reviewed clipboard consent prompt must be a non-empty string." };
  }
  if (kind === "exportnetlog" && options.stepid !== undefined && !isnonempty(options.stepid))
    return { allowed: false, reason: "The reviewed netlog step filter must be a non-empty step id." };
  if (kind === "namecaptures") {
    if (!isnonempty(options.task))
      return { allowed: false, reason: "A reviewed task id is required in options for capture naming." };
    if (
      options.steps !== undefined &&
      (!Array.isArray(options.steps) || options.steps.length === 0 || !options.steps.every((item) => isnonempty(item)))
    )
      return {
        allowed: false,
        reason: "The reviewed capture steps must be a non-empty list of step ids when present.",
      };
    if (options.extension !== undefined && !isnonempty(options.extension))
      return { allowed: false, reason: "The reviewed capture extension must be a non-empty string." };
  }
  if (kind === "cleanupartifacts" && options.rules !== undefined) {
    const rules = options.rules;
    if (!Array.isArray(rules) || rules.length === 0)
      return { allowed: false, reason: "The reviewed cleanup rules must be a non-empty list when present." };
    for (const item of rules) {
      const rulecheck = validatecleanuprule(item);
      if (!rulecheck.allowed) return rulecheck;
    }
  }
  return { allowed: true };
}

/** Requires an approved consent prompt before any clipboard read; every read consumes its own prompt. */
export function clipboardconsentgranted(step: toolstep): policyevaluation {
  let options: Record<string, unknown> = {};
  try {
    options = parseoptions(step);
  } catch {
    options = {};
  }
  const consentref = options.consentref;
  if (typeof consentref !== "string" || !consentref.trim())
    return { allowed: false, reason: "A clipboard read requires a reviewed consent ref in options." };
  return { allowed: true };
}

/** Refuses to release any quarantined file before a clean scan verdict exists. */
export function quarantinereleasegranted(entry: quarantineentry): policyevaluation {
  if (entry.scan !== "clean")
    return {
      allowed: false,
      reason: `The quarantined file ${entry.path} cannot leave quarantine with the ${entry.scan} scan verdict; only a clean verdict releases it.`,
    };
  return { allowed: true };
}

/** Refuses downloads and download interception that fall outside the session origin grants. */
export function downloadgranted(session: agentsession | undefined, url: string): policyevaluation {
  let origin = "";
  try {
    origin = new URL(url).origin;
  } catch {
    return { allowed: false, reason: "The reviewed download URL is invalid." };
  }
  if (!origingranted(session, origin))
    return {
      allowed: false,
      reason: `The download from ${origin} leaves the session origin grants and needs a session grant first.`,
    };
  return { allowed: true };
}

/** Masks a clipboard payload for every log line; the full text never persists anywhere. */
export function maskclipboard(payload: string): string {
  return `[clipboard payload of ${payload.length} character${payload.length === 1 ? "" : "s"}]`;
}

/** Requires an asksubmit review step before every form submission step. */
export function submitreviewgranted(steps: toolstep[], submitid: string): policyevaluation {
  const position = steps.findIndex((candidate) => candidate.id === submitid);
  const asked = steps.some(
    (candidate, index) => candidate.kind === "asksubmit" && (position === -1 || index < position),
  );
  return asked
    ? { allowed: true }
    : { allowed: false, reason: "Form submission requires an asksubmit review step before it." };
}

/** Requires a reviewed consent ref before any password field is filled. */
export function passwordconsentgranted(step: toolstep): policyevaluation {
  let options: Record<string, unknown> = {};
  try {
    options = parseoptions(step);
  } catch {
    options = {};
  }
  const consentref = options.consentref;
  if (typeof consentref !== "string" || !consentref.trim())
    return { allowed: false, reason: "A password fill requires a reviewed consent ref in options." };
  return { allowed: true };
}

/** True when a numeric value passes the Luhn checksum used by card networks. */
function luhnvalid(digits: string): boolean {
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

/** Refuses generated values that look like real card numbers or personal identifiers; test prefixed card values stay allowed. */
export function generatedvalueallowed(value: string): policyevaluation {
  const compact = value.replace(/[\s-]/g, "");
  if (/^\d{13,19}$/.test(compact) && luhnvalid(compact) && !compact.startsWith("4111"))
    return {
      allowed: false,
      reason:
        "The generated value looks like a real card number and is refused; generated card values use the 4111 test prefix.",
    };
  if (/^\d{3}-\d{2}-\d{4}$/.test(value.trim()))
    return { allowed: false, reason: "The generated value looks like a personal identifier and is refused." };
  return { allowed: true };
}

/** Requires the origin grants of a saved profile to cover the origin before its values fill a page. */
export function profilegrantgranted(profile: formprofile, origin: string): policyevaluation {
  if (!profile.grants.includes(origin))
    return {
      allowed: false,
      reason: `The saved profile ${profile.name} is not granted to ${origin}; add the origin to the profile grants first.`,
    };
  return { allowed: true };
}

/** Restricts group and layout mutations to the active session: they refuse without a live session. */
export function layoutmutationgranted(session: agentsession | undefined, now: number): policyevaluation {
  if (!session || session.stoppedat || session.expiresat <= now)
    return { allowed: false, reason: "Group and layout mutations stay inside the active session." };
  return { allowed: true };
}

/** Requires explicit review before closing a window that holds more than one task tab. */
export function windowclosegate(tasktabcount: number, reviewed: boolean): policyevaluation {
  if (tasktabcount > 1 && !reviewed)
    return {
      allowed: false,
      reason: `The window holds ${tasktabcount} task tabs and needs explicit review before it closes.`,
    };
  return { allowed: true };
}

/** Reads the user configured concurrent task tab ceiling; an absent value never refuses a tab. */
export function tasktabceiling(settings: runsettings | undefined): number | undefined {
  const ceiling = settings?.tasktabceiling;
  return typeof ceiling === "number" && Number.isFinite(ceiling) && ceiling >= 0 ? ceiling : undefined;
}

/** Parses the reviewed wait duration of a wait step with no upper bound. */
export function waitduration(step: toolstep): number {
  const requested = step.value ? Number.parseInt(step.value, 10) : 250;
  if (!Number.isFinite(requested) || requested < 0)
    throw new Error("Wait duration must be zero or a positive number of milliseconds.");
  return requested;
}

function isnumericid(value: unknown): value is string {
  return typeof value === "string" && /^\d+$/.test(value);
}

function numericoption(options: Record<string, unknown>, key: string): boolean {
  return options[key] === undefined || (typeof options[key] === "number" && Number.isFinite(options[key] as number));
}

/** True when an optional numeric option is absent or a finite number of zero or more. */
function nonnegativeoption(options: Record<string, unknown>, key: string): boolean {
  return numericoption(options, key) && !(typeof options[key] === "number" && (options[key] as number) < 0);
}

function isnonempty(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function ispoint(value: unknown): boolean {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const point = value as Record<string, unknown>;
  return (
    typeof point.x === "number" && Number.isFinite(point.x) && typeof point.y === "number" && Number.isFinite(point.y)
  );
}

/** Grades a resolution match count: zero is absent, one is resolved and more than one is refused as ambiguous. */
export function resolutionverdict(count: number): "absent" | "resolved" | "ambiguous" {
  if (!Number.isFinite(count) || count <= 0) return "absent";
  return count === 1 ? "resolved" : "ambiguous";
}

/** Validates the reviewed targetref grammar of every resolution mode and rejects empty references. */
export function validatetargetref(reference: unknown): policyevaluation {
  if (!reference || typeof reference !== "object" || Array.isArray(reference))
    return { allowed: false, reason: "The reviewed target reference must be an object." };
  const ref = reference as Record<string, unknown>;
  if (ref.mode === "selector")
    return isnonempty(ref.selector)
      ? { allowed: true }
      : { allowed: false, reason: "The selector target reference needs a non-empty selector." };
  if (ref.mode === "text")
    return isnonempty(ref.text)
      ? { allowed: true }
      : { allowed: false, reason: "The text target reference needs non-empty text." };
  if (ref.mode === "aria") {
    if (!isnonempty(ref.role)) return { allowed: false, reason: "The aria target reference needs a non-empty role." };
    return isnonempty(ref.name)
      ? { allowed: true }
      : { allowed: false, reason: "The aria target reference needs a non-empty name." };
  }
  if (ref.mode === "name")
    return isnonempty(ref.name)
      ? { allowed: true }
      : { allowed: false, reason: "The name target reference needs a non-empty name." };
  if (ref.mode === "xpath")
    return isnonempty(ref.xpath)
      ? { allowed: true }
      : { allowed: false, reason: "The xpath target reference needs a non-empty expression." };
  if (ref.mode === "index") {
    const index = ref.index;
    return typeof index === "number" && Number.isInteger(index) && index >= 1
      ? { allowed: true }
      : { allowed: false, reason: "The index target reference needs a positive integer map number." };
  }
  if (ref.mode === "point") {
    const pointok =
      typeof ref.x === "number" && Number.isFinite(ref.x) && typeof ref.y === "number" && Number.isFinite(ref.y);
    return pointok
      ? { allowed: true }
      : { allowed: false, reason: "The point target reference needs numeric x and y coordinates." };
  }
  return {
    allowed: false,
    reason: "The target reference mode must be selector, text, aria, name, xpath, index or point.",
  };
}

/** True when the session origin grants cover the given origin; a session without grants only allows its own origin. */
export function origingranted(session: agentsession | undefined, origin: string): boolean {
  if (!session) return false;
  const grants = session.grants ?? [session.origin];
  return grants.includes(origin);
}

/** Decides whether an unreviewed origin may open: the session grants cover it or a safe checksafe verdict vouches for it. */
export function originverified(url: string, grants: string[], verdicts: safetyverdict[]): policyevaluation {
  let origin = "";
  try {
    origin = new URL(url).origin;
  } catch {
    return { allowed: false, reason: "The reviewed navigation URL is invalid." };
  }
  if (grants.includes(origin)) return { allowed: true };
  const covered = verdicts.find(
    (verdict) => verdict.safe && (verdict.url === url || safeorigin(verdict.url) === origin),
  );
  if (covered) return { allowed: true };
  return {
    allowed: false,
    reason: `The origin ${origin} is outside the session grants and has no safe checksafe verdict; run checksafe and review it first.`,
  };
}

function safeorigin(url: string): string {
  try {
    return new URL(url).origin;
  } catch {
    return "";
  }
}

/** Refuses navigation that would move a granted task tab outside the session origin grants until the user consents. */
export function navigationgranted(session: agentsession | undefined, url: string): policyevaluation {
  let origin = "";
  try {
    origin = new URL(url).origin;
  } catch {
    return { allowed: false, reason: "The reviewed navigation URL is invalid." };
  }
  if (origingranted(session, origin)) return { allowed: true };
  return {
    allowed: false,
    reason: `Navigation to ${origin} leaves the task tab origins and needs the user consent of a session grant first.`,
  };
}

/** Validates the reviewed inner step of a retry or frame wrapper against the same rules as a top-level step. */
function validateinnerstep(options: Record<string, unknown>, origin: string): policyevaluation {
  const stepid = options.stepid;
  const kind = options.kind;
  if (isnonempty(stepid)) {
    if (kind !== undefined)
      return { allowed: false, reason: "The reviewed wrapper must reference a step id or an inline step, not both." };
    return { allowed: true };
  }
  if (typeof kind !== "string" || !kind.trim())
    return { allowed: false, reason: "A reviewed step id or inline step kind is required in options." };
  if (kind === "retryaction" || kind === "enterframe" || kind === "looprows")
    return { allowed: false, reason: "The reviewed inner step cannot be another wrapper kind." };
  if (!allowedactions.has(kind as actionkind))
    return { allowed: false, reason: "The reviewed inner step kind is unsupported." };
  const inneroptions = options.options;
  if (inneroptions !== undefined && (!inneroptions || typeof inneroptions !== "object" || Array.isArray(inneroptions)))
    return { allowed: false, reason: "The reviewed inner step options must be an object." };
  const inner: toolstep = {
    id: "inner",
    kind: kind as actionkind,
    summary: "Reviewed inner step.",
    risk: actionrisk(kind as actionkind),
    ...(isnonempty(options.target) ? { target: options.target } : {}),
    ...(isnonempty(options.value) ? { value: options.value } : {}),
    ...(inneroptions !== undefined ? { options: JSON.stringify(inneroptions) } : {}),
  };
  return validatestep(inner, origin);
}

/** True when a reviewed https url parses. */
function ishttpsurl(value: unknown): value is string {
  if (typeof value !== "string" || !value.trim()) return false;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

/** Validates the reviewed navtarget grammar of a navigation step. */
function validatenavtarget(value: unknown, kind: string): policyevaluation {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return { allowed: false, reason: "A reviewed navtarget with a url is required in options." };
  const target = value as Record<string, unknown>;
  if (!ishttpsurl(target.url)) return { allowed: false, reason: "The reviewed navtarget url must use HTTPS." };
  const container = target.container ?? "tab";
  if (container !== "current" && container !== "tab" && container !== "window" && container !== "private")
    return { allowed: false, reason: "The reviewed navtarget container must be current, tab, window or private." };
  if (target.position !== undefined && target.position !== "adjacent" && target.position !== "end")
    return { allowed: false, reason: "The reviewed navtarget position must be adjacent or end." };
  if (kind === "openprivate" && container !== "private")
    return { allowed: false, reason: "The openprivate step requires the private container." };
  if (kind === "openlink" && container === "private")
    return { allowed: false, reason: "The openlink step cannot open the private container; use openprivate." };
  return { allowed: true };
}

/** Validates the reviewed waitprofile grammar with its load signals, thresholds and per origin overrides. */
function validatewaitprofile(value: unknown): policyevaluation {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return { allowed: false, reason: "A reviewed waitprofile with load signals is required in options." };
  const profile = value as Record<string, unknown>;
  if (
    !Array.isArray(profile.signals) ||
    profile.signals.length === 0 ||
    !profile.signals.every((signal) => isnonempty(signal))
  )
    return { allowed: false, reason: "The reviewed waitprofile needs a non-empty list of load signals." };
  if (!nonnegativeoption(profile, "idle"))
    return {
      allowed: false,
      reason: "The reviewed waitprofile idle threshold must be zero or a positive number of milliseconds.",
    };
  if (!nonnegativeoption(profile, "timeout"))
    return {
      allowed: false,
      reason: "The reviewed waitprofile timeout must be zero or a positive number of milliseconds.",
    };
  if (profile.overrides !== undefined) {
    if (!Array.isArray(profile.overrides) || profile.overrides.length === 0)
      return { allowed: false, reason: "The reviewed waitprofile overrides must be a non-empty list when present." };
    for (const entry of profile.overrides) {
      if (!entry || typeof entry !== "object" || Array.isArray(entry))
        return { allowed: false, reason: "Every reviewed waitprofile override must be an object with an origin." };
      const override = entry as Record<string, unknown>;
      if (!ishttpsurl(override.origin))
        return { allowed: false, reason: "Every reviewed waitprofile override origin must use HTTPS." };
      if (
        override.signals !== undefined &&
        (!Array.isArray(override.signals) || !override.signals.every((signal) => isnonempty(signal)))
      )
        return {
          allowed: false,
          reason: "The reviewed waitprofile override signals must be a list of non-empty strings.",
        };
      if (!nonnegativeoption(override, "idle") || !nonnegativeoption(override, "timeout"))
        return {
          allowed: false,
          reason: "The reviewed waitprofile override thresholds must be zero or positive numbers.",
        };
    }
  }
  return { allowed: true };
}

/** Validates the reviewed urlpattern grammar with its match mode plus query and fragment parts. */
export function validateurlpattern(value: unknown): policyevaluation {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return { allowed: false, reason: "A reviewed urlpattern is required in options." };
  const pattern = value as Record<string, unknown>;
  if (pattern.mode !== "exact" && pattern.mode !== "prefix" && pattern.mode !== "host" && pattern.mode !== "pattern")
    return { allowed: false, reason: "The reviewed urlpattern mode must be exact, prefix, host or pattern." };
  if (!ishttpsurl(pattern.url)) return { allowed: false, reason: "The reviewed urlpattern url must use HTTPS." };
  if (pattern.query !== undefined) {
    if (!pattern.query || typeof pattern.query !== "object" || Array.isArray(pattern.query))
      return {
        allowed: false,
        reason: "The reviewed urlpattern query part must be an object of parameter names and values.",
      };
    for (const item of Object.values(pattern.query))
      if (typeof item !== "string")
        return { allowed: false, reason: "The reviewed urlpattern query values must be strings." };
  }
  if (pattern.fragment !== undefined && !isnonempty(pattern.fragment))
    return { allowed: false, reason: "The reviewed urlpattern fragment must be a non-empty string." };
  return { allowed: true };
}

/** Validates a reviewed non-empty list of HTTPS urls in options. */
function validateurllist(options: Record<string, unknown>, key: string): policyevaluation {
  const urls = options[key];
  if (!Array.isArray(urls) || urls.length === 0 || !urls.every((url) => ishttpsurl(url)))
    return { allowed: false, reason: `A reviewed non-empty list of HTTPS urls is required in options as ${key}.` };
  return { allowed: true };
}

/** Validates the reviewed ratelimit grammar of a navrate step; the window and ceiling stay user configured with no hardcoded cap. */
function validateratelimit(value: unknown): policyevaluation {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return { allowed: false, reason: "A reviewed ratelimit with a window and a ceiling is required in options." };
  const limit = value as Record<string, unknown>;
  if (limit.domain !== undefined && !isnonempty(limit.domain))
    return { allowed: false, reason: "The reviewed ratelimit domain must be a non-empty string." };
  if (typeof limit.window !== "number" || !Number.isFinite(limit.window) || limit.window <= 0)
    return {
      allowed: false,
      reason: "The reviewed ratelimit window must be a positive number of milliseconds with no code ceiling.",
    };
  if (typeof limit.ceiling !== "number" || !Number.isInteger(limit.ceiling) || limit.ceiling < 1)
    return {
      allowed: false,
      reason: "The reviewed ratelimit ceiling must be a positive integer with no code ceiling.",
    };
  return { allowed: true };
}

/** Validates the reviewed tabquery grammar with url, title, id and pattern matchers; at least one matcher is required. */
export function validatetabquery(value: unknown): policyevaluation {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return { allowed: false, reason: "A reviewed tabquery with at least one matcher is required in options." };
  const query = value as Record<string, unknown>;
  const hasmatcher =
    query.url !== undefined || query.title !== undefined || query.id !== undefined || query.pattern !== undefined;
  if (!hasmatcher)
    return { allowed: false, reason: "The reviewed tabquery needs a url, title, id or pattern matcher." };
  if (query.url !== undefined && !isnonempty(query.url))
    return { allowed: false, reason: "The reviewed tabquery url matcher must be a non-empty string." };
  if (query.title !== undefined && !isnonempty(query.title))
    return { allowed: false, reason: "The reviewed tabquery title matcher must be a non-empty string." };
  if (query.pattern !== undefined && !isnonempty(query.pattern))
    return { allowed: false, reason: "The reviewed tabquery pattern matcher must be a non-empty string." };
  if (query.id !== undefined && (typeof query.id !== "number" || !Number.isInteger(query.id) || query.id < 0))
    return { allowed: false, reason: "The reviewed tabquery id matcher must be a non-negative integer tab id." };
  return { allowed: true };
}

/** Validates a reviewed group color choice against the Chromium tab group palette. */
function validategroupcolor(value: unknown): boolean {
  return typeof value === "string" && (groupcolors as string[]).includes(value);
}

/** Validates a reviewed list of numeric browser ids in options. */
function validateidlist(options: Record<string, unknown>, key: string): boolean {
  const ids = options[key];
  return (
    Array.isArray(ids) && ids.length > 0 && ids.every((id) => typeof id === "number" && Number.isInteger(id) && id >= 0)
  );
}

/** Validates the reviewed tab and window parameter grammar of the tabs and windows command family. */
function validatetabsgrammar(step: toolstep, options: Record<string, unknown>): policyevaluation {
  const kind = step.kind;
  if (kind === "querytabs" || kind === "closepattern") {
    const querycheck = validatetabquery(options.tabquery);
    if (!querycheck.allowed) return querycheck;
    if (kind === "closepattern" && options.reviewed !== true)
      return { allowed: false, reason: "The close pattern needs the explicit reviewed flag before any tab closes." };
  }
  if (
    kind === "duplicatetab" ||
    kind === "pintab" ||
    kind === "mutetab" ||
    kind === "movetab" ||
    kind === "movetabwindow" ||
    kind === "badgetab" ||
    kind === "attachmeta"
  ) {
    if (!isnumericid(step.value)) return { allowed: false, reason: "A numeric browser tab id is required." };
  }
  if (kind === "focuswindow" || kind === "maximizewindow" || kind === "minimizewindow" || kind === "restorewindow") {
    if (!isnumericid(step.value)) return { allowed: false, reason: "A numeric browser window id is required." };
  }
  if (kind === "pintab" && typeof options.pinned !== "boolean")
    return { allowed: false, reason: "A reviewed pinned flag is required in options." };
  if (kind === "mutetab" && typeof options.muted !== "boolean")
    return { allowed: false, reason: "A reviewed muted flag is required in options." };
  if (kind === "movetab") {
    if (typeof options.index !== "number" || !Number.isInteger(options.index) || options.index < 0)
      return { allowed: false, reason: "A reviewed non-negative target index is required in options." };
  }
  if (kind === "movetabwindow") {
    if (typeof options.windowid !== "number" || !Number.isInteger(options.windowid) || options.windowid < 0)
      return { allowed: false, reason: "A reviewed target window id is required in options." };
  }
  if (kind === "grouptabs") {
    const group = options.group;
    if (!group || typeof group !== "object" || Array.isArray(group))
      return { allowed: false, reason: "A reviewed group with a name is required in options." };
    const spec = group as Record<string, unknown>;
    if (!isnonempty(spec.name)) return { allowed: false, reason: "The reviewed group needs a non-empty name." };
    if (!validategroupcolor(spec.color))
      return { allowed: false, reason: "The reviewed group color must be a Chromium tab group color." };
    if (!validateidlist(spec, "tabids"))
      return { allowed: false, reason: "The reviewed group needs a non-empty list of member tab ids." };
  }
  if (kind === "colorgroup") {
    if (!isnonempty(options.name)) return { allowed: false, reason: "A reviewed group name is required in options." };
    if (!validategroupcolor(options.color))
      return { allowed: false, reason: "The reviewed group color must be a Chromium tab group color." };
  }
  if (kind === "collapsegroup") {
    if (!isnonempty(options.name)) return { allowed: false, reason: "A reviewed group name is required in options." };
    if (typeof options.collapsed !== "boolean")
      return { allowed: false, reason: "A reviewed collapsed flag is required in options." };
  }
  if (kind === "discardtab" || kind === "reloadtabs") {
    if (!isnumericid(step.value) && !validateidlist(options, "tabs"))
      return { allowed: false, reason: "A numeric tab id or a reviewed list of tab ids is required." };
  }
  if (kind === "zoomin" || kind === "zoomout") {
    if (
      options.step !== undefined &&
      (typeof options.step !== "number" || !Number.isFinite(options.step) || options.step <= 0)
    )
      return { allowed: false, reason: "The reviewed zoom step must be a positive number with no code ceiling." };
    if (step.value !== undefined && step.value !== "" && !isnumericid(step.value))
      return { allowed: false, reason: "The reviewed zoom target must be a numeric tab id." };
  }
  if (kind === "switchtab") {
    if (options.direction !== "next" && options.direction !== "previous")
      return { allowed: false, reason: "A reviewed switch direction of next or previous is required in options." };
  }
  if (kind === "restorewindow") {
    const bounds = options.bounds;
    if (bounds !== undefined) {
      if (!bounds || typeof bounds !== "object" || Array.isArray(bounds))
        return { allowed: false, reason: "The reviewed window bounds must be an object." };
      const shape = bounds as Record<string, unknown>;
      for (const field of ["left", "top", "width", "height"]) {
        if (typeof shape[field] !== "number" || !Number.isFinite(shape[field]))
          return { allowed: false, reason: "The reviewed window bounds need numeric left, top, width and height." };
      }
    }
  }
  if (kind === "scratchwindow") {
    if (step.value !== undefined && step.value !== "" && !ishttpsurl(step.value))
      return { allowed: false, reason: "The reviewed scratch window url must use HTTPS." };
  }
  if (kind === "incognitowindow" && !ishttpsurl(step.value))
    return { allowed: false, reason: "A reviewed HTTPS url is required to open an incognito window." };
  if (kind === "restoretab" && step.value !== undefined && step.value !== "" && !ishttpsurl(step.value))
    return { allowed: false, reason: "The reviewed restore url must use HTTPS." };
  if (kind === "savelayout" || kind === "restorelayout") {
    if (!isnonempty(options.name)) return { allowed: false, reason: "A reviewed layout name is required in options." };
  }
  if (kind === "badgetab") {
    if (!isnonempty(options.label)) return { allowed: false, reason: "A reviewed badge label is required in options." };
    if (options.taskid !== undefined && !isnonempty(options.taskid))
      return { allowed: false, reason: "The reviewed badge task id must be a non-empty string." };
  }
  if (kind === "attachmeta") {
    const labels = options.labels;
    const taskrefs = options.taskrefs;
    const haslabels = Array.isArray(labels) && labels.length > 0 && labels.every((label) => isnonempty(label));
    const hastaskrefs = Array.isArray(taskrefs) && taskrefs.length > 0 && taskrefs.every((ref) => isnonempty(ref));
    if (!haslabels && !hastaskrefs)
      return { allowed: false, reason: "Reviewed labels or task refs are required in options to attach metadata." };
    if (options.provenance !== undefined && !isnonempty(options.provenance))
      return { allowed: false, reason: "The reviewed provenance must be a non-empty string." };
  }
  if (kind === "reopenrun" && !isnonempty(options.run))
    return { allowed: false, reason: "A reviewed run id is required in options to reopen its tabs." };
  return { allowed: true };
}

/** True when the kind belongs to the media capture family of pdf documents, recordings, images, canvases, streams, assets, lapses, conversions and thumbnails. */
export function ismediakind(kind: actionkind): boolean {
  return mediaactions.has(kind);
}

/** True when the kind belongs to the network observation family of fetching, parsing and typed calls. */
export function ishttpkind(kind: actionkind): boolean {
  return httpactions.has(kind);
}

/** True when the kind belongs to the socket and stream family of channels, messages, subscriptions and poll loops. */
export function issocketkind(kind: actionkind): boolean {
  return socketactions.has(kind);
}

/** True when the kind belongs to the request observation family of watches, headers, bodies and page api discovery. */
export function isnetwatchkind(kind: actionkind): boolean {
  return netwatchactions.has(kind);
}

/** True when the kind belongs to the network control family of blocking, mocking, header rewriting, cookies, auth, api keys, proxy routing and uploads. */
export function iscontrolkind(kind: actionkind): boolean {
  return controlactions.has(kind);
}

/** Resolves the reviewed risk of one step: capturebodies grades sensitive when the reviewed mime list carries private payload types and extractapi grades sensitive when the replay verb mutates, while every other kind keeps its risk table grade. */
export function resolvedrisk(step: toolstep): "read" | "interaction" | "sensitive" {
  if (step.kind === "capturebodies") {
    let options: Record<string, unknown> = {};
    try {
      options = parseoptions(step);
    } catch {
      options = {};
    }
    const body = options.body;
    const mimes =
      body && typeof body === "object" && !Array.isArray(body) ? (body as Record<string, unknown>).mimes : undefined;
    if (Array.isArray(mimes) && mimes.some((mime) => typeof mime === "string" && privatemime(mime))) return "sensitive";
    return "interaction";
  }
  if (step.kind === "extractapi") {
    let options: Record<string, unknown> = {};
    try {
      options = parseoptions(step);
    } catch {
      options = {};
    }
    const replay = options.replay;
    const verb =
      replay && typeof replay === "object" && !Array.isArray(replay)
        ? (replay as Record<string, unknown>).verb
        : undefined;
    if (typeof verb === "string" && !["GET", "HEAD", "OPTIONS"].includes(verb.trim().toUpperCase())) return "sensitive";
    return "read";
  }
  return actionrisk(step.kind);
}

/** Restricts every outbound channel to a granted origin: wss websocket and https event stream urls map onto their https origin, carry no embedded credentials and stay inside the session origin grants. */
export function socketgate(session: agentsession | undefined, url: string): policyevaluation {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { allowed: false, reason: "The channel needs a valid url before it can be reviewed." };
  }
  if (parsed.protocol !== "wss:" && parsed.protocol !== "https:")
    return { allowed: false, reason: "Channels use wss websocket urls or https event stream urls only." };
  if (parsed.username || parsed.password)
    return { allowed: false, reason: "Channel credentials are not allowed in the url." };
  const origin = channelorigin(url);
  if (!origingranted(session, origin))
    return { allowed: false, reason: `The channel to ${origin} stays outside the session origin grants.` };
  return { allowed: true };
}

/** Requires the user granted request watching before any watchrequests step runs; the observation derives from the page timing buffers and the grant adds no manifest permission. */
export function watchgate(
  session: agentsession | undefined,
  settings: runsettings | undefined,
  now: number,
): policyevaluation {
  if (!session || session.stoppedat)
    return { allowed: false, reason: "No active browser session exists for the request watch." };
  if (session.expiresat <= now)
    return { allowed: false, reason: "The browser session has expired and cannot watch requests." };
  if (session.pausedat) return { allowed: false, reason: "The browser session is paused and cannot watch requests." };
  if (settings?.webrequestgrant !== true)
    return {
      allowed: false,
      reason:
        "Request watching needs the webrequest grant in the review panel first; the observation derives from the page timing buffers and adds no manifest permission.",
    };
  return { allowed: true };
}

/** Requires the host grant for every observed origin before header reads, body captures and endpoint replays touch an exchange. */
export function observedorigingranted(session: agentsession | undefined, url: string): policyevaluation {
  let origin = "";
  try {
    origin = new URL(url).origin;
  } catch {
    return { allowed: false, reason: "The observed exchange url does not parse for an origin check." };
  }
  if (!origingranted(session, origin))
    return {
      allowed: false,
      reason: `The observed origin ${origin} stays outside the session origin grants; grant it before reading headers, bodies or replays.`,
    };
  return { allowed: true };
}

/** Restricts every outbound request to a granted origin: the url must be a reviewed HTTPS url inside the session origin grants. */
export function origincheck(session: agentsession | undefined, url: string): policyevaluation {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { allowed: false, reason: "The outbound request needs a valid url before it can be reviewed." };
  }
  if (parsed.protocol !== "https:") return { allowed: false, reason: "Outbound requests use HTTPS urls only." };
  if (parsed.username || parsed.password)
    return { allowed: false, reason: "Endpoint credentials are not allowed in the url." };
  if (!origingranted(session, parsed.origin))
    return {
      allowed: false,
      reason: `The outbound request to ${parsed.origin} stays outside the session origin grants.`,
    };
  return { allowed: true };
}

/** True when a header name carries credentials and therefore needs the explicit consent that names it. */
export function credentialheadername(name: string): boolean {
  return credentialheaders.has(name.trim().toLowerCase());
}

/** Requires a reviewed consent ref before any custom header leaves the extension; requests without custom headers need no prompt. */
export function fetchconsentrefgranted(step: toolstep): policyevaluation {
  let options: Record<string, unknown> = {};
  try {
    options = parseoptions(step);
  } catch {
    options = {};
  }
  const request = options.fetch;
  const headers =
    request && typeof request === "object" && !Array.isArray(request)
      ? (request as Record<string, unknown>).headers
      : undefined;
  const names =
    headers && typeof headers === "object" && !Array.isArray(headers)
      ? Object.keys(headers as Record<string, unknown>)
      : [];
  if (names.length === 0) return { allowed: true };
  const empty = names.some((name) => !name.trim());
  if (empty) return { allowed: false, reason: "Header allowlists with empty names are refused." };
  const credential = names.find((name) => credentialheadername(name));
  if (credential !== undefined && !isnonempty(options.consentref))
    return {
      allowed: false,
      reason: `The credential bearing header ${credential} needs the explicit reviewed consent that names it before it is sent.`,
    };
  if (!isnonempty(options.consentref))
    return {
      allowed: false,
      reason: `The ${names.length} reviewed custom header${names.length === 1 ? "" : "s"} need a reviewed consent ref in options before any send.`,
    };
  return { allowed: true };
}

/** True when one stored fetch consent still covers the origin and every header name inside its expiry window. */
export function fetchconsentcovers(
  consent: { origin: string; headers: Array<{ name: string }>; approved?: boolean; expiresat: number },
  origin: string,
  headernames: string[],
  now: number,
): boolean {
  if (consent.approved !== true) return false;
  if (consent.expiresat <= now) return false;
  if (consent.origin !== origin) return false;
  const covered = new Set(consent.headers.map((header) => header.name.trim().toLowerCase()));
  return headernames.every((name) => covered.has(name.trim().toLowerCase()));
}

/** True when the reviewed call mutates: rest verbs beyond get, head and options or a graphql mutation; mutating calls grade sensitive. */
export function mutationcallof(step: toolstep): boolean {
  let options: Record<string, unknown> = {};
  try {
    options = parseoptions(step);
  } catch {
    options = {};
  }
  if (step.kind === "callgraphql") {
    const request = options.graphql;
    return Boolean(
      request &&
        typeof request === "object" &&
        !Array.isArray(request) &&
        (request as Record<string, unknown>).operationkind === "mutation",
    );
  }
  if (step.kind === "callrest") {
    const method = typeof options.method === "string" ? options.method.trim().toUpperCase() : undefined;
    if (method !== undefined) return !["GET", "HEAD", "OPTIONS"].includes(method);
  }
  return false;
}

/** Keeps the reviewed fetch waits inside the reviewed wait budget: the worst case of every timeout plus every backoff wait must fit; every bound itself stays a user choice with no code ceiling. */
export function fetchbudgetallowed(
  timeout: number | undefined,
  retries: number | undefined,
  backoff: number | undefined,
  wait: number | undefined,
): policyevaluation {
  for (const [label, value] of [
    ["timeout", timeout],
    ["retries", retries],
    ["backoff", backoff],
  ] as Array<[string, number | undefined]>) {
    if (value !== undefined && (typeof value !== "number" || !Number.isFinite(value) || value < 0))
      return {
        allowed: false,
        reason: `The reviewed fetch ${label} must be zero or a positive number with no code ceiling.`,
      };
  }
  if (wait !== undefined && (typeof wait !== "number" || !Number.isFinite(wait) || wait < 0))
    return {
      allowed: false,
      reason: "The reviewed fetch wait budget must be zero or a positive number of milliseconds.",
    };
  if (wait === undefined || timeout === undefined) return { allowed: true };
  const attempts = Math.max(1, Math.floor(retries ?? 0) + 1);
  const waits = ((backoff ?? 0) * (attempts * (attempts - 1))) / 2;
  const worstcase = timeout * attempts + waits;
  if (worstcase > wait)
    return {
      allowed: false,
      reason: `The fetch worst case of ${worstcase} milliseconds exceeds the reviewed wait budget of ${wait} milliseconds; review a wider budget or fewer retries.`,
    };
  return { allowed: true };
}

/** Resolves the outbound url of an http step at review time: the fetch request url of a fetchurl step and nothing for typed calls whose endpoints resolve at execution. */
export function outboundtarget(step: toolstep): string | undefined {
  let options: Record<string, unknown> = {};
  try {
    options = parseoptions(step);
  } catch {
    options = {};
  }
  const request = options.fetch;
  if (request && typeof request === "object" && !Array.isArray(request)) {
    const url = (request as Record<string, unknown>).url;
    if (typeof url === "string" && url.trim()) return url.trim();
  }
  return undefined;
}

/** Validates one reviewed typed endpoint definition: name, method, HTTPS url template with variables, header allowlist with non-empty names and a payload schema with kinds, required flags and defaults. */
export function validateendpointrecord(value: unknown): policyevaluation {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return { allowed: false, reason: "A reviewed endpoint record is required." };
  const record = value as Record<string, unknown>;
  if (!isnonempty(record.name))
    return { allowed: false, reason: "The endpoint record needs a reviewed non-empty name." };
  if (!isnonempty(record.method)) return { allowed: false, reason: "The endpoint record needs a reviewed method." };
  if (!ishttpsurl(record.url))
    return { allowed: false, reason: "The endpoint record url template must be an HTTPS url." };
  if (record.headers !== undefined) {
    if (!record.headers || typeof record.headers !== "object" || Array.isArray(record.headers))
      return { allowed: false, reason: "The endpoint header allowlist must be an object of reviewed headers." };
    for (const name of Object.keys(record.headers as Record<string, unknown>)) {
      if (!name.trim()) return { allowed: false, reason: "Endpoint header allowlists with empty names are refused." };
      const headervalue = (record.headers as Record<string, unknown>)[name];
      if (typeof headervalue !== "string")
        return { allowed: false, reason: `The endpoint header ${name} needs a reviewed string value.` };
    }
  }
  const schema = record.schema;
  if (!schema || typeof schema !== "object" || Array.isArray(schema))
    return {
      allowed: false,
      reason:
        "Every typed endpoint call needs a reviewed payload schema; endpoint records without schemas are refused.",
    };
  const fields = (schema as Record<string, unknown>).fields;
  if (!Array.isArray(fields) || fields.length === 0)
    return { allowed: false, reason: "The endpoint payload schema needs a non-empty field list." };
  for (const item of fields) {
    if (!item || typeof item !== "object" || Array.isArray(item))
      return { allowed: false, reason: "Every payload schema field must be an object." };
    const field = item as Record<string, unknown>;
    if (!isnonempty(field.name))
      return { allowed: false, reason: "Every payload schema field needs a non-empty name." };
    if (field.kind !== "string" && field.kind !== "number" && field.kind !== "boolean")
      return {
        allowed: false,
        reason: `The payload schema field ${field.name} must be a string, number or boolean kind.`,
      };
    if (field.required !== undefined && typeof field.required !== "boolean")
      return { allowed: false, reason: `The payload schema field ${field.name} required flag must be a boolean.` };
    if (
      field.default !== undefined &&
      typeof field.default !== "string" &&
      typeof field.default !== "number" &&
      typeof field.default !== "boolean"
    )
      return { allowed: false, reason: `The payload schema field ${field.name} default must match its kind.` };
  }
  return { allowed: true };
}

/** Validates one dotted json path against the path grammar: non-empty segments of names, digits, underscores or hyphens. */
function validpath(path: string): boolean {
  return path.split(".").every((segment) => /^[A-Za-z0-9_-]+$/.test(segment));
}

/** Validates the reviewed network observation parameter grammar of the 1.1.42 family: fetch requests with header allowlists, fetch policies with timeout, retries, backoff and follow limit, stream budgets, dotted json paths, html queries, graphql operations and typed endpoint references; every bound stays a user choice with no code ceiling. */
function validatehttpgrammar(step: toolstep, options: Record<string, unknown>): policyevaluation {
  const kind = step.kind;
  if (kind === "fetchurl") {
    const request = options.fetch;
    if (!request || typeof request !== "object" || Array.isArray(request))
      return { allowed: false, reason: "A reviewed fetch request with a url is required in options.fetch." };
    const fetchrequest = request as Record<string, unknown>;
    if (typeof fetchrequest.url !== "string" || !fetchrequest.url.trim())
      return { allowed: false, reason: "The reviewed fetch request needs a non-empty url." };
    if (
      fetchrequest.method !== undefined &&
      (typeof fetchrequest.method !== "string" ||
        !["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"].includes(
          fetchrequest.method.trim().toUpperCase(),
        ))
    )
      return { allowed: false, reason: "The reviewed fetch method must be a known HTTP verb." };
    if (fetchrequest.headers !== undefined) {
      if (!fetchrequest.headers || typeof fetchrequest.headers !== "object" || Array.isArray(fetchrequest.headers))
        return { allowed: false, reason: "The reviewed header allowlist must be an object of custom headers." };
      for (const name of Object.keys(fetchrequest.headers as Record<string, unknown>)) {
        if (!name.trim()) return { allowed: false, reason: "Header allowlists with empty names are refused." };
        if (typeof (fetchrequest.headers as Record<string, unknown>)[name] !== "string")
          return { allowed: false, reason: `The reviewed header ${name} needs a string value.` };
      }
    }
    if (fetchrequest.body !== undefined && typeof fetchrequest.body !== "string")
      return { allowed: false, reason: "The reviewed fetch body must be a string." };
    if (
      fetchrequest.mode !== undefined &&
      fetchrequest.mode !== "cors" &&
      fetchrequest.mode !== "no-cors" &&
      fetchrequest.mode !== "same-origin"
    )
      return { allowed: false, reason: "The reviewed fetch mode must be cors, no-cors or same-origin." };
    const consentgate = fetchconsentrefgranted(step);
    if (!consentgate.allowed) return consentgate;
    const policycheck = validatefetchoptions(options.fetchoptions);
    if (!policycheck.allowed) return policycheck;
    const fetchpolicy = fetchoptionsvalues(options.fetchoptions);
    const budget = fetchbudgetallowed(
      fetchpolicy.timeout,
      fetchpolicy.retries,
      fetchpolicy.backoff,
      fetchnumeric(options, "wait"),
    );
    if (!budget.allowed) return budget;
    if (options.stream !== undefined) {
      if (!options.stream || typeof options.stream !== "object" || Array.isArray(options.stream))
        return { allowed: false, reason: "The reviewed stream window must be an object with an optional byte budget." };
      const streambudget = (options.stream as Record<string, unknown>).budget;
      if (
        streambudget !== undefined &&
        (typeof streambudget !== "number" || !Number.isFinite(streambudget) || streambudget < 0)
      )
        return {
          allowed: false,
          reason: "The reviewed stream byte budget must be zero or a positive number of bytes with no code ceiling.",
        };
    }
  }
  if (kind === "parsejson") {
    if (!isnonempty(options.call))
      return {
        allowed: false,
        reason: "A reviewed stored call id is required in options.call before the body parses.",
      };
    const fields = options.fields;
    if (!Array.isArray(fields) || fields.length === 0)
      return { allowed: false, reason: "A reviewed non-empty list of json path rules is required in options.fields." };
    for (const item of fields) {
      if (!item || typeof item !== "object" || Array.isArray(item))
        return { allowed: false, reason: "Every json path rule must be an object." };
      const rule = item as Record<string, unknown>;
      if (!isnonempty(rule.name))
        return { allowed: false, reason: "Every json path rule needs a non-empty field name." };
      if (typeof rule.path !== "string" || !rule.path.trim() || !validpath(rule.path.trim()))
        return { allowed: false, reason: `The json path of ${rule.name} must be a dotted path of non-empty segments.` };
      if (
        rule.kind !== undefined &&
        rule.kind !== "text" &&
        rule.kind !== "number" &&
        rule.kind !== "boolean" &&
        rule.kind !== "json"
      )
        return { allowed: false, reason: `The json path kind of ${rule.name} must be text, number, boolean or json.` };
    }
  }
  if (kind === "parsehtml") {
    if (!isnonempty(options.call))
      return {
        allowed: false,
        reason: "A reviewed stored call id is required in options.call before the markup parses.",
      };
    const queries = options.queries;
    if (!Array.isArray(queries) || queries.length === 0)
      return { allowed: false, reason: "A reviewed non-empty list of html queries is required in options.queries." };
    for (const item of queries) {
      if (!item || typeof item !== "object" || Array.isArray(item))
        return { allowed: false, reason: "Every html query must be an object." };
      const query = item as Record<string, unknown>;
      if (!isnonempty(query.selector))
        return { allowed: false, reason: "Every html query needs a selector from the reviewed selector grammar." };
      if (query.attribute !== undefined && !isnonempty(query.attribute))
        return { allowed: false, reason: "The reviewed html query attribute must be a non-empty attribute name." };
      if (query.multi !== undefined && typeof query.multi !== "boolean")
        return { allowed: false, reason: "The reviewed html query multi flag must be a boolean." };
    }
  }
  if (kind === "callrest" || kind === "callgraphql") {
    if (!isnonempty(options.endpoint))
      return { allowed: false, reason: "A reviewed typed endpoint name is required in options.endpoint." };
    if (kind === "callrest") {
      if (
        options.payload !== undefined &&
        (!options.payload || typeof options.payload !== "object" || Array.isArray(options.payload))
      )
        return { allowed: false, reason: "The reviewed rest payload must be an object of reviewed values." };
      if (
        options.method !== undefined &&
        (typeof options.method !== "string" ||
          !["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"].includes(options.method.trim().toUpperCase()))
      )
        return { allowed: false, reason: "The reviewed endpoint method override must be a known HTTP verb." };
      if (
        options.success !== undefined &&
        (!Array.isArray(options.success) ||
          !options.success.every((code) => typeof code === "number" && Number.isInteger(code)))
      )
        return { allowed: false, reason: "The reviewed success status list must be a list of integer status codes." };
    }
    if (kind === "callgraphql") {
      const request = options.graphql;
      if (!request || typeof request !== "object" || Array.isArray(request))
        return {
          allowed: false,
          reason: "A reviewed graphql request with an operation is required in options.graphql.",
        };
      const graphql = request as Record<string, unknown>;
      if (typeof graphql.query !== "string" || !graphql.query.trim())
        return { allowed: false, reason: "The reviewed graphql operation text must be a non-empty string." };
      if (graphql.operationkind !== "query" && graphql.operationkind !== "mutation")
        return {
          allowed: false,
          reason: "The reviewed graphql operation kind must be query or mutation; unknown operation kinds are refused.",
        };
      if (
        graphql.variables !== undefined &&
        (!graphql.variables || typeof graphql.variables !== "object" || Array.isArray(graphql.variables))
      )
        return { allowed: false, reason: "The reviewed graphql variables must be an object of reviewed values." };
      if (graphql.operationname !== undefined && !isnonempty(graphql.operationname))
        return { allowed: false, reason: "The reviewed graphql operation name must be a non-empty string." };
    }
    if (
      options.apikeys !== undefined &&
      (!Array.isArray(options.apikeys) || !options.apikeys.every((name) => isnonempty(name)))
    )
      return {
        allowed: false,
        reason: "The reviewed api key reference list must be a list of non-empty stored names.",
      };
    const policycheck = validatefetchoptions(options.fetchoptions);
    if (!policycheck.allowed) return policycheck;
    const fetchpolicy = fetchoptionsvalues(options.fetchoptions);
    const budget = fetchbudgetallowed(
      fetchpolicy.timeout,
      fetchpolicy.retries,
      fetchpolicy.backoff,
      fetchnumeric(options, "wait"),
    );
    if (!budget.allowed) return budget;
  }
  return { allowed: true };
}

/** Validates one reviewed fetch policy object: timeout, retries, backoff base and redirect follow limit stay user choices with no code ceiling. */
function validatefetchoptions(value: unknown): policyevaluation {
  if (value === undefined) return { allowed: true };
  if (!value || typeof value !== "object" || Array.isArray(value))
    return {
      allowed: false,
      reason: "The reviewed fetch options must be an object with timeout, retries, backoff and follow.",
    };
  const options = value as Record<string, unknown>;
  for (const key of ["timeout", "backoff"]) {
    if (
      options[key] !== undefined &&
      (typeof options[key] !== "number" || !Number.isFinite(options[key]) || options[key] < 0)
    )
      return {
        allowed: false,
        reason: `The reviewed fetch ${key} must be zero or a positive number with no code ceiling.`,
      };
  }
  for (const key of ["retries", "follow"]) {
    if (
      options[key] !== undefined &&
      (typeof options[key] !== "number" || !Number.isInteger(options[key]) || options[key] < 0)
    )
      return {
        allowed: false,
        reason: `The reviewed fetch ${key} must be zero or a positive integer with no code ceiling.`,
      };
  }
  return { allowed: true };
}

/** Reads the numeric fetch policy fields of one reviewed fetch options object. */
function fetchoptionsvalues(value: unknown): {
  timeout?: number | undefined;
  retries?: number | undefined;
  backoff?: number | undefined;
} {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const options = value as Record<string, unknown>;
  return {
    timeout: fetchnumeric(options, "timeout"),
    retries: fetchnumeric(options, "retries"),
    backoff: fetchnumeric(options, "backoff"),
  };
}

/** Reads one numeric fetch policy field from the step options. */
function fetchnumeric(options: Record<string, unknown>, key: string): number | undefined {
  const value = options[key];
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

/** True when the kind records user activity and needs the reviewed recording consent before it starts. */
export function isrecordingkind(kind: actionkind): boolean {
  return kind === "recordscreen" || kind === "captureaudio";
}

/** Validates the reviewed socket and stream parameter grammar of the 1.1.43 family with the api transport options of the 1.1.76 family: channel urls with protocols, reconnect budgets and backoff ceilings, multiplexed message payloads, message filters with dotted paths and match limits, event subscriptions with cancellation paths, long poll cursors with intervals kept inside the reviewed wait budget, the longpollrequest with its url, timeout and resume cursor and the graphql subscription with its query, variables and channel; every bound stays a user choice with no code ceiling. */
function validatesocketgrammar(step: toolstep, options: Record<string, unknown>): policyevaluation {
  const kind = step.kind;
  if (kind === "opensocket") {
    const channel = channeloptionsof(options.socket);
    if (!channel) return { allowed: false, reason: "A reviewed socket with a url is required in options.socket." };
    if (channel.options.reconnect !== undefined && !Number.isInteger(channel.options.reconnect))
      return {
        allowed: false,
        reason: "The reviewed socket reconnect budget must be an integer attempt count with no code ceiling.",
      };
    for (const label of ["backoff", "backoffceiling"] as const) {
      const value = channel.options[label];
      if (value !== undefined && (typeof value !== "number" || !Number.isFinite(value) || value < 0))
        return {
          allowed: false,
          reason: `The reviewed socket ${label} must be zero or a positive number of milliseconds with no code ceiling.`,
        };
    }
    if (
      channel.options.lifetime !== undefined &&
      (typeof channel.options.lifetime !== "number" ||
        !Number.isFinite(channel.options.lifetime) ||
        channel.options.lifetime <= 0)
    )
      return {
        allowed: false,
        reason: "The reviewed socket lifetime window must be a positive number of milliseconds.",
      };
    if (options.graphql !== undefined) {
      const subscription = graphqlsubscriptionof(options.graphql);
      if (!subscription)
        return {
          allowed: false,
          reason:
            "A reviewed graphql subscription with a query and its websocket channel is required in options.graphql.",
        };
      if (!isnonempty(subscription.channel))
        return {
          allowed: false,
          reason:
            "The graphql subscription names its websocket channel in options.graphql.channel; a subscription without its channel rides nothing.",
        };
    }
  }
  if (kind === "sendmessage") {
    const message = options.message;
    if (!message || typeof message !== "object" || Array.isArray(message))
      return {
        allowed: false,
        reason: "A reviewed message with a channel, stream and payload is required in options.message.",
      };
    const envelope = message as Record<string, unknown>;
    if (!isnonempty(envelope.channel))
      return { allowed: false, reason: "The reviewed message needs the open channel id in options.message.channel." };
    if (envelope.stream !== undefined && !isnonempty(envelope.stream))
      return { allowed: false, reason: "The reviewed message stream name must be a non-empty string." };
    if (typeof envelope.payload !== "string")
      return { allowed: false, reason: "The reviewed message payload must be a string." };
  }
  if (kind === "waitmessage") {
    if (options.filter !== undefined) {
      const filter = options.filter;
      if (!filter || typeof filter !== "object" || Array.isArray(filter))
        return { allowed: false, reason: "The reviewed message filter must be an object of stream, path and limit." };
      const reviewed = filter as Record<string, unknown>;
      if (reviewed.stream !== undefined && !isnonempty(reviewed.stream))
        return { allowed: false, reason: "The reviewed message filter stream name must be a non-empty string." };
      if (reviewed.path !== undefined && (typeof reviewed.path !== "string" || !validpath(reviewed.path.trim())))
        return {
          allowed: false,
          reason: "The reviewed message filter path must be a dotted path of non-empty segments.",
        };
      if (
        reviewed.limit !== undefined &&
        (typeof reviewed.limit !== "number" || !Number.isInteger(reviewed.limit) || reviewed.limit < 1)
      )
        return {
          allowed: false,
          reason: "The reviewed message match limit must be a positive integer with no code ceiling.",
        };
    }
    if (
      options.wait !== undefined &&
      (typeof options.wait !== "number" || !Number.isFinite(options.wait) || options.wait < 0)
    )
      return {
        allowed: false,
        reason: "The reviewed message wait budget must be zero or a positive number of milliseconds.",
      };
  }
  if (kind === "subscribesse") {
    const subscription = subscriptionoptionsof(options.subscription);
    if (!subscription)
      return {
        allowed: false,
        reason:
          "A reviewed subscription with an event stream url and a cancellation path is required in options.subscription.",
      };
    const rawlifetime =
      options.subscription && typeof options.subscription === "object" && !Array.isArray(options.subscription)
        ? (options.subscription as Record<string, unknown>).lifetime
        : undefined;
    if (
      rawlifetime !== undefined &&
      (typeof rawlifetime !== "number" || !Number.isFinite(rawlifetime) || rawlifetime <= 0)
    )
      return {
        allowed: false,
        reason: "The reviewed subscription lifetime window must be a positive number of milliseconds.",
      };
  }
  if (kind === "longpoll") {
    const cursor = pollcursorof(options.poll);
    if (!cursor)
      return {
        allowed: false,
        reason:
          "A reviewed poll cursor with a url, cursor field, interval and stop condition is required in options.poll.",
      };
    const wait = options.wait;
    if (wait !== undefined && (typeof wait !== "number" || !Number.isFinite(wait) || wait < 0))
      return {
        allowed: false,
        reason: "The reviewed long poll wait budget must be zero or a positive number of milliseconds.",
      };
    if (wait !== undefined && cursor.interval > wait)
      return {
        allowed: false,
        reason: `The long poll interval of ${cursor.interval} milliseconds exceeds the reviewed wait budget of ${wait} milliseconds; review a wider budget or a shorter interval.`,
      };
    if (options.pollrequest !== undefined) {
      const request = longpollrequestof(options.pollrequest);
      if (!request)
        return {
          allowed: false,
          reason:
            "A reviewed poll request with a url is required in options.pollrequest; the timeout and the resume cursor stay optional user choices.",
        };
      if (
        request.timeout !== undefined &&
        (typeof request.timeout !== "number" || !Number.isFinite(request.timeout) || request.timeout <= 0)
      )
        return {
          allowed: false,
          reason: "The reviewed poll request timeout must be a positive number of milliseconds with no code default.",
        };
    }
  }
  return { allowed: true };
}

/** Validates the reviewed request observation parameter grammar of the 1.1.43 family: watch windows with user configured match limits, header filters whose redaction list is required before any header value is stored, body filters with url patterns, mime lists and byte ceilings and api replay specs with known verbs and dotted extraction paths. */
function validatenetwatchgrammar(step: toolstep, options: Record<string, unknown>): policyevaluation {
  const kind = step.kind;
  if (kind === "watchrequests") {
    if (options.watch !== undefined) {
      const watch = options.watch;
      if (!watch || typeof watch !== "object" || Array.isArray(watch))
        return { allowed: false, reason: "The reviewed watch window must be an object." };
      const reviewed = watch as Record<string, unknown>;
      if (
        reviewed.window !== undefined &&
        (typeof reviewed.window !== "number" || !Number.isFinite(reviewed.window) || reviewed.window < 0)
      )
        return {
          allowed: false,
          reason: "The reviewed watch window must be zero or a positive number of milliseconds.",
        };
    }
    if (
      options.limit !== undefined &&
      (typeof options.limit !== "number" || !Number.isInteger(options.limit) || options.limit < 1)
    )
      return {
        allowed: false,
        reason: "The reviewed watch match limit must be a positive integer with no code ceiling.",
      };
  }
  if (kind === "readheaders") {
    const headers = options.headers;
    if (!headers || typeof headers !== "object" || Array.isArray(headers))
      return {
        allowed: false,
        reason: "A reviewed header filter with a name allowlist and a redaction list is required in options.headers.",
      };
    const reviewed = headers as Record<string, unknown>;
    if (
      !Array.isArray(reviewed.allow) ||
      reviewed.allow.length === 0 ||
      !reviewed.allow.every((name): name is string => isnonempty(name))
    )
      return { allowed: false, reason: "The reviewed header allowlist must be a non-empty list of header names." };
    if (
      !Array.isArray(reviewed.redact) ||
      reviewed.redact.length === 0 ||
      !reviewed.redact.every((name): name is string => isnonempty(name))
    )
      return {
        allowed: false,
        reason: "Header capture requires a reviewed redaction list before any header value is stored.",
      };
  }
  if (kind === "capturebodies") {
    const body = options.body;
    if (!body || typeof body !== "object" || Array.isArray(body))
      return {
        allowed: false,
        reason: "A reviewed body filter with a url pattern, mime list and byte ceiling is required in options.body.",
      };
    const reviewed = body as Record<string, unknown>;
    if (reviewed.urlpattern !== undefined && !isnonempty(reviewed.urlpattern))
      return { allowed: false, reason: "The reviewed body url pattern must be a non-empty string." };
    if (
      reviewed.mimes !== undefined &&
      (!Array.isArray(reviewed.mimes) ||
        reviewed.mimes.length === 0 ||
        !reviewed.mimes.every((mime): mime is string => isnonempty(mime)))
    )
      return { allowed: false, reason: "The reviewed body mime list must be a non-empty list of mime types." };
    if (
      reviewed.ceiling !== undefined &&
      (typeof reviewed.ceiling !== "number" || !Number.isFinite(reviewed.ceiling) || reviewed.ceiling < 0)
    )
      return {
        allowed: false,
        reason: "The reviewed body byte ceiling must be zero or a positive number of bytes with no code ceiling.",
      };
  }
  if (kind === "mapapi") {
    if (
      options.limit !== undefined &&
      (typeof options.limit !== "number" || !Number.isInteger(options.limit) || options.limit < 1)
    )
      return {
        allowed: false,
        reason: "The reviewed mapapi match limit must be a positive integer with no code ceiling.",
      };
  }
  if (kind === "extractapi") {
    const replay = apireplayspecof(options.replay);
    if (!replay)
      return { allowed: false, reason: "A reviewed replay spec with an endpoint is required in options.replay." };
    if (!ishttpsurl(replay.endpoint))
      return { allowed: false, reason: "The reviewed replay endpoint must be an HTTPS url." };
    if (
      replay.verb !== undefined &&
      !["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"].includes(replay.verb)
    )
      return { allowed: false, reason: "The reviewed replay verb must be a known HTTP verb." };
    for (const path of replay.paths ?? []) {
      if (!validpath(path.trim()))
        return {
          allowed: false,
          reason: `The reviewed replay extraction path ${path} must be a dotted path of non-empty segments.`,
        };
    }
  }
  return { allowed: true };
}

/** Validates the reviewed network control parameter grammar of the 1.1.44 family: block rules with url patterns that name their origin, mock fixtures reviewed with their full body, header rewrite rules with named origin patterns and set, append and remove operations, cookie records scoped to granted domains, oauth flows with provider consent refs, api key entries behind explicit consent, proxy routes with required bypass lists, urlencoded form payloads and multipart uploads whose every file carries the explicit reviewed flag; every bound stays a user choice with no code ceiling. */
function validatecontrolgrammar(step: toolstep, options: Record<string, unknown>): policyevaluation {
  const kind = step.kind;
  if (kind === "blockrequest") {
    const rule = blockruleof(options.block);
    if (!rule)
      return { allowed: false, reason: "A reviewed block rule with a url pattern is required in options.block." };
    if (patternorigin(rule.urlpattern) === undefined)
      return {
        allowed: false,
        reason: "Block rules need an https origin pattern; patterns without a named origin are refused.",
      };
    if ((options.block as Record<string, unknown>).reviewed !== true)
      return {
        allowed: false,
        reason: "The block rule carries the explicit reviewed flag before any request is blocked.",
      };
  }
  if (kind === "mockresponse") {
    const spec = mockspecof(options.mock);
    if (!spec)
      return {
        allowed: false,
        reason:
          "A reviewed mock fixture with a url pattern, status and its reviewed body or a captured body ref is required in options.mock.",
      };
    if (patternorigin(spec.urlpattern) === undefined)
      return {
        allowed: false,
        reason: "Mock fixtures need an https origin pattern; patterns without a named origin are refused.",
      };
    if (spec.reviewed !== true)
      return {
        allowed: false,
        reason:
          "Every mock fixture is reviewed with its full body or the referenced captured body through the explicit reviewed flag before it serves.",
      };
  }
  if (kind === "rewriteheaders") {
    const rules = options.rules;
    if (!Array.isArray(rules) || rules.length === 0)
      return {
        allowed: false,
        reason: "A reviewed non-empty list of header rewrite rules is required in options.rules.",
      };
    for (const item of rules) {
      const rule = headeruleof(item);
      if (!rule)
        return {
          allowed: false,
          reason:
            "Every header rewrite rule needs a url pattern, header name, a set, append or remove operation and its value.",
        };
      if (patternorigin(rule.urlpattern) === undefined)
        return {
          allowed: false,
          reason:
            "Header rewrite rules must name their origin pattern explicitly; patterns without a named origin are refused.",
        };
    }
  }
  if (kind === "setcookies") {
    const cookies = options.cookies;
    if (!Array.isArray(cookies) || cookies.length === 0)
      return { allowed: false, reason: "A reviewed non-empty list of cookie records is required in options.cookies." };
    for (const item of cookies) {
      if (!cookierecordof(item))
        return {
          allowed: false,
          reason: "Every cookie record needs a name, domain, path and reviewed string value with an optional expiry.",
        };
    }
  }
  if (kind === "readcookies" && options.domain !== undefined && !isnonempty(options.domain))
    return { allowed: false, reason: "The reviewed cookie read domain must be a non-empty host." };
  if (kind === "clearcookies") {
    if (!isnonempty(options.domain))
      return { allowed: false, reason: "A reviewed cookie domain is required before cookies are cleared." };
    if (
      options.names !== undefined &&
      (!Array.isArray(options.names) ||
        options.names.length === 0 ||
        !options.names.every((name): name is string => isnonempty(name)))
    )
      return {
        allowed: false,
        reason: "The reviewed cookie clear list must be a non-empty list of cookie names when present.",
      };
  }
  if (kind === "authflow") {
    const flow = oauthflowof(options.oauth);
    if (!flow)
      return {
        allowed: false,
        reason:
          "A reviewed oauth flow with provider, authorize url, token url, scopes and redirect origin is required in options.oauth.",
      };
    if (!ishttpsurl(flow.authorizeurl) || !ishttpsurl(flow.tokenurl))
      return { allowed: false, reason: "The oauth authorize and token urls must use HTTPS." };
    if (!ishttpsurl(flow.redirectorigin) && !/^https:\/\/[^/]+\/?$/.test(flow.redirectorigin))
      return { allowed: false, reason: "The oauth redirect origin must be an HTTPS origin inside the grants." };
    const consent = authconsentgranted(step);
    if (!consent.allowed) return consent;
  }
  if (kind === "saveapikey") {
    const key = options.key;
    if (!key || typeof key !== "object" || Array.isArray(key))
      return {
        allowed: false,
        reason: "A reviewed api key entry with name, origin scopes and header is required in options.key.",
      };
    const entry = key as Record<string, unknown>;
    if (!isnonempty(entry.name))
      return { allowed: false, reason: "The api key entry needs a reviewed non-empty name." };
    if (
      !Array.isArray(entry.origins) ||
      entry.origins.length === 0 ||
      !entry.origins.every((item): item is string => ishttpsurl(item))
    )
      return { allowed: false, reason: "The api key needs a reviewed non-empty list of HTTPS origin scopes." };
    if (!isnonempty(entry.header))
      return { allowed: false, reason: "The api key entry needs a reviewed non-empty header name." };
    if (typeof entry.value !== "string" || !entry.value)
      return {
        allowed: false,
        reason: "The api key needs its secret value in the reviewed options; it never enters the audit trail.",
      };
    const consent = apikeyconsentgranted(step);
    if (!consent.allowed) return consent;
  }
  if (kind === "routeproxy") {
    if (!proxyrouteof(options.proxy))
      return {
        allowed: false,
        reason:
          "A reviewed proxy route with scheme, host, port and a non-empty bypass list is required in options.proxy.",
      };
    if (!isnonempty(options.consentref))
      return {
        allowed: false,
        reason: "Proxy routing needs the explicit reviewed consent ref before any route applies.",
      };
  }
  if (kind === "postform") {
    const form = formpayloadof(options.form);
    if (!form)
      return {
        allowed: false,
        reason: "A reviewed form payload with a url and a non-empty field list is required in options.form.",
      };
    if (!ishttpsurl(form.url)) return { allowed: false, reason: "The form submission target must use HTTPS." };
    const encoding =
      options.form && typeof options.form === "object" && !Array.isArray(options.form)
        ? (options.form as Record<string, unknown>).encoding
        : undefined;
    if (encoding !== undefined && !isnonempty(encoding))
      return {
        allowed: false,
        reason: "The reviewed form payload encoding must be a non-empty name such as urlencoded.",
      };
    if (
      options.wait !== undefined &&
      (typeof options.wait !== "number" || !Number.isFinite(options.wait) || options.wait < 0)
    )
      return {
        allowed: false,
        reason: "The reviewed rate limit wait budget must be zero or a positive number of milliseconds.",
      };
  }
  if (kind === "postfiles") {
    const upload = multipartpayloadof(options.upload);
    if (!upload)
      return {
        allowed: false,
        reason:
          "A reviewed multipart upload with a url and reviewed files is required in options.upload; every file carries the explicit reviewed flag.",
      };
    if (!ishttpsurl(upload.url)) return { allowed: false, reason: "The multipart upload target must use HTTPS." };
    if (
      options.wait !== undefined &&
      (typeof options.wait !== "number" || !Number.isFinite(options.wait) || options.wait < 0)
    )
      return {
        allowed: false,
        reason: "The reviewed rate limit wait budget must be zero or a positive number of milliseconds.",
      };
  }
  return { allowed: true };
}

/** Requires the reviewed block rule of a live session before any blockrequest runs: the rule must carry the explicit reviewed flag and the session must stay active, unpaused and unexpired; every rule applies for the run only and reverts at run end. */
export function blockgate(session: agentsession | undefined, step: toolstep, now: number): policyevaluation {
  if (!session || session.stoppedat)
    return { allowed: false, reason: "No active browser session exists for the request block." };
  if (session.expiresat <= now)
    return { allowed: false, reason: "The browser session has expired and cannot block requests." };
  if (session.pausedat) return { allowed: false, reason: "The browser session is paused and cannot block requests." };
  let options: Record<string, unknown> = {};
  try {
    options = parseoptions(step);
  } catch {
    options = {};
  }
  const rule = options.block;
  if (!rule || typeof rule !== "object" || Array.isArray(rule) || (rule as Record<string, unknown>).reviewed !== true)
    return {
      allowed: false,
      reason: "Request blocking needs its reviewed block rule with the explicit reviewed flag before any rule applies.",
    };
  if (!blockruleof(rule))
    return { allowed: false, reason: "The block rule needs a url pattern and an optional resource type list." };
  return { allowed: true };
}

/** Scopes every cookie kind to a granted domain of a live session: the domain must equal a granted origin host or sit beneath it, and every other domain is refused. */
export function cookiegate(session: agentsession | undefined, domain: string, now: number): policyevaluation {
  if (!session || session.stoppedat)
    return { allowed: false, reason: "No active browser session exists for the cookie operation." };
  if (session.expiresat <= now)
    return { allowed: false, reason: "The browser session has expired and cannot touch cookies." };
  if (session.pausedat) return { allowed: false, reason: "The browser session is paused and cannot touch cookies." };
  const grants = session.grants ?? [session.origin];
  if (!cookiedomaingranted(domain, grants))
    return {
      allowed: false,
      reason: `The cookie domain ${domain} stays outside the session origin grants; cookie control refuses domains beyond the grants.`,
    };
  return { allowed: true };
}

/** Requires the explicit reviewed consent before routeproxy changes routing: a live session, a reviewed consent ref and a valid route with its bypass list; the route applies for the run only and restores the previous state at run end. */
export function proxygate(session: agentsession | undefined, step: toolstep, now: number): policyevaluation {
  if (!session || session.stoppedat)
    return { allowed: false, reason: "No active browser session exists for the proxy route." };
  if (session.expiresat <= now)
    return { allowed: false, reason: "The browser session has expired and cannot change routing." };
  if (session.pausedat) return { allowed: false, reason: "The browser session is paused and cannot change routing." };
  let options: Record<string, unknown> = {};
  try {
    options = parseoptions(step);
  } catch {
    options = {};
  }
  if (!isnonempty(options.consentref))
    return {
      allowed: false,
      reason: "Proxy routing needs the explicit reviewed consent ref before any route applies.",
    };
  if (!proxyrouteof(options.proxy))
    return {
      allowed: false,
      reason: "The proxy route needs a scheme, host, port and a non-empty bypass list of origins that stay direct.",
    };
  return { allowed: true };
}

/** Requires the reviewed provider consent prompt ref before any authflow runs. */
export function authconsentgranted(step: toolstep): policyevaluation {
  let options: Record<string, unknown> = {};
  try {
    options = parseoptions(step);
  } catch {
    options = {};
  }
  const consentref = options.consentref;
  if (typeof consentref !== "string" || !consentref.trim())
    return {
      allowed: false,
      reason: "An oauth flow requires the reviewed provider consent prompt ref in options before it starts.",
    };
  return { allowed: true };
}

/** Requires the explicit consent prompt ref before saveapikey stores a key. */
export function apikeyconsentgranted(step: toolstep): policyevaluation {
  let options: Record<string, unknown> = {};
  try {
    options = parseoptions(step);
  } catch {
    options = {};
  }
  const consentref = options.consentref;
  if (typeof consentref !== "string" || !consentref.trim())
    return {
      allowed: false,
      reason:
        "Storing an api key requires the explicit reviewed consent prompt ref in options before anything is stored.",
    };
  return { allowed: true };
}

/** Keeps the rate limit wait inside the reviewed wait budget as user configured behavior: the wait until the reset window passes must fit when a budget was reviewed; both bounds stay user choices with no code ceiling. */
export function ratelimitbudgetallowed(wait: number | undefined, budget: number | undefined): policyevaluation {
  if (wait !== undefined && (typeof wait !== "number" || !Number.isFinite(wait) || wait < 0))
    return { allowed: false, reason: "The rate limit wait must be zero or a positive number of milliseconds." };
  if (budget !== undefined && (typeof budget !== "number" || !Number.isFinite(budget) || budget < 0))
    return {
      allowed: false,
      reason: "The reviewed rate limit budget must be zero or a positive number of milliseconds.",
    };
  if (wait !== undefined && budget !== undefined && wait > budget)
    return {
      allowed: false,
      reason: `The rate limit wait of ${wait} milliseconds exceeds the reviewed budget of ${budget} milliseconds; review a wider budget or submit later.`,
    };
  return { allowed: true };
}

/** Requires the active tab grant of the live session for every debugging kind: the timeline gate scopes console, error and task capture to the run tab only and refuses every other tab. */
export function timelinegate(
  session: agentsession | undefined,
  tabid: number,
  origin: string,
  now: number,
): policyevaluation {
  if (!session || session.stoppedat)
    return { allowed: false, reason: "No active browser session exists for the timeline capture." };
  if (session.expiresat <= now)
    return { allowed: false, reason: "The browser session has expired and cannot capture the timeline." };
  if (session.pausedat)
    return { allowed: false, reason: "The browser session is paused and cannot capture the timeline." };
  if (session.tabid !== tabid)
    return {
      allowed: false,
      reason: `The timeline capture needs the run tab ${session.tabid} and refuses tab ${tabid}.`,
    };
  if (!origingranted(session, origin))
    return { allowed: false, reason: `The timeline capture of ${origin} needs the session origin grants first.` };
  return { allowed: true };
}

/** True when one approved console capture consent of that origin exists; console capture on a new origin prompts once and the approved decision persists. */
export function consoleconsentcovers(origin: string, consents: consoleconsentrecord[]): policyevaluation {
  if (consents.some((consent) => consent.origin === origin && consent.approved === true)) return { allowed: true };
  return {
    allowed: false,
    reason: `Console capture on ${origin} needs the reviewed console consent first; approve the prompt in the review panel.`,
  };
}

/** Requires the granted origin before stack frames are captured; stack capture outside the granted origin is refused. */
export function stackgate(session: agentsession | undefined, origin: string): policyevaluation {
  if (!origingranted(session, origin))
    return { allowed: false, reason: `Stack capture of ${origin} stays outside the session origin grants.` };
  return { allowed: true };
}

/** Keeps the debug watch window inside the reviewed wait budget: the watch wait must fit the reviewed budget when one was reviewed; both bounds stay user choices with no code ceiling. */
export function debugwaitbudgetallowed(watchwindow: number | undefined, wait: number | undefined): policyevaluation {
  if (
    watchwindow !== undefined &&
    (typeof watchwindow !== "number" || !Number.isFinite(watchwindow) || watchwindow < 0)
  )
    return { allowed: false, reason: "The debug watch window must be zero or a positive number of milliseconds." };
  if (wait !== undefined && (typeof wait !== "number" || !Number.isFinite(wait) || wait < 0))
    return {
      allowed: false,
      reason: "The reviewed debug wait budget must be zero or a positive number of milliseconds.",
    };
  if (watchwindow !== undefined && wait !== undefined && watchwindow > wait)
    return {
      allowed: false,
      reason: `The debug watch window of ${watchwindow} milliseconds exceeds the reviewed wait budget of ${wait} milliseconds; review a wider budget or a shorter window.`,
    };
  return { allowed: true };
}

/** Exposes the timeline retention window as a user configured choice; an absent value keeps every timeline entry forever while the level count summaries always survive. */
export function timelineretentionwindow(settings: runsettings | undefined): number | undefined {
  return settings?.timelineretention;
}

/** Grades console diffing as read only comparison evidence: the diff compares two stored console outputs and touches no page or browser state. */
export function diffreviewgrade(): { risk: "read"; mode: "diffing"; evidence: "comparison" } {
  return { risk: "read", mode: "diffing", evidence: "comparison" };
}

/** Validates the reviewed debugging parameter grammar of the 1.1.45 family: a watch window inside the reviewed wait budget, level floors from the reviewed level set, source filters from the reviewed source grammar, spam rules with user configured thresholds, serialization depth bounds, rotation rules with no hardcoded entry ceiling and the required redaction pattern list before any console text is captured. */
function validatetimelinegrammar(step: toolstep, options: Record<string, unknown>): policyevaluation {
  const kind = step.kind;
  let watchwindow: number | undefined;
  if (options.watch !== undefined) {
    const watch = options.watch;
    if (!watch || typeof watch !== "object" || Array.isArray(watch))
      return { allowed: false, reason: "The reviewed debug watch window must be an object." };
    const reviewed = watch as Record<string, unknown>;
    if (reviewed.window !== undefined) {
      if (typeof reviewed.window !== "number" || !Number.isFinite(reviewed.window) || reviewed.window < 0)
        return {
          allowed: false,
          reason: "The reviewed debug watch window must be zero or a positive number of milliseconds.",
        };
      watchwindow = reviewed.window;
    }
  }
  const budgetcheck = debugwaitbudgetallowed(watchwindow, typeof options.wait === "number" ? options.wait : undefined);
  if (!budgetcheck.allowed) return budgetcheck;
  if (options.level !== undefined && !loglevels.includes(options.level as loglevel))
    return { allowed: false, reason: `The reviewed level floor must be one of ${loglevels.join(", ")}.` };
  if (options.sources !== undefined) {
    if (
      !Array.isArray(options.sources) ||
      options.sources.length === 0 ||
      !options.sources.every((source) => timelinesources.includes(source as never))
    )
      return {
        allowed: false,
        reason: `The reviewed source filters must be a non-empty list of the reviewed timeline sources: ${timelinesources.join(", ")}.`,
      };
  }
  if (kind === "watchconsole") {
    if (
      options.redact === undefined ||
      !Array.isArray(options.redact) ||
      options.redact.length === 0 ||
      !options.redact.every((pattern) => isnonempty(pattern))
    )
      return {
        allowed: false,
        reason:
          "Console capture requires a reviewed non-empty redaction pattern list before any console text is captured.",
      };
    if (
      options.depth !== undefined &&
      (typeof options.depth !== "number" || !Number.isInteger(options.depth) || options.depth < 1)
    )
      return {
        allowed: false,
        reason: "The reviewed serialization depth bound must be a positive integer with no code ceiling.",
      };
    if (options.spam !== undefined) {
      const rule = spamruleof(options.spam);
      if (!rule)
        return {
          allowed: false,
          reason: "The reviewed spam rule needs a pattern, a window size and a collapse threshold.",
        };
      if (rule.collapse < 1)
        return {
          allowed: false,
          reason:
            "The reviewed spam collapse threshold must be a positive integer of user configured value with no code ceiling.",
        };
    }
    if (options.rotation !== undefined) {
      const rule = rotationruleof(options.rotation);
      if (!rule)
        return { allowed: false, reason: "The reviewed rotation rule needs a max entry count and an overflow target." };
    }
  }
  if (kind === "watchtasks") {
    if (
      options.threshold !== undefined &&
      (typeof options.threshold !== "number" || !Number.isFinite(options.threshold) || options.threshold < 0)
    )
      return {
        allowed: false,
        reason:
          "The reviewed long task threshold must be zero or a positive number of milliseconds with no code ceiling.",
      };
  }
  return { allowed: true };
}

/** Normalizes a reviewed spam rule: the pattern, the window size and the collapse threshold as user configured values. */
export function spamruleof(value: unknown): spamrule | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const entry = value as Record<string, unknown>;
  const pattern = typeof entry.pattern === "string" ? entry.pattern : "";
  const windowsize =
    typeof entry.windowsize === "number" && Number.isFinite(entry.windowsize) && entry.windowsize >= 0
      ? entry.windowsize
      : undefined;
  const collapse = typeof entry.collapse === "number" && Number.isInteger(entry.collapse) ? entry.collapse : undefined;
  if (windowsize === undefined || collapse === undefined) return undefined;
  return { pattern, windowsize, collapse };
}

/** Normalizes a reviewed log rotation rule: the max entries per run and the overflow target store with no hardcoded entry ceiling. */
export function rotationruleof(value: unknown): rotationrule | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const entry = value as Record<string, unknown>;
  const maxentries =
    typeof entry.maxentries === "number" && Number.isInteger(entry.maxentries) && entry.maxentries >= 1
      ? entry.maxentries
      : undefined;
  const overflowtarget =
    typeof entry.overflowtarget === "string" && entry.overflowtarget.trim() ? entry.overflowtarget.trim() : undefined;
  if (maxentries === undefined || overflowtarget === undefined) return undefined;
  return { maxentries, overflowtarget };
}

/** Requires the active run tab grant of the live session for every devtools protocol kind: the debug gate scopes attaches, commands, watches, breakpoints, steps and overrides to the run tab only and refuses every other tab. */
export function debuggate(
  session: agentsession | undefined,
  tabid: number,
  origin: string,
  now: number,
): policyevaluation {
  if (!session || session.stoppedat)
    return { allowed: false, reason: "No active browser session exists for the devtools protocol step." };
  if (session.expiresat <= now)
    return { allowed: false, reason: "The browser session has expired and cannot run a devtools protocol step." };
  if (session.pausedat)
    return { allowed: false, reason: "The browser session is paused and cannot run a devtools protocol step." };
  if (session.tabid !== tabid)
    return {
      allowed: false,
      reason: `The devtools protocol step needs the run tab ${session.tabid} and refuses tab ${tabid}.`,
    };
  if (!origingranted(session, origin))
    return { allowed: false, reason: `The devtools protocol step on ${origin} needs the session origin grants first.` };
  return { allowed: true };
}

/** True when one approved debugger consent of that origin covers every requested domain; the first attachcdp of a run needs the approved record and revocation removes the coverage. */
export function debuggerconsentcovers(origin: string, domains: string[], grants: debuggergrant[]): policyevaluation {
  const needed = [...new Set(domains)];
  const covering = grants.find(
    (grant) =>
      grant.origin === origin &&
      grant.approved === true &&
      grant.revokedat === undefined &&
      needed.every((domain) => grant.domains.includes(domain)),
  );
  if (covering) return { allowed: true };
  if (grants.some((grant) => grant.origin === origin && grant.revokedat !== undefined))
    return {
      allowed: false,
      reason: `The debugger consent on ${origin} was revoked; approve a new prompt before the devtools protocol runs again.`,
    };
  return {
    allowed: false,
    reason: `The devtools protocol on ${origin} needs the reviewed debugger consent for ${needed.join(", ")} first; approve the prompt with the domain allowlist shown in the review panel.`,
  };
}

/** The profiling target gate of every 1.1.47 kind: the live session run tab and origin grants come first, every iframe, worker and service worker target stays inside the granted origins, and the reviewed debugger grant of the origin covers every profiling instrument because profiling is debugger grade instrumentation. */
export function targetgate(input: {
  session: agentsession | undefined;
  tabid: number;
  origin: string;
  targets: attachtarget[];
  grants: debuggergrant[] | undefined;
  now: number;
}): policyevaluation {
  const base = debuggate(input.session, input.tabid, input.origin, input.now);
  if (!base.allowed) return base;
  for (const target of input.targets) {
    if (target.kind === "page") continue;
    const origincheckresult = origincheck(input.session, target.url);
    if (!origincheckresult.allowed)
      return {
        allowed: false,
        reason: `The ${target.kind} target ${target.url} stays outside the granted origins; profiling refuses to attach.`,
      };
  }
  if (input.grants === undefined) return { allowed: true };
  const consent = debuggerconsentcovers(input.origin, [], input.grants);
  if (!consent.allowed)
    return {
      allowed: false,
      reason: `The profiling step on ${input.origin} needs the reviewed debugger grant of the origin first; approve the prompt with the profiling derivation shown in the review panel.`,
    };
  return { allowed: true };
}

/** True when one approved source map capture consent of that origin covers the capture; revocation removes the coverage and the next capture needs a new reviewed prompt. */
export function sourcemapconsentcovers(origin: string, consents: sourcemapconsent[]): policyevaluation {
  const covering = consents.find(
    (consent) => consent.origin === origin && consent.approved === true && consent.revokedat === undefined,
  );
  if (covering) return { allowed: true };
  if (consents.some((consent) => consent.origin === origin && consent.revokedat !== undefined))
    return {
      allowed: false,
      reason: `The source map capture consent on ${origin} was revoked; approve a new prompt before another map file is fetched.`,
    };
  return {
    allowed: false,
    reason: `The source map capture on ${origin} needs the reviewed per origin consent first; approve the prompt shown in the review panel.`,
  };
}

/** Exposes the user configured retention window for the heavy profile bytes; an absent window keeps every snapshot, sample and trace file. */
export function profileretentionwindow(settings: runsettings | undefined): number | undefined {
  return settings?.profileretention;
}

/** Exposes the user configured trace byte ceiling; an absent value never refuses a trace export because the cap stays a user choice only. */
export function traceceilingof(settings: runsettings | undefined): number | undefined {
  return settings?.traceceiling;
}

/** Validates one breakpoint condition against the reviewed expression grammar: member chains, literals of number, string, boolean and null, comparison and logic operators, negation and parentheses; assignments, calls and statements are refused. */
export function validatebreakpointcondition(condition: string): policyevaluation {
  const expression = condition.trim();
  if (expression.length === 0) return { allowed: false, reason: "The breakpoint condition must not be empty." };
  if (/(?<![=!<>])=(?!=)/.test(expression))
    return {
      allowed: false,
      reason: "Breakpoint conditions refuse assignment because the reviewed grammar is comparison only.",
    };
  if (conditioncallshape(expression))
    return {
      allowed: false,
      reason: "Breakpoint conditions refuse calls because the reviewed grammar is comparison only.",
    };
  const literal = /^(?:-?\d+(?:\.\d+)?|true|false|null)$/;
  const scan = conditiontokens(expression);
  if (!scan.complete || scan.tokens.join("") !== expression.replace(/\s+/g, ""))
    return {
      allowed: false,
      reason:
        "The breakpoint condition must use the reviewed expression grammar of member chains, literals, comparisons, logic operators, negation and parentheses.",
    };
  const identifierlike = /^(?:true|false|null)$/;
  for (const token of scan.tokens) {
    if (token.startsWith('"') || token.startsWith("'"))
      continue; /* a string token left the scanner only as one structurally closed literal */
    if (literal.test(token) || identifierlike.test(token)) continue;
    if (
      [
        "===",
        "!==",
        "==",
        "!=",
        ">=",
        "<=",
        "&&",
        "||",
        "!",
        ".",
        "(",
        ")",
        "<",
        ">",
        "+",
        "-",
        "*",
        "/",
        "%",
      ].includes(token)
    )
      continue;
    if (/^[A-Za-z_$][\w$]*$/.test(token)) continue;
    return {
      allowed: false,
      reason: `The token ${token} of the breakpoint condition stays outside the reviewed expression grammar.`,
    };
  }
  return { allowed: true };
}

/** Reports whether one breakpoint condition carries an identifier immediately followed by an opening parenthesis: the call shape the grammar refuses. The scan walks the parentheses through index lookups and skips the whitespace before each, because a regex over identifier runs would itself backtrack polynomially on adversarial conditions. */
function conditioncallshape(expression: string): boolean {
  let paren = expression.indexOf("(");
  while (paren !== -1) {
    let end = paren - 1;
    while (end >= 0) {
      const char = expression[end] ?? "";
      if (char !== " " && char !== "\t" && char !== "\n" && char !== "\r") break;
      end -= 1;
    }
    let start = end;
    while (start >= 0) {
      const code = expression.charCodeAt(start);
      const part =
        (code >= 97 && code <= 122) ||
        (code >= 65 && code <= 90) ||
        (code >= 48 && code <= 57) ||
        code === 95 ||
        code === 36;
      if (!part) break;
      start -= 1;
    }
    const chunk = expression.slice(start + 1, end + 1);
    if (chunk.length > 0 && /[A-Za-z_$]/.test(chunk)) return true;
    paren = expression.indexOf("(", paren + 1);
  }
  return false;
}

/** Tokenizes one breakpoint condition through a plain character walk that mirrors the reviewed alternation exactly: identifiers, numbers, closed string literals with their escape pairs, the three and two character operators and the single character operators, with whitespace skipped. The scanner returns incomplete when a character matches no alternative, so the join check downstream refuses the same conditions the regex refused. */
function conditiontokens(expression: string): { tokens: string[]; complete: boolean } {
  const tokens: string[] = [];
  let index = 0;
  while (index < expression.length) {
    const char = expression[index] ?? "";
    if (char === " " || char === "\t" || char === "\n" || char === "\r") {
      index += 1;
      continue;
    }
    const code = char.charCodeAt(0);
    const identifierstart = (code >= 97 && code <= 122) || (code >= 65 && code <= 90) || code === 95 || code === 36;
    if (identifierstart) {
      let end = index + 1;
      while (end < expression.length) {
        const c = expression.charCodeAt(end);
        const part = (c >= 97 && c <= 122) || (c >= 65 && c <= 90) || (c >= 48 && c <= 57) || c === 95 || c === 36;
        if (!part) break;
        end += 1;
      }
      tokens.push(expression.slice(index, end));
      index = end;
      continue;
    }
    const digitafter = index + 1 < expression.length ? expression.charCodeAt(index + 1) : 0;
    const numberstart = (code >= 48 && code <= 57) || (char === "-" && digitafter >= 48 && digitafter <= 57);
    if (numberstart) {
      let end = index + (char === "-" ? 1 : 0);
      while (end < expression.length && expression.charCodeAt(end) >= 48 && expression.charCodeAt(end) <= 57) end += 1;
      const fractiondot =
        expression[end] === "." &&
        end + 1 < expression.length &&
        expression.charCodeAt(end + 1) >= 48 &&
        expression.charCodeAt(end + 1) <= 57;
      if (fractiondot) {
        end += 2;
        while (end < expression.length && expression.charCodeAt(end) >= 48 && expression.charCodeAt(end) <= 57)
          end += 1;
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
        } /* one escape pair: a backslash consumes the next character whatever it is */
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

/** Keeps the breakpoint count of one run inside the user configured ceiling: an absent ceiling never refuses a breakpoint because the cap stays a user choice only. */
export function breakpointbudgetallowed(active: number, ceiling: number | undefined): policyevaluation {
  if (ceiling === undefined) return { allowed: true };
  if (typeof ceiling !== "number" || !Number.isInteger(ceiling) || ceiling < 0)
    return {
      allowed: false,
      reason:
        "The reviewed breakpoint ceiling must be zero or a positive integer of user configured value with no code ceiling.",
    };
  if (active >= ceiling)
    return {
      allowed: false,
      reason: `The run already holds ${active} active breakpoint${active === 1 ? "" : "s"} and the reviewed breakpoint ceiling is ${ceiling}; revert one or review a wider ceiling.`,
    };
  return { allowed: true };
}

/** Exposes the pause capture retention window as a user configured choice; an absent value keeps every pause capture with its call frames. */
export function pauseretentionwindow(settings: runsettings | undefined): number | undefined {
  return settings?.pauseretention;
}

/** Exposes the user configured breakpoint ceiling; an absent value never refuses a breakpoint because the cap stays a user choice only. */
export function breakpointceilingof(settings: runsettings | undefined): number | undefined {
  return settings?.breakpointceiling;
}

/** Requires the review of every emulation layer before it applies: a live session on the run tab, an approved plan, the explicit reviewed flag on the layer options and the reviewed revert plan beside it. */
export function emugate(input: {
  session: agentsession | undefined;
  plan: agentplan | undefined;
  step: toolstep;
  tabid: number;
  origin: string;
  now: number;
}): policyevaluation {
  const gate = sessiongate({
    session: input.session,
    tabid: input.tabid,
    origin: input.origin,
    now: input.now,
    action: "emulate the run tab",
  });
  if (!gate.allowed) return gate;
  if (!input.plan || input.plan.state !== "approved")
    return { allowed: false, reason: "Emulation layers need an approved plan before they apply." };
  let options: Record<string, unknown> = {};
  try {
    options = parseoptions(input.step);
  } catch {
    options = {};
  }
  if (options.reviewed !== true)
    return {
      allowed: false,
      reason: `The ${input.step.kind} layer needs the explicit reviewed flag before any mask applies.`,
    };
  if (revertplanof(options.revertplan) === undefined)
    return {
      allowed: false,
      reason: `Every ${input.step.kind} layer needs a reviewed revert plan beside it before any mask applies.`,
    };
  return { allowed: true };
}

/** Allows layer stacking only when the reviewed plan lists the steps: a second layer of one family needs at least two reviewed steps of that family in the same plan because the last applied layer wins conflicts. */
export function emulationstackallowed(plan: agentplan | undefined, kind: actionkind, active: number): policyevaluation {
  if (!plan) return { allowed: false, reason: "Layer stacking needs the reviewed plan first." };
  const listed = plan.steps.filter((step) => step.kind === kind).length;
  if (active >= listed)
    return {
      allowed: false,
      reason: `The plan lists ${listed} reviewed ${kind} step${listed === 1 ? "" : "s"} and ${active} layer${active === 1 ? "" : "s"} of that family are already active; stacking beyond the reviewed plan is refused.`,
    };
  return { allowed: true };
}

/** True when one approved location consent of that origin covers the reviewed coordinates; the prompt shows the exact latitude and longitude before emulatelocate applies. */
export function locationconsentgate(
  origin: string,
  latitude: number,
  longitude: number,
  consents: locationconsent[],
): policyevaluation {
  if (consents.some((consent) => consent.origin === origin && consent.revokedat !== undefined))
    return {
      allowed: false,
      reason: `The location consent on ${origin} was revoked; approve a new prompt before the location override runs again.`,
    };
  if (locationconsentcovers(origin, latitude, longitude, consents)) return { allowed: true };
  return {
    allowed: false,
    reason: `The location override of ${latitude}, ${longitude} on ${origin} needs the reviewed location consent first; approve the prompt with the coordinates shown in the review panel.`,
  };
}

/** Exposes the user configured retention window for reverted emulation layer states; an absent window keeps every prior state while the layer history always survives. */
export function emulationretentionwindow(settings: runsettings | undefined): number | undefined {
  return settings?.emulationretention;
}

/** Validates the reviewed emulation parameter grammar of the 1.1.48 family: device presets with width, height, pixel ratio and the mobile flag plus the reviewed reload flag, network presets with latency, download and upload bounds and the offline window, location presets inside the latitude and longitude ranges behind the location consent, agent presets of the reviewed user agent grammar with platform and brand list, permission overrides of the reviewed browser permission set graded by name, blackbox rules of explicit origin patterns with their trace scope, and the reviewed revert plan beside every layer. */
function validateemulationgrammar(step: toolstep, options: Record<string, unknown>): policyevaluation {
  const kind = step.kind;
  if (revertplanof(options.revertplan) === undefined)
    return { allowed: false, reason: `Every ${kind} layer needs a reviewed revert plan before any mask applies.` };
  if (kind === "emulatedevice") {
    const preset = devicepresetof(options.device);
    if (!preset)
      return {
        allowed: false,
        reason:
          "The device layer needs a reviewed preset with a name, positive integer width and height and a positive pixel ratio.",
      };
    if (options.reload !== undefined && typeof options.reload !== "boolean")
      return {
        allowed: false,
        reason: "The reviewed reload flag must be a boolean; the page reloads only when the reviewed plan asks.",
      };
    return { allowed: true };
  }
  if (kind === "emulatenetwork") {
    const preset = networkpresetof(options.network);
    if (!preset)
      return {
        allowed: false,
        reason:
          "The network layer needs a reviewed preset with a name and zero or positive latency, download and upload bounds.",
      };
    if (
      options.window !== undefined &&
      (typeof options.window !== "number" || !Number.isFinite(options.window) || options.window < 0)
    )
      return {
        allowed: false,
        reason: "The reviewed offline window must be zero or a positive number of milliseconds with no code ceiling.",
      };
    return { allowed: true };
  }
  if (kind === "emulatelocate") {
    const preset = locationpresetof(options.location);
    if (!preset)
      return {
        allowed: false,
        reason:
          "The location layer needs a reviewed preset with a name, a latitude inside -90 and 90, a longitude inside -180 and 180 and a zero or positive accuracy radius.",
      };
    if (!locationrangevalid(preset.latitude, preset.longitude))
      return {
        allowed: false,
        reason:
          "The reviewed latitude must stay inside -90 and 90 degrees and the longitude inside -180 and 180 degrees.",
      };
    return { allowed: true };
  }
  if (kind === "setuseragent") {
    const preset = agentpresetof(options.agent);
    if (!preset)
      return {
        allowed: false,
        reason:
          "The agent layer needs a reviewed preset with a user agent string of the reviewed grammar, a platform and a non-empty brand list.",
      };
    if (!agentgrammarvalid(preset.useragent))
      return {
        allowed: false,
        reason:
          "The reviewed user agent string must use the reviewed grammar of tokens, separators and version marks without line breaks.",
      };
    return { allowed: true };
  }
  if (kind === "overridepermission") {
    const grant = permissiongrantof(options.permission);
    if (!grant)
      return {
        allowed: false,
        reason: `The permission override needs a reviewed name of the browser permission set (${browserpermissions.join(", ")}) and a state of ${permissionstates.join(", ")}.`,
      };
    void permissiongrade(grant.name);
    return { allowed: true };
  }
  if (kind === "blackboxscripts") {
    const rules = Array.isArray(options.rules)
      ? options.rules.flatMap((rule) => {
          const parsed = blackboxruleof(rule);
          return parsed !== undefined ? [parsed] : [];
        })
      : [];
    if (rules.length === 0)
      return {
        allowed: false,
        reason:
          "The blackbox layer needs a reviewed non-empty rule list where every pattern names its origin explicitly and carries a trace scope.",
      };
    return { allowed: true };
  }
  return { allowed: true };
}

/** Validates one permission override name against the reviewed browser permission set. */
export function permissionnamevalid(name: string): policyevaluation {
  if (!browserpermissions.includes(name))
    return {
      allowed: false,
      reason: `The permission ${name} stays outside the reviewed browser permission set: ${browserpermissions.join(", ")}.`,
    };
  return { allowed: true };
}

/** Validates the reviewed session parameter grammar of the 1.1.49 memory family: snapshot plans with the scope, the section toggles of the reviewed grammar and the optional auto interval whose period, maximum snapshot count and expiry stay user choices with no code ceiling, restore plans with their tab, form and capture policies behind the explicit restore review, session filings with unique reviewed names and folders, diffs of two saved records, searches with the term grammar and the field set, exports behind the explicit export review and imports of the known file format behind the full record review. */
function validatesessiongrammar(step: toolstep, options: Record<string, unknown>): policyevaluation {
  const kind = step.kind;
  if (kind === "persiststate") {
    if (options.resume !== undefined && typeof options.resume !== "boolean")
      return { allowed: false, reason: "The reviewed resume flag must be a boolean." };
    return { allowed: true };
  }
  if (kind === "capturesession") {
    const plan = snapshotplanof(options.snapshot);
    if (!plan)
      return {
        allowed: false,
        reason:
          "The session capture needs a reviewed snapshot plan with its scope, a non-empty section list of the reviewed grammar (tabs, scroll, forms, storage, cookies) and the capture link flag.",
      };
    if (plan.auto !== undefined) {
      const interval = autointervalof((options.snapshot as Record<string, unknown>).auto);
      if (interval === undefined)
        return {
          allowed: false,
          reason:
            "The reviewed auto snapshot interval needs a positive period, a positive maximum snapshot count and a zero or positive expiry window with no code ceiling.",
        };
    }
    return { allowed: true };
  }
  if (kind === "restoresession") {
    if (typeof options.sessionid !== "string" || !options.sessionid.trim())
      return { allowed: false, reason: "The session restore needs the reviewed session id of the saved record." };
    if (restoreplanof(options.restore) === undefined)
      return {
        allowed: false,
        reason: "The session restore needs a reviewed restore plan with its tab, form and capture policies.",
      };
    if (options.reviewed !== true)
      return {
        allowed: false,
        reason:
          "Every session restore needs the explicit restore review with its tabs, form state and captures listed before it reopens anything.",
      };
    return { allowed: true };
  }
  if (kind === "namedsessions") {
    if (typeof options.sessionid !== "string" || !options.sessionid.trim())
      return { allowed: false, reason: "The session filing needs the reviewed session id of the saved record." };
    if (typeof options.name !== "string" || !options.name.trim())
      return { allowed: false, reason: "The session filing needs a reviewed non-empty session name." };
    if (options.folder !== undefined && (typeof options.folder !== "string" || !options.folder.trim()))
      return { allowed: false, reason: "The reviewed folder name must be a non-empty string." };
    if (
      options.tags !== undefined &&
      (!Array.isArray(options.tags) || !options.tags.every((tag) => typeof tag === "string" && tag.trim()))
    )
      return { allowed: false, reason: "The reviewed tag list must be a list of non-empty strings." };
    return { allowed: true };
  }
  if (kind === "diffsessions") {
    if (
      typeof options.left !== "string" ||
      !options.left.trim() ||
      typeof options.right !== "string" ||
      !options.right.trim()
    )
      return { allowed: false, reason: "The session diff needs the reviewed ids of both saved sessions." };
    return { allowed: true };
  }
  if (kind === "searchsessions") {
    if (searchqueryof(options.query) === undefined)
      return {
        allowed: false,
        reason:
          "The session search needs a reviewed query with a non-empty term list, fields of the reviewed grammar (urls, titles, names, text) and an optional time window.",
      };
    return { allowed: true };
  }
  if (kind === "exportsessions") {
    if (options.reviewed !== true)
      return {
        allowed: false,
        reason: "Session exports need the explicit export review before any session file leaves the device.",
      };
    if (
      options.ids !== undefined &&
      (!Array.isArray(options.ids) ||
        options.ids.length === 0 ||
        !options.ids.every((id) => typeof id === "string" && id.trim()))
    )
      return { allowed: false, reason: "The reviewed export id list must be a non-empty list of saved session ids." };
    return { allowed: true };
  }
  if (kind === "importsessions") {
    if (options.reviewed !== true)
      return {
        allowed: false,
        reason: "Session imports need the explicit full record review before any record joins the library.",
      };
    if (importsessionfile(options.file) === undefined)
      return {
        allowed: false,
        reason: "The session import needs a reviewed file of the known format version with an intact checksum.",
      };
    return { allowed: true };
  }
  return { allowed: true };
}

/** Requires the explicit restore review flag and the reviewed restore plan before any session restore reopens a tab; the review lists every tab, form state and capture first. */
export function restorereviewgranted(step: toolstep): policyevaluation {
  let options: Record<string, unknown> = {};
  try {
    options = parseoptions(step);
  } catch {
    options = {};
  }
  if (restoreplanof(options.restore) === undefined)
    return {
      allowed: false,
      reason: "Every session restore needs a reviewed restore plan with its tab, form and capture policies.",
    };
  if (options.reviewed !== true)
    return {
      allowed: false,
      reason:
        "The session restore needs the explicit restore review of its tabs, form state and captures before it reopens anything.",
    };
  return { allowed: true };
}

/** The session consent gate of every session memory step: a live session, an approved plan and the restore review of every restore; crash restore prompts stay inside the same consent model. */
export function sessionrestoregate(input: {
  session: agentsession | undefined;
  plan: agentplan | undefined;
  step: toolstep;
  tabid: number;
  origin: string;
  now: number;
}): policyevaluation {
  const gate = sessiongate({
    session: input.session,
    tabid: input.tabid,
    origin: input.origin,
    now: input.now,
    action: "run the session memory step",
  });
  if (!gate.allowed) return gate;
  if (!input.plan || input.plan.state !== "approved")
    return { allowed: false, reason: "Session memory steps need an approved plan before they run." };
  if (input.step.kind === "restoresession") return restorereviewgranted(input.step);
  return { allowed: true };
}

/** Returns the origins a restore reopens outside the grants so the restore skips and reports them; captures and cookies restore only with their origin grants. */
export function restoreoriginsgranted(
  urls: string[],
  grants: string[],
): { allowed: boolean; skippedorigins: string[] } {
  const covered = new Set(grants);
  const skippedorigins: string[] = [];
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

/** Requires session names to stay unique inside the library so a filing never shadows another saved session. */
export function sessionnameunique(
  name: string,
  records: Array<{ id: string; name: string }>,
  recordid?: string,
): policyevaluation {
  if (records.some((record) => record.name === name && record.id !== recordid))
    return { allowed: false, reason: `The session name ${name} already exists in the library; review a unique name.` };
  return { allowed: true };
}

/** Requires folder names to stay unique inside the folder tree so one folder never shadows another. */
export function sessionfolderunique(name: string, folders: Array<{ name: string }>): policyevaluation {
  if (folders.some((folder) => folder.name === name))
    return {
      allowed: false,
      reason: `The folder name ${name} already exists in the library; review a unique folder name.`,
    };
  return { allowed: true };
}

/** Exposes the user configured retention window for saved session sections; an absent window keeps every section and no code ceiling applies. */
export function snapshotretentionwindow(settings: runsettings | undefined): number | undefined {
  return settings?.sessionretention;
}

/** Validates the reviewed workflow parameter grammar of the 1.1.50 and 1.1.51 families: composition with the expanded block list so no step stays hidden, shareable step templates, workflow runs behind the explicit run review, dry runs of the known workflow, jittered delays and element waits of user configured bounds with no code ceiling, expressions whose operators match the operand kinds and result kinds, regex rules of bounded backtracking shapes applied to reviewed text, and the control flow payloads of conditionals, branching, loops with user configured safety bounds, foreach selectors, parallel branches with join policies and try catch with retry and timeout policies whose child kinds all stay inside the reviewed vocabulary. */
function validateworkflowgrammar(step: toolstep, options: Record<string, unknown>): policyevaluation {
  const kind = step.kind;
  if (kind === "composeworkflow") {
    const payload = options.workflow;
    if (!payload || typeof payload !== "object" || Array.isArray(payload))
      return {
        allowed: false,
        reason:
          "The workflow composition needs the reviewed workflow payload with its name, version, origins, steps and blocks.",
      };
    const candidate = payload as Record<string, unknown>;
    if (typeof candidate.name !== "string" || !candidate.name.trim())
      return { allowed: false, reason: "The workflow composition needs a reviewed non-empty name." };
    if (typeof candidate.version !== "number" || !Number.isInteger(candidate.version) || candidate.version < 1)
      return { allowed: false, reason: "The workflow version must be a positive integer." };
    if (
      !Array.isArray(candidate.origins) ||
      candidate.origins.length === 0 ||
      !candidate.origins.every((origin) => typeof origin === "string" && origin.startsWith("https://"))
    )
      return {
        allowed: false,
        reason: "The workflow needs at least one granted HTTPS origin so every step stays inside the grants.",
      };
    if (
      !Array.isArray(candidate.steps) ||
      candidate.steps.length === 0 ||
      !candidate.steps.every(
        (entry) =>
          workflowstepof(entry) !== undefined ||
          (entry && typeof entry === "object" && typeof (entry as Record<string, unknown>).block === "string"),
      )
    )
      return {
        allowed: false,
        reason: "The workflow needs a non-empty reviewed step list of the workflow step grammar or block invocations.",
      };
    const blocks = Array.isArray(candidate.blocks)
      ? candidate.blocks.flatMap((block) => {
          const parsed = workflowblockof(block);
          return parsed !== undefined ? [parsed] : [];
        })
      : [];
    if (Array.isArray(candidate.blocks) && blocks.length !== (candidate.blocks as unknown[]).length)
      return {
        allowed: false,
        reason: "The reviewed block list must carry unique lowercase names, labels and valid child steps.",
      };
    try {
      const record = composeworkflow({
        name: candidate.name,
        version: candidate.version,
        origins: candidate.origins as string[],
        steps: (candidate.steps as Array<Record<string, unknown>>).map((entry) =>
          "block" in entry
            ? {
                block: entry.block as string,
                label: typeof entry.label === "string" ? entry.label : (entry.block as string),
              }
            : (workflowstepof(entry) as workflowstep),
        ),
        blocks,
        now: 0,
        kindallowed: (candidatekind) => {
          try {
            actionrisk(candidatekind as actionkind);
            return true;
          } catch {
            return false;
          }
        },
        riskof: (candidatekind) => actionrisk(candidatekind as actionkind),
      });
      const inputs = Array.isArray(candidate.inputs)
        ? candidate.inputs.flatMap((name) => (typeof name === "string" ? [name] : []))
        : undefined;
      const checked = validateworkflow(record, {
        kindallowed: (workflowkind) => {
          try {
            actionrisk(workflowkind as actionkind);
            return true;
          } catch {
            return false;
          }
        },
        ...(inputs !== undefined ? { inputs } : {}),
      });
      if (!checked.allowed) return checked;
    } catch (error) {
      return {
        allowed: false,
        reason: error instanceof Error ? error.message : "The workflow payload failed its composition validation.",
      };
    }
    return { allowed: true };
  }
  if (kind === "savetemplate") {
    const payload =
      options.template && typeof options.template === "object" && !Array.isArray(options.template)
        ? (options.template as Record<string, unknown>)
        : {};
    const template = steptemplateof({ id: "templatereview", origin: "https://example.com", sharedat: 0, ...payload });
    if (!template)
      return {
        allowed: false,
        reason: "The step template needs a reviewed name and a valid workflow step it shares across workflows.",
      };
    return { allowed: true };
  }
  if (kind === "runworkflow") {
    if (typeof options.workflowid !== "string" || !options.workflowid.trim())
      return { allowed: false, reason: "The workflow run needs the reviewed id of the composed workflow." };
    if (options.reviewed !== true)
      return {
        allowed: false,
        reason:
          "Every real workflow run needs the explicit run review with its expanded step list shown before the first step executes.",
      };
    if (
      options.variables !== undefined &&
      (!options.variables ||
        typeof options.variables !== "object" ||
        Array.isArray(options.variables) ||
        !Object.values(options.variables).every(
          (value) => typeof value === "string" || typeof value === "number" || typeof value === "boolean",
        ))
    )
      return {
        allowed: false,
        reason: "The reviewed run variables must be an object of string, number or boolean values.",
      };
    return { allowed: true };
  }
  if (kind === "dryrun") {
    if (typeof options.workflowid !== "string" || !options.workflowid.trim())
      return { allowed: false, reason: "The dry run needs the reviewed id of the composed workflow." };
    return { allowed: true };
  }
  if (kind === "delay") {
    const delay = options.delay;
    if (!delay || typeof delay !== "object" || Array.isArray(delay))
      return { allowed: false, reason: "The delay needs a reviewed base and jitter window in options." };
    const reviewed = delay as Record<string, unknown>;
    if (typeof reviewed.base !== "number" || !Number.isFinite(reviewed.base) || reviewed.base < 0)
      return { allowed: false, reason: "The reviewed delay base must be zero or a positive number of milliseconds." };
    if (typeof reviewed.jitter !== "number" || !Number.isFinite(reviewed.jitter) || reviewed.jitter < 0)
      return {
        allowed: false,
        reason:
          "The reviewed delay jitter window must be zero or a positive number of milliseconds with no code ceiling.",
      };
    return { allowed: true };
  }
  if (kind === "waitelement") {
    const wait = options.wait;
    if (!wait || typeof wait !== "object" || Array.isArray(wait))
      return {
        allowed: false,
        reason: "The element wait needs a reviewed selector, timeout and poll interval in options.",
      };
    const reviewed = wait as Record<string, unknown>;
    if (typeof reviewed.selector !== "string" || !reviewed.selector.trim())
      return { allowed: false, reason: "The element wait needs a reviewed non-empty selector." };
    if (typeof reviewed.timeout !== "number" || !Number.isFinite(reviewed.timeout) || reviewed.timeout < 0)
      return {
        allowed: false,
        reason:
          "The reviewed element wait timeout must be zero or a positive number of milliseconds with no code ceiling.",
      };
    if (typeof reviewed.poll !== "number" || !Number.isFinite(reviewed.poll) || reviewed.poll < 0)
      return {
        allowed: false,
        reason:
          "The reviewed element wait poll interval must be zero or a positive number of milliseconds with no code ceiling.",
      };
    return { allowed: true };
  }
  if (kind === "compute") {
    const expression = expressionof(options.expression);
    if (!expression)
      return {
        allowed: false,
        reason: `The expression step needs a reviewed expression with operands, an operator of the reviewed set (${expressionoperators.join(", ")}) and a result variable of a reviewed kind.`,
      };
    const operatorcheck = validatexpressionoperators(expression);
    if (!operatorcheck.allowed) return operatorcheck;
    return { allowed: true };
  }
  if (kind === "extractvars") {
    const rule = regexruleof(options.rule);
    if (!rule)
      return {
        allowed: false,
        reason: "The variable extraction needs a reviewed regex rule with its pattern, flags and named capture groups.",
      };
    const shapecheck = validateregexrule(rule.pattern);
    if (!shapecheck.allowed) return shapecheck;
    if (typeof options.text !== "string")
      return { allowed: false, reason: "The variable extraction needs the reviewed text the regex rule applies to." };
    return { allowed: true };
  }
  if (kind === "condition") {
    const condition = conditionof(options.condition);
    if (!condition)
      return { allowed: false, reason: "The condition step needs a reviewed boolean expression in its options." };
    const operatorcheck = validatexpressionoperators(condition.expression);
    if (!operatorcheck.allowed) return operatorcheck;
    return { allowed: true };
  }
  if (kind === "branch") {
    const branch = branchof(options.branch);
    if (!branch)
      return {
        allowed: false,
        reason:
          "The branch step needs reviewed unique paths with boolean match expressions and an else path in its options so every branch terminates.",
      };
    for (const path of [...branch.paths, branch.else]) {
      if (path.when === undefined) continue;
      const operatorcheck = validatexpressionoperators(path.when);
      if (!operatorcheck.allowed) return operatorcheck;
    }
    return controlchildkinds(step);
  }
  if (kind === "loop") {
    const loop = loopof(options.loop);
    if (!loop)
      return {
        allowed: false,
        reason:
          "The loop step needs a reviewed list variable, distinct item and index variables, an optional positive safety bound and a non-empty body in its options; an absent bound keeps the documented default.",
      };
    return controlchildkinds(step);
  }
  if (kind === "repeatuntil") {
    const repeat = repeatuntilof(options.repeatuntil);
    if (!repeat)
      return {
        allowed: false,
        reason:
          "The repeat until step needs a reviewed convergence expression, an optional positive safety bound and a non-empty body in its options.",
      };
    const operatorcheck = validatexpressionoperators(repeat.until);
    if (!operatorcheck.allowed) return operatorcheck;
    return controlchildkinds(step);
  }
  if (kind === "whileloop") {
    const condition = whileof(options.while);
    if (!condition)
      return {
        allowed: false,
        reason:
          "The while step needs a reviewed condition, a mandatory positive safety bound and a non-empty body in its options; a while loop without a safety bound is refused.",
      };
    const operatorcheck = validatexpressionoperators(condition.while);
    if (!operatorcheck.allowed) return operatorcheck;
    return controlchildkinds(step);
  }
  if (kind === "foreach") {
    const foreach = foreachof(options.foreach);
    if (!foreach)
      return {
        allowed: false,
        reason:
          "The foreach step needs a reviewed non-empty selector, distinct item and index variables and a non-empty body in its options.",
      };
    return controlchildkinds(step);
  }
  if (kind === "parallel") {
    const parallel = parallelof(options.parallel);
    if (!parallel)
      return {
        allowed: false,
        reason:
          "The parallel step needs uniquely identified branches with bodies and a join policy of the first, last or fail strategy with cancel or continue on branch failure in its options.",
      };
    return controlchildkinds(step);
  }
  if (kind === "trycatch") {
    const fragile = tryof(options.try);
    if (!fragile)
      return {
        allowed: false,
        reason:
          "The try step needs a fragile body, a catch handler and optional retry and timeout policies in its options: attempts stay user configured with no code ceiling, backoff is fixed or exponential and budgets are positive.",
      };
    return controlchildkinds(step);
  }
  return { allowed: true };
}

/** Checks every child step of a control payload against the reviewed action vocabulary so no control construct hides an unreviewed kind behind its body. */
function controlchildkinds(step: toolstep): policyevaluation {
  const children = controlsteps({
    id: step.id,
    kind: step.kind,
    label: step.summary,
    ...(step.options !== undefined ? { options: step.options } : {}),
  });
  for (const child of children) {
    try {
      actionrisk(child.kind);
    } catch {
      return {
        allowed: false,
        reason: `The ${child.kind} step inside the control payload of the ${step.kind} step is not a reviewed action kind.`,
      };
    }
  }
  return { allowed: true };
}

/** Rejects unbounded backtracking shapes of reviewed regex patterns: a quantified group whose body itself ends with an unbounded quantifier can explode on adversarial text, so the shape is refused while bounded repetitions stay user choices. The group scans run through plain index walks, because a regex over the pattern text would itself backtrack polynomially on adversarial shapes. */
export function validateregexrule(pattern: string): policyevaluation {
  try {
    new RegExp(pattern);
  } catch {
    return { allowed: false, reason: "The reviewed regex pattern does not compile." };
  }
  if (nestedquantifiershape(pattern) || /\(\)[+*{]/.test(pattern))
    return {
      allowed: false,
      reason:
        "The reviewed regex pattern nests an unbounded quantifier inside a quantified group and is refused because adversarial text could explode the backtracking.",
    };
  if (/\{\d+,\}/.test(pattern) && unboundedgrouprepeat(pattern))
    return {
      allowed: false,
      reason:
        "The reviewed regex pattern repeats an unbounded group and is refused because adversarial text could explode the backtracking.",
    };
  return { allowed: true };
}

/** Walks every parenthesized group of one pattern and reports whether any group whose body ends with an unescaped unbounded quantifier character (`+`, `*` or `}`) is itself followed by a quantifier: the classic nested quantifier explosion shape. */
function nestedquantifiershape(pattern: string): boolean {
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

/** Walks every parenthesized group of one pattern and reports whether any group whose body carries an unbounded `{n,}` repeat is itself followed by a quantifier: the repeated group explosion shape. */
function unboundedgrouprepeat(pattern: string): boolean {
  let open = pattern.indexOf("(");
  while (open !== -1) {
    const close = pattern.indexOf(")", open);
    if (close === -1) return false;
    const after = pattern[close + 1] ?? "";
    if ((after === "+" || after === "*" || after === "{") && /\{\d+,\}/.test(pattern.slice(open + 1, close)))
      return true;
    open = pattern.indexOf("(", open + 1);
  }
  return false;
}

/** Validates the reviewed expression operators against the operand kinds and the result kind: arithmetic needs numbers and returns numbers, logic needs booleans and returns booleans, comparison needs numbers and returns booleans, text operators return strings or booleans and length returns a number. */
function validatexpressionoperators(expression: import("./types.js").expressiontype): policyevaluation {
  const numeric = new Set(["add", "subtract", "multiply", "divide", "modulo"]);
  const logic = new Set(["and", "or", "not"]);
  const comparison = new Set(["less", "greater", "lessequal", "greaterequal"]);
  const text = new Set(["concat", "contains"]);
  const operator = expression.operator;
  if (numeric.has(operator)) {
    for (const operand of [expression.left, expression.right]) {
      if (operand === undefined) continue;
      if (operand.literal !== undefined && typeof operand.literal === "boolean")
        return {
          allowed: false,
          reason: `The ${operator} operator needs numeric operands; boolean literals are refused.`,
        };
    }
    if (expression.resultkind !== "number" && expression.resultkind !== "string")
      return { allowed: false, reason: `The ${operator} operator needs a number result kind.` };
  }
  if (logic.has(operator)) {
    for (const operand of [expression.left, expression.right]) {
      if (operand === undefined) continue;
      if (operand.literal !== undefined && typeof operand.literal !== "boolean")
        return {
          allowed: false,
          reason: `The ${operator} operator needs boolean operands; non boolean literals are refused.`,
        };
    }
    if (expression.resultkind !== "boolean")
      return { allowed: false, reason: `The ${operator} operator needs a boolean result kind.` };
    if (operator === "not" && expression.right !== undefined)
      return { allowed: false, reason: "The not operator takes one operand only." };
  }
  if (comparison.has(operator) && expression.resultkind !== "boolean")
    return { allowed: false, reason: `The ${operator} operator needs a boolean result kind.` };
  if (text.has(operator) && expression.resultkind !== "boolean" && expression.resultkind !== "string")
    return { allowed: false, reason: `The ${operator} operator needs a string or boolean result kind.` };
  if (operator === "contains" && expression.resultkind !== "boolean")
    return { allowed: false, reason: "The contains operator needs a boolean result kind." };
  if (operator === "length") {
    if (expression.right !== undefined)
      return { allowed: false, reason: "The length operator takes one operand only." };
    if (expression.resultkind !== "number")
      return { allowed: false, reason: "The length operator needs a number result kind." };
  }
  if (
    (operator === "equal" || operator === "notequal") &&
    !new Set(["boolean", "string", "number"]).has(expression.resultkind)
  )
    return { allowed: false, reason: "The equality operator needs a primitive result kind." };
  return { allowed: true };
}

/** The workflow consent gate: a live session, an approved plan and the explicit run review of every real run; dry runs stay read only inside the same session and plan gates. */
export function workflowgate(input: {
  session: agentsession | undefined;
  plan: agentplan | undefined;
  step: toolstep;
  tabid: number;
  origin: string;
  now: number;
}): policyevaluation {
  const gate = sessiongate({
    session: input.session,
    tabid: input.tabid,
    origin: input.origin,
    now: input.now,
    action: "run the workflow step",
  });
  if (!gate.allowed) return gate;
  if (!input.plan || input.plan.state !== "approved")
    return { allowed: false, reason: "Workflow steps need the approved plan review before they run." };
  if (input.step.kind === "runworkflow") {
    let runoptions: Record<string, unknown> = {};
    try {
      runoptions = parseoptions(input.step);
    } catch {
      runoptions = {};
    }
    if (runoptions.reviewed !== true)
      return {
        allowed: false,
        reason:
          "Every real workflow run needs the explicit run review with its expanded step list shown before the first step executes.",
      };
  }
  return { allowed: true };
}

/** Validates the reviewed trigger parameter grammar of the 1.1.52 family: every kind arms exactly one rule behind the explicit arm review, the workflow reference must name a composed workflow, the match payloads follow their family grammar — visit origins and url list entries must be HTTPS urls, url patterns must parse as HTTPS globs, cron expressions must parse as five field schedules with named weekdays and months and a resolvable timezone, interval periods stay positive with zero or positive jitter, webhook secrets must clear the documented entropy floor with a non-empty payload schema, event names must come from the observed event catalog and context menu titles stay non-empty — while cooldown windows stay user configured positive values with the documented default of the webhook and event families winning only when the review configures none. */
function validatetriggergrammar(step: toolstep, options: Record<string, unknown>): policyevaluation {
  const family = triggerfamilyof(step.kind);
  if (family === undefined) return { allowed: false, reason: "The trigger step is not a reviewed trigger kind." };
  if (typeof options.workflowid !== "string" || !options.workflowid.trim())
    return { allowed: false, reason: "Every trigger rule needs the reviewed id of the composed workflow it launches." };
  if (options.reviewed !== true)
    return {
      allowed: false,
      reason:
        "Every trigger rule needs the explicit arm review with its match fields and bound workflow shown before it arms.",
    };
  if (options.label !== undefined && (typeof options.label !== "string" || !options.label.trim()))
    return { allowed: false, reason: "The reviewed trigger label must be a non-empty string." };
  if (
    options.cooldown !== undefined &&
    (typeof options.cooldown !== "number" || !Number.isFinite(options.cooldown) || options.cooldown <= 0)
  )
    return {
      allowed: false,
      reason:
        "The reviewed cooldown window must be a positive number of milliseconds with no code ceiling; the webhook and event families keep the documented default when the review configures none.",
    };
  const payload = options.rule;
  if (!payload || typeof payload !== "object" || Array.isArray(payload))
    return { allowed: false, reason: `The ${step.kind} step needs its reviewed rule payload in options.` };
  if (triggerpayloadof(family, payload) === undefined) {
    if (family === "visit")
      return { allowed: false, reason: "The visit rule needs a non-empty reviewed list of HTTPS origins it fires on." };
    if (family === "url")
      return {
        allowed: false,
        reason:
          "The url rule needs a reviewed HTTPS glob url pattern; `*` spans one path segment and `**` spans across segments.",
      };
    if (family === "menu")
      return { allowed: false, reason: "The menu rule needs a reviewed non-empty context menu entry title." };
    if (family === "key")
      return {
        allowed: false,
        reason:
          "The keyboard shortcut rule needs a reviewed lowercase command name and an optional suggested key binding.",
      };
    if (family === "cron")
      return {
        allowed: false,
        reason:
          "The cron rule needs a reviewed five field cron expression of minutes, hours, days, months and weekdays with named weekdays and months and an optional resolvable timezone; unparseable schedules are refused.",
      };
    if (family === "interval")
      return {
        allowed: false,
        reason:
          "The interval rule needs a reviewed positive period in milliseconds with an optional zero or positive jitter window.",
      };
    if (family === "urllist")
      return {
        allowed: false,
        reason: "The url list rule needs a reviewed non-empty list of HTTPS urls its workflow runs across.",
      };
    if (family === "webhook")
      return {
        allowed: false,
        reason: `The webhook rule needs a reviewed shared secret of at least twenty four characters mixing letters and digits and a non-empty payload schema of named string, number or boolean fields.`,
      };
    if (family === "event")
      return {
        allowed: false,
        reason: `The page event rule needs a reviewed non-empty list of event names of the observed event catalog: ${triggereventcatalog.join(", ")}.`,
      };
    return { allowed: false, reason: "The trigger rule payload does not follow its family grammar." };
  }
  if (family === "cron") {
    const candidate = payload as Record<string, unknown>;
    if (typeof candidate.cron === "string" && cronparse(candidate.cron) === undefined)
      return { allowed: false, reason: "The cron expression does not parse as a five field schedule and is refused." };
  }
  if (family === "webhook") {
    const candidate = payload as Record<string, unknown>;
    if (typeof candidate.secret === "string" && !webhooksecretok(candidate.secret))
      return {
        allowed: false,
        reason:
          "The webhook shared secret must hold at least twenty four characters mixing letters and digits; the entropy floor is a floor, never a cap.",
      };
  }
  const armed = armrule({
    family,
    workflowid: options.workflowid,
    ...(typeof options.label === "string" && options.label.trim() ? { label: options.label } : {}),
    payload,
    ...(typeof options.cooldown === "number" ? { cooldown: options.cooldown } : {}),
    now: 0,
  });
  if (armed === undefined)
    return { allowed: false, reason: "The trigger rule payload does not arm as a reviewed rule." };
  return { allowed: true };
}

/** The trigger consent gate: a live session, an approved plan and the explicit arm review of every rule; automatic launchers never arm outside the consent gates. */
export function triggergate(input: {
  session: agentsession | undefined;
  plan: agentplan | undefined;
  step: toolstep;
  tabid: number;
  origin: string;
  now: number;
}): policyevaluation {
  const gate = sessiongate({
    session: input.session,
    tabid: input.tabid,
    origin: input.origin,
    now: input.now,
    action: "arm the trigger rule",
  });
  if (!gate.allowed) return gate;
  if (!input.plan || input.plan.state !== "approved")
    return { allowed: false, reason: "Trigger rules need the approved plan review before they arm." };
  let triggeroptions: Record<string, unknown> = {};
  try {
    triggeroptions = parseoptions(input.step);
  } catch {
    triggeroptions = {};
  }
  if (triggeroptions.reviewed !== true)
    return {
      allowed: false,
      reason:
        "Every trigger rule needs the explicit arm review with its match fields and bound workflow shown before it arms.",
    };
  return { allowed: true };
}

/** Returns the match origins of one reviewed trigger rule so callers can keep every rule inside the workflow grant list; triggers on origins outside the grants are refused. */
export function triggerorigins(step: toolstep): string[] {
  let triggeroptions: Record<string, unknown> = {};
  try {
    triggeroptions = parseoptions(step);
  } catch {
    return [];
  }
  const family = triggerfamilyof(step.kind);
  if (family === undefined) return [];
  const armed = armrule({
    family,
    workflowid: typeof triggeroptions.workflowid === "string" ? triggeroptions.workflowid : "",
    payload: triggeroptions.rule,
    ...(typeof triggeroptions.cooldown === "number" ? { cooldown: triggeroptions.cooldown } : {}),
    now: 0,
  });
  if (armed === undefined) return [];
  const origins: string[] = [];
  for (const origin of armed.origins ?? []) origins.push(origin);
  if (armed.pattern !== undefined) {
    try {
      origins.push(new URL(armed.pattern).origin);
    } catch {
      /* the pattern grammar already refused unparseable patterns */
    }
  }
  for (const url of armed.urls ?? []) {
    try {
      origins.push(new URL(url).origin);
    } catch {
      /* the url list grammar already refused unparseable urls */
    }
  }
  return [...new Set(origins)];
}

/** Returns the read only projection of one workflow step for dry runs: read class steps report their would be outcome while interaction and mutation steps carry no projection and the dry run refuses them; a control step projects only when every child step of its payload grades read. */
export function dryrunprojection(step: workflowstep): string | undefined {
  if (iscontrolflowkind(step.kind)) {
    for (const child of controlsteps(step)) {
      const childrisk = resolvedrisk({
        id: child.id,
        kind: child.kind,
        summary: child.label,
        risk: "read",
        ...(child.target !== undefined ? { target: child.target } : {}),
        ...(child.value !== undefined ? { value: child.value } : {}),
        ...(child.options !== undefined ? { options: child.options } : {}),
      });
      if (childrisk !== "read") return undefined;
    }
    if (step.kind === "condition")
      return "The condition step would evaluate its reviewed expression over the extracted values with no page side effect.";
    if (step.kind === "branch")
      return "The branch step would choose one reviewed path by page state and only the chosen path would run.";
    if (step.kind === "loop")
      return "The loop step would iterate its reviewed list binding the item and index variables per iteration inside the safety bound.";
    if (step.kind === "repeatuntil")
      return "The repeat until step would rerun its body until the convergence expression holds inside the safety bound.";
    if (step.kind === "whileloop")
      return "The while step would loop while its condition holds inside the reviewed safety bound.";
    if (step.kind === "foreach")
      return "The foreach step would iterate the elements of its reviewed selector binding the item and index variables per iteration.";
    if (step.kind === "parallel")
      return "The parallel step would run its branches concurrently and join their outcomes under the reviewed strategy.";
    return "The try step would run its fragile body and only the catch handler on failure.";
  }
  const risk = resolvedrisk({
    id: step.id,
    kind: step.kind,
    summary: step.label,
    risk: "read",
    ...(step.target !== undefined ? { target: step.target } : {}),
    ...(step.value !== undefined ? { value: step.value } : {}),
    ...(step.options !== undefined ? { options: step.options } : {}),
  });
  if (risk !== "read") return undefined;
  if (step.kind === "delay") return `The delay step would sleep its reviewed base inside the jitter window.`;
  if (step.kind === "waitelement")
    return `The element wait step would poll ${step.target ?? "the reviewed selector"} until appearance or the reviewed timeout.`;
  if (step.kind === "compute")
    return `The compute step would evaluate its reviewed expression into the result variable.`;
  if (step.kind === "extractvars")
    return `The variable extraction step would apply its reviewed regex rule and store the named captures.`;
  return `The ${step.kind} step would run read only and mutate nothing.`;
}

/** Validates one reviewed permission state of an override. */
export function permissionstatevalid(state: string): policyevaluation {
  if (!permissionstates.includes(state as permissionstate))
    return { allowed: false, reason: `The reviewed permission state must be one of ${permissionstates.join(", ")}.` };
  return { allowed: true };
}

/** Validates the reviewed devtools parameter grammar of the 1.1.46 family: enabled domains bounded by the reviewed domain grammar, the required teardown plan of every attach, raw commands of the Domain.method form, domain event rules with match filters inside the reviewed watch window, breakpoints with conditions of the reviewed expression grammar, step modes, reviewed watch expressions, and script overrides with the explicit reviewed flag and a url pattern that names its origin. */
function validatecdpgrammar(step: toolstep, options: Record<string, unknown>): policyevaluation {
  const kind = step.kind;
  if (kind === "attachcdp") {
    if (
      !Array.isArray(options.domains) ||
      options.domains.length === 0 ||
      !options.domains.every((domain): domain is string => typeof domain === "string" && cdpdomains.includes(domain))
    )
      return {
        allowed: false,
        reason: `The attach needs a non-empty enabled domain list of the reviewed domain grammar: ${cdpdomains.join(", ")}.`,
      };
    if (teardownplanof(options.teardown) === undefined)
      return {
        allowed: false,
        reason: "Every attach needs a reviewed teardown plan with its revert steps and resume policy before approval.",
      };
    if (options.allowlist !== undefined) {
      const allowlist = cdpallowlistof(options.allowlist);
      if (!allowlist || !allowlist.domains.every((domain) => (options.domains as string[]).includes(domain)))
        return {
          allowed: false,
          reason: "The reviewed method allowlist must stay inside the enabled domains of the attach.",
        };
    }
    const budgetcheck = debugwaitbudgetallowed(typeof options.wait === "number" ? options.wait : undefined, undefined);
    if (!budgetcheck.allowed) return budgetcheck;
    return { allowed: true };
  }
  if (kind === "detachcdp") return { allowed: true };
  if (kind === "cdpcmd") {
    const command =
      options.command && typeof options.command === "object" && !Array.isArray(options.command)
        ? (options.command as Record<string, unknown>)
        : undefined;
    if (!command || typeof command.method !== "string" || methoddomain(command.method) === undefined)
      return { allowed: false, reason: "The raw command needs a reviewed method of the Domain.method form." };
    if (command.params !== undefined && (typeof command.params !== "object" || Array.isArray(command.params)))
      return { allowed: false, reason: "The raw command params must be a JSON object." };
    if (command.resultpath !== undefined && typeof command.resultpath !== "string")
      return { allowed: false, reason: "The reviewed result path must be a dotted path string." };
    return { allowed: true };
  }
  if (kind === "watchcdp") {
    if (
      !Array.isArray(options.events) ||
      options.events.length === 0 ||
      !options.events.every((rule) => cdpeventruleof(rule) !== undefined)
    )
      return {
        allowed: false,
        reason: "The event watch needs a non-empty reviewed list of domain event rules of the reviewed domain grammar.",
      };
    let watchwindow: number | undefined;
    if (options.watch !== undefined) {
      const watch = options.watch;
      if (!watch || typeof watch !== "object" || Array.isArray(watch))
        return { allowed: false, reason: "The reviewed event watch window must be an object." };
      const reviewed = watch as Record<string, unknown>;
      if (reviewed.window !== undefined) {
        if (typeof reviewed.window !== "number" || !Number.isFinite(reviewed.window) || reviewed.window < 0)
          return {
            allowed: false,
            reason: "The reviewed event watch window must be zero or a positive number of milliseconds.",
          };
        watchwindow = reviewed.window;
      }
    }
    if (watchwindow === undefined)
      return {
        allowed: false,
        reason: "The event watch needs a reviewed lifetime window before any domain event is observed.",
      };
    const budgetcheck = debugwaitbudgetallowed(
      watchwindow,
      typeof options.wait === "number" ? options.wait : undefined,
    );
    if (!budgetcheck.allowed) return budgetcheck;
    return { allowed: true };
  }
  if (kind === "setbreakpoint") {
    const breakpoint = breakpointinputof(options.breakpoint);
    if (!breakpoint)
      return { allowed: false, reason: "The breakpoint needs a reviewed script url and a zero based line." };
    if (!ishttpsurl(breakpoint.url))
      return { allowed: false, reason: "The breakpoint script url must be a reviewed HTTPS url." };
    if (breakpoint.condition !== undefined) {
      const conditioncheck = validatebreakpointcondition(breakpoint.condition);
      if (!conditioncheck.allowed) return conditioncheck;
    }
    return { allowed: true };
  }
  if (kind === "stepcode") {
    if (stepmodeof(options.mode) === undefined)
      return { allowed: false, reason: "The step code mode must be one of stepover, stepinto, stepout or resume." };
    return { allowed: true };
  }
  if (kind === "watchexpr") {
    if (watchexpressionof(options.expression) === undefined)
      return { allowed: false, reason: "The watch expression needs the reviewed expression text." };
    if (options.reviewed !== true)
      return {
        allowed: false,
        reason: "Watch expressions must be reviewed before evaluation; set the explicit reviewed flag on the step.",
      };
    return { allowed: true };
  }
  if (kind === "overridescript") {
    const override = overrideinputof(options.override);
    if (!override)
      return {
        allowed: false,
        reason: "The script override needs a reviewed url pattern and its full fixture source.",
      };
    if (patternorigin(override.urlpattern) === undefined)
      return { allowed: false, reason: "Script overrides without a named https origin pattern are refused." };
    if (options.reviewed !== true)
      return {
        allowed: false,
        reason:
          "The full fixture source must be reviewed before the script override runs; set the explicit reviewed flag on the step.",
      };
    return { allowed: true };
  }
  return { allowed: true };
}

/** Validates the reviewed profiling parameter grammar of the 1.1.47 family: flow specs of the reviewed metric set inside a reviewed watch window, heap snapshots with the user chosen interval only, growth tracking with the reviewed slope, cpu profiles bounded by the reviewed wait budget, layout shift watches with the user chosen window only, trace records bounded by the reviewed category list and byte ceiling, trace annotations that carry step ids, offline replays of stored traces and source map capture scripts of explicit https urls. */
function validateprofilegrammar(step: toolstep, options: Record<string, unknown>): policyevaluation {
  const kind = step.kind;
  if (kind === "measureflow") {
    if (flowspecof(options.flow) === undefined)
      return {
        allowed: false,
        reason: `The flow measurement needs a reviewed flow spec with its mark prefix, step window and metric list of the reviewed metric set: navigation, paint, lcp, fid, interaction, blocking.`,
      };
    const watch =
      options.watch && typeof options.watch === "object" && !Array.isArray(options.watch)
        ? (options.watch as Record<string, unknown>)
        : {};
    if (typeof watch.window !== "number" || !Number.isFinite(watch.window) || watch.window < 0)
      return {
        allowed: false,
        reason: "The flow measurement needs a reviewed watch window of zero or more milliseconds.",
      };
    const budgetcheck = debugwaitbudgetallowed(
      watch.window,
      typeof options.wait === "number" ? options.wait : undefined,
    );
    if (!budgetcheck.allowed) return budgetcheck;
    return { allowed: true };
  }
  if (kind === "heapshot") {
    const heap =
      options.heap && typeof options.heap === "object" && !Array.isArray(options.heap)
        ? (options.heap as Record<string, unknown>)
        : {};
    if (
      heap.interval !== undefined &&
      (typeof heap.interval !== "number" || !Number.isFinite(heap.interval) || heap.interval < 0)
    )
      return {
        allowed: false,
        reason:
          "The reviewed heap snapshot interval must be zero or a positive number of milliseconds and stays a user choice with no code ceiling.",
      };
    return { allowed: true };
  }
  if (kind === "trackmemory") {
    const growth =
      options.growth && typeof options.growth === "object" && !Array.isArray(options.growth)
        ? (options.growth as Record<string, unknown>)
        : undefined;
    if (!growth || typeof growth.slope !== "number" || !Number.isFinite(growth.slope) || growth.slope < 0)
      return {
        allowed: false,
        reason:
          "Memory growth tracking needs the reviewed slope in bytes per millisecond before any sample is flagged.",
      };
    if (
      growth.interval !== undefined &&
      (typeof growth.interval !== "number" || !Number.isFinite(growth.interval) || growth.interval < 0)
    )
      return {
        allowed: false,
        reason:
          "The reviewed sampling interval must be zero or a positive number of milliseconds and stays a user choice with no code ceiling.",
      };
    return { allowed: true };
  }
  if (kind === "profilecpu") {
    const profile =
      options.profile && typeof options.profile === "object" && !Array.isArray(options.profile)
        ? (options.profile as Record<string, unknown>)
        : undefined;
    if (!profile || typeof profile.duration !== "number" || !Number.isFinite(profile.duration) || profile.duration < 0)
      return { allowed: false, reason: "The cpu profile needs a reviewed duration of zero or more milliseconds." };
    const budgetcheck = debugwaitbudgetallowed(
      profile.duration,
      typeof options.wait === "number" ? options.wait : undefined,
    );
    if (!budgetcheck.allowed) return budgetcheck;
    return { allowed: true };
  }
  if (kind === "watchshifts") {
    const watch =
      options.watch && typeof options.watch === "object" && !Array.isArray(options.watch)
        ? (options.watch as Record<string, unknown>)
        : {};
    if (typeof watch.window !== "number" || !Number.isFinite(watch.window) || watch.window < 0)
      return {
        allowed: false,
        reason:
          "The layout shift watch needs a reviewed observation window of zero or more milliseconds; the window stays a user choice with no code ceiling.",
      };
    if (
      options.threshold !== undefined &&
      (typeof options.threshold !== "number" || !Number.isFinite(options.threshold) || options.threshold < 0)
    )
      return { allowed: false, reason: "The reviewed shift score threshold must be zero or a positive number." };
    const budgetcheck = debugwaitbudgetallowed(
      watch.window,
      typeof options.wait === "number" ? options.wait : undefined,
    );
    if (!budgetcheck.allowed) return budgetcheck;
    return { allowed: true };
  }
  if (kind === "traceload") {
    const trace =
      options.trace && typeof options.trace === "object" && !Array.isArray(options.trace)
        ? (options.trace as Record<string, unknown>)
        : undefined;
    if (
      !trace ||
      !Array.isArray(trace.categories) ||
      trace.categories.length === 0 ||
      !trace.categories.every(
        (category): category is string => typeof category === "string" && tracecategories.includes(category),
      )
    )
      return {
        allowed: false,
        reason: `The trace record needs a non-empty reviewed category list of the reviewed category grammar: ${tracecategories.join(", ")}.`,
      };
    if (typeof trace.window !== "number" || !Number.isFinite(trace.window) || trace.window < 0)
      return {
        allowed: false,
        reason:
          "The trace record needs a reviewed window of zero or more milliseconds and stops at the reviewed window end.",
      };
    if (trace.exporttarget !== undefined && trace.exporttarget !== "memory" && trace.exporttarget !== "download")
      return { allowed: false, reason: "The trace export target must be memory or download." };
    const budgetcheck = debugwaitbudgetallowed(
      trace.window,
      typeof options.wait === "number" ? options.wait : undefined,
    );
    if (!budgetcheck.allowed) return budgetcheck;
    return { allowed: true };
  }
  if (kind === "annotatetrace" || kind === "replaytrace") {
    const trace =
      options.trace && typeof options.trace === "object" && !Array.isArray(options.trace)
        ? (options.trace as Record<string, unknown>)
        : undefined;
    if (!trace || typeof trace.traceid !== "string" || !trace.traceid.trim())
      return {
        allowed: false,
        reason: `The ${kind === "annotatetrace" ? "trace annotation" : "trace replay"} needs the stored trace id of a recorded trace.`,
      };
    if (kind === "replaytrace") return { allowed: true };
    if (
      !Array.isArray(options.annotations) ||
      options.annotations.length === 0 ||
      !options.annotations.every((annotation) => annotationof(annotation) !== undefined)
    )
      return {
        allowed: false,
        reason:
          "Exported traces carry their step annotations: every annotation needs a step id, a label and an optional offset from the trace start.",
      };
    return { allowed: true };
  }
  if (kind === "capturesourcemaps") {
    if (options.scripts !== undefined) {
      if (
        !Array.isArray(options.scripts) ||
        options.scripts.length === 0 ||
        !options.scripts.every((url): url is string => typeof url === "string" && ishttpsurl(url))
      )
        return {
          allowed: false,
          reason: "The source map capture scripts must be a non-empty list of reviewed HTTPS urls.",
        };
    }
    return { allowed: true };
  }
  return { allowed: true };
}

/** Resolves the reviewed cdp allowlist of one plan: the enabled domains and method gates of its attachcdp step, the reviewable contract every later cdp kind of the plan must stay inside. */
export function planallowlist(steps: toolstep[]): cdpallowlist | undefined {
  const attach = steps.find((step) => step.kind === "attachcdp");
  if (!attach) return undefined;
  let options: Record<string, unknown> = {};
  try {
    options = parseoptions(attach);
  } catch {
    options = {};
  }
  const domains = Array.isArray(options.domains)
    ? options.domains.filter((domain): domain is string => typeof domain === "string" && cdpdomains.includes(domain))
    : [];
  if (domains.length === 0) return undefined;
  const gated = cdpallowlistof(options.allowlist);
  return { domains, ...(gated?.methods !== undefined ? { methods: gated.methods } : {}) };
}

/** Resolves the reviewed outbound url of a network control step at review time: the form url of postform, the upload url of postfiles and the token url of authflow. */
export function controltarget(step: toolstep): string | undefined {
  let options: Record<string, unknown> = {};
  try {
    options = parseoptions(step);
  } catch {
    options = {};
  }
  for (const key of ["form", "upload"] as const) {
    const value = options[key];
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const url = (value as Record<string, unknown>).url;
      if (typeof url === "string" && url.trim()) return url.trim();
    }
  }
  if (step.kind === "authflow") {
    const flow = oauthflowof(options.oauth);
    if (flow) return flow.tokenurl;
  }
  return undefined;
}

/** Resolves the reviewed channel url of a socket step at review time: the socket url of opensocket, the event stream url of subscribesse and the poll url of longpoll. */
export function sockettarget(step: toolstep): string | undefined {
  let options: Record<string, unknown> = {};
  try {
    options = parseoptions(step);
  } catch {
    options = {};
  }
  for (const key of ["socket", "subscription", "poll"] as const) {
    const value = options[key];
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const url = (value as Record<string, unknown>).url;
      if (typeof url === "string" && url.trim()) return url.trim();
    }
  }
  return undefined;
}

/** Requires the active tab grant of the live session for every media kind: the session tab and origin must match and the origin grant must cover the active origin. */
export function mediagate(
  session: agentsession | undefined,
  tabid: number,
  origin: string,
  now: number,
): policyevaluation {
  if (!session || session.stoppedat)
    return { allowed: false, reason: "No active browser session exists for the media capture." };
  if (session.expiresat <= now)
    return { allowed: false, reason: "The browser session has expired and cannot capture media." };
  if (session.pausedat) return { allowed: false, reason: "The browser session is paused and cannot capture media." };
  if (session.tabid !== tabid)
    return {
      allowed: false,
      reason: `The media capture needs the active tab grant of session tab ${session.tabid} and refuses tab ${tabid}.`,
    };
  if (!origingranted(session, origin))
    return { allowed: false, reason: `The media capture of ${origin} needs the session origin grants first.` };
  return { allowed: true };
}

/** Requires an approved recording consent prompt before any recording of user activity starts; every start consumes its own prompt. */
export function recordingconsentgranted(step: toolstep): policyevaluation {
  let options: Record<string, unknown> = {};
  try {
    options = parseoptions(step);
  } catch {
    options = {};
  }
  const consentref = options.consentref;
  if (typeof consentref !== "string" || !consentref.trim())
    return {
      allowed: false,
      reason: "A recording of user activity requires a reviewed consent ref in options before it starts.",
    };
  return { allowed: true };
}

/** Exposes the recording duration window as a user configured choice in milliseconds; an absent window leaves the duration to the reviewed step options with no code ceiling. */
export function recordingwindow(settings: runsettings | undefined): number | undefined {
  const window = settings?.recordingwindow;
  return typeof window === "number" && Number.isFinite(window) && window > 0 ? window : undefined;
}

/** Keeps the reviewed lapse plan inside the reviewed wait budget: the whole lapse duration must fit the wait window with no code ceiling on either side. */
export function lapsebudgetallowed(interval: number, duration: number, wait: number | undefined): policyevaluation {
  if (!(interval > 0))
    return { allowed: false, reason: "The reviewed lapse interval must be a positive number of milliseconds." };
  if (!(duration > 0))
    return { allowed: false, reason: "The reviewed lapse duration must be a positive number of milliseconds." };
  if (wait !== undefined && !(wait >= 0))
    return { allowed: false, reason: "The reviewed wait budget must be zero or a positive number of milliseconds." };
  if (wait !== undefined && duration > wait)
    return {
      allowed: false,
      reason: `The lapse duration of ${duration} milliseconds exceeds the reviewed wait budget of ${wait} milliseconds; review a wider budget or a shorter duration.`,
    };
  return { allowed: true };
}

/** Validates the reviewed media capture parameter grammar of the 1.1.41 family: pdf paper sizes, recording scopes and windows, image filters, lapse plans, conversion targets and thumbnail directives stay user choices with no code ceilings. */
function validatemediagrammar(step: toolstep, options: Record<string, unknown>): policyevaluation {
  const kind = step.kind;
  if (kind === "capturepdf") {
    const pdf = options.pdf;
    if (pdf !== undefined) {
      if (!pdf || typeof pdf !== "object" || Array.isArray(pdf))
        return { allowed: false, reason: "The reviewed pdf options must be an object in options.pdf." };
      const pdfoptions = pdf as Record<string, unknown>;
      if (
        pdfoptions.paperwidth !== undefined &&
        (typeof pdfoptions.paperwidth !== "number" ||
          !Number.isFinite(pdfoptions.paperwidth) ||
          pdfoptions.paperwidth <= 0)
      )
        return {
          allowed: false,
          reason: "The reviewed pdf paper width must be a positive number of inches with no code cap.",
        };
      if (
        pdfoptions.paperheight !== undefined &&
        (typeof pdfoptions.paperheight !== "number" ||
          !Number.isFinite(pdfoptions.paperheight) ||
          pdfoptions.paperheight <= 0)
      )
        return {
          allowed: false,
          reason: "The reviewed pdf paper height must be a positive number of inches with no code cap.",
        };
      if (pdfoptions.margins !== undefined) {
        const margins = pdfoptions.margins;
        if (!margins || typeof margins !== "object" || Array.isArray(margins))
          return {
            allowed: false,
            reason: "The reviewed pdf margins must be an object with top, right, bottom and left inches.",
          };
        for (const side of ["top", "right", "bottom", "left"]) {
          const value = (margins as Record<string, unknown>)[side];
          if (value === undefined) continue;
          if (typeof value !== "number" || !Number.isFinite(value) || value < 0)
            return {
              allowed: false,
              reason: `The reviewed pdf ${side} margin must be zero or a positive number of inches; negative margins are refused.`,
            };
        }
      }
      if (
        pdfoptions.scale !== undefined &&
        (typeof pdfoptions.scale !== "number" || !Number.isFinite(pdfoptions.scale) || pdfoptions.scale <= 0)
      )
        return { allowed: false, reason: "The reviewed pdf scale must be a positive number with no code cap." };
      if (pdfoptions.landscape !== undefined && typeof pdfoptions.landscape !== "boolean")
        return { allowed: false, reason: "The reviewed pdf landscape flag must be a boolean." };
      if (pdfoptions.paginate !== undefined && typeof pdfoptions.paginate !== "boolean")
        return { allowed: false, reason: "The reviewed pdf paginate flag must be a boolean." };
    }
    if (
      options.breakpoints !== undefined &&
      (!Array.isArray(options.breakpoints) ||
        options.breakpoints.length === 0 ||
        !options.breakpoints.every((item) => isnonempty(item)))
    )
      return {
        allowed: false,
        reason: "The reviewed pdf break points must be a non-empty list of selectors when present.",
      };
    if (options.exporttarget !== undefined && options.exporttarget !== "memory" && options.exporttarget !== "download")
      return {
        allowed: false,
        reason:
          "The reviewed pdf export target must be memory or download; pdf documents do not route to the clipboard.",
      };
    if (options.name !== undefined && !isnonempty(options.name))
      return { allowed: false, reason: "The reviewed pdf artifact name must be a non-empty string." };
  }
  if (kind === "recordscreen" || kind === "captureaudio") {
    const recording = options.recording;
    if (recording !== undefined) {
      if (!recording || typeof recording !== "object" || Array.isArray(recording))
        return { allowed: false, reason: "The reviewed recording options must be an object in options.recording." };
      const recordoptions = recording as Record<string, unknown>;
      if (recordoptions.scope !== undefined && recordoptions.scope !== "tab" && recordoptions.scope !== "run")
        return { allowed: false, reason: "The reviewed recording scope must be tab or run." };
      if (
        recordoptions.fps !== undefined &&
        (typeof recordoptions.fps !== "number" || !Number.isFinite(recordoptions.fps) || recordoptions.fps <= 0)
      )
        return { allowed: false, reason: "The reviewed recording fps must be a positive number with no code ceiling." };
      if (
        recordoptions.bitrate !== undefined &&
        (typeof recordoptions.bitrate !== "number" ||
          !Number.isFinite(recordoptions.bitrate) ||
          recordoptions.bitrate <= 0)
      )
        return {
          allowed: false,
          reason: "The reviewed recording bitrate must be a positive number with no code ceiling.",
        };
      if (recordoptions.audio !== undefined && typeof recordoptions.audio !== "boolean")
        return { allowed: false, reason: "The reviewed recording audio flag must be a boolean." };
    }
    if (
      options.duration !== undefined &&
      (typeof options.duration !== "number" || !Number.isFinite(options.duration) || options.duration <= 0)
    )
      return {
        allowed: false,
        reason: "The reviewed recording duration must be a positive number of milliseconds with no code ceiling.",
      };
    const consent = recordingconsentgranted(step);
    if (!consent.allowed) return consent;
  }
  if (kind === "captureframe") {
    if (
      options.timestamp !== undefined &&
      (typeof options.timestamp !== "number" || !Number.isFinite(options.timestamp) || options.timestamp < 0)
    )
      return { allowed: false, reason: "The reviewed frame timestamp must be zero or a positive number of seconds." };
    if (options.poster !== undefined && typeof options.poster !== "boolean")
      return { allowed: false, reason: "The reviewed poster flag must be a boolean." };
    const capturecheck = validatecaptureoptions(options.capture);
    if (!capturecheck.allowed) return capturecheck;
  }
  if (kind === "downloadimages") {
    const filter = options.imagefilter;
    if (!filter || typeof filter !== "object" || Array.isArray(filter))
      return { allowed: false, reason: "A reviewed imagefilter is required in options before any image downloads." };
    const imagefilter = filter as Record<string, unknown>;
    if (imagefilter.selector !== undefined && !isnonempty(imagefilter.selector))
      return {
        allowed: false,
        reason: "The reviewed imagefilter selector must be a non-empty selector from the reviewed selector grammar.",
      };
    if (
      imagefilter.minwidth !== undefined &&
      (typeof imagefilter.minwidth !== "number" || !Number.isFinite(imagefilter.minwidth) || imagefilter.minwidth < 0)
    )
      return {
        allowed: false,
        reason: "The reviewed imagefilter minimum width must be zero or a positive number of pixels.",
      };
    if (
      imagefilter.minheight !== undefined &&
      (typeof imagefilter.minheight !== "number" ||
        !Number.isFinite(imagefilter.minheight) ||
        imagefilter.minheight < 0)
    )
      return {
        allowed: false,
        reason: "The reviewed imagefilter minimum height must be zero or a positive number of pixels.",
      };
    if (
      imagefilter.formats !== undefined &&
      (!Array.isArray(imagefilter.formats) ||
        imagefilter.formats.length === 0 ||
        !imagefilter.formats.every((item) => isnonempty(item)))
    )
      return {
        allowed: false,
        reason:
          "The reviewed imagefilter format list must be a non-empty list of mime or extension patterns when present.",
      };
    if (options.naming !== undefined) {
      const namingcheck = validatecapturenaming(options.naming);
      if (!namingcheck.allowed) return namingcheck;
    }
  }
  if (kind === "shotcanvas") {
    const capturecheck = validatecaptureoptions(options.capture);
    if (!capturecheck.allowed) return capturecheck;
  }
  if (kind === "probestream" && options.selector !== undefined && !isnonempty(options.selector))
    return { allowed: false, reason: "The reviewed stream probe scope selector must be a non-empty string." };
  if (kind === "timelapse") {
    const lapse = options.lapse;
    if (!lapse || typeof lapse !== "object" || Array.isArray(lapse))
      return {
        allowed: false,
        reason: "A reviewed lapse plan with interval, duration and format is required in options.",
      };
    const plan = lapse as Record<string, unknown>;
    if (typeof plan.interval !== "number" || !Number.isFinite(plan.interval) || plan.interval <= 0)
      return {
        allowed: false,
        reason: "The reviewed lapse interval must be a positive number of milliseconds with no code ceiling.",
      };
    if (typeof plan.duration !== "number" || !Number.isFinite(plan.duration) || plan.duration <= 0)
      return {
        allowed: false,
        reason: "The reviewed lapse duration must be a positive number of milliseconds with no code ceiling.",
      };
    if (plan.format !== undefined && plan.format !== "png" && plan.format !== "jpeg" && plan.format !== "webp")
      return { allowed: false, reason: "The reviewed lapse format must be png, jpeg or webp." };
    const budget = lapsebudgetallowed(
      plan.interval as number,
      plan.duration as number,
      typeof options.wait === "number" ? options.wait : undefined,
    );
    if (!budget.allowed) return budget;
    const capturecheck = validatecaptureoptions(options.capture);
    if (!capturecheck.allowed) return capturecheck;
  }
  if (kind === "convertimage" || kind === "makethumbs") {
    const single = options.capture;
    const list = options.captures;
    const hasone = isnonempty(single);
    const haslist = Array.isArray(list) && list.length > 0 && list.every((item) => isnonempty(item));
    if (!hasone && !haslist)
      return {
        allowed: false,
        reason: "A reviewed capture id or a reviewed non-empty capture id list is required in options.",
      };
    if (hasone && haslist)
      return { allowed: false, reason: "The reviewed step needs one capture id or a capture id list, not both." };
  }
  if (kind === "convertimage") {
    const convert = options.convert;
    if (!convert || typeof convert !== "object" || Array.isArray(convert))
      return { allowed: false, reason: "A reviewed convert directive with a target format is required in options." };
    const directive = convert as Record<string, unknown>;
    if (directive.target !== "png" && directive.target !== "jpeg" && directive.target !== "webp")
      return { allowed: false, reason: "The reviewed conversion target must be png, jpeg or webp." };
    if (
      directive.source !== undefined &&
      directive.source !== "png" &&
      directive.source !== "jpeg" &&
      directive.source !== "webp"
    )
      return { allowed: false, reason: "The reviewed conversion source must be png, jpeg or webp." };
    if (
      directive.quality !== undefined &&
      (typeof directive.quality !== "number" ||
        !Number.isFinite(directive.quality) ||
        directive.quality < 0 ||
        directive.quality > 100)
    )
      return {
        allowed: false,
        reason:
          "The reviewed conversion quality must stay between zero and one hundred with no code cap inside that range.",
      };
  }
  if (kind === "makethumbs") {
    const thumb = options.thumb;
    if (!thumb || typeof thumb !== "object" || Array.isArray(thumb))
      return { allowed: false, reason: "A reviewed thumb directive with size, fit and suffix is required in options." };
    const directive = thumb as Record<string, unknown>;
    if (typeof directive.size !== "number" || !Number.isFinite(directive.size) || directive.size <= 0)
      return {
        allowed: false,
        reason: "The reviewed thumbnail size must be a positive number of pixels with no fixed set.",
      };
    if (directive.fit !== "cover" && directive.fit !== "contain")
      return { allowed: false, reason: "The reviewed thumbnail fit must be cover or contain." };
    if (!isnonempty(directive.suffix))
      return { allowed: false, reason: "The reviewed thumbnail naming suffix must be a non-empty string." };
  }
  return { allowed: true };
}

/** Validates a single proposal against the active tab origin and local policy. */
export function validatestep(step: toolstep, origin: string): policyevaluation {
  if (!allowedactions.has(step.kind)) return { allowed: false, reason: "Unsupported action kind." };
  if (!step.summary.trim()) return { allowed: false, reason: "A human-readable action summary is required." };
  let options: Record<string, unknown>;
  try {
    options = parseoptions(step);
  } catch {
    return { allowed: false, reason: "Step options must be a JSON object." };
  }
  const hastargetref = options.targetref !== undefined;
  if (targetactions.has(step.kind) && !step.target?.trim() && !hastargetref)
    return { allowed: false, reason: "A page target is required." };
  if (valueactions.has(step.kind) && !step.value?.trim())
    return { allowed: false, reason: "A reviewed value is required." };
  if (step.kind === "select" && !step.value?.trim())
    return { allowed: false, reason: "A reviewed option value is required." };
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
      if (new URL(step.value ?? "").origin !== origin)
        return { allowed: false, reason: "Navigation must remain within the approved origin." };
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
  if (
    step.kind === "tabactivate" ||
    step.kind === "tabclose" ||
    step.kind === "tabreload" ||
    step.kind === "windowclose" ||
    step.kind === "windowresize"
  ) {
    if (!isnumericid(step.value)) return { allowed: false, reason: "A numeric browser id is required." };
  }
  if (step.kind === "zoomset") {
    const zoom = Number(step.value);
    if (!Number.isFinite(zoom) || zoom <= 0)
      return { allowed: false, reason: "The reviewed zoom must be a positive number." };
  }
  if (step.kind === "setattribute" || step.kind === "writestorage") {
    const keyname = step.kind === "setattribute" ? "name" : "key";
    if (typeof options[keyname] !== "string" || !(options[keyname] as string).trim())
      return { allowed: false, reason: `A reviewed ${keyname} is required in options.` };
    if (typeof options.value !== "string")
      return { allowed: false, reason: "A reviewed value is required in options." };
  }
  if (step.kind === "windowresize") {
    if (
      typeof options.width !== "number" ||
      typeof options.height !== "number" ||
      !Number.isFinite(options.width) ||
      !Number.isFinite(options.height)
    )
      return { allowed: false, reason: "Reviewed width and height numbers are required in options." };
  }
  if (
    (step.kind === "scrollpage" || step.kind === "scrollby") &&
    (!numericoption(options, "x") || !numericoption(options, "y"))
  )
    return { allowed: false, reason: "Scroll amounts must be numbers in options." };
  if (
    step.kind === "waitfor" &&
    options.timeout !== undefined &&
    (typeof options.timeout !== "number" || options.timeout < 0)
  )
    return { allowed: false, reason: "The waitfor timeout must be zero or a positive number of milliseconds." };
  if (step.kind === "movepointer") {
    const path = options.pointpath;
    if (!path || typeof path !== "object" || Array.isArray(path))
      return { allowed: false, reason: "A reviewed pointpath with start and end points is required in options." };
    const points = path as Record<string, unknown>;
    if (!ispoint(points.start) || !ispoint(points.end))
      return { allowed: false, reason: "The reviewed pointpath needs numeric start and end points." };
    if (
      points.waypoints !== undefined &&
      (!Array.isArray(points.waypoints) || !points.waypoints.every((waypoint) => ispoint(waypoint)))
    )
      return { allowed: false, reason: "The reviewed pointpath waypoints must be numeric points." };
    if (!nonnegativeoption(points, "duration"))
      return {
        allowed: false,
        reason: "The reviewed pointpath duration must be zero or a positive number of milliseconds.",
      };
    const speed = options.speedprofile;
    if (speed !== undefined) {
      if (!speed || typeof speed !== "object" || Array.isArray(speed))
        return { allowed: false, reason: "The reviewed speed profile must be an object." };
      const profile = speed as Record<string, unknown>;
      if (profile.easing !== undefined && profile.easing !== "linear" && profile.easing !== "easeinout")
        return { allowed: false, reason: "The reviewed easing must be linear or easeinout." };
      if (!nonnegativeoption(profile, "peak"))
        return { allowed: false, reason: "The reviewed peak velocity must be zero or a positive number." };
      if (!nonnegativeoption(profile, "jitter"))
        return {
          allowed: false,
          reason: "The reviewed jitter window must be zero or a positive number of milliseconds.",
        };
    }
  }
  if (step.kind === "clickpoint" && (!hastargetref || (options.targetref as Record<string, unknown>).mode !== "point"))
    return { allowed: false, reason: "A reviewed point target reference is required in options." };
  if (step.kind === "clicktext" && (!hastargetref || (options.targetref as Record<string, unknown>).mode !== "text"))
    return { allowed: false, reason: "A reviewed text target reference is required in options." };
  if (step.kind === "clickaria" && (!hastargetref || (options.targetref as Record<string, unknown>).mode !== "aria"))
    return { allowed: false, reason: "A reviewed aria target reference is required in options." };
  if (step.kind === "clickname" && (!hastargetref || (options.targetref as Record<string, unknown>).mode !== "name"))
    return { allowed: false, reason: "A reviewed name target reference is required in options." };
  if (
    step.kind === "resolvexpath" &&
    (!hastargetref || (options.targetref as Record<string, unknown>).mode !== "xpath")
  )
    return { allowed: false, reason: "A reviewed xpath target reference is required in options." };
  if (
    step.kind === "typetime" &&
    options.delay !== undefined &&
    (typeof options.delay !== "number" || !Number.isFinite(options.delay) || options.delay < 0)
  )
    return {
      allowed: false,
      reason: "The reviewed per keystroke delay must be zero or a positive number of milliseconds.",
    };
  if (step.kind === "submitsearch") {
    if (!isnonempty(options.results))
      return { allowed: false, reason: "A reviewed results region selector is required in options." };
    if (
      options.timeout !== undefined &&
      (typeof options.timeout !== "number" || !Number.isFinite(options.timeout) || options.timeout < 0)
    )
      return { allowed: false, reason: "The submitsearch timeout must be zero or a positive number of milliseconds." };
  }
  if (step.kind === "selectmulti") {
    const values = options.values;
    if (!Array.isArray(values) || values.length === 0 || !values.every((value) => isnonempty(value)))
      return { allowed: false, reason: "A reviewed list of option values is required in options." };
  }
  if (step.kind === "setslider") {
    const slider = Number(step.value);
    if (!Number.isFinite(slider)) return { allowed: false, reason: "The reviewed slider value must be a number." };
  }
  if (step.kind === "setdate" && !/^\d{4}-\d{2}-\d{2}$/.test(step.value ?? ""))
    return { allowed: false, reason: "The reviewed date must use the yyyy-mm-dd form." };
  if (step.kind === "setcolor" && !/^#[0-9a-fA-F]{6}$/.test(step.value ?? ""))
    return { allowed: false, reason: "The reviewed color must use the #rrggbb form." };
  if (step.kind === "keyhold" && options.holdid !== undefined && !isnonempty(options.holdid))
    return { allowed: false, reason: "The reviewed hold id must be a non-empty string." };
  if (step.kind === "dismissdialog") {
    const accept = options.accept;
    const answer = options.answer;
    if (accept === undefined && !isnonempty(answer))
      return { allowed: false, reason: "A reviewed accept flag or prompt answer is required in options." };
    if (accept !== undefined && typeof accept !== "boolean")
      return { allowed: false, reason: "The reviewed dialog accept flag must be a boolean." };
    if (answer !== undefined && !isnonempty(answer))
      return { allowed: false, reason: "The reviewed prompt answer must be a non-empty string." };
  }
  if (step.kind === "pierceshadow" && options.shadow !== undefined) {
    if (!Array.isArray(options.shadow) || !options.shadow.every((item) => isnonempty(item)))
      return { allowed: false, reason: "The reviewed shadow path must be a list of non-empty selectors." };
  }
  if (step.kind === "enterframe") {
    const path = options.framepath;
    if (
      !Array.isArray(path) ||
      path.length === 0 ||
      !path.every((item) => typeof item === "number" && Number.isInteger(item) && item >= 0)
    )
      return { allowed: false, reason: "A reviewed frame path of frame indexes is required in options." };
    return validateinnerstep(options, origin);
  }
  if (step.kind === "retryaction") {
    const inner = validateinnerstep(options, origin);
    if (!inner.allowed) return inner;
    const rule = options.retryrule;
    if (!rule || typeof rule !== "object" || Array.isArray(rule))
      return { allowed: false, reason: "A reviewed retry rule with attempts is required in options." };
    const retry = rule as Record<string, unknown>;
    if (typeof retry.attempts !== "number" || !Number.isInteger(retry.attempts) || retry.attempts < 1)
      return { allowed: false, reason: "The reviewed retry attempts must be a positive integer with no code ceiling." };
    if (!nonnegativeoption(retry, "settle"))
      return {
        allowed: false,
        reason: "The reviewed retry settle window must be zero or a positive number of milliseconds.",
      };
    if (!nonnegativeoption(retry, "tolerance"))
      return {
        allowed: false,
        reason: "The reviewed retry movement tolerance must be zero or a positive number of pixels.",
      };
  }
  if (watchactions.has(step.kind)) {
    if (typeof options.lifetime !== "number" || !Number.isFinite(options.lifetime) || options.lifetime <= 0)
      return { allowed: false, reason: "A reviewed watch lifetime window in milliseconds is required in options." };
    if (
      options.scopes !== undefined &&
      (!Array.isArray(options.scopes) || !options.scopes.every((scope) => isnonempty(scope)))
    )
      return { allowed: false, reason: "The reviewed watch scopes must be a list of non-empty selectors." };
    if (
      options.events !== undefined &&
      (!Array.isArray(options.events) || !options.events.every((event) => isnonempty(event)))
    )
      return { allowed: false, reason: "The reviewed watch event kinds must be a list of non-empty strings." };
    if (!nonnegativeoption(options, "poll"))
      return {
        allowed: false,
        reason: "The reviewed watch poll interval must be zero or a positive number of milliseconds.",
      };
  }
  if (step.kind === "waitquiet") {
    const rule = options.quietrule;
    if (!rule || typeof rule !== "object" || Array.isArray(rule))
      return { allowed: false, reason: "A reviewed quietrule with an idle threshold is required in options." };
    const quiet = rule as Record<string, unknown>;
    if (typeof quiet.idle !== "number" || !Number.isFinite(quiet.idle) || quiet.idle <= 0)
      return {
        allowed: false,
        reason: "The reviewed quiet idle threshold must be a positive number of milliseconds with no code ceiling.",
      };
    if (!nonnegativeoption(quiet, "poll"))
      return {
        allowed: false,
        reason: "The reviewed quiet poll interval must be zero or a positive number of milliseconds.",
      };
    if (!nonnegativeoption(quiet, "timeout"))
      return {
        allowed: false,
        reason: "The reviewed quiet timeout must be zero or a positive number of milliseconds.",
      };
  }
  if (step.kind === "diffsnapshots") {
    const versions = options.versions;
    if (
      !Array.isArray(versions) ||
      versions.length !== 2 ||
      !versions.every((version) => typeof version === "number" && Number.isInteger(version) && version >= 1)
    )
      return { allowed: false, reason: "Two reviewed observation version numbers are required in options." };
  }
  if (step.kind === "openlink" || step.kind === "openprivate" || step.kind === "deeplink") {
    const targetcheck = validatenavtarget(options.navtarget, step.kind);
    if (!targetcheck.allowed) return targetcheck;
    if (step.kind === "deeplink") {
      const app = options.app;
      if (!isnonempty(app))
        return { allowed: false, reason: "A reviewed deep link app pattern is required in options." };
      const params = options.params;
      if (
        params !== undefined &&
        (!params ||
          typeof params !== "object" ||
          Array.isArray(params) ||
          !Object.values(params).every((item) => typeof item === "string"))
      )
        return { allowed: false, reason: "The reviewed deep link params must be an object of string values." };
    }
  }
  if (step.kind === "waitload" && !nonnegativeoption(options, "timeout"))
    return { allowed: false, reason: "The waitload timeout must be zero or a positive number of milliseconds." };
  if (step.kind === "waiturl" || step.kind === "spawait") {
    if (step.kind === "waiturl") {
      const patterncheck = validateurlpattern(options.urlpattern);
      if (!patterncheck.allowed) return patterncheck;
    }
    if (!nonnegativeoption(options, "timeout"))
      return { allowed: false, reason: "The wait timeout must be zero or a positive number of milliseconds." };
    if (!nonnegativeoption(options, "poll"))
      return { allowed: false, reason: "The wait poll interval must be zero or a positive number of milliseconds." };
  }
  if (step.kind === "followlink") {
    if (options.fragment !== undefined && typeof options.fragment !== "boolean")
      return { allowed: false, reason: "The reviewed followlink fragment flag must be a boolean." };
  }
  if (step.kind === "spanav") {
    if (options.routepattern !== undefined) {
      const routecheck = validateurlpattern(options.routepattern);
      if (!routecheck.allowed) return routecheck;
    }
    if (!nonnegativeoption(options, "timeout"))
      return { allowed: false, reason: "The spanav route timeout must be zero or a positive number of milliseconds." };
  }
  if (step.kind === "rewritequery") {
    const set = options.set;
    const remove = options.remove;
    if (set === undefined && remove === undefined)
      return { allowed: false, reason: "Reviewed query parameters to set or remove are required in options." };
    if (
      set !== undefined &&
      (!set ||
        typeof set !== "object" ||
        Array.isArray(set) ||
        !Object.values(set).every((item) => typeof item === "string"))
    )
      return { allowed: false, reason: "The reviewed query parameters to set must be an object of string values." };
    if (remove !== undefined && (!Array.isArray(remove) || !remove.every((item) => isnonempty(item))))
      return { allowed: false, reason: "The reviewed query parameters to remove must be a list of non-empty names." };
  }
  if (step.kind === "navlist") {
    const listcheck = validateurllist(options, "urls");
    if (!listcheck.allowed) return listcheck;
  }
  if (step.kind === "navprofile") {
    const profilecheck = validatewaitprofile(options.waitprofile);
    if (!profilecheck.allowed) return profilecheck;
  }
  if (step.kind === "handleauth" && !ishttpsurl(step.value))
    return { allowed: false, reason: "A reviewed HTTPS origin or url is required as the auth target." };
  if (step.kind === "printpdf" && options.name !== undefined && !isnonempty(options.name))
    return { allowed: false, reason: "The reviewed artifact name must be a non-empty string." };
  if (step.kind === "prefetch") {
    const listcheck = validateurllist(options, "urls");
    if (!listcheck.allowed) return listcheck;
  }
  if (step.kind === "preconnect") {
    const origins = options.origins;
    if (!Array.isArray(origins) || origins.length === 0 || !origins.every((originurl) => ishttpsurl(originurl)))
      return { allowed: false, reason: "A reviewed non-empty list of HTTPS origins is required in options." };
  }
  if (step.kind === "reopentab" && step.value !== undefined && !ishttpsurl(step.value))
    return { allowed: false, reason: "The reviewed reopen url must use HTTPS." };
  if (step.kind === "navrate") {
    const limitcheck = validateratelimit(options.ratelimit);
    if (!limitcheck.allowed) return limitcheck;
  }
  if (step.kind === "checksafe" && !ishttpsurl(step.value))
    return { allowed: false, reason: "A reviewed HTTPS url is required for the safety check." };
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
    if (options.background !== undefined && typeof options.background !== "boolean")
      return { allowed: false, reason: "The reviewed background flag must be a boolean." };
    if (
      options.window !== undefined &&
      (typeof options.window !== "number" || !Number.isInteger(options.window) || options.window < 0)
    )
      return { allowed: false, reason: "The reviewed target window id must be a non-negative integer." };
  }
  if (step.kind === "windowcreate") {
    for (const field of ["left", "top", "width", "height"]) {
      if (options[field] !== undefined && (typeof options[field] !== "number" || !Number.isFinite(options[field])))
        return { allowed: false, reason: `The reviewed window ${field} must be a number.` };
    }
    if (
      options.state !== undefined &&
      !["normal", "maximized", "minimized", "fullscreen"].includes(options.state as string)
    )
      return {
        allowed: false,
        reason: "The reviewed window state must be normal, maximized, minimized or fullscreen.",
      };
  }
  return { allowed: true };
}

/** Shared session gate: a live, unpaused session that still matches the active tab. */
function sessiongate(input: {
  session: agentsession | undefined;
  tabid: number;
  origin: string;
  now: number;
  action: string;
}): policyevaluation {
  if (!input.session || input.session.stoppedat) return { allowed: false, reason: "No active browser session exists." };
  if (input.session.expiresat <= input.now) return { allowed: false, reason: "The browser session has expired." };
  if (input.session.pausedat)
    return { allowed: false, reason: `The browser session is paused and cannot ${input.action}.` };
  if (input.session.tabid !== input.tabid || input.session.origin !== input.origin)
    return { allowed: false, reason: `The ${input.action} is outside the approved tab or origin.` };
  return { allowed: true };
}

/** Applies the consent gate immediately before an action reaches the page bridge; the 1.1.70 run lifecycle refuses steps of a queued, cancelled or rolledback run and requires a fresh heartbeat before sensitive steps. */
export function canexecute(input: {
  session: agentsession | undefined;
  plan: agentplan | undefined;
  step: toolstep;
  tabid: number;
  origin: string;
  now?: number;
  verdicts?: safetyverdict[];
  settings?: runsettings;
  run?: runrecord;
  heartbeat?: heartbeatrecord;
}): policyevaluation {
  const now = input.now ?? Date.now();
  const gate = sessiongate({
    session: input.session,
    tabid: input.tabid,
    origin: input.origin,
    now,
    action: "execute an action",
  });
  if (!gate.allowed) return gate;
  if (!input.plan || input.plan.state !== "approved")
    return { allowed: false, reason: "The plan has not received explicit approval." };
  if (input.plan.expiresat <= now) return { allowed: false, reason: "The approved plan has expired." };
  if (input.run !== undefined && input.run.state === "queued")
    return {
      allowed: false,
      reason: `The run ${input.run.runid} sits queued in the offlinequeue; a queued run executes no step before the replay or the executor moves it to running.`,
    };
  if (input.run !== undefined && (input.run.state === "cancelled" || input.run.state === "rolledback"))
    return {
      allowed: false,
      reason: `The run ${input.run.runid} is ${input.run.state}; a stopped run executes no further step.`,
    };
  if (input.run !== undefined && input.step.risk === "sensitive") {
    if (input.heartbeat === undefined)
      return {
        allowed: false,
        reason: `The sensitive step ${input.step.id} needs a fresh run heartbeat; no heartbeat stands on record for the run ${input.run.runid}.`,
      };
    const window = input.settings?.heartbeatwindow ?? 60_000;
    if (now - input.heartbeat.at > window)
      return {
        allowed: false,
        reason: `The heartbeat of the run ${input.run.runid} is stale past the user window of ${window} milliseconds; the sensitive step ${input.step.id} waits for a fresh beat.`,
      };
  }
  if (
    (input.step.kind === "pierceshadow" || input.step.kind === "enterframe") &&
    !origingranted(input.session, input.origin)
  )
    return { allowed: false, reason: "The shadow or frame step is outside the session origin grants." };
  if (input.step.kind === "readjson" && !origingranted(input.session, input.origin))
    return { allowed: false, reason: "The json state read is outside the session origin grants." };
  if (isexportkind(input.step.kind)) {
    const exportgate = exportgranted(input.session, input.origin);
    if (!exportgate.allowed) return exportgate;
  }
  if (input.step.kind === "navlist") {
    let options: Record<string, unknown> = {};
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
  if (islayoutkind(input.step.kind) && !layoutmutationgranted(input.session, now).allowed)
    return { allowed: false, reason: "Group and layout mutations stay inside the active session." };
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
  if (input.step.kind === "interceptmime" && !origingranted(input.session, input.origin))
    return { allowed: false, reason: "The download interception is outside the session origin grants." };
  if (iscapturekind(input.step.kind)) {
    const capturegatecheck = capturegate(input.session, input.tabid, input.origin, now);
    if (!capturegatecheck.allowed) return capturegatecheck;
    let captureoptions: Record<string, unknown> = {};
    try {
      captureoptions = parseoptions(input.step);
    } catch {
      captureoptions = {};
    }
    const target = (captureoptions.capture as Record<string, unknown> | undefined)?.exporttarget;
    if (target !== undefined && target !== "memory" && target !== "download" && target !== "clipboard")
      return { allowed: false, reason: "The capture export target must be memory, download or clipboard." };
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
    if (target !== undefined) {
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
    if (channelurl !== undefined) {
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
      if (allowlist === undefined)
        return {
          allowed: false,
          reason:
            "The devtools protocol step needs the attachcdp step of the same plan with its enabled domains first.",
        };
      if (input.step.kind === "cdpcmd") {
        let cdpoptions: Record<string, unknown> = {};
        try {
          cdpoptions = parseoptions(input.step);
        } catch {
          cdpoptions = {};
        }
        const command =
          cdpoptions.command && typeof cdpoptions.command === "object" && !Array.isArray(cdpoptions.command)
            ? (cdpoptions.command as Record<string, unknown>)
            : undefined;
        const method = typeof command?.method === "string" ? command.method : "";
        if (methoddomain(method) === undefined || !allowlistcovers(allowlist, method))
          return {
            allowed: false,
            reason: `The raw command ${method || ""} stays outside the enabled domain allowlist of the plan attach; review the attach domains or the method gates.`,
          };
      }
    }
    let cdpoptions: Record<string, unknown> = {};
    try {
      cdpoptions = parseoptions(input.step);
    } catch {
      cdpoptions = {};
    }
    if (input.step.kind === "setbreakpoint") {
      const breakpoint = breakpointinputof(cdpoptions.breakpoint);
      if (breakpoint) {
        const targetgate = origincheck(input.session, breakpoint.url);
        if (!targetgate.allowed) return targetgate;
      }
    }
    if (input.step.kind === "overridescript") {
      const override = overrideinputof(cdpoptions.override);
      if (override) {
        const targetgate = origincheck(input.session, override.urlpattern);
        if (!targetgate.allowed) return targetgate;
      }
    }
  }
  if (isprofilekind(input.step.kind)) {
    let profileoptions: Record<string, unknown> = {};
    try {
      profileoptions = parseoptions(input.step);
    } catch {
      profileoptions = {};
    }
    const targets = [
      ...(attachtargetof(profileoptions.target) !== undefined
        ? [attachtargetof(profileoptions.target) as attachtarget]
        : []),
      ...(Array.isArray(profileoptions.attachtargets)
        ? profileoptions.attachtargets.flatMap((target) => {
            const parsed = attachtargetof(target);
            return parsed !== undefined ? [parsed] : [];
          })
        : []),
    ];
    const targetgatecheck = targetgate({
      session: input.session,
      tabid: input.tabid,
      origin: input.origin,
      targets,
      grants: undefined,
      now,
    });
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
    const emugatecheck = emugate({
      session: input.session,
      plan: input.plan,
      step: input.step,
      tabid: input.tabid,
      origin: input.origin,
      now,
    });
    if (!emugatecheck.allowed) return emugatecheck;
  }
  if (issessionkind(input.step.kind)) {
    const sessiongatecheck = sessionrestoregate({
      session: input.session,
      plan: input.plan,
      step: input.step,
      tabid: input.tabid,
      origin: input.origin,
      now,
    });
    if (!sessiongatecheck.allowed) return sessiongatecheck;
    if (input.step.kind === "restoresession") {
      let restoreoptions: Record<string, unknown> = {};
      try {
        restoreoptions = parseoptions(input.step);
      } catch {
        restoreoptions = {};
      }
      for (const url of Array.isArray(restoreoptions.origins) ? restoreoptions.origins : []) {
        if (typeof url !== "string" || !url) continue;
        const origingate = origincheck(input.session, url);
        if (!origingate.allowed)
          return {
            allowed: false,
            reason: `The session restore reopens ${url} outside the session origin grants; review the restore record or grant the origin.`,
          };
      }
    }
  }
  if (isworkflowkind(input.step.kind)) {
    const workflowgatecheck = workflowgate({
      session: input.session,
      plan: input.plan,
      step: input.step,
      tabid: input.tabid,
      origin: input.origin,
      now,
    });
    if (!workflowgatecheck.allowed) return workflowgatecheck;
  }
  if (istriggeraction(input.step.kind)) {
    const triggergatecheck = triggergate({
      session: input.session,
      plan: input.plan,
      step: input.step,
      tabid: input.tabid,
      origin: input.origin,
      now,
    });
    if (!triggergatecheck.allowed) return triggergatecheck;
  }
  if (iscontrolkind(input.step.kind)) {
    const controlgate = sessiongate({
      session: input.session,
      tabid: input.tabid,
      origin: input.origin,
      now,
      action: "control the network",
    });
    if (!controlgate.allowed) return controlgate;
    let controloptions: Record<string, unknown> = {};
    try {
      controloptions = parseoptions(input.step);
    } catch {
      controloptions = {};
    }
    if (input.step.kind === "blockrequest") {
      const blockgatecheck = blockgate(input.session, input.step, now);
      if (!blockgatecheck.allowed) return blockgatecheck;
      const rule = blockruleof(controloptions.block);
      if (rule) {
        const blockorigin = origincheck(input.session, rule.urlpattern);
        if (!blockorigin.allowed) return blockorigin;
      }
    }
    if (input.step.kind === "mockresponse" || input.step.kind === "rewriteheaders") {
      const patterns =
        input.step.kind === "mockresponse"
          ? [mockspecof(controloptions.mock)?.urlpattern ?? ""]
          : Array.isArray(controloptions.rules)
            ? controloptions.rules.map((item) =>
                item && typeof item === "object" && !Array.isArray(item)
                  ? String((item as Record<string, unknown>).urlpattern ?? "")
                  : "",
              )
            : [];
      for (const pattern of patterns) {
        const patterngate = origincheck(input.session, pattern);
        if (!patterngate.allowed) return patterngate;
      }
    }
    if (input.step.kind === "setcookies" || input.step.kind === "readcookies" || input.step.kind === "clearcookies") {
      const domain =
        typeof controloptions.domain === "string" && controloptions.domain.trim()
          ? controloptions.domain
          : Array.isArray(controloptions.cookies)
            ? String((controloptions.cookies[0] as Record<string, unknown> | undefined)?.domain ?? "")
            : "";
      if (!domain)
        return { allowed: false, reason: "A reviewed cookie domain is required before cookie control runs." };
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
    if (target !== undefined) {
      const targetgate = origincheck(input.session, target);
      if (!targetgate.allowed) return targetgate;
    }
  }
  if (input.step.kind === "extractapi") {
    let replayoptions: Record<string, unknown> = {};
    try {
      replayoptions = parseoptions(input.step);
    } catch {
      replayoptions = {};
    }
    const replay = apireplayspecof(replayoptions.replay);
    if (replay !== undefined) {
      const replaygate = origincheck(input.session, replay.endpoint);
      if (!replaygate.allowed) return replaygate;
    }
  }
  if (
    input.step.kind === "openlink" ||
    input.step.kind === "openprivate" ||
    input.step.kind === "batchopen" ||
    input.step.kind === "prefetch" ||
    input.step.kind === "deeplink" ||
    input.step.kind === "reopentab"
  ) {
    let options: Record<string, unknown> = {};
    try {
      options = parseoptions(input.step);
    } catch {
      options = {};
    }
    const grammar = validatestep(input.step, input.origin);
    if (!grammar.allowed) return grammar;
    const grants = input.session?.grants ?? [input.session?.origin ?? input.origin];
    const targets: unknown[] =
      input.step.kind === "batchopen" || input.step.kind === "prefetch"
        ? Array.isArray(options.urls)
          ? options.urls
          : []
        : input.step.kind === "reopentab"
          ? [input.step.value]
          : [(options.navtarget as Record<string, unknown> | undefined)?.url];
    for (const target of targets) {
      if (typeof target !== "string" || !target) continue;
      const verified = originverified(target, grants, input.verdicts ?? []);
      if (!verified.allowed) return verified;
    }
  }
  return validatestep(input.step, input.origin);
}

/** Allows a non-mutating, temporary target preview during plan review. */
export function canpreview(input: {
  session: agentsession | undefined;
  plan: agentplan | undefined;
  step: toolstep;
  tabid: number;
  origin: string;
  now?: number;
}): policyevaluation {
  const now = input.now ?? Date.now();
  const gate = sessiongate({
    session: input.session,
    tabid: input.tabid,
    origin: input.origin,
    now,
    action: "preview a target",
  });
  if (!gate.allowed) return gate;
  if (!input.plan || !["pending", "approved"].includes(input.plan.state))
    return { allowed: false, reason: "Only a reviewed pending or approved plan can be previewed." };
  if (input.plan.expiresat <= now) return { allowed: false, reason: "The reviewed plan has expired." };
  let options: Record<string, unknown> = {};
  try {
    options = parseoptions(input.step);
  } catch {
    options = {};
  }
  if (!targetactions.has(input.step.kind) && options.targetref === undefined)
    return { allowed: false, reason: "Only a target-based action can be previewed." };
  return validatestep(input.step, input.origin);
}

/** Lists every reviewed action kind of the policy table so the step library of the editor browses the whole vocabulary. */
export function reviewedkinds(): string[] {
  return [...allowedactions].sort();
}

/** Lists every read side action kind of the policy table so the observer scopes and the readonly fleets narrow to the read side vocabulary. */
export function readonlyactionkinds(): string[] {
  return [...readactions].sort();
}

/** The editor save gate: the canvas model of a save needs a live session and an approved plan like every other reviewed artifact, its nodes must be steps or block invocations with unique ids, its edges must reference existing steps and run forward only so no cycle forms, and the composed record still passes the full workflow grammar through the composition the save triggers. */
export function editorsavegate(input: {
  session: agentsession | undefined;
  plan: agentplan | undefined;
  model: editormodel;
  now: number;
}): policyevaluation {
  const gate = sessiongate({
    session: input.session,
    tabid: input.session?.tabid ?? 0,
    origin: input.session?.origin ?? "https://example.com",
    now: input.now,
    action: "save the workflow editor canvas",
  });
  if (!gate.allowed) return gate;
  if (!input.plan || input.plan.state !== "approved")
    return {
      allowed: false,
      reason: "Editor saves need the approved plan review before a new workflow version composes.",
    };
  const model = input.model;
  if (typeof model.name !== "string" || !model.name.trim())
    return { allowed: false, reason: "The workflow name of the canvas must be a non-empty string." };
  if (typeof model.version !== "number" || !Number.isInteger(model.version) || model.version < 1)
    return { allowed: false, reason: "The workflow version of the canvas must be a positive integer." };
  if (!Array.isArray(model.origins) || model.origins.length === 0)
    return { allowed: false, reason: "The canvas needs at least one granted HTTPS origin." };
  const ids = new Set<string>();
  for (const node of model.nodes) {
    if ((node.step === undefined) === (node.invocation === undefined))
      return { allowed: false, reason: "Every canvas node must be exactly one workflow step or one block invocation." };
    const id = node.id ?? (node.step !== undefined ? node.step.id : (node.invocation as { block: string }).block);
    if (!id || ids.has(id)) return { allowed: false, reason: `The canvas node id ${id || "(empty)"} must be unique.` };
    ids.add(id);
  }
  const reachable = new Set<string>();
  for (const node of model.nodes) {
    if (node.step !== undefined) {
      reachable.add(node.step.id);
      continue;
    }
    const walk = (entries: Array<{ id?: string; kind?: string; label?: string; block?: string }>): void => {
      for (const entry of entries) {
        if (typeof entry.id === "string" && typeof entry.kind === "string") {
          reachable.add(entry.id);
          continue;
        }
        if (typeof entry.block === "string") {
          const nested = model.blocks.find((candidate) => candidate.name === entry.block);
          if (nested) walk(nested.steps as Array<{ id?: string; kind?: string; label?: string; block?: string }>);
        }
      }
    };
    const block = model.blocks.find((candidate) => candidate.name === (node.invocation as { block: string }).block);
    if (!block)
      return {
        allowed: false,
        reason: `The block ${(node.invocation as { block: string }).block} of the canvas has no definition.`,
      };
    walk(block.steps as Array<{ id?: string; kind?: string; label?: string; block?: string }>);
  }
  let order = 0;
  const positionof = new Map<string, number>();
  for (const node of model.nodes) {
    if (node.step !== undefined) {
      positionof.set(node.step.id, order);
      order += 1;
      continue;
    }
    const walk = (entries: Array<{ id?: string; kind?: string; label?: string; block?: string }>): void => {
      for (const entry of entries) {
        if (typeof entry.id === "string" && typeof entry.kind === "string") {
          positionof.set(entry.id, order);
          order += 1;
          continue;
        }
        if (typeof entry.block === "string") {
          const nested = model.blocks.find((candidate) => candidate.name === entry.block);
          if (nested) walk(nested.steps as Array<{ id?: string; kind?: string; label?: string; block?: string }>);
        }
      }
    };
    walk(
      (
        model.blocks.find((candidate) => candidate.name === (node.invocation as { block: string }).block) as {
          steps: Array<{ id?: string; kind?: string; label?: string; block?: string }>;
        }
      ).steps,
    );
  }
  for (const edge of model.edges) {
    if (!reachable.has(edge.from))
      return {
        allowed: false,
        reason: `The canvas edge of ${edge.variable} references the unknown source step ${edge.from}.`,
      };
    if (!reachable.has(edge.to))
      return {
        allowed: false,
        reason: `The canvas edge of ${edge.variable} references the unknown target step ${edge.to}.`,
      };
    if ((positionof.get(edge.from) ?? -1) >= (positionof.get(edge.to) ?? -1))
      return { allowed: false, reason: `The canvas edge of ${edge.variable} runs backwards and would form a cycle.` };
  }
  return { allowed: true };
}

/** Refuses to run a workflow whose review state stays pending: an imported workflow or a version rollback stays unreviewed until the user approves its expanded step list through the import or rollback review. */
export function runreviewgranted(record: workflowrecord): policyevaluation {
  if (record.reviewstate === "pending")
    return {
      allowed: false,
      reason:
        "The workflow stays unreviewed: the import or rollback review must approve its expanded step list before any run.",
    };
  return { allowed: true };
}

/** The reviewed policy knobs a per site override may adjust: loop safety bounds, per step and per run timeout budgets, element wait timeouts and delay bases. */
const overrideknobs = ["loopbound", "stepms", "runms", "waitms", "delaybase"];

/** Validates one per site policy override so overrides only adjust reviewed knobs: the pattern must be an https origin or a `*` subdomain glob of one and every delta must name a reviewed knob with a positive user value and no code ceiling. */
export function validatesiteoverride(override: { pattern: string; deltas: Record<string, number> }): policyevaluation {
  if (
    typeof override.pattern !== "string" ||
    !override.pattern.startsWith("https://") ||
    !/[a-z0-9.-]+/i.test(override.pattern.slice(8))
  )
    return { allowed: false, reason: "The override pattern must be an https origin or a `*` subdomain glob of one." };
  if (!override.pattern.includes("*")) {
    try {
      if (new URL(override.pattern).origin !== override.pattern)
        return {
          allowed: false,
          reason: "The override pattern must be a bare https origin or a `*` subdomain glob, never a path.",
        };
    } catch {
      return {
        allowed: false,
        reason: "The override pattern must parse as an https origin or a `*` subdomain glob of one.",
      };
    }
  }
  for (const [knob, delta] of Object.entries(override.deltas)) {
    if (!overrideknobs.includes(knob))
      return {
        allowed: false,
        reason: `The override knob ${knob} is not one of the reviewed knobs: ${overrideknobs.join(", ")}.`,
      };
    if (typeof delta !== "number" || !Number.isFinite(delta) || delta <= 0)
      return {
        allowed: false,
        reason: `The override delta of ${knob} must be a positive user value with no code ceiling.`,
      };
  }
  return { allowed: true };
}

/** Validates the export contents of a workflow file so secrets never leave the browser: every step options object of the workflow and of every packed template is parsed and any field that names a secret, token, api key, password or authorization header refuses the export. */
export function exportcontentreview(file: { workflow: workflowrecord; templates: steptemplate[] }): policyevaluation {
  const secretkeys = /(secret|token|apikey|api_key|password|authorization|credential)/i;
  const scan = (label: string, options: string | undefined): policyevaluation | undefined => {
    if (options === undefined) return undefined;
    let payload: unknown;
    try {
      payload = JSON.parse(options);
    } catch {
      return undefined;
    }
    const walk = (value: unknown, path: string): policyevaluation | undefined => {
      if (!value || typeof value !== "object") return undefined;
      for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
        if (secretkeys.test(key))
          return {
            allowed: false,
            reason: `The export of ${label} carries the secret field ${path}${key} and secrets never leave the browser.`,
          };
        const nested = walk(entry, `${path}${key}.`);
        if (nested !== undefined) return nested;
      }
      return undefined;
    };
    return walk(payload, "");
  };
  for (const step of file.workflow.steps) {
    const refusal = scan(`the step ${step.id}`, step.options);
    if (refusal !== undefined) return refusal;
  }
  for (const template of file.templates) {
    const refusal = scan(`the template ${template.name}`, template.step.options);
    if (refusal !== undefined) return refusal;
  }
  return { allowed: true };
}

/** Validates one watchdog configuration: the stall threshold stays a positive user value with no code ceiling, the recovery action is one of retry, pause or cancel and the zombie window, when configured, stays positive with no ceiling. */
export function watchdogconfigvalid(config: watchdogconfig): policyevaluation {
  if (typeof config.enabled !== "boolean")
    return { allowed: false, reason: "The watchdog enabled flag must be a boolean." };
  if (
    typeof config.stallthreshold !== "number" ||
    !Number.isFinite(config.stallthreshold) ||
    config.stallthreshold <= 0
  )
    return {
      allowed: false,
      reason: "The watchdog stall threshold must be a positive number of milliseconds with no code ceiling.",
    };
  if (!["retry", "pause", "cancel"].includes(config.action))
    return { allowed: false, reason: "The watchdog recovery action must be retry, pause or cancel." };
  if (
    config.zombiewindow !== undefined &&
    (typeof config.zombiewindow !== "number" || !Number.isFinite(config.zombiewindow) || config.zombiewindow <= 0)
  )
    return {
      allowed: false,
      reason:
        "The watchdog zombie window, when configured, must be a positive number of milliseconds with no code ceiling.",
    };
  return { allowed: true };
}

/** Validates one mcp tool catalog against the action kind grammar: every tool name stays namespaced and unique, every wrapped kind belongs to the reviewed vocabulary, every namespace keeps its tools inside its domain kinds and every input schema carries typed properties with its required list. */
export function validatetoolcatalog(catalog: toolcatalog): policyevaluation {
  if (!Array.isArray(catalog.domains) || catalog.domains.length === 0)
    return { allowed: false, reason: "The tool catalog needs its tool domains." };
  const seen = new Set<string>();
  for (const domain of catalog.domains) {
    if (!toolnamespaces.includes(domain.namespace))
      return { allowed: false, reason: `The tool domain ${String(domain.namespace)} is not a reviewed namespace.` };
    if (!Array.isArray(domain.tools) || domain.tools.length === 0)
      return { allowed: false, reason: `The ${domain.namespace} domain exposes no tools.` };
    for (const tool of domain.tools) {
      if (typeof tool.name !== "string" || !tool.name.startsWith(`${domain.namespace}.`))
        return {
          allowed: false,
          reason: `The tool ${String(tool.name)} does not carry its ${domain.namespace} namespace prefix.`,
        };
      if (seen.has(tool.name))
        return { allowed: false, reason: `The tool name ${tool.name} is not unique across the catalog.` };
      seen.add(tool.name);
      if (!allowedactions.has(tool.kind))
        return {
          allowed: false,
          reason: `The tool ${tool.name} wraps ${String(tool.kind)} which is outside the reviewed action kind grammar.`,
        };
      if (!domainkinds[domain.namespace].includes(tool.kind))
        return {
          allowed: false,
          reason: `The tool ${tool.name} wraps ${String(tool.kind)} which does not belong to the ${domain.namespace} domain.`,
        };
      if (typeof tool.description !== "string" || tool.description.trim() === "")
        return { allowed: false, reason: `The tool ${tool.name} needs its plain language description.` };
      const schema = tool.inputschema;
      if (
        !schema ||
        schema.type !== "object" ||
        schema.properties === undefined ||
        schema.properties === null ||
        typeof schema.properties !== "object" ||
        Array.isArray(schema.properties) ||
        Object.keys(schema.properties).length === 0
      )
        return {
          allowed: false,
          reason: `The tool ${tool.name} needs its json schema inputs of at least one typed property.`,
        };
      for (const [name, property] of Object.entries(schema.properties)) {
        if (!["string", "number", "boolean", "object", "array"].includes(property.type))
          return { allowed: false, reason: `The ${tool.name} input ${name} carries an untyped property.` };
        if (typeof property.description !== "string" || property.description.trim() === "")
          return { allowed: false, reason: `The ${tool.name} input ${name} needs its plain language description.` };
      }
      for (const name of schema.required) {
        if (!(name in schema.properties))
          return { allowed: false, reason: `The tool ${tool.name} marks ${name} required outside its properties.` };
      }
    }
  }
  return { allowed: true };
}

/** Grades one tooldef with the risk class of its action kind and refuses a tool whose declared grade disagrees with the grammar. */
export function toolriskgrade(tool: tooldef): policyevaluation {
  const grade = actionrisk(tool.kind);
  if (grade !== tool.risk)
    return {
      allowed: false,
      reason: `The tool ${tool.name} declares the ${tool.risk} grade while its kind ${String(tool.kind)} grades ${grade}.`,
    };
  return { allowed: true };
}

/** Requires consent metadata on every tool with side effects: read only tools stay free of the extra review while interaction and sensitive tools must declare their review requirement. */
export function toolconsentrequired(tool: tooldef): policyevaluation {
  if (tool.risk === "read") return { allowed: true };
  if (
    tool.consentmeta === undefined ||
    typeof tool.consentmeta.review !== "string" ||
    tool.consentmeta.review.trim() === ""
  )
    return {
      allowed: false,
      reason: `The tool ${tool.name} has side effects and needs its consent metadata with the review requirement.`,
    };
  return { allowed: true };
}

/** Grades one server bind configuration: the localhost bind stays the reviewed default while a bind outside localhost grades sensitive and needs the explicit remote review flag. */
export function serverbindgate(config: mcpserverconfig): policyevaluation {
  const bind = config.bind !== undefined && config.bind.trim() !== "" ? config.bind.trim() : "127.0.0.1";
  const local = bind === "127.0.0.1" || bind === "localhost" || bind === "::1";
  if (!local && config.remote !== true)
    return {
      allowed: false,
      reason: `The bind ${bind} leaves localhost and grades sensitive: the explicit remote review must approve it first.`,
    };
  return { allowed: true };
}

/** Refuses one tool whose version stays below the negotiated compatibility floor so a client never receives a tool older than it can parse. */
export function toolversionfloor(tool: tooldef, floor: number): policyevaluation {
  if (typeof floor === "number" && Number.isFinite(floor) && tool.version < floor)
    return {
      allowed: false,
      reason: `The tool ${tool.name} of version ${tool.version} stays below the negotiated compatibility floor of ${floor}.`,
    };
  return { allowed: true };
}

/** Requires the explicit user enablement before the mcp server ever starts; a disabled or unreviewed config never listens. */
export function serverenablementgate(config: mcpserverconfig): policyevaluation {
  if (config.enabled !== true)
    return {
      allowed: false,
      reason: "The mcp server starts only after the user enables it; the protocol surface stays closed by default.",
    };
  const bind = serverbindgate(config);
  if (!bind.allowed) return bind;
  if (!Array.isArray(config.transports) || config.transports.length === 0)
    return { allowed: false, reason: "The mcp server needs at least one allowed transport of stdio or http." };
  if (!config.transports.every((transport) => transport === "stdio" || transport === "http"))
    return { allowed: false, reason: "The allowed transports of the mcp server are stdio and http." };
  if (typeof config.port !== "number" || !Number.isFinite(config.port) || config.port <= 0 || config.port > 65535)
    return { allowed: false, reason: "The http listener port must be a valid port number." };
  if (
    config.framesize !== undefined &&
    (typeof config.framesize !== "number" || !Number.isFinite(config.framesize) || config.framesize <= 0)
  )
    return {
      allowed: false,
      reason: "The user configured frame size must stay a positive number with no code ceiling.",
    };
  if (
    config.queuedepth !== undefined &&
    (typeof config.queuedepth !== "number" || !Number.isFinite(config.queuedepth) || config.queuedepth <= 0)
  )
    return {
      allowed: false,
      reason: "The user configured queue depth must stay a positive number with no code ceiling.",
    };
  const remote = remoteenablementgate(config);
  if (!remote.allowed) return remote;
  return { allowed: true };
}

/** Validates the namespace membership of one tool: the name prefix must name the domain the tool lives in and the wrapped kind must belong to that domain so no tool drifts out of its namespace. */
export function toolnamespacegate(tool: tooldef): policyevaluation {
  const namespace = tool.name.split(".")[0];
  if (!toolnamespaces.includes(namespace as never))
    return { allowed: false, reason: `The tool ${tool.name} carries no reviewed namespace prefix.` };
  if (!domainkinds[namespace as keyof typeof domainkinds].includes(tool.kind))
    return {
      allowed: false,
      reason: `The tool ${tool.name} wraps ${String(tool.kind)} which does not belong to the ${namespace} domain.`,
    };
  return { allowed: true };
}

/** The mcp tool dispatch gate: the client must be paired, the session live, the plan approved and the origin inside the session grants; read only tools pass under the dryrun risk class without extra approval while every tool with side effects must name the approved plan step of its own kind it executes. The full canexecute gates re-run at execution time. */
export function tooldispatchgate(input: {
  client: clientrecord;
  tool: tooldef;
  session: agentsession | undefined;
  plan: agentplan | undefined;
  origin: string;
  stepid?: string;
  now: number;
}): policyevaluation {
  if (input.client.disconnectedat !== undefined)
    return { allowed: false, reason: "The mcp client is disconnected and its tool calls are refused." };
  if (!input.client.paired)
    return {
      allowed: false,
      reason: "The mcp client waits for the user pairing approval; unpaired clients never dispatch tools.",
    };
  if (!input.session || input.session.stoppedat || input.session.pausedat)
    return { allowed: false, reason: "Tool dispatch needs the live browser session behind the consent gates." };
  if (input.session.expiresat <= input.now)
    return { allowed: false, reason: "The browser session has expired and tool dispatch is refused." };
  if (!input.plan || input.plan.state !== "approved")
    return { allowed: false, reason: "Tool dispatch needs the approved plan review before any tool runs." };
  if (!origingranted(input.session, input.origin))
    return {
      allowed: false,
      reason: `The tool call origin ${input.origin} stays outside the session grants and is refused.`,
    };
  if (input.tool.risk === "read") return { allowed: true };
  if (input.stepid === undefined || input.stepid.trim() === "")
    return {
      allowed: false,
      reason: `The ${input.tool.name} tool has side effects and needs the id of the approved plan step it executes.`,
    };
  const step = input.plan.steps.find((candidate) => candidate.id === input.stepid);
  if (step === undefined)
    return {
      allowed: false,
      reason: `The tool call names the step ${input.stepid} which the approved plan does not carry.`,
    };
  if (step.kind !== input.tool.kind)
    return {
      allowed: false,
      reason: `The tool call names the step ${input.stepid} whose kind ${String(step.kind)} does not match the ${input.tool.name} tool.`,
    };
  return { allowed: true };
}

/** Grades the consent metadata of every sensitive tool: the risk class must match the policy grading of the wrapped kind, the approval gate requirement must be explicit and the origin scope must stay the session grants. */
export function consentmetagrade(tool: tooldef): policyevaluation {
  if (tool.risk === "read") return { allowed: true };
  if (tool.consentmeta === undefined)
    return { allowed: false, reason: `The tool ${tool.name} has side effects and needs its consent metadata.` };
  if (tool.consentmeta.riskclass !== actionrisk(tool.kind))
    return {
      allowed: false,
      reason: `The consent metadata of ${tool.name} declares the ${String(tool.consentmeta.riskclass)} risk class while policy grades its kind ${String(tool.kind)} as ${actionrisk(tool.kind)}.`,
    };
  if (tool.consentmeta.approvalrequired !== true)
    return {
      allowed: false,
      reason: `The tool ${tool.name} has side effects and its consent metadata must require the explicit approval gate.`,
    };
  if (tool.consentmeta.originscope !== "session")
    return { allowed: false, reason: `The tool ${tool.name} must scope its calls to the session grants.` };
  return { allowed: true };
}

/** Validates one allowlist entry against the known client identities: the fingerprint must belong to a stored identity, the display name must be non empty and every granted namespace must be a reviewed namespace. */
export function allowlistentryvalid(entry: allowlistentry, identities: clientidentity[]): policyevaluation {
  if (typeof entry.fingerprint !== "string" || entry.fingerprint.trim() === "")
    return { allowed: false, reason: "The allowlist entry needs the client fingerprint it grants." };
  if (!identities.some((identity) => identity.fingerprint === entry.fingerprint))
    return { allowed: false, reason: `The allowlist entry ${entry.fingerprint} matches no known client identity.` };
  if (typeof entry.displayname !== "string" || entry.displayname.trim() === "")
    return { allowed: false, reason: `The allowlist entry ${entry.fingerprint} needs its display name.` };
  if (!Array.isArray(entry.namespaces) || entry.namespaces.length === 0)
    return { allowed: false, reason: `The allowlist entry ${entry.displayname} grants no tool namespace.` };
  if (!entry.namespaces.every((namespace) => toolnamespaces.includes(namespace)))
    return { allowed: false, reason: `The allowlist entry ${entry.displayname} grants an unreviewed namespace.` };
  return { allowed: true };
}

/** Validates one session token lifetime as a user configured value: an absent lifetime keeps the documented default while a configured window must stay positive with no code ceiling. */
export function tokenlifetimevalid(lifetime: number | undefined): policyevaluation {
  if (lifetime === undefined) return { allowed: true };
  if (typeof lifetime !== "number" || !Number.isFinite(lifetime) || lifetime <= 0)
    return { allowed: false, reason: "The token lifetime must stay a positive user value with no code ceiling." };
  return { allowed: true };
}

/** Requires tls for any non localhost transport: a configured remote access policy or a bind outside localhost must carry the on or required tls mode before any remote traffic passes. */
export function remotetransporttls(config: mcpserverconfig): policyevaluation {
  const bind = config.bind !== undefined && config.bind.trim() !== "" ? config.bind.trim() : "127.0.0.1";
  const local = bind === "127.0.0.1" || bind === "localhost" || bind === "::1";
  const tls = config.remoteaccess?.tls ?? config.httpstream?.tls;
  if ((config.remoteaccess !== undefined || !local) && (tls === undefined || tls.mode === "off"))
    return {
      allowed: false,
      reason: `The ${config.remoteaccess !== undefined ? "remote transport" : `bind ${bind}`} leaves localhost and every non localhost transport requires tls before any remote traffic.`,
    };
  return { allowed: true };
}

/** Refuses the pairing flow when no session is active: pairing codes issue only while the live browser session exists, so no remote client pairs against a closed surface. */
export function pairingreadinessgate(session: agentsession | undefined, now: number): policyevaluation {
  if (!session || session.stoppedat || session.pausedat)
    return { allowed: false, reason: "The pairing flow needs the live browser session before any code issues." };
  if (session.expiresat <= now)
    return { allowed: false, reason: "The browser session has expired and the pairing flow is refused." };
  return { allowed: true };
}

/** Grades the remote transport enablement as a sensitive user choice: a configured remote access policy requires the explicit remote review and tls before the remote surface opens. */
export function remoteenablementgate(config: mcpserverconfig): policyevaluation {
  if (config.remoteaccess === undefined) return { allowed: true };
  if (config.remote !== true)
    return {
      allowed: false,
      reason: "The remote transport enablement is a sensitive user choice and needs the explicit remote review.",
    };
  const tls = remotetransporttls(config);
  if (!tls.allowed) return tls;
  if (typeof config.remoteaccess.endpoint !== "string" || config.remoteaccess.endpoint.trim() === "")
    return { allowed: false, reason: "The remote access policy needs its user configured endpoint." };
  if (
    config.remoteaccess.maxclients !== undefined &&
    (typeof config.remoteaccess.maxclients !== "number" ||
      !Number.isFinite(config.remoteaccess.maxclients) ||
      config.remoteaccess.maxclients <= 0)
  )
    return {
      allowed: false,
      reason: "The user configured client ceiling must stay a positive value with no code ceiling.",
    };
  const lifetime = tokenlifetimevalid(config.remoteaccess.tokenlifetimems);
  if (!lifetime.allowed) return lifetime;
  const timeout = approvaltimeoutvalid(config.remoteaccess.approvaltimeout);
  if (!timeout.allowed) return timeout;
  return { allowed: true };
}

/** Limits the token scopes to the namespaces the user granted: every scope must be a reviewed namespace the grant list carries, so a token never widens beyond the allowlist. */
export function tokenscopevalid(scopes: toolnamespace[], granted: toolnamespace[]): policyevaluation {
  if (!Array.isArray(scopes) || scopes.length === 0)
    return { allowed: false, reason: "A session token needs at least one granted tool namespace." };
  for (const scope of scopes) {
    if (!toolnamespaces.includes(scope))
      return { allowed: false, reason: `The scope ${String(scope)} is not a reviewed tool namespace.` };
    if (!granted.includes(scope))
      return { allowed: false, reason: `The scope ${scope} stays outside the namespaces the user granted.` };
  }
  return { allowed: true };
}

/** Validates one approval timeout as a user configured positive window with the documented refusal default; an absent timeout keeps the documented default. */
export function approvaltimeoutvalid(timeout: approvaltimeout | undefined): policyevaluation {
  if (timeout === undefined) return { allowed: true };
  if (typeof timeout.windowms !== "number" || !Number.isFinite(timeout.windowms) || timeout.windowms <= 0)
    return { allowed: false, reason: "The approval timeout must stay a positive user window with no code ceiling." };
  if (timeout.ontimeout !== "refuse")
    return { allowed: false, reason: "The documented disposition of an unanswered approval gate is refusal." };
  return { allowed: true };
}

/** Grades the token revocation as an always available user action: no gate, review or state ever blocks the user from revoking a paired client. */
export function revocationgate(): policyevaluation {
  return { allowed: true };
}

/** Grades one client event subscription as read only when its filters exclude the mutation mirror: a subscription that listens to the callstarted kind must narrow itself with an origin or tool filter so it never streams the side effect calls of unreviewed origins. */
export function subscriptiongrade(subscription: protocoleventsubscription): policyevaluation {
  if (!Array.isArray(subscription.kinds) || subscription.kinds.length === 0)
    return { allowed: false, reason: "An event subscription needs at least one protocol event kind." };
  if (
    subscription.kinds.includes("callstarted") &&
    subscription.origin === undefined &&
    subscription.tool === undefined
  )
    return {
      allowed: false,
      reason:
        "An event subscription that mirrors the callstarted events of tools with side effects needs its origin or tool filter so it never widens what the session grants.",
    };
  return { allowed: true };
}

/** Grades sampling callbacks as sensitive: the prompt leaves the browser, so page content rides a callback only behind the explicit user grant and the granted maximum tokens stay a positive user value. */
export function samplinggrade(input: { request: samplingrequest; pagegrant: boolean }): policyevaluation {
  if (!input.pagegrant && input.request.pagecontent !== undefined)
    return {
      allowed: false,
      reason: "The sampling callback carries page content the user never granted and is refused.",
    };
  if (
    input.request.maxtokens !== undefined &&
    (!Number.isFinite(input.request.maxtokens) || input.request.maxtokens <= 0)
  )
    return {
      allowed: false,
      reason: "The granted maximum tokens of a sampling callback must stay a positive user value with no code ceiling.",
    };
  if (input.request.prompt.trim() === "") return { allowed: false, reason: "A sampling callback needs its prompt." };
  return { allowed: true };
}

/** Validates one per client rate limit as a user configured value: the window and budget stay positive when set while an absent limit or budget documents the unbounded choice instead of a silent default. */
export function callratelimitvalid(limit: callratelimit | undefined): policyevaluation {
  if (limit === undefined) return { allowed: true };
  if (typeof limit.windowms !== "number" || !Number.isFinite(limit.windowms) || limit.windowms <= 0)
    return { allowed: false, reason: "The rate limit window must stay a positive user value with no code ceiling." };
  if (
    limit.budget !== undefined &&
    (typeof limit.budget !== "number" || !Number.isFinite(limit.budget) || limit.budget <= 0)
  )
    return { allowed: false, reason: "The rate limit budget must stay a positive user value with no code ceiling." };
  if (limit.clientid.trim() === "")
    return { allowed: false, reason: "A per client rate limit needs the client it counts." };
  return { allowed: true };
}

/** Requires one audit entry for every tool call without exception: every call record of the runtime must appear in the audit set so no call ever leaves the trail. */
export function callauditcomplete(input: { calls: toolcallrecord[]; audit: toolcallrecord[] }): policyevaluation {
  const audited = new Set(input.audit.map((record) => record.id));
  const missing = input.calls.filter((record) => !audited.has(record.id));
  if (missing.length > 0)
    return {
      allowed: false,
      reason: `${missing.length} tool call${missing.length === 1 ? "" : "s"} carry no audit entry and the audit trail must name every call without exception.`,
    };
  return { allowed: true };
}

/** Grades one batch call by its most sensitive member: a batch that carries a sensitive member takes the sensitive grade and runs only behind the approval gates while a read only batch stays read. */
export function batchgrade(input: { calls: Array<{ risk: tooldef["risk"] }>; approved: boolean }): policyevaluation {
  if (input.calls.length === 0) return { allowed: false, reason: "A batch call needs at least one ordered tool call." };
  const sensitive = input.calls.some((call) => call.risk === "sensitive");
  if (sensitive && !input.approved)
    return {
      allowed: false,
      reason: "The batch grades sensitive through its most sensitive member and runs only behind the approval gates.",
    };
  return { allowed: true };
}

/** Keeps one tool dry run free of page mutations: a dry run record that claims execution or lists page mutations is refused because a dry run evaluates arguments and consent and never executes anything. */
export function dryrunpurity(dryrun: tooldryrun): policyevaluation {
  if (dryrun.executed)
    return {
      allowed: false,
      reason: `The ${dryrun.tool} dry run claims execution and a dry run never executes anything.`,
    };
  if (dryrun.mutations.length > 0)
    return {
      allowed: false,
      reason: `The ${dryrun.tool} dry run lists ${dryrun.mutations.length} page mutation${dryrun.mutations.length === 1 ? "" : "s"} and a dry run leaves the page untouched.`,
    };
  return { allowed: true };
}

/** Validates tool mock usage to test contexts only: a mock outside a test context is refused while a test context mock must name a tool and carry a canned result. */
export function mockusagevalid(mock: toolmock): policyevaluation {
  if (mock.testcontext !== true)
    return {
      allowed: false,
      reason: `The ${mock.tool} mock stays outside a test context and is refused; tool mocks never answer real calls.`,
    };
  if (mock.tool.trim() === "")
    return { allowed: false, reason: "A tool mock needs the namespaced tool it stands in for." };
  if (typeof mock.result.content !== "string")
    return { allowed: false, reason: "A tool mock needs its canned result content." };
  return { allowed: true };
}

/**
 * Mcp server mode gates of the 1.1.84 family.
 * Every serve side gate lives here: the serve enablement that keeps the mcp mode off until the user enables it with the shutdown drain window as a user choice, the read only degradation decision when no origin grant covers the session, the resource exposure that keeps the served resources behind the pairing approval, and the prompt exposure of the template library and the walkthroughs.
 * No port, window, ceiling or served uri is ever hardcoded: the gates validate user choices and refuse everything else.
 */

/** The serve decision of the mcp server mode: the server enablement gate of the protocol family plus the shutdown drain window validation — the window stays a positive user value in milliseconds with no code ceiling while an absent window keeps the drain unbounded. */
export function mcpmodegate(config: mcpserverconfig): policyevaluation {
  const enablement = serverenablementgate(config);
  if (!enablement.allowed) return enablement;
  if (
    config.drainwindow !== undefined &&
    (typeof config.drainwindow !== "number" || !Number.isFinite(config.drainwindow) || config.drainwindow <= 0)
  )
    return {
      allowed: false,
      reason: "The shutdown drain window must stay a positive user value in milliseconds with no code ceiling.",
    };
  return { allowed: true };
}

/** Decides the read only degradation of the serve mode: the session origin must sit inside the origin grants before the serve exposes the tools with side effects, and a refusal means the serve degrades to the read only tools instead of exposing the gated catalog. */
export function degradationgate(input: { grants?: string[]; origin?: string }): policyevaluation {
  if (input.origin === undefined || input.origin.trim() === "")
    return {
      allowed: false,
      reason:
        "The serve mode needs the session origin before it decides the degradation; without it the serve stays read only.",
    };
  const grants = input.grants ?? [];
  if (!grants.includes(input.origin))
    return {
      allowed: false,
      reason: `The origin ${input.origin} stays outside the session grants and the serve degrades to the read only tools.`,
    };
  return { allowed: true };
}

/** Grades the resource exposure of the serve mode: the client must stay paired and connected while the requested uri must name a served resource of the published catalog, so an unpaired client or an unknown uri never reads a resource. */
export function resourceexposuregate(input: {
  client: clientrecord;
  uri: string;
  served?: string[];
}): policyevaluation {
  if (input.client.disconnectedat !== undefined)
    return { allowed: false, reason: "A disconnected client reads no served resource." };
  if (!input.client.paired)
    return {
      allowed: false,
      reason: "The resource exposure waits for the user pairing approval; unpaired clients read no resource.",
    };
  if (input.served !== undefined && !input.served.includes(input.uri))
    return { allowed: false, reason: `The serve mode publishes no resource named ${input.uri}.` };
  return { allowed: true };
}

/** Grades the prompt exposure of the serve mode: the client must stay paired and connected before it lists or renders the walkthrough prompts and the user authored template library. */
export function promptexposuregate(client: clientrecord): policyevaluation {
  if (client.disconnectedat !== undefined)
    return { allowed: false, reason: "A disconnected client reads no served prompt." };
  if (!client.paired)
    return {
      allowed: false,
      reason: "The prompt exposure waits for the user pairing approval; unpaired clients read no prompt.",
    };
  return { allowed: true };
}

/**
 * Llm integration gates of the 1.1.57 family.
 * Every model side gate lives here: the provider validation that keeps every endpoint, model and protocol shape a user configured value, the data egress grading of provider calls, the explicit consent requirement before page content leaves the browser, the local endpoint preference for sensitive extractions, the review requirement of model drafted plans, the fresh review requirement of replanned steps, the cost budget validation, the guard verdict gate that refuses invalid model output and the plan lint that checks model drafts against the action grammar before review.
 * No provider, endpoint, model, key or ceiling is ever hardcoded: the gates validate user choices and refuse everything else.
 */

/** Validates one provider config: the endpoint stays a user configured http or https url, the model list stays non-empty free text, the protocol shape stays one of the four wire shapes and the auth reference stays a storage id reference that never carries key material. */
export function providervalid(config: providerconfig): policyevaluation {
  if (config.name.trim() === "") return { allowed: false, reason: "The provider config needs its name." };
  if (config.endpoint.trim() === "")
    return {
      allowed: false,
      reason: "The provider config needs the user configured endpoint url; no default endpoint ever applies.",
    };
  let parsed: URL;
  try {
    parsed = new URL(config.endpoint);
  } catch {
    return { allowed: false, reason: "The provider endpoint must be a well-formed url." };
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:")
    return { allowed: false, reason: "The provider endpoint must speak http or https." };
  if (config.models.length === 0)
    return { allowed: false, reason: "The provider config needs at least one user configured model name." };
  if (config.models.some((model) => model.trim() === ""))
    return { allowed: false, reason: "Every provider model name must stay non-empty free text." };
  if (
    config.style !== "chatcompletions" &&
    config.style !== "responses" &&
    config.style !== "messages" &&
    config.style !== "gemini"
  )
    return {
      allowed: false,
      reason: "The provider protocol shape must be one of the four wire shapes the user picks.",
    };
  if (config.authref !== undefined && config.authref.storageid.trim() === "")
    return {
      allowed: false,
      reason:
        "The provider auth reference needs the storage id of the stored key; the key material never enters the config.",
    };
  return { allowed: true };
}

/** Grades one provider call as a data egress event for the audit trail: every remote completion leaves the browser with its prompt text, so the audit names the endpoint, the model and the token counts; a local endpoint grades as the local preference. */
export function provideregressgrade(input: { provider: providerconfig; local: boolean }): policyevaluation {
  const valid = providervalid(input.provider);
  if (!valid.allowed) return valid;
  return {
    allowed: true,
    reason: input.local
      ? "The model call stays on the local machine endpoint and grades as the local data egress preference."
      : "The model call leaves the browser for the user configured endpoint and grades as a data egress event with its endpoint, model and token counts in the audit trail.",
  };
}

/** Requires explicit consent before any page content leaves the browser: page content inside a call the user has not granted refuses the call, while calls without page content pass untouched. */
export function egressconsentgate(input: { pagecontent?: string; granted: boolean }): policyevaluation {
  if (input.pagecontent !== undefined && input.pagecontent.trim() !== "" && input.granted !== true)
    return {
      allowed: false,
      reason:
        "The model call carries page content the user has not granted, so the content stays in the browser and the call refuses.",
    };
  return { allowed: true };
}

/** Grades the local endpoint preference for sensitive extractions: a sensitive extraction prefers the local model endpoint, and the grade names the preference while a local endpoint satisfies it. */
export function localsensitivegrade(input: { sensitive: boolean; local: boolean }): policyevaluation {
  if (input.sensitive && !input.local)
    return {
      allowed: true,
      reason:
        "The sensitive extraction prefers the local model endpoint; the user keeps the choice of the remote provider.",
    };
  return {
    allowed: true,
    reason: input.local
      ? "The local model endpoint satisfies the sensitive extraction preference."
      : "The extraction stays non-sensitive and every configured endpoint serves it.",
  };
}

/** Requires the plan review before any model drafted plan executes: only an approved draft may turn into a plan, and the plan itself still passes the same human plan review every local plan passes. */
export function plandraftreviewgate(draft: plandraft): policyevaluation {
  if (draft.state !== "approved")
    return {
      allowed: false,
      reason: "The model drafted plan stays unreviewed; the human review approves the draft before any step executes.",
    };
  if (draft.steps.length === 0)
    return { allowed: false, reason: "The model drafted plan carries no step, so nothing executes." };
  return { allowed: true };
}

/** Requires fresh review for replanned steps: a pending replan never executes and every revised tail step carries the fresh review marker, so the human review sees the changed tail before it runs. */
export function replanreviewgate(replan: replanrecord): policyevaluation {
  if (replan.state !== "approved")
    return {
      allowed: false,
      reason:
        "The replanned tail stays unreviewed; the fresh review approves the changed steps before any of them executes.",
    };
  if (replan.tail.some((step) => step.freshreview !== true))
    return { allowed: false, reason: "Every revised step of a replan must carry the fresh review marker." };
  return { allowed: true };
}

/** Validates one cost budget: the token and currency ceilings stay positive user values with no code ceiling, the currency names the unit of the cost ceiling and a budget without any ceiling documents the unbounded choice instead of inventing one. */
export function costbudgetvalid(budget: costbudget): policyevaluation {
  if (budget.maxtokens !== undefined && (!Number.isFinite(budget.maxtokens) || budget.maxtokens <= 0))
    return { allowed: false, reason: "The token ceiling of a cost budget must stay a positive user value." };
  if (budget.maxcost !== undefined && (!Number.isFinite(budget.maxcost) || budget.maxcost <= 0))
    return { allowed: false, reason: "The cost ceiling of a cost budget must stay a positive user value." };
  if (budget.maxcost !== undefined && (budget.currency === undefined || budget.currency.trim() === ""))
    return { allowed: false, reason: "The cost ceiling of a cost budget needs its currency unit." };
  if (budget.maxtokens === undefined && budget.maxcost === undefined)
    return {
      allowed: false,
      reason:
        "The cost budget needs at least one ceiling the user configured; an absent budget stays the documented unbounded choice.",
    };
  return { allowed: true };
}

/** Refuses tool calls the guardrails marked invalid: only a valid guard verdict passes, an invalid or refused model output never executes. */
export function guardverdictgate(output: modeloutput): policyevaluation {
  if (output.verdict === "invalid")
    return { allowed: false, reason: output.reason ?? "The guardrails marked the model output invalid." };
  if (output.verdict === "refused")
    return { allowed: false, reason: output.reason ?? "The model refused the request, so nothing executes." };
  return { allowed: true };
}

/** Lints one model drafted plan against the action grammar before review: every drafted step maps onto the tool step grammar with its derived risk, and every violation lands in the findings the review sees; an empty origin skips the origin bound checks the way the review pipeline runs them later. */
/** Derives the risk of one drafted step for the grammar check; an unknown kind grades sensitive so the grammar check names the violation instead of crashing. */
function draftriskof(step: draftstep): "read" | "interaction" | "sensitive" {
  try {
    return resolvedrisk({
      id: step.id,
      kind: step.kind as actionkind,
      ...(step.target !== undefined ? { target: step.target } : {}),
      ...(step.value !== undefined ? { value: step.value } : {}),
      summary: step.summary,
      risk: "sensitive",
    });
  } catch {
    return "sensitive";
  }
}

export function planlint(draft: plandraft, origin: string): string[] {
  const findings: string[] = [];
  if (draft.goal.trim() === "") findings.push("The drafted plan carries no goal.");
  if (draft.steps.length === 0) findings.push("The drafted plan carries no step.");
  for (const step of draft.steps) {
    const mapped: toolstep = {
      id: step.id,
      kind: step.kind as actionkind,
      ...(step.target !== undefined ? { target: step.target } : {}),
      ...(step.value !== undefined ? { value: step.value } : {}),
      summary: step.summary,
      risk: draftriskof(step),
    } as toolstep;
    const verdict = validatestep(mapped, origin);
    if (!verdict.allowed)
      findings.push(
        `The drafted step ${step.id || "without id"} of kind ${step.kind || "unknown"} violates the action grammar: ${verdict.reason ?? "the step failed its grammar check."}`,
      );
  }
  return findings;
}

/**
 * Multi agent part one gates of the 1.1.58 family.
 * Every swarm side gate lives here: the task queue validation of the user configured lanes, priorities and completion policy, the work stealing grade that permits stealing only inside one user approved swarm, the per agent budget validation of positive user ceilings, the per agent scope validation against the session grant list, the spawn grading with the risk class of the requested role, the killswitch gate that stays available with no configuration barrier, the egress grading of cross agent messages that carry page content and the blackboard consent grade that inherits the class of the source extraction.
 * No agent count, lane name, priority scale, depth ceiling or freshness window is ever hardcoded: the gates validate user choices and refuse everything else, and no swarm coordination ever bypasses the human review.
 */

/** Validates one task queue: the lanes stay non-empty unique user names, the priorities stay finite user values, the completion policy stays all or any, and every item waits in a configured lane under a configured priority when the user configured the scales. */
export function queuelanesvalid(queue: taskqueue): policyevaluation {
  if (queue.lanes.some((lane) => lane.trim() === ""))
    return { allowed: false, reason: "Every queue lane needs its user configured name." };
  if (new Set(queue.lanes).size !== queue.lanes.length)
    return { allowed: false, reason: "The queue lane names must stay unique." };
  if (queue.priorities.some((priority) => !Number.isFinite(priority)))
    return { allowed: false, reason: "Every queue priority must stay a finite user value." };
  if (queue.completionpolicy !== "all" && queue.completionpolicy !== "any")
    return { allowed: false, reason: "The queue completion policy must stay all or any." };
  for (const item of queue.items) {
    if (item.payload.trim() === "") return { allowed: false, reason: `The task ${item.id} carries no payload.` };
    if (queue.lanes.length > 0 && !queue.lanes.includes(item.lane))
      return {
        allowed: false,
        reason: `The task ${item.id} waits in the lane ${item.lane} which the user did not configure.`,
      };
    if (queue.priorities.length > 0 && !queue.priorities.includes(item.priority))
      return {
        allowed: false,
        reason: `The task ${item.id} carries the priority ${item.priority} which the user did not configure.`,
      };
  }
  return { allowed: true };
}

/** Grades one work stealing attempt: stealing is permitted only inside one user approved swarm, and a steal outside an approved swarm refuses because lane ownership only exists inside the reviewed swarm. */
export function workstealgrade(input: {
  swarmapproved: boolean;
  agentrole: string;
  lane: string;
  ownership?: Array<{ lane: string; roles: string[] }>;
}): policyevaluation {
  if (!input.swarmapproved)
    return {
      allowed: false,
      reason: "Work stealing runs only inside one user approved swarm; an unapproved swarm keeps every lane closed.",
    };
  const rule = (input.ownership ?? []).find((entry) => entry.lane === input.lane);
  if (rule && !rule.roles.includes(input.agentrole))
    return {
      allowed: false,
      reason: `The lane ${input.lane} only opens its tasks to the roles ${rule.roles.join(", ")} the user configured; the ${input.agentrole} agent may not steal.`,
    };
  return {
    allowed: true,
    reason:
      rule === undefined
        ? `The lane ${input.lane} carries no ownership rule, so every agent of the approved swarm may steal its tasks.`
        : `The lane ${input.lane} opens its tasks to the ${input.agentrole} role the user configured.`,
  };
}

/** Validates one per agent budget: the token, cost and step ceilings stay positive user values with no code ceiling, the cost ceiling names its currency and a budget without any ceiling documents the unbounded choice instead of inventing one. */
export function agentbudgetvalid(budget: agentbudget): policyevaluation {
  if (budget.agentid.trim() === "") return { allowed: false, reason: "The agent budget needs its agent id." };
  if (budget.maxtokens !== undefined && (!Number.isFinite(budget.maxtokens) || budget.maxtokens <= 0))
    return { allowed: false, reason: "The token ceiling of an agent budget must stay a positive user value." };
  if (budget.maxcost !== undefined && (!Number.isFinite(budget.maxcost) || budget.maxcost <= 0))
    return { allowed: false, reason: "The cost ceiling of an agent budget must stay a positive user value." };
  if (budget.maxsteps !== undefined && (!Number.isFinite(budget.maxsteps) || budget.maxsteps <= 0))
    return { allowed: false, reason: "The step ceiling of an agent budget must stay a positive user value." };
  if (budget.maxcost !== undefined && (budget.currency === undefined || budget.currency.trim() === ""))
    return { allowed: false, reason: "The cost ceiling of an agent budget needs its currency unit." };
  if (budget.maxtokens === undefined && budget.maxcost === undefined && budget.maxsteps === undefined)
    return {
      allowed: false,
      reason:
        "The agent budget needs at least one ceiling the user configured; an absent budget stays the documented unbounded choice.",
    };
  return { allowed: true };
}

/** Validates one per agent scope against the session grant list: every granted origin must sit inside the session grants and every granted tool namespace must be one of the catalog namespaces, so no agent scope ever widens the session. */
export function agentscopevalid(input: { scope: agentscope; grants: string[] }): policyevaluation {
  if (input.scope.agentid.trim() === "") return { allowed: false, reason: "The agent scope needs its agent id." };
  if (input.scope.origins.some((origin) => origin.trim() === ""))
    return { allowed: false, reason: "Every origin of an agent scope needs its user configured name." };
  if (input.scope.toolnamespaces.some((namespace) => !toolnamespaces.includes(namespace)))
    return { allowed: false, reason: "Every tool namespace of an agent scope must be one of the catalog namespaces." };
  const outside = input.scope.origins.filter((origin) => input.grants.length > 0 && !input.grants.includes(origin));
  if (outside.length > 0)
    return {
      allowed: false,
      reason: `The agent scope grants the origins ${outside.join(", ")} which the session grant list does not carry; no agent scope widens the session.`,
    };
  return { allowed: true };
}

/** Grades one spawn request with the risk class of the requested role: a planner or observer spawn grades read side while a worker or custom role spawn grades sensitive because it may execute reviewed steps, and the grade names the class the review sees. */
export function spawngrade(request: spawnrequest): policyevaluation {
  if (request.parentid.trim() === "") return { allowed: false, reason: "The spawn request needs its parent agent id." };
  if (request.task.trim() === "")
    return { allowed: false, reason: "The spawn request needs its task in plain language." };
  if (request.depth < 1)
    return {
      allowed: false,
      reason: "The spawn request depth must sit at one or deeper because every sub agent lives under a parent.",
    };
  const risk = request.role === "planner" || request.role === "observer" ? "read" : "sensitive";
  return {
    allowed: true,
    reason:
      risk === "read"
        ? `The spawn of the ${request.role} sub agent grades read side: the role composes or observes and never executes page actions.`
        : `The spawn of the ${request.role} sub agent grades sensitive: the role may execute reviewed steps, so every proposal it drafts still passes the same human review.`,
  };
}

/** Keeps the killswitch available with no configuration barrier while it stays user triggered only: the switch never needs a setting, an approval or a state to fire, no agent ever engages it, and it stays effective even while agents sit paused. */
export function killswitchgate(input?: { triggeredby?: "user" | "agent"; pausedagents?: number }): policyevaluation {
  if (input?.triggeredby === "agent")
    return {
      allowed: false,
      reason:
        "The killswitch stays user triggered only: no agent ever engages the switch, because the halt of the whole fleet stays a human action.",
    };
  const paused = input?.pausedagents ?? 0;
  return {
    allowed: true,
    reason: `The killswitch stays available with no configuration barrier: the user halts every agent of the fleet at once at any time${paused > 0 ? `, and the switch stays effective over the ${paused} paused agent${paused === 1 ? "" : "s"} because a pause never shields an agent from the stop` : ""}.`,
  };
}

/** Grades one cross agent message that carries page content as a data egress event: the delivery stays inside the swarm while the copied page content lands its egress class in the audit trail so the reviewer reads what moved between agents. */
export function messageegressgrade(input: { message: agentmessage; carriespagecontent: boolean }): policyevaluation {
  if (input.message.payload.trim() === "") return { allowed: false, reason: "The agent message needs its payload." };
  if (input.carriespagecontent)
    return {
      allowed: true,
      reason: `The message ${input.message.id} from ${input.message.senderid} to ${input.message.recipient} carries page content and grades as a data egress event with its sender, recipient and routing in the audit trail.`,
    };
  return {
    allowed: true,
    reason: `The message ${input.message.id} from ${input.message.senderid} to ${input.message.recipient} carries no page content and stays a plain swarm delivery.`,
  };
}

/** Grades one blackboard entry by the consent class of its source extraction: the entry inherits the class exactly, a sensitive extraction stays sensitive on the board and every reader sees the class beside the value. */
export function blackboardconsentgrade(entry: blackboardentry): policyevaluation {
  if (entry.key.trim() === "") return { allowed: false, reason: "The blackboard entry needs its key." };
  if (entry.consentclass !== "read" && entry.consentclass !== "interaction" && entry.consentclass !== "sensitive")
    return {
      allowed: false,
      reason: "The blackboard entry inherits one of the three consent classes of its source extraction.",
    };
  if (entry.consentclass === "sensitive")
    return {
      allowed: true,
      reason: `The blackboard entry ${entry.key} inherits the sensitive class of its source extraction; every agent reads the class beside the value.`,
    };
  return {
    allowed: true,
    reason: `The blackboard entry ${entry.key} inherits the ${entry.consentclass} class of its source extraction; every agent reads the class beside the value.`,
  };
}

/**
 * Multi agent part two gates of the 1.1.59 family.
 * Every orchestration side gate lives here: the leader election validation of the user configured rule, the critic review grade that stays read only over agent outputs, the verifier method grade against the methods the user allows, the handoff grant gate that preserves the original session grants, the lock scope validation that keeps one lock inside one origin, the conflict resolution grade that marks overwriting rules sensitive, the escalation gate that keeps every lifted decision human, the consensus quorum validation of the user configured value, the worker scale bound validation with no engine cap and the merge egress grade of exported reports that include page content.
 * No quorum, worker bound, election rule or merge rule is ever hardcoded: the gates validate user choices and refuse everything else, and no coordination path bypasses the human review.
 */

/** Validates one leader election rule as the user configured it: first takes the first registration while named takes one agent id the user typed, and a named rule without its agent or an unknown rule kind refuses. */
export function leaderelectionvalid(input: {
  rule: { kind: string; agentid?: string };
  agents: agentidentity[];
}): policyevaluation {
  if (input.rule.kind !== "first" && input.rule.kind !== "named")
    return { allowed: false, reason: "The leader election rule stays first or named as the user configured it." };
  if (input.rule.kind === "named") {
    if (input.rule.agentid === undefined || input.rule.agentid.trim() === "")
      return { allowed: false, reason: "The named leader election rule needs the agent id the user named." };
    if (!input.agents.some((agent) => agent.id === input.rule.agentid && agent.state !== "stopped"))
      return {
        allowed: false,
        reason: `The named leader election rule names the agent ${input.rule.agentid} which is not a live agent of the swarm.`,
      };
  }
  return {
    allowed: true,
    reason:
      input.rule.kind === "first"
        ? "The first registration rule elects the leader exactly as the user configured."
        : `The named rule elects the agent ${input.rule.agentid} exactly as the user configured.`,
  };
}

/** Grades one critic review as read only over agent outputs: the critic reads the output of the subject agent and returns its verdict, its issues and its required changes without ever acting on the page, and a review without its reviewer, subject or verdict refuses. */
export function criticreviewgrade(review: criticreview): policyevaluation {
  if (review.reviewerid.trim() === "")
    return { allowed: false, reason: "The critic review needs its reviewing agent." };
  if (review.subjectagentid.trim() === "")
    return { allowed: false, reason: "The critic review needs the subject agent whose output it reviews." };
  if (review.verdict !== "approve" && review.verdict !== "changes" && review.verdict !== "reject")
    return {
      allowed: false,
      reason: "The critic review carries one of the three verdicts approve, changes or reject.",
    };
  if (review.verdict === "changes" && review.requiredchanges.length === 0)
    return { allowed: false, reason: "A changes verdict needs its required changes in plain language." };
  if (review.verdict === "reject" && review.issues.length === 0)
    return { allowed: false, reason: "A reject verdict needs the issues the critic found." };
  return {
    allowed: true,
    reason: `The critic review of the output of ${review.subjectagentid} stays read only: the critic ${review.reviewerid} returns its ${review.verdict} verdict and never acts on the page; the rework still passes the same human review.`,
  };
}

/** Grades one verifier check by the methods the user allows: an empty allowed list keeps every method open as the documented user choice while a configured list restricts the verifier to the methods it names. */
export function verifiermethodgrade(input: { method: string; allowed: string[] }): policyevaluation {
  if (input.method.trim() === "") return { allowed: false, reason: "The verifier check needs the method it used." };
  if (input.allowed.length > 0 && !input.allowed.includes(input.method))
    return {
      allowed: false,
      reason: `The verifier method ${input.method} is not one of the methods the user allowed: ${input.allowed.join(", ")}.`,
    };
  return {
    allowed: true,
    reason:
      input.allowed.length === 0
        ? `The verifier method ${input.method} runs under the documented open method list the user chose not to narrow.`
        : `The verifier method ${input.method} sits inside the methods the user allowed.`,
  };
}

/** Requires one handoff to preserve the original session grants: the receiving agent scope stays inside the session grant list exactly like every agent scope, so a tab transfer never widens what the session granted. */
export function handoffgrantgate(input: {
  record: handoffrecord;
  toscope: agentscope | undefined;
  sessiongrants: string[];
}): policyevaluation {
  if (input.record.toagentid.trim() === "" || input.record.fromagentid.trim() === "")
    return { allowed: false, reason: "The handoff names its transferring and receiving agents." };
  if (input.toscope === undefined)
    return {
      allowed: true,
      reason: `The receiving agent ${input.record.toagentid} carries no narrowed scope, so the handoff stays unbounded inside the original session grants.`,
    };
  const outside = input.toscope.origins.filter(
    (origin) => input.sessiongrants.length > 0 && !input.sessiongrants.includes(origin),
  );
  if (outside.length > 0)
    return {
      allowed: false,
      reason: `The handoff to ${input.record.toagentid} would need the origins ${outside.join(", ")} which the session grant list does not carry; a tab transfer never widens the session grants.`,
    };
  return {
    allowed: true,
    reason: `The handoff from ${input.record.fromagentid} to ${input.record.toagentid} preserves the original session grants; the receiving scope stays inside them.`,
  };
}

/** Validates one lock scope so a lock never spans unrelated origins: the key composes of exactly one origin and one selector, both non-empty, and the kind stays exclusive or shared. */
export function lockscopevalid(lock: resourcelock): policyevaluation {
  if (lock.key.trim() === "") return { allowed: false, reason: "The resource lock needs its key." };
  if (lock.origin.trim() === "" || lock.selector.trim() === "")
    return {
      allowed: false,
      reason: "The resource lock names exactly one origin and one selector; a lock never spans unrelated origins.",
    };
  if (lock.key !== `${lock.origin}|${lock.selector}`)
    return {
      allowed: false,
      reason:
        "The lock key must compose of its one origin and its one selector so the scope never spans unrelated origins.",
    };
  if (lock.kind !== "exclusive" && lock.kind !== "shared")
    return { allowed: false, reason: "The lock kind stays exclusive or shared." };
  return {
    allowed: true,
    reason: `The lock ${lock.key} spans exactly one target of one origin for the holder ${lock.holder}.`,
  };
}

/** Grades one conflict resolution rule: the overwriting rules last and preferagent grade sensitive because one parallel value overwrites another inside the report, while first and fail grade read side. */
export function conflictresolutiongrade(rule: mergerule): policyevaluation {
  if (rule !== "first" && rule !== "last" && rule !== "preferagent" && rule !== "fail")
    return {
      allowed: false,
      reason: "The conflict resolution rule stays first, last, preferagent or fail as the user configured it.",
    };
  if (rule === "last" || rule === "preferagent")
    return {
      allowed: true,
      reason: `The ${rule} conflict resolution rule overwrites one parallel value with another, so it grades sensitive and the merged report still passes the human review.`,
    };
  return {
    allowed: true,
    reason: `The ${rule} conflict resolution rule keeps or refuses the parallel values without overwriting, so it grades read side.`,
  };
}

/** Grades one escalation as always human decided: the open escalation waits for the user and only the user writes the decision; an escalation without its subject or full context refuses because the user decides on what the agent saw. */
export function escalationgate(escalation: escalationrecord): policyevaluation {
  if (escalation.agentid.trim() === "")
    return { allowed: false, reason: "The escalation names the agent whose decision it lifts." };
  if (escalation.subject.trim() === "") return { allowed: false, reason: "The escalation needs its subject." };
  if (escalation.context.trim() === "")
    return {
      allowed: false,
      reason: "The escalation needs its full context in plain language; the user decides on what the agent saw.",
    };
  if (escalation.state === "decided" && (escalation.decision === undefined || escalation.decision.trim() === ""))
    return { allowed: false, reason: "A decided escalation carries the decision the user wrote." };
  return {
    allowed: true,
    reason: `The escalation of ${escalation.agentid} stays human decided: the agent lifts the stalled decision with its full context and the user alone writes the outcome.`,
  };
}

/** Validates one consensus quorum as a user configured value: the quorum stays a positive whole number and never exceeds the live voters the user counted, so no round carries an unreachable quorum. */
export function consensusquorumvalid(input: { quorum: number; voters: number }): policyevaluation {
  if (!Number.isInteger(input.quorum) || input.quorum < 1)
    return { allowed: false, reason: "The consensus quorum stays a positive whole number the user configured." };
  if (input.quorum > input.voters)
    return {
      allowed: false,
      reason: `The consensus quorum ${input.quorum} exceeds the ${input.voters} voting agents the user counted; an unreachable quorum never carries.`,
    };
  return {
    allowed: true,
    reason: `The consensus quorum ${input.quorum} of ${input.voters} voting agents stays the user configured value with no engine default.`,
  };
}

/** Validates the worker scale bound as a user choice with no engine cap: an absent bound stays the documented unbounded choice while a configured bound stays a positive user value the scaling respects. */
export function workerscalevalid(bound: number | undefined): policyevaluation {
  if (bound === undefined)
    return {
      allowed: true,
      reason: "No worker bound is configured, so the worker scale stays the user choice alone with no engine cap.",
    };
  if (!Number.isFinite(bound) || bound < 1)
    return { allowed: false, reason: "The worker scale bound stays a positive user value; no engine cap exists." };
  return {
    allowed: true,
    reason: `The worker scale bound ${bound} stays the user configured value; the scaling never passes it and no engine cap exists.`,
  };
}

/** Grades one exported merged report that includes page content as a data egress event: the export carries the report with its sources into the audit trail so the reviewer reads what left the browser. */
export function mergeegressgrade(input: { report: resultreport; carriespagecontent: boolean }): policyevaluation {
  if (input.report.title.trim() === "")
    return { allowed: false, reason: "The merged report needs its title before any export." };
  if (input.carriespagecontent)
    return {
      allowed: true,
      reason: `The export of the report ${input.report.title} carries page content from the sources ${input.report.sources.join(", ")} and grades as a data egress event in the audit trail.`,
    };
  return {
    allowed: true,
    reason: `The export of the report ${input.report.title} carries no page content and stays a plain report export.`,
  };
}

/**
 * Execution environment gates of the 1.1.60 family.
 * Every environment side gate lives here: the environment field validation of every step kind (the evaluate kind runs inside the isolated world only while untrusted markup renders inside the sandboxframe only), the session environment grant gate that refuses a step whose environment sits outside the granted list, the offscreen capability gate that keeps the worker pool behind the optional offscreen grant, the keepalive gate that limits the keepalive port to sessions with an active reviewed plan, the worker pool size validation with no engine cap and the sandbox render origin gate that carries the user per origin toggle.
 * No environment posture, pool size, heartbeat interval or origin list is ever hardcoded: the gates validate user choices and refuse everything else, and no environment ever bypasses the human review.
 */

/** Validates the environment field of every step kind: the field stays one of the four environments, the evaluate kind names the isolated world only, a step carrying untrusted markup names the sandboxframe only, the parse heavy kinds choose between the live page and the offscreen worker pool and every other kind keeps the pagecontext of the page bridge. */
export function stepenvironmentvalid(step: toolstep): policyevaluation {
  if (
    step.environment !== undefined &&
    step.environment !== "pagecontext" &&
    step.environment !== "isolatedworld" &&
    step.environment !== "offscreenworker" &&
    step.environment !== "sandboxframe"
  )
    return {
      allowed: false,
      reason: "The step environment stays one of pagecontext, isolatedworld, offscreenworker and sandboxframe.",
    };
  const allowed = environmentsof(step);
  if (step.environment !== undefined && !allowed.includes(step.environment))
    return {
      allowed: false,
      reason: `The ${step.environment} environment sits outside the ${allowed.join(", ")} the ${step.kind} kind permits; the review sees the environment of every step.`,
    };
  return {
    allowed: true,
    reason:
      step.environment === undefined
        ? `The ${step.kind} step carries no environment field and routes to its ${defaultenvironment(step)} default.`
        : `The ${step.environment} environment of the ${step.kind} step sits inside the ${allowed.join(", ")} the kind permits.`,
  };
}

/** Requires the step environment to sit inside the session environment grant list: a configured list narrows every step of the session to its entries while an absent list keeps the documented default posture where the pagecontext and the isolated world stay open behind the same review. */
export function environmentgrantgate(step: toolstep, grants: environmentkind[] | undefined): policyevaluation {
  if (grants === undefined || grants.length === 0)
    return {
      allowed: true,
      reason: `The session carries no environment grant list, so the ${defaultenvironment(step)} default of the ${step.kind} step stays the documented posture behind the same review.`,
    };
  const environment = step.environment ?? defaultenvironment(step);
  if (!grants.includes(environment))
    return {
      allowed: false,
      reason: `The ${environment} environment sits outside the ${grants.join(", ")} the session granted; no step ever widens the environment grants.`,
    };
  return {
    allowed: true,
    reason: `The ${environment} environment of the ${step.kind} step sits inside the ${grants.join(", ")} the session granted.`,
  };
}

/** Refuses offscreenworker steps when the optional offscreen capability grant stays absent: the worker pool only runs under the user granted offscreen permission, and a step without the grant falls back to inline parsing instead of refusing the reviewed work. */
export function offscreencapabilitygate(input: { environment: environmentkind; granted: boolean }): policyevaluation {
  if (input.environment !== "offscreenworker")
    return { allowed: true, reason: `The ${input.environment} environment needs no offscreen capability grant.` };
  if (!input.granted)
    return {
      allowed: false,
      reason:
        "The offscreen worker pool runs only under the user granted offscreen capability; the step falls back to inline parsing inside the page.",
    };
  return { allowed: true, reason: "The offscreen worker pool runs under the user granted offscreen capability." };
}

/** Limits the keepalive port to sessions with an active reviewed plan: a stopped or paused session holds no port, an expired session holds none, and a plan outside the approved state holds none because the keepalive signal rides a run the user already reviewed. */
export function keepalivegate(input: {
  session: agentsession | undefined;
  plan: agentplan | undefined;
  now: number;
}): policyevaluation {
  if (!input.session) return { allowed: false, reason: "The keepalive port opens only inside an active session." };
  if (input.session.stoppedat !== undefined)
    return { allowed: false, reason: "The keepalive port stays closed for a stopped session." };
  if (input.session.pausedat !== undefined)
    return {
      allowed: false,
      reason: "The keepalive port stays closed while the session pauses; a resumed run reattaches it.",
    };
  if (input.now > input.session.expiresat)
    return { allowed: false, reason: "The keepalive port stays closed for an expired session." };
  if (!input.plan || input.plan.state !== "approved")
    return {
      allowed: false,
      reason:
        "The keepalive port opens only behind an active reviewed plan; unreviewed work never holds the service worker alive.",
    };
  return {
    allowed: true,
    reason: `The approved plan ${input.plan.id} of the active session holds the keepalive port open for its whole run.`,
  };
}

/** Validates the keepalive heartbeat interval as a positive user value in milliseconds: the roadmap documents thirty seconds while the interval stays the user's choice with no engine default. */
export function keepaliveintervalvalid(interval: number): policyevaluation {
  if (!Number.isFinite(interval) || interval <= 0)
    return { allowed: false, reason: "The keepalive heartbeat interval stays a positive user value in milliseconds." };
  return {
    allowed: true,
    reason: `The keepalive heartbeat interval ${interval} milliseconds stays the user configured value; the roadmap documents thirty seconds while the choice stays the user's.`,
  };
}

/** Validates the worker pool size as a user choice with no engine cap: an absent size lets the pool follow the pending parse queue alone while a configured size stays a positive whole number. */
export function workerpoolsizevalid(size: number | undefined): policyevaluation {
  if (size === undefined)
    return {
      allowed: true,
      reason:
        "No worker pool size is configured, so the pool follows the pending parse queue alone with no engine cap.",
    };
  if (!Number.isInteger(size) || size < 1)
    return {
      allowed: false,
      reason: "The worker pool size stays a positive whole number the user configured; no engine cap exists.",
    };
  return {
    allowed: true,
    reason: `The worker pool size ${size} stays the user configured value; no engine cap exists.`,
  };
}

/** Grades one sandbox render by the origins the user allows: an absent list keeps every origin open as the documented user choice while a configured list restricts the untrusted markup renders to the origins it names. */
export function sandboxorigingate(input: { origin: string; allowed: string[] }): policyevaluation {
  if (input.origin.trim() === "")
    return { allowed: false, reason: "The sandbox render needs the source origin of its untrusted markup." };
  if (input.allowed.length > 0 && !input.allowed.includes(input.origin))
    return {
      allowed: false,
      reason: `The origin ${input.origin} sits outside the origins the user allows to render untrusted markup: ${input.allowed.join(", ")}.`,
    };
  return {
    allowed: true,
    reason:
      input.allowed.length === 0
        ? `The origin ${input.origin} renders untrusted markup under the documented open origin list the user chose not to narrow.`
        : `The origin ${input.origin} sits inside the origins the user allows to render untrusted markup.`,
  };
}

/** Exposes the environment requirements of every reviewed action kind: one profile per kind with its allowed environments and its default, so the panel and the executor read the same table the policy validates against. */
export function environmentrequirements(): environmentrequirement[] {
  return environmentrequirementsof([...allowedactions]);
}

/**
 * Security part one gates of the 1.1.61 family.
 * Every trust boundary gate lives here: the automation allowlist gate that flips the posture to denydefault for every ungranted origin and binds each grant to one exact origin with no wildcard expansion while the active tab grant counts as exactly one explicit single origin grant, the origin profile gate that consults the per site profile before every sensitive kind and refuses the kinds its denials name, the consent window gate that scopes every window to one session and one origin, expires it at its duration boundary and suspends the run when the window expires mid step, the revocation gate that accepts mid run revocation as a terminal session event halting the pending step and every queued step, the sensitive class gate that routes payment, credential, delete and publish steps through one fresh consent prompt per class per origin, the consent duration validation that keeps every boundary a positive user value that never defaults to unlimited, and the log read gate that refuses reads of a hash chain with a broken link.
 * No duration, boundary, shape list or kind list is ever hardcoded: every window, profile, consent and mask shape stays the user's choice, and no security operation ever bypasses the human review.
 */

/** Checks one origin against the per origin automation allowlist under the denydefault posture: every ungranted origin stays refused before any step dispatches, the active tab origin counts as exactly one explicit single origin grant, and a wildcard entry refuses the whole check because no wildcard expansion exists. */
export function automationallowlistgate(input: {
  origin: string;
  allowlist: automationallowlistentry[];
  session: agentsession | undefined;
}): policyevaluation {
  const verdict = allowlistcheck({
    origin: input.origin,
    allowlist: input.allowlist,
    ...(input.session !== undefined ? { sessionorigin: input.session.origin } : {}),
  });
  if (!verdict.allowed) return { allowed: false, reason: verdict.reason };
  return { allowed: true, reason: verdict.reason };
}

/** Consults the per site origin profile before one sensitive kind: an explicit denial refuses the kind on that origin, an explicit grant allows it while the fresh class consent gate still routes the sensitive classes through their prompt, and a non-sensitive kind needs no profile consult. */
export function originprofilegate(input: {
  profile: originprofile | undefined;
  kind: actionkind;
  sensitive: boolean;
}): policyevaluation {
  const verdict = profilegrade(input);
  if (!verdict.allowed) return { allowed: false, reason: verdict.reason };
  return { allowed: true, reason: verdict.reason };
}

/** Checks the consent window of one step before dispatch: the window scopes to exactly one session and one origin, a window past its duration boundary suspends the run mid step, and a sensitive step without an active window waits for its consent prompt. */
export function consentwindowgate(input: {
  window: consentwindow | undefined;
  sessionid: string;
  origin: string;
  sensitive: boolean;
  now: number;
}): policyevaluation {
  if (!input.sensitive)
    return {
      allowed: true,
      reason: "The non-sensitive step rides the session origin grants and needs no consent window of its own.",
    };
  const verdict = windowgatesstep({
    window: input.window,
    sessionid: input.sessionid,
    origin: input.origin,
    now: input.now,
  });
  if (!verdict.allowed) return { allowed: false, reason: verdict.reason };
  return { allowed: true, reason: verdict.reason };
}

/** Accepts the mid run revocation as a terminal session event: the pending step and every queued step halt without executing, the run aborts its plan, and no later step of the revoked run dispatches. */
export function revokerungate(input: {
  revocation: revokerunevent | undefined;
  sessionid: string;
  runid: string;
}): policyevaluation {
  if (input.revocation === undefined)
    return { allowed: true, reason: "No revocation halted the run; the steps keep their reviewed order." };
  if (input.revocation.sessionid !== input.sessionid)
    return { allowed: true, reason: "The revocation belongs to another session and halts nothing here." };
  if (input.revocation.runid !== input.runid)
    return { allowed: true, reason: "The revocation belongs to another run and halts nothing here." };
  return {
    allowed: false,
    reason: `The revocation of ${input.revocation.actor} halted the pending step and ${Math.max(0, input.revocation.haltedstepids.length - 1)} queued step${Math.max(0, input.revocation.haltedstepids.length - 1) === 1 ? "" : "s"} without executing them: ${input.revocation.haltedstepids.join(", ")}.`,
  };
}

/** Routes one sensitive step through its fresh consent prompt: every sensitive class the classification names needs its own fresh consent per origin, an upload, download or evaluate grade sensitive by default rides its consent window prompt, and a non-sensitive step needs no fresh consent. */
export function sensitiveclassgate(input: {
  origin: string;
  classes: sensitiveclass[];
  bydefault: boolean;
  sensitive: boolean;
  consents: classconsent[];
  now: number;
}): policyevaluation {
  if (!input.sensitive)
    return { allowed: true, reason: "The step carries no sensitive class and needs no fresh consent prompt." };
  const verdict = missingclassconsents({
    origin: input.origin,
    classes: input.classes,
    bydefault: input.bydefault,
    consents: input.consents,
    now: input.now,
  });
  if (verdict.needed) return { allowed: false, reason: verdict.reason };
  return { allowed: true, reason: verdict.reason };
}

/** Validates the consent window duration as a positive user value in milliseconds: every consent window names its boundary and no window ever defaults to unlimited. */
export function consentdurationvalid(duration: number): policyevaluation {
  if (!Number.isFinite(duration) || duration <= 0)
    return {
      allowed: false,
      reason:
        "The consent window duration stays a positive user value in milliseconds; no grant ever defaults to unlimited.",
    };
  return {
    allowed: true,
    reason: `The consent window duration ${duration} milliseconds stays the user configured boundary the prompt names.`,
  };
}

/** Refuses log reads of a chain with a broken link: the audit accessor verifies the whole hash chain before returning a single entry, and tamper evidence refuses the read instead of serving a forged record. */
export function logreadgate(input: { valid: boolean; brokenat?: number }): policyevaluation {
  if (!input.valid)
    return {
      allowed: false,
      reason:
        input.brokenat !== undefined
          ? `The log chain breaks at entry ${input.brokenat}; the audit accessor refuses the read of a forged record.`
          : "The log chain fails its verification; the audit accessor refuses the read of a forged record.",
    };
  return {
    allowed: true,
    reason: "The log chain verifies from the genesis hash to the last entry; the audit accessor serves the entries.",
  };
}

/** Grades one step through the whole sensitive pipeline: the classification names the classes and the default grade, the origin profile consults its per kind decisions, and the fresh class consent gate routes every named class through its own prompt per origin. */
export function sensitivepipelingate(input: {
  step: Pick<toolstep, "kind" | "value" | "options">;
  profile: originprofile | undefined;
  consents: classconsent[];
  origin: string;
  now: number;
}): policyevaluation {
  const classification = sensitiveclassesof(input.step);
  const profileverdict = originprofilegate({
    profile: input.profile,
    kind: input.step.kind,
    sensitive: classification.sensitive,
  });
  if (!profileverdict.allowed) return { allowed: false, reason: profileverdict.reason ?? "" };
  const consentverdict = sensitiveclassgate({
    origin: input.origin,
    classes: classification.classes,
    bydefault: classification.bydefault,
    sensitive: classification.sensitive,
    consents: input.consents,
    now: input.now,
  });
  if (!consentverdict.allowed) return { allowed: false, reason: `${classification.reason} ${consentverdict.reason}` };
  return { allowed: true, reason: `${classification.reason} ${consentverdict.reason}` };
}

/**
 * Security part two gates of the 1.1.62 family.
 * Every inbound and dispatch guard lives here: the schemastrict gate that validates every inbound command before dispatch and rejects unknown fields with the path and the expected shape, the origincheck and connectallow gates that guard every runtime message and port connection while dropping senders absent from the user managed list, the ratelimit gate that bounds automation commands per origin and per session by deferring past the bucket until the window resets, the confirmpay, confirmdelete and confirmcreds gates that route payment, destructive delete and credential use steps through one distinct human action each with no batch approval and no timeout, the phishguard gate that blocks login origins crossing the user lookalike threshold while naming the matched known origin, the safedefaults gate that profiles unknown origins as reads only, the vault secret gate that refuses secrets in step options, variables and plan texts, and the untrusted render gate that marks extracted markup untrusted and routes it through the sandboxframe.
 * No bound, window, threshold or sender list is ever hardcoded: every ratelimit bound, lookalike threshold and connectallow entry stays the user's choice, and no security operation ever bypasses the human review.
 */

/** Requires schemastrict validation of every inbound command before dispatch: every schema error names its path and its expected shape, and the refusal echoes no payload. */
export function schemaguardgate(input: { errors: schemaerror[] }): policyevaluation {
  if (input.errors.length === 0)
    return { allowed: true, reason: "The inbound command matches its declared schemastrict grammar field by field." };
  const first = input.errors[0];
  return {
    allowed: false,
    reason: `${input.errors.length} schema error${input.errors.length === 1 ? "" : "s"} refuse the command before dispatch: ${input.errors.map((error) => error.reason).join(" ")}${first !== undefined ? ` The first error sits at ${first.path} expecting ${first.expected}.` : ""}`,
  };
}

/** Gates the protocol major negotiation of the 1.1.91 api freeze as the 2.0.0 sunset left it: a client that declares nothing or the frozen major two agrees, a client that declares major one refuses below the supported floor the sunset raised — the refusal names the supported range and the migrateplan command with the migration guide as the conversion path — and a major above two refuses until a future major bump. */
export function protocolnegotiationgate(input: { client?: string | number }): policyevaluation & { major?: number } {
  const declared =
    typeof input.client === "string" || typeof input.client === "number" ? String(input.client) : undefined;
  if (declared === undefined || declared.trim() === "")
    return {
      allowed: true,
      reason: `The client declared no protocol version, so the negotiation answers the frozen protocolv2 default of ${protocolmajor}.`,
      major: protocolmajor,
    };
  const match = /^(\d+)/.exec(declared.trim());
  const major = match === null ? undefined : Number(match[1]);
  if (major === undefined || major < protocolfloormajor)
    return {
      allowed: false,
      reason: `The client speaks protocol version ${declared} below the supported floor; the supported protocol versions are ${protocolfloormajor} through ${protocolmajor}, and version one assets convert through the migrateplan command and docs/migrationguide.md.`,
    };
  if (major > protocolmajor)
    return {
      allowed: false,
      reason: `The client speaks protocol version ${major} while the server stops at ${protocolmajor}; the supported protocol versions are ${protocolfloormajor} through ${protocolmajor} until a future major bump.`,
    };
  if (major < protocolmajor)
    return {
      allowed: true,
      major,
      reason: `The client speaks protocol version ${major}: the negotiation agrees inside a compatibility window below the frozen line — the 2.0.0 sunset closed the version one window the line last carried, so the major two line never reaches this branch and version one assets convert through the migrateplan command and docs/migrationguide.md.`,
    };
  return { allowed: true, major: protocolmajor, reason: "The client speaks the frozen protocolv2 major." };
}

/** Gates unknown fields of an inbound message by the negotiated protocol major: the 2.0.0 sunset closed the version one tolerance the deprecation window carried, so the strict refusal answers every unknown field on every major the line accepts — the version one branch the negotiation can no longer reach records the closed window — and a frozen contract field joins only through a release bump. */
export function unknownfieldsgate(input: { unknown: string[]; major: number }): policyevaluation {
  if (input.unknown.length === 0) return { allowed: true, reason: "The inbound message carries no unknown field." };
  if (input.major >= protocolmajor)
    return {
      allowed: false,
      reason: `Strict schema validation for protocol version ${input.major} refuses the unknown field${input.unknown.length === 1 ? "" : "s"} ${input.unknown.join(", ")} before dispatch; a frozen contract field joins only through a release bump.`,
    };
  return {
    allowed: false,
    reason: `Strict schema validation for protocol version ${input.major} refuses the unknown field${input.unknown.length === 1 ? "" : "s"} ${input.unknown.join(", ")} before dispatch; the version one tolerance of the deprecation window closed at 2.0.0, so no protocol major the line accepts tolerates an unknown field.`,
  };
}

/** Gates capability manifest drift between releases: an empty drift list passes while every drift entry the comparison names refuses, so a surface change without its manifest update never ships. */
export function capmanifestdriftgate(input: { drift: string[] }): policyevaluation {
  if (input.drift.length === 0)
    return { allowed: true, reason: "The capability manifest matches its frozen surface entry for entry." };
  return {
    allowed: false,
    reason: `Capability drift of ${input.drift.length} entr${input.drift.length === 1 ? "y" : "ies"} between the frozen manifests: ${input.drift.join("; ")}.`,
  };
}

/** Requires the origincheck verdict on every runtime message before handling: a sender the verdict drops never reaches a handler. */
export function origincheckgate(input: { verdict: origincheckverdict }): policyevaluation {
  if (!input.verdict.accepted) return { allowed: false, reason: input.verdict.reason };
  return { allowed: true, reason: input.verdict.reason };
}

/** Drops messages and port connections from senders absent from the connectallow list: the list ships empty by default and holds user managed entries only. */
export function connectallowgate(input: {
  senderid?: string;
  senderorigin?: string;
  extensionid: string;
  connectallow: connectallowentry[];
}): policyevaluation {
  const verdict = origincheckof(input);
  if (!verdict.accepted) return { allowed: false, reason: verdict.reason };
  return { allowed: true, reason: verdict.reason };
}

/** Validates the ratelimit bucket bounds as user choices: the limit and the window stay positive user values because no hidden ceiling exists. */
export function ratelimitboundsvalid(limit: number, window: number): policyevaluation {
  const bounds = bucketboundsvalid(limit, window);
  if (!bounds.valid) return { allowed: false, reason: bounds.reason };
  return { allowed: true, reason: bounds.reason };
}

/** Applies one ratelimit bucket to an automation command per origin and per session: a command inside its bound consumes a slot while a command past its bound defers until the window resets; an origin without a bucket keeps every command because the bounds stay user choices only. */
export function ratelimitgate(input: { bucket: ratelimitbucket | undefined; now: number }): policyevaluation {
  if (input.bucket === undefined)
    return {
      allowed: true,
      reason: "No ratelimit bucket covers the origin of the command; the bounds stay user configured choices only.",
    };
  if (input.now >= input.bucket.resetsat)
    return {
      allowed: true,
      reason: `The bucket window of ${input.bucket.origin} reset at ${input.bucket.resetsat}; the command consumes the first slot of its fresh window.`,
    };
  if (input.bucket.used < input.bucket.limit)
    return {
      allowed: true,
      reason: `The command consumes slot ${input.bucket.used + 1} of ${input.bucket.limit} in the bucket of ${input.bucket.origin}.`,
    };
  return {
    allowed: false,
    reason: `The bucket of ${input.bucket.origin} holds its ${input.bucket.limit} command bound; the command defers until the window resets at ${input.bucket.resetsat}.`,
  };
}

/** Routes payment class steps through the confirmpay gate: a payment step without a gate opens one and pauses, an open gate keeps the pause, a resolved gate lets the step dispatch and a refused gate never dispatches it. */
export function confirmpaygate(input: {
  classes: sensitiveclass[];
  state: "none" | "open" | "resolved" | "refused";
}): policyevaluation {
  const kind = gatekindfor(input.classes);
  if (kind !== "confirmpay")
    return { allowed: true, reason: "The step carries no payment class and needs no confirmpay gate." };
  if (input.state === "resolved")
    return {
      allowed: true,
      reason:
        "The human resolved the confirmpay gate of the payment step; the step dispatches with its reviewed amount, payee origin and target.",
    };
  if (input.state === "refused")
    return {
      allowed: false,
      reason: "The human refused the confirmpay gate of the payment step; the payment never dispatches.",
    };
  if (input.state === "open")
    return {
      allowed: false,
      reason:
        "The confirmpay gate of the payment step stays open with the amount, the payee origin and the target element; the executor pauses until the human resolves it and no timeout ever resolves a gate.",
    };
  return {
    allowed: false,
    reason:
      "The payment step opens its confirmpay gate with the amount, the payee origin and the target element; the executor pauses until one distinct human action resolves it.",
  };
}

/** Routes destructive delete steps through the confirmdelete gate: a delete step without a gate opens one and pauses, an open gate keeps the pause, a resolved gate lets the step dispatch and a refused gate never dispatches it. */
export function confirmdeletegate(input: {
  classes: sensitiveclass[];
  state: "none" | "open" | "resolved" | "refused";
}): policyevaluation {
  const kind = gatekindfor(input.classes);
  if (kind !== "confirmdelete")
    return { allowed: true, reason: "The step carries no delete class and needs no confirmdelete gate." };
  if (input.state === "resolved")
    return {
      allowed: true,
      reason:
        "The human resolved the confirmdelete gate of the destructive step; the step dispatches with its reviewed target, scope and irreversibility.",
    };
  if (input.state === "refused")
    return {
      allowed: false,
      reason: "The human refused the confirmdelete gate of the destructive step; the deletion never dispatches.",
    };
  if (input.state === "open")
    return {
      allowed: false,
      reason:
        "The confirmdelete gate of the destructive step stays open with the target, the scope and the irreversibility; the executor pauses until the human resolves it and no timeout ever resolves a gate.",
    };
  return {
    allowed: false,
    reason:
      "The destructive step opens its confirmdelete gate with the target, the scope and the irreversibility; the executor pauses until one distinct human action resolves it.",
  };
}

/** Routes credential use steps through the confirmcreds gate: a credential step without a gate opens one and pauses with the credential label only, an open gate keeps the pause, a resolved gate lets the step read the vault at the last possible moment and a refused gate never dispatches it. */
export function confirmcredsgate(input: {
  classes: sensitiveclass[];
  state: "none" | "open" | "resolved" | "refused";
}): policyevaluation {
  const kind = gatekindfor(input.classes);
  if (kind !== "confirmcreds")
    return { allowed: true, reason: "The step carries no credential class and needs no confirmcreds gate." };
  if (input.state === "resolved")
    return {
      allowed: true,
      reason:
        "The human resolved the confirmcreds gate of the credential step; the step reads its value from the vault at the last possible moment and no log records it.",
    };
  if (input.state === "refused")
    return {
      allowed: false,
      reason: "The human refused the confirmcreds gate of the credential step; the credential never dispatches.",
    };
  if (input.state === "open")
    return {
      allowed: false,
      reason:
        "The confirmcreds gate of the credential step stays open with its credential label only; the executor pauses until the human resolves it and no timeout ever resolves a gate.",
    };
  return {
    allowed: false,
    reason:
      "The credential step opens its confirmcreds gate with its credential label only; the executor pauses until one distinct human action resolves it.",
  };
}

/** Requires a distinct human action for each gated step: one action resolves exactly one gate, so a batch resolution refuses in full. */
export function gatebatchgate(input: { gateids: string[] }): policyevaluation {
  if (input.gateids.length === 0) return { allowed: false, reason: "A gate resolution names its single gate." };
  if (input.gateids.length > 1)
    return {
      allowed: false,
      reason: `One human action resolves exactly one gate; the batch of ${input.gateids.length} gates refuses in full because no batch approval exists.`,
    };
  return {
    allowed: true,
    reason: "The resolution names exactly one gate; the distinct human action resolves it alone.",
  };
}

/** Validates the phishguard lookalike threshold as a user choice between zero and one: the block line never defaults to an engine value. */
export function phishthresholdgate(threshold: number): policyevaluation {
  const verdict = phishthresholdvalid(threshold);
  if (!verdict.valid) return { allowed: false, reason: verdict.reason };
  return { allowed: true, reason: verdict.reason };
}

/** Blocks the credential step when the phishguard verdict crosses the user threshold: the deny event names the matched known origin the login target resembles. */
export function phishguardgate(input: { verdict: phishverdict }): policyevaluation {
  if (input.verdict.blocked) return { allowed: false, reason: input.verdict.reason };
  return { allowed: true, reason: input.verdict.reason };
}

/** Applies safedefaults to an origin without an originprofile: the documented read kinds pass while every sensitive class denies until the user widens the profile in the originprofile editor. */
export function safedefaultsgate(input: {
  profile: originprofile | undefined;
  classes: sensitiveclass[];
  sensitive: boolean;
}): policyevaluation {
  if (input.profile !== undefined)
    return {
      allowed: true,
      reason: `The origin profile of ${input.profile.origin} exists; the safedefaults posture stays out of the decision.`,
    };
  if (!input.sensitive)
    return {
      allowed: true,
      reason:
        "The non-sensitive step rides the reads only baseline of the safedefaults posture; the first visit grants reads alone.",
    };
  return {
    allowed: false,
    reason: `No origin profile exists and the safedefaults posture denies the sensitive ${input.classes.length > 0 ? input.classes.join(" and ") : "by default"} step; open the originprofile editor to widen the profile the user controls.`,
  };
}

/** Refuses secrets in step options, variables and plan text: a plaintext value that digests to a vault record or a raw value behind a masked field shape never dispatches. */
export function vaultsecretgate(input: { leaks: string[]; carries: boolean }): policyevaluation {
  if (input.leaks.length > 0)
    return {
      allowed: false,
      reason: `The plan carries ${input.leaks.length} plaintext secret value${input.leaks.length === 1 ? "" : "s"} that digest to vault records; secrets never ride step options, variables or plan texts, only the vault holds them.`,
    };
  if (input.carries)
    return {
      allowed: false,
      reason:
        "The step types a raw value into a masked field shape; credential steps read their value from the vault at the last possible moment and never carry it in the options.",
    };
  return {
    allowed: true,
    reason: "The step and the plan carry no secret outside the vault; the values stay behind the seam.",
  };
}

/** Marks extracted markup untrusted before any render: the render routes through the sandboxframe of the 1.1.60 family while an injection into the page context refuses. */
export function untrustedrendergate(input: {
  environment: "pagecontext" | "isolatedworld" | "offscreenworker" | "sandboxframe";
}): policyevaluation {
  if (input.environment === "sandboxframe")
    return {
      allowed: true,
      reason:
        "The extracted markup renders inside the sandboxframe under its nonce with scripts and handlers stripped; the untrusted content never reenters the page context.",
    };
  return {
    allowed: false,
    reason: `The extracted markup grades untrusted and refuses to render inside the ${input.environment}; every untrusted render routes through the sandboxframe.`,
  };
}

/**
 * Session interface gates of the 1.1.63 family.
 * Every interface gate lives here: the sitenotes read gate that limits note reads to the origins the session granted, the sitenotes write gate that keeps note writes behind one explicit consent, the scratchpad scope gate that binds every entry to its owning task session, the memory read scope gate that opens correctionmemory and consentmemory reads during planning and prompting alone, the semanticrecall scope gate that refuses recall queries across origins outside the run scope, the runsummary window validation that keeps the distillation length a user value with no fixed cap, the retention validations that keep every note, scratchpad, summary and correction window a positive user choice, the consentmemory advisory gate that keeps every record advisory with denials carrying the same weight as grants, the cancelrun gate that rolls the queued steps back only while the executed steps stay untouched in the sealed log, and the retry dispatch gate that lets a retry pass only through a new reviewed dispatch.
 * No window, retention, limit or rollback scope is ever hardcoded: every length and expiry stays the user's choice, and no interface surface ever bypasses the human review.
 */

/** Gates one sitenotes read against the granted origins: a note of an origin the session never granted refuses the read. */
export function sitenotesreadgate(input: { origin: string; grants: string[] }): policyevaluation {
  if (input.grants.includes(input.origin))
    return { allowed: true, reason: `The session granted ${input.origin}, so the site notes of the origin read.` };
  return {
    allowed: false,
    reason: `The session never granted ${input.origin}; the site notes of the origin refuse the read.`,
  };
}

/** Gates one sitenotes write behind explicit consent: a note write without the reviewed consent of the user refuses. */
export function sitenoteswritegate(input: { consent: boolean; origin: string }): policyevaluation {
  if (!input.consent)
    return {
      allowed: false,
      reason: `The site note write for ${input.origin} needs the explicit consent of the user; no note lands without a reviewed write.`,
    };
  return {
    allowed: true,
    reason: `The user consented to the site note write for ${input.origin}; the note keeps its author provenance and its timestamps.`,
  };
}

/** Gates one scratchpad access to its owning task session: an entry of another task or another session never reads or writes. */
export function scratchpadscopegate(input: {
  taskid: string;
  sessionid: string;
  entrytaskid: string;
  entrysessionid: string;
}): policyevaluation {
  if (input.taskid !== input.entrytaskid || input.sessionid !== input.entrysessionid)
    return {
      allowed: false,
      reason: `The scratchpad entry belongs to the task ${input.entrytaskid} of the session ${input.entrysessionid}; the task ${input.taskid} of the session ${input.sessionid} never crosses that boundary.`,
    };
  return {
    allowed: true,
    reason: `The scratchpad entry belongs to the task ${input.taskid} of the session ${input.sessionid} that asks for it.`,
  };
}

/** Gates correctionmemory and consentmemory reads to the planning and prompting phases: a read outside those phases refuses because the history serves the review alone. */
export function memoryreadscopegate(input: {
  phase: "planning" | "prompting" | "execution" | "idle";
}): policyevaluation {
  if (input.phase === "planning" || input.phase === "prompting")
    return {
      allowed: true,
      reason: `The ${input.phase} phase reads the correction and consent memory so the proposal and the prompt carry the prior decisions.`,
    };
  return {
    allowed: false,
    reason: `The ${input.phase} phase reads no correction or consent memory; the history serves the planning and the prompting alone.`,
  };
}

/** Refuses semanticrecall queries across origins outside the run scope: the recall ranks only the origins the run scope names. */
export function semanticrecallscopegate(input: { origin: string | undefined; scope: string[] }): policyevaluation {
  if (input.origin === undefined)
    return {
      allowed: true,
      reason: `The recall query names no origin, so it ranks the ${input.scope.length} origin${input.scope.length === 1 ? "" : "s"} of the run scope only.`,
    };
  if (!input.scope.includes(input.origin))
    return {
      allowed: false,
      reason: `The recall query asks for ${input.origin} while the run scope holds ${input.scope.length > 0 ? input.scope.join(", ") : "no origin"}; a recall across origins outside the run scope refuses.`,
    };
  return {
    allowed: true,
    reason: `The recall query asks for ${input.origin} inside the run scope; the ranking stays scoped.`,
  };
}

/** Validates the runsummary window as a user value: the distillation length follows the user configured step window with no fixed cap while an absent window keeps every step. */
export function summarywindowvalid(window: number | undefined): policyevaluation {
  if (window === undefined)
    return {
      allowed: true,
      reason: "No runsummary window is configured, so the distillation keeps every step with no fixed cap.",
    };
  if (!Number.isInteger(window) || window < 0)
    return {
      allowed: false,
      reason: "The runsummary window stays a whole number of steps the user chose; no engine cap exists.",
    };
  return {
    allowed: true,
    reason: `The runsummary window of ${window} step${window === 1 ? "" : "s"} stays the user configured choice; no engine cap exists.`,
  };
}

/** Validates one retention window of the five session stores as a positive user value: no note, scratchpad, summary or correction ever expires at an engine boundary. */
export function sessionretentionvalid(window: number | undefined): policyevaluation {
  if (window === undefined)
    return {
      allowed: true,
      reason: "No retention window is configured, so the session store keeps every record forever.",
    };
  if (!Number.isFinite(window) || window <= 0)
    return {
      allowed: false,
      reason: "The retention window stays a positive user value in milliseconds; no engine boundary expires a record.",
    };
  return { allowed: true, reason: `The retention window of ${window} milliseconds stays the user configured choice.` };
}

/** Keeps the consentmemory advisory: no record auto grants, a denial carries the same weight as a grant, and every decision still needs its own prompt. */
export function consentmemoryadvisorygate(input: {
  auto: boolean;
  latest?: { decision: string; origin: string };
}): policyevaluation {
  if (input.auto)
    return {
      allowed: false,
      reason: `The consent memory never auto grants: the prior decisions of ${input.latest?.origin ?? "the origin"} stay advisory and every grant needs its own prompt.`,
    };
  if (input.latest !== undefined && input.latest.decision === "deny")
    return {
      allowed: true,
      reason: `The consent memory holds a prior denial for ${input.latest.origin} with the same weight as a grant; the prompt shows the refusal and the user decides again.`,
    };
  return {
    allowed: true,
    reason: "The consent memory stays advisory; the prompt opens with the prior decisions and the user decides.",
  };
}

/** Gates one cancelrun action: the rollback touches the queued steps only while the executed steps stay untouched in the sealed immutable log. */
export function cancelrungate(input: {
  queuedstepids: string[];
  executedstepids: string[];
  rollbackscope: "queued" | "none";
}): policyevaluation {
  if (input.rollbackscope === "none")
    return {
      allowed: true,
      reason: `The cancelrun stops the run with no rollback; the ${input.queuedstepids.length} queued step${input.queuedstepids.length === 1 ? "" : "s"} stay as the run left them and the ${input.executedstepids.length} executed step${input.executedstepids.length === 1 ? "" : "s"} stay in the sealed log.`,
    };
  return {
    allowed: true,
    reason: `The cancelrun rolls the ${input.queuedstepids.length} queued step${input.queuedstepids.length === 1 ? "" : "s"} back${input.queuedstepids.length > 0 ? ` (${input.queuedstepids.join(", ")})` : ""} while the ${input.executedstepids.length} executed step${input.executedstepids.length === 1 ? "" : "s"} stay untouched in the sealed log.`,
  };
}

/** Gates one step retry through a new reviewed dispatch: an automatic retry without the review refuses while a reviewed retry rides the full consent gate chain. */
export function retrydispatchgate(input: { reviewed: boolean; stepid: string }): policyevaluation {
  if (!input.reviewed)
    return {
      allowed: false,
      reason: `The retry of the step ${input.stepid} passes only through a new reviewed dispatch; an automatic retry never bypasses the review.`,
    };
  return {
    allowed: true,
    reason: `The retry of the step ${input.stepid} dispatches again through the full consent gate chain: the session, the plan and the origin gates all recheck the step.`,
  };
}

/**
 * Interface surface gates of the 1.1.64 family.
 * Every surface gate lives here: the palette action gate that keeps each commandpalette action behind its existing permission gate, the taskinput proposal gate that routes every submission through the same proposal flow as the api, the plan review gate that requires the plancard review before any execution, the stepapprove gate that binds each resolution to one step with one distinct human action and no batch approval, the diffpreview gate that limits generation to write class steps, the onboarding consent gate that lets a full completion write exactly one consent scoped event, the logstream buffer bound validation that keeps the live window a user value with no engine cap, and the logstream egress gate that lets an audit excerpt copy only a verified range.
 * No window, limit or batch scope is ever hardcoded: every bound stays the user's choice, and no interface surface ever bypasses the human review.
 */

/** Gates one commandpalette action behind its existing permission gate: a command that names an ungranted capability never lists, and a command that needs a session never lists without one. */
export function paletteactiongate(input: {
  action: { command: string; permission?: string; session?: boolean };
  granted: string[];
  sessionactive: boolean;
}): policyevaluation {
  if (input.action.permission !== undefined && !input.granted.includes(input.action.permission))
    return {
      allowed: false,
      reason: `The ${input.action.command} command needs the ${input.action.permission} capability granted before the palette lists it; the palette never offers an action the current capability set refuses.`,
    };
  if (input.action.session === true && !input.sessionactive)
    return {
      allowed: false,
      reason: `The ${input.action.command} command needs an active browser session before the palette lists it; the palette never offers a run action without its session.`,
    };
  return {
    allowed: true,
    reason: `The ${input.action.command} command rides its granted permissions and lists in the palette.`,
  };
}

/** Routes one taskinput submission through the same proposal flow as the api: an empty goal or origin refuses, and a direct execution bypass refuses because every goal becomes a reviewed plan first. */
export function taskinputproposalgate(input: { text: string; origin: string; direct: boolean }): policyevaluation {
  if (input.direct)
    return {
      allowed: false,
      reason:
        "The taskinput never executes a goal directly; every natural language goal routes through the same proposal flow as the api and becomes a reviewed plan first.",
    };
  if (input.text.trim() === "")
    return {
      allowed: false,
      reason:
        "The taskinput submission needs its natural language goal; an empty goal never reaches the proposal flow.",
    };
  if (input.origin.trim() === "")
    return {
      allowed: false,
      reason:
        "The taskinput submission needs its active origin scope; a goal without an origin never reaches the proposal flow.",
    };
  return {
    allowed: true,
    reason: `The taskinput goal for ${input.origin} rides the same proposal flow as the api: the observation, the capabilities and the plan review all recheck it.`,
  };
}

/** Requires the plan review through plancards before any execution: an approved plan already passed the review while a pending plan without its plancard review refuses every execution. */
export function planreviewgate(input: { reviewed: boolean; state: "pending" | "approved" }): policyevaluation {
  if (input.state === "approved")
    return {
      allowed: true,
      reason: "The plan already passed its review: the approval is the review of record and the execution proceeds.",
    };
  if (!input.reviewed)
    return {
      allowed: false,
      reason:
        "The pending plan has no plancard review yet; every step renders its card with the risk class, the environment and the options before any execution.",
    };
  return {
    allowed: true,
    reason:
      "The plancard review of the pending plan is open; the resolution of each step stays a distinct human action.",
  };
}

/** Gates one stepapprove resolution: each action resolves exactly one step with one distinct human provenance and a batch resolution refuses in full. */
export function stepapprovegate(input: {
  stepids: string[];
  resolution: "approve" | "reject" | "edit";
  surface: "popup" | "sidepanel" | "dashboardpage" | "optionspage" | "onboarding" | "omnibox" | "page" | "background";
}): policyevaluation {
  if (input.stepids.length === 0) return { allowed: false, reason: "A stepapprove resolution names its single step." };
  if (input.stepids.length > 1)
    return {
      allowed: false,
      reason: `One human action resolves exactly one step; the batch of ${input.stepids.length} steps refuses in full because no batch approval exists.`,
    };
  if (input.surface === "background")
    return {
      allowed: false,
      reason: `The ${input.resolution} resolution of the step ${input.stepids[0]} needs its distinct human action from a surface; the background never resolves a review on its own.`,
    };
  if (input.resolution === "edit")
    return {
      allowed: true,
      reason: `The user edits the step ${input.stepids[0]} from the ${input.surface} before approving; the corrected shape rides the plan and the resolution keeps its human provenance.`,
    };
  return {
    allowed: true,
    reason: `The user ${input.resolution === "approve" ? "approved" : "rejected"} the step ${input.stepids[0]} from the ${input.surface}; one distinct human action resolved the step alone.`,
  };
}

/** Limits diffpreview generation to write class steps: a read or interaction step changes no page state, so no before and after pair exists to compare. */
export function diffpreviewgate(input: { risk: "read" | "interaction" | "sensitive" }): policyevaluation {
  if (input.risk !== "sensitive")
    return {
      allowed: false,
      reason: `The ${input.risk} step changes no page or browser state; the diffpreview compares the observed before state with the predicted after state of write class steps only.`,
    };
  return {
    allowed: true,
    reason:
      "The write class step changes page or browser state, so the diffpreview compares its observed before state with its predicted after state.",
  };
}

/** Gates the onboarding completion event: a full completion writes exactly one consent scoped event and a second consent event refuses. */
export function onboardingconsentgate(input: { consentevents: string[] }): policyevaluation {
  if (input.consentevents.length === 0)
    return {
      allowed: true,
      reason: "The onboarding completion writes its single consent scoped event; no consent event exists yet.",
    };
  if (input.consentevents.length === 1)
    return {
      allowed: false,
      reason: `The onboarding already wrote its single consent scoped event ${input.consentevents[0]}; a walkthrough never writes a second one.`,
    };
  return {
    allowed: false,
    reason: `The onboarding found ${input.consentevents.length} consent scoped events; a walkthrough writes exactly one and the extra events refuse.`,
  };
}

/** Validates the logstream live buffer bound as a user value: the live window follows the user configured bound with no engine cap while an absent bound keeps every event live. */
export function logbufferboundvalid(bound: number | undefined): policyevaluation {
  if (bound === undefined)
    return {
      allowed: true,
      reason:
        "No logstream buffer bound is configured, so the live window keeps every event while the full history stays in memory.",
    };
  if (!Number.isInteger(bound) || bound <= 0)
    return {
      allowed: false,
      reason:
        "The logstream buffer bound stays a positive whole number of events the user chose; no engine cap exists.",
    };
  return {
    allowed: true,
    reason: `The logstream buffer bound of ${bound} event${bound === 1 ? "" : "s"} stays the user configured choice; the full history stays in memory.`,
  };
}

/** Gates the logstream audit excerpt copy: only a verified range copies while an unverified chain refuses the egress in full. */
export function logstreamegressgate(input: { verified: boolean; entries: number }): policyevaluation {
  if (input.entries === 0)
    return {
      allowed: false,
      reason: "The audit excerpt names no event of the logstream; an empty range never copies.",
    };
  if (!input.verified)
    return {
      allowed: false,
      reason:
        "The logstream chain failed its live verification; the audit excerpt refuses the copy because only a verified range leaves the stream.",
    };
  return {
    allowed: true,
    reason: `The logstream chain verifies across the ${input.entries} event${input.entries === 1 ? "" : "s"} of the range; the audit excerpt copies as one verified record.`,
  };
}

/**
 * Interface surface gates of the 1.1.65 family, part two.
 * Every finishing gate lives here: the quickaction gate that keeps each context menu entry behind the origin allowlist of the clicked tab, the omniboxtask gate that routes every keyword goal through the same proposal and review flow as the api, the shortcutkey gate that binds each shortcut only to a commandpalette command with its gates intact, the notification content gate that requires consent before any notification shows page content, the pickeroverlay gate that limits every candidate read to the granted origin, the shotpanel gate that limits every capture view to captures of granted origins, the siteprofile gate that keeps per site interface preferences on https origins beside the originprofiles family, and the importexport gate that refuses secretvault values and unmasked logs in every bundle under any flag.
 * No depth, count or binding is ever hardcoded: every bound stays the user's choice, and no interface element ever bypasses the human review.
 */

/** Gates one quickaction behind the origin allowlist of the clicked tab: an ungranted origin never registers its context menu entries, and a session bound entry never registers without an active session. */
export function quickactiongate(input: {
  action: { command: string; origin: string; permission?: string; session?: boolean };
  granted: string[];
  sessionactive: boolean;
  capabilities?: string[];
}): policyevaluation {
  if (input.action.origin.trim() === "")
    return {
      allowed: false,
      reason: `The ${input.action.command} quickaction needs the origin of the clicked tab; an originless entry never registers.`,
    };
  if (!input.granted.includes(input.action.origin))
    return {
      allowed: false,
      reason: `The ${input.action.command} quickaction stays off the ${input.action.origin} tab because its origin holds no allowlist entry; only permitted actions surface.`,
    };
  if (input.action.session === true && !input.sessionactive)
    return {
      allowed: false,
      reason: `The ${input.action.command} quickaction needs an active browser session before it registers; the context menu never offers a run action without its session.`,
    };
  if (input.action.permission !== undefined && !(input.capabilities ?? []).includes(input.action.permission))
    return {
      allowed: false,
      reason: `The ${input.action.command} quickaction needs the ${input.action.permission} capability granted before it registers; the context menu never offers an action the current capability set refuses.`,
    };
  return {
    allowed: true,
    reason: `The ${input.action.command} quickaction rides the origin allowlist of the clicked ${input.action.origin} tab and registers.`,
  };
}

/** Routes one omniboxtask submission through the same proposal and review flow as the api: an empty keyword text or origin refuses, and a direct execution bypass refuses because every goal becomes a reviewed plan first. */
export function omniboxtaskgate(input: { text: string; origin: string; direct: boolean }): policyevaluation {
  if (input.direct)
    return {
      allowed: false,
      reason:
        "The omnibox keyword never executes a goal directly; every keyword goal routes through the same proposal and review flow as the api and becomes a reviewed plan first.",
    };
  if (input.text.trim() === "")
    return {
      allowed: false,
      reason:
        "The omnibox task needs its natural language goal after the keyword; an empty goal never reaches the proposal flow.",
    };
  if (input.origin.trim() === "")
    return {
      allowed: false,
      reason:
        "The omnibox task needs its active origin scope; a goal without an origin never reaches the proposal flow.",
    };
  return {
    allowed: true,
    reason: `The omnibox goal for ${input.origin} rides the same proposal flow as the api: the observation, the capabilities and the plan review all recheck it.`,
  };
}

/** Binds one shortcutkey to a commandpalette command with its gates intact: a shortcut may only trigger a command the palette catalog knows, and the palette action gate must allow it for the current capability set and session state. */
export function shortcutkeygate(input: {
  command: string;
  palettecommands: string[];
  granted: string[];
  sessionactive: boolean;
  action?: { permission?: string; session?: boolean };
}): policyevaluation {
  if (!input.palettecommands.includes(input.command))
    return {
      allowed: false,
      reason: `The ${input.command} shortcut binds no commandpalette command; a shortcut may only trigger a command the palette catalog knows.`,
    };
  if (input.action?.permission !== undefined && !input.granted.includes(input.action.permission))
    return {
      allowed: false,
      reason: `The ${input.command} shortcut needs the ${input.action.permission} capability granted before it dispatches; the shortcut never bypasses the palette action gate.`,
    };
  if (input.action?.session === true && !input.sessionactive)
    return {
      allowed: false,
      reason: `The ${input.command} shortcut needs an active browser session before it dispatches; the shortcut never bypasses the palette action gate.`,
    };
  return {
    allowed: true,
    reason: `The ${input.command} shortcut dispatches through the same palette action gate the commandpalette rides; its gates stay intact.`,
  };
}

/** Gates one notification body: a notification that carries page content shows only after the content consent while a content free body needs none. */
export function notificationcontentgate(input: { content: boolean; consent: boolean }): policyevaluation {
  if (!input.content)
    return {
      allowed: true,
      reason: "The notification body carries no page content, so no content consent is needed and it shows.",
    };
  if (!input.consent)
    return {
      allowed: false,
      reason:
        "The notification body carries page content and no content consent exists; a content bearing notification never shows without its consent.",
    };
  return {
    allowed: true,
    reason:
      "The notification body carries page content and its consent exists, so it shows with the content the user agreed to.",
  };
}

/** Gates one pickeroverlay read to the granted origin: a session may only list the element candidates of an origin the allowlist holds. */
export function pickeroverlaygate(input: { origin: string; granted: string[] }): policyevaluation {
  if (input.origin.trim() === "")
    return { allowed: false, reason: "The pickeroverlay session needs its origin; an originless read never starts." };
  if (!input.granted.includes(input.origin))
    return {
      allowed: false,
      reason: `The pickeroverlay reads no element candidate of ${input.origin} because the origin holds no allowlist entry; picker reads stay inside the granted origins.`,
    };
  return {
    allowed: true,
    reason: `The pickeroverlay lists the element candidates of the granted origin ${input.origin} with their stability scored selectors.`,
  };
}

/** Gates one shotpanel view to captures of granted origins: a capture of an ungranted origin never opens in the panel. */
export function shotpanelgate(input: { captureorigin: string; granted: string[] }): policyevaluation {
  if (input.captureorigin.trim() === "")
    return {
      allowed: false,
      reason: "The shotpanel view needs the origin of its capture; an originless capture never opens.",
    };
  if (!input.granted.includes(input.captureorigin))
    return {
      allowed: false,
      reason: `The shotpanel opens no capture of ${input.captureorigin} because the origin holds no allowlist entry; capture views stay inside the granted origins.`,
    };
  return {
    allowed: true,
    reason: `The shotpanel previews the capture of the granted origin ${input.captureorigin} with its redaction verdicts.`,
  };
}

/** Gates one siteprofile origin: the per site interface preferences extend the originprofiles family, so the origin holds an https shape before any profile stores. */
export function siteprofilegate(input: { origin: string }): policyevaluation {
  const origin = input.origin.trim();
  if (origin === "")
    return { allowed: false, reason: "The siteprofile needs its origin; an originless profile never stores." };
  if (!origin.startsWith("https://") || origin.length <= "https://".length)
    return {
      allowed: false,
      reason: `The siteprofile stores per site interface preferences of https origins only; ${origin} holds no https origin shape.`,
    };
  return {
    allowed: true,
    reason: `The siteprofile of ${origin} stores its theme, shortcutkeys and default view beside the originprofiles policy preferences; no profile ever adjusts a policy gate.`,
  };
}

/** Refuses secretvault values and unmasked logs in every importexport bundle under any flag: a bundle that carries a secret or an unmasked log refuses in full. */
export function importexportgate(input: { containssecrets: boolean; unmaskedlogs: boolean }): policyevaluation {
  if (input.containssecrets)
    return {
      allowed: false,
      reason:
        "The importexport bundle carries a secretvault value shape; secret values never leave the browser under any flag, so the bundle refuses in full.",
    };
  if (input.unmaskedlogs)
    return {
      allowed: false,
      reason:
        "The importexport bundle carries unmasked log entries; only masked summaries ever move between profiles, so the bundle refuses in full.",
    };
  return {
    allowed: true,
    reason:
      "The importexport bundle carries no secretvault value and no unmasked log; the originprofiles, the siteprofiles, the notes and the preferences move with their honest exclusion list.",
  };
}

/**
 * Ecosystem gates of the 1.1.66 family.
 * Every ecosystem operation lives behind the same review posture: the flowlibrary validates each manifest under schemastrict, keeps its kinds inside the installed capability set, surfaces its required grants as a diff before any import completes, quarantines unverified publishers and verifies present publisher signatures; the syncbridge hooks stay behind their explicit opt in with no default on and move manifests only; the runreplay walks sealed runs with verified chains only; the outputcompare joins runs that share a task input signature and never executes a step; and the background run queue runs reviewed workflows with the keepalive signal held.
 * Nothing is hardcoded: every registry endpoint stays the user's configured value, and no ecosystem operation ever bypasses the human review.
 */

/** Validates one imported flowlibrary manifest under schemastrict: the shape errors name their path and expected shape, and a manifest with any error refuses before anything else. */
export function librarymanifestgate(input: { errors: schemaerror[] }): policyevaluation {
  if (input.errors.length > 0)
    return {
      allowed: false,
      reason: `The flowlibrary manifest fails schemastrict with ${input.errors.length} error${input.errors.length === 1 ? "" : "s"}: ${input.errors
        .slice(0, 3)
        .map((error) => `${error.path} expected ${error.expected}`)
        .join("; ")}; the import refuses before anything else.`,
    };
  return {
    allowed: true,
    reason:
      "The flowlibrary manifest passes schemastrict with no shape error; the validation names every field it checked.",
  };
}

/** Refuses library entries whose kinds exceed the installed capability set: a manifest may only use action kinds the current capability report lists. */
export function librarycapabilitygate(input: { kinds: string[]; capabilities: string[] }): policyevaluation {
  const missing = [...new Set(input.kinds)].filter((kind) => !input.capabilities.includes(kind));
  if (missing.length > 0)
    return {
      allowed: false,
      reason: `The flowlibrary manifest uses the kind${missing.length === 1 ? "" : "s"} ${missing.join(", ")} the installed capability set lacks; the import refuses in full.`,
    };
  return {
    allowed: true,
    reason: `Every kind of the flowlibrary manifest sits inside the installed capability set of ${input.capabilities.length} kind${input.capabilities.length === 1 ? "" : "s"}.`,
  };
}

/** Refuses library entries that require grants the profile does not hold: the grant diff shows the added grants before any import completes. */
export function librarygrantgate(input: { requiredgrants: string[]; heldgrants: string[] }): policyevaluation {
  const missing = [...new Set(input.requiredgrants)].filter((origin) => !input.heldgrants.includes(origin));
  if (missing.length > 0)
    return {
      allowed: false,
      reason: `The flowlibrary manifest requires the grant${missing.length === 1 ? "" : "s"} ${missing.join(", ")} the profile does not hold; the grant diff shows them and the user grants them before the import completes.`,
    };
  return {
    allowed: true,
    reason: `The profile holds every grant the flowlibrary manifest requires${input.requiredgrants.length === 0 ? " and the manifest requires none" : ""}.`,
  };
}

/** Requires a fresh consent prompt for library entries marked sensitive: a sensitive manifest installs only after its fresh consent while a plain manifest needs none. */
export function librarysensitivegate(input: { sensitive: boolean; freshconsent: boolean }): policyevaluation {
  if (!input.sensitive)
    return {
      allowed: true,
      reason:
        "The flowlibrary manifest carries no sensitive mark, so no fresh consent prompt stands before its import.",
    };
  if (!input.freshconsent)
    return {
      allowed: false,
      reason:
        "The flowlibrary manifest is marked sensitive; its import needs a fresh consent prompt the user answers before anything lands.",
    };
  return {
    allowed: true,
    reason:
      "The user answered the fresh consent prompt of the sensitive flowlibrary manifest; the import proceeds behind the same review.",
  };
}

/** Quarantines library entries from unverified publishers: an unsigned entry quarantines until the user verifies its publisher while a present signature must verify against the manifest digest. */
export function libraryquarantinegate(input: {
  verified: boolean;
  signaturepresent: boolean;
  signaturevalid: boolean;
}): policyevaluation {
  if (!input.signaturepresent && !input.verified)
    return {
      allowed: false,
      reason:
        "The flowlibrary entry carries no publisher signature; the entry quarantines until the user verifies its publisher, and a quarantined entry never installs on its own.",
    };
  if (input.signaturepresent && !input.signaturevalid)
    return {
      allowed: false,
      reason:
        "The publisher signature of the flowlibrary entry failed its verification; the entry quarantines and never installs under any flag.",
    };
  return {
    allowed: true,
    reason:
      "The publisher signature of the flowlibrary entry verified over its manifest digest; the entry stays available for the grant diff and the import.",
  };
}

/** Keeps every library import a proposal that still passes the plan review: no library entry ever executes directly and a direct execution path refuses in full. */
export function libraryimportgate(input: { proposal: boolean; planreviewed: boolean }): policyevaluation {
  if (!input.proposal)
    return {
      allowed: false,
      reason:
        "A library import lands as a proposal only; no template ever executes directly and the plan review gates every step as always.",
    };
  if (!input.planreviewed)
    return {
      allowed: false,
      reason:
        "The library import proposal has no plan review yet; the plancards render and the user approves one step at a time before any execution.",
    };
  return {
    allowed: true,
    reason:
      "The library import landed as a proposal and its plan passed the same review as every native task; the consent gates never moved.",
  };
}

/** Gates syncbridge hooks behind an explicit opt in with no default on: a hook without its opt in never moves a manifest. */
export function syncbridgeoptingate(input: { optin: boolean }): policyevaluation {
  if (!input.optin)
    return {
      allowed: false,
      reason:
        "The syncbridge hook stays off because no explicit opt in exists; no hook ever defaults on and no manifest moves without the user turning the hook on.",
    };
  return {
    allowed: true,
    reason:
      "The user explicitly opted the syncbridge hook in; the hook moves manifests only and never secrets or logs.",
  };
}

/** Keeps the syncbridge on manifests only: a payload that carries a secretvault value or a log entry refuses in full under any flag. */
export function syncbridgescopegate(input: { carriessecrets: boolean; carrieslogs: boolean }): policyevaluation {
  if (input.carriessecrets)
    return {
      allowed: false,
      reason:
        "The syncbridge payload carries a secretvault value shape; the bridge moves manifests only, so the payload refuses in full.",
    };
  if (input.carrieslogs)
    return {
      allowed: false,
      reason:
        "The syncbridge payload carries log entries; the bridge moves manifests only, so the payload refuses in full.",
    };
  return {
    allowed: true,
    reason: "The syncbridge payload carries manifests only; secrets and logs never ride the bridge under any flag.",
  };
}

/** Gates runreplay to sealed runs with verified chains: an unsealed run or a broken chain never opens in the replay. */
export function runreplaygate(input: { sealed: boolean; chainvalid: boolean }): policyevaluation {
  if (!input.sealed)
    return {
      allowed: false,
      reason:
        "The runreplay walks sealed runs only; an open run keeps moving and its replay would show a chain that still grows.",
    };
  if (!input.chainvalid)
    return {
      allowed: false,
      reason:
        "The sealed chain of the run failed its verification; the replay refuses the walk because only a verified chain stands as audit evidence.",
    };
  return {
    allowed: true,
    reason:
      "The run sealed and its chain verified from the genesis hash to the seal; the replay walks it read only, restoring the observation and capture of each step.",
  };
}

/** Gates outputcompare to runs that share a task input signature: two runs that started from different inputs compare nothing. */
export function outputcomparegate(input: { signaturea: string; signatureb: string }): policyevaluation {
  if (input.signaturea.trim() === "" || input.signatureb.trim() === "")
    return {
      allowed: false,
      reason: "The outputcompare needs the task input signature of both runs; a signatureless run never compares.",
    };
  if (input.signaturea !== input.signatureb)
    return {
      allowed: false,
      reason:
        "The two runs carry different task input signatures; only runs that started from the same input compare their outcomes.",
    };
  return {
    allowed: true,
    reason:
      "The two runs share their task input signature, so their step outcomes compare under the recorded metric set.",
  };
}

/** Keeps outputcompare read only: the comparison joins stored outcomes only and a path that would execute a step refuses in full. */
export function outputcomparereadonlygate(input: { executessteps: boolean }): policyevaluation {
  if (input.executessteps)
    return {
      allowed: false,
      reason:
        "The outputcompare never executes a step; it reads the stored outcomes of both runs only, so any executing path refuses in full.",
    };
  return {
    allowed: true,
    reason:
      "The outputcompare joins the stored outcomes of both runs without touching the page; no step executes inside a comparison.",
  };
}

/** Gates the background run queue: a queued workflow needs its approved review and the running entry holds the keepalive signal for its whole duration. */
export function backgroundrungate(input: { reviewed: boolean; keepaliveheld: boolean }): policyevaluation {
  if (!input.reviewed)
    return {
      allowed: false,
      reason:
        "The background run queue executes reviewed workflows only; an unreviewed workflow never starts, with or without an open surface.",
    };
  if (!input.keepaliveheld)
    return {
      allowed: false,
      reason:
        "A background run holds the keepalive signal for its whole duration; a run that releases the signal early stops being a background run.",
    };
  return {
    allowed: true,
    reason:
      "The reviewed workflow runs in the background with the keepalive signal held and every checkpoint restoring it on each worker wake.",
  };
}

/**
 * Ecosystem part two gates of the 1.1.67 family.
 * The ecosystem leaves the browser without leaving the review: the portable rule set compiles the policy families the cli and the extension share, planlint capability checking refuses a step whose kind exceeds what the target runtime can execute, a flowrun never starts without an origin grant file or an interactive prompt, exports verify the chain and refuse unmasked values, headless sessions keep every consent gate with denydefault refusing when no provider resolves them, telemetry stays off unless the host opts in, the platform matrix declares every runtime exactly once and the adapter mappings match their platform, and a missing capability downgrades its feature instead of failing the runtime.
 */

/** The policy families the portable rule set carries: the families a plan file lints against with no live browser attached. */
export const portablerulefamilies: readonly string[] = [
  "origin",
  "consent",
  "capability",
  "schema",
  "gate",
  "selector",
  "control",
];

/** Compiles the portable rule set the extension and the cli share: one entry per lint rule with the family it belongs to and what it validates, versioned with the package so a cached set never drifts across releases. */
export function portablerulesetof(now: number): portableruleset {
  return {
    version: packageversion,
    compiledat: now,
    rules: [
      {
        id: "originprofilegrade",
        family: "origin",
        validates:
          "Every step grades against the originprofile of the plan origin exactly the way the extension grades it.",
      },
      {
        id: "classconsent",
        family: "consent",
        validates:
          "Every sensitive class of a step needs a fresh consent that covers the origin, the way the extension demands it.",
      },
      {
        id: "portablecapability",
        family: "capability",
        validates: "Every step kind stays inside the capability set the target runtime can execute.",
      },
      {
        id: "schemastrict",
        family: "schema",
        validates: "Every step carries known fields only under schemastrict; unknown fields refuse in full.",
      },
      {
        id: "gatedeclaration",
        family: "gate",
        validates: "Every sensitive step declares its gate explicitly so nothing sensitive runs ungated.",
      },
      {
        id: "staticselector",
        family: "selector",
        validates:
          "Selectors that cannot resolve without a live page flag so the plan author knows what stays dynamic.",
      },
      {
        id: "loopbound",
        family: "control",
        validates: "Every loop step carries its user configured bound; an unbounded loop refuses.",
      },
      {
        id: "retrybound",
        family: "control",
        validates: "Every retrying step carries its user configured attempts; missing retry bounds flag.",
      },
    ],
  };
}

/** Gates the compiled portable rule set: the version matches the package, the rule ids stay unique and non-empty and every portable family carries its rule, so a cached set never drifts. */
export function portablerulesetgate(ruleset: portableruleset): policyevaluation {
  if (ruleset.rules.length === 0)
    return {
      allowed: false,
      reason:
        "The portable rule set carries no rule; the cli and the extension share one compiled set and an empty set lints nothing.",
    };
  if (ruleset.version !== packageversion)
    return {
      allowed: false,
      reason: `The portable rule set version ${ruleset.version} does not match the package version ${packageversion}; a cached set from another release refuses in full.`,
    };
  const ids = ruleset.rules.map((rule) => rule.id);
  if (ids.some((id) => id.trim() === ""))
    return {
      allowed: false,
      reason: "Every portable rule needs its id so a diagnostic names the rule that raised it.",
    };
  if (new Set(ids).size !== ids.length)
    return {
      allowed: false,
      reason: "The portable rule ids must stay unique; a duplicated id makes the cached set ambiguous.",
    };
  const families = new Set(ruleset.rules.map((rule) => rule.family));
  for (const family of portablerulefamilies)
    if (!families.has(family))
      return {
        allowed: false,
        reason: `The portable rule set lacks its ${family} family rule; the set covers every family or refuses in full.`,
      };
  return {
    allowed: true,
    reason: `The portable rule set compiles ${ruleset.rules.length} rules across ${families.size} families at the package version ${ruleset.version}.`,
  };
}

/** Gates one plan step against the portable capability set: a kind the target runtime cannot execute refuses before any run starts. */
export function portablecapabilitygate(input: { kind: string; capabilities: string[] }): policyevaluation {
  if (input.kind.trim() === "")
    return { allowed: false, reason: "The plan step carries no kind; a kindless step maps onto no capability." };
  if (!input.capabilities.includes(input.kind))
    return {
      allowed: false,
      reason: `The step kind ${input.kind} exceeds the portable capability set; the target runtime executes the kinds ${input.capabilities.join(", ")} only.`,
    };
  return {
    allowed: true,
    reason: `The step kind ${input.kind} stays inside the portable capability set of the target runtime.`,
  };
}

/** Gates a flowrun start: the run needs an origin grant file or an interactive grant prompt, and a run without either never starts. */
export function flowrungrantgate(input: { origin: string; grantsource: "file" | "prompt" | "none" }): policyevaluation {
  if (input.origin.trim() === "")
    return {
      allowed: false,
      reason: "The flowrun needs the origin its plan addresses; an originless run matches no grant.",
    };
  if (input.grantsource === "none")
    return {
      allowed: false,
      reason:
        "The flowrun needs an origin grant file or an interactive grant prompt; a run without a granted origin never starts, in a terminal or anywhere else.",
    };
  return {
    allowed: true,
    reason: `The flowrun reads its origin grant from the ${input.grantsource === "file" ? "grant file" : "interactive prompt"} and holds it for the whole run.`,
  };
}

/** Gates every exporttools run on the chain: an export writes only a verified chain, so a broken chain refuses before any byte leaves the store. */
export function exportchaingate(input: { chainvalid: boolean; reason?: string }): policyevaluation {
  if (!input.chainvalid)
    return {
      allowed: false,
      reason: input.reason ?? "The log chain failed its verification; an export of an unverified chain writes nothing.",
    };
  return {
    allowed: true,
    reason: "The log chain verified from the genesis hash to the seal; the export writes the verified entries only.",
  };
}

/** Gates every exporttools payload on masking: an unmasked log value refuses the export in full under any format. */
export function exportmaskgate(input: { unmasked: string[] }): policyevaluation {
  if (input.unmasked.length > 0)
    return {
      allowed: false,
      reason: `The export refuses ${input.unmasked.length} unmasked value${input.unmasked.length === 1 ? "" : "s"} (${input.unmasked.join(", ")}); every format honors the mask verdicts or writes nothing.`,
    };
  return {
    allowed: true,
    reason: "Every exported value carries its mask verdict; the export writes masked values only.",
  };
}

/** Gates the headless consent path: a consent gate without a provider resolution refuses under denydefault, and a provider refusal refuses the step, so headless sessions keep every gate the extension keeps. */
export function headlessconsentgate(input: {
  providerpresent: boolean;
  resolution?: "approve" | "refuse";
}): policyevaluation {
  if (!input.providerpresent)
    return {
      allowed: false,
      reason:
        "The headless session waits at its consent gate with no provider attached; denydefault refuses the step because no consent gate ever resolves itself.",
    };
  if (input.resolution === "refuse")
    return {
      allowed: false,
      reason: "The consent provider refused the gate; the headless run stops exactly where the extension would stop.",
    };
  return {
    allowed: true,
    reason:
      "The consent provider approved the gate through the host callback; the headless run proceeds with the resolution recorded.",
  };
}

/** Gates the telemetry marker of every library bundle: telemetry stays off unless the host opts in, so a bundle that reports by default refuses. */
export function headlesstelemetrygate(input: { telemetry: boolean; hostoptin: boolean }): policyevaluation {
  if (input.telemetry && !input.hostoptin)
    return {
      allowed: false,
      reason: "The library bundle carries no telemetry by default; a reporting bundle needs the host opt in first.",
    };
  return {
    allowed: true,
    reason: input.telemetry
      ? "Telemetry runs under the host opt in."
      : "Telemetry stays off; the library bundle reports nothing by default.",
  };
}

/** Gates the platform matrix: every runtime of the browser, node, bun and deno declares exactly one target with its entry, format and platform, so one matrix run verifies them all. */
export function platformmatrixgate(targets: platformtarget[]): policyevaluation {
  const runtimes = targets.map((target) => target.runtime);
  for (const runtime of ["browser", "node", "bun", "deno"] as const) {
    const declared = runtimes.filter((value) => value === runtime).length;
    if (declared === 0)
      return {
        allowed: false,
        reason: `The platform matrix lacks its ${runtime} target; the matrix declares every runtime or refuses in full.`,
      };
    if (declared > 1)
      return {
        allowed: false,
        reason: `The platform matrix declares the ${runtime} target ${declared} times; every runtime declares exactly one target.`,
      };
  }
  for (const target of targets) {
    if (target.entry.trim() === "")
      return { allowed: false, reason: `The ${target.runtime} platform target needs its entry file.` };
    if (target.format === "umd" && target.runtime !== "browser")
      return { allowed: false, reason: "The umd format serves script tag consumers of the browser target only." };
    if (target.declarations !== true)
      return {
        allowed: false,
        reason: `The ${target.runtime} platform target must emit its declaration files; typedefs cover every entry point.`,
      };
  }
  return {
    allowed: true,
    reason: `The platform matrix declares one target per runtime of browser, node, bun and deno with every entry, format and declaration set in place.`,
  };
}

/** Gates the adapter mapping of one runtime: the storage, worker and dom mappings must match their platform target, so a node shell never claims chrome storage and a deno shell never claims the filesystem. */
export function adaptermappinggate(input: {
  adapter: runtimeadapterdeclaration;
  headless?: boolean;
}): policyevaluation {
  const expected: Record<
    runtimeadapterdeclaration["runtime"],
    {
      storage: runtimeadapterdeclaration["storage"];
      worker: runtimeadapterdeclaration["worker"];
      dom: runtimeadapterdeclaration["dom"];
    }
  > = {
    browser: { storage: "chrome", worker: "webworker", dom: input.headless === true ? "remote" : "livepage" },
    node: { storage: "filesystem", worker: "workerthreads", dom: "remote" },
    bun: { storage: "filesystem", worker: "workerthreads", dom: "remote" },
    deno: { storage: "denokv", worker: "webworker", dom: "remote" },
  };
  const wanted = expected[input.adapter.runtime];
  if (input.adapter.storage !== wanted.storage)
    return {
      allowed: false,
      reason: `The ${input.adapter.runtime} adapter maps its storage to ${input.adapter.storage}; the platform provides ${wanted.storage}.`,
    };
  if (input.adapter.worker !== wanted.worker)
    return {
      allowed: false,
      reason: `The ${input.adapter.runtime} adapter maps its workers to ${input.adapter.worker}; the platform provides ${wanted.worker}.`,
    };
  if (input.adapter.dom !== wanted.dom)
    return {
      allowed: false,
      reason: `The ${input.adapter.runtime} adapter maps its dom to ${input.adapter.dom}; the ${input.headless === true ? "headless session drives a remote browser" : "platform provides a " + wanted.dom}.`,
    };
  if (input.adapter.fetch !== "platform" || input.adapter.timer !== "platform")
    return {
      allowed: false,
      reason: "Every adapter maps its fetch and timer to the platform primitive; no shim wraps them.",
    };
  return {
    allowed: true,
    reason: `The ${input.adapter.runtime} adapter maps storage to ${wanted.storage}, workers to ${wanted.worker} and the dom to ${wanted.dom} exactly as its platform provides them.`,
  };
}

/** Gates the capability downgrade path: a missing capability downgrades its feature and never fails the runtime, so a downgrade list with a failing feature refuses. */
export function capabilitydowngradegate(input: { downgraded: featuredowngrade[]; failed: string[] }): policyevaluation {
  if (input.failed.length > 0)
    return {
      allowed: false,
      reason: `The capabilities ${input.failed.join(", ")} failed instead of downgrading; a missing capability downgrades its feature and the runtime keeps running.`,
    };
  return {
    allowed: true,
    reason:
      input.downgraded.length === 0
        ? "Every capability is present; no feature downgrades."
        : `The capabilities downgraded ${input.downgraded.length} feature${input.downgraded.length === 1 ? "" : "s"} without failing the runtime.`,
  };
}

/** Reads the reviewed action vocabulary as one sorted list: the portable capability set of every runtime derives from this one contract, so the cli and the extension share the same capability list with no drift. */
export function actionkindcatalog(): string[] {
  return [...allowedactions].sort();
}

/** Gates one lazy module load on its declared capabilities: lazy loading stays transparent to capability checks because the lazy path runs exactly the capability check the eager path runs, so a module whose declared capability stays ungranted never loads. */
export function lazyloadgate(input: { module: lazymoddescriptor; granted: string[] }): policyevaluation {
  if (input.module.id.trim() === "")
    return { allowed: false, reason: "The lazy module needs its id; an idless module maps onto no command." };
  const missing = input.module.capabilities.filter((capability) => !input.granted.includes(capability));
  if (missing.length > 0)
    return {
      allowed: false,
      reason: `The lazy module ${input.module.id} declares the capabilit${missing.length === 1 ? "y" : "ies"} ${missing.join(", ")} the user never granted; lazy loading never hides a capability from the check.`,
    };
  return {
    allowed: true,
    reason: `The lazy module ${input.module.id} resolves under the same capability check the eager path runs; the load stays transparent to the review.`,
  };
}

/** Validates one debouncedom window as a user choice only: a present window must stay a positive number of milliseconds while an absent window passes every event through, and no engine default ever caps a storm. */
export function debouncewindowvalid(input: { kind: string; window?: number }): policyevaluation {
  if (input.window === undefined)
    return {
      allowed: true,
      reason: `The ${input.kind} events pass through uncoalesced; the user set no debouncedom window and the engine sets none.`,
    };
  if (!Number.isFinite(input.window) || input.window <= 0)
    return {
      allowed: false,
      reason: `The ${input.kind} debouncedom window must stay a positive number of milliseconds; the window stays the user's choice.`,
    };
  return {
    allowed: true,
    reason: `The ${input.kind} debouncedom window of ${input.window} milliseconds stays the user's choice with no engine cap.`,
  };
}

/** Validates one batchquery plan: the plan folds repeated selectors into one pass, so a plan that carries a duplicate selector or claims no single pass refuses. */
export function batchqueryplangate(plan: { selectors: string[]; folded: number; onepass: boolean }): policyevaluation {
  if (plan.selectors.length === 0)
    return { allowed: false, reason: "The batchquery plan carries no selector; a selectorless pass queries nothing." };
  const distinct = new Set(plan.selectors);
  if (distinct.size !== plan.selectors.length)
    return {
      allowed: false,
      reason:
        "The batchquery plan carries a repeated selector; the plan folds every duplicate into one distinct selector.",
    };
  if (!plan.onepass)
    return {
      allowed: false,
      reason:
        "The batchquery plan executes its grouped selectors in one pass; a multi pass plan recomputes what it could fold.",
    };
  return {
    allowed: true,
    reason: `The batchquery plan folds ${plan.folded} duplicate selector${plan.folded === 1 ? "" : "s"} into one pass of ${plan.selectors.length} distinct selector${plan.selectors.length === 1 ? "" : "s"}.`,
  };
}

/** Gates one incrsnapshot delta on its base: the base snapshot ref must come from the same run the delta serves, so a delta from another run or against no base at all refuses. */
export function incrsnapshotgate(input: {
  delta: incrsnapshotdelta;
  runid: string;
  baseexists: boolean;
}): policyevaluation {
  if (!input.baseexists)
    return {
      allowed: false,
      reason: `The incrsnapshot delta needs its base snapshot ref ${input.delta.baseref}; a baseless delta recomputes nothing.`,
    };
  if (input.delta.runid !== input.runid)
    return {
      allowed: false,
      reason: `The incrsnapshot delta belongs to the run ${input.delta.runid} while the run ${input.runid} asked for it; a delta never crosses runs.`,
    };
  return {
    allowed: true,
    reason: input.delta.full
      ? "The incrsnapshot cadence elapsed and the builder emits one full snapshot under the same run."
      : `The incrsnapshot delta carries ${input.delta.changes.length} changed region${input.delta.changes.length === 1 ? "" : "s"} against the base ${input.delta.baseref} of the same run.`,
  };
}

/** Gates one selcache hit on its generation: a hit from the current generation revalidates before the dispatch while a hit from a stale generation refuses so the resolver queries the selector fresh. */
export function selcachegate(entry: selcacheentry, generation: number): policyevaluation {
  if (entry.selector.trim() === "")
    return { allowed: false, reason: "The selcache entry needs its selector; a selectorless entry resolves nothing." };
  if (entry.generation !== generation)
    return {
      allowed: false,
      reason: `The selcache entry for ${entry.selector} resolves from generation ${entry.generation} while the run stands at generation ${generation}; revalidate the entry or query the selector fresh.`,
    };
  return {
    allowed: true,
    reason: `The selcache entry for ${entry.selector} resolves from the current generation ${generation}; the revalidation query confirms it before the dispatch.`,
  };
}

/** Gates one streamparse chunk through the same schemastrict validation the one pass parser runs: a chunk outside the accepted shape refuses the whole stream before any observation yields. */
export function streamparsegate(input: { chunk: streamparsechunk; expectedindex: number }): policyevaluation {
  if (input.chunk.index !== input.expectedindex)
    return {
      allowed: false,
      reason: `The streamparse chunk carries index ${input.chunk.index} while the stream expects ${input.expectedindex}; an out of order chunk never yields observations.`,
    };
  if (input.chunk.bytes <= 0)
    return {
      allowed: false,
      reason: `The streamparse chunk ${input.chunk.index} carries no bytes; an empty chunk never passes schemastrict.`,
    };
  return {
    allowed: true,
    reason: `The streamparse chunk ${input.chunk.index} passes the schemastrict shape with ${input.chunk.tokens.length} token${input.chunk.tokens.length === 1 ? "" : "s"} and yields its observations progressively.`,
  };
}

/** Gates one chunkextract resume on its table fingerprint: the cursor must carry the fingerprint of the table it resumes or the resume refuses so no window ever mixes two table states. */
export function chunkextractgate(input: {
  cursor: chunkextractcursor;
  tableid: string;
  fingerprint: string;
}): policyevaluation {
  if (input.cursor.tableid.trim() === "")
    return {
      allowed: false,
      reason: "The chunkextract cursor needs its table id; a cursorless window extracts nothing.",
    };
  if (input.cursor.fingerprint.trim() === "")
    return {
      allowed: false,
      reason: "The chunkextract cursor needs its table fingerprint; a fingerprintless resume never continues.",
    };
  if (input.cursor.tableid !== input.tableid)
    return {
      allowed: false,
      reason: `The chunkextract cursor belongs to the table ${input.cursor.tableid} while the resume addresses ${input.tableid}; open a fresh cursor.`,
    };
  if (input.cursor.fingerprint !== input.fingerprint)
    return {
      allowed: false,
      reason:
        "The table fingerprint changed since the cursor stopped; the resume refuses so no window mixes two table states.",
    };
  return {
    allowed: true,
    reason: `The chunkextract cursor resumes at row ${input.cursor.rowindex} of the unchanged table ${input.tableid} with its ${input.cursor.window} row window.`,
  };
}

/** Gates the worker queue backpressure on the user configured depth: parse tasks past the depth defer and never refuse, and an absent depth keeps the queue unbounded because the depth stays a user choice. */
export function workerbackpressuregate(input: { depth?: number; pending: number }): policyevaluation {
  if (input.depth === undefined)
    return {
      allowed: true,
      reason: `The worker queue runs unbounded at ${input.pending} pending parse task${input.pending === 1 ? "" : "s"}; the user set no depth and the engine sets none.`,
    };
  if (!Number.isFinite(input.depth) || input.depth <= 0)
    return {
      allowed: false,
      reason: "The worker queue depth must stay a positive task count; the depth stays the user's choice.",
    };
  return {
    allowed: true,
    reason: `The worker queue admits ${Math.min(input.pending, input.depth)} of ${input.pending} pending parse task${input.pending === 1 ? "" : "s"} under the user depth of ${input.depth}; the overflow defers and never refuses.`,
  };
}

/** Validates one virtlist row window as a user choice only: a present window stays a positive row count while an absent window renders every row, and no engine default ever caps a list. */
export function virtlistwindowvalid(input: { surface: string; rows?: number }): policyevaluation {
  if (input.rows === undefined)
    return {
      allowed: true,
      reason: `The ${input.surface} list renders every row; the user set no virtlist window and the engine sets none.`,
    };
  if (!Number.isFinite(input.rows) || input.rows <= 0)
    return {
      allowed: false,
      reason: `The ${input.surface} virtlist window must stay a positive row count; the window stays the user's choice.`,
    };
  return {
    allowed: true,
    reason: `The ${input.surface} virtlist window renders ${input.rows} row${input.rows === 1 ? "" : "s"} at a time while the full list stays in memory.`,
  };
}

/** Gates one perf record on its provenance: every perf record attaches its provenance of origin, environment and worker task, so a record without its run and step refs refuses. */
export function perfprovenancegate(record: perfrecord): policyevaluation {
  if (record.runid.trim() === "")
    return { allowed: false, reason: "The perf record needs its run id; a runless record measures nothing." };
  if (record.stepid.trim() === "")
    return { allowed: false, reason: "The perf record needs its step id; a stepless record attributes nothing." };
  if (record.provenance === undefined || Object.keys(record.provenance).length === 0)
    return {
      allowed: false,
      reason: "The perf record attaches its provenance; a record without provenance never enters the tuning view.",
    };
  return {
    allowed: true,
    reason: `The perf record of the step ${record.stepid} carries its duration, queries, cache hits and its ${Object.keys(record.provenance).length} provenance field${Object.keys(record.provenance).length === 1 ? "" : "s"}.`,
  };
}

/** Validates one startup module budget as a user choice only: a present budget stays a positive module count the startup view reports against, and the budget never refuses a load. */
export function lazybudgetvalid(input: { budget?: number; prewarmed: number }): policyevaluation {
  if (input.budget === undefined)
    return {
      allowed: true,
      reason: `The startup path carries ${input.prewarmed} prewarmed module${input.prewarmed === 1 ? "" : "s"}; the user set no budget and the engine sets none.`,
    };
  if (!Number.isFinite(input.budget) || input.budget <= 0)
    return {
      allowed: false,
      reason: "The startup module budget must stay a positive module count; the budget stays the user's choice.",
    };
  return {
    allowed: true,
    reason:
      input.prewarmed > input.budget
        ? `The prewarm set of ${input.prewarmed} modules exceeds the user startup budget of ${input.budget}; the view reports the overrun while every load stays allowed.`
        : `The prewarm set of ${input.prewarmed} modules stays inside the user startup budget of ${input.budget}.`,
  };
}

/** Validates one batch backpressure window as a user choice only: a present window stays a positive step count that pauses enqueueing while an absent window never pauses, and no engine default ever caps the queue. */
export function batchwindowvalid(input: { window?: number }): policyevaluation {
  if (input.window === undefined)
    return {
      allowed: true,
      reason: "The batch run queue never pauses; the user set no backpressure window and the engine sets none.",
    };
  if (!Number.isFinite(input.window) || input.window <= 0)
    return {
      allowed: false,
      reason: "The batch backpressure window must stay a positive step count; the window stays the user's choice.",
    };
  return {
    allowed: true,
    reason: `The batch run queue pauses its enqueueing when the completed outcomes fall more than ${input.window} step${input.window === 1 ? "" : "s"} behind; the pause never drops a queued step.`,
  };
}

/** Validates one per domain concurrency limit as a user choice only: a present slot count stays a positive number while an absent entry keeps the domain unbounded, and no engine default ever caps a domain. */
export function domainlimitsvalid(input: { domain: string; slots?: number }): policyevaluation {
  if (input.slots === undefined)
    return {
      allowed: true,
      reason: `The domain ${input.domain} runs unbounded; the user set no concurrency limit and the engine sets none.`,
    };
  if (!Number.isFinite(input.slots) || input.slots <= 0)
    return {
      allowed: false,
      reason: `The concurrency limit of the domain ${input.domain} must stay a positive slot count; the limit stays the user's choice.`,
    };
  return {
    allowed: true,
    reason: `The domain ${input.domain} runs at most ${input.slots} concurrent step${input.slots === 1 ? "" : "s"} while its overflow queues per lane; the queue never refuses a step.`,
  };
}

/** Validates one politedelay profile as a user choice only: the base delay and the jitter stay non negative while the floor never exceeds a base the user never set, and no engine default ever spaces a request. */
export function politedelayvalid(input: {
  domain: string;
  base?: number;
  floor?: number;
  jitter?: number;
}): policyevaluation {
  if (input.base === undefined && input.floor === undefined && input.jitter === undefined)
    return {
      allowed: true,
      reason: `The requests of the domain ${input.domain} run unspaced; the user set no politedelay and the engine sets none.`,
    };
  if (input.base !== undefined && (!Number.isFinite(input.base) || input.base < 0))
    return {
      allowed: false,
      reason: `The politedelay base of the domain ${input.domain} must stay a non negative millisecond count; the delay stays the user's choice.`,
    };
  if (input.jitter !== undefined && (!Number.isFinite(input.jitter) || input.jitter < 0))
    return {
      allowed: false,
      reason: `The politedelay jitter of the domain ${input.domain} must stay a non negative millisecond window; the jitter stays the user's choice.`,
    };
  return {
    allowed: true,
    reason: `The requests of the domain ${input.domain} space themselves through the user politedelay${input.base !== undefined ? ` of ${input.base} milliseconds` : ""}${input.jitter !== undefined ? ` with a jitter window of ${input.jitter} milliseconds` : ""}${input.floor !== undefined ? ` above the per domain floor of ${input.floor} milliseconds` : ""}.`,
  };
}

/** Validates one adaptivepoll window as a user choice only: the floor stays under the ceiling while the growth factor stays above one, and an absent window keeps the interval fixed. */
export function adaptivepollvalid(input: {
  window?: { floor: number; ceiling: number; growth: number };
}): policyevaluation {
  if (input.window === undefined)
    return {
      allowed: true,
      reason: "The poll interval stays fixed; the user set no adaptivepoll window and the engine sets none.",
    };
  const { floor, ceiling, growth } = input.window;
  if (!Number.isFinite(floor) || floor <= 0 || !Number.isFinite(ceiling) || ceiling <= 0)
    return {
      allowed: false,
      reason:
        "The adaptivepoll floor and ceiling must stay positive millisecond counts; the window stays the user's choice.",
    };
  if (floor > ceiling)
    return {
      allowed: false,
      reason: "The adaptivepoll floor must stay at or under its ceiling; the window stays the user's choice.",
    };
  if (growth <= 1)
    return {
      allowed: false,
      reason:
        "The adaptivepoll growth factor must stay above one so the interval widens and narrows; the factor stays the user's choice.",
    };
  return {
    allowed: true,
    reason: `The adaptivepoll window widens to ${ceiling} milliseconds and narrows to ${floor} milliseconds through the user growth factor of ${growth}.`,
  };
}

/** Validates one runbudget as a user choice only: a present step budget or memory ratio stays positive while an absent budget keeps the tracker informational, and no budget ever refuses a step. */
export function runbudgetvalid(input: { stepbudget?: number; memorybudget?: number }): policyevaluation {
  if (input.stepbudget === undefined && input.memorybudget === undefined)
    return {
      allowed: true,
      reason: "The runbudget tracker stays informational; the user set no budget and the engine sets none.",
    };
  if (input.stepbudget !== undefined && (!Number.isFinite(input.stepbudget) || input.stepbudget <= 0))
    return {
      allowed: false,
      reason: "The step budget must stay a positive step count; the budget stays the user's choice.",
    };
  if (
    input.memorybudget !== undefined &&
    (!Number.isFinite(input.memorybudget) || input.memorybudget <= 0 || input.memorybudget > 1)
  )
    return {
      allowed: false,
      reason: "The memory budget must stay a ratio between zero and one; the budget stays the user's choice.",
    };
  return {
    allowed: true,
    reason: `The runbudget tracker reports against the user budget${input.stepbudget !== undefined ? ` of ${input.stepbudget} step${input.stepbudget === 1 ? "" : "s"}` : ""}${input.memorybudget !== undefined ? ` and the memory ratio of ${input.memorybudget}` : ""}; the alerts report and the critical threshold pauses pending a user choice.`,
  };
}

/** Validates one budgetalert threshold pair as a user choice only: both ratios stay between zero and one with the warning at or under the critical level. */
export function budgetthresholdsvalid(input: {
  thresholds?: { warning?: number; critical?: number };
}): policyevaluation {
  if (input.thresholds === undefined)
    return {
      allowed: true,
      reason: "The budgetalerts stay informational; the user set no thresholds and the engine sets none.",
    };
  const { warning, critical } = input.thresholds;
  if (warning !== undefined && (!Number.isFinite(warning) || warning <= 0 || warning > 1))
    return {
      allowed: false,
      reason: "The warning threshold must stay a ratio between zero and one; the threshold stays the user's choice.",
    };
  if (critical !== undefined && (!Number.isFinite(critical) || critical <= 0 || critical > 1))
    return {
      allowed: false,
      reason: "The critical threshold must stay a ratio between zero and one; the threshold stays the user's choice.",
    };
  if (warning !== undefined && critical !== undefined && warning > critical)
    return {
      allowed: false,
      reason:
        "The warning threshold must stay at or under the critical threshold so the severity levels keep their order.",
    };
  return {
    allowed: true,
    reason: `The budgetalerts fire at the user thresholds${warning !== undefined ? ` with the warning at ${warning}` : ""}${critical !== undefined ? ` and the critical pause at ${critical}` : ""}.`,
  };
}

/** Validates one timeout bound as a user choice only: a present bound stays a positive millisecond count while an absent bound never aborts a step, and the abort always records its cancel event in the immutable log. */
export function timeoutboundvalid(input: { bound?: number }): policyevaluation {
  if (input.bound === undefined)
    return {
      allowed: true,
      reason: "The steps never abort on time; the user set no timeout bound and the engine sets none.",
    };
  if (!Number.isFinite(input.bound) || input.bound <= 0)
    return {
      allowed: false,
      reason: "The timeout bound must stay a positive millisecond count; the bound stays the user's choice.",
    };
  return {
    allowed: true,
    reason: `A step that runs past the user timeout bound of ${input.bound} milliseconds aborts with its cancel event recorded in the immutable log beside its outcome.`,
  };
}

/** Gates one timeoutcancel on its immutable log entry: the abort of a step must record its cancel event beside the step outcome, so an abort without its logged event refuses. */
export function timeoutrecordeventgate(input: { event: { logged: boolean; stepid: string } }): policyevaluation {
  if (input.event.stepid.trim() === "")
    return {
      allowed: false,
      reason: "The timeoutcancel event needs its step id; a stepless abort attributes nothing.",
    };
  if (!input.event.logged)
    return {
      allowed: false,
      reason: `The timeoutcancel of the step ${input.event.stepid} carries no immutable log entry; the abort must record its cancel event beside the step outcome.`,
    };
  return {
    allowed: true,
    reason: `The timeoutcancel of the step ${input.event.stepid} recorded its cancel event in the immutable log beside the step outcome.`,
  };
}

/** Validates one tab suspend window as a user choice only: a present window stays a positive millisecond count that suspends idle tabs during longer waits while an absent window never suspends a tab. */
export function suspendwindowvalid(input: { window?: number }): policyevaluation {
  if (input.window === undefined)
    return {
      allowed: true,
      reason: "The tabs never suspend during a wait; the user set no suspend window and the engine sets none.",
    };
  if (!Number.isFinite(input.window) || input.window <= 0)
    return {
      allowed: false,
      reason: "The tab suspend window must stay a positive millisecond count; the window stays the user's choice.",
    };
  return {
    allowed: true,
    reason: `An idle tab suspends only during a wait longer than the user window of ${input.window} milliseconds; the run state stays preserved across the suspend and restore.`,
  };
}

/** Gates one sessionreuse grant behind its explicit per profile consent prompt: a grant without a consent prompt or a prompt that never consented refuses, so no authenticated profile ever attaches silently. */
export function sessionreusegate(input: {
  grant: { profile: string; promptid: string; consentedat: number; runid?: string };
}): policyevaluation {
  if (input.grant.profile.trim() === "")
    return {
      allowed: false,
      reason: "The sessionreuse grant needs its profile; a profileless grant attaches nothing.",
    };
  if (input.grant.promptid.trim() === "")
    return {
      allowed: false,
      reason: `The sessionreuse of the profile ${input.grant.profile} carries no consent prompt; an authenticated profile attaches only through its explicit per profile prompt.`,
    };
  if (!Number.isFinite(input.grant.consentedat) || input.grant.consentedat <= 0)
    return {
      allowed: false,
      reason: `The consent prompt of the profile ${input.grant.profile} never resolved; the sessionreuse waits for the explicit user answer.`,
    };
  return {
    allowed: true,
    reason: `The profile ${input.grant.profile} attaches to the run${input.grant.runid !== undefined ? ` ${input.grant.runid}` : ""} through its consented prompt ${input.grant.promptid} with its cookies isolated in its own container.`,
  };
}

/** Gates one efficientresume on its page fingerprint: the resume revalidates the fingerprint before it continues, so a digest mismatch refuses and the run never continues against a different page. */
export function resumefingerprintgate(input: {
  checkpoint: { stepid: string; digest: string };
  fingerprint: string;
}): policyevaluation {
  if (input.checkpoint.digest.trim() === "")
    return {
      allowed: false,
      reason: `The resume checkpoint of the step ${input.checkpoint.stepid} carries no page digest; a digestless resume never revalidates.`,
    };
  if (input.checkpoint.digest !== input.fingerprint)
    return {
      allowed: false,
      reason: `The page fingerprint changed since the checkpoint of the step ${input.checkpoint.stepid}; the resume refuses so the run never continues against a different page.`,
    };
  return {
    allowed: true,
    reason: `The page fingerprint matches the checkpoint digest of the step ${input.checkpoint.stepid}; the resume skips the completed steps and continues.`,
  };
}

/** Gates one logprune plan on the chain verifiability: the prune removes whole sealed runs only, so a plan that prunes an unsealed run refuses while the chain verification summaries always survive. */
export function logprunegate(input: {
  plan: { prune: string[]; refused: string[] };
  sealed: Array<{ runid: string; sealed: boolean }>;
}): policyevaluation {
  const prunedunsealed = input.sealed.filter((run) => input.plan.prune.includes(run.runid) && !run.sealed);
  if (prunedunsealed.length > 0)
    return {
      allowed: false,
      reason: `The logprune plan prunes the unsealed run${prunedunsealed.length === 1 ? "" : "s"} ${prunedunsealed.map((run) => run.runid).join(", ")}; the prune removes whole sealed runs only so the chain stays verifiable.`,
    };
  return {
    allowed: true,
    reason: `The logprune plan removes ${input.plan.prune.length} whole sealed run${input.plan.prune.length === 1 ? "" : "s"} past the user window${input.plan.refused.length > 0 ? ` while ${input.plan.refused.length} unsealed run${input.plan.refused.length === 1 ? " stays" : "s stay"}` : ""}; the chain verification summaries always survive.`,
  };
}

/** Gates one stepprefetch hint on the reviewed plan structure: the warming warms only the pages and selectors the reviewed plan names, so a hint outside the plan refuses and the prefetch never reaches an unreviewed page. */
export function stepprefetchgate(input: {
  hint: { page?: string; selectors: string[] };
  plannedpages: string[];
  plannedselectors: string[];
}): policyevaluation {
  if (input.hint.page !== undefined && !input.plannedpages.includes(input.hint.page))
    return {
      allowed: false,
      reason: `The stepprefetch hint warms ${input.hint.page} which the reviewed plan never names; the prefetch never reaches an unreviewed page.`,
    };
  const outside = input.hint.selectors.filter((selector) => !input.plannedselectors.includes(selector));
  if (outside.length > 0)
    return {
      allowed: false,
      reason: `The stepprefetch hint precomputes the selector${outside.length === 1 ? "" : "s"} ${outside.join(", ")} which the reviewed plan never names; the prefetch never precomputes an unreviewed selector.`,
    };
  return {
    allowed: true,
    reason: `The stepprefetch hint warms its likely next page and its likely next selectors from the plan structure alone; every warming stays inside the reviewed plan.`,
  };
}

/** Validates one slowmo factor as a user choice only: the factor stays positive so the replay slows or speeds through it while an absent factor keeps the recorded speed. */
export function slowmofactorvalid(input: { factor?: number }): policyevaluation {
  if (input.factor === undefined)
    return {
      allowed: true,
      reason: "The replay keeps its recorded speed; the user set no slowmo factor and the engine sets none.",
    };
  if (!Number.isFinite(input.factor) || input.factor <= 0)
    return {
      allowed: false,
      reason: "The slowmo factor must stay a positive speed multiplier; the factor stays the user's choice.",
    };
  return {
    allowed: true,
    reason: `The replay runs at the user slowmo factor of ${input.factor} with its pauses linked to their steptrace spans.`,
  };
}

/** Allows a replayed step only when its idempotencykey is unknown: a step the run already executed under the same key never replays twice. */
export function replaycheck(input: { key: string; executedkeys: string[] }): policyevaluation {
  if (input.key.trim() === "")
    return {
      allowed: false,
      reason: "The replayed step carries no idempotencykey; a keyless replay never deduplicates.",
    };
  if (input.executedkeys.includes(input.key))
    return {
      allowed: false,
      reason: `The idempotencykey ${input.key} already executed inside the run; the replay skips the duplicate so the side effect never repeats.`,
    };
  return {
    allowed: true,
    reason: `The idempotencykey ${input.key} is unknown to the run; the replay runs the step exactly once.`,
  };
}

/** Allows a resume only when the checkpoint digest matches the live page: a checkpoint against a changed page never resumes. */
export function checkpointgate(input: {
  checkpoint: checkpointrecord;
  runid: string;
  digest: string;
}): policyevaluation {
  if (input.checkpoint.runid !== input.runid)
    return {
      allowed: false,
      reason: `The checkpoint belongs to the run ${input.checkpoint.runid} and not to the run ${input.runid}; the resume refuses a foreign checkpoint.`,
    };
  if (input.checkpoint.digest !== input.digest)
    return {
      allowed: false,
      reason: `The page digest changed since the checkpoint of the step ${input.checkpoint.stepid}; the resume refuses so the run never continues against a different page.`,
    };
  return {
    allowed: true,
    reason: `The page digest matches the checkpoint of the step ${input.checkpoint.stepid}; the resume skips its completed steps and continues at the first open step.`,
  };
}

/** Requires an explicit user choice before compensating steps run: a rollback never executes on its own after a failed or cancelled run. */
export function rollbackgate(input: { choice: "rollback" | "none"; failed?: boolean }): policyevaluation {
  if (input.choice === "none")
    return {
      allowed: false,
      reason: "The user chose no rollback; the compensating steps stay proposals beside the frozen run state.",
    };
  if (input.failed !== true)
    return {
      allowed: false,
      reason: "The rollback choice names a run that has not failed or cancelled; a running run never compensates.",
    };
  return {
    allowed: true,
    reason:
      "The user explicitly chose the rollback; the compensating steps run inside the origin the approved plan named.",
  };
}

/** Blocks new runs while the zombiecheck reports an unresolved reap: the user resolves the reaped run before a fresh run starts. */
export function zombiegate(input: { zombies: string[] }): policyevaluation {
  if (input.zombies.length > 0)
    return {
      allowed: false,
      reason: `The zombiecheck reports ${input.zombies.length} unresolved reap${input.zombies.length === 1 ? "" : "s"} (${input.zombies.join(", ")}); the user resolves the reaped run${input.zombies.length === 1 ? "" : "s"} before a new run starts.`,
    };
  return { allowed: true, reason: "The zombiecheck reports no unresolved reap; a new reviewed run may start." };
}

/** Validates that rollback compensations stay within the approved origin: a compensating step never reaches an origin the plan never named. */
export function rollbackorigingate(input: { items: rollbackitem[]; origin: string }): policyevaluation {
  const outside = input.items.filter((item) => item.origin !== input.origin);
  if (outside.length > 0)
    return {
      allowed: false,
      reason: `${outside.length} compensating step${outside.length === 1 ? "" : "s"} target an origin outside ${input.origin}; the rollback stays inside the origin the approved plan named.`,
    };
  return { allowed: true, reason: `Every compensating step stays inside the approved origin ${input.origin}.` };
}

/** Validates the heartbeat staleness window as a user setting without a fixed ceiling: the window stays a positive user value in milliseconds. */
export function heartbeatwindowvalid(input: { window?: number }): policyevaluation {
  if (input.window === undefined)
    return {
      allowed: true,
      reason:
        "The heartbeat staleness window keeps the documented roadmap default; the user sets no window and the engine caps nothing.",
    };
  if (!Number.isFinite(input.window) || input.window <= 0)
    return {
      allowed: false,
      reason:
        "The heartbeat staleness window must stay a positive user value in milliseconds; the window carries no code ceiling.",
    };
  return {
    allowed: true,
    reason: `The zombiecheck reaps a running run whose heartbeat stays silent past the user window of ${input.window} milliseconds.`,
  };
}

/** Queues an approved plan instead of executing when the endpoint is unreachable: the offline path keeps the plan waiting and never drops it. */
export function offlinegate(input: { reachable: boolean }): { action: "queue" | "execute"; reason: string } {
  if (input.reachable)
    return { action: "execute", reason: "The endpoint answers; the approved plan executes through the reviewed path." };
  return {
    action: "queue",
    reason:
      "The endpoint is unreachable; the approved plan queues in the offlinequeue and replays once connectivity returns.",
  };
}

/** Expires queued tasks whose plan window passes while offline: an expired plan never replays, its run fails and the audit trail keeps the expiry. */
export function queuedtaskexpirygate(input: {
  task: { planid: string; expiresat: number };
  now: number;
}): policyevaluation {
  if (input.task.expiresat <= input.now)
    return {
      allowed: false,
      reason: `The plan window of the queued task ${input.task.planid} passed while offline; the task expires instead of replaying and its run fails for the audit trail.`,
    };
  return {
    allowed: true,
    reason: `The plan window of the queued task ${input.task.planid} still holds; the replay drains it in sequence order once connectivity returns.`,
  };
}

/** Validates the offline queue depth as a user choice without a hard cap: the depth reports against the user value and never refuses a queued plan. */
export function queuedepthvalid(input: { depth?: number }): policyevaluation {
  if (input.depth === undefined)
    return {
      allowed: true,
      reason: "The offline queue keeps no user depth; every waiting approved plan stays queued and none ever refuses.",
    };
  if (!Number.isInteger(input.depth) || input.depth < 0)
    return {
      allowed: false,
      reason:
        "The offline queue depth must stay a non-negative whole number of tasks; the depth stays the user's choice with no code cap.",
    };
  return {
    allowed: true,
    reason: `The offline queue reports its waiting tasks against the user depth of ${input.depth}; the depth informs and never refuses a queued plan.`,
  };
}

/** Blocks one run while another run holds the sessionlock: the gate names the holder in its reason so the blocked run and its user see exactly who runs. */
export function sessionlockgate(input: { lock: lockrecord | undefined; runid: string; now: number }): policyevaluation {
  if (input.lock === undefined)
    return { allowed: true, reason: "No sessionlock stands on the session; the run starts through the reviewed path." };
  if (input.lock.runid === input.runid)
    return {
      allowed: true,
      reason: `The sessionlock already belongs to the run ${input.runid}; the run holds its own lock.`,
    };
  if (input.lock.expiresat <= input.now)
    return {
      allowed: true,
      reason: `The sessionlock of the run ${input.lock.holder} expired past its user window; the stale lock leaves before the new run starts.`,
    };
  return {
    allowed: false,
    reason: `The sessionlock of the session ${input.lock.sessionid} stays held by the run ${input.lock.holder}; the concurrent run ${input.runid} waits because one session never runs two runs at once.`,
  };
}

/** Refuses steps whose tabid differs from the isolated tab namespace of the run: the tabisolate namespaces never share state across tabs. */
export function tabisolategate(input: { namespace: string; tabid: number; runid?: string }): policyevaluation {
  if (input.namespace.trim() === "")
    return {
      allowed: true,
      reason: "The run carries no isolated tab namespace yet; the step runs inside the reviewed tab context.",
    };
  const expected = `tab:${input.tabid}`;
  if (input.namespace !== expected)
    return {
      allowed: false,
      reason: `The run ${input.runid ?? ""} runs inside the isolated namespace ${input.namespace} and the step targets the tab ${input.tabid} of the namespace ${expected}; a run never reaches outside its isolated tab.`,
    };
  return {
    allowed: true,
    reason: `The step targets the tab ${input.tabid} of the isolated namespace ${input.namespace} the run owns.`,
  };
}

/** Confines one urlhistory capture to the approved origin of the run: a visit outside the origin the session granted never enters the urlhistory. */
export function urlhistorygate(input: {
  visit: { url: string; runid: string };
  origin: string;
  grants?: string[];
}): policyevaluation {
  let visitorigin = "";
  try {
    visitorigin = new URL(input.visit.url).origin;
  } catch {
    visitorigin = "";
  }
  const covered = new Set([input.origin, ...(input.grants ?? [])]);
  if (visitorigin === "" || !covered.has(visitorigin))
    return {
      allowed: false,
      reason: `The url ${input.visit.url} sits outside the approved origin ${input.origin} of the run ${input.visit.runid}; the urlhistory confines every visit to the granted origins.`,
    };
  return {
    allowed: true,
    reason: `The visit of ${input.visit.url} stays inside the approved origin ${input.origin}; the urlhistory records it for its run.`,
  };
}

/** Marks the runtimeline rendering as a read only operation: the timeline view reads the merged stream and never executes, mutates or writes anything. */
export function timelinereadonlygate(input: { operation: string }): policyevaluation {
  const readonly = ["view", "render", "bucket", "merge", "export"].some((prefix) =>
    input.operation.toLowerCase().startsWith(prefix),
  );
  if (!readonly)
    return {
      allowed: false,
      reason: `The timeline operation ${input.operation} is not a read only rendering operation; the runtimeline never executes or mutates anything.`,
    };
  return {
    allowed: true,
    reason: `The timeline operation ${input.operation} reads the merged stream only; the runtimeline renders and never executes.`,
  };
}

/** Requires an explicit confirmation before the expirememory pass purges memory items: the purge never runs on its own. */
export function expirygate(input: { confirmed: boolean; count: number }): policyevaluation {
  if (input.count === 0)
    return {
      allowed: false,
      reason: "No memory item expired under the user expiryrules; the purge pass carries nothing to confirm.",
    };
  if (!input.confirmed)
    return {
      allowed: false,
      reason: `${input.count} memory item${input.count === 1 ? "" : "s"} expired under the user expiryrules; the purge waits behind the explicit confirmation because the expiry never purges on its own.`,
    };
  return {
    allowed: true,
    reason: `The user confirmed the purge of ${input.count} expired memory item${input.count === 1 ? "" : "s"}; every purge keeps its summary and its provenance for the audit trail.`,
  };
}

/** Refuses plaintext writes of sensitive memory classes when encryptrest stays enabled: credentials, secrets, tokens, captured bodies, captures and profiles always encrypt at rest. */
export function encryptmemorygate(input: {
  memoryclass?: string;
  enabled: boolean;
  encrypted: boolean;
}): policyevaluation {
  if (!sensitivememoryclassesof(input.memoryclass))
    return {
      allowed: true,
      reason: `The ${input.memoryclass ?? "general"} memory class stays outside the sensitive classes; the write runs as reviewed${input.encrypted ? " and encrypted" : ""}.`,
    };
  if (!input.enabled)
    return {
      allowed: true,
      reason: `The ${input.memoryclass} memory class is sensitive while encryptrest stays off; the write runs plaintext exactly as the user configured.`,
    };
  if (!input.encrypted)
    return {
      allowed: false,
      reason: `The ${input.memoryclass} memory class is sensitive and encryptrest stays enabled; the plaintext write refuses because the item encrypts at rest.`,
    };
  return {
    allowed: true,
    reason: `The sensitive ${input.memoryclass} memory item encrypts at rest through the webcrypto derived key; the key itself never persists.`,
  };
}

/** Reads the sensitive memory classes of the encrypt gate from the memorycare family table. */
function sensitivememoryclassesof(memoryclass: string | undefined): boolean {
  return memoryclass !== undefined && sensitivememoryclasses.has(memoryclass);
}

/** Requires an explicit per batch approval before one quotawatch cleanup batch runs: the cleanup never touches the audit history without consent. */
export function quotacleanupgate(input: {
  approved: boolean;
  batch: Array<{ key: string }>;
  touchesaudit: boolean;
}): policyevaluation {
  if (input.batch.length === 0)
    return {
      allowed: false,
      reason: "The quotawatch proposes no cleanup candidate; the batch carries nothing to approve.",
    };
  if (input.touchesaudit)
    return {
      allowed: false,
      reason:
        "The cleanup batch touches the audit history; the quotawatch never purges the audit trail and the batch refuses.",
    };
  if (!input.approved)
    return {
      allowed: false,
      reason: `The cleanup batch of ${input.batch.length} candidate${input.batch.length === 1 ? "" : "s"} waits behind the explicit per batch approval; the quota never purges on its own.`,
    };
  return {
    allowed: true,
    reason: `The user approved the cleanup batch of ${input.batch.length} candidate${input.batch.length === 1 ? "" : "s"}; the audit history stays untouched while the batch reclaims its bytes.`,
  };
}

/** Requires an explicit user action before the auditexport runs: the export bundles runs, memory, provenance and expiry rules and never streams on its own. */
export function auditexportgate(input: { useraction: boolean }): policyevaluation {
  if (!input.useraction)
    return {
      allowed: false,
      reason: "The audit export waits behind an explicit user action; the bundle never streams on its own.",
    };
  return {
    allowed: true,
    reason: "The user action opened the audit export; the bundle streams its record without a size cap.",
  };
}

/** Validates the sessionlock expiry window as a user setting without a fixed ceiling: the window stays a positive user value in milliseconds. */
export function lockwindowvalid(input: { window?: number }): policyevaluation {
  if (input.window === undefined)
    return {
      allowed: true,
      reason:
        "The sessionlock expiry window keeps the documented roadmap default; the user sets no window and the engine caps nothing.",
    };
  if (!Number.isFinite(input.window) || input.window <= 0)
    return {
      allowed: false,
      reason:
        "The sessionlock expiry window must stay a positive user value in milliseconds; the window carries no code ceiling.",
    };
  return {
    allowed: true,
    reason: `The startup pass expires an abandoned sessionlock whose window of ${input.window} milliseconds passed before the zombiecheck runs.`,
  };
}

/** Treats the encryption secret entry as a consent prompt: the secret never persists, the entry asks the user every time and the derived key stays in memory for the pass alone. */
export function encryptionsecretgate(input: { secret: string; consented: boolean }): policyevaluation {
  if (input.secret.length === 0)
    return {
      allowed: false,
      reason: "The encryption needs its user secret; the secret entry is a consent prompt and never an optional field.",
    };
  if (!input.consented)
    return {
      allowed: false,
      reason: "The secret entry stays a consent prompt; the user confirms the entry before the key derivation runs.",
    };
  return {
    allowed: true,
    reason:
      "The user entered the encryption secret through its consent prompt; the derived key serves the pass and never persists.",
  };
}

/** Keeps the urlhistory scoped per run: the histories of two runs never merge and a visit of another run never enters the urlhistory of the run being read. */
export function urlhistoryscopegate(input: { visits: Array<{ runid: string }>; runid: string }): policyevaluation {
  const foreign = input.visits.filter((visit) => visit.runid !== input.runid);
  if (foreign.length > 0)
    return {
      allowed: false,
      reason: `${foreign.length} url visit${foreign.length === 1 ? "" : "s"} of another run entered the urlhistory of the run ${input.runid}; the urlhistory stays scoped per run and never merges runs.`,
    };
  return {
    allowed: true,
    reason: `Every url visit of the history belongs to the run ${input.runid}; the urlhistory never merges runs.`,
  };
}

/** Requires provenance on every memory item before the auditexport runs: an item without provenance never exports because the audit trail could not name its origin. */
export function exportprovenancegate(input: {
  items: Array<{ key: string; provenance: { origin: string; runid: string; stepid: string } }>;
}): policyevaluation {
  const missing = input.items.filter(
    (item) =>
      item.provenance.origin.trim() === "" ||
      item.provenance.runid.trim() === "" ||
      item.provenance.stepid.trim() === "",
  );
  if (missing.length > 0)
    return {
      allowed: false,
      reason: `${missing.length} memory item${missing.length === 1 ? "" : "s"} (${missing
        .slice(0, 3)
        .map((item) => item.key)
        .join(
          ", ",
        )}) lack${missing.length === 1 ? "s" : ""} provenance; the audit export refuses because the audit trail could not name their origin.`,
    };
  return {
    allowed: true,
    reason:
      "Every memory item of the export carries its provenance; the audit trail names the origin, the run and the step of every stored value.",
  };
}

/** Gates one step against the scope of its requesting agent: the action kind and the origin must sit inside the agent scope, an absent scope stays unbounded inside the session grants, and a read only scope refuses every mutating kind. */
export function agentscopegate(input: {
  scope: agentscope | undefined;
  kind: string;
  origin?: string;
  risk?: string;
}): policyevaluation {
  if (input.scope === undefined)
    return { allowed: true, reason: "The step runs under no agent scope; the session grants alone bound it." };
  if (input.scope.readonly === true && input.risk !== undefined && input.risk !== "read")
    return {
      allowed: false,
      reason: `The read only scope of the agent ${input.scope.agentid} refuses the ${input.kind} step; an observer never acts on the page.`,
    };
  if (
    input.scope.actionkinds !== undefined &&
    input.scope.actionkinds.length > 0 &&
    !input.scope.actionkinds.includes(input.kind)
  )
    return {
      allowed: false,
      reason: `The agent scope of ${input.scope.agentid} grants no ${input.kind} step; the narrowed action kinds stay ${input.scope.actionkinds.slice(0, 5).join(", ")}${input.scope.actionkinds.length > 5 ? " and more" : ""}.`,
    };
  if (input.origin !== undefined && input.scope.origins.length > 0 && !input.scope.origins.includes(input.origin))
    return {
      allowed: false,
      reason: `The agent scope of ${input.scope.agentid} grants no access to the origin ${input.origin}.`,
    };
  return {
    allowed: true,
    reason: `The ${input.kind} step of ${input.origin ?? "the granted origin"} sits inside the agent scope of ${input.scope.agentid}.`,
  };
}

/** Gates one step against the budget state of its requesting agent: a spend past a user configured ceiling refuses the execution, an absent ceiling never refuses and every ceiling stays the user's choice with no hardcoded cap. */
export function budgetgate(input: {
  state: budgetstate | undefined;
  steps?: number;
  tokens?: number;
  durationms?: number;
}): policyevaluation {
  if (input.state === undefined)
    return {
      allowed: true,
      reason: "The step runs under no agent budget; the user set none and the engine sets none.",
    };
  const steps = input.steps ?? 1;
  const tokens = input.tokens ?? 0;
  const durationms = input.durationms ?? 0;
  if (input.state.maxsteps !== undefined && input.state.spentsteps + steps > input.state.maxsteps)
    return {
      allowed: false,
      reason: `The agent ${input.state.agentid} already executed ${input.state.spentsteps} of its ${input.state.maxsteps} user configured steps; the user raises the ceiling or stops the agent.`,
    };
  if (input.state.maxtokens !== undefined && input.state.spenttokens + tokens > input.state.maxtokens)
    return {
      allowed: false,
      reason: `The agent ${input.state.agentid} already spent ${input.state.spenttokens} of its ${input.state.maxtokens} user configured tokens; the user raises the ceiling or stops the agent.`,
    };
  if (input.state.maxdurationms !== undefined && input.state.spentdurationms + durationms > input.state.maxdurationms)
    return {
      allowed: false,
      reason: `The agent ${input.state.agentid} already spent ${input.state.spentdurationms} of its ${input.state.maxdurationms} user configured milliseconds; the user raises the ceiling or stops the agent.`,
    };
  return {
    allowed: true,
    reason: `The step charges the agent budget of ${input.state.agentid}: ${input.state.spentsteps} steps, ${input.state.spenttokens} tokens and ${input.state.spentdurationms} milliseconds spent under the user configured ceilings.`,
  };
}

/** Holds every escalation until the human answers: an agent with an open escalation runs no step, and the hold lifts only with the decision the user wrote. */
export function escalateholdgate(input: { escalations: escalationrecord[]; agentid: string }): policyevaluation {
  const open = input.escalations.filter(
    (escalation) => escalation.agentid === input.agentid && escalation.state === "open",
  );
  if (open.length > 0)
    return {
      allowed: false,
      reason: `The agent ${input.agentid} waits behind ${open.length} open escalation${open.length === 1 ? "" : "s"} (${open
        .map((escalation) => escalation.subject)
        .slice(0, 3)
        .join("; ")}); only the human answer lifts the hold.`,
    };
  return {
    allowed: true,
    reason: `The agent ${input.agentid} carries no open escalation; its steps continue through the same review.`,
  };
}

/** Gates one review request between two agents: both agents must share the origin grant, so a review never moves an output across an origin boundary the grants never joined. */
export function reviewrequestgate(input: { from: agentrecord; to: agentrecord }): policyevaluation {
  if (input.from.origin !== input.to.origin)
    return {
      allowed: false,
      reason: `The review request crosses origins: the agent ${input.from.name} works from ${input.from.origin} while the agent ${input.to.name} works from ${input.to.origin}; a review stays inside the shared origin grant.`,
    };
  return {
    allowed: true,
    reason: `The review request stays inside the shared origin ${input.from.origin} of the agents ${input.from.name} and ${input.to.name}; the verdict records beside the original output.`,
  };
}

/** Gates one fleet pause: the pause holds only the named agent while every peer stays runnable, so a single pause never halts the fleet. */
export function pauseagentgate(input: { records: agentrecord[]; agentid: string }): policyevaluation {
  const agent = input.records.find((record) => record.id === input.agentid);
  if (!agent)
    return {
      allowed: false,
      reason: `The agent ${input.agentid} is not registered in the fleet; a pause needs its agent.`,
    };
  const peers = input.records.filter((record) => record.id !== input.agentid && record.state === "active");
  return {
    allowed: true,
    reason: `The pause holds only the agent ${agent.name}; its ${peers.length} peer${peers.length === 1 ? "" : "s"} stay runnable and their run records stay untouched.`,
  };
}

/** Validates one fleet name against the lowercase identifier rule: letters and digits starting with a letter, unique beside the registered records and clear of the reserved identities. */
export function agentnamevalid(input: { name: string; records?: agentrecord[] }): policyevaluation {
  const name = input.name.trim().toLowerCase();
  if (name === "")
    return { allowed: false, reason: "The agent needs its user chosen name; agent naming stays a user choice." };
  if (!/^[a-z][a-z0-9]*$/.test(name))
    return {
      allowed: false,
      reason: `The agent name ${input.name.trim()} must stay a lowercase identifier of letters and digits starting with a letter.`,
    };
  if (reservedagentnames.has(name))
    return {
      allowed: false,
      reason: `The agent name ${name} is reserved; the user, the operator, the human and the system identities never belong to an agent.`,
    };
  if ((input.records ?? []).some((record) => record.name === name))
    return { allowed: false, reason: `The agent name ${name} is already registered; fleet names stay unique.` };
  return {
    allowed: true,
    reason: `The fleet name ${name} stays a unique lowercase identifier clear of the reserved identities.`,
  };
}

/** Grades one fleet operation read only: outputcompare and consensusvote join runreplay, reviewrequest and escalate as the read side operations that never touch the page. */
export function fleetoperationgrade(operation: string): policyevaluation {
  const readonly = new Set([
    "outputcompare",
    "consensusvote",
    "runreplay",
    "reconstructreplay",
    "reviewrequest",
    "recordverdict",
    "escalate",
    "escalationblock",
  ]);
  if (!readonly.has(operation))
    return {
      allowed: false,
      reason: `The fleet operation ${operation} is no read side operation of the 1.1.72 family; the grade knows outputcompare, consensusvote, runreplay, reviewrequest and escalate only.`,
    };
  return {
    allowed: true,
    reason: `The fleet operation ${operation} grades read only: it aligns, tallies, replays or records records and never touches the page.`,
  };
}

/** Binds every runreplay export to the audit consent boundary: a replay carries the audit trail of a run, so the export leaves only behind the explicit user consent. */
export function replayexportgate(input: { consent: boolean; agentid: string }): policyevaluation {
  if (!input.consent)
    return {
      allowed: false,
      reason: `The runreplay export of the agent ${input.agentid} carries the audit trail of its runs; the export leaves only behind the explicit user consent.`,
    };
  return {
    allowed: true,
    reason: `The user consented to the runreplay export of the agent ${input.agentid}; the capture leaves with its ordered steps and its reconstruction marker.`,
  };
}

/** Validates the vote weight of one consensus record: one vote per agent, so a duplicate voter refuses and every agentrecord counts exactly once. */
export function voteweightvalid(input: { votes: Array<{ agentid: string }> }): policyevaluation {
  const seen = new Set<string>();
  const duplicates: string[] = [];
  for (const vote of input.votes) {
    if (vote.agentid.trim() === "")
      return { allowed: false, reason: "Every vote names its agent; an anonymous vote weighs nothing." };
    if (seen.has(vote.agentid)) duplicates.push(vote.agentid);
    seen.add(vote.agentid);
  }
  if (duplicates.length > 0)
    return {
      allowed: false,
      reason: `The agents ${[...new Set(duplicates)].join(", ")} voted twice; the vote weight stays one per agentrecord.`,
    };
  return {
    allowed: true,
    reason: `${seen.size} agent${seen.size === 1 ? " votes" : "s vote"} once each; the tally weighs every agentrecord exactly once.`,
  };
}

/** Requires the parent scope to cover the origin of the child objective before any spawn: the parent origins empty stay unbounded inside the session grants while a configured parent scope must name the objective origin, so the child never works past what its parent covers. */
export function spawngate(input: {
  parentscope: agentscope | undefined;
  objectiveorigin: string;
  parentstate?: string;
}): policyevaluation {
  if (input.parentstate === "paused")
    return { allowed: false, reason: "The parent sits paused; a paused parent spawns no child until its resume." };
  if (input.parentstate === "stopped")
    return { allowed: false, reason: "The parent is stopped; a stopped parent spawns no child." };
  if (input.parentscope === undefined || input.parentscope.origins.length === 0)
    return {
      allowed: true,
      reason:
        "The parent scope stays unbounded inside the session grants; the child objective origin needs no extra coverage.",
    };
  if (!input.parentscope.origins.includes(input.objectiveorigin))
    return {
      allowed: false,
      reason: `The parent scope grants no access to the objective origin ${input.objectiveorigin}; a spawn never widens past what its parent covers.`,
    };
  return {
    allowed: true,
    reason: `The parent scope covers the objective origin ${input.objectiveorigin}; the child stays inside its parent's grants.`,
  };
}

/** Refuses spawns beyond the user configured depth limit: the lineage depth passes the configured ceiling only through the user raising it, and an absent ceiling stays unbounded because the recursion bound stays the user's choice with no hardcoded number. */
export function depthgate(input: { depth: number; limit: depthlimit }): policyevaluation {
  if (input.limit.maxdepth === undefined)
    return {
      allowed: true,
      reason: `The lineage depth ${input.depth} sits unbounded; the user configured no depth ceiling.`,
    };
  if (input.depth > input.limit.maxdepth)
    return {
      allowed: false,
      reason: `The lineage depth ${input.depth} passes the user configured depth limit ${input.limit.maxdepth}; the spawn refuses until the user raises the limit.`,
    };
  return {
    allowed: true,
    reason: `The lineage depth ${input.depth} sits inside the user configured depth limit ${input.limit.maxdepth}.`,
  };
}

/** Marks the aggregatereport as a read only merge operation: the aggregation reads the parallel agent outputs, keeps their sections and provenance and never rewrites an original output, so the merge grades read only beside the fleet operations. */
export function aggregatemergegrade(operation: string): policyevaluation {
  if (operation === "aggregatereport")
    return {
      allowed: true,
      reason:
        "The aggregatereport merges the parallel agent outputs read only; every section keeps its per agent provenance and no original output rewrites.",
    };
  return {
    allowed: false,
    reason: `The operation ${operation} never grades as a read only aggregation; the merge stays reserved for the aggregatereport.`,
  };
}

/** Sends the unresolved aggregation conflicts to escalation: a conflict the policy order left unresolved never silently drops, the merge stays open and the escalation lifts the conflict to the user who decides. */
export function aggregateconflictescalationgate(input: { unresolved: string[] }): policyevaluation {
  if (input.unresolved.length === 0)
    return {
      allowed: true,
      reason:
        "The aggregation carries no unresolved conflict; the merge closes with every conflict resolved by its policy order.",
    };
  return {
    allowed: false,
    reason: `The aggregation carries ${input.unresolved.length} unresolved conflict${input.unresolved.length === 1 ? "" : "s"} on ${input.unresolved.join(", ")}; the merge stays open and the escalation lifts the conflict to the user.`,
  };
}

/** Keeps every arbitration verdict inside the sessionlock and the origin grants: the holder of a verdict never bypasses the lock another run holds and never reaches an origin outside its grants, so the grant of a case stays a queue position and never a permission. */
export function arbitrationverdictgate(input: {
  holderagentid: string;
  origin: string;
  sessionlockholder?: string;
  origingrants?: string[];
}): policyevaluation {
  if (input.sessionlockholder !== undefined && input.sessionlockholder !== input.holderagentid)
    return {
      allowed: false,
      reason: `The run lock of ${input.origin} stays held by ${input.sessionlockholder}; the verdict grants a queue position and never bypasses the sessionlock.`,
    };
  if (input.origingrants !== undefined && input.origingrants.length > 0 && !input.origingrants.includes(input.origin))
    return {
      allowed: false,
      reason: `The origin ${input.origin} sits outside the session grants; the verdict grants a queue position and never widens the origin grants.`,
    };
  return {
    allowed: true,
    reason: `The verdict of the agent ${input.holderagentid} stays inside the sessionlock and the origin grants of ${input.origin}; the case grants a queue position only.`,
  };
}

/** Requires the user confirmation for a priority lane change of sensitive steps: the lanes reorder freely for the ordinary steps while a lane change that moves a sensitive step needs the explicit confirmation because the interactive lane holds it. */
export function lanechangegate(input: { lane: tasklane; sensitive: boolean; confirmed: boolean }): policyevaluation {
  if (!input.sensitive)
    return {
      allowed: true,
      reason: `The lane change of ${input.lane.name} carries no sensitive step; the user reorders the lanes freely.`,
    };
  if (input.lane.interactive === true)
    return {
      allowed: true,
      reason: `The sensitive steps stay in the interactive lane ${input.lane.name}; the lane change holds their protection.`,
    };
  if (!input.confirmed)
    return {
      allowed: false,
      reason: `The lane change moves sensitive steps out of the interactive lane ${input.lane.name}; the explicit user confirmation decides, never the engine.`,
    };
  return {
    allowed: true,
    reason: `The user confirmed the lane change of the sensitive steps into ${input.lane.name}; the confirmation reads in the audit trail.`,
  };
}

/** Keeps every scaleworkers suggestion behind the user consent: a low load or a throttling origin suggests its spawn or pause and never acts alone, so the fleet size changes only through the user action. */
export function scaleconsentgate(input: { userconsented: boolean; origin: string }): policyevaluation {
  if (!input.userconsented)
    return {
      allowed: false,
      reason: `The scaleworkers suggestion of ${input.origin} stays a suggestion; the spawn or pause needs the user consent because the fleet size never changes alone.`,
    };
  return {
    allowed: true,
    reason: `The user consented to the scaleworkers change of ${input.origin}; the fleet size changes through the user action.`,
  };
}

/** Refuses the lessons that carry secrets or credentials: a finding that names a token, a password, a key or a bearer credential never enters the shared lesson store because the lessons spread across every agent of the fleet. */
export function lessonsecretgate(input: { text: string }): policyevaluation {
  const patterns: Array<[string, RegExp]> = [
    ["token", /\b(?:api[- ]?key|token|secret|password|passwd|bearer|authorization)\b\s*[:=]\s*\S+/i],
    [
      "credential",
      /\b(?:sk-[a-z0-9]{16,}|gh[pousr]_[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----)/i,
    ],
  ];
  for (const [label, pattern] of patterns)
    if (pattern.test(input.text))
      return {
        allowed: false,
        reason: `The lesson carries a ${label} shaped secret; the lessons spread across the fleet so a secret never enters the store.`,
      };
  return { allowed: true, reason: "The lesson carries no secret shape; the finding shares across the fleet." };
}

/** Sanitizes the lesson text before storage: the secret shaped assignments mask to their label while the plain language finding stays readable for every agent that serves it. */
export function lessonsanitizestep(text: string): string {
  return text
    .replace(/\b(api[- ]?key|token|secret|password|passwd|bearer|authorization)\b(\s*[:=]\s*)\S+/gi, "$1$2[redacted]")
    .replace(/\bsk-[a-z0-9]{16,}\b/gi, "[redacted key]")
    .replace(/\bgh[pousr]_[A-Za-z0-9]{20,}\b/g, "[redacted token]")
    .replace(/-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g, "[redacted private key]");
}

/** Keeps the costshare accounting local and read only: the ledger reads the units every agent spent and splits the shared costs among their causers, and no operation writes to the page or reaches a network through the ledger. */
export function costsharegate(operation: string): policyevaluation {
  if (operation === "costshare")
    return {
      allowed: true,
      reason:
        "The costshare accounting stays local and read only; the ledger splits the shared costs among their causers and never acts outside the extension.",
    };
  return {
    allowed: false,
    reason: `The operation ${operation} never grades as the costshare accounting; the ledger stays read only.`,
  };
}

/** Validates the subagent scope as a subset of its parent: every child origin and action kind must sit inside the parent scope, and a child that reaches past its parent refuses loudly instead of silently widening. */
export function subsetscopegate(input: { child: agentscope; parent: agentscope }): policyevaluation {
  const outsideorigins = input.child.origins.filter((origin) => !input.parent.origins.includes(origin));
  if (input.parent.origins.length > 0 && outsideorigins.length > 0)
    return {
      allowed: false,
      reason: `The child scope reaches the origins ${outsideorigins.join(", ")} outside its parent scope; a subagent scope stays a subset of its parent.`,
    };
  const parentkinds = input.parent.actionkinds ?? [];
  const childkinds = input.child.actionkinds ?? [];
  const outsidekinds = parentkinds.length > 0 ? childkinds.filter((kind) => !parentkinds.includes(kind)) : [];
  if (outsidekinds.length > 0)
    return {
      allowed: false,
      reason: `The child scope reaches the action kinds ${outsidekinds.join(", ")} outside its parent scope; a subagent scope stays a subset of its parent.`,
    };
  if (input.parent.readonly === true && input.child.readonly !== true)
    return {
      allowed: false,
      reason: "The parent scope stays read only; a child of an observer never gains the write side.",
    };
  return {
    allowed: true,
    reason: "The subagent scope sits inside its parent scope; the narrowing keeps every step of the child covered.",
  };
}

/** Keeps the interleaved timeline views read only for the audit: the merged view orders the actions of every agent and never feeds back into a queue, a step or a verdict. */
export function interleavereadonlygate(operation: string): policyevaluation {
  if (operation === "interleave")
    return {
      allowed: true,
      reason:
        "The interleaved timeline view stays read only; the merged lanes order the agent actions for the audit and never feed back into a queue or a step.",
    };
  return {
    allowed: false,
    reason: `The operation ${operation} never grades as the read only interleaved view; the timeline stays for the audit.`,
  };
}

/** Restricts the prefetch warming to the granted origins: a predicted url whose origin sits outside the session grants never warms, because a speculative dns resolution of an ungranted origin would observe a site the user never consented to. */
export function prefetchgate(input: { urls: string[]; grants: string[] }): policyevaluation {
  const outside = input.urls.filter((url) => {
    try {
      return !input.grants.includes(new URL(url).origin);
    } catch {
      return true;
    }
  });
  if (outside.length > 0)
    return {
      allowed: false,
      reason: `${outside.length} prefetch candidate${outside.length === 1 ? "" : "s"} (${outside.slice(0, 3).join(", ")}) sit outside the session grants; the warming never reaches an origin the user did not grant.`,
    };
  return {
    allowed: true,
    reason: `Every prefetch candidate sits inside the session grants; the speculative dns warming observes the granted origins only.`,
  };
}

/** Marks the preconnect sockets read only and revocable: a revoked target opens no further connection, a target outside the host grants of the session never opens, and every open socket warms the transport only because a preconnect never carries a request of its own. */
export function preconnectgate(input: { targets: preconnecttarget[]; grants?: string[] }): policyevaluation {
  const revoked = input.targets.filter((target) => target.revokedat !== undefined);
  if (revoked.length > 0)
    return {
      allowed: false,
      reason: `${revoked.length} preconnect target${revoked.length === 1 ? "" : "s"} (${revoked
        .map((target) => target.origin)
        .slice(0, 3)
        .join(", ")}) carry a revoked stamp; a revoked socket opens no further connection.`,
    };
  const grants = input.grants;
  const outside =
    grants !== undefined
      ? input.targets.filter((target) => target.origin.trim() !== "" && !grants.includes(target.origin))
      : [];
  if (outside.length > 0)
    return {
      allowed: false,
      reason: `${outside.length} preconnect target${outside.length === 1 ? "" : "s"} (${outside
        .map((target) => target.origin)
        .slice(0, 3)
        .join(", ")}) sit outside the host grants of the session; the preconnect honors the grants the user gave.`,
    };
  return {
    allowed: true,
    reason: `Every preconnect socket stays read only and revocable; the targets honor the host grants of the session and warm the transport ahead of the steps that need it.`,
  };
}

/** Requires the target origin grant before one deep link builds: the deeplinkpattern names the origin its route builds into, and a pattern whose origin sits outside the session grants builds nothing because the reviewed parameters never widen the grants. */
export function deeplinkgate(input: { pattern: deeplinkpattern; grants: string[] }): policyevaluation {
  if (!input.grants.includes(input.pattern.origin))
    return {
      allowed: false,
      reason: `The deep link pattern of ${input.pattern.app} builds into the origin ${input.pattern.origin} which sits outside the session grants; the reviewed parameters never widen the grants.`,
    };
  return {
    allowed: true,
    reason: `The deep link pattern of ${input.pattern.app} builds into the granted origin ${input.pattern.origin} from its reviewed parameters only.`,
  };
}

/** Rechecks the consent of one restored tab: a closedtabrecord whose origin lost its grant never reopens, because the closing of a tab never carries the consent of its origin forward and the reopening rechecks exactly what the session still grants. */
export function reopentabgate(input: { record: closedtabrecord; grants: string[] }): policyevaluation {
  let origin = "";
  try {
    origin = new URL(input.record.url).origin;
  } catch {
    origin = "";
  }
  if (origin === "" || !input.grants.includes(origin))
    return {
      allowed: false,
      reason: `The closed tab ${input.record.url} carries the origin ${origin || "an unparsable url"} which the session no longer grants; the reopening rechecks the consent and refuses.`,
    };
  return {
    allowed: true,
    reason: `The closed tab of ${origin} sits inside the session grants; the reopening restores it under the consent the session still carries.`,
  };
}

/** Blocks every navigation kind while a consent prompt is open: the freeze holds the navigation kinds of the family — openlink, openprivate, followlink, spanav, navlist, openclipboard, batchopen, prefetch, preconnect, deeplink and reopentab — and every other kind passes because the pause holds the pages, not the audit. */
export function pausenavconsentgate(input: { pause?: navpause; kind: string }): policyevaluation {
  const navkinds = new Set([
    "openlink",
    "openprivate",
    "followlink",
    "spanav",
    "navlist",
    "openclipboard",
    "batchopen",
    "prefetch",
    "preconnect",
    "deeplink",
    "reopentab",
  ]);
  const pause = input.pause;
  if (pause === undefined || pause.pausedat === undefined || !navkinds.has(input.kind))
    return {
      allowed: true,
      reason: `The ${input.kind} step runs under no open consent freeze; the navigation pause holds the navigation kinds only.`,
    };
  return {
    allowed: false,
    reason: `Navigation is paused while ${pause.reason}${pause.pendingurl !== undefined ? `; the pending navigation ${pause.pendingurl} queues until the answer` : ""}; resume navigation first.`,
  };
}

/** Delays a step that hits a full navigation rate window: the gate refuses the immediate run, names the milliseconds the sliding window needs before the oldest hit ages out, and the step never drops silently because the wait rides in the response envelope and the retry follows it. */
export function navratelimitgate(input: { allowed: boolean; waitms: number; domain: string }): policyevaluation {
  if (input.allowed)
    return {
      allowed: true,
      reason: `The sliding window of ${input.domain} carries room for the navigation; the step counts against the window and runs.`,
    };
  return {
    allowed: false,
    reason: `The sliding window of ${input.domain} is full; the step waits ${input.waitms} millisecond${input.waitms === 1 ? "" : "s"} for the oldest navigation to age out, the wait rides in the response envelope and the navigation never drops silently.`,
  };
}

/** Requires a user gesture and an origin grant before one clipboard url opens: the clipboard text of the explicit user action parses into one url, the origin of that url sits inside the session grants, and a clipboard read without the gesture or the grant opens nothing. */
export function clipboardgate(input: { usergesture: boolean; url: string; grants: string[] }): policyevaluation {
  if (!input.usergesture)
    return {
      allowed: false,
      reason:
        "The clipboard url opens only from the explicit user action of the reviewed step; an autonomous clipboard read never opens a page.",
    };
  let origin = "";
  try {
    origin = new URL(input.url).origin;
  } catch {
    origin = "";
  }
  if (origin === "" || !input.grants.includes(origin))
    return {
      allowed: false,
      reason: `The clipboard url ${input.url} carries the origin ${origin || "an unparsable url"} which sits outside the session grants; the opening requires the origin grant.`,
    };
  return {
    allowed: true,
    reason: `The clipboard url of ${origin} opens behind the explicit user action and the origin grant.`,
  };
}

/** Refuses the urls that fail checksafeurl: a verdict that carries any reason — a weak scheme, embedded credentials, a private or raw host, a punycode label or a host that imitates a granted origin — blocks the url before anything opens, and the reasons ride to the ui so the user reads exactly why. */
export function safetygate(input: { verdict: safetyverdict }): policyevaluation {
  if (!input.verdict.safe)
    return {
      allowed: false,
      reason: `The url ${input.verdict.url} is unsafe: ${input.verdict.reasons.join("; ")}; the opening refuses.`,
    };
  return {
    allowed: true,
    reason: `The url ${input.verdict.url} passed every safety check; the reasons list stays empty and the url may open.`,
  };
}

/** Bounds the batch size by the user choice only: a batch that passes the user configured ceiling refuses until the user raises the ceiling or trims the batch, and an absent ceiling never refuses a link because the bound carries no code default. */
export function batchsizelimitgate(input: { size: number; limit?: number }): policyevaluation {
  if (input.limit === undefined)
    return {
      allowed: true,
      reason: `The batch of ${input.size} url${input.size === 1 ? "" : "s"} runs under no user ceiling; the batch size bound stays a user choice with no code default.`,
    };
  if (input.size > input.limit)
    return {
      allowed: false,
      reason: `The batch of ${input.size} url${input.size === 1 ? "" : "s"} passes the user configured ceiling of ${input.limit}; the user raises the ceiling or trims the batch.`,
    };
  return {
    allowed: true,
    reason: `The batch of ${input.size} url${input.size === 1 ? "" : "s"} sits inside the user configured ceiling of ${input.limit}.`,
  };
}

/** Marks navintent and prefetchpage as read only observations: the prediction reads the approved plan and the urlhistory, the warming computes the speculative dns set, and neither operation issues a request, mutates a page or bypasses the review — every other operation fails the grade. */
export function navigationobservationgrade(operation: string): policyevaluation {
  if (operation === "navintent" || operation === "prefetchpage")
    return {
      allowed: true,
      reason: `The ${operation} operation grades read only: it predicts or computes a warming set and never issues a request of its own.`,
    };
  return {
    allowed: false,
    reason: `The operation ${operation} never grades as a read only navigation observation; the prediction and the warming stay reserved for navintent and prefetchpage.`,
  };
}

/** Keeps the restoretrail exports inside the audit consent boundary: a navigation trail carries the url path of a whole run, so the export leaves only behind the explicit user consent the audit boundary demands. */
export function trailexportgate(input: { consent: boolean; runid: string }): policyevaluation {
  if (!input.consent)
    return {
      allowed: false,
      reason: `The restoretrail export of the run ${input.runid} carries its whole navigation trail; the export leaves only behind the explicit user consent.`,
    };
  return {
    allowed: true,
    reason: `The user consented to the restoretrail export of the run ${input.runid}; the trail leaves with its ordered entries and its replay marker.`,
  };
}

/** Verifies the navtrail entries stay within the session origins: a trail entry whose url sits outside the origins the session granted refuses loudly because a trail that leaves the grants would record a path the user never consented to. */
export function trailorigingate(input: { entries: navtrailentry[]; origins: string[] }): policyevaluation {
  const outside = input.entries.filter((entry) => {
    try {
      return !input.origins.includes(new URL(entry.url).origin);
    } catch {
      return true;
    }
  });
  if (outside.length > 0)
    return {
      allowed: false,
      reason: `${outside.length} navtrail entr${outside.length === 1 ? "y sits" : "ies sit"} outside the session origins (${outside
        .slice(0, 3)
        .map((entry) => entry.url)
        .join(", ")}); the trail never records a path the user did not grant.`,
    };
  return {
    allowed: true,
    reason: `Every navtrail entry stays inside the session origins; the trail records exactly the path the grants cover.`,
  };
}

/** Allows the disk writes of one pipeline only through the reviewed download flow: a streamdisk pass that would write outside the reviewed sink — a bare filesystem path, an unreviewed endpoint or an export without its descriptor — refuses loudly, because the pipeline layer moves bytes through the same reviewed export machinery every other export flows through and never opens a side channel. */
export function streamgate(input: { revieweddownload: boolean; sink: string }): policyevaluation {
  if (!input.revieweddownload)
    return {
      allowed: false,
      reason: `The pipeline write to ${input.sink} carries no reviewed download flow; the stream passes through the reviewed export machinery or refuses.`,
    };
  return {
    allowed: true,
    reason: `The pipeline write to ${input.sink} flows through the reviewed download flow; no side channel ever bypasses the export review.`,
  };
}

/** Restricts the transforms of one pipeline to its reviewed rule list: a rule whose field and operation sit outside the rules the plan review approved refuses before any value reshapes, and the reviewed list itself stays the plan's because the pipeline never widens what the review read. */
export function transformgate(input: { rule: transformrule; reviewed: transformrule[] }): policyevaluation {
  const known = input.reviewed.some(
    (candidate) =>
      (candidate.field ?? candidate.target) === (input.rule.field ?? input.rule.target) &&
      candidate.operation === input.rule.operation,
  );
  if (!known)
    return {
      allowed: false,
      reason: `The transform of ${input.rule.field ?? input.rule.target} through ${input.rule.operation ?? "its expression"} sits outside the reviewed rule list; the pipeline applies only what the plan review approved.`,
    };
  return {
    allowed: true,
    reason: `The transform of ${input.rule.field ?? input.rule.target} through ${input.rule.operation ?? "its expression"} sits inside the reviewed rule list of the pipeline.`,
  };
}

/** Keeps the dedupe configuration a per pipeline user choice: a dedupe pass without its configured key refuses because an implicit key would silently drop rows the user never chose to compare, and the columns with their normalization stay exactly the pipeline's own configuration. */
export function dedupeconfiggate(input: { key?: dedupekey; pipelineid: string }): policyevaluation {
  if (input.key === undefined || input.key.columns.filter((column) => column.trim() !== "").length === 0)
    return {
      allowed: false,
      reason: `The pipeline ${input.pipelineid} carries no configured dedupe key; the deduplication stays a user choice per pipeline and an implicit key never drops rows.`,
    };
  return {
    allowed: true,
    reason: `The pipeline ${input.pipelineid} deduplicates by ${input.key.columns.join(", ")} under the ${input.key.normalization} normalization the user configured; the choice stays per pipeline.`,
  };
}

/** Marks the sampling pass as a read only preview: samplerows projects a subset of the stored extract, never mutates the extract it read, and never grades as a write — every other operation fails the grade so a sampling pass can never smuggle a mutation. */
export function samplegate(operation: string): policyevaluation {
  if (operation === "samplerows")
    return {
      allowed: true,
      reason:
        "The samplerows pass grades as a read only preview; the subset copies its rows and the stored extract stays exactly what it held.",
    };
  return {
    allowed: false,
    reason: `The operation ${operation} never grades as a read only sampling preview; the samplerows stays the only read only pass of the family.`,
  };
}

/** Requires the provenance on every exported row: an exported row without its provlog provenance refuses the export in full, because an extract that leaves without its provenance would answer neither where it came from nor which operations reshaped it. */
export function provgate(input: { rows: extractrow[]; entries: provlogentry[] }): policyevaluation {
  const logged = new Set(input.entries.flatMap((entry) => entry.rowkeys));
  const bare = input.rows.filter((row) => row.provenance.length === 0 || !logged.has(row.key));
  if (bare.length > 0)
    return {
      allowed: false,
      reason: `${bare.length} of ${input.rows.length} exported row${bare.length === 1 ? " carries" : "s carry"} no provenance the provlog holds (${bare
        .slice(0, 3)
        .map((row) => row.key)
        .join(", ")}); the export refuses in full.`,
    };
  return {
    allowed: true,
    reason: `Every exported row carries its provlog provenance; the export leaves with the url, the step and the operations of every row answered.`,
  };
}

/** Allows the resume of one pipeline only for the same plan and the same origin: a resume of another plan would continue work the approval never covered and a resume of another origin would extract a site the session never granted, so both refuse loudly before any row skips. */
export function resumegate(input: { pipeline: extractpipeline; planid?: string; origin: string }): policyevaluation {
  if (input.pipeline.planid !== undefined && input.planid !== undefined && input.pipeline.planid !== input.planid)
    return {
      allowed: false,
      reason: `The pipeline ${input.pipeline.name} belongs to the plan ${input.pipeline.planid} while the resume names ${input.planid}; a resume continues exactly the plan it came from.`,
    };
  if (input.pipeline.origin !== input.origin)
    return {
      allowed: false,
      reason: `The pipeline ${input.pipeline.name} extracts from ${input.pipeline.origin} while the resume names ${input.origin}; a resume never moves the extraction to another origin.`,
    };
  return {
    allowed: true,
    reason: `The resume of the pipeline ${input.pipeline.name} continues the same plan of the same origin ${input.origin}; the extraction stays exactly where it started.`,
  };
}

/** Refuses the pipelines that extract fields outside their reviewed target: a pipeline whose rows carry a column the reviewed source never named reads past the review, so the field refuses before the value ever persists. */
export function pipelinetargetgate(input: {
  fields: string[];
  target: string[];
  pipelineid: string;
}): policyevaluation {
  const outside = input.fields.filter((field) => field.trim() !== "" && !input.target.includes(field));
  if (outside.length > 0)
    return {
      allowed: false,
      reason: `The pipeline ${input.pipelineid} extracts the fields ${outside.join(", ")} outside its reviewed target; the extraction reads exactly the fields the review approved.`,
    };
  return {
    allowed: true,
    reason: `Every field of the pipeline ${input.pipelineid} sits inside its reviewed target; the extraction reads exactly what the review approved.`,
  };
}

/** Requires the user confirmation before a grid preview exports: the preview stays a read only projection until the user confirms its export, because a preview that ships on its own would export a subset the user only meant to inspect. */
export function gridexportconfirmgate(input: { confirmed: boolean; rows: number }): policyevaluation {
  if (!input.confirmed)
    return {
      allowed: false,
      reason: `The grid preview of ${input.rows} row${input.rows === 1 ? "" : "s"} stays a read only projection; the export needs the explicit user confirmation.`,
    };
  return {
    allowed: true,
    reason: `The user confirmed the export of the ${input.rows} previewed row${input.rows === 1 ? "" : "s"}; the preview ships exactly what the user inspected.`,
  };
}

/** Bounds the stream chunk size by the user choice only: a chunk that passes the user configured ceiling refuses until the user raises it or trims the chunk, and an absent ceiling never refuses a chunk because the bound carries no code default. */
export function streamchunkgate(input: { chunk: number; limit?: number }): policyevaluation {
  if (input.limit === undefined)
    return {
      allowed: true,
      reason: `The stream chunk of ${input.chunk} row${input.chunk === 1 ? "" : "s"} runs under no user ceiling; the chunk size stays a user choice with no code default.`,
    };
  if (input.chunk > input.limit)
    return {
      allowed: false,
      reason: `The stream chunk of ${input.chunk} row${input.chunk === 1 ? "" : "s"} passes the user configured ceiling of ${input.limit}; the user raises the ceiling or trims the chunk.`,
    };
  return {
    allowed: true,
    reason: `The stream chunk of ${input.chunk} row${input.chunk === 1 ? "" : "s"} sits inside the user configured ceiling of ${input.limit}.`,
  };
}

/** Marks the provlog append only for the audit integrity: a write that would rewrite or remove an entry the log already carries refuses loudly, because a provenance log that rewrites answers nothing. */
export function provlogappendonlygate(input: { entries: provlogentry[]; entryid: string }): policyevaluation {
  if (input.entries.some((entry) => entry.id === input.entryid))
    return {
      allowed: false,
      reason: `The provlog entry ${input.entryid} already sits in the log; the provenance log stays append only and an entry never rewrites.`,
    };
  return {
    allowed: true,
    reason: `The provlog entry ${input.entryid} appends to the log; the provenance record of every operation stays immutable for the audit.`,
  };
}

/** Keeps the row timestamps immutable after stamping: a restamp whose capturedat differs from the stamp the row already carries refuses loudly, because a provenance timestamp that moves answers the wrong question. */
export function rowstampgate(input: {
  stored: Array<{ key: string; capturedat: number }>;
  row: { key: string; capturedat: number };
}): policyevaluation {
  const existing = input.stored.find((candidate) => candidate.key === input.row.key);
  if (existing !== undefined && existing.capturedat !== input.row.capturedat)
    return {
      allowed: false,
      reason: `The row ${input.row.key} already carries its stamp at ${existing.capturedat} while the restamp names ${input.row.capturedat}; a stamped timestamp never rewrites.`,
    };
  return {
    allowed: true,
    reason: `The stamp of the row ${input.row.key} stays immutable; the capture time answers the moment the extraction observed it.`,
  };
}

/** Binds the streamdisk files to the runid namespace: a stream file whose name leaves the namespace of its run refuses, because a stream that writes outside its run namespace could collide with the files of another run and answer the wrong provenance. */
export function streamnamespacegate(input: { filename: string; runid: string }): policyevaluation {
  const namespace = input.runid.trim();
  if (namespace === "")
    return {
      allowed: false,
      reason: "The stream file names its run namespace; an unnamespaced stream answers no run.",
    };
  if (!input.filename.includes(namespace))
    return {
      allowed: false,
      reason: `The stream file ${input.filename} leaves the runid namespace ${namespace}; the disk sink stays bound to the run that streamed it.`,
    };
  return {
    allowed: true,
    reason: `The stream file ${input.filename} sits inside the runid namespace ${namespace}; the disk sink answers exactly the run that streamed it.`,
  };
}

/** Restricts every api transport call of the 1.1.76 family to the granted origins: a call whose url leaves the session origin grants never leaves the extension, because the widened transport surface moves the same reviewed bytes the fetch family moves and never widens what the review granted. */
export function transportgate(input: { url: string; grants: string[] }): policyevaluation {
  try {
    const origin = new URL(input.url).origin;
    const covered = input.grants.some((pattern) => {
      try {
        return origin === new URL(pattern).origin;
      } catch {
        return false;
      }
    });
    if (!covered)
      return {
        allowed: false,
        reason: `The api transport call to ${origin} targets an origin outside the session grants; the transport layer never widens the grants.`,
      };
    return { allowed: true };
  } catch {
    return {
      allowed: false,
      reason: `The api transport call url ${input.url} does not parse; an unparseable url never carries a request.`,
    };
  }
}

/** Requires the channel origin grant before one subscription of the 1.1.76 family opens: the event stream and the graphql channel of a subscription ride an origin the session granted, and a channel outside the grants opens nothing. */
export function subscribegate(input: { url: string; grants: string[] }): policyevaluation {
  try {
    const origin = new URL(input.url).origin;
    const covered = input.grants.some((pattern) => {
      try {
        return origin === new URL(pattern).origin;
      } catch {
        return false;
      }
    });
    if (!covered)
      return {
        allowed: false,
        reason: `The subscription channel of ${origin} sits outside the session origin grants; a channel the grants do not cover never opens.`,
      };
    return { allowed: true };
  } catch {
    return {
      allowed: false,
      reason: `The subscription channel url ${input.url} does not parse; an unparseable channel never opens.`,
    };
  }
}

/** Marks formpost and multipartpost of the 1.1.76 family as sensitive steps: every post mutates a remote state through the reviewed payload, so the review grades the posts sensitive while the subscription, poll and observation transports stay read only. */
export function postgate(kind: string): policyevaluation {
  if (kind === "formpost" || kind === "postform" || kind === "multipartpost" || kind === "postfiles")
    return {
      allowed: true,
      reason: `The ${kind} step mutates a remote state through its reviewed payload; the review grades it sensitive.`,
    };
  return {
    allowed: false,
    reason: `The ${kind} operation is no post of the web api family; the sensitive grade covers formpost and multipartpost only.`,
  };
}

/** Requires the explicit file review before one multipart upload of the 1.1.76 family: every file of the payload carries its reviewed flag, and an upload with an unreviewed file refuses before any byte encodes. */
export function uploadgate(input: { files: Array<{ reviewed?: boolean }>; count: number }): policyevaluation {
  if (input.count === 0)
    return {
      allowed: false,
      reason: "A multipart upload carries at least one reviewed file; an empty upload encodes nothing.",
    };
  const unreviewed = input.files.filter((file) => file.reviewed !== true).length;
  if (unreviewed > 0)
    return {
      allowed: false,
      reason: `${unreviewed} of ${input.count} file${input.count === 1 ? "" : "s"} of the multipart upload carry no explicit review; the upload waits for the file review.`,
    };
  return {
    allowed: true,
    reason: `Every one of the ${input.count} reviewed file${input.count === 1 ? "" : "s"} of the multipart upload carries its explicit review.`,
  };
}

/** Refuses caching the responses that carry credentials of the 1.1.76 family: a response with an authorization, a cookie or an api key fact never enters the per run cache, because a cached credential answer would serve again without the consent the credential carries. */
export function cachegate(input: { credentials: boolean; url: string }): policyevaluation {
  if (input.credentials)
    return {
      allowed: false,
      reason: `The response of ${input.url} carries credentials; the per run cache refuses it because a served copy would bypass the consent the credential represents.`,
    };
  return {
    allowed: true,
    reason: `The response of ${input.url} carries no credential fact; the per run cache may store it inside its run namespace.`,
  };
}

/** Applies the rate limit respect of the 1.1.76 family before a transport call: the directive delay holds the call until the reset window of its origin passes, the wait records itself in the audit trail through the caller, and the gate never drops a call silently — a wait past the reviewed budget refuses loudly instead. */
export function ratelimitrespectgate(input: { waitms: number; origin: string; budget?: number }): policyevaluation {
  if (input.waitms < 0)
    return {
      allowed: false,
      reason: "The rate limit wait never runs negative; a broken directive refuses instead of rushing the call.",
    };
  if (input.budget !== undefined && input.waitms > input.budget)
    return {
      allowed: false,
      reason: `The rate limit wait of ${input.waitms} milliseconds on ${input.origin} exceeds the reviewed wait budget of ${input.budget} milliseconds; review a wider budget or let the window reset.`,
    };
  return {
    allowed: true,
    reason: `The rate limit wait of ${input.waitms} milliseconds on ${input.origin} holds the call until the reset window passes; the wait rides the audit trail.`,
  };
}

/** Keeps the correlation mapping of the 1.1.76 family read only inside the run: the request map assigns, joins and exports through the audit trail and never feeds back into a step, a queue or a verdict. */
export function correlationmappinggate(operation: string): policyevaluation {
  if (operation === "assign" || operation === "join" || operation === "export")
    return {
      allowed: true,
      reason: `The correlation map ${operation} stays read only inside the run; the mapping answers the audit, it never drives a step.`,
    };
  return {
    allowed: false,
    reason: `The ${operation} operation is no correlation mapping pass; the map assigns, joins and exports only.`,
  };
}

/** Exposes the poll timeout and backoff of the 1.1.76 family as the user choices of the settings: both values resolve exactly as configured and an absent value leaves the poll unbounded because the bounds carry no code default. */
export function pollchoices(settings: runsettings | undefined): { timeout?: number; backoff?: number } {
  const timeout = settings?.polltimeout;
  const backoff = settings?.pollbackoff;
  return {
    ...(typeof timeout === "number" && Number.isFinite(timeout) && timeout > 0 ? { timeout } : {}),
    ...(typeof backoff === "number" && Number.isFinite(backoff) && backoff >= 0 ? { backoff } : {}),
  };
}

/** Bounds the open subscriptions of one run by the user choice only: a subscription count past the user configured ceiling refuses until the user raises the ceiling or closes a channel, and an absent ceiling never refuses because the bound carries no code default. */
export function subscriptionboundgate(input: { count: number; limit?: number }): policyevaluation {
  if (input.limit === undefined)
    return {
      allowed: true,
      reason: "The open subscription count stays unbounded because no user ceiling is configured.",
    };
  if (!(input.limit >= 1))
    return {
      allowed: false,
      reason:
        "The subscription ceiling must be a positive count when configured; a broken ceiling refuses instead of guessing.",
    };
  if (input.count > input.limit)
    return {
      allowed: false,
      reason: `The run holds ${input.count} open subscription${input.count === 1 ? "" : "s"} past the user configured ceiling of ${input.limit}; raise the ceiling or close a channel before another subscription opens.`,
    };
  return {
    allowed: true,
    reason: `The run holds ${input.count} open subscription${input.count === 1 ? "" : "s"} inside the user configured ceiling of ${input.limit}.`,
  };
}

/** Marks the observed page api calls of the 1.1.76 family read only: the observation records the endpoints the page called and never replays, refetches or mutates one of them. */
export function apicallgrade(operation: string): policyevaluation {
  if (operation === "observeapicalls" || operation === "apicallrecord")
    return {
      allowed: true,
      reason:
        "The page api call observation stays read only; the recorded endpoints answer the review and never replay.",
    };
  return {
    allowed: false,
    reason: `The ${operation} operation is no page api call observation; the observation grade covers the read only recording only.`,
  };
}

/** Requires the cancellation support of the 1.1.76 family before any transport opens: a subscription without its cancellation path, a poll loop without its stop condition or a channel without its close path refuses before the first byte moves, because a transport that cannot close never opens. */
export function transportcancelgate(input: { kind: string; hascancel: boolean }): policyevaluation {
  if (input.hascancel)
    return {
      allowed: true,
      reason: `The ${input.kind} transport carries its cancellation path; the channel closes cleanly when the step, the run or the killswitch asks.`,
    };
  return {
    allowed: false,
    reason: `The ${input.kind} transport opens no channel without its cancellation path; a transport that cannot close on the step, the run or the killswitch never opens.`,
  };
}

/** Keeps the long poll waits of the 1.1.76 family inside the reviewed wait budget: the poll interval with its timeout retries must fit the reviewed wait window, with no code ceiling on either side. */
export function pollwaitbudgetgate(input: { interval: number; timeout?: number; wait?: number }): policyevaluation {
  if (!(input.interval > 0))
    return { allowed: false, reason: "The reviewed long poll interval must be a positive number of milliseconds." };
  if (input.timeout !== undefined && !(input.timeout >= 0))
    return {
      allowed: false,
      reason: "The reviewed long poll timeout must be zero or a positive number of milliseconds.",
    };
  if (input.wait !== undefined && !(input.wait >= 0))
    return { allowed: false, reason: "The reviewed wait budget must be zero or a positive number of milliseconds." };
  if (input.wait !== undefined && input.interval > input.wait)
    return {
      allowed: false,
      reason: `The long poll interval of ${input.interval} milliseconds exceeds the reviewed wait budget of ${input.wait} milliseconds; review a wider budget or a shorter interval.`,
    };
  const total = input.timeout !== undefined ? input.interval + input.timeout : input.interval;
  if (input.wait !== undefined && total > input.wait)
    return {
      allowed: false,
      reason: `The long poll interval of ${input.interval} milliseconds with its ${input.timeout ?? 0} millisecond timeout exceeds the reviewed wait budget of ${input.wait} milliseconds; review a wider budget or a shorter loop.`,
    };
  return {
    allowed: true,
    reason: `The long poll waits of ${total} milliseconds sit inside the reviewed wait budget${input.wait !== undefined ? ` of ${input.wait} milliseconds` : ""}.`,
  };
}

/** Requires the user consent for the configured vision model endpoint of the 1.1.77 family: the model and the endpoint stay user configured values, the endpoint origin must parse and sit inside the session grants before any frame leaves the device, and an unconfigured model or endpoint refuses loudly because no recognition ships inside the extension. */
export function visiongate(input: { endpoint: string; model: string; granted: string[] }): policyevaluation {
  if (input.model.trim() === "")
    return {
      allowed: false,
      reason:
        "The vision model stays unconfigured; no recognition or description ships inside the extension, so the model call refuses until the user configures one.",
    };
  if (input.endpoint.trim() === "")
    return {
      allowed: false,
      reason:
        "The vision model endpoint stays unconfigured; the model call refuses until the user names the endpoint its frames may travel to.",
    };
  try {
    const origin = new URL(input.endpoint).origin;
    const covered = input.granted.some((pattern) => {
      try {
        return origin === new URL(pattern).origin;
      } catch {
        return false;
      }
    });
    if (!covered)
      return {
        allowed: false,
        reason: `The vision model endpoint of ${origin} sits outside the session grants; the frames never leave the device for an endpoint the review did not grant.`,
      };
    return {
      allowed: true,
      reason: `The configured vision model ${input.model.trim()} of ${origin} sits inside the session grants; the frames travel only to the endpoint the user configured.`,
    };
  } catch {
    return {
      allowed: false,
      reason: `The vision model endpoint ${input.endpoint} does not parse; an unparseable endpoint carries no frame.`,
    };
  }
}

/** Marks the ocr passes of the 1.1.77 family read only: imageocr, regionocr, pdfocr and frameocr read pixels and never write the page, so the recognition grades beside the read only observations while the visionshot description rides its own consent gate. */
export function ocrgate(kind: string): policyevaluation {
  if (kind === "imageocr" || kind === "regionocr" || kind === "pdfocr" || kind === "frameocr")
    return {
      allowed: true,
      reason: `The ${kind} pass reads pixels read only; the recognition never writes the page or sends a frame on its own.`,
    };
  return {
    allowed: false,
    reason: `The ${kind} operation is no ocr pass of the vision family; the read only grade covers imageocr, regionocr, pdfocr and frameocr only.`,
  };
}

/** Refuses the external share of an unredacted screenshot of the 1.1.77 family: a capture that leaves the device — the clipboard, a download or an export — carries its reviewed redactionmask first, because a share that promises nothing masks nothing and leaks what the surface saw. */
export function redactgate(input: { redacted: boolean; destination: string }): policyevaluation {
  const external =
    input.destination === "clipboard" || input.destination === "download" || input.destination === "export";
  if (!external)
    return {
      allowed: true,
      reason: `The ${input.destination} destination keeps the capture inside the session; no external share needs a redaction mask.`,
    };
  if (!input.redacted)
    return {
      allowed: false,
      reason: `The share to ${input.destination} carries no reviewed redaction mask; an unredacted screenshot never leaves the device.`,
    };
  return {
    allowed: true,
    reason: `The share to ${input.destination} carries its reviewed redaction mask; the masked regions never reach the shared bytes.`,
  };
}

/** Marks the grounding pass of the 1.1.77 family as a read only observation: groundshot maps description labels to page selectors and never clicks, writes or scrolls anything, so the grounding answers the review instead of acting on the page. */
export function groundgate(operation: string): policyevaluation {
  if (operation === "groundshot" || operation === "groundingrecord")
    return {
      allowed: true,
      reason: `The ${operation} pass grounds description labels into read only page selectors; the grounding observes and never acts.`,
    };
  return {
    allowed: false,
    reason: `The ${operation} operation is no grounding pass; the read only grade covers the groundshot mapping and its records only.`,
  };
}

/** Keeps the dom snapshots of the 1.1.77 family pairs inside the session boundary: a screenshotpair binds the image and the dom snapshot of the same run, and a snapshot of another run never pairs because two runs never share a dom snapshot. */
export function pairgate(input: { snapshot: { runid: string }; runid: string }): policyevaluation {
  if (input.runid.trim() === "")
    return { allowed: false, reason: "The pair names its run; an unnamespaced pair answers no run." };
  if (input.snapshot.runid !== input.runid)
    return {
      allowed: false,
      reason: `The dom snapshot of the run ${input.snapshot.runid} never pairs with the image of the run ${input.runid}; the pair stays inside the session boundary.`,
    };
  return {
    allowed: true,
    reason: `The dom snapshot and the image both belong to the run ${input.runid}; the pair stays inside the session boundary.`,
  };
}

/** Exposes the vision model and endpoint of the 1.1.77 family as the user choices of the settings: both values resolve exactly as configured and an absent value leaves the model calls refused because no recognition ships inside the extension with a code default. */
export function visionchoices(settings: runsettings | undefined): { model?: string; endpoint?: string } {
  const model = settings?.visionmodel;
  const endpoint = settings?.visionendpoint;
  return {
    ...(typeof model === "string" && model.trim() !== "" ? { model: model.trim() } : {}),
    ...(typeof endpoint === "string" && endpoint.trim() !== "" ? { endpoint: endpoint.trim() } : {}),
  };
}

/** Keeps the vision cost reporting of the 1.1.77 family local through the costshare ledger: the visioncost count reads the calls of the run and never ships a metric anywhere, because the cost ledger answers the user alone. */
export function visioncostgrade(operation: string): policyevaluation {
  if (operation === "visioncost" || operation === "costshare")
    return {
      allowed: true,
      reason: `The ${operation} reporting stays local and read only; the vision cost ledger answers the user and ships nowhere.`,
    };
  return {
    allowed: false,
    reason: `The ${operation} operation is no vision cost pass; the local grade covers the visioncost count and its costshare entries only.`,
  };
}

/** Requires the explicit user consent before frames of the 1.1.77 family leave the device: a video frame or a screenshot that travels to the vision model endpoint needs the consent recorded, because a frame the user never approved leaving never leaves. */
export function visionconsentgate(input: { frames: boolean; consented: boolean }): policyevaluation {
  if (!input.frames) return { allowed: true, reason: "No frame leaves the device; the local pass needs no consent." };
  if (!input.consented)
    return {
      allowed: false,
      reason:
        "The frames would leave the device without the recorded user consent; the vision pass refuses instead of shipping pixels the user never approved.",
    };
  return {
    allowed: true,
    reason:
      "The recorded user consent covers the frames leaving the device; the pass rides the configured endpoint only.",
  };
}

/** Marks the visionshot payloads of the 1.1.77 family as sensitive in the audit trail: the image and the description text of a model call stay out of the audit summaries, because a sensitive payload records its provenance and its shape, never its content. */
export function visionsensitivegrade(operation: string): policyevaluation {
  if (operation === "visionshot" || operation === "visionpayload")
    return {
      allowed: true,
      reason: `The ${operation} payload grades sensitive; the audit trail records the call and its provenance while the image bytes and the description text never ride the summaries.`,
    };
  return {
    allowed: false,
    reason: `The ${operation} operation carries no vision payload; the sensitive grade covers the visionshot model calls only.`,
  };
}

/** Validates one ocr region of the 1.1.77 family against the viewport bounds: the geometry stays finite and positive, and a region drawn past the viewport edges names the clamped part it reads while a region fully outside refuses loudly instead of reading wrong pixels. */
export function regionboundsgate(input: {
  region: ocrregion;
  viewport: { width: number; height: number };
}): policyevaluation {
  for (const value of [input.region.x, input.region.y, input.region.width, input.region.height]) {
    if (!Number.isFinite(value) || value < 0)
      return {
        allowed: false,
        reason: `The ocrregion needs finite, non-negative geometry in css pixels; the region read refuses broken numbers.`,
      };
  }
  if (input.region.width <= 0 || input.region.height <= 0)
    return {
      allowed: false,
      reason: "The ocrregion needs a positive width and height so the recognition reads a real area.",
    };
  if (input.region.x >= input.viewport.width || input.region.y >= input.viewport.height)
    return {
      allowed: false,
      reason: `The ocrregion of x ${input.region.x}, y ${input.region.y} starts past the ${input.viewport.width} by ${input.viewport.height} viewport; the region read refuses wrong pixels.`,
    };
  if (
    input.region.x + input.region.width > input.viewport.width ||
    input.region.y + input.region.height > input.viewport.height
  )
    return {
      allowed: true,
      reason: `The ocrregion crosses the ${input.viewport.width} by ${input.viewport.height} viewport edge; the read clamps to the visible part and names the crossing.`,
    };
  return {
    allowed: true,
    reason: `The ocrregion sits inside the ${input.viewport.width} by ${input.viewport.height} viewport; the recognition reads exactly the reviewed rectangle.`,
  };
}

/** Keeps the frameocr waits of the 1.1.77 family inside the reviewed wait budget: the video seek and pause wait must fit the user configured visionwaitbudget window, with no code ceiling on either side because an absent budget never refuses. */
export function framebudgetgate(input: { waitms: number; budget?: number }): policyevaluation {
  if (!(input.waitms >= 0))
    return {
      allowed: false,
      reason: "The frameocr wait never runs negative; a broken seek refuses instead of rushing the frame.",
    };
  if (input.budget !== undefined && input.waitms > input.budget)
    return {
      allowed: false,
      reason: `The frameocr wait of ${input.waitms} milliseconds exceeds the reviewed wait budget of ${input.budget} milliseconds; review a wider budget or a nearer position.`,
    };
  return {
    allowed: true,
    reason: `The frameocr wait of ${input.waitms} milliseconds sits inside the reviewed wait budget${input.budget !== undefined ? ` of ${input.budget} milliseconds` : ""}.`,
  };
}

/** Ties the visioncache expiry of the 1.1.77 family to the user retention choice: an entry older than the user configured visioncacheretention window expires at the cleanup pass while an absent window keeps every entry forever, because the expiry bound carries no code default. */
export function visioncacheexpirygate(input: { entryat: number; now: number; retention?: number }): policyevaluation {
  if (input.retention === undefined)
    return {
      allowed: true,
      reason: "The visioncache entry stays forever because no user retention window is configured.",
    };
  if (!(input.retention >= 0))
    return {
      allowed: false,
      reason:
        "The visioncache retention must be zero or a positive number of milliseconds when configured; a broken window refuses instead of guessing.",
    };
  if (input.now - input.entryat >= input.retention)
    return {
      allowed: false,
      reason: `The visioncache entry of ${new Date(input.entryat).toISOString()} aged past the user retention window of ${input.retention} milliseconds; the pass expires it.`,
    };
  return {
    allowed: true,
    reason: `The visioncache entry sits inside the user retention window of ${input.retention} milliseconds; the pass keeps it serving.`,
  };
}

/** Keeps the forensic capture of the 1.1.78 family inside the reviewed plan scope: a beforeafter pair, a diff baseline or a lapse frame names the run of its plan, because forensic evidence of another run never answers this plan's review. */
export function forensicscopegate(input: { record: { runid: string }; runid: string }): policyevaluation {
  if (input.runid.trim() === "")
    return { allowed: false, reason: "The forensic record names its run; an unnamespaced record answers no review." };
  if (input.record.runid !== input.runid)
    return {
      allowed: false,
      reason: `The forensic record of the run ${input.record.runid} never joins the run ${input.runid}; the capture forensics stay inside the reviewed plan scope.`,
    };
  return {
    allowed: true,
    reason: `The forensic record belongs to the run ${input.runid}; the capture forensics stay inside the reviewed plan scope.`,
  };
}

/** Marks the forensic observation passes of the 1.1.78 family read only: beforeafter, consoletimeline and nettimeline record what the page and the run already showed — the pairs grab pixels, the console timeline reads the consented console capture and the net timeline reads the correlation map — and none of them writes the page or issues a request of its own. */
export function forensicsreadonlygate(operation: string): policyevaluation {
  if (
    operation === "beforeafter" ||
    operation === "consoletimeline" ||
    operation === "nettimeline" ||
    operation === "thumbshot" ||
    operation === "namecaptures"
  )
    return {
      allowed: true,
      reason: `The ${operation} pass records what the run already showed read only; the forensic observation never writes the page or issues a request of its own.`,
    };
  return {
    allowed: false,
    reason: `The ${operation} operation is no forensic observation pass; the read only grade covers beforeafter, consoletimeline, nettimeline, thumbshot and namecaptures only.`,
  };
}

/** Requires the user confirmation before a diff baseline of the 1.1.78 family changes: a baseline the review never confirmed flags no regression honestly, because the compared page state must answer the baseline the user froze. */
export function diffbasegate(input: { confirmed: boolean; pagestate: string }): policyevaluation {
  if (!input.confirmed)
    return {
      allowed: false,
      reason: `The diff baseline for the page state ${input.pagestate} waits for the user confirmation; a baseline the review never saw flags nothing honestly.`,
    };
  return {
    allowed: true,
    reason: `The user confirmed the diff baseline for the page state ${input.pagestate}; the frozen capture answers the review.`,
  };
}

/** Requires the explicit user start before a timelapse of the 1.1.78 family runs: a lapse captures the page on its interval, so a capture cadence the user never started never starts. */
export function timelapsegate(input: { userstarted: boolean; interval?: number }): policyevaluation {
  if (!input.userstarted)
    return {
      allowed: false,
      reason:
        "The timelapse waits for the explicit user start; a capture cadence the review never started never starts.",
    };
  if (input.interval !== undefined && !(input.interval > 0))
    return {
      allowed: false,
      reason:
        "The timelapse interval stays a positive number of milliseconds the user chose; the interval carries no code floor.",
    };
  return {
    allowed: true,
    reason: `The user started the timelapse${input.interval !== undefined ? ` on the ${input.interval} millisecond interval` : ""}; the lapse captures on the reviewed cadence only.`,
  };
}

/** Requires the explicit user action before a capture bundle of the 1.1.78 family exports, with the redactshot masks applied and the provlog provenance of every capture aboard: an export nobody asked for, an unmasked capture or a capture without provenance never leaves the device. */
export function captureexportgate(input: {
  useraction: boolean;
  redacted: boolean;
  provenance: boolean;
  captures: number;
}): policyevaluation {
  if (!input.useraction)
    return {
      allowed: false,
      reason:
        "The capture bundle waits for the explicit user action; an export nobody asked for never leaves the device.",
    };
  if (!input.redacted)
    return {
      allowed: false,
      reason: `The capture bundle of ${input.captures} capture${input.captures === 1 ? "" : "s"} carries no redactshot mask review; an unmasked capture never exports.`,
    };
  if (!input.provenance)
    return {
      allowed: false,
      reason: `The capture bundle of ${input.captures} capture${input.captures === 1 ? "" : "s"} carries no provlog provenance entries; an export payload without provenance never leaves the device.`,
    };
  return {
    allowed: true,
    reason: `The user asked for the capture bundle of ${input.captures} capture${input.captures === 1 ? "" : "s"} with its redaction masks and its provlog provenance; the bundle exports through the reviewed download flow.`,
  };
}

/** Excludes the page secrets from the console capture of the 1.1.78 family: the console text the forensic timeline stores runs through the masking rules first, because a console line that carries a secret shaped value leaks it into the evidence. */
export function consolemaskgate(input: { masked: boolean }): policyevaluation {
  if (!input.masked)
    return {
      allowed: false,
      reason:
        "The console timeline stores its text through the masking rules first; an unmasked console line never enters the forensic evidence.",
    };
  return {
    allowed: true,
    reason:
      "The console timeline stores its masked text only; the secret shaped values never enter the forensic evidence.",
  };
}

/** Keeps the net timeline of the 1.1.78 family inside the origin grants of the session: a traced url of an origin the review never granted never enters the forensic net timeline. */
export function nettraceorigingate(input: { url: string; granted: string[] }): policyevaluation {
  try {
    const origin = new URL(input.url).origin;
    const covered = input.granted.some((pattern) => {
      try {
        return origin === new URL(pattern).origin;
      } catch {
        return false;
      }
    });
    if (!covered)
      return {
        allowed: false,
        reason: `The traced url of ${origin} sits outside the session grants; the net timeline never widens the origin grants.`,
      };
    return {
      allowed: true,
      reason: `The traced url of ${origin} sits inside the session grants; the net timeline records it read only.`,
    };
  } catch {
    return {
      allowed: false,
      reason: `The traced url ${input.url} does not parse; an unparseable url carries no trace.`,
    };
  }
}

/** Keeps the capture retention of the 1.1.78 family a user choice without a forced purge: an absent forensicretention window keeps every pair, timeline entry, diff, thumbnail and lapse frame for the audit trail, and a configured window expires the records only through the user cleanup pass — never through a silent sweep of its own. */
export function captureretentiongrade(input: { retention?: number; pruned: number }): policyevaluation {
  if (input.retention === undefined)
    return {
      allowed: true,
      reason: `The forensic retention stays unconfigured so every record survives; the pass pruned ${input.pruned} record${input.pruned === 1 ? "" : "s"} only because the user asked for the cleanup.`,
    };
  if (!(input.retention >= 1))
    return {
      allowed: false,
      reason:
        "The forensic retention stays a positive whole number of records when configured; a broken window refuses instead of guessing.",
    };
  return {
    allowed: true,
    reason: `The forensic retention window of ${input.retention} record${input.retention === 1 ? "" : "s"} answered the user cleanup pass that pruned ${input.pruned} record${input.pruned === 1 ? "" : "s"}; no silent sweep ever prunes on its own.`,
  };
}

/** Keeps the thumbnail edge of the 1.1.78 family a user setting: the thumbshot sizing reads the user configured edge and an absent edge keeps every thumbnail at its capture size, because the bound never defaults in code. */
export function thumbnailsizereadonlygrade(input: { edge?: number }): policyevaluation {
  if (input.edge === undefined)
    return {
      allowed: true,
      reason:
        "The thumbnail edge stays unconfigured so every thumbnail keeps its capture size; the bound never defaults in code.",
    };
  if (!(input.edge >= 1))
    return {
      allowed: false,
      reason:
        "The thumbnail edge stays a positive number of pixels when configured; a broken edge refuses instead of guessing.",
    };
  return {
    allowed: true,
    reason: `The thumbnail edge of ${input.edge} pixels stays the user's choice; the thumbshot scales inside the reviewed bound only.`,
  };
}

/** Keeps the diff threshold of the 1.1.78 family a user setting: the regression flag answers the user configured similarity threshold and an absent threshold never flags, because the bound never defaults in code. */
export function diffthresholdgrade(input: { threshold?: number }): policyevaluation {
  if (input.threshold === undefined)
    return {
      allowed: true,
      reason:
        "The diff threshold stays unconfigured so no regression flags on its own; the bound never defaults in code.",
    };
  if (!(input.threshold >= 0 && input.threshold <= 1))
    return {
      allowed: false,
      reason:
        "The diff threshold stays a similarity score between zero and one when configured; a broken threshold refuses instead of guessing.",
    };
  return {
    allowed: true,
    reason: `The diff threshold of ${input.threshold} stays the user's choice; the regression flag answers the reviewed bound only.`,
  };
}

/** Keeps the timelapse interval of the 1.1.78 family a user setting without a hard floor: the lapse reads the user configured interval, an absent interval leaves every capture to the explicit user start, and no code floor ever invents a cadence the review never chose. */
export function timelapseintervalgrade(input: { interval?: number }): policyevaluation {
  if (input.interval === undefined)
    return {
      allowed: true,
      reason:
        "The timelapse interval stays unconfigured so the lapse waits for the explicit user start; the interval carries no code floor.",
    };
  if (!(input.interval > 0))
    return {
      allowed: false,
      reason:
        "The timelapse interval stays a positive number of milliseconds when configured; a broken interval refuses instead of guessing.",
    };
  return {
    allowed: true,
    reason: `The timelapse interval of ${input.interval} milliseconds stays the user's choice; the lapse captures on the reviewed cadence only.`,
  };
}

/** Exposes the forensic choices of the 1.1.78 family as the user settings they are: the diff threshold, the timelapse interval, the thumbnail edge and the forensic retention resolve exactly as configured while an absent value never hides a code default. */
export function forensicchoices(settings: runsettings | undefined): {
  diffthreshold?: number;
  timelapseinterval?: number;
  thumbnailedge?: number;
  forensicretention?: number;
} {
  const diffthreshold = settings?.diffthreshold;
  const timelapseinterval = settings?.timelapseinterval;
  const thumbnailedge = settings?.thumbnailedge;
  const forensicretention = settings?.forensicretention;
  return {
    ...(typeof diffthreshold === "number" && Number.isFinite(diffthreshold) ? { diffthreshold } : {}),
    ...(typeof timelapseinterval === "number" && Number.isFinite(timelapseinterval) && timelapseinterval > 0
      ? { timelapseinterval }
      : {}),
    ...(typeof thumbnailedge === "number" && Number.isFinite(thumbnailedge) && thumbnailedge >= 1
      ? { thumbnailedge }
      : {}),
    ...(typeof forensicretention === "number" && Number.isInteger(forensicretention) && forensicretention >= 1
      ? { forensicretention }
      : {}),
  };
}

/** Refuses any outbound payload of the 1.1.79 family that carries a local rule field: a field the user marked local never leaves the device for any transport — the request body, the sync payload or the export — because the local first rule blocks the field at every boundary. */
export function localgate(input: { payload: Record<string, unknown>; rules: localrule[] }): policyevaluation {
  const keys = Object.keys(input.payload).map((key) => key.trim().toLowerCase());
  const carried = input.rules
    .flatMap((rule) => rule.fields.map((field) => field.trim().toLowerCase()))
    .filter((field) => field !== "" && keys.includes(field));
  if (carried.length > 0)
    return {
      allowed: false,
      reason: `The outbound payload carries the local rule field${carried.length === 1 ? "" : "s"} ${carried.join(", ")}; a field marked local never leaves the device.`,
    };
  return {
    allowed: true,
    reason: "The outbound payload carries no local rule field; every field marked local stayed on the device.",
  };
}

/** Requires the opt in flag before any sync transport of the 1.1.79 family fires: the data class the payload carries must sit among the enabled classes of the user's sync settings, because a sync nobody turned on never transports. */
export function syncgate(input: { settings?: syncsettings; dataclass: string }): policyevaluation {
  const enabled = input.settings?.enabled ?? [];
  if (enabled.length === 0)
    return {
      allowed: false,
      reason: "The sync stays off until the user opts in per data class; a sync nobody turned on never transports.",
    };
  if (!enabled.some((item) => item.toLowerCase() === input.dataclass.toLowerCase()))
    return {
      allowed: false,
      reason: `The ${input.dataclass} data class never entered the sync opt in; an unconsented class never leaves the device.`,
    };
  return {
    allowed: true,
    reason: `The ${input.dataclass} data class sits among the opted in classes with its consent stamp; the sync transports only what the user enabled.`,
  };
}

/** Refuses plaintext sync payloads of the 1.1.79 family: every payload the transport carries encrypts first and stamps its format tag, because a sync that ships readable bytes ships what the user meant to keep private. */
export function encryptsyncgate(input: { encrypted: boolean; formattag?: string }): policyevaluation {
  if (!input.encrypted)
    return {
      allowed: false,
      reason: "The sync payload ships plaintext; every payload encrypts with the user passphrase before the transport.",
    };
  if (input.formattag === undefined || input.formattag.trim() === "")
    return {
      allowed: false,
      reason:
        "The sync payload carries no format version tag; an envelope that cannot name its format answers no decoder.",
    };
  return {
    allowed: true,
    reason: `The sync payload encrypts under the ${input.formattag} format tag; the transport carries cipher text only.`,
  };
}

/** Requires the typed confirmation before the full purge scope of the 1.1.79 family runs: the exact phrase the user configured answers the request, because a purge nobody typed out never deletes a stored key. */
export function purgegate(input: { scope: string[]; confirmation: string; typed: string }): policyevaluation {
  const scope = input.scope.map((item) => item.trim().toLowerCase()).filter((item) => item !== "");
  if (scope.length === 0)
    return { allowed: false, reason: "The purge names its scope; a purge without a scope deletes nothing." };
  const full =
    scope.includes("all") ||
    (scope.includes("runs") &&
      scope.includes("memory") &&
      scope.includes("captures") &&
      scope.includes("settings") &&
      scope.includes("provenance"));
  if (!full)
    return {
      allowed: true,
      reason: `The partial purge of the ${scope.join(", ")} scope runs on the user request; the immutable audit hashes survive every scope.`,
    };
  if (input.typed.trim() !== input.confirmation)
    return {
      allowed: false,
      reason: "The full scope purge needs the typed confirmation phrase; a purge nobody typed out never runs.",
    };
  return {
    allowed: true,
    reason:
      "The user typed the confirmation phrase so the full scope purge runs; the immutable audit hashes still survive.",
  };
}

/** Marks the exportall bundle of the 1.1.79 family an explicit user action: a bundle nobody asked for never assembles, because every stored record leaving the device answers a request the review saw. */
export function exportallgate(input: { useraction: boolean; records: number }): policyevaluation {
  if (!input.useraction)
    return {
      allowed: false,
      reason:
        "The exportall bundle waits for the explicit user action; a bundle nobody asked for never leaves the device.",
    };
  if (input.records <= 0)
    return {
      allowed: false,
      reason: "The exportall bundle carries stored records; a device holding nothing exports nothing.",
    };
  return {
    allowed: true,
    reason: `The user asked for the exportall bundle of ${input.records} record${input.records === 1 ? "" : "s"}; the bundle streams through the reviewed download flow without a size cap.`,
  };
}

/** Binds every cookie access of the 1.1.79 family to the run jar: the session names the jar the run owns, a sealed jar refuses every write because a completed run never changes its cookie state, and a session without a jar stays outside the cookie isolation. */
export function jargate(input: {
  jarid?: string;
  jar?: { jarid: string; runid: string; sealed: boolean };
  runid: string;
  operation: "read" | "write";
}): policyevaluation {
  if (input.jarid === undefined)
    return {
      allowed: false,
      reason:
        "The cookie access needs the session jar; a session without a jar never touches the cookie state of a run.",
    };
  if (input.jar === undefined)
    return {
      allowed: false,
      reason: `No cookie jar matches the jar id ${input.jarid}; the cookie access stays bound to the jar the run owns.`,
    };
  if (input.jar.runid !== input.runid)
    return {
      allowed: false,
      reason: `The jar ${input.jar.jarid} of the run ${input.jar.runid} never joins the run ${input.runid}; one task run never shares its cookie state with another.`,
    };
  if (input.operation === "write" && input.jar.sealed)
    return {
      allowed: false,
      reason: `The jar ${input.jar.jarid} sealed at the run completion; a sealed jar refuses every write.`,
    };
  return {
    allowed: true,
    reason: `The ${input.operation} stays scoped to the jar ${input.jar.jarid} of the run ${input.runid}${input.jar.sealed ? " while the sealed state refuses writes" : ""}.`,
  };
}

/** Never deletes the audit history of the 1.1.79 family without the user consent: the immutable log hashes survive every cleanup and purge pass, and a pass that would touch the audit trail refuses here. */
export function cleanupgate(input: { touchesaudit: boolean; consent: boolean }): policyevaluation {
  if (input.touchesaudit && !input.consent)
    return {
      allowed: false,
      reason:
        "The cleanup would touch the audit history; the immutable log hashes survive every pass without the explicit user consent.",
    };
  if (input.touchesaudit)
    return {
      allowed: true,
      reason: "The user consented to the audit touching cleanup; the immutable log hashes still verify after the pass.",
    };
  return {
    allowed: true,
    reason: "The cleanup touches no audit history; the immutable log hashes survive every pass.",
  };
}

/** Blocks opening a quarantined file of the 1.1.79 family until the scanner verdict arrives: only a clean verdict releases, a flagged verdict deletes, and a pending or error verdict holds the file in the sandbox folder. */
export function quarantineopengate(input: { verdict: scanverdict }): policyevaluation {
  if (input.verdict === "clean")
    return {
      allowed: true,
      reason: "The scanner verdict read clean; the quarantined file releases from the sandbox folder.",
    };
  if (input.verdict === "flagged")
    return {
      allowed: false,
      reason: "The scanner verdict read flagged; the quarantined file deletes and never opens.",
    };
  return {
    allowed: false,
    reason: `The scanner verdict reads ${input.verdict}; a file without a clean verdict never opens.`,
  };
}

/** Keeps the scanner hooks of the 1.1.79 family on user configured endpoints: a verdict only records through a hook the user configured and granted, because a scanner endpoint the review never saw never receives a file path. */
export function scannerhookgate(input: {
  hook?: { scanner: string; endpoint: string; origin: string };
  granted: boolean;
}): policyevaluation {
  if (input.hook === undefined)
    return {
      allowed: false,
      reason:
        "The quarantine scan needs the user configured scanner hook; an unconfigured scanner keeps the verdict pending and the file held.",
    };
  if (!input.granted)
    return {
      allowed: false,
      reason: `The scanner hook ${input.hook.scanner} of ${input.hook.origin} holds no origin grant; the verdict stays pending and the file held.`,
    };
  return {
    allowed: true,
    reason: `The scanner hook ${input.hook.scanner} of ${input.hook.origin} sits configured and granted; the verdict records through the user endpoint only.`,
  };
}

/** Holds the notelemetry invariant of the 1.1.79 family: the outbound usage call count reads zero in every context, because every counter keeps living inside the local memory and the worker issues no telemetry request at all. */
export function notelemetryinvariant(input: { outboundcalls: number }): policyevaluation {
  if (input.outboundcalls > 0)
    return {
      allowed: false,
      reason: `The worker issued ${input.outboundcalls} outbound usage call${input.outboundcalls === 1 ? "" : "s"}; the telemetry stays off so every counter keeps living inside the local memory.`,
    };
  return {
    allowed: true,
    reason:
      "The worker issued no outbound usage call; the telemetry stays off and every counter keeps living inside the local memory.",
  };
}

/** Strips the extract fields of the 1.1.79 family to the reviewed set: every field the extraction carries answers a field the plan review listed, and the localfirst pass removed the rest before anything leaves the page boundary. */
export function minimizationstripgrade(input: { fields: string[]; reviewed: string[] }): policyevaluation {
  const reviewed = new Set(input.reviewed.map((field) => field.trim().toLowerCase()).filter((field) => field !== ""));
  const outside = input.fields
    .map((field) => field.trim().toLowerCase())
    .filter((field) => field !== "" && !reviewed.has(field));
  if (outside.length > 0)
    return {
      allowed: false,
      reason: `The extraction carries ${outside.length} field${outside.length === 1 ? "" : "s"} outside the reviewed set: ${outside.join(", ")}; the localfirst pass strips them before any export.`,
    };
  return {
    allowed: true,
    reason: `Every field of the extraction sits inside the reviewed set of ${reviewed.size} field${reviewed.size === 1 ? "" : "s"}; the minimization strips nothing further.`,
  };
}

/** Exposes the minimization choices of the 1.1.79 family as the user settings they are: the sync cadence, the cleanup delay and the jar expiry resolve exactly as configured while an absent value never hides a code default. */
export function minimizationchoices(settings: runsettings | undefined): {
  synccadence?: number;
  cleanupdelay?: number;
  jarexpiry?: number;
} {
  const synccadence = settings?.synccadence;
  const cleanupdelay = settings?.cleanupdelay;
  const jarexpiry = settings?.jarexpiry;
  return {
    ...(typeof synccadence === "number" && Number.isFinite(synccadence) && synccadence > 0 ? { synccadence } : {}),
    ...(typeof cleanupdelay === "number" && Number.isFinite(cleanupdelay) && cleanupdelay > 0 ? { cleanupdelay } : {}),
    ...(typeof jarexpiry === "number" && Number.isFinite(jarexpiry) && jarexpiry > 0 ? { jarexpiry } : {}),
  };
}

/** Validates one css selector against the reviewed selector grammar the extension and planlint share: the type, id, class, attribute and pseudo class compounds join through the descendant, child, adjacent and sibling combinators while empty selectors, template placeholders, the unreviewed functional pseudo classes and overlong compounds refuse. */
export function cssselectorvalid(selector: string): policyevaluation {
  const trimmed = selector.trim();
  if (trimmed === "")
    return { allowed: false, reason: "The selector is empty; a step that addresses the page names its selector." };
  if (/\{\{[^{}]*\}\}/.test(trimmed) || /\$\{[^{}]*\}/.test(trimmed))
    return {
      allowed: false,
      reason: `The selector ${trimmed} carries a template placeholder; a templated selector resolves only against the live page of the run, never statically.`,
    };
  const tokens = trimmed
    .replace(/\s+/g, " ")
    .replace(/([>+~])/g, " $1 ")
    .split(/\s+/)
    .filter((token) => token !== "");
  for (const token of tokens) {
    if (token === ">" || token === "+" || token === "~") continue;
    if (token.length > 512)
      return {
        allowed: false,
        reason: `The selector compound ${token.slice(0, 32)}... runs past the reviewed length; a selector names one region of the page.`,
      };
    if (!compoundconsumes(token))
      return {
        allowed: false,
        reason: `The selector ${trimmed} stays outside the reviewed grammar of types, ids, classes, attributes and their combinators.`,
      };
    if (/::?(?:has|is|where|matches|any)\(/.test(token))
      return {
        allowed: false,
        reason: `The selector ${trimmed} carries the unreviewed functional pseudo class ${token}; the reviewed grammar keeps the simple structural pseudo classes only.`,
      };
  }
  return {
    allowed: true,
    reason: `The selector ${trimmed} stays inside the reviewed grammar the live resolution and the plan lint share.`,
  };
}

/** Consumes one css selector compound piece by piece through a plain character walk — the optional leading type or universal star, then the id, class, attribute and pseudo pieces — and reports whether the walk reaches the end of the token, because a starred alternation over the grammar would itself backtrack polynomially on adversarial compounds. */
function compoundconsumes(token: string): boolean {
  let index = 0;
  const first = token.charCodeAt(0);
  if (first === 42) index = 1; /* the universal star */
  else if (first >= 97 && first <= 122) {
    /* the type: one lowercase letter then lowercase alphanumerics and hyphens */
    index = 1;
    while (index < token.length) {
      const code = token.charCodeAt(index);
      if (!((code >= 97 && code <= 122) || (code >= 48 && code <= 57) || code === 45)) break;
      index += 1;
    }
  }
  while (index < token.length) {
    const char = token[index] ?? "";
    if (char === "#" || char === ".") {
      const start = index + 1;
      const code = token.charCodeAt(start);
      if (!((code >= 97 && code <= 122) || (code >= 65 && code <= 90) || code === 95))
        return false; /* one id or class head character */
      let end = start + 1;
      while (end < token.length) {
        const c = token.charCodeAt(end);
        if (!((c >= 97 && c <= 122) || (c >= 65 && c <= 90) || (c >= 48 && c <= 57) || c === 95 || c === 45)) break;
        end += 1;
      }
      index = end;
      continue;
    }
    if (char === "[") {
      const close = token.indexOf("]", index + 1);
      if (close === -1 || close === index + 1)
        return false; /* the attribute needs its closing bracket and at least one inner character */
      index = close + 1;
      continue;
    }
    if (char === ":") {
      let cursor = index + 1;
      if (token[cursor] === ":") cursor += 1; /* one or two colons */
      let letters = 0;
      while (cursor < token.length) {
        const code = token.charCodeAt(cursor);
        if (!((code >= 97 && code <= 122) || (code >= 65 && code <= 90) || code === 45)) break;
        letters += 1;
        cursor += 1;
      }
      if (letters === 0) return false;
      if (token[cursor] === "(") {
        const close = token.indexOf(")", cursor + 1);
        if (close === -1) return false;
        if (token.indexOf("(", cursor + 1) !== -1 && token.indexOf("(", cursor + 1) < close)
          return false; /* the pseudo argument stays one plain parenthesized run */
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

/** Reads the option fields a kind strictly requires, from the same reviewed grammar the executor validates: the lint reports a step whose options payload misses them before any run starts, and the executor refuses the same step at run time. */
export function kindoptionfields(kind: string): string[] {
  const required: Record<string, string[]> = {
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
    trycatch: ["try"],
  };
  return required[kind] ?? [];
}

/** Gates one headless fixture step of the 1.1.80 family: the kind needs its fixture scoped grant, the origin needs the fixture origin and the risk needs the read only vocabulary a recorded page state satisfies, so the consent gates hold against fixtures exactly as they hold against a live tab. */
export function fixtureconsentgate(input: {
  fixtureorigin: string;
  grants: string[];
  kind: string;
  riskof: (kind: string) => "read" | "interaction" | "sensitive";
}): policyevaluation {
  if (!input.grants.includes(input.kind))
    return {
      allowed: false,
      reason: `The kind ${input.kind} stays outside the fixture grants ${input.grants.join(", ") || "(none)"}; the recorded page state grants only the kinds its review listed.`,
    };
  let risk: "read" | "interaction" | "sensitive";
  try {
    risk = input.riskof(input.kind);
  } catch {
    return {
      allowed: false,
      reason: `The kind ${input.kind} is not a reviewed action kind; the fixture replays only the reviewed vocabulary.`,
    };
  }
  if (risk !== "read")
    return {
      allowed: false,
      reason: `The kind ${input.kind} grades ${risk} and needs a live tab; a recorded page state satisfies only the read only vocabulary.`,
    };
  return {
    allowed: true,
    reason: `The kind ${input.kind} stays read only inside the fixture grants of ${input.fixtureorigin}; the headless replay runs it against the recorded state.`,
  };
}

/** Gates the relay server url of the 1.1.82 site integration family: an empty url stays allowed because it disables the bridge completely, a wss url of any host the user chose stays allowed without vendor assumptions, a plain ws url stays allowed only on the localhost hosts of local bridge testing, and every other scheme, a missing host or a broken port shape refuses before the url saves. */
export function serverurlgate(url: string): policyevaluation {
  const trimmed = url.trim();
  if (trimmed === "")
    return {
      allowed: true,
      reason:
        "The empty relay url disables the site bridge completely; no socket opens and no pairing mints until the user sets one.",
    };
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return {
      allowed: false,
      reason: `The relay url ${trimmed} does not parse as a url; the serverurl setting refuses it before saving.`,
    };
  }
  if (parsed.protocol !== "wss:" && parsed.protocol !== "ws:")
    return {
      allowed: false,
      reason: `The relay url must ride wss; the ${parsed.protocol} url the user typed refuses before saving.`,
    };
  if (
    parsed.protocol === "ws:" &&
    parsed.hostname !== "localhost" &&
    parsed.hostname !== "127.0.0.1" &&
    parsed.hostname !== "[::1]"
  )
    return {
      allowed: false,
      reason: `A plain ws relay url stays reserved for the localhost hosts of local bridge testing; ${parsed.hostname} needs wss.`,
    };
  if (parsed.hostname === "")
    return { allowed: false, reason: "The relay url names its host; a hostless url refuses before saving." };
  if (parsed.port !== "" && !/^\d{1,5}$/.test(parsed.port))
    return {
      allowed: false,
      reason: `The relay url port ${parsed.port} stays numeric or absent; the shape refuses before saving.`,
    };
  return {
    allowed: true,
    reason: `The relay url ${trimmed} carries the ${parsed.protocol} scheme, the host ${parsed.host} and the shape the serverurl setting accepts; the url stays the user's choice with no default anywhere in the code.`,
  };
}

/** Gates the first socket connection of the site bridge: the bridge stays disabled until the user grants the bridge consent, because the first connection to the user configured relay is a consent boundary no code path crosses silently. */
export function bridgeconsentgate(input: { consent?: boolean; connected: boolean }): policyevaluation {
  if (input.connected)
    return {
      allowed: true,
      reason:
        "The bridge socket is already connected; the consent gate passed before the first connection and stays recorded.",
    };
  if (input.consent !== true)
    return {
      allowed: false,
      reason:
        "The site bridge stays disabled until the user consents to the first socket connection; no code path opens the socket without the recorded consent.",
    };
  return {
    allowed: true,
    reason:
      "The user consented to the first socket connection of the site bridge; the connect may open the socket to the user configured relay url.",
  };
}

/** Gates the member shape of one relay session: exactly one extension side and one site side hold a session, so a second member of either role never joins and the relay session stays a two member room. */
export function bridgemembergate(input: { extension: number; site: number }): policyevaluation {
  if (input.extension !== 1)
    return {
      allowed: false,
      reason: `The relay session holds exactly one extension side; ${input.extension} extension member${input.extension === 1 ? "" : "s"} refuse.`,
    };
  if (input.site > 1)
    return {
      allowed: false,
      reason: `The relay session holds at most one site side; ${input.site} site members refuse.`,
    };
  return {
    allowed: true,
    reason: "The relay session holds one extension side and at most one site side; the two member room stays intact.",
  };
}

/** Gates the payload minimization of one bridge frame: a page content key never crosses the bridge without the explicit consent flag, so plan text and statuses stay the default payload and the gate names every held key. */
export function bridgecontentgate(input: {
  payload: Record<string, unknown>;
  pageconsent?: boolean;
}): policyevaluation {
  const held = Object.keys(input.payload).filter((key) => pagecontentkeys.includes(key));
  if (held.length === 0)
    return {
      allowed: true,
      reason: "The bridge payload carries plan text and statuses only; no page content key rides the frame.",
    };
  if (input.pageconsent !== true)
    return {
      allowed: false,
      reason: `The bridge payload holds the page content key${held.length === 1 ? "" : "s"} ${held.join(", ")}; page content never crosses the bridge without the explicit consent flag.`,
    };
  return {
    allowed: true,
    reason: `The user set the explicit page consent flag, so the payload keys ${held.join(", ")} cross the bridge under the recorded consent.`,
  };
}

/** Gates the bridge pairing code lifetime as a user choice: the window stays a positive number of milliseconds because no code default hides inside the gate. */
export function bridgepairingwindowvalid(lifetime: number): policyevaluation {
  if (!Number.isFinite(lifetime) || lifetime <= 0)
    return {
      allowed: false,
      reason: "The bridge pairing lifetime stays a positive number of milliseconds the user chose.",
    };
  return { allowed: true, reason: `The bridge pairing lifetime of ${lifetime} milliseconds stays the user's choice.` };
}

/** Gates the bridge idle window as a user choice: the window stays a positive number of milliseconds because an absent window never expires a session and no code ceiling hides inside the gate. */
export function bridgeidlewindowvalid(window: number): policyevaluation {
  if (!Number.isFinite(window) || window <= 0)
    return { allowed: false, reason: "The bridge idle window stays a positive number of milliseconds the user chose." };
  return { allowed: true, reason: `The bridge idle window of ${window} milliseconds stays the user's choice.` };
}

/** Gates the bridge heartbeat interval as a user choice: the interval stays a positive number of milliseconds because an absent interval sends no heartbeat frames. */
export function bridgeheartbeatvalid(interval: number): policyevaluation {
  if (!Number.isFinite(interval) || interval <= 0)
    return {
      allowed: false,
      reason: "The bridge heartbeat interval stays a positive number of milliseconds the user chose.",
    };
  return {
    allowed: true,
    reason: `The bridge heartbeat interval of ${interval} milliseconds stays the user's choice.`,
  };
}

/** Gates the bridge rate cap as a user choice: the cap and the window stay positive values because an absent cap keeps the bridge unbounded as the documented user choice with no code ceiling. */
export function bridgeratecapvalid(limit: number, window: number): policyevaluation {
  if (!Number.isInteger(limit) || limit < 1)
    return { allowed: false, reason: "The bridge rate cap stays a positive whole number of frames the user chose." };
  if (!Number.isFinite(window) || window <= 0)
    return { allowed: false, reason: "The bridge rate window stays a positive number of milliseconds the user chose." };
  return {
    allowed: true,
    reason: `The bridge rate cap of ${limit} frames per ${window} millisecond window stays the user's choice.`,
  };
}

/** Gates every bridge operation against the kill switch: an engaged switch disables the socket and the pairing instantly, so no connect, no pairing mint and no frame passes while the switch stays engaged. */
export function bridgekillswitchgate(input: { engaged: boolean; operation: string }): policyevaluation {
  if (input.engaged)
    return {
      allowed: false,
      reason: `The bridge kill switch stays engaged; the ${input.operation} refuses until the user releases the switch.`,
    };
  return {
    allowed: true,
    reason: `The bridge kill switch stays released; the ${input.operation} runs inside the consent gates.`,
  };
}

/** Gates the origin of one incoming bridge frame: the frame session must match the session the origin paired with and the sender must hold the pairing, so a frame of another origin or an unpaired sender never reaches the extension. */
export function bridgeframeorigingate(input: {
  framesession?: string;
  framesender?: string;
  sessionid: string;
  origin: string;
  paired: boolean;
}): policyevaluation {
  if (!input.paired)
    return {
      allowed: false,
      reason: `The sender of the frame holds no pairing of the origin ${input.origin}; an unpaired sender never reaches the extension.`,
    };
  if (input.framesession !== undefined && input.framesession !== input.sessionid)
    return {
      allowed: false,
      reason: `The frame session ${input.framesession} sits outside the paired session ${input.sessionid}; the origin check refuses the frame.`,
    };
  if (input.framesender !== undefined && input.framesender.trim() === "")
    return { allowed: false, reason: "The frame names its sender; an anonymous frame never reaches the extension." };
  return {
    allowed: true,
    reason: `The frame of the session ${input.sessionid} carries the pairing of the origin ${input.origin}; the origin check passes.`,
  };
}

/** Reads the site bridge choices of one settings record: the relay url, the consent flags, the idle window, the heartbeat interval, the rate cap and its window, and the pairing lifetime — every bound the user set with no code default beside it. */
export function bridgechoices(settings: runsettings | undefined): {
  serverurl?: string;
  bridgeconsent?: boolean;
  bridgepageconsent?: boolean;
  bridgeidlewindow?: number;
  bridgeheartbeatinterval?: number;
  bridgeratelimit?: number;
  bridgeratewindow?: number;
  bridgepairinglifetime?: number;
} {
  const current = settings ?? {};
  return {
    ...(current.serverurl !== undefined ? { serverurl: current.serverurl } : {}),
    ...(current.bridgeconsent !== undefined ? { bridgeconsent: current.bridgeconsent } : {}),
    ...(current.bridgepageconsent !== undefined ? { bridgepageconsent: current.bridgepageconsent } : {}),
    ...(current.bridgeidlewindow !== undefined ? { bridgeidlewindow: current.bridgeidlewindow } : {}),
    ...(current.bridgeheartbeatinterval !== undefined
      ? { bridgeheartbeatinterval: current.bridgeheartbeatinterval }
      : {}),
    ...(current.bridgeratelimit !== undefined ? { bridgeratelimit: current.bridgeratelimit } : {}),
    ...(current.bridgeratewindow !== undefined ? { bridgeratewindow: current.bridgeratewindow } : {}),
    ...(current.bridgepairinglifetime !== undefined ? { bridgepairinglifetime: current.bridgepairinglifetime } : {}),
  };
}

/**
 * The provider gateway gates of the 1.1.83 family.
 * Every gateway bound stays a user choice: the base url of a remote provider never carries a default value, the ollamalocal adapter alone defaults to the localhost machine and refuses every cloud address, the per provider enable toggle ships disabled, the consent stamp gates the first remote call, the key store demands its explicit consent before any key material enters the vault seam and the retry cap of the guardrails validates as a finite non negative count.
 */

/** Validates one provider base url before it saves: the scheme stays http or https, the host stays present, the path shape carries no query, no fragment and no parent traversal, a remote provider speaks https unless it serves a local machine address and the ollamalocal adapter accepts local machine addresses only — never a cloud url. */
export function gatewaybaseurlgate(input: { kind: gatewaykind; baseurl: string }): policyevaluation {
  const url = input.baseurl.trim();
  if (url === "")
    return {
      allowed: false,
      reason: `The ${input.kind} provider needs the user configured base url; no provider endpoint is contacted unless the user configured one.`,
    };
  if (/(^|\/)\.\.?(\/|$)/.test(url))
    return {
      allowed: false,
      reason: `The ${input.kind} base url path carries a relative segment; the per provider path prefix stays a plain namespace.`,
    };
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { allowed: false, reason: `The ${input.kind} base url ${url} does not parse as an absolute url.` };
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:")
    return {
      allowed: false,
      reason: `The ${input.kind} base url must speak http or https; the ${parsed.protocol} scheme never leaves the gate.`,
    };
  if (parsed.hostname === "") return { allowed: false, reason: `The ${input.kind} base url carries no host.` };
  if (parsed.search !== "" || parsed.hash !== "")
    return {
      allowed: false,
      reason: `The ${input.kind} base url carries a query or a fragment; the base url holds the scheme, the host and its path shape only.`,
    };
  const segments = parsed.pathname.split("/");
  if (segments.some((segment) => segment === ".." || segment === "."))
    return {
      allowed: false,
      reason: `The ${input.kind} base url path carries a relative segment; the per provider path prefix stays a plain namespace.`,
    };
  const local =
    parsed.hostname === "localhost" ||
    parsed.hostname === "127.0.0.1" ||
    parsed.hostname === "::1" ||
    parsed.hostname === "[::1]" ||
    parsed.hostname.endsWith(".localhost");
  if (input.kind === "ollamalocal" && !local)
    return {
      allowed: false,
      reason: `The ollamalocal adapter speaks to a localhost endpoint only; the ${parsed.hostname} host is a cloud address the adapter never contacts.`,
    };
  if (input.kind !== "ollamalocal" && !local && parsed.protocol !== "https:")
    return {
      allowed: false,
      reason: `The ${input.kind} provider is a remote endpoint and must speak https; a plain http url never carries a provider key.`,
    };
  return { allowed: true };
}

/** Validates one path prefix of a gateway deployment: the prefix stays a plain namespace path without query, fragment or relative segments, and an empty prefix stays valid because deployments without a namespace carry none. */
export function gatewayprefixgate(prefix: string): policyevaluation {
  const value = prefix.trim();
  if (value === "") return { allowed: true };
  if (value.includes("?") || value.includes("#"))
    return {
      allowed: false,
      reason: "The gateway path prefix carries a query or a fragment; the prefix stays a plain namespace path.",
    };
  const segments = value.replace(/^\//, "").replace(/\/$/, "").split("/");
  if (segments.some((segment) => segment === ".." || segment === "." || segment === ""))
    return {
      allowed: false,
      reason: "The gateway path prefix carries a relative or empty segment; the prefix stays a plain namespace path.",
    };
  return { allowed: true };
}

/** Gates the first remote call of one provider: a remote provider needs its enable toggle on and its consent stamp before any call leaves, while the local ollamalocal runtime needs its enable toggle on and never asks the remote consent because its calls never leave the machine. */
export function gatewayconsentgate(input: {
  config: { kind: gatewaykind; baseurl: string; enabled: boolean; consented?: boolean };
  local?: boolean;
}): policyevaluation {
  if (!input.config.enabled)
    return {
      allowed: false,
      reason: `The ${input.config.kind} provider stays disabled; every provider ships off until the user turns it on.`,
    };
  const local = input.local ?? input.config.kind === "ollamalocal";
  if (local)
    return { allowed: true, reason: "The local runtime call never leaves the machine, so no remote consent applies." };
  if (input.config.consented !== true)
    return {
      allowed: false,
      reason: `The ${input.config.kind} provider has no consent stamp yet; the gate asks the user before the first call to any remote provider.`,
    };
  return { allowed: true };
}

/** Gates the storage of one provider api key behind the vault seam: the key material enters the vault only under the explicit consent of the user, because a stored key is a standing credential the review must have seen. */
export function gatewaykeyconsentgate(input: { consent: boolean; providerid: string }): policyevaluation {
  if (!input.consent)
    return {
      allowed: false,
      reason: `The provider key of ${input.providerid} enters the vault only under the explicit consent of the user; a standing credential never stores silently.`,
    };
  return { allowed: true };
}

/** Validates the configured retry cap of the gateway guardrails: the cap stays a finite non negative count when the user sets one, because a negative or fractional retry count grades nothing. */
export function gatewayretrycapvalid(retries: number | undefined): policyevaluation {
  if (retries === undefined) return { allowed: true };
  if (!Number.isFinite(retries) || retries < 0 || Math.floor(retries) !== retries)
    return {
      allowed: false,
      reason: `The configured retry cap of ${String(retries)} is not a finite non negative count.`,
    };
  return { allowed: true };
}

/** Validates the model cache refresh window: the window stays a finite positive millisecond count when the user sets one, because a non positive window refreshes on every read and grades nothing. */
export function gatewaycachewindowvalid(window: number | undefined): policyevaluation {
  if (window === undefined) return { allowed: true };
  if (!Number.isFinite(window) || window <= 0)
    return {
      allowed: false,
      reason: `The configured model cache window of ${String(window)} is not a finite positive millisecond count.`,
    };
  return { allowed: true };
}

/**
 * The native transport gates of the 1.1.85 native host bridge family.
 * Every native bound stays a user choice and the posture stays deny by default: the install consent gate explains the scope before any host registration, the transport consent gate asks per call class so a read grant never widens into an interaction or a sensitive surface, the sensitive native calls route through the human approval gate, the kill switch and the escape hatch stop every native call in one press, the headless mode keeps the transport disabled unless the user configured a host, and the idle window, the heartbeat interval and the rate cap with its window validate as finite positive user values because a native transport bound never hides a code default.
 */

/** Gates the host registration of the native transport: the install consent explains the scope of the host manifest — the companion process the manifest launches, the profile directory it writes into and the extension origins it allows — and the installer writes no manifest before the recorded consent exists. */
export function nativeinstallconsentgate(input: {
  consent?: boolean;
  profiledir: string;
  hostname: string;
}): policyevaluation {
  if (input.hostname.trim() === "")
    return {
      allowed: false,
      reason: "The host registration names its native host; an empty host name never registers.",
    };
  if (input.profiledir.trim() === "")
    return {
      allowed: false,
      reason:
        "The host registration writes into the user profile directory the user named; the installer never guesses a target.",
    };
  if (input.consent !== true)
    return {
      allowed: false,
      reason: `The install consent gate explains the scope of the ${input.hostname} host registration before any write: the companion process the manifest launches, the ${input.profiledir} profile directory it writes into and the extension origins it allows; no host manifest registers without the recorded consent.`,
    };
  return {
    allowed: true,
    reason: `The user consented to the ${input.hostname} host registration into ${input.profiledir} with the scope explained; the installer may write the host manifest.`,
  };
}

/** Gates one native call per class: the transport consent opens the bridge, the call class asks on its own so read, interaction and sensitive stay separate grants, and an uninstalled host never attaches regardless of the consents. */
export function nativetransportconsentgate(input: {
  consent?: boolean;
  installed: boolean;
  callclass: nativecallclass;
  classconsents?: nativecallclass[];
  killswitch?: boolean;
}): policyevaluation {
  if (input.killswitch === true)
    return {
      allowed: false,
      reason: `The native transport kill switch stays engaged; every ${input.callclass} call stops instantly until the user releases the switch.`,
    };
  if (!input.installed)
    return {
      allowed: false,
      reason: `The native host stays uninstalled; the ${input.callclass} call refuses because the transport keeps its deny by default posture until the user installs the host.`,
    };
  if (input.consent !== true)
    return {
      allowed: false,
      reason:
        "The native transport stays disabled until the user consents to the first host attach; no code path opens the native port without the recorded consent.",
    };
  if (!(input.classconsents ?? []).includes(input.callclass))
    return {
      allowed: false,
      reason: `The ${input.callclass} call class holds no consent grant over the native transport; the gate asks per class and never widens a read grant into an interaction or a sensitive surface.`,
    };
  return {
    allowed: true,
    reason: `The user consented to the ${input.callclass} call class over the native transport; the call runs behind the class gate.`,
  };
}

/** Gates one sensitive native call through the human approval: a sensitive class native call never runs on the class grant alone, because a desktop surface that addresses the user waits for the human approval the review panel records. */
export function nativesensitiveapprovalgate(input: {
  callclass: nativecallclass;
  approval?: boolean;
}): policyevaluation {
  if (input.callclass !== "sensitive")
    return {
      allowed: true,
      reason: "The native call carries no sensitive class and needs no human approval beyond its class grant.",
    };
  if (input.approval !== true)
    return {
      allowed: false,
      reason:
        "The sensitive native call routes through the human approval gate; a desktop surface that addresses the user never runs on the class grant alone.",
    };
  return {
    allowed: true,
    reason: "The human approval gate answered the sensitive native call; the surface runs under the recorded approval.",
  };
}

/** Gates the native transport kill switch: one press engages the switch and every native call stops instantly — the port detaches, the wsbridge session closes and no frame crosses until the user releases the switch. */
export function nativekillswitchgate(input: { engaged: boolean; operation: string }): policyevaluation {
  if (input.engaged)
    return {
      allowed: false,
      reason: `The native transport kill switch stays engaged; the ${input.operation} refuses until the user releases the switch.`,
    };
  return {
    allowed: true,
    reason: `The native transport kill switch stays released; the ${input.operation} runs inside the consent gates.`,
  };
}

/** Gates the escape hatch of the native transport: one key press stops every in flight native call at once, because a one press halt of the whole native surface is a human action the review never replaces. */
export function nativeescapehatchgate(input: { pressed: boolean; inflight: number }): policyevaluation {
  if (!input.pressed)
    return {
      allowed: true,
      reason: "The escape hatch stays unpressed; the in flight native calls run inside the consent gates.",
    };
  return {
    allowed: false,
    reason: `The escape hatch key stops every native call in one press: ${input.inflight} in flight call${input.inflight === 1 ? "" : "s"} halted at once and the native transport detached until the user reattaches.`,
  };
}

/** Gates the native transport inside headless mode: the headless run keeps the transport disabled unless the user configured a host, because a headless run never attaches a desktop host the user did not name. */
export function nativeheadlessgate(input: { headless: boolean; hostconfigured: boolean }): policyevaluation {
  if (!input.headless)
    return { allowed: true, reason: "The run stays live; the native transport follows its own consent gates." };
  if (!input.hostconfigured)
    return {
      allowed: false,
      reason:
        "The native transport stays disabled in headless mode without a configured host; a headless run never attaches a desktop host the user did not name.",
    };
  return {
    allowed: true,
    reason: "The headless run names its host; the native transport follows the same consent gates as the live run.",
  };
}

/** Validates the native transport idle window: the window stays a finite positive millisecond count when the user sets one, because a non positive window expires every session at once and grades nothing. */
export function nativeidlewindowvalid(window: number | undefined): policyevaluation {
  if (window === undefined) return { allowed: true };
  if (!Number.isFinite(window) || window <= 0)
    return {
      allowed: false,
      reason: `The configured native idle window of ${String(window)} is not a finite positive millisecond count.`,
    };
  return { allowed: true };
}

/** Validates the native heartbeat interval: the interval stays a finite positive millisecond count when the user sets one, because a non positive interval detects a live host as dead. */
export function nativeheartbeatintervalvalid(interval: number | undefined): policyevaluation {
  if (interval === undefined) return { allowed: true };
  if (!Number.isFinite(interval) || interval <= 0)
    return {
      allowed: false,
      reason: `The configured native heartbeat interval of ${String(interval)} is not a finite positive millisecond count.`,
    };
  return { allowed: true };
}

/** Validates the native transport rate cap: the cap stays a finite positive count when the user sets one, because a non positive cap refuses every call and grades nothing. */
export function nativeratecapvalid(cap: number | undefined): policyevaluation {
  if (cap === undefined) return { allowed: true };
  if (!Number.isFinite(cap) || cap < 1 || Math.floor(cap) !== cap)
    return {
      allowed: false,
      reason: `The configured native rate cap of ${String(cap)} is not a finite positive whole count.`,
    };
  return { allowed: true };
}
