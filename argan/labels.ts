/**
 * labels.ts — the copy law of argan: every interface string lives in the
 * label store, the widgets and page anchors read through this typed accessor,
 * and a hardcoded string inside a widget is a defect. the manifest below is
 * the english source of truth extracted from the real strings of the Sol
 * widgets and the page anchors; the seed ingests it into the labels store
 * (the site db through db.ts on the server, the browser rows cache in the
 * visitor machine) and the seed never overwrites a translated row.
 *
 * the browser never imports db.ts (better-sqlite3 cannot ride the static
 * bundle): the type comes across erased, the browser seed mirrors the rows
 * into the local cache the way onboardingstate.ts mirrors the seen flags.
 *
 * data stays data: zone origins, serials, record names, types and values,
 * transports, ports, states, algorithms, step ordinals, section numbers and
 * the dig protocol values keep flowing from the engine tables and the code
 * tokens (module identifiers, spec formats) stay literal; the prose and the
 * affordances around them ride here.
 */

import type { LabelRow } from "./db";

/** the label revision of the manifest: bump on every copy wave so the seed
 * refreshes the store rows of the changed strings. */
export const LABEL_REVISION = 1;

/** the english manifest: the page.widget.key path answers the surface text.
 * every entry is the verbatim string the widgets and page anchors rendered
 * before the copy wave — zero invented copy. */
export const LABEL_MANIFEST = {
  // the shared nav labels of the footer links (every page anchor)
  "nav.home": "Home",
  "nav.zones": "Zones",
  "nav.dnssec": "DNSSEC",
  "nav.gateway": "Gateway",
  "nav.settings": "Settings",
  // the app boundary (App.tsx, the boot anchor)
  "app.boundary.body": "argan could not render this page frame.",
  "app.boundary.reload": "reload the page",
  // the window shell widget (the one chrome of the application)
  "shell.window.aria": "argan",
  "shell.brand": "argan",
  "shell.role": "dns and zones of the family",
  "shell.caption.minimize": "Minimize",
  "shell.caption.maximize": "Maximize",
  "shell.caption.restore": "Restore",
  "shell.caption.close": "Close",
  "shell.rail.aria": "Pages",
  "shell.rail.head": "pages",
  "shell.rail.home": "home",
  "shell.rail.homeDetail": "the dns and zones home of the family",
  "shell.rail.zones": "zones",
  "shell.rail.zonesDetail": "the zone table and the publication flow",
  "shell.rail.dnssec": "dnssec",
  "shell.rail.dnssecDetail": "the signing pipeline and the rollover",
  "shell.rail.gateway": "gateway",
  "shell.rail.gatewayDetail": "the dns transports, doh-first",
  "shell.rail.settings": "settings",
  "shell.rail.settingsDetail": "appearance and clean urls",
  "shell.family.head": "family",
  "shell.family.aria": "the family apps",
  "shell.family.tip": "open {slug} in its own deploy",
  "shell.theme.aria": "toggle theme",
  "shell.chip.restoreAria": "Restore argan",
  // the empty-state widget of the argan window
  "widget.emptystate.loading": "loading — the rows are still on their way",
  // the home page anchor (the landing)
  "home.cta": "Get started",
  "home.brand": "argan",
  "home.hero.role": "dns & gateway of the family",
  "home.hero.title": "Names that resolve.",
  "home.hero.ledeLead": "Authoritative zones and a real DNSSEC pipeline on the ",
  "home.hero.ledeTail": " apex — published to the world through ordinary DNS. No plugin, nothing on the visitor's side.",
  "home.dig.mark": "$",
  "home.hero.placeholder": "dig {apex} MX",
  "home.hero.inputAria": "Resolve a name against the apex snapshot",
  "home.hero.resolve": "resolve",
  "home.dig.legend": "record type",
  "home.dig.idle": ";; try the apex — every answer below resolves from the served snapshot",
  "home.dig.query": ";; QUERY {name} IN {type}",
  "home.dig.answerTail": "IN {type} {data}",
  "home.dig.nodata": ";; the name exists — no {type} records ride it",
  "home.dig.nxdomain": ";; the name is not in the served apex snapshot",
  "home.dig.status": ";; status: {status} · zone {apex} · serial {serial}{ttl}",
  "home.hero.meta": "{zones} zones · {transports} transports · {records} apex records · serials YYYYMMDDNN",
  "home.zones.title": "Zones under management",
  "home.zones.aside": "{count} zones · staging snapshot",
  "home.zones.noteLead": "Masters written by the pipeline, secondaries pulled by authenticated transfer — serials follow ",
  "home.zones.noteTail": ".",
  "home.zones.link": "open the zones console →",
  "home.library.title": "One library, four jobs",
  "home.library.note": "Every site in the family consumes argan by configuration — no fixed address, port or credential in code.",
  "home.flow.title": "A label becomes a live URL",
  "home.flow.note": "The pending-publication flow — a typed label never skips a stage.",
  "home.flow.more": "+{count} more in the console — {list} ·",
  "home.flow.link": "the zones console →",
  "home.cta.aria": "anchor a name on the apex",
  "home.cta.title": "Anchor a name on the apex",
  "home.cta.command": "npm install --global @devthink/argan && argan publish --label mysite --zone {apex}",
  "home.cta.pipeline": "See the signing pipeline",
  "home.foot.console": "console",
  "home.foot.apex": "the apex",
  "home.foot.nameservers": "ns1 · ns2.{apex}",
  "home.foot.wildcard": "* → the same edge (hung model)",
  "home.foot.publication": "publication",
  "home.foot.stack": "the stack",
  "home.foot.family": "the devthink family",
  "home.foot.familyTip": "open {slug} in its own deploy",
  "home.foot.base": "argan — dns and gateway of the devthink os family",
  "home.foot.domain": "argan.devthink.pro",
  // the zones page anchor (the working console)
  "zones.eyebrow": "argan · zones",
  "zones.title": "Every name lives in a zone.",
  "zones.lede": "Masters written by the pipeline, secondaries pulled by authenticated transfer, serials bumped on every republication.",
  "zones.ledger.title": "Zones under management",
  "zones.ledger.count": "{count} zones",
  "zones.ledger.noteLead": "Snapshot of the staging cluster — serials follow ",
  "zones.ledger.noteTail": ", date plus revision of the day. The row with the newest serial carries the pulse — the last republication of the snapshot.",
  "zones.empty.ledger": "the zone table answered no rows — the catalog is still loading or the staging cluster is offline",
  "zones.table.zone": "zone",
  "zones.table.type": "type",
  "zones.table.serial": "serial",
  "zones.table.status": "status",
  "zones.rail.hung": "pending publication · the hung model",
  "zones.rail.hungLead": "A label stays ",
  "zones.rail.hungMid": " until the flow completes. Subdomains hang from the bought apex with a wildcard record to the same edge — stock DNS resolves it, the vhost is picked by ",
  "zones.rail.hungTail": " header.",
  "zones.rail.flow": "the flow · five moves",
  "zones.records.title": "What the apex serves today",
  "zones.records.count": "{count} records",
  "zones.empty.records": "the apex record set arrived empty — the snapshot has no records to rule yet",
  "zones.file.summary": "zone file — verbatim",
  // the dnssec page anchor (the signing console)
  "dnssec.eyebrow": "argan · dnssec",
  "dnssec.title": "Signed on day one.",
  "dnssec.lede": "Real signatures, real validation, no opt-in — build, test and hash happen in CI, and the signed zone is what gets served.",
  "dnssec.keys.title": "KSK signs keys, ZSK signs zones",
  "dnssec.empty.keys": "the key ledger answered no rows — the signing pipeline has not published keys to this snapshot yet",
  "dnssec.algorithms.aria": "signing algorithms",
  "dnssec.algorithms.title": "algorithms · new zones",
  "dnssec.digest.title": "denial & digest",
  "dnssec.digest.body": "NSEC3 with a fresh random salt on each republication; the DS handed to the parent uses the SHA-256 digest (algorithm 2).",
  "dnssec.pipeline.title": "Never hand-edit a production zone",
  "dnssec.pipeline.note":
    "Rule nd-6002 · pipeline-only — the zone file is versioned, signed and published by the pipeline with a fresh serial; the previous version stays available for instant rollback. Nobody types changes into a live zone. The terminal below rides the staging snapshot — the output shape of one sign run, never a live capture.",
  "dnssec.pipeline.empty": ";; the sign pipeline answered no output block for this snapshot",
  "dnssec.rollover.title": "Key rotation, four moves",
  "dnssec.rollover.note": "ZSK every 90 days, KSK every 360. CDS/CDNSKEY automation hands the new DS to the parent without a registrar ticket.",
  // the gateway page anchor (the transport console)
  "gateway.eyebrow": "argan · gateway",
  "gateway.title": "One endpoint, every transport.",
  "gateway.lede": "The gateway answers the same wire protocol over UDP, TCP, TLS, HTTPS and QUIC — it serves the zones argan is authoritative for and forwards the rest.",
  "gateway.transports.title": "Transports",
  "gateway.transports.count": "{count} transports",
  "gateway.transports.note": "Transport choice is a trade, not a dogma: classic is the fastest and the most visible; DoH blends into web traffic; DoQ adds privacy with zero-RTT where UDP passes.",
  "gateway.empty.transports": "the transport table answered no rows — the gateway core has not published its listeners yet",
  "gateway.table.transport": "transport",
  "gateway.table.port": "port",
  "gateway.table.spec": "spec",
  "gateway.table.status": "status",
  "gateway.doh.rule": "rule nd-6005 · doh-first",
  "gateway.doh.title": "Port 53 blocked? DoH first.",
  "gateway.blocked.title": "where 53 is blocked",
  "gateway.blocked.body": "Everything runs over DoH on plain HTTPS — indistinguishable from web traffic, crossing home, corporate and mobile firewalls. Valid public HTTPS comes from the edge with a tunnel; self-signed certificates stay in dev and on the LAN.",
  "gateway.core.title": "Gateway core, staging shape",
  "gateway.core.note": "The authoritative zone block, a privacy forwarder for the rest of the world, and the DoH listener that survives a firewalled 53.",
  "gateway.core.empty": "# the corefile block answered empty — the gateway core has not been served to this snapshot",
  // the settings page anchor (the preferences)
  "settings.eyebrow": "argan · settings",
  "settings.title": "Site preferences only.",
  "settings.lede": "Zone credentials, TSIG keys and cluster secrets never live here — they belong to the argan database on the host that runs the pipeline.",
  "settings.nav.aria": "Settings sections",
  "settings.nav.appearance": "appearance",
  "settings.nav.urls": "clean urls",
  "settings.nav.network": "network",
  "settings.appearance.title": "Appearance",
  "settings.appearance.light": "Light theme",
  "settings.appearance.lightHint": "Solar dark is the default.",
  "settings.appearance.lightAria": "Toggle light theme",
  "settings.appearance.motion": "Reduce motion",
  "settings.appearance.motionHint":
    "Stills the mark, the window entry and the fresh-serial pulse for this session — on top of the OS setting, never against it.",
  "settings.appearance.motionAria": "Toggle reduce motion",
  "settings.urls.title": "Clean URLs",
  "settings.urls.lead": "This site runs the ",
  "settings.urls.mid1": " module: hash routes, ",
  "settings.urls.mid2": ", duplicate slashes and campaign trackers (",
  "settings.urls.sep": ", ",
  "settings.urls.mid3": "…) are stripped from the address bar automatically — without reloading or polluting history.",
  "settings.urls.dirty": "Poll this URL with trackers",
  "settings.urls.clean": "Watch it clean itself",
  "settings.urls.empty": "—",
  "settings.network.title": "Network & region",
  "settings.network.resolver": "Preferred resolver",
  "settings.network.language": "Language",
  "settings.save": "Save preferences",
  "settings.toast.motionOn": "Motion reduced for this session",
  "settings.toast.motionOff": "Motion restored for this session",
  "settings.toast.cleaned": "URL cleaned — no hash, no trackers",
  "settings.toast.saved": "Preferences saved locally",
  // the intro page anchor (the splash)
  "intro.aria": "argan is opening",
  "intro.name": "argan",
  "intro.role": "dns and zones of the family",
  "intro.skip": "click or press any key to skip",
  // the notfound page anchor (the rcode 3 dead air)
  "notfound.eyebrow": "argan · rcode 3 · nxdomain",
  "notfound.title": "Name not found",
  "notfound.lede":
    "The name you asked for answered NXDOMAIN — it is not in any zone argan serves, and no wildcard caught it. Your URL bar stayed clean, by the way.",
  "notfound.backApex": "Back to the apex",
  "notfound.browseZones": "Browse the zones",
  // the onboarding page anchor (the first-run frames)
  "onboarding.aria": "argan first run",
  "onboarding.title": "welcome to argan",
  "onboarding.skip": "skip",
  "onboarding.step.eyebrow": "{no} — {step}",
  "onboarding.steps.app": "the app",
  "onboarding.steps.surfaces": "the surfaces",
  "onboarding.steps.enter": "enter",
  "onboarding.what.title": "one window, dns and zones",
  "onboarding.what.body":
    "argan is the dns and zones home of the wenathlan family — not an operating system: one application window holding the zone table, the signing pipeline and the gateway transports, all anchored on the devthink.pro apex.",
  "onboarding.hosts.title": "what the window hosts",
  "onboarding.enter.title": "ready to enter",
  "onboarding.enter.body":
    "the window opens on the home page and every surface rides the same rail. the theme starts light and stays in memory only — nothing is written to this machine.",
  "onboarding.back": "back",
  "onboarding.enterCta": "enter argan",
  "onboarding.continue": "continue",
} as const;

export type LabelKey = keyof typeof LABEL_MANIFEST & string;

/** the translation overrides the runtime loads from the store at boot: the
 * key answers the translated text when the person changed the language. */
const overrides = new Map<string, string>();

/** the browser cache of the labels table: the rows mirror the site db (the
 * db is the source of truth; the cache carries the translated rows offline —
 * the onboardingstate.ts precedent for the visitor machine). */
const CACHE_KEY = "argan.labels.rows";

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
