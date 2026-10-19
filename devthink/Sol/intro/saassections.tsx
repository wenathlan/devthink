/**
 * saassections.tsx — the opening sections of the SaaS face: the display
 * hero over the campaign atmosphere and the family constellation with the
 * native app grid. Loose components of the intro page — the anchor
 * (intro.tsx) mounts the page (saas.tsx) and the page composes these.
 * Every row rides the catalog accessors the page hands down; nothing is
 * hardcoded here. The trylle grammar governs the cards: rounded-2xl, the
 * hairline ring, the Linear shadow with its soft layers.
 */

import {ArrowRightRegular as ArrowRight} from "@fluentui/react-icons";
import type { FamilySite, NativeApp } from "../../catalog";
import { SolLogoMark } from "../panel/logo.tsx";
import { Studiomark } from "./saaskit.tsx";

/** the soft layers under the hairline ring of the trylle cards */
const STRIP_SHADOW = "0 1px 2px rgb(0 0 0 / 26%), 0 3px 12px rgb(0 0 0 / 12%)";

/** the hero atmosphere: one warm amber light dissolving over the mica —
 * layered, pointer-transparent, never a second gradient on the page */
const heroLightStyle = {
  position: "absolute",
  inset: 0,
  zIndex: 0,
  pointerEvents: "none",
  background:
    "radial-gradient(1200px 700px at 72% -12%, rgb(255 159 46 / 12%), transparent 62%), radial-gradient(900px 620px at 6% 110%, rgb(245 158 11 / 7%), transparent 58%)" } as const;

/** the film grain: feTurbulence fractal noise, 2 octaves, 140px tile,
 * soft-light — the doctrine veil, additive over the mica */
const heroGrainStyle = {
  position: "absolute",
  inset: 0,
  zIndex: 0,
  pointerEvents: "none",
  mixBlendMode: "soft-light",
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.86' numOctaves='2'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='.07'/%3E%3C/svg%3E\")" } as const;

type SectionProps = {
  /** the enter action: every path of the landing funnels to the login face */
  onenter: () => void;
};

/** The hero: the trylle display statement over the mica with the amber
 * atmosphere. One accent focus per screen — the amber sigil of the
 * eyebrow; the CTA rides the Windows accent of the chrome. */
export function SaasHero({ onenter }: SectionProps) {
  return (
    <section className="relative pb-10 pt-[clamp(56px,9vh,118px)]" aria-label="DevThink — the thinking os">
      <div style={heroLightStyle} aria-hidden="true" />
      <div style={heroGrainStyle} aria-hidden="true" />

      <div className="relative z-[1] max-w-[780px]">
        <p data-akash-beat className="flex items-center gap-2 font-mono text-[10px] tracking-[.08em] text-ink-3">
          <SolLogoMark size={18} accent /> <span>devthink — the thinking os</span>
        </p>
        {/* the trylle hero: display face, weight 600, tracking -0.02em,
        the clamp of the ruler — never italic */}
        <h1
          data-akash-beat
          className="mt-4 font-display text-[clamp(2.25rem,5vw,3.75rem)] font-semibold leading-[1.1] tracking-[-0.02em] text-ink"
          style={{ textWrap: "balance", fontFamily: "var(--font-display)" }}
        >
          one os for every studio, engine and agent
        </h1>
        <p data-akash-beat className="mt-4 max-w-[560px] text-sm leading-[1.55] text-ink-2">
          the os reads the whole registry over https: native apps, family engines and the sandbox
          runner share one catalog, one session and one store. nothing installs on your machine.
        </p>
        <div data-akash-beat className="mt-8 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onenter}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-win px-5 text-sm font-semibold text-(--win-accent-ink) transition-[filter,transform] duration-150 ease-micro hover:brightness-95 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus) motion-reduce:transition-none"
            style={{ boxShadow: STRIP_SHADOW }}
          >
            enter devthink
            <ArrowRight fontSize={15} aria-hidden="true" />
          </button>
          <a
            href="#constellation"
            className="inline-flex min-h-11 items-center rounded-lg bg-s0 px-5 text-sm font-medium text-ink ring-1 ring-hairline-strong transition-colors duration-150 ease-micro hover:bg-s1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus) motion-reduce:transition-none"
          >
            see the family
          </a>
        </div>
      </div>
    </section>
  );
}

/** the family tile ids the constellation draws — the marks carry the
 * identity color of each app; the chrome stays Windows neutral */
const FAMILY_MARKS: Readonly<Record<string, "getry" | "debonair" | "cadria" | "saddle" | "vault" | "doo">> = {
  getry: "getry",
  debonair: "debonair",
  cadria: "cadria",
  saddle: "saddle",
  vault: "vault",
  doo: "doo",
};

/** The family constellation: the family sites the catalog serves, each
 * row a trylle card with the drawn mark of its app. The honest empty
 * state answers when the catalog has not replied yet. */
export function SaasFamily({ sites }: { sites: FamilySite[] }) {
  return (
    <section className="scroll-mt-24 py-14" id="constellation" aria-labelledby="dt-sec-family">
      <header className="mb-8 max-w-[56ch]">
        <p className="font-mono text-[10px] tracking-[.08em] text-ink-3">the family constellation</p>
        <h2 id="dt-sec-family" className="mt-2 font-display text-2xl font-semibold tracking-[-0.02em] text-ink">
          the apps of the family
        </h2>
        <p className="mt-2 text-sm leading-[1.55] text-ink-2">
          each app answers its own engine and its own address — the same rows the os serves after you enter.
        </p>
      </header>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sites.map((site) => (
          <li
            key={site.host}
            className="flex flex-col gap-4 rounded-2xl bg-s0 p-6 ring-1 ring-hairline-strong transition-colors duration-150 ease-micro hover:bg-s1 motion-reduce:transition-none"
            style={{ boxShadow: STRIP_SHADOW }}
          >
            <div className="flex items-center justify-between gap-4">
              <Studiomark app={FAMILY_MARKS[site.name.toLowerCase()] ?? "doo"} className="h-11 w-11" />
              <span className="font-mono text-[10px] tracking-[.08em] text-ink-3">{site.host}</span>
            </div>
            <div>
              <strong className="block font-display text-sm font-semibold tracking-[-0.01em] text-ink">
                {site.name}
              </strong>
              <span className="mt-1 block text-xs leading-[1.55] text-ink-2">{site.blurb}</span>
            </div>
          </li>
        ))}
        {sites.length === 0 && (
          <li className="py-6 font-mono text-xs text-ink-3">the catalog has not answered yet.</li>
        )}
      </ul>
    </section>
  );
}

/** The native app grid: the surfaces the os ships, each card walking into
 * the os through the login face. The route rides the catalog row — never
 * a hardcoded link. */
export function SaasApps({ apps, onenter }: { apps: NativeApp[] } & SectionProps) {
  return (
    <section className="scroll-mt-24 py-14" id="apps" aria-labelledby="dt-sec-apps">
      <header className="mb-8 max-w-[56ch]">
        <p className="font-mono text-[10px] tracking-[.08em] text-ink-3">the native surfaces</p>
        <h2 id="dt-sec-apps" className="mt-2 font-display text-2xl font-semibold tracking-[-0.02em] text-ink">
          the apps inside the os
        </h2>
        <p className="mt-2 text-sm leading-[1.55] text-ink-2">
          every native app opens as a window of the os — the catalog rows below are the same rows
          the start menu serves.
        </p>
      </header>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {apps.map((app) => (
          <li key={app.id}>
            <button
              type="button"
              onClick={onenter}
              className="flex w-full flex-col gap-3 rounded-2xl bg-s0 p-6 text-left ring-1 ring-hairline-strong transition-colors duration-150 ease-micro hover:bg-s1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus) motion-reduce:transition-none"
              style={{ boxShadow: STRIP_SHADOW }}
            >
              <div className="flex items-center justify-between gap-4">
                <strong className="font-display text-sm font-semibold tracking-[-0.01em] text-ink">
                  {app.title}
                </strong>
                <span className="font-mono text-[10px] tracking-[.08em] text-ink-3">{app.route}</span>
              </div>
              <span className="text-xs leading-[1.55] text-ink-2">{app.blurb}</span>
              <span className="mt-1 flex items-center gap-2 font-mono text-[10px] tracking-[.08em] text-ink-3">
                {app.engine}
                <ArrowRight fontSize={12} aria-hidden="true" />
              </span>
            </button>
          </li>
        ))}
        {apps.length === 0 && (
          <li className="py-6 font-mono text-xs text-ink-3">the catalog has not answered yet.</li>
        )}
      </ul>
    </section>
  );
}
