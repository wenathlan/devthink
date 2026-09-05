/**
 * @file antigravity-cli.ts - compatibility re-export shim (v2.1.14).
 * @description All Antigravity CLI identity logic (OAuth client credentials,
 *              scopes, version pools, UA / X-Goog-Api-Client fingerprints,
 *              identity resolution) was consolidated into auth.ts in v2.1.14 -
 *              one file for the entire authentication management context of
 *              maene. This entry point continues to exist because
 *              `./antigravity-cli` is a published subpath of @wenathlan/maene
 *              (flat root-first layout); it re-exports the consolidated module
 *              so existing imports keep resolving unchanged.
 *
 *              The four names consumed by plugin.ts are declared explicitly
 *              below for documentation clarity; they are already covered by
 *              the star re-export (explicit exports take precedence over
 *              star exports in ES module semantics, and here both resolve to
 *              the same binding of auth.ts).
 */

export * from "./maene-auth.js";

// Explicit named re-exports consumed by plugin.ts (documentation clarity).
export {
  resolveOAuthIdentity,
  identityFromAccountType,
  getAntigravityCliHeaders,
  ANTIGRAVITY_CLI_OAUTH_SCOPES,
} from "./maene-auth.js";
