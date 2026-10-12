import { describe, expect, it } from "vitest";
import {
  datagridcolumnsof,
  datagridof,
  exportdatagrid,
  exportmenudescriptors,
  exportrowsof,
  filterdatagridrows,
  infercolumntype,
  maskedvalueof,
  selectrowrange,
  sortdatagridrows,
} from "../views.js";

const now = 1_800_000_000_000;

describe("datagrid and exportmenu", () => {
  it("infers the column types from the observed values", () => {
    expect(infercolumntype(["1", "2.5", "-3"])).toBe("number");
    expect(infercolumntype(["true", "false"])).toBe("boolean");
    expect(infercolumntype(["2024-05-01", "2024-06-15"])).toBe("date");
    expect(infercolumntype(["alpha", "beta"])).toBe("text");
    expect(infercolumntype(["", ""])).toBe("empty");
    const columns = datagridcolumnsof([{ name: "alpha", price: "10", live: "true" }]);
    expect(columns.find((column) => column.field === "name")?.type).toBe("text");
    expect(columns.find((column) => column.field === "price")?.type).toBe("number");
    expect(columns.find((column) => column.field === "live")?.type).toBe("boolean");
    expect(columns.every((column) => column.inferred)).toBe(true);
  });

  it("builds the datagrid view of an extraction result and refuses empty shapes", () => {
    const view = datagridof({
      title: "  Pricing table  ",
      origin: "https://example.com",
      runid: "run-1",
      rows: [
        { item: "screwdriver", price: "12" },
        { item: "hammer", price: "20" },
      ],
      at: now,
    });
    expect(view.title).toBe("Pricing table");
    expect(view.rows).toHaveLength(2);
    expect(view.rows[0]?.index).toBe(0);
    expect(view.columns.map((column) => column.field)).toEqual(["item", "price"]);
    expect(() =>
      datagridof({ title: "", origin: "https://example.com", runid: "run-1", rows: [{ a: "b" }], at: now }),
    ).toThrow(/title/);
    expect(() => datagridof({ title: "grid", origin: " ", runid: "run-1", rows: [{ a: "b" }], at: now })).toThrow(
      /origin/,
    );
    expect(() =>
      datagridof({ title: "grid", origin: "https://example.com", runid: "run-1", rows: [], at: now }),
    ).toThrow(/row/);
  });

  it("sorts and filters rows locally inside the surface", () => {
    const view = datagridof({
      title: "grid",
      origin: "https://example.com",
      runid: "run-1",
      rows: [
        { item: "hammer", price: "20" },
        { item: "screwdriver", price: "12" },
        { item: "wrench", price: "15" },
      ],
      at: now,
    });
    const sorted = sortdatagridrows(view, { field: "price", direction: "ascending" });
    expect(sorted.rows.map((row) => row.values.item)).toEqual(["screwdriver", "wrench", "hammer"]);
    const descending = sortdatagridrows(view, { field: "price", direction: "descending" });
    expect(descending.rows.map((row) => row.values.item)).toEqual(["hammer", "wrench", "screwdriver"]);
    expect(() => sortdatagridrows(view, { field: "unknown", direction: "ascending" })).toThrow(/column/);
    const filtered = filterdatagridrows(view, "HAMMER");
    expect(filtered.rows.map((row) => row.values.item)).toEqual(["hammer"]);
    expect(filterdatagridrows(view, "").rows).toHaveLength(3);
  });

  it("selects a row range for a partial export and refuses a range outside the grid", () => {
    const view = datagridof({
      title: "grid",
      origin: "https://example.com",
      runid: "run-1",
      rows: [{ a: "1" }, { a: "2" }, { a: "3" }],
      at: now,
    });
    const selected = selectrowrange(view, 1, 2);
    expect(selected.rows.map((row) => row.selected)).toEqual([false, true, true]);
    expect(exportrowsof(selected, "selection")).toHaveLength(2);
    expect(exportrowsof(selected, "run")).toHaveLength(3);
    expect(() => selectrowrange(view, 2, 1)).toThrow(/range/);
    expect(() => exportrowsof(view, "selection")).toThrow(/selected row range/);
  });

  it("offers csv, json and clipboard formats scoped to the selection, the step and the run", () => {
    const menu = exportmenudescriptors();
    expect(menu.filter((descriptor) => descriptor.format === "csv")).toHaveLength(3);
    expect(menu.map((descriptor) => descriptor.scope)).toContain("selection");
    expect(menu.map((descriptor) => descriptor.scope)).toContain("step");
    expect(menu.map((descriptor) => descriptor.scope)).toContain("run");
    expect(
      menu
        .filter((descriptor) => descriptor.format === "clipboard")
        .every((descriptor) => descriptor.destination === "clipboard"),
    ).toBe(true);
  });

  it("writes masked values only, honoring the maskinputs verdicts", () => {
    const view = datagridof({
      title: "grid",
      origin: "https://example.com",
      runid: "run-1",
      rows: [{ user: "ada", token: "s3cr3tlongvalue" }],
      at: now,
    });
    const maskverdicts = { token: "The token value stays masked and never renders in the clear." };
    const masked = maskedvalueof("s3cr3tlongvalue", "token", maskverdicts);
    expect(masked.masked).toBe(true);
    expect(masked.value).not.toContain("s3cr3t");
    expect(maskedvalueof("ada", "user", maskverdicts).masked).toBe(false);
    const csv = exportdatagrid(view, { format: "csv", scope: "run", destination: "download" }, maskverdicts);
    expect(csv.maskedfields).toEqual(["token"]);
    expect(csv.text).not.toContain("s3cr3tlongvalue");
    expect(csv.text).toContain("ada");
    expect(csv.rows).toBe(1);
    const json = exportdatagrid(view, { format: "json", scope: "run", destination: "memory" }, maskverdicts);
    const parsed = JSON.parse(json.text) as {
      rows: Array<Record<string, unknown>>;
      columns: Array<{ field: string; type: string }>;
    };
    expect(parsed.columns.find((column) => column.field === "user")?.type).toBe("text");
    expect(String(parsed.rows[0]?.token)).not.toContain("s3cr3t");
    const clipboard = exportdatagrid(view, { format: "clipboard", scope: "run", destination: "clipboard" }, {});
    expect(clipboard.text).toContain("s3cr3tlongvalue");
    expect(clipboard.maskedfields).toEqual([]);
  });
});
