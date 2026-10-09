/**
 * desktopstate.ts — the pure state layer of the desktop icon field
 * (Sol/panel/desktop.tsx): persistence, clamping, snapping, sorting and the
 * ordered flow layout as free functions with no react — the desktop
 * component owns the pointer work, this module owns the math and the
 * storage. Positions are percentages of the desktop area (the center of the
 * icon cell), persisted under one localStorage key as a map of
 * appId → {x, y}. Every helper here is deterministic and unit-testable.
 */

export type IconSpot = { x: number; y: number };

export type IconBounds = { minX: number; maxX: number; minY: number; maxY: number };

export type IconSpotMap = Record<string, IconSpot>;

/** the localStorage key of the moved desktop icons (appId → spot in %) */
export const ICONS_STORAGE_KEY = "dt.desktop.icons.v1";

/** the fine snap lattice of the field: multiples of 2% x and 3.33% y —
 * smooth to drag, orderly to rest (every icon lands on the same grid) */
export const SNAP_STEP_X = 2;
export const SNAP_STEP_Y = 10 / 3;

/** the win11 desktop icon cell sizes (medium is the Sol default cell) */
export const CELL_MEDIUM = { width: 74, height: 84 };
export const CELL_LARGE = { width: 92, height: 104 };

/** the fixed chrome bands of the shell in px — the 48px taskbar topbar with
 * breathing room, and the floating dock strip (workspace.tsx constants) */
export const BAND_TOP_PX = 48;
export const BAND_BOTTOM_PX = 84;
/** the breathing edge kept clear on every side of the desktop, in px */
export const EDGE_PX = 8;

export type IconSize = "medium" | "large";

/** the pixel box of one icon size (drives the clamp bounds) */
export function cellSize(size: IconSize): { width: number; height: number } {
  return size === "large" ? CELL_LARGE : CELL_MEDIUM;
}

export function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/** snaps a spot onto the fine lattice (2% x, 3.33% y) */
export function snapSpot(spot: IconSpot): IconSpot {
  return {
    x: round2(Math.round(spot.x / SNAP_STEP_X) * SNAP_STEP_X),
    y: round2(Math.round(spot.y / SNAP_STEP_Y) * SNAP_STEP_Y),
  };
}

/** clamps a spot inside the desktop bounds */
export function clampSpot(spot: IconSpot, bounds: IconBounds): IconSpot {
  return {
    x: round2(clampNumber(spot.x, bounds.minX, bounds.maxX)),
    y: round2(clampNumber(spot.y, bounds.minY, bounds.maxY)),
  };
}

/** clamp + snap — the resting form of a user-moved spot */
export function fitSpot(spot: IconSpot, bounds: IconBounds): IconSpot {
  return snapSpot(clampSpot(spot, bounds));
}

/**
 * the percentage bounds of a desktop area of widthPx × heightPx: a cell of
 * the given size stays fully inside the area (half-cell + edge on every
 * side) and clear of the top taskbar band and the bottom dock band.
 */
export function boundsForArea(
  widthPx: number,
  heightPx: number,
  cellWidth: number,
  cellHeight: number,
  bandTopPx: number = BAND_TOP_PX,
  bandBottomPx: number = BAND_BOTTOM_PX,
): IconBounds {
  const width = Math.max(widthPx, 1);
  const height = Math.max(heightPx, 1);
  const insetX = clampNumber(((cellWidth / 2 + EDGE_PX) / width) * 100, 0, 49);
  const insetTop = clampNumber(((bandTopPx + cellHeight / 2 + EDGE_PX) / height) * 100, 0, 90);
  const insetBottom = clampNumber(((bandBottomPx + cellHeight / 2 + EDGE_PX) / height) * 100, 0, 90);
  const minY = round2(insetTop);
  return {
    minX: round2(insetX),
    maxX: round2(100 - insetX),
    minY,
    maxY: round2(Math.max(minY + 1, 100 - insetBottom)),
  };
}

/** validates an untrusted spot map (storage answers as JSON): only finite
 * coordinate pairs survive, everything else drops silently */
export function normalizeSpotMap(raw: unknown): IconSpotMap {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const spots: IconSpotMap = {};
  for (const [id, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!id || !value || typeof value !== "object" || Array.isArray(value)) continue;
    const record = value as Record<string, unknown>;
    const x = record.x;
    const y = record.y;
    if (typeof x !== "number" || typeof y !== "number") continue;
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    spots[id] = { x, y };
  }
  return spots;
}

/** reads the stored icon overrides (an empty map when storage is absent) */
export function loadIconSpots(): IconSpotMap {
  try {
    const raw = window.localStorage.getItem(ICONS_STORAGE_KEY);
    if (!raw) return {};
    return normalizeSpotMap(JSON.parse(raw) as unknown);
  } catch {
    /* storage unavailable or corrupt: the defaults carry the layout */
    return {};
  }
}

/** persists the icon overrides (a no-op when storage is unavailable) */
export function saveIconSpots(spots: IconSpotMap): void {
  try {
    window.localStorage.setItem(ICONS_STORAGE_KEY, JSON.stringify(spots));
  } catch {
    /* storage unavailable: positions live for the session only */
  }
}

/** clears the stored overrides — the "reset layout" / "original spots" action */
export function clearIconSpots(): void {
  try {
    window.localStorage.removeItem(ICONS_STORAGE_KEY);
  } catch {
    /* storage unavailable: the in-memory reset still applies */
  }
}

/**
 * the resolved layout: the deterministic default spots with the stored
 * overrides on top. Defaults are only clamped (the hand-tuned organic
 * composition is never forced onto the snap lattice); user-moved spots are
 * clamped and snapped. Stale overrides (apps that left the catalog) drop out.
 */
export function mergedSpots(defaults: IconSpotMap, overrides: IconSpotMap, bounds: IconBounds): IconSpotMap {
  const merged: IconSpotMap = {};
  for (const [id, spot] of Object.entries(defaults)) {
    const override = overrides[id];
    merged[id] = override ? fitSpot(override, bounds) : clampSpot(spot, bounds);
  }
  return merged;
}

/** the minimal app shape the sorters need (the desktop maps its catalog onto it) */
export type SortableApp = { id: string; name: string; kind: string };

/** how a desktop app opens (the appregistry target kinds, in tab order) */
const KIND_ORDER = ["window", "destination", "route", "os", "external"] as const;

function kindRank(kind: string): number {
  const index = KIND_ORDER.indexOf(kind as (typeof KIND_ORDER)[number]);
  return index === -1 ? KIND_ORDER.length : index;
}

/** the catalog sorted by display name (stable by id) */
export function sortAppsByName<T extends SortableApp>(apps: readonly T[]): T[] {
  return [...apps].sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
}

/** the catalog sorted by target kind, then name (stable by id) */
export function sortAppsByKind<T extends SortableApp>(apps: readonly T[]): T[] {
  return [...apps].sort(
    (a, b) => kindRank(a.kind) - kindRank(b.kind) || a.name.localeCompare(b.name) || a.id.localeCompare(b.id),
  );
}

/**
 * the deterministic default layout passthrough: every catalog index takes
 * its spot from the hand-tuned table in order; a catalog longer than the
 * table wraps in laps with a small diagonal offset, so nothing ever lands
 * exactly on top of another icon. Pure mapping — the table itself stays
 * owned by the desktop component.
 *
 * @param count the number of icons to lay out.
 * @param table the tuned default spots, in catalog order.
 * @returns one default spot per icon (shorter when the table is empty).
 */
export function defaultSpots(count: number, table: readonly IconSpot[]): IconSpot[] {
  const spots: IconSpot[] = [];
  for (let index = 0; index < count; index += 1) {
    const spot = table[index % table.length];
    if (!spot) continue;
    const lap = Math.floor(index / table.length);
    spots.push({
      x: clampNumber(spot.x + lap * 4, 8, 92),
      y: clampNumber(spot.y - lap * 5, 16, 74),
    });
  }
  return spots;
}

/** the ordered column-flow slots: fills top-to-bottom, then wraps to the
 * next column — the Windows "arrange icons" flow on the same lattice */
export function flowSpots(count: number): IconSpot[] {
  const rows = 6;
  const spots: IconSpot[] = [];
  for (let index = 0; index < count; index += 1) {
    const column = Math.floor(index / rows);
    const row = index % rows;
    spots.push({ x: 6 + column * 8, y: 18 + row * 11 });
  }
  return spots;
}

/** the flow layout of one sorted catalog as a spot map (clamped + snapped) */
export function flowLayoutSpots<T extends SortableApp>(apps: readonly T[], bounds: IconBounds): IconSpotMap {
  const slots = flowSpots(apps.length);
  const spots: IconSpotMap = {};
  apps.forEach((app, index) => {
    const slot = slots[index];
    if (slot) spots[app.id] = fitSpot(slot, bounds);
  });
  return spots;
}
