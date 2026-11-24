import { describe, expect, it } from "vitest";
import {
  sbomcomponentof,
  sbomcoveragecheck,
  sbominventory,
  sbominventorytext,
  sbomlicense,
  sbomnameof,
  sbomspecversion,
} from "../pack.js";

const valid = "a".repeat(64);

describe("sbom", () => {
  it("builds the cyclonedx component record of one artifact with its hash and channels", () => {
    const component = sbomcomponentof({
      name: "devthink1.1.87.zip",
      size: 2048,
      checksum: valid,
      channels: ["github", "chromium"],
    });
    expect(component.type).toBe("file");
    expect(component.name).toBe("devthink1.1.87.zip");
    expect(component.hashes).toEqual([{ alg: "SHA-256", content: valid }]);
    expect(component.properties).toContainEqual({ name: "devthink:channel", value: "github,chromium" });
    expect(component.properties).toContainEqual({ name: "devthink:size", value: "2048" });
    expect(component.size).toBe(2048);
    expect(() => sbomcomponentof({ name: "", size: 1, checksum: valid })).toThrow();
    expect(() => sbomcomponentof({ name: "a.zip", size: 1, checksum: "short" })).toThrow();
  });

  it("covers every artifact of the release in one cyclonedx inventory", () => {
    const artifacts = [
      { name: "devthink1.1.87.zip", size: 10, checksum: "a".repeat(64) },
      { name: "devthink-vscode-1.1.87.vsix", size: 20, checksum: "b".repeat(64) },
      { name: "devthink-firefox-1.1.87.xpi", size: 30, checksum: "c".repeat(64) },
    ];
    const inventory = JSON.parse(sbominventorytext({ version: "1.1.87", artifacts })) as {
      bomformat: string;
      specversion: string;
      components: Array<{ name?: string; hashes?: Array<{ alg?: string; content?: string }> }>;
      metadata: { component: { name: string; version: string; licenses: Array<{ license: { id: string } }> } };
    };
    const document = sbominventory({ version: "1.1.87", artifacts });
    expect(document.bomformat).toBe("CycloneDX");
    expect(document.specversion).toBe(sbomspecversion);
    expect(document.specversion).toBe("1.5");
    expect(inventory.components).toHaveLength(3);
    const metadata = inventory.metadata;
    expect(metadata.component?.name ?? "").toBe("devthink");
    expect(metadata.component?.version ?? "").toBe("1.1.87");
    expect(metadata.component.licenses[0]?.license.id ?? "").toBe(sbomlicense);
    /* every artifact appears once with its checksum */
    const coverage = sbomcoveragecheck({ inventory, artifacts });
    expect(coverage.ok).toBe(true);
    expect(coverage.missing).toEqual([]);
  });

  it("renders byte identical output for the same artifact set because no timestamp enters the document", () => {
    const artifacts = [{ name: "devthink-site-1.1.87.zip", size: 5, checksum: "d".repeat(64) }];
    expect(sbominventorytext({ version: "1.1.87", artifacts })).toBe(
      sbominventorytext({ version: "1.1.87", artifacts }),
    );
    expect(sbominventorytext({ version: "1.1.87", artifacts })).not.toContain("timestamp");
  });

  it("refuses an empty artifact set and a duplicate artifact name", () => {
    expect(() => sbominventory({ version: "1.1.87", artifacts: [] })).toThrow();
    expect(() =>
      sbominventory({
        version: "1.1.87",
        artifacts: [
          { name: "a.zip", size: 1, checksum: valid },
          { name: "a.zip", size: 1, checksum: valid },
        ],
      }),
    ).toThrow();
    expect(() =>
      sbominventory({ version: "not-a-version", artifacts: [{ name: "a.zip", size: 1, checksum: valid }] }),
    ).toThrow();
  });

  it("reports the artifacts the inventory misses or records with another hash", () => {
    const inventory = JSON.parse(
      sbominventorytext({ version: "1.1.87", artifacts: [{ name: "a.zip", size: 1, checksum: "a".repeat(64) }] }),
    );
    const missing = sbomcoveragecheck({
      inventory,
      artifacts: [
        { name: "a.zip", checksum: "a".repeat(64) },
        { name: "b.zip", checksum: "b".repeat(64) },
      ],
    });
    expect(missing.ok).toBe(false);
    expect(missing.missing).toEqual(["b.zip"]);
    const mismatched = sbomcoveragecheck({ inventory, artifacts: [{ name: "a.zip", checksum: "c".repeat(64) }] });
    expect(mismatched.ok).toBe(false);
    expect(mismatched.missing).toEqual(["a.zip"]);
  });

  it("names the sbom asset with the release version", () => {
    expect(sbomnameof("1.1.87")).toBe("devthink-sbom-1.1.87.json");
    expect(() => sbomnameof("not-a-version")).toThrow();
  });
});
