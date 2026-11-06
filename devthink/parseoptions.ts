/**
 * parseoptions — the pure toolstep options parser of the devthink family.
 *
 * The one cross-cutting helper every lane speaks (policy gates, the command
 * catalog, the background runner, the page surfaces): a toolstep carries
 * its options as a JSON string, and this parser answers the validated
 * record — or the one honest error. The function left the policy mega
 * module for its own seat (the browser purity law): the console page
 * resolves the command catalog, the catalog resolved this one helper from
 * policy, and the static edge dragged the whole correlated cluster —
 * security, memory, agent, environments, tools, net, bridge, http — into
 * the web graph, killing the dev boot. The policy owner keeps its face
 * answering the same symbol through the re-export, so every consumer
 * resolves unchanged.
 *
 * The contract is verbatim: one toolstep in, one validated record out —
 * the options field must parse as a JSON object, anything else is the
 * single "Step options must be a JSON object." refusal.
 */
import type { toolstep } from "./types.js";

/** parseoptions — parse the JSON options string of a toolstep into the
 * validated record every command lane reads. */
export function parseoptions(step: toolstep): Record<string, unknown> {
  if (step.options === undefined) return {};
  let parsed: unknown;
  try {
    parsed = JSON.parse(step.options);
  } catch {
    throw new Error("Step options must be a JSON object.");
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
    throw new Error("Step options must be a JSON object.");
  return parsed as Record<string, unknown>;
}
