/** The ten frozen protocol schemas of the 1.1.91 api freeze as one dense typescript module: every export holds the exact original file text of its tests/code source, so the digests the freeze artifact records keep hashing the same bytes the packages ship. The build materializes the texts into dist/schemas, the freeze gate and the readiness schema stability walk those digests, the recipes gate validates the gallery against the plan schema, and the json gate parses the tracked copies — the schema bytes stay frozen exactly as the freeze stamped them. */

/** The audit schema of the freeze (1.0.0, devthink/protocolv2/audit.schema.json) — freezes the audit trail event shape and the complete audit event name vocabulary: every audit entry carries its id, its event kind of the frozen enum, its epoch, its plain language summary and the optional session, plan and step provenance; the event names join the frozen contract so a log consumer of any release reads the trail of any other release of protocolv2.. The exact text of the former audit.schema.json, byte for byte. */
export const audit = `{
  "$id": "devthink/protocolv2/audit.schema.json",
  "version": "1.0.0",
  "title": "the frozen audit event contract of the api freeze",
  "description": "freezes the audit trail event shape and the complete audit event name vocabulary: every audit entry carries its id, its event kind of the frozen enum, its epoch, its plain language summary and the optional session, plan and step provenance; the event names join the frozen contract so a log consumer of any release reads the trail of any other release of protocolv2.",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "the audit entry id"
    },
    "kind": {
      "type": "string",
      "description": "the audit event name of the frozen vocabulary",
      "enum": [
        "a11y",
        "action",
        "adapter",
        "approval",
        "arbitrate",
        "attention",
        "auth",
        "backgroundrun",
        "badge",
        "batch",
        "batchquery",
        "battery",
        "bridge",
        "budget",
        "cache",
        "call",
        "cancel",
        "capability",
        "capture",
        "checkpoint",
        "chunkextract",
        "cleanup",
        "clipboard",
        "compare",
        "complete",
        "compress",
        "configure",
        "consent",
        "consentmemory",
        "control",
        "correction",
        "correlate",
        "datagrid",
        "debounce",
        "debugger",
        "dedupe",
        "defer",
        "deny",
        "dialog",
        "diff",
        "discard",
        "doctor",
        "download",
        "dropimport",
        "emulation",
        "environment",
        "error",
        "escalate",
        "expiry",
        "export",
        "exporttool",
        "fill",
        "flowrun",
        "gate",
        "gateway",
        "grant",
        "ground",
        "group",
        "handoff",
        "headless",
        "hold",
        "importexport",
        "inbound",
        "incrsnapshot",
        "intercept",
        "kill",
        "lane",
        "layout",
        "lazyload",
        "lesson",
        "library",
        "locale",
        "lock",
        "logprune",
        "logstream",
        "mask",
        "mcpmode",
        "media",
        "minimize",
        "model",
        "native",
        "navigation",
        "network",
        "notes",
        "notify",
        "observation",
        "observe",
        "ocr",
        "omnibox",
        "onboarding",
        "outputcompare",
        "pagechip",
        "palette",
        "pause",
        "perf",
        "phish",
        "picker",
        "planlint",
        "platform",
        "pointer",
        "poll",
        "post",
        "preconnect",
        "prefetch",
        "profile",
        "proposal",
        "protocol",
        "provenance",
        "purge",
        "quarantine",
        "queue",
        "quickaction",
        "rate",
        "reap",
        "recall",
        "recent",
        "redact",
        "redirect",
        "reopen",
        "replay",
        "resume",
        "retry",
        "review",
        "revoke",
        "rollback",
        "runcache",
        "runreplay",
        "safecheck",
        "sample",
        "sandbox",
        "scaffold",
        "scale",
        "schedule",
        "schema",
        "scrape",
        "scratchpad",
        "seal",
        "search",
        "selcache",
        "session",
        "sessionreuse",
        "shortcut",
        "shotpanel",
        "siteprofile",
        "slowmo",
        "socket",
        "spawn",
        "startup",
        "stop",
        "stream",
        "streamparse",
        "submit",
        "subscribe",
        "summary",
        "surface",
        "suspend",
        "swarm",
        "sync",
        "syncbridge",
        "tab",
        "theme",
        "thumb",
        "timelapse",
        "timeline",
        "timeout",
        "toast",
        "tool",
        "tour",
        "transform",
        "transparency",
        "trigger",
        "vault",
        "virtlist",
        "vision",
        "visit",
        "vote",
        "warm",
        "watch",
        "window",
        "worker",
        "workflow"
      ]
    },
    "at": {
      "type": "number",
      "description": "the epoch milliseconds of the entry"
    },
    "summary": {
      "type": "string",
      "description": "the plain language summary of the entry"
    },
    "sessionid": {
      "type": "string",
      "description": "the session the entry provenance names"
    },
    "planid": {
      "type": "string",
      "description": "the plan the entry provenance names"
    },
    "stepid": {
      "type": "string",
      "description": "the step the entry provenance names"
    }
  },
  "required": [
    "id",
    "kind",
    "at",
    "summary"
  ]
}
`;

/** The capability schema of the freeze (1.0.0, devthink/protocolv2/capability.schema.json) — freezes the capability report the proposal request carries and the surfaces render: the granted optional permissions with the capture, media, network, session, debug, profile, emulation, workflow and vision kind families the grants cover.. The exact text of the former capability.schema.json, byte for byte. */
export const capability = `{
  "$id": "devthink/protocolv2/capability.schema.json",
  "version": "1.0.0",
  "title": "the frozen capability report contract of the api freeze",
  "description": "freezes the capability report the proposal request carries and the surfaces render: the granted optional permissions with the capture, media, network, session, debug, profile, emulation, workflow and vision kind families the grants cover.",
  "type": "object",
  "properties": {
    "tabs": {
      "type": "boolean",
      "description": "the optional tabs permission grant"
    },
    "downloads": {
      "type": "boolean",
      "description": "the optional downloads permission grant"
    },
    "clipboardread": {
      "type": "boolean",
      "description": "the optional clipboard read permission grant"
    },
    "clipboardwrite": {
      "type": "boolean",
      "description": "the optional clipboard write permission grant"
    },
    "captures": {
      "type": "array",
      "description": "the capture kinds the active tab grant already covers",
      "items": {
        "type": "string"
      }
    },
    "media": {
      "type": "array",
      "description": "the media capture kinds the grants cover",
      "items": {
        "type": "string"
      }
    },
    "http": {
      "type": "array",
      "description": "the outbound request kinds the granted origins cover",
      "items": {
        "type": "string"
      }
    },
    "netwatch": {
      "type": "array",
      "description": "the network observation kinds the grants cover",
      "items": {
        "type": "string"
      }
    },
    "control": {
      "type": "array",
      "description": "the network control kinds the grants cover",
      "items": {
        "type": "string"
      }
    },
    "sessions": {
      "type": "array",
      "description": "the session memory kinds the grants cover",
      "items": {
        "type": "string"
      }
    },
    "debug": {
      "type": "array",
      "description": "the debugging kinds the grants cover",
      "items": {
        "type": "string"
      }
    },
    "profile": {
      "type": "array",
      "description": "the profiling kinds the grants cover",
      "items": {
        "type": "string"
      }
    },
    "emulation": {
      "type": "array",
      "description": "the emulation kinds the grants cover",
      "items": {
        "type": "string"
      }
    },
    "workflow": {
      "type": "array",
      "description": "the workflow kinds the plan review gates cover",
      "items": {
        "type": "string"
      }
    },
    "vision": {
      "type": "array",
      "description": "the vision kinds the grants cover",
      "items": {
        "type": "string"
      }
    },
    "reportedat": {
      "type": "number",
      "description": "the epoch milliseconds of the report"
    }
  },
  "required": [
    "tabs",
    "downloads",
    "clipboardread",
    "clipboardwrite",
    "reportedat"
  ]
}
`;

/** The envelope schema of the freeze (1.0.0, devthink/protocolv2/envelope.schema.json) — freezes the response envelope and its three outcomes — success, error and cancel — with the stable error code table, the json rpc frame grammar, the servercontract envelope of the site bridge and the stdio and http framing rules; every reply the protocol writes answers in exactly one of the three outcome classes and every error code documents its retry semantics.. The exact text of the former envelope.schema.json, byte for byte. */
export const envelope = `{
  "$id": "devthink/protocolv2/envelope.schema.json",
  "version": "1.0.0",
  "title": "the frozen response envelope contract of the api freeze",
  "description": "freezes the response envelope and its three outcomes — success, error and cancel — with the stable error code table, the json rpc frame grammar, the servercontract envelope of the site bridge and the stdio and http framing rules; every reply the protocol writes answers in exactly one of the three outcome classes and every error code documents its retry semantics.",
  "type": "object",
  "outcomes": {
    "description": "the frozen outcome classes of the response envelope",
    "values": [
      "success",
      "error",
      "cancel"
    ]
  },
  "responseenvelope": {
    "description": "the frozen versioned response envelope fields",
    "type": "object",
    "properties": {
      "version": {
        "type": "string",
        "description": "the frozen protocol version of the envelope"
      },
      "outcome": {
        "type": "object",
        "description": "the step outcome of a successful reply"
      },
      "error": {
        "type": "object",
        "description": "the error of a failed reply with the code of the stable table"
      },
      "cancelled": {
        "type": "boolean",
        "description": "the marker of a cancelled reply whose partial result rides the payload"
      }
    },
    "required": [
      "version"
    ]
  },
  "errorcodetable": {
    "description": "the stable error code table with the retry semantics of every code",
    "type": "array",
    "items": [
      {
        "code": "parse",
        "retry": "never",
        "type": "string",
        "description": "the wire frame does not parse as json; the same bytes never parse on a retry"
      },
      {
        "code": "method",
        "retry": "never",
        "type": "string",
        "description": "the server routes no method of the name the frame carries; the method table is frozen"
      },
      {
        "code": "params",
        "retry": "immediate",
        "type": "string",
        "description": "the frame parses but its params fail the frozen schema or the negotiation range; the client may retry immediately once its params carry the reviewed fields"
      },
      {
        "code": "internal",
        "retry": "afterbackoff",
        "type": "string",
        "description": "the handler failed inside the server; the client retries behind the reviewed backoff"
      },
      {
        "code": "consentrefused",
        "retry": "never",
        "type": "string",
        "description": "the consent gates refused the call; no retry passes without a new human decision"
      }
    ]
  },
  "jsonrpcframe": {
    "description": "the frozen json rpc frame grammar",
    "type": "object",
    "properties": {
      "jsonrpc": {
        "type": "string",
        "description": "the json rpc tag of the frozen wire",
        "const": "2.0"
      },
      "id": {
        "type": "number",
        "description": "the request id the reply quotes; a string id or null answers the failure classes"
      },
      "method": {
        "type": "string",
        "description": "the method name of the frozen routing table"
      },
      "params": {
        "type": "object",
        "description": "the method parameters"
      },
      "result": {
        "type": "object",
        "description": "the result of a successful reply"
      },
      "error": {
        "type": "object",
        "description": "the error of a failed reply with the code, message and optional data"
      }
    },
    "required": [
      "jsonrpc"
    ]
  },
  "serverenvelope": {
    "description": "the frozen servercontract envelope of the site bridge",
    "type": "object",
    "properties": {
      "version": {
        "type": "number",
        "description": "the negotiated servercontract version of the handshake"
      },
      "op": {
        "type": "string",
        "description": "the wire operation",
        "enum": [
          "sessioncreate",
          "sessionjoin",
          "eventpost",
          "eventstream"
        ]
      },
      "opid": {
        "type": "string",
        "description": "the stable operation id every reply quotes for correlation"
      },
      "sessionid": {
        "type": "string",
        "description": "the session the frame authenticates"
      },
      "token": {
        "type": "string",
        "description": "the session token that rides frames only"
      },
      "at": {
        "type": "number",
        "description": "the epoch milliseconds of the frame"
      },
      "body": {
        "type": "object",
        "description": "the operation payload"
      }
    },
    "required": [
      "version",
      "op",
      "opid",
      "at"
    ]
  },
  "framingrules": {
    "description": "the frozen stdio and http framing rules",
    "type": "object",
    "stdio": "one newline delimited json frame per block on stdin with one reply frame per line on stdout; the frame size bound stays the user configured limit with no code default",
    "http": "one json frame per http post body on the localhost listener with the reply in the response body under the same user configured frame size bound; no other verb carries frames"
  }
}
`;

/** The memory schema of the freeze (1.0.0, devthink/protocolv2/memory.schema.json) — freezes the memory record field names and the provenance grammar: every memory payload carries its key, its value and its full provenance of origin, runid, stepid and capturedat before the protocol accepts it, while the memoryclass, expiry and encrypted flag stay optional; a payload that carries the version field must carry the frozen protocol version.. The exact text of the former memory.schema.json, byte for byte. */
export const memory = `{
  "$id": "devthink/protocolv2/memory.schema.json",
  "version": "1.0.0",
  "title": "the frozen memory record contract of the api freeze",
  "description": "freezes the memory record field names and the provenance grammar: every memory payload carries its key, its value and its full provenance of origin, runid, stepid and capturedat before the protocol accepts it, while the memoryclass, expiry and encrypted flag stay optional; a payload that carries the version field must carry the frozen protocol version.",
  "type": "object",
  "properties": {
    "version": {
      "type": "string",
      "description": "the frozen protocol version of the versioned envelope; an absent version stays the version one tolerance of the deprecation window"
    },
    "key": {
      "type": "string",
      "description": "the storage key the record family persists under"
    },
    "value": {
      "type": "object",
      "description": "the record value of any json shape"
    },
    "provenance": {
      "type": "object",
      "description": "the full provenance block the protocol requires"
    },
    "memoryclass": {
      "type": "string",
      "description": "the data class of the record family"
    },
    "expiresat": {
      "type": "number",
      "description": "the epoch milliseconds the user expiry removes the record at"
    },
    "encrypted": {
      "type": "boolean",
      "description": "the flag that marks a value encrypted at rest"
    }
  },
  "required": [
    "key",
    "value",
    "provenance"
  ],
  "provenancefields": {
    "description": "the frozen provenance field names every memory payload must carry in full",
    "fields": [
      "origin",
      "runid",
      "stepid",
      "capturedat"
    ]
  }
}
`;

/** The observation schema of the freeze (1.0.0, devthink/protocolv2/observation.schema.json) — freezes the observation payload: the schemaversion field stays forward compatible — a consumer accepts every observation whose schemaversion sits at or above its own because additions land inside the reserved fields map, never as a removed or retyped named field; the reserved map carries the future additions the freeze admits without a breaking change.. The exact text of the former observation.schema.json, byte for byte. */
export const observation = `{
  "$id": "devthink/protocolv2/observation.schema.json",
  "version": "1.0.0",
  "title": "the frozen observation payload contract of the api freeze",
  "description": "freezes the observation payload: the schemaversion field stays forward compatible — a consumer accepts every observation whose schemaversion sits at or above its own because additions land inside the reserved fields map, never as a removed or retyped named field; the reserved map carries the future additions the freeze admits without a breaking change.",
  "type": "object",
  "properties": {
    "schemaversion": {
      "type": "number",
      "description": "the observation schema version kept forward compatible: additions raise it and never break a consumer of an older version because new fields ride the reserved map"
    },
    "url": {
      "type": "string",
      "description": "the observed page url"
    },
    "title": {
      "type": "string",
      "description": "the observed page title"
    },
    "textpreview": {
      "type": "string",
      "description": "the bounded text preview of the page"
    },
    "textlength": {
      "type": "number",
      "description": "the full text length the preview abbreviates"
    },
    "forms": {
      "type": "array",
      "description": "the detected forms with label, type, name and options",
      "items": {
        "type": "object"
      }
    },
    "interactive": {
      "type": "array",
      "description": "the interactive elements with selector, role and label",
      "items": {
        "type": "object"
      }
    },
    "capturedat": {
      "type": "number",
      "description": "the epoch milliseconds of the capture"
    },
    "environment": {
      "type": "string",
      "description": "the execution environment of the capture"
    },
    "mode": {
      "type": "string",
      "description": "the observation mode",
      "enum": [
        "passive",
        "watching",
        "diffing"
      ]
    },
    "a11y": {
      "type": "object",
      "description": "the accessibility tree section"
    },
    "reader": {
      "type": "object",
      "description": "the reader view article section"
    },
    "listpattern": {
      "type": "array",
      "description": "the repeated list patterns detected on the page",
      "items": {
        "type": "object"
      }
    },
    "tableshape": {
      "type": "array",
      "description": "the data table shapes detected on the page",
      "items": {
        "type": "object"
      }
    },
    "diff": {
      "type": "object",
      "description": "the snapshot diff section of two compared versions"
    },
    "delta": {
      "type": "boolean",
      "description": "the flag that marks an incrsnapshot delta payload"
    },
    "digest": {
      "type": "string",
      "description": "the content digest checkpoints compare against"
    },
    "vision": {
      "type": "object",
      "description": "the vision block with descriptions, ocr text and groundings"
    },
    "reserved": {
      "type": "object",
      "description": "the reserved fields map of future additions: reserved entries never refuse a payload and never rename a frozen field, so the observation schema keeps its version field forward compatible"
    }
  },
  "required": [
    "schemaversion",
    "url",
    "title",
    "textpreview",
    "textlength",
    "forms",
    "interactive",
    "capturedat"
  ],
  "forwardcompatible": "the schemaversion field: a payload of a higher schemaversion stays acceptable to a consumer of a lower one when the new material rides the reserved map"
}
`;

/** The plan schema of the freeze (1.0.0, devthink/protocolv2/plan.schema.json) — freezes the plan, the step and the option grammar shapes: the plan carries its objective, origin and reviewed steps while every step carries its id, its frozen action kind, its target, value and reviewed json options; the review surface documents the approve and reject decisions with the plan states and no hard cap on the step count, because the plan grammar bounds nothing the review did not bound.. The exact text of the former plan.schema.json, byte for byte. */
export const plan = `{
  "$id": "devthink/protocolv2/plan.schema.json",
  "version": "1.0.0",
  "title": "the frozen plan, step and option contract of the api freeze",
  "description": "freezes the plan, the step and the option grammar shapes: the plan carries its objective, origin and reviewed steps while every step carries its id, its frozen action kind, its target, value and reviewed json options; the review surface documents the approve and reject decisions with the plan states and no hard cap on the step count, because the plan grammar bounds nothing the review did not bound.",
  "type": "object",
  "plan": {
    "description": "the frozen agent plan fields",
    "type": "object",
    "properties": {
      "id": {
        "type": "string",
        "description": "the plan id"
      },
      "objective": {
        "type": "string",
        "description": "the plain language objective"
      },
      "origin": {
        "type": "string",
        "description": "the exact origin the plan runs inside"
      },
      "steps": {
        "type": "array",
        "description": "the reviewed steps in execution order with no hard cap on the count",
        "items": {
          "type": "object"
        }
      },
      "createdat": {
        "type": "number",
        "description": "the epoch milliseconds the plan was created"
      },
      "expiresat": {
        "type": "number",
        "description": "the epoch milliseconds the plan expires"
      },
      "state": {
        "type": "string",
        "description": "the plan state of the frozen review surface",
        "enum": [
          "draft",
          "pending",
          "approved",
          "rejected",
          "expired",
          "completed",
          "cancelled"
        ]
      },
      "approvedat": {
        "type": "number",
        "description": "the epoch milliseconds the human approved the plan"
      },
      "completedat": {
        "type": "number",
        "description": "the epoch milliseconds the plan completed"
      }
    },
    "required": [
      "id",
      "objective",
      "origin",
      "steps",
      "createdat",
      "expiresat",
      "state"
    ]
  },
  "step": {
    "description": "the frozen tool step fields",
    "type": "object",
    "properties": {
      "id": {
        "type": "string",
        "description": "the step id"
      },
      "kind": {
        "type": "string",
        "description": "the frozen action kind identifier of the immutable vocabulary"
      },
      "target": {
        "type": "string",
        "description": "the reviewed css selector the step addresses"
      },
      "value": {
        "type": "string",
        "description": "the reviewed literal value the step carries"
      },
      "options": {
        "type": "string",
        "description": "the reviewed json options of the option grammar"
      },
      "summary": {
        "type": "string",
        "description": "the human readable summary the review reads"
      },
      "risk": {
        "type": "string",
        "description": "the derived risk class",
        "enum": [
          "read",
          "interaction",
          "sensitive"
        ]
      },
      "idempotencykey": {
        "type": "string",
        "description": "the deterministic key replays deduplicate on"
      },
      "environment": {
        "type": "string",
        "description": "the execution environment the step names",
        "enum": [
          "pagecontext",
          "isolatedworld",
          "offscreenworker",
          "sandboxframe"
        ]
      },
      "agentid": {
        "type": "string",
        "description": "the fleet agent the step attributes to"
      },
      "intenthint": {
        "type": "string",
        "description": "the plain language navigation intent label"
      }
    },
    "required": [
      "id",
      "kind",
      "summary",
      "risk"
    ]
  },
  "options": {
    "description": "the frozen option grammar field families of the reviewed step options",
    "type": "object",
    "properties": {
      "targetref": {
        "type": "object",
        "description": "the reviewed element reference the page bridge resolves"
      },
      "modifiers": {
        "type": "array",
        "description": "the reviewed key modifiers of key steps",
        "items": {
          "type": "string"
        }
      },
      "pipeline": {
        "type": "string",
        "description": "the extractpipeline reference of the extract steps"
      },
      "pollrequest": {
        "type": "object",
        "description": "the longpoll request grammar of a transport step"
      },
      "graphql": {
        "type": "object",
        "description": "the graphql subscription grammar of a channel step"
      },
      "correlation": {
        "type": "object",
        "description": "the per run request correlation map"
      },
      "ocr": {
        "type": "boolean",
        "description": "the flag that runs recognition on the stored capture bytes"
      },
      "vision": {
        "type": "object",
        "description": "the reviewed vision prompt block of a capture step"
      },
      "ocrregion": {
        "type": "object",
        "description": "the region grammar of a regionocr reading"
      },
      "naming": {
        "type": "string",
        "description": "the lowercase capture filename pattern"
      },
      "pair": {
        "type": "string",
        "description": "the beforeafter capture mode around a step"
      },
      "diff": {
        "type": "boolean",
        "description": "the flag that runs the diffshot comparison after a sensitive step"
      },
      "snapshot": {
        "type": "object",
        "description": "the session snapshot plan of a capturesession step"
      }
    }
  },
  "reviewsurface": {
    "description": "the frozen review surface of the plan: the human approves or rejects a pending plan, the approve and reject runtime messages travel the background surface, and the review carries no hard cap on the step count, the expiry window or the option grammar depth because every bound the review honors stays a user choice",
    "type": "object",
    "messages": [
      "approve",
      "reject",
      "preview",
      "execute"
    ]
  }
}
`;

/** The progress schema of the freeze (1.0.0, devthink/protocolv2/progress.schema.json) — freezes the progress event names and the progress record shape: the plan progress carries its completed steps, its outcomes, its task tabs and its per step environment, turnaround, gate wait, perf and delta records while the step outcome carries its ok flag, summary, details and environment; the event names of the record families join the frozen contract.. The exact text of the former progress.schema.json, byte for byte. */
export const progress = `{
  "$id": "devthink/protocolv2/progress.schema.json",
  "version": "1.0.0",
  "title": "the frozen progress event contract of the api freeze",
  "description": "freezes the progress event names and the progress record shape: the plan progress carries its completed steps, its outcomes, its task tabs and its per step environment, turnaround, gate wait, perf and delta records while the step outcome carries its ok flag, summary, details and environment; the event names of the record families join the frozen contract.",
  "type": "object",
  "eventnames": {
    "description": "the frozen progress event name families of the progress record",
    "values": [
      "recordstep",
      "recordoutcome",
      "recordenvironment",
      "recordturnaround",
      "recordgatewait",
      "recordperf",
      "recorddeltas"
    ]
  },
  "planprogress": {
    "description": "the frozen plan progress fields",
    "type": "object",
    "properties": {
      "planid": {
        "type": "string",
        "description": "the plan the progress tracks"
      },
      "runid": {
        "type": "string",
        "description": "the run record the progress links to"
      },
      "completedsteps": {
        "type": "array",
        "description": "the executed step ids in order",
        "items": {
          "type": "string"
        }
      },
      "outcomes": {
        "type": "array",
        "description": "the step outcomes of the completed steps",
        "items": {
          "type": "object"
        }
      },
      "tasktabs": {
        "type": "array",
        "description": "the tabs assigned to the running task",
        "items": {
          "type": "number"
        }
      },
      "environments": {
        "type": "object",
        "description": "the execution environment of every completed step by step id"
      },
      "turnarounds": {
        "type": "object",
        "description": "the worker turnaround of every offloaded step by step id"
      },
      "gatewaits": {
        "type": "object",
        "description": "the gate wait evidence of every gated step by step id"
      },
      "perf": {
        "type": "object",
        "description": "the perf record of every executed step by step id"
      },
      "deltas": {
        "type": "object",
        "description": "the snapshot change set of every executed step by step id"
      },
      "prior": {
        "type": "array",
        "description": "the prior progress snapshots preserved across plan replacements",
        "items": {
          "type": "object"
        }
      },
      "updatedat": {
        "type": "number",
        "description": "the epoch milliseconds of the last update"
      }
    },
    "required": [
      "planid",
      "completedsteps",
      "updatedat"
    ]
  },
  "stepoutcome": {
    "description": "the frozen step outcome fields",
    "type": "object",
    "properties": {
      "stepid": {
        "type": "string",
        "description": "the step the outcome reports"
      },
      "ok": {
        "type": "boolean",
        "description": "the success flag of the outcome"
      },
      "summary": {
        "type": "string",
        "description": "the plain language summary of the outcome"
      },
      "details": {
        "type": "object",
        "description": "the structured payload of the outcome"
      },
      "environment": {
        "type": "string",
        "description": "the execution environment the step ran in"
      },
      "at": {
        "type": "number",
        "description": "the epoch milliseconds of the outcome"
      }
    },
    "required": [
      "stepid",
      "ok",
      "summary",
      "at"
    ]
  }
}
`;

/** The proposal schema of the freeze (1.0.0, devthink/protocolv2/proposal.schema.json) — freezes the proposal request the endpoint receives and the plan proposal the protocol parses: the request carries the objective, the session record, the observation and the capability report while the response carries the versioned envelope, the plan and the optional resume, lock and agent markers; the response refuses every version outside the frozen protocol version.. The exact text of the former proposal.schema.json, byte for byte. */
export const proposal = `{
  "$id": "devthink/protocolv2/proposal.schema.json",
  "version": "1.0.0",
  "title": "the frozen proposal request and response contract of the api freeze",
  "description": "freezes the proposal request the endpoint receives and the plan proposal the protocol parses: the request carries the objective, the session record, the observation and the capability report while the response carries the versioned envelope, the plan and the optional resume, lock and agent markers; the response refuses every version outside the frozen protocol version.",
  "type": "object",
  "proposalrequest": {
    "description": "the frozen proposal request fields",
    "type": "object",
    "properties": {
      "objective": {
        "type": "string",
        "description": "the plain language objective the user reviews"
      },
      "session": {
        "type": "object",
        "description": "the session record of the requesting session as the session schema freezes it"
      },
      "observation": {
        "type": "object",
        "description": "the observation payload as the observation schema freezes it"
      },
      "capabilities": {
        "type": "object",
        "description": "the capability report as the capability schema freezes it"
      }
    },
    "required": [
      "objective",
      "session",
      "observation",
      "capabilities"
    ]
  },
  "proposalresponse": {
    "description": "the frozen plan proposal fields of the versioned envelope",
    "type": "object",
    "properties": {
      "version": {
        "type": "string",
        "description": "the frozen protocol version of the versioned envelope"
      },
      "plan": {
        "type": "object",
        "description": "the agent plan as the plan schema freezes it"
      },
      "resumedfrom": {
        "type": "array",
        "description": "the checkpointed step ids a resumed proposal marks",
        "items": {
          "type": "string"
        }
      },
      "lockid": {
        "type": "string",
        "description": "the sessionlock the replay preserves"
      },
      "agentid": {
        "type": "string",
        "description": "the fleet agent that requested the plan"
      }
    },
    "required": [
      "version",
      "plan"
    ]
  }
}
`;

/** The session schema of the freeze (1.0.0, devthink/protocolv2/session.schema.json) — freezes the session lifecycle messages and the session record shape of protocolv2: the startsession, pausesession and resumesession runtime messages travel the background surface while the session record rides every versioned envelope the proposal request carries; the lifecycle stays consent first because a paused or expired session refuses every action and preview.. The exact text of the former session.schema.json, byte for byte. */
export const session = `{
  "$id": "devthink/protocolv2/session.schema.json",
  "version": "1.0.0",
  "title": "the frozen session lifecycle contract of the api freeze",
  "description": "freezes the session lifecycle messages and the session record shape of protocolv2: the startsession, pausesession and resumesession runtime messages travel the background surface while the session record rides every versioned envelope the proposal request carries; the lifecycle stays consent first because a paused or expired session refuses every action and preview.",
  "type": "object",
  "lifecycle": {
    "description": "the frozen session lifecycle message names of the background surface",
    "messages": [
      "startsession",
      "pausesession",
      "resumesession"
    ]
  },
  "sessionrecord": {
    "description": "the frozen session record fields",
    "type": "object",
    "properties": {
      "id": {
        "type": "string",
        "description": "the session id"
      },
      "tabid": {
        "type": "number",
        "description": "the tab the session binds"
      },
      "origin": {
        "type": "string",
        "description": "the exact origin the session runs inside"
      },
      "startedat": {
        "type": "number",
        "description": "the epoch milliseconds the session started"
      },
      "expiresat": {
        "type": "number",
        "description": "the epoch milliseconds the session expires; an expired session refuses every action"
      },
      "stoppedat": {
        "type": "number",
        "description": "the epoch milliseconds the user stopped the session"
      },
      "pausedat": {
        "type": "number",
        "description": "the epoch milliseconds the user paused the session; a paused session refuses every action and preview"
      },
      "grants": {
        "type": "array",
        "description": "the additional exact origins granted to the session",
        "items": {
          "type": "string"
        }
      },
      "environmentgrants": {
        "type": "array",
        "description": "the execution environments granted beside the origin grants",
        "items": {
          "type": "string"
        }
      },
      "lockid": {
        "type": "string",
        "description": "the sessionlock the running run acquired"
      },
      "agentid": {
        "type": "string",
        "description": "the fleet agent bound to the session"
      },
      "jarid": {
        "type": "string",
        "description": "the cookie jar the session cookie state stays scoped to"
      }
    },
    "required": [
      "id",
      "tabid",
      "origin",
      "startedat",
      "expiresat"
    ]
  }
}
`;

/** The tool schema of the freeze (1.0.0, devthink/protocolv2/tool.schema.json) — freezes the tool catalog entry shape with the per tool versions the freeze pins: every tooldef carries its namespaced name, its version for compatibility checks, its plain language description with the openapi style field layout, its json schema inputs, its frozen action kind, its risk grade and the consent metadata of the tools with side effects; the four namespaces stay browser, workflow, memory and system while the catalog kinds join the frozen contract.. The exact text of the former tool.schema.json, byte for byte. */
export const tool = `{
  "$id": "devthink/protocolv2/tool.schema.json",
  "version": "1.0.0",
  "title": "the frozen tool catalog entry contract of the api freeze",
  "description": "freezes the tool catalog entry shape with the per tool versions the freeze pins: every tooldef carries its namespaced name, its version for compatibility checks, its plain language description with the openapi style field layout, its json schema inputs, its frozen action kind, its risk grade and the consent metadata of the tools with side effects; the four namespaces stay browser, workflow, memory and system while the catalog kinds join the frozen contract.",
  "type": "object",
  "namespaces": {
    "description": "the frozen tool namespaces",
    "values": [
      "browser",
      "workflow",
      "memory",
      "system"
    ]
  },
  "tooldef": {
    "description": "the frozen tool catalog entry fields",
    "type": "object",
    "properties": {
      "name": {
        "type": "string",
        "description": "the namespaced tool name"
      },
      "version": {
        "type": "number",
        "description": "the per tool version frozen from this release on; every entry carries its own version for compatibility checks"
      },
      "description": {
        "type": "string",
        "description": "the plain language description that states the consent class and side effects with the openapi style field layout"
      },
      "inputschema": {
        "type": "object",
        "description": "the json schema of the tool inputs with typed properties, required markers and reviewed defaults"
      },
      "kind": {
        "type": "string",
        "description": "the frozen action kind the tool wraps",
        "enum": [
          "a11ytree",
          "back",
          "click",
          "composeworkflow",
          "dryrun",
          "eventrule",
          "extract",
          "extractvars",
          "forward",
          "listruns",
          "navigate",
          "observe",
          "presskey",
          "readlinks",
          "readmeta",
          "readtable",
          "readtext",
          "reload",
          "runworkflow",
          "tabactivate",
          "tabclose",
          "tabcreate",
          "tablist",
          "trailaudit",
          "type",
          "windowclose",
          "windowcreate",
          "windowlist",
          "windowresize"
        ]
      },
      "risk": {
        "type": "string",
        "description": "the risk grade of the wrapped kind",
        "enum": [
          "read",
          "interaction",
          "sensitive"
        ]
      },
      "consentmeta": {
        "type": "object",
        "description": "the consent metadata of a tool with side effects: the review requirement, the risk class, the approval gate requirement and the session origin scope"
      }
    },
    "required": [
      "name",
      "version",
      "description",
      "inputschema",
      "kind",
      "risk"
    ]
  }
}
`;

/** Every frozen schema keyed by its stem, so the build and the stability walks iterate the ten without touching the file system; each key names its <name>.schema.json dist copy. */
export const frozenschemas = {
  audit,
  capability,
  envelope,
  memory,
  observation,
  plan,
  progress,
  proposal,
  session,
  tool,
} as const;
