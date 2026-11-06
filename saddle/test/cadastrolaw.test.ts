/**
 * cadastrolaw.test — the signupseat law of the saddle auth faces (the
 * vault family law, PR16): the registration answers the database alone.
 * runnable with the house vitest suite:
 *   bunx vitest run test/cadastrolaw.test.ts
 *
 * The laws the battery pins:
 *  1. no browser persistence on the account path — the account surfaces
 *     (localauth.ts, the register face, the login form, the dashboard
 *     wingets) carry no localStorage / sessionStorage / indexedDB /
 *     localforage call: no account record, no password hash and no session
 *     row may persist in the visitor's browser (the owner's order: cadastro
 *     never saves in the browser);
 *  2. the faces ride the internal api — the register face posts to
 *     /api/v1/auth/register and the login form to /api/v1/auth/login (the
 *     self-hosted node's scrypt/cookie/sqlite surface), never a browser
 *     fallback;
 *  3. the local seat refuses honestly — register/login/importaccounts
 *     reject, available() answers false, localaccountnames() answers the
 *     empty list, session() answers null (the browser holds at most an
 *     in-memory session), exportaccounts() answers nothing to export.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'vitest';
import {
        adminusers,
        available,
        exportaccounts,
        importaccounts,
        localaccountnames,
        login,
        logout,
        register,
        roleof,
        session,
} from '../localauth.ts';

/** repository root resolved from this test file location. */
const reporoot = join(dirname(fileURLToPath(import.meta.url)), '..');

/** the account surfaces the law binds (the cadastro path end to end). */
const ACCOUNT_SURFACES = [
        'localauth.ts',
        'sol/register/register.tsx',
        'sol/wingets/LoginForm.tsx',
        'sol/dashboard/dashboard.tsx',
        'sol/wingets/DashboardAccountpanel.tsx',
        'sol/wingets/DashboardUserstable.tsx',
        'sol/wingets/DashboardAdminpanel.tsx',
] as const;

/** the browser-persistence surfaces the account path forbids: a real
 * storage read or write, never a comment saying the module refuses it. */
const BROWSER_PERSISTENCE =
        /window\.localStorage|window\.sessionStorage|window\.indexedDB|localStorage\s*\.\s*(getItem|setItem|removeItem|clear|key)\s*\(|sessionStorage\s*\.\s*(getItem|setItem|removeItem|clear|key)\s*\(|indexedDB\s*\.|localforage/;

/** reads one repo file as text. */
function source(relative: string): string {
        return readFileSync(join(reporoot, relative), 'utf8');
}

describe('the cadastro law (the registration answers the database alone)', () => {
        it('keeps the account surfaces free of every browser-persistence call', () => {
                const offenders: string[] = [];
                for (const surface of ACCOUNT_SURFACES) {
                        if (BROWSER_PERSISTENCE.test(source(surface))) offenders.push(surface);
                }
                assert.deepEqual(
                        offenders,
                        [],
                        'no account surface touches localStorage, sessionStorage, indexedDB or localforage',
                );
        });

        it('rides the internal api for the register and the login (never a browser account)', () => {
                const registerface = source('sol/register/register.tsx');
                assert.match(registerface, /\/api\/v1\/auth\/register/, 'the register face posts the internal door');
                const loginform = source('sol/wingets/LoginForm.tsx');
                assert.match(loginform, /\/api\/v1\/auth\/login/, 'the login form posts the internal door');
        });

        it('owns the server doors the faces ride (scrypt + the sqlite store)', () => {
                const webserver = source('webserver.ts');
                assert.match(webserver, /\/auth\/register/, 'the register route answers the node');
                assert.match(webserver, /\/auth\/login/, 'the login route answers the node');
                const auth = source('auth.ts');
                assert.match(auth, /scryptSync/, 'the password rides the scrypt lane server-side');
                assert.match(auth, /store\.createuser/, 'the account write lands on the sqlite store');
        });

        it('refuses the local seats honestly (the browser never holds an account)', async () => {
                await assert.rejects(register('someone', 'honest words'), /api lane is away/);
                await assert.rejects(login('someone', 'honest words'), /api lane is away/);
                await assert.rejects(importaccounts({} as File), /api lane is away/);
                assert.equal(available(), false, 'no browser account registry exists by law');
                assert.deepEqual(localaccountnames(), [], 'the browser account list is always empty');
                assert.equal(session(), null, 'no session row persists in the browser');
                assert.equal(await exportaccounts(), 0, 'nothing in the browser answers the export');
                assert.doesNotThrow(() => logout(), 'the memory seat clears without a store');
        });

        it('keeps the pure laws the faces still read (the role table and the allowlist)', () => {
                assert.equal(roleof('iakadion'), 'admin', 'the CODEOWNERS names answer admin');
                assert.equal(roleof('someone-else'), 'user', 'every other name answers user');
                assert.ok(adminusers.includes('iakadion'), 'the admin allowlist still answers');
                assert.ok(adminusers.length >= 4, 'the CODEOWNERS allowlist stays whole');
        });
});
