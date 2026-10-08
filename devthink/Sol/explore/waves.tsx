/**
 * waves.tsx — the hero waves of the landing: smooth saddle-grade curves as
 * one inline SVG (the doctrine: images and textures inline, no asset folder).
 * Four translucent paths ride one another over the mica floor, each with its
 * own gradient and drift timing; reduced motion freezes the drift.
 */
export function HeroWaves() {
  return (
    <svg
      className="dt-waves"
      viewBox="0 0 1440 340"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="dt-wave-a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4cc2ff" stopOpacity=".16" />
          <stop offset="1" stopColor="#4cc2ff" stopOpacity=".02" />
        </linearGradient>
        <linearGradient id="dt-wave-b" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#bb9cf4" stopOpacity=".12" />
          <stop offset="1" stopColor="#64c8bb" stopOpacity=".03" />
        </linearGradient>
        <linearGradient id="dt-wave-c" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ff5f00" stopOpacity=".1" />
          <stop offset="1" stopColor="#ff5f00" stopOpacity=".02" />
        </linearGradient>
        <linearGradient id="dt-wave-d" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity=".05" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        className="dt-waves__path dt-waves__path--a"
        d="M0,190 C180,120 360,250 560,210 C760,170 880,70 1080,96 C1240,117 1360,180 1440,160 L1440,340 L0,340 Z"
        fill="url(#dt-wave-a)"
      />
      <path
        className="dt-waves__path dt-waves__path--b"
        d="M0,240 C220,180 420,290 660,250 C900,210 1040,130 1220,150 C1330,162 1400,190 1440,186 L1440,340 L0,340 Z"
        fill="url(#dt-wave-b)"
      />
      <path
        className="dt-waves__path dt-waves__path--c"
        d="M0,286 C260,240 480,320 720,292 C960,264 1120,206 1440,238 L1440,340 L0,340 Z"
        fill="url(#dt-wave-c)"
      />
      <path
        className="dt-waves__path dt-waves__path--d"
        d="M0,150 C240,96 420,190 640,160 C860,130 1060,60 1440,110 L1440,340 L0,340 Z"
        fill="url(#dt-wave-d)"
      />
    </svg>
  );
}
