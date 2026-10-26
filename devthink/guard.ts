/**
 * guard — the reporting channel of the devtools wall (component-scoped
 * logic, lives at the web root). The detection machinery and the trip
 * surface live in devtoolsguard.ts, the single module; this file only
 * speaks to the site api: the strike report a tripped wall emits and the
 * ban status question the boot asks. The api records the strike in the
 * shared table every clone db syncs; the interface answer is the wall's
 * calm interstitial (devtoolsguard.ts owns it) — never a blank, never a
 * wipe. The visitor machine is never touched — only the report rides
 * over https.
 *
 * @section base the catalog base the reports ride
 * @section strike the strike report (the wall's trip listener calls it)
 * @section status the ban status question of the boot
 * @depends-on devtoolsguard.ts (the caller of the strike, the owner of the response)
 * @consumed-by App.tsx (the boot wiring)
 */

/** @section base — the catalog base of the site api (empty means offline:
 * every call below stays silent and the interface renders). */
const GUARD_BASE = (import.meta.env?.VITE_CATALOG_URL as string | undefined)?.replace(/\/$/, "") ?? "";

/**
 * @section strike — reports one strike to the site api. The call changes
 * nothing on the surface (the interstitial already stands when the wall
 * emits); offline stays silent.
 *
 * @param signal the dotted prong id that tripped (the api records it).
 */
export async function reportguardstrike(signal: string): Promise<void> {
  try {
    if (GUARD_BASE) {
      await fetch([GUARD_BASE, "guard", "strike"].join("/"), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ signal, href: location.href }),
      });
    }
  } catch {
    /* offline: the wall still answers locally */
  }
}

/**
 * @section status — asks the api whether this address is banned. The
 * answer is a boolean and nothing else: the caller decides the surface
 * (the boot shows the wall interstitial when true); this channel never
 * blanks anything itself.
 *
 * @returns true when the api answers banned, false everywhere else.
 */
export async function guardStatus(): Promise<boolean> {
  try {
    if (!GUARD_BASE) return false;
    const answer = await fetch([GUARD_BASE, "guard", "status"].join("/"), { headers: { accept: "application/json" } });
    if (answer.ok) {
      const payload = (await answer.json()) as { banned?: boolean };
      if (payload.banned) return true;
    }
  } catch {
    /* offline: the interface renders */
  }
  return false;
}
