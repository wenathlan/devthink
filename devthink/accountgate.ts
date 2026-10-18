/**
 * accountgate.ts — the account contract of the os (root logic layer): the
 * local credential the visitor creates on the sign-in face, stored in the
 * browser database (the os HD) through the credential vault of db.ts. The
 * password never rides the network and never lands in plain text: the gate
 * keeps only a salted SHA-256 digest (the salt is the device id of the
 * local identity, so the digest is bound to this machine's HD). The state
 * machine is the Windows one: a machine without an account asks for the
 * name and the password creation; a machine with one asks for the password
 * alone and answers the wrong-try verdict.
 */
import { browserIdentity, readBrowserCredential, saveBrowserCredential, saveBrowserPreference } from "./db.ts";

/** the reserved credential slot of the account inside the vault */
export const ACCOUNT_CREDENTIAL_ID = "devthink.account";

/** the display-name preference key inside the local database */
export const ACCOUNT_NAME_KEY = "displayName";

/** whether this machine's HD already holds an account */
export type AccountState = "absent" | "ready";

async function digest(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const hash = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/** the stored verifier of this machine, or null when the account is absent */
async function storedVerifier(): Promise<string | null> {
  return readBrowserCredential(ACCOUNT_CREDENTIAL_ID).catch(() => null);
}

/** reads the account state of this machine's HD */
export async function accountstate(): Promise<AccountState> {
  return (await storedVerifier()) ? "ready" : "absent";
}

/** creates the local account: the display name lands on the preferences
 * and the salted password digest lands on the credential vault */
export async function createAccount(name: string, password: string): Promise<void> {
  const identity = await browserIdentity();
  const verifier = `${identity.deviceId}:${await digest(`${identity.deviceId}:${password}`)}`;
  await saveBrowserCredential(ACCOUNT_CREDENTIAL_ID, verifier);
  if (name.trim()) await saveBrowserPreference(ACCOUNT_NAME_KEY, name.trim());
}

/** verifies a password attempt against this machine's verifier */
export async function verifyAccount(password: string): Promise<boolean> {
  const verifier = await storedVerifier();
  if (!verifier) return false;
  const separator = verifier.indexOf(":");
  if (separator < 0) return false;
  const salt = verifier.slice(0, separator);
  return verifier.slice(separator + 1) === (await digest(`${salt}:${password}`));
}

/** replaces the account password (the visitor authenticated to reach here) */
export async function replaceAccountPassword(password: string): Promise<void> {
  const identity = await browserIdentity();
  const verifier = `${identity.deviceId}:${await digest(`${identity.deviceId}:${password}`)}`;
  await saveBrowserCredential(ACCOUNT_CREDENTIAL_ID, verifier);
}
