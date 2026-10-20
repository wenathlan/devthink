// # copy — the copy store of the os (root layer): every user-visible
// string the components render rides the database — the copy tables the
// app's own sandbox supplies over /api/v1/copy (https, mime json) — and
// the component NEVER hardcodes text. The literals live HERE and ONLY
// here, as the build-time seed: the build hardcodes the seed into the
// bundle, the seed fills the db tables, the live rows answer the pages and
// the seed answers the offline static build (the memory-seed law — never
// browser storage). The typed accessor `copy(key)` reads the live rows
// when the platform answered and falls back to the seed when it did not,
// so the interface never shows a blank where a word belongs and the db
// stays the single living config of the copy.

import { ispublichttpsbase, onboardingapibase } from "./onboardingstate.ts";

/** One copy row as the db table holds it. */
export interface CopyRow {
  /** The stable key (the dotted path the components cite). */
  key: string;
  /** The text the row serves. */
  text: string;
}

/** The build-time seed: the one place literals live, the form the db
 * receives at build. Keys use the dotted page.section path. */
const SEED: Readonly<Record<string, string>> = Object.freeze({
  "plans.title": "Plans and payment",
  "plans.lede":
    "The platform is open and the engines carry no limits — the plan draws what the account reaches. The choice stamps the badge now; the payment gateway connects at the infrastructure wave.",
  "plans.current": "current plan",
  "plans.card.selected": "selected",
  "plans.card.select": "select",
  "plans.custom.legend": "define your own surface (mb)",
  "plans.custom.disk": "disk",
  "plans.custom.ram": "ram",
  "plans.badges.title": "The badges the identity wears",
  "plans.payment.title": "Payment",
  "plans.payment.lede":
    "The gateway connects at the infrastructure wave — the selection and the badge stamp now, the charge rides the processor when it lands.",
  "plans.payment.stamp": "stamp the",
  "plans.payment.stamping": "stamping",
  "plans.back": "back to the desktop",
  "plans.tier.free.line1": "the open platform, every app and engine included",
  "plans.tier.free.line2": "the base plan storage",
  "plans.tier.free.line3": "community sandboxes",
  "plans.tier.pro.line1": "the expanded plan for daily creators",
  "plans.tier.pro.line2": "broader storage and ram ceilings",
  "plans.tier.pro.line3": "priority sandbox lanes",
  "plans.tier.enterprise.line1": "defines own disk and ram in megabytes",
  "plans.tier.enterprise.line2": "the technology follows the definition",
  "plans.tier.enterprise.line3": "every capability badge unlocked",
  "plans.tier.free.headline": "free",
  "plans.tier.pro.headline": "pro",
  "plans.tier.enterprise.headline": "enterprise",
});

/** The live rows the platform answered (null until the first load). */
let live: Readonly<Record<string, string>> | null = null;

/**
 * Loads the live copy rows from the app database: GET /api/v1/copy over
 * the same validated base the onboarding and the plan ride. The failure
 * keeps the seed answering (the offline build law).
 */
export async function loadcopy(): Promise<void> {
  const base = onboardingapibase();
  if (!base || !ispublichttpsbase(base.toString())) return;
  try {
    const res = await fetch(new URL("/api/v1/copy", base).toString(), {
      credentials: "include",
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return;
    const answer = (await res.json()) as { rows?: CopyRow[] };
    if (!Array.isArray(answer.rows)) return;
    const rows: Record<string, string> = {};
    for (const row of answer.rows) {
      if (row && typeof row.key === "string" && typeof row.text === "string") rows[row.key] = row.text;
    }
    live = rows;
  } catch {
    /* the platform is away: the seed keeps answering */
  }
}

/**
 * The typed accessor every component renders through: the live db row when
 * the platform answered, the build seed otherwise, the key itself when
 * neither holds it (the missing key is loud, never a blank).
 *
 * @param key the dotted copy key.
 * @returns the text the db (or the seed) serves.
 */
export function copy(key: string): string {
  return live?.[key] ?? SEED[key] ?? key;
}

/** The seed surface (the db fill and the tests read it; the components never). */
export function copyseed(): Readonly<Record<string, string>> {
  return SEED;
}
