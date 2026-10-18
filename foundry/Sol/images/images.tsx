/**
 * images page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it mounts the page and is consumed only by the theme anchor (Sol/Sol.tsx).
 *
 * ImageMultipleRegular — the herd shelf of the foundry: the three real clone formats
 * (.tzst / .tar.gz / .tar.xz) with their honest traits, the conversion
 * plan the floor keeps (unpack the tar layer, recompress, seal) and the
 * size estimates per format. The shelf is a seeded rehearsal; the plan is
 * the real conversion logic (imagestore.ts).
 */

import { ArrowRightRegular, ArrowSyncRegular, LayerRegular } from "@fluentui/react-icons";
import { useMemo, useState } from "react";
import {
  type ConvertPlan,
  convertPlan,
  estimateSize,
  FORMATS,
  formatBytes,
  formatOf,
  type HerdImage,
  type ImageFormat,
  pourOrder,
  seedImages,
} from "../../imagestore.ts";
import { EmptyState } from "../shell/EmptyState";

/** the seed of the rehearsal shelf (shown on the page, pinned by the tests) */
export const SHELF_SEED = 314159;

/** one shelf row: the image, its format and the sealed estimate. */
function ImageRow({ image }: { image: HerdImage }) {
  const spec = formatOf(image.format);
  return (
    <article className="fi-row" data-format={image.format}>
      <div className="fi-row__id">
        <h3 className="fi-row__name">{image.name}</h3>
        <p className="fi-row__trait">{spec?.trait}</p>
      </div>
      <span className="fi-row__ext">{spec?.ext}</span>
      <div className="fi-row__sizes">
        <span className="fi-metric">
          <span className="fi-metric__label">tar stream</span>
          <span className="fi-metric__value">{formatBytes(image.tarBytes)}</span>
        </span>
        <span className="fi-metric">
          <span className="fi-metric__label">sealed est.</span>
          <span className="fi-metric__value">{formatBytes(estimateSize(image.tarBytes, image.format))}</span>
        </span>
      </div>
    </article>
  );
}

/** The images page: the herd shelf and the conversion plan. */
export default function ImageMultipleRegular() {
  const [seed, setSeed] = useState(SHELF_SEED);
  const [from, setFrom] = useState<ImageFormat>("tzst");
  const [to, setTo] = useState<ImageFormat>("tarxz");
  const images = useMemo(() => seedImages(seed, 6), [seed]);
  const plan = useMemo<ConvertPlan>(() => convertPlan(from, to), [from, to]);

  return (
    <main className="shell fi-page">
      <header className="pagehead">
        <p className="pagehead__eyebrow">images · the herd shelf</p>
        <h1 className="pagehead__title">ImageMultipleRegular</h1>
        <p className="pagehead__lede">
          The herd travels in three formats — .tzst clones fast, .tar.gz opens anywhere, .tar.xz rides the releases. A
          seeded rehearsal (seed {seed}) fills the shelf; the conversion plan below is the real floor logic.
        </p>
        <div className="pagehead__actions">
          <button type="button" className="btn" onClick={() => setSeed((value) => value + 1)}>
            <ArrowSyncRegular fontSize={14} aria-hidden="true" />
            reseed the shelf
          </button>
        </div>
      </header>

      {/* the conversion plan: from · to, the honest steps */}
      <section className="fi-plan" aria-label="the conversion plan">
        <p className="fi-plan__head">
          <LayerRegular fontSize={13} aria-hidden="true" />
          the conversion plan
        </p>
        <div className="fi-plan__pick">
          <fieldset className="fi-chips" aria-label="convert from format">
            <legend className="fi-chips__legend">from</legend>
            {FORMATS.map((format) => (
              <button
                key={format.id}
                type="button"
                className="fi-chip"
                aria-pressed={format.id === from}
                onClick={() => setFrom(format.id)}
              >
                {format.ext}
              </button>
            ))}
          </fieldset>
          <span className="fi-plan__arrow" aria-hidden="true">
            <ArrowRightRegular fontSize={16} />
          </span>
          <fieldset className="fi-chips" aria-label="convert to format">
            <legend className="fi-chips__legend">to</legend>
            {FORMATS.map((format) => (
              <button
                key={format.id}
                type="button"
                className="fi-chip"
                aria-pressed={format.id === to}
                onClick={() => setTo(format.id)}
              >
                {format.ext}
              </button>
            ))}
          </fieldset>
        </div>
        <ol className="fi-plan__steps">
          {plan.steps.map((stepText) => (
            <li key={stepText}>{stepText}</li>
          ))}
        </ol>
        <p className="fi-plan__note">
          estimates on a 1 GB tar stream:{" "}
          {FORMATS.map((format) => `${format.ext} ${formatBytes(estimateSize(1_000_000_000, format.id))}`).join(" · ")}
        </p>
      </section>

      {images.length === 0 ? (
        <EmptyState
          icon={LayerRegular}
          title="the shelf stands empty"
          line="No image is shelved right now — reseed the rehearsal to pour the herds again."
          action={
            <button type="button" className="btn secondary" onClick={() => setSeed(SHELF_SEED)}>
              pour the rehearsal shelf
            </button>
          }
        />
      ) : (
        <section className="fi-shelf" aria-label="the image shelf">
          <div className="fi-shelf__head" aria-hidden="true">
            <span>image</span>
            <span>format</span>
            <span>sizes</span>
          </div>
          {images.map((image) => (
            <ImageRow key={image.id} image={image} />
          ))}
        </section>
      )}

      <p className="fr-footnote">
        pour order:{" "}
        {pourOrder()
          .map((format) => format.ext)
          .join(" → ")}{" "}
        — the lead herd clones fast, the release herd rides small.
      </p>
    </main>
  );
}
