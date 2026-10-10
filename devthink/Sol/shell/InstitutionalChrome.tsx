/**
 * InstitutionalChrome.tsx — the institutional chrome of the public Sol
 * surfaces: the ONE shell chrome of the theme (ShellChrome — the same navbar
 * every other page mounts), the shared .pagehead hero contract of the design
 * campaign, the editorial legal document renderer and the common footer that
 * the terms and policy pages share. No second topbar is mounted: the public
 * pages carry the same chrome as the workbench; the three institutional links
 * stay reachable in the common footer. The stage light is the Sol signature:
 * the solar accent entering high on the right over a neutral silver anchor
 * wash (no second hue) — the exported style objects stay the contract the
 * out-of-scope pages compose.
 */
import type { CSSProperties } from "react";
import { Link } from "wouter";
import { packageversion } from "../../version";
import { ShellChrome } from "./ShellChrome.tsx";

/* --------------------------------------------------------------------------
 * The .pagehead contract (design campaign C1 — the ONE page hero grammar):
 * the eyebrow is a lowercase mono micro-label (no all-caps wide tracking),
 * the title rides the display face of the wave (--font-display, with the
 * theme sans as the pre-type-pass fallback), the lede is a 13px/1.7 measure
 * and the hero closes on a hairline rule instead of a boxed band. The exact
 * contract values stay pinned inline so the grammar never renders raw on any
 * surface that mounts a hero today.
 * ------------------------------------------------------------------------ */
export const pagecontainerStyle: CSSProperties = {
  width: "100%",
  maxWidth: 1180,
  margin: "0 auto",
  padding: "24px 32px",
};

export const pageheadStyle: CSSProperties = {
  display: "grid",
  justifyItems: "start",
  rowGap: 12,
  padding: "36px 0 26px",
  borderBottom: "1px solid var(--dt-edge)",
};

export const pageheadEyebrowStyle: CSSProperties = {
  margin: 0,
  color: "var(--sol-sun)",
  font: "600 10px var(--dt-mono)",
  letterSpacing: ".08em",
};

export const pageheadTitleStyle: CSSProperties = {
  margin: 0,
  color: "var(--dt-text)",
  font: "700 30px/1.15 var(--font-display, var(--dt-sans))",
  letterSpacing: "-0.02em",
};

export const pageheadLedeStyle: CSSProperties = {
  margin: 0,
  maxWidth: 640,
  color: "var(--dt-muted)",
  font: "400 13px/1.7 var(--dt-sans)",
};

export const pageheadActionsStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  justifySelf: "end",
};

/** the one orchestrated entrance per view: a single staggered rise (hero →
 * body) that ends in stillness — never per-block scroll fades. Consumers
 * pass their useReducedMotion result; the reduced preference receives no
 * motion at all. */
export function stagedEntrance(reduced: boolean, delay: number): CSSProperties | undefined {
  if (reduced) return undefined;
  return { animation: "riseIn .55s var(--dt-ease) backwards", animationDelay: `${delay}ms` };
}

/** the named light source of the sol stage: the solar accent enters high on
 * the right, a neutral silver wash anchors the low left (never a second
 * hue — the Sol signature keeps one accent per page) — --sol-canvas stays
 * the base so the theme tokens keep owning it. */
export const pagestageStyle: CSSProperties = {
  background:
    "radial-gradient(1200px 700px at 76% -12%, rgb(245 158 11 / 8%), transparent 62%), radial-gradient(900px 620px at 6% 108%, rgb(201 205 214 / 5%), transparent 58%), var(--sol-canvas)",
};

/** the institutional pages every public surface links to */
const pages = [
  { href: "/about", label: "about" },
  { href: "/terms", label: "terms" },
  { href: "/policy", label: "policy" },
] as const;

/** The institutional page frame chrome: the shell navbar plus nothing else —
 * the brand, the essential links, the omnibox, the tray and the Start menu
 * are the theme's single chrome; no second topbar rides above the page. */
export function InstitutionalChrome() {
  return <ShellChrome />;
}

/** the shape the legal renderer consumes; the catalog LegalSection rows fit it */
type LegalSectionView = { id: string; title: string; paragraphs: string[] };

/** The legal document body: numbered sections (title + paragraphs) pulled
 * from one catalog kind per page. The numbering is presentation — the keys
 * stay on the section ids the database answers. The paint is Tailwind
 * composition on the design tokens (task 3-a): the hairline rule per
 * section, the section index in the generous left column (the one sun-signal
 * focus of the document), 20px display-face titles and the 13px/1.7 measure.
 * The staggered rise of the sections stays class-driven (inst-legal__section)
 * so the stylesheet's reduced-motion guard applies. */
export function InstitutionalLegal({ sections }: { sections: LegalSectionView[] }) {
  return (
    <div className="inst-legal relative z-(--z-content) mx-auto grid w-[min(880px,calc(100%-48px))] grid-rows-[auto] gap-x-[clamp(32px,5vw,48px)] gap-y-0 pb-[clamp(56px,8vw,96px)] max-[720px]:w-[calc(100%-32px)]">
      {sections.map((section, index) => (
        <section
          key={section.id}
          className="inst-legal__section grid grid-cols-[minmax(56px,88px)_minmax(0,1fr)] gap-x-6 gap-y-3 border-t border-(--color-hairline) pt-[26px] pb-2"
        >
          <span className="inst-legal__index [grid-row:1/span_2] self-start pt-[7px] font-mono text-[11px] font-semibold tracking-[.08em] text-(--color-sun) tabular-nums">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h2 className="col-start-2 m-0 font-display text-[20px]/[1.25] font-bold tracking-[-0.01em] text-ink text-balance">
            {section.title}
          </h2>
          <div className="col-start-2 grid gap-3">
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph} className="m-0 max-w-[68ch] text-[13px]/[1.8] text-(--color-ink-2) text-pretty">
                {paragraph}
              </p>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

/** The common institutional footer: the brand word, the three page links and
 * the version note read from the canonical version module (synchronized from
 * package.json at the app root). One mark per zone — the navbar above owns
 * the mark, so the footer stays type-only. The paint rides the Tailwind
 * composition (task 3-a): hairline top edge, the 44px touch links and the
 * mono version note. */
export function InstitutionalFooter() {
  return (
    <footer className="inst-footer relative z-(--z-content) mt-auto flex flex-wrap items-center justify-between gap-x-[18px] gap-y-3 border-t border-(--color-hairline) px-6 py-5 text-(--color-ink-3) max-[720px]:flex-col max-[720px]:items-start">
      <span className="inst-footer__brand inline-flex items-center gap-2 font-sans text-[11px] font-bold tracking-[.05em] text-ink">
        <strong>DEVTHINK</strong>
      </span>
      <nav aria-label="Institutional pages" className="flex gap-1">
        {pages.map((page) => (
          <Link
            key={page.href}
            href={page.href}
            className="inline-flex min-h-11 items-center rounded-xs px-2.5 font-mono text-[10px] font-medium lowercase text-(--color-ink-2) no-underline transition-colors duration-150 hover:bg-white/5 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus) light:hover:bg-black/5"
          >
            {page.label}
          </Link>
        ))}
      </nav>
      <span className="inst-footer__version font-mono text-[10px] font-medium tracking-[.08em] lowercase text-(--color-ink-3)">
        devthink {packageversion} — sol institutional surface
      </span>
    </footer>
  );
}
