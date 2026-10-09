/**
 * pagesection.tsx — the canonical page header: the `.pagehead` grammar of
 * the class contract — eyebrow (10px mono uppercase tracked, the ONE
 * signal accent of the header) + title (28–32px sans -0.02em, Bricolage
 * 600) + lede (13px muted), the ONE page hero shape the static family
 * site pages already follow. The surface contract for the edges:
 * hairlines at var(--dt-edge) land through the wave-2 CSS; the inline
 * scale here keeps the typography honest in every theme.
 */
import { useReveal } from "./reveal";

/** the eyebrow: 10px mono uppercase tracked, the one signal accent. */
const EYEBROW_STYLE = {
  margin: "0 0 10px",
  font: "600 10px/1.6 var(--dt-mono)",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "var(--sig)",
} as const;

/** the title: 28–32px sans at -0.02em (the display scale of the contract). */
const TITLE_STYLE = {
  margin: "0 0 0.4em",
  font: "600 clamp(1.75rem, 3vw, 2rem)/1.12 var(--dt-sans)",
  letterSpacing: "-0.02em",
  color: "var(--sol-text)",
} as const;

/** the lede: 13px muted (the body scale of the contract). */
const LEDE_STYLE = {
  margin: 0,
  fontSize: 13,
  lineHeight: 1.65,
  color: "var(--dt-muted)",
} as const;

export function PageSection({
  eyebrow,
  title,
  children,
  description,
  reveal = false,
  className,
}: {
  eyebrow: string;
  title: React.ReactNode;
  children?: React.ReactNode;
  description?: React.ReactNode;
  reveal?: boolean;
  className?: string;
}) {
  useReveal(reveal ? [title] : []);
  const inCls = reveal ? "reveal in" : undefined;
  return (
    <header className={className ? `pagehead ${className}` : "pagehead"}>
      <p className={inCls} style={EYEBROW_STYLE}>
        {eyebrow}
      </p>
      <h1 className={inCls} style={TITLE_STYLE}>
        {title}
      </h1>
      {description ? (
        <p className={inCls ? `${inCls} max-640` : "max-640"} style={LEDE_STYLE}>
          {description}
        </p>
      ) : null}
      {children}
    </header>
  );
}
