/** The security hardening family of the 1.1.95 release: the gates the release candidates carry live in their own root module beside the policy family so the frozen library surface of index.ts stays byte identical — the background service worker imports these gates directly, tests/pentest.mjs exercises every one of them against the compiled dist/hardening.js bundle, and the module stays out of the index.ts export graph because the api freeze of 1.1.91 pins that surface until 2.0.0. The family covers the log text masking of the audit trail, the local signature check of the virus scanning hook, the visible confirmation banner of the escape hatch, the review mode pause on new domains, the run trace purge, the key rotation of the encrypted sync path, the client signature verification of the local stdio bridge and the masking plus redaction pass of the transparency exports. */
import { maskexport, maskvalue, maskingfield } from "./security.js";
import type { policyevaluation, redactregion, scanverdict } from "./types.js";

/** Masks the secret shaped key value pairs of one free form log text: a summary a step, a body or a console line embedded stays masked when its key matches a masked shape, because a log field the families gained since the masking audit never leaks its typed value through the text the audit trail keeps. */
export function masklogtext(input: { text: string; shapes: string[] }): {
  text: string;
  maskedkeys: string[];
  reason: string;
} {
  const maskedkeys: string[] = [];
  let text = input.text;
  /* the json shape ("password": "x"), the query shape (password=x) and the labeled shape (password: x) all recognize through the same field shape grammar the named fields read */
  const patterns: Array<[RegExp, (match: RegExpExecArray) => string]> = [
    [/(\w+)\s*:\s*"((?:[^"\\]|\\.)*)"/g, (match) => `${match[1]}: "${maskvalue(match[2] ?? "")}"`],
    [/(\w+)\s*=\s*([^\s&;]+)/g, (match) => `${match[1]}=${maskvalue(match[2] ?? "")}`],
    [/(\w+)\s*:\s*([^\s,;]+)/g, (match) => `${match[1]}: ${maskvalue(match[2] ?? "")}`],
  ];
  for (const [pattern, rewrite] of patterns) {
    text = text.replace(pattern, (full, key, ...rest) => {
      if (!maskingfield(String(key), input.shapes)) return full;
      maskedkeys.push(String(key));
      return rewrite([full, String(key), String(rest[0] ?? "")] as unknown as RegExpExecArray);
    });
  }
  const unique = [...new Set(maskedkeys)];
  return {
    text,
    maskedkeys: unique,
    reason:
      unique.length === 0
        ? "The log text carries no secret shaped key value pair; the masking pass changed nothing."
        : `The masking pass covered the log field${unique.length === 1 ? "" : "s"} ${unique.join(", ")} the text carried since the audit; the typed values answer the redaction marker.`,
  };
}

/** Gates the local signature check option of the virus scanning hook: a scanner configured with a local signature list answers its verdict on the device before any remote endpoint fires, and a digest that matches a local signature flags the file while a digest that matches nothing leaves the verdict to the configured hook. */
export function localscangate(input: { hook?: { scanner: string; localsignatures?: string[] }; digest?: string }): {
  verdict: scanverdict;
  reason: string;
} {
  const signatures = input.hook?.localsignatures ?? [];
  if (signatures.length === 0)
    return {
      verdict: "pending",
      reason:
        "The scanning hook carries no local signature list; the verdict stays with the configured scanner endpoint and the file holds.",
    };
  if (input.digest === undefined || input.digest.trim() === "")
    return {
      verdict: "pending",
      reason: `The local signature check of ${input.hook?.scanner ?? "the scanning hook"} needs the file digest; a digest nobody computed flags nothing.`,
    };
  if (signatures.includes(input.digest))
    return {
      verdict: "flagged",
      reason: `The local signature list of ${input.hook?.scanner} matched the file digest; the quarantine deletes the file and no remote endpoint ever fires.`,
    };
  return {
    verdict: "pending",
    reason: `The local signature list of ${input.hook?.scanner} matched no signature; the verdict falls back to the configured scanner endpoint and the file holds.`,
  };
}

/** Builds the visible confirmation banner of the escape hatch: one record the surfaces render after the key press, because a halt of every native call at once deserves a confirmation the user sees and the audit trail keeps. */
export function hatchbannerof(input: { halted: number; at: number }): {
  title: string;
  explanation: string;
  halted: number;
  at: number;
} {
  return {
    title: `Escape hatch: ${input.halted} in flight call${input.halted === 1 ? "" : "s"} halted`,
    explanation: `The escape hatch key stopped every native call in one press at ${new Date(input.at).toISOString()}; the transport detached until you reattach and the halt stays recorded in the audit trail.`,
    halted: input.halted,
    at: input.at,
  };
}

/** Decides the review mode pause on a new domain: a navigation step that lands on a domain the profile workspace never recorded pauses the run with the explanatory card instead of dispatching silently, because a new domain is a new trust boundary the review walks the user through. */
export function newdomainpausecard(input: { origin: string; knownorigins: string[]; kind: string }): {
  pause: boolean;
  card: { title: string; explanation: string; origin: string };
  reason: string;
} {
  if (input.knownorigins.includes(input.origin))
    return {
      pause: false,
      card: { title: "", explanation: "", origin: input.origin },
      reason: `The domain ${input.origin} sits inside the recorded origins; the review mode runs the ${input.kind} step without the new domain pause.`,
    };
  return {
    pause: true,
    card: {
      title: `New domain: ${input.origin}`,
      explanation: `The ${input.kind} step targets a domain the profile workspace never recorded. The run pauses here so you can review the new trust boundary: the safedefaults profile applied reads only, every sensitive class stays denied, and the next explicit grant opens the domain the same way the first one did.`,
      origin: input.origin,
    },
    reason: `The review mode paused the ${input.kind} step on the new domain ${input.origin} with the explanatory card; the run resumes after the domain review.`,
  };
}

/** Selects every stored key that carries the trace of one run: the per run keys the families write end with the run id, so the purge of a run deletes every key that names it and no key survives with the run's data. */
export function runtracekeys(input: { runid: string; keys: string[] }): {
  keys: string[];
  kept: string[];
  reason: string;
} {
  if (input.runid.trim() === "")
    throw new Error("The run trace purge names its run; a nameless run trace purges nothing.");
  const runid = input.runid.trim();
  const keys = input.keys.filter((key) => key === runid || key.endsWith(runid));
  const kept = input.keys.filter((key) => !keys.includes(key));
  return {
    keys,
    kept,
    reason:
      keys.length === 0
        ? `No stored key carries the trace of the run ${runid}; the run trace purge deletes nothing.`
        : `The run trace purge deletes ${keys.length} stored key${keys.length === 1 ? "" : "s"} carrying the trace of the run ${runid} — ${keys.join(", ")} — while ${kept.length} key${kept.length === 1 ? "" : "s"} of other runs survive.`,
  };
}

/** Gates the key rotation entry point of the encrypted sync path: the rotation needs both the current passphrase and the next one, and a rotation that reuses the same passphrase rekeys nothing. */
export function syncrotationgate(input: { current?: string; next?: string }): policyevaluation {
  if ((input.current ?? "").trim() === "" || (input.next ?? "").trim() === "")
    return {
      allowed: false,
      reason:
        "The key rotation names both the current passphrase and the next one; a rotation without either passphrase never rekeys because no key ever defaults in code.",
    };
  if (input.current === input.next)
    return {
      allowed: false,
      reason:
        "The key rotation needs a next passphrase that differs from the current one; rotating onto the same key rekeys nothing.",
    };
  return {
    allowed: true,
    reason:
      "The key rotation entry point opens with both passphrases present; the derived key rekeys the sync payloads while the passphrases never persist.",
  };
}

/** Verifies the client signature of the local stdio bridge: the platform verifier answers when the platform allows signature verification, a presented signature that fails refuses the bridge, and a platform without a verifier keeps the bridge running unverified while the record says so. */
export function stdioclientsignaturegate(input: {
  platformverifier?: (host: string, signature: string) => boolean;
  host: string;
  signature?: string;
}): { verified: boolean; allowed: boolean; reason: string } {
  if (input.signature === undefined || input.platformverifier === undefined)
    return {
      verified: false,
      allowed: true,
      reason:
        "The platform carries no signature verifier the bridge can call; the local stdio bridge stays unverified while the record marks it.",
    };
  if (!input.platformverifier(input.host, input.signature))
    return {
      verified: false,
      allowed: false,
      reason: `The client signature of the ${input.host} bridge failed the platform verification; the local stdio bridge refuses the client and no frame relays.`,
    };
  return {
    verified: true,
    allowed: true,
    reason: `The platform verifier confirmed the client signature of the ${input.host} bridge; the local stdio bridge relays its frames under the verified client.`,
  };
}

/** Masks and redacts one transparency export payload: the shape masking covers every typed field of the report while the redact regions of the origin mark the capture derived entries, so an export the transparency page issues leaves with the same masking and redaction the captures carry. */
export function transparencyexportmask(input: {
  report: Record<string, unknown>;
  shapes: string[];
  regions: redactregion[];
}): { payload: Record<string, unknown>; maskedfields: string[]; redactedregions: number; reason: string } {
  const payload = maskexport(input.report, input.shapes) as Record<string, unknown>;
  const maskedfields = Object.keys(input.report).filter((key) => maskingfield(key, input.shapes));
  if (input.regions.length > 0 && Array.isArray(payload.captures))
    payload.captures = (payload.captures as unknown[]).map((entry) =>
      Boolean(entry) && typeof entry === "object" && !Array.isArray(entry)
        ? { ...(entry as Record<string, unknown>), redacted: true, redactedregions: input.regions.length }
        : entry,
    );
  return {
    payload,
    maskedfields,
    redactedregions: input.regions.length,
    reason: `The transparency export left with the masking pass over ${maskedfields.length} shaped field${maskedfields.length === 1 ? "" : "s"} and ${input.regions.length} redact region${input.regions.length === 1 ? "" : "s"} covering its capture derived entries; the raw values stay behind the redaction marker.`,
  };
}
