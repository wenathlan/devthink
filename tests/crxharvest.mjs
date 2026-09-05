/**
 * Harvests Chrome Web Store CRX packages for every cataloged extension id and
 * mines the browser agent feature landscape from the packages.
 *
 * Evidence-only policy: every downloaded package is untrusted data. This
 * script never evaluates package code. It performs static text analysis only,
 * deletes each raw artifact right after analysis and persists only derived
 * analysis records in tests/artifacts/harvestcache.json. The report is
 * written to docs/12.crxfeaturemining.md.
 *
 * Usage:
 *   node tests/crxharvest.mjs               analyze pending ids then rewrite the report
 *   node tests/crxharvest.mjs --limit=10    analyze at most 10 pending ids
 *   node tests/crxharvest.mjs --skip=5      skip the first 5 pending ids
 *   node tests/crxharvest.mjs --refresh     re-analyze every id ignoring the cache
 */
import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { promisify } from "node:util";
import { extname, join } from "node:path";

const execute = promisify(execFile);
const root = process.cwd();
const artifactsdir = join(root, "tests", "artifacts");
const harvestdir = join(artifactsdir, "harvest");
const cachepath = join(artifactsdir, "harvestcache.json");
const reportpath = join(root, "docs", "12.crxfeaturemining.md");
const updatebase = "https://clients2.google.com/service/update2/crx?response=redirect&prodversion=131.0.6778.265&acceptformat=crx2,crx3&x=id%3D";

const cliarguments = process.argv.slice(2);
const flagvalue = (name) => {
  const prefix = `--${name}=`;
  const found = cliarguments.find((argument) => argument.startsWith(prefix));
  const parsed = Number.parseInt(found?.slice(prefix.length) ?? "", 10);
  return Number.isFinite(parsed) ? parsed : undefined;
};
const skipcount = flagvalue("skip") ?? 0;
const limitcount = flagvalue("limit") ?? Number.POSITIVE_INFINITY;
const refresh = cliarguments.includes("--refresh");

/**
 * Signal categories map keyword evidence found in package script text to
 * concrete candidate features. A trailing star in a term means the stem
 * matches any suffix (for example isolat matches isolated and isolation).
 */
const signalkits = [
  {
    category: "planning",
    terms: {
      "plan*": "multi step plan execution",
      "task*": "task oriented decomposition",
      "workflow*": "workflow definition and replay",
      "step*": "step by step execution tracking",
      objective: "objective oriented planning",
    },
  },
  {
    category: "observation",
    terms: {
      "snapshot*": "page state snapshotting",
      "accessib*": "accessibility tree extraction",
      dom: "dom structure extraction",
      "extract*": "data extraction from page content",
      "scrap*": "web scraping pipelines",
      "selector*": "css selector targeting",
      "queryselector*": "dom querying through queryselector calls",
    },
  },
  {
    category: "interaction",
    terms: {
      "click*": "element click actions",
      "fill*": "form filling actions",
      type: "keyboard text entry",
      keyboard: "keyboard event synthesis",
      "key*": "key press dispatch",
      "press*": "key press dispatch",
      "hover*": "hover simulation",
      "scroll*": "scroll control",
      "drag*": "drag actions",
      drop: "drop target handling",
      "upload*": "file upload automation",
      "select*": "dropdown selection",
      "check*": "checkbox and state checking",
      "toggle*": "toggle state changes",
    },
  },
  {
    category: "navigation",
    terms: {
      "navigat*": "programmatic navigation",
      goto: "url goto navigation",
      url: "url tracking and construction",
      urls: "url tracking and construction",
      href: "link following",
      "reload*": "page reload control",
      back: "history back navigation",
      forward: "history forward navigation",
      history: "history stack inspection",
    },
  },
  {
    category: "recording",
    terms: {
      "record*": "user action recording",
      replay: "recorded action replay",
      "macro*": "macro playback",
      "trace*": "trace capture",
      "captur*": "event capture",
    },
  },
  {
    category: "workflow blocks",
    terms: {
      "trigger*": "workflow triggers",
      "schedul*": "scheduled runs",
      cron: "cron style scheduling",
      "loop*": "loop constructs",
      "condition*": "conditional branching",
      "branch*": "branching logic",
      "variabl*": "flow variables",
      "repeat*": "repeat blocks",
      "delay*": "delay steps",
    },
  },
  {
    category: "data handling",
    terms: {
      csv: "csv data export",
      excel: "excel data export",
      json: "json data handling",
      export: "data export pipelines",
      import: "data import pipelines",
      "table*": "table detection and handling",
      "parse*": "content parsing",
      "transform*": "data transformation",
    },
  },
  {
    category: "media",
    terms: {
      "screenshot*": "screenshot capture",
      "image*": "image processing",
      pdf: "pdf handling",
      video: "video handling",
      canvas: "canvas capture",
      ocr: "optical character recognition",
      vision: "vision model integration",
    },
  },
  {
    category: "network",
    terms: {
      fetch: "http fetch requests",
      "websocket*": "websocket channels",
      xmlhttprequest: "xmlhttprequest usage",
      "intercept*": "request interception",
      proxy: "proxy routing",
      proxies: "proxy routing",
      "header*": "header manipulation",
      "request*": "request construction",
      "respon*": "response handling",
    },
  },
  {
    category: "debugging",
    terms: {
      console: "console output capture",
      devtools: "devtools integration",
      "debugger*": "debugger attachment",
      "breakpoint*": "breakpoint control",
      log: "logging pipelines",
      "error*": "error capture",
      performance: "performance metrics",
      memory: "memory inspection",
      "profile*": "profiling integration",
    },
  },
  {
    category: "agents and models",
    terms: {
      "agent*": "agent execution loops",
      llm: "llm reasoning calls",
      gpt: "gpt model calls",
      openai: "openai api integration",
      anthropic: "anthropic api integration",
      gemini: "gemini model integration",
      "model*": "model selection and routing",
      "prompt*": "prompt construction",
      "completion*": "completion handling",
      "embedding*": "embedding generation",
      "chat*": "chat interfaces",
    },
  },
  {
    category: "mcp and protocol",
    terms: {
      mcp: "model context protocol support",
      jsonrpc: "json rpc messaging",
      "json-rpc": "json rpc messaging",
      "schema*": "schema validation",
      "tool*": "tool exposure",
      "capabilit*": "capability negotiation",
    },
  },
  {
    category: "multi tab",
    terms: {
      tabs: "multi tab operations",
      windows: "window management",
      "tabgroup*": "tab grouping",
      pinned: "tab pinning",
      mute: "tab muting",
      muted: "tab muting",
    },
  },
  {
    category: "sessions",
    terms: {
      "session*": "session persistence",
      "cookie*": "cookie state handling",
      storage: "state storage",
      "persist*": "durable state",
      state: "state tracking",
      "restor*": "state restoration",
    },
  },
  {
    category: "forms",
    terms: {
      form: "form automation",
      "input*": "input field control",
      "autofill*": "autofill capabilities",
      "password*": "credential handling",
      "submit*": "form submission",
    },
  },
  {
    category: "testing",
    terms: {
      "assert*": "assertion checks",
      "expect*": "expectation validation",
      "test*": "test case management",
      e2e: "end to end test flows",
      smoke: "smoke test runs",
    },
  },
  {
    category: "ui surfaces",
    terms: {
      "popup*": "popup command surface",
      "sidepanel*": "side panel interface",
      "side panel": "side panel interface",
      options: "options configuration surface",
      "contextmenu*": "context menu commands",
      "context menu": "context menu commands",
      "omnibox*": "omnibox keyword commands",
      "notification*": "notification alerts",
      "badge*": "toolbar badge status",
      "shortcut*": "keyboard shortcuts",
    },
  },
  {
    category: "security and consent",
    terms: {
      "permission*": "permission gating",
      "consent*": "consent flows",
      "approv*": "approval workflows",
      "sandbox*": "sandboxed execution",
      "isolat*": "isolated execution contexts",
    },
  },
  {
    category: "clipboard",
    terms: {
      "clipboard*": "clipboard integration",
      copy: "copy to clipboard",
      "paste*": "paste from clipboard",
    },
  },
  {
    category: "downloads and files",
    terms: {
      "download*": "download management",
      "upload*": "upload handling",
      "file*": "file exchange",
    },
  },
  {
    category: "find in page",
    terms: {
      findinpage: "find in page control",
      "find in page": "find in page control",
      find: "in page find",
      "search*": "in page search",
      "highlight*": "result highlighting",
    },
  },
  {
    category: "reader mode",
    terms: {
      readermode: "reader mode extraction",
      "reader*": "readable content extraction",
      "article*": "article parsing",
      extractcontent: "main content extraction",
    },
  },
  {
    category: "waiting and retries",
    terms: {
      "wait*": "explicit waits",
      "sleep*": "sleep steps",
      timeout: "timeout guards",
      "poll*": "polling loops",
      "retry*": "retry logic",
    },
  },
];

/**
 * Maps known chrome api namespace dot method pairs observed in script text to
 * a concrete feature statement. Pairs that are not mapped still count in the
 * aggregate api surface table.
 */
const apifeatures = {
  "tabs.query": "query open tabs by url or title",
  "tabs.get": "read tab details by id",
  "tabs.getCurrent": "read the extension own tab context",
  "tabs.create": "open new tabs programmatically",
  "tabs.update": "update tab url or active state",
  "tabs.remove": "close tabs by id",
  "tabs.duplicate": "duplicate tabs",
  "tabs.reload": "reload tabs",
  "tabs.move": "move tabs between positions",
  "tabs.highlight": "highlight a set of tabs",
  "tabs.group": "group tabs together",
  "tabs.ungroup": "ungroup tabs",
  "tabs.pin": "pin tabs",
  "tabs.mute": "mute tab audio",
  "tabs.discard": "discard tabs from memory",
  "tabs.setZoom": "set tab zoom level",
  "tabs.getZoom": "read tab zoom level",
  "tabs.goBack": "navigate a tab back",
  "tabs.goForward": "navigate a tab forward",
  "tabs.captureVisibleTab": "capture a screenshot of the visible tab",
  "tabs.sendMessage": "message content scripts inside a tab",
  "tabs.executeScript": "run code inside a tab using the legacy mv2 path",
  "tabs.insertCSS": "insert styles into a tab using the legacy mv2 path",
  "tabs.onCreated": "react to new tabs",
  "tabs.onUpdated": "react to tab changes",
  "tabs.onActivated": "react to tab activation",
  "tabs.onRemoved": "react to tab closure",
  "tabs.onMessage": "receive messages from tabs",
  "runtime.sendMessage": "send internal messages between extension contexts",
  "runtime.onMessage": "handle internal messages",
  "runtime.connect": "open long lived internal ports",
  "runtime.onConnect": "accept long lived internal ports",
  "runtime.connectNative": "bridge to a native host process",
  "runtime.sendNativeMessage": "message a native host process",
  "runtime.getURL": "resolve packaged resource urls",
  "runtime.getManifest": "read the own manifest at runtime",
  "runtime.lastError": "handle api error payloads",
  "runtime.id": "identify the own extension context",
  "runtime.reload": "reload the own extension",
  "scripting.executeScript": "inject scripts into granted pages",
  "scripting.insertCSS": "inject styles into granted pages",
  "scripting.removeCSS": "remove injected styles",
  "storage.local": "use the local storage area",
  "storage.sync": "sync settings across devices",
  "storage.session": "use session scoped storage",
  "storage.onChanged": "react to storage changes",
  "debugger.attach": "attach cdp debugger sessions to chosen tabs",
  "debugger.detach": "detach the debugger from a tab",
  "debugger.sendCommand": "send raw cdp commands",
  "debugger.onEvent": "listen to cdp domain events",
  "debugger.onDetach": "handle debugger detach events",
  "downloads.download": "save files through the downloads api",
  "downloads.onChanged": "track download progress",
  "downloads.search": "search past downloads",
  "downloads.open": "open downloaded files",
  "downloads.show": "show downloaded files in the file manager",
  "cookies.get": "read cookies for a url",
  "cookies.getAll": "enumerate cookies by filter",
  "cookies.set": "set cookies",
  "cookies.remove": "delete cookies",
  "cookies.onChanged": "react to cookie changes",
  "commands.getAll": "list bound keyboard shortcuts",
  "commands.onCommand": "respond to keyboard shortcut commands",
  "contextMenus.create": "register page context menu commands",
  "contextMenus.onClicked": "handle context menu clicks",
  "contextMenus.update": "update context menu entries",
  "contextMenus.removeAll": "clear context menu entries",
  "windows.create": "create browser windows",
  "windows.update": "update window state",
  "windows.remove": "close windows",
  "windows.getAll": "list all windows",
  "windows.getCurrent": "read the current window",
  "windows.onFocusChanged": "track window focus changes",
  "webNavigation.onBeforeNavigate": "observe navigations before they commit",
  "webNavigation.onCommitted": "observe committed navigations",
  "webNavigation.onCompleted": "react to page loads",
  "webNavigation.onHistoryStateUpdated": "detect single page app url changes",
  "webNavigation.getAllFrames": "enumerate frames of a tab",
  "notifications.create": "raise system notifications",
  "alarms.create": "schedule delayed runs",
  "alarms.onAlarm": "run scheduled handlers",
  "alarms.clear": "cancel scheduled runs",
  "sidePanel.setOptions": "configure the side panel per tab",
  "sidePanel.open": "open the side panel",
  "sidePanel.setPanelBehavior": "control side panel behavior",
  "action.setBadgeText": "show toolbar badge status",
  "action.setBadgeBackgroundColor": "style the toolbar badge",
  "action.setTitle": "set the toolbar title",
  "action.setIcon": "set the toolbar icon",
  "action.setPopup": "change the popup target",
  "action.onClicked": "act on toolbar clicks",
  "identity.launchWebAuthFlow": "run oauth flows",
  "identity.getAuthToken": "obtain google oauth tokens",
  "tts.speak": "speak text aloud",
  "tts.stop": "stop speech",
  "history.search": "search browsing history",
  "history.addUrl": "record history entries",
  "bookmarks.create": "create bookmarks",
  "bookmarks.getTree": "read the bookmark tree",
  "i18n.getMessage": "localize interface strings",
  "permissions.request": "request optional permissions at runtime",
  "permissions.contains": "check granted permissions",
  "permissions.remove": "drop granted permissions",
  "idle.onStateChanged": "react to idle state changes",
  "idle.queryState": "query the idle state",
  "declarativeNetRequest.updateDynamicRules": "update dynamic request rules",
  "declarativeNetRequest.updateSessionRules": "update session request rules",
  "declarativeNetRequest.getSessionRules": "read session request rules",
  "proxy.settings": "adjust proxy settings at runtime",
  "webRequest.onBeforeRequest": "observe requests before they are sent",
  "webRequest.onBeforeSendHeaders": "modify request headers",
  "webRequest.onCompleted": "observe completed responses",
  "webRequest.onErrorOccurred": "observe failed requests",
  "system.memory.getInfo": "read device memory metrics",
  "system.cpu.getInfo": "read cpu metrics",
  "system.display.getInfo": "read display metrics",
  "topSites.get": "read most visited sites",
  "browsingData.remove": "clear browsing data",
  "management.getAll": "enumerate installed extensions",
  "management.getSelf": "read the own extension info",
  "sessions.getRecentlyClosed": "list recently closed tabs",
  "sessions.restore": "restore closed sessions",
  "offscreen.createDocument": "create offscreen documents",
  "offscreen.closeDocument": "close offscreen documents",
  "tabCapture.capture": "capture tab audio and video",
  "extension.getURL": "resolve packaged resource urls the legacy way",
  "extension.getBackgroundPage": "reach the legacy background page",
  "extension.sendMessage": "send internal messages the legacy way",
  "extension.onMessage": "handle internal messages the legacy way",
  "browserAction.setBadgeText": "show toolbar badge status the legacy way",
  "pageAction.show": "show legacy page actions",
  "devtools.inspectedWindow": "inspect the devtools target window",
  "devtools.panels": "register devtools panels",
};

/**
 * Maps declared permissions to concrete feature statements. Primary items are
 * always emitted, secondary items only top up short lists.
 */
const permissionfeatures = {
  storage: { primary: ["persist state in local storage areas", "persist settings across sessions"], secondary: ["sync settings across devices when enabled"] },
  tabs: { primary: ["read and manage open tabs", "observe tab lifecycle events"], secondary: ["activate or close tabs programmatically"] },
  scripting: { primary: ["inject scripts into granted pages"], secondary: ["inject styles for page overlays"] },
  activeTab: { primary: ["act on the currently active tab after a user gesture"], secondary: [] },
  debugger: { primary: ["attach the chrome devtools protocol to tabs", "capture network and dom events through cdp"], secondary: ["dispatch low level input events through cdp"] },
  cookies: { primary: ["read and write cookies per domain"], secondary: [] },
  downloads: { primary: ["save generated files to disk"], secondary: ["track download progress"] },
  "downloads.shelf": { primary: ["control the download shelf ui"], secondary: [] },
  contextMenus: { primary: ["add commands to the page context menu"], secondary: [] },
  sidePanel: { primary: ["host a docked side panel interface"], secondary: [] },
  webNavigation: { primary: ["observe navigation events across frames"], secondary: [] },
  alarms: { primary: ["schedule delayed or periodic runs"], secondary: [] },
  notifications: { primary: ["raise system notifications"], secondary: [] },
  tabGroups: { primary: ["organize tabs into named groups"], secondary: [] },
  offscreen: { primary: ["run hidden offscreen documents for background work"], secondary: [] },
  clipboardRead: { primary: ["read clipboard content"], secondary: [] },
  clipboardWrite: { primary: ["write to the clipboard"], secondary: [] },
  nativeMessaging: { primary: ["exchange messages with a native companion app"], secondary: [] },
  declarativeNetRequest: { primary: ["modify network requests with declarative rules"], secondary: [] },
  declarativeNetRequestWithHostAccess: { primary: ["modify network requests with host access rules"], secondary: [] },
  proxy: { primary: ["control proxy configuration"], secondary: [] },
  webRequest: { primary: ["observe and modify requests in flight"], secondary: [] },
  "webRequestBlocking": { primary: ["block or alter requests synchronously"], secondary: [] },
  history: { primary: ["read and search browsing history"], secondary: [] },
  bookmarks: { primary: ["manage bookmarks"], secondary: [] },
  tts: { primary: ["speak text aloud"], secondary: [] },
  identity: { primary: ["sign in through oauth"], secondary: [] },
  "identity.email": { primary: ["read the signed in account email"], secondary: [] },
  management: { primary: ["inspect installed extensions"], secondary: [] },
  sessions: { primary: ["restore recently closed tabs and windows"], secondary: [] },
  browsingData: { primary: ["clear browsing data"], secondary: [] },
  topSites: { primary: ["read most visited sites"], secondary: [] },
  power: { primary: ["keep the device awake during runs"], secondary: [] },
  "system.memory": { primary: ["read device memory info"], secondary: [] },
  "system.cpu": { primary: ["read cpu usage"], secondary: [] },
  "system.display": { primary: ["read display metrics"], secondary: [] },
  tabCapture: { primary: ["capture tab audio and video"], secondary: [] },
  unlimitedStorage: { primary: ["store large datasets beyond the default quota"], secondary: [] },
  geolocation: { primary: ["read device location"], secondary: [] },
  idle: { primary: ["detect user idle state"], secondary: [] },
  background: { primary: ["run a persistent background context"], secondary: [] },
  windows: { primary: ["manage browser windows"], secondary: [] },
  privacy: { primary: ["read privacy settings"], secondary: [] },
  gcm: { primary: ["receive push messages"], secondary: [] },
  declarativeContent: { primary: ["react to page content conditions"], secondary: [] },
  contentSettings: { primary: ["manage per site content settings"], secondary: [] },
};

/**
 * Public knowledge per cataloged product. Items here are tagged inferred in
 * the report because they rest on public product knowledge, not on the raw
 * package evidence.
 */
const knowledgepool = {
  cecngibhkljoiafhjfmcgbmikfogdiko: [
    "pairs the browser with the manus cloud agent service",
    "relays page snapshots and dom state to a remote agent",
    "executes agent issued click type and scroll actions locally",
    "task progress and agent activity feed in the interface",
    "session linking through an authenticated account",
    "user approval gate before the agent takes over the page",
    "long task runs orchestrated from the manus workspace",
    "page reading tuned for model context windows",
    "multi tab supervision by one agent session",
  ],
  fldmhceldgbpfpkbgopacenieobmligc: [
    "bridges the current page to the kimi assistant by moonshot ai",
    "sends readable page content as chat context",
    "question and answer flows about the open page",
    "executes suggested page actions on request",
    "side panel chat with the assistant",
    "selection aware questions on highlighted text",
    "screenshot sharing for visual questions",
  ],
  jphkkablogbfneefecondchaafbdaomc: [
    "runs ai agents directly inside the browser",
    "delegates browsing tasks to autonomous agents",
    "agent activity tracking per task",
    "page reading for agent context",
    "multi step task execution by agents",
  ],
  celalggclffbgnloepbfadhjhmchikoh: [
    "ai browser agent driven from a task prompt",
    "decomposes goals into page actions",
    "observes pages through dom extraction",
    "action execution with feedback loops",
  ],
  hdcehjaodheipickeopncehaikamghjk: [
    "ai copilot for browsing with a command surface",
    "natural language commands mapped to page actions",
    "page summarization on demand",
    "element picking with generated selectors",
    "guided automation for repetitive steps",
  ],
  ffijkpjpoehejdlbfoefcpgbimdgocmf: [
    "ai agent that plans multi step browsing tasks",
    "observes pages via dom extraction",
    "executes click and type steps under a plan",
    "reports progress after each step",
  ],
  hkcbjmdeheceggmlbhbiljejkkpjljjp: [
    "open source agent runner in a side panel",
    "configurable llm backend including local models",
    "dom snapshotting to feed the model",
    "action loop with stop and resume control",
    "transparent prompt and action log",
  ],
  okngcalljddikhljpfhgmikklmmmdkkd: [
    "agentic browser automation platform client",
    "tool use driven task execution",
    "multi step plans with checkpoints",
    "browser tool exposure to the driving model",
  ],
  ajdlmleaplmphpokbjmnhgkgaaemclil: [
    "instant link previews over search results",
    "prefetches target pages before the click",
    "ai answers composed from result pages",
    "overlay cards that avoid leaving the search page",
    "memory savings by previewing instead of opening",
  ],
  ddjnfplagacilcnjpindbdcopccndihj: [
    "preloads the chromium browser on system startup as advertised",
    "keeps a lightweight service worker alive on a timed loop",
    "targets faster browser cold starts",
    "zero page and host permissions by design",
    "minimal ten file package footprint",
    "console logging for keepalive diagnostics",
    "works fully offline",
    "ships no popup options or content surfaces",
  ],
  mahgcggahcbplkpmpmhdnbdjbcnoafcg: [
    "suspends inactive tabs to free memory",
    "tab discard and reload control",
    "memory usage reporting per tab",
    "keep awake list for chosen sites",
    "automatic suspension after an idle window",
  ],
  dnfmklmdbipiahdjiogaoemjaiodomdf: [
    "open source ai assistant in a sidebar",
    "multi provider model configuration",
    "chat grounded in the current page",
    "selection actions from the context menu",
    "conversation history kept locally",
  ],
  gpccjhdgjkmalnepmeclooflliiocfed: [
    "open source ai agent with a side panel",
    "task execution against the current page",
    "configurable model endpoints",
    "step preview before execution",
  ],
  kdmpkkahkhdmdhfkdihkopikgcocbpbf: [
    "enhanced chat surface for deepseek models",
    "prompt helpers and presets",
    "page context injection into prompts",
    "conversation management",
  ],
  jambeljnbnfbkcpnoiaedcabbgmnnlcd: [
    "official companion extension for playwright",
    "relays cdp sessions to playwright runners",
    "records traces of browser activity",
    "supports extension api access from playwright tests",
    "captures screenshots and snapshots on demand",
    "network recording for later replay",
  ],
  ilehdekjacappgghkgmmlbhgbnlkgoid: [
    "author and run puppeteer scripts inside the browser",
    "script editor with run and stop controls",
    "live page control from the editor",
    "example script library",
    "result console for script output",
  ],
  infppggnoaenmfagbfknfkancpbljcca: [
    "block based workflow builder with a drag and drop canvas",
    "workflow triggers from the page context menu",
    "scheduled workflows with cron expressions",
    "keyboard shortcut triggers for workflows",
    "visit based triggers on matching urls",
    "webhook triggers from external services",
    "loop and repeat blocks for iteration",
    "condition blocks for branching control flow",
    "variables and tables scoped to a workflow",
    "element interaction blocks for click type and hover",
    "form filling from a data table",
    "scraper blocks that extract by css selector",
    "data export to csv and json",
    "google sheets read and write integration",
    "clipboard blocks for copy and paste steps",
    "screenshot blocks for page capture",
    "tab management blocks for switching and closing",
    "delay and wait for element blocks",
    "regex extraction into variables",
    "nested workflows via execute workflow blocks",
    "workflow import and export as files",
    "workflow sharing through a public library",
    "per run log panel with block results",
    "dark themed editor with a block palette",
    "reusable blocks grouped by category",
  ],
  iebfoaldapgggcpjialmbnhcendcnkpi: [
    "records browser sessions as reusable flows",
    "replay of recorded flows for testing",
    "scraping of repeated page structures",
    "export of captured data",
    "flow editing after recording",
  ],
  geggbdbnidkhbnbjoganapfhkpgkndfo: [
    "records end to end tests from real user actions",
    "generates playwright cypress and puppeteer code",
    "captures network traffic during recording",
    "screenshots captured alongside steps",
    "step editing and annotations after recording",
    "test replay for regression checks",
  ],
  bapaclfmcgookbglclacfgeemaehkkme: [
    "records interactions into playwright scripts",
    "selector strategy choice during recording",
    "copy generated code to the clipboard",
    "pause and resume of recording",
  ],
  ljdobmomdgdljniojadhoplhkpialdid: [
    "record and playback of selenium style tests",
    "selenese command editing with autocomplete",
    "locator strategies including id css and xpath",
    "control flow commands like if else and while",
    "variables and stored values in tests",
    "assertions and wait commands",
    "test suite organization of cases",
    "export of tests to many programming languages",
    "playback inside the recorder panel",
    "screenshots on command failure",
    "playback speed control",
    "command level breakpoints for debugging",
    "dual panel view of commands and target page",
  ],
  bhfbkacflpnpfgfjghhajikhfghcknip: [
    "record end to end tests without writing code",
    "replay tests on demand",
    "shareable test artifacts",
    "step assertions on page state",
  ],
  adbonjafebjadholmnabocnddmhpennj: [
    "web automation workflow runner",
    "click fill and extract steps",
    "scheduled automation runs",
    "data capture from pages",
  ],
  gpnieenphjbjcpcdnjhnipckcldebjdf: [
    "ai driven browser agent",
    "natural language task execution",
    "page understanding through snapshots",
    "step by step action feedback",
  ],
  kkepankimcahnjamnimeijpplgjpmdpp: [
    "runs rpa bot tasks inside the browser",
    "selector driven automation steps",
    "integration with the openbots automation platform",
    "task logs and results",
  ],
  gpcpndfhbmichbgffhlaedjlnomnfgla: [
    "ai powered form autofill",
    "semantic detection of form fields",
    "one click fill of whole forms",
    "saved profiles for reuse",
    "checkout and signup automation",
  ],
  khaocdcbgnfgfoiplkbdaappfcdldgeb: [
    "record and replay browser macros",
    "scheduled macro execution",
    "data extraction steps",
    "form filling steps",
  ],
  ghlmiigebgipgagnhlanjmmniefbfihl: [
    "no code workflow automation builder",
    "scraping recipes for repeated structures",
    "form filling workflows",
    "scheduled workflow runs",
    "workflow template library",
    "cloud sync of workflows",
  ],
  kbacobbmnajbihpidjilndoielmaojbj: [
    "page automation recipes",
    "click and fill steps against selectors",
    "data capture into tables",
    "replay of saved recipes",
  ],
  heolgaalbnnelipfhbccbkdohecmaimo: [
    "automa derived workflow automation",
    "block based workflow canvas",
    "scraping and form blocks",
    "trigger options for workflows",
    "local first workflow storage",
  ],
  cpgamigjcbffkaiciiepndmonbfdimbb: [
    "no code website automation and scraping",
    "record interactions into reusable recipes",
    "schedule recipes to run unattended",
    "run a recipe across a list of urls",
    "scrape tables into google sheets",
    "form filling at scale",
    "background robot workers that run recipes",
    "template marketplace of recipes",
    "two factor authentication aware workflows",
    "run history with replays",
    "notifications when runs finish",
  ],
  ebofbaomnlpjgnponhalmmihcgakodpj: [
    "automation driven from command style input",
    "scriptable task execution against pages",
    "command history for reuse",
  ],
  idahijhccencfhigphpmlnjbppldolgk: [
    "ai assistant docked in a side panel",
    "page summarization and chat",
    "quick actions on selected text",
    "prompt library",
  ],
  ioohfnlbpolaalcbppaggpgcgpldohfg: [
    "ai assistant with page reading",
    "task suggestions from page context",
    "chat with follow up questions",
  ],
  cbibgdcbkoikdkeahemkjkpacmgicaco: [
    "everyday ai assistant in the browser",
    "chat grounded in the open page",
    "summaries and quick prompts",
    "selection based actions",
  ],
  hfjnppljknigdnnpocjjgdcfmnodoafe: [
    "record workflows by performing them once",
    "scraping of tables and lists",
    "scheduled workflow runs",
    "cloud sync and sharing of workflows",
    "conditional steps inside workflows",
    "loops over collected data",
    "form filling workflows",
    "workflow marketplace of templates",
    "run workflows on demand or on a schedule",
  ],
  ildkmabpimmkaediidaifkhjpohdnifk: [
    "command line style control of the browser",
    "natural language command execution",
    "scriptable sequences of commands",
    "command history and reuse",
  ],
  bjfgambnhccakkhmkepdoekmckoijdlc: [
    "exposes browser control tools over the model context protocol",
    "lets external ai clients drive the browser",
    "tab listing and navigation tools",
    "click type and screenshot tools",
    "local bridge between the browser and mcp clients",
    "tool schema descriptions for the client",
    "consent gating before sensitive actions",
    "session management for paired clients",
  ],
  gbldofcpkknbggpkmbdaefngejllnief: [
    "ai powered ui automation from natural language",
    "visual grounding of elements on screenshots",
    "natural language assertions on page state",
    "yaml scripting of action chains",
    "integration with playwright and puppeteer",
    "model powered planning of ui steps",
    "report generation for runs",
    "caching of visual grounding results",
  ],
  akldabonmimlicnjlflnapfeklbfemhj: [
    "agent that reads and acts on the open page",
    "element targeting from descriptions",
    "action feedback loop with the model",
  ],
  gblapfbnbicdckfhkllcnfleiemhmgeb: [
    "connects the qoder ide assistant to the browser",
    "relays page state for coding tasks",
    "pairing between editor and browser session",
  ],
  kjgebebilcoaamgfpogkoehcnjbnncic: [
    "rotates user agent strings per request",
    "per site agent overrides",
    "custom agent lists and whitelists",
    "spoofing of related client hints",
  ],
  idkjhjggpffolpidfkikidcokdkdaogg: [
    "proxy profile switching per site",
    "rule based proxy routing",
    "profile management ui",
  ],
  bkhaagjahfmjljalopjnoealnfndnagc: [
    "file tree sidebar for github repositories",
    "fast folder navigation without cloning",
    "pull request file tree view",
    "repository file previews",
    "plugin themes for the tree",
  ],
  giljefjcheohhamkjphiebfjnlphnokk: [
    "github file tree sidebar",
    "file preview on hover",
    "keyboard shortcuts for repository navigation",
    "lazy loading of large repositories",
  ],
  joggkdfebigddmaagckekihhfncdobff: [
    "commit graph visualization on github",
    "branch and merge structure rendering",
    "quick navigation between commits",
  ],
  dgjhfomjieaadpoljlnidmbgkdffpack: [
    "code search across repositories from the browser",
    "jump to definition inside github views",
    "inline blame and reference annotations",
    "search suggestions and saved queries",
    "file navigation enhancements",
    "search across many hosts",
    "code intel tooltips on symbols",
    "repository wide symbol search",
  ],
  anlikcnbgdeidpacdbdljnabclhahhmd: [
    "repository size display on github",
    "download repository as a zip archive",
    "copy raw file and repository paths",
    "file size display per file",
    "quick download of individual files",
  ],
  pncmdlebcopjodenlllcomedphdmeogm: [
    "sends the current page to an anythingllm workspace",
    "chat with previously saved pages",
    "workspace selection from the extension",
    "local first llm integration",
  ],
  jfgfiigpkhlkbnfnbobbkinehhfdhndo: [
    "web ui companion for local ollama models",
    "chat with openai compatible endpoints",
    "page context injected into chats",
    "model and parameter management",
    "knowledge collection from visited pages",
  ],
  jfeammnjpkecdekppnclgkkffahnhfhe: [
    "records browser actions into automation scripts",
    "generates replayable scripts",
    "script editing and rerun",
  ],
  obpjaonipoaomjnokbimppohbpjibflm: [
    "ai design agent running in the browser",
    "generates ui designs from prompts",
    "iterative design refinement",
    "design canvas with export",
  ],
  mmlmfjhmonkocbjadbfplnigmagldckm: [
    "helpers for playwright driven browser sessions",
    "cdp relay to external test runners",
    "capture of page state for tests",
  ],
  bjcngahpcjeililljmfegmlanlpgibdi: [
    "ai agent for chrome with a side panel",
    "page aware task execution",
    "natural language commands",
  ],
  mlcokfhobljidglkgileejcelojhhmdm: [
    "agentic browsing with a custom interface",
    "agent orchestrated navigation and reading",
    "task oriented browsing sessions",
  ],
  cclndjheoijilbieeofdjiledodbdakb: [
    "browser automation task runner",
    "scheduled automation runs",
    "form and scraping task templates",
    "run logs and history",
  ],
  akadnehffdhihfhpmcbokdlfjpgooffe: [
    "reads selected text aloud",
    "full page text to speech",
    "voice and speed configuration",
    "playback controls in the popup",
  ],
  bgjdnapfffligabpfbkbapibaifgmjie: [
    "control the browser with natural language",
    "accessibility first command surface",
    "voice friendly interaction model",
    "hands free navigation",
  ],
  mooikfkahbdckldjjndioackbalphokd: [
    "record and playback of browser tests",
    "selenese command language with editing",
    "locator strategies including id name css and xpath",
    "control flow with if else while and times commands",
    "variables with store and evaluate commands",
    "assertions and verify commands",
    "wait commands for element states",
    "test suites that group test cases",
    "export of tests to many languages and frameworks",
    "playback inside the ide side panel",
    "breakpoint debugging of single commands",
    "autocomplete of command names",
    "rolling log of execution results",
    "execution against the current tab",
    "pause and resume of playback",
    "suite level batch runs",
  ],
  ofaokhiedipichpaobibbnahnkdoiiah: [
    "automatic detection of tables and lists on any page",
    "scrape detected data to csv",
    "scrape to excel xml and json formats",
    "crawl across pagination with next page detection",
    "selector wizard for manual column picking",
    "inline table editor before export",
    "delay and retry controls for polite crawling",
    "wildcard url patterns for crawl scopes",
    "location scraping with geo coordinates",
    "drip feed extraction over time",
  ],
  iebpjdmgckacbodjpijphcplhebcmeop: [
    "copy html tables to the clipboard",
    "export tables to excel csv json and markdown",
    "send tables straight to google sheets",
    "recursively find all tables on a page",
    "local html file table extraction",
    "spreadsheet like table editor",
    "copy tables as html",
    "per table preview before export",
    "automatic header detection",
    "merged cell handling",
  ],
  eenjdnjldapjajjofmldgmkjaienebbj: [
    "ocr of any screen region on demand",
    "ocr of images embedded in pages",
    "ocr of video frames",
    "ocr of pdf documents",
    "text to speech of recognized text",
    "translation of recognized text",
    "configurable ocr engines",
    "screenshot capture with the recognized text",
  ],
  edacconmaakjimmfgnblocblbcdcpbko: [
    "save all open tabs as a named session",
    "restore saved sessions on demand",
    "automatic session snapshots",
    "bulk tab management from a grid",
    "search across saved sessions",
    "import and export of session files",
    "recovery of sessions after a crash",
    "rename and edit saved sessions",
    "stale tab detection and cleanup",
    "duplicate tab detection",
  ],
};

/**
 * Consolidated candidate feature pool for devthink, grouped by context. Each
 * item is one concrete implementable line. This is the key inference
 * deliverable derived from the corpus evidence.
 */
const featurepool = [
  {
    group: "interaction",
    items: [
      "click an element by css selector",
      "click an element resolved from its accessible name",
      "click an element matched by visible text",
      "click an element by aria role and name pair",
      "click at coordinates relative to the viewport",
      "double click an element",
      "right click an element to open its context menu",
      "shift click for range or multi selection",
      "hover over an element with a dwell duration",
      "move the pointer along a path between two points",
      "simulate realistic pointer movement speeds",
      "focus an element before interacting with it",
      "type text into an input by selector",
      "type text into content editable regions",
      "clear a field before typing",
      "append text to an existing field value",
      "set a value through the dom property instead of key events",
      "press a single key",
      "press a key combination with modifiers",
      "hold a key down across several steps",
      "release a held key",
      "type with per keystroke delay for slow controls",
      "press enter to submit a search box",
      "scroll the page down by a pixel offset",
      "scroll the page up by a pixel offset",
      "scroll smoothly with easing",
      "scroll an element into view",
      "scroll to the top or bottom of the page",
      "scroll inside a scrollable sub container",
      "scroll iframe content from the parent page",
      "drag an element onto a target element",
      "drag and drop at coordinates",
      "drag a file from disk onto a drop zone",
      "select an option from a dropdown",
      "select multiple options in a multi select",
      "toggle a checkbox",
      "choose an option in a radio group",
      "set a range slider to a value",
      "set a date input to a value",
      "set a color input to a value",
      "upload a file into a file input",
      "expand a collapsed details or accordion section",
      "dismiss an unexpected dialog before continuing",
      "interact with elements inside shadow dom trees",
      "interact with elements inside same origin iframes",
      "retry an interaction when the element moves",
    ],
  },
  {
    group: "observation",
    items: [
      "capture a full dom snapshot of the page",
      "capture the accessibility tree for semantic grounding",
      "extract visible text content per element",
      "extract an article or reader view of the page",
      "extract metadata such as title description and canonical url",
      "detect data tables and list their headers",
      "detect repeated item lists such as products or comments",
      "detect interactive elements and their kinds",
      "build a numbered map of clickable elements for the agent",
      "resolve an element from a natural language description",
      "resolve elements by css selector",
      "resolve elements by xpath",
      "verify an element is visible before acting",
      "verify an element is enabled and not readonly",
      "read form field labels and current values",
      "read aria labels and roles for controls",
      "read data attributes as structured hints",
      "observe dom mutations as the page changes",
      "wait for an element to appear",
      "wait for text to appear or disappear",
      "wait for a network quiet period",
      "watch for cookie and consent banners",
      "detect infinite scroll containers",
      "detect virtualized lists that render on demand",
      "detect lazy loaded images and placeholders",
      "read the current scroll position",
      "read the page language for localization",
      "read the page title and headings outline",
      "count pagination results and total pages",
      "extract links with anchor text and href",
      "extract image sources and alt text",
      "extract inline script data such as embedded json state",
      "detect shadow dom roots and pierce them",
      "detect iframes and enumerate their origins",
      "classify a page by its detected template",
      "fingerprint a page section for later relocation",
      "diff snapshots between two points in time",
      "extract selected text from the user selection",
      "read clipboard content on explicit consent",
      "observe focus changes across the page",
      "detect sticky headers and overlays that hide content",
      "detect scroll locks and modal states",
      "extract open graph and structured data",
      "read rendered values of computed styles",
      "derive a stable selector for an element",
      "detect the language of extracted text for routing",
    ],
  },
  {
    group: "navigation",
    items: [
      "navigate to a url in the current tab",
      "open a url in a new tab",
      "open a url in a new window",
      "open a private window for sensitive steps",
      "go back in history",
      "go forward in history",
      "reload the page",
      "reload bypassing the cache",
      "stop a pending navigation",
      "wait for the page load event",
      "wait for a specific url pattern",
      "follow a link by its text",
      "follow a link by href fragment",
      "navigate within a single page app by clicking",
      "detect url changes in single page apps",
      "read and rewrite query parameters",
      "set a url fragment for scroll anchoring",
      "block navigation away mid task with consent",
      "navigate a list of urls sequentially",
      "navigate with per site wait profiles",
      "detect http errors and offline states",
      "detect redirect chains",
      "capture the final url after redirects",
      "manage basic auth prompts via stored credentials",
      "dismiss certificate interstitials by policy",
      "open a download link without leaving the page",
      "print the page to pdf during a flow",
      "prefetch predicted next pages",
      "preconnect to expected origins",
      "deep link into common web apps by pattern",
      "reopen a recently closed tab",
      "restore a navigation trail for audit",
      "pause navigation while a consent prompt is open",
      "detect navigation intent from the agent plan",
      "rate limit navigations per domain",
      "open a url from the clipboard",
      "verify a url is safe before opening",
      "batch open a curated link list",
    ],
  },
  {
    group: "tabs and windows",
    items: [
      "list all open tabs with url and title",
      "query tabs by url title or id",
      "activate a tab by id",
      "activate the tab matching a url pattern",
      "create a new tab with a target url",
      "create a tab in a specific window",
      "create a tab in the background",
      "duplicate an existing tab",
      "close a tab by id",
      "close all tabs matching a pattern",
      "pin and unpin tabs",
      "mute and unmute tabs",
      "move tabs within a window",
      "move tabs across windows",
      "group related tabs into a named group",
      "color code tab groups by task",
      "collapse and expand tab groups",
      "discard inactive tabs to save memory",
      "reload a set of tabs",
      "zoom a tab in and out",
      "capture the visible area of a tab",
      "observe tab updates such as title changes",
      "observe tab activation changes",
      "observe tab closure mid task",
      "switch to the next or previous tab",
      "list all open windows",
      "create a window with size and position",
      "resize and reposition windows",
      "maximize minimize and restore windows",
      "focus a specific window",
      "close a window with consent",
      "split work across a scratch window",
      "use an incognito window on explicit request",
      "reopen a closed tab from history",
      "name and save a tab layout",
      "restore a saved tab layout",
      "detect duplicate tabs",
      "search across open tabs",
      "surface per tab task status in a badge",
      "limit concurrent task tabs",
      "keep a pinned control tab for the agent",
      "present tabs in a quick switcher ui",
      "snapshot the full session for later restore",
      "attach metadata to tabs for routing",
      "detect tabs playing audio",
      "reopen tabs from a previous run",
    ],
  },
  {
    group: "forms and data",
    items: [
      "fill a form from a structured record",
      "fill fields matched by label text",
      "fill fields matched by placeholder or aria label",
      "detect field kinds such as email phone and date",
      "generate realistic values per field kind",
      "reuse saved profiles for autofill",
      "store form profiles locally",
      "ask before submitting a form",
      "submit a form via its button",
      "submit a form programmatically",
      "detect validation errors after submit",
      "read inline error messages for correction loops",
      "retry failed submissions with backoff",
      "handle multi step wizards page by page",
      "handle dependent dropdowns that load options",
      "handle typeahead fields with suggestion picking",
      "pick a date from a calendar widget",
      "upload files as part of form submission",
      "attach generated documents to a form",
      "read captcha presence and hand back to the user",
      "fill credit card style multi field inputs",
      "fill one time code fields from a notification",
      "fill password fields only after explicit consent",
      "detect and skip honeypot fields",
      "detect login forms specifically",
      "detect signup and checkout templates",
      "scrape a table into columns and rows",
      "detect table headers and normalize them",
      "handle rowspan and colspan cells",
      "extract nested tables",
      "export scraped data to csv",
      "export scraped data to json",
      "export scraped data to excel",
      "copy a table to the clipboard",
      "push a table to a google sheet",
      "import data from a csv for fill loops",
      "iterate a dataset row by row as variables",
      "transform values between extraction and export",
      "deduplicate scraped rows",
      "paginate extraction across pages",
      "merge extracts from multiple pages",
      "timestamp and source every extracted row",
      "preview extracted data in a grid before export",
      "stream large extracts to disk",
      "resume an interrupted extraction",
      "log extraction provenance for audit",
    ],
  },
  {
    group: "media capture",
    items: [
      "capture a screenshot of the visible viewport",
      "capture a full page screenshot by stitching",
      "capture a screenshot of a single element",
      "capture a screenshot with device pixel ratio scaling",
      "capture a screenshot of a scrollable region",
      "annotate screenshots with step markers",
      "capture element screenshots into a contact sheet",
      "capture the page as a pdf",
      "capture a pdf with a custom page size",
      "capture a pdf of a paginated report",
      "record a screencast of the tab",
      "record a video of a task run",
      "capture audio from the tab",
      "capture a still frame from a video element",
      "detect and download images from the page",
      "download all images matching a filter",
      "read text from an image with ocr",
      "read text from a screen region with ocr",
      "read text from a scanned pdf page",
      "read text from a paused video frame",
      "use a vision model to describe a screenshot",
      "crop a screenshot to element bounds",
      "redact sensitive regions before sharing",
      "copy a screenshot to the clipboard",
      "send a screenshot to the agent for grounding",
      "capture a dom snapshot alongside each screenshot",
      "record console output with the timeline",
      "record network traces with the timeline",
      "screenshot diffing against a baseline",
      "thumbnail generation for logs",
      "image format conversion between png and jpeg",
      "capture canvas element contents",
      "capture webgl canvas state",
      "capture a media stream for webrtc checks",
      "extract embedded video sources and formats",
      "capture metadata of media assets",
      "capture favicon and logo assets",
      "time lapse capture of a changing page",
      "capture before and after states of each action",
      "export captures with consistent file naming",
    ],
  },
  {
    group: "network and transport",
    items: [
      "fetch a url from the extension context",
      "fetch with custom headers on consent",
      "fetch with timeout and retry policy",
      "stream large responses",
      "parse json responses into variables",
      "parse html responses with dom parsing",
      "call rest endpoints with typed payloads",
      "call graphql endpoints",
      "open a websocket channel",
      "reconnect websockets with backoff",
      "multiplex messages over one socket",
      "observe requests the page makes",
      "observe responses the page receives",
      "inspect request and response headers",
      "capture response bodies for analysis",
      "block chosen requests during a task",
      "mock a response for testing",
      "modify request headers with rules",
      "set and read cookies per domain",
      "clear cookies for a domain on demand",
      "handle oauth flows for external apis",
      "store api keys locally with consent",
      "proxy requests through a configured proxy",
      "route only task traffic through a proxy",
      "respect rate limits from responses",
      "post form data uploads",
      "upload multipart files",
      "download a file to disk",
      "download many files as a batch",
      "pause and resume downloads",
      "verify downloads completed",
      "intercept downloads by mime type",
      "export captured network logs",
      "detect api endpoints used by the page",
      "reverse engineer page api calls for extraction",
      "subscribe to server sent events",
      "long polling helper with cancellation",
      "attach request correlation ids across a run",
    ],
  },
  {
    group: "debugging",
    items: [
      "attach the chrome devtools protocol to a tab",
      "detach cleanly after the run",
      "issue raw cdp commands from a plan step",
      "subscribe to cdp domain events",
      "capture console messages of all levels",
      "capture javascript errors with stack traces",
      "capture unhandled promise rejections",
      "capture failed network requests",
      "capture long task timings",
      "measure performance metrics for a flow",
      "take a heap snapshot on demand",
      "track memory growth during a run",
      "profile cpu during a heavy step",
      "set breakpoints in page scripts",
      "step through page code",
      "evaluate javascript in page context",
      "evaluate in an isolated world",
      "inspect the dom at a breakpoint",
      "watch expressions during a run",
      "override page scripts for testing",
      "emulate device metrics",
      "emulate network conditions",
      "emulate geographic location",
      "emulate a user agent per task",
      "override permissions such as camera per task",
      "blackbox third party scripts in traces",
      "export a devtools trace file",
      "annotate traces with step markers",
      "detect layout shifts during a flow",
      "detect console spam patterns",
      "rotate logs for long sessions",
      "structured log levels per step",
      "replay a captured trace offline",
      "diff console output between runs",
      "attach to iframes and workers",
      "debug service workers of the page",
      "capture source maps for better stacks",
      "safe teardown on debugger detach",
    ],
  },
  {
    group: "memory and sessions",
    items: [
      "persist task state across service worker restarts",
      "persist session history with timestamps",
      "snapshot the full browsing session",
      "restore a session after a crash",
      "restore a session on demand",
      "auto snapshot on an interval",
      "name and organize saved sessions",
      "diff two sessions",
      "search across saved sessions",
      "import and export session files",
      "keep per site memory notes",
      "keep agent scratchpad memory per task",
      "summarize past runs into reusable notes",
      "semantic recall of past extractions",
      "remember user corrections for future steps",
      "remember consent decisions per origin",
      "expire stale memory by policy",
      "encrypt sensitive memory at rest",
      "scope memory per profile or workspace",
      "sync memory across devices on consent",
      "track the state machine of a workflow run",
      "checkpoint long workflows",
      "resume from the last checkpoint",
      "rollback side effects on failure",
      "idempotent step identifiers",
      "queue tasks while offline",
      "replay queued tasks on reconnect",
      "storage quota awareness and cleanup",
      "export memory for audit",
      "attach provenance to each memory item",
      "isolate state per tab",
      "lock sessions against concurrent runs",
      "detect zombie runs and reap them",
      "heartbeat for long running tasks",
      "pause and resume a running session",
      "cancel a run with rollback options",
      "keep a url history per run",
      "timeline view of a past run",
    ],
  },
  {
    group: "workflow and automation",
    items: [
      "build workflows by composing steps",
      "drag and drop step editor",
      "step library grouped by category",
      "nest steps into reusable blocks",
      "conditionals on extracted values",
      "branch on page state",
      "loops over a data list",
      "repeat until a condition holds",
      "while loops with safety bounds",
      "loops over each matched element",
      "parallel step execution",
      "join parallel branches",
      "variables with typed scopes",
      "expressions between variables",
      "regex extraction into variables",
      "delay steps with jitter",
      "wait for element steps",
      "retry policies per step",
      "error handlers per branch",
      "try catch around fragile steps",
      "timeouts per step and per run",
      "triggers on page visits",
      "triggers on url patterns",
      "triggers from the context menu",
      "triggers from keyboard shortcuts",
      "triggers from a toolbar button",
      "schedule runs with cron expressions",
      "schedule runs at intervals",
      "run on a list of urls",
      "webhook triggered runs",
      "event driven triggers from the page",
      "manual run with step preview",
      "dry run mode without side effects",
      "single step execution for debugging",
      "breakpoint debugging in the editor",
      "run logs per execution",
      "run history with outcomes",
      "export workflows as files",
      "import workflows from files",
      "share workflow templates",
      "version workflows locally",
      "diff workflow versions",
      "workflow library or marketplace",
      "cloud sync of workflows",
      "run workflows in the background",
      "watchdog for stuck workflows",
      "nested workflow parameters",
      "per site policy overrides inside workflows",
    ],
  },
  {
    group: "agent protocol",
    items: [
      "expose browser tools over mcp",
      "list tools with json schema inputs",
      "negotiate capabilities with the client",
      "json rpc message framing",
      "stdio bridge to a local client",
      "stream http transport for remote clients",
      "per tool consent requirements in metadata",
      "human approval gate per sensitive tool",
      "session tokens for client pairing",
      "tool namespacing by domain",
      "tool versioning for compatibility",
      "subscribe to server events",
      "resource subscriptions for page state",
      "sampling callbacks into the client model",
      "prompts exposed as tools",
      "stream tool results as they arrive",
      "progress notifications for long tools",
      "cancel in flight tools",
      "rate limiting per client",
      "support multiple concurrent clients",
      "client allowlist configuration",
      "localhost binding by default",
      "tls for remote transports",
      "auth handshake for remote clients",
      "audit log of every tool call",
      "structured errors with retry hints",
      "idempotency keys for tool calls",
      "batch tool calls",
      "tool dry run mode",
      "tool mocks for testing",
      "openapi style tool descriptions",
      "natural language command parsing",
      "intent classification of user requests",
      "plan generation from a goal",
      "plan review before execution",
      "step by step plan execution with checks",
      "replan on failure",
      "reflection after each step",
      "cost and token budget tracking",
      "model routing per task kind",
      "local model support",
      "provider agnostic endpoint configuration",
      "prompt template library",
      "guardrails on model output parsing",
    ],
  },
  {
    group: "multi agent coordination",
    items: [
      "run several agents in separate tabs",
      "assign different roles to agents",
      "share a task queue across agents",
      "work stealing across agents",
      "message passing between agents",
      "blackboard memory shared by agents",
      "leader worker topology",
      "critic agent reviewing outputs",
      "planner and executor separation",
      "verifier agent for results",
      "hand a tab between agents mid task",
      "lock shared resources",
      "detect conflicts on simultaneous edits",
      "merge results from parallel agents",
      "progress dashboard across agents",
      "per agent budget limits",
      "per agent permission scopes",
      "human escalation from any agent",
      "agent to agent review requests",
      "replay of an agent run for audit",
      "compare outputs from competing agents",
      "vote or consensus among agents",
      "kill switch for all agents",
      "pause one agent without stopping others",
      "agent naming and metadata",
      "spawn sub agents on demand",
      "depth limits for sub agents",
      "aggregate results into one report",
      "timeline of interleaved agent actions",
      "share lessons learned across agents",
      "resource arbitration between agents",
      "prioritized task lanes",
      "scale workers by site load",
      "shared cost accounting across agents",
    ],
  },
  {
    group: "ui surfaces",
    items: [
      "popup command surface from the toolbar",
      "side panel workspace docked in chrome",
      "full page dashboard in a new tab",
      "options page for configuration",
      "onboarding walkthrough for first run",
      "command palette with fuzzy search",
      "natural language task input box",
      "step timeline with statuses",
      "live log stream during runs",
      "plan review cards before execution",
      "approve or reject buttons per sensitive step",
      "diff preview of pending changes",
      "data grid preview of extractions",
      "export menu with format choices",
      "context menu entries for quick actions",
      "keyboard shortcuts for common commands",
      "omnibox keyword for quick tasks",
      "toolbar badge with run status",
      "notifications for task completion",
      "notifications for needed attention",
      "tray of recent runs",
      "workflow editor canvas",
      "block palette in the editor",
      "mini map for long workflows",
      "element picker overlay on the page",
      "highlight of the active target element",
      "guided selection tooltips",
      "screenshot preview panel",
      "before and after comparison viewer",
      "settings profiles per site",
      "dark and light themes",
      "localized interface languages",
      "import and export buttons for data",
      "drag and drop file import",
      "session manager grid",
      "search across history",
      "empty states with guidance",
      "error surfaces with retry actions",
      "feature tour on demand",
      "accessibility labels across the ui",
      "inline confirmation chips on the page",
      "toast notifications for step completion",
    ],
  },
  {
    group: "security and consent",
    items: [
      "consent prompt before each sensitive action",
      "per origin allowlist for automation",
      "per site permission profiles",
      "deny by default posture",
      "active tab only mode",
      "explicit grant of one specific origin",
      "time boxed consent for a session",
      "revoke consent mid run",
      "audit trail of every action",
      "immutable run logs",
      "hashing of log entries",
      "sensitive action classification",
      "input masking in logs",
      "secret storage in the browser vault",
      "never log passwords or tokens",
      "redaction of captured screenshots",
      "sandboxed rendering of untrusted content",
      "isolated world for injected logic",
      "schema validation of every command",
      "origin check on every message",
      "external connect allowlist",
      "rate limit on automation commands",
      "human confirmation for payments",
      "human confirmation for destructive deletes",
      "human confirmation for credential use",
      "detect phishing lookalikes before login",
      "safe defaults for new sites",
      "permission diff on extension update",
      "transparency page listing all grants",
      "data minimization in extracts",
      "local first processing of page data",
      "no telemetry by default",
      "explicit opt in for any sync",
      "encrypted sync when enabled",
      "purge stored data on request",
      "export of all stored data",
      "cookie jar isolation per task",
      "clear task artifacts after the run",
      "quarantine downloaded files",
      "virus scanning hook for downloads",
      "csp compliance in all injected code",
      "review mode that pauses on new domains",
      "escape hatch key to stop everything",
      "incident report export for review",
    ],
  },
  {
    group: "performance",
    items: [
      "lazy load heavy modules on demand",
      "debounce rapid dom events",
      "batch dom queries per snapshot",
      "incremental snapshots instead of full ones",
      "selector caching with invalidation",
      "virtualized rendering of long lists",
      "offload parsing tasks to workers",
      "offscreen documents for background work",
      "service worker keepalive during runs",
      "streaming parse of large pages",
      "chunked extraction for big tables",
      "backpressure on batch runs",
      "concurrency limits per domain",
      "polite delay between batch requests",
      "adaptive polling intervals",
      "request coalescing for repeated queries",
      "memory budget per run",
      "tab suspension during long waits",
      "cache of fetched resources per run",
      "prefetch of predicted next steps",
      "measure per step duration",
      "profile slow selectors",
      "trace slow steps to the timeline",
      "budget alerts during long runs",
      "cancel slow steps on timeout",
      "resume interrupted runs efficiently",
      "avoid duplicate navigation work",
      "reuse authenticated sessions",
      "compress stored artifacts",
      "prune old logs automatically",
      "measure startup cost",
      "keep cold start under a target",
      "battery aware scheduling",
      "network aware retry policies",
      "parallelize independent page reads",
      "keep selectors warm across steps",
      "memory aware snapshot cadence",
      "slow motion replay for debugging",
    ],
  },
];

const escapeliteral = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const termrules = [];
for (const kit of signalkits) {
  for (const [term, item] of Object.entries(kit.terms)) {
    const starred = term.endsWith("*");
    const stem = starred ? term.slice(0, -1) : term;
    termrules.push({
      category: kit.category,
      source: term,
      stem,
      item,
      pattern: starred ? `\\b${escapeliteral(stem)}[a-z0-9]*` : `\\b${escapeliteral(stem)}\\b`,
    });
  }
}
const plainmap = new Map(termrules.filter((rule) => !rule.source.endsWith("*")).map((rule) => [rule.stem, rule]));
const starredrules = [...termrules.filter((rule) => rule.source.endsWith("*"))].sort((left, right) => right.stem.length - left.stem.length);
const termpattern = new RegExp(
  [...termrules].sort((left, right) => right.stem.length - left.stem.length).map((rule) => rule.pattern).join("|"),
  "g",
);
const termitemmap = new Map(termrules.map((rule) => [rule.source, rule.item]));
const apipattern = /(?:chrome|browser)\.([a-zA-Z][a-zA-Z0-9]*)\.([a-zA-Z][a-zA-Z0-9]*)/g;

/** Resolves a matched keyword back to the rule that produced it. */
function termrulefor(matched) {
  const direct = plainmap.get(matched);
  if (direct) return direct;
  for (const rule of starredrules) if (matched.startsWith(rule.stem)) return rule;
  return null;
}

/** Decodes the CRX container and returns the embedded zip payload. */
function decodecrx(payload) {
  if (payload.subarray(0, 4).toString("ascii") !== "Cr24") throw new Error("response is not a CRX payload");
  const version = payload.readUInt32LE(4);
  if (version === 3) return { version, zip: payload.subarray(12 + payload.readUInt32LE(8)) };
  if (version === 2) return { version, zip: payload.subarray(16 + payload.readUInt32LE(8) + payload.readUInt32LE(12)) };
  throw new Error(`unsupported CRX version ${version}`);
}

/** Downloads one CRX payload from the Chrome update service with retries. */
async function downloadcrx(source) {
  let lasterror = new Error("download failed");
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(source, { redirect: "follow", signal: AbortSignal.timeout(90000) });
      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}`);
        error.httpstatus = response.status;
        throw error;
      }
      const payload = Buffer.from(await response.arrayBuffer());
      if (payload.byteLength < 100) throw new Error("empty payload from the update service");
      return payload;
    } catch (error) {
      lasterror = error;
      if (error.httpstatus === 404 || error.httpstatus === 410) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }
  throw lasterror;
}

/** Walks the extracted package and returns every file with size in bytes. */
async function walkfiles(directory) {
  const dirents = await readdir(directory, { recursive: true, withFileTypes: true });
  const files = [];
  for (const dirent of dirents) {
    if (!dirent.isFile()) continue;
    const full = join(dirent.parentPath, dirent.name);
    const info = await stat(full);
    files.push({ path: full.slice(directory.length + 1).split("\\").join("/"), size: info.size, full });
  }
  return files;
}

/** Reads and parses a json file, throwing a readable error when invalid. */
async function readjson(path) {
  const raw = await readFile(path, "utf8");
  return JSON.parse(raw);
}

/** Resolves manifest message placeholders using a locale messages map. */
function resolvelocalized(value, messages) {
  if (typeof value !== "string" || !value.startsWith("__MSG_")) return value;
  const key = value.slice(6, value.lastIndexOf("__"));
  const entry = messages[key] ?? messages[key.toLowerCase()];
  return entry?.message ?? value;
}

/** Derives the background execution type from the manifest. */
function backgroundtype(manifest) {
  const background = manifest.background ?? null;
  if (!background) return "none declared";
  if (background.service_worker) return "service worker";
  if (Array.isArray(background.scripts) && background.scripts.length) return "background scripts (legacy mv2)";
  if (background.page) return "background page (legacy mv2)";
  return "declared without a recognized shape";
}

/** Summarizes the declared host scope of a manifest. */
function hostscope(manifest) {
  const declared = [...(manifest.host_permissions ?? []), ...(manifest.optional_host_permissions ?? [])];
  const legacy = (manifest.permissions ?? []).filter((permission) => {
    const value = String(permission);
    return value.includes("://") || value.startsWith("*.") || value.startsWith("*/") || value === "<all_urls>";
  });
  const all = [...declared, ...legacy];
  if (!all.length) return "none declared";
  if (all.includes("<all_urls>")) return "all urls";
  const unique = [...new Set(all)];
  return `${unique.length} pattern(s): ${unique.slice(0, 6).join(", ")}${unique.length > 6 ? ", and more" : ""}`;
}

/** Classifies UI surfaces from manifest declarations and html file paths. */
function classifysurfaces(manifest, htmlfiles) {
  const surfaces = new Set();
  const popup = manifest.action?.default_popup ?? manifest.browser_action?.default_popup ?? manifest.page_action?.default_popup;
  if (popup) surfaces.add("popup");
  if (manifest.options_ui || manifest.options_page) surfaces.add("options");
  if (manifest.side_panel?.default_path) surfaces.add("side panel");
  if (manifest.devtools_page) surfaces.add("devtools");
  if (manifest.chrome_url_overrides?.newtab) surfaces.add("new tab");
  for (const file of htmlfiles) {
    const name = file.toLowerCase();
    if (name.includes("background")) continue;
    if (name.includes("popup")) surfaces.add("popup");
    else if (name.includes("options") || name.includes("settings")) surfaces.add("options");
    else if (name.includes("sidepanel") || name.includes("side panel") || name.includes("side_panel")) surfaces.add("side panel");
    else if (name.includes("devtools")) surfaces.add("devtools");
    else if (name.includes("dashboard")) surfaces.add("dashboard");
    else if (name.includes("newtab") || name.includes("new tab")) surfaces.add("new tab");
    else if (name.includes("editor") || name.includes("canvas") || name.includes("builder")) surfaces.add("editor page");
    else if (name.includes("record")) surfaces.add("recorder page");
    else if (name.includes("window")) surfaces.add("standalone window");
    else surfaces.add("additional page");
  }
  return [...surfaces];
}

/**
 * Downloads, decodes, extracts and statically analyzes one package. The raw
 * artifact directory is always removed before returning.
 */
async function analyzepackage(id, label) {
  const source = `${updatebase}${id}%26uc`;
  const payload = await downloadcrx(source);
  const { version, zip } = decodecrx(payload);
  const workdir = join(harvestdir, id);
  const zippath = join(workdir, "package.zip");
  const extractdir = join(workdir, "package");
  await mkdir(extractdir, { recursive: true });
  await writeFile(zippath, zip);
  try {
    const listing = (await execute("unzip", ["-Z1", zippath], { maxBuffer: 16 * 1024 * 1024 }))
      .stdout.split("\n").map((line) => line.trim()).filter(Boolean);
    for (const entry of listing) {
      if (entry.startsWith("/") || entry.split("/").includes("..")) throw new Error("unsafe zip entry inside package");
    }
    try {
      await execute("unzip", ["-qq", "-o", zippath, "-d", extractdir], { maxBuffer: 16 * 1024 * 1024 });
    } catch {
      // Partial extraction is tolerated as long as the manifest is present.
    }
    const manifest = await readjson(join(extractdir, "manifest.json")).catch(() => {
      throw new Error("manifest.json missing or invalid inside the package");
    });
    const files = await walkfiles(extractdir);

    const apis = new Set();
    const ruleshit = new Set();
    const transports = new Set();
    const filetypes = {};
    const htmlfiles = [];
    const locales = new Set();
    let totalsize = 0;
    let filecount = 0;
    let scriptcount = 0;
    let packageinfo = null;

    for (const file of files) {
      const type = (extname(file.path).slice(1) || "noext").toLowerCase();
      filetypes[type] = (filetypes[type] ?? 0) + 1;
      filecount += 1;
      totalsize += file.size;
      if (/^_locales\/[^/]+\/messages\.json$/i.test(file.path)) locales.add(file.path.split("/")[1]);
      if (file.path === "package.json") {
        try {
          const parsed = await readjson(file.full);
          packageinfo = {
            name: parsed.name ?? null,
            version: parsed.version ?? null,
            dependencycount: Object.keys(parsed.dependencies ?? {}).length + Object.keys(parsed.devDependencies ?? {}).length,
            dependencies: Object.keys(parsed.dependencies ?? {}).slice(0, 12),
            scripts: Object.keys(parsed.scripts ?? {}).slice(0, 12),
          };
        } catch {
          packageinfo = null;
        }
      }
      if (/\.html?$/i.test(file.path)) htmlfiles.push(file.path);
      if (/\.(?:js|mjs|cjs)$/i.test(file.path) && file.size <= 16 * 1024 * 1024) {
        scriptcount += 1;
        const content = await readFile(file.full, "utf8");
        for (const match of content.matchAll(apipattern)) apis.add(`${match[1]}.${match[2]}`);
        const lowered = content.toLowerCase();
        for (const match of lowered.matchAll(termpattern)) {
          const rule = termrulefor(match[0]);
          if (rule) ruleshit.add(rule);
        }
        if (/(?:chrome|browser)\.runtime\.(?:sendMessage|onMessage|connect|onConnect)/.test(content)) transports.add("extension runtime message");
        if (/(?:chrome|browser)\.(?:tabs|scripting)\.(?:sendMessage|executeScript)/.test(content)) transports.add("tab or content bridge");
        if (/(?:connectNative|sendNativeMessage)/.test(content)) transports.add("native host bridge");
        if (/(?:fetch\(|new\s+WebSocket|XMLHttpRequest)/.test(content)) transports.add("network transport signal");
      }
    }

    const signals = {};
    for (const kit of signalkits) {
      const matched = termrules.filter((rule) => ruleshit.has(rule) && rule.category === kit.category).map((rule) => rule.source);
      if (matched.length) signals[kit.category] = matched;
    }

    const scripts = manifest.content_scripts ?? [];
    const csmatches = new Set();
    let csjs = 0;
    let cscss = 0;
    const runats = new Set();
    let allframes = false;
    for (const script of scripts) {
      for (const match of script.matches ?? []) csmatches.add(match);
      csjs += (script.js ?? []).length;
      cscss += (script.css ?? []).length;
      if (script.run_at) runats.add(script.run_at);
      if (script.all_frames) allframes = true;
    }

    let messages = {};
    const defaultlocale = manifest.default_locale ?? "en";
    try {
      messages = await readjson(join(extractdir, "_locales", defaultlocale, "messages.json"));
    } catch {
      try {
        messages = await readjson(join(extractdir, "_locales", "en", "messages.json"));
      } catch {
        messages = {};
      }
    }

    return {
      id,
      label: label ?? "unknown listing",
      status: "verified",
      analyzedat: new Date().toISOString(),
      source,
      crxversion: version,
      bytes: payload.byteLength,
      name: resolvelocalized(manifest.name, messages),
      description: resolvelocalized(manifest.description, messages),
      manifest,
      backgroundtype: backgroundtype(manifest),
      hostscope: hostscope(manifest),
      surfaces: classifysurfaces(manifest, htmlfiles),
      contentscripts: {
        count: scripts.length,
        js: csjs,
        css: cscss,
        runat: [...runats],
        allframes,
        matches: [...csmatches].slice(0, 8),
      },
      packageinfo,
      apis: [...apis].sort(),
      signals,
      transports: [...transports].sort(),
      locales: locales.size,
      filetypes,
      filecount,
      scriptcount,
      totalsize,
      htmlfiles: htmlfiles.slice(0, 20),
    };
  } finally {
    await rm(workdir, { recursive: true, force: true });
  }
}

/** Normalizes a feature sentence for deduplication. */
function normalizedkey(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

/**
 * Derives the per extension mined feature list. Curated public knowledge is
 * tagged inferred, every other item rests on package evidence and is tagged
 * observed. The list is capped at forty distinct items.
 */
function minefeatures(record) {
  const items = [];
  const seen = new Set();
  const add = (text, tag) => {
    const key = normalizedkey(text);
    if (!key || seen.has(key)) return;
    seen.add(key);
    items.push({ text, tag });
  };

  for (const text of knowledgepool[record.id] ?? []) add(text, "inferred");

  const manifest = record.manifest ?? {};
  const permissions = (manifest.permissions ?? []).filter((permission) => {
    const value = String(permission);
    return !(value.includes("://") || value.startsWith("*.") || value.startsWith("*/") || value === "<all_urls>");
  });
  for (const permission of permissions) {
    const kit = permissionfeatures[permission];
    for (const text of kit?.primary ?? [`declare the ${permission} capability`]) add(text, "observed");
  }
  for (const pair of record.apis ?? []) {
    const text = apifeatures[pair];
    if (text) add(text, "observed");
  }
  for (const terms of Object.values(record.signals ?? {})) {
    for (const term of terms) {
      const text = termitemmap.get(term);
      if (text) add(text, "observed");
    }
  }
  const surfaceitems = {
    popup: "toolbar popup command surface",
    options: "options configuration surface",
    "side panel": "dockable side panel workspace",
    devtools: "devtools panel integration",
    "new tab": "new tab dashboard surface",
    dashboard: "dashboard page",
    "editor page": "editor page for building flows",
    "recorder page": "recorder page interface",
    "standalone window": "standalone window interface",
  };
  for (const surface of record.surfaces ?? []) {
    const text = surfaceitems[surface];
    if (text) add(text, "observed");
  }
  const transportitems = {
    "network transport signal": "direct network calls from extension code",
    "native host bridge": "native host companion messaging",
    "extension runtime message": "internal message bus between extension contexts",
    "tab or content bridge": "tab to content script messaging",
  };
  for (const transport of record.transports ?? []) {
    const text = transportitems[transport];
    if (text) add(text, "observed");
  }

  const backgrounditems = {
    "service worker": "background service worker orchestration",
    "background scripts (legacy mv2)": "persistent background page orchestration (mv2)",
    "background page (legacy mv2)": "persistent background page orchestration (mv2)",
  };
  if (backgrounditems[record.backgroundtype]) add(backgrounditems[record.backgroundtype], "observed");
  if ((record.contentscripts?.count ?? 0) > 0) add("content scripts bridging pages to the extension", "observed");
  if (record.contentscripts?.allframes) add("content scripts running in all frames", "observed");
  if (manifest.commands) add("keyboard shortcut bindings", "observed");
  if (manifest.omnibox) add("omnibox keyword entry point", "observed");
  if (manifest.web_accessible_resources) add("web accessible resources for page side loading", "observed");
  if (manifest.externally_connectable) add("external web pages can message the extension", "observed");
  if (manifest.sandbox?.pages?.length) add("sandboxed pages for isolated content", "observed");
  if (manifest.content_security_policy) add("custom content security policy", "observed");
  if (manifest.incognito) add("explicit incognito behavior declared", "observed");
  if (manifest.offline_enabled) add("offline capable packaging", "observed");
  if (manifest.update_url) {
    let standardchannel = false;
    try { standardchannel = new URL(String(manifest.update_url)).hostname === "clients2.google.com"; } catch { standardchannel = false; }
    if (!standardchannel) add("custom update channel declared", "observed");
  }
  if (manifest.minimum_chrome_version) add("minimum chrome version requirement", "observed");
  if (manifest.manifest_version === 3) add("manifest v3 packaging", "observed");
  if (record.locales > 1) add(`localized interface in ${record.locales} languages`, "observed");
  if (record.packageinfo?.dependencycount) add(`npm style package metadata with ${record.packageinfo.dependencycount} dependencies`, "observed");
  if (manifest.manifest_version === 2) add("legacy manifest v2 packaging", "observed");

  if (items.length < 15) {
    for (const permission of permissions) {
      const kit = permissionfeatures[permission];
      for (const text of kit?.secondary ?? []) add(text, "observed");
    }
  }
  if (items.length < 15) {
    const namespaces = new Set((record.apis ?? []).map((pair) => pair.split(".")[0]));
    for (const namespace of namespaces) add(`static references to the ${namespace} browser api`, "observed");
  }
  if (items.length < 15) {
    if ((record.filetypes?.png ?? 0) + (record.filetypes?.svg ?? 0) > 0) add("ships packaged icon assets for the toolbar and store", "observed");
    if (record.scriptcount === 1) add("single script background implementation", "observed");
    if (record.locales === 0) add("english only interface without locale bundles", "observed");
  }
  return items.slice(0, 40);
}

/** Derives the architecture patterns evidenced by one record. */
function patternsfor(record) {
  const patterns = [];
  const surfaces = record.surfaces ?? [];
  const manifest = record.manifest ?? {};
  if (surfaces.includes("popup")) patterns.push("popup driven control surface");
  if (record.backgroundtype === "service worker") patterns.push("background service worker orchestration");
  if (record.backgroundtype.startsWith("background")) patterns.push("legacy background page orchestration");
  if ((record.contentscripts?.count ?? 0) > 0) patterns.push("content script page bridge");
  if ((record.transports ?? []).includes("extension runtime message")) patterns.push("extension runtime message bus");
  if ((record.transports ?? []).includes("network transport signal")) patterns.push("external endpoint connectivity");
  if ((record.transports ?? []).includes("native host bridge")) patterns.push("native host companion");
  if (surfaces.includes("devtools")) patterns.push("devtools panel integration");
  if (surfaces.includes("side panel")) patterns.push("side panel workspace");
  const recordingterms = record.signals?.recording ?? [];
  if (recordingterms.some((term) => term.startsWith("record") || term.startsWith("replay") || term.startsWith("macro") || term.startsWith("trace"))) patterns.push("recorder pipeline");
  const blocks = record.signals?.["workflow blocks"] ?? [];
  if ((manifest.permissions ?? []).includes("alarms") || blocks.includes("cron") || blocks.some((term) => term.startsWith("schedul"))) {
    patterns.push("scheduler pipeline");
  }
  const protocolterms = record.signals?.["mcp and protocol"] ?? [];
  if (protocolterms.includes("mcp") || protocolterms.includes("jsonrpc") || protocolterms.includes("json-rpc")) patterns.push("mcp tool server");
  if ((manifest.permissions ?? []).includes("contextMenus")) patterns.push("context menu entry points");
  if (manifest.commands) patterns.push("keyboard shortcut commands");
  if (manifest.omnibox) patterns.push("omnibox keyword commands");
  if (surfaces.includes("new tab")) patterns.push("new tab dashboard");
  return patterns;
}

/** Renders a markdown table cell safely. */
function cell(value) {
  const text = value === null || value === undefined || value === "" ? "none" : String(value);
  return text.split("|").join("/").replace(/\s+/g, " ").trim().slice(0, 320);
}

function compactlist(values) {
  return Array.isArray(values) && values.length ? values.join(", ") : "none";
}

/** Counts values and returns entries sorted by descending count. */
function aggregatecounts(values) {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()].sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]));
}

/** Renders one per extension evidence section. */
function extensionsection(record) {
  const lines = [];
  lines.push(`### ${record.id}`);
  lines.push("");
  if (record.status !== "verified") {
    const unavailable = /HTTP 4\d\d|empty payload/.test(record.status ?? "") ? " (listing unavailable from the update service)" : "";
    lines.push("| Field | Value |");
    lines.push("| --- | --- |");
    lines.push(`| Declared name | n/a |`);
    lines.push(`| Listing label | ${cell(record.label)} |`);
    lines.push(`| Status | ${cell(record.status)}${unavailable} |`);
    lines.push(`| Reviewed | yes, no package payload was obtainable |`);
    lines.push("");
    return lines.join("\n");
  }
  const manifest = record.manifest ?? {};
  const features = minefeatures(record);
  const dominant = Object.entries(record.signals ?? {})
    .sort((left, right) => right[1].length - left[1].length)
    .slice(0, 3).map(([category]) => category).join(", ");
  const cs = record.contentscripts ?? {};
  const commands = manifest.commands ? Object.entries(manifest.commands).map(([name, command]) => `${name}${command.suggested_key ? ` (${typeof command.suggested_key === "string" ? command.suggested_key : Object.values(command.suggested_key)[0]})` : ""}`) : [];
  const war = manifest.web_accessible_resources;
  const warsummary = !war ? "none" : Array.isArray(war) && typeof war[0] === "object"
    ? `${war.length} rule group(s) covering ${(war.flatMap((group) => group.resources ?? [])).length} resources`
    : `${war.length} entrie(s)`;
  const external = manifest.externally_connectable
    ? `matches ${manifest.externally_connectable.matches?.length ?? 0}, ids ${(manifest.externally_connectable.ids?.length ?? 0)}` : "none";
  const csp = manifest.content_security_policy
    ? (typeof manifest.content_security_policy === "string" ? manifest.content_security_policy : Object.keys(manifest.content_security_policy).join(", ") + " directives")
    : "default";

  lines.push("| Field | Value |");
  lines.push("| --- | --- |");
  lines.push(`| Declared name | ${cell(record.name)} |`);
  lines.push(`| Listing label | ${cell(record.label)} |`);
  lines.push(`| Version | ${cell(manifest.version)} |`);
  lines.push(`| Manifest version | ${cell(manifest.manifest_version)} |`);
  lines.push(`| Required permissions | ${cell(compactlist(manifest.permissions))} |`);
  lines.push(`| Optional permissions | ${cell(compactlist(manifest.optional_permissions))} |`);
  lines.push(`| Host scope | ${cell(record.hostscope)} |`);
  lines.push(`| Background type | ${cell(record.backgroundtype)} |`);
  lines.push(`| Content scripts count | ${cs.count} declaration(s), ${cs.js} js, ${cs.css} css, all frames ${cs.allframes ? "yes" : "no"}${cs.runat?.length ? `, run at ${cs.runat.join(" and ")}` : ""} |`);
  lines.push(`| UI surfaces | ${cell(compactlist(record.surfaces))} |`);
  lines.push(`| Locales count | ${record.locales} |`);
  lines.push(`| File count | ${record.filecount} (${record.scriptcount} scripts scanned) |`);
  lines.push(`| CRX size | ${record.bytes} bytes |`);
  lines.push(`| Extracted size | ${record.totalsize} bytes |`);
  lines.push(`| Commands | ${cell(compactlist(commands))} |`);
  lines.push(`| Web accessible resources | ${cell(warsummary)} |`);
  lines.push(`| Externally connectable | ${cell(external)} |`);
  lines.push(`| Content security policy | ${cell(csp)} |`);
  lines.push(`| Sandbox | ${cell(manifest.sandbox?.pages ? `${manifest.sandbox.pages.length} sandboxed page(s)` : "none")} |`);
  lines.push(`| Incognito | ${cell(manifest.incognito ?? "default")} |`);
  lines.push(`| Offline enabled | ${cell(manifest.offline_enabled ? "yes" : "no")} |`);
  lines.push(`| Update url | ${cell(manifest.update_url ?? "store managed")} |`);
  lines.push(`| Minimum chrome version | ${cell(manifest.minimum_chrome_version ?? "none")} |`);
  lines.push(`| Default locale | ${cell(manifest.default_locale ?? "none")} |`);
  lines.push(`| Package metadata | ${cell(record.packageinfo ? `${record.packageinfo.name ?? "unnamed"} at ${record.packageinfo.version ?? "?"} with ${record.packageinfo.dependencycount} dependencies` : "no package json")} |`);
  lines.push(`| Mapped features | ${features.length} item(s); dominant signals: ${cell(dominant)} |`);
  lines.push("");
  lines.push("Features mined:");
  lines.push("");
  lines.push(features.map((feature, index) => `${index + 1}. ${feature.text} (${feature.tag})`).join("\n"));
  lines.push("");
  return lines.join("\n");
}

/** Builds the whole markdown report from the cache. */
function buildreport(cache, identifiers) {
  const verified = identifiers.filter((id) => cache[id]?.status === "verified");
  const failed = identifiers.filter((id) => cache[id] && cache[id].status !== "verified");
  const pending = identifiers.filter((id) => !cache[id]);

  const permissioncounts = new Map();
  const optionalcounts = new Map();
  const apicounts = new Map();
  const signalcounts = new Map();
  const patternids = new Map();
  let featuretotal = 0;
  for (const id of verified) {
    const record = cache[id];
    for (const permission of record.manifest?.permissions ?? []) permissioncounts.set(permission, (permissioncounts.get(permission) ?? 0) + 1);
    for (const permission of record.manifest?.optional_permissions ?? []) optionalcounts.set(permission, (optionalcounts.get(permission) ?? 0) + 1);
    for (const pair of record.apis ?? []) apicounts.set(pair, (apicounts.get(pair) ?? 0) + 1);
    for (const category of Object.keys(record.signals ?? {})) signalcounts.set(category, (signalcounts.get(category) ?? 0) + 1);
    for (const pattern of patternsfor(record)) {
      if (!patternids.has(pattern)) patternids.set(pattern, []);
      patternids.get(pattern).push(id);
    }
    featuretotal += minefeatures(record).length;
  }

  const sections = [];
  sections.push("# CRX Feature Mining Evidence");
  sections.push(
    `This report was generated by tests/crxharvest.mjs from CRX packages downloaded through the official Chrome update service for the ${identifiers.length} cataloged extension ids. Every package was treated as untrusted evidence: the script performed static text analysis only, never executed any downloaded code, deleted every raw artifact immediately after analysis, and persisted only derived analysis records in tests/artifacts/harvestcache.json. Tables in this report state observed evidence taken from manifests, file listings and script text. The per extension feature lists separate items tagged observed, which rest directly on that evidence, from items tagged inferred, which rest on public knowledge of the listed product. The consolidated feature pool at the end is an inference artifact: candidate features for devthink derived from the corpus, not claims about any specific product.`,
  );

  const sortedpermissions = [...new Set([...permissioncounts.keys(), ...optionalcounts.keys()])].sort((left, right) => (permissioncounts.get(right) ?? 0) - (permissioncounts.get(left) ?? 0) || left.localeCompare(right));
  const permissionrows = sortedpermissions.map((permission) => `| ${permission} | ${permissioncounts.get(permission) ?? 0} | ${optionalcounts.get(permission) ?? 0} |`).join("\n");
  const apirows = [...apicounts.entries()].sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0])).map(([pair, count]) => `| ${pair} | ${count} |`).join("\n");
  const signalrows = [...signalcounts.entries()].sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0])).map(([category, count]) => `| ${category} | ${count} |`).join("\n");

  sections.push(`## Summary

| Metric | Value |
| --- | ---: |
| IDs analyzed | ${identifiers.length - pending.length} of ${identifiers.length} |
| Verified manifests | ${verified.length} |
| Errors or unavailable | ${failed.length} |
| Distinct API pairs observed | ${apicounts.size} |
| Mapped feature items | ${featuretotal} |`);

  sections.push(`## Aggregate permission usage

A count means the permission is declared in the manifest of that many verified packages. Host patterns that some legacy packages declare inside the permissions array appear here as declared.

| Permission | Packages requiring it | Packages with it optional |
| --- | ---: | ---: |
${permissionrows}`);

  sections.push(`## Aggregate API surface

Pairs are captured as namespace dot method tokens from static script text. A count is the number of verified packages whose scripts reference the pair at least once.

| API pair | Packages referencing |
| --- | ---: |
${apirows}`);

  sections.push(`## Aggregate feature signals

A signal category is counted when at least one keyword of the category appears in the static script text of the package.

| Signal category | Packages with a match |
| --- | ---: |
${signalrows}`);

  sections.push("## Per extension evidence");
  for (const id of identifiers) {
    if (!cache[id]) {
      sections.push(`### ${id}`);
      sections.push("");
      sections.push("| Field | Value |");
      sections.push("| --- | --- |");
      sections.push(`| Status | not analyzed yet, run the harvest script to complete |`);
      sections.push("");
      continue;
    }
    sections.push(extensionsection(cache[id]));
  }

  const patternrows = [...patternids.entries()].sort((left, right) => right[1].length - left[1].length).map(([pattern, ids]) => `| ${pattern} | ${ids.length} | ${ids.slice(0, 3).join(", ")}${ids.length > 3 ? ", and more" : ""} |`).join("\n");
  sections.push(`## Execution flow patterns

Recurring architecture patterns observed across the corpus. A pattern is derived from manifest declarations, message transport signals and script keyword evidence.

| Pattern | Packages | Representative ids |
| --- | ---: | --- |
${patternrows}`);

  const poolseen = new Set();
  const poolitems = [];
  let counter = 0;
  const poolsections = [];
  for (const group of featurepool) {
    const lines = [];
    for (const item of group.items) {
      const key = normalizedkey(item);
      if (poolseen.has(key)) continue;
      poolseen.add(key);
      counter += 1;
      poolitems.push(item);
      lines.push(`${counter}. ${item}`);
    }
    if (!lines.length) continue;
    const heading = group.group.charAt(0).toUpperCase() + group.group.slice(1);
    poolsections.push(`### ${heading}\n\n${lines.join("\n")}`);
  }
  sections.push(`## Consolidated feature pool

The pool below is the key inference deliverable: ${counter} distinct candidate features for devthink grouped by context, distilled from the per extension evidence, the aggregate api surface and the public product knowledge cited above. Each line is one concrete implementable candidate. Consent-first adaptation is expected: items that third party packages implement with broad permissions are candidates for devthink only behind explicit per origin grants and reviewed plans.

${poolsections.join("\n\n")}`);

  sections.push(`## References

[1]: https://developer.chrome.com/docs/webstore/update/ "Chrome Web Store update protocol"
[2]: https://developer.chrome.com/docs/extensions/reference "Chrome Extensions API reference"`);

  return { markdown: sections.join("\n\n") + "\n", verified: verified.length, failed: failed.length, featuretotal, poolsize: counter, apicounts: [...apicounts.entries()].sort((left, right) => right[1] - left[1]) };
}

/** Loads the harvest cache, returning an empty record set when absent. */
async function loadcache() {
  if (!existsSync(cachepath)) return {};
  try {
    return JSON.parse(await readFile(cachepath, "utf8"));
  } catch {
    return {};
  }
}

async function main() {
  const idsource = await readFile(join(root, "docs", "inputextensionids.txt"), "utf8");
  const identifiers = [...new Set(idsource.split("\n").map((line) => line.trim()).filter((line) => /^[a-z]{32}$/.test(line)))];
  const labels = new Map();
  try {
    const catalog = await readFile(join(root, "docs", "06.userstorecatalog.md"), "utf8");
    for (const match of catalog.matchAll(/\| \d+ \| (.+?) \| ([a-z]{32}) \|/g)) labels.set(match[2], match[1].trim());
  } catch {
    // Labels are a convenience only.
  }

  const cache = await loadcache();
  await mkdir(artifactsdir, { recursive: true });
  const pending = identifiers.filter((id) => refresh || !cache[id]);
  const queue = pending.slice(skipcount, skipcount + limitcount);
  console.log(`harvest: ${identifiers.length} ids listed, ${identifiers.length - pending.length} cached, ${queue.length} queued in this run`);

  let index = 0;
  for (const id of queue) {
    index += 1;
    const started = Date.now();
    try {
      const record = await analyzepackage(id, labels.get(id) ?? "unknown listing");
      cache[id] = record;
      console.log(`[${index}/${queue.length}] ${id} verified (${record.filecount} files, ${record.apis.length} api pairs, ${((Date.now() - started) / 1000).toFixed(1)}s)`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      cache[id] = { id, label: labels.get(id) ?? "unknown listing", status: `error:${message}`, analyzedat: new Date().toISOString() };
      console.log(`[${index}/${queue.length}] ${id} failed: ${message}`);
    }
    await writeFile(cachepath, JSON.stringify(cache, null, 2), "utf8");
  }

  const { markdown, verified, failed, featuretotal, poolsize, apicounts } = buildreport(cache, identifiers);
  await writeFile(reportpath, markdown, "utf8");
  const analyzed = identifiers.filter((id) => cache[id]).length;
  console.log(JSON.stringify({
    analyzed,
    verified,
    failed,
    featureitems: featuretotal,
    poolsize,
    topapis: apicounts.slice(0, 10),
  }, null, 2));
  if (poolsize < 600) console.warn("warning: consolidated pool is below the 600 item target, extend the pool data");
  if (featuretotal <= 1500 && analyzed === identifiers.length) console.warn("warning: mapped feature items did not exceed 1500, deepen per extension mining");
}

await main();
