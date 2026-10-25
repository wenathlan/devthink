/**
 * Bun entry of the 1.1.67 family, widened by the 1.1.81 library modes.
 * The shared core for bun consumers: the build emits this entry as the esm bundle of the bun platform target, with the filesystem storage adapter and the platform clock, logger and fetch primitives wired through the platform adapter contract.
 */

export * from "./index.js";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { nodeplatformadapter, stampbundle } from "./runtime.js";

stampbundle("esm", "bun.js");

/** The bun runtime adapter: the storage seam maps onto the filesystem under the profile directory the caller configures, while the clock, logger and fetch seams bind the bun platform primitives. */
export function bunadapter(profiledir: string) {
  return nodeplatformadapter({
    profiledir,
    fs: {
      readfile: (path) => readFile(path, "utf8"),
      writefile: (path, data) => writeFile(path, data, "utf8"),
      mkdir: async (path) => {
        await mkdir(path, { recursive: true });
      },
      join: (...parts) => join(...parts),
    },
  });
}
