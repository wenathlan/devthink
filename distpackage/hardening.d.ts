import type { policyevaluation, redactregion, scanverdict } from "./types.js";
/** Masks the secret shaped key value pairs of one free form log text: a summary a step, a body or a console line embedded stays masked when its key matches a masked shape, because a log field the families gained since the masking audit never leaks its typed value through the text the audit trail keeps. */
export declare function masklogtext(input: {
    text: string;
    shapes: string[];
}): {
    text: string;
    maskedkeys: string[];
    reason: string;
};
/** Gates the local signature check option of the virus scanning hook: a scanner configured with a local signature list answers its verdict on the device before any remote endpoint fires, and a digest that matches a local signature flags the file while a digest that matches nothing leaves the verdict to the configured hook. */
export declare function localscangate(input: {
    hook?: {
        scanner: string;
        localsignatures?: string[];
    };
    digest?: string;
}): {
    verdict: scanverdict;
    reason: string;
};
/** Builds the visible confirmation banner of the escape hatch: one record the surfaces render after the key press, because a halt of every native call at once deserves a confirmation the user sees and the audit trail keeps. */
export declare function hatchbannerof(input: {
    halted: number;
    at: number;
}): {
    title: string;
    explanation: string;
    halted: number;
    at: number;
};
/** Decides the review mode pause on a new domain: a navigation step that lands on a domain the profile workspace never recorded pauses the run with the explanatory card instead of dispatching silently, because a new domain is a new trust boundary the review walks the user through. */
export declare function newdomainpausecard(input: {
    origin: string;
    knownorigins: string[];
    kind: string;
}): {
    pause: boolean;
    card: {
        title: string;
        explanation: string;
        origin: string;
    };
    reason: string;
};
/** Selects every stored key that carries the trace of one run: the per run keys the families write end with the run id, so the purge of a run deletes every key that names it and no key survives with the run's data. */
export declare function runtracekeys(input: {
    runid: string;
    keys: string[];
}): {
    keys: string[];
    kept: string[];
    reason: string;
};
/** Gates the key rotation entry point of the encrypted sync path: the rotation needs both the current passphrase and the next one, and a rotation that reuses the same passphrase rekeys nothing. */
export declare function syncrotationgate(input: {
    current?: string;
    next?: string;
}): policyevaluation;
/** Verifies the client signature of the local stdio bridge: the platform verifier answers when the platform allows signature verification, a presented signature that fails refuses the bridge, and a platform without a verifier keeps the bridge running unverified while the record says so. */
export declare function stdioclientsignaturegate(input: {
    platformverifier?: (host: string, signature: string) => boolean;
    host: string;
    signature?: string;
}): {
    verified: boolean;
    allowed: boolean;
    reason: string;
};
/** Masks and redacts one transparency export payload: the shape masking covers every typed field of the report while the redact regions of the origin mark the capture derived entries, so an export the transparency page issues leaves with the same masking and redaction the captures carry. */
export declare function transparencyexportmask(input: {
    report: Record<string, unknown>;
    shapes: string[];
    regions: redactregion[];
}): {
    payload: Record<string, unknown>;
    maskedfields: string[];
    redactedregions: number;
    reason: string;
};
//# sourceMappingURL=hardening.d.ts.map