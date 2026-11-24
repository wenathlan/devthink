/**
 * envelope.test.ts — the contract of the per-project encryption envelope:
 * the master key resolution ladder, the record roundtrip with its AAD
 * binding, the wrapped data keys per project, the text and blob serial
 * forms, the key and payload write boundaries and both rotation walks.
 * every assertion here protects the at-rest law the whole family rides:
 * no plaintext secret ever answers from a row.
 */

import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { openStorageLane } from "../storage.ts";
import {
  ENVELOPE_BLOB_HEADER_BYTES,
  ENVELOPE_CIPHER,
  ENVELOPE_IV_BYTES,
  ENVELOPE_KEY_BYTES,
  ENVELOPE_TAG_BYTES,
  ENVELOPE_TEXT_PREFIX,
  EnvelopeError,
  encryptRecord,
  decryptRecord,
  envelopeFromBlob,
  envelopeFromText,
  envelopeKeyOrigin,
  envelopeToBlob,
  envelopeToText,
  ensureEnvelopeSchema,
  ensureProjectEnvelope,
  generateDataKey,
  openForProject,
  putKeyMaterial,
  putSealedPayload,
  readKeyMaterial,
  readSealedPayload,
  resolveMasterKey,
  rewrapDataKey,
  rotateEnvelopeMasterKey,
  rotateProjectKey,
  sealForProject,
  unwrapDataKey,
  wrapDataKey,
} from "../envelope.ts";

const tempdirs: string[] = [];

/** one fresh lane per case: the envelope tables laid down, the lane
 * isolated so the DEK cache of one case never answers another. */
function freshlane() {
  const dir = mkdtempSync(path.join(os.tmpdir(), "envelope-"));
  tempdirs.push(dir);
  const lane = openStorageLane({ url: path.join(dir, "envelope.db") });
  ensureEnvelopeSchema(lane);
  return lane;
}

afterEach(() => {
  while (tempdirs.length > 0) {
    const dir = tempdirs.pop();
    if (dir) rmSync(dir, { recursive: true, force: true });
  }
});

describe("the envelope master key resolution", () => {

  it("answers the explicit key seat first and parses the 64-hex form", () => {
    const hex = "a".repeat(64);
    const answer = resolveMasterKey({ masterKey: hex });
    expect(answer.origin).toBe("explicit");
    expect(answer.key.length).toBe(ENVELOPE_KEY_BYTES);
    expect(answer.key.toString("hex")).toBe(hex);
  });

  it("answers the explicit passphrase seat through the scrypt derivation", () => {
    const answer = resolveMasterKey({ masterPassphrase: "the operator phrase" });
    expect(answer.origin).toBe("explicit");
    expect(answer.key.length).toBe(ENVELOPE_KEY_BYTES);
    const again = resolveMasterKey({ masterPassphrase: "the operator phrase" });
    expect(again.key.toString("hex")).toBe(answer.key.toString("hex"));
  });

  it("refuses key material that answers neither the hex nor the base64 form", () => {
    expect(() => resolveMasterKey({ masterKey: "not-a-key" })).toThrow(EnvelopeError);
    expect(() => resolveMasterKey({ masterKey: "zz" })).toThrow(EnvelopeError);
  });

  it("rides the environment key when no explicit seat answers and keeps the honest origin", () => {
    const saved = process.env.VAULT_MASTER_KEY;
    try {
      process.env.VAULT_MASTER_KEY = "b".repeat(64);
      expect(envelopeKeyOrigin()).toBe("environment-key");
      expect(resolveMasterKey().key.length).toBe(ENVELOPE_KEY_BYTES);
    } finally {
      if (saved === undefined) delete process.env.VAULT_MASTER_KEY;
      else process.env.VAULT_MASTER_KEY = saved;
    }
  });

  it("falls back to the development derivation when nothing is configured and never fakes a seat", () => {
    const savedKey = process.env.VAULT_MASTER_KEY;
    const savedPhrase = process.env.VAULT_MASTER_PASSPHRASE;
    try {
      delete process.env.VAULT_MASTER_KEY;
      delete process.env.VAULT_MASTER_PASSPHRASE;
      expect(envelopeKeyOrigin()).toBe("development");
      expect(resolveMasterKey().key.length).toBe(ENVELOPE_KEY_BYTES);
    } finally {
      if (savedKey !== undefined) process.env.VAULT_MASTER_KEY = savedKey;
      if (savedPhrase !== undefined) process.env.VAULT_MASTER_PASSPHRASE = savedPhrase;
    }
  });
});

describe("the record roundtrip", () => {

  it("seals and opens bytes whole, including the empty record", () => {
    const key = generateDataKey();
    const message = new TextEncoder().encode("the vault keeps every byte honest");
    const sealed = encryptRecord(key, message);
    expect(sealed.iv.length).toBe(ENVELOPE_IV_BYTES);
    expect(sealed.tag.length).toBe(ENVELOPE_TAG_BYTES);
    expect(Buffer.from(decryptRecord(key, sealed)).toString()).toBe(
      Buffer.from(message).toString(),
    );
    const empty = encryptRecord(key, new Uint8Array(0));
    expect(decryptRecord(key, empty).length).toBe(0);
  });

  it("carries a fresh iv per record so two seals of one plaintext never share ciphertext", () => {
    const key = generateDataKey();
    const message = new TextEncoder().encode("the same bytes twice");
    const first = encryptRecord(key, message);
    const second = encryptRecord(key, message);
    expect(first.iv.equals(second.iv)).toBe(false);
    expect(first.data.equals(second.data)).toBe(false);
  });

  it("answers the cipher the envelope declares", () => {
    expect(ENVELOPE_CIPHER).toBe("aes-256-gcm");
  });

  it("refuses a wrong key with the loud typed refusal", () => {
    const sealed = encryptRecord(generateDataKey(), new TextEncoder().encode("one key only"));
    expect(() => decryptRecord(generateDataKey(), sealed)).toThrow(EnvelopeError);
  });

  it("refuses a tampered ciphertext — the tag never shrugs at drift", () => {
    const key = generateDataKey();
    const sealed = encryptRecord(key, new TextEncoder().encode("the honest bytes"));
    sealed.data[0] ^= 0xff;
    expect(() => decryptRecord(key, sealed)).toThrow(EnvelopeError);
  });

  it("refuses a tampered tag", () => {
    const key = generateDataKey();
    const sealed = encryptRecord(key, new TextEncoder().encode("the honest bytes"));
    sealed.tag[0] ^= 0xff;
    expect(() => decryptRecord(key, sealed)).toThrow(EnvelopeError);
  });

  it("binds the AAD into the authentication — one purpose never serves another", () => {
    const key = generateDataKey();
    const aadOne = Buffer.from("vault-envelope:v1:rec:project-a");
    const aadTwo = Buffer.from("vault-envelope:v1:key:project-a");
    const sealed = encryptRecord(key, new TextEncoder().encode("bound bytes"), aadOne);
    expect(() => decryptRecord(key, sealed, aadTwo)).toThrow(EnvelopeError);
    expect(Buffer.from(decryptRecord(key, sealed, aadOne)).length).toBeGreaterThan(0);
  });

  it("refuses a key that answers the wrong width", () => {
    expect(() => encryptRecord(Buffer.alloc(16), new Uint8Array(4))).toThrow(EnvelopeError);
    expect(() => encryptRecord(Buffer.alloc(31), new Uint8Array(4))).toThrow(EnvelopeError);
  });
});

describe("the wrapped data keys per project", () => {

  it("wraps one data key under the master and unwraps it for the same project only", () => {
    const kek = resolveMasterKey().key;
    const dek = generateDataKey();
    const wrapped = wrapDataKey(kek, dek, "project-a");
    expect(Buffer.from(unwrapDataKey(kek, wrapped, "project-a")).toString("hex")).toBe(
      dek.toString("hex"),
    );
    expect(() => unwrapDataKey(kek, wrapped, "project-b")).toThrow(EnvelopeError);
  });

  it("rewraps under the fresh master and refuses the standing one after", () => {
    const fromKek = resolveMasterKey().key;
    const toKek = generateDataKey();
    const wrapped = wrapDataKey(fromKek, generateDataKey(), "project-a");
    const moved = rewrapDataKey(fromKek, toKek, wrapped, "project-a");
    expect(Buffer.from(unwrapDataKey(toKek, moved, "project-a")).length).toBe(ENVELOPE_KEY_BYTES);
    expect(() => unwrapDataKey(fromKek, moved, "project-a")).toThrow(EnvelopeError);
  });
});

describe("the text and blob serial forms", () => {

  it("rides the enk1 text form roundtrip and refuses foreign prefixes", () => {
    const sealed = encryptRecord(generateDataKey(), new TextEncoder().encode("serial bytes"));
    const text = envelopeToText(sealed);
    expect(text.startsWith(ENVELOPE_TEXT_PREFIX)).toBe(true);
    const back = envelopeFromText(text);
    expect(back.iv.equals(sealed.iv)).toBe(true);
    expect(back.tag.equals(sealed.tag)).toBe(true);
    expect(back.data.equals(sealed.data)).toBe(true);
    expect(() => envelopeFromText("raw1-not-the-envelope")).toThrow(EnvelopeError);
    expect(() => envelopeFromText("enk1-not-base64!!!")).toThrow(EnvelopeError);
  });

  it("rides the blob form roundtrip with the iv and tag as the header", () => {
    const sealed = encryptRecord(generateDataKey(), new TextEncoder().encode("blob bytes"));
    const blob = envelopeToBlob(sealed);
    expect(blob.length).toBe(ENVELOPE_BLOB_HEADER_BYTES + sealed.data.length);
    const back = envelopeFromBlob(blob);
    expect(back.iv.equals(sealed.iv)).toBe(true);
    expect(back.tag.equals(sealed.tag)).toBe(true);
    expect(back.data.equals(sealed.data)).toBe(true);
    expect(() => envelopeFromBlob(blob.subarray(0, 8))).toThrow(EnvelopeError);
  });
});

describe("the project lane boundary", () => {

  it("keeps one data key per project and answers the same key back on repeat", () => {
    const lane = freshlane();
    const first = projectHex(lane, "project-a");
    const second = projectHex(lane, "project-a");
    expect(first).toBe(second);
    expect(projectHex(lane, "project-b")).not.toBe(first);
  });

  it("keeps two lanes sharing one project id apart — the keys never cross lanes", () => {
    const laneOne = freshlane();
    const laneTwo = freshlane();
    expect(projectHex(laneOne, "project-a")).not.toBe(projectHex(laneTwo, "project-a"));
  });

  it("roundtrips a sealed record through the project boundary with its context", () => {
    const lane = freshlane();
    const message = new TextEncoder().encode("the project row truth");
    const sealed = sealForProject(lane, "project-a", message, "row-1");
    expect(Buffer.from(openForProject(lane, "project-a", sealed, "row-1")).toString()).toBe(
      Buffer.from(message).toString(),
    );
    expect(() => openForProject(lane, "project-a", sealed, "row-2")).toThrow(EnvelopeError);
    expect(() => openForProject(lane, "project-b", sealed, "row-1")).toThrow(EnvelopeError);
  });

  it("lays the envelope table idempotently — the schema seat runs twice without refusal", () => {
    const lane = freshlane();
    expect(() => ensureEnvelopeSchema(lane)).not.toThrow();
    const rows = lane.queryAll<{ projectId: string }>("SELECT projectId FROM project_envelopes");
    expect(rows.length).toBe(0);
  });
});

describe("the key material boundary", () => {

  it("stores the secret sealed and answers the plaintext only to the owning project", () => {
    const lane = freshlane();
    const secret = "vk-the-one-time-secret";
    const row = putKeyMaterial(lane, "key-1", "project-a", secret);
    expect(row.id).toBe("key-1");
    expect(row.scope).toBe("project-a");
    const stored = lane.queryOne<{ payload: string }>("SELECT payload FROM keys WHERE id = 'key-1'");
    expect(stored?.payload.startsWith(ENVELOPE_TEXT_PREFIX)).toBe(true);
    expect(stored?.payload.includes(secret)).toBe(false);
    expect(Buffer.from(readKeyMaterial(lane, "key-1", "project-a") ?? Buffer.alloc(0)).toString()).toBe(secret);
    expect(readKeyMaterial(lane, "key-1", "project-b")).toBeUndefined();
  });

  it("answers undefined for the absent row and refuses the drifted payload loudly", () => {
    const lane = freshlane();
    expect(readKeyMaterial(lane, "no-such-key", "project-a")).toBeUndefined();
    putKeyMaterial(lane, "key-1", "project-a", "the material");
    const row = lane.queryOne<{ payload: string }>("SELECT payload FROM keys WHERE id = 'key-1'");
    lane.execute("UPDATE keys SET payload = ? WHERE id = 'key-1'", ["enk1-drifted-payload"]);
    expect(() => readKeyMaterial(lane, "key-1", "project-a")).toThrow(EnvelopeError);
    expect(row).toBeDefined();
  });

  it("updates idempotently — the second put answers the fresh material", () => {
    const lane = freshlane();
    putKeyMaterial(lane, "key-1", "project-a", "the first material");
    putKeyMaterial(lane, "key-1", "project-a", "the second material");
    expect(Buffer.from(readKeyMaterial(lane, "key-1", "project-a") ?? Buffer.alloc(0)).toString()).toBe(
      "the second material",
    );
  });

  it("refuses an unnamed key row", () => {
    const lane = freshlane();
    expect(() => putKeyMaterial(lane, "", "project-a", "material")).toThrow(EnvelopeError);
  });
});

describe("the sealed payload boundary", () => {

  it("stores bytes sealed and reads them back honest", () => {
    const lane = freshlane();
    const bytes = new Uint8Array(1024);
    for (let index = 0; index < bytes.length; index += 1) bytes[index] = index % 251;
    const row = putSealedPayload(lane, "payload-1", "project-a", bytes, "key-1");
    expect(row.size).toBe(bytes.length);
    expect(row.keyId).toBe("key-1");
    const stored = lane.queryOne<{ bytes: Uint8Array; size: number }>(
      "SELECT bytes, size FROM payloads WHERE id = 'payload-1'",
    );
    expect(Buffer.from(stored?.bytes ?? Buffer.alloc(0)).includes(Buffer.from(bytes))).toBe(false);
    const plain = readSealedPayload(lane, "payload-1", "project-a");
    expect(plain).toBeDefined();
    expect(plain?.length).toBe(bytes.length);
    expect(Buffer.from(plain ?? Buffer.alloc(0)).equals(Buffer.from(bytes))).toBe(true);
  });

  it("refuses the foreign project and the drifted size", () => {
    const lane = freshlane();
    putSealedPayload(lane, "payload-1", "project-a", new TextEncoder().encode("the truth"));
    expect(() => readSealedPayload(lane, "payload-1", "project-b")).toThrow(EnvelopeError);
    lane.execute("UPDATE payloads SET size = 999 WHERE id = 'payload-1'");
    expect(() => readSealedPayload(lane, "payload-1", "project-a")).toThrow(EnvelopeError);
  });

  it("refuses an unnamed payload row", () => {
    const lane = freshlane();
    expect(() => putSealedPayload(lane, "", "project-a", new Uint8Array(1))).toThrow(EnvelopeError);
  });
});

describe("the rotation walks", () => {

  it("rotates the master key and every standing data key stays readable", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "envelope-"));
    tempdirs.push(dir);
    const url = path.join(dir, "rotation.db");
    const savedKey = process.env.VAULT_MASTER_KEY;
    try {
      const fromSource = { masterKey: "c".repeat(64) };
      const toSource = { masterKey: "d".repeat(64) };
      process.env.VAULT_MASTER_KEY = "c".repeat(64);
      const lane = openStorageLane({ url });
      ensureEnvelopeSchema(lane);
      ensureProjectEnvelope(lane, "project-a");
      ensureProjectEnvelope(lane, "project-b");
      const message = new TextEncoder().encode("sealed before the rotation");
      const sealed = sealForProject(lane, "project-a", message);
      const moved = rotateEnvelopeMasterKey(lane, fromSource, toSource);
      expect(moved).toBe(2);
      /* the warm cache answers the standing DEK (the wraps moved, the keys stand). */
      expect(Buffer.from(openForProject(lane, "project-a", sealed)).toString()).toBe(
        Buffer.from(message).toString(),
      );
      /* the honest operator walk: the environment rides the fresh master,
       * and a cold lane (no cache) reads the rewrapped rows whole. */
      process.env.VAULT_MASTER_KEY = "d".repeat(64);
      const cold = openStorageLane({ url });
      ensureEnvelopeSchema(cold);
      expect(Buffer.from(openForProject(cold, "project-a", sealed)).toString()).toBe(
        Buffer.from(message).toString(),
      );
    } finally {
      if (savedKey === undefined) delete process.env.VAULT_MASTER_KEY;
      else process.env.VAULT_MASTER_KEY = savedKey;
    }
  });

  it("rotates one project data key and its linked rows re-seal under the fresh key", () => {
    const lane = freshlane();
    process.env.VAULT_MASTER_KEY = "c".repeat(64);
    try {
      const secret = "the linked secret";
      putKeyMaterial(lane, "key-1", "project-a", secret);
      putSealedPayload(lane, "payload-1", "project-a", new TextEncoder().encode("the linked payload"), "key-1");
      const before = projectHex(lane, "project-a");
      rotateProjectKey(lane, "project-a");
      const after = projectHex(lane, "project-a");
      expect(after).not.toBe(before);
      expect(Buffer.from(readKeyMaterial(lane, "key-1", "project-a") ?? Buffer.alloc(0)).toString()).toBe(secret);
      const payload = readSealedPayload(lane, "payload-1", "project-a");
      expect(Buffer.from(payload ?? Buffer.alloc(0)).toString()).toBe("the linked payload");
    } finally {
      delete process.env.VAULT_MASTER_KEY;
    }
  });
});

/** reads the project data key as hex (the identity comparison across seats). */
function projectHex(lane: ReturnType<typeof openStorageLane>, projectId: string): string {
  return ensureProjectEnvelope(lane, projectId).data.toString("hex");
}
