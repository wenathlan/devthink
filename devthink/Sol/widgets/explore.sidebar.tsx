/**
 * sidebar.tsx — the explore rail, the captured sidebar grammar: nouns
 * first (the eight categories of the gallery as noun rows), the section
 * stacks under them (recents — the made media the catalog serves; the
 * family — the surface switchers of the registry), and a per-row overflow
 * menu on every row whose items speak the soft imperatives of three to
 * five words ("open the surface", "browse the entries", "open the window",
 * "visit the site"), every string through the label stores.
 *
 * The rows answer the eight states: rest, hover, press (translate-y-px),
 * the visible focus ring, the pressed selection (aria-pressed + the s2
 * band), the disabled guard, the skeleton while the catalog reads and the
 * honest error banner with the retry. The menu rides the menu band of the
 * z ladder, closes on Escape and on the outside pointer, and returns the
 * focus to its own button. Data comes exclusively from the props the
 * anchor loads — the category table, the catalog answer, the registry —
 * nothing is hardcoded here.
 */
import { MoreHorizontalRegular as More, type FluentIcon } from "@fluentui/react-icons";
import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { label } from "../../labels.ts";
import type { DesktopApp } from "../../appregistry.ts";
import type { FamilySite } from "../../catalog";
import { FamilyMark } from "./explore.launchdeck.tsx";
import type { ExploreCategoryId, ExploreCategoryRow, ExploreEntry } from "./explore.sections.tsx";
import { Banner } from "./shell.banner.tsx";
import { Dot } from "./shell.dot.tsx";

/** the fallback tint a family mark falls back to when the registry grows a
 * row the identity map does not know yet (never a blank tile) */
const FALLBACK_TINT = "#9aa3b5";

/** the raise of the menu surface (the trylle raised stack, ≤26% black) */
const MENU_SHADOW = "0 2px 3px rgb(0 0 0 / 26%), 0 6px 20px -4px rgb(0 0 0 / 22%)";

/** one item of a per-row overflow menu: the soft imperative text and the
 * real door it opens — an internal href, an external href or an action. */
type RowMenuItem = {
  key: string;
  text: string;
  href?: string;
  external?: boolean;
  onSelect?: () => void;
};

/** the honest count line of a category row (mirrors the deck readout) */
function countLine(count: number | null): string {
  if (count === null) return label("explore.sidebar.pending");
  if (count === 0) return label("explore.sidebar.none");
  return label("explore.sidebar.count").replace("{count}", String(count));
}

/** the menu item grammar: one row, the visible focus ring, the press */
const ITEM_CLASS =
  "flex min-h-9 w-full items-center rounded-md px-2.5 text-left text-[13px] text-ink-2 transition-colors duration-150 ease-micro hover:bg-s3 hover:text-ink focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--color-focus) motion-reduce:transition-none";

/**
 * RowMenu — the per-row overflow menu of the captured grammar: the ellipsis
 * fades in on the row hover (and stays for the keyboard), the menu opens on
 * the menu band of the z ladder, Escape and the outside pointer close it
 * and the focus walks back to the button.
 */
function RowMenu(props: { title: string; items: RowMenuItem[] }) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (boxRef.current && !boxRef.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (props.items.length === 0) return null;
  return (
    <div ref={boxRef} className="relative flex-none">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={props.title}
        onClick={() => setOpen((value) => !value)}
        className="grid h-7 w-7 place-items-center rounded-md text-ink-3 opacity-0 transition-[opacity,background-color,color,transform] duration-150 ease-micro hover:bg-s2 hover:text-ink active:scale-95 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--color-focus) group-hover/row:opacity-100 aria-expanded:opacity-100 motion-reduce:transition-none"
      >
        <More fontSize={14} aria-hidden="true" />
      </button>
      {open && (
        <div
          role="menu"
          aria-label={props.title}
          className="absolute right-0 top-8 min-w-[184px] rounded-lg bg-s2 p-1 ring-1 ring-hairline-strong"
          style={{ zIndex: "var(--z-menu)", boxShadow: MENU_SHADOW }}
        >
          {props.items.map((item) =>
            item.href && item.external ? (
              <a
                key={item.key}
                role="menuitem"
                href={item.href}
                target="_blank"
                rel="noreferrer"
                onClick={() => setOpen(false)}
                className={ITEM_CLASS}
              >
                {item.text}
              </a>
            ) : item.href ? (
              <Link
                key={item.key}
                role="menuitem"
                href={item.href}
                onClick={() => setOpen(false)}
                className={ITEM_CLASS}
              >
                {item.text}
              </Link>
            ) : (
              <button
                key={item.key}
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  item.onSelect?.();
                }}
                className={ITEM_CLASS}
              >
                {item.text}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
}

/** the section caption of one stack (the mono voice of the rail) */
function StackCaption(props: { text: string }) {
  return (
    <p className="px-2.5 font-mono text-[10px] tracking-[.08em] text-ink-3">{props.text}</p>
  );
}

/** the row shell: the 44px target, the hover band, the press physics, the
 * visible focus ring — the eight states live in this class */
const ROW_CLASS =
  "flex min-h-11 min-w-0 flex-1 items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm text-ink-2 transition-[background-color,color,transform] duration-150 ease-micro hover:bg-s2 hover:text-ink aria-pressed:bg-s2 aria-pressed:text-ink active:translate-y-px focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--color-focus) motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-50";

/** one category noun row: glyph, noun, the honest state dot, the count and
 * the overflow menu (browse the entries · open the surface). */
function CategoryRow(props: {
  category: ExploreCategoryRow;
  active: boolean;
  onPick: (id: ExploreCategoryId) => void;
}) {
  const { category } = props;
  const Icon = category.icon as FluentIcon;
  const menu: RowMenuItem[] = [
    { key: "browse", text: label("explore.sidebar.act.browse"), onSelect: () => props.onPick(category.id) },
  ];
  if (category.route) {
    menu.push({ key: "surface", text: label("explore.sidebar.act.openSurface"), href: category.route });
  }
  return (
    <div className="group/row flex items-center gap-0.5">
      <button
        type="button"
        aria-pressed={props.active}
        aria-label={label("explore.sidebar.rowAria")
          .replace("{name}", category.name)
          .replace("{detail}", countLine(category.count))}
        onClick={() => props.onPick(category.id)}
        className={ROW_CLASS}
      >
        <Icon fontSize={15} style={{ color: category.tint }} aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate">{category.name}</span>
        <Dot
          tone={category.count === null ? "info" : category.count > 0 ? "ok" : "neutral"}
          pulse={category.count === null}
          title={countLine(category.count)}
        />
        {category.count !== null && (
          <span className="font-mono text-[10px] text-ink-3" style={{ fontVariantNumeric: "tabular-nums" }}>
            {category.count}
          </span>
        )}
      </button>
      <RowMenu
        title={label("explore.sidebar.overflow").replace("{name}", category.name)}
        items={menu}
      />
    </div>
  );
}

/** one family row of the surface switchers: the animated mark (the registry
 * tint), the name and the overflow menu (open the window · visit the site
 * when the real site row answers). */
function FamilyRow(props: { app: DesktopApp; sites: FamilySite[] | null }) {
  const tint = props.app.tint;
  const site = props.sites?.find((row) => row.host.startsWith(`https://${props.app.id}.`)) ?? null;
  const menu: RowMenuItem[] = [
    { key: "window", text: label("explore.sidebar.act.openWindow"), href: `/${props.app.id}` },
  ];
  if (site) {
    menu.push({
      key: "site",
      text: label("explore.sidebar.act.visitSite"),
      href: site.host,
      external: true });
  }
  return (
    <div className="group/row flex items-center gap-0.5">
      <Link
        href={`/${props.app.id}`}
        aria-label={label("explore.sidebar.rowAria")
          .replace("{name}", props.app.name)
          .replace("{detail}", props.app.detail)}
        className={ROW_CLASS}
      >
        <span className="grid h-4 w-4 flex-none place-items-center" aria-hidden="true">
          <FamilyMark id={props.app.id} tint={tint} size={16} />
        </span>
        <span className="min-w-0 flex-1 truncate">{props.app.name}</span>
      </Link>
      <RowMenu
        title={label("explore.sidebar.overflow").replace("{name}", props.app.name)}
        items={menu}
      />
    </div>
  );
}

/** one recent row: the made media the catalog answers, opened on its real
 * studio surface, with the overflow menu carrying the same imperative. */
function RecentRow(props: { entry: ExploreEntry }) {
  const entry = props.entry;
  if (!entry.route) return null;
  return (
    <div className="group/row flex items-center gap-0.5">
      <Link
        href={entry.route}
        aria-label={label("explore.sidebar.rowAria").replace("{name}", entry.title).replace("{detail}", entry.meta)}
        className={ROW_CLASS}
      >
        <span
          className="h-2 w-2 flex-none rounded-full"
          style={{ background: entry.tint ?? FALLBACK_TINT }}
          aria-hidden="true"
        />
        <span className="min-w-0 flex-1 truncate">{entry.title}</span>
      </Link>
      <RowMenu
        title={label("explore.sidebar.overflow").replace("{name}", entry.title)}
        items={[{ key: "studio", text: label("explore.detail.act.studio"), href: entry.route }]}
      />
    </div>
  );
}

/** the skeleton rows of a stack while the catalog reads */
function StackSkeleton() {
  return (
    <div className="flex flex-col gap-1 px-1" aria-hidden="true">
      {[0, 1, 2].map((row) => (
        <div key={row} className="anim-skeleton h-8 rounded-md bg-s1" />
      ))}
    </div>
  );
}

/**
 * ExploreSidebar — the explore rail. Docks left on the wide frames (sticky
 * under the chrome) and rides above the stage on the narrow ones, so the
 * noun list stays the first browsing surface on every ladder step.
 */
export function ExploreSidebar(props: {
  categories: ExploreCategoryRow[];
  recents: ExploreEntry[] | null;
  family: DesktopApp[];
  sites: FamilySite[] | null;
  failed: boolean;
  active: ExploreCategoryId | null;
  onPick: (id: ExploreCategoryId) => void;
  onRetry: () => void;
}) {
  return (
    <aside
      aria-label={label("explore.sidebar.aria")}
      className="w-full flex-none lg:sticky lg:top-3 lg:w-[264px]"
      style={{ scrollMarginTop: "12px" }}
    >
      <nav className="panel-silk flex flex-col gap-4">
        {props.failed && (
          <Banner
            tone="err"
            role="alert"
            title={label("explore.state.error")}
            action={
              <button type="button" className="silk-btn text-xs" onClick={props.onRetry}>
                {label("explore.state.retry")}
              </button>
            }
          />
        )}

        <div className="flex flex-col gap-1">
          <StackCaption text={label("explore.sidebar.categories")} />
          {props.categories.map((category) => (
            <CategoryRow
              key={category.id}
              category={category}
              active={props.active === category.id}
              onPick={props.onPick}
            />
          ))}
        </div>

        <div className="flex flex-col gap-1 border-t border-hairline pt-3">
          <StackCaption text={label("explore.sidebar.recents")} />
          {props.recents === null ? (
            <StackSkeleton />
          ) : props.recents.length === 0 ? (
            <div className="px-2.5 py-1">
              <p className="text-xs leading-[1.5] text-ink-3">{label("explore.sidebar.recentsEmpty")}</p>
              <Link
                href="/video"
                className="mt-2 inline-flex min-h-9 items-center rounded-md px-0 text-xs font-medium text-ink-2 underline decoration-hairline-strong underline-offset-4 transition-colors duration-150 ease-micro hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus) motion-reduce:transition-none"
              >
                {label("explore.sidebar.recentsAct")}
              </Link>
            </div>
          ) : (
            props.recents.slice(0, 5).map((entry) => <RecentRow key={entry.id} entry={entry} />)
          )}
        </div>

        <div className="flex flex-col gap-1 border-t border-hairline pt-3">
          <StackCaption text={label("explore.sidebar.family")} />
          {props.family.length === 0 ? (
            <p className="px-2.5 py-1 text-xs leading-[1.5] text-ink-3">
              {label("explore.sidebar.familyEmpty")}
            </p>
          ) : (
            props.family.map((app) => <FamilyRow key={app.id} app={app} sites={props.sites} />)
          )}
        </div>
      </nav>
    </aside>
  );
}
