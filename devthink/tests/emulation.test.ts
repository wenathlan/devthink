import { describe, expect, it } from "vitest";
import {
  agentgrammarvalid,
  agentpresetof,
  applylayer,
  blackboxmatches,
  blackboxruleof,
  blackboxedurls,
  browserpermissions,
  devicepresetof,
  emulationkinds,
  emulationstateof,
  expirelayers,
  exportpresetlibrary,
  familyofkind,
  hideblackboxedframes,
  importpresetlibrary,
  locationconsentcovers,
  locationpresetof,
  locationrangevalid,
  layernames,
  networkpresetof,
  newlayer,
  permissiongrade,
  permissiongrantof,
  permissionstates,
  revertalllayers,
  revertlayer,
  revertplanof,
  stackedcount,
} from "../environments.js";
import type { emulationlayer, stackframe } from "../types.js";

const now = 1_800_000_000_000;

const device = { name: "phone", width: 390, height: 844, pixelratio: 3, mobile: true };
const network = { name: "slow3g", latency: 400, download: 400, upload: 400, offline: false };
const location = { name: "lisbon", latitude: 38.7223, longitude: -9.1393, accuracy: 100 };
const agent = {
  name: "desktopmask",
  useragent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  platform: "Linux x86_64",
  brands: ["Chromium", "Not A;Brand"],
};

function layer(id: string, family: emulationlayer["family"], name: string, at: number): emulationlayer {
  return newlayer({
    id,
    runid: "run",
    stepid: `step-${id}`,
    family,
    name,
    originscope: "https://example.com",
    revertplan: ["revert the layer", "restore the prior page state"],
    at,
  });
}

describe("emulation presets", () => {
  it("normalizes the device, network, location and agent presets of the user curated libraries", () => {
    expect(devicepresetof(device)).toEqual(device);
    expect(devicepresetof({ name: "", width: 390, height: 844, pixelratio: 3 })).toBeUndefined();
    expect(devicepresetof({ name: "x", width: 0, height: 844, pixelratio: 3 })).toBeUndefined();
    expect(devicepresetof({ name: "x", width: 390, height: 844, pixelratio: -1 })).toBeUndefined();
    expect(devicepresetof({ name: "x", width: 1.5, height: 844, pixelratio: 3 })).toBeUndefined();
    expect(networkpresetof(network)).toEqual(network);
    expect(networkpresetof({ name: "x", latency: -1, download: 1, upload: 1 })).toBeUndefined();
    expect(networkpresetof({ name: "x", latency: 0, download: 0, upload: 0, offline: true })?.offline).toBe(true);
    expect(locationpresetof(location)).toEqual(location);
    expect(locationpresetof({ name: "x", latitude: 91, longitude: 0, accuracy: 5 })).toBeUndefined();
    expect(agentpresetof(agent)).toEqual(agent);
    expect(agentpresetof({ ...agent, brands: [] })).toBeUndefined();
    expect(agentpresetof({ ...agent, platform: " " })).toBeUndefined();
  });

  it("maps every emulation kind onto its layer family", () => {
    expect(familyofkind("emulatedevice")).toBe("device");
    expect(familyofkind("emulatenetwork")).toBe("network");
    expect(familyofkind("emulatelocate")).toBe("location");
    expect(familyofkind("setuseragent")).toBe("agent");
    expect(familyofkind("overridepermission")).toBe("permission");
    expect(familyofkind("blackboxscripts")).toBe("blackbox");
    expect(familyofkind("click")).toBeUndefined();
    expect(emulationkinds).toHaveLength(6);
  });
});

describe("emulation grammars", () => {
  it("validates the latitude and longitude ranges of the location layer", () => {
    expect(locationrangevalid(0, 0)).toBe(true);
    expect(locationrangevalid(90, 180)).toBe(true);
    expect(locationrangevalid(-90, -180)).toBe(true);
    expect(locationrangevalid(90.1, 0)).toBe(false);
    expect(locationrangevalid(0, -180.1)).toBe(false);
    expect(locationrangevalid(Number.NaN, 0)).toBe(false);
  });

  it("validates the user agent string against the reviewed grammar", () => {
    expect(agentgrammarvalid(agent.useragent)).toBe(true);
    expect(agentgrammarvalid("curl/8.5.0")).toBe(true);
    expect(agentgrammarvalid("no version token")).toBe(false);
    expect(agentgrammarvalid("Mozilla/5.0\r\nX-Injected: 1")).toBe(false);
    expect(agentgrammarvalid("bad<script>")).toBe(false);
    expect(agentgrammarvalid("x".repeat(513))).toBe(false);
  });

  it("validates the permission overrides against the reviewed browser permission set and grades them by name", () => {
    expect(permissiongrantof({ name: "geolocation", state: "granted", runscope: true })).toEqual({
      name: "geolocation",
      state: "granted",
      runscope: true,
    });
    expect(permissiongrantof({ name: "camera", state: "denied" })).toEqual({
      name: "camera",
      state: "denied",
      runscope: true,
    });
    expect(permissiongrantof({ name: "screen-capture", state: "granted" })).toBeUndefined();
    expect(permissiongrantof({ name: "geolocation", state: "maybe" })).toBeUndefined();
    expect(permissionstates).toEqual(["granted", "denied", "prompt"]);
    expect(permissiongrade("geolocation")).toBe("powerful");
    expect(permissiongrade("camera")).toBe("powerful");
    expect(permissiongrade("microphone")).toBe("powerful");
    expect(permissiongrade("notifications")).toBe("powerful");
    expect(permissiongrade("clipboard-write")).toBe("standard");
    expect(browserpermissions).toContain("geolocation");
  });

  it("normalizes the blackbox rules and matches third party urls with stars and subtrees", () => {
    const rule = { urlpatterns: ["https://cdn.example/vendor/**"], tracescope: "both" as const };
    expect(blackboxruleof(rule)).toEqual(rule);
    expect(blackboxruleof({ urlpatterns: [], tracescope: "both" })).toBeUndefined();
    expect(blackboxruleof({ urlpatterns: ["https://cdn.example/**"], tracescope: "everywhere" })).toBeUndefined();
    expect(blackboxruleof({ urlpatterns: ["https://cdn.example/**"] })).toBeUndefined();
    expect(blackboxmatches("https://cdn.example/vendor/**", "https://cdn.example/vendor/app.js")).toBe(true);
    expect(blackboxmatches("https://cdn.example/vendor/**", "https://cdn.example/other.js")).toBe(false);
    expect(blackboxmatches("https://cdn.example/*", "https://cdn.example/app.js")).toBe(true);
    expect(blackboxmatches("https://cdn.example/*", "https://cdn.example/nested/app.js")).toBe(false);
    expect(blackboxmatches("https://cdn.example/**", "https://elsewhere.example/app.js")).toBe(false);
  });

  it("hides blackboxed frames from stack traces and lists the blackboxed urls of a trace", () => {
    const frames: stackframe[] = [
      { url: "https://example.com/app.js", line: 1 },
      { url: "https://cdn.example/vendor/lib.js", line: 2 },
      { url: "https://example.com/main.js", line: 3 },
    ];
    const traces = [{ urlpatterns: ["https://cdn.example/**"], tracescope: "traces" as const }];
    expect(hideblackboxedframes(traces, frames)).toEqual([frames[0], frames[2]]);
    const profiles = [{ urlpatterns: ["https://cdn.example/**"], tracescope: "profiles" as const }];
    expect(hideblackboxedframes(profiles, frames)).toHaveLength(3);
    expect(
      blackboxedurls(
        [...traces, ...profiles],
        frames.map((frame) => frame.url),
      ),
    ).toEqual(["https://cdn.example/vendor/lib.js"]);
    expect(hideblackboxedframes([], frames)).toHaveLength(3);
  });

  it("requires a non-empty reviewed revert plan beside every layer", () => {
    expect(revertplanof(["detach", "restore the prior state"])).toEqual(["detach", "restore the prior state"]);
    expect(revertplanof([])).toBeUndefined();
    expect(revertplanof(["", "  "])).toBeUndefined();
    expect(revertplanof("detach")).toBeUndefined();
  });
});

describe("emulation layers", () => {
  it("applies and reverts device metric layers with the prior state captured for the exact revert", () => {
    const state = emulationstateof({ runid: "run", tabid: 4, origin: "https://example.com", now });
    const withprior = newlayer({
      id: "l1",
      runid: "run",
      stepid: "s1",
      family: "device",
      name: "phone",
      originscope: "https://example.com",
      revertplan: ["restore the pixel ratio"],
      prior: { pixelratio: 2, viewportwidth: 1200, viewportheight: 800 },
      at: now,
    });
    const applied = applylayer(state, withprior, now + 10);
    expect(applied.layers).toHaveLength(1);
    expect(applied.layers[0]?.prior?.pixelratio).toBe(2);
    const reverted = revertlayer(applied, "l1", now + 20);
    expect(reverted.layers[0]?.revertedat).toBe(now + 20);
    expect(layernames(reverted)).toEqual([]);
  });

  it("stacks layers with the last applied winning conflicts and reverts them in reverse order", () => {
    const base = emulationstateof({ runid: "run", tabid: 4, origin: "https://example.com", now });
    let current = applylayer(base, layer("l1", "device", "phone", now), now + 1);
    current = applylayer(current, layer("l2", "network", "slow3g", now), now + 2);
    current = applylayer(current, layer("l3", "agent", "desktopmask", now), now + 3);
    expect(stackedcount(current)).toBe(3);
    expect(layernames(current)).toEqual(["phone", "slow3g", "desktopmask"]);
    const second = applylayer(current, layer("l4", "device", "tablet", now + 5), now + 5);
    expect(layernames(second)).toEqual(["phone", "slow3g", "desktopmask", "tablet"]);
    const outcome = revertalllayers(second, now + 30);
    expect(outcome.reverted.map((entry) => entry.name)).toEqual(["tablet", "desktopmask", "slow3g", "phone"]);
    expect(layernames(outcome.state)).toEqual([]);
    expect(stackedcount(outcome.state)).toBe(0);
  });

  it("keeps the layer history of reverted layers for review", () => {
    const state = applylayer(
      emulationstateof({ runid: "run", tabid: 4, origin: "https://example.com", now }),
      layer("l1", "location", "lisbon", now),
      now,
    );
    const reverted = revertalllayers(state, now + 10);
    expect(reverted.state.layers).toHaveLength(1);
    expect(reverted.state.layers[0]?.revertedat).toBe(now + 10);
  });
});

describe("emulation retention and presets", () => {
  it("expires the prior states of reverted layers after the retention window while the history survives", () => {
    const state = revertalllayers(
      applylayer(
        emulationstateof({ runid: "run", tabid: 4, origin: "https://example.com", now }),
        newlayer({
          id: "l1",
          runid: "run",
          stepid: "s1",
          family: "agent",
          name: "desktopmask",
          originscope: "https://example.com",
          revertplan: ["restore the agent"],
          prior: { useragent: "UA" },
          at: now,
        }),
        now,
      ),
      now + 10,
    ).state;
    expect(expirelayers(state, 1000, now + 100).layers[0]?.prior).toEqual({ useragent: "UA" });
    const expired = expirelayers(state, 1000, now + 2000);
    expect(expired.layers[0]?.prior).toBeUndefined();
    expect(expired.layers[0]?.priorexpired).toBe(true);
    expect(expired.layers[0]?.name).toBe("desktopmask");
    expect(expirelayers(state, undefined, now + 100_000).layers[0]?.prior).toEqual({ useragent: "UA" });
  });

  it("exports and imports the versioned preset library through review", () => {
    const file = exportpresetlibrary({
      devices: [device],
      networks: [network],
      locations: [location],
      agents: [agent],
      now,
    });
    expect(file.version).toBe(1);
    expect(file.devices[0]?.name).toBe("phone");
    const parsed = importpresetlibrary(JSON.parse(JSON.stringify(file)));
    expect(parsed?.networks[0]?.name).toBe("slow3g");
    expect(parsed?.locations[0]?.latitude).toBe(38.7223);
    expect(importpresetlibrary({ devices: [{ name: "bad", width: 0, height: 0, pixelratio: 1 }] })).toBeUndefined();
    expect(importpresetlibrary("nope")).toBeUndefined();
  });

  it("covers the location consent by origin and reviewed coordinates", () => {
    const consents = [
      {
        id: "c1",
        prompt: "Where?",
        origin: "https://example.com",
        latitude: 38.7223,
        longitude: -9.1393,
        approved: true,
        consentedat: now,
      },
    ];
    expect(locationconsentcovers("https://example.com", 38.7223, -9.1393, consents)).toBe(true);
    expect(locationconsentcovers("https://example.com", 41.3851, 2.1734, consents)).toBe(false);
    expect(locationconsentcovers("https://elsewhere.example", 38.7223, -9.1393, consents)).toBe(false);
    expect(locationconsentcovers("https://example.com", 38.7223, -9.1393, [{ ...consents[0]!, approved: false }])).toBe(
      false,
    );
  });
});
