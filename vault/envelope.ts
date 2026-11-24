/**
 * envelope.ts — the aes-256-gcm at-rest envelope of the vault: the
 * enveloped per-project keys seat (checklist mandates 0621 and 1218 —
 * aes-256-gcm at rest with enveloped per-project keys, the keys encrypted
 * at rest) the storage law of the family rides beside the shared lane.
 * the design is the classical envelope: one master key (the KEK) from an
 * environment seat, one random 32-byte data key (the DEK) per project,
 * every DEK wrapped — encrypted — under the KEK and persisted in the
 * project_envelopes table, so the per-project keys at rest are themselves
 * keys encrypted at rest; every secret record then seals under its
 * project DEK with the project id bound into the AAD (a sealed record
 * never serves another project, a wrapped DEK never unwraps for another
 * row class, a key row never answers under another id).
 *
 * the pipeline is the node builtin alone — zero new dependencies, the
 * house law: createCipheriv("aes-256-gcm", ...) with a fresh random
 * 12-byte iv per record, the 16-byte authentication tag carried beside
 * the ciphertext, and scrypt when the environment hands a passphrase
 * instead of raw key bytes (the account-lane cost precedent). the module
 * is a library, never a factory boot: the pure seats (buffers in, buffers
 * out) never touch storage, the lane seats ride the structural helpers
 * every storage lane of the family already answers (the statestore
 * precedent — an injected interface, never a concrete storage import), and
 * every statement is prepared and bound — no sql is ever assembled by
 * string concatenation.
 *
 * THE DEVELOPMENT ORIGIN — the honest marker, never a silent fake: when
 * neither VAULT_MASTER_KEY nor VAULT_MASTER_PASSPHRASE answers, the master
 * key derives from a fixed development label through the same scrypt lane.
 * the derivation is stable (a development store reopens across processes)
 * but it is NOT a secret — anyone holding the sources holds the label.
 * envelopeKeyOrigin() answers "development" for that state so every
 * operator seat may probe it honestly; production pins VAULT_MASTER_KEY
 * (64 hex chars or the base64 form of 32 bytes) or VAULT_MASTER_PASSPHRASE
 * and the origin flips to the environment seats.
 *
 * @module envelope
 * @family wave/vault-encryption
 * @layer envelope — the at-rest encryption seat above the sqlite lane:
 *  lane → envelope → record. the digest discipline stays the law of the
 *  digest seats (passwords as scrypt digests, vk_ bearers as sha-256
 *  digests — one-way, never coming back); the envelope carries the
 *  material that must come BACK: the wrapped DEKs, the keys-table rows,
 *  the sealed payload blobs.
 *
 * @section kek — the master key seat (env, passphrase, the honest dev key)
 * @section record — the pure sealed-record pipeline (aes-256-gcm)
 * @section wrap — the per-project data keys, their wraps and serial forms
 * @section table — the envelope table and the lane write boundary
 * @section rotation — the master rotation and the per-project rotation
 */

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";

/** @section kek */

/** the cipher the whole envelope rides — the node builtin spelling of aes-256-gcm. */
export const ENVELOPE_CIPHER = "aes-256-gcm";

/** the random iv width of every sealed record (the gcm standard, 96 bits). */
export const ENVELOPE_IV_BYTES = 12;

/** the authentication tag width of every sealed record (the gcm standard, 128 bits). */
export const ENVELOPE_TAG_BYTES = 16;

/** the key width of every key the envelope answers (the aes-256 lane, 32 bytes). */
export const ENVELOPE_KEY_BYTES = 32;

/** the scrypt parameters the passphrase seat rides — the account-lane cost (the family precedent). */
const SCRYPT_OPTIONS = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 } as const;

/** the fixed scrypt salt of the master key seat (domain separation: a
 * passphrase of the house never derives the same key under another label). */
const MASTER_SALT = "vault-envelope-kek-v1";

/* the development label — the honest fallback seat (see the header): the
 * source is public, the derivation is stable, the origin answers
 * "development" through envelopeKeyOrigin(). pin VAULT_MASTER_KEY or
 * VAULT_MASTER_PASSPHRASE in production and this label never rides. */
const DEVELOPMENT_LABEL = "vault-development-envelope-master-v1";

/**
 * The error the envelope answers when a seat is malformed, a stored form
 * does not parse, or a sealed record fails its authentication — a loud,
 * typed refusal, never a silent fallback (the account-lane precedent).
 */
export class EnvelopeError extends Error {}

/** where the master key answered from — the honest origin every operator
 * seat may probe (the development state never fakes an environment seat). */
export type EnvelopeKeyOrigin = "explicit" | "environment-key" | "environment-passphrase" | "development";

/** the master key source: an explicit seat (the rotation lanes hand
 * theirs) that wins over the environment seats — the raw material form
 * first, the passphrase form next. */
export type MasterKeySource = {
  /** the raw master key — 64 hex chars or the base64 form of 32 bytes. */
  masterKey?: string;
  /** the passphrase the scrypt lane derives the master key from. */
  masterPassphrase?: string;
};

/** the resolved master key with its honest origin. */
export type ResolvedMasterKey = {
  /** the 32-byte key every wrap rides. */
  key: Buffer;
  /** the seat the key answered from. */
  origin: EnvelopeKeyOrigin;
};

/**
 * Parses raw master key material — 64 hex chars, or a base64 form that
 * must decode to the 32 bytes the aes-256 lane demands. any other shape
 * answers the loud typed refusal: a silently truncated key would encrypt
 * under the wrong width and node would refuse it late — the envelope
 * refuses it early.
 *
 * @param material the raw master key material (hex or base64).
 * @returns the 32-byte master key.
 */
function parseMasterKeyMaterial(material: string): Buffer {
  const trimmed = material.trim();
  if (/^[0-9a-f]{64}$/i.test(trimmed)) {
    return Buffer.from(trimmed, "hex");
  }
  const decoded = Buffer.from(trimmed, "base64");
  if (decoded.length === ENVELOPE_KEY_BYTES) {
    return decoded;
  }
  throw new EnvelopeError(
    `the master key material must carry ${ENVELOPE_KEY_BYTES} bytes — 64 hex chars or the base64 form, ` +
      `${trimmed.length} chars answered`,
  );
}

/**
 * Derives the master key from a passphrase — scrypt under the fixed
 * envelope salt, the account-lane cost, the aes-256 width.
 *
 * @param passphrase the passphrase the operator pinned.
 * @returns the 32-byte master key.
 */
function deriveMasterKey(passphrase: string): Buffer {
  return scryptSync(passphrase, MASTER_SALT, ENVELOPE_KEY_BYTES, SCRYPT_OPTIONS);
}

/**
 * Resolves the master key (the KEK) of the envelope: the explicit seat of
 * the source first, then the environment seats (VAULT_MASTER_KEY, then
 * VAULT_MASTER_PASSPHRASE), then the honest development derivation. the
 * resolution answers per call (the session-secret precedent): the operator
 * may rotate the environment without restarting the process.
 *
 * @param source an explicit seat that wins over the environment (default none).
 * @returns the master key with its honest origin.
 */
export function resolveMasterKey(source: MasterKeySource = {}): ResolvedMasterKey {
  if (source.masterKey !== undefined && source.masterKey !== "") {
    return { key: parseMasterKeyMaterial(source.masterKey), origin: "explicit" };
  }
  if (source.masterPassphrase !== undefined && source.masterPassphrase !== "") {
    return { key: deriveMasterKey(source.masterPassphrase), origin: "explicit" };
  }
  const envKey = process.env.VAULT_MASTER_KEY;
  if (envKey !== undefined && envKey !== "") {
    return { key: parseMasterKeyMaterial(envKey), origin: "environment-key" };
  }
  const envPassphrase = process.env.VAULT_MASTER_PASSPHRASE;
  if (envPassphrase !== undefined && envPassphrase !== "") {
    return { key: deriveMasterKey(envPassphrase), origin: "environment-passphrase" };
  }
  return { key: deriveMasterKey(DEVELOPMENT_LABEL), origin: "development" };
}

/**
 * Answers the honest origin of the master key — the probe seat the
 * operator lanes read: "development" never fakes an environment seat.
 *
 * @param source an explicit seat that wins over the environment (default none).
 * @returns the origin the master key answered from.
 */
export function envelopeKeyOrigin(source: MasterKeySource = {}): EnvelopeKeyOrigin {
  return resolveMasterKey(source).origin;
}

/** @section record */

/** one sealed record — the at-rest form of one secret: the random iv of
 * its own encryption, its authentication tag and the ciphertext. */
export type SealedRecord = {
  /** the random 12-byte iv of this record's encryption */
  iv: Buffer;
  /** the 16-byte authentication tag */
  tag: Buffer;
  /** the ciphertext */
  data: Buffer;
};

/**
 * Builds the AAD of one sealed class — the purpose, the project id and
 * the context (the row id or the caller's context) bound into the
 * authentication: a record sealed for one project, one class and one id
 * never serves another, because the gcm tag refuses the swap. the family
 * ids carry no colon, so the three fields never blur (the honest boundary
 * of the simple spelling).
 *
 * @param purpose the row class the record rides (dek, rec, key, payload).
 * @param projectId the project the record answers for.
 * @param context the row id or the caller's context (default none).
 * @returns the AAD bytes.
 */
const aadOf = (purpose: string, projectId: string, context = ""): Buffer =>
  Buffer.from(`vault-envelope:v1:${purpose}:${projectId}${context === "" ? "" : `:${context}`}`, "utf8");

/**
 * Encrypts one record — the pure seat, buffers in, buffers out: a fresh
 * random 12-byte iv per record, the AAD riding the authentication, the
 * 16-byte tag answering beside the ciphertext. the plaintext may be empty
 * (the tag still authenticates the record).
 *
 * @param key the 32-byte key of this encryption (the KEK or a project DEK).
 * @param plaintext the bytes to seal.
 * @param aad the additional authenticated data (default none).
 * @returns the sealed record — its own iv, its tag, its ciphertext.
 */
export function encryptRecord(key: Buffer, plaintext: Uint8Array, aad: Buffer = Buffer.alloc(0)): SealedRecord {
  if (key.length !== ENVELOPE_KEY_BYTES) {
    throw new EnvelopeError(`the envelope key must carry ${ENVELOPE_KEY_BYTES} bytes, ${key.length} answered`);
  }
  const iv = randomBytes(ENVELOPE_IV_BYTES);
  const cipher = createCipheriv(ENVELOPE_CIPHER, key, iv);
  cipher.setAAD(aad);
  const data = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  return { iv, tag: cipher.getAuthTag(), data };
}

/**
 * Decrypts one sealed record — the pure seat's other half: the iv and tag
 * widths gate first, the AAD rides the authentication, and any tag
 * mismatch (moved bytes, a drifted key, a foreign AAD) answers the loud
 * typed refusal — the envelope never shrugs at drift.
 *
 * @param key the 32-byte key of this encryption (the KEK or a project DEK).
 * @param sealed the sealed record to open.
 * @param aad the additional authenticated data (default none).
 * @returns the plaintext bytes.
 */
export function decryptRecord(key: Buffer, sealed: SealedRecord, aad: Buffer = Buffer.alloc(0)): Buffer {
  if (key.length !== ENVELOPE_KEY_BYTES) {
    throw new EnvelopeError(`the envelope key must carry ${ENVELOPE_KEY_BYTES} bytes, ${key.length} answered`);
  }
  if (sealed.iv.length !== ENVELOPE_IV_BYTES) {
    throw new EnvelopeError(
      `the sealed record iv must carry ${ENVELOPE_IV_BYTES} bytes, ${sealed.iv.length} answered`,
    );
  }
  if (sealed.tag.length !== ENVELOPE_TAG_BYTES) {
    throw new EnvelopeError(
      `the sealed record tag must carry ${ENVELOPE_TAG_BYTES} bytes, ${sealed.tag.length} answered`,
    );
  }
  const decipher = createDecipheriv(ENVELOPE_CIPHER, key, sealed.iv);
  decipher.setAAD(aad);
  decipher.setAuthTag(sealed.tag);
  try {
    return Buffer.concat([decipher.update(sealed.data), decipher.final()]);
  } catch {
    throw new EnvelopeError(
      "the sealed record failed its authentication — the bytes moved or the key and aad drifted",
    );
  }
}

/** @section wrap */

/**
 * Generates one fresh per-project data key (the DEK) — 32 bytes of csprng.
 *
 * @returns the fresh data key.
 */
export function generateDataKey(): Buffer {
  return randomBytes(ENVELOPE_KEY_BYTES);
}

/**
 * Wraps one data key under the master key — the per-project key at rest:
 * aes-256-gcm with the project id bound into the AAD, so a wrapped DEK
 * never unwraps for another project (the envelope of the envelope).
 *
 * @param kek the 32-byte master key.
 * @param dek the 32-byte data key to wrap.
 * @param projectId the project the data key answers for.
 * @returns the wrapped data key as a sealed record.
 */
export function wrapDataKey(kek: Buffer, dek: Buffer, projectId: string): SealedRecord {
  if (dek.length !== ENVELOPE_KEY_BYTES) {
    throw new EnvelopeError(`the data key must carry ${ENVELOPE_KEY_BYTES} bytes, ${dek.length} answered`);
  }
  return encryptRecord(kek, dek, aadOf("dek", projectId));
}

/**
 * Unwraps one data key under the master key — the project id must be the
 * id the wrap rode for (the AAD gate refuses the swap).
 *
 * @param kek the 32-byte master key.
 * @param wrapped the wrapped data key.
 * @param projectId the project the data key answers for.
 * @returns the 32-byte data key.
 */
export function unwrapDataKey(kek: Buffer, wrapped: SealedRecord, projectId: string): Buffer {
  const dek = decryptRecord(kek, wrapped, aadOf("dek", projectId));
  if (dek.length !== ENVELOPE_KEY_BYTES) {
    throw new EnvelopeError(`the unwrapped data key must carry ${ENVELOPE_KEY_BYTES} bytes, ${dek.length} answered`);
  }
  return dek;
}

/**
 * Rewraps one data key under a new master key — the rotation pure seat
 * the master rotation rides: unwrap under the standing KEK, wrap under
 * the fresh one, the project id riding the AAD of both halves.
 *
 * @param fromKek the standing master key.
 * @param toKek the fresh master key.
 * @param wrapped the wrapped data key.
 * @param projectId the project the data key answers for.
 * @returns the same data key wrapped under the fresh master.
 */
export function rewrapDataKey(fromKek: Buffer, toKek: Buffer, wrapped: SealedRecord, projectId: string): SealedRecord {
  const dek = unwrapDataKey(fromKek, wrapped, projectId);
  return wrapDataKey(toKek, dek, projectId);
}

/** the text form prefix of a sealed record — the self-describing shape the
 * keys-table payload column (a TEXT seat) carries. */
export const ENVELOPE_TEXT_PREFIX = "enk1";

/** the blob header width of a sealed record — iv then tag, the fixed roof
 * before the ciphertext (the payloads-table bytes column, a BLOB seat). */
export const ENVELOPE_BLOB_HEADER_BYTES = ENVELOPE_IV_BYTES + ENVELOPE_TAG_BYTES;

/** answers the lowercase hex of the bytes (the text form's cells). */
const hexOf = (bytes: Uint8Array): string => Buffer.from(bytes).toString("hex");

/**
 * Serializes one sealed record into the self-describing text form —
 * `enk1:<iv hex>:<tag hex>:<data hex>` — the shape a TEXT column keeps.
 *
 * @param sealed the sealed record.
 * @returns the text form.
 */
export function envelopeToText(sealed: SealedRecord): string {
  return `${ENVELOPE_TEXT_PREFIX}:${hexOf(sealed.iv)}:${hexOf(sealed.tag)}:${hexOf(sealed.data)}`;
}

/**
 * Parses the text form of one sealed record — the prefix, the hex cells
 * and the iv and tag widths all gate before the record answers.
 *
 * @param text the stored text form.
 * @returns the sealed record.
 */
export function envelopeFromText(text: string): SealedRecord {
  const parts = text.split(":");
  if (parts.length !== 4 || parts[0] !== ENVELOPE_TEXT_PREFIX) {
    throw new EnvelopeError(`the stored envelope text does not carry the ${ENVELOPE_TEXT_PREFIX} shape`);
  }
  const [ivHex, tagHex, dataHex] = [parts[1] ?? "", parts[2] ?? "", parts[3] ?? ""];
  if (ivHex.length !== ENVELOPE_IV_BYTES * 2 || !/^[0-9a-f]+$/i.test(ivHex)) {
    throw new EnvelopeError("the stored envelope iv does not carry the hex width of the lane");
  }
  if (tagHex.length !== ENVELOPE_TAG_BYTES * 2 || !/^[0-9a-f]+$/i.test(tagHex)) {
    throw new EnvelopeError("the stored envelope tag does not carry the hex width of the lane");
  }
  if (dataHex.length % 2 !== 0 || !/^[0-9a-f]*$/i.test(dataHex)) {
    throw new EnvelopeError("the stored envelope data does not carry honest hex");
  }
  return {
    iv: Buffer.from(ivHex, "hex"),
    tag: Buffer.from(tagHex, "hex"),
    data: Buffer.from(dataHex, "hex"),
  };
}

/**
 * Serializes one sealed record into the enveloped blob form — iv ‖ tag ‖
 * data under the fixed header roof — the shape a BLOB column keeps.
 *
 * @param sealed the sealed record.
 * @returns the enveloped blob.
 */
export function envelopeToBlob(sealed: SealedRecord): Buffer {
  return Buffer.concat([sealed.iv, sealed.tag, sealed.data]);
}

/**
 * Parses the enveloped blob form of one sealed record — the header roof
 * gates before the record answers.
 *
 * @param blob the stored enveloped blob.
 * @returns the sealed record.
 */
export function envelopeFromBlob(blob: Uint8Array): SealedRecord {
  if (blob.length < ENVELOPE_BLOB_HEADER_BYTES) {
    throw new EnvelopeError(
      `the stored envelope blob must carry the ${ENVELOPE_BLOB_HEADER_BYTES}-byte header, ${blob.length} answered`,
    );
  }
  return {
    iv: Buffer.from(blob.subarray(0, ENVELOPE_IV_BYTES)),
    tag: Buffer.from(blob.subarray(ENVELOPE_IV_BYTES, ENVELOPE_BLOB_HEADER_BYTES)),
    data: Buffer.from(blob.subarray(ENVELOPE_BLOB_HEADER_BYTES)),
  };
}

/** @section table */

/** the parameters the lane seat binds — the narrow sqlite classes plus the
 * blob class (the iv, tag and data cells ride BLOB; owned here so the
 * module carries no concrete storage import edge, the statestore
 * precedent). */
export type EnvelopeParam = string | number | bigint | boolean | null | Uint8Array;

/** the structural lane seat the envelope rides: the parameterized helpers
 * every storage lane of the family answers (the vault StorageLane
 * satisfies it whole; the statestore precedent — an injected interface,
 * never a concrete storage import). */
export type EnvelopeLane = {
  /** runs one parameterized statement (the DDL and the writes). */
  execute(statement: string, params?: readonly EnvelopeParam[]): unknown;
  /** runs one parameterized query and answers the first row. */
  queryOne<T>(query: string, placeholders?: readonly EnvelopeParam[]): T | undefined;
  /** runs one parameterized query and answers every row (the rotation walks). */
  queryAll<T>(query: string, placeholders?: readonly EnvelopeParam[]): T[];
};

/** the wrapped-DEK table the envelope persists — the per-project keys at
 * rest, encrypted: one row per project, the wrapped data key in its
 * {iv, tag, data} columns (the gcm triple, never a naked key). */
export const ENVELOPE_TABLE = "project_envelopes";

/**
 * Lays the envelope table down when it does not exist — idempotent, the
 * same CREATE IF NOT EXISTS law the site-store boot DDL rides. the db
 * seat calls this beside its own schema so the envelope table exists from
 * the first open, always.
 *
 * @param lane the lane the envelope table rides.
 */
export function ensureEnvelopeSchema(lane: EnvelopeLane): void {
  lane.execute(`CREATE TABLE IF NOT EXISTS project_envelopes (
  projectId TEXT PRIMARY KEY,
  iv        BLOB NOT NULL,
  tag       BLOB NOT NULL,
  data      BLOB NOT NULL,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
)`);
  /* the keys and payloads seats the envelope writes ride — laid down here
   * beside the wrapped-DEK table so the envelope stays self-contained
   * (the db boot lays the same shapes first; CREATE IF NOT EXISTS keeps
   * the two idempotent beside each other, no conflict ever). */
  lane.execute(`CREATE TABLE IF NOT EXISTS keys (
  id        TEXT PRIMARY KEY,
  scope     TEXT NOT NULL DEFAULT 'store',
  payload   TEXT NOT NULL DEFAULT '',
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
)`);
  lane.execute(`CREATE TABLE IF NOT EXISTS payloads (
  id        TEXT PRIMARY KEY,
  keyId     TEXT,
  bytes     BLOB,
  size      INTEGER NOT NULL DEFAULT 0,
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
)`);
}

/** one row of the envelope table as sqlite answers it (the blob cells). */
type EnvelopeRowSql = {
  projectId: string;
  iv: Uint8Array;
  tag: Uint8Array;
  data: Uint8Array;
};

/** the unwrapped DEKs each process already opened, keyed by the lane that
 * owns the rows (two lanes may share a project id and never share a key)
 * — the unwrap cost never rides every record. the per-project rotation
 * refreshes its entry; the master rotation never needs to (the DEKs
 * stand, only their wraps move). */
const dataKeyCache = new WeakMap<EnvelopeLane, Map<string, Buffer>>();

/** answers the per-lane DEK cache, created on the first ride. */
function laneCacheOf(lane: EnvelopeLane): Map<string, Buffer> {
  const standing = dataKeyCache.get(lane);
  if (standing !== undefined) return standing;
  const fresh = new Map<string, Buffer>();
  dataKeyCache.set(lane, fresh);
  return fresh;
}

/**
 * Reads the wrapped data key of one project — undefined before the first
 * ride (the honest absent answer, never a synthesized row).
 *
 * @param lane the lane the envelope table rides.
 * @param projectId the project the data key answers for.
 * @returns the wrapped data key, or undefined when the project never rode.
 */
function readProjectEnvelope(lane: EnvelopeLane, projectId: string): SealedRecord | undefined {
  const row = lane.queryOne<Pick<EnvelopeRowSql, "iv" | "tag" | "data">>(
    "SELECT iv, tag, data FROM project_envelopes WHERE projectId = ?",
    [projectId],
  );
  if (row === undefined) return undefined;
  return { iv: Buffer.from(row.iv), tag: Buffer.from(row.tag), data: Buffer.from(row.data) };
}

/**
 * Answers the wrapped data key of one project — creating it on the first
 * ride: a fresh 32-byte DEK generated through the csprng, wrapped under
 * the master key with the project id in the AAD, and persisted in the
 * envelope table (the per-project keys at rest are keys encrypted at
 * rest — a naked DEK never lands anywhere). idempotent: a standing row
 * answers untouched, and a concurrent writer that landed first wins the
 * row (the insert rides ON CONFLICT DO NOTHING, the re-read answers the
 * standing bytes — both processes then ride one DEK).
 *
 * @param lane the lane the envelope table rides.
 * @param projectId the project the data key answers for.
 * @returns the wrapped data key of the project.
 */
export function ensureProjectEnvelope(lane: EnvelopeLane, projectId: string): SealedRecord {
  if (projectId === "") {
    throw new EnvelopeError("the envelope demands a named project id");
  }
  const standing = readProjectEnvelope(lane, projectId);
  if (standing !== undefined) return standing;
  const wrapped = wrapDataKey(resolveMasterKey().key, generateDataKey(), projectId);
  lane.execute(
    "INSERT INTO project_envelopes (projectId, iv, tag, data) VALUES (?, ?, ?, ?) ON CONFLICT(projectId) DO NOTHING",
    [projectId, Buffer.from(wrapped.iv), Buffer.from(wrapped.tag), Buffer.from(wrapped.data)],
  );
  const landed = readProjectEnvelope(lane, projectId);
  if (landed === undefined) {
    throw new EnvelopeError(`the project envelope row "${projectId}" write did not land`);
  }
  return landed;
}

/**
 * Answers the unwrapped data key of one project — the DEK the record seats
 * ride: the envelope row ensured, unwrapped under the master key (a
 * drifted master answers the loud refusal, never a silent re-wrap) and
 * cached for the lane.
 *
 * @param lane the lane the envelope table rides.
 * @param projectId the project the data key answers for.
 * @returns the 32-byte data key of the project.
 */
export function projectDataKey(lane: EnvelopeLane, projectId: string): Buffer {
  const cache = laneCacheOf(lane);
  const cached = cache.get(projectId);
  if (cached !== undefined) return cached;
  const dek = unwrapDataKey(resolveMasterKey().key, ensureProjectEnvelope(lane, projectId), projectId);
  cache.set(projectId, dek);
  return dek;
}

/** materializes the secret bytes — a string rides its utf8 form, a buffer
 * rides a copy the caller can never mutate afterwards. */
const toBytes = (secret: string | Uint8Array): Buffer =>
  typeof secret === "string" ? Buffer.from(secret, "utf8") : Buffer.from(secret);

/** seals one record under the project data key with the full AAD — the one
 * internal seat every table writer of the boundary rides. */
function sealUnderProjectKey(lane: EnvelopeLane, projectId: string, aad: Buffer, plaintext: Uint8Array): SealedRecord {
  return encryptRecord(projectDataKey(lane, projectId), plaintext, aad);
}

/**
 * Seals one record under the project data key — the general write
 * boundary: the plaintext bytes in, the sealed record out, the project id
 * and the caller's context bound into the AAD.
 *
 * @param lane the lane the envelope table rides.
 * @param projectId the project the record answers for.
 * @param plaintext the bytes to seal.
 * @param context the caller's context for the AAD (default none).
 * @returns the sealed record.
 */
export function sealForProject(
  lane: EnvelopeLane,
  projectId: string,
  plaintext: Uint8Array,
  context = "",
): SealedRecord {
  return sealUnderProjectKey(lane, projectId, aadOf("rec", projectId, context), plaintext);
}

/**
 * Opens one sealed record under the project data key — the general
 * boundary's other half: the same project and context must answer (the
 * AAD gate), or the loud typed refusal lands.
 *
 * @param lane the lane the envelope table rides.
 * @param projectId the project the record answers for.
 * @param sealed the sealed record.
 * @param context the caller's context for the AAD (default none).
 * @returns the plaintext bytes.
 */
export function openForProject(
  lane: EnvelopeLane,
  projectId: string,
  sealed: SealedRecord,
  context = "",
): Buffer {
  return decryptRecord(projectDataKey(lane, projectId), sealed, aadOf("rec", projectId, context));
}

/** one keys row as the write path answers it — the payload never rides
 * (the sealed text stays the at-rest form). */
export type KeyMaterialRow = {
  /** the row identity */
  id: string;
  /** the scope the row answers (the project binding by default) */
  scope: string;
  /** the creation datetime of the row */
  createdAt: string;
};

/**
 * Writes one key row through the envelope — the keys-table seat of the
 * site store (the declared secret seat the wave wires): the secret sealed
 * under the project data key with the project id and the row id bound
 * into the AAD, the payload column carrying the self-describing text —
 * at rest the row answers ciphertext, never the key material. the scope
 * column carries the project binding by default (the honest scope of a
 * key: its project). idempotent upsert, prepared and parameterized.
 *
 * @param lane the lane the keys table rides.
 * @param id the key row identity.
 * @param projectId the project the key answers for.
 * @param secret the key material to keep (string or bytes).
 * @param scope the scope cell (default the project id).
 * @returns the stored row projection.
 */
export function putKeyMaterial(
  lane: EnvelopeLane,
  id: string,
  projectId: string,
  secret: string | Uint8Array,
  scope = projectId,
): KeyMaterialRow {
  if (id === "") {
    throw new EnvelopeError("the key row demands a named id");
  }
  const sealed = sealUnderProjectKey(lane, projectId, aadOf("key", projectId, id), toBytes(secret));
  lane.execute(
    `INSERT INTO keys (id, scope, payload) VALUES (?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       scope = excluded.scope,
       payload = excluded.payload`,
    [id, scope, envelopeToText(sealed)],
  );
  const row = lane.queryOne<KeyMaterialRow>("SELECT id, scope, createdAt FROM keys WHERE id = ?", [id]);
  if (row === undefined) {
    throw new EnvelopeError(`the key row "${id}" write did not land`);
  }
  return row;
}

/**
 * Reads one key row back through the envelope — the plaintext key
 * material answers only to the caller that names the project and the
 * matching scope: a foreign row answers undefined, an absent row answers
 * undefined, and a tampered payload answers the loud typed refusal (the
 * family never shrugs at drift).
 *
 * @param lane the lane the keys table rides.
 * @param id the key row identity.
 * @param projectId the project the key answers for.
 * @param scope the scope cell to match (default the project id).
 * @returns the key material, or undefined when the row never answered for the project.
 */
export function readKeyMaterial(
  lane: EnvelopeLane,
  id: string,
  projectId: string,
  scope = projectId,
): Buffer | undefined {
  const row = lane.queryOne<{ scope: string; payload: string }>("SELECT scope, payload FROM keys WHERE id = ?", [id]);
  if (row === undefined) return undefined;
  if (row.scope !== scope) return undefined;
  return decryptRecord(projectDataKey(lane, projectId), envelopeFromText(row.payload), aadOf("key", projectId, id));
}

/** one payloads row as the write path answers it — the bytes never ride
 * (the enveloped blob stays the at-rest form). */
export type SealedPayloadRow = {
  /** the row identity */
  id: string;
  /** the key row the payload points at (the rotation's discovery binding) */
  keyId: string | null;
  /** the plaintext byte size (the honest size, never the stored size) */
  size: number;
  /** the creation datetime of the row */
  createdAt: string;
};

/**
 * Writes one payload row through the envelope — the payloads-table seat:
 * the bytes sealed under the project data key with the project id and the
 * row id in the AAD, persisted as the enveloped blob (iv ‖ tag ‖ data) in
 * the bytes column, the size cell answering the plaintext size. the keyId
 * pointer carries the discovery binding the per-project rotation rides —
 * a payload without its key pointer answers no project lane, so it
 * rewraps only through its key row (the honest boundary).
 *
 * @param lane the lane the payloads table rides.
 * @param id the payload row identity.
 * @param projectId the project the payload answers for.
 * @param plaintext the bytes to seal.
 * @param keyId the key row the payload points at (optional).
 * @returns the stored row projection.
 */
export function putSealedPayload(
  lane: EnvelopeLane,
  id: string,
  projectId: string,
  plaintext: Uint8Array,
  keyId?: string,
): SealedPayloadRow {
  if (id === "") {
    throw new EnvelopeError("the payload row demands a named id");
  }
  const sealed = sealUnderProjectKey(lane, projectId, aadOf("payload", projectId, id), plaintext);
  lane.execute(
    `INSERT INTO payloads (id, keyId, bytes, size) VALUES (?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       keyId = excluded.keyId,
       bytes = excluded.bytes,
       size = excluded.size`,
    [id, keyId ?? null, envelopeToBlob(sealed), plaintext.length],
  );
  const row = lane.queryOne<SealedPayloadRow>("SELECT id, keyId, size, createdAt FROM payloads WHERE id = ?", [id]);
  if (row === undefined) {
    throw new EnvelopeError(`the payload row "${id}" write did not land`);
  }
  return row;
}

/**
 * Reads one payload row back through the envelope — the project must be
 * the project the seal rode for (the AAD gate), and the decrypted size
 * must answer the stored size or the loud typed refusal lands.
 *
 * @param lane the lane the payloads table rides.
 * @param id the payload row identity.
 * @param projectId the project the payload answers for.
 * @returns the plaintext bytes, or undefined when the row never answered.
 */
export function readSealedPayload(lane: EnvelopeLane, id: string, projectId: string): Buffer | undefined {
  const row = lane.queryOne<{ bytes: Uint8Array; size: number }>("SELECT bytes, size FROM payloads WHERE id = ?", [id]);
  if (row === undefined) return undefined;
  const plain = decryptRecord(
    projectDataKey(lane, projectId),
    envelopeFromBlob(row.bytes),
    aadOf("payload", projectId, id),
  );
  if (plain.length !== row.size) {
    throw new EnvelopeError(`the payload row "${id}" no longer answers its stored size — the bytes moved`);
  }
  return plain;
}

/** @section rotation */

/**
 * Rotates the master key of the envelope — the KEK rotation: every
 * standing data key rewraps under the fresh master (unwrap under the
 * from-seat, wrap under the to-seat, the project AAD riding both halves),
 * the DEKs themselves stand, so every sealed record stays readable and
 * the rows answer the new master on the next unwrap. the explicit sources
 * let the operator hand the old and the new seats — the environment alone
 * cannot answer two masters at once.
 *
 * @param lane the lane the envelope table rides.
 * @param from the standing master key source.
 * @param to the fresh master key source.
 * @returns how many wrapped data keys the rotation rewrapped.
 */
export function rotateEnvelopeMasterKey(lane: EnvelopeLane, from: MasterKeySource, to: MasterKeySource): number {
  const fromKek = resolveMasterKey(from).key;
  const toKek = resolveMasterKey(to).key;
  const rows = lane.queryAll<Pick<EnvelopeRowSql, "projectId" | "iv" | "tag" | "data">>(
    "SELECT projectId, iv, tag, data FROM project_envelopes",
  );
  /* validate before mutate (the honest rotation ordering): every row
   * unwraps under the standing master FIRST — a drifted row refuses here,
   * the store still standing — and only the rewrapped rows write back. */
  const rewrapped = rows.map((row) => ({
    projectId: row.projectId,
    sealed: rewrapDataKey(
      fromKek,
      toKek,
      { iv: Buffer.from(row.iv), tag: Buffer.from(row.tag), data: Buffer.from(row.data) },
      row.projectId,
    ),
  }));
  for (const row of rewrapped) {
    lane.execute(
      "UPDATE project_envelopes SET iv = ?, tag = ?, data = ?, updatedAt = datetime('now') WHERE projectId = ?",
      [Buffer.from(row.sealed.iv), Buffer.from(row.sealed.tag), Buffer.from(row.sealed.data), row.projectId],
    );
  }
  return rewrapped.length;
}

/**
 * Rotates the data key of one project — the DEK rotation: a fresh DEK
 * answers the envelope row (wrapped under the standing master), the
 * project's key rows re-seal under it inside the same walk (the scope
 * binding discovers them), and the payload rows linked through those key
 * rows re-seal too. the honest boundary: a payload row that carries no
 * keyId pointer answers no project lane, so the rotation covers the
 * linked ones — seal the payloads with their key pointer to keep every
 * row rotatable. the lane cache rides the fresh DEK at the exit.
 *
 * @param lane the lane the envelope table rides.
 * @param projectId the project whose data key rotates.
 * @returns the wrapped fresh data key (the new envelope row).
 */
export function rotateProjectKey(lane: EnvelopeLane, projectId: string): SealedRecord {
  const kek = resolveMasterKey().key;
  const standing = projectDataKey(lane, projectId);
  const fresh = generateDataKey();
  const wrapped = wrapDataKey(kek, fresh, projectId);
  /* validate before mutate (the honest rotation ordering): every standing
   * row unwraps under the old DEK first — a drifted row refuses here with
   * the store still riding the old key — and only the resealed rows write
   * back, the envelope row moving last so a refused walk never leaves a
   * fresh DEK above stale rows. */
  const keyRows = lane.queryAll<{ id: string; payload: string }>("SELECT id, payload FROM keys WHERE scope = ?", [
    projectId,
  ]);
  const resealedKeys = keyRows.map((row) => ({
    id: row.id,
    payload: envelopeToText(
      encryptRecord(
        fresh,
        decryptRecord(standing, envelopeFromText(row.payload), aadOf("key", projectId, row.id)),
        aadOf("key", projectId, row.id),
      ),
    ),
  }));
  const resealedPayloads: { id: string; bytes: Buffer }[] = [];
  for (const row of keyRows) {
    const payloadRows = lane.queryAll<{ id: string; bytes: Uint8Array; size: number }>(
      "SELECT id, bytes, size FROM payloads WHERE keyId = ?",
      [row.id],
    );
    for (const payloadRow of payloadRows) {
      const plain = decryptRecord(
        standing,
        envelopeFromBlob(payloadRow.bytes),
        aadOf("payload", projectId, payloadRow.id),
      );
      if (plain.length !== payloadRow.size) {
        throw new EnvelopeError(
          `the payload row "${payloadRow.id}" no longer answers its stored size — the bytes moved`,
        );
      }
      resealedPayloads.push({
        id: payloadRow.id,
        bytes: envelopeToBlob(encryptRecord(fresh, plain, aadOf("payload", projectId, payloadRow.id))),
      });
    }
  }
  for (const row of resealedKeys) {
    lane.execute("UPDATE keys SET payload = ? WHERE id = ?", [row.payload, row.id]);
  }
  for (const row of resealedPayloads) {
    lane.execute("UPDATE payloads SET bytes = ? WHERE id = ?", [row.bytes, row.id]);
  }
  lane.execute(
    "UPDATE project_envelopes SET iv = ?, tag = ?, data = ?, updatedAt = datetime('now') WHERE projectId = ?",
    [Buffer.from(wrapped.iv), Buffer.from(wrapped.tag), Buffer.from(wrapped.data), projectId],
  );
  laneCacheOf(lane).set(projectId, fresh);
  return wrapped;
}
