// # guard — the devtools shield of the interface (component-scoped logic, lives
// inside Sol). The moment a visitor opens devtools or scripts the network
// layer, the guard reports the strike to the site api, the api records the ban
// in the shared table every clone db syncs, and the interface goes blank for
// that address: six minutes on the first strike, doubling every repeat. The
// visitor machine is never touched — only the report rides over https.
const GUARD_BASE = (import.meta.env?.VITE_CATALOG_URL as string | undefined)?.replace(/\/$/, "") ?? "";

/** Detection signals: debugger timing trap, window size delta and the console getter. */
function detectOnce(signal: string): void {
  strike(signal);
}

export function armGuard(): void {
  // 1. the debugger trap: an open devtools pauses here and the timing gap answers
  const started = Date.now();
  // eslint-disable-next-line no-debugger
  debugger;
  if (Date.now() - started > 120) detectOnce("debugger.trap");
  // 2. the size delta: a docked devtools changes the outer/inner viewport ratio
  const delta = Math.abs(window.outerWidth - window.innerWidth) + Math.abs(window.outerHeight - window.innerHeight);
  if (delta > 220) detectOnce("size.delta");
  // 3. the console getter: touching it answers the strike
  try {
    const probe = /devtools/i;
    probe.toString = () => {
      detectOnce("console.getter");
      return "";
    };
    void String(probe);
  } catch {
    /* the probe never throws the interface */
  }
}

/** Reports one strike and blanks the interface — the api owns the shared ban table. */
async function strike(signal: string): Promise<void> {
  blank();
  try {
    if (GUARD_BASE) {
      await fetch(`${GUARD_BASE}/guard/strike`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ signal, href: location.href }),
      });
    }
  } catch {
    /* offline: the blank mode still answers locally */
  }
}

/** Asks the api whether this address is banned; banned interfaces render nothing. */
export async function guardStatus(): Promise<boolean> {
  try {
    if (!GUARD_BASE) return false;
    const answer = await fetch(`${GUARD_BASE}/guard/status`, { headers: { accept: "application/json" } });
    if (answer.ok) {
      const payload = (await answer.json()) as { banned?: boolean };
      if (payload.banned) {
        blank();
        return true;
      }
    }
  } catch {
    /* offline: the interface renders */
  }
  return false;
}

/** The blank mode: the site goes white and stays there for the banned address. */
export function blank(): void {
  const root = document.getElementById("root");
  if (root) root.textContent = "";
  document.documentElement.style.background = "#ffffff";
}
