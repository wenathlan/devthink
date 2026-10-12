/**
 * glasscard.tsx — the liquid-glass panel of the engine: the R1-c glass
 * recipe is white 4% fill + blur(18px) saturate(130%), the hairline
 * border, the inset 0 1px 0 white 6% top highlight and the 10px radius;
 * the hover is the -4px .lift (never glass+neon, one accent per card).
 * Inside the os hub the surface contract keeps the hairline edges at
 * var(--dt-edge), the p-4/p-6 padding equivalents (16/24px) and the
 * focus-visible ring. `reveal` joins the IntersectionObserver pass. The
 * class joiner is local: the os folder keeps its tiny helpers inside the
 * page folder.
 */
import { useReveal } from "./reveal.ts";

/** minimal class joiner (clsx-shaped, no external dependency). */
function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** the padding scale of the contract: p-4 = 16px, p-6 = 24px. */
const PADS = { 4: 16, 6: 24 } as const;

export function GlassCard({
  children,
  className,
  hover = false,
  reveal = false,
  as = "section",
  ariaLabel,
  pad = 6,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  reveal?: boolean;
  as?: "section" | "article" | "div" | "aside";
  ariaLabel?: string;
  /** the padding step of the contract: 4 (16px) or 6 (24px, the default). */
  pad?: keyof typeof PADS;
}) {
  useReveal(reveal ? [children] : []);
  const Tag = as;
  return (
    <Tag
      className={cx("glass card", hover && "glass-hover lift", reveal && "reveal", className)}
      data-interactive={hover ? "true" : "false"}
      style={{ padding: PADS[pad] }}
      aria-label={ariaLabel}
    >
      {children}
    </Tag>
  );
}
