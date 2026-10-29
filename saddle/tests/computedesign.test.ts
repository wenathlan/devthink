/**
 * real tests for the sv2-c compute face (worklog task sv2-c): the design
 * law suite reads the interface sources and asserts the compute face stays
 * honest — the page ships no fixed provider tables, the catalog winget
 * rides the saddle api with loading, error and empty states, the boot
 * ladder computes its ceilings from the fetched records, the console
 * carries the edge-law banner, api.ts exports the pinned helpers with each
 * route appearing exactly once, and the winget barrel exports all three
 * new surfaces. the pinned response shape is validated with a stub against
 * the typed fields the api module declares.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "vitest";

/** repository root resolved from this test file location. */
const reporoot = join(dirname(fileURLToPath(import.meta.url)), "..");

/** reads one interface source file as text (the design tests stay
 * source-level: the api module is browser-facing ts). */
function source(...parts: string[]): string {
  return readFileSync(join(reporoot, ...parts), "utf8");
}

describe("the compute face design law", () => {
  it("the compute page ships no fixed provider or bridge arrays and no third-party brands", () => {
    const page = source("Sol", "compute", "compute.tsx");
    assert.ok(!/providers\s*=\s*\[/.test(page), "the fixed providers array must die");
    assert.ok(!/bridge\s*=\s*\[/.test(page), "the fixed bridge array must die");
    assert.ok(
      !/GitHub Actions|Hugging Face|Kaggle|Forgejo/.test(page),
      "third-party provider brand copy must die with the arrays",
    );
  });

  it("the compute page keeps the shell anchor and mounts the two api wingets", () => {
    const page = source("Sol", "compute", "compute.tsx");
    assert.ok(page.includes("PageShell"), "the page keeps the PageShell frame");
    assert.ok(page.includes("ComputeModalitycatalog"), "the catalog winget is mounted");
    assert.ok(page.includes("ComputeBootladder"), "the boot ladder winget is mounted");
    assert.ok(/from ["']\.\.\/wingets["']/.test(page), "the wingets arrive through the shared winget barrel");
  });

  it("the catalog winget rides the api and carries no fixed records", () => {
    const winget = source("Sol", "wingets", "ComputeModalitycatalog.tsx");
    assert.ok(/fetchmodalities|apifetch/.test(winget), "the winget fetches through the api surface");
    assert.ok(!/\{\s*id:\s*["']/.test(winget), "no fixed record literals inside the winget");
    assert.ok(winget.includes("dash-skeleton"), "loading renders skeleton rows");
    assert.ok(winget.includes("the engine is unreachable"), "the error state carries the honest line");
    assert.ok(winget.includes("the catalog rides the saddle api"), "the error sentence states where the catalog rides");
    assert.ok(/records\.length === 0/.test(winget), "the empty state covers a plan with no records");
  });

  it("the boot ladder computes its ceilings from the fetched records", () => {
    const winget = source("Sol", "wingets", "ComputeBootladder.tsx");
    assert.ok(/fetchmodalities|apifetch/.test(winget), "the ladder fetches the plan");
    assert.ok(/Math\.min/.test(winget), "the floor comes from the records");
    assert.ok(/Math\.max/.test(winget), "the ceiling comes from the records");
    assert.ok(/bootms/.test(winget), "the rungs read the record bootms field");
  });

  it("the console carries the edge-law banner with the law sentence and a fetch", () => {
    const page = source("Sol", "console", "console.tsx");
    assert.ok(page.includes("ConsoleEdgelaw"), "the console mounts the banner");
    assert.ok(
      page.indexOf("ConsoleEdgelaw") < page.indexOf("console-section"),
      "the banner lands above the console surface",
    );
    const banner = source("Sol", "wingets", "ConsoleEdgelaw.tsx");
    assert.ok(
      banner.includes("the saddle edge engine executes every pass"),
      "the banner carries the first half of the law sentence",
    );
    assert.ok(
      banner.includes("nothing runs on the visitor machine"),
      "the banner carries the second half of the law sentence",
    );
    assert.ok(/fetchmodalities|apifetch/.test(banner), "the banner fetches the live/host/planned micro-counts");
  });

  it("api.ts exports the pinned helpers with each route string exactly once", () => {
    const api = source("api.ts");
    assert.ok(/export async function fetchmodalities/.test(api), "fetchmodalities is exported");
    assert.ok(/export async function fetchedgelanes/.test(api), "fetchedgelanes is exported");
    assert.ok(/export type ModalityRecord/.test(api), "ModalityRecord is exported");
    assert.ok(/export type ModalityPlan/.test(api), "ModalityPlan is exported");
    assert.ok(/export type EdgeLane/.test(api), "EdgeLane is exported");
    const modalitiesroutes = api.match(/\/api\/v1\/modalities/g) ?? [];
    assert.equal(modalitiesroutes.length, 1, "the modalities route appears exactly once");
    const laneroutes = api.match(/\/api\/v1\/edge\/lanes/g) ?? [];
    assert.equal(laneroutes.length, 1, "the edge lanes route appears exactly once");
  });

  it("the winget barrel exports all three new surfaces", () => {
    const barrel = source("Sol", "wingets", "index.ts");
    assert.ok(/export \{ default as ComputeModalitycatalog \}/.test(barrel));
    assert.ok(/export \{ default as ComputeBootladder \}/.test(barrel));
    assert.ok(/export \{ default as ConsoleEdgelaw \}/.test(barrel));
  });

  it("the pinned modality payload satisfies the typed record shape with a stub", () => {
    const api = source("api.ts");
    const block = api.slice(api.indexOf("export type ModalityRecord"), api.indexOf("export type ModalityPlan"));
    const fields = [...block.matchAll(/\n {2}(\w+):/g)].map((match) => match[1]);
    assert.deepEqual(
      fields,
      [
        "id",
        "label",
        "family",
        "isolation",
        "state",
        "drivers",
        "hardening",
        "boot",
        "bootms",
        "gpu",
        "network",
        "mime",
      ],
      "the record type mirrors the pinned contract field order",
    );
    // the stub: one honest record as the engine answers it
    const stub: Record<string, unknown> = {
      id: "stub-webgpu",
      label: "stub modality",
      family: "compute",
      isolation: "gvisor",
      state: "live",
      drivers: ["stub-driver"],
      hardening: ["seccomp"],
      boot: "hot",
      bootms: 120,
      gpu: false,
      network: true,
      mime: "text/plain",
    };
    assert.deepEqual(Object.keys(stub), fields, "the stub carries exactly the contract fields");
    assert.ok(api.includes('state: "live" | "host" | "planned"'), "the state union is pinned");
    assert.ok(api.includes('boot: "hot" | "warm" | "cold"'), "the boot union is pinned");
    assert.ok(api.includes('kind: "live" | "host"'), "the lane kind union is pinned");
  });

  it("the pinned edge lane payload satisfies the typed lane shape with a stub", () => {
    const api = source("api.ts");
    const block = api.slice(api.indexOf("export type EdgeLane"));
    const fields = [...block.matchAll(/\n {2}(\w+):/g)].map((match) => match[1]);
    assert.deepEqual(
      fields,
      ["modality", "kind", "runtime", "probed", "present"],
      "the lane type mirrors the pinned contract field order",
    );
    // the stub: one honest lane as the engine answers it
    const stub: Record<string, unknown> = {
      modality: "stub-webgpu",
      kind: "live",
      runtime: "stub-runtime",
      probed: true,
      present: true,
    };
    assert.deepEqual(Object.keys(stub), fields, "the stub carries exactly the contract fields");
  });
});
