/**
 * labels.ts — the copy law of getry: every interface string lives in the
 * label store, the wingets and page anchors read through this typed accessor,
 * and a hardcoded string inside a widget is a defect. the manifest below is
 * the english source of truth extracted from the real strings of the Sol
 * wingets and the page anchors; the seed ingests it into the labels store
 * (the site db through db.ts on the gateway runtime, the browser rows cache
 * in the visitor machine) and the seed never overwrites a translated row.
 *
 * the browser imports db.ts through the erased type door only (the sqlite
 * mirror of db.ts rides a process guard): the seed here mirrors the rows
 * into the local cache the way onboardingstate.ts mirrors the seen flags.
 *
 * data stays data: replica tags, provider names, routes, badges, budgets,
 * session ids, key masks, token counts and the curl protocol block of the
 * quick start keep flowing from the engine tables (gateway.ts, thinking.ts,
 * sessions.ts, db.ts) and the code tokens stay literal; the prose and the
 * affordances around them ride here.
 */

import type { LabelRow } from "./db";

/** the label revision of the manifest: bump on every copy wave so the seed
 * refreshes the store rows of the changed strings. */
export const LABEL_REVISION = 2;

/** the english manifest: the page.widget.key path answers the surface text.
 * every entry is the verbatim string the wingets and page anchors rendered
 * before the copy wave — zero invented copy. */
export const LABEL_MANIFEST = {
  // the app boundary (App.tsx, the boot anchor)
  "app.boundary.body": "getry could not render this frame.",
  "app.boundary.reload": "reload the interface",
  // the window shell widget (the one chrome of the application)
  "shell.window.aria": "getry",
  "ShellBrand": "getry",
  "shell.role": "the AI gateway of the wenathlan family",
  "shell.caption.minimize": "Minimize",
  "shell.caption.maximize": "Maximize",
  "shell.caption.restore": "Restore",
  "shell.caption.close": "Close",
  "shell.rail.aria": "primary",
  "shell.rail.home": "home",
  "shell.rail.homeDetail": "the gateway surface of the family",
  "shell.rail.sessions": "sessions",
  "shell.rail.sessionsDetail": "the session store and key rotation",
  "shell.rail.thinking": "thinking",
  "shell.rail.thinkingDetail": "the 7-level reasoning ladder",
  "shell.rail.versions": "versions",
  "shell.rail.versionsDetail": "five provider gateways and their routes",
  "shell.family.aria": "the wenathlan family",
  "shell.family.tip": "{slug} — a family surface",
  "shell.family.tab": "open {slug} in its own tab",
  "shell.theme.aria": "toggle theme",
  "shell.chip.restoreAria": "Restore getry",
  // the toast widget (the dismiss affordance)
  "toast.dismiss": "dismiss",
  // the shared nav labels of the quad links
  "nav.versions": "versions",
  "nav.thinking": "thinking",
  "nav.sessions": "sessions",
  // the home page anchor (the gateway landing)
  "home.eyebrow": "getry · deployable inference gateway",
  "home.title": "many gateways, one mask",
  "home.lede":
    "getry spins five provider replicas behind the devthink meta-model — {count} OpenAI-compatible routes, pure byte passthrough, nothing on your machine.",
  "home.hero.label": "send a completion",
  "home.hero.inputAria": "gateway endpoint",
  "home.hero.send": "send",
  "home.hero.sendToast": "{endpoint} answers on the self-hosted gateway over HTTPS — this surface stores nothing",
  "home.status.unrouted": "unrouted · the replicas answer /v1 through /v{count}",
  "home.status.routed": "{v} · {provider} · /{v}/{route} · {badge}",
  "home.status.unknownRoute": "{v} · {provider} · unknown route — the replicas answer the seven kinds",
  "home.status.nameRoute": "{v} · {provider} · {badge} · name a route",
  "home.chips.replica": "replica",
  "home.chips.route": "route",
  "home.badge.live": "{count} replicas live",
  "home.badge.routes": "{count} routes",
  "home.badge.passthrough": "pure byte passthrough",
  "home.matrix.aria": "replica matrix",
  "home.matrix.title": "the replica matrix",
  "home.matrix.lede":
    "One meta model, five copies of itself: every replica serves devthink over its provider family — the mask is the product, the lane is the detail.",
  "home.table.replica": "replica",
  "home.table.serves": "serves",
  "home.table.lane": "lane",
  "home.table.routes": "routes",
  "home.table.status": "status",
  "home.matrix.featnote": "22 keys round robin",
  "home.matrix.note":
    "The paused v2 babel lane falls back to v1 zai; v4 and v5 discover their free-tag models live — zero hardcoded names anywhere.",
  "home.steps.aria": "deploy steps",
  "home.steps.deploy.title": "deploy the mirror",
  "home.steps.deploy.phrase":
    "the same self-hosted gateway serves every deploy — this site runs the same routes.",
  "home.steps.route.title": "name a route",
  "home.steps.route.phrase": "35 OpenAI-compatible endpoints answer on the self-hosted lanes — the seven kinds ride every replica.",
  "home.steps.mask.title": "ride the mask",
  "home.steps.mask.phrase":
    "the parser re-emits every chunk as devthink — reasoning deltas before content, keepalives holding the stream.",
  "home.quad.gateway": "gateway",
  "home.quad.gatewayMeta": "{replicas} replicas · {routes} routes · {live} live",
  "home.quad.thinking": "thinking",
  "home.quad.thinkingMeta": "{rungs} rungs · default {default} · {budget} token ceiling",
  "home.quad.store": "store",
  "home.quad.storeMeta": "rotation every {every} turns · keys masked at render · zero client storage",
  "home.quad.pages": "pages",
  "home.quad.domainsAria": "gateway domains",
  "home.family.aria": "the family apps",
  "home.family.head": "the devthink family",
  "home.family.tip": "open {slug} in its own deploy",
  // the sessions page anchor (the session registry)
  "sessions.eyebrow": "getry · sessions",
  "sessions.title": "sessions, keys and the chat log",
  "sessions.lede":
    "One row per session and provider carries the rotation index, the thinking budget and the context window math. The key pools rotate in round robin; the meta model rotates every six messages.",
  "sessions.stamp.never": "never",
  "sessions.toast.reload": "the store answers from the self-hosted database — reload to ask again",
  "sessions.toast.refresh": "the rows refresh from the site database on every load — nothing persists on your machine",
  "sessions.registry.aria": "session registry",
  "sessions.registry.head": "session contexts — one row per session and provider",
  "sessions.table.session": "session",
  "sessions.table.model": "model",
  "sessions.table.messages": "messages",
  "sessions.table.context": "context",
  "sessions.table.rotation": "rotation",
  "sessions.table.thinking": "thinking",
  "sessions.table.last": "last message",
  "sessions.think.default": "default",
  "sessions.think.off": "off",
  "sessions.empty.sessions":
    "the session store answered no rows — the self-hosted DB is offline and this static build carries no seeds for it",
  "sessions.action.store": "ask the store again",
  "sessions.loading.sessions": "loading the session store…",
  "sessions.rail.rotation": "rotation",
  "sessions.rail.activeKeys": "active keys",
  "sessions.rail.inRotation": "in rotation",
  "sessions.rail.erroring": "erroring",
  "sessions.rail.metaTurns": "meta model turns",
  "sessions.rail.everySix": "every 6",
  "sessions.rail.foot":
    "The real keys live in the environment of the self-hosted deploy — this surface only ever renders the masked answers.",
  "sessions.rail.keys": "provider keys",
  "sessions.empty.keys": "the key pool answered no rows — the /v1/keys lane of the self-hosted DB is not answering",
  "sessions.action.pool": "ask the pool again",
  "sessions.key.unlabeled": "unlabeled",
  "sessions.key.meta": "{provider} · {label} · {uses} uses · rotated {rotated}×",
  "sessions.log.aria": "recent chat log",
  "sessions.log.title": "recent chat log",
  "sessions.log.lede":
    "Every gateway request and response lands in the ChatMessage kind with its route, tokens and round-trip duration — the slice the gateway lanes consume.",
  "sessions.log.chat": "chat",
  "sessions.log.provider": "provider",
  "sessions.log.route": "route",
  "sessions.log.role": "role",
  "sessions.log.tokens": "tokens",
  "sessions.log.durationHead": "duration",
  "sessions.log.at": "at",
  "sessions.log.duration": "{ms}ms",
  "sessions.empty.log": "the chat log answered no entries — no gateway request has been logged to this store yet",
  "sessions.action.log": "ask the log again",
  "sessions.loading.log": "loading the chat log…",
  "sessions.action.how": "how the rows arrive",
  // the thinking page anchor (the reasoning ladder)
  "thinking.eyebrow": "getry · thinking",
  "thinking.title": "the 7-level thinking system",
  "thinking.lede":
    "Every chat route accepts a thinking level; the gateway resolves it to the budget the provider receives and carries the choice on the session context. Requests that name no level ride the deep-reasoning default.",
  "thinking.levels.aria": "thinking levels",
  "thinking.defaultBadge": "default",
  "thinking.rung.budget": "{budget} tokens",
  "thinking.rail.head": "how a level resolves",
  "thinking.rail.ledeLead": "The gateway reads the level from the request body (or falls back to ",
  "thinking.rail.ledeMid1": ") and resolves the budget with the same math on every version — ",
  "thinking.rail.ledeMid2": " answers ",
  "thinking.rail.ledeTail":
    " tokens — and records the rung on the session context so the rotation keeps the choice across turns.",
  "thinking.rail.ladder": "ladder",
  "thinking.rail.defaultRung": "default rung",
  "thinking.rail.defaultBudget": "default budget",
  "thinking.rail.foot":
    "The caps repeat at the top of the ladder: xhigh and max ride the same {ceiling} ceiling the providers allow. Seven rungs, one budget math, zero client storage.",
  // the versions page anchor (the gateway registry)
  "versions.eyebrow": "getry · versions",
  "versions.title": "five gateways, thirty-five routes",
  "versions.lede":
    "Each version owns one provider family and answers the same seven OpenAI-compatible routes. The v2 babel service is paused and falls back to v1 zai; v4 and v5 discover their models live through the free-tag filter.",
  "versions.registry.aria": "gateway registry",
  "versions.row.routes": "{count} routes",
  "versions.toast.route": "{endpoint} answers on the self-hosted gateway, never on this surface",
  "versions.parser.head": "canonical parser pattern",
  "versions.glance.head": "the registry at a glance",
  "versions.glance.replicas": "replicas",
  "versions.glance.live": "live",
  "versions.glance.routes": "routes",
  "versions.glance.mask": "mask",
  "versions.glance.foot":
    "Every replica serves the same meta model — the parser masks the upstream name before the bytes leave the lane.",
  "versions.quickstart.aria": "quick start",
  "versions.quickstart.title": "quick start",
  "versions.quickstart":
    '# v1 — zai passthrough no key required\ncurl -x post http://localhost:3000/v1/chat/completions \\\n  -h "content-type: application/json" \\\n  -d \'{"messages":[{"role":"user","content":"hi"}],"stream":true}\'\n\n# v3 — nvidia nim free models\ncurl -x post http://localhost:3000/v3/chat/completions \\\n  -h "content-type: application/json" \\\n  -d \'{"model":"devthink","messages":[{"role":"user","content":"hi"}]}\'\n\n# v4 — opencode kilo anonymous free tier\ncurl -x post http://localhost:3000/v4/chat/completions \\\n  -h "content-type: application/json" \\\n  -d \'{"model":"devthink","messages":[{"role":"user","content":"hi"}]}\'\n\n# v5 — openrouter free models requires key\ncurl -x post http://localhost:3000/v5/chat/completions \\\n  -h "content-type: application/json" \\\n  -h "authorization: bearer $openrouter_api_key" \\\n  -d \'{"model":"devthink","messages":[{"role":"user","content":"hi"}]}\'\n\n# model discovery — v4 and v5 catalogs are dynamic (free-tag filter)\ncurl http://localhost:3000/v4/models\ncurl http://localhost:3000/v5/models',
  // the intro page anchor (the splash)
  "intro.aria": "getry is opening",
  "intro.name": "getry",
  "intro.role": "the AI gateway of the wenathlan family",
  "intro.skip": "click or press any key to skip",
  // the notfound page anchor (the unrouted route)
  "notfound.title": "Route Not Found",
  "notfound.lede1": "This route of the gateway does not exist.",
  "notfound.lede2": "It may have been moved or never served.",
  "notfound.backHome": "back to home",
  // the onboarding page anchor (the first-run frames)
  "onboarding.aria": "getry first run",
  "onboarding.title": "welcome to getry",
  "onboarding.skip": "skip ahead",
  "onboarding.step.eyebrow": "{no} — {step}",
  "onboarding.steps.app": "the app",
  "onboarding.steps.surfaces": "the surfaces",
  "onboarding.steps.enter": "enter",
  "onboarding.what.title": "one window, the whole gateway",
  "onboarding.what.body":
    "getry is the AI gateway of the wenathlan family — not an operating system: one application window holding the console over the provider gateways, the reasoning ladder and the session store.",
  "onboarding.hosts.title": "what the window hosts",
  "onboarding.enter.title": "ready to enter",
  "onboarding.enter.body":
    "the window opens on the gateway home and every surface rides the same rail. the theme starts dark and stays in memory only — nothing is written to this machine.",
  "onboarding.back": "back",
  "onboarding.enterCta": "enter getry",
  "onboarding.continue": "continue",
} as const;

export type LabelKey = keyof typeof LABEL_MANIFEST & string;

/** the translation overrides the runtime loads from the store at boot: the
 * key answers the translated text when the person changed the language. */
const overrides = new Map<string, string>();

/** the browser cache of the labels table: the rows mirror the site db (the
 * db is the source of truth; the cache carries the translated rows offline —
 * the onboardingstate.ts precedent for the visitor machine). */
const CACHE_KEY = "getry.labels.rows";

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
 * ride the local cache of the site db; on the gateway runtime db.ts seeds
 * the same manifest into the labels table through seedLabelRows. */
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
