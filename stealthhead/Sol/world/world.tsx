/**
 * world page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

import { BoxMultipleRegular as Boxes, ShieldTaskRegular as ShieldCheck } from "@fluentui/react-icons";
// World.tsx — the MAP PLATES (campaign v3 · r3-stealthhead): the GLB catalog as
// a seamed plate field — hairline joints between the plates, zone meta in
// mono (kind, size, path, sha-256), never a floating card grid. Rows come
// from the root world logic (typed DB accessor over HTTPS with the in-memory
// seed fallback); the platform ships pre-compiled, so the page lists
// prepared, hash-verified assets and never runs a 3D engine client side:
// the visitor machine compiles nothing and stores nothing.
import { useEffect, useMemo, useState } from "react";
import { labelfill, label } from "../../labels";
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
      <header className="pagehead halftone grain">
        <p className="eyebrow">{label("world.eyebrow")}</p>
        <h1>{label("world.title")}</h1>
        <p>{label("world.lede")}</p>
      </header>
      <div className="toolbar" role="tablist" aria-label={label("world.kinds.aria")}>
        <div className="tabs">
          <button
            type="button"
            role="tab"
            aria-selected={selected === "all"}
            data-tip={label("world.kind.allTip")}
            onClick={() => setSelected("all")}
          >
            {label("world.kind.all")}
          </button>
          {assetkinds.map((kind) => (
            <button
              key={kind}
              type="button"
              role="tab"
              aria-selected={selected === kind}
              data-tip={labelfill("world.kind.filterTip", { kind })}
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
        <div className="worldplates">
          {visible.map((asset) => (
            <article key={asset.path} className="worldplate reveal">
              <div className="worldplate__top">
                <span className="badge">
                  <Boxes fontSize={11} aria-hidden="true" />
                  {asset.kind}
                </span>
                {asset.precompiled ? (
                  <span className="badge success">
                    <ShieldCheck fontSize={11} aria-hidden="true" />
                    {label("world.plate.precompiled")}
                  </span>
                ) : null}
                <span className="badge info worldplate__push">{humansize(asset.size)}</span>
              </div>
              <h3 className="worldplate__name">{asset.name}</h3>
              <code className="assetpath">{asset.path}</code>
              <code className="assethash" data-tip={asset.sha256}>
                {labelfill("world.plate.hash", { digest: asset.sha256 })}
              </code>
              <p className="worldplate__verify">
                {ishashshape(asset.sha256) ? label("world.plate.verified") : label("world.plate.unverified")}
              </p>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
