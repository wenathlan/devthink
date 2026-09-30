/**
 * status.dot.tsx — the engine badge with the pulsing dot (semantic
 * states).
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
    <span className={cls} role="status">
      <span className={pulse ? "dot" : undefined} aria-hidden="true" />
      {label}
    </span>
  );
}
