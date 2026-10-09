/**
 * launchdeck.tsx — the orbital launcher kit of the explore hub (campaign v3,
 * wave R1-d). The hub is a stage, not a settings page: ONE prompt-giga
 * command field (the giant input with the open action embedded inside it,
 * quick-filter chips riding below) and the app constellation — the devthink
 * native surfaces as the wide feature rail (hairline rows, never boxes) and
 * the nine external family apps as the identity grid with ONE tile raised
 * (the center-pop). Data comes exclusively from the shared registry
 * (Sol/shell/appregistry.ts) — the same rows the desktop grid, the Start
 * menu and the launcher page read; nothing is hardcoded here.
 *
 * Navigation contract (preserved from the shell):
 * - internal kinds navigate with the wouter router (`Link`, the `os` kind
 *   seeds the /os view first — the launcher page grammar);
 * - the external kind NEVER routes: family tiles are real anchors resolved
 *   through familyurl() of ../../deploybase.ts, and the field's submit
 *   hands an external match to window.location.assign() — exactly how the
 *   workspace and the jump list hand off today.
 *
 * The marks: every family tile carries ONE function motion (argan ripple,
 * cadria sway, debonair eq bars, forge ember, foundry tick, getry pulse,
 * saddle bob, stealhead sweep, vault dial) — transform/opacity loops of
 * 2.2–8.4s alternate infinite, staggered through negative delays; the
 * devthink sigil draws itself (the one stroke-dashoffset story). The
 * stylesheet owns every motion (the `ldk-m-*` part hooks in sol.css) and
 * guards it under prefers-reduced-motion / [data-motion="reduced"].
 */
import { ArrowUpRight } from "lucide-react";
import { type CSSProperties, type FormEvent, type ReactNode, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { familyurl } from "../../deploybase.ts";
import { DESKTOP_APPS, type DesktopApp, seedOsView } from "../shell/appregistry";
import { AppTile } from "../shell/apptile";
import { HeroWaves } from "./waves";

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
  getry: "#60a5fa",
  saddle: "#d6b483",
};

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
  ),
};

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
        stroke="var(--dt-orange)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        className="ldk-osmark__b"
        d="M7.5 7.5C11.5 12 16 17 20.5 20.5"
        stroke="var(--dt-orange)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** the internal route of one registry app — every kind the registry
 * declares maps to a real page of this interface (the launcher grammar);
 * the external kind never reaches here (family cells anchor to familyurl) */
function appRoute(app: DesktopApp): string {
  switch (app.target.kind) {
    case "route":
      return app.target.href;
    case "destination":
      return `/${app.target.id}`;
    case "window":
      return app.target.id === "chat" ? "/chat" : "/history";
    default:
      return "/os";
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

/** the compact deck cell of the curated rails: mark, name, one mono role
 * line — internal kinds navigate with the router, external kinds anchor to
 * the family deploy base, the os kind seeds the /os view first */
export function DeckCell({
  app,
  featured = false,
  phase = 0,
}: {
  app: DesktopApp;
  featured?: boolean;
  phase?: number;
}) {
  const body = (
    <>
      <span className="ldk-dcell__mark" aria-hidden="true">
        <DeckMark app={app} phase={phase} />
      </span>
      <span className="ldk-dcell__name">{app.name}</span>
      <span className="ldk-dcell__role">{app.detail}</span>
    </>
  );
  const className = featured ? "ldk-dcell is-featured" : "ldk-dcell";
  const label = `${app.name} — ${app.detail}`;
  if (app.target.kind === "external") {
    return (
      <a className={className} href={familyurl(app.target.slug)} aria-label={label}>
        {body}
      </a>
    );
  }
  return (
    <Link
      className={className}
      href={appRoute(app)}
      aria-label={label}
      onClick={() => {
        if (app.target.kind === "os") seedOsView(app.target.app);
      }}
    >
      {body}
    </Link>
  );
}

/** the scope chips of the command field */
type DeckScope = "all" | "native" | "family" | "pinned";
const SCOPES: ReadonlyArray<{ id: DeckScope; label: string }> = [
  { id: "all", label: "everything" },
  { id: "native", label: "native" },
  { id: "family", label: "family" },
  { id: "pinned", label: "pinned" },
];

/** the entrance slot variable of a staggered child (70ms steps, capped) */
function lotVars(index: number): CSSProperties {
  return { "--ldk-i": Math.min(index, 9) } as CSSProperties;
}

/** one native row of the feature rail: the OS's own surface as a hairline
 * row — mark, name, mono role line, the arrow nudging on hover */
function NativeRow({ app, index, featured }: { app: DesktopApp; index: number; featured: boolean }) {
  const label = `${app.name} — ${app.detail}`;
  const className = featured ? "ldk-nrow is-featured" : "ldk-nrow";
  const body = (
    <>
      <span className="ldk-nrow__mark" aria-hidden="true">
        <AppTile app={app} size={featured ? 34 : 26} />
      </span>
      <span className="ldk-nrow__body">
        <span className="ldk-nrow__name">{app.name}</span>
        <span className="ldk-nrow__role">{app.detail}</span>
      </span>
      <ArrowUpRight className="ldk-nrow__arrow" size={15} aria-hidden="true" />
    </>
  );
  return (
    <div className={className} style={lotVars(index)}>
      {app.target.kind === "external" ? (
        <a href={familyurl(app.target.slug)} aria-label={label}>
          {body}
        </a>
      ) : (
        <Link
          href={appRoute(app)}
          aria-label={label}
          onClick={() => {
            if (app.target.kind === "os") seedOsView(app.target.app);
          }}
        >
          {body}
        </Link>
      )}
    </div>
  );
}

/** one family tile of the constellation: neutral chrome, the identity light
 * source behind, the animated mark, the name and the mono role line */
function FamilyTile({ app, index, raised }: { app: DesktopApp; index: number; raised: boolean }) {
  if (app.target.kind !== "external") return null;
  const tint = FAMILY_TINT[app.id] ?? FALLBACK_TINT;
  return (
    <div className="ldk-fcell" style={lotVars(index)}>
      <a
        className={raised ? "ldk-ftile is-raised" : "ldk-ftile"}
        href={familyurl(app.target.slug)}
        aria-label={`${app.name} — ${app.detail} (opens the family site)`}
        style={{ "--ldk-tint": tint } as CSSProperties}
      >
        <FamilyMark id={app.id} tint={tint} size={34} phase={index} />
        <span className="ldk-ftile__name">{app.name}</span>
        <span className="ldk-ftile__role">{app.detail}</span>
        <ArrowUpRight className="ldk-ftile__arrow" size={14} aria-hidden="true" />
      </a>
    </div>
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
          (scope === "pinned"
            ? app.pinned
            : scope === "native"
              ? app.target.kind !== "external"
              : app.target.kind === "external");
        if (!inScope) return false;
        if (!needle) return true;
        return app.name.toLowerCase().includes(needle) || app.detail.toLowerCase().includes(needle);
      }),
    [scope, needle],
  );
  const native = useMemo(() => matches.filter((app) => app.target.kind !== "external"), [matches]);
  const family = useMemo(() => matches.filter((app) => app.target.kind === "external"), [matches]);
  const nativeTotal = useMemo(() => DESKTOP_APPS.filter((app) => app.target.kind !== "external").length, []);
  const familyTotal = useMemo(() => DESKTOP_APPS.filter((app) => app.target.kind === "external").length, []);
  /** the center-pop: the middle tile of the full 3×3 constellation rides
   * raised; a filtered constellation re-composes without the raise */
  const raisedId = needle === "" && scope !== "native" && family.length === familyTotal ? "forge" : null;

  /** the field's embedded action: the first match opens through the shell's
   * own contract (router inside, familyurl assign outside) */
  function openFirst(event: FormEvent) {
    event.preventDefault();
    const app = matches[0];
    if (!app) return;
    if (app.target.kind === "external") {
      window.location.assign(familyurl(app.target.slug));
      return;
    }
    if (app.target.kind === "os") seedOsView(app.target.app);
    navigate(appRoute(app));
  }

  return (
    <>
      <search>
        <form className="ldk-field" onSubmit={openFirst}>
          <span className="ldk-field__prompt" aria-hidden="true">
            &gt;
          </span>
          <input
            className="ldk-field__input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="type to open — every surface answers"
            aria-label="Search every app of the os"
            autoComplete="off"
            spellCheck={false}
          />
          {needle !== "" && (
            <span className="ldk-field__count" role="status">
              {matches.length} {matches.length === 1 ? "answer" : "answers"}
            </span>
          )}
          <button type="submit" className="ldk-field__go">
            open
            <ArrowUpRight size={14} aria-hidden="true" />
          </button>
        </form>
      </search>

      <fieldset className="ldk-chips" aria-label="Quick filters of the launcher">
        {SCOPES.map((entry) => (
          <button
            key={entry.id}
            type="button"
            className="ldk-chip"
            aria-pressed={scope === entry.id}
            onClick={() => setScope(entry.id)}
          >
            {entry.label}
          </button>
        ))}
        <span className="ldk-chips__meta">
          {nativeTotal} native · {familyTotal} family · none of it invented
        </span>
      </fieldset>

      <HeroWaves caption="01 · the constellation" meta={`${nativeTotal} native · ${familyTotal} family`} />

      <div className="ldk-stage" id="constellation">
        <div className="ldk-stage__native">
          <header className="ldk-railhead">
            <p className="ldk-railhead__cap">devthink · native</p>
            <h2 className="ldk-railhead__title">the os, its own surfaces</h2>
            <p className="ldk-railhead__meta">
              {native.length === nativeTotal ? "the full rail" : `${native.length} of ${nativeTotal} answer`}
            </p>
          </header>
          <div className="ldk-nrows">
            {native.map((app, index) => (
              <NativeRow key={app.id} app={app} index={index} featured={index === 0} />
            ))}
            {native.length === 0 && (
              <p className="ldk-empty">
                {needle !== ""
                  ? `no native surface answers “${query}”.`
                  : "the native rail rests — the family owns the stage."}
              </p>
            )}
          </div>
        </div>

        <div className="ldk-stage__family" id="family">
          <header className="ldk-railhead">
            <p className="ldk-railhead__cap">the family · nine</p>
            <h2 className="ldk-railhead__title">one signal color each</h2>
            <p className="ldk-railhead__meta">each tile opens its own site</p>
          </header>
          <div className="ldk-fgrid">
            {family.map((app, index) => (
              <FamilyTile key={app.id} app={app} index={index} raised={app.id === raisedId} />
            ))}
            {family.length === 0 && (
              <p className="ldk-empty">
                {needle !== ""
                  ? `no family app answers “${query}”.`
                  : "the family grid rests — the native rail owns the stage."}
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
