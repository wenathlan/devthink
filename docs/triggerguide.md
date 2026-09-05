# Trigger guide

The workflow engine of 1.1.50 composed reviewed steps, 1.1.51 gave it control flow, and 1.1.52 lets reviewed workflows start themselves. Page visits, url patterns, the context menu, keyboard shortcuts, the toolbar button, cron schedules, intervals, url lists, webhooks and observed page events become trigger rules that launch reviewed workflows. This document records every trigger kind, the cron and interval grammar, the webhook setup with secret rotation, the manual run step preview, the keyboard and context menu bindings, and the cooldown, dedupe and queue discipline. The engine lives in the root `trigger.ts` module; the launch of a run flows through the injected launch seam so the engine stays pure and testable on plain fixtures, and no trigger fires outside the consent gates that 1.1.32 established: a live session, an approved plan, origin matching and the explicit arm review of every rule.

## Every trigger kind

Ten kinds arm trigger rules, one per family, and every kind grades `sensitive` because it launches runs automatically. Each rule binds to one composed workflow by its id, carries a human readable label, and holds its runtime state (the enabled flag, the effective cooldown window, the last and next fire times) plus its counters (fires, launches, suppressions).

- `visitrule` fires when a navigation lands on one of the reviewed HTTPS origins. The origin list must be HTTPS urls and every origin must stay inside the workflow grant list and the session grants.
- `urlrule` fires when a navigation matches the reviewed glob pattern. A `*` spans one path segment and a `**` spans across segments; explicit ports are honored (`https://example.com:8443/app/*`). The pattern origin must stay inside the grants.
- `menurule` binds the workflow to a context menu entry of the reviewed title. The entry registers through the context menus api when the browser exposes it under the current permission set; the manifest keeps its permission list unchanged, so the entry appears once the browser grants it, and the manual run path in the panel stays available regardless.
- `keyrule` binds the workflow to a keyboard shortcut command of the reviewed lowercase name with an optional suggested key binding. Commands surface in the browser's keyboard shortcut settings and route through the commands api, which needs no extra permission.
- `buttonrule` binds the workflow to the toolbar button. Because the default popup opens on the click, the popup open evaluates the button rule behind the gates once per open.
- `cronrule` fires on the reviewed five field cron schedule with an optional timezone name (item 7 of the family grammar below).
- `intervalrule` fires every reviewed period in milliseconds with an optional zero or positive jitter window that spreads repeated fires inside a seeded window.
- `urllistrule` plans one run per url of the reviewed HTTPS url list when the rule fires manually or through the panel; each url must stay inside the grants.
- `webhookrule` receives deliveries that carry the reviewed shared secret; verification checks the secret and the payload schema before anything persists.
- `eventrule` fires on observed page events of the observed catalog: `mutate`, `focus`, `banner`, `console`, `error` and `navigate`.

Every rule arms behind the explicit arm review: the rule payload with its match fields and the bound workflow render before the rule arms, and the proposal parser refuses a trigger step without `reviewed: true`. Cooldown windows stay user configured positive values with no code ceiling; the webhook and event families keep the documented default of ten seconds that the user can change.

## Cron expressions and intervals

The cron parser accepts five field expressions — minutes, hours, days of month, months and days of week — with lists (`1,15`), ranges (`9-17`), steps (`*/5`, `10-40/10`), the `*` wildcard, named weekdays (`mon`, `tuesday`) and named months (`jan`, `december`). Three letter abbreviations and full names both parse, case insensitively. The classic day of month and day of week `or` semantics apply: when both fields restrict, a day matches when either field allows it.

The next fire computation walks minute boundaries forward from the reference time, skipping months and days that do not match, and honors the reviewed timezone through the runtime timezone database — `cronnext` resolves the offset of each candidate day in the named zone, so a schedule in `Europe/Berlin` fires at the Berlin minute even when the service worker runs elsewhere. Unparseable expressions are refused at review time; the policy validates every cron expression before a rule arms. A sparse schedule such as `0 3 feb,dec 1` keeps its honesty: the next fire time may sit months away and the trigger list shows it.

The interval scheduler computes the next fire as the last fire time plus the period, sampled inside the jitter window with the seeded random source — the same source the delay jitter uses — so repeated fires spread across the window instead of piling onto the minimum. An absent jitter fires exactly on the period. The period carries no code ceiling.

Scheduling persists through chrome.storage and opportunistic wakes: the next fire times persist with their rules, every service worker wake re-evaluates the overdue schedule through `listdue`, and the alarms api rides the browser when it exposes it without a declared permission (the manifest permission set stays unchanged, an honest pattern since 1.1.49). A wake that the browser never delivers loses nothing — the overdue fires evaluate on the next wake.

## Webhook setup and secret rotation

A webhook rule carries a shared secret and a payload schema. The secret must hold at least twenty four characters mixing letters and digits — a floor, never a cap — and it never leaves the store. The schema names its fields of primitive kinds (`string`, `number`, `boolean`) with optional required flags; verification checks the secret and every required field kind before anything persists, and only verified payloads reach the store.

Secret rotation swaps the secret through the `rotatetriggersecret` handler: the old secret stops verifying immediately and the rotation lands in the audit trail. The schema persists now and webhook rules receive traffic once the agent protocol http transport of the later roadmap lands; until then the `receivewebhook` handler verifies test deliveries and stores their payloads.

## Manual runs with the step preview

Manual runs keep a step preview so a human always sees what a trigger will do before it runs. The `manualrun` handler renders the expanded step list of the composed workflow — every step with its id, kind, label and block, plus the control summaries of control steps so the branch paths, loop bounds and join policies read in plain text — and the preview stays open until the user confirms or cancels through `confirmmanualrun`. Every stored preview keeps its confirmation outcome for the audit trail; an undecided preview stays open. The sidepanel renders the preview with approve and cancel buttons and nothing runs before the confirmation.

## Keyboard and context menu bindings

Key rules surface in the browser's keyboard shortcut settings through the commands api; the suggested key binding renders in the trigger list and the command listener routes the command to its rule's fire behind the gates. Context menu entries register from menu rules when the context menus api is exposed; the entry title is the reviewed rule title and a click routes to the same fire path. The toolbar button runs the workflow bound by the button rule once per popup open, evaluated behind the gates. All three bindings route through the same `firetrigger` path as every other family — no binding bypasses the arm review, the session gate, the plan gate or the origin gates.

## Cooldowns, dedupe and the trigger queue

Three disciplines keep automatic launches honest. The cooldown window suppresses a fire that arrives inside the window after the rule's last fire and reports the remaining window; suppression increments the rule's suppression counter and lands in the audit trail. The dedupe keeps one pending fire per rule: while a run of the rule's workflow is active, a new fire joins the queue only when the rule holds no pending fire there, so a busy run never piles up duplicate launches. The queue holds fires that arrive while the target run is busy or the session is paused, and the resume drains the queue in arrival order through the same gates — a launch that fails keeps the rest of the queue waiting.

The session pause suspends every enabled rule (`pauseall` sets the pause marker) and the resume releases them (`resumeall` clears it); queued fires drain on resume. Trigger fires carry the triggering url, title and payload into the run context as seed variables (`triggercause`, `triggerrule`, `triggerurl`, `triggertitle`, `triggerpayload`), so the workflow reads what fired it. Fire records persist under the user configured trigger retention window with no code ceiling; an absent window keeps every fire record while the rule counters always survive.
