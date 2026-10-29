// # quota.test — the user-defined quota of the vault, runnable with the node
// built-in runner (no dependencies, no install):
//   node --test tests/quota.test.ts
// The verdicts are pure (boundary, unlimited, terabyte scale), the parse is
// honest (decimal bytes or the unlimited words), and the rows land on an
// isolated database through the real drizzle executor — the floor answers
// at creation, the owner redefines or removes it, and no ceiling exists
// anywhere.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import "./vault.quotaisolation.ts";
import { QUOTA_FLOOR_BYTES, quotaLimitFrom, quotaVerdict } from "../vault/quota.ts";

describe("the pure verdicts", () => {
  it("answers ok at the boundary and over past it", () => {
    const at = quotaVerdict(900n, 1000n, 100n);
    assert.equal(at.state, "ok");
    assert.equal(at.remaining, 100n);
    const over = quotaVerdict(900n, 1000n, 101n);
    assert.equal(over.state, "over");
    assert.equal(over.remaining, 100n);
  });

  it("never refuses an unlimited project", () => {
    const giant = BigInt("9000000000000000");
    const verdict = quotaVerdict(giant, null, giant);
    assert.equal(verdict.state, "ok");
    assert.equal(verdict.remaining, null);
    assert.equal(verdict.limit, null);
  });

  it("carries the 900MB floor and answers terabyte scale", () => {
    assert.equal(QUOTA_FLOOR_BYTES, 900n * 1024n * 1024n);
    assert.equal(typeof QUOTA_FLOOR_BYTES, "bigint");
    const terabytes = BigInt("10995116277760");
    assert.equal(quotaVerdict(0n, terabytes, terabytes).state, "ok", "a 10TB limit holds 10TB");
    assert.equal(quotaVerdict(0n, terabytes, terabytes + 1n).state, "over");
  });

  it("answers negative remaining honestly when usage already sits past the limit", () => {
    const verdict = quotaVerdict(1100n, 1000n, 0n);
    assert.equal(verdict.state, "ok", "a zero-byte read of the verdict stays ok");
    assert.equal(verdict.remaining, -100n);
    assert.equal(quotaVerdict(1100n, 1000n, 1n).state, "over");
  });
});

describe("the limit parse", () => {
  it("answers unlimited for the unlimited words", () => {
    for (const text of ["", " unlimited ", "UNLIMITED", "none", "null"]) {
      const parsed = quotaLimitFrom(text);
      assert.deepEqual(parsed, { limitBytes: null }, `"${text}" answers unlimited`);
    }
  });

  it("parses decimal bytes at any scale", () => {
    assert.deepEqual(quotaLimitFrom("500"), { limitBytes: 500n });
    assert.deepEqual(quotaLimitFrom(" 943718400 "), { limitBytes: 943718400n });
    assert.deepEqual(quotaLimitFrom("10995116277760"), { limitBytes: BigInt("10995116277760") });
  });

  it("refuses malformed limits honestly", () => {
    for (const text of ["abc", "-1", "1.5", "10GB", "0x10"]) {
      const parsed = quotaLimitFrom(text);
      assert.ok("refusal" in parsed, `"${text}" is refused`);
      if ("refusal" in parsed) {
        assert.match(parsed.refusal, /decimal bytes or "unlimited"/);
      }
    }
  });
});

describe("the quota rows", () => {
  it("lays the floor at creation and lets the owner redefine or remove it", async () => {
    const { closeStorage, storage } = await import("../vault/drizzle.ts");
    const { createProject } = await import("../vault/objectsledger.ts");
    const { ensureQuota, readQuota, setQuota } = await import("../vault/quota.ts");
    try {
      const answer = createProject("quota-project");
      assert.ok(answer.project !== undefined, "the project lands");
      assert.equal(answer.project.quota.limitBytes, QUOTA_FLOOR_BYTES, "the 900MB floor answers at creation");

      setQuota(storage, "quota-project", null);
      assert.equal(readQuota(storage, "quota-project")?.limitBytes, null, "the owner removed the limit");

      const terabytes = BigInt("10995116277760");
      setQuota(storage, "quota-project", terabytes);
      assert.equal(readQuota(storage, "quota-project")?.limitBytes, terabytes, "the owner set 10TB");

      ensureQuota(storage, "quota-project");
      assert.equal(readQuota(storage, "quota-project")?.limitBytes, terabytes, "the ensure never overwrites the word");
    } finally {
      closeStorage();
    }
  });
});
