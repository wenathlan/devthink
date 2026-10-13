/**
 * statusdot.tsx — the engine badge: a lucide status glyph colored by the
 * status tokens plus the label (i10 — never a dot character, never a bare
 * colored disc). The surface contract: 4px corners on the chip, hairline
 * edge over currentColor, the glyph inheriting the .badge tone color so
 * the wave-2 CSS keeps grading every state from one ladder. The former
 * `pulse` prop is retired with the infinite loops
 * (x12): the badge is a static state mark. Non-interactive — the focus
 * ring pass targets the focusable surfaces around it.
 */
import { Check, Circle, CircleX, Info, TriangleAlert } from "lucide-react";

type StatusTone = "default" | "success" | "error" | "warning" | "info";

/** the lucide glyph per status tone (i10): colored through currentColor by
 * the .badge tone classes (--ok/--warn/--err/--info), never a dot */
const TONE_GLYPH: Record<StatusTone, typeof Circle> = {
  default: Circle,
  success: Check,
  error: CircleX,
  warning: TriangleAlert,
  info: Info,
};

export function StatusDot({
  label,
  tone = "success",
}: {
  label: string;
  tone?: StatusTone;
  /** retired with the ping loops (x12): accepted for call-site
   * compatibility, never rendered */
  pulse?: boolean;
}) {
  const Glyph = TONE_GLYPH[tone];
  const cls =
    tone === "success" || tone === "error" || tone === "warning" || tone === "info" ? `badge ${tone}` : "badge";
  return (
    <span className={cls} role="status" data-tone={tone}>
      <Glyph size={11} strokeWidth={1.75} aria-hidden="true" />
      {label}
    </span>
  );
}
