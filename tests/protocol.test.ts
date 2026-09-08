import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { allowlistreport, approvalframes, batchreport, calllogreport, cancelframes, dryrunreport, eventnotification, heartbeatreport, httpstreamreport, idempotencyreplayframe, idempotencyreport, inflightreport, mockreport, pairingframes, progressnoticeframe, promptcallframe, promptreport, ratelimitreport, resourcedeltareport, samplingframes, streamchunkframe, structurederrorreport, subscriptionframes, tlsreport, tokenreport, toolcallframe, toolresultframe , ecosystemviews } from "../protocol.js";
import { authreport, callsreport, capturereport, cdpreport, consolediffreport, controlreport, datasetresponse, diffresponse, downloadreport, editorstate, errorreportresponse, eventresponse, exchangesreport, extractionreport, formreportresponse, heldkeysreport, layoutreport, mapresponse, mediareport, navstateresponse, netlogreport, observationresponse, emulationreport, outcomeresponse, parseproposal, profilereport, provenancereport, quarantinereport, requestbody, runhistoryquery, runhistoryreport, safetyresponse, selectorresponse, signalsreport, tabreportresponse, timelinereport, trailreport, transformgrammar, wizardreport, workflowfileversion } from "../protocol.js";
import { modeloutcome, modelproposal, environmentgrammar, environmentreport } from "../protocol.js";
import { consentmodel, logchainreport, securityreport, surfacesnapshot, interfaceviews } from "../protocol.js";
import { agenteventframe, boardstatesnapshot, handoffframe, reviewframe, swarmstatereport } from "../protocol.js";
import { protocolversion, type a11ynode, type modeloutput, type plandraft, type agentplan, type apimapentry, type breakpointspec, type callrecord, type cdpcommand, type cdpeventrule, type cdpsession, type cpuprofile, type debuggergrant, type flowmetric, type growsample, type heaprecord, type memorytrend, type shiftentry, type sourcemapconsent, type sourcemapref, type tracerecord, type pausestate, type scriptoverride, type watchexpression, type channelrecord, type columnspec, type dataset, type eventsubscription, type exchangerecord, type downloadrecord, type extractsession, type imagebatch, type mediarecord, type mutationevent, type focusevent, type bannerreport, type errorreport, type formreport, type navstate, type netlogrecord, type observation, type provenancerecord, type quarantineentry, type redirectchain, type safetyverdict, type selectorcandidate, type shotpair, type shotrecord, type snapshotdiff, type stepoutcome, type tablayout, type tabreport, type transformrule, type typeaheadpick, type wizardstate, type swarmstate } from "../types.js";

describe("protocol", () => {
  it("turns a valid proposal into a pending local review", () => {
    const proposal = parseproposal({ version: protocolversion, plan: { objective: "Read the page", steps: [{ kind: "observe", summary: "Capture an approved page snapshot" }] } }, "https://example.com");
    expect(proposal.plan.state).toBe("pending");
    expect(proposal.plan.steps[0]?.risk).toBe("read");
  });

  it("rejects unsupported versions and cross-origin routes", () => {
    expect(() => parseproposal({ version: "1.0.0", plan: { objective: "x", steps: [] } }, "https://example.com")).toThrow("protocol");
    expect(() => parseproposal({ version: protocolversion, plan: { objective: "x", steps: [{ kind: "navigate", value: "https://elsewhere.example", summary: "Leave site" }] } }, "https://example.com")).toThrow("approved origin");
  });

  it("accepts the expanded action vocabulary with derived risk levels", () => {
    const proposal = parseproposal({ version: protocolversion, plan: { objective: "Review a richer flow", steps: [
      { kind: "scroll", target: "#menu", summary: "Scroll the reviewed menu into view." },
      { kind: "hover", target: "#menu", summary: "Hover the reviewed menu." },
      { kind: "select", target: "#country", value: "br", summary: "Select the reviewed country." },
      { kind: "extract", summary: "Extract bounded page links." },
      { kind: "wait", value: "500", summary: "Wait half a second between steps." },
      { kind: "presskey", value: "Enter", options: "{\"modifiers\":[\"shift\"]}", summary: "Press shift enter." },
      { kind: "readtable", target: "#prices", summary: "Read the reviewed price table." },
      { kind: "drag", target: "#card", value: "#board", summary: "Drag the reviewed card to the board." },
      { kind: "tablist", summary: "List the open tabs." },
      { kind: "evaluate", value: "document.title", summary: "Read the title through a reviewed expression." },
    ] } }, "https://example.com");
    expect(proposal.plan.steps.map(step => step.risk)).toEqual(["interaction", "interaction", "sensitive", "read", "read", "sensitive", "read", "sensitive", "read", "sensitive"]);
    expect(proposal.plan.steps[5]?.options).toBe("{\"modifiers\":[\"shift\"]}");
  });

  it("accepts plans with an unlimited number of reviewed steps", () => {
    const steps = Array.from({ length: 150 }, (_, index) => ({ kind: "wait", value: "1", summary: `Reviewed pause ${index + 1}.` }));
    const proposal = parseproposal({ version: protocolversion, plan: { objective: "Long reviewed flow", steps } }, "https://example.com");
    expect(proposal.plan.steps).toHaveLength(150);
    expect(() => parseproposal({ version: protocolversion, plan: { objective: "Empty flow", steps: [] } }, "https://example.com")).toThrow("at least one step");
  });

  it("honors a user configured plan expiry without a fixed ceiling", () => {
    const createdat = Date.now();
    const twohours = createdat + 2 * 60 * 60 * 1000;
    const proposal = parseproposal({ version: protocolversion, plan: { objective: "Long lived review", expiresat: twohours, steps: [{ kind: "observe", summary: "Observe once." }] } }, "https://example.com");
    expect(proposal.plan.expiresat).toBe(twohours);
  });

  it("shapes the proposal request with the capability report and wraps step outcomes", () => {
    const body = JSON.parse(requestbody({ objective: "Read prices", session: { id: "session", tabid: 4, origin: "https://example.com", startedat: 1, expiresat: 2 }, observation: { schemaversion: 2, url: "https://example.com", title: "Example", textpreview: "", textlength: 0, forms: [], interactive: [], capturedat: 1 }, capabilities: { tabs: true, downloads: false, clipboardread: false, clipboardwrite: false, reportedat: 1 } }));
    expect(body.capabilities.tabs).toBe(true);
    expect(body.version).toBe(protocolversion);
    const envelope = JSON.parse(outcomeresponse({ outcome: { stepid: "step", ok: true, summary: "Done.", details: { count: 3 }, at: 5 }, plan: { id: "plan", objective: "o", origin: "https://example.com", steps: [], createdat: 1, expiresat: 2, state: "approved" } }));
    expect(envelope.outcome.details.count).toBe(3);
    expect(envelope.planstate).toBe("approved");
    expect(envelope.resolvedtarget).toBeUndefined();
  });

  it("attaches the resolvedtarget summary to the outcome envelope for review", () => {
    const plan = { id: "plan", objective: "o", origin: "https://example.com", steps: [], createdat: 1, expiresat: 2, state: "approved" as const };
    const resolvedtarget = { mode: "text" as const, selector: "#signin", tag: "button", label: "Sign in", geometry: { x: 12, y: 30, width: 90, height: 32 } };
    const envelope = JSON.parse(outcomeresponse({ outcome: { stepid: "t1", ok: true, summary: "Clicked Sign in.", details: { mode: "text", resolvedtarget }, at: 9 }, plan, resolvedtarget }));
    expect(envelope.version).toBe(protocolversion);
    expect(envelope.resolvedtarget).toEqual(resolvedtarget);
    expect(envelope.planid).toBe("plan");
  });

  it("wraps clickablemap payloads with numbered entries in the versioned envelope", () => {
    const plan = { id: "plan", objective: "o", origin: "https://example.com", steps: [], createdat: 1, expiresat: 2, state: "approved" as const };
    const map = { version: 4, builtat: 77, entries: [
      { number: 1, selector: "a:nth-of-type(1)", role: "link", label: "Home", mode: "selector" as const },
      { number: 2, selector: "#search", role: "button", label: "Search", mode: "selector" as const },
    ] };
    const envelope = JSON.parse(mapresponse({ map, plan }));
    expect(envelope.version).toBe(protocolversion);
    expect(envelope.planid).toBe("plan");
    expect(envelope.map.version).toBe(4);
    expect((envelope.map.entries as Array<{ number: number }>).map(entry => entry.number)).toEqual([1, 2]);
    expect(envelope.map.entries[1]).toMatchObject({ number: 2, selector: "#search", role: "button", label: "Search" });
  });

  it("reports the keys currently held on one tab in the context envelope", () => {
    const report = heldkeysreport({ tabid: 4, holds: [
      { holdid: "shift1", key: "Shift", modifiers: ["shift"], tabid: 4, stepid: "s1", pressedat: 10 },
      { holdid: "ctrl1", key: "Control", tabid: 4, stepid: "s2", pressedat: 20, releasedat: 30 },
    ] });
    expect(report.version).toBe(protocolversion);
    expect(report.tabid).toBe(4);
    expect(report.heldkeys).toHaveLength(2);
    expect(report.heldkeys[0]).toMatchObject({ holdid: "shift1", key: "Shift" });
    expect(report.heldkeys[1]?.releasedat).toBe(30);
  });

  it("accepts the interaction universe vocabulary with its reviewed options grammar", () => {
    const proposal = parseproposal({ version: protocolversion, plan: { objective: "Complete the login flow", steps: [
      { id: "map", kind: "mapclicks", summary: "Number every clickable element." },
      { kind: "movepointer", summary: "Travel the reviewed path.", options: "{\"pointpath\":{\"start\":{\"x\":0,\"y\":0},\"end\":{\"x\":120,\"y\":60},\"duration\":400},\"speedprofile\":{\"easing\":\"easeinout\",\"peak\":800}}" },
      { kind: "clicktext", summary: "Click the sign in control by text.", options: "{\"targetref\":{\"mode\":\"text\",\"text\":\"Sign in\"}}" },
      { kind: "clickaria", summary: "Click the submit control by aria pair.", options: "{\"targetref\":{\"mode\":\"aria\",\"role\":\"button\",\"name\":\"Submit\"}}" },
      { kind: "typetime", target: "#email", value: "user@example.com", summary: "Type the reviewed email slowly.", options: "{\"delay\":90}" },
      { kind: "keyhold", value: "Shift", summary: "Hold shift for the range.", options: "{\"holdid\":\"shift1\"}" },
      { kind: "keyrelease", value: "shift1", summary: "Release the held shift key." },
      { kind: "setslider", target: "#volume", value: "40", summary: "Drag the volume slider." },
      { kind: "verifyvisible", target: "#results", summary: "Verify the results render." },
      { kind: "dismissdialog", summary: "Accept the next dialog.", options: "{\"accept\":true}" },
      { kind: "retryaction", summary: "Retry the moving banner click.", options: "{\"stepid\":\"banner\",\"retryrule\":{\"attempts\":3,\"settle\":200,\"tolerance\":4}}" },
      { id: "banner", kind: "click", target: "#banner", summary: "Click the moving banner." },
    ] } }, "https://example.com");
    expect(proposal.plan.steps.map(step => step.risk)).toEqual(["read", "interaction", "interaction", "interaction", "sensitive", "sensitive", "sensitive", "sensitive", "read", "sensitive", "interaction", "sensitive"]);
    expect(proposal.plan.steps[1]?.options).toContain("pointpath");
  });

  it("rejects wrapper steps that reference unknown sibling step ids", () => {
    expect(() => parseproposal({ version: protocolversion, plan: { objective: "Retry a ghost", steps: [
      { id: "wrapper", kind: "retryaction", summary: "Retry the ghost click.", options: "{\"stepid\":\"ghost\",\"retryrule\":{\"attempts\":2}}" },
    ] } }, "https://example.com")).toThrow("unknown step id");
    expect(() => parseproposal({ version: protocolversion, plan: { objective: "Frame a ghost", steps: [
      { id: "frame", kind: "enterframe", summary: "Route inside the frame.", options: "{\"framepath\":[0],\"stepid\":\"ghost\"}" },
    ] } }, "https://example.com")).toThrow("unknown step id");
  });

  it("accepts the observation depth vocabulary with its reviewed options grammar", () => {
    const proposal = parseproposal({ version: protocolversion, plan: { objective: "See the whole page", steps: [
      { kind: "a11ytree", summary: "Capture the accessibility tree." },
      { kind: "readertree", summary: "Extract the reader view." },
      { kind: "readvisible", target: "#main", summary: "Read the visible text." },
      { kind: "detectlists", summary: "Detect repeated lists." },
      { kind: "detecttables", summary: "Detect data tables." },
      { kind: "readjson", summary: "Read the embedded json state." },
      { kind: "watchmutate", summary: "Watch the feed.", options: "{\"lifetime\":2000,\"scopes\":[\"#feed\"]}" },
      { kind: "waitquiet", summary: "Wait for network quiet.", options: "{\"quietrule\":{\"idle\":400,\"timeout\":6000}}" },
      { kind: "watchbanner", summary: "Watch consent banners.", options: "{\"lifetime\":1500}" },
      { kind: "detectinfinitescroll", summary: "Detect infinite scroll." },
      { kind: "detectvirtual", summary: "Detect virtualized lists." },
      { kind: "detectlazy", summary: "Detect lazy images." },
      { kind: "readscrollpos", summary: "Read the scroll position." },
      { kind: "readlang", summary: "Read the page language." },
      { kind: "readoutline", summary: "Read the heading outline." },
      { kind: "countpages", summary: "Count the pagination." },
      { kind: "listshadow", summary: "List open shadow roots." },
      { kind: "listframes", summary: "List the iframes." },
      { kind: "classifypage", summary: "Classify the page template." },
      { kind: "fingerprintsection", target: "#prices", summary: "Fingerprint the section." },
      { kind: "diffsnapshots", summary: "Diff two observation versions.", options: "{\"versions\":[1,2]}" },
      { kind: "readselection", summary: "Read the current selection." },
      { kind: "watchfocus", summary: "Watch focus changes.", options: "{\"lifetime\":900}" },
      { kind: "detectsticky", summary: "Detect sticky overlays." },
      { kind: "detectscrolllock", summary: "Detect scroll locks." },
      { kind: "readopengraph", summary: "Read the open graph fields." },
      { kind: "detectlanguage", summary: "Detect the text language." },
      { kind: "deriveselector", target: "#checkout", summary: "Derive a stable selector." },
    ] } }, "https://example.com");
    expect(proposal.plan.steps).toHaveLength(28);
    expect(proposal.plan.steps.every(step => step.risk === "read")).toBe(true);
    expect(() => parseproposal({ version: protocolversion, plan: { objective: "Watch without a lifetime", steps: [{ kind: "watchmutate", summary: "Watch the feed." }] } }, "https://example.com")).toThrow("watch lifetime");
  });

  it("wraps the observation envelope with its a11y, reader, listpattern and tableshape sections", () => {
    const plan = { id: "plan", objective: "o", origin: "https://example.com", steps: [], createdat: 1, expiresat: 2, state: "approved" as const };
    const tree: a11ynode = { role: "button", name: "Submit", states: ["disabled"], childcount: 0, children: [] };
    const observationcapture: observation = {
      schemaversion: 3,
      url: "https://example.com",
      title: "Example",
      textpreview: "text",
      textlength: 4,
      forms: [],
      interactive: [],
      capturedat: 9,
      mode: "passive",
      a11y: tree,
      reader: { title: "Example", byline: "", blocks: [{ kind: "p", text: "text", words: 1 }], words: 1, characters: 4 },
      listpattern: [{ container: "ul", itemselector: "li.item", repeat: 3, samples: ["a", "b", "c"] }],
      tableshape: [{ selector: "table", headers: ["Name"], columns: [{ label: "Name", cells: 3 }], rows: 3, caption: "" }],
    };
    const envelope = JSON.parse(observationresponse({ observation: observationcapture, plan }));
    expect(envelope.version).toBe(protocolversion);
    expect(envelope.planstate).toBe("approved");
    expect(envelope.observation.a11y).toEqual(tree);
    expect(envelope.observation.reader.blocks).toHaveLength(1);
    expect(envelope.observation.listpattern[0]).toMatchObject({ itemselector: "li.item", repeat: 3 });
    expect(envelope.observation.tableshape[0]).toMatchObject({ headers: ["Name"], rows: 3 });
    expect(envelope.observation.mode).toBe("passive");
  });

  it("wraps mutation, focus and banner event records in the versioned envelope", () => {
    const plan = { id: "plan", objective: "o", origin: "https://example.com", steps: [], createdat: 1, expiresat: 2, state: "approved" as const };
    const mutation: mutationevent = { watchid: "w1", event: "childList", targetpath: "#feed > li", sessionid: "session", at: 100 };
    const focus: focusevent = { watchid: "w2", kind: "focus", targetpath: "#search", sessionid: "session", at: 150 };
    const banner: bannerreport = { kind: "cookie", selector: "#cookiebar", text: "We use cookies.", controls: ["Accept"], sessionid: "session", at: 200 };
    const envelope = JSON.parse(eventresponse({ events: [mutation, focus, banner], plan }));
    expect(envelope.version).toBe(protocolversion);
    expect(envelope.events).toHaveLength(3);
    expect(envelope.events[0]).toMatchObject({ watchid: "w1", event: "childList", targetpath: "#feed > li", at: 100 });
    expect(envelope.events[1]).toMatchObject({ kind: "focus", targetpath: "#search", at: 150 });
    expect(envelope.events[2]).toMatchObject({ kind: "cookie", controls: ["Accept"], at: 200 });
  });

  it("wraps snapshot diffs with their version pair and added, removed and changed nodes", () => {
    const plan = { id: "plan", objective: "o", origin: "https://example.com", steps: [], createdat: 1, expiresat: 2, state: "approved" as const };
    const diff: snapshotdiff = {
      baseversion: 2,
      targetversion: 5,
      added: [{ kind: "added", selector: "#new", summary: "New" }],
      removed: [{ kind: "removed", selector: "#old", summary: "Old" }],
      changed: [{ kind: "changed", selector: "#go", summary: "Go became Stop" }],
      at: 42,
    };
    const envelope = JSON.parse(diffresponse({ diff, plan }));
    expect(envelope.version).toBe(protocolversion);
    expect(envelope.diff.baseversion).toBe(2);
    expect(envelope.diff.targetversion).toBe(5);
    expect(envelope.diff.added).toEqual([{ kind: "added", selector: "#new", summary: "New" }]);
    expect(envelope.diff.removed).toHaveLength(1);
    expect(envelope.diff.changed).toHaveLength(1);
  });

  it("reports page language, template, scroll lock and banner state in the context payload", () => {
    expect(signalsreport({ signals: { language: "pt-BR", template: "article", scrolllocked: true, banner: "cookie", refreshedat: 7 } })).toMatchObject({ version: protocolversion, language: "pt-BR", template: "article", scrolllocked: true, banner: "cookie" });
    expect(signalsreport({ signals: { language: "en", refreshedat: 8 } })).toEqual({ version: protocolversion, language: "en" });
    expect(signalsreport({})).toEqual({ version: protocolversion });
    expect(signalsreport({ signals: { refreshedat: 9 } })).toEqual({ version: protocolversion });
  });

  it("wraps derived selector candidates with their stability scores", () => {
    const plan = { id: "plan", objective: "o", origin: "https://example.com", steps: [], createdat: 1, expiresat: 2, state: "approved" as const };
    const candidates: selectorcandidate[] = [
      { selector: "#checkout", strategy: "id", score: 100 },
      { selector: 'button[data-testid="checkout"]', strategy: "attribute", score: 80 },
    ];
    const envelope = JSON.parse(selectorresponse({ candidates, plan }));
    expect(envelope.version).toBe(protocolversion);
    expect(envelope.candidates).toEqual(candidates);
    expect(envelope.candidates[0]).toMatchObject({ selector: "#checkout", strategy: "id", score: 100 });
  });

  it("accepts the navigation mastery vocabulary with its reviewed options grammar", () => {
    const proposal = parseproposal({ version: protocolversion, plan: { objective: "Move anywhere with review", steps: [
      { kind: "openlink", summary: "Open the reviewed url in a new tab.", options: "{\"navtarget\":{\"url\":\"https://example.com/report\",\"container\":\"tab\",\"position\":\"adjacent\"}}" },
      { kind: "openprivate", summary: "Open the reviewed url in a private window.", options: "{\"navtarget\":{\"url\":\"https://example.com/report\",\"container\":\"private\"}}" },
      { kind: "reloadcache", summary: "Reload bypassing the cache." },
      { kind: "stopnav", summary: "Stop the pending navigation." },
      { kind: "waitload", summary: "Wait for the load event.", options: "{\"timeout\":3000}" },
      { kind: "waiturl", summary: "Wait for the reviewed pattern.", options: "{\"urlpattern\":{\"mode\":\"prefix\",\"url\":\"https://example.com/results\",\"query\":{\"page\":\"*\"}},\"timeout\":4000}" },
      { kind: "followlink", value: "Read the docs", summary: "Follow the reviewed link." },
      { kind: "spanav", value: "Open settings", summary: "Route the single page app.", options: "{\"routepattern\":{\"mode\":\"prefix\",\"url\":\"https://example.com/settings\"},\"timeout\":2500}" },
      { kind: "spawait", summary: "Wait for the spa url change.", options: "{\"timeout\":2000,\"poll\":50}" },
      { kind: "rewritequery", summary: "Rewrite the query parameters.", options: "{\"set\":{\"page\":\"3\"},\"remove\":[\"session\"]}" },
      { kind: "setfragment", value: "pricing", summary: "Set the reviewed fragment." },
      { kind: "navlist", summary: "Navigate the reviewed urls.", options: "{\"urls\":[\"https://example.com/a\",\"https://example.com/b\"]}" },
      { kind: "navprofile", summary: "Apply the per site wait profile.", options: "{\"waitprofile\":{\"signals\":[\"load\",\"networkidle\"],\"idle\":500,\"overrides\":[{\"origin\":\"https://example.com\",\"idle\":1500}]}}" },
      { kind: "detecthttp", summary: "Detect http errors and offline states." },
      { kind: "readredirects", summary: "Read the redirect chain." },
      { kind: "readfinalurl", summary: "Read the final url." },
      { kind: "handleauth", value: "https://example.com", summary: "Answer the basic auth prompt." },
      { kind: "printpdf", summary: "Print the page to pdf.", options: "{\"name\":\"report.pdf\"}" },
      { kind: "prefetch", summary: "Prefetch the predicted pages.", options: "{\"urls\":[\"https://example.com/next\"]}" },
      { kind: "preconnect", summary: "Preconnect to the expected origins.", options: "{\"origins\":[\"https://cdn.example\"]}" },
      { kind: "deeplink", summary: "Build the deep link.", options: "{\"app\":\"github\",\"params\":{\"owner\":\"wenathlan\",\"repo\":\"extension\"},\"navtarget\":{\"url\":\"https://example.com\",\"container\":\"tab\"}}" },
      { kind: "reopentab", value: "https://example.com/closed", summary: "Reopen the closed tab." },
      { kind: "trailaudit", summary: "Restore the navigation trail." },
      { kind: "pausenav", summary: "Pause navigation for the consent prompt.", options: "{\"reason\":\"a consent banner is open\"}" },
      { kind: "navintent", value: "open the pricing page", summary: "Record the navigation intent." },
      { kind: "navrate", summary: "Apply the per domain rate limit.", options: "{\"ratelimit\":{\"domain\":\"example.com\",\"window\":600000,\"ceiling\":3}}" },
      { kind: "openclipboard", value: "clipboard url", summary: "Open the clipboard url on consent." },
      { kind: "checksafe", value: "https://example.com/report", summary: "Verify the url safety." },
      { kind: "batchopen", summary: "Open the curated list.", options: "{\"urls\":[\"https://example.com/a\",\"https://example.com/b\"]}" },
    ] } }, "https://example.com");
    expect(proposal.plan.steps).toHaveLength(29);
    expect(proposal.plan.steps.filter(step => step.risk === "sensitive")).toHaveLength(20);
    expect(proposal.plan.steps.filter(step => step.risk === "read")).toHaveLength(9);
    expect(() => parseproposal({ version: protocolversion, plan: { objective: "Open without a target", steps: [{ kind: "openlink", summary: "Open without a navtarget." }] } }, "https://example.com")).toThrow("navtarget");
    expect(() => parseproposal({ version: protocolversion, plan: { objective: "Rate without a limit", steps: [{ kind: "navrate", summary: "Apply without a limit." }] } }, "https://example.com")).toThrow("ratelimit");
  });

  it("wraps the navstate envelope with its load phase, final url and redirect chain", () => {
    const plan = { id: "plan", objective: "o", origin: "https://example.com", steps: [], createdat: 1, expiresat: 2, state: "approved" as const };
    const chain: redirectchain = {
      hops: [
        { url: "https://example.com/start", status: 302, at: 10 },
        { url: "https://example.com/mid", status: 302, at: 20 },
        { url: "https://example.com/final", status: 200, at: 35 },
      ],
      startedat: 10,
      endedat: 35,
    };
    const state: navstate = { phase: "complete", finalurl: "https://example.com/final", redirects: chain };
    const envelope = JSON.parse(navstateresponse({ navstate: state, plan }));
    expect(envelope.version).toBe(protocolversion);
    expect(envelope.planstate).toBe("approved");
    expect(envelope.navstate.phase).toBe("complete");
    expect(envelope.navstate.finalurl).toBe("https://example.com/final");
    expect(envelope.navstate.redirects.hops).toHaveLength(3);
    expect(envelope.navstate.redirects.hops[1]).toMatchObject({ url: "https://example.com/mid", status: 302, at: 20 });
    expect(envelope.navstate.redirects.endedat - envelope.navstate.redirects.startedat).toBe(25);
  });

  it("carries the navigation trail of a session in the context envelope", () => {
    const report = trailreport({
      sessionid: "session",
      trail: [
        { url: "https://example.com/", title: "Home", stepid: "s1", at: 10 },
        { url: "https://example.com/pricing", title: "Pricing", stepid: "s2", at: 20 },
        { url: "https://example.com/pricing#faq", title: "", at: 30 },
      ],
    });
    expect(report.version).toBe(protocolversion);
    expect(report.sessionid).toBe("session");
    expect(report.trail).toHaveLength(3);
    expect(report.trail[1]).toMatchObject({ url: "https://example.com/pricing", title: "Pricing", stepid: "s2", at: 20 });
    expect(report.trail[2]?.stepid).toBeUndefined();
    expect(trailreport({ trail: [] })).toEqual({ version: protocolversion, trail: [] });
  });

  it("wraps url safety verdicts with their reasons in the response envelope", () => {
    const plan = { id: "plan", objective: "o", origin: "https://example.com", steps: [], createdat: 1, expiresat: 2, state: "approved" as const };
    const verdicts: safetyverdict[] = [
      { url: "https://partner.example/report", safe: true, reasons: [], at: 5 },
      { url: "http://tracker.example/pixel", safe: false, reasons: ["the url must use HTTPS"], at: 6 },
    ];
    const envelope = JSON.parse(safetyresponse({ verdicts, plan }));
    expect(envelope.version).toBe(protocolversion);
    expect(envelope.verdicts).toEqual(verdicts);
    expect(envelope.verdicts[1]).toMatchObject({ safe: false, reasons: ["the url must use HTTPS"] });
  });
});

describe("protocol tabs and windows command", () => {
  const plan = { id: "plan", objective: "o", origin: "https://example.com", steps: [], createdat: 1, expiresat: 2, state: "approved" as const };

  it("wraps tab reports with matches, groups and badges in the response envelope", () => {
    const report: tabreport = {
      matches: [{ tabid: 4, url: "https://example.com/a", title: "Example A", index: 0, windowid: 10, active: true, pinned: false, audible: false, muted: true, discarded: false, meta: { tabid: 4, taskrefs: ["plan"], provenance: "plan step", labels: ["research"], at: 5 } }],
      groups: [{ name: "research", color: "blue", tabids: [4, 5], collapsed: false }],
      badges: [{ tabid: 4, taskid: "plan", label: "2/5", setat: 6 }],
    };
    const envelope = JSON.parse(tabreportresponse({ report, plan }));
    expect(envelope.version).toBe(protocolversion);
    expect(envelope.planid).toBe("plan");
    expect(envelope.planstate).toBe("approved");
    expect(envelope.report.matches[0]).toMatchObject({ tabid: 4, muted: true, meta: { labels: ["research"] } });
    expect(envelope.report.groups[0]).toMatchObject({ name: "research", color: "blue", tabids: [4, 5] });
    expect(envelope.report.badges[0]).toMatchObject({ label: "2/5", taskid: "plan" });
  });

  it("carries layout snapshots with their window bounds and group states in the session context", () => {
    const layout: tablayout = {
      name: "work",
      tabs: [{ url: "https://example.com/a", title: "A", pinned: true, index: 0, windowid: 10 }],
      groups: [{ name: "research", color: "blue", tabids: [4], collapsed: true }],
      windows: [{ windowid: 10, state: { bounds: { left: 0, top: 0, width: 1280, height: 800 }, maximized: false, profile: "normal" } }],
      savedat: 42,
    };
    const report = layoutreport({ layouts: [layout] });
    expect(report.version).toBe(protocolversion);
    expect(report.layouts).toHaveLength(1);
    expect(report.layouts[0]?.windows[0]?.state.bounds).toEqual({ left: 0, top: 0, width: 1280, height: 800 });
    expect(report.layouts[0]?.groups[0]).toMatchObject({ collapsed: true });
    expect(layoutreport({ layouts: [] })).toEqual({ version: protocolversion, layouts: [] });
  });

  it("wraps form reports, error reports and wizard states in versioned envelopes", () => {
    const plan: agentplan = { id: "p1", objective: "Fill the checkout form", origin: "https://example.com", steps: [{ id: "s1", kind: "detectfields", summary: "Detect the fields.", risk: "read" }], createdat: 1, expiresat: 2, state: "approved" };
    const report: formreport = { form: "#checkout", fields: [{ selector: "#name", label: "Full name", kind: "text", matched: true }, { selector: "#card", label: "Card number", kind: "card", matched: false }] };
    const formenvelope = JSON.parse(formreportresponse({ report, plan })) as { version: string; planid: string; planstate: string; report: formreport };
    expect(formenvelope).toMatchObject({ version: protocolversion, planid: "p1", planstate: "approved" });
    expect(formenvelope.report.fields[1]).toMatchObject({ kind: "card", matched: false });
    const error: errorreport = { form: "#checkout", errors: [{ field: "#email", message: "Enter a valid email address." }], at: 5 };
    const errorenvelope = JSON.parse(errorreportresponse({ report: error, plan })) as { version: string; report: errorreport };
    expect(errorenvelope.version).toBe(protocolversion);
    expect(errorenvelope.report.errors[0]).toEqual({ field: "#email", message: "Enter a valid email address." });
    const wizards: wizardstate[] = [{ index: 2, steps: 3, completed: [true, true, false], at: 6 }];
    const picks: typeaheadpick[] = [{ field: "#city", query: "sao", pick: "São Paulo", at: 7 }];
    expect(wizardreport({ sessionid: "session", wizards, picks })).toEqual({ version: protocolversion, sessionid: "session", wizards, picks });
    expect(wizardreport({ wizards: [], picks: [] })).toEqual({ version: protocolversion, wizards: [], picks: [] });
  });

  it("wraps dataset payloads with column specs and sampled rows in the dataset envelope", () => {
    const columns: columnspec[] = [{ key: "sku", label: "Sku", kind: "text", normalized: "sku" }];
    const rows = Array.from({ length: 12 }, (_, index) => ({ sku: `sku-${index}` }));
    const datasetvalue: dataset = { id: "d1", name: "catalog", columns, rows, sources: [{ row: 0, url: "https://example.com/list", at: 5, stepid: "s1" }], at: 6 };
    const payload = JSON.parse(datasetresponse({ dataset: datasetvalue, plan: { ...plan, state: "approved" }, sample: 3 })) as { version: string; planstate: string; dataset: dataset & { totalrows: number } };
    expect(payload).toMatchObject({ version: protocolversion, planstate: "approved" });
    expect(payload.dataset.columns).toEqual(columns);
    expect(payload.dataset.rows).toHaveLength(3);
    expect(payload.dataset.totalrows).toBe(12);
    expect(payload.dataset.sources[0]).toMatchObject({ row: 0, stepid: "s1" });
  });

  it("carries extraction progress and provenance records per exported artifact in the context envelopes", () => {
    const sessionvalue: extractsession = { id: "e1", datasetid: "d1", name: "catalog", target: "table", next: "a.next", planned: 3, pages: ["https://example.com/1"], rows: 10, cursor: 1, startedat: 1, updatedat: 2 };
    expect(extractionreport({ sessions: [sessionvalue] })).toEqual({ version: protocolversion, sessions: [sessionvalue] });
    const record: provenancerecord = { artifact: "a1", name: "catalog.csv", url: "https://example.com/list", stepid: "s2", rowstart: 1, rowend: 10, checksum: "fnv1a-1", at: 3 };
    expect(provenancereport({ records: [record] })).toEqual({ version: protocolversion, records: [record] });
    const rules: transformrule[] = [{ expression: "trim", sources: ["name"], target: "name" }];
    expect(JSON.parse(transformgrammar(rules))).toEqual({ rules });
  });

  it("accepts the extraction vocabulary and grades exports sensitive inside a proposal", () => {
    const proposal = parseproposal({ version: protocolversion, plan: { objective: "Scrape the catalog", steps: [
      { kind: "scrapetable", target: "table.prices", options: "{\"name\":\"catalog\",\"rowlimit\":200}", summary: "Scrape the price table." },
      { kind: "transformvalues", options: "{\"dataset\":\"d1\",\"rules\":[{\"expression\":\"upper\",\"sources\":[\"name\"],\"target\":\"name\"}]}", summary: "Uppercase the names." },
    ] } }, "https://example.com");
    expect(proposal.plan.steps[0]?.risk).toBe("read");
    expect(() => parseproposal({ version: protocolversion, plan: { objective: "Bad transform", steps: [
      { kind: "transformvalues", options: "{\"dataset\":\"d1\",\"rules\":{\"expression\":\"upper\"}}", summary: "Rules must be a list." },
    ] } }, "https://example.com")).toThrow("transform rules");
  });

  it("accepts the forms and data vocabulary and refuses submissions without an asksubmit review", () => {
    const proposal = parseproposal({ version: protocolversion, plan: { objective: "Fill and submit the checkout", steps: [
      { kind: "detectfields", summary: "Detect the form fields." },
      { kind: "fillform", options: "{\"formrecord\":{\"form\":\"#checkout\",\"entries\":[{\"match\":{\"mode\":\"label\",\"label\":\"Full name\"},\"kind\":\"text\",\"value\":\"Ana Alves\"}]}}", summary: "Fill from the structured record." },
      { kind: "asksubmit", value: "#checkout", summary: "Ask before submitting." },
      { kind: "submitform", target: "#checkout", options: "{\"consentref\":\"ask\"}", summary: "Submit through the owning form." },
      { kind: "readerrors", target: "#checkout", summary: "Read the validation errors." },
    ] } }, "https://example.com");
    expect(proposal.plan.steps.map(step => step.risk)).toEqual(["read", "sensitive", "read", "sensitive", "read"]);
    expect(() => parseproposal({ version: protocolversion, plan: { objective: "Submit without review", steps: [
      { kind: "submitform", target: "#checkout", options: "{\"consentref\":\"missing\"}", summary: "Submit without asksubmit." },
    ] } }, "https://example.com")).toThrow("asksubmit");
  });
});

describe("files, clipboard and downloads protocol", () => {
  const plan = { id: "p1", objective: "Move files", origin: "https://example.com", steps: [], createdat: 1, expiresat: 2, state: "approved" as const };

  it("wraps download, netlog and quarantine payloads in the versioned envelopes", () => {
    const downloads: downloadrecord[] = [
      { id: "d1", url: "https://example.com/report.pdf", filename: "report.pdf", state: "complete", downloadid: 9, path: "/downloads/report.pdf", bytes: 2048, checksum: "fnv1a-abc", at: 4, updatedat: 5 },
      { id: "d2", url: "https://example.com/data.zip", filename: "data.zip", state: "paused", at: 6, updatedat: 7 },
    ];
    const envelope = JSON.parse(downloadreport({ downloads, plan: { ...plan, state: "approved" } })) as { version: string; planid: string; planstate: string; downloads: downloadrecord[] };
    expect(envelope).toMatchObject({ version: protocolversion, planid: "p1", planstate: "approved" });
    expect(envelope.downloads[0]).toMatchObject({ state: "complete", path: "/downloads/report.pdf", checksum: "fnv1a-abc", bytes: 2048 });
    expect(envelope.downloads[1]).toMatchObject({ state: "paused" });
    const records: netlogrecord[] = [{ url: "https://example.com/list", method: "GET", status: 200, timing: 120, requestid: "nav-1-1", stepid: "nav-1", at: 8 }];
    expect(netlogreport({ records })).toEqual({ version: protocolversion, records });
    const entries: quarantineentry[] = [{ id: "q1", path: "devthink-quarantine/invoice.pdf", reason: "mime application/pdf matched", scan: "clean", release: "user-9", at: 9, updatedat: 10 }];
    expect(quarantinereport({ entries })).toEqual({ version: protocolversion, entries });
  });

  it("accepts the files vocabulary and grades the sensitive batch and clipboard kinds", () => {
    const proposal = parseproposal({ version: protocolversion, plan: { objective: "Move the files safely", steps: [
      { kind: "batchdownload", options: "{\"downloadspec\":{\"urls\":[\"https://example.com/report.pdf\",\"https://example.com/data.zip\"],\"filename\":\"report\",\"complete\":\"size\"},\"concurrent\":3}", summary: "Download the reviewed batch." },
      { kind: "pausedownload", value: "report.pdf", summary: "Pause the first download." },
      { kind: "verifydownload", value: "report.pdf", options: "{\"bytes\":2048}", summary: "Verify the size." },
      { kind: "interceptmime", options: "{\"mimefilter\":{\"include\":[\"application/pdf*\"],\"exclude\":[],\"default\":\"deny\"}}", summary: "Intercept pdf downloads." },
      { kind: "readclipboard", options: "{\"consentref\":\"clip-1\",\"prompt\":\"Read the tracking number.\"}", summary: "Read the clipboard once." },
      { kind: "writeclipboard", value: "Reviewed summary.", summary: "Write the reviewed text." },
      { kind: "copyscreen", summary: "Copy the visible tab." },
      { kind: "exportnetlog", summary: "Export the network log." },
      { kind: "namecaptures", options: "{\"task\":\"task-1\",\"extension\":\"png\"}", summary: "Stamp capture names." },
      { kind: "cleanupartifacts", options: "{\"rules\":[{\"age\":60000,\"kind\":\"any\",\"keep\":\"latest\"}]}", summary: "Sweep old artifacts." },
    ] } }, "https://example.com");
    expect(proposal.plan.steps.map(step => step.risk)).toEqual(["sensitive", "sensitive", "read", "sensitive", "sensitive", "sensitive", "sensitive", "read", "read", "sensitive"]);
    expect(() => parseproposal({ version: protocolversion, plan: { objective: "Read without consent", steps: [
      { kind: "readclipboard", summary: "Read the clipboard without a consent ref." },
    ] } }, "https://example.com")).toThrow("consent ref");
    expect(() => parseproposal({ version: protocolversion, plan: { objective: "Bad filter", steps: [
      { kind: "interceptmime", options: "{\"mimefilter\":{\"include\":[],\"exclude\":[],\"default\":\"deny\"}}", summary: "Empty include list." },
    ] } }, "https://example.com")).toThrow("include");
  });
});

describe("media capture protocol", () => {
  const plan = { id: "p1", objective: "See the page", origin: "https://example.com", steps: [], createdat: 1, expiresat: 2, state: "approved" as const };

  it("wraps the capture block into the outcome envelope and carries the capture report", () => {
    const outcome: stepoutcome = { stepid: "shot-1", ok: true, summary: "Captured the visible viewport.", details: { capture: { id: "cap-1", kind: "shotview", format: "png", width: 1280, height: 800, bytes: 5200 } }, at: 3 };
    const envelope = JSON.parse(outcomeresponse({ outcome, plan, capture: { id: "cap-1", format: "png", bytes: 5200 } })) as { version: string; capture: { id: string; format: string; bytes: number } };
    expect(envelope).toMatchObject({ version: protocolversion, planid: "p1", planstate: "approved" });
    expect(envelope.capture).toEqual({ id: "cap-1", format: "png", bytes: 5200 });
    const plain = JSON.parse(outcomeresponse({ outcome, plan })) as { capture?: unknown };
    expect(plain.capture).toBeUndefined();
    const records: shotrecord[] = [
      { id: "cap-1", runid: "p1", stepid: "shot-1", kind: "shotview", format: "png", width: 1280, height: 800, capturedat: 3, bytes: "data:image/png;base64,xyz" },
      { id: "cap-2", runid: "p1", stepid: "shot-2", kind: "contactsheet", format: "webp", width: 960, height: 536, capturedat: 4, annotated: true },
    ];
    const pairs: shotpair[] = [{ id: "pair-1", beforeid: "cap-1", afterid: "cap-2", actionkind: "click", target: "#submit", domsnapshotid: "7", at: 5 }];
    expect(capturereport({ records, pairs })).toEqual({ version: protocolversion, records, pairs });
  });

  it("accepts the capture vocabulary, refuses unknown formats and negative region coordinates", () => {
    const proposal = parseproposal({ version: protocolversion, plan: { objective: "See the page with review", steps: [
      { kind: "shotview", options: "{\"capture\":{\"format\":\"png\",\"pixelratio\":2}}", summary: "Shoot the viewport." },
      { kind: "shotfullpage", options: "{\"settle\":150,\"overlap\":40,\"wait\":60000}", summary: "Shoot the full page." },
      { kind: "shotelement", target: "#card", options: "{\"capture\":{\"format\":\"webp\",\"exporttarget\":\"clipboard\"}}", summary: "Shoot the card." },
      { kind: "shotregion", options: "{\"regionrect\":{\"x\":10,\"y\":20,\"width\":400,\"height\":300},\"reviewed\":true}", summary: "Shoot the reviewed region." },
      { kind: "contactsheet", options: "{\"elements\":[\"#a\",\"#b\"],\"sheet\":{\"cellsize\":240,\"columns\":3,\"label\":\"both\"}}", summary: "Tile the cards." },
    ] } }, "https://example.com");
    expect(proposal.plan.steps.map(step => step.risk)).toEqual(["read", "read", "read", "read", "read"]);
    expect(proposal.plan.steps[2]?.target).toBe("#card");
    expect(() => parseproposal({ version: protocolversion, plan: { objective: "Bad format", steps: [
      { kind: "shotview", options: "{\"capture\":{\"format\":\"gif\"}}", summary: "Shoot with a bad format." },
    ] } }, "https://example.com")).toThrow("png, jpeg or webp");
    expect(() => parseproposal({ version: protocolversion, plan: { objective: "Negative region", steps: [
      { kind: "shotregion", options: "{\"regionrect\":{\"x\":-1,\"y\":0,\"width\":40,\"height\":30},\"reviewed\":true}", summary: "Shoot a negative region." },
    ] } }, "https://example.com")).toThrow("negative coordinates");
    expect(() => parseproposal({ version: protocolversion, plan: { objective: "Unreviewed region", steps: [
      { kind: "shotregion", options: "{\"regionrect\":{\"x\":0,\"y\":0,\"width\":40,\"height\":30}}", summary: "Shoot an unreviewed region." },
    ] } }, "https://example.com")).toThrow("reviewed flag");
  });
});

describe("media capture part two protocol", () => {
  const plan = { id: "p1", objective: "See and hear the page", origin: "https://example.com", steps: [], createdat: 1, expiresat: 2, state: "approved" as const };

  it("wraps the media block into the outcome envelope and carries the media report", () => {
    const outcome: stepoutcome = { stepid: "pdf-1", ok: true, summary: "Composed a derived pdf report.", details: { media: { id: "pdf-1", kind: "pdf", bytes: 4200 } }, at: 3 };
    const envelope = JSON.parse(outcomeresponse({ outcome, plan, media: { id: "pdf-1", kind: "pdf", bytes: 4200 } })) as { version: string; media: { id: string; kind: string; bytes: number } };
    expect(envelope).toMatchObject({ version: protocolversion, planid: "p1", planstate: "approved" });
    expect(envelope.media).toEqual({ id: "pdf-1", kind: "pdf", bytes: 4200 });
    const plain = JSON.parse(outcomeresponse({ outcome, plan })) as { media?: unknown };
    expect(plain.media).toBeUndefined();
    const records: mediarecord[] = [
      { id: "pdf-1", runid: "p1", stepid: "pdf-1", pages: 3, pagewidth: 612, pageheight: 792, margins: { top: 28.8, right: 28.8, bottom: 28.8, left: 28.8 }, landscape: false, scale: 1, bytes: 4200, at: 3 },
      { id: "rec-1", runid: "p1", stepid: "rec-1", tabid: 4, kind: "screen", scope: "run", format: "frames", startedat: 4, endedat: 9, duration: 5, fps: 2, frames: ["f1", "f2"], at: 4 },
    ];
    const images: imagebatch[] = [{ id: "batch-1", runid: "p1", stepid: "img-1", images: [{ url: "https://example.com/a.png", alt: "Chart", width: 400, height: 300, bytes: 1200, mime: "image/png" }], matched: 1, downloaded: 1, at: 5 }];
    expect(mediareport({ records, images })).toEqual({ version: protocolversion, records, images });
  });

  it("accepts the media vocabulary and rejects negative margins, bad scopes and negative intervals", () => {
    const proposal = parseproposal({ version: protocolversion, plan: { objective: "Capture media with review", steps: [
      { kind: "capturepdf", options: "{\"pdf\":{\"paperwidth\":8.5,\"paperheight\":11,\"margins\":{\"top\":0.4,\"right\":0.4,\"bottom\":0.4,\"left\":0.4},\"scale\":1,\"paginate\":true},\"breakpoints\":[\"#section-2\"],\"exporttarget\":\"memory\"}", summary: "Print the report." },
      { kind: "recordscreen", options: "{\"recording\":{\"scope\":\"run\",\"fps\":2},\"duration\":1000,\"consentref\":\"c1\"}", summary: "Record the run." },
      { kind: "captureaudio", options: "{\"recording\":{\"audio\":true},\"duration\":1000,\"consentref\":\"c2\"}", summary: "Record the audio." },
      { kind: "captureframe", target: "video.tutorial", options: "{\"timestamp\":5,\"poster\":true}", summary: "Grab the frame." },
      { kind: "downloadimages", options: "{\"imagefilter\":{\"selector\":\"main img\",\"minwidth\":200}}", summary: "Download the images." },
      { kind: "shotcanvas", target: "canvas.chart", options: "{\"capture\":{\"format\":\"webp\"}}", summary: "Shoot the canvas." },
      { kind: "probestream", summary: "Probe the streams." },
      { kind: "readmedia", summary: "Read the sources." },
      { kind: "readassets", summary: "Read the assets." },
      { kind: "timelapse", options: "{\"lapse\":{\"interval\":500,\"duration\":5000},\"wait\":6000}", summary: "Shoot the lapse." },
      { kind: "convertimage", options: "{\"capture\":\"cap-1\",\"convert\":{\"target\":\"webp\",\"quality\":85}}", summary: "Convert the capture." },
      { kind: "makethumbs", options: "{\"captures\":[\"cap-1\"],\"thumb\":{\"size\":240,\"fit\":\"cover\",\"suffix\":\"thumb\"}}", summary: "Thumb the captures." },
    ] } }, "https://example.com");
    expect(proposal.plan.steps.map(step => step.risk)).toEqual(["read", "sensitive", "sensitive", "read", "sensitive", "read", "read", "read", "read", "read", "read", "read"]);
    expect(proposal.plan.steps[3]?.target).toBe("video.tutorial");
    expect(() => parseproposal({ version: protocolversion, plan: { objective: "Negative margins", steps: [
      { kind: "capturepdf", options: "{\"pdf\":{\"margins\":{\"left\":-0.2}}}", summary: "Print with negative margins." },
    ] } }, "https://example.com")).toThrow("negative margins are refused");
    expect(() => parseproposal({ version: protocolversion, plan: { objective: "Bad scope", steps: [
      { kind: "recordscreen", options: "{\"recording\":{\"scope\":\"window\"},\"consentref\":\"c1\"}", summary: "Record with a bad scope." },
    ] } }, "https://example.com")).toThrow("scope must be tab or run");
    expect(() => parseproposal({ version: protocolversion, plan: { objective: "Negative interval", steps: [
      { kind: "timelapse", options: "{\"lapse\":{\"interval\":-500,\"duration\":5000}}", summary: "Shoot a negative interval." },
    ] } }, "https://example.com")).toThrow("interval");
    expect(() => parseproposal({ version: protocolversion, plan: { objective: "Recording without consent", steps: [
      { kind: "captureaudio", options: "{\"recording\":{\"audio\":true}}", summary: "Record without consent." },
    ] } }, "https://example.com")).toThrow("consent ref");
    expect(() => parseproposal({ version: protocolversion, plan: { objective: "Lapse over budget", steps: [
      { kind: "timelapse", options: "{\"lapse\":{\"interval\":500,\"duration\":9000},\"wait\":5000}", summary: "Shoot past the budget." },
    ] } }, "https://example.com")).toThrow("exceeds the reviewed wait budget");
  });
});

describe("network observation part one protocol", () => {
  const plan = { id: "p1", objective: "Speak to the network under review", origin: "https://example.com", steps: [], createdat: 1, expiresat: 2, state: "approved" as const };

  it("wraps the transport block into the outcome envelope and carries the calls report without bodies", () => {
    const outcome: stepoutcome = { stepid: "f1", ok: true, summary: "Fetched the reviewed url.", details: { transport: { status: 200, headers: ["content-type"], bytes: 512, duration: 340 }, retries: 1 }, at: 3 };
    const envelope = JSON.parse(outcomeresponse({ outcome, plan, transport: { status: 200, headers: ["content-type"], bytes: 512, duration: 340 } })) as { version: string; transport: { status: number; headers: string[]; bytes: number; duration: number } };
    expect(envelope).toMatchObject({ version: protocolversion, planid: "p1", planstate: "approved" });
    expect(envelope.transport).toEqual({ status: 200, headers: ["content-type"], bytes: 512, duration: 340 });
    const plain = JSON.parse(outcomeresponse({ outcome, plan })) as { transport?: unknown };
    expect(plain.transport).toBeUndefined();
    const calls: callrecord[] = [
      { id: "c1", runid: "p1", stepid: "f1", kind: "fetch", url: "https://api.example/data", origin: "https://api.example", method: "GET", status: 200, statusclass: "success", duration: 120, retries: 1, bytes: 512, headernames: ["x-request-id"], body: "{\"secret\":\"no\"}", at: 4 },
      { id: "c2", runid: "p1", stepid: "g1", kind: "graphql", url: "https://api.example/graphql", origin: "https://api.example", method: "POST", status: 200, statusclass: "success", duration: 80, retries: 0, bytes: 64, headernames: [], errors: ["auth required"], at: 5 },
    ];
    const report = callsreport({ calls });
    expect(report.version).toBe(protocolversion);
    expect(report.calls).toHaveLength(2);
    expect(report.calls[0]).toMatchObject({ id: "c1", statusclass: "success", retries: 1 });
    expect(report.calls[0]?.streambytes).toBeUndefined();
    expect(report.calls[0]?.body).toBeUndefined();
    expect(report.calls[1]).toMatchObject({ kind: "graphql", errors: ["auth required"] });
  });

  it("rejects fetch requests to ungranted origins and header allowlists with empty names", () => {
    const proposal = parseproposal({ version: protocolversion, plan: { objective: "Fetch under review", steps: [
      { kind: "fetchurl", options: "{\"fetch\":{\"url\":\"https://example.com/data\"}}", summary: "Fetch the granted origin." },
      { kind: "callrest", options: "{\"endpoint\":\"issues\"}", summary: "Call the typed endpoint." },
    ] } }, "https://example.com");
    expect(proposal.plan.steps.map(step => step.risk)).toEqual(["read", "sensitive"]);
    expect(() => parseproposal({ version: protocolversion, plan: { objective: "Fetch outside", steps: [
      { kind: "fetchurl", options: "{\"fetch\":{\"url\":\"https://api.example/data\"}}", summary: "Fetch an ungranted origin." },
    ] } }, "https://example.com")).toThrow("outside the grants");
    const granted = parseproposal({ version: protocolversion, plan: { objective: "Fetch the granted api", steps: [
      { kind: "fetchurl", options: "{\"fetch\":{\"url\":\"https://api.example/data\"}}", summary: "Fetch the granted api origin." },
    ] } }, "https://example.com", ["https://example.com", "https://api.example"]);
    expect(granted.plan.steps).toHaveLength(1);
    expect(() => parseproposal({ version: protocolversion, plan: { objective: "Empty header name", steps: [
      { kind: "fetchurl", options: "{\"fetch\":{\"url\":\"https://example.com/data\",\"headers\":{\"\":\"v\"}}}", summary: "Fetch with an empty header name." },
    ] } }, "https://example.com")).toThrow("empty names");
  });

  it("accepts the http options grammar with stream budgets, path rules, queries and graphql operations", () => {
    const proposal = parseproposal({ version: protocolversion, plan: { objective: "Observe the network", steps: [
      { kind: "fetchurl", options: "{\"fetch\":{\"url\":\"https://example.com/data\",\"method\":\"POST\",\"headers\":{\"x-request-id\":\"42\"},\"body\":\"{}\",\"mode\":\"cors\"},\"fetchoptions\":{\"timeout\":1000,\"retries\":2,\"backoff\":100,\"follow\":3},\"stream\":{\"budget\":4096},\"wait\":5000,\"consentref\":\"c1\"}", summary: "Fetch a reviewed url." },
      { kind: "parsejson", options: "{\"call\":\"c1\",\"fields\":[{\"name\":\"title\",\"path\":\"data.title\",\"kind\":\"text\"}]}", summary: "Parse the fetched body." },
      { kind: "parsehtml", options: "{\"call\":\"c1\",\"queries\":[{\"selector\":\"a.link\",\"attribute\":\"href\",\"multi\":true}]}", summary: "Query the fetched markup." },
      { kind: "callgraphql", options: "{\"endpoint\":\"graph\",\"graphql\":{\"query\":\"query{hero}\",\"operationkind\":\"query\"}}", summary: "Run the reviewed query." },
    ] } }, "https://example.com");
    expect(proposal.plan.steps.map(step => step.risk)).toEqual(["read", "read", "read", "sensitive"]);
    expect(() => parseproposal({ version: protocolversion, plan: { objective: "Bad path", steps: [
      { kind: "parsejson", options: "{\"call\":\"c1\",\"fields\":[{\"name\":\"a\",\"path\":\"bad..path\"}]}", summary: "Parse a bad path." },
    ] } }, "https://example.com")).toThrow("dotted path");
  });
});

describe("network observation part two protocol", () => {
  const now = 1_800_000_000_000;
  const origin = "https://example.com";
  const version = protocolversion;

  it("wraps step outcomes with the network block of exchange counts and channel state", () => {
    const plan: agentplan = { id: "plan", objective: "Observe", origin, steps: [{ id: "s1", kind: "watchrequests", summary: "Watch.", risk: "read" }], createdat: now, expiresat: now + 1000, state: "approved" };
    const outcome: stepoutcome = { stepid: "s1", ok: true, summary: "Observed 3 requests.", details: { network: { exchanges: 3, channelstate: "none", messages: 0 } }, at: now };
    const parsed = JSON.parse(outcomeresponse({ outcome, plan, network: { exchanges: 3, channelstate: "none", messages: 0 } })) as { network?: { exchanges: number; channelstate: string; messages: number } };
    expect(parsed.network).toEqual({ exchanges: 3, channelstate: "none", messages: 0 });
    const bare = JSON.parse(outcomeresponse({ outcome, plan })) as { network?: unknown };
    expect(bare.network).toBeUndefined();
  });

  it("carries every exchange, channel, subscription and api map entry in the exchanges report", () => {
    const exchange: exchangerecord = { id: "e1", runid: "run", stepid: "s1", correlationid: "run-1", url: "https://api.example/items", origin: "https://api.example", method: "GET", status: 200, statusclass: "success", source: "extension", timing: 42, bytes: 128, mime: "application/json", bodyref: "body1", at: now };
    const channel: channelrecord = { id: "ch1", runid: "run", stepid: "s2", kind: "websocket", url: "wss://api.example/live", origin: "https://api.example", state: "open", openedat: now, sent: 2, received: 5, reconnects: 1 };
    const subscription: eventsubscription = { id: "sub1", runid: "run", stepid: "s3", url: "https://api.example/stream", origin: "https://api.example", state: "open", events: 9, names: ["userjoin"], lasteventid: "41", cancel: { kind: "stop", value: "done" }, openedat: now };
    const apimap: apimapentry = { endpoint: "https://api.example/items", method: "GET", mime: "application/json", frequency: 3, payloadshape: ["id"], jsonshare: 1, stability: 1, origin: "https://api.example", correlationids: ["run-1"] };
    const report = exchangesreport({ exchanges: [exchange], channels: [channel], subscriptions: [subscription], apimap: [apimap] });
    expect(report.version).toBe(version);
    expect(report.exchanges[0]?.correlationid).toBe("run-1");
    expect(report.channels[0]).toMatchObject({ state: "open", sent: 2, received: 5 });
    expect(report.subscriptions[0]).toMatchObject({ events: 9, lasteventid: "41" });
    expect(report.apimap[0]).toMatchObject({ frequency: 3 });
  });

  it("rejects channel urls outside the grants, subscriptions without cancellation and lifetimes beyond the plan window", () => {
    const planof = (steps: Array<Record<string, unknown>>, expiresat?: number): unknown => ({ version, plan: { objective: "Observe", origin, steps, ...(expiresat !== undefined ? { expiresat } : {}) } });
    const stepinput = (kind: string, options: Record<string, unknown>): Record<string, unknown> => ({ id: "s1", kind, summary: "Observe.", options: JSON.stringify(options) });
    const socket = parseproposal(planof([stepinput("opensocket", { socket: { url: "wss://api.example/live" } })]) as Record<string, unknown>, origin, [origin, "https://api.example"]);
    expect(socket.plan.steps[0]?.risk).toBe("read");
    expect(() => parseproposal(planof([stepinput("opensocket", { socket: { url: "wss://other.example/live" } })]) as Record<string, unknown>, origin, [origin])).toThrow("outside the grants");
    expect(() => parseproposal(planof([stepinput("subscribesse", { subscription: { url: "https://other.example/stream", cancel: { kind: "stop", value: "done" } } })]) as Record<string, unknown>, origin, [origin])).toThrow("outside the grants");
    expect(() => parseproposal(planof([stepinput("subscribesse", { subscription: { url: "https://api.example/stream" } })]) as Record<string, unknown>, origin, ["https://api.example"])).toThrow("cancellation path");
    expect(() => parseproposal(planof([stepinput("longpoll", { poll: { url: "https://api.example/poll", cursorfield: "c", interval: 50 } })]) as Record<string, unknown>, origin, ["https://api.example"])).toThrow("stop condition");
    expect(() => parseproposal(planof([stepinput("opensocket", { socket: { url: "wss://api.example/live", lifetime: 60_000 } })], Date.now() + 5000), origin, ["https://api.example"])).toThrow("exceeds the reviewed plan window");
    expect(() => parseproposal(planof([stepinput("subscribesse", { subscription: { url: "https://api.example/stream", lifetime: 60_000, cancel: { kind: "lifetime", value: 60_000 } } })], Date.now() + 5000), origin, ["https://api.example"])).toThrow("exceeds the reviewed plan window");
    expect(() => parseproposal(planof([stepinput("opensocket", { socket: { url: "wss://api.example/live", lifetime: 4000 } })], Date.now() + 5000), origin, ["https://api.example"])).not.toThrow();
  });

  it("grades conditional capturebodies and extractapi steps through the resolved risk", () => {
    const stepinput = (kind: string, options: Record<string, unknown>): Record<string, unknown> => ({ id: "s1", kind, summary: "Observe.", options: JSON.stringify(options) });
    const privatebodies = parseproposal({ version, plan: { objective: "Capture", origin, steps: [stepinput("capturebodies", { body: { mimes: ["application/json"], ceiling: 100 } })] } }, origin, [origin]);
    expect(privatebodies.plan.steps[0]?.risk).toBe("sensitive");
    const publicbodies = parseproposal({ version, plan: { objective: "Capture", origin, steps: [stepinput("capturebodies", { body: { mimes: ["image/png"], ceiling: 100 } })] } }, origin, [origin]);
    expect(publicbodies.plan.steps[0]?.risk).toBe("interaction");
    const readreplay = parseproposal({ version, plan: { objective: "Replay", origin, steps: [stepinput("extractapi", { replay: { endpoint: "https://api.example/items", verb: "GET" } })] } }, origin, [origin, "https://api.example"]);
    expect(readreplay.plan.steps[0]?.risk).toBe("read");
    const mutreplay = parseproposal({ version, plan: { objective: "Replay", origin, steps: [stepinput("extractapi", { replay: { endpoint: "https://api.example/items", verb: "POST" } })] } }, origin, [origin, "https://api.example"]);
    expect(mutreplay.plan.steps[0]?.risk).toBe("sensitive");
    const send = parseproposal({ version, plan: { objective: "Send", origin, steps: [stepinput("sendmessage", { message: { channel: "ch1", payload: "x" } })] } }, origin, [origin]);
    expect(send.plan.steps[0]?.risk).toBe("sensitive");
  });
});

describe("network control protocol", () => {
  const plan: agentplan = { id: "plan", objective: "Control traffic", origin: "https://example.com", steps: [], createdat: 1, expiresat: 2, state: "approved" };
  const outcome: stepoutcome = { stepid: "s1", ok: true, summary: "Applied the reviewed rules.", at: 3 };

  it("attaches the control block with applied rule counts to the response envelope", () => {
    const envelope = JSON.parse(outcomeresponse({ outcome, plan, control: { applied: 3, blocked: 2, mocked: 1 } }));
    expect(envelope.control).toEqual({ applied: 3, blocked: 2, mocked: 1 });
    const bare = JSON.parse(outcomeresponse({ outcome, plan }));
    expect(bare.control).toBeUndefined();
  });

  it("carries token scopes without token values in the auth report", () => {
    const report = authreport({ tokens: [{ id: "t1", provider: "providerco", origin: "https://api.example", scopes: ["read"], accessstorageid: "token-t1-access", expiresat: 99, at: 1 }] });
    expect(report.tokens[0]).toMatchObject({ id: "t1", provider: "providerco", scopes: ["read"] });
    expect(JSON.stringify(report)).not.toContain("token-t1-access");
  });

  it("carries the traffic control state with mock bodies held back", () => {
    const report = controlreport({
      blocks: [{ id: "b1", runid: "run1", stepid: "s1", urlpattern: "https://ads.example/*", hits: 2, registeredat: 1 }],
      mocks: [{ id: "m1", runid: "run1", stepid: "s1", urlpattern: "https://api.example/status", status: 204, body: "fixture-body", reviewed: true, hits: 1, registeredat: 1 }],
      rewrites: [{ id: "h1", runid: "run1", stepid: "s1", urlpattern: "https://api.example/*", name: "accept", operation: "set", value: "json", hits: 4, registeredat: 1 }],
      cookies: [{ id: "c1", runid: "run1", stepid: "s1", kind: "write", domain: "example.com", names: ["session"], at: 1 }],
      proxies: [{ id: "p1", runid: "run1", stepid: "s1", scheme: "socks5", host: "proxy.example", port: 1080, bypass: ["https://api.example"], appliedat: 1 }],
      ratelimits: [{ origin: "https://api.example", remaining: 3, limit: 10, resetat: 50, at: 1 }],
    });
    expect(report.blocks[0]).toMatchObject({ hits: 2 });
    expect(report.mocks[0]).toMatchObject({ status: 204, hits: 1 });
    expect(report.mocks[0]?.body).toBeUndefined();
    expect(JSON.stringify(report)).not.toContain("fixture-body");
    expect(report.cookies[0]).toMatchObject({ kind: "write" });
    expect(report.ratelimits[0]).toMatchObject({ remaining: 3 });
  });

  it("rejects block rules without an origin pattern and proxy routes without a bypass list", () => {
    expect(() => parseproposal({ version: protocolversion, plan: { objective: "Block", steps: [{ kind: "blockrequest", summary: "Block", options: JSON.stringify({ block: { urlpattern: "ads.example/*", reviewed: true } }) }] } }, "https://example.com")).toThrow("Block rules without a named origin pattern are refused.");
    expect(() => parseproposal({ version: protocolversion, plan: { objective: "Proxy", steps: [{ kind: "routeproxy", summary: "Route", options: JSON.stringify({ consentref: "c", proxy: { scheme: "socks5", host: "proxy.example", port: 1080, bypass: [] } }) }] } }, "https://example.com")).toThrow("Proxy routes without a bypass list are refused.");
  });
});

describe("debugging protocol", () => {
  const plan = { id: "plan", objective: "Debug the page", origin: "https://example.com", steps: [], createdat: 1, expiresat: 2, state: "approved" as const };

  it("attaches the timeline block to the outcome envelope and carries the timeline and console diff reports", () => {
    const outcome: stepoutcome = { stepid: "w1", ok: true, summary: "Captured 4 console calls.", details: { errorids: ["e1"], rejectionids: [] }, at: 5 };
    const envelope = JSON.parse(outcomeresponse({ outcome, plan, timeline: { entries: 4, levels: { error: 1, warn: 1, info: 2, log: 0, debug: 0, trace: 0 }, collapsed: 2 } })) as { version: string; timeline: { entries: number; levels: Record<string, number>; collapsed: number } };
    expect(envelope.version).toBe(protocolversion);
    expect(envelope.timeline).toEqual({ entries: 4, levels: { error: 1, warn: 1, info: 2, log: 0, debug: 0, trace: 0 }, collapsed: 2 });
    const plain = JSON.parse(outcomeresponse({ outcome, plan })) as { timeline?: unknown };
    expect(plain.timeline).toBeUndefined();
    const timeline = timelinereport({ entries: [{ id: "t1", runid: "plan", stepid: "w1", time: 3, level: "error", source: "error", message: "boom" }], errors: [{ id: "e1", runid: "plan", stepid: "w1", message: "boom", frames: [{ url: "https://example.com/app.js", line: 42 }], sourceurl: "https://example.com/app.js", line: 42, at: 3 }], rejections: [], longtasks: [{ id: "l1", runid: "plan", stepid: "w1", duration: 90, starttime: 10, attributions: ["same-origin"], at: 3 }], levelcounts: { error: 1 } });
    expect(timeline.version).toBe(protocolversion);
    expect(timeline.entries[0]?.message).toBe("boom");
    expect(timeline.errors[0]?.frames).toHaveLength(1);
    expect(timeline.longtasks[0]?.attributions).toEqual(["same-origin"]);
    const diff = consolediffreport({ diff: { base: "run1", target: "run2", lines: [{ kind: "added", text: "fresh" }, { kind: "removed", text: "gone" }, { kind: "repeated", text: "boot", count: 1 }], added: 1, removed: 1, repeated: 1, at: 8 } });
    expect(diff.diff.base).toBe("run1");
    expect(diff.diff.lines).toHaveLength(3);
  });

  it("accepts the watch options grammar and rejects level floors outside the level set", () => {
    const proposal = parseproposal({ version: protocolversion, plan: { objective: "Debug", steps: [
      { kind: "watchconsole", options: JSON.stringify({ watch: { window: 250 }, level: "warn", depth: 3, redact: ["secret"], spam: { pattern: "retry", windowsize: 500, collapse: 2 }, rotation: { maxentries: 40, overflowtarget: "overflow1" } }), summary: "Capture console output at every level." },
      { kind: "watcherrors", options: JSON.stringify({ watch: { window: 250 }, level: "error" }), summary: "Capture errors with stacks." },
      { kind: "watchtasks", options: JSON.stringify({ watch: { window: 250 }, threshold: 50 }), summary: "Capture long task timings." },
    ] } }, "https://example.com");
    expect(proposal.plan.steps.map(step => step.risk)).toEqual(["read", "read", "read"]);
    expect(() => parseproposal({ version: protocolversion, plan: { objective: "Debug", steps: [{ kind: "watchconsole", options: JSON.stringify({ watch: { window: 250 }, redact: ["s"], level: "verbose" }), summary: "Bad level floor." }] } }, "https://example.com")).toThrow("level floor");
    expect(() => parseproposal({ version: protocolversion, plan: { objective: "Debug", steps: [{ kind: "watchconsole", options: JSON.stringify({ watch: { window: 250 } }), summary: "Missing redaction." }] } }, "https://example.com")).toThrow("redaction");
  });

  it("rejects watch steps for ungranted origins", () => {
    expect(() => parseproposal({ version: protocolversion, plan: { objective: "Debug", steps: [{ kind: "watchconsole", options: JSON.stringify({ watch: { window: 250 }, redact: ["secret"] }), summary: "Watch the console." }] } }, "https://example.com", ["https://other.example"])).toThrow("outside the grants");
    const granted = parseproposal({ version: protocolversion, plan: { objective: "Debug", steps: [{ kind: "watchconsole", options: JSON.stringify({ watch: { window: 250 }, redact: ["secret"] }), summary: "Watch the console." }] } }, "https://example.com", ["https://example.com"]);
    expect(granted.plan.steps).toHaveLength(1);
  });
});

describe("debugging part two protocol", () => {
  const attachoptions = { domains: ["Runtime", "Debugger"], teardown: { revertsteps: ["revert breakpoints", "revert overrides"], resumepolicy: "pause" } };

  it("attaches the cdp block to the outcome envelope and carries the cdp report with sources held back", () => {
    const outcome: stepoutcome = { stepid: "c1", ok: true, summary: "The command returned.", at: 4 };
    const plan: agentplan = { id: "plan", objective: "Debug", origin: "https://example.com", steps: [{ id: "c1", kind: "cdpcmd", summary: "Evaluate", risk: "sensitive", options: JSON.stringify({ command: { method: "Runtime.evaluate" } }) }], createdat: 1, expiresat: 9000, state: "approved" };
    const envelope = JSON.parse(outcomeresponse({ outcome, plan, cdp: { sessionid: "cdp1", state: "attached", commandids: ["cmd1", "cmd2"] } })) as { cdp: { sessionid: string; state: string; commandids: string[] } };
    expect(envelope.cdp).toEqual({ sessionid: "cdp1", state: "attached", commandids: ["cmd1", "cmd2"] });
    const plain = JSON.parse(outcomeresponse({ outcome, plan })) as { cdp?: unknown };
    expect(plain.cdp).toBeUndefined();
    const session: cdpsession = { id: "cdp1", runid: "plan", stepid: "a1", tabid: 4, origin: "https://example.com", attachedat: 2, domains: ["Runtime"], debuggerversion: "devthink instrumented harness 1.1.46 (no chrome.debugger permission)" };
    const command: cdpcommand = { id: "cmd1", sessionid: "cdp1", runid: "plan", stepid: "c1", method: "Runtime.evaluate", domain: "Runtime", duration: 8, at: 3 };
    const rule: cdpeventrule = { id: "r1", sessionid: "cdp1", runid: "plan", stepid: "w1", domain: "Log", event: "entryAdded", events: 2, registeredat: 2 };
    const breakpoint: breakpointspec = { id: "bp1", runid: "plan", stepid: "b1", url: "https://example.com/app.js", line: 5, condition: "items.length > 0", hits: 3, registeredat: 2 };
    const pause: pausestate = { id: "p1", runid: "plan", stepid: "b1", reason: "breakpoint", callframes: [{ url: "https://example.com/app.js", line: 5 }], hitbreakpoint: "bp1", domsnapshotid: "dom-3", at: 4 };
    const watch: watchexpression = { id: "we1", runid: "plan", stepid: "w1", expression: "items.length", scope: "topframe", reviewed: true, values: [{ pauseid: "p1", value: "3", at: 4 }], at: 2 };
    const override: scriptoverride = { id: "ov1", runid: "plan", stepid: "o1", urlpattern: "https://cdn.example/vendor.js", source: "window.fixture = true;", reviewed: true, hits: 1, appliedat: 2 };
    const grant: debuggergrant = { id: "g1", prompt: "Debugger attach prompt", origin: "https://example.com", domains: ["Runtime"], approved: true, consentedat: 1 };
    const report = cdpreport({ sessions: [session], commands: [command], events: [rule], breakpoints: [breakpoint], pauses: [pause], watches: [watch], overrides: [override], grants: [grant] });
    expect(report.version).toBe(protocolversion);
    expect(report.sessions[0]?.domains).toEqual(["Runtime"]);
    expect(report.commands[0]).toMatchObject({ method: "Runtime.evaluate", duration: 8 });
    expect(report.breakpoints[0]).toMatchObject({ hits: 3, condition: "items.length > 0" });
    expect(report.pauses[0]).toMatchObject({ domsnapshotid: "dom-3" });
    expect(report.watches[0]?.values).toHaveLength(1);
    expect(report.overrides[0]?.source).toBeUndefined();
    expect(report.overrides[0]?.urlpattern).toBe("https://cdn.example/vendor.js");
    expect(report.grants[0]?.prompt).toBeUndefined();
    expect(report.grants[0]?.domains).toEqual(["Runtime"]);
  });

  it("rejects cdp proposals outside the attach contract and accepts the reviewed chain", () => {
    const attach = { kind: "attachcdp", options: JSON.stringify(attachoptions), summary: "Attach the devtools session." };
    const command = { kind: "cdpcmd", options: JSON.stringify({ command: { method: "Runtime.evaluate" } }), summary: "Evaluate an expression." };
    const accepted = parseproposal({ version: protocolversion, plan: { objective: "Debug", steps: [attach, command] } }, "https://example.com");
    expect(accepted.plan.steps).toHaveLength(2);
    expect(accepted.plan.steps[1]?.risk).toBe("sensitive");
    expect(() => parseproposal({ version: protocolversion, plan: { objective: "Debug", steps: [{ kind: "attachcdp", options: JSON.stringify({ domains: ["Runtime"] }), summary: "Attach without a teardown plan." }] } }, "https://example.com")).toThrow("teardown plan");
    expect(() => parseproposal({ version: protocolversion, plan: { objective: "Debug", steps: [{ kind: "attachcdp", options: JSON.stringify({ domains: [], teardown: { revertsteps: ["x"] } }), summary: "Attach without domains." }] } }, "https://example.com")).toThrow("domain");
    expect(() => parseproposal({ version: protocolversion, plan: { objective: "Debug", steps: [command] } }, "https://example.com")).toThrow("attachcdp step");
    expect(() => parseproposal({ version: protocolversion, plan: { objective: "Debug", steps: [attach, { kind: "cdpcmd", options: JSON.stringify({ command: { method: "DOM.getSnapshot" } }), summary: "Command outside the allowlist." }] } }, "https://example.com")).toThrow("allowlist");
    expect(() => parseproposal({ version: protocolversion, plan: { objective: "Debug", steps: [{ kind: "watchcdp", options: JSON.stringify({ events: [{ domain: "Log", event: "entryAdded" }], watch: { window: 100 } }), summary: "Watch events on an ungranted origin." }] } }, "https://example.com", ["https://other.example"])).toThrow("outside the grants");
    const gated = { kind: "attachcdp", options: JSON.stringify({ ...attachoptions, allowlist: { domains: ["Runtime"], methods: ["Runtime.evaluate"] } }), summary: "Attach with method gates." };
    expect(parseproposal({ version: protocolversion, plan: { objective: "Debug", steps: [gated, command] } }, "https://example.com").plan.steps).toHaveLength(2);
    expect(() => parseproposal({ version: protocolversion, plan: { objective: "Debug", steps: [gated, { kind: "cdpcmd", options: JSON.stringify({ command: { method: "Runtime.callFunctionOn" } }), summary: "Gated out." }] } }, "https://example.com")).toThrow("allowlist");
  });
});

describe("debugging part three protocol", () => {
  it("attaches the profile block to the outcome envelope and carries the profile report with consent prompts held back", () => {
    const outcome: stepoutcome = { stepid: "m1", ok: true, summary: "The flow measurement ran.", at: 4 };
    const plan: agentplan = { id: "plan", objective: "Profile", origin: "https://example.com", steps: [{ id: "m1", kind: "measureflow", summary: "Measure", risk: "read", options: JSON.stringify({ flow: { prefix: "flow", steps: ["s1"], metrics: ["navigation"] }, watch: { window: 100 } }) }], createdat: 1, expiresat: 9000, state: "approved" };
    const envelope = JSON.parse(outcomeresponse({ outcome, plan, profile: { metrics: 3, samples: 5 } })) as { profile: { metrics: number; samples: number } };
    expect(envelope.profile).toEqual({ metrics: 3, samples: 5 });
    const plain = JSON.parse(outcomeresponse({ outcome, plan })) as { profile?: unknown };
    expect(plain.profile).toBeUndefined();
    const flow: flowmetric = { id: "f1", runid: "plan", stepid: "m1", name: "navigation", start: 0, end: 800, duration: 800, steps: ["s1"], at: 2 };
    const heap: heaprecord = { id: "h1", runid: "plan", stepid: "hs", origin: "https://example.com", bytesize: 12_000_000, nodecount: 1450, capturedat: 3 };
    const sample: growsample = { id: "g1", runid: "plan", stepid: "s1", usedbytes: 1_000_000, limitbytes: 4_000_000, at: 3 };
    const trend: memorytrend = { runid: "plan", slope: 2000, samples: 2, flaggedsteps: ["s2"], at: 4 };
    const cpu: cpuprofile = { id: "c1", runid: "plan", stepid: "cpu", origin: "https://example.com", duration: 500, samplecount: 3, hotfunctions: ["render"], at: 4 };
    const shift: shiftentry = { id: "sh1", runid: "plan", stepid: "ws", score: 0.12, starttime: 40, selectors: ["img#hero"], at: 4 };
    const trace: tracerecord = { id: "t1", runid: "plan", stepid: "tl", origin: "https://example.com", categories: ["scripting"], bytesize: 400, events: 2, annotations: [{ stepid: "s1", label: "open", offset: 100 }], startedat: 1, endedat: 4 };
    const map: sourcemapref = { id: "sm1", runid: "plan", stepid: "sm", origin: "https://example.com", scripturl: "https://example.com/app.js", mapurl: "https://example.com/app.js.map", parsed: true, at: 4 };
    const consent: sourcemapconsent = { id: "c1", prompt: "Source map capture prompt", origin: "https://example.com", approved: true, consentedat: 1 };
    const report = profilereport({ flows: [flow], heaps: [heap], samples: [sample], trends: [trend], profiles: [cpu], shifts: [shift], traces: [trace], sourcemaps: [map], consents: [consent] });
    expect(report.version).toBe(protocolversion);
    expect(report.flows[0]).toMatchObject({ name: "navigation", duration: 800, steps: ["s1"] });
    expect(report.heaps[0]).toMatchObject({ bytesize: 12_000_000, nodecount: 1450 });
    expect(report.trends[0]?.flaggedsteps).toEqual(["s2"]);
    expect(report.profiles[0]?.hotfunctions).toEqual(["render"]);
    expect(report.shifts[0]?.selectors).toEqual(["img#hero"]);
    expect(report.traces[0]?.annotations).toHaveLength(1);
    expect(report.sourcemaps[0]).toMatchObject({ parsed: true });
    expect(report.consents[0]?.prompt).toBeUndefined();
    expect(report.consents[0]?.origin).toBe("https://example.com");
  });

  it("rejects profiling proposals outside the grants, the reviewed categories and the annotation contract", () => {
    const flow = { kind: "measureflow", options: JSON.stringify({ flow: { prefix: "flow", steps: ["s1"], metrics: ["navigation", "blocking"] }, watch: { window: 100 } }), summary: "Measure the flow." };
    expect(parseproposal({ version: protocolversion, plan: { objective: "Profile", steps: [flow] } }, "https://example.com").plan.steps[0]?.risk).toBe("read");
    expect(() => parseproposal({ version: protocolversion, plan: { objective: "Profile", steps: [flow] } }, "https://example.com", ["https://other.example"])).toThrow("outside the grants");
    expect(() => parseproposal({ version: protocolversion, plan: { objective: "Profile", steps: [{ kind: "traceload", options: JSON.stringify({ trace: { categories: ["secret"], window: 100 } }), summary: "Trace with an unreviewed category." }] } }, "https://example.com")).toThrow("reviewed list");
    expect(() => parseproposal({ version: protocolversion, plan: { objective: "Profile", steps: [{ kind: "heapshot", options: JSON.stringify({ target: { kind: "iframe", url: "https://elsewhere.example/frame" } }), summary: "Snapshot an ungranted frame." }] } }, "https://example.com")).toThrow("outside the granted origins");
    const framed = { kind: "heapshot", options: JSON.stringify({ target: { kind: "worker", url: "https://cdn.example/worker.js" } }), summary: "Snapshot a granted worker." };
    expect(parseproposal({ version: protocolversion, plan: { objective: "Profile", steps: [framed] } }, "https://example.com", ["https://example.com", "https://cdn.example"]).plan.steps).toHaveLength(1);
    expect(() => parseproposal({ version: protocolversion, plan: { objective: "Profile", steps: [{ kind: "capturesourcemaps", options: JSON.stringify({ scripts: ["https://elsewhere.example/app.js"] }), summary: "Capture maps of an ungranted origin." }] } }, "https://example.com")).toThrow("outside the grants");
    expect(() => parseproposal({ version: protocolversion, plan: { objective: "Profile", steps: [{ kind: "annotatetrace", options: JSON.stringify({ trace: { traceid: "t1" } }), summary: "Annotate without annotations." }] } }, "https://example.com")).toThrow("step annotations");
    const annotated = { kind: "annotatetrace", options: JSON.stringify({ trace: { traceid: "t1" }, annotations: [{ stepid: "s1", label: "open" }] }), summary: "Annotate the trace." };
    expect(parseproposal({ version: protocolversion, plan: { objective: "Profile", steps: [annotated] } }, "https://example.com").plan.steps).toHaveLength(1);
  });
});

describe("emulation protocol", () => {
  const outcome: stepoutcome = { stepid: "e1", ok: true, summary: "Applied the device layer phone.", at: 1 };
  const plan: agentplan = { id: "plan", objective: "Emulate", origin: "https://example.com", steps: [], createdat: 1, expiresat: 2, state: "approved" };
  const device = { name: "phone", width: 390, height: 844, pixelratio: 3, mobile: true };
  const network = { name: "slow3g", latency: 400, download: 400, upload: 400, offline: true };
  const location = { name: "lisbon", latitude: 38.7223, longitude: -9.1393, accuracy: 100 };
  const agent = { name: "desktopmask", useragent: "Mozilla/5.0 (X11; Linux x86_64) Chrome/120.0.0.0 Safari/537.36", platform: "Linux x86_64", brands: ["Chromium"] };
  const revertplan = ["restore the prior page state"];

  it("carries the applied and reverted layer names in the emulation block of the response envelope", () => {
    const envelope = JSON.parse(outcomeresponse({ outcome, plan, emulation: { applied: ["phone"], reverted: ["slow3g"] } })) as { emulation?: { applied: string[]; reverted: string[] } };
    expect(envelope.emulation).toEqual({ applied: ["phone"], reverted: ["slow3g"] });
    const bare = JSON.parse(outcomeresponse({ outcome, plan })) as { emulation?: unknown };
    expect(bare.emulation).toBeUndefined();
  });

  it("builds the emulation report envelope with the layer history, preset libraries, blackbox rules and permission overrides while the consent prompt text stays out", () => {
    const report = emulationreport({ state: { runid: "run", tabid: 4, origin: "https://example.com", layers: [{ id: "l1", runid: "run", stepid: "e1", family: "device", name: "phone", originscope: "https://example.com", appliedat: 1, revertplan }], updatedat: 2 }, devices: [device], networks: [network], locations: [location], agents: [agent], blackbox: [{ origin: "https://example.com", rules: [{ urlpatterns: ["https://cdn.example/**"], tracescope: "both" }] }], permissions: [{ id: "p1", runid: "run", stepid: "e1", origin: "https://example.com", name: "geolocation", state: "granted", priorstate: "prompt", appliedat: 1 }], consents: [{ id: "c1", prompt: "Where?", origin: "https://example.com", latitude: 38.7223, longitude: -9.1393, approved: true, consentedat: 1 }] });
    expect(report.layers[0]?.name).toBe("phone");
    expect(report.layers[0]?.revertplan).toEqual(revertplan);
    expect(report.devices[0]?.name).toBe("phone");
    expect(report.networks[0]?.offline).toBe(true);
    expect(report.blackbox[0]?.rules[0]?.tracescope).toBe("both");
    expect(report.permissions[0]?.priorstate).toBe("prompt");
    expect(report.consents[0]?.latitude).toBe(38.7223);
    expect(report.consents[0]).not.toHaveProperty("prompt");
    const empty = emulationreport({ devices: [], networks: [], locations: [], agents: [], blackbox: [], permissions: [], consents: [] });
    expect(empty.layers).toEqual([]);
    expect(empty).not.toHaveProperty("state");
  });

  it("rejects emulation steps without a revert plan, location values out of range and unknown permission names", () => {
    expect(() => parseproposal({ version: protocolversion, plan: { objective: "Emulate", steps: [{ kind: "emulatedevice", options: JSON.stringify({ reviewed: true, device }), summary: "Mask without a revert plan." }] } }, "https://example.com")).toThrow("revert plan");
    expect(() => parseproposal({ version: protocolversion, plan: { objective: "Emulate", steps: [{ kind: "emulatelocate", options: JSON.stringify({ reviewed: true, location: { ...location, latitude: 91 }, revertplan }), summary: "Mask a coordinate out of range." }] } }, "https://example.com")).toThrow("latitude and longitude ranges");
    expect(() => parseproposal({ version: protocolversion, plan: { objective: "Emulate", steps: [{ kind: "overridepermission", options: JSON.stringify({ reviewed: true, permission: { name: "screen-capture", state: "granted" }, revertplan }), summary: "Override an unknown permission." }] } }, "https://example.com")).toThrow("unknown permission names");
    expect(() => parseproposal({ version: protocolversion, plan: { objective: "Emulate", steps: [{ kind: "setuseragent", options: JSON.stringify({ reviewed: true, agent, revertplan }), summary: "Mask the agent." }] } }, "https://example.com", ["https://other.example"])).toThrow("outside the grants");
  });

  it("accepts reviewed emulation steps with their revert plans into a pending plan", () => {
    const proposal = parseproposal({ version: protocolversion, plan: { objective: "Emulate", steps: [
      { kind: "emulatedevice", options: JSON.stringify({ reviewed: true, device, revertplan, reload: true }), summary: "Wear the reviewed phone mask." },
      { kind: "blackboxscripts", options: JSON.stringify({ reviewed: true, rules: [{ urlpatterns: ["https://cdn.example/**"], tracescope: "both" }], revertplan }), summary: "Blackbox the vendor scripts." },
    ] } }, "https://example.com");
    expect(proposal.plan.steps[0]?.risk).toBe("sensitive");
    expect(proposal.plan.steps[1]?.risk).toBe("read");
  });
});

describe("workflow editor protocol", () => {
  it("builds the editor state envelope for panel synchronization", () => {
    const envelope = editorstate({
      versions: [{ workflowid: "wf1", version: 2, createdat: 5, note: "tuned the delay", steps: 3, risk: "read" }],
      diffs: [{ workflowid: "wf1", from: 1, to: 2, added: [], removed: [], changed: [], at: 6 }],
      history: [{ runid: "r1", workflowid: "wf1", outcome: "done", steps: 3, total: 3, duration: 42, cause: "manual", startedat: 7, endedat: 49 }],
      breakpoints: ["s2"],
      overrides: [{ id: "o1", workflowid: "wf1", pattern: "https://example.com", deltas: { waitms: 500 }, createdat: 8 }],
      imports: [{ id: "imp1", workflowid: "wf1", name: "imported", version: 1, steps: 2, risk: "sensitive", importedat: 9 }],
      backgroundruns: { wf1: true },
      watchdog: { config: { enabled: true, stallthreshold: 30_000, action: "pause" }, events: [{ id: "w1", runid: "r1", verdict: "stalled", action: "pause", outcome: "Paused at the checkpoint.", at: 10 }] },
    });
    expect(envelope.version).toBe(protocolversion);
    expect(envelope.editor.versions[0]?.note).toBe("tuned the delay");
    expect(envelope.editor.history[0]?.cause).toBe("manual");
    expect(envelope.editor.breakpoints).toEqual(["s2"]);
    expect(envelope.editor.imports[0]?.workflowid).toBe("wf1");
    expect(envelope.editor.backgroundruns).toEqual({ wf1: true });
    expect(envelope.editor.watchdog.config?.action).toBe("pause");
    expect(envelope.editor.watchdog.events[0]?.verdict).toBe("stalled");
    expect("model" in envelope).toBe(false);
    const withmodel = editorstate({ versions: [], history: [], overrides: [], imports: [], backgroundruns: {}, watchdog: { events: [] }, model: { workflowid: "wf1", name: "canvas", version: 1, origins: ["https://example.com"], nodes: [], edges: [], blocks: [], layout: { width: 640, height: 480, viewportx: 0, viewporty: 0, zoom: 1 }, minimap: { width: 160, height: 100, scale: 1, zoom: 1, viewport: { x: 0, y: 0, width: 160, height: 100 } }, dirty: false } });
    expect(withmodel.model?.name).toBe("canvas");
    expect(withmodel.editor.backgroundruns).toEqual({});
    expect(workflowfileversion).toBe(1);
  });

  it("parses run history queries with filters and echoes them in the report", () => {
    expect(runhistoryquery(undefined)).toEqual({});
    expect(runhistoryquery({ workflowid: "wf1", outcome: "done", since: 100, limit: 25 })).toEqual({ workflowid: "wf1", outcome: "done", since: 100, limit: 25 });
    expect(() => runhistoryquery({ workflowid: " " })).toThrow("non-empty string");
    expect(() => runhistoryquery({ outcome: "" })).toThrow("non-empty string");
    expect(() => runhistoryquery({ since: Number.NaN })).toThrow("finite");
    expect(() => runhistoryquery({ limit: 0 })).toThrow("positive integer");
    expect(() => runhistoryquery({ limit: 1.5 })).toThrow("positive integer");
    const report = runhistoryreport({ entries: [{ runid: "r1", workflowid: "wf1", outcome: "failed", steps: 1, total: 3, duration: 5, cause: "cron", startedat: 1, endedat: 6 }], query: { outcome: "failed" } });
    expect(report.version).toBe(protocolversion);
    expect(report.entries[0]?.cause).toBe("cron");
    expect(report.query).toEqual({ outcome: "failed" });
    expect(runhistoryreport({ entries: [] }).query).toEqual({});
  });
});

describe("agent protocol protocol", () => {
  it("builds toolcall and toolresult frames with the json rpc grammar", () => {
    const call = toolcallframe({ id: 7, name: "browser.click", params: { stepid: "s1" } });
    expect(call).toMatchObject({ jsonrpc: "2.0", id: 7, method: "tools/call" });
    expect(call.params).toEqual({ stepid: "s1", name: "browser.click" });
    expect(toolcallframe({ id: "alpha", name: "browser.snapshot" }).params).toEqual({ name: "browser.snapshot" });
    const result = toolresultframe({ id: 7, result: { content: "ran click", iserror: false } });
    expect(result.result).toEqual({ content: "ran click", iserror: false });
    expect(result.error).toBeUndefined();
    const refusal = toolresultframe({ id: null, error: { code: "consentrefused", message: "The consent gates refused the tool call." } });
    expect(refusal.id).toBeNull();
    expect(refusal.error?.code).toBe("consentrefused");
    expect(refusal.result).toBeUndefined();
  });

  it("carries tool errors with the json rpc error codes in the response envelope", () => {
    const plan: agentplan = { id: "plan", objective: "Run the tool calls", origin: "https://example.com", steps: [], createdat: 1, expiresat: 2, state: "approved" };
    const outcome: stepoutcome = { stepid: "s1", ok: false, summary: "The tool call was refused.", at: 5 };
    const refused = JSON.parse(outcomeresponse({ outcome, plan, tool: { clientid: "client1", tool: "browser.click", origin: "https://example.com", ok: false, code: "consentrefused" } })) as { tool?: { clientid: string; tool: string; ok: boolean; code?: string } };
    expect(refused.tool).toEqual({ clientid: "client1", tool: "browser.click", origin: "https://example.com", ok: false, code: "consentrefused" });
    const ran = JSON.parse(outcomeresponse({ outcome: { ...outcome, ok: true }, plan, tool: { clientid: "client1", tool: "browser.readtext", origin: "https://example.com", ok: true } })) as { tool?: { ok: boolean; code?: string } };
    expect(ran.tool?.ok).toBe(true);
    expect(ran.tool?.code).toBeUndefined();
    const without = JSON.parse(outcomeresponse({ outcome, plan })) as { tool?: unknown };
    expect(without.tool).toBeUndefined();
  });
});

describe("agent protocol part two envelopes", () => {
  const now = 1_800_000_000_000;

  it("builds the http stream transport report with its event channels", () => {
    const stream = { endpoint: "/mcp", streampath: "/mcp/stream", tls: { mode: "on" as const }, heartbeatms: 15_000, idlewindowms: 45_000 };
    const report = httpstreamreport({ stream, channels: [{ id: "c1", clientid: "client1", openedat: now - 2000, lastbeatat: now - 1000 }, { id: "c2", clientid: "client2", openedat: now - 2000, lastbeatat: now - 50_000 }], now });
    expect(report.endpoint).toBe("/mcp");
    expect(report.streampath).toBe("/mcp/stream");
    expect(report.heartbeatms).toBe(15_000);
    expect(report.idlewindowms).toBe(45_000);
    expect(report.channelsopen).toBe(1);
    expect(report.channelsdead).toBe(1);
    expect(httpstreamreport({ stream: { endpoint: "/mcp", streampath: "/mcp/stream", tls: { mode: "off" } }, channels: [], now }).heartbeatms).toBe(30_000);
  });

  it("builds the pairing and auth handshake frames for issued, verified and refused outcomes", () => {
    const challenge = { nonce: "nonce-1", method: "pairingcode" as const, issuedat: now, expiresat: now + 120_000 };
    const issued = pairingframes({ id: 1, challenge, outcome: "issued" });
    expect(issued.request.method).toBe("pairing");
    expect(issued.request.params?.nonce).toBe("nonce-1");
    expect((issued.response.result as { challenge?: string }).challenge).toBe("nonce-1");
    const verified = pairingframes({ id: 2, challenge, answer: "DT-CODE", outcome: "verified" });
    expect(verified.request.params?.answer).toBe("DT-CODE");
    expect((verified.response.result as { paired?: boolean }).paired).toBe(true);
    const refused = pairingframes({ id: 3, challenge, outcome: "refused" });
    expect(refused.response.error?.code).toBe("consentrefused");
    expect(refused.response.error?.message).toBe("The remote frame failed its authentication handshake.");
  });

  it("builds the token report without raw tokens or digests", () => {
    const tokens = [
      { id: "t1", clientid: "client1", hash: "sha256:abc", scopes: ["browser" as const], issuedat: now - 1000, expiresat: now + 500_000 },
      { id: "t2", clientid: "client2", hash: "sha256:def", scopes: ["memory" as const], issuedat: now - 1000, expiresat: now + 500_000, revokedat: now - 500 }
    ];
    const report = tokenreport(tokens, now);
    expect(report.tokens).toHaveLength(2);
    expect(report.tokens[0]?.msremaining).toBe(500_000);
    expect(report.tokens[1]?.revokedat).toBe(now - 500);
    expect(JSON.stringify(report)).not.toContain("sha256:abc");
    expect(JSON.stringify(report)).not.toContain("raw");
  });

  it("builds the approval gate request and response frames with redacted arguments", () => {
    const gate = { id: "gate-1", clientid: "client1", tool: "browser.type", reason: "Typing.", params: { stepid: "s1", value: "hunter2" }, secretfields: ["value"], state: "pending" as const, raisedat: now, timeoutat: now + 120_000 };
    const pending = approvalframes({ id: 9, request: gate });
    expect(pending.raise.method).toBe("approval");
    expect(pending.raise.params?.approvalid).toBe("gate-1");
    expect(pending.raise.params?.arguments).toContain("[redacted]");
    expect(pending.raise.params?.arguments).not.toContain("hunter2");
    expect((pending.decision.result as { state?: string }).state).toBe("pending");
    const approved = approvalframes({ id: 9, request: { ...gate, state: "approved" }, identity: { fingerprint: "fp-1", displayname: "Laptop agent" } });
    expect((approved.decision.result as { client?: string }).client).toBe("Laptop agent");
    const refused = approvalframes({ id: 9, request: { ...gate, state: "refused" } });
    expect(refused.decision.error?.code).toBe("consentrefused");
    expect(refused.decision.error?.message).toMatch(/was refused/i);
    const expired = approvalframes({ id: 9, request: { ...gate, state: "expired" } });
    expect(expired.decision.error?.message).toMatch(/expired/i);
  });

  it("builds the tls, allowlist and heartbeat reports", () => {
    expect(tlsreport({ mode: "required", certificatefingerprint: "sha256:aa", verifiedat: now })).toEqual({ version: protocolversion, mode: "required", certificaterequired: true, verified: true });
    expect(tlsreport({ mode: "off" })).toEqual({ version: protocolversion, mode: "off", certificaterequired: false, verified: false });
    const entries = [{ fingerprint: "aa11", displayname: "Laptop agent", namespaces: ["browser" as const, "memory" as const], grantedat: now, history: [{ at: now, actor: "user", change: "Granted." }, { at: now + 1, actor: "user", change: "Rescoped." }] }];
    const allow = allowlistreport(entries);
    expect(allow.entries[0]?.namespaces).toEqual(["browser", "memory"]);
    expect(allow.entries[0]?.grants).toBe(2);
    const beats = heartbeatreport({ channels: [{ id: "c1", clientid: "client1", openedat: now, lastbeatat: now }, { id: "c2", clientid: "client2", openedat: now - 1000, lastbeatat: now - 500 }], now, idlewindow: 1000 });
    expect(beats.beats).toBe(1);
    expect(beats.open).toBe(2);
    expect(beats.dead).toBe(0);
    expect(heartbeatreport({ channels: [], now }).open).toBe(0);
  });
});

describe("agent protocol part three envelopes", () => {
  const now = 1_800_000_000_000;

  it("builds the event subscription frames and the event notification frames", () => {
    const subscription = { id: "sub1", clientid: "client1", kinds: ["callresult" as const, "progress" as const], origin: "https://example.com", createdat: now };
    const frames = subscriptionframes({ id: 9, subscription });
    expect(frames.subscribe.method).toBe("events/subscribe");
    expect(frames.subscribe.params?.kinds).toEqual(["callresult", "progress"]);
    expect(frames.subscribe.params?.origin).toBe("https://example.com");
    expect(frames.unsubscribe.method).toBe("events/unsubscribe");
    expect(frames.unsubscribe.params?.subscriptionid).toBe("sub1");
    const notification = eventnotification({ subscriptionid: "sub1", kind: "callresult", origin: "https://example.com", tool: "browser.readtext", payload: { ok: true }, now });
    expect(notification.method).toBe("events/notify");
    expect(notification.params?.payload).toEqual({ ok: true });
    expect(notification.id).toBeUndefined();
  });

  it("builds the page state delta reports of the resource watchers", () => {
    const report = resourcedeltareport({ watchid: "watch1", clientid: "client1", resource: "page", delta: { url: "https://example.com/next" }, now });
    expect(report).toMatchObject({ watchid: "watch1", clientid: "client1", resource: "page", delta: { url: "https://example.com/next" } });
    expect(report.version).toBe(protocolversion);
  });

  it("builds the sampling callback frames with the exact prompt payload", () => {
    const pending = { id: "sample1", clientid: "client1", prompt: "Summarize the run.", pagecontent: "the page text", state: "pending" as const, requestedat: now };
    const pendingframes = samplingframes({ id: 4, request: pending });
    expect(pendingframes.request.method).toBe("sampling/request");
    expect(pendingframes.request.params?.prompt).toBe("Summarize the run.");
    expect(pendingframes.request.params?.pagecontent).toBe("the page text");
    expect(pendingframes.answer.params?.state).toBe("pending");
    const answered = samplingframes({ id: 5, request: { ...pending, state: "answered", answeredat: now + 1, answer: "the model answer" } });
    expect(answered.answer.params?.answer).toBe("the model answer");
    const refused = samplingframes({ id: 6, request: { ...pending, state: "refused", answeredat: now + 1 } });
    expect(refused.answer.params?.refused).toBe(true);
  });

  it("builds the prompt tool reports and the prompt call frames", () => {
    const report = promptreport({ prompts: [{ name: "runreview", description: "Review the run.", arguments: [{ name: "objective", description: "The plan objective.", required: true }], template: "Review {{objective}}." }] });
    expect(report.prompts[0]?.name).toBe("runreview");
    expect(report.prompts[0]?.template).toBe("Review {{objective}}.");
    const call = promptcallframe({ id: 7, name: "runreview", args: { objective: "fill the form" } });
    expect(call.method).toBe("prompts/call");
    expect(call.params?.arguments).toEqual({ objective: "fill the form" });
  });

  it("builds the stream chunk and progress notice frames", () => {
    const chunk = streamchunkframe({ callid: "call1", seq: 2, content: "more text", done: false, at: now });
    expect(chunk.method).toBe("calls/stream");
    expect(chunk.params).toMatchObject({ callid: "call1", seq: 2, content: "more text", done: false });
    const notice = progressnoticeframe({ callid: "call1", percent: 60, message: "Typing the reviewed field.", cancellable: true, at: now });
    expect(notice.method).toBe("calls/progress");
    expect(notice.params).toMatchObject({ percent: 60, cancellable: true });
  });

  it("builds the cancellation frames with the preserved partial result", () => {
    const frames = cancelframes({ id: 8, frame: { callid: "call1", reason: "the user asked", at: now }, partial: { content: "the first chunks", iserror: false } });
    expect(frames.cancel.method).toBe("calls/cancel");
    expect(frames.cancel.params?.reason).toBe("the user asked");
    expect(frames.cancelled.result).toMatchObject({ cancelled: true, callid: "call1", partial: { content: "the first chunks" } });
  });

  it("builds the structured error, rate limit, idempotency, batch, call log, in flight, dry run and mock reports", () => {
    const error = structurederrorreport({ error: { code: "ratelimited", message: "The budget is spent.", retryhint: "wait", retryafter: 4000 }, usage: { clientid: "client1", used: 5, budget: 5 } });
    expect(error).toMatchObject({ code: "ratelimited", retryhint: "wait", retryafter: 4000 });
    expect(error.usage).toEqual({ clientid: "client1", used: 5, budget: 5 });
    const limits = ratelimitreport({ limits: [{ clientid: "client1", windowms: 60_000, budget: 5, windowstartedat: now, used: 3 }, { clientid: "client2", windowms: 30_000, windowstartedat: now, used: 0 }], now });
    expect(limits.limits[0]).toMatchObject({ used: 3, unbounded: false });
    expect(limits.limits[1]?.unbounded).toBe(true);
    const replay = idempotencyreplayframe({ id: 11, key: "key-1", result: { content: "stored", iserror: false }, originalat: now });
    expect(replay.result).toMatchObject({ replayed: true, idempotencykey: "key-1" });
    const idempotency = idempotencyreport([{ key: "key-1", clientid: "client1", tool: "browser.readtext", result: { content: "stored", iserror: false }, createdat: now, expiresat: now + 5000 }], now + 6000);
    expect(idempotency.records[0]?.live).toBe(false);
    const batch = batchreport({ batch: { id: "batch1", clientid: "client1", calls: [{ id: "m1", name: "browser.readtext", params: {} }, { id: "m2", name: "memory.list", params: {} }], stoponerror: true, state: "stopped", createdat: now, finishedat: now + 100, outcomes: [{ callid: "m1", tool: "browser.readtext", ok: true, at: now + 1 }, { callid: "m2", tool: "memory.list", ok: false, at: now + 2 }] } });
    expect(batch).toMatchObject({ batchid: "batch1", state: "stopped", done: 2, total: 2 });
    const log = calllogreport({ calls: [{ id: "call1", clientid: "client1", tool: "browser.readtext", origin: "https://example.com", ok: true, at: now, idempotencykey: "key-1", replayed: true }], filters: { clientid: "client1" } });
    expect(log.calls[0]?.replayed).toBe(true);
    expect(log.filters.clientid).toBe("client1");
    const inflight = inflightreport({ contexts: [{ callid: "call1", clientid: "client1", tool: "browser.readtext", state: "inflight", startedat: now, chunks: 3, dryrun: true }], now: now + 5000 });
    expect(inflight.inflight[0]).toMatchObject({ chunks: 3, msopen: 5000, dryrun: true });
    const dry = dryrunreport({ callid: "call1", tool: "browser.click", argsvalid: false, consentok: true, findings: ["The required argument stepid stays empty."], executed: false, mutations: [], at: now });
    expect(dry.findings[0]).toMatch(/stepid stays empty/);
    const mocks = mockreport([{ tool: "browser.readtext", result: { content: "canned", iserror: false }, testcontext: true, createdat: now }]);
    expect(mocks.mocks[0]).toMatchObject({ tool: "browser.readtext", testcontext: true });
  });
});

describe("protocol llm envelopes", () => {
  const now = 1_800_000_000_000;

  it("carries a model drafted plan in the model proposal envelope for review", () => {
    const draft: plandraft = { id: "draft1", goal: "Read the docs page", steps: [{ id: "s1", kind: "navigate", value: "https://docs.example", summary: "Open the docs page." }, { id: "t1", kind: "reload", summary: "Reload.", freshreview: true }], openquestions: ["which section?"], providerid: "prov1", model: "model-a", state: "draft", lintfindings: ["The drafted step s9 violates the action grammar."], createdat: now };
    const envelope = modelproposal({ draft });
    expect(envelope.version).toBe(protocolversion);
    expect(envelope.modelproposal.draftid).toBe("draft1");
    expect(envelope.modelproposal.steps[1]?.freshreview).toBe(true);
    expect(envelope.modelproposal.openquestions).toEqual(["which section?"]);
    expect(envelope.modelproposal.lintfindings).toHaveLength(1);
    expect(envelope.modelproposal.state).toBe("draft");
  });

  it("reports the usage totals and guard verdicts in the model outcome envelope", () => {
    const outputs: modeloutput[] = [
      { raw: "{}", parsed: { intent: "navigate" }, verdict: "valid", attempts: 1 },
      { raw: "nope", verdict: "invalid", reason: "The model answer is not json.", attempts: 3 }
    ];
    const envelope = modeloutcome({ runid: "run1", outputs, totals: { prompttokens: 10, completiontokens: 5, totaltokens: 15, cost: 0.02, calls: 2 } });
    expect(envelope.version).toBe(protocolversion);
    expect(envelope.modeloutcome.runid).toBe("run1");
    expect(envelope.modeloutcome.usage.totaltokens).toBe(15);
    expect(envelope.modeloutcome.guards[1]).toMatchObject({ verdict: "invalid", attempts: 3 });
  });
});

describe("protocol swarm envelopes", () => {
  const now = 1_800_000_000_000;

  it("carries the agents, the task queue and the mailboxes in the swarm state report", () => {
    const state: swarmstate = {
      agents: [
        { id: "a1", name: "Scout", role: "worker", depth: 0, state: "active", tabid: 7, registeredat: now, heartbeatat: now },
        { id: "a2", name: "Scout sub 1", role: "planner", depth: 1, state: "paused", parentid: "a1", registeredat: now }
      ],
      queue: { lanes: ["extraction"], priorities: [1, 2], completionpolicy: "all", items: [{ id: "t1", lane: "extraction", priority: 2, payload: "Read the pricing table", state: "claimed", enqueuedat: now }], claims: [{ agentid: "a1", taskid: "t1", claimedat: now, heartbeatat: now }] },
      mailboxes: [{ agentid: "a1", inbox: [{ id: "m1", senderid: "a2", recipient: "a1", routing: "direct", payload: "Ready.", sentat: now }], outbox: [], unread: 1 }],
      killswitch: { engaged: true, engagedat: now, reason: "The user halted the swarm." }
    };
    const report = swarmstatereport(state);
    expect(report.version).toBe(protocolversion);
    expect(report.swarm.agents[0]).toMatchObject({ id: "a1", name: "Scout", role: "worker", tabid: 7 });
    expect(report.swarm.agents[1]?.parentid).toBe("a1");
    expect(report.swarm.queue.lanes).toEqual(["extraction"]);
    expect(report.swarm.queue.items[0]).toMatchObject({ payload: "Read the pricing table", state: "claimed" });
    expect(report.swarm.queue.claims[0]).toMatchObject({ agentid: "a1", taskid: "t1" });
    expect(report.swarm.mailboxes[0]).toMatchObject({ agentid: "a1", unread: 1, inbox: 1, outbox: 0 });
    expect(report.swarm.killswitch).toMatchObject({ engaged: true, reason: "The user halted the swarm." });
  });

  it("builds the agent event notification frame of one lifecycle change", () => {
    const frame = agenteventframe({ id: "e1", kind: "claimed", agentid: "a1", taskid: "t1", summary: "The agent claimed the task.", at: now });
    expect(frame.method).toBe("agents/notify");
    expect(frame.params).toMatchObject({ eventid: "e1", kind: "claimed", agentid: "a1", taskid: "t1", summary: "The agent claimed the task.", at: now });
    const bare = agenteventframe({ id: "e2", kind: "killall", summary: "The user halted the swarm.", at: now });
    expect(bare.params).not.toHaveProperty("agentid");
    expect(bare.params).not.toHaveProperty("taskid");
  });
});

describe("protocol multi agent part two envelopes", () => {
  const now = 1_800_000_000_000;

  it("builds the boardstate snapshot for dashboards with every lane and milestone", () => {
    const snapshot = boardstatesnapshot({ id: "board1", builtat: now, lanes: [
      { agentid: "a1", name: "Scout", role: "worker", state: "active", lane: "extraction", currenttask: "Read the table", milestones: [{ label: "Rows read", done: true, at: now }] },
      { agentid: "a2", name: "Scribe", role: "critic", state: "active", lane: "critic", milestones: [] }
    ] });
    expect(snapshot.version).toBe(protocolversion);
    expect(snapshot.board.lanes).toHaveLength(2);
    expect(snapshot.board.lanes[0]).toMatchObject({ agentid: "a1", lane: "extraction", currenttask: "Read the table" });
    expect(snapshot.board.lanes[0]?.milestones[0]).toMatchObject({ label: "Rows read", done: true, at: now });
    expect(snapshot.board.lanes[1]?.currenttask).toBeUndefined();
  });

  it("builds the handoff frame that pushes one tab handoff state", () => {
    const frame = handoffframe({ id: "h1", fromagentid: "a1", toagentid: "a2", tabid: 7, taskstate: "Halfway through the footer.", state: "transferred", createdat: now, transferredat: now + 1 });
    expect(frame.method).toBe("agents/handoff");
    expect(frame.params).toMatchObject({ id: "h1", from: "a1", to: "a2", tabid: 7, taskstate: "Halfway through the footer.", state: "transferred", transferredat: now + 1 });
    const resumed = handoffframe({ id: "h1", fromagentid: "a1", toagentid: "a2", taskstate: "Halfway.", state: "resumed", createdat: now, transferredat: now + 1, resumedat: now + 2 });
    expect(resumed.params).toMatchObject({ state: "resumed", resumedat: now + 2 });
    const bare = handoffframe({ id: "h2", fromagentid: "a1", toagentid: "a2", taskstate: "State.", state: "prepared", createdat: now });
    expect(bare.params).not.toHaveProperty("transferredat");
    expect(bare.params).not.toHaveProperty("resumedat");
  });

  it("builds the review frame with the routed request and its optional critic verdict", () => {
    const frame = reviewframe({ request: { id: "r1", fromagentid: "a1", toagentid: "a2", subject: "The extraction output", payload: "The rows", state: "answered", requestedat: now, ackedat: now + 1, answeredat: now + 2 }, review: { id: "r1", reviewerid: "a2", subjectagentid: "a1", verdict: "changes", issues: ["One stale row."], requiredchanges: ["Re-read the footer."], reviewedat: now + 2 } });
    expect(frame.method).toBe("agents/review");
    expect(frame.params).toMatchObject({ id: "r1", from: "a1", to: "a2", subject: "The extraction output", state: "answered", verdict: "changes" });
    expect(frame.params).toMatchObject({ issues: ["One stale row."], requiredchanges: ["Re-read the footer."] });
    const bare = reviewframe({ request: { id: "r2", fromagentid: "a1", toagentid: "a2", subject: "s", payload: "p", state: "open", requestedat: now } });
    expect(bare.params).not.toHaveProperty("verdict");
    expect(bare.params).not.toHaveProperty("ackedat");
  });
});

describe("execution environment envelopes", () => {
  it("documents the environment grammar of every reviewed action kind", () => {
    const grammar = environmentgrammar();
    expect(grammar.version).toBe(protocolversion);
    expect(grammar.kinds.length).toBeGreaterThan(330);
    expect(grammar.kinds.find(entry => entry.kind === "evaluate")?.environments).toEqual(["isolatedworld"]);
    expect(grammar.kinds.find(entry => entry.kind === "readhtml")?.environments).toEqual(["pagecontext", "offscreenworker"]);
    expect(grammar.notes.join(" ")).toMatch(/isolated world/);
    expect(grammar.notes.join(" ")).toMatch(/sandboxframe/);
    expect(grammar.notes.join(" ")).toMatch(/bypasses the human review/);
  });

  it("wraps the environment view with the step environments, turnarounds, offscreen registry, workers and keepalive", () => {
    const report = environmentreport({
      environments: { s1: "pagecontext", s2: "offscreenworker" },
      turnarounds: { s2: 42 },
      offscreen: [{ document: "offscreen.html", runid: "run1", reasons: ["DOM_PARSER", "WORKERS"], justification: "Heavy parsing of reviewed snapshots.", createdat: 1 }],
      workers: 3,
      keepalive: { runid: "run1", state: "active", beats: 5, lastbeatat: 99, portopen: true },
    });
    expect(report.version).toBe(protocolversion);
    expect(report.environments).toEqual([{ stepid: "s1", environment: "pagecontext" }, { stepid: "s2", environment: "offscreenworker" }]);
    expect(report.turnarounds).toEqual([{ stepid: "s2", milliseconds: 42 }]);
    expect(report.offscreen[0]?.reasons).toEqual(["DOM_PARSER", "WORKERS"]);
    expect(report.workers).toBe(3);
    expect(report.keepalive).toMatchObject({ runid: "run1", beats: 5, portopen: true });
    const empty = environmentreport({ environments: {} });
    expect(empty.environments).toEqual([]);
    expect(empty.turnarounds).toEqual([]);
    expect(empty.offscreen).toEqual([]);
    expect(empty.workers).toBe(0);
    expect(empty.keepalive).toBeUndefined();
  });

  it("returns the execution environment beside the step outcome in the response envelope", () => {
    const plan = { id: "p1", objective: "o", origin: "https://example.com", steps: [], createdat: 1, expiresat: 2, state: "approved" as const };
    const envelope = JSON.parse(outcomeresponse({ outcome: { stepid: "s1", ok: true, summary: "Done.", environment: "offscreenworker", at: 1 }, plan })) as { outcome: { environment?: string } };
    expect(envelope.outcome.environment).toBe("offscreenworker");
  });
});

describe("security envelopes", () => {
  it("documents the consent model grammar with the denydefault posture and the four sensitive classes", () => {
    const model = consentmodel();
    expect(model.version).toBe(protocolversion);
    expect(model.posture).toBe("denydefault");
    expect(model.sensitiveclasses).toEqual(["payment", "credential", "delete", "publish"]);
    expect(model.maskshapes).toEqual(["password", "token", "card", "secret"]);
    expect(model.notes.join(" ")).toMatch(/no wildcard expansion/i);
    expect(model.notes.join(" ")).toMatch(/defaults to unlimited/i);
    expect(model.notes.join(" ")).toMatch(/revokerun is a terminal session event/i);
    expect(model.notes.join(" ")).toMatch(/loghash/i);
  });

  it("wraps the security view in the versioned response envelope", () => {
    const envelope = securityreport({
      allowlist: [{ origin: "https://example.com", profileid: "default", grantedat: 1 }],
      profiles: [],
      windows: [{ id: "w1", sessionid: "s1", origin: "https://example.com", startedat: 1, duration: 60_000, expiresat: 61_000, boundary: "60000 milliseconds the user chose", kinds: [], state: "active" }],
      consents: [{ id: "c1", origin: "https://example.com", sensitiveclass: "payment", grantedat: 1 }],
      revocations: [],
      maskrules: [],
      chain: [{ runid: "run1", valid: true, entries: 2, reason: "The hash chain verifies." }],
    });
    expect(envelope.version).toBe(protocolversion);
    expect(envelope.posture).toBe("denydefault");
    expect(envelope.allowlist).toHaveLength(1);
    expect(envelope.windows[0]?.state).toBe("active");
    expect(envelope.chain[0]?.valid).toBe(true);
  });

  it("wraps one run log chain verification with the seal hash when the log sealed", () => {
    const openchain = logchainreport({ runid: "run1", valid: true, entries: 3, reason: "The hash chain verifies." });
    expect(openchain.version).toBe(protocolversion);
    expect(openchain.sealhash).toBeUndefined();
    const sealed = logchainreport({ runid: "run2", valid: false, entries: 3, brokenat: 1, reason: "The chain reports tamper evidence." });
    expect(sealed.brokenat).toBe(1);
    expect(sealed.valid).toBe(false);
  });
});

import { transparencyreport } from "../protocol.js";

describe("protocol transparency", () => {
  it("serves the transparencypage data in one versioned envelope with the denydefault posture", () => {
    const report = transparencyreport({
      grants: [{ origin: "https://example.com", scope: "automation allowlist", boundary: "the user revokes the entry", grantedat: 1 }],
      windows: [{ id: "w", origin: "https://example.com", state: "closed", boundary: "1000 milliseconds the user chose", startedat: 1, expiresat: 2 }],
      connectallow: [{ senderid: "sender", displayname: "Bridge", addedat: 1 }],
      permdiffs: [{ fromversion: "1.1.61", toversion: "1.1.62", added: ["optional:downloads"], removed: [], computedat: 1 }],
      safedefaults: [{ origin: "https://first.example", firstseenat: 1 }],
      vault: [{ vaultid: "v", label: "Bank login", scope: "https://bank.example", provenance: "user", createdat: 1 }],
    });
    expect(report.version).toBe(consentmodel().version);
    expect(report.posture).toBe("denydefault");
    expect(report.grants[0]?.origin).toBe("https://example.com");
    expect(report.permdiffs[0]?.added).toEqual(["optional:downloads"]);
    expect(report.vault[0]?.label).toBe("Bank login");
  });

  it("wraps one interface surface snapshot in the versioned envelope", () => {
    const report = surfacesnapshot({
      surface: "sidepanel",
      palette: [{ entry: { id: "starttask", label: "Start task", keywords: ["task"], action: { command: "starttask", surface: "popup" } }, score: 100, reason: "The query matches the starttask command exactly." }],
      timeline: [{ stepid: "s1", kind: "readtable", status: "running", active: true, anchor: "#step-s1" }],
      logstream: { events: [{ id: "e1", level: "info", source: "background", origin: "https://example.com", summary: "The session started.", masked: false, maskverdict: "none", at: 1 }], chainvalid: true, reason: "The logstream chain of 1 event verifies link by link." },
      plancards: [{ risk: "sensitive", cards: [{ stepid: "s3", kind: "type", risk: "sensitive", environment: "pagecontext", options: "", summary: "Type the card.", corrections: [], editable: true }], expanded: true }],
      onboarding: { stepscompleted: ["origingrants"], done: false },
    });
    expect(report.version).toBe(consentmodel().version);
    expect(report.surface).toBe("sidepanel");
    expect(report.palette[0]?.entry.id).toBe("starttask");
    expect(report.timeline[0]?.status).toBe("running");
    expect(report.logstream.chainvalid).toBe(true);
    expect(report.plancards[0]?.risk).toBe("sensitive");
    expect(report.onboarding?.done).toBe(false);
  });

  it("wraps the finishing interface snapshot in the versioned envelope", () => {
    const report = interfaceviews({
      exportmenu: [{ format: "csv", scope: "run", destination: "download" }],
      badge: { state: "attention", waitingcount: 2, runid: "run-1" },
      recenttray: [{ runid: "run-1", origin: "https://example.com", outcome: "halted", title: "Pricing pass", at: 1, resumable: true, reopenable: false }],
      toasts: { live: [{ id: "t-1", stepid: "s-1", kind: "click", durationms: 40, at: 1 }], total: 3 },
      appearance: { mode: "dark", tokens: { surface: "#1f1f1f" }, source: "os" },
    });
    expect(report.version).toBe(protocolversion);
    expect(report.badge.state).toBe("attention");
    expect(report.recenttray[0]?.resumable).toBe(true);
    expect(report.toasts.total).toBe(3);
    expect(report.appearance.source).toBe("os");
    expect(report.datagrid).toBeUndefined();
  });

  it("wraps the ecosystem snapshot in the versioned envelope", () => {
    const report = ecosystemviews({
      library: [{ id: "invoice@1.0.0", title: "Invoice digest", publisher: "example publisher", version: "1.0.0", grants: ["https://example.com"], sensitive: false, state: "available", registry: "https://registry.example.test" }],
      installed: [{ id: "invoice@1.0.0", title: "Invoice digest", version: "1.0.0", forkable: true }],
      syncbridge: { hooks: [{ id: "sync:file:1", provider: "file", direction: "both", optin: false, endpoint: "manifests.json", state: "idle" }], conflicts: [{ id: "conflict-1", manifestid: "invoice", localversion: "1.0.0", remoteversion: "2.0.0" }] },
      attention: [{ id: "attention:gatewait:run1:g1", cause: "gatewait", severity: "critical", runid: "run1", summary: "A gate waits for one human action.", deeplink: "devthink://gate/g1?run=run1", at: 1 }],
      backgroundruns: [{ id: "background:wf:1", workflowid: "wf", state: "running", keepaliveheld: true, progress: "Running with the keepalive signal held" }],
      replay: { runid: "run1", cursor: 1, playing: false, steps: [{ stepid: "s1", index: 0, summary: "completed" }, { stepid: "s2", index: 1, summary: "waited at a gate" }], restored: { stepid: "s2", summary: "The gate resolved after a human action.", captureid: "c-99" } },
      compare: { runids: ["runa", "runb"], metrics: ["agreement", "divergence", "durationdelta"], firstdivergence: 1, steps: [{ stepid: "s2", agreement: "diverge", summarya: "clicked", summaryb: "clicked twice", durationdelta: -100, highlighted: true }] },
    });
    expect(report.version).toBe(protocolversion);
    expect(report.library[0]?.publisher).toBe("example publisher");
    expect(report.installed[0]?.forkable).toBe(true);
    expect(report.syncbridge.hooks[0]?.optin).toBe(false);
    expect(report.syncbridge.conflicts[0]?.remoteversion).toBe("2.0.0");
    expect(report.attention[0]?.deeplink).toBe("devthink://gate/g1?run=run1");
    expect(report.backgroundruns[0]?.keepaliveheld).toBe(true);
    expect(report.replay?.restored.captureid).toBe("c-99");
    expect(report.compare?.steps[0]?.highlighted).toBe(true);
  });
});

/* ── The protocolv2 api freeze of the 1.1.91 release. ── */
import { readFile, readdir } from "node:fs/promises";
import { errorcodetable, framingrules, frozenmessagecatalog, frozenmessagecarriers, memoryitemframe, responseenvelopeoutcomes, stabilityrules } from "../protocol.js";
import { initialize, negotiate, handleframe, servercapabilities } from "../mcp.js";
import { buildtoolcatalog } from "../tools.js";
import { defaultmcpconfig } from "../mcp.js";
import { deprecationwindow, protocolsupported } from "../apifreeze.js";
import type { agentsession, clientrecord, jsonrpcframe, toolcatalog } from "../types.js";

const freezenow = 1_800_000_000_000;
const freezeconfig = { ...defaultmcpconfig(), enabled: true };
const freezecatalog: toolcatalog = buildtoolcatalog();
const freezesession: agentsession = { id: "sess", tabid: 7, origin: "https://example.com", startedat: freezenow - 5000, expiresat: freezenow + 600_000, grants: ["https://example.com"] };
const freezeplan: agentplan = { id: "plan1", objective: "Validate the frozen contracts", origin: "https://example.com", steps: [{ id: "s1", kind: "observe", summary: "Snapshot the tab", risk: "read" }], createdat: freezenow - 4000, expiresat: freezenow + 600_000, state: "approved" };
const v2client: clientrecord = { id: "v2client", transport: "stdio", paired: true, connectedat: freezenow - 1000, pairedat: freezenow - 500, capabilities: { protocolversion: "2.0.0", name: "v2client", version: "2", toolversion: freezecatalog.version, tools: 0, namespaces: ["browser"], transports: ["stdio"] } };
const v1client: clientrecord = { ...v2client, id: "v1client", capabilities: { protocolversion: "1.1.54", name: "v1client", version: "1", toolversion: freezecatalog.version, tools: 0, namespaces: ["browser"], transports: ["stdio"] } };

/** Builds one json rpc request frame for the freeze tests. */
function freezeframe(id: number | string, method: string, params?: Record<string, unknown>): jsonrpcframe {
  return { jsonrpc: "2.0", id, method, ...(params !== undefined ? { params } : {}) };
}

describe("the protocolv2 frozen contract of 1.1.91", () => {
  it("validates every frozen message against its schema file", async () => {
    if (!existsSync("dist/schemas")) return; /* the schema artifacts ride the build: the pass runs after pnpm build in the validate chain and the ci lanes */
    const schemafiles = (await readdir("dist/schemas")).filter(file => file.endsWith(".json")).sort();
    expect(schemafiles).toHaveLength(10);
    const catalogschemas = new Set(frozenmessagecatalog.map(entry => entry.schema));
    for (const file of schemafiles) expect(catalogschemas.has(`schemas/${file}`)).toBe(true);
    for (const entry of frozenmessagecatalog) {
      const schema = JSON.parse(await readFile(`dist/${entry.schema}`, "utf8")) as { $id?: string; version?: string; title?: string; description?: string };
      expect(schema.$id).toContain("protocolv2");
      expect(schema.version).toMatch(/^\d+\.\d+\.\d+$/);
      expect(schema.description?.toLowerCase()).toContain(entry.family);
      expect(frozenmessagecarriers(entry).length).toBeGreaterThan(0);
      expect(frozenmessagecarriers(entry).join(",")).not.toContain("nowhere");
    }
  });

  it("wraps concrete messages in the versioned envelope their schema freezes", async () => {
    if (!existsSync("dist/schemas")) return; /* the schema artifacts ride the build: the pass runs after pnpm build in the validate chain and the ci lanes, and a lane that skipped the build asserts the frozen catalog above and leaves the envelope walk to the chain that builds first */
    const planschema = JSON.parse(await readFile("dist/schemas/plan.schema.json", "utf8")) as { plan?: { properties?: Record<string, { type?: string }> } };
    const proposal = parseproposal({ version: protocolversion, plan: { objective: "Read the page", steps: [{ kind: "observe", summary: "Capture an approved page snapshot" }] } }, "https://example.com");
    for (const field of ["id", "objective", "origin", "steps", "createdat", "expiresat", "state"]) expect(planschema.plan?.properties?.[field]).toBeDefined();
    expect(planschema.plan?.properties?.createdat?.type).toBe("number");
    expect(proposal.version).toBe(protocolversion);
    expect(proposal.plan.state).toBe("pending");
    const memoryschema = JSON.parse(await readFile("dist/schemas/memory.schema.json", "utf8")) as { provenancefields?: { fields?: string[] } };
    const provenance = { origin: "https://example.com", runid: "run1", stepid: "step1", capturedat: 1 };
    for (const field of memoryschema.provenancefields?.fields ?? []) expect(provenance).toHaveProperty(field);
    const item = memoryitemframe({ version: protocolversion, key: "k", value: 1, provenance });
    expect(item.provenance.runid).toBe("run1");
    const envelopeschema = JSON.parse(await readFile("dist/schemas/envelope.schema.json", "utf8")) as { outcomes?: { values?: string[] }; errorcodetable?: { items?: Array<{ code?: string; retry?: string }> } };
    expect(envelopeschema.outcomes?.values).toEqual(["success", "error", "cancel"]);
    expect(responseenvelopeoutcomes).toEqual(["success", "error", "cancel"]);
    const envelope = JSON.parse(outcomeresponse({ outcome: { stepid: "step", ok: true, summary: "Done.", at: 5 }, plan: freezeplan }));
    expect(envelope.version).toBe(protocolversion);
    for (const entry of errorcodetable) expect(envelopeschema.errorcodetable?.items?.some(item => item.code === entry.code && item.retry === entry.retry)).toBe(true);
    for (const entry of errorcodetable) expect(["never", "immediate", "afterbackoff"]).toContain(entry.retry);
    expect(framingrules.stdio).toContain("newline");
    expect(framingrules.http).toContain("http post");
    expect(stabilityrules.additive).toContain("additive");
    expect(stabilityrules.breaking).toContain("new major protocol version");
  });

  it("covers version negotiation for protocol one and two clients", () => {
    const server = servercapabilities({ config: freezeconfig, catalog: freezecatalog });
    const handshake = initialize({ config: freezeconfig, catalog: freezecatalog });
    expect(handshake.protocolmajor).toBe(2);
    expect(handshake.protocolversion).toBe(protocolversion);
    const undeclared = negotiate({ server });
    expect(undeclared.agreed).toBe(true);
    expect(undeclared.protocolmajor).toBe(2);
    expect(undeclared.deprecation).toBeUndefined();
    /* the 2.0.0 sunset closed the window: the deprecated full version string the version one clients exchanged parses nowhere, so a client that still sends it answers the frozen default of two without a deprecation notice */
    const stringform = negotiate({ client: { protocolversion: "1.1.54" }, server });
    expect(stringform.agreed).toBe(true);
    expect(stringform.protocolmajor).toBe(2);
    expect(stringform.deprecation).toBeUndefined();
    /* the numeric declaration is the frozen form: a major one declaration refuses below the supported floor with the conversion path inside the mismatch */
    const legacy = negotiate({ client: { protocolmajor: 1 }, server });
    expect(legacy.agreed).toBe(false);
    expect(legacy.mismatch).toContain("below the supported floor");
    expect(legacy.mismatch).toContain("migrateplan");
    expect(legacy.mismatch).toContain("docs/migrationguide.md");
    const frozen = negotiate({ client: { protocolmajor: 2 }, server });
    expect(frozen.agreed).toBe(true);
    expect(frozen.protocolmajor).toBe(2);
    expect(frozen.deprecation).toBeUndefined();
    const future = negotiate({ client: { protocolmajor: 3 }, server });
    expect(future.agreed).toBe(false);
    expect(future.mismatch).toContain("the supported protocol versions are 2 through 2");
    expect(protocolsupported).toEqual({ minimum: 2, maximum: 2 });
    expect(deprecationwindow).toEqual({ opens: "1.1.91", closes: "2.0.0" });
  });

  it("answers the strict unknown field refusal for every client after the sunset", async () => {
    const strictframe = { ...freezeframe(21, "ping"), mysteryfield: true };
    const strict = await handleframe({ frame: strictframe as jsonrpcframe, client: v2client, catalog: freezecatalog, config: freezeconfig, session: freezesession, plan: freezeplan, origin: freezesession.origin, tabid: freezesession.tabid, now: freezenow, execute: async step => ({ content: `ran ${step.kind}`, iserror: false }) });
    expect(strict.error?.code).toBe("params");
    expect(strict.error?.message).toContain("Strict schema validation");
    /* the version one client that still sends the deprecated protocolversion string parses to the frozen default of two, so its unknown fields meet the same strict refusal the 2.0.0 sunset answers every major with */
    const sunset = await handleframe({ frame: strictframe as jsonrpcframe, client: v1client, catalog: freezecatalog, config: freezeconfig, session: freezesession, plan: freezeplan, origin: freezesession.origin, tabid: freezesession.tabid, now: freezenow, execute: async step => ({ content: `ran ${step.kind}`, iserror: false }) });
    expect(sunset.error?.code).toBe("params");
    expect(sunset.error?.message).toContain("Strict schema validation");
  });
});


/* ── The 1.1.95 quarantine review flow messages of the security hardening release. ── */

import { quarantineverdictreport } from "../protocol.js";
import { enforcequarantine, exportall, inventoryentry, purgeonrequest } from "../export.js";

describe("the quarantine review flow messages", () => {
  it("wraps the verdict report of a held quarantine entry in the versioned envelope", () => {
    const held = enforcequarantine({ path: "/sandbox/invoice.pdf", reason: "download moved out of the downloads folder", digest: `${"a".repeat(64)}`, now: 1000 });
    expect(held.action).toBe("hold");
    expect(held.entry.digest).toBe("a".repeat(64));
    const report = quarantineverdictreport({ entry: { id: held.entry.id, path: held.entry.path, reason: held.entry.reason, scan: held.entry.scan, status: held.entry.status ?? "held", at: held.entry.at, updatedat: held.entry.updatedat } });
    expect(report.version).toBe(protocolversion);
    expect(report.scan).toBe("pending");
    expect(report.status).toBe("held");
    expect(report.released).toBe(false);
  });

  it("releases only a clean verdict and never reports a held or flagged file as released", () => {
    const clean = enforcequarantine({ path: "/sandbox/invoice.pdf", reason: "clean scan", scan: "clean", now: 2000 });
    const cleanreport = quarantineverdictreport({ entry: { id: clean.entry.id, path: clean.entry.path, reason: clean.entry.reason, scan: clean.entry.scan, status: clean.entry.status ?? "held", at: clean.entry.at, updatedat: clean.entry.updatedat } });
    expect(cleanreport.released).toBe(true);
    expect(cleanreport.scan).toBe("clean");
    const flagged = enforcequarantine({ path: "/sandbox/invoice.pdf", reason: "flagged scan", scan: "flagged", now: 3000 });
    expect(flagged.action).toBe("delete");
    expect(() => quarantineverdictreport({ entry: { id: flagged.entry.id, path: flagged.entry.path, reason: flagged.entry.reason, scan: "flagged", status: "released", at: flagged.entry.at, updatedat: flagged.entry.updatedat } })).toThrow("Only a clean scanner verdict releases a quarantined file");
  });

  it("carries the quarantine entries with their digests through the session context report", () => {
    const held = enforcequarantine({ path: "/sandbox/report.pdf", reason: "quarantine step", digest: `${"b".repeat(64)}`, now: 1000 });
    const context = quarantinereport({ entries: [held.entry] });
    expect(context.version).toBe(protocolversion);
    expect(context.entries[0]?.digest).toBe("b".repeat(64));
    expect(context.entries[0]?.status).toBe("held");
  });
});

/* ── The 1.1.95 purge and export completeness messages of the minimization family. ── */

describe("the purge and export completeness messages", () => {
  it("reports the full inventory scope of a purge with the audit hashes preserved", () => {
    const now = 4000;
    const inventory = ["runs", "memoryitems", "captures", "provlog"].map(key => inventoryentry({ key, dataclass: key === "memoryitems" ? "memory" : key === "provlog" ? "provenance" : key, value: [{}], now }));
    const purge = purgeonrequest({ policy: { scope: ["all"], confirmation: "delete everything", at: now }, typed: "delete everything", inventory, now });
    expect(purge.deleted.sort()).toEqual(["captures", "memoryitems", "provlog", "runs"].sort());
    expect(purge.audithashespreserved).toBe(true);
  });

  it("returns every stored record inside the one exportall archive bundle", () => {
    const bundle = exportall({ runs: ["run-one", "run-two"], memory: ["memory-one"], captures: ["capture-one"], settings: true, provenance: ["prov-one"], now: 5000 });
    expect(bundle.records).toBe(6);
    expect(bundle.runs).toEqual(["run-one", "run-two"]);
    expect(bundle.memory).toEqual(["memory-one"]);
    expect(bundle.captures).toEqual(["capture-one"]);
    expect(bundle.settings).toBe(true);
    expect(bundle.provenance).toEqual(["prov-one"]);
  });
});

/* ── The 1.1.96 multi agent certification: the coordination messages against the frozen schemas. ── */
import { aggregationreport, consensusreport, costledgerreport, lessonreport, parsespawnrequest, spawnreply } from "../protocol.js";
import type { agentrecord, consensusrecord, aggregaterecord, costentry, lessonrecord, spawnrecord } from "../types.js";

describe("protocol coordination messages", () => {
  const now = 1_800_000_000_000;

  it("wraps the consensus round with every vote, the tally, the quorum and the outcome", () => {
    const record: consensusrecord = {
      id: "con1",
      proposal: "Merge the two extractions of the pricing table.",
      votes: [
        { agentid: "w1", vote: "yes", castat: now },
        { agentid: "w2", vote: "yes", castat: now + 1 },
        { agentid: "c1", vote: "no", reason: "One stale row.", castat: now + 2 },
        { agentid: "v1", vote: "abstain", castat: now + 3 },
      ],
      tally: { yes: 2, no: 1, abstain: 1 },
      quorum: 3,
      outcome: "failed",
      closedat: now + 4,
    };
    const report = consensusreport({ record });
    expect(report.version).toBe(protocolversion);
    expect(report.proposal).toBe("Merge the two extractions of the pricing table.");
    expect(report.votes).toHaveLength(4);
    expect(report.votes[2]).toMatchObject({ agentid: "c1", vote: "no", reason: "One stale row." });
    expect(report.tally).toEqual({ yes: 2, no: 1, abstain: 1 });
    expect(report.quorum).toBe(3);
    expect(report.outcome).toBe("failed");
  });

  it("wraps the aggregation report with the per agent sections, the conflicts and the open state", () => {
    const record: aggregaterecord = {
      id: "agg1",
      subject: "The pricing table read",
      cells: [
        { agentid: "w1", runid: "run-1", section: "rowcount", output: "14" },
        { agentid: "w2", runid: "run-2", section: "rowcount", output: "15" },
      ],
      conflicts: [{ key: "rowcount" }],
      state: "open",
      createdat: now,
    };
    const report = aggregationreport({ record });
    expect(report.version).toBe(protocolversion);
    expect(report.subject).toBe("The pricing table read");
    expect(report.sections).toHaveLength(2);
    expect(report.sections[0]).toMatchObject({ agentid: "w1", runid: "run-1", section: "rowcount" });
    expect(report.conflicts).toEqual([{ key: "rowcount" }]);
    expect(report.state).toBe("open");
  });

  it("wraps the lessonshare matches with the agent, the finding, the origin and the reuse count", () => {
    const lessons: lessonrecord[] = [
      { id: "l1", agentid: "w1", finding: "The pricing table loads only after the hero settles.", origin: "https://example.com", reusecount: 2, recordedat: now, lastusedat: now + 1 },
      { id: "l2", agentid: "w2", finding: "The login form refuses pasted passwords.", origin: "https://shop.example", reusecount: 0, recordedat: now },
    ];
    const report = lessonreport({ lessons });
    expect(report.version).toBe(protocolversion);
    expect(report.lessons).toHaveLength(2);
    expect(report.lessons[0]).toMatchObject({ id: "l1", agentid: "w1", origin: "https://example.com", reusecount: 2 });
    expect(report.lessons[0]?.lastusedat).toBe(now + 1);
    expect(report.lessons[1]).not.toHaveProperty("lastusedat");
  });

  it("wraps the shared cost ledger with every entry attributed to its agent and the split", () => {
    const entries: costentry[] = [
      { agentid: "w1", runid: "run-1", units: 4, description: "The pricing table read.", at: now },
      { agentid: "w2", runid: "run-2", units: 2, description: "The footer read.", at: now + 1 },
    ];
    const split = [
      { agentid: "w1", units: 4, share: 2, sharedwith: ["w2"] },
      { agentid: "w2", units: 2, share: 2 },
    ];
    const report = costledgerreport({ entries, split });
    expect(report.version).toBe(protocolversion);
    expect(report.entries[0]).toMatchObject({ agentid: "w1", runid: "run-1", units: 4, description: "The pricing table read." });
    expect(report.split[0]).toMatchObject({ agentid: "w1", units: 4, share: 2, sharedwith: ["w2"] });
    expect(report.split[1]).not.toHaveProperty("sharedwith");
  });

  it("parses the spawn request against the fleet registry and answers the spawn reply with the lineage", () => {
    const agents: agentrecord[] = [
      { id: "a1", name: "Scout", role: "worker", origin: "https://example.com", state: "active", registeredat: now },
      { id: "w1", name: "Scribe", role: "worker", origin: "https://example.com", state: "active", registeredat: now },
    ];
    const spawns: spawnrecord[] = [];
    const parsed = parsespawnrequest({ parentid: "a1", objective: "Index the footer links.", role: "worker", depth: 1, narrowscope: { origins: ["https://example.com"] } }, { maxdepth: 2 }, agents, spawns);
    expect(parsed.spec.parentid).toBe("a1");
    expect(parsed.spec.depth).toBe(1);
    expect(parsed.spec.narrowscope).toEqual({ origins: ["https://example.com"] });
    expect(parsed.parent.id).toBe("a1");
    const reply = spawnreply({ child: { id: "g1", name: "Probe", role: "worker", origin: "https://example.com", state: "active", registeredat: now + 1 }, parentid: "a1", depth: 1 });
    expect(reply.version).toBe(protocolversion);
    expect(reply).toMatchObject({ agentid: "g1", name: "Probe", role: "worker", parentid: "a1", depth: 1 });
    expect(() => parsespawnrequest({ parentid: "a1", objective: "Too deep.", depth: 9 }, { maxdepth: 2 }, agents, spawns)).toThrow(/depth limit/);
    expect(() => parsespawnrequest({ parentid: "ghost", objective: "Unknown.", depth: 1 }, { maxdepth: 2 }, agents, spawns)).toThrow(/does not carry/);
  });
});
