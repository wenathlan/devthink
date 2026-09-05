import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";

/* ── The 1.1.95 content security audit policy set. ── */

type manifestshape = {
  content_security_policy?: { extension_pages?: string };
  sandbox?: { pages?: string[] };
  browsers?: Record<string, { content_security_policy?: { extension_pages?: string } }>;
};

describe("the cspaudit policy set", () => {
  it("matches the manifest policies of the root and both browser overlays", async () => {
    const manifest = JSON.parse(await readFile("web/extension/manifest.json", "utf8")) as manifestshape;
    const rootpolicy = manifest.content_security_policy?.extension_pages;
    expect(typeof rootpolicy).toBe("string");
    expect(manifest.browsers?.firefox?.content_security_policy?.extension_pages).toBe(rootpolicy);
    expect(manifest.browsers?.safari?.content_security_policy?.extension_pages).toBe(rootpolicy);
    /* the gate script reads the same three policies the manifest declares */
    const gate = await readFile("tests/cspaudit.mjs", "utf8");
    expect(gate).toContain('manifest.content_security_policy?.extension_pages');
    expect(gate).toContain('browsers?.[browser]?.content_security_policy?.extension_pages');
    for (const browser of ["firefox", "safari"]) expect(gate).toContain(`"${browser}"`);
  });

  it("pins every script, object and frame source of every policy to the local origin", async () => {
    const manifest = JSON.parse(await readFile("web/extension/manifest.json", "utf8")) as manifestshape;
    const policies = [
      manifest.content_security_policy?.extension_pages,
      manifest.browsers?.firefox?.content_security_policy?.extension_pages,
      manifest.browsers?.safari?.content_security_policy?.extension_pages,
    ].filter((policy): policy is string => typeof policy === "string");
    expect(policies).toHaveLength(3);
    for (const policy of policies) {
      const directives = new Map<string, string[]>();
      for (const directive of policy.split(";").map(part => part.trim()).filter(part => part !== "")) {
        const [name, ...sources] = directive.split(/\s+/);
        directives.set(name ?? "", sources);
      }
      expect(directives.get("script-src")).toEqual(["'self'"]);
      expect(directives.get("object-src")).toEqual(["'self'"]);
      expect(directives.get("frame-ancestors")).toEqual(["'self'"]);
      for (const sources of directives.values()) for (const source of sources) {
        expect(source.includes("*")).toBe(false);
        expect(source.startsWith("http:")).toBe(false);
        expect(source.startsWith("https:")).toBe(false);
        expect(source.includes("unsafe-eval")).toBe(false);
        expect(source.includes("unsafe-inline")).toBe(false);
      }
    }
  });

  it("declares the sandbox frame the dashboard renders untrusted extracts inside", async () => {
    const manifest = JSON.parse(await readFile("web/extension/manifest.json", "utf8")) as manifestshape;
    expect(manifest.sandbox?.pages).toContain("sandbox.html");
    const webindex = await readFile("web/extension/index.html", "utf8");
    const sandboxmatch = /<template data-surface="sandbox">([\s\S]*?)<\/template>/.exec(webindex);
    expect(sandboxmatch).not.toBeNull();
    expect(sandboxmatch?.[1]).toContain('setAttribute("sandbox", "")');
    expect(sandboxmatch?.[1]).toContain("devthinksandbox");
    const dashboardmatch = /<template data-surface="dashboardpage">([\s\S]*?)<\/template>/.exec(webindex);
    expect(dashboardmatch).not.toBeNull();
  });

  it("keeps every extension page free of remote resources and inline event handlers", async () => {
    const webindex = await readFile("web/extension/index.html", "utf8");
    for (const reference of [...webindex.matchAll(/(?:src|href)\s*=\s*["']([^"']+)["']/g)].map(match => match[1] ?? "")) {
      if (/^(https?|wss?|data):/i.test(reference) && !reference.startsWith("blob:")) throw new Error(`The web design loads the remote resource ${reference}; every extension page stays local.`);
    }
    expect(/\son[a-z]+\s*=\s*["']/i.test(webindex)).toBe(false);
  });
});
