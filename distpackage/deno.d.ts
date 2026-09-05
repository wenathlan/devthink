/**
 * Deno entry of the 1.1.67 family, widened by the 1.1.81 library modes.
 * The shared core for deno consumers: the build emits this entry as the esm bundle of the deno platform target, with the deno kv storage adapter and the platform clock, logger and fetch primitives wired through the platform adapter contract, and the configuration read behind the adapter seam so the entry never imports the deno file api directly.
 */
export * from "./index.js";
import type { denokvprimitives } from "./runtime.js";
/** The deno runtime adapter: the host opens its kv store with Deno.openKv and passes it here, while the clock, logger and fetch seams bind the deno platform primitives. */
export declare function denoadapter(kv: denokvprimitives): import("./types.js").adaptercontract;
/** Reads the deno configuration through the adapter seam: the host injects its read primitive, so the deno entry never imports the deno file api directly and the configuration discovery stays testable on every runtime. Example: `denoconfigread(read)` answers the parsed deno.json map. */
export declare function denoconfigread(read: (path: string) => Promise<string>, path?: string): Promise<Record<string, unknown>>;
//# sourceMappingURL=deno.d.ts.map