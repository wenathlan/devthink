import { describe, expect, it } from "vitest";
import { closeoffscreen, defaultenvironment, environmentrequirementsof, environmentsof, executorregistry, isolatedinjection, markuprenderstep, offloadkinds, openoffscreen, poolplan, routeenvironment, transferablekeys, workerrequestof, workerresponseof, acceptworkerresponse } from "../environments.js";
import { reviewedkinds } from "../policy.js";
import type { toolstep } from "../types.js";

const now = 1_000;

function step(kind: toolstep["kind"], extra: Partial<toolstep> = {}): toolstep {
  return { id: `${kind}-step`, kind, summary: `Run the ${kind} step.`, risk: "read", ...extra };
}

describe("execution environments", () => {
  it("routes every reviewed action kind to an allowed environment set with a default", () => {
    const kinds = reviewedkinds();
    expect(kinds.length).toBeGreaterThan(330);
    const requirements = environmentrequirementsof(kinds as toolstep["kind"][]);
    expect(requirements).toHaveLength(kinds.length);
    for (const requirement of requirements) {
      expect(requirement.environments.length).toBeGreaterThan(0);
      expect(requirement.environments).toContain(requirement.defaultenvironment);
      for (const environment of requirement.environments) expect(["pagecontext", "isolatedworld", "offscreenworker", "sandboxframe"]).toContain(environment);
    }
  });

  it("marks evaluate steps as isolatedworld only and untrusted markup renders as sandboxframe only", () => {
    expect(environmentsof(step("evaluate"))).toEqual(["isolatedworld"]);
    expect(defaultenvironment(step("evaluate"))).toBe("isolatedworld");
    const markupstep = step("setattribute", { options: JSON.stringify({ name: "data-summary", value: "inert", markup: "<p>untrusted</p>" }) });
    expect(environmentsof(markupstep)).toEqual(["sandboxframe"]);
    expect(defaultenvironment(markupstep)).toBe("sandboxframe");
    expect(markuprenderstep(markupstep)).toBe(true);
    expect(markuprenderstep(step("setattribute", { options: JSON.stringify({ name: "data-summary", value: "inert" }) }))).toBe(false);
    expect(markuprenderstep(step("setattribute", { options: "{not json" }))).toBe(false);
  });

  it("marks the parse heavy read kinds as offscreenworker eligible beside the live page", () => {
    const families = offloadkinds();
    expect(families.map(family => family.task)).toEqual(["htmlsnapshot", "jsonpayload", "tablerows", "a11ytree", "complexselector", "stitchshots"]);
    for (const kind of ["readhtml", "parsehtml", "readjson", "parsejson", "readtable", "scrapetable", "a11ytree", "resolvexpath", "deriveselector", "contactsheet", "timelapse", "makethumbs"] as const) {
      expect(environmentsof(step(kind))).toEqual(["pagecontext", "offscreenworker"]);
      expect(defaultenvironment(step(kind))).toBe("pagecontext");
    }
    expect(environmentsof(step("click"))).toEqual(["pagecontext"]);
    expect(environmentsof(step("fillform"))).toEqual(["pagecontext"]);
  });

  it("maps every environmentkind to its runtime adapter in the executor registry", () => {
    const registry = executorregistry();
    expect(registry.map(entry => entry.environment)).toEqual(["pagecontext", "isolatedworld", "offscreenworker", "sandboxframe"]);
    expect(registry.map(entry => entry.adapter)).toEqual(["pagebridge", "scriptingapi", "offscreendocument", "sandboxpage"]);
    for (const entry of registry) expect(entry.description).toMatch(/\./);
  });

  it("routes steps by the reviewed environment field, the offload toggle and the capability grant with an inline fallback", () => {
    expect(routeenvironment(step("readhtml"), { offload: false, granted: true }).environment).toBe("pagecontext");
    expect(routeenvironment(step("readhtml"), { offload: true, granted: true })).toMatchObject({ environment: "offscreenworker", fallback: false });
    const fallback = routeenvironment(step("readhtml"), { offload: true, granted: false });
    expect(fallback).toMatchObject({ environment: "pagecontext", fallback: true });
    expect(fallback.reason).toMatch(/inline parsing/i);
    expect(routeenvironment(step("evaluate"), { offload: true, granted: true }).environment).toBe("isolatedworld");
    expect(routeenvironment(step("click"), { offload: true, granted: true }).environment).toBe("pagecontext");
    const named = routeenvironment(step("readhtml", { environment: "offscreenworker" }), { offload: false, granted: true });
    expect(named.environment).toBe("offscreenworker");
    const refused = routeenvironment(step("click", { environment: "isolatedworld" }), { offload: true, granted: true });
    expect(refused.environment).toBe("pagecontext");
    expect(refused.reason).toMatch(/outside the pagecontext the click kind permits/i);
  });

  it("builds worker requests with the parse family and the transferable keys and reads their answers", () => {
    const buffer = new ArrayBuffer(8);
    const request = workerrequestof({ id: "w1", runid: "run1", stepid: "s1", kind: "readhtml", payload: "<html><body>heavy</body></html>", options: { snapshot: buffer, label: "front page" }, sentat: now });
    expect(request.task).toBe("htmlsnapshot");
    expect(request.transferables).toEqual(["snapshot"]);
    const partial = acceptworkerresponse(workerresponseof({ id: "a1", requestid: request.id, ok: true, partial: 1, summary: "The first chunk streams back.", receivedat: now + 5 }));
    expect(partial).toMatchObject({ done: false, partial: true });
    const final = acceptworkerresponse(workerresponseof({ id: "a2", requestid: request.id, ok: true, result: "front page text", summary: "The parse finished.", receivedat: now + 20 }));
    expect(final).toMatchObject({ done: true, partial: false, result: "front page text" });
    const refused = acceptworkerresponse(workerresponseof({ id: "a3", requestid: request.id, ok: false, summary: "The payload was malformed.", receivedat: now + 25 }));
    expect(refused.done).toBe(true);
    expect(refused.result).toBeUndefined();
    expect(transferablekeys({ snapshot: buffer, label: "text" })).toEqual(["snapshot"]);
    expect(transferablekeys({ label: "text" })).toEqual([]);
    expect(() => workerrequestof({ id: "w2", runid: "run1", stepid: "s2", kind: "click", payload: "x", sentat: now })).toThrow(/outside the offscreen worker pool families/i);
    expect(() => workerrequestof({ id: "w3", runid: "run1", stepid: "s3", kind: "readjson", payload: "  ", sentat: now })).toThrow(/payload/i);
    expect(() => workerresponseof({ id: "w4", requestid: "r", ok: true, summary: " ", receivedat: now })).toThrow(/summary/i);
  });

  it("grows and shrinks the worker pool with the pending parse queue and the user configured size with no engine cap", () => {
    expect(poolplan({ pending: 5, current: 2 })).toMatchObject({ workers: 5, added: 3, retired: 0 });
    expect(poolplan({ pending: 1, current: 4 })).toMatchObject({ workers: 1, added: 0, retired: 3 });
    expect(poolplan({ pending: 3, current: 3 })).toMatchObject({ workers: 3, added: 0, retired: 0 });
    expect(poolplan({ pending: 2, current: 1, size: 8 })).toMatchObject({ workers: 8, added: 7 });
    expect(poolplan({ pending: 9, current: 6, size: 2 })).toMatchObject({ workers: 2, retired: 4 });
    expect(poolplan({ pending: 2, current: 2, size: 2 }).reason).toMatch(/user configured/i);
    expect(poolplan({ pending: 2, current: 2 }).reason).toMatch(/no engine cap|match/i);
    expect(poolplan({ pending: 1, current: 1, size: 0 })).toMatchObject({ workers: 1, added: 0, retired: 0 });
  });

  it("spawns the offscreen document on first use, reuses it across the steps of one run and closes it at completion", () => {
    const first = openoffscreen({ registry: [], document: "offscreen.html", runid: "run1", reasons: ["DOM_PARSER", "WORKERS"], justification: "Heavy parsing of reviewed snapshots.", now });
    expect(first.reused).toBe(false);
    const second = openoffscreen({ registry: first.registry, document: "offscreen.html", runid: "run1", reasons: ["DOM_PARSER"], justification: "Heavy parsing of reviewed snapshots.", now: now + 10 });
    expect(second.reused).toBe(true);
    expect(second.entry).toBe(first.entry);
    const otherrun = openoffscreen({ registry: first.registry, document: "offscreen.html", runid: "run2", reasons: ["DOM_PARSER"], justification: "Heavy parsing of reviewed snapshots.", now: now + 20 });
    expect(otherrun.reused).toBe(false);
    const closed = closeoffscreen(otherrun.registry, "run1", now + 30);
    expect(closed.closed).toBe(true);
    expect(closed.registry.find(entry => entry.runid === "run1")?.closedat).toBe(now + 30);
    expect(closeoffscreen(closed.registry, "run1", now + 40).closed).toBe(false);
    expect(() => openoffscreen({ registry: [], document: " ", runid: "run1", reasons: ["DOM_PARSER"], justification: "j", now })).toThrow(/document/i);
    expect(() => openoffscreen({ registry: [], document: "offscreen.html", runid: "run1", reasons: [], justification: "j", now })).toThrow(/reasons/i);
    expect(() => openoffscreen({ registry: [], document: "offscreen.html", runid: "run1", reasons: ["DOM_PARSER"], justification: " ", now })).toThrow(/justification/i);
  });

  it("builds the isolated world injection of evaluate steps with reviewed arguments only", () => {
    const injection = isolatedinjection(step("evaluate", { value: "document.title", options: JSON.stringify(["arg one", "arg two"]) }));
    expect(injection.world).toBe("ISOLATED");
    expect(injection.code).toBe("document.title");
    expect(injection.args).toEqual(["arg one", "arg two"]);
    const bare = isolatedinjection(step("evaluate", { value: "1 + 1" }));
    expect(bare.args).toEqual([]);
    expect(() => isolatedinjection(step("evaluate", { value: " " }))).toThrow(/reviewed expression/i);
    expect(() => isolatedinjection(step("click"))).toThrow(/evaluate kind only/i);
  });
});
