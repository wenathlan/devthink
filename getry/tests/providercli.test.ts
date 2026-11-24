/**
 * providercli — the provider account console smoke (the ownership move of
 * the gateway ownership wave, step 5): the console family answers from the
 * getry owner now, and this lane pins the load-bearing seams of the move —
 * the help text renders, the accounts path resolver agrees with the
 * accounts owner's own resolution, the opencode model definitions answer
 * from the models owner with the catalog shape, and the twin deletion
 * (getDefaultAccountManager behind the historical getAccountManager name)
 * answers the accounts owner's real manager. No network, no browser.
 */

import { describe, expect, it, vi } from "vitest";
import {
  buildOpenCodeModelDefinitions,
  getAccountManager,
  printHelp,
  providercli,
  resolveAccountsPath,
  runproviderfamily,
} from "../providers.js";
import { getDefaultAccountManager, resolveAccountsPath as accountsResolveAccountsPath } from "../accounts.js";
import { MODELS_2026_CATALOG } from "../models.js";

describe("providercli smoke", () => {
  it("renders the help text", () => {
    const logged: string[] = [];
    const spy = vi.spyOn(console, "log").mockImplementation((...parts: unknown[]) => {
      logged.push(parts.join(" "));
    });
    try {
      printHelp();
    } finally {
      spy.mockRestore();
    }
    const text = logged.join("\n");
    expect(text).toContain("devthink provider CLI (unified merge)");
    expect(text).toContain("Usage:");
    expect(text).toContain("cli.ts <command> [subcommand] [flags]");
  });

  it("resolves the accounts path the accounts owner resolves", () => {
    expect(resolveAccountsPath()).toBe(accountsResolveAccountsPath());
    expect(resolveAccountsPath()).toContain("antigravity-accounts.json");
  });

  it("builds the opencode model definitions with the catalog shape", () => {
    const defs = buildOpenCodeModelDefinitions();
    expect(defs.pluginList).toEqual(["devthink"]);
    for (const entry of MODELS_2026_CATALOG) {
      expect(defs.providerModels[entry.id]).toBeDefined();
      expect(defs.providerModels[entry.id].antigravity.endpoint).toContain("cloudcode-pa.googleapis.com");
      expect(defs.topLevelModels[`antigravity/${entry.id}`]).toBeDefined();
    }
    expect(Object.keys(defs.topLevelModels).length).toBeGreaterThan(MODELS_2026_CATALOG.length);
  });

  it("answers the account manager from the accounts owner (the twin deletion)", () => {
    expect(typeof getAccountManager).toBe("function");
    const mgr = getAccountManager({ disableBackgroundTimer: true });
    // the twin raced the real manager on the same file; the owner answers
    // the real class now — the singleton and the direct call agree
    const direct = getDefaultAccountManager({ disableBackgroundTimer: true });
    expect(mgr).toBe(direct);
    expect(typeof mgr.listAccounts).toBe("function");
    expect(typeof mgr.getValidAccessToken).toBe("function");
  });

  it("exposes the family entry and the providercli compat const", async () => {
    expect(typeof runproviderfamily).toBe("function");
    expect(typeof providercli.runCLI).toBe("function");
    expect(typeof providercli.interactiveMenu).toBe("function");
    // the family entry answers --help without a tty, without network
    const logged: string[] = [];
    const spy = vi.spyOn(console, "log").mockImplementation((...parts: unknown[]) => {
      logged.push(parts.join(" "));
    });
    try {
      await runproviderfamily(["--help"]);
    } finally {
      spy.mockRestore();
    }
    expect(logged.join("\n")).toContain("devthink provider CLI (unified merge)");
  });
});
