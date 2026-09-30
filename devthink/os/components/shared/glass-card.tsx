"use client";

import { cn } from "@/lib/utils";
import { useReveal } from "../engine/reveal";

/**
 * GlassCard — painel liquid-glass do engine (rgba(255,251,235,.045) +
 * backdrop-blur 35px sat 140%, borda rgba(245,158,11,.16), radius escada).
 * `reveal` entra na esteira do IntersectionObserver.
 */
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
    <Tag
      className={cn("glass card", hover && "glass-hover", reveal && "reveal", className)}
      aria-label={ariaLabel}
    >
      {children}
    </Tag>
  );
}
