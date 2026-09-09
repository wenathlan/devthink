/** Shared contracts for every Devthink target. */
import { packageversion, protocolmajor } from "./version.js";
import type { memoryadapter } from "./memory.js";

export const protocolversion = packageversion;

/** The frozen protocolv2 major of the 1.1.91 api freeze: the wire speaks major two from this release on, version one messages stay accepted through the deprecation window and versions above two refuse until a future major bump — the constant mirrors version.ts so the freeze gate can verify the pair never drifts. */
export const protocolmajorversion = protocolmajor;

/** The protocolv2 pin a library consumer imports to freeze the wire contract of its build: the pinned pair of the exact package version and the frozen protocol major, so a consumer that imports this constant answers which wire line its build declared and refuses every message its pinned build never carried. */
export const pinnedprotocolversion: { readonly protocolversion: string; readonly protocolmajor: number } =
  Object.freeze({ protocolversion, protocolmajor: protocolmajorversion });

/** Every reviewed action kind. Read kinds observe, interaction kinds move focus, sensitive kinds change page or browser state. */
export type actionkind =
  | "observe"
  | "inspect"
  | "extract"
  | "wait"
  | "waitfor"
  | "waittext"
  | "readattribute"
  | "readstyle"
  | "readgeometry"
  | "readvalue"
  | "readtext"
  | "readhtml"
  | "countelements"
  | "readtable"
  | "readlinks"
  | "readimages"
  | "readmeta"
  | "readforms"
  | "readstorage"
  | "highlight"
  | "tablist"
  | "windowlist"
  | "tabsnapshot"
  | "focus"
  | "scroll"
  | "hover"
  | "clickdeep"
  | "rightclick"
  | "doubleclick"
  | "scrollpage"
  | "scrollby"
  | "scrollend"
  | "scrolltop"
  | "fullscreen"
  | "zoomset"
  | "click"
  | "type"
  | "navigate"
  | "select"
  | "presskey"
  | "drag"
  | "drop"
  | "upload"
  | "clear"
  | "check"
  | "uncheck"
  | "toggle"
  | "submit"
  | "reload"
  | "back"
  | "forward"
  | "writestorage"
  | "setattribute"
  | "removeattribute"
  | "evaluate"
  | "tabcreate"
  | "tabactivate"
  | "tabclose"
  | "tabreload"
  | "windowcreate"
  | "windowclose"
  | "windowresize"
  | "downloadfile"
  | "movepointer"
  | "clickpoint"
  | "shiftclick"
  | "clicktext"
  | "clickaria"
  | "clickname"
  | "resolvexpath"
  | "typetime"
  | "appendtext"
  | "setvalue"
  | "typeedit"
  | "keyhold"
  | "keyrelease"
  | "submitsearch"
  | "selectmulti"
  | "chooseradio"
  | "setslider"
  | "setdate"
  | "setcolor"
  | "expanddetails"
  | "dismissdialog"
  | "pierceshadow"
  | "enterframe"
  | "retryaction"
  | "mapclicks"
  | "verifyvisible"
  | "verifyenabled"
  | "a11ytree"
  | "readvisible"
  | "readertree"
  | "detectlists"
  | "detecttables"
  | "readjson"
  | "watchmutate"
  | "waitquiet"
  | "watchbanner"
  | "detectinfinitescroll"
  | "detectvirtual"
  | "detectlazy"
  | "readscrollpos"
  | "readlang"
  | "readoutline"
  | "countpages"
  | "listshadow"
  | "listframes"
  | "classifypage"
  | "fingerprintsection"
  | "diffsnapshots"
  | "readselection"
  | "watchfocus"
  | "detectsticky"
  | "detectscrolllock"
  | "readopengraph"
  | "detectlanguage"
  | "deriveselector"
  | "openlink"
  | "openprivate"
  | "reloadcache"
  | "stopnav"
  | "waitload"
  | "waiturl"
  | "followlink"
  | "spanav"
  | "spawait"
  | "rewritequery"
  | "setfragment"
  | "navlist"
  | "navprofile"
  | "detecthttp"
  | "readredirects"
  | "readfinalurl"
  | "handleauth"
  | "printpdf"
  | "prefetch"
  | "preconnect"
  | "deeplink"
  | "reopentab"
  | "trailaudit"
  | "pausenav"
  | "navintent"
  | "navrate"
  | "openclipboard"
  | "checksafe"
  | "batchopen"
  | "querytabs"
  | "duplicatetab"
  | "closepattern"
  | "pintab"
  | "mutetab"
  | "movetab"
  | "movetabwindow"
  | "grouptabs"
  | "colorgroup"
  | "collapsegroup"
  | "discardtab"
  | "reloadtabs"
  | "zoomin"
  | "zoomout"
  | "watchtab"
  | "switchtab"
  | "maximizewindow"
  | "minimizewindow"
  | "restorewindow"
  | "focuswindow"
  | "scratchwindow"
  | "incognitowindow"
  | "restoretab"
  | "savelayout"
  | "restorelayout"
  | "findclones"
  | "searchtabs"
  | "badgetab"
  | "attachmeta"
  | "listaudio"
  | "reopenrun"
  | "snapshotsession"
  | "fillform"
  | "filllabel"
  | "fillplaceholder"
  | "detectfields"
  | "generatevalues"
  | "saveprofiles"
  | "asksubmit"
  | "submitform"
  | "readerrors"
  | "retryform"
  | "runwizard"
  | "selectchain"
  | "picktypeahead"
  | "pickdate"
  | "attachfile"
  | "handoffcaptcha"
  | "fillcard"
  | "fillcode"
  | "consentpassword"
  | "skiphoneypot"
  | "detectlogin"
  | "detecttemplate"
  | "scrapetable"
  | "exportcsv"
  | "exportjson"
  | "exportexcel"
  | "copytable"
  | "pushsheets"
  | "importcsv"
  | "looprows"
  | "transformvalues"
  | "deduperows"
  | "paginateextract"
  | "mergepages"
  | "stamplerows"
  | "previewgrid"
  | "streamdisk"
  | "resumeextract"
  | "logprovenance"
  | "batchdownload"
  | "pausedownload"
  | "resumedownload"
  | "verifydownload"
  | "interceptmime"
  | "exportnetlog"
  | "readclipboard"
  | "writeclipboard"
  | "copyscreen"
  | "quarantinedownload"
  | "scanvirus"
  | "namecaptures"
  | "cleanupartifacts"
  | "shotview"
  | "shotfullpage"
  | "shotelement"
  | "shotregion"
  | "contactsheet"
  | "capturepdf"
  | "recordscreen"
  | "captureaudio"
  | "captureframe"
  | "downloadimages"
  | "shotcanvas"
  | "probestream"
  | "readmedia"
  | "readassets"
  | "timelapse"
  | "convertimage"
  | "makethumbs"
  | "fetchurl"
  | "parsejson"
  | "parsehtml"
  | "callrest"
  | "callgraphql"
  | "opensocket"
  | "sendmessage"
  | "waitmessage"
  | "watchrequests"
  | "readheaders"
  | "capturebodies"
  | "subscribesse"
  | "longpoll"
  | "mapapi"
  | "extractapi"
  | "blockrequest"
  | "mockresponse"
  | "rewriteheaders"
  | "setcookies"
  | "readcookies"
  | "clearcookies"
  | "authflow"
  | "saveapikey"
  | "routeproxy"
  | "postform"
  | "postfiles"
  | "watchconsole"
  | "watcherrors"
  | "watchtasks"
  | "attachcdp"
  | "detachcdp"
  | "cdpcmd"
  | "watchcdp"
  | "setbreakpoint"
  | "stepcode"
  | "watchexpr"
  | "overridescript"
  | "measureflow"
  | "heapshot"
  | "trackmemory"
  | "profilecpu"
  | "watchshifts"
  | "traceload"
  | "annotatetrace"
  | "replaytrace"
  | "capturesourcemaps"
  | "emulatedevice"
  | "emulatenetwork"
  | "emulatelocate"
  | "setuseragent"
  | "overridepermission"
  | "blackboxscripts"
  | "persiststate"
  | "capturesession"
  | "restoresession"
  | "namedsessions"
  | "diffsessions"
  | "searchsessions"
  | "exportsessions"
  | "importsessions"
  | "composeworkflow"
  | "savetemplate"
  | "runworkflow"
  | "dryrun"
  | "delay"
  | "waitelement"
  | "compute"
  | "extractvars"
  | "listruns"
  | "condition"
  | "branch"
  | "loop"
  | "repeatuntil"
  | "whileloop"
  | "foreach"
  | "parallel"
  | "trycatch"
  | "visitrule"
  | "urlrule"
  | "menurule"
  | "keyrule"
  | "buttonrule"
  | "cronrule"
  | "intervalrule"
  | "urllistrule"
  | "webhookrule"
  | "eventrule";

/** The immutable action kind identifiers of the 1.1.91 api freeze: the reviewed vocabulary as one frozen constant in the exact order of the union — every identifier stays lowercase without underscores, the policy classification and the freeze artifact hash this list, and a change to any entry is a protocol change that demands a release bump before the gate accepts it. */
export const actionkindids: readonly actionkind[] = Object.freeze([
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
  "eventrule",
]);

export type actionrisk = "read" | "interaction" | "sensitive";
export type planstate = "draft" | "pending" | "approved" | "rejected" | "expired" | "completed" | "cancelled";
export type auditkind =
  | "configure"
  | "session"
  | "observe"
  | "proposal"
  | "approval"
  | "action"
  | "error"
  | "stop"
  | "pause"
  | "resume"
  | "complete"
  | "capability"
  | "tab"
  | "window"
  | "download"
  | "pointer"
  | "dialog"
  | "hold"
  | "retry"
  | "observation"
  | "watch"
  | "diff"
  | "navigation"
  | "redirect"
  | "auth"
  | "prefetch"
  | "rate"
  | "group"
  | "layout"
  | "discard"
  | "badge"
  | "fill"
  | "submit"
  | "consent"
  | "handoff"
  | "scrape"
  | "export"
  | "stream"
  | "provenance"
  | "resume"
  | "intercept"
  | "clipboard"
  | "quarantine"
  | "cleanup"
  | "capture"
  | "media"
  | "call"
  | "socket"
  | "replay"
  | "control"
  | "timeline"
  | "debugger"
  | "profile"
  | "emulation"
  | "workflow"
  | "trigger"
  | "protocol"
  | "tool"
  | "model"
  | "swarm"
  | "environment"
  | "worker"
  | "sandbox"
  | "grant"
  | "expiry"
  | "revoke"
  | "deny"
  | "seal"
  | "mask"
  | "vault"
  | "gate"
  | "phish"
  | "defer"
  | "schema"
  | "inbound"
  | "transparency"
  | "notes"
  | "scratchpad"
  | "summary"
  | "recall"
  | "correction"
  | "consentmemory"
  | "cancel"
  | "search"
  | "palette"
  | "surface"
  | "onboarding"
  | "logstream"
  | "datagrid"
  | "quickaction"
  | "shortcut"
  | "omnibox"
  | "notify"
  | "picker"
  | "shotpanel"
  | "compare"
  | "siteprofile"
  | "theme"
  | "locale"
  | "importexport"
  | "tour"
  | "a11y"
  | "pagechip"
  | "toast"
  | "recent"
  | "dropimport"
  | "library"
  | "syncbridge"
  | "attention"
  | "backgroundrun"
  | "runreplay"
  | "outputcompare"
  | "planlint"
  | "flowrun"
  | "exporttool"
  | "headless"
  | "platform"
  | "adapter"
  | "doctor"
  | "scaffold"
  | "lazyload"
  | "debounce"
  | "batchquery"
  | "incrsnapshot"
  | "selcache"
  | "virtlist"
  | "streamparse"
  | "chunkextract"
  | "perf"
  | "schedule"
  | "budget"
  | "timeout"
  | "suspend"
  | "runcache"
  | "sessionreuse"
  | "compress"
  | "logprune"
  | "startup"
  | "battery"
  | "network"
  | "warm"
  | "slowmo"
  | "queue"
  | "checkpoint"
  | "rollback"
  | "reap"
  | "lock"
  | "purge"
  | "visit"
  | "escalate"
  | "review"
  | "vote"
  | "kill"
  | "spawn"
  | "arbitrate"
  | "lesson"
  | "lane"
  | "scale"
  | "preconnect"
  | "reopen"
  | "safecheck"
  | "batch"
  | "transform"
  | "dedupe"
  | "sample"
  | "subscribe"
  | "poll"
  | "post"
  | "cache"
  | "correlate"
  | "ocr"
  | "vision"
  | "redact"
  | "ground"
  | "timelapse"
  | "thumb"
  | "sync"
  | "minimize"
  | "bridge"
  | "gateway"
  | "mcpmode"
  | "native";

/** One data inventory entry of the 1.1.79 minimization family: one stored key, the data class it belongs to and its stored size in bytes, so the purge and the export answer exactly what the device holds. */
export interface datainventory {
  /** The storage key the record family persists under. */
  key: string;
  /** The data class of the stored family: runs, memory, captures, settings, provenance, audit or another reviewed class. */
  dataclass: string;
  /** The serialized size of the stored value in bytes. */
  size: number;
  /** The number of records the stored family carries. */
  records: number;
  at: number;
}

/** One purge policy of the 1.1.79 minimization family: the storage classes the user scopes a purge to and the typed confirmation phrase a full purge requires, because a purge nobody typed out never runs and the immutable audit hashes always survive. */
export interface purgepolicy {
  /** The storage classes a purge request may delete: runs, memory, captures, settings or provenance; the audit class never enters because the immutable hashes survive every purge. */
  scope: string[];
  /** The exact phrase the user types before a full scope purge runs; a confirmation phrase of every storage class at once. */
  confirmation: string;
  at: number;
}

/** One sync settings record of the 1.1.79 minimization family: the data classes the user opted in per class with the consent stamps, and the cadence the user chose; sync stays disabled until the opt in and every class lists before its enablement. */
export interface syncsettings {
  /** The data classes the user turned on: runs, memory, captures, settings or provenance; an empty list keeps every sync transport off. */
  enabled: string[];
  /** The sync cadence in milliseconds the user chose; an absent cadence keeps every pass manual because the cadence carries no code default. */
  cadence?: number;
  /** The consent stamp per enabled data class: when the user opted each class in, recorded for the audit trail. */
  consent: Array<{ dataclass: string; at: number }>;
  at: number;
}

/** One sync record of the 1.1.79 minimization family: one synced payload with the classes it carried, the payload hash, the encrypted format tag and the sync time; a plaintext payload never enters this record. */
export interface syncrecord {
  id: string;
  /** The data classes the payload carried, each one opted in by the user before the transport. */
  classes: string[];
  /** The hash of the encrypted payload so the receiving side verifies what left the device. */
  payloadhash: string;
  /** The format version tag the encryptsync pass stamped the payload with. */
  formattag: string;
  /** True because every synced payload encrypts before the transport; a plaintext sync never records. */
  encrypted: boolean;
  syncedat: number;
}

/** One cookie jar record of the 1.1.79 minimization family: the jar id one task run owns, the cookie entries scoped inside it, the seal state at the run completion and the expiry window the user configured for the automatic cleanup. */
export interface cookiejarrecord {
  jarid: string;
  runid: string;
  /** The cookie entries of the jar: name, domain, value, path and expiry, scoped to this jar so one task run never shares its cookie state with another. */
  cookies: Array<{ name: string; domain: string; value: string; path?: string; expiresat?: number }>;
  /** True once the run completed and sealed its jar; a sealed jar refuses every write. */
  sealed: boolean;
  sealedat?: number;
  /** The expiry timestamp the user configured jarexpiry window stamped at the seal; an absent expiry keeps the jar until the user purges it. */
  expiresat?: number;
  createdat: number;
  updatedat: number;
}

/** One cleanup schedule of the 1.1.79 minimization family: the artifact classes the cleanup pass clears after a run and the timing the user chose; an absent timing leaves every pass to the explicit user action because the cleanup carries no code default. */
export interface cleanupschedule {
  /** The artifact classes the cleanup clears: exports, captures, media, diffs or another reviewed class; the audit class never enters. */
  classes: string[];
  /** The timing the user chose: afterrun clears the artifacts once the run completes, manual clears them only through the explicit user pass. */
  timing: "afterrun" | "manual";
  at: number;
}

/** One local rule of the 1.1.79 minimization family: the field names of one origin that must never leave the device; the localfirst pass strips them from every extraction and the localgate refuses any outbound payload that carries one. */
export interface localrule {
  origin: string;
  fields: string[];
  at: number;
}

/** One telemetry policy of the 1.1.79 minimization family: the enabled literal stays false so no code path ever turns a counter into an outbound usage call; every counter keeps living inside the local memory. */
export interface telemetrypolicy {
  /** Fixed to the false literal: the type itself makes an on state unrepresentable, so telemetry stays off by default and by construction. */
  enabled: false;
  /** Every counter stays inside the local memory; the background worker issues no outbound usage call from any context. */
  counters: "local";
  at: number;
}

/** One exportall bundle of the 1.1.79 minimization family: the portable file of every stored record — runs, memory, captures, settings and provenance — assembled on the explicit user request and streamed without a size cap. */
export interface exportallbundle {
  id: string;
  runs: string[];
  memory: string[];
  captures: string[];
  settings: boolean;
  provenance: string[];
  /** The total record count the bundle carries. */
  records: number;
  /** The serialized byte size the streaming pass walks. */
  bytes: number;
  at: number;
}

/** Observation mode classes: passive capture, watched lifetimes and diffing passes. */
export type observationmode = "passive" | "watching" | "diffing";

export interface toolstep {
  id: string;
  kind: actionkind;
  target?: string;
  value?: string;
  /** Reviewed JSON parameters such as modifiers, amounts or coordinates; the 1.1.75 family lets the extract steps carry a `pipeline` reference naming the extractpipeline their rows flow through, and the 1.1.76 family carries the api transport parameters — the `pollrequest` of a longpoll step with its url, timeout and resume cursor, the `graphql` subscription of a channel step with its query, variables and channel, and the `correlation` request map of the run — while the 1.1.77 family carries the vision parameters: the `ocr` flag of a capture step that runs the recognition on its stored bytes, the `vision` prompt block of a step that sends the capture to the configured vision model and the `ocrregion` of a regionocr reading; every transport and vision bound stays a reviewed user choice. */
  options?: string;
  summary: string;
  risk: actionrisk;
  /** Deterministic idempotencykey derived from the plan and step identity; replays of the same step deduplicate on it. */
  idempotencykey?: string;
  /** The execution environment this step names: pagecontext, isolatedworld, offscreenworker or sandboxframe; an absent field routes to the default environment of the kind. */
  environment?: environmentkind;
  /** The fleet agent this step attributes to; a user driven step carries none. */
  agentid?: string;
  /** The navigation intent hint of the 1.1.74 family: the plain language label of the predicted navigation this step belongs to, carried from the approved plan so the navintent predictions and the prefetch warming stay attributable to the step that navigates. */
  intenthint?: string;
}

export interface agentplan {
  id: string;
  objective: string;
  origin: string;
  steps: toolstep[];
  createdat: number;
  expiresat: number;
  state: planstate;
  approvedat?: number;
  completedat?: number;
}

export interface agentsession {
  id: string;
  tabid: number;
  origin: string;
  startedat: number;
  expiresat: number;
  stoppedat?: number;
  pausedat?: number;
  /** Origins granted to this session; prepared for multi origin work. */
  grants?: string[];
  /** Execution environments granted to this session beside the origin grants: pagecontext, isolatedworld, offscreenworker and sandboxframe; an absent list keeps the documented default posture while a configured list narrows every step to its entries. */
  environmentgrants?: environmentkind[];
  /** The lockid of the sessionlock the running run acquired; concurrent run protection travels with the session record. */
  lockid?: string;
  /** The fleet agent bound to this session; a user driven session carries none. */
  agentid?: string;
  /** The cookie jar id of the 1.1.79 minimization family: the jar this session's cookie reads and writes stay scoped to, so one task run never shares its cookie state with another; an absent jarid keeps the session outside the jar isolation. */
  jarid?: string;
}

export interface endpointconfig {
  endpoint: string;
  origin: string;
  configuredat: number;
}

export interface observation {
  /** Observation schema version for forward compatibility. */
  schemaversion: number;
  url: string;
  title: string;
  textpreview: string;
  textlength: number;
  forms: Array<{ label: string; type: string; name: string; options?: string[] }>;
  interactive: Array<{ selector: string; role: string; label: string }>;
  capturedat: number;
  /** The execution environment of the capture: pagecontext snapshots read the live page while offscreenworker parses hand the heavy shaping to the worker pool. */
  environment?: environmentkind;
  /** Observation mode of this capture: passive, watching or diffing. */
  mode?: observationmode;
  /** Accessibility tree section captured by the page walker. */
  a11y?: a11ynode;
  /** Reader view article section extracted by the text density heuristic. */
  reader?: readerarticle;
  /** Repeated list patterns detected on the page. */
  listpattern?: listpattern[];
  /** Data table shapes detected on the page. */
  tableshape?: tableshape[];
  /** Snapshot diff section attached when two observation versions are compared. */
  diff?: snapshotdiff;
  /** True when this observation payload carries an incrsnapshot delta instead of a full snapshot; the delta references the base snapshot ref of the same run and the changed regions only. */
  delta?: boolean;
  /** Content digest of the captured payload; checkpoints compare their page digest against it before a resume continues. */
  digest?: string;
  /** The vision block of the 1.1.77 family: the descriptions the configured vision model returned for the captured pages, the ocr text recognized from the page pixels and the grounding matches that map every description label to a page selector, so every visual claim the observation carries traces back to pixels. */
  vision?: {
    descriptions: string[];
    ocrtext: string;
    groundings: Array<{ label: string; selector: string; score: number }>;
  };
  /** Reserved fields map of the 1.1.91 api freeze: future observation additions land inside this map without breaking the frozen schema, because reserved entries never refuse a payload while the named fields above stay the frozen contract — the observation schema keeps its version field forward compatible exactly this way. */
  reserved?: Record<string, unknown>;
}

export interface auditevent {
  id: string;
  kind: auditkind;
  at: number;
  summary: string;
  sessionid?: string;
  planid?: string;
  stepid?: string;
}

export interface diagnosticreport {
  id: string;
  sessionid: string;
  origin: string;
  capturedat: number;
  tabid: number;
  title: string;
  textlength: number;
  interactivecount: number;
  formcount: number;
  bridgeavailable: boolean;
}

/** Live report of the optional browser capabilities the user has granted, with the capture kinds the active tab grant already covers. */
export interface capabilityreport {
  tabs: boolean;
  downloads: boolean;
  clipboardread: boolean;
  clipboardwrite: boolean;
  /** Capture kinds listed among the available capabilities because they need no optional permission beyond the active tab. */
  captures?: string[];
  /** Media capture part two kinds listed among the available capabilities. */
  media?: string[];
  /** Network observation kinds listed among the available capabilities: outbound requests run only through granted origins. */
  http?: string[];
  /** Network observation part two kinds listed among the available capabilities: sockets, streams and page api observation stay behind the socket, watch and origin gates. */
  netwatch?: string[];
  /** Network control kinds listed among the available capabilities: blocking, mocking, cookies, auth and uploads stay behind the block, cookie and proxy gates. */
  control?: string[];
  /** Session memory kinds listed among the available capabilities: persistence, capture, restore, naming, diffing, search, export and import stay behind the session consent gates. */
  sessions?: string[];
  /** Debugging kinds listed among the available capabilities: console, error and task watching stays read only behind the timeline gate and the per origin console consent. */
  debug?: string[];
  /** Profiling kinds listed among the available capabilities: flow, heap, cpu, shift, trace and source map instruments stay behind the profiling target gate and the per origin consents. */
  profile?: string[];
  /** Emulation kinds listed among the available capabilities: device, network, location, agent and permission layers plus blackbox trace shaping stay behind the emulation gate and the per origin location consent. */
  emulation?: string[];
  /** Workflow kinds listed among the available capabilities: composition, templates, runs, dry runs, delays, element waits, expressions and variable extraction stay inside the plan review gates. */
  workflow?: string[];
  /** Vision kinds listed among the available capabilities of the 1.1.77 family: imageocr, regionocr, pdfocr and frameocr read pixels read only while visionshot rides the user configured model endpoint behind the vision consent gate. */
  vision?: string[];
  reportedat: number;
}

/** Structured result of one executed step, kept with configurable retention. */
export interface stepoutcome {
  stepid: string;
  ok: boolean;
  summary: string;
  details?: Record<string, unknown>;
  /** The execution environment the step ran in, reported beside the outcome. */
  environment?: environmentkind;
  /** The release candidate provenance stamp of the rc audit trail: the package release and the protocol major that produced the entry, so every step stamp answers which release wrote it. */
  provenance?: { release: string; protocolmajor: number };
  at: number;
}

/** User chosen retention windows; an absent value keeps everything forever. */
export interface runsettings {
  auditretention?: number;
  outcomeretention?: number;
  /** Retention window for stored observation captures such as a11y trees and reader articles. */
  observationretention?: number;
  /** User configured ceiling on concurrent task tabs; an absent value never refuses a tab. */
  tasktabceiling?: number;
  /** Retention window for exported data artifacts; an absent value keeps every artifact. */
  artifactretention?: number;
  /** Retention window for captured network log records; an absent value keeps every record. */
  netlogretention?: number;
  /** Retention window for stored capture bytes; an absent value keeps every byte and the metadata always survives. */
  captureretention?: number;
  /** Retention window for stored media bytes such as pdf documents, frames, canvases and recordings; an absent value keeps every byte. */
  mediaretention?: number;
  /** Recording duration window in milliseconds for recordscreen and captureaudio; an absent window leaves the duration to the reviewed step options. */
  recordingwindow?: number;
  /** Retention window for stored outbound call bodies; an absent window keeps every body while the call metadata always survives for the audit trail. */
  callretention?: number;
  /** Retention window for stored captured exchange bodies; an absent window keeps every body while the exchange metadata always survives for the audit trail. */
  bodyretention?: number;
  /** True once the user granted request watching in the review panel; the derived observation reads the page timing buffers only and adds no manifest permission. */
  webrequestgrant?: boolean;
  /** Capture policy of the run: off, manual, annotated or beforeafter state pairs around actions. */
  capturepolicy?: capturepolicy;
  /** True when the pinned control tab with the live task feed stays open. */
  controltab?: boolean;
  /** Retention window for stored run timeline entries; an absent window keeps every entry while the level count summaries always survive. */
  timelineretention?: number;
  /** User configured retention window in milliseconds for the heavy profile bytes of heap snapshots, cpu profiles and trace files; the metadata survives the expiry. */
  profileretention?: number;
  /** User configured byte ceiling for one exported trace file; an absent value never refuses a trace because the cap stays a user choice only. */
  traceceiling?: number;
  /** Retention window for stored pause state captures; an absent window keeps every capture while the pause reason and hit breakpoint always survive. */
  pauseretention?: number;
  /** User configured ceiling on breakpoints per run; an absent value never refuses a breakpoint because the cap stays a user choice only. */
  breakpointceiling?: number;
  /** Retention window for stored reverted emulation layer states; an absent window keeps every prior state while the layer history itself always survives. */
  emulationretention?: number;
  /** Retention window for stored session record sections such as tab form state, local storage and cookies; an absent window keeps every section while the record metadata always survives and the value stays a user choice with no code ceiling. */
  sessionretention?: number;
  /** Retention window for stored trigger fire records; an absent window keeps every fire record and the rule counters always survive. */
  triggerretention?: number;
  /** Retention window for stored workflow runlog entries; an absent window keeps every entry while the run summaries always survive for the audit trail. */
  runlogretention?: number;
  /** Retention window for stored run history entries; an absent window keeps every entry of every execution. */
  runhistoryretention?: number;
  /** Watchdog configuration of the workflow editor: the stall threshold and the recovery action stay user configured values with no code ceiling. */
  watchdog?: watchdogconfig;
  /** User configured ceiling on sub agent recursion depth of the swarm; an absent value stays unbounded because the cap stays a user choice only. */
  swarmdepth?: number;
  /** User configured claim expiry window in milliseconds: a queue claim whose heartbeat stays silent past the window releases and its task requeues; an absent window never expires a claim. */
  claimwindow?: number;
  /** Retention window for stored agent mailbox messages; an absent window keeps every message while the unread counters always survive. */
  mailboxretention?: number;
  /** User configured consensus quorum of the swarm: the number of yes votes a consensus round needs to carry; an absent value leaves the quorum to the round the user opens. */
  swarmquorum?: number;
  /** User configured ceiling on the worker lane of the leader worker topology; an absent value stays unbounded because the worker scale stays a user choice with no engine cap. */
  swarmworkers?: number;
  /** Retention window for stored progressboard snapshots; an absent window keeps every snapshot while the board itself always rebuilds from the live swarm state. */
  boardretention?: number;
  /** The verification methods the user allows the verifier agents to use; an empty or absent list keeps every method open as the documented user choice. */
  verifiermethods?: string[];
  /** True when the user turns the parse offload on: heavy parsing steps route into the offscreen worker pool instead of the page; an absent value keeps every parse inside the page. */
  parseoffload?: boolean;
  /** The worker pool size of the offscreen document as a user choice with no hard cap; an absent value lets the pool follow the pending parse queue alone. */
  workerpoolsize?: number;
  /** Retention window for stored run state records; an absent window keeps every run state while the keepalive summaries always survive. */
  runstateretention?: number;
  /** The origins the user allows to render untrusted markup inside the sandboxframe; an absent list keeps every origin open as the documented user choice. */
  sandboxorigins?: string[];
  /** The keepalive heartbeat interval in milliseconds; the roadmap documents thirty seconds while the interval stays the user's choice. */
  keepaliveinterval?: number;
  /** The number of silent heartbeat intervals the zombie reaper tolerates before it reaps a run; the roadmap documents three while the number stays the user's choice. */
  zombieintervals?: number;
  /** User configured byte ceiling for the stored run state; an absent value never prunes because the pressure response stays a user choice only. */
  runstatebytes?: number;
  /** The consent window duration the consent prompt offers, in milliseconds; the prompt always names a boundary and never defaults to unlimited, and every window stays the user's choice. */
  consentduration?: number;
  /** Retention window for stored sealed run logs; an absent window keeps every sealed log while the chain verification summaries always survive. */
  logretention?: number;
  /** The phishguard lookalike distance threshold between zero and one the user chooses; a login origin whose distance to a granted origin crosses the threshold blocks the step. */
  phishdistance?: number;
  /** The freshness window of stored phishguard verdicts in milliseconds; an absent window keeps every verdict fresh while the records always survive for the audit trail. */
  phishfreshness?: number;
  /** User configured mask shapes for sensitive field shapes beyond the documented password, token, card and secret families; per origin mask rules extend this list. */
  maskshapes?: string[];
  /** Retention window for stored site notes; an absent window keeps every note. */
  noteretention?: number;
  /** Retention window for scratchpad entries; an absent window keeps every entry. */
  scratchpadretention?: number;
  /** Retention window for stored run summaries; an absent window keeps every summary. */
  summaryretention?: number;
  /** Retention window for stored correction memory entries; an absent window keeps every correction. */
  correctionretention?: number;
  /** The semantic recall index window in milliseconds; an entry older than the window leaves the live index while its records stay. */
  recallwindow?: number;
  /** True when historysearch index building stays on; an absent value keeps the incremental index on. */
  historyindex?: boolean;
  /** The user cancelrun rollback preference: queued rolls the queued steps back while none stops the run without a rollback. */
  cancelrollback?: "queued" | "none";
  /** The runsummary length window in steps the distillation keeps; an absent window keeps every step with no fixed cap. */
  summarywindow?: number;
  /** The commandpalette recent window: the number of most used commands the ranking lifts first; an absent window ranks by match alone. */
  paletterecents?: number;
  /** The logstream live buffer bound: the number of newest events the live window keeps while the full history stays in memory; an absent bound keeps every event live. */
  logstreambuffer?: number;
  /** Retention window for stored taskinput history entries; an absent window keeps every entry. */
  taskinputretention?: number;
  /** The commandpalette keyboard shortcut every surface opens, such as "ctrl+."; an absent value keeps the documented default binding the surfaces ship. */
  paletteshortcut?: string;
  /** The byte ceiling above which diffpreview generation offloads to the offscreen worker pool when the user granted the offscreen capability; an absent ceiling keeps every diff inline. */
  diffpreviewbytes?: number;
  /** The recenttray depth: the number of latest runs the popup tray keeps; an absent depth keeps every run. */
  recenttraydepth?: number;
  /** True when the user consents to notifications that carry page content; an absent value keeps every notification body content free so no consent is needed. */
  notifyconsent?: boolean;
  /** True when the user turns the done and attention notifications on; an absent value keeps them on with content free bodies only. */
  notifyenabled?: boolean;
  /** The manual darklight override: dark or light forces the theme while system follows the os preference; an absent value follows the os preference alone. */
  themepreference?: "dark" | "light" | "system";
  /** The language of the interface strings; an absent value keeps english with the locale fallback. */
  uilanguage?: string;
  /** The steteoast live count: the number of newest step toasts the live stack keeps while the full history stays queryable; an absent count keeps every toast live. */
  toastlivecount?: number;
  /** Retention window for stored attentionfeed entries; an absent window keeps every entry while the resolution events always survive in the audit trail. */
  attentionretention?: number;
  /** The lazymods prewarm set: the module ids the user warms on startup; an absent set keeps every heavy module out of the startup path. */
  prewarmset?: string[];
  /** The startup module budget the user configures; the startup view reports against it and never refuses a load because the budget stays a user choice. */
  lazybudget?: number;
  /** The debouncedom windows per event kind of scroll, input, resize and mutation in milliseconds; an absent window passes every event through uncoalesced. */
  debouncewindows?: Partial<Record<debounceprofile["kind"], number>>;
  /** The incrsnapshot cadence: the number of deltas between two full snapshots; an absent cadence keeps every snapshot a delta against its base. */
  snapshotcadence?: number;
  /** The worker queue depth the user configures for backpressure; parse tasks past the depth defer and never refuse, and an absent depth keeps the queue unbounded. */
  workerdepth?: number;
  /** Retention window for stored perf records; an absent window keeps every record while the perf summaries always rebuild from the live run. */
  perfretention?: number;
  /** The virtlist row window per surface; an absent window keeps every row rendered because the window stays a user choice. */
  virtlistrows?: number;
  /** The capture priority the user chooses: speed defers heavy capture work to the run end while evidence keeps the captures beside their steps; an absent value keeps the captures beside their steps. */
  capturepriority?: "speed" | "evidence";
  /** The batch backpressure window: the number of steps the batch run queue may run ahead of its completed outcomes before enqueueing pauses; an absent window never pauses the queue. */
  batchwindow?: number;
  /** The per domain concurrency slots the user chooses for batch runs; an absent entry keeps a domain unbounded because the limit stays a user choice. */
  domainlimits?: Record<string, number>;
  /** The politedelay base window in milliseconds the user chooses for batch requests; an absent base keeps every request unspaced. */
  politedelay?: number;
  /** The politedelay jitter window in milliseconds folded over the base delay so batch requests never arrive in lockstep; an absent jitter keeps the delay deterministic. */
  politejitter?: number;
  /** The adaptivepoll growth factor the user chooses: the poll interval widens by the factor while observations stay unchanged; an absent factor keeps the interval fixed. */
  pollgrowth?: number;
  /** The user chosen ceiling on the steps of one run; an absent budget never refuses a step because the bound stays a user choice. */
  stepbudget?: number;
  /** The user chosen memory pressure ratio of one run, between zero and one, the budget tracker reports against; an absent value keeps the tracker informational only. */
  memorybudget?: number;
  /** The user chosen budgetalert thresholds by severity: the warning ratio and the critical ratio that pauses the run pending a user choice; an absent threshold keeps every alert informational. */
  budgetthresholds?: { warning?: number; critical?: number };
  /** The user chosen timeout bound in milliseconds per step: a step that runs past the bound aborts with its cancel event recorded in the immutable log; an absent bound never aborts a step. */
  timeoutbound?: number;
  /** The user chosen tab suspend window in milliseconds: a wait longer than the window may suspend its idle tab while a shorter wait never does; an absent window never suspends a tab. */
  suspendwindow?: number;
  /** The user chosen cold start target in milliseconds the startup meter reports against; an absent target keeps the meter informational only and never refuses a module. */
  startuptarget?: number;
  /** The user chosen selector latency threshold in milliseconds the selectorprofile flags slow selectors against; an absent threshold keeps every profile informational. */
  selectorlatency?: number;
  /** The default slowmo replay factor the user chooses, such as 0.5 for half speed; an absent factor keeps a replay at recorded speed. */
  slowmofactor?: number;
  /** True when the user pins the profile run cache so fetched resources survive the run end; an absent value clears the cache at run end. */
  runcachepin?: boolean;
  /** The user chosen retention window for the whole sealed runs the logprune keeps; an absent window keeps every sealed log because the prune stays a user choice. */
  logpruneretention?: number;
  /** The user chosen size window in bytes the logprune keeps per sealed run chain; an absent window keeps every byte because the prune stays a user choice. */
  logsizewindow?: number;
  /** The user chosen artifact codec for stored captures and logs: deflate compresses at rest while store keeps the bytes plain; an absent value keeps the stored bytes plain. */
  artifactcodec?: "deflate" | "store";
  /** The battery level floor between zero and one below which the scheduler defers non urgent scheduled runs; an absent floor never defers a run. */
  batteryfloor?: number;
  /** The per failure kind backoff windows in milliseconds the networkaware retry policies use; an absent entry keeps the existing backoff of the retry path. */
  netbackoff?: Record<string, number>;
  /** The user chosen ceiling on the parallel read lanes of one readparallel group; an absent ceiling keeps every lane open because the lane count stays a user choice. */
  readlanes?: number;
  /** The cadence widening factor under memory pressure: the snapshot interval widens by the factor while pressure stays high and restores when it clears; an absent factor keeps the cadence fixed. */
  cadencewidening?: number;
  /** The run heartbeat staleness window in milliseconds: a running run whose last beat sits past the window turns stale so the zombiecheck reaps it; the roadmap documents sixty seconds while the window stays the user's choice with no code ceiling. */
  heartbeatwindow?: number;
  /** The offline queue depth the user chooses: the resilience family reports the waiting approved plans against it and never refuses a queued plan because the depth stays a user choice only. */
  queuedepth?: number;
  /** Retention window for stored failed and reaped run records; an absent window keeps every failed and reaped run for the audit trail. */
  failedrunretention?: number;
  /** The sessionlock expiry window in milliseconds: an abandoned lock whose window passed leaves at startup before the zombiecheck runs; the roadmap documents two minutes while the window stays the user's choice with no code ceiling. */
  lockwindow?: number;
  /** The expirememory interval in milliseconds: the background runs the expiry pass when the interval passed since the last pass; an absent interval keeps the expiry manual behind its confirmation. */
  expireinterval?: number;
  /** Retention window in captures for the stored fleet runreplay records; an absent window keeps every capture of every agent for the audit trail. */
  replayretention?: number;
  /** Retention window in records for the stored fleet aggregatereport merges; an absent window keeps every merged report for the audit trail. */
  aggregateretention?: number;
  /** Retention window in events for the stored interleaved fleet timeline; an absent window keeps every interleaved event. */
  interleveretention?: number;
  /** The ceiling on live fleet workers per origin the user configures; an absent ceiling leaves the worker count unbounded. */
  maxworkersorigin?: number;
  /** The window in milliseconds after which an unreused lesson decays from the serving list; an absent window keeps every lesson. */
  lessonstalewindow?: number;
  /** True when the user opts in to letting expirememory also expire audit events past their own retention; an absent value leaves every audit event untouched by the memory expiry. */
  expireauditevents?: boolean;
  /** True when the user turns encryptrest on: memory items encrypt at rest through the webcrypto derived key while the key itself never persists; the secret entry stays a consent prompt. */
  encryptrest?: boolean;
  /** The navigation rate window of the 1.1.74 family in milliseconds: the sliding window every navigation count per domain rolls inside; an absent window leaves the navigation counting manual with no automatic reset because the window size stays a user choice. */
  navratewindow?: number;
  /** User configured ceiling on the urls one batchopen step may open; an absent ceiling never refuses a batch link because the batch size bound stays a user choice only. */
  batchsizelimit?: number;
  /** Retention window in milliseconds for stored closed tab records of the 1.1.74 family; an absent window keeps every closedtabrecord for the audit trail. */
  closedtabretention?: number;
  /** The ceiling on the rows one streamdisk chunk of the 1.1.75 family persists at a time; an absent ceiling streams the whole extract as one chunk because the chunk size stays a user choice with no code default. */
  streamchunkrows?: number;
  /** Retention window in milliseconds for the stored preview extractbatches of the 1.1.75 family; an absent window keeps every preview batch for the audit trail. */
  previewretention?: number;
  /** The user chosen timeout of one long poll request of the 1.1.76 family in milliseconds; an absent timeout never aborts a poll because the bound stays a user choice with no code default. */
  polltimeout?: number;
  /** The user chosen backoff between long poll retries of the 1.1.76 family in milliseconds; an absent backoff retries immediately because the wait stays a user choice with no code default. */
  pollbackoff?: number;
  /** The user chosen ceiling on the open event subscriptions one run holds of the 1.1.76 family; an absent ceiling leaves the subscription count unbounded because the bound stays a user choice only. */
  subscriptionlimit?: number;
  /** Retention window in cached entries of the 1.1.76 family per run; an absent window keeps every cacheentry of the run until the run ends because the retention stays a user choice. */
  cacheretention?: number;
  /** Retention window in records for the stored observed page api calls of the 1.1.76 family; an absent window keeps every apicallrecord for the audit trail. */
  apicallretention?: number;
  /** The vision model the user configures for the 1.1.77 family descriptions and recognition; an absent model refuses the model calls loudly because no recognition ships inside the extension. */
  visionmodel?: string;
  /** The vision model endpoint the user configures of the 1.1.77 family; the endpoint origin must sit inside the session grants before any frame leaves the device. */
  visionendpoint?: string;
  /** Retention window in records for the stored ocr results and vision descriptions of the 1.1.77 family; an absent window keeps every record for the audit trail. */
  visionretention?: number;
  /** Retention window in milliseconds for the visioncache entries of the 1.1.77 family; an absent window keeps every entry because the expiry stays a user choice with no code default. */
  visioncacheretention?: number;
  /** Retention window in milliseconds for the stored frame reads of the 1.1.77 family; an absent window keeps every framereference for the audit trail. */
  frameretention?: number;
  /** The frameocr wait budget in milliseconds of the 1.1.77 family: the video seek and pause wait stays inside the reviewed window; an absent budget never refuses because the bound stays a user choice. */
  visionwaitbudget?: number;
  /** The similarity threshold the user configures of the 1.1.78 family: a diffshot score below the threshold flags the visual regression; an absent threshold never flags a regression because the bound stays a user choice with no code default. */
  diffthreshold?: number;
  /** The capture interval in milliseconds the user configures of the 1.1.78 family timelapse; an absent interval leaves every lapse capture to the explicit user start because the interval carries no code floor. */
  timelapseinterval?: number;
  /** The maximum thumbnail edge in pixels the user configures of the 1.1.78 family thumbshot; an absent edge keeps every thumbnail at its capture size because the bound stays a user choice. */
  thumbnailedge?: number;
  /** Retention window in records for the stored forensic pairs, timelines, diffs, thumbnails and lapse frames of the 1.1.78 family; an absent window keeps every record for the audit trail because the purge stays a user choice without a forced sweep. */
  forensicretention?: number;
  /** The sync cadence in milliseconds of the 1.1.79 family: the interval between two sync passes of the enabled data classes; an absent cadence keeps every sync pass off because the opt in and the cadence stay user choices with no code default. */
  synccadence?: number;
  /** The artifact cleanup delay in milliseconds of the 1.1.79 family: the window after a run completes before the cleanup pass clears its task artifacts; an absent delay leaves every cleanup to the explicit user pass because the timing carries no code default. */
  cleanupdelay?: number;
  /** The cookie jar expiry window in milliseconds of the 1.1.79 family: the window after a jar seals before its cookie entries expire for the automatic cleanup; an absent window keeps every sealed jar until the user purges it because the expiry stays a user choice. */
  jarexpiry?: number;
  /** The relay server url of the 1.1.82 site integration family: the wss address the user typed; an empty or absent value disables the site bridge completely and no default url exists anywhere in the code. */
  serverurl?: string;
  /** The user consent that opens the first socket connection of the site bridge; the bridge stays disabled until the user grants it because the first connection is a consent boundary. */
  bridgeconsent?: boolean;
  /** The explicit consent flag that lets page content cross the site bridge; an absent value keeps every bridge frame to plan text and statuses so page content never crosses by default. */
  bridgepageconsent?: boolean;
  /** The relay session idle window in milliseconds after which a quiet bridge session expires; an absent window never expires a session because the bound stays a user choice. */
  bridgeidlewindow?: number;
  /** The bridge heartbeat interval in milliseconds the socket stays alive with; an absent interval sends no heartbeat frames because the cadence stays a user choice. */
  bridgeheartbeatinterval?: number;
  /** The bridge rate cap: the number of frames per session one window accepts; an absent cap keeps the bridge unbounded as the documented user choice with no code ceiling. */
  bridgeratelimit?: number;
  /** The bridge rate window in milliseconds the per session cap counts inside; an absent window counts no frames because both bounds stay user choices. */
  bridgeratewindow?: number;
  /** The bridge pairing code lifetime in milliseconds; an absent lifetime keeps the documented five minute window of the clientauth family because the window stays a user choice. */
  bridgepairinglifetime?: number;
  /** The user consent that registers the native host manifest of the 1.1.85 family: the installer writes no host manifest before this stamp exists because the host registration is the consent boundary the scope explanation precedes. */
  nativeinstallconsent?: boolean;
  /** The user consent that opens the native transport of the 1.1.85 family: the native port stays deny by default until the user grants it because the first host attach is a consent boundary. */
  nativetransportconsent?: boolean;
  /** The call classes the user consented to over the native transport of the 1.1.85 family: read, interaction and sensitive stay separate grants so every class asks on its own. */
  nativecallclassconsents?: nativecallclass[];
  /** The native surface consents of the 1.1.85 family: the os dialog and notification surfaces each carry their own grant stamp because a desktop surface never opens from a class grant alone. */
  nativesurfaceconsents?: nativesurfacekind[];
  /** The native transport idle window in milliseconds after which a quiet wsbridge session expires; an absent window never expires a session because the bound stays a user choice. */
  nativeidlewindow?: number;
  /** The native heartbeat interval in milliseconds the host liveness check rides; an absent interval sends no heartbeat frames because the cadence stays a user choice. */
  nativeheartbeatinterval?: number;
  /** The native transport rate cap: the number of calls per session one window accepts; an absent cap keeps the transport unbounded as the documented user choice with no code ceiling. */
  nativecallratelimit?: number;
  /** The native transport rate window in milliseconds the per session cap counts inside; an absent window counts no calls because both bounds stay user choices. */
  nativecallratewindow?: number;
}

export interface proposalrequest {
  objective: string;
  session: agentsession;
  observation: observation;
  capabilities: capabilityreport;
}

export interface planproposal {
  version: typeof protocolversion;
  plan: agentplan;
  /** The checkpointed step ids a resumed proposal marks with its resumedfrom marker; a fresh proposal carries none. */
  resumedfrom?: string[];
  /** The lockid of the sessionlock the run of this proposal acquired; a replay preserves its lock so the concurrent run protection survives the replay. */
  lockid?: string;
  /** The fleet agent that requested the plan; parseproposal attributes every step to its requesting agent. */
  agentid?: string;
}

export interface policyevaluation {
  allowed: boolean;
  reason?: string;
}

/** Tracks which reviewed steps of one plan have already executed locally. */
export interface planprogress {
  planid: string;
  /** The run record this progress links to; the run lifecycle state machine tracks its state beside the plan. */
  runid?: string;
  completedsteps: string[];
  outcomes?: stepoutcome[];
  /** Tabs assigned to the running task so progress tracks work across its tabs. */
  tasktabs?: number[];
  /** The execution environment of every completed step by step id. */
  environments?: Record<string, environmentkind>;
  /** The worker turnaround of every offloaded step by step id, in milliseconds. */
  turnarounds?: Record<string, number>;
  /** The gate wait of every gated step by step id: the confirm gate the step waited at with its waited milliseconds. */
  gatewaits?: Record<string, gatewaitevidence>;
  /** The perf record of every executed step by step id: the duration, the query count and the cache hits the step cost. */
  perf?: Record<string, perfrecord>;
  /** The snapshot change set of every executed step by step id in the incrsnapshot change format, so progress deltas reuse the delta format the snapshot builder emits. */
  deltas?: Record<string, snapshotchange[]>;
  /** Prior progress snapshots preserved when a new plan replaces the tracked one. */
  prior?: planprogress[];
  /** The release candidate provenance stamp of the rc audit trail: the package release and the protocol major that produced the record, so the audit trail answers which release wrote each entry. */
  provenance?: { release: string; protocolmajor: number };
  updatedat: number;
}

/** Modes that address one element during target resolution. */
export type targetmode = "selector" | "text" | "aria" | "name" | "xpath" | "index" | "point";

/** Reviewed element reference resolved by the page bridge at preview and execution time. */
export interface targetref {
  mode: targetmode;
  selector?: string;
  text?: string;
  role?: string;
  name?: string;
  xpath?: string;
  index?: number;
  x?: number;
  y?: number;
}

/** One point on a reviewed pointer path. */
export interface pointref {
  x: number;
  y: number;
}

/** Reviewed pointer path between two points through optional waypoints. */
export interface pointpath {
  start: pointref;
  end: pointref;
  waypoints?: pointref[];
  duration?: number;
}

/** Reviewed pointer speed shape with an easing curve, peak velocity and a jitter window. */
export interface speedprofile {
  easing?: "linear" | "easeinout";
  peak?: number;
  jitter?: number;
}

/** One key held down across steps under a hold id, with tab and step provenance. */
export interface keyholdstate {
  holdid: string;
  key: string;
  modifiers?: string[];
  tabid?: number;
  stepid?: string;
  pressedat: number;
  releasedat?: number;
}

/** Reviewed answers for confirm, alert and prompt dialogs; prompts need a reviewed answer. */
export interface dialogpolicy {
  accept: boolean;
  answer?: string;
}

/** Ordered frame indexes that address targets inside same origin iframes. */
export type framepath = number[];

/** Ordered host selectors that address targets across open shadow roots. */
export type shadowpath = string[];

/** Reviewed retry bounds with an attempt count that carries no hardcoded ceiling. */
export interface retryrule {
  attempts: number;
  settle?: number;
  tolerance?: number;
}

/** One numbered clickable element of a clickablemap. */
export interface mapentry {
  number: number;
  selector: string;
  role: string;
  label: string;
  mode: targetmode;
}

/** Numbered map of every clickable element captured inside one observation version. */
export interface clickablemap {
  version: number;
  entries: mapentry[];
  builtat: number;
}

/** Matched element summary attached to step results and review envelopes. */
export interface resolvedtarget {
  mode: targetmode;
  selector: string;
  tag: string;
  label: string;
  geometry: { x: number; y: number; width: number; height: number };
  candidates?: string[];
}

/** One dialog answered by the reviewed dialog policy, kept for the audit trail. */
export interface dialogdecision {
  id: string;
  dialog: string;
  text: string;
  accept: boolean;
  answer?: string;
  sessionid?: string;
  at: number;
}

/** One retry execution record with the attempts made and the movement delta observed between them. */
export interface retryoutcome {
  stepid: string;
  attempts: number;
  movement: number;
  ok: boolean;
  at: number;
}

/** Resolution summary stored per target mode for later selector derivation. */
export interface resolutionsummary {
  stepid: string;
  mode: targetmode;
  selector: string;
  label: string;
  at: number;
}

/** One accessibility tree node with role, accessible name, states, value and child refs. */
export interface a11ynode {
  role: string;
  name: string;
  states: string[];
  value?: string;
  childcount: number;
  children: a11ynode[];
}

/** One reader view article with title, byline, blocks and text statistics. */
export interface readerarticle {
  title: string;
  byline: string;
  blocks: Array<{ kind: string; text: string; words: number }>;
  words: number;
  characters: number;
}

/** One detected repeated list with its shared item selector, repeat count and samples. */
export interface listpattern {
  container: string;
  itemselector: string;
  repeat: number;
  samples: string[];
}

/** One detected data table shape with header row, column specs and caption. */
export interface tableshape {
  selector: string;
  headers: string[];
  columns: Array<{ label: string; cells: number }>;
  rows: number;
  caption: string;
}

/** One embedded json state payload extracted from an inline script. */
export interface jsonstate {
  scripturl: string;
  rootpath: string;
  payload: unknown;
}

/** Reviewed watch registration with selector scopes, event kinds and a lifetime window. */
export interface mutationwatch {
  watchid?: string;
  scopes?: string[];
  events?: string[];
  lifetime: number;
}

/** Reviewed network quiet rule with an idle threshold, poll interval and timeout. */
export interface quietrule {
  idle: number;
  poll?: number;
  timeout?: number;
}

/** One dom mutation observed inside a reviewed watch, with a timestamp and target path. */
export interface mutationevent {
  watchid: string;
  event: string;
  targetpath: string;
  sessionid?: string;
  at: number;
}

/** One focus change observed inside a reviewed focus watch, with a timestamp and target path. */
export interface focusevent {
  watchid: string;
  kind: "focus" | "blur";
  targetpath: string;
  sessionid?: string;
  at: number;
}

/** One consent banner observed by a reviewed banner watch, with its controls. */
export interface bannerreport {
  kind: string;
  selector: string;
  text: string;
  controls: string[];
  sessionid?: string;
  at: number;
}

/** One node change inside a snapshot diff. */
export interface diffentry {
  kind: "added" | "removed" | "changed";
  selector: string;
  summary: string;
}

/** One snapshot diff between two stored observation versions. */
export interface snapshotdiff {
  baseversion: number;
  targetversion: number;
  added: diffentry[];
  removed: diffentry[];
  changed: diffentry[];
  at: number;
}

/** One derived selector candidate with its strategy and stability score. */
export interface selectorcandidate {
  selector: string;
  strategy: string;
  score: number;
}

/** One derived selector stored with its stability score for reuse. */
export interface derivedselector {
  stepid: string;
  selector: string;
  strategy: string;
  score: number;
  at: number;
}

/** One watch registration persisted so watches survive service worker restarts. */
export interface watchregistration {
  watchid: string;
  kind: actionkind;
  stepid: string;
  sessionid: string;
  origin: string;
  scopes: string[];
  events: string[];
  startedat: number;
  lifetime: number;
  closedat?: number;
}

/** One stored observation capture under its version. */
export interface observationrecord {
  version: number;
  observation: observation;
}

/** One stored accessibility tree capture. */
export interface a11ycapture {
  version: number;
  tree: a11ynode;
  capturedat: number;
}

/** One stored reader article capture. */
export interface readercapture {
  version: number;
  article: readerarticle;
  capturedat: number;
}

/** Live page signals refreshed after observation steps: language, template, scroll lock and banner state. */
export interface pagesignals {
  language?: string;
  template?: string;
  scrolllocked?: boolean;
  banner?: string;
  refreshedat: number;
}

/** One detected template class or section fingerprint stored per origin. */
export interface templateprofile {
  origin: string;
  template: string;
  fingerprint: string;
  section?: string;
  at: number;
}

/** Reviewed navigation target with its url, container, position and private flag. */
export interface navtarget {
  url: string;
  container: "current" | "tab" | "window" | "private";
  position?: "adjacent" | "end";
  private: boolean;
}

/** Reviewed per origin override of one wait profile. */
export interface waitoverride {
  origin: string;
  signals?: string[];
  idle?: number;
  timeout?: number;
}

/** Reviewed wait profile with load signals, thresholds and per origin overrides. */
export interface waitprofile {
  signals: string[];
  idle?: number;
  timeout?: number;
  overrides?: waitoverride[];
}

/** Reviewed url pattern with a match mode plus required query and fragment parts. */
export interface urlpattern {
  mode: "exact" | "prefix" | "host" | "pattern";
  url: string;
  query?: Record<string, string>;
  fragment?: string;
}

/** One redirect hop of a redirect chain with its url, status and timestamp. */
export interface redirecthop {
  url: string;
  status: number;
  at: number;
}

/** One observed redirect chain with hops, statuses and timing. */
export interface redirectchain {
  hops: redirecthop[];
  startedat: number;
  endedat: number;
}

/** One navigation trail entry with url, title, step ref and timestamp. */
export interface trailentry {
  url: string;
  title: string;
  stepid?: string;
  at: number;
}

/** Reviewed per domain navigation rate limit with a window and a user configured ceiling. */
export interface ratelimit {
  domain: string;
  window: number;
  ceiling: number;
}

/** Live navigation state of a tab: load phase, final url and redirect chain. */
export interface navstate {
  phase: "idle" | "loading" | "interactive" | "complete";
  finalurl?: string;
  redirects?: redirectchain;
}

/** One stored wait profile applied per origin with user configured values. */
export interface waitprofilerecord {
  origin: string;
  profile: waitprofile;
  at: number;
}

/** One stored navigation record with the redirect chain and final url of one navigation step. */
export interface navrecord {
  stepid: string;
  sessionid?: string;
  origin: string;
  finalurl: string;
  chain: redirectchain;
  at: number;
}

/** One recorded navigation intent detected from a plan, kept for audit review. */
export interface navintentrecord {
  id: string;
  intent: string;
  origin: string;
  sessionid?: string;
  stepid?: string;
  at: number;
  /** The predicted next urls of the 1.1.74 family ranked by step order and urlhistory frequency; the predictions are read only observations that warm nothing on their own. */
  predictedurls?: string[];
}

/** One rate limit window state per domain with the reviewed limit and the hit count. */
export interface ratelimitstate {
  domain: string;
  limit: ratelimit;
  openedat: number;
  count: number;
}

/** One curated link of a batch open list with its safety verdict and review state. */
export interface curatedlink {
  url: string;
  verdict: "safe" | "unsafe" | "unknown";
  reasons: string[];
}

/** One curated link list stored with its review state before batch opening. */
export interface curatedlist {
  id: string;
  links: curatedlink[];
  reviewedat?: number;
  at: number;
}

/** Reviewed basic auth credentials for one origin, stored only after explicit review. */
export interface authrecord {
  origin: string;
  username: string;
  password: string;
  reviewedat: number;
}

/** One url safety verdict produced by a checksafe verification. */
export interface safetyverdict {
  url: string;
  safe: boolean;
  reasons: string[];
  at: number;
}

/** One task artifact routed into the artifact store by a printpdf step. */
export interface artifactrecord {
  id: string;
  kind: string;
  name: string;
  stepid: string;
  at: number;
}

/** Navigation control state: paused navigation while a consent prompt is open. */
export interface navcontrol {
  pausedat?: number;
  reason?: string;
  updatedat: number;
}

/** One recently closed tab remembered so a reopentab step can restore it. */
export interface recenttab {
  url: string;
  tabid: number;
  closedat: number;
}

/** Queued navigation targets of prefetch and batch open steps, shown in the popup badge. */
export interface navqueues {
  prefetch: number;
  batchopen: number;
  updatedat: number;
}

/** One prefetch plan of the 1.1.74 family: the predicted next urls with their confidence between zero and one, ranked by step order and urlhistory frequency; the predictions are read only observations that issue no request on their own and drop when the plan they came from changes. */
export interface prefetchplan {
  id: string;
  /** The plan the predictions came from; a stored plan whose planid differs from the live plan drops its predictions. */
  planid?: string;
  predictedurls: Array<{ url: string; confidence: number }>;
  createdat: number;
}

/** One preconnect target of the 1.1.74 family: the origin a read only socket opens to ahead of the steps that need it and the time the connection is expected; the socket stays revocable and never carries a mutating request. */
export interface preconnecttarget {
  origin: string;
  expectedat: number;
  /** True while the preconnect socket stays open ahead of its steps; a revoked or finished target carries false. */
  connected?: boolean;
  /** The time the preconnect target was revoked; a revoked socket opens no further connection. */
  revokedat?: number;
}

/** One deep link pattern of the 1.1.74 family: the web app name, the origin the route builds into, the route template with its named parameters and the parameter names a reviewed step must supply. */
export interface deeplinkpattern {
  app: string;
  origin: string;
  /** The route template with named parameters in the {name} form, such as "/{owner}/{repo}" of the github app. */
  route: string;
  params: string[];
}

/** One closed tab record of the 1.1.74 family: the url, title, tab, window and close time of a tab the user closed, kept under the user configured retention window so a reopentab request can restore it after a grant recheck. */
export interface closedtabrecord {
  id: string;
  url: string;
  title: string;
  tabid: number;
  windowid: number;
  closedat: number;
  /** The time the record was reopened; a reopened record never reopens twice while the retention window keeps it for the audit trail. */
  reopenedat?: number;
}

/** One navigation trail entry of the 1.1.74 family: the final url one navigation landed on, the step that navigated and the capture time; repeated restores deduplicate so a replayed trail never doubles its entries. */
export interface navtrailentry {
  url: string;
  stepid?: string;
  at: number;
  /** The run the trail entry belongs to; the trail persists per run so the audit reads exactly one run's path. */
  runid?: string;
}

/** One navigation rate limit window of the 1.1.74 family: the domain it counts, the live navigation count inside the sliding window, the time the oldest hit ages out and the hit timestamps the window slides over; the window size and the ceiling stay user choices with no code default. */
export interface ratelimitwindow {
  domain: string;
  count: number;
  resetat: number;
  /** The navigation hit timestamps inside the live sliding window, oldest first; the window slides forward as the hits age out. */
  hits?: number[];
  /** The sliding window size in milliseconds the user configured; an absent size leaves the window manual. */
  window?: number;
  /** The navigation ceiling of the window the user configured; an absent ceiling never refuses a navigation because the limit stays a user choice. */
  ceiling?: number;
}

/** One curated link batch of the 1.1.74 family: the curated urls, the origin grants the batch verified against and the review state before one tab per link opens; every url carries a checksafeurl verdict and the batch refuses the unsafe ones as a whole. */
export interface linkbatch {
  id: string;
  urls: string[];
  grants: string[];
  reviewedat?: number;
  at: number;
}

/** One navigation pause of the 1.1.74 family: the consent prompt that froze navigation, the pending navigation queued behind it and the timestamps of the freeze; the queued navigation waits for the answer and never drops silently. */
export interface navpause {
  pausedat: number;
  reason: string;
  /** The pending navigation url queued behind the open consent prompt; the executor takes it back on resume. */
  pendingurl?: string;
  pendingstepid?: string;
  updatedat: number;
}

/** One dedupe key of the 1.1.75 family: the columns a pipeline deduplicates its rows by and the normalization applied to the key values before the comparison; the configuration stays per pipeline as a user choice with no code default. */
export interface dedupekey {
  columns: string[];
  /** The normalization applied to the key values before comparing: none compares the raw values, whitespace folds the runs of spaces and trims the ends, case lowercases, and whitespace and case applies both. */
  normalization: "none" | "whitespace" | "case" | "whitespace and case";
}

/** One source stamp of the 1.1.75 family: the url, the step id and the capture time attached to every row of one pipeline so every cell answers where it came from; a stamp never rewrites after stamping because the row timestamps stay immutable. */
export interface sourcestamprecord {
  id: string;
  url: string;
  stepid: string;
  capturedat: number;
}

/** One extracted row of the 1.1.75 family: its stable row key, the values keyed by column name, the raw values kept beside their transforms, the source stamps of every cell and the provlog entry ids of the operations the row rode; the stamps and the captured timestamps stay immutable after stamping. */
export interface extractrow {
  key: string;
  values: Record<string, string>;
  /** The raw values beside the transformed ones; a transform never drops its original so the audit reads both sides. */
  rawvalues?: Record<string, string>;
  stamps: sourcestamprecord[];
  /** The link of every cell to its sourcestamprecord id so each value answers which page and step captured it. */
  cellstamps?: Record<string, string>;
  /** The provlog entry ids of the stream, transform, dedupe, sample and resume operations this row rode; the provenance query reads the same ids. */
  provenance: string[];
}

/** One stream cursor of the 1.1.75 family: the row offset and the chunk index of the last written position; the resume continues exactly from it and the cursor checkpoints after every chunk. */
export interface streamcursor {
  pipelineid: string;
  /** The count of rows already persisted to the sink; the resume skips the rows before this offset. */
  offset: number;
  /** The index of the last written chunk; the next chunk starts one past it. */
  chunk: number;
  updatedat: number;
}

/** One extract batch of the 1.1.75 family: the rows one extraction pass collected with the streamcursor they resume from; the latest batch serves the preview and expires under the user configured retention. */
export interface extractbatch {
  id: string;
  pipelineid: string;
  rows: extractrow[];
  cursor: streamcursor;
  at: number;
}

/** One grid column of the 1.1.75 family: the projected column name, its kind inferred from the sampled values and its width derived from the content; the projection never touches the stored extract. */
export interface gridcolumn {
  name: string;
  kind: "text" | "number" | "date" | "boolean";
  width: number;
}

/** One provlog entry of the 1.1.75 family: one extraction operation of a pipeline logged with the row keys it touched and its redacted summary; the log stays append only so the audit integrity holds. */
export interface provlogentry {
  id: string;
  pipelineid: string;
  runid: string;
  operation: "stream" | "transform" | "dedupe" | "sample" | "resume" | "capture";
  rowkeys: string[];
  /** The redacted plain language summary of the operation; secret shaped values mask before the log sees them. */
  summary: string;
  at: number;
}

/** One sample policy of the 1.1.75 family: the row count of the preview subset and its selection strategy; the row count stays a user choice with no code ceiling and the preview never mutates the full extract. */
export interface samplepolicy {
  rows: number;
  strategy: "first" | "random" | "stratified";
}

/** One dedupe report of the 1.1.75 family: the removed and kept counts of one dedupe pass with its key columns and its dropped row keys; the report persists beside the pipeline and rides the response envelope so the reviewer reads exactly what the pass dropped. */
export interface dedupereport {
  id: string;
  pipelineid: string;
  runid: string;
  keys: string[];
  removed: number;
  kept: number;
  droppedkeys: string[];
  at: number;
}

/** One stream file record of the 1.1.75 family: the metadata of one disk sink a pipeline streamed to, kept for the cleanup after its run finishes; the filename stays bound to the runid namespace and never carries the row payloads. */
export interface streamfilerecord {
  id: string;
  pipelineid: string;
  runid: string;
  filename: string;
  rows: number;
  bytes: number;
  at: number;
}

/** One extract pipeline of the 1.1.75 family: the reviewed source it extracts from, the step ids that drive the extraction, the transform rules applied between extraction and export, the reviewed sink the export flows through, the optional dedupe key and sample policy and its live state; a pipeline never extracts fields outside its reviewed target and its file names stay bound to the runid namespace. */
export interface extractpipeline {
  id: string;
  runid: string;
  name: string;
  /** The reviewed target the pipeline extracts from, such as the table selector or the reviewed fields list; a pipeline that extracts fields outside this target refuses. */
  source: string;
  steps: string[];
  transforms: transformrule[];
  sink: "csv" | "json" | "excel";
  dedupe?: dedupekey;
  sample?: samplepolicy;
  state: "running" | "paused" | "finished";
  /** The plan the pipeline belongs to; a resume is allowed only for the same plan and origin. */
  planid?: string;
  /** The origin the pipeline extracts from; a resume of another origin refuses. */
  origin: string;
  createdat: number;
  updatedat: number;
}

/** One long poll request of the 1.1.76 family: the url the poll drives, the user chosen timeout of one request and the cursor value the request carries; an absent timeout never aborts a poll because the bound stays a user choice with no code default. */
export interface longpollrequest {
  url: string;
  /** The user chosen timeout of one poll request in milliseconds; a request that runs past the timeout retries under the configured backoff while an absent timeout never aborts a poll. */
  timeout?: number;
  /** The cursor value the request carries, read from the previous response; an absent cursor starts the loop fresh. */
  cursor?: string;
}

/** One graphql subscription of the 1.1.76 family: the reviewed query with its variables and the websocket channel the subscription rides; the inbound next, error and complete messages map into step results. */
export interface graphqlsubscription {
  query: string;
  /** Reviewed variables of the subscription operation; values stay out of every audit summary. */
  variables?: Record<string, string>;
  /** The websocket channel the subscription rides: the id of an open channel or the url of the channel the step opens. */
  channel: string;
}

/** One multipart field descriptor of the 1.1.76 family: the field name, the filename and the content type of one file part of a multipart body; the descriptor builds the part headers of a streamed upload. */
export interface multipartfield {
  name: string;
  filename: string;
  contenttype: string;
}

/** One correlated request of the 1.1.76 family: the request id assigned per run, its step, url, origin and method, the correlation id shared with the response and the paired response status once it lands. */
export interface correlatedrequest {
  requestid: string;
  correlationid: string;
  stepid: string;
  url: string;
  origin: string;
  method: string;
  /** The correlation id of the paired response once it lands; absent while the response stays in flight. */
  responseid?: string;
  status?: number;
  at: number;
}

/** One correlation context of the 1.1.76 family: the run the map belongs to and the request ids assigned to its outbound requests; the mapping stays read only inside the run and exports to the audit trail as one per run map. */
export interface correlationcontext {
  runid: string;
  requests: correlatedrequest[];
}

/** One rate limit directive of the 1.1.76 family: the origin it covers, the scope the delay applies inside, the remaining count, the reset time and the retry after wait of a 429 or 503 answer; the directive composes beside the parsed ratelimitread and every window stays a user respected value with no code default. */
export interface ratelimitdirective {
  origin: string;
  /** The scope the directive covers, such as one origin or one endpoint path; the delay applies inside this scope only. */
  scope: string;
  remaining?: number;
  /** Reset timestamp of the window in epoch milliseconds. */
  resetat: number;
  /** The retry after wait in milliseconds parsed from a 429 or 503 response; absent waits nothing beyond the reset window. */
  retryafter?: number;
  at: number;
}

/** One cached response entry of the 1.1.76 family: the key built from the run, url, method and body hash, the stored body with its headers and status, the expiry derived from the response headers and the user policy and the hit counter; entries namespace per run and never store a response that follows a mutation. */
export interface cacheentry {
  key: string;
  runid: string;
  url: string;
  method: string;
  body: string;
  headers: Record<string, string>;
  status: number;
  /** Expiry timestamp in epoch milliseconds derived from the response headers and the user policy; an absent expiry keeps the entry until the run ends. */
  expiry?: number;
  hits: number;
  at: number;
}

/** One observed page api call of the 1.1.76 family: the endpoint the page called with its method, status and mime, read only beside the discovered apimapentry so the observation adds a request to the review without ever replaying it. */
export interface apicallrecord {
  id: string;
  runid: string;
  stepid: string;
  url: string;
  origin: string;
  endpoint: string;
  method: string;
  status: number;
  mime?: string;
  at: number;
}

/** One ocr region of the 1.1.77 family: the x, y, width and height rectangle in css pixels of the captured surface a recognition reads, a crop targets or a redaction covers. */
export interface ocrregion {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** One recognized word of the 1.1.77 family: the text the recognizer read, its box on the image in css pixels and the confidence between zero and one it reported. */
export interface ocrword {
  text: string;
  box: ocrregion;
  confidence: number;
}

/** One merged line of the 1.1.77 family: the words whose boxes overlap vertically merge into one line with the joined text, the covering box and the lowest word confidence so a shaky word drags its line down instead of hiding inside an average. */
export interface ocrline {
  text: string;
  box: ocrregion;
  words: number;
  confidence: number;
}

/** One ocr result of the 1.1.77 family: the recognized words with their boxes and confidences, the merged lines, the merged paragraphs and the full normalized text of one captured image. */
export interface ocrresult {
  id: string;
  runid: string;
  stepid: string;
  /** The capture or image record the recognition read. */
  imageid: string;
  text: string;
  words: ocrword[];
  lines: ocrline[];
  paragraphs: string[];
  at: number;
}

/** One vision request of the 1.1.77 family: the image reference the reviewed prompt travels with, so the configured vision model answers exactly the pixels the run captured. */
export interface visionrequest {
  runid: string;
  stepid: string;
  imageid: string;
  prompt: string;
  at: number;
}

/** One labeled region of a visiondescription of the 1.1.77 family: the plain language label the model gave the region with its box on the image in css pixels. */
export interface visionlabeledregion {
  label: string;
  box: ocrregion;
}

/** One vision description of the 1.1.77 family: the text the configured vision model returned for the reviewed prompt with the labeled regions it named, so every visual claim traces back to pixels. */
export interface visiondescription {
  id: string;
  runid: string;
  stepid: string;
  imageid: string;
  prompt: string;
  text: string;
  regions: visionlabeledregion[];
  at: number;
}

/** One redaction mask of the 1.1.77 family: the regions one capture masks before any sharing with its plain language reason; the mask composes the redactshot family so the geometry grammar stays one. */
export interface redactionmask {
  id: string;
  runid: string;
  captureid: string;
  regions: ocrregion[];
  reason: string;
  /** Where the mask came from: drawn by the user in the sidepanel or derived from a sensitive field shape. */
  source: "userdrawn" | "fieldshape";
  at: number;
}

/** One screenshot pair of the 1.1.77 family: the image and the dom snapshot captured beside it, aligned by capture time and viewport size so a query searches both the image text and the dom text. */
export interface screenshotpair {
  id: string;
  runid: string;
  stepid: string;
  imageid: string;
  domsnapshotid: string;
  capturetime: number;
  viewport: { width: number; height: number };
  at: number;
}

/** One grounding match of a groundingresult of the 1.1.77 family: the description label, the page text of the matched element, its selector and the combined text and geometry score. */
export interface groundingmatch {
  label: string;
  text: string;
  selector: string;
  score: number;
}

/** One grounding result of the 1.1.77 family: the description labels grounded into ranked page selectors so every visual claim the vision model made answers a page element. */
export interface groundingresult {
  id: string;
  runid: string;
  stepid: string;
  descriptionid: string;
  matches: groundingmatch[];
  at: number;
}

/** One frame reference of the 1.1.77 family: the video selector with the playback position in milliseconds the paused frame was read at. */
export interface framereference {
  runid: string;
  stepid: string;
  selector: string;
  /** The playback position in milliseconds the frame sits at. */
  positionms: number;
  at: number;
}

/** One visioncache entry of the 1.1.77 family: the recognition or description one image hash already produced, stored so a repeated read serves without a model call under the user retention. */
export interface visioncacheentry {
  hash: string;
  runid: string;
  imageid: string;
  kind: "ocr" | "vision";
  ocr?: ocrresult;
  vision?: visiondescription;
  hits: number;
  at: number;
}

/** One before after pair of the 1.1.78 family: the pre and post capture ids around one action step, both linked to the stepid; a read only step skips its pre capture because a page that never changes needs no before state while the post capture still answers what the step saw. */
export interface beforeafterpair {
  id: string;
  runid: string;
  stepid: string;
  /** The capture taken before the step ran; absent when the step stays read only because a read never changes the page state it reads. */
  precaptureid?: string;
  /** The capture taken after the step ran; the post state answers what the step changed. */
  postcaptureid?: string;
  /** The kind of the step the pair wraps, so the forensic view names what changed the page. */
  stepkind: string;
  /** The heartbeat beat of the run the pair recorded under, so a restarted service worker never mixes the beats of two windows. */
  beat?: number;
  at: number;
}

/** One console trace entry of the 1.1.78 family: the level, the masked text, the source, the capture time, the stepid active at the entry and the run wide sequence number that survives page reloads; the name composes with consoletrace because the consoleentry of the console capture family already serves the serialized console calls. */
export interface consoletraceentry {
  id: string;
  runid: string;
  stepid: string;
  level: loglevel;
  text: string;
  source: timelinesource;
  /** The run wide sequence number stamped in capture order; a page reload never resets it so the timeline stays continuous across reloads. */
  sequence: number;
  /** The reload ordinal the entry landed under; zero when the page never reloaded while the counter climbs with every reload the run observed. */
  reload?: number;
  /** The heartbeat beat of the run the entry recorded under, so the forensic timeline ties its entries to the run heartbeat. */
  beat?: number;
  at: number;
}

/** One network trace entry of the 1.1.78 family: the url, method, status and capture time of one request or response joined through the correlation id of the run, attached to the step that ran at its timestamp. */
export interface nettraceentry {
  id: string;
  runid: string;
  stepid: string;
  url: string;
  method: string;
  status: number;
  /** The correlation id that joins the request and its response through the correlateids map of the run. */
  correlationid: string;
  /** True once the correlation map joined a response pair to the request side; a request without its pair stays unjoined so the gap names itself. */
  paired?: boolean;
  /** The heartbeat beat of the run the entry recorded under, so the forensic timeline ties its entries to the run heartbeat. */
  beat?: number;
  at: number;
}

/** One diff baseline of the 1.1.78 family: the stored baseline screenshot for one page state with the user configured similarity threshold; the baseline change requires the user confirmation because a baseline the review never saw flags nothing honestly. */
export interface diffbaserecord {
  id: string;
  runid: string;
  /** The capture id of the stored baseline screenshot. */
  captureid: string;
  /** The page state label the baseline answers, for example the url and the reviewed summary of the page it froze. */
  pagestate: string;
  /** The user configured similarity threshold the diffs against this baseline compare with; an absent threshold never flags a regression because the bound stays a user choice. */
  threshold?: number;
  /** The heartbeat beat of the run the baseline recorded under. */
  beat?: number;
  at: number;
}

/** One diff result of the 1.1.78 family: the changed regions one capture shows against its baseline with the similarity score; the score climbs toward one as the pages agree and the regression flag answers the user threshold alone. */
export interface diffresult {
  id: string;
  runid: string;
  stepid: string;
  /** The diffbaserecord id the capture compared against. */
  baselineid: string;
  /** The capture id of the compared screenshot. */
  captureid: string;
  /** The changed regions in css pixel rectangles, merged from the changed pixel blocks. */
  regions: ocrregion[];
  /** The similarity score between zero and one: one means every block agrees, zero means every block changed. */
  score: number;
  /** True when the score fell below the user configured diff threshold; an absent threshold never flags. */
  regression: boolean;
  /** The heartbeat beat of the run the diff recorded under. */
  beat?: number;
  at: number;
}

/** One thumbnail record of the 1.1.78 family: the sized thumbnail of one stored capture linked back to its full capture, so the capture log shows the run at a glance while the full bytes stay one reference away. */
export interface thumbnailrecord {
  id: string;
  runid: string;
  /** The capture id of the full screenshot the thumbnail derives from. */
  captureid: string;
  /** The thumbnail width in pixels after the user configured maximum edge scaled the capture. */
  width: number;
  /** The thumbnail height in pixels after the user configured maximum edge scaled the capture. */
  height: number;
  at: number;
}

/** One timelapse configuration of the 1.1.78 family: the capture interval and the duration the user reviewed, started by an explicit user start and stopped by the plan completion or the user stop; every bound stays a user choice with no code floor. */
export interface timelapseconfig {
  runid: string;
  /** The capture interval in milliseconds between two lapse frames. */
  interval: number;
  /** The total duration in milliseconds the lapse runs for. */
  duration: number;
  startedat: number;
  /** The state of the lapse: running until the duration, the plan completion or the user stop closes it. */
  state: "running" | "stopped";
  stoppedat?: number;
}

/** One timelapse frame reference of the 1.1.78 family: the capture id of one lapse frame with its ordered sequence number, so the assembled lapse replays the page change in capture order. */
export interface timelapseframe {
  runid: string;
  captureid: string;
  sequence: number;
  at: number;
}

/** One capture naming rule of the 1.1.78 family: the reviewed lowercase filename pattern with the parts it stamps — plan, step, timestamp and sequence — so every exported capture file answers where it came from; the pattern carries the capturename grammar of the files family forward. */
export interface capturenamerule {
  /** The lowercase pattern with {plan}, {step}, {timestamp} and {sequence} placeholders. */
  pattern: string;
  /** The parts the pattern may stamp, listed so the review names exactly what every filename carries. */
  parts: string[];
}

/** One capture bundle of the 1.1.78 family: the export payload of the forensic surface — the capture ids with their beforeafter pairs, the console and net timeline counts, the diff results, the thumbnails, the lapse frames and the capture names — with the provlog provenance entry ids of every capture, because a bundle without provenance never leaves the device. */
export interface capturebundle {
  id: string;
  runid: string;
  captures: string[];
  pairs: string[];
  consoleentries: number;
  netentries: number;
  diffs: string[];
  thumbnails: string[];
  lapses: string[];
  names: Array<{ captureid: string; name: string }>;
  /** The provlog entry ids of every capture in the bundle; the export refuses when one capture misses its provenance entry. */
  provenance: string[];
  /** True when the redactshot masks ran over the captures before the bundle assembled; an unmasked capture never exports. */
  masked: boolean;
  at: number;
}

/** Reviewed tab query with url, title, id and pattern matchers resolved against the live tab set. */
export interface tabquery {
  url?: string;
  title?: string;
  id?: number;
  pattern?: string;
}

/** Reviewed tab group definition with name, color, member tabs and collapse state. */
export interface tabgroupspec {
  name: string;
  color: string;
  tabids: number[];
  collapsed: boolean;
}

/** One stored tab group definition with its color choice and member tabs. */
export interface tabgrouprecord {
  groupid: string;
  name: string;
  color: string;
  tabids: number[];
  collapsed: boolean;
  savedat: number;
}

/** Window bounds of one window state or saved layout. */
export interface windowbounds {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** Live or saved window state with bounds, maximize state and profile kind. */
export interface windowstate {
  bounds: windowbounds;
  maximized: boolean;
  profile: "normal" | "incognito" | "scratch";
}

/** One tab position inside a saved layout, carrying its window and pin state. */
export interface layouttab {
  url: string;
  title: string;
  pinned: boolean;
  index: number;
  windowid: number;
}

/** One saved tab layout with name, tabs, groups, positions and window bounds. */
export interface tablayout {
  name: string;
  tabs: layouttab[];
  groups: tabgroupspec[];
  windows: Array<{ windowid: number; state: windowstate }>;
  savedat: number;
}

/** Per tab task metadata with task refs, provenance and free text labels. */
export interface tabmeta {
  tabid: number;
  taskrefs: string[];
  provenance: string;
  labels: string[];
  at: number;
}

/** One per tab task status badge set by a badgetab step or refreshed from live progress. */
export interface tabbadge {
  tabid: number;
  taskid: string;
  label: string;
  setat: number;
}

/** One tab report entry carrying audio state and metadata per tab. */
export interface tabreportentry {
  tabid: number;
  url: string;
  title: string;
  index: number;
  windowid: number;
  active: boolean;
  pinned: boolean;
  audible: boolean;
  muted: boolean;
  discarded: boolean;
  meta?: tabmeta;
}

/** Tab report payload with matched tabs, groups and badges. */
export interface tabreport {
  matches: tabreportentry[];
  groups: tabgroupspec[];
  badges: tabbadge[];
}

/** One session snapshot of tabs and windows captured for later restore. */
export interface sessionsnapshot {
  id: string;
  sessionid?: string;
  layout: tablayout;
  capturedat: number;
}

/** One closed tab history entry kept for restoretab and reopenrun. */
export interface closedtab {
  url: string;
  title: string;
  tabid: number;
  windowid: number;
  closedat: number;
}

/** One tab event observed inside a reviewed watchtab registration. */
export interface tabwatchevent {
  watchid: string;
  event: "title" | "activated" | "closed";
  tabid: number;
  detail?: string;
  at: number;
}

/** Pinned control tab state carrying the live task feed. */
export interface controltabstate {
  tabid: number;
  enabled: boolean;
  updatedat: number;
}

/** Field kinds the form family recognizes across inputs, selects, checks and specialized payment fields. */
export type fieldkind =
  | "text"
  | "email"
  | "phone"
  | "date"
  | "number"
  | "select"
  | "check"
  | "radio"
  | "file"
  | "password"
  | "card"
  | "code";

/** Reviewed field match addressing one control by label, placeholder, aria label or name. */
export interface fieldmatch {
  mode: "label" | "placeholder" | "arialabel" | "name";
  label?: string;
  placeholder?: string;
  arialabel?: string;
  name?: string;
}

/** One reviewed form field entry pairing a field match with its kind and value. */
export interface formentry {
  match: fieldmatch;
  kind: fieldkind;
  value: string;
}

/** A reviewed structured form record with field entries, kinds and values. */
export interface formrecord {
  form?: string;
  entries: formentry[];
}

/** Reviewed value generation rules for one field kind with locale and seed choices. */
export interface valuegen {
  kind: fieldkind;
  locale?: string;
  seed?: number;
}

/** One saved form profile with a reviewed name, field entries and the origin grants it is bound to. */
export interface formprofile {
  name: string;
  fields: formentry[];
  grants: string[];
  savedat: number;
}

/** Live wizard state with the step index, the total steps and the per step completion flags. */
export interface wizardstate {
  index: number;
  steps: number;
  completed: boolean[];
  at: number;
}

/** One submission ticket with the form ref, the values hash and the consent ref of its asksubmit approval. */
export interface submitticket {
  id: string;
  form: string;
  valueshash: string;
  consentref: string;
  approved?: boolean;
  at: number;
}

/** One validation error message associated with a field ref. */
export interface fielderror {
  field: string;
  message: string;
}

/** One collected error report of a form, kept for correction loops. */
export interface errorreport {
  form: string;
  errors: fielderror[];
  at: number;
}

/** One captcha handoff record with its resolution state while the plan waits for the user. */
export interface captchahandoff {
  id: string;
  origin: string;
  resolved: boolean;
  openedat: number;
  resolvedat?: number;
}

/** One login or template detection stored per origin with the matched markers. */
export interface detectionrecord {
  origin: string;
  kind: "login" | "signup" | "checkout";
  markers: string[];
  at: number;
}

/** One typeahead pick recorded when a reviewed suggestion entry was chosen. */
export interface typeaheadpick {
  field: string;
  query: string;
  pick: string;
  at: number;
}

/** Form report payload with the detected fields, their kinds and the matched controls. */
export interface formreport {
  form: string;
  fields: Array<{ selector: string; label: string; kind: fieldkind; matched: boolean }>;
}

/** One scraped or imported dataset column with a stable key, its label, its value kind and the normalized name. */
export interface columnspec {
  key: string;
  label: string;
  kind: "text" | "number";
  normalized: string;
}

/** One dataset row keyed by column keys. */
export type datasetrow = Record<string, string>;

/** One source reference attaching a row index to its url, timestamp and step ref. */
export interface sourceref {
  row: number;
  url: string;
  at: number;
  stepid?: string;
}

/** One structured dataset with column specs, rows and source refs; row counts stay user configured with no code ceiling. */
export interface dataset {
  id: string;
  name: string;
  columns: columnspec[];
  rows: datasetrow[];
  sources: sourceref[];
  at: number;
}

/** One reviewed transform rule applying an expression to source columns and writing the target column; the 1.1.75 pipeline family pairs the rule with its field and its reviewed operation so the pipeline layer reshapes one value at a time while the raw value stays beside the transformed one. */
export interface transformrule {
  expression: string;
  sources: string[];
  target: string;
  /** The field of the 1.1.75 pipeline family the rule reshapes; the transform reads exactly this column of every row. */
  field?: string;
  /** The reviewed operation of the 1.1.75 pipeline family: trim folds the whitespace, case folds the letters, number strips the non numeric shapes and date normalizes to ISO 8601; an unknown operation refuses at the protocol boundary before any write. */
  operation?: "trim" | "case" | "number" | "date";
}

/** One extraction session tracking visited pages, collected rows and the resume cursor. */
export interface extractsession {
  id: string;
  datasetid: string;
  name: string;
  target: string;
  next: string;
  planned: number;
  pages: string[];
  rows: number;
  cursor: number;
  done?: boolean;
  startedat: number;
  updatedat: number;
}

/** One provenance record of an exported artifact with its url, timestamp, step ref, row range and checksum. */
export interface provenancerecord {
  artifact: string;
  name: string;
  url: string;
  stepid: string;
  rowstart: number;
  rowend: number;
  checksum: string;
  at: number;
}

/** One exported data artifact kept in the task artifact store with its content and checksum. */
export interface exportedartifact {
  id: string;
  kind: "csv" | "json" | "excel";
  name: string;
  stepid: string;
  rowcount: number;
  content: string;
  checksum: string;
  at: number;
}

/** One streaming export state with chunk and written row counters persisted for resume. */
export interface streamstate {
  datasetid: string;
  name: string;
  chunk: number;
  chunks: number;
  written: number;
  done?: boolean;
  at: number;
}

/** One reviewed sheet endpoint configuration stored behind its origin grant. */
export interface sheetendpoint {
  endpoint: string;
  origin: string;
  configuredat: number;
}

/** Transform rules and dedupe keys remembered per task between extraction and export. */
export interface taskrules {
  taskid: string;
  transforms: transformrule[];
  dedupekeys: string[];
  at: number;
}

/** One reviewed batch download specification with its url list, filename rule and completion criteria. */
export interface downloadspec {
  urls: string[];
  filename?: string;
  complete?: "size" | "checksum";
}

/** Per file states of the batch download queue. */
export type downloadstate = "queued" | "running" | "paused" | "complete" | "failed";

/** One batch download file record with its state, resolved path and checksum; concurrent windows stay user configured with no code ceiling. */
export interface downloadrecord {
  id: string;
  url: string;
  filename: string;
  state: downloadstate;
  downloadid?: number;
  path?: string;
  bytes?: number;
  checksum?: string;
  at: number;
  updatedat: number;
}

/** Reviewed mime interception filter with include and exclude patterns and a deny default for unlisted mime types. */
export interface mimefilter {
  include: string[];
  exclude: string[];
  default: "deny" | "allow";
}

/** One captured network log record with url, method, status, timing and step correlation through its request id. */
export interface netlogrecord {
  url: string;
  method: string;
  status: number;
  timing: number;
  requestid?: string;
  stepid: string;
  at: number;
  /** Captured header names; exported netlogs always carry their values redacted. */
  headers?: Record<string, string>;
}

/** One clipboard entry with its kind, payload hash and origin provenance; the payload text never persists. */
export interface clipentry {
  kind: "read" | "write" | "screen";
  hash: string;
  length: number;
  origin: string;
  stepid: string;
  at: number;
}

/** Verdicts of the configured virus scanning hooks. */
export type scanverdict = "pending" | "clean" | "flagged" | "error";

/** One quarantined download kept outside the downloads folder with its reason, scan state and release ref; the 1.1.79 minimization family adds the lifecycle status — held until the scanner verdict arrives, released once the verdict reads clean, deleted once it reads flagged. */
export interface quarantineentry {
  id: string;
  path: string;
  reason: string;
  scan: scanverdict;
  release?: string;
  /** The 1.1.95 hardening: the sha256 digest of the quarantined file the reviewed flow recorded, so the local signature list of the scanning hook answers on the device before any remote endpoint fires. */
  digest?: string;
  /** The lifecycle status of the 1.1.79 family: held while the verdict waits, released by a clean verdict, deleted by a flagged verdict; an absent status reads as held because a download without a verdict never opens. */
  status?: "held" | "released" | "deleted";
  at: number;
  updatedat: number;
}

/** One consistent capture filename stamped from task, step and sequence parts. */
export interface capturename {
  task: string;
  step: string;
  sequence: number;
}

/** One reviewed artifact cleanup rule with an age window, an artifact kind and a keep policy. */
export interface cleanuprule {
  age: number;
  kind: string;
  keep: "none" | "latest" | "all";
}

/** One clipboard consent record with its prompt, origin and single use approval state; every clipboard read needs its own approved prompt. */
export interface clipboardconsentrecord {
  id: string;
  prompt: string;
  origin: string;
  stepid: string;
  approved?: boolean;
  usedat?: number;
  at: number;
}

/** One user configured virus scanning hook endpoint stored behind its origin grant. */
export interface scanhookconfig {
  scanner: string;
  endpoint: string;
  origin: string;
  configuredat: number;
  /** The local signature check option of the 1.1.95 hardening: digests of files the local pass flags on the device before any remote scanner endpoint fires. */
  localsignatures?: string[];
}

/** One stored capture naming counter per task and step base. */
export interface capturecounter {
  taskid: string;
  counters: Record<string, number>;
  at: number;
}

/** One artifact inventory entry for the cleanup sweeper with its size and capture time. */
export interface artifactinventoryentry {
  id: string;
  kind: string;
  name: string;
  size: number;
  at: number;
}

/** One cleanup run history record with the applied rule count and the removed and kept artifact counts. */
export interface cleanuprun {
  id: string;
  rules: number;
  removed: number;
  kept: number;
  at: number;
}

/** Formats a reviewed capture may produce; anything outside this set is refused. */
export type captureformat = "png" | "jpeg" | "webp";

/** Export targets a reviewed capture may route to: session memory, the reviewed download flow or the clipboard. */
export type captureexport = "memory" | "download" | "clipboard";

/** Capture policy modes: captures off, manual shots only, annotated evidence or before and after state pairs around actions. */
export type capturepolicy = "off" | "manual" | "annotated" | "beforeafter";

/** Reviewed capture options: format, quality, pixel ratio, annotation flag and export target; every bound stays a user choice. */
export interface captureoptions {
  format?: captureformat;
  /** Jpeg and webp quality between zero and one hundred; any value in the format range is a user choice with no code cap. */
  quality?: number;
  /** Output scale from one up to any user configured ceiling with no code ceiling. */
  pixelratio?: number;
  annotate?: boolean;
  exporttarget?: captureexport;
}

/** One reviewed rectangle of the page in css pixels. */
export interface regionrect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** One planned viewport tiling of a full page capture: tile grid, scroll offsets and overlap rows. */
export interface stitchplan {
  columns: number;
  rows: number;
  tiles: Array<{ x: number; y: number }>;
  overlap: number;
  scrollwidth: number;
  scrollheight: number;
  viewportwidth: number;
  viewportheight: number;
}

/** Reviewed contact sheet layout: cell size, column count and label style; cell counts stay user choice only. */
export interface sheetlayout {
  cellsize: number;
  columns: number;
  label: "none" | "index" | "selector" | "both";
}

/** Reviewed capture naming rule choosing which filename segments participate. */
export interface capturenaming {
  run: boolean;
  step: boolean;
  sequence: boolean;
  kind: boolean;
}

/** One stored screen capture record with its run, step, kind, format, geometry and capture time. */
export interface shotrecord {
  id: string;
  runid: string;
  stepid: string;
  kind: string;
  format: captureformat;
  width: number;
  height: number;
  capturedat: number;
  /** Stored image bytes as a data url while the retention window still covers the record. */
  bytes?: string;
  name?: string;
  annotated?: boolean;
  exporttarget?: captureexport;
  target?: string;
  /** True when redactshot regions covered the capture before storage; the masked regions never reach the stored bytes. */
  redacted?: boolean;
  /** The count of redactshot regions the capture seam masked before storage. */
  redactedregions?: number;
  /** True once the retention window expired the bytes; the metadata stays for the audit trail. */
  bytesexpired?: boolean;
}

/** One before and after state pair linked to the action it wraps, with the dom snapshot id of the same moment. */
export interface shotpair {
  id: string;
  beforeid: string;
  afterid: string;
  actionkind: string;
  target?: string;
  domsnapshotid?: string;
  at: number;
}

/** One stored pdf document record of a capturepdf step with its page count, reviewed page size, margins and byte size. */
export interface pdfrecord {
  id: string;
  runid: string;
  stepid: string;
  pages: number;
  /** Paper size in pdf points after the landscape swap. */
  pagewidth: number;
  pageheight: number;
  margins: { top: number; right: number; bottom: number; left: number };
  landscape: boolean;
  scale: number;
  bytes: number;
  at: number;
  /** Stored pdf bytes as a data url while the retention window still covers the record. */
  dataurl?: string;
  name?: string;
  /** True once the retention window expired the bytes; the metadata stays for the audit trail. */
  bytesexpired?: boolean;
}

/** Reviewed pdf print options: paper width and height in inches, margins in inches, scale, landscape and the paginate flag; every bound stays a user choice with no code cap. */
export interface pdfoptions {
  paperwidth?: number;
  paperheight?: number;
  margins?: { top: number; right: number; bottom: number; left: number };
  scale?: number;
  landscape?: boolean;
  paginate?: boolean;
}

/** One stored recording of user activity with its tab, start and end times, format and duration; the frame index survives the byte expiry. */
export interface recordingrecord {
  id: string;
  runid: string;
  stepid: string;
  tabid: number;
  kind: "screen" | "audio";
  scope: "tab" | "run";
  format: string;
  startedat: number;
  endedat?: number;
  duration?: number;
  fps?: number;
  bitrate?: number;
  audio?: boolean;
  /** Ordered frame capture ids of a derived frame sequence recording. */
  frames?: string[];
  /** File reference of the finished artifact routed through the reviewed download flow. */
  file?: string;
  at: number;
  /** Byte size of the derived artifact manifest while the retention window still covers the record. */
  bytes?: number;
  bytesexpired?: boolean;
}

/** Reviewed recording options: scope tab or run, fps, bitrate and the audio flag; fps and bitrate stay user choices with no code ceiling. */
export interface recordingoptions {
  scope?: "tab" | "run";
  fps?: number;
  bitrate?: number;
  audio?: boolean;
}

/** One still frame grabbed from a video element with its source element, reviewed timestamp and poster flag. */
export interface framerecord {
  id: string;
  runid: string;
  stepid: string;
  source: string;
  timestamp: number;
  poster: boolean;
  format: captureformat;
  width: number;
  height: number;
  at: number;
  dataurl?: string;
  name?: string;
  bytesexpired?: boolean;
}

/** One image observed on the page with its url, alt text, dimensions, byte size and mime type. */
export interface imagedescriptor {
  url: string;
  alt: string;
  width: number;
  height: number;
  bytes: number;
  mime: string;
}

/** Reviewed image filter: selector scope, minimum dimensions and a format list; batch sizes and thresholds stay user choices with no code ceilings. */
export interface imagefilter {
  selector?: string;
  minwidth?: number;
  minheight?: number;
  formats?: string[];
}

/** One captured canvas content record with its element, context kind and data url. */
export interface canvasrecord {
  id: string;
  runid: string;
  stepid: string;
  element: string;
  context: "2d" | "webgl";
  width: number;
  height: number;
  format: captureformat;
  at: number;
  dataurl?: string;
  name?: string;
  bytesexpired?: boolean;
}

/** One webrtc media stream probe record with its kind, track count, label and live flag. */
export interface streamrecord {
  id: string;
  runid: string;
  stepid: string;
  kind: string;
  tracks: number;
  label: string;
  live: boolean;
  at: number;
  /** Track details of the probe: kind, label, settings and ready state. */
  detail?: Array<{ kind: string; label: string; width?: number; height?: number; framerate?: number; state: string }>;
}

/** One embedded media source datum with its source url, mime type, duration, dimensions and codecs. */
export interface mediadatum {
  url: string;
  mime: string;
  duration: number;
  width: number;
  height: number;
  codecs: string;
  tracks: string[];
}

/** One collected page asset of kind favicon or logo with its url and byte size. */
export interface assetrecord {
  id: string;
  runid: string;
  stepid: string;
  kind: "favicon" | "logo";
  url: string;
  bytes: number;
  /** Declared icon sizes of the asset, for example 32x32 or any. */
  sizes?: string;
  at: number;
}

/** Reviewed time lapse plan: interval, duration and output format; both windows stay user choices with no code ceilings. */
export interface lapseplan {
  interval: number;
  duration: number;
  format: captureformat;
}

/** Reviewed image conversion directive: source format, target format and quality. */
export interface convertdirective {
  source?: captureformat;
  target: captureformat;
  quality?: number;
}

/** Reviewed thumbnail directive: size, fit and naming suffix; sizes stay user choices with no fixed set. */
export interface thumbdirective {
  size: number;
  fit: "cover" | "contain";
  suffix: string;
}

/** One image batch observed by downloadimages with its filter match counts and the observed image descriptors. */
export interface imagebatch {
  id: string;
  runid: string;
  stepid: string;
  images: imagedescriptor[];
  matched: number;
  downloaded: number;
  at: number;
}

/** One recording consent decision persisted per origin; every recordscreen and captureaudio start needs its own approved prompt. */
export interface recordingconsentrecord {
  id: string;
  prompt: string;
  origin: string;
  stepid: string;
  approved?: boolean;
  usedat?: number;
  at: number;
}

/** The union of media records stored per run: pdf documents, recordings, video frames, canvas contents, stream probes and page assets. */
export type mediarecord = pdfrecord | recordingrecord | framerecord | canvasrecord | streamrecord | assetrecord;

/** One reviewed outbound fetch request: url, method, custom header allowlist, optional body and fetch mode; every request leaves only through a granted origin. */
export interface fetchrequest {
  url: string;
  method?: string;
  /** Reviewed custom headers; the allowlist is the exact set sendfetch transmits and every name needs a reviewed consent before send. */
  headers?: Record<string, string>;
  body?: string;
  mode?: "cors" | "no-cors" | "same-origin";
}

/** Reviewed fetch policy options: timeout, retries, backoff base and redirect follow limit; every bound stays a user choice with no code ceiling. */
export interface fetchoptions {
  timeout?: number;
  retries?: number;
  backoff?: number;
  follow?: number;
}

/** Reviewed stream window for large response bodies: the chunk handler path, the byte budget and the abort flag; the budget stays a user configured ceiling. */
export interface streamwindow {
  budget?: number;
  /** Handler path each chunk passes through; the reviewed step outcome records the chunks and totals. */
  onchunk?: (chunk: string, total: number) => void;
  /** Reviewed abort flag consulted between chunks; a true value stops the stream cleanly. */
  abort?: () => boolean;
}

/** One reviewed json path rule: a dotted path into a parsed body with an optional kind and a default value used on a miss. */
export interface jsonpathrule {
  name: string;
  path: string;
  kind?: "text" | "number" | "boolean" | "json";
  default?: unknown;
}

/** One extracted field of a parsed body: name, source path, value kind and the value, with a miss flag when the path found nothing. */
export interface parsedfield {
  name: string;
  path: string;
  kind: "text" | "number" | "boolean" | "json";
  value?: unknown;
  /** True when the dotted path missed; the default value fills the field and the step outcome reports the miss instead of crashing. */
  missing?: boolean;
}

/** One reviewed html query over fetched markup: selector, optional attribute and the multi flag for all matches versus the first. */
export interface htmlquery {
  selector: string;
  attribute?: string;
  multi?: boolean;
}

/** Field descriptor of a reviewed payload schema: name, kind, required flag and default value. */
export interface payloadfield {
  name: string;
  kind: "string" | "number" | "boolean";
  required?: boolean;
  default?: string | number | boolean;
}

/** Reviewed payload schema of a typed endpoint: field names, kinds, required flags and defaults; rest calls refuse to run without one. */
export interface payloadschema {
  fields: payloadfield[];
}

/** One stored typed endpoint definition: name, method, url template with variables, header allowlist, payload schema and version history. */
export interface endpointrecord {
  name: string;
  method: string;
  /** Url template whose {variables} interpolate from reviewed payload values. */
  url: string;
  headers?: Record<string, string>;
  schema?: payloadschema;
  /** Version of this definition; every stored version stays in the history. */
  version: number;
  at: number;
}

/** One reviewed graphql request: operation text, operation kind, optional variables and operation name. */
export interface graphqlrequest {
  query: string;
  operationkind: "query" | "mutation";
  variables?: Record<string, unknown>;
  operationname?: string;
}

/** One fetch consent decision persisted per origin with the reviewed header names and values and an expiry window; prompts appear once per origin. */
export interface fetchconsent {
  id: string;
  origin: string;
  /** Header names and values shown to the user for review; values never reach the audit trail. */
  headers: Array<{ name: string; value: string }>;
  approved?: boolean;
  /** Expiry timestamp of the reviewed window; expired consents prompt again. */
  expiresat: number;
  at: number;
}

/** One stored api key reference: name, origin scope, header name and the storage id of the secret; the key material itself never enters any audit trail. */
export interface apikeyref {
  name: string;
  origins: string[];
  header: string;
  storageid: string;
  configuredat: number;
}

/** One outbound call record of the run: transport facts, retries, byte counts, parsed fields and errors; bodies expire with the retention window while the metadata survives. */
export interface callrecord {
  id: string;
  runid: string;
  stepid: string;
  kind: "fetch" | "rest" | "graphql";
  url: string;
  origin: string;
  method: string;
  status: number;
  statusclass: string;
  duration: number;
  retries: number;
  bytes: number;
  /** Request header names sent; values never persist anywhere. */
  headernames: string[];
  endpoint?: string;
  /** Response body kept while the retention window covers the record. */
  body?: string;
  /** True once the retention window expired the body; the metadata stays for the audit trail. */
  bodyexpired?: boolean;
  fields?: parsedfield[];
  errors?: string[];
  streambytes?: number;
  at: number;
}

/** Live states of one observed socket or stream channel. */
export type channelstate = "connecting" | "open" | "closed" | "failed";

/** One open observation channel of the run: a websocket or a server sent events stream with its url, origin, live state, message counters and opened time. */
export interface channelrecord {
  id: string;
  runid: string;
  stepid: string;
  kind: "websocket" | "sse";
  url: string;
  origin: string;
  state: channelstate;
  openedat: number;
  /** Protocols the reviewed channel negotiated at open. */
  protocols?: string[];
  /** Count of messages sent on the channel. */
  sent: number;
  /** Count of messages received on the channel. */
  received: number;
  /** Reconnect attempts the channel made after drops. */
  reconnects: number;
  /** Last event id of a server sent events channel, resumed after reconnects. */
  lasteventid?: string;
  closedat?: number;
  /** Last error class of a failed channel, reported for review. */
  error?: string;
}

/** Reviewed socket options: subprotocols, the reconnect attempt budget and the backoff base with its growth ceiling; every bound stays a user choice with no code ceiling. */
export interface socketoptions {
  protocols?: string[];
  reconnect?: number;
  backoff?: number;
  /** Ceiling of one backoff wait in milliseconds so exponential growth stops at the user configured value. */
  backoffceiling?: number;
  /** Lifetime window of the channel in milliseconds; absent means the channel lives until the run ends. */
  lifetime?: number;
}

/** One message envelope multiplexed over a channel: the channel id, the named stream, the payload and the channel scoped sequence number. */
export interface messageenvelope {
  channelid: string;
  stream: string;
  payload: string;
  sequence: number;
  at: number;
}

/** Reviewed message filter of a waitmessage step: the stream name, an optional dotted json path into the payload and the reviewed match limit. */
export interface messagefilter {
  stream?: string;
  path?: string;
  limit?: number;
}

/** One observed request or response exchange of the run with its request headers, url, method, timing and correlation id; headers exist only for exchanges captured through the extension context. */
export interface exchangerecord {
  id: string;
  runid: string;
  stepid: string;
  correlationid: string;
  url: string;
  origin: string;
  method: string;
  /** Request header names and values as captured through the extension context; derived page exchanges carry none. */
  requestheaders?: Record<string, string>;
  /** Response header names and values as captured through the extension context; derived page exchanges carry none. */
  responseheaders?: Record<string, string>;
  status: number;
  statusclass: string;
  /** Error class of a failed request: networkerror, httperror or none. */
  errorclass?: string;
  /** Derived source of the exchange: the page timing buffers or the extension context. */
  source: "page" | "extension";
  initiator?: string;
  timing: number;
  bytes: number;
  /** Mime type of the response body when the exchange captured one. */
  mime?: string;
  /** Reference of the captured response body linked through the correlation id. */
  bodyref?: string;
  /** True once the retention window expired the captured body; the metadata stays for the audit trail. */
  bodyexpired?: boolean;
  at: number;
}

/** One captured response entry: status, headers, byte size and the reference of the stored body. */
export interface responseentry {
  correlationid: string;
  status: number;
  headers: Record<string, string>;
  bytes: number;
  mime?: string;
  bodyref?: string;
  at: number;
}

/** Reviewed header filter: the name allowlist and the redaction list applied before any header value is stored. */
export interface headerfilter {
  allow: string[];
  redact: string[];
}

/** Reviewed body filter: a url pattern, a mime list and the byte ceiling of one captured body; the ceiling stays a user configured value with no code ceiling. */
export interface bodyfilter {
  urlpattern?: string;
  mimes?: string[];
  ceiling?: number;
}

/** One server sent events subscription of the run with its url, last event id and channel state. */
export interface eventsubscription {
  id: string;
  runid: string;
  stepid: string;
  url: string;
  origin: string;
  state: channelstate;
  lasteventid?: string;
  events: number;
  /** Event names observed on the stream. */
  names: string[];
  /** Reviewed cancellation path of the subscription: a stop field or a lifetime window. */
  cancel: { kind: "stop" | "lifetime"; value: string | number };
  /** Reviewed lifetime window of the subscription in milliseconds; absent means the subscription lives until the run ends. */
  lifetime?: number;
  openedat: number;
  closedat?: number;
}

/** Reviewed long poll cursor: the url, the cursor field, the interval, the stop condition and the user configured poll ceiling; every bound stays a user choice with no code ceiling. */
export interface pollcursor {
  url: string;
  cursorfield: string;
  interval: number;
  /** Stop condition evaluated against each polled response: the field value equals the reviewed value. */
  stop: { field: string; equals: string };
  /** Reviewed poll ceiling of the loop; absent means the loop runs until the stop condition, cancellation or plan expiry. */
  maxpolls?: number;
  /** Query parameter name that carries the cursor; absent posts the cursor in the request body. */
  param?: string;
}

/** One discovered page api endpoint of the run: endpoint, method, mime, call frequency and the payload shape derived from captured bodies. */
export interface apimapentry {
  endpoint: string;
  method: string;
  mime: string;
  frequency: number;
  /** Field names of captured json bodies on this endpoint, in first seen order. */
  payloadshape: string[];
  /** Share of captured bodies on this endpoint that parsed as json. */
  jsonshare: number;
  /** Share of captured bodies sharing the same payload shape. */
  stability: number;
  origin: string;
  correlationids: string[];
}

/** Reviewed api replay spec: the endpoint, the parameter overrides applied to the replay and the dotted extraction paths mapped from the response. */
export interface apireplayspec {
  endpoint: string;
  verb?: string;
  overrides?: Record<string, string>;
  paths?: string[];
}

/** One captured response body stored under its reference with its mime type and byte size; the body expires with the retention window while the exchange metadata survives. */
export interface bodyrecord {
  ref: string;
  runid: string;
  correlationid: string;
  url: string;
  mime: string;
  bytes: number;
  at: number;
  /** Stored body text while the retention window covers the record. */
  body?: string;
  /** True once the retention window expired the body; the metadata stays for the audit trail. */
  bodyexpired?: boolean;
}

/** One reviewed request block rule of a run: a url pattern with its origin, an optional resource type list and the run only scope; every rule reverts the moment the run ends, fails or is cancelled. */
export interface blockrule {
  id: string;
  runid: string;
  stepid: string;
  /** Url pattern of the rule: an origin prefix with an optional path pattern. */
  urlpattern: string;
  /** Resource types the rule matches; an absent list matches every resource type. */
  resourcetypes?: string[];
  /** Hit counter of the rule while it stays active; extension initiated requests that matched were refused. */
  hits: number;
  registeredat: number;
  revertedat?: number;
}

/** One reviewed response mock fixture of a run: the served status, headers and body for matched urls, reviewed with its full body before it serves. */
export interface mockspec {
  id: string;
  runid: string;
  stepid: string;
  /** Url pattern the fixture matches. */
  urlpattern: string;
  status: number;
  headers?: Record<string, string>;
  /** Reviewed body of the fixture, served verbatim for matched requests. */
  body?: string;
  /** Reference of a captured body of the 1.1.43 body store the fixture replays; the body resolves from the store and stays out of reports. */
  bodyref?: string;
  /** True once the user reviewed the fixture with its full body. */
  reviewed: boolean;
  /** Hit counter of the fixture while it stays active. */
  hits: number;
  registeredat: number;
  revertedat?: number;
}

/** One reviewed header rewrite rule of a run: the url pattern, header name, operation and value with the provenance of every applied rule kept in the audit trail. */
export interface headerule {
  id: string;
  runid: string;
  stepid: string;
  /** Url pattern the rule matches; the pattern must name its origin explicitly. */
  urlpattern: string;
  name: string;
  operation: "set" | "append" | "remove";
  value?: string;
  /** Hit counter of the rule while it stays active. */
  hits: number;
  registeredat: number;
  revertedat?: number;
}

/** One reviewed cookie of a granted domain: name, domain, path, value and expiry, written through the page bridge of the granted origin and mirrored in storage with timestamps. */
export interface cookierecord {
  name: string;
  domain: string;
  path: string;
  value: string;
  /** Expiry timestamp of the cookie; an absent expiry keeps a session cookie. */
  expiresat?: number;
}

/** One stored cookie operation of a run: the write, read or clear of one cookie of a granted domain with its timestamp; values never enter the audit trail. */
export interface cookieoperation {
  id: string;
  runid: string;
  stepid: string;
  kind: "write" | "read" | "clear";
  domain: string;
  names: string[];
  at: number;
}

/** One reviewed external oauth flow: provider, authorize url, token url, scopes and the redirect origin the code capture watches. */
export interface oauthflow {
  provider: string;
  authorizeurl: string;
  tokenurl: string;
  scopes: string[];
  redirectorigin: string;
}

/** One stored token record of a provider: scopes, origin scope and expiry with the token ids behind storage ids; token values never persist in the record or the audit trail. */
export interface tokenrecord {
  id: string;
  provider: string;
  origin: string;
  scopes: string[];
  /** Storage id of the access token secret; the value stays behind the storage id. */
  accessstorageid: string;
  /** Storage id of the refresh token secret when the flow returned one. */
  refreshstorageid?: string;
  expiresat: number;
  refreshedat?: number;
  revokedat?: number;
  at: number;
}

/** One stored api key entry: name, origin scope, header name and created time with the last use timestamp; the key material stays behind its storage id. */
export interface apikeyentry {
  name: string;
  origins: string[];
  header: string;
  storageid: string;
  createdat: number;
  lastuse?: number;
}

/** One reviewed proxy route of a run: scheme, host, port and the bypass list of origins that stay direct; the route applies for the run only and restores the previous state at run end. */
export interface proxyroute {
  id: string;
  runid: string;
  stepid: string;
  scheme: "http" | "https" | "socks4" | "socks5";
  host: string;
  port: number;
  /** Origins that bypass the route and send direct; a non-empty list is required before the route applies. */
  bypass: string[];
  appliedat: number;
  revertedat?: number;
}

/** One parsed rate limit read of a response: remaining, limit, reset time and origin; the state expires at its reset window. */
export interface ratelimitread {
  origin: string;
  remaining?: number;
  limit?: number;
  /** Reset timestamp of the window in epoch milliseconds. */
  resetat: number;
  at: number;
}

/** One reviewed urlencoded form payload of a postform step: the field list, its urlencoded encoding and the reviewed content type encoding name; the 1.1.76 family carries the encoding beside the fields so the post states its wire shape. */
export interface formpayload {
  url: string;
  fields: Array<{ name: string; value: string }>;
  /** The reviewed encoding name of the payload, such as urlencoded; an absent value keeps the urlencoded grammar. */
  encoding?: string;
}

/** One reviewed multipart upload payload of a postfiles step: the field list, the reviewed files and the boundary that streams the parts without buffering the whole payload. */
export interface multipartpayload {
  url: string;
  fields: Array<{ name: string; value: string }>;
  /** Reviewed files of the upload; every file carries the explicit reviewed flag. */
  files: Array<{ name: string; filename: string; mime: string; content: string; reviewed: boolean }>;
  boundary?: string;
}

/** One reviewed token revocation rule: the token ids, the reason and the revoke time. */
export interface revocationrule {
  tokenids: string[];
  reason: string;
  revokedat: number;
}

/** Console and timeline levels of the reviewed level set, ordered from the most severe to the most verbose. */
export type loglevel = "error" | "warn" | "info" | "log" | "debug" | "trace";

/** One timeline source of the reviewed source grammar: page console output, script errors, promise rejections, resource failures, long tasks, failed network requests and instrumented devtools protocol events. */
export type timelinesource = "console" | "error" | "rejection" | "resource" | "longtask" | "network" | "cdp";

/** One run timeline entry: the time, level, source, step id, message and the run correlation id of its step. */
export interface timelineentry {
  id: string;
  runid: string;
  stepid: string;
  time: number;
  level: loglevel;
  source: timelinesource;
  message: string;
  /** Repeat count after spam collapse collapsed identical messages into one entry. */
  repeat?: number;
}

/** One captured console call: the level, the redacted text, the argument kinds and the repeat count. */
export interface consoleentry {
  level: loglevel;
  text: string;
  /** Kind tags of the serialized arguments, for example string, number, boolean, object or array. */
  argkinds: string[];
  repeat: number;
}

/** One stack frame of a captured error or rejection: the function name, the source url, the line and the column. */
export interface stackframe {
  functionname?: string;
  url: string;
  line: number;
  column?: number;
}

/** One captured javascript error: the message, the stack frames, the source url and the line. */
export interface errorrecord {
  id: string;
  runid: string;
  stepid: string;
  message: string;
  frames: stackframe[];
  sourceurl: string;
  line: number;
  at: number;
}

/** One captured unhandled promise rejection: the reason text and the stack frames. */
export interface rejectionrecord {
  id: string;
  runid: string;
  stepid: string;
  reason: string;
  frames: stackframe[];
  at: number;
}

/** One failed request of the run marked in the timeline: the url, status, error class and the correlation id. */
export interface netfailureentry {
  id: string;
  runid: string;
  stepid: string;
  url: string;
  status: number;
  errorclass: string;
  correlationid: string;
  at: number;
}

/** One captured long task timing: the duration, the start time and the attribution names. */
export interface longtaskentry {
  id: string;
  runid: string;
  stepid: string;
  duration: number;
  starttime: number;
  attributions: string[];
  at: number;
}

/** One reviewed spam rule: the pattern, the window size and the collapse threshold; every bound stays a user configured value with no code ceiling. */
export interface spamrule {
  pattern: string;
  windowsize: number;
  collapse: number;
}

/** One reviewed level set: per step level floors and source filters over the reviewed source grammar. */
export interface loglevelset {
  floors?: Record<string, loglevel>;
  sources?: timelinesource[];
}

/** One reviewed log rotation rule: the max entries kept per run and the overflow target store; the entry count stays a user configured value with no code ceiling. */
export interface rotationrule {
  maxentries: number;
  overflowtarget: string;
}

/** One classified console line of a consolediff: added, removed or repeated, with the repeat count of repeated lines. */
export interface consoleline {
  kind: "added" | "removed" | "repeated";
  text: string;
  count?: number;
}

/** One console diff result between two runs: the added, removed and repeated line classes with their counts. */
export interface consolediff {
  base: string;
  target: string;
  lines: consoleline[];
  added: number;
  removed: number;
  repeated: number;
  at: number;
}

/** One console capture consent decision persisted per origin; console watching on a new origin prompts once and the approved decision persists. */
export interface consoleconsentrecord {
  id: string;
  prompt: string;
  origin: string;
  stepid: string;
  approved?: boolean;
  usedat?: number;
  at: number;
}

/** One log rotation target record with the overflow entry counts moved out of the rolling window. */
export interface rotationtargetrecord {
  target: string;
  runid: string;
  entries: number;
  at: number;
}

/** One run timeline level count summary that survives the entry retention window. */
export interface levelsummary {
  runid: string;
  counts: Record<string, number>;
  at: number;
}

/** One attached devtools protocol session of a run: the tab, the attached time, the enabled domains and the recorded debugger derivation. */
export interface cdpsession {
  id: string;
  runid: string;
  stepid: string;
  tabid: number;
  origin: string;
  attachedat: number;
  /** Enabled domains of the reviewed domain grammar; the enabled set stays a user choice bounded by the reviewed grammar only. */
  domains: string[];
  /** Honest derivation note of the session: the instrumented harness version, because no debugger permission exists in the manifest. */
  debuggerversion: string;
  detachedat?: number;
  /** True when the user detached the debugger and the session record stays alive for review while instrumentation stopped. */
  userdetached?: boolean;
}

/** One reviewed raw protocol command of a session: the method, the params, the domain, the dotted result path and the outcome with duration and error class. */
export interface cdpcommand {
  id: string;
  sessionid: string;
  runid: string;
  stepid: string;
  method: string;
  domain: string;
  params?: Record<string, unknown>;
  /** Dotted result path reviewed so the step result exposes the reviewed slice of the command result. */
  resultpath?: string;
  duration: number;
  /** Error class of a refused or failed command, for example uninstrumented or evaluationerror; protocol errors fail the step. */
  errorclass?: string;
  at: number;
}

/** One reviewed devtools protocol event rule: the domain, the event name and the optional match filter of the subscription. */
export interface cdpeventrule {
  id: string;
  sessionid: string;
  runid: string;
  stepid: string;
  domain: string;
  event: string;
  /** Optional match text an event payload must contain before the event forwards into the run timeline. */
  match?: string;
  /** Matched event counter of the subscription while it stays active. */
  events: number;
  registeredat: number;
  closedat?: number;
}

/** One reviewed breakpoint of a run: the url, line, optional column and condition of the instrumented page hook with its hit counter. */
export interface breakpointspec {
  id: string;
  runid: string;
  stepid: string;
  url: string;
  line: number;
  column?: number;
  /** Condition of the reviewed expression grammar; an absent condition pauses on every hit. */
  condition?: string;
  /** Hit counter of the instrumented hook while it stays active. */
  hits: number;
  registeredat: number;
  revertedat?: number;
}

/** One captured pause state of a run: the reason, the call frames, the hit breakpoint and the dom snapshot reference. */
export interface pausestate {
  id: string;
  runid: string;
  stepid: string;
  reason: string;
  callframes: stackframe[];
  hitbreakpoint?: string;
  /** Reference of the dom state captured through the page bridge snapshot at the pause. */
  domsnapshotid?: string;
  at: number;
  /** True once the retention window expired the call frames and the dom snapshot reference while the pause reason and hit breakpoint survive. */
  framesexpired?: boolean;
}

/** The reviewed code stepping modes of the instrumented debugger: step over, step into, step out and resume. */
export type stepmode = "stepover" | "stepinto" | "stepout" | "resume";

/** One reviewed watch expression of a run: the expression, the pause scope and the values captured at every pause. */
export interface watchexpression {
  id: string;
  runid: string;
  stepid: string;
  expression: string;
  /** Pause scope the expression evaluates in, for example the top call frame of the last pause. */
  scope: string;
  /** True once the user reviewed the expression before evaluation. */
  reviewed: boolean;
  /** Values captured per pause with the pause id, the serialized value and the capture time. */
  values: Array<{ pauseid: string; value: string; at: number }>;
  at: number;
}

/** One reviewed page script override of a run: the url pattern and the full fixture source with its review provenance. */
export interface scriptoverride {
  id: string;
  runid: string;
  stepid: string;
  urlpattern: string;
  /** Full fixture source reviewed before the override runs; the source never enters any report or audit trail. */
  source: string;
  reviewed: boolean;
  reviewedat?: number;
  /** Hit counter of the override while it stays applied. */
  hits: number;
  appliedat: number;
  revertedat?: number;
}

/** The reviewed devtools domain allowlist: the enabled domains and the method gates of a session or a grant. */
export interface cdpallowlist {
  domains: string[];
  /** Method gates of the form Domain.method; when present only gated methods run and an empty list refuses every method. */
  methods?: string[];
}

/** One debugger consent decision per origin: the domains the user consented to and the consent time; the first attachcdp of a run needs the approved record. */
export interface debuggergrant {
  id: string;
  prompt: string;
  origin: string;
  domains: string[];
  approved?: boolean;
  consentedat: number;
  usedat?: number;
  revokedat?: number;
}

/** One reviewed teardown plan of a devtools session attach: the revert steps and the resume policy after teardown. */
export interface teardownplan {
  revertsteps: string[];
  resumepolicy: "resume" | "pause" | "ask";
}

/** One measured flow metric of a run: the reviewed metric name, the window start and end, the duration and the step ids the metric spans. */
export interface flowmetric {
  id: string;
  runid: string;
  stepid: string;
  name: string;
  start: number;
  end: number;
  duration: number;
  /** Step window the metric spans, as reviewed step ids of the flow spec. */
  steps: string[];
  at: number;
}

/** One reviewed flow measurement spec: the performance mark prefix, the step window and the metric list of the reviewed metric set. */
export interface flowspec {
  prefix: string;
  steps: string[];
  metrics: string[];
}

/** One on demand heap snapshot record of a run: the byte size, the node count and the capture time; the heavy bytes expire after the user configured retention window while the metadata survives. */
export interface heaprecord {
  id: string;
  runid: string;
  stepid: string;
  origin: string;
  bytesize: number;
  nodecount: number;
  capturedat: number;
  /** True once the retention window expired the heavy snapshot bytes while the byte and node counts survive. */
  bytesexpired?: boolean;
}

/** One heap growth sample of a run taken beside a step: the timestamp, the used bytes and the limit bytes. */
export interface growsample {
  id: string;
  runid: string;
  stepid: string;
  usedbytes: number;
  limitbytes: number;
  at: number;
}

/** One cpu profile record of a run: the profiled duration, the sample count and the hot function list; the heavy samples expire after the retention window while the counts survive. */
export interface cpuprofile {
  id: string;
  runid: string;
  stepid: string;
  origin: string;
  duration: number;
  samplecount: number;
  /** Hot function names ranked by the sampled time of the profiled window. */
  hotfunctions: string[];
  at: number;
  /** True once the retention window expired the heavy sample payload while the duration, sample count and hot functions survive. */
  samplesexpired?: boolean;
}

/** One layout shift entry of a run: the shift score, the start time and the impacted element selectors. */
export interface shiftentry {
  id: string;
  runid: string;
  stepid: string;
  score: number;
  starttime: number;
  selectors: string[];
  at: number;
}

/** One step annotation of a trace: the step id, the label and the time offset from the trace start. */
export interface traceannotation {
  stepid: string;
  label: string;
  offset: number;
}

/** One recorded trace of a run: the applied category list, the byte size of the exported file, the event count and the step annotations; the heavy file bytes expire after the retention window while the metadata survives. */
export interface tracerecord {
  id: string;
  runid: string;
  stepid: string;
  origin: string;
  categories: string[];
  bytesize: number;
  events: number;
  annotations: traceannotation[];
  startedat: number;
  endedat: number;
  /** True once the retention window expired the heavy trace bytes while the category list, counts and annotations survive. */
  bytesexpired?: boolean;
  exportedat?: number;
}

/** One profiling attach target of a run: the target kind and the target url; iframe and worker targets stay inside the granted origins. */
export interface attachtarget {
  kind: "page" | "iframe" | "worker" | "serviceworker";
  url: string;
  /** Session id of the flattened sub session when the target attaches under a parent devtools session. */
  sessionid?: string;
}

/** One source map reference of a run: the script url, the map url and the parsed state. */
export interface sourcemapref {
  id: string;
  runid: string;
  stepid: string;
  origin: string;
  scripturl: string;
  mapurl: string;
  parsed: boolean;
  at: number;
}

/** One computed heap growth trend of a run: the slope in bytes per millisecond, the sample count and the flagged steps whose growth exceeds the reviewed slope. */
export interface memorytrend {
  runid: string;
  slope: number;
  samples: number;
  flaggedsteps: string[];
  at: number;
}

/** One source map capture consent decision per origin: the approved decision is required before any map file of the origin is fetched. */
export interface sourcemapconsent {
  id: string;
  prompt: string;
  origin: string;
  approved?: boolean;
  consentedat: number;
  usedat?: number;
  revokedat?: number;
}

/** One user curated device preset of the emulation library: the name, width, height, pixel ratio and the mobile flag; every value stays a user choice with no code ceiling. */
export interface devicepreset {
  name: string;
  width: number;
  height: number;
  pixelratio: number;
  mobile: boolean;
}

/** One user curated network preset of the emulation library: the name, latency, download and upload bounds and the offline flag. */
export interface networkpreset {
  name: string;
  latency: number;
  download: number;
  upload: number;
  offline: boolean;
}

/** One user curated location preset of the emulation library: the name, latitude, longitude and accuracy radius. */
export interface locationpreset {
  name: string;
  latitude: number;
  longitude: number;
  accuracy: number;
}

/** One user curated agent preset of the emulation library: the user agent string, the platform and the brand list reported together. */
export interface agentpreset {
  name: string;
  useragent: string;
  platform: string;
  brands: string[];
}

/** One reviewed permission override of a task: the reviewed browser permission name, the target state and the run scope flag. */
export interface permissiongrant {
  name: string;
  state: permissionstate;
  runscope: boolean;
}

/** The reviewed permission states of an override: granted, denied or the browser default prompt. */
export type permissionstate = "granted" | "denied" | "prompt";

/** One reviewed blackbox rule: the url pattern list of third party scripts and the trace scope the rule shapes. */
export interface blackboxrule {
  urlpatterns: string[];
  tracescope: "profiles" | "traces" | "both";
}

/** The emulation layer families: device metrics, network conditions, geographic location, the per task user agent, permission overrides and third party script blackboxing. */
export type emulationfamily = "device" | "network" | "location" | "agent" | "permission" | "blackbox";

/** One emulation layer of a run: the family, the preset or rule name, the origin scope, the apply time, the captured prior state for exact revert and the reviewed revert plan. */
export interface emulationlayer {
  id: string;
  runid: string;
  stepid: string;
  family: emulationfamily;
  name: string;
  originscope: string;
  appliedat: number;
  revertedat?: number;
  /** Prior page state captured at apply time so the revert restores the exact values. */
  prior?: Record<string, unknown>;
  /** True once the retention window expired the prior state while the layer history itself survives. */
  priorexpired?: boolean;
  /** Reviewed revert steps executed in order when the layer reverts. */
  revertplan: string[];
}

/** The emulation state of one run: every active and past layer stacked in apply order; the state persists through service worker restarts and reverts fully at run end. */
export interface emulationstate {
  runid: string;
  tabid: number;
  origin: string;
  layers: emulationlayer[];
  updatedat: number;
}

/** One location override consent decision per origin: the reviewed coordinates are shown in the prompt and the approved decision is required before emulatelocate applies. */
export interface locationconsent {
  id: string;
  prompt: string;
  origin: string;
  latitude: number;
  longitude: number;
  approved?: boolean;
  consentedat: number;
  usedat?: number;
  revokedat?: number;
}

/** One persisted permission override record of a run: the reviewed name, the applied state, the prior state captured for restore and the restore time. */
export interface permissionoverriderecord {
  id: string;
  runid: string;
  stepid: string;
  origin: string;
  name: string;
  state: permissionstate;
  priorstate: permissionstate;
  appliedat: number;
  restoredat?: number;
}

/** One versioned preset library of the user curated device, network, location and agent presets, shareable as one reviewed file. */
export interface presetlibrary {
  version: number;
  devices: devicepreset[];
  networks: networkpreset[];
  locations: locationpreset[];
  agents: agentpreset[];
  exportedat: number;
}

/** The persisted task state of one run: the run id, the step cursor of the last completed step, the recorded outputs and the last checkpoint time; the checksum detects corruption before a resume. */
export interface taskstate {
  runid: string;
  stepcursor: number;
  outputs: stepoutcome[];
  checkpointat: number;
  /** Checksum of the run id, step cursor and outputs so a corrupted checkpoint never resumes. */
  checksum: string;
  /** True once a service worker or browser restart interrupted the run before the cursor reached the end. */
  interrupted?: boolean;
  /** Time the interrupted run was detected, set by the crash detector after a browser restart. */
  crashat?: number;
}

/** One session history event of the run: the event kind, the time, the tab id and the detail; every session event lands in the history with its timestamp. */
export interface sessionevent {
  id: string;
  kind:
    | "persist"
    | "capture"
    | "restore"
    | "name"
    | "diff"
    | "search"
    | "export"
    | "import"
    | "auto"
    | "crash"
    | "resume"
    | "restart";
  at: number;
  tabid?: number;
  detail: string;
}

/** One captured tab of a saved session: the url, title, index, scroll position and the form state captured through the page seam. */
export interface sessiontab {
  url: string;
  title: string;
  index: number;
  scrollx: number;
  scrolly: number;
  forms: Array<{ selector: string; value: string }>;
}

/** One saved browsing session record: the id, the reviewed name, the created time, the captured tabs and the linked capture records. */
export interface sessionrecord {
  id: string;
  name: string;
  createdat: number;
  tabs: sessiontab[];
  /** Capture record ids of the run linked to this session. */
  captures: string[];
  /** Local storage keys captured per granted origin. */
  storage: Array<{ origin: string; keys: string[]; values: string[] }>;
  /** Cookie names captured per granted origin; values stay on the page seam. */
  cookies: Array<{ origin: string; names: string[] }>;
  /** Folder name the record was filed under by a namedsessions step. */
  folder?: string;
  /** Tag list of the reviewed filing. */
  tags: string[];
  /** True when an auto snapshot interval produced the record instead of a reviewed capture step. */
  auto?: boolean;
  /** True once the retention window expired the heavy tab, storage and cookie sections while the record metadata survives. */
  sectionsexpired?: boolean;
  /** True once the record was restored so the sessions view marks it with the restored badge. */
  restoredat?: number;
}

/** The reviewed section toggles of a session snapshot: tabs, scroll positions, form state, local storage and cookies; every toggle stays a user choice. */
export type snapshotscope = "tabs" | "scroll" | "forms" | "storage" | "cookies";

/** The reviewed snapshot plan of a session capture: the scope, the section toggles, the capture link flag and the optional auto snapshot interval. */
export interface snapshotplan {
  scope: "tab" | "run" | "all";
  sections: snapshotscope[];
  captures: boolean;
  auto?: autointerval;
}

/** The reviewed restore plan of a session restore: the tab, form and capture policies the reviewed restore follows. */
export interface restoreplan {
  tabpolicy: "reopen" | "skip";
  formpolicy: "restore" | "skip";
  capturepolicy: "link" | "skip";
}

/** The reviewed auto snapshot interval: the period, the maximum snapshot count and the expiry window; every value stays a user choice with no code ceiling. */
export interface autointerval {
  period: number;
  maxsnapshots: number;
  expiry: number;
}

/** One session folder of the library: the name, the optional parent folder and the tag list. */
export interface sessionfolder {
  name: string;
  parent?: string;
  tags: string[];
}

/** One classified change of a session diff: the change class and the tab, url, form or storage subject with its detail. */
export interface sessionchange {
  class: "added" | "removed" | "changed";
  subject: "tab" | "url" | "form" | "storage";
  detail: string;
}

/** One session diff result: the two compared record ids, the classified changes and the diff time; stored for later review. */
export interface sessiondiff {
  id: string;
  leftid: string;
  rightid: string;
  changes: sessionchange[];
  at: number;
}

/** The searchable fields of a session search: urls, titles, record names and captured text. */
export type searchfield = "urls" | "titles" | "names" | "text";

/** One reviewed session search query: the term list, the searched fields and the optional time window. */
export interface searchquery {
  terms: string[];
  fields: searchfield[];
  from?: number;
  to?: number;
}

/** One session search match: the session id, the matched field, the matched term and the record time window. */
export interface sessionmatch {
  sessionid: string;
  field: searchfield;
  term: string;
  at: number;
  excerpt: string;
}

/** One exported session file: the format version, the packed records, the record ids, the byte size and the checksum verified at import; every record is reviewed before an import adds it. */
export interface sessionfile {
  formatversion: number;
  records: sessionrecord[];
  recordids: string[];
  bytesize: number;
  checksum: string;
  exportedat: number;
}

/** One provenance entry of a workflow run: an expression result or a regex capture with its name, value and time, stored for inspection after the run. */
export interface workflowprovenance {
  runid: string;
  kind: "expression" | "regex" | "binding";
  name: string;
  value: string | number | boolean | string[];
  at: number;
}

/** The persisted auto snapshot state of a run: the reviewed interval, the last snapshot time and the snapshot count inside the reviewed maximum. */
export interface autosnapshotstate {
  interval: autointerval;
  lastat: number;
  count: number;
}

/** One composed workflow record: the id, the reviewed name, the version, the origin grants the workflow stays inside, the frozen expanded step list and the reusable block definitions. */
export interface workflowrecord {
  id: string;
  name: string;
  version: number;
  /** Origin grants the workflow steps must stay inside; composition refuses ungranted origins. */
  origins: string[];
  /** The frozen expanded step list reviewed before any run; blocks never hide steps from review. */
  steps: workflowstep[];
  /** Reusable block definitions the expanded list was flattened from. */
  blocks: workflowblock[];
  /** Derived review grade: a workflow that writes, submits or navigates is sensitive for review. */
  risk: actionrisk;
  /** Review state of an imported workflow or a version rollback: pending stays unrunnable until the user approves the reviewed step list. */
  reviewstate?: "pending" | "approved";
  createdat: number;
}

/** One workflow step: the action kind, the optional target and value, the reviewed JSON options, the output bindings and the human readable label. */
export interface workflowstep {
  id: string;
  kind: actionkind;
  label: string;
  target?: string;
  value?: string;
  options?: string;
  /** Bindings that link the outcome of this step to named variables of the following steps. */
  bindings?: variablebinding[];
  /** Expression evaluated inline before this step runs; the result lands in the named result variable. */
  expression?: expressiontype;
  /** Regex rule applied to the step text before this step runs; the named captures land in scope variables. */
  extract?: regexrule;
  /** Innermost reusable block the step expanded from so runs highlight the active block during nested execution. */
  block?: string;
  /** Breakpoint marker of editor debugging: a debug run pauses before this step. */
  breakpoint?: boolean;
  /** Nested parameters the enclosing block invocation binds into the block scope; expansion stamps them on the first step of the invocation region. */
  params?: nestedparam[];
}

/** One reusable workflow block that nests child steps and further block invocations under a reusable name. */
export interface workflowblock {
  name: string;
  label: string;
  /** Child steps and nested block invocations in execution order. */
  steps: Array<workflowstep | blockinvocation>;
}

/** One block invocation inside a workflow step list or a nested block. */
export interface blockinvocation {
  block: string;
  label: string;
  /** Nested parameters the invocation binds into the block scope before its first step runs. */
  params?: nestedparam[];
}

/** One shareable step template: a named workflow step marked as shareable across workflows. */
export interface steptemplate {
  id: string;
  name: string;
  origin: string;
  step: workflowstep;
  sharedat: number;
}

/** The variable kinds a typed scope holds: strings, numbers, booleans, lists and element references. */
export type variablekind = "string" | "number" | "boolean" | "list" | "element";

/** One variable value of a typed scope with its name, kind, value and set time. */
export interface variablevalue {
  name: string;
  kind: variablekind;
  value: string | number | boolean | string[];
  setat: number;
}

/** One typed variable scope: the scope name, its variables and the optional parent scope it chains to for resolution. */
export interface variablescope {
  name: string;
  variables: variablevalue[];
  parent?: string;
}

/** One variable binding that links a step output path to a named variable of a typed kind. */
export interface variablebinding {
  variable: string;
  kind: variablekind;
  stepid: string;
  /** Dotted path into the step outcome details; an absent path binds the summary. */
  path?: string;
}

/** One expression operand: a variable reference resolved from the nearest scope outward or a literal value. */
export interface expressionoperand {
  ref?: string;
  literal?: string | number | boolean;
}

/** The reviewed expression operators between variables: arithmetic, comparison and logic. */
export type expressionoperator =
  | "add"
  | "subtract"
  | "multiply"
  | "divide"
  | "modulo"
  | "equal"
  | "notequal"
  | "less"
  | "greater"
  | "lessequal"
  | "greaterequal"
  | "and"
  | "or"
  | "not"
  | "concat"
  | "contains"
  | "length";

/** One reviewed expression: the operands, the operator and the result variable with its result kind. */
export interface expressiontype {
  left: expressionoperand;
  right?: expressionoperand;
  operator: expressionoperator;
  result: string;
  resultkind: variablekind;
}

/** One reviewed regex rule: the pattern, the flags and the named capture groups stored as variables. */
export interface regexrule {
  pattern: string;
  flags: string;
  groups: string[];
}

/** One reviewed delay: the base milliseconds and the jitter window the sampled delay stays inside. */
export interface delaystep {
  base: number;
  jitter: number;
}

/** One reviewed element wait: the selector, the timeout and the poll interval; every value stays a user choice with no code ceiling. */
export interface waitstep {
  selector: string;
  timeout: number;
  poll: number;
}

/** The states of a workflow run: pending, running, paused, done, failed and cancelled, beside the 1.1.70 run lifecycle values queued, awaitingapproval, completed and rolledback. */
export type runstate =
  | "pending"
  | "running"
  | "paused"
  | "done"
  | "failed"
  | "cancelled"
  | "queued"
  | "awaitingapproval"
  | "completed"
  | "rolledback";

/** One workflow run: the id, the workflow id, the state, the step cursor of the last checkpoint and the start and end times. */
export interface workflowrun {
  id: string;
  workflowid: string;
  state: runstate;
  /** Index of the next step to execute; every completed step checkpoints the cursor. */
  cursor: number;
  startedat: number;
  endedat?: number;
  /** True when the run evaluates every step with no browser mutation. */
  dryrun?: boolean;
  pausedat?: number;
  cancelreason?: string;
  failreason?: string;
  /** True when the run keeps executing in the service worker with no panel open; checkpoints restore it on every worker wake. */
  background?: boolean;
  /** Why the run paused: a user pause, a watchdog recovery or a browser interruption the startup hook marked. */
  pausekind?: "user" | "watchdog" | "interrupt";
}

/** One runlog entry: the step id, its label, the state, the duration and the outcome details with the bindings produced and consumed. */
export interface runlogentry {
  stepid: string;
  label: string;
  state: "running" | "done" | "failed" | "refused";
  startedat: number;
  duration: number;
  summary: string;
  /** Block name the step executed inside so nested runs highlight the active block. */
  block?: string;
  /** Variable names this step consumed from the scopes. */
  consumed?: string[];
  /** Variable names this step produced into the scopes. */
  produced?: string[];
  /** True once a checkpoint landed after this step so the timeline shows the checkpoint markers. */
  checkpoint?: boolean;
  details?: Record<string, unknown>;
}

/** One condition payload of the 1.1.51 control flow family: the expression tested over the extracted values with no page side effect. */
export interface conditionstep {
  expression: expressiontype;
}

/** One branch path of a branch step: the path name, the optional match expression over page state and extracted values, and the child steps of the path. */
export interface branchpath {
  name: string;
  /** Expression a path must satisfy to be chosen; the else path carries none. */
  when?: expressiontype;
  steps: workflowstep[];
}

/** One branch payload: the named paths with their match expressions and the mandatory else path that terminates every branch. */
export interface branchstep {
  paths: branchpath[];
  else: branchpath;
}

/** One loop payload: the list variable iterated, the item and index variables bound per iteration, the optional user configured safety bound and the child steps of the body. */
export interface loopstep {
  list: string;
  item: string;
  index: string;
  /** User configured maximum iteration count; an absent bound keeps the documented default. */
  bound?: number;
  steps: workflowstep[];
}

/** One repeat until payload: the convergence expression, the optional user configured safety bound and the child steps of the body. */
export interface repeatuntilstep {
  until: expressiontype;
  /** User configured maximum iteration count; an absent bound keeps the documented default. */
  bound?: number;
  steps: workflowstep[];
}

/** One while payload: the loop condition, the mandatory user configured safety bound and the child steps of the body. */
export interface whilestep {
  while: expressiontype;
  /** User configured maximum iteration count; a while loop without a safety bound is refused. */
  bound: number;
  steps: workflowstep[];
}

/** One foreach payload: the selector resolved into element references, the item and index variables bound per iteration and the child steps of the body. */
export interface foreachstep {
  selector: string;
  item: string;
  index: string;
  steps: workflowstep[];
}

/** One parallel branch: the branch id and its child steps executed concurrently in an isolated scope. */
export interface parallelbranch {
  id: string;
  steps: workflowstep[];
}

/** The join policy of a parallel step: the reviewed merge strategy of conflicting variable writes and whether sibling branches cancel or continue on branch failure. */
export interface joinstep {
  strategy: "first" | "last" | "fail";
  onfail: "cancel" | "continue";
}

/** One parallel payload: the concurrent branches and the join policy that merges their outcomes. */
export interface parallelstep {
  branches: parallelbranch[];
  join: joinstep;
}

/** The retry policy of a fragile block: the user configured attempt count with no code ceiling, the backoff shape with base and jitter and the retryable error classes. */
export interface retrypolicy {
  attempts: number;
  backoff: { shape: "fixed" | "exponential"; base: number; jitter: number };
  retryable: string[];
}

/** The error handler of a try step: the catch steps executed on failure and the optional rerun of the body after the handler. */
export interface errorhandler {
  steps: workflowstep[];
  /** True when the body reruns once after the handler steps. */
  rerun?: boolean;
}

/** The timeout policy of a try step: the per step and per run millisecond budgets, both user configured positive values with no code ceiling. */
export interface timeoutpolicy {
  stepms?: number;
  runms?: number;
}

/** One try payload: the fragile body steps, the error handler, the optional retry policy and the optional timeout policy. */
export interface trystep {
  steps: workflowstep[];
  catch: errorhandler;
  retry?: retrypolicy;
  timeout?: timeoutpolicy;
}

/** One loop counter of a run: the step, the iteration path with its nested index trail, the outcome flag and the time, recorded for audit. */
export interface loopcounter {
  stepid: string;
  path: string;
  iteration: number;
  ok: boolean;
  at: number;
}

/** One branch outcome of a run: the step, the chosen path and the reason it was chosen. */
export interface branchoutcome {
  stepid: string;
  path: string;
  reason: string;
  at: number;
}

/** One retry attempt of a run: the step, the attempt number, the backoff delay in milliseconds, the error class and the time. */
export interface retryattempt {
  stepid: string;
  attempt: number;
  delay: number;
  errorclass: string;
  at: number;
}

/** One timeout abort of a run: the step, the exceeded budget in milliseconds, the abort scope and the time. */
export interface timeoutabort {
  stepid: string;
  budget: number;
  scope: "step" | "run";
  at: number;
}

/** One join record of a run: the step, the reviewed merge strategy, the conflicting variable names and the merged variable names. */
export interface joinrecord {
  stepid: string;
  strategy: string;
  conflicts: string[];
  merged: string[];
  at: number;
}

/** One parallel branch outcome: the branch id, its ok flag, its summary and the cancelled marker when the join policy cancelled it. */
export interface paralleloutcome {
  branchid: string;
  ok: boolean;
  summary: string;
  cancelled?: boolean;
}

/** One control flow decision of a run stored for audit: the branch, loop, retry, timeout, join, parallel or catch decision of one control step. */
export interface controlflowdecision {
  runid: string;
  stepid: string;
  kind: "branch" | "loop" | "retry" | "timeout" | "join" | "parallel" | "catch";
  at: number;
  branch?: branchoutcome;
  loops?: loopcounter[];
  retries?: retryattempt[];
  timeouts?: timeoutabort[];
  join?: joinrecord;
  branches?: paralleloutcome[];
  catch?: { errorclass: string; message: string; rerun: boolean };
}

/** The trigger rule families of the 1.1.52 release: page visits, url patterns, context menu entries, keyboard shortcuts, the toolbar button, cron schedules, intervals, url lists, webhooks and page events. */
export type triggerfamily =
  | "visit"
  | "url"
  | "menu"
  | "key"
  | "button"
  | "cron"
  | "interval"
  | "urllist"
  | "webhook"
  | "event";

/** One armed trigger rule: the family, the reviewed match payload, the workflow reference, the runtime state with its cooldown and the per rule counters; every rule passes the arm review before it can fire. */
export interface triggerule {
  id: string;
  kind: triggerfamily;
  /** The composed workflow this rule launches; evaluation skips the rule when the workflow is no longer composed. */
  workflowid: string;
  /** Human readable label of the rule shown in the trigger list. */
  label: string;
  /** Visited HTTPS origins a visit rule fires on. */
  origins?: string[];
  /** Glob url pattern a url rule matches against navigations. */
  pattern?: string;
  /** Context menu entry title of a menu rule. */
  title?: string;
  /** Command name of a keyboard shortcut rule plus the suggested key binding. */
  command?: string;
  key?: string;
  /** Five field cron expression of a cron rule with its optional timezone name. */
  cron?: string;
  timezone?: string;
  /** Interval period in milliseconds with the optional jitter window of an interval rule. */
  period?: number;
  jitter?: number;
  /** Url list a urllist rule runs its workflow across. */
  urls?: string[];
  /** Shared secret of a webhook rule; it never leaves the store and only its verified payloads persist. */
  secret?: string;
  /** Payload schema of a webhook rule: named fields of reviewed primitive kinds, required ones enforced at verification. */
  schema?: webhookfield[];
  /** Observed page event names an event rule subscribes to, drawn from the observed event catalog. */
  events?: string[];
  /** User configured cooldown window in milliseconds; an absent value keeps the documented family default. */
  cooldown?: number;
  state: triggerstate;
  stats: rulestats;
  createdat: number;
}

/** One webhook payload schema field of a webhook rule: the field name, its primitive kind and whether verification requires it. */
export interface webhookfield {
  name: string;
  kind: "string" | "number" | "boolean";
  required?: boolean;
}

/** The runtime state of one armed trigger rule: the enabled flag, the effective cooldown window, the pause marker, the last and next fire times. */
export interface triggerstate {
  enabled: boolean;
  /** Effective cooldown window in milliseconds between two fires of the rule. */
  cooldown: number;
  /** Time of the last fire; fires inside the cooldown window after it are suppressed. */
  lastfireat?: number;
  /** Next scheduled fire time of a cron or interval rule. */
  nextfireat?: number;
  /** Pause marker set while the session pauses; queued fires drain on resume. */
  pausedat?: number;
}

/** The per rule counters of the trigger history view: fires, launches and cooldown or dedupe suppressions. */
export interface rulestats {
  fires: number;
  launches: number;
  suppressions: number;
}

/** One trigger fire record: the rule, the time, the cause, the triggering url, title and payload carried into the run context. */
export interface triggerfire {
  id: string;
  ruleid: string;
  at: number;
  cause: string;
  /** Triggering url of a visit, url, urllist or navigation driven fire. */
  url?: string;
  /** Triggering page title carried into the run context. */
  title?: string;
  /** Trigger payload such as the verified webhook body or the observed event name. */
  payload?: Record<string, unknown>;
}

/** One manual run request with its step preview: the expanded step list rendered before confirmation so a human always sees what a run will do. */
export interface manualrun {
  id: string;
  workflowid: string;
  /** The rendered step preview shown before confirmation. */
  preview: Array<{ stepid: string; kind: string; label: string; block?: string; control?: Record<string, unknown> }>;
  /** The confirmation outcome after the user approved or cancelled; an undecided preview stays open. */
  confirmed?: boolean;
  decidedat?: number;
  at: number;
}

/** One canvas node of the workflow editor: the workflow step or the block invocation it renders with its canvas position. */
export interface editornode {
  /** The canvas node id: the step id, or the invocation id of a loaded block invocation which stays unique even when one block is invoked many times. */
  id?: string;
  /** The workflow step this node renders; absent on a block invocation node. */
  step?: workflowstep;
  /** The block invocation this node renders; absent on a plain step node. */
  invocation?: blockinvocation;
  x: number;
  y: number;
}

/** One canvas edge of the workflow editor: a typed binding socket that links the output of one step into the input of a later step. */
export interface editoredge {
  from: string;
  to: string;
  variable: string;
  kind: variablekind;
  /** Dotted path into the source step outcome details; an absent path binds the summary. */
  path?: string;
}

/** The layout state of the canvas: the canvas size, the viewport origin and the zoom factor. */
export interface editorlayout {
  width: number;
  height: number;
  viewportx: number;
  viewporty: number;
  zoom: number;
}

/** The mini map state: the mini canvas size, the projection scale from canvas coordinates and the viewport rectangle inside it. */
export interface minimapstate {
  width: number;
  height: number;
  /** Projection scale from canvas coordinates to mini map coordinates. */
  scale: number;
  zoom: number;
  /** The viewport rectangle in mini map coordinates. */
  viewport: { x: number; y: number; width: number; height: number };
}

/** The full canvas model the editor edits: the nodes, the typed edges, the block definitions, the layout, the mini map, the undo and redo stacks and the dirty marker. */
export interface editormodel {
  workflowid: string;
  name: string;
  version: number;
  origins: string[];
  nodes: editornode[];
  edges: editoredge[];
  blocks: workflowblock[];
  layout: editorlayout;
  minimap: minimapstate;
  /** Undo snapshots, newest last; a snapshot never carries its own nested history. */
  undo?: editormodel[];
  /** Redo snapshots, newest last; a new edit clears them. */
  redo?: editormodel[];
  dirty: boolean;
}

/** The five categories of the block palette: actions, control flow, waits, variables and triggers. */
export type palettecategory = "actions" | "controlflow" | "waits" | "variables" | "triggers";

/** One palette descriptor of the block palette: the drop kind, its label, its category and its description. */
export interface palettenode {
  kind: string;
  label: string;
  category: palettecategory;
  description: string;
}

/** One step library entry: the action kind, its palette category and its reviewed option schema. */
export interface steplibraryentry {
  kind: string;
  category: palettecategory;
  optionschema: Array<{ name: string; kind: "string" | "number" | "boolean"; required?: boolean }>;
}

/** One local workflow version: the version number, its timestamp and the change note beside the step count and risk grade. */
export interface workflowversion {
  workflowid: string;
  version: number;
  createdat: number;
  note: string;
  steps: number;
  risk?: actionrisk;
  /** True when the version was created by rolling an older version back; the rollback review gates its first run. */
  rollback?: boolean;
}

/** One version diff result: the added, removed and changed steps between two workflow versions. */
export interface versiondiff {
  workflowid: string;
  from: number;
  to: number;
  added: Array<{ stepid: string; kind: string; label: string }>;
  removed: Array<{ stepid: string; kind: string; label: string }>;
  changed: Array<{ stepid: string; kind: string; label: string; changes: string[] }>;
  at: number;
}

/** One run history entry: the outcome, the executed step count, the duration and the trigger cause of one execution. */
export interface runhistoryentry {
  runid: string;
  workflowid: string;
  outcome: string;
  steps: number;
  total: number;
  duration: number;
  cause: string;
  startedat: number;
  endedat: number;
  dryrun?: boolean;
}

/** The export formats of a workflow file: json or yaml. */
export type exportformat = "json" | "yaml";

/** One exported workflow file: the file format version, the export time, the workflow record, the change note and the packed step templates. */
export interface workflowfile {
  format: 1;
  exportedat: number;
  workflow: workflowrecord;
  note?: string;
  templates: steptemplate[];
}

/** One nested parameter of a block invocation: the name, the variable kind and the default value bound into the block scope. */
export interface nestedparam {
  name: string;
  kind: variablekind;
  default?: string | number | boolean | string[];
}

/** One pending workflow import held for review: the parsed record stays unrunnable until the user approves it. */
export interface workflowimport {
  id: string;
  record: workflowrecord;
  importedat: number;
  filename?: string;
  /** The flowlibrary manifest version the record resolved from; an absent version marks a plain file import outside the library. */
  libraryversion?: string;
}

/** One per site policy override of a workflow: the origin pattern and the reviewed policy knobs it adjusts. */
export interface siteoverride {
  id: string;
  workflowid: string;
  pattern: string;
  deltas: Record<string, number>;
  createdat: number;
}

/** The watchdog configuration: the stall threshold and the recovery action, both user configured values with no code ceiling. */
export interface watchdogconfig {
  enabled: boolean;
  /** Milliseconds without a completed step after which a running run grades stalled. */
  stallthreshold: number;
  action: "retry" | "pause" | "cancel";
  /** Window after which a running run with no live executor reaps as a zombie of a browser shutdown. */
  zombiewindow?: number;
}

/** One watchdog event: the run it touched, the verdict and the recovery outcome. */
export interface watchdogrecord {
  id: string;
  runid: string;
  verdict: "stalled" | "zombie" | "healthy";
  action: "retry" | "pause" | "cancel" | "reap" | "none";
  outcome: string;
  at: number;
}

/**
 * Agent protocol contracts of the 1.1.54 family: the mcp tool catalog, json rpc frames, capability sets, client records, the stdio bridge and the server config.
 * Every tool call lands behind the same consent gates that govern the panels, and no endpoint, provider or key is ever hardcoded — the protocol speaks to any client the user pairs.
 */

/** The tool namespaces of the mcp server: every tool name carries its domain prefix so clients address `browser.click`, `workflow.run`, `memory.audit` or `system.status` without collisions. */
export type toolnamespace = "browser" | "workflow" | "memory" | "system";

/** The transports an mcp client may ride: the stdio bridge for local client processes and the http listener for posted envelopes. */
export type transportkind = "stdio" | "http";

/** The lifecycle states of the mcp server: stopped by default, running once the user enables it, idle between paired client sessions. */
export type serverstate = "stopped" | "running" | "idle";

/** The json rpc error codes of the agent protocol: parse, method, params, internal and consentrefused map onto the classic json rpc numbers with consentrefused reserved for gate refusals. */
export type rpcerrorcode = "parse" | "method" | "params" | "internal" | "consentrefused";

/** One json rpc error payload: the code name, the human readable message and optional structured data. */
export interface rpcerror {
  code: rpcerrorcode;
  message: string;
  data?: unknown;
}

/** One json rpc frame: a request carries the id, method and params while a response carries the same id with either a result or an error; notifications omit the id. */
export interface jsonrpcframe {
  jsonrpc: "2.0";
  id?: number | string | null;
  method?: string;
  params?: Record<string, unknown>;
  result?: unknown;
  error?: rpcerror;
}

/** One typed property of a tool input schema: the json schema type, the plain language description, the required flag and the reviewed default value. */
export interface toolschemaproperty {
  type: "string" | "number" | "boolean" | "object" | "array";
  description: string;
  required?: boolean;
  /** Reviewed default value the server applies when a client omits the property. */
  default?: string | number | boolean | Record<string, unknown>;
}

/** The json schema of one tool input: typed properties, the required property names and the default values the server applies when a client omits them. */
export interface toolschema {
  type: "object";
  properties: Record<string, toolschemaproperty>;
  required: string[];
}

/** The consent metadata of a sensitive tool: the plain language review requirement the panel renders before the tool may run, the policy derived risk class, the approval gate requirement and the origin scope the tool executes under. */
export interface consentmeta {
  review: string;
  /** Risk class policy derives from the wrapped action kind; read tools carry no gate metadata. */
  riskclass?: actionrisk;
  /** True when the tool requires an explicit approval gate before a remote client may call it. */
  approvalrequired?: boolean;
  /** Origin scope the tool executes under: the session grants restrict every call. */
  originscope?: "session";
}

/** One mcp tool definition: the namespaced name, the version appended for compatibility checks, the description that states the consent class and side effects in plain language, the json schema of its inputs, the reviewed action kind it wraps, its risk grade and the consent metadata of tools with side effects. */
export interface tooldef {
  name: string;
  version: number;
  description: string;
  inputschema: toolschema;
  /** The reviewed action kind this tool wraps; policy validates it against the action kind grammar. */
  kind: actionkind;
  /** The risk grade of the wrapped action kind; policy re-derives it and refuses a mismatch. */
  risk: actionrisk;
  /** Consent metadata required on every tool with side effects. */
  consentmeta?: consentmeta;
}

/** One tool domain of the catalog: the namespace that prefixes its tool names, the domain version and the tools it exposes. */
export interface tooldomain {
  namespace: toolnamespace;
  version: number;
  tools: tooldef[];
}

/** The mcp tool catalog: the catalog version and the four tool domains with their versions and consent metadata. */
export interface toolcatalog {
  version: number;
  domains: tooldomain[];
}

/** One result of a tool call: the human readable content, the structured payload and the error flag that carries tool failures inside a successful json rpc result. */
export interface toolresult {
  content: string;
  payload?: Record<string, unknown>;
  iserror: boolean;
}

/** The capability set exchanged during negotiation: the protocol version, the server identity, the tool compatibility floor, the offered tool count, the namespaces and the allowed transports; the 1.1.56 family adds the client declared model capabilities of sampling, prompt rendering and streaming. */
export interface capabilityset {
  protocolversion: string;
  name: string;
  version: string;
  /** The numeric protocol major a client declares in its capability set: the frozen declaration form of the protocolv2 negotiation — the deprecated full version string the version one clients exchanged left the wire at the 2.0.0 sunset, so the negotiation reads the number and never the string. */
  protocolmajor?: number;
  /** Tool compatibility floor: tools with a version below the negotiated floor are refused. */
  toolversion: number;
  tools: number;
  namespaces: toolnamespace[];
  transports: transportkind[];
  /** True when the client model accepts sampling callbacks. */
  sampling?: boolean;
  /** True when the client renders prompt tools. */
  prompts?: boolean;
  /** True when the client consumes streamed result chunks. */
  streaming?: boolean;
}

/** One connected mcp client: the id, the transport it rides, the negotiated capability set, the pairing state the user approves and the connection timestamps. */
export interface clientrecord {
  id: string;
  transport: transportkind;
  /** The capability set negotiated with this client. */
  capabilities?: capabilityset;
  /** Tool compatibility floor this client negotiated; tools with a version below it are refused. */
  toolfloor?: number;
  /** Fingerprint of the remote client identity; local stdio clients carry none. */
  fingerprint?: string;
  /** Client name metadata of the 1.1.84 serve mode: the client declares its name during the initialize handshake and every audit entry of its calls records it. */
  name?: string;
  /** Client version metadata of the 1.1.84 serve mode: the declared version of the client build the audit trail records beside the name. */
  clientversion?: string;
  /** True once the user approved the session for this client; unpaired clients never dispatch tools. */
  paired: boolean;
  connectedat: number;
  /** Approval decision time of the pairing prompt. */
  pairedat?: number;
  lastseenat?: number;
  disconnectedat?: number;
}

/** One entry of the mcp server routing table: the json rpc method name, the plain language description and the internal handler the server routes matching frames to; the 1.1.84 serve mode adds the resource, batch and health handlers. */
export interface methodentry {
  method: string;
  handler:
    | "initialize"
    | "ping"
    | "listtools"
    | "negotiate"
    | "dispatch"
    | "listprompts"
    | "callprompt"
    | "cancel"
    | "listresources"
    | "readresource"
    | "subscriberesource"
    | "unsubscriberesource"
    | "batch"
    | "health";
  description: string;
}

/** The user configured mcp server state: the bind address with localhost as the documented default, the port, the allowed transports, the user configured frame size and queue depth with no code ceiling, the explicit user enablement flag and the reviewed flag a remote bind requires. */
export interface mcpserverconfig {
  bind?: string;
  port: number;
  transports: transportkind[];
  /** User configured maximum serialized frame size; an absent value never refuses a frame. */
  framesize?: number;
  /** User configured request queue depth per client; an absent value keeps the queue unbounded. */
  queuedepth?: number;
  /** User configured retention window for stored tool call records; an absent window keeps every record while the audit trail always survives. */
  callretention?: number;
  /** True once the user enabled the server; the server never starts without it. */
  enabled: boolean;
  /** True once the user reviewed the remote bind; a bind outside localhost is refused without it. */
  remote?: boolean;
  /** The http stream transport config of the 1.1.55 family: the posted endpoint path, the stream channel path, tls termination and the heartbeat rhythm. */
  httpstream?: httpstreamconfig;
  /** The remote access policy of the 1.1.55 family: the advertised endpoint, the required tls mode, the client ceiling and the token and approval windows. */
  remoteaccess?: remoteconfig;
  /** User configured shutdown drain window in milliseconds of the 1.1.84 serve mode: the shutdown waits this long for in flight calls before it stops; an absent window keeps the drain unbounded because the wait stays a user choice. */
  drainwindow?: number;
}

/** The persisted runtime state of the mcp server: the server state, the stdio bridge status, the auth challenge of the pending remote handshake and the last transition times; the 1.1.84 serve mode adds its concurrent transports, the read only degradation flag and the drain phase of the shutdown. */
export interface mcpserverstate {
  state: serverstate;
  /** The stdio bridge status while the server runs. */
  bridge?: stdiobridge;
  /** The auth challenge issued to the newest remote client; the handshake verifies its nonce before the pairing exchange. */
  challenge?: authchallenge;
  startedat?: number;
  stoppedat?: number;
  /** The running serve transports of the 1.1.84 serve mode: the stdio pipes and the http listener may run at the same time on separate channels, each with its own endpoint. */
  transports?: servetransport[];
  /** True when the 1.1.84 serve mode runs degraded to read only tools because no origin grant covers the session. */
  degraded?: boolean;
  /** The drain phase of the 1.1.84 shutdown: draining waits for the in flight calls before the exit. */
  drain?: { phase: "draining" | "stopped"; waiting: number; at: number };
}

/** The stdio bridge of one local client process: the native messaging host name, the connection state, the process id, the restart counter and the frame counters of both relay directions. */
export interface stdiobridge {
  id: string;
  host: string;
  connected: boolean;
  /** Process id of the launched client process. */
  pid?: number;
  startedat: number;
  restarts: number;
  received: number;
  sent: number;
  lastframeat?: number;
  /** True when the platform verifier confirmed the client signature of the 1.1.95 hardening; absent when the platform allows no signature verification. */
  clientverified?: boolean;
}

/** One stdio bridge launch event: the host manifest, the process id, the restart marker and the time. */
export interface bridgelaunch {
  id: string;
  host: string;
  pid: number;
  restart: boolean;
  at: number;
}

/** The call classes of the 1.1.85 native transport: every native call carries exactly one class and the consent gate asks per class, so a read grant never widens into an interaction or a sensitive surface. */
export type nativecallclass = "read" | "interaction" | "sensitive";

/** The native surfaces of the 1.1.85 companion process: the os dialog and the notification surfaces the capability negotiation enumerates and the consent gate guards one by one. */
export type nativesurfacekind = "osdialog" | "notification";

/** The persisted install state of the 1.1.85 native host: the host name, the extension id the manifest allows, the installer and companion versions, the attach state, the wsbridge port and the last errors the diagnostics read; an absent record leaves the transport deny by default. */
export interface nativehoststate {
  installed: boolean;
  /** The native messaging host name the manifest registered; the name stays the user's choice. */
  hostname?: string;
  /** The extension id the host manifest allows origins for; the template carries its placeholder until the installer fills it. */
  extensionid?: string;
  /** The installer version that wrote the manifest; the upgrade path compares it for one major version of protocol compatibility. */
  installerversion?: string;
  /** The companion build version the handshake reported; an absent version marks a host that never answered. */
  companionversion?: string;
  /** The native bridge protocol version the handshake reported. */
  companionprotocol?: string;
  /** The port state of the native messaging port: detached, attached or crashed, with the reattach marker of the crash recovery. */
  port: "detached" | "attached" | "crashed";
  /** The localhost port the wsbridge advertised; zero until the host reports one. */
  wsbridgeport?: number;
  installedat?: number;
  attachedat?: number;
  updatedat?: number;
  /** The last structured errors of the native transport, newest first, for the diagnostics command. */
  lasterrors?: nativeerror[];
}

/** One structured error of the 1.1.85 native transport: the family the failure belongs to, the message, the retry hint and the time, so a native failure maps to its next action instead of a bare throw. */
export interface nativeerror {
  family: "handshake" | "port" | "bridge" | "surface" | "installer";
  message: string;
  /** The retry hint the structured error carries: none, reconnect or reinstall, so the caller knows the next action. */
  retry: "none" | "reconnect" | "reinstall";
  at: number;
}

/** One native call record of the 1.1.85 audit trail: the correlation id that spans the run, the surface, the call class, the outcome, the refusal reason and the time; the record never carries payload bytes or key material. */
export interface nativecallrecord {
  id: string;
  /** The correlation id the extension stamps on every native frame of one run. */
  correlationid: string;
  surface: string;
  callclass: nativecallclass;
  outcome: "ok" | "refused" | "error";
  /** The policy reason a refused call names; an ok or error outcome carries none. */
  reason?: string;
  at: number;
}

/** The kill switch stamp of the 1.1.85 native transport: one press engages the switch and every native call stops instantly until the user releases it. */
export interface nativekillswitch {
  engaged: boolean;
  at: number;
}

/** The handshake the 1.1.85 companion process answers: the build version, the native bridge protocol version, the surfaces it exposes and the wsbridge port it advertises. */
export interface companionhandshake {
  build: string;
  protocol: string;
  surfaces: nativesurfacekind[];
  /** The localhost port the wsbridge bound; zero when the bridge stays down. */
  wsbridgeport: number;
}

/** One wsbridge session of the 1.1.85 native transport: the localhost port, the token hash (never the raw token), the idle window, the connection slots and the frame counters. */
export interface wsbridgesession {
  id: string;
  port: number;
  /** The sha-256 hash of the per session token; the raw token exists on the wire and in the extension memory only, never in a log or an audit entry. */
  tokenhash: string;
  boundat: number;
  /** The idle window in milliseconds after which a quiet session expires; an absent window never expires. */
  idlewindow?: number;
  lastframeat?: number;
  expiresat?: number;
  /** True while exactly one extension side holds the session; a second extension connection refuses. */
  extensionconnected: boolean;
  /** The count of authenticated client connections the session holds. */
  connections: number;
  received: number;
  sent: number;
}

/** The frame shape the 1.1.85 native transport carries over the native port: the servercontract envelope body with the correlation id, the frame kind and the payload; the payload never carries key vault material. */
export interface nativeframe {
  kind: "handshake" | "call" | "event" | "heartbeat" | "advertisement" | "error";
  /** The correlation id one run stamps on every frame so the host and the extension correlate across a whole run. */
  correlationid: string;
  /** The session id the origin and session checks validate; an anonymous frame refuses. */
  sessionid?: string;
  body?: Record<string, unknown>;
}

/** The mcp tool call record: the calling client, the namespaced tool name, the origin the call ran under, the outcome flag, the json rpc error code when the call was refused and the time; the 1.1.56 family adds the call id, the idempotency key, the dry run, mock and batch markers and the replay marker so the audit trail names every call without exception. */
export interface toolcallrecord {
  id: string;
  clientid: string;
  tool: string;
  origin: string;
  ok: boolean;
  code?: rpcerrorcode;
  at: number;
  /** The call context id of the 1.1.56 family when the call ran through the call runtime. */
  callid?: string;
  /** The idempotency key the client attached; a repeated key replays the stored result. */
  idempotencykey?: idempotencykey;
  /** True when the call ran as a tool dry run with no side effects. */
  dryrun?: boolean;
  /** True when a tool mock answered the call without touching the browser. */
  mocked?: boolean;
  /** The batch call id when the call ran as a batch member. */
  batchid?: string;
  /** True when the answer replayed a stored idempotent result instead of executing. */
  replayed?: boolean;
}

/**
 * Agent protocol part two contracts of the 1.1.55 family: the http stream transport with tls, session tokens, pairing codes, client allowlists, approval gates and the auth handshake for remote clients.
 * Nothing remote runs without a paired, allowed and authenticated client, and no certificate, endpoint, provider or key is ever hardcoded — every endpoint, window and ceiling stays a user choice.
 */

/** The stored form of a session token: the sha-256 hex digest of the raw token value under the `sha256:` prefix; the raw token itself never persists. */
export type tokenhash = string;

/** The lifecycle states of a pairing code: pending until redeemed while a used or expired code never pairs a second client. */
export type pairingstate = "pending" | "used" | "expired";

/** The lifecycle states of an approval gate: pending until the user decides while refused and expired gates never execute. */
export type approvalstate = "pending" | "approved" | "refused" | "expired";

/** The tls modes of the remote transport: off keeps the documented localhost default, on negotiates and required refuses any unverified peer. */
export type tlsmode = "off" | "on" | "required";

/** The auth methods of the handshake: the one time pairing code exchange, the stored session token and the client certificate. */
export type authmethod = "pairingcode" | "token" | "certificate";

/** The tls termination settings of a transport: the user chosen mode, the sha-256 fingerprint of the user installed certificate and the time the peer was last verified. */
export interface tlsconfig {
  mode: tlsmode;
  /** Sha-256 fingerprint of the user installed certificate; remote traffic requires a match when set. */
  certificatefingerprint?: string;
  verifiedat?: number;
}

/** The http stream transport config: the json rpc endpoint path remote clients post frames to, the server sent event channel path streams flow through, the tls termination settings and the user configured heartbeat rhythm. */
export interface httpstreamconfig {
  endpoint: string;
  streampath: string;
  tls: tlsconfig;
  /** User configured heartbeat interval of the event channels; an absent value keeps the documented default. */
  heartbeatms?: number;
  /** User configured idle window after which a silent channel counts as dead; an absent value keeps the documented default. */
  idlewindowms?: number;
}

/** One remote client identity: the fingerprint the allowlist matches and the display name the approval prompts carry. */
export interface clientidentity {
  fingerprint: string;
  displayname: string;
}

/** One session token of a paired remote client: the client it belongs to, its stored tokenhash form (never the raw token), the tool namespaces its scopes grant, the issue and expiry times and the revocation time. */
export interface sessiontoken {
  id: string;
  clientid: string;
  hash: tokenhash;
  scopes: toolnamespace[];
  issuedat: number;
  expiresat: number;
  revokedat?: number;
}

/** One pairing code for a one time client pairing: the human copied code, the tool namespaces it grants, the issue and expiry times and the single use state. */
export interface pairingcode {
  code: string;
  scopes: toolnamespace[];
  issuedat: number;
  expiresat: number;
  usedat?: number;
}

/** One client allowlist entry: the client identity fingerprint, the granted tool namespaces and the grant history of every scope change. */
export interface allowlistentry {
  fingerprint: string;
  displayname: string;
  namespaces: toolnamespace[];
  grantedat: number;
  /** Grant history: every scope change lands with its actor, time and plain language change. */
  history: Array<{ at: number; actor: string; change: string }>;
}

/** One approval gate raised for a sensitive tool call: the calling client, the tool, the reason in plain language, the full call arguments, the fields the user marked secret, the pending state and the timeout that refuses by default. */
export interface approvalrequest {
  id: string;
  clientid: string;
  tool: string;
  reason: string;
  params: Record<string, unknown>;
  /** Fields the user marked secret; their values are redacted in prompts and audit records. */
  secretfields?: string[];
  state: approvalstate;
  raisedat: number;
  /** Configurable refusal window; a gate left unanswered past this time refuses by default. */
  timeoutat?: number;
  decidedat?: number;
  actor?: string;
}

/** One approval execution record: the gate it closes, the decision, the acting user, the time and the latency from the raise to the decision. */
export interface approvalexec {
  requestid: string;
  decision: approvalstate;
  actor: string;
  at: number;
  /** Latency in milliseconds from the gate raise to the decision. */
  latencyms: number;
}

/** One auth challenge of the remote handshake: the method it authenticates, the single use nonce and the expiry. */
export interface authchallenge {
  nonce: string;
  method: authmethod;
  issuedat: number;
  expiresat: number;
}

/** One auth handshake event with its outcome: the client, the method, the issued, verified or refused outcome and the time. */
export interface authhandshakeevent {
  id: string;
  clientid: string;
  method: authmethod;
  outcome: "issued" | "verified" | "refused";
  at: number;
}

/** The approval gate timeout: the user configured pending window in milliseconds and the documented default disposition of an unanswered gate — refusal. */
export interface approvaltimeout {
  windowms: number;
  ontimeout: "refuse";
}

/** The remote access policy of the mcp server: the advertised endpoint, the required tls mode, the user configured client ceiling and the token and approval windows; an absent ceiling keeps the client count unbounded. */
export interface remoteconfig {
  endpoint: string;
  tls: tlsconfig;
  /** User configured maximum paired remote clients; an absent value keeps the count unbounded. */
  maxclients?: number;
  /** User configured session token lifetime; an absent value keeps the documented default. */
  tokenlifetimems?: number;
  approvaltimeout?: approvaltimeout;
}

/** One server sent event channel of the http stream transport: the client it streams to, the open and heartbeat times, the last event time and the close time. */
export interface streamchannel {
  id: string;
  clientid: string;
  openedat: number;
  lastbeatat: number;
  lasteventat?: number;
  closedat?: number;
}

/**
 * Agent protocol part three contracts of the 1.1.56 family: event subscriptions, resource watchers, sampling callbacks, prompt tools, streaming chunks, progress notices, in flight cancellation, per client rate limits, structured errors with retry hints, idempotency keys, batch calls, tool dry runs, tool mocks and the call contexts that isolate concurrent clients.
 * Every frame still passes the same consent gates — the protocol layer never bypasses review — and every window, budget and ceiling stays a user choice with no code ceiling and no hardcoded endpoint, provider or key.
 */

/** The protocol event kinds a client may subscribe to: callstarted mirrors every tool call including calls with side effects while the rest stay observation kinds. */
export type eventkind =
  | "callstarted"
  | "callresult"
  | "streamchunk"
  | "progress"
  | "resourcedelta"
  | "sampling"
  | "cancellation";

/** One event subscription of a paired client: the event kinds it listens to, the optional origin and tool filters that narrow delivery and the lifecycle times. */
export interface protocoleventsubscription {
  id: string;
  clientid: string;
  kinds: eventkind[];
  /** Optional origin filter: only events of this origin reach the subscriber. */
  origin?: string;
  /** Optional tool name filter: only events of this namespaced tool reach the subscriber. */
  tool?: string;
  createdat: number;
  lastdeliveredat?: number;
  canceledat?: number;
}

/** One resource watcher of a paired client: the watched page state resource, the page state baseline at watch time and the lifecycle times. */
export interface resourcewatch {
  id: string;
  clientid: string;
  /** The watched resource name of the page state, for example the page snapshot resource of the session tab. */
  resource: string;
  /** The page state baseline captured at watch time; deltas compare against it. */
  baseline: Record<string, unknown>;
  createdat: number;
  lastdeliveredat?: number;
  canceledat?: number;
}

/** One sampling callback to a client model: the prompt that leaves the browser, the optional system text, the page content the user granted, the lifecycle state and the provenance times. */
export interface samplingrequest {
  id: string;
  clientid: string;
  prompt: string;
  system?: string;
  /** Page content the user granted for this callback; stripped before the prompt leaves when the user granted none. */
  pagecontent?: string;
  /** User granted maximum tokens of the callback completion; an absent value leaves the size to the client. */
  maxtokens?: number;
  state: "pending" | "answered" | "refused";
  requestedat: number;
  answeredat?: number;
  /** The client answer once it arrives; the provenance records the client and the times. */
  answer?: string;
}

/** One prompt def exposed as a callable tool: the prompt name, the plain language description, the declared arguments and the render template. */
export interface promptdef {
  name: string;
  description: string;
  /** Declared arguments of the prompt with their descriptions, required markers and reviewed defaults. */
  arguments: Array<{ name: string; description: string; required?: boolean; default?: string }>;
  /** The render template; every double braced argument placeholder substitutes its value. */
  template: string;
}

/** One stream chunk of a progressive tool result: the call it belongs to, the sequence number, the content slice, the done marker and the time. */
export interface streamchunk {
  callid: string;
  seq: number;
  content: string;
  done: boolean;
  at: number;
}

/** One progress notice of a long tool call: the call it belongs to, the optional percent, the plain language message, the cancellable hint and the time. */
export interface progressnotice {
  callid: string;
  percent?: number;
  message: string;
  /** True when the user may cancel the in flight call. */
  cancellable: boolean;
  at: number;
}

/** One cancellation frame that aborts an in flight tool call: the call id, the reason in plain language and the time. */
export interface cancelframe {
  callid: string;
  reason?: string;
  at: number;
}

/** One per client rate limit of tool calls: the counting window, the user configured call budget inside it and the live counters; an absent budget keeps the client unbounded. */
export interface callratelimit {
  clientid: string;
  windowms: number;
  /** User configured call budget per window; an absent value documents the unbounded choice instead of a silent default. */
  budget?: number;
  windowstartedat: number;
  used: number;
}

/** The retry hints of a structured error: retry marks retryable failures, wait marks busy windows with their retry after and none marks consent refusals that never retry. */
export type retryhint = "retry" | "wait" | "none";

/** One structured error answer of a tool call: the error code, the message in plain language, the retry hint and the optional retry after window. */
export interface structurederror {
  code: string;
  message: string;
  retryhint: retryhint;
  retryafter?: number;
}

/** The idempotency key of a tool call: the client chosen key that replays the stored result for a repeated call. */
export type idempotencykey = string;

/** One stored idempotency record: the key, the calling client, the tool, the stored result for replay and the expiry of the user configured window. */
export interface idempotencyrecord {
  key: idempotencykey;
  clientid: string;
  tool: string;
  result: toolresult;
  createdat: number;
  expiresat: number;
}

/** One member of a batch call: the member id, the namespaced tool name and the call arguments. */
export interface batchmember {
  id: string;
  name: string;
  params: Record<string, unknown>;
}

/** One batch call of a paired client: the ordered tool calls, the stop on first error flag, the per call outcomes and the lifecycle times. */
export interface batchcall {
  id: string;
  clientid: string;
  calls: batchmember[];
  stoponerror: boolean;
  state: "pending" | "running" | "done" | "stopped";
  createdat: number;
  finishedat?: number;
  outcomes: batchoutcome[];
}

/** One outcome of a batch member: the member id, the tool, the outcome flag, the result or the structured error and the time. */
export interface batchoutcome {
  callid: string;
  tool: string;
  ok: boolean;
  result?: toolresult;
  error?: structurederror;
  at: number;
}

/** One tool dry run result: the tool, the argument validation findings, the consent evaluation, the executed marker that stays false and the mutation list that stays empty. */
export interface tooldryrun {
  callid: string;
  tool: string;
  argsvalid: boolean;
  consentok: boolean;
  findings: string[];
  /** A dry run never executes anything; the purity gate refuses any record that claims otherwise. */
  executed: boolean;
  /** A dry run leaves no page mutation; the purity gate refuses any record that claims one. */
  mutations: string[];
  at: number;
}

/** One tool mock for client testing: the namespaced tool it stands in for, the canned result it returns, the test context flag and the creation time. */
export interface toolmock {
  tool: string;
  result: toolresult;
  /** True only in test contexts; policy refuses mocks outside them. */
  testcontext: boolean;
  createdat: number;
}

/** One call context that isolates concurrent client state: the call id, the client, the tool, the lifecycle state, the idempotency key, the dry run and batch markers, the chunk counter and the partial result a cancellation preserves. */
export interface callcontext {
  callid: string;
  clientid: string;
  tool: string;
  state: "inflight" | "done" | "cancelled" | "failed";
  startedat: number;
  endedat?: number;
  idempotencykey?: idempotencykey;
  dryrun?: boolean;
  batchid?: string;
  chunks: number;
  errorcode?: string;
  /** The partial result preserved when a cancellation aborts the call in flight. */
  partial?: toolresult;
}

/**
 * Mcp server mode contracts of the 1.1.84 family: the serve state with its concurrent transports, the client bindings that isolate concurrent clients onto one extension session each, the client metadata the audit trail records, the served resources and prompts the serve mode publishes, the health resource with its uptime, the drain phases of the shutdown and the read only degradation when no origin grant covers a client.
 * The serve mode shares the policy gates, the kind catalog, the memory store and the progress store with the extension engine instead of growing a second engine; every port, window and ceiling stays a user choice with no code default and no endpoint or key is ever hardcoded.
 */

/** One transport endpoint of the running serve mode: the transport kind and the address it serves on — the stdio transport rides the process pipes of the spawned serve process while the http transport rides its own localhost port, and both may run at the same time on separate channels. */
export interface servetransport {
  kind: transportkind;
  /** The address the transport serves on: the stdio transport names the process pipes while the http transport names the localhost bind with its own port. */
  endpoint: string;
  startedat: number;
}

/** One client binding of the serve mode: the client paired with exactly one extension session so concurrent clients hold isolated sessions, the session token that carries its scopes and the read only degradation flag when no origin grant covers the client. */
export interface clientbinding {
  clientid: string;
  /** The extension session this client pairs with; two live clients never share one session. */
  sessionid: string;
  /** The session token id that carries the scopes of this binding. */
  tokenid?: string;
  /** True when the client runs degraded to read only tools because no origin grant covers it. */
  readonly: boolean;
  boundat: number;
  releasedat?: number;
}

/** One served mcp resource of the serve mode: the uri, the plain language description and the mimetype of the content it serves. */
export interface servedresource {
  uri: string;
  name: string;
  description: string;
  mimetype: string;
}

/** The health resource content of the serve mode: the extension version, the protocol version, the server contract version, the uptime and the serve state — no payload, no origin and no client identity rides the health line. */
export interface servehealth {
  version: string;
  protocolversion: string;
  servercontractversion: number;
  uptime: number;
  state: string;
  at: number;
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

/**
 * Multi agent part one contracts of the 1.1.58 family: agent identities bound to tabs with user named roles, the shared task queue with lanes, priorities, claims and work stealing, agent mailboxes with direct, broadcast and role addressed routing, the blackboard shared memory with its sections and entry kinds, per agent budgets and permission scopes, sub agent spawn requests with depth limits and the killswitch that halts every agent at once.
 * Every value here stays a user choice: the agent count, the role names, the lane names, the priority scale, the freshness windows and the depth ceilings carry no code default and no hardcoded cap, and every agent proposal still passes the same human review the single agent passed.
 */

/** The lifecycle states of one agent of the swarm: active, paused by the user or stopped. */
export type agentstate = "active" | "paused" | "stopped";

/** The role an agent plays. The five internal roles carry their documented defaults while the user may attach any custom role name; a custom role grades with the worker defaults until the user narrows its scope. */
export type agentrole = "planner" | "worker" | "observer" | "critic" | "verifier" | (string & {});

/** One agent identity of the swarm: the id, the user chosen name for dashboards and audit, the role, the bound tab and session, the parent of a sub agent with its depth, the lifecycle state and the per agent budget and scope the user configured. */
export interface agentidentity {
  id: string;
  /** User chosen display name; the naming stays a user choice so dashboards and audit read the names the user typed. */
  name: string;
  role: agentrole;
  /** The tab this agent is bound to; one tab holds at most one agent. */
  tabid?: number;
  /** The session the bound tab runs under when one is active. */
  sessionid?: string;
  /** The parent agent id of a sub agent; a root agent carries none. */
  parentid?: string;
  /** The recursion depth of this agent; root agents sit at zero and every spawn adds one. */
  depth: number;
  state: agentstate;
  /** Per agent budget ceilings the user configured; absent ceilings stay unbounded. */
  budget?: agentbudget;
  /** Per agent permission scope; absent scope fields stay unbounded inside the session grants. */
  scope?: agentscope;
  /** Free form metadata the user attached for dashboards and audit. */
  metadata?: Record<string, unknown>;
  registeredat: number;
  heartbeatat?: number;
}

/** The claim states of one task item: queued waits for a claim, claimed runs under one agent, done completed and cancelled left the queue. */
export type taskstatekind = "queued" | "claimed" | "done" | "cancelled";

/** One task of the shared queue: the id, the lane it waits in, the user configured priority, the payload in plain language and the claim state. */
export interface taskitem {
  id: string;
  lane: string;
  /** User configured priority; a higher number runs first inside the lane. */
  priority: number;
  /** The task payload in plain language; the review reads it exactly as typed. */
  payload: string;
  state: taskstatekind;
  enqueuedat: number;
}

/** One claim of a task by an agent: the agent id, the task id and the heartbeat time that keeps the claim alive. */
export interface claimrecord {
  agentid: string;
  taskid: string;
  claimedat: number;
  heartbeatat: number;
}

/** The completion policy of a queue: all requires every task to complete while any completes with the first finished task. */
export type queuecompletionpolicy = "all" | "any";

/** The shared task queue of the swarm: the user configured lane names, the user configured priority scale, the completion policy, the task items and the live claims. */
export interface taskqueue {
  /** Lane names the user configures; work stealing may cross lanes inside one approved swarm. */
  lanes: string[];
  /** The priority values the user configures; the scale itself stays a user choice. */
  priorities: number[];
  completionpolicy: queuecompletionpolicy;
  items: taskitem[];
  claims: claimrecord[];
}

/** The routing kinds of one agent message: direct to one agent, broadcast to every agent or addressed to a role. */
export type messagerouting = "direct" | "broadcast" | "role";

/** One message between agents: the sender id, the recipient (an agent id, the broadcast marker or a role name), the routing kind, the payload and the read tracking. */
export interface agentmessage {
  id: string;
  senderid: string;
  /** The agent id of a direct message, the role name of a role addressed message or the broadcast marker `*`. */
  recipient: string;
  routing: messagerouting;
  payload: string;
  sentat: number;
  readat?: number;
}

/** One agent mailbox: the inbox of received messages, the outbox of sent messages and the unread count. */
export interface agentmailbox {
  agentid: string;
  inbox: agentmessage[];
  outbox: agentmessage[];
  unread: number;
}

/** The blackboard sections the swarm shares: goals, facts, findings and scratch. */
export type blackboardsection = "goals" | "facts" | "findings" | "scratch";

/** The value kinds of one blackboard entry: plain text or a json payload. */
export type blackboardvaluekind = "text" | "json";

/** One blackboard entry: the key, the value kind and value, the author agent id or the user marker, the section, the consent class inherited from the source extraction and the retirement time. */
export interface blackboardentry {
  id: string;
  key: string;
  valuekind: blackboardvaluekind;
  value: string;
  /** The author agent id or `user` for entries the human posted. */
  author: string;
  section: blackboardsection;
  /** The consent class of the source extraction this entry carries; every reader sees the class. */
  consentclass: actionrisk;
  postedat: number;
  retiredat?: number;
}

/** The blackboard shared memory of one swarm: the sections in use, every entry and the user configured retirement window; an absent window keeps every entry. */
export interface blackboard {
  sections: blackboardsection[];
  entries: blackboardentry[];
  /** User configured freshness window in milliseconds; entries older than the window retire on the pass. */
  retirementwindow?: number;
}

/** One per agent budget: the token, cost and step ceilings the user configured; every ceiling is a user choice and an absent ceiling stays unbounded. */
export interface agentbudget {
  agentid: string;
  maxtokens?: number;
  maxcost?: number;
  /** Ceiling on executed steps; an absent value never refuses a step. */
  maxsteps?: number;
  /** Ceiling on the run duration in milliseconds; an absent value never refuses a step. */
  maxdurationms?: number;
  currency?: string;
  configuredat: number;
}

/** One per agent permission scope: the origins and the tool namespaces granted to the agent; the grants stay inside the session grant list. */
export interface agentscope {
  agentid: string;
  origins: string[];
  toolnamespaces: toolnamespace[];
  /** The action kinds this agent may execute; an absent list stays unbounded inside the session grants while a configured list narrows every step. */
  actionkinds?: string[];
  /** True when the scope stays read only: the observer agents read the page and the fleet state but never act on it. */
  readonly?: boolean;
}

/** One fleet record of the 1.1.72 family: the registry entry every agent run attributes its work to, with the unique lowercase name the user chose, the role, the home origin and the live control state. */
export interface agentrecord {
  id: string;
  /** The unique lowercase fleet name; the agentname helper assigns it and refuses duplicates and reserved words. */
  name: string;
  role: agentrole;
  /** The home origin the agent works from; the scope intersection keeps every step inside the session grants. */
  origin: string;
  /** The live control state: active runs, paused holds only this agent and stopped leaves the fleet history. */
  state: "active" | "paused" | "stopped";
  registeredat: number;
  lastseenat?: number;
}

/** One fleet budget state of the 1.1.72 family: the spent steps, tokens and duration of one agent against its user configured ceilings; absent ceilings never refuse. */
export interface budgetstate {
  agentid: string;
  spentsteps: number;
  spenttokens: number;
  spentdurationms: number;
  /** User configured ceilings copied from the agentbudget grant; an absent ceiling stays unbounded. */
  maxsteps?: number;
  maxtokens?: number;
  maxdurationms?: number;
  updatedat: number;
}

/** One spawn request of a sub agent: the parent id, the requested role, the task in plain language and the depth of the child. */
export interface spawnrequest {
  parentid: string;
  role: agentrole;
  task: string;
  depth: number;
}

/** The depth limit of sub agent recursion the user configures; the killswitch and the refusal message read it exactly. */
export interface depthlimit {
  /** User configured ceiling on sub agent recursion depth; an absent limit stays unbounded. */
  maxdepth?: number;
}

/** The killswitch state: engaged halts every agent of the swarm at once; the switch stays available with no configuration barrier. */
export interface killswitch {
  engaged: boolean;
  engagedat?: number;
  reason?: string;
}

/** One recorded spawn of a sub agent linking its parent agentid to its child for the audit history; the 1.1.73 family carries the parent objective the child works on beside the lineage. */
export interface spawnrecord {
  id: string;
  parentid: string;
  childid: string;
  role: agentrole;
  depth: number;
  /** The parent objective in plain language the spawned child works on; the lineage reads what the parent handed over. */
  objective?: string;
  at: number;
}

/** The per agent usage counters held against the agent budget: the accumulated tokens, cost and executed steps. */
export interface agentusage {
  agentid: string;
  tokens: number;
  cost: number;
  steps: number;
  updatedat: number;
}

/** The lifecycle event kinds of the swarm: registration, role assignment, tab binding, spawn, pause, resume, stop, the killswitch, the queue events, the mailbox delivery and the blackboard writes. */
export type agenteventkind =
  | "register"
  | "assign"
  | "bind"
  | "spawn"
  | "pause"
  | "resume"
  | "stop"
  | "killall"
  | "enqueued"
  | "claimed"
  | "stole"
  | "completed"
  | "requeued"
  | "cancelled"
  | "delivered"
  | "posted"
  | "retired";

/** One agent lifecycle event notification: the event kind, the agent and task it names, the summary in plain language and the time. */
export interface agentevent {
  id: string;
  kind: agenteventkind;
  agentid?: string;
  taskid?: string;
  summary: string;
  at: number;
}

/** One swarm state snapshot: every agent identity, the shared task queue with its items and claims, every mailbox and the killswitch state. */
export interface swarmstate {
  agents: agentidentity[];
  queue: taskqueue;
  mailboxes: agentmailbox[];
  killswitch: killswitch;
}

/**
 * Multi agent part two contracts of the 1.1.59 family: the leader worker topology with worker assignments, critic reviews and verifier checks over agent outputs, the planner executor split, tab handoffs between agents mid run, resource locks keyed by origin and selector with conflict scans, result merging with provenance into one report, the progressboard layout, review requests between agents, escalations that lift an agent decision to the user, arbitration rules that order competing resource claims and consensus rounds with quorum.
 * Every value here stays a user choice: the election rule, the worker scale bound, the quorum, the lock kinds and the merge rules carry no code default, and coordination never bypasses the human review.
 */

/** The verdict of one critic review: approve passes the output, changes demands the listed rework and reject refuses the output. */
export type reviewverdict = "approve" | "changes" | "reject";

/** The leader worker topology of one swarm: the leader agent id, the worker, critic and verifier lanes and every worker assignment; the rule names how the leader was elected. */
export interface leaderworker {
  id: string;
  leaderid: string;
  workerids: string[];
  criticids: string[];
  verifierids: string[];
  assignments: workerassignment[];
  /** The user configured election rule that picked the leader: `first` takes the first registration while `named` takes the agent the user named. */
  rule: { kind: "first" | "named"; agentid?: string };
  electedat: number;
}

/** One assignment linking a worker to a task slice: the worker id, the task id, the slice description in plain language and the assignment time. */
export interface workerassignment {
  workerid: string;
  taskid: string;
  /** The slice of the task this worker owns, in plain language; the review reads it exactly as typed. */
  slice: string;
  assignedat: number;
}

/** One critic review of an agent output: the critic agent, the reviewed agent and task, the verdict, the issues found and the changes the output requires. */
export interface criticreview {
  id: string;
  reviewerid: string;
  subjectagentid: string;
  taskid?: string;
  verdict: reviewverdict;
  issues: string[];
  requiredchanges: string[];
  reviewedat: number;
}

/** The outcome of one verifier check: pass confirms the claim against the page while fail refutes it. */
export type verifieroutcome = "pass" | "fail";

/** One verifier check of a result claim: the verifier agent, the agent whose claim is checked, the claim in plain language, the method the verifier used and the pass or fail outcome with its evidence. */
export interface verifiercheck {
  id: string;
  verifierid: string;
  claimagentid: string;
  taskid?: string;
  claim: string;
  /** The verification method the verifier used, named by the user; the method grade reads it. */
  method: string;
  outcome: verifieroutcome;
  evidence?: string;
  checkedat: number;
}

/** The planner executor split of one task: the plan owner agent drafts while the run owner agent executes, and the executor reports every step outcome back to the planner. */
export interface plannerexecutor {
  id: string;
  planownerid: string;
  runownerid: string;
  taskid?: string;
  stepreports: executorreport[];
  splitat: number;
}

/** One step outcome an executor reports back to the planner agent: the step id, the outcome, the detail in plain language and the report time. */
export interface executorreport {
  stepid: string;
  outcome: "done" | "failed";
  detail: string;
  reportedat: number;
}

/** The states of one tab handoff: prepared packages the transfer, transferred moved the tab binding and resumed continued the task from the packaged state. */
export type handoffstate = "prepared" | "transferred" | "resumed";

/** One handoff request: the transferring agent, the receiving agent, the tab id and the packaged task state with the reason; the transfer preserves the original session grants. */
export interface handoffrequest {
  id: string;
  fromagentid: string;
  toagentid: string;
  tabid?: number;
  /** The packaged task state in plain language; the resume continues exactly from it. */
  taskstate: string;
  reason?: string;
  createdat: number;
}

/** One handoff record: from and to agents, the tab, the packaged task state, the handoff state and the transfer and resume times. */
export interface handoffrecord {
  id: string;
  fromagentid: string;
  toagentid: string;
  tabid?: number;
  taskstate: string;
  state: handoffstate;
  reason?: string;
  createdat: number;
  transferredat?: number;
  resumedat?: number;
}

/** The kinds of one resource lock: exclusive holds the resource alone while shared admits further shared holders only. */
export type lockkind = "exclusive" | "shared";

/** One resource lock of the swarm: the key composed of exactly one origin and one selector so a lock never spans unrelated origins, the holder agent, the kind and the expiry. */
export interface resourcelock {
  /** The lock key composed of the origin and the selector; the scope gate refuses keys that span more than one origin. */
  key: string;
  holder: string;
  kind: lockkind;
  origin: string;
  selector: string;
  acquiredat: number;
  /** User configured expiry time; a lock past its expiry returns to the pool on the sweep. */
  expiresat?: number;
}

/** One writer of a conflict scan: the agent, the origin and selector it targets and its task. */
export interface conflictwriter {
  agentid: string;
  origin: string;
  selector: string;
  taskid?: string;
}

/** One conflict scan result: the writers examined, the overlapping targets with their writers, the suggested ordering and the clean marker when no writes overlap. */
export interface conflictscan {
  id: string;
  writers: conflictwriter[];
  overlaps: Array<{ origin: string; selector: string; writers: string[] }>;
  /** The suggested ordering of the writers for the overlapping targets, by agent id so the suggestion stays deterministic. */
  suggestedorder: string[];
  clean: boolean;
  scannedat: number;
}

/** The merge rules for duplicate rows and conflicting values: first keeps the earliest value, last keeps the latest, preferagent keeps the value of the agent the user named and fail refuses the merge. */
export type mergerule = "first" | "last" | "preferagent" | "fail";

/** One merge entry mapping a parallel result into the final report: the agent, its task, the key and value and the conflict resolution note when other agents wrote the same key. */
export interface mergeentry {
  id: string;
  agentid: string;
  taskid?: string;
  key: string;
  value: string;
  /** The conflict resolution note in plain language; an entry without a conflict carries none. */
  conflict?: string;
  mergedat: number;
}

/** One section of a result report: the title, the merged entries and the agents that sourced them. */
export interface reportsection {
  title: string;
  entries: mergeentry[];
  sources: string[];
}

/** One result report across agents: the sections, the contributing agent sources and the confidence the user reviews; every merged value keeps its provenance. */
export interface resultreport {
  id: string;
  title: string;
  sections: reportsection[];
  sources: string[];
  /** The confidence in the report stated in plain language; the value stays what the agents reported, never an engine score. */
  confidence?: string;
  createdat: number;
}

/** One milestone of a progressboard lane: the label, the done marker and the time the milestone completed. */
export interface boardmilestone {
  label: string;
  done: boolean;
  at?: number;
}

/** One lane of the progressboard: the agent, its role, its lifecycle state, its lane name, the current task and the milestones of its run. */
export interface boardlane {
  agentid: string;
  name: string;
  role: string;
  state: string;
  lane: string;
  currenttask?: string;
  milestones: boardmilestone[];
}

/** The progressboard layout of one swarm: one lane per agent so the user reads every agent at once, with the milestones each agent reported. */
export interface progressboard {
  id: string;
  lanes: boardlane[];
  builtat: number;
}

/** The states of one review request between agents: open waits, acked confirms receipt, answered carries the verdict and timeout expired unanswered. */
export type reviewrequeststate = "open" | "acked" | "answered" | "timeout";

/** One review request routed between agents: the requesting agent, the reviewing agent, the subject and payload and the ack, answer and timeout times. */
export interface reviewrequest {
  id: string;
  fromagentid: string;
  toagentid: string;
  subject: string;
  payload: string;
  state: reviewrequeststate;
  requestedat: number;
  ackedat?: number;
  answeredat?: number;
  /** The user configured answer deadline; a request past it without an answer times out on the sweep. */
  timeoutat?: number;
}

/** One fleet review record of the 1.1.72 family: one agent output carried to a peer agent for review with the reviewer verdict recorded beside the original output. */
export interface reviewrecord {
  id: string;
  fromagentid: string;
  toagentid: string;
  subject: string;
  /** The original output under review, exactly as the requesting agent produced it. */
  output: string;
  state: "open" | "answered";
  /** The reviewer verdict the reviewing agent recorded beside the original output. */
  verdict?: reviewverdict;
  /** The issues the reviewer named with the verdict; an approving verdict may carry none. */
  issues?: string[];
  requestedat: number;
  answeredat?: number;
}

/** One escalation that lifts an agent decision to the user: the agent, the subject, the full context and the decision only the user writes. */
export interface escalationrecord {
  id: string;
  agentid: string;
  subject: string;
  context: string;
  /** The step the escalation stands on; the sidepanel reads the step context beside the agent question. */
  stepid?: string;
  state: "open" | "decided";
  /** The decision the user wrote; an open escalation carries none because escalations stay human decided. */
  decision?: string;
  raisedat: number;
  decidedat?: number;
}

/** The arbitration strategies that order competing resource claims: priority follows the user ordered agent list, age gives the oldest claim the resource and leader lets the elected leader decide. */
export type arbitrationstrategy = "priority" | "age" | "leader";

/** One arbitration rule the user configures: the strategy and, for the priority strategy, the agent order that wins competing claims. */
export interface arbitrationrule {
  id: string;
  strategy: arbitrationstrategy;
  /** The user ordered agent ids of the priority strategy; the first named agent wins a competing claim. */
  priorityorder: string[];
  configuredat: number;
}

/** One vote of a consensus round: yes, no or abstain with the voting agent and the time. */
export type consensusvote = "yes" | "no" | "abstain";

/** One consensus round: the subject, the collected votes, the user configured quorum and the state the votes resolve. */
export interface consensusround {
  id: string;
  subject: string;
  votes: Array<{ agentid: string; vote: consensusvote; votedat: number }>;
  /** The number of yes votes the round needs to carry; a user configured value with no engine default. */
  quorum: number;
  state: "open" | "carried" | "failed";
  openedat: number;
  closedat?: number;
}

/** One fleet consensus record of the 1.1.72 family: the votes of every agent on one proposal with the tally, the quorum rule and the outcome, the dissenting votes included. */
export interface consensusrecord {
  id: string;
  proposal: string;
  votes: Array<{ agentid: string; vote: consensusvote; reason?: string; castat: number }>;
  tally: { yes: number; no: number; abstain: number };
  /** The yes votes the proposal needs to carry; a user configured value with no engine default. */
  quorum: number;
  outcome: "carried" | "failed" | "open";
  closedat?: number;
}

/** One fleet replay capture of the 1.1.72 family: the ordered steps and results of one agent run kept for audit, rebuildable from the audit trail when the run memory is gone. */
export interface replayrecord {
  id: string;
  agentid: string;
  runid: string;
  steps: Array<{ stepid: string; kind: string; summary: string; state: string; at: number }>;
  /** True when the capture was rebuilt from the audit trail because the run memory was gone. */
  reconstructed?: boolean;
  capturedat: number;
}

/** One fleet output comparison of the 1.1.72 family: two competing agent outputs aligned field by field with the matching, conflicting and missing fields named. */
export interface comparisonrecord {
  id: string;
  subject: string;
  left: { agentid: string; fields: Record<string, string> };
  right: { agentid: string; fields: Record<string, string> };
  matching: string[];
  conflicting: string[];
  missing: string[];
  comparedat: number;
}

/** One sub agent spawn specification of the 1.1.73 family: the parent objective in plain language the child works on, the depth of the child in the lineage, the requested role and the optional narrowing of the parent scope. */
export interface subagentspec {
  parentid: string;
  objective: string;
  depth: number;
  role?: agentrole;
  /** Optional narrowing of the parent scope: the child keeps only the parent origins and action kinds it names, and a widening past the parent refuses. */
  narrowscope?: { origins?: string[]; actionkinds?: string[] };
}

/** One cell of the merged aggregate report: one agent output paired with its source run so the provenance of every section stays visible. */
export interface aggregatecell {
  agentid: string;
  runid?: string;
  section: string;
  output: string;
}

/** One merged aggregate report of the 1.1.73 family: the parallel agent outputs merged into one document with per agent sections and their provenance, the conflicts resolved by the user configured policy order or left open for the escalation. */
export interface aggregaterecord {
  id: string;
  subject: string;
  cells: aggregatecell[];
  /** The sections two agents both wrote: each names the agent that resolved it through the policy order or stays unresolved for the escalation. */
  conflicts: Array<{ key: string; resolvedby?: string }>;
  /** The agents the aggregation waits on before it merges; an absent list merges the cells it carries. */
  expected?: string[];
  state: "open" | "merged";
  mergedat?: number;
  createdat: number;
}

/** One interleaved timeline event of the 1.1.73 family: one action of one agent ordered inside the merged fleet view with its lane kept visible. */
export interface interleaveevent {
  id: string;
  agentid: string;
  kind: string;
  summary: string;
  lane: string;
  at: number;
}

/** One reusable lesson of the 1.1.73 family: the finding of a finished run in plain language, its origin, its reuse count and its decay window. */
export interface lessonrecord {
  id: string;
  agentid: string;
  finding: string;
  origin: string;
  reusecount: number;
  recordedat: number;
  lastusedat?: number;
}

/** One arbitration case of the 1.1.73 family: a contested resource with its origin, the requesting agents and the state of its verdict. */
export interface arbitrationcase {
  id: string;
  resource: string;
  origin: string;
  requesterids: string[];
  state: "open" | "granted" | "released";
  verdict?: arbitrationverdict;
  openedat: number;
  closedat?: number;
}

/** One arbitration verdict of the 1.1.73 family: the holder agent, the lane the verdict honored and the plain language reason of the grant. */
export interface arbitrationverdict {
  holderagentid: string;
  lane: string;
  reason: string;
  grantedat: number;
}

/** One priority lane of the 1.1.73 family: the lane name, the user configured priority and the agents assigned to the lane; the interactive lane holds the sensitive steps. */
export interface tasklane {
  name: string;
  priority: number;
  agentids?: string[];
  /** True when the lane stays interactive: the sensitive steps always serve through it whatever lane asked for them. */
  interactive?: boolean;
}

/** One load report sample of the 1.1.73 family: the worker concurrency and the wait latency of one origin at sample time. */
export interface loadreport {
  origin: string;
  concurrency: number;
  latency: number;
  sampledat: number;
}

/** One cost entry of the 1.1.73 family shared ledger: the agent that caused the cost, the run it belongs to, the units spent and the plain language description of what the units bought. */
export interface costentry {
  agentid: string;
  runid?: string;
  units: number;
  description: string;
  at: number;
}

/** One interleaved action of the swarm timeline: the kind, the agent it names, the summary in plain language and the time. */
export interface swarmaction {
  id: string;
  kind: string;
  agentid?: string;
  summary: string;
  at: number;
}

/** The shared cost accounting of one swarm: the per agent usage summed into the swarm totals of tokens, cost and steps. */
export interface swarmcost {
  agents: number;
  tokens: number;
  cost: number;
  steps: number;
  currency?: string;
  computedat: number;
}

/** One comparison of competing agent outputs for the user: the subject, the outputs per agent and the differences the comparison names. */
export interface outputcomparison {
  id: string;
  subject: string;
  outputs: Array<{ agentid: string; value: string }>;
  differences: string[];
  comparedat: number;
}

/**
 * Execution environment contracts of the 1.1.60 family.
 * Every reviewed step names the concrete environment it executes in: pagecontext runs inside the live page, isolatedworld runs injected logic that page scripts cannot touch, offscreenworker moves heavy parsing into an offscreen document worker pool and sandboxframe renders untrusted markup inside a sandboxed page with no extension privileges.
 * The consent gates do not move: every environment executes only reviewed steps against granted origins, and no environment ever bypasses the human review.
 */

/** The execution environments of the 1.1.60 family: the live page, the isolated world of the scripting api, the offscreen document worker pool and the sandboxed frame. */
export type environmentkind = "pagecontext" | "isolatedworld" | "offscreenworker" | "sandboxframe";

/** The per kind environment profile the policy exposes: the environments the kind may run in and the default the executor routes to. */
export interface environmentrequirement {
  kind: actionkind;
  environments: environmentkind[];
  defaultenvironment: environmentkind;
}

/** One executor traffic envelope for the offscreen worker pool: the parse family, the payload reference and the keys the executor moves as transferable buffers. */
export interface workerrequest {
  id: string;
  runid: string;
  stepid: string;
  /** The parse family the worker executes such as htmlsnapshot, jsonpayload, tablerows, a11ytree, complexselector or stitchshots. */
  task: string;
  payload: string;
  /** The payload keys the executor moves as transferable buffers where the payload carries them. */
  transferables: string[];
  sentat: number;
}

/** One worker answer to the executor: the finished result or one streamed partial chunk with its sequence number. */
export interface workerresponse {
  id: string;
  requestid: string;
  ok: boolean;
  /** The finished result payload; a partial answer carries its chunk in the partial field instead. */
  result?: string;
  /** The sequence number of one streamed partial result; the final answer carries none. */
  partial?: number;
  summary: string;
  receivedat: number;
}

/** One sandbox render descriptor: the sanitized markup, the per render nonce and the source origin of the untrusted markup. The answeredat marker closes the nonce after exactly one accepted result so a replayed answer never passes. */
export interface sandboxrender {
  id: string;
  nonce: string;
  markup: string;
  sourceorigin: string;
  stepid: string;
  renderedat: number;
  /** The time the one accepted answer closed this render; an answered render refuses every later message. */
  answeredat?: number;
}

/** The result of one sandbox render posted back through postmessage: the nonce it answers, the sanitized text and the render facts. */
export interface sandboxrenderresult {
  nonce: string;
  ok: boolean;
  text: string;
  summary: string;
  at: number;
}

/** One keepalive run state with start and stop events: the typed run state that holds a runtime port open while a run stays active and emits a heartbeat on every interval. */
export interface keepalivestate {
  runid: string;
  sessionid: string;
  state: "active" | "stopped";
  startedat: number;
  stoppedat?: number;
  /** The user configured heartbeat interval in milliseconds; the roadmap documents thirty seconds while the interval stays the user's choice. */
  interval: number;
  beats: number;
  lastbeatat: number;
  portopen: boolean;
  events: keepaliveevent[];
}

/** One keepalive lifecycle event: the start, a heartbeat, the stop or the reattach after a service worker restart. */
export interface keepaliveevent {
  kind: "start" | "heartbeat" | "stop" | "reattach";
  at: number;
  detail?: string;
}

/** One url history entry of a run: the url, the step that navigated and the time it landed in the run record. */
export interface urlhistoryentry {
  url: string;
  stepid: string;
  at: number;
}

/** The provenance attached to every persisted environment event: the origin, the step and the environment it names. */
export interface environmentprovenance {
  origin: string;
  stepid: string;
  environment: environmentkind;
}

/** The persisted run state of one run: the pending step for restart recovery, the url history, the environment and worker turnaround of every step, the keepalive trail and the zombie view. */
export interface runstaterecord {
  runid: string;
  sessionid: string;
  planid: string;
  profileid: string;
  state: "active" | "recovered" | "reaped" | "completed" | "expired";
  /** The step that waits when a service worker restart interrupts the run; the executor resumes exactly it. */
  pendingstepid?: string;
  urlhistory: urlhistoryentry[];
  /** The execution environment of every executed step by step id. */
  environments: Record<string, environmentkind>;
  /** The worker turnaround of every offloaded step by step id, in milliseconds. */
  turnarounds: Record<string, number>;
  keepalive: keepalivestate;
  /** The provenance of the last persisted environment event. */
  lastprovenance?: environmentprovenance;
  updatedat: number;
}

/** One worker spawn or teardown event recorded beside step outcomes: the worker count of the pool and the reason of the change. */
export interface workerevent {
  id: string;
  runid: string;
  kind: "spawn" | "teardown";
  workers: number;
  reason: string;
  provenance: environmentprovenance;
  at: number;
}

/** One spawned offscreen document registry entry: the document, its reasons, its justification and its close time. */
export interface offscreenregistryentry {
  document: string;
  runid: string;
  reasons: string[];
  justification: string;
  createdat: number;
  closedat?: number;
}

/** One storage level run lock that holds a session against concurrent runs. */
export interface runlock {
  sessionid: string;
  runid: string;
  holder: string;
  acquiredat: number;
  /** The user configured lock expiry; an absent expiry keeps the lock until its run releases it. */
  expiresat?: number;
}

/** The sealed persistence envelope of one run state: the payload beside its sha-256 integrity digest so tampering with the persisted run state stays detectable at rest. */
export interface sealedrunstate {
  payload: string;
  algorithm: "sha-256";
  digest: string;
  sealedat: number;
}

/**
 * Security part one contracts of the 1.1.61 family.
 * The trust boundary hardens here: automation runs behind a per origin allowlist under a denydefault posture that refuses every ungranted origin, per site originprofiles grant and deny single action kinds, consentwindows bind every grant in time with a named boundary that never defaults to unlimited, revokerun halts a run mid step as a terminal session event, and every decision lands in an immutable append only run log whose loghash chain makes tampering detectable at read time while maskinputs keeps typed secrets out of every record.
 * The consent gates do not move: every security operation rides the same session, plan and origin review, and no security record ever bypasses the human review.
 */

/** The sensitive classes of the 1.1.61 family: payment, credential, delete and publish steps each need one fresh consent prompt per class per origin. */
export type sensitiveclass = "payment" | "credential" | "delete" | "publish";

/** The event kinds of the immutable run log: step transitions, grants, window expiries, revocations, denials, suspensions, resumes and the completion seal. */
export type logeventkind =
  | "step"
  | "grant"
  | "expiry"
  | "revoke"
  | "deny"
  | "suspend"
  | "resume"
  | "seal"
  | "gate"
  | "phish"
  | "schema"
  | "inbound"
  | "cancel"
  | "review"
  | "library"
  | "background"
  | "lint"
  | "flowrun"
  | "export";

/** The hash chain fields of one immutable log entry: the hash of its predecessor, the entry hash written at append time and the algorithm that derives both. */
export interface loghash {
  previous: string;
  current: string;
  algorithm: "sha-256";
}

/** One append only immutable log entry: the run it belongs to, the event kind, the summary in plain language, the origin and step provenance, the time and the hash chain link written at append time with no later rewrite. */
export interface immutablelogentry {
  id: string;
  runid: string;
  kind: logeventkind;
  summary: string;
  origin: string;
  /** The step the entry names when it records one step transition, denial or revocation halt. */
  stepid?: string;
  at: number;
  hash: loghash;
}

/** The sealed completion record of one run log: the entry count, the final hash that chains the seal to the last entry and the seal time; the seal closes the log with no later append. */
export interface sealedlog {
  runid: string;
  entries: number;
  sealhash: loghash;
  sealedat: number;
}

/** The stored run log of one run: the append only entries beside the seal that closes them at completion; an unsealed log still accepts appends while a sealed log refuses them. */
export interface storedrunlog {
  runid: string;
  sessionid: string;
  entries: immutablelogentry[];
  seal?: sealedlog;
  updatedat: number;
}

/** One per site origin profile: the exact origin, the action kinds the user granted and denied on it, and the review times; the profile consults before every sensitive kind. */
export interface originprofile {
  profileid: string;
  origin: string;
  grants: actionkind[];
  denials: actionkind[];
  createdat: number;
  updatedat: number;
}

/** One allowlist entry of automation origins: the exact origin with no wildcard expansion, the profile workspace it belongs to and the grant time; the active tab grant counts as one explicit single origin entry. */
export interface automationallowlistentry {
  origin: string;
  profileid: string;
  grantedat: number;
}

/** One consent window bound in time: the session and the exact origin it scopes, the user chosen duration with the boundary it names, the kinds it covers and the state; the window expires at its duration boundary and never defaults to unlimited. */
export interface consentwindow {
  id: string;
  sessionid: string;
  origin: string;
  startedat: number;
  /** The user chosen duration in milliseconds; the boundary stays the user's choice with no engine default. */
  duration: number;
  expiresat: number;
  /** The named boundary in plain language such as the duration the prompt offered; the prompt never defaults to unlimited. */
  boundary: string;
  kinds: actionkind[];
  state: "active" | "closed";
  closedat?: number;
}

/** One consent scope grant naming the origin, the kinds and the boundary in a single record; the session start writes it into the immutable log. */
export interface consentscope {
  origin: string;
  kinds: actionkind[];
  boundary: string;
  grantedat: number;
}

/** One mid run revocation: the terminal session event that halts the pending step and every queued step without executing them, the acting user and the reason. */
export interface revokerunevent {
  id: string;
  sessionid: string;
  runid: string;
  haltedstepids: string[];
  actor: string;
  reason: string;
  at: number;
}

/** One fresh sensitive class consent per origin: the class the user consented to, the grant time and the optional expiry; each sensitive class needs its own fresh prompt per origin. */
export interface classconsent {
  id: string;
  origin: string;
  sensitiveclass: sensitiveclass;
  grantedat: number;
  expiresat?: number;
}

/** One mask rule for sensitive field shapes: the documented password, token, card and secret families extended by the user, optionally scoped to one origin. */
export interface maskrule {
  id: string;
  /** The origin the rule scopes to; an absent origin keeps the rule global. */
  origin?: string;
  shapes: string[];
  createdat: number;
}

/** One denied step evidence: the origin, the action kind and the deny reason in plain language, recorded without navigation. */
export interface deniedevidence {
  origin: string;
  kind: string;
  reason: string;
  at: number;
}

/** One revocation evidence of the plan progress: the halted steps and the revoked step the run stopped at. */
export interface revocationevidence {
  haltedstepids: string[];
  revokedstepid?: string;
  reason: string;
  at: number;
}

/** The security view of the 1.1.61 family served to the sidepanel and the popup: the automation allowlist, the per origin profiles, the active consent windows with their remaining time, the fresh class consents, the revocation history, the mask rules, the per run chain verification status with the seal hash and the denydefault posture notice. */
export interface securityview {
  allowlist: automationallowlistentry[];
  profiles: originprofile[];
  windows: consentwindow[];
  consents: classconsent[];
  revocations: revokerunevent[];
  maskrules: maskrule[];
  chain: Array<{
    runid: string;
    valid: boolean;
    entries: number;
    brokenat?: number;
    reason: string;
    sealhash?: string;
    sealedat?: number;
  }>;
  posture: "denydefault";
  /** The manifest permissions with their consuming surfaces: the permission coverage of the capability manifests answers which surface, messages and kinds consume every permission the manifest requests. */
  permissions?: Array<{
    permission: string;
    state: "required" | "optional" | "optionalhost";
    surface: string;
    messages: number;
    kinds: number;
  }>;
  /** The open and resolved confirm gates of the 1.1.62 family with their payloads and human action provenance. */
  gates?: confirmgate[];
  /** The gate resolution events with their human action provenance. */
  resolutions?: gateresolution[];
  /** The deferred automation commands waiting for their ratelimit bucket reset. */
  deferred?: deferredevent[];
  /** The stored phishguard verdicts with their distance scores. */
  phishverdicts?: phishverdict[];
  /** The secretvault metadata with labels and scopes only; the values never leave the vault seam. */
  vault?: secretvaultentry[];
  /** The connectallow entries of external senders; the list ships empty by default. */
  connectallow?: connectallowentry[];
  /** The safedefaults applications with their first seen origins. */
  safedefaults?: safedefaultapplication[];
  /** The redactshot regions per origin and page template with their geometry and reason. */
  redactregions?: redactregion[];
}

/**
 * Security part two contracts of the 1.1.62 family.
 * The protections for secrets, messages and money live here: the secretvault keeps passwords and tokens behind a vault seam with only labels, scopes, provenance and digests persisting, redactshots mask sensitive capture regions across every capture kind, schemastrict rejects every inbound command field the grammar never declared, origincheck and connectallow guard every runtime message and port connection while dropping unknown senders, ratelimit buckets bound automation commands per origin and per session with deferral until the window resets, confirmpay, confirmdelete and confirmcreds put one distinct human action in front of payments, deletions and credential use with no batch approval and no timeout, phishguard watches login targets for lookalike origins against the granted origins under the user threshold, safedefaults profile unknown origins as reads only, and permdiff records every installed permission change for the transparencypage.
 * The consent gates do not move: every security operation rides the same session, plan and origin review, and no security record ever bypasses the human review.
 */

/** The provenance of one secretvault record: the user typed the secret, or a reviewed session step stored it. */
export type secretprovenance = "user" | "session";

/** One secretvault record: the label, the exact origin scope, the profile workspace, the provenance and the sha-256 verification digest; the value itself lives behind the vault seam and never persists in any storage area, log or export. */
export interface secretvaultentry {
  vaultid: string;
  label: string;
  scope: string;
  profileid: string;
  provenance: secretprovenance;
  algorithm: "sha-256";
  digest: string;
  createdat: number;
  lastusedat?: number;
}

/** The vault seam the background implements: values enter and leave through put, fetch and drop only, so no plaintext value ever reaches a storage writer, a log entry or an export path. */
export interface vaultseam {
  put(vaultid: string, value: string): Promise<void>;
  fetch(vaultid: string): Promise<string | undefined>;
  drop(vaultid: string): Promise<void>;
}

/** One redactshot region: the geometry on the capture surface in css pixels, the plain language reason and whether the user drew it or a sensitive field shape derived it. */
export interface redactregion {
  id: string;
  origin: string;
  template: string;
  x: number;
  y: number;
  width: number;
  height: number;
  reason: string;
  source: "fieldshape" | "userdrawn";
  createdat: number;
}

/** The capture surfaces redactshots covers: viewport, element and stitched captures alike. */
export type capturesurface = "viewport" | "element" | "stitched";

/** One schemastrict error: the path inside the command, the expected shape, the found shape and the reason in plain language; the error echoes no payload. */
export interface schemaerror {
  path: string;
  expected: string;
  found: string;
  reason: string;
}

/** One origincheck verdict of an inbound runtime message or port connection: accepted, or dropped with the sender and its origin named. */
export interface origincheckverdict {
  accepted: boolean;
  sender: string;
  origin: string;
  reason: string;
}

/** One connectallow entry: the external sender the user allowed with its display name and optional origin; the list ships empty by default and holds user managed entries only. */
export interface connectallowentry {
  senderid: string;
  displayname: string;
  origin?: string;
  addedat: number;
}

/** One ratelimit bucket of automation commands per origin and per session: the user configured bound and window, the used count, the window start and the reset time. */
export interface ratelimitbucket {
  origin: string;
  sessionid: string;
  limit: number;
  window: number;
  used: number;
  windowstartedat: number;
  resetsat: number;
}

/** One deferred command event: the step the bucket deferred, the reason and the reset time it waits for. */
export interface deferredevent {
  id: string;
  stepid: string;
  kind: string;
  origin: string;
  reason: string;
  resetsat: number;
  at: number;
}

/** The gated step families of the 1.1.62 family: payments, destructive deletions and credential use each pause in front of a human. */
export type gatekind = "confirmpay" | "confirmdelete" | "confirmcreds";

/** One confirm gate: the step it holds, the payload the human reviews and the state only one explicit human action resolves; no timeout ever resolves a gate and no batch approval resolves two. */
export interface confirmgate {
  gateid: string;
  kind: gatekind;
  stepid: string;
  runid: string;
  origin: string;
  /** confirmpay carries the amount, the payee origin and the target element; confirmdelete carries the target, the scope and the irreversibility; confirmcreds carries the credential label only, never its value. */
  payload: Record<string, string>;
  state: "open" | "resolved" | "refused";
  openedat: number;
  resolvedat?: number;
  actor?: string;
}

/** One gate resolution event with its human action provenance: one gate, one decision, one acting user. */
export interface gateresolution {
  gateid: string;
  kind: gatekind;
  stepid: string;
  decision: "resolved" | "refused";
  actor: string;
  at: number;
}

/** One gate wait evidence of the progress log: the gate the step waited at and the milliseconds it waited. */
export interface gatewaitevidence {
  gateid: string;
  kind: string;
  openedat: number;
  resolvedat: number;
  waitedms: number;
}

/** One phishguard verdict: the login origin checked, the closest granted origin with the lookalike distance, the user threshold and the block decision that names the matched origin. */
export interface phishverdict {
  origin: string;
  matchedorigin?: string;
  distance: number;
  threshold: number;
  blocked: boolean;
  reason: string;
  at: number;
}

/** One permdiff record between two installed permission versions: the added and removed permissions with the computed time. */
export interface permdiffrecord {
  fromversion: string;
  toversion: string;
  added: string[];
  removed: string[];
  computedat: number;
}

/** One safedefaults application: the unknown origin that received the reads only profile with its first seen time. */
export interface safedefaultapplication {
  origin: string;
  firstseenat: number;
}

/** One transparency grant row of the transparencypage: the origin, the scope, the boundary and the revoke action it offers. */
export interface transparencygrant {
  origin: string;
  scope: string;
  boundary: string;
  grantedat: number;
}

/**
 * Session interface contracts of the 1.1.63 family.
 * The session becomes the primary interface here: sitenotes keep one note record per origin with title, body and author provenance while sensitive bodies seal at rest, the scratchpad holds append only entries per task with step provenance, runsummary distills a completed run into the origins visited, the kinds executed and the per step outcomes inside the user configured window, semanticrecall embeds past extraction records into a local fingerprint indexed corpus ranked by text similarity with run and step provenance, correctionmemory captures every plan review edit and rejection per origin and kind, consentmemory keeps every grant, denial, expiry and revocation per origin as advisory history that never auto grants, sessiongrid rows derive from the existing session stores with no new state, historysearch indexes session metadata, notes and summaries into one incremental corpus, errorsurface classifies every failed step cause as page, network, policy or gate with a retry hint carrying the policy verdict, and cancelrun rolls the queued steps back only while the executed steps stay untouched in the sealed log.
 * The consent gates do not move: every interface action rides the same session, plan and origin review, and no interface surface ever bypasses the human review.
 */

/** One site note per origin: the title, the plain or sealed body, the author provenance and the timestamps; a sensitive note seals its body at rest so the plain text never persists. */
export interface sitenote {
  id: string;
  origin: string;
  title: string;
  /** The plain body of a non sensitive note; a sensitive note carries its sealedbody instead. */
  body?: string;
  /** The locally sealed body of a sensitive note; the sealing stays an at rest measure and never replaces the user keychain. */
  sealedbody?: string;
  author: string;
  sensitive: boolean;
  createdat: number;
  updatedat: number;
}

/** One append only scratchpad entry of one task: the text, its optional step provenance and the timestamp. */
export interface scratchpadentry {
  id: string;
  taskid: string;
  sessionid: string;
  text: string;
  /** The step the entry was written beside; an entry the user writes carries none. */
  stepid?: string;
  author: string;
  at: number;
}

/** One distilled run summary of a completed run: the origins visited, the kinds executed, the per step outcomes inside the user configured window and the distillation provenance that names the offscreen worker task. */
export interface runsummary {
  runid: string;
  sessionid: string;
  origins: string[];
  kinds: string[];
  steps: Array<{ stepid: string; kind: string; ok: boolean; summary: string }>;
  /** The user configured step window the summary keeps; an absent window keeps every step with no fixed cap. */
  window?: number;
  task: "runsummary";
  /** The distillation provenance: the offscreen worker pool or the inline fallback beside the page. */
  provenance: "offscreenworker" | "inline";
  distilledat: number;
}

/** One semantic recall query: the text to recall and the optional origin scope that stays inside the run scope. */
export interface recallquery {
  text: string;
  origin?: string;
  /** The user chosen match limit; an absent limit keeps every ranked match. */
  limit?: number;
}

/** One semantic recall index entry: the extraction fingerprint, the origin, the run and step provenance and the indexed text. */
export interface recallindexentry {
  fingerprint: string;
  origin: string;
  runid: string;
  stepid: string;
  text: string;
  at: number;
}

/** One ranked semantic recall match: the indexed entry, the text similarity score and the plain language reason. */
export interface recallmatch {
  entry: recallindexentry;
  score: number;
  reason: string;
}

/** One correction memory entry: the plan review edit or rejection captured per origin and kind, linking the step to its correction. */
export interface correctionentry {
  id: string;
  origin: string;
  kind: string;
  stepid: string;
  source: "edited" | "rejected";
  /** The step shape before the correction. */
  original: string;
  /** The corrected step shape; a rejected step carries none. */
  corrected?: string;
  reason: string;
  at: number;
}

/** One consent memory entry per origin: the grant, denial, expiry or revocation decision with its boundary, its kinds and its optional expiry; the record stays advisory and never auto grants. */
export interface consentmemoryentry {
  id: string;
  origin: string;
  decision: "grant" | "deny" | "expire" | "revoke";
  boundary: string;
  kinds: string[];
  at: number;
  /** The expiry the decision carried; an absent expiry keeps the record as history only. */
  expiresat?: number;
}

/** One session grid row derived from the session stores with no new state: the session and run ids, the origin set, the live or saved state, the outcome, the step counts, the per tab lock state, the seal hash link of the sealed log chain and the actions the row offers. */
export interface sessiongridrow {
  sessionid: string;
  runid: string;
  origins: string[];
  state: "live" | "saved";
  outcome: string;
  steps: number;
  completed: number;
  lock: "held" | "free";
  tabid?: number;
  sealhash?: string;
  updatedat: number;
  actions: Array<"resume" | "cancelrun" | "reopen">;
}

/** One history search query: the text with the optional origin, time range and outcome filters. */
export interface historysearchquery {
  text: string;
  origin?: string;
  from?: number;
  to?: number;
  outcome?: string;
}

/** The corpus sources historysearch indexes: session metadata, site notes and run summaries in one corpus. */
export type historysource = "session" | "note" | "summary";

/** One history search corpus entry written incrementally on each store write. */
export interface historyindexentry {
  source: historysource;
  id: string;
  origin?: string;
  title: string;
  text: string;
  outcome?: string;
  at: number;
}

/** One history search hit with the matched terms highlighted and the sealed run link. */
export interface historysearchhit {
  source: historysource;
  id: string;
  title: string;
  excerpt: string;
  highlights: string[];
  origin?: string;
  outcome?: string;
  at: number;
}

/** The cause classes of one error surface: the page, the network, the policy or a confirm gate. */
export type errorcause = "page" | "network" | "policy" | "gate";

/** One error surface payload of a failed step: the cause class, the message in plain language, the retry hint with its policy verdict and the context facts. */
export interface errorsurface {
  stepid: string;
  runid: string;
  cause: errorcause;
  message: string;
  retry: { allowed: boolean; reason: string };
  context: Record<string, string>;
  at: number;
}

/** The rollback option descriptor of a cancelrun action: the queued steps it rolls back while the executed steps stay untouched. */
export interface rollbackdescriptor {
  scope: "queued" | "none";
  label: string;
  queuedstepids: string[];
}

/** The cancelrun action of one run: the run and the session it stops with its rollback option descriptor. */
export interface cancelrunaction {
  runid: string;
  sessionid: string;
  rollback: rollbackdescriptor;
}

/** The empty state surfaces of the session interface: the session grid, the history search box, the site notes and the scratchpad. */
export type emptystatesurface = "sessiongrid" | "historysearch" | "sitenotes" | "scratchpad";

/** One per tab session reference that isolates parallel tabs: the tab, its session, its optional run and its origin. */
export interface tabsessionref {
  tabid: number;
  sessionid: string;
  runid?: string;
  origin: string;
  updatedat: number;
}

/**
 * Interface surface contracts of the 1.1.64 family.
 * The interface becomes a family of five surfaces here: the popup grows into a command surface, the sidepanel becomes the workspace with plan, run and review tabs, the dashboardpage opens a full page view in a new tab, the optionspage gathers every setting in one place and the onboarding walks a first run. The commandpalette registers entries from every module at startup, lists only the actions the current capability set allows and ranks fuzzy matches with the recent commands first; the taskinput submits natural language goals through the same proposal flow as the api with the active origin and page outline attached; plancards render one card per proposed step with kind, risk class, environment and options grouped by risk class with the sensitive classes expanded by default; stepapprove resolves one step per human action with approve, reject and edit provenance written into the immutable log; diffpreview compares the observed before state with the predicted after state of write class steps only with masked values carrying their mask verdicts; the stepstimeline derives its nodes from progress records with no new state; and the logstream renders live events with level, source and step ref while the single broadcast channel carries run state to every surface.
 * The consent gates do not move: every surface action rides the same policy gates, the command bus records each routing in the audit trail, and no interface surface ever bypasses the human review.
 */

/** The interface surfaces of the 1.1.64 and 1.1.65 families: the popup command surface, the sidepanel workspace, the dashboardpage, the optionspage, the onboarding walkthrough, the omnibox entry point and the inline page surface of the pagechips. */
export type uisurface = "popup" | "sidepanel" | "dashboardpage" | "optionspage" | "onboarding" | "omnibox" | "page";

/** One commandpalette action: the command it routes, the surface it opens on, the optional permission it needs granted and whether it needs an active session. */
export interface paletteaction {
  command: string;
  surface: uisurface;
  /** The optional capability the command needs granted before the palette lists it; an absent permission needs none. */
  permission?: string;
  /** True when the command needs an active browser session before the palette lists it. */
  session?: boolean;
}

/** One commandpalette entry: the id, the visible label, the keywords the fuzzy search matches and the action it routes through the command bus. */
export interface paletteentry {
  id: string;
  label: string;
  keywords: string[];
  action: paletteaction;
}

/** One ranked commandpalette match: the entry, the fuzzy score and the plain language reason it ranked. */
export interface palettematch {
  entry: paletteentry;
  score: number;
  reason: string;
}

/** One taskinput submission: the natural language goal, the page outline context, the active origin scope and the surface it came from. */
export interface taskinputsubmission {
  id: string;
  text: string;
  context: string;
  origin: string;
  surface: uisurface;
  at: number;
}

/** The proposal status the taskinput shows while a plan generates: idle, generating, ready or failed. */
export type proposalstatus = "idle" | "generating" | "ready" | "failed";

/** One stepstimeline node derived from progress records with no new state: the status, the duration, the environment badge, the active mark, the deep link anchor and the step result summary. */
export interface stepstimelinenode {
  stepid: string;
  kind: string;
  status: "pending" | "running" | "waiting" | "done" | "failed" | "halted";
  durationms?: number;
  environment?: environmentkind;
  active: boolean;
  anchor: string;
  resultsummary?: string;
}

/** One logstream event of a live run: the level, the source that emitted it, the origin, the summary in plain language, the optional step ref, the mask verdict of its source payload and the hash chain link written at append time. */
export interface logstreamevent {
  id: string;
  level: loglevel;
  source: string;
  origin: string;
  summary: string;
  stepid?: string;
  masked: boolean;
  maskverdict: string;
  hash: loghash;
  at: number;
}

/** One logstream filter: the level, origin or step ref the live view keeps. */
export interface logstreamfilter {
  level?: loglevel;
  origin?: string;
  stepid?: string;
}

/** One plancard of the plan review surface: the step id, the kind, the risk class, the execution environment, the reviewed options, the summary, the matching corrections from correctionmemory and the edit before approve offer. */
export interface plancard {
  stepid: string;
  kind: string;
  risk: actionrisk;
  environment: environmentkind;
  options: string;
  summary: string;
  corrections: Array<{ id: string; source: string; reason: string }>;
  editable: boolean;
}

/** One plancard group of the plan review surface: the risk class of its cards and whether the group renders expanded; sensitive groups expand by default. */
export interface plancardgroup {
  risk: actionrisk;
  cards: plancard[];
  expanded: boolean;
}

/** One stepapprove resolution: the step it resolves, the plan it belongs to, the origin it ran on, the approve, reject or edit decision, the surface the distinct human action came from and the edited step shape an edit carries. */
export interface stepapproveresolution {
  stepid: string;
  planid: string;
  origin: string;
  resolution: "approve" | "reject" | "edit";
  surface: uisurface;
  edited?: string;
  at: number;
}

/** One diffpreview field change: the field name, the added, changed or removed class and the before and after values it carries. */
export interface diffchange {
  field: string;
  kind: "added" | "changed" | "removed";
  before?: string;
  after?: string;
}

/** One diffpreview payload: the step it previews, the observed before state, the predicted after state, the field changes with added, changed and removed classes, the mask verdicts per field and the generation provenance. */
export interface diffpreviewpayload {
  stepid: string;
  before: Record<string, string>;
  after: Record<string, string>;
  changes: diffchange[];
  /** The mask verdict reason per field; an absent field carries no masked value. */
  maskverdicts: Record<string, string>;
  provenance: "inline" | "offscreenworker";
}

/** One onboarding step: the surface it walks, the title, the body and the completion event name its finish records. */
export interface onboardingstep {
  id: string;
  surface: uisurface;
  title: string;
  body: string;
  completion: string;
  /** True when the walkthrough stop is optional: the completion of every mandatory stop alone finishes the walkthrough while the optional stop enriches it. */
  optional?: boolean;
}

/** The onboarding state: the completed steps, the done mark, the single consent scoped event a full completion writes and the timestamps. */
export interface onboardingstate {
  stepscompleted: string[];
  done: boolean;
  consentevent?: string;
  startedat?: number;
  completedat?: number;
}

/** One surface action of the command bus: the surface it came from, the command it routes and the optional step and payload it carries. */
export interface surfaceaction {
  surface: uisurface;
  command: string;
  stepid?: string;
  payload?: string;
}

/** One command bus routing verdict: whether the action dispatched, the gate that decided and the plain language reason. */
export interface surfaceroute {
  dispatched: boolean;
  gate: string;
  reason: string;
}

/** The broadcast channels of the single surface channel: run state, logstream events, session store updates and settings changes. */
export type broadcastchannelkind = "runstate" | "logstream" | "sessions" | "settings";

/** One broadcast frame of the single surface channel: the channel it rides, the emitting surface, the plain language summary and the time. */
export interface broadcastframe {
  channel: broadcastchannelkind;
  surface: uisurface | "background";
  summary: string;
  at: number;
}

/** One per surface layout preference: the surface, the preference keys the user set and the update time; the preferences scope per profile workspace. */
export interface surfacelayout {
  surface: uisurface;
  preferences: Record<string, string>;
  updatedat: number;
}

/** One commandpalette usage record: the command, its use count and the last use time the recent first ranking reads. */
export interface paletteuserecord {
  command: string;
  count: number;
  lastusedat: number;
}

/**
 * Interface surface contracts of the 1.1.65 family, part two.
 * This family finishes the interface layer: the datagrid arranges extraction results into columns and rows with inferred types and the exportmenu ships them as csv, json or clipboard in masked form only; quickactions, shortcutkeys and the omniboxtask shorten the path to a run behind the same gates; the statusbadge, the done and attention notifications, the recenttray and the stetoasts keep the user informed without watching; the pickeroverlay, the targethalo, the guidedtips, the shotpanel, the compareviewer and the pagechips cover selection and evidence; and the siteprofiles, the darklight theme tokens, the locale bundles, the importexport payloads, the dropimport sessions, the featuretour stops and the a11ylabels round out the surface.
 * The consent gates do not move: every quickaction rides the origin allowlist of the clicked tab, every omnibox goal routes through the proposal flow, every notification with page content needs its consent, every picker read stays inside the granted origin, no bundle ever ships a secretvault value or an unmasked log, and no interface element ever bypasses the human review.
 */

/** One datagrid column with its type inferred from the observed values: text, number, boolean, date or an all empty column. */
export interface datagridcolumn {
  field: string;
  label: string;
  type: "text" | "number" | "boolean" | "date" | "empty";
  /** True when the type was inferred from the values rather than declared by the extraction. */
  inferred: boolean;
}

/** One datagrid row: its original order as index, its field values and its selected mark of a partial export range. */
export interface datagridrow {
  index: number;
  values: Record<string, string>;
  /** True when the row sits inside the selected range of a partial export. */
  selected?: boolean;
}

/** One datagrid view of an extraction result: the title, the origin, the run, the inferred columns, the rows and the build time. */
export interface datagridview {
  id: string;
  title: string;
  origin: string;
  runid: string;
  columns: datagridcolumn[];
  rows: datagridrow[];
  at: number;
}

/** One exportmenu descriptor: the csv, json or clipboard format, the selection, step or run scope and the download, clipboard or memory destination. */
export interface exportmenudescriptor {
  format: "csv" | "json" | "clipboard";
  scope: "selection" | "step" | "run";
  destination: "download" | "clipboard" | "memory";
}

/** One quickaction bound to a context menu entry: the command it routes, the surface it opens on, the optional permission it needs granted and whether it needs an active session. */
export interface quickaction {
  id: string;
  label: string;
  command: string;
  surface: uisurface;
  /** The optional capability the quickaction needs granted before it registers; an absent permission needs none. */
  permission?: string;
  /** True when the quickaction needs an active browser session before it registers. */
  session?: boolean;
}

/** One shortcutkeys binding: the command it triggers, the key, the modifiers, the user editable mark and the surface it binds on; the palette command binds on every surface. */
export interface shortcutbinding {
  command: string;
  key: string;
  modifiers: string[];
  editable: boolean;
  surface: uisurface;
}

/** One omniboxtask submission parsed from the omnibox keyword: the natural language goal after the keyword, the active origin and the time. */
export interface omniboxtasksubmission {
  id: string;
  text: string;
  origin: string;
  surface: "omnibox";
  at: number;
}

/** One statusbadge state of the toolbar icon: idle, running, waiting or attention with the count of waiting gates that need a human. */
export interface statusbadgestate {
  state: "idle" | "running" | "waiting" | "attention";
  waitingcount: number;
  runid?: string;
}

/** One notification payload: the done or attention kind, the title, the body, the deep link, the optional step ref and whether the body carries page content that needs its consent. */
export interface notificationpayload {
  id: string;
  kind: "done" | "attention";
  title: string;
  body: string;
  deeplink: string;
  runid?: string;
  stepid?: string;
  /** True when the notification body carries page content; the content consent gate must allow before it shows. */
  content: boolean;
  at: number;
}

/** One recenttray entry: the run id, the origin, the outcome, the title, the time and the resume and reopen offers. */
export interface recenttrayentry {
  runid: string;
  origin: string;
  outcome: "running" | "completed" | "halted" | "failed";
  title: string;
  at: number;
  resumable: boolean;
  reopenable: boolean;
}

/** One pickeroverlay candidate: the selector, the optional text and role anchors, the stability score and the plain language reason the score stands. */
export interface pickercandidate {
  selector: string;
  text?: string;
  role?: string;
  stabilityscore: number;
  reason: string;
}

/** One pickeroverlay session: the granted origin it reads, the ranked candidates, the locked step and selector and the start time. */
export interface pickersession {
  id: string;
  origin: string;
  candidates: pickercandidate[];
  /** The step the locked candidate binds to; one session locks one candidate. */
  lockedstepid?: string;
  lockedselector?: string;
  startedat: number;
}

/** One targethalo geometry descriptor: the step it outlines, the target selector, the pixel rect and the step state that colors the outline. */
export interface targethalo {
  stepid: string;
  selector: string;
  rect: { x: number; y: number; width: number; height: number };
  state: "pending" | "running" | "waiting" | "done" | "failed" | "halted";
}

/** One guidedtip: the surface it teaches, the title, the body and the picker step it binds to. */
export interface guidedtip {
  id: string;
  surface: uisurface;
  title: string;
  body: string;
  pickerstep?: string;
}

/** One shotpanel view: the step, the run, the capture id, the capture provenance, the origin, the redaction verdicts, the zoom and pan the user set and the build time. */
export interface shotpanelview {
  id: string;
  stepid: string;
  runid: string;
  captureid: string;
  provenance: "viewport" | "fullpage" | "element" | "region";
  origin: string;
  redactions: Array<{ region: string; verdict: string }>;
  zoom: number;
  pan: { x: number; y: number };
  at: number;
}

/** One compareviewer pair: the step it compares, the before capture, the after capture and the slider position of the overlay. */
export interface compareviewerpair {
  id: string;
  stepid: string;
  beforecaptureid: string;
  aftercaptureid: string;
  slidervalue: number;
}

/** One siteprofile: the per site interface preferences (the theme, the shortcutkeys and the default view) stored beside the originprofiles policy preferences of its origin. */
export interface siteprofile {
  origin: string;
  theme?: "dark" | "light" | "system";
  shortcuts?: shortcutbinding[];
  defaultview?: string;
  updatedat: number;
}

/** One darklight theme token set: the mode and the token values every surface, including the dashboardpage, reads; the source names whether the os preference, the user override or the siteprofile decided. */
export interface darklighttokens {
  mode: "dark" | "light";
  tokens: Record<string, string>;
  source?: "os" | "user" | "site";
}

/** One locale bundle: the language and its interface strings; english ships as the fallback base. */
export interface localebundle {
  language: string;
  strings: Record<string, string>;
}

/** One importexport payload: the settings and data bundle of one profile with its originprofiles, siteprofiles, notes and preferences and the honest exclusion list; secretvault values and unmasked logs never enter any bundle under any flag. */
export interface importexportpayload {
  version: number;
  kind: "settings" | "data";
  profile: string;
  exportedat: number;
  contents: {
    originprofiles: Array<Record<string, unknown>>;
    siteprofiles: Array<Record<string, unknown>>;
    notes: Array<Record<string, unknown>>;
    preferences: Record<string, unknown>;
    /** Present only when a bundle wrongly carries log entries; the validation refuses such bundles in full. */
    unmaskedlogs?: Array<Record<string, unknown>>;
  };
  exclusions: string[];
}

/** One dropimport session: the dropped filename, the detected csv, json or workflow kind, the byte size, the accepted mark and the time. */
export interface dropimportsession {
  id: string;
  filename: string;
  kind: "csv" | "json" | "workflow";
  bytes: number;
  accepted: boolean;
  at: number;
}

/** One featuretour stop: the surface it walks, the focus selector it highlights, the title, the body and the stop order. */
export interface featuretourstop {
  id: string;
  surface: uisurface;
  focus: string;
  title: string;
  body: string;
  order: number;
}

/** One a11ylabel: the control it names, its role, its accessible name and its optional state and value for screen readers, resolved through the locale bundles so labels follow the language of the interface. */
export interface a11ylabel {
  control: string;
  role:
    | "button"
    | "textbox"
    | "tab"
    | "table"
    | "list"
    | "slider"
    | "switch"
    | "radiogroup"
    | "combobox"
    | "group"
    | "region"
    | "search"
    | "dialog";
  name: string;
  state?: string;
  value?: string;
}

/** One pagechip confirmation: the gated step, the anchor selector, the origin, the approve or reject resolution, the resolved time and the build time. */
export interface pagechipconfirmation {
  id: string;
  stepid: string;
  selector: string;
  origin: string;
  resolution?: "approve" | "reject";
  resolvedat?: number;
  at: number;
}

/** One steteoast: the step completion confirmation with the step kind, its duration in milliseconds and the time. */
export interface stetoast {
  id: string;
  stepid: string;
  kind: string;
  durationms: number;
  at: number;
}

/**
 * Ecosystem contracts of the 1.1.66 family.
 * This family opens the ecosystem layer: the flowlibrary entries with their manifests, required grants, data expectations and publisher provenance share workflow templates behind the same review; the syncbridge hooks move manifests between machines behind an explicit opt in; the attentionfeed collects every gate wait, phishguard block, deferral and failure with its deep link; the background run queue keeps workflows executing with the keepalive signal held; the runreplay walks a sealed chain step by step for audit; and the outputcompare sessions set two runs beside each other under a recorded metric set.
 * The consent gates do not move: every library import lands as a proposal that still passes the plan review, no hook ever defaults on, the replay reads sealed logs only and the comparison never executes a step.
 */

/** One flowlibrary manifest: the shared workflow template with its steps, kinds, required grants, data expectations with minimization hints and the optional publisher signature. */
export interface flowlibrarymanifest {
  id: string;
  title: string;
  description: string;
  version: string;
  /** The publisher identity of the manifest; every registry origin stays a user configured value with nothing hardcoded. */
  publisher: string;
  /** The user configured registry origin the entry was browsed from; an absent origin marks a local export. */
  registry?: string;
  steps: flowlibrarystep[];
  /** The action kinds the manifest steps use; the import refuses kinds the installed capability set lacks. */
  kinds: string[];
  /** The origin grants the manifest needs before any import completes; the grant diff shows them before the import lands. */
  requiredgrants: string[];
  /** The data expectations of the manifest with the minimization hints each step declares. */
  dataexpectations: dataexpectation[];
  /** True when the entry is marked sensitive and needs a fresh consent prompt before any import. */
  sensitive: boolean;
  /** The publish descriptor with the publisher signature and provenance when the publisher signed the manifest. */
  publish?: publishdescriptor;
}

/** One flowlibrary manifest step: the action kind, its label, the optional target and value and the selector namespace the installer rewrites for the local profile. */
export interface flowlibrarystep {
  id: string;
  kind: string;
  label: string;
  target?: string;
  value?: string;
  /** The selector namespace of the step target: the install prefixes it onto the local selector so shared templates address the local profile. */
  namespace?: string;
}

/** One data expectation of a manifest step: the data family the step touches and the fields it limits itself to as its minimization hint. */
export interface dataexpectation {
  stepid: string;
  /** The data family the step reads or writes such as form values, text content or captures. */
  family: string;
  /** The minimization hint: the exact fields the step needs and nothing broader. */
  fields: string[];
}

/** One publish descriptor: the publisher signature over the manifest digest with its provenance; the verification refuses a signature over any other body in full. */
export interface publishdescriptor {
  publisher: string;
  signature: string;
  /** The manifest digest the signature covers. */
  digest: string;
  /** The provenance chain of the publish: where the entry came from. */
  provenance: string;
  publishedat: number;
}

/** One flowlibrary entry: the manifest with its digest, its state and its provenance; the store deduplicates entries by manifest digest and quarantines unverified publishers. */
export interface flowlibraryentry {
  id: string;
  manifest: flowlibrarymanifest;
  /** The sha-256 digest of the manifest body; the store deduplicates and the syncbridge detects conflicts by this value. */
  digest: string;
  /** The entry state: quarantined entries never install until the user verifies their publisher. */
  state: "available" | "installed" | "quarantined";
  installedat?: number;
  /** The provenance attached to every entry: where it came from and what its signature verification said. */
  provenance: string;
  addedat: number;
}

/** One library lifecycle event of the store and the immutable log: every install, update and removal records with its entry provenance. */
export interface libraryevent {
  id: string;
  kind: "install" | "update" | "remove";
  entryid: string;
  title: string;
  version: string;
  detail: string;
  at: number;
}

/** One syncbridge hook: the provider, the direction and the state of one manifest sync hook behind its explicit opt in with no default on. */
export interface syncbridgehook {
  id: string;
  provider: "file" | "web";
  direction: "pull" | "push" | "both";
  /** True only after the user opts in; no hook ever defaults on. */
  optin: boolean;
  /** The user configured endpoint of the provider: a registry url for the web provider or a file label for the file provider; nothing is hardcoded. */
  endpoint: string;
  state: "idle" | "syncing" | "error";
  lastsyncat?: number;
  createdat: number;
}

/** One syncbridge conflict: both manifest versions surface instead of a silent overwrite, with the resolution the user picked. */
export interface syncbridgeconflict {
  id: string;
  hookid: string;
  manifestid: string;
  local: { digest: string; version: string };
  remote: { digest: string; version: string };
  resolution?: "local" | "remote" | "merge";
  resolvedat?: number;
  detectedat: number;
}

/** The attention causes the feed collects: gate waits, phishguard blocks, deferrals and failures. */
export type attentioncause = "gatewait" | "phishguard" | "deferral" | "failure";

/** One attentionfeed entry: the cause, the run ref, the gate ref, the severity rank and the deep link to the waiting surface that resolves the cause. */
export interface attentionentry {
  id: string;
  cause: attentioncause;
  severity: "critical" | "warning" | "info";
  runid: string;
  /** The gate the run waits at when the cause is a gate wait. */
  gateref?: string;
  origin: string;
  summary: string;
  /** The deep link that opens the exact waiting surface. */
  deeplink: string;
  at: number;
}

/** One background run queue entry: the reviewed workflow the queue runs with no surface open, holding the keepalive signal for its duration. */
export interface backgroundqueueentry {
  id: string;
  workflowid: string;
  state: "queued" | "running" | "done" | "failed";
  /** True while the run holds the keepalive signal of the run state family for its whole duration. */
  keepaliveheld: boolean;
  queuedat: number;
  startedat?: number;
  endedat?: number;
  summary: string;
}

/** One runreplay step: the log entry it restores with its observation and capture refs and the gate resolutions the step annotates. */
export interface runreplaystep {
  stepid: string;
  index: number;
  summary: string;
  /** The observation version the step restored when the sealed log carries it. */
  observationversion?: number;
  /** The capture id the step restored when the sealed log carries it. */
  captureid?: string;
  gateresolutions: Array<{ gateid: string; kind: string; resolution: string; at: number }>;
}

/** One runreplay session: the recorded run id, the cursor, the play state, the replay steps and the viewer actions the audit trail records. */
export interface runreplaysession {
  id: string;
  runid: string;
  /** The step index the viewer stands on. */
  cursor: number;
  playing: boolean;
  steps: runreplaystep[];
  openedat: number;
  actions: Array<{ kind: "play" | "pause" | "step" | "jump"; stepid?: string; at: number }>;
}

/** One outputcompare session: the two run ids, the metric set the session used, the per step grades and the first divergence. */
export interface outputcomparesession {
  id: string;
  runids: [string, string];
  /** The metric set the comparison used, recorded in the audit trail. */
  metrics: string[];
  steps: Array<{
    stepid: string;
    index: number;
    agreement: "agree" | "diverge" | "onlyone";
    summarya: string;
    summaryb: string;
    durationdelta: number;
  }>;
  /** The index of the first divergent step; an absent index marks agreement across the whole sequence. */
  firstdivergence?: number;
  openedat: number;
}

/**
 * Ecosystem contracts of the 1.1.67 family.
 * This family takes the ecosystem out of the browser and into every runtime: planlint diagnostics check plan files against the same policy engine the extension runs, flowrun requests execute plan files from the terminal through the same proposal validation and the same consent gates, exporttools descriptors move runs, extractions and notes to disk with the mask verdicts honored, headless sessions drive a remote browser through the same protocol without any chrome surface, platformtargets declare the browser, node, bun and deno matrix in one place and runtimeadapters probe the dom, storage, network and worker capabilities so features downgrade instead of failing the runtime.
 * The consent gates do not move: planlint refuses what the extension would refuse, a flowrun without an origin grant never starts, no export writes an unmasked value, a headless session without a consent provider refuses under denydefault, and no library bundle carries telemetry by default.
 */

/** The severity levels of one planlint diagnostic: info informs, warn flags a risk and error refuses the plan file. */
export type planlintseverity = "info" | "warn" | "error";

/** One planlint diagnostic: the rule code that raised it, the plan path it points at, the severity and the message the human reads. */
export interface planlintdiagnostic {
  code: string;
  path: string;
  severity: planlintseverity;
  message: string;
}

/** One plan file step: the reviewed action kind with its label, the optional target, value and options, the explicit gate declaration of sensitive steps, the loop bound and the retry attempts the linter reads. */
export interface planfilestep {
  id: string;
  kind: string;
  label: string;
  target?: string;
  value?: string;
  options?: string;
  /** The explicit gate declaration: a sensitive step without it fails the lint. */
  gate?: boolean;
  /** The user configured iteration bound of one loop step; an absent bound on a loop flags as unbounded. */
  bound?: number;
  /** The user configured retry attempts of one retrying step; absent attempts flag as missing retry bounds. */
  attempts?: number;
}

/** One plan file on disk: the version, the goal, the origin the plan addresses, the steps and the origin grants the file carries. */
export interface planfile {
  version: string;
  goal: string;
  origin: string;
  steps: planfilestep[];
  /** The action kind grants the plan declares for its origin; the originprofile the linter builds reads the same shapes the extension reads. */
  grants?: string[];
  /** The action kind denials the plan declares for its origin; a denied kind never runs on that origin, exactly the way the extension refuses it. */
  denials?: string[];
}

/** One rule of the portable rule set: the gate id, the family it belongs to and what it validates. */
export interface portablerule {
  id: string;
  family: string;
  validates: string;
}

/** The portable rule set compiled from the policy engine: the version, the rules and the compile time; the extension and the cli share one compiled set. */
export interface portableruleset {
  version: string;
  rules: portablerule[];
  compiledat: number;
}

/** One flowrun request: the plan path and the options the terminal run carries. */
export interface flowrunrequest {
  planpath: string;
  options: flowrunoptions;
}

/** The options of one flowrun request: the output format, the output directory, the origin grants file, the interactive flag and the dry run flag. */
export interface flowrunoptions {
  format: "human" | "json";
  outputdir: string;
  /** The origin grants file the run reads; an absent file with no interactive prompt refuses the run. */
  grantspath?: string;
  /** True when gate waits route to an interactive terminal consent prompt. */
  interactive: boolean;
  /** True when the run validates and walks the plan without page effects. */
  dryrun: boolean;
}

/** One gate wait of a flowrun: the gate id, the step kind, the origin and the reason the gate held the run. */
export interface flowrungate {
  id: string;
  kind: string;
  origin: string;
  reason: string;
}

/** One flowrun event streamed to the terminal: the event kind, the step it belongs to, the summary and the time. */
export interface flowrunevent {
  kind: "start" | "step" | "gate" | "done" | "failed" | "revoked";
  stepid?: string;
  summary: string;
  at: number;
}

/** The outcome of one flowrun: the run id, the state, the executed step count, the exit code and the seal hash of the written chain. */
export interface flowrunoutcome {
  runid: string;
  state: "done" | "failed" | "revoked";
  steps: number;
  exitcode: number;
  /** The seal hash of the immutable chain the run wrote to the output directory. */
  sealhash?: string;
}

/** One exporttools descriptor: the format and the scope of the export. */
export interface exportdescriptor {
  /** The serial format of the export; the 1.1.80 family adds the json lines and markdown table formats beside csv, json and log. */
  format: "csv" | "json" | "log" | "jsonl" | "markdown";
  scope: "runs" | "extractions" | "notes" | "session" | "audit" | "extraction";
}

/** The result of one exporttools run: the descriptor, the byte size, the row count, the written path and the refusal reason when the export refused. */
export interface exportresult {
  descriptor: exportdescriptor;
  bytes: number;
  rows: number;
  /** The path the export wrote. */
  path?: string;
  /** The reason the export refused; a refused export writes nothing. */
  reason?: string;
}

/** The consent provider interface of the headless library: hosts implement resolvegate so every consent gate routes to their own human. */
export interface consentprovider {
  resolvegate(gate: flowrungate): Promise<"approve" | "refuse">;
}

/** One headless session: the origin it addresses, its state, the gates it resolved and the telemetry marker that stays off by default. */
export interface headlesssession {
  id: string;
  origin: string;
  state: "active" | "closed";
  openedat: number;
  gatesresolved: number;
  /** False by default and forever unless the host opts in; the library bundles carry no telemetry. */
  telemetry: boolean;
}

/** One headless event of a run subscription: the event kind, the step ref, the summary and the time. */
export interface headlessevent {
  kind: "step" | "gate" | "run";
  stepid?: string;
  summary: string;
  at: number;
}

/** One platform target declaration: the runtime, the entry file, the bundle format, the esbuild platform, the declaration flag and the output name the target ships under when it departs from the entry stem. */
export interface platformtarget {
  runtime: "browser" | "node" | "bun" | "deno";
  entry: string;
  format: "esm" | "cjs" | "umd";
  platform: "browser" | "node" | "neutral";
  declarations: boolean;
  /** The dist file name the target ships under; an absent name keeps the entry stem with the format extension, so a target renames itself only when the consumption mode needs the product name. */
  output?: string;
}

/** The platform matrix: every declared target and the completeness flag of the one matrix run. */
export interface platformmatrix {
  targets: platformtarget[];
  complete: boolean;
}

/** The capability probes of one runtime: dom, storage, network and worker availability. */
export interface capabilityprobe {
  dom: boolean;
  storage: boolean;
  network: boolean;
  worker: boolean;
}

/** One runtime adapter declaration: the runtime and the storage, fetch, timer, worker and dom mappings its shell provides. */
export interface runtimeadapterdeclaration {
  runtime: "browser" | "node" | "bun" | "deno";
  storage: "chrome" | "filesystem" | "denokv";
  fetch: "platform";
  timer: "platform";
  worker: "webworker" | "workerthreads";
  dom: "livepage" | "remote";
}

/** One feature downgrade: the feature, the capability it needs and the reason it downgraded instead of failing the runtime. */
export interface featuredowngrade {
  feature: string;
  capability: keyof capabilityprobe;
  reason: string;
}

/** The consumption modes the library ships: the esm core every runtime re-exports, the cjs bundle of require consumers, the umd bundle of script tag consumers, the neutral browser bundle, the cli and the headless library entry. */
export type librarymode = "esm" | "cjs" | "umd" | "neutral" | "cli" | "headless";

/** The clock adapter of the platform seam: the runtime injects now and the scheduler, so no module of the core creates a clock of its own. */
export interface clockadapter {
  now(): number;
  schedule(callback: () => void, milliseconds: number): unknown;
}

/** The logger adapter of the platform seam: the runtime injects the sink, so the core never binds to a console directly. */
export interface loggeradapter {
  log(line: string): void;
  warn(line: string): void;
  error(line: string): void;
}

/** The fetch adapter of the platform seam: the runtime injects the loader, so the core never binds to a network primitive directly. */
export interface fetchadapter {
  fetch(input: string, init?: Record<string, unknown>): Promise<unknown>;
}

/** The adapter contract of the 1.1.81 family: the storage, clock, logger and fetch adapters one runtime injects behind the seam, with the mode stamp, the declaration and the probes of the runtime that provided them. */
export interface adaptercontract {
  runtime: "browser" | "node" | "bun" | "deno";
  mode: librarymode;
  declaration: runtimeadapterdeclaration;
  probes: capabilityprobe;
  storage: memoryadapter;
  clock: clockadapter;
  logger: loggeradapter;
  fetch: fetchadapter;
}

/** The stamp of one running bundle: the package version, the consumption mode and the dist target the bundle was built as. */
export interface bundlemode {
  version: string;
  mode: librarymode;
  target: string;
}

/** One lazymods descriptor of the 1.1.68 family: the module id, the load reason it records and the capability requirements it declares ahead of load. */
export interface lazymoddescriptor {
  id: string;
  /** The load reason the descriptor records: the command family or the heavy parse task the module serves. */
  reason: string;
  /** The capability requirements the module declares ahead of load; lazy loading stays transparent to capability checks because the same checks the eager path runs gate the lazy path. */
  capabilities: string[];
}

/** One lazymods load telemetry record: which module loaded, why, whether the resolution succeeded and how long it took. */
export interface lazyloadrecord {
  id: string;
  moduleid: string;
  reason: string;
  resolved: boolean;
  duration: number;
  at: number;
  /** The provenance of the load: the run, the step or the surface that first used the module. */
  provenance?: { runid?: string; stepid?: string; surface?: string };
}

/** The startup module budget view of the 1.1.68 family: the prewarmed modules, the lazy rest and the user configured budget the view reports against without ever refusing a load. */
export interface startupbudget {
  prewarmed: string[];
  lazy: string[];
  total: number;
  /** The user configured startup module budget; an absent value keeps the view informational only. */
  budget?: number;
  /** True when the prewarmed set exceeds the user configured budget; the view reports and never refuses. */
  over: boolean;
}

/** One debouncedom profile: the dom event kind it coalesces and the user configured window in milliseconds. */
export interface debounceprofile {
  kind: "scroll" | "input" | "resize" | "mutation";
  /** The user configured coalescing window in milliseconds; the profile never carries an engine default because the window stays a user choice. */
  window: number;
}

/** One coalesced dom event batch: the event kind, the folded event count and the window the events coalesced into. */
export interface debouncedbatch {
  kind: "scroll" | "input" | "resize" | "mutation";
  count: number;
  firstat: number;
  lastat: number;
  /** True when the batch closed because its window elapsed; an open batch keeps folding the events that follow. */
  closed: boolean;
}

/** One batchquery plan: the distinct selectors one snapshot pass groups, the duplicate count it folded away and the single pass flag. */
export interface batchqueryplan {
  selectors: string[];
  folded: number;
  onepass: boolean;
}

/** One region change of an incrsnapshot delta: the region, its fingerprint and the change kind. */
export interface snapshotchange {
  region: string;
  fingerprint: string;
  kind: "added" | "changed" | "removed";
}

/** One incrsnapshot delta: the base snapshot ref of the same run, the change set against it and the fingerprint of the delta itself. */
export interface incrsnapshotdelta {
  baseref: string;
  runid: string;
  changes: snapshotchange[];
  fingerprint: string;
  /** True when the builder emitted a full snapshot instead of a delta because the user configured cadence elapsed. */
  full: boolean;
}

/** One selcache entry: the selector, its resolution and the generation the resolution belongs to. */
export interface selcacheentry {
  selector: string;
  resolution: string;
  generation: number;
}

/** One selcache invalidation: the reason, the time and the selectors the invalidation dropped. */
export interface selcacheinvalidation {
  reason: "navigation" | "mutation" | "generation";
  at: number;
  selectors: string[];
}

/** The selcache state of one run: the current generation, the cached entries and the invalidation trail. */
export interface selcachestate {
  runid: string;
  generation: number;
  entries: selcacheentry[];
  invalidations: selcacheinvalidation[];
}

/** One virtlist window: the visible row range, the measured height map and the row nodes the window recycled instead of rebuilding. */
export interface virtlistwindow {
  surface: string;
  start: number;
  end: number;
  total: number;
  heights: Record<string, number>;
  recycled: number;
}

/** One streamparse token: the chunk it belongs to, its text and its token kind. */
export interface streamparsetoken {
  chunk: number;
  text: string;
  kind: "text" | "element" | "attribute";
}

/** One streamparse chunk result: the chunk index, its tokens, the observations it yielded progressively and the byte bound it kept. */
export interface streamparsechunk {
  index: number;
  tokens: streamparsetoken[];
  observations: string[];
  bytes: number;
  complete: boolean;
}

/** One chunkextract cursor: the table fingerprint the resume verifies, the row index the next window starts at and the user configured row window. */
export interface chunkextractcursor {
  tableid: string;
  fingerprint: string;
  rowindex: number;
  window: number;
  complete: boolean;
}

/** One chunkextract window result: the advanced cursor and the partial rows the window emitted. */
export interface chunkextractwindowresult {
  cursor: chunkextractcursor;
  rows: Array<Record<string, string>>;
  complete: boolean;
}

/** One perf record of the 1.1.68 family: the duration, the query count, the cache hits and the delta flag of one step beside its provenance. */
export interface perfrecord {
  id: string;
  runid: string;
  stepid: string;
  duration: number;
  queries: number;
  cachehits: number;
  /** True when the step served its observation from an incrsnapshot delta instead of a full recomputation. */
  delta: boolean;
  at: number;
  /** The provenance every perf record attaches: the origin, the environment and the worker task the step ran. */
  provenance: { origin?: string; environment?: string; task?: string };
}

/** One worker queue depth sample: the pending parse task count and the deferred count the backpressure held at one moment. */
export interface queuedepthsample {
  at: number;
  depth: number;
  deferred: number;
}

/** One batch backpressure signal of the 1.1.69 family: the steps the queue holds ahead of its completed outcomes, the pause verdict and the window the verdict follows. */
export interface backpressuresignal {
  runid: string;
  enqueued: number;
  completed: number;
  behind: number;
  /** True when the queue pauses enqueueing because the downstream steps fell behind past the user window; the pause never drops a queued step. */
  paused: boolean;
  /** The user configured window the signal follows; an absent window keeps the queue never paused. */
  window?: number;
  at: number;
}

/** One domain lane of a batch run: the domain, the user chosen concurrency slots, the running steps and the overflow steps queued per lane. */
export interface domainlane {
  domain: string;
  slots: number;
  running: string[];
  queued: string[];
}

/** One politedelay profile: the domain it spaces, the base delay, the per domain floor from the siteprofiles and the jitter window folded over the base. */
export interface politedelayprofile {
  domain: string;
  base: number;
  /** The per domain floor from the siteprofiles; the delay never falls below the floor. */
  floor: number;
  jitter: number;
}

/** One adaptivepoll window: the floor the interval never falls below, the ceiling it never crosses and the growth factor that widens it while observations stay unchanged. */
export interface adaptivepollwindow {
  floor: number;
  ceiling: number;
  growth: number;
}

/** One requestcoalesce entry: the shared query key, the single dispatch it merged and every waiter the single result fans out to. */
export interface coalescedrequest {
  key: string;
  waiters: string[];
  dispatched: boolean;
}

/** One runbudget record of a run: the step usage against the user chosen step budget and the memory pressure the worker telemetry reported. */
export interface runbudgetrecord {
  runid: string;
  steps: number;
  /** The user chosen step budget; an absent budget never refuses a step. */
  stepbudget?: number;
  /** The memory pressure ratio between zero and one the worker telemetry reported for the run. */
  pressure: number;
  /** The user chosen memory pressure ratio; an absent value keeps the tracker informational. */
  memorybudget?: number;
  at: number;
}

/** One budgetalert of a run: the severity level, the ratio that fired it and the pause verdict of the critical threshold. */
export interface budgetalert {
  runid: string;
  level: "warning" | "critical";
  kind: "steps" | "memory";
  ratio: number;
  /** True at the critical threshold: the run pauses pending a user choice instead of refusing. */
  paused: boolean;
  at: number;
}

/** One timeoutcancel policy of a step: the user chosen bound in milliseconds and the event ref the abort records beside the step outcome. */
export interface timeoutcancelpolicy {
  stepid: string;
  /** The user chosen bound in milliseconds; an absent bound never aborts the step. */
  bound?: number;
}

/** One timeoutcancel event: the aborted step, the bound, the elapsed time and the immutable log entry it records beside the step outcome. */
export interface timeoutcancelevent {
  id: string;
  runid: string;
  stepid: string;
  bound: number;
  elapsed: number;
  at: number;
  /** The immutable log entry the cancel event wrote beside the step outcome. */
  logged: boolean;
}

/** One tabsuspend state: the suspended tab, its run, the restore url and the state the run preserved across the suspend and restore. */
export interface tabsuspendstate {
  tabid: number;
  runid: string;
  suspendedat: number;
  restoreurl: string;
  /** True when the browser discarded the tab bytes while the run state stayed preserved. */
  discarded: boolean;
}

/** One runcache entry: the resource digest it keys on, the stored resource and the pin flag that survives the run end. */
export interface runcacheentry {
  runid: string;
  digest: string;
  resource: string;
  storedat: number;
  /** True when the user pinned the profile cache so the entry survives the run end. */
  pinned: boolean;
}

/** One stepprefetch hint: the likely next page and the likely next selectors derived from the plan structure. */
export interface stepprefetchhint {
  stepid: string;
  page?: string;
  selectors: string[];
}

/** One durationmeter sample: the step it measured, the monotonic start and end clocks and the duration in milliseconds. */
export interface durationsample {
  stepid: string;
  start: number;
  end: number;
  duration: number;
  monotonic: boolean;
}

/** One selectorprofile stat: the selector, its resolution count, total and average resolution time and its failure rate. */
export interface selectorstats {
  selector: string;
  count: number;
  totalduration: number;
  average: number;
  failures: number;
  failurerate: number;
  /** True when the average resolution time crosses the user latency threshold; the flag reports and never refuses the selector. */
  flagged: boolean;
}

/** One steptrace span: the step or worker task it covers, its start and end clocks, its cause and its parent span. */
export interface steptracespan {
  id: string;
  runid: string;
  stepid?: string;
  task?: string;
  start: number;
  end: number;
  cause: string;
  parent?: string;
}

/** One startupmeter sample: the cold start duration from the startup event to ready and the lazymods budget spent at ready. */
export interface startupsample {
  startedat: number;
  readyat: number;
  duration: number;
  /** The lazymods the startup loaded before ready, reported against the user budget without ever refusing a load. */
  spent: number;
  /** The user configured cold start target; an absent target keeps the sample informational. */
  target?: number;
}

/** One batteryaware scheduling state: the battery level, the charging flag and the scheduled runs deferred on low battery. */
export interface batteryawarestate {
  level: number;
  charging: boolean;
  /** The scheduled runs the scheduler deferred because the battery stayed under the user floor; the deferral never cancels a run. */
  deferred: string[];
  at: number;
}

/** One networkaware retry rule: the failure kind it covers, its backoff window and the server signal it honors when present. */
export interface networkretryrule {
  failurekind: string;
  backoff: number;
  /** The server signal the retry honors, such as a retry-after header value in milliseconds; a present signal overrides the backoff window. */
  serversignal?: number;
}

/** One readparallel group: the independent page reads grouped into parallel lanes and the join state before the dependent steps. */
export interface readparallelgroup {
  runid: string;
  lanes: Array<{ stepid: string; origin: string }>;
  joined: boolean;
}

/** One warmselector record: the validated selector carried between adjacent steps and the page fingerprint it stays valid under. */
export interface warmselectorrecord {
  selector: string;
  resolution: string;
  fingerprint: string;
  carriedfrom: string;
}

/** One cadence control state: the base snapshot interval, the widened interval under memory pressure and the pressure flag. */
export interface cadencecontrol {
  base: number;
  current: number;
  pressure: boolean;
}

/** One slowmo replay session: the recorded run it replays, its speed factor and the steptrace span each pause links to. */
export interface slowmosession {
  runid: string;
  factor: number;
  /** True while the replay pauses between steps for inspection. */
  paused: boolean;
  stepid?: string;
  spanid?: string;
  at: number;
}

/** One efficientresume checkpoint: the step boundary, its cursor and the digest of the page fingerprint it revalidates on resume. */
export interface resumepoint {
  runid: string;
  stepid: string;
  cursor: number;
  digest: string;
  at: number;
}

/** One navdedupe entry: the planned navigation url and the step ids that folded into the single navigation. */
export interface navdedupeentry {
  url: string;
  stepids: string[];
}

/** One sessionreuse grant: the authenticated profile it carries, its container, its consent prompt and the run it attached to. */
export interface sessionreusegrant {
  profile: string;
  container: string;
  promptid: string;
  consentedat: number;
  runid?: string;
}

/** One artifactcompress record: the stored artifact, its codec and the lazy flag of its decompression on read. */
export interface artifactcompressrecord {
  artifactid: string;
  codec: "deflate" | "store";
  compressedat: number;
  /** True when the artifact decompresses lazily on read instead of at restore time. */
  lazy: boolean;
}

/** One logprune rule: the age window and the size window the prune keeps, pruning whole sealed runs only. */
export interface logprunerule {
  /** The age window in milliseconds; a sealed run older than the window leaves while the chain verification summaries stay. */
  retention?: number;
  /** The size window in bytes; an absent window keeps every byte because the prune stays a user choice. */
  sizewindow?: number;
}

/** One run record of the 1.1.70 run lifecycle: the plan it runs, the session it belongs to, its lifecycle state and its timestamps. */
export interface runrecord {
  runid: string;
  planid: string;
  sessionid: string;
  state: runstate;
  createdat: number;
  updatedat: number;
  /** The urlhistory of the run: one urlvisit per completed navigation with consecutive duplicates folded, scoped per run and never merged across runs. */
  visits?: urlvisit[];
  /** The fleet agent this run attributes to; per agent attribution keeps the fleet accounting honest. */
  agentid?: string;
  /** The artifact references of the 1.1.79 minimization family: the exported artifact and capture ids the run produced, so the cleanup pass after the run clears exactly what the run created while the artifacts the user flagged for retention stay. */
  artifacts?: string[];
}

/** One checkpoint of a run: the step boundary it captured, the completed step ids it carries, the page digest it revalidates on resume and its timestamp. */
export interface checkpointrecord {
  runid: string;
  stepid: string;
  /** The step ids the run completed before this checkpoint so the resume skips them. */
  completed: string[];
  digest: string;
  createdat: number;
}

/** One rollback item: the executed step of a failed run its compensating step describes in plain language, inside the origin the approved plan named. */
export interface rollbackitem {
  runid: string;
  stepid: string;
  kind: string;
  origin: string;
  /** The human readable compensating action of the executed step; read only steps carry no compensation at all. */
  compensation: string;
  at: number;
}

/** One queued task of the offlinequeue: an approved plan waiting for connectivity with its monotonic sequence and its plan expiry. */
export interface queuedtask {
  sequence: number;
  planid: string;
  sessionid: string;
  plan: agentplan;
  enqueuedat: number;
  expiresat: number;
}

/** One heartbeat of a running run: the beat counter and the time of the last beat. */
export interface heartbeatrecord {
  runid: string;
  beat: number;
  at: number;
}

/** One run transition: the state a run leaves and the state it enters; the state machine allows only its legal pairs. */
export interface runtransition {
  from: runstate;
  to: runstate;
}

/** One url visit of the urlhistory of a run: the url the navigation landed on, the page title, the visit time and the run it belongs to. */
export interface urlvisit {
  url: string;
  title?: string;
  at: number;
  runid: string;
}

/** One run timeline event of the 1.1.71 state depth family: a timestamp paired with a step result, an audit event or a url visit of one run. */
export interface runtimelineevent {
  at: number;
  /** The run the event belongs to; audit events without a run carry an empty id so the merge keeps them only for their own run. */
  runid: string;
  /** The event source: a step result, an audit event or a url visit. */
  source: "step" | "audit" | "visit";
  summary: string;
  stepid?: string;
  /** The audit kind of an audit event so the timeline carries the audit trail beside the steps. */
  kind?: auditkind;
}

/** One provenance record of a stored memory item: the origin it came from, the run and step that captured it and the capture time. */
export interface memoryprovenance {
  origin: string;
  runid: string;
  stepid: string;
  capturedat: number;
}

/** One expiry rule the user configures: a memory key pattern with its lifetime in milliseconds; a pattern of star matches every key while every lifetime stays the user's choice with no forced ceiling. */
export interface expiryrule {
  pattern: string;
  lifetime: number;
}

/** One quota report of the quotawatch pass: the storage usage, the quota, the remaining bytes and the ranked cleanup candidates; the audit history never enters the candidates without consent. */
export interface quotareport {
  usage: number;
  quota: number;
  remaining: number;
  /** The ranked cleanup candidates by age and expiry policy; an absent list reports no candidate. */
  candidates?: Array<{ key: string; bytes: number; reason: string }>;
}

/** One tab isolation state of the 1.1.71 family: the tabid with its namespace, the isolated run it serves, the copied config snapshot and the timestamp. */
export interface tabstate {
  tabid: number;
  namespace: string;
  config: Record<string, unknown>;
  runid?: string;
  at: number;
}

/** One sessionlock record: the holder runid, the session it serializes, the acquisition time and the expiry time of the user configured window. */
export interface lockrecord {
  holder: string;
  runid: string;
  sessionid: string;
  acquiredat: number;
  expiresat: number;
}

/** One audit export record of the 1.1.71 family: the runs with their urlhistory, the memory items with their provenance, the expiry rules, the timeline stream and the locks bundled into one record for the audit export. */
export interface auditexportrecord {
  at: number;
  runs: runrecord[];
  memory: memoryitem[];
  expiryrules: expiryrule[];
  timeline: runtimelineevent[];
  locks: lockrecord[];
}

/** One stored memory item of the 1.1.71 family: the value wrapped with its provenance record, its memory class, its own expiry timestamp and the at rest encryption flag; the derived key itself never persists. */
export interface memoryitem {
  key: string;
  value: unknown;
  provenance: memoryprovenance;
  memoryclass?: string;
  expiresat?: number;
  /** True when the item value encrypts at rest through encryptrest; the key stays outside the adapter. */
  encrypted?: boolean;
}

/**
 * Types of the 1.1.80 cli expansion family.
 * The cli becomes a complete operator surface beside the extension: the deep manifest checks report every finding with the source file and line, planlint gains the selector grammar, the required option fields and the origin allowlist beside the risk summary, runworkflow replays saved workflows through the library engine with checkpoints and the audit trail file, exportdata serializes session, audit and extraction data through the shared export menu serializers, and headlessmode replays read only kinds against recorded page state fixtures with the same progress model the live runs record.
 */

/** The global cli configuration of the 1.1.80 family: every default the terminal commands honor stays a user choice in this file, never a code default. */
export interface cliconfiguration {
  /** The default plan location planlint reads when the command carries no path argument; an absent value keeps the argument mandatory. */
  defaultplan?: string;
  /** The fixtures directory headlessmode loads its recorded page state from; an absent value keeps the directory flag mandatory. */
  fixturesdir?: string;
  /** The verbosity the terminal commands print at; an absent value keeps the normal verbosity. */
  verbosity?: "quiet" | "normal" | "verbose";
  /** The default output format the commands print when no format flag rides the invocation. */
  format?: "human" | "json";
  /** The consent allowlist of granted origins planlint checks plan origins against; an absent list keeps the allowlist rule off. */
  allowlist?: string[];
}

/** One risk summary of a linted plan: the counts per risk class beside the total, so a review reads the plan risk shape at a glance. */
export interface planrisksummary {
  read: number;
  interaction: number;
  sensitive: number;
  steps: number;
  reason: string;
}

/** One recorded page state fixture of the 1.1.80 family: the observation schema of the live snapshot pipeline beside the origin and the fixture scoped grants, so headlessmode replays read only kinds against recorded state with the same consent gates the live runs run. */
export interface headlessfixture {
  id: string;
  origin: string;
  observation: observation;
  /** The action kinds the fixture grants for headless replay; a kind outside the grants refuses through the fixture consent gate. */
  grants: string[];
  recordedat: number;
}

/** One outcome of a headless fixture step: the executed read only kind with its summary and details, or the unsupported report naming why the fixture cannot satisfy the kind. */
export interface headlessfixtureoutcome {
  stepid: string;
  kind: string;
  state: "done" | "refused" | "unsupported";
  summary: string;
  details?: Record<string, unknown>;
}

/** One run handle of the library entry point: the host watches the progress model, pauses at the next checkpoint and cancels the run, exactly the controls the extension surface offers. */
export interface libraryrunhandle {
  runid: string;
  progress: planprogress;
  /** The pause marker: a paused handle completes no further step until the resume continues from its last checkpoint. */
  paused: boolean;
  cancelled: boolean;
  reason?: string;
}

/** One deep manifest check finding of the 1.1.80 family: the rule that reported, the source file and line of the declaration it reported on, and the severity that decides the exit code. */
export interface manifestcheckfinding {
  rule: string;
  path: string;
  /** The source file and line of the declaration the finding reports, in the file:line form editors consume. */
  source?: string;
  severity: "info" | "warn" | "error";
  message: string;
}

/** One workflow document the runworkflow command loads: the versioned workflow payload beside the granted origins, in the composeworkflow grammar the extension engine already validates. */
export interface workflowdocument {
  version: string;
  workflow: {
    name: string;
    version: number;
    origins: string[];
    steps: Array<Record<string, unknown>>;
    blocks?: Array<Record<string, unknown>>;
  };
}

/** One structured outcome summary of a runworkflow execution: the run state beside the per step durations, the checkpoint the run reached and the exit class the terminal maps onto its exit code. */
export interface runworkflowoutcome {
  runid: string;
  state: string;
  steps: Array<{ stepid: string; label: string; state: string; duration: number; summary: string }>;
  checkpoint: number;
  exitclass: string;
  exitcode: number;
  reason?: string;
}

/** The servercontract version of the 1.1.82 site integration family: the static site and the extension negotiate this number inside the handshake before any event crosses the bridge. */
export const servercontractversion = 1;

/** The wire operations of the servercontract: sessioncreate, sessionjoin, eventpost and eventstream — every frame the relay routes carries exactly one of them. */
export type serveroperation = "sessioncreate" | "sessionjoin" | "eventpost" | "eventstream";

/** The event types the bridge carries: chat text, plan proposals, plan review decisions and run progress statuses; page content rides none of them by default. */
export type servereventtype = "chat" | "planproposal" | "planreview" | "progress";

/** The capabilities one side of the servercontract handshake declares: the contract version it speaks, the operations it accepts, the event types it consumes and whether it sends heartbeat frames and multiplexes streams over one socket. */
export interface servercontractcapabilities {
  version: number;
  operations: serveroperation[];
  events: servereventtype[];
  heartbeat?: boolean;
  multiplex?: boolean;
}

/** The message envelope of the servercontract: the negotiated version, one wire operation, the stable operation id every reply quotes for correlation, the session and frame token, the timestamp and the operation body; session tokens ride frames only and never appear in urls or logs. */
export interface serverenvelope {
  version: number;
  op: serveroperation;
  opid: string;
  sessionid?: string;
  token?: string;
  at: number;
  body?: Record<string, unknown>;
}

/** One member of a relay session: the extension side or the site side; the relay allows exactly one of each role per session. */
export interface sessionmember {
  role: "extension" | "site";
  id: string;
  joinedat: number;
}

/** One bridge pairing record of the 1.1.82 family: the one time pairing code bound to the relay origin the user typed, minted inside the extension options, with the mint time riding beside the code record the clientauth family already defines. */
export interface bridgepairingrecord {
  origin: string;
  code: pairingcode;
  at: number;
}

/** One relay session token record: the raw token leaves exactly once in the exchange answer while the record persists only its sha-256 hash, the record is scoped to the relay origin and the session it opens, and a rotated token keeps the id of the token it replaced. */
export interface relaytokenrecord {
  id: string;
  sessionid: string;
  origin: string;
  hash: tokenhash;
  issuedat: number;
  expiresat?: number;
  rotatedfrom?: string;
  revokedat?: number;
}

/** One relay session record: the origin of the user configured relay url, the extension and site members (one of each at most), the lifecycle state, the last frame time and the idle window the user chose. */
export interface bridgesessionrecord {
  id: string;
  origin: string;
  state: "open" | "idle" | "closed";
  extension: sessionmember;
  site?: sessionmember;
  createdat: number;
  lastframeat: number;
  idlewindow?: number;
  closedat?: number;
}

/** One bridge event record: the event type, the operation id every reply correlates, the stream it rode, the minimized payload and the delivery state; the payload carries plan text and statuses only unless the explicit page consent flag is set. */
export interface bridgeeventrecord {
  id: string;
  sessionid: string;
  kind: servereventtype;
  opid: string;
  stream: string;
  payload: Record<string, unknown>;
  at: number;
  delivered?: boolean;
}

/** One offline bridge queue record: the frame body that waits for the socket, with its stable operation id for the replay deduplication, the send attempts and the send time once the replay delivered it. */
export interface bridgequeuerecord {
  opid: string;
  op: serveroperation;
  sessionid: string;
  body: Record<string, unknown>;
  queuedat: number;
  attempts: number;
  sentat?: number;
}

/** One plan review card the chatbridge widget renders: the proposal id, the plan title, the step digest with kinds, origins and sensitive flags, and the review deadline; the card renders and collects decisions only, it never executes an action. */
export interface bridgereviewcard {
  proposalid: string;
  title: string;
  steps: Array<{ id: string; kind: string; origin: string; sensitive: boolean }>;
  timeoutat?: number;
  at: number;
}

/** One review decision returned through the bridge: approved, changes or refused — the decision reaches the extension review gate as a resolution request and the extension stays the only executor. */
export interface bridgereviewdecision {
  proposalid: string;
  decision: "approved" | "changes" | "refused";
  by: string;
  note?: string;
  at: number;
}

/** The engaged state of the bridge kill switch: one click disables the socket and the pairing instantly and the release returns both; the record keeps both timestamps for the audit trail. */
export interface bridgekillswitch {
  engaged: boolean;
  at: number;
}

/** The browser families the 1.1.86 cross browser build ships: chromium stays the source manifest, firefox and safari ride the per browser overlays the build emits. */
export type webextensionbrowser = "chromium" | "firefox" | "safari";

/** The kind of one recorded webextension api of the 1.1.86 apimap: a namespace the codebase reads, a method it calls, an event it listens to, or a property it queries. */
export type webextensionapikind = "namespace" | "method" | "event" | "property";

/** One apimap entry of the 1.1.86 browser coverage family: the reviewed api name, the per browser equivalent (chromium, firefox and safari), the kind and the empty marker that flags an api a single browser lacks. */
export interface webextensionapientry {
  api: string;
  chromium: string;
  firefox: string;
  safari: string;
  kind: webextensionapikind;
}

/** The runtime probe input the 1.1.86 apimap reads: the runtime object the host carries (the chrome or the browser namespace) and the user agent probe seam that names the running browser when the runtime seam is absent. */
export interface apibrowserprobeinput {
  runtime?: unknown;
  probeuseragent?: () => string;
}

/** The cached browser probe the 1.1.86 apimap ships: the probe answers the running browser once and the cache holds it for the rest of the run, the refresh rewrites the cache when the build runs the same process over a new context. */
export interface apimapbrowserprobe {
  probe: () => webextensionbrowser;
  refresh: () => webextensionbrowser;
}

/** The resolution of one apimap call: the resolved browser, the equivalent api name and the ok marker; an unmapped api surfaces the unsupported reason and the none retry hint so the caller surfaces a structured error. */
export interface apimapresolution {
  ok: boolean;
  browser: webextensionbrowser;
  api?: string;
  equivalent?: string;
  reason?: string;
  retry?: "none" | "reconnect" | "reinstall";
}

/** The build time unmapped apimap report: every api row with its per browser coverage, the missing lists per browser and the failed marker that fails the build before an unmapped api ships. */
export interface apimapreport {
  rows: Array<{ api: string; chromium: boolean; firefox: boolean; safari: boolean }>;
  missingchromium: string[];
  missingfirefox: string[];
  missingsafari: string[];
  failed: boolean;
  reason: string;
}

/** The structured error of an unsupported apimap call: the family, the message, the retry hint and the time, so a caller maps the failure to its next action instead of a bare throw. */
export interface apimapstructerror {
  family: "apimap";
  message: string;
  retry: "none" | "reconnect" | "reinstall";
  browser: webextensionbrowser;
  api: string;
  at: number;
}

/** The source manifest the 1.1.86 cross browser build reads: every field the per browser overlay rewrites lives beside the source values the build keeps identical on every browser; one manifest speaks every webextension dialect. */
export interface browsermanifestsource {
  manifest_version: number;
  name: string;
  version: string;
  description: string;
  permissions: string[];
  optional_permissions: string[];
  optional_host_permissions: string[];
  host_permissions?: string[];
  sandbox?: { pages: string[] };
  offscreen?: { document: string; reasons: string[]; justification: string };
  background?: { service_worker?: string; scripts?: string[]; type?: string };
  action?: { default_title?: string; default_popup?: string; default_icon?: Record<string, string> };
  side_panel?: { default_path: string };
  chrome_url_overrides?: Record<string, string>;
  options_ui?: { page: string; open_in_tab: boolean };
  web_accessible_resources?: Array<{ resources: string[]; matches: string[] }>;
  content_security_policy?: { extension_pages?: string; sandbox?: string };
  browser_specific_settings?: {
    gecko?: { id: string; strict_min_version?: string };
    safari?: { strict_min_version?: string };
  };
  /** The per browser overlays the single root manifest carries since the 1.1.93 consolidation: the firefox and the safari adaptation data layers on top of the source fields inside the same manifest file — never a second hand maintained manifest beside the source — and the build strips the key from every derived browser manifest before it ships. */
  browsers?: { firefox?: browsermanifestoverlay; safari?: browsermanifestoverlay };
  /** The vs code packaging overlay the single root manifest carries since the 1.1.93 consolidation: the package identity, the engines floor, the commands, the configuration keys, the telemetry statement and the webview paths the vsix family documents — every field the old manifests/vsix.json file carried except the version, because the root manifest version is the single source the release synchronization stamps; the shape stays an inline structural type so the frozen library surface of the 1.1.91 api freeze gains no new export name. */
  vsix?: {
    name: string;
    displayname: string;
    publisher: string;
    description: string;
    engines: { vscode: string };
    categories: string[];
    main: string;
    commands: Array<{ command: string; title: string }>;
    configuration: Array<{ key: string; default: string; description: string }>;
    telemetry: string;
    relayurldefault: string;
    webview: string;
    relaypath: string;
  };
}

/** The per browser overlay the 1.1.86 cross browser build applies on top of the source manifest: the fields the build rewrites stay optional so a single overlay carries only the per browser differences. */
export interface browsermanifestoverlay {
  browser: webextensionbrowser;
  browser_specific_settings?: { id: string; strict_min_version?: string };
  background?: { scripts?: string[]; service_worker?: string; type?: string };
  action?: { default_popup?: string; default_icon?: Record<string, string> };
  side_panel?: { default_path?: string };
  optional_permissions?: string[];
  host_permissions?: string[];
  web_accessible_resources?: Array<{ resources: string[]; matches: string[] }>;
  content_security_policy?: { extension_pages?: string; sandbox?: string };
}

/** The adapted manifest the 1.1.86 firefoxprep produces: the source manifest carries the per browser overlay fields layered on top, the deny list stays in force across overlays and the host permissions stay empty on every browser. */
export interface browsermanifestadapted {
  manifest: browsermanifestsource;
  overlay: browsermanifestoverlay;
  changes: string[];
}

/** The xpipack input of the 1.1.86 firefox packaging family: the firefox adapted manifest, the dist bundles the xpi carries and the version stamp the artifact name embeds. */
export interface xpipackinput {
  manifest: browsermanifestsource;
  bundleentries: Array<{ name: string; bytes: Uint8Array }>;
  version: string;
  outdir?: string;
}

/** The xpipack output of the 1.1.86 firefox packaging family: the xpi archive bytes, the manifest placement and the addon linter markers the build asserts. */
export interface xpipackoutput {
  archive: { name: string; bytes: Uint8Array };
  manifestname: string;
  entries: string[];
  lintermarkers: { errors: number; warnings: number };
}

/** The safariskeleton input of the 1.1.86 safari packaging family: the chromium extension payload, the version stamp, the bundle id and the app entitlements the wrapper declares. */
export interface safariskeletoninput {
  version: string;
  bundleid: string;
  extensionpayload: Array<{ name: string; bytes: Uint8Array }>;
  entitlements: string[];
  outdir?: string;
}

/** The safariskeleton output of the 1.1.86 safari packaging family: the wrapper files of the xcode project, the entitlements, the minimal app shell and the payload embedding the chromium extension. */
export interface safariskeletonoutput {
  archive: { name: string; bytes: Uint8Array };
  projectfiles: Array<{ path: string; text: string }>;
  entitlements: string[];
  appshell: string;
}

/** The cross browser feature flag set the 1.1.86 build ships: every flag the codebase declares, the default set the build stamps (the intersection across browsers) and the per browser overrides the build applies. */
export interface crossbrowserfeatureflagset {
  flags: string[];
  defaultset: string[];
  perbrowser: Record<webextensionbrowser, string[]>;
}

/** The vsix manifest fields of the 1.1.87 vs code packaging family: the extension identity, the engine floor, the declared capabilities and commands, the telemetry off statement and the empty network default the webview honors — no vendor marketplace url and no download url ever appears here. */
export interface vsixmanifestfields {
  name: string;
  displayname: string;
  publisher: string;
  version: string;
  description: string;
  engines: Record<string, string>;
  categories: string[];
  main: string;
  commands: Array<{ command: string; title: string }>;
  configuration: Array<{ key: string; default: string; description: string }>;
  telemetry: "off";
  relayurldefault: "";
}

/** The vsixpack input of the 1.1.87 vs code packaging family: the release version, the library esm bundle bytes the webview reuses and the relay path the chatbridge surface connects to through the user configured url. */
export interface vsixpackinput {
  version: string;
  esmbundlebytes: Uint8Array;
  relaypath?: string;
  outdir?: string;
}

/** The vsixpack output of the 1.1.87 vs code packaging family: the vsix archive bytes (a plain zip with the extension manifest at the root), the entry list and the manifest fields the marketplace metadata check validates. */
export interface vsixpackoutput {
  archive: { name: string; bytes: Uint8Array };
  entries: string[];
  manifestfields: vsixmanifestfields;
}

/** The maven attached artifact of the 1.1.88 maven packaging family: the extension zip and the declarations zip the single distribution pom attaches with their classifiers beside the one jar. */
export interface mavenattachedartifact {
  classifier: string;
  type: string;
  path: string;
}

/** The maven pom metadata of the 1.1.87 maven packaging family: the coordinates, the project url, the scm links and the license the pom records. */
export interface mavenpommetadata {
  groupid: string;
  artifactid: string;
  name: string;
  description: string;
  url: string;
  scmurl: string;
  scmconnection: string;
  license: string;
  licenseurl: string;
}

/** The nuget content entry of the 1.1.87 nuget packaging family: one source file the pack places at its content path inside the nupkg. */
export interface nugetcontententry {
  source: string;
  contentpath: string;
}

/** The nuget package metadata of the 1.1.87 nuget packaging family: the package id, the project url, the license expression, the readme and the framework targets the csproj profile declares. */
export interface nugetpackmetadata {
  packageid: string;
  projecturl: string;
  repositoryurl: string;
  license: string;
  readme: string;
  description: string;
  targets: string[];
}

/** The container build stage of the 1.1.87 container packaging family: the stage name, the checks the builder stage runs before the runtime stage copies its lean output, and the surfaces the runtime image exposes. */
export interface containerbuildstage {
  name: string;
  purpose: string;
  checks: string[];
}

/** The exposed surface of the 1.1.87 container image: the static site, the mcp server and the socket relay each behind the user chosen bind, port and path. */
export interface containerexposedsurface {
  name: string;
  kind: "site" | "mcp" | "relay";
  bindenv: string;
  portenv: string;
  path?: string;
}

/** The release artifact record of the 1.1.87 artifact manifest family: the artifact name, its byte size, its sha256 checksum and the publishing channels it belongs to. */
export interface artifactmanifestentry {
  name: string;
  size: number;
  checksum: string;
  channels: string[];
}

/** The artifact manifest of the 1.1.87 publishing pipeline: the version it stamps and every release artifact with its name, size, checksum and channels — the manifest never carries a timestamp so the build stays deterministic. */
export interface artifactmanifestdocument {
  name: string;
  version: string;
  /** The stamped banner of the build that produced the manifest: the devthink version and the license ride one line so every shipped json artifact carries the same review stamps the bundles carry. */
  banner: string;
  artifacts: artifactmanifestentry[];
}

/** The sbom inventory input of the 1.1.87 publishing pipeline: the release version and the artifact records the cyclonedx inventory covers. */
export interface sbominventoryinput {
  version: string;
  artifacts: Array<{ name: string; size: number; checksum: string; channels?: string[] }>;
}

/** The relay server connection of the 1.1.87 self hosting family: one connected socket with its role, its session, its token hash and its frame clock — the state machine never holds the raw token, only the hash the injected seam computes. */
export interface relayserverconnection {
  id: string;
  role: "" | "extension" | "site";
  sessionid: string;
  tokenhash: string;
  lastframeat: number;
}

/** The relay server session of the 1.1.87 self hosting family: the session id, its member connections, the event log and the token hashes the session issued (one live token per member with the rotation revoking the previous). */
export interface relayserversession {
  id: string;
  extension: string | undefined;
  site: string | undefined;
  events: Array<{ opid: string; kind: string; stream: string; at: number }>;
  tokenhashes: string[];
  revoked: string[];
}

/** The relay server state of the 1.1.87 self hosting family: the sessions, the pending pairing codes, the live connections and the memory-only token issuance records (the raw token lives exactly here and nowhere else — no log, no audit record and no persistence ever carries it, the records outside this map keep the hash only). */
export interface relayserverstate {
  sessions: relayserversession[];
  pairings: Array<{ code: string; sessionid: string; expiresat: number; used: boolean }>;
  connections: relayserverconnection[];
  tokens: Array<{ connectionid: string; token: string }>;
  issued: number;
}

/* === section: the gateway engine configuration vocabulary (the embedded gateway of the grand merge) === */
// ---------------------------------------------------------------------------
// thinking levels
// ---------------------------------------------------------------------------

/** thinking levels ordered by budget ascending */
export type thinkinglevel = "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | "max";

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
  /** local sqlite path fallback — file:./prisma/devthink.db */
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
