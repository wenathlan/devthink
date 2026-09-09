import { describe, expect, it } from "vitest";
import {
  bucketboundsvalid,
  bucketconsume,
  bucketof,
  connectallowentryof,
  deferredeventof,
  deferredready,
  emptyconnectallow,
  envelopecheck,
  origincheckof,
  portaccept,
  schemacheck,
} from "../security.js";

const now = 1_800_000_000_000;

describe("inboundguard", () => {
  it("rejects unknown fields under schemastrict with the path and the expected shape", () => {
    const result = schemacheck({
      command: { kind: "security", allowlist: { add: { origin: "https://example.com" } }, payload: "echo" },
      schema: { kind: "string", allowlist: "object" },
    });
    expect(result.valid).toBe(false);
    const error = result.errors[0];
    expect(error?.path).toBe("payload");
    expect(error?.expected).toBe("absent");
    expect(error?.found).toBe("string");
    expect(error?.reason).toMatch(/refuses unknown fields before dispatch/);
  });

  it("rejects shape mismatches with the expected shape", () => {
    const result = schemacheck({
      command: { kind: "execute", stepid: 42 },
      schema: { kind: "string", stepid: "string" },
    });
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatchObject({ path: "stepid", expected: "string", found: "number" });
  });

  it("rejects missing required fields and accepts commands that match the grammar", () => {
    const result = schemacheck({
      command: { kind: "execute" },
      schema: { kind: "string", stepid: "string" },
      required: ["stepid"],
    });
    expect(result.valid).toBe(false);
    expect(result.errors[0]?.reason).toMatch(/incomplete command/);
    expect(
      schemacheck({
        command: { kind: "execute", stepid: "s1" },
        schema: { kind: "string", stepid: "string" },
        required: ["stepid"],
      }).valid,
    ).toBe(true);
    expect(
      schemacheck({ command: { kind: "security", read: { runid: "r1" } }, schema: { kind: "string", read: "object" } })
        .valid,
    ).toBe(true);
  });

  it("requires every command envelope to name a declared kind", () => {
    expect(envelopecheck({ command: { kind: "security" }, knownkinds: ["security", "execute"] }).valid).toBe(true);
    const unknown = envelopecheck({ command: { kind: "nope" }, knownkinds: ["security", "execute"] });
    expect(unknown.valid).toBe(false);
    expect(unknown.errors[0]?.reason).toMatch(/absent from the dispatch registry/);
    const kindless = envelopecheck({ command: {}, knownkinds: ["security"] });
    expect(kindless.valid).toBe(false);
    expect(kindless.errors[0]?.path).toBe("kind");
  });

  it("originchecks internal senders as this extension itself", () => {
    const verdict = origincheckof({ senderid: "devthink", extensionid: "devthink", connectallow: [] });
    expect(verdict.accepted).toBe(true);
    expect(verdict.reason).toMatch(/this extension itself/);
  });

  it("drops external senders absent from the connectallow list that ships empty", () => {
    expect(emptyconnectallow).toEqual([]);
    const dropped = origincheckof({
      senderid: "other-extension",
      senderorigin: "https://sender.example",
      extensionid: "devthink",
      connectallow: emptyconnectallow,
    });
    expect(dropped.accepted).toBe(false);
    expect(dropped.reason).toMatch(/drops the message without handler execution/);
    const allowed = origincheckof({
      senderid: "other-extension",
      senderorigin: "https://sender.example",
      extensionid: "devthink",
      connectallow: [connectallowentryof({ senderid: "other-extension", displayname: "Reviewed bridge", now })],
    });
    expect(allowed.accepted).toBe(true);
    expect(origincheckof({ extensionid: "devthink", connectallow: [] }).accepted).toBe(false);
  });

  it("closes ports from senders outside connectallow at the handshake", () => {
    const accepted = portaccept({
      portname: "devthinksidepanel",
      senderid: "devthink",
      extensionid: "devthink",
      connectallow: [],
    });
    expect(accepted.accepted).toBe(true);
    expect(accepted.reason).toMatch(/accepted its handshake/);
    const refused = portaccept({
      portname: "devthinksidepanel",
      senderid: "other-extension",
      extensionid: "devthink",
      connectallow: [],
    });
    expect(refused.accepted).toBe(false);
    expect(refused.reason).toMatch(/closes at its handshake/);
  });

  it("builds connectallow entries with their senders and refuses empty ids", () => {
    const entry = connectallowentryof({
      senderid: " other-extension ",
      displayname: " Reviewed bridge ",
      origin: " https://sender.example ",
      now,
    });
    expect(entry).toMatchObject({
      senderid: "other-extension",
      displayname: "Reviewed bridge",
      origin: "https://sender.example",
    });
    expect(() => connectallowentryof({ senderid: "", displayname: "name", now })).toThrow(/sender id/);
    expect(() => connectallowentryof({ senderid: "id", displayname: " ", now })).toThrow(/display name/);
  });

  it("validates the ratelimit bounds as positive user values with no hidden ceiling", () => {
    expect(bucketboundsvalid(1, 100).valid).toBe(true);
    expect(bucketboundsvalid(0, 100).valid).toBe(false);
    expect(bucketboundsvalid(-3, 100).valid).toBe(false);
    expect(bucketboundsvalid(5, 0).valid).toBe(false);
    expect(() => bucketof({ origin: "https://example.com", sessionid: "s", limit: 0, window: 100, now })).toThrow(
      /positive user value/,
    );
  });

  it("consumes commands inside the bucket bound and defers past it until the window resets", () => {
    const bucket = bucketof({ origin: "https://example.com", sessionid: "s", limit: 2, window: 1000, now });
    const first = bucketconsume({ bucket, now });
    expect(first.allowed).toBe(true);
    expect(first.bucket.used).toBe(1);
    const second = bucketconsume({ bucket: first.bucket, now: now + 100 });
    expect(second.allowed).toBe(true);
    const third = bucketconsume({ bucket: second.bucket, now: now + 200 });
    expect(third.allowed).toBe(false);
    expect(third.deferred).toBe(true);
    expect(third.resetsat).toBe(now + 1000);
    expect(third.reason).toMatch(/defers until the window resets/);
    const reset = bucketconsume({ bucket: second.bucket, now: now + 1000 });
    expect(reset.allowed).toBe(true);
    expect(reset.bucket.used).toBe(1);
    expect(reset.bucket.resetsat).toBe(now + 2000);
  });

  it("records deferred events that hold until their bucket reset", () => {
    const deferred = deferredeventof({
      stepid: "step",
      kind: "click",
      origin: "https://example.com",
      reason: "The bucket holds its bound.",
      resetsat: now + 500,
      now,
    });
    expect(deferred.resetsat).toBe(now + 500);
    expect(deferredready(deferred, now + 499)).toBe(false);
    expect(deferredready(deferred, now + 500)).toBe(true);
    expect(() => deferredeventof({ stepid: "", kind: "click", origin: "o", reason: "r", resetsat: now, now })).toThrow(
      /step and kind/,
    );
  });
});
