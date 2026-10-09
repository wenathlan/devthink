/**
 * world page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

import { Boxes, ShieldCheck } from "lucide-react";
/**
 * World.tsx — the world page of the stealhead Sol theme: the gallery of
 * GLB world assets rendered straight from the DB rows (name, kind, glb
 * path, hash, size). the platform ships pre-compiled, so the page lists
 * prepared, hash-verified assets and never runs a 3D engine client side:
 * the visitor machine compiles nothing and stores nothing.
 */
import { useEffect, useMemo, useState } from "react";
import { observeReveals } from "../../reveal";
import {
  filterbykind,
  humansize,
  ishashshape,
  listworldassets,
  type WorldAsset,
  type WorldAssetKind,
} from "../../world.ts";

/**
 * the world page.
 *
 * @returns the world element.
 */
export default function World() {
  const [assets, setAssets] = useState<WorldAsset[] | null>(null);
  const [selected, setSelected] = useState<WorldAssetKind | "all">("all");

  useEffect(() => {
    observeReveals();
    let live = true;
    listworldassets()
      .then((rows) => {
        if (live) setAssets(rows);
      })
      .catch(() => {
        if (live) setAssets([]);
      });
    return () => {
      live = false;
    };
  }, []);

  const assetkinds = useMemo(() => {
    const seen = new Set<WorldAssetKind>();
    const ordered: WorldAssetKind[] = [];
    for (const asset of assets ?? []) {
      if (!seen.has(asset.kind)) {
        seen.add(asset.kind);
        ordered.push(asset.kind);
      }
    }
    return ordered;
  }, [assets]);

  const visible = useMemo(() => {
    if (!assets) return null;
    return filterbykind(assets, selected === "all" ? undefined : selected);
  }, [assets, selected]);

  return (
    <>
      <header className="pagehead">
        <p className="eyebrow">world</p>
        <h1>world assets</h1>
        <p>
          The GLB catalog of the platform as DB rows: name, kind, path and the sha-256 the build verifies against the
          downloaded binary. Every asset ships pre-compiled on the family domains — the visitor VGPU/VCPU never compiles
          anything, and the interface renders rows, not scenes.
        </p>
      </header>
      <div className="toolbar" role="tablist" aria-label="asset kinds">
        <div className="tabs">
          <button
            type="button"
            role="tab"
            aria-selected={selected === "all"}
            title="every kind of the catalog"
            onClick={() => setSelected("all")}
          >
            all
          </button>
          {assetkinds.map((kind) => (
            <button
              key={kind}
              type="button"
              role="tab"
              aria-selected={selected === kind}
              title={`filter the catalog by ${kind}`}
              onClick={() => setSelected(kind)}
            >
              {kind}
            </button>
          ))}
        </div>
      </div>
      {visible === null ? (
        <div className="loadingrows" aria-busy="true">
          <div className="skeleton" />
          <div className="skeleton" />
          <div className="skeleton" />
        </div>
      ) : (
        <div className="worldgrid">
          {visible.map((asset) => (
            <article key={asset.path} className="glass glass-hover card assetcard reveal">
              <div className="assetkindrow">
                <span className="badge">
                  <Boxes size={11} aria-hidden="true" />
                  {asset.kind}
                </span>
                {asset.precompiled ? (
                  <span className="badge success">
                    <ShieldCheck size={11} aria-hidden="true" />
                    pre-compiled
                  </span>
                ) : null}
                <span className="badge info" style={{ marginLeft: "auto" }}>
                  {humansize(asset.size)}
                </span>
              </div>
              <h3>{asset.name}</h3>
              <code className="assetpath">{asset.path}</code>
              <code className="assethash" title={asset.sha256}>
                sha-256 {asset.sha256}
              </code>
              <p className="assetsize" style={{ marginBottom: 0 }}>
                {ishashshape(asset.sha256)
                  ? "hash shape verified — the binary is cataloged in the site DB and tracked by git lfs."
                  : "the digest of this row is not a well formed sha-256."}
              </p>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
