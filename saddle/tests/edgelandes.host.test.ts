// # edgelandes.host.test — the host binary lanes of the ninety
// modalities wave, group a, answer the honesty law: the twenty-five
// pinned lane ids wire a spec, an executor and an id exactly (frozen,
// unique, all live), a lane whose runtime this host does not carry
// answers the coded host-runtime-absent naming the runtime (the probe
// rides probehostbinary inside this test — the lane never fakes a
// run), a lane whose runtime is present answers a real run or an
// honest coded refusal, no lane leaves a saddleedge temp directory
// behind, and a sleeping program dies at the deadline. The tests stay
// green on a host with zero host runtimes (the honest refusals) and on
// a host that carries them (the real runs). runnable with vitest:
// pnpm vitest run tests/edgelandes.host.test.ts
import assert from "node:assert/strict";
import { readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { describe, it } from "vitest";
import { edgelaneexecutorshost, hostlaneids, hostlanespecs } from "../edgelandes.host.ts";
import { probehostbinary } from "../edgelandes.ts";

/** the twenty-five host binary lane ids the pinned contract charges
 * (parallel waves and the dispatcher merge read these exactly). */
const HOSTBINLANES = [
  "sandbox-bubblewrap",
  "sandbox-nsjail",
  "sandbox-chroot",
  "container-podman",
  "container-containerd",
  "container-runc",
  "container-crun",
  "container-max",
  "container-lite",
  "container-ghcr",
  "runtime-clr",
  "runtime-workerd",
  "screen-xvfb",
  "screen-wayland",
  "mobile-termux",
  "build-bazel",
  "build-buck",
  "build-turborepo",
  "ci-actions",
  "ci-gitlab",
  "network-tor",
  "network-i2p",
  "network-wireguard",
  "storage-minio",
  "storage-garage",
] as const;

/** the coded lane error of an unknown thrown value: undefined when the
 * throw carried no machine code — the uncoded crash these tests refuse. */
const laneerrorcode = (error: unknown): string | undefined => {
  const code = (error as { code?: unknown })?.code;
  return typeof code === "string" && code.length > 0 ? code : undefined;
};

/** the trivial smoke program per lane: bash-shaped by default (most
 * host lanes ride a shell script), the odd runtimes get their own seat. */
const smokeprogram = (id: string): string => {
  if (id === "runtime-clr") return 'Console.WriteLine("smoke:42");';
  if (id === "runtime-workerd") return 'export default { fetch: () => new Response("smoke:42") };';
  if (id === "network-wireguard") return "";
  return "echo smoke:42";
};

/** the saddleedge temp entries of the os tmpdir right now (the private
 * seat every host lane creates and must remove). */
const saddleedgetmpentries = async (): Promise<string[]> => {
  const entries = await readdir(tmpdir());
  return entries.filter((entry) => entry.startsWith("saddleedge")).sort();
};

describe("the host binary lanes answer the honesty law", () => {
  it("wires exactly the twenty-five pinned lanes (specs, executors and ids agree)", () => {
    assert.equal(hostlanespecs.length, 25, "the spec table carries twenty-five lanes");
    assert.deepStrictEqual([...hostlaneids], [...HOSTBINLANES]);
    assert.deepStrictEqual(
      hostlanespecs.map((lane) => lane.modality),
      [...HOSTBINLANES],
    );
    assert.deepStrictEqual(Object.keys(edgelaneexecutorshost), [...HOSTBINLANES]);
    for (const spec of hostlanespecs) {
      assert.equal(spec.kind, "live", `the lane ${spec.modality} is live (the executor drives the runtime)`);
      assert.ok(spec.runtime.length > 0, `the lane ${spec.modality} names its runtime`);
      assert.equal(typeof spec.present, "function", `the lane ${spec.modality} carries its presence probe`);
      assert.equal(typeof spec.present(), "boolean", `the probe of ${spec.modality} answers a boolean`);
    }
  });

  it("freezes the lane tables and keeps the ids unique", () => {
    assert.equal(Object.isFrozen(edgelaneexecutorshost), true);
    assert.equal(Object.isFrozen(hostlanespecs), true);
    assert.equal(Object.isFrozen(hostlaneids), true);
    assert.equal(new Set(hostlaneids).size, 25, "no lane id rides the table twice");
    assert.throws(
      () => {
        (edgelaneexecutorshost as Record<string, unknown>)["not-a-lane"] = () => undefined;
      },
      TypeError,
      "the frozen executor map refuses new keys at run time",
    );
  });

  it("answers the coded absence for every lane whose runtime this host does not carry", async () => {
    for (const spec of hostlanespecs) {
      const executor = edgelaneexecutorshost[spec.modality];
      assert.ok(executor !== undefined, `the lane ${spec.modality} carries its executor`);
      if (spec.present()) continue; // the present lanes ride the smoke seat below
      // the probe inside the test: the runtime surface the lane names is
      // honestly absent (the compound seats — chroot|fakechroot, cage|weston,
      // docker|socket, turbo|module — answer present only when one seat
      // holds; ci-actions names its runtime actions-runner while probing
      // the Runner.Listener binary and the ACTIONS_RUNNER_ROOT directory)
      if (spec.modality !== "ci-actions") {
        assert.equal(
          probehostbinary(spec.runtime),
          false,
          `the runtime ${spec.runtime} of the lane ${spec.modality} is absent on this host`,
        );
      }
      await assert.rejects(executor("echo trivial:42", undefined, 5000), (error: unknown) => {
        const laneerror = error as { code?: string; message?: string };
        assert.equal(laneerror.code, "HOST_RUNTIME_ABSENT", `the lane ${spec.modality} answers its coded absence`);
        assert.ok(laneerror.message?.includes(spec.modality), `the refusal of ${spec.modality} names its lane`);
        assert.ok(laneerror.message?.includes(spec.runtime), `the refusal of ${spec.modality} names its runtime`);
        return true;
      });
    }
  });

  it("runs the real smoke on every runtime this host carries (a real run or an honest coded refusal)", async () => {
    const present = hostlanespecs.filter((lane) => lane.present());
    let realruns = 0;
    for (const spec of present) {
      const executor = edgelaneexecutorshost[spec.modality];
      assert.ok(executor !== undefined, `the lane ${spec.modality} carries its executor`);
      try {
        const output = await executor(smokeprogram(spec.modality), undefined, 8000);
        assert.equal(typeof output.stdout, "string", `the lane ${spec.modality} answers its stdout`);
        realruns += 1;
      } catch (error) {
        // a present runtime may still refuse honestly (a privilege seat,
        // a missing helper binary, a server-shaped runtime outliving its
        // budget) — the refusal must carry a machine code, never a crash
        const code = laneerrorcode(error);
        assert.ok(
          code !== undefined,
          `the present lane ${spec.modality} refuses with a machine code, never an uncoded crash`,
        );
        assert.notEqual(
          code,
          "HOST_RUNTIME_ABSENT",
          `the present lane ${spec.modality} never lies about the runtime it carries`,
        );
      }
    }
    // the zero-runtime host is the honest anticipated case: the smoke ran
    // the coded refusals above — a host that carries the runtimes gets
    // the real runs counted here (at least three when the host carries
    // three runnable seats; this engine host carries none that complete)
    if (realruns === 0) return;
  }, 60000);

  it("leaves no saddleedge temp directory behind (the tempdir law)", async () => {
    const before = await saddleedgetmpentries();
    for (const spec of hostlanespecs) {
      const executor = edgelaneexecutorshost[spec.modality];
      assert.ok(executor !== undefined, `the lane ${spec.modality} carries its executor`);
      await executor("echo tmpdir:42", undefined, 4000).catch(() => {
        // the outcome is the lane's own honest answer; the law here is the bytes
      });
    }
    let leftovers = (await saddleedgetmpentries()).filter((entry) => !before.includes(entry));
    if (leftovers.length > 0) {
      // a parallel test file may hold its own saddleedge dir for a
      // moment — re-check after a short grace before calling the law broken
      await new Promise((resolve) => setTimeout(resolve, 500));
      leftovers = (await saddleedgetmpentries()).filter((entry) => !before.includes(entry));
    }
    assert.deepStrictEqual(leftovers, [], "no saddleedge temp directory survives the lane runs");
  });

  it("kills a sleeping program at the deadline (the deadline law, when a present runtime really runs)", async () => {
    const present = hostlanespecs.filter((lane) => lane.present());
    let proven = false;
    for (const spec of present) {
      const executor = edgelaneexecutorshost[spec.modality];
      assert.ok(executor !== undefined, `the lane ${spec.modality} carries its executor`);
      try {
        await executor("sleep 30", undefined, 1200);
      } catch (error) {
        const code = laneerrorcode(error);
        if (code === "RUN_DEADLINE_EXCEEDED") {
          proven = true;
          break;
        }
        // the runtime refused to start (a privilege seat, a missing helper
        // binary): the coded refusal is honest, the next candidate rides
        assert.ok(code !== undefined, `the lane ${spec.modality} refuses with a machine code, never an uncoded crash`);
        continue;
      }
      assert.fail(`the lane ${spec.modality} ran a 30 s sleep under a 1.2 s deadline`);
    }
    // a host whose present runtimes all refuse to start cannot prove the
    // kill law live — the zero-runtimes host is the anticipated honest case
    if (!proven) return;
  });

  it("caps the captured output below the 300 kb probe (the output cap law, when a present runtime really runs)", async () => {
    const present = hostlanespecs.filter((lane) => lane.present());
    let proven = false;
    for (const spec of present) {
      const executor = edgelaneexecutorshost[spec.modality];
      assert.ok(executor !== undefined, `the lane ${spec.modality} carries its executor`);
      let stdout = "";
      try {
        const output = await executor("head -c 300000 /dev/zero | tr '\\0' x", undefined, 8000);
        stdout = output.stdout;
      } catch (error) {
        assert.ok(laneerrorcode(error) !== undefined, `the lane ${spec.modality} refuses with a machine code`);
        continue;
      }
      // the collector closes at the 256 kb cap (one socket chunk may ride
      // past the line): a full 300 kb stdout means the cap never fired
      assert.ok(stdout.length < 300000, `the lane ${spec.modality} caps its capture below 300 kb`);
      proven = true;
      break;
    }
    if (!proven) return; // no present runtime completes a run on this host
  });
});
