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
