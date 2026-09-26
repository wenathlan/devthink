import { describe, expect, it } from "vitest";
import {
  buildclickablemap,
  matcharia,
  matchindex,
  matchname,
  matchtext,
  piercescopes,
  walkframepath,
  type candidatefields,
  type framedescription,
  type scopetree,
} from "../page.js";
import { evaluatexpath, parsexpath } from "../page.js";
import { clickplan, pathhops, pointersequence } from "../page.js";
import {
  appendvalue,
  colorvalue,
  datevalue,
  expandstate,
  heldkeys,
  multichoices,
  presshold,
  radiochoice,
  releasehold,
  slidervalue,
  typetimeschedule,
  valueevents,
} from "../page.js";
import { innerstep, runretries } from "../page.js";
import { dialoganswer, parsedialogpolicy } from "../page.js";
import {
  builda11ytree,
  buildreader,
  captureselection,
  detecttextlanguage,
  documentlanguage,
  opengraphfields,
  pageoutline,
  shadowpaths,
  taglanguage,
  visibletext,
  visibleentries,
  type pagenode,
} from "../page.js";
import {
  bannermatches,
  classifytemplate,
  detectlistpatterns,
  infinitescrollranges,
  lazysurvey,
  normalizetable,
  overlaygeometry,
  paginationestimate,
  scrolllockstate,
  scrollreport,
  sectionfingerprint,
  virtualizedcontainers,
  type bannercandidate,
  type imageshape,
  type siblingsample,
} from "../page.js";
import {
  batchmutations,
  diffsummaries,
  nodehash,
  parsewatchoptions,
  quietfor,
  quietresolution,
  rankselectors,
  scanjson,
  type nodesummary,
} from "../page.js";
import {
  deeplinkurl,
  evaluatesignals,
  fragmenturl,
  loadphase,
  matchlinkfragment,
  matchlinktext,
  parsewaitprofile,
  parsenavtarget,
  pickrecenttab,
  profilefororigin,
  resolvecontainer,
  rewritequeryurl,
  spauroutechanged,
  urlmatches,
} from "../page.js";
import {
  authfor,
  batchopenset,
  buildredirectchain,
  checksafe,
  classifynavchange,
  curatelinks,
  detecthttpstate,
  domainof,
  finalurl,
  interstitialpolicy,
  navwatchevent,
  parseratelimit,
  prefetchcandidates,
  preconnectorigins,
  rateallows,
  ratewindow,
  recordratehit,
  redirectcount,
} from "../page.js";
import {
  assigntasktabs,
  audiotabs,
  badgefromprogress,
  buildlayout,
  clonetabs,
  closeselection,
  discardcandidates,
  layoutrestoreplan,
  normalizedtaburl,
  parsetabquery,
  querymatches,
  regroupaftermoves,
  renamegroup,
  restorediscarded,
  searchtabmatches,
  switcherlist,
  switchtarget,
  tasktabgauge,
  tasktabsinwindow,
  trackedtasktabs,
  watchtabdispatch,
  windowprofilegrants,
  zoomstep,
  type tabshape,
  type windowshape,
} from "../commands.js";
import {
  associateerrors,
  attachplan,
  cardmask,
  classifyfield,
  detecthoneypots,
  detectlogin,
  detecttemplate,
  filloperations,
  generatevalue,
  matchfield,
  pairentries,
  parseformrecord,
  valueshash,
  captchadetected,
  type errorcontext,
  type fieldshape,
  type fieldsurvey,
} from "../page.js";
import {
  backoffwaits,
  calendarplan,
  cardgroups,
  codeready,
  dependentloaded,
  parsebackoff,
  parsedateparts,
  typeaheadpick,
  wizardadvance,
} from "../page.js";
import {
  applyexpression,
  classifycolumn,
  columnspecof,
  dedupebykeys,
  expandspans,
  mapcolumns,
  mergedatasets,
  nextcontrol,
  normalizeheader,
  parsecsv,
  readgrid,
  rowhash,
  rowsfresh,
  samplerows,
  tocsv,
  toexcel,
  tojson,
  transformrows,
  type cellshape,
  type rowshape,
} from "../page.js";
import {
  advancecursor,
  advancestream,
  artifactrecordof,
  backpressure,
  builddataset,
  checksum,
  chunkplan,
  exportartifact,
  exportcontent,
  gridpreview,
  interpolate,
  loopstep,
  loopvariables,
  mergetaskrules,
  newextractsession,
  newstream,
  provenancefor,
  remainingpages,
  retainedexports,
  sheetpayload,
  sortrows,
  streamfrom,
} from "../data.js";
import {
  advancecounter,
  advancedownload,
  capturefilename,
  capturenames,
  capturesteps,
  clipentryof,
  cliphash,
  concurrentwindow,
  conflictfree,
  downloadfilename,
  mimeallowed,
  netlogentry,
  netlogforstep,
  newquarantine,
  quarantinedpath,
  redactheaders,
  referencedartifacts,
  released,
  scanresult,
  scanverdictof,
  sweepplan,
  transitionallowed,
  verifybytes,
} from "../commands.js";
import type {
  artifactinventoryentry,
  bodyrecord,
  downloadrecord,
  exchangerecord,
  responseentry,
  shotrecord,
} from "../types.js";
import {
  annotationplanof,
  blendrows,
  buildname,
  buildsheet,
  buildstitchplan,
  captureelement,
  captureoptionsof,
  captureregion,
  capturestates,
  capturestitched,
  capturevisible,
  croprect,
  crossesviewport,
  fixedheadermatch,
  pairstates,
  regionsteps,
  scaledrect,
  seamweights,
} from "../capture.js";
import {
  assetentries,
  buildpdf,
  convertdirectiveof,
  dedupeimages,
  finishrecording,
  frameinterval,
  imagematches,
  imagefilterof,
  imagenames,
  lapseframes,
  lapseplanof,
  mediaentries,
  newrecording,
  pdfoptionsof,
  pdfpagesize,
  pdfsegments,
  pdftextlayout,
  recordingoptionsof,
  streamsummaries,
  thumbdirectiveof,
  thumbgeometry,
} from "../capture.js";
import {
  channeloptionsof,
  channelorigin,
  closechannel,
  collectmessages,
  cursorfrom,
  matchmessage,
  messagefilterof,
  newchannel,
  openchannel,
  parsessetext,
  pollcursorof,
  polldecision,
  pollurl,
  publishmessage,
  receivemessage,
  reconnectwaits,
  sequenceintegrity,
  sserequestheaders,
  subscriptionoptionsof,
  type busstate,
} from "../net.js";
import {
  apientries,
  apireplayspecof,
  bodyfilterof,
  bodymatches,
  capturedheaders,
  capturebody,
  correlationid,
  failureclass,
  filterexchanges,
  headerfilterof,
  newexchange,
  pairexchange,
  payloadshapeof,
  privatemime,
  rankapis,
  replayurl,
  resourcefacts,
  extractvalues,
  type resourcefact,
} from "../net.js";
import {
  applyheaderules,
  blockruleof,
  cookiedomaingranted,
  cookierecordof,
  matchurlpattern,
  mockfor,
  mockspecof,
  newblockrule,
  newheaderule,
  newmockspec,
  patternorigin,
  proxyrouteof,
  ratelimitreadof,
  ratelimitwait,
  redactedcookies,
  revertrule,
  retryafterof,
  headeruleof,
} from "../net.js";
import {
  authorizeurl,
  capturecode,
  formpayloadof,
  multipartchunks,
  multipartpayloadof,
  oauthflowof,
  parsetokens,
  revocationruleof,
  tokenrequest,
  urlencodeform,
} from "../auth.js";
import {
  argkind,
  attachtimeline,
  blockingduration,
  consolediff,
  consolecapture,
  errorcapture,
  filterentries,
  levelrank,
  loglevels,
  longtaskcapture,
  netfailureentryof,
  redactconsoletext,
  rejectioncapture,
  rotatelogs,
  serializearg,
  spamdetect,
  stackframes,
  timelinecounts,
  watcherdetached,
} from "../run.js";
import { debugwatchoptions, cdpstepoptions } from "../page.js";
import { profilestepoptions } from "../page.js";
import {
  annotatetrace,
  annotationof,
  attachtargetof,
  capturesourcemaps,
  cpusnap,
  expireprofilerecords,
  flowspecof,
  growsampleof,
  growthtrend,
  heapsnap,
  heapintervalallowed,
  mapurlof,
  measure,
  profilerkinds,
  replaytrace,
  rewritesourcelocation,
  shiftentryof,
  stepwindows,
  tracestart,
  tracetofile,
} from "../debug.js";
import { emulationkinds } from "../environments.js";
import { activeblackboxpatterns, revertemulationlayer, runemulationstep } from "../page.js";
import {
  allowlistcovers,
  attachcdpsession,
  breakpointinputof,
  capturepause,
  cdpallowlistof,
  cdpdomains,
  cdpkinds,
  cdpeventruleof,
  detachcdpsession,
  methoddomain,
  overridematches,
  overrideinputof,
  recordwatchvalue,
  sendcdpcommand,
  serializecdpcommand,
  stepmodeof,
  teardowncdpsession,
  teardownplanof,
  watchcdpevents,
  watchexpressionof,
} from "../debug.js";
import type { breakpointspec, cdpeventrule, cdpsession, scriptoverride, watchexpression } from "../types.js";
import type { timelineentry } from "../types.js";
import {
  cookiegate,
  credentialheadername,
  fetchbudgetallowed,
  fetchconsentcovers,
  fetchconsentrefgranted,
  generatedvalueallowed,
  ishttpkind,
  mutationcallof,
  origincheck,
  outboundtarget,
  validateendpointrecord,
  validatestep,
} from "../policy.js";
import {
  callgraphql,
  callrest,
  fetchrequestof,
  fetchoptionsof,
  graphqlopenvelope,
  graphqlrequestof,
  htmlqueriesof,
  jsonpathrulesof,
  parsehtmlbody,
  readpath,
  readstream,
  sendfetch,
  streamwindowof,
  statusclassof,
  templateurl,
  unwrapgraphql,
  type domparse,
} from "../http.js";
import type { endpointrecord, formrecord, keyholdstate, streamwindow, toolstep } from "../types.js";

/** Fixture candidate factory so every resolution test runs without a live dom. */
function candidate(overrides: Partial<candidatefields>): candidatefields {
  return {
    tag: "button",
    id: "",
    role: "button",
    name: "",
    label: "",
    text: "",
    selector: "button:nth-of-type(1)",
    ...overrides,
  };
}

/** Fixture page node factory so every observation test runs without a live dom. */
function node(overrides: Partial<pagenode> = {}): pagenode {
  return {
    tag: "div",
    selector: "div",
    id: "",
    classes: [],
    role: "",
    name: "",
    text: "",
    value: "",
    states: [],
    hidden: false,
    children: [],
    ...overrides,
  };
}

describe("pagebridge resolution", () => {
  it("resolves elements by visible text and refuses ambiguity with candidate lists", () => {
    const page = [
      candidate({
        tag: "div",
        role: "",
        selector: "div:nth-of-type(1)",
        text: "Sign in to continue",
        label: "Sign in to continue",
      }),
      candidate({ selector: "#signin", text: "Sign in", label: "Sign in" }),
      candidate({ tag: "a", role: "link", selector: "a:nth-of-type(1)", text: "Sign in", label: "Sign in" }),
    ];
    expect(matchtext(page, "Sign in to continue")).toHaveLength(1);
    expect(matchtext(page, "sign in")).toHaveLength(2);
    expect(matchtext(page, "missing")).toHaveLength(0);
  });

  it("resolves elements by aria role and name pair", () => {
    const page = [
      candidate({ tag: "input", role: "textbox", name: "email", label: "Email address", selector: "#email" }),
      candidate({ tag: "button", role: "button", label: "Submit order", selector: "#submit" }),
    ];
    expect(matcharia(page, "button", "Submit order")).toHaveLength(1);
    expect(matcharia(page, "BUTTON", "submit order")).toHaveLength(1);
    expect(matcharia(page, "button", "Missing")).toHaveLength(0);
    expect(matcharia(page, "textbox", "Email address")).toHaveLength(1);
  });

  it("resolves elements by accessible name preferring clickable matches", () => {
    const page = [
      candidate({ tag: "span", role: "", text: "Continue", label: "Continue", selector: "span:nth-of-type(1)" }),
      candidate({ tag: "button", text: "Continue", label: "Continue", selector: "#continue" }),
    ];
    expect(matchname(page, "Continue")).toHaveLength(2);
    const clickable = (item: candidatefields): boolean => item.tag === "button";
    expect(matchname(page, "Continue", clickable)).toEqual([page[1]]);
  });

  it("builds the numbered clickable map with stable numbers and matches map indexes", () => {
    const page = [
      candidate({ tag: "a", role: "link", label: "Home", selector: "a:nth-of-type(1)" }),
      candidate({ tag: "button", label: "Search", selector: "#search" }),
      candidate({ tag: "input", role: "textbox", label: "Query", selector: "#query" }),
    ];
    const map = buildclickablemap(page, 7, 1000);
    expect(map.version).toBe(7);
    expect(map.builtat).toBe(1000);
    expect(map.entries.map((entry) => entry.number)).toEqual([1, 2, 3]);
    expect(map.entries[1]).toMatchObject({
      number: 2,
      selector: "#search",
      role: "button",
      label: "Search",
      mode: "selector",
    });
    expect(matchindex(page, 2)[0]?.selector).toBe("#search");
    expect(matchindex(page, 4)).toHaveLength(0);
    expect(matchindex(page, 0)).toHaveLength(0);
  });

  it("evaluates the xpath subset against fixture dom trees", () => {
    const tree = {
      tag: "#document",
      attributes: {},
      text: "",
      children: [
        {
          tag: "html",
          attributes: {},
          text: "",
          children: [
            {
              tag: "head",
              attributes: {},
              text: "",
              children: [{ tag: "title", attributes: {}, text: "Shop", children: [] }],
            },
            {
              tag: "body",
              attributes: { "data-app": "shop" },
              text: "",
              children: [
                { tag: "h1", attributes: {}, text: "Welcome", children: [] },
                { tag: "button", attributes: { id: "submit", type: "submit" }, text: "Buy now", children: [] },
                { tag: "button", attributes: { id: "cancel" }, text: "Cancel", children: [] },
                {
                  tag: "a",
                  attributes: { href: "https://example.com/about", class: "nav" },
                  text: "About",
                  children: [],
                },
                {
                  tag: "a",
                  attributes: { href: "https://example.com/prices", class: "nav" },
                  text: "Prices",
                  children: [],
                },
              ],
            },
          ],
        },
      ],
    };
    expect(parsexpath("//button[@id='submit']")).toHaveLength(1);
    expect(evaluatexpath(tree, "/html/body").map((node) => node.tag)).toEqual(["body"]);
    expect(evaluatexpath(tree, "//button[@id='submit']").map((node) => node.attributes.id)).toEqual(["submit"]);
    expect(evaluatexpath(tree, "//a[contains(@href,'about')]").map((node) => node.text)).toEqual(["About"]);
    expect(evaluatexpath(tree, "//button[text()='Buy now']").map((node) => node.attributes.id)).toEqual(["submit"]);
    expect(evaluatexpath(tree, "//a[contains(text(),'Price')]").map((node) => node.text)).toEqual(["Prices"]);
    expect(evaluatexpath(tree, "//button[2]").map((node) => node.attributes.id)).toEqual(["cancel"]);
    expect(evaluatexpath(tree, "//button[@type]")).toHaveLength(1);
    expect(evaluatexpath(tree, "//button[@id='missing']")).toHaveLength(0);
    expect(() => parsexpath("button[@id='x']")).toThrow("slash");
  });

  it("pierces open shadow scopes recursively until the reviewed target is found", () => {
    const inner: scopetree<candidatefields> = {
      host: candidate({ tag: "my-button", selector: "my-button" }),
      candidates: [candidate({ tag: "button", text: "Hidden", label: "Hidden", selector: "button.inner" })],
      shadows: [],
    };
    const outer: scopetree<candidatefields> = {
      candidates: [candidate({ tag: "div", text: "Outside", selector: "div" })],
      shadows: [inner],
    };
    expect(piercescopes(outer, (item) => item.selector === "button.inner")).toHaveLength(1);
    expect(piercescopes(outer, (item) => item.selector === "missing")).toHaveLength(0);
  });

  it("walks reviewed frame paths and refuses cross origin or absent hops", () => {
    const innerframe: framedescription = { frames: [] };
    const outerframe: framedescription = {
      frames: [{ sameorigin: false }, { sameorigin: true, document: innerframe }],
    };
    const page: framedescription = { frames: [{ sameorigin: true, document: outerframe }, { sameorigin: false }] };
    expect(walkframepath(page, [])).toMatchObject({ ok: true });
    const walk = walkframepath(page, [0, 1]);
    expect(walk.ok).toBe(true);
    if (walk.ok) expect(walk.document).toBe(innerframe);
    expect(walkframepath(page, [0, 0])).toMatchObject({ ok: false, reason: expect.stringContaining("cross origin") });
    expect(walkframepath(page, [1])).toMatchObject({ ok: false, reason: expect.stringContaining("cross origin") });
    expect(walkframepath(page, [5])).toMatchObject({ ok: false, reason: expect.stringContaining("absent") });
    expect(walkframepath(page, [-1])).toMatchObject({ ok: false, reason: expect.stringContaining("invalid") });
  });
});

describe("pagebridge pointer math", () => {
  it("interpolates waypoints linearly between the reviewed points", () => {
    const hops = pathhops({ start: { x: 0, y: 0 }, end: { x: 100, y: 0 }, duration: 160 }, undefined, () => 0, 16);
    expect(hops).toHaveLength(10);
    expect(hops[0]).toMatchObject({ x: 10, y: 0 });
    expect(hops[9]).toMatchObject({ x: 100, y: 0 });
    expect(hops.every((hop) => hop.delay === 16)).toBe(true);
  });

  it("honors the easeinout shape and waypoint legs", () => {
    const linear = pathhops({ start: { x: 0, y: 0 }, end: { x: 100, y: 0 }, duration: 160 }, undefined, () => 0, 16);
    const eased = pathhops(
      { start: { x: 0, y: 0 }, end: { x: 100, y: 0 }, duration: 160 },
      { easing: "easeinout" },
      () => 0,
      16,
    );
    expect(eased[0]?.x).toBeLessThan(linear[0]?.x as number);
    expect(eased[9]?.x).toBe(100);
    const waypointed = pathhops(
      { start: { x: 0, y: 0 }, end: { x: 100, y: 100 }, waypoints: [{ x: 100, y: 0 }], duration: 320 },
      undefined,
      () => 0,
      16,
    );
    expect(waypointed[waypointed.length - 1]).toMatchObject({ x: 100, y: 100 });
    const midway = waypointed.find((hop) => hop.x === 100 && hop.y === 0);
    expect(midway).toBeDefined();
  });

  it("applies speedprofile jitter and peak velocity caps to hop delays", () => {
    const jittered = pathhops(
      { start: { x: 0, y: 0 }, end: { x: 100, y: 0 }, duration: 160 },
      { jitter: 10 },
      () => 0.5,
      16,
    );
    expect(jittered.every((hop) => hop.delay === 21)).toBe(true);
    const capped = pathhops({ start: { x: 0, y: 0 }, end: { x: 3000, y: 0 } }, { peak: 100 }, () => 0, 16);
    expect(capped.length).toBeGreaterThan(0);
    let previous = { x: 0, y: 0 };
    for (const hop of capped) {
      const step = Math.hypot(hop.x - previous.x, hop.y - previous.y);
      const speed = hop.delay > 0 ? step / (hop.delay / 1000) : Number.POSITIVE_INFINITY;
      expect(speed).toBeLessThanOrEqual(100.000001);
      previous = { x: hop.x, y: hop.y };
    }
    const totaldelay = capped.reduce((sum, hop) => sum + hop.delay, 0);
    expect(totaldelay).toBeGreaterThanOrEqual(29_999);
  });

  it("never lets a reviewed duration override the reviewed peak velocity", () => {
    const rushed = pathhops(
      { start: { x: 0, y: 0 }, end: { x: 3000, y: 0 }, duration: 300 },
      { peak: 100 },
      () => 0,
      16,
    );
    const totaldelay = rushed.reduce((sum, hop) => sum + hop.delay, 0);
    expect(totaldelay).toBeGreaterThanOrEqual(29_999);
  });

  it("wraps pointer paths with pointerover and pointerout events", () => {
    expect(pointersequence(3)).toEqual(["pointerover", "pointermove", "pointermove", "pointermove", "pointerout"]);
    expect(pointersequence(0)).toEqual(["pointerover", "pointerout"]);
  });

  it("plans coordinate click sequences with and without the shift modifier", () => {
    const plain = clickplan(120, 40, []);
    expect(plain.map((event) => event.type)).toEqual([
      "pointerover",
      "pointermove",
      "pointerdown",
      "mousedown",
      "pointerup",
      "mouseup",
      "click",
    ]);
    expect(plain.every((event) => event.x === 120 && event.y === 40 && event.shift === false)).toBe(true);
    const shifted = clickplan(10, 20, ["shift"]);
    expect(shifted.every((event) => event.shift === true)).toBe(true);
    expect(shifted.filter((event) => event.eventkind === "mouse")).toHaveLength(3);
  });
});

describe("pagebridge control math", () => {
  it("schedules timed typing with a per keystroke delay", () => {
    expect(typetimeschedule("abc", 80)).toEqual([
      { key: "a", delay: 0 },
      { key: "b", delay: 80 },
      { key: "c", delay: 80 },
    ]);
  });

  it("appends reviewed text and delivers the reviewed value event order", () => {
    expect(appendvalue("hello", " world")).toBe("hello world");
    expect(valueevents()).toEqual(["input", "change"]);
  });

  it("splits multi select choices and refuses missing values", () => {
    const options = [
      { value: "br", label: "Brazil" },
      { value: "pt", label: "Portugal" },
    ];
    expect(multichoices(["br", "pt"], options)).toEqual({ present: ["br", "pt"], missing: [] });
    expect(multichoices(["br", "es"], options)).toEqual({ present: ["br"], missing: ["es"] });
    expect(multichoices(["Brazil"], options)).toEqual({ present: ["br"], missing: [] });
  });

  it("picks radio choices by value or label", () => {
    const group = [
      { value: "a", label: "Alpha" },
      { value: "b", label: "Beta" },
    ];
    expect(radiochoice(group, "b")).toBe(1);
    expect(radiochoice(group, "Beta")).toBe(1);
    expect(radiochoice(group, "gamma")).toBe(-1);
  });

  it("clamps slider values to the reviewed range and step grid", () => {
    expect(slidervalue(50, 0, 100, 10)).toBe(50);
    expect(slidervalue(104, 0, 100, 10)).toBe(100);
    expect(slidervalue(-5, 0, 100, 10)).toBe(0);
    expect(slidervalue(37, 0, 100, 25)).toBe(25);
    expect(slidervalue(37, 0, 100, 0)).toBe(37);
  });

  it("validates and normalizes reviewed dates and colors", () => {
    expect(datevalue("2026-07-14")).toBe("2026-07-14");
    expect(datevalue("2026-13-01")).toBeNull();
    expect(datevalue("14/07/2026")).toBeNull();
    expect(colorvalue("#FF00AA")).toBe("#ff00aa");
    expect(colorvalue("#ff00a")).toBeNull();
    expect(colorvalue("red")).toBeNull();
  });

  it("decides when a details section still needs opening", () => {
    expect(expandstate(false)).toEqual({ open: true, changed: true });
    expect(expandstate(true)).toEqual({ open: true, changed: false });
  });
});

describe("pagebridge key hold registry", () => {
  const base: keyholdstate = { holdid: "h1", key: "Shift", tabid: 4, stepid: "s1", pressedat: 100 };

  it("keeps a held key across steps and refuses duplicate active hold ids", () => {
    let registry: keyholdstate[] = [];
    registry = presshold(registry, base).holds;
    registry = presshold(registry, { ...base, holdid: "h2", key: "Control" }).holds;
    expect(heldkeys(registry)).toHaveLength(2);
    expect(presshold(registry, { ...base, pressedat: 200 }).ok).toBe(false);
    expect(heldkeys(registry, 4)).toHaveLength(2);
    expect(heldkeys(registry, 9)).toHaveLength(0);
  });

  it("releases one held key by hold id and keeps provenance", () => {
    let registry: keyholdstate[] = presshold([], base).holds;
    const transition = releasehold(registry, "h1", 900);
    expect(transition.released).toMatchObject({ holdid: "h1", releasedat: 900, key: "Shift", tabid: 4, stepid: "s1" });
    expect(heldkeys(transition.holds)).toHaveLength(0);
    expect(transition.holds[0]?.releasedat).toBe(900);
    expect(releasehold(transition.holds, "h1", 950).released).toBeUndefined();
  });
});

describe("pagebridge retry loop", () => {
  it("reruns a failed interaction when the fixture moves the element between attempts", async () => {
    let position = { x: 0, y: 0 };
    const attempts: number[] = [];
    const outcome = await runretries(
      { attempts: 3, settle: 1, tolerance: 5 },
      async () => position,
      async (attempt) => {
        attempts.push(attempt);
        if (attempt === 1) {
          position = { x: 30, y: 40 };
          return { ok: false, summary: "click missed" };
        }
        return { ok: true, summary: "click landed" };
      },
    );
    expect(outcome).toMatchObject({ ok: true, attempts: 2, movement: 50 });
    expect(attempts).toEqual([1, 2]);
  });

  it("stops retrying when the target stays within the reviewed tolerance", async () => {
    const attempts: number[] = [];
    const outcome = await runretries(
      { attempts: 4, settle: 1, tolerance: 10 },
      async () => ({ x: 0, y: 0 }),
      async (attempt) => {
        attempts.push(attempt);
        return { ok: false, summary: "still failing" };
      },
    );
    expect(outcome.ok).toBe(false);
    expect(outcome.attempts).toBe(1);
    expect(attempts).toEqual([1]);
    expect(outcome.summary).toContain("tolerance");
  });

  it("retries again when the target disappears between attempts", async () => {
    let present = true;
    const attempts: number[] = [];
    const outcome = await runretries(
      { attempts: 3, settle: 1, tolerance: 0 },
      async () => (present ? { x: 0, y: 0 } : null),
      async (attempt) => {
        attempts.push(attempt);
        if (attempt === 1) {
          present = false;
          return { ok: false, summary: "gone" };
        }
        return { ok: true, summary: "back" };
      },
    );
    expect(outcome).toMatchObject({ ok: true, attempts: 2 });
    expect(attempts).toEqual([1, 2]);
  });

  it("extracts the reviewed inner step of a wrapper from inline options", () => {
    const step: toolstep = {
      id: "wrap",
      kind: "retryaction",
      summary: "Retry the click.",
      risk: "interaction",
      options:
        '{"kind":"click","target":"#btn","value":"x","options":{"modifiers":["shift"]},"retryrule":{"attempts":3}}',
    };
    const inner = innerstep(step);
    expect(inner).toMatchObject({ kind: "click", target: "#btn", value: "x" });
    expect(inner?.options).toBe('{"modifiers":["shift"]}');
    expect(innerstep({ id: "bare", kind: "retryaction", summary: "No inner step.", risk: "interaction" })).toBeNull();
  });
});

describe("pagebridge dialog policy", () => {
  it("parses reviewed dialog policies from step options", () => {
    const accept: toolstep = {
      id: "d1",
      kind: "dismissdialog",
      summary: "Accept the dialog.",
      risk: "sensitive",
      options: '{"accept":true}',
    };
    const answer: toolstep = {
      id: "d2",
      kind: "dismissdialog",
      summary: "Answer the prompt.",
      risk: "sensitive",
      options: '{"answer":"devthink"}',
    };
    expect(parsedialogpolicy(accept)).toEqual({ accept: true });
    expect(parsedialogpolicy(answer)).toEqual({ accept: false, answer: "devthink" });
    expect(
      parsedialogpolicy({ id: "d3", kind: "dismissdialog", summary: "Empty policy.", risk: "sensitive" }),
    ).toBeNull();
  });

  it("answers prompts only with a reviewed answer and dismisses otherwise", () => {
    expect(dialoganswer({ accept: true }, "confirm")).toEqual({ accept: true });
    expect(dialoganswer({ accept: false }, "alert")).toEqual({ accept: false });
    expect(dialoganswer({ accept: true }, "prompt")).toEqual({ accept: false });
    expect(dialoganswer({ accept: true, answer: "yes" }, "prompt")).toEqual({ accept: true, answer: "yes" });
    expect(dialoganswer({ accept: false, answer: "no" }, "prompt")).toEqual({ accept: false, answer: "no" });
  });
});

describe("pagebridge observation", () => {
  it("captures the a11y tree with roles, names, states and values on fixture trees", () => {
    const tree = node({
      tag: "#document",
      role: "document",
      children: [
        node({ tag: "button", role: "button", name: "Submit order", states: ["disabled"], selector: "#submit" }),
        node({ tag: "input", role: "textbox", name: "Email", value: "user@example.com", selector: "#email" }),
        node({
          tag: "div",
          hidden: true,
          children: [node({ tag: "p", text: "hidden text", selector: "p:nth-of-type(1)" })],
        }),
        node({
          tag: "ul",
          role: "list",
          children: [
            node({ tag: "li", role: "listitem", text: "First", name: "First", selector: "li:nth-of-type(1)" }),
          ],
        }),
      ],
    });
    const a11y = builda11ytree(tree);
    expect(a11y.role).toBe("document");
    expect(a11y.childcount).toBe(3);
    expect(a11y.children[0]).toMatchObject({
      role: "button",
      name: "Submit order",
      states: ["disabled"],
      childcount: 0,
    });
    expect(a11y.children[1]).toMatchObject({ role: "textbox", name: "Email", value: "user@example.com" });
    expect(a11y.children[2]).toMatchObject({ role: "list", childcount: 1 });
    expect(a11y.children[2]?.children[0]).toMatchObject({ role: "listitem", name: "First" });
    expect(JSON.stringify(a11y)).not.toContain("hidden text");
  });

  it("returns the rendered text of each visible element and excludes hidden subtrees", () => {
    const tree = node({
      tag: "#document",
      text: "Welcome",
      children: [
        node({ tag: "p", text: "Visible paragraph", selector: "p:nth-of-type(1)" }),
        node({
          tag: "div",
          hidden: true,
          children: [node({ tag: "p", text: "Invisible", selector: "p:nth-of-type(2)" })],
        }),
        node({ tag: "span", text: "Tail", selector: "span:nth-of-type(1)" }),
      ],
    });
    const entries = visibleentries(tree);
    expect(entries.map((entry) => entry.text)).toEqual(["Welcome", "Visible paragraph", "Tail"]);
    expect(visibletext(tree)).toBe("Welcome Visible paragraph Tail");
  });

  it("extracts the reader view with the text density heuristic separating article from chrome", () => {
    const article = node({
      tag: "article",
      selector: "article",
      children: [
        node({ tag: "h1", text: "Deep observation", selector: "h1" }),
        node({ tag: "p", classes: ["author"], text: "By Ada Lovelace", selector: "p.author" }),
        node({
          tag: "p",
          text: "The accessibility tree gives every element a role and a name.",
          selector: "p:nth-of-type(1)",
        }),
        node({
          tag: "p",
          text: "Reader views score text density to keep the article only.",
          selector: "p:nth-of-type(2)",
        }),
      ],
    });
    const nav = node({
      tag: "nav",
      selector: "nav",
      children: [
        node({ tag: "a", text: "Home", selector: "a:nth-of-type(1)" }),
        node({ tag: "a", text: "Pricing", selector: "a:nth-of-type(2)" }),
        node({ tag: "a", text: "Docs", selector: "a:nth-of-type(3)" }),
      ],
    });
    const reader = buildreader(node({ tag: "#document", children: [article, nav] }), "Fallback title");
    expect(reader.title).toBe("Deep observation");
    expect(reader.byline).toBe("By Ada Lovelace");
    expect(reader.blocks.map((block) => block.kind)).toContain("p");
    expect(reader.blocks.every((block) => block.text.length > 0)).toBe(true);
    expect(reader.words).toBe(reader.blocks.reduce((total, block) => total + block.words, 0));
    expect(reader.blocks.some((block) => block.text === "Home")).toBe(false);
  });

  it("reads the title and headings outline of the page", () => {
    const tree = node({
      tag: "#document",
      children: [
        node({ tag: "h1", text: "Guide", selector: "h1" }),
        node({ tag: "h2", text: "Basics", selector: "h2:nth-of-type(1)" }),
        node({ tag: "h3", text: "Advanced", selector: "h3:nth-of-type(1)" }),
      ],
    });
    const outline = pageoutline(tree, "Document title");
    expect(outline.title).toBe("Guide");
    expect(outline.headings).toEqual([
      { level: 1, text: "Guide" },
      { level: 2, text: "Basics" },
      { level: 3, text: "Advanced" },
    ]);
  });

  it("reads the current user selection through the selection api", () => {
    expect(captureselection({ getSelection: () => ({ toString: () => "  selected words  " }) })).toEqual({
      text: "selected words",
      length: 14,
    });
    expect(captureselection({ getSelection: () => null })).toEqual({ text: "", length: 0 });
    expect(captureselection({})).toEqual({ text: "", length: 0 });
  });

  it("extracts open graph fields and refuses malformed structured payloads", () => {
    const meta = [
      { property: "og:title", name: "", content: "Devthink" },
      { property: "og:type", name: "", content: "website" },
      { property: "", name: "description", content: "ignored" },
    ];
    const fields = opengraphfields(meta, ['{"@type":"Article"}', "not json {"]);
    expect(fields.graph).toEqual({ "og:title": "Devthink", "og:type": "website" });
    expect(fields.structured).toEqual([{ "@type": "Article" }]);
    expect(fields.refused).toBe(1);
  });

  it("resolves the page language from document, meta and content signals and routes extracted text", () => {
    expect(documentlanguage({ lang: "pt-BR", meta: "en", text: "the page" })).toEqual({
      language: "pt-BR",
      source: "document",
    });
    expect(documentlanguage({ lang: "", meta: "fr", text: "the page" })).toEqual({ language: "fr", source: "meta" });
    expect(documentlanguage({ lang: "", meta: "", text: "Este é um texto de exemplo sobre a página" })).toEqual({
      language: "pt",
      source: "content",
    });
    expect(detecttextlanguage("This is a sample text about the page")).toBe("en");
    expect(detecttextlanguage("")).toBe("");
    expect(taglanguage("Dies ist ein Beispieltext")).toEqual({ text: "Dies ist ein Beispieltext", language: "de" });
  });

  it("lists the host paths of nested open shadow roots", () => {
    const inner: scopetree<candidatefields> = {
      host: candidate({ tag: "my-list", selector: "my-list" }),
      candidates: [],
      shadows: [],
    };
    const outer: scopetree<candidatefields> = { candidates: [], shadows: [inner] };
    expect(shadowpaths(outer)).toEqual(["my-list"]);
    const nested: scopetree<candidatefields> = {
      host: candidate({ tag: "my-row", selector: "my-row" }),
      candidates: [],
      shadows: [],
    };
    inner.shadows = [nested];
    expect(shadowpaths(outer)).toEqual(["my-list", "my-list > my-row"]);
    expect(shadowpaths({ candidates: [], shadows: [] })).toEqual([]);
  });
});

describe("pagebridge detection", () => {
  it("finds repeated item lists with a shared item selector", () => {
    const samples: siblingsample[] = [
      {
        container: "ul.products",
        children: [
          { tag: "li", classes: "product-item", text: "Keyboard", selector: "li:nth-of-type(1)" },
          { tag: "li", classes: "product-item", text: "Monitor", selector: "li:nth-of-type(2)" },
          { tag: "li", classes: "product-item", text: "Mouse", selector: "li:nth-of-type(3)" },
          { tag: "li", classes: "", text: "Footer note", selector: "li:nth-of-type(4)" },
        ],
      },
      {
        container: "div.sidebar",
        children: [
          { tag: "div", classes: "", text: "", selector: "div:nth-of-type(1)" },
          { tag: "div", classes: "", text: "", selector: "div:nth-of-type(2)" },
        ],
      },
    ];
    const patterns = detectlistpatterns(samples);
    expect(patterns).toHaveLength(1);
    expect(patterns[0]).toMatchObject({ container: "ul.products", itemselector: "li.product-item", repeat: 3 });
    expect(patterns[0]?.samples).toEqual(["Keyboard", "Monitor", "Mouse"]);
  });

  it("normalizes header cells into tableshape column specs with caption", () => {
    const shape = normalizetable(
      [
        { cells: ["Name", "Price"], header: true },
        { cells: ["Keyboard", "120"], header: false },
        { cells: ["", "80"], header: false },
      ],
      "Products",
    );
    expect(shape.headers).toEqual(["Name", "Price"]);
    expect(shape.rows).toBe(2);
    expect(shape.caption).toBe("Products");
    expect(shape.columns).toEqual([
      { label: "Name", cells: 1 },
      { label: "Price", cells: 2 },
    ]);
    const headerless = normalizetable([{ cells: ["a", "b"], header: false }], "");
    expect(headerless.headers).toEqual([]);
    expect(headerless.columns).toEqual([
      { label: "column 1", cells: 1 },
      { label: "column 2", cells: 1 },
    ]);
  });

  it("counts pagination entries and estimates the total pages", () => {
    const entries = [
      { text: "1", selector: "a:nth-of-type(1)", current: true },
      { text: "2", selector: "a:nth-of-type(2)", current: false },
      { text: "3", selector: "a:nth-of-type(3)", current: false },
      { text: "next", selector: "a:nth-of-type(4)", current: false },
    ];
    const estimate = paginationestimate(entries);
    expect(estimate).toMatchObject({ current: 1, total: 3, links: 4 });
    expect(estimate.pages).toEqual([1, 2, 3]);
    expect(paginationestimate([{ text: "next", selector: "a", current: false }])).toMatchObject({
      current: 0,
      total: 0,
      links: 1,
    });
  });

  it("flags infinite scroll containers from measured scroll ranges and triggers", () => {
    const flagged = infinitescrollranges([
      { selector: "#feed", scrollheight: 6000, clientheight: 800, triggers: ["#loadmore"] },
      { selector: "#short", scrollheight: 500, clientheight: 800, triggers: ["#loadmore"] },
      { selector: "#plain", scrollheight: 6000, clientheight: 800, triggers: [] },
    ]);
    expect(flagged).toEqual([{ selector: "#feed", scrollrange: 5200, triggers: ["#loadmore"] }]);
  });

  it("detects virtualized lists whose uniform rows do not fill the scroll range", () => {
    const rows = [
      { selector: "div:nth-of-type(1)", height: 40, classes: "row" },
      { selector: "div:nth-of-type(2)", height: 40, classes: "row" },
      { selector: "div:nth-of-type(3)", height: 40, classes: "row" },
    ];
    const flagged = virtualizedcontainers([
      { selector: "#grid", scrollheight: 4000, rows },
      { selector: "#filled", scrollheight: 120, rows },
      { selector: "#mixed", scrollheight: 4000, rows: [rows[0]!, { ...rows[1]!, height: 90 }, rows[2]!] },
    ]);
    expect(flagged).toEqual([{ selector: "#grid", rendered: 3, estimated: 100 }]);
  });

  it("detects lazy loaded images and placeholder states", () => {
    const images: imageshape[] = [
      {
        selector: "#hero",
        src: "https://example.com/hero.jpg",
        datasrc: "",
        loading: "lazy",
        width: 1200,
        height: 600,
      },
      { selector: "#deferred", src: "", datasrc: "https://example.com/real.jpg", loading: "", width: 0, height: 0 },
      { selector: "#placeholder", src: "data:image/gif;base64,xxx", datasrc: "", loading: "", width: 1, height: 1 },
      {
        selector: "#eager",
        src: "https://example.com/eager.jpg",
        datasrc: "",
        loading: "eager",
        width: 400,
        height: 300,
      },
    ];
    const survey = lazysurvey(images);
    expect(survey.lazy.map((entry) => entry.selector)).toEqual(["#hero", "#deferred"]);
    expect(survey.lazy[0]?.reason).toBe("loading attribute");
    expect(survey.lazy[1]?.reason).toBe("deferred source");
    expect(survey.placeholders.map((entry) => entry.selector)).toEqual(["#deferred", "#placeholder"]);
    expect(survey.placeholders[1]?.reason).toBe("inline data placeholder");
  });

  it("measures sticky and fixed overlays against the viewport geometry", () => {
    const overlays = overlaygeometry(
      [
        { selector: "#header", position: "sticky", top: 0, height: 60, width: 1200 },
        { selector: "#modal", position: "fixed", top: -10, height: 700, width: 1000 },
        { selector: "#footer", position: "static", top: 0, height: 200, width: 1200 },
        { selector: "#offscreen", position: "fixed", top: 400, height: 100, width: 1200 },
      ],
      { width: 1200, height: 800 },
    );
    expect(overlays).toHaveLength(2);
    expect(overlays[0]).toMatchObject({ selector: "#header", position: "sticky", coverage: 0.075, hides: false });
    expect(overlays[1]).toMatchObject({ selector: "#modal", hides: true });
    expect(overlays[1]?.coverage).toBeGreaterThanOrEqual(0.7);
  });

  it("detects scroll locks and modal states with reasons", () => {
    expect(
      scrolllockstate({ bodyoverflow: "hidden", htmloverflow: "", bodyposition: "", modal: false, scrollable: true }),
    ).toMatchObject({ locked: true, reasons: ["overflow hidden"], scrollable: true });
    expect(
      scrolllockstate({
        bodyoverflow: "auto",
        htmloverflow: "",
        bodyposition: "fixed",
        modal: false,
        scrollable: true,
      }),
    ).toMatchObject({ locked: true, reasons: ["fixed body"] });
    expect(
      scrolllockstate({ bodyoverflow: "auto", htmloverflow: "", bodyposition: "", modal: true, scrollable: true }),
    ).toMatchObject({ locked: true, reasons: ["modal open"] });
    expect(
      scrolllockstate({ bodyoverflow: "auto", htmloverflow: "", bodyposition: "", modal: false, scrollable: false }),
    ).toMatchObject({ locked: false, reasons: [] });
  });

  it("classifies the page template from its dominant structural signals", () => {
    expect(
      classifytemplate({ paragraphs: 0, headings: 1, lists: 0, tables: 0, forms: 1, inputs: 2, password: true }),
    ).toBe("login");
    expect(
      classifytemplate({ paragraphs: 6, headings: 2, lists: 0, tables: 0, forms: 1, inputs: 1, password: false }),
    ).toBe("article");
    expect(
      classifytemplate({ paragraphs: 1, headings: 1, lists: 0, tables: 2, forms: 0, inputs: 0, password: false }),
    ).toBe("table");
    expect(
      classifytemplate({ paragraphs: 1, headings: 1, lists: 0, tables: 0, forms: 1, inputs: 4, password: false }),
    ).toBe("form");
    expect(
      classifytemplate({ paragraphs: 0, headings: 0, lists: 3, tables: 0, forms: 0, inputs: 0, password: false }),
    ).toBe("list");
    expect(
      classifytemplate({ paragraphs: 0, headings: 0, lists: 0, tables: 0, forms: 0, inputs: 0, password: false }),
    ).toBe("generic");
  });

  it("computes stable section fingerprints that change with the structure", () => {
    const section = {
      tag: "section",
      attributes: { id: "prices", "data-kind": "grid" },
      children: 12,
      textlength: 3400,
    };
    const first = sectionfingerprint(section);
    expect(first).toMatch(/^fp[0-9a-f]+$/);
    expect(sectionfingerprint(section)).toBe(first);
    expect(sectionfingerprint({ ...section, children: 13 })).not.toBe(first);
    expect(sectionfingerprint({ ...section, tag: "div" })).not.toBe(first);
  });

  it("normalizes scroll positions of the window and containers with edge flags", () => {
    const report = scrollreport({ scrollx: 0, scrolly: 0, scrollheight: 2000, clientheight: 800 }, [
      { selector: "#feed", scrolltop: 1200, scrollleft: 0, scrollheight: 2000, clientheight: 800 },
      { selector: "#box", scrolltop: 0, scrollleft: 10, scrollheight: 400, clientheight: 400 },
    ]);
    expect(report.window).toMatchObject({ x: 0, y: 0, attop: true, atbottom: false, height: 2000 });
    expect(report.containers[0]).toMatchObject({
      selector: "#feed",
      scrolltop: 1200,
      scrollrange: 1200,
      atbottom: true,
    });
    expect(report.containers[1]).toMatchObject({ selector: "#box", scrollrange: 0, atbottom: true });
  });
});

describe("pagebridge watch", () => {
  it("parses reviewed watch options with lifetimes, scopes and poll intervals", () => {
    const step: toolstep = {
      id: "w1",
      kind: "watchmutate",
      summary: "Watch the feed.",
      risk: "read",
      options: '{"watchid":"feedwatch","scopes":["#feed"],"events":["childList"],"lifetime":2500,"poll":120}',
    };
    expect(parsewatchoptions(step, "fallback")).toMatchObject({
      watchid: "feedwatch",
      scopes: ["#feed"],
      events: ["childList"],
      lifetime: 2500,
      poll: 120,
    });
    const bare: toolstep = {
      id: "w2",
      kind: "watchfocus",
      summary: "Watch focus.",
      risk: "read",
      options: '{"lifetime":800}',
    };
    expect(parsewatchoptions(bare, "fallback")).toMatchObject({ watchid: "fallback", lifetime: 800, poll: 250 });
    expect(parsewatchoptions(bare, "fallback").scopes).toBeUndefined();
    const broken: toolstep = {
      id: "w3",
      kind: "watchbanner",
      summary: "Watch banners.",
      risk: "read",
      options: "not json",
    };
    expect(parsewatchoptions(broken, "fallback")).toMatchObject({ watchid: "fallback", lifetime: 0, poll: 250 });
  });

  it("batches mutation records so records inside one throttle window flush together", () => {
    const events = [
      { watchid: "w", event: "childList", targetpath: "#feed", at: 1000 },
      { watchid: "w", event: "childList", targetpath: "#feed", at: 1100 },
      { watchid: "w", event: "attributes", targetpath: "#feed", at: 1150 },
      { watchid: "w", event: "childList", targetpath: "#feed", at: 1400 },
    ];
    expect(batchmutations(events, 200)).toEqual([[events[0], events[1], events[2]], [events[3]]]);
    expect(batchmutations(events, 500)).toHaveLength(1);
    expect(batchmutations(events, 0)).toHaveLength(1);
    expect(batchmutations([], 500)).toEqual([]);
  });

  it("matches consent banner shapes against the known keyword vocabulary", () => {
    const candidates: bannercandidate[] = [
      {
        selector: "#cookiebar",
        id: "cookiebar",
        classes: ["banner"],
        text: "We use cookies to improve your experience.",
        controls: ["Accept all", "Reject"],
      },
      { selector: "#gdpr", id: "gdpr", classes: [], text: "Data processing notice.", controls: ["OK"] },
      { selector: "#menu", id: "", classes: ["nav"], text: "Open the navigation menu.", controls: [] },
      { selector: "#empty", id: "cookie-empty", classes: [], text: "", controls: [] },
    ];
    const reports = bannermatches(candidates, 5000);
    expect(reports.map((report) => report.selector)).toEqual(["#cookiebar", "#gdpr"]);
    expect(reports[0]).toMatchObject({
      kind: "cookie",
      selector: "#cookiebar",
      controls: ["Accept all", "Reject"],
      at: 5000,
    });
    expect(reports[1]).toMatchObject({ kind: "gdpr" });
  });

  it("measures network quiet from resource timing entries and decides from probe samples", () => {
    expect(quietfor([{ responseend: 900 }, { responseend: 400 }], 1400)).toBe(500);
    expect(quietfor([], 1400)).toBe(1400);
    expect(quietfor([{ responseend: 2000 }], 1400)).toBe(0);
    const reached = quietresolution(
      [
        { at: 0, quietfor: 200 },
        { at: 300, quietfor: 640 },
        { at: 600, quietfor: 700 },
      ],
      500,
      5000,
    );
    expect(reached).toMatchObject({ ok: true, quietfor: 640, waited: 300, samples: 3 });
    const timedout = quietresolution(
      [
        { at: 0, quietfor: 100 },
        { at: 700, quietfor: 120 },
      ],
      500,
      600,
    );
    expect(timedout).toMatchObject({ ok: false, quietfor: 120, waited: 700, samples: 2 });
    const openended = quietresolution([{ at: 0, quietfor: 0 }], 500, 0);
    expect(openended.ok).toBe(false);
  });

  it("diffs node summaries into added, removed and changed sets by hashing", () => {
    const summary = (selector: string, tag: string, text: string): nodesummary => ({
      selector,
      tag,
      text,
      attributes: {},
    });
    expect(nodehash(summary("#go", "button", "Go"))).toBe(nodehash(summary("#go", "button", "Go")));
    expect(nodehash(summary("#go", "button", "Go"))).not.toBe(nodehash(summary("#go", "button", "Stop")));
    const diff = diffsummaries(
      [summary("#a", "link", "Home"), summary("#go", "button", "Go"), summary("#old", "div", "Removed")],
      [summary("#a", "link", "Home"), summary("#go", "button", "Stop"), summary("#new", "link", "Added")],
    );
    expect(diff.added).toEqual([{ kind: "added", selector: "#new", summary: "Added" }]);
    expect(diff.removed).toEqual([{ kind: "removed", selector: "#old", summary: "Removed" }]);
    expect(diff.changed).toEqual([{ kind: "changed", selector: "#go", summary: "Go became Stop" }]);
  });

  it("scans embedded json state from inline scripts and refuses malformed payloads", () => {
    const scripts = [
      { src: "", type: "application/json", id: "state", content: '{"user":{"name":"ada"}}' },
      { src: "", type: "", id: "bootstrap", content: '["a","b"]' },
      { src: "", type: "", id: "broken", content: '{"user":' },
      { src: "https://cdn.example/lib.js", type: "", id: "", content: "var x = 1;" },
      { src: "", type: "text/javascript", id: "logic", content: "console.log('no json here')" },
    ];
    const outcome = scanjson(scripts);
    expect(outcome.states).toHaveLength(2);
    expect(outcome.states[0]).toMatchObject({ scripturl: "", rootpath: "state", payload: { user: { name: "ada" } } });
    expect(outcome.states[1]).toMatchObject({ rootpath: "bootstrap", payload: ["a", "b"] });
    expect(outcome.refused).toBe(1);
  });

  it("ranks derived selector candidates by stability score", () => {
    const candidates = rankselectors({
      id: "checkout",
      tag: "button",
      attributes: { "data-testid": "checkout", name: "checkout", style: "color: red" },
      text: "Checkout now",
      index: 2,
      siblings: 3,
    });
    expect(candidates.map((entry) => entry.strategy)).toEqual(["id", "attribute", "attribute", "text", "structural"]);
    expect(candidates[0]).toEqual({ selector: "#checkout", strategy: "id", score: 100 });
    expect(candidates[1]).toEqual({ selector: 'button[data-testid="checkout"]', strategy: "attribute", score: 80 });
    expect(candidates[2]).toEqual({ selector: 'button[name="checkout"]', strategy: "attribute", score: 80 });
    expect(candidates[3]).toEqual({ selector: "Checkout now", strategy: "text", score: 60 });
    expect(candidates[4]).toEqual({ selector: "button:nth-of-type(2)", strategy: "structural", score: 40 });
    const bare = rankselectors({ id: "", tag: "div", attributes: {}, text: "", index: 0, siblings: 0 });
    expect(bare).toEqual([]);
  });
});

describe("navigation mastery", () => {
  it("resolves navtarget containers across tabs, windows and private profiles", () => {
    const windows = [
      { id: 1, incognito: false, focused: false },
      { id: 2, incognito: false, focused: true },
      { id: 3, incognito: true, focused: false },
    ];
    const tab = resolvecontainer(
      { url: "https://example.com/a", container: "tab", position: "end", private: false },
      windows,
    );
    expect(tab).toEqual({ kind: "tab", incognito: false, windowid: 2, position: "end" });
    const window = resolvecontainer({ url: "https://example.com/a", container: "window", private: false }, windows);
    expect(window).toEqual({ kind: "window", incognito: false, windowid: 2, position: "adjacent" });
    const priv = resolvecontainer({ url: "https://example.com/a", container: "private", private: true }, windows);
    expect(priv).toEqual({ kind: "private", incognito: true, position: "adjacent" });
    expect(priv.incognito).toBe(true);
    const current = resolvecontainer({ url: "https://example.com/a", container: "current", private: false }, windows);
    expect(current).toEqual({ kind: "current", incognito: false, position: "adjacent" });
  });

  it("parses wait profiles and folds the per origin overrides in", () => {
    const step: toolstep = {
      id: "p1",
      kind: "navprofile",
      summary: "Apply the wait profile.",
      risk: "sensitive",
      options:
        '{"waitprofile":{"signals":["load"],"idle":400,"timeout":5000,"overrides":[{"origin":"https://slow.example","signals":["load","networkidle"],"idle":2000}]}}',
    };
    const profile = parsewaitprofile(step);
    expect(profile?.signals).toEqual(["load"]);
    expect(profile?.idle).toBe(400);
    const base = profilefororigin(profile!, "https://example.com");
    expect(base).toEqual({ signals: ["load"], idle: 400, timeout: 5000 });
    const slow = profilefororigin(profile!, "https://slow.example");
    expect(slow).toEqual({ signals: ["load", "networkidle"], idle: 2000, timeout: 5000 });
    expect(parsewaitprofile({ id: "p2", kind: "navprofile", summary: "No profile.", risk: "sensitive" })).toBeNull();
  });

  it("evaluates wait load signals against the profile thresholds", () => {
    const samples = [
      { at: 0, signals: ["domcontentloaded"] },
      { at: 120, signals: ["domcontentloaded", "load"] },
      { at: 400, signals: ["domcontentloaded", "load", "networkidle"] },
    ];
    expect(evaluatesignals(["load"], samples, 1000)).toMatchObject({
      ok: true,
      satisfied: ["load"],
      waited: 400,
      samples: 3,
    });
    expect(evaluatesignals(["load", "networkidle"], samples, 1000).ok).toBe(true);
    expect(evaluatesignals(["load"], samples.slice(0, 1), 500)).toMatchObject({ ok: false, waited: 0 });
    expect(evaluatesignals(["load", "networkidle"], samples.slice(0, 2), 90)).toMatchObject({
      ok: false,
      satisfied: ["load"],
      waited: 120,
    });
    expect(loadphase("loading")).toBe("loading");
    expect(loadphase("interactive")).toBe("interactive");
    expect(loadphase("complete")).toBe("complete");
  });

  it("matches urls against every urlpattern mode with query and fragment parts", () => {
    expect(urlmatches("https://example.com/report?page=3", { mode: "prefix", url: "https://example.com/report" })).toBe(
      true,
    );
    expect(urlmatches("https://example.com/other?page=3", { mode: "prefix", url: "https://example.com/report" })).toBe(
      false,
    );
    expect(
      urlmatches("https://example.com/report?page=3", { mode: "exact", url: "https://example.com/report?page=3" }),
    ).toBe(true);
    expect(
      urlmatches("https://example.com/report?page=4", { mode: "exact", url: "https://example.com/report?page=3" }),
    ).toBe(false);
    expect(urlmatches("https://example.com/other", { mode: "host", url: "https://example.com/anything" })).toBe(true);
    expect(urlmatches("https://other.example/x", { mode: "host", url: "https://example.com/anything" })).toBe(false);
    expect(
      urlmatches("https://example.com/shop/item/42", { mode: "pattern", url: "https://example.com/shop/*/*" }),
    ).toBe(true);
    expect(
      urlmatches("https://example.com/shop/item/42/reviews", { mode: "pattern", url: "https://example.com/shop/*/*" }),
    ).toBe(false);
    expect(
      urlmatches("https://example.com/shop/item/42/reviews", { mode: "pattern", url: "https://example.com/shop/**" }),
    ).toBe(true);
    expect(
      urlmatches("https://example.com/search?q=devthink", {
        mode: "host",
        url: "https://example.com",
        query: { q: "devthink" },
      }),
    ).toBe(true);
    expect(
      urlmatches("https://example.com/search?q=other", {
        mode: "host",
        url: "https://example.com",
        query: { q: "devthink" },
      }),
    ).toBe(false);
    expect(
      urlmatches("https://example.com/search?q=anything", {
        mode: "host",
        url: "https://example.com",
        query: { q: "*" },
      }),
    ).toBe(true);
    expect(
      urlmatches("https://example.com/search?q=anything", {
        mode: "host",
        url: "https://example.com",
        query: { page: "2" },
      }),
    ).toBe(false);
    expect(
      urlmatches("https://example.com/docs#faq", { mode: "prefix", url: "https://example.com/docs", fragment: "faq" }),
    ).toBe(true);
    expect(
      urlmatches("https://example.com/docs#top", { mode: "prefix", url: "https://example.com/docs", fragment: "faq" }),
    ).toBe(false);
  });

  it("rewrites query parameters and applies fragments", () => {
    const outcome = rewritequeryurl(
      "https://example.com/search?q=devthink&page=2&session=abc",
      { page: "3", sort: "price" },
      ["session"],
    );
    expect(outcome.url).toBe("https://example.com/search?q=devthink&page=3&sort=price");
    expect(outcome.before).toMatchObject({ q: "devthink", page: "2", session: "abc" });
    expect(outcome.after).toMatchObject({ q: "devthink", page: "3", sort: "price" });
    expect(outcome.after.session).toBeUndefined();
    expect(outcome.set).toEqual(["page", "sort"]);
    expect(outcome.removed).toEqual(["session"]);
    expect(fragmenturl("https://example.com/docs", "faq")).toBe("https://example.com/docs#faq");
    expect(fragmenturl("https://example.com/docs#top", "#faq")).toBe("https://example.com/docs#faq");
  });

  it("matches links by visible text and href fragment, refusing ambiguity", () => {
    const links = [
      { text: "Read the docs", href: "https://example.com/docs", selector: "a:nth-of-type(1)" },
      { text: "read the docs", href: "https://example.com/docs/duplicate", selector: "a:nth-of-type(2)" },
      { text: "Pricing", href: "https://example.com/pricing#faq", selector: "#pricing" },
      { text: "Contact", href: "https://example.com/contact#sales", selector: "#contact" },
    ];
    expect(matchlinktext(links, "Pricing")).toHaveLength(1);
    expect(matchlinktext(links, "pricing")).toHaveLength(1);
    expect(matchlinktext(links, "read the docs")).toHaveLength(2);
    expect(matchlinktext(links, "Missing")).toHaveLength(0);
    expect(matchlinkfragment(links, "faq")).toEqual([links[2]]);
    expect(matchlinkfragment(links, "sales")).toEqual([links[3]]);
    expect(matchlinkfragment(links, "missing")).toHaveLength(0);
  });

  it("builds deep links into common web apps and refuses unknown patterns", () => {
    expect(deeplinkurl("github", { owner: "wenathlan", repo: "extension" })).toBe(
      "https://github.com/wenathlan/extension",
    );
    expect(deeplinkurl("github", { owner: "wenathlan", repo: "extension", path: "/issues" })).toBe(
      "https://github.com/wenathlan/extension/issues",
    );
    expect(deeplinkurl("youtube", { id: "abc123" })).toBe("https://www.youtube.com/watch?v=abc123");
    expect(deeplinkurl("youtube", { search: "devthink extension" })).toBe(
      "https://www.youtube.com/results?search_query=devthink%20extension",
    );
    expect(deeplinkurl("maps", { query: "central park" })).toBe("https://www.google.com/maps/search/central%20park");
    expect(deeplinkurl("wikipedia", { title: "Web browser" })).toBe("https://en.wikipedia.org/wiki/Web_browser");
    expect(deeplinkurl("wikipedia", { title: "Navegador", language: "pt" })).toBe(
      "https://pt.wikipedia.org/wiki/Navegador",
    );
    expect(deeplinkurl("amazon", { search: "mechanical keyboard" })).toBe(
      "https://www.amazon.com/s?k=mechanical%20keyboard",
    );
    expect(deeplinkurl("x", { user: "@devthink" })).toBe("https://x.com/devthink");
    expect(deeplinkurl("github", { owner: "wenathlan" })).toBeNull();
    expect(deeplinkurl("unknownapp", { id: "1" })).toBeNull();
  });

  it("detects spa route changes and picks recent closed tabs", () => {
    expect(spauroutechanged("https://example.com/settings", "https://example.com/profile")).toBe(true);
    expect(spauroutechanged("https://example.com/settings", "https://example.com/settings")).toBe(false);
    expect(spauroutechanged("https://example.com/settings", "https://other.example/profile")).toBe(false);
    const recents = [
      { url: "https://example.com/a", tabid: 4, closedat: 30 },
      { url: "https://example.com/b", tabid: 5, closedat: 20 },
      { url: "https://example.com/c", tabid: 6, closedat: 10 },
    ];
    expect(pickrecenttab(recents, [])?.url).toBe("https://example.com/a");
    expect(pickrecenttab(recents, ["https://example.com/a"])?.url).toBe("https://example.com/b");
    expect(
      pickrecenttab(recents, ["https://example.com/a", "https://example.com/b", "https://example.com/c"]),
    ).toBeNull();
  });

  it("assembles redirect chains from navigation watch fixtures with statuses and timing", () => {
    const events: navwatchevent[] = [
      { event: "beforenavigate", url: "https://example.com/start", timestamp: 100 },
      { event: "urlchange", url: "https://example.com/hop1", timestamp: 120, status: 302, redirect: true },
      { event: "urlchange", url: "https://example.com/hop2", timestamp: 150, status: 302, redirect: true },
      { event: "completed", url: "https://example.com/final", timestamp: 200, status: 200 },
    ];
    const chain = buildredirectchain(events);
    expect(chain.hops.map((hop) => hop.url)).toEqual([
      "https://example.com/start",
      "https://example.com/hop1",
      "https://example.com/hop2",
      "https://example.com/final",
    ]);
    expect(chain.hops.map((hop) => hop.status)).toEqual([0, 302, 302, 200]);
    expect(chain.startedat).toBe(100);
    expect(chain.endedat).toBe(200);
    expect(finalurl(chain)).toBe("https://example.com/final");
    expect(redirectcount(chain)).toBe(3);
    const direct = buildredirectchain([
      { event: "beforenavigate", url: "https://example.com/a", timestamp: 10 },
      { event: "completed", url: "https://example.com/a", timestamp: 40, status: 200 },
    ]);
    expect(direct.hops).toHaveLength(1);
    expect(redirectcount(direct)).toBe(0);
    expect(buildredirectchain([])).toEqual({ hops: [], startedat: 0, endedat: 0 });
  });

  it("classifies navigation changes into loads, spa routes and reloads", () => {
    expect(classifynavchange("https://example.com/a", "https://example.com/b", "loading")).toBe("load");
    expect(classifynavchange("https://example.com/a", "https://example.com/b", undefined)).toBe("route");
    expect(classifynavchange("https://example.com/a", "https://other.example/b", undefined)).toBe("load");
    expect(classifynavchange("https://example.com/a", "https://example.com/a", "loading")).toBe("reload");
    expect(classifynavchange("https://example.com/a", "https://example.com/a", undefined)).toBe("none");
  });

  it("detects http errors, offline and certificate interstitials without ever bypassing them", () => {
    expect(detecthttpstate({ offline: false, errors: [], statuses: [200] })).toMatchObject({
      httperror: false,
      offline: false,
      certificate: false,
      reasons: [],
    });
    const offline = detecthttpstate({ offline: true, errors: ["net::ERR_INTERNET_DISCONNECTED"] });
    expect(offline.offline).toBe(true);
    expect(offline.httperror).toBe(true);
    expect(offline.reasons.join(" ")).toContain("offline");
    const certificate = detecthttpstate({ offline: false, errors: ["net::ERR_CERT_AUTHORITY_INVALID"] });
    expect(certificate.certificate).toBe(true);
    expect(interstitialpolicy(certificate)).toMatchObject({ interstitial: true, bypass: false });
    expect(interstitialpolicy(certificate).guidance).toContain("never bypasses");
    const httperror = detecthttpstate({ offline: false, statuses: [404, 503] });
    expect(httperror.httperror).toBe(true);
    expect(httperror.reasons).toEqual(["http status 404", "http status 503"]);
    expect(interstitialpolicy(httperror).interstitial).toBe(true);
    expect(interstitialpolicy(detecthttpstate({ offline: false })).interstitial).toBe(false);
  });

  it("applies per domain rate limit windows with user configured ceilings", () => {
    const limit = { domain: "example.com", window: 60000, ceiling: 2 };
    let state = ratewindow(undefined, limit, 1000);
    expect(state).toEqual({ domain: "example.com", limit, openedat: 1000, count: 0 });
    expect(rateallows(state, 1100)).toMatchObject({ allowed: true, remaining: 2, retryafter: 59900 });
    state = recordratehit(state, 1200);
    expect(state.count).toBe(1);
    state = recordratehit(state, 1300);
    expect(state.count).toBe(2);
    const refused = rateallows(state, 1400);
    expect(refused.allowed).toBe(false);
    expect(refused.remaining).toBe(0);
    expect(refused.retryafter).toBe(59800);
    const expired = ratewindow(state, limit, 63500);
    expect(expired.count).toBe(0);
    expect(expired.openedat).toBe(63500);
    expect(rateallows(expired, 63600).allowed).toBe(true);
    const refreshed = ratewindow(state, { ...limit, ceiling: 5 }, 1400);
    expect(refreshed.count).toBe(0);
    const step: toolstep = {
      id: "r1",
      kind: "navrate",
      summary: "Apply the limit.",
      risk: "sensitive",
      options: '{"ratelimit":{"domain":"example.com","window":60000,"ceiling":2}}',
    };
    expect(parseratelimit(step)).toEqual(limit);
    expect(parseratelimit({ id: "r2", kind: "navrate", summary: "No limit.", risk: "sensitive" })).toBeNull();
    expect(
      parseratelimit({
        id: "r3",
        kind: "navrate",
        summary: "Broken limit.",
        risk: "sensitive",
        options: '{"ratelimit":{"window":0,"ceiling":2}}',
      }),
    ).toBeNull();
    expect(domainof("https://api.example.com/v1")).toBe("api.example.com");
    expect(domainof("not a url")).toBe("");
  });

  it("verifies url safety and refuses batch opening on unsafe urls", () => {
    expect(checksafe("https://partner.example/report")).toMatchObject({ safe: true, reasons: [] });
    expect(checksafe("http://partner.example/report").safe).toBe(false);
    expect(checksafe("https://user:pass@partner.example/report").reasons).toContain(
      "the url carries embedded credentials",
    );
    expect(checksafe("https://localhost/admin").safe).toBe(false);
    expect(checksafe("https://127.0.0.1/admin").safe).toBe(false);
    expect(checksafe("https://192.168.0.10/admin").safe).toBe(false);
    expect(checksafe("https://10.0.0.5/admin").safe).toBe(false);
    expect(checksafe("https://93.184.216.34/report").reasons.join(" ")).toContain("raw address");
    expect(checksafe("not a url").safe).toBe(false);
    const curated = curatelinks(["https://a.example/1", "https://localhost/x", "https://b.example/2"], (url) =>
      checksafe(url),
    );
    expect(curated.map((link) => link.verdict)).toEqual(["safe", "unsafe", "safe"]);
    const batch = batchopenset(curated);
    expect(batch.open).toEqual(["https://a.example/1", "https://b.example/2"]);
    expect(batch.refused).toEqual([
      { url: "https://localhost/x", reasons: ["the host localhost is a private network target"] },
    ]);
    const allsafe = batchopenset(curatelinks(["https://a.example/1"], (url) => checksafe(url)));
    expect(allsafe.refused).toEqual([]);
  });

  it("verifies prefetch candidates against the session grants and dedupes preconnect origins", () => {
    const grants = ["https://example.com", "https://partner.example"];
    const verdict = prefetchcandidates(
      ["https://example.com/a", "https://stranger.example/b", "https://partner.example/c"],
      grants,
    );
    expect(verdict.allowed).toEqual(["https://example.com/a", "https://partner.example/c"]);
    expect(verdict.refused).toEqual(["https://stranger.example/b"]);
    expect(prefetchcandidates(["https://stranger.example/b"], grants).allowed).toEqual([]);
    expect(preconnectorigins(["https://cdn.example", " https://cdn.example ", "https://api.example", ""])).toEqual([
      "https://cdn.example",
      "https://api.example",
    ]);
  });

  it("gates basic auth answers behind stored reviewed credentials", () => {
    const auths = [
      { origin: "https://example.com", username: "devthink", password: "secret", reviewedat: 10 },
      { origin: "https://other.example", username: "other", password: "pass", reviewedat: 20 },
    ];
    expect(authfor(auths, "https://example.com/protected")?.username).toBe("devthink");
    expect(authfor(auths, "https://example.com")?.username).toBe("devthink");
    expect(authfor(auths, "https://stranger.example")).toBeUndefined();
    expect(authfor(auths, "not a url")).toBeUndefined();
  });

  it("parses navigation targets from step options", () => {
    const step: toolstep = {
      id: "t1",
      kind: "openlink",
      summary: "Open the url.",
      risk: "sensitive",
      options: '{"navtarget":{"url":"https://example.com/report","container":"window","position":"end"}}',
    };
    expect(parsenavtarget(step)).toEqual({
      url: "https://example.com/report",
      container: "window",
      position: "end",
      private: false,
    });
    expect(
      parsenavtarget({ ...step, options: '{"navtarget":{"url":"https://example.com/report","container":"private"}}' }),
    ).toMatchObject({ container: "private", private: true });
    expect(parsenavtarget({ id: "t2", kind: "openlink", summary: "No target.", risk: "sensitive" })).toBeNull();
    expect(
      parsenavtarget({
        id: "t3",
        kind: "openlink",
        summary: "Broken target.",
        risk: "sensitive",
        options: '{"navtarget":"https://example.com"}',
      }),
    ).toBeNull();
  });
});

describe("tabs and windows command", () => {
  function tab(overrides: Partial<tabshape> = {}): tabshape {
    return {
      tabid: 1,
      url: "https://example.com/a",
      title: "Example A",
      index: 0,
      windowid: 10,
      active: true,
      pinned: false,
      audible: false,
      muted: false,
      discarded: false,
      ...overrides,
    };
  }
  function windowfixture(overrides: Partial<windowshape> = {}): windowshape {
    return {
      windowid: 10,
      left: 0,
      top: 0,
      width: 1280,
      height: 800,
      state: "normal",
      incognito: false,
      focused: true,
      ...overrides,
    };
  }

  it("resolves querytabs matchers against the live tab set with wildcard patterns", () => {
    const tabs = [
      tab(),
      tab({ tabid: 2, url: "https://example.com/docs/guide", title: "Docs Guide", index: 1, active: false }),
      tab({
        tabid: 3,
        url: "https://partner.example/report",
        title: "Partner Report",
        index: 2,
        windowid: 11,
        active: false,
      }),
    ];
    expect(querymatches({ url: "https://example.com/a" }, tabs).map((item) => item.tabid)).toEqual([1]);
    expect(querymatches({ title: "report" }, tabs).map((item) => item.tabid)).toEqual([3]);
    expect(querymatches({ id: 2 }, tabs).map((item) => item.tabid)).toEqual([2]);
    expect(querymatches({ pattern: "https://example.com/**" }, tabs).map((item) => item.tabid)).toEqual([1, 2]);
    expect(querymatches({ pattern: "https://example.com/*" }, tabs).map((item) => item.tabid)).toEqual([1]);
    expect(querymatches({ url: "https://example.com/a", title: "partner" }, tabs)).toEqual([]);
    expect(
      parsetabquery({
        id: "q1",
        kind: "querytabs",
        summary: "Query tabs.",
        risk: "read",
        options: '{"tabquery":{"pattern":"https://example.com/**"}}',
      }),
    ).toEqual({ pattern: "https://example.com/**" });
    expect(parsetabquery({ id: "q2", kind: "querytabs", summary: "Query tabs.", risk: "read" })).toBeNull();
  });

  it("detects clone tabs by normalized url comparison", () => {
    const tabs = [
      tab({ tabid: 1, url: "https://example.com/report" }),
      tab({ tabid: 2, url: "https://example.com/report/#section" }),
      tab({ tabid: 3, url: "https://example.com/report/" }),
      tab({ tabid: 4, url: "https://example.com/other" }),
    ];
    const clones = clonetabs(tabs);
    expect(clones).toHaveLength(1);
    expect(clones[0]).toMatchObject({ url: "https://example.com/report", tabids: [1, 2, 3] });
    expect(normalizedtaburl("https://example.com/a/#x/")).toBe("https://example.com/a");
    expect(clonetabs([tab()])).toEqual([]);
  });

  it("searches open tabs by title and url and lists audio tabs", () => {
    const tabs = [
      tab({ tabid: 1, title: "Quarterly Report" }),
      tab({ tabid: 2, url: "https://music.example/playlist", title: "Playlist", audible: true, active: false }),
      tab({
        tabid: 3,
        url: "https://podcast.example/episode",
        title: "Episode",
        muted: true,
        audible: true,
        active: false,
      }),
    ];
    expect(searchtabmatches(tabs, "report").map((item) => item.tabid)).toEqual([1]);
    expect(searchtabmatches(tabs, "MUSIC").map((item) => item.tabid)).toEqual([2]);
    expect(searchtabmatches(tabs, "  ")).toEqual([]);
    expect(audiotabs(tabs).map((item) => item.tabid)).toEqual([2, 3]);
  });

  it("keeps tabgroup membership through movetab and movetabwindow and renames groups", () => {
    const groups = [
      { groupid: "g1", name: "research", color: "blue", tabids: [1, 2, 3], collapsed: false, savedat: 10 },
    ];
    const moved = [
      tab({ tabid: 3, index: 0, active: false }),
      tab({ tabid: 1, index: 1, active: false }),
      tab({ tabid: 4, index: 2 }),
      tab({ tabid: 2, index: 3, windowid: 11, active: false }),
    ];
    const regrouped = regroupaftermoves(groups, moved, 20);
    expect(regrouped[0]?.tabids).toEqual([3, 1, 2]);
    expect(regrouped[0]).toMatchObject({ name: "research", color: "blue", savedat: 20 });
    const renamed = renamegroup(regrouped, "research", "deep research", 30);
    expect(renamed[0]).toMatchObject({ name: "deep research", tabids: [3, 1, 2] });
    const emptied = regroupaftermoves(
      [{ groupid: "g2", name: "gone", color: "red", tabids: [9], collapsed: false, savedat: 1 }],
      moved,
      40,
    );
    expect(emptied[0]?.tabids).toEqual([9]);
  });

  it("saves and restores tab layouts with window bounds and group states", () => {
    const tabs = [
      tab({ tabid: 1 }),
      tab({ tabid: 2, url: "https://example.com/b", title: "B", index: 1, pinned: true, active: false }),
    ];
    const windows = [
      windowfixture(),
      windowfixture({
        windowid: 11,
        left: 40,
        top: 60,
        width: 900,
        height: 600,
        state: "maximized",
        incognito: true,
        focused: false,
      }),
    ];
    const groups = [
      { groupid: "g1", name: "research", color: "blue", tabids: [1, 2, 9], collapsed: true, savedat: 10 },
    ];
    const layout = buildlayout("work", tabs, windows, groups, [11], 100);
    expect(layout).toMatchObject({ name: "work", savedat: 100 });
    expect(layout.tabs[1]).toMatchObject({ url: "https://example.com/b", pinned: true, index: 1, windowid: 10 });
    expect(layout.groups[0]?.tabids).toEqual([1, 2]);
    expect(layout.windows[1]?.state).toMatchObject({
      bounds: { left: 40, top: 60, width: 900, height: 600 },
      maximized: true,
      profile: "incognito",
    });
    expect(layout.windows[0]?.state.profile).toBe("normal");
    expect(layoutrestoreplan(layout, ["https://example.com/a"])).toEqual(["https://example.com/b"]);
    expect(layoutrestoreplan(layout, [])).toEqual(["https://example.com/a", "https://example.com/b"]);
  });

  it("dispatches watchtab events into the step result with reviewed event filters", () => {
    const events = [
      { watchid: "w1", event: "title" as const, tabid: 1, detail: "New title", at: 1 },
      { watchid: "w2", event: "title" as const, tabid: 2, detail: "Other watch", at: 2 },
      { watchid: "w1", event: "activated" as const, tabid: 1, at: 3 },
      { watchid: "w1", event: "closed" as const, tabid: 3, at: 4 },
    ];
    expect(watchtabdispatch(events, "w1", [])).toHaveLength(3);
    expect(watchtabdispatch(events, "w1", ["title"])).toEqual([events[0]]);
    expect(watchtabdispatch(events, "w2", [])).toEqual([events[1]]);
    expect(watchtabdispatch([], "w1", [])).toEqual([]);
  });

  it("discards inactive tabs and restores them without losing their urls", () => {
    const tabs = [
      tab({ tabid: 1, active: true }),
      tab({ tabid: 2, active: false }),
      tab({ tabid: 3, active: false, pinned: true }),
      tab({ tabid: 4, active: false, discarded: true, url: "https://example.com/discarded" }),
    ];
    expect(discardcandidates(tabs).map((item) => item.tabid)).toEqual([2]);
    expect(restorediscarded(tabs)).toEqual([{ tabid: 4, url: "https://example.com/discarded" }]);
  });

  it("separates incognito windows from session grant inheritance and computes window close blockers", () => {
    expect(windowprofilegrants("normal")).toBe(true);
    expect(windowprofilegrants("scratch")).toBe(true);
    expect(windowprofilegrants("incognito")).toBe(false);
    const tabs = [
      tab({ tabid: 1, windowid: 10 }),
      tab({ tabid: 2, windowid: 10, active: false }),
      tab({ tabid: 3, windowid: 11, active: false }),
    ];
    expect(tasktabsinwindow(tabs, 10, [1, 2])).toBe(2);
    expect(tasktabsinwindow(tabs, 11, [1, 2])).toBe(0);
  });

  it("updates badges from the live progress state of each task", () => {
    expect(badgefromprogress(3, 5)).toEqual({ label: "3/5", done: false });
    expect(badgefromprogress(5, 5)).toEqual({ label: "done", done: true });
    expect(badgefromprogress(0, 0)).toEqual({ label: "idle", done: false });
  });

  it("captures session snapshots and reopens the tabs of a previous run", () => {
    const tabs = [
      tab({ tabid: 1 }),
      tab({ tabid: 2, url: "https://example.com/b", title: "B", index: 1, active: false }),
    ];
    const layout = buildlayout("run", tabs, [windowfixture()], [], [], 100);
    const snapshot = { id: "snap", sessionid: "run-1", layout, capturedat: 100 };
    expect(layoutrestoreplan(snapshot.layout, ["https://stranger.example/open"])).toEqual([
      "https://example.com/a",
      "https://example.com/b",
    ]);
    expect(layoutrestoreplan(snapshot.layout, ["https://example.com/a"])).toEqual(["https://example.com/b"]);
  });

  it("validates the tabcreate background and window options and the windowcreate bounds grammar", () => {
    const gate = (step: toolstep): { allowed: boolean; reason?: string } => validatestep(step, "https://example.com");
    expect(
      gate({
        id: "c1",
        kind: "tabcreate",
        value: "https://example.com/a",
        summary: "Open in background.",
        risk: "sensitive",
        options: '{"background":true,"window":11}',
      }),
    ).toEqual({ allowed: true });
    expect(
      gate({
        id: "c2",
        kind: "tabcreate",
        value: "https://example.com/a",
        summary: "Bad background flag.",
        risk: "sensitive",
        options: '{"background":"yes"}',
      }),
    ).toMatchObject({ allowed: false, reason: "The reviewed background flag must be a boolean." });
    expect(
      gate({
        id: "c3",
        kind: "tabcreate",
        value: "https://example.com/a",
        summary: "Bad window id.",
        risk: "sensitive",
        options: '{"window":"eleven"}',
      }),
    ).toMatchObject({ allowed: false, reason: "The reviewed target window id must be a non-negative integer." });
    expect(
      gate({
        id: "c4",
        kind: "windowcreate",
        value: "https://example.com/a",
        summary: "Open a placed window.",
        risk: "sensitive",
        options: '{"left":10,"top":20,"width":800,"height":600,"state":"maximized"}',
      }),
    ).toEqual({ allowed: true });
    expect(
      gate({
        id: "c5",
        kind: "windowcreate",
        value: "https://example.com/a",
        summary: "Bad state.",
        risk: "sensitive",
        options: '{"state":"tile"}',
      }),
    ).toMatchObject({
      allowed: false,
      reason: "The reviewed window state must be normal, maximized, minimized or fullscreen.",
    });
  });

  it("matches closepattern targets and refuses the session tab and unreviewed patterns", () => {
    const tabs = [
      tab({ tabid: 4 }),
      tab({ tabid: 5, url: "https://example.com/a/", title: "Example A", index: 1, active: false }),
      tab({ tabid: 6, url: "https://partner.example/x", title: "Partner", index: 2, active: false }),
    ];
    const selection = closeselection({ pattern: "https://example.com/**" }, tabs, 4);
    expect(selection.targets.map((item) => item.tabid)).toEqual([5]);
    expect(selection.refused.map((item) => item.tabid)).toEqual([4]);
    const gate = (step: toolstep): { allowed: boolean; reason?: string } => validatestep(step, "https://example.com");
    expect(
      gate({
        id: "p1",
        kind: "closepattern",
        summary: "Close without review.",
        risk: "sensitive",
        options: '{"tabquery":{"pattern":"https://example.com/**"}}',
      }),
    ).toMatchObject({
      allowed: false,
      reason: "The close pattern needs the explicit reviewed flag before any tab closes.",
    });
    expect(
      gate({
        id: "p2",
        kind: "closepattern",
        summary: "Close reviewed.",
        risk: "sensitive",
        options: '{"tabquery":{"pattern":"https://example.com/**"},"reviewed":true}',
      }),
    ).toEqual({ allowed: true });
    expect(
      gate({
        id: "p3",
        kind: "closepattern",
        summary: "Close without a matcher.",
        risk: "sensitive",
        options: '{"reviewed":true}',
      }),
    ).toMatchObject({
      allowed: false,
      reason: "A reviewed tabquery with at least one matcher is required in options.",
    });
  });

  it("computes switchtab neighbors with wraparound and zoom steps without crossing zero", () => {
    const tabs = [
      tab({ tabid: 1, index: 0, active: false }),
      tab({ tabid: 2, index: 1, active: true }),
      tab({ tabid: 3, index: 2, active: false }),
    ];
    expect(switchtarget(tabs, "next", 1)).toBe(2);
    expect(switchtarget(tabs, "previous", 0)).toBe(2);
    expect(switchtarget([], "next", 0)).toBeUndefined();
    expect(zoomstep(1, "in", 0.25)).toBe(1.25);
    expect(zoomstep(1.5, "out", 2)).toBe(1.5);
    expect(zoomstep(1, "out", 0.75)).toBe(0.25);
  });

  it("orders the quick switcher by recency with filter keys", () => {
    const tabs = [
      tab({ tabid: 1, title: "Docs", index: 0, active: false }),
      tab({ tabid: 2, title: "Music", url: "https://music.example/p", index: 1, active: false }),
      tab({ tabid: 3, title: "Report", index: 2, active: false }),
    ];
    const recency = [
      { tabid: 3, at: 30 },
      { tabid: 1, at: 10 },
    ];
    expect(switcherlist(tabs, recency, "").map((item) => item.tabid)).toEqual([3, 1, 2]);
    expect(switcherlist(tabs, recency, "music").map((item) => item.tabid)).toEqual([2]);
    expect(switcherlist(tabs, recency, "missing")).toEqual([]);
  });

  it("grades the concurrent task tab budget as a user choice with no hardcoded cap", () => {
    expect(tasktabgauge(3, undefined)).toEqual({ used: 3, ceiling: undefined, over: false });
    expect(tasktabgauge(3, 5)).toEqual({ used: 3, ceiling: 5, over: false });
    expect(tasktabgauge(6, 5)).toEqual({ used: 6, ceiling: 5, over: true });
    expect(tasktabgauge(100000, undefined).over).toBe(false);
  });

  it("routes tabmeta task refs into the plan progress task tabs", () => {
    const first = assigntasktabs(undefined, "plan", [4, 5], 10);
    expect(first.tasktabs).toEqual([4, 5]);
    const deduped = assigntasktabs(first, "plan", [4], 20);
    expect(deduped.tasktabs).toEqual([4, 5]);
    expect(trackedtasktabs(deduped, "plan")).toEqual([4, 5]);
    expect(trackedtasktabs(deduped, "other")).toEqual([]);
  });
});

describe("forms and data", () => {
  function field(overrides: Partial<fieldshape> = {}): fieldshape {
    return {
      selector: "#name",
      tag: "input",
      type: "text",
      name: "fullname",
      label: "Full name",
      placeholder: "Your name",
      arialabel: "Name field",
      autocomplete: "name",
      ...overrides,
    };
  }

  it("resolves controls by label, placeholder, aria label and name attributes", () => {
    const fields = [
      field(),
      field({
        selector: "#email",
        name: "email",
        label: "Email address",
        placeholder: "you@example.org",
        arialabel: "Email field",
        autocomplete: "email",
      }),
    ];
    expect(matchfield(fields, { mode: "label", label: "full name" }).map((item) => item.selector)).toEqual(["#name"]);
    expect(matchfield(fields, { mode: "label", label: "name" }).map((item) => item.selector)).toEqual(["#name"]);
    expect(matchfield(fields, { mode: "name", name: "email" }).map((item) => item.selector)).toEqual(["#email"]);
    expect(
      matchfield(fields, { mode: "placeholder", placeholder: "you@example" }).map((item) => item.selector),
    ).toEqual(["#email"]);
    expect(
      matchfield(fields, { mode: "placeholder", placeholder: "Email field" }).map((item) => item.selector),
    ).toEqual(["#email"]);
    expect(matchfield(fields, { mode: "arialabel", arialabel: "name field" }).map((item) => item.selector)).toEqual([
      "#name",
    ]);
    expect(matchfield(fields, { mode: "arialabel", arialabel: "Your name" }).map((item) => item.selector)).toEqual([
      "#name",
    ]);
    expect(matchfield(fields, { mode: "label", label: "missing" })).toEqual([]);
    expect(matchfield(fields, { mode: "label", label: "" })).toEqual([]);
  });

  it("infers field kinds from input type, autocomplete and label text", () => {
    expect(classifyfield({ type: "email", autocomplete: "", label: "" })).toBe("email");
    expect(classifyfield({ type: "text", autocomplete: "", label: "Work email" })).toBe("email");
    expect(classifyfield({ type: "tel", autocomplete: "tel", label: "" })).toBe("phone");
    expect(classifyfield({ type: "password", autocomplete: "", label: "" })).toBe("password");
    expect(classifyfield({ type: "text", autocomplete: "cc-number", label: "" })).toBe("card");
    expect(classifyfield({ type: "text", autocomplete: "one-time-code", label: "" })).toBe("code");
    expect(classifyfield({ type: "checkbox", autocomplete: "", label: "" })).toBe("check");
    expect(classifyfield({ type: "radio", autocomplete: "", label: "" })).toBe("radio");
    expect(classifyfield({ type: "file", autocomplete: "", label: "" })).toBe("file");
    expect(classifyfield({ type: "select", autocomplete: "", label: "" })).toBe("select");
    expect(classifyfield({ type: "date", autocomplete: "", label: "" })).toBe("date");
    expect(classifyfield({ type: "number", autocomplete: "", label: "" })).toBe("number");
    expect(classifyfield({ type: "text", autocomplete: "", label: "Card number" })).toBe("card");
    expect(classifyfield({ type: "text", autocomplete: "", label: "First name" })).toBe("text");
  });

  it("generates seeded locale aware values per field kind", () => {
    const first = generatevalue("email", { locale: "en", seed: 7 });
    expect(first).toMatch(/@example\.com$/);
    expect(generatevalue("email", { locale: "en", seed: 7 })).toBe(first);
    expect(generatevalue("email", { locale: "en", seed: 8 })).not.toBe(first);
    expect(generatevalue("text", { locale: "pt", seed: 7 })).toMatch(/^\S+ \S+$/);
    expect(generatevalue("phone", { locale: "en", seed: 7 })).toMatch(/^\+1 \(555\) 010-\d{4}$/);
    expect(generatevalue("phone", { locale: "pt-BR", seed: 7 })).toMatch(/^\+55 \(11\) 9\d{4}-\d{4}$/);
    expect(generatevalue("card", { locale: "en", seed: 7 })).toMatch(/^4111 \d{4} \d{4} \d{4}$/);
    expect(generatedvalueallowed(generatevalue("card", { seed: 9 })).allowed).toBe(true);
    expect(generatevalue("code", { seed: 7 })).toMatch(/^\d{6}$/);
    expect(generatevalue("date", { seed: 7 })).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(generatevalue("check", { seed: 7 })).toMatch(/^(true|false)$/);
    expect(generatevalue("file", { seed: 7 })).toMatch(/^sample\d{2}\.pdf$/);
    expect(generatevalue("number", { seed: 7 })).toMatch(/^\d+$/);
    expect(generatevalue("select", { seed: 7 })).toMatch(/^option [1-5]$/);
    expect(generatevalue("radio", { seed: 7 })).toMatch(/^choice [1-4]$/);
    expect(generatevalue("password", { seed: 7 })).toMatch(/^pw-\d{6}-/);
  });

  it("resolves form record entries, skipping honeypots and refusing unmatched or ambiguous entries", () => {
    const fields = [field(), field({ selector: "#email", name: "email", label: "Email address" })];
    const record = parseformrecord({
      form: "#form",
      entries: [
        { match: { mode: "label", label: "Full name" }, kind: "text", value: "Ana Alves" },
        { match: { mode: "name", name: "email" }, kind: "email", value: "ana@example.com" },
        { match: { mode: "label", label: "Missing" }, kind: "text", value: "x" },
      ],
    });
    expect(record?.form).toBe("#form");
    expect(record?.entries).toHaveLength(3);
    const operations = filloperations(record as formrecord, fields);
    expect(operations[0]?.matched?.selector).toBe("#name");
    expect(operations[0]?.reason).toBeUndefined();
    expect(operations[1]?.matched?.selector).toBe("#email");
    expect(operations[2]?.matched).toBeUndefined();
    expect(operations[2]?.reason).toBe("unmatched");
    const ambiguousfields = [field(), field({ selector: "#billing", name: "fullname", label: "Billing full name" })];
    expect(filloperations(record as formrecord, ambiguousfields)[0]?.reason).toBe("ambiguous");
    const skipped = filloperations(record as formrecord, fields, ["#name"]);
    expect(skipped[0]?.skipped).toBe(true);
    expect(skipped[0]?.matched?.selector).toBe("#name");
    expect(parseformrecord({ entries: [] })).toBeNull();
    expect(parseformrecord("broken")).toBeNull();
    const pairs = pairentries([{ label: "Full name", value: "Ana Alves" }], "label");
    expect(pairs.entries[0]?.match).toEqual({ mode: "label", label: "Full name" });
    const placeholderpairs = pairentries([{ placeholder: "you@example.org", value: "ana@example.com" }], "placeholder");
    expect(placeholderpairs.entries[0]?.match).toEqual({ mode: "placeholder", placeholder: "you@example.org" });
    expect(valueshash([{ label: "Full name", value: "Ana" }])).toBe(valueshash([{ label: "Full name", value: "Ana" }]));
    expect(valueshash([{ label: "Full name", value: "Ana" }])).not.toBe(
      valueshash([{ label: "Full name", value: "Bruno" }]),
    );
  });

  it("associates errors through describedby refs and sibling text, and plans retry backoff windows", () => {
    const contexts: errorcontext[] = [
      { ...field(), selector: "#email", describedby: "emailerror", siblings: [""] },
      { ...field(), selector: "#phone", siblings: ["Enter a valid phone number."] },
      { ...field(), selector: "#notes", siblings: [] },
    ];
    expect(associateerrors(contexts, [{ id: "emailerror", text: "Enter a valid email address." }])).toEqual([
      { field: "#email", message: "Enter a valid email address." },
      { field: "#phone", message: "Enter a valid phone number." },
    ]);
    const step: toolstep = {
      id: "r",
      kind: "retryform",
      target: "#checkout",
      summary: "Retry the submission.",
      risk: "sensitive",
      options: '{"backoff":{"wait":500,"factor":2},"attempts":4}',
    };
    expect(parsebackoff(step)).toEqual({ attempts: 4, wait: 500, factor: 2 });
    expect(backoffwaits(4, 500, 2)).toEqual([500, 1000, 2000]);
    expect(backoffwaits(1, 500, 2)).toEqual([]);
    expect(backoffwaits(3, 1000, 1)).toEqual([1000, 1000]);
    expect(parsebackoff({ ...step, options: "{}" })).toBeNull();
    expect(parsebackoff({ ...step, options: '{"backoff":{"wait":0,"factor":2}}' })).toBeNull();
  });

  it("advances wizards, waits for dependent options, picks typeahead entries and plans calendar navigation", () => {
    let state = { index: 0, steps: 3, completed: [] as boolean[], at: 1 };
    state = wizardadvance(state, true, 2);
    expect(state).toEqual({ index: 1, steps: 3, completed: [true], at: 2 });
    state = wizardadvance(state, false, 3);
    expect(state.index).toBe(2);
    expect(state.completed).toEqual([true, false]);
    const done = wizardadvance(state, true, 4);
    expect(done.index).toBe(3);
    expect(dependentloaded(3, 3)).toBe(false);
    expect(dependentloaded(3, 27)).toBe(true);
    const suggestions = ["São Paulo", "São Pedro", "Santos"];
    expect(typeaheadpick(suggestions, "são paulo")).toBe("São Paulo");
    expect(typeaheadpick(suggestions, "Rio de Janeiro")).toBeUndefined();
    expect(parsedateparts("2025-04-08")).toEqual({ year: 2025, month: 4, day: 8 });
    expect(parsedateparts("2025-13-08")).toBeNull();
    expect(parsedateparts("08/04/2025")).toBeNull();
    expect(calendarplan({ year: 2025, month: 3 }, { year: 2025, month: 4, day: 8 })).toEqual({ months: 1, day: 8 });
    expect(calendarplan({ year: 2025, month: 5 }, { year: 2024, month: 11, day: 1 })).toEqual({ months: -6, day: 1 });
  });

  it("resolves artifact attachments, splits card groups, masks segments and gates code sources", () => {
    const artifacts = [{ id: "a1", name: "report.pdf", kind: "printpdf" }];
    expect(attachplan("report.pdf", artifacts)).toEqual({
      artifact: { id: "a1", name: "report.pdf", kind: "printpdf" },
    });
    expect(attachplan("a1", artifacts)).toEqual({ artifact: { id: "a1", name: "report.pdf", kind: "printpdf" } });
    expect(attachplan("missing.pdf", artifacts)).toMatchObject({ reason: expect.stringContaining("run store") });
    expect(cardgroups("4111 1111 1111 1111")).toEqual(["4111", "1111", "1111", "1111"]);
    expect(cardgroups("4111-1111  1111")).toEqual(["4111", "1111", "1111"]);
    expect(cardmask("4111 1111 1111 1111")).toBe("••••••••••••1111");
    expect(cardmask("Ana Alves")).toBe("•••••••••");
    expect(codeready("reviewed", "123456")).toBe(true);
    expect(codeready("reviewed", " ")).toBe(false);
    expect(codeready("reviewed", undefined)).toBe(false);
    expect(codeready("clipboard", "123456")).toBe(false);
  });

  it("flags honeypots, detects logins and templates, and hands off captchas", () => {
    const surveys: fieldsurvey[] = [
      { ...field(), selector: "#trap1", hidden: true, offscreen: false },
      { ...field(), selector: "#trap2", hidden: false, offscreen: true },
      { ...field(), selector: "#trap3", hidden: false, offscreen: false, createdat: 500 },
      { ...field(), selector: "#live", hidden: false, offscreen: false },
    ];
    expect(detecthoneypots(surveys, 100)).toEqual([
      { selector: "#trap1", reason: "hidden" },
      { selector: "#trap2", reason: "offscreen" },
      { selector: "#trap3", reason: "timetrap" },
    ]);
    expect(detecthoneypots(surveys.slice(3), 100)).toEqual([]);
    const loginfields = [
      field({ selector: "#user", name: "username", label: "Username" }),
      field({ selector: "#pass", name: "password", label: "Password", type: "password" }),
    ];
    expect(detectlogin(loginfields, ["Sign in", "Forgot password?"])).toEqual({
      login: true,
      markers: ["password field", "identifier field", "session link"],
    });
    expect(detectlogin(loginfields, ["Home"])).toMatchObject({ login: false });
    expect(detectlogin([field()], ["Sign in"])).toMatchObject({ login: false });
    const checkout = [field({ selector: "#card", name: "cc", label: "Card number", autocomplete: "cc-number" })];
    expect(detecttemplate(checkout, "Complete the checkout and place order now")).toEqual({
      template: "checkout",
      markers: ["checkout", "card number", "place order"],
    });
    const signup = [field({ selector: "#confirm", name: "confirm", label: "Confirm password" })];
    expect(detecttemplate(signup, "create account and accept the terms of service")).toEqual({
      template: "signup",
      markers: ["create account", "confirm password", "terms"],
    });
    expect(detecttemplate([field()], "A plain page about cooking pasta")).toEqual({ template: "unknown", markers: [] });
    expect(captchadetected([])).toBe(false);
    expect(captchadetected(['iframe[src*="recaptcha"]'])).toBe(true);
  });
});

/** Fixture cell factory so every table reader test runs without a live dom. */
function cell(text: string, overrides: Partial<cellshape> = {}): cellshape {
  return { text, header: false, rowspan: 1, colspan: 1, ...overrides };
}

/** Fixture row factory with a header flag. */
function row(cells: cellshape[], header = false): rowshape {
  return { cells, header };
}

describe("pagedata table reading", () => {
  it("normalizes headers into stable slugified column keys with unique suffixes", () => {
    expect(normalizeheader("  Unit Price (USD) ")).toBe("unit-price-usd");
    expect(normalizeheader("Ünïcödé Näme!!")).toBe("ünïcödé-näme");
    expect(normalizeheader("   ")).toBe("column");
    const used = new Set<string>();
    expect(columnspecof("Name", used)).toEqual({ key: "name", label: "Name", kind: "text", normalized: "name" });
    expect(columnspecof("name", used).key).toBe("name2");
    expect(columnspecof("NAME", used).key).toBe("name3");
    expect(classifycolumn(["1", "2.50", "3"])).toBe("number");
    expect(classifycolumn(["1", "abc", "3"])).toBe("text");
    expect(classifycolumn([])).toBe("text");
  });

  it("expands rowspan and colspan cells into filled grids", () => {
    const grid = expandspans([
      row([cell("Region", { header: true, colspan: 2 })], true),
      row([cell("North", { rowspan: 2 }), cell("Q1"), cell("100")]),
      row([cell("Q2"), cell("150")]),
    ]);
    expect(grid).toEqual([
      ["Region", "Region", ""],
      ["North", "Q1", "100"],
      ["North", "Q2", "150"],
    ]);
  });

  it("walks header and body rows into column specs and keyed rows", () => {
    const result = readgrid([
      row([cell("Name", { header: true }), cell("Price", { header: true })], true),
      row([cell("Desk"), cell("120")]),
      row([cell("Chair"), cell("45")]),
    ]);
    expect(result.columns.map((column) => column.key)).toEqual(["name", "price"]);
    expect(result.columns[1]?.kind).toBe("number");
    expect(result.rows).toEqual([
      { name: "Desk", price: "120" },
      { name: "Chair", price: "45" },
    ]);
    expect(result.children).toEqual([]);
  });

  it("extracts nested tables into child datasets linked to their parent rows", () => {
    const result = readgrid([
      row([cell("Order", { header: true }), cell("Items", { header: true })], true),
      row([
        cell("A-1"),
        cell("2 rows", {
          nested: { selector: "table.items", rows: [row([cell("Sku", { header: true })], true), row([cell("sku-9")])] },
        }),
      ]),
    ]);
    expect(result.rows).toEqual([{ order: "A-1", items: "2 rows" }]);
    expect(result.children).toHaveLength(1);
    expect(result.children[0]).toMatchObject({ parentrow: 0, selector: "table.items" });
    expect(result.children[0]?.columns.map((column) => column.key)).toEqual(["sku"]);
    expect(result.children[0]?.rows).toEqual([{ sku: "sku-9" }]);
  });

  it("resolves the next pagination control and detects fresh rows after a page turn", () => {
    const entries = [
      { text: "1", selector: "a.p1", current: true },
      { text: "2", selector: "a.p2", current: false },
      { text: "Next", selector: "a.next", current: false },
    ];
    expect(nextcontrol(entries)).toBe("a.p2");
    expect(nextcontrol([{ text: "prev", selector: "a.prev", current: true }])).toBeUndefined();
    expect(nextcontrol([{ text: "›", selector: "a.gt", current: false }])).toBe("a.gt");
    const previous = [{ sku: "a" }, { sku: "b" }];
    expect(rowsfresh(previous, [{ sku: "a" }, { sku: "b" }])).toBe(false);
    expect(rowsfresh(previous, [{ sku: "a" }, { sku: "c" }])).toBe(true);
    expect(rowsfresh(previous, [])).toBe(false);
  });

  it("hashes rows over reviewed keys and deduplicates with removal counts", () => {
    const first = { name: "Desk", price: "120" };
    const twin = { name: "Desk", price: "120" };
    expect(rowhash(first, ["name"])).toBe(rowhash(twin, ["name"]));
    expect(rowhash(first, ["name"])).not.toBe(rowhash({ name: "Chair", price: "120" }, ["name"]));
    expect(rowhash(first, [])).toBe(rowhash({ price: "120", name: "Desk" }, []));
    const result = dedupebykeys(
      [first, twin, { name: "Chair", price: "45" }, { name: "Desk", price: "999" }],
      ["name"],
    );
    expect(result.removed).toBe(2);
    expect(result.kept).toHaveLength(2);
    expect(result.kept[1]?.name).toBe("Chair");
  });

  it("applies reviewed transform expressions and surfaces unsupported expressions as errors", () => {
    expect(applyexpression("  desk  ", "trim")).toBe("desk");
    expect(applyexpression("desk", "upper")).toBe("DESK");
    expect(applyexpression("DESK", "lower")).toBe("desk");
    expect(applyexpression("US$ 1.299,00", "number")).toBe("1.29900");
    expect(applyexpression("desk", "prefix:sku-")).toBe("sku-desk");
    expect(applyexpression("desk", "suffix:-01")).toBe("desk-01");
    expect(applyexpression("a-b-c", "replace:-=>/")).toBe("a/b/c");
    expect(() => applyexpression("desk", "explode")).toThrow("not supported");
    const transformed = transformrows(
      [{ name: " Desk ", price: "120" }],
      [
        { expression: "trim", sources: ["name"], target: "name" },
        { expression: "prefix:$", sources: ["price"], target: "price" },
      ],
    );
    expect(transformed.errors).toEqual([]);
    expect(transformed.rows[0]).toEqual({ name: "Desk", price: "$120" });
    const failed = transformrows([{ name: "Desk" }], [{ expression: "explode", sources: ["name"], target: "name" }]);
    expect(failed.errors).toHaveLength(1);
    expect(failed.rows[0]).toEqual({ name: "Desk" });
  });

  it("merges datasets across pages aligning columns and filling gaps", () => {
    const merged = mergedatasets([
      { columns: [columnspecof("Sku"), columnspecof("Price")], rows: [{ sku: "a", price: "10" }] },
      { columns: [columnspecof("Sku"), columnspecof("Stock")], rows: [{ sku: "b", stock: "3" }] },
    ]);
    expect(merged.columns.map((column) => column.key)).toEqual(["sku", "price", "stock"]);
    expect(merged.rows).toEqual([
      { sku: "a", price: "10", stock: "" },
      { sku: "b", price: "", stock: "3" },
    ]);
  });

  it("attaches source url, timestamp and step ref to every sampled row", () => {
    const stamped = samplerows([{ sku: "a" }, { sku: "b" }], "https://example.com/list", "step-9", 5000);
    expect(stamped.rows[0]).toEqual({
      sku: "a",
      source: "https://example.com/list",
      capturedat: "5000",
      step: "step-9",
    });
    expect(stamped.sources).toEqual([
      { row: 0, url: "https://example.com/list", at: 5000, stepid: "step-9" },
      { row: 1, url: "https://example.com/list", at: 5000, stepid: "step-9" },
    ]);
  });

  it("serializes datasets to csv and json and parses csv back with quoted fields", () => {
    const columns = [columnspecof("Name"), columnspecof("Price")];
    const rows = [
      { name: "Desk, oak", price: '"120"' },
      { name: "Chair", price: "45" },
    ];
    const csv = tocsv(columns, rows);
    expect(csv).toBe('Name,Price\n"Desk, oak","""120"""\nChair,45');
    expect(tocsv(columns, rows, ";")).toContain('Desk, oak;"""120"""');
    const parsed = parsecsv(csv);
    expect(parsed.headers).toEqual(["Name", "Price"]);
    expect(parsed.rows[0]).toEqual(["Desk, oak", '"120"']);
    expect(JSON.parse(tojson(columns, rows))).toEqual({ columns, rows });
  });

  it("maps imported csv headers onto dataset columns through reviewed mappings", () => {
    const plain = mapcolumns(["Full Name", "E-mail"]);
    expect(plain.map((column) => column.key)).toEqual(["full-name", "e-mail"]);
    const mapped = mapcolumns(["Full Name", "E-mail"], { "Full Name": "name", "E-mail": "email" });
    expect(mapped.map((column) => column.key)).toEqual(["name", "email"]);
    expect(mapped[0]?.label).toBe("name");
  });

  it("serializes an excel SpreadsheetML workbook with typed cells", () => {
    const columns = [columnspecof("Name"), { ...columnspecof("Price"), kind: "number" as const }];
    const workbook = toexcel(columns, [{ name: "Desk", price: "120" }], "catalog");
    expect(workbook.startsWith('<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>')).toBe(true);
    expect(workbook).toContain('<Worksheet ss:Name="catalog">');
    expect(workbook).toContain('<Data ss:Type="Number">120</Data>');
    expect(workbook).toContain('<Data ss:Type="String">Desk</Data>');
  });
});

describe("datacommand dataset records", () => {
  const grid = {
    columns: [columnspecof("Sku"), columnspecof("Price")],
    rows: [
      { sku: "a", price: "10" },
      { sku: "b", price: "20" },
    ],
  };

  it("builds dataset records and exports csv, json and excel artifacts with checksums", () => {
    const datasetvalue = builddataset("d1", "catalog", grid, 1000);
    expect(datasetvalue).toMatchObject({ id: "d1", name: "catalog", sources: [] });
    expect(datasetvalue.rows).toHaveLength(2);
    expect(datasetvalue.columns.map((column) => column.key)).toEqual(["sku", "price"]);
    expect(builddataset("d2", "", grid, 1000).name).toBe("d2");
    const csv = exportcontent(datasetvalue, "csv");
    expect(csv).toBe("Sku,Price\na,10\nb,20");
    expect(JSON.parse(exportcontent(datasetvalue, "json")).rows).toHaveLength(2);
    expect(exportcontent(datasetvalue, "excel")).toContain("mso-application");
    const artifact = exportartifact("a1", datasetvalue, "csv", "step-1", csv, 2000);
    expect(artifact).toMatchObject({ id: "a1", kind: "csv", name: "catalog.csv", stepid: "step-1", rowcount: 2 });
    expect(artifact.checksum).toBe(checksum(csv));
    expect(artifactrecordof(artifact)).toEqual({
      id: "a1",
      kind: "csv",
      name: "catalog.csv",
      stepid: "step-1",
      at: 2000,
    });
  });

  it("plans chunks, applies backpressure and advances stream states for resume", () => {
    expect(chunkplan(10, 4)).toEqual([
      { index: 0, from: 0, to: 4 },
      { index: 1, from: 4, to: 8 },
      { index: 2, from: 8, to: 10 },
    ]);
    expect(chunkplan(0, 5)).toEqual([{ index: 0, from: 0, to: 0 }]);
    expect(backpressure(1, 0)).toBe(true);
    expect(backpressure(1, 1)).toBe(false);
    const datasetvalue = builddataset("d1", "catalog", grid, 1000);
    const stream = newstream(datasetvalue, 3, 1000);
    expect(stream).toMatchObject({ datasetid: "d1", chunk: 0, chunks: 3, written: 0 });
    const stepped = advancestream(stream, { index: 0, to: 4 }, 1100, false);
    expect(stepped).toMatchObject({ chunk: 1, written: 4 });
    expect(stepped.done).toBeUndefined();
    const done = advancestream(stepped, { index: 2, to: 10 }, 1200, true);
    expect(done).toMatchObject({ chunk: 3, written: 10, done: true });
    expect(streamfrom(done, 10)).toBe(0);
    expect(streamfrom(stepped, 10)).toBe(4);
    expect(streamfrom(undefined, 10)).toBe(0);
  });

  it("advances extraction cursors and resumes interrupted sessions after a simulated restart", () => {
    const start = newextractsession("e1", "d1", "catalog", "table.list", "a.next", 3, 1000);
    expect(start).toMatchObject({ cursor: 0, rows: 0, pages: [], planned: 3 });
    const page1 = advancecursor(start, "https://example.com/list?page=1", 10, 1100, false);
    expect(page1).toMatchObject({ cursor: 1, rows: 10, pages: ["https://example.com/list?page=1"] });
    expect(page1.done).toBeUndefined();
    const page2 = advancecursor(page1, "https://example.com/list?page=2", 10, 1200, false);
    expect(page2.done).toBeUndefined();
    expect(remainingpages(page2, 3)).toBe(1);
    const page3 = advancecursor(page2, "https://example.com/list?page=3", 10, 1300, false);
    expect(page3.done).toBe(true);
    expect(remainingpages(page3, 3)).toBe(0);
    expect(remainingpages(page1, 3)).toBe(2);
  });

  it("builds provenance records with row ranges and checksums and applies artifact retention", () => {
    const record = provenancefor(
      { id: "a1", name: "catalog.csv", rowcount: 120, checksum: checksum("rows") },
      "https://example.com/list",
      "step-3",
      9000,
    );
    expect(record).toEqual({
      artifact: "a1",
      name: "catalog.csv",
      url: "https://example.com/list",
      stepid: "step-3",
      rowstart: 1,
      rowend: 120,
      checksum: checksum("rows"),
      at: 9000,
    });
    expect(
      provenancefor(
        { id: "a2", name: "empty.csv", rowcount: 0, checksum: "fnv1a-0" },
        "https://example.com",
        "step-4",
        9100,
      ).rowstart,
    ).toBe(0);
    const records = [{ at: 3 }, { at: 2 }, { at: 1 }];
    expect(retainedexports(records, 2)).toHaveLength(2);
    expect(retainedexports(records, undefined)).toHaveLength(3);
  });

  it("interpolates row variables into looprows inner steps and exposes the variables", () => {
    expect(interpolate("Fill {{name}} with {{ price }}", { name: "Desk", price: "120" })).toBe("Fill Desk with 120");
    expect(interpolate("Keep {{missing}}", { name: "Desk" })).toBe("Keep ");
    const inner: toolstep = {
      id: "fill",
      kind: "filllabel",
      summary: "Fill the row fields.",
      risk: "sensitive",
      options: '{"fields":[{"label":"{{name}}","value":"{{price}}"}]}',
    };
    const derived = loopstep(inner, { name: "Desk", price: "120" });
    expect(JSON.parse(derived.options ?? "{}").fields[0]).toEqual({ label: "Desk", value: "120" });
    expect(loopvariables({ name: "Desk" })).toEqual({ name: "Desk" });
  });

  it("builds grid previews, sorts rows and shapes sheet push payloads", () => {
    const datasetvalue = builddataset(
      "d1",
      "catalog",
      {
        ...grid,
        rows: [
          { sku: "b", price: "20" },
          { sku: "a", price: "10" },
          { sku: "c", price: "30" },
        ],
      },
      1000,
    );
    const preview = gridpreview(datasetvalue, 2);
    expect(preview).toMatchObject({ datasetid: "d1", columns: ["sku", "price"], rows: 3 });
    expect(preview.sample).toHaveLength(2);
    expect(sortrows(datasetvalue.rows, "price", "asc").map((row) => row.sku)).toEqual(["a", "b", "c"]);
    expect(sortrows(datasetvalue.rows, "sku", "desc").map((row) => row.sku)).toEqual(["c", "b", "a"]);
    expect(sheetpayload(datasetvalue, "https://sheets.example/tab")).toEqual({
      sheet: "https://sheets.example/tab",
      columns: ["sku", "price"],
      rows: datasetvalue.rows,
    });
  });

  it("merges task transform rules and dedupe keys per task", () => {
    const first = mergetaskrules(
      undefined,
      "plan-1",
      [{ expression: "trim", sources: ["name"], target: "name" }],
      ["sku"],
      1000,
    );
    expect(first).toEqual({
      taskid: "plan-1",
      transforms: [{ expression: "trim", sources: ["name"], target: "name" }],
      dedupekeys: ["sku"],
      at: 1000,
    });
    const second = mergetaskrules(first, "plan-1", [], ["price"], 2000);
    expect(second.transforms).toHaveLength(1);
    expect(second.dedupekeys).toEqual(["price"]);
  });
});

describe("files, clipboard and downloads command", () => {
  const record = (overrides: Partial<downloadrecord> = {}): downloadrecord => ({
    id: "d1",
    url: "https://example.com/report.pdf",
    filename: "report.pdf",
    state: "queued",
    at: 100,
    updatedat: 100,
    ...overrides,
  });

  it("walks the batch queue state transitions and refuses impossible ones", () => {
    expect(transitionallowed("queued", "running")).toBe(true);
    expect(transitionallowed("running", "paused")).toBe(true);
    expect(transitionallowed("paused", "running")).toBe(true);
    expect(transitionallowed("running", "complete")).toBe(true);
    expect(transitionallowed("queued", "failed")).toBe(true);
    expect(transitionallowed("queued", "paused")).toBe(false);
    expect(transitionallowed("paused", "complete")).toBe(false);
    expect(transitionallowed("complete", "running")).toBe(false);
    expect(transitionallowed("failed", "running")).toBe(false);
    const started = advancedownload(record(), "running", 200, { downloadid: 7 });
    expect(started).toMatchObject({ state: "running", downloadid: 7, updatedat: 200 });
    const done = advancedownload(started, "complete", 300, {
      path: "/downloads/report.pdf",
      bytes: 2048,
      checksum: "fnv1a-abc",
    });
    expect(done).toMatchObject({
      state: "complete",
      path: "/downloads/report.pdf",
      bytes: 2048,
      checksum: "fnv1a-abc",
    });
    expect(advancedownload(done, "paused", 400)).toMatchObject({ state: "complete", updatedat: 300 });
  });

  it("keeps the concurrent download window a user configured choice with no code ceiling", () => {
    expect(concurrentwindow(0, undefined)).toBe(true);
    expect(concurrentwindow(100, undefined)).toBe(true);
    expect(concurrentwindow(2, 3)).toBe(true);
    expect(concurrentwindow(3, 3)).toBe(false);
    expect(concurrentwindow(0, 1000)).toBe(true);
  });

  it("renames filename conflicts with sequence suffixes and derives names from urls", () => {
    expect(conflictfree("report.pdf", ["other.pdf"])).toBe("report.pdf");
    expect(conflictfree("report.pdf", ["report.pdf"])).toBe("report-2.pdf");
    expect(conflictfree("report.pdf", ["report.pdf", "report-2.pdf"])).toBe("report-3.pdf");
    expect(conflictfree("archive.tar.gz", ["archive.tar.gz", "archive.tar-2.gz"])).toBe("archive.tar-3.gz");
    expect(conflictfree("report", ["report"])).toBe("report-2");
    expect(downloadfilename("https://example.com/files/report.pdf", undefined)).toBe("report.pdf");
    expect(downloadfilename("https://example.com/files/report.pdf", "quarterly.pdf")).toBe("quarterly.pdf");
    expect(downloadfilename("https://example.com", undefined)).toBe("example.com");
  });

  it("verifies completed downloads against the reviewed size and checksum expectations", () => {
    const complete = record({ state: "complete", bytes: 2048, checksum: "fnv1a-abc" });
    expect(verifybytes(complete, {})).toMatchObject({ ok: true, matches: { state: true, size: true, checksum: true } });
    expect(verifybytes(complete, { bytes: 2048, checksum: "fnv1a-abc" })).toMatchObject({ ok: true });
    expect(verifybytes(complete, { bytes: 4096 })).toMatchObject({ ok: false, matches: { size: false } });
    expect(verifybytes(complete, { checksum: "fnv1a-other" })).toMatchObject({
      ok: false,
      matches: { checksum: false },
    });
    expect(verifybytes(record({ state: "running" }), {})).toMatchObject({ ok: false, matches: { state: false } });
    expect(verifybytes(record({ state: "complete" }), { bytes: 2048 })).toMatchObject({
      ok: false,
      matches: { size: false },
    });
    expect(verifybytes(complete, { bytes: 4096 }).summary).toContain("Failed to verify");
  });

  it("matches mime filters with exclude winning, include patterns and the deny default", () => {
    const filter = {
      include: ["application/pdf*", "text/csv"],
      exclude: ["application/pdf-malformed"],
      default: "deny" as const,
    };
    expect(mimeallowed(filter, "application/pdf")).toBe(true);
    expect(mimeallowed(filter, "text/csv")).toBe(true);
    expect(mimeallowed(filter, "application/pdf-malformed")).toBe(false);
    expect(mimeallowed(filter, "application/zip")).toBe(false);
    const allowdefault = { include: ["application/pdf*"], exclude: [], default: "allow" as const };
    expect(mimeallowed(allowdefault, "application/zip")).toBe(true);
    expect(mimeallowed(allowdefault, "text/html")).toBe(true);
  });

  it("correlates netlog records with steps through request ids and redacts header values", () => {
    const entry = netlogentry({
      url: "https://example.com/list",
      method: "GET",
      status: 200,
      timing: 120,
      requestid: "nav-1-2",
      stepid: "nav-1",
      at: 900,
    });
    expect(entry).toEqual({
      url: "https://example.com/list",
      method: "GET",
      status: 200,
      timing: 120,
      requestid: "nav-1-2",
      stepid: "nav-1",
      at: 900,
    });
    const records = [
      entry,
      netlogentry({
        url: "https://example.com/cart",
        method: "GET",
        status: 304,
        timing: 40,
        requestid: "nav-2-1",
        stepid: "nav-2",
        at: 950,
      }),
    ];
    expect(netlogforstep(records, "nav-1")).toEqual([entry]);
    expect(netlogforstep(records, "nav-3")).toEqual([]);
    expect(redactheaders({ authorization: "Bearer token", cookie: "session=1", accept: "text/html" })).toEqual({
      authorization: "[redacted]",
      cookie: "[redacted]",
      accept: "[redacted]",
    });
  });

  it("keeps clipboard payloads out of entries while carrying the hash and origin provenance", () => {
    const payload = "tracking 12345678";
    const entry = clipentryof(
      "read",
      { hash: cliphash(payload), length: payload.length },
      "https://example.com",
      "clip-step",
      1000,
    );
    expect(entry).toEqual({
      kind: "read",
      hash: cliphash(payload),
      length: 17,
      origin: "https://example.com",
      stepid: "clip-step",
      at: 1000,
    });
    expect(JSON.stringify(entry)).not.toContain("tracking");
    expect(cliphash("a")).not.toBe(cliphash("b"));
    const write = clipentryof(
      "write",
      { hash: cliphash("reviewed text"), length: 13 },
      "https://example.com",
      "write-step",
      2000,
    );
    expect(write.kind).toBe("write");
    const screen = clipentryof(
      "screen",
      { hash: cliphash("pngdata"), length: 7 },
      "https://example.com",
      "screen-step",
      3000,
    );
    expect(screen.kind).toBe("screen");
  });

  it("keeps quarantined files outside the downloads folder and maps scan hook verdicts", () => {
    const entry = newquarantine("q1", "invoice.pdf", "reviewed quarantine", 5000);
    expect(entry).toEqual({
      id: "q1",
      path: "devthink-quarantine/invoice.pdf",
      reason: "reviewed quarantine",
      scan: "pending",
      at: 5000,
      updatedat: 5000,
    });
    expect(quarantinedpath("/absolute/path.bin")).toBe("devthink-quarantine/absolute/path.bin");
    expect(scanresult(entry, "clean", 6000)).toMatchObject({ scan: "clean", updatedat: 6000 });
    expect(scanresult(entry, "flagged", 6000)).toMatchObject({ scan: "flagged" });
    expect(scanverdictof({ verdict: "clean" })).toBe("clean");
    expect(scanverdictof({ verdict: "flagged" })).toBe("flagged");
    expect(scanverdictof({ verdict: "error" })).toBe("error");
    expect(scanverdictof({ verdict: "weird" })).toBe("pending");
    expect(scanverdictof({})).toBe("pending");
    expect(scanverdictof(undefined)).toBe("pending");
    expect(scanverdictof("clean")).toBe("pending");
    expect(released(scanresult(entry, "clean", 6000), "user-9", 7000)).toMatchObject({
      release: "user-9",
      updatedat: 7000,
    });
  });

  it("stamps consistent capture names from task, step and sequence parts with per task counters", () => {
    expect(capturefilename({ task: "Order Run", step: "Snap Shot", sequence: 4 }, ".PNG")).toBe(
      "order-run-snap-shot-4.png",
    );
    expect(capturefilename({ task: "", step: "", sequence: 1 }, "")).toBe("capture-capture-1.png");
    expect(advancecounter({}, "snap")).toEqual({ sequence: 1, counters: { snap: 1 } });
    expect(advancecounter({ snap: 1 }, "snap")).toEqual({ sequence: 2, counters: { snap: 2 } });
    const stamped = capturenames({}, "task-1", ["snap", "peek", "snap"], "png");
    expect(stamped.names).toEqual(["task-1-snap-1.png", "task-1-peek-1.png", "task-1-snap-2.png"]);
    expect(stamped.counters).toEqual({ snap: 2, peek: 1 });
    expect(capturesteps({ steps: ["a", "b"] }, { steps: [] } as unknown as { steps: toolstep[] })).toEqual(["a", "b"]);
    expect(
      capturesteps(
        {},
        {
          steps: [
            { id: "one", kind: "observe", summary: "", risk: "read" },
            { id: "two", kind: "click", summary: "", risk: "sensitive" },
          ],
        },
      ),
    ).toEqual(["one", "two"]);
  });

  it("plans cleanup sweeps by age and kind while keeping references and keep policies", () => {
    const now = 10_000;
    const entries: artifactinventoryentry[] = [
      { id: "a1", kind: "export-csv", name: "old.csv", size: 100, at: 1000 },
      { id: "a2", kind: "export-csv", name: "new.csv", size: 200, at: 9000 },
      { id: "a3", kind: "printpdf", name: "receipt.pdf", size: 0, at: 8000 },
      { id: "a4", kind: "export-json", name: "referenced.json", size: 50, at: 4000 },
    ];
    expect(sweepplan(entries, [{ age: 5000, kind: "export-csv", keep: "none" }], now, [])).toMatchObject({
      remove: ["a1"],
      keep: ["a2", "a3", "a4"],
    });
    expect(sweepplan(entries, [{ age: 5000, kind: "any", keep: "none" }], now, ["referenced.json"]).remove).toEqual([
      "a1",
    ]);
    expect(sweepplan(entries, [{ age: 5000, kind: "any", keep: "none" }], now, []).remove.sort()).toEqual(["a1", "a4"]);
    expect(sweepplan(entries, [{ age: 20000, kind: "any", keep: "none" }], now, [])).toEqual({
      remove: [],
      keep: ["a1", "a2", "a3", "a4"],
    });
    expect(sweepplan(entries, [{ age: 5000, kind: "any", keep: "all" }], now, [])).toEqual({
      remove: [],
      keep: ["a1", "a2", "a3", "a4"],
    });
    expect(sweepplan(entries, [{ age: 5000, kind: "any", keep: "latest" }], now, [])).toMatchObject({
      remove: ["a1"],
      keep: ["a2", "a3", "a4"],
    });
    expect(sweepplan(entries, [{ age: 5000, kind: "printpdf", keep: "none" }], now, []).remove).toEqual([]);
    expect(sweepplan(entries, [], now, [])).toEqual({ remove: [], keep: ["a1", "a2", "a3", "a4"] });
    expect(referencedartifacts(undefined, [])).toEqual([]);
    const plansteps = {
      steps: [
        { id: "s1", kind: "attachfile", value: "referenced.json" },
        { id: "s2", kind: "attachfile", value: "old.csv" },
        { id: "s3", kind: "click", value: "x" },
      ],
    };
    expect(referencedartifacts(plansteps, ["s2"])).toEqual(["referenced.json"]);
    expect(referencedartifacts(plansteps, ["s1", "s2"])).toEqual([]);
  });
});

describe("media capture", () => {
  it("tiles full page captures with scroll offsets and overlap rows while fixed headers never repeat", () => {
    const plan = buildstitchplan({
      scrollwidth: 1280,
      scrollheight: 3200,
      viewportwidth: 1280,
      viewportheight: 800,
      overlap: 40,
    });
    expect(plan).toMatchObject({ columns: 1, rows: 5, overlap: 40 });
    expect(plan.tiles.map((tile) => tile.y)).toEqual([0, 760, 1520, 2280, 2400]);
    const short = buildstitchplan({ scrollwidth: 800, scrollheight: 600, viewportwidth: 1280, viewportheight: 800 });
    expect(short).toMatchObject({ columns: 1, rows: 1 });
    expect(short.tiles).toEqual([{ x: 0, y: 0 }]);
    const wide = buildstitchplan({
      scrollwidth: 2600,
      scrollheight: 800,
      viewportwidth: 1280,
      viewportheight: 800,
      overlap: 0,
    });
    expect(wide).toMatchObject({ columns: 3, rows: 1 });
    expect(wide.tiles.map((tile) => tile.x)).toEqual([0, 1280, 1320]);
    const clamped = buildstitchplan({
      scrollwidth: 1280,
      scrollheight: 1500,
      viewportwidth: 1280,
      viewportheight: 800,
      overlap: 100,
    });
    expect(clamped.tiles.map((tile) => tile.y)).toEqual([0, 700]);
    expect(fixedheadermatch([1, 2, 3], [1, 2, 3])).toBe(true);
    expect(fixedheadermatch([1, 2, 3], [1, 2, 4])).toBe(false);
    expect(fixedheadermatch([], [])).toBe(false);
    expect(fixedheadermatch([1], [1, 2])).toBe(false);
  });

  it("blends overlap bands with the linear seam weights across tile seams", () => {
    expect(seamweights(0)).toEqual([]);
    expect(seamweights(4)).toEqual([0.2, 0.4, 0.6, 0.8]);
    expect(blendrows([10, 10, 10, 10], [20, 20, 20, 20])).toEqual([12, 14, 16, 18]);
    expect(blendrows([10], [30])).toEqual([20]);
    const blended = blendrows([0, 0], [10, 10]);
    expect(blended[0]).toBeCloseTo(10 / 3, 12);
    expect(blended[1]).toBeCloseTo(20 / 3, 12);
  });

  it("scales element rects at pixel ratios of one, two and three and clamps crops to the viewport", () => {
    const rect = { x: 10, y: 25, width: 100, height: 50 };
    expect(scaledrect(rect, 1)).toEqual({ x: 10, y: 25, width: 100, height: 50 });
    expect(scaledrect(rect, 2)).toEqual({ x: 20, y: 50, width: 200, height: 100 });
    expect(scaledrect(rect, 3)).toEqual({ x: 30, y: 75, width: 300, height: 150 });
    expect(scaledrect(rect, 0.5)).toEqual({ x: 10, y: 25, width: 100, height: 50 });
    expect(croprect({ x: -20, y: 100, width: 200, height: 900 }, { width: 1280, height: 800 })).toEqual({
      x: 0,
      y: 100,
      width: 200,
      height: 700,
    });
    expect(croprect({ x: 1200, y: 0, width: 200, height: 100 }, { width: 1280, height: 800 })).toEqual({
      x: 1200,
      y: 0,
      width: 80,
      height: 100,
    });
    expect(crossesviewport({ x: 0, y: 0, width: 1280, height: 800 }, { width: 1280, height: 800 })).toBe(false);
    expect(crossesviewport({ x: 0, y: 0, width: 1400, height: 800 }, { width: 1280, height: 800 })).toBe(true);
    expect(crossesviewport({ x: -10, y: 0, width: 100, height: 100 }, { width: 1280, height: 800 })).toBe(true);
    expect(crossesviewport({ x: 0, y: 700, width: 100, height: 200 }, { width: 1280, height: 800 })).toBe(true);
  });

  it("walks scrollable containers in reviewed steps for region captures", () => {
    expect(regionsteps(0, 400)).toEqual([0]);
    expect(regionsteps(400, 400)).toEqual([0]);
    expect(regionsteps(900, 400)).toEqual([0, 400, 500]);
    expect(regionsteps(1200, 400)).toEqual([0, 400, 800]);
    expect(regionsteps(500, 0)).toEqual([0]);
  });

  it("places contact sheet cells on a labeled grid with the reviewed label style", () => {
    const cells = [
      { selector: "#a", label: "Card one" },
      { selector: "#b" },
      { selector: "#c", label: "Card three" },
      { selector: "#d" },
      { selector: "#e" },
    ];
    const sheet = buildsheet(cells, { cellsize: 240, columns: 2, label: "both" });
    expect(sheet).toMatchObject({ columns: 2, rows: 3 });
    expect(sheet.cells[0]).toMatchObject({ index: 0, column: 0, row: 0, selector: "#a", caption: "1 · #a · Card one" });
    expect(sheet.cells[1]).toMatchObject({ index: 1, column: 1, row: 0, selector: "#b", caption: "2 · #b" });
    expect(sheet.cells[2]).toMatchObject({ column: 0, row: 1, selector: "#c" });
    expect(sheet.cells[4]).toMatchObject({ column: 0, row: 2, selector: "#e" });
    expect(buildsheet([{ selector: "#a" }], { cellsize: 120, columns: 4, label: "none" }).cells[0]?.caption).toBe("");
    expect(buildsheet([{ selector: "#a" }], { cellsize: 120, columns: 4, label: "index" }).cells[0]?.caption).toBe("1");
    expect(buildsheet([{ selector: "#a" }], { cellsize: 120, columns: 4, label: "selector" }).cells[0]?.caption).toBe(
      "#a",
    );
    expect(buildsheet([], { cellsize: 120, columns: 3, label: "both" })).toMatchObject({
      columns: 3,
      rows: 1,
      cells: [],
    });
  });

  it("pairs before and after state shots around a click action and skips the pair when the action fails", () => {
    const before: shotrecord = {
      id: "b1",
      runid: "run-1",
      stepid: "s1",
      kind: "shotview",
      format: "png",
      width: 1280,
      height: 800,
      capturedat: 1,
    };
    const after: shotrecord = {
      id: "a1",
      runid: "run-1",
      stepid: "s1",
      kind: "shotview",
      format: "png",
      width: 1280,
      height: 800,
      capturedat: 2,
    };
    const paired = pairstates(before, after, { kind: "click", target: "#submit", domsnapshotid: "7" }, 3, "p1");
    expect(paired.pair).toEqual({
      id: "p1",
      beforeid: "b1",
      afterid: "a1",
      actionkind: "click",
      target: "#submit",
      domsnapshotid: "7",
      at: 3,
    });
    expect(paired.skipped).toBeUndefined();
    const failed = pairstates(before, undefined, { kind: "click", target: "#submit" }, 3, "p2");
    expect(failed.pair).toBeUndefined();
    expect(failed.skipped).toBe("after");
    expect(failed.reason).toContain("failed before the after shot");
    const nobefore = pairstates(undefined, after, { kind: "click" }, 3, "p3");
    expect(nobefore.skipped).toBe("before");
    expect(
      capturestates({ policy: "manual", before, after, actionkind: "click", at: 3, id: "p4" }).pair,
    ).toBeUndefined();
    expect(
      capturestates({
        policy: "beforeafter",
        before,
        after,
        actionkind: "click",
        target: "#submit",
        domsnapshotid: "7",
        at: 3,
        id: "p4",
      }).pair,
    ).toMatchObject({ id: "p4", beforeid: "b1", afterid: "a1" });
    expect(
      capturestates({ policy: "beforeafter", before, after: undefined, actionkind: "click", at: 3, id: "p5" }).skipped,
    ).toBe("after");
  });

  it("stamps unique capture names inside a long run through the sequence counter", () => {
    const rule = { run: true, step: true, sequence: true, kind: true };
    const names = new Set<string>();
    for (let sequence = 1; sequence <= 250; sequence += 1)
      names.add(buildname(rule, { run: "Order Run", step: "Snap Shot", sequence, kind: "ShotView" }, "PNG"));
    expect(names.size).toBe(250);
    expect([...names][0]).toBe("order-run-snap-shot-1-shotview.png");
    expect([...names][249]).toBe("order-run-snap-shot-250-shotview.png");
    expect(
      buildname(
        { run: true, step: false, sequence: false, kind: true },
        { run: "run", step: "s", sequence: 3, kind: "shotregion" },
        "webp",
      ),
    ).toBe("run-shotregion.webp");
    expect(
      buildname(
        { run: false, step: false, sequence: false, kind: false },
        { run: "r", step: "s", sequence: 1, kind: "k" },
        "",
      ),
    ).toBe("capture.png");
    expect(buildname(rule, { run: "", step: "", sequence: 2, kind: "" }, "jpeg")).toBe(
      "capture-capture-2-capture.jpeg",
    );
  });

  it("normalizes capture options with defaults and builds shot records for every capture kind", () => {
    expect(captureoptionsof(undefined)).toEqual({});
    expect(captureoptionsof(null)).toEqual({});
    expect(
      captureoptionsof({ format: "webp", quality: "high", pixelratio: 2, annotate: 1, exporttarget: "clipboard" }),
    ).toEqual({ format: "webp", pixelratio: 2, exporttarget: "clipboard" });
    expect(captureoptionsof({ quality: 92, annotate: true })).toEqual({ quality: 92, annotate: true });
    const view = capturevisible({
      runid: "run-1",
      stepid: "s1",
      options: { format: "jpeg", quality: 90, pixelratio: 2, annotate: true, exporttarget: "clipboard" },
      viewport: { width: 1280, height: 800 },
      dataurl: "data:image/jpeg;base64,abc",
      at: 5,
      id: "c1",
      name: "run-1-s1-1-shotview.jpeg",
    });
    expect(view).toMatchObject({
      id: "c1",
      runid: "run-1",
      stepid: "s1",
      kind: "shotview",
      format: "jpeg",
      width: 2560,
      height: 1600,
      capturedat: 5,
      bytes: "data:image/jpeg;base64,abc",
      name: "run-1-s1-1-shotview.jpeg",
      annotated: true,
      exporttarget: "clipboard",
    });
    const stitch = buildstitchplan({
      scrollwidth: 1280,
      scrollheight: 1600,
      viewportwidth: 1280,
      viewportheight: 800,
      overlap: 0,
    });
    const full = capturestitched({
      runid: "run-1",
      stepid: "s2",
      options: {},
      plan: stitch,
      dataurl: "data:image/png;base64,zzz",
      at: 6,
      id: "c2",
    });
    expect(full).toMatchObject({ kind: "shotfullpage", format: "png", width: 1280, height: 1600 });
    const element = captureelement({
      runid: "run-1",
      stepid: "s3",
      options: { pixelratio: 3 },
      rect: { x: 10, y: 20, width: 100, height: 50 },
      dataurl: "data:image/png;base64,q",
      at: 7,
      id: "c3",
      target: "#card",
    });
    expect(element).toMatchObject({ kind: "shotelement", width: 300, height: 150, target: "#card" });
    const region = captureregion({
      runid: "run-1",
      stepid: "s4",
      options: {},
      rect: { x: 0, y: 0, width: 400, height: 300 },
      dataurl: "data:image/png;base64,r",
      at: 8,
      id: "c4",
      target: "#feed",
    });
    expect(region).toMatchObject({ kind: "shotregion", width: 400, height: 300, target: "#feed" });
    const plan = annotationplanof({
      step: 3,
      width: 1280,
      height: 800,
      rect: { x: 10, y: 20, width: 100, height: 50 },
      url: "https://example.com/list",
      at: 1_800_000_000_000,
    });
    expect(plan.marker).toEqual({ x: 24, y: 24, number: 3 });
    expect(plan.outline).toEqual({ x: 8, y: 18, width: 104, height: 54 });
    expect(plan.footer).toContain("https://example.com/list");
    expect(annotationplanof({ step: 1, width: 40, height: 30, url: "https://example.com", at: 0 }).marker).toEqual({
      x: 8,
      y: 8,
      number: 1,
    });
  });
});

describe("media capture part two", () => {
  it("normalizes pdf options, swaps the page size for landscape and keeps every bound a user choice", () => {
    expect(pdfoptionsof(undefined)).toEqual({});
    expect(pdfoptionsof({ paperwidth: 8.5, paperheight: 14, scale: 2, landscape: true, paginate: true })).toEqual({
      paperwidth: 8.5,
      paperheight: 14,
      scale: 2,
      landscape: true,
      paginate: true,
    });
    expect(pdfoptionsof({ paperwidth: "a4", margins: { top: 0.5, left: 0.25 } })).toEqual({
      margins: { top: 0.5, right: 0.4, bottom: 0.4, left: 0.25 },
    });
    expect(pdfpagesize({})).toEqual({ width: 612, height: 792 });
    expect(pdfpagesize({ landscape: true })).toEqual({ width: 792, height: 612 });
    expect(pdfpagesize({ paperwidth: 20, paperheight: 40 })).toEqual({ width: 1440, height: 2880 });
    expect(pdfpagesize({ paperwidth: 3, paperheight: 6, landscape: true })).toEqual({ width: 432, height: 216 });
  });

  it("splits long reports into page segments at reviewed break points and walks viewport steps when absent", () => {
    expect(pdfsegments(800, 800, [])).toEqual([{ top: 0, height: 800 }]);
    expect(pdfsegments(1600, 800, [])).toEqual([
      { top: 0, height: 800 },
      { top: 800, height: 800 },
    ]);
    expect(pdfsegments(2000, 800, [])).toEqual([
      { top: 0, height: 800 },
      { top: 800, height: 800 },
      { top: 1600, height: 400 },
    ]);
    expect(pdfsegments(2000, 800, [1000])).toEqual([
      { top: 0, height: 1000 },
      { top: 1000, height: 800 },
      { top: 1800, height: 200 },
    ]);
    expect(pdfsegments(2000, 800, [500, 500, -10, 9999])).toEqual([
      { top: 0, height: 500 },
      { top: 500, height: 800 },
      { top: 1300, height: 700 },
    ]);
    expect(pdfsegments(0, 800, [])).toEqual([]);
  });

  it("composes a valid derived pdf document with reviewed page size, margins, scale, landscape and text escaping", () => {
    const composed = buildpdf(["Quarterly report\nRevenue climbed (again) by 12% — plain ascii stays", "Second page"], {
      paperwidth: 8.5,
      paperheight: 11,
      margins: { top: 0.5, right: 0.5, bottom: 0.5, left: 0.5 },
      scale: 1,
      landscape: false,
      paginate: true,
    });
    expect(composed.pages).toBe(2);
    expect(composed.pagewidth).toBe(612);
    expect(composed.pageheight).toBe(792);
    expect(composed.bytes).toBe(composed.document.length);
    expect(composed.document.startsWith("%PDF-1.4\n")).toBe(true);
    expect(composed.document).toContain("/Type /Catalog");
    expect(composed.document).toContain("/Count 2");
    expect(composed.document).toContain("/MediaBox [0 0 612.00 792.00]");
    expect(composed.document).toContain("(Revenue climbed \\(again\\) by 12% ? plain ascii stays) Tj");
    expect(composed.document).toContain("(Second page) Tj");
    expect(composed.document).toContain("xref\n0 8\n");
    expect(composed.document.trimEnd().endsWith("%%EOF")).toBe(true);
    const startxref = Number(
      composed.document
        .slice(composed.document.lastIndexOf("startxref") + "startxref".length)
        .trim()
        .split(/\s+/)[0],
    );
    expect(composed.document.slice(startxref, startxref + 4)).toBe("xref");
    const offsets = [...composed.document.matchAll(/^(\d{10}) 00000 n $/gm)].map((match) => Number(match[1]));
    expect(offsets).toHaveLength(7);
    for (const offset of offsets) expect(composed.document.slice(offset, offset + 7)).toMatch(/^\d+ 0 obj/);
    const landscape = buildpdf(["Wide report"], { paperwidth: 8.5, paperheight: 11, landscape: true });
    expect(landscape.pagewidth).toBe(792);
    expect(landscape.pageheight).toBe(612);
    expect(landscape.document).toContain("/MediaBox [0 0 792.00 612.00]");
    const scaled = buildpdf(["tiny"], { scale: 2 });
    expect(scaled.document).toContain("/F1 22 Tf");
    const empty = buildpdf([], {});
    expect(empty.pages).toBe(1);
    expect(empty.document).toContain("BT");
  });

  it("wraps long report text into page lines at the reviewed geometry", () => {
    const lines = pdftextlayout("one two three four five six seven eight nine ten", {
      paperwidth: 8.5,
      paperheight: 11,
      margins: { top: 0.5, right: 0.5, bottom: 0.5, left: 0.5 },
      scale: 1,
    });
    expect(lines.length).toBeGreaterThan(0);
    expect(lines.every((line) => line.length <= 100)).toBe(true);
    const small = pdftextlayout("word ".repeat(400), {
      paperwidth: 3,
      paperheight: 5,
      margins: { top: 1, right: 1, bottom: 1, left: 1 },
      scale: 1,
    });
    expect(small.length).toBeGreaterThan(0);
    expect(small.length).toBeLessThan(60);
    expect(pdftextlayout("", {})).toEqual([""]);
  });

  it("opens, times and closes recordings with reviewed scopes, fps windows and clean stops", () => {
    const options = recordingoptionsof({ scope: "run", fps: 4, bitrate: 2500, audio: true });
    expect(options).toEqual({ scope: "run", fps: 4, bitrate: 2500, audio: true });
    expect(recordingoptionsof(undefined)).toEqual({});
    expect(recordingoptionsof({ scope: "screen", fps: "high" })).toEqual({});
    const record = newrecording({
      id: "rec-1",
      runid: "plan",
      stepid: "step",
      tabid: 4,
      kind: "screen",
      options,
      at: 1000,
    });
    expect(record).toMatchObject({
      id: "rec-1",
      runid: "plan",
      stepid: "step",
      tabid: 4,
      kind: "screen",
      scope: "run",
      format: "frames",
      startedat: 1000,
      fps: 4,
      bitrate: 2500,
      audio: true,
      frames: [],
    });
    const closed = finishrecording(record, 6250);
    expect(closed).toMatchObject({ endedat: 6250, duration: 5250, frames: [] });
    expect(frameinterval(4)).toBe(250);
    expect(frameinterval(1)).toBe(1000);
    expect(frameinterval(0.5)).toBe(2000);
    expect(frameinterval(0)).toBe(1000);
    expect(frameinterval(-3)).toBe(1000);
    const audio = newrecording({
      id: "rec-2",
      runid: "plan",
      stepid: "step",
      tabid: 4,
      kind: "audio",
      options: recordingoptionsof({}),
      at: 2000,
    });
    expect(audio.format).toBe("evidence");
    expect(audio.scope).toBe("tab");
  });

  it("matches observed images against the reviewed filter, deduplicates identical urls and stamps counter names", () => {
    const filter = imagefilterof({
      selector: "main img",
      minwidth: 200,
      minheight: 100,
      formats: ["png", "image/webp"],
    });
    expect(filter).toEqual({ selector: "main img", minwidth: 200, minheight: 100, formats: ["png", "image/webp"] });
    expect(imagefilterof(undefined)).toEqual({});
    expect(imagefilterof({ minwidth: "big" })).toEqual({});
    const images = [
      { url: "https://example.com/a.png", alt: "Chart", width: 400, height: 300, bytes: 1200, mime: "image/png" },
      {
        url: "https://example.com/a.png",
        alt: "Chart duplicate",
        width: 400,
        height: 300,
        bytes: 1200,
        mime: "image/png",
      },
      { url: "https://example.com/b.webp", alt: "", width: 250, height: 90, bytes: 800, mime: "image/webp" },
      { url: "https://example.com/c.jpg", alt: "Photo", width: 900, height: 600, bytes: 5000, mime: "image/jpeg" },
    ];
    const webp = images[2];
    const jpeg = images[3];
    expect(images.filter((image) => imagematches(image, filter))).toEqual([images[0], images[1]]);
    expect(webp && imagematches(webp, filter)).toBe(false);
    expect(jpeg && imagematches(jpeg, filter)).toBe(false);
    expect(jpeg && imagematches(jpeg, imagefilterof({ formats: ["jpeg"] }))).toBe(true);
    expect(jpeg && imagematches(jpeg, {})).toBe(true);
    expect(dedupeimages(images)).toHaveLength(3);
    expect(dedupeimages(images)[0]).toEqual(images[0]);
    const names = imagenames({ run: true, step: true, sequence: true, kind: true }, "Order Run", "Grab Step", 3, "png");
    expect(names).toEqual([
      "order-run-grab-step-1-image.png",
      "order-run-grab-step-2-image.png",
      "order-run-grab-step-3-image.png",
    ]);
    expect(imagenames({ run: true, step: false, sequence: false, kind: true }, "r", "s", 2, "webp")).toEqual([
      "r-image.webp",
      "r-image.webp",
    ]);
  });

  it("orders lapse frames at the reviewed interval inside the reviewed duration", () => {
    expect(lapseframes({ interval: 250, duration: 1000 })).toEqual([0, 250, 500, 750]);
    expect(lapseframes({ interval: 400, duration: 1000 })).toEqual([0, 400, 800]);
    expect(lapseframes({ interval: 1000, duration: 999 })).toEqual([0]);
    expect(lapseframes({ interval: 0, duration: 1000 })).toEqual([]);
    expect(lapseframes({ interval: 500, duration: 0 })).toEqual([]);
    expect(lapseplanof({ interval: 500, duration: 2000, format: "webp" })).toEqual({
      interval: 500,
      duration: 2000,
      format: "webp",
    });
    expect(lapseplanof({ interval: 500, duration: 2000, format: "gif" })).toEqual({
      interval: 500,
      duration: 2000,
      format: "png",
    });
    expect(lapseplanof({ duration: 2000 })).toBeUndefined();
    expect(lapseplanof(undefined)).toBeUndefined();
  });

  it("normalizes conversion and thumbnail directives and computes cover and contain thumbnail geometry", () => {
    expect(convertdirectiveof({ source: "png", target: "webp", quality: 90 })).toEqual({
      source: "png",
      target: "webp",
      quality: 90,
    });
    expect(convertdirectiveof({ target: "jpeg" })).toEqual({ target: "jpeg" });
    expect(convertdirectiveof({ target: "gif" })).toBeUndefined();
    expect(convertdirectiveof(undefined)).toBeUndefined();
    expect(thumbdirectiveof({ size: 240, fit: "cover", suffix: "thumb" })).toEqual({
      size: 240,
      fit: "cover",
      suffix: "thumb",
    });
    expect(thumbdirectiveof({ size: 240, fit: "stretch", suffix: "thumb" })).toBeUndefined();
    expect(thumbdirectiveof({ size: 0, fit: "cover", suffix: "thumb" })).toBeUndefined();
    expect(thumbdirectiveof({ size: 240, fit: "cover", suffix: " " })).toBeUndefined();
    const cover = thumbgeometry({ width: 400, height: 200 }, { size: 100, fit: "cover", suffix: "thumb" });
    expect(cover).toMatchObject({
      sw: 200,
      sh: 200,
      sx: 100,
      sy: 0,
      dx: 0,
      dy: 0,
      dw: 100,
      dh: 100,
      width: 100,
      height: 100,
    });
    const contain = thumbgeometry({ width: 400, height: 200 }, { size: 100, fit: "contain", suffix: "thumb" });
    expect(contain).toMatchObject({
      sx: 0,
      sy: 0,
      sw: 400,
      sh: 200,
      dw: 100,
      dh: 50,
      dx: 0,
      dy: 25,
      width: 100,
      height: 100,
    });
    const containtall = thumbgeometry({ width: 100, height: 500 }, { size: 200, fit: "contain", suffix: "t" });
    expect(containtall).toMatchObject({ dw: 40, dh: 200, dx: 80, dy: 0 });
  });

  it("normalizes raw media, asset and stream probe entries from the page bridge", () => {
    expect(
      mediaentries([
        {
          url: "https://example.com/video.mp4",
          mime: "video/mp4",
          duration: 61.5,
          width: 1280,
          height: 720,
          codecs: "avc1.42E01E",
          tracks: ["en"],
        },
        { url: "https://example.com/audio.mp3", mime: "audio/mpeg" },
        { url: "" },
      ]),
    ).toEqual([
      {
        url: "https://example.com/video.mp4",
        mime: "video/mp4",
        duration: 61.5,
        width: 1280,
        height: 720,
        codecs: "avc1.42E01E",
        tracks: ["en"],
      },
      {
        url: "https://example.com/audio.mp3",
        mime: "audio/mpeg",
        duration: 0,
        width: 0,
        height: 0,
        codecs: "",
        tracks: [],
      },
      { url: "", mime: "", duration: 0, width: 0, height: 0, codecs: "", tracks: [] },
    ]);
    expect(
      assetentries([
        { kind: "favicon", url: "https://example.com/icon.png", bytes: 800, sizes: "32x32" },
        { kind: "logo", url: "https://example.com/logo.svg", bytes: 0 },
        { kind: "icon", url: "https://example.com/touch.png", bytes: 1200, sizes: "any" },
        { kind: "unknown", url: "https://example.com/x" },
      ]),
    ).toEqual([
      { kind: "favicon", url: "https://example.com/icon.png", bytes: 800, sizes: "32x32" },
      { kind: "logo", url: "https://example.com/logo.svg", bytes: 0 },
      { kind: "favicon", url: "https://example.com/touch.png", bytes: 1200, sizes: "any" },
      { kind: "favicon", url: "https://example.com/x", bytes: 0 },
    ]);
    expect(
      streamsummaries([
        {
          kind: "webrtc",
          label: "stream-1",
          live: true,
          tracks: [
            { kind: "video", label: "Camera", width: 1280, height: 720, framerate: 30, state: "live" },
            { kind: "audio", label: "Mic", state: "live" },
          ],
        },
        { kind: "webrtc", label: "stream-2", live: false, tracks: [] },
      ]),
    ).toEqual([
      {
        kind: "webrtc",
        tracks: 2,
        label: "stream-1",
        live: true,
        detail: [
          { kind: "video", label: "Camera", width: 1280, height: 720, framerate: 30, state: "live" },
          { kind: "audio", label: "Mic", state: "live" },
        ],
      },
      { kind: "webrtc", tracks: 0, label: "stream-2", live: false, detail: [] },
    ]);
  });
});

describe("network observation part one", () => {
  const instant = async (): Promise<void> => {
    /* the injected sleeper keeps retries instant in tests */
  };

  it("sends one reviewed fetch through the transport seam with status classes and header names", async () => {
    const sent: Array<{ url: string; method: string; headers: Record<string, string>; body?: string }> = [];
    const transport = async (url: string, init: { method: string; headers: Record<string, string>; body?: string }) => {
      sent.push({
        url,
        method: init.method,
        headers: init.headers,
        ...(init.body !== undefined ? { body: init.body } : {}),
      });
      return {
        status: 200,
        headers: { "content-type": "application/json", "x-request-id": "abc" },
        body: '{"ok":true}',
      };
    };
    const result = await sendfetch({
      request: { url: "https://api.example/data", headers: { "x-review": "1" } },
      transport,
      sleep: instant,
    });
    expect(result.status).toBe(200);
    expect(result.statusclass).toBe("success");
    expect(result.headernames).toEqual(["content-type", "x-request-id"]);
    expect(result.bytes).toBe(11);
    expect(result.retries).toBe(0);
    expect(sent[0]?.headers).toEqual({ "x-review": "1" });
    expect(sent[0]?.body).toBeUndefined();
  });

  it("retries failed requests with the reviewed backoff and reports each retry", async () => {
    const waits: number[] = [];
    const retries: Array<{ attempt: number; wait: number; reason: string }> = [];
    let calls = 0;
    const transport = async () => {
      calls += 1;
      if (calls < 3) throw new Error("network down");
      return { status: 200, headers: {}, body: "up" };
    };
    const result = await sendfetch({
      request: { url: "https://api.example/pulse" },
      options: { retries: 3, backoff: 250 },
      transport,
      sleep: async (milliseconds) => {
        waits.push(milliseconds);
      },
      onretry: (attempt, wait, reason) => retries.push({ attempt, wait, reason }),
    });
    expect(result.retries).toBe(2);
    expect(result.body).toBe("up");
    expect(waits).toEqual([250, 500]);
    expect(retries.map((entry) => entry.attempt)).toEqual([1, 2]);
    expect(retries[0]?.reason).toBe("network down");
  });

  it("times an attempt out through the reviewed timeout and refuses after the retries", async () => {
    const transport = async () =>
      new Promise(() => {
        /* the hanging transport never resolves */
      }) as Promise<{ status: number; headers: Record<string, string>; body: string }>;
    await expect(
      sendfetch({
        request: { url: "https://api.example/slow" },
        options: { timeout: 5, retries: 1 },
        transport,
        sleep: instant,
      }),
    ).rejects.toThrow("failed after 2 attempts");
    await expect(
      sendfetch({
        request: { url: "https://api.example/slow" },
        options: { timeout: 5, retries: 1 },
        transport,
        sleep: instant,
      }),
    ).rejects.toThrow("timed out");
  });

  it("honors the reviewed redirect follow limit and refuses chains past it", async () => {
    let hops = 0;
    const transport = async (url: string) => {
      if (url.endsWith("/start"))
        return {
          status: 302,
          headers: { location: "https://api.example/one" },
          body: "",
          location: "https://api.example/one",
        };
      if (url.endsWith("/one")) {
        hops += 1;
        return { status: 302, headers: {}, body: "", location: "https://api.example/two" };
      }
      return { status: 200, headers: {}, body: "arrived" };
    };
    const bounded = await sendfetch({
      request: { url: "https://api.example/start", method: "POST" },
      options: { follow: 2 },
      transport,
      sleep: instant,
    });
    expect(bounded.status).toBe(200);
    expect(bounded.redirects).toBe(2);
    expect(bounded.url).toBe("https://api.example/two");
    await expect(
      sendfetch({ request: { url: "https://api.example/start" }, options: { follow: 1 }, transport, sleep: instant }),
    ).rejects.toThrow("follow limit");
  });

  it("extracts dotted json paths with kinds, defaults and miss flags instead of crashing", () => {
    const parsed = { user: { name: "Ada", tags: ["alpha", "beta"], admin: true }, count: "41" };
    const fields = readpath(parsed, [
      { name: "name", path: "user.name", kind: "text" },
      { name: "first", path: "user.tags.0", kind: "text" },
      { name: "admin", path: "user.admin", kind: "boolean" },
      { name: "count", path: "count", kind: "number" },
      { name: "meta", path: "user.meta", kind: "json", default: { none: true } },
      { name: "missing", path: "user.absent.deep", kind: "text", default: "fallback" },
    ]);
    expect(fields[0]).toMatchObject({ name: "name", value: "Ada" });
    expect(fields[0]?.missing).toBeUndefined();
    expect(fields[1]).toMatchObject({ name: "first", value: "alpha" });
    expect(fields[2]).toMatchObject({ name: "admin", value: true });
    expect(fields[3]).toMatchObject({ name: "count", value: 41 });
    expect(fields[4]).toMatchObject({ name: "meta", value: { none: true }, missing: true });
    expect(fields[5]).toMatchObject({ name: "missing", value: "fallback", missing: true });
  });

  it("parses fetched markup through the parse seam with attribute values, text and element counts", () => {
    const parse: domparse = (markup) => ({
      query: (selector) =>
        selector === "a.link"
          ? [
              { text: " Docs ", attributes: { href: "/docs", rel: "help" } },
              { text: " Blog ", attributes: { href: "/blog" } },
            ]
          : selector === "h1"
            ? [{ text: `parsed ${markup.length} characters`, attributes: {} }]
            : [],
    });
    const results = parsehtmlbody({
      body: "<html><body>markup</body></html>",
      queries: [{ selector: "a.link", attribute: "href", multi: true }, { selector: "h1" }],
      parse,
    });
    expect(results[0]).toEqual({
      selector: "a.link",
      attribute: "href",
      multi: true,
      count: 2,
      values: ["/docs", "/blog"],
    });
    expect(results[1]).toEqual({ selector: "h1", multi: false, count: 1, values: ["parsed 32 characters"] });
    expect(parsehtmlbody({ body: "x", queries: [{ selector: "a" }], parse }).length).toBe(1);
  });

  it("streams large bodies chunk by chunk with the reviewed handler path and aborts past the byte budget", async () => {
    const seen: string[] = [];
    const totals: number[] = [];
    const window: streamwindow = {
      budget: 100,
      onchunk: (chunk: string, total: number) => {
        seen.push(chunk);
        totals.push(total);
      },
    };
    const done = await readstream({ chunks: ["a".repeat(30), "b".repeat(40), "c".repeat(50)], window });
    expect(done).toEqual({
      chunks: 2,
      bytes: 70,
      aborted: true,
      reason: expect.stringContaining("byte budget of 100"),
    });
    expect(seen).toEqual(["a".repeat(30), "b".repeat(40)]);
    expect(totals).toEqual([30, 70]);
    const clean = await readstream({ chunks: ["x", "y"], window: { onchunk: (chunk: string) => seen.push(chunk) } });
    expect(clean).toEqual({ chunks: 2, bytes: 2, aborted: false });
    let stop = false;
    const aborted = await readstream({
      chunks: ["first", "second", "third"],
      window: {
        abort: () => stop,
        onchunk: () => {
          stop = true;
        },
      },
    });
    expect(aborted).toMatchObject({
      chunks: 1,
      bytes: 5,
      aborted: true,
      reason: expect.stringContaining("abort flag"),
    });
  });

  it("executes typed rest calls with schema validation, url templating and reviewed status classes", async () => {
    const endpoint: endpointrecord = {
      name: "issues",
      method: "GET",
      url: "https://api.example/repos/{owner}/{repo}/issues",
      schema: {
        fields: [
          { name: "owner", kind: "string", required: true },
          { name: "repo", kind: "string", required: true },
          { name: "open", kind: "boolean", default: true },
        ],
      },
      version: 1,
      at: 1,
    };
    await expect(
      callrest({
        endpoint,
        payload: { repo: "extension" },
        transport: async () => ({ status: 200, headers: {}, body: "" }),
        sleep: instant,
      }),
    ).rejects.toThrow("required field owner");
    const calls: Array<{ url: string; method: string; body?: string }> = [];
    const ok = await callrest({
      endpoint,
      payload: { owner: "wenathlan", repo: "extension" },
      transport: async (url, init) => {
        calls.push({ url, method: init.method, ...(init.body !== undefined ? { body: init.body } : {}) });
        return { status: 200, headers: {}, body: '[{"id":1}]' };
      },
      sleep: instant,
    });
    expect(ok.ok).toBe(true);
    expect(ok.url).toBe("https://api.example/repos/wenathlan/extension/issues");
    expect(calls[0]?.method).toBe("GET");
    expect(ok.payload).toEqual({ owner: "wenathlan", repo: "extension", open: true });
    const custom = await callrest({
      endpoint,
      payload: { owner: "a", repo: "b" },
      success: [404],
      transport: async () => ({ status: 404, headers: {}, body: '{"error":"not found"}' }),
      sleep: instant,
    });
    expect(custom.ok).toBe(true);
    expect(custom.errors).toEqual([]);
    const failing = await callrest({
      endpoint,
      payload: { owner: "a", repo: "b" },
      transport: async () => ({ status: 500, headers: {}, body: '{"errors":[{"message":"boom"},"secondary"]}' }),
      sleep: instant,
    });
    expect(failing.ok).toBe(false);
    expect(failing.errors).toEqual(["boom", "secondary"]);
    const post: endpointrecord = {
      name: "create",
      method: "POST",
      url: "https://api.example/create",
      schema: { fields: [{ name: "title", kind: "string", required: true }] },
      version: 1,
      at: 1,
    };
    const created = await callrest({
      endpoint: post,
      payload: { title: "note" },
      transport: async (url, init) => {
        calls.push({ url, method: init.method, ...(init.body !== undefined ? { body: init.body } : {}) });
        return { status: 201, headers: {}, body: "{}" };
      },
      sleep: instant,
    });
    expect(created.ok).toBe(true);
    expect(JSON.parse(String(calls[1]?.body))).toEqual({ title: "note" });
  });

  it("executes typed graphql calls with envelope wrapping and data and error unwrapping", async () => {
    const endpoint: endpointrecord = {
      name: "graph",
      method: "POST",
      url: "https://api.example/graphql",
      schema: { fields: [{ name: "unused", kind: "string", required: true }] },
      version: 1,
      at: 1,
    };
    let sentbody = "";
    const ok = await callgraphql({
      endpoint,
      request: {
        query: "query Hero($id: ID!){ hero(id:$id){ name } }",
        operationkind: "query",
        variables: { id: "1" },
        operationname: "Hero",
      },
      transport: async (url, init) => {
        sentbody = init.body ?? "";
        return { status: 200, headers: {}, body: '{"data":{"hero":{"name":"Luke"}}}' };
      },
      sleep: instant,
    });
    expect(JSON.parse(sentbody)).toEqual({
      query: "query Hero($id: ID!){ hero(id:$id){ name } }",
      variables: { id: "1" },
      operationName: "Hero",
    });
    expect(ok.data).toEqual({ hero: { name: "Luke" } });
    expect(ok.errors).toEqual([]);
    const failed = await callgraphql({
      endpoint,
      request: { query: "mutation Like{ like }", operationkind: "mutation" },
      transport: async () => ({
        status: 200,
        headers: {},
        body: '{"errors":[{"message":"auth required"},"rate limited"]}',
      }),
      sleep: instant,
    });
    expect(failed.data).toBeUndefined();
    expect(failed.errors).toEqual(["auth required", "rate limited"]);
    const nonjson = await callgraphql({
      endpoint,
      request: { query: "query Q{ q }", operationkind: "query" },
      transport: async () => ({ status: 502, headers: {}, body: "bad gateway" }),
      sleep: instant,
    });
    expect(nonjson.errors).toEqual(["bad gateway"]);
    expect(unwrapgraphql({ data: 7 })).toEqual({ data: 7, errors: [] });
    expect(unwrapgraphql("nope")).toEqual({ errors: ["The graphql response is not a json object."] });
  });

  it("normalizes fetch requests, fetch options, stream windows, path rules, html queries and graphql requests", () => {
    expect(
      fetchrequestof({
        url: " https://api.example/x ",
        method: "post",
        headers: { "x-a": "1" },
        body: "b",
        mode: "cors",
      }),
    ).toEqual({ url: "https://api.example/x", method: "POST", headers: { "x-a": "1" }, body: "b", mode: "cors" });
    expect(fetchrequestof({ url: "" })).toBeUndefined();
    expect(fetchrequestof("nope")).toBeUndefined();
    expect(fetchoptionsof({ timeout: 5, retries: 2, backoff: 100, follow: 3 })).toEqual({
      timeout: 5,
      retries: 2,
      backoff: 100,
      follow: 3,
    });
    expect(fetchoptionsof(null)).toEqual({});
    expect(streamwindowof({ budget: 4096 })).toEqual({ budget: 4096 });
    expect(
      jsonpathrulesof([
        { name: "a", path: "x.y" },
        { name: "", path: "x" },
        { path: "y" },
        "bad",
        { name: "b", path: "z", kind: "number", default: 3 },
      ]),
    ).toEqual([
      { name: "a", path: "x.y" },
      { name: "b", path: "z", kind: "number", default: 3 },
    ]);
    expect(htmlqueriesof([{ selector: " a ", attribute: "href", multi: true }, { selector: "" }, 3])).toEqual([
      { selector: "a", attribute: "href", multi: true },
    ]);
    expect(
      graphqlrequestof({ query: " query ", operationkind: "query", variables: { a: 1 }, operationname: "Q" }),
    ).toEqual({ query: " query ", operationkind: "query", variables: { a: 1 }, operationname: "Q" });
    expect(graphqlrequestof({ query: "q", operationkind: "subscription" })).toBeUndefined();
    expect(
      templateurl("https://api.example/{owner}/{repo}/issues?state={state}", { owner: "w", repo: "e", state: "open" }),
    ).toBe("https://api.example/w/e/issues?state=open");
    expect(templateurl("https://api.example/{missing}", {})).toBe("https://api.example/{missing}");
    expect(statusclassof(100)).toBe("informational");
    expect(statusclassof(204)).toBe("success");
    expect(statusclassof(301)).toBe("redirect");
    expect(statusclassof(404)).toBe("clienterror");
    expect(statusclassof(503)).toBe("servererror");
    expect(statusclassof(900)).toBe("unknown");
  });
});

describe("network observation part two sockets", () => {
  const instant = async (): Promise<void> => undefined;

  it("opens a reviewed channel through the connect seam with reconnection backoff and failure classes", async () => {
    const attempts: number[] = [];
    let calls = 0;
    const connect = async (url: string): Promise<{ open: boolean; code?: number; error?: string }> => {
      calls += 1;
      attempts.push(calls);
      if (calls < 3) return { open: false, code: 1006, error: `refused ${url}` };
      return { open: true };
    };
    const record = newchannel({
      id: "ch1",
      runid: "run",
      stepid: "s1",
      kind: "websocket",
      url: "wss://api.example/stream",
      protocols: ["chat"],
      at: 1000,
    });
    expect(record.origin).toBe("https://api.example");
    expect(record.state).toBe("connecting");
    const waits: number[] = [];
    const opened = await openchannel({
      record,
      options: { reconnect: 3, backoff: 100 },
      connect,
      sleep: async (ms) => {
        waits.push(ms);
      },
      now: () => 5000,
    });
    expect(opened.state).toBe("open");
    expect(opened.reconnects).toBe(2);
    expect(opened.openedat).toBe(5000);
    expect(waits).toEqual([100, 200]);
    expect(attempts).toEqual([1, 2, 3]);
    const failing = await openchannel({
      record: newchannel({
        id: "ch2",
        runid: "run",
        stepid: "s1",
        kind: "websocket",
        url: "wss://api.example/down",
        at: 1,
      }),
      options: { reconnect: 1, backoff: 10 },
      connect: async () => {
        throw new Error("network down");
      },
      sleep: instant,
      now: () => 2,
    });
    expect(failing.state).toBe("failed");
    expect(failing.error).toBe("network down");
    const closed = closechannel(opened, 9000);
    expect(closed.state).toBe("closed");
    expect(closed.closedat).toBe(9000);
    expect(closechannel(opened, 9000, "code 1006").error).toBe("code 1006");
  });

  it("bounds backoff growth at the user configured ceiling with no code ceiling", () => {
    expect(reconnectwaits(3, 100, 500)).toEqual([100, 200, 400]);
    expect(reconnectwaits(4, 100, 300)).toEqual([100, 200, 300, 300]);
    expect(reconnectwaits(3, 100, undefined)).toEqual([100, 200, 400]);
    expect(reconnectwaits(0, 100, 500)).toEqual([]);
    expect(reconnectwaits(2, 0, 500)).toEqual([0, 0]);
  });

  it("multiplexes named message streams over one channel with channel scoped sequences", () => {
    let bus: busstate = { sequences: {}, queue: [] };
    const first = publishmessage(bus, "ch1", "orders", '{"id":1}', 10);
    bus = first.state;
    const second = receivemessage(bus, "ch1", "inbound", '{"tick":true}', 11);
    bus = second.state;
    const third = publishmessage(bus, "ch1", "chat", "hello", 12);
    bus = third.state;
    expect(first.envelope.sequence).toBe(1);
    expect(second.envelope.sequence).toBe(2);
    expect(third.envelope.sequence).toBe(3);
    expect(bus.queue.map((envelope) => envelope.sequence)).toEqual([2]);
    const other = publishmessage(bus, "ch2", "chat", "other channel", 13);
    expect(other.envelope.sequence).toBe(1);
    expect(sequenceintegrity([first.envelope, second.envelope, third.envelope, other.envelope]).ok).toBe(true);
    const broken = [
      first.envelope,
      second.envelope,
      third.envelope,
      { channelid: "ch1", stream: "inbound", payload: "x", sequence: 9, at: 1 },
    ];
    const verdict = sequenceintegrity(broken);
    expect(verdict.ok).toBe(false);
    expect(verdict.gaps).toEqual([{ channelid: "ch1", expected: 4, found: 9 }]);
  });

  it("matches message filters by stream and dotted json path and collects up to the reviewed limit", () => {
    let bus: busstate = { sequences: {}, queue: [] };
    bus = receivemessage(bus, "ch1", "orders", '{"id":1}', 1).state;
    bus = receivemessage(bus, "ch1", "ticks", '{"tick":true}', 2).state;
    bus = receivemessage(bus, "ch1", "orders", '{"id":2}', 3).state;
    bus = receivemessage(bus, "ch1", "orders", "not json", 4).state;
    const filter = messagefilterof({ stream: "orders", path: "id", limit: 2 });
    expect(filter).toEqual({ stream: "orders", path: "id", limit: 2 });
    expect(matchmessage(filter, { channelid: "ch1", stream: "ticks", payload: "{}", sequence: 9, at: 1 })).toBe(false);
    expect(
      matchmessage({ path: "id" }, { channelid: "ch1", stream: "orders", payload: "not json", sequence: 10, at: 1 }),
    ).toBe(false);
    expect(
      matchmessage(
        { path: "missing.deep" },
        { channelid: "ch1", stream: "orders", payload: '{"id":1}', sequence: 11, at: 1 },
      ),
    ).toBe(false);
    expect(matchmessage(undefined, { channelid: "ch1", stream: "orders", payload: "{}", sequence: 12, at: 1 })).toBe(
      true,
    );
    const collected = collectmessages(bus, "ch1", filter);
    expect(collected.matched.map((envelope) => envelope.payload)).toEqual(['{"id":1}', '{"id":2}']);
    expect(collected.state.queue.map((envelope) => envelope.payload)).toEqual(['{"tick":true}', "not json"]);
    expect(collectmessages(bus, "ch1", { stream: "orders" }).matched).toHaveLength(3);
    expect(messagefilterof({ stream: " ", path: "", limit: 0 })).toEqual({});
    expect(messagefilterof("bad")).toEqual({});
  });

  it("parses server sent events with ids, names, data lines and retry, resuming from the last event id", () => {
    const parsed = parsessetext(
      "id: 41\nevent: userjoin\ndata: first\ndata: second\nretry: 2500\n\n: comment\n\nid: 42\ndata: solo\n\npartial data",
    );
    expect(parsed.events[0]).toEqual({ id: "41", event: "userjoin", data: "first\nsecond", retry: 2500 });
    expect(parsed.events[1]).toEqual({ id: "42", data: "solo" });
    expect(parsed.rest).toBe("partial data");
    expect(parsessetext("data: only\n\n").events).toEqual([{ data: "only" }]);
    expect(parsessetext("nothing complete").events).toEqual([]);
    expect(parsessetext("nothing complete").rest).toBe("nothing complete");
    expect(sserequestheaders({})).toEqual({ accept: "text/event-stream" });
    expect(sserequestheaders({ lasteventid: "41" })).toEqual({ accept: "text/event-stream", "last-event-id": "41" });
    expect(
      subscriptionoptionsof({
        url: " https://api.example/stream ",
        lifetime: 5000,
        lasteventid: "9",
        cancel: { kind: "stop", value: "done" },
      }),
    ).toEqual({
      url: "https://api.example/stream",
      lifetime: 5000,
      lasteventid: "9",
      cancel: { kind: "stop", value: "done" },
    });
    expect(subscriptionoptionsof({ url: "https://api.example/stream" })).toBeUndefined();
    expect(
      subscriptionoptionsof({ url: "https://api.example/stream", cancel: { kind: "never", value: 1 } }),
    ).toBeUndefined();
  });

  it("runs long poll cursor loops with stop conditions, poll ceilings and cancellation", () => {
    const parsedcursor = pollcursorof({
      url: "https://api.example/poll",
      cursorfield: "cursor",
      interval: 50,
      stop: { field: "done", equals: "yes" },
      maxpolls: 3,
      param: "since",
    });
    if (!parsedcursor) throw new Error("The reviewed poll cursor fixture must parse.");
    const cursor = parsedcursor;
    expect(
      pollcursorof({
        url: "https://api.example/poll",
        cursorfield: "cursor",
        interval: 0,
        stop: { field: "done", equals: "yes" },
      }),
    ).toBeUndefined();
    expect(
      pollcursorof({
        url: "https://api.example/poll",
        cursorfield: "",
        interval: 10,
        stop: { field: "done", equals: "yes" },
      }),
    ).toBeUndefined();
    expect(pollcursorof({ url: "https://api.example/poll", cursorfield: "c", interval: 10 })).toBeUndefined();
    expect(pollurl(cursor, "42")).toEqual({ url: "https://api.example/poll?since=42" });
    const bodycursor = { ...cursor };
    delete bodycursor.param;
    expect(pollurl(bodycursor, "42")).toEqual({ url: "https://api.example/poll", body: '{"cursor":"42"}' });
    expect(pollurl(cursor, undefined)).toEqual({ url: "https://api.example/poll" });
    expect(cursorfrom({ cursor: "7", nested: { page: 2 } }, "nested.page")).toBe("2");
    expect(cursorfrom({ cursor: "7" }, "missing")).toBeUndefined();
    const going = polldecision({ cursor, polls: 0, response: { cursor: "7", done: "no" }, now: 1000 });
    expect(going.continue).toBe(true);
    expect(going.cursor).toBe("7");
    expect(going.next).toEqual({ url: "https://api.example/poll?since=7", wait: 50 });
    expect(polldecision({ cursor, polls: 0, response: { done: "yes" }, now: 1000 })).toMatchObject({
      continue: false,
      reason: expect.stringContaining("stop condition"),
    });
    expect(polldecision({ cursor, polls: 2, response: { cursor: "9" }, now: 1000 })).toMatchObject({
      continue: false,
      reason: expect.stringContaining("poll ceiling"),
    });
    expect(
      polldecision({ cursor, polls: 0, response: { cursor: "9" }, cancelled: () => true, now: 1000 }),
    ).toMatchObject({ continue: false, reason: expect.stringContaining("cancelled") });
    expect(polldecision({ cursor, polls: 0, response: { cursor: "9" }, expiresat: 999, now: 1000 })).toMatchObject({
      continue: false,
      reason: expect.stringContaining("plan expiry"),
    });
  });

  it("normalizes channel open options and channel origins", () => {
    expect(
      channeloptionsof({
        url: " wss://api.example/live ",
        protocols: ["a", " ", 3],
        reconnect: 2,
        backoff: 100,
        backoffceiling: 1000,
        lifetime: 9000,
      }),
    ).toEqual({
      url: "wss://api.example/live",
      options: { protocols: ["a"], reconnect: 2, backoff: 100, backoffceiling: 1000, lifetime: 9000 },
    });
    expect(channeloptionsof({ url: "" })).toBeUndefined();
    expect(channeloptionsof("nope")).toBeUndefined();
    expect(channelorigin("wss://api.example/live")).toBe("https://api.example");
    expect(channelorigin("https://api.example/stream")).toBe("https://api.example");
    expect(channelorigin("not a url")).toBe("");
  });
});

describe("network observation part two netwatch", () => {
  it("derives request facts from the timing buffers and marks failed requests with status and error class", () => {
    const facts = resourcefacts([
      {
        name: "https://example.com/app.js",
        initiatorType: "script",
        entryType: "resource",
        startTime: 10,
        duration: 40,
        transferSize: 1200,
        nextHopProtocol: "h2",
      },
      {
        name: "https://api.example/items",
        initiatorType: "fetch",
        entryType: "resource",
        startTime: 20,
        duration: 90,
        transferSize: 0,
        nextHopProtocol: "",
      },
      {
        name: "https://example.com/",
        initiatorType: "navigation",
        entryType: "navigation",
        startTime: 0,
        duration: 500,
        transferSize: 4000,
        nextHopProtocol: "h2",
        responseStatus: 500,
      },
      {
        name: "",
        initiatorType: "script",
        entryType: "resource",
        startTime: 1,
        duration: 1,
        transferSize: 1,
        nextHopProtocol: "h2",
      },
      {
        name: "https://example.com/paint",
        initiatorType: "paint",
        entryType: "paint",
        startTime: 2,
        duration: 1,
        transferSize: 0,
        nextHopProtocol: "",
      },
    ]);
    expect(facts).toHaveLength(3);
    expect(failureclass(facts[0] as resourcefact)).toEqual({ status: 0 });
    expect(failureclass(facts[1] as resourcefact)).toEqual({ errorclass: "networkerror", status: 0 });
    expect(failureclass({ ...(facts[2] as resourcefact), status: 500 })).toEqual({
      errorclass: "httperror",
      status: 500,
    });
    expect(failureclass({ ...(facts[0] as resourcefact), failed: true })).toEqual({
      errorclass: "networkerror",
      status: 0,
    });
    const exchange = newexchange({
      id: "e1",
      runid: "run",
      stepid: "s1",
      correlationid: correlationid("run", 0),
      fact: facts[1] as resourcefact,
      at: 50,
    });
    expect(exchange.method).toBe("?");
    expect(exchange.status).toBe(0);
    expect(exchange.errorclass).toBe("networkerror");
    expect(exchange.source).toBe("page");
    expect(exchange.timing).toBe(90);
    expect(
      newexchange({
        id: "e2",
        runid: "run",
        stepid: "s1",
        correlationid: correlationid("run", 1),
        fact: facts[0] as resourcefact,
        at: 51,
      }).method,
    ).toBe("GET");
    expect(correlationid("run", 0)).toBe("run-1");
  });

  it("joins request and response pairs through correlation ids and refuses mismatches", () => {
    const exchange = newexchange({
      id: "e1",
      runid: "run",
      stepid: "s1",
      correlationid: "run-1",
      fact: {
        url: "https://api.example/items",
        initiator: "fetch",
        entrytype: "resource",
        start: 1,
        duration: 30,
        transfer: 0,
        protocol: "h2",
      },
      at: 10,
    });
    const response: responseentry = {
      correlationid: "run-1",
      status: 200,
      headers: { "content-type": "application/json" },
      bytes: 128,
      mime: "application/json",
      bodyref: "body1",
      at: 12,
    };
    const paired = pairexchange(exchange, response);
    expect(paired.status).toBe(200);
    expect(paired.statusclass).toBe("success");
    expect(paired.mime).toBe("application/json");
    expect(paired.bodyref).toBe("body1");
    expect(paired.responseheaders).toEqual({ "content-type": "application/json" });
    expect(() => pairexchange(exchange, { ...response, correlationid: "run-9" })).toThrow("does not pair");
    expect(filterexchanges([paired, exchange], { runid: "run" })).toHaveLength(2);
    expect(filterexchanges([paired, exchange], { status: 200 })).toHaveLength(1);
    expect(filterexchanges([paired, exchange], { origin: "https://api.example" })).toHaveLength(2);
    expect(
      filterexchanges(
        [
          newexchange({
            id: "e9",
            runid: "run",
            stepid: "s1",
            correlationid: "run-9",
            fact: {
              url: "https://api.example/x",
              initiator: "fetch",
              entrytype: "resource",
              start: 1,
              duration: 90,
              transfer: 0,
              protocol: "",
            },
            at: 1,
          }),
        ],
        { status: "failed" },
      ),
    ).toHaveLength(1);
  });

  it("applies header allowlists and redaction lists before any header value is stored", () => {
    const filter = headerfilterof({
      allow: ["Content-Type", " x-request-id ", "X-Auth-Token"],
      redact: ["X-Auth-Token"],
    });
    expect(filter).toEqual({ allow: ["content-type", "x-request-id", "x-auth-token"], redact: ["x-auth-token"] });
    expect(headerfilterof("bad")).toEqual({ allow: [], redact: [] });
    expect(
      capturedheaders({ "Content-Type": "application/json", "X-Auth-Token": "secret", "X-Other": "kept" }, filter),
    ).toEqual({ "content-type": "application/json", "x-auth-token": "[redacted]" });
    expect(capturedheaders({ "X-Other": "kept" }, filter)).toEqual({});
    expect(capturedheaders({ "X-Auth-Token": "secret" }, { allow: ["x-other"], redact: ["x-auth-token"] })).toEqual({});
  });

  it("captures bodies through reviewed filters with byte ceilings and truncation", () => {
    const filter = bodyfilterof({ urlpattern: "api.example", mimes: ["application/json"], ceiling: 10 });
    expect(filter).toEqual({ urlpattern: "api.example", mimes: ["application/json"], ceiling: 10 });
    expect(bodyfilterof("bad")).toEqual({});
    const exchange = newexchange({
      id: "e1",
      runid: "run",
      stepid: "s1",
      correlationid: "run-1",
      fact: {
        url: "https://api.example/items",
        initiator: "fetch",
        entrytype: "resource",
        start: 1,
        duration: 30,
        transfer: 0,
        protocol: "h2",
      },
      at: 10,
    });
    expect(bodymatches(filter, { url: "https://api.example/items", mime: "application/json; charset=utf-8" })).toBe(
      true,
    );
    expect(bodymatches(filter, { url: "https://other.example/items", mime: "application/json" })).toBe(false);
    expect(bodymatches(filter, { url: "https://api.example/items", mime: "text/html" })).toBe(false);
    expect(bodymatches({}, { url: "https://api.example/items" })).toBe(true);
    const captured = capturebody({
      ref: "body1",
      runid: "run",
      exchange: { ...exchange, mime: "application/json" },
      body: '{"items":[1,2,3]}',
      mime: "application/json",
      filter,
      at: 20,
    });
    expect("record" in captured && captured.record.bytes).toBe(10);
    expect("record" in captured && captured.record.body).toBe('{"items":[');
    expect("record" in captured && captured.truncated).toBe(true);
    expect("record" in captured && captured.record.correlationid).toBe("run-1");
    const refused = capturebody({
      ref: "body2",
      runid: "run",
      exchange: { ...exchange, url: "https://other.example/x" },
      body: "x",
      mime: "text/html",
      filter,
      at: 20,
    });
    expect("refused" in refused && refused.refused).toContain("does not match");
    expect(privatemime("application/json; charset=utf-8")).toBe(true);
    expect(privatemime("text/html")).toBe(true);
    expect(privatemime("image/png")).toBe(false);
    expect(privatemime("font/woff2")).toBe(false);
  });

  it("maps and ranks page api endpoints by frequency, json share and payload stability", () => {
    const mk = (id: string, correlationid: string, url: string, bodyref?: string): exchangerecord => ({
      id,
      runid: "run",
      stepid: "s1",
      correlationid,
      url,
      origin: new URL(url).origin,
      method: "GET",
      status: 200,
      statusclass: "success",
      source: "extension",
      timing: 10,
      bytes: 20,
      at: 1,
      ...(bodyref !== undefined ? { bodyref } : {}),
    });
    const exchanges = [
      mk("e1", "run-1", "https://api.example/items?page=1", "b1"),
      mk("e2", "run-2", "https://api.example/items?page=2", "b2"),
      mk("e3", "run-3", "https://api.example/items?page=3", "b3"),
      mk("e4", "run-4", "https://api.example/users?u=1", "b4"),
      mk("e5", "run-5", "https://cdn.example/logo.png"),
    ];
    const bodies: bodyrecord[] = [
      {
        ref: "b1",
        runid: "run",
        correlationid: "run-1",
        url: "https://api.example/items?page=1",
        mime: "application/json",
        bytes: 10,
        body: '{"id":1,"name":"a"}',
        at: 1,
      },
      {
        ref: "b2",
        runid: "run",
        correlationid: "run-2",
        url: "https://api.example/items?page=2",
        mime: "application/json",
        bytes: 10,
        body: '{"id":2,"name":"b"}',
        at: 1,
      },
      {
        ref: "b3",
        runid: "run",
        correlationid: "run-3",
        url: "https://api.example/items?page=3",
        mime: "application/json",
        bytes: 10,
        body: "not json",
        at: 1,
      },
      {
        ref: "b4",
        runid: "run",
        correlationid: "run-4",
        url: "https://api.example/users?u=1",
        mime: "application/json",
        bytes: 10,
        body: '{"user":{"id":1}}',
        at: 1,
      },
    ];
    const entries = rankapis(apientries(exchanges, bodies));
    expect(entries).toHaveLength(2);
    expect(entries[0]?.endpoint).toBe("https://api.example/items");
    expect(entries[0]?.frequency).toBe(3);
    expect(entries[0]?.jsonshare).toBeCloseTo(2 / 3);
    expect(entries[0]?.stability).toBeCloseTo(2 / 3);
    expect(entries[0]?.payloadshape).toEqual(["id", "name"]);
    expect(entries[0]?.correlationids).toEqual(["run-1", "run-2", "run-3"]);
    expect(entries[1]?.endpoint).toBe("https://api.example/users");
    expect(payloadshapeof('[{"a":1}]')).toEqual(["a"]);
    expect(payloadshapeof("[]")).toEqual([]);
    expect(payloadshapeof("nope")).toEqual([]);
    expect(payloadshapeof(undefined)).toEqual([]);
  });

  it("builds reviewed api replay specs with overrides and extraction paths", () => {
    const parsedspec = apireplayspecof({
      endpoint: " https://api.example/items ",
      verb: "get",
      overrides: { page: "2", limit: "10" },
      paths: ["items.0.id", "total"],
    });
    if (!parsedspec) throw new Error("The reviewed api replay fixture must parse.");
    const spec = parsedspec;
    expect(spec).toEqual({
      endpoint: "https://api.example/items",
      verb: "GET",
      overrides: { page: "2", limit: "10" },
      paths: ["items.0.id", "total"],
    });
    expect(replayurl(spec)).toBe("https://api.example/items?page=2&limit=10");
    expect(apireplayspecof({ endpoint: "" })).toBeUndefined();
    expect(apireplayspecof("bad")).toBeUndefined();
    expect(apireplayspecof({ endpoint: "https://api.example/items", overrides: { a: 1, b: "x" } })?.overrides).toEqual({
      b: "x",
    });
    expect(extractvalues('{"items":[{"id":7}],"total":1}', ["items.0.id", "total", "missing"])).toEqual([
      { path: "items.0.id", value: 7 },
      { path: "total", value: 1 },
      { path: "missing", missing: true },
    ]);
    expect(extractvalues("not json", ["a"])).toEqual([{ path: "a", missing: true }]);
  });
});

describe("network control rules", () => {
  it("matches url patterns by origin with single and double star segments", () => {
    expect(matchurlpattern("https://api.example", "https://api.example/items")).toBe(true);
    expect(matchurlpattern("https://api.example/v1/*", "https://api.example/v1/items")).toBe(true);
    expect(matchurlpattern("https://api.example/v1/*", "https://api.example/v1/a/b")).toBe(false);
    expect(matchurlpattern("https://api.example/v1/**", "https://api.example/v1/a/b")).toBe(true);
    expect(matchurlpattern("https://api.example", "https://other.example/items")).toBe(false);
    expect(matchurlpattern("api.example/*", "https://api.example/items")).toBe(false);
    expect(patternorigin("https://api.example/v1")).toBe("https://api.example");
    expect(patternorigin("api.example")).toBeUndefined();
  });

  it("registers block rules and reverts them at run end keeping the hit counter", () => {
    const rule = newblockrule({ id: "b1", runid: "run1", stepid: "s1", urlpattern: "https://ads.example/*", at: 10 });
    expect(rule.hits).toBe(0);
    expect(rule.revertedat).toBeUndefined();
    const hit = { ...rule, hits: 3 };
    const reverted = revertrule(hit, 99);
    expect(reverted.revertedat).toBe(99);
    expect(reverted.hits).toBe(3);
    expect(revertrule(reverted, 120).revertedat).toBe(99);
  });

  it("serves the first reviewed mock fixture that matches and never unreviewed ones", () => {
    const spec = newmockspec({
      id: "m1",
      runid: "run1",
      stepid: "s1",
      urlpattern: "https://api.example/status",
      status: 204,
      body: '{"ok":true}',
      reviewed: true,
      at: 5,
    });
    expect(mockfor("https://api.example/status", [spec])).toBe(spec);
    expect(mockfor("https://api.example/other", [spec])).toBeUndefined();
    const reverted = { ...revertrule(spec, 9) };
    expect(mockfor("https://api.example/status", [reverted])).toBeUndefined();
    expect(mockspecof({ urlpattern: "https://api.example", status: 200, body: "", reviewed: true })?.status).toBe(200);
    expect(mockspecof({ urlpattern: "https://api.example", status: 999, body: "", reviewed: true })).toBeUndefined();
    const replay = mockspecof({
      urlpattern: "https://api.example/items",
      status: 200,
      bodyref: "body-7",
      reviewed: true,
    });
    expect(replay).toMatchObject({ bodyref: "body-7", status: 200 });
    const resolved = newmockspec({
      id: "m2",
      runid: "run1",
      stepid: "s1",
      urlpattern: "https://api.example/items",
      status: 200,
      body: "captured-body",
      bodyref: "body-7",
      reviewed: true,
      at: 2,
    });
    expect(mockfor("https://api.example/items", [resolved])).toBe(resolved);
    expect(mockspecof({ urlpattern: "https://api.example", status: 200, reviewed: true })).toBeUndefined();
  });

  it("applies set, append and remove header operations with the provenance of every applied rule", () => {
    const set = newheaderule({
      id: "h1",
      runid: "run1",
      stepid: "s1",
      urlpattern: "https://api.example/*",
      name: "accept",
      operation: "set",
      value: "application/json",
      at: 1,
    });
    const append = newheaderule({
      id: "h2",
      runid: "run1",
      stepid: "s1",
      urlpattern: "https://api.example/*",
      name: "x-trace",
      operation: "append",
      value: "b",
      at: 1,
    });
    const remove = newheaderule({
      id: "h3",
      runid: "run1",
      stepid: "s1",
      urlpattern: "https://api.example/*",
      name: "cookie",
      operation: "remove",
      at: 1,
    });
    const other = newheaderule({
      id: "h4",
      runid: "run1",
      stepid: "s1",
      urlpattern: "https://other.example/*",
      name: "accept",
      operation: "set",
      value: "text/html",
      at: 1,
    });
    const result = applyheaderules(
      "https://api.example/items",
      { accept: "text/html", cookie: "session=1", "x-trace": "a" },
      [set, append, remove, other],
    );
    expect(result.headers).toEqual({ accept: "application/json", "x-trace": "a, b" });
    expect(result.applied.map((rule) => rule.id)).toEqual(["h1", "h2", "h3"]);
    expect(
      headeruleof({ urlpattern: "https://api.example", name: "accept", operation: "set", value: "1" })?.operation,
    ).toBe("set");
    expect(
      headeruleof({ urlpattern: "https://api.example", name: "accept", operation: "remove", value: "1" }),
    ).toBeUndefined();
  });

  it("scopes cookies to granted domains and refuses every other domain", () => {
    expect(cookiedomaingranted("example.com", ["https://example.com"])).toBe(true);
    expect(cookiedomaingranted(".example.com", ["https://example.com"])).toBe(true);
    expect(cookiedomaingranted("api.example.com", ["https://example.com"])).toBe(true);
    expect(cookiedomaingranted("notexample.com", ["https://example.com"])).toBe(false);
    expect(cookiedomaingranted("example.com", ["https://api.example.com"])).toBe(false);
    const record = cookierecordof({ name: "session", domain: "Example.com", path: "/", value: "abc", expiresat: 50 });
    expect(record).toMatchObject({ name: "session", domain: "example.com", path: "/", expiresat: 50 });
    expect(redactedcookies([record ?? { name: "", domain: "", path: "", value: "secret" }])).toEqual([
      { name: "session", domain: "example.com", path: "/", expiresat: 50 },
    ]);
  });

  it("parses proxy routes only with a non-empty bypass list", () => {
    expect(
      proxyrouteof({ scheme: "socks5", host: "proxy.example", port: 1080, bypass: ["https://api.example"] }),
    ).toMatchObject({ scheme: "socks5", port: 1080 });
    expect(proxyrouteof({ scheme: "socks5", host: "proxy.example", port: 1080, bypass: [] })).toBeUndefined();
    expect(
      proxyrouteof({ scheme: "socks5", host: "proxy.example", port: 0, bypass: ["https://api.example"] }),
    ).toBeUndefined();
    expect(
      proxyrouteof({ scheme: "ftp", host: "proxy.example", port: 1080, bypass: ["https://api.example"] }),
    ).toBeUndefined();
  });

  it("parses rate limit reads and waits until the reset window passes", () => {
    const now = 1_000_000;
    const epoch = ratelimitreadof(
      {
        "x-ratelimit-remaining": "4",
        "x-ratelimit-limit": "10",
        "x-ratelimit-reset": String(Math.floor(now / 1000) + 30),
      },
      "https://api.example",
      now,
    );
    expect(epoch).toMatchObject({ origin: "https://api.example", remaining: 4, limit: 10 });
    expect(epoch?.resetat).toBe(now + 30_000);
    const delta = ratelimitreadof({ "x-ratelimit-reset": "5" }, "https://api.example", now);
    expect(delta?.resetat).toBe(now + 5_000);
    expect(ratelimitreadof({}, "https://api.example", now)).toBeUndefined();
    expect(ratelimitwait(epoch, now)).toBe(30_000);
    expect(ratelimitwait(epoch, now + 60_000)).toBe(0);
    expect(ratelimitwait(undefined, now)).toBe(0);
  });

  it("honors retry after values for 429 and 503 responses only", () => {
    expect(retryafterof(429, { "retry-after": "2" })).toBe(2_000);
    expect(retryafterof(503, { "Retry-After": "0" })).toBe(0);
    expect(retryafterof(500, { "retry-after": "2" })).toBeUndefined();
    expect(retryafterof(429, {})).toBeUndefined();
    expect(retryafterof(429, { "retry-after": "not-a-date" })).toBeUndefined();
    const future = new Date(Date.now() + 60_000).toUTCString();
    const wait = retryafterof(429, { "retry-after": future });
    expect(wait).toBeDefined();
    expect(wait ?? 0).toBeGreaterThan(30_000);
  });
});

describe("auth flows and uploads", () => {
  const flow = {
    provider: "providerco",
    authorizeurl: "https://auth.providerco/authorize",
    tokenurl: "https://api.providerco/token",
    scopes: ["read", "write"],
    redirectorigin: "https://app.example/callback",
  };

  it("builds the provider consent url with the state token", () => {
    const url = authorizeurl(flow, "state-1");
    expect(url.startsWith("https://auth.providerco/authorize?")).toBe(true);
    expect(url).toContain("response_type=code");
    expect(url).toContain("redirect_uri=https%3A%2F%2Fapp.example%2Fcallback");
    expect(url).toContain("scope=read+write");
    expect(url).toContain("state=state-1");
    expect(
      oauthflowof({
        provider: "p",
        authorizeurl: "https://a.example",
        tokenurl: "https://t.example",
        scopes: ["read"],
        redirectorigin: "https://r.example",
      }),
    ).toBeDefined();
    expect(
      oauthflowof({
        provider: "p",
        authorizeurl: "https://a.example",
        tokenurl: "https://t.example",
        scopes: [],
        redirectorigin: "https://r.example",
      }),
    ).toBeUndefined();
  });

  it("captures the redirect code only on the granted redirect origin with the matching state", () => {
    const good = capturecode(
      "https://app.example/callback?code=abc&state=state-1",
      "https://app.example/callback",
      "state-1",
    );
    expect(good).toEqual({ code: "abc" });
    expect(
      capturecode("https://evil.example/callback?code=abc&state=state-1", "https://app.example/callback", "state-1")
        ?.error,
    ).toContain("outside the granted redirect origin");
    expect(
      capturecode("https://app.example/callback?code=abc&state=other", "https://app.example/callback", "state-1")
        ?.error,
    ).toContain("state token");
    expect(
      capturecode(
        "https://app.example/callback?error=access_denied&state=state-1",
        "https://app.example/callback",
        "state-1",
      )?.error,
    ).toContain("access_denied");
    expect(
      capturecode("https://app.example/callback?state=state-1", "https://app.example/callback", "state-1")?.error,
    ).toContain("no authorization code");
  });

  it("exchanges codes and refresh tokens through the provider token origin", () => {
    const exchange = tokenrequest(flow, { code: "abc" });
    expect(exchange.url).toBe("https://api.providerco/token");
    expect(exchange.body).toContain("grant_type=authorization_code");
    expect(exchange.body).toContain("code=abc");
    expect(exchange.body).toContain(`redirect_uri=${encodeURIComponent("https://app.example/callback")}`);
    const refresh = tokenrequest(flow, { refreshtoken: "rf-1" });
    expect(refresh.body).toBe("grant_type=refresh_token&refresh_token=rf-1");
  });

  it("parses token responses and revocation rules", () => {
    const tokens = parsetokens('{"access_token":"at","refresh_token":"rt","expires_in":3600,"scope":"read write"}');
    expect(tokens).toEqual({ accesstoken: "at", refreshtoken: "rt", expiresin: 3600, scopes: ["read", "write"] });
    expect(parsetokens('{"error":"nope"}')).toBeUndefined();
    expect(parsetokens("not json")).toBeUndefined();
    expect(revocationruleof({ tokenids: ["t1"], reason: "user demand" })).toMatchObject({
      tokenids: ["t1"],
      reason: "user demand",
    });
    expect(revocationruleof({ tokenids: [], reason: "x" })).toBeUndefined();
  });

  it("encodes urlencoded form payloads with the form grammar", () => {
    expect(
      urlencodeform([
        { name: "a b", value: "1&2" },
        { name: "é", value: "x/y" },
      ]),
    ).toBe("a%20b=1%262&%C3%A9=x%2Fy");
    expect(
      formpayloadof({ url: "https://api.example/submit", fields: [{ name: "q", value: "devthink" }] }),
    ).toMatchObject({ url: "https://api.example/submit" });
    expect(formpayloadof({ url: "https://api.example/submit", fields: [] })).toBeUndefined();
    expect(formpayloadof({ url: "", fields: [{ name: "q", value: "v" }] })).toBeUndefined();
  });

  it("streams multipart payloads chunk by chunk without buffering the whole body", () => {
    const payload = multipartpayloadof({
      url: "https://api.example/upload",
      fields: [{ name: "label", value: "report" }],
      files: [{ name: "file", filename: "report.csv", mime: "text/csv", content: "a,b\n1,2\n", reviewed: true }],
      boundary: "BOUND",
    });
    if (!payload) throw new Error("The reviewed multipart payload must parse.");
    const streamed = multipartchunks(payload);
    expect(streamed.boundary).toBe("BOUND");
    expect(streamed.chunks).toHaveLength(3);
    expect(streamed.chunks[0]).toBe('--BOUND\r\ncontent-disposition: form-data; name="label"\r\n\r\nreport\r\n');
    expect(streamed.chunks[1]).toContain('filename="report.csv"');
    expect(streamed.chunks[1]).toContain("content-type: text/csv");
    expect(streamed.chunks[2]).toBe("--BOUND--\r\n");
    expect(streamed.bytes).toBe(streamed.chunks.reduce((total, chunk) => total + chunk.length, 0));
    expect(
      multipartpayloadof({
        url: "https://api.example/upload",
        files: [{ name: "f", filename: "a.txt", mime: "text/plain", content: "x", reviewed: false }],
      }),
    ).toBeUndefined();
  });
});

describe("run timeline", () => {
  /** Fixture timeline entry factory on plain shapes. */
  function entry(overrides: Partial<timelineentry> = {}): timelineentry {
    return {
      id: `e${Math.random().toString(36).slice(2, 8)}`,
      runid: "run1",
      stepid: "s1",
      time: 100,
      level: "info",
      source: "console",
      message: "hello",
      ...overrides,
    };
  }

  it("binds one timeline to the run and its step ids", () => {
    const bound = attachtimeline({ runid: "run1", origin: "https://example.com", stepids: ["s1", "s2"], now: 5 });
    expect(bound).toMatchObject({ runid: "run1", origin: "https://example.com", attachedat: 5, entries: [] });
    expect(bound.stepids).toEqual(["s1", "s2"]);
  });

  it("captures console calls at every level with redaction and argument kinds", () => {
    for (const level of loglevels) {
      const captured = consolecapture({ level, args: ["value"], depth: 2, redact: [] });
      expect(captured.level).toBe(level);
      expect(captured.text).toBe("value");
      expect(captured.argkinds).toEqual(["string"]);
      expect(captured.repeat).toBe(1);
    }
    const secret = consolecapture({ level: "warn", args: ["token=abc123 and more"], depth: 2, redact: ["abc123"] });
    expect(secret.text).toBe("token=[redacted] and more");
    expect(redactconsoletext("a secret b secret c", ["secret"])).toBe("a [redacted] b [redacted] c");
    expect(argkind(null)).toBe("null");
    expect(argkind([1])).toBe("array");
    expect(argkind(new Error("x"))).toBe("error");
    expect(argkind(3n)).toBe("bigint");
    expect(argkind(() => 1)).toBe("function");
  });

  it("serializes object arguments through the reviewed depth bound", () => {
    const deep = { a: { b: { c: { d: "leaf" } } } };
    expect(serializearg(deep, 2)).toBe("{a: {b: [Object]}}");
    expect(serializearg(deep, 3)).toBe("{a: {b: {c: [Object]}}}");
    expect(serializearg([1, "two", true], 2)).toBe("[1, two, true]");
    expect(serializearg("plain", 0)).toBe("plain");
    expect(serializearg({ nested: { leaf: 1 } }, 0)).toBe("[Object]");
  });

  it("parses stack frames and captures errors and rejections with redaction", () => {
    const stack =
      "Error: boom\n    at loadItems (https://example.com/app.js:42:17)\n    at https://example.com/main.js:7:3\n    not a frame";
    const frames = stackframes(stack);
    expect(frames).toHaveLength(2);
    expect(frames[0]).toMatchObject({
      functionname: "loadItems",
      url: "https://example.com/app.js",
      line: 42,
      column: 17,
    });
    expect(frames[1]).toMatchObject({ url: "https://example.com/main.js", line: 7 });
    const error = errorcapture({
      message: "boom with key=zzz",
      sourceurl: "https://example.com/app.js",
      line: 42,
      stacktext: stack,
      redact: ["zzz"],
    });
    expect(error.message).toBe("boom with key=[redacted]");
    expect(error.frames).toHaveLength(2);
    expect(error.line).toBe(42);
    const rejection = rejectioncapture({ reason: "TypeError: failed", stacktext: stack, redact: [] });
    expect(rejection.reason).toBe("TypeError: failed");
    expect(rejection.frames).toHaveLength(2);
    expect(errorcapture({ message: "m", sourceurl: "", line: 0, redact: [] }).frames).toEqual([]);
  });

  it("marks failed requests of the run as net failure entries", () => {
    const failed = netfailureentryof({
      id: "nf1",
      at: 9,
      exchange: {
        id: "x1",
        runid: "run1",
        stepid: "s1",
        correlationid: "run1-3",
        url: "https://api.example/items",
        origin: "https://api.example",
        method: "?",
        status: 0,
        statusclass: "unknown",
        errorclass: "networkerror",
        source: "page",
        timing: 12,
        bytes: 0,
        at: 8,
      },
    });
    if (!failed) throw new Error("The failed exchange must mark the timeline.");
    expect(failed).toMatchObject({
      runid: "run1",
      url: "https://api.example/items",
      errorclass: "networkerror",
      correlationid: "run1-3",
    });
    const httperror = netfailureentryof({
      id: "nf2",
      at: 9,
      exchange: {
        id: "x2",
        runid: "run1",
        stepid: "s1",
        correlationid: "run1-4",
        url: "https://api.example/missing",
        origin: "https://api.example",
        method: "GET",
        status: 404,
        statusclass: "clienterror",
        source: "page",
        timing: 20,
        bytes: 90,
        at: 8,
      },
    });
    expect(httperror?.errorclass).toBe("httperror");
    expect(
      netfailureentryof({
        id: "nf3",
        at: 9,
        exchange: {
          id: "x3",
          runid: "run1",
          stepid: "s1",
          correlationid: "run1-5",
          url: "https://api.example/ok",
          origin: "https://api.example",
          method: "GET",
          status: 200,
          statusclass: "success",
          source: "page",
          timing: 20,
          bytes: 90,
          at: 8,
        },
      }),
    ).toBeNull();
  });

  it("observes long task entries with attribution and blocking duration per step window", () => {
    const captured = longtaskcapture({
      entries: [
        { starttime: 10, duration: 90, attributions: ["same-origin"] },
        { starttime: 40, duration: 45, attributions: [] },
        { starttime: 60, duration: 20, attributions: ["cross-origin"] },
      ],
      threshold: 30,
    });
    expect(captured).toHaveLength(2);
    expect(captured[0]).toMatchObject({ duration: 90, starttime: 10, attributions: ["same-origin"] });
    const blocking = blockingduration(
      [
        { starttime: 10, duration: 90 },
        { starttime: 40, duration: 45 },
        { starttime: 400, duration: 500 },
      ],
      "s1",
      { startedat: 5, endedat: 100 },
    );
    expect(blocking).toMatchObject({ stepid: "s1", blocking: 135, tasks: 2 });
  });

  it("collapses repeated messages into counts and flags patterns over the reviewed threshold", () => {
    const repeats = [
      entry({ message: "retrying", time: 100 }),
      entry({ message: "retrying", time: 150 }),
      entry({ message: "retrying", time: 200 }),
      entry({ message: "done", time: 220 }),
    ];
    const outcome = spamdetect(repeats, { pattern: "", windowsize: 500, collapse: 1 });
    expect(outcome.entries).toHaveLength(2);
    expect(outcome.entries[0]).toMatchObject({ message: "retrying", repeat: 3 });
    expect(outcome.entries[1]).toMatchObject({ message: "done", repeat: 1 });
    expect(outcome.flagged).toEqual([{ message: "retrying", count: 3 }]);
    const spread = [entry({ message: "ping", time: 100 }), entry({ message: "ping", time: 900 })];
    const spaced = spamdetect(spread, { pattern: "", windowsize: 100, collapse: 1 });
    expect(spaced.entries).toHaveLength(2);
    expect(spaced.flagged).toEqual([]);
  });

  it("rotates logs to the overflow target without entry loss", () => {
    const entries = Array.from({ length: 5 }, (_, index) => entry({ id: `e${index}`, time: 100 + index }));
    const rotated = rotatelogs(entries, { maxentries: 3, overflowtarget: "overflow1" });
    expect(rotated.kept.map((item) => item.id)).toEqual(["e2", "e3", "e4"]);
    expect(rotated.overflow.map((item) => item.id)).toEqual(["e0", "e1"]);
    expect(rotated.kept.length + rotated.overflow.length).toBe(entries.length);
    const kept = rotatelogs(entries.slice(0, 2), { maxentries: 3, overflowtarget: "overflow1" });
    expect(kept.overflow).toEqual([]);
  });

  it("drops entries below per step level floors and from unreviewed sources", () => {
    expect(levelrank("error")).toBeLessThan(levelrank("trace"));
    const entries = [
      entry({ stepid: "s1", level: "trace", source: "console", message: "verbose" }),
      entry({ stepid: "s1", level: "error", source: "error", message: "boom" }),
      entry({ stepid: "s2", level: "info", source: "console", message: "fine" }),
    ];
    const floored = filterentries(entries, { floors: { s1: "error" } });
    expect(floored.map((item) => item.message)).toEqual(["boom", "fine"]);
    const sourced = filterentries(entries, { sources: ["error"] });
    expect(sourced.map((item) => item.message)).toEqual(["boom"]);
    const all = filterentries(entries, { floors: { "*": "trace" } });
    expect(all).toHaveLength(3);
  });

  it("classifies console lines between two runs as added, removed and repeated", () => {
    const diff = consolediff({
      baseid: "run1",
      targetid: "run2",
      baselines: ["boot", "ready", "ready", "gone"],
      targetlines: ["boot", "ready", "fresh"],
      now: 9,
    });
    expect(diff.base).toBe("run1");
    expect(diff.target).toBe("run2");
    expect(diff.added).toBe(1);
    expect(diff.removed).toBe(2);
    expect(diff.repeated).toBe(2);
    const repeated = diff.lines.find((line) => line.kind === "repeated");
    expect(repeated).toMatchObject({ text: "boot", count: 1 });
    expect(diff.at).toBe(9);
  });

  it("detaches watchers when the tab navigates inside the watch window", () => {
    expect(watcherdetached({ startedat: 100, lifetime: 500, navigations: [350] })).toEqual({ detached: true, at: 350 });
    expect(watcherdetached({ startedat: 100, lifetime: 500, navigations: [900] })).toEqual({ detached: false });
    expect(watcherdetached({ startedat: 100, lifetime: 500, navigations: [] })).toEqual({ detached: false });
  });

  it("counts entries per level and parses the debug watch options of every kind", () => {
    const counts = timelinecounts([entry({ level: "error" }), entry({ level: "error" }), entry({ level: "info" })]);
    expect(counts).toMatchObject({ error: 2, warn: 0, info: 1, log: 0, debug: 0, trace: 0 });
    const step: toolstep = {
      id: "w1",
      kind: "watchconsole",
      summary: "Watch the console",
      risk: "read",
      options: JSON.stringify({
        watch: { window: 250 },
        level: "warn",
        depth: 3,
        redact: ["secret"],
        spam: { pattern: "retry", windowsize: 500, collapse: 2 },
        rotation: { maxentries: 50, overflowtarget: "overflow1" },
      }),
    };
    const options = debugwatchoptions(step);
    expect(options).toMatchObject({ window: 250, level: "warn", depth: 3, redact: ["secret"], threshold: 0 });
    expect(options.spam).toEqual({ pattern: "retry", windowsize: 500, collapse: 2 });
    expect(options.rotation).toEqual({ maxentries: 50, overflowtarget: "overflow1" });
    const bare: toolstep = { id: "w2", kind: "watchtasks", summary: "Watch tasks", risk: "read" };
    expect(debugwatchoptions(bare)).toMatchObject({ window: 0, depth: 2, redact: [] });
  });
});

describe("cdp bus", () => {
  /** Fixture devtools session factory on plain shapes. */
  function session(overrides: Partial<cdpsession> = {}): cdpsession {
    return {
      id: "cdp1",
      runid: "plan",
      stepid: "a1",
      tabid: 4,
      origin: "https://example.com",
      attachedat: 10,
      domains: ["Runtime", "Debugger"],
      debuggerversion: "devthink instrumented harness 1.1.46 (no chrome.debugger permission)",
      ...overrides,
    };
  }

  /** Fixture breakpoint factory on plain shapes. */
  function breakpoint(overrides: Partial<breakpointspec> = {}): breakpointspec {
    return {
      id: "bp1",
      runid: "plan",
      stepid: "b1",
      url: "https://example.com/app.js",
      line: 12,
      hits: 2,
      registeredat: 5,
      ...overrides,
    };
  }

  /** Fixture script override factory on plain shapes. */
  function override(overrides: Partial<scriptoverride> = {}): scriptoverride {
    return {
      id: "ov1",
      runid: "plan",
      stepid: "o1",
      urlpattern: "https://cdn.example/vendor.js",
      source: "window.fixture = true;",
      reviewed: true,
      hits: 1,
      appliedat: 6,
      ...overrides,
    };
  }

  it("attaches the instrumented session with the reviewed domains and detaches it cleanly", () => {
    expect(cdpkinds).toHaveLength(8);
    expect(cdpdomains).toEqual(["Runtime", "Log", "Debugger", "DOM", "Network", "Page"]);
    const attached = attachcdpsession({
      id: "cdp1",
      runid: "plan",
      stepid: "a1",
      tabid: 4,
      origin: "https://example.com",
      domains: ["Runtime", "Runtime", "Debugger"],
      now: 10,
      debuggerversion: "harness",
    });
    expect(attached.domains).toEqual(["Runtime", "Debugger"]);
    expect(attached.attachedat).toBe(10);
    expect(attached.detachedat).toBeUndefined();
    const detached = detachcdpsession(attached, 40);
    expect(detached.detachedat).toBe(40);
    expect(detached.domains).toEqual(["Runtime", "Debugger"]);
    expect(detachcdpsession(attached, 50, true).userdetached).toBe(true);
  });

  it("validates method names, allowlists and raw command records with duration and error class", () => {
    expect(methoddomain("Runtime.evaluate")).toBe("Runtime");
    expect(methoddomain("runtime.evaluate")).toBeUndefined();
    expect(methoddomain("Runtime")).toBeUndefined();
    const allowlist = cdpallowlistof({ domains: ["Runtime", "Debugger"], methods: ["Runtime.evaluate"] });
    if (!allowlist) throw new Error("The reviewed allowlist must parse.");
    expect(allowlistcovers(allowlist, "Runtime.evaluate")).toBe(true);
    expect(allowlistcovers(allowlist, "Runtime.callFunctionOn")).toBe(false);
    expect(allowlistcovers(allowlist, "DOM.getSnapshot")).toBe(false);
    expect(allowlistcovers({ domains: ["Runtime"] }, "Runtime.evaluate")).toBe(true);
    expect(cdpallowlistof({ domains: [] })).toBeUndefined();
    expect(cdpallowlistof({ domains: ["Runtime"], methods: ["DOM.getSnapshot"] })).toBeUndefined();
    const command = sendcdpcommand({
      id: "c1",
      sessionid: "cdp1",
      runid: "plan",
      stepid: "c1",
      method: "Runtime.evaluate",
      params: { expression: "1 + 1" },
      duration: 12,
      at: 20,
    });
    expect(command).toMatchObject({ domain: "Runtime", duration: 12 });
    expect(command.errorclass).toBeUndefined();
    const malformed = sendcdpcommand({
      id: "c2",
      sessionid: "cdp1",
      runid: "plan",
      stepid: "c2",
      method: "not a method",
      duration: 3,
      at: 21,
    });
    expect(malformed.domain).toBe("");
    expect(malformed.errorclass).toBe("malformedmethod");
    const failed = sendcdpcommand({
      id: "c3",
      sessionid: "cdp1",
      runid: "plan",
      stepid: "c3",
      method: "DOM.getSnapshot",
      duration: 7,
      errorclass: "uninstrumented",
      at: 22,
    });
    expect(failed.errorclass).toBe("uninstrumented");
  });

  it("serializes concurrent commands per session in send order", () => {
    const first = sendcdpcommand({
      id: "c1",
      sessionid: "cdp1",
      runid: "plan",
      stepid: "s",
      method: "Runtime.evaluate",
      duration: 5,
      at: 1,
    });
    const second = sendcdpcommand({
      id: "c2",
      sessionid: "cdp1",
      runid: "plan",
      stepid: "s",
      method: "DOM.getSnapshot",
      duration: 6,
      at: 2,
    });
    const third = sendcdpcommand({
      id: "c3",
      sessionid: "cdp1",
      runid: "plan",
      stepid: "s",
      method: "Page.enable",
      duration: 7,
      at: 3,
    });
    let queue = serializecdpcommand([], first);
    queue = serializecdpcommand(queue, second);
    queue = serializecdpcommand(queue, third);
    expect(queue.map((item) => item.id)).toEqual(["c1", "c2", "c3"]);
  });

  it("subscribes domain event rules with match filters, counts per domain and closes the subscription", () => {
    const rule = cdpeventruleof({ domain: "Log", event: "entryAdded", match: "fixture" });
    if (!rule) throw new Error("The reviewed event rule must parse.");
    expect(rule).toEqual({ domain: "Log", event: "entryAdded", match: "fixture" });
    expect(cdpeventruleof({ domain: "Nope", event: "entryAdded" })).toBeUndefined();
    expect(cdpeventruleof({ domain: "Log" })).toBeUndefined();
    const rules: cdpeventrule[] = [
      {
        id: "r1",
        sessionid: "cdp1",
        runid: "plan",
        stepid: "w1",
        domain: "Log",
        event: "entryAdded",
        match: "fixture",
        events: 0,
        registeredat: 1,
      },
      {
        id: "r2",
        sessionid: "cdp1",
        runid: "plan",
        stepid: "w1",
        domain: "Page",
        event: "loadEventFired",
        events: 0,
        registeredat: 1,
      },
    ];
    const outcome = watchcdpevents(rules, [
      { domain: "Log", event: "entryAdded", payload: "fixture page ready" },
      { domain: "Log", event: "entryAdded", payload: "unrelated output" },
      { domain: "Page", event: "loadEventFired", payload: "https://example.com" },
      { domain: "Network", event: "requestWillBeSent", payload: "https://api.example" },
    ]);
    expect(outcome.matched).toHaveLength(2);
    expect(outcome.matched[0]).toMatchObject({ ruleid: "r1", domain: "Log" });
    expect(outcome.counts).toMatchObject({ Log: 1, Page: 1, Network: 0, Runtime: 0 });
    const closed = { ...rules[0]!, closedat: 9 };
    expect(closed.closedat).toBe(9);
  });

  it("registers breakpoints and captures pause states with call frames and dom snapshots", () => {
    const input = breakpointinputof({
      url: "https://example.com/app.js",
      line: 12,
      column: 4,
      condition: "items.length > 0",
    });
    if (!input) throw new Error("The reviewed breakpoint input must parse.");
    expect(input).toEqual({ url: "https://example.com/app.js", line: 12, column: 4, condition: "items.length > 0" });
    expect(breakpointinputof({ url: "https://example.com/app.js" })).toBeUndefined();
    expect(breakpointinputof({ url: "https://example.com/app.js", line: -1 })).toBeUndefined();
    const pause = capturepause({
      id: "p1",
      runid: "plan",
      stepid: "b1",
      reason: "breakpoint",
      callframes: [{ functionname: "load", url: "https://example.com/app.js", line: 12, column: 4 }],
      hitbreakpoint: "bp1",
      domsnapshotid: "dom-7",
      at: 30,
    });
    expect(pause).toMatchObject({ reason: "breakpoint", hitbreakpoint: "bp1", domsnapshotid: "dom-7" });
    expect(pause.callframes).toHaveLength(1);
    expect(stepmodeof("stepover")).toBe("stepover");
    expect(stepmodeof("resume")).toBe("resume");
    expect(stepmodeof("stepout")).toBe("stepout");
    expect(stepmodeof("stepinto")).toBe("stepinto");
    expect(stepmodeof("restart")).toBeUndefined();
    expect(stepmodeof(7)).toBeUndefined();
  });

  it("records watch expression values at every pause with the pause scope", () => {
    const parsed = watchexpressionof({ expression: "items.length", scope: "topframe" });
    if (!parsed) throw new Error("The reviewed watch expression must parse.");
    expect(parsed).toEqual({ expression: "items.length", scope: "topframe" });
    expect(watchexpressionof({ expression: "  " })).toBeUndefined();
    expect(watchexpressionof({ scope: "topframe" })).toBeUndefined();
    const defaults = watchexpressionof({ expression: "x" });
    if (!defaults) throw new Error("The bare watch expression must parse with the default scope.");
    expect(defaults.scope).toBe("topframe");
    const expression: watchexpression = {
      id: "we1",
      runid: "plan",
      stepid: "w1",
      expression: "items.length",
      scope: "topframe",
      reviewed: true,
      values: [],
      at: 2,
    };
    const first = recordwatchvalue(expression, "p1", "3", 30);
    const second = recordwatchvalue(first, "p2", "7", 40);
    expect(second.values).toEqual([
      { pauseid: "p1", value: "3", at: 30 },
      { pauseid: "p2", value: "7", at: 40 },
    ]);
  });

  it("matches script override patterns of explicit origins with single and double stars", () => {
    const input = overrideinputof({ urlpattern: "https://cdn.example/vendor.js", source: "window.fixture = true;" });
    if (!input) throw new Error("The reviewed override input must parse.");
    expect(overridematches("https://cdn.example/vendor.js", "https://cdn.example/vendor.js")).toBe(true);
    expect(overridematches("https://cdn.example/*", "https://cdn.example/vendor.js")).toBe(true);
    expect(overridematches("https://cdn.example/*", "https://cdn.example/js/app.js")).toBe(false);
    expect(overridematches("https://cdn.example/*.js", "https://cdn.example/vendor.js")).toBe(false);
    expect(overridematches("https://cdn.example/**", "https://cdn.example/js/lib/app.js")).toBe(true);
    expect(overridematches("https://cdn.example/js/*", "https://cdn.example/js/lib/app.js")).toBe(false);
    expect(overridematches("https://other.example/vendor.js", "https://cdn.example/vendor.js")).toBe(false);
    expect(overridematches("vendor.js", "https://cdn.example/vendor.js")).toBe(false);
    expect(overrideinputof({ urlpattern: "https://cdn.example/vendor.js", source: "  " })).toBeUndefined();
    expect(overrideinputof({ urlpattern: "", source: "x" })).toBeUndefined();
  });

  it("tears sessions down safely when the user detaches the debugger", () => {
    const plan = teardownplanof({ revertsteps: ["revert breakpoints", "revert overrides"], resumepolicy: "resume" });
    if (!plan) throw new Error("The reviewed teardown plan must parse.");
    expect(plan.resumepolicy).toBe("resume");
    expect(teardownplanof({ revertsteps: [] })).toBeUndefined();
    expect(teardownplanof({ revertsteps: ["x"], resumepolicy: "later" })).toBeUndefined();
    expect(teardownplanof({ revertsteps: ["x"] })).toMatchObject({ resumepolicy: "ask" });
    const attached = session();
    const active = { breakpoints: [breakpoint()], overrides: [override()] };
    const userdetach = teardowncdpsession({
      session: attached,
      breakpoints: active.breakpoints,
      overrides: active.overrides,
      plan,
      userdetached: true,
      at: 90,
    });
    expect(userdetach.revertedbreakpoints).toEqual(["bp1"]);
    expect(userdetach.revertedoverrides).toEqual(["ov1"]);
    expect(userdetach.session.detachedat).toBe(90);
    expect(userdetach.session.userdetached).toBe(true);
    expect(userdetach.keepsalive).toBe(true);
    expect(userdetach.paused).toBe(true);
    expect(userdetach.resumepolicy).toBe("pause");
    const rundetach = teardowncdpsession({
      session: attached,
      breakpoints: active.breakpoints,
      overrides: active.overrides,
      plan,
      userdetached: false,
      at: 95,
    });
    expect(rundetach.keepsalive).toBe(false);
    expect(rundetach.paused).toBe(false);
    expect(rundetach.resumepolicy).toBe("resume");
    const revertedbp = { ...active.breakpoints[0]!, revertedat: 80 };
    expect(
      teardowncdpsession({
        session: attached,
        breakpoints: [revertedbp],
        overrides: [],
        plan: undefined,
        userdetached: false,
        at: 96,
      }).revertedbreakpoints,
    ).toEqual([]);
  });

  it("parses the cdp step options of every kind through the page normalizers", () => {
    const attach: toolstep = {
      id: "a1",
      kind: "attachcdp",
      summary: "Attach",
      risk: "sensitive",
      options: JSON.stringify({
        domains: ["Runtime", "Debugger"],
        teardown: { revertsteps: ["revert breakpoints"], resumepolicy: "pause" },
        allowlist: { domains: ["Runtime"], methods: ["Runtime.evaluate"] },
      }),
    };
    const parsed = cdpstepoptions(attach);
    expect(parsed.domains).toEqual(["Runtime", "Debugger"]);
    expect(parsed.teardown).toEqual({ revertsteps: ["revert breakpoints"], resumepolicy: "pause" });
    expect(parsed.command?.method).toBeUndefined();
    const cmd: toolstep = {
      id: "c1",
      kind: "cdpcmd",
      summary: "Evaluate",
      risk: "sensitive",
      options: JSON.stringify({
        command: { method: "Runtime.evaluate", params: { expression: "1" }, resultpath: "result.value" },
      }),
    };
    expect(cdpstepoptions(cmd).command).toEqual({
      method: "Runtime.evaluate",
      params: { expression: "1" },
      resultpath: "result.value",
    });
    const watch: toolstep = {
      id: "w1",
      kind: "watchcdp",
      summary: "Watch events",
      risk: "read",
      options: JSON.stringify({ events: [{ domain: "Log", event: "entryAdded", match: "x" }], watch: { window: 250 } }),
    };
    const watchoptions = cdpstepoptions(watch);
    expect(watchoptions.events).toEqual([{ domain: "Log", event: "entryAdded", match: "x" }]);
    expect(watchoptions.watchwindow).toBe(250);
    const bare: toolstep = { id: "b1", kind: "stepcode", summary: "Step", risk: "interaction" };
    expect(cdpstepoptions(bare).watchwindow).toBe(0);
    expect(cdpstepoptions(bare).domains).toEqual([]);
  });
});

describe("profilers", () => {
  const now = 1_800_000_000_000;
  const spec = {
    prefix: "flow",
    steps: ["s1", "s2"],
    metrics: ["navigation", "paint", "lcp", "fid", "interaction", "blocking"],
  };
  const entries = [
    { name: "flow:s1:start", type: "mark", start: 0, duration: 0 },
    { name: "flow:s1:end", type: "mark", start: 100, duration: 0 },
    { name: "flow:s2:start", type: "mark", start: 100, duration: 0 },
    { name: "flow:s2:end", type: "mark", start: 250, duration: 0 },
    { name: "https://example.com", type: "navigation", start: 0, duration: 800 },
    { name: "first-paint", type: "paint", start: 40, duration: 0 },
    { name: "first-contentful-paint", type: "paint", start: 60, duration: 0 },
    { name: "largest-contentful-paint", type: "largest-contentful-paint", start: 1200, duration: 0 },
    { name: "first-input", type: "first-input", start: 300, duration: 40 },
    { name: "keydown", type: "event", start: 320, duration: 80 },
    { name: "click", type: "event", start: 340, duration: 60 },
    { name: "longtask", type: "longtask", start: 20, duration: 120 },
    { name: "longtask", type: "longtask", start: 150, duration: 70 },
  ];

  it("lists the profiling kinds of the debugging part three family", () => {
    expect(profilerkinds).toEqual([
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
  });

  it("marks the start and end of every step in the flow window and sums the durations", () => {
    const windows = stepwindows(
      spec,
      entries.filter((entry) => entry.type === "mark"),
    );
    expect(windows).toEqual([
      { stepid: "s1", start: 0, end: 100 },
      { stepid: "s2", start: 100, end: 250 },
    ]);
    const metrics = measure({ runid: "run", stepid: "m1", spec, entries, now });
    const byname = (name: string): Array<{ duration: number; steps: string[] }> =>
      metrics
        .filter((metric) => metric.name === name)
        .map((metric) => ({ duration: metric.duration, steps: metric.steps }));
    expect(byname("navigation")).toEqual([{ duration: 800, steps: ["s1", "s2"] }]);
    expect(byname("paint")).toEqual([
      { duration: 0, steps: ["s1"] },
      { duration: 0, steps: ["s1"] },
    ]);
    expect(byname("lcp")).toEqual([{ duration: 0, steps: [] }]);
    expect(byname("fid")).toEqual([{ duration: 40, steps: [] }]);
    expect(byname("interaction")).toEqual([{ duration: 80, steps: [] }]);
    expect(byname("blocking")).toEqual([
      { duration: 70, steps: ["s1"] },
      { duration: 20, steps: ["s2"] },
    ]);
    expect(metrics.every((metric) => metric.runid === "run" && metric.at === now)).toBe(true);
  });

  it("keeps flow metrics inside the reviewed metric set of the spec", () => {
    const narrowed = measure({ runid: "run", stepid: "m1", spec: { ...spec, metrics: ["blocking"] }, entries, now });
    expect(narrowed.map((metric) => metric.name)).toEqual(["blocking", "blocking"]);
    expect(flowspecof({ prefix: "f", steps: [], metrics: ["navigation"] })).toBeUndefined();
    expect(flowspecof({ prefix: "f", steps: ["s1"], metrics: ["nope"] })).toBeUndefined();
    expect(flowspecof({ prefix: "f", steps: ["s1"], metrics: ["navigation"] })).toEqual({
      prefix: "f",
      steps: ["s1"],
      metrics: ["navigation"],
    });
  });

  it("captures heap snapshots on demand with byte and node counts bounded by the user chosen interval only", () => {
    const record = heapsnap({
      id: "h1",
      runid: "run",
      stepid: "hs",
      origin: "https://example.com",
      usedbytes: 12_000_000,
      limitbytes: 40_000_000,
      nodecount: 1450,
      now,
    });
    expect(record).toMatchObject({ bytesize: 12_000_000, nodecount: 1450, capturedat: now });
    expect(heapintervalallowed(undefined, 1000, now)).toBe(true);
    expect(heapintervalallowed(now - 500, 1000, now)).toBe(false);
    expect(heapintervalallowed(now - 1500, 1000, now)).toBe(true);
    expect(heapintervalallowed(now - 500, undefined, now)).toBe(true);
  });

  it("computes growth trend slopes and flags the steps above the reviewed slope", () => {
    const samples = [
      growsampleof({ id: "g1", runid: "run", stepid: "s1", usedbytes: 1_000_000, limitbytes: 4_000_000, now: now }),
      growsampleof({
        id: "g2",
        runid: "run",
        stepid: "s2",
        usedbytes: 3_000_000,
        limitbytes: 4_000_000,
        now: now + 1000,
      }),
    ];
    const trend = growthtrend({ runid: "run", samples, slope: 1, now: now + 2000 });
    expect(trend).toMatchObject({ slope: 2000, samples: 2, flaggedsteps: ["s2"] });
    expect(growthtrend({ runid: "run", samples, slope: 5000, now: now + 2000 }).flaggedsteps).toEqual([]);
    expect(growthtrend({ runid: "run", samples: [], slope: 1, now }).slope).toBe(0);
  });

  it("captures cpu profiles around the step window with the hot functions ranked by sampled time", () => {
    const record = cpusnap({
      id: "c1",
      runid: "run",
      stepid: "cpu",
      origin: "https://example.com",
      duration: 500,
      samples: [
        { name: "render", time: 50 },
        { name: "parse", time: 20 },
        { name: "render", time: 30 },
      ],
      now,
    });
    expect(record).toMatchObject({ duration: 500, samplecount: 3, hotfunctions: ["render", "parse"] });
    expect(
      cpusnap({ id: "c2", runid: "run", stepid: "cpu", origin: "https://example.com", duration: 10, samples: [], now })
        .hotfunctions,
    ).toEqual([]);
  });

  it("scores layout shifts with their impacted element selectors", () => {
    const entry = shiftentryof({
      id: "sh1",
      runid: "run",
      stepid: "ws",
      score: 0.12,
      starttime: 40,
      selectors: ["img#hero", "div#main"],
      at: now,
    });
    expect(entry).toMatchObject({ score: 0.12, starttime: 40, selectors: ["img#hero", "div#main"] });
    expect(shiftentryof({ score: -1, starttime: 40 })).toBeUndefined();
    expect(shiftentryof({ score: 0.1 })).toBeUndefined();
    expect(shiftentryof({ score: 0.1, starttime: 5, selectors: ["", "p"] })?.selectors).toEqual(["p"]);
  });

  it("records one trace, exports it with step annotations aligned to the run timeline and replays it offline", () => {
    const trace = tracestart({
      id: "t1",
      runid: "run",
      stepid: "tl",
      origin: "https://example.com",
      categories: ["scripting", "painting"],
      now: 1000,
    });
    expect(trace).toMatchObject({ categories: ["scripting", "painting"], bytesize: 0, events: 0 });
    const annotated = annotatetrace({
      trace,
      annotations: [
        { stepid: "s1", label: "open panel", offset: 0 },
        { stepid: "s2", label: "run search", offset: 0 },
      ],
      timeline: [
        { stepid: "s1", time: 1500 },
        { stepid: "s2", time: 2600 },
      ],
      now: 3000,
    });
    expect(annotated.annotations).toEqual([
      { stepid: "s1", label: "open panel", offset: 500 },
      { stepid: "s2", label: "run search", offset: 1600 },
    ]);
    const file = tracetofile({ ...annotated, endedat: 3000 }, [
      { name: "keydown", category: "scripting", offset: 300 },
      { name: "layout-shift", category: "painting", offset: 1600 },
    ]);
    expect(file.events).toBe(2);
    expect(file.bytesize).toBe(file.content.length);
    const replay = replaytrace(file.content);
    expect(replay.categories).toEqual({ scripting: 1, painting: 1 });
    expect(replay.events[0]).toMatchObject({ name: "keydown", category: "scripting" });
    expect(replay.events[1]).toMatchObject({ name: "layout-shift", stepid: "s2" });
    expect(replay.annotations).toEqual(annotated.annotations);
    expect(() => replaytrace("not json")).toThrow();
    expect(annotationof({ stepid: "", label: "x" })).toBeUndefined();
    expect(annotationof({ stepid: "s1", label: "x", offset: -5 })?.offset).toBe(0);
  });

  it("normalizes the attach targets of page, iframe, worker and service worker", () => {
    expect(attachtargetof({ kind: "page", url: "https://example.com" })).toEqual({
      kind: "page",
      url: "https://example.com",
    });
    expect(attachtargetof({ kind: "iframe", url: "https://cdn.example/frame" })).toEqual({
      kind: "iframe",
      url: "https://cdn.example/frame",
    });
    expect(attachtargetof({ kind: "worker", url: "https://example.com/worker.js" })).toEqual({
      kind: "worker",
      url: "https://example.com/worker.js",
    });
    expect(attachtargetof({ kind: "serviceworker", url: "https://example.com/sw.js" })).toEqual({
      kind: "serviceworker",
      url: "https://example.com/sw.js",
    });
    expect(attachtargetof({ kind: "iframe", url: "http://example.com/frame" })).toBeUndefined();
    expect(attachtargetof({ kind: "shadowroot", url: "https://example.com" })).toBeUndefined();
    expect(attachtargetof({ url: "https://example.com" })).toBeUndefined();
  });

  it("captures source map declarations of the loaded scripts and rewrites stack locations through the parsed maps", () => {
    expect(mapurlof("https://example.com/app.js", "console.log(1);\n//# sourceMappingURL=app.js.map")).toBe(
      "https://example.com/app.js.map",
    );
    expect(mapurlof("https://example.com/app.js", "console.log(1);")).toBeUndefined();
    const refs = capturesourcemaps({
      runid: "run",
      stepid: "sm",
      origin: "https://example.com",
      scripts: [
        { url: "https://example.com/app.js", source: "//# sourceMappingURL=app.js.map" },
        { url: "https://example.com/other.js", source: "no map" },
      ],
      now,
    });
    expect(refs).toHaveLength(1);
    expect(refs[0]).toMatchObject({
      scripturl: "https://example.com/app.js",
      mapurl: "https://example.com/app.js.map",
      parsed: false,
    });
    const map = { sources: ["src/app.ts"], mappings: "AAAA;EACC" };
    expect(rewritesourcelocation({ url: "https://example.com/app.js", line: 1 }, map)).toEqual({
      url: "src/app.ts",
      line: 1,
    });
    expect(rewritesourcelocation({ url: "https://example.com/app.js", line: 0 }, map)).toEqual({
      url: "src/app.ts",
      line: 0,
    });
    expect(rewritesourcelocation({ url: "https://example.com/app.js", line: 9 }, map)).toBeUndefined();
    expect(
      rewritesourcelocation({ url: "https://example.com/app.js", line: 0 }, { sources: [], mappings: "AAAA" }),
    ).toBeUndefined();
  });

  it("expires the heavy profile bytes after the retention window while the metadata survives", () => {
    const heaps = [
      {
        id: "h1",
        runid: "run",
        stepid: "hs",
        origin: "https://example.com",
        bytesize: 10,
        nodecount: 5,
        capturedat: now - 2000,
      },
    ];
    const profiles = [
      {
        id: "c1",
        runid: "run",
        stepid: "cpu",
        origin: "https://example.com",
        duration: 5,
        samplecount: 2,
        hotfunctions: ["render"],
        at: now - 500,
      },
    ];
    const traces = [
      {
        id: "t1",
        runid: "run",
        stepid: "tl",
        origin: "https://example.com",
        categories: ["scripting"],
        bytesize: 40,
        events: 2,
        annotations: [{ stepid: "s1", label: "x", offset: 0 }],
        startedat: now - 2000,
        endedat: now - 2000,
      },
    ];
    const expired = expireprofilerecords({ heaps, profiles, traces, retention: 1000, now });
    expect(expired.heaps[0]?.bytesexpired).toBe(true);
    expect(expired.profiles[0]?.samplesexpired).toBeUndefined();
    expect(expired.traces[0]?.bytesexpired).toBe(true);
    expect(expired.traces[0]?.annotations).toHaveLength(1);
    expect(
      expireprofilerecords({ heaps, profiles, traces, retention: undefined, now }).heaps[0]?.bytesexpired,
    ).toBeUndefined();
  });

  it("parses the profiling step options of the page bridge", () => {
    const step: toolstep = {
      id: "m1",
      kind: "measureflow",
      summary: "Measure",
      risk: "read",
      options: JSON.stringify({
        flow: spec,
        watch: { window: 250 },
        threshold: 0.1,
        trace: { categories: ["scripting"], window: 100, exporttarget: "download", traceid: "t1" },
      }),
    };
    expect(profilestepoptions(step)).toMatchObject({
      flow: { prefix: "flow", steps: ["s1", "s2"], metrics: spec.metrics },
      watchwindow: 250,
      threshold: 0.1,
      categories: ["scripting"],
      exporttarget: "download",
      traceid: "t1",
    });
    expect(profilestepoptions({ id: "h", kind: "heapshot", summary: "Heap", risk: "sensitive" })).toMatchObject({
      watchwindow: 0,
      heapinterval: 0,
      duration: 0,
      threshold: 0,
      categories: [],
      scripts: [],
    });
    expect(
      profilestepoptions({
        id: "t",
        kind: "trackmemory",
        summary: "Track",
        risk: "read",
        options: JSON.stringify({ growth: { slope: 2, interval: 50 } }),
      }),
    ).toMatchObject({ growth: { slope: 2, interval: 50 } });
  });
});

describe("page emulation", () => {
  const emulationstep = (kind: toolstep["kind"], options: Record<string, unknown>): toolstep => ({
    id: "e1",
    kind,
    summary: "Emulate the run tab",
    risk: "sensitive",
    options: JSON.stringify(options),
  });
  const revertplan = ["restore the prior page state"];
  const device = { name: "phone", width: 390, height: 844, pixelratio: 3, mobile: true };
  const network = { name: "slow3g", latency: 400, download: 400, upload: 400, offline: true };
  const location = { name: "lisbon", latitude: 38.7223, longitude: -9.1393, accuracy: 100 };
  const agent = {
    name: "desktopmask",
    useragent: "Mozilla/5.0 (X11; Linux x86_64) Chrome/120.0.0.0 Safari/537.36",
    platform: "Linux x86_64",
    brands: ["Chromium"],
  };

  it("lists the emulation kinds of the 1.1.48 family", () => {
    expect(emulationkinds).toEqual([
      "emulatedevice",
      "emulatenetwork",
      "emulatelocate",
      "setuseragent",
      "overridepermission",
      "blackboxscripts",
    ]);
  });

  it("refuses emulation steps with malformed or absent reviewed presets before any mask applies", async () => {
    expect((await runemulationstep(emulationstep("emulatedevice", {}))).ok).toBe(false);
    expect(
      (
        await runemulationstep(
          emulationstep("emulatenetwork", { network: { name: "x", latency: -1, download: 1, upload: 1 } }),
        )
      ).ok,
    ).toBe(false);
    expect(
      (
        await runemulationstep(
          emulationstep("emulatelocate", { location: { name: "x", latitude: 91, longitude: 0, accuracy: 1 } }),
        )
      ).ok,
    ).toBe(false);
    expect(
      (await runemulationstep(emulationstep("setuseragent", { agent: { ...agent, useragent: "no version" } }))).ok,
    ).toBe(false);
    expect(
      (
        await runemulationstep(
          emulationstep("overridepermission", { permission: { name: "screen-capture", state: "granted" } }),
        )
      ).ok,
    ).toBe(false);
    expect((await runemulationstep(emulationstep("blackboxscripts", { rules: [] }))).ok).toBe(false);
    expect((await runemulationstep(emulationstep("click", {}))).ok).toBe(false);
  });

  it("registers the blackbox patterns in the page registry and reports the offline window of the network layer without touching page state", async () => {
    const rules = [{ urlpatterns: ["https://cdn.example/**"], tracescope: "both" as const }];
    const blackbox = await runemulationstep(emulationstep("blackboxscripts", { reviewed: true, rules, revertplan }));
    expect(blackbox.ok).toBe(true);
    expect(activeblackboxpatterns()).toEqual(["https://cdn.example/**"]);
    expect(revertemulationlayer("blackbox", undefined).ok).toBe(true);
    expect(activeblackboxpatterns()).toEqual([]);
    const offline = await runemulationstep(
      emulationstep("emulatenetwork", { reviewed: true, network, revertplan, window: 2000 }),
    );
    expect(offline.ok).toBe(true);
    expect((offline.details?.preset as Record<string, unknown>)?.offline).toBe(true);
    expect(offline.details?.window).toBe(2000);
    expect(revertemulationlayer("network", undefined).ok).toBe(true);
  });

  it("carries the honest derivation note beside every emulation result because no debugger or platform permission exists in the manifest", async () => {
    const offline = await runemulationstep(
      emulationstep("emulatenetwork", { reviewed: true, network, revertplan, window: 2000 }),
    );
    expect(String(offline.details?.derivation)).toContain("page-injected override through the scripting api");
    const blackbox = await runemulationstep(
      emulationstep("blackboxscripts", {
        reviewed: true,
        rules: [{ urlpatterns: ["https://cdn.example/**"], tracescope: "both" }],
        revertplan,
      }),
    );
    expect(String(blackbox.details?.derivation)).toContain("read no page state");
    revertemulationlayer("blackbox", undefined);
  });
});
