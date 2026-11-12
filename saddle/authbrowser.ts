/**
 * authbrowser.ts — the browser account seat of the auth family (the
 * cadastro law owner). the section the auth node lane carried since the
 * localauth wave rides its own family member: every seat the sol faces
 * and the dashboard wingets import owns ZERO node builtins (the browser
 * bundle law — the auth.ts module scope carried node:crypto and the db
 * store the browser world never executes, and the bundled node:path
 * resolve the db chain pulled reddened the whole saddle face on the
 * static host: the corridor complaint the saddle design never opens).
 * the seats ride verbatim: probe, available, register, login, session,
 * logout, exportaccounts, importaccounts, roleof, localaccountnames and
 * the adminusernames allowlist the node twin reads through the family
 * import (the CODEOWNERS names, pure data, browser-safe).
 */

/* ══════════════════════════════════════════════════════════════════════ */
/* SECTION: localauth.ts — the browser account seat (the cadastro law:   */
/* the browser never holds an account — the exported surface the faces   */
/* and the dashboard wingets import rides verbatim; the one duplicated   */
/* datum the census found, the CODEOWNERS adminlist, dropped in favor    */
/* of the adminusernames export the first section answers; the localauth */
/* wave is browser-pure and imports nothing, so no intra-group import    */
/* dissolved).                                                           */
/* ══════════════════════════════════════════════════════════════════════ */

/**
 * the account seat of the auth faces — rewritten by the cadastro law (the
 * vault family law, PR16): the registration answers the database alone.
 *
 * the former browser-local account registry is DEAD: no account data may
 * persist in the visitor's browser — not the account map (the old
 * localStorage key saddle_local_users), not the IndexedDB mirror (the old
 * saddle-auth store), not the session row (the old saddle_local_session
 * key). the register and login faces ride the internal api of the
 * self-hosted node (POST /api/v1/auth/register, POST /api/v1/auth/login —
 * scrypt hashes, cookie sessions, the sqlite store auth.ts owns), and when
 * no api answers the faces refuse honestly: "the api lane is away" — the
 * browser is never the fallback account store (the owner's order: cadastro
 * never saves in the browser).
 *
 * this module keeps the exported surface the faces and the dashboard
 * wingets import (the binding point contract), now answering the law:
 *   probe(base)          - true when the api answers (the only door the faces need)
 *   available()          - false: the browser never holds accounts (the law)
 *   register(u, p)       - refuses: the registration answers the database alone
 *   login(u, p)          - refuses: the sign-in answers the database alone
 *   session()            - the in-memory session or null (never storage)
 *   logout()             - clears the in-memory session
 *   exportaccounts()     - 0: no browser accounts exist to export
 *   importaccounts(file) - refuses: the browser never holds accounts
 *   roleof(u)            - "admin" only for the CODEOWNERS names (pure law)
 *   localaccountnames()  - []: the browser registry is dead (the law)
 *
 * built-in admins: the CODEOWNERS accounts (iakadion, inathlan, aasblor,
 * nasblor) live on the self-hosted node's store only (auth.ts seeds them
 * from SADDLE_ADMIN_SEED_PASSWORD, the server-side twin); the browser seed
 * is dead — no credential, no hash and no session ever lands on the
 * visitor's machine.
 */

/** the CODEOWNERS admin allowlist (pure data — the node twin reads it
 * through the family import; the browser seat owns the datum). */
export const adminusernames: string[] = ['iakadion', 'inathlan', 'aasblor', 'nasblor'];

/** role of an account: "admin" only for the CODEOWNERS names. */
export type LocalAccountRole = 'admin' | 'user';

/** one stored local account (salt + hash, never the plaintext) — the shape
 * of the dead registry, kept for the backup payload contract; the browser
 * stores none of them (the cadastro law). */
export type LocalAccountRecord = {
        salt: string;
        hash: string;
        iterations: number;
        algorithm: 'pbkdf2-sha256';
        createdat: string;
        role: LocalAccountRole;
        seeded?: boolean;
};

/** the open in-memory session (12h lifetime, module memory only — the
 * browser holds at most the session token in memory, never storage). */
export type LocalSession = {
        user: string;
        mode: 'local';
        role: LocalAccountRole;
        issuedat: number;
        expiresat: number;
};

/** the backup keyfile payload the dead registry produced (kept for the
 * import contract; import now refuses — the browser holds no accounts). */
export type AccountsBackupPayload = {
        format: 'saddle-local-accounts/1';
        exportedat: string;
        accounts: Record<string, LocalAccountRecord>;
};

/** the exported admin allowlist (a defensive copy). */
export const adminusers: readonly string[] = adminusernames.slice();

/** the in-memory session seat: the only session the browser may hold, and
 * only for the life of the page (the cadastro law — no storage keys). */
let memorysession: LocalSession | null = null;

/** the honest refusal every local account lane answers: the api lane is
 * away and the browser is never the account store. */
const API_AWAY =
        'the api lane is away — accounts answer the database alone, never this browser (the cadastro law).';

/**
 * Reads the local account names through the one binding point (the wingets
 * never touch the browser's local storage directly — the raw reads the
 * dashboards carried retired with the privacy law).
 *
 * @vault binding point: saddle/localauth.ts — the static-edge account
 *   registry is dead by the cadastro law: the browser never holds an
 *   account, so the list is always empty and the real sessions ride the
 *   self-hosted node's scrypt/cookie surface (the migration law answered).
 * @returns the account names in the local registry (always empty — the law).
 */
export function localaccountnames(): string[] {
        return [];
}

/**
 * checks whether local accounts exist on this browser.
 *
 * @returns false always — the browser never holds accounts (the cadastro
 * law).
 */
export function available(): boolean {
        return false;
}

/**
 * probes the api health endpoint with a short timeout.
 *
 * @param base the api base to probe ("" means same-origin).
 * @returns true when the api answers ok.
 */
export async function probe(base: string): Promise<boolean> {
        try {
                const url = `${base ? base.replace(/\/+$/, '') : ''}/api/v1/health`;
                const controller = new AbortController();
                const timer = setTimeout(() => controller.abort(), 2500);
                const response = await fetch(url, { signal: controller.signal });
                clearTimeout(timer);
                if (!response.ok) return false;
                const body = (await response.json()) as { ok?: unknown } | null;
                return Boolean(body && body.ok === true);
        } catch {
                return false;
        }
}

/**
 * creates a local browser account and opens the local session — REFUSED by
 * the cadastro law: the registration answers the database alone (POST
 * /api/v1/auth/register on the self-hosted node), and the browser is never
 * the fallback account store.
 *
 * @param username the account name (validated by the caller).
 * @param password the plaintext password (never stored anywhere in the browser).
 * @returns never — the promise always rejects with the honest refusal.
 */
export async function register(_username: string, _password: string): Promise<boolean> {
        throw new Error(API_AWAY);
}

/**
 * verifies the password against a stored account and opens the local
 * session — REFUSED by the cadastro law: the sign-in answers the database
 * alone (POST /api/v1/auth/login on the self-hosted node); no account
 * record exists in the browser to verify against.
 *
 * @param username the account name.
 * @param password the plaintext password.
 * @returns never — the promise always rejects with the honest refusal.
 */
export async function login(_username: string, _password: string): Promise<boolean> {
        throw new Error(API_AWAY);
}

/**
 * reads the open in-memory session (module memory only — the browser holds
 * at most the session token in memory, never a storage key; the dead
 * registry could never open one again, so the seat answers null).
 *
 * @returns the in-memory session when valid and unexpired, null otherwise.
 */
export function session(): LocalSession | null {
        if (memorysession === null) return null;
        if (memorysession.expiresat < Date.now()) {
                memorysession = null;
                return null;
        }
        return memorysession;
}

/** closes the in-memory session (the only session seat the law leaves). */
export function logout(): void {
        memorysession = null;
}

/**
 * exports every account (salt + hash only, never plaintext passwords) as a
 * downloadable backup keyfile — the browser registry is dead, so the
 * export answers nothing.
 *
 * @returns 0 always — no browser accounts exist to export (the cadastro law).
 */
export async function exportaccounts(): Promise<number> {
        return 0;
}

/**
 * imports accounts from a backup keyfile (merges; the seed and
 * operator-owned entries are never overwritten) — REFUSED by the cadastro
 * law: the browser never holds accounts, so no keyfile may restore them
 * there.
 *
 * @param file the keyfile chosen by the operator.
 * @returns never — the promise always rejects with the honest refusal.
 */
export async function importaccounts(_file: File): Promise<number> {
        throw new Error(API_AWAY);
}

/**
 * the role of an account: "admin" only for the CODEOWNERS names.
 *
 * @param username the account name.
 * @returns "admin" or "user".
 */
export function roleof(username: string): LocalAccountRole {
        return adminusernames.includes(String(username).toLowerCase()) ? 'admin' : 'user';
}

