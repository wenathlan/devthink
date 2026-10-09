/**
 * glasscard.tsx — the liquid-glass panel of the engine (rgba panel +
 * 35px blur sat 140%, solar border, radius ladder). Inside the os hub the
 * surface contract flattens it: 8px corners, hairline edges at
 * var(--dt-edge), the p-4/p-6 padding equivalents (16/24px), hover
 * micro-feedback at 160ms var(--dt-ease) and the var(--dt-blue)
 * focus-visible ring — values carried by the wave-2 `.os-root .glass`
 * pass. `reveal` joins the IntersectionObserver pass. The class joiner is
 * local: the os folder keeps its tiny helpers inside the page folder.
 */
import { useReveal } from "./reveal";

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
      className={cx("glass card", hover && "glass-hover", reveal && "reveal", className)}
      data-interactive={hover ? "true" : "false"}
      style={{ padding: PADS[pad] }}
      aria-label={ariaLabel}
    >
      {children}
    </Tag>
  );
}
