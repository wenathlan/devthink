// # familyseats.test — the two family seats battery (runnable with the
// vitest runner):
//   pnpm vitest run test/familyseats.test.ts
//
// The laws the battery pins (the owner's rules, the two gateway/account
// lane seats):
//  1. the gateway ports law (law 39 — "Gateway proxy ports: host/porta
//     sorteados, never localhost literal", beside the anti localhost law
//     the corpus records — "random host octets, port drawn from the
//     cryptographic band 30000 to 59999"): the gateway boot never answers
//     a literal host or port — the env pin rides when the env carries one,
//     otherwise the port draws inside the documented cryptographic band
//     (30000..59999, the saddle orchestrator grammar crypto.randomInt(30000)
//     + 30000) and the host draws inside the loopback band 127.x.y.z with
//     three drawn octets; the retired literal fallbacks (the || 3001 chain,
//     the "0.0.0.0" host) answer nowhere in the gateway lane sources;
//  2. the one signup law (law 40 — "One signup family-wide (guest identity
//     never deleted)", beside the family sharing law the corpus records —
//     "one signup and one account recognized in every app... the guest
//     identity born on the first visit and never deleted"): the family
//     carries ONE signup lane (the vault person's door, POST
//     /api/v1/auth/signup over signupAccount in vault/account.ts) and the
//     visitor identity rows ride zero delete lanes family-wide — the
//     onboarding lanes upsert seen-wins (ON CONFLICT(visitor) DO UPDATE)
//     and no sweep, retention or cleanup ever deletes the guest.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { drawgatewayhost, drawgatewayport, gatewayportband, resolvegatewaybind } from "../binddraw.ts";

/** the monorepo root resolved from this test file location. */
const monoreporoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

/** the family app roots (the deploy units the law names). */
const FAMILYROOTS = ["argan", "cadria", "cobaia", "debonair", "devthink", "forge", "foundry", "getry", "saddle", "stealthhead", "vault"];

/** the walks the source scan skips (the tests-are-exempt law rides the
 * test fixtures, the build ghosts never ride the tree). */
const SKIPNAMES = new Set(["node_modules", "dist", "build", "test", "tests", ".git"]);

/** walks every .ts/.tsx source under one app root (skips the exempt lanes). */
function walksources(relroot: string): string[] {
  const out: string[] = [];
  const walk = (absdir: string): void => {
    for (const entry of readdirSync(absdir)) {
      const abs = join(absdir, entry);
      const st = statSync(abs);
      if (st.isDirectory()) {
        if (SKIPNAMES.has(entry)) continue;
        walk(abs);
      } else if ((entry.endsWith(".ts") || entry.endsWith(".tsx")) && !entry.endsWith(".d.ts")) {
        out.push(abs);
      }
    }
  };
  walk(join(monoreporoot, relroot));
  return out;
}

/** reads one repo file as text (repo-root relative). */
function source(relative: string): string {
  return readFileSync(join(monoreporoot, relative), "utf8");
}

describe("the gateway ports law (host/porta sorteados, never localhost literal)", () => {
  it("draws the port inside the documented cryptographic band 30000..59999", () => {
    const draws = new Set<number>();
    for (let i = 0; i < 400; i += 1) {
      const port = drawgatewayport();
      expect(port).toBeGreaterThanOrEqual(gatewayportband.first);
      expect(port).toBeLessThanOrEqual(gatewayportband.last);
      draws.add(port);
    }
    // the band answers a real draw, not a degenerate constant
    expect(draws.size).toBeGreaterThanOrEqual(100);
  });

  it("draws the host inside the loopback band 127.x.y.z with three drawn octets", () => {
    const draws = new Set<string>();
    for (let i = 0; i < 200; i += 1) {
      const host = drawgatewayhost();
      const match = host.match(/^127\.(\d+)\.(\d+)\.(\d+)$/);
      expect(match, `the drawn host ${host} rides 127.a.b.c`).not.toBeNull();
      for (const octet of [match![1], match![2], match![3]]) {
        const value = Number(octet);
        expect(value).toBeGreaterThanOrEqual(1);
        expect(value).toBeLessThanOrEqual(254);
      }
      draws.add(host);
    }
    expect(draws.size).toBeGreaterThanOrEqual(50);
  });

  it("rides the env pin when the env carries one (the pin is a pin, never a literal)", () => {
    const pinned = resolvegatewaybind("41234", "127.9.9.9");
    expect(pinned.port).toBe(41234);
    expect(pinned.hostname).toBe("127.9.9.9");
    expect(pinned.portdrawn).toBe(false);
    expect(pinned.hostdrawn).toBe(false);
    // an env value the operator set rides verbatim — the law bans the source
    // literal fallback, never the operator's own pin
    const operatorpin = resolvegatewaybind("3001", undefined);
    expect(operatorpin.port).toBe(3001);
    expect(operatorpin.portdrawn).toBe(false);
    expect(operatorpin.hostdrawn).toBe(true);
  });

  it("draws when the env stays silent or lies (empty, zero, negative, junk)", () => {
    for (const [portenv, hostenv] of [
      [undefined, undefined],
      ["", ""],
      ["   ", "   "],
      ["0", undefined],
      ["-1", ""],
      ["abc", undefined],
    ] as const) {
      const drawn = resolvegatewaybind(portenv, hostenv);
      expect(drawn.portdrawn, `PORT=${String(portenv)} must not pin`).toBe(true);
      expect(drawn.port).toBeGreaterThanOrEqual(gatewayportband.first);
      expect(drawn.port).toBeLessThanOrEqual(gatewayportband.last);
      expect(drawn.hostdrawn, `HOST=${String(hostenv)} must not pin`).toBe(true);
      expect(drawn.hostname).toMatch(/^127\.\d+\.\d+\.\d+$/);
    }
  });

  it("carries no literal bind fallback in the gateway lane sources", () => {
    const servertxt = source("getry/server.ts");
    expect(servertxt, "the transport main retired the || 3001 chain").not.toMatch(/\|\|\s*3001/);
    expect(servertxt, "the transport main retired the 0.0.0.0 host").not.toContain('"0.0.0.0"');
    expect(servertxt, "the transport main rides the drawn bind resolver").toContain("resolvegatewaybind(");
    const clitxt = source("getry/cli.ts");
    expect(clitxt, "the console serve seat retired the || 3001 chain").not.toMatch(/\|\|\s*3001/);
    expect(clitxt, "the console serve seat retired the 0.0.0.0 host").not.toContain('"0.0.0.0"');
    const bindtxt = source("getry/binddraw.ts");
    expect(bindtxt, "the draw rides node:crypto randomInt").toContain('from "node:crypto"');
    expect(bindtxt, "the port draw names the documented band").toMatch(/30000/);
    // the localhost literal answers nowhere in the gateway boot lane
    for (const file of ["getry/server.ts", "getry/cli.ts", "getry/binddraw.ts"]) {
      expect(source(file), `${file} carries no localhost bind literal`).not.toMatch(/localhost:\d+/);
    }
  });

  it("keeps the oauth callback seat on the os draw (port 0, env pin)", () => {
    const oauthtxt = source("getry/oauth.ts");
    expect(oauthtxt, "the callback server asks the os for the port").toMatch(/server\.listen\(0,/);
    expect(oauthtxt, "the callback pin rides the env, never a literal").toContain("OAUTH_CALLBACK_PORT");
    expect(oauthtxt, "the callback host rides the env loopback, never 0.0.0.0").not.toContain('"0.0.0.0"');
  });
});

describe("the one signup law (one signup family-wide, the guest identity never deleted)", () => {
  it("carries one signup lane — the vault person's door, and no sibling mounts one", () => {
    const routestxt = source("vault/routes.ts");
    expect(routestxt, "the one signup door rides the vault route table").toContain('signup: "/api/v1/auth/signup"');
    const accounttxt = source("vault/account.ts");
    expect(accounttxt, "the signup account lane lives in the vault account seat").toContain(
      "export function signupAccount(",
    );
    expect(accounttxt, "the signup http door answers the route").toMatch(/POST \/api\/v1\/auth\/signup/);
    // no sibling carries the signup lane (the walk answers only vault files)
    const carriers: string[] = [];
    for (const root of FAMILYROOTS) {
      for (const file of walksources(root)) {
        const text = readFileSync(file, "utf8");
        if (text.includes("signupAccount") || text.includes("/api/v1/auth/signup")) carriers.push(file);
      }
    }
    const strangers = carriers.filter((file) => !file.replaceAll("\\", "/").includes("/vault/"));
    expect(
      strangers,
      `only vault carries the signup lane — strangers answered: ${strangers.join(", ")}`,
    ).toEqual([]);
  });

  it("upserts the visitor identity seen-wins — born on the first write, never replayed", () => {
    expect(source("vault/db.ts"), "the vault onboarding lane upserts").toMatch(/ON CONFLICT\(visitor\) DO UPDATE SET/);
    expect(source("vault/onboardingstore.ts"), "the onboarding store lane upserts").toMatch(
      /ON CONFLICT\(visitor\) DO UPDATE SET/,
    );
    expect(source("getry/db.ts"), "the getry onboarding lane upserts").toMatch(/ON CONFLICT\(visitor\) DO UPDATE/);
    expect(source("vault/db.ts"), "the visitor row rides the platform db").toMatch(
      /CREATE TABLE IF NOT EXISTS onboarding_states/,
    );
  });

  it("carries zero delete lanes against the visitor and person identity rows family-wide", () => {
    // the identity rows: the visitor's onboarding_states and the person's
    // accounts — no source in the family ever deletes them
    const identitydelete = /DELETE\s+FROM\s+(IF\s+EXISTS\s+)?"?(onboarding_states|accounts|visitors|visitor)"?\b/i;
    const carriers: string[] = [];
    for (const root of FAMILYROOTS) {
      for (const file of walksources(root)) {
        const text = readFileSync(file, "utf8");
        if (identitydelete.test(text)) carriers.push(file);
      }
    }
    expect(
      carriers,
      `the guest identity never deletes — carriers answered: ${carriers.join(", ")}`,
    ).toEqual([]);
  });

  it("keeps the sweep lanes honest — the retention clock plans, it never deletes an identity", () => {
    const retentiontxt = source("vault/retention.ts");
    expect(retentiontxt, "the retention engine is a pure plan").not.toMatch(/\bDELETE\s+FROM\b/i);
    expect(retentiontxt, "the retention clock never rides an identity lane").not.toMatch(/visitor|account/i);
    const objectstxt = source("vault/objects.ts");
    expect(objectstxt, "the object sweep never rides an identity lane").not.toMatch(
      /DELETE\s+FROM\s+"?(onboarding_states|accounts)/i,
    );
  });
});
