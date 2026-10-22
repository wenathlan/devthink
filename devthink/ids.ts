/** DevThink identity contract: compact, lowercase, URL-safe identifiers for new local records. */
const alphabet = "0123456789abcdefghjkmnpqrstvwxyz";
const tokenLength = 10;

/** Generates a 50-bit compact suffix that avoids ambiguous characters. */
export function compactToken(): string {
  // the webcrypto well: getRandomValues answers in every browser and every
  // node since 19 — the node:crypto import the browser graph must never ride
  const bytes = new Uint8Array(tokenLength);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes, (value) => alphabet[value & 31]).join("");
}

/** Creates a short identifier such as `s_1e9k2m7v3q`; existing longer IDs remain valid inputs. */
export function createCompactId(prefix: string): string {
  const normalized =
    prefix
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 4) || "id";
  return `${normalized}_${compactToken()}`;
}

/** Identifies the compact format without rejecting existing legacy identifiers. */
export function isCompactId(value: string): boolean {
  return /^[a-z0-9]{1,4}_[0123456789abcdefghjkmnpqrstvwxyz]{10}$/.test(value);
}
