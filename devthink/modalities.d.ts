/**
 * Declaration seam for the saddle modality registry — the sibling engine
 * module the sandbox lane reads through the library specifier
 * "@wenathlan/saddle/modalities". The installed envelope of the engine
 * still lacks that export surface, so the runtime resolves the specifier
 * through the bridge family (the tsconfig paths, the vite and vitest
 * aliases), and this declaration answers the one resolver that must never
 * follow a bridge into the sibling package: the declaration emit of
 * tsconfig.build.json, whose paths override drops the mapping so the
 * ambient module below is the type surface it reads. The seam mirrors the
 * exported surface of saddle/modalityregistry.ts and retires together
 * with the bridges the day the published envelope carries the export.
 */
declare module "@wenathlan/saddle/modalities" {
  /** The boot cost classes the ladder measures. */
  export type BootClass = "hot" | "warm" | "cold";
  /** The honest wiring state of one modality (the report never lies). */
  export type ModalityState = "live" | "host" | "planned";
  /** One sandbox modality of the registry. */
  export interface ModalityRecord {
    /** The stable id the api and the config rows reference. */
    id: string;
    /** The display label (short, lowercase). */
    label: string;
    /** The isolation family the modality belongs to. */
    family: string;
    /** The isolation depth the family reaches. */
    isolation: "process" | "namespace" | "vm" | "hardware";
    /** The honest wiring state of the modality. */
    state: ModalityState;
    /** The driver modules the modality mounts when it boots. */
    drivers: readonly string[];
    /** The hardening gates the modality enforces by default. */
    hardening: readonly string[];
    /** The boot cost class. */
    boot: BootClass;
    /** The measured boot budget in milliseconds. */
    bootms: number;
    /** Whether the modality presents a gpu through the virtual drivers. */
    gpu: boolean;
    /** Whether the modality opens a network path. */
    network: boolean;
    /** The mime type the modality's api surface answers. */
    mime: string;
  }
  /** The honest plan report: what the catalog holds against the forty plan. */
  export interface ModalityPlanReport {
    plancount: number;
    catalogcount: number;
    live: number;
    host: number;
    planned: number;
    plananswered: boolean;
  }
  /** The boot budgets of the ladder, per class. */
  export const BOOTLADDER: Readonly<Record<BootClass, number>>;
  /** The forty modality plan: the count the owner charged. */
  export const MODALITYPLANCOUNT: 40;
  /** The modality records: the catalog the join resolver reads. */
  export const MODALITIES: readonly ModalityRecord[];
  /** The honest census of the registry against the forty plan. */
  export function planreport(): ModalityPlanReport;
  /** Resolves the modality join for a request (the nuclear law). */
  export function resolvejoin(request: {
    base: "max" | "balanced" | "lite";
    gpu: boolean;
    network: boolean;
    isolation?: ModalityRecord["isolation"];
    bootbudget?: number;
    family?: string;
  }): readonly ModalityRecord[];
  /** Answers one modality by id. */
  export function getmodality(id: string): ModalityRecord | undefined;
}
