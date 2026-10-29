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
 * the arrival riding ?next=), and the render honesty (the desktop widgets
 * never mount before the gate answers open, so not one frame of the os
 * leaks to a visitor without a session). the wiring rides source pins on
 * the anchor and the family file because the gate only exists in the
 * browser mount — the same reading discipline the zindex guard carries.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { afterAuthTarget } from "../devthink/gateway";
import { panelgateverdict, resolveintrotarget } from "../devthink/introtarget";

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
    expect(anchor).toContain('import { islocalunlocked, restoreonce } from "../account.ts";');
    expect(anchor).toContain('import { panelgateverdict, resolveintrotarget } from "../introtarget.ts";');
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
    expect(anchor).toContain("const arrival = window.location.pathname + window.location.search;");
    expect(anchor).toContain('setLocation(["/auth?next=", encodeURIComponent(arrival)].join(""));');
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
