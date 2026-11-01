/**
 * Skeleton.tsx — the loading face of the product surfaces: a column of
 * shimmer lines the browse and the console show while the ledger boots
 * (the doctrine skeleton — shimmer-slide on the wash band, tabular rhythm,
 * hairline rows), standing down to a static wash on reduced motion. The
 * visible rhythm answers the table it stands in for; the hidden status
 * line rides the ui store.
 */

import { uicopy } from "../../uistore.ts";

/** The skeleton props: the row count and the optional narrow head row. */
export type SkeletonProps = {
  /** the shimmer rows to render (default five). */
  rows?: number;
  /** true renders a shorter head row first (the table head stand-in). */
  head?: boolean;
};

/**
 * The skeleton of one loading surface.
 *
 * @param props the row count and the head flag.
 * @returns the skeleton element.
 */
export function Skeleton({ rows = 5, head = true }: SkeletonProps) {
  const lines = Array.from({ length: rows }, (_, index) => index);
  return (
    <div className="vc-skeleton" role="status" aria-label={uicopy("face.skeleton.aria")}>
      {head ? <span className="vc-skeleton__line vc-skeleton__line--head" aria-hidden="true" /> : null}
      {lines.map((line) => (
        <span
          key={line}
          className="vc-skeleton__line"
          data-narrow={line % 3 === 2 ? "true" : undefined}
          aria-hidden="true"
          style={{ animationDelay: `${line * 90}ms` }}
        />
      ))}
    </div>
  );
}

export default Skeleton;
