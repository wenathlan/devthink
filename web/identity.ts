/** Style: DevThink Terminal Atelier — browser-local identity boundary with no provider credential or remote account claim. */

export type LocalIdentity = {
  version: 1;
  id: string;
  label: string;
  mode: "local" | "temporary";
  createdAt: string;
};

const storageKey = "devthink.local.identity";
const alphabet = "0123456789abcdefghjkmnpqrstvwxyz";

function localId(): string {
  const bytes = new Uint8Array(10);
  globalThis.crypto?.getRandomValues?.(bytes);
  const value = Array.from(bytes, (byte) => alphabet[byte & 31]).join("") || Math.random().toString(36).slice(2, 12);
  return `u_${value}`;
}

/** Reads the identity owned by this browser only. */
export function readLocalIdentity(): LocalIdentity | undefined {
  try {
    const raw = window.localStorage.getItem(storageKey);
    const parsed = raw ? JSON.parse(raw) as Partial<LocalIdentity> : undefined;
    if (parsed?.version === 1 && typeof parsed.id === "string" && typeof parsed.label === "string" && (parsed.mode === "local" || parsed.mode === "temporary")) return parsed as LocalIdentity;
  } catch {}
  return undefined;
}

/** Creates a non-secret browser profile. It never represents a hosted account. */
export function createLocalIdentity(label: string, mode: LocalIdentity["mode"]): LocalIdentity {
  const identity: LocalIdentity = { version: 1, id: localId(), label: label.trim().slice(0, 48) || (mode === "temporary" ? "temporary workspace" : "local workspace"), mode, createdAt: new Date().toISOString() };
  window.localStorage.setItem(storageKey, JSON.stringify(identity));
  return identity;
}

/** Clears only the browser-local profile and does not revoke CLI pairings. */
export function clearLocalIdentity(): void {
  window.localStorage.removeItem(storageKey);
}
