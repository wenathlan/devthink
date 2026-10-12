/**
 * logo.tsx — the official DevThink mark as a React component. The two paths
 * are transcribed verbatim from the canonical logo (viewBox 0 0 800 800,
 * neodocs/outros.devthink/txt/logo.txt) in the official paint order: the
 * star core first, the hexagon frame over it. The default fill is mono
 * currentColor — the mark recolors through CSS like any other text glyph —
 * and the optional accent prop tints the star core with the Sol amber for
 * brand moments.
 */

/** the star core of the official mark (drawn first) */
const CORE_PATH =
  "m111.246 554.483 311.148-132.035c17.311-7.346 35.01-6.438 50.73 2.603l215.63 124.001-257.93-198.009c-14.35-11.017-20.741-26.815-21.096-45.306L404.81 48.985l-39.884 333.29c-2.21 18.466-13.3 33.262-29.635 42.703z";

/** the hexagon frame of the official mark (drawn over the star) */
const FRAME_PATH =
  "m187.507 510.586 5.665 10.27 200.806 126.509 10.125.012 192.746-120.802c6.182-3.875 10.271-9.165 12.459-16.126l2.481-7.887-5.286-3.756-22.835-16.868-3.901 3.904-.001 2.46c-.002 11.406-5.636 21.592-15.303 27.648l-147.928 92.709c-10.752 6.739-23.987 6.724-34.723-.04l-147.119-92.686c-9.592-6.044-15.237-16.266-15.236-27.606l-.001-176.655c0-11.379 5.608-21.543 15.235-27.607l147.122-92.683c10.733-6.763 23.976-6.779 34.723-.043l147.928 92.711c9.643 6.045 15.3 16.265 15.3 27.648l.021 138.629 2.128 2.128 28.452 20.018 2.128-2.125-.781-180.928-5.659-10.23-201.951-126.567-10.121.013-200.808 126.508-5.666 10.267z";

type SolLogoMarkProps = {
  /** rendered square size in px */
  size?: number;
  /** accessible name; omit for a decorative mark */
  title?: string;
  /** tints the star core with the Sol amber (default: official mono mark) */
  accent?: boolean;
};

/** The DevThink logo mark: the two official paths, mono by default. */
export function SolLogoMark({ size = 28, title, accent = false }: SolLogoMarkProps) {
  const coreFill = accent ? "var(--sol-sun, #F59E0B)" : "currentColor";
  if (title) {
    return (
      <svg
        viewBox="0 0 800 800"
        width={size}
        height={size}
        fillRule="evenodd"
        clipRule="evenodd"
        shapeRendering="geometricPrecision"
        role="img"
        aria-label={title}
        focusable="false"
      >
        <title>{title}</title>
        <path className="sol-logo__core" fill={coreFill} d={CORE_PATH} />
        <path className="sol-logo__frame" fill="currentColor" d={FRAME_PATH} />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 800 800"
      width={size}
      height={size}
      fillRule="evenodd"
      clipRule="evenodd"
      shapeRendering="geometricPrecision"
      aria-hidden="true"
      focusable="false"
    >
      <path className="sol-logo__core" fill={coreFill} d={CORE_PATH} />
      <path className="sol-logo__frame" fill="currentColor" d={FRAME_PATH} />
    </svg>
  );
}
