/**
 * images page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it mounts the page and is consumed only by the theme anchor (Sol/Sol.tsx).
 *
 * The images page — the herd shelf of the foundry: the three real clone formats
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
import { labelfill, label } from "../../labels.ts";
import { EmptyState } from "../widgets/shell.emptystate.tsx";

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
          <span className="fi-metric__label">{label("images.metric.tar")}</span>
          <span className="fi-metric__value">{formatBytes(image.tarBytes)}</span>
        </span>
        <span className="fi-metric">
          <span className="fi-metric__label">{label("images.metric.sealed")}</span>
          <span className="fi-metric__value">{formatBytes(estimateSize(image.tarBytes, image.format))}</span>
        </span>
      </div>
    </article>
  );
}

/** The images page: the herd shelf and the conversion plan. */
export default function Images() {
  const [seed, setSeed] = useState(SHELF_SEED);
  const [from, setFrom] = useState<ImageFormat>("tzst");
  const [to, setTo] = useState<ImageFormat>("tarxz");
  const images = useMemo(() => seedImages(seed, 6), [seed]);
  const plan = useMemo<ConvertPlan>(() => convertPlan(from, to), [from, to]);

  return (
    <main className="shell fi-page">
      <header className="pagehead">
        <p className="pagehead__eyebrow">{label("images.eyebrow")}</p>
        <h1 className="pagehead__title">{label("images.title")}</h1>
        <p className="pagehead__lede">{labelfill("images.lede", { seed: String(seed) })}</p>
        <div className="pagehead__actions">
          <button type="button" className="btn" onClick={() => setSeed((value) => value + 1)}>
            <ArrowSyncRegular fontSize={14} aria-hidden="true" />
            {label("images.reseed")}
          </button>
        </div>
      </header>

      {/* the conversion plan: from · to, the honest steps */}
      <section className="fi-plan" aria-label={label("images.plan.aria")}>
        <p className="fi-plan__head">
          <LayerRegular fontSize={13} aria-hidden="true" />
          {label("images.plan.head")}
        </p>
        <div className="fi-plan__pick">
          <fieldset className="fi-chips" aria-label={label("images.plan.fromAria")}>
            <legend className="fi-chips__legend">{label("images.plan.from")}</legend>
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
          <fieldset className="fi-chips" aria-label={label("images.plan.toAria")}>
            <legend className="fi-chips__legend">{label("images.plan.to")}</legend>
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
          {labelfill("images.plan.note", {
            list: FORMATS.map((format) => `${format.ext} ${formatBytes(estimateSize(1_000_000_000, format.id))}`).join(
              " · ",
            ),
          })}
        </p>
      </section>

      {images.length === 0 ? (
        <EmptyState
          icon={LayerRegular}
          title={label("images.empty.title")}
          line={label("images.empty.line")}
          action={
            <button type="button" className="btn secondary" onClick={() => setSeed(SHELF_SEED)}>
              {label("images.empty.action")}
            </button>
          }
        />
      ) : (
        <section className="fi-shelf" aria-label={label("images.shelf.aria")}>
          <div className="fi-shelf__head" aria-hidden="true">
            <span>{label("images.head.image")}</span>
            <span>{label("images.head.format")}</span>
            <span>{label("images.head.sizes")}</span>
          </div>
          {images.map((image) => (
            <ImageRow key={image.id} image={image} />
          ))}
        </section>
      )}

      <p className="fr-footnote">
        {labelfill("images.footnote", {
          list: pourOrder()
            .map((format) => format.ext)
            .join(" → "),
        })}
      </p>
    </main>
  );
}
