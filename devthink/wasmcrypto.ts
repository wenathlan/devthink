/**
 * # wasmcrypto — the platform-neutral crypto seam of the wasm distribution.
 *
 * The wasm distribution lane bundles the pure engine cores (versawase of
 * cadria, katexis of debonair) with `--platform=neutral` for the javy
 * quickjs runtime the saddle wasm sandbox mounts. That runtime carries no
 * node builtins, so every `node:crypto` import the closure reaches — the
 * vault sha owner seat among them — resolves here through the esbuild
 * `--alias:node:crypto=./wasmcrypto.ts` bridge the lane rides.
 *
 * The seam implements the exact surface the family digest seats use:
 * `createHash` with the `sha256` and `sha1` algorithms, the chainable
 * `update` and the `digest` returning the hex form. Pure TypeScript, zero
 * dependencies, deterministic bytes: the same input answers the same
 * digest the node:crypto owner produces, so the wasm stamps match the
 * node-run stamps byte for byte.
 *
 * @section hash — the sha-256 and sha-1 pure implementations
 * @section surface — the createHash adapter the aliases answer
 */

/** The 64 round constants of sha-256 (the fractional parts of the cube roots of the first 64 primes). */
const SHA256K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

/** The initial hash values of sha-256 (the fractional parts of the square roots of the first 8 primes). */
const SHA256H = new Uint32Array([
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
]);

/** The 80 round constants of sha-1 (the 4 patterns of 20 rounds each). */
const SHA1K = new Uint32Array([0x5a827999, 0x6ed9eba1, 0x8f1bbcdc, 0xca62c1d6]);

/** The initial hash values of sha-1. */
const SHA1H = new Uint32Array([0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0]);

/** Reads the byte at the big-endian offset of a 4-byte word. */
const wordat = (bytes: Uint8Array, offset: number): number =>
  ((bytes[offset] << 24) | (bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3]) >>> 0;

/** Renders one 32-bit word as the 8 hex characters big-endian answers. */
const hexpad = (word: number): string => word.toString(16).padStart(8, "0");

/**
 * The pure sha-256 digest of the bytes, hex-encoded.
 *
 * @param bytes the exact bytes to digest.
 * @returns the 64-hex digest.
 */
function sha256hex(bytes: Uint8Array): string {
  const bitlength = bytes.length * 8;
  const padded = new Uint8Array((((bytes.length + 8) >> 6) + 1) << 6);
  padded.set(bytes);
  padded[bytes.length] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(padded.length - 8, Math.floor(bitlength / 0x100000000));
  view.setUint32(padded.length - 4, bitlength >>> 0);
  const h = SHA256H.slice();
  const w = new Uint32Array(64);
  for (let block = 0; block < padded.length; block += 64) {
    for (let t = 0; t < 16; t++) w[t] = wordat(padded, block + t * 4);
    for (let t = 16; t < 64; t++) {
      const s0 = ((w[t - 15] >>> 7) | (w[t - 15] << 25)) ^ ((w[t - 15] >>> 18) | (w[t - 15] << 14)) ^ (w[t - 15] >>> 3);
      const s1 = ((w[t - 2] >>> 17) | (w[t - 2] << 15)) ^ ((w[t - 2] >>> 19) | (w[t - 2] << 13)) ^ (w[t - 2] >>> 10);
      w[t] = (w[t - 16] + s0 + w[t - 7] + s1) >>> 0;
    }
    let [a, b, c, d, e, f, g, hh] = h;
    for (let t = 0; t < 64; t++) {
      const s1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
      const ch = (e & f) ^ (~e & g);
      const t1 = (hh + s1 + ch + SHA256K[t] + w[t]) >>> 0;
      const s0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (s0 + maj) >>> 0;
      hh = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0;
    }
    h[0] = (h[0] + a) >>> 0; h[1] = (h[1] + b) >>> 0; h[2] = (h[2] + c) >>> 0; h[3] = (h[3] + d) >>> 0;
    h[4] = (h[4] + e) >>> 0; h[5] = (h[5] + f) >>> 0; h[6] = (h[6] + g) >>> 0; h[7] = (h[7] + hh) >>> 0;
  }
  return Array.from(h, hexpad).join("");
}

/**
 * The pure sha-1 digest of the bytes, hex-encoded.
 *
 * @param bytes the exact bytes to digest.
 * @returns the 40-hex digest.
 */
function sha1hex(bytes: Uint8Array): string {
  const bitlength = bytes.length * 8;
  const padded = new Uint8Array((((bytes.length + 8) >> 6) + 1) << 6);
  padded.set(bytes);
  padded[bytes.length] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(padded.length - 8, Math.floor(bitlength / 0x100000000));
  view.setUint32(padded.length - 4, bitlength >>> 0);
  const h = SHA1H.slice();
  const w = new Uint32Array(80);
  for (let block = 0; block < padded.length; block += 64) {
    for (let t = 0; t < 16; t++) w[t] = wordat(padded, block + t * 4);
    for (let t = 16; t < 80; t++) {
      const x = w[t - 3] ^ w[t - 8] ^ w[t - 14] ^ w[t - 16];
      w[t] = ((x << 1) | (x >>> 31)) >>> 0;
    }
    let [a, b, c, d, e] = h;
    for (let t = 0; t < 80; t++) {
      const f = t < 20 ? (b & c) ^ (~b & d) : t < 40 ? b ^ c ^ d : t < 60 ? (b & c) ^ (b & d) ^ (c & d) : b ^ c ^ d;
      const k = SHA1K[(t / 20) | 0];
      const temp = (((a << 5) | (a >>> 27)) + f + e + k + w[t]) >>> 0;
      e = d; d = c; c = ((b << 30) | (b >>> 2)) >>> 0; b = a; a = temp;
    }
    h[0] = (h[0] + a) >>> 0; h[1] = (h[1] + b) >>> 0; h[2] = (h[2] + c) >>> 0; h[3] = (h[3] + d) >>> 0; h[4] = (h[4] + e) >>> 0;
  }
  return Array.from(h, hexpad).join("");
}

/** The utf-8 encoding of a string input (the shape the owner seat rides). */
const utf8of = (data: Uint8Array | string): Uint8Array =>
  typeof data === "string" ? new TextEncoder().encode(data) : data;

/** The base64 alphabet the encoder walks. */
const BASE64ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/**
 * The pure base64 encoding of the bytes (no Buffer, no btoa — the javy
 * runtime carries neither).
 *
 * @param bytes the exact bytes to encode.
 * @returns the base64 text.
 */
function base64of(bytes: Uint8Array): string {
  let text = "";
  for (let offset = 0; offset < bytes.length; offset += 3) {
    const b0 = bytes[offset];
    const b1 = bytes[offset + 1];
    const b2 = bytes[offset + 2];
    text += BASE64ALPHABET[b0 >> 2];
    text += BASE64ALPHABET[((b0 & 0x03) << 4) | ((b1 ?? 0) >> 4)];
    text += b1 === undefined ? "=" : BASE64ALPHABET[((b1 & 0x0f) << 2) | ((b2 ?? 0) >> 6)];
    text += b2 === undefined ? "=" : BASE64ALPHABET[b2 & 0x3f];
  }
  return text;
}

/**
 * The raw byte form of a hex digest (the no-encoding digest shape node
 * answers as bytes).
 *
 * @param hex the hex text to decode.
 * @returns the decoded bytes.
 */
function hexbytesof(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length >> 1);
  for (let offset = 0; offset < bytes.length; offset++) {
    bytes[offset] = parseInt(hex.slice(offset * 2, offset * 2 + 2), 16);
  }
  return bytes;
}

/**
 * The single-pass hasher the createHash surface answers: the chainable
 * update carrying the digest the hex form renders. The wasm cores digest
 * one buffer per seat, so the single-shot shape covers the whole closure.
 */
class wasmlasher {
  private readonly algorithm: "sha256" | "sha1";
  private readonly chunks: Uint8Array[] = [];

  /**
   * Seats the hasher under the algorithm the call names.
   *
   * @param algorithm the digest algorithm ("sha256" or "sha1").
   */
  constructor(algorithm: "sha256" | "sha1") {
    this.algorithm = algorithm;
  }

  /**
   * Absorbs one more chunk of the message.
   *
   * @param data the bytes (or the utf-8 reading of a string) to absorb.
   * @returns this hasher, the chainable shape.
   */
  update(data: Uint8Array | string): this {
    this.chunks.push(utf8of(data));
    return this;
  }

  /**
   * Renders the digest in the encoding the call names (the hex form the
   * family seats ride; the base64 form answers too — the pure encoder, no
   * Buffer dependency, the javy surface carries none).
   *
   * @param encoding the digest encoding ("hex" default, or "base64").
   * @returns the digest in the requested shape.
   */
  digest(encoding?: "hex" | "base64"): string | Uint8Array {
    const total = this.chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const bytes = new Uint8Array(total);
    let offset = 0;
    for (const chunk of this.chunks) {
      bytes.set(chunk, offset);
      offset += chunk.length;
    }
    const hex = this.algorithm === "sha256" ? sha256hex(bytes) : sha1hex(bytes);
    if (encoding === "base64") return base64of(hexbytesof(hex));
    if (encoding === undefined) return hexbytesof(hex);
    return hex;
  }
}

/**
 * Creates the hasher the aliased node:crypto imports answer.
 *
 * @param algorithm the digest algorithm ("sha256" or "sha1").
 * @returns the hasher with the chainable update and the digest.
 */
export function createHash(algorithm: "sha256" | "sha1"): wasmlasher {
  return new wasmlasher(algorithm);
}
