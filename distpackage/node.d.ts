/**
 * Node entry of the 1.1.67 family, widened by the 1.1.81 library modes.
 * The shared core for require based consumers: the build emits this entry as the cjs bundle of the node platform target, with the filesystem storage adapter, the platform clock, logger and fetch primitives wired through the platform adapter contract.
 */
export * from "./index.js";
/** The node runtime adapter: the storage seam maps onto the filesystem under the profile directory the caller configures, while the clock, logger and fetch seams bind the node platform primitives. */
export declare function nodeadapter(profiledir: string): import("./types.js").adaptercontract;
//# sourceMappingURL=node.d.ts.map