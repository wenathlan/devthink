import { describe, expect, it } from "vitest";
import { buildtoolcatalog } from "../tools.js";
import { defaultmcpconfig } from "../mcp.js";
import { actionrisk, apikeyconsentgranted, authconsentgranted, beforeafterwrapallowed, blockgate, breakpointbudgetallowed, breakpointceilingof, canexecute, canpreview, captureexportgranted, capturegate, consoleconsentcovers, controltarget, cookiegate, debuggate, debuggerconsentcovers, captureretentionwindow, clipboardconsentgranted, credentialheadername, debugwaitbudgetallowed, diffreviewgrade, downloadgranted, exportgranted, fetchbudgetallowed, fetchconsentcovers, fetchconsentrefgranted, generatedvalueallowed, hostpattern, iscapturekind, isdatasetkind, isdebugkind, isexportkind, isfileskind, isformkind, ishttpkind, iscontrolkind, islayoutkind, ismediakind, isnetwatchkind, isrecordingkind, issocketkind, istabscommandkind, iscdpkind, iswatchkind, lapsebudgetallowed, layoutmutationgranted, maskclipboard, mediagate, mutationcallof, normalizeendpoint, pauseretentionwindow, planallowlist, observedorigingranted, observationmodeof, origincheck, outboundtarget, parseoptions, passwordconsentgranted, profilegrantgranted, proxygate, quarantinereleasegranted, ratelimitbudgetallowed, recordingconsentgranted, recordingwindow, requiredcapability, resolvedrisk, resolutionverdict, socketgate, sockettarget, stackgate, stitchbudgetallowed, submitreviewgranted, tasktabceiling, emulationretentionwindow, emugate, emulationstackallowed, isemulationkind, locationconsentgate, permissionnamevalid, permissionstatevalid, timelinegate, timelineretentionwindow, validatecapturenaming, validatecaptureoptions, validatecleanuprule, validatedownloadspec, validateendpointrecord, validatefieldmatch, validateformrecord, validatemimefilter, validateregionrect, validatestep, validatetabquery, validatetargetref, validatetransformrule, validatevaluegen, validatebreakpointcondition, waitduration, watchgate, windowclosegate , isprofilekind, profileretentionwindow, sourcemapconsentcovers, targetgate, traceceilingof, editorsavegate, exportcontentreview, runreviewgranted, validatesiteoverride, watchdogconfigvalid, serverbindgate, serverenablementgate, toolconsentrequired, tooldispatchgate, toolnamespacegate, toolriskgrade, toolversionfloor, validatetoolcatalog, allowlistentryvalid, approvaltimeoutvalid, batchgrade, callauditcomplete, callratelimitvalid, consentmetagrade, dryrunpurity, mockusagevalid, pairingreadinessgate, remoteenablementgate, remotetransporttls, revocationgate, samplinggrade, subscriptiongrade, tokenlifetimevalid, tokenscopevalid , librarymanifestgate, librarycapabilitygate, librarygrantgate, librarysensitivegate, libraryquarantinegate, libraryimportgate, syncbridgeoptingate, syncbridgescopegate, runreplaygate, outputcomparegate, outputcomparereadonlygate, backgroundrungate} from "../policy.js";
import type { actionkind, agentidentity, agentplan, agentsession, clientrecord, consoleconsentrecord, debuggergrant, formprofile, policyevaluation, tooldomain, tooldef, toolstep } from "../types.js";
import { environmentgrantgate, environmentrequirements, keepalivegate, keepaliveintervalvalid, offscreencapabilitygate, sandboxorigingate, stepenvironmentvalid, workerpoolsizevalid } from "../policy.js";
import { resolvedrisk as resolverisk, paletteactiongate, taskinputproposalgate, planreviewgate, stepapprovegate, diffpreviewgate, onboardingconsentgate, logbufferboundvalid, logstreamegressgate } from "../policy.js";
import { costbudgetvalid, egressconsentgate, guardverdictgate, localsensitivegrade, planlint, plandraftreviewgate, provideregressgrade, providervalid, replanreviewgate } from "../policy.js";
import { agentbudgetvalid, agentscopevalid, blackboardconsentgrade, killswitchgate, messageegressgrade, queuelanesvalid, spawngrade, workstealgrade } from "../policy.js";
import { conflictresolutiongrade, consensusquorumvalid, criticreviewgrade, escalationgate, handoffgrantgate, leaderelectionvalid, lockscopevalid, mergeegressgrade, verifiermethodgrade, workerscalevalid } from "../policy.js";
import type { costbudget, modeloutput, plandraft, providerconfig, replanrecord } from "../types.js";
void resolverisk;

const now = 1_800_000_000_000;
const session: agentsession = { id: "session", tabid: 4, origin: "https://example.com", startedat: now, expiresat: now + 1000 };
const step: toolstep = { id: "step", kind: "click", target: "#submit", summary: "Click the reviewed submit control.", risk: "sensitive" };
const plan: agentplan = { id: "plan", objective: "Submit once", origin: "https://example.com", steps: [step], createdat: now, expiresat: now + 1000, state: "approved" };

describe("policy", () => {
  it("requires HTTPS and creates a precise optional host pattern", () => {
    expect(normalizeendpoint("https://agent.example/path").origin).toBe("https://agent.example");
    expect(hostpattern("https://agent.example")).toBe("https://agent.example/*");
    expect(() => normalizeendpoint("http://agent.example")).toThrow("HTTPS");
  });

  it("blocks action before plan approval and before page bridge invocation", () => {
    expect(canexecute({ session, plan: { ...plan, state: "pending" }, step, tabid: 4, origin: "https://example.com", now })).toMatchObject({ allowed: false });
  });

  it("blocks cross-origin navigation and expired sessions", () => {
    const navigation: toolstep = { id: "next", kind: "navigate", value: "https://other.example", summary: "Navigate away", risk: "sensitive" };
    expect(canexecute({ session, plan, step: navigation, tabid: 4, origin: "https://example.com", now })).toMatchObject({ allowed: false });
    expect(canexecute({ session: { ...session, expiresat: now - 1 }, plan, step, tabid: 4, origin: "https://example.com", now })).toMatchObject({ allowed: false });
  });

  it("allows a target preview only while the matching session and reviewed plan remain current", () => {
    expect(canpreview({ session, plan: { ...plan, state: "pending" }, step, tabid: 4, origin: "https://example.com", now })).toEqual({ allowed: true });
    expect(canpreview({ session, plan, step: { id: "missing", kind: "click", summary: "Preview an absent target.", risk: "sensitive" }, tabid: 4, origin: "https://example.com", now })).toMatchObject({ allowed: false });
    expect(canpreview({ session: { ...session, expiresat: now - 1 }, plan, step, tabid: 4, origin: "https://example.com", now })).toMatchObject({ allowed: false });
  });

  it("blocks every execution and preview while the session is paused", () => {
    const paused = { ...session, pausedat: now - 1 };
    expect(canexecute({ session: paused, plan, step, tabid: 4, origin: "https://example.com", now })).toMatchObject({ allowed: false, reason: expect.stringContaining("paused") });
    expect(canpreview({ session: paused, plan: { ...plan, state: "pending" }, step, tabid: 4, origin: "https://example.com", now })).toMatchObject({ allowed: false, reason: expect.stringContaining("paused") });
  });

  it("classifies the expanded action vocabulary with fixed risk levels", () => {
    expect(actionrisk("observe")).toBe("read");
    expect(actionrisk("extract")).toBe("read");
    expect(actionrisk("wait")).toBe("read");
    expect(actionrisk("readtable")).toBe("read");
    expect(actionrisk("readstorage")).toBe("read");
    expect(actionrisk("tablist")).toBe("read");
    expect(actionrisk("tabsnapshot")).toBe("read");
    expect(actionrisk("scroll")).toBe("interaction");
    expect(actionrisk("hover")).toBe("interaction");
    expect(actionrisk("clickdeep")).toBe("interaction");
    expect(actionrisk("scrollpage")).toBe("interaction");
    expect(actionrisk("select")).toBe("sensitive");
    expect(actionrisk("presskey")).toBe("sensitive");
    expect(actionrisk("drag")).toBe("sensitive");
    expect(actionrisk("upload")).toBe("sensitive");
    expect(actionrisk("evaluate")).toBe("sensitive");
    expect(actionrisk("writestorage")).toBe("sensitive");
    expect(actionrisk("tabcreate")).toBe("sensitive");
    expect(actionrisk("tabclose")).toBe("sensitive");
    expect(actionrisk("downloadfile")).toBe("sensitive");
    expect(actionrisk("listruns")).toBe("read");
    expect(() => actionrisk("download" as never)).toThrow("Unsupported");
  });

  it("validates the target-based actions and keeps wait durations unbounded", () => {
    expect(canexecute({ session, plan, step: { id: "s1", kind: "select", target: "#country", value: "br", summary: "Select the reviewed country.", risk: "sensitive" }, tabid: 4, origin: "https://example.com", now })).toEqual({ allowed: true });
    expect(canexecute({ session, plan, step: { id: "s2", kind: "select", target: "#country", summary: "Select without a value.", risk: "sensitive" }, tabid: 4, origin: "https://example.com", now })).toMatchObject({ allowed: false, reason: "A reviewed option value is required." });
    expect(canexecute({ session, plan, step: { id: "s3", kind: "scroll", summary: "Scroll without a target.", risk: "interaction" }, tabid: 4, origin: "https://example.com", now })).toMatchObject({ allowed: false, reason: "A page target is required." });
    expect(waitduration({ id: "w1", kind: "wait", value: "999999", summary: "Wait a long time.", risk: "read" })).toBe(999_999);
    expect(waitduration({ id: "w2", kind: "wait", summary: "Wait the default pause.", risk: "read" })).toBe(250);
    expect(canexecute({ session, plan, step: { id: "w3", kind: "wait", value: "abc", summary: "Wait an invalid duration.", risk: "read" }, tabid: 4, origin: "https://example.com", now })).toMatchObject({ allowed: false, reason: expect.stringContaining("Wait duration") });
  });

  it("validates the reviewed options grammar of the new kinds", () => {
    expect(parseoptions({ id: "o1", kind: "setattribute", target: "#box", options: "{\"name\":\"data-x\",\"value\":\"1\"}", summary: "Set an attribute.", risk: "sensitive" })).toEqual({ name: "data-x", value: "1" });
    expect(() => parseoptions({ id: "o2", kind: "setattribute", target: "#box", options: "not json", summary: "Broken options.", risk: "sensitive" })).toThrow("JSON object");
    expect(canexecute({ session, plan, step: { id: "o3", kind: "setattribute", target: "#box", summary: "Set without options.", risk: "sensitive" }, tabid: 4, origin: "https://example.com", now })).toMatchObject({ allowed: false, reason: "A reviewed name is required in options." });
    expect(canexecute({ session, plan, step: { id: "o4", kind: "presskey", summary: "Press without a key.", risk: "sensitive" }, tabid: 4, origin: "https://example.com", now })).toMatchObject({ allowed: false, reason: "A reviewed value is required." });
    expect(canexecute({ session, plan, step: { id: "o5", kind: "zoomset", value: "0", summary: "Zoom to zero.", risk: "interaction" }, tabid: 4, origin: "https://example.com", now })).toMatchObject({ allowed: false, reason: "The reviewed zoom must be a positive number." });
    expect(canexecute({ session, plan, step: { id: "o6", kind: "tabclose", value: "seven", summary: "Close by word.", risk: "sensitive" }, tabid: 4, origin: "https://example.com", now })).toMatchObject({ allowed: false, reason: "A numeric browser id is required." });
    expect(canexecute({ session, plan, step: { id: "o7", kind: "windowresize", value: "4", options: "{\"width\":800}", summary: "Resize without height.", risk: "sensitive" }, tabid: 4, origin: "https://example.com", now })).toMatchObject({ allowed: false, reason: "Reviewed width and height numbers are required in options." });
    expect(canexecute({ session, plan, step: { id: "o8", kind: "drag", target: "#source", value: "#drop", summary: "Drag between targets.", risk: "sensitive" }, tabid: 4, origin: "https://example.com", now })).toEqual({ allowed: true });
  });

  it("maps action kinds to their optional browser capabilities", () => {
    expect(requiredcapability("tablist")).toBe("tabs");
    expect(requiredcapability("downloadfile")).toBe("downloads");
    expect(requiredcapability("click")).toBeUndefined();
    expect(requiredcapability("readstorage")).toBeUndefined();
  });

  it("keeps previews restricted to target-based actions", () => {
    expect(canpreview({ session, plan: { ...plan, state: "pending" }, step: { id: "h1", kind: "hover", target: "#menu", summary: "Preview the reviewed menu.", risk: "interaction" }, tabid: 4, origin: "https://example.com", now })).toEqual({ allowed: true });
    expect(canpreview({ session, plan: { ...plan, state: "pending" }, step: { id: "e1", kind: "extract", summary: "Preview an extraction.", risk: "read" }, tabid: 4, origin: "https://example.com", now })).toMatchObject({ allowed: false, reason: "Only a target-based action can be previewed." });
    expect(canpreview({ session, plan: { ...plan, state: "pending" }, step: { id: "r1", kind: "readgeometry", target: "#card", summary: "Preview the reviewed card.", risk: "read" }, tabid: 4, origin: "https://example.com", now })).toEqual({ allowed: true });
  });
});

describe("interaction universe policy", () => {
  const origin = "https://example.com";

  function gate(step: toolstep, localsession: agentsession = session): policyevaluationlike {
    return canexecute({ session: localsession, plan, step, tabid: 4, origin, now });
  }

  type policyevaluationlike = { allowed: boolean; reason?: string };

  it("grades every new kind with its reviewed risk class", () => {
    const sensitive: actionkind[] = ["clickpoint", "shiftclick", "dismissdialog", "enterframe", "typetime", "appendtext", "setvalue", "typeedit", "keyhold", "keyrelease", "submitsearch", "selectmulti", "chooseradio", "setslider", "setdate", "setcolor"];
    for (const kind of sensitive) expect(actionrisk(kind)).toBe("sensitive");
    const interaction: actionkind[] = ["movepointer", "clicktext", "clickaria", "clickname", "expanddetails", "pierceshadow", "retryaction"];
    for (const kind of interaction) expect(actionrisk(kind)).toBe("interaction");
    const read: actionkind[] = ["mapclicks", "verifyvisible", "verifyenabled", "resolvexpath"];
    for (const kind of read) expect(actionrisk(kind)).toBe("read");
  });

  it("validates the reviewed pointpath and speedprofile grammar of movepointer", () => {
    const path: toolstep = { id: "m1", kind: "movepointer", summary: "Travel the reviewed pointer path.", risk: "interaction", options: "{\"pointpath\":{\"start\":{\"x\":10,\"y\":20},\"end\":{\"x\":400,\"y\":300},\"waypoints\":[{\"x\":100,\"y\":40}],\"duration\":900},\"speedprofile\":{\"easing\":\"easeinout\",\"peak\":1200,\"jitter\":24}}" };
    expect(gate(path)).toEqual({ allowed: true });
    expect(gate({ id: "m2", kind: "movepointer", summary: "Travel without a path.", risk: "interaction" })).toMatchObject({ allowed: false, reason: "A reviewed pointpath with start and end points is required in options." });
    expect(gate({ id: "m3", kind: "movepointer", summary: "Travel with a broken end point.", risk: "interaction", options: "{\"pointpath\":{\"start\":{\"x\":1,\"y\":2},\"end\":{\"x\":\"far\"}}}" })).toMatchObject({ allowed: false, reason: "The reviewed pointpath needs numeric start and end points." });
    expect(gate({ id: "m4", kind: "movepointer", summary: "Travel with broken waypoints.", risk: "interaction", options: "{\"pointpath\":{\"start\":{\"x\":1,\"y\":2},\"end\":{\"x\":3,\"y\":4},\"waypoints\":[{\"x\":5}]}}" })).toMatchObject({ allowed: false, reason: "The reviewed pointpath waypoints must be numeric points." });
    expect(gate({ id: "m5", kind: "movepointer", summary: "Travel with a negative duration.", risk: "interaction", options: "{\"pointpath\":{\"start\":{\"x\":1,\"y\":2},\"end\":{\"x\":3,\"y\":4},\"duration\":-5}}" })).toMatchObject({ allowed: false, reason: "The reviewed pointpath duration must be zero or a positive number of milliseconds." });
    expect(gate({ id: "m6", kind: "movepointer", summary: "Travel with an unknown easing.", risk: "interaction", options: "{\"pointpath\":{\"start\":{\"x\":1,\"y\":2},\"end\":{\"x\":3,\"y\":4}},\"speedprofile\":{\"easing\":\"snap\"}}" })).toMatchObject({ allowed: false, reason: "The reviewed easing must be linear or easeinout." });
    expect(gate({ id: "m7", kind: "movepointer", summary: "Travel with a negative peak.", risk: "interaction", options: "{\"pointpath\":{\"start\":{\"x\":1,\"y\":2},\"end\":{\"x\":3,\"y\":4}},\"speedprofile\":{\"peak\":-1}}" })).toMatchObject({ allowed: false, reason: "The reviewed peak velocity must be zero or a positive number." });
    expect(gate({ id: "m8", kind: "movepointer", summary: "Travel with a negative jitter.", risk: "interaction", options: "{\"pointpath\":{\"start\":{\"x\":1,\"y\":2},\"end\":{\"x\":3,\"y\":4}},\"speedprofile\":{\"jitter\":-3}}" })).toMatchObject({ allowed: false, reason: "The reviewed jitter window must be zero or a positive number of milliseconds." });
  });

  it("requires the matching targetref mode of the resolution kinds", () => {
    const point: toolstep = { id: "c1", kind: "clickpoint", summary: "Click the reviewed coordinates.", risk: "sensitive", options: "{\"targetref\":{\"mode\":\"point\",\"x\":120,\"y\":40}}" };
    expect(gate(point)).toEqual({ allowed: true });
    expect(gate({ id: "c2", kind: "clickpoint", summary: "Click without a point reference.", risk: "sensitive" })).toMatchObject({ allowed: false, reason: "A reviewed point target reference is required in options." });
    expect(gate({ id: "c3", kind: "clickpoint", summary: "Click with the wrong mode.", risk: "sensitive", options: "{\"targetref\":{\"mode\":\"selector\",\"selector\":\"#go\"}}" })).toMatchObject({ allowed: false, reason: "A reviewed point target reference is required in options." });
    expect(gate({ id: "t1", kind: "clicktext", summary: "Click the reviewed text.", risk: "interaction", options: "{\"targetref\":{\"mode\":\"text\",\"text\":\"Sign in\"}}" })).toEqual({ allowed: true });
    expect(gate({ id: "t2", kind: "clicktext", summary: "Click text with the wrong mode.", risk: "interaction", options: "{\"targetref\":{\"mode\":\"point\",\"x\":1,\"y\":2}}" })).toMatchObject({ allowed: false, reason: "A reviewed text target reference is required in options." });
    expect(gate({ id: "a1", kind: "clickaria", summary: "Click the reviewed aria pair.", risk: "interaction", options: "{\"targetref\":{\"mode\":\"aria\",\"role\":\"button\",\"name\":\"Submit\"}}" })).toEqual({ allowed: true });
    expect(gate({ id: "a2", kind: "clickaria", summary: "Click aria with the wrong mode.", risk: "interaction", options: "{\"targetref\":{\"mode\":\"name\",\"name\":\"Submit\"}}" })).toMatchObject({ allowed: false, reason: "A reviewed aria target reference is required in options." });
    expect(gate({ id: "n1", kind: "clickname", summary: "Click the reviewed accessible name.", risk: "interaction", options: "{\"targetref\":{\"mode\":\"name\",\"name\":\"Email\"}}" })).toEqual({ allowed: true });
    expect(gate({ id: "n2", kind: "clickname", summary: "Click a name with the wrong mode.", risk: "interaction", options: "{\"targetref\":{\"mode\":\"text\",\"text\":\"Email\"}}" })).toMatchObject({ allowed: false, reason: "A reviewed name target reference is required in options." });
    expect(gate({ id: "x1", kind: "resolvexpath", summary: "Resolve the reviewed xpath.", risk: "read", options: "{\"targetref\":{\"mode\":\"xpath\",\"xpath\":\"//button[@id='go']\"}}" })).toEqual({ allowed: true });
    expect(gate({ id: "x2", kind: "resolvexpath", summary: "Resolve without an xpath reference.", risk: "read" })).toMatchObject({ allowed: false, reason: "A reviewed xpath target reference is required in options." });
  });

  it("validates the typing, key and control kinds grammar", () => {
    expect(gate({ id: "k1", kind: "typetime", target: "#query", value: "devthink", summary: "Type slowly into the reviewed field.", risk: "sensitive", options: "{\"delay\":120}" })).toEqual({ allowed: true });
    expect(gate({ id: "k2", kind: "typetime", target: "#query", value: "devthink", summary: "Type with a negative delay.", risk: "sensitive", options: "{\"delay\":-1}" })).toMatchObject({ allowed: false, reason: "The reviewed per keystroke delay must be zero or a positive number of milliseconds." });
    expect(gate({ id: "k3", kind: "typetime", target: "#query", summary: "Type without reviewed text.", risk: "sensitive" })).toMatchObject({ allowed: false, reason: "A reviewed value is required." });
    expect(gate({ id: "k4", kind: "appendtext", target: "#notes", value: " more", summary: "Append reviewed text.", risk: "sensitive" })).toEqual({ allowed: true });
    expect(gate({ id: "k5", kind: "setvalue", target: "#name", value: "Ada", summary: "Set the reviewed value.", risk: "sensitive" })).toEqual({ allowed: true });
    expect(gate({ id: "k6", kind: "typeedit", target: "#editor", value: "draft", summary: "Type into the editable region.", risk: "sensitive" })).toEqual({ allowed: true });
    expect(gate({ id: "k7", kind: "keyhold", value: "Shift", summary: "Hold the reviewed key.", risk: "sensitive", options: "{\"holdid\":\"shift1\",\"modifiers\":[\"shift\"]}" })).toEqual({ allowed: true });
    expect(gate({ id: "k8", kind: "keyhold", value: "Shift", summary: "Hold with an empty hold id.", risk: "sensitive", options: "{\"holdid\":\"\"}" })).toMatchObject({ allowed: false, reason: "The reviewed hold id must be a non-empty string." });
    expect(gate({ id: "k9", kind: "keyrelease", value: "shift1", summary: "Release the held key.", risk: "sensitive" })).toEqual({ allowed: true });
    expect(gate({ id: "s1", kind: "submitsearch", target: "#search", summary: "Submit the reviewed search.", risk: "sensitive", options: "{\"results\":\"#results\",\"timeout\":4000}" })).toEqual({ allowed: true });
    expect(gate({ id: "s2", kind: "submitsearch", target: "#search", summary: "Submit without a results region.", risk: "sensitive" })).toMatchObject({ allowed: false, reason: "A reviewed results region selector is required in options." });
    expect(gate({ id: "s3", kind: "submitsearch", target: "#search", summary: "Submit with a negative timeout.", risk: "sensitive", options: "{\"results\":\"#results\",\"timeout\":-2}" })).toMatchObject({ allowed: false, reason: "The submitsearch timeout must be zero or a positive number of milliseconds." });
    expect(gate({ id: "s4", kind: "selectmulti", target: "#tags", summary: "Choose several options.", risk: "sensitive", options: "{\"values\":[\"a\",\"b\"]}" })).toEqual({ allowed: true });
    expect(gate({ id: "s5", kind: "selectmulti", target: "#tags", summary: "Choose without values.", risk: "sensitive" })).toMatchObject({ allowed: false, reason: "A reviewed list of option values is required in options." });
    expect(gate({ id: "s6", kind: "selectmulti", target: "#tags", summary: "Choose empty values.", risk: "sensitive", options: "{\"values\":[]}" })).toMatchObject({ allowed: false, reason: "A reviewed list of option values is required in options." });
    expect(gate({ id: "r1", kind: "chooseradio", target: "#plan", value: "beta", summary: "Pick the reviewed radio option.", risk: "sensitive" })).toEqual({ allowed: true });
    expect(gate({ id: "r2", kind: "setslider", target: "#volume", value: "55", summary: "Drag the reviewed slider.", risk: "sensitive" })).toEqual({ allowed: true });
    expect(gate({ id: "r3", kind: "setslider", target: "#volume", value: "loud", summary: "Drag with a non numeric value.", risk: "sensitive" })).toMatchObject({ allowed: false, reason: "The reviewed slider value must be a number." });
    expect(gate({ id: "d1", kind: "setdate", target: "#start", value: "2026-07-14", summary: "Set the reviewed date.", risk: "sensitive" })).toEqual({ allowed: true });
    expect(gate({ id: "d2", kind: "setdate", target: "#start", value: "14/07/2026", summary: "Set a badly formed date.", risk: "sensitive" })).toMatchObject({ allowed: false, reason: "The reviewed date must use the yyyy-mm-dd form." });
    expect(gate({ id: "d3", kind: "setcolor", target: "#tint", value: "#ff00aa", summary: "Set the reviewed color.", risk: "sensitive" })).toEqual({ allowed: true });
    expect(gate({ id: "d4", kind: "setcolor", target: "#tint", value: "red", summary: "Set a badly formed color.", risk: "sensitive" })).toMatchObject({ allowed: false, reason: "The reviewed color must use the #rrggbb form." });
    expect(gate({ id: "e1", kind: "expanddetails", target: "#faq", summary: "Open the reviewed section.", risk: "interaction" })).toEqual({ allowed: true });
    expect(gate({ id: "v1", kind: "verifyvisible", target: "#card", summary: "Verify the card renders.", risk: "read" })).toEqual({ allowed: true });
    expect(gate({ id: "v2", kind: "verifyenabled", target: "#card", summary: "Verify the card is enabled.", risk: "read" })).toEqual({ allowed: true });
    expect(gate({ id: "v3", kind: "mapclicks", summary: "Map every clickable element.", risk: "read" })).toEqual({ allowed: true });
  });

  it("validates the dialog, shadow and frame kinds with their origin grants", () => {
    expect(gate({ id: "g1", kind: "dismissdialog", summary: "Accept the next dialog.", risk: "sensitive", options: "{\"accept\":true}" })).toEqual({ allowed: true });
    expect(gate({ id: "g2", kind: "dismissdialog", summary: "Answer the prompt.", risk: "sensitive", options: "{\"answer\":\"devthink\"}" })).toEqual({ allowed: true });
    expect(gate({ id: "g3", kind: "dismissdialog", summary: "Arm without a reviewed policy.", risk: "sensitive" })).toMatchObject({ allowed: false, reason: "A reviewed accept flag or prompt answer is required in options." });
    expect(gate({ id: "g4", kind: "dismissdialog", summary: "Arm with a non boolean accept.", risk: "sensitive", options: "{\"accept\":\"yes\"}" })).toMatchObject({ allowed: false, reason: "The reviewed dialog accept flag must be a boolean." });
    expect(gate({ id: "g5", kind: "dismissdialog", summary: "Arm with an empty answer.", risk: "sensitive", options: "{\"accept\":true,\"answer\":\"\"}" })).toMatchObject({ allowed: false, reason: "The reviewed prompt answer must be a non-empty string." });
    expect(gate({ id: "w1", kind: "pierceshadow", target: "#inner", summary: "Click through the shadow root.", risk: "interaction", options: "{\"shadow\":[\"my-widget\",\".part\"]}" })).toEqual({ allowed: true });
    expect(gate({ id: "w2", kind: "pierceshadow", target: "#inner", summary: "Click with a broken shadow path.", risk: "interaction", options: "{\"shadow\":[\"my-widget\",7]}" })).toMatchObject({ allowed: false, reason: "The reviewed shadow path must be a list of non-empty selectors." });
    expect(gate({ id: "f1", kind: "enterframe", summary: "Click inside the reviewed frame.", risk: "sensitive", options: "{\"framepath\":[0],\"kind\":\"click\",\"target\":\"#go\"}" })).toEqual({ allowed: true });
    expect(gate({ id: "f2", kind: "enterframe", summary: "Route without a frame path.", risk: "sensitive", options: "{\"kind\":\"click\",\"target\":\"#go\"}" })).toMatchObject({ allowed: false, reason: "A reviewed frame path of frame indexes is required in options." });
    expect(gate({ id: "f3", kind: "enterframe", summary: "Route with a negative frame index.", risk: "sensitive", options: "{\"framepath\":[-1],\"kind\":\"click\",\"target\":\"#go\"}" })).toMatchObject({ allowed: false, reason: "A reviewed frame path of frame indexes is required in options." });
    expect(gate({ id: "f4", kind: "enterframe", summary: "Route with a wrapped wrapper.", risk: "sensitive", options: "{\"framepath\":[0],\"kind\":\"retryaction\"}" })).toMatchObject({ allowed: false, reason: "The reviewed inner step cannot be another wrapper kind." });
    const outsidegrants: agentsession = { ...session, grants: ["https://other.example"] };
    expect(gate({ id: "w3", kind: "pierceshadow", target: "#inner", summary: "Click outside the grants.", risk: "interaction" }, outsidegrants)).toMatchObject({ allowed: false, reason: "The shadow or frame step is outside the session origin grants." });
    expect(gate({ id: "f5", kind: "enterframe", summary: "Route outside the grants.", risk: "sensitive", options: "{\"framepath\":[0],\"kind\":\"click\",\"target\":\"#go\"}" }, outsidegrants)).toMatchObject({ allowed: false, reason: "The shadow or frame step is outside the session origin grants." });
  });

  it("validates the retry wrapper and keeps attempt counts free of code ceilings", () => {
    expect(gate({ id: "y1", kind: "retryaction", summary: "Retry the reviewed click.", risk: "interaction", options: "{\"kind\":\"click\",\"target\":\"#go\",\"retryrule\":{\"attempts\":3,\"settle\":250,\"tolerance\":6}}" })).toEqual({ allowed: true });
    expect(gate({ id: "y2", kind: "retryaction", summary: "Retry with a very large reviewed attempt count.", risk: "interaction", options: "{\"kind\":\"click\",\"target\":\"#go\",\"retryrule\":{\"attempts\":500}}" })).toEqual({ allowed: true });
    expect(gate({ id: "y3", kind: "retryaction", summary: "Retry without a rule.", risk: "interaction", options: "{\"kind\":\"click\",\"target\":\"#go\"}" })).toMatchObject({ allowed: false, reason: "A reviewed retry rule with attempts is required in options." });
    expect(gate({ id: "y4", kind: "retryaction", summary: "Retry with zero attempts.", risk: "interaction", options: "{\"kind\":\"click\",\"target\":\"#go\",\"retryrule\":{\"attempts\":0}}" })).toMatchObject({ allowed: false, reason: "The reviewed retry attempts must be a positive integer with no code ceiling." });
    expect(gate({ id: "y5", kind: "retryaction", summary: "Retry with a negative settle window.", risk: "interaction", options: "{\"kind\":\"click\",\"target\":\"#go\",\"retryrule\":{\"attempts\":2,\"settle\":-1}}" })).toMatchObject({ allowed: false, reason: "The reviewed retry settle window must be zero or a positive number of milliseconds." });
    expect(gate({ id: "y6", kind: "retryaction", summary: "Retry with a negative tolerance.", risk: "interaction", options: "{\"kind\":\"click\",\"target\":\"#go\",\"retryrule\":{\"attempts\":2,\"tolerance\":-4}}" })).toMatchObject({ allowed: false, reason: "The reviewed retry movement tolerance must be zero or a positive number of pixels." });
    expect(gate({ id: "y7", kind: "retryaction", summary: "Retry without an inner step.", risk: "interaction", options: "{\"retryrule\":{\"attempts\":2}}" })).toMatchObject({ allowed: false, reason: "A reviewed step id or inline step kind is required in options." });
    expect(gate({ id: "y8", kind: "retryaction", summary: "Retry referencing a sibling step id.", risk: "interaction", options: "{\"stepid\":\"step\",\"retryrule\":{\"attempts\":2}}" })).toEqual({ allowed: true });
    expect(gate({ id: "y9", kind: "retryaction", summary: "Retry with both a step id and an inline step.", risk: "interaction", options: "{\"stepid\":\"step\",\"kind\":\"click\",\"target\":\"#go\",\"retryrule\":{\"attempts\":2}}" })).toMatchObject({ allowed: false, reason: "The reviewed wrapper must reference a step id or an inline step, not both." });
  });

  it("validates every targetref mode and rejects empty references", () => {
    expect(validatetargetref({ mode: "selector", selector: "#submit" })).toEqual({ allowed: true });
    expect(validatetargetref({ mode: "selector" })).toMatchObject({ allowed: false, reason: "The selector target reference needs a non-empty selector." });
    expect(validatetargetref({ mode: "text", text: "Sign in" })).toEqual({ allowed: true });
    expect(validatetargetref({ mode: "text", text: "  " })).toMatchObject({ allowed: false, reason: "The text target reference needs non-empty text." });
    expect(validatetargetref({ mode: "aria", role: "button", name: "Submit" })).toEqual({ allowed: true });
    expect(validatetargetref({ mode: "aria", role: "button" })).toMatchObject({ allowed: false, reason: "The aria target reference needs a non-empty name." });
    expect(validatetargetref({ mode: "aria", name: "Submit" })).toMatchObject({ allowed: false, reason: "The aria target reference needs a non-empty role." });
    expect(validatetargetref({ mode: "name", name: "Email" })).toEqual({ allowed: true });
    expect(validatetargetref({ mode: "name" })).toMatchObject({ allowed: false, reason: "The name target reference needs a non-empty name." });
    expect(validatetargetref({ mode: "xpath", xpath: "//button[@id='go']" })).toEqual({ allowed: true });
    expect(validatetargetref({ mode: "xpath", xpath: "" })).toMatchObject({ allowed: false, reason: "The xpath target reference needs a non-empty expression." });
    expect(validatetargetref({ mode: "index", index: 3 })).toEqual({ allowed: true });
    expect(validatetargetref({ mode: "index", index: 0 })).toMatchObject({ allowed: false, reason: "The index target reference needs a positive integer map number." });
    expect(validatetargetref({ mode: "index", index: 2.5 })).toMatchObject({ allowed: false, reason: "The index target reference needs a positive integer map number." });
    expect(validatetargetref({ mode: "point", x: 120, y: 40 })).toEqual({ allowed: true });
    expect(validatetargetref({ mode: "point", x: 120 })).toMatchObject({ allowed: false, reason: "The point target reference needs numeric x and y coordinates." });
    expect(validatetargetref({ mode: "telepathy" })).toMatchObject({ allowed: false, reason: "The target reference mode must be selector, text, aria, name, xpath, index or point." });
    expect(validatetargetref("selector")).toMatchObject({ allowed: false, reason: "The reviewed target reference must be an object." });
    expect(validatetargetref(["selector"])).toMatchObject({ allowed: false, reason: "The reviewed target reference must be an object." });
  });

  it("rejects ambiguous resolutions through the shared verdict rule", () => {
    expect(resolutionverdict(0)).toBe("absent");
    expect(resolutionverdict(1)).toBe("resolved");
    expect(resolutionverdict(2)).toBe("ambiguous");
    expect(resolutionverdict(37)).toBe("ambiguous");
    expect(resolutionverdict(-1)).toBe("absent");
    expect(resolutionverdict(Number.NaN)).toBe("absent");
  });
});

describe("observation depth policy", () => {
  const origin = "https://example.com";

  function gate(step: toolstep, localsession: agentsession = session): { allowed: boolean; reason?: string } {
    return canexecute({ session: localsession, plan, step, tabid: 4, origin, now });
  }

  it("grades every observation kind as read only", () => {
    const kinds: actionkind[] = ["a11ytree", "readvisible", "readertree", "detectlists", "detecttables", "readjson", "watchmutate", "waitquiet", "watchbanner", "detectinfinitescroll", "detectvirtual", "detectlazy", "readscrollpos", "readlang", "readoutline", "countpages", "listshadow", "listframes", "classifypage", "fingerprintsection", "diffsnapshots", "readselection", "watchfocus", "detectsticky", "detectscrolllock", "readopengraph", "detectlanguage", "deriveselector"];
    for (const kind of kinds) expect(actionrisk(kind)).toBe("read");
  });

  it("modes every observation kind as passive, watching or diffing", () => {
    expect(observationmodeof("a11ytree")).toBe("passive");
    expect(observationmodeof("detecttables")).toBe("passive");
    expect(observationmodeof("watchmutate")).toBe("watching");
    expect(observationmodeof("watchbanner")).toBe("watching");
    expect(observationmodeof("watchfocus")).toBe("watching");
    expect(observationmodeof("waitquiet")).toBe("watching");
    expect(observationmodeof("diffsnapshots")).toBe("diffing");
    expect(iswatchkind("watchmutate")).toBe(true);
    expect(iswatchkind("watchfocus")).toBe(true);
    expect(iswatchkind("watchbanner")).toBe(true);
    expect(iswatchkind("a11ytree")).toBe(false);
    expect(iswatchkind("waitquiet")).toBe(false);
  });

  it("runs passive observation kinds without extra options and targets where reviewed", () => {
    expect(gate({ id: "o1", kind: "a11ytree", summary: "Capture the accessibility tree.", risk: "read" })).toEqual({ allowed: true });
    expect(gate({ id: "o2", kind: "readertree", summary: "Extract the reader view.", risk: "read" })).toEqual({ allowed: true });
    expect(gate({ id: "o3", kind: "readoutline", summary: "Read the heading outline.", risk: "read" })).toEqual({ allowed: true });
    expect(gate({ id: "o4", kind: "readlang", summary: "Read the page language.", risk: "read" })).toEqual({ allowed: true });
    expect(gate({ id: "o5", kind: "listshadow", summary: "List open shadow roots.", risk: "read" })).toEqual({ allowed: true });
    expect(gate({ id: "o6", kind: "listframes", summary: "List the iframes.", risk: "read" })).toEqual({ allowed: true });
    expect(gate({ id: "o7", kind: "readselection", summary: "Read the current selection.", risk: "read" })).toEqual({ allowed: true });
    expect(gate({ id: "o8", kind: "readopengraph", summary: "Read the open graph fields.", risk: "read" })).toEqual({ allowed: true });
    expect(gate({ id: "o9", kind: "readvisible", target: "#main", summary: "Read the visible text.", risk: "read" })).toEqual({ allowed: true });
    expect(gate({ id: "o10", kind: "deriveselector", target: "#checkout", summary: "Derive a stable selector.", risk: "read" })).toEqual({ allowed: true });
    expect(gate({ id: "o11", kind: "fingerprintsection", target: "#prices", summary: "Fingerprint the section.", risk: "read" })).toEqual({ allowed: true });
    expect(gate({ id: "o12", kind: "classifypage", summary: "Classify the page template.", risk: "read" })).toEqual({ allowed: true });
    expect(gate({ id: "o13", kind: "countpages", summary: "Count the pagination.", risk: "read" })).toEqual({ allowed: true });
    expect(gate({ id: "o14", kind: "detectlanguage", summary: "Detect the text language.", risk: "read" })).toEqual({ allowed: true });
  });

  it("requires a reviewed lifetime window for every watch kind", () => {
    const options = "{\"lifetime\":2500}";
    expect(gate({ id: "w1", kind: "watchmutate", summary: "Watch the feed.", risk: "read", options })).toEqual({ allowed: true });
    expect(gate({ id: "w2", kind: "watchfocus", summary: "Watch focus changes.", risk: "read", options })).toEqual({ allowed: true });
    expect(gate({ id: "w3", kind: "watchbanner", summary: "Watch consent banners.", risk: "read", options })).toEqual({ allowed: true });
    expect(gate({ id: "w4", kind: "watchmutate", summary: "Watch without a lifetime.", risk: "read" })).toMatchObject({ allowed: false, reason: "A reviewed watch lifetime window in milliseconds is required in options." });
    expect(gate({ id: "w5", kind: "watchmutate", summary: "Watch with a zero lifetime.", risk: "read", options: "{\"lifetime\":0}" })).toMatchObject({ allowed: false, reason: "A reviewed watch lifetime window in milliseconds is required in options." });
    expect(gate({ id: "w6", kind: "watchmutate", summary: "Watch with a huge reviewed lifetime.", risk: "read", options: "{\"lifetime\":3600000}" })).toEqual({ allowed: true });
    expect(gate({ id: "w7", kind: "watchmutate", summary: "Watch with reviewed scopes and event filters.", risk: "read", options: "{\"lifetime\":1000,\"scopes\":[\"#feed\"],\"events\":[\"childList\"],\"poll\":120}" })).toEqual({ allowed: true });
    expect(gate({ id: "w8", kind: "watchmutate", summary: "Watch with a broken scope list.", risk: "read", options: "{\"lifetime\":1000,\"scopes\":\"#feed\"}" })).toMatchObject({ allowed: false, reason: "The reviewed watch scopes must be a list of non-empty selectors." });
    expect(gate({ id: "w9", kind: "watchmutate", summary: "Watch with a broken event filter list.", risk: "read", options: "{\"lifetime\":1000,\"events\":[\"\"]}" })).toMatchObject({ allowed: false, reason: "The reviewed watch event kinds must be a list of non-empty strings." });
    expect(gate({ id: "w10", kind: "watchmutate", summary: "Watch with a negative poll interval.", risk: "read", options: "{\"lifetime\":1000,\"poll\":-5}" })).toMatchObject({ allowed: false, reason: "The reviewed watch poll interval must be zero or a positive number of milliseconds." });
  });

  it("validates the reviewed quiet rule without any code ceiling", () => {
    expect(gate({ id: "q1", kind: "waitquiet", summary: "Wait for network quiet.", risk: "read", options: "{\"quietrule\":{\"idle\":500,\"poll\":100,\"timeout\":8000}}" })).toEqual({ allowed: true });
    expect(gate({ id: "q2", kind: "waitquiet", summary: "Wait with an unbounded timeout.", risk: "read", options: "{\"quietrule\":{\"idle\":500}}" })).toEqual({ allowed: true });
    expect(gate({ id: "q3", kind: "waitquiet", summary: "Wait with a huge reviewed idle threshold.", risk: "read", options: "{\"quietrule\":{\"idle\":600000}}" })).toEqual({ allowed: true });
    expect(gate({ id: "q4", kind: "waitquiet", summary: "Wait without a quiet rule.", risk: "read" })).toMatchObject({ allowed: false, reason: "A reviewed quietrule with an idle threshold is required in options." });
    expect(gate({ id: "q5", kind: "waitquiet", summary: "Wait with a zero idle threshold.", risk: "read", options: "{\"quietrule\":{\"idle\":0}}" })).toMatchObject({ allowed: false, reason: "The reviewed quiet idle threshold must be a positive number of milliseconds with no code ceiling." });
    expect(gate({ id: "q6", kind: "waitquiet", summary: "Wait with a negative poll.", risk: "read", options: "{\"quietrule\":{\"idle\":500,\"poll\":-1}}" })).toMatchObject({ allowed: false, reason: "The reviewed quiet poll interval must be zero or a positive number of milliseconds." });
    expect(gate({ id: "q7", kind: "waitquiet", summary: "Wait with a negative timeout.", risk: "read", options: "{\"quietrule\":{\"idle\":500,\"timeout\":-2}}" })).toMatchObject({ allowed: false, reason: "The reviewed quiet timeout must be zero or a positive number of milliseconds." });
  });

  it("requires exactly two reviewed observation versions for diffsnapshots", () => {
    expect(gate({ id: "d1", kind: "diffsnapshots", summary: "Diff two observation versions.", risk: "read", options: "{\"versions\":[2,3]}" })).toEqual({ allowed: true });
    expect(gate({ id: "d2", kind: "diffsnapshots", summary: "Diff without versions.", risk: "read" })).toMatchObject({ allowed: false, reason: "Two reviewed observation version numbers are required in options." });
    expect(gate({ id: "d3", kind: "diffsnapshots", summary: "Diff with one version.", risk: "read", options: "{\"versions\":[2]}" })).toMatchObject({ allowed: false, reason: "Two reviewed observation version numbers are required in options." });
    expect(gate({ id: "d4", kind: "diffsnapshots", summary: "Diff with a zero version.", risk: "read", options: "{\"versions\":[0,3]}" })).toMatchObject({ allowed: false, reason: "Two reviewed observation version numbers are required in options." });
  });

  it("gates the json state read behind the session origin grants", () => {
    const readjson: toolstep = { id: "j1", kind: "readjson", summary: "Read the embedded json state.", risk: "read" };
    expect(gate(readjson)).toEqual({ allowed: true });
    const outsidegrants: agentsession = { ...session, grants: ["https://other.example"] };
    expect(gate(readjson, outsidegrants)).toMatchObject({ allowed: false, reason: "The json state read is outside the session origin grants." });
  });
});

describe("navigation mastery policy", () => {
  const origin = "https://example.com";

  function gate(step: toolstep, input?: { session?: agentsession; planstate?: typeof plan.state; verdicts?: Array<{ url: string; safe: boolean; reasons: string[]; at: number }> }): { allowed: boolean; reason?: string } {
    return canexecute({
      session: input?.session ?? { ...session, grants: ["https://example.com", "https://granted.example"] },
      plan: input?.planstate ? { ...plan, state: input.planstate } : plan,
      step,
      tabid: 4,
      origin,
      now,
      ...(input?.verdicts ? { verdicts: input.verdicts } : {}),
    });
  }

  it("grades the sensitive navigation kinds and the read only navigation detection kinds", () => {
    const sensitivekinds: actionkind[] = ["openlink", "openprivate", "reloadcache", "stopnav", "followlink", "spanav", "rewritequery", "setfragment", "navlist", "navprofile", "handleauth", "printpdf", "prefetch", "preconnect", "deeplink", "reopentab", "pausenav", "navrate", "openclipboard", "batchopen"];
    for (const kind of sensitivekinds) expect(actionrisk(kind)).toBe("sensitive");
    const readkinds: actionkind[] = ["waitload", "waiturl", "spawait", "detecthttp", "readredirects", "readfinalurl", "trailaudit", "navintent", "checksafe"];
    for (const kind of readkinds) expect(actionrisk(kind)).toBe("read");
  });

  it("requires a reviewed navtarget for openlink and openprivate and keeps the private container exclusive", () => {
    expect(gate({ id: "n1", kind: "openlink", summary: "Open the reviewed url in a new tab.", risk: "sensitive", options: "{\"navtarget\":{\"url\":\"https://example.com/pricing\",\"container\":\"tab\"}}" })).toEqual({ allowed: true });
    expect(gate({ id: "n2", kind: "openlink", summary: "Open without a navtarget.", risk: "sensitive" })).toMatchObject({ allowed: false, reason: "A reviewed navtarget with a url is required in options." });
    expect(gate({ id: "n3", kind: "openlink", summary: "Open an http url.", risk: "sensitive", options: "{\"navtarget\":{\"url\":\"http://example.com\",\"container\":\"tab\"}}" })).toMatchObject({ allowed: false, reason: "The reviewed navtarget url must use HTTPS." });
    expect(gate({ id: "n4", kind: "openlink", summary: "Open the private container.", risk: "sensitive", options: "{\"navtarget\":{\"url\":\"https://example.com\",\"container\":\"private\"}}" })).toMatchObject({ allowed: false, reason: "The openlink step cannot open the private container; use openprivate." });
    expect(gate({ id: "n5", kind: "openprivate", summary: "Open the reviewed url in a private window.", risk: "sensitive", options: "{\"navtarget\":{\"url\":\"https://example.com\",\"container\":\"private\"}}" })).toEqual({ allowed: true });
    expect(gate({ id: "n6", kind: "openprivate", summary: "Open privately without the private container.", risk: "sensitive", options: "{\"navtarget\":{\"url\":\"https://example.com\",\"container\":\"tab\"}}" })).toMatchObject({ allowed: false, reason: "The openprivate step requires the private container." });
  });

  it("requires an approved session before a navlist run starts", () => {
    const navlist: toolstep = { id: "n7", kind: "navlist", summary: "Navigate the reviewed urls.", risk: "sensitive", options: "{\"urls\":[\"https://example.com/a\",\"https://example.com/b\"]}" };
    expect(gate(navlist)).toEqual({ allowed: true });
    expect(gate(navlist, { planstate: "pending" })).toMatchObject({ allowed: false, reason: "The plan has not received explicit approval." });
    expect(gate({ id: "n8", kind: "navlist", summary: "Navigate without urls.", risk: "sensitive" })).toMatchObject({ allowed: false, reason: "A reviewed non-empty list of HTTPS urls is required in options as urls." });
  });

  it("blocks navigation away from the task tab until the user consents through a session grant", () => {
    const navlist: toolstep = { id: "n9", kind: "navlist", summary: "Leave the granted origins.", risk: "sensitive", options: "{\"urls\":[\"https://example.com/a\",\"https://stranger.example/b\"]}" };
    expect(gate(navlist)).toMatchObject({ allowed: false, reason: "Navigation to https://stranger.example leaves the task tab origins and needs the user consent of a session grant first." });
    const grantedsession: agentsession = { ...session, grants: ["https://example.com", "https://stranger.example"] };
    expect(gate(navlist, { session: grantedsession })).toEqual({ allowed: true });
  });

  it("requires checksafe verification before an unreviewed origin opens", () => {
    const openlink: toolstep = { id: "n10", kind: "openlink", summary: "Open an unreviewed origin.", risk: "sensitive", options: "{\"navtarget\":{\"url\":\"https://stranger.example/report\",\"container\":\"tab\"}}" };
    expect(gate(openlink)).toMatchObject({ allowed: false, reason: expect.stringContaining("outside the session grants and has no safe checksafe verdict") });
    expect(gate(openlink, { verdicts: [{ url: "https://stranger.example/report", safe: true, reasons: [], at: 1 }] })).toEqual({ allowed: true });
    expect(gate(openlink, { verdicts: [{ url: "https://stranger.example/report", safe: false, reasons: ["the host is a private network target"], at: 1 }] })).toMatchObject({ allowed: false });
  });

  it("keeps the navigation rate window a user configured choice with no hardcoded cap", () => {
    const navrate: toolstep = { id: "n11", kind: "navrate", summary: "Apply the reviewed rate limit.", risk: "sensitive", options: "{\"ratelimit\":{\"domain\":\"example.com\",\"window\":600000,\"ceiling\":3}}" };
    expect(gate(navrate)).toEqual({ allowed: true });
    expect(gate({ id: "n12", kind: "navrate", summary: "Apply a huge reviewed window.", risk: "sensitive", options: "{\"ratelimit\":{\"window\":86400000,\"ceiling\":100000}}" })).toEqual({ allowed: true });
    expect(gate({ id: "n13", kind: "navrate", summary: "Apply without a limit.", risk: "sensitive" })).toMatchObject({ allowed: false, reason: "A reviewed ratelimit with a window and a ceiling is required in options." });
    expect(gate({ id: "n14", kind: "navrate", summary: "Apply with a zero window.", risk: "sensitive", options: "{\"ratelimit\":{\"window\":0,\"ceiling\":3}}" })).toMatchObject({ allowed: false, reason: "The reviewed ratelimit window must be a positive number of milliseconds with no code ceiling." });
    expect(gate({ id: "n15", kind: "navrate", summary: "Apply with a zero ceiling.", risk: "sensitive", options: "{\"ratelimit\":{\"window\":1000,\"ceiling\":0}}" })).toMatchObject({ allowed: false, reason: "The reviewed ratelimit ceiling must be a positive integer with no code ceiling." });
  });

  it("validates the waitprofile and urlpattern grammars of the navigation family", () => {
    const navprofile: toolstep = { id: "n16", kind: "navprofile", summary: "Apply the per site wait profile.", risk: "sensitive", options: "{\"waitprofile\":{\"signals\":[\"load\",\"networkidle\"],\"idle\":500,\"overrides\":[{\"origin\":\"https://slow.example\",\"idle\":1500}]}}" };
    expect(gate(navprofile)).toEqual({ allowed: true });
    expect(gate({ id: "n17", kind: "navprofile", summary: "Apply without signals.", risk: "sensitive", options: "{\"waitprofile\":{\"idle\":500}}" })).toMatchObject({ allowed: false, reason: "The reviewed waitprofile needs a non-empty list of load signals." });
    expect(gate({ id: "n18", kind: "waiturl", summary: "Wait for the reviewed pattern.", risk: "read", options: "{\"urlpattern\":{\"mode\":\"prefix\",\"url\":\"https://example.com/results\",\"query\":{\"page\":\"*\"}},\"timeout\":4000}" })).toEqual({ allowed: true });
    expect(gate({ id: "n19", kind: "waiturl", summary: "Wait without a pattern.", risk: "read" })).toMatchObject({ allowed: false, reason: "A reviewed urlpattern is required in options." });
    expect(gate({ id: "n20", kind: "waiturl", summary: "Wait with a broken mode.", risk: "read", options: "{\"urlpattern\":{\"mode\":\"glob\",\"url\":\"https://example.com\"}}" })).toMatchObject({ allowed: false, reason: "The reviewed urlpattern mode must be exact, prefix, host or pattern." });
    expect(gate({ id: "n21", kind: "waitload", summary: "Wait for the load event.", risk: "read", options: "{\"timeout\":3000}" })).toEqual({ allowed: true });
    expect(gate({ id: "n22", kind: "spawait", summary: "Wait for the spa route change.", risk: "read", options: "{\"timeout\":2000,\"poll\":50}" })).toEqual({ allowed: true });
  });

  it("validates the query, fragment, link and deep link grammars", () => {
    expect(gate({ id: "n23", kind: "rewritequery", summary: "Rewrite the query parameters.", risk: "sensitive", options: "{\"set\":{\"page\":\"3\"},\"remove\":[\"session\"]}" })).toEqual({ allowed: true });
    expect(gate({ id: "n24", kind: "rewritequery", summary: "Rewrite without edits.", risk: "sensitive" })).toMatchObject({ allowed: false, reason: "Reviewed query parameters to set or remove are required in options." });
    expect(gate({ id: "n25", kind: "setfragment", value: "pricing", summary: "Set the reviewed fragment.", risk: "sensitive" })).toEqual({ allowed: true });
    expect(gate({ id: "n26", kind: "followlink", value: "Read the docs", summary: "Follow the reviewed link.", risk: "sensitive" })).toEqual({ allowed: true });
    expect(gate({ id: "n27", kind: "followlink", value: "Read the docs", summary: "Follow by fragment.", risk: "sensitive", options: "{\"fragment\":true}" })).toEqual({ allowed: true });
    expect(gate({ id: "n28", kind: "followlink", value: "Read the docs", summary: "Follow with a broken fragment flag.", risk: "sensitive", options: "{\"fragment\":\"yes\"}" })).toMatchObject({ allowed: false, reason: "The reviewed followlink fragment flag must be a boolean." });
    expect(gate({ id: "n29", kind: "spanav", value: "Open settings", summary: "Route the single page app.", risk: "sensitive", options: "{\"routepattern\":{\"mode\":\"prefix\",\"url\":\"https://example.com/settings\"},\"timeout\":2500}" })).toEqual({ allowed: true });
    expect(gate({ id: "n30", kind: "deeplink", summary: "Build the deep link.", risk: "sensitive", options: "{\"app\":\"github\",\"params\":{\"owner\":\"wenathlan\",\"repo\":\"extension\"},\"navtarget\":{\"url\":\"https://example.com\",\"container\":\"tab\"}}" })).toEqual({ allowed: true });
    expect(gate({ id: "n31", kind: "deeplink", summary: "Build without an app.", risk: "sensitive", options: "{\"navtarget\":{\"url\":\"https://example.com\",\"container\":\"tab\"}}" })).toMatchObject({ allowed: false, reason: "A reviewed deep link app pattern is required in options." });
  });

  it("validates the auth, print, prefetch, preconnect, clipboard and batch grammars", () => {
    expect(gate({ id: "n32", kind: "handleauth", value: "https://example.com", summary: "Answer the basic auth prompt.", risk: "sensitive" })).toEqual({ allowed: true });
    expect(gate({ id: "n33", kind: "handleauth", value: "http://example.com", summary: "Answer without https.", risk: "sensitive" })).toMatchObject({ allowed: false, reason: "A reviewed HTTPS origin or url is required as the auth target." });
    expect(gate({ id: "n34", kind: "printpdf", summary: "Print the page to pdf.", risk: "sensitive", options: "{\"name\":\"report.pdf\"}" })).toEqual({ allowed: true });
    expect(gate({ id: "n35", kind: "prefetch", summary: "Prefetch the predicted pages.", risk: "sensitive", options: "{\"urls\":[\"https://example.com/next\"]}" })).toEqual({ allowed: true });
    expect(gate({ id: "n36", kind: "prefetch", summary: "Prefetch without urls.", risk: "sensitive" })).toMatchObject({ allowed: false, reason: "A reviewed non-empty list of HTTPS urls is required in options as urls." });
    expect(gate({ id: "n37", kind: "preconnect", summary: "Preconnect to the expected origins.", risk: "sensitive", options: "{\"origins\":[\"https://cdn.example\",\"https://api.example\"]}" })).toEqual({ allowed: true });
    expect(gate({ id: "n38", kind: "preconnect", summary: "Preconnect without origins.", risk: "sensitive" })).toMatchObject({ allowed: false, reason: "A reviewed non-empty list of HTTPS origins is required in options." });
    expect(gate({ id: "n39", kind: "openclipboard", value: "clipboard url", summary: "Open the clipboard url on consent.", risk: "sensitive" })).toEqual({ allowed: true });
    expect(gate({ id: "n40", kind: "checksafe", value: "https://example.com/report", summary: "Verify the url safety.", risk: "read" })).toEqual({ allowed: true });
    expect(gate({ id: "n41", kind: "checksafe", value: "http://example.com", summary: "Verify without https.", risk: "read" })).toMatchObject({ allowed: false, reason: "A reviewed HTTPS url is required for the safety check." });
    expect(gate({ id: "n42", kind: "batchopen", summary: "Open the curated list.", risk: "sensitive", options: "{\"urls\":[\"https://example.com/a\",\"https://example.com/b\"]}" })).toEqual({ allowed: true });
  });

  it("maps the navigation kinds to the optional tabs and clipboard capabilities", () => {
    expect(requiredcapability("openlink")).toBe("tabs");
    expect(requiredcapability("openprivate")).toBe("tabs");
    expect(requiredcapability("navlist")).toBe("tabs");
    expect(requiredcapability("batchopen")).toBe("tabs");
    expect(requiredcapability("reopentab")).toBe("tabs");
    expect(requiredcapability("deeplink")).toBe("tabs");
    expect(requiredcapability("openclipboard")).toBe("clipboardRead");
    expect(requiredcapability("followlink")).toBeUndefined();
    expect(requiredcapability("waitload")).toBeUndefined();
  });
});

describe("policy tabs and windows command", () => {
  it("grades the tabs and windows command kinds with fixed risk levels", () => {
    expect(actionrisk("querytabs")).toBe("read");
    expect(actionrisk("watchtab")).toBe("read");
    expect(actionrisk("findclones")).toBe("read");
    expect(actionrisk("searchtabs")).toBe("read");
    expect(actionrisk("listaudio")).toBe("read");
    expect(actionrisk("snapshotsession")).toBe("read");
    expect(actionrisk("savelayout")).toBe("read");
    expect(actionrisk("attachmeta")).toBe("read");
    expect(actionrisk("closepattern")).toBe("sensitive");
    expect(actionrisk("discardtab")).toBe("sensitive");
    expect(actionrisk("incognitowindow")).toBe("sensitive");
    expect(actionrisk("scratchwindow")).toBe("sensitive");
    expect(actionrisk("duplicatetab")).toBe("sensitive");
    expect(actionrisk("pintab")).toBe("sensitive");
    expect(actionrisk("movetabwindow")).toBe("sensitive");
    expect(actionrisk("restorelayout")).toBe("sensitive");
    expect(actionrisk("badgetab")).toBe("sensitive");
    expect(actionrisk("switchtab")).toBe("sensitive");
    expect(actionrisk("maximizewindow")).toBe("sensitive");
  });

  it("maps the tabs and windows command family to the optional tabs capability and layout kinds", () => {
    for (const kind of ["querytabs", "duplicatetab", "closepattern", "pintab", "mutetab", "movetab", "movetabwindow", "grouptabs", "colorgroup", "collapsegroup", "discardtab", "reloadtabs", "zoomin", "zoomout", "watchtab", "switchtab", "maximizewindow", "minimizewindow", "restorewindow", "focuswindow", "scratchwindow", "incognitowindow", "restoretab", "savelayout", "restorelayout", "findclones", "searchtabs", "badgetab", "attachmeta", "listaudio", "reopenrun", "snapshotsession"] as const) {
      expect(requiredcapability(kind)).toBe("tabs");
    }
    expect(istabscommandkind("grouptabs")).toBe(true);
    expect(istabscommandkind("click")).toBe(false);
    expect(islayoutkind("savelayout")).toBe(true);
    expect(islayoutkind("restorelayout")).toBe(true);
    expect(islayoutkind("grouptabs")).toBe(true);
    expect(islayoutkind("querytabs")).toBe(false);
  });

  it("requires review before closing a window that holds more than one task tab", () => {
    expect(windowclosegate(2, false)).toMatchObject({ allowed: false, reason: expect.stringContaining("2 task tabs") });
    expect(windowclosegate(2, true)).toEqual({ allowed: true });
    expect(windowclosegate(1, false)).toEqual({ allowed: true });
    expect(windowclosegate(0, false)).toEqual({ allowed: true });
  });

  it("restricts group and layout mutations to the active session", () => {
    expect(layoutmutationgranted(undefined, now)).toMatchObject({ allowed: false, reason: "Group and layout mutations stay inside the active session." });
    expect(layoutmutationgranted({ ...session, stoppedat: now - 1 }, now)).toMatchObject({ allowed: false });
    expect(layoutmutationgranted({ ...session, expiresat: now - 1 }, now)).toMatchObject({ allowed: false });
    expect(layoutmutationgranted(session, now)).toEqual({ allowed: true });
  });

  it("validates the tabquery grammar of the querytabs family", () => {
    expect(validatetabquery({ pattern: "https://example.com/**" })).toEqual({ allowed: true });
    expect(validatetabquery({ url: "https://example.com/a", title: "report" })).toEqual({ allowed: true });
    expect(validatetabquery({})).toMatchObject({ allowed: false, reason: "The reviewed tabquery needs a url, title, id or pattern matcher." });
    expect(validatetabquery({ id: -1 })).toMatchObject({ allowed: false });
    expect(validatetabquery({ id: 1.5 })).toMatchObject({ allowed: false });
    expect(validatetabquery({ url: "  " })).toMatchObject({ allowed: false });
    expect(validatetabquery("https://example.com")).toMatchObject({ allowed: false });
  });

  it("validates the tab and window command grammars of pin, mute, move, group, switch and zoom kinds", () => {
    const gate = (step: toolstep): { allowed: boolean; reason?: string } => validatestep(step, "https://example.com");
    expect(gate({ id: "w1", kind: "pintab", value: "12", summary: "Pin the tab.", risk: "sensitive", options: "{\"pinned\":true}" })).toEqual({ allowed: true });
    expect(gate({ id: "w2", kind: "pintab", value: "12", summary: "Pin without a flag.", risk: "sensitive" })).toMatchObject({ allowed: false, reason: "A reviewed pinned flag is required in options." });
    expect(gate({ id: "w3", kind: "mutetab", value: "12", summary: "Mute without a flag.", risk: "sensitive", options: "{\"muted\":\"yes\"}" })).toMatchObject({ allowed: false, reason: "A reviewed muted flag is required in options." });
    expect(gate({ id: "w4", kind: "movetab", value: "12", summary: "Move without an index.", risk: "sensitive" })).toMatchObject({ allowed: false, reason: "A reviewed non-negative target index is required in options." });
    expect(gate({ id: "w5", kind: "movetabwindow", value: "12", summary: "Move across windows.", risk: "sensitive", options: "{\"windowid\":3}" })).toEqual({ allowed: true });
    expect(gate({ id: "w6", kind: "movetabwindow", value: "12", summary: "Move without a window.", risk: "sensitive" })).toMatchObject({ allowed: false, reason: "A reviewed target window id is required in options." });
    expect(gate({ id: "w7", kind: "grouptabs", summary: "Group the research tabs.", risk: "sensitive", options: "{\"group\":{\"name\":\"research\",\"color\":\"blue\",\"tabids\":[1,2]}}" })).toEqual({ allowed: true });
    expect(gate({ id: "w8", kind: "grouptabs", summary: "Group with a bad color.", risk: "sensitive", options: "{\"group\":{\"name\":\"research\",\"color\":\"chartreuse\",\"tabids\":[1]}}" })).toMatchObject({ allowed: false, reason: "The reviewed group color must be a Chromium tab group color." });
    expect(gate({ id: "w9", kind: "colorgroup", summary: "Color the group.", risk: "sensitive", options: "{\"name\":\"research\",\"color\":\"pink\"}" })).toEqual({ allowed: true });
    expect(gate({ id: "w10", kind: "collapsegroup", summary: "Collapse the group.", risk: "sensitive", options: "{\"name\":\"research\",\"collapsed\":true}" })).toEqual({ allowed: true });
    expect(gate({ id: "w11", kind: "switchtab", summary: "Switch without a direction.", risk: "sensitive" })).toMatchObject({ allowed: false, reason: "A reviewed switch direction of next or previous is required in options." });
    expect(gate({ id: "w12", kind: "switchtab", summary: "Switch to the next tab.", risk: "sensitive", options: "{\"direction\":\"next\"}" })).toEqual({ allowed: true });
    expect(gate({ id: "w13", kind: "zoomin", summary: "Zoom in by the step.", risk: "sensitive", options: "{\"step\":0.25}" })).toEqual({ allowed: true });
    expect(gate({ id: "w14", kind: "zoomout", summary: "Zoom out by a bad step.", risk: "sensitive", options: "{\"step\":0}" })).toMatchObject({ allowed: false, reason: "The reviewed zoom step must be a positive number with no code ceiling." });
  });

  it("validates the badge, meta, restore, layout, reopen and incognito grammars", () => {
    const gate = (step: toolstep): { allowed: boolean; reason?: string } => validatestep(step, "https://example.com");
    expect(gate({ id: "b1", kind: "badgetab", value: "7", summary: "Badge the tab.", risk: "sensitive", options: "{\"label\":\"3/5\"}" })).toEqual({ allowed: true });
    expect(gate({ id: "b2", kind: "badgetab", value: "7", summary: "Badge without a label.", risk: "sensitive" })).toMatchObject({ allowed: false, reason: "A reviewed badge label is required in options." });
    expect(gate({ id: "b3", kind: "attachmeta", value: "7", summary: "Attach metadata.", risk: "read", options: "{\"labels\":[\"research\"],\"taskrefs\":[\"plan-1\"]}" })).toEqual({ allowed: true });
    expect(gate({ id: "b4", kind: "attachmeta", value: "7", summary: "Attach nothing.", risk: "read" })).toMatchObject({ allowed: false, reason: "Reviewed labels or task refs are required in options to attach metadata." });
    expect(gate({ id: "b5", kind: "restoretab", value: "https://example.com/closed", summary: "Restore the closed tab.", risk: "sensitive" })).toEqual({ allowed: true });
    expect(gate({ id: "b6", kind: "restoretab", value: "http://example.com/closed", summary: "Restore an insecure url.", risk: "sensitive" })).toMatchObject({ allowed: false });
    expect(gate({ id: "b7", kind: "savelayout", summary: "Save the layout.", risk: "read", options: "{\"name\":\"work\"}" })).toEqual({ allowed: true });
    expect(gate({ id: "b8", kind: "restorelayout", summary: "Restore without a name.", risk: "sensitive" })).toMatchObject({ allowed: false, reason: "A reviewed layout name is required in options." });
    expect(gate({ id: "b9", kind: "reopenrun", summary: "Reopen the run.", risk: "sensitive", options: "{\"run\":\"session-42\"}" })).toEqual({ allowed: true });
    expect(gate({ id: "b10", kind: "reopenrun", summary: "Reopen without a run.", risk: "sensitive" })).toMatchObject({ allowed: false, reason: "A reviewed run id is required in options to reopen its tabs." });
    expect(gate({ id: "b11", kind: "incognitowindow", value: "https://example.com/private", summary: "Open the private window.", risk: "sensitive" })).toEqual({ allowed: true });
    expect(gate({ id: "b12", kind: "incognitowindow", value: "http://example.com/private", summary: "Open an insecure window.", risk: "sensitive" })).toMatchObject({ allowed: false, reason: "A reviewed HTTPS url is required to open an incognito window." });
    expect(gate({ id: "b13", kind: "searchtabs", value: "quarterly report", summary: "Search the open tabs.", risk: "read" })).toEqual({ allowed: true });
    expect(gate({ id: "b14", kind: "watchtab", summary: "Watch tab events.", risk: "read", options: "{\"lifetime\":5000,\"events\":[\"title\",\"closed\"]}" })).toEqual({ allowed: true });
    expect(gate({ id: "b15", kind: "watchtab", summary: "Watch without a lifetime.", risk: "read" })).toMatchObject({ allowed: false, reason: "A reviewed watch lifetime window in milliseconds is required in options." });
  });

  it("runs a reviewed group mutation inside the session gates and refuses it outside an approved plan", () => {
    const groupstep: toolstep = { id: "g1", kind: "grouptabs", summary: "Group the research tabs.", risk: "sensitive", options: "{\"group\":{\"name\":\"research\",\"color\":\"blue\",\"tabids\":[4]}}" };
    expect(canexecute({ session, plan, step: groupstep, tabid: 4, origin: "https://example.com", now })).toEqual({ allowed: true });
    expect(canexecute({ session, plan: { ...plan, state: "pending" }, step: groupstep, tabid: 4, origin: "https://example.com", now })).toMatchObject({ allowed: false, reason: "The plan has not received explicit approval." });
    expect(canexecute({ session, plan, step: { ...groupstep, options: "{\"group\":{\"name\":\"research\",\"color\":\"blue\"}}" }, tabid: 4, origin: "https://example.com", now })).toMatchObject({ allowed: false, reason: "The reviewed group needs a non-empty list of member tab ids." });
  });

  it("keeps the concurrent task tab ceiling a user configured choice with no code cap", () => {
    expect(tasktabceiling(undefined)).toBeUndefined();
    expect(tasktabceiling({})).toBeUndefined();
    expect(tasktabceiling({ tasktabceiling: 6 })).toBe(6);
    expect(tasktabceiling({ tasktabceiling: 100000 })).toBe(100000);
    expect(tasktabceiling({ tasktabceiling: -1 })).toBeUndefined();
    expect(tasktabceiling({ tasktabceiling: Number.NaN })).toBeUndefined();
  });

  it("grades the forms and data family with sensitive fills and read only inspection", () => {
    for (const kind of ["fillform", "filllabel", "fillplaceholder", "submitform", "retryform", "runwizard", "selectchain", "picktypeahead", "pickdate", "attachfile", "fillcard", "fillcode", "consentpassword"]) expect(actionrisk(kind as actionkind)).toBe("sensitive");
    for (const kind of ["detectfields", "generatevalues", "saveprofiles", "asksubmit", "readerrors", "skiphoneypot", "detectlogin", "detecttemplate", "handoffcaptcha"]) expect(actionrisk(kind as actionkind)).toBe("read");
    expect(isformkind("fillform")).toBe(true);
    expect(isformkind("click")).toBe(false);
    expect(requiredcapability("fillform")).toBeUndefined();
  });

  it("requires an asksubmit review before every form submission", () => {
    const ask: toolstep = { id: "ask", kind: "asksubmit", value: "#checkout", summary: "Ask before submitting.", risk: "read" };
    const submit: toolstep = { id: "submit", kind: "submitform", target: "#checkout", summary: "Submit the form.", risk: "sensitive", options: "{\"consentref\":\"ask\"}" };
    expect(submitreviewgranted([ask, submit], "submit")).toEqual({ allowed: true });
    expect(submitreviewgranted([submit], "submit")).toMatchObject({ allowed: false, reason: "Form submission requires an asksubmit review step before it." });
    expect(submitreviewgranted([submit, ask], "submit")).toMatchObject({ allowed: false });
    expect(canexecute({ session, plan: { ...plan, steps: [submit] }, step: submit, tabid: 4, origin: "https://example.com", now })).toMatchObject({ allowed: false, reason: "Form submission requires an asksubmit review step before it." });
    expect(canexecute({ session, plan: { ...plan, steps: [ask, submit] }, step: submit, tabid: 4, origin: "https://example.com", now })).toEqual({ allowed: true });
  });

  it("requires explicit consent before any password field is filled", () => {
    const password: toolstep = { id: "pw", kind: "consentpassword", target: "#password", value: "reviewed-secret", summary: "Fill the password after consent.", risk: "sensitive" };
    expect(passwordconsentgranted(password)).toMatchObject({ allowed: false, reason: "A password fill requires a reviewed consent ref in options." });
    expect(passwordconsentgranted({ ...password, options: "{\"consentref\":\"consent-1\"}" })).toEqual({ allowed: true });
    expect(canexecute({ session, plan: { ...plan, steps: [password] }, step: password, tabid: 4, origin: "https://example.com", now })).toMatchObject({ allowed: false });
    const consented = { ...password, options: "{\"consentref\":\"consent-1\"}" };
    expect(canexecute({ session, plan: { ...plan, steps: [consented] }, step: consented, tabid: 4, origin: "https://example.com", now })).toEqual({ allowed: true });
    expect(validateformrecord({ entries: [{ match: { mode: "name", name: "password" }, kind: "password", value: "x" }] })).toMatchObject({ allowed: false, reason: expect.stringContaining("consentpassword") });
    const fill: toolstep = { id: "fill", kind: "fillform", summary: "Fill the form.", risk: "sensitive", options: JSON.stringify({ formrecord: { entries: [{ match: { mode: "name", name: "password" }, kind: "password", value: "x" }] } }) };
    expect(validatestep(fill, "https://example.com")).toMatchObject({ allowed: false, reason: expect.stringContaining("Password entries are refused") });
  });

  it("refuses generated values that look like real card numbers or personal identifiers", () => {
    expect(generatedvalueallowed("4539 1488 0343 6467")).toMatchObject({ allowed: false, reason: expect.stringContaining("real card number") });
    expect(generatedvalueallowed("4532015112830366")).toMatchObject({ allowed: false });
    expect(generatedvalueallowed("4242424242424242")).toMatchObject({ allowed: false });
    expect(generatedvalueallowed("4111 1111 1111 1111")).toEqual({ allowed: true });
    expect(generatedvalueallowed("123-45-6789")).toMatchObject({ allowed: false, reason: expect.stringContaining("personal identifier") });
    expect(generatedvalueallowed("Ana Alves")).toEqual({ allowed: true });
    expect(generatedvalueallowed("+1 (555) 010-0192")).toEqual({ allowed: true });
    expect(generatedvalueallowed("ana.alves23@example.com")).toEqual({ allowed: true });
  });

  it("validates the form record, value rule and field pair grammars", () => {
    const gate = (step: toolstep): policyevaluation => validatestep(step, "https://example.com");
    const record = { form: "#checkout", entries: [{ match: { mode: "label", label: "Full name" }, kind: "text", value: "Ana Alves" }, { match: { mode: "name", name: "email" }, kind: "email", value: "ana@example.com" }] };
    expect(gate({ id: "f1", kind: "fillform", summary: "Fill the checkout form.", risk: "sensitive", options: JSON.stringify({ formrecord: record }) })).toEqual({ allowed: true });
    expect(gate({ id: "f2", kind: "fillform", summary: "No record.", risk: "sensitive" })).toMatchObject({ allowed: false, reason: "A reviewed form record with entries is required in options." });
    expect(gate({ id: "f3", kind: "fillform", summary: "Empty entries.", risk: "sensitive", options: "{\"formrecord\":{\"entries\":[]}}" })).toMatchObject({ allowed: false });
    expect(gate({ id: "f4", kind: "fillform", summary: "Unknown kind.", risk: "sensitive", options: JSON.stringify({ formrecord: { entries: [{ match: { mode: "label", label: "x" }, kind: "blob", value: "y" }] } }) })).toMatchObject({ allowed: false, reason: "Every reviewed form record entry needs a known field kind." });
    expect(gate({ id: "l1", kind: "filllabel", summary: "Fill by label.", risk: "sensitive", options: "{\"fields\":[{\"label\":\"Full name\",\"value\":\"Ana Alves\"}]}" })).toEqual({ allowed: true });
    expect(gate({ id: "l2", kind: "filllabel", summary: "Missing label.", risk: "sensitive", options: "{\"fields\":[{\"value\":\"Ana\"}]}" })).toMatchObject({ allowed: false });
    expect(gate({ id: "p1", kind: "fillplaceholder", summary: "Fill by placeholder.", risk: "sensitive", options: "{\"fields\":[{\"placeholder\":\"you@example.org\",\"value\":\"ana@example.com\"}]}" })).toEqual({ allowed: true });
    expect(gate({ id: "g1", kind: "generatevalues", summary: "Generate an email.", risk: "read", options: "{\"valuegen\":{\"kind\":\"email\",\"locale\":\"pt\",\"seed\":7}}" })).toEqual({ allowed: true });
    expect(gate({ id: "g2", kind: "generatevalues", summary: "Bad seed.", risk: "read", options: "{\"valuegen\":{\"kind\":\"email\",\"seed\":\"seven\"}}" })).toMatchObject({ allowed: false });
    expect(validatevaluegen({ kind: "text" })).toEqual({ allowed: true });
    expect(validatefieldmatch({ mode: "arialabel", arialabel: "Card number" })).toEqual({ allowed: true });
    expect(validatefieldmatch({ mode: "arialabel" })).toMatchObject({ allowed: false });
    expect(validateformrecord(record)).toEqual({ allowed: true });
  });

  it("validates the submission, retry, chain, typeahead, calendar, card, code and profile grammars", () => {
    const gate = (step: toolstep): policyevaluation => validatestep(step, "https://example.com");
    expect(gate({ id: "s1", kind: "submitform", target: "#checkout", summary: "Submit.", risk: "sensitive" })).toMatchObject({ allowed: false, reason: "A reviewed consent ref of an approved asksubmit ticket is required in options." });
    expect(gate({ id: "s2", kind: "submitform", target: "#checkout", summary: "Submit.", risk: "sensitive", options: "{\"consentref\":\"ask\"}" })).toEqual({ allowed: true });
    expect(gate({ id: "r1", kind: "retryform", target: "#checkout", summary: "Retry.", risk: "sensitive", options: "{\"backoff\":{\"wait\":500,\"factor\":2},\"attempts\":4}" })).toEqual({ allowed: true });
    expect(gate({ id: "r2", kind: "retryform", target: "#checkout", summary: "Zero wait.", risk: "sensitive", options: "{\"backoff\":{\"wait\":0,\"factor\":2}}" })).toMatchObject({ allowed: false });
    expect(gate({ id: "r3", kind: "retryform", target: "#checkout", summary: "Shrinking factor.", risk: "sensitive", options: "{\"backoff\":{\"wait\":500,\"factor\":0.5}}" })).toMatchObject({ allowed: false });
    expect(gate({ id: "r4", kind: "retryform", target: "#checkout", summary: "Huge windows are a user choice.", risk: "sensitive", options: "{\"backoff\":{\"wait\":600000,\"factor\":10},\"attempts\":1000}" })).toEqual({ allowed: true });
    expect(gate({ id: "c1", kind: "selectchain", target: "#country", value: "br", summary: "Chain the states.", risk: "sensitive", options: "{\"child\":\"#state\"}" })).toEqual({ allowed: true });
    expect(gate({ id: "c2", kind: "selectchain", target: "#country", value: "br", summary: "No child.", risk: "sensitive" })).toMatchObject({ allowed: false });
    expect(gate({ id: "t1", kind: "picktypeahead", target: "#city", value: "sao", summary: "Pick the city.", risk: "sensitive", options: "{\"pick\":\"São Paulo\"}" })).toEqual({ allowed: true });
    expect(gate({ id: "t2", kind: "picktypeahead", target: "#city", value: "sao", summary: "No pick.", risk: "sensitive" })).toMatchObject({ allowed: false });
    expect(gate({ id: "d1", kind: "pickdate", target: "#calendar", value: "2025-04-08", summary: "Pick the date.", risk: "sensitive" })).toEqual({ allowed: true });
    expect(gate({ id: "d2", kind: "pickdate", target: "#calendar", value: "08/04/2025", summary: "Bad date form.", risk: "sensitive" })).toMatchObject({ allowed: false });
    expect(gate({ id: "k1", kind: "fillcard", summary: "Fill the card.", risk: "sensitive", options: JSON.stringify({ segments: [{ match: { mode: "label", label: "Card number" }, value: "4111 1111 1111 1111" }], pause: 80 }) })).toEqual({ allowed: true });
    expect(gate({ id: "k2", kind: "fillcard", summary: "Empty segments.", risk: "sensitive", options: "{\"segments\":[]}" })).toMatchObject({ allowed: false });
    expect(gate({ id: "o1", kind: "fillcode", target: "#code", value: "123456", summary: "Type the code.", risk: "sensitive", options: "{\"source\":\"reviewed\"}" })).toEqual({ allowed: true });
    expect(gate({ id: "o2", kind: "fillcode", target: "#code", value: "123456", summary: "No source.", risk: "sensitive" })).toMatchObject({ allowed: false });
    expect(gate({ id: "a1", kind: "attachfile", target: "#receipt", value: "report.pdf", summary: "Attach the artifact.", risk: "sensitive" })).toEqual({ allowed: true });
    expect(gate({ id: "w1", kind: "runwizard", summary: "Advance the wizard.", risk: "sensitive", options: "{\"steps\":3}" })).toEqual({ allowed: true });
    expect(gate({ id: "w2", kind: "runwizard", summary: "Bad step count.", risk: "sensitive", options: "{\"steps\":0}" })).toMatchObject({ allowed: false });
    expect(gate({ id: "v1", kind: "saveprofiles", summary: "Save the profile.", risk: "read", options: JSON.stringify({ name: "personal", formrecord: { entries: [{ match: { mode: "label", label: "Full name" }, kind: "text", value: "Ana Alves" }] } }) })).toEqual({ allowed: true });
    expect(gate({ id: "v2", kind: "saveprofiles", summary: "No name.", risk: "read", options: "{\"formrecord\":{\"entries\":[{\"match\":{\"mode\":\"label\",\"label\":\"Full name\"},\"kind\":\"text\",\"value\":\"Ana\"}]}}" })).toMatchObject({ allowed: false });
  });

  it("requires profile origin grants before a profile fills a page", () => {
    const profile: formprofile = { name: "personal", fields: [{ match: { mode: "label", label: "Full name" }, kind: "text", value: "Ana Alves" }], grants: ["https://example.com"], savedat: 10 };
    expect(profilegrantgranted(profile, "https://example.com")).toEqual({ allowed: true });
    expect(profilegrantgranted(profile, "https://other.example")).toMatchObject({ allowed: false, reason: expect.stringContaining("not granted") });
  });

  it("grades the extraction family: exports, streaming and pagination stay sensitive while inspection stays read only", () => {
    for (const kind of ["exportcsv", "exportjson", "exportexcel", "copytable", "pushsheets", "streamdisk", "paginateextract", "resumeextract"] as const) {
      expect(actionrisk(kind)).toBe("sensitive");
      expect(isdatasetkind(kind)).toBe(true);
    }
    for (const kind of ["scrapetable", "importcsv", "looprows", "transformvalues", "deduperows", "mergepages", "stamplerows", "previewgrid", "logprovenance"] as const) {
      expect(actionrisk(kind)).toBe("read");
      expect(isdatasetkind(kind)).toBe(true);
    }
    expect(isdatasetkind("click")).toBe(false);
    expect(isexportkind("exportcsv")).toBe(true);
    expect(isexportkind("scrapetable")).toBe(false);
    expect(requiredcapability("copytable")).toBe("clipboardWrite");
    expect(requiredcapability("scrapetable")).toBeUndefined();
  });

  it("refuses exports outside the session origin grants before any data leaves local memory", () => {
    const exportstep: toolstep = { id: "export", kind: "exportcsv", summary: "Export the scraped dataset.", risk: "sensitive", options: "{\"dataset\":\"d1\"}" };
    expect(exportgranted(session, "https://example.com")).toEqual({ allowed: true });
    expect(exportgranted(session, "https://other.example")).toMatchObject({ allowed: false, reason: expect.stringContaining("origin grants") });
    expect(canexecute({ session: { ...session, grants: ["https://data.example"] }, plan, step: exportstep, tabid: 4, origin: "https://example.com", now })).toMatchObject({ allowed: false, reason: expect.stringContaining("leaves local memory") });
    expect(canexecute({ session, plan, step: exportstep, tabid: 4, origin: "https://example.com", now })).toEqual({ allowed: true });
  });

  it("validates the extraction, transform, export and provenance grammar with no code ceilings", () => {
    const gate = (step: toolstep): policyevaluation => validatestep(step, "https://example.com");
    expect(gate({ id: "s1", kind: "scrapetable", target: "table.prices", summary: "Scrape the table.", risk: "read", options: "{\"rowlimit\":5000}" })).toEqual({ allowed: true });
    expect(gate({ id: "s2", kind: "scrapetable", summary: "No table target.", risk: "read" })).toMatchObject({ allowed: false, reason: "A page target is required." });
    expect(gate({ id: "s3", kind: "scrapetable", target: "table", summary: "Bad row limit.", risk: "read", options: "{\"rowlimit\":0}" })).toMatchObject({ allowed: false });
    expect(gate({ id: "p1", kind: "paginateextract", target: "table", summary: "Follow the pages.", risk: "sensitive", options: "{\"next\":\"a.next\",\"pages\":900,\"wait\":400}" })).toEqual({ allowed: true });
    expect(gate({ id: "p2", kind: "paginateextract", target: "table", summary: "No next selector.", risk: "sensitive" })).toMatchObject({ allowed: false, reason: "A reviewed next control selector is required in options." });
    expect(gate({ id: "p3", kind: "paginateextract", target: "table", summary: "Bad pages.", risk: "sensitive", options: "{\"next\":\"a.next\",\"pages\":0}" })).toMatchObject({ allowed: false });
    expect(gate({ id: "e1", kind: "exportcsv", summary: "Export csv.", risk: "sensitive", options: "{\"dataset\":\"d1\",\"delimiter\":\";\",\"name\":\"catalog\"}" })).toEqual({ allowed: true });
    expect(gate({ id: "e2", kind: "exportcsv", summary: "No dataset.", risk: "sensitive" })).toMatchObject({ allowed: false, reason: "A reviewed dataset id is required in options." });
    expect(gate({ id: "e3", kind: "exportcsv", summary: "Bad delimiter.", risk: "sensitive", options: "{\"dataset\":\"d1\",\"delimiter\":\";;\"}" })).toMatchObject({ allowed: false });
    expect(gate({ id: "x1", kind: "exportexcel", summary: "Export excel.", risk: "sensitive", options: "{\"dataset\":\"d1\"}" })).toEqual({ allowed: true });
    expect(gate({ id: "c1", kind: "copytable", summary: "Copy the table.", risk: "sensitive", options: "{\"dataset\":\"d1\"}" })).toEqual({ allowed: true });
    expect(gate({ id: "k1", kind: "streamdisk", summary: "Stream huge extracts.", risk: "sensitive", options: "{\"dataset\":\"d1\",\"chunk\":100000}" })).toEqual({ allowed: true });
    expect(gate({ id: "k2", kind: "streamdisk", summary: "No chunk size.", risk: "sensitive", options: "{\"dataset\":\"d1\"}" })).toMatchObject({ allowed: false, reason: "The reviewed streaming chunk size must be a positive integer with no code ceiling." });
    expect(gate({ id: "h1", kind: "pushsheets", summary: "Push the sheet.", risk: "sensitive", options: "{\"dataset\":\"d1\",\"sheet\":\"https://sheets.example/tab\",\"reviewed\":true}" })).toEqual({ allowed: true });
    expect(gate({ id: "h2", kind: "pushsheets", summary: "Missing reviewed flag.", risk: "sensitive", options: "{\"dataset\":\"d1\",\"sheet\":\"https://sheets.example/tab\"}" })).toMatchObject({ allowed: false, reason: expect.stringContaining("reviewed flag") });
    expect(gate({ id: "h3", kind: "pushsheets", summary: "HTTP sheet.", risk: "sensitive", options: "{\"dataset\":\"d1\",\"sheet\":\"http://sheets.example\",\"reviewed\":true}" })).toMatchObject({ allowed: false, reason: expect.stringContaining("HTTPS") });
    expect(gate({ id: "i1", kind: "importcsv", summary: "Import the csv.", risk: "read", options: "{\"csv\":\"name,price\\nDesk,10\",\"mapping\":{\"name\":\"sku\"}}" })).toEqual({ allowed: true });
    expect(gate({ id: "i2", kind: "importcsv", summary: "Empty csv.", risk: "read", options: "{\"csv\":\" \"}" })).toMatchObject({ allowed: false });
    expect(gate({ id: "l1", kind: "looprows", summary: "Loop the rows.", risk: "read", options: "{\"dataset\":\"d1\",\"kind\":\"filllabel\",\"target\":\"form\",\"options\":{\"fields\":[{\"label\":\"{{name}}\",\"value\":\"{{price}}\"}]}}" })).toEqual({ allowed: true });
    expect(gate({ id: "l2", kind: "looprows", summary: "No inner step.", risk: "read", options: "{\"dataset\":\"d1\"}" })).toMatchObject({ allowed: false, reason: "A reviewed step id or inline step kind is required in options." });
    expect(gate({ id: "l3", kind: "looprows", summary: "Nested loop.", risk: "read", options: "{\"dataset\":\"d1\",\"kind\":\"looprows\"}" })).toMatchObject({ allowed: false, reason: "The reviewed inner step cannot be another wrapper kind." });
    expect(gate({ id: "t1", kind: "transformvalues", summary: "Transform values.", risk: "read", options: "{\"dataset\":\"d1\",\"rules\":[{\"expression\":\"replace:$=>\",\"sources\":[\"price\"],\"target\":\"price\"}]}" })).toEqual({ allowed: true });
    expect(gate({ id: "t2", kind: "transformvalues", summary: "Bad expression.", risk: "read", options: "{\"dataset\":\"d1\",\"rules\":[{\"expression\":\"explode\",\"sources\":[\"price\"],\"target\":\"price\"}]}" })).toMatchObject({ allowed: false, reason: expect.stringContaining("expression") });
    expect(gate({ id: "t3", kind: "transformvalues", summary: "Empty sources.", risk: "read", options: "{\"dataset\":\"d1\",\"rules\":[{\"expression\":\"trim\",\"sources\":[],\"target\":\"price\"}]}" })).toMatchObject({ allowed: false });
    expect(validatetransformrule({ expression: "replace:usd=>$", sources: ["price"], target: "price" })).toEqual({ allowed: true });
    expect(validatetransformrule({ expression: "replace:=>x", sources: ["price"], target: "price" })).toMatchObject({ allowed: false });
    expect(gate({ id: "d1", kind: "deduperows", summary: "Dedupe rows.", risk: "read", options: "{\"dataset\":\"d1\",\"keys\":[\"sku\"]}" })).toEqual({ allowed: true });
    expect(gate({ id: "d2", kind: "deduperows", summary: "No keys.", risk: "read", options: "{\"dataset\":\"d1\",\"keys\":[]}" })).toMatchObject({ allowed: false });
    expect(gate({ id: "m1", kind: "mergepages", summary: "Merge the pages.", risk: "read", options: "{\"datasets\":[\"d1\",\"d2\"]}" })).toEqual({ allowed: true });
    expect(gate({ id: "m2", kind: "mergepages", summary: "One dataset.", risk: "read", options: "{\"datasets\":[\"d1\"]}" })).toEqual({ allowed: true });
    expect(gate({ id: "m3", kind: "mergepages", summary: "No datasets.", risk: "read" })).toMatchObject({ allowed: false });
    expect(gate({ id: "a1", kind: "stamplerows", summary: "Stamp the rows.", risk: "read", options: "{\"dataset\":\"d1\",\"url\":\"https://example.com/list\"}" })).toEqual({ allowed: true });
    expect(gate({ id: "g1", kind: "previewgrid", summary: "Preview the grid.", risk: "read", options: "{\"dataset\":\"d1\",\"sample\":25}" })).toEqual({ allowed: true });
    expect(gate({ id: "g2", kind: "previewgrid", summary: "Bad sample.", risk: "read", options: "{\"dataset\":\"d1\",\"sample\":0}" })).toMatchObject({ allowed: false });
    expect(gate({ id: "r1", kind: "resumeextract", summary: "Resume the extraction.", risk: "sensitive", options: "{\"session\":\"e1\"}" })).toEqual({ allowed: true });
    expect(gate({ id: "r2", kind: "resumeextract", summary: "No session id.", risk: "sensitive" })).toMatchObject({ allowed: false });
    expect(gate({ id: "v1", kind: "logprovenance", summary: "Log provenance.", risk: "read", options: "{\"artifact\":\"catalog.csv\"}" })).toEqual({ allowed: true });
    expect(gate({ id: "v2", kind: "logprovenance", summary: "No artifact.", risk: "read" })).toMatchObject({ allowed: false });
  });
});

describe("files, clipboard and downloads policy", () => {
  const origin = "https://example.com";

  function gate(step: toolstep, localsession: agentsession = session): policyevaluation {
    return canexecute({ session: localsession, plan, step, tabid: 4, origin, now });
  }

  it("grades the files family: clipboard, quarantine and file mutations stay sensitive while inspection stays read only", () => {
    for (const kind of ["batchdownload", "pausedownload", "resumedownload", "interceptmime", "readclipboard", "writeclipboard", "copyscreen", "quarantinedownload", "scanvirus", "cleanupartifacts"] as const) {
      expect(actionrisk(kind)).toBe("sensitive");
      expect(isfileskind(kind)).toBe(true);
    }
    for (const kind of ["verifydownload", "exportnetlog", "namecaptures"] as const) {
      expect(actionrisk(kind)).toBe("read");
      expect(isfileskind(kind)).toBe(true);
    }
    expect(isfileskind("click")).toBe(false);
  });

  it("negotiates the optional downloads and clipboard capabilities per kind", () => {
    expect(requiredcapability("batchdownload")).toBe("downloads");
    expect(requiredcapability("pausedownload")).toBe("downloads");
    expect(requiredcapability("resumedownload")).toBe("downloads");
    expect(requiredcapability("verifydownload")).toBe("downloads");
    expect(requiredcapability("interceptmime")).toBe("downloads");
    expect(requiredcapability("quarantinedownload")).toBe("downloads");
    expect(requiredcapability("scanvirus")).toBe("downloads");
    expect(requiredcapability("readclipboard")).toBe("clipboardRead");
    expect(requiredcapability("writeclipboard")).toBe("clipboardWrite");
    expect(requiredcapability("copyscreen")).toBe("clipboardWrite");
    expect(requiredcapability("exportnetlog")).toBeUndefined();
    expect(requiredcapability("namecaptures")).toBeUndefined();
    expect(requiredcapability("cleanupartifacts")).toBeUndefined();
  });

  it("validates the downloadspec, mimefilter and cleanuprule grammars with no code ceilings", () => {
    expect(validatedownloadspec({ urls: ["https://example.com/a.pdf", "https://example.com/b.zip"], filename: "report", complete: "checksum" })).toEqual({ allowed: true });
    expect(validatedownloadspec({ urls: [] })).toMatchObject({ allowed: false });
    expect(validatedownloadspec({ urls: ["http://example.com/a.pdf"] })).toMatchObject({ allowed: false, reason: expect.stringContaining("HTTPS") });
    expect(validatedownloadspec({ urls: ["https://example.com/a.pdf"], complete: "sha" })).toMatchObject({ allowed: false });
    expect(validatemimefilter({ include: ["application/pdf*"], exclude: [], default: "deny" })).toEqual({ allowed: true });
    expect(validatemimefilter({ exclude: [], default: "deny" })).toMatchObject({ allowed: false, reason: expect.stringContaining("include") });
    expect(validatemimefilter({ include: ["text/*"], exclude: [], default: "block" })).toMatchObject({ allowed: false, reason: expect.stringContaining("deny or allow") });
    expect(validatecleanuprule({ age: 86_400_000, kind: "any", keep: "latest" })).toEqual({ allowed: true });
    expect(validatecleanuprule({ age: 0, kind: "any", keep: "none" })).toMatchObject({ allowed: false, reason: expect.stringContaining("no code ceiling") });
    expect(validatecleanuprule({ age: 1000, kind: "", keep: "none" })).toMatchObject({ allowed: false });
    expect(validatecleanuprule({ age: 1000, kind: "any", keep: "newest" })).toMatchObject({ allowed: false });
  });

  it("validates the files grammar: batch references, consent refs, capture naming and cleanup rules", () => {
    expect(gate({ id: "b1", kind: "batchdownload", summary: "Download the batch.", risk: "sensitive", options: JSON.stringify({ downloadspec: { urls: ["https://example.com/a.pdf"], filename: "report", complete: "size" }, concurrent: 25 }) })).toEqual({ allowed: true });
    expect(gate({ id: "b2", kind: "batchdownload", summary: "No spec.", risk: "sensitive" })).toMatchObject({ allowed: false, reason: expect.stringContaining("downloadspec") });
    expect(gate({ id: "b3", kind: "batchdownload", summary: "Zero concurrent window.", risk: "sensitive", options: "{\"downloadspec\":{\"urls\":[\"https://example.com/a.pdf\"]},\"concurrent\":0}" })).toMatchObject({ allowed: false, reason: expect.stringContaining("concurrent") });
    expect(gate({ id: "b4", kind: "batchdownload", summary: "Huge batch is a user choice.", risk: "sensitive", options: "{\"downloadspec\":{\"urls\":[\"https://example.com/a.pdf\",\"https://example.com/b.pdf\"]},\"concurrent\":10000}" })).toEqual({ allowed: true });
    expect(gate({ id: "p1", kind: "pausedownload", value: "report.pdf", summary: "Pause the download.", risk: "sensitive" })).toEqual({ allowed: true });
    expect(gate({ id: "p2", kind: "pausedownload", summary: "Pause without a reference.", risk: "sensitive" })).toMatchObject({ allowed: false, reason: "A reviewed value is required." });
    expect(gate({ id: "v1", kind: "verifydownload", value: "report.pdf", summary: "Verify the download.", risk: "read", options: "{\"bytes\":2048,\"checksum\":\"fnv1a-abc\"}" })).toEqual({ allowed: true });
    expect(gate({ id: "v2", kind: "verifydownload", value: "report.pdf", summary: "Negative size.", risk: "read", options: "{\"bytes\":-1}" })).toMatchObject({ allowed: false });
    expect(gate({ id: "i1", kind: "interceptmime", summary: "Intercept pdf downloads.", risk: "sensitive", options: "{\"mimefilter\":{\"include\":[\"application/pdf*\"],\"exclude\":[],\"default\":\"deny\"}}" })).toEqual({ allowed: true });
    expect(gate({ id: "i2", kind: "interceptmime", summary: "Missing filter.", risk: "sensitive" })).toMatchObject({ allowed: false, reason: expect.stringContaining("mimefilter") });
    expect(gate({ id: "n1", kind: "namecaptures", summary: "Name the captures.", risk: "read", options: "{\"task\":\"task-1\",\"steps\":[\"snap\",\"peek\"],\"extension\":\"png\"}" })).toEqual({ allowed: true });
    expect(gate({ id: "n2", kind: "namecaptures", summary: "No task.", risk: "read" })).toMatchObject({ allowed: false, reason: "A reviewed task id is required in options for capture naming." });
    expect(gate({ id: "c1", kind: "cleanupartifacts", summary: "Sweep old artifacts.", risk: "sensitive", options: "{\"rules\":[{\"age\":60000,\"kind\":\"any\",\"keep\":\"latest\"}]}" })).toEqual({ allowed: true });
    expect(gate({ id: "c2", kind: "cleanupartifacts", summary: "Empty rules.", risk: "sensitive", options: "{\"rules\":[]}" })).toMatchObject({ allowed: false });
    expect(gate({ id: "w1", kind: "writeclipboard", value: "Reviewed summary text.", summary: "Write the clipboard.", risk: "sensitive" })).toEqual({ allowed: true });
    expect(gate({ id: "s1", kind: "scanvirus", value: "q-1", summary: "Scan the quarantined file.", risk: "sensitive", options: "{\"scanner\":\"clamav\"}" })).toEqual({ allowed: true });
    expect(gate({ id: "e1", kind: "exportnetlog", summary: "Export the netlog.", risk: "read", options: "{\"stepid\":\"nav-1\"}" })).toEqual({ allowed: true });
  });

  it("requires an approved consent prompt per clipboard read", () => {
    const read: toolstep = { id: "r1", kind: "readclipboard", summary: "Read the clipboard once.", risk: "sensitive" };
    expect(clipboardconsentgranted(read)).toMatchObject({ allowed: false, reason: "A clipboard read requires a reviewed consent ref in options." });
    expect(gate(read)).toMatchObject({ allowed: false, reason: "A clipboard read requires a reviewed consent ref in options." });
    const consented = { ...read, options: "{\"consentref\":\"clip-1\",\"prompt\":\"Read the tracking number.\"}" };
    expect(clipboardconsentgranted(consented)).toEqual({ allowed: true });
    expect(gate(consented)).toEqual({ allowed: true });
    const declinedprompt = { ...read, options: "{\"consentref\":\"clip-1\",\"prompt\":\" \"}" };
    expect(gate(declinedprompt)).toMatchObject({ allowed: false, reason: expect.stringContaining("prompt") });
  });

  it("refuses download interception outside the session origin grants and gates downloads by origin", () => {
    const intercept: toolstep = { id: "i1", kind: "interceptmime", summary: "Intercept pdf downloads.", risk: "sensitive", options: "{\"mimefilter\":{\"include\":[\"application/pdf*\"],\"exclude\":[],\"default\":\"deny\"}}" };
    expect(gate(intercept, { ...session, grants: ["https://other.example"] })).toMatchObject({ allowed: false, reason: "The download interception is outside the session origin grants." });
    expect(gate(intercept)).toEqual({ allowed: true });
    expect(downloadgranted(session, "https://example.com/file.pdf")).toEqual({ allowed: true });
    expect(downloadgranted({ ...session, grants: ["https://data.example"] }, "https://example.com/file.pdf")).toMatchObject({ allowed: false, reason: expect.stringContaining("origin grants") });
    expect(downloadgranted(session, "not a url")).toMatchObject({ allowed: false, reason: "The reviewed download URL is invalid." });
  });

  it("releases quarantined files only after a clean scan verdict", () => {
    const base = { id: "q1", path: "devthink-quarantine/invoice.pdf", reason: "reviewed quarantine", at: 5, updatedat: 5 };
    expect(quarantinereleasegranted({ ...base, scan: "pending" })).toMatchObject({ allowed: false, reason: expect.stringContaining("pending") });
    expect(quarantinereleasegranted({ ...base, scan: "flagged" })).toMatchObject({ allowed: false });
    expect(quarantinereleasegranted({ ...base, scan: "error" })).toMatchObject({ allowed: false });
    expect(quarantinereleasegranted({ ...base, scan: "clean" })).toEqual({ allowed: true });
  });

  it("masks clipboard payloads so logs never carry their text", () => {
    expect(maskclipboard("tracking 12345678")).toBe("[clipboard payload of 17 characters]");
    expect(maskclipboard("x")).toBe("[clipboard payload of 1 character]");
    expect(maskclipboard("")).toBe("[clipboard payload of 0 characters]");
    expect(maskclipboard("secret-value")).not.toContain("secret");
  });
});

describe("media capture policy", () => {
  const gate = (step: toolstep): policyevaluation => validatestep(step, "https://example.com");
  const now = 1_800_000_000_000;
  const session: agentsession = { id: "session", tabid: 4, origin: "https://example.com", startedat: now, expiresat: now + 1000 };

  it("grades every capture kind read only and validates the options payload of every capture kind", () => {
    expect(actionrisk("shotview")).toBe("read");
    expect(actionrisk("shotfullpage")).toBe("read");
    expect(actionrisk("shotelement")).toBe("read");
    expect(actionrisk("shotregion")).toBe("read");
    expect(actionrisk("contactsheet")).toBe("read");
    expect(iscapturekind("shotview")).toBe(true);
    expect(iscapturekind("click")).toBe(false);
    expect(gate({ id: "v1", kind: "shotview", summary: "Shoot the viewport.", risk: "read", options: "{\"capture\":{\"format\":\"png\",\"quality\":92,\"pixelratio\":2,\"annotate\":true,\"exporttarget\":\"memory\"}}" })).toEqual({ allowed: true });
    expect(gate({ id: "v2", kind: "shotview", summary: "Shoot with a huge ratio.", risk: "read", options: "{\"capture\":{\"pixelratio\":8}}" })).toEqual({ allowed: true });
    expect(gate({ id: "v3", kind: "shotview", summary: "Bad format.", risk: "read", options: "{\"capture\":{\"format\":\"gif\"}}" })).toMatchObject({ allowed: false, reason: "The reviewed capture format must be png, jpeg or webp." });
    expect(gate({ id: "v4", kind: "shotview", summary: "Quality above the format range.", risk: "read", options: "{\"capture\":{\"quality\":140}}" })).toMatchObject({ allowed: false, reason: expect.stringContaining("no code cap") });
    expect(gate({ id: "v5", kind: "shotview", summary: "Ratio below one.", risk: "read", options: "{\"capture\":{\"pixelratio\":0.5}}" })).toMatchObject({ allowed: false, reason: expect.stringContaining("no code ceiling") });
    expect(gate({ id: "v6", kind: "shotview", summary: "Unknown export target.", risk: "read", options: "{\"capture\":{\"exporttarget\":\"disk\"}}" })).toMatchObject({ allowed: false, reason: expect.stringContaining("memory, download or clipboard") });
    expect(gate({ id: "f1", kind: "shotfullpage", summary: "Shoot the full page.", risk: "read", options: "{\"settle\":200,\"overlap\":40,\"wait\":60000}" })).toEqual({ allowed: true });
    expect(gate({ id: "f2", kind: "shotfullpage", summary: "Negative settle.", risk: "read", options: "{\"settle\":-1}" })).toMatchObject({ allowed: false, reason: expect.stringContaining("settle") });
    expect(gate({ id: "f3", kind: "shotfullpage", summary: "Fractional overlap.", risk: "read", options: "{\"overlap\":1.5}" })).toMatchObject({ allowed: false, reason: expect.stringContaining("overlap") });
    expect(gate({ id: "e1", kind: "shotelement", target: "#card", summary: "Shoot the element.", risk: "read", options: "{\"capture\":{\"format\":\"webp\",\"exporttarget\":\"clipboard\"}}" })).toEqual({ allowed: true });
    expect(gate({ id: "e2", kind: "shotelement", summary: "Element without a target.", risk: "read" })).toMatchObject({ allowed: false, reason: "A page target is required." });
    expect(gate({ id: "s1", kind: "shotregion", summary: "Shoot the reviewed region.", risk: "read", options: "{\"regionrect\":{\"x\":10,\"y\":20,\"width\":400,\"height\":300},\"reviewed\":true}" })).toEqual({ allowed: true });
    expect(gate({ id: "s2", kind: "shotregion", summary: "Region without the reviewed flag.", risk: "read", options: "{\"regionrect\":{\"x\":10,\"y\":20,\"width\":400,\"height\":300}}" })).toMatchObject({ allowed: false, reason: "Every reviewed regionrect needs the explicit reviewed flag before shotregion runs." });
    expect(gate({ id: "s3", kind: "shotregion", summary: "Negative coordinates.", risk: "read", options: "{\"regionrect\":{\"x\":-5,\"y\":20,\"width\":400,\"height\":300},\"reviewed\":true}" })).toMatchObject({ allowed: false, reason: "The reviewed regionrect refuses negative coordinates." });
    expect(gate({ id: "s4", kind: "shotregion", summary: "Empty rect.", risk: "read", options: "{\"regionrect\":{\"x\":0,\"y\":0,\"width\":0,\"height\":10},\"reviewed\":true}" })).toMatchObject({ allowed: false, reason: expect.stringContaining("positive width and height") });
    expect(gate({ id: "s5", kind: "shotregion", summary: "Scrollable container.", risk: "read", options: "{\"regionrect\":{\"x\":0,\"y\":0,\"width\":600,\"height\":400},\"reviewed\":true,\"container\":\"#feed\",\"steps\":9}" })).toEqual({ allowed: true });
    expect(gate({ id: "c1", kind: "contactsheet", summary: "Tile the element captures.", risk: "read", options: "{\"elements\":[\"#a\",\"#b\",\"#c\"],\"sheet\":{\"cellsize\":240,\"columns\":4,\"label\":\"both\"}}" })).toEqual({ allowed: true });
    expect(gate({ id: "c2", kind: "contactsheet", summary: "No elements.", risk: "read" })).toMatchObject({ allowed: false, reason: expect.stringContaining("element selectors") });
    expect(gate({ id: "c3", kind: "contactsheet", summary: "Bad label style.", risk: "read", options: "{\"elements\":[\"#a\"],\"sheet\":{\"cellsize\":240,\"columns\":3,\"label\":\"fancy\"}}" })).toMatchObject({ allowed: false, reason: expect.stringContaining("label style") });
    expect(gate({ id: "c4", kind: "contactsheet", summary: "Huge cell counts stay a user choice.", risk: "read", options: "{\"elements\":[\"#a\",\"#b\"],\"sheet\":{\"cellsize\":800,\"columns\":50,\"label\":\"index\"}}" })).toEqual({ allowed: true });
  });

  it("requires the active tab grant of the live session for every capture kind", () => {
    expect(capturegate(session, 4, "https://example.com", now)).toEqual({ allowed: true });
    expect(capturegate(session, 9, "https://example.com", now)).toMatchObject({ allowed: false, reason: expect.stringContaining("active tab grant") });
    expect(capturegate({ ...session, grants: ["https://other.example"] }, 4, "https://example.com", now)).toMatchObject({ allowed: false, reason: expect.stringContaining("session origin grants") });
    expect(capturegate({ ...session, stoppedat: now }, 4, "https://example.com", now)).toMatchObject({ allowed: false });
    expect(capturegate({ ...session, pausedat: now - 1 }, 4, "https://example.com", now)).toMatchObject({ allowed: false, reason: expect.stringContaining("paused") });
    expect(capturegate({ ...session, expiresat: now - 1 }, 4, "https://example.com", now)).toMatchObject({ allowed: false });
    const shot: toolstep = { id: "v1", kind: "shotview", summary: "Shoot the viewport.", risk: "read" };
    expect(canexecute({ session, plan: { id: "p1", objective: "Shoot", origin: "https://example.com", steps: [shot], createdat: now, expiresat: now + 1000, state: "approved" }, step: shot, tabid: 4, origin: "https://example.com", now })).toEqual({ allowed: true });
    expect(canexecute({ session: { ...session, grants: ["https://other.example"] }, plan: { id: "p1", objective: "Shoot", origin: "https://example.com", steps: [shot], createdat: now, expiresat: now + 1000, state: "approved" }, step: shot, tabid: 4, origin: "https://example.com", now })).toMatchObject({ allowed: false, reason: expect.stringContaining("session origin grants") });
  });

  it("routes capture export targets, keeps stitch budgets inside the reviewed wait window and exposes retention", () => {
    expect(captureexportgranted(undefined)).toEqual({ allowed: true });
    expect(captureexportgranted("memory")).toEqual({ allowed: true });
    expect(captureexportgranted("clipboard")).toMatchObject({ allowed: true, reason: expect.stringContaining("clipboardwrite") });
    expect(captureexportgranted("download")).toMatchObject({ allowed: true, reason: expect.stringContaining("reviewed download flow") });
    expect(captureexportgranted("disk" as never)).toMatchObject({ allowed: false, reason: expect.stringContaining("memory, download or clipboard") });
    expect(stitchbudgetallowed(4, 150, 600)).toEqual({ allowed: true });
    expect(stitchbudgetallowed(4, 150, 599)).toMatchObject({ allowed: false, reason: expect.stringContaining("exceeds the reviewed wait window") });
    expect(stitchbudgetallowed(0, 100, 1000)).toMatchObject({ allowed: false });
    expect(stitchbudgetallowed(3, -1, 1000)).toMatchObject({ allowed: false });
    expect(stitchbudgetallowed(1000, 10, 600_000)).toEqual({ allowed: true });
    expect(captureretentionwindow({ captureretention: 25 })).toBe(25);
    expect(captureretentionwindow(undefined)).toBeUndefined();
    expect(captureretentionwindow({})).toBeUndefined();
  });

  it("validates capture naming rules against the allowed segment set and wraps any existing action kind with state pairs", () => {
    expect(validatecapturenaming({ run: true, step: true, sequence: true, kind: true })).toEqual({ allowed: true });
    expect(validatecapturenaming({ run: false, kind: true })).toEqual({ allowed: true });
    expect(validatecapturenaming({ run: true, pixelratio: true })).toMatchObject({ allowed: false, reason: expect.stringContaining("unknown pixelratio segment") });
    expect(validatecapturenaming({ run: false, step: false, sequence: false, kind: false })).toMatchObject({ allowed: false, reason: expect.stringContaining("at least one enabled segment") });
    expect(validatecapturenaming({ run: "yes" })).toMatchObject({ allowed: false });
    expect(validatecapturenaming("run")).toMatchObject({ allowed: false });
    expect(beforeafterwrapallowed("click")).toBe(true);
    expect(beforeafterwrapallowed("fillform")).toBe(true);
    expect(beforeafterwrapallowed("shotview")).toBe(false);
    expect(validatecaptureoptions(undefined)).toEqual({ allowed: true });
    expect(validatecaptureoptions({ format: "jpeg", quality: 100, pixelratio: 3, annotate: false, exporttarget: "download" })).toEqual({ allowed: true });
    expect(validatecaptureoptions({ quality: -1 })).toMatchObject({ allowed: false });
    expect(validateregionrect({ x: 0, y: 0, width: 10, height: 10 })).toEqual({ allowed: true });
    expect(validateregionrect({ x: 0, y: -2, width: 10, height: 10 })).toMatchObject({ allowed: false, reason: "The reviewed regionrect refuses negative coordinates." });
    expect(validateregionrect({ x: "a", y: 0, width: 10, height: 10 })).toMatchObject({ allowed: false });
  });
});

describe("media capture part two policy", () => {
  const gate = (step: toolstep): policyevaluation => validatestep(step, "https://example.com");
  const now = 1_800_000_000_000;
  const mediasession: agentsession = { id: "session", tabid: 4, origin: "https://example.com", startedat: now, expiresat: now + 1000 };

  it("grades the media family: recordings and image downloads stay sensitive while the rest reads only", () => {
    expect(actionrisk("capturepdf")).toBe("read");
    expect(actionrisk("captureframe")).toBe("read");
    expect(actionrisk("readmedia")).toBe("read");
    expect(actionrisk("readassets")).toBe("read");
    expect(actionrisk("probestream")).toBe("read");
    expect(actionrisk("timelapse")).toBe("read");
    expect(actionrisk("shotcanvas")).toBe("read");
    expect(actionrisk("convertimage")).toBe("read");
    expect(actionrisk("makethumbs")).toBe("read");
    expect(actionrisk("recordscreen")).toBe("sensitive");
    expect(actionrisk("captureaudio")).toBe("sensitive");
    expect(actionrisk("downloadimages")).toBe("sensitive");
    expect(ismediakind("capturepdf")).toBe(true);
    expect(ismediakind("shotview")).toBe(false);
    expect(isrecordingkind("recordscreen")).toBe(true);
    expect(isrecordingkind("captureaudio")).toBe(true);
    expect(isrecordingkind("readmedia")).toBe(false);
    expect(requiredcapability("downloadimages")).toBe("downloads");
    expect(requiredcapability("capturepdf")).toBeUndefined();
  });

  it("requires the active tab grant of the live session for every media kind", () => {
    expect(mediagate(mediasession, 4, "https://example.com", now)).toEqual({ allowed: true });
    expect(mediagate(mediasession, 9, "https://example.com", now)).toMatchObject({ allowed: false, reason: expect.stringContaining("active tab grant") });
    expect(mediagate({ ...mediasession, grants: ["https://other.example"] }, 4, "https://example.com", now)).toMatchObject({ allowed: false, reason: expect.stringContaining("session origin grants") });
    expect(mediagate({ ...mediasession, pausedat: now - 1 }, 4, "https://example.com", now)).toMatchObject({ allowed: false, reason: expect.stringContaining("paused") });
    expect(mediagate({ ...mediasession, expiresat: now - 1 }, 4, "https://example.com", now)).toMatchObject({ allowed: false });
    const shot: toolstep = { id: "p1", kind: "readmedia", summary: "Read the media sources.", risk: "read" };
    expect(canexecute({ session: mediasession, plan: { id: "p1", objective: "Read", origin: "https://example.com", steps: [shot], createdat: now, expiresat: now + 1000, state: "approved" }, step: shot, tabid: 4, origin: "https://example.com", now })).toEqual({ allowed: true });
    expect(canexecute({ session: { ...mediasession, grants: ["https://other.example"] }, plan: { id: "p1", objective: "Read", origin: "https://example.com", steps: [shot], createdat: now, expiresat: now + 1000, state: "approved" }, step: shot, tabid: 4, origin: "https://example.com", now })).toMatchObject({ allowed: false, reason: expect.stringContaining("session origin grants") });
  });

  it("requires a reviewed consent ref before any recording starts and exposes the duration window", () => {
    const recording: toolstep = { id: "r1", kind: "recordscreen", summary: "Record the tab.", risk: "sensitive", options: "{\"consentref\":\"consent-1\"}" };
    expect(recordingconsentgranted(recording)).toEqual({ allowed: true });
    expect(recordingconsentgranted({ ...recording, options: "{\"fps\":2}" })).toMatchObject({ allowed: false, reason: expect.stringContaining("consent ref") });
    expect(recordingconsentgranted({ ...recording, kind: "captureaudio" })).toEqual({ allowed: true });
    expect(recordingwindow({ recordingwindow: 30_000 })).toBe(30_000);
    expect(recordingwindow(undefined)).toBeUndefined();
    expect(recordingwindow({})).toBeUndefined();
    expect(recordingwindow({ recordingwindow: 0 })).toBeUndefined();
    expect(recordingwindow({ recordingwindow: -5 })).toBeUndefined();
  });

  it("validates the pdf grammar: paper sizes, margins, scale, break points and the memory or download export route", () => {
    expect(gate({ id: "pdf1", kind: "capturepdf", summary: "Print the report.", risk: "read", options: "{\"pdf\":{\"paperwidth\":8.5,\"paperheight\":11,\"margins\":{\"top\":0.5,\"right\":0.5,\"bottom\":0.5,\"left\":0.5},\"scale\":1.2,\"landscape\":true,\"paginate\":true},\"breakpoints\":[\"#section-2\"]}" })).toEqual({ allowed: true });
    expect(gate({ id: "pdf2", kind: "capturepdf", summary: "Huge paper stays a user choice.", risk: "read", options: "{\"pdf\":{\"paperwidth\":40,\"paperheight\":80,\"scale\":4}}" })).toEqual({ allowed: true });
    expect(gate({ id: "pdf3", kind: "capturepdf", summary: "Negative margins.", risk: "read", options: "{\"pdf\":{\"margins\":{\"top\":-0.2}}}" })).toMatchObject({ allowed: false, reason: expect.stringContaining("negative margins are refused") });
    expect(gate({ id: "pdf4", kind: "capturepdf", summary: "Zero paper width.", risk: "read", options: "{\"pdf\":{\"paperwidth\":0}}" })).toMatchObject({ allowed: false, reason: expect.stringContaining("paper width") });
    expect(gate({ id: "pdf5", kind: "capturepdf", summary: "Bad scale.", risk: "read", options: "{\"pdf\":{\"scale\":-1}}" })).toMatchObject({ allowed: false, reason: expect.stringContaining("scale") });
    expect(gate({ id: "pdf6", kind: "capturepdf", summary: "Clipboard route.", risk: "read", options: "{\"exporttarget\":\"clipboard\"}" })).toMatchObject({ allowed: false, reason: expect.stringContaining("memory or download") });
    expect(gate({ id: "pdf7", kind: "capturepdf", summary: "Empty break points.", risk: "read", options: "{\"breakpoints\":[]}" })).toMatchObject({ allowed: false, reason: expect.stringContaining("break points") });
    expect(gate({ id: "pdf8", kind: "capturepdf", summary: "Download route.", risk: "read", options: "{\"exporttarget\":\"download\"}" })).toEqual({ allowed: true });
  });

  it("validates the recording, frame, canvas and stream grammars with no code ceilings", () => {
    expect(gate({ id: "rec1", kind: "recordscreen", summary: "Record the tab.", risk: "sensitive", options: "{\"recording\":{\"scope\":\"run\",\"fps\":30,\"bitrate\":8000,\"audio\":true},\"duration\":5000,\"consentref\":\"c1\"}" })).toEqual({ allowed: true });
    expect(gate({ id: "rec2", kind: "recordscreen", summary: "Bad scope.", risk: "sensitive", options: "{\"recording\":{\"scope\":\"screen\"},\"consentref\":\"c1\"}" })).toMatchObject({ allowed: false, reason: expect.stringContaining("scope must be tab or run") });
    expect(gate({ id: "rec3", kind: "recordscreen", summary: "Zero fps.", risk: "sensitive", options: "{\"recording\":{\"fps\":0},\"consentref\":\"c1\"}" })).toMatchObject({ allowed: false, reason: expect.stringContaining("fps") });
    expect(gate({ id: "rec4", kind: "recordscreen", summary: "No consent.", risk: "sensitive", options: "{\"recording\":{\"scope\":\"tab\"}}" })).toMatchObject({ allowed: false, reason: expect.stringContaining("consent ref") });
    expect(gate({ id: "rec5", kind: "captureaudio", summary: "Record the audio.", risk: "sensitive", options: "{\"recording\":{\"audio\":true},\"duration\":1000,\"consentref\":\"c2\"}" })).toEqual({ allowed: true });
    expect(gate({ id: "frame1", kind: "captureframe", target: "video.tutorial", summary: "Grab the frame.", risk: "read", options: "{\"timestamp\":12.5,\"poster\":true,\"capture\":{\"format\":\"webp\"}}" })).toEqual({ allowed: true });
    expect(gate({ id: "frame2", kind: "captureframe", target: "video.tutorial", summary: "Negative timestamp.", risk: "read", options: "{\"timestamp\":-1}" })).toMatchObject({ allowed: false, reason: expect.stringContaining("timestamp") });
    expect(gate({ id: "frame3", kind: "captureframe", summary: "No target.", risk: "read", options: "{\"timestamp\":1}" })).toMatchObject({ allowed: false, reason: "A page target is required." });
    expect(gate({ id: "can1", kind: "shotcanvas", target: "canvas.chart", summary: "Shoot the canvas.", risk: "read", options: "{\"capture\":{\"format\":\"png\"}}" })).toEqual({ allowed: true });
    expect(gate({ id: "can2", kind: "shotcanvas", summary: "No target.", risk: "read" })).toMatchObject({ allowed: false, reason: "A page target is required." });
    expect(gate({ id: "stream1", kind: "probestream", summary: "Probe the streams.", risk: "read" })).toEqual({ allowed: true });
    expect(gate({ id: "stream2", kind: "probestream", summary: "Empty selector.", risk: "read", options: "{\"selector\":\" \"}" })).toMatchObject({ allowed: false, reason: expect.stringContaining("selector") });
    expect(gate({ id: "media1", kind: "readmedia", summary: "Read the sources.", risk: "read" })).toEqual({ allowed: true });
    expect(gate({ id: "assets1", kind: "readassets", summary: "Read the assets.", risk: "read" })).toEqual({ allowed: true });
  });

  it("validates the image filter, lapse budget, conversion and thumbnail grammars", () => {
    expect(gate({ id: "img1", kind: "downloadimages", summary: "Download the images.", risk: "sensitive", options: "{\"imagefilter\":{\"selector\":\"main img\",\"minwidth\":200,\"minheight\":100,\"formats\":[\"png\",\"image/webp\"]},\"naming\":{\"run\":true,\"step\":true,\"sequence\":true,\"kind\":true}}" })).toEqual({ allowed: true });
    expect(gate({ id: "img2", kind: "downloadimages", summary: "No filter.", risk: "sensitive" })).toMatchObject({ allowed: false, reason: expect.stringContaining("imagefilter is required") });
    expect(gate({ id: "img3", kind: "downloadimages", summary: "Empty selector.", risk: "sensitive", options: "{\"imagefilter\":{\"selector\":\"\"}}" })).toMatchObject({ allowed: false, reason: expect.stringContaining("selector grammar") });
    expect(gate({ id: "img4", kind: "downloadimages", summary: "Negative width.", risk: "sensitive", options: "{\"imagefilter\":{\"minwidth\":-1}}" })).toMatchObject({ allowed: false, reason: expect.stringContaining("minimum width") });
    expect(gate({ id: "img5", kind: "downloadimages", summary: "Empty formats.", risk: "sensitive", options: "{\"imagefilter\":{\"formats\":[]}}" })).toMatchObject({ allowed: false, reason: expect.stringContaining("format list") });
    expect(gate({ id: "lapse1", kind: "timelapse", summary: "Shoot the lapse.", risk: "read", options: "{\"lapse\":{\"interval\":500,\"duration\":5000,\"format\":\"webp\"},\"wait\":6000}" })).toEqual({ allowed: true });
    expect(gate({ id: "lapse2", kind: "timelapse", summary: "Duration over budget.", risk: "read", options: "{\"lapse\":{\"interval\":500,\"duration\":5000},\"wait\":4000}" })).toMatchObject({ allowed: false, reason: expect.stringContaining("exceeds the reviewed wait budget") });
    expect(gate({ id: "lapse3", kind: "timelapse", summary: "Negative interval.", risk: "read", options: "{\"lapse\":{\"interval\":-500,\"duration\":5000}}" })).toMatchObject({ allowed: false, reason: expect.stringContaining("interval") });
    expect(gate({ id: "lapse4", kind: "timelapse", summary: "No plan.", risk: "read" })).toMatchObject({ allowed: false, reason: expect.stringContaining("lapse plan") });
    expect(lapsebudgetallowed(500, 5000, 6000)).toEqual({ allowed: true });
    expect(lapsebudgetallowed(500, 5000, 4999)).toMatchObject({ allowed: false });
    expect(lapsebudgetallowed(0, 1000, 1000)).toMatchObject({ allowed: false });
    expect(lapsebudgetallowed(500, 0, 1000)).toMatchObject({ allowed: false });
    expect(lapsebudgetallowed(500, 5000, undefined)).toEqual({ allowed: true });
    expect(gate({ id: "conv1", kind: "convertimage", summary: "Convert the capture.", risk: "read", options: "{\"capture\":\"cap-1\",\"convert\":{\"source\":\"png\",\"target\":\"webp\",\"quality\":85}}" })).toEqual({ allowed: true });
    expect(gate({ id: "conv2", kind: "convertimage", summary: "List of captures.", risk: "read", options: "{\"captures\":[\"cap-1\",\"cap-2\"],\"convert\":{\"target\":\"jpeg\"}}" })).toEqual({ allowed: true });
    expect(gate({ id: "conv3", kind: "convertimage", summary: "Bad target.", risk: "read", options: "{\"capture\":\"cap-1\",\"convert\":{\"target\":\"gif\"}}" })).toMatchObject({ allowed: false, reason: expect.stringContaining("conversion target") });
    expect(gate({ id: "conv4", kind: "convertimage", summary: "No capture.", risk: "read", options: "{\"convert\":{\"target\":\"png\"}}" })).toMatchObject({ allowed: false, reason: expect.stringContaining("capture id") });
    expect(gate({ id: "conv5", kind: "convertimage", summary: "Both id and list.", risk: "read", options: "{\"capture\":\"cap-1\",\"captures\":[\"cap-2\"],\"convert\":{\"target\":\"png\"}}" })).toMatchObject({ allowed: false, reason: expect.stringContaining("not both") });
    expect(gate({ id: "thumb1", kind: "makethumbs", summary: "Thumb the captures.", risk: "read", options: "{\"captures\":[\"cap-1\"],\"thumb\":{\"size\":320,\"fit\":\"cover\",\"suffix\":\"thumb\"}}" })).toEqual({ allowed: true });
    expect(gate({ id: "thumb2", kind: "makethumbs", summary: "Fixed size set stays a user choice.", risk: "read", options: "{\"capture\":\"cap-1\",\"thumb\":{\"size\":1024,\"fit\":\"contain\",\"suffix\":\"small\"}}" })).toEqual({ allowed: true });
    expect(gate({ id: "thumb3", kind: "makethumbs", summary: "Bad fit.", risk: "read", options: "{\"capture\":\"cap-1\",\"thumb\":{\"size\":320,\"fit\":\"stretch\",\"suffix\":\"t\"}}" })).toMatchObject({ allowed: false, reason: expect.stringContaining("fit") });
    expect(gate({ id: "thumb4", kind: "makethumbs", summary: "Zero size.", risk: "read", options: "{\"capture\":\"cap-1\",\"thumb\":{\"size\":0,\"fit\":\"cover\",\"suffix\":\"t\"}}" })).toMatchObject({ allowed: false, reason: expect.stringContaining("size") });
  });
});

describe("network observation part one policy", () => {
  const gate = (step: toolstep): policyevaluation => validatestep(step, "https://example.com");
  const now = 1_800_000_000_000;
  const httpsession: agentsession = { id: "session", tabid: 4, origin: "https://example.com", startedat: now, expiresat: now + 1000 };
  const fetchplan = (step: toolstep): agentplan => ({ id: "p1", objective: "Fetch", origin: "https://example.com", steps: [step], createdat: now, expiresat: now + 1000, state: "approved" });

  it("grades the http family: fetch and parsing read only while typed calls stay sensitive", () => {
    expect(actionrisk("fetchurl")).toBe("read");
    expect(actionrisk("parsejson")).toBe("read");
    expect(actionrisk("parsehtml")).toBe("read");
    expect(actionrisk("callrest")).toBe("sensitive");
    expect(actionrisk("callgraphql")).toBe("sensitive");
    expect(ishttpkind("fetchurl")).toBe(true);
    expect(ishttpkind("callgraphql")).toBe(true);
    expect(ishttpkind("shotview")).toBe(false);
    expect(requiredcapability("fetchurl")).toBeUndefined();
    expect(requiredcapability("callrest")).toBeUndefined();
    const restget: toolstep = { id: "r1", kind: "callrest", summary: "Read the endpoint.", risk: "sensitive", options: "{\"endpoint\":\"issues\"}" };
    const restpost: toolstep = { id: "r2", kind: "callrest", summary: "Create the issue.", risk: "sensitive", options: "{\"endpoint\":\"create\",\"method\":\"POST\"}" };
    const mutation: toolstep = { id: "g1", kind: "callgraphql", summary: "Mutate.", risk: "sensitive", options: "{\"endpoint\":\"graph\",\"graphql\":{\"query\":\"mutation{like}\",\"operationkind\":\"mutation\"}}" };
    const query: toolstep = { id: "g2", kind: "callgraphql", summary: "Query.", risk: "sensitive", options: "{\"endpoint\":\"graph\",\"graphql\":{\"query\":\"query{hero}\",\"operationkind\":\"query\"}}" };
    expect(mutationcallof(restget)).toBe(false);
    expect(mutationcallof(restpost)).toBe(true);
    expect(mutationcallof(mutation)).toBe(true);
    expect(mutationcallof(query)).toBe(false);
    expect(mutationcallof(fetchplan(restget).steps[0] as toolstep)).toBe(false);
  });

  it("restricts every outbound request to granted origins through origincheck", () => {
    expect(origincheck(httpsession, "https://example.com/data")).toEqual({ allowed: true });
    expect(origincheck({ ...httpsession, grants: ["https://api.example"] }, "https://api.example/data")).toEqual({ allowed: true });
    expect(origincheck(httpsession, "https://api.example/data")).toMatchObject({ allowed: false, reason: expect.stringContaining("outside the session origin grants") });
    expect(origincheck(httpsession, "http://example.com/data")).toMatchObject({ allowed: false, reason: expect.stringContaining("HTTPS") });
    expect(origincheck(httpsession, "https://user:pass@example.com/data")).toMatchObject({ allowed: false, reason: expect.stringContaining("credentials") });
    expect(origincheck(httpsession, "not a url")).toMatchObject({ allowed: false, reason: expect.stringContaining("valid url") });
  });

  it("requires header consent before any custom header leaves the extension", () => {
    expect(credentialheadername("Authorization")).toBe(true);
    expect(credentialheadername(" x-api-key ")).toBe(true);
    expect(credentialheadername("x-request-id")).toBe(false);
    const plain: toolstep = { id: "f1", kind: "fetchurl", summary: "Fetch.", risk: "read", options: "{\"fetch\":{\"url\":\"https://example.com/a\",\"headers\":{\"x-request-id\":\"42\"}}}" };
    expect(fetchconsentrefgranted(plain)).toMatchObject({ allowed: false, reason: expect.stringContaining("consent ref") });
    expect(fetchconsentrefgranted({ ...plain, options: "{\"fetch\":{\"url\":\"https://example.com/a\",\"headers\":{\"x-request-id\":\"42\"}},\"consentref\":\"c1\"}" })).toEqual({ allowed: true });
    expect(fetchconsentrefgranted({ id: "f2", kind: "fetchurl", summary: "No headers.", risk: "read", options: "{\"fetch\":{\"url\":\"https://example.com/a\"}}" })).toEqual({ allowed: true });
    expect(fetchconsentrefgranted({ ...plain, options: "{\"fetch\":{\"url\":\"https://example.com/a\",\"headers\":{\"Authorization\":\"Bearer x\"}}}" })).toMatchObject({ allowed: false, reason: expect.stringContaining("credential bearing header Authorization") });
    expect(fetchconsentrefgranted({ ...plain, options: "{\"fetch\":{\"url\":\"https://example.com/a\",\"headers\":{\"Authorization\":\"Bearer x\"}},\"consentref\":\"c1\"}" })).toEqual({ allowed: true });
  });

  it("covers fetch consents per origin with header names and an expiry window", () => {
    const consent = { id: "c1", origin: "https://api.example", headers: [{ name: "x-api-key", value: "secret" }], approved: true, expiresat: now + 5000, at: now };
    expect(fetchconsentcovers(consent, "https://api.example", ["X-API-Key"], now)).toBe(true);
    expect(fetchconsentcovers(consent, "https://api.example", ["x-api-key", "x-other"], now)).toBe(false);
    expect(fetchconsentcovers(consent, "https://other.example", ["x-api-key"], now)).toBe(false);
    expect(fetchconsentcovers({ ...consent, expiresat: now - 1 }, "https://api.example", ["x-api-key"], now)).toBe(false);
    const { approved, ...unapproved } = consent;
    void approved;
    expect(fetchconsentcovers(unapproved, "https://api.example", ["x-api-key"], now)).toBe(false);
  });

  it("keeps fetch waits inside the reviewed wait budget with no ceiling on the bounds themselves", () => {
    expect(fetchbudgetallowed(1000, 2, 500, 5000)).toEqual({ allowed: true });
    expect(fetchbudgetallowed(1000, 2, 500, 4000)).toMatchObject({ allowed: false, reason: expect.stringContaining("exceeds the reviewed wait budget") });
    expect(fetchbudgetallowed(1000, 0, 0, 999)).toMatchObject({ allowed: false });
    expect(fetchbudgetallowed(undefined, 99, 99999, undefined)).toEqual({ allowed: true });
    expect(fetchbudgetallowed(-1, 0, 0, 100)).toMatchObject({ allowed: false, reason: expect.stringContaining("timeout") });
    expect(fetchbudgetallowed(1000, 2, 500, -5)).toMatchObject({ allowed: false, reason: expect.stringContaining("wait budget") });
  });

  it("validates the fetch, stream and consent grammar of fetchurl", () => {
    expect(gate({ id: "f1", kind: "fetchurl", summary: "Fetch a reviewed url.", risk: "read", options: "{\"fetch\":{\"url\":\"https://api.example/data\",\"method\":\"POST\",\"headers\":{\"x-a\":\"1\"},\"body\":\"{}\",\"mode\":\"cors\"},\"fetchoptions\":{\"timeout\":1000,\"retries\":2,\"backoff\":100,\"follow\":3},\"stream\":{\"budget\":4096},\"wait\":5000,\"consentref\":\"c1\"}" })).toEqual({ allowed: true });
    expect(gate({ id: "f2", kind: "fetchurl", summary: "No request.", risk: "read" })).toMatchObject({ allowed: false, reason: expect.stringContaining("options.fetch") });
    expect(gate({ id: "f3", kind: "fetchurl", summary: "Empty url.", risk: "read", options: "{\"fetch\":{\"url\":\" \"}}" })).toMatchObject({ allowed: false, reason: expect.stringContaining("non-empty url") });
    expect(gate({ id: "f4", kind: "fetchurl", summary: "Bad verb.", risk: "read", options: "{\"fetch\":{\"url\":\"https://a.example\",\"method\":\"TRACE\"}}" })).toMatchObject({ allowed: false, reason: expect.stringContaining("known HTTP verb") });
    expect(gate({ id: "f5", kind: "fetchurl", summary: "Empty header name.", risk: "read", options: "{\"fetch\":{\"url\":\"https://a.example\",\"headers\":{\" \":\"v\"}}}" })).toMatchObject({ allowed: false, reason: expect.stringContaining("empty names") });
    expect(gate({ id: "f6", kind: "fetchurl", summary: "Bad mode.", risk: "read", options: "{\"fetch\":{\"url\":\"https://a.example\",\"mode\":\"navigate\"}}" })).toMatchObject({ allowed: false, reason: expect.stringContaining("cors, no-cors or same-origin") });
    expect(gate({ id: "f7", kind: "fetchurl", summary: "No consent.", risk: "read", options: "{\"fetch\":{\"url\":\"https://a.example\",\"headers\":{\"x-a\":\"1\"}}}" })).toMatchObject({ allowed: false, reason: expect.stringContaining("consent ref") });
    expect(gate({ id: "f8", kind: "fetchurl", summary: "Fractional retries.", risk: "read", options: "{\"fetch\":{\"url\":\"https://a.example\"},\"fetchoptions\":{\"retries\":1.5}}" })).toMatchObject({ allowed: false, reason: expect.stringContaining("retries") });
    expect(gate({ id: "f9", kind: "fetchurl", summary: "Negative stream budget.", risk: "read", options: "{\"fetch\":{\"url\":\"https://a.example\"},\"stream\":{\"budget\":-1}}" })).toMatchObject({ allowed: false, reason: expect.stringContaining("byte budget") });
    expect(gate({ id: "f10", kind: "fetchurl", summary: "Budget over wait.", risk: "read", options: "{\"fetch\":{\"url\":\"https://a.example\"},\"fetchoptions\":{\"timeout\":1000,\"retries\":2},\"wait\":2000}" })).toMatchObject({ allowed: false, reason: expect.stringContaining("exceeds the reviewed wait budget") });
  });

  it("validates the parsejson and parsehtml grammar with stored call ids", () => {
    expect(gate({ id: "j1", kind: "parsejson", summary: "Parse the body.", risk: "read", options: "{\"call\":\"call-1\",\"fields\":[{\"name\":\"title\",\"path\":\"data.title\",\"kind\":\"text\"},{\"name\":\"count\",\"path\":\"data.items.0.count\",\"kind\":\"number\",\"default\":0}]}" })).toEqual({ allowed: true });
    expect(gate({ id: "j2", kind: "parsejson", summary: "No call.", risk: "read", options: "{\"fields\":[{\"name\":\"a\",\"path\":\"b\"}]}" })).toMatchObject({ allowed: false, reason: expect.stringContaining("options.call") });
    expect(gate({ id: "j3", kind: "parsejson", summary: "No fields.", risk: "read", options: "{\"call\":\"call-1\"}" })).toMatchObject({ allowed: false, reason: expect.stringContaining("json path rules") });
    expect(gate({ id: "j4", kind: "parsejson", summary: "Bad path.", risk: "read", options: "{\"call\":\"c\",\"fields\":[{\"name\":\"a\",\"path\":\"data..title\"}]}" })).toMatchObject({ allowed: false, reason: expect.stringContaining("dotted path") });
    expect(gate({ id: "j5", kind: "parsejson", summary: "Bad kind.", risk: "read", options: "{\"call\":\"c\",\"fields\":[{\"name\":\"a\",\"path\":\"b\",\"kind\":\"yaml\"}]}" })).toMatchObject({ allowed: false, reason: expect.stringContaining("text, number, boolean or json") });
    expect(gate({ id: "h1", kind: "parsehtml", summary: "Query the markup.", risk: "read", options: "{\"call\":\"call-1\",\"queries\":[{\"selector\":\"a.link\",\"attribute\":\"href\",\"multi\":true},{\"selector\":\"h1\"}]}" })).toEqual({ allowed: true });
    expect(gate({ id: "h2", kind: "parsehtml", summary: "No queries.", risk: "read", options: "{\"call\":\"call-1\"}" })).toMatchObject({ allowed: false, reason: expect.stringContaining("html queries") });
    expect(gate({ id: "h3", kind: "parsehtml", summary: "Empty selector.", risk: "read", options: "{\"call\":\"c\",\"queries\":[{\"selector\":\"\"}]}" })).toMatchObject({ allowed: false, reason: expect.stringContaining("selector grammar") });
    expect(gate({ id: "h4", kind: "parsehtml", summary: "Bad multi.", risk: "read", options: "{\"call\":\"c\",\"queries\":[{\"selector\":\"a\",\"multi\":\"yes\"}]}" })).toMatchObject({ allowed: false, reason: expect.stringContaining("multi flag") });
  });

  it("validates the typed call grammar with endpoints, graphql operations and api key references", () => {
    expect(gate({ id: "r1", kind: "callrest", summary: "Call the endpoint.", risk: "sensitive", options: "{\"endpoint\":\"issues\",\"payload\":{\"owner\":\"w\"},\"method\":\"POST\",\"success\":[200,201],\"apikeys\":[\"github\"],\"fetchoptions\":{\"timeout\":500}}" })).toEqual({ allowed: true });
    expect(gate({ id: "r2", kind: "callrest", summary: "No endpoint.", risk: "sensitive" })).toMatchObject({ allowed: false, reason: expect.stringContaining("typed endpoint name") });
    expect(gate({ id: "r3", kind: "callrest", summary: "Array payload.", risk: "sensitive", options: "{\"endpoint\":\"issues\",\"payload\":[]}" })).toMatchObject({ allowed: false, reason: expect.stringContaining("payload") });
    expect(gate({ id: "r4", kind: "callrest", summary: "Bad success list.", risk: "sensitive", options: "{\"endpoint\":\"issues\",\"success\":[\"200\"]}" })).toMatchObject({ allowed: false, reason: expect.stringContaining("success status list") });
    expect(gate({ id: "r5", kind: "callrest", summary: "Bad api key list.", risk: "sensitive", options: "{\"endpoint\":\"issues\",\"apikeys\":[\"\"]}" })).toMatchObject({ allowed: false, reason: expect.stringContaining("api key reference list") });
    expect(gate({ id: "g1", kind: "callgraphql", summary: "Run the query.", risk: "sensitive", options: "{\"endpoint\":\"graph\",\"graphql\":{\"query\":\"query{hero}\",\"operationkind\":\"query\",\"variables\":{\"id\":\"1\"},\"operationname\":\"Hero\"}}" })).toEqual({ allowed: true });
    expect(gate({ id: "g2", kind: "callgraphql", summary: "No graphql request.", risk: "sensitive", options: "{\"endpoint\":\"graph\"}" })).toMatchObject({ allowed: false, reason: expect.stringContaining("options.graphql") });
    expect(gate({ id: "g3", kind: "callgraphql", summary: "Unknown operation kind.", risk: "sensitive", options: "{\"endpoint\":\"graph\",\"graphql\":{\"query\":\"q\",\"operationkind\":\"subscription\"}}" })).toMatchObject({ allowed: false, reason: expect.stringContaining("unknown operation kinds are refused") });
    expect(gate({ id: "g4", kind: "callgraphql", summary: "Empty operation text.", risk: "sensitive", options: "{\"endpoint\":\"graph\",\"graphql\":{\"query\":\" \",\"operationkind\":\"query\"}}" })).toMatchObject({ allowed: false, reason: expect.stringContaining("operation text") });
  });

  it("requires payload schemas and clean header names in typed endpoint definitions", () => {
    expect(validateendpointrecord({ name: "issues", method: "GET", url: "https://api.example/{owner}/issues", headers: { accept: "application/json" }, schema: { fields: [{ name: "owner", kind: "string", required: true }, { name: "open", kind: "boolean", default: true }] } })).toEqual({ allowed: true });
    expect(validateendpointrecord({ name: "x", method: "GET", url: "https://api.example" })).toMatchObject({ allowed: false, reason: expect.stringContaining("payload schema") });
    expect(validateendpointrecord({ name: "x", method: "GET", url: "http://api.example", schema: { fields: [{ name: "a", kind: "string" }] } })).toMatchObject({ allowed: false, reason: expect.stringContaining("HTTPS") });
    expect(validateendpointrecord({ name: "x", method: "GET", url: "https://api.example", headers: { "": "v" }, schema: { fields: [{ name: "a", kind: "string" }] } })).toMatchObject({ allowed: false, reason: expect.stringContaining("empty names") });
    expect(validateendpointrecord({ name: "x", method: "GET", url: "https://api.example", schema: { fields: [] } })).toMatchObject({ allowed: false, reason: expect.stringContaining("non-empty field list") });
    expect(validateendpointrecord({ name: "x", method: "GET", url: "https://api.example", schema: { fields: [{ name: "a", kind: "yaml" }] } })).toMatchObject({ allowed: false, reason: expect.stringContaining("string, number or boolean") });
  });

  it("gates execution on the origin grants and refuses ungranted outbound targets", () => {
    const fetchstep: toolstep = { id: "f1", kind: "fetchurl", summary: "Fetch the granted origin.", risk: "read", options: "{\"fetch\":{\"url\":\"https://example.com/data\"}}" };
    expect(canexecute({ session: httpsession, plan: fetchplan(fetchstep), step: fetchstep, tabid: 4, origin: "https://example.com", now })).toEqual({ allowed: true });
    const crossorigin: toolstep = { id: "f2", kind: "fetchurl", summary: "Fetch an ungranted origin.", risk: "read", options: "{\"fetch\":{\"url\":\"https://api.example/data\"}}" };
    expect(canexecute({ session: httpsession, plan: fetchplan(crossorigin), step: crossorigin, tabid: 4, origin: "https://example.com", now })).toMatchObject({ allowed: false, reason: expect.stringContaining("outside the session origin grants") });
    expect(canexecute({ session: { ...httpsession, grants: ["https://api.example"] }, plan: fetchplan(crossorigin), step: crossorigin, tabid: 4, origin: "https://example.com", now })).toEqual({ allowed: true });
    const reststep: toolstep = { id: "r1", kind: "callrest", summary: "Call the typed endpoint.", risk: "sensitive", options: "{\"endpoint\":\"issues\"}" };
    expect(canexecute({ session: httpsession, plan: fetchplan(reststep), step: reststep, tabid: 4, origin: "https://example.com", now })).toEqual({ allowed: true });
    const withheaders: toolstep = { id: "f3", kind: "fetchurl", summary: "Fetch with headers.", risk: "read", options: "{\"fetch\":{\"url\":\"https://example.com/data\",\"headers\":{\"x-a\":\"1\"}}}" };
    expect(canexecute({ session: httpsession, plan: fetchplan(withheaders), step: withheaders, tabid: 4, origin: "https://example.com", now })).toMatchObject({ allowed: false, reason: expect.stringContaining("consent ref") });
    expect(outboundtarget(fetchstep)).toBe("https://example.com/data");
    expect(outboundtarget(reststep)).toBeUndefined();
  });
});

describe("network observation part two policy", () => {
  const now = 1_800_000_000_000;
  const httpsession: agentsession = { id: "session", tabid: 4, origin: "https://example.com", startedat: now, expiresat: now + 1000 };
  const grantedsession: agentsession = { ...httpsession, grants: ["https://example.com", "https://api.example"] };
  const plan = (step: toolstep): agentplan => ({ id: "p2", objective: "Observe", origin: "https://example.com", steps: [step], createdat: now, expiresat: now + 1000, state: "approved" });
  const socketstep = (kind: actionkind, options: Record<string, unknown>): toolstep => {
    const base: toolstep = { id: "s1", kind, summary: "Observe the network.", risk: actionrisk(kind), options: JSON.stringify(options) };
    return { ...base, risk: resolvedrisk(base) };
  };

  it("grades the socket and watch family with conditional capturebodies and extractapi risks", () => {
    expect(actionrisk("opensocket")).toBe("read");
    expect(actionrisk("waitmessage")).toBe("read");
    expect(actionrisk("watchrequests")).toBe("read");
    expect(actionrisk("readheaders")).toBe("read");
    expect(actionrisk("mapapi")).toBe("read");
    expect(actionrisk("subscribesse")).toBe("read");
    expect(actionrisk("longpoll")).toBe("read");
    expect(actionrisk("sendmessage")).toBe("sensitive");
    expect(actionrisk("capturebodies")).toBe("interaction");
    expect(actionrisk("extractapi")).toBe("read");
    expect(issocketkind("opensocket")).toBe(true);
    expect(issocketkind("longpoll")).toBe(true);
    expect(issocketkind("fetchurl")).toBe(false);
    expect(isnetwatchkind("watchrequests")).toBe(true);
    expect(isnetwatchkind("capturebodies")).toBe(true);
    expect(isnetwatchkind("subscribesse")).toBe(false);
    expect(requiredcapability("opensocket")).toBeUndefined();
    expect(requiredcapability("watchrequests")).toBeUndefined();
    expect(resolvedrisk(socketstep("capturebodies", { body: { mimes: ["image/png"] } }))).toBe("interaction");
    expect(resolvedrisk(socketstep("capturebodies", { body: { mimes: ["image/png", "application/json"] } }))).toBe("sensitive");
    expect(resolvedrisk(socketstep("capturebodies", { body: {} }))).toBe("interaction");
    expect(resolvedrisk(socketstep("extractapi", { replay: { endpoint: "https://api.example/items" } }))).toBe("read");
    expect(resolvedrisk(socketstep("extractapi", { replay: { endpoint: "https://api.example/items", verb: "GET" } }))).toBe("read");
    expect(resolvedrisk(socketstep("extractapi", { replay: { endpoint: "https://api.example/items", verb: "POST" } }))).toBe("sensitive");
    expect(resolvedrisk(socketstep("opensocket", { socket: { url: "wss://api.example/live" } }))).toBe("read");
  });

  it("restricts channels to granted origins through socketgate", () => {
    expect(socketgate(grantedsession, "wss://api.example/live")).toEqual({ allowed: true });
    expect(socketgate(grantedsession, "https://api.example/stream")).toEqual({ allowed: true });
    expect(socketgate(httpsession, "wss://api.example/live")).toMatchObject({ allowed: false, reason: expect.stringContaining("outside the session origin grants") });
    expect(socketgate(grantedsession, "ws://api.example/live")).toMatchObject({ allowed: false, reason: expect.stringContaining("wss websocket urls or https event stream urls") });
    expect(socketgate(grantedsession, "http://api.example/stream")).toMatchObject({ allowed: false, reason: expect.stringContaining("wss websocket urls or https event stream urls") });
    expect(socketgate(grantedsession, "wss://user:pass@api.example/live")).toMatchObject({ allowed: false, reason: expect.stringContaining("credentials") });
    expect(socketgate(grantedsession, "not a url")).toMatchObject({ allowed: false, reason: expect.stringContaining("valid url") });
  });

  it("requires the webrequest grant before watchrequests runs and the host grant for observed origins", () => {
    expect(watchgate(httpsession, { webrequestgrant: true }, now)).toEqual({ allowed: true });
    expect(watchgate(httpsession, undefined, now)).toMatchObject({ allowed: false, reason: expect.stringContaining("webrequest grant") });
    expect(watchgate(httpsession, {}, now)).toMatchObject({ allowed: false, reason: expect.stringContaining("webrequest grant") });
    expect(watchgate({ ...httpsession, stoppedat: now }, { webrequestgrant: true }, now)).toMatchObject({ allowed: false, reason: expect.stringContaining("No active browser session") });
    expect(watchgate({ ...httpsession, pausedat: now - 1 }, { webrequestgrant: true }, now)).toMatchObject({ allowed: false, reason: expect.stringContaining("paused") });
    expect(watchgate({ ...httpsession, expiresat: now - 1 }, { webrequestgrant: true }, now)).toMatchObject({ allowed: false, reason: expect.stringContaining("expired") });
    expect(observedorigingranted(grantedsession, "https://api.example/items")).toEqual({ allowed: true });
    expect(observedorigingranted(httpsession, "https://api.example/items")).toMatchObject({ allowed: false, reason: expect.stringContaining("outside the session origin grants") });
    expect(observedorigingranted(grantedsession, "not a url")).toMatchObject({ allowed: false, reason: expect.stringContaining("does not parse") });
  });

  it("validates the socket grammar of every socket kind", () => {
    expect(validatestep(socketstep("opensocket", { socket: { url: "wss://api.example/live", reconnect: 2, backoff: 100, backoffceiling: 1000, lifetime: 5000 } }), "https://example.com")).toEqual({ allowed: true });
    expect(validatestep(socketstep("opensocket", { socket: {} }), "https://example.com")).toMatchObject({ allowed: false, reason: expect.stringContaining("options.socket") });
    expect(validatestep(socketstep("opensocket", { socket: { url: "wss://api.example/live", reconnect: 1.5 } }), "https://example.com")).toMatchObject({ allowed: false, reason: expect.stringContaining("reconnect budget") });
    expect(validatestep(socketstep("opensocket", { socket: { url: "wss://api.example/live", backoff: -1 } }), "https://example.com")).toMatchObject({ allowed: false, reason: expect.stringContaining("backoff") });
    expect(validatestep(socketstep("opensocket", { socket: { url: "wss://api.example/live", lifetime: 0 } }), "https://example.com")).toMatchObject({ allowed: false, reason: expect.stringContaining("lifetime window") });
    expect(validatestep(socketstep("sendmessage", { message: { channel: "ch1", stream: "orders", payload: "{\"id\":1}" } }), "https://example.com")).toEqual({ allowed: true });
    expect(validatestep(socketstep("sendmessage", { message: { payload: "x" } }), "https://example.com")).toMatchObject({ allowed: false, reason: expect.stringContaining("channel") });
    expect(validatestep(socketstep("sendmessage", { message: { channel: "ch1", stream: " " } }), "https://example.com")).toMatchObject({ allowed: false, reason: expect.stringContaining("stream name") });
    expect(validatestep(socketstep("sendmessage", { message: { channel: "ch1", payload: 3 } }), "https://example.com")).toMatchObject({ allowed: false, reason: expect.stringContaining("payload") });
    expect(validatestep(socketstep("waitmessage", { channel: "ch1", filter: { stream: "orders", path: "id", limit: 2 }, wait: 500 }), "https://example.com")).toEqual({ allowed: true });
    expect(validatestep(socketstep("waitmessage", { filter: { path: "bad path" } }), "https://example.com")).toMatchObject({ allowed: false, reason: expect.stringContaining("dotted path") });
    expect(validatestep(socketstep("waitmessage", { filter: { limit: 0 } }), "https://example.com")).toMatchObject({ allowed: false, reason: expect.stringContaining("match limit") });
    expect(validatestep(socketstep("waitmessage", { wait: -1 }), "https://example.com")).toMatchObject({ allowed: false, reason: expect.stringContaining("wait budget") });
    expect(validatestep(socketstep("subscribesse", { subscription: { url: "https://api.example/stream", lifetime: 5000, cancel: { kind: "stop", value: "done" } } }), "https://example.com")).toEqual({ allowed: true });
    expect(validatestep(socketstep("subscribesse", { subscription: { url: "https://api.example/stream" } }), "https://example.com")).toMatchObject({ allowed: false, reason: expect.stringContaining("cancellation path") });
    expect(validatestep(socketstep("subscribesse", { subscription: { url: "https://api.example/stream", lifetime: -5, cancel: { kind: "stop", value: "done" } } }), "https://example.com")).toMatchObject({ allowed: false, reason: expect.stringContaining("lifetime window") });
    expect(validatestep(socketstep("longpoll", { poll: { url: "https://api.example/poll", cursorfield: "cursor", interval: 50, stop: { field: "done", equals: "yes" }, maxpolls: 5, param: "since" }, wait: 500 }), "https://example.com")).toEqual({ allowed: true });
    expect(validatestep(socketstep("longpoll", { poll: { url: "https://api.example/poll", cursorfield: "c", interval: 50 } }), "https://example.com")).toMatchObject({ allowed: false, reason: expect.stringContaining("stop condition") });
    expect(validatestep(socketstep("longpoll", { poll: { url: "https://api.example/poll", cursorfield: "c", interval: 0, stop: { field: "d", equals: "y" } } }), "https://example.com")).toMatchObject({ allowed: false, reason: expect.stringContaining("options.poll") });
    expect(validatestep(socketstep("longpoll", { poll: { url: "https://api.example/poll", cursorfield: "c", interval: 600, stop: { field: "d", equals: "y" } }, wait: 500 }), "https://example.com")).toMatchObject({ allowed: false, reason: expect.stringContaining("exceeds the reviewed wait budget") });
  });

  it("validates the watch grammar with required redaction lists and byte ceilings", () => {
    expect(validatestep(socketstep("watchrequests", { watch: { window: 500 }, limit: 10 }), "https://example.com")).toEqual({ allowed: true });
    expect(validatestep(socketstep("watchrequests", {}), "https://example.com")).toEqual({ allowed: true });
    expect(validatestep(socketstep("watchrequests", { watch: { window: -1 } }), "https://example.com")).toMatchObject({ allowed: false, reason: expect.stringContaining("watch window") });
    expect(validatestep(socketstep("watchrequests", { limit: 0 }), "https://example.com")).toMatchObject({ allowed: false, reason: expect.stringContaining("match limit") });
    expect(validatestep(socketstep("readheaders", { headers: { allow: ["content-type"], redact: ["set-cookie"] } }), "https://example.com")).toEqual({ allowed: true });
    expect(validatestep(socketstep("readheaders", { headers: { allow: ["content-type"] } }), "https://example.com")).toMatchObject({ allowed: false, reason: expect.stringContaining("redaction list") });
    expect(validatestep(socketstep("readheaders", { headers: { redact: ["set-cookie"] } }), "https://example.com")).toMatchObject({ allowed: false, reason: expect.stringContaining("allowlist") });
    expect(validatestep(socketstep("readheaders", {}), "https://example.com")).toMatchObject({ allowed: false, reason: expect.stringContaining("options.headers") });
    expect(validatestep(socketstep("capturebodies", { body: { urlpattern: "api.example", mimes: ["application/json"], ceiling: 4096 } }), "https://example.com")).toEqual({ allowed: true });
    expect(validatestep(socketstep("capturebodies", { body: { mimes: [] } }), "https://example.com")).toMatchObject({ allowed: false, reason: expect.stringContaining("mime list") });
    expect(validatestep(socketstep("capturebodies", { body: { ceiling: -1 } }), "https://example.com")).toMatchObject({ allowed: false, reason: expect.stringContaining("byte ceiling") });
    expect(validatestep(socketstep("capturebodies", {}), "https://example.com")).toMatchObject({ allowed: false, reason: expect.stringContaining("options.body") });
    expect(validatestep(socketstep("mapapi", { limit: 5 }), "https://example.com")).toEqual({ allowed: true });
    expect(validatestep(socketstep("mapapi", { limit: 0 }), "https://example.com")).toMatchObject({ allowed: false, reason: expect.stringContaining("match limit") });
    expect(validatestep(socketstep("extractapi", { replay: { endpoint: "https://api.example/items", verb: "GET", overrides: { page: "2" }, paths: ["items.0.id"] } }), "https://example.com")).toEqual({ allowed: true });
    expect(validatestep(socketstep("extractapi", { replay: { endpoint: "https://api.example/items", verb: "TRACE" } }), "https://example.com")).toMatchObject({ allowed: false, reason: expect.stringContaining("known HTTP verb") });
    expect(validatestep(socketstep("extractapi", { replay: { endpoint: "http://api.example/items" } }), "https://example.com")).toMatchObject({ allowed: false, reason: expect.stringContaining("HTTPS") });
    expect(validatestep(socketstep("extractapi", { replay: { endpoint: "https://api.example/items", paths: ["bad path"] } }), "https://example.com")).toMatchObject({ allowed: false, reason: expect.stringContaining("dotted path") });
    expect(validatestep(socketstep("extractapi", {}), "https://example.com")).toMatchObject({ allowed: false, reason: expect.stringContaining("options.replay") });
  });

  it("gates socket channels, watchrequests and replays at execution time", () => {
    const socket = socketstep("opensocket", { socket: { url: "wss://other.example/live" } });
    const decision = canexecute({ session: grantedsession, plan: plan(socket), step: socket, tabid: 4, origin: "https://example.com", now });
    expect(decision).toMatchObject({ allowed: false, reason: expect.stringContaining("outside the session origin grants") });
    const watch = socketstep("watchrequests", { watch: { window: 100 } });
    expect(canexecute({ session: httpsession, plan: plan(watch), step: watch, tabid: 4, origin: "https://example.com", now })).toMatchObject({ allowed: false, reason: expect.stringContaining("webrequest grant") });
    expect(canexecute({ session: httpsession, plan: plan(watch), step: watch, tabid: 4, origin: "https://example.com", now, settings: { webrequestgrant: true } })).toEqual({ allowed: true });
    const replay = socketstep("extractapi", { replay: { endpoint: "https://other.example/items" } });
    expect(canexecute({ session: grantedsession, plan: plan(replay), step: replay, tabid: 4, origin: "https://example.com", now })).toMatchObject({ allowed: false, reason: expect.stringContaining("outside the session origin grants") });
    const send = socketstep("sendmessage", { message: { channel: "ch1", payload: "x" } });
    expect(canexecute({ session: grantedsession, plan: plan(send), step: send, tabid: 4, origin: "https://example.com", now })).toEqual({ allowed: true });
    expect(sockettarget(socketstep("opensocket", { socket: { url: "wss://api.example/live" } }))).toBe("wss://api.example/live");
    expect(sockettarget(socketstep("subscribesse", { subscription: { url: "https://api.example/stream", cancel: { kind: "stop", value: "done" } } }))).toBe("https://api.example/stream");
    expect(sockettarget(socketstep("waitmessage", { channel: "ch1" }))).toBeUndefined();
  });
});

describe("network control policy", () => {
  const now = 1_800_000_000_000;
  const grants: agentsession = { id: "session", tabid: 4, origin: "https://example.com", startedat: now, expiresat: now + 1000, grants: ["https://example.com", "https://api.example"] };

  it("grades the network control kinds: ten sensitive control kinds and the read only cookie read", () => {
    for (const kind of ["blockrequest", "mockresponse", "rewriteheaders", "setcookies", "clearcookies", "authflow", "saveapikey", "routeproxy", "postform", "postfiles"] as const) {
      expect(actionrisk(kind)).toBe("sensitive");
      expect(iscontrolkind(kind)).toBe(true);
    }
    expect(actionrisk("readcookies")).toBe("read");
    expect(iscontrolkind("fetchurl")).toBe(false);
  });

  it("requires the reviewed block rule behind the blockgate", () => {
    const reviewed: toolstep = { id: "b", kind: "blockrequest", summary: "Block ads", risk: "sensitive", options: JSON.stringify({ block: { urlpattern: "https://ads.example/*", reviewed: true } }) };
    expect(blockgate(grants, reviewed, now).allowed).toBe(true);
    const unreviewed: toolstep = { id: "b2", kind: "blockrequest", summary: "Block ads", risk: "sensitive", options: JSON.stringify({ block: { urlpattern: "https://ads.example/*" } }) };
    expect(blockgate(grants, unreviewed, now).allowed).toBe(false);
    expect(blockgate({ ...grants, stoppedat: now }, reviewed, now).reason).toContain("No active browser session");
    expect(blockgate({ ...grants, pausedat: now }, reviewed, now).reason).toContain("paused");
  });

  it("scopes cookie kinds to granted domains and refuses others", () => {
    expect(cookiegate(grants, "example.com", now).allowed).toBe(true);
    expect(cookiegate(grants, "api.example.com", now).allowed).toBe(true);
    expect(cookiegate(grants, "elsewhere.example", now).reason).toContain("outside the session origin grants");
    expect(cookiegate({ ...grants, expiresat: now - 1 }, "example.com", now).reason).toContain("expired");
  });

  it("requires the reviewed consent ref and bypass list behind the proxygate", () => {
    const route: toolstep = { id: "p", kind: "routeproxy", summary: "Route through the reviewed proxy", risk: "sensitive", options: JSON.stringify({ consentref: "consent-1", proxy: { scheme: "socks5", host: "proxy.example", port: 1080, bypass: ["https://api.example"] } }) };
    expect(proxygate(grants, route, now).allowed).toBe(true);
    expect(proxygate(grants, { ...route, options: JSON.stringify({ proxy: { scheme: "socks5", host: "proxy.example", port: 1080, bypass: ["https://api.example"] } }) }, now).reason).toContain("consent ref");
    expect(proxygate(grants, { ...route, options: JSON.stringify({ consentref: "c", proxy: { scheme: "socks5", host: "proxy.example", port: 1080, bypass: [] } }) }, now).reason).toContain("bypass list");
  });

  it("requires the provider consent prompt of authflow and the consent prompt of saveapikey", () => {
    const authstep: toolstep = { id: "a", kind: "authflow", summary: "Run the oauth flow", risk: "sensitive", options: JSON.stringify({ consentref: "prompt-1" }) };
    expect(authconsentgranted(authstep).allowed).toBe(true);
    expect(authconsentgranted({ ...authstep, options: "{}" }).reason).toContain("consent prompt ref");
    const keystorestep: toolstep = { id: "k", kind: "saveapikey", summary: "Store the api key", risk: "sensitive", options: JSON.stringify({ consentref: "prompt-2" }) };
    expect(apikeyconsentgranted(keystorestep).allowed).toBe(true);
    expect(apikeyconsentgranted({ ...keystorestep, options: "{}" }).reason).toContain("consent prompt ref");
  });

  it("keeps rate limit waits inside the reviewed budget as user configured behavior", () => {
    expect(ratelimitbudgetallowed(500, 1000).allowed).toBe(true);
    expect(ratelimitbudgetallowed(1500, 1000).reason).toContain("exceeds the reviewed budget");
    expect(ratelimitbudgetallowed(-1, 1000).reason).toContain("zero or a positive");
    expect(ratelimitbudgetallowed(500, undefined).allowed).toBe(true);
  });

  it("validates the control options grammar of every control kind", () => {
    expect(validatestep({ id: "1", kind: "blockrequest", summary: "Block", risk: "sensitive", options: JSON.stringify({ block: { urlpattern: "https://ads.example/*", reviewed: true } }) }, "https://example.com").allowed).toBe(true);
    expect(validatestep({ id: "2", kind: "blockrequest", summary: "Block", risk: "sensitive", options: JSON.stringify({ block: { urlpattern: "ads.example", reviewed: true } }) }, "https://example.com").reason).toContain("https origin pattern");
    expect(validatestep({ id: "3", kind: "mockresponse", summary: "Mock", risk: "sensitive", options: JSON.stringify({ mock: { urlpattern: "https://api.example/status", status: 204, body: "{}", reviewed: true } }) }, "https://example.com").allowed).toBe(true);
    expect(validatestep({ id: "4", kind: "mockresponse", summary: "Mock", risk: "sensitive", options: JSON.stringify({ mock: { urlpattern: "https://api.example/status", status: 204, body: "{}" } }) }, "https://example.com").reason).toContain("reviewed with its full body");
    expect(validatestep({ id: "5", kind: "rewriteheaders", summary: "Rewrite", risk: "sensitive", options: JSON.stringify({ rules: [{ urlpattern: "https://api.example/*", name: "accept", operation: "append", value: "json" }] }) }, "https://example.com").allowed).toBe(true);
    expect(validatestep({ id: "6", kind: "rewriteheaders", summary: "Rewrite", risk: "sensitive", options: JSON.stringify({ rules: [{ urlpattern: "api.example", name: "accept", operation: "set", value: "json" }] }) }, "https://example.com").reason).toContain("origin pattern explicitly");
    expect(validatestep({ id: "7", kind: "setcookies", summary: "Set cookies", risk: "sensitive", options: JSON.stringify({ cookies: [{ name: "session", domain: "example.com", path: "/", value: "v" }] }) }, "https://example.com").allowed).toBe(true);
    expect(validatestep({ id: "8", kind: "clearcookies", summary: "Clear", risk: "sensitive", options: JSON.stringify({ domain: "example.com" }) }, "https://example.com").allowed).toBe(true);
    expect(validatestep({ id: "9", kind: "clearcookies", summary: "Clear", risk: "sensitive", options: "{}" }, "https://example.com").reason).toContain("domain");
    expect(validatestep({ id: "10", kind: "authflow", summary: "Auth", risk: "sensitive", options: JSON.stringify({ consentref: "c", oauth: { provider: "p", authorizeurl: "https://auth.example", tokenurl: "https://api.example/token", scopes: ["read"], redirectorigin: "https://example.com" } }) }, "https://example.com").allowed).toBe(true);
    expect(validatestep({ id: "11", kind: "saveapikey", summary: "Key", risk: "sensitive", options: JSON.stringify({ consentref: "c", key: { name: "k", origins: ["https://api.example"], header: "authorization", value: "secret" } }) }, "https://example.com").allowed).toBe(true);
    expect(validatestep({ id: "12", kind: "routeproxy", summary: "Proxy", risk: "sensitive", options: JSON.stringify({ consentref: "c", proxy: { scheme: "https", host: "proxy.example", port: 1080, bypass: ["https://api.example"] } }) }, "https://example.com").allowed).toBe(true);
    expect(validatestep({ id: "13", kind: "postform", summary: "Post", risk: "sensitive", options: JSON.stringify({ form: { url: "https://api.example/submit", fields: [{ name: "q", value: "v" }] } }) }, "https://example.com").allowed).toBe(true);
    expect(validatestep({ id: "14", kind: "postfiles", summary: "Upload", risk: "sensitive", options: JSON.stringify({ upload: { url: "https://api.example/upload", fields: [], files: [{ name: "f", filename: "a.csv", mime: "text/csv", content: "a", reviewed: true }] } }) }, "https://example.com").allowed).toBe(true);
    expect(validatestep({ id: "15", kind: "postfiles", summary: "Upload", risk: "sensitive", options: JSON.stringify({ upload: { url: "https://api.example/upload", files: [{ name: "f", filename: "a.csv", mime: "text/csv", content: "a", reviewed: false }] } }) }, "https://example.com").reason).toContain("reviewed flag");
  });

  it("resolves the control target url and refuses ungranted targets at execution time", () => {
    const form: toolstep = { id: "f", kind: "postform", summary: "Post the form", risk: "sensitive", options: JSON.stringify({ form: { url: "https://api.example/submit", fields: [{ name: "q", value: "v" }] } }) };
    expect(controltarget(form)).toBe("https://api.example/submit");
    const outside: toolstep = { id: "o", kind: "postform", summary: "Post elsewhere", risk: "sensitive", options: JSON.stringify({ form: { url: "https://elsewhere.example/submit", fields: [{ name: "q", value: "v" }] } }) };
    const plan: agentplan = { id: "plan", objective: "Post", origin: "https://example.com", steps: [outside], createdat: now, expiresat: now + 1000, state: "approved" };
    expect(canexecute({ session: grants, plan, step: outside, tabid: 4, origin: "https://example.com", now }).reason).toContain("outside the session origin grants");
    const cookieplan: agentplan = { id: "plan", objective: "Cookies", origin: "https://example.com", steps: [], createdat: now, expiresat: now + 1000, state: "approved" };
    const badcookie: toolstep = { id: "c", kind: "clearcookies", summary: "Clear elsewhere", risk: "sensitive", options: JSON.stringify({ domain: "elsewhere.example" }) };
    expect(canexecute({ session: grants, plan: cookieplan, step: badcookie, tabid: 4, origin: "https://example.com", now }).reason).toContain("outside the session origin grants");
  });
});

describe("debugging policy", () => {
  const now = 1_800_000_000_000;
  const grants: agentsession = { id: "session", tabid: 4, origin: "https://example.com", startedat: now, expiresat: now + 1000, grants: ["https://example.com", "https://api.example"] };
  const watchstep = (kind: actionkind, reviewed: Record<string, unknown>): toolstep => ({ id: "w", kind, summary: "Watch the page", risk: "read", options: JSON.stringify(reviewed) });
  const planof = (step: toolstep): agentplan => ({ id: "plan", objective: "Debug", origin: "https://example.com", steps: [step], createdat: now, expiresat: now + 1000, state: "approved" });

  it("grades the debugging kinds read only as watched observation", () => {
    for (const kind of ["watchconsole", "watcherrors", "watchtasks"] as const) {
      expect(actionrisk(kind)).toBe("read");
      expect(isdebugkind(kind)).toBe(true);
      expect(observationmodeof(kind)).toBe("watching");
    }
    expect(isdebugkind("watchmutate")).toBe(false);
    expect(iswatchkind("watchconsole")).toBe(false);
  });

  it("scopes timeline capture to the run tab only behind the timelinegate", () => {
    const step = watchstep("watchconsole", { watch: { window: 200 }, redact: ["secret"] });
    expect(timelinegate(grants, 4, "https://example.com", now)).toEqual({ allowed: true });
    expect(timelinegate(grants, 9, "https://example.com", now).reason).toContain("refuses tab 9");
    expect(timelinegate(undefined, 4, "https://example.com", now).reason).toContain("No active browser session");
    expect(timelinegate({ ...grants, expiresat: now - 1 }, 4, "https://example.com", now).reason).toContain("expired");
    expect(timelinegate({ ...grants, pausedat: now }, 4, "https://example.com", now).reason).toContain("paused");
    expect(timelinegate(grants, 4, "https://elsewhere.example", now).reason).toContain("origin grants");
    const other = watchstep("watchconsole", { watch: { window: 200 }, redact: ["secret"] });
    expect(canexecute({ session: grants, plan: planof(step), step: other, tabid: 9, origin: "https://example.com", now }).reason).toContain("outside the approved tab");
    expect(canexecute({ session: grants, plan: { ...planof(step), state: "pending" }, step: other, tabid: 4, origin: "https://example.com", now }).reason).toContain("not received explicit approval");
  });

  it("requires the per origin console consent before console capture begins", () => {
    const consents: consoleconsentrecord[] = [{ id: "c1", prompt: "Console capture on https://example.com", origin: "https://example.com", stepid: "w", approved: true, at: now }];
    expect(consoleconsentcovers("https://example.com", consents)).toEqual({ allowed: true });
    expect(consoleconsentcovers("https://other.example", consents).reason).toContain("needs the reviewed console consent");
    expect(consoleconsentcovers("https://example.com", [{ id: "c2", prompt: "pending", origin: "https://example.com", stepid: "w", at: now }]).allowed).toBe(false);
  });

  it("refuses stack capture outside the granted origin", () => {
    expect(stackgate(grants, "https://api.example")).toEqual({ allowed: true });
    expect(stackgate(grants, "https://elsewhere.example").reason).toContain("outside the session origin grants");
    expect(stackgate(undefined, "https://example.com").allowed).toBe(false);
  });

  it("keeps the debug watch window inside the reviewed wait budget", () => {
    expect(debugwaitbudgetallowed(200, 500)).toEqual({ allowed: true });
    expect(debugwaitbudgetallowed(undefined, undefined)).toEqual({ allowed: true });
    expect(debugwaitbudgetallowed(600, 500).reason).toContain("exceeds the reviewed wait budget");
    expect(debugwaitbudgetallowed(-1, 500).reason).toContain("zero or a positive");
    expect(debugwaitbudgetallowed(200, -5).reason).toContain("zero or a positive");
  });

  it("validates the debug options grammar of every debugging kind", () => {
    expect(validatestep(watchstep("watchconsole", { watch: { window: 250 }, level: "warn", depth: 3, redact: ["secret"], spam: { pattern: "retry", windowsize: 500, collapse: 2 }, rotation: { maxentries: 40, overflowtarget: "overflow1" } }), "https://example.com")).toEqual({ allowed: true });
    expect(validatestep(watchstep("watcherrors", { watch: { window: 250 }, level: "error", sources: ["error", "rejection"] }), "https://example.com")).toEqual({ allowed: true });
    expect(validatestep(watchstep("watchtasks", { watch: { window: 250 }, threshold: 50 }), "https://example.com")).toEqual({ allowed: true });
    expect(validatestep(watchstep("watchconsole", { watch: { window: 250 } }), "https://example.com").reason).toContain("redaction pattern list");
    expect(validatestep(watchstep("watchconsole", { watch: { window: 250 }, redact: ["secret"], level: "verbose" }), "https://example.com").reason).toContain("level floor");
    expect(validatestep(watchstep("watchconsole", { watch: { window: 250 }, redact: ["secret"], depth: 0 }), "https://example.com").reason).toContain("depth");
    expect(validatestep(watchstep("watchconsole", { watch: { window: 250 }, redact: ["secret"], spam: { pattern: "r", windowsize: 5 } }), "https://example.com").reason).toContain("spam rule");
    expect(validatestep(watchstep("watchconsole", { watch: { window: 250 }, redact: ["secret"], rotation: { maxentries: 0, overflowtarget: "x" } }), "https://example.com").reason).toContain("rotation rule");
    expect(validatestep(watchstep("watcherrors", { watch: { window: 600 }, wait: 500 }), "https://example.com").reason).toContain("wait budget");
    expect(validatestep(watchstep("watcherrors", { watch: { window: -1 } }), "https://example.com").reason).toContain("watch window");
    expect(validatestep(watchstep("watcherrors", { watch: { window: 250 }, sources: ["chatter"] }), "https://example.com").reason).toContain("source filters");
    expect(validatestep(watchstep("watchtasks", { watch: { window: 250 }, threshold: -3 }), "https://example.com").reason).toContain("threshold");
  });

  it("allows timeline capture without any other action kind and exposes the retention window", () => {
    const solo = watchstep("watchconsole", { watch: { window: 200 }, redact: ["secret"] });
    expect(canexecute({ session: grants, plan: planof(solo), step: solo, tabid: 4, origin: "https://example.com", now })).toEqual({ allowed: true });
    expect(timelineretentionwindow(undefined)).toBeUndefined();
    expect(timelineretentionwindow({ timelineretention: 250 })).toBe(250);
    expect(diffreviewgrade()).toEqual({ risk: "read", mode: "diffing", evidence: "comparison" });
  });
});

describe("debugging part two policy", () => {
  const now = 1_800_000_000_000;
  const grants: agentsession = { id: "session", tabid: 4, origin: "https://example.com", startedat: now, expiresat: now + 1000, grants: ["https://example.com", "https://api.example"] };
  const cdpstep = (kind: actionkind, reviewed: Record<string, unknown>): toolstep => ({ id: "c", kind, summary: "Debug the page", risk: "sensitive", options: JSON.stringify(reviewed) });
  const attachoptions = { domains: ["Runtime", "Debugger"], teardown: { revertsteps: ["revert breakpoints", "revert overrides"], resumepolicy: "pause" } };
  const attach: toolstep = { id: "a1", kind: "attachcdp", summary: "Attach", risk: "sensitive", options: JSON.stringify(attachoptions) };
  const planof = (steps: toolstep[]): agentplan => ({ id: "plan", objective: "Debug", origin: "https://example.com", steps, createdat: now, expiresat: now + 1000, state: "approved" });

  it("grades the devtools kinds: watchcdp read, stepping interaction and the raw protocol sensitive", () => {
    for (const kind of ["attachcdp", "detachcdp", "cdpcmd", "overridescript"] as const) {
      expect(actionrisk(kind)).toBe("sensitive");
      expect(iscdpkind(kind)).toBe(true);
    }
    for (const kind of ["setbreakpoint", "stepcode", "watchexpr"] as const) expect(actionrisk(kind)).toBe("interaction");
    expect(actionrisk("watchcdp")).toBe("read");
    expect(observationmodeof("watchcdp")).toBe("watching");
    expect(iscdpkind("watchconsole")).toBe(false);
    expect(isdebugkind("attachcdp")).toBe(false);
    expect(requiredcapability("attachcdp")).toBeUndefined();
  });

  it("scopes every devtools kind to the run tab behind the debuggate", () => {
    expect(debuggate(grants, 4, "https://example.com", now)).toEqual({ allowed: true });
    expect(debuggate(grants, 9, "https://example.com", now).reason).toContain("refuses tab 9");
    expect(debuggate(undefined, 4, "https://example.com", now).reason).toContain("No active browser session");
    expect(debuggate({ ...grants, expiresat: now - 1 }, 4, "https://example.com", now).reason).toContain("expired");
    expect(debuggate({ ...grants, pausedat: now }, 4, "https://example.com", now).reason).toContain("paused");
    expect(debuggate(grants, 4, "https://elsewhere.example", now).reason).toContain("origin grants");
  });

  it("requires the approved debugger consent covering every requested domain before the first attach", () => {
    const approved: debuggergrant[] = [{ id: "g1", prompt: "Debugger attach", origin: "https://example.com", domains: ["Runtime", "Debugger"], approved: true, consentedat: now }];
    expect(debuggerconsentcovers("https://example.com", ["Runtime"], approved)).toEqual({ allowed: true });
    expect(debuggerconsentcovers("https://example.com", ["Runtime", "DOM"], approved).reason).toContain("reviewed debugger consent");
    expect(debuggerconsentcovers("https://elsewhere.example", ["Runtime"], approved).reason).toContain("reviewed debugger consent");
    expect(debuggerconsentcovers("https://example.com", ["Runtime"], []).reason).toContain("reviewed debugger consent");
    const revoked: debuggergrant[] = [{ ...approved[0]!, revokedat: now + 1 }];
    expect(debuggerconsentcovers("https://example.com", ["Runtime"], revoked).reason).toContain("revoked");
  });

  it("validates the cdp options grammar of every kind", () => {
    expect(validatestep(cdpstep("attachcdp", attachoptions), "https://example.com")).toEqual({ allowed: true });
    expect(validatestep(cdpstep("attachcdp", { domains: ["Runtime"] }), "https://example.com").reason).toContain("teardown plan");
    expect(validatestep(cdpstep("attachcdp", { domains: ["Nothing"] }), "https://example.com").reason).toContain("domain grammar");
    expect(validatestep(cdpstep("attachcdp", { domains: ["Runtime"], teardown: { revertsteps: [], resumepolicy: "pause" } }), "https://example.com").reason).toContain("teardown plan");
    expect(validatestep(cdpstep("attachcdp", { domains: ["Runtime", "Debugger"], teardown: { revertsteps: ["x"] }, allowlist: { domains: ["Runtime", "DOM"], methods: ["Runtime.evaluate"] } }), "https://example.com").reason).toContain("inside the enabled domains");
    expect(validatestep(cdpstep("attachcdp", { domains: ["Runtime"], teardown: { revertsteps: ["x"] }, allowlist: { domains: ["Runtime"], methods: ["Runtime.evaluate"] } }), "https://example.com")).toEqual({ allowed: true });
    expect(validatestep(cdpstep("detachcdp", {}), "https://example.com")).toEqual({ allowed: true });
    expect(validatestep(cdpstep("cdpcmd", { command: { method: "Runtime.evaluate" } }), "https://example.com")).toEqual({ allowed: true });
    expect(validatestep(cdpstep("cdpcmd", { command: { method: "runtime.evaluate" } }), "https://example.com").reason).toContain("Domain.method");
    expect(validatestep(cdpstep("cdpcmd", { command: { method: "Runtime.evaluate", params: [] } }), "https://example.com").reason).toContain("params");
    expect(validatestep(cdpstep("cdpcmd", { command: { method: "Runtime.evaluate", resultpath: 4 } }), "https://example.com").reason).toContain("result path");
    expect(validatestep(cdpstep("watchcdp", { events: [{ domain: "Log", event: "entryAdded" }], watch: { window: 200 } }), "https://example.com")).toEqual({ allowed: true });
    expect(validatestep(cdpstep("watchcdp", { events: [], watch: { window: 200 } }), "https://example.com").reason).toContain("domain event rule");
    expect(validatestep(cdpstep("watchcdp", { events: [{ domain: "Log", event: "entryAdded" }] }), "https://example.com").reason).toContain("lifetime window");
    expect(validatestep(cdpstep("watchcdp", { events: [{ domain: "Log", event: "entryAdded" }], watch: { window: 500 }, wait: 200 }), "https://example.com").reason).toContain("wait budget");
    expect(validatestep(cdpstep("setbreakpoint", { breakpoint: { url: "https://example.com/app.js", line: 3 } }), "https://example.com")).toEqual({ allowed: true });
    expect(validatestep(cdpstep("setbreakpoint", { breakpoint: { url: "https://example.com/app.js" } }), "https://example.com").reason).toContain("line");
    expect(validatestep(cdpstep("setbreakpoint", { breakpoint: { url: "http://example.com/app.js", line: 3 } }), "https://example.com").reason).toContain("HTTPS");
    expect(validatestep(cdpstep("stepcode", { mode: "stepinto" }), "https://example.com")).toEqual({ allowed: true });
    expect(validatestep(cdpstep("stepcode", { mode: "stepoutward" }), "https://example.com").reason).toContain("stepover, stepinto, stepout or resume");
    expect(validatestep(cdpstep("watchexpr", { expression: { expression: "items.length" }, reviewed: true }), "https://example.com")).toEqual({ allowed: true });
    expect(validatestep(cdpstep("watchexpr", { expression: { expression: "items.length" } }), "https://example.com").reason).toContain("reviewed");
    expect(validatestep(cdpstep("overridescript", { override: { urlpattern: "https://example.com/app.js", source: "window.x = 1;" }, reviewed: true }), "https://example.com")).toEqual({ allowed: true });
    expect(validatestep(cdpstep("overridescript", { override: { urlpattern: "https://example.com/app.js", source: "window.x = 1;" } }), "https://example.com").reason).toContain("reviewed");
    expect(validatestep(cdpstep("overridescript", { override: { urlpattern: "app.js", source: "x" }, reviewed: true }), "https://example.com").reason).toContain("named https origin");
  });

  it("validates breakpoint conditions against the reviewed expression grammar", () => {
    expect(validatebreakpointcondition("items.length > 0")).toEqual({ allowed: true });
    expect(validatebreakpointcondition("user.name === \"admin\" && attempts < 3")).toEqual({ allowed: true });
    expect(validatebreakpointcondition("!done || state === 'ready'")).toEqual({ allowed: true });
    expect(validatebreakpointcondition("count >= 10")).toEqual({ allowed: true });
    const refused = [validatebreakpointcondition("total = 5"), validatebreakpointcondition("fetch('/x')"), validatebreakpointcondition("alert(1)"), validatebreakpointcondition("a; b")];
    for (const verdict of refused) expect(verdict.allowed).toBe(false);
    expect(validatebreakpointcondition("total = 5").reason).toContain("assignment");
    expect(validatebreakpointcondition("fetch('/x')").reason).toContain("refuse calls");
    expect(validatebreakpointcondition("alert(1)").reason).toContain("refuse calls");
    expect(validatebreakpointcondition("a; b").reason).toContain("reviewed expression grammar");
    expect(validatebreakpointcondition("  ").reason).toContain("empty");
  });

  it("caps breakpoints per run by user choice only and exposes the debugger settings", () => {
    expect(breakpointbudgetallowed(5, undefined)).toEqual({ allowed: true });
    expect(breakpointbudgetallowed(2, 3)).toEqual({ allowed: true });
    expect(breakpointbudgetallowed(3, 3).reason).toContain("breakpoint ceiling");
    expect(breakpointbudgetallowed(0, -1).reason).toContain("positive integer");
    expect(pauseretentionwindow(undefined)).toBeUndefined();
    expect(pauseretentionwindow({ pauseretention: 40 })).toBe(40);
    expect(breakpointceilingof(undefined)).toBeUndefined();
    expect(breakpointceilingof({ breakpointceiling: 6 })).toBe(6);
  });

  it("resolves the plan allowlist from the attachcdp step", () => {
    expect(planallowlist([attach])).toEqual({ domains: ["Runtime", "Debugger"] });
    const gated = { ...attach, options: JSON.stringify({ ...attachoptions, allowlist: { domains: ["Runtime"], methods: ["Runtime.evaluate"] } }) };
    expect(planallowlist([gated])).toEqual({ domains: ["Runtime", "Debugger"], methods: ["Runtime.evaluate"] });
    expect(planallowlist([cdpstep("watchcdp", { events: [{ domain: "Log", event: "entryAdded" }], watch: { window: 100 } })])).toBeUndefined();
    expect(planallowlist([{ ...attach, options: JSON.stringify({ teardown: { revertsteps: ["x"] } }) }])).toBeUndefined();
  });

  it("gates cdp execution behind the run tab, the plan attach and the origin grants", () => {
    const cmd = cdpstep("cdpcmd", { command: { method: "Runtime.evaluate" } });
    const base = { session: grants, plan: planof([attach, cmd]), step: cmd, tabid: 4, origin: "https://example.com", now };
    expect(canexecute(base)).toEqual({ allowed: true });
    expect(canexecute({ ...base, tabid: 9 }).reason).toContain("outside the approved tab");
    expect(canexecute({ ...base, plan: planof([cmd]) }).reason).toContain("attachcdp step");
    expect(canexecute({ ...base, step: cdpstep("cdpcmd", { command: { method: "DOM.getSnapshot" } }) }).reason).toContain("domain allowlist");
    const outside = cdpstep("setbreakpoint", { breakpoint: { url: "https://elsewhere.example/app.js", line: 1 } });
    expect(canexecute({ ...base, step: outside }).reason).toContain("origin grants");
    const oroutside = cdpstep("overridescript", { override: { urlpattern: "https://elsewhere.example/app.js", source: "x" }, reviewed: true });
    expect(canexecute({ ...base, step: oroutside }).reason).toContain("origin grants");
    expect(canexecute({ ...base, session: undefined }).reason).toContain("No active browser session");
    const watch = cdpstep("watchcdp", { events: [{ domain: "Log", event: "entryAdded" }], watch: { window: 100 } });
    expect(canexecute({ ...base, step: watch })).toEqual({ allowed: true });
  });
});

describe("debugging part three policy", () => {
  const now = 1_800_000_000_000;
  const grants: agentsession = { id: "session", tabid: 4, origin: "https://example.com", startedat: now, expiresat: now + 1000, grants: ["https://example.com", "https://cdn.example"] };
  const profilestep = (kind: actionkind, reviewed: Record<string, unknown>): toolstep => ({ id: "p", kind, summary: "Profile the page", risk: "read", options: JSON.stringify(reviewed) });
  const approvedgrant: debuggergrant[] = [{ id: "g1", prompt: "Debugger attach", origin: "https://example.com", domains: ["Runtime"], approved: true, consentedat: now }];

  it("grades the profiling kinds: measurement read only, the heavy heap and cpu captures sensitive", () => {
    for (const kind of ["measureflow", "trackmemory", "watchshifts", "traceload", "annotatetrace", "replaytrace"] as const) {
      expect(actionrisk(kind)).toBe("read");
      expect(isprofilekind(kind)).toBe(true);
    }
    for (const kind of ["heapshot", "profilecpu", "capturesourcemaps"] as const) expect(actionrisk(kind)).toBe("sensitive");
    expect(isprofilekind("attachcdp")).toBe(false);
    expect(observationmodeof("measureflow")).toBe("watching");
    expect(observationmodeof("replaytrace")).toBe("passive");
    expect(requiredcapability("heapshot")).toBeUndefined();
  });

  it("gates every profiling kind behind the run tab, the granted target origins and the reviewed debugger grant", () => {
    const base = { session: grants, tabid: 4, origin: "https://example.com", now };
    expect(targetgate({ ...base, targets: [{ kind: "page", url: "https://example.com" }], grants: approvedgrant })).toEqual({ allowed: true });
    expect(targetgate({ ...base, targets: [{ kind: "iframe", url: "https://cdn.example/frame" }], grants: approvedgrant })).toEqual({ allowed: true });
    expect(targetgate({ ...base, targets: [{ kind: "worker", url: "https://elsewhere.example/worker.js" }], grants: approvedgrant }).reason).toContain("outside the granted origins");
    expect(targetgate({ ...base, targets: [{ kind: "serviceworker", url: "https://cdn.example/sw.js" }], grants: [] }).reason).toContain("reviewed debugger grant");
    expect(targetgate({ ...base, targets: [], grants: undefined })).toEqual({ allowed: true });
    expect(targetgate({ session: grants, tabid: 9, origin: "https://example.com", targets: [], grants: approvedgrant, now }).reason).toContain("refuses tab 9");
    expect(targetgate({ ...base, targets: [], grants: [{ ...approvedgrant[0]!, origin: "https://example.com", revokedat: now }] }).reason).toContain("reviewed debugger grant");
  });

  it("requires the per origin source map consent before any map file is fetched", () => {
    const approved = [{ id: "c1", prompt: "Source map capture", origin: "https://example.com", approved: true, consentedat: now }];
    expect(sourcemapconsentcovers("https://example.com", approved)).toEqual({ allowed: true });
    expect(sourcemapconsentcovers("https://elsewhere.example", approved).reason).toContain("per origin consent");
    expect(sourcemapconsentcovers("https://example.com", []).reason).toContain("per origin consent");
    expect(sourcemapconsentcovers("https://example.com", [{ ...approved[0]!, revokedat: now }]).reason).toContain("revoked");
  });

  it("validates the profiling options grammar of every kind", () => {
    expect(validatestep(profilestep("measureflow", { flow: { prefix: "flow", steps: ["s1"], metrics: ["navigation", "blocking"] }, watch: { window: 250 } }), "https://example.com")).toEqual({ allowed: true });
    expect(validatestep(profilestep("measureflow", { flow: { prefix: "flow", steps: [], metrics: ["navigation"] }, watch: { window: 250 } }), "https://example.com").reason).toContain("flow spec");
    expect(validatestep(profilestep("measureflow", { flow: { prefix: "flow", steps: ["s1"], metrics: ["nope"] }, watch: { window: 250 } }), "https://example.com").reason).toContain("flow spec");
    expect(validatestep(profilestep("measureflow", { flow: { prefix: "flow", steps: ["s1"], metrics: ["navigation"] } }), "https://example.com").reason).toContain("watch window");
    expect(validatestep(profilestep("measureflow", { flow: { prefix: "flow", steps: ["s1"], metrics: ["navigation"] }, watch: { window: 500 }, wait: 200 }), "https://example.com").reason).toContain("wait budget");
    expect(validatestep(profilestep("heapshot", {}), "https://example.com")).toEqual({ allowed: true });
    expect(validatestep(profilestep("heapshot", { heap: { interval: 1000 } }), "https://example.com")).toEqual({ allowed: true });
    expect(validatestep(profilestep("heapshot", { heap: { interval: -5 } }), "https://example.com").reason).toContain("interval");
    expect(validatestep(profilestep("trackmemory", { growth: { slope: 2, interval: 50 } }), "https://example.com")).toEqual({ allowed: true });
    expect(validatestep(profilestep("trackmemory", { growth: { interval: 50 } }), "https://example.com").reason).toContain("slope");
    expect(validatestep(profilestep("trackmemory", { growth: { slope: -1 } }), "https://example.com").reason).toContain("slope");
    expect(validatestep(profilestep("profilecpu", { profile: { duration: 400 } }), "https://example.com")).toEqual({ allowed: true });
    expect(validatestep(profilestep("profilecpu", { profile: { duration: 500 }, wait: 200 }), "https://example.com").reason).toContain("wait budget");
    expect(validatestep(profilestep("profilecpu", {}), "https://example.com").reason).toContain("duration");
    expect(validatestep(profilestep("watchshifts", { watch: { window: 300 }, threshold: 0.1 }), "https://example.com")).toEqual({ allowed: true });
    expect(validatestep(profilestep("watchshifts", { threshold: 0.1 }), "https://example.com").reason).toContain("observation window");
    expect(validatestep(profilestep("watchshifts", { watch: { window: 300 }, threshold: -1 }), "https://example.com").reason).toContain("threshold");
    expect(validatestep(profilestep("traceload", { trace: { categories: ["scripting", "network"], window: 300 } }), "https://example.com")).toEqual({ allowed: true });
    expect(validatestep(profilestep("traceload", { trace: { categories: ["secret"], window: 300 } }), "https://example.com").reason).toContain("category grammar");
    expect(validatestep(profilestep("traceload", { trace: { categories: ["scripting"] } }), "https://example.com").reason).toContain("window");
    expect(validatestep(profilestep("traceload", { trace: { categories: ["scripting"], window: 300, exporttarget: "clipboard" } }), "https://example.com").reason).toContain("export target");
    expect(validatestep(profilestep("annotatetrace", { trace: { traceid: "t1" }, annotations: [{ stepid: "s1", label: "open" }] }), "https://example.com")).toEqual({ allowed: true });
    expect(validatestep(profilestep("annotatetrace", { trace: { traceid: "t1" } }), "https://example.com").reason).toContain("step annotations");
    expect(validatestep(profilestep("annotatetrace", { annotations: [{ stepid: "s1", label: "open" }] }), "https://example.com").reason).toContain("trace id");
    expect(validatestep(profilestep("replaytrace", { trace: { traceid: "t1" } }), "https://example.com")).toEqual({ allowed: true });
    expect(validatestep(profilestep("replaytrace", {}), "https://example.com").reason).toContain("trace id");
    expect(validatestep(profilestep("capturesourcemaps", {}), "https://example.com")).toEqual({ allowed: true });
    expect(validatestep(profilestep("capturesourcemaps", { scripts: ["https://example.com/app.js"] }), "https://example.com")).toEqual({ allowed: true });
    expect(validatestep(profilestep("capturesourcemaps", { scripts: ["http://example.com/app.js"] }), "https://example.com").reason).toContain("HTTPS");
  });

  it("exposes the profile retention and the trace byte ceiling as user configured values only", () => {
    expect(profileretentionwindow(undefined)).toBeUndefined();
    expect(profileretentionwindow({ profileretention: 60_000 })).toBe(60_000);
    expect(traceceilingof(undefined)).toBeUndefined();
    expect(traceceilingof({ traceceiling: 500_000 })).toBe(500_000);
  });

  it("gates profiling execution behind the target gate and the origin grants of the scripts", () => {
    const plan: agentplan = { id: "plan", objective: "Profile", origin: "https://example.com", steps: [], createdat: now, expiresat: now + 1000, state: "approved" };
    const base = { session: grants, plan, tabid: 4, origin: "https://example.com", now };
    const flow = profilestep("measureflow", { flow: { prefix: "flow", steps: ["s1"], metrics: ["navigation"] }, watch: { window: 100 } });
    expect(canexecute({ ...base, step: flow })).toEqual({ allowed: true });
    const framed = profilestep("heapshot", { target: { kind: "iframe", url: "https://elsewhere.example/frame" } });
    expect(canexecute({ ...base, step: framed }).reason).toContain("outside the granted origins");
    const targetok = profilestep("heapshot", { target: { kind: "worker", url: "https://cdn.example/worker.js" } });
    expect(canexecute({ ...base, step: targetok })).toEqual({ allowed: true });
    const outside = profilestep("capturesourcemaps", { scripts: ["https://elsewhere.example/app.js"] });
    expect(canexecute({ ...base, step: outside }).reason).toContain("origin grants");
    const insidescripts = profilestep("capturesourcemaps", { scripts: ["https://cdn.example/app.js"] });
    expect(canexecute({ ...base, step: insidescripts })).toEqual({ allowed: true });
    expect(canexecute({ ...base, step: flow, session: undefined }).reason).toContain("No active browser session");
  });
});

describe("emulation policy", () => {
  const now = 1_800_000_000_000;
  const emusession: agentsession = { id: "session", tabid: 4, origin: "https://example.com", startedat: now, expiresat: now + 1000, grants: ["https://example.com"] };
  const emustep = (kind: actionkind, reviewed: Record<string, unknown>): toolstep => ({ id: "e", kind, summary: "Emulate the run tab", risk: "sensitive", options: JSON.stringify(reviewed) });
  const revertplan = ["restore the prior page state", "clear the mask registry"];
  const device = { name: "phone", width: 390, height: 844, pixelratio: 3, mobile: true };
  const network = { name: "slow3g", latency: 400, download: 400, upload: 400, offline: true };
  const location = { name: "lisbon", latitude: 38.7223, longitude: -9.1393, accuracy: 100 };
  const agent = { name: "desktopmask", useragent: "Mozilla/5.0 (X11; Linux x86_64) Chrome/120.0.0.0 Safari/537.36", platform: "Linux x86_64", brands: ["Chromium"] };

  it("grades the emulation kinds: the masks sensitive environment control, location spoofing sensitive with consent, blackboxing read only trace shaping", () => {
    for (const kind of ["emulatedevice", "emulatenetwork", "emulatelocate", "setuseragent", "overridepermission"] as const) expect(actionrisk(kind)).toBe("sensitive");
    expect(actionrisk("blackboxscripts")).toBe("read");
    expect(isemulationkind("emulatedevice")).toBe(true);
    expect(isemulationkind("click")).toBe(false);
    expect(observationmodeof("blackboxscripts")).toBe("passive");
    expect(requiredcapability("emulatedevice")).toBeUndefined();
  });

  it("requires review of every layer before it applies through the emugate", () => {
    const plan: agentplan = { id: "plan", objective: "Emulate", origin: "https://example.com", steps: [emustep("emulatedevice", { reviewed: true, device, revertplan })], createdat: now, expiresat: now + 1000, state: "approved" };
    const base = { session: emusession, plan, tabid: 4, origin: "https://example.com", now };
    expect(emugate({ ...base, step: emustep("emulatedevice", { reviewed: true, device, revertplan }) })).toEqual({ allowed: true });
    expect(emugate({ ...base, step: emustep("emulatedevice", { device, revertplan }) }).reason).toContain("reviewed flag");
    expect(emugate({ ...base, step: emustep("emulatedevice", { reviewed: true, device }) }).reason).toContain("revert plan");
    expect(emugate({ ...base, step: emustep("emulatedevice", { reviewed: true, device, revertplan }), plan: { ...plan, state: "pending" } }).reason).toContain("approved plan");
    expect(emugate({ ...base, step: emustep("emulatedevice", { reviewed: true, device, revertplan }), session: { ...emusession, tabid: 9 } }).reason).toContain("outside the approved tab");
  });

  it("allows stacking layers only when the reviewed plan lists the steps", () => {
    const one: agentplan = { id: "plan", objective: "Emulate", origin: "https://example.com", steps: [emustep("emulatedevice", { reviewed: true, device, revertplan })], createdat: now, expiresat: now + 1000, state: "approved" };
    expect(emulationstackallowed(one, "emulatedevice", 0)).toEqual({ allowed: true });
    expect(emulationstackallowed(one, "emulatedevice", 1).reason).toContain("stacking beyond the reviewed plan");
    const two: agentplan = { ...one, steps: [...one.steps, emustep("emulatedevice", { reviewed: true, device: { ...device, name: "tablet" }, revertplan })] };
    expect(emulationstackallowed(two, "emulatedevice", 1)).toEqual({ allowed: true });
    expect(emulationstackallowed(undefined, "emulatedevice", 0).reason).toContain("reviewed plan");
  });

  it("requires the location consent of the reviewed coordinates before the location layer applies", () => {
    const consents = [{ id: "c1", prompt: "Where?", origin: "https://example.com", latitude: 38.7223, longitude: -9.1393, approved: true, consentedat: now }];
    expect(locationconsentgate("https://example.com", 38.7223, -9.1393, consents)).toEqual({ allowed: true });
    expect(locationconsentgate("https://example.com", 41.3851, 2.1734, consents).reason).toContain("location consent");
    expect(locationconsentgate("https://example.com", 38.7223, -9.1393, []).reason).toContain("location consent");
    expect(locationconsentgate("https://example.com", 38.7223, -9.1393, [{ ...consents[0]!, revokedat: now }]).reason).toContain("revoked");
  });

  it("validates the emulation options grammar of every kind", () => {
    expect(validatestep(emustep("emulatedevice", { reviewed: true, device, revertplan }), "https://example.com")).toEqual({ allowed: true });
    expect(validatestep(emustep("emulatedevice", { reviewed: true, device: { ...device, width: 0 }, revertplan }), "https://example.com").reason).toContain("reviewed preset");
    expect(validatestep(emustep("emulatedevice", { reviewed: true, device, revertplan, reload: "yes" }), "https://example.com").reason).toContain("reload flag");
    expect(validatestep(emustep("emulatedevice", { reviewed: true, device }), "https://example.com").reason).toContain("revert plan");
    expect(validatestep(emustep("emulatenetwork", { reviewed: true, network, revertplan, window: 2000 }), "https://example.com")).toEqual({ allowed: true });
    expect(validatestep(emustep("emulatenetwork", { reviewed: true, network: { ...network, latency: -1 }, revertplan }), "https://example.com").reason).toContain("reviewed preset");
    expect(validatestep(emustep("emulatenetwork", { reviewed: true, network, revertplan, window: -1 }), "https://example.com").reason).toContain("offline window");
    expect(validatestep(emustep("emulatelocate", { reviewed: true, location, revertplan }), "https://example.com")).toEqual({ allowed: true });
    expect(validatestep(emustep("emulatelocate", { reviewed: true, location: { ...location, latitude: 91 }, revertplan }), "https://example.com").reason).toContain("reviewed preset");
    expect(validatestep(emustep("setuseragent", { reviewed: true, agent, revertplan }), "https://example.com")).toEqual({ allowed: true });
    expect(validatestep(emustep("setuseragent", { reviewed: true, agent: { ...agent, useragent: "no version" }, revertplan }), "https://example.com").reason).toContain("reviewed preset");
    expect(validatestep(emustep("setuseragent", { reviewed: true, agent: { ...agent, brands: [] }, revertplan }), "https://example.com").reason).toContain("reviewed preset");
    expect(validatestep(emustep("overridepermission", { reviewed: true, permission: { name: "geolocation", state: "granted", runscope: true }, revertplan }), "https://example.com")).toEqual({ allowed: true });
    expect(validatestep(emustep("overridepermission", { reviewed: true, permission: { name: "screen-capture", state: "granted" }, revertplan }), "https://example.com").reason).toContain("browser permission set");
    expect(validatestep(emustep("blackboxscripts", { reviewed: true, rules: [{ urlpatterns: ["https://cdn.example/**"], tracescope: "both" }], revertplan }), "https://example.com")).toEqual({ allowed: true });
    expect(validatestep(emustep("blackboxscripts", { reviewed: true, rules: [], revertplan }), "https://example.com").reason).toContain("non-empty rule list");
  });

  it("validates the permission names and states of an override", () => {
    expect(permissionnamevalid("geolocation")).toEqual({ allowed: true });
    expect(permissionnamevalid("screen-capture").reason).toContain("browser permission set");
    expect(permissionstatevalid("granted")).toEqual({ allowed: true });
    expect(permissionstatevalid("maybe").reason).toContain("permission state");
  });

  it("exposes the reverted layer state retention as a user configured value only", () => {
    expect(emulationretentionwindow(undefined)).toBeUndefined();
    expect(emulationretentionwindow({ emulationretention: 50 })).toBe(50);
  });

  it("gates emulation execution behind the emugate inside canexecute", () => {
    const step = emustep("emulatedevice", { reviewed: true, device, revertplan });
    const plan: agentplan = { id: "plan", objective: "Emulate", origin: "https://example.com", steps: [step], createdat: now, expiresat: now + 1000, state: "approved" };
    const base = { session: emusession, plan, tabid: 4, origin: "https://example.com", now };
    expect(canexecute({ ...base, step })).toEqual({ allowed: true });
    expect(canexecute({ ...base, step: emustep("emulatedevice", { device, revertplan }) }).reason).toContain("reviewed flag");
    expect(canexecute({ ...base, step: emustep("emulatelocate", { reviewed: true, location: { name: "x", latitude: 91, longitude: 0, accuracy: 1 }, revertplan }) }).reason).toContain("reviewed preset");
    expect(canexecute({ ...base, step, plan: { ...plan, state: "pending" } }).reason).toContain("explicit approval");
    expect(canexecute({ ...base, step, session: undefined }).reason).toContain("No active browser session");
  });
});

describe("workflow editor policy", () => {
  const now = 1_800_000_000_000;
  const session: agentsession = { id: "sess", tabid: 4, origin: "https://example.com", startedat: now - 1000, expiresat: now + 600_000, grants: ["https://example.com"] };
  const plan: agentplan = { id: "run", objective: "Edit the workflow", origin: "https://example.com", steps: [], createdat: now - 2000, expiresat: now + 600_000, state: "approved" };
  const model = { workflowid: "wf1", name: "canvas", version: 1, origins: ["https://example.com"], nodes: [{ step: { id: "s1", kind: "wait" as actionkind, label: "Wait" }, x: 40, y: 60 }], edges: [], blocks: [], layout: { width: 640, height: 480, viewportx: 0, viewporty: 0, zoom: 1 }, minimap: { width: 160, height: 100, scale: 1, zoom: 1, viewport: { x: 0, y: 0, width: 160, height: 100 } }, dirty: false };

  it("gates editor saves behind the session and the approved plan review", () => {
    expect(editorsavegate({ session, plan, model, now }).allowed).toBe(true);
    expect(editorsavegate({ session: undefined, plan, model, now }).reason).toBe("No active browser session exists.");
    expect(editorsavegate({ session, plan: undefined, model, now }).allowed).toBe(false);
    expect(editorsavegate({ session, plan, model: { ...model, nodes: [] }, now }).allowed).toBe(true);
  });

  it("keeps imported workflows unrunnable until the import review approves them", () => {
    expect(runreviewgranted({ ...model, reviewstate: "pending" } as never).allowed).toBe(false);
    expect(runreviewgranted({ ...model } as never).allowed).toBe(true);
  });

  it("validates per site overrides and refuses secret fields in exports", () => {
    expect(validatesiteoverride({ pattern: "https://*.example.com", deltas: { loopbound: 5 } }).allowed).toBe(true);
    expect(validatesiteoverride({ pattern: "https://example.com", deltas: { unknown: 5 } }).allowed).toBe(false);
    const clean = { id: "wf", name: "w", version: 1, origins: ["https://example.com"], steps: [{ id: "s1", kind: "wait" as actionkind, label: "Wait" }], blocks: [], risk: "read" as const, createdat: now };
    expect(exportcontentreview({ workflow: clean, templates: [] }).allowed).toBe(true);
    expect(exportcontentreview({ workflow: { ...clean, steps: [{ ...clean.steps[0] as object, options: "{\"authorization\":\"Bearer x\"}" } as never] } as never, templates: [] }).allowed).toBe(false);
    expect(watchdogconfigvalid({ enabled: true, stallthreshold: 1, action: "retry" }).allowed).toBe(true);
    expect(watchdogconfigvalid({ enabled: true, stallthreshold: 1, action: "retry", zombiewindow: -1 }).allowed).toBe(false);
  });
});

describe("agent protocol policy", () => {
  it("validates tool schemas against the action kind grammar and refuses drifted catalogs", () => {
    const catalog = buildtoolcatalog();
    expect(validatetoolcatalog(catalog).allowed).toBe(true);
    const click = catalog.domains[0]?.tools.find(tool => tool.name === "browser.click") as tooldef;
    expect(validatetoolcatalog({ version: 1, domains: [{ ...catalog.domains[0] as tooldomain, tools: [{ ...click, kind: "notakind" as never }] }] }).allowed).toBe(false);
    expect(validatetoolcatalog({ version: 1, domains: [{ ...catalog.domains[0] as tooldomain, tools: [{ ...click, description: "" }] }] }).allowed).toBe(false);
    expect(validatetoolcatalog({ version: 1, domains: [{ ...catalog.domains[0] as tooldomain, tools: [{ ...click, inputschema: { type: "object" as never, properties: {}, required: [] } }] }] }).allowed).toBe(false);
    expect(actionrisk("listruns")).toBe("read");
    expect(validatestep({ id: "l1", kind: "listruns", summary: "List the stored workflow run records.", risk: "read" }, "https://example.com")).toEqual({ allowed: true });
  });

  it("grades every tooldef with the risk class of its action kind and requires consentmeta on side effects", () => {
    const tools = buildtoolcatalog().domains.flatMap(domain => domain.tools);
    for (const tool of tools) {
      expect(toolriskgrade(tool).allowed).toBe(true);
      expect(toolconsentrequired(tool).allowed).toBe(true);
      expect(toolnamespacegate(tool).allowed).toBe(true);
      expect(toolversionfloor(tool, 1).allowed).toBe(true);
    }
    const click = tools.find(tool => tool.name === "browser.click") as tooldef;
    expect(toolriskgrade({ ...click, risk: "read" }).allowed).toBe(false);
    const { consentmeta: omitted, ...bareclick } = click;
    void omitted;
    expect(toolconsentrequired(bareclick).allowed).toBe(false);
    expect(toolconsentrequired({ ...click, consentmeta: { review: "" } }).allowed).toBe(false);
    const snapshot = tools.find(tool => tool.name === "browser.snapshot") as tooldef;
    expect(toolconsentrequired(snapshot).allowed).toBe(true);
    expect(toolversionfloor({ ...click, version: 0 }, 1).allowed).toBe(false);
    expect(toolversionfloor({ ...click, version: 1 }, 1).allowed).toBe(true);
    expect(toolnamespacegate({ ...click, kind: "composeworkflow" }).allowed).toBe(false);
  });

  it("keeps the localhost bind as the default, grades remote binding sensitive and requires explicit enablement", () => {
    expect(serverbindgate(defaultmcpconfig()).allowed).toBe(true);
    expect(serverbindgate({ ...defaultmcpconfig(), bind: "0.0.0.0" }).allowed).toBe(false);
    expect(serverbindgate({ ...defaultmcpconfig(), bind: "0.0.0.0", remote: true }).allowed).toBe(true);
    expect(serverbindgate({ ...defaultmcpconfig(), bind: "localhost" }).allowed).toBe(true);
    expect(serverenablementgate(defaultmcpconfig()).allowed).toBe(false);
    expect(serverenablementgate({ ...defaultmcpconfig(), enabled: true }).allowed).toBe(true);
    expect(serverenablementgate({ ...defaultmcpconfig(), enabled: true, transports: [] }).allowed).toBe(false);
    expect(serverenablementgate({ ...defaultmcpconfig(), enabled: true, transports: ["stdio", "carrierpigeon" as never] }).allowed).toBe(false);
    expect(serverenablementgate({ ...defaultmcpconfig(), enabled: true, port: 0 }).allowed).toBe(false);
    expect(serverenablementgate({ ...defaultmcpconfig(), enabled: true, port: 70_000 }).allowed).toBe(false);
    expect(serverenablementgate({ ...defaultmcpconfig(), enabled: true, framesize: 0 }).allowed).toBe(false);
    expect(serverenablementgate({ ...defaultmcpconfig(), enabled: true, queuedepth: -1 }).allowed).toBe(false);
    expect(serverenablementgate({ ...defaultmcpconfig(), enabled: true, framesize: 100_000, queuedepth: 50 }).allowed).toBe(true);
    expect(serverenablementgate({ ...defaultmcpconfig(), enabled: true, bind: "0.0.0.0" }).allowed).toBe(false);
  });

  it("gates tool dispatch on the pairing, session, plan, origin and the approved step", () => {
    const click = buildtoolcatalog().domains[0]?.tools.find(tool => tool.name === "browser.click") as tooldef;
    const read = buildtoolcatalog().domains[0]?.tools.find(tool => tool.name === "browser.readtext") as tooldef;
    const client: clientrecord = { id: "client1", transport: "stdio", paired: true, connectedat: now };
    const grantsession: agentsession = { ...session, grants: ["https://example.com"] };
    const approvedplan: agentplan = { ...plan, steps: [{ ...step, id: "c1", kind: "click" }, { id: "o1", kind: "observe", summary: "Snapshot", risk: "read" }] };
    expect(tooldispatchgate({ client, tool: read, session: grantsession, plan: approvedplan, origin: "https://example.com", now }).allowed).toBe(true);
    expect(tooldispatchgate({ client, tool: click, session: grantsession, plan: approvedplan, origin: "https://example.com", stepid: "c1", now }).allowed).toBe(true);
    expect(tooldispatchgate({ client: { ...client, paired: false }, tool: read, session: grantsession, plan: approvedplan, origin: "https://example.com", now }).allowed).toBe(false);
    expect(tooldispatchgate({ client: { ...client, disconnectedat: now }, tool: read, session: grantsession, plan: approvedplan, origin: "https://example.com", now }).allowed).toBe(false);
    expect(tooldispatchgate({ client, tool: read, session: { ...grantsession, stoppedat: now - 1 }, plan: approvedplan, origin: "https://example.com", now }).allowed).toBe(false);
    expect(tooldispatchgate({ client, tool: read, session: { ...grantsession, pausedat: now - 1 }, plan: approvedplan, origin: "https://example.com", now }).allowed).toBe(false);
    expect(tooldispatchgate({ client, tool: read, session: { ...grantsession, expiresat: now - 1 }, plan: approvedplan, origin: "https://example.com", now }).allowed).toBe(false);
    expect(tooldispatchgate({ client, tool: read, session: grantsession, plan: { ...approvedplan, state: "pending" }, origin: "https://example.com", now }).allowed).toBe(false);
    expect(tooldispatchgate({ client, tool: read, session: grantsession, plan: approvedplan, origin: "https://other.example", now }).allowed).toBe(false);
    expect(tooldispatchgate({ client, tool: click, session: grantsession, plan: approvedplan, origin: "https://example.com", now }).allowed).toBe(false);
    expect(tooldispatchgate({ client, tool: click, session: grantsession, plan: approvedplan, origin: "https://example.com", stepid: "o1", now }).allowed).toBe(false);
    expect(tooldispatchgate({ client, tool: click, session: grantsession, plan: approvedplan, origin: "https://example.com", stepid: "missing", now }).allowed).toBe(false);
  });
});

describe("agent protocol part two policy", () => {
  const now = 1_800_000_000_000;
  const livesession = { id: "sess", tabid: 7, origin: "https://example.com", startedat: now - 5000, expiresat: now + 600_000, grants: ["https://example.com"] };

  it("validates allowlist entries against the known client identities", () => {
    const identities = [{ fingerprint: "aa11", displayname: "Laptop agent" }];
    expect(allowlistentryvalid({ fingerprint: "aa11", displayname: "Laptop agent", namespaces: ["browser"], grantedat: now, history: [] }, identities).allowed).toBe(true);
    expect(allowlistentryvalid({ fingerprint: "bb22", displayname: "Stranger", namespaces: ["browser"], grantedat: now, history: [] }, identities).allowed).toBe(false);
    expect(allowlistentryvalid({ fingerprint: "aa11", displayname: "Laptop agent", namespaces: ["browser"], grantedat: now, history: [] }, []).allowed).toBe(false);
    expect(allowlistentryvalid({ fingerprint: "aa11", displayname: "", namespaces: ["browser"], grantedat: now, history: [] }, identities).allowed).toBe(false);
    expect(allowlistentryvalid({ fingerprint: "aa11", displayname: "Laptop agent", namespaces: [], grantedat: now, history: [] }, identities).allowed).toBe(false);
    expect(allowlistentryvalid({ fingerprint: "aa11", displayname: "Laptop agent", namespaces: ["carrierpigeon" as never], grantedat: now, history: [] }, identities).allowed).toBe(false);
    expect(allowlistentryvalid({ fingerprint: "", displayname: "Laptop agent", namespaces: ["browser"], grantedat: now, history: [] }, identities).allowed).toBe(false);
  });

  it("validates token lifetimes and approval timeouts as user configured values", () => {
    expect(tokenlifetimevalid(undefined).allowed).toBe(true);
    expect(tokenlifetimevalid(60_000).allowed).toBe(true);
    expect(tokenlifetimevalid(0).allowed).toBe(false);
    expect(tokenlifetimevalid(-1).allowed).toBe(false);
    expect(tokenlifetimevalid(Number.NaN).allowed).toBe(false);
    expect(approvaltimeoutvalid(undefined).allowed).toBe(true);
    expect(approvaltimeoutvalid({ windowms: 30_000, ontimeout: "refuse" }).allowed).toBe(true);
    expect(approvaltimeoutvalid({ windowms: 0, ontimeout: "refuse" }).allowed).toBe(false);
    expect(approvaltimeoutvalid({ windowms: 30_000, ontimeout: "approve" as never }).allowed).toBe(false);
  });

  it("requires tls for any non localhost transport and the explicit review for remote enablement", () => {
    expect(remotetransporttls(defaultmcpconfig()).allowed).toBe(true);
    expect(remotetransporttls({ ...defaultmcpconfig(), bind: "0.0.0.0" }).allowed).toBe(false);
    expect(remotetransporttls({ ...defaultmcpconfig(), bind: "0.0.0.0", httpstream: { endpoint: "/mcp", streampath: "/mcp/stream", tls: { mode: "on" } } }).allowed).toBe(true);
    expect(remotetransporttls({ ...defaultmcpconfig(), remoteaccess: { endpoint: "https://agent.example", tls: { mode: "off" as const } } }).allowed).toBe(false);
    expect(remotetransporttls({ ...defaultmcpconfig(), remoteaccess: { endpoint: "https://agent.example", tls: { mode: "required" as const } } }).allowed).toBe(true);
    expect(remoteenablementgate(defaultmcpconfig()).allowed).toBe(true);
    expect(remoteenablementgate({ ...defaultmcpconfig(), remoteaccess: { endpoint: "https://agent.example", tls: { mode: "required" as const } } }).allowed).toBe(false);
    const reviewed = { ...defaultmcpconfig(), remote: true, remoteaccess: { endpoint: "https://agent.example", tls: { mode: "required" as const } } };
    expect(remoteenablementgate(reviewed).allowed).toBe(true);
    expect(remoteenablementgate({ ...reviewed, remoteaccess: { endpoint: "", tls: { mode: "required" as const } } }).allowed).toBe(false);
    expect(remoteenablementgate({ ...reviewed, remoteaccess: { endpoint: "https://agent.example", tls: { mode: "required" }, maxclients: 0 } }).allowed).toBe(false);
    expect(remoteenablementgate({ ...reviewed, remoteaccess: { endpoint: "https://agent.example", tls: { mode: "required" }, maxclients: 5 } }).allowed).toBe(true);
    expect(remoteenablementgate({ ...reviewed, remoteaccess: { endpoint: "https://agent.example", tls: { mode: "required" }, tokenlifetimems: 0 } }).allowed).toBe(false);
    expect(remoteenablementgate({ ...reviewed, remoteaccess: { endpoint: "https://agent.example", tls: { mode: "required" }, approvaltimeout: { windowms: 0, ontimeout: "refuse" } } }).allowed).toBe(false);
    expect(serverenablementgate({ ...reviewed, enabled: true }).allowed).toBe(true);
    expect(serverenablementgate({ ...defaultmcpconfig(), enabled: true, remoteaccess: { endpoint: "https://agent.example", tls: { mode: "required" as const } } }).allowed).toBe(false);
  });

  it("refuses pairing without a live session and grades revocation as always available", () => {
    expect(pairingreadinessgate(livesession, now).allowed).toBe(true);
    expect(pairingreadinessgate(undefined, now).allowed).toBe(false);
    expect(pairingreadinessgate({ ...livesession, stoppedat: now - 1 }, now).allowed).toBe(false);
    expect(pairingreadinessgate({ ...livesession, pausedat: now - 1 }, now).allowed).toBe(false);
    expect(pairingreadinessgate({ ...livesession, expiresat: now - 1 }, now).allowed).toBe(false);
    expect(revocationgate().allowed).toBe(true);
  });

  it("limits token scopes to the namespaces the user granted", () => {
    expect(tokenscopevalid(["browser"], ["browser", "memory"]).allowed).toBe(true);
    expect(tokenscopevalid([], ["browser"]).allowed).toBe(false);
    expect(tokenscopevalid(["carrierpigeon" as never], ["browser"]).allowed).toBe(false);
    expect(tokenscopevalid(["memory"], ["browser"]).allowed).toBe(false);
    expect(tokenscopevalid(["browser", "memory"], ["browser", "memory", "system"]).allowed).toBe(true);
  });
});

describe("agent protocol part three policy", () => {
  it("grades subscriptions as read only when the filters exclude the mutation mirror", () => {
    const base = { id: "sub1", clientid: "client1", createdat: now };
    expect(subscriptiongrade({ ...base, kinds: ["callresult", "progress"] }).allowed).toBe(true);
    expect(subscriptiongrade({ ...base, kinds: [] }).allowed).toBe(false);
    expect(subscriptiongrade({ ...base, kinds: ["callstarted"] }).allowed).toBe(false);
    expect(subscriptiongrade({ ...base, kinds: ["callstarted"], origin: "https://example.com" }).allowed).toBe(true);
    expect(subscriptiongrade({ ...base, kinds: ["callstarted", "progress"], tool: "browser.click" }).allowed).toBe(true);
  });

  it("grades sampling callbacks as sensitive behind the page content grant", () => {
    const request = { id: "sample1", clientid: "client1", prompt: "Summarize the run.", state: "pending" as const, requestedat: now };
    expect(samplinggrade({ request, pagegrant: true }).allowed).toBe(true);
    expect(samplinggrade({ request: { ...request, pagecontent: "the page text" }, pagegrant: true }).allowed).toBe(true);
    expect(samplinggrade({ request: { ...request, pagecontent: "the page text" }, pagegrant: false }).allowed).toBe(false);
    expect(samplinggrade({ request: { ...request, maxtokens: 0 }, pagegrant: true }).allowed).toBe(false);
    expect(samplinggrade({ request: { ...request, prompt: " " }, pagegrant: true }).allowed).toBe(false);
  });

  it("validates rate limits as user configured values with no silent defaults", () => {
    expect(callratelimitvalid(undefined).allowed).toBe(true);
    expect(callratelimitvalid({ clientid: "client1", windowms: 60_000, budget: 5, windowstartedat: now, used: 0 }).allowed).toBe(true);
    expect(callratelimitvalid({ clientid: "client1", windowms: 0, windowstartedat: now, used: 0 }).allowed).toBe(false);
    expect(callratelimitvalid({ clientid: "client1", windowms: 60_000, budget: 0, windowstartedat: now, used: 0 }).allowed).toBe(false);
    expect(callratelimitvalid({ clientid: "client1", windowms: 60_000, windowstartedat: now, used: 0 }).allowed).toBe(true);
    expect(callratelimitvalid({ clientid: " ", windowms: 60_000, windowstartedat: now, used: 0 }).allowed).toBe(false);
  });

  it("requires one audit entry for every tool call without exception", () => {
    const one = { id: "call1", clientid: "client1", tool: "browser.readtext", origin: "https://example.com", ok: true, at: now };
    const two = { id: "call2", clientid: "client1", tool: "memory.list", origin: "https://example.com", ok: false, at: now + 1 };
    expect(callauditcomplete({ calls: [one, two], audit: [one, two] }).allowed).toBe(true);
    expect(callauditcomplete({ calls: [one, two], audit: [one] }).allowed).toBe(false);
    expect(callauditcomplete({ calls: [], audit: [] }).allowed).toBe(true);
  });

  it("grades batch calls by their most sensitive member", () => {
    expect(batchgrade({ calls: [{ risk: "read" }], approved: false }).allowed).toBe(true);
    expect(batchgrade({ calls: [], approved: true }).allowed).toBe(false);
    expect(batchgrade({ calls: [{ risk: "read" }, { risk: "sensitive" }], approved: false }).allowed).toBe(false);
    expect(batchgrade({ calls: [{ risk: "sensitive" }], approved: true }).allowed).toBe(true);
  });

  it("keeps dry run results free of page mutations and mocks inside test contexts", () => {
    const dry = { callid: "call1", tool: "browser.click", argsvalid: true, consentok: true, findings: [], executed: false, mutations: [], at: now };
    expect(dryrunpurity(dry).allowed).toBe(true);
    expect(dryrunpurity({ ...dry, executed: true }).allowed).toBe(false);
    expect(dryrunpurity({ ...dry, mutations: ["clicked #go"] }).allowed).toBe(false);
    const mock = { tool: "browser.readtext", result: { content: "canned", iserror: false }, testcontext: true, createdat: now };
    expect(mockusagevalid(mock).allowed).toBe(true);
    expect(mockusagevalid({ ...mock, testcontext: false }).allowed).toBe(false);
    expect(mockusagevalid({ ...mock, tool: " " }).allowed).toBe(false);
    expect(mockusagevalid({ ...mock, result: { content: 42 as never, iserror: false } }).allowed).toBe(false);
  });
});

describe("policy llm integration gates", () => {
  /** Builds one provider config fixture with every value user configured. */
  function provider(over: Partial<providerconfig> = {}): providerconfig {
    return { id: "prov1", name: "The gateway", endpoint: "https://gateway.example/v1", style: "chatcompletions", models: ["model-a"], status: "available", createdat: now, ...over };
  }

  it("validates provider configs as user configured values with no hardcoded defaults", () => {
    expect(providervalid(provider()).allowed).toBe(true);
    expect(providervalid(provider({ endpoint: "" })).reason).toMatch(/user configured endpoint/i);
    expect(providervalid(provider({ endpoint: "ftp://gateway.example" })).reason).toMatch(/http or https/i);
    expect(providervalid(provider({ models: [] })).reason).toMatch(/model name/i);
    expect(providervalid(provider({ style: "proprietary" as never })).reason).toMatch(/wire shapes/i);
    expect(providervalid(provider({ authref: { name: "k", origins: [], header: "authorization", storageid: " ", configuredat: now } })).reason).toMatch(/storage id/i);
  });

  it("grades every provider call as a data egress event for audit", () => {
    const remote = provideregressgrade({ provider: provider(), local: false });
    expect(remote.allowed).toBe(true);
    expect(remote.reason).toMatch(/data egress/i);
    const local = provideregressgrade({ provider: provider({ endpoint: "http://127.0.0.1:8080/v1" }), local: true });
    expect(local.reason).toMatch(/local machine/i);
    expect(provideregressgrade({ provider: provider({ endpoint: " " }), local: false }).allowed).toBe(false);
  });

  it("requires explicit consent before page content leaves the browser", () => {
    expect(egressconsentgate({ pagecontent: "the page text", granted: false }).allowed).toBe(false);
    expect(egressconsentgate({ pagecontent: "the page text", granted: true }).allowed).toBe(true);
    expect(egressconsentgate({ granted: false }).allowed).toBe(true);
  });

  it("grades the local endpoint preference for sensitive extractions", () => {
    expect(localsensitivegrade({ sensitive: true, local: false }).reason).toMatch(/prefers the local/i);
    expect(localsensitivegrade({ sensitive: true, local: true }).reason).toMatch(/satisfies/i);
    expect(localsensitivegrade({ sensitive: false, local: false }).allowed).toBe(true);
  });

  it("requires the plan review before any model drafted plan executes", () => {
    const draft: plandraft = { id: "d1", goal: "Read the page", steps: [{ id: "s1", kind: "observe", summary: "Observe the page." }], openquestions: [], providerid: "prov1", model: "model-a", state: "approved", lintfindings: [], createdat: now };
    expect(plandraftreviewgate(draft).allowed).toBe(true);
    expect(plandraftreviewgate({ ...draft, state: "draft" }).reason).toMatch(/unreviewed/i);
    expect(plandraftreviewgate({ ...draft, steps: [] }).reason).toMatch(/no step/i);
  });

  it("requires fresh review for the replanned tail steps", () => {
    const replan: replanrecord = { id: "r1", draftid: "d1", completedstepids: ["s1"], failedstepids: ["s2"], tail: [{ id: "t1", kind: "reload", summary: "Reload.", freshreview: true }], reason: "The step timed out.", providerid: "prov1", model: "model-a", state: "approved", createdat: now };
    expect(replanreviewgate(replan).allowed).toBe(true);
    expect(replanreviewgate({ ...replan, state: "pending" }).reason).toMatch(/fresh review/i);
    expect(replanreviewgate({ ...replan, tail: [{ id: "t1", kind: "reload", summary: "Reload." }] }).reason).toMatch(/fresh review marker/i);
  });

  it("validates cost budget ceilings as user configured values", () => {
    expect(costbudgetvalid({ maxtokens: 1000, configuredat: now }).allowed).toBe(true);
    expect(costbudgetvalid({ maxcost: 5, currency: "usd", configuredat: now }).allowed).toBe(true);
    expect(costbudgetvalid({ maxtokens: 0, configuredat: now }).reason).toMatch(/positive/i);
    expect(costbudgetvalid({ maxcost: -1, currency: "usd", configuredat: now }).reason).toMatch(/positive/i);
    expect(costbudgetvalid({ maxcost: 5, configuredat: now }).reason).toMatch(/currency/i);
    expect(costbudgetvalid({ configuredat: now }).reason).toMatch(/at least one ceiling/i);
  });

  it("refuses tool calls the guardrails marked invalid or refused", () => {
    expect(guardverdictgate({ raw: "{}", parsed: {}, verdict: "valid", attempts: 1 }).allowed).toBe(true);
    const invalid: modeloutput = { raw: "nope", verdict: "invalid", reason: "The model answer is not json.", attempts: 3 };
    expect(guardverdictgate(invalid).reason).toMatch(/not json/i);
    const refused: modeloutput = { raw: "I cannot comply.", verdict: "refused", reason: "The model refused the request.", attempts: 1 };
    expect(guardverdictgate(refused).allowed).toBe(false);
  });

  it("lints model drafts against the action grammar before review", () => {
    const draft: plandraft = { id: "d1", goal: "Do things", steps: [{ id: "s1", kind: "teleport", summary: "Teleport." }, { id: "s2", kind: "click", summary: "Click nothing." }, { id: "s3", kind: "navigate", target: "#nav", value: "https://example.com", summary: "Open the page." }], openquestions: [], providerid: "prov1", model: "model-a", state: "draft", lintfindings: [], createdat: now };
    const findings = planlint(draft, "https://example.com");
    expect(findings.length).toBe(2);
    expect(findings.join(" ")).toMatch(/teleport/);
    expect(findings.join(" ")).toMatch(/page target/);
  });
});

describe("multi agent policy gates", () => {
  it("validates the task queue lanes, priorities and completion policy as user configured", () => {
    expect(queuelanesvalid({ lanes: ["extraction", "review"], priorities: [1, 2, 3], completionpolicy: "all", items: [], claims: [] })).toMatchObject({ allowed: true });
    expect(queuelanesvalid({ lanes: ["extraction", "extraction"], priorities: [], completionpolicy: "all", items: [], claims: [] }).allowed).toBe(false);
    expect(queuelanesvalid({ lanes: [" "], priorities: [], completionpolicy: "all", items: [], claims: [] }).allowed).toBe(false);
    expect(queuelanesvalid({ lanes: [], priorities: [Number.NaN], completionpolicy: "all", items: [], claims: [] }).allowed).toBe(false);
    expect(queuelanesvalid({ lanes: [], priorities: [], completionpolicy: "sometimes" as never, items: [], claims: [] }).allowed).toBe(false);
    const withitem = { lanes: ["extraction"], priorities: [1], completionpolicy: "all" as const, items: [{ id: "t1", lane: "review", priority: 1, payload: "Task", state: "queued" as const, enqueuedat: now }], claims: [] };
    expect(queuelanesvalid(withitem).reason).toMatch(/did not configure/i);
    const withpriority = { ...withitem, items: [{ id: "t1", lane: "extraction", priority: 9, payload: "Task", state: "queued" as const, enqueuedat: now }] };
    expect(queuelanesvalid(withpriority).reason).toMatch(/priority 9/i);
  });

  it("permits work stealing only inside one user approved swarm with the lane ownership rules", () => {
    expect(workstealgrade({ swarmapproved: true, agentrole: "worker", lane: "review" })).toMatchObject({ allowed: true });
    expect(workstealgrade({ swarmapproved: false, agentrole: "worker", lane: "review" }).reason).toMatch(/approved swarm/i);
    expect(workstealgrade({ swarmapproved: true, agentrole: "worker", lane: "review", ownership: [{ lane: "review", roles: ["planner"] }] }).allowed).toBe(false);
    expect(workstealgrade({ swarmapproved: true, agentrole: "planner", lane: "review", ownership: [{ lane: "review", roles: ["planner"] }] })).toMatchObject({ allowed: true });
  });

  it("validates the per agent budget ceilings as positive user values", () => {
    expect(agentbudgetvalid({ agentid: "a1", maxtokens: 1000, maxsteps: 5, configuredat: now })).toMatchObject({ allowed: true });
    expect(agentbudgetvalid({ agentid: "a1", maxcost: 2, currency: "usd", configuredat: now })).toMatchObject({ allowed: true });
    expect(agentbudgetvalid({ agentid: "a1", maxtokens: 0, configuredat: now }).reason).toMatch(/positive/i);
    expect(agentbudgetvalid({ agentid: "a1", maxcost: 1, configuredat: now }).reason).toMatch(/currency/i);
    expect(agentbudgetvalid({ agentid: "a1", maxsteps: -1, configuredat: now }).reason).toMatch(/positive/i);
    expect(agentbudgetvalid({ agentid: "a1", configuredat: now }).reason).toMatch(/at least one ceiling/i);
    expect(agentbudgetvalid({ agentid: " ", maxtokens: 1, configuredat: now }).reason).toMatch(/agent id/i);
  });

  it("validates the per agent scope grants against the session grant list", () => {
    const grants = ["https://example.com", "https://other.example"];
    expect(agentscopevalid({ scope: { agentid: "a1", origins: ["https://example.com"], toolnamespaces: ["memory", "system"] }, grants })).toMatchObject({ allowed: true });
    expect(agentscopevalid({ scope: { agentid: "a1", origins: ["https://outside.example"], toolnamespaces: [] }, grants }).reason).toMatch(/does not carry/i);
    expect(agentscopevalid({ scope: { agentid: "a1", origins: [], toolnamespaces: ["kitchen" as never] }, grants }).reason).toMatch(/catalog namespaces/i);
    expect(agentscopevalid({ scope: { agentid: " ", origins: [], toolnamespaces: [] }, grants }).reason).toMatch(/agent id/i);
    expect(agentscopevalid({ scope: { agentid: "a1", origins: [" "], toolnamespaces: [] }, grants }).reason).toMatch(/user configured name/i);
  });

  it("grades the spawn requests with the risk class of the requested role", () => {
    expect(spawngrade({ parentid: "a1", role: "worker", task: "Extract", depth: 1 }).reason).toMatch(/grades sensitive/i);
    expect(spawngrade({ parentid: "a1", role: "observer", task: "Watch", depth: 2 }).reason).toMatch(/grades read/i);
    expect(spawngrade({ parentid: "a1", role: "auditor", task: "Audit", depth: 1 }).reason).toMatch(/grades sensitive/i);
    expect(spawngrade({ parentid: " ", role: "worker", task: "Extract", depth: 1 }).reason).toMatch(/parent/i);
    expect(spawngrade({ parentid: "a1", role: "worker", task: " ", depth: 1 }).reason).toMatch(/task/i);
    expect(spawngrade({ parentid: "a1", role: "worker", task: "Extract", depth: 0 }).reason).toMatch(/depth/i);
  });

  it("keeps the killswitch available with no configuration barrier", () => {
    expect(killswitchgate()).toMatchObject({ allowed: true });
    expect(killswitchgate().reason).toMatch(/no configuration barrier/i);
  });

  it("grades the cross agent messages that carry page content as egress", () => {
    const message = { id: "m1", senderid: "a1", recipient: "a2", routing: "direct" as const, payload: "The table is ready.", sentat: now };
    expect(messageegressgrade({ message, carriespagecontent: false }).reason).toMatch(/no page content/i);
    expect(messageegressgrade({ message, carriespagecontent: true }).reason).toMatch(/data egress event/i);
    expect(messageegressgrade({ message: { ...message, payload: " " }, carriespagecontent: false }).reason).toMatch(/payload/i);
  });

  it("grades the blackboard entries by the inherited consent class of the source extraction", () => {
    expect(blackboardconsentgrade({ id: "e1", key: "fact", valuekind: "text", value: "v", author: "a1", section: "facts", consentclass: "read", postedat: now }).reason).toMatch(/read class/i);
    expect(blackboardconsentgrade({ id: "e1", key: "form", valuekind: "text", value: "v", author: "a1", section: "findings", consentclass: "sensitive", postedat: now }).reason).toMatch(/sensitive class/i);
    expect(blackboardconsentgrade({ id: "e1", key: "form", valuekind: "text", value: "v", author: "a1", section: "findings", consentclass: "secret" as never, postedat: now }).reason).toMatch(/three consent classes/i);
    expect(blackboardconsentgrade({ id: "e1", key: " ", valuekind: "text", value: "v", author: "a1", section: "facts", consentclass: "read", postedat: now }).reason).toMatch(/key/i);
  });
});

describe("multi agent part two gates", () => {
  const now = 1_800_000_000_000;
  const agents: agentidentity[] = [
    { id: "a1", name: "Scout", role: "worker", depth: 0, state: "active", registeredat: now },
    { id: "a2", name: "Scribe", role: "critic", depth: 0, state: "paused", registeredat: now }
  ];

  it("validates the leader election rule as the user configured it", () => {
    expect(leaderelectionvalid({ rule: { kind: "first" }, agents }).allowed).toBe(true);
    expect(leaderelectionvalid({ rule: { kind: "named", agentid: "a1" }, agents }).reason).toMatch(/named rule elects the agent a1/i);
    expect(leaderelectionvalid({ rule: { kind: "named" }, agents }).reason).toMatch(/agent id the user named/i);
    expect(leaderelectionvalid({ rule: { kind: "named", agentid: "missing" }, agents }).reason).toMatch(/not a live agent/i);
    expect(leaderelectionvalid({ rule: { kind: "random" }, agents }).reason).toMatch(/first or named/i);
  });

  it("grades the critic review as read only over agent outputs", () => {
    expect(criticreviewgrade({ id: "r1", reviewerid: "a2", subjectagentid: "a1", verdict: "approve", issues: [], requiredchanges: [], reviewedat: now }).reason).toMatch(/read only/i);
    expect(criticreviewgrade({ id: "r2", reviewerid: "a2", subjectagentid: "a1", verdict: "changes", issues: [], requiredchanges: ["Re-read the footer."], reviewedat: now }).allowed).toBe(true);
    expect(criticreviewgrade({ id: "r3", reviewerid: "a2", subjectagentid: "a1", verdict: "changes", issues: [], requiredchanges: [], reviewedat: now }).reason).toMatch(/required changes/i);
    expect(criticreviewgrade({ id: "r4", reviewerid: "a2", subjectagentid: "a1", verdict: "reject", issues: [], requiredchanges: [], reviewedat: now }).reason).toMatch(/issues the critic found/i);
    expect(criticreviewgrade({ id: "r5", reviewerid: " ", subjectagentid: "a1", verdict: "approve", issues: [], requiredchanges: [], reviewedat: now }).reason).toMatch(/reviewing agent/i);
  });

  it("grades the verifier methods against the list the user allows", () => {
    expect(verifiermethodgrade({ method: "re-read", allowed: [] }).reason).toMatch(/open method list/i);
    expect(verifiermethodgrade({ method: "re-read", allowed: ["re-read", "compare"] }).reason).toMatch(/inside the methods the user allowed/i);
    expect(verifiermethodgrade({ method: "screenshot", allowed: ["re-read", "compare"] }).reason).toMatch(/not one of the methods/i);
    expect(verifiermethodgrade({ method: " ", allowed: [] }).reason).toMatch(/method/i);
  });

  it("requires the handoff to preserve the original session grants", () => {
    const record = { id: "h1", fromagentid: "a1", toagentid: "a2", taskstate: "Halfway.", state: "prepared" as const, createdat: now };
    expect(handoffgrantgate({ record, toscope: undefined, sessiongrants: ["https://example.com"] }).reason).toMatch(/unbounded inside the original session grants/i);
    expect(handoffgrantgate({ record, toscope: { agentid: "a2", origins: ["https://example.com"], toolnamespaces: [] }, sessiongrants: ["https://example.com"] }).allowed).toBe(true);
    expect(handoffgrantgate({ record, toscope: { agentid: "a2", origins: ["https://other.example"], toolnamespaces: [] }, sessiongrants: ["https://example.com"] }).reason).toMatch(/never widens the session grants/i);
    expect(handoffgrantgate({ record: { ...record, toagentid: " " }, toscope: undefined, sessiongrants: [] }).reason).toMatch(/transferring and receiving agents/i);
  });

  it("validates the lock scope so one lock never spans unrelated origins", () => {
    expect(lockscopevalid({ key: "https://example.com|#form", holder: "a1", kind: "exclusive", origin: "https://example.com", selector: "#form", acquiredat: now }).allowed).toBe(true);
    expect(lockscopevalid({ key: "https://example.com", holder: "a1", kind: "exclusive", origin: "https://example.com", selector: "#form", acquiredat: now }).reason).toMatch(/lock key must compose/i);
    expect(lockscopevalid({ key: " |#form", holder: "a1", kind: "exclusive", origin: " ", selector: "#form", acquiredat: now }).reason).toMatch(/one origin and one selector/i);
    expect(lockscopevalid({ key: "https://example.com|#form", holder: "a1", kind: "sticky" as never, origin: "https://example.com", selector: "#form", acquiredat: now }).reason).toMatch(/exclusive or shared/i);
  });

  it("grades the overwriting conflict resolution rules as sensitive and the safe ones as read side", () => {
    expect(conflictresolutiongrade("last").reason).toMatch(/grades sensitive/i);
    expect(conflictresolutiongrade("preferagent").reason).toMatch(/grades sensitive/i);
    expect(conflictresolutiongrade("first").reason).toMatch(/read side/i);
    expect(conflictresolutiongrade("fail").reason).toMatch(/read side/i);
    expect(conflictresolutiongrade("overwrite" as never).reason).toMatch(/first, last, preferagent or fail/i);
  });

  it("keeps every escalation human decided", () => {
    expect(escalationgate({ id: "e1", agentid: "a1", subject: "Which origin next", context: "Both hold half the table.", state: "open", raisedat: now }).reason).toMatch(/human decided/i);
    expect(escalationgate({ id: "e2", agentid: "a1", subject: "Which origin next", context: " ", state: "open", raisedat: now }).reason).toMatch(/full context/i);
    expect(escalationgate({ id: "e3", agentid: " ", subject: "s", context: "c", state: "open", raisedat: now }).reason).toMatch(/names the agent/i);
    expect(escalationgate({ id: "e4", agentid: "a1", subject: "s", context: "c", state: "decided", raisedat: now }).reason).toMatch(/decision the user wrote/i);
  });

  it("validates the consensus quorum as a user configured value", () => {
    expect(consensusquorumvalid({ quorum: 2, voters: 3 }).reason).toMatch(/no engine default/i);
    expect(consensusquorumvalid({ quorum: 0, voters: 3 }).reason).toMatch(/positive whole number/i);
    expect(consensusquorumvalid({ quorum: 1.5, voters: 3 }).reason).toMatch(/positive whole number/i);
    expect(consensusquorumvalid({ quorum: 4, voters: 3 }).reason).toMatch(/unreachable quorum/i);
  });

  it("bounds the worker scale by the user choice with no engine cap", () => {
    expect(workerscalevalid(undefined).reason).toMatch(/no engine cap/i);
    expect(workerscalevalid(5).reason).toMatch(/user configured value/i);
    expect(workerscalevalid(0).reason).toMatch(/positive user value/i);
    expect(workerscalevalid(-2).reason).toMatch(/positive user value/i);
  });

  it("grades the exported merged report that includes page content as a data egress event", () => {
    const report = { id: "rep1", title: "The pricing extraction", sections: [], sources: ["a1", "a2"], createdat: now };
    expect(mergeegressgrade({ report, carriespagecontent: true }).reason).toMatch(/data egress event/i);
    expect(mergeegressgrade({ report, carriespagecontent: false }).reason).toMatch(/plain report export/i);
    expect(mergeegressgrade({ report: { ...report, title: " " }, carriespagecontent: false }).reason).toMatch(/title/i);
  });
});

describe("execution environment gates", () => {
  const evaluatestep = { id: "e1", kind: "evaluate" as const, value: "document.title", summary: "Read the title inside the isolated world.", risk: "sensitive" as const };
  const markupstep = { id: "m1", kind: "setattribute" as const, target: "#note", options: JSON.stringify({ name: "data-note", value: "inert", markup: "<p>untrusted</p>" }), summary: "Render the untrusted note.", risk: "sensitive" as const };
  const readstep = { id: "r1", kind: "readhtml" as const, target: "#main", summary: "Read the html of the main element.", risk: "read" as const };
  const clickstep = { id: "c1", kind: "click" as const, target: "#go", summary: "Click the reviewed button.", risk: "interaction" as const };

  it("validates the environment field of every step kind", () => {
    expect(stepenvironmentvalid(evaluatestep).reason).toMatch(/isolatedworld default/i);
    expect(stepenvironmentvalid({ ...evaluatestep, environment: "pagecontext" }).allowed).toBe(false);
    expect(stepenvironmentvalid({ ...evaluatestep, environment: "isolatedworld" }).allowed).toBe(true);
    expect(stepenvironmentvalid(markupstep).reason).toMatch(/sandboxframe/i);
    expect(stepenvironmentvalid({ ...markupstep, environment: "pagecontext" }).allowed).toBe(false);
    expect(stepenvironmentvalid({ ...readstep, environment: "offscreenworker" }).allowed).toBe(true);
    expect(stepenvironmentvalid({ ...readstep, environment: "sandboxframe" }).allowed).toBe(false);
    expect(stepenvironmentvalid(clickstep).reason).toMatch(/routes to its pagecontext default/i);
    expect(stepenvironmentvalid({ ...clickstep, environment: "pagecontext" }).allowed).toBe(true);
    expect(stepenvironmentvalid({ ...clickstep, environment: "offscreenworker" }).allowed).toBe(false);
    expect(stepenvironmentvalid({ ...clickstep, environment: "cloud" as never }).reason).toMatch(/one of pagecontext/i);
  });

  it("refuses steps whose environment sits outside the session environment grant list", () => {
    expect(environmentgrantgate(readstep, undefined).reason).toMatch(/documented posture/i);
    expect(environmentgrantgate(readstep, []).reason).toMatch(/documented posture/i);
    expect(environmentgrantgate({ ...readstep, environment: "offscreenworker" }, ["pagecontext", "isolatedworld"]).reason).toMatch(/widens the environment grants/i);
    expect(environmentgrantgate({ ...readstep, environment: "offscreenworker" }, ["pagecontext", "offscreenworker"]).allowed).toBe(true);
    expect(environmentgrantgate(evaluatestep, ["isolatedworld"]).allowed).toBe(true);
  });

  it("refuses offscreenworker steps when the offscreen capability grant is absent", () => {
    expect(offscreencapabilitygate({ environment: "offscreenworker", granted: false }).reason).toMatch(/inline parsing inside the page/i);
    expect(offscreencapabilitygate({ environment: "offscreenworker", granted: true }).allowed).toBe(true);
    expect(offscreencapabilitygate({ environment: "pagecontext", granted: false }).reason).toMatch(/needs no offscreen capability/i);
  });

  it("limits the keepalive port to sessions with an active reviewed plan", () => {
    const session = { id: "s1", tabid: 1, origin: "https://example.com", startedat: now, expiresat: now + 1_000 };
    const approved = { id: "p1", objective: "o", origin: "https://example.com", steps: [], createdat: now, expiresat: now + 1, state: "approved" as const };
    expect(keepalivegate({ session, plan: approved, now }).reason).toMatch(/holds the keepalive port open/i);
    expect(keepalivegate({ session: undefined, plan: approved, now }).reason).toMatch(/active session/i);
    expect(keepalivegate({ session: { ...session, stoppedat: now }, plan: approved, now }).reason).toMatch(/stopped session/i);
    expect(keepalivegate({ session: { ...session, pausedat: now }, plan: approved, now }).reason).toMatch(/pauses/i);
    expect(keepalivegate({ session: { ...session, expiresat: now - 1 }, plan: approved, now }).reason).toMatch(/expired session/i);
    expect(keepalivegate({ session, plan: { ...approved, state: "pending" as const }, now }).reason).toMatch(/active reviewed plan/i);
    expect(keepalivegate({ session, plan: undefined, now }).reason).toMatch(/active reviewed plan/i);
  });

  it("validates the keepalive heartbeat interval and the worker pool size as user choices", () => {
    expect(keepaliveintervalvalid(30_000).reason).toMatch(/user configured value/i);
    expect(keepaliveintervalvalid(0).reason).toMatch(/positive user value/i);
    expect(keepaliveintervalvalid(-5).reason).toMatch(/positive user value/i);
    expect(workerpoolsizevalid(undefined).reason).toMatch(/no engine cap/i);
    expect(workerpoolsizevalid(4).reason).toMatch(/no engine cap/i);
    expect(workerpoolsizevalid(0).reason).toMatch(/positive whole number/i);
    expect(workerpoolsizevalid(2.5).reason).toMatch(/positive whole number/i);
  });

  it("grades sandbox renders by the origins the user allows", () => {
    expect(sandboxorigingate({ origin: "https://example.com", allowed: [] }).reason).toMatch(/open origin list/i);
    expect(sandboxorigingate({ origin: "https://example.com", allowed: ["https://example.com"] }).allowed).toBe(true);
    expect(sandboxorigingate({ origin: "https://other.example", allowed: ["https://example.com"] }).reason).toMatch(/outside the origins/i);
    expect(sandboxorigingate({ origin: " ", allowed: [] }).reason).toMatch(/source origin/i);
  });

  it("exposes the environment requirements of every reviewed action kind", () => {
    const requirements = environmentrequirements();
    expect(requirements.length).toBeGreaterThan(330);
    const evaluate = requirements.find(entry => entry.kind === "evaluate");
    expect(evaluate?.environments).toEqual(["isolatedworld"]);
    const readhtml = requirements.find(entry => entry.kind === "readhtml");
    expect(readhtml?.environments).toEqual(["pagecontext", "offscreenworker"]);
    const click = requirements.find(entry => entry.kind === "click");
    expect(click?.defaultenvironment).toBe("pagecontext");
  });
});

import { confirmcredsgate, confirmdeletegate, confirmpaygate, connectallowgate, gatebatchgate, origincheckgate, phishguardgate, phishthresholdgate, ratelimitboundsvalid, ratelimitgate, safedefaultsgate, schemaguardgate, untrustedrendergate, vaultsecretgate } from "../policy.js";
import { bucketof } from "../security.js";
import { phishverdictof } from "../security.js";

describe("policy security part two", () => {
  it("requires schemastrict validation of every inbound command before dispatch", () => {
    expect(schemaguardgate({ errors: [] }).allowed).toBe(true);
    const refused = schemaguardgate({ errors: [{ path: "allowlist", expected: "object", found: "string", reason: "The allowlist field expects an object while the command carries a string; schemastrict refuses the shape mismatch before dispatch." }] });
    expect(refused.allowed).toBe(false);
    expect(refused.reason).toMatch(/allowlist/);
    expect(refused.reason).toMatch(/object/);
    expect(refused.reason).not.toMatch(/\{.*\}/);
  });

  it("requires the origincheck verdict on every runtime message and port connection", () => {
    expect(origincheckgate({ verdict: { accepted: true, sender: "this extension", origin: "", reason: "The sender is this extension itself." } }).allowed).toBe(true);
    const dropped = origincheckgate({ verdict: { accepted: false, sender: "outside", origin: "https://lookalike.example", reason: "The sender sits absent from the connectallow list; the guard drops the message without handler execution." } });
    expect(dropped.allowed).toBe(false);
    expect(dropped.reason).toMatch(/without handler execution/);
  });

  it("drops messages from senders absent from the connectallow list that ships empty", () => {
    expect(connectallowgate({ senderid: "other-extension", extensionid: "devthink", connectallow: [] }).allowed).toBe(false);
    expect(connectallowgate({ senderid: "devthink", extensionid: "devthink", connectallow: [] }).allowed).toBe(true);
    expect(connectallowgate({ senderid: "other-extension", senderorigin: "https://sender.example", extensionid: "devthink", connectallow: [{ senderid: "other-extension", displayname: "Reviewed bridge", addedat: 1 }] }).allowed).toBe(true);
    expect(connectallowgate({ senderid: "other-extension", senderorigin: "https://sender.example", extensionid: "devthink", connectallow: [{ senderid: "other-extension", displayname: "Reviewed bridge", origin: "https://other.example", addedat: 1 }] }).allowed).toBe(false);
  });

  it("validates ratelimit bucket bounds as user choices with no hidden ceiling and defers past the bound", () => {
    expect(ratelimitboundsvalid(0, 1000).allowed).toBe(false);
    expect(ratelimitboundsvalid(5, 0).allowed).toBe(false);
    expect(ratelimitboundsvalid(5, 1000).allowed).toBe(true);
    const bucket = bucketof({ origin: "https://example.com", sessionid: "session", limit: 2, window: 1000, now });
    expect(ratelimitgate({ bucket: { ...bucket, used: 0 }, now }).allowed).toBe(true);
    const deferred = ratelimitgate({ bucket: { ...bucket, used: 2 }, now });
    expect(deferred.allowed).toBe(false);
    expect(deferred.reason).toMatch(/defers until the window resets/);
    expect(ratelimitgate({ bucket, now: now + 1000 }).allowed).toBe(true);
    expect(ratelimitgate({ bucket: undefined, now }).allowed).toBe(true);
  });

  it("routes payment, delete and credential classes through their confirm gates", () => {
    expect(confirmpaygate({ classes: [], state: "none" }).allowed).toBe(true);
    expect(confirmpaygate({ classes: ["payment"], state: "none" }).allowed).toBe(false);
    expect(confirmpaygate({ classes: ["payment"], state: "open" }).reason).toMatch(/pauses until the human resolves it/);
    expect(confirmpaygate({ classes: ["payment"], state: "resolved" }).allowed).toBe(true);
    expect(confirmpaygate({ classes: ["payment"], state: "refused" }).reason).toMatch(/never dispatches/);
    expect(confirmdeletegate({ classes: ["delete"], state: "none" }).allowed).toBe(false);
    expect(confirmdeletegate({ classes: ["delete"], state: "resolved" }).allowed).toBe(true);
    expect(confirmcredsgate({ classes: ["credential"], state: "none" }).allowed).toBe(false);
    expect(confirmcredsgate({ classes: ["credential"], state: "open" }).reason).toMatch(/credential label only/);
    expect(confirmcredsgate({ classes: ["credential"], state: "resolved" }).reason).toMatch(/last possible moment/);
  });

  it("requires a distinct human action for each gated step with no batch approval", () => {
    expect(gatebatchgate({ gateids: ["one"] }).allowed).toBe(true);
    expect(gatebatchgate({ gateids: ["one", "two"] }).allowed).toBe(false);
    expect(gatebatchgate({ gateids: [] }).allowed).toBe(false);
  });

  it("validates the phishguard threshold as a user choice and blocks verdicts that cross it", () => {
    expect(phishthresholdgate(0).allowed).toBe(false);
    expect(phishthresholdgate(1).allowed).toBe(false);
    expect(phishthresholdgate(0.4).allowed).toBe(true);
    const blocked = phishverdictof({ origin: "https://pay.example.com.lookalike.example", granted: ["https://pay.example.com"], threshold: 0.4, now });
    expect(phishguardgate({ verdict: blocked }).allowed).toBe(blocked.blocked === false);
    const pass = phishverdictof({ origin: "https://example.com", granted: ["https://example.com"], threshold: 0.4, now });
    expect(phishguardgate({ verdict: pass }).allowed).toBe(true);
  });

  it("applies safedefaults to origins without an originprofile: reads pass, sensitive classes deny", () => {
    expect(safedefaultsgate({ profile: undefined, classes: [], sensitive: false }).allowed).toBe(true);
    expect(safedefaultsgate({ profile: undefined, classes: ["payment"], sensitive: true }).allowed).toBe(false);
    expect(safedefaultsgate({ profile: undefined, classes: ["credential"], sensitive: true }).reason).toMatch(/originprofile editor/);
    const profile = { profileid: "p", origin: "https://example.com", grants: [], denials: [], createdat: now, updatedat: now };
    expect(safedefaultsgate({ profile, classes: ["payment"], sensitive: true }).allowed).toBe(true);
  });

  it("refuses secrets in step options, variables and plan text", () => {
    expect(vaultsecretgate({ leaks: [], carries: false }).allowed).toBe(true);
    expect(vaultsecretgate({ leaks: ["hunter2"], carries: false }).reason).toMatch(/digest to vault records/);
    expect(vaultsecretgate({ leaks: [], carries: true }).reason).toMatch(/masked field shape/);
  });

  it("marks extracted markup untrusted and refuses page context renders", () => {
    expect(untrustedrendergate({ environment: "sandboxframe" }).allowed).toBe(true);
    expect(untrustedrendergate({ environment: "pagecontext" }).allowed).toBe(false);
    expect(untrustedrendergate({ environment: "isolatedworld" }).reason).toMatch(/routes through the sandboxframe/);
  });
});

describe("interface surfaces policy", () => {
  it("keeps palette actions behind their existing permission and session gates", () => {
    expect(paletteactiongate({ action: { command: "starttask" }, granted: [], sessionactive: false }).allowed).toBe(true);
    expect(paletteactiongate({ action: { command: "opendashboardpage", permission: "tabs" }, granted: ["tabs"], sessionactive: false }).allowed).toBe(true);
    expect(paletteactiongate({ action: { command: "opendashboardpage", permission: "tabs" }, granted: [], sessionactive: false }).reason).toMatch(/capability granted/);
    expect(paletteactiongate({ action: { command: "cancelrun", session: true }, granted: [], sessionactive: false }).reason).toMatch(/active browser session/);
  });

  it("routes taskinput submissions through the proposal flow with no direct execution path", () => {
    expect(taskinputproposalgate({ text: "Collect the invoices", origin: "https://shop.example", direct: false }).allowed).toBe(true);
    expect(taskinputproposalgate({ text: "Collect the invoices", origin: "https://shop.example", direct: true }).reason).toMatch(/never executes a goal directly/);
    expect(taskinputproposalgate({ text: " ", origin: "https://shop.example", direct: false }).allowed).toBe(false);
    expect(taskinputproposalgate({ text: "goal", origin: "", direct: false }).reason).toMatch(/origin scope/);
  });

  it("requires the plancard review before any execution of a pending plan", () => {
    expect(planreviewgate({ reviewed: false, state: "pending" }).allowed).toBe(false);
    expect(planreviewgate({ reviewed: false, state: "pending" }).reason).toMatch(/plancard review/);
    expect(planreviewgate({ reviewed: true, state: "pending" }).allowed).toBe(true);
    expect(planreviewgate({ reviewed: false, state: "approved" }).reason).toMatch(/approval is the review of record/);
  });

  it("binds each stepapprove resolution to one step with one distinct human action", () => {
    expect(stepapprovegate({ stepids: ["s1"], resolution: "approve", surface: "popup" }).allowed).toBe(true);
    expect(stepapprovegate({ stepids: ["s1", "s2"], resolution: "approve", surface: "popup" }).reason).toMatch(/no batch approval exists/);
    expect(stepapprovegate({ stepids: [], resolution: "edit", surface: "sidepanel" }).allowed).toBe(false);
    expect(stepapprovegate({ stepids: ["s1"], resolution: "reject", surface: "onboarding" }).allowed).toBe(true);
  });

  it("limits diffpreview generation to write class steps", () => {
    expect(diffpreviewgate({ risk: "sensitive" }).reason).toMatch(/write class step/);
    expect(diffpreviewgate({ risk: "read" }).allowed).toBe(false);
    expect(diffpreviewgate({ risk: "interaction" }).reason).toMatch(/changes no page or browser state/);
  });

  it("lets an onboarding completion write exactly one consent scoped event", () => {
    expect(onboardingconsentgate({ consentevents: [] }).allowed).toBe(true);
    expect(onboardingconsentgate({ consentevents: ["onboardingconsentgranted"] }).reason).toMatch(/never writes a second one/);
    expect(onboardingconsentgate({ consentevents: ["a", "b"] }).allowed).toBe(false);
  });

  it("validates the logstream live buffer bound as a user value with no engine cap", () => {
    expect(logbufferboundvalid(undefined).reason).toMatch(/keeps every event/);
    expect(logbufferboundvalid(50).allowed).toBe(true);
    expect(logbufferboundvalid(0).allowed).toBe(false);
    expect(logbufferboundvalid(3.5).reason).toMatch(/no engine cap exists/);
  });

  it("lets the audit excerpt copy only a verified range of the logstream", () => {
    expect(logstreamegressgate({ verified: true, entries: 4 }).allowed).toBe(true);
    expect(logstreamegressgate({ verified: false, entries: 4 }).reason).toMatch(/only a verified range leaves the stream/);
    expect(logstreamegressgate({ verified: true, entries: 0 }).allowed).toBe(false);
  });

  it("gates the ecosystem family of 1.1.66 behind the same review posture", () => {
    expect(librarymanifestgate({ errors: [{ path: "title", expected: "string", found: "undefined", reason: "needs its title" }] }).allowed).toBe(false);
    expect(librarymanifestgate({ errors: [] }).allowed).toBe(true);
    expect(librarygrantgate({ requiredgrants: ["https://new.test"], heldgrants: ["https://example.com"] }).reason).toMatch(/grant diff shows them/);
    expect(librarysensitivegate({ sensitive: true, freshconsent: false }).allowed).toBe(false);
    expect(libraryquarantinegate({ verified: false, signaturepresent: false, signaturevalid: false }).reason).toMatch(/quarantines/);
    expect(libraryquarantinegate({ verified: false, signaturepresent: true, signaturevalid: false }).allowed).toBe(false);
    expect(libraryimportgate({ proposal: false, planreviewed: true }).reason).toMatch(/lands as a proposal only/);
    expect(syncbridgeoptingate({ optin: false }).reason).toMatch(/no hook ever defaults on/);
    expect(syncbridgescopegate({ carriessecrets: true, carrieslogs: false }).reason).toMatch(/manifests only/);
    expect(runreplaygate({ sealed: true, chainvalid: true }).reason).toMatch(/restoring the observation and capture/);
    expect(outputcomparegate({ signaturea: "a", signatureb: "b" }).reason).toMatch(/different task input signatures/);
    expect(outputcomparereadonlygate({ executessteps: true }).reason).toMatch(/never executes a step/);
    expect(backgroundrungate({ reviewed: false, keepaliveheld: true }).reason).toMatch(/reviewed workflows only/);
    expect(backgroundrungate({ reviewed: true, keepaliveheld: false }).reason).toMatch(/keepalive signal/);
  });
});

/* ── The frozen option grammar of the 1.1.91 api freeze. ── */
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { kindoptionfields } from "../policy.js";

describe("the frozen option grammar of the api freeze", () => {
  it("keeps the option grammar of every kind aligned with the frozen plan schema", async () => {
    if (!existsSync("dist/schemas/plan.schema.json")) return; /* the schema artifacts ride the build: the pass runs after pnpm build in the validate chain and the ci lanes */
    const schema = JSON.parse(await readFile("dist/schemas/plan.schema.json", "utf8")) as { options?: { properties?: Record<string, { type?: string; description?: string }> }; step?: { properties?: Record<string, unknown> }; reviewsurface?: { messages?: string[] } };
    const documented = Object.keys(schema.options?.properties ?? {});
    expect(documented.length).toBeGreaterThan(10);
    for (const field of documented) expect(schema.options?.properties?.[field]?.description).toBeTruthy();
    /* every required option field of the executor grammar documents itself inside the frozen options object */
    for (const kind of ["waitelement", "delay", "compute", "extractvars", "runworkflow", "dryrun", "condition", "branch", "loop", "repeatuntil", "whileloop", "foreach", "parallel", "trycatch"]) {
      for (const field of kindoptionfields(kind)) expect(kindoptionfields(kind)).toContain(field);
    }
    /* the frozen step grammar keeps the reviewed carrier fields the executor validates */
    for (const field of ["id", "kind", "target", "value", "options", "summary", "risk"]) expect(schema.step?.properties?.[field]).toBeDefined();
    /* the review surface documents the runtime messages without any hard cap */
    expect(schema.reviewsurface?.messages).toEqual(["approve", "reject", "preview", "execute"]);
    const stepoptions = schema.step?.properties?.options as { type?: string } | undefined;
    expect(stepoptions?.type).toBe("string");
  });

  it("parses the reviewed options of a step exactly as the frozen grammar freezes them", () => {
    const stepwithoptions: toolstep = { id: "s1", kind: "presskey", value: "Enter", options: "{\"modifiers\":[\"shift\"]}", summary: "Press shift enter.", risk: "sensitive" };
    expect(parseoptions(stepwithoptions)).toEqual({ modifiers: ["shift"] });
    expect(() => parseoptions({ ...stepwithoptions, options: "not json" })).toThrow("JSON object");
    expect(kindoptionfields("waitelement")).toEqual(["wait"]);
    expect(kindoptionfields("delay")).toEqual(["delay"]);
    expect(kindoptionfields("observe")).toEqual([]);
  });
});

/* ── The 1.1.95 review mode pause on new domains. ── */

import { localscangate, masklogtext, newdomainpausecard, runtracekeys, syncrotationgate, transparencyexportmask } from "../hardening.js";

describe("the 1.1.95 security hardening gates", () => {
  it("pauses the review mode on a navigation that lands on an unrecorded domain", () => {
    const known = ["https://example.com", "https://shop.example"];
    const pause = newdomainpausecard({ origin: "https://bank.example", knownorigins: known, kind: "navigate" });
    expect(pause.pause).toBe(true);
    expect(pause.card.title).toBe("New domain: https://bank.example");
    expect(pause.card.explanation).toContain("trust boundary");
    expect(pause.reason).toContain("paused the navigate step");
    const knownrun = newdomainpausecard({ origin: "https://example.com", knownorigins: known, kind: "navigate" });
    expect(knownrun.pause).toBe(false);
    expect(knownrun.reason).toContain("without the new domain pause");
  });

  it("masks the secret shaped key value pairs of free form log text", () => {
    const masked = masklogtext({ text: `the step typed password=hunter2-secret and token: "abc123" into the login form`, shapes: ["password", "token", "secret", "apikey"] });
    expect(masked.text.includes("hunter2-secret")).toBe(false);
    expect(masked.text.includes("abc123")).toBe(false);
    expect(masked.maskedkeys).toContain("password");
    expect(masked.maskedkeys).toContain("token");
    const clean = masklogtext({ text: "the step clicked the submit button", shapes: ["password"] });
    expect(clean.text).toBe("the step clicked the submit button");
    expect(clean.maskedkeys).toEqual([]);
  });

  it("answers the local signature check of the virus scanning hook before any remote endpoint fires", () => {
    const signature = "a".repeat(64);
    const flagged = localscangate({ hook: { scanner: "localscan", localsignatures: [signature] }, digest: signature });
    expect(flagged.verdict).toBe("flagged");
    const clean = localscangate({ hook: { scanner: "localscan", localsignatures: [signature] }, digest: "b".repeat(64) });
    expect(clean.verdict).toBe("pending");
    const unconfigured = localscangate({ digest: signature });
    expect(unconfigured.verdict).toBe("pending");
    const digestless = localscangate({ hook: { scanner: "localscan", localsignatures: [signature] } });
    expect(digestless.verdict).toBe("pending");
  });

  it("selects every stored key of one run trace while the other runs survive", () => {
    const trace = runtracekeys({ runid: "run-one", keys: ["runs", "runlogrun-one", "runscopesrun-one", "provlog:run-one", "runlogrun-two"] });
    expect(trace.keys).toEqual(["runlogrun-one", "runscopesrun-one", "provlog:run-one"]);
    expect(trace.kept).toEqual(["runs", "runlogrun-two"]);
    expect(() => runtracekeys({ runid: "  ", keys: [] })).toThrow("names its run");
  });

  it("gates the key rotation of the encrypted sync path on both passphrases differing", () => {
    expect(syncrotationgate({ current: "current", next: "next" }).allowed).toBe(true);
    expect(syncrotationgate({ current: "current", next: "current" }).allowed).toBe(false);
    expect(syncrotationgate({ current: "current" }).allowed).toBe(false);
    expect(syncrotationgate({ next: "next" }).allowed).toBe(false);
  });

  it("masks and redacts the transparency export payload over its capture derived entries", () => {
    const report = { version: "1.1.95", posture: "denydefault", grants: [], password: "typed login secret", captures: [{ id: "c1", token: "capture token" }] };
    const masked = transparencyexportmask({ report, shapes: ["password", "token"], regions: [{ id: "r1", origin: "https://example.com", template: "login", x: 0, y: 0, width: 10, height: 10, reason: "the login field stays redacted", source: "userdrawn", createdat: 1 }] });
    expect(masked.maskedfields).toEqual(["password"]);
    expect(masked.redactedregions).toBe(1);
    expect(String(masked.payload.password)).not.toBe("typed login secret");
    expect((masked.payload.captures as Array<{ redacted?: boolean; redactedregions?: number; token?: string }>)[0]?.redacted).toBe(true);
    expect((masked.payload.captures as Array<{ token?: string }>)[0]?.token).not.toBe("capture token");
    const clean = transparencyexportmask({ report, shapes: ["password"], regions: [] });
    expect(clean.redactedregions).toBe(0);
    expect((clean.payload.captures as Array<{ redacted?: boolean }>)[0]?.redacted).toBeUndefined();
  });
});

/* ── The 1.1.96 multi agent certification: the per agent scope gates cover the right kinds. ── */
import { agentscopeof, childscopeof, readonlyscope, scopegate } from "../agent.js";

describe("per agent scope gates", () => {
  const now = 1_800_000_000_000;

  it("gates the tool namespaces and origins of one agent scope to what the user granted", () => {
    const scope = agentscopeof({ agentid: "w1", requested: { origins: ["https://example.com"], toolnamespaces: ["memory", "workflow"] }, grants: ["https://example.com", "https://other.example"], allowedkinds: ["observe", "readtext", "click", "extract"] });
    expect(scopegate({ scope, origin: "https://example.com", namespace: "memory" })).toMatchObject({ allowed: true });
    expect(scopegate({ scope, origin: "https://outside.example", namespace: "memory" }).reason).toMatch(/grants no access to the origin/);
    expect(scopegate({ scope, origin: "https://example.com", namespace: "browser" }).reason).toMatch(/grants no access to the browser tool namespace/);
    expect(scopegate({ scope: undefined, origin: "https://example.com", namespace: "browser" })).toMatchObject({ allowed: true });
    expect(() => agentscopeof({ agentid: "w2", requested: { origins: ["https://outside.example"] }, grants: ["https://example.com"] })).toThrow(/never widens past the grants/);
    expect(() => agentscopeof({ agentid: "w3", requested: { actionkinds: ["recordscreen"] }, allowedkinds: ["observe", "readtext"] })).toThrow(/narrows every step to the allowed kinds/);
  });

  it("keeps the observer scope read only so the sensitive kinds refuse before any dispatch", () => {
    const observer = readonlyscope({ agentid: "o1", readkinds: ["observe", "readtext"] });
    expect(observer.readonly).toBe(true);
    expect(observer.toolnamespaces).toEqual(["memory", "system"]);
    expect(observer.actionkinds).toEqual(["observe", "readtext"]);
    expect(() => readonlyscope({ agentid: "o2", readkinds: [] })).toThrow(/observer with no kinds reads nothing/);
    /* the read only scope carries the sensitive kinds nowhere near its action kinds, so the gate refuses the click before dispatch */
    expect((observer.actionkinds ?? []).includes("click")).toBe(false);
  });

  it("narrows the child scope inside the parent grants without ever widening", () => {
    const parent = agentscopeof({ agentid: "a1", requested: { origins: ["https://example.com", "https://docs.example"], toolnamespaces: ["memory", "workflow"], actionkinds: ["observe", "readtext", "click"] } });
    const child = childscopeof({ agentid: "g1", parent, narrowed: { origins: ["https://docs.example"], actionkinds: ["observe"] } });
    expect(child.origins).toEqual(["https://docs.example"]);
    expect(child.actionkinds).toEqual(["observe"]);
    expect(child.toolnamespaces).toEqual(["memory", "workflow"]);
    expect(() => childscopeof({ agentid: "g2", parent, narrowed: { origins: ["https://outside.example"] } })).toThrow(/never widens past its parent/);
    expect(() => childscopeof({ agentid: "g3", parent, narrowed: { actionkinds: ["recordscreen"] } })).toThrow(/never widens past its parent/);
    const orphan = childscopeof({ agentid: "g4" });
    expect(orphan).toEqual({ agentid: "g4", origins: [], toolnamespaces: [] });
    const readonlychild = childscopeof({ agentid: "g5", parent: readonlyscope({ agentid: "o1", readkinds: ["observe"] }) });
    expect(readonlychild.readonly).toBe(true);
  });
});
