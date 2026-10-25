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

/** the official wordmark of the brand, transcribed verbatim from the web
 * index (viewBox 0 0 23500000 6000000) — the text logo, never a font. */
const WORDMARK_PATH =
  "M433700 1492500c-272800 0-417500 205400-417500 406900 0 178300 107500 325600 339000 364400 186000 30900 248100 89100 177800 224700l-153000 290700c-409300 779000-194300 1709100 872400 1713000 1261000 3800 1864600-511600 1864600-1507600 0-949500-351400-1492100-1248600-1492100zm1434700 2569500c-128200 286800-587100 360400-707000-38800L735500 2620300c-78500-263500 41400-438000 392800-499900l1033600-186100c314300-58100 587100 135700 421800 511600zm1981800-2563800v320100c0 169300-83900 267900-224800 267900h-156200c-138700 0-222700 100800-222700 270100v1285300c0 169300 84000 267900 222700 267900h156200c140900 0 224800 98600 224800 268000v322200h2204400v-590200H4072100c-140900 0-221900-98600-221900-267900v-347900h1896400v-590200H3850200v-347200c0-169300 81000-270100 221900-270100h1298600l683900-502200v-85800zm2333900 0 1259200 2798600s2200 0 2200 2100c75100 167200 172900 200800 312300 200800h432100l-265700-590200h323400c164300 0 281800-52100 348200-202900l997100-2208400h-654800l-929900 2063400c-107300 238600-132800 237200-192700 105000l-887600-1967600c-74400-167200-173000-200800-314600-200800zm3812000 0c-173700 0-273700 79300-273700 217900v370100h957700c173700 0 273700 81500 273700 220100v2193400h603000V2306300c0-138600 100600-220100 273600-220100h958500v-588000h-958500c-173000 0-273600 79300-273600 217900v370100h-329300c-173000 0-273700-79300-273700-217900v-370100zm2922300-300v1205400h378800c140900 0 222700 98700 224800 268000v322300h-381000c-138700 0-222600 98600-222600 267900v938200h347500c141100 0 256100-112600 256100-250800v-687400c0-169300 81100-267900 222000-267900h1685500v955300c0 138200 115100 250800 256200 250800h346800V1500100l-603000 459200v744000h-1685500c-140900 0-222000-97800-222000-267900v-629900z";

type SolWordmarkProps = {
  /** rendered height in px (the width follows the viewBox ratio) */
  height?: number;
  /** accessible name; omit for a decorative wordmark */
  title?: string;
};

/** The DevThink wordmark: the official text logo as a path, currentColor. */
export function SolWordmark({ height = 20, title }: SolWordmarkProps) {
  return (
    <svg
      viewBox="0 0 23500000 6000000"
      height={height}
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : "true"}
      focusable="false"
      style={{ display: "block", width: "auto" }}
    >
      <path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d={WORDMARK_PATH} />
    </svg>
  );
}
