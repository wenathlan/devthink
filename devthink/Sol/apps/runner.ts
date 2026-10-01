/** Style: DevThink runner gateway — the launch and render queue client of the native apps.
 * The queue rides the same paired catalog base the data layer reads: the base is read
 * from the environment exactly like catalog.ts reads it, validated once, and refused
 * when it points at localhost, a loopback literal or a private or reserved range.
 * Every queue call answers with data instead of throwing, because the surface stays
 * honest when the gateway is absent. The interface never touches the visitor machine,
 * so the queue writes nothing locally and carries no secrets. */
import type { RunnerBinary, StudioAsset } from "../../catalog";

/** Reads and validates the paired catalog base the same way catalog.ts does: the
 * trailing slash is trimmed, the address must be http or https, and loopback,
 * localhost and private or reserved hosts keep the base closed. */
export function catalogbase(): string {
  const base = (import.meta.env?.VITE_CATALOG_URL as string | undefined)?.replace(/\/$/, "") ?? "";
  if (!base) return "";
  try {
    const parsed = new URL(base);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return "";
    if (!hostIsAllowed(parsed.hostname)) return "";
    return base;
  } catch {
    return "";
  }
}

/** Decides whether a host name may carry queue traffic: localhost, loopback
 * literals and private or reserved ranges are refused, everything else passes. */
function hostIsAllowed(host: string): boolean {
  const name = host.replace(/^\[|\]$/g, "").toLowerCase();
  if (!name || name === "localhost" || name.endsWith(".localhost")) return false;
  if (name === "::1" || name === "::" || name === "0.0.0.0") return false;
  if (name.startsWith("::ffff:")) return hostIsAllowed(name.slice("::ffff:".length));
  if (name.includes(":")) {
    // ipv6 literals: unique local fc00::/7 and link local fe80::/10 stay reserved here
    if (name.startsWith("fc") || name.startsWith("fd") || name.startsWith("fe80")) return false;
    return true;
  }
  const octets = name.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!octets) return true;
  const parts = octets.slice(1).map(Number);
  if (parts.some((part) => part > 255)) return false;
  const [first, second] = parts;
  if (first === 0 || first === 10 || first === 127) return false;
  if (first === 169 && second === 254) return false;
  if (first === 172 && second >= 16 && second <= 31) return false;
  if (first === 192 && second === 168) return false;
  if (first === 100 && second >= 64 && second <= 127) return false;
  return true;
}

/** Queues one competitor binary launch over the gateway. The answer is always a
 * plain object, so the calling page can surface the reason with a toast and the
 * interface keeps working when the gateway is missing or unreachable. */
export async function queuebinarylaunch(binary: RunnerBinary): Promise<{ queued: boolean; reason: string }> {
  const base = catalogbase();
  if (!base) return { queued: false, reason: "No catalog base is paired, so the launch queue stays closed." };
  try {
    const answer = await fetch(`${base}/runner/queue`, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({ binary: binary.id, kind: binary.kind, runner: binary.runner }),
    });
    if (!answer.ok)
      return { queued: false, reason: `The gateway refused the launch of ${binary.title} (status ${answer.status}).` };
    return { queued: true, reason: "queued over the gateway" };
  } catch {
    return { queued: false, reason: `The gateway could not be reached to queue the launch of ${binary.title}.` };
  }
}

/** Queues one studio render over the gateway with the same pattern as the launch
 * queue: the note travels with the asset, and the answer stays a plain object. */
export async function queuestudiorender(asset: StudioAsset, note: string): Promise<{ queued: boolean; reason: string }> {
  const base = catalogbase();
  if (!base) return { queued: false, reason: "No catalog base is paired, so the render queue stays closed." };
  try {
    const answer = await fetch(`${base}/studio/render`, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({ asset: asset.id, engine: asset.engine, note }),
    });
    if (!answer.ok)
      return { queued: false, reason: `The gateway refused the render of ${asset.title} (status ${answer.status}).` };
    return { queued: true, reason: "queued over the gateway" };
  } catch {
    return { queued: false, reason: `The gateway could not be reached to queue the render of ${asset.title}.` };
  }
}
