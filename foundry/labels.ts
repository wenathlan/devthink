/**
 * labels.ts — the copy law of foundry: every interface string lives in the
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

import { createLabelStore } from "@wenathlan/vault/labelstore";


/** the label revision of the manifest: bump on every copy wave so the seed
 * refreshes the store rows of the changed strings. */
export const LABEL_REVISION = 3;

/** the english manifest: the page.widget.key path answers the surface text.
 * every entry is the verbatim string the wingets and page anchors rendered
 * before the copy wave — zero invented copy. data stays data: sandbox names
 * and images, herd sizes, clone formats, seeds, checksums and pipeline steps
 * keep flowing from the engine tables; the prose around them rides here. */
export const LABEL_MANIFEST = {
  // the app boundary (App.tsx, the boot anchor)
  "app.boundary.body": "foundry could not render this page frame.",
  "app.boundary.reload": "reload the page",
  // the shared rail labels of the window rail (the shell, the onboarding copy)
  "nav.home": "home",
  "nav.sandboxes": "sandboxes",
  "nav.images": "images",
  "nav.artifacts": "artifacts",
  "nav.homeDetail": "the landing of the foundry",
  "nav.sandboxesDetail": "the herd on the cold → warm → hot ladder",
  "nav.imagesDetail": "the herd shelf and the conversion plans",
  "nav.artifactsDetail": "the packaging line with sealed checksums",
  // the application window chrome (the shell)
  "shell.theme.tip": "toggle theme",
  "shell.chip.restoreAria": "Restore the foundry window",
  "ShellBrand": "foundry",
  "shell.window.aria": "foundry window",
  "shell.title.role": "the machine room of the family",
  "shell.controls.minimize": "Minimize foundry",
  "shell.controls.restore": "Restore foundry",
  "shell.controls.maximize": "Maximize foundry",
  "shell.controls.close": "Close foundry",
  "shell.rail.aria": "foundry pages",
  "shell.rail.head": "pages",
  "shell.family.head": "family",
  "shell.family.tip": "{slug} — the family application beside the foundry",
  "shell.family.openAria": "open {slug} — the family application beside the foundry",
  // the entry widget of the home page (the live boot readout)
  "home.entry.state": "staging",
  "home.entry.body": "the floor is staged — the herd shelf lists the clone formats",
  "home.entry.note": "foundry · the devthink family",
  // the jump links of the home page (the anchor chips)
  "home.tabs.aria": "foundry surface sections",
  "home.tabs.floor": "the herd floor",
  "home.tabs.family": "the family",
  // the home page anchor (the landing) — the hero
  "home.hero.aria": "foundry — the foundry of clone herds",
  "home.hero.eyebrow": "foundry · runs and stores",
  "home.hero.title": "One floor. Every herd.",
  "home.hero.lede":
    "the foundry of clone herds — the working set of the family runs here and stays stored as .tzst, .tar.gz and .tar.xz clones.",
  // the forge console (the prompt field of the landing)
  "home.forge.aria": "the forge console and the herd shelf",
  "home.forge.head": "the forge · name a herd, pick the clone format",
  "home.forge.placeholder": "forge a clone — name the herd",
  "home.forge.inputAria": "name the herd to clone",
  "home.forge.key": "forge",
  "home.forge.legend": "clone format",
  "home.forge.unnamed": "unnamed herd",
  "home.forge.readout": "{state} · {name}{ext}",
  "home.forge.readoutStamped": "draft stamped",
  "home.forge.readoutDraft": "herd draft",
  // the herd shelf of the landing (the clone formats the store keeps)
  "home.format.tzstHerd": "the quick herd",
  "home.format.tzstLine": "tar over zstd — the herd that clones fast",
  "home.format.tzstState": "lead herd",
  "home.format.targzHerd": "the pack herd",
  "home.format.targzLine": "tar over gzip — the herd that opens anywhere",
  "home.format.tarxzHerd": "the release herd",
  "home.format.tarxzLine": "tar over xz — the family releases travel as tar.xz",
  "home.format.stateKept": "kept",
  "home.shelf.head": "the herd shelf · the clone formats the store keeps",
  "home.shelf.note": "no herd is stored on this staging surface yet — the shelf lists the clone formats, not herds.",
  // the capability steps of the landing (run · store · clone)
  "home.step.runTitle": "run",
  "home.step.runText": "the forge pours the images and the sandboxes rise working.",
  "home.step.storeTitle": "store",
  "home.step.storeText": "the vault shelf keeps every record the floor makes.",
  "home.step.cloneTitle": "clone",
  "home.step.cloneText": "the working set travels as .tzst, .tar.gz and .tar.xz clones.",
  // the family row of the landing footer
  "home.family.aria": "the DevThink family",
  "home.family.head": "the family",
  "home.family.openAria": "open {slug} — a family application",
  // the footer meta-quad of the landing
  "home.quad.foundryHead": "foundry",
  "home.quad.foundryText": "the family foundry — runs the floor and stores the herds.",
  "home.quad.storeHead": "the store",
  "home.quad.storeText": "clone archives kept as .tzst · .tar.gz · .tar.xz.",
  "home.quad.floorHead": "the floor",
  "home.quad.floorText": "the platform answers on /sandboxes · /images · /artifacts.",
  "home.quad.familyHead": "the family",
  "home.quad.familyText": "nine apps share the sandbox — foundry keeps their working set.",
  // the sandboxes page anchor (the machine room)
  "sand.eyebrow": "sandboxes · the machine room",
  "sand.title": "Sandboxes",
  "sand.lede":
    "The herd rides the cold → warm → hot ladder — cold waits built, warm keeps its working set, hot executes. A seeded rehearsal (seed {seed}) fills the room; the buttons drive the real state machine and the machine refuses what it does not do.",
  "sand.reseed": "reseed the herd",
  // the sandbox states of the herd rows
  "sand.state.cold": "cold",
  "sand.state.warm": "warm",
  "sand.state.hot": "hot",
  // the herd census band
  "sand.census.aria": "the herd census",
  "sand.census.sandboxes": "sandboxes",
  "sand.census.ladder": "the state ladder",
  "sand.census.warmShare": "warm share",
  // the sandbox row (the state, the facts, the machine buttons)
  "sand.row.facts": "boots {boots} · steps {steps}",
  "sand.act.warm": "warm",
  "sand.act.warmAria": "warm {name}",
  "sand.act.heat": "heat",
  "sand.act.heatAria": "heat {name}",
  "sand.act.cool": "cool",
  "sand.act.coolAria": "cool {name}",
  "sand.act.freeze": "freeze",
  "sand.act.freezeAria": "freeze {name}",
  "sand.act.step": "step",
  "sand.act.stepAria": "run one step on {name}",
  // the machine readout (the refusal and the honest answer)
  "sand.refused": "the machine refuses: {why}",
  "sand.answered": "the machine answers — every move rides the cold → warm → hot ladder",
  // the empty state of the sandboxes page
  "sand.empty.title": "the machine room stands empty",
  "sand.empty.line": "No sandbox is herded right now — reseed the rehearsal to fill the room again.",
  "sand.empty.action": "herd the rehearsal again",
  // the herd table of the sandboxes page
  "sand.herd.aria": "the sandbox herd",
  "sand.head.sandbox": "sandbox",
  "sand.head.state": "state",
  "sand.head.machine": "the machine",
  // the footnote of the sandboxes page
  "sand.footnote":
    "the machine allows cold → warm → hot and the cooling paths back — a cold sandbox never executes and a hot one is already executing. states: {list}.",
  // the images page anchor (the herd shelf)
  "images.eyebrow": "images · the herd shelf",
  "images.title": "Herd shelf",
  "images.lede":
    "The herd travels in three formats — .tzst clones fast, .tar.gz opens anywhere, .tar.xz rides the releases. A seeded rehearsal (seed {seed}) fills the shelf; the conversion plan below is the real floor logic.",
  "images.reseed": "reseed the shelf",
  // the shelf row metrics
  "images.metric.tar": "tar stream",
  "images.metric.sealed": "sealed est.",
  // the conversion plan (from · to, the honest steps)
  "images.plan.aria": "the conversion plan",
  "images.plan.head": "the conversion plan",
  "images.plan.fromAria": "convert from format",
  "images.plan.from": "from",
  "images.plan.toAria": "convert to format",
  "images.plan.to": "to",
  "images.plan.note": "estimates on a 1 GB tar stream: {list}",
  // the empty state of the images page
  "images.empty.title": "the shelf stands empty",
  "images.empty.line": "No image is shelved right now — reseed the rehearsal to pour the herds again.",
  "images.empty.action": "pour the rehearsal shelf",
  // the image shelf table
  "images.shelf.aria": "the image shelf",
  "images.head.image": "image",
  "images.head.format": "format",
  "images.head.sizes": "sizes",
  // the footnote of the images page
  "images.footnote": "pour order: {list} — the lead herd clones fast, the release herd rides small.",
  // the artifacts page anchor (the packaging line)
  "artifacts.eyebrow": "artifacts · the packaging line",
  "artifacts.title": "Artifacts",
  "artifacts.lede":
    "Every packaged artifact carries its checksum — fnv-1a over the canonical identity (name · ext · bytes · payload), sealed once and re-verified on sight. A seeded rehearsal (seed {seed}) fills the line.",
  "artifacts.walk": "walk the pipeline",
  "artifacts.rerun": "rerun the line",
  "artifacts.unnamed": "unnamed-artifact",
  // the artifact row (the seal verdict)
  "artifacts.row.bytes": "{bytes} b",
  "artifacts.row.checksumTip": "fnv-1a over: {identity}",
  "artifacts.row.checksumAria": "checksum {checksum}, fnv-1a over {identity}",
  "artifacts.row.sealed": "sealed",
  "artifacts.row.mismatch": "mismatch",
  // the line summary cells
  "artifacts.summary.aria": "the line summary",
  "artifacts.summary.count": "artifacts",
  "artifacts.summary.allSealed": "all sealed",
  "artifacts.summary.yes": "yes",
  "artifacts.summary.no": "no",
  "artifacts.summary.digest": "digest",
  "artifacts.summary.digestValue": "fnv-1a · 8 hex",
  "artifacts.summary.identity": "identity string",
  "artifacts.summary.identityValue": "name · ext · bytes · payload",
  // the seal-a-draft form
  "artifacts.form.aria": "seal a draft artifact",
  "artifacts.form.head": "seal a draft",
  "artifacts.form.name": "name",
  "artifacts.form.namePlaceholder": "my-herd",
  "artifacts.form.nameAria": "name of the artifact",
  "artifacts.form.payload": "payload digest (any string)",
  "artifacts.form.payloadPlaceholder": "rev-2026-02-14",
  "artifacts.form.payloadAria": "payload string of the artifact",
  "artifacts.form.submit": "seal it",
  "artifacts.form.preview": "{name}.tzst · {bytes} b",
  "artifacts.form.hint": "the draft seals as {preview} · fnv-1a {digest}",
  // the empty state of the artifacts page
  "artifacts.empty.title": "the packaging line is clear",
  "artifacts.empty.line": "No artifact is sealed right now — rerun the line or seal a draft above.",
  "artifacts.empty.action": "rerun the packaging line",
  // the packaging line table and the manifest
  "artifacts.line.aria": "the packaging line",
  "artifacts.head.artifact": "artifact",
  "artifacts.head.bytes": "bytes",
  "artifacts.head.checksum": "checksum",
  "artifacts.head.seal": "seal",
  "artifacts.manifest.aria": "the manifest of the line",
  "artifacts.footnote": "{line} — the manifest renders the same line.",
  // the stage graph widget (the pipeline plan drawn as nodes and wires)
  "artifacts.plan.state.pending": "pending",
  "artifacts.plan.state.running": "running",
  "artifacts.plan.state.done": "done",
  "artifacts.plan.state.failed": "failed",
  "artifacts.plan.state.skipped": "skipped",
  "artifacts.plan.tip.pending": "the stage waits for its turn in the ride order",
  "artifacts.plan.tip.running": "the stage runs now — the windows accent marks the live stage",
  "artifacts.plan.tip.done": "the stage settled — its output already rides the line",
  "artifacts.plan.tip.failed": "the stage rode red — the failure keeps its record on the plan",
  "artifacts.plan.tip.skipped": "the stage was stranded by an earlier red rung",
  "artifacts.plan.nodeTitle": "{no} · {label} — {note} ({state})",
  "artifacts.plan.graphAria":
    "the pipeline plan graph: {steps} steps across {stages} stages, {done} done, {running} running, {failed} failed",
  "artifacts.plan.aria": "the pipeline plan stage graph",
  "artifacts.plan.eyebrow": "the pipeline plan · {id} · {stages} stages",
  "artifacts.plan.progressTip": "the done share of the plan rides at {progress} percent",
  "artifacts.plan.tallyAria": "the plan state tally",
  "artifacts.plan.stagesAria": "the plan stages in ride order",
  "artifacts.plan.stepTip": "{note} — {state}",
  "artifacts.plan.srStep": "{no}. {label} ({kind}): {note}",
  // the notfound page anchor (the 404 dead address)
  "notfound.eyebrow": "404",
  "notfound.lede": "This address neither stores nor executes in the foundry.",
  // the intro page anchor (the splash)
  "intro.aria": "foundry is opening",
  "intro.name": "foundry",
  "intro.line": "foundry runs and stores the working set of the family.",
  "intro.skip": "click or press any key to continue",
  // the onboarding page anchor (the first-run frames)
  "onboarding.aria": "foundry onboarding",
  "onboarding.eyebrow": "foundry onboarding",
  "onboarding.steps.is": "what it is",
  "onboarding.steps.isText":
    "foundry is the pipeline application of the devthink family — the working set stored and executed together, the vault layer beside the forge layer in one unit.",
  "onboarding.steps.does": "what it does",
  "onboarding.steps.doesText":
    "it drives the sandboxes and shapes the images while keeping the records of both. the sandbox comes from the family: foundry runs and stores at once.",
  "onboarding.steps.enter": "enter",
  "onboarding.steps.enterText":
    "the window ahead is the herd floor — the forge console, the shelf and the records of the family. the enter button opens the pipeline.",
  "onboarding.meterAria": "step {no} of {total}",
  "onboarding.skip": "skip",
  "onboarding.back": "back",
  "onboarding.next": "next",
  "onboarding.enterCta": "enter foundry",
} as const;

export type LabelKey = keyof typeof LABEL_MANIFEST & string;

/** the store mechanism rides the vault factory (the storage law of the
 * family: the vault owns the store, the app owns the manifest — the
 * mechanism is imported, never duplicated). the cache key keeps the browser mirror the wingets already read. */
const store = createLabelStore({
  manifest: LABEL_MANIFEST,
  revision: LABEL_REVISION,
  cacheKey: "foundry.labels.rows",
});

/** the typed accessor of the copy: the only door a widget or page anchor uses. */
export function label(key: LabelKey): string {
  return store.label(key);
}

/** the placeholder door: fills the {token} slots of one format key with the
 * runtime values (the store keeps the sentence, the widget passes the data). */
export function labelfill(key: LabelKey, values: Record<string, string>): string {
  return store.labelfill(key, values);
}

/** the seed ingests the manifest into the labels store, idempotent, and the
 * translated rows stay protected from the overwrite. in the browser the rows
 * ride the local cache of the site db; on the server db.ts seeds the same
 * manifest into the labels table through seedLabelRows. */
export function seedLabels(): Promise<{ seeded: number; protected: number }> {
  return store.seedLabels();
}
