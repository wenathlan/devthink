/**
 * fileexplorer.ts — the pure file-explorer logic of the os (root logic
 * layer, react-free). The Windows explorer grammar of "My Files": what a
 * location is, which folders "This PC" carries, how the breadcrumb path of
 * a location resolves, how the quick-access rail orders itself and how the
 * byte figures of a capacity bar format. No react, no anchors, no
 * components — the component binding rides the theme (Sol/files/files.tsx,
 * the only consumer) and the live figures (the drive registry, the store
 * summary, the storage estimate) are read by that consumer through the
 * root modules that own them (harddrives.ts, db.ts, the navigator storage
 * manager).
 *
 * The seven shell folders of "This PC" follow the Windows law the owner
 * pinned (the reference shot of Este Computador): Área de Trabalho,
 * Documentos, Downloads, Imagens, Músicas, Objetos 3D and Vídeos — each is
 * one honest category of the os records, never a decorative tile: the
 * desktop folder holds the installed apps of the registry, documents holds
 * the docs library modules, downloads holds the runner binaries the saddle
 * engine can carry, images/music/videos hold the studio catalog rows of
 * their kind and the 3D objects folder holds the 3D-capable runners. An
 * empty category answers "empty folder" — the explorer never invents a
 * record.
 */

/** one location of the explorer: a shell folder id, the root ("This PC")
 * or one drive id of the machine. The path grammar is the Windows one:
 * `thispc` is the root, `thispc/desktop` is a shell folder and
 * `thispc/drive/<id>` is one mounted partition. */
export type ExplorerLocation =
  | { kind: "thispc" }
  | { kind: "folder"; folder: ShellFolderId }
  | { kind: "drive"; driveId: string };

/** the ids of the seven shell folders of "This PC" (structure, never
 * info: the display names ride the FOLDER_NAMES table below the way the
 * Windows shell pins its own folder titles) */
export type ShellFolderId = "desktop" | "documents" | "downloads" | "images" | "music" | "objects3d" | "videos";

/** the canonical order of the shell folders — the grid order of the
 * reference shot (desktop first, the media folders after, the 3D objects
 * closing the row) */
export const SHELL_FOLDER_ORDER: readonly ShellFolderId[] = [
  "desktop",
  "documents",
  "downloads",
  "images",
  "music",
  "objects3d",
  "videos",
];

/** the display names of the shell folders: the Windows titles of the
 * reference machine (the gtx translation layer carries the visitor
 * language at runtime — the seeds answer in the house English) */
export const FOLDER_NAMES: Record<ShellFolderId, string> = {
  desktop: "Desktop",
  documents: "Documents",
  downloads: "Downloads",
  images: "Images",
  music: "Music",
  objects3d: "3D Objects",
  videos: "Videos",
};

/** the one-line detail of a shell folder — the honest answer of what the
 * folder holds, shown on the folder tile tooltip and the status bar */
export const FOLDER_DETAILS: Record<ShellFolderId, string> = {
  desktop: "The apps installed on this desktop",
  documents: "The docs library modules of the platform",
  downloads: "The runner binaries the saddle engine carries",
  images: "The image studio records",
  music: "The audio studio tracks",
  objects3d: "The 3D-capable runners of the sandbox",
  videos: "The video studio records",
};

/** the kinds of item a folder view can carry — every kind binds to a real
 * record source, never a decorative row */
export type ExplorerItemKind = "app" | "module" | "binary" | "asset" | "track" | "drive" | "platform";

/** the breadcrumb crumb of a location: the label and the location it
 * walks back to */
export type Crumb = { label: string; location: ExplorerLocation };

/** resolves the location a path string answers — the inverse of
 * locationpath, used by the address bar handoff and the deep links */
export function parsepath(path: string): ExplorerLocation {
  const clean = path.replace(/^\/+|\/+$/g, "");
  if (!clean || clean === "thispc") return { kind: "thispc" };
  const segments = clean.split("/");
  if (segments[0] !== "thispc" || segments.length < 2) return { kind: "thispc" };
  if (segments[1] === "drive" && segments[2]) return { kind: "drive", driveId: segments[2] };
  const folder = segments[1] as ShellFolderId;
  if ((SHELL_FOLDER_ORDER as readonly string[]).includes(folder)) return { kind: "folder", folder };
  return { kind: "thispc" };
}

/** the path string of one location — the address the breadcrumb renders
 * and the deep link carries (`thispc`, `thispc/documents`,
 * `thispc/drive/<id>`) */
export function locationpath(location: ExplorerLocation): string {
  if (location.kind === "thispc") return "thispc";
  if (location.kind === "drive") return `thispc/drive/${location.driveId}`;
  return `thispc/${location.folder}`;
}

/** the breadcrumb of one location: the home crumb, the "This PC" crumb
 * and, when the location is deeper, the folder or drive crumb. The drive
 * label arrives as the caller argument because the registry owns it. */
export function breadcrumbs(location: ExplorerLocation, driveLabel?: string): Crumb[] {
  const crumbs: Crumb[] = [
    { label: "Home", location: { kind: "thispc" } },
    { label: "This PC", location: { kind: "thispc" } },
  ];
  if (location.kind === "folder") {
    crumbs.push({ label: FOLDER_NAMES[location.folder], location });
  }
  if (location.kind === "drive") {
    crumbs.push({ label: driveLabel ?? "Drive", location });
  }
  return crumbs;
}

/** the location one "up" navigation answers: a folder or a drive walks to
 * "This PC", the root stays the root (the Windows explorer grammar — the
 * up button disables at the root) */
export function parentlocation(location: ExplorerLocation): ExplorerLocation | undefined {
  if (location.kind === "thispc") return undefined;
  return { kind: "thispc" };
}

/** whether a location can walk back (drives and folders always can, the
 * root cannot) */
export function hasparent(location: ExplorerLocation): boolean {
  return location.kind !== "thispc";
}

/** the free-text filter of a folder view: a case-insensitive substring
 * over the label and the detail of an item row */
export function itemmatches(label: string, detail: string, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return label.toLowerCase().includes(needle) || detail.toLowerCase().includes(needle);
}

/** the windows byte formatter of the capacity lines: real numbers the
 * browser answers, never an invented figure — the exact grammar of the
 * reference shot ("294 GB livres de 476 GB" on the visitor machine, the
 * house English here) */
export function formatbytes(bytes: number): string {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  const figure = unit === 0 || value >= 100 ? Math.round(value).toString() : value.toFixed(1);
  return `${figure} ${units[unit]}`;
}

/** the capacity line of a drive card: "N free of M" when the storage
 * manager answered an allocation, the honest unknown otherwise — never an
 * invented figure */
export function capacityline(capacity?: { usage: number; quota: number }): string {
  if (!capacity || capacity.quota <= 0) return "the browser does not answer a quota on this machine";
  const free = Math.max(0, capacity.quota - capacity.usage);
  return `${formatbytes(free)} free of ${formatbytes(capacity.quota)}`;
}

/** the share of the capacity bar (0–100, clamped): the usage share of the
 * one allocation every local drive on this machine shares */
export function capacityshare(capacity?: { usage: number; quota: number }): number {
  if (!capacity || capacity.quota <= 0) return 0;
  return Math.min(100, Math.max(0, (capacity.usage / capacity.quota) * 100));
}

/** the external platforms of the explorer rail: the opt-in storage wall
 * (the same platforms the drives panel of the settings app carries — one
 * source of truth per surface family, the ids shared with the pairing
 * drafts) */
export type ExplorerPlatform = {
  id: "gdrive" | "dropbox" | "onedrive" | "box" | "s3" | "host";
  name: string;
};

/** the platforms of the rail, never pre-connected: every row stays "not
 * connected" until the operator pairs it through the settings drives
 * panel */
export const EXPLORER_PLATFORMS: readonly ExplorerPlatform[] = [
  { id: "gdrive", name: "Google Drive" },
  { id: "dropbox", name: "Dropbox" },
  { id: "onedrive", name: "OneDrive" },
  { id: "box", name: "Box" },
  { id: "s3", name: "S3 compatible" },
  { id: "host", name: "File host by url" },
];

/** the view modes of the content area: the Windows grid (tiles) and the
 * details list (the rows with the type and detail columns) */
export type ExplorerViewMode = "grid" | "details";

/** the sort keys of a folder view: name and kind (the Windows "Sort by"
 * grammar — the menu items the command bar carries) */
export type ExplorerSort = "name" | "kind";

/** sorts a folder view in place by the active key: name walks the locale
 * order, kind groups the item kinds before the locale order inside each
 * group */
export function sortitems<T extends { label: string; kind: ExplorerItemKind }>(items: T[], sort: ExplorerSort): T[] {
  const copy = [...items];
  if (sort === "kind") {
    const rank: Record<ExplorerItemKind, number> = {
      app: 0,
      module: 1,
      binary: 2,
      asset: 3,
      track: 4,
      drive: 5,
      platform: 6,
    };
    copy.sort((left, right) =>
      rank[left.kind] !== rank[right.kind] ? rank[left.kind] - rank[right.kind] : left.label.localeCompare(right.label),
    );
    return copy;
  }
  copy.sort((left, right) => left.label.localeCompare(right.label));
  return copy;
}
