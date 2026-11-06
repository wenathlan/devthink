/**
 * validate — the pure gateway definition validator of the getry family.
 *
 * The ownership move (wave/ownership.gateway step 3) folded the whole
 * configuration loader family into the server owner, and the pure
 * validator landed beside the hono transport it never needed. This module
 * is the corrected seat: the checks are pure logic over the definition
 * object (no transport, no filesystem, no server imports), so every
 * consumer of the family — the server owner that re-exports it, the
 * devthink config bridge the browser graph rides, the configloader test
 * lane — resolves the same single owner without ever dragging the
 * transport stack into a module graph that must stay browser-pure.
 *
 * The contract is verbatim the server face: one definition in, one list
 * of human readable problems out — empty when valid, synchronous always.
 */
import type { gatewaydefinition } from "./types.js";

/** validateconfig — check a gateway definition for common errors
 * returns a list of human readable problems — empty when valid */
export function validateconfig(def: gatewaydefinition): string[] {
  const problems: string[] = [];
  if (!def.versions || Object.keys(def.versions).length === 0) {
    problems.push("no versions defined — add at least one version to versions map");
    return problems;
  }
  for (const [id, cfg] of Object.entries(def.versions)) {
    const prefix = `version ${id}:`;
    if (!cfg.id) problems.push(`${prefix} missing id`);
    if (cfg.id !== id) problems.push(`${prefix} id mismatch — map key is ${id} but id is ${cfg.id}`);
    if (!cfg.providername) problems.push(`${prefix} missing providername`);
    if (!cfg.upstreams || cfg.upstreams.length === 0) problems.push(`${prefix} no upstreams configured`);
    if (!cfg.auth) problems.push(`${prefix} missing auth config`);
    if (!cfg.models || cfg.models.length === 0) problems.push(`${prefix} no models configured`);
    if (!cfg.metamodel?.id) problems.push(`${prefix} missing metamodel id`);
    // rotation models must exist in the catalog — the catalog may itself be
    // missing (already reported above) so the lookup guards against it
    if (cfg.rotation?.models) {
      const ids = new Set((cfg.models ?? []).map((m) => m.id));
      for (const rm of cfg.rotation.models) {
        if (!ids.has(rm)) problems.push(`${prefix} rotation model ${rm} not in models catalog`);
      }
    }
    // defaultmodel must exist
    if (
      cfg.defaultmodel &&
      !(cfg.models ?? []).find((m) => m.id === cfg.defaultmodel) &&
      cfg.defaultmodel !== cfg.metamodel?.id
    ) {
      problems.push(`${prefix} defaultmodel ${cfg.defaultmodel} not in models catalog`);
    }
    // auth env var must be set when required from env — a version with a
    // missing auth block already carries its problem above; the dereference
    // below used to crash the whole validation with a type error instead of
    // reporting the remaining problems
    if (cfg.auth?.required && cfg.auth?.keysources?.includes("env") && !cfg.auth?.envvar) {
      problems.push(`${prefix} auth requires env keys but envvar is not set`);
    }
  }
  return problems;
}
