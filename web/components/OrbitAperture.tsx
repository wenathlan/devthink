/** Style: DevThink Orbital Signal Room — original low-motion SVG aperture for local entry and empty workspace states. */
export function OrbitAperture() {
  return (
    <svg className="orbit-aperture" viewBox="0 0 960 700" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="orbit-edge" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff6a00" />
          <stop offset="1" stopColor="#78a9ff" />
        </linearGradient>
        <filter id="orbit-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <path className="orbit-aperture__mass" d="M139 101h236c41 0 75 34 75 75v67c0 18 14 32 32 32h74c41 0 75 34 75 75v173c0 41-34 75-75 75H320c-41 0-75-34-75-75V416c0-18-14-32-32-32h-74c-41 0-75-34-75-75V176c0-41 34-75 75-75Z" />
      <path className="orbit-aperture__line" d="M73 367c74-102 167-153 279-153 146 0 251 87 344 87 66 0 121-28 163-84" />
      <path className="orbit-aperture__line orbit-aperture__line--secondary" d="M113 491c103 51 199 58 288 21 116-48 203-152 322-152 62 0 116 20 162 60" />
      <circle className="orbit-aperture__node" cx="450" cy="242" r="8" />
      <circle className="orbit-aperture__node orbit-aperture__node--blue" cx="605" cy="348" r="6" />
    </svg>
  );
}
