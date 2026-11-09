/**
 * uistoreface.ts — the typed library face of the vault uistore factory for
 * the typecheck build, declared as a real module the tsconfig paths resolve
 * the published subpath onto (the consolidation wave's os port reads the
 * vault factory through the "@wenathlan/vault/uistore" specifier, and the
 * declaration pass answers these declarations instead of the owner source —
 * the rootDir law keeps every emit input inside the application root, so
 * the sibling vault tree never enters the program; the runtime keeps
 * resolving the real source through the bundle alias table that inlines the
 * owner's reviewed tree, and the registry envelope carries the published
 * door a rung late the distpackage lane always answers).
 * Retires the day the published vault envelope ships a declaration build
 * beside the sources the saddle faces law pins.
 */
/* ── the uistore lane face (the consolidation wave's os port) ── */

/** One ui copy row of the db the store serves: the stable dotted key, the
 * text it serves, the locale it answers and the write stamp the db carried. */
export interface uicopyrow {
  /** The stable dotted key the components cite. */
  key: string;
  /** The text the row serves. */
  value: string;
  /** The locale the row answers (the store seeds the default). */
  locale: string;
  /** The last write of the row (the datetime the db stamped). */
  updated: string;
}

/** The factory options the seat answers: the frozen seed, the lazy db file
 * door, the validated base door the live loader rides, the fallback chain
 * below the seed and the second seed the boot ingest merges. */
export interface uistoreoptions {
  /** The build seed of the seat: the one place the app's copy literals
   * live (frozen rows, dotted key to text). */
  seed: Readonly<Record<string, string>>;
  /** The db file door of the seat: resolves lazily at first open so the
   * env can point the tests (the vault seat reads VAULT_UISTORE_DB, the os
   * seat DEVTHINK_UISTORE_DB; the default lands beside the working
   * directory the way the site store does). */
  dbfile: () => string;
  /** The validated base door the live loader rides: answers the
   * same-origin origin the platform serves /api/v1/ui/copy over, or null
   * when no base answers — the seed keeps answering (the offline build
   * law). */
  base: () => string | URL | null;
  /** The chain door below the seed: the store the accessor consults when
   * neither the live rows nor the seed carry the key (the vault seat rides
   * the labels store, the os seat its copy store); an undefined answer
   * falls to the key itself (the missing key is loud, never a blank). */
  fallback?: (key: string) => string | undefined;
  /** The second seed the boot ingest merges: the rows the seat's own seed
   * does not already carry fill the table together, so one db answers
   * every surface of the app — equal keys update in place; the seed never
   * invents a word. */
  extraseed?: () => Readonly<Record<string, string>>;
}

/** The seat surface the factory returns: the names every family app
 * already exports over its own uistore door, so each importer keeps
 * resolving the same surface. */
export interface uistoreseat {
  /** The frozen seed rows (key to text). */
  uistoreseedrows(): Readonly<Record<string, string>>;
  /** Loads the live ui rows over the seat's validated base. */
  loaduicopy(): Promise<void>;
  /** The typed accessor the wingets render through. */
  uicopy(key: string): string;
  /** The placeholder door: fills the {token} slots of one format key. */
  uicopyfill(key: string, values: Record<string, string>): string;
  /** One ui copy row of the db by key. */
  uistoreget(key: string, locale?: string): Promise<uicopyrow | null>;
  /** Every ui copy row of one locale. */
  uistorelist(locale?: string): Promise<uicopyrow[]>;
  /** The write lane: each row upserts in place. */
  uistoreupsert(rows: readonly { key: string; value: string }[], locale?: string): Promise<number | null>;
  /** The boot seed: the seed rows and the extra seed fill the table. */
  uistoreingest(locale?: string): Promise<number | null>;
  /** The lazy boot the route lane rides: the seed fills the table on the
   * first copy request, never twice. */
  ensureuicopyingested(): Promise<number | null>;
}

/** The factory the family seats ride: builds the seat over the options
 * (the engine owns the mechanism, the seat owns the data — the
 * onboardingstore factory law). */
export declare function createuistore(options: uistoreoptions): uistoreseat;

/** The react hook the copy surfaces ride: bumps the render when the live
 * load answers, so the seed flashes and the live rows take the seat. */
export declare function useUicopyCore(load: () => Promise<void>): void;
