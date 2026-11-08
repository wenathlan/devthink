// # modalityregistry.test — the catalog contract: the ninety modality plan
// answered (the count the owner charged), every record complete and
// honestly stated, the boot ladder consistent with the records, the join
// resolver answering the nuclear law (the workload asks, the engine
// resolves), the lite base refusing the hardware images, and the plan
// report counting exactly what the catalog holds. runnable with vitest:
// pnpm vitest run test/modalityregistry.test.ts
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
  BOOTLADDER,
  getmodality,
  MODALITIES,
  MODALITYPLANCOUNT,
  MODALITY_COUNT,
  planreport,
  resolvejoin,
} from "../modalities.ts";

/** the records the platform lanes drive today — the honest live set the
 * report and the lanes agree on (the run lane executes node inside the
 * container, the storage lane drives the session jail, and the edge
 * plane lanes drive the babel, webpack and universal sh lanes
 * server-side; the pr15 completion wave seated the wasme, exe, binary,
 * sh and yaml runner seats, the port dock, the container dock
 * principal, the virtual file store and the virtual hardware
 * presentation seats). the seventeen registry-only ids the owner's
 * audit named (the host runtimes and the inproc seats the engine never
 * carried real executors for) left the live set for the honest planned
 * shelf — the record never pretends a wiring the engine does not drive.
 * the visitor-law hardening retired the local-optin consent gate (the
 * critical law is absolute: no seat may touch the visitor machine under
 * any consent token) and seated the pod session host probe of seat
 * ninety in its place */
const LIVESET = [
  "browserwebcontainer",
  "buildbazel",
  "ciactions",
  "containercontainerd",
  "containercrun",
  "containerdocker",
  "containerdockprincipal",
  "containerghcr",
  "containerlite",
  "containermax",
  "containerpodman",
  "containerrunc",
  "deliverycdn",
  "deliverygrpc",
  "deliverywss",
  "fsvfs",
  "gpuvirgl",
  "hardwarevirtual",
  "languagego",
  "languagejava",
  "languagepython",
  "languageruby",
  "microvmgpuless",
  "mobiletermux",
  "networki2p",
  "networktor",
  "networkwireguard",
  "portsdock",
  "rammmap",
  "ramoverlayfs",
  "ramswapfile",
  "ramtmpfs",
  "ramzram",
  "runnerbabel",
  "runnerbinary",
  "runnerbun",
  "runnerexe",
  "runnernode",
  "runnersh",
  "runneruniversal",
  "runnerwasm",
  "runnerwasme",
  "runnerwebpack",
  "runneryaml",
  "runtimeclr",
  "runtimejvm",
  "runtimeworkerd",
  "sandboxbubblewrap",
  "sandboxchroot",
  "sandboxnsjail",
  "screenxvfb",
  "storagelibsql",
  "storagemysql",
  "storagepostgres",
  "storages3",
  "virtualdrivers",
  "virtualfile",
  "virtualfull",
  "virtualgpu",
  "virtualkvm",
  "virtualprocessor",
  "virtualscreen",
  "virtualvcpu",
  "virtualvgpu",
] as const;

/** the records whose host runtime the sandbox lane probes (the three
 * provider seats and the pod session seat the heavyweight probes answer
 * beside the confidential, emulation and container-runtime seats). */
const HOSTSET = [
  "browserserver",
  "confidentialsevsnp",
  "containerrunsc",
  "emulatorqemu",
  "microvmfirecracker",
  "podsession",
  "runneraws",
  "runnerdaytona",
  "runnertwob",
] as const;

describe("the modality registry", () => {
  it("answers the ninety modality plan the owner charged", () => {
    assert.equal(MODALITYPLANCOUNT, 90);
    assert.equal(MODALITIES.length, MODALITYPLANCOUNT, `the catalog holds ${MODALITIES.length}`);
    assert.equal(MODALITY_COUNT, MODALITIES.length, "the derived count never drifts from the catalog");
    const report = planreport();
    assert.equal(report.plananswered, true);
    assert.equal(report.plancount, 90);
    assert.equal(report.catalogcount, MODALITIES.length);
    assert.equal(report.live + report.host + report.planned, MODALITIES.length);
  });

  it("carries a complete record for every modality", () => {
    for (const modality of MODALITIES) {
      assert.ok(modality.id.length > 0);
      assert.ok(modality.label.length > 0);
      assert.ok(["live", "host", "planned"].includes(modality.state), `${modality.id} carries no honest state`);
      assert.ok(
        modality.mime.startsWith("application/") ||
          modality.mime.startsWith("audio/") ||
          modality.mime.startsWith("video/"),
      );
      assert.ok(modality.bootms >= 0);
      // a record never claims a boot cost above its class ceiling
      assert.ok(modality.bootms <= BOOTLADDER[modality.boot], `${modality.id} exceeds its class`);
      assert.ok(Array.isArray(modality.drivers));
      assert.ok(Array.isArray(modality.hardening));
    }
  });

  it("keeps ids unique and the boot ladder measured", () => {
    const ids = new Set(MODALITIES.map((m) => m.id));
    assert.equal(ids.size, MODALITIES.length);
    assert.equal(BOOTLADDER.hot < BOOTLADDER.warm, true);
    assert.equal(BOOTLADDER.warm < BOOTLADDER.cold, true);
  });

  it("declares the live set and the host set exactly as the lanes drive them", () => {
    const live = MODALITIES.filter((m) => m.state === "live")
      .map((m) => m.id)
      .sort();
    assert.deepEqual(live, [...LIVESET].sort());
    const host = MODALITIES.filter((m) => m.state === "host")
      .map((m) => m.id)
      .sort();
    assert.deepEqual(host, [...HOSTSET].sort());
    // the plan report counts the same sets — it cannot drift from the catalog
    const report = planreport();
    assert.equal(report.live, LIVESET.length);
    assert.equal(report.host, HOSTSET.length);
    assert.equal(report.planned, MODALITIES.length - LIVESET.length - HOSTSET.length);
  });

  it("resolves the join without the caller naming a modality", () => {
    const answer = resolvejoin({ base: "balanced", gpu: true, network: true, isolation: "hardware" });
    assert.ok(answer.length >= 1);
    for (const modality of answer) {
      assert.equal(modality.gpu, true);
      assert.equal(modality.network, true);
    }
    // the best candidate boots fastest
    for (let i = 1; i < answer.length; i++) {
      assert.ok(answer[i - 1].bootms <= answer[i].bootms);
    }
  });

  it("refuses the hardware images on the lite base and honors the boot budget", () => {
    const lite = resolvejoin({ base: "lite", gpu: false, network: true });
    for (const modality of lite) assert.notEqual(modality.isolation, "hardware");
    const tight = resolvejoin({ base: "max", gpu: false, network: false, bootbudget: 50 });
    for (const modality of tight) assert.ok(modality.bootms <= 50, `${modality.id} boots in ${modality.bootms}`);
    // a gpu demand with no network under the tight budget answers the
    // virtual gpu presentation seat (gpu true, network false, hot boot)
    // — the presentation seats satisfy the join the machine images
    // cannot (the pr15 completion wave seated them)
    const gpuonly = resolvejoin({ base: "max", gpu: true, network: false, bootbudget: 50 });
    assert.ok(gpuonly.length >= 1, "the gpu presentation seat answers the join");
    for (const modality of gpuonly) {
      assert.equal(modality.gpu, true);
      assert.equal(modality.network, false);
      assert.ok(modality.bootms <= 50, `${modality.id} boots in ${modality.bootms}`);
    }
    assert.ok(gpuonly.some((modality) => modality.id === "virtualgpu"), "the virtual gpu seat rides the answer");
    // an impossible demand still answers the empty join: a gpu with no
    // network under a 5 ms budget (the virtual gpu seat boots at 25 ms —
    // no gpu seat answers that fast)
    const none = resolvejoin({ base: "max", gpu: true, network: false, bootbudget: 5 });
    assert.equal(none.length, 0);
  });

  it("answers records by id", () => {
    assert.equal(getmodality("containerdockprincipal")?.family, "container");
    assert.equal(getmodality("no-such-modality"), undefined);
  });
});
