# Cost certification

The costcert gate of `tests/costcert.mjs` proves the shared accounting of the multi agent layer reconciles: every check replays one recorded run or one live accounting family and recomputes the cost lines from the recorded evidence. The gate records every executed check with its outcome in `tests/artifacts/costcert.json` in a fixed order with no timestamps so reruns stay byte identical, and exits nonzero on any accounting mismatch. The coordination scenarios whose costs the accounting covers live in `docs/agentscenarios.md`.

## The accounting verification method

The method is replay and recompute: a recorded run persists through the real `sessionmemory` of the compiled memory module behind an in memory adapter seam, the recorded usage lines replay from the store, and every cost line recomputes from its own fields — the token accounting recomputes `totaltokens = prompttokens + completiontokens` per line and re sums the run totals through `usagetotals`; the per agent accounting recomputes through `recordagentusage` and matches the step logs filtered by run; the shared accounting folds the agent totals through `swarmcosts` and splits the shared ledger through `sharedcostsplit` so every ledger unit attributes exactly once; and the exported report reparses from its serialized payload with the same numbers. No check trusts a stored total it can recompute.

## The automated checklist

| Check | Family | Module | Verification |
| --- | --- | --- | --- |
| 1 | replay | llm.js and memory.js | The recorded run replays and every cost line recomputes: the three cost lines of the recorded run replay from the memory store, every line recomputes (prompt plus completion equals total, the per step filter matching the stored line) and the run totals of 430 tokens, 0.043 cost and 3 calls reconcile with the per line recompute. |
| 2 | token accounting | agent.js and llm.js | The token accounting per agent matches the step logs: the per agent accounting of w1 (280 tokens, 0.028 cost, 2 steps) and w2 (90 tokens, 0.009 cost, 1 step) matches their step logs filtered by run exactly, with every call counted once. |
| 3 | shared accounting | agent.js | The shared cost accounting sums the agent totals: swarmcosts summed the two agent totals into 150 tokens, 0.75 usd cost and 5 steps with the empty swarm answering zero, and the shared cost ledger split its entries with w1 carrying 6 units (3 solo and 3 shared with w2) and every ledger unit attributed once. |
| 4 | budgets | run.js and llm.js | The budget alerts fire at the configured thresholds: the alerts stayed quiet below the thresholds, fired the informational warning at 60 percent of the step budget, fired the pausing critical alert at the ceiling with the pause answering only the critical level, and the cost budget check halted at the token ceiling to ask the user while the in budget and the unbounded runs kept running. |
| 5 | refunds | agent.js | The refunds on cancelled steps match the provider rules: the provider rule bills only the chunks that left the wire, so a cancelled call preserves its partial result with its streamed chunks billed and its never streamed completion tokens refunded — the recomputed line totals the prompt tokens plus the streamed completion. |
| 6 | routing | llm.js | The model routing costs land on the right agent: the draftplan kind of w1 routed onto the planner gateway with its model and the extract kind of w2 onto the extraction gateway, every cost line carrying its routed provider and model with the unrouted kind reporting why nothing routed. |
| 7 | export | llm.js and agent.js | The exported cost report reconciles to the total: the report carries both agent rows and its totals row, the totals reconcile three ways (the swarm accounting, the run usage totals and the sum of the exported rows) and the serialized payload reparses with the same numbers. |
| 8 | audit trail | memory.js | No cost event is missing from the audit trail: every usage line carries its model audit entry naming its token counts, the ledger entry carries its budget audit entry, and the trail recompute answers the same token total over the recorded events. |
| 9 | report | costcert.mjs | The reconciliation report records every check and the exit answers the mismatches: the report carries the executed checks with their outcomes and details, the summary computes the pass count, and the gate sets its nonzero exit the moment any accounting mismatch lands in the artifact. |

## The refund rule

The provider rule the refunds follow: a cancelled call bills only the chunks that left the wire. The recorded completion tokens of a cancelled step split into the streamed chunks (billed, reassembled through the chunk content family) and the never streamed remainder (refunded, never billed), so the recomputed cost line of a cancelled step carries the prompt tokens plus exactly the streamed completion. The cancelled call keeps its partial result — the cancellation never destroys the delivered content — and a second cancellation of the same call never rewrites the recorded state.

## The reconciliation invariants

Every run of the gate answers the invariants the artifact test of `tests/costcert.test.ts` rechecks: the summary total equals the recorded check count, the passed count equals the passing outcomes, the failed count equals the failing outcomes, the totals sum back to the whole, and the artifact carries no failing check. The cost per agent panel of the multi agent dashboard folds the same per agent usage the checks reconcile, so the panel and the certification read one set of numbers.

## Rerunning the certification

Run one command from the repository root after a build:

```bash
pnpm build && node tests/costcert.mjs
```text

The gate prints one line per check with its outcome, prints the summary json, writes `tests/artifacts/costcert.json` with every executed check, its family, its module and its detail, and exits nonzero on any accounting mismatch. The gate runs beside the coordination gate through `pnpm validate:agents` inside `pnpm validate` and inside the verify workflow, and the artifact test runs the gate itself when a built tree carries no fresh artifact of the current release, so every lane that builds before the vitest suite verifies the reconciliation without depending on gate ordering.
