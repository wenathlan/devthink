import { describe, expect, it } from "vitest";
import {
  capturesurfaceof,
  fieldshaperegions,
  mergeregions,
  redactedshot,
  redactionsummary,
  regionof,
  regionvalid,
  regionsfor,
  templateof,
} from "../capture.js";

const now = 1_800_000_000_000;

describe("redactshots", () => {
  it("builds regions with finite positive geometry and a plain language reason", () => {
    const region = regionof({
      origin: "https://bank.example",
      template: "login",
      x: 10,
      y: 20,
      width: 200,
      height: 40,
      reason: "The card number field the user masked.",
      source: "userdrawn",
      now,
    });
    expect(region.id).not.toBe("");
    expect(region.x).toBe(10);
    expect(region.source).toBe("userdrawn");
    expect(regionvalid(region)).toBe(true);
    expect(() =>
      regionof({
        origin: "https://bank.example",
        template: "login",
        x: -1,
        y: 0,
        width: 10,
        height: 10,
        reason: "r",
        source: "userdrawn",
        now,
      }),
    ).toThrow(/non-negative/);
    expect(() =>
      regionof({
        origin: "https://bank.example",
        template: "login",
        x: 0,
        y: 0,
        width: 0,
        height: 10,
        reason: "r",
        source: "userdrawn",
        now,
      }),
    ).toThrow(/positive width/);
    expect(() =>
      regionof({
        origin: "",
        template: "login",
        x: 0,
        y: 0,
        width: 10,
        height: 10,
        reason: "r",
        source: "userdrawn",
        now,
      }),
    ).toThrow(/origin/);
    expect(() =>
      regionof({
        origin: "https://bank.example",
        template: "login",
        x: 0,
        y: 0,
        width: 10,
        height: 10,
        reason: "  ",
        source: "userdrawn",
        now,
      }),
    ).toThrow(/reason/);
  });

  it("derives regions from the sensitive field shapes of a form layout", () => {
    const regions = fieldshaperegions({
      origin: "https://bank.example",
      template: "login",
      fields: [
        { name: "username", rect: { x: 0, y: 0, width: 100, height: 20 } },
        { name: "password", rect: { x: 0, y: 30, width: 100, height: 20 } },
        { name: "cardnumber", rect: { x: 0, y: 60, width: 100, height: 20 } },
      ],
      now,
    });
    expect(regions).toHaveLength(2);
    expect(regions.every((region) => region.source === "fieldshape")).toBe(true);
    expect(regions[0]?.reason).toMatch(/password field carries a sensitive field shape/);
  });

  it("scopes the regions of one origin and one page template only", () => {
    const region = regionof({
      origin: "https://bank.example",
      template: "login",
      x: 0,
      y: 0,
      width: 10,
      height: 10,
      reason: "masked",
      source: "userdrawn",
      now,
    });
    expect(regionsfor([region], "https://bank.example", "login")).toHaveLength(1);
    expect(regionsfor([region], "https://bank.example", "checkout")).toHaveLength(0);
    expect(regionsfor([region], "https://other.example", "login")).toHaveLength(0);
  });

  it("merges drawn regions while keeping one record per geometry", () => {
    const one = regionof({
      origin: "https://bank.example",
      template: "login",
      x: 0,
      y: 0,
      width: 10,
      height: 10,
      reason: "first",
      source: "userdrawn",
      now,
    });
    const same = regionof({
      origin: "https://bank.example",
      template: "login",
      x: 0,
      y: 0,
      width: 10,
      height: 10,
      reason: "duplicate",
      source: "userdrawn",
      now,
    });
    const other = regionof({
      origin: "https://bank.example",
      template: "login",
      x: 50,
      y: 50,
      width: 10,
      height: 10,
      reason: "second",
      source: "userdrawn",
      now,
    });
    expect(mergeregions([one], [same, other])).toHaveLength(2);
  });

  it("covers viewport, element and stitched captures alike", () => {
    expect(capturesurfaceof("shotview")).toBe("viewport");
    expect(capturesurfaceof("element")).toBe("element");
    expect(capturesurfaceof("shotfullpage")).toBe("stitched");
    expect(capturesurfaceof("contactsheet")).toBe("stitched");
    expect(capturesurfaceof("recordscreen")).toBe("stitched");
  });

  it("reads the template of a capture step from its reviewed options", () => {
    expect(templateof({ kind: "shotview", options: JSON.stringify({ template: "checkout" }) })).toBe("checkout");
    expect(templateof({ kind: "shotview" })).toBe("shotview");
    expect(templateof({ kind: "shotview", options: "not json" })).toBe("shotview");
  });

  it("marks stored captures with their redaction evidence before storage", () => {
    const record = { id: "shot", kind: "shotview", bytes: "data:image/png;base64,AAA" };
    expect(redactedshot(record, [])).toEqual(record);
    const masked = redactedshot(record, [
      regionof({
        origin: "https://bank.example",
        template: "login",
        x: 0,
        y: 0,
        width: 10,
        height: 10,
        reason: "masked",
        source: "userdrawn",
        now,
      }),
    ]);
    expect(masked.redacted).toBe(true);
    expect(masked.redactedregions).toBe(1);
  });

  it("summarises the redaction evidence for the audit trail", () => {
    const regions = [
      regionof({
        origin: "https://bank.example",
        template: "login",
        x: 0,
        y: 0,
        width: 10,
        height: 10,
        reason: "the card field",
        source: "userdrawn",
        now,
      }),
      ...fieldshaperegions({
        origin: "https://bank.example",
        template: "login",
        fields: [{ name: "password", rect: { x: 0, y: 20, width: 10, height: 10 } }],
        now,
      }),
    ];
    const summary = redactionsummary(regions);
    expect(summary).toMatch(/2 redact regions/);
    expect(summary).toMatch(/1 derived from sensitive field shapes and 1 drawn by the user/);
    expect(redactionsummary([])).toMatch(/No redact region/);
  });
});
