# Memory model of the session interface (1.1.63)

This document describes the five session stores the 1.1.63 session interface introduces, their scopes, their gates and their retention. The consent gates do not move: every store reads and writes behind the same session, plan and origin review the rest of the extension rides, and no interface surface ever bypasses the human review.

## The five session stores

| Store | Scope | Records | Gates |
| --- | --- | --- | --- |
| sitenotes | one origin per record, scoped per profile workspace | title, plain or sealed body, author provenance, timestamps, sensitive flag | reads stay inside the session granted origins (`sitenotesreadgate`), writes need the explicit consent of the user action (`sitenoteswritegate`) |
| scratchpad | one task session (the plan id and the session id together) | append only entries with text, optional step provenance, author and timestamp | `scratchpadscopegate` binds every read and append to its owning task session |
| runsummaries | one run per record, listed per origin | origins visited, kinds executed, per step outcomes inside the user window, distillation provenance | the distillation runs as an offscreen worker task under the granted offscreen capability with the inline fallback |
| correctionmemory | one origin and one action kind per record | the step edit (original and corrected shapes) or the rejection with its reason, captured from plan review | reads open during planning and prompting alone (`memoryreadscopegate`) |
| consentmemory | one origin per record | every grant, denial, expiry and revocation with its boundary, kinds and optional expiry | `consentmemoryadvisorygate` keeps every record advisory: no entry auto grants and a denial weighs the same as a grant |

Beside the five stores the interface keeps two derived indexes and three service stores: the semanticrecall index (fingerprint deduplicated extraction records ranked by text similarity inside the run scope with run and step provenance, `semanticrecallscopegate` refuses a query across origins outside the run scope), the incremental historysearch corpus (session metadata, note titles and summaries written on each store change and served with matched term highlighting), the errorsurface payloads of failed steps (cause classes of page, network, policy and gate with retry hints that pass only through new reviewed dispatches), the per tab session references that isolate parallel tabs so they never collide, and the audit bundle export that ships notes, summaries and corrections together with sensitive bodies staying sealed.

## Retention and windows

No window, retention or limit is ever hardcoded. The user configures the retention of each store (`noteretention`, `scratchpadretention`, `summaryretention`, `correctionretention` in milliseconds; an absent window keeps every record forever), the semanticrecall index window (`recallwindow`; entries older than the window leave the live index while the extraction records stay for the audit trail), the runsummary length window (`summarywindow` steps; an absent window keeps every step with no fixed cap), the historysearch index toggle (`historyindex`) and the cancelrun rollback preference (`cancelrollback`: queued or none). The `sessionretentionvalid` and `summarywindowvalid` gates keep every value a positive user choice and refuse any engine boundary.

## At rest sealing of sensitive note bodies

A sensitive site note never persists its plain body: the writer derives one keystream byte per position from a hash of the note id and the position, the sealed body carries the xor of the plain body behind a `sealed:` marker, and the reading surface recomputes the stream to display the text. The measure stays local at rest protection — it never replaces the user keychain, and the export path keeps the sealed form.

## Provenance

Every record carries its provenance: notes name their author and their timestamps, scratchpad entries name the step they were written beside, run summaries name their distillation provenance (the offscreen worker pool or the inline fallback) and their window, recall matches carry the run id and the step id of the indexed extraction, corrections link the step to its correction with the reason in plain language, and consent memory entries name the boundary the decision carried. The `sessionbundleof` export bundles notes, summaries and corrections as one audit artifact with the sealed bodies intact.

## The recall seam

The local fingerprint index answers every semanticrecall query today. The memory adapter documents the seam a future remote recall backend can take: the query and answer shapes (`recallquery` and `recallmatch`) stay stable, so a reviewed remote backend can serve the calls later without touching the callers.

## The cancelrun rollback

The cancelrun action carries a rollback option descriptor. The queued scope rolls the queued steps — the plan steps that never executed — back only, while the executed steps stay untouched in the sealed immutable log; the none scope stops the run without a rollback. The run log records the cancel event and the audit names the scope the user chose.

## Storage keys

| Key family | Shape |
| --- | --- |
| `sitenotes` | the site note records per profile workspace |
| `scratchpad` | the append only scratchpad entries, newest first |
| `runsummary:<runid>` and `runsummaryindex` | one distilled summary per run and its index |
| `recallindex` | the fingerprint deduplicated recall entries |
| `corrections` | the correction memory entries per origin and kind |
| `consentmemory` | the consent memory entries per origin |
| `errorsurfaces` | the error surface payloads of failed steps |
| `historyindex` | the incremental history search corpus |
| `tabsession:<tabid>` and `tabsessionindex` | the per tab session references and their index |
