# LLM integration guide

Devthink 1.1.57 lets any large language model drive the extension. The user connects a gateway, a base url, an api key and any model; nothing is hardcoded. No provider allowlist exists, no built-in provider name ships, no endpoint or model default applies — the four protocol styles below are wire shapes the user picks for interoperability, not providers, and any endpoint speaking one of them works.

## Provider configuration and routing

A provider config carries a user typed endpoint url, a protocol shape, a free text model list, optional extra headers for gateways that need them, an optional pricing pair for the cost accounting and an optional api key reference. The key material lives in the browser credential store behind a storage id; the config, the memory files and the audit trails carry the reference only.

| Protocol shape | Request shape | Key placement |
| --- | --- | --- |
| `chatcompletions` | POST `{ model, messages, temperature?, max_tokens? }` | `Authorization: Bearer <key>` |
| `responses` | POST `{ model, input, instructions?, max_output_tokens? }` | `Authorization: Bearer <key>` |
| `messages` | POST `{ model, messages, system?, max_tokens? }` | `x-api-key: <key>` |
| `gemini` | POST `{ contents, systemInstruction?, generationConfig? }` | `?key=<key>` url parameter |

The local model endpoint is a first class citizen: a `localmodelconfig` names a loopback endpoint (localhost, 127.0.0.1, ::1 or a .localhost host), the model and its shape; every call to it stays on the machine and policy grades local endpoints as the preferred surface for sensitive extractions. The health check button sends one ready prompt and stores the result.

Model routing maps task kinds to provider and model pairs. The internal task kinds are `parsecommand`, `classifyintent`, `draftplan`, `replan`, `reflect` and `summarize`; the user may route any further task kind. Every route may carry a fallback pair — when the primary provider fails a call it marks itself unavailable and the fallback takes over; when both fail the run asks the user, because no default route ever applies. Route edits bump a revision that persists into the routing history.

Every provider call is graded as a data egress event: the audit entry names the endpoint, the model and the token counts, and page content never joins a call the user has not granted. The cost budget holds optional token and currency ceilings per run; a reached ceiling halts the run and asks the user before anything else runs, and an absent ceiling stays the documented unbounded choice.

## Command parsing and intents

The command box at the top of the side panel accepts natural language. The routed model parses it into a `commandparse` result: the intent, the extracted entities and the confidence. The six intent kinds are `navigate`, `extract`, `fill`, `monitor`, `automate` and `ask`. The deterministic classifier (`classifyintent`) maps a request to an intent kind with a confidence score from keyword density alone — it runs when no route and no local endpoint serve the `parsecommand` task kind, so the panel answers even before any provider is configured. The intent badge beside the command box shows the classification.

## Plan drafting, review and replanning

The user states a goal; the routed model drafts a plan as a `plandraft` with steps, open questions and model provenance. The plan lint checks every drafted step against the same action grammar the reviewed plans use before the review — a drafted step with an unsupported kind or a missing target lands a finding the review sees, and approving a draft with findings is refused.

The model proposes; the consent gates dispose. The draft review card shows every drafted step with editable kind, target, value and summary inputs, the open questions and the grammar findings. Approving a draft converts its steps into a **pending** plan that still passes the same human plan review every local plan passes — nothing a model drafts ever reaches the page bridge before both the draft review and the plan review approve it.

When a run fails, the replan keeps the completed steps, drops the failed ones and asks the model for a revised tail. Every revised tail step carries the fresh review marker; the replan review highlights the changed tail and its approval builds a new pending plan with the kept steps plus the reviewed tail, again behind the plan review.

## Reflection and budgets

After an executed step the routed model reflects: a `reflectnote` records the step outcome, the lesson learned and the advice for the next step. The running lessons of the earlier steps feed the next prompt (`reflectionsummary`), so the model writes the tail of the run with what the run learned. The notes render under each completed step in the models tab.

The budget meter shows the accumulated prompt, completion and total tokens plus the recorded cost of every model call against the configured ceiling. A reached token or currency ceiling halts the run with a message that asks the user; the user raises the ceiling or lets the run stop. Usage records persist with their run and step ids, and `getusage` answers token and cost totals per run, per step and per period.

## Prompt template library and guardrails

The prompt library holds user templates only — no built-in template ships. A template names its body with `{{variable}}` placeholders; the library extracts the variables, renders with the supplied values and refuses the render when a declared variable stays empty. Sensitive flows require a consent notice and the notice rides the rendered text. Every save bumps a version with its change notes and every earlier version stays stored, so the history never rewrites.

The parse guardrails keep model output honest: `stripguardrails` opens code fences and cuts the chatter around the json object, `parseoutput` validates the stripped text against the expected schema (required fields, declared types), `guardoutput` retries malformed answers up to the configured count and refuses after exhaustion — an invalid or refused model output never executes, and the guard refusal notices in the panel explain the parse failure and the attempts it took. The refusal markers default to a small reviewed list and the user configures their own.

## Where the model meets the protocol

The agent protocol (see `docs/agentprotocol.md`) exposes the tool catalog to any paired client; the llm integration renders the same catalog as openapi style tool briefs for model consumption, and the `modelproposal` envelope carries a drafted plan to the human review while the `modeloutcome` envelope reports the usage totals with every guard verdict. The tool briefs end with the consent line every model reads: tools with side effects execute only the approved plan step they name.

The honest limitation: the extension runs in the browser, so provider calls ride the ambient fetch of the extension context and every remote endpoint must be reachable from it. The local endpoint keeps sensitive work on the machine.
