/**
 * solbot.icon.tsx — the chat subapp mascot: a small solar disc drawn in
 * currentColor with an amber core. One glyph, no animation, no decorative
 * dot language — the corona rays and the core carry the whole mark. Used
 * by the rail brand, the session panel and the assistant avatar.
 */

/** SolBotIcon — the Sol assistant mark (stroke = currentColor, core = signal). */
export function SolBotIcon({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {/* corona rays: eight strokes around the disc, hand-set on the 45° grid */}
      <path
        d="M21 12h2M18.36 18.36l1.42 1.42M12 21v2M5.64 18.36l-1.42 1.42M3 12H1M5.64 5.64L4.22 4.22M12 3V1M18.36 5.64l1.42-1.42"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      {/* disc rim */}
      <circle cx="12" cy="12" r="6.4" stroke="currentColor" strokeWidth="1.7" />
      {/* amber core */}
      <circle cx="12" cy="12" r="3.1" fill="var(--sol-primary)" />
    </svg>
  );
}
