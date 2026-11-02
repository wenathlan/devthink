// # ninetylaw.test — the forty live law of the ninety modality plan
// (wave w2 b1, rebased onto the ninety wave): the ten promotions this
// law wired live still ride the registry live and carry their executors
// — and the ninety wave that merged after widened the same truth to the
// full plan (the census answers 81 live, 9 host and 0 planned of the
// ninety the owner charged, the lane table answers 61 live and 12 host
// lanes), so the battery pins the post-merge truth. each promoted lane
// refuses honestly when its runtime or its configuration is absent —
// the error names the requirement (the clr lane names the assembly
// signature and the dotnet runtime, the profile lanes and the ghcr lane
// name docker, the storage lanes name their configuration keys, the ram
// lanes name the kernel privilege) — while the plan count stays pinned
// at ninety. the dispatch reality law (the engine-real rung) flipped the
// merged table: the real wire seat now wins the shared storage and ram
// ids, so this battery's direct executor drives pin the same surface the
// dispatch answers (the engine still exports both maps and the battery
// pins the surface each one owns). runnable with vitest:
// bunx vitest run tests/ninetylaw.test.ts
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { edgelaneexecutors } from "../edgelandes.ts";
import { edgelanes, runonedge } from "../edgeplane.ts";
import { MODALITIES, MODALITYPLANCOUNT, getmodality, planreport } from "../modalityregistry.ts";

/** the ten promotions of the forty live law (wave w2 b1): the ids the
 * registry flipped live and the edge plane wired lanes for. */
const PROMOTIONS = [
  "runtime-clr",
  "container-max",
  "container-lite",
  "container-ghcr",
  "storage-s3",
  "storage-libsql",
  "storage-mysql",
  "ram-tmpfs",
  "ram-zram",
  "ram-swapfile",
] as const;

/** one normalized lane answer — the same shape runonedge answers, kept
 * honest when the battery drives a vault-lane executor directly. */
type LaneAnswer = {
  status: "succeeded" | "failed";
  stdout?: string;
  artifact?: unknown;
  error?: { code?: string; message?: string };
};

/** drives one vault-lane executor directly — the engine's own executor
 * map of the forty live law (the merged dispatch prefers the
 * in-process signer, speaker and recipe lanes for the storage and ram
 * ids, so the refusal surface this battery pins rides its own executors
 * here); a throw normalizes to the same failed shape the dispatch
 * answers, a success answers the lane's own output. */
async function runvaultlane(modality: string, code: string): Promise<LaneAnswer> {
  const executor = edgelaneexecutors[modality];
  if (executor === undefined) {
    return { status: "failed", error: { code: "LANE_EXECUTOR_ABSENT", message: `the lane ${modality} carries no vault executor` } };
  }
  try {
    const output = await executor(code, undefined, 20000);
    return { status: "succeeded", stdout: output.stdout, artifact: output.artifact };
  } catch (error) {
    const laneerror = error as { code?: string; message?: string };
    return { status: "failed", error: { code: laneerror.code, message: laneerror.message } };
  }
}

/** runs one vault-lane executor with the given configuration keys lifted
 * off the env — the honest absence surface of the storage lanes the
 * forty live law wired — and restores the environment after (the lane
 * answers what the host carries, the test pins what the host does
 * not). */
async function runwithoutenv(modality: string, code: string, keys: readonly string[]): Promise<LaneAnswer> {
  const saved = new Map(keys.map((key) => [key, process.env[key]]));
  for (const key of keys) delete process.env[key];
  try {
    return await runvaultlane(modality, code);
  } finally {
    for (const [key, value] of saved) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

describe("the forty live law of the ninety plan (wave w2 b1)", () => {
  it("answers the census the owner charged: the ninety wave widened the forty to the full plan", () => {
    assert.equal(MODALITYPLANCOUNT, 90, "the plan count stays pinned at ninety");
    assert.equal(MODALITIES.length, 90, "the catalog holds the ninety");
    const report = planreport();
    assert.equal(report.plancount, 90);
    assert.equal(report.catalogcount, 90);
    assert.equal(report.live, 81, "the ninety wave answered the full plan live");
    assert.equal(report.host, 9);
    assert.equal(report.planned, 0);
    assert.equal(report.live + report.host + report.planned, MODALITIES.length);
    assert.equal(report.plananswered, true);
  });

  it("declares every promotion live in the registry", () => {
    for (const id of PROMOTIONS) {
      assert.equal(getmodality(id)?.state, "live", `the record ${id} rides the live set`);
    }
  });

  it("wires an executor and a live lane for every promotion", () => {
    const lanes = edgelanes();
    for (const id of PROMOTIONS) {
      assert.equal(typeof edgelaneexecutors[id], "function", `the lane ${id} carries its executor`);
      const lane = lanes.find((entry) => entry.modality === id);
      assert.ok(lane, `the lane ${id} rides the edge plane table`);
      assert.equal(lane.kind, "live", `the lane ${id} is live`);
      assert.ok(lane.runtime.length > 0, `the lane ${id} names its runtime`);
      assert.equal(lane.probed, true, `the lane ${id} is probed`);
      assert.equal(typeof lane.present, "boolean", `the lane ${id} answers its presence honestly`);
    }
    // the table counts the same census the registry declares — the
    // ninety wave merged the full wiring, so the live set answers 61
    // lanes beside the 12 host seats
    assert.equal(lanes.filter((lane) => lane.kind === "live").length, 61);
    assert.equal(lanes.filter((lane) => lane.kind === "host").length, 12);
  });

  it("refuses the clr lane on bytes that carry no assembly signature", async () => {
    // the signature gate answers before any spawn — the lane never feeds
    // the runtime bytes it can refuse itself (the gate rides the base
    // executor map this law wired; the merged dispatch prefers the host
    // clr lane on a dotnet-carrying host, so the battery pins the gate
    // directly)
    const invalid = await runvaultlane("runtime-clr", "not-an-assembly");
    assert.equal(invalid.status, "failed");
    assert.equal(invalid.error?.code, "ASSEMBLY_BYTES_INVALID");
    assert.ok(invalid.error?.message.includes("assembly"), "the message names the assembly law");
  });

  it(
    "names the dotnet runtime when the clr lane carries honest pe bytes",
    async () => {
      // the mz signature the runtime demands, over bytes that are no real
      // assembly: the lane rides exactly as far as the host runtime answers
      // (the probe deadline below exceeds the suite default, so the test
      // carries its own ceiling that covers the honest deadline a cold
      // runner needs — the lane answers before either clock dies)
      const bytes = Buffer.concat([Buffer.from([0x4d, 0x5a]), Buffer.alloc(64, 0)]);
      const result = await runonedge({
        modality: "runtime-clr",
        code: bytes.toString("base64"),
        deadlinems: 20000,
      });
      // an absent dotnet answers host-runtime-absent, a present dotnet
      // refuses the stub honestly, and a cold runner's dotnet can ride
      // past the probe ceiling — the deadline kill is the third honest
      // answer the deadline law documents (the lane names the clock it
      // rode when the runtime outruns it)
      assert.equal(result.status, "failed");
      assert.ok(
        result.error?.code === "HOST_RUNTIME_ABSENT" ||
          result.error?.code === "RUN_EXITED_NONZERO" ||
          result.error?.code === "RUN_DEADLINE_EXCEEDED",
        `the clr refusal stays honest: ${result.error?.code}`,
      );
      assert.ok(
        result.error?.code === "RUN_DEADLINE_EXCEEDED" || result.error?.message.includes("dotnet"),
        "the message names the runtime",
      );
    },
    30000,
  );

  it("names docker when the profile lanes meet an absent daemon", async () => {
    for (const profile of ["max", "lite"] as const) {
      const result = await runonedge({ modality: `container-${profile}`, code: "" });
      if (result.status === "failed") {
        // docker rides the host: absent answers host-runtime-absent, a
        // present-but-failing daemon answers run-exited-nonzero — the
        // assertion follows the probe instead of pinning a host the lane
        // never saw
        assert.ok(
          result.error?.code === "HOST_RUNTIME_ABSENT" || result.error?.code === "RUN_EXITED_NONZERO",
          `the ${profile} profile refusal stays honest: ${result.error?.code}`,
        );
        assert.ok(result.error?.message.includes("docker"), `the ${profile} message names the runtime`);
      } else {
        // a present docker answers the daemon document under the profile
        // vector the engine memory recipe computed
        assert.ok(result.stdout?.includes(`docker ${profile} profile:`), `the ${profile} lane names its profile`);
        assert.equal(result.artifact?.mime, "application/json");
      }
    }
  });

  it("refuses the ghcr lane on any mutable tag before it spawns", async () => {
    // the digest-pin gate answers before any spawn — the mutable tag
    // never reaches a daemon (the gate rides the base executor map this
    // law wired; the merged dispatch prefers the host ghcr lane on a
    // docker-carrying host, so the battery pins the gate directly)
    const tag = await runvaultlane("container-ghcr", "ghcr.io/devthink/hello:latest");
    assert.equal(tag.status, "failed");
    assert.equal(tag.error?.code, "GHCR_REFERENCE_UNPINNED");
    assert.ok(tag.error?.message.includes("pinned"), "the message names the digest-pin policy");
  });

  it("names docker when the ghcr lane carries one pinned reference", async () => {
    const digest = `ghcr.io/devthink/ninetylaw-probe@sha256:${"a".repeat(64)}`;
    const result = await runonedge({ modality: "container-ghcr", code: digest, deadlinems: 30000 });
    // an absent docker answers host-runtime-absent, a present docker
    // answers the registry verdict of the unpullable digest honestly
    // (a slow registry may answer the deadline instead)
    assert.equal(result.status, "failed");
    assert.ok(
      result.error?.code === "HOST_RUNTIME_ABSENT" ||
        result.error?.code === "RUN_EXITED_NONZERO" ||
        result.error?.code === "RUN_DEADLINE_EXCEEDED",
      `the ghcr refusal stays honest: ${result.error?.code}`,
    );
    if (result.error?.code === "HOST_RUNTIME_ABSENT") {
      assert.ok(result.error?.message.includes("docker"), "the message names the runtime");
    }
  }, 45000);

  it("names the storage configuration when the s3 lane meets an absent env", async () => {
    const result = await runwithoutenv("storage-s3", "the ninety law probe payload", [
      "SADDLE_S3_ENDPOINT",
      "SADDLE_S3_KEY",
      "SADDLE_S3_SECRET",
      "SADDLE_S3_BUCKET",
      "SADDLE_S3_REGION",
    ]);
    assert.equal(result.status, "failed");
    assert.equal(result.error?.code, "HOST_RUNTIME_ABSENT");
    assert.ok(result.error?.message.includes("SADDLE_S3_ENDPOINT"), "the message names the configuration");
  });

  it("names the libsql configuration when the lane meets an absent url", async () => {
    const result = await runwithoutenv("storage-libsql", "the ninety law probe payload", ["LIBSQL_URL"]);
    assert.equal(result.status, "failed");
    assert.equal(result.error?.code, "HOST_RUNTIME_ABSENT");
    assert.ok(result.error?.message.includes("LIBSQL_URL"), "the message names the configuration");
  });

  it("names the mysql configuration when the lane meets an absent url", async () => {
    const result = await runwithoutenv("storage-mysql", "the ninety law probe payload", ["MYSQL_URL"]);
    assert.equal(result.status, "failed");
    assert.equal(result.error?.code, "HOST_RUNTIME_ABSENT");
    assert.ok(result.error?.message.includes("MYSQL_URL"), "the message names the configuration");
  });

  it("answers the tmpfs recipe honestly through the privilege ladder", async () => {
    const result = await runvaultlane("ram-tmpfs", "the ninety law probe payload");
    if (result.status === "failed") {
      // a host without the mount binary answers host-runtime-absent, a
      // host without the mount privilege answers host-privilege-absent —
      // both name the tmpfs requirement, never a faked ramdisk
      assert.ok(
        result.error?.code === "HOST_RUNTIME_ABSENT" ||
          result.error?.code === "HOST_PRIVILEGE_ABSENT" ||
          result.error?.code === "RUN_EXITED_NONZERO",
        `the tmpfs refusal stays honest: ${result.error?.code}`,
      );
      if (result.error?.code === "HOST_RUNTIME_ABSENT" || result.error?.code === "HOST_PRIVILEGE_ABSENT") {
        assert.ok(result.error?.message.includes("tmpfs"), "the message names the tmpfs requirement");
      }
    } else {
      // a privileged host answered the recipe — the payload roundtripped in ram
      assert.ok(result.stdout?.includes("tmpfs recipe applied"), "the run names the recipe");
      assert.ok(result.artifact, "the ramdisk roundtrip answered its payload");
    }
  });

  it("answers the zram recipe honestly through the privilege ladder", async () => {
    const result = await runvaultlane("ram-zram", "");
    if (result.status === "failed") {
      // a host missing binaries of the set answers host-runtime-absent, a
      // host without the /sys privilege answers host-privilege-absent —
      // both name the zram requirement, never a faked compression ratio
      assert.ok(
        result.error?.code === "HOST_RUNTIME_ABSENT" ||
          result.error?.code === "HOST_PRIVILEGE_ABSENT" ||
          result.error?.code === "RUN_EXITED_NONZERO",
        `the zram refusal stays honest: ${result.error?.code}`,
      );
      if (result.error?.code === "HOST_RUNTIME_ABSENT" || result.error?.code === "HOST_PRIVILEGE_ABSENT") {
        assert.ok(result.error?.message.includes("zram"), "the message names the zram requirement");
      }
    } else {
      // a privileged host answered the recipe — the verify output rode stdout
      assert.ok(result.stdout?.includes("zram recipe applied"), "the run names the recipe");
    }
  });

  it("answers the swapfile recipe honestly through the privilege ladder", async () => {
    const result = await runvaultlane("ram-swapfile", "");
    if (result.status === "failed") {
      // a host missing binaries of the set answers host-runtime-absent, a
      // host without the swapon privilege answers host-privilege-absent —
      // both name the swap requirement, never a faked swap device
      assert.ok(
        result.error?.code === "HOST_RUNTIME_ABSENT" ||
          result.error?.code === "HOST_PRIVILEGE_ABSENT" ||
          result.error?.code === "RUN_EXITED_NONZERO" ||
          result.error?.code === "SWAP_VERIFY_FAILED",
        `the swapfile refusal stays honest: ${result.error?.code}`,
      );
      if (result.error?.code === "HOST_RUNTIME_ABSENT" || result.error?.code === "HOST_PRIVILEGE_ABSENT") {
        assert.ok(result.error?.message.includes("swap"), "the message names the swap requirement");
      }
    } else {
      // a privileged host answered the recipe — /proc/swaps carried the session swap
      assert.ok(result.stdout?.includes("swapfile recipe applied"), "the run names the recipe");
    }
  });
});
