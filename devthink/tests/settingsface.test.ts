/**
 * settingsface.test.ts — the settings face contract of the windows 11
 * grammar: the border with border died (the cards answer the borderless
 * surface law — separation by surface and breath, never a hairline inside
 * a hairline), the one rail owns the category routing, and every category
 * speaks the same dtw kit. the drives page that once wore the trylle
 * ring-and-shadow skin — light-ladder cards floating inside the dark
 * settings face — rides the borderless card with the 44px ledger rows,
 * the flat wells and the one accent meter, and every string the page
 * renders lives in the copy store (the drives battery of the labels
 * law). source pins ride the same reading discipline the panelgate,
 * appicons and navbarmodes batteries carry: the settings surface only
 * exists in the browser mount.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { copy, copyseed } from "../copy.ts";

const settingsdir = join(import.meta.dirname, "..", "Sol", "settings");
const wingetsdir = join(import.meta.dirname, "..", "Sol", "wingets");
const anchor = readFileSync(join(settingsdir, "settings.tsx"), "utf8");
const nav = readFileSync(join(wingetsdir, "SettingsNav.tsx"), "utf8");
const drives = readFileSync(join(wingetsdir, "SettingsHarddrives.tsx"), "utf8");
const solcss = readFileSync(join(import.meta.dirname, "..", "Sol", "sol.css"), "utf8");

/** the flat declarations of the settings scope, rule by rule (the naive
 * pair scan is enough for the unlayered linear cascade of sol.css). */
function rulesof(selectorNeedle: string): { selector: string; body: string }[] {
  return [...solcss.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .map((match) => ({ selector: match[1].trim(), body: match[2] }))
    .filter((rule) => rule.selector.includes(selectorNeedle));
}

describe("the borderless card law (the border with border dies)", () => {
  it("the settings cards carry no outline — separation by surface and breath", () => {
    const cardrules = rulesof(".dtw-settings").filter((rule) => /\.dtw-card\b/.test(rule.selector));
    expect(cardrules.length).toBeGreaterThan(0);
    for (const rule of cardrules) {
      const borders = [...rule.body.matchAll(/border[^:]*:\s*([^;]+);/g)].map((match) => match[1].trim());
      for (const border of borders) expect(border).toBe("0");
    }
  });

  it("the ledger rows separate by breath — no hairline dividers inside the cards", () => {
    const rowrules = rulesof(".dtw-settings").filter((rule) => /\.dtw-row\b/.test(rule.selector));
    expect(rowrules.length).toBeGreaterThan(0);
    for (const rule of rowrules) {
      const bottoms = [...rule.body.matchAll(/border-bottom:\s*([^;]+);/g)].map((match) => match[1].trim());
      for (const bottom of bottoms) expect(bottom).toBe("0");
    }
  });

  it("the kv ledger rows ride the same breath law (their dividers retired)", () => {
    const kvrules = rulesof(".dtw-settings__kv");
    expect(kvrules.length).toBeGreaterThan(0);
    for (const rule of kvrules) expect(rule.body).not.toContain("border-bottom");
  });

  it("the settings face keeps exactly one card material — the dark face deepens the same token shadow", () => {
    expect(solcss).toContain('.dtw-settings[data-theme="dark"] .dtw-card');
  });
});

describe("the drives page speaks the dtw kit (the trylle skin dies)", () => {
  it("carries zero fingerprints of the ring-and-shadow skin the panel once wore", () => {
    for (const fingerprint of [
      "ring-1",
      "ring-hairline",
      "bg-s0",
      "bg-s1",
      "bg-s2",
      "rounded-2xl",
      "STRIP_SHADOW",
      "BUTTON_QUIET",
      "BUTTON_PRIMARY",
      "text-ink",
      "font-mono",
      "font-display",
      "boxShadow",
    ])
      expect(drives).not.toContain(fingerprint);
  });

  it("rides the borderless card, the card title and the 44px ledger grammar", () => {
    expect(drives).toContain('className="dtw-card"');
    expect(drives).toContain('className="dtw-cardtitle"');
    expect(drives).toContain('className="dtw-rows"');
    expect(drives).toContain('className="dtw-row"');
    expect(drives).toContain('className="dtw-btn dtw-btn--primary"');
    expect(drives).toContain('className="dtw-settings__input"');
  });

  it("consumes the disk glyph grammar of the drives shelf (the mounted ink law)", () => {
    expect(drives).toContain('className="dtw-settings__driveicon"');
    expect(drives).toContain('data-mounted={mounted ? "true" : undefined}');
    expect(solcss).toContain('.dtw-settings__driveicon[data-mounted="true"]');
  });

  it("answers the windows storage meter — the well track with the one accent fill", () => {
    expect(drives).toContain('className="dtw-settings__meter"');
    expect(drives).toContain('role="progressbar"');
    expect(drives).toContain('className="dtw-settings__meterfill"');
    expect(solcss).toContain(".dtw-settings__meter {");
    expect(solcss).toContain("background: var(--dtw-well);");
    expect(solcss).toContain(".dtw-settings__meterfill {");
    expect(solcss).toContain("background: var(--color-win);");
  });

  it("keeps the honest data machine the storage family landed (mount, create, estimate)", () => {
    for (const seam of ["opendrive", "newdrive", "drives()", "browserStoreSummary", "navigator.storage", "estimate()"])
      expect(drives).toContain(seam);
    expect(drives).toContain("window.location.reload()");
    expect(drives).toContain('navigate("/panel")');
    expect(drives).toContain("export { DRIVES_KEY };");
  });
});

describe("the drives page answers the labels law (every string rides the copy store)", () => {
  it("carries zero of the hardcoded literals the trylle panel rendered", () => {
    for (const literal of [
      "Drives on this machine",
      "Connect a storage platform",
      "the external drives · opt in",
      "Reading the drives",
      "capacity answers after mount",
      "New drive mounted:",
      "Open the drive ${",
      "Name the new drive",
    ])
      expect(drives).not.toContain(literal);
  });

  it("renders through the copy accessor with the slot grammar", () => {
    expect(drives).toContain('copy("settings.drives.local")');
    expect(drives).toContain('copy("settings.drives.external")');
    expect(drives).toContain('fill("settings.drives.created"');
    expect(drives).toContain('fill("settings.drives.open.aria"');
    expect(drives).toContain('fill("settings.drives.capacity"');
    expect(drives).toContain('fill("settings.drives.records"');
    expect(drives).toContain('fill("settings.drives.new.done"');
    expect(drives).toContain('fill("settings.drives.connect.aria"');
  });

  it("the seed answers every drives row (the offline build law)", () => {
    const seed = copyseed();
    const keys = [
      "settings.drives.local",
      "settings.drives.local.desc",
      "settings.drives.local.aria",
      "settings.drives.pending",
      "settings.drives.mounted",
      "settings.drives.unmounted",
      "settings.drives.created",
      "settings.drives.open",
      "settings.drives.open.aria",
      "settings.drives.meter.aria",
      "settings.drives.capacity",
      "settings.drives.capacity.none",
      "settings.drives.records",
      "settings.drives.new",
      "settings.drives.new.aria",
      "settings.drives.new.ph",
      "settings.drives.new.note",
      "settings.drives.new.done",
      "settings.drives.mount.fail",
      "settings.drives.new.fail",
      "settings.drives.external",
      "settings.drives.external.desc",
      "settings.drives.external.aria",
      "settings.drives.status.off",
      "settings.drives.connect",
      "settings.drives.connect.aria",
      "settings.drives.remove",
      "settings.drives.remove.aria",
      "settings.drives.pair",
      "settings.drives.cancel",
      "settings.drives.pair.label",
      "settings.drives.pair.label.ph",
      "settings.drives.pair.endpoint",
      "settings.drives.pair.key",
      "settings.drives.pair.note",
      "settings.drives.platform.gdrive",
      "settings.drives.platform.dropbox",
      "settings.drives.platform.onedrive",
      "settings.drives.platform.box",
      "settings.drives.platform.s3",
      "settings.drives.platform.host",
    ];
    for (const key of keys) {
      expect(seed[key], `the seed row ${key} carries text`).toBeTruthy();
      expect(copy(key)).not.toBe(key);
    }
  });

  it("the capacity and records rows keep their slots loud", () => {
    expect(copy("settings.drives.capacity")).toContain("{usage}");
    expect(copy("settings.drives.capacity")).toContain("{quota}");
    expect(copy("settings.drives.records")).toContain("{workspaces}");
    expect(copy("settings.drives.created")).toContain("{date}");
    expect(copy("settings.drives.open.aria")).toContain("{label}");
    expect(copy("settings.drives.connect.aria")).toContain("{name}");
  });
});

describe("the one rail owns the categories (the windows 11 settings look)", () => {
  it("the anchor mounts the rail once and routes the six categories", () => {
    expect(anchor).toContain("<SettingsNav ");
    for (const category of ["personalization", "accounts", "gateway", "drives", "automation", "about"]) {
      expect(anchor).toContain(`category === "${category}"`);
    }
    // the page title rides the same nav row the rail renders
    expect(anchor).toContain("copy(`settings.nav.${category}`)");
  });

  it("the rail lists the same six categories with the fluent glyphs", () => {
    for (const category of ["personalization", "accounts", "gateway", "drives", "automation", "about"])
      expect(nav).toContain(`id: "${category}"`);
    expect(nav).toContain("aria-label=");
    expect(nav).toContain("data-active={selected ?");
  });

  it("the folder law holds — the settings page stays flat, the wingets stay loose", () => {
    const entries = readdirSync(settingsdir);
    expect(entries).toContain("settings.tsx");
    for (const entry of entries) {
      const stats = statSync(join(settingsdir, entry));
      expect(stats.isFile(), `${entry} stays a flat file of the settings folder`).toBe(true);
    }
  });
});
