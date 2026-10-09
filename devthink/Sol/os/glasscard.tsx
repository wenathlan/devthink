/**
 * glasscard.tsx — the liquid-glass panel of the engine (rgba panel +
 * 35px blur sat 140%, solar border, radius ladder). `reveal` joins the
 * IntersectionObserver pass. The class joiner is local: the os folder
 * keeps its tiny helpers inside the page folder.
 */
import { useReveal } from "./reveal";

/** minimal class joiner (clsx-shaped, no external dependency). */
function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function GlassCard({
  children,
  className,
  hover = false,
  reveal = false,
  as = "section",
  ariaLabel,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  reveal?: boolean;
  as?: "section" | "article" | "div" | "aside";
  ariaLabel?: string;
}) {
  useReveal(reveal ? [children] : []);
  const Tag = as;
  return (
    <Tag className={cx("glass card", hover && "glass-hover", reveal && "reveal", className)} aria-label={ariaLabel}>
      {children}
    </Tag>
  );
}
