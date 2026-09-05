/**
 * The gates module of the 1.1.90 consolidation: every correlated variation of the human confirmation gate logic interned in this one file, so the module family carries one surface without duplicate variations.
 * The correlation is the human gate itself: confirmgates holds the sensitive class gates of the run steps (confirmpay for money, confirmdelete for destruction and confirmcreds for credentials, each resolved only through one distinct human action with no timeout path and no batch approval) and approvalgate holds the remote client gates of the agent protocol (the approval raise with the full call arguments, the client identity and the called tool in every prompt, the secret redaction of the marked fields, the approve and refuse resolution with its actor and latency record and the timeout that refuses an unanswered gate by default).
 * No gate window, class list or batch rule is ever hardcoded anywhere in the family: every timeout stays the user's choice beside the documented default, the gate payloads show exactly what the human reviews, and no gate ever resolves without its distinct human action.
 */

/* ── Merged from confirmgates.ts ── */

import type { confirmgate, gatekind, gateresolution, sensitiveclass, toolstep } from "./types.js";
import { randomid } from "./memory.js";

/**
 * Confirm gates of the 1.1.62 family.
 * The human gates for money, destruction and credentials live here: payment class steps pause in front of confirmpay, destructive delete steps pause in front of confirmdelete and credential use steps pause in front of confirmcreds, and each gate resolves only through one distinct human action — no timeout ever resolves a gate and no batch approval resolves two.
 * The payloads show exactly what the human reviews: confirmpay shows the amount, the payee origin and the target element, confirmdelete shows the target, the scope and the irreversibility, and confirmcreds shows the credential label only, never its value.
 */

/** Reads the option payload of one step without throwing on malformed json. */
function stepoptions(step: Pick<toolstep, "options">): Record<string, unknown> {
  if (!step.options) return {};
  try { const parsed = JSON.parse(step.options); return Boolean(parsed) && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as Record<string, unknown> : {}; } catch { return {}; }
}

/** Maps the sensitive classes of one step to its gated family: payment classes gate through confirmpay, delete classes through confirmdelete and credential classes through confirmcreds, while publish grades and plain sensitive by default steps ride their consent window prompt alone. */
export function gatekindfor(classes: sensitiveclass[]): gatekind | undefined {
  if (classes.includes("payment")) return "confirmpay";
  if (classes.includes("delete")) return "confirmdelete";
  if (classes.includes("credential")) return "confirmcreds";
  return undefined;
}

/** Builds the payload of one confirmpay gate: the amount, the payee origin and the target element of the step the human reviews. */
export function paypayload(input: { amount?: string; payeeorigin: string; target?: string }): Record<string, string> {
  const payload: Record<string, string> = { payeeorigin: input.payeeorigin };
  if (input.amount !== undefined && input.amount.trim() !== "") payload.amount = input.amount.trim();
  if (input.target !== undefined && input.target.trim() !== "") payload.target = input.target.trim();
  return payload;
}

/** Builds the payload of one confirmdelete gate: the target, the scope and the irreversibility of the destructive step the human reviews. */
export function deletepayload(input: { target?: string; scope: string; irreversibility: string }): Record<string, string> {
  const payload: Record<string, string> = { scope: input.scope, irreversibility: input.irreversibility };
  if (input.target !== undefined && input.target.trim() !== "") payload.target = input.target.trim();
  return payload;
}

/** Builds the payload of one confirmcreds gate: the credential label only, because the value stays behind the vault and no gate ever reveals it. */
export function credspayload(label: string): Record<string, string> {
  if (label.trim() === "") throw new Error("The confirmcreds gate names its credential label; the value never appears.");
  return { label: label.trim() };
}

/** Opens one confirm gate for a gated step: the payload the human reviews, the origin provenance and the open state that only an explicit user action resolves. */
export function opengate(input: { kind: gatekind; stepid: string; runid: string; origin: string; payload: Record<string, string>; now: number; gateid?: string }): confirmgate {
  if (input.stepid.trim() === "" || input.runid.trim() === "" || input.origin.trim() === "") throw new Error("The confirm gate needs its step, run and origin.");
  if (Object.keys(input.payload).length === 0) throw new Error("The confirm gate carries the payload the human reviews.");
  return { gateid: input.gateid ?? randomid(), kind: input.kind, stepid: input.stepid, runid: input.runid, origin: input.origin, payload: { ...input.payload }, state: "open", openedat: input.now };
}

/** Reads the state of the gate one step waits at: no gate, an open gate the step pauses at, a resolved gate the step passes and a refused gate the step never dispatches through. */
export function gatestateof(gates: confirmgate[], stepid: string): { state: "none" | "open" | "resolved" | "refused"; gate?: confirmgate } {
  const gate = [...gates].reverse().find(candidate => candidate.stepid === stepid);
  if (gate === undefined) return { state: "none" };
  return { state: gate.state, gate };
}

/** Resolves exactly one gate through one explicit human action: the decision names its acting user, an already resolved or refused gate stays terminal, and no timeout path exists because only a human resolves a gate. */
export function resolvegate(input: { gates: confirmgate[]; gateid: string; decision: "resolved" | "refused"; actor: string; now: number }): { gates: confirmgate[]; resolution?: gateresolution } {
  if (input.actor.trim() === "") throw new Error("The gate resolution names its acting user; only a human resolves a gate.");
  const gate = input.gates.find(candidate => candidate.gateid === input.gateid);
  if (gate === undefined) return { gates: input.gates };
  if (gate.state !== "open") return { gates: input.gates };
  const resolution: gateresolution = { gateid: gate.gateid, kind: gate.kind, stepid: gate.stepid, decision: input.decision, actor: input.actor, at: input.now };
  return { gates: input.gates.map(candidate => candidate.gateid === input.gateid ? { ...candidate, state: input.decision, resolvedat: input.now, actor: input.actor } : candidate), resolution };
}

/** Refuses batch approvals: one human action resolves exactly one gate, so a resolution request that names several gates refuses in full. */
export function nobatchresolution(gateids: string[]): { allowed: boolean; reason: string } {
  if (gateids.length > 1) return { allowed: false, reason: `One human action resolves exactly one gate; the batch of ${gateids.length} gates refuses in full because no batch approval exists.` };
  if (gateids.length === 0) return { allowed: false, reason: "A gate resolution names its single gate." };
  return { allowed: true, reason: "The resolution names exactly one gate; the distinct human action resolves it alone." };
}

/** Builds the plain language prompt of one gate: confirmpay names the amount, the payee origin and the target element, confirmdelete names the target, the scope and the irreversibility, and confirmcreds names the credential label only. */
export function gateprompttext(gate: confirmgate): string {
  if (gate.kind === "confirmpay") {
    const amount = gate.payload.amount !== undefined ? `the amount ${gate.payload.amount}` : "an amount the step options name";
    const target = gate.payload.target !== undefined ? ` on ${gate.payload.target}` : "";
    return `Approve the payment of ${amount} to ${gate.payload.payeeorigin}${target}? The step dispatches only after this distinct human action.`;
  }
  if (gate.kind === "confirmdelete") {
    const target = gate.payload.target !== undefined ? ` on ${gate.payload.target}` : "";
    return `Approve the destructive delete${target} scoped to ${gate.payload.scope}? ${gate.payload.irreversibility} The step dispatches only after this distinct human action.`;
  }
  return `Approve the use of the credential ${gate.payload.label} on ${gate.origin}? The value stays behind the vault; the label is everything this prompt shows.`;
}

/** Builds the gate descriptor of one gated step from its reviewed shape: the payload fields the human reviews read from the step options, the plan origin and the vault label of a credential step. */
export function gateforstep(input: { step: Pick<toolstep, "id" | "kind" | "target" | "options">; classes: sensitiveclass[]; runid: string; origin: string; credentiallabel?: string; now: number }): confirmgate | undefined {
  const kind = gatekindfor(input.classes);
  if (kind === undefined) return undefined;
  const options = stepoptions(input.step);
  if (kind === "confirmpay") {
    const amount = typeof options.amount === "string" ? options.amount : typeof options.value === "string" ? options.value : undefined;
    return opengate({ kind, stepid: input.step.id, runid: input.runid, origin: input.origin, payload: paypayload({ ...(amount !== undefined && amount !== "" ? { amount } : {}), payeeorigin: String(options.payeeorigin ?? input.origin), ...(input.step.target !== undefined && input.step.target !== "" ? { target: input.step.target } : {}) }), now: input.now });
  }
  if (kind === "confirmdelete") {
    return opengate({ kind, stepid: input.step.id, runid: input.runid, origin: input.origin, payload: deletepayload({ ...(input.step.target !== undefined && input.step.target !== "" ? { target: input.step.target } : {}), scope: String(options.scope ?? input.origin), irreversibility: String(options.irreversibility ?? "A destructive delete destroys state the page cannot restore.") }), now: input.now });
  }
  if (input.credentiallabel === undefined || input.credentiallabel.trim() === "") return undefined;
  return opengate({ kind, stepid: input.step.id, runid: input.runid, origin: input.origin, payload: credspayload(input.credentiallabel), now: input.now });
}

/* ── Merged from approvalgate.ts ── */

import type { allowlistentry, approvalrequest, approvalstate, approvalexec, clientidentity } from "./types.js";

/**
 * Approval gates of the 1.1.55 agent protocol part two.
 * Every sensitive tool call a remote client raises lands behind a human approval gate in this file: the gate raise with the full call arguments, the client identity and the called tool in every prompt, the secret redaction of the fields the user marked secret, the approve and refuse resolution with its actor and latency record, and the timeout that refuses an unanswered gate by default.
 * The gates never bypass review: an approved gate executes exactly the call it holds while refused and expired gates never execute anything.
 */

/** The documented default approval window of two minutes; any user configured window wins and an unanswered gate refuses by default. */
export const defaultapprovalwindowms = 120_000;

/** Raises one approval gate for a sensitive tool call: the full call arguments, the reason in plain language, the fields the user marked secret and the timeout that refuses by default. */
export function requireapproval(input: { clientid: string; tool: string; reason: string; params: Record<string, unknown>; now: number; timeout?: number; secretfields?: string[]; id?: string }): approvalrequest {
  return { id: input.id ?? randomid(), clientid: input.clientid, tool: input.tool, reason: input.reason, params: input.params, ...(input.secretfields !== undefined && input.secretfields.length > 0 ? { secretfields: input.secretfields } : {}), state: "pending", raisedat: input.now, ...(input.timeout !== undefined ? { timeoutat: input.now + input.timeout } : {}) };
}

/** Resolves one pending approval gate: the decision of the acting user closes the gate and returns the execution record with the latency from the raise; already closed gates stay untouched. */
export function resolveapproval(input: { requests: approvalrequest[]; id: string; decision: "approved" | "refused"; actor: string; now: number }): { requests: approvalrequest[]; exec?: approvalexec } {
  const gate = input.requests.find(request => request.id === input.id);
  if (gate === undefined || gate.state !== "pending") return { requests: input.requests };
  const decision: approvalstate = input.decision;
  const requests = input.requests.map(request => request.id === input.id ? { ...request, state: decision, decidedat: input.now, actor: input.actor } : request);
  return { requests, exec: { requestid: input.id, decision, actor: input.actor, at: input.now, latencyms: input.now - gate.raisedat } };
}

/** Expires every unanswered approval gate past its timeout window: the default disposition of an expired gate is refusal and the records stay for the audit trail. */
export function expireapprovals(requests: approvalrequest[], now: number): approvalrequest[] {
  return requests.map(request => request.state === "pending" && request.timeoutat !== undefined && now >= request.timeoutat ? { ...request, state: "expired" as const } : request);
}

/** Returns the pending and resolved gates of the approval view, newest raise first. */
export function listapprovals(requests: approvalrequest[]): approvalrequest[] {
  return [...requests].sort((one, two) => two.raisedat - one.raisedat);
}

/** Redacts the call arguments of one approval prompt: every field the user marked secret carries its redaction marker while the rest of the arguments stay visible for review. */
export function redactparams(params: Record<string, unknown>, secretfields: string[]): Record<string, unknown> {
  const redacted: Record<string, unknown> = {};
  for (const [name, value] of Object.entries(params)) redacted[name] = secretfields.includes(name) ? "[redacted]" : value;
  return redacted;
}

/** Builds the plain language approval prompt every gate surfaces: the client identity, the called tool, the reason and the full call arguments with the secret fields redacted. */
export function approvalprompt(request: approvalrequest, identity?: clientidentity): string {
  const who = identity !== undefined ? `the client ${identity.displayname} (${identity.fingerprint})` : `the client ${request.clientid}`;
  const params = JSON.stringify(redactparams(request.params, request.secretfields ?? []));
  return `${who} calls ${request.tool}: ${request.reason} Arguments: ${params}`;
}
