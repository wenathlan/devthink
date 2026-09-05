/*! devthink 2.0.0 — consent-first browser agent library — GPL-3.0-only — https://github.com/wenathlan/extension */

// version.ts
var packageversion = "2.0.0";
var protocolmajor = 2;

// progress.ts
function provenancestampof() {
  return { release: packageversion, protocolmajor };
}
function progressnow(clock) {
  return clock.now();
}
function recordoutcomewithclock(progress, planid, outcome, clock) {
  return recordoutcome(progress, planid, outcome, clock.now());
}
function emptyprogress(planid, now) {
  return { planid, completedsteps: [], provenance: provenancestampof(), updatedat: now };
}
function recordstep(progress, planid, stepid, now) {
  const base = progress && progress.planid === planid ? progress : emptyprogress(planid, now);
  if (base.completedsteps.includes(stepid)) return { ...base, updatedat: now };
  return { planid, completedsteps: [...base.completedsteps, stepid], provenance: provenancestampof(), updatedat: now };
}
function recordoutcome(progress, planid, outcome, now) {
  const base = progress && progress.planid === planid ? progress : emptyprogress(planid, now);
  return { ...base, outcomes: [...base.outcomes ?? [], { ...outcome, provenance: provenancestampof() }], updatedat: now };
}
function recordenvironment(progress, planid, stepid, environment, now) {
  const base = progress && progress.planid === planid ? progress : emptyprogress(planid, now);
  return { ...base, environments: { ...base.environments ?? {}, [stepid]: environment }, updatedat: now };
}
function environmentof(progress, planid, stepid) {
  if (!progress || progress.planid !== planid) return void 0;
  return (progress.environments ?? {})[stepid];
}
function recordturnaround(progress, planid, stepid, milliseconds, now) {
  const base = progress && progress.planid === planid ? progress : emptyprogress(planid, now);
  return { ...base, turnarounds: { ...base.turnarounds ?? {}, [stepid]: milliseconds }, updatedat: now };
}
function turnaroundof(progress, planid, stepid) {
  if (!progress || progress.planid !== planid) return void 0;
  return (progress.turnarounds ?? {})[stepid];
}
function recordgatewait(progress, planid, stepid, entry, now) {
  const base = progress && progress.planid === planid ? progress : emptyprogress(planid, now);
  return { ...base, gatewaits: { ...base.gatewaits ?? {}, [stepid]: entry }, updatedat: now };
}
function gatewaitof(progress, planid, stepid) {
  if (!progress || progress.planid !== planid) return void 0;
  return (progress.gatewaits ?? {})[stepid];
}
function recordperf(progress, planid, stepid, record, now) {
  const base = progress && progress.planid === planid ? progress : emptyprogress(planid, now);
  return { ...base, perf: { ...base.perf ?? {}, [stepid]: record }, updatedat: now };
}
function perfof(progress, planid, stepid) {
  if (!progress || progress.planid !== planid) return void 0;
  return (progress.perf ?? {})[stepid];
}
function recorddeltas(progress, planid, stepid, changes, now) {
  const base = progress && progress.planid === planid ? progress : emptyprogress(planid, now);
  return { ...base, deltas: { ...base.deltas ?? {}, [stepid]: changes }, updatedat: now };
}
function deltasof(progress, planid, stepid) {
  if (!progress || progress.planid !== planid) return [];
  return (progress.deltas ?? {})[stepid] ?? [];
}
function iscomplete(progress, plan) {
  if (!progress || progress.planid !== plan.id) return false;
  const required = plan.steps.map((step) => step.id);
  return required.length > 0 && required.every((id) => progress.completedsteps.includes(id));
}
function resetforplan(progress, plan, now) {
  if (progress && progress.planid === plan.id) return progress;
  if (!progress) return emptyprogress(plan.id, now);
  const snapshot = { planid: progress.planid, completedsteps: progress.completedsteps, ...progress.outcomes ? { outcomes: progress.outcomes } : {}, updatedat: progress.updatedat };
  return { planid: plan.id, completedsteps: [], outcomes: [], prior: [...progress.prior ?? [], snapshot], provenance: provenancestampof(), updatedat: now };
}
function watchclosed(startedat, lifetime, now) {
  return now >= startedat + lifetime;
}
function recordwatchcompletion(progress, planid, stepid, startedat, lifetime, now) {
  const base = progress && progress.planid === planid ? progress : emptyprogress(planid, now);
  if (!watchclosed(startedat, lifetime, now)) return base;
  return recordstep(base, planid, stepid, now);
}
function recordnaventry(progress, planid, stepid, entry, now) {
  const base = progress && progress.planid === planid ? progress : emptyprogress(planid, now);
  const outcome = { stepid, ok: entry.ok, summary: `Navigation list entry ${entry.index + 1} of ${entry.url} ${entry.ok ? "completed" : "failed"}.`, details: { naventry: entry }, at: now };
  return recordoutcome(base, planid, outcome, now);
}
function naventries(progress, planid, stepid) {
  if (!progress || progress.planid !== planid) return [];
  return (progress.outcomes ?? []).filter((outcome) => outcome.stepid === stepid && outcome.details?.naventry !== void 0).map((outcome) => outcome.details?.naventry);
}
function assigntasktab(progress, planid, tabid, now) {
  const base = progress && progress.planid === planid ? progress : emptyprogress(planid, now);
  if ((base.tasktabs ?? []).includes(tabid)) return { ...base, updatedat: now };
  return { ...base, tasktabs: [...base.tasktabs ?? [], tabid], updatedat: now };
}
function releasetasktab(progress, planid, tabid, now) {
  const base = progress && progress.planid === planid ? progress : emptyprogress(planid, now);
  const remaining = (base.tasktabs ?? []).filter((id) => id !== tabid);
  const { tasktabs: released, ...rest } = base;
  void released;
  return { ...rest, ...remaining.length > 0 ? { tasktabs: remaining } : {}, updatedat: now };
}
function tasktabs(progress, planid) {
  if (!progress || progress.planid !== planid) return [];
  return progress.tasktabs ?? [];
}
function wizardcompletion(state) {
  if (state.steps <= 0) return 0;
  return Math.min(1, state.completed.filter(Boolean).length / state.steps);
}
function extractionshare(rowscollected, estimatedtotal) {
  if (!Number.isFinite(estimatedtotal) || estimatedtotal <= 0) return 0;
  return Math.min(1, Math.max(0, rowscollected) / estimatedtotal);
}
function recordextraction(progress, planid, stepid, entry, now) {
  const base = progress && progress.planid === planid ? progress : emptyprogress(planid, now);
  const outcome = { stepid, ok: true, summary: `Extraction page ${entry.page} collected ${entry.rows} row${entry.rows === 1 ? "" : "s"} at cursor ${entry.cursor}.`, details: { extraction: entry }, at: now };
  return recordoutcome(base, planid, outcome, now);
}
function extractionentries(progress, planid, stepid) {
  if (!progress || progress.planid !== planid) return [];
  return (progress.outcomes ?? []).filter((outcome) => outcome.stepid === stepid && outcome.details?.extraction !== void 0).map((outcome) => outcome.details?.extraction);
}
function recordwizardstep(progress, planid, stepid, state, now) {
  const base = progress && progress.planid === planid ? progress : emptyprogress(planid, now);
  const executed = Math.min(state.index, state.steps);
  const done = executed >= state.steps;
  const outcome = { stepid, ok: done, summary: `Wizard step ${executed} of ${state.steps} ${done ? "completed the wizard" : "executed"}.`, details: { wizard: { index: state.index, steps: state.steps, completed: [...state.completed] } }, at: now };
  return recordoutcome(base, planid, outcome, now);
}
function downloadshare(completed, total) {
  if (!Number.isFinite(total) || total <= 0) return 0;
  return Math.min(1, Math.max(0, completed) / total);
}
function recorddownload(progress, planid, stepid, entry, now) {
  const base = progress && progress.planid === planid ? progress : emptyprogress(planid, now);
  const outcome = { stepid, ok: entry.state === "complete", summary: `Download ${entry.index + 1} of ${entry.url} ended in the ${entry.state} state.`, details: { download: entry }, at: now };
  return recordoutcome(base, planid, outcome, now);
}
function downloadentries(progress, planid, stepid) {
  if (!progress || progress.planid !== planid) return [];
  return (progress.outcomes ?? []).filter((outcome) => outcome.stepid === stepid && outcome.details?.download !== void 0).map((outcome) => outcome.details?.download);
}
function recordcapture(progress, planid, stepid, capture, now) {
  const base = progress && progress.planid === planid ? progress : emptyprogress(planid, now);
  const bytes = capture.bytes?.length ?? 0;
  const outcome = { stepid, ok: true, summary: `Captured a ${capture.format} ${capture.kind} shot of ${capture.width} by ${capture.height} pixels with ${bytes} character${bytes === 1 ? "" : "s"} of image data.`, details: { capture: { id: capture.id, kind: capture.kind, format: capture.format, width: capture.width, height: capture.height, bytes } }, at: now };
  return recordoutcome(base, planid, outcome, now);
}
function recordpair(progress, planid, stepid, pair, now) {
  const base = progress && progress.planid === planid ? progress : emptyprogress(planid, now);
  const outcome = { stepid, ok: true, summary: `Paired the before shot ${pair.beforeid} with the after shot ${pair.afterid} around the ${pair.actionkind} action.`, details: { shotpair: { id: pair.id, beforeid: pair.beforeid, afterid: pair.afterid, actionkind: pair.actionkind, ...pair.target !== void 0 ? { target: pair.target } : {}, ...pair.domsnapshotid !== void 0 ? { domsnapshotid: pair.domsnapshotid } : {} } }, at: now };
  return recordoutcome(base, planid, outcome, now);
}
function captureentries(progress, planid, stepid) {
  if (!progress || progress.planid !== planid) return [];
  return (progress.outcomes ?? []).filter((outcome) => outcome.stepid === stepid && outcome.details?.capture !== void 0).map((outcome) => outcome.details?.capture);
}
function pairentries(progress, planid, stepid) {
  if (!progress || progress.planid !== planid) return [];
  return (progress.outcomes ?? []).filter((outcome) => outcome.stepid === stepid && outcome.details?.shotpair !== void 0).map((outcome) => outcome.details?.shotpair);
}
function recordmedia(progress, planid, stepid, media, now) {
  const base = progress && progress.planid === planid ? progress : emptyprogress(planid, now);
  const outcome = { stepid, ok: true, summary: `Captured a ${media.kind} media record of ${media.scope} scope with ${media.bytes} character${media.bytes === 1 ? "" : "s"} of media data.`, details: { media }, at: now };
  return recordoutcome(base, planid, outcome, now);
}
function mediaentries(progress, planid, stepid) {
  if (!progress || progress.planid !== planid) return [];
  return (progress.outcomes ?? []).filter((outcome) => outcome.stepid === stepid && outcome.details?.media !== void 0).map((outcome) => outcome.details?.media);
}
function recordcall(progress, planid, stepid, entry, now) {
  const base = progress && progress.planid === planid ? progress : emptyprogress(planid, now);
  const outcome = { stepid, ok: entry.statusclass === "success", summary: `Outbound ${entry.method} ${entry.kind} call to ${entry.origin} ended in the ${entry.status} ${entry.statusclass} class after ${entry.retries} retr${entry.retries === 1 ? "y" : "ies"} and ${entry.bytes} byte${entry.bytes === 1 ? "" : "s"}.`, details: { call: entry }, at: now };
  return recordoutcome(base, planid, outcome, now);
}
function callentries(progress, planid, stepid) {
  if (!progress || progress.planid !== planid) return [];
  return (progress.outcomes ?? []).filter((outcome) => outcome.stepid === stepid && outcome.details?.call !== void 0).map((outcome) => outcome.details?.call);
}
function recordfetchretry(progress, planid, stepid, retry, now) {
  const base = progress && progress.planid === planid ? progress : emptyprogress(planid, now);
  const outcome = { stepid, ok: false, summary: `Fetch attempt ${retry.attempt} of ${retry.url} failed (${retry.reason}); retrying after a ${retry.wait} millisecond backoff.`, details: { fetchretry: retry }, at: now };
  return recordoutcome(base, planid, outcome, now);
}
function fetchretryentries(progress, planid, stepid) {
  if (!progress || progress.planid !== planid) return [];
  return (progress.outcomes ?? []).filter((outcome) => outcome.stepid === stepid && outcome.details?.fetchretry !== void 0).map((outcome) => outcome.details?.fetchretry);
}
function recordchannel(progress, planid, stepid, entry, now) {
  const base = progress && progress.planid === planid ? progress : emptyprogress(planid, now);
  const outcome = { stepid, ok: entry.state !== "failed", summary: `The ${entry.kind} channel of ${entry.url} is ${entry.state} after ${entry.sent} sent and ${entry.received} received message${entry.received === 1 ? "" : "s"}.`, details: { channel: entry }, at: now };
  return recordoutcome(base, planid, outcome, now);
}
function channelentries(progress, planid, stepid) {
  if (!progress || progress.planid !== planid) return [];
  return (progress.outcomes ?? []).filter((outcome) => outcome.stepid === stepid && outcome.details?.channel !== void 0).map((outcome) => outcome.details?.channel);
}
function recordexchange(progress, planid, stepid, entry, now) {
  const base = progress && progress.planid === planid ? progress : emptyprogress(planid, now);
  const outcome = { stepid, ok: entry.errorclass === void 0 && entry.statusclass === "success", summary: `Observed the ${entry.method} request of ${entry.url} as exchange ${entry.correlationid} in the ${entry.status} ${entry.statusclass} class over ${entry.duration} millisecond${entry.duration === 1 ? "" : "s"}${entry.errorclass !== void 0 ? ` failing with the ${entry.errorclass} class` : ""}.`, details: { exchange: entry }, at: now };
  return recordoutcome(base, planid, outcome, now);
}
function exchangeentries(progress, planid, stepid) {
  if (!progress || progress.planid !== planid) return [];
  return (progress.outcomes ?? []).filter((outcome) => outcome.stepid === stepid && outcome.details?.exchange !== void 0).map((outcome) => outcome.details?.exchange);
}
function recordevent(progress, planid, stepid, entry, now) {
  const base = progress && progress.planid === planid ? progress : emptyprogress(planid, now);
  const outcome = { stepid, ok: true, summary: `The event stream of ${entry.url} observed ${entry.events} ${entry.name || "message"} event${entry.events === 1 ? "" : "s"}${entry.lasteventid !== void 0 ? ` resuming from ${entry.lasteventid}` : ""}.`, details: { event: entry }, at: now };
  return recordoutcome(base, planid, outcome, now);
}
function evententries(progress, planid, stepid) {
  if (!progress || progress.planid !== planid) return [];
  return (progress.outcomes ?? []).filter((outcome) => outcome.stepid === stepid && outcome.details?.event !== void 0).map((outcome) => outcome.details?.event);
}
function recordpoll(progress, planid, stepid, entry, now) {
  const base = progress && progress.planid === planid ? progress : emptyprogress(planid, now);
  const outcome = { stepid, ok: true, summary: `Long poll ${entry.poll} returned the ${entry.status} status${entry.cursor !== void 0 ? ` at cursor ${entry.cursor}` : ""} and ${entry.stopped ? `stopped: ${entry.reason}` : "continues"}.`, details: { poll: entry }, at: now };
  return recordoutcome(base, planid, outcome, now);
}
function pollentries(progress, planid, stepid) {
  if (!progress || progress.planid !== planid) return [];
  return (progress.outcomes ?? []).filter((outcome) => outcome.stepid === stepid && outcome.details?.poll !== void 0).map((outcome) => outcome.details?.poll);
}
function recordcontrol(progress, planid, stepid, entry, now) {
  const base = progress && progress.planid === planid ? progress : emptyprogress(planid, now);
  const outcome = { stepid, ok: true, summary: `${entry.reason}: ${entry.applied} applied rule${entry.applied === 1 ? "" : "s"}, ${entry.blocked} blocked request${entry.blocked === 1 ? "" : "s"}, ${entry.mocked} mocked response${entry.mocked === 1 ? "" : "s"} and ${entry.reverts} reverted rule${entry.reverts === 1 ? "" : "s"}.`, details: { control: entry }, at: now };
  return recordoutcome(base, planid, outcome, now);
}
function controlentries(progress, planid, stepid) {
  if (!progress || progress.planid !== planid) return [];
  return (progress.outcomes ?? []).filter((outcome) => outcome.stepid === stepid && outcome.details?.control !== void 0).map((outcome) => outcome.details?.control);
}
function recordupload(progress, planid, stepid, entry, now) {
  const base = progress && progress.planid === planid ? progress : emptyprogress(planid, now);
  const outcome = { stepid, ok: true, summary: `The multipart upload moved chunk ${entry.chunk} of ${entry.chunks} with ${entry.uploaded} of ${entry.bytes} bytes sent.`, details: { upload: entry }, at: now };
  return recordoutcome(base, planid, outcome, now);
}
function uploadentries(progress, planid, stepid) {
  if (!progress || progress.planid !== planid) return [];
  return (progress.outcomes ?? []).filter((outcome) => outcome.stepid === stepid && outcome.details?.upload !== void 0).map((outcome) => outcome.details?.upload);
}
function recordtimeline(progress, planid, stepid, entry, now) {
  const base = progress && progress.planid === planid ? progress : emptyprogress(planid, now);
  const outcome = { stepid, ok: true, summary: `Captured ${entry.entries} timeline entr${entry.entries === 1 ? "y" : "ies"} with ${entry.collapsed} collapsed repeat${entry.collapsed === 1 ? "" : "s"}, ${entry.errors} error${entry.errors === 1 ? "" : "s"}, ${entry.rejections} rejection${entry.rejections === 1 ? "" : "s"} and ${entry.longtasks} long task${entry.longtasks === 1 ? "" : "s"}.`, details: { timeline: entry }, at: now };
  return recordoutcome(base, planid, outcome, now);
}
function timelineevidences(progress, planid, stepid) {
  if (!progress || progress.planid !== planid) return [];
  return (progress.outcomes ?? []).filter((outcome) => outcome.stepid === stepid && outcome.details?.timeline !== void 0).map((outcome) => outcome.details?.timeline);
}
function recordcdp(progress, planid, stepid, entry, now) {
  const base = progress && progress.planid === planid ? progress : emptyprogress(planid, now);
  const summary = entry.family === "command" ? `The reviewed ${entry.method ?? "raw"} command of the ${entry.domain ?? "unknown"} domain returned in ${entry.duration ?? 0} millisecond${(entry.duration ?? 0) === 1 ? "" : "s"}${entry.errorclass !== void 0 ? ` with the ${entry.errorclass} error class` : ""}.` : `The devtools ${entry.family} step ran${entry.domain !== void 0 ? ` on the ${entry.domain} domain` : ""}${entry.events !== void 0 ? ` and matched ${entry.events} event${entry.events === 1 ? "" : "s"}` : ""}${entry.hits !== void 0 ? ` with ${entry.hits} hit${entry.hits === 1 ? "" : "s"}` : ""}${entry.frames !== void 0 ? ` capturing ${entry.frames} call frame${entry.frames === 1 ? "" : "s"}` : ""}.`;
  const outcome = { stepid, ok: entry.errorclass === void 0, summary, details: { cdp: entry }, at: now };
  return recordoutcome(base, planid, outcome, now);
}
function cdpevidences(progress, planid, stepid) {
  if (!progress || progress.planid !== planid) return [];
  return (progress.outcomes ?? []).filter((outcome) => outcome.stepid === stepid && outcome.details?.cdp !== void 0).map((outcome) => outcome.details?.cdp);
}
function recordprofile(progress, planid, stepid, entry, now) {
  const base = progress && progress.planid === planid ? progress : emptyprogress(planid, now);
  const counts = `${entry.metrics !== void 0 ? `${entry.metrics} metric${entry.metrics === 1 ? "" : "s"}, ` : ""}${entry.samples !== void 0 ? `${entry.samples} sample${entry.samples === 1 ? "" : "s"}, ` : ""}${entry.nodes !== void 0 ? `${entry.nodes} node${entry.nodes === 1 ? "" : "s"}, ` : ""}${entry.events !== void 0 ? `${entry.events} event${entry.events === 1 ? "" : "s"}, ` : ""}${entry.bytes !== void 0 ? `${entry.bytes} byte${entry.bytes === 1 ? "" : "s"}, ` : ""}${entry.flagged !== void 0 ? `${entry.flagged} flagged step${entry.flagged === 1 ? "" : "s"}, ` : ""}`.replace(/, $/, "");
  const outcome = { stepid, ok: true, summary: `The profiling ${entry.family} capture ran${counts.length > 0 ? ` with ${counts}` : ""}.`, details: { profile: entry }, at: now };
  return recordoutcome(base, planid, outcome, now);
}
function profileevidences(progress, planid, stepid) {
  if (!progress || progress.planid !== planid) return [];
  return (progress.outcomes ?? []).filter((outcome) => outcome.stepid === stepid && outcome.details?.profile !== void 0).map((outcome) => outcome.details?.profile);
}
function recordemulation(progress, planid, stepid, entry, now) {
  const base = progress && progress.planid === planid ? progress : emptyprogress(planid, now);
  const outcome = { stepid, ok: true, summary: `${entry.reason}: ${entry.applied.length} applied layer${entry.applied.length === 1 ? "" : "s"}${entry.applied.length > 0 ? ` (${entry.applied.join(", ")})` : ""} and ${entry.reverted.length} reverted layer${entry.reverted.length === 1 ? "" : "s"}${entry.reverted.length > 0 ? ` (${entry.reverted.join(", ")})` : ""}.`, details: { emulation: entry }, at: now };
  return recordoutcome(base, planid, outcome, now);
}
function emulationevidences(progress, planid, stepid) {
  if (!progress || progress.planid !== planid) return [];
  return (progress.outcomes ?? []).filter((outcome) => outcome.stepid === stepid && outcome.details?.emulation !== void 0).map((outcome) => outcome.details?.emulation);
}
function recordsession(progress, planid, stepid, entry, now) {
  const base = progress && progress.planid === planid ? progress : emptyprogress(planid, now);
  const counts = `${entry.sections !== void 0 ? `${entry.sections} section${entry.sections === 1 ? "" : "s"}, ` : ""}${entry.matches !== void 0 ? `${entry.matches} match${entry.matches === 1 ? "" : "es"}, ` : ""}${entry.restored !== void 0 ? `${entry.restored} restored tab${entry.restored === 1 ? "" : "s"}, ` : ""}${entry.skipped !== void 0 ? `${entry.skipped} skipped origin${entry.skipped === 1 ? "" : "s"}, ` : ""}${entry.cursor !== void 0 ? `cursor ${entry.cursor}, ` : ""}${entry.bytes !== void 0 ? `${entry.bytes} byte${entry.bytes === 1 ? "" : "s"}, ` : ""}`.replace(/, $/, "");
  const outcome = { stepid, ok: true, summary: `${entry.detail}${counts.length > 0 ? ` with ${counts}` : ""}.`, details: { session: entry }, at: now };
  return recordoutcome(base, planid, outcome, now);
}
function sessionevidences(progress, planid, stepid) {
  if (!progress || progress.planid !== planid) return [];
  return (progress.outcomes ?? []).filter((outcome) => outcome.stepid === stepid && outcome.details?.session !== void 0).map((outcome) => outcome.details?.session);
}
function recordworkflow(progress, planid, stepid, entry, now) {
  const base = progress && progress.planid === planid ? progress : emptyprogress(planid, now);
  const counts = `${entry.executed !== void 0 ? `${entry.executed} executed step${entry.executed === 1 ? "" : "s"}, ` : ""}${entry.refused !== void 0 ? `${entry.refused} refused step${entry.refused === 1 ? "" : "s"}, ` : ""}${entry.total !== void 0 ? `${entry.total} total step${entry.total === 1 ? "" : "s"}, ` : ""}${entry.iterations !== void 0 ? `${entry.iterations} iteration${entry.iterations === 1 ? "" : "s"}, ` : ""}${entry.denominator !== void 0 ? `denominator ${entry.denominator}, ` : ""}`.replace(/, $/, "");
  const outcome = { stepid, ok: true, summary: `${entry.detail}${counts.length > 0 ? ` with ${counts}` : ""}.`, details: { workflow: entry }, at: now };
  return recordoutcome(base, planid, outcome, now);
}
function workflowevidences(progress, planid, stepid) {
  if (!progress || progress.planid !== planid) return [];
  return (progress.outcomes ?? []).filter((outcome) => outcome.stepid === stepid && outcome.details?.workflow !== void 0).map((outcome) => outcome.details?.workflow);
}
function workflowshare(executed, total) {
  if (total <= 0) return 0;
  return Math.min(1, Math.max(0, executed / total));
}
function loopshare(iterations, denominator) {
  if (denominator <= 0) return 0;
  return Math.min(1, Math.max(0, iterations / denominator));
}
function recordtrigger(progress, planid, stepid, entry, now) {
  const base = progress && progress.planid === planid ? progress : emptyprogress(planid, now);
  const counts = `${entry.fires !== void 0 ? `${entry.fires} fire${entry.fires === 1 ? "" : "s"}, ` : ""}${entry.launches !== void 0 ? `${entry.launches} launch${entry.launches === 1 ? "" : "es"}, ` : ""}${entry.suppressions !== void 0 ? `${entry.suppressions} suppression${entry.suppressions === 1 ? "" : "s"}, ` : ""}${entry.queued !== void 0 ? `${entry.queued} queued fire${entry.queued === 1 ? "" : "s"}, ` : ""}`.replace(/, $/, "");
  const outcome = { stepid, ok: true, summary: `${entry.detail}${counts.length > 0 ? ` with ${counts}` : ""}.`, details: { trigger: entry }, at: now };
  return recordoutcome(base, planid, outcome, now);
}
function triggerevidences(progress, planid, stepid) {
  if (!progress || progress.planid !== planid) return [];
  return (progress.outcomes ?? []).filter((outcome) => outcome.stepid === stepid && outcome.details?.trigger !== void 0).map((outcome) => outcome.details?.trigger);
}
function recordtoolcall(progress, planid, stepid, entry, now) {
  const base = progress && progress.planid === planid ? progress : emptyprogress(planid, now);
  const outcome = { stepid, ok: entry.ok, summary: `The ${entry.tool} tool call of the client ${entry.clientid} ${entry.ok ? "ran behind the consent gates" : `was refused${entry.code !== void 0 ? ` with the ${entry.code} error` : ""}`}.`, details: { tool: entry }, at: now };
  return recordoutcome(base, planid, outcome, now);
}
function toolcallevidences(progress, planid, stepid) {
  if (!progress || progress.planid !== planid) return [];
  return (progress.outcomes ?? []).filter((outcome) => outcome.stepid === stepid && outcome.details?.tool !== void 0).map((outcome) => outcome.details?.tool);
}
function recorddenied(progress, planid, stepid, entry, now) {
  const base = progress && progress.planid === planid ? progress : emptyprogress(planid, now);
  const outcome = { stepid, ok: false, summary: `The ${entry.kind} step on ${entry.origin} was denied: ${entry.reason}`, details: { denied: entry }, at: now };
  return recordoutcome(base, planid, outcome, now);
}
function deniedevidences(progress, planid, stepid) {
  if (!progress || progress.planid !== planid) return [];
  return (progress.outcomes ?? []).filter((outcome) => outcome.stepid === stepid && outcome.details?.denied !== void 0).map((outcome) => outcome.details?.denied);
}
function recordrevocation(progress, planid, stepid, entry, now) {
  const base = progress && progress.planid === planid ? progress : emptyprogress(planid, now);
  const outcome = { stepid, ok: false, summary: `The run halted at the step ${stepid}${entry.haltedstepids.length > 1 ? ` with ${entry.haltedstepids.length - 1} queued step${entry.haltedstepids.length === 2 ? "" : "s"} rolled back` : ""}: ${entry.reason}`, details: { revoked: entry }, at: now };
  return recordoutcome(base, planid, outcome, now);
}
function revocationevidences(progress, planid, stepid) {
  if (!progress || progress.planid !== planid) return [];
  return (progress.outcomes ?? []).filter((outcome) => outcome.stepid === stepid && outcome.details?.revoked !== void 0).map((outcome) => outcome.details?.revoked);
}
function replayprogress(progress, planid) {
  if (!progress || progress.planid !== planid) return { planid, entries: [] };
  const entries = (progress.outcomes ?? []).map((outcome, index) => ({ index, stepid: outcome.stepid, ok: outcome.ok, summary: outcome.summary, at: outcome.at, ...outcome.provenance !== void 0 ? { provenance: outcome.provenance } : {} }));
  return { planid, entries, ...progress.provenance !== void 0 ? { provenance: progress.provenance } : {} };
}
export {
  assigntasktab,
  callentries,
  captureentries,
  cdpevidences,
  channelentries,
  controlentries,
  deltasof,
  deniedevidences,
  downloadentries,
  downloadshare,
  emptyprogress,
  emulationevidences,
  environmentof,
  evententries,
  exchangeentries,
  extractionentries,
  extractionshare,
  fetchretryentries,
  gatewaitof,
  iscomplete,
  loopshare,
  mediaentries,
  naventries,
  pairentries,
  perfof,
  pollentries,
  profileevidences,
  progressnow,
  provenancestampof,
  recordcall,
  recordcapture,
  recordcdp,
  recordchannel,
  recordcontrol,
  recorddeltas,
  recorddenied,
  recorddownload,
  recordemulation,
  recordenvironment,
  recordevent,
  recordexchange,
  recordextraction,
  recordfetchretry,
  recordgatewait,
  recordmedia,
  recordnaventry,
  recordoutcome,
  recordoutcomewithclock,
  recordpair,
  recordperf,
  recordpoll,
  recordprofile,
  recordrevocation,
  recordsession,
  recordstep,
  recordtimeline,
  recordtoolcall,
  recordtrigger,
  recordturnaround,
  recordupload,
  recordwatchcompletion,
  recordwizardstep,
  recordworkflow,
  releasetasktab,
  replayprogress,
  resetforplan,
  revocationevidences,
  sessionevidences,
  tasktabs,
  timelineevidences,
  toolcallevidences,
  triggerevidences,
  turnaroundof,
  uploadentries,
  watchclosed,
  wizardcompletion,
  workflowevidences,
  workflowshare
};
//# sourceMappingURL=progress.js.map
