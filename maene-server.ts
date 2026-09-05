/**
 * @file server.ts — the opencode `./server` package entry (v2.1.20).
 *
 * opencode >= 1.18 resolves package.json exports["./server"] FIRST when
 * loading a server plugin. This entry uses the multi-export plugin shape so
 * a SINGLE plugin reference registers THREE auth entries in
 * `opencode auth login` (and in the TUI "Connect a provider" dialog):
 *
 *   - provider "google"      → the standard Google entry, OAuth method
 *   - provider "antigravity" → the standard Antigravity entry, OAuth method
 *   - the CUSTOM provider detected by MODEL IDS in opencode.json
 *     ("casasbahia", "my-google", ... — whatever the user named it)
 *
 * opencode's loader treats every exported FUNCTION as a plugin instance and
 * merges the returned hooks, which is exactly what we need: one instance
 * returns the main hooks (identification headers, config injection, the
 * custom-provider auth) and two more instances return the standard google /
 * antigravity auth hooks.
 *
 * IMPORTANT CONTRACT: every export in this file MUST be a function —
 * opencode's legacy loader throws "Plugin export is not a function" for any
 * other export shape. Never re-export constants, objects or types from here;
 * library consumers keep importing from the package root (plugin.ts).
 */

import { opencodeServer, buildOpencodeAuthHook } from "./antigravity.js";

/**
 * The main maene plugin instance: chat.headers identification spoof,
 * zero-config antigravity provider injection and the auth entry for the
 * custom provider detected by model ids (when one exists).
 */
export default async function maeneServer(
  input?: unknown,
  options?: Record<string, unknown>,
): Promise<Record<string, any>> {
  return opencodeServer(input, options as any);
}

/**
 * Standard auth entry for the provider id "google":
 * `opencode auth login` → Google → OAuth (maene behind the scenes).
 */
export const googleAuth = async (): Promise<Record<string, any>> => ({
  auth: buildOpencodeAuthHook("google"),
});

/**
 * Standard auth entry for the provider id "antigravity":
 * `opencode auth login` → Antigravity → OAuth (maene behind the scenes).
 */
export const antigravityAuth = async (): Promise<Record<string, any>> => ({
  auth: buildOpencodeAuthHook("antigravity"),
});
