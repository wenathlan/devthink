/**
 * panelgate.test.ts — the panel auth gate contract of the entry chain.
 *
 * the owner law: the panel is the LAST page — intro → auth → panel, never
 * a shortcut that drops a visitor on the desktop without a sign in. this
 * file pins the three layers of that law: the pure verdict (the decision
 * function answers open for a present session and locked for an absent
 * one), the anchor wiring (the panel mount asks the same session source
 * the auth face rides — restoreonce plus the declared offline unlock
 * marker of the account family — and walks the chain back to /auth with
 * the arrival riding ?next=), and the render honesty (the desktop wingets
 * never mount before the gate answers open, so not one frame of the os
 * leaks to a visitor without a session). the wiring rides source pins on
 * the anchor and the family file because the gate only exists in the
 * browser mount — the same reading discipline the zindex guard carries.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { afterAuthTarget } from "../gateway";
import { panelgateverdict, resolveintrotarget } from "../introtarget";
import { uistoreseedrows } from "../uistore.ts";
import { osText } from "../oslabels.ts";

const anchor = readFileSync(join(import.meta.dirname, "..", "Sol", "panel", "panel.tsx"), "utf8");
const family = readFileSync(join(import.meta.dirname, "..", "account.ts"), "utf8");
const labels = readFileSync(join(import.meta.dirname, "..", "copy.ts"), "utf8");

const session = { owner: "nathlan", createdAt: "2026-10-27T00:00:00.000Z", expiresAt: 1_800_000_000_000 };

describe("the gate decision (the pure verdict of the panel)", () => {
  it("answers locked when the session is absent and no offline door is parked", () => {
    expect(panelgateverdict("web", null, false)).toBe("locked");
    expect(panelgateverdict("web", undefined, false)).toBe("locked");
    expect(panelgateverdict("web", null, undefined as unknown as boolean)).toBe("locked");
  });

  it("answers open when the family session is present (the pass of the real door)", () => {
    expect(panelgateverdict("web", session, false)).toBe("open");
  });

  it("answers open when the declared offline unlock marker is parked (the fallback door)", () => {
    expect(panelgateverdict("web", null, true)).toBe("open");
  });

  it("opens the owned targets straight (the boot IS their intro)", () => {
    for (const target of ["desktop", "installer", "android", "extension"] as const) {
      expect(panelgateverdict(target, null, false)).toBe("open");
    }
  });

  it("keeps the gate armed for every build it does not know (the web default)", () => {
    expect(resolveintrotarget(undefined)).toBe("web");
    expect(panelgateverdict(resolveintrotarget(undefined), null, false)).toBe("locked");
    expect(panelgateverdict(resolveintrotarget("unknown"), session, false)).toBe("open");
  });
});

describe("the panel anchor asks the family session", () => {
  it("rides the same session source the auth face rides (restoreonce plus the offline marker)", () => {
    expect(anchor).toContain('import { islocalunlocked, restoreonce } from "../../account.ts";');
    expect(anchor).toContain('import { panelgateverdict, resolveintrotarget } from "../../introtarget.ts";');
  });

  it("carries the three poses of the gate and starts pending on the web target", () => {
    expect(anchor).toContain('useState<"pending" | "open" | "locked">');
    expect(anchor).toContain('=== "web" ? "pending" : "open"');
  });

  it("asks the session once per mount and hands the answer to the verdict with the offline marker", () => {
    expect(anchor).toContain("void restoreonce()");
    expect(anchor).toContain("panelgateverdict(");
    expect(anchor).toContain("islocalunlocked(),");
  });

  it("walks the locked chain back to the auth face with the arrival riding next", () => {
    expect(anchor).toContain("const arrival = routeFromPathname(window.location.pathname) + window.location.search;");
    expect(anchor).toContain('const target = ["/auth?next=", encodeURIComponent(arrival)].join("");');
    expect(anchor).toContain("if (gatedecision === target) return;");
    expect(anchor).toContain("setLocation(target);");
    expect(anchor).toContain('import { historypath, routeFromPathname, safegatewayurl } from "../../gateway.ts";');
  });

  it("captures the arrival when the gate starts and decides once per run (the twin of the exit pass never rewrites the redirect)", () => {
    // the arrival is read before the session question, never after: the
    // transition stage parks a twin of the tree for its exit pass and the
    // twin's callback would otherwise store the redirect the first twin
    // already wrote
    const effect = anchor.indexOf('if (gate !== "pending") return;');
    const arrival = anchor.indexOf("const arrival = routeFromPathname(window.location.pathname)");
    const question = anchor.indexOf("void restoreonce()");
    expect(effect).toBeGreaterThan(-1);
    expect(arrival).toBeGreaterThan(effect);
    expect(arrival).toBeLessThan(question);
    // one decision per gate run: every fresh run clears, a twin of the
    // same run never writes the same redirect twice
    expect(anchor).toContain("gatedecision = null;");
    expect(anchor).toContain("gatedecision = target;");
  });

  it("locks honestly when the session question itself fails (never a desktop on an unasked question)", () => {
    expect(anchor).toContain('setLocation("/auth");');
  });

  it("consumes the arrival the gate stamps (the return trip the auth face answers)", () => {
    expect(afterAuthTarget(`?next=${encodeURIComponent("/panel")}`)).toBe("/panel");
    expect(afterAuthTarget(`?next=${encodeURIComponent("/w/abc123/s/def456/t/tab789/chat")}`)).toBe(
      "/w/abc123/s/def456/t/tab789/chat",
    );
  });
});

describe("the desktop never renders uninvited", () => {
  it("returns the honest wait face before any desktop widget while the gate is not open", () => {
    const guard = anchor.indexOf('if (gate !== "open")');
    const boot = anchor.indexOf("<BootScreen");
    const shell = anchor.indexOf("<ShellWorkspace");
    expect(guard).toBeGreaterThan(-1);
    expect(boot).toBeGreaterThan(-1);
    expect(shell).toBeGreaterThan(-1);
    expect(guard).toBeLessThan(boot);
    expect(guard).toBeLessThan(shell);
    expect(anchor.slice(guard, boot)).toContain('className="dtw-gate"');
    expect(anchor.slice(guard, boot)).toContain('role="status"');
  });

  it("carries the gate label in the copy store (no hardcoded text on the gate face)", () => {
    expect(anchor).toContain('copy("panel.gate.label")');
    expect(labels).toContain('"panel.gate.label"');
  });
});

describe("the session source of the gate (the account family contract)", () => {
  it("parks the family session and the offline marker under the doctrine keys", () => {
    expect(family).toContain('export const ACCOUNT_TOKEN_KEY = "devthink.account.token";');
    expect(family).toContain('export const ACCOUNT_OWNER_KEY = "devthink.account.owner";');
    expect(family).toContain('const ACCOUNT_LOCAL_UNLOCK_KEY = "devthink.account.local";');
  });

  it("exposes the one restore the gate rides and the offline door pair", () => {
    expect(family).toContain("export function restoreonce(): Promise<AccountSessionState | null> {");
    expect(family).toContain("export function parklocalunlock(): void {");
    expect(family).toContain("export function islocalunlocked(): boolean {");
  });

  it("retires the shared restore answer with every parked and dropped session (the stale cache law)", () => {
    const save = family.slice(
      family.indexOf("export function saveaccountsession"),
      family.indexOf("export function clearaccountsession"),
    );
    const clear = family.slice(
      family.indexOf("export function clearaccountsession"),
      family.indexOf("export function accountbearer"),
    );
    expect(save).toContain("restorepromise = null;");
    expect(clear).toContain("restorepromise = null;");
  });
});

describe("the panel face wave (the texture, the boot copy and the tile lift)", () => {
  const shellchrome = readFileSync(join(import.meta.dirname, "..", "Sol", "wingets", "Shellchrome.tsx"), "utf8");
  const panelboot = readFileSync(join(import.meta.dirname, "..", "Sol", "wingets", "PanelBoot.tsx"), "utf8");
  const solcss = readFileSync(join(import.meta.dirname, "..", "Sol", "sol.css"), "utf8");

  /** the appended wave block of the panel face (the cascade-order tail of
   * sol.css — the reading scopes to it so the earlier sections stay out) */
  const wave = solcss.slice(solcss.indexOf("campaign wave 4 · panel face"));
  expect(wave.length).toBeGreaterThan(0);

  /** extracts the first rule body of one selector inside the wave slice */
  function waveRule(selector: string): string {
    const at = wave.indexOf(selector);
    expect(at, `the selector ${selector} lives in the wave block`).toBeGreaterThan(-1);
    const open = wave.indexOf("{", at);
    const close = wave.indexOf("}", open);
    return wave.slice(open + 1, close);
  }

  it("the boot words ride the os table rows — no literal stays on the boot face", () => {
    /* the win11-fidelity wave B migrated the boot face words from the ui
     * store copy to the os label table (oslabels.ts — the os table law the
     * desktop face answers); the uistore rows stay seeded for the surfaces
     * that still read them, the boot face never quotes them again. */
    expect(panelboot).toContain('osText("boot.aria")');
    expect(panelboot).toContain('osText("boot.wordmark")');
    expect(panelboot).toContain('osText("boot.state")');
    expect(panelboot).not.toContain('"DevThink is starting"');
    expect(panelboot).not.toContain('"opening the local os"');
    expect(osText("boot.aria")).toBe("DevThink is starting");
    expect(osText("boot.wordmark")).toBe("DevThink");
    expect(osText("boot.state")).toBe("opening the local os");
    const seed = uistoreseedrows();
    expect(seed["panel.boot.aria"]).toBe("DevThink is starting");
    expect(seed["panel.boot.name"]).toBe("DevThink");
    expect(seed["panel.boot.state"]).toBe("opening the local os");
  });

  it("the desktop carries the doctrine texture — the noise tile rides the --win-noise token", () => {
    const texture = waveRule(".shell-os__atmosphere::after");
    expect(texture).toContain("content:");
    expect(texture).toContain("background-image: var(--win-noise)");
    expect(texture).not.toMatch(/url\(/);
  });

  it("the desktop floor sinks under the taskbar — the vignette composes off the mask ink token", () => {
    const vignette = waveRule(".shell-os__atmosphere::before");
    expect(vignette).toContain("box-shadow:");
    expect(vignette).toContain("color-mix(in oklab, var(--color-mask-ink)");
    expect(vignette).not.toMatch(/#[0-9a-f]{3,8}\b/i);
  });

  it("the texture respects the reduced transparency guard", () => {
    const guardAt = wave.indexOf("@media (prefers-reduced-transparency: reduce)");
    expect(guardAt).toBeGreaterThan(wave.indexOf(".shell-os__atmosphere::before"));
    expect(wave.slice(guardAt, guardAt + 220)).toContain(".shell-os__atmosphere::after");
  });

  it("the gate reading bar carries the shimmer sweep with the reduced-motion guard", () => {
    const shimmer = waveRule(".dtw-gate__bar::before");
    expect(shimmer).toContain("animation: dtwgateshimmer");
    expect(shimmer).toContain("background-size");
    expect(wave).toContain("@keyframes dtwgateshimmer");
    const motionAt = wave.indexOf("@media (prefers-reduced-motion: reduce)");
    expect(motionAt).toBeGreaterThan(wave.indexOf("@keyframes dtwgateshimmer"));
    expect(wave.slice(motionAt, motionAt + 200)).toContain(".dtw-gate__bar::before");
  });

  it("the light gate rides the doctrine mica token (no fixed paint on the flip)", () => {
    const lightRule = waveRule('[data-theme="light"] .dtw-gate');
    expect(lightRule).toContain("background: var(--mica);");
  });

  it("the start tiles answer with the doctrine lift — translateY up and a growing shadow in 150ms", () => {
    expect(shellchrome).toContain("hover:-translate-y-px");
    expect(shellchrome).toContain("hover:[&_.dt-tile]:shadow-");
    expect(shellchrome).toContain("transition-[background-color,transform] duration-150 ease-micro");
    // the lift never plays under the reduced-motion preference
    expect(shellchrome).toContain("motion-reduce:transition-none");
    expect(shellchrome).toContain("motion-reduce:hover:translate-y-0");
  });
});
