/**
 * labels.ts — the copy law of forge: every interface string lives in the
 * label store, the wingets and page anchors read through this typed
 * accessor, and a hardcoded string inside a widget is a defect. the
 * manifest below is the english source of truth extracted from the real
 * strings of the Sol wingets and the page anchors; the seed ingests it into
 * the labels store (the app db through db.ts on the server, the browser rows
 * cache in the visitor machine) and the seed never overwrites a translated
 * row.
 *
 * the browser never imports db.ts (better-sqlite3 cannot ride the static
 * bundle): the type comes across erased, the browser seed mirrors the rows
 * into the local cache the way onboardingstate.ts mirrors the seen flags.
 */

import type { LabelRow } from "./db.ts";

/** the label revision of the manifest: bump on every copy wave so the seed
 * refreshes the store rows of the changed strings. */
export const LABEL_REVISION = 2;

/** the english manifest: the page.widget.key path answers the surface text.
 * every entry is the verbatim string the wingets and page anchors rendered
 * before the copy wave — zero invented copy. data stays data: runner names
 * and modes, queue lanes and depths, seeds, run clocks and log lines keep
 * flowing from the engine tables; the prose around them rides here. */
export const LABEL_MANIFEST = {
  // the app boundary (App.tsx, the boot anchor)
  "app.boundary.body": "forge could not render this page frame.",
  "app.boundary.reload": "reload the page",
  // the shared rail labels of the window pin rail (the shell, the onboarding facts)
  "nav.home": "home",
  "nav.runs": "runs",
  "nav.queue": "queue",
  "nav.logs": "logs",
  "nav.homeDetail": "the landing of the forge",
  "nav.runsDetail": "the runner fleets and their health",
  "nav.queueDetail": "the execution queue and its priorities",
  "nav.logsDetail": "the seeded replay of a run log",
  // the application window chrome (the shell)
  "shell.theme.tip": "toggle theme",
  "shell.chip.restoreAria": "Restore the forge window",
  "ShellBrand": "forge",
  "shell.window.aria": "forge window",
  "shell.title.role": "the runner floor of the family",
  "shell.controls.minimize": "Minimize forge",
  "shell.controls.restore": "Restore forge",
  "shell.controls.maximize": "Maximize forge",
  "shell.controls.close": "Close forge",
  "shell.rail.aria": "Pages",
  "shell.family.openAria": "open {slug} — a family application",
  // the entry widget of the home page (the live boot readout)
  "home.entry.state": "staging",
  "home.entry.body": "runner surface staged — the application tree lands here",
  "home.entry.note": "forge · the family forge",
  "home.entry.noteFloor": "forge · the runner floor of the family",
  // the tabs widget of the home page (the anchor pills)
  "home.tabs.aria": "forge surface sections",
  "home.tabs.floor": "the runner floor",
  "home.tabs.family": "the family",
  // the home page anchor (the landing) — the hero
  "home.hero.name": "forge",
  "home.hero.title": "Builds that run themselves.",
  "home.hero.lede":
    "The runner floor of the DevThink family — runners muster, work queues by priority and every run leaves its log behind, on the family sandbox cloud.",
  "home.hero.placeholder": "npm run build · full-virtual sandbox",
  "home.hero.inputAria": "Describe the build to run",
  "home.hero.cta": "step onto the floor",
  "home.hero.hint": "enter walks down to the runner floor · the targets ride the runner modes of the sandbox",
  "home.hero.chipsAria": "Runtime targets",
  // the family row of the landing footer
  "home.family.aria": "the DevThink family",
  "home.family.head": "the family",
  "home.family.openAria": "open {slug} — a family application",
  // the capability ledger of the landing
  "home.floor.eyebrow": "the runner floor",
  "home.floor.title": "One floor, three jobs",
  "home.floor.featuredAria": "the runner floor — the platform pages answer",
  "home.floor.featuredTitle": "the platform answers",
  "home.floor.featuredBody": "The platform answers on three pages of this app: the fleets, the queue and the seeded log replay.",
  "home.floor.live": "this app",
  "home.floor.badge": "runs · queue · logs",
  "home.cap.registerTarget": "register runners",
  "home.cap.registerBody":
    "The runner floor musters the fleet — name, mode, state and the health ladder of every runner.",
  "home.cap.queueTarget": "queue the work",
  "home.cap.queueBody": "Runs wait in three priority lanes — express cuts ahead, batch rides last, FIFO inside the lane.",
  "home.cap.logsTarget": "record run logs",
  "home.cap.logsBody": "Every run keeps its line stream beside the runner — replayed from one seed, line-exact.",
  "home.cap.statusReady": "ready",
  "home.cap.registerMeta": "on /runs",
  "home.cap.queueMeta": "on /queue",
  "home.cap.logsMeta": "on /logs",
  // the run flow of the landing (the 01–03 steps)
  "home.flow.eyebrow": "the run, end to end",
  "home.flow.title": "Mount, run, report",
  "home.flow.mount": "Mount",
  "home.flow.mountBody": "The floor mounts a full-virtual sandbox and hands the build to a runner.",
  "home.flow.run": "Run",
  "home.flow.runBody": "The build executes in the sandbox and its log lines land beside the runner that produced them.",
  "home.flow.report": "Report",
  "home.flow.reportBody": "The outcome travels back to the family — success, failure and the log reference.",
  // the honest-state rail of the landing
  "home.side.aria": "the honest state of the floor",
  "home.side.head": "the honest state",
  "home.side.body":
    "This surface rehearses the floor from one seed — the fleets, the queue and the log replay are the real engine logic, and no live build is claimed. The family reports its outcomes here.",
  "home.side.link": "the family on github",
  // the footer meta-quad of the landing
  "home.quad.floorHead": "floor",
  "home.quad.engineHead": "engine",
  "home.quad.identityHead": "identity",
  "home.quad.domainHead": "domain",
  "home.quad.fleetsLink": "the runner fleets",
  "home.quad.queueLink": "the execution queue",
  "home.quad.logsLink": "the run logs",
  "home.quad.engineLine": "the family sandbox engine",
  "home.quad.identityLine1": "forge · lime-brasa #a2cb3a",
  "home.quad.identityLine2": "charcoal × lime — it just runs",
  "home.quad.domainLine1": "forge · the family forge",
  "home.quad.domainLine2": "runs the deployed builds",
  // the runs page anchor (the runner floor)
  "runs.eyebrow": "runs · the runner floor",
  "runs.title": "Runner fleets",
  "runs.lede":
    "A seeded rehearsal of the runner floor — seed {seed}, {count} runners on the sandbox boundary. The tick advances the floor by its own rules; nothing here claims a live build. The run plan draws its own stage graph from the same seed and tick.",
  "runs.advance": "advance the floor",
  "runs.reseed": "reseed the rehearsal",
  // the runner states of the fleet rows
  "runs.state.idle": "idle",
  "runs.state.starting": "starting",
  "runs.state.busy": "busy",
  "runs.state.draining": "draining",
  "runs.state.offline": "offline",
  // the fleet row metrics
  "runs.row.load": "load",
  "runs.row.loadAria": "load {percent} percent",
  "runs.row.runs": "runs",
  "runs.row.failures": "failures",
  "runs.row.healthAria": "health {label} (rung {rung} of 3)",
  // the floor summary and the fleet table of the runs page
  "runs.summary.aria": "the floor summary",
  "runs.summary.runners": "runners",
  "runs.summary.health": "health ladder",
  "runs.summary.busyLoad": "busy load",
  "runs.summary.verdictLabel": "floor verdict",
  "runs.summary.healthy": "healthy — no red on the floor",
  "runs.summary.unhealthy": "not healthy — a runner rides red",
  // the empty state of the runs page
  "runs.empty.title": "no runners mustered",
  "runs.empty.line": "The floor stands empty — reseed the rehearsal to muster the fleet again.",
  "runs.empty.action": "muster the rehearsal fleet",
  // the fleet table head
  "runs.fleet.aria": "the runner fleet",
  "runs.head.runner": "runner",
  "runs.head.state": "state",
  "runs.head.load": "load",
  "runs.head.record": "record",
  "runs.head.health": "health",
  // the footnote of the runs page
  "runs.footnote":
    "states the floor answers: {list} — the health ladder is green → amber → red, and red never hides its failure record.",
  // the stage graph widget (the run plan drawn as nodes and wires)
  "runs.plan.state.pending": "pending",
  "runs.plan.state.running": "running",
  "runs.plan.state.done": "done",
  "runs.plan.state.failed": "failed",
  "runs.plan.state.skipped": "skipped",
  "runs.plan.tip.pending": "the stage waits for its turn in the ride order",
  "runs.plan.tip.running": "the stage runs now — the windows accent marks the live stage",
  "runs.plan.tip.done": "the stage settled — its evidence is already in the run record",
  "runs.plan.tip.failed": "the stage rode red — the failure keeps its record on the plan",
  "runs.plan.tip.skipped": "the stage was stranded by an earlier red rung",
  "runs.plan.nodeTitle": "{no} · {label} — {note} ({state})",
  "runs.plan.graphAria":
    "the run plan graph: {steps} steps across {stages} stages, {done} done, {running} running, {failed} failed",
  "runs.plan.aria": "the run plan stage graph",
  "runs.plan.eyebrow": "the run plan · {id} · {stages} stages",
  "runs.plan.progressTip": "the done share of the plan rides at {progress} percent",
  "runs.plan.tallyAria": "the plan state tally",
  "runs.plan.stagesAria": "the plan stages in ride order",
  "runs.plan.stepTip": "{note} — {state}",
  "runs.plan.srStep": "{no}. {label} ({kind}): {note}",
  // the queue page anchor (the serving order)
  "queue.chips.priorityAria": "priority of the new run",
  "queue.chips.priority": "priority",
  "queue.chips.modeAria": "runner mode of the new run",
  "queue.chips.mode": "runner mode",
  "queue.row.meta": "{mode} · seq {seq}",
  "queue.row.ahead": "ahead: {position}",
  "queue.row.cancelAria": "cancel {label}",
  "queue.row.cancel": "cancel",
  "queue.unnamed": "unnamed run",
  "queue.eyebrow": "queue · the serving order",
  "queue.title": "Execution queue",
  "queue.lede":
    "Runs wait in three priority lanes — express cuts ahead, batch rides last, FIFO inside the lane. A seeded rehearsal (seed {seed}) fills the order; the engine under the buttons is the real queue logic.",
  "queue.serve": "serve next",
  "queue.reseed": "reseed the rehearsal",
  // the queue summary and the serving order table
  "queue.summary.aria": "the queue summary",
  "queue.summary.depth": "depth",
  "queue.summary.lanes": "lanes",
  "queue.summary.head": "head of the order",
  "queue.summary.served": "last served",
  "queue.summary.none": "—",
  "queue.summary.nothingYet": "nothing yet",
  "queue.form.aria": "enqueue a run",
  "queue.form.head": "enqueue a run",
  "queue.form.placeholder": "label the run — e.g. build the family site",
  "queue.form.inputAria": "label of the run to enqueue",
  "queue.form.submit": "queue it",
  "queue.empty.title": "the queue is empty",
  "queue.empty.line": "The floor has nothing waiting — enqueue a run or reseed the rehearsal queue.",
  "queue.empty.action": "seed the rehearsal queue",
  // the serving order table head
  "queue.order.aria": "the serving order",
  "queue.head.pos": "pos",
  "queue.head.run": "run",
  "queue.head.priority": "priority",
  "queue.head.wait": "wait",
  "queue.footnote": "the serving rank is fixed: {list} — lower serves first, arrival order breaks the ties.",
  // the logs page anchor (the seeded replay of a run)
  "logs.eyebrow": "logs · the run evidence",
  "logs.title": "Run logs — a seeded replay",
  "logs.lede":
    "One run of the floor, replayed line by line from seed {seed} — the same seed always answers the same stream, in the browser and in the tests. Outcome and evidence stay beside the runner.",
  "logs.replay": "replay the run",
  "logs.pause": "pause the tail",
  "logs.resume": "resume the tail",
  "logs.restart": "restart from zero",
  // the replay console and the stream table
  "logs.console.aria": "the replay controls",
  "logs.seeds": "seeds",
  "logs.factClock": "run clock",
  "logs.factLines": "lines",
  "logs.factCensus": "census",
  "logs.censusValue": "{info} info · {warn} warn · {error} error",
  "logs.factOutcome": "outcome",
  "logs.empty.title": "no stream for this seed",
  "logs.empty.line": "The replay engine answered nothing — pick one of the preset seeds to roll a run.",
  // the log stream table
  "logs.stream.aria": "the log stream",
  "logs.head.clock": "clock",
  "logs.head.level": "level",
  "logs.head.line": "line",
  "logs.cursorDone": "— end of stream — outcome reported",
  "logs.cursorTailing": "— tailing —",
  "logs.footnote": "the copyable form of the stream rides the same engine: logText(seed) — {count} lines total for seed {seed}.",
  // the notfound page anchor (the 404 dead address)
  "notfound.eyebrow": "404",
  "notfound.title": "This address runs nothing.",
  "notfound.lede": "The forge runtime has no surface here — the runner floor lives one entry away, on the home of the window.",
  "notfound.back": "back to the floor",
  // the intro page anchor (the splash)
  "intro.aria": "forge is opening",
  "intro.name": "forge",
  "intro.line": "forge runs the builds of the family.",
  "intro.skip": "click or press any key to continue",
  // the onboarding page anchor (the first-run frames)
  "onboarding.aria": "forge first run",
  "onboarding.title": "welcome to forge",
  "onboarding.eyebrow": "{no} — {step}",
  "onboarding.steps.is": "what it is",
  "onboarding.steps.does": "what it does",
  "onboarding.steps.enter": "enter",
  "onboarding.what.lead": "the runner floor of the family",
  "onboarding.what.body":
    "forge is the execution application of the wenathlan family — the build floor of the clones: any build runs through the family sandbox, and the outcomes travel back to the family.",
  "onboarding.hosts.lead": "what the window hosts",
  "onboarding.enter.lead": "ready to enter",
  "onboarding.enter.body":
    "the window opens on the landing and every surface rides the same rail. the theme starts dark and stays in memory only — nothing is written to this machine.",
  "onboarding.meterAria": "step {no} of {total}",
  "onboarding.skip": "skip",
  "onboarding.back": "back",
  "onboarding.enterCta": "enter forge",
  "onboarding.continue": "continue",
} as const;

export type LabelKey = keyof typeof LABEL_MANIFEST & string;

/** the translation overrides the runtime loads from the store at boot: the
 * key answers the translated text when the person changed the language. */
const overrides = new Map<string, string>();

/** the browser cache of the labels table: the rows mirror the app db (the
 * db is the source of truth; the cache carries the translated rows offline —
 * the onboardingstate.ts precedent for the visitor machine). */
const CACHE_KEY = "forge.labels.rows";

function readCache(): LabelRow[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? (parsed.filter((row): row is LabelRow => !!row && typeof row === "object") as LabelRow[])
      : [];
  } catch {
    return [];
  }
}

function writeCache(rows: readonly LabelRow[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(rows));
  } catch {
    // the cache is best effort: the manifest always answers
  }
}

/** the typed accessor of the copy: the only door a widget or page anchor uses. */
export function label(key: LabelKey): string {
  return overrides.get(key) ?? LABEL_MANIFEST[key];
}

/** the placeholder door: fills the {token} slots of one format key with the
 * runtime values (the store keeps the sentence, the widget passes the data). */
export function labelfill(key: LabelKey, values: Record<string, string>): string {
  return label(key).replace(/\{(\w+)\}/g, (match, token: string) => values[token] ?? match);
}

/** the seed ingests the manifest into the labels store, idempotent, and the
 * translated rows stay protected from the overwrite. in the browser the rows
 * ride the local cache of the app db; on the server db.ts seeds the same
 * manifest into the labels table through seedLabelRows. */
export async function seedLabels(): Promise<{ seeded: number; protected: number }> {
  const stored = readCache();
  const rows = new Map<string, LabelRow>(stored.map((row) => [row.id, row]));
  let seeded = 0;
  let saved = 0;
  for (const [id, text] of Object.entries(LABEL_MANIFEST)) {
    const row = rows.get(id);
    overrides.set(id, row && row.translated ? row.text : text);
    if (!row || (!row.translated && row.text !== text)) {
      rows.set(id, {
        id,
        text,
        revision: LABEL_REVISION,
        updatedAt: new Date().toISOString(),
        ...(row?.translated ? { translated: true } : {}),
      });
      seeded += 1;
    }
    saved += 1;
  }
  writeCache([...rows.values()]);
  return { seeded, protected: saved - seeded };
}
