/**
 * sections.tsx — the category experience of the explore hub. The hub is a
 * gallery, not a settings page: the person enters and explores — the
 * categories of video, image, audio, three dee, code, documents, sandbox
 * runs and community shares, each mapped to the real surfaces the family
 * already serves (the studios of the catalog, the console modules, the
 * institutional documents, the runner shelf, the family sites — the
 * registry rows and the catalog accessors answer, nothing is invented).
 *
 * The grammar rides the captures: the category rail (the nouns first, ONE
 * card raised for the active category), the section deck per category with
 * the real entries the catalog answers, the detail view per entry (the
 * silk inspector with the chips and the soft imperative actions) and the
 * share surface (the community shares category listing the family sites).
 * The states are the honest ladder: the skeleton while the catalog reads,
 * the empty with the next action, the error with the retry — zero fake
 * rows, zero invented numbers, zero demo content.
 *
 * Design law: the silk surfaces for the cards and the inspector, the ladder
 * bands (s0 → s1 → s2) for the layers, the press physics and the visible
 * focus ring on every interactive row, the entrance stagger under the
 * second (60ms beats, capped), the reduced motion respected. Every string
 * rides the label stores — the new keys through labels.ts, the inherited
 * explore rows through oslabels.ts.
 */
import {
  ArrowLeftRegular as ArrowLeft,
  ArrowRightRegular as ArrowRight,
  BookOpenRegular as BookOpen,
  CubeRegular as Cube,
  DismissRegular as X,
  GlobeRegular as Globe,
  ImageRegular as Image,
  MusicNote2Regular as AudioLines,
  TargetRegular as Crosshair,
  VideoClipRegular as Clapperboard,
  WindowConsoleRegular as Terminal,
  type FluentIcon } from "@fluentui/react-icons";
import { type Ref, useEffect, useRef } from "react";
import { Link } from "wouter";
import { label, type LabelKey } from "../../labels.ts";
import { osText } from "../../oslabels.ts";
import type {
  AboutBlock,
  CoreModule,
  FamilySite,
  LegalSection,
  RunnerBinary,
  StudioAsset,
  StudioTrack } from "../../catalog";
import { Banner } from "./ShellBanner.tsx";
import { Chip } from "./ShellChip.tsx";
import { Dot } from "./ShellDot.tsx";
import { TRYLLE_CARD_SHADOW, TRYLLE_CARD_SHADOW_RAISED } from "./ExploreLaunchdeck.tsx";

/** the doctrine micro curve of every quiet entrance */
const MICRO = "cubic-bezier(0.22, 1, 0.36, 1)";

/* --------------------------------- types --------------------------------- */

export type ExploreCategoryId =
  | "video"
  | "image"
  | "audio"
  | "model3d"
  | "code"
  | "documents"
  | "sandbox"
  | "shares";

export type ExploreEntryKind = "asset" | "track" | "module" | "document" | "site" | "binary";

/** one real entry of the catalog, uniform across the categories: the detail
 * view reads the body lines, the actions read the route and the href. */
export type ExploreEntry = {
  id: string;
  kind: ExploreEntryKind;
  title: string;
  /** the mono meta line (engine · duration · host — the real fields) */
  meta: string;
  /** the detail paragraphs — the real copy the row carries */
  body: string[];
  /** the internal surface the entry opens (the real route) */
  route?: string;
  /** the external address the entry serves (the real host) */
  href?: string;
  /** the identity tint of the origin surface (the registry colors) */
  tint?: string;
};

/** one category row of the rail: the noun, the honest count and the real
 * surface the category opens. count null = the catalog has not answered. */
export type ExploreCategoryRow = {
  id: ExploreCategoryId;
  name: string;
  sub: string;
  icon: FluentIcon;
  tint: string;
  /** the primary real surface, null when the category browses in place */
  route: string | null;
  /** every real surface of the category (the deck meta line) */
  routes: string[];
  count: number | null;
};

/** the catalog bundle the anchor loads once and every zone reads. */
export type ExploreData = {
  assets: StudioAsset[];
  tracks: StudioTrack[];
  modules: CoreModule[];
  sites: FamilySite[];
  about: AboutBlock[];
  terms: LegalSection[];
  policy: LegalSection[];
  binaries: RunnerBinary[];
};

/* ------------------------------ the category table ------------------------ */

/** the identity tints of the categories — every one rides the registry tint
 * of the surface it opens (the chrome stays neutral graphite). */
const CATEGORY_TINT: Record<ExploreCategoryId, string> = {
  video: "#f472b6",
  image: "#c084fc",
  audio: "#d9962e",
  model3d: "#ec4899",
  code: "#4ade80",
  documents: "#cbd5e1",
  sandbox: "#d6b483",
  shares: "#d97757" };

const CATEGORY_ICONS: Record<ExploreCategoryId, FluentIcon> = {
  video: Clapperboard,
  image: Image,
  audio: AudioLines,
  model3d: Cube,
  code: Terminal,
  documents: BookOpen,
  sandbox: Crosshair,
  shares: Globe };

/** the studio tints of the made assets (the origin surfaces of the registry) */
const STUDIO_TINT: Record<string, string> = {
  video: "#f472b6",
  image: "#c084fc",
  music: "#d9962e",
  model3d: "#ec4899" };

/** the studio tags of the made assets, by their catalog studio field (any
 * studio value the paired database adds falls back to its own name) */
function assetTag(asset: StudioAsset): string {
  const tags: Record<string, string> = {
    video: osText("explore.studio.video"),
    image: osText("explore.studio.image"),
    music: osText("explore.studio.music"),
    model3d: osText("explore.studio.model3d") };
  return tags[asset.studio] ?? asset.studio;
}

/** the family route of a site row: the slug parsed from the real name of
 * the row ("argan — dns & gateway" rides /argan) — guarded, never guessed. */
function siteSlug(site: FamilySite): string | null {
  const slug = site.name.split(" — ")[0]?.trim() ?? "";
  return /^[a-z0-9]+$/.test(slug) ? slug : null;
}

/** The category table: the eight nouns of the gallery bound to the real
 * surfaces of the family and the honest counts of the catalog answer. */
export function exploreCategories(data: ExploreData | null): ExploreCategoryRow[] {
  const assets = data?.assets ?? [];
  const tracks = data?.tracks ?? [];
  const modules = data?.modules ?? [];
  const sites = data?.sites ?? [];
  const about = data?.about ?? [];
  const terms = data?.terms ?? [];
  const policy = data?.policy ?? [];
  const binaries = data?.binaries ?? [];
  const answered = data !== null;
  const rows: Array<Omit<ExploreCategoryRow, "icon" | "tint">> = [
    {
      id: "video",
      name: label("explore.cat.video"),
      sub: label("explore.cat.video.sub"),
      route: "/video",
      routes: ["/video"],
      count: answered ? assets.filter((asset) => asset.studio === "video").length : null },
    {
      id: "image",
      name: label("explore.cat.image"),
      sub: label("explore.cat.image.sub"),
      route: "/image",
      routes: ["/image"],
      count: answered ? assets.filter((asset) => asset.studio === "image").length : null },
    {
      id: "audio",
      name: label("explore.cat.audio"),
      sub: label("explore.cat.audio.sub"),
      route: "/audio",
      routes: ["/audio"],
      count: answered
        ? tracks.length + assets.filter((asset) => asset.studio === "music").length
        : null },
    {
      id: "model3d",
      name: label("explore.cat.model3d"),
      sub: label("explore.cat.model3d.sub"),
      route: "/cadria",
      routes: ["/cadria"],
      count: answered ? assets.filter((asset) => asset.studio === "model3d").length : null },
    {
      id: "code",
      name: label("explore.cat.code"),
      sub: label("explore.cat.code.sub"),
      route: "/console",
      routes: ["/console", "/docs"],
      count: answered ? modules.length : null },
    {
      id: "documents",
      name: label("explore.cat.documents"),
      sub: label("explore.cat.documents.sub"),
      route: "/docs",
      routes: ["/docs", "/about", "/terms", "/policy"],
      count: answered ? about.length + terms.length + policy.length : null },
    {
      id: "sandbox",
      name: label("explore.cat.sandbox"),
      sub: label("explore.cat.sandbox.sub"),
      route: "/games",
      routes: ["/games", "/forge", "/foundry", "/saddle"],
      count: answered ? binaries.length : null },
    {
      id: "shares",
      name: label("explore.cat.shares"),
      sub: label("explore.cat.shares.sub"),
      route: null,
      routes: sites.map((site) => siteSlug(site)).filter((slug): slug is string => slug !== null).map((slug) => `/${slug}`),
      count: answered ? sites.length : null },
  ];
  return rows.map((row) => ({ ...row, icon: CATEGORY_ICONS[row.id], tint: CATEGORY_TINT[row.id] }));
}

/* ------------------------------ the entry builders ------------------------ */

function assetEntry(asset: StudioAsset, route: string): ExploreEntry {
  return {
    id: `asset:${asset.id}`,
    kind: "asset",
    title: asset.title,
    meta: `${asset.engine} · ${asset.duration ?? asset.size ?? osText("image.stills.unknownSize")}`,
    body: [`${assetTag(asset)} — ${asset.engine}`],
    route,
    tint: STUDIO_TINT[asset.studio] };
}

/** The entries of one category — every row built from the real catalog
 * answer, none invented. */
export function exploreEntries(id: ExploreCategoryId, data: ExploreData): ExploreEntry[] {
  switch (id) {
    case "video":
      return data.assets.filter((asset) => asset.studio === "video").map((asset) => assetEntry(asset, "/video"));
    case "image":
      return data.assets.filter((asset) => asset.studio === "image").map((asset) => assetEntry(asset, "/image"));
    case "audio": {
      const trackEntries: ExploreEntry[] = data.tracks.map((track) => ({
        id: `track:${track.id}`,
        kind: "track",
        title: track.title,
        meta: `${track.minutes} min · ${track.blurb}`,
        body: [track.blurb],
        route: "/audio",
        tint: STUDIO_TINT.music }));
      const musicAssets: ExploreEntry[] = data.assets
        .filter((asset) => asset.studio === "music")
        .map((asset) => assetEntry(asset, "/audio"));
      return [...trackEntries, ...musicAssets];
    }
    case "model3d":
      return data.assets
        .filter((asset) => asset.studio === "model3d")
        .map((asset) => assetEntry(asset, "/cadria"));
    case "code":
      return data.modules.map((module) => ({
        id: `module:${module.name}`,
        kind: "module",
        title: module.name,
        meta: module.role,
        body: [module.role],
        route: "/console" }));
    case "documents": {
      const documentEntry = (section: LegalSection, route: string): ExploreEntry => ({
        id: `document:${route.slice(1)}:${section.id}`,
        kind: "document",
        title: section.title,
        meta: label("explore.state.paragraphs").replace("{count}", String(section.paragraphs.length)),
        body: section.paragraphs,
        route });
      return [
        ...data.about.map((block): ExploreEntry => ({
          id: `document:about:${block.id}`,
          kind: "document",
          title: block.heading,
          meta: label("explore.state.paragraphs").replace("{count}", String(block.body.length)),
          body: block.body,
          route: "/about" })),
        ...data.terms.map((section) => documentEntry(section, "/terms")),
        ...data.policy.map((section) => documentEntry(section, "/policy")),
      ];
    }
    case "sandbox":
      return data.binaries.map((binary) => ({
        id: `binary:${binary.id}`,
        kind: "binary",
        title: binary.title,
        meta: `${binary.formats} · ${binary.runner}`,
        body: [binary.blurb],
        route: "/games" }));
    case "shares":
      return data.sites.map((site) => {
        const slug = siteSlug(site);
        return {
          id: `site:${slug ?? site.host}`,
          kind: "site",
          title: site.name,
          meta: site.host.replace(/^https?:\/\//, ""),
          body: [site.blurb],
          ...(slug ? { route: `/${slug}` } : {}),
          href: site.host,
          tint: CATEGORY_TINT.shares } satisfies ExploreEntry;
      });
  }
}

/** The recents rows of the sidebar: the made media the catalog serves, in
 * catalog order — video, image, 3d and music, straight from the answer. */
export function exploreRecents(data: ExploreData): ExploreEntry[] {
  const assetEntries: ExploreEntry[] = data.assets
    .filter((asset) => asset.studio !== "music")
    .map((asset) =>
      assetEntry(
        asset,
        asset.studio === "model3d" ? "/cadria" : asset.studio === "video" ? "/video" : "/image",
      ),
    );
  const trackEntries: ExploreEntry[] = data.tracks.map((track) => ({
    id: `track:${track.id}`,
    kind: "track",
    title: track.title,
    meta: `${track.minutes} min · ${track.blurb}`,
    body: [track.blurb],
    route: "/audio",
    tint: STUDIO_TINT.music }));
  const musicEntries: ExploreEntry[] = data.assets
    .filter((asset) => asset.studio === "music")
    .map((asset) => assetEntry(asset, "/audio"));
  return [...assetEntries, ...trackEntries, ...musicEntries];
}

/* --------------------------------- motion -------------------------------- */

/** the entrance stagger of one zone: every data-akash-beat child rises once
 * in a 60ms beat walk, capped so the tail never crawls; reduced motion and
 * the absent Web Animations API skip the walk. */
function useEnterStagger(ref: Ref<HTMLElement | null>) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const stage = ref && "current" in ref ? ref.current : null;
    if (!stage) return;
    const beats = Array.from(stage.querySelectorAll<HTMLElement>("[data-akash-beat]")).map((el, index) =>
      el.animate(
        [
          { opacity: 0, transform: "translateY(14px)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        { duration: 600, delay: Math.min(index, 7) * 60, easing: MICRO, fill: "backwards" },
      ),
    );
    return () => {
      for (const beat of beats) beat.cancel();
    };
  }, []);
}

/* ------------------------------ the shared bits --------------------------- */

/** the honest count line of a category (the real answer, never a claim) */
function countLine(count: number | null): string {
  if (count === null) return label("explore.sidebar.pending");
  if (count === 0) return label("explore.sidebar.none");
  return label("explore.sidebar.count").replace("{count}", String(count));
}

/** the kind nouns of the entries, through the label store */
const KIND_LABEL: Record<ExploreEntryKind, LabelKey> = {
  asset: "explore.state.kind.asset",
  track: "explore.state.kind.track",
  module: "explore.state.kind.module",
  document: "explore.state.kind.document",
  site: "explore.state.kind.site",
  binary: "explore.state.kind.binary" };

function kindLabel(kind: ExploreEntryKind): string {
  return label(KIND_LABEL[kind]);
}

/** the section head of one zone (mono cap, display title, sub) */
function ZoneHead(props: { cap: string; title: string; sub: string; id?: string }) {
  return (
    <header data-akash-beat className="mb-8 max-w-[56ch]">
      <p className="font-mono text-[10px] tracking-[.08em] text-ink-3">{props.cap}</p>
      <h2 id={props.id} className="mt-2 font-display text-2xl font-semibold tracking-[-0.02em] text-ink">
        {props.title}
      </h2>
      <p className="mt-2 text-sm leading-[1.55] text-ink-2">{props.sub}</p>
    </header>
  );
}

/** the merged zone ref: the stagger reads the inner ref, the anchor reads
 * the external one — one element, two readers. */
function mergeZoneRef(
  inner: { current: HTMLElement | null },
  external?: Ref<HTMLElement | null>,
) {
  return (el: HTMLElement | null) => {
    inner.current = el;
    if (!external) return;
    if (typeof external === "function") external(el);
    else (external as { current: HTMLElement | null }).current = el;
  };
}

/* ------------------------------ the category deck ------------------------- */

/**
 * CategoryDeck — the category rail: the eight nouns as trylle cards, ONE
 * raised for the active category (the selection signal), each carrying the
 * honest count of the catalog answer and the mono readout of its real
 * surfaces. A card picks the category — the section deck opens under it.
 */
export function CategoryDeck(props: {
  categories: ExploreCategoryRow[];
  active: ExploreCategoryId | null;
  loading: boolean;
  onPick: (id: ExploreCategoryId) => void;
  zoneRef?: Ref<HTMLElement | null>;
}) {
  const zoneRef = useRef<HTMLElement | null>(null);
  useEnterStagger(zoneRef);
  return (
    <section
      ref={mergeZoneRef(zoneRef, props.zoneRef)}
      className="scroll-mt-24 pb-14"
      id="categories"
      aria-label={label("explore.categories.aria")}
    >
      <ZoneHead
        id="dt-sec-categories"
        cap={label("explore.categories.cap")}
        title={label("explore.categories.title")}
        sub={label("explore.categories.sub")}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {props.categories.map((category) => {
          const active = props.active === category.id;
          const Icon = category.icon;
          return (
            <button
              key={category.id}
              type="button"
              data-akash-beat
              aria-pressed={active}
              onClick={() => props.onPick(category.id)}
              title={label("explore.categories.pick").replace("{name}", category.name)}
              className={`group relative flex h-full flex-col gap-3 overflow-hidden rounded-2xl p-6 text-left ring-1 ring-hairline-strong transition-[background-color,transform] duration-150 ease-micro hover:bg-s1 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus) motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-50 ${
                active ? "bg-s1" : "bg-s0"
              }`}
              style={{
                boxShadow: active ? TRYLLE_CARD_SHADOW_RAISED : TRYLLE_CARD_SHADOW,
                backgroundImage: `radial-gradient(150px 110px at 20% 12%, ${category.tint}24, transparent 70%)` }}
            >
              <span
                className="grid h-10 w-10 flex-none place-items-center rounded-lg ring-1 ring-hairline"
                style={{ background: `color-mix(in srgb, ${category.tint} 14%, transparent)` }}
                aria-hidden="true"
              >
                <Icon fontSize={18} style={{ color: category.tint }} />
              </span>
              <span className="mt-auto pt-2 text-sm font-semibold tracking-[-0.01em] text-ink">
                {category.name}
              </span>
              <span className="line-clamp-2 text-xs leading-[1.5] text-ink-2">{category.sub}</span>
              <span className="flex items-center gap-2 font-mono text-[11px] text-ink-3">
                <Dot
                  tone={category.count === null ? "info" : category.count > 0 ? "ok" : "neutral"}
                  pulse={category.count === null && props.loading}
                  title={countLine(category.count)}
                />
                <span style={{ fontVariantNumeric: "tabular-nums" }}>{countLine(category.count)}</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

/* ------------------------------ the skeletons ----------------------------- */

/** the honest loading faces: the skeleton rows and cards of the ladder */
function RowSkeleton() {
  return (
    <div className="flex flex-col divide-y divide-hairline" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((row) => (
        <div key={row} className="px-3 py-2.5">
          <div className="anim-skeleton h-4 w-2/3 rounded-xs bg-s1" />
          <div className="anim-skeleton mt-2 h-3 w-1/3 rounded-xs bg-s1" />
        </div>
      ))}
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
      {[0, 1, 2].map((card) => (
        <div key={card} className="anim-skeleton h-[150px] rounded-2xl bg-s1" />
      ))}
    </div>
  );
}

/* ------------------------------ the entry detail -------------------------- */

/** the actions of one entry: the real surfaces the detail opens, in order. */
function entryActions(entry: ExploreEntry): Array<{ key: string; text: string; route?: string; href?: string }> {
  switch (entry.kind) {
    case "asset":
    case "track":
      return [{ key: "studio", text: label("explore.detail.act.studio"), route: entry.route }];
    case "module":
      return [
        { key: "console", text: label("explore.detail.act.console"), route: "/console" },
        { key: "docs", text: label("explore.detail.act.docs"), route: "/docs" },
      ];
    case "document":
      return [{ key: "read", text: label("explore.detail.act.read"), route: entry.route }];
    case "site": {
      const actions: Array<{ key: string; text: string; route?: string; href?: string }> = [];
      if (entry.route) actions.push({ key: "window", text: label("explore.detail.act.window"), route: entry.route });
      if (entry.href) actions.push({ key: "visit", text: label("explore.detail.act.visit"), href: entry.href });
      return actions;
    }
    case "binary":
      return [{ key: "runner", text: label("explore.deck.act.runner"), route: entry.route }];
  }
}

/**
 * EntryDetail — the detail view of one entry: the silk inspector carrying
 * the kind chip, the real addresses, the body paragraphs of the row and
 * the soft imperative actions (three to five words, through the label
 * store). Closes back into the deck.
 */
export function EntryDetail(props: { entry: ExploreEntry; onClose: () => void }) {
  const zoneRef = useRef<HTMLElement | null>(null);
  useEnterStagger(zoneRef);
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    zoneRef.current?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "nearest" });
  }, []);
  const actions = entryActions(props.entry);
  const [primary, ...rest] = actions;
  return (
    <section
      ref={zoneRef}
      data-akash-beat
      className="panel-silk mt-8"
      style={{ scrollMarginTop: "96px" }}
      aria-label={label("explore.detail.aria")}
    >
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Chip tone="info">{kindLabel(props.entry.kind)}</Chip>
            {props.entry.route && (
              <Chip tone="neutral">
                <code className="font-mono text-[11px]">{props.entry.route}</code>
              </Chip>
            )}
            {props.entry.href && (
              <Chip tone="neutral">
                <span className="font-mono text-[11px]">{props.entry.href.replace(/^https?:\/\//, "")}</span>
              </Chip>
            )}
          </div>
          <h3 className="mt-3 font-display text-xl font-semibold tracking-[-0.02em] text-ink">
            {props.entry.title}
          </h3>
          <p className="mt-1 font-mono text-[11px] leading-[1.5] text-ink-3">{props.entry.meta}</p>
        </div>
        <button
          type="button"
          onClick={props.onClose}
          aria-label={label("explore.detail.close")}
          className="grid h-9 w-9 flex-none place-items-center rounded-md text-ink-2 transition-colors duration-150 ease-micro hover:bg-s2 hover:text-ink active:scale-[.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus) motion-reduce:transition-none"
        >
          <X fontSize={15} aria-hidden="true" />
        </button>
      </header>
      <div className="mt-4 space-y-2">
        {props.entry.body.map((paragraph, index) => (
          <p key={index} className="text-sm leading-[1.55] text-ink-2">
            {paragraph}
          </p>
        ))}
      </div>
      {actions.length > 0 && (
        <footer className="mt-5 flex flex-wrap items-center gap-3">
          {primary &&
            (primary.href ? (
              <a
                className="silk-btn inline-flex items-center gap-1.5 text-sm"
                href={primary.href}
                target="_blank"
                rel="noreferrer"
              >
                {primary.text}
                <Globe fontSize={14} aria-hidden="true" />
              </a>
            ) : (
              primary.route && (
                <Link className="silk-btn inline-flex items-center gap-1.5 text-sm" href={primary.route}>
                  {primary.text}
                  <ArrowRight fontSize={14} aria-hidden="true" />
                </Link>
              )
            ))}
          {rest.map((action) =>
            action.href ? (
              <a
                key={action.key}
                href={action.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-xs text-sm font-medium text-ink-2 underline decoration-hairline-strong underline-offset-4 transition-colors duration-150 ease-micro hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus) motion-reduce:transition-none"
              >
                {action.text}
              </a>
            ) : (
              action.route && (
                <Link
                  key={action.key}
                  href={action.route}
                  className="rounded-xs text-sm font-medium text-ink-2 underline decoration-hairline-strong underline-offset-4 transition-colors duration-150 ease-micro hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus) motion-reduce:transition-none"
                >
                  {action.text}
                </Link>
              )
            ),
          )}
        </footer>
      )}
    </section>
  );
}

/* ---------------------------- the section deck ---------------------------- */

/**
 * CategorySectionDeck — the section deck of the active category: the head
 * carrying the real surfaces, the honest ladder of states (skeleton while
 * the catalog reads, the empty with the next action, the error with the
 * retry), the real entries in the grammar their kind asks for (the media
 * and the sites as trylle cards, the modules and the documents as hairline
 * rows) and the detail view of the open entry under them. The zone remounts
 * per category, so every switch plays the entrance stagger again.
 */
export function CategorySectionDeck(props: {
  categories: ExploreCategoryRow[];
  active: ExploreCategoryId | null;
  data: ExploreData | null;
  failed: boolean;
  activeEntryId: string | null;
  onPickCategory: (id: ExploreCategoryId) => void;
  onOpenEntry: (id: string) => void;
  onCloseEntry: () => void;
  onBack: () => void;
  onRetry: () => void;
  zoneRef?: Ref<HTMLElement | null>;
}) {
  const innerRef = useRef<HTMLDivElement | null>(null);
  useEnterStagger(innerRef);
  const category = props.categories.find((row) => row.id === props.active) ?? null;
  const entries = category && props.data ? exploreEntries(category.id, props.data) : [];
  const activeEntry = entries.find((entry) => entry.id === props.activeEntryId) ?? null;
  const shareMode = category?.id === "shares";

  return (
    <section
      ref={props.zoneRef}
      className="scroll-mt-24 pb-14"
      id="deck"
      aria-label={label("explore.deck.cap")}
    >
      <div ref={innerRef} key={props.active ?? "idle"}>
        {props.failed ? (
          <Banner
            tone="err"
            role="alert"
            title={label("explore.state.error")}
            line={label("explore.state.errorLine")}
            action={
              <button type="button" className="silk-btn text-sm" onClick={props.onRetry}>
                {label("explore.state.retry")}
              </button>
            }
          />
        ) : category === null ? (
          <p data-akash-beat className="rounded-lg bg-s0 px-4 py-5 font-mono text-xs text-ink-3 ring-1 ring-hairline">
            {label("explore.deck.idle")}
          </p>
        ) : (
          <>
            <ZoneHead
              id="dt-sec-deck"
              cap={
                shareMode
                  ? label("explore.share.cap")
                  : `${label("explore.deck.cap")} · ${category.name}`
              }
              title={shareMode ? label("explore.share.title") : category.name}
              sub={shareMode ? label("explore.share.sub") : category.sub}
            />
            <div data-akash-beat className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="font-mono text-[11px] text-ink-3">{countLine(category.count)}</span>
              {category.routes.map((route) => (
                <code key={route} className="font-mono text-[11px] text-(--color-win)">
                  {route}
                </code>
              ))}
              <button
                type="button"
                onClick={props.onBack}
                className="ml-auto inline-flex min-h-9 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-ink-2 transition-colors duration-150 ease-micro hover:bg-s0 hover:text-ink active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus) motion-reduce:transition-none"
              >
                <ArrowLeft fontSize={13} aria-hidden="true" />
                {label("explore.deck.back")}
              </button>
            </div>

            {props.data === null ? (
              category.id === "code" || category.id === "documents" ? (
                <RowSkeleton />
              ) : (
                <CardSkeleton />
              )
            ) : entries.length === 0 ? (
              <div data-akash-beat className="flex flex-wrap items-center gap-3 rounded-lg bg-s0 px-4 py-5 ring-1 ring-hairline">
                <p className="font-mono text-xs text-ink-3">
                  {label("explore.deck.empty").replace("{name}", category.name)}
                </p>
                {(category.id === "video" ||
                  category.id === "image" ||
                  category.id === "audio" ||
                  category.id === "model3d") &&
                  category.route && (
                    <Link
                      className="silk-btn text-sm"
                      href={category.route}
                    >
                      {label("explore.deck.act.studio")}
                      <ArrowRight fontSize={14} aria-hidden="true" />
                    </Link>
                  )}
                {category.id === "sandbox" && (
                  <Link className="silk-btn text-sm" href="/games">
                    {label("explore.deck.act.runner")}
                    <ArrowRight fontSize={14} aria-hidden="true" />
                  </Link>
                )}
              </div>
            ) : entries[0].kind === "module" || entries[0].kind === "document" ? (
              <div data-akash-beat className="flex flex-col divide-y divide-hairline">
                {entries.map((entry, index) => (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => props.onOpenEntry(entry.id)}
                    aria-label={label("explore.deck.detail").replace("{name}", entry.title)}
                    className="group flex min-h-11 w-full items-center gap-4 rounded-lg px-3 py-2.5 text-left transition-colors duration-150 ease-micro hover:bg-s0 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus) motion-reduce:transition-none"
                  >
                    <span
                      className="w-6 flex-none font-mono text-[10px] text-ink-3"
                      style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="truncate text-sm font-semibold tracking-[-0.01em] text-ink">
                        {entry.title}
                      </span>
                      <span className="truncate font-mono text-[11px] text-ink-3">{entry.meta}</span>
                    </span>
                    <ArrowRight
                      className="flex-none text-ink-3 transition-transform duration-150 ease-micro group-hover:translate-x-0.5 motion-reduce:transition-none"
                      fontSize={14}
                      aria-hidden="true"
                    />
                  </button>
                ))}
              </div>
            ) : (
              <div data-akash-beat className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {entries.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => props.onOpenEntry(entry.id)}
                    aria-label={label("explore.deck.detail").replace("{name}", entry.title)}
                    className="group relative flex h-full flex-col gap-2 overflow-hidden rounded-2xl p-6 text-left ring-1 ring-hairline-strong transition-[background-color,transform] duration-150 ease-micro hover:bg-s1 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus) motion-reduce:transition-none"
                    style={{
                      boxShadow: TRYLLE_CARD_SHADOW,
                      backgroundImage: entry.tint
                        ? `radial-gradient(150px 110px at 20% 12%, ${entry.tint}24, transparent 70%)`
                        : undefined }}
                  >
                    <Chip tone="neutral">{kindLabel(entry.kind)}</Chip>
                    <strong className="mt-auto pt-3 font-display text-[15px] font-semibold tracking-[-0.01em] text-ink">
                      {entry.title}
                    </strong>
                    <small className="font-mono text-[11px] leading-[1.5] text-ink-3">{entry.meta}</small>
                  </button>
                ))}
              </div>
            )}

            {activeEntry && props.data !== null && (
              <EntryDetail entry={activeEntry} onClose={props.onCloseEntry} />
            )}
          </>
        )}
      </div>
    </section>
  );
}
