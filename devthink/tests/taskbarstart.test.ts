/**
 * taskbarstart.test.ts — the win11 fidelity battery of the taskbar and the
 * start menu (wave design/taskbarstart). The owner looked at the shell and
 * the clone was missing — this battery pins the exact numbers the
 * win11React sources carry, four layers deep:
 *
 * - the taskbar: the 48px acrylic bar over --win-taskbar-* (tint
 *   rgba(32,32,32,.75) dark / rgba(243,243,243,.85) light, saturate(3)
 *   blur(20px)), the 44px cell with the 38×38 r4 face, the hover wash pair
 *   (white/10 dark, white/67 light), the 3px open/active ladder (0 closed,
 *   6px #858585 open, 12px accent), the 800ms popintro bounce (0 → 1.125 →
 *   0.725 → 1, killed under reduced motion), the widgets trigger on the
 *   docked-bottom left edge, the search trigger beside the mark and the
 *   two-line 11px tray clock;
 * - the start menu: the 640px acrylic panel (blur(20px) WITHOUT saturate,
 *   radius 8px, bottom 12px) entering translateY(100px) on the 200ms
 *   cubic-bezier(.79,.14,.15,.86) start curve, the live registry search on
 *   top, the 96×84 six-column pinned grid with its padding faces, the
 *   Recommended rows fed by the recent-entries store (never a fixed word),
 *   the All apps page sliding on the 300ms cubic-bezier(0,.58,.42,1) page
 *   curve over the --win-start-w token with the alphabet jump rail, and the
 *   64px footer with the account profile and the power corner;
 * - the store lane: the recentapps v2 timestamped entries with the v1
 *   fallback, the cap and the dedupe, the malformed answers;
 * - the copy discipline: every new word rides the uistore seed through
 *   uicopy — no literal lives in the chrome.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { DESKTOP_APPS, PINNED_APPS, searchDesktopApps } from "../appregistry.ts";
import { loadrecentapps, loadrecententries, pushrecentapp } from "../recentapps.ts";
import { uicopy, uistoreseedrows } from "../uistore.ts";

const chrome = readFileSync(join(import.meta.dirname, "..", "Sol", "wingets", "Shellchrome.tsx"), "utf8");
const solcss = readFileSync(join(import.meta.dirname, "..", "Sol", "sol.css"), "utf8");
const recentappssource = readFileSync(join(import.meta.dirname, "..", "recentapps.ts"), "utf8");

/** installs a minimal window.localStorage stub (the node battery has no
 * browser): the map-backed accessors the recentapps helpers read */
function installStorage(initial: Record<string, string> = {}): void {
  const store = new Map(Object.entries(initial));
  (globalThis as Record<string, unknown>).window = {
    localStorage: {
      getItem: (key: string) => (store.has(key) ? (store.get(key) as string) : null),
      setItem: (key: string, value: string) => void store.set(key, value),
      removeItem: (key: string) => void store.delete(key),
    },
  };
}

afterEach(() => {
  delete (globalThis as Record<string, unknown>).window;
});

describe("the taskbar acrylic bar (the 48px doctrine numbers)", () => {
  it("the bar rides the win shell tokens: 48px over the saturate(3) blur(20px) acrylic bed", () => {
    // the component composes the classes; the ladder carries the numbers
    expect(chrome).toContain("dt-nav acrylic-bar fixed bottom-0 inset-x-0 z-50 flex h-12");
    expect(solcss).toContain("--win-taskbar-h: 48px;");
    expect(solcss).toContain("--win-taskbar-tint: rgb(32 32 32 / 75%);");
    expect(solcss).toContain("--win-taskbar-filter: saturate(3) blur(20px);");
    // the acrylic recipe pairs the -webkit- prefix (the house law)
    expect(solcss).toContain(".acrylic-bar {");
    expect(solcss).toContain("-webkit-backdrop-filter: saturate(3) blur(20px);");
    expect(solcss).toContain("backdrop-filter: saturate(3) blur(20px);");
  });

  it("the tint pair rides the theme flip: rgb(32 32 32 / 75%) dark, rgb(243 243 243 / 85%) light", () => {
    expect(solcss).toContain("background-color: rgb(32 32 32 / 75%);");
    expect(solcss).toContain('[data-theme="light"] .acrylic-bar');
    expect(solcss).toContain("background-color: rgb(243 243 243 / 85%);");
  });

  it("the icon cell is the 44px touch target with the 38×38 r4 face inside", () => {
    expect(chrome).toContain("h-11 w-11");
    expect(chrome).toContain("h-[38px] w-[38px]");
    expect(chrome).toContain("rounded-xs");
  });

  it("the hover wash answers the --bg2 pair: white/10 dark, white/67 light", () => {
    expect(chrome).toContain("group-hcf:bg-white/10");
    expect(chrome).toContain("light:group-hcf:bg-white/67");
  });

  it("the open/active ladder is the 3px inline ::after: 0 closed, 6px #858585 open, 12px accent active", () => {
    expect(chrome).toContain("after:h-[3px]");
    expect(chrome).toContain("after:bg-[#858585]");
    expect(chrome).toContain("data-[open=true]:after:w-1.5");
    expect(chrome).toContain("data-[active=true]:after:w-3");
    expect(chrome).toContain("data-[active=true]:after:bg-(--color-win)");
  });

  it("the tray reads the two-line 11px tabular clock (time over date) and hugs the right edge", () => {
    expect(chrome).toContain('className="dt-nav__tray');
    expect(chrome).toContain("dt-nav__clock");
    expect(chrome).toContain("text-[11px]");
    expect(chrome).toContain("tabular-nums");
    const clock = chrome.indexOf("dt-nav__clock");
    const block = chrome.slice(clock, clock + 1400);
    expect(block).toContain("<span>{time}</span>");
    expect(block).toContain("<span>{date}</span>");
  });

  it("the widgets trigger rides the docked-bottom left edge and hands the explore surface", () => {
    expect(chrome).toContain('navbarMode === "docked" && navbarEdge === "bottom" && (');
    expect(chrome).toContain("dt-nav__widget");
    expect(chrome).toContain("top-1/2 left-2");
    expect(chrome).toContain('onClick={() => navigate("/explore")}');
    expect(chrome).toContain('aria-label={uicopy("shell.widgets.aria")}');
  });

  it("the search trigger rides beside the mark and seats the caret in the menu search box", () => {
    expect(chrome).toContain("function openStartSearch()");
    expect(chrome).toContain("pendingSearch.current = true;");
    expect(chrome).toContain("searchRef.current?.focus();");
    expect(chrome).toContain('aria-label={uicopy("shell.search.aria")}');
    expect(chrome).toContain("onClick={openStartSearch}");
  });

  it("the popintro spawn bounce rides the faces: 800ms, 0 → 1.125 → 0.725 → 1", () => {
    expect(chrome).toContain("animate-popintro");
    expect(solcss).toContain("--animate-popintro: dtPopIntro 800ms ease-in-out backwards;");
    const keyframes = solcss.indexOf("@keyframes dtPopIntro");
    const body = solcss.slice(keyframes, keyframes + 200);
    expect(body).toContain("transform: scale(0);");
    expect(body).toContain("transform: scale(1.125);");
    expect(body).toContain("transform: scale(0.725);");
    expect(body).toContain("transform: scale(1);");
  });

  it("reduced motion kills the bounce, the stagger and the page slide (the hard stop)", () => {
    const guard = solcss.indexOf("@media (prefers-reduced-motion: reduce) {\n  .animate-popintro,");
    expect(guard).toBeGreaterThan(-1);
    const block = solcss.slice(guard, guard + 500);
    expect(block).toContain(".dt-start__grid > .dt-start__app {");
    expect(block).toContain("animation: none;");
    expect(block).toContain("transition: none;");
    expect(block).toContain("transform: none;");
  });
});

describe("the start menu panel (the 640px acrylic doctrine numbers)", () => {
  it("the panel is 640px, radius 8px, 12px above the bar, on the acrylic-panel face", () => {
    expect(chrome).toContain('id="dt-start-menu"');
    expect(chrome).toContain("w-[640px]");
    expect(chrome).toContain("rounded-md");
    expect(chrome).toContain("bottom-[calc(var(--shell-bottom)+12px)]");
    expect(chrome).toContain("acrylic-panel");
  });

  it("the menu acrylic is blur(20px) WITHOUT the saturate (the taskbar keeps saturate(3))", () => {
    expect(solcss).toContain(".acrylic-panel.dt-start {");
    const face = solcss.indexOf(".acrylic-panel.dt-start {");
    const block = solcss.slice(face, face + 200);
    expect(block).toContain("backdrop-filter: blur(20px);");
    expect(block).toContain("-webkit-backdrop-filter: blur(20px);");
    expect(block).not.toContain("saturate");
  });

  it("the entrance is the start curve: 200ms cubic-bezier(.79,.14,.15,.86), hidden at translateY(100px)", () => {
    expect(solcss).toContain("--win-ease-start: cubic-bezier(0.79, 0.14, 0.15, 0.86);");
    expect(chrome).toContain("transition-[transform,opacity] duration-200 ease-fluent");
    expect(chrome).toContain('data-[hide=true]:translate-y-[100px]');
    expect(chrome).toContain("data-[hide=true]:opacity-0");
    expect(chrome).toContain("data-[hide=true]:pointer-events-none");
  });

  it("the search well filters the registry live: the query renders the results grid and the empty line", () => {
    expect(chrome).toContain("const results = searchDesktopApps(query);");
    expect(chrome).toContain("onChange={(event) => setQuery(event.target.value)}");
    expect(chrome).toContain("{results.map((app, index) => (");
    expect(chrome).toContain('osText("shell.start.empty").replace("{query}", query)');
  });

  it("the pinned grid is the six-column 96×84 cell with the empty padding faces", () => {
    expect(chrome).toContain("dt-start__grid grid grid-cols-6");
    expect(chrome).toContain("h-[84px]");
    expect(chrome).toContain("const pinnedBlanks = (6 - (PINNED_APPS.length % 6)) % 6;");
    expect(chrome).toContain("BLANK_SLOTS.slice(0, pinnedBlanks)");
    // the empty faces never answer the pointer
    expect(chrome).toContain('aria-hidden="true" className="pointer-events-none h-[84px]"');
  });

  it("the tiles carry the proven hooks: dt-start__app, the 32px tile, the stagger variable", () => {
    expect(chrome).toContain("const START_TILE_CLASS = `dt-start__app");
    expect(chrome).toContain('[&_.dt-tile]:h-8 [&_.dt-tile]:w-8');
    expect(chrome).toContain('style={{ "--stagger-i": index } as CSSProperties}');
    // the css stagger: 60ms per tile, capped so the tail never lags
    expect(solcss).toContain(".dt-start__grid > .dt-start__app {");
    expect(solcss).toContain("animation-delay: calc(min(var(--stagger-i, 0), 12) * 60ms);");
  });

  it("the hover wash of the menu rows answers the --bg2 pair in 100ms ease-in-out", () => {
    expect(chrome).toContain("duration-100 ease-in-out hover:bg-white/10 light:hover:bg-white/90");
  });

  it("the recommended rows are the 56px rnApp cell fed by the recent-entries store", () => {
    expect(chrome).toContain("flex h-14 w-[calc(50%-10px)]");
    expect(chrome).toContain("w-[100px] min-w-0");
    expect(chrome).toContain("useState<RecentEntry[]>(() => loadrecententries())");
    expect(chrome).toContain("pushrecentapp(app.id);");
    expect(chrome).toContain("setRecents(loadrecententries());");
    // the relative ladder: now, minutes, hours — the {n} slots ride the seed
    expect(chrome).toContain('uicopy("shell.start.recent.now")');
    expect(chrome).toContain('uicopy("shell.start.recent.minutes").replace("{n}", String(minutes))');
    expect(chrome).toContain('uicopy("shell.start.recent.hours").replace("{n}", String(hours))');
  });

  it("the All apps page slides on the page curve over the --win-start-w token", () => {
    expect(chrome).toContain("dt-start__allpage");
    expect(solcss).toContain("--win-start-w: 640px;");
    expect(solcss).toContain(".dt-start__allpage[data-allapps=\"true\"] {");
    expect(solcss).toContain("transform: translateX(calc(-1 * var(--win-start-w, 640px)));");
    // the win11React page curve: 300ms cubic-bezier(0,.58,.42,1)
    expect(solcss).toContain("transform 300ms cubic-bezier(0, 0.58, 0.42, 1)");
    expect(solcss).toContain("opacity 300ms cubic-bezier(0, 0.58, 0.42, 1)");
    // the hidden face never catches the pointer
    expect(solcss).toContain(".dt-start__allpage[data-allapps=\"false\"] {");
    expect(solcss).toContain("pointer-events: none;");
  });

  it("the All apps page groups the catalog under the 27 letter slots with the jump rail", () => {
    expect(chrome).toContain('["#", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")]');
    expect(chrome).toContain("function jumpToLetter(letter: string)");
    // the jump scrolls the list to the letter section (the query pins in two
    // fragments — the interpolation never rides a string literal here)
    expect(chrome).toContain("list.querySelector<HTMLElement>(`[data-alpha-letter=");
    expect(chrome).toContain('const target = list.querySelector<HTMLElement>(`[data-alpha-letter="');
    expect(chrome).toContain('letter === "#" ? "hash" : letter');
    expect(chrome).toContain("list.scrollTop = target.offsetTop;");
    expect(chrome).toContain('aria-label={uicopy("shell.start.alpha.aria")}');
    // the back chip closes the page
    expect(chrome).toContain('onClick={() => setShowAll(false)}');
    expect(chrome).toContain('onClick={() => setShowAll(true)}');
  });

  it("the footer is the 64px menuBar: #444/#aaa top border, the account profile and the power corner", () => {
    expect(chrome).toContain("dt-start__foot mt-auto flex h-16 flex-none items-center justify-between border-t border-[#444444] bg-black/15 px-12");
    expect(chrome).toContain("light:border-[#aaaaaa]");
    // the profile: the initial avatar over the account display name
    expect(chrome).toContain("readBrowserPreferences()");
    expect(chrome).toContain("preferences.displayName?.trim()");
    expect(chrome).toContain('uicopy("shell.start.user.fallback")');
    // the power corner: lock, shut down, restart — the real os surfaces
    expect(chrome).toContain('key: "shell.start.power.lock", glyph: Lock, run: () => { closePanel(); navigate("/auth"); }');
    expect(chrome).toContain('key: "shell.start.power.shutdown", glyph: Power, run: () => { closePanel(); navigate("/"); }');
    expect(chrome).toContain('key: "shell.start.power.restart", glyph: Restart, run: () => window.location.reload()');
    expect(chrome).toContain('aria-haspopup="menu"');
  });

  it("the menu body keeps its clicks: the section is a flyout-keep surface", () => {
    const section = chrome.indexOf('id="dt-start-menu"');
    const head = chrome.slice(section, section + 400);
    expect(head).toContain('data-flyout-keep="true"');
  });
});

describe("the recent-entries store (the recommended rail lane)", () => {
  it("the push writes both lanes: the v1 id list and the v2 timestamped pairs", () => {
    expect(recentappssource).toContain('const RECENTS_KEY = "dt.start.recents.v1";');
    expect(recentappssource).toContain('const RECENTS_AT_KEY = "dt.start.recents.v2";');
    expect(recentappssource).toContain("window.localStorage.setItem(RECENTS_KEY, JSON.stringify(next));");
    expect(recentappssource).toContain("window.localStorage.setItem(RECENTS_AT_KEY, JSON.stringify(entries));");
  });

  it("the roundtrip: the opened app lands at the head with its open epoch", () => {
    installStorage();
    const before = Date.now();
    pushrecentapp("chat");
    pushrecentapp("console");
    pushrecentapp("chat");
    const entries = loadrecententries();
    expect(entries[0]).toEqual({ id: "chat", at: expect.any(Number) });
    expect(entries[0].at).toBeGreaterThanOrEqual(before);
    expect(entries[1]?.id).toBe("console");
    expect(loadrecentapps()).toEqual(["chat", "console"]);
  });

  it("the v1 fallback: bare ids answer with at = 0 (the time line hides)", () => {
    installStorage({ "dt.start.recents.v1": JSON.stringify(["docs", "gateway"]) });
    expect(loadrecententries()).toEqual([
      { id: "docs", at: 0 },
      { id: "gateway", at: 0 },
    ]);
  });

  it("the cap holds six slots and a repeat promotes, never duplicates", () => {
    installStorage();
    for (const id of ["a1", "a2", "a3", "a4", "a5", "a6", "a7"]) pushrecentapp(id);
    expect(loadrecententries().length).toBe(6);
    expect(loadrecententries().map((entry) => entry.id)).toEqual(["a7", "a6", "a5", "a4", "a3", "a2"]);
    pushrecentapp("a3");
    const entries = loadrecententries();
    expect(entries[0]?.id).toBe("a3");
    expect(entries.filter((entry) => entry.id === "a3").length).toBe(1);
  });

  it("the malformed store answers honestly: junk json, junk rows, no storage", () => {
    installStorage({ "dt.start.recents.v2": "{not json", "dt.start.recents.v1": "[\"docs\"]" });
    expect(loadrecententries()).toEqual([{ id: "docs", at: 0 }]);
    installStorage({
      "dt.start.recents.v2": JSON.stringify([{ id: "chat" }, { id: 42, at: 5 }, { id: "console", at: "x" }, { id: "gateway", at: 9 }]),
    });
    expect(loadrecententries()).toEqual([{ id: "gateway", at: 9 }]);
    delete (globalThis as Record<string, unknown>).window;
    expect(loadrecententries()).toEqual([]);
  });
});

describe("the registry feeds the faces (no fixed data)", () => {
  it("the empty search answers the pinned catalog, the query filters live", () => {
    expect(searchDesktopApps("")).toEqual(PINNED_APPS);
    expect(searchDesktopApps("").length).toBeGreaterThan(0);
    const needle = PINNED_APPS[0]?.name.slice(0, 4).toLowerCase() ?? "";
    expect(searchDesktopApps(needle).length).toBeGreaterThan(0);
  });

  it("every recommended id maps onto the catalog — the rail never renders a ghost", () => {
    const known = new Set(DESKTOP_APPS.map((app) => app.id));
    installStorage();
    pushrecentapp(DESKTOP_APPS[0]?.id ?? "");
    for (const entry of loadrecententries()) expect(known.has(entry.id)).toBe(true);
  });

  it("the alphabet buckets cover the whole catalog under their letter headers", () => {
    const buckets = new Map<string, number>();
    for (const app of DESKTOP_APPS) {
      const code = app.name.trim().toUpperCase().charCodeAt(0);
      const letter = code > 64 && code < 91 ? String.fromCharCode(code) : "#";
      buckets.set(letter, (buckets.get(letter) ?? 0) + 1);
    }
    const total = [...buckets.values()].reduce((sum, count) => sum + count, 0);
    expect(total).toBe(DESKTOP_APPS.length);
    expect(chrome).toContain('const letter = code > 64 && code < 91 ? String.fromCharCode(code) : "#";');
  });
});

describe("the copy discipline (every word rides the store)", () => {
  it("the new faces answer the uistore seed through uicopy — never the bare key", () => {
    for (const key of [
      "shell.widgets.aria",
      "shell.search.aria",
      "shell.start.header.pinned",
      "shell.start.header.allapps",
      "shell.start.header.recommended",
      "shell.start.more",
      "shell.start.back",
      "shell.start.user.fallback",
      "shell.start.power.aria",
      "shell.start.powermenu.aria",
      "shell.start.power.lock",
      "shell.start.power.shutdown",
      "shell.start.power.restart",
      "shell.start.recent.now",
      "shell.start.recent.minutes",
      "shell.start.recent.hours",
      "shell.start.alpha.aria",
    ]) {
      const word = uicopy(key);
      expect(word.length, key).toBeGreaterThan(0);
      expect(word, key).not.toBe(key);
    }
  });

  it("the seed carries the win11 words and the {n} slots of the relative ladder", () => {
    const seed = uistoreseedrows();
    expect(seed["shell.start.header.pinned"]).toBe("Pinned");
    expect(seed["shell.start.header.allapps"]).toBe("All apps");
    expect(seed["shell.start.header.recommended"]).toBe("Recommended");
    expect(seed["shell.start.power.lock"]).toBe("Lock");
    expect(seed["shell.start.power.shutdown"]).toBe("Shut down");
    expect(seed["shell.start.power.restart"]).toBe("Restart");
    expect(seed["shell.start.recent.now"]).toBe("Just now");
    expect(seed["shell.start.recent.minutes"]).toBe("{n}m ago");
    expect(seed["shell.start.recent.hours"]).toBe("{n}h ago");
  });

  it("no literal lives in the chrome for the new faces", () => {
    expect(chrome).not.toContain(">Pinned<");
    expect(chrome).not.toContain(">All apps<");
    expect(chrome).not.toContain(">Recommended<");
    expect(chrome).not.toContain(">Shut down<");
    expect(chrome).not.toContain(">Just now<");
    expect(chrome).not.toContain(">user<");
  });
});
