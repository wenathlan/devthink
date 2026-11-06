// # familyface.test — the container configuration law of the eleven roots,
// runnable with the house vitest suite:
//   pnpm test
// The nginxfamily wave answers the owner order: the framework, library,
// resource and tool configuration files standardize at the root of every
// app the way the vault reference owns them. This battery pins the surface
// end to end: every one of the eleven seats carries nginx-face.conf,
// docker-compose.yml, docker.config and Dockerfile at the application
// root; every nginx conf carries the resolver law (the docker embedded
// dns at request time), the /api/* proxy lane (the ^~ precedence the
// regex blocks never steal) and the security header set the netlify
// _headers law declares; every compose seats the engine/face pair the
// vault precedent wires (the face gates on the engine health lane) with
// one distinct host door per family member; and every docker.config
// answers the saddle meta format (name, title, version, date, language,
// sources, mergeReport) with the version the app manifest stamps.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { describe, it } from "vitest";

/** the eleven seats of the family, one row per app (the engineowners law). */
const FAMILY = [
  "argan",
  "cadria",
  "cobaia",
  "debonair",
  "devthink",
  "forge",
  "foundry",
  "getry",
  "saddle",
  "stealthhead",
  "vault",
] as const;

/** reads one root file of one sibling app (this battery sits one level
 * deeper than the app suites: the family walk starts at the repository
 * root the os owns). */
function read(app: string, file: string): string {
  return readFileSync(new URL(`../../${app}/${file}`, import.meta.url), "utf8");
}

/** the pair service names each compose wires — the vault precedent keeps
 * the short `engine`/`face` spellings, the ten siblings carry the app
 * prefix the wave standardizes. */
function pairOf(app: string): { engine: string; face: string } {
  return app === "vault" ? { engine: "engine", face: "face" } : { engine: `${app}-engine`, face: `${app}-face` };
}

/** the one distinct host door every face owns — no two composes ever claim
 * the same host port (the collision law the wave maps). */
const HOSTDOOR: Record<string, number> = {
  vault: 80,
  argan: 8081,
  cadria: 8082,
  cobaia: 8083,
  debonair: 8084,
  devthink: 8085,
  forge: 8086,
  foundry: 8087,
  getry: 8088,
  saddle: 8089,
  stealthhead: 8090,
};

/** the real health lane each compose documents — the image healthcheck the
 * engine rides (the runner probes, the webserver route, the vault health
 * surface; the static seats answer the listen probe on 8080). */
const HEALTHLANE: Record<string, RegExp> = {
  vault: /\/api\/health/,
  argan: /127\.0\.0\.1:8080\//,
  cadria: /127\.0\.0\.1:8080\//,
  cobaia: /127\.0\.0\.1:8080\//,
  debonair: /127\.0\.0\.1:8080\//,
  forge: /127\.0\.0\.1:8080\//,
  foundry: /127\.0\.0\.1:8080\//,
  getry: /127\.0\.0\.1:8080\//,
  stealthhead: /127\.0\.0\.1:8080\//,
  devthink: /\/healthz/,
  saddle: /\/api\/v1\/health/,
};

describe("the eleven roots carry the container configuration law", () => {
  it("stamps nginx-face.conf, docker-compose.yml, docker.config and Dockerfile at every app root", () => {
    for (const app of FAMILY) {
      for (const file of ["Dockerfile", "docker-compose.yml", "nginx-face.conf", "docker.config"] as const) {
        assert.ok(
          existsSync(new URL(`../../${app}/${file}`, import.meta.url)),
          `${app}/${file} must sit at the application root`,
        );
      }
    }
  });

  it("keeps one distinct host door per family face — no two composes claim the same port", () => {
    const doors = Object.values(HOSTDOOR);
    assert.equal(new Set(doors).size, doors.length, "the host doors never collide");
    for (const app of FAMILY) {
      const compose = read(app, "docker-compose.yml");
      assert.ok(
        compose.includes(`"${HOSTDOOR[app]}:8080"`),
        `${app}/docker-compose.yml must publish the face on ${HOSTDOOR[app]}:8080`,
      );
    }
  });
});

describe("the nginx face law (the vault pattern every conf carries)", () => {
  it("rides the resolver law, the /api proxy lane and the security headers on every face", () => {
    for (const app of FAMILY) {
      const conf = read(app, "nginx-face.conf");
      assert.match(
        conf,
        /^resolver 127\.0\.0\.11 valid=10s ipv6=off;$/m,
        `${app}/nginx-face.conf must carry the docker embedded dns resolver`,
      );
      assert.match(
        conf,
        /location\s+(?:\^~\s+)?\/api\/\s*\{/,
        `${app}/nginx-face.conf must carry the /api/ proxy lane`,
      );
      assert.match(conf, /proxy_pass\s+\$/, `${app}/nginx-face.conf must proxy through the request-time variable`);
      assert.match(
        conf,
        /add_header X-Content-Type-Options nosniff always;/,
        `${app}/nginx-face.conf must carry the nosniff law`,
      );
      assert.match(
        conf,
        /add_header X-Frame-Options DENY always;/,
        `${app}/nginx-face.conf must carry the frame denial law`,
      );
      assert.match(
        conf,
        /add_header Referrer-Policy strict-origin-when-cross-origin always;/,
        `${app}/nginx-face.conf must carry the referrer law`,
      );
      assert.match(conf, /return 403/, `${app}/nginx-face.conf must refuse the sealed faces`);
      assert.match(
        conf,
        /try_files \$uri \$uri\/ \/index\.html;/,
        `${app}/nginx-face.conf must carry the spa rewrite`,
      );
    }
  });
});

describe("the compose pair law (the vault precedent every app seats)", () => {
  it("wires the engine beside the face with the health gate and the real health lane", () => {
    for (const app of FAMILY) {
      const compose = read(app, "docker-compose.yml");
      const { engine, face } = pairOf(app);
      assert.ok(compose.includes("services:"), `${app}/docker-compose.yml declares services`);
      assert.ok(
        new RegExp(`^  ${engine}:$`, "m").test(compose),
        `${app}/docker-compose.yml seats the ${engine} service`,
      );
      assert.ok(
        new RegExp(`^  ${face}:$`, "m").test(compose),
        `${app}/docker-compose.yml seats the ${face} service`,
      );
      assert.ok(
        compose.includes("condition: service_healthy"),
        `${app}/docker-compose.yml gates the face on the engine health lane`,
      );
      assert.match(
        compose,
        HEALTHLANE[app],
        `${app}/docker-compose.yml documents the real health lane the engine image rides`,
      );
      assert.ok(
        compose.includes("restart: unless-stopped"),
        `${app}/docker-compose.yml keeps the pair answering across host reboots`,
      );
    }
  });
});

describe("the docker.config law (the saddle meta format every app stamps)", () => {
  it("answers the meta format with the version the app manifest declares", () => {
    for (const app of FAMILY) {
      const raw = read(app, "docker.config");
      let meta: {
        name: string;
        title: string;
        version: string;
        date: string;
        language: string;
        sources: string[];
        mergeReport: Record<string, unknown>;
      };
      try {
        meta = JSON.parse(raw).meta;
      } catch (error) {
        assert.fail(`${app}/docker.config must parse as json: ${(error as Error).message}`);
      }
      assert.equal(meta.name, "docker.config", `${app}/docker.config names the seat`);
      assert.ok(
        meta.title.startsWith(app),
        `${app}/docker.config titles the app honestly`,
      );
      const manifest = JSON.parse(read(app, "package.json")) as { version: string };
      assert.equal(meta.version, manifest.version, `${app}/docker.config carries the manifest version`);
      assert.equal(meta.date, "2026-11-06", `${app}/docker.config carries the wave date`);
      assert.equal(meta.language, "en", `${app}/docker.config carries the language`);
      assert.ok(
        Array.isArray(meta.sources) && meta.sources.length > 0 && meta.sources.every((s) => typeof s === "string"),
        `${app}/docker.config lists the real sources`,
      );
      assert.ok(meta.mergeReport, `${app}/docker.config carries the merge report`);
    }
  });
});
