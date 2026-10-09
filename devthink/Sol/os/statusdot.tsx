/**
 * statusdot.tsx — the engine badge with the pulsing dot (semantic
 * states). The surface contract: 4px corners on the chip, hairline edge
 * over currentColor, the dot a flat 6px disc (the glow leaves) and the
 * `data-tone` hook so the wave-2 CSS can grade every state from one
 * ladder. Non-interactive — the focus ring pass targets the focusable
 * surfaces around it.
 */
export function StatusDot({
  label,
  tone = "success",
  pulse = true,
}: {
  label: string;
  tone?: "default" | "success" | "error" | "warning" | "info";
  pulse?: boolean;
}) {
  const cls =
    tone === "success" || tone === "error" || tone === "warning" || tone === "info" ? `badge ${tone}` : "badge";
  return (
    <span className={cls} role="status" data-tone={tone}>
      <span className={pulse ? "dot" : undefined} aria-hidden="true" />
      {label}
    </span>
  );
}
