/**
 * world.ts — the world asset storage and pre-compilation surface of
 * stealhead (root layer).
 *
 * the world gallery catalogs the GLB scene assets of the platform as DB
 * rows (name, kind, glb path, sha-256, size). the binary GLB files live
 * in git lfs inside the repository and are cataloged in the site DB —
 * the virtual-repo doctrine: the row is the source of truth, the binary
 * downloads separately and is verified against the row digest. the game
 * itself renders through the versawase engine imported from the
 * published library @wenathlan/cadria; stealhead owns no engine code,
 * only this storage and pre-compilation surface. the platform ships
 * pre-compiled — shaders and assets are prepared ahead on the family
 * domains, so the visitor VGPU/VCPU never compiles anything and the
 * interface never touches the visitor machine.
 */

/** the world asset kinds the catalog tracks. */
export type WorldAssetKind = "map" | "prop" | "character" | "effect";

/** one world asset row: a DB catalog entry for an lfs-tracked GLB. */
export type WorldAsset = {
  /** the display name of the asset in the gallery. */
  name: string;
  /** the catalog kind (map, prop, character or effect). */
  kind: WorldAssetKind;
  /** the lfs-tracked glb path inside the repository. */
  path: string;
  /** the sha-256 the build verifies against the downloaded binary. */
  sha256: string;
  /** the payload size in bytes of the prepared asset. */
  size: number;
  /** every asset ships pre-compiled — the platform default, always. */
  precompiled: true;
};

/**
 * the render intent of the platform: every world scene renders through
 * the versawase engine of cadria (the Blender / After Effects / DaVinci
 * / Photoshop / Remotion lineage), imported from the published library
 * @wenathlan/cadria. stealhead owns no engine code — it owns storage
 * and pre-compilation only, and the render never executes on the
 * visitor machine.
 */
export type RenderIntent = {
  /** the one rendering engine of the family: versawase. */
  engine: "versawase";
  /** the published library the engine is imported from. */
  library: "@wenathlan/cadria";
  /** the pipeline stage the asset enters the engine in. */
  stage: "pre-compiled";
};

/** the render intent every world asset ships with. */
export const RENDERINTENT: RenderIntent = { engine: "versawase", library: "@wenathlan/cadria", stage: "pre-compiled" };

/** the in-memory seed the DB layer persists on first run. */
export const WORLDCATALOG: WorldAsset[] = [
  { name: "steelhead dam", kind: "map", path: "assets/glb/steelhead.dam.glb", sha256: "9f2c41a7c0d54b8eaf61d0b73e2c88a1d94f6027c3b5811e70ada9be4f2c119d", size: 48231424, precompiled: true },
  { name: "cold harbor", kind: "map", path: "assets/glb/cold.harbor.glb", sha256: "3ab81c95e6f74d120cd9a5b0f8e37641d02ca9f5b61e8437f09d2cbe5a741e88", size: 39871232, precompiled: true },
  { name: "rift yard", kind: "map", path: "assets/glb/rift.yard.glb", sha256: "c47de0192ab63f85d07e4b1c92a68350fe1bd2744a90c8361e5fb7d203a9c461", size: 44118784, precompiled: true },
  { name: "emberline crate set", kind: "prop", path: "assets/glb/emberline.crates.glb", sha256: "7d90f3b26a184ce5b0912d74f3a6c821e0b5d9384c671af205e3d8b94a6c0f72", size: 2411520, precompiled: true },
  { name: "operator ember", kind: "character", path: "assets/glb/operator.ember.glb", sha256: "b16a48d07f2c359e8417a0dc65b3f29107cd84ea5f206b39c1873de20a4bf5c3", size: 8720384, precompiled: true },
  { name: "operator tide", kind: "character", path: "assets/glb/operator.tide.glb", sha256: "52c9e1fa37b84d06a590c3e72f14b8d6930ac5217be08f44d9c2a6e08137b0d5", size: 8654848, precompiled: true },
  { name: "muzzle ember fx", kind: "effect", path: "assets/glb/fx.muzzle.ember.glb", sha256: "e0834b6d92a57c1f04b3d8e26a71c9f5402bd9638e1a74c50f3d629be7a1c842", size: 638976, precompiled: true },
  { name: "solstice banner fx", kind: "effect", path: "assets/glb/fx.solstice.banner.glb", sha256: "1a6d93c07f48b25ed31a7f5c802e94b6d17c0f38a9427e15c6d0b38f42a95e70", size: 512000, precompiled: true },
];

/**
 * checks the shape of a sha-256 digest (64 hex characters).
 *
 * @param hash the digest to check.
 * @returns true when the digest is well formed.
 */
export function ishashshape(hash: string): boolean {
  return /^[0-9a-f]{64}$/.test(hash);
}

/**
 * normalizes an asset path to the repository form: forward slashes, no
 * leading slash, no trailing whitespace.
 *
 * @param path the raw path.
 * @returns the normalized path.
 */
export function normalizepath(path: string): string {
  return path.trim().replace(/\\/g, "/").replace(/^\/+/, "");
}

/**
 * joins the lfs root with an asset name into the canonical glb path.
 *
 * @param name the asset file name (extension included).
 * @returns the repository path the lfs tracker expects.
 */
export function glbpath(name: string): string {
  return normalizepath(`assets/glb/${name}`);
}

/**
 * catalogs one asset row: builds the WorldAsset from its pieces, with
 * the canonical lfs path and a lowercase digest (the platform ships
 * pre-compiled, so precompiled is always true).
 *
 * @param name the display name.
 * @param kind the catalog kind.
 * @param sha256 the sha-256 digest of the binary.
 * @param size the payload size in bytes.
 * @param glbname the optional glb file name (defaults to the slug).
 * @returns the cataloged asset row.
 */
export function catalogasset(name: string, kind: WorldAssetKind, sha256: string, size: number, glbname?: string): WorldAsset {
  const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/^\.+|\.+$/g, "");
  return { name, kind, path: glbpath(glbname ?? `${slug}.glb`), sha256: sha256.trim().toLowerCase(), size, precompiled: true };
}

/**
 * verifies one asset row before it enters the catalog: the digest must
 * be a well formed sha-256 and the path must be in repository form.
 *
 * @param asset the row to verify.
 * @returns true when the row is catalog-safe.
 */
export function verifyasset(asset: WorldAsset): boolean {
  return ishashshape(asset.sha256) && asset.path === normalizepath(asset.path) && asset.path.endsWith(".glb") && asset.precompiled;
}

/**
 * filters the catalog by kind.
 *
 * @param assets the rows to filter.
 * @param kind the kind to keep (all rows when omitted).
 * @returns the matching rows.
 */
export function filterbykind(assets: WorldAsset[], kind?: WorldAssetKind): WorldAsset[] {
  return kind ? assets.filter((asset) => asset.kind === kind) : [...assets];
}

/**
 * formats a byte size for the gallery badges.
 *
 * @param bytes the payload size.
 * @returns the human size label.
 */
export function humansize(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) return `${Math.round((bytes / (1024 * 1024 * 1024)) * 10) / 10} gb`;
  if (bytes >= 1024 * 1024) return `${Math.round((bytes / (1024 * 1024)) * 10) / 10} mb`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} kb`;
  return `${bytes} b`;
}

/** fetch budget for the HTTPS answer of the self-hosted DB. */
const fetchbudget = 2500;

/** the in-memory answer cache for the document lifetime (no storage). */
let worldcache: WorldAsset[] | null = null;

/**
 * lists the world catalog rows: asks the self-hosted DB over HTTPS first
 * and falls back to the in-memory seed when the endpoint is absent
 * (static build). never touches the visitor machine.
 *
 * @returns the world asset rows.
 */
export async function listworldassets(): Promise<WorldAsset[]> {
  if (worldcache) return worldcache;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), fetchbudget);
    const response = await fetch("/api/v1/world", { signal: controller.signal });
    clearTimeout(timer);
    if (!response.ok) throw new Error(`world answered ${response.status}`);
    const rows = (await response.json()) as WorldAsset[];
    worldcache = rows;
    return rows;
  } catch {
    return WORLDCATALOG;
  }
}
