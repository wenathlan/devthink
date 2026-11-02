/**
 * labels.ts — the copy law of cobaia: every interface string lives in the
 * label store, the wingets and page anchors read through this typed
 * accessor, and a hardcoded string inside a widget is a defect. the
 * manifest below is the english source of truth extracted from the real
 * strings of the Sol wingets and the page anchors; the seed ingests it
 * into the labels store (the site db through db.ts on the server, the
 * browser rows cache in the visitor machine) and the seed never overwrites
 * a translated row.
 *
 * the browser never imports db.ts (better-sqlite3 cannot ride the static
 * bundle): the type comes across erased, the browser seed mirrors the rows
 * into the local cache.
 *
 * data stays data: the app roster (apps.roster.ts — slugs, accents, the
 * roles each app declares in its own devthink.toml), the plan billing
 * values and the support hrefs (checkoutlinks.ts — ids, prices, checkout
 * links; the plan prose itself rides here), the ad slot registry
 * (adsconfig.ts — the fixed ad contract label and note ride there, pinned
 * by the tests), the blog posts (posts.ts) and the route hrefs keep
 * flowing from the data modules; the prose and the affordances around
 * them ride here.
 */

import { createLabelStore } from "@wenathlan/vault/labelstore";


/** the label revision of the manifest: bump on every copy wave so the seed
 * refreshes the store rows of the changed strings. */
export const LABEL_REVISION = 4;

/** the english manifest: the page.widget.key path answers the surface text.
 * every entry is the verbatim string the wingets and page anchors rendered
 * before the copy wave — zero invented copy. */
export const LABEL_MANIFEST = {
  // the window shell widget (the one chrome of the content site)
  "shell.skip": "skip to content",
  "shell.window.aria": "cobaia",
  "shell.brand.aria": "cobaia — home",
  "shell.name": "cobaia",
  "shell.role": "the devthink family site",
  "shell.caption.minimize": "Minimize cobaia",
  "shell.caption.maximize": "Maximize cobaia",
  "shell.caption.close": "Close cobaia",
  "shell.nav.aria": "site sections",
  "shell.nav.apps": "apps",
  "shell.nav.pricing": "pricing",
  "shell.nav.blog": "blog",
  "shell.nav.support": "support",
  "shell.foot.aboutHead": "cobaia",
  "shell.foot.aboutText":
    "the front door of the devthink family: ten applications that run anywhere, tracked nowhere. pricing, support, the app directory and the update blog live here.",
  "shell.foot.siteHead": "site",
  "shell.foot.apps": "apps",
  "shell.foot.pricing": "pricing",
  "shell.foot.blog": "blog",
  "shell.foot.support": "support",
  "shell.foot.legal": "legal",
  "shell.foot.familyHead": "the family",
  "shell.colophon": "cobaia — a provisional name. part of the devthink family · ten honest tools under one roof.",
  // the home page anchor (the landing)
  "home.aria.hero": "cobaia — the devthink family site",
  "home.eyebrow": "the devthink family site",
  "home.title": "One family. Ten tools. Zero tracking.",
  "home.lede":
    "devthink builds and ships a family of web applications — sandboxes, studios, tools and a game platform — hosted free, tracked nowhere. this site is the front door: the directory, the pricing, the support page and the update blog.",
  "home.action.pricing": "see the pricing",
  "home.action.apps": "browse the ten apps",
  "home.section.stepsAria": "what the family is made of",
  "home.section.stepsTitle": "What the family is made of",
  "home.section.stepsLede": "the same three choices behind every member of the family.",
  "home.steps.engine.n": "01",
  "home.steps.engine.title": "one core",
  "home.steps.engine.text":
    "the sandbox and the storage are shared parts. every application assembles the parts it needs and ships beside the others.",
  "home.steps.static.n": "02",
  "home.steps.static.title": "static first",
  "home.steps.static.text":
    "every public surface builds down to one stylesheet and a handful of bundles on free static hosting. nothing is stored on the visitor machine — no cookies, no accounts, no tracking.",
  "home.steps.honest.n": "03",
  "home.steps.honest.title": "honest money",
  "home.steps.honest.text":
    "the family runs on about us$15 a month of domains. the pricing and the support page exist to cover that floor first — and the apps themselves stay free of ads.",
  "home.section.previewAria": "a preview of the app directory",
  "home.section.previewTitle": "A few of the ten",
  "home.section.previewLede":
    "every member lives beside this site, one link away. the full directory lives on",
  "home.section.previewLink": "/apps",
  "home.section.previewTail": ".",
  "home.appcard.open": "open {slug}",
  "home.section.supportAria": "supporting the family",
  "home.section.supportTitle": "Keep the family independent",
  "home.section.supportLede":
    "github sponsors and ko-fi keep the domains paid and the tools free — both charge zero platform fees, so the support goes straight to the hosting floor.",
  "home.action.support": "ways to support",
  // the apps page anchor (the directory)
  "apps.aria.hero": "the devthink app directory",
  "apps.eyebrow": "the directory",
  "apps.title": "Ten apps. One family.",
  "apps.lede":
    "every member of the family lives beside this site and links back to it. the roles below are the honest ones each app declares for itself; the accents are the family's spec table.",
  "apps.section.rosterAria": "the family roster",
  "apps.card.open": "open {slug}",
  // the pricing page anchor (the plans)
  "pricing.action.choose": "choose {name}",
  "pricing.action.notConfigured": "checkout not configured yet",
  "pricing.aria.hero": "cobaia pricing",
  "pricing.eyebrow": "pricing",
  "pricing.title": "Pay for what you use. Or use it free.",
  "pricing.lede":
    "the core surface of every application is free and stays free. the paid plans add the pro features of one app or of the whole family. the prices below are placeholders until billing goes live — a plan activates the moment its checkout link is configured, and says so honestly until then.",
  "pricing.section.plansAria": "the plans",
  "pricing.card.planAria": "{name} plan",
  "pricing.section.moneyAria": "what the money covers",
  "pricing.section.moneyTitle": "What the money covers",
  "pricing.section.moneyLede":
    "the family runs on about us$15 a month of domains and free static hosting. the paid plans cover that floor first, then the higher tiers. there are no ads inside the applications — the ad slots live only on this site's content pages, and they are labeled and reserved.",
  "pricing.section.moneyNote":
    "billing decision pending: stripe payment links or paddle (merchant of record). the checkout hrefs are configuration at the app root — never code, never a committed key.",
  // the plan prose of the pricing cards and the intro plans zone (the
  // billing values — ids, prices, hrefs — stay in checkoutlinks.ts; the
  // words ride here so the store answers every plan sentence)
  "pricing.plan.free.name": "Free",
  "pricing.plan.free.per": "month",
  "pricing.plan.free.blurb": "every app's core surface, for as long as the family is up.",
  "pricing.plan.free.feat.1": "the core surface of all ten applications",
  "pricing.plan.free.feat.2": "no ads inside the apps, ever",
  "pricing.plan.free.feat.3": "community support through the public issue tracker",
  "pricing.plan.pro.name": "Pro",
  "pricing.plan.pro.per": "month",
  "pricing.plan.pro.blurb": "one app and its pro features, billed per application.",
  "pricing.plan.pro.feat.1": "the pro features of one chosen application",
  "pricing.plan.pro.feat.2": "priority routes on the shared gateway",
  "pricing.plan.pro.feat.3": "early access to that app's new surfaces",
  "pricing.plan.studio.name": "Studio",
  "pricing.plan.studio.per": "month",
  "pricing.plan.studio.blurb": "the whole family at once, for people who live in the tools.",
  "pricing.plan.studio.feat.1": "the pro features of every application in the family",
  "pricing.plan.studio.feat.2": "early access across the family",
  "pricing.plan.studio.feat.3": "a direct line to the maintainer for feature requests",
  // the support page anchor (the channels)
  "support.action.notConfigured": "link not configured yet",
  "support.aria.hero": "cobaia support",
  "support.eyebrow": "support",
  "support.title": "Keep the family independent.",
  "support.lede":
    "the family runs on about us$15 a month of domains and free hosting. support covers that floor, keeps every tool free to use and keeps the applications free of ads. both channels below charge zero platform fees, so the support goes where it says.",
  "support.section.channelsAria": "the support channels",
  "support.channel.sponsors.name": "GitHub Sponsors",
  "support.channel.sponsors.promise":
    "sponsor the maintainer through github. zero platform fee, payouts land automatically, and the sponsorship shows up next to the public work it funds.",
  "support.channel.sponsors.cta": "sponsor on github",
  "support.channel.kofi.name": "Ko-fi",
  "support.channel.kofi.promise":
    "one-off donations and monthly memberships through ko-fi. zero fee on donations, no account required on your side beyond the payment.",
  "support.channel.kofi.cta": "buy a coffee",
  "support.section.otherAria": "other ways to help",
  "support.section.otherTitle": "Other ways to help",
  "support.section.otherLede":
    "use the tools and tell the truth about them — report what breaks in the public issue tracker, write about what the family does well or badly, and link the directory when a tool earns it. none of it costs anything and all of it compounds.",
  "support.section.otherNote":
    "the honest line: no ad clicking, no traffic exchange, no bots. automated traffic against an ad surface is invalid traffic — it would end the ad account and the domain reputation. the family does not do it.",
  // the blog page anchor (the update blog)
  "blog.aria.hero": "the family update blog",
  "blog.eyebrow": "updates",
  "blog.title": "What the family is building.",
  "blog.lede":
    "short, written updates on the family — how the sites are built, what they cost and why they ship the way they do. every post lives on this page; the index jumps to it.",
  "blog.section.indexAria": "the post index",
  "blog.section.fullAria": "the posts in full",
  "blog.post.meta": "{date} · {words} words · {tags}",
  // the legal page anchor (privacy and terms)
  "legal.aria.hero": "cobaia legal",
  "legal.eyebrow": "legal",
  "legal.title": "Privacy and terms.",
  "legal.lede":
    "the short version: the family sites are static files, they collect nothing by default, they track nobody, and the details below are the long version of the same promise. last updated 2026-10-10.",
  "legal.privacy.aria": "privacy policy",
  "legal.privacy.title": "Privacy policy",
  "legal.privacy.collect.head": "What we collect: nothing, by default.",
  "legal.privacy.collect.text":
    "The family sites are static files served from a CDN. They set no cookies, run no analytics, embed no fingerprinting and write nothing to your browser — no local storage, no indexed databases, no session records. The only thing a visitor machine does is load the interface.",
  "legal.privacy.logs.head": "Server logs.",
  "legal.privacy.logs.text":
    "The hosting providers (netlify, vercel, cloudflare and equivalents) keep standard access logs on their own infrastructure for security and abuse prevention. The family does not add identifiers to them and does not export them for profiling.",
  "legal.privacy.ads.head": "Advertising.",
  "legal.privacy.ads.text":
    "The family site runs reserved, visibly labeled ad containers on its content pages. No ad script ships in the code: the advertising partner's loader is only added after the partner approves the site, and it arrives through the deploy environment. Once live, third-party vendors including Google may serve ads and use cookies to personalize them, as governed by the partner's own policies. You can opt out of personalized advertising through your ad settings (for Google, adssettings.google.com). Ads never appear inside the applications themselves.",
  "legal.privacy.analytics.head": "Analytics.",
  "legal.privacy.analytics.text":
    "There is no analytics on the family sites today. If that ever changes, it will be opt-in, minimal and disclosed on this page before it goes live.",
  "legal.privacy.payments.head": "Payments.",
  "legal.privacy.payments.text":
    "When paid plans go live, checkout runs on the payment provider's own pages (stripe, paddle or equivalents). The family sites never see or store card data.",
  "legal.privacy.contact.head": "Contact.",
  "legal.privacy.contact.text":
    "Privacy questions and data requests go through the public issue tracker of the family repository — the same channel the software itself uses.",
  "legal.terms.aria": "terms of use",
  "legal.terms.title": "Terms of use",
  "legal.terms.service.head": "The service.",
  "legal.terms.service.text":
    "The family applications and this site are provided as is, without warranty of any kind. They are tools built in public: features change, break and get fixed in the open. Nothing here is offered as professional advice or with any availability guarantee.",
  "legal.terms.use.head": "Acceptable use.",
  "legal.terms.use.text":
    "Use the tools like a person. Do not run automated traffic against the sites or, above all, against any advertising surface: clicking your own ads, exchanging traffic or driving bots at ad containers is invalid traffic — it defrauds the advertisers, it ends the ad account and it burns the domain reputation. The family does not do it and asks nobody else to.",
  "legal.terms.data.head": "Your data.",
  "legal.terms.data.text":
    "Since the sites collect nothing, there is nothing to export or delete. What you do inside the hosted tools stays governed by the tool's own page.",
  "legal.terms.ip.head": "Intellectual property.",
  "legal.terms.ip.text":
    'The family code is free software under its repository license; the name devthink and the family marks belong to their author. The site name "cobaia" is provisional and may change.',
  "legal.terms.changes.head": "Changes.",
  "legal.terms.changes.text":
    "These terms change when the facts change, and the changes land on this page with a new date. Using the sites after a change means you accept it.",
  // the notfound page anchor (the empty address)
  "notfound.eyebrow": "404",
  "notfound.title": "This address is not part of the family.",
  "notfound.lede":
    "the page you asked for does not exist here. the front door and the app directory are the honest way back in.",
  "notfound.action.home": "back to the front door",
  "notfound.action.apps": "browse the apps",
  // the intro page anchor (the bare presentation — the family grammar's last
  // seat: every app carries an intro; the cobaia one presents the real offer,
  // never invented numbers, never fake testimonials)
  "intro.aria.page": "cobaia — the intro",
  "intro.aria.splash": "the cobaia intro splash",
  "intro.splash.name": "cobaia",
  "intro.splash.role": "the devthink family site",
  "intro.splash.skip": "click, tap or any key to skip",
  "intro.bar.aria": "the intro doors",
  "intro.hero.eyebrow": "the presentation",
  "intro.hero.title": "The family's front door, and its price list.",
  "intro.hero.lede":
    "cobaia is the monetization face of the devthink family, kept apart so the ten applications stay clean — no ads inside the apps. the directory, the plans, the support channels and the update blog live here, on one static site that collects nothing by default.",
  "intro.hero.cta": "enter the site",
  "intro.hero.cue": "see the plans",
  "intro.hero.note":
    "the name is provisional, the hosting is free and static, the storage is zero — the long version of that promise rides the legal page.",
  "intro.plans.aria": "the plans as they really are",
  "intro.plans.eyebrow": "the plans",
  "intro.plans.title": "The plans, as they really are.",
  "intro.plans.lede":
    "the same three plans the pricing page carries — us$0, 5 and 19 a month, placeholder prices until billing lands. a plan activates the moment its checkout link is configured, and says so honestly until then.",
  "intro.plans.choose": "choose {name}",
  "intro.plans.notConfigured": "checkout not configured yet",
  "intro.plans.door": "the full pricing page",
  "intro.doors.aria": "the doors of the site",
  "intro.doors.eyebrow": "the doors",
  "intro.doors.title": "Where the family lives.",
  "intro.doors.apps": "the app directory",
  "intro.doors.appsText":
    "ten apps live beside this site. the full directory, with the honest role each application declares for itself, is one door away.",
  "intro.doors.appsCta": "browse the ten apps",
  "intro.doors.legal": "privacy and terms",
  "intro.doors.legalText":
    "the family sites are static files: they collect nothing by default and they track nobody. the privacy policy and the terms of use are the long version of the same promise.",
  "intro.doors.legalCta": "read the legal page",
  "intro.footer.siteAria": "the site doors",
  "intro.footer.familyAria": "the family row",
  "intro.footer.family": "the family",
  "intro.footer.memberTip": "open {slug} — the door beside this site",
  // the ad slot widget (the reserved box of the content pages)
  "ads.slot.reserved": "reserved · {format}",
} as const;

export type LabelKey = keyof typeof LABEL_MANIFEST & string;

/** the store mechanism rides the vault factory (the storage law of the
 * family: the vault owns the store, the app owns the manifest — the
 * mechanism is imported, never duplicated). the surface answers its own no-storage law: the visitor browser never writes. */
const store = createLabelStore({
  manifest: LABEL_MANIFEST,
  revision: LABEL_REVISION,
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
