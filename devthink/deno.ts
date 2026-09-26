/**
 * Deno entry of the 1.1.67 family, widened by the 1.1.81 library modes.
 * The shared core for deno consumers: the build emits this entry as the esm bundle of the deno platform target, with the deno kv storage adapter and the platform clock, logger and fetch primitives wired through the platform adapter contract, and the configuration read behind the adapter seam so the entry never imports the deno file api directly.
 */

export * from "./index.js";
import { denoplatformadapter, stampbundle } from "./runtime.js";
import type { denokvprimitives } from "./runtime.js";

stampbundle("esm", "deno.js");

/** The deno runtime adapter: the host opens its kv store with Deno.openKv and passes it here, while the clock, logger and fetch seams bind the deno platform primitives. */
export function denoadapter(kv: denokvprimitives) {
  return denoplatformadapter({ kv });
}

/** Reads the deno configuration through the adapter seam: the host injects its read primitive, so the deno entry never imports the deno file api directly and the configuration discovery stays testable on every runtime. Example: `denoconfigread(read)` answers the parsed deno.json map. */
export async function denoconfigread(
  read: (path: string) => Promise<string>,
  path = "deno.json",
): Promise<Record<string, unknown>> {
  const content = await read(path);
  const parsed = JSON.parse(content) as unknown;
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed))
    throw new Error(`The ${path} configuration must be a json object.`);
  return parsed as Record<string, unknown>;
}
