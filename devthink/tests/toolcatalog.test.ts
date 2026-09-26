import { describe, expect, it } from "vitest";
import {
  alltools,
  buildtoolcatalog,
  domainkinds,
  namespaceof,
  resolvetool,
  toolcatalogversion,
  toolname,
  toolsbynamespace,
  toolschemaof,
  toolnamespaces,
} from "../tools.js";
import { actionrisk, toolconsentrequired, toolnamespacegate, toolriskgrade, validatetoolcatalog } from "../policy.js";
import type { tooldomain, tooldef } from "../types.js";

/** Builds one catalog tool copy with patched fields for negative validation cases. */
function patchedtool(tool: tooldef, patch: Partial<tooldef>): tooldef {
  return { ...tool, ...patch };
}

describe("mcp tool catalog", () => {
  it("serves the four namespaces with namespaced, versioned and grouped tools", () => {
    const catalog = buildtoolcatalog();
    expect(catalog.version).toBe(toolcatalogversion);
    expect(catalog.domains.map((domain) => domain.namespace)).toEqual(["browser", "workflow", "memory", "system"]);
    expect(toolnamespaces).toEqual(["browser", "workflow", "memory", "system"]);
    const tools = alltools(catalog);
    expect(tools.length).toBeGreaterThan(20);
    for (const tool of tools) {
      expect(tool.name.includes(".")).toBe(true);
      expect(tool.version).toBe(toolcatalogversion);
      expect(namespaceof(tool.name)).toBe(tool.name.split(".")[0]);
      expect(domainkinds[tool.name.split(".")[0] as keyof typeof domainkinds]).toContain(tool.kind);
    }
    expect(toolsbynamespace(catalog).map((group) => group.namespace)).toEqual([
      "browser",
      "workflow",
      "memory",
      "system",
    ]);
    expect(toolname("browser", "click")).toBe("browser.click");
  });

  it("exposes the snapshot, interaction, navigation, tab, window, extraction, workflow, memory and system tools", () => {
    const names = alltools(buildtoolcatalog()).map((tool) => tool.name);
    expect(names).toContain("browser.snapshot");
    expect(names).toContain("browser.click");
    expect(names).toContain("browser.type");
    expect(names).toContain("browser.presskey");
    expect(names).toContain("browser.navigate");
    expect(names).toContain("browser.back");
    expect(names).toContain("browser.forward");
    expect(names).toContain("browser.reload");
    expect(names).toContain("browser.tabcreate");
    expect(names).toContain("browser.tabactivate");
    expect(names).toContain("browser.tabclose");
    expect(names).toContain("browser.windowcreate");
    expect(names).toContain("browser.windowclose");
    expect(names).toContain("browser.windowresize");
    for (const read of [
      "browser.extract",
      "browser.readtext",
      "browser.readtable",
      "browser.readlinks",
      "browser.a11ytree",
      "browser.tablist",
      "browser.windowlist",
    ])
      expect(names).toContain(read);
    for (const workflow of ["workflow.list", "workflow.run", "workflow.dryrun", "workflow.triggers"])
      expect(names).toContain(workflow);
    for (const memory of ["memory.list", "memory.variables", "memory.audit"]) expect(names).toContain(memory);
    for (const system of ["system.status", "system.version", "system.capabilities"]) expect(names).toContain(system);
  });

  it("emits one typed json schema for every tool with required markers and default values", () => {
    const catalog = buildtoolcatalog();
    for (const tool of alltools(catalog)) {
      expect(tool.inputschema.type).toBe("object");
      const properties = Object.entries(tool.inputschema.properties);
      expect(properties.length).toBeGreaterThan(0);
      for (const [name, property] of properties) {
        expect(["string", "number", "boolean", "object", "array"]).toContain(property.type);
        expect(property.description.trim().length).toBeGreaterThan(0);
      }
      for (const required of tool.inputschema.required) expect(tool.inputschema.properties[required]).toBeDefined();
      if (tool.risk === "read") {
        expect(tool.inputschema.properties.options?.default).toEqual({});
        expect(tool.inputschema.required).not.toContain("stepid");
      } else {
        expect(tool.inputschema.required).toEqual(["stepid"]);
      }
    }
    const schema = toolschemaof({
      target: { type: "string", description: "Selector.", required: true },
      value: { type: "string", description: "Value." },
    });
    expect(schema.required).toEqual(["target"]);
  });

  it("states the consent class and side effects in plain language and declares consentmeta on tools with side effects", () => {
    for (const tool of alltools(buildtoolcatalog())) {
      expect(tool.description.length).toBeGreaterThan(40);
      expect(tool.description).toMatch(/read only|sensitive|changes|consent|review|no side effects/i);
      expect(toolconsentrequired(tool).allowed).toBe(true);
      if (tool.risk !== "read") expect(tool.consentmeta?.review.length ?? 0).toBeGreaterThan(10);
      else expect(tool.consentmeta).toBeUndefined();
    }
  });

  it("resolves colliding base names through the namespace prefix", () => {
    const catalog = buildtoolcatalog();
    expect(resolvetool(catalog, "workflow.list")?.kind).toBe("composeworkflow");
    expect(resolvetool(catalog, "memory.list")?.kind).toBe("listruns");
    expect(resolvetool(catalog, "list")).toBeUndefined();
    expect(resolvetool(catalog, "browser.click")?.kind).toBe("click");
    expect(resolvetool(catalog, "nope.click")).toBeUndefined();
    expect(namespaceof("workflow.run")).toBe("workflow");
    expect(namespaceof("click")).toBeUndefined();
  });

  it("validates the catalog against the action kind grammar and refuses drifted tools", () => {
    const catalog = buildtoolcatalog();
    expect(validatetoolcatalog(catalog).allowed).toBe(true);
    const browser = catalog.domains[0] as tooldomain;
    expect(validatetoolcatalog({ version: 1, domains: [] }).allowed).toBe(false);
    expect(validatetoolcatalog({ version: 1, domains: [{ ...browser, tools: [] }] }).allowed).toBe(false);
    const unnamespaced = validatetoolcatalog({
      version: 1,
      domains: [{ ...browser, tools: [patchedtool(browser.tools[0] as tooldef, { name: "click" })] }],
    });
    expect(unnamespaced.allowed).toBe(false);
    const duplicated = validatetoolcatalog({
      version: 1,
      domains: [
        {
          ...browser,
          tools: [
            browser.tools[0] as tooldef,
            patchedtool(browser.tools[1] as tooldef, { name: (browser.tools[0] as tooldef).name }),
          ],
        },
      ],
    });
    expect(duplicated.allowed).toBe(false);
    const outofdomain = validatetoolcatalog({
      version: 1,
      domains: [{ ...browser, tools: [patchedtool(browser.tools[0] as tooldef, { kind: "composeworkflow" })] }],
    });
    expect(outofdomain.allowed).toBe(false);
    const undocumentedschema = validatetoolcatalog({
      version: 1,
      domains: [
        {
          ...browser,
          tools: [
            patchedtool(browser.tools[0] as tooldef, {
              inputschema: {
                type: "object",
                properties: { target: { type: "selector" as never, description: "x" } },
                required: [],
              },
            }),
          ],
        },
      ],
    });
    expect(undocumentedschema.allowed).toBe(false);
    const missingrequired = validatetoolcatalog({
      version: 1,
      domains: [
        {
          ...browser,
          tools: [
            patchedtool(browser.tools[0] as tooldef, {
              inputschema: {
                type: "object",
                properties: { target: { type: "string", description: "Selector." } },
                required: ["value"],
              },
            }),
          ],
        },
      ],
    });
    expect(missingrequired.allowed).toBe(false);
  });

  it("grades every tooldef with the risk class of its action kind and keeps the namespace membership", () => {
    for (const tool of alltools(buildtoolcatalog())) {
      expect(toolriskgrade(tool).allowed).toBe(true);
      expect(toolnamespacegate(tool).allowed).toBe(true);
      expect(actionrisk(tool.kind)).toBe(tool.risk);
    }
    const click = alltools(buildtoolcatalog()).find((tool) => tool.name === "browser.click") as tooldef;
    expect(toolriskgrade(patchedtool(click, { risk: "read" })).allowed).toBe(false);
    expect(toolnamespacegate(patchedtool(click, { name: "memory.click" })).allowed).toBe(false);
    expect(toolnamespacegate(patchedtool(click, { name: "click" })).allowed).toBe(false);
  });
});
