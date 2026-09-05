/**
 * Bun entry of the 1.1.67 family, widened by the 1.1.81 library modes.
 * The shared core for bun consumers: the build emits this entry as the esm bundle of the bun platform target, with the filesystem storage adapter and the platform clock, logger and fetch primitives wired through the platform adapter contract.
 */
export * from "./index.js";
/** The bun runtime adapter: the storage seam maps onto the filesystem under the profile directory the caller configures, while the clock, logger and fetch seams bind the bun platform primitives. */
export declare function bunadapter(profiledir: string): import("./types.js").adaptercontract;
//# sourceMappingURL=bun.d.ts.map