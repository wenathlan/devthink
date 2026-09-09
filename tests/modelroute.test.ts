import { describe, expect, it } from "vitest";
import { bumprevision, fallbackroute, markprovider, resolveroute, routevalid, routesfor } from "../llm.js";
import type { modelroute, providerconfig } from "../types.js";

const now = 1_800_000_000_000;

/** Builds one provider config fixture with every value user configured. */
function provider(id: string, over: Partial<providerconfig> = {}): providerconfig {
  return {
    id,
    name: `The ${id} gateway`,
    endpoint: `https://${id}.example/v1`,
    style: "chatcompletions",
    models: ["model-a", "model-b"],
    status: "available",
    createdat: now,
    ...over,
  };
}

/** Builds one model route fixture. */
function route(over: Partial<modelroute> = {}): modelroute {
  return {
    id: "route1",
    kind: "draftplan",
    providerid: "prov1",
    model: "model-a",
    revision: 1,
    updatedat: now,
    ...over,
  };
}

describe("modelroute", () => {
  it("resolves the provider and model for a task kind", () => {
    const resolved = resolveroute({ routes: [route()], providers: [provider("prov1")], kind: "draftplan" });
    expect(resolved.provider?.id).toBe("prov1");
    expect(resolved.model).toBe("model-a");
  });

  it("reports why nothing routed for an unrouted task kind", () => {
    const resolved = resolveroute({ routes: [route()], providers: [provider("prov1")], kind: "parsecommand" });
    expect(resolved.provider).toBeUndefined();
    expect(resolved.reason).toMatch(/No model route/i);
  });

  it("keeps every route of one task kind in revision order", () => {
    const routes = [
      route({ revision: 1 }),
      route({ id: "route2", revision: 5 }),
      route({ id: "route3", kind: "reflect" }),
    ];
    expect(routesfor(routes, "draftplan").map((entry) => entry.id)).toEqual(["route2", "route1"]);
  });

  it("refuses a route whose model stays outside the provider model list", () => {
    const resolved = resolveroute({
      routes: [route({ model: "model-z" })],
      providers: [provider("prov1")],
      kind: "draftplan",
    });
    expect(resolved.reason).toMatch(/outside the model list/i);
  });

  it("marks providers unavailable and available again after their calls", () => {
    const providers = markprovider({
      providers: [provider("prov1"), provider("prov2")],
      providerid: "prov1",
      available: false,
      now,
    });
    expect(providers.find((candidate) => candidate.id === "prov1")?.status).toBe("unavailable");
    expect(providers.find((candidate) => candidate.id === "prov2")?.status).toBe("available");
    const resolved = resolveroute({ routes: [route()], providers, kind: "draftplan" });
    expect(resolved.reason).toMatch(/unavailable/i);
    const back = markprovider({ providers, providerid: "prov1", available: true, now: now + 1000 });
    expect(resolveroute({ routes: [route()], providers: back, kind: "draftplan" }).provider?.id).toBe("prov1");
    expect(back.find((candidate) => candidate.id === "prov1")?.lastcheckedat).toBe(now + 1000);
  });

  it("falls back on the user configured fallback pair when the primary provider fails", () => {
    const routes = [route({ fallbackproviderid: "prov2", fallbackmodel: "model-b" })];
    const providers = markprovider({
      providers: [provider("prov1"), provider("prov2")],
      providerid: "prov1",
      available: false,
      now,
    });
    const fallen = fallbackroute({ routes, providers, kind: "draftplan" });
    expect(fallen.provider?.id).toBe("prov2");
    expect(fallen.model).toBe("model-b");
  });

  it("reports why nothing fell back without a fallback pair or with an unavailable fallback provider", () => {
    expect(fallbackroute({ routes: [route()], providers: [provider("prov1")], kind: "draftplan" }).reason).toMatch(
      /no user configured fallback/i,
    );
    const routes = [route({ fallbackproviderid: "prov2", fallbackmodel: "model-b" })];
    const providers = [provider("prov1"), provider("prov2", { status: "unavailable" })];
    expect(fallbackroute({ routes, providers, kind: "draftplan" }).reason).toMatch(/unavailable/i);
  });

  it("validates route entries and bumps revisions for the history", () => {
    expect(routevalid(route()).allowed).toBe(true);
    expect(routevalid(route({ kind: " " })).allowed).toBe(false);
    expect(routevalid(route({ model: "" })).allowed).toBe(false);
    expect(routevalid(route({ fallbackproviderid: "prov2" })).allowed).toBe(false);
    const bumped = bumprevision(route(), now + 5000);
    expect(bumped.revision).toBe(2);
    expect(bumped.updatedat).toBe(now + 5000);
  });
});
