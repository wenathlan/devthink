/**
 * labels.ts — the copy law of vault: every interface string lives in the
 * label store, the wingets and page anchors read through this typed accessor,
 * and a hardcoded string inside a widget is a defect. the manifest below is
 * the english source of truth extracted from the real strings of the Sol
 * wingets and the page anchors; the seed ingests it into the labels store
 * (the site db through db.ts on the server, the browser rows cache in the
 * visitor machine) and the seed never overwrites a translated row.
 *
 * the browser never imports db.ts (better-sqlite3 cannot ride the static
 * bundle): the type comes across erased, the browser seed mirrors the rows
 * into the local cache the way onboardingstate.ts mirrors the seen flags.
 *
 * data stays data: bucket names, object paths, mime families, byte sizes,
 * digests, channel kinds, tick labels, seed numbers and the storage
 * contract values keep flowing from the engine tables (objects.ts,
 * buckets.ts, retention.ts, storage.ts) and the code tokens stay literal;
 * the prose and the affordances around them ride here.
 */

import type { LabelRow } from "./db";

/** the label revision of the manifest: bump on every copy wave so the seed
 * refreshes the store rows of the changed strings. */
export const LABEL_REVISION = 3;

/** the english manifest: the page.widget.key path answers the surface text.
 * every entry is the verbatim string the wingets and page anchors rendered
 * before the copy wave — zero invented copy. */
export const LABEL_MANIFEST = {
  // the app boundary (App.tsx, the boot anchor)
  "app.boundary.body": "vault could not render this page frame.",
  "app.boundary.reload": "reload the page",
  // the window shell widget (the one chrome of the application)
  "shell.window.aria": "vault window",
  "ShellBrand": "vault",
  "shell.role": "the family vault",
  "shell.caption.minimize": "Minimize vault",
  "shell.caption.maximize": "Maximize vault",
  "shell.caption.restore": "Restore vault",
  "shell.caption.close": "Close vault",
  "shell.rail.aria": "Pages",
  "shell.rail.head": "pages",
  "shell.rail.home": "home",
  "shell.rail.homeDetail": "the staging surface of the vault",
  "shell.rail.objects": "objects",
  "shell.rail.objectsDetail": "the sealed inventory and its census",
  "shell.rail.buckets": "buckets",
  "shell.rail.bucketsDetail": "the retention shelf and its drawers",
  "shell.rail.retention": "retention",
  "shell.rail.retentionDetail": "the clock of the safe and the sweep plan",
  "shell.family.head": "family",
  "shell.family.tip": "open {slug} — the family answers both ways",
  "shell.theme.aria": "toggle theme",
  "shell.chip.restoreAria": "Restore the vault window",
  // the home page anchor (the staging landing)
  "home.eyebrow": "vault · the family vault — only stores",
  "home.title": "the family keeps its state here.",
  "home.lede":
    "one deployable clone of storage keeps every site database and receives every data backup — nothing executes inside the safe.",
  "home.deposit.aria": "deposit an artifact into the vault",
  "home.deposit.label": "deposit an artifact",
  "home.deposit.placeholder": "/sites/state.db application/x-sqlite3 48211046",
  "home.deposit.inputAria": "artifact line: path, mime and size",
  "home.deposit.seal": "seal",
  "home.deposit.kinds": "artifact kinds — the real families of the storage contract",
  "home.readout.pointer":
    "lfs pointer accepted — oid sha256:{oid}… · size {size} b · rides the lfs channel · digest sha-256 (64 hex)",
  "home.readout.hint": "not a deposit yet — name it as: path · mime · size (or paste a git-lfs pointer)",
  "home.readout.sealed": "sealed for the {mode} channel — {path} · {mime} · {size} b · {why} · digest {digest}",
  "home.readout.whyLfs": "binary master or over the 1,000,000-byte threshold",
  "home.readout.whyBlob": "small text-like row under the threshold",
  "home.door.aria": "the vault door of the family safe",
  "home.door.caption": "the vault door — one dial, eight bolts, sealed",
  "home.facts.channels": "channels",
  "home.facts.digests": "digests",
  "home.facts.sizes": "sizes",
  "home.channel.lfs.name": "lfs masters",
  "home.channel.lfs.note": "binary masters and any row over the threshold ride the lfs objects — sha-256 sealed, 64-bit pointers.",
  "home.channel.blobs.name": "in-db blobs",
  "home.channel.blobs.note": "small text-like rows ride the git objects inside the self-hosted database — sha-1 oid.",
  "home.channel.pointers.name": "lfs pointers",
  "home.channel.pointers.note": "version · oid sha-256 · size — the three-line pointer, cataloged beside the bytes.",
  "home.channel.records.name": "storage records",
  "home.channel.records.note": "id · path · mime · size · digest — five checks before a record is served.",
  "home.ledger.eyebrow": "the vault ledger",
  "home.ledger.title": "what the safe keeps",
  "home.ledger.lede":
    "no artifact rows are served by the staging surface yet — the ledger presents the storage contract itself, channel by channel.",
  "home.ledger.caption": "the storage channels of the vault — kind, sealed size and status",
  "home.table.channel": "channel",
  "home.table.kind": "kind",
  "home.table.sealed": "sealed",
  "home.table.status": "status",
  "home.steps.seal.title": "seal",
  "home.steps.seal.text": "every artifact is named, measured and digested before the door closes.",
  "home.steps.store.title": "store",
  "home.steps.store.text": "the row rides its channel — lfs for the masters, the in-db git objects for the small.",
  "home.steps.attest.title": "attest",
  "home.steps.attest.text": "the record answers for itself: path, mime, size and digest.",
  "home.jobs.eyebrow": "the three jobs",
  "home.jobs.db.title": "every site database",
  "home.jobs.db.text": "vault keeps the databases of the whole family: one deployable clone of storage where every site state lives.",
  "home.jobs.backups.title": "the data backups",
  "home.jobs.backups.text":
    "backups ride the same house tree — the network stores its recoverable copies here, beside the state they protect.",
  "home.jobs.tree.title": "one house tree",
  "home.jobs.tree.text":
    "one folder per application, no src/: the loose logics, the docs, the tests and the Sol theme under the same roof.",
  "home.jobs.footnote": "the house tree keeps every state recoverable — nothing executes inside the vault.",
  "home.family.aria": "the DevThink family",
  "home.family.head": "the family",
  "home.family.tip": "open {slug} — a family application",
  "home.quad.store": "store",
  "home.quad.storeText": "two channels, one threshold — lfs for the masters, blobs for the small.",
  "home.quad.guard": "guard",
  "home.quad.guardText": "sha-256 and sha-1 digests attest every sealed byte.",
  "home.quad.recover": "recover",
  "home.quad.recoverText": "backups ride the same house tree, beside the state they protect.",
  "home.quad.family": "family",
  "home.quad.familyLink": "the devthink family",
  // the entry widget (the live boot readout of the staging vault)
  "home.entry.state": "staging",
  "home.entry.body": "storage staged — the application tree lands here",
  "home.entry.fallback": "vault · the devthink family",
  // the tabs widget (the anchor pills of the staging surface)
  "home.tabs.aria": "vault surface sections",
  "home.tabs.safe": "the safe",
  "home.tabs.family": "the family",
  // the objects page anchor (the sealed inventory)
  "objects.eyebrow": "objects · the sealed inventory",
  "objects.title": "Objects",
  "objects.lede":
    "A seeded rehearsal of the safe — seed {seed}, {count} rows sealed under the real storage contract. The deposit line rides the same rules the family serves; nothing here claims live bytes.",
  "objects.action.reseed": "reseed the rehearsal",
  "objects.action.restore": "restore the ledger",
  "objects.census.aria": "the census of the safe",
  "objects.census.rows": "rows sealed",
  "objects.census.bytes": "bytes under seal",
  "objects.census.channels": "channels",
  "objects.census.lfs": "{rows} lfs · {bytes}",
  "objects.census.blob": "{rows} blob · {bytes}",
  "objects.census.biggest": "biggest under seal",
  "objects.form.aria": "seal a deposit",
  "objects.form.head": "seal a deposit — path · mime · size",
  "objects.form.pathPlaceholder": "/sites/state.db",
  "objects.form.pathAria": "the absolute path of the deposit",
  "objects.form.mimePlaceholder": "application/x-sqlite3",
  "objects.form.mimeAria": "the mime type of the deposit",
  "objects.form.sizePlaceholder": "48211046",
  "objects.form.sizeAria": "the byte size of the deposit",
  "objects.form.seal": "seal it",
  "objects.form.bucketsAria": "the bucket the deposit rides",
  "objects.form.readout":
    "rides the {channel} channel — {why} · digest {digest} · the row must pass the five checks of storageRecordValid",
  "objects.empty.title": "the shelf holds nothing here",
  "objects.empty.all": "The safe stands empty — reseed the rehearsal to seal the ledger again.",
  "objects.empty.bucket": "No object rides the {bucket} bucket — seal a deposit into it or pick another bucket.",
  "objects.empty.action": "reseed the rehearsal vault",
  "objects.ledger.aria": "the sealed ledger",
  "objects.ledger.object": "object",
  "objects.ledger.channel": "channel",
  "objects.ledger.size": "size",
  "objects.ledger.digest": "digest",
  "objects.ledger.seal": "seal",
  "objects.row.digestAria": "digest {digest}",
  "objects.seal.intact": "sealed",
  "objects.seal.broken": "broken",
  "objects.footnote":
    "the channels split at the 1,000,000-byte threshold — lfs carries the masters with a three-line pointer, the small text-like rows ride the in-db git objects.",
  // the buckets page anchor (the retention shelf)
  "buckets.eyebrow": "buckets · the retention shelf",
  "buckets.title": "Buckets",
  "buckets.lede":
    "{groups} groups hold the rehearsal vault — seed {seed}, {bytes} under seal. Every bucket answers with its policy and its rollup; the drawer lists the rows it keeps.",
  "buckets.action.reseed": "reseed the shelf",
  "buckets.action.restore": "restore the policies",
  "buckets.card.rows": "{count} rows",
  "buckets.card.shareAria": "lfs share {share} percent",
  "buckets.shelf.aria": "the bucket shelf",
  "buckets.empty.shelfTitle": "the shelf stands empty",
  "buckets.empty.shelfLine": "No bucket holds a row of the rehearsal — restore the ledger on /objects to fill the shelf again.",
  "buckets.empty.drawerTitle": "the {bucket} bucket keeps nothing",
  "buckets.empty.drawerLine": "The policy holds, the rows do not — seal a deposit into this bucket on /objects.",
  "buckets.drawer.aria": "the objects of the {bucket} bucket",
  "buckets.drawer.head": "{bucket} · {rows} rows · {bytes}",
  "buckets.footnote": "pick a bucket to open its drawer — the policy and the rollup answer first.",
  // the retention page anchor (the clock of the safe)
  "retention.eyebrow": "retention · the clock of the safe",
  "retention.title": "Retention",
  "retention.lede":
    "One tick of the vault is one day of rehearsal time — the clock now rides {tick}. The vault answers the verdicts and the sweep PLAN; the rehearsal never deletes a byte.",
  "retention.action.roll": "roll the clock +{step}d",
  "retention.action.restore": "restore the rehearsal",
  "retention.action.reseed": "reseed seed {seed}",
  "retention.summary.aria": "the retention summary",
  "retention.summary.clock": "the clock",
  "retention.summary.window": "inside the window",
  "retention.summary.sealed": "{count} sealed",
  "retention.summary.forever": "forever rows",
  "retention.summary.protected": "{count} protected",
  "retention.summary.sweep": "the sweep would collect",
  "retention.summary.plan": "{rows} rows · {bytes}",
  "retention.timeline.aria": "the retention timeline of the shelf",
  "retention.timeline.head": "the shelf policies — window days per bucket",
  "retention.rung.aria": "{bucket}: {label}",
  "retention.timeline.fact":
    "the first window expires at {first} · the far end of the shelf rides {horizon} · the ladder bar reads against a 365-day scale (forever fills it — labeled, never colored alone)",
  "retention.tick.never": "never",
  "retention.tick.forever": "forever",
  "retention.empty.title": "the clock reads an empty vault",
  "retention.empty.line": "No row rides the ledger — restore the rehearsal to set the clock against real objects.",
  "retention.empty.action": "restore the rehearsal vault",
  "retention.ledger.aria": "the retention verdicts",
  "retention.ledger.object": "object",
  "retention.ledger.state": "state",
  "retention.ledger.age": "age",
  "retention.ledger.why": "why",
  "retention.row.meta": "{bucket} · sealed at {tick}",
  "retention.row.age": "age {days}d",
  "retention.footnote":
    "the sweep is a plan, never an action — {rows} rows · {bytes} would leave the safe at {tick}, and the rehearsal keeps every byte of them.",
  // the intro page anchor (the splash)
  "intro.aria": "vault is opening",
  "intro.name": "vault",
  "intro.role": "vault guards the state of the family.",
  "intro.skip": "click or press any key to continue",
  // the notfound page anchor (the empty address)
  "notfound.eyebrow": "404 · the address guards nothing",
  "notfound.title": "Nothing is sealed at this address",
  "notfound.lede":
    "The store answers: no object, bucket or ledger row lives on this path. The safe itself is unharmed — walk back to a real surface of the vault.",
  "notfound.objects": "the sealed inventory",
  "notfound.objectsAria": "open the sealed inventory",
  "notfound.buckets": "the retention shelf",
  "notfound.bucketsAria": "open the retention shelf",
  // the onboarding page anchor (the first-run walk)
  "onboarding.aria": "vault onboarding",
  "onboarding.eyebrow": "vault onboarding",
  "onboarding.skip": "skip",
  "onboarding.meterAria": "step {step} of {total}",
  "onboarding.steps.is.title": "what it is",
  "onboarding.steps.is.text":
    "vault is the storage application of the devthink family — one deployable clone that exists to hold state, in the same window tree as every other application of the house.",
  "onboarding.steps.does.title": "what it does",
  "onboarding.steps.does.text":
    "it guards the family databases, receives the data backups and hands out the unified store. nothing executes here: vault only keeps, serves and recovers.",
  "onboarding.steps.enter.title": "enter",
  "onboarding.steps.enter.text":
    "the window ahead is the staging surface — the dashboard of the guarded databases, the backups and the unified store. the enter button opens the vault.",
  "onboarding.back": "back",
  "onboarding.next": "next",
  "onboarding.enterCta": "enter vault",
} as const;

export type LabelKey = keyof typeof LABEL_MANIFEST & string;

/** the translation overrides the runtime loads from the store at boot: the
 * key answers the translated text when the person changed the language. */
const overrides = new Map<string, string>();

/** the browser cache of the labels table: the rows mirror the site db (the
 * db is the source of truth; the cache carries the translated rows offline —
 * the onboardingstate.ts precedent for the visitor machine). */
const CACHE_KEY = "vault.labels.rows";

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
 * ride the local cache of the site db; on the server db.ts seeds the same
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
