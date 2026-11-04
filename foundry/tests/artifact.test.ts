// # artifact.test — the checksum engine of the /artifacts page, runnable
// with the house vitest suite:
//   bunx vitest run tests/artifact.test.ts
// The seal is the proof: fnv-1a (32-bit) over the canonical identity string,
// rendered as 8 hex, byte-stable in node and in the browser — pinned here
// against the canonical FNV-1a vectors.
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
  type Artifact,
  artifactIdentity,
  artifactLine,
  fnv1a,
  fnv1aHex,
  manifest,
  sealArtifact,
  seedArtifacts,
  utf8Bytes,
  verifyArtifact,
} from "../artifact.ts";

describe("fnv-1a", () => {
  it("answers the canonical vectors", () => {
    assert.equal(fnv1a(""), 0x811c9dc5);
    assert.equal(fnv1a("a"), 0xe40c292c);
    assert.equal(fnv1a("foobar"), 0xbf9cf968);
  });

  it("renders the 8-hex digest zero-padded", () => {
    assert.equal(fnv1aHex(""), "811c9dc5");
    assert.equal(fnv1aHex("a"), "e40c292c");
    assert.match(fnv1aHex("any identity"), /^[0-9a-f]{8}$/);
  });

  it("encodes utf-8 bytes (the multibyte path stays byte-exact)", () => {
    assert.deepEqual(utf8Bytes("a"), [0x61]);
    assert.deepEqual(utf8Bytes("ã"), [0xc3, 0xa3]);
    assert.deepEqual(utf8Bytes("★"), [0xe2, 0x98, 0x85]);
    assert.deepEqual(utf8Bytes("𝄞"), [0xf0, 0x9d, 0x84, 0x9e]);
    assert.equal(fnv1a("ã"), fnv1a("ã")); // stable across calls
    assert.notEqual(fnv1a("ã"), fnv1a("a"));
  });

  it("differs for differing identities (spot check over 24 inputs)", () => {
    const digests = new Set<string>();
    for (let i = 0; i < 24; i++) digests.add(fnv1aHex(`artifact-${i}`));
    assert.ok(digests.size >= 23, `too many collisions: ${digests.size}`);
  });
});

describe("the seal", () => {
  it("builds the canonical identity string", () => {
    assert.equal(artifactIdentity("base", "tzst", 4096, "rev-1"), "base · .tzst · 4096 · rev-1");
    assert.equal(artifactIdentity("runtime", "targz", 10, ""), "runtime · .tar.gz · 10 · ");
  });

  it("seals the same artifact twice byte-equal (deterministic)", () => {
    const a = sealArtifact("base-01", "tzst", 40_000_000, "rev-2026-02-14");
    const b = sealArtifact("base-01", "tzst", 40_000_000, "rev-2026-02-14");
    assert.deepEqual(a, b);
  });

  it("seals differing payloads into differing checksums", () => {
    const a = sealArtifact("base-01", "tzst", 40_000_000, "rev-1");
    const b = sealArtifact("base-01", "tzst", 40_000_000, "rev-2");
    assert.notEqual(a.checksum, b.checksum);
  });

  it("derives the id from the checksum", () => {
    const artifact = sealArtifact("pack-09", "tarxz", 1_000_000);
    assert.equal(artifact.id, `art-${artifact.checksum}`);
  });

  it("re-verifies a sealed artifact (the seal is the proof)", () => {
    const artifact = sealArtifact("tool-02", "targz", 88_000_000, "rev-x");
    assert.equal(verifyArtifact(artifact), true);
    const tampered: Artifact = { ...artifact, checksum: "deadbeef" };
    assert.equal(verifyArtifact(tampered), false);
  });
});

describe("the packaging line", () => {
  it("replays the same line from the same seed", () => {
    assert.deepEqual(seedArtifacts(804613), seedArtifacts(804613));
  });

  it("seals one artifact per herd format", () => {
    const line = seedArtifacts(804613);
    assert.equal(line.length, 3);
    assert.deepEqual(
      line.map((artifact) => artifact.format),
      ["tzst", "targz", "tarxz"],
    );
  });

  it("renders the manifest line and joins the manifest", () => {
    const line = seedArtifacts(804613);
    const rendered = artifactLine(line[0]);
    assert.match(rendered, /^base-\w+\.tzst · [\d,]+ b · fnv-1a [0-9a-f]{8}$/);
    assert.equal(manifest(line), line.map((artifact) => artifactLine(artifact)).join("\n"));
  });

  it("answers an empty manifest for an empty line", () => {
    assert.equal(manifest([]), "");
  });
});
