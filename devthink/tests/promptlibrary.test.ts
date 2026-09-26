import { describe, expect, it } from "vitest";
import {
  latesttemplate,
  rendertemplate,
  removetemplate,
  savetemplate,
  searchtemplates,
  templatevariables,
} from "../llm.js";
import type { prompttemplate } from "../types.js";

const now = 1_800_000_000_000;

describe("promptlibrary", () => {
  it("extracts the template variables of the double braced placeholders", () => {
    expect(templatevariables("Summarize {{url}} in {{tone}} tone about {{url}}.")).toEqual(["url", "tone"]);
    expect(templatevariables("no placeholders here")).toEqual([]);
  });

  it("renders a template with its variables substituted", () => {
    const template: prompttemplate = {
      id: "t1",
      name: "pagesummary",
      body: "Summarize {{url}} in a {{tone}} tone.",
      variables: ["url", "tone"],
      version: 1,
      createdat: now,
    };
    const rendered = rendertemplate({ template, variables: { url: "https://example.com", tone: "plain" } });
    expect(rendered.text).toBe("Summarize https://example.com in a plain tone.");
  });

  it("refuses the render when a declared variable stays empty", () => {
    const template: prompttemplate = {
      id: "t1",
      name: "pagesummary",
      body: "Summarize {{url}}.",
      variables: ["url"],
      version: 1,
      createdat: now,
    };
    expect(rendertemplate({ template, variables: {} }).reason).toMatch(/stay empty/i);
  });

  it("requires the consent notice of a sensitive flow and rides it in the render", () => {
    const template: prompttemplate = {
      id: "t1",
      name: "extract",
      body: "Extract {{fields}} from the page.",
      variables: ["fields"],
      version: 1,
      createdat: now,
    };
    expect(rendertemplate({ template, variables: { fields: "names" }, sensitive: true }).reason).toMatch(
      /consent notice/i,
    );
    const rendered = rendertemplate({
      template,
      variables: { fields: "names" },
      sensitive: true,
      consentnotice: "The extraction leaves the browser only with the granted fields.",
    });
    expect(rendered.text).toContain("Consent notice: The extraction leaves the browser only with the granted fields.");
  });

  it("stores template versions with change notes and keeps the history", () => {
    const first = savetemplate({
      templates: [],
      name: "pagesummary",
      body: "Summarize {{url}}.",
      notes: "first version",
      now,
    });
    expect(first[0]?.version).toBe(1);
    const second = savetemplate({
      templates: first,
      name: "pagesummary",
      body: "Summarize {{url}} in {{tone}}.",
      notes: "adds the tone",
      now: now + 1000,
    });
    expect(second[0]?.version).toBe(2);
    expect(second[1]?.version).toBe(1);
    expect(second[0]?.variables).toEqual(["url", "tone"]);
    expect(latesttemplate(second, "pagesummary")?.notes).toBe("adds the tone");
    expect(latesttemplate(second, "unknown")).toBeUndefined();
  });

  it("searches the library by name, body, notes and variables", () => {
    const templates = [
      { id: "t1", name: "pagesummary", body: "Summarize {{url}}.", variables: ["url"], version: 1, createdat: now },
      {
        id: "t2",
        name: "extract",
        body: "Extract {{fields}}.",
        variables: ["fields"],
        version: 3,
        notes: "the field extractor",
        createdat: now + 1,
      },
    ];
    expect(searchtemplates(templates, "summar").map((template) => template.name)).toEqual(["pagesummary"]);
    expect(searchtemplates(templates, "field").map((template) => template.name)).toEqual(["extract"]);
    expect(searchtemplates(templates, "")).toHaveLength(2);
  });

  it("removes every version of one template name", () => {
    const stored = savetemplate({
      templates: savetemplate({ templates: [], name: "pagesummary", body: "v1", now }),
      name: "pagesummary",
      body: "v2",
      now: now + 1,
    });
    expect(removetemplate(stored, "pagesummary")).toEqual([]);
  });
});
