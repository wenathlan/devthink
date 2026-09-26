# Scheduling and budgets

Version: **1.1.69**. This document records the scheduling and budget model of the 1.1.69 performance part two family: how batch runs pace themselves against the sites they address, how a run stays inside the resources the user chose, and where the time goes. Every limit, delay, window and budget in this document is a **user choice** — the engine ships no default cap, an absent value keeps the behavior unbounded, and no scheduling path ever bypasses a review or refuses work the user asked for.

## The no limits rule

The platform holds the no limits philosophy from 1.1.32 through the scheduling work. A budget reports, a threshold alerts, a bound aborts a single step at the user chosen line, and a critical alert pauses the run pending a user choice — none of them drops a queued step, cancels a run behind the user's back or hides work from the review. The consent gates stay exactly as they are: the batch scheduler, the budget tracker and the meters optimize the pacing of reviewed steps and never widen what the human approved.

## Pacing against sites

- **Batch backpressure** — the batch run queue counts the steps it holds ahead of its completed outcomes. When the backlog crosses the user configured `batchwindow`, enqueueing pauses; every queued step stays queued and resumes the moment the outcomes catch up. An absent window never pauses the queue.
- **Domain limits** — the user sets concurrency slots per domain (`domainlimits`, such as `example.com=2`). Each domain runs at most its slots concurrently while its overflow steps queue per domain lane; a domain without an entry stays unbounded. The lanes surface in the sidepanel during batch runs.
- **Politedelay** — batch requests space themselves per domain through the user configured base delay (`politedelay`) with a jitter window (`politejitter`) folded over it through a roll, never below the per domain floor the siteprofiles carry. The spacing optimizes and never refuses a request.
- **Adaptivepoll** — a poll interval widens by the user growth factor (`pollgrowth`) while observations stay unchanged and narrows the moment changes resume, always inside the user floor and ceiling.
- **Requestcoalesce** — identical pending queries merge into one dispatch keyed by the shared key; the single result fans out to every waiter that merged into it.
- **Cadence under pressure** — the snapshot cadence widens by the user widening factor (`cadencewidening`) while memory pressure stays high and restores to the base interval the moment the pressure clears.

## Budgets, bounds and suspension

- **Runbudget** — every run tracks its step usage against the user `stepbudget` and its memory pressure ratio (the worker queue telemetry of the 1.1.68 family) against the user `memorybudget`. Both stay informational when unset.
- **Budgetalerts** — the warning threshold reports; the critical threshold pauses the run pending a user choice through the session pause. The dashboardpage renders every alert with its severity level and its ratio.
- **Timeoutcancel** — a step that runs past the user `timeoutbound` aborts with its cancel event recorded in the immutable log beside the step outcome; the sidepanel shows the events with their retry hints and the retry stays a reviewed dispatch. An absent bound never aborts a step.
- **Tabsuspend** — an idle tab may suspend only during a wait longer than the user `suspendwindow`; the run state stays preserved across the suspend and the restore, a discarded tab reloads its restore url before the step that needs it, and an absent window never suspends a tab.

## Caching, warming and reuse

- **Runcache** — fetched resources store per run keyed by their digest, repeat fetches of the same run serve from the entry, and the cache clears at the run end unless the user pins the profile cache (`runcachepin`).
- **Stepprefetch** — the likely next pages and the likely next selectors derive from the plan structure alone; the gate refuses any hint outside the reviewed plan, so the warming never reaches an unreviewed page.
- **Warmselectors** — validated selectors carry between adjacent steps under the page fingerprint; only a fingerprint change revalidates.
- **Sessionreuse** — an authenticated profile attaches to a run only through its explicit per profile consent prompt, and the cookies isolate per task through separate containers.
- **Efficientresume** — every step boundary checkpoints its cursor and its page digest; after a restart the completed steps skip, the page fingerprint revalidates before the resume continues, and a changed fingerprint refuses so a run never continues against a different page.
- **Navdedupe** — a planned navigation to the already active url skips, and repeated planned visits fold into one navigation per url.

## Where the time goes

- **Durationmeter** — every step measures with monotonic clocks and writes its sample into the perf records of the 1.1.68 family.
- **Selectorprofile** — every selector counts its resolution time and its failure rate; the selectors above the user `selectorlatency` threshold flag in the dashboardpage chart.
- **Steptrace** — spans nest per step and per worker task through their parent refs and export as one trace file for the timeline view.
- **Startupmeter and coldstart** — the cold start measures from the module load to the ready point with the lazymods budget spent at ready, reported against the user `startuptarget` while the heavy modules stay out of the first paint path.

## Resource awareness

- **Artifactcompress** — stored captures and logs compress at rest through the user `artifactcodec` (deflate or store) and decompress lazily on read.
- **Logprune** — the prune removes whole sealed runs past the user `logpruneretention` age window and `logsizewindow` size window only; unsealed runs never prune so the chain stays verifiable, and the chain verification summaries always survive.
- **Batteryaware** — non urgent scheduled runs defer while the battery stays under the user `batteryfloor` and never charges; the deferrals surface in the attentionfeed and never cancel a run.
- **Networkaware** — retry backoffs adapt to the failure kind through the user `netbackoff` windows while a present server signal overrides the window.
- **Readparallel** — independent page reads group into parallel lanes under the user `readlanes` ceiling and join before the dependent steps.
- **Slowmo** — a recorded run replays at the user chosen `slowmofactor` with pauses between steps for inspection, each pause linked to its steptrace span, riding the runreplay service of the 1.1.66 family.

## Settings index

| Setting | Meaning | Absent value |
| --- | --- | --- |
| `batchwindow` | steps a batch queue may run ahead of its outcomes before enqueueing pauses | never pauses |
| `domainlimits` | per domain concurrency slots | unbounded per domain |
| `politedelay` / `politejitter` | base spacing and jitter window per domain | unspaced requests |
| `pollgrowth` | adaptivepoll growth factor | fixed interval |
| `stepbudget` / `memorybudget` | run budget fields | informational tracker |
| `budgetthresholds` | warning and critical alert ratios | informational alerts |
| `timeoutbound` | per step abort bound in milliseconds | never aborts |
| `suspendwindow` | wait length past which an idle tab may suspend | never suspends |
| `startuptarget` | cold start target in milliseconds | informational meter |
| `selectorlatency` | selector latency flag threshold | flags nothing |
| `slowmofactor` | default replay speed factor | recorded speed |
| `runcachepin` | pin the profile run cache past the run end | clears at run end |
| `logpruneretention` / `logsizewindow` | logprune age and size windows | keeps everything |
| `artifactcodec` | store or deflate at rest | plain bytes |
| `batteryfloor` | battery level under which deferrals start | never defers |
| `netbackoff` | per failure kind backoff windows | existing retry path |
| `readlanes` | parallel read lane ceiling | every lane open |
| `cadencewidening` | snapshot cadence widening under pressure | fixed cadence |
