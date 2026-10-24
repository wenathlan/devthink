/**
 * launchdeck.tsx — the orbital launcher kit of the explore hub. The hub is a
 * stage, not a settings page: ONE prompt-giga command field (the giant input
 * with the open action embedded inside it, quick-filter chips riding below)
 * and the app constellation — the devthink native surfaces as the wide
 * feature rail of hairline rows and the nine external family apps as the
 * identity grid of trylle cards with ONE tile raised (the center-pop). Data
 * comes exclusively from the shared registry (Sol/shell/appregistry.ts) —
 * the same rows the desktop grid, the Start menu and the launcher page read;
 * nothing is hardcoded here.
 *
 * Navigation contract (the windows law with its own address):
 * - internal kinds navigate with the wouter router (`Link`);
 * - the external kind rides its own route too: a family tile links to
 *   /<slug> — DevThink barra <app> — and the panel opens the power clip
 *   window of that app on arrival, so the family never leaves the DevThink
 *   interface.
 *
 * The marks: every family tile draws its identity inline (argan ripple
 * rings, cadria sway, debonair eq bars, forge ember, foundry tick, getry
 * pulse, saddle bob, stealthhead sweep, vault dial) with the per-part phase
 * plumbing — the `ldk-m-*` hooks and the negative delays of sol.css — kept
 * for the motion kit; the ambient mark loops were retired by the
 * loop-eradication pass, so the tiles rest static while the devthink sigil
 * still draws itself (the one stroke-dashoffset story).
 */
import {ArrowUpRightRegular as ArrowUpRight} from "@fluentui/react-icons";
import { type CSSProperties, type FormEvent, type ReactNode, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { DESKTOP_APPS, type DesktopApp, isFamilyApp } from "../../appregistry.ts";
import { osText } from "../../oslabels.ts";
import { AppTile } from "./shell.apptile.tsx";
import { HeroWaves } from "./explore.waves.tsx";

/** the trylle primary tone stack of every enter action (the exact rest
 * stack of the quality ruler: inset gloss, inset glow, inset ring, outer
 * ring, two doubling drops) */
export const TRYLLE_PRIMARY_STACK =
  "inset 0 1.2px 0 0 #ffffff73, inset 0 8px 14px -6px #ffffff38, inset 0 0 0 1px #ffffff2e, 0 0 0 1px oklch(14% 0 0), 0 1px 2px #00000038, 0 3px 5px -1px #00000047";

/** the trylle card shadow: the hairline ring stays a utility, the shadow
 * carries the doubling soft layers (Linear DNA, ≤26% black) */
export const TRYLLE_CARD_SHADOW = "0 1px 2px rgb(0 0 0 / 26%), 0 3px 12px rgb(0 0 0 / 12%)";

/** the raised variant of the card shadow (the featured tile, the center-pop) */
export const TRYLLE_CARD_SHADOW_RAISED = "0 2px 3px rgb(0 0 0 / 26%), 0 6px 20px -4px rgb(0 0 0 / 22%)";

/** the input-edge shadow of the command field (trylle input DNA: top inner
 * light, ring, one drop) */
const FIELD_SHADOW = "0 1px 2px rgb(0 0 0 / 26%), 0 3px 12px rgb(0 0 0 / 12%), inset 0 1px 0 0 rgb(255 255 255 / 4%)";

/** the identity signal of each family app (one color per tile, the tile
 * chrome itself stays neutral graphite — the campaign doctrine) */
const FAMILY_TINT: Record<string, string> = {
  argan: "#1DCF64",
  cadria: "#f472b6",
  debonair: "#d9962e",
  stealthhead: "#f87171",
  forge: "#fb923c",
  foundry: "#d97706",
  vault: "#eab308",
  getry: "#8b5cf6",
  saddle: "#d6b483" };

/** the neutral tint a family mark falls back to when the registry grows a
 * row the identity map does not know yet (never a blank tile) */
const FALLBACK_TINT = "#9aa3b5";

/** the inline animation-delay of one repeating mark part (negative, the
 * ambient loops start mid-story so the constellation never pulses in sync) */
function partDelay(index: number, step: number): CSSProperties {
  return { animationDelay: `${-(index * step + 0.4)}s` };
}

/** the family marks: one function motion per app, drawn inline (the
 * doctrine: images and textures inline, no asset folder) */
const MARKS: Record<string, (tint: string) => ReactNode> = {
  argan: (tint) => (
    <>
      <circle cx="16" cy="16" r="3" fill={tint} />
      <circle
        className="ldk-m ldk-m-ripple"
        cx="16"
        cy="16"
        r="7"
        stroke={tint}
        strokeWidth="1.5"
        style={partDelay(0, 1.85)}
      />
      <circle
        className="ldk-m ldk-m-ripple"
        cx="16"
        cy="16"
        r="10.5"
        stroke={tint}
        strokeWidth="1.3"
        opacity=".75"
        style={partDelay(1, 1.85)}
      />
      <circle
        className="ldk-m ldk-m-ripple"
        cx="16"
        cy="16"
        r="14"
        stroke={tint}
        strokeWidth="1.1"
        opacity=".5"
        style={partDelay(2, 1.85)}
      />
    </>
  ),
  cadria: (tint) => (
    <>
      <rect x="5.5" y="5.5" width="21" height="21" rx="5" stroke={tint} strokeWidth="1.3" opacity=".4" />
      <path className="ldk-m ldk-m-sway" d="M13.6 11.4 21.4 16l-7.8 4.6z" fill={tint} />
    </>
  ),
  debonair: (tint) => (
    <>
      {[0, 1, 2, 3].map((bar) => (
        <rect
          key={bar}
          className="ldk-m ldk-m-eq"
          x={7 + bar * 4.8}
          y="9.5"
          width="2.8"
          height="13"
          rx="1.3"
          fill={tint}
          style={partDelay(bar, 0.55)}
        />
      ))}
      <path d="M6 25.5h20" stroke={tint} strokeWidth="1.3" strokeLinecap="round" opacity=".4" />
    </>
  ),
  stealthhead: (tint) => (
    <>
      <circle cx="16" cy="16" r="7.5" stroke={tint} strokeWidth="1.4" opacity=".8" />
      <path
        d="M16 4.5v3M16 24.5v3M4.5 16h3M24.5 16h3"
        stroke={tint}
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity=".55"
      />
      <circle cx="16" cy="16" r="1.6" fill={tint} />
      <path className="ldk-m ldk-m-sweep" d="M16 16V5.5" stroke={tint} strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  forge: (tint) => (
    <>
      <path d="M6.5 25h19" stroke={tint} strokeWidth="1.4" strokeLinecap="round" opacity=".5" />
      <path d="M11 21.5h10l-1.6-3.5h-6.8z" stroke={tint} strokeWidth="1.4" strokeLinejoin="round" opacity=".85" />
      <rect className="ldk-m ldk-m-ember" x="14.4" y="7.6" width="3.4" height="3.4" rx=".7" fill={tint} />
    </>
  ),
  foundry: (tint) => (
    <>
      <circle
        className="ldk-m ldk-m-tick"
        cx="16"
        cy="16"
        r="10.5"
        stroke={tint}
        strokeWidth="1.5"
        strokeDasharray="3.1 4.4"
      />
      <circle cx="16" cy="16" r="6" stroke={tint} strokeWidth="1.3" opacity=".6" />
      <circle cx="16" cy="16" r="1.7" fill={tint} />
    </>
  ),
  vault: (tint) => (
    <>
      <circle cx="16" cy="16" r="11.5" stroke={tint} strokeWidth="1.4" opacity=".5" />
      <circle cx="16" cy="16" r="7" stroke={tint} strokeWidth="1.4" />
      <path className="ldk-m ldk-m-dial" d="M16 16V9" stroke={tint} strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="16" cy="16" r="1.6" fill={tint} />
      <path
        d="M16 4.9v1.8M27.1 16h-1.8M16 27.1v-1.8M4.9 16h1.8"
        stroke={tint}
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity=".45"
      />
    </>
  ),
  getry: (tint) => (
    <>
      <rect x="8.5" y="18.5" width="15" height="5" rx="1.8" stroke={tint} strokeWidth="1.3" opacity=".55" />
      <rect x="8.5" y="11" width="15" height="5" rx="1.8" stroke={tint} strokeWidth="1.3" />
      <rect
        className="ldk-m ldk-m-pulse"
        x="5.5"
        y="8"
        width="21"
        height="18.5"
        rx="4"
        stroke={tint}
        strokeWidth="1.2"
      />
    </>
  ),
  saddle: (tint) => (
    <g className="ldk-m ldk-m-bob">
      <path d="M16 6.2 23.4 10.4v8.9L16 23.5l-7.4-4.2v-8.9z" stroke={tint} strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M8.6 10.4 16 14.6l7.4-4.2M16 14.6v8.9" stroke={tint} strokeWidth="1.2" opacity=".55" />
    </g>
  ) };

type FamilyMarkProps = {
  /** the registry id of the family app (the mark key) */
  id: string;
  /** the identity signal color of the mark */
  tint: string;
  /** rendered size in px */
  size?: number;
  /** the phase slot — shifts the negative delays so sibling marks never
   * pulse in unison */
  phase?: number;
};

/** the animated family mark: the app's ONE function motion, looping */
export function FamilyMark({ id, tint, size = 30, phase = 0 }: FamilyMarkProps) {
  const draw = MARKS[id] ?? MARKS.getry;
  return (
    <svg
      className="ldk-mark"
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="none"
      aria-hidden="true"
      focusable="false"
      style={{ "--ldk-phase": phase } as CSSProperties}
    >
      {draw(tint)}
    </svg>
  );
}

/** the devthink sigil: two strokes that draw themselves — the one branding
 * motion of the hub (the titlebar owns the logo; the hub rides the wordmark
 * and this quiet signal beside it) */
export function OsSigil({ size = 20 }: { size?: number }) {
  return (
    <svg
      className="ldk-osmark"
      viewBox="0 0 28 28"
      width={size}
      height={size}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        className="ldk-osmark__a"
        d="M7.5 20.5C12 18.5 16.5 13.5 20.5 7.5"
        stroke="var(--color-win)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        className="ldk-osmark__b"
        d="M7.5 7.5C11.5 12 16 17 20.5 20.5"
        stroke="var(--color-win)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** the internal route of one registry app — every kind the registry
 * declares maps to a real page of this interface (the launcher grammar);
 * the external kind rides the family route (DevThink barra <app>) */
function appRoute(app: DesktopApp): string {
  switch (app.target.kind) {
    case "route":
      return app.target.href;
    case "destination":
      return `/${app.target.id}`;
    case "window":
      return app.target.id === "chat" ? "/chat" : "/history";
    case "external":
      return `/${app.target.slug}`;
    default:
      return "/panel";
  }
}

/** the mark slot of a deck cell: the family apps ride their animated marks,
 * the native surfaces ride the OS's own premium tile system */
function DeckMark({ app, phase }: { app: DesktopApp; phase: number }) {
  if (app.target.kind === "external") {
    return <FamilyMark id={app.id} tint={FAMILY_TINT[app.id] ?? FALLBACK_TINT} size={30} phase={phase} />;
  }
  return <AppTile app={app} size={26} />;
}

/**
 * DeckCell — the trylle card of the curated grids: mark, name, one mono
 * role line on a stepped surface (rounded-2xl, hairline ring, Linear
 * shadow, p-8). Internal kinds navigate with the router, external kinds
 * anchor to the family deploy base, the os kind seeds the /os view first;
 * the featured card rides the raised elevation.
 */
export function DeckCell({
  app,
  featured = false,
  phase = 0 }: {
  app: DesktopApp;
  featured?: boolean;
  phase?: number;
}) {
  const body = (
    <>
      <span className="grid h-10 w-10 flex-none place-items-center" aria-hidden="true">
        <DeckMark app={app} phase={phase} />
      </span>
      <span className="mt-auto text-sm font-semibold tracking-[-0.01em] text-ink">{app.name}</span>
      <span className="font-mono text-[11px] leading-[1.5] text-ink-3">{app.detail}</span>
    </>
  );
  const className = `group relative flex h-full flex-col gap-3 overflow-hidden rounded-2xl p-8 ring-1 ring-hairline-strong transition-[background-color] duration-150 ease-micro hover:bg-s1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus) motion-reduce:transition-none ${
    featured ? "bg-s1" : "bg-s0"
  }`;
  const shadow = featured ? TRYLLE_CARD_SHADOW_RAISED : TRYLLE_CARD_SHADOW;
  const label = `${app.name} — ${app.detail}`;
  return (
    <Link className={className} style={{ boxShadow: shadow }} href={appRoute(app)} aria-label={label}>
      {body}
    </Link>
  );
}

/** the scope chips of the command field */
type DeckScope = "all" | "native" | "family" | "pinned";
const SCOPES: ReadonlyArray<{ id: DeckScope; label: string }> = [
  { id: "all", label: osText("explore.launch.scope.all") },
  { id: "native", label: osText("explore.launch.scope.native") },
  { id: "family", label: osText("explore.launch.scope.family") },
  { id: "pinned", label: osText("explore.launch.scope.pinned") },
];

/** the section header of one constellation zone (mono cap, display title) */
function RailHead(props: { cap: string; title: string; meta: string }) {
  return (
    <header className="mb-5">
      <p className="font-mono text-[10px] tracking-[.08em] text-ink-3">{props.cap}</p>
      <h2 className="mt-1.5 font-display text-lg font-semibold tracking-[-0.02em] text-ink">{props.title}</h2>
      <p className="mt-1 font-mono text-[11px] text-ink-3">{props.meta}</p>
    </header>
  );
}

/** one native row of the feature rail: the OS's own surface as a hairline
 * row — mark, name, mono role line, the arrow nudging on hover */
function NativeRow({ app, featured }: { app: DesktopApp; featured: boolean }) {
  const label = `${app.name} — ${app.detail}`;
  const body = (
    <>
      <span className="grid h-10 w-10 flex-none place-items-center" aria-hidden="true">
        <AppTile app={app} size={featured ? 30 : 24} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-sm font-semibold tracking-[-0.01em] text-ink">{app.name}</span>
        <span className="truncate font-mono text-[11px] text-ink-3">{app.detail}</span>
      </span>
      <ArrowUpRight
        className="flex-none text-ink-3 transition-transform duration-150 ease-micro group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
        fontSize={15}
        aria-hidden="true"
      />
    </>
  );
  const linkClass =
    "group flex items-center gap-4 rounded-lg px-3 py-2.5 transition-colors duration-150 ease-micro hover:bg-s0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus) motion-reduce:transition-none";
  return (
    <Link className={linkClass} href={appRoute(app)} aria-label={label}>
      {body}
    </Link>
  );
}

/** one family tile of the constellation: neutral chrome, the identity light
 * source behind, the animated mark, the name and the mono role line — a
 * trylle card with ONE tile raised (the center-pop) */
function FamilyTile({ app, index, raised }: { app: DesktopApp; index: number; raised: boolean }) {
  if (app.target.kind !== "external") return null;
  const tint = FAMILY_TINT[app.id] ?? FALLBACK_TINT;
  return (
    <Link
      className={`group relative flex h-full flex-col gap-2 overflow-hidden rounded-2xl p-8 ring-1 ring-hairline-strong transition-[background-color,box-shadow] duration-150 ease-micro hover:bg-s1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus) motion-reduce:transition-none ${
        raised ? "bg-s1" : "bg-s0"
      }`}
      style={{
        boxShadow: raised ? TRYLLE_CARD_SHADOW_RAISED : TRYLLE_CARD_SHADOW,
        backgroundImage: `radial-gradient(150px 110px at 22% 14%, ${tint}24, transparent 70%)` }}
      href={appRoute(app)}
      aria-label={`${app.name} — ${app.detail}`}
    >
      <FamilyMark id={app.id} tint={tint} size={34} phase={index} />
      <span className="mt-auto pt-4 text-sm font-semibold tracking-[-0.01em] text-ink">{app.name}</span>
      <span className="font-mono text-[11px] leading-[1.5] text-ink-3">{app.detail}</span>
      <ArrowUpRight
        className="absolute right-6 top-6 text-ink-3 opacity-0 transition-opacity duration-150 ease-micro group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
        fontSize={14}
        aria-hidden="true"
      />
    </Link>
  );
}

/**
 * LaunchDeck — the launcher stage of the explore hub: the prompt-giga
 * command field with the quick-filter chips, then the app constellation
 * (the native feature rail + the family identity grid, one tile raised).
 * The field filters the whole registry live; the submit opens the first
 * match through the exact navigation contract of the shell.
 */
export function LaunchDeck() {
  const [, navigate] = useLocation();
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<DeckScope>("all");

  const needle = query.trim().toLowerCase();
  const matches = useMemo(
    () =>
      DESKTOP_APPS.filter((app) => {
        const inScope =
          scope === "all" ||
          (scope === "pinned" ? app.pinned : scope === "native" ? !isFamilyApp(app) : isFamilyApp(app));
        if (!inScope) return false;
        if (!needle) return true;
        return app.name.toLowerCase().includes(needle) || app.detail.toLowerCase().includes(needle);
      }),
    [scope, needle],
  );
  const native = useMemo(() => matches.filter((app) => !isFamilyApp(app)), [matches]);
  const family = useMemo(() => matches.filter((app) => isFamilyApp(app)), [matches]);
  const nativeTotal = useMemo(() => DESKTOP_APPS.filter((app) => !isFamilyApp(app)).length, []);
  const familyTotal = useMemo(() => DESKTOP_APPS.filter((app) => isFamilyApp(app)).length, []);
  /** the center-pop: the middle tile of the full 3×3 constellation rides
   * raised; a filtered constellation re-composes without the raise */
  const raisedId = needle === "" && scope !== "native" && family.length === familyTotal ? "forge" : null;

  /** the field's embedded action: the first match opens through the shell's
   * own contract — the router walks the app's route, family routes included */
  function openFirst(event: FormEvent) {
    event.preventDefault();
    const app = matches[0];
    if (!app) return;
    navigate(appRoute(app));
  }

  return (
    <>
      <search>
        <form
          data-akash-beat
          className="flex items-center gap-3 rounded-2xl bg-s0 px-4 py-2 ring-1 ring-hairline-strong focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-(--color-focus)"
          style={{ boxShadow: FIELD_SHADOW }}
          onSubmit={openFirst}
        >
          <span className="font-mono text-sm text-ink-3" aria-hidden="true">
            &gt;
          </span>
          <input
            className="h-11 min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-3"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={osText("explore.launch.placeholder")}
            aria-label={osText("explore.launch.search.aria")}
            autoComplete="off"
            spellCheck={false}
          />
          {needle !== "" && (
            <span className="hidden font-mono text-[11px] text-ink-3 sm:block" role="status">
              {matches.length === 1
                ? osText("explore.launch.answer").replace("{count}", String(matches.length))
                : osText("explore.launch.answers").replace("{count}", String(matches.length))}
            </span>
          )}
          <button
            type="submit"
            className="inline-flex h-11 flex-none items-center gap-1.5 rounded-lg bg-win px-4 text-sm font-semibold text-(--win-accent-ink) transition-[filter,transform] duration-150 ease-micro hover:brightness-95 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus) motion-reduce:transition-none"
            style={{ boxShadow: TRYLLE_PRIMARY_STACK }}
          >
            {osText("explore.launch.open")}
            <ArrowUpRight fontSize={14} aria-hidden="true" />
          </button>
        </form>
      </search>

      <fieldset
        data-akash-beat
        className="flex flex-wrap items-center gap-2 pt-4"
        aria-label={osText("explore.launch.filters.aria")}
      >
        {SCOPES.map((entry) => (
          <button
            key={entry.id}
            type="button"
            className="min-h-11 rounded-md bg-s0 px-4 text-sm font-medium text-ink-2 ring-1 ring-hairline transition-[background-color,color,transform] duration-150 ease-micro hover:bg-s1 hover:text-ink aria-pressed:bg-s2 aria-pressed:text-ink active:scale-[.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus) motion-reduce:transition-none"
            aria-pressed={scope === entry.id}
            onClick={() => setScope(entry.id)}
          >
            {entry.label}
          </button>
        ))}
        <span className="ml-1 font-mono text-[11px] text-ink-3">
          {osText("explore.launch.tally")
            .replace("{native}", String(nativeTotal))
            .replace("{family}", String(familyTotal))}
        </span>
      </fieldset>

      <HeroWaves
        caption={osText("explore.launch.waves.caption")}
        meta={osText("explore.launch.waves.meta")
          .replace("{native}", String(nativeTotal))
          .replace("{family}", String(familyTotal))}
      />

      <div className="grid gap-12 lg:grid-cols-[1.05fr_1fr]" id="constellation">
        <div>
          <RailHead
            cap={osText("explore.launch.native.cap")}
            title={osText("explore.launch.native.title")}
            meta={
              native.length === nativeTotal
                ? osText("explore.launch.native.meta")
                : osText("explore.launch.native.metaPartial")
                    .replace("{count}", String(native.length))
                    .replace("{total}", String(nativeTotal))
            }
          />
          <div className="flex flex-col divide-y divide-hairline">
            {native.map((app, index) => (
              <NativeRow key={app.id} app={app} featured={index === 0} />
            ))}
            {native.length === 0 && (
              <p className="py-6 font-mono text-xs text-ink-3">
                {needle !== ""
                  ? osText("explore.launch.native.empty").replace("{query}", query)
                  : osText("explore.launch.native.resting")}
              </p>
            )}
          </div>
        </div>

        <div id="family">
          <RailHead
            cap={osText("explore.launch.family.cap")}
            title={osText("explore.launch.family.title")}
            meta={osText("explore.launch.family.meta")}
          />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {family.map((app, index) => (
              <FamilyTile key={app.id} app={app} index={index} raised={app.id === raisedId} />
            ))}
            {family.length === 0 && (
              <p className="py-6 font-mono text-xs text-ink-3">
                {needle !== ""
                  ? osText("explore.launch.family.empty").replace("{query}", query)
                  : osText("explore.launch.family.resting")}
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
