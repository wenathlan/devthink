/**
 * files page anchor — layer 3 of the anchor architecture. The file
 * carrying the folder's own name is the path manager of the page: it
 * mounts the explorer and re-exports the public component surface. Only
 * the theme anchor (Sol/Sol.tsx) and the window registry
 * (Sol/panel/workspace.tsx) consume this file.
 *
 * My Files — the Windows 11 File Explorer of the os, drawn after the
 * owner's reference shot of "Este Computador": the toolbar with the
 * navigation cluster (back, forward, up, refresh), the breadcrumb address
 * bar and the search field; the command bar with the New action, the sort
 * and view menus; the nav pane with quick access (the seven shell
 * folders), This PC with its drives and the opt-in external platforms;
 * the content area answering "Pastas (7)" — the folder grid of the shell
 * folders — and "Dispositivos e unidades (N)" — the drive cards with the
 * blue capacity bar and the honest free-of line; and the status bar with
 * the item count and the view toggles.
 *
 * Every figure is real: the capacity bar reads the storage manager's
 * allocation for the origin store, the drives read the machine's drive
 * registry (storagefamily.ts §harddrives), the record counts read the live
 * store summary (storagefamily.ts §db) and every folder holds the honest
 * records of its category (the
 * installed apps of the registry, the docs library modules, the runner
 * binaries, the studio catalog rows). An empty category answers "empty
 * folder" — the explorer never invents a record.
 *
 * The Windows grammar rides the whole surface: single click selects,
 * double click (or Enter) opens, the keyboard carries Alt+Left/Right
 * (back/forward), Alt+Up (the parent), Ctrl+F (search focus) and Escape
 * (clear the selection), the hover lifts the tile with the soft wash, the
 * selection paints the accent underline, the items stagger in at 40ms
 * steps under motion-reduce guards and the view crossfades on every
 * navigation. English text only — the gtx translation runs at runtime.
 */
import {
  ArrowLeftRegular as ChevronLeft,
  ArrowRightRegular as ChevronRight,
  ArrowUpRegular as ChevronUp,
  ArrowClockwiseRegular as Refresh,
  SearchRegular as Search,
  ChevronDownRegular as ChevronDown,
  AddRegular as NewGlyph,
  ArrowSortRegular as SortGlyph,
  GridRegular as GridGlyph,
  AppsListRegular as ListGlyph,
  CutRegular as CutGlyph,
  ClipboardRegular as CopyGlyph,
  ClipboardPasteRegular as PasteGlyph,
  ShareRegular as ShareGlyph,
  DeleteRegular as DeleteGlyph,
  MoreHorizontalRegular as MoreGlyph,
  CheckmarkRegular as CheckGlyph,
  WindowAppsRegular as AppGlyph,
  BookOpenRegular as ModuleGlyph,
  CubeRegular as BinaryGlyph,
  ImageRegular as AssetGlyph,
  MusicNote2Regular as TrackGlyph,
  type FluentIcon,
} from "@fluentui/react-icons";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { DESKTOP_APPS, type DesktopApp } from "../../appregistry.ts";
import { coreModuleTable, osAppLabels, runnerBinaries, studioAssets, studioTracks } from "../../catalog.ts";
import { osText } from "../../oslabels.ts";
import {
  breadcrumbs as crumbtrail,
  capacityline,
  capacityshare,
  EXPLORER_PLATFORMS,
  FOLDER_DETAILS,
  FOLDER_NAMES,
  formatbytes,
  type ExplorerItemKind,
  type ExplorerLocation,
  type ExplorerSort,
  type ExplorerViewMode,
  hasparent,
  itemmatches,
  parentlocation,
  SHELL_FOLDER_ORDER,
  sortitems,
} from "../../fileexplorer.ts";
import { browserIdentity, browserStoreSummary, drives, type HardDrive } from "../../storagefamily.ts";
import { storageusage, type StorageLaneUsage } from "../../gatewayfamily.ts";
import { ShellChrome } from "@/widgets/ShellShellchrome";
import { AppTile } from "@/widgets";
import { DriveIcon, PlatformMark, ShellFolderIcon, ThisPcMark } from "../widgets";

/** the window title answers the catalog label row (bare-id fallback). */
const FILES_LABEL = osAppLabels().files ?? { name: "My Files", detail: "", pinned: true };

/** the byte answer of the storage manager: the one allocation the browser
 * reports for the origin store every local drive shares */
type Capacity = { usage: number; quota: number };

/** the honest store summary the explorer reads once per mount */
type Summary = Awaited<ReturnType<typeof browserStoreSummary>>;

/** one item row of a folder view: the label, the type detail, the kind,
 * the optional meta column and the open behavior */
type FileItem = {
  id: string;
  label: string;
  detail: string;
  kind: ExplorerItemKind;
  meta?: string;
  /** the app row of the desktop folder (renders its premium tile) */
  app?: DesktopApp;
  glyph?: FluentIcon;
  open?: () => void;
};

/** one navigation step of the history stack */
type HistoryEntry = { location: ExplorerLocation; scroll: number };

/** the new-drive menu: the only "New" the explorer carries today (a new
 * hd partition — the same action the settings drives panel owns); the
 * Windows "New folder" grammar lands with the database wave */
async function createnewdrive(): Promise<HardDrive> {
  const { newdrive } = await import("../../storagefamily.ts");
  return newdrive(undefined);
}

/** one collapsible group of the nav pane tree: the heading rides a real
 * button with the expand caret (the rotate answers aria-expanded), the
 * list mounts only while the group stands open. Presentation state only —
 * the accessible name stays the heading text, the state stays aria. */
function NavGroup({ heading, children }: { heading: React.ReactNode; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <>
      <button
        type="button"
        className="dtfx-nav__group"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="dtfx-nav__heading dtfx-nav__heading--live">{heading}</span>
        <span className="dtfx-nav__caret" aria-hidden="true">
          <ChevronDown fontSize={10} />
        </span>
      </button>
      {open ? children : null}
    </>
  );
}

/** The My Files app: the Windows body when embedded (the desktop window
 * hosts it without the shell), the full surface with the taskbar on the
 * route. */
export default function Files({ embedded }: { embedded?: boolean }) {
  const [, navigate] = useLocation();

  /* ------------------------------ navigation ------------------------------ */

  /** the history stack of the explorer (the Windows back/forward grammar
   * — every navigation pushes, back and forward walk the stack) */
  const [history, setHistory] = useState<HistoryEntry[]>([{ location: { kind: "thispc" }, scroll: 0 }]);
  const [cursor, setCursor] = useState(0);
  const location = history[cursor].location;

  /** the live selection (one item id) and the search query of the view */
  const [selected, setSelected] = useState<string>();
  const [query, setQuery] = useState("");
  const [view, setView] = useState<ExplorerViewMode>("grid");
  const [sort, setSort] = useState<ExplorerSort>("name");
  /** the drag-over flag of the content area (the explorer grammar wash —
   * presentation only: no drop behavior, no preventDefault, the flag just
   * paints the state the stylesheet reads) */
  const [dragover, setDragover] = useState(false);

  /* -------------------------------- live data ------------------------------ */

  const [drivelist, setDrivelist] = useState<HardDrive[]>([]);
  const [activedrive, setActivedrive] = useState<HardDrive>();
  const [capacity, setCapacity] = useState<Capacity>();
  /** the storage lane answer (the real usage and the plan quota of this
   * identity) — undefined while no lane stands and the bar rides the
   * browser estimate with its honest label */
  const [laneusage, setLaneusage] = useState<StorageLaneUsage>();
  const [summary, setSummary] = useState<Summary>();
  const [busy, setBusy] = useState(false);

  /** the catalog rows of the folder views (the reviewed seeds answer
   * offline; the paired endpoint serves the same shape over HTTPS) */
  const [modules, setModules] = useState<Awaited<ReturnType<typeof coreModuleTable>>>();
  const [binaries, setBinaries] = useState<Awaited<ReturnType<typeof runnerBinaries>>>();
  const [assets, setAssets] = useState<Awaited<ReturnType<typeof studioAssets>>>();
  const [tracks, setTracks] = useState<Awaited<ReturnType<typeof studioTracks>>>();

  /** reads the machine truth once per mount: the drive registry, the
   * store summary and the one byte answer of the storage manager */
  useEffect(() => {
    void drives()
      .then((state) => {
        setActivedrive(state.active);
        setDrivelist(state.list);
      })
      .catch(() => undefined);
    void browserStoreSummary(false)
      .then(setSummary)
      .catch(() => undefined);
    if (typeof navigator !== "undefined" && navigator.storage) {
      void navigator.storage
        .estimate()
        .then((answer) => {
          if (typeof answer.usage === "number" && typeof answer.quota === "number" && answer.quota > 0) {
            setCapacity({ usage: answer.usage, quota: answer.quota });
          }
        })
        .catch(() => undefined);
    }
    // the lane answer of the capacity bar: the real usage and plan quota of
    // this identity when a server lane stands — the client answers null on
    // every failure mode and the bar keeps the browser estimate, honestly
    // labeled
    void browserIdentity()
      .then((identity) => storageusage(identity.userId))
      .then((answer) => {
        if (answer) setLaneusage(answer);
      })
      .catch(() => undefined);
    void coreModuleTable()
      .then(setModules)
      .catch(() => undefined);
    void runnerBinaries()
      .then(setBinaries)
      .catch(() => undefined);
    void studioAssets()
      .then(setAssets)
      .catch(() => undefined);
    void studioTracks()
      .then(setTracks)
      .catch(() => undefined);
  }, []);

  /** mounts one known drive of the machine (the Windows "open drive") */
  const mountdrive = useCallback(async (driveId: string) => {
    setBusy(true);
    try {
      const { opendrive } = await import("../../storagefamily.ts");
      await opendrive(driveId);
      // the store rehydrates from the mounted owner: a fresh boot reads it
      window.location.reload();
    } catch {
      toast.error(osText("explorer.toast.mountFailed"));
      setBusy(false);
    }
  }, []);

  /* ------------------------------- navigation ------------------------------ */

  /** walks the explorer to one location (the push of the history stack) */
  const goTo = useCallback(
    (next: ExplorerLocation) => {
      setSelected(undefined);
      setQuery("");
      setHistory((current) => [...current.slice(0, cursor + 1), { location: next, scroll: 0 }]);
      setCursor((current) => current + 1);
    },
    [cursor],
  );

  const goBack = useCallback(() => {
    if (cursor > 0) {
      setSelected(undefined);
      setCursor((current) => current - 1);
    }
  }, [cursor]);

  const goForward = useCallback(() => {
    if (cursor < history.length - 1) {
      setSelected(undefined);
      setCursor((current) => current + 1);
    }
  }, [cursor, history.length]);

  const goUp = useCallback(() => {
    const parent = parentlocation(location);
    if (parent) goTo(parent);
  }, [goTo, location]);

  const driveLabel = useCallback(
    (driveId: string) => drivelist.find((drive) => drive.id === driveId)?.label ?? osText("explorer.drive"),
    [drivelist],
  );

  /* ------------------------------ the item rows ---------------------------- */

  /** the internal route of one registry app (the launcher grammar: every
   * kind the registry declares maps to a real page of this interface) */
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

  /** the item rows of the active location — every row binds to a real
   * record source of its category, never a decorative tile */
  const items = useMemo<FileItem[]>(() => {
    if (location.kind === "thispc") {
      /* the root view: the seven shell folders (each opens its category)
         and the drives of the machine (each opens its record view) */
      const folders: FileItem[] = SHELL_FOLDER_ORDER.map((folder) => ({
        id: `folder:${folder}`,
        label: FOLDER_NAMES[folder],
        detail: FOLDER_DETAILS[folder],
        kind: "drive" as ExplorerItemKind,
        meta: osText("explorer.items").replace("{count}", String(foldercount(folder))),
        open: () => goTo({ kind: "folder", folder }),
      }));
      const driveItems: FileItem[] = drivelist.map((drive) => ({
        id: `drive:${drive.id}`,
        label: drive.label,
        detail: drive.id === activedrive?.id ? osText("explorer.localDiskMounted") : osText("explorer.localDisk"),
        kind: "drive",
        meta: drive.id === activedrive?.id ? capacityline(capacity) : osText("explorer.capacityAfterMount"),
        open: () => goTo({ kind: "drive", driveId: drive.id }),
      }));
      return [...folders, ...driveItems];
    }
    if (location.kind === "folder") {
      const folder = location.folder;
      if (folder === "desktop") {
        /* the installed apps of this desktop — the registry rows with
           their premium tiles; opening walks the app's own route */
        return DESKTOP_APPS.map((app) => ({
          id: `app:${app.id}`,
          label: app.name,
          detail: app.detail,
          kind: "app" as ExplorerItemKind,
          app,
          open: () => navigate(appRoute(app)),
        }));
      }
      if (folder === "documents") {
        /* the docs library modules the catalog serves */
        return (modules ?? []).map((module) => ({
          id: `module:${module.name}`,
          label: module.name,
          detail: module.role,
          kind: "module" as ExplorerItemKind,
          open: () => navigate("/docs"),
        }));
      }
      if (folder === "downloads") {
        /* the runner binaries the saddle engine carries */
        return (binaries ?? []).map((binary) => ({
          id: `binary:${binary.id}`,
          label: binary.title,
          detail: `${binary.kind} · ${binary.runner}`,
          kind: "binary" as ExplorerItemKind,
          meta: binary.formats,
          open: () => navigate("/games"),
        }));
      }
      if (folder === "images") {
        /* the image studio records the catalog serves */
        return (assets ?? [])
          .filter((asset) => asset.studio === "image")
          .map((asset) => ({
            id: `asset:${asset.id}`,
            label: asset.title,
            detail: `image · ${asset.engine}`,
            kind: "asset" as ExplorerItemKind,
            meta: asset.size,
            open: () => navigate("/image"),
          }));
      }
      if (folder === "music") {
        /* the audio studio tracks the catalog serves */
        return (tracks ?? []).map((track) => ({
          id: `track:${track.id}`,
          label: track.title,
          detail: `audio · ${track.engine}`,
          kind: "track" as ExplorerItemKind,
          meta: `${track.minutes} min`,
          open: () => navigate("/audio"),
        }));
      }
      if (folder === "objects3d") {
        /* the 3D-capable runners of the sandbox */
        return (binaries ?? [])
          .filter((binary) => /3d|blender|render/i.test(`${binary.title} ${binary.blurb}`))
          .map((binary) => ({
            id: `binary:${binary.id}`,
            label: binary.title,
            detail: `${binary.kind} · ${binary.runner}`,
            kind: "binary" as ExplorerItemKind,
            meta: binary.formats,
            open: () => navigate("/games"),
          }));
      }
      /* videos: the video studio records the catalog serves */
      return (assets ?? [])
        .filter((asset) => asset.studio === "video")
        .map((asset) => ({
          id: `asset:${asset.id}`,
          label: asset.title,
          detail: `video · ${asset.engine}`,
          kind: "asset" as ExplorerItemKind,
          meta: asset.duration,
          open: () => navigate("/video"),
        }));
    }
    /* the drive view: the record counts of the mounted partition (the
       honest store summary — workspaces, sessions, messages) */
    const drive = drivelist.find((entry) => entry.id === location.driveId);
    const mounted = drive != null && drive.id === activedrive?.id;
    const rows: FileItem[] = [
      {
        id: "record:workspaces",
        label: osText("explorer.records.workspaces"),
        detail: mounted ? osText("explorer.records.workspaces.detail") : osText("explorer.records.mountHint"),
        kind: "module",
        meta:
          mounted && summary?.available
            ? osText("explorer.records.count").replace("{count}", String(summary.workspaces))
            : undefined,
        open: () => navigate("/projects"),
      },
      {
        id: "record:sessions",
        label: osText("explorer.records.sessions"),
        detail: mounted ? osText("explorer.records.sessions.detail") : osText("explorer.records.mountHint"),
        kind: "module",
        meta:
          mounted && summary?.available
            ? osText("explorer.records.count").replace("{count}", String(summary.sessions))
            : undefined,
        open: () => navigate("/history"),
      },
      {
        id: "record:messages",
        label: osText("explorer.records.messages"),
        detail: mounted ? osText("explorer.records.messages.detail") : osText("explorer.records.mountHint"),
        kind: "module",
        meta:
          mounted && summary?.available
            ? osText("explorer.records.count").replace("{count}", String(summary.messages))
            : undefined,
        open: () => navigate("/chat"),
      },
      {
        id: "record:preferences",
        label: osText("explorer.records.preferences"),
        detail: mounted ? osText("explorer.records.preferences.detail") : osText("explorer.records.mountHint"),
        kind: "module",
        meta:
          mounted && summary?.available
            ? osText("explorer.records.count").replace("{count}", String(summary.preferences))
            : undefined,
        open: () => navigate("/settings"),
      },
    ];
    return rows;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activedrive, assets, binaries, capacity, drivelist, location, modules, navigate, summary, tracks]);

  /** the honest item count of one shell folder — the record count of the
   * category the folder holds (never an invented figure) */
  function foldercount(folder: string): number {
    if (folder === "desktop") return DESKTOP_APPS.length;
    if (folder === "documents") return modules?.length ?? 0;
    if (folder === "downloads") return binaries?.length ?? 0;
    if (folder === "images") return assets?.filter((asset) => asset.studio === "image").length ?? 0;
    if (folder === "music") return tracks?.length ?? 0;
    if (folder === "objects3d")
      return binaries?.filter((binary) => /3d|blender|render/i.test(`${binary.title} ${binary.blurb}`)).length ?? 0;
    return assets?.filter((asset) => asset.studio === "video").length ?? 0;
  }

  /** the filtered, sorted rows of the active view */
  const rows = useMemo(
    () =>
      sortitems(
        items.filter((item) => itemmatches(item.label, item.detail, query)),
        sort,
      ),
    [items, query, sort],
  );

  /* -------------------------------- keyboard ------------------------------- */

  /** the Windows keyboard grammar of the explorer */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey && event.key === "ArrowLeft") {
        event.preventDefault();
        goBack();
        return;
      }
      if (event.altKey && event.key === "ArrowRight") {
        event.preventDefault();
        goForward();
        return;
      }
      if (event.altKey && event.key === "ArrowUp") {
        event.preventDefault();
        goUp();
        return;
      }
      const target = event.target as HTMLElement | null;
      const typing = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA";
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "f") {
        event.preventDefault();
        searchRef.current?.focus();
        return;
      }
      if (event.key === "Escape") {
        setSelected(undefined);
        return;
      }
      if (event.key === "Enter" && !typing && selected) {
        const item = rows.find((row) => row.id === selected);
        item?.open?.();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goBack, goForward, goUp, rows, selected]);

  const searchRef = useRef<HTMLInputElement>(null);

  /* --------------------------------- render -------------------------------- */

  const crumbs = crumbtrail(location, location.kind === "drive" ? driveLabel(location.driveId) : undefined);
  const uparmed = hasparent(location);

  return (
    <main className="dtfx-app" style={embedded ? { height: "100%" } : undefined}>
      {!embedded && <ShellChrome />}
      <div className="dtfx-explorer" data-embedded={embedded ? "true" : undefined}>
        {/* ------------------------------ the toolbar ----------------------------- */}
        <div className="dtfx-toolbar" role="toolbar" aria-label={osText("explorer.tools.aria")}>
          <div className="dtfx-toolbar__nav">
            <button type="button" className="dtfx-navbtn" disabled={cursor === 0} onClick={goBack} aria-label={osText("explorer.nav.back")}>
              <ChevronLeft fontSize={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="dtfx-navbtn"
              disabled={cursor >= history.length - 1}
              onClick={goForward}
              aria-label={osText("explorer.nav.forward")}
            >
              <ChevronRight fontSize={16} aria-hidden="true" />
            </button>
            <button type="button" className="dtfx-navbtn" disabled={!uparmed} onClick={goUp} aria-label={osText("explorer.nav.up")}>
              <ChevronUp fontSize={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="dtfx-navbtn"
              onClick={() => {
                void drives()
                  .then((state) => {
                    setActivedrive(state.active);
                    setDrivelist(state.list);
                  })
                  .catch(() => undefined);
                void browserStoreSummary(false)
                  .then(setSummary)
                  .catch(() => undefined);
              }}
              aria-label={osText("explorer.nav.refresh")}
            >
              <Refresh fontSize={16} aria-hidden="true" />
            </button>
          </div>

          {/* the breadcrumb address bar: the home crumb, This PC and the
              deeper crumbs, every crumb a real walk back */}
          <nav className="dtfx-address" aria-label={osText("explorer.address.aria")}>
            <ol className="dtfx-address__trail">
              {crumbs.map((crumb, index) => (
                <li key={`${crumb.label}-${index}`} className="dtfx-address__crumb">
                  {index > 0 ? <ChevronRight fontSize={11} aria-hidden="true" className="dtfx-address__sep" /> : null}
                  <button
                    type="button"
                    className={index === crumbs.length - 1 ? "dtfx-address__leaf" : "dtfx-address__step"}
                    aria-current={index === crumbs.length - 1 ? "page" : undefined}
                    onClick={() => goTo(crumb.location)}
                  >
                    {crumb.label}
                  </button>
                </li>
              ))}
            </ol>
          </nav>

          <div className="dtfx-toolbar__search">
            <Search fontSize={14} aria-hidden="true" />
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={osText("explorer.search.placeholder")}
              aria-label={osText("explorer.search.aria")}
              className="dtfx-search__input"
            />
          </div>
        </div>

        {/* ----------------------------- the command bar --------------------------- */}
        <div className="dtfx-commandbar" role="toolbar" aria-label={osText("explorer.commands.aria")}>
          <button
            type="button"
            className="dtfx-cmdbtn dtfx-cmdbtn--primary"
            disabled={busy}
            onClick={() => {
              setBusy(true);
              void createnewdrive()
                .then((drive) => {
                  toast(osText("explorer.toast.newDrive").replace("{label}", drive.label));
                  window.location.reload();
                })
                .catch(() => {
                  toast.error(osText("explorer.toast.newDriveFailed"));
                  setBusy(false);
                });
            }}
          >
            <NewGlyph fontSize={15} aria-hidden="true" />
            {osText("explorer.new")}
            <ChevronDown fontSize={10} aria-hidden="true" className="dtfx-cmdbtn__chevron" />
          </button>
          <span className="dtfx-commandbar__divider" aria-hidden="true" />
          <button type="button" className="dtfx-cmdbtn" disabled title={osText("explorer.disabled.clipboard")}>
            <CutGlyph fontSize={15} aria-hidden="true" />
          </button>
          <button type="button" className="dtfx-cmdbtn" disabled title="The clipboard rides the database wave">
            <CopyGlyph fontSize={15} aria-hidden="true" />
          </button>
          <button type="button" className="dtfx-cmdbtn" disabled title="The clipboard rides the database wave">
            <PasteGlyph fontSize={15} aria-hidden="true" />
          </button>
          <button type="button" className="dtfx-cmdbtn" disabled title={osText("explorer.disabled.share")}>
            <ShareGlyph fontSize={15} aria-hidden="true" />
          </button>
          <button type="button" className="dtfx-cmdbtn" disabled title={osText("explorer.disabled.recycle")}>
            <DeleteGlyph fontSize={15} aria-hidden="true" />
          </button>
          <span className="dtfx-commandbar__divider" aria-hidden="true" />
          <button
            type="button"
            className="dtfx-cmdbtn"
            onClick={() => setSort((current) => (current === "name" ? "kind" : "name"))}
            aria-label={osText("explorer.sortBy").replace("{mode}", sort === "name" ? "kind" : "name")}
          >
            <SortGlyph fontSize={15} aria-hidden="true" />
            {osText("explorer.sort")}
            <ChevronDown fontSize={10} aria-hidden="true" className="dtfx-cmdbtn__chevron" />
          </button>
          <button
            type="button"
            className="dtfx-cmdbtn"
            onClick={() => setView((current) => (current === "grid" ? "details" : "grid"))}
            aria-label={osText("explorer.viewAs").replace("{mode}", view === "grid" ? "details" : "grid")}
          >
            {view === "grid" ? (
              <ListGlyph fontSize={15} aria-hidden="true" />
            ) : (
              <GridGlyph fontSize={15} aria-hidden="true" />
            )}
            {osText("explorer.view")}
          </button>
          <button type="button" className="dtfx-cmdbtn" disabled title={osText("explorer.disabled.more")}>
            <MoreGlyph fontSize={15} aria-hidden="true" />
          </button>
        </div>

        {/* ------------------------------- the body --------------------------------- */}
        <div className="dtfx-body">
          {/* the nav pane: the explorer tree — quick access, This PC with
              the drives, the opt-in external platforms, each group a real
              collapsible node with the rotating expand caret */}
          <nav className="dtfx-nav" aria-label="Explorer navigation">
            <NavGroup heading={osText("explorer.quickAccess")}>
              <ul className="dtfx-nav__list">
              {SHELL_FOLDER_ORDER.map((folder) => (
                <li key={folder}>
                  <button
                    type="button"
                    className={
                      location.kind === "folder" && location.folder === folder
                        ? "dtfx-nav__item dtfx-nav__item--active"
                        : "dtfx-nav__item"
                    }
                    onClick={() => goTo({ kind: "folder", folder })}
                    aria-current={location.kind === "folder" && location.folder === folder ? "page" : undefined}
                  >
                    <span className="dtfx-nav__mark">
                      <ShellFolderIcon folder={folder} />
                    </span>
                    <span className="dtfx-nav__label">{FOLDER_NAMES[folder]}</span>
                  </button>
                </li>
              ))}
              </ul>
            </NavGroup>

            <NavGroup
              heading={
                <>
                  <ThisPcMark size={14} />
                  {osText("explorer.thisPc")}
                </>
              }
            >
              <ul className="dtfx-nav__list">
              <li>
                <button
                  type="button"
                  className={location.kind === "thispc" ? "dtfx-nav__item dtfx-nav__item--active" : "dtfx-nav__item"}
                  onClick={() => goTo({ kind: "thispc" })}
                  aria-current={location.kind === "thispc" ? "page" : undefined}
                >
                  <span className="dtfx-nav__label dtfx-nav__label--strong">{osText("explorer.thisPc")}</span>
                </button>
              </li>
              {drivelist.map((drive) => (
                <li key={drive.id}>
                  <button
                    type="button"
                    className={
                      location.kind === "drive" && location.driveId === drive.id
                        ? "dtfx-nav__item dtfx-nav__item--active"
                        : "dtfx-nav__item"
                    }
                    onClick={() => goTo({ kind: "drive", driveId: drive.id })}
                    aria-current={location.kind === "drive" && location.driveId === drive.id ? "page" : undefined}
                  >
                    <span className="dtfx-nav__drivemark">
                      <DriveIcon
                        share={
                          drive.id === activedrive?.id
                            ? capacityshare(laneusage ? { usage: laneusage.bytes, quota: laneusage.quotabytes } : capacity)
                            : 0
                        }
                        mounted={drive.id === activedrive?.id}
                      />
                    </span>
                    <span className="dtfx-nav__label">{drive.label}</span>
                  </button>
                </li>
              ))}
              </ul>
            </NavGroup>

            <NavGroup heading={osText("explorer.storagePlatforms")}>
              <ul className="dtfx-nav__list">
              {EXPLORER_PLATFORMS.map((platform) => (
                <li key={platform.id}>
                  <button
                    type="button"
                    className="dtfx-nav__item dtfx-nav__item--muted"
                    onClick={() => navigate("/settings")}
                    title={osText("explorer.platform.pair").replace("{name}", platform.name)}
                  >
                    <span className="dtfx-nav__mark dtfx-nav__mark--platform">
                      <PlatformMark id={platform.id} />
                    </span>
                    <span className="dtfx-nav__label">{platform.name}</span>
                  </button>
                </li>
              ))}
              </ul>
            </NavGroup>
          </nav>

          {/* the content area: the Windows views — data-view carries the
              mode the swap fade reads, data-dragover paints the drag wash
              (presentation only, no drop behavior is claimed) */}
          <section
            className="dtfx-content"
            aria-label={osText("explorer.folderView.aria")}
            data-view={view}
            data-dragover={dragover ? "true" : undefined}
            onDragEnter={() => setDragover(true)}
            onDragOver={() => setDragover(true)}
            onDragLeave={(event) => {
              if (!(event.relatedTarget instanceof Node) || !event.currentTarget.contains(event.relatedTarget)) {
                setDragover(false);
              }
            }}
            onDrop={() => setDragover(false)}
            onDragEnd={() => setDragover(false)}
          >
            {location.kind === "thispc" ? (
              <ThisPcView
                rows={rows}
                view={view}
                selected={selected}
                onSelect={setSelected}
                onOpen={(item) => item.open?.()}
                capacity={capacity}
                laneusage={laneusage}
                activedrive={activedrive}
                drivelist={drivelist}
                summary={summary}
                busy={busy}
                onMount={mountdrive}
                foldercount={foldercount}
              />
            ) : (
              <FolderView
                rows={rows}
                view={view}
                selected={selected}
                onSelect={setSelected}
                onOpen={(item) => item.open?.()}
                query={query}
                location={location}
              />
            )}
          </section>
        </div>

        {/* ------------------------------ the status bar ---------------------------- */}
        <footer className="dtfx-statusbar">
          <p className="dtfx-statusbar__count">
            {rows.length} {rows.length === 1 ? osText("explorer.status.item") : osText("explorer.status.items")}
            {query ? osText("explorer.status.found") : ""}
            {selected ? osText("explorer.status.selected") : ""}
          </p>
          <div className="dtfx-statusbar__views" role="group" aria-label={osText("explorer.viewMode.aria")}>
            <button
              type="button"
              className={view === "grid" ? "dtfx-viewbtn dtfx-viewbtn--active" : "dtfx-viewbtn"}
              onClick={() => setView("grid")}
              aria-label={osText("explorer.gridView.aria")}
              aria-pressed={view === "grid"}
            >
              <GridGlyph fontSize={14} aria-hidden="true" />
            </button>
            <button
              type="button"
              className={view === "details" ? "dtfx-viewbtn dtfx-viewbtn--active" : "dtfx-viewbtn"}
              onClick={() => setView("details")}
              aria-label={osText("explorer.detailsView.aria")}
              aria-pressed={view === "details"}
            >
              <ListGlyph fontSize={14} aria-hidden="true" />
            </button>
          </div>
        </footer>
      </div>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/* the This PC view — the folders grid and the devices-and-drives wall  */
/* ------------------------------------------------------------------ */

type ViewProps = {
  rows: FileItem[];
  view: ExplorerViewMode;
  selected?: string;
  onSelect: (id: string) => void;
  onOpen: (item: FileItem) => void;
};

type ThisPcProps = ViewProps & {
  capacity?: Capacity;
  /** the storage lane answer — the real usage and plan quota when a server
   * lane stands; undefined keeps the browser estimate with its label */
  laneusage?: StorageLaneUsage;
  activedrive?: HardDrive;
  drivelist: HardDrive[];
  summary?: Summary;
  busy: boolean;
  onMount: (driveId: string) => void;
  foldercount: (folder: string) => number;
};

/** The "This PC" home: "Pastas (7)" — the shell folder grid — over
 * "Dispositivos e unidades (N)" — the drive cards with the capacity bar
 * and the record counts, drawn after the reference shot. */
function ThisPcView({
  rows,
  view,
  selected,
  onSelect,
  onOpen,
  capacity,
  laneusage,
  activedrive,
  drivelist,
  summary,
  busy,
  onMount,
  foldercount,
}: ThisPcProps) {
  const folderRows = rows.filter((row) => row.id.startsWith("folder:"));
  const driveRows = rows.filter((row) => row.id.startsWith("drive:"));
  return (
    <div className="dtfx-scroll">
      <section aria-labelledby="dtfx-folders-heading" className="dtfx-section">
        <h2 id="dtfx-folders-heading" className="dtfx-section__heading">
          {osText("explorer.foldersHeading").replace("{count}", String(SHELL_FOLDER_ORDER.length))}
        </h2>
        {view === "grid" ? (
          <ul className="dtfx-grid">
            {folderRows.map((row, index) => {
              const folder = row.id.slice("folder:".length) as keyof typeof FOLDER_NAMES;
              return (
                <li key={row.id} className="dtfx-grid__cell" style={{ "--dtfx-i": index } as React.CSSProperties}>
                  <button
                    type="button"
                    className={selected === row.id ? "dtfx-tile dtfx-tile--selected" : "dtfx-tile"}
                    onClick={() => onSelect(row.id)}
                    onDoubleClick={() => onOpen(row)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        onOpen(row);
                      }
                    }}
                    aria-label={`${row.label} — ${foldercount(folder)} items`}
                  >
                    <span className="dtfx-tile__mark">
                      <ShellFolderIcon folder={folder} />
                    </span>
                    <span className="dtfx-tile__label">{row.label}</span>
                    <span className="dtfx-tile__meta">{foldercount(folder)} items</span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <DetailsList rows={folderRows} selected={selected} onSelect={onSelect} onOpen={onOpen} />
        )}
      </section>

      <section aria-labelledby="dtfx-devices-heading" className="dtfx-section">
        <h2 id="dtfx-devices-heading" className="dtfx-section__heading">
          {osText("explorer.devicesHeading").replace("{count}", String(drivelist.length))}
        </h2>
        <ul className="dtfx-drives">
          {drivelist.map((drive, index) => {
            const mounted = drive.id === activedrive?.id;
            /* the honest share: the lane answer (real bytes against the plan
               quota) when one stands, else the browser estimate — the bar
               labels its own source either way */
            const share = mounted
              ? capacityshare(laneusage ? { usage: laneusage.bytes, quota: laneusage.quotabytes } : capacity)
              : 0;
            const source = laneusage ? "lane" : "browser";
            const row = driveRows.find((entry) => entry.id === `drive:${drive.id}`);
            return (
              <li
                key={drive.id}
                className={selected === `drive:${drive.id}` ? "dtfx-drive dtfx-drive--selected" : "dtfx-drive"}
                style={{ "--dtfx-i": index } as React.CSSProperties}
              >
                <button
                  type="button"
                  className="dtfx-drive__hit"
                  onClick={() => onSelect(`drive:${drive.id}`)}
                  onDoubleClick={() => row?.open?.()}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      row?.open?.();
                    }
                  }}
                  aria-label={`${drive.label} — ${mounted ? "mounted" : "unmounted"}`}
                >
                  <span className="dtfx-drive__mark">
                    <DriveIcon share={share} mounted={mounted} />
                  </span>
                  <span className="dtfx-drive__body">
                    <span className="dtfx-drive__label">{drive.label}</span>
                    {mounted ? (
                      <span className="dtfx-drive__source" data-source={source}>
                        {laneusage ? osText("explorer.storage.lane") : osText("explorer.storage.browser")}
                      </span>
                    ) : null}
                    <span
                      className={mounted ? "dtfx-drive__bar dtfx-drive__bar--live" : "dtfx-drive__bar"}
                      data-source={mounted ? source : undefined}
                      role={mounted ? "progressbar" : undefined}
                      aria-valuemin={mounted ? 0 : undefined}
                      aria-valuemax={mounted ? 100 : undefined}
                      aria-valuenow={mounted ? Math.round(share) : undefined}
                      aria-label={
                        mounted
                          ? laneusage
                            ? osText("explorer.storage.lane.aria")
                            : osText("explorer.storage.browser.aria")
                          : undefined
                      }
                    >
                      <span className="dtfx-drive__fill" style={{ width: mounted ? `${share}%` : "0%" }} />
                    </span>
                    <span className="dtfx-drive__line">
                      {mounted
                        ? laneusage
                          ? osText("explorer.storage.lane.line")
                              .replace("{used}", formatbytes(laneusage.bytes))
                              .replace("{quota}", formatbytes(laneusage.quotabytes))
                          : osText("explorer.storage.browser.line").replace("{line}", capacityline(capacity))
                        : osText("explorer.capacityAfterMount")}
                    </span>
                    {mounted && laneusage ? (
                      <span className="dtfx-drive__objects">
                        {osText("explorer.storage.lane.objects").replace("{count}", String(laneusage.objects))}
                      </span>
                    ) : null}
                    {mounted && summary?.available ? (
                      <span className="dtfx-drive__records">
                        {summary.workspaces} workspaces · {summary.sessions} sessions · {summary.messages} messages
                      </span>
                    ) : null}
                    {!mounted ? (
                      <span className="dtfx-drive__records dtfx-drive__records--muted">
                        created {drive.createdAt.slice(0, 10)} · unmounted
                      </span>
                    ) : null}
                  </span>
                </button>
                {!mounted ? (
                  <button
                    type="button"
                    className="dtfx-drive__open"
                    disabled={busy}
                    onClick={() => onMount(drive.id)}
                    aria-label={`Open the drive ${drive.label}`}
                  >
                    Open
                  </button>
                ) : (
                  <button
                    type="button"
                    className="dtfx-drive__open dtfx-drive__open--live"
                    onClick={() => row?.open?.()}
                    aria-label={`Browse the drive ${drive.label}`}
                  >
                    Browse
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* the folder view — the records of one category                        */
/* ------------------------------------------------------------------ */

type FolderProps = ViewProps & {
  query: string;
  location: ExplorerLocation;
};

/** The folder view: the record rows of one category — the installed apps
 * of the desktop (their premium tiles), the docs modules, the runner
 * binaries, the studio rows — each opening its real surface. An empty
 * category answers the honest "empty folder". */
function FolderView({ rows, view, selected, onSelect, onOpen, query, location }: FolderProps) {
  const heading = location.kind === "folder" ? FOLDER_NAMES[location.folder] : osText("explorer.drive");
  return (
    <div className="dtfx-scroll">
      <section aria-labelledby="dtfx-folder-heading" className="dtfx-section">
        <h2 id="dtfx-folder-heading" className="dtfx-section__heading">
          {heading} {query ? osText("explorer.filtered") : ""}
        </h2>
        {rows.length === 0 ? (
          <p className="dtfx-empty">{osText("explorer.empty")}</p>
        ) : view === "grid" ? (
          <ul className="dtfx-grid dtfx-grid--records">
            {rows.map((row, index) => (
              <li key={row.id} className="dtfx-grid__cell" style={{ "--dtfx-i": index } as React.CSSProperties}>
                <button
                  type="button"
                  className={selected === row.id ? "dtfx-tile dtfx-tile--selected" : "dtfx-tile"}
                  onClick={() => onSelect(row.id)}
                  onDoubleClick={() => onOpen(row)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      onOpen(row);
                    }
                  }}
                  aria-label={`${row.label} — ${row.detail}`}
                >
                  <span className="dtfx-tile__mark">
                    <ItemMark row={row} />
                  </span>
                  <span className="dtfx-tile__label">{row.label}</span>
                  <span className="dtfx-tile__meta">{row.meta ?? row.detail}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <DetailsList rows={rows} selected={selected} onSelect={onSelect} onOpen={onOpen} />
        )}
      </section>
    </div>
  );
}

/** the mark of one record row: the premium tile of an app row, the drawn
 * folder of a folder row, the drive icon of a drive row and the quiet
 * fluent glyph of every other kind */
function ItemMark({ row }: { row: FileItem }) {
  if (row.app) {
    return <AppTile app={row.app} size={40} label={row.label} />;
  }
  if (row.id.startsWith("folder:")) {
    return <ShellFolderIcon folder={row.id.slice("folder:".length) as keyof typeof FOLDER_NAMES} />;
  }
  if (row.id.startsWith("drive:")) {
    return <DriveIcon share={0} />;
  }
  const Glyph =
    row.kind === "module"
      ? ModuleGlyph
      : row.kind === "binary"
        ? BinaryGlyph
        : row.kind === "asset"
          ? AssetGlyph
          : row.kind === "track"
            ? TrackGlyph
            : AppGlyph;
  return (
    <span className="dtfx-glyph">
      <Glyph fontSize={30} aria-hidden="true" />
    </span>
  );
}

/** the props the details list answers (the narrow view-free face: the
 * rows, the selection and the open behavior) */
type DetailsProps = {
  rows: FileItem[];
  selected?: string;
  onSelect: (id: string) => void;
  onOpen: (item: FileItem) => void;
};

/** the details list of a view (the Windows "Details" mode): the name,
 * the type and the meta columns in quiet rows */
function DetailsList({ rows, selected, onSelect, onOpen }: DetailsProps) {
  return (
    <table className="dtfx-details">
      <caption className="sr-only">The items of this folder</caption>
      <thead>
        <tr>
          <th scope="col" className="dtfx-details__head">
            Name
          </th>
          <th scope="col" className="dtfx-details__head dtfx-details__head--type">
            Type
          </th>
          <th scope="col" className="dtfx-details__head dtfx-details__head--meta">
            Details
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr
            key={row.id}
            className={selected === row.id ? "dtfx-details__row dtfx-details__row--selected" : "dtfx-details__row"}
            style={{ "--dtfx-i": index } as React.CSSProperties}
            tabIndex={0}
            onClick={() => onSelect(row.id)}
            onDoubleClick={() => onOpen(row)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                onOpen(row);
              }
            }}
          >
            <td className="dtfx-details__name">
              <span className="dtfx-details__mark">
                <ItemMark row={row} />
              </span>
              <span className="dtfx-details__label">{row.label}</span>
            </td>
            <td className="dtfx-details__type">{row.detail}</td>
            <td className="dtfx-details__meta">{row.meta ?? "—"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export { FILES_LABEL };
