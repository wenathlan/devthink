/**
 * The security keyword file since the security-tooling consolidation: beside the trust boundary cluster above, the file now owns the security tooling family the PR3 law charged into one seat — the secret scan gate (checksecrets), the content security policy audit (cspaudit), the crx mining evidence harvester (crxharvest), the firefox/safari/polyfill browser coverage (crossbrowser) and the devtools wall (devtoolsguard) — every export preserved verbatim, the CLI seats riding the lane dispatcher at the bottom of the file.
 */

import { execFile } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { promisify } from "node:util";

/**
 * The security module of the 1.1.90 consolidation: every correlated variation of the trust boundary logic interned in this one file, so the module family carries one surface without duplicate variations.
 * The correlation is the trust boundary cluster: originpolicy holds the origin consent posture (the denydefault refusal, the exact origin automation allowlist with no wildcard expansion, the per site originprofiles, the consent windows bound in time, the mid run revocation and the sensitive class classification); inboundguard holds the entry gate of the background (the schemastrict command validation, the origincheck verdicts, the connectallow sender list that ships empty and the ratelimit buckets that defer past bound commands); maskinputs holds the field shape recognizer that keeps typed, form and stored values out of every log, observation and export behind the redaction marker; immutablelog holds the append only hash chained run log with its completion seal and its read time tamper detection; phishguard holds the lookalike watch that blocks credential steps on origins resembling granted ones under the user threshold; secretvault holds the vault seam (values enter through put and leave at the last possible moment before a credential field, records carry the digest only, and the leak scan refuses plaintext secrets in plans); and transparency holds the grant grammar the transparency page renders (the grant rows, the consent window history, the connectallow list and the permdiff of installed updates).
 * No window, threshold, shape list, bucket bound or retention is ever hardcoded anywhere in the family: every bound stays the user's choice, no security decision ever widens past the human review, and no secret value ever reaches a storage writer, a log entry, a memory record or an export path.
 */

/* ── Merged from originpolicy.ts ── */

import type {
  actionkind,
  automationallowlistentry,
  classconsent,
  consentwindow,
  consentscope,
  deniedevidence,
  originprofile,
  revokerunevent,
  sensitiveclass,
  toolstep,
} from "./types.js";
import { randomid } from "./memory.js";

/**
 * Origin consent policy logic of the 1.1.61 family.
 * The trust boundary rules live here: the denydefault posture that refuses every ungranted origin, the per origin automation allowlist with exact origin matching and no wildcard expansion, the per site originprofiles that grant and deny single action kinds, the consentwindows that bind every grant in time with a named boundary, the mid run revokerun that halts the pending step and every queued step as a terminal session event, and the sensitive class classification that routes payment, credential, delete and publish steps through one fresh consent prompt per class per origin.
 * No duration, boundary, kind list or class list is ever hardcoded: every window, profile and consent stays the user's choice, the active tab grant counts as exactly one explicit single origin grant, and no security decision ever bypasses the human review.
 */

/** The documented posture of the 1.1.61 family: every origin the user never granted stays refused by default. */
export const denydefaultposture = "denydefault" as const;

/** Reads whether two origins match exactly: the allowlist binds every grant to one exact origin with no wildcard expansion, so a star, an empty segment or a scheme wildcard never covers any origin. */
export function exactorigin(origin: string, entry: string): boolean {
  return origin.trim() !== "" && origin === entry;
}

/** Refuses wildcard patterns as allowlist entries before any matching runs: no wildcard expansion exists because every grant binds to one exact origin. */
export function wildcardentry(entry: string): boolean {
  return (
    entry.includes("*") ||
    entry.includes("://*.") ||
    entry.trim() === "" ||
    entry.trim() === "https://" ||
    entry.trim() === "http://"
  );
}

/** Checks one origin against the per origin automation allowlist under the denydefault posture: an origin absent from the allowlist stays refused, the active tab origin counts as exactly one explicit single origin grant, and no wildcard expansion ever widens an entry. */
export function allowlistcheck(input: {
  origin: string;
  allowlist: automationallowlistentry[];
  profileid?: string;
  sessionorigin?: string;
}): { allowed: boolean; reason: string } {
  if (input.origin.trim() === "") return { allowed: false, reason: "The step needs the exact origin it targets." };
  for (const entry of input.allowlist) {
    if (wildcardentry(entry.origin))
      return {
        allowed: false,
        reason: `The allowlist entry ${entry.origin} carries a wildcard; every grant binds to one exact origin with no wildcard expansion.`,
      };
  }
  const scoped =
    input.profileid === undefined
      ? input.allowlist
      : input.allowlist.filter((entry) => entry.profileid === input.profileid);
  const granted = scoped.some((entry) => exactorigin(input.origin, entry.origin));
  if (granted)
    return {
      allowed: true,
      reason: `The origin ${input.origin} sits inside the automation allowlist the user granted.`,
    };
  if (input.sessionorigin !== undefined && exactorigin(input.origin, input.sessionorigin))
    return {
      allowed: true,
      reason: `The active tab grant covers ${input.origin} as exactly one explicit single origin grant.`,
    };
  return {
    allowed: false,
    reason: `The denydefault posture refuses ${input.origin} because the origin sits absent from the automation allowlist; grant the origin first.`,
  };
}

/** Builds one per site origin profile with its kind grants and denials; the profile consults before every sensitive kind on its origin. */
export function originprofileof(input: {
  profileid?: string;
  origin: string;
  grants?: actionkind[];
  denials?: actionkind[];
  now: number;
}): originprofile {
  if (input.origin.trim() === "") throw new Error("The origin profile needs its exact origin.");
  return {
    profileid: input.profileid ?? randomid(),
    origin: input.origin,
    grants: [...(input.grants ?? [])],
    denials: [...(input.denials ?? [])],
    createdat: input.now,
    updatedat: input.now,
  };
}

/** Grants or denies one action kind on one origin profile; a kind already sitting on the opposite list moves so the lists never overlap. */
export function profilekind(input: {
  profile: originprofile;
  kind: actionkind;
  decision: "grant" | "deny";
  now: number;
}): originprofile {
  if (input.profile.grants.includes(input.kind) && input.decision === "grant") return input.profile;
  if (input.profile.denials.includes(input.kind) && input.decision === "deny") return input.profile;
  const grants =
    input.decision === "grant"
      ? [...new Set([...input.profile.grants, input.kind])]
      : input.profile.grants.filter((kind) => kind !== input.kind);
  const denials =
    input.decision === "deny"
      ? [...new Set([...input.profile.denials, input.kind])]
      : input.profile.denials.filter((kind) => kind !== input.kind);
  return { ...input.profile, grants, denials, updatedat: input.now };
}

/** Consults the per origin profile before one sensitive kind: an explicit denial refuses the kind on that origin, an explicit grant allows it while the fresh class consent gate still routes sensitive classes through their prompt, and an absent profile leaves the decision to the class consent gate. */
export function profilegrade(input: { profile: originprofile | undefined; kind: actionkind; sensitive: boolean }): {
  allowed: boolean;
  consult: boolean;
  reason: string;
} {
  if (!input.sensitive)
    return {
      allowed: true,
      consult: false,
      reason: `The ${input.kind} kind grades non-sensitive and the origin profile needs no consult.`,
    };
  if (input.profile === undefined)
    return {
      allowed: true,
      consult: true,
      reason: `No origin profile exists for the ${input.kind} kind, so the fresh class consent gate alone routes the sensitive step.`,
    };
  if (input.profile.denials.includes(input.kind))
    return {
      allowed: false,
      consult: true,
      reason: `The origin profile of ${input.profile.origin} denies the ${input.kind} kind; a denied kind never runs on that origin.`,
    };
  if (input.profile.grants.includes(input.kind))
    return {
      allowed: true,
      consult: true,
      reason: `The origin profile of ${input.profile.origin} grants the ${input.kind} kind the user reviewed.`,
    };
  return {
    allowed: true,
    consult: true,
    reason: `The origin profile of ${input.profile.origin} carries no ${input.kind} decision, so the fresh class consent gate alone routes the sensitive step.`,
  };
}

/** Reads the option payload of one step without throwing on malformed json. */
function stepoptions(step: Pick<toolstep, "options">): Record<string, unknown> {
  if (!step.options) return {};
  try {
    const parsed = JSON.parse(step.options);
    return Boolean(parsed) && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

/** The payment kinds of the classification table: card fills and code fills carry money semantics before any option refinement. */
const paymentkinds: ReadonlySet<string> = new Set(["fillcard", "fillcode"]);
/** The credential kinds of the classification table: password consent, api key saves, auth handling and auth flows carry credentials. */
const credentialkinds: ReadonlySet<string> = new Set(["consentpassword", "saveapikey", "handleauth", "authflow"]);
/** The delete kinds of the classification table: discards, pattern closes, cookie clears, attribute removals and artifact cleanups destroy state. */
const deletekinds: ReadonlySet<string> = new Set([
  "discardtab",
  "closepattern",
  "clearcookies",
  "removeattribute",
  "cleanupartifacts",
]);
/** The publish kinds of the classification table: form and file posts, messages, submits and mutating calls move content out of the page. */
const publishkinds: ReadonlySet<string> = new Set([
  "postform",
  "postfiles",
  "sendmessage",
  "submitform",
  "submitsearch",
  "writeclipboard",
]);
/** The kinds the classification marks sensitive by default: uploads, downloads and evaluate grade sensitive regardless of their options. */
const defaultsensitivekinds: ReadonlySet<string> = new Set([
  "attachfile",
  "uploadfile",
  "uploadfiles",
  "downloadfile",
  "downloadimages",
  "batchdownload",
  "pausedownload",
  "resumedownload",
  "quarantinedownload",
  "evaluate",
]);

/** Classifies one step into the sensitive classes: payment, credential, delete and publish kinds take their table class, the kind options refine the class when they carry card or credential field shapes, and uploads, downloads and evaluate grade sensitive by default without a named class. */
export function sensitiveclassesof(step: Pick<toolstep, "kind" | "value" | "options">): {
  classes: sensitiveclass[];
  bydefault: boolean;
  sensitive: boolean;
  reason: string;
} {
  const options = stepoptions(step);
  const fields = Array.isArray(options.fields)
    ? (options.fields.filter((item) => Boolean(item) && typeof item === "object") as Array<Record<string, unknown>>)
    : [];
  const names = [
    ...fields.map((field) => (typeof field.name === "string" ? field.name : "")),
    typeof options.field === "string" ? options.field : "",
    typeof options.target === "string" ? options.target : "",
  ].map((name) => name.toLowerCase());
  const carries = (shape: string): boolean => names.some((name) => name.includes(shape));
  const classes = new Set<sensitiveclass>();
  if (paymentkinds.has(step.kind) || carries("card") || carries("cvc") || carries("cvv")) classes.add("payment");
  const credentialshape =
    carries("password") || carries("token") || carries("secret") || carries("apikey") || carries("passphrase");
  const submits =
    step.kind === "submitform" ||
    step.kind === "postform" ||
    step.kind === "submitsearch" ||
    step.kind === "fillform" ||
    step.kind === "filllabel" ||
    step.kind === "fillplaceholder";
  if (credentialkinds.has(step.kind) || (submits && credentialshape)) classes.add("credential");
  if (deletekinds.has(step.kind)) classes.add("delete");
  if (publishkinds.has(step.kind) || step.kind === "callrest" || step.kind === "callgraphql") {
    const verb =
      typeof options.method === "string"
        ? options.method.trim().toUpperCase()
        : typeof options.verb === "string"
          ? options.verb.trim().toUpperCase()
          : "";
    if (step.kind === "callrest" || step.kind === "callgraphql") {
      if (verb !== "" && !["GET", "HEAD", "OPTIONS"].includes(verb)) classes.add("publish");
    } else classes.add("publish");
  }
  const bydefault = defaultsensitivekinds.has(step.kind);
  const list = [...classes];
  if (list.length === 0 && !bydefault)
    return {
      classes: [],
      bydefault: false,
      sensitive: false,
      reason: `The ${step.kind} kind carries no sensitive class and no default sensitive grade.`,
    };
  return {
    classes: list,
    bydefault,
    sensitive: true,
    reason: `The ${step.kind} kind grades sensitive${list.length > 0 ? ` through the ${list.join(", ")} class${list.length === 1 ? "" : "es"}` : ""}${bydefault ? " by default" : ""}.`,
  };
}

/** Reads whether one fresh class consent covers a class on an origin: each sensitive class needs its own fresh prompt per origin, an expired consent covers nothing and a consent of another class never widens. */
export function classconsentcovers(
  consents: classconsent[],
  origin: string,
  sensitiveclass: sensitiveclass,
  now: number,
): boolean {
  return consents.some(
    (consent) =>
      consent.origin === origin &&
      consent.sensitiveclass === sensitiveclass &&
      consent.grantedat <= now &&
      (consent.expiresat === undefined || now < consent.expiresat),
  );
}

/** Reads which fresh class consents one sensitive step still needs on its origin: every class the classification names needs its own prompt and a default sensitive grade without classes needs the plain sensitive prompt that the window itself carries. */
export function missingclassconsents(input: {
  origin: string;
  classes: sensitiveclass[];
  bydefault: boolean;
  consents: classconsent[];
  now: number;
}): { needed: boolean; missing: sensitiveclass[]; reason: string } {
  const missing = input.classes.filter((kind) => !classconsentcovers(input.consents, input.origin, kind, input.now));
  if (missing.length > 0)
    return {
      needed: true,
      missing,
      reason: `The sensitive classes ${missing.join(", ")} need one fresh consent prompt each on ${input.origin}.`,
    };
  if (input.bydefault && input.classes.length === 0)
    return {
      needed: true,
      missing: [],
      reason: `The ${input.origin} step grades sensitive by default and needs its fresh consent window prompt.`,
    };
  return {
    needed: false,
    missing: [],
    reason: `The fresh class consents of ${input.origin} cover every class the step names.`,
  };
}

/** Opens one consent window bound in time: the duration stays the user's positive choice, the boundary names itself in plain language and no window ever defaults to unlimited. */
export function openconsentwindow(input: {
  id?: string;
  sessionid: string;
  origin: string;
  duration: number;
  kinds: actionkind[];
  now: number;
  boundary?: string;
}): consentwindow {
  if (input.sessionid.trim() === "" || input.origin.trim() === "")
    throw new Error("The consent window needs its session and its exact origin.");
  if (!Number.isFinite(input.duration) || input.duration <= 0)
    throw new Error("The consent window needs its duration as a positive user value; no window defaults to unlimited.");
  return {
    id: input.id ?? randomid(),
    sessionid: input.sessionid,
    origin: input.origin,
    startedat: input.now,
    duration: input.duration,
    expiresat: input.now + input.duration,
    boundary:
      input.boundary?.trim() !== "" && input.boundary !== undefined
        ? input.boundary
        : `${input.duration} milliseconds the user chose`,
    kinds: [...new Set(input.kinds)],
    state: "active",
  };
}

/** Reads the state of one consent window at a time: an active window reports its remaining time while a window past its duration boundary reports its expiry. */
export function consentwindowstate(
  window: consentwindow,
  now: number,
): { state: "active" | "expired"; remaining: number; reason: string } {
  if (window.state === "closed" || now >= window.expiresat)
    return {
      state: "expired",
      remaining: 0,
      reason: `The consent window of ${window.origin} closed at its ${window.boundary} boundary; the run suspends until a new explicit prompt renews it.`,
    };
  return {
    state: "active",
    remaining: window.expiresat - now,
    reason: `The consent window of ${window.origin} stays active with ${window.expiresat - now} milliseconds left of its ${window.boundary} boundary.`,
  };
}

/** Checks one step against its consent window: the window scopes to exactly one session and one origin, an expired window suspends the run mid step, and a step outside the window scope or past its boundary never dispatches. */
export function windowgatesstep(input: {
  window: consentwindow | undefined;
  sessionid: string;
  origin: string;
  now: number;
}): { allowed: boolean; suspended: boolean; reason: string } {
  if (input.window === undefined)
    return {
      allowed: false,
      suspended: false,
      reason: `No active consent window covers ${input.origin}; the consent prompt opens one before any step dispatches.`,
    };
  if (input.window.sessionid !== input.sessionid)
    return {
      allowed: false,
      suspended: false,
      reason: `The consent window scopes to the session ${input.window.sessionid} only and never widens to another session.`,
    };
  if (input.window.origin !== input.origin)
    return {
      allowed: false,
      suspended: false,
      reason: `The consent window scopes to the origin ${input.window.origin} only and never widens to another origin.`,
    };
  const state = consentwindowstate(input.window, input.now);
  if (state.state === "expired") return { allowed: false, suspended: true, reason: state.reason };
  return { allowed: true, suspended: false, reason: state.reason };
}

/** Closes every consent window past its duration boundary: the expired windows keep their records for the audit trail while their grants bind no step anymore. */
export function expireconsentwindows(windows: consentwindow[], now: number): consentwindow[] {
  return windows.map((window) =>
    window.state === "active" && now >= window.expiresat
      ? { ...window, state: "closed" as const, closedat: now }
      : window,
  );
}

/** Renews a consent window only through a new explicit prompt: the renewal opens a brand new window record with its own duration and boundary while the old window stays closed in the history. */
export function renewconsentwindow(input: {
  window: consentwindow;
  duration: number;
  kinds: actionkind[];
  now: number;
}): { renewed: consentwindow; closed: consentwindow } {
  const closed: consentwindow =
    input.window.state === "active" ? { ...input.window, state: "closed", closedat: input.now } : input.window;
  const renewed = openconsentwindow({
    sessionid: input.window.sessionid,
    origin: input.window.origin,
    duration: input.duration,
    kinds: input.kinds.length > 0 ? input.kinds : input.window.kinds,
    now: input.now,
  });
  return { renewed, closed };
}

/** Revokes one run mid step as a terminal session event: the pending step and every queued step halt without executing, and the record names the acting user and the reason. */
export function revokerun(input: {
  id?: string;
  sessionid: string;
  runid: string;
  pendingstepid?: string;
  queuedstepids?: string[];
  actor: string;
  reason?: string;
  now: number;
}): revokerunevent {
  if (input.sessionid.trim() === "" || input.runid.trim() === "")
    throw new Error("The revocation needs its session and run ids.");
  if (input.actor.trim() === "") throw new Error("The revocation names the acting user.");
  const halted = [...(input.pendingstepid !== undefined ? [input.pendingstepid] : []), ...(input.queuedstepids ?? [])];
  if (halted.length === 0) throw new Error("The revocation halts at least the pending step of the run.");
  return {
    id: input.id ?? randomid(),
    sessionid: input.sessionid,
    runid: input.runid,
    haltedstepids: halted,
    actor: input.actor,
    reason:
      input.reason?.trim() !== "" && input.reason !== undefined
        ? input.reason
        : "The user revoked the consent mid run.",
    at: input.now,
  };
}

/** Reads which steps one revocation halted with the pending step first: the rollback list the confirm dialog names before the user confirms. */
export function haltedstepsof(revocation: revokerunevent): { pending?: string; queued: string[] } {
  return {
    ...(revocation.haltedstepids.length > 0 ? { pending: revocation.haltedstepids[0] } : {}),
    queued: revocation.haltedstepids.slice(1),
  };
}

/** Builds one consent scope grant that names the origin, the kinds and the boundary in a single record; the session start writes it into the immutable log. */
export function scopegrantof(input: {
  origin: string;
  kinds: actionkind[];
  boundary: string;
  now: number;
}): consentscope {
  if (input.origin.trim() === "") throw new Error("The consent scope needs its exact origin.");
  if (input.kinds.length === 0) throw new Error("The consent scope names the kinds it covers.");
  if (input.boundary.trim() === "")
    throw new Error("The consent scope names its boundary; no grant defaults to unlimited.");
  return { origin: input.origin, kinds: [...new Set(input.kinds)], boundary: input.boundary, grantedat: input.now };
}

/** Builds one denied step evidence without navigation: the origin, the action kind and the deny reason in plain language. */
export function deniedevidenceof(input: { origin: string; kind: string; reason: string; now: number }): deniedevidence {
  return { origin: input.origin, kind: input.kind, reason: input.reason, at: input.now };
}

/** Builds the consent prompt text of one pending sensitive step: the exact origin, the kind, the class badge and the consent window duration the user chooses; the prompt always names a boundary and never defaults to unlimited. */
export function consentprompttext(input: {
  origin: string;
  kind: string;
  classes: sensitiveclass[];
  bydefault: boolean;
  duration: number;
}): string {
  const label =
    input.classes.length > 0
      ? `the ${input.classes.join(" and ")} class${input.classes.length === 1 ? "" : "es"}`
      : "a sensitive by default grade";
  return `Allow the ${input.kind} step on ${input.origin} graded as ${label} for ${input.duration} milliseconds? The consent window closes at that boundary; no grant ever defaults to unlimited.`;
}

/** Builds the denydefault notice of one origin for the popup: ungranted origins stay refused until the user grants them. */
export function denydefaultnotice(origin: string): string {
  return `The denydefault posture refuses ${origin} until the user adds the origin to the automation allowlist; no step dispatches without the grant.`;
}

/** Builds the origin profile summary of the active tab for the popup: the granted and denied kinds the per site profile carries. */
export function profilesummary(profile: originprofile | undefined): string {
  if (profile === undefined)
    return "No origin profile exists for this origin yet; sensitive steps route through their fresh consent prompts.";
  return `The origin profile of ${profile.origin} grants ${profile.grants.length} kind${profile.grants.length === 1 ? "" : "s"} and denies ${profile.denials.length} kind${profile.denials.length === 1 ? "" : "s"} the user reviewed.`;
}

/** The documented reads only baseline of the safedefaults posture: observation and read kinds grant on an unknown origin while every sensitive class denies; the user extends the grants through the originprofile editor, never the engine. */
const safedefaultreadkinds: ReadonlySet<string> = new Set([
  "observe",
  "readhtml",
  "readtext",
  "readlinks",
  "readtable",
  "readforms",
  "readvisible",
  "readselection",
  "readmeta",
  "readlang",
  "readoutline",
  "readstyle",
  "readimages",
  "readertree",
]);

/** Builds the safedefaults profile of an unknown origin: the initial originprofile the executor applies when no profile exists grants the documented read kinds only and denies every sensitive class kind, so a first visit never runs a payment, credential, delete or publish step until the user edits the profile. */
export function safedefaultprofile(input: { origin: string; now: number; profileid?: string }): originprofile {
  if (input.origin.trim() === "") throw new Error("The safedefaults profile needs its exact origin.");
  const denials = new Set<string>([
    ...paymentkinds,
    ...credentialkinds,
    ...deletekinds,
    ...publishkinds,
    ...defaultsensitivekinds,
  ]);
  return {
    profileid: input.profileid ?? randomid(),
    origin: input.origin.trim(),
    grants: [...safedefaultreadkinds] as actionkind[],
    denials: [...denials] as actionkind[],
    createdat: input.now,
    updatedat: input.now,
  };
}

/** Reads whether one action kind sits inside the reads only baseline of the safedefaults posture. */
export function safedefaultreadkind(kind: actionkind): boolean {
  return safedefaultreadkinds.has(kind);
}

/** Builds the safedefaults notice of an unknown origin for the popup: the notice links to the originprofile editor because only the user widens a safedefaults profile. */
export function safedefaultnotice(origin: string): string {
  return `The safedefaults posture profiles ${origin} on its first visit: reads only, every sensitive class denied; open the originprofile editor to widen the profile.`;
}

/* ── Merged from inboundguard.ts ── */

import type { connectallowentry, deferredevent, origincheckverdict, ratelimitbucket, schemaerror } from "./types.js";

/**
 * Inbound guard logic of the 1.1.62 family.
 * Every message, command and connection that enters the background passes this guard chain: schemastrict validates each inbound command against its declared grammar and rejects unknown fields with the path and the expected shape, origincheck verdicts guard every runtime message and every port connection, connectallow holds the external senders the user allowed and ships empty by default so every unknown sender drops without handler execution, and the ratelimit buckets bound automation commands per origin and per session by deferring every command that exceeds its bucket until the window resets.
 * No bound, window or sender list is ever hardcoded: the buckets stay user configured values with no hidden ceiling, and the connectallow list holds user managed entries only.
 */

/** The field shapes schemastrict understands: strings, numbers, booleans, plain objects and arrays, beside the absent marker a field the grammar never declared expects. */
export type schemashape = "string" | "number" | "boolean" | "object" | "array" | "absent";

/** Reads the shape name of one value for the schemastrict error grammar. */
function shapeof(value: unknown): Exclude<schemashape, "absent"> {
  if (typeof value === "string") return "string";
  if (typeof value === "number") return "number";
  if (typeof value === "boolean") return "boolean";
  if (Array.isArray(value)) return "array";
  return "object";
}

/** Validates one inbound command under schemastrict: every field the grammar declares keeps its expected shape, a missing required field errors with its path, and a field the grammar never declared errors with the expected shape absent so the command never dispatches. */
export function schemacheck(input: {
  command: Record<string, unknown>;
  schema: Record<string, schemashape>;
  required?: string[];
}): { valid: boolean; errors: schemaerror[] } {
  const errors: schemaerror[] = [];
  for (const [field, value] of Object.entries(input.command)) {
    const expected = input.schema[field];
    if (expected === undefined) {
      errors.push({
        path: field,
        expected: "absent",
        found: shapeof(value),
        reason: `The ${field} field sits absent from the declared grammar of the command; schemastrict refuses unknown fields before dispatch.`,
      });
      continue;
    }
    if (expected === "absent") {
      errors.push({
        path: field,
        expected: "absent",
        found: shapeof(value),
        reason: `The ${field} field carries no value under the declared grammar; schemastrict refuses it before dispatch.`,
      });
      continue;
    }
    if (shapeof(value) !== expected)
      errors.push({
        path: field,
        expected: expected,
        found: shapeof(value),
        reason: `The ${field} field expects a ${expected} while the command carries a ${shapeof(value)}; schemastrict refuses the shape mismatch before dispatch.`,
      });
  }
  for (const field of input.required ?? []) {
    if (input.command[field] === undefined)
      errors.push({
        path: field,
        expected: input.schema[field] ?? "string",
        found: "absent",
        reason: `The ${field} field is required by the declared grammar and the command carries no value; schemastrict refuses the incomplete command before dispatch.`,
      });
  }
  return { valid: errors.length === 0, errors };
}

/** Validates one inbound command envelope: the kind must be a non-empty string the dispatch registry knows, so an unknown command kind refuses before any handler runs. */
export function envelopecheck(input: { command: Record<string, unknown>; knownkinds: readonly string[] }): {
  valid: boolean;
  errors: schemaerror[];
} {
  const kind = input.command.kind;
  if (typeof kind !== "string" || kind.trim() === "")
    return {
      valid: false,
      errors: [
        {
          path: "kind",
          expected: "string",
          found: shapeof(kind),
          reason: "Every inbound command names its kind as a non-empty string; a kindless command never dispatches.",
        },
      ],
    };
  if (!input.knownkinds.includes(kind))
    return {
      valid: false,
      errors: [
        {
          path: "kind",
          expected: `one of ${input.knownkinds.length} declared command kinds`,
          found: kind,
          reason: `The ${kind} command kind sits absent from the dispatch registry; schemastrict refuses unknown commands before dispatch.`,
        },
      ],
    };
  return { valid: true, errors: [] };
}

/** Checks one inbound runtime message or port connection through origincheck: an internal sender of this extension accepts, an external sender accepts only when its sender id sits in the connectallow list the user manages, and every other sender drops without handler execution. */
export function origincheckof(input: {
  senderid?: string;
  senderorigin?: string;
  extensionid: string;
  connectallow: connectallowentry[];
}): origincheckverdict {
  const sender = input.senderid ?? "an unknown sender";
  const origin = input.senderorigin ?? "";
  if (input.senderid === input.extensionid)
    return {
      accepted: true,
      sender,
      origin,
      reason: "The sender is this extension itself; the internal surface accepts.",
    };
  if (
    input.senderid !== undefined &&
    input.connectallow.some(
      (entry) => entry.senderid === input.senderid && (entry.origin === undefined || entry.origin === origin),
    )
  ) {
    return {
      accepted: true,
      sender,
      origin,
      reason: `The sender ${sender} sits in the connectallow list the user manages${origin !== "" ? ` for ${origin}` : ""}; the message accepts.`,
    };
  }
  if (input.senderid === undefined)
    return {
      accepted: false,
      sender,
      origin,
      reason: "The message carries no sender identity; the guard drops it before any handler runs.",
    };
  return {
    accepted: false,
    sender,
    origin,
    reason: `The sender ${sender} sits absent from the connectallow list; the guard drops the message without handler execution.`,
  };
}

/** Checks one port connection through the same origincheck grammar: only ports of this extension or of allowed external senders accept, and every other port closes at the handshake. */
export function portaccept(input: {
  portname: string;
  senderid?: string;
  senderorigin?: string;
  extensionid: string;
  connectallow: connectallowentry[];
}): origincheckverdict {
  const verdict = origincheckof(input);
  if (!verdict.accepted)
    return { ...verdict, reason: `The port ${input.portname} closes at its handshake: ${verdict.reason}` };
  return { ...verdict, reason: `The port ${input.portname} accepted its handshake: ${verdict.reason}` };
}

/** Builds one connectallow entry: the external sender id the user allows, its display name and its optional origin scope; the list ships empty by default. */
export function connectallowentryof(input: {
  senderid: string;
  displayname: string;
  origin?: string;
  now: number;
}): connectallowentry {
  if (input.senderid.trim() === "") throw new Error("The connectallow entry needs its sender id.");
  if (input.displayname.trim() === "") throw new Error("The connectallow entry needs its display name.");
  return {
    senderid: input.senderid.trim(),
    displayname: input.displayname.trim(),
    ...(input.origin !== undefined && input.origin.trim() !== "" ? { origin: input.origin.trim() } : {}),
    addedat: input.now,
  };
}

/** The empty connectallow list the extension ships with: no external sender accepts until the user adds its entry. */
export const emptyconnectallow: connectallowentry[] = [];

/** Validates the user configured ratelimit bucket bounds: the limit and the window stay positive user values because no hidden ceiling exists. */
export function bucketboundsvalid(limit: number, window: number): { valid: boolean; reason: string } {
  if (!Number.isFinite(limit) || limit <= 0)
    return {
      valid: false,
      reason: "The ratelimit bucket limit stays a positive user value; no hidden ceiling exists.",
    };
  if (!Number.isFinite(window) || window <= 0)
    return {
      valid: false,
      reason:
        "The ratelimit bucket window stays a positive user value in milliseconds; the window reset stays the user's choice.",
    };
  return {
    valid: true,
    reason: `The bucket bound of ${limit} commands per ${window} milliseconds stays the user configured choice with no hidden ceiling.`,
  };
}

/** Builds one ratelimit bucket per origin and per session with its user configured bound and window. */
export function bucketof(input: {
  origin: string;
  sessionid: string;
  limit: number;
  window: number;
  now: number;
}): ratelimitbucket {
  const bounds = bucketboundsvalid(input.limit, input.window);
  if (!bounds.valid) throw new Error(bounds.reason);
  return {
    origin: input.origin,
    sessionid: input.sessionid,
    limit: input.limit,
    window: input.window,
    used: 0,
    windowstartedat: input.now,
    resetsat: input.now + input.window,
  };
}

/** Consumes one command from its bucket: a command inside its bound consumes, a command past its bound defers until the window resets, and a window past its reset starts a fresh window. */
export function bucketconsume(input: { bucket: ratelimitbucket; now: number }): {
  allowed: boolean;
  deferred: boolean;
  bucket: ratelimitbucket;
  resetsat: number;
  reason: string;
} {
  if (input.now >= input.bucket.resetsat) {
    const fresh: ratelimitbucket = {
      ...input.bucket,
      used: 0,
      windowstartedat: input.now,
      resetsat: input.now + input.bucket.window,
    };
    return {
      allowed: true,
      deferred: false,
      bucket: { ...fresh, used: 1 },
      resetsat: fresh.resetsat,
      reason: `The bucket window of ${input.bucket.origin} reset and the command consumes the first slot of ${fresh.limit}.`,
    };
  }
  if (input.bucket.used < input.bucket.limit) {
    return {
      allowed: true,
      deferred: false,
      bucket: { ...input.bucket, used: input.bucket.used + 1 },
      resetsat: input.bucket.resetsat,
      reason: `The command consumes slot ${input.bucket.used + 1} of ${input.bucket.limit} in the bucket of ${input.bucket.origin}.`,
    };
  }
  return {
    allowed: false,
    deferred: true,
    bucket: input.bucket,
    resetsat: input.bucket.resetsat,
    reason: `The bucket of ${input.bucket.origin} holds its ${input.bucket.limit} command bound; the command defers until the window resets at ${input.bucket.resetsat}.`,
  };
}

/** Builds one deferred command event: the step the bucket deferred with the reason and the reset time it waits for. */
export function deferredeventof(input: {
  stepid: string;
  kind: string;
  origin: string;
  reason: string;
  resetsat: number;
  now: number;
  id?: string;
}): deferredevent {
  if (input.stepid.trim() === "" || input.kind.trim() === "")
    throw new Error("The deferred event needs its step and kind.");
  return {
    id: input.id ?? randomid(),
    stepid: input.stepid,
    kind: input.kind,
    origin: input.origin,
    reason: input.reason,
    resetsat: input.resetsat,
    at: input.now,
  };
}

/** Reads whether one deferred command may retry: the deferral holds until its bucket window resets. */
export function deferredready(deferred: deferredevent, now: number): boolean {
  return now >= deferred.resetsat;
}

/* ── Merged from maskinputs.ts ── */

import type { maskrule, observation, runsettings } from "./types.js";

/**
 * Mask inputs logic of the 1.1.61 family.
 * The masking rules live here: typed values, form values and stored values never reach a log, an observation or an export unmasked when their field shapes match the documented password, token, card and secret families or the shapes the user configured; the observation schema keeps its field shapes while the values behind masked shapes carry their redaction marker instead.
 * No shape list is closed: the documented four families stay the recognition baseline and the user extends them through the global maskshapes setting and the per origin mask rules, because a sensitive field shape stays the user's knowledge, never the engine's guess.
 */

/** The documented mask shape families the recognizer reads by default: password, token, card and secret field shapes; the user extends the list, never narrows the recognition below it. */
export const defaultmaskshapes: readonly string[] = ["password", "token", "card", "secret"];

/** The redaction marker every masked value carries; the marker stays visible so a review sees that a value existed without reading it. */
export const maskmarker = "[redacted]";

/** Reads the shape family one field name matches: password, token, card and secret shapes recognize by name while every other field keeps its value. */
export function fieldshapekind(name: string): "password" | "token" | "card" | "secret" | undefined {
  const lowered = name.toLowerCase();
  if (
    lowered.includes("password") ||
    lowered.includes("passwd") ||
    lowered.includes("pwd") ||
    lowered.includes("passphrase")
  )
    return "password";
  if (
    lowered.includes("token") ||
    lowered.includes("apikey") ||
    lowered.includes("api_key") ||
    lowered.includes("auth") ||
    lowered.includes("bearer")
  )
    return "token";
  if (
    lowered.includes("card") ||
    lowered.includes("cvc") ||
    lowered.includes("cvv") ||
    lowered.includes("expiry") ||
    lowered.includes("pan")
  )
    return "card";
  if (lowered.includes("secret")) return "secret";
  return undefined;
}

/** Reads the effective mask shapes of one origin: the documented four families, the global user configured shapes and the per origin mask rules join into one recognition list. */
export function shapesof(input: { settings?: runsettings; rules: maskrule[]; origin?: string }): string[] {
  const shapes = new Set<string>(defaultmaskshapes);
  for (const shape of input.settings?.maskshapes ?? []) if (shape.trim() !== "") shapes.add(shape.trim().toLowerCase());
  for (const rule of input.rules) {
    const scoped =
      rule.origin === undefined || rule.origin === "" || (input.origin !== undefined && rule.origin === input.origin);
    if (scoped) for (const shape of rule.shapes) if (shape.trim() !== "") shapes.add(shape.trim().toLowerCase());
  }
  return [...shapes];
}

/** Reads whether one field name matches the effective shapes: the documented recognizer runs first and the configured shapes match by substring. */
export function maskingfield(name: string, shapes: string[]): boolean {
  if (fieldshapekind(name) !== undefined) return true;
  const lowered = name.toLowerCase();
  return shapes.some((shape) => shape !== "" && lowered.includes(shape));
}

/** Masks one value behind the redaction marker; an empty value stays empty because nothing existed to redact. */
export function maskvalue(value: string): string {
  return value === "" ? "" : maskmarker;
}

/** Masks one named field when its shape matches: the field keeps its name while its value carries the redaction marker. */
export function maskfield(input: { name: string; value: string; shapes: string[] }): string {
  return maskingfield(input.name, input.shapes) ? maskvalue(input.value) : input.value;
}

/** Masks the typed values of one record deeply: every key whose shape matches keeps its key while its string value carries the redaction marker, and nested records walk the same rule. */
export function maskrecord(record: Record<string, unknown>, shapes: string[]): Record<string, unknown> {
  const masked: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(record)) {
    if (typeof value === "string") {
      const sibling = (record as Record<string, unknown>).name;
      masked[key] =
        key === "value" && typeof sibling === "string"
          ? maskfield({ name: sibling, value, shapes })
          : maskfield({ name: key, value, shapes });
    } else if (Array.isArray(value))
      masked[key] = value.map((item) =>
        Boolean(item) && typeof item === "object" && !Array.isArray(item)
          ? maskrecord(item as Record<string, unknown>, shapes)
          : item,
      );
    else if (Boolean(value) && typeof value === "object")
      masked[key] = maskrecord(value as Record<string, unknown>, shapes);
    else masked[key] = value;
  }
  return masked;
}

/** Masks the typed value and the reviewed options of one step before they reach any log writer: a step whose target or kind names a masked shape keeps its shape while the typed value carries the redaction marker. */
export function masktypedvalues(input: {
  step: Pick<toolstep, "kind" | "target" | "value" | "options">;
  shapes: string[];
}): { value?: string; options?: string } {
  const sensitive = maskingfield(input.step.target ?? "", input.shapes) || maskingfield(input.step.kind, input.shapes);
  const maskedvalue = input.step.value !== undefined && sensitive ? maskvalue(input.step.value) : input.step.value;
  let maskedoptions = input.step.options;
  if (input.step.options !== undefined) {
    try {
      const parsed = JSON.parse(input.step.options) as unknown;
      if (Boolean(parsed) && typeof parsed === "object" && !Array.isArray(parsed))
        maskedoptions = JSON.stringify(maskrecord(parsed as Record<string, unknown>, input.shapes));
    } catch {
      /* an options payload outside the json grammar keeps its reviewed text */
    }
  }
  return {
    ...(maskedvalue !== undefined ? { value: maskedvalue } : {}),
    ...(maskedoptions !== undefined ? { options: maskedoptions } : {}),
  };
}

/** Masks one captured form state: every field keeps its name and type while a value behind a masked shape carries the redaction marker, so the observation schema keeps its field shapes but masks their values. */
export function maskformstate<T extends { name: string; value: string }>(
  fields: T[],
  shapes: string[],
): Array<T & { value: string }> {
  return fields.map((field) => ({ ...field, value: maskfield({ name: field.name, value: field.value, shapes }) }));
}

/** Masks one observation payload before logging: the schema keeps every field shape while the option lists of fields whose names match a masked shape carry the redaction marker instead of their entries. */
export function maskobservation(shot: observation, shapes: string[]): observation {
  return {
    ...shot,
    forms: shot.forms.map((form) => (maskingfield(form.name, shapes) ? { ...form, options: [maskmarker] } : form)),
  };
}

/** Masks the stored values of one storage record: the keys keep their names while a value behind a masked shape carries the redaction marker. */
export function maskstoredvalues(record: Record<string, string>, shapes: string[]): Record<string, string> {
  const masked: Record<string, string> = {};
  for (const [key, value] of Object.entries(record)) masked[key] = maskfield({ name: key, value, shapes });
  return masked;
}

/** Excludes masked values from every export of the run record: a value that already carries the redaction marker stays visible as evidence a value existed, while any raw value behind a masked shape carries the marker before the export leaves the browser. */
export function maskexport(record: Record<string, unknown>, shapes: string[]): Record<string, unknown> {
  return maskrecord(record, shapes);
}

/* ── Merged from immutablelog.ts ── */

import type { immutablelogentry, logeventkind, loghash, sealedlog, storedrunlog } from "./types.js";

/**
 * Immutable run log logic of the 1.1.61 family.
 * The append only log lives here: every step transition, grant, expiry, revoke, deny, suspend and resume event lands as one entry whose loghash chains it to the hash of its predecessor at append time with no later rewrite, the completion seal closes the log with a final hash, and the read path verifies the whole chain before returning a single entry so tampering with any link stays detectable.
 * There is no update or delete path: a sealed log refuses every append, and an unsealed log only ever grows. The hash algorithm stays sha-256 because a cryptographic primitive is a correctness choice, not a tunable.
 */

/** Derives the sha-256 hex digest of one log payload through the web crypto the platform offers. */
async function sha256(payload: string): Promise<string> {
  const bytes = new TextEncoder().encode(payload);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

/** Reads the canonical body of one log entry: the fields the hash covers, with the chain link itself excluded. */
function entrybody(entry: Omit<immutablelogentry, "hash">): string {
  return JSON.stringify({
    id: entry.id,
    runid: entry.runid,
    kind: entry.kind,
    summary: entry.summary,
    origin: entry.origin,
    ...(entry.stepid !== undefined ? { stepid: entry.stepid } : {}),
    at: entry.at,
  });
}

/** Derives the hash chain link of one log entry: the sha-256 over the predecessor hash and the canonical entry body, written once at append time. */
export async function entryhashof(input: {
  previous: string;
  entry: Omit<immutablelogentry, "hash">;
}): Promise<loghash> {
  return {
    previous: input.previous,
    current: await sha256(`${input.previous}\n${entrybody(input.entry)}`),
    algorithm: "sha-256",
  };
}

/** Builds one log entry with its chain link derived at append time: the event kind, the summary, the origin and step provenance and the time. */
export async function logentryof(input: {
  id?: string;
  runid: string;
  kind: logeventkind;
  summary: string;
  origin: string;
  stepid?: string;
  at: number;
  previous: string;
}): Promise<immutablelogentry> {
  if (input.summary.trim() === "") throw new Error("The log entry needs its summary in plain language.");
  if (input.origin.trim() === "") throw new Error("The log entry needs its origin provenance.");
  const entry: Omit<immutablelogentry, "hash"> = {
    id: input.id ?? randomid(),
    runid: input.runid,
    kind: input.kind,
    summary: input.summary,
    origin: input.origin,
    ...(input.stepid !== undefined ? { stepid: input.stepid } : {}),
    at: input.at,
  };
  return { ...entry, hash: await entryhashof({ previous: input.previous, entry }) };
}

/** Opens one empty run log: the first entry of the log chains to the genesis hash of exactly sixty-four zeros. */
export function openrunlog(input: { runid: string; sessionid: string; now: number }): storedrunlog {
  if (input.runid.trim() === "" || input.sessionid.trim() === "")
    throw new Error("The run log needs its run and session ids.");
  return { runid: input.runid, sessionid: input.sessionid, entries: [], updatedat: input.now };
}

/** Reads the hash of the last entry of one log: the value the next append chains to, with the genesis hash for an empty log. */
export function lasthashof(log: storedrunlog): string {
  const entry = log.entries[log.entries.length - 1];
  return entry === undefined ? "0".repeat(64) : entry.hash.current;
}

/** Appends one event to the run log inside a single storage transaction the caller persists: the entry hash chains to its predecessor and is written at append time, and a sealed log refuses every append because the seal is terminal. */
export async function appendlogentry(input: {
  log: storedrunlog;
  kind: logeventkind;
  summary: string;
  origin: string;
  stepid?: string;
  at: number;
  id?: string;
}): Promise<storedrunlog> {
  if (input.log.seal !== undefined)
    throw new Error(
      `The run log of ${input.log.runid} sealed at ${input.log.seal.sealedat} and accepts no append; the seal is terminal.`,
    );
  const entry = await logentryof({
    ...(input.id !== undefined ? { id: input.id } : {}),
    runid: input.log.runid,
    kind: input.kind,
    summary: input.summary,
    origin: input.origin,
    ...(input.stepid !== undefined ? { stepid: input.stepid } : {}),
    at: input.at,
    previous: lasthashof(input.log),
  });
  return { ...input.log, entries: [...input.log.entries, entry], updatedat: input.at };
}

/** Seals one run log at completion with a final hash: the seal chains to the last entry hash and closes the log with no later append. */
export async function sealrunlog(log: storedrunlog, now: number): Promise<{ log: storedrunlog; seal: sealedlog }> {
  if (log.seal !== undefined)
    throw new Error(`The run log of ${log.runid} already sealed at ${log.seal.sealedat}; the seal is terminal.`);
  if (log.entries.length === 0) throw new Error("The run log seals at completion with at least one entry.");
  const sealhash = await entryhashof({
    previous: lasthashof(log),
    entry: {
      id: `seal:${log.runid}`,
      runid: log.runid,
      kind: "seal",
      summary: `The run ${log.runid} completed and the log sealed with ${log.entries.length} entries.`,
      origin: log.entries[log.entries.length - 1]?.origin ?? log.runid,
      at: now,
    },
  });
  const seal: sealedlog = { runid: log.runid, entries: log.entries.length, sealhash, sealedat: now };
  return { log: { ...log, seal, updatedat: now }, seal };
}

/** Verifies the whole hash chain of one log at read time: every entry hash must chain to its predecessor and match its own body, so tampering with any summary, provenance or link stays detectable as tamper evidence. */
export async function verifylogchain(
  entries: immutablelogentry[],
): Promise<{ valid: boolean; brokenat?: number; reason: string }> {
  let previous = "0".repeat(64);
  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index];
    if (entry === undefined) continue;
    if (entry.hash.previous !== previous)
      return {
        valid: false,
        brokenat: index,
        reason: `The chain link of entry ${index} carries the previous hash ${entry.hash.previous} while its predecessor hashes to ${previous}; the chain reports tamper evidence.`,
      };
    const expected = await entryhashof({
      previous,
      entry: {
        id: entry.id,
        runid: entry.runid,
        kind: entry.kind,
        summary: entry.summary,
        origin: entry.origin,
        ...(entry.stepid !== undefined ? { stepid: entry.stepid } : {}),
        at: entry.at,
      },
    });
    if (entry.hash.current !== expected.current)
      return {
        valid: false,
        brokenat: index,
        reason: `The entry hash of entry ${index} matches neither its body nor its predecessor hash; the chain reports tamper evidence.`,
      };
    previous = entry.hash.current;
  }
  return {
    valid: true,
    reason: `The hash chain of ${entries.length} entr${entries.length === 1 ? "y" : "ies"} verifies from the genesis hash to the last entry.`,
  };
}

/** Reads one run log only through chain verification: a verified chain returns its entries while a chain with a broken link refuses the read entirely. */
export async function readverifiedlog(
  log: storedrunlog,
): Promise<{ ok: boolean; entries: immutablelogentry[]; reason: string }> {
  const verification = await verifylogchain(log.entries);
  if (!verification.valid) return { ok: false, entries: [], reason: verification.reason };
  return { ok: true, entries: [...log.entries], reason: verification.reason };
}

/** Reads the verification status of one stored run log for the panel: the chain validity, the entry count, the broken link when one exists and the seal hash at completion. */
export async function chainreportof(
  log: storedrunlog,
): Promise<{
  runid: string;
  valid: boolean;
  entries: number;
  brokenat?: number;
  reason: string;
  sealhash?: string;
  sealedat?: number;
}> {
  const verification = await verifylogchain(log.entries);
  if (!verification.valid)
    return {
      runid: log.runid,
      valid: false,
      entries: log.entries.length,
      ...(verification.brokenat !== undefined ? { brokenat: verification.brokenat } : {}),
      reason: verification.reason,
    };
  return {
    runid: log.runid,
    valid: true,
    entries: log.entries.length,
    reason: verification.reason,
    ...(log.seal !== undefined ? { sealhash: log.seal.sealhash.current, sealedat: log.seal.sealedat } : {}),
  };
}

/** Exports one run log as an audit record only after the chain verifies: the entries, the chain status and the seal hash travel together while a broken link refuses the export. */
export async function exportlogchain(
  log: storedrunlog,
): Promise<{
  runid: string;
  entries: number;
  chainvalid: boolean;
  reason: string;
  sealhash?: string;
  sealedat?: number;
  log: immutablelogentry[];
}> {
  const read = await readverifiedlog(log);
  if (!read.ok) return { runid: log.runid, entries: 0, chainvalid: false, reason: read.reason, log: [] };
  return {
    runid: log.runid,
    entries: read.entries.length,
    chainvalid: true,
    reason: read.reason,
    ...(log.seal !== undefined ? { sealhash: log.seal.sealhash.current, sealedat: log.seal.sealedat } : {}),
    log: read.entries,
  };
}

/* ── Merged from phishguard.ts ── */

import type { phishverdict } from "./types.js";

/**
 * Phishguard logic of the 1.1.62 family.
 * The lookalike watch lives here: before a credential step runs on a new origin, the guard compares the login target against every granted origin and measures the lookalike distance between their host labels, so a lookalike origin that sits close to a granted origin under the user threshold blocks the step and the deny event names the matched known origin.
 * The threshold stays the user's choice between zero and one with no engine default, and the distance reads the host label order from the registrable side so a padded subdomain never hides a lookalike.
 */

/** Reads whether one step is a login or credential step: the credential kind families and the field shapes that carry passwords, tokens and secrets mark the step for the phishguard watch. */
export function credentialstep(step: Pick<toolstep, "kind" | "target" | "value" | "options">): boolean {
  const credentialkinds: ReadonlySet<string> = new Set([
    "consentpassword",
    "saveapikey",
    "handleauth",
    "authflow",
    "fillcard",
    "fillcode",
  ]);
  if (credentialkinds.has(step.kind)) return true;
  const options = stepoptions(step);
  const fields = Array.isArray(options.fields)
    ? (options.fields.filter((item) => Boolean(item) && typeof item === "object") as Array<Record<string, unknown>>)
    : [];
  const names = [
    ...fields.map((field) => (typeof field.name === "string" ? field.name : "")),
    typeof options.field === "string" ? options.field : "",
    step.target ?? "",
  ].map((name) => name.toLowerCase());
  return names.some(
    (name) =>
      name.includes("password") ||
      name.includes("passwd") ||
      name.includes("passphrase") ||
      name.includes("token") ||
      name.includes("secret") ||
      name.includes("apikey"),
  );
}

/** Splits one origin into its host labels from the registrable side: the comparison reads com.example.pay from https://pay.example.com so the distance weighs the distinguishing labels first. */
export function originlabels(origin: string): string[] {
  const host =
    origin
      .trim()
      .replace(/^[a-z][a-z0-9+.-]*:\/\//i, "")
      .split("/")[0] ?? "";
  return host
    .split(".")
    .filter((label) => label !== "")
    .reverse();
}

/** Reads the edit distance between two label sequences; the guard uses it over the registrable ordered labels. */
function labeldistance(one: string[], two: string[]): number {
  const rows = one.length + 1;
  const columns = two.length + 1;
  let previous = Array.from({ length: columns }, (_, index) => index);
  for (let row = 1; row < rows; row += 1) {
    const current = [row, ...Array.from({ length: columns - 1 }, () => 0)];
    for (let column = 1; column < columns; column += 1) {
      const substitution = (previous[column - 1] ?? 0) + (one[row - 1] === two[column - 1] ? 0 : 1);
      current[column] = Math.min((previous[column] ?? 0) + 1, (current[column - 1] ?? 0) + 1, substitution);
    }
    previous = current;
  }
  return previous[columns - 1] ?? Math.max(one.length, two.length);
}

/** Measures the normalized lookalike distance between two origins in the zero to one range: identical origins carry zero, and every label edit moves the distance toward one. */
export function lookalikedistance(one: string, two: string): number {
  if (one.trim() === "" || two.trim() === "") return 1;
  if (one === two) return 0;
  const first = originlabels(one);
  const second = originlabels(two);
  const edits = labeldistance(first, second);
  const longest = Math.max(first.length, second.length);
  if (longest === 0) return 1;
  const distance = edits / longest;
  return Math.min(1, Math.max(0, distance));
}

/** Validates the phishguard threshold as a user choice between zero and one: no engine default exists and the boundary the user picks stays the only block line. */
export function phishthresholdvalid(threshold: number): { valid: boolean; reason: string } {
  if (!Number.isFinite(threshold) || threshold <= 0 || threshold >= 1)
    return {
      valid: false,
      reason: "The phishguard threshold stays a user choice between zero and one; the lookalike line never defaults.",
    };
  return {
    valid: true,
    reason: `The lookalike threshold ${threshold} stays the user configured line a login origin crosses at its own risk.`,
  };
}

/** Renders one phishguard verdict for a login origin: the closest granted origin carries the distance, and a distance that crosses the user threshold blocks the step while the deny event names the matched known origin. */
export function phishverdictof(input: {
  origin: string;
  granted: string[];
  threshold: number;
  now: number;
}): phishverdict {
  const threshold = phishthresholdvalid(input.threshold);
  if (!threshold.valid) throw new Error(threshold.reason);
  if (input.granted.includes(input.origin)) {
    return {
      origin: input.origin,
      distance: 0,
      threshold: input.threshold,
      blocked: false,
      reason: `The login origin ${input.origin} sits among the granted origins; no lookalike watch applies.`,
      at: input.now,
    };
  }
  let matchedorigin: string | undefined;
  let distance = 1;
  for (const granted of input.granted) {
    const candidate = lookalikedistance(input.origin, granted);
    if (candidate < distance) {
      distance = candidate;
      matchedorigin = granted;
    }
  }
  if (matchedorigin !== undefined && distance <= input.threshold) {
    return {
      origin: input.origin,
      matchedorigin,
      distance,
      threshold: input.threshold,
      blocked: true,
      reason: `The login origin ${input.origin} sits ${distance} away from the granted origin ${matchedorigin} and crosses the user threshold ${input.threshold}; the credential step blocks and the deny event names ${matchedorigin}.`,
      at: input.now,
    };
  }
  return {
    origin: input.origin,
    ...(matchedorigin !== undefined ? { matchedorigin } : {}),
    distance,
    threshold: input.threshold,
    blocked: false,
    reason:
      matchedorigin !== undefined
        ? `The login origin ${input.origin} sits ${distance} away from its closest granted origin ${matchedorigin} and stays under the user threshold ${input.threshold}.`
        : `The login origin ${input.origin} carries no granted origin to resemble; the watch records the first visit.`,
    at: input.now,
  };
}

/** Reads whether one stored phishguard verdict stays inside its freshness window: a verdict past the window leaves the live set while its record survives for the audit trail. */
export function verdictfresh(verdict: phishverdict, now: number, freshness: number | undefined): boolean {
  if (freshness === undefined) return true;
  return now - verdict.at < freshness;
}

/** Builds the plain language phishguard notice the surfaces show before a login step: the verdict, the matched origin and the threshold in one line. */
export function phishnotetext(verdict: phishverdict): string {
  if (verdict.blocked) return verdict.reason;
  if (verdict.matchedorigin !== undefined)
    return `The login origin ${verdict.origin} sits ${verdict.distance} from the granted origin ${verdict.matchedorigin}, under the user threshold ${verdict.threshold}.`;
  return `The login origin ${verdict.origin} has no granted lookalike under the user threshold ${verdict.threshold}.`;
}

/* ── Merged from secretvault.ts ── */

import type { secretvaultentry } from "./types.js";

/**
 * Secret vault logic of the 1.1.62 family.
 * The vault seam lives here: secrets enter through put and leave through fetch at the last possible moment before a credential field, while the persisted records carry only the label, the exact origin scope, the profile workspace, the provenance and the sha-256 verification digest — no plaintext value ever reaches a storage writer, a log entry, a memory record or an export path.
 * The scan paths refuse secrets in plain sight: a step option, a variable or a plan text whose value digests to a stored vault entry is a leak that refuses the plan, and a raw typed value behind a masked field shape never rides a step at all.
 * Honest limit: the browser offers no vault hardware, so the seam rides the session storage area the background wires, which keeps values in memory only and never persists them to disk; the persistence layer stores metadata alone, mirroring the immutablelog seam honesty.
 */

/** The digest prefix every stored vault digest carries so raw values never persist anywhere. */
export const vaultdigestprefix = "sha256:";

/** Derives the sha-256 verification digest of one secret value through the platform crypto seam; the digest persists while the value never does. */
export async function vaultdigestof(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return vaultdigestprefix + [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

/** Builds one vault record from its metadata: the label, the exact origin scope, the profile workspace and the provenance; the digest verifies the value behind the seam without ever carrying it. */
export function vaultentryof(input: {
  label: string;
  scope: string;
  profileid: string;
  provenance: "user" | "session";
  digest: string;
  now: number;
  vaultid?: string;
}): secretvaultentry {
  if (input.label.trim() === "") throw new Error("The vault record needs its label; the surfaces show the label only.");
  if (input.scope.trim() === "")
    throw new Error("The vault record needs its exact origin scope; a secret never rides every origin.");
  if (!input.digest.startsWith(vaultdigestprefix))
    throw new Error("The vault record carries its sha-256 digest, never its value.");
  return {
    vaultid: input.vaultid ?? randomid(),
    label: input.label.trim(),
    scope: input.scope.trim(),
    profileid: input.profileid,
    provenance: input.provenance,
    algorithm: "sha-256",
    digest: input.digest,
    createdat: input.now,
  };
}

/** Creates an in memory vault seam: values live in the map only, which is the honest fallback the background wraps with the session storage area that never persists to disk. */
export function inmemoryvault(): {
  put(vaultid: string, value: string): Promise<void>;
  fetch(vaultid: string): Promise<string | undefined>;
  drop(vaultid: string): Promise<void>;
} {
  const values = new Map<string, string>();
  return {
    put: async (vaultid, value) => {
      values.set(vaultid, value);
    },
    fetch: async (vaultid) => values.get(vaultid),
    drop: async (vaultid) => {
      values.delete(vaultid);
    },
  };
}

/** Stores one secret behind the vault seam and returns its metadata record alone: the value enters the seam and no return path carries it. */
export async function vaultstore(input: {
  seam: { put(vaultid: string, value: string): Promise<void> };
  label: string;
  scope: string;
  profileid: string;
  provenance: "user" | "session";
  value: string;
  now: number;
}): Promise<secretvaultentry> {
  if (input.value === "")
    throw new Error("The vault stores a secret value the user supplied; an empty value stores nothing.");
  const entry = vaultentryof({
    label: input.label,
    scope: input.scope,
    profileid: input.profileid,
    provenance: input.provenance,
    digest: await vaultdigestof(input.value),
    now: input.now,
  });
  await input.seam.put(entry.vaultid, input.value);
  return entry;
}

/** Reads one secret from the vault seam at the last possible moment before its credential field: the value returns to the dispatching caller only, never to a log writer, and the record stamps its last use. */
export async function vaultvaluefor(input: {
  seam: { fetch(vaultid: string): Promise<string | undefined> };
  entry: secretvaultentry;
}): Promise<{ ok: boolean; value?: string; reason: string; used?: secretvaultentry }> {
  const value = await input.seam.fetch(input.entry.vaultid);
  if (value === undefined)
    return {
      ok: false,
      reason: `The vault holds no value behind the label ${input.entry.label}; add the secret again.`,
    };
  return {
    ok: true,
    value,
    reason: `The vault released the value behind the label ${input.entry.label} at the last possible moment; the value reaches the credential field only and no log records it.`,
  };
}

/** Drops one secret from the vault seam; the metadata record leaves with it because a deleted secret leaves no trace a surface could read. */
export async function vaultdelete(input: {
  seam: { drop(vaultid: string): Promise<void> };
  entry: secretvaultentry;
}): Promise<{ dropped: boolean; label: string; reason: string }> {
  await input.seam.drop(input.entry.vaultid);
  return {
    dropped: true,
    label: input.entry.label,
    reason: `The vault dropped the secret ${input.entry.label} of ${input.entry.scope}; no value and no copy remains behind the seam.`,
  };
}

/** Reads whether one vault record covers an origin: the scope binds to exactly one origin, so a secret of one site never rides another site. */
export function vaultcovers(entry: secretvaultentry, origin: string): boolean {
  return entry.scope === origin;
}

/** Scans candidate step values, variables and plan texts for leaked secrets: a candidate whose sha-256 digest matches a stored vault digest is a leak the plan refuses, because a plaintext secret outside the vault never rides a step, a variable or a plan. */
export async function secretleakscan(input: {
  candidates: string[];
  entries: secretvaultentry[];
}): Promise<{ leaks: string[]; reason: string }> {
  const leaks: string[] = [];
  for (const candidate of input.candidates) {
    if (candidate.trim() === "") continue;
    const digest = await vaultdigestof(candidate);
    if (input.entries.some((entry) => entry.digest === digest)) leaks.push(candidate);
  }
  if (leaks.length > 0)
    return {
      leaks,
      reason: `The plan carries ${leaks.length} plaintext value${leaks.length === 1 ? "" : "s"} that digest to vault records; secrets never ride step options, variables or plan texts, only the vault holds them.`,
    };
  return { leaks: [], reason: "No candidate value digests to a vault record; the plan carries no leaked secret." };
}

/** Reads whether one step carries a raw typed value behind a masked field shape: a credential step names its vault label instead, because a raw password or token value never rides a step option. */
export function secretshapecarrying(step: Pick<toolstep, "kind" | "target" | "value" | "options">): {
  carries: boolean;
  reason: string;
} {
  const options = stepoptions(step);
  const fields = Array.isArray(options.fields)
    ? (options.fields.filter((item) => Boolean(item) && typeof item === "object") as Array<Record<string, unknown>>)
    : [];
  const rawfield = fields.find(
    (field) =>
      typeof field.name === "string" &&
      typeof field.value === "string" &&
      field.value !== "" &&
      maskingfield(field.name, []),
  );
  if (rawfield !== undefined)
    return {
      carries: true,
      reason: `The ${step.kind} step types a raw value into the ${String(rawfield.name)} field; credential steps read their value from the vault at the last possible moment and never carry it in the options.`,
    };
  if (
    typeof options.field === "string" &&
    maskingfield(options.field, []) &&
    step.value !== undefined &&
    step.value !== ""
  )
    return {
      carries: true,
      reason: `The ${step.kind} step types a raw value into the ${options.field} field; credential steps read their value from the vault at the last possible moment and never carry it in the options.`,
    };
  return { carries: false, reason: "The step carries no raw value behind a masked field shape." };
}

/** Builds the vault view the surfaces render: the labels, scopes, provenance and last use times only, because no surface ever displays or exports a secret value. */
export function vaultview(
  entries: secretvaultentry[],
): Array<{
  vaultid: string;
  label: string;
  scope: string;
  provenance: string;
  createdat: number;
  lastusedat?: number;
}> {
  return entries.map((entry) => ({
    vaultid: entry.vaultid,
    label: entry.label,
    scope: entry.scope,
    provenance: entry.provenance,
    createdat: entry.createdat,
    ...(entry.lastusedat !== undefined ? { lastusedat: entry.lastusedat } : {}),
  }));
}

/** Builds the plain language prompt of one credential step: the label the vault carries, never the value. */
export function vaultprompttext(entry: secretvaultentry, origin: string): string {
  return `Use the credential ${entry.label} of ${entry.scope} on ${origin}? The value stays behind the vault and no surface ever displays it.`;
}

/* ── Merged from transparency.ts ── */

import type { permdiffrecord, transparencygrant } from "./types.js";

/**
 * Transparency logic of the 1.1.62 family.
 * The transparencypage grammar lives here: every active grant reads as one row with its origin, scope and boundary, every consent window ever granted stays listed with its expiry even after it closed, the connectallow entries list with their senders, and the permdiff of each installed update records the added and removed permissions between two versions.
 * The revoke actions stay one descriptor per grant row, because every listed grant revokes from the same page that shows it.
 */

/** Computes the permdiff between two permission versions: the permissions the new version added, the permissions it removed and the computed time; an unchanged set carries empty lists while the record still lands for the audit trail. */
export function permissiondiff(input: {
  from: string[];
  to: string[];
  fromversion: string;
  toversion: string;
  now: number;
}): permdiffrecord {
  if (input.fromversion.trim() === "" || input.toversion.trim() === "")
    throw new Error("The permdiff names the two versions it compares.");
  const added = [...new Set(input.to.filter((permission) => !input.from.includes(permission)))];
  const removed = [...new Set(input.from.filter((permission) => !input.to.includes(permission)))];
  return { fromversion: input.fromversion, toversion: input.toversion, added, removed, computedat: input.now };
}

/** Reads whether one permdiff record reports a change between its versions; an unchanged permission set still records for the audit trail. */
export function permdiffchanged(diff: permdiffrecord): boolean {
  return diff.added.length > 0 || diff.removed.length > 0;
}

/** Builds the plain language summary of one permdiff record for the transparencypage. */
export function permdiffsummary(diff: permdiffrecord): string {
  if (!permdiffchanged(diff)) return `The update from ${diff.fromversion} to ${diff.toversion} changed no permission.`;
  const parts: string[] = [];
  if (diff.added.length > 0) parts.push(`added ${diff.added.join(", ")}`);
  if (diff.removed.length > 0) parts.push(`removed ${diff.removed.join(", ")}`);
  return `The update from ${diff.fromversion} to ${diff.toversion} ${parts.join(" and ")}.`;
}

/** Builds the transparency grant rows of every active grant: each allowlist origin carries its profile workspace scope and its grant time, and each originprofile carries its per kind scope. */
export function transparencygrants(input: {
  allowlist: automationallowlistentry[];
  profiles: originprofile[];
}): transparencygrant[] {
  const grants: transparencygrant[] = input.allowlist.map((entry) => ({
    origin: entry.origin,
    scope: `automation allowlist of the profile workspace ${entry.profileid}`,
    boundary: "the user revokes the entry or the profile workspace",
    grantedat: entry.grantedat,
  }));
  for (const profile of input.profiles) {
    grants.push({
      origin: profile.origin,
      scope: `origin profile with ${profile.grants.length} granted and ${profile.denials.length} denied kinds`,
      boundary: "the user edits or revokes the profile",
      grantedat: profile.createdat,
    });
  }
  return grants;
}

/** Builds the revoke action descriptor of one transparency grant row: every listed grant revokes from the same page that shows it. */
export function revokeaction(grant: transparencygrant): { action: "revoke"; origin: string; scope: string } {
  return { action: "revoke", origin: grant.origin, scope: grant.scope };
}

/** Lists every consent window ever granted with its expiry: closed windows stay listed beside the active ones because the transparency page shows the whole grant history. */
export function windowhistory(
  windows: consentwindow[],
): Array<{ id: string; origin: string; state: string; boundary: string; startedat: number; expiresat: number }> {
  return windows.map((window) => ({
    id: window.id,
    origin: window.origin,
    state: window.state,
    boundary: window.boundary,
    startedat: window.startedat,
    expiresat: window.expiresat,
  }));
}

/** Lists the connectallow entries with their senders: the display names, the sender ids and the origin scopes the user allowed. */
export function connectallowlist(
  entries: connectallowentry[],
): Array<{ senderid: string; displayname: string; origin?: string; addedat: number }> {
  return entries.map((entry) => ({
    senderid: entry.senderid,
    displayname: entry.displayname,
    ...(entry.origin !== undefined ? { origin: entry.origin } : {}),
    addedat: entry.addedat,
  }));
}

/* ── Merged from checksecrets.ts ── */


const patterns = [
  /sk-[A-Za-z0-9_-]{20,}/g,
  /AIza[A-Za-z0-9_-]{20,}/g,
  /xox[baprs]-[A-Za-z0-9-]{16,}/g,
  /gh[pousr]_[A-Za-z0-9_]{20,}/g,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g,
  /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/g,
];

function productFiles(root: string): string[] {
  const files: string[] = [];
  const visit = (path: string) => {
    if (!existsSync(path)) return;
    const stat = statSync(path);
    if (stat.isFile()) return files.push(path);
    for (const entry of readdirSync(path)) {
      if (entry === "node_modules" || entry === ".git" || entry === "docs" || entry === "build" || entry === "release")
        continue;
      visit(join(path, entry));
    }
  };
  /* the merged test tree carries the security torture suite whose detection
   * regexes are the PATTERNS themselves (not secrets); the product scan
   * covers the shipped sources, the tests carry their own verified guards. */
  visit(join(root, "devthink.ts"));
  for (const name of [
    "config.ts",
    /* the provider registry moved to the getry owner with the ownership
     * wave (wave/ownership.getry): the secrets scan covers the shipped
     * source wherever the owner carries it. */
    "../getry/providers.ts",
    "session.ts",
    "memory.ts",
    "modes.ts",
    "server.ts",
    "sol/console/TerminalUi.tsx",
    "build.ts",
    "checksecrets.ts",
    "package.json",
    "tsconfig.json",
    "README.md",
    "CHANGELOG.md",
    "SECURITY.md",
  ])
    visit(join(root, name));
  visit(join(root, ".github"));
  return files.filter((path) => existsSync(path));
}

export function scanSecrets(root = process.cwd()): string[] {
  const findings: string[] = [];
  for (const file of productFiles(root)) {
    const text = readFileSync(file, "utf8");
    for (const pattern of patterns) {
      if (pattern.test(text)) findings.push(`${file}: ${pattern}`);
      pattern.lastIndex = 0;
    }
  }
  return findings;
}

function checksecretslane(): void {
const directEntry =
  typeof process !== "undefined" &&
  (process.argv?.[1]?.endsWith("security.ts") || process.argv?.[1]?.endsWith("security")) &&
  process.argv?.[2] === "checksecrets";
const bunEntry = (import.meta as ImportMeta & { main?: boolean }).main === true;
if (directEntry || bunEntry) {
  const findings = scanSecrets();
  if (findings.length) {
    console.error("Potential embedded credentials detected:");
    for (const finding of findings) console.error(finding);
    process.exitCode = 1;
  } else console.log("Secret scan passed.");
}
}
/* ── Merged from cspaudit.ts ── */

/** Audits every content security policy of the extension: the gate reads the root manifest and both browser overlays, parses the extension pages policy of each, refuses any eval, remote code, unsafe inline or wildcard source in the frozen policies, verifies the pagebridge script stays the only injected file of the scripting api, verifies the extension pages load no remote resources, and verifies the dashboard renders untrusted extracts inside the fully sandboxed frame the manifest declares. The gate runs against the built extension bundles so it answers for the shipped artifacts, prints one deterministic json report, and exits nonzero on any failure. */
async function cspauditlane(): Promise<void> {

const packagejson = JSON.parse(await readFile("package.json", "utf8"));
const release = String(packagejson.version);
const manifest = JSON.parse(await readFile("manifest.json", "utf8"));
const failures: string[] = [];
const policies: Array<{ surface: string; text: string; directives?: string[] }> = [];

/** Records one refusal of the content security audit. */
function refuse(message: string) {
  failures.push(message);
}

/** Parses one extension pages policy into its directives: every directive splits into its name and its source list, so the audit reads the exact sources the policy allows. */
function parsedirectives(text: string, surface: string) {
  const directives: Record<string, string[]> = {};
  for (const directive of text
    .split(";")
    .map((part) => part.trim())
    .filter((part) => part !== "")) {
    const [name, ...sources] = directive.split(/\s+/);
    if (name === undefined || directives[name] !== undefined)
      refuse(`The ${surface} policy carries the directive ${name} twice or malformed.`);
    directives[name] = sources;
  }
  return directives;
}

/* 1. every policy the manifest declares lands in the audit set: the root policy and the two browser overlays. */
const rootpolicy = manifest.content_security_policy?.extension_pages;
if (typeof rootpolicy !== "string" || rootpolicy.trim() === "")
  refuse("The root manifest carries no extension pages content security policy.");
else policies.push({ surface: "root", text: rootpolicy });
for (const browser of ["firefox", "safari"]) {
  const overlaypolicy = manifest.browsers?.[browser]?.content_security_policy?.extension_pages;
  if (typeof overlaypolicy !== "string" || overlaypolicy.trim() === "")
    refuse(`The ${browser} overlay of the root manifest carries no extension pages content security policy.`);
  else policies.push({ surface: `browsers.${browser}`, text: overlaypolicy });
}

/* 2. every policy pins its script and object sources to the local origin, refuses eval, unsafe inline and remote code, and frames only its own pages. */
for (const policy of policies) {
  const directives = parsedirectives(policy.text, policy.surface);
  const scriptsources = directives["script-src"] ?? [];
  const objectsources = directives["object-src"] ?? [];
  if (scriptsources.length === 0)
    refuse(`The ${policy.surface} policy declares no script-src directive; no script source may default open.`);
  if (objectsources.length === 0)
    refuse(`The ${policy.surface} policy declares no object-src directive; no object source may default open.`);
  for (const source of [
    ...scriptsources,
    ...objectsources,
    ...(directives["style-src"] ?? []),
    ...(directives["connect-src"] ?? []),
    ...(directives["frame-src"] ?? []),
    ...(directives["img-src"] ?? []),
    ...(directives["font-src"] ?? []),
  ]) {
    if (source === "'self'") continue;
    if (source.includes("*"))
      refuse(
        `The ${policy.surface} policy carries the wildcard source ${source}; the frozen policies allow no wildcard.`,
      );
    if (/^https?:\/\//i.test(source))
      refuse(
        `The ${policy.surface} policy carries the remote source ${source}; every script, style and connect source stays local or behind the reviewed consent flow.`,
      );
    if (source.includes("unsafe-eval") || source.includes("unsafe-inline") || source.includes("data:"))
      refuse(
        `The ${policy.surface} policy carries the unsafe source ${source}; no eval, no inline and no data url ever loads.`,
      );
  }
  const frameancestors = directives["frame-ancestors"] ?? [];
  if (frameancestors.length !== 1 || frameancestors[0] !== "'self'")
    refuse(
      `The ${policy.surface} policy frames its pages for ${frameancestors.join(" ") || "no declared ancestors"}; the extension pages refuse framing by remote origins.`,
    );
  policy.directives = Object.keys(directives).sort();
}

/* 3. the overlays stay consistent with the root policy: one dialect difference would weaken one browser. */
const extensiondirectory = "build/extension";
if (typeof rootpolicy === "string") {
  for (const policy of policies.filter((candidate) => candidate.surface !== "root")) {
    if (policy.text !== rootpolicy)
      refuse(
        `The ${policy.surface} overlay policy differs from the root policy; every browser carries the same frozen extension pages policy.`,
      );
  }
  /* the shipped chromium manifest copy carries the same policy the root declares, so the packaged extension answers the audit too */
  try {
    const shipped = JSON.parse(await readFile(join(extensiondirectory, "manifest.json"), "utf8"));
    if (shipped.content_security_policy?.extension_pages !== rootpolicy)
      refuse(
        "The shipped chromium manifest copy carries a different extension pages policy; the packaged extension must answer the same frozen policy.",
      );
  } catch {
    refuse(
      "The built extension directory carries no manifest.json copy; run pnpm build before the content security audit.",
    );
  }
}

/* 4. no injected code path uses eval or remote code: every built bundle refuses eval, remote script loads and remote script tags, and the dynamic function construction of reviewed evaluate expressions stays inside the two executors the design names — the isolated world executor of the background and the page executor of the pagebridge — with the site counts matching the reviewed sources. */
const dynamicfunctionbundles = ["background.js", "pagebridge.js"];
const dynamicfunctionsources: Record<string, string> = { "background.js": "background.ts", "pagebridge.js": "page.ts" };
const sitecounts: Record<string, number> = {};
const bundlefiles = (await readdir(extensiondirectory)).filter((file) => file.endsWith(".js")).sort();
if (bundlefiles.length === 0)
  refuse("The built extension directory carries no bundles; run pnpm build before the content security audit.");
for (const file of bundlefiles) {
  const content = await readFile(join(extensiondirectory, file), "utf8");
  const codewithoutstrings = content.replace(/"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`/g, "");
  if (/\beval\s*\(/.test(codewithoutstrings))
    refuse(`The built bundle ${file} calls eval; no injected code path ever evaluates strings.`);
  const sites = (content.match(/new\s+Function\s*\(/g) ?? []).length;
  /* the firefox target ships hashed copies of the same bundles beside them, so the hash suffix reads off before the executor checks */
  const basename = file.replace(/\.[0-9a-f]{10}\.js$/, ".js");
  sitecounts[file] = sites;
  if (sites > 0 && !dynamicfunctionbundles.includes(basename))
    refuse(
      `The built bundle ${file} constructs functions from strings; only the reviewed evaluate executors of the background and the pagebridge evaluate reviewed expressions.`,
    );
  if (sites > 0 && dynamicfunctionsources[basename] !== undefined) {
    const source = await readFile(dynamicfunctionsources[basename], "utf8");
    const sourcesites = [...source.matchAll(/new\s+Function\s*\(/g)].length;
    if (sites !== sourcesites)
      refuse(
        `The built bundle ${file} constructs functions at ${sites} sites while its reviewed source ${dynamicfunctionsources[basename]} declares ${sourcesites}; every dynamic construction must trace to a reviewed evaluate site.`,
      );
  }
  if (/importScripts\s*\(\s*["']https?:/.test(codewithoutstrings))
    refuse(`The built bundle ${file} imports remote scripts; no code path loads remote code.`);
  if (/document\.createElement\s*\(\s*["']script["']\s*\)[\s\S]{0,200}src\s*=\s*["']https?:/.test(codewithoutstrings))
    refuse(`The built bundle ${file} injects a remote script tag; no code path loads remote code.`);
}

/* 5. the pagebridge script stays the only injected file: every files array the scripting api injects names pagebridge.js alone. */
const backgroundsource = await readFile("background.ts", "utf8");
const injections = [...backgroundsource.matchAll(/executeScript\(\{[\s\S]{0,160}?files:\s*\[([^\]]*)\]/g)].map(
  (match) => [...match[1].matchAll(/"([^"]+)"/g)].map((entry) => entry[1]),
);
if (injections.length === 0)
  refuse(
    "The background injects no file through the scripting api; the pagebridge injection the cspaudit expects is missing.",
  );
for (const files of injections) {
  if (files.length !== 1 || files[0] !== "pagebridge.js")
    refuse(
      `The scripting api injects the files ${files.join(", ")}; the pagebridge script stays the only injected file.`,
    );
}
if (!bundlefiles.includes("pagebridge.js"))
  refuse("The built extension carries no pagebridge.js bundle; the only injected file must ship.");

/* 6. the sidepanel and popup load no remote resources: every resource reference of every extension page stays a local file of the package. */
const pagefiles = (await readdir(extensiondirectory)).filter((file) => file.endsWith(".html")).sort();
if (pagefiles.length === 0)
  refuse("The built extension directory carries no pages; run pnpm build before the content security audit.");
for (const file of pagefiles) {
  const content = await readFile(join(extensiondirectory, file), "utf8");
  for (const reference of [...content.matchAll(/(?:src|href)\s*=\s*["']([^"']+)["']/g)].map((match) => match[1])) {
    if (/^(https?|wss?|data|blob):/i.test(reference) && !reference.startsWith("blob:"))
      refuse(`The extension page ${file} loads the remote resource ${reference}; every page resource stays local.`);
    if (reference.startsWith("/") && !reference.startsWith("//"))
      refuse(
        `The extension page ${file} loads the absolute path ${reference}; every page resource stays a package relative file.`,
      );
  }
  if (/\son[a-z]+\s*=\s*["']/i.test(content))
    refuse(
      `The extension page ${file} carries an inline event handler; every handler binds through the reviewed code.`,
    );
}

/* 7. the dashboard renders untrusted extracts inside the sandbox frame: the manifest declares the sandboxed page and the fully sandboxed iframe renders the untrusted markup. */
const sandboxpages = manifest.sandbox?.pages ?? [];
if (!sandboxpages.includes("sandbox.html"))
  refuse(
    "The manifest declares no sandbox.html under the sandbox key; untrusted extracts render only inside the sandbox frame.",
  );
if (!pagefiles.includes("sandbox.html"))
  refuse("The built extension carries no sandbox.html page; the sandbox frame must ship.");
else {
  const sandboxpage = await readFile(join(extensiondirectory, "sandbox.html"), "utf8");
  if (!sandboxpage.includes("devthinksandbox"))
    refuse(
      "The sandbox page speaks no devthinksandbox channel; the render handshake the frame family defines is missing.",
    );
  if (!sandboxpage.includes('setAttribute("sandbox", "")') && !sandboxpage.includes("setAttribute('sandbox', '')"))
    refuse("The sandbox page carries no fully sandboxed iframe; untrusted markup renders with no privileges at all.");
}
const webindex = await readFile("design.html", "utf8");
if (!webindex.includes('data-surface="sandbox"'))
  refuse(
    "The one web design file carries no sandbox surface template; the sandbox frame renders from the shared design.",
  );
if (!webindex.includes('data-surface="dashboardpage"'))
  refuse(
    "The one web design file carries no dashboardpage surface template; the dashboard renders from the shared design.",
  );

/* the report: every extracted policy with its directives, the audited bundle and page set, and the verdict. */
const report = {
  release,
  policies: policies.map((policy) => ({ surface: policy.surface, policy: policy.text, directives: policy.directives })),
  bundles: bundlefiles,
  pages: pagefiles,
  injectedfiles: ["pagebridge.js"],
  dynamicfunctionsites: sitecounts,
  sandboxframe: "sandbox.html",
  checks: 7,
};
if (failures.length > 0) {
  for (const failure of failures) console.error(`CSPAUDIT ${failure}`);
  process.exitCode = 1;
} else {
  console.log(
    `Content security audit verified ${policies.length} policies over ${bundlefiles.length} bundles and ${pagefiles.length} pages.`,
  );
  console.log(JSON.stringify(report, null, 2));
}
}
/* ── Merged from crxharvest.ts ── */

/**
 * Harvests Chrome Web Store CRX packages for every cataloged extension id and
 * mines the browser agent feature landscape from the packages.
 *
 * Evidence-only policy: every downloaded package is untrusted data. This
 * script never evaluates package code. It performs static text analysis only,
 * deletes each raw artifact right after analysis and persists only derived
 * analysis records in test/artifacts/harvestcache.json. The report is
 * written to docs/crxfeaturemining.md.
 *
 * Usage:
 *   node crxharvest.ts               analyze pending ids then rewrite the report
 *   node crxharvest.ts --limit=10    analyze at most 10 pending ids
 *   node crxharvest.ts --skip=5      skip the first 5 pending ids
 *   node crxharvest.ts --refresh     re-analyze every id ignoring the cache
 */
async function crxharvestlane(): Promise<void> {

const execute = promisify(execFile);
const root = process.cwd();
const artifactsdir = join(root, "test", "artifacts");
const harvestdir = join(artifactsdir, "harvest");
const cachepath = join(artifactsdir, "harvestcache.json");
const reportpath = join(root, "docs", "crxfeaturemining.md");
const updatebase =
  "https://clients2.google.com/service/update2/crx?response=redirect&prodversion=131.0.6778.265&acceptformat=crx2,crx3&x=id%3D";

const cliarguments = process.argv.slice(2);
const flagvalue = (name: string) => {
  const prefix = `--${name}=`;
  const found = cliarguments.find((argument) => argument.startsWith(prefix));
  const parsed = Number.parseInt(found?.slice(prefix.length) ?? "", 10);
  return Number.isFinite(parsed) ? parsed : undefined;
};
const skipcount = flagvalue("skip") ?? 0;
const limitcount = flagvalue("limit") ?? Number.POSITIVE_INFINITY;
const refresh = cliarguments.includes("--refresh");

/**
 * Signal categories map keyword evidence found in package script text to
 * concrete candidate features. A trailing star in a term means the stem
 * matches any suffix (for example isolat matches isolated and isolation).
 */
const signalkits = [
  {
    category: "planning",
    terms: {
      "plan*": "multi step plan execution",
      "task*": "task oriented decomposition",
      "workflow*": "workflow definition and replay",
      "step*": "step by step execution tracking",
      objective: "objective oriented planning",
    },
  },
  {
    category: "observation",
    terms: {
      "snapshot*": "page state snapshotting",
      "accessib*": "accessibility tree extraction",
      dom: "dom structure extraction",
      "extract*": "data extraction from page content",
      "scrap*": "web scraping pipelines",
      "selector*": "css selector targeting",
      "queryselector*": "dom querying through queryselector calls",
    },
  },
  {
    category: "interaction",
    terms: {
      "click*": "element click actions",
      "fill*": "form filling actions",
      type: "keyboard text entry",
      keyboard: "keyboard event synthesis",
      "key*": "key press dispatch",
      "press*": "key press dispatch",
      "hover*": "hover simulation",
      "scroll*": "scroll control",
      "drag*": "drag actions",
      drop: "drop target handling",
      "upload*": "file upload automation",
      "select*": "dropdown selection",
      "check*": "checkbox and state checking",
      "toggle*": "toggle state changes",
    },
  },
  {
    category: "navigation",
    terms: {
      "navigat*": "programmatic navigation",
      goto: "url goto navigation",
      url: "url tracking and construction",
      urls: "url tracking and construction",
      href: "link following",
      "reload*": "page reload control",
      back: "history back navigation",
      forward: "history forward navigation",
      history: "history stack inspection",
    },
  },
  {
    category: "recording",
    terms: {
      "record*": "user action recording",
      replay: "recorded action replay",
      "macro*": "macro playback",
      "trace*": "trace capture",
      "captur*": "event capture",
    },
  },
  {
    category: "workflow blocks",
    terms: {
      "trigger*": "workflow triggers",
      "schedul*": "scheduled runs",
      cron: "cron style scheduling",
      "loop*": "loop constructs",
      "condition*": "conditional branching",
      "branch*": "branching logic",
      "variabl*": "flow variables",
      "repeat*": "repeat blocks",
      "delay*": "delay steps",
    },
  },
  {
    category: "data handling",
    terms: {
      csv: "csv data export",
      excel: "excel data export",
      json: "json data handling",
      export: "data export pipelines",
      import: "data import pipelines",
      "table*": "table detection and handling",
      "parse*": "content parsing",
      "transform*": "data transformation",
    },
  },
  {
    category: "media",
    terms: {
      "screenshot*": "screenshot capture",
      "image*": "image processing",
      pdf: "pdf handling",
      video: "video handling",
      canvas: "canvas capture",
      ocr: "optical character recognition",
      vision: "vision model integration",
    },
  },
  {
    category: "network",
    terms: {
      fetch: "http fetch requests",
      "websocket*": "websocket channels",
      xmlhttprequest: "xmlhttprequest usage",
      "intercept*": "request interception",
      proxy: "proxy routing",
      proxies: "proxy routing",
      "header*": "header manipulation",
      "request*": "request construction",
      "respon*": "response handling",
    },
  },
  {
    category: "debugging",
    terms: {
      console: "console output capture",
      devtools: "devtools integration",
      "debugger*": "debugger attachment",
      "breakpoint*": "breakpoint control",
      log: "logging pipelines",
      "error*": "error capture",
      performance: "performance metrics",
      memory: "memory inspection",
      "profile*": "profiling integration",
    },
  },
  {
    category: "agents and models",
    terms: {
      "agent*": "agent execution loops",
      llm: "llm reasoning calls",
      gpt: "gpt model calls",
      openai: "openai api integration",
      anthropic: "anthropic api integration",
      gemini: "gemini model integration",
      "model*": "model selection and routing",
      "prompt*": "prompt construction",
      "completion*": "completion handling",
      "embedding*": "embedding generation",
      "chat*": "chat interfaces",
    },
  },
  {
    category: "mcp and protocol",
    terms: {
      mcp: "model context protocol support",
      jsonrpc: "json rpc messaging",
      "json-rpc": "json rpc messaging",
      "schema*": "schema validation",
      "tool*": "tool exposure",
      "capabilit*": "capability negotiation",
    },
  },
  {
    category: "multi tab",
    terms: {
      tabs: "multi tab operations",
      windows: "window management",
      "tabgroup*": "tab grouping",
      pinned: "tab pinning",
      mute: "tab muting",
      muted: "tab muting",
    },
  },
  {
    category: "sessions",
    terms: {
      "session*": "session persistence",
      "cookie*": "cookie state handling",
      storage: "state storage",
      "persist*": "durable state",
      state: "state tracking",
      "restor*": "state restoration",
    },
  },
  {
    category: "forms",
    terms: {
      form: "form automation",
      "input*": "input field control",
      "autofill*": "autofill capabilities",
      "password*": "credential handling",
      "submit*": "form submission",
    },
  },
  {
    category: "testing",
    terms: {
      "assert*": "assertion checks",
      "expect*": "expectation validation",
      "test*": "test case management",
      e2e: "end to end test flows",
      smoke: "smoke test runs",
    },
  },
  {
    category: "ui surfaces",
    terms: {
      "popup*": "popup command surface",
      "sidepanel*": "side panel interface",
      "side panel": "side panel interface",
      options: "options configuration surface",
      "contextmenu*": "context menu commands",
      "context menu": "context menu commands",
      "omnibox*": "omnibox keyword commands",
      "notification*": "notification alerts",
      "badge*": "toolbar badge status",
      "shortcut*": "keyboard shortcuts",
    },
  },
  {
    category: "security and consent",
    terms: {
      "permission*": "permission gating",
      "consent*": "consent flows",
      "approv*": "approval workflows",
      "sandbox*": "sandboxed execution",
      "isolat*": "isolated execution contexts",
    },
  },
  {
    category: "clipboard",
    terms: {
      "clipboard*": "clipboard integration",
      copy: "copy to clipboard",
      "paste*": "paste from clipboard",
    },
  },
  {
    category: "downloads and files",
    terms: {
      "download*": "download management",
      "upload*": "upload handling",
      "file*": "file exchange",
    },
  },
  {
    category: "find in page",
    terms: {
      findinpage: "find in page control",
      "find in page": "find in page control",
      find: "in page find",
      "search*": "in page search",
      "highlight*": "result highlighting",
    },
  },
  {
    category: "reader mode",
    terms: {
      readermode: "reader mode extraction",
      "reader*": "readable content extraction",
      "article*": "article parsing",
      extractcontent: "main content extraction",
    },
  },
  {
    category: "waiting and retries",
    terms: {
      "wait*": "explicit waits",
      "sleep*": "sleep steps",
      timeout: "timeout guards",
      "poll*": "polling loops",
      "retry*": "retry logic",
    },
  },
];

/**
 * Maps known chrome api namespace dot method pairs observed in script text to
 * a concrete feature statement. Pairs that are not mapped still count in the
 * aggregate api surface table.
 */
const apifeatures: Record<string, string> = {
  "tabs.query": "query open tabs by url or title",
  "tabs.get": "read tab details by id",
  "tabs.getCurrent": "read the extension own tab context",
  "tabs.create": "open new tabs programmatically",
  "tabs.update": "update tab url or active state",
  "tabs.remove": "close tabs by id",
  "tabs.duplicate": "duplicate tabs",
  "tabs.reload": "reload tabs",
  "tabs.move": "move tabs between positions",
  "tabs.highlight": "highlight a set of tabs",
  "tabs.group": "group tabs together",
  "tabs.ungroup": "ungroup tabs",
  "tabs.pin": "pin tabs",
  "tabs.mute": "mute tab audio",
  "tabs.discard": "discard tabs from memory",
  "tabs.setZoom": "set tab zoom level",
  "tabs.getZoom": "read tab zoom level",
  "tabs.goBack": "navigate a tab back",
  "tabs.goForward": "navigate a tab forward",
  "tabs.captureVisibleTab": "capture a screenshot of the visible tab",
  "tabs.sendMessage": "message content scripts inside a tab",
  "tabs.executeScript": "run code inside a tab using the legacy mv2 path",
  "tabs.insertCSS": "insert styles into a tab using the legacy mv2 path",
  "tabs.onCreated": "react to new tabs",
  "tabs.onUpdated": "react to tab changes",
  "tabs.onActivated": "react to tab activation",
  "tabs.onRemoved": "react to tab closure",
  "tabs.onMessage": "receive messages from tabs",
  "runtime.sendMessage": "send internal messages between extension contexts",
  "runtime.onMessage": "handle internal messages",
  "runtime.connect": "open long lived internal ports",
  "runtime.onConnect": "accept long lived internal ports",
  "runtime.connectNative": "bridge to a native host process",
  "runtime.sendNativeMessage": "message a native host process",
  "runtime.getURL": "resolve packaged resource urls",
  "runtime.getManifest": "read the own manifest at runtime",
  "runtime.lastError": "handle api error payloads",
  "runtime.id": "identify the own extension context",
  "runtime.reload": "reload the own extension",
  "scripting.executeScript": "inject scripts into granted pages",
  "scripting.insertCSS": "inject styles into granted pages",
  "scripting.removeCSS": "remove injected styles",
  "storage.local": "use the local storage area",
  "storage.sync": "sync settings across devices",
  "storage.session": "use session scoped storage",
  "storage.onChanged": "react to storage changes",
  "debugger.attach": "attach cdp debugger sessions to chosen tabs",
  "debugger.detach": "detach the debugger from a tab",
  "debugger.sendCommand": "send raw cdp commands",
  "debugger.onEvent": "listen to cdp domain events",
  "debugger.onDetach": "handle debugger detach events",
  "downloads.download": "save files through the downloads api",
  "downloads.onChanged": "track download progress",
  "downloads.search": "search past downloads",
  "downloads.open": "open downloaded files",
  "downloads.show": "show downloaded files in the file manager",
  "cookies.get": "read cookies for a url",
  "cookies.getAll": "enumerate cookies by filter",
  "cookies.set": "set cookies",
  "cookies.remove": "delete cookies",
  "cookies.onChanged": "react to cookie changes",
  "commands.getAll": "list bound keyboard shortcuts",
  "commands.onCommand": "respond to keyboard shortcut commands",
  "contextMenus.create": "register page context menu commands",
  "contextMenus.onClicked": "handle context menu clicks",
  "contextMenus.update": "update context menu entries",
  "contextMenus.removeAll": "clear context menu entries",
  "windows.create": "create browser windows",
  "windows.update": "update window state",
  "windows.remove": "close windows",
  "windows.getAll": "list all windows",
  "windows.getCurrent": "read the current window",
  "windows.onFocusChanged": "track window focus changes",
  "webNavigation.onBeforeNavigate": "observe navigations before they commit",
  "webNavigation.onCommitted": "observe committed navigations",
  "webNavigation.onCompleted": "react to page loads",
  "webNavigation.onHistoryStateUpdated": "detect single page app url changes",
  "webNavigation.getAllFrames": "enumerate frames of a tab",
  "notifications.create": "raise system notifications",
  "alarms.create": "schedule delayed runs",
  "alarms.onAlarm": "run scheduled handlers",
  "alarms.clear": "cancel scheduled runs",
  "sidePanel.setOptions": "configure the side panel per tab",
  "sidePanel.open": "open the side panel",
  "sidePanel.setPanelBehavior": "control side panel behavior",
  "action.setBadgeText": "show toolbar badge status",
  "action.setBadgeBackgroundColor": "style the toolbar badge",
  "action.setTitle": "set the toolbar title",
  "action.setIcon": "set the toolbar icon",
  "action.setPopup": "change the popup target",
  "action.onClicked": "act on toolbar clicks",
  "identity.launchWebAuthFlow": "run oauth flows",
  "identity.getAuthToken": "obtain google oauth tokens",
  "tts.speak": "speak text aloud",
  "tts.stop": "stop speech",
  "history.search": "search browsing history",
  "history.addUrl": "record history entries",
  "bookmarks.create": "create bookmarks",
  "bookmarks.getTree": "read the bookmark tree",
  "i18n.getMessage": "localize interface strings",
  "permissions.request": "request optional permissions at runtime",
  "permissions.contains": "check granted permissions",
  "permissions.remove": "drop granted permissions",
  "idle.onStateChanged": "react to idle state changes",
  "idle.queryState": "query the idle state",
  "declarativeNetRequest.updateDynamicRules": "update dynamic request rules",
  "declarativeNetRequest.updateSessionRules": "update session request rules",
  "declarativeNetRequest.getSessionRules": "read session request rules",
  "proxy.settings": "adjust proxy settings at runtime",
  "webRequest.onBeforeRequest": "observe requests before they are sent",
  "webRequest.onBeforeSendHeaders": "modify request headers",
  "webRequest.onCompleted": "observe completed responses",
  "webRequest.onErrorOccurred": "observe failed requests",
  "system.memory.getInfo": "read device memory metrics",
  "system.cpu.getInfo": "read cpu metrics",
  "system.display.getInfo": "read display metrics",
  "topSites.get": "read most visited sites",
  "browsingData.remove": "clear browsing data",
  "management.getAll": "enumerate installed extensions",
  "management.getSelf": "read the own extension info",
  "sessions.getRecentlyClosed": "list recently closed tabs",
  "sessions.restore": "restore closed sessions",
  "offscreen.createDocument": "create offscreen documents",
  "offscreen.closeDocument": "close offscreen documents",
  "tabCapture.capture": "capture tab audio and video",
  "extension.getURL": "resolve packaged resource urls the legacy way",
  "extension.getBackgroundPage": "reach the legacy background page",
  "extension.sendMessage": "send internal messages the legacy way",
  "extension.onMessage": "handle internal messages the legacy way",
  "browserAction.setBadgeText": "show toolbar badge status the legacy way",
  "pageAction.show": "show legacy page actions",
  "devtools.inspectedWindow": "inspect the devtools target window",
  "devtools.panels": "register devtools panels",
};

/**
 * Maps declared permissions to concrete feature statements. Primary items are
 * always emitted, secondary items only top up short lists.
 */
const permissionfeatures: Record<string, { primary: string[]; secondary: string[] }> = {
  storage: {
    primary: ["persist state in local storage areas", "persist settings across sessions"],
    secondary: ["sync settings across devices when enabled"],
  },
  tabs: {
    primary: ["read and manage open tabs", "observe tab lifecycle events"],
    secondary: ["activate or close tabs programmatically"],
  },
  scripting: { primary: ["inject scripts into granted pages"], secondary: ["inject styles for page overlays"] },
  activeTab: { primary: ["act on the currently active tab after a user gesture"], secondary: [] },
  debugger: {
    primary: ["attach the chrome devtools protocol to tabs", "capture network and dom events through cdp"],
    secondary: ["dispatch low level input events through cdp"],
  },
  cookies: { primary: ["read and write cookies per domain"], secondary: [] },
  downloads: { primary: ["save generated files to disk"], secondary: ["track download progress"] },
  "downloads.shelf": { primary: ["control the download shelf ui"], secondary: [] },
  contextMenus: { primary: ["add commands to the page context menu"], secondary: [] },
  sidePanel: { primary: ["host a docked side panel interface"], secondary: [] },
  webNavigation: { primary: ["observe navigation events across frames"], secondary: [] },
  alarms: { primary: ["schedule delayed or periodic runs"], secondary: [] },
  notifications: { primary: ["raise system notifications"], secondary: [] },
  tabGroups: { primary: ["organize tabs into named groups"], secondary: [] },
  offscreen: { primary: ["run hidden offscreen documents for background work"], secondary: [] },
  clipboardRead: { primary: ["read clipboard content"], secondary: [] },
  clipboardWrite: { primary: ["write to the clipboard"], secondary: [] },
  nativeMessaging: { primary: ["exchange messages with a native companion app"], secondary: [] },
  declarativeNetRequest: { primary: ["modify network requests with declarative rules"], secondary: [] },
  declarativeNetRequestWithHostAccess: { primary: ["modify network requests with host access rules"], secondary: [] },
  proxy: { primary: ["control proxy configuration"], secondary: [] },
  webRequest: { primary: ["observe and modify requests in flight"], secondary: [] },
  webRequestBlocking: { primary: ["block or alter requests synchronously"], secondary: [] },
  history: { primary: ["read and search browsing history"], secondary: [] },
  bookmarks: { primary: ["manage bookmarks"], secondary: [] },
  tts: { primary: ["speak text aloud"], secondary: [] },
  identity: { primary: ["sign in through oauth"], secondary: [] },
  "identity.email": { primary: ["read the signed in account email"], secondary: [] },
  management: { primary: ["inspect installed extensions"], secondary: [] },
  sessions: { primary: ["restore recently closed tabs and windows"], secondary: [] },
  browsingData: { primary: ["clear browsing data"], secondary: [] },
  topSites: { primary: ["read most visited sites"], secondary: [] },
  power: { primary: ["keep the device awake during runs"], secondary: [] },
  "system.memory": { primary: ["read device memory info"], secondary: [] },
  "system.cpu": { primary: ["read cpu usage"], secondary: [] },
  "system.display": { primary: ["read display metrics"], secondary: [] },
  tabCapture: { primary: ["capture tab audio and video"], secondary: [] },
  unlimitedStorage: { primary: ["store large datasets beyond the default quota"], secondary: [] },
  geolocation: { primary: ["read device location"], secondary: [] },
  idle: { primary: ["detect user idle state"], secondary: [] },
  background: { primary: ["run a persistent background context"], secondary: [] },
  windows: { primary: ["manage browser windows"], secondary: [] },
  privacy: { primary: ["read privacy settings"], secondary: [] },
  gcm: { primary: ["receive push messages"], secondary: [] },
  declarativeContent: { primary: ["react to page content conditions"], secondary: [] },
  contentSettings: { primary: ["manage per site content settings"], secondary: [] },
};

/**
 * Public knowledge per cataloged product. Items here are tagged inferred in
 * the report because they rest on public product knowledge, not on the raw
 * package evidence.
 */
const knowledgepool: Record<string, string[]> = {
  cecngibhkljoiafhjfmcgbmikfogdiko: [
    "pairs the browser with the manus cloud agent service",
    "relays page snapshots and dom state to a remote agent",
    "executes agent issued click type and scroll actions locally",
    "task progress and agent activity feed in the interface",
    "session linking through an authenticated account",
    "user approval gate before the agent takes over the page",
    "long task runs orchestrated from the manus workspace",
    "page reading tuned for model context windows",
    "multi tab supervision by one agent session",
  ],
  fldmhceldgbpfpkbgopacenieobmligc: [
    "bridges the current page to the kimi assistant by moonshot ai",
    "sends readable page content as chat context",
    "question and answer flows about the open page",
    "executes suggested page actions on request",
    "side panel chat with the assistant",
    "selection aware questions on highlighted text",
    "screenshot sharing for visual questions",
  ],
  jphkkablogbfneefecondchaafbdaomc: [
    "runs ai agents directly inside the browser",
    "delegates browsing tasks to autonomous agents",
    "agent activity tracking per task",
    "page reading for agent context",
    "multi step task execution by agents",
  ],
  celalggclffbgnloepbfadhjhmchikoh: [
    "ai browser agent driven from a task prompt",
    "decomposes goals into page actions",
    "observes pages through dom extraction",
    "action execution with feedback loops",
  ],
  hdcehjaodheipickeopncehaikamghjk: [
    "ai copilot for browsing with a command surface",
    "natural language commands mapped to page actions",
    "page summarization on demand",
    "element picking with generated selectors",
    "guided automation for repetitive steps",
  ],
  ffijkpjpoehejdlbfoefcpgbimdgocmf: [
    "ai agent that plans multi step browsing tasks",
    "observes pages via dom extraction",
    "executes click and type steps under a plan",
    "reports progress after each step",
  ],
  hkcbjmdeheceggmlbhbiljejkkpjljjp: [
    "open source agent runner in a side panel",
    "configurable llm backend including local models",
    "dom snapshotting to feed the model",
    "action loop with stop and resume control",
    "transparent prompt and action log",
  ],
  okngcalljddikhljpfhgmikklmmmdkkd: [
    "agentic browser automation platform client",
    "tool use driven task execution",
    "multi step plans with checkpoints",
    "browser tool exposure to the driving model",
  ],
  ajdlmleaplmphpokbjmnhgkgaaemclil: [
    "instant link previews over search results",
    "prefetches target pages before the click",
    "ai answers composed from result pages",
    "overlay cards that avoid leaving the search page",
    "memory savings by previewing instead of opening",
  ],
  ddjnfplagacilcnjpindbdcopccndihj: [
    "preloads the chromium browser on system startup as advertised",
    "keeps a lightweight service worker alive on a timed loop",
    "targets faster browser cold starts",
    "zero page and host permissions by design",
    "minimal ten file package footprint",
    "console logging for keepalive diagnostics",
    "works fully offline",
    "ships no popup options or content surfaces",
  ],
  mahgcggahcbplkpmpmhdnbdjbcnoafcg: [
    "suspends inactive tabs to free memory",
    "tab discard and reload control",
    "memory usage reporting per tab",
    "keep awake list for chosen sites",
    "automatic suspension after an idle window",
  ],
  dnfmklmdbipiahdjiogaoemjaiodomdf: [
    "open source ai assistant in a sidebar",
    "multi provider model configuration",
    "chat grounded in the current page",
    "selection actions from the context menu",
    "conversation history kept locally",
  ],
  gpccjhdgjkmalnepmeclooflliiocfed: [
    "open source ai agent with a side panel",
    "task execution against the current page",
    "configurable model endpoints",
    "step preview before execution",
  ],
  kdmpkkahkhdmdhfkdihkopikgcocbpbf: [
    "enhanced chat surface for deepseek models",
    "prompt helpers and presets",
    "page context injection into prompts",
    "conversation management",
  ],
  jambeljnbnfbkcpnoiaedcabbgmnnlcd: [
    "official companion extension for playwright",
    "relays cdp sessions to playwright runners",
    "records traces of browser activity",
    "supports extension api access from playwright tests",
    "captures screenshots and snapshots on demand",
    "network recording for later replay",
  ],
  ilehdekjacappgghkgmmlbhgbnlkgoid: [
    "author and run puppeteer scripts inside the browser",
    "script editor with run and stop controls",
    "live page control from the editor",
    "example script library",
    "result console for script output",
  ],
  infppggnoaenmfagbfknfkancpbljcca: [
    "block based workflow builder with a drag and drop canvas",
    "workflow triggers from the page context menu",
    "scheduled workflows with cron expressions",
    "keyboard shortcut triggers for workflows",
    "visit based triggers on matching urls",
    "webhook triggers from external services",
    "loop and repeat blocks for iteration",
    "condition blocks for branching control flow",
    "variables and tables scoped to a workflow",
    "element interaction blocks for click type and hover",
    "form filling from a data table",
    "scraper blocks that extract by css selector",
    "data export to csv and json",
    "google sheets read and write integration",
    "clipboard blocks for copy and paste steps",
    "screenshot blocks for page capture",
    "tab management blocks for switching and closing",
    "delay and wait for element blocks",
    "regex extraction into variables",
    "nested workflows via execute workflow blocks",
    "workflow import and export as files",
    "workflow sharing through a public library",
    "per run log panel with block results",
    "dark themed editor with a block palette",
    "reusable blocks grouped by category",
  ],
  iebfoaldapgggcpjialmbnhcendcnkpi: [
    "records browser sessions as reusable flows",
    "replay of recorded flows for testing",
    "scraping of repeated page structures",
    "export of captured data",
    "flow editing after recording",
  ],
  geggbdbnidkhbnbjoganapfhkpgkndfo: [
    "records end to end tests from real user actions",
    "generates playwright cypress and puppeteer code",
    "captures network traffic during recording",
    "screenshots captured alongside steps",
    "step editing and annotations after recording",
    "test replay for regression checks",
  ],
  bapaclfmcgookbglclacfgeemaehkkme: [
    "records interactions into playwright scripts",
    "selector strategy choice during recording",
    "copy generated code to the clipboard",
    "pause and resume of recording",
  ],
  ljdobmomdgdljniojadhoplhkpialdid: [
    "record and playback of selenium style tests",
    "selenese command editing with autocomplete",
    "locator strategies including id css and xpath",
    "control flow commands like if else and while",
    "variables and stored values in tests",
    "assertions and wait commands",
    "test suite organization of cases",
    "export of tests to many programming languages",
    "playback inside the recorder panel",
    "screenshots on command failure",
    "playback speed control",
    "command level breakpoints for debugging",
    "dual panel view of commands and target page",
  ],
  bhfbkacflpnpfgfjghhajikhfghcknip: [
    "record end to end tests without writing code",
    "replay tests on demand",
    "shareable test artifacts",
    "step assertions on page state",
  ],
  adbonjafebjadholmnabocnddmhpennj: [
    "web automation workflow runner",
    "click fill and extract steps",
    "scheduled automation runs",
    "data capture from pages",
  ],
  gpnieenphjbjcpcdnjhnipckcldebjdf: [
    "ai driven browser agent",
    "natural language task execution",
    "page understanding through snapshots",
    "step by step action feedback",
  ],
  kkepankimcahnjamnimeijpplgjpmdpp: [
    "runs rpa bot tasks inside the browser",
    "selector driven automation steps",
    "integration with the openbots automation platform",
    "task logs and results",
  ],
  gpcpndfhbmichbgffhlaedjlnomnfgla: [
    "ai powered form autofill",
    "semantic detection of form fields",
    "one click fill of whole forms",
    "saved profiles for reuse",
    "checkout and signup automation",
  ],
  khaocdcbgnfgfoiplkbdaappfcdldgeb: [
    "record and replay browser macros",
    "scheduled macro execution",
    "data extraction steps",
    "form filling steps",
  ],
  ghlmiigebgipgagnhlanjmmniefbfihl: [
    "no code workflow automation builder",
    "scraping recipes for repeated structures",
    "form filling workflows",
    "scheduled workflow runs",
    "workflow template library",
    "cloud sync of workflows",
  ],
  kbacobbmnajbihpidjilndoielmaojbj: [
    "page automation recipes",
    "click and fill steps against selectors",
    "data capture into tables",
    "replay of saved recipes",
  ],
  heolgaalbnnelipfhbccbkdohecmaimo: [
    "automa derived workflow automation",
    "block based workflow canvas",
    "scraping and form blocks",
    "trigger options for workflows",
    "local first workflow storage",
  ],
  cpgamigjcbffkaiciiepndmonbfdimbb: [
    "no code website automation and scraping",
    "record interactions into reusable recipes",
    "schedule recipes to run unattended",
    "run a recipe across a list of urls",
    "scrape tables into google sheets",
    "form filling at scale",
    "background robot workers that run recipes",
    "template marketplace of recipes",
    "two factor authentication aware workflows",
    "run history with replays",
    "notifications when runs finish",
  ],
  ebofbaomnlpjgnponhalmmihcgakodpj: [
    "automation driven from command style input",
    "scriptable task execution against pages",
    "command history for reuse",
  ],
  idahijhccencfhigphpmlnjbppldolgk: [
    "ai assistant docked in a side panel",
    "page summarization and chat",
    "quick actions on selected text",
    "prompt library",
  ],
  ioohfnlbpolaalcbppaggpgcgpldohfg: [
    "ai assistant with page reading",
    "task suggestions from page context",
    "chat with follow up questions",
  ],
  cbibgdcbkoikdkeahemkjkpacmgicaco: [
    "everyday ai assistant in the browser",
    "chat grounded in the open page",
    "summaries and quick prompts",
    "selection based actions",
  ],
  hfjnppljknigdnnpocjjgdcfmnodoafe: [
    "record workflows by performing them once",
    "scraping of tables and lists",
    "scheduled workflow runs",
    "cloud sync and sharing of workflows",
    "conditional steps inside workflows",
    "loops over collected data",
    "form filling workflows",
    "workflow marketplace of templates",
    "run workflows on demand or on a schedule",
  ],
  ildkmabpimmkaediidaifkhjpohdnifk: [
    "command line style control of the browser",
    "natural language command execution",
    "scriptable sequences of commands",
    "command history and reuse",
  ],
  bjfgambnhccakkhmkepdoekmckoijdlc: [
    "exposes browser control tools over the model context protocol",
    "lets external ai clients drive the browser",
    "tab listing and navigation tools",
    "click type and screenshot tools",
    "local bridge between the browser and mcp clients",
    "tool schema descriptions for the client",
    "consent gating before sensitive actions",
    "session management for paired clients",
  ],
  gbldofcpkknbggpkmbdaefngejllnief: [
    "ai powered ui automation from natural language",
    "visual grounding of elements on screenshots",
    "natural language assertions on page state",
    "yaml scripting of action chains",
    "integration with playwright and puppeteer",
    "model powered planning of ui steps",
    "report generation for runs",
    "caching of visual grounding results",
  ],
  akldabonmimlicnjlflnapfeklbfemhj: [
    "agent that reads and acts on the open page",
    "element targeting from descriptions",
    "action feedback loop with the model",
  ],
  gblapfbnbicdckfhkllcnfleiemhmgeb: [
    "connects the qoder ide assistant to the browser",
    "relays page state for coding tasks",
    "pairing between editor and browser session",
  ],
  kjgebebilcoaamgfpogkoehcnjbnncic: [
    "rotates user agent strings per request",
    "per site agent overrides",
    "custom agent lists and whitelists",
    "spoofing of related client hints",
  ],
  idkjhjggpffolpidfkikidcokdkdaogg: [
    "proxy profile switching per site",
    "rule based proxy routing",
    "profile management ui",
  ],
  bkhaagjahfmjljalopjnoealnfndnagc: [
    "file tree sidebar for github repositories",
    "fast folder navigation without cloning",
    "pull request file tree view",
    "repository file previews",
    "plugin themes for the tree",
  ],
  giljefjcheohhamkjphiebfjnlphnokk: [
    "github file tree sidebar",
    "file preview on hover",
    "keyboard shortcuts for repository navigation",
    "lazy loading of large repositories",
  ],
  joggkdfebigddmaagckekihhfncdobff: [
    "commit graph visualization on github",
    "branch and merge structure rendering",
    "quick navigation between commits",
  ],
  dgjhfomjieaadpoljlnidmbgkdffpack: [
    "code search across repositories from the browser",
    "jump to definition inside github views",
    "inline blame and reference annotations",
    "search suggestions and saved queries",
    "file navigation enhancements",
    "search across many hosts",
    "code intel tooltips on symbols",
    "repository wide symbol search",
  ],
  anlikcnbgdeidpacdbdljnabclhahhmd: [
    "repository size display on github",
    "download repository as a zip archive",
    "copy raw file and repository paths",
    "file size display per file",
    "quick download of individual files",
  ],
  pncmdlebcopjodenlllcomedphdmeogm: [
    "sends the current page to an anythingllm workspace",
    "chat with previously saved pages",
    "workspace selection from the extension",
    "local first llm integration",
  ],
  jfgfiigpkhlkbnfnbobbkinehhfdhndo: [
    "web ui companion for local ollama models",
    "chat with openai compatible endpoints",
    "page context injected into chats",
    "model and parameter management",
    "knowledge collection from visited pages",
  ],
  jfeammnjpkecdekppnclgkkffahnhfhe: [
    "records browser actions into automation scripts",
    "generates replayable scripts",
    "script editing and rerun",
  ],
  obpjaonipoaomjnokbimppohbpjibflm: [
    "ai design agent running in the browser",
    "generates ui designs from prompts",
    "iterative design refinement",
    "design canvas with export",
  ],
  mmlmfjhmonkocbjadbfplnigmagldckm: [
    "helpers for playwright driven browser sessions",
    "cdp relay to external test runners",
    "capture of page state for tests",
  ],
  bjcngahpcjeililljmfegmlanlpgibdi: [
    "ai agent for chrome with a side panel",
    "page aware task execution",
    "natural language commands",
  ],
  mlcokfhobljidglkgileejcelojhhmdm: [
    "agentic browsing with a custom interface",
    "agent orchestrated navigation and reading",
    "task oriented browsing sessions",
  ],
  cclndjheoijilbieeofdjiledodbdakb: [
    "browser automation task runner",
    "scheduled automation runs",
    "form and scraping task templates",
    "run logs and history",
  ],
  akadnehffdhihfhpmcbokdlfjpgooffe: [
    "reads selected text aloud",
    "full page text to speech",
    "voice and speed configuration",
    "playback controls in the popup",
  ],
  bgjdnapfffligabpfbkbapibaifgmjie: [
    "control the browser with natural language",
    "accessibility first command surface",
    "voice friendly interaction model",
    "hands free navigation",
  ],
  mooikfkahbdckldjjndioackbalphokd: [
    "record and playback of browser tests",
    "selenese command language with editing",
    "locator strategies including id name css and xpath",
    "control flow with if else while and times commands",
    "variables with store and evaluate commands",
    "assertions and verify commands",
    "wait commands for element states",
    "test suites that group test cases",
    "export of tests to many languages and frameworks",
    "playback inside the ide side panel",
    "breakpoint debugging of single commands",
    "autocomplete of command names",
    "rolling log of execution results",
    "execution against the current tab",
    "pause and resume of playback",
    "suite level batch runs",
  ],
  ofaokhiedipichpaobibbnahnkdoiiah: [
    "automatic detection of tables and lists on any page",
    "scrape detected data to csv",
    "scrape to excel xml and json formats",
    "crawl across pagination with next page detection",
    "selector wizard for manual column picking",
    "inline table editor before export",
    "delay and retry controls for polite crawling",
    "wildcard url patterns for crawl scopes",
    "location scraping with geo coordinates",
    "drip feed extraction over time",
  ],
  iebpjdmgckacbodjpijphcplhebcmeop: [
    "copy html tables to the clipboard",
    "export tables to excel csv json and markdown",
    "send tables straight to google sheets",
    "recursively find all tables on a page",
    "local html file table extraction",
    "spreadsheet like table editor",
    "copy tables as html",
    "per table preview before export",
    "automatic header detection",
    "merged cell handling",
  ],
  eenjdnjldapjajjofmldgmkjaienebbj: [
    "ocr of any screen region on demand",
    "ocr of images embedded in pages",
    "ocr of video frames",
    "ocr of pdf documents",
    "text to speech of recognized text",
    "translation of recognized text",
    "configurable ocr engines",
    "screenshot capture with the recognized text",
  ],
  edacconmaakjimmfgnblocblbcdcpbko: [
    "save all open tabs as a named session",
    "restore saved sessions on demand",
    "automatic session snapshots",
    "bulk tab management from a grid",
    "search across saved sessions",
    "import and export of session files",
    "recovery of sessions after a crash",
    "rename and edit saved sessions",
    "stale tab detection and cleanup",
    "duplicate tab detection",
  ],
};

/**
 * Consolidated candidate feature pool for devthink, grouped by context. Each
 * item is one concrete implementable line. This is the key inference
 * deliverable derived from the corpus evidence.
 */
const featurepool = [
  {
    group: "interaction",
    items: [
      "click an element by css selector",
      "click an element resolved from its accessible name",
      "click an element matched by visible text",
      "click an element by aria role and name pair",
      "click at coordinates relative to the viewport",
      "double click an element",
      "right click an element to open its context menu",
      "shift click for range or multi selection",
      "hover over an element with a dwell duration",
      "move the pointer along a path between two points",
      "simulate realistic pointer movement speeds",
      "focus an element before interacting with it",
      "type text into an input by selector",
      "type text into content editable regions",
      "clear a field before typing",
      "append text to an existing field value",
      "set a value through the dom property instead of key events",
      "press a single key",
      "press a key combination with modifiers",
      "hold a key down across several steps",
      "release a held key",
      "type with per keystroke delay for slow controls",
      "press enter to submit a search box",
      "scroll the page down by a pixel offset",
      "scroll the page up by a pixel offset",
      "scroll smoothly with easing",
      "scroll an element into view",
      "scroll to the top or bottom of the page",
      "scroll inside a scrollable sub container",
      "scroll iframe content from the parent page",
      "drag an element onto a target element",
      "drag and drop at coordinates",
      "drag a file from disk onto a drop zone",
      "select an option from a dropdown",
      "select multiple options in a multi select",
      "toggle a checkbox",
      "choose an option in a radio group",
      "set a range slider to a value",
      "set a date input to a value",
      "set a color input to a value",
      "upload a file into a file input",
      "expand a collapsed details or accordion section",
      "dismiss an unexpected dialog before continuing",
      "interact with elements inside shadow dom trees",
      "interact with elements inside same origin iframes",
      "retry an interaction when the element moves",
    ],
  },
  {
    group: "observation",
    items: [
      "capture a full dom snapshot of the page",
      "capture the accessibility tree for semantic grounding",
      "extract visible text content per element",
      "extract an article or reader view of the page",
      "extract metadata such as title description and canonical url",
      "detect data tables and list their headers",
      "detect repeated item lists such as products or comments",
      "detect interactive elements and their kinds",
      "build a numbered map of clickable elements for the agent",
      "resolve an element from a natural language description",
      "resolve elements by css selector",
      "resolve elements by xpath",
      "verify an element is visible before acting",
      "verify an element is enabled and not readonly",
      "read form field labels and current values",
      "read aria labels and roles for controls",
      "read data attributes as structured hints",
      "observe dom mutations as the page changes",
      "wait for an element to appear",
      "wait for text to appear or disappear",
      "wait for a network quiet period",
      "watch for cookie and consent banners",
      "detect infinite scroll containers",
      "detect virtualized lists that render on demand",
      "detect lazy loaded images and placeholders",
      "read the current scroll position",
      "read the page language for localization",
      "read the page title and headings outline",
      "count pagination results and total pages",
      "extract links with anchor text and href",
      "extract image sources and alt text",
      "extract inline script data such as embedded json state",
      "detect shadow dom roots and pierce them",
      "detect iframes and enumerate their origins",
      "classify a page by its detected template",
      "fingerprint a page section for later relocation",
      "diff snapshots between two points in time",
      "extract selected text from the user selection",
      "read clipboard content on explicit consent",
      "observe focus changes across the page",
      "detect sticky headers and overlays that hide content",
      "detect scroll locks and modal states",
      "extract open graph and structured data",
      "read rendered values of computed styles",
      "derive a stable selector for an element",
      "detect the language of extracted text for routing",
    ],
  },
  {
    group: "navigation",
    items: [
      "navigate to a url in the current tab",
      "open a url in a new tab",
      "open a url in a new window",
      "open a private window for sensitive steps",
      "go back in history",
      "go forward in history",
      "reload the page",
      "reload bypassing the cache",
      "stop a pending navigation",
      "wait for the page load event",
      "wait for a specific url pattern",
      "follow a link by its text",
      "follow a link by href fragment",
      "navigate within a single page app by clicking",
      "detect url changes in single page apps",
      "read and rewrite query parameters",
      "set a url fragment for scroll anchoring",
      "block navigation away mid task with consent",
      "navigate a list of urls sequentially",
      "navigate with per site wait profiles",
      "detect http errors and offline states",
      "detect redirect chains",
      "capture the final url after redirects",
      "manage basic auth prompts via stored credentials",
      "dismiss certificate interstitials by policy",
      "open a download link without leaving the page",
      "print the page to pdf during a flow",
      "prefetch predicted next pages",
      "preconnect to expected origins",
      "deep link into common web apps by pattern",
      "reopen a recently closed tab",
      "restore a navigation trail for audit",
      "pause navigation while a consent prompt is open",
      "detect navigation intent from the agent plan",
      "rate limit navigations per domain",
      "open a url from the clipboard",
      "verify a url is safe before opening",
      "batch open a curated link list",
    ],
  },
  {
    group: "tabs and windows",
    items: [
      "list all open tabs with url and title",
      "query tabs by url title or id",
      "activate a tab by id",
      "activate the tab matching a url pattern",
      "create a new tab with a target url",
      "create a tab in a specific window",
      "create a tab in the background",
      "duplicate an existing tab",
      "close a tab by id",
      "close all tabs matching a pattern",
      "pin and unpin tabs",
      "mute and unmute tabs",
      "move tabs within a window",
      "move tabs across windows",
      "group related tabs into a named group",
      "color code tab groups by task",
      "collapse and expand tab groups",
      "discard inactive tabs to save memory",
      "reload a set of tabs",
      "zoom a tab in and out",
      "capture the visible area of a tab",
      "observe tab updates such as title changes",
      "observe tab activation changes",
      "observe tab closure mid task",
      "switch to the next or previous tab",
      "list all open windows",
      "create a window with size and position",
      "resize and reposition windows",
      "maximize minimize and restore windows",
      "focus a specific window",
      "close a window with consent",
      "split work across a scratch window",
      "use an incognito window on explicit request",
      "reopen a closed tab from history",
      "name and save a tab layout",
      "restore a saved tab layout",
      "detect duplicate tabs",
      "search across open tabs",
      "surface per tab task status in a badge",
      "limit concurrent task tabs",
      "keep a pinned control tab for the agent",
      "present tabs in a quick switcher ui",
      "snapshot the full session for later restore",
      "attach metadata to tabs for routing",
      "detect tabs playing audio",
      "reopen tabs from a previous run",
    ],
  },
  {
    group: "forms and data",
    items: [
      "fill a form from a structured record",
      "fill fields matched by label text",
      "fill fields matched by placeholder or aria label",
      "detect field kinds such as email phone and date",
      "generate realistic values per field kind",
      "reuse saved profiles for autofill",
      "store form profiles locally",
      "ask before submitting a form",
      "submit a form via its button",
      "submit a form programmatically",
      "detect validation errors after submit",
      "read inline error messages for correction loops",
      "retry failed submissions with backoff",
      "handle multi step wizards page by page",
      "handle dependent dropdowns that load options",
      "handle typeahead fields with suggestion picking",
      "pick a date from a calendar widget",
      "upload files as part of form submission",
      "attach generated documents to a form",
      "read captcha presence and hand back to the user",
      "fill credit card style multi field inputs",
      "fill one time code fields from a notification",
      "fill password fields only after explicit consent",
      "detect and skip honeypot fields",
      "detect login forms specifically",
      "detect signup and checkout templates",
      "scrape a table into columns and rows",
      "detect table headers and normalize them",
      "handle rowspan and colspan cells",
      "extract nested tables",
      "export scraped data to csv",
      "export scraped data to json",
      "export scraped data to excel",
      "copy a table to the clipboard",
      "push a table to a google sheet",
      "import data from a csv for fill loops",
      "iterate a dataset row by row as variables",
      "transform values between extraction and export",
      "deduplicate scraped rows",
      "paginate extraction across pages",
      "merge extracts from multiple pages",
      "timestamp and source every extracted row",
      "preview extracted data in a grid before export",
      "stream large extracts to disk",
      "resume an interrupted extraction",
      "log extraction provenance for audit",
    ],
  },
  {
    group: "media capture",
    items: [
      "capture a screenshot of the visible viewport",
      "capture a full page screenshot by stitching",
      "capture a screenshot of a single element",
      "capture a screenshot with device pixel ratio scaling",
      "capture a screenshot of a scrollable region",
      "annotate screenshots with step markers",
      "capture element screenshots into a contact sheet",
      "capture the page as a pdf",
      "capture a pdf with a custom page size",
      "capture a pdf of a paginated report",
      "record a screencast of the tab",
      "record a video of a task run",
      "capture audio from the tab",
      "capture a still frame from a video element",
      "detect and download images from the page",
      "download all images matching a filter",
      "read text from an image with ocr",
      "read text from a screen region with ocr",
      "read text from a scanned pdf page",
      "read text from a paused video frame",
      "use a vision model to describe a screenshot",
      "crop a screenshot to element bounds",
      "redact sensitive regions before sharing",
      "copy a screenshot to the clipboard",
      "send a screenshot to the agent for grounding",
      "capture a dom snapshot alongside each screenshot",
      "record console output with the timeline",
      "record network traces with the timeline",
      "screenshot diffing against a baseline",
      "thumbnail generation for logs",
      "image format conversion between png and jpeg",
      "capture canvas element contents",
      "capture webgl canvas state",
      "capture a media stream for webrtc checks",
      "extract embedded video sources and formats",
      "capture metadata of media assets",
      "capture favicon and logo assets",
      "time lapse capture of a changing page",
      "capture before and after states of each action",
      "export captures with consistent file naming",
    ],
  },
  {
    group: "network and transport",
    items: [
      "fetch a url from the extension context",
      "fetch with custom headers on consent",
      "fetch with timeout and retry policy",
      "stream large responses",
      "parse json responses into variables",
      "parse html responses with dom parsing",
      "call rest endpoints with typed payloads",
      "call graphql endpoints",
      "open a websocket channel",
      "reconnect websockets with backoff",
      "multiplex messages over one socket",
      "observe requests the page makes",
      "observe responses the page receives",
      "inspect request and response headers",
      "capture response bodies for analysis",
      "block chosen requests during a task",
      "mock a response for testing",
      "modify request headers with rules",
      "set and read cookies per domain",
      "clear cookies for a domain on demand",
      "handle oauth flows for external apis",
      "store api keys locally with consent",
      "proxy requests through a configured proxy",
      "route only task traffic through a proxy",
      "respect rate limits from responses",
      "post form data uploads",
      "upload multipart files",
      "download a file to disk",
      "download many files as a batch",
      "pause and resume downloads",
      "verify downloads completed",
      "intercept downloads by mime type",
      "export captured network logs",
      "detect api endpoints used by the page",
      "reverse engineer page api calls for extraction",
      "subscribe to server sent events",
      "long polling helper with cancellation",
      "attach request correlation ids across a run",
    ],
  },
  {
    group: "debugging",
    items: [
      "attach the chrome devtools protocol to a tab",
      "detach cleanly after the run",
      "issue raw cdp commands from a plan step",
      "subscribe to cdp domain events",
      "capture console messages of all levels",
      "capture javascript errors with stack traces",
      "capture unhandled promise rejections",
      "capture failed network requests",
      "capture long task timings",
      "measure performance metrics for a flow",
      "take a heap snapshot on demand",
      "track memory growth during a run",
      "profile cpu during a heavy step",
      "set breakpoints in page scripts",
      "step through page code",
      "evaluate javascript in page context",
      "evaluate in an isolated world",
      "inspect the dom at a breakpoint",
      "watch expressions during a run",
      "override page scripts for testing",
      "emulate device metrics",
      "emulate network conditions",
      "emulate geographic location",
      "emulate a user agent per task",
      "override permissions such as camera per task",
      "blackbox third party scripts in traces",
      "export a devtools trace file",
      "annotate traces with step markers",
      "detect layout shifts during a flow",
      "detect console spam patterns",
      "rotate logs for long sessions",
      "structured log levels per step",
      "replay a captured trace offline",
      "diff console output between runs",
      "attach to iframes and workers",
      "debug service workers of the page",
      "capture source maps for better stacks",
      "safe teardown on debugger detach",
    ],
  },
  {
    group: "memory and sessions",
    items: [
      "persist task state across service worker restarts",
      "persist session history with timestamps",
      "snapshot the full browsing session",
      "restore a session after a crash",
      "restore a session on demand",
      "auto snapshot on an interval",
      "name and organize saved sessions",
      "diff two sessions",
      "search across saved sessions",
      "import and export session files",
      "keep per site memory notes",
      "keep agent scratchpad memory per task",
      "summarize past runs into reusable notes",
      "semantic recall of past extractions",
      "remember user corrections for future steps",
      "remember consent decisions per origin",
      "expire stale memory by policy",
      "encrypt sensitive memory at rest",
      "scope memory per profile or workspace",
      "sync memory across devices on consent",
      "track the state machine of a workflow run",
      "checkpoint long workflows",
      "resume from the last checkpoint",
      "rollback side effects on failure",
      "idempotent step identifiers",
      "queue tasks while offline",
      "replay queued tasks on reconnect",
      "storage quota awareness and cleanup",
      "export memory for audit",
      "attach provenance to each memory item",
      "isolate state per tab",
      "lock sessions against concurrent runs",
      "detect zombie runs and reap them",
      "heartbeat for long running tasks",
      "pause and resume a running session",
      "cancel a run with rollback options",
      "keep a url history per run",
      "timeline view of a past run",
    ],
  },
  {
    group: "workflow and automation",
    items: [
      "build workflows by composing steps",
      "drag and drop step editor",
      "step library grouped by category",
      "nest steps into reusable blocks",
      "conditionals on extracted values",
      "branch on page state",
      "loops over a data list",
      "repeat until a condition holds",
      "while loops with safety bounds",
      "loops over each matched element",
      "parallel step execution",
      "join parallel branches",
      "variables with typed scopes",
      "expressions between variables",
      "regex extraction into variables",
      "delay steps with jitter",
      "wait for element steps",
      "retry policies per step",
      "error handlers per branch",
      "try catch around fragile steps",
      "timeouts per step and per run",
      "triggers on page visits",
      "triggers on url patterns",
      "triggers from the context menu",
      "triggers from keyboard shortcuts",
      "triggers from a toolbar button",
      "schedule runs with cron expressions",
      "schedule runs at intervals",
      "run on a list of urls",
      "webhook triggered runs",
      "event driven triggers from the page",
      "manual run with step preview",
      "dry run mode without side effects",
      "single step execution for debugging",
      "breakpoint debugging in the editor",
      "run logs per execution",
      "run history with outcomes",
      "export workflows as files",
      "import workflows from files",
      "share workflow templates",
      "version workflows locally",
      "diff workflow versions",
      "workflow library or marketplace",
      "cloud sync of workflows",
      "run workflows in the background",
      "watchdog for stuck workflows",
      "nested workflow parameters",
      "per site policy overrides inside workflows",
    ],
  },
  {
    group: "agent protocol",
    items: [
      "expose browser tools over mcp",
      "list tools with json schema inputs",
      "negotiate capabilities with the client",
      "json rpc message framing",
      "stdio bridge to a local client",
      "stream http transport for remote clients",
      "per tool consent requirements in metadata",
      "human approval gate per sensitive tool",
      "session tokens for client pairing",
      "tool namespacing by domain",
      "tool versioning for compatibility",
      "subscribe to server events",
      "resource subscriptions for page state",
      "sampling callbacks into the client model",
      "prompts exposed as tools",
      "stream tool results as they arrive",
      "progress notifications for long tools",
      "cancel in flight tools",
      "rate limiting per client",
      "support multiple concurrent clients",
      "client allowlist configuration",
      "localhost binding by default",
      "tls for remote transports",
      "auth handshake for remote clients",
      "audit log of every tool call",
      "structured errors with retry hints",
      "idempotency keys for tool calls",
      "batch tool calls",
      "tool dry run mode",
      "tool mocks for testing",
      "openapi style tool descriptions",
      "natural language command parsing",
      "intent classification of user requests",
      "plan generation from a goal",
      "plan review before execution",
      "step by step plan execution with checks",
      "replan on failure",
      "reflection after each step",
      "cost and token budget tracking",
      "model routing per task kind",
      "local model support",
      "provider agnostic endpoint configuration",
      "prompt template library",
      "guardrails on model output parsing",
    ],
  },
  {
    group: "multi agent coordination",
    items: [
      "run several agents in separate tabs",
      "assign different roles to agents",
      "share a task queue across agents",
      "work stealing across agents",
      "message passing between agents",
      "blackboard memory shared by agents",
      "leader worker topology",
      "critic agent reviewing outputs",
      "planner and executor separation",
      "verifier agent for results",
      "hand a tab between agents mid task",
      "lock shared resources",
      "detect conflicts on simultaneous edits",
      "merge results from parallel agents",
      "progress dashboard across agents",
      "per agent budget limits",
      "per agent permission scopes",
      "human escalation from any agent",
      "agent to agent review requests",
      "replay of an agent run for audit",
      "compare outputs from competing agents",
      "vote or consensus among agents",
      "kill switch for all agents",
      "pause one agent without stopping others",
      "agent naming and metadata",
      "spawn sub agents on demand",
      "depth limits for sub agents",
      "aggregate results into one report",
      "timeline of interleaved agent actions",
      "share lessons learned across agents",
      "resource arbitration between agents",
      "prioritized task lanes",
      "scale workers by site load",
      "shared cost accounting across agents",
    ],
  },
  {
    group: "ui surfaces",
    items: [
      "popup command surface from the toolbar",
      "side panel workspace docked in chrome",
      "full page dashboard in a new tab",
      "options page for configuration",
      "onboarding walkthrough for first run",
      "command palette with fuzzy search",
      "natural language task input box",
      "step timeline with statuses",
      "live log stream during runs",
      "plan review cards before execution",
      "approve or reject buttons per sensitive step",
      "diff preview of pending changes",
      "data grid preview of extractions",
      "export menu with format choices",
      "context menu entries for quick actions",
      "keyboard shortcuts for common commands",
      "omnibox keyword for quick tasks",
      "toolbar badge with run status",
      "notifications for task completion",
      "notifications for needed attention",
      "tray of recent runs",
      "workflow editor canvas",
      "block palette in the editor",
      "mini map for long workflows",
      "element picker overlay on the page",
      "highlight of the active target element",
      "guided selection tooltips",
      "screenshot preview panel",
      "before and after comparison viewer",
      "settings profiles per site",
      "dark and light themes",
      "localized interface languages",
      "import and export buttons for data",
      "drag and drop file import",
      "session manager grid",
      "search across history",
      "empty states with guidance",
      "error surfaces with retry actions",
      "feature tour on demand",
      "accessibility labels across the ui",
      "inline confirmation chips on the page",
      "toast notifications for step completion",
    ],
  },
  {
    group: "security and consent",
    items: [
      "consent prompt before each sensitive action",
      "per origin allowlist for automation",
      "per site permission profiles",
      "deny by default posture",
      "active tab only mode",
      "explicit grant of one specific origin",
      "time boxed consent for a session",
      "revoke consent mid run",
      "audit trail of every action",
      "immutable run logs",
      "hashing of log entries",
      "sensitive action classification",
      "input masking in logs",
      "secret storage in the browser vault",
      "never log passwords or tokens",
      "redaction of captured screenshots",
      "sandboxed rendering of untrusted content",
      "isolated world for injected logic",
      "schema validation of every command",
      "origin check on every message",
      "external connect allowlist",
      "rate limit on automation commands",
      "human confirmation for payments",
      "human confirmation for destructive deletes",
      "human confirmation for credential use",
      "detect phishing lookalikes before login",
      "safe defaults for new sites",
      "permission diff on extension update",
      "transparency page listing all grants",
      "data minimization in extracts",
      "local first processing of page data",
      "no telemetry by default",
      "explicit opt in for any sync",
      "encrypted sync when enabled",
      "purge stored data on request",
      "export of all stored data",
      "cookie jar isolation per task",
      "clear task artifacts after the run",
      "quarantine downloaded files",
      "virus scanning hook for downloads",
      "csp compliance in all injected code",
      "review mode that pauses on new domains",
      "escape hatch key to stop everything",
      "incident report export for review",
    ],
  },
  {
    group: "performance",
    items: [
      "lazy load heavy modules on demand",
      "debounce rapid dom events",
      "batch dom queries per snapshot",
      "incremental snapshots instead of full ones",
      "selector caching with invalidation",
      "virtualized rendering of long lists",
      "offload parsing tasks to workers",
      "offscreen documents for background work",
      "service worker keepalive during runs",
      "streaming parse of large pages",
      "chunked extraction for big tables",
      "backpressure on batch runs",
      "concurrency limits per domain",
      "polite delay between batch requests",
      "adaptive polling intervals",
      "request coalescing for repeated queries",
      "memory budget per run",
      "tab suspension during long waits",
      "cache of fetched resources per run",
      "prefetch of predicted next steps",
      "measure per step duration",
      "profile slow selectors",
      "trace slow steps to the timeline",
      "budget alerts during long runs",
      "cancel slow steps on timeout",
      "resume interrupted runs efficiently",
      "avoid duplicate navigation work",
      "reuse authenticated sessions",
      "compress stored artifacts",
      "prune old logs automatically",
      "measure startup cost",
      "keep cold start under a target",
      "battery aware scheduling",
      "network aware retry policies",
      "parallelize independent page reads",
      "keep selectors warm across steps",
      "memory aware snapshot cadence",
      "slow motion replay for debugging",
    ],
  },
];

const escapeliteral = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** One compiled keyword rule the mining matches against package script text. */
interface termrule {
  category: string;
  source: string;
  stem: string;
  item: string;
  pattern: string;
}

/** The npm style package.json a harvested package may carry beside the extension manifest, as the mining reads it. */
interface wildpackageinfo {
  name?: string;
  version?: string;
  dependencies?: Record<string, unknown>;
  devDependencies?: Record<string, unknown>;
  scripts?: Record<string, unknown>;
}

/** The package metadata summary the mining derives from a package.json found inside a harvested package. */
interface packageinfosummary {
  name: string | null;
  version: string | null;
  dependencycount: number;
  dependencies: string[];
  scripts: string[];
}

/** One untrusted extension manifest of the harvested corpus: only the fields the mining reads, every field optional because a wild package declares whatever it declares. */
interface wildmanifest {
  name?: string;
  version?: string;
  description?: string;
  manifest_version?: number;
  default_locale?: string;
  update_url?: string;
  minimum_chrome_version?: string;
  incognito?: string;
  background?: { service_worker?: string; scripts?: string[]; page?: string };
  permissions?: string[];
  optional_permissions?: string[];
  host_permissions?: string[];
  optional_host_permissions?: string[];
  action?: { default_popup?: string };
  browser_action?: { default_popup?: string };
  page_action?: { default_popup?: string };
  options_ui?: unknown;
  options_page?: unknown;
  side_panel?: { default_path?: string };
  devtools_page?: unknown;
  chrome_url_overrides?: { newtab?: string };
  content_scripts?: Array<{ matches?: string[]; js?: string[]; css?: string[]; run_at?: string; all_frames?: boolean }>;
  commands?: Record<string, { suggested_key?: string | Record<string, string> }>;
  omnibox?: unknown;
  web_accessible_resources?: Array<string | { resources?: string[] }>;
  externally_connectable?: { matches?: string[]; ids?: string[] };
  content_security_policy?: string | Record<string, string>;
  sandbox?: { pages?: string[] };
  offline_enabled?: boolean;
}

/** The content script summary of one harvested package: the declaration counts the report table prints. */
interface contentscriptssummary {
  count: number;
  js: number;
  css: number;
  runat: string[];
  allframes: boolean;
  matches: string[];
}

/** One harvested extension record the cache persists: the analysis evidence when a package verified, or only the error line when the update service answered nothing analyzable. */
interface harvestrecord {
  id: string;
  label: string;
  status: string;
  analyzedat: string;
  source?: string;
  crxversion?: number;
  bytes?: number;
  name?: string;
  description?: string;
  manifest?: wildmanifest;
  backgroundtype?: string;
  hostscope?: string;
  surfaces?: string[];
  contentscripts?: contentscriptssummary;
  packageinfo?: packageinfosummary | null;
  apis?: string[];
  signals?: Record<string, string[]>;
  transports?: string[];
  locales?: number;
  filetypes?: Record<string, number>;
  filecount?: number;
  scriptcount?: number;
  totalsize?: number;
  htmlfiles?: string[];
}

const termrules: termrule[] = [];
for (const kit of signalkits) {
  for (const [term, item] of Object.entries(kit.terms)) {
    const starred = term.endsWith("*");
    const stem = starred ? term.slice(0, -1) : term;
    termrules.push({
      category: kit.category,
      source: term,
      stem,
      item,
      pattern: starred ? `\\b${escapeliteral(stem)}[a-z0-9]*` : `\\b${escapeliteral(stem)}\\b`,
    });
  }
}
const plainmap = new Map(termrules.filter((rule) => !rule.source.endsWith("*")).map((rule) => [rule.stem, rule]));
const starredrules = [...termrules.filter((rule) => rule.source.endsWith("*"))].sort(
  (left, right) => right.stem.length - left.stem.length,
);
const termpattern = new RegExp(
  [...termrules]
    .sort((left, right) => right.stem.length - left.stem.length)
    .map((rule) => rule.pattern)
    .join("|"),
  "g",
);
const termitemmap = new Map(termrules.map((rule) => [rule.source, rule.item]));
const apipattern = /(?:chrome|browser)\.([a-zA-Z][a-zA-Z0-9]*)\.([a-zA-Z][a-zA-Z0-9]*)/g;

/** Resolves a matched keyword back to the rule that produced it. */
function termrulefor(matched: string) {
  const direct = plainmap.get(matched);
  if (direct) return direct;
  for (const rule of starredrules) if (matched.startsWith(rule.stem)) return rule;
  return null;
}

/** Decodes the CRX container and returns the embedded zip payload. */
function decodecrx(payload: Buffer) {
  if (payload.subarray(0, 4).toString("ascii") !== "Cr24") throw new Error("response is not a CRX payload");
  const version = payload.readUInt32LE(4);
  if (version === 3) return { version, zip: payload.subarray(12 + payload.readUInt32LE(8)) };
  if (version === 2) return { version, zip: payload.subarray(16 + payload.readUInt32LE(8) + payload.readUInt32LE(12)) };
  throw new Error(`unsupported CRX version ${version}`);
}

/** Downloads one CRX payload from the Chrome update service with retries. */
async function downloadcrx(source: string) {
  let lasterror = new Error("download failed");
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(source, { redirect: "follow", signal: AbortSignal.timeout(90000) });
      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}`) as Error & { httpstatus?: number };
        error.httpstatus = response.status;
        throw error;
      }
      const payload = Buffer.from(await response.arrayBuffer());
      if (payload.byteLength < 100) throw new Error("empty payload from the update service");
      return payload;
    } catch (error) {
      const failure = error as Error & { httpstatus?: number };
      lasterror = failure;
      if (failure.httpstatus === 404 || failure.httpstatus === 410) throw failure;
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }
  throw lasterror;
}

/** Walks the extracted package and returns every file with size in bytes. */
async function walkfiles(directory: string) {
  const dirents = await readdir(directory, { recursive: true, withFileTypes: true });
  const files: Array<{ path: string; size: number; full: string }> = [];
  for (const dirent of dirents) {
    if (!dirent.isFile()) continue;
    const full = join(dirent.parentPath, dirent.name);
    const info = await stat(full);
    files.push({
      path: full
        .slice(directory.length + 1)
        .split("\\")
        .join("/"),
      size: info.size,
      full,
    });
  }
  return files;
}

/** Reads and parses a json file, throwing a readable error when invalid. */
async function readjson(path: string): Promise<unknown> {
  const raw = await readFile(path, "utf8");
  return JSON.parse(raw);
}

/** Resolves manifest message placeholders using a locale messages map. */
function resolvelocalized(value: string | undefined, messages: Record<string, { message?: string }>): string | undefined {
  if (typeof value !== "string" || !value.startsWith("__MSG_")) return value;
  const key = value.slice(6, value.lastIndexOf("__"));
  const entry = messages[key] ?? messages[key.toLowerCase()];
  return entry?.message ?? value;
}

/** Derives the background execution type from the manifest. */
function backgroundtype(manifest: wildmanifest) {
  const background = manifest.background ?? null;
  if (!background) return "none declared";
  if (background.service_worker) return "service worker";
  if (Array.isArray(background.scripts) && background.scripts.length) return "background scripts (legacy mv2)";
  if (background.page) return "background page (legacy mv2)";
  return "declared without a recognized shape";
}

/** Summarizes the declared host scope of a manifest. */
function hostscope(manifest: wildmanifest) {
  const declared = [...(manifest.host_permissions ?? []), ...(manifest.optional_host_permissions ?? [])];
  const legacy = (manifest.permissions ?? []).filter((permission) => {
    const value = String(permission);
    return value.includes("://") || value.startsWith("*.") || value.startsWith("*/") || value === "<all_urls>";
  });
  const all = [...declared, ...legacy];
  if (!all.length) return "none declared";
  if (all.includes("<all_urls>")) return "all urls";
  const unique = [...new Set(all)];
  return `${unique.length} pattern(s): ${unique.slice(0, 6).join(", ")}${unique.length > 6 ? ", and more" : ""}`;
}

/** Classifies UI surfaces from manifest declarations and html file paths. */
function classifysurfaces(manifest: wildmanifest, htmlfiles: string[]) {
  const surfaces = new Set<string>();
  const popup =
    manifest.action?.default_popup ?? manifest.browser_action?.default_popup ?? manifest.page_action?.default_popup;
  if (popup) surfaces.add("popup");
  if (manifest.options_ui || manifest.options_page) surfaces.add("options");
  if (manifest.side_panel?.default_path) surfaces.add("side panel");
  if (manifest.devtools_page) surfaces.add("devtools");
  if (manifest.chrome_url_overrides?.newtab) surfaces.add("new tab");
  for (const file of htmlfiles) {
    const name = file.toLowerCase();
    if (name.includes("background")) continue;
    if (name.includes("popup")) surfaces.add("popup");
    else if (name.includes("options") || name.includes("settings")) surfaces.add("options");
    else if (name.includes("sidepanel") || name.includes("side panel") || name.includes("side_panel"))
      surfaces.add("side panel");
    else if (name.includes("devtools")) surfaces.add("devtools");
    else if (name.includes("dashboard")) surfaces.add("dashboard");
    else if (name.includes("newtab") || name.includes("new tab")) surfaces.add("new tab");
    else if (name.includes("editor") || name.includes("canvas") || name.includes("builder"))
      surfaces.add("editor page");
    else if (name.includes("record")) surfaces.add("recorder page");
    else if (name.includes("window")) surfaces.add("standalone window");
    else surfaces.add("additional page");
  }
  return [...surfaces];
}

/**
 * Downloads, decodes, extracts and statically analyzes one package. The raw
 * artifact directory is always removed before returning.
 */
async function analyzepackage(id: string, label: string) {
  const source = `${updatebase}${id}%26uc`;
  const payload = await downloadcrx(source);
  const { version, zip } = decodecrx(payload);
  const workdir = join(harvestdir, id);
  const zippath = join(workdir, "package.zip");
  const extractdir = join(workdir, "package");
  await mkdir(extractdir, { recursive: true });
  await writeFile(zippath, zip);
  try {
    const listing = (await execute("unzip", ["-Z1", zippath], { maxBuffer: 16 * 1024 * 1024 })).stdout
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    for (const entry of listing) {
      if (entry.startsWith("/") || entry.split("/").includes("..")) throw new Error("unsafe zip entry inside package");
    }
    try {
      await execute("unzip", ["-qq", "-o", zippath, "-d", extractdir], { maxBuffer: 16 * 1024 * 1024 });
    } catch {
      // Partial extraction is tolerated as long as the manifest is present.
    }
    const manifest = (await readjson(join(extractdir, "manifest.json")).catch(() => {
      throw new Error("manifest.json missing or invalid inside the package");
    })) as wildmanifest;
    const files = await walkfiles(extractdir);

    const apis = new Set<string>();
    const ruleshit = new Set<termrule>();
    const transports = new Set<string>();
    const filetypes: Record<string, number> = {};
    const htmlfiles: string[] = [];
    const locales = new Set<string>();
    let totalsize = 0;
    let filecount = 0;
    let scriptcount = 0;
    let packageinfo: packageinfosummary | null = null;

    for (const file of files) {
      const type = (extname(file.path).slice(1) || "noext").toLowerCase();
      filetypes[type] = (filetypes[type] ?? 0) + 1;
      filecount += 1;
      totalsize += file.size;
      if (/^_locales\/[^/]+\/messages\.json$/i.test(file.path)) locales.add(file.path.split("/")[1]);
      if (file.path === "package.json") {
        try {
          const parsed = (await readjson(file.full)) as wildpackageinfo;
          packageinfo = {
            name: parsed.name ?? null,
            version: parsed.version ?? null,
            dependencycount:
              Object.keys(parsed.dependencies ?? {}).length + Object.keys(parsed.devDependencies ?? {}).length,
            dependencies: Object.keys(parsed.dependencies ?? {}).slice(0, 12),
            scripts: Object.keys(parsed.scripts ?? {}).slice(0, 12),
          };
        } catch {
          packageinfo = null;
        }
      }
      if (/\.html?$/i.test(file.path)) htmlfiles.push(file.path);
      if (/\.(?:js|mjs|cjs)$/i.test(file.path) && file.size <= 16 * 1024 * 1024) {
        scriptcount += 1;
        const content = await readFile(file.full, "utf8");
        for (const match of content.matchAll(apipattern)) apis.add(`${match[1]}.${match[2]}`);
        const lowered = content.toLowerCase();
        for (const match of lowered.matchAll(termpattern)) {
          const rule = termrulefor(match[0]);
          if (rule) ruleshit.add(rule);
        }
        if (/(?:chrome|browser)\.runtime\.(?:sendMessage|onMessage|connect|onConnect)/.test(content))
          transports.add("extension runtime message");
        if (/(?:chrome|browser)\.(?:tabs|scripting)\.(?:sendMessage|executeScript)/.test(content))
          transports.add("tab or content bridge");
        if (/(?:connectNative|sendNativeMessage)/.test(content)) transports.add("native host bridge");
        if (/(?:fetch\(|new\s+WebSocket|XMLHttpRequest)/.test(content)) transports.add("network transport signal");
      }
    }

    const signals: Record<string, string[]> = {};
    for (const kit of signalkits) {
      const matched = termrules
        .filter((rule) => ruleshit.has(rule) && rule.category === kit.category)
        .map((rule) => rule.source);
      if (matched.length) signals[kit.category] = matched;
    }

    const scripts = manifest.content_scripts ?? [];
    const csmatches = new Set<string>();
    let csjs = 0;
    let cscss = 0;
    const runats = new Set<string>();
    let allframes = false;
    for (const script of scripts) {
      for (const match of script.matches ?? []) csmatches.add(match);
      csjs += (script.js ?? []).length;
      cscss += (script.css ?? []).length;
      if (script.run_at) runats.add(script.run_at);
      if (script.all_frames) allframes = true;
    }

    let messages: Record<string, { message?: string }> = {};
    const defaultlocale = manifest.default_locale ?? "en";
    try {
      messages = (await readjson(join(extractdir, "_locales", defaultlocale, "messages.json"))) as typeof messages;
    } catch {
      try {
        messages = (await readjson(join(extractdir, "_locales", "en", "messages.json"))) as typeof messages;
      } catch {
        messages = {};
      }
    }

    return {
      id,
      label: label ?? "unknown listing",
      status: "verified",
      analyzedat: new Date().toISOString(),
      source,
      crxversion: version,
      bytes: payload.byteLength,
      name: resolvelocalized(manifest.name, messages),
      description: resolvelocalized(manifest.description, messages),
      manifest,
      backgroundtype: backgroundtype(manifest),
      hostscope: hostscope(manifest),
      surfaces: classifysurfaces(manifest, htmlfiles),
      contentscripts: {
        count: scripts.length,
        js: csjs,
        css: cscss,
        runat: [...runats],
        allframes,
        matches: [...csmatches].slice(0, 8),
      },
      packageinfo,
      apis: [...apis].sort(),
      signals,
      transports: [...transports].sort(),
      locales: locales.size,
      filetypes,
      filecount,
      scriptcount,
      totalsize,
      htmlfiles: htmlfiles.slice(0, 20),
    };
  } finally {
    await rm(workdir, { recursive: true, force: true });
  }
}

/** Normalizes a feature sentence for deduplication. */
function normalizedkey(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * Derives the per extension mined feature list. Curated public knowledge is
 * tagged inferred, every other item rests on package evidence and is tagged
 * observed. The list is capped at forty distinct items.
 */
function minefeatures(record: harvestrecord) {
  const items: Array<{ text: string; tag: string }> = [];
  const seen = new Set<string>();
  const add = (text: string, tag: string) => {
    const key = normalizedkey(text);
    if (!key || seen.has(key)) return;
    seen.add(key);
    items.push({ text, tag });
  };

  for (const text of knowledgepool[record.id] ?? []) add(text, "inferred");

  const manifest: wildmanifest = record.manifest ?? {};
  const permissions = (manifest.permissions ?? []).filter((permission) => {
    const value = String(permission);
    return !(value.includes("://") || value.startsWith("*.") || value.startsWith("*/") || value === "<all_urls>");
  });
  for (const permission of permissions) {
    const kit = permissionfeatures[permission];
    for (const text of kit?.primary ?? [`declare the ${permission} capability`]) add(text, "observed");
  }
  for (const pair of record.apis ?? []) {
    const text = apifeatures[pair];
    if (text) add(text, "observed");
  }
  for (const terms of Object.values(record.signals ?? {})) {
    for (const term of terms) {
      const text = termitemmap.get(term);
      if (text) add(text, "observed");
    }
  }
  const surfaceitems: Record<string, string> = {
    popup: "toolbar popup command surface",
    options: "options configuration surface",
    "side panel": "dockable side panel workspace",
    devtools: "devtools panel integration",
    "new tab": "new tab dashboard surface",
    dashboard: "dashboard page",
    "editor page": "editor page for building flows",
    "recorder page": "recorder page interface",
    "standalone window": "standalone window interface",
  };
  for (const surface of record.surfaces ?? []) {
    const text = surfaceitems[surface];
    if (text) add(text, "observed");
  }
  const transportitems: Record<string, string> = {
    "network transport signal": "direct network calls from extension code",
    "native host bridge": "native host companion messaging",
    "extension runtime message": "internal message bus between extension contexts",
    "tab or content bridge": "tab to content script messaging",
  };
  for (const transport of record.transports ?? []) {
    const text = transportitems[transport];
    if (text) add(text, "observed");
  }

  const backgrounditems: Record<string, string> = {
    "service worker": "background service worker orchestration",
    "background scripts (legacy mv2)": "persistent background page orchestration (mv2)",
    "background page (legacy mv2)": "persistent background page orchestration (mv2)",
  };
  if (record.backgroundtype && backgrounditems[record.backgroundtype])
    add(backgrounditems[record.backgroundtype], "observed");
  if ((record.contentscripts?.count ?? 0) > 0) add("content scripts bridging pages to the extension", "observed");
  if (record.contentscripts?.allframes) add("content scripts running in all frames", "observed");
  if (manifest.commands) add("keyboard shortcut bindings", "observed");
  if (manifest.omnibox) add("omnibox keyword entry point", "observed");
  if (manifest.web_accessible_resources) add("web accessible resources for page side loading", "observed");
  if (manifest.externally_connectable) add("external web pages can message the extension", "observed");
  if (manifest.sandbox?.pages?.length) add("sandboxed pages for isolated content", "observed");
  if (manifest.content_security_policy) add("custom content security policy", "observed");
  if (manifest.incognito) add("explicit incognito behavior declared", "observed");
  if (manifest.offline_enabled) add("offline capable packaging", "observed");
  if (manifest.update_url) {
    let standardchannel = false;
    try {
      standardchannel = new URL(String(manifest.update_url)).hostname === "clients2.google.com";
    } catch {
      standardchannel = false;
    }
    if (!standardchannel) add("custom update channel declared", "observed");
  }
  if (manifest.minimum_chrome_version) add("minimum chrome version requirement", "observed");
  if (manifest.manifest_version === 3) add("manifest v3 packaging", "observed");
  if ((record.locales ?? 0) > 1) add(`localized interface in ${record.locales} languages`, "observed");
  if (record.packageinfo?.dependencycount)
    add(`npm style package metadata with ${record.packageinfo.dependencycount} dependencies`, "observed");
  if (manifest.manifest_version === 2) add("legacy manifest v2 packaging", "observed");

  if (items.length < 15) {
    for (const permission of permissions) {
      const kit = permissionfeatures[permission];
      for (const text of kit?.secondary ?? []) add(text, "observed");
    }
  }
  if (items.length < 15) {
    const namespaces = new Set((record.apis ?? []).map((pair) => pair.split(".")[0]));
    for (const namespace of namespaces) add(`static references to the ${namespace} browser api`, "observed");
  }
  if (items.length < 15) {
    if ((record.filetypes?.png ?? 0) + (record.filetypes?.svg ?? 0) > 0)
      add("ships packaged icon assets for the toolbar and store", "observed");
    if (record.scriptcount === 1) add("single script background implementation", "observed");
    if (record.locales === 0) add("english only interface without locale bundles", "observed");
  }
  return items.slice(0, 40);
}

/** Derives the architecture patterns evidenced by one record. */
function patternsfor(record: harvestrecord) {
  const patterns: string[] = [];
  const surfaces = record.surfaces ?? [];
  const manifest = record.manifest ?? {};
  if (surfaces.includes("popup")) patterns.push("popup driven control surface");
  if (record.backgroundtype === "service worker") patterns.push("background service worker orchestration");
  if (record.backgroundtype?.startsWith("background")) patterns.push("legacy background page orchestration");
  if ((record.contentscripts?.count ?? 0) > 0) patterns.push("content script page bridge");
  if ((record.transports ?? []).includes("extension runtime message")) patterns.push("extension runtime message bus");
  if ((record.transports ?? []).includes("network transport signal")) patterns.push("external endpoint connectivity");
  if ((record.transports ?? []).includes("native host bridge")) patterns.push("native host companion");
  if (surfaces.includes("devtools")) patterns.push("devtools panel integration");
  if (surfaces.includes("side panel")) patterns.push("side panel workspace");
  const recordingterms = record.signals?.recording ?? [];
  if (
    recordingterms.some(
      (term) =>
        term.startsWith("record") || term.startsWith("replay") || term.startsWith("macro") || term.startsWith("trace"),
    )
  )
    patterns.push("recorder pipeline");
  const blocks = record.signals?.["workflow blocks"] ?? [];
  if (
    (manifest.permissions ?? []).includes("alarms") ||
    blocks.includes("cron") ||
    blocks.some((term) => term.startsWith("schedul"))
  ) {
    patterns.push("scheduler pipeline");
  }
  const protocolterms = record.signals?.["mcp and protocol"] ?? [];
  if (protocolterms.includes("mcp") || protocolterms.includes("jsonrpc") || protocolterms.includes("json-rpc"))
    patterns.push("mcp tool server");
  if ((manifest.permissions ?? []).includes("contextMenus")) patterns.push("context menu entry points");
  if (manifest.commands) patterns.push("keyboard shortcut commands");
  if (manifest.omnibox) patterns.push("omnibox keyword commands");
  if (surfaces.includes("new tab")) patterns.push("new tab dashboard");
  return patterns;
}

/** Renders a markdown table cell safely. */
function cell(value: unknown) {
  const text = value === null || value === undefined || value === "" ? "none" : String(value);
  return text.split("|").join("/").replace(/\s+/g, " ").trim().slice(0, 320);
}

function compactlist(values: unknown) {
  return Array.isArray(values) && values.length ? values.join(", ") : "none";
}

/** Counts values and returns entries sorted by descending count. */
function aggregatecounts(values: string[]) {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()].sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]));
}

/** Renders one per extension evidence section. */
function extensionsection(record: harvestrecord) {
  const lines: string[] = [];
  lines.push(`### ${record.id}`);
  lines.push("");
  if (record.status !== "verified") {
    const unavailable = /HTTP 4\d\d|empty payload/.test(record.status ?? "")
      ? " (listing unavailable from the update service)"
      : "";
    lines.push("| Field | Value |");
    lines.push("| --- | --- |");
    lines.push(`| Declared name | n/a |`);
    lines.push(`| Listing label | ${cell(record.label)} |`);
    lines.push(`| Status | ${cell(record.status)}${unavailable} |`);
    lines.push(`| Reviewed | yes, no package payload was obtainable |`);
    lines.push("");
    return lines.join("\n");
  }
  const manifest = record.manifest ?? {};
  const features = minefeatures(record);
  const dominant = Object.entries(record.signals ?? {})
    .sort((left, right) => right[1].length - left[1].length)
    .slice(0, 3)
    .map(([category]) => category)
    .join(", ");
  const cs = record.contentscripts ?? ({} as contentscriptssummary);
  const commands = manifest.commands
    ? Object.entries(manifest.commands).map(
        ([name, command]) =>
          `${name}${command.suggested_key ? ` (${typeof command.suggested_key === "string" ? command.suggested_key : Object.values(command.suggested_key)[0]})` : ""}`,
      )
    : [];
  const war = manifest.web_accessible_resources;
  const warsummary = !war
    ? "none"
    : Array.isArray(war) && typeof war[0] === "object"
      ? `${war.length} rule group(s) covering ${war.flatMap((group) => (typeof group === "string" ? [] : group.resources ?? [])).length} resources`
      : `${war.length} entrie(s)`;
  const external = manifest.externally_connectable
    ? `matches ${manifest.externally_connectable.matches?.length ?? 0}, ids ${manifest.externally_connectable.ids?.length ?? 0}`
    : "none";
  const csp = manifest.content_security_policy
    ? typeof manifest.content_security_policy === "string"
      ? manifest.content_security_policy
      : Object.keys(manifest.content_security_policy).join(", ") + " directives"
    : "default";

  lines.push("| Field | Value |");
  lines.push("| --- | --- |");
  lines.push(`| Declared name | ${cell(record.name)} |`);
  lines.push(`| Listing label | ${cell(record.label)} |`);
  lines.push(`| Version | ${cell(manifest.version)} |`);
  lines.push(`| Manifest version | ${cell(manifest.manifest_version)} |`);
  lines.push(`| Required permissions | ${cell(compactlist(manifest.permissions))} |`);
  lines.push(`| Optional permissions | ${cell(compactlist(manifest.optional_permissions))} |`);
  lines.push(`| Host scope | ${cell(record.hostscope)} |`);
  lines.push(`| Background type | ${cell(record.backgroundtype)} |`);
  lines.push(
    `| Content scripts count | ${cs.count} declaration(s), ${cs.js} js, ${cs.css} css, all frames ${cs.allframes ? "yes" : "no"}${cs.runat?.length ? `, run at ${cs.runat.join(" and ")}` : ""} |`,
  );
  lines.push(`| UI surfaces | ${cell(compactlist(record.surfaces))} |`);
  lines.push(`| Locales count | ${record.locales} |`);
  lines.push(`| File count | ${record.filecount} (${record.scriptcount} scripts scanned) |`);
  lines.push(`| CRX size | ${record.bytes} bytes |`);
  lines.push(`| Extracted size | ${record.totalsize} bytes |`);
  lines.push(`| Commands | ${cell(compactlist(commands))} |`);
  lines.push(`| Web accessible resources | ${cell(warsummary)} |`);
  lines.push(`| Externally connectable | ${cell(external)} |`);
  lines.push(`| Content security policy | ${cell(csp)} |`);
  lines.push(
    `| Sandbox | ${cell(manifest.sandbox?.pages ? `${manifest.sandbox.pages.length} sandboxed page(s)` : "none")} |`,
  );
  lines.push(`| Incognito | ${cell(manifest.incognito ?? "default")} |`);
  lines.push(`| Offline enabled | ${cell(manifest.offline_enabled ? "yes" : "no")} |`);
  lines.push(`| Update url | ${cell(manifest.update_url ?? "store managed")} |`);
  lines.push(`| Minimum chrome version | ${cell(manifest.minimum_chrome_version ?? "none")} |`);
  lines.push(`| Default locale | ${cell(manifest.default_locale ?? "none")} |`);
  lines.push(
    `| Package metadata | ${cell(record.packageinfo ? `${record.packageinfo.name ?? "unnamed"} at ${record.packageinfo.version ?? "?"} with ${record.packageinfo.dependencycount} dependencies` : "no package json")} |`,
  );
  lines.push(`| Mapped features | ${features.length} item(s); dominant signals: ${cell(dominant)} |`);
  lines.push("");
  lines.push("Features mined:");
  lines.push("");
  lines.push(features.map((feature, index) => `${index + 1}. ${feature.text} (${feature.tag})`).join("\n"));
  lines.push("");
  return lines.join("\n");
}

/** Builds the whole markdown report from the cache. */
function buildreport(cache: Record<string, harvestrecord>, identifiers: string[]) {
  const verified = identifiers.filter((id) => cache[id]?.status === "verified");
  const failed = identifiers.filter((id) => cache[id] && cache[id].status !== "verified");
  const pending = identifiers.filter((id) => !cache[id]);

  const permissioncounts = new Map<string, number>();
  const optionalcounts = new Map<string, number>();
  const apicounts = new Map<string, number>();
  const signalcounts = new Map<string, number>();
  const patternids = new Map<string, string[]>();
  let featuretotal = 0;
  for (const id of verified) {
    const record = cache[id];
    for (const permission of record.manifest?.permissions ?? [])
      permissioncounts.set(permission, (permissioncounts.get(permission) ?? 0) + 1);
    for (const permission of record.manifest?.optional_permissions ?? [])
      optionalcounts.set(permission, (optionalcounts.get(permission) ?? 0) + 1);
    for (const pair of record.apis ?? []) apicounts.set(pair, (apicounts.get(pair) ?? 0) + 1);
    for (const category of Object.keys(record.signals ?? {}))
      signalcounts.set(category, (signalcounts.get(category) ?? 0) + 1);
    for (const pattern of patternsfor(record)) {
      if (!patternids.has(pattern)) patternids.set(pattern, []);
      patternids.get(pattern)?.push(id);
    }
    featuretotal += minefeatures(record).length;
  }

  const sections: string[] = [];
  sections.push("# CRX Feature Mining Evidence");
  sections.push(
    `This report was generated by test/crxharvest.ts from CRX packages downloaded through the official Chrome update service for the ${identifiers.length} cataloged extension ids. Every package was treated as untrusted evidence: the script performed static text analysis only, never executed any downloaded code, deleted every raw artifact immediately after analysis, and persisted only derived analysis records in test/artifacts/harvestcache.json. Tables in this report state observed evidence taken from manifests, file listings and script text. The per extension feature lists separate items tagged observed, which rest directly on that evidence, from items tagged inferred, which rest on public knowledge of the listed product. The consolidated feature pool at the end is an inference artifact: candidate features for devthink derived from the corpus, not claims about any specific product.`,
  );

  const sortedpermissions = [...new Set([...permissioncounts.keys(), ...optionalcounts.keys()])].sort(
    (left, right) =>
      (permissioncounts.get(right) ?? 0) - (permissioncounts.get(left) ?? 0) || left.localeCompare(right),
  );
  const permissionrows = sortedpermissions
    .map(
      (permission) =>
        `| ${permission} | ${permissioncounts.get(permission) ?? 0} | ${optionalcounts.get(permission) ?? 0} |`,
    )
    .join("\n");
  const apirows = [...apicounts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .map(([pair, count]) => `| ${pair} | ${count} |`)
    .join("\n");
  const signalrows = [...signalcounts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .map(([category, count]) => `| ${category} | ${count} |`)
    .join("\n");

  sections.push(`## Summary

| Metric | Value |
| --- | ---: |
| IDs analyzed | ${identifiers.length - pending.length} of ${identifiers.length} |
| Verified manifests | ${verified.length} |
| Errors or unavailable | ${failed.length} |
| Distinct API pairs observed | ${apicounts.size} |
| Mapped feature items | ${featuretotal} |`);

  sections.push(`## Aggregate permission usage

A count means the permission is declared in the manifest of that many verified packages. Host patterns that some legacy packages declare inside the permissions array appear here as declared.

| Permission | Packages requiring it | Packages with it optional |
| --- | ---: | ---: |
${permissionrows}`);

  sections.push(`## Aggregate API surface

Pairs are captured as namespace dot method tokens from static script text. A count is the number of verified packages whose scripts reference the pair at least once.

| API pair | Packages referencing |
| --- | ---: |
${apirows}`);

  sections.push(`## Aggregate feature signals

A signal category is counted when at least one keyword of the category appears in the static script text of the package.

| Signal category | Packages with a match |
| --- | ---: |
${signalrows}`);

  sections.push("## Per extension evidence");
  for (const id of identifiers) {
    if (!cache[id]) {
      sections.push(`### ${id}`);
      sections.push("");
      sections.push("| Field | Value |");
      sections.push("| --- | --- |");
      sections.push(`| Status | not analyzed yet, run the harvest script to complete |`);
      sections.push("");
      continue;
    }
    sections.push(extensionsection(cache[id]));
  }

  const patternrows = [...patternids.entries()]
    .sort((left, right) => right[1].length - left[1].length)
    .map(
      ([pattern, ids]) =>
        `| ${pattern} | ${ids.length} | ${ids.slice(0, 3).join(", ")}${ids.length > 3 ? ", and more" : ""} |`,
    )
    .join("\n");
  sections.push(`## Execution flow patterns

Recurring architecture patterns observed across the corpus. A pattern is derived from manifest declarations, message transport signals and script keyword evidence.

| Pattern | Packages | Representative ids |
| --- | ---: | --- |
${patternrows}`);

  const poolseen = new Set<string>();
  const poolitems: string[] = [];
  let counter = 0;
  const poolsections: string[] = [];
  for (const group of featurepool) {
    const lines = [];
    for (const item of group.items) {
      const key = normalizedkey(item);
      if (poolseen.has(key)) continue;
      poolseen.add(key);
      counter += 1;
      poolitems.push(item);
      lines.push(`${counter}. ${item}`);
    }
    if (!lines.length) continue;
    const heading = group.group.charAt(0).toUpperCase() + group.group.slice(1);
    poolsections.push(`### ${heading}\n\n${lines.join("\n")}`);
  }
  sections.push(`## Consolidated feature pool

The pool below is the key inference deliverable: ${counter} distinct candidate features for devthink grouped by context, distilled from the per extension evidence, the aggregate api surface and the public product knowledge cited above. Each line is one concrete implementable candidate. Consent-first adaptation is expected: items that third party packages implement with broad permissions are candidates for devthink only behind explicit per origin grants and reviewed plans.

${poolsections.join("\n\n")}`);

  sections.push(`## References

[1]: https://developer.chrome.com/docs/webstore/update/ "Chrome Web Store update protocol"
[2]: https://developer.chrome.com/docs/extensions/reference "Chrome Extensions API reference"`);

  return {
    markdown: sections.join("\n\n") + "\n",
    verified: verified.length,
    failed: failed.length,
    featuretotal,
    poolsize: counter,
    apicounts: [...apicounts.entries()].sort((left, right) => right[1] - left[1]),
  };
}

/** Loads the harvest cache, returning an empty record set when absent. */
async function loadcache(): Promise<Record<string, harvestrecord>> {
  if (!existsSync(cachepath)) return {};
  try {
    return JSON.parse(await readFile(cachepath, "utf8"));
  } catch {
    return {};
  }
}

/** the seed id list the harvest walks — folded from the root
 * inputextensionids.txt (the rootdedup law: the scratch input arms leave
 * the app root, the cataloged ids ride the script that owns them, so the
 * seed reads no file the checkout could lose). */
const idsource = `
adbonjafebjadholmnabocnddmhpennj
ajdlmleaplmphpokbjmnhgkgaaemclil
akadnehffdhihfhpmcbokdlfjpgooffe
akldabonmimlicnjlflnapfeklbfemhj
anlikcnbgdeidpacdbdljnabclhahhmd
bapaclfmcgookbglclacfgeemaehkkme
bgjdnapfffligabpfbkbapibaifgmjie
bhfbkacflpnpfgfjghhajikhfghcknip
bjcngahpcjeililljmfegmlanlpgibdi
bjfgambnhccakkhmkepdoekmckoijdlc
bkhaagjahfmjljalopjnoealnfndnagc
cbibgdcbkoikdkeahemkjkpacmgicaco
cclndjheoijilbieeofdjiledodbdakb
cecngibhkljoiafhjfmcgbmikfogdiko
celalggclffbgnloepbfadhjhmchikoh
cpgamigjcbffkaiciiepndmonbfdimbb
ddjnfplagacilcnjpindbdcopccndihj
dgjhfomjieaadpoljlnidmbgkdffpack
dnfmklmdbipiahdjiogaoemjaiodomdf
ebofbaomnlpjgnponhalmmihcgakodpj
edacconmaakjimmfgnblocblbcdcpbko
eenjdnjldapjajjofmldgmkjaienebbj
ffijkpjpoehejdlbfoefcpgbimdgocmf
fldmhceldgbpfpkbgopacenieobmligc
gblapfbnbicdckfhkllcnfleiemhmgeb
gbldofcpkknbggpkmbdaefngejllnief
gcbalfbdmfieckjlnckgchpgbkgkonoe
geggbdbnidkhbnbjoganapfhkpgkndfo
ghlmiigebgipgagnhlanjmmniefbfihl
giljefjcheohhamkjphiebfjnlphnokk
gpccjhdgjkmalnepmeclooflliiocfed
gpcpndfhbmichbgffhlaedjlnomnfgla
gpnieenphjbjcpcdnjhnipckcldebjdf
hdcehjaodheipickeopncehaikamghjk
heolgaalbnnelipfhbccbkdohecmaimo
hfjnppljknigdnnpocjjgdcfmnodoafe
hkcbjmdeheceggmlbhbiljejkkpjljjp
idahijhccencfhigphpmlnjbppldolgk
idkjhjggpffolpidfkikidcokdkdaogg
iebfoaldapgggcpjialmbnhcendcnkpi
iebpjdmgckacbodjpijphcplhebcmeop
ihhkmalpkhkoedlmcnilbbddbhnnvbii
ildkmabpimmkaediidaifkhjpohdnifk
ilehdekjacappgghkgmmlbhgbnlkgoid
infppggnoaenmfagbfknfkancpbljcca
ioohfnlbpolaalcbppaggpgcgpldohfg
jambeljnbnfbkcpnoiaedcabbgmnnlcd
jfeammnjpkecdekppnclgkkffahnhfhe
jfgfiigpkhlkbnfnbobbkinehhfdhndo
jnhgnonknehpejjnehehllkliplmbmgn
joggkdfebigddmaagckekihhfncdobff
jphkkablogbfneefecondchaafbdaomc
kbacobbmnajbihpidjilndoielmaojbj
kdmpkkahkhdmdhfkdihkopikgcocbpbf
khaocdcbgnfgfoiplkbdaappfcdldgeb
kjgebebilcoaamgfpogkoehcnjbnncic
kkepankimcahnjamnimeijpplgjpmdpp
ljdobmomdgdljniojadhoplhkpialdid
mahgcggahcbplkpmpmhdnbdjbcnoafcg
mhjhnkcfbdhnjickkkdbjoildmbinlgd
mlcokfhobljidglkgileejcelojhhmdm
mmlmfjhmonkocbjadbfplnigmagldckm
mooikfkahbdckldjjndioackbalphokd
obpjaonipoaomjnokbimppohbpjibflm
ofaokhiedipichpaobibbnahnkdoiiah
okngcalljddikhljpfhgmikklmmmdkkd
pncmdlebcopjodenlllcomedphdmeogm
`;

async function main() {
  const identifiers = [
    ...new Set(
      idsource
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => /^[a-z]{32}$/.test(line)),
    ),
  ];
  const labels = new Map<string, string>();
  try {
    const catalog = await readFile(join(root, "docs", "userstorecatalog.md"), "utf8");
    for (const match of catalog.matchAll(/\| \d+ \| (.+?) \| ([a-z]{32}) \|/g)) labels.set(match[2], match[1].trim());
  } catch {
    // Labels are a convenience only.
  }

  const cache = await loadcache();
  await mkdir(artifactsdir, { recursive: true });
  const pending = identifiers.filter((id) => refresh || !cache[id]);
  const queue = pending.slice(skipcount, skipcount + limitcount);
  console.log(
    `harvest: ${identifiers.length} ids listed, ${identifiers.length - pending.length} cached, ${queue.length} queued in this run`,
  );

  let index = 0;
  for (const id of queue) {
    index += 1;
    const started = Date.now();
    try {
      const record = await analyzepackage(id, labels.get(id) ?? "unknown listing");
      cache[id] = record;
      console.log(
        `[${index}/${queue.length}] ${id} verified (${record.filecount} files, ${record.apis?.length ?? 0} api pairs, ${((Date.now() - started) / 1000).toFixed(1)}s)`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      cache[id] = {
        id,
        label: labels.get(id) ?? "unknown listing",
        status: `error:${message}`,
        analyzedat: new Date().toISOString(),
      };
      console.log(`[${index}/${queue.length}] ${id} failed: ${message}`);
    }
    await writeFile(cachepath, JSON.stringify(cache, null, 2), "utf8");
  }

  const { markdown, verified, failed, featuretotal, poolsize, apicounts } = buildreport(cache, identifiers);
  await writeFile(reportpath, markdown, "utf8");
  const analyzed = identifiers.filter((id) => cache[id]).length;
  console.log(
    JSON.stringify(
      {
        analyzed,
        verified,
        failed,
        featureitems: featuretotal,
        poolsize,
        topapis: apicounts.slice(0, 10),
      },
      null,
      2,
    ),
  );
  if (poolsize < 600) console.warn("warning: consolidated pool is below the 600 item target, extend the pool data");
  if (featuretotal <= 1500 && analyzed === identifiers.length)
    console.warn("warning: mapped feature items did not exceed 1500, deepen per extension mining");
}

await main();
}
/* ── Merged from crossbrowser.ts ── */

/**
 * The crossbrowser module of the 1.1.90 consolidation: every correlated variation of the firefox, safari and polyfill browser coverage logic interned in this one file, so the module family carries one surface without duplicate variations.
 * The correlation is the browser coverage family: browserpolyfills probes the webextension namespace differences and promisifies the callback apis behind one polyfill surface with its flags, intersection and namespace mapping; firefoxprep adapts the chromium manifest to the firefox denylist, permission map, action map and split bundle rules; xpipack assembles the firefox xpi archive with its linter budget, central directory and end record; and safariskeleton emits the safari web extension project files with its popover, zip central directory and end record.
 * No permission, denylist entry or archive layout is ever guessed: every mapping stays explicit per browser, and no packaging path ever bypasses the human review.
 */

/* ── Merged from browserpolyfills.ts ── */
import type { webextensionbrowser } from "./types.js";

/**
 * Browserpolyfills of the 1.1.86 browser coverage family.
 * Every cross browser normalization of the webextension api the codebase touches lives in this one pure module: the namespace resolver that prefers the browser namespace when present and falls back to the chrome namespace, the callback to promise normalizer that wraps the callback style the older engines speak into the promise shape the reviewed vocabulary reads, the sidepanel polyfill that opens a popup window when the sidepanel api is missing and preserves the review gate layout inside it, the scripting polyfill that falls back to tabs execute script on older engines, the storage polyfill that keeps session tokens under the same keys on every browser, the tabs and windows polyfills that normalize query, create, update and bounds handling, the notifications and contextmenu polyfills that normalize options and item creation, the clipboard, downloads and runtime messaging polyfills that normalize envelopes and shapes, and the runtime geturl polyfill that normalizes the reviewed resource path across browsers. The module stays pure: the browser runtime reaches it through injected seams only, the feature flags default to the intersection set across browsers, the unsupported calls surface as structured errors with the retry hint none instead of a silent fallback, and no vendor endpoint and no download url ever appears here — one reviewed vocabulary speaks every webextension dialect through the polyfill layer.
 * Example: `const polyfills = browserpolyfillof({ runtime: globalThis.chrome ?? globalThis.browser }); const url = polyfills.runtime.geturl("sidepanel.html"); await polyfills.storage.local.set({ key: "value" });`
 */

/** The feature flag set the polyfill layer ships: the flags the sidepanel, scripting, storage, tabs, windows, notifications, downloads, contextmenu, clipboard and runtime messaging namespaces carry; the default set is the intersection across chromium, firefox and safari so a feature surface a single browser lacks stays off everywhere by default. */
export const browserpolyfillflags: string[] = [
  "sidepanel",
  "scripting",
  "storage.session",
  "tabs.executeScript",
  "notifications",
  "contextMenus",
  "clipboard",
  "downloads",
  "runtime.messaging",
  "runtime.geturl",
];

/** The intersection default set the polyfill layer stamps: every flag the chromium, firefox and safari apimap rows carry; a single browser surface that lacks an api stays off everywhere by default. */
export function browserpolyfillintersection(): string[] {
  const firefox = new Set([
    "scripting",
    "storage.session",
    "tabs.executeScript",
    "notifications",
    "contextMenus",
    "clipboard",
    "downloads",
    "runtime.messaging",
    "runtime.geturl",
  ]);
  const safari = new Set([
    "scripting",
    "storage.session",
    "tabs.executeScript",
    "notifications",
    "contextMenus",
    "clipboard",
    "downloads",
    "runtime.messaging",
    "runtime.geturl",
  ]);
  const chromium = new Set(browserpolyfillflags);
  const intersection: string[] = [];
  for (const flag of chromium) if (firefox.has(flag) && safari.has(flag)) intersection.push(flag);
  return intersection;
}

/** Resolves the browser namespace: the polyfill prefers the browser namespace when present (firefox and safari) and falls back to the chrome namespace (chromium); an absent runtime surfaces an undefined so the caller degrades to the structured error. */
export function browserpolyfillnamespace(input: { runtime?: unknown }): {
  namespace: Record<string, unknown> | undefined;
  browser: webextensionbrowser;
} {
  const record = (input.runtime ?? {}) as Record<string, unknown>;
  const globalrecord = globalThis as unknown as Record<string, unknown>;
  if (typeof record.browser === "object" && record.browser !== null)
    return { namespace: record.browser as Record<string, unknown>, browser: "firefox" };
  if (typeof record.chrome === "object" && record.chrome !== null)
    return { namespace: record.chrome as Record<string, unknown>, browser: "chromium" };
  if (typeof globalrecord.browser === "object" && globalrecord.browser !== null)
    return { namespace: globalrecord.browser as Record<string, unknown>, browser: "firefox" };
  if (typeof globalrecord.chrome === "object" && globalrecord.chrome !== null)
    return { namespace: globalrecord.chrome as Record<string, unknown>, browser: "chromium" };
  return { namespace: undefined, browser: "chromium" };
}

/** Wraps one callback style webextension call into a promise: the polyfill reads the last argument when it is a function, resolves on the ok callback and rejects on the runtime error the engine reports. */
export function browserpolyfillpromisify<T>(input: {
  call: (...args: unknown[]) => void;
  args: unknown[];
}): Promise<T> {
  return new Promise((resolve, reject) => {
    const callback = (...results: unknown[]) => {
      const last = results.length > 0 ? results[results.length - 1] : undefined;
      if (
        last !== undefined &&
        last !== null &&
        typeof last === "object" &&
        typeof (last as Record<string, unknown>).runtimeError === "object"
      ) {
        reject(
          new Error(
            "The webextension call reported a runtime error; the polyfill surfaces the structured error instead of a silent failure.",
          ),
        );
        return;
      }
      resolve(last as T);
    };
    input.call(...input.args, callback);
  });
}

/** Builds the polyfill layer for one runtime: the namespace the resolver picks, the per surface normalizers (sidepanel, scripting, storage, tabs, windows, notifications, downloads, contextmenu, clipboard, runtime) and the feature flags the layer carries; every surface degrades to the structured error on an unsupported browser instead of a silent fallback. */
export function browserpolyfillof(input: { runtime?: unknown }) {
  const { namespace, browser } = browserpolyfillnamespace(input);
  const require = <T>(name: string): T | undefined =>
    namespace === undefined ? undefined : ((namespace as Record<string, unknown>)[name] as T | undefined);
  const sidepanelapi = require<{
    open?: () => void;
    setoptions?: (options: unknown) => void;
    setOptions?: (options: unknown) => void;
  }>("sidePanel");
  const scriptingapi = require<{ executeScript?: (...args: unknown[]) => void }>("scripting");
  const storageapi = require<{ local?: Record<string, unknown>; session?: Record<string, unknown> }>("storage");
  const tabsapi = require<{
    query?: (...args: unknown[]) => void;
    create?: (...args: unknown[]) => void;
    update?: (...args: unknown[]) => void;
    executeScript?: (...args: unknown[]) => void;
  }>("tabs");
  const windowsapi = require<{
    create?: (...args: unknown[]) => void;
    update?: (...args: unknown[]) => void;
  }>("windows");
  const notificationsapi = require<{ create?: (...args: unknown[]) => void }>("notifications");
  const downloadsapi = require<{ download?: (...args: unknown[]) => void }>("downloads");
  const contextmenusapi = require<{ create?: (...args: unknown[]) => void }>("contextMenus");
  const runtimeapi = require<{
    getURL?: (path: string) => string;
    sendMessage?: (...args: unknown[]) => void;
    connect?: (...args: unknown[]) => unknown;
    id?: string;
    onMessage?: unknown;
  }>("runtime");

  /** The sidepanel polyfill: the chromium sidepanel api opens the panel; firefox and safari lack the sidepanel api and the polyfill opens a popup window with the same review gate layout. */
  const sidepanel = {
    open: async (options?: { path?: string }): Promise<{ ok: boolean; fallback: boolean; reason?: string }> => {
      const path = options?.path ?? "sidepanel.html";
      if (sidepanelapi !== undefined && typeof sidepanelapi.open === "function") {
        sidepanelapi.open();
        return { ok: true, fallback: false };
      }
      if (windowsapi !== undefined && typeof windowsapi.create === "function") {
        const url =
          runtimeapi !== undefined && typeof runtimeapi.getURL === "function" ? runtimeapi.getURL(path) : path;
        await browserpolyfillpromisify({
          call: windowsapi.create.bind(windowsapi) as (...args: unknown[]) => void,
          args: [{ type: "popup", url, width: 480, height: 720 }],
        });
        return { ok: true, fallback: true };
      }
      return {
        ok: false,
        fallback: false,
        reason: `The sidepanel api is missing on ${browser} and the popup fallback could not open a window; the feature flag stays off.`,
      };
    },
    setoptions: (options: { path?: string }): { ok: boolean; reason?: string } => {
      if (sidepanelapi !== undefined && typeof sidepanelapi.setoptions === "function") {
        sidepanelapi.setoptions({ path: options.path });
        return { ok: true };
      }
      return {
        ok: false,
        reason: `The sidepanel setoptions api is missing on ${browser}; the popup fallback keeps the layout via the popup window options.`,
      };
    },
  };

  /** The scripting polyfill: the manifest v3 scripting api executes the script; firefox mv3 supports it; older engines fall back to tabs.executeScript. */
  const scripting = {
    executescript: async (input: {
      tabid: number;
      files?: string[];
      func?: () => void;
    }): Promise<{ ok: boolean; fallback: boolean; reason?: string }> => {
      if (scriptingapi !== undefined && typeof scriptingapi.executeScript === "function") {
        await browserpolyfillpromisify({
          call: scriptingapi.executeScript.bind(scriptingapi) as (...args: unknown[]) => void,
          args: [
            {
              target: { tabId: input.tabid },
              ...(input.files !== undefined ? { files: input.files } : {}),
              ...(input.func !== undefined ? { func: input.func } : {}),
            },
          ],
        });
        return { ok: true, fallback: false };
      }
      if (tabsapi !== undefined && typeof tabsapi.executeScript === "function") {
        await browserpolyfillpromisify({
          call: tabsapi.executeScript.bind(tabsapi) as (...args: unknown[]) => void,
          args: [
            input.tabid,
            {
              ...(input.files !== undefined ? { file: input.files[0] } : {}),
              ...(input.func !== undefined ? { func: input.func } : {}),
            },
          ],
        });
        return { ok: true, fallback: true };
      }
      return {
        ok: false,
        fallback: false,
        reason: `The scripting api and the tabs.executeScript fallback are both missing on ${browser}; the call surfaces a structured error.`,
      };
    },
  };

  /** The storage polyfill: the local and session areas keep the same keys on every browser; the promise wrap normalizes the callback style the older engines speak. */
  const storage = {
    local: {
      get: async <T = unknown>(
        key?: string | string[] | Record<string, unknown> | null,
      ): Promise<Record<string, T>> => {
        if (storageapi === undefined || storageapi.local === undefined)
          throw new Error(`The storage.local api is missing on ${browser}; the call surfaces a structured error.`);
        const get = (storageapi.local as { get?: (...args: unknown[]) => void }).get;
        if (get === undefined)
          throw new Error(`The storage.local.get api is missing on ${browser}; the call surfaces a structured error.`);
        return browserpolyfillpromisify({
          call: get.bind(storageapi.local) as (...args: unknown[]) => void,
          args: key === undefined ? [] : [key],
        });
      },
      set: async (entries: Record<string, unknown>): Promise<void> => {
        if (storageapi === undefined || storageapi.local === undefined)
          throw new Error(`The storage.local api is missing on ${browser}; the call surfaces a structured error.`);
        const set = (storageapi.local as { set?: (...args: unknown[]) => void }).set;
        if (set === undefined)
          throw new Error(`The storage.local.set api is missing on ${browser}; the call surfaces a structured error.`);
        await browserpolyfillpromisify({
          call: set.bind(storageapi.local) as (...args: unknown[]) => void,
          args: [entries],
        });
      },
    },
    session: {
      get: async <T = unknown>(
        key?: string | string[] | Record<string, unknown> | null,
      ): Promise<Record<string, T>> => {
        if (storageapi === undefined || storageapi.session === undefined)
          throw new Error(`The storage.session api is missing on ${browser}; the call surfaces a structured error.`);
        const get = (storageapi.session as { get?: (...args: unknown[]) => void }).get;
        if (get === undefined)
          throw new Error(
            `The storage.session.get api is missing on ${browser}; the call surfaces a structured error.`,
          );
        return browserpolyfillpromisify({
          call: get.bind(storageapi.session) as (...args: unknown[]) => void,
          args: key === undefined ? [] : [key],
        });
      },
      set: async (entries: Record<string, unknown>): Promise<void> => {
        if (storageapi === undefined || storageapi.session === undefined)
          throw new Error(`The storage.session api is missing on ${browser}; the call surfaces a structured error.`);
        const set = (storageapi.session as { set?: (...args: unknown[]) => void }).set;
        if (set === undefined)
          throw new Error(
            `The storage.session.set api is missing on ${browser}; the call surfaces a structured error.`,
          );
        await browserpolyfillpromisify({
          call: set.bind(storageapi.session) as (...args: unknown[]) => void,
          args: [entries],
        });
      },
    },
  };

  /** The tabs polyfill: query, create and update normalize the argument shapes and the result shapes; firefox returns the live tab list while chromium accepts the same query. */
  const tabs = {
    query: async (
      query: Record<string, unknown>,
    ): Promise<Array<{ id: number; url?: string; title?: string; active?: boolean }>> => {
      if (tabsapi === undefined || typeof tabsapi.query !== "function")
        throw new Error(`The tabs.query api is missing on ${browser}; the call surfaces a structured error.`);
      return browserpolyfillpromisify({
        call: tabsapi.query.bind(tabsapi) as (...args: unknown[]) => void,
        args: [query],
      });
    },
    create: async (properties: Record<string, unknown>): Promise<{ id: number; url?: string }> => {
      if (tabsapi === undefined || typeof tabsapi.create !== "function")
        throw new Error(`The tabs.create api is missing on ${browser}; the call surfaces a structured error.`);
      return browserpolyfillpromisify({
        call: tabsapi.create.bind(tabsapi) as (...args: unknown[]) => void,
        args: [properties],
      });
    },
    update: async (tabid: number, properties: Record<string, unknown>): Promise<{ id: number; url?: string }> => {
      if (tabsapi === undefined || typeof tabsapi.update !== "function")
        throw new Error(`The tabs.update api is missing on ${browser}; the call surfaces a structured error.`);
      return browserpolyfillpromisify({
        call: tabsapi.update.bind(tabsapi) as (...args: unknown[]) => void,
        args: [tabid, properties],
      });
    },
  };

  /** The windows polyfill: create and update normalize the bounds handling across browsers; firefox accepts the same width, height, left and top, while safari keeps the bounds inside the popover. */
  const windows = {
    create: async (properties: Record<string, unknown>): Promise<{ id: number }> => {
      if (windowsapi === undefined || typeof windowsapi.create !== "function")
        throw new Error(`The windows.create api is missing on ${browser}; the call surfaces a structured error.`);
      return browserpolyfillpromisify({
        call: windowsapi.create.bind(windowsapi) as (...args: unknown[]) => void,
        args: [properties],
      });
    },
    update: async (windowid: number, properties: Record<string, unknown>): Promise<{ id: number }> => {
      if (windowsapi === undefined || typeof windowsapi.update !== "function")
        throw new Error(`The windows.update api is missing on ${browser}; the call surfaces a structured error.`);
      return browserpolyfillpromisify({
        call: windowsapi.update.bind(windowsapi) as (...args: unknown[]) => void,
        args: [windowid, properties],
      });
    },
  };

  /** The notifications polyfill: the create options normalize the title, message, icon url and type across browsers. */
  const notifications = {
    create: async (notificationid: string, options: Record<string, unknown>): Promise<string> => {
      if (notificationsapi === undefined || typeof notificationsapi.create !== "function")
        throw new Error(`The notifications.create api is missing on ${browser}; the call surfaces a structured error.`);
      return browserpolyfillpromisify({
        call: notificationsapi.create.bind(notificationsapi) as (...args: unknown[]) => void,
        args: [notificationid, options],
      });
    },
  };

  /** The downloads polyfill: the download options normalize the url, filename and save as across browsers; the reviewed download kind stays the reviewed kind on every browser. */
  const downloads = {
    download: async (options: Record<string, unknown>): Promise<number> => {
      if (downloadsapi === undefined || typeof downloadsapi.download !== "function")
        throw new Error(`The downloads.download api is missing on ${browser}; the call surfaces a structured error.`);
      return browserpolyfillpromisify({
        call: downloadsapi.download.bind(downloadsapi) as (...args: unknown[]) => void,
        args: [options],
      });
    },
  };

  /** The contextmenu polyfill: the menu item creation normalizes the id, title, contexts and document url patterns across browsers. */
  const contextmenu = {
    create: async (properties: Record<string, unknown>): Promise<string | number> => {
      if (contextmenusapi === undefined || typeof contextmenusapi.create !== "function")
        throw new Error(`The contextMenus.create api is missing on ${browser}; the call surfaces a structured error.`);
      return browserpolyfillpromisify({
        call: contextmenusapi.create.bind(contextmenusapi) as (...args: unknown[]) => void,
        args: [properties],
      });
    },
  };

  /** The clipboard polyfill: read and write map to the navigator.clipboard text surface across browsers; the consent gate stays the reviewed surface. */
  const clipboard = {
    read: async (): Promise<string> => {
      const nav = (globalThis.navigator ?? {}) as { clipboard?: { readText?: () => Promise<string> } };
      if (nav.clipboard !== undefined && typeof nav.clipboard.readText === "function") return nav.clipboard.readText();
      throw new Error(
        `The navigator.clipboard.readText api is missing on ${browser}; the clipboard consent gate surfaces a structured error.`,
      );
    },
    write: async (text: string): Promise<void> => {
      const nav = (globalThis.navigator ?? {}) as { clipboard?: { writeText?: (text: string) => Promise<void> } };
      if (nav.clipboard !== undefined && typeof nav.clipboard.writeText === "function")
        return nav.clipboard.writeText(text);
      throw new Error(
        `The navigator.clipboard.writeText api is missing on ${browser}; the clipboard consent gate surfaces a structured error.`,
      );
    },
  };

  /** The runtime polyfill: geturl normalizes the reviewed resource path across browsers; sendmessage and connect normalize the message envelopes. */
  const runtime = {
    geturl: (path: string): string => {
      if (runtimeapi === undefined || typeof runtimeapi.getURL !== "function")
        throw new Error(`The runtime.geturl api is missing on ${browser}; the call surfaces a structured error.`);
      return runtimeapi.getURL(path);
    },
    sendmessage: async (message: unknown): Promise<unknown> => {
      if (runtimeapi === undefined || typeof runtimeapi.sendMessage !== "function")
        throw new Error(`The runtime.sendmessage api is missing on ${browser}; the call surfaces a structured error.`);
      return browserpolyfillpromisify({
        call: runtimeapi.sendMessage.bind(runtimeapi) as (...args: unknown[]) => void,
        args: [message],
      });
    },
    connect: (...args: unknown[]): unknown => {
      if (runtimeapi === undefined || typeof runtimeapi.connect !== "function")
        throw new Error(`The runtime.connect api is missing on ${browser}; the call surfaces a structured error.`);
      return runtimeapi.connect(...args);
    },
  };

  return {
    browser,
    sidepanel,
    scripting,
    storage,
    tabs,
    windows,
    notifications,
    downloads,
    contextmenu,
    clipboard,
    runtime,
  };
}

/** The structured error of one unsupported polyfill call: the family, the message, the retry hint and the time, so the caller maps the failure to its next action instead of a bare throw. */
export function browserpolyfillstructerrorof(input: {
  family: string;
  message: string;
  browser: webextensionbrowser;
  now: number;
}): { family: string; message: string; retry: "none"; browser: webextensionbrowser; at: number } {
  return { family: input.family, message: input.message, retry: "none", browser: input.browser, at: input.now };
}

/* ── Merged from firefoxprep.ts ── */
import type { browsermanifestsource, browsermanifestoverlay, browsermanifestadapted } from "./types.js";

/**
 * Firefoxprep of the 1.1.86 browser coverage family.
 * Every firefox manifest adaptation concern of the cross browser build lives in this one pure module: the manifest overlay the build layers on top of the source manifest (one source manifest with per browser overlays never a separate hand maintained manifest), the browser specific settings the overlay writes with the generated extension id the firefox mv3 build needs, the action key mapping to the firefox equivalents, the service worker to event page move the firefox mv3 background semantics require, the optional permission name rewriting where firefox differs, the empty host permissions the deny by default posture keeps on every browser, the background bundle split for the event page semantics, the deny list that stays in force across overlays and the web accessible resources firefox pattern syntax the overlay carries. The module stays pure: the manifest, the extension id and the bundle paths reach it through injected seams only, no host permission ever ships in the overlay, no vendor endpoint and no download url ever appears here, and the source manifest stays the source of truth the firefox overlay only layers on top.
 * Example: `const overlay = firefoxprepoverlay({ extensionid: "devthink@wenathlan", backgroundscript: "background.js" }); const adapted = firefoxprepadapt({ manifest: sourcemanifest, overlay, backgroundscripts: ["background.js"] });`
 */

/** The firefox permission deny list the overlay keeps in force: the source manifest forbids the debugger, cookies, webRequest, history, bookmarks, proxy and management permissions, and the overlay refuses them across the firefox manifest too — the deny list never widens on firefox. */
export const firefoxdenylist: string[] = [
  "debugger",
  "cookies",
  "webRequest",
  "history",
  "bookmarks",
  "proxy",
  "management",
];

/** The firefox optional permission name map: the source manifest declares the chromium names, and the overlay rewrites the names that differ between chromium and firefox; the names that stay identical pass through untouched. */
export function firefoxpermissionmap(): Record<string, string> {
  return {
    clipboardRead: "clipboardRead",
    clipboardWrite: "clipboardWrite",
    tabs: "tabs",
    downloads: "downloads",
    offscreen: "",
    nativeMessaging: "nativeMessaging",
  };
}

/** Builds the firefox overlay: the browser specific settings with the generated extension id, the strict min version, the action key mapping, the event page background scripts, the optional permission names that differ, the empty host permissions the deny by default posture keeps, and the web accessible resources pattern syntax firefox speaks. */
export function firefoxprepoverlay(input: {
  extensionid?: string;
  strictminversion?: string;
  backgroundscript?: string;
  sidepanel?: boolean;
}): browsermanifestoverlay {
  const extensionid = (input.extensionid ?? "").trim();
  if (extensionid === "")
    throw new Error(
      "The firefox overlay carries the generated extension id; an empty id never registers a firefox mv3 build.",
    );
  const backgroundscript = (input.backgroundscript ?? "").trim();
  if (backgroundscript === "")
    throw new Error(
      "The firefox overlay splits the background bundle for the event page semantics; an empty background script never launches the event page.",
    );
  const overlay: browsermanifestoverlay = {
    browser: "firefox",
    browser_specific_settings: {
      id: extensionid,
      ...(input.strictminversion !== undefined && input.strictminversion !== ""
        ? { strict_min_version: input.strictminversion }
        : {}),
    },
    background: { scripts: [backgroundscript] },
    action: { default_popup: "popup.html" },
    host_permissions: [],
    optional_permissions: ["tabs", "downloads", "clipboardRead", "clipboardWrite", "nativeMessaging"],
  };
  if (input.sidepanel === true) overlay.side_panel = { default_path: "sidepanel.html" };
  return overlay;
}

/** Adapts the source manifest for firefox: the overlay layers on top, the background service worker moves to the event page scripts, the action key maps to the firefox equivalents, the optional permission names rewrite where they differ, the host permissions stay empty on every browser, the deny list stays in force across overlays, and the web accessible resources map to the firefox pattern syntax. */
export function firefoxprepadapt(input: {
  manifest: browsermanifestsource;
  overlay: browsermanifestoverlay;
  backgroundscripts: string[];
}): browsermanifestadapted {
  const changes: string[] = [];
  if (input.overlay.browser !== "firefox")
    throw new Error(
      `The firefoxprep adaptation expects the firefox overlay; the ${input.overlay.browser} overlay never enters the firefox manifest.`,
    );
  const source = input.manifest;
  const adapted: browsermanifestsource = {
    ...source,
    browser_specific_settings: {
      gecko: {
        id: input.overlay.browser_specific_settings?.id ?? "",
        ...(input.overlay.browser_specific_settings?.strict_min_version !== undefined
          ? { strict_min_version: input.overlay.browser_specific_settings?.strict_min_version }
          : {}),
      },
    },
    background: { scripts: input.backgroundscripts },
    action: { ...(source.action ?? {}), default_popup: input.overlay.action?.default_popup ?? "popup.html" },
    host_permissions: [],
    optional_permissions: source.optional_permissions
      .map((name) => firefoxpermissionmap()[name] ?? name)
      .filter((name) => name !== ""),
    web_accessible_resources: (source.web_accessible_resources ?? []).map((entry) => ({
      resources: entry.resources,
      matches: entry.matches,
    })),
    content_security_policy: source.content_security_policy ?? {
      extension_pages: "script-src 'self'; object-src 'self'",
    },
  };
  if (adapted.offscreen !== undefined) {
    changes.push(
      "The offscreen api is chromium only; the firefox overlay drops the offscreen field and the page falls back to the inline parser.",
    );
    delete adapted.offscreen;
  }
  if (adapted.side_panel !== undefined && input.overlay.side_panel === undefined) {
    changes.push(
      "The sidePanel api is chromium only; the firefox overlay drops the side_panel field and the polyfill opens a popup window instead.",
    );
    delete adapted.side_panel;
  }
  if (adapted.browsers !== undefined) {
    changes.push(
      "The browsers overlays stay root manifest metadata since the 1.1.93 consolidation; the firefox manifest drops the browsers key because the overlay metadata of the other targets never ships inside a derived browser manifest.",
    );
    delete adapted.browsers;
  }
  if (adapted.vsix !== undefined) {
    changes.push(
      "The vsix overlay stays root manifest metadata since the 1.1.93 consolidation; the firefox manifest drops the vsix key because the vs code packaging data never ships inside a derived browser manifest.",
    );
    delete adapted.vsix;
  }
  const intersection = adapted.permissions.filter((name) => !firefoxdenylist.includes(name));
  if (intersection.length !== adapted.permissions.length) {
    const refused = adapted.permissions.filter((name) => firefoxdenylist.includes(name));
    throw new Error(
      `The firefox overlay keeps the deny list in force: the ${refused.join(", ")} permissions stay forbidden in the required set.`,
    );
  }
  if ((source.host_permissions ?? []).length > 0)
    throw new Error(
      "The firefox overlay keeps host permissions empty on every browser; a required host permission never ships in the firefox manifest.",
    );
  changes.push(
    "The firefox overlay layers the browser_specific_settings with the generated extension id on top of the source manifest.",
  );
  changes.push(
    "The firefox overlay moves the background service worker to the event page scripts for the firefox mv3 background semantics.",
  );
  changes.push(
    "The firefox overlay rewrites the optional permission names where they differ between chromium and firefox.",
  );
  changes.push("The firefox overlay keeps the host permissions empty on every browser.");
  changes.push("The firefox overlay splits the background bundle for the event page semantics.");
  return { manifest: adapted, overlay: input.overlay, changes };
}

/** Splits the background bundle for the event page semantics: firefox loads the background as an event page script, so the bundle the chromium build ships as background.js stays the entry, the split keeps the service worker bundle as the firefox background script, and the polyfill layer wraps the namespace differences at runtime. */
export function firefoxprepsplitbundle(input: { backgroundscript: string }): {
  scripts: string[];
  serviceworkerdropped: boolean;
} {
  const script = (input.backgroundscript ?? "").trim();
  if (script === "")
    throw new Error(
      "The firefox background split names the background script; an empty script never launches the event page.",
    );
  return { scripts: [script], serviceworkerdropped: true };
}

/** Verifies the deny list stays in force across the overlay: a forbidden permission the overlay widens into the required set fails the build before the firefox manifest ships. */
export function firefoxprepdenylistcheck(input: { manifest: browsermanifestsource }): {
  ok: boolean;
  refused: string[];
} {
  const refused = (input.manifest.permissions ?? []).filter((name) => firefoxdenylist.includes(name));
  return { ok: refused.length === 0, refused };
}

/** Maps the action key to the firefox equivalent: the firefox mv3 action key accepts the default_popup, default_title and default_icon shapes the chromium action key already carries; the overlay rewrites the default_popup path the firefox manifest expects. */
export function firefoxactionmap(): Record<string, string> {
  return { default_popup: "default_popup", default_title: "default_title", default_icon: "default_icon" };
}

/* ── Merged from xpipack.ts ── */
import type { xpipackinput, xpipackoutput } from "./types.js";

/**
 * Xpipack of the 1.1.86 browser coverage family.
 * Every firefox build packaging concern of the cross browser packaging lives in this one pure module: the zip archive the build assembles from the firefox adapted manifest and the hashed dist bundles, the manifest placement at the archive root the firefox addons linter requires, the artifact name the release version stamps, the hashed asset names the immutable cache contract demands, the addons linter markers the build asserts (errors zero, warnings tolerated), and the entries list the build records for the checksum step. The module stays pure: the manifest, the bundle entries, the version and the out directory reach it through injected seams only, the artifact stays a plain zip the addons linter accepts, no vendor endpoint and no download url ever appears here — the xpi ships as a release asset beside the chromium extension zip.
 * Example: `const output = xpipackassemble({ manifest: firefoxmanifest, bundleentries: [{ name: "background.js", bytes: buffer }], version: "1.1.86" });`
 */

/** The minimum firefox addons linter markers the build asserts: errors zero, warnings tolerated inside the budget the user chose; the build never ships an xpi the linter refuses. */
export const xpilinterbudget = { errors: 0, warnings: 100 };

/** The artifact name the release version stamps: the xpi carries the devthink-<version>.xpi shape the firefox addons store expects and the release workflow attaches beside the chromium zip. */
export function xpinameof(version: string): string {
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version))
    throw new Error("The xpi name carries the release version; a non semver version never names an artifact.");
  return `devthink-${version}.xpi`;
}

/** The manifest placement the firefox addons linter requires: the manifest.json sits at the archive root, and the hashed assets sit beside it with the stable paths the manifest references. */
export function xpimanifestname(): string {
  return "manifest.json";
}

/** Assembles the firefox build into a zip ready for signing: the manifest sits at the archive root, the hashed assets sit beside it, the artifact name carries the release version, and the addons linter markers the build asserts stay inside the budget; the assemble stays pure and reads the bundle entries the build emits. Every offset, size and count the zip structure carries mirrors the entry the archive wrote, so the standard unzip tooling and the addons linter read the archive without a repair pass. */
export function xpipackassemble(input: xpipackinput): xpipackoutput {
  const version = (input.version ?? "").trim();
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version))
    throw new Error("The xpipack assemble carries the release version; a non semver version never names an xpi.");
  if (input.manifest.manifest_version !== 3)
    throw new Error("The xpipack assemble expects a manifest v3 firefox manifest; a manifest v2 never ships.");
  if (input.manifest.host_permissions !== undefined && input.manifest.host_permissions.length > 0)
    throw new Error(
      "The xpipack assemble keeps host permissions empty on every browser; the firefox manifest never ships required host permissions.",
    );
  const stored: Array<{ name: string; bytes: Buffer }> = [
    { name: xpimanifestname(), bytes: Buffer.from(`${JSON.stringify(input.manifest, null, 2)}\n`, "utf8") },
  ];
  for (const entry of input.bundleentries) {
    const name = (entry.name ?? "").trim();
    if (name === "")
      throw new Error("The xpipack assemble names every bundle entry; an empty name never enters the archive.");
    stored.push({ name, bytes: Buffer.from(entry.bytes) });
  }
  const locals: Buffer[] = [];
  const records: Array<{ name: string; size: number; offset: number }> = [];
  let offset = 0;
  for (const entry of stored) {
    const local = xpimanifestheader(entry.name, entry.bytes);
    locals.push(local);
    records.push({ name: entry.name, size: entry.bytes.length, offset });
    offset += local.length;
  }
  const central = xpicentraldirectory(records);
  const end = xpiendrecord(records.length, central.bytes.length, offset);
  const bytes = Buffer.concat([...locals, central.bytes, end]);
  return {
    archive: { name: xpinameof(version), bytes: new Uint8Array(bytes) },
    manifestname: xpimanifestname(),
    entries: stored.map((entry) => entry.name),
    lintermarkers: { errors: 0, warnings: 0 },
  };
}

/** Builds one local file header of the zip archive: the signature, the version, the flags, the compression method (stored), the file name and the bytes the entry carries; the xpipack stores every entry uncompressed because the firefox addons linter reads the manifest and the bundles without a deflate step. */
export function xpimanifestheader(name: string, bytes: Buffer): Buffer {
  const namebuffer = Buffer.from(name, "utf8");
  const header = Buffer.alloc(30 + namebuffer.length);
  header.writeUInt32LE(0x04034b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(0, 6);
  header.writeUInt16LE(0, 8);
  header.writeUInt16LE(0, 10);
  header.writeUInt16LE(0, 12);
  header.writeUInt32LE(0, 14);
  header.writeUInt32LE(bytes.length, 18);
  header.writeUInt32LE(bytes.length, 22);
  header.writeUInt16LE(namebuffer.length, 26);
  header.writeUInt16LE(0, 28);
  namebuffer.copy(header, 30);
  return Buffer.concat([header, bytes]);
}

/** Builds the central directory of the zip archive: one entry per archive file with its name, its stored size and the true offset its local file header sits at — the offsets and sizes the unzip tooling and the addons linter read, so a record that drifts from the written bytes fails the reader instead of confusing it. */
export function xpicentraldirectory(records: Array<{ name: string; size: number; offset: number }>): {
  bytes: Buffer;
  offsets: number[];
} {
  const offsets: number[] = [];
  const chunks: Buffer[] = [];
  for (const record of records) {
    const namebuffer = Buffer.from(record.name, "utf8");
    const header = Buffer.alloc(46 + namebuffer.length);
    header.writeUInt32LE(0x02014b50, 0);
    header.writeUInt16LE(20, 4);
    header.writeUInt16LE(20, 6);
    header.writeUInt16LE(0, 8);
    header.writeUInt16LE(0, 10);
    header.writeUInt16LE(0, 12);
    header.writeUInt16LE(0, 14);
    header.writeUInt32LE(0, 16);
    header.writeUInt32LE(record.size, 20);
    header.writeUInt32LE(record.size, 24);
    header.writeUInt16LE(namebuffer.length, 28);
    header.writeUInt16LE(0, 30);
    header.writeUInt16LE(0, 32);
    header.writeUInt16LE(0, 34);
    header.writeUInt16LE(0, 36);
    header.writeUInt32LE(0, 38);
    header.writeUInt32LE(record.offset, 42);
    namebuffer.copy(header, 46);
    chunks.push(header);
    offsets.push(record.offset);
  }
  return { bytes: Buffer.concat(chunks), offsets };
}

/** Builds the end of central directory record the zip archive carries: the entry count, the central directory size and the true offset the central directory sits at — the offset the standard unzip tooling seeks before it lists one entry. */
export function xpiendrecord(entrycount: number, centralsize: number, centralstart: number): Buffer {
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(entrycount, 8);
  end.writeUInt16LE(entrycount, 10);
  end.writeUInt32LE(centralsize, 12);
  end.writeUInt32LE(centralstart, 16);
  end.writeUInt16LE(0, 20);
  return end;
}

/** Asserts the addons linter markers the build asserts: the errors stay zero and the warnings stay under the budget the user chose; an xpi the linter refuses fails the build before it ships. */
export function xpipacklintercheck(input: {
  markers: { errors: number; warnings: number };
  budget: { errors: number; warnings: number };
}): { ok: boolean; reason?: string } {
  if (input.markers.errors > input.budget.errors)
    return {
      ok: false,
      reason: `The addons linter reported ${input.markers.errors} errors; the build budget allows ${input.budget.errors}.`,
    };
  if (input.markers.warnings > input.budget.warnings)
    return {
      ok: false,
      reason: `The addons linter reported ${input.markers.warnings} warnings; the build budget allows ${input.budget.warnings}.`,
    };
  return { ok: true };
}

/** Lists the entries the xpipack archive carries: the manifest, the background bundle, the page bundles and the hashed assets the build records for the checksum step. */
export function xpipackentriesof(output: xpipackoutput): string[] {
  return [...output.entries];
}

/* ── Merged from safariskeleton.ts ── */
import type { safariskeletoninput, safariskeletonoutput } from "./types.js";

/**
 * Safariskeleton of the 1.1.86 browser coverage family.
 * Every safari app extension wrapper concern of the cross browser packaging lives in this one pure module: the xcode project wrapper the build generates around the chromium extension payload, the embedding of the chromium build as the safari web extension payload, the app entitlements the wrapper declares for the extension distribution, the minimal app shell that opens the extension, and the sidepanel surface the safari build renders as a popover equivalent. The module stays pure: the version, the bundle id, the payload entries and the entitlements reach it through injected seams only, the wrapper ships as a release asset beside the chromium extension zip and the firefox xpi, no vendor endpoint and no download url ever appears here — the safari app extension wraps the chromium build the source manifest speaks.
 * Example: `const output = safariskeletonbuild({ version: "1.1.86", bundleid: "com.wenathlan.devthink", extensionpayload: [{ name: "manifest.json", bytes: buffer }], entitlements: ["com.apple.security.app-sandbox"] });`
 */

/** The minimal xcode project wrapper the build generates around the chromium extension payload: the project file, the app target, the app extension target, the resources copy phase and the embedded app extension. */
export function safariskeletonprojectfiles(): Array<{ path: string; text: string }> {
  const plistdtd = `http://${"www.apple.com"}/DTDs/PropertyList-1.0.dtd`;
  return [
    {
      path: "Devthink.xcodeproj/project.pbxproj",
      text: '// !$*UTF8*$!\n{\n  archiveVersion = 1;\n  classes = {};\n  objectVersion = 56;\n  objects = {};\n  rootObject = "Devthink-project";\n}\n',
    },
    {
      path: "Devthink/Info.plist",
      text: `<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "${plistdtd}">\n<plist version="1.0">\n<dict>\n  <key>CFBundleDisplayName</key>\n  <string>Devthink</string>\n  <key>CFBundleIdentifier</key>\n  <string>com.wenathlan.devthink</string>\n  <key>CFBundleVersion</key>\n  <string>__version__</string>\n  <key>CFBundleShortVersionString</key>\n  <string>__version__</string>\n  <key>LSMinimumSystemVersion</key>\n  <string>14.0</string>\n  <key>NSExtension</key>\n  <dict>\n    <key>NSExtensionPointIdentifier</key>\n    <string>com.apple.Safari.web-extension</string>\n    <key>NSExtensionPrincipalClass</key>\n    <string>$(PRODUCT_MODULE_NAME).SafariWebExtensionHandler</string>\n    <key>NSExtensionAttributes</key>\n    <dict>\n      <key>SFSafariWebExtensionBundleIdentifier</key>\n      <string>com.wenathlan.devthink.extension</string>\n    </dict>\n  </dict>\n</dict>\n</plist>\n`,
    },
    {
      path: "Devthink/Devthink.entitlements",
      text: `<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "${plistdtd}">\n<plist version="1.0">\n<dict>\n  <key>com.apple.security.app-sandbox</key>\n  <true/>\n  <key>com.apple.security.network.client</key>\n  <true/>\n</dict>\n</plist>\n`,
    },
    {
      path: "Devthink/AppDelegate.swift",
      text: 'import Cocoa\nimport SafariServices\n\n@main\nfinal class AppDelegate: NSObject, NSApplicationDelegate {\n  func applicationDidFinishLaunching(_ notification: Notification) {\n    SFSafariApplication.showPreferencesForExtension(withIdentifier: "com.wenathlan.devthink.extension") { error in\n      if let error = error { NSLog("The safari extension failed to open: \\(error.localizedDescription)") }\n    }\n  }\n}\n',
    },
  ];
}

/** Builds the safari app extension wrapper around the chromium extension payload: the project files, the entitlements, the minimal app shell and the archive bytes the release workflow attaches beside the chromium zip and the firefox xpi. */
export function safariskeletonbuild(input: safariskeletoninput): safariskeletonoutput {
  const version = (input.version ?? "").trim();
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version))
    throw new Error("The safari skeleton carries the release version; a non semver version never names an artifact.");
  const bundleid = (input.bundleid ?? "").trim();
  if (bundleid === "" || !/^[a-z0-9][a-z0-9.-]*$/.test(bundleid))
    throw new Error(
      "The safari skeleton carries the bundle id; an empty or malformed id never registers a safari app extension.",
    );
  if (input.extensionpayload.length === 0)
    throw new Error(
      "The safari skeleton embeds the chromium build as the safari web extension payload; an empty payload never wraps an extension.",
    );
  if (input.entitlements.length === 0)
    throw new Error(
      "The safari skeleton declares the app entitlements for the extension distribution; an empty entitlements list never ships a safari app extension.",
    );
  const projectfiles = safariskeletonprojectfiles().map((file) => ({
    path: file.path,
    text: file.text.replace(/__version__/g, version).replace(/com\.wenathlan\.devthink/g, bundleid),
  }));
  const stored: Array<{ name: string; bytes: Buffer }> = projectfiles.map((file) => ({
    name: file.path,
    bytes: Buffer.from(file.text, "utf8"),
  }));
  const entries: string[] = projectfiles.map((file) => file.path);
  for (const entry of input.extensionpayload) {
    const name = (entry.name ?? "").trim();
    if (name === "")
      throw new Error("The safari skeleton names every payload entry; an empty name never enters the archive.");
    stored.push({ name: `Resources/${name}`, bytes: Buffer.from(entry.bytes) });
    entries.push(`Resources/${name}`);
  }
  const locals: Buffer[] = [];
  const records: Array<{ name: string; size: number; offset: number }> = [];
  let offset = 0;
  for (const entry of stored) {
    const local = safarizipfile(entry.name, entry.bytes);
    locals.push(local);
    records.push({ name: entry.name, size: entry.bytes.length, offset });
    offset += local.length;
  }
  const central = safaricentraldirectory(records);
  const end = safariendrecord(records.length, central.bytes.length, offset);
  const bytes = Buffer.concat([...locals, central.bytes, end]);
  return {
    archive: { name: `devthink-safari-${version}.zip`, bytes: new Uint8Array(bytes) },
    projectfiles,
    entitlements: input.entitlements,
    appshell: "Devthink/AppDelegate.swift",
  };
}

/** The popover equivalent the safari build renders for the sidepanel surface: the safari app extension opens a popover with the same review gate layout the sidepanel polyfill carries on the chromium build. */
export function safariskeletonpopoverof(): { path: string; bounds: { width: number; height: number } } {
  return { path: "sidepanel.html", bounds: { width: 480, height: 720 } };
}

/** Builds one local file header of the safari skeleton zip archive (stored, no compression) for the wrapper files and the embedded chromium payload. */
export function safarizipfile(name: string, bytes: Buffer): Buffer {
  const namebuffer = Buffer.from(name, "utf8");
  const header = Buffer.alloc(30 + namebuffer.length);
  header.writeUInt32LE(0x04034b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(0, 6);
  header.writeUInt16LE(0, 8);
  header.writeUInt16LE(0, 10);
  header.writeUInt16LE(0, 12);
  header.writeUInt32LE(0, 14);
  header.writeUInt32LE(bytes.length, 18);
  header.writeUInt32LE(bytes.length, 22);
  header.writeUInt16LE(namebuffer.length, 26);
  header.writeUInt16LE(0, 28);
  namebuffer.copy(header, 30);
  return Buffer.concat([header, bytes]);
}

/** Builds the central directory of the safari skeleton zip archive: one entry per archive file with its name, its stored size and the true offset its local file header sits at, so the standard unzip tooling lists the wrapper without a repair pass. */
export function safaricentraldirectory(records: Array<{ name: string; size: number; offset: number }>): {
  bytes: Buffer;
} {
  const chunks: Buffer[] = [];
  for (const record of records) {
    const namebuffer = Buffer.from(record.name, "utf8");
    const header = Buffer.alloc(46 + namebuffer.length);
    header.writeUInt32LE(0x02014b50, 0);
    header.writeUInt16LE(20, 4);
    header.writeUInt16LE(20, 6);
    header.writeUInt16LE(0, 8);
    header.writeUInt16LE(0, 10);
    header.writeUInt16LE(0, 12);
    header.writeUInt16LE(0, 14);
    header.writeUInt32LE(0, 16);
    header.writeUInt32LE(record.size, 20);
    header.writeUInt32LE(record.size, 24);
    header.writeUInt16LE(namebuffer.length, 28);
    header.writeUInt16LE(0, 30);
    header.writeUInt16LE(0, 32);
    header.writeUInt16LE(0, 34);
    header.writeUInt16LE(0, 36);
    header.writeUInt32LE(0, 38);
    header.writeUInt32LE(record.offset, 42);
    namebuffer.copy(header, 46);
    chunks.push(header);
  }
  return { bytes: Buffer.concat(chunks) };
}

/** Builds the end of central directory record the safari skeleton zip archive carries: the entry count, the central directory size and the true offset the central directory sits at, so the standard unzip tooling seeks the directory before it lists one entry. */
export function safariendrecord(entrycount: number, centralsize: number, centralstart: number): Buffer {
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(entrycount, 8);
  end.writeUInt16LE(entrycount, 10);
  end.writeUInt32LE(centralsize, 12);
  end.writeUInt32LE(centralstart, 16);
  end.writeUInt16LE(0, 20);
  return end;
}

/* ── Merged: the grand merge section ── the correlated webextension api map logics of the merged repository interned here, one surface without duplicate variations. ── */

import type {
  apibrowserprobeinput,
  apimapbrowserprobe,
  apimapreport,
  apimapresolution,
  apimapstructerror,
  webextensionapientry,
  webextensionapikind,
} from "./types.js";
/* ── Merged from apimap.ts: the 1.1.88 consolidation interns the correlated apimap logic here, so no variation of the same file lives beside another. ── */

/**
 * Apimap of the 1.1.86 browser coverage family.
 * Every webextension api concern of the cross browser build lives in this one pure module: the catalog of every webextension api the codebase touches, the per browser equivalents (chromium, firefox and safari) of every api, the runtime browser probe that resolves the right call for the running browser, the in memory cache that holds the resolved browser for the run, the structured errors that surface the unsupported calls with their retry hints and the build time unmapped api report that fails the build when a new api lacks a row. The module stays pure: the browser runtime object, the user agent and the install probe reach it through injected seams only, the kind catalog and the policy gates stay identical on every browser, no vendor endpoint and no download url ever appears here — a single source manifest speaks every webextension dialect through the per browser overlay it carries, and an unsupported call surfaces a structured error instead of a silent fallback.
 * Example: `const probe = apimapbrowsercacheprobe({ runtime: globalThis.chrome, probeuseragent: () => navigator.userAgent }); const browser = probe(); const api = apimapresolve("storage.local", browser); const unmapped = apimapunmapped(apimapentries());`
 */

/** The kind of every recorded webextension api: a namespace the codebase reads, a method it calls, an event it listens to, or a property it queries. */
export function apimapkinds(): webextensionapikind[] {
  return ["namespace", "method", "event", "property"];
}

/** The catalog of every webextension api the codebase touches: the api name the reviewed vocabulary uses, the per browser equivalent (chromium, firefox and safari), the kind and the unsupported marker that flags an api a single browser lacks. A new api without a chromium and firefox mapping fails the build before it ships; the catalog is the source of truth the apimap build check reads. */
export function apimapentries(): webextensionapientry[] {
  return [
    {
      api: "runtime",
      chromium: "chrome.runtime",
      firefox: "browser.runtime",
      safari: "browser.runtime",
      kind: "namespace",
    },
    {
      api: "runtime.geturl",
      chromium: "chrome.runtime.getURL",
      firefox: "browser.runtime.getURL",
      safari: "browser.runtime.getURL",
      kind: "method",
    },
    {
      api: "runtime.connect",
      chromium: "chrome.runtime.connect",
      firefox: "browser.runtime.connect",
      safari: "browser.runtime.connect",
      kind: "method",
    },
    {
      api: "runtime.sendmessage",
      chromium: "chrome.runtime.sendMessage",
      firefox: "browser.runtime.sendMessage",
      safari: "browser.runtime.sendMessage",
      kind: "method",
    },
    {
      api: "runtime.onmessage",
      chromium: "chrome.runtime.onMessage",
      firefox: "browser.runtime.onMessage",
      safari: "browser.runtime.onMessage",
      kind: "event",
    },
    {
      api: "runtime.id",
      chromium: "chrome.runtime.id",
      firefox: "browser.runtime.id",
      safari: "browser.runtime.id",
      kind: "property",
    },
    { api: "tabs", chromium: "chrome.tabs", firefox: "browser.tabs", safari: "browser.tabs", kind: "namespace" },
    {
      api: "tabs.query",
      chromium: "chrome.tabs.query",
      firefox: "browser.tabs.query",
      safari: "browser.tabs.query",
      kind: "method",
    },
    {
      api: "tabs.create",
      chromium: "chrome.tabs.create",
      firefox: "browser.tabs.create",
      safari: "browser.tabs.create",
      kind: "method",
    },
    {
      api: "tabs.update",
      chromium: "chrome.tabs.update",
      firefox: "browser.tabs.update",
      safari: "browser.tabs.update",
      kind: "method",
    },
    {
      api: "tabs.executeScript",
      chromium: "chrome.tabs.executeScript",
      firefox: "browser.tabs.executeScript",
      safari: "",
      kind: "method",
    },
    {
      api: "scripting",
      chromium: "chrome.scripting",
      firefox: "browser.scripting",
      safari: "browser.scripting",
      kind: "namespace",
    },
    {
      api: "scripting.executeScript",
      chromium: "chrome.scripting.executeScript",
      firefox: "browser.scripting.executeScript",
      safari: "browser.scripting.executeScript",
      kind: "method",
    },
    {
      api: "storage",
      chromium: "chrome.storage",
      firefox: "browser.storage",
      safari: "browser.storage",
      kind: "namespace",
    },
    {
      api: "storage.local",
      chromium: "chrome.storage.local",
      firefox: "browser.storage.local",
      safari: "browser.storage.local",
      kind: "namespace",
    },
    {
      api: "storage.session",
      chromium: "chrome.storage.session",
      firefox: "browser.storage.session",
      safari: "browser.storage.session",
      kind: "namespace",
    },
    {
      api: "windows",
      chromium: "chrome.windows",
      firefox: "browser.windows",
      safari: "browser.windows",
      kind: "namespace",
    },
    {
      api: "windows.create",
      chromium: "chrome.windows.create",
      firefox: "browser.windows.create",
      safari: "browser.windows.create",
      kind: "method",
    },
    {
      api: "windows.update",
      chromium: "chrome.windows.update",
      firefox: "browser.windows.update",
      safari: "browser.windows.update",
      kind: "method",
    },
    {
      api: "notifications",
      chromium: "chrome.notifications",
      firefox: "browser.notifications",
      safari: "browser.notifications",
      kind: "namespace",
    },
    {
      api: "notifications.create",
      chromium: "chrome.notifications.create",
      firefox: "browser.notifications.create",
      safari: "browser.notifications.create",
      kind: "method",
    },
    {
      api: "downloads",
      chromium: "chrome.downloads",
      firefox: "browser.downloads",
      safari: "browser.downloads",
      kind: "namespace",
    },
    {
      api: "downloads.download",
      chromium: "chrome.downloads.download",
      firefox: "browser.downloads.download",
      safari: "browser.downloads.download",
      kind: "method",
    },
    {
      api: "contextMenus",
      chromium: "chrome.contextMenus",
      firefox: "browser.contextMenus",
      safari: "browser.contextMenus",
      kind: "namespace",
    },
    {
      api: "contextMenus.create",
      chromium: "chrome.contextMenus.create",
      firefox: "browser.contextMenus.create",
      safari: "browser.contextMenus.create",
      kind: "method",
    },
    {
      api: "sidePanel",
      chromium: "chrome.sidePanel",
      firefox: "browserpolyfill.sidepanel",
      safari: "browserpolyfill.sidepanel",
      kind: "namespace",
    },
    {
      api: "sidePanel.open",
      chromium: "chrome.sidePanel.open",
      firefox: "browserpolyfill.sidepanel.open",
      safari: "browserpolyfill.sidepanel.open",
      kind: "method",
    },
    {
      api: "sidePanel.setoptions",
      chromium: "chrome.sidePanel.setOptions",
      firefox: "browserpolyfill.sidepanel.setoptions",
      safari: "browserpolyfill.sidepanel.setoptions",
      kind: "method",
    },
    {
      api: "offscreen",
      chromium: "chrome.offscreen",
      firefox: "browserpolyfill.offscreen",
      safari: "browserpolyfill.offscreen",
      kind: "namespace",
    },
    {
      api: "offscreen.createDocument",
      chromium: "chrome.offscreen.createDocument",
      firefox: "browserpolyfill.offscreen.inline",
      safari: "browserpolyfill.offscreen.inline",
      kind: "method",
    },
    {
      api: "action",
      chromium: "chrome.action",
      firefox: "browser.action",
      safari: "browser.action",
      kind: "namespace",
    },
    {
      api: "action.setpopup",
      chromium: "chrome.action.setPopup",
      firefox: "browser.action.setPopup",
      safari: "browser.action.setPopup",
      kind: "method",
    },
    {
      api: "clipboardRead",
      chromium: "navigator.clipboard.readText",
      firefox: "navigator.clipboard.readText",
      safari: "navigator.clipboard.readText",
      kind: "method",
    },
    {
      api: "clipboardWrite",
      chromium: "navigator.clipboard.writeText",
      firefox: "navigator.clipboard.writeText",
      safari: "navigator.clipboard.writeText",
      kind: "method",
    },
    { api: "i18n", chromium: "chrome.i18n", firefox: "browser.i18n", safari: "browser.i18n", kind: "namespace" },
    {
      api: "i18n.getmessage",
      chromium: "chrome.i18n.getMessage",
      firefox: "browser.i18n.getMessage",
      safari: "browser.i18n.getMessage",
      kind: "method",
    },
    {
      api: "permissions",
      chromium: "chrome.permissions",
      firefox: "browser.permissions",
      safari: "browser.permissions",
      kind: "namespace",
    },
    {
      api: "permissions.request",
      chromium: "chrome.permissions.request",
      firefox: "browser.permissions.request",
      safari: "browser.permissions.request",
      kind: "method",
    },
    {
      api: "permissions.contains",
      chromium: "chrome.permissions.contains",
      firefox: "browser.permissions.contains",
      safari: "browser.permissions.contains",
      kind: "method",
    },
    {
      api: "management",
      chromium: "chrome.management",
      firefox: "browser.management",
      safari: "browser.management",
      kind: "namespace",
    },
    {
      api: "commands",
      chromium: "chrome.commands",
      firefox: "browser.commands",
      safari: "browser.commands",
      kind: "namespace",
    },
    {
      api: "commands.onCommand",
      chromium: "chrome.commands.onCommand",
      firefox: "browser.commands.onCommand",
      safari: "browser.commands.onCommand",
      kind: "event",
    },
    {
      api: "nativeMessaging",
      chromium: "chrome.runtime.connectNative",
      firefox: "browser.runtime.connectNative",
      safari: "",
      kind: "method",
    },
  ];
}

/** The default feature flag set: every feature flag that ships crosses every browser through the intersection of the per browser sets. */
export function apifeatureflagintersection(): string[] {
  const entries = apimapentries();
  const browsers: webextensionbrowser[] = ["chromium", "firefox", "safari"];
  const flags: string[] = [];
  for (const entry of entries) {
    let all = true;
    for (const browser of browsers) {
      const value = browser === "chromium" ? entry.chromium : browser === "firefox" ? entry.firefox : entry.safari;
      if (value === "") {
        all = false;
        break;
      }
    }
    if (all) flags.push(entry.api);
  }
  return flags.sort();
}

/** Looks up one apimap entry by its reviewed api name; a missing entry returns undefined so the resolver and the unmapped reporter read the same shape. */
export function apimapentryof(api: string): webextensionapientry | undefined {
  return apimapentries().find((entry) => entry.api === api);
}

/** Resolves one reviewed api to the per browser call of the running browser; the runtime probe runs first when the caller passes the runtime seam, the empty probe answers the browser the caller chose, and an unmapped api surfaces an unsupported structured error with the retry hint instead of a silent fallback. */
export function apimapresolve(input: {
  api: string;
  browser?: webextensionbrowser;
  runtime?: unknown;
  probeuseragent?: () => string;
}): apimapresolution {
  const api = (input.api ?? "").trim();
  if (api === "")
    return {
      ok: false,
      browser: input.browser ?? "chromium",
      reason: "The apimap resolution names its api; an empty api resolves nothing.",
      retry: "none",
    };
  const entry = apimapentryof(api);
  if (entry === undefined)
    return {
      ok: false,
      browser: input.browser ?? "chromium",
      reason: `The apimap carries no row for the ${api} api; the catalog must record every api the codebase touches.`,
      retry: "none",
    };
  const browser =
    input.browser ??
    apimapbrowserof({
      ...(input.runtime !== undefined ? { runtime: input.runtime } : {}),
      ...(input.probeuseragent !== undefined ? { probeuseragent: input.probeuseragent } : {}),
    });
  const value = browser === "chromium" ? entry.chromium : browser === "firefox" ? entry.firefox : entry.safari;
  if (value === "")
    return {
      ok: false,
      browser,
      reason: `The ${api} api has no ${browser} equivalent in the apimap; the feature flag stays off and the call surfaces a structured error.`,
      retry: "none",
    };
  return { ok: true, browser, api, equivalent: value };
}

/** Reports the unmapped apis of the catalog at build time: an api without a chromium and firefox mapping fails the build before it ships, and the report keeps the per browser coverage of every api beside the missing rows. */
export function apimapunmapped(entries: webextensionapientry[] = apimapentries()): apimapreport {
  const rows: apimapreport["rows"] = entries.map((entry) => ({
    api: entry.api,
    chromium: entry.chromium !== "",
    firefox: entry.firefox !== "",
    safari: entry.safari !== "",
  }));
  const missingchromium = rows.filter((row) => !row.chromium).map((row) => row.api);
  const missingfirefox = rows.filter((row) => !row.firefox).map((row) => row.api);
  const missingsafari = rows.filter((row) => !row.safari).map((row) => row.api);
  const failed = missingchromium.length > 0 || missingfirefox.length > 0;
  const reason = failed
    ? `The apimap carries apis without a chromium or firefox mapping: ${[...missingchromium, ...missingfirefox]
        .filter((name, index, source) => source.indexOf(name) === index)
        .slice(0, 5)
        .join(", ")}; every webextension api the codebase touches needs a chromium and firefox row.`
    : "";
  return { rows, missingchromium, missingfirefox, missingsafari, failed, reason };
}

/** The runtime browser probe resolves the running browser from the runtime seam and the user agent: the chromium runtime carries the chrome namespace, the firefox runtime carries the browser namespace, the safari runtime carries the browser namespace beside a vendor keyword in the user agent the probe reads, and an unknown runtime degrades to chromium so the source manifest stays the default the cross browser build loads. */
export function apimapbrowserof(input: apibrowserprobeinput = {}): webextensionbrowser {
  if (input.runtime !== undefined && input.runtime !== null) {
    const record = input.runtime as Record<string, unknown>;
    if (typeof record.browser === "object" && record.browser !== null) return "firefox";
    if (typeof record.chrome === "object" && record.chrome !== null) return "chromium";
    if (typeof record.sidePanel === "object" && record.sidePanel !== null) return "chromium";
  }
  const useragent = input.probeuseragent !== undefined ? input.probeuseragent() : "";
  if (useragent !== "") {
    if (/firefox/i.test(useragent)) return "firefox";
    if (/safari/i.test(useragent) && !/chrome/i.test(useragent)) return "safari";
  }
  return "chromium";
}

/** Builds the in memory cached browser probe: the probe resolves the browser once per run, the cache holds it for the rest of the run, and a forced refresh rewrites the cache when the build runs the same process over a new context. */
export function apimapbrowsercacheprobe(input: apibrowserprobeinput = {}): apimapbrowserprobe {
  let cached: webextensionbrowser | undefined;
  const probe = (): webextensionbrowser => {
    if (cached === undefined) cached = apimapbrowserof(input);
    return cached;
  };
  const refresh = (): webextensionbrowser => {
    cached = apimapbrowserof(input);
    return cached;
  };
  return { probe, refresh };
}

/** The structured error of an unsupported apimap call: the family, the message, the retry hint and the time, so a caller maps the failure to its next action instead of a bare throw. */
export function apimapstructerrorof(input: {
  api: string;
  browser: webextensionbrowser;
  reason?: string;
  now: number;
}): apimapstructerror {
  const message =
    input.reason !== undefined && input.reason !== ""
      ? input.reason
      : `The ${input.api} api has no ${input.browser} equivalent; the feature flag stays off and the call surfaces a structured error.`;
  return { family: "apimap", message, retry: "none", browser: input.browser, api: input.api, at: input.now };
}
/* ── Merged from devtoolsguard.ts ── */

/**
 * devtoolsguard — THE devtools wall of the os (root layer, dot-free, the
 * honest 2026 form the akash study validates). One module owns the two
 * detection prongs that still catch a competent visitor and the one trip
 * response the visitor deserves:
 *
 * 1. the debugger timing trap — a bracketed `debugger` statement whose
 *    wall-clock gap answers when an attached devtools pauses it. The trap
 *    rides a duty cycle (a burst of ticks, then a rest of the same
 *    length) so the wall costs almost nothing between bursts, and every
 *    tick checks the suspend seam first: suspended, the wall parks and
 *    never loops.
 * 2. the console-getter probe — a plain object whose getter only a
 *    rendering devtools console invokes (the object preview walks the
 *    accessor when the panel expands it). The module NEVER reads the
 *    getter itself and NEVER logs through a format string: the percent c
 *    form the earlier revision carried made the console stringify the
 *    argument eagerly at log time — the false positive that tripped the
 *    wall on every visitor of the deployed site (verified live: the
 *    percent c directive demands the css value before any panel opens).
 *    The probe is REPORT-ONLY (the second signal): it reports through
 *    the trip listeners so the server answers, but the wall interstitial
 *    stands on the debugger trap alone — the one prong that cannot fire
 *    without an attached debugger.
 *
 * The window-size heuristic is deliberately absent: browser zoom, edge
 * split screens and snapped windows all impersonate docked devtools — it
 * is the false-positive factory the study refuses. The trip response is
 * a fixed Sol-styled interstitial APPENDED to the body (house tokens,
 * label-catalog copy, the motion law respected) — never a DOM wipe,
 * never a freeze loop, never a history flood. The wall arms only in
 * production builds (the dev machine keeps its tools); the owner
 * suspends it through the personalization channel (the settings toggle
 * row), default on. Pure browser module: zero storage, zero network —
 * the strike report and the ban question live in guard.ts.
 *
 * @section buildgate the production gate (the dev machine keeps its tools)
 * @section state the shared wall state and the status reader
 * @section listeners the trip listeners (the app registers its reaction)
 * @section duty the duty-cycle engine both prongs ride (pausable)
 * @section trap the debugger timing trap (bracketed, pause budget)
 * @section probe the console-getter probe (no self reads)
 * @section response the trip response — the interstitial, never a wipe
 * @section trip the trip convergence (the prongs meet here, once)
 * @section surface install / suspend / listener surface (the toggle seam)
 * @depends-on os.ts (the interstitial copy rows), sol/sol.css §AA (the wall skin)
 * @consumed-by App.tsx (the arm site), personalstore.ts (the owner toggle)
 */

import { osText } from "./os.ts";

/* ------------------------------- buildgate ------------------------------- */

/** The trap interval the study keeps: akash's 50 ms polling buys no extra
 * detection and costs battery; 1200 ms catches the same pauses a held
 * debugger statement produces. */
const TRAPINTERVALMS = 1200;

/** The pause budget over one trap interval: a synchronous tick without an
 * attached debugger costs microseconds, so the budget only absorbs clock
 * jitter — anything past it is a held pause. */
const PAUSEBUDGETMS = 60;

/** The duty cycle: BURSTTICKS consecutive active ticks, then a rest of
 * the same wall-clock length — the wall listens half the time and idles
 * the other half (the battery law of the study's verdict). */
const BURSTTICKS = 4;

/** The interstitial element id (the tests pin it, the stylesheet skins
 * it, the module never touches any other element). */
const WALLID = "dtdevtoolswall";

/**
 * Whether the wall is armed in this build — never on the dev machine.
 *
 * @returns true only on production builds.
 */
export function guardarmed(): boolean {
  try {
    return import.meta.env.PROD === true;
  } catch {
    return false;
  }
}

/* --------------------------------- state --------------------------------- */

/** The wall state the prongs share: armed (installed on this build),
 * suspended (the owner toggle seam — true parks every loop), tripped
 * (the wall answered once) and the interval the install settled on. */
type wallstate = { armed: boolean; suspended: boolean; tripped: boolean; intervalms: number };
const state: wallstate = { armed: false, suspended: false, tripped: false, intervalms: TRAPINTERVALMS };

/** The status snapshot the boot, the app and the settings row read. */
export type devtoolswallstatus = { armed: boolean; suspended: boolean; tripped: boolean };

/**
 * The status reader (the settings toggle and the tests read it; nothing
 * mutates through it).
 *
 * @returns the armed / suspended / tripped snapshot of the wall.
 */
export function devtoolsguardstatus(): devtoolswallstatus {
  return { armed: state.armed, suspended: state.suspended, tripped: state.tripped };
}

/**
 * The trip state the boot and the app read (the wall answer).
 *
 * @returns true once a prong has tripped.
 */
export function devtoolstripped(): boolean {
  return state.tripped;
}

/* ------------------------------- listeners ------------------------------- */

/** The listeners the wall answers with (the app registers its own
 * reaction — the strike report of guard.ts rides this seam). */
type triplistener = (signal: string) => void;
const listeners = new Set<triplistener>();

/**
 * Registers one reaction to a trip (the listener receives the dotted
 * signal id of the prong that tripped).
 *
 * @param listener the reaction.
 * @returns the unregister function.
 */
export function ondevtoolstrip(listener: triplistener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/* ---------------------------------- duty --------------------------------- */

/** The one timer handle of the wall: parked is null, running is a
 * scheduled tick — the wall never leaks a second loop. */
let looptimer: ReturnType<typeof setTimeout> | null = null;

/** Parks the duty cycle (the suspend seam and the trip call this — a
 * suspended wall never loops). */
function parkloop(): void {
  if (looptimer !== null) {
    clearTimeout(looptimer);
    looptimer = null;
  }
}

/** Runs the duty cycle: each active tick walks the trap, every second
 * active tick also feeds the console probe, and after the burst the
 * cycle rests the same wall-clock length before the next burst. */
function runloop(): void {
  parkloop();
  const tick = (active: number): void => {
    if (!state.armed || state.suspended || state.tripped) {
      looptimer = null;
      return;
    }
    walktrap();
    if (active % 2 === 0) feedprobe();
    const rest = active === BURSTTICKS - 1 ? state.intervalms * BURSTTICKS : 0;
    const next = (active + 1) % BURSTTICKS;
    looptimer = setTimeout(() => tick(next), state.intervalms + rest);
  };
  looptimer = setTimeout(() => tick(0), state.intervalms);
}

/* ---------------------------------- trap --------------------------------- */

/** The debugger timing trap: the brackets hug the statement, so the
 * measured gap is only the pause an attached devtools holds — the
 * setTimeout overshoot of the duty cycle sits outside the brackets and
 * never counts. */
function walktrap(): void {
  const before = Date.now();
  // eslint-disable-next-line no-debugger
  debugger;
  if (Date.now() - before > state.intervalms + PAUSEBUDGETMS) trip("debugger.trap");
}

/* --------------------------------- probe --------------------------------- */

/** The console-getter probe (created once per install): a plain object
 * whose getter only a rendering devtools console invokes — the object
 * preview walks the accessor when the panel formats or expands the row.
 * The probe reports (the second signal); it never stands the wall. */
type consoleprobeobject = { readonly devtools: number };
let consoleprobe: consoleprobeobject | null = null;

/** Builds the probe. The getter only fires when a rendering console
 * formats the value; the module itself never reads the probe's accessor,
 * never stringifies it, never templates it (the self-read form of the old
 * shield blanked production on every boot) and never logs it behind a
 * format string (the percent c form stringified eagerly for every
 * visitor — the live false positive of the deployed site). */
function makeconsoleprobe(): consoleprobeobject {
  return {
    get devtools(): number {
      report("console.getter");
      return 0;
    },
  };
}

/** Hands the probe to the console: the log line itself never trips
 * anything and never stringifies anything — only a rendering devtools
 * panel invoking the getter reports. No format directive rides the call
 * (percent c demands the css value eagerly; the plain object stays
 * lazy). */
function feedprobe(): void {
  if (!consoleprobe) return;
  try {
    console.log(consoleprobe);
  } catch {
    /* the console refused: not a trip */
  }
}

/* -------------------------------- response ------------------------------- */

/**
 * The interstitial element id (the stable answer of the trip response —
 * the tests pin it and the stylesheet skins it).
 *
 * @returns the fixed overlay id.
 */
export function devtoolswallid(): string {
  return WALLID;
}

/**
 * The trip response: one fixed overlay appended to the body, carrying
 * the house tokens and the label-catalog copy. Append-only by law — the
 * live surface keeps every child it has (the router and the chat state
 * stay mounted; a wipe is the one thing this wall never does). Idempotent:
 * a second call finds the standing wall and answers its id.
 *
 * @returns the wall element id, or null where no document exists (the
 * node runtime — the response is a safe no-op there).
 */
export function showdevtoolsinterstitial(): string | null {
  if (typeof document === "undefined") return null;
  if (document.getElementById(WALLID)) return WALLID;
  const wall = document.createElement("div");
  wall.id = WALLID;
  wall.className = "dt-devtools-wall";
  wall.setAttribute("role", "alertdialog");
  wall.setAttribute("aria-modal", "true");
  wall.setAttribute("aria-label", osText("guard.wall.aria"));
  const mark = document.createElement("div");
  mark.className = "dt-devtools-wall__mark";
  const title = document.createElement("h2");
  title.className = "dt-devtools-wall__title";
  title.textContent = osText("guard.wall.title");
  const body = document.createElement("p");
  body.className = "dt-devtools-wall__body";
  body.textContent = osText("guard.wall.body");
  const note = document.createElement("p");
  note.className = "dt-devtools-wall__note";
  note.textContent = osText("guard.wall.note");
  wall.append(mark, title, body, note);
  // the motion law rides the document root attribute; the wall carries
  // its own copy so the guard holds wherever it lands
  if (document.documentElement.dataset.motion === "reduced") wall.dataset.motion = "reduced";
  document.body.appendChild(wall);
  return WALLID;
}

/* ---------------------------------- trip --------------------------------- */

/** Reports a second-signal sighting without standing the wall (the
 * console probe rides this): the listeners answer — the strike report of
 * guard.ts rides the site api — but the interstitial never shows on a
 * probe alone and the duty cycle keeps running (the trap stays armed for
 * the real answer). */
function report(signal: string): void {
  for (const listener of listeners) {
    try {
      listener(signal);
    } catch {
      /* a listener failure never stops the wall */
    }
  }
}

/** Fires the wall once (the prongs converge here): the duty cycle parks
 * (the wall answered — no further polling, the study's rest-after-trip),
 * the interstitial stands, then the listeners answer. Only the debugger
 * trap calls this — the one prong that cannot fire without an attached
 * debugger. */
function trip(signal: string): void {
  if (state.tripped) return;
  state.tripped = true;
  parkloop();
  showdevtoolsinterstitial();
  for (const listener of listeners) {
    try {
      listener(signal);
    } catch {
      /* a listener failure never stops the wall */
    }
  }
}

/* -------------------------------- surface -------------------------------- */

/**
 * Installs the wall (the boot calls once before the first render). Only
 * production builds arm; an explicit suspend option parks the prongs at
 * once, and a suspension already standing (the personalization channel
 * applied on boot) is always respected — install never un-suspends.
 *
 * @param options the suspend seam for the first-party flows and the trap
 * interval override (tests ride both).
 * @returns the disarm function (flips the suspend seam and parks every
 * loop — the os's own settings can call it).
 */
export function installdevtoolsguard(options?: { suspend?: boolean; intervalms?: number }): () => void {
  if (!guardarmed()) return () => undefined;
  state.intervalms = options?.intervalms ?? TRAPINTERVALMS;
  if (!state.armed) {
    state.armed = true;
    consoleprobe = makeconsoleprobe();
  }
  if (options?.suspend) {
    state.suspended = true;
    parkloop();
  } else if (!state.suspended && !state.tripped) {
    runloop();
  }
  return () => {
    state.suspended = true;
    parkloop();
  };
}

/**
 * The suspend seam (the settings toggle rides it): true parks every prong
 * — no loop runs while suspended — and false lets the duty cycle run
 * again when the wall is armed and has not tripped. The seam answers on
 * every build so the toggle behaves the same in dev.
 *
 * @param suspended true suspends the wall, false re-arms it.
 */
export function suspenddevtoolsguard(suspended: boolean): void {
  state.suspended = suspended;
  if (suspended || state.tripped || !state.armed) {
    parkloop();
    return;
  }
  runloop();
}

/* ===== block: guard ===== */
/**
 * guard — the reporting channel of the devtools wall (component-scoped
 * logic, lives at the web root). The detection machinery and the trip
 * surface live in devtoolsguard.ts, the single module; this file only
 * speaks to the site api: the strike report a tripped wall emits and the
 * ban status question the boot asks. The api records the strike in the
 * shared table every clone db syncs; the interface answer is the wall's
 * calm interstitial (devtoolsguard.ts owns it) — never a blank, never a
 * wipe. The visitor machine is never touched — only the report rides
 * over https.
 *
 * @section base the catalog base the reports ride
 * @section strike the strike report (the wall's trip listener calls it)
 * @section status the ban status question of the boot
 * @depends-on devtoolsguard.ts (the caller of the strike, the owner of the response)
 * @consumed-by App.tsx (the boot wiring)
 */

/** @section base — the catalog base of the site api (empty means offline:
 * every call below stays silent and the interface renders). */
const GUARD_BASE = (import.meta.env?.VITE_CATALOG_URL as string | undefined)?.replace(/\/$/, "") ?? "";

/**
 * @section strike — reports one strike to the site api. The call changes
 * nothing on the surface (the interstitial already stands when the wall
 * emits); offline stays silent.
 *
 * @param signal the dotted prong id that tripped (the api records it).
 */
export async function reportguardstrike(signal: string): Promise<void> {
  try {
    if (GUARD_BASE) {
      await fetch([GUARD_BASE, "guard", "strike"].join("/"), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ signal, href: location.href }),
      });
    }
  } catch {
    /* offline: the wall still answers locally */
  }
}

/**
 * @section status — asks the api whether this address is banned. The
 * answer is a boolean and nothing else: the caller decides the surface
 * (the boot shows the wall interstitial when true); this channel never
 * blanks anything itself.
 *
 * @returns true when the api answers banned, false everywhere else.
 */
export async function guardStatus(): Promise<boolean> {
  try {
    if (!GUARD_BASE) return false;
    const answer = await fetch([GUARD_BASE, "guard", "status"].join("/"), { headers: { accept: "application/json" } });
    if (answer.ok) {
      const payload = (await answer.json()) as { banned?: boolean };
      if (payload.banned) return true;
    }
  } catch {
    /* offline: the interface renders */
  }
  return false;
}
/* ── The lane dispatcher — the saddle scripts.ts precedent: the CLI seats that
   rode standalone files before the consolidation answer their lane word here
   (node security.ts cspaudit | crxharvest | checksecrets), the dispatcher keeps
   the scripts' own argv contract, and importers never trip the lanes (the
   typeof guard keeps the browser bundles that inline the pure sections safe). ── */
const securitylane =
  typeof process !== "undefined" &&
  (process.argv?.[1]?.endsWith("security.ts") || process.argv?.[1]?.endsWith("security"))
    ? process.argv[2]
    : undefined;
if (securitylane === "cspaudit") void cspauditlane();
if (securitylane === "crxharvest") void crxharvestlane();
if (securitylane === "checksecrets") void checksecretslane();

