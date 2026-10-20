/**
 * harddrives.ts — the drive registry of the os (root logic layer). The os
 * treats databases as hard drives: every drive is one owner partition of
 * the local store (the browser database keys every record by its owner),
 * the active drive is the owner the meta identity points at, and opening a
 * new drive is mounting a fresh partition — the old drive keeps its records
 * on this machine and can be mounted again at any time. The registry rides
 * localStorage; the meta identity stays the single source of truth for the
 * mounted drive.
 */
import { activateOwnerDrive, type BrowserIdentity, browserIdentity } from "./db.ts";

/** one drive of this machine: the owner partition with its given label */
export type HardDrive = {
  /** the owner id the partition answers to (the db owner expression) */
  id: string;
  /** the name the operator gave the drive */
  label: string;
  /** the device id minted with the drive */
  deviceId: string;
  /** when the drive was created */
  createdAt: string;
};

/** the registry key of this machine's known drives */
export const DRIVES_KEY = "dt.hd.list";

function readdrives(): HardDrive[] {
  try {
    const raw = window.localStorage.getItem(DRIVES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Partial<HardDrive>[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is HardDrive =>
        typeof item?.id === "string" &&
        typeof item?.label === "string" &&
        typeof item?.deviceId === "string" &&
        typeof item?.createdAt === "string",
    );
  } catch {
    return [];
  }
}

function savedrives(list: HardDrive[]): void {
  try {
    window.localStorage.setItem(DRIVES_KEY, JSON.stringify(list));
  } catch {
    /* storage unavailable: the registry lives for this session only */
  }
}

/** the drives of this machine plus the one currently mounted (the active
 * drive registers itself lazily, so a machine that never opened the panel
 * still answers one drive). The lazy registration answers the CALLER too:
 * the first visit returns the freshly registered drive in its list (the
 * stale-list bug — the first read answered zero drives and the panels
 * stayed empty until a reload — is dead: the saved array is the returned
 * array). */
export async function drives(): Promise<{ active: HardDrive; list: HardDrive[] }> {
  const identity = await browserIdentity();
  let list = readdrives();
  const active: HardDrive = list.find((item) => item.id === identity.userId) ?? {
    id: identity.userId,
    label: "HD 1",
    deviceId: identity.deviceId,
    createdAt: identity.createdAt,
  };
  if (!list.some((item) => item.id === active.id)) {
    list = [active, ...list];
    savedrives(list);
  }
  return { active, list };
}

function midentity(): string {
  const alphabet = "0123456789abcdefghjkmnpqrstvwxyz";
  const bytes = new Uint8Array(11);
  globalThis.crypto?.getRandomValues?.(bytes);
  const token = Array.from(bytes, (value) => alphabet[value & 31]).join("") || Math.random().toString(36).slice(2, 13);
  return `b${token}`;
}

/** mounts a brand-new drive: the current drive registers (it stays on this
 * machine), a fresh owner partition becomes the mounted one — an empty
 * database until the operator fills it */
export async function newdrive(label?: string): Promise<HardDrive> {
  const identity = await browserIdentity();
  const list = readdrives();
  if (!list.some((item) => item.id === identity.userId))
    list.unshift({
      id: identity.userId,
      label: `HD ${list.length + 1}`,
      deviceId: identity.deviceId,
      createdAt: identity.createdAt,
    });
  const drive: HardDrive = {
    id: midentity(),
    label: label?.trim() || `HD ${list.length + 1}`,
    deviceId: `d_${identity.deviceId.slice(2)}`,
    createdAt: new Date().toISOString(),
  };
  list.unshift(drive);
  savedrives(list);
  await activateOwnerDrive({ userId: drive.id, deviceId: drive.deviceId, createdAt: drive.createdAt });
  return drive;
}

/** mounts one known drive: the meta identity points back at its owner and
 * every record of that partition comes with it */
export async function opendrive(id: string): Promise<void> {
  const drive = readdrives().find((item) => item.id === id);
  if (!drive) throw new Error("Drive not found on this machine.");
  await activateOwnerDrive({ userId: drive.id, deviceId: drive.deviceId, createdAt: drive.createdAt });
}

/** renames one known drive */
export function renamerive(id: string, label: string): void {
  const list = readdrives();
  const drive = list.find((item) => item.id === id);
  if (!drive) return;
  drive.label = label.trim() || drive.label;
  savedrives(list);
}
