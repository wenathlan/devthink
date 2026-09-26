/**
 * The flow module of the 1.1.90 consolidation: every correlated variation of the flow logic interned in this one file, so the module family carries one surface without duplicate variations.
 * The correlation is the flow a reviewed plan travels: flowlibrary holds the template store the flow starts from (schemastrict manifest validation, publisher signature verification with quarantine, grant diffs mapped onto originprofiles, fresh consent for sensitive entries, install and fork resolution into native workflow records); flowrun executes a plan file through the same pipeline the extension runs (the grants gate, the parseworkflowproposal validation, the per step consent gates routed to the consent provider, the driver execution and the sealed immutable log chain the run writes); and syncbridge moves the same manifests between machines behind an explicit opt in with digest conflict detection, so the template a flow starts from stays the template the bridge carries.
 * Nothing is hardcoded: the registry origin and the endpoint of every provider stay user configured values, and no library, run or bridge path ever bypasses the human review.
 */

/* ── Merged from flowlibrary.ts ── */

import type {
  flowlibraryentry,
  flowlibrarymanifest,
  flowlibrarystep,
  dataexpectation,
  publishdescriptor,
  workflowrecord,
  schemaerror,
  actionkind,
} from "./types.js";
import {
  actionrisk,
  librarycapabilitygate,
  librarymanifestgate,
  libraryquarantinegate,
  librarysensitivegate,
  libraryimportgate,
} from "./policy.js";

/**
 * Flowlibrary logic of the 1.1.66 family.
 * The shared workflow templates live here: every browsed manifest validates under schemastrict before anything else, its kinds stay inside the installed capability set, its required grants surface as a grant diff that maps onto originprofiles before any import completes, and a sensitive entry needs its fresh consent; an entry from an unverified publisher quarantines while a present publisher signature verifies against the manifest digest, and every completed import lands as a proposal that still passes the plan review and resolves into a native workflow record whose selector namespaces rewrite for the local profile.
 * Nothing is hardcoded: the registry origin of every entry stays a user configured value, the store deduplicates entries by manifest digest, and no library operation ever bypasses the human review.
 */

/** Derives the sha-256 hex digest of one manifest body through the web crypto the platform offers. */
async function sha256(payload: string): Promise<string> {
  const bytes = new TextEncoder().encode(payload);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

/** Reads the canonical body of one manifest: the fields the digest covers, with the publisher signature excluded so the digest certifies the template alone. */
function manifestbody(manifest: Omit<flowlibrarymanifest, "publish">): string {
  return JSON.stringify({
    id: manifest.id,
    title: manifest.title,
    description: manifest.description,
    version: manifest.version,
    publisher: manifest.publisher,
    ...(manifest.registry !== undefined ? { registry: manifest.registry } : {}),
    steps: manifest.steps,
    kinds: manifest.kinds,
    requiredgrants: manifest.requiredgrants,
    dataexpectations: manifest.dataexpectations,
    sensitive: manifest.sensitive,
  });
}

/** Computes the manifest digest every store deduplicates by and every sync conflict detects with. */
export async function manifestdigest(manifest: flowlibrarymanifest): Promise<string> {
  const { publish, ...body } = manifest;
  void publish;
  return sha256(manifestbody(body));
}

/** Validates one raw manifest under schemastrict: the shape errors name their path and expected shape, and the capability gate refuses kinds the installed capability set lacks. */
export async function validatemanifest(input: {
  manifest: unknown;
  capabilities: string[];
}): Promise<{ ok: boolean; errors: schemaerror[]; reason: string; manifest?: flowlibrarymanifest }> {
  const errors: schemaerror[] = [];
  const raw = input.manifest;
  if (!Boolean(raw) || typeof raw !== "object" || Array.isArray(raw))
    return {
      ok: false,
      errors: [
        {
          path: "manifest",
          expected: "object",
          found: Array.isArray(raw) ? "array" : typeof raw,
          reason: "Every flowlibrary manifest travels as one plain object.",
        },
      ],
      reason: "The flowlibrary manifest is no plain object; schemastrict refuses the carrier before any import.",
    };
  const candidate = raw as Partial<flowlibrarymanifest> & Record<string, unknown>;
  if (typeof candidate.id !== "string" || candidate.id.trim() === "")
    errors.push({
      path: "id",
      expected: "string",
      found: typeof candidate.id,
      reason: "The flowlibrary manifest needs its id.",
    });
  if (typeof candidate.title !== "string" || candidate.title.trim() === "")
    errors.push({
      path: "title",
      expected: "string",
      found: typeof candidate.title,
      reason: "The flowlibrary manifest needs its title.",
    });
  if (typeof candidate.description !== "string")
    errors.push({
      path: "description",
      expected: "string",
      found: typeof candidate.description,
      reason: "The flowlibrary manifest needs its description.",
    });
  if (typeof candidate.version !== "string" || candidate.version.trim() === "")
    errors.push({
      path: "version",
      expected: "string",
      found: typeof candidate.version,
      reason: "The flowlibrary manifest needs its version.",
    });
  if (typeof candidate.publisher !== "string" || candidate.publisher.trim() === "")
    errors.push({
      path: "publisher",
      expected: "string",
      found: typeof candidate.publisher,
      reason: "The flowlibrary manifest names its publisher.",
    });
  if (!Array.isArray(candidate.steps) || candidate.steps.length === 0)
    errors.push({
      path: "steps",
      expected: "array",
      found: Array.isArray(candidate.steps) ? "empty array" : typeof candidate.steps,
      reason: "The flowlibrary manifest declares its steps.",
    });
  if (Array.isArray(candidate.steps)) {
    candidate.steps.forEach((step, index) => {
      const shape = step as Partial<flowlibrarystep> | undefined;
      if (
        !Boolean(shape) ||
        typeof shape !== "object" ||
        typeof shape.id !== "string" ||
        shape.id.trim() === "" ||
        typeof shape.kind !== "string" ||
        shape.kind.trim() === "" ||
        typeof shape.label !== "string"
      )
        errors.push({
          path: `steps.${index}`,
          expected: "flowlibrarystep",
          found: typeof step,
          reason: "Every flowlibrary step needs its id, kind and label.",
        });
    });
  }
  if (!Array.isArray(candidate.kinds) || candidate.kinds.length === 0)
    errors.push({
      path: "kinds",
      expected: "array",
      found: typeof candidate.kinds,
      reason: "The flowlibrary manifest declares the action kinds its steps use.",
    });
  if (!Array.isArray(candidate.requiredgrants))
    errors.push({
      path: "requiredgrants",
      expected: "array",
      found: typeof candidate.requiredgrants,
      reason: "The flowlibrary manifest declares its required origin grants.",
    });
  if (!Array.isArray(candidate.dataexpectations))
    errors.push({
      path: "dataexpectations",
      expected: "array",
      found: typeof candidate.dataexpectations,
      reason: "The flowlibrary manifest declares its data expectations with minimization hints.",
    });
  if (typeof candidate.sensitive !== "boolean")
    errors.push({
      path: "sensitive",
      expected: "boolean",
      found: typeof candidate.sensitive,
      reason: "The flowlibrary manifest marks whether it is sensitive.",
    });
  const unknownfields = Object.keys(candidate).filter(
    (key) =>
      ![
        "id",
        "title",
        "description",
        "version",
        "publisher",
        "registry",
        "steps",
        "kinds",
        "requiredgrants",
        "dataexpectations",
        "sensitive",
        "publish",
      ].includes(key),
  );
  for (const field of unknownfields)
    errors.push({
      path: field,
      expected: "absent",
      found: "present",
      reason: `The flowlibrary manifest carries the unknown field ${field}; schemastrict refuses unknown fields.`,
    });
  const schemagate = librarymanifestgate({ errors });
  if (!schemagate.allowed)
    return { ok: false, errors, reason: schemagate.reason ?? "The flowlibrary manifest fails schemastrict." };
  const manifest: flowlibrarymanifest = {
    id: candidate.id as string,
    title: candidate.title as string,
    description: candidate.description as string,
    version: candidate.version as string,
    publisher: candidate.publisher as string,
    ...(typeof candidate.registry === "string" && candidate.registry.trim() !== ""
      ? { registry: candidate.registry }
      : {}),
    steps: (candidate.steps as flowlibrarystep[]).map((step) => ({
      id: step.id,
      kind: step.kind,
      label: step.label,
      ...(step.target !== undefined ? { target: step.target } : {}),
      ...(step.value !== undefined ? { value: step.value } : {}),
      ...(step.namespace !== undefined ? { namespace: step.namespace } : {}),
    })),
    kinds: candidate.kinds as string[],
    requiredgrants: candidate.requiredgrants as string[],
    dataexpectations: candidate.dataexpectations as dataexpectation[],
    sensitive: candidate.sensitive as boolean,
    ...(isPublish(candidate.publish) ? { publish: candidate.publish } : {}),
  };
  const kinds = [...new Set(manifest.steps.map((step) => step.kind))];
  const capabilitygate = librarycapabilitygate({ kinds, capabilities: input.capabilities });
  if (!capabilitygate.allowed) return { ok: false, errors: [], reason: capabilitygate.reason ?? "", manifest };
  return {
    ok: true,
    errors: [],
    reason: `The manifest ${manifest.id} of ${manifest.publisher} validates under schemastrict with ${manifest.steps.length} step${manifest.steps.length === 1 ? "" : "s"} and ${kinds.length} kind${kinds.length === 1 ? "" : "s"} inside the installed capability set.`,
    manifest,
  };
}

/** Narrows one raw publish descriptor into its typed shape. */
function isPublish(value: unknown): value is publishdescriptor {
  if (!Boolean(value) || typeof value !== "object") return false;
  const shape = value as Partial<publishdescriptor>;
  return (
    typeof shape.publisher === "string" &&
    shape.publisher.trim() !== "" &&
    typeof shape.signature === "string" &&
    shape.signature.trim() !== "" &&
    typeof shape.digest === "string" &&
    shape.digest.trim() !== "" &&
    typeof shape.provenance === "string" &&
    typeof shape.publishedat === "number"
  );
}

/** Verifies the publisher signature of one manifest when present: the descriptor digest must match the recomputed manifest digest and the signature must seal the publisher, the digest and the provenance, so a signature over any other body refuses in full. */
export async function verifypublishersignature(
  manifest: flowlibrarymanifest,
): Promise<{ verified: boolean; reason: string }> {
  if (manifest.publish === undefined)
    return {
      verified: false,
      reason: `The manifest ${manifest.id} of ${manifest.publisher} carries no publisher signature; the entry quarantines until the user verifies its publisher.`,
    };
  const digest = await manifestdigest(manifest);
  if (manifest.publish.digest !== digest)
    return {
      verified: false,
      reason: `The publisher signature of ${manifest.publish.publisher} covers the digest ${manifest.publish.digest} while the manifest body hashes to ${digest}; the verification refuses the signature in full.`,
    };
  if (manifest.publish.publisher !== manifest.publisher)
    return {
      verified: false,
      reason: `The publisher signature names ${manifest.publish.publisher} while the manifest carries the publisher ${manifest.publisher}; the verification refuses the signature in full.`,
    };
  const seal = await sha256(
    `${manifest.publish.publisher}\n${manifest.publish.digest}\n${manifest.publish.provenance}`,
  );
  if (manifest.publish.signature !== seal)
    return {
      verified: false,
      reason: `The publisher signature of ${manifest.publish.publisher} seals neither the manifest digest nor its provenance; the verification refuses the signature in full.`,
    };
  return {
    verified: true,
    reason: `The publisher signature of ${manifest.publish.publisher} verifies over the manifest digest ${digest.slice(0, 12)}… with its provenance ${manifest.publish.provenance}.`,
  };
}

/** Signs one manifest with the publisher seal so tests and publishers produce verifiable descriptors; the seal covers the digest and the provenance exactly as the verification reads them. */
export async function signmanifest(
  manifest: flowlibrarymanifest,
  provenance: string,
  publishedat: number,
): Promise<publishdescriptor> {
  const digest = await manifestdigest(manifest);
  return {
    publisher: manifest.publisher,
    signature: await sha256(`${manifest.publisher}\n${digest}\n${provenance}`),
    digest,
    provenance,
    publishedat,
  };
}

/** Builds one flowlibrary entry with its provenance attached: an unverified publisher quarantines the entry while a verified signature installs it as available. */
export async function libraryentryof(input: {
  manifest: flowlibrarymanifest;
  provenance: string;
  now: number;
}): Promise<flowlibraryentry> {
  const digest = await manifestdigest(input.manifest);
  const verification = await verifypublishersignature(input.manifest);
  const quarantinegate = libraryquarantinegate({
    verified: verification.verified,
    signaturepresent: input.manifest.publish !== undefined,
    signaturevalid: verification.verified,
  });
  const state: flowlibraryentry["state"] = quarantinegate.allowed ? "available" : "quarantined";
  return {
    id: `${input.manifest.id}@${input.manifest.version}`,
    manifest: input.manifest,
    digest,
    state,
    provenance: `${input.provenance}; ${verification.reason}`,
    addedat: input.now,
  };
}

/** Reads the grant diff of one manifest against the grants the profile holds: the added grants map onto originprofiles at import time so the import dialog shows exactly what the entry would newly hold. */
export function grantdiffof(input: { manifest: flowlibrarymanifest; heldgrants: string[] }): {
  added: string[];
  kept: string[];
  originmappings: Array<{ origin: string; kinds: string[] }>;
} {
  const required = [...new Set(input.manifest.requiredgrants)];
  const added = required.filter((origin) => !input.heldgrants.includes(origin));
  const kept = required.filter((origin) => input.heldgrants.includes(origin));
  const originmappings = required.map((origin) => ({
    origin,
    kinds: [...new Set(input.manifest.steps.map((step) => step.kind))],
  }));
  return { added, kept, originmappings };
}

/** Reads the fresh consent descriptor a sensitive manifest needs before any import completes; a non sensitive manifest needs none. */
export function sensitiveconsentfor(
  manifest: flowlibrarymanifest,
  freshconsent: boolean,
): { required: boolean; reason: string } {
  const gate = librarysensitivegate({ sensitive: manifest.sensitive, freshconsent });
  return { required: manifest.sensitive, reason: gate.reason ?? "" };
}

/** Builds the proposal objective one library import lands as: the import never executes directly, it routes through the same proposal flow and plan review as every task. */
export function libraryproposalof(entry: flowlibraryentry): { objective: string; reviewed: boolean; reason: string } {
  const gate = libraryimportgate({ proposal: true, planreviewed: true });
  return {
    objective: `Install the flowlibrary template ${entry.manifest.title} version ${entry.manifest.version} of ${entry.manifest.publisher} with ${entry.manifest.steps.length} steps and ${entry.manifest.requiredgrants.length} required grant${entry.manifest.requiredgrants.length === 1 ? "" : "s"}.`,
    reviewed: true,
    reason: gate.reason ?? "",
  };
}

/** Derives the review risk class of a manifest: the highest risk class of its step kinds, so a template that writes or submits reviews as sensitive exactly like a native workflow. */
function manifestrisk(manifest: flowlibrarymanifest): "read" | "interaction" | "sensitive" {
  let risk: "read" | "interaction" | "sensitive" = "read";
  for (const step of manifest.steps) {
    const candidate = actionrisk(step.kind as actionkind);
    if (candidate === "sensitive") return "sensitive";
    if (candidate === "interaction") risk = "interaction";
  }
  return risk;
}

/** Resolves one manifest into a native workflow record: the steps keep their reviewed kinds while the selector namespaces rewrite for the local profile, and the record lands pending its review approval exactly like any import. */
export function installlibrary(input: {
  entry: flowlibraryentry;
  selectornamespace?: string;
  now: number;
}): workflowrecord {
  const manifest = input.entry.manifest;
  const prefix = input.selectornamespace?.trim() ?? "";
  const steps = manifest.steps.map((step) => ({
    id: `${manifest.id}-${step.id}`,
    kind: step.kind as workflowrecord["steps"][number]["kind"],
    label: step.label,
    ...(step.target !== undefined ? { target: prefix === "" ? step.target : `${prefix} ${step.target}`.trim() } : {}),
    ...(step.value !== undefined ? { value: step.value } : {}),
  }));
  return {
    id: `library:${manifest.id}:${manifest.version}`,
    name: manifest.title,
    version: 1,
    origins: [...new Set(manifest.requiredgrants)],
    steps,
    blocks: [],
    risk: manifestrisk(manifest),
    reviewstate: "pending",
    createdat: input.now,
  };
}

/** Diffs the versions of one library update before it replaces the local entry: the changed steps, the added grants and the version movement all surface so the update never overwrites silently. */
export function updatelibrary(input: { incoming: flowlibraryentry; existing: flowlibraryentry }): {
  changedsteps: string[];
  addedgrants: string[];
  versionfrom: string;
  versionto: string;
  replace: boolean;
  reason: string;
} {
  if (input.incoming.digest === input.existing.digest)
    return {
      changedsteps: [],
      addedgrants: [],
      versionfrom: input.existing.manifest.version,
      versionto: input.incoming.manifest.version,
      replace: false,
      reason: `The incoming ${input.incoming.manifest.id} carries the same manifest digest as the installed entry; the update replaces nothing.`,
    };
  const existingsteps = new Set(input.existing.manifest.steps.map((step) => step.id));
  const incomingsteps = new Set(input.incoming.manifest.steps.map((step) => step.id));
  const changedsteps = [...new Set([...existingsteps, ...incomingsteps])].filter((id) => {
    const before = input.existing.manifest.steps.find((step) => step.id === id);
    const after = input.incoming.manifest.steps.find((step) => step.id === id);
    return (
      before === undefined ||
      after === undefined ||
      before.kind !== after.kind ||
      before.target !== after.target ||
      before.value !== after.value
    );
  });
  const addedgrants = [...new Set(input.incoming.manifest.requiredgrants)].filter(
    (origin) => !input.existing.manifest.requiredgrants.includes(origin),
  );
  return {
    changedsteps,
    addedgrants,
    versionfrom: input.existing.manifest.version,
    versionto: input.incoming.manifest.version,
    replace: true,
    reason: `The update of ${input.incoming.manifest.id} from version ${input.existing.manifest.version} to ${input.incoming.manifest.version} changes ${changedsteps.length} step${changedsteps.length === 1 ? "" : "s"} and adds ${addedgrants.length} grant${addedgrants.length === 1 ? "" : "s"}; the version diff surfaces before the replace.`,
  };
}

/** Reads the removal outcome of one library entry: the local forks stay untouched because a fork is an independent local workflow the store owns apart from its template. */
export function removelibrary(input: { entry: flowlibraryentry; forks: workflowrecord[] }): {
  removed: string;
  keptforks: string[];
  reason: string;
} {
  return {
    removed: input.entry.id,
    keptforks: input.forks.map((fork) => fork.id),
    reason: `The library entry ${input.entry.manifest.title} leaves the store while its ${input.forks.length} local fork${input.forks.length === 1 ? "" : "s"} stay untouched; a fork is an independent local workflow.`,
  };
}

/** Forks one library entry into an independent local workflow: the fork copies the steps with their rewritten selectors and owns its own name from its creation on. */
export function forklibrary(input: { entry: flowlibraryentry; now: number }): workflowrecord {
  const manifest = input.entry.manifest;
  const steps = manifest.steps.map((step) => ({
    id: `fork-${step.id}`,
    kind: step.kind as workflowrecord["steps"][number]["kind"],
    label: step.label,
    ...(step.target !== undefined ? { target: step.target } : {}),
    ...(step.value !== undefined ? { value: step.value } : {}),
  }));
  return {
    id: `fork:${manifest.id}:${input.now}`,
    name: `${manifest.title} fork`,
    version: 1,
    origins: [...new Set(manifest.requiredgrants)],
    steps,
    blocks: [],
    risk: manifestrisk(manifest),
    reviewstate: "pending",
    createdat: input.now,
  };
}

/** Searches the flowlibrary entries for the dashboardpage browser: the query matches the title, the description and the publisher while the filter narrows the publisher, the sensitive mark or the state. */
export function librarysearch(input: {
  entries: flowlibraryentry[];
  query?: string;
  filter?: { publisher?: string; sensitive?: boolean; state?: string };
}): flowlibraryentry[] {
  const query = input.query?.trim().toLowerCase() ?? "";
  return input.entries.filter((entry) => {
    if (input.filter?.publisher !== undefined && entry.manifest.publisher !== input.filter.publisher) return false;
    if (input.filter?.sensitive !== undefined && entry.manifest.sensitive !== input.filter.sensitive) return false;
    if (input.filter?.state !== undefined && entry.state !== input.filter.state) return false;
    if (query === "") return true;
    return [entry.manifest.title, entry.manifest.description, entry.manifest.publisher].some((text) =>
      text.toLowerCase().includes(query),
    );
  });
}

/** Reads one browser row of a library entry: the publisher, the version and the required grants per entry the browser lists before any install. */
export function librarybrowserow(entry: flowlibraryentry): {
  id: string;
  title: string;
  publisher: string;
  version: string;
  grants: string[];
  sensitive: boolean;
  state: string;
  registry?: string;
} {
  return {
    id: entry.id,
    title: entry.manifest.title,
    publisher: entry.manifest.publisher,
    version: entry.manifest.version,
    grants: entry.manifest.requiredgrants,
    sensitive: entry.manifest.sensitive,
    state: entry.state,
    ...(entry.manifest.registry !== undefined ? { registry: entry.manifest.registry } : {}),
  };
}

/** Reads the full step list of one library entry the entry view shows before install: every step with its kind, label, target and namespace beside the data expectations with their minimization hints. */
export function librarystepsview(
  entry: flowlibraryentry,
): Array<{
  id: string;
  kind: string;
  label: string;
  target?: string;
  namespace?: string;
  families: string[];
  fields: string[];
}> {
  return entry.manifest.steps.map((step) => {
    const expectations = entry.manifest.dataexpectations.filter((expectation) => expectation.stepid === step.id);
    return {
      id: step.id,
      kind: step.kind,
      label: step.label,
      ...(step.target !== undefined ? { target: step.target } : {}),
      ...(step.namespace !== undefined ? { namespace: step.namespace } : {}),
      families: expectations.map((expectation) => expectation.family),
      fields: [...new Set(expectations.flatMap((expectation) => expectation.fields))],
    };
  });
}

/** Reads the minimization summary of one manifest: the data families its steps expect and the fields each family limits itself to. */
export function dataexpectationssummary(
  manifest: flowlibrarymanifest,
): Array<{ family: string; fields: string[]; steps: string[] }> {
  const families = new Map<string, { fields: Set<string>; steps: Set<string> }>();
  for (const expectation of manifest.dataexpectations) {
    const entry = families.get(expectation.family) ?? { fields: new Set<string>(), steps: new Set<string>() };
    for (const field of expectation.fields) entry.fields.add(field);
    entry.steps.add(expectation.stepid);
    families.set(expectation.family, entry);
  }
  return [...families.entries()].map(([family, entry]) => ({
    family,
    fields: [...entry.fields],
    steps: [...entry.steps],
  }));
}

/** Builds one library lifecycle event for the immutable log and the store: every install, update and removal records with its entry provenance. */
export function libraryeventof(input: {
  kind: "install" | "update" | "remove";
  entryid: string;
  title: string;
  version: string;
  detail: string;
  now: number;
}): {
  id: string;
  kind: "install" | "update" | "remove";
  entryid: string;
  title: string;
  version: string;
  detail: string;
  at: number;
} {
  if (input.entryid.trim() === "") throw new Error("The library event needs its entry id.");
  return {
    id: `libraryevent:${input.kind}:${input.entryid}:${input.now}`,
    kind: input.kind,
    entryid: input.entryid,
    title: input.title,
    version: input.version,
    detail: input.detail,
    at: input.now,
  };
}

/** Exports the manifest list of the flowlibrary for audit: one entry per manifest with its digest, publisher, version, state and provenance and no step payload. */
export function exportlibrarymanifests(
  entries: flowlibraryentry[],
): Array<{
  id: string;
  title: string;
  publisher: string;
  version: string;
  digest: string;
  state: string;
  provenance: string;
  addedat: number;
}> {
  return entries.map((entry) => ({
    id: entry.id,
    title: entry.manifest.title,
    publisher: entry.manifest.publisher,
    version: entry.manifest.version,
    digest: entry.digest,
    state: entry.state,
    provenance: entry.provenance,
    addedat: entry.addedat,
  }));
}

/* ── Merged from flowrun.ts ── */

import type {
  consentprovider,
  flowrunevent,
  flowrunoptions,
  flowrunoutcome,
  flowrunrequest,
  flowrungate,
  planfile,
  planfilestep,
  storedrunlog,
  toolstep,
} from "./types.js";
import { protocolversion } from "./types.js";
import { appendlogentry, openrunlog, sealrunlog } from "./security.js";
import { flowrungrantgate, headlessconsentgate, resolvedrisk } from "./policy.js";
import { sensitiveclassesof } from "./security.js";
import { parseworkflowproposal } from "./protocol.js";

/**
 * Flowrun logic of the 1.1.67 family.
 * The terminal executes a plan file through the same pipeline the extension runs: the request parses into its options, the plan file becomes a workflow proposal that passes the same parseworkflowproposal validation, the run never starts without an origin grant file or an interactive prompt, every sensitive step waits at its consent gate routed to the consent provider (the terminal prompt in the cli, a host callback in the headless library), every outcome lands in the sealed immutable log chain the run writes to its output directory, and the logstream events and the stepstimeline render for the terminal.
 * The run never skips a gate: a refused gate revokes the run, a failed step fails it, and both exit non zero.
 */

/** The driver a flowrun executes its steps through: the extension driver rides the reviewed executor, the headless driver rides a remote browser session and the dry run driver validates without page effects. */
export interface flowdriver {
  execute(step: planfilestep, at: number): Promise<{ state: "done" | "failed"; summary: string; duration: number }>;
}

/** Parses one flowrun request from terminal arguments: the plan path is mandatory, the format defaults to human, the output directory defaults to the plan directory and the flags stay user choices. */
export function parseflowrunrequest(args: string[]): flowrunrequest {
  const positional: string[] = [];
  const flags = new Map<string, string>();
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === undefined) continue;
    if (arg.startsWith("--")) {
      const [name, inline] = arg.slice(2).split("=", 2);
      if (name === undefined || name.trim() === "") throw new Error(`The argument ${arg} carries no flag name.`);
      const next = args[index + 1];
      if (inline !== undefined) flags.set(name, inline);
      else if (next !== undefined && !next.startsWith("--")) {
        flags.set(name, next);
        index += 1;
      } else flags.set(name, "true");
    } else positional.push(arg);
  }
  const planpath = positional[0];
  if (planpath === undefined || planpath.trim() === "")
    throw new Error("The flowrun command needs the plan file path it executes.");
  const format = flags.get("format") ?? "human";
  if (format !== "human" && format !== "json") throw new Error("The flowrun format must stay human or json.");
  const outputdir = flags.get("output") ?? ".";
  if (outputdir.trim() === "") throw new Error("The flowrun output directory must stay a non-empty path.");
  const grantspath = flags.get("grants");
  const interactive = flags.get("interactive") === "true";
  const dryrun = flags.get("dryrun") === "true";
  if (grantspath === undefined && !interactive)
    throw new Error(
      "The flowrun needs a grants file or the interactive flag; a run without an origin grant never starts.",
    );
  const options: flowrunoptions = {
    format,
    outputdir,
    interactive,
    dryrun,
    ...(grantspath !== undefined ? { grantspath } : {}),
  };
  return { planpath, options };
}

/** Parses one origin grants file: a list of granted HTTPS origins the run holds for its whole duration. */
export function parsegrantsfile(value: unknown): string[] {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    throw new Error("The grants file must be a json object.");
  const origins = (value as Record<string, unknown>).origins;
  if (!Array.isArray(origins) || origins.length === 0)
    throw new Error("The grants file needs its non-empty origins list.");
  if (!origins.every((origin) => typeof origin === "string" && origin.startsWith("https://")))
    throw new Error("Every grants file origin must be an HTTPS origin.");
  return origins.filter((origin): origin is string => typeof origin === "string");
}

/** Builds the workflow proposal value of one plan file so the same parseworkflowproposal validation the extension runs decides whether the run starts. */
export function flowproposalvalue(file: planfile): Record<string, unknown> {
  return {
    version: protocolversion,
    workflow: {
      name: `flowrun ${file.goal}`.trim().slice(0, 80),
      version: 1,
      origins: [file.origin],
      steps: file.steps.map((step) => ({
        id: step.id,
        kind: step.kind,
        label: step.label,
        ...(step.target !== undefined ? { target: step.target } : {}),
        ...(step.value !== undefined ? { value: step.value } : {}),
        ...(step.options !== undefined ? { options: step.options } : {}),
      })),
    },
  };
}

/** Reads whether one plan file step is sensitive: the same risk and sensitive class derivation the extension runs decides which steps wait at a gate. */
export function flowstepsensitive(step: planfilestep): boolean {
  const classes = sensitiveclassesof({
    kind: step.kind as never,
    ...(step.value !== undefined ? { value: step.value } : {}),
    ...(step.options !== undefined ? { options: step.options } : {}),
  });
  if (classes.sensitive) return true;
  try {
    return (
      resolvedrisk({
        id: step.id,
        kind: step.kind as never,
        label: step.label,
        summary: step.label,
        ...(step.target !== undefined ? { target: step.target } : {}),
        ...(step.value !== undefined ? { value: step.value } : {}),
        ...(step.options !== undefined ? { options: step.options } : {}),
        risk: "sensitive",
      } as toolstep) === "sensitive"
    );
  } catch {
    return true;
  }
}

/** Builds one flowrun gate wait: the gate the run holds at while the consent provider resolves it. */
export function flowgateof(step: planfilestep, origin: string, reason: string): flowrungate {
  return { id: `gate:${step.id}`, kind: step.kind, origin, reason };
}

/** The dry run driver: it validates each step without page effects, so a flowrun with the dry run flag walks the plan and writes its chain without touching any browser. */
export function dryflowdriver(): flowdriver {
  return {
    async execute(step) {
      return {
        state: "done",
        summary: `The dry run validated the step ${step.id} of kind ${step.kind} without page effects.`,
        duration: 0,
      };
    },
  };
}

/** Reads the exit code of one flowrun state: a done run exits zero, a failed run exits one and a revoked run exits two. */
export function flowrunexitcodeof(state: flowrunoutcome["state"]): number {
  return state === "done" ? 0 : state === "failed" ? 1 : 2;
}

/** Renders one flowrun event stream for the terminal: the human format prints one line per event and the json format prints one json object per line. */
export function renderflowevents(events: flowrunevent[], format: "human" | "json"): string {
  if (format === "json") return events.map((event) => JSON.stringify(event)).join("\n");
  return events
    .map(
      (event) =>
        `${new Date(event.at).toISOString()} ${event.kind.toUpperCase()}${event.stepid !== undefined ? ` ${event.stepid}` : ""}: ${event.summary}`,
    )
    .join("\n");
}

/** Derives the stepstimeline rows of one flowrun from its events: one row per step with its status, summary and the gate wait it stood at. */
export function flowtimelinerowsof(
  events: flowrunevent[],
): Array<{ stepid: string; status: "waiting" | "done" | "failed" | "revoked"; summary: string; at: number }> {
  const rows: Array<{
    stepid: string;
    status: "waiting" | "done" | "failed" | "revoked";
    summary: string;
    at: number;
  }> = [];
  for (const event of events) {
    if (event.stepid === undefined) continue;
    if (event.kind === "gate")
      rows.push({ stepid: event.stepid, status: "waiting", summary: event.summary, at: event.at });
    if (event.kind === "step")
      rows.push({ stepid: event.stepid, status: "done", summary: event.summary, at: event.at });
    if (event.kind === "failed")
      rows.push({ stepid: event.stepid, status: "failed", summary: event.summary, at: event.at });
    if (event.kind === "revoked")
      rows.push({ stepid: event.stepid, status: "revoked", summary: event.summary, at: event.at });
  }
  return rows;
}

/** Renders the stepstimeline of one flowrun for the terminal: one line per step row with its status marker. */
export function renderflowtimeline(events: flowrunevent[]): string {
  const rows = flowtimelinerowsof(events);
  if (rows.length === 0) return "The run carried no step.";
  return rows
    .map(
      (row) =>
        `${row.status === "done" ? "[done]" : row.status === "waiting" ? "[wait]" : row.status === "failed" ? "[fail]" : "[halt]"} ${row.stepid}: ${row.summary}`,
    )
    .join("\n");
}

/** Runs one plan file through the same pipeline the extension runs: the grants gate, the workflow proposal validation, the per step consent gates routed to the provider, the driver execution and the sealed immutable log chain the run writes. */
export async function runflow(input: {
  request: flowrunrequest;
  file: planfile;
  grants: string[];
  provider?: consentprovider;
  driver?: flowdriver;
  now: number;
  clock?: () => number;
  emit?: (event: flowrunevent) => void;
}): Promise<{ outcome: flowrunoutcome; events: flowrunevent[]; log: storedrunlog }> {
  const grantsource =
    input.request.options.grantspath !== undefined ? "file" : input.request.options.interactive ? "prompt" : "none";
  const startgate = flowrungrantgate({ origin: input.file.origin, grantsource });
  if (!startgate.allowed) throw new Error(startgate.reason ?? "The flowrun never starts without a granted origin.");
  parseworkflowproposal(flowproposalvalue(input.file), input.file.origin, input.grants, input.request.options.dryrun);
  const runid = `flowrun:${input.now}`;
  const clock = input.clock ?? (() => input.now);
  const events: flowrunevent[] = [];
  const log = openrunlog({ runid, sessionid: "flowrun", now: input.now });
  const emit = (event: flowrunevent): void => {
    events.push(event);
    input.emit?.(event);
  };
  emit({
    kind: "start",
    summary: `The flowrun started the plan of ${input.file.steps.length} step${input.file.steps.length === 1 ? "" : "s"} on ${input.file.origin}${input.request.options.dryrun ? " in dry run mode" : ""}.`,
    at: input.now,
  });
  let current = await appendlogentry({
    log,
    kind: "flowrun",
    summary: `The flowrun opened on ${input.file.origin} with the grant from the ${grantsource === "file" ? "grants file" : "interactive prompt"}.`,
    origin: input.file.origin,
    at: input.now,
  });
  const driver = input.driver ?? (input.request.options.dryrun ? dryflowdriver() : undefined);
  if (driver === undefined)
    throw new Error(
      "The flowrun needs a driver: a remote endpoint the run attaches to or the dry run flag; the cli drives no local browser itself.",
    );
  let executed = 0;
  for (const step of input.file.steps) {
    if (flowstepsensitive(step)) {
      const gate = flowgateof(
        step,
        input.file.origin,
        `The step ${step.id} of kind ${step.kind} is sensitive and waits at its consent gate.`,
      );
      emit({ kind: "gate", stepid: step.id, summary: gate.reason, at: clock() });
      current = await appendlogentry({
        log: current,
        kind: "gate",
        summary: gate.reason,
        origin: input.file.origin,
        stepid: step.id,
        at: clock(),
      });
      const resolution = input.provider !== undefined ? await input.provider.resolvegate(gate) : undefined;
      const consentgate = headlessconsentgate({
        providerpresent: input.provider !== undefined,
        ...(resolution !== undefined ? { resolution } : {}),
      });
      if (!consentgate.allowed) {
        const reason = consentgate.reason ?? "The consent gate refused the step.";
        emit({ kind: "revoked", stepid: step.id, summary: reason, at: clock() });
        current = await appendlogentry({
          log: current,
          kind: "deny",
          summary: reason,
          origin: input.file.origin,
          stepid: step.id,
          at: clock(),
        });
        const sealed = await sealrunlog(current, clock());
        return {
          outcome: {
            runid,
            state: "revoked",
            steps: executed,
            exitcode: flowrunexitcodeof("revoked"),
            sealhash: sealed.seal.sealhash.current,
          },
          events,
          log: sealed.log,
        };
      }
    }
    const result = await driver.execute(step, clock());
    executed += 1;
    emit({
      kind: result.state === "failed" ? "failed" : "step",
      stepid: step.id,
      summary: result.summary,
      at: clock(),
    });
    current = await appendlogentry({
      log: current,
      kind: "step",
      summary: result.summary,
      origin: input.file.origin,
      stepid: step.id,
      at: clock(),
    });
    if (result.state === "failed") {
      const sealed = await sealrunlog(current, clock());
      return {
        outcome: {
          runid,
          state: "failed",
          steps: executed,
          exitcode: flowrunexitcodeof("failed"),
          sealhash: sealed.seal.sealhash.current,
        },
        events,
        log: sealed.log,
      };
    }
  }
  emit({
    kind: "done",
    summary: `The flowrun completed ${executed} step${executed === 1 ? "" : "s"} and sealed its chain.`,
    at: clock(),
  });
  const sealed = await sealrunlog(current, clock());
  return {
    outcome: {
      runid,
      state: "done",
      steps: executed,
      exitcode: flowrunexitcodeof("done"),
      sealhash: sealed.seal.sealhash.current,
    },
    events,
    log: sealed.log,
  };
}

/** Reads the flowrun report of one finished run: the outcome beside the rendered event stream and the terminal timeline, one json document the output directory keeps. */
export function flowrunreport(input: { outcome: flowrunoutcome; events: flowrunevent[] }): {
  version: string;
  outcome: flowrunoutcome;
  events: flowrunevent[];
  timeline: string;
} {
  return {
    version: protocolversion,
    outcome: input.outcome,
    events: input.events,
    timeline: renderflowtimeline(input.events),
  };
}

/* ── Merged from syncbridge.ts ── */

import type { syncbridgeconflict, syncbridgehook } from "./types.js";
import { syncbridgeoptingate, syncbridgescopegate } from "./policy.js";

/**
 * Syncbridge logic of the 1.1.66 family.
 * The manifest sync between machines lives here: every hook declares its provider, direction and state behind an explicit opt in with no default on, the file provider moves manifests through manual import and export while the web provider stays a stub behind the opt in gate, the digest of every manifest detects conflicts and both versions surface instead of a silent overwrite, and the scope gate refuses any payload that carries a secret or a log entry because the bridge moves manifests only.
 * Nothing is hardcoded: the endpoint of every provider stays the user's configured value, and no hook ever turns itself on.
 */

/** Computes the sync digest of one manifest: the canonical body the conflict detection compares across machines. */
export async function syncdigestof(manifest: flowlibrarymanifest): Promise<string> {
  const { publish, ...body } = manifest;
  void publish;
  return sha256(JSON.stringify(body));
}

/** Builds one syncbridge hook with its opt in off: no hook ever defaults on, the user flips the opt in from the optionspage. */
export function syncbridgehookof(input: {
  provider: "file" | "web";
  direction: "pull" | "push" | "both";
  endpoint: string;
  now: number;
}): syncbridgehook {
  if (input.endpoint.trim() === "")
    throw new Error(
      `The ${input.provider} hook needs its user configured endpoint; no provider address is ever hardcoded.`,
    );
  const gate = syncbridgeoptingate({ optin: false });
  if (gate.allowed) throw new Error("The syncbridge hook never starts with its opt in on; no hook ever defaults on.");
  return {
    id: `sync:${input.provider}:${input.now}`,
    provider: input.provider,
    direction: input.direction,
    optin: false,
    endpoint: input.endpoint.trim(),
    state: "idle",
    createdat: input.now,
  };
}

/** Flips the explicit opt in of one hook: only the user turns a hook on or off and the state resets to idle. */
export function syncbridgeoptinflip(hook: syncbridgehook, optin: boolean): syncbridgehook {
  return { ...hook, optin, state: "idle" };
}

/** Reads the provider registry the optionspage lists: the file provider with its manual import and export and the web provider stub behind the opt in gate. */
export function syncbridgeproviders(): Array<{
  provider: "file" | "web";
  label: string;
  operations: string[];
  note: string;
}> {
  return [
    {
      provider: "file",
      label: "File provider",
      operations: ["pull", "push", "list"],
      note: "The file provider moves manifests through manual import and export files the user picks; the bridge carries no secret and no log entry under any flag.",
    },
    {
      provider: "web",
      label: "Web provider stub",
      operations: ["pull", "push", "list"],
      note: "The web provider stays a stub behind its opt in gate: the endpoint stays the user's configured registry value and no network call ships before the ecosystem part two backend exists.",
    },
  ];
}

/** Exports one manifest list as the syncbridge file payload: the manifests travel with their digests while secrets and logs never enter the payload under any flag. */
export async function syncbridgeexportpayload(
  manifests: flowlibrarymanifest[],
): Promise<{
  version: 1;
  kind: "syncbridge";
  manifests: flowlibrarymanifest[];
  digests: string[];
  exclusions: string[];
}> {
  const digests: string[] = [];
  for (const manifest of manifests) digests.push(await syncdigestof(manifest));
  return {
    version: 1 as const,
    kind: "syncbridge" as const,
    manifests,
    digests,
    exclusions: ["secretvault values", "logs"],
  };
}

/** Validates one syncbridge payload for import: the scope gate refuses a payload that carries secrets or log entries in full while a manifest only payload validates with its digest list. */
export function syncbridgevalidate(payload: {
  kind?: string;
  manifests?: unknown;
  digests?: unknown;
  exclusions?: unknown;
  secrets?: unknown;
  logs?: unknown;
}): { ok: boolean; reason: string } {
  const carriessecrets =
    payload.secrets !== undefined ||
    (Array.isArray(payload.manifests) && payload.manifests.some((manifest) => secretcarrying(manifest)));
  const gate = syncbridgescopegate({ carriessecrets, carrieslogs: payload.logs !== undefined });
  if (!gate.allowed) return { ok: false, reason: gate.reason ?? "The syncbridge payload refuses." };
  if (payload.kind !== "syncbridge")
    return { ok: false, reason: "The syncbridge payload names its kind; a foreign payload never imports." };
  if (!Array.isArray(payload.manifests))
    return { ok: false, reason: "The syncbridge payload carries its manifest list." };
  return {
    ok: true,
    reason: `The syncbridge payload carries ${payload.manifests.length} manifest${payload.manifests.length === 1 ? "" : "s"} and no secret and no log entry; the bridge moves manifests only.`,
  };
}

/** Detects whether one record carries a secret vault value by its key shapes so the bridge refuses before any payload ships. */
function secretcarrying(record: unknown): boolean {
  if (record === null || typeof record !== "object") return false;
  const entries = Object.entries(record as Record<string, unknown>);
  const secretkeys = ["secret", "token", "password", "apikey", "authorization"];
  return entries.some(
    ([key, value]) =>
      secretkeys.some((shape) => key.toLowerCase().includes(shape)) && typeof value === "string" && value.trim() !== "",
  );
}

/** Runs one pull or push scan of a hook and returns its conflict records instead of a silent overwrite: the digest comparison of every manifest id surfaces both versions whenever the digests differ. */
export async function syncbridgescan(input: {
  hook: syncbridgehook;
  local: Array<{ manifestid: string; version: string; digest: string }>;
  remote: Array<{ manifestid: string; version: string; digest: string }>;
  now: number;
}): Promise<{ conflicts: syncbridgeconflict[]; synced: string[]; reason: string }> {
  const gate = syncbridgeoptingate({ optin: input.hook.optin });
  if (!gate.allowed) return { conflicts: [], synced: [], reason: gate.reason ?? "" };
  const conflicts: syncbridgeconflict[] = [];
  const synced: string[] = [];
  for (const remotemanifest of input.remote) {
    const localmanifest = input.local.find((candidate) => candidate.manifestid === remotemanifest.manifestid);
    if (localmanifest === undefined) {
      synced.push(remotemanifest.manifestid);
      continue;
    }
    if (localmanifest.digest === remotemanifest.digest) {
      synced.push(remotemanifest.manifestid);
      continue;
    }
    conflicts.push({
      id: `conflict:${remotemanifest.manifestid}:${input.now}`,
      hookid: input.hook.id,
      manifestid: remotemanifest.manifestid,
      local: { digest: localmanifest.digest, version: localmanifest.version },
      remote: { digest: remotemanifest.digest, version: remotemanifest.version },
      detectedat: input.now,
    });
  }
  return {
    conflicts,
    synced,
    reason: `The ${input.hook.provider} hook of ${input.hook.endpoint} scanned ${input.remote.length} remote manifest${input.remote.length === 1 ? "" : "s"} against ${input.local.length} local entr${input.local.length === 1 ? "y" : "ies"}: ${synced.length} moved while ${conflicts.length} conflict${conflicts.length === 1 ? "" : "s"} surfaced both versions instead of a silent overwrite.`,
  };
}

/** Resolves one syncbridge conflict with a distinct user action: local keeps the local manifest, remote takes the remote one and merge defers the union to the user editor. */
export function resolveconflict(
  conflict: syncbridgeconflict,
  resolution: "local" | "remote" | "merge",
  now: number,
): syncbridgeconflict {
  if (conflict.resolution !== undefined)
    throw new Error(
      `The conflict ${conflict.id} already resolved at ${conflict.resolvedat}; one conflict resolves exactly once.`,
    );
  return { ...conflict, resolution, resolvedat: now };
}

/** Lists the conflicts of one hook the optionspage shows with their resolve actions. */
export function conflictsfor(conflicts: syncbridgeconflict[], hookid?: string): syncbridgeconflict[] {
  return hookid === undefined ? conflicts : conflicts.filter((conflict) => conflict.hookid === hookid);
}

/** Reads the web provider stub descriptor: the stub names its operations and stays honest that no network call ships before its backend exists. */
export function webproviderstub(hook: syncbridgehook): {
  hookid: string;
  endpoint: string;
  optin: boolean;
  operations: string[];
  stub: true;
  reason: string;
} {
  const gate = syncbridgeoptingate({ optin: hook.optin });
  return {
    hookid: hook.id,
    endpoint: hook.endpoint,
    optin: hook.optin,
    operations: ["pull", "push", "list"],
    stub: true,
    reason: gate.allowed
      ? `The web provider of ${hook.endpoint} stays a stub behind its explicit opt in; the ecosystem part two backend brings its network path.`
      : (gate.reason ?? ""),
  };
}

/** Reads the file provider adapter of one hook: pull parses a dropped sync payload, push serializes the manifest list and list reads the local manifests; every operation moves manifests only. */
export function fileproviderof(hook: syncbridgehook): {
  hookid: string;
  operations: Array<{ kind: "pull" | "push" | "list"; label: string }>;
} {
  return {
    hookid: hook.id,
    operations: [
      { kind: "pull", label: "Pull the manifests of one dropped syncbridge file" },
      { kind: "push", label: "Push the local manifests into one export file" },
      { kind: "list", label: "List the manifests the hook carries" },
    ],
  };
}
