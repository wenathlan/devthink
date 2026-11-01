/**
 * saaskit.tsx — the surface kit of the SaaS face: the studio tile marks
 * and the saddle bridges that stitch the header, the rail and the section
 * heads into the palco. Presentation only — every shape here is the
 * approved look of the landing, no state, no fetch.
 */

/** The studio ids the tile marks draw. */
export type studiomarkid = "cadria" | "debonair" | "saddle" | "getry" | "vault" | "doo";

/** The tile mark of one studio: the rounded gradient tile the reference
 * landing approved, drawn inline so no asset folder ever exists. */
export function Studiomark({ app, className = "w-11 h-11" }: { app: studiomarkid; className?: string }) {
  if (app === "cadria")
    return (
      <svg viewBox="0 0 120 120" className={`${className} select-none overflow-visible`} aria-hidden="true">
        <defs>
          <linearGradient id="dtcadtile" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#E2E8F2" />
          </linearGradient>
          <linearGradient id="dtcadbk" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#22D3EE" />
          </linearGradient>
        </defs>
        <rect
          x="4"
          y="4"
          width="112"
          height="112"
          rx="28"
          fill="url(#dtcadtile)"
          stroke="rgba(15,23,42,0.12)"
          strokeWidth="2"
        />
        <ellipse cx="60" cy="102" rx="30" ry="6" fill="#0F172A" opacity="0.1" />
        <path
          d="M54 22 L90 77 C93 82 89 88 83 88 L27 88 C21 88 17 82 20 77 Z"
          fill="url(#dtcadbk)"
          transform="rotate(32 60 58)"
        />
        <path
          d="M30 35 L88 35 C94 35 97 41 94 46 L65 94 C62 99 55 99 52 94 L25 46 C22 41 25 35 30 35 Z"
          fill="#FFFFFF"
          stroke="rgba(15,23,42,0.16)"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M54 52 L68 60 L54 68 Z" fill="url(#dtcadbk)" />
      </svg>
    );
  if (app === "debonair")
    return (
      <svg viewBox="0 0 120 120" className={`${className} select-none overflow-visible`} aria-hidden="true">
        <defs>
          <linearGradient id="dtdebtile" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#E2E8F2" />
          </linearGradient>
          <radialGradient id="dtdebo" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="25%" stopColor="#FFE4E6" />
            <stop offset="55%" stopColor="#FB7185" />
            <stop offset="100%" stopColor="#F97316" />
          </radialGradient>
        </defs>
        <rect
          x="4"
          y="4"
          width="112"
          height="112"
          rx="28"
          fill="url(#dtdebtile)"
          stroke="rgba(15,23,42,0.12)"
          strokeWidth="2"
        />
        <ellipse cx="60" cy="102" rx="30" ry="6" fill="#0F172A" opacity="0.1" />
        <circle cx="60" cy="60" r="30" fill="url(#dtdebo)" stroke="#FFFFFF" strokeWidth="2" />
        <circle cx="50" cy="46" r="5" fill="#FFFFFF" opacity="0.8" />
        <g fill="#FFFFFF">
          <ellipse cx="51" cy="74" rx="7" ry="5.5" />
          <ellipse cx="67" cy="71" rx="7" ry="5.5" />
          <rect x="56.5" y="50" width="3.5" height="22" rx="1.5" />
          <rect x="64" y="48" width="10" height="3.5" rx="1.5" />
          <rect x="72" y="48" width="3.5" height="21" rx="1.5" />
        </g>
      </svg>
    );
  if (app === "saddle")
    return (
      <svg viewBox="0 0 120 120" className={`${className} select-none overflow-visible`} aria-hidden="true">
        <defs>
          <linearGradient id="dtsadtile" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#E2E8F2" />
          </linearGradient>
          <radialGradient id="dtsado" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="25%" stopColor="#D1FAE5" />
            <stop offset="55%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#0EA5E9" />
          </radialGradient>
        </defs>
        <rect
          x="4"
          y="4"
          width="112"
          height="112"
          rx="28"
          fill="url(#dtsadtile)"
          stroke="rgba(15,23,42,0.12)"
          strokeWidth="2"
        />
        <ellipse cx="60" cy="102" rx="30" ry="6" fill="#0F172A" opacity="0.1" />
        <circle cx="60" cy="60" r="30" fill="url(#dtsado)" stroke="#FFFFFF" strokeWidth="2" />
        <circle cx="50" cy="46" r="5" fill="#FFFFFF" opacity="0.8" />
        <path
          d="M46 62 L60 50 L74 62"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M46 74 L60 62 L74 74"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  if (app === "getry")
    return (
      <svg viewBox="0 0 120 120" className={`${className} select-none overflow-visible`} aria-hidden="true">
        <defs>
          <linearGradient id="dtgettile" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#E2E8F2" />
          </linearGradient>
          <radialGradient id="dtgeto" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="25%" stopColor="#EDE9FE" />
            <stop offset="55%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#22D3EE" />
          </radialGradient>
        </defs>
        <rect
          x="4"
          y="4"
          width="112"
          height="112"
          rx="28"
          fill="url(#dtgettile)"
          stroke="rgba(15,23,42,0.12)"
          strokeWidth="2"
        />
        <ellipse cx="60" cy="102" rx="30" ry="6" fill="#0F172A" opacity="0.1" />
        <circle cx="60" cy="60" r="30" fill="url(#dtgeto)" stroke="#FFFFFF" strokeWidth="2" />
        <circle cx="50" cy="46" r="5" fill="#FFFFFF" opacity="0.8" />
        <circle cx="60" cy="60" r="17" fill="none" stroke="#FFFFFF" strokeWidth="4" opacity="0.9" />
        <path
          d="M60 49 C61.5 55.5 63.5 57.5 70 59 C63.5 60.5 61.5 62.5 60 69 C58.5 62.5 56.5 60.5 50 59 C56.5 57.5 58.5 55.5 60 49 Z"
          fill="#FFFFFF"
        />
      </svg>
    );
  if (app === "vault")
    return (
      <svg viewBox="0 0 120 120" className={`${className} select-none overflow-visible`} aria-hidden="true">
        <defs>
          <linearGradient id="dtvlttile" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#E2E8F2" />
          </linearGradient>
          <radialGradient id="dtvlto" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="25%" stopColor="#FEF9C3" />
            <stop offset="55%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#FB923C" />
          </radialGradient>
        </defs>
        <rect
          x="4"
          y="4"
          width="112"
          height="112"
          rx="28"
          fill="url(#dtvlttile)"
          stroke="rgba(15,23,42,0.12)"
          strokeWidth="2"
        />
        <ellipse cx="60" cy="102" rx="30" ry="6" fill="#0F172A" opacity="0.1" />
        <circle cx="60" cy="60" r="30" fill="url(#dtvlto)" stroke="#FFFFFF" strokeWidth="2" />
        <circle cx="50" cy="46" r="5" fill="#FFFFFF" opacity="0.8" />
        <path d="M60 48 L73 61 L60 76 L47 61 Z" fill="#FFFFFF" />
        <circle cx="60" cy="61" r="4" fill="#F59E0B" />
      </svg>
    );
  return (
    <svg viewBox="0 0 120 120" className={`${className} select-none overflow-visible`} aria-hidden="true">
      <defs>
        <linearGradient id="dtdootile" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E2E8F2" />
        </linearGradient>
        <radialGradient id="dtdooo" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="35%" stopColor="#E0E7FF" />
          <stop offset="65%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#F97316" />
        </radialGradient>
      </defs>
      <rect
        x="4"
        y="4"
        width="112"
        height="112"
        rx="28"
        fill="url(#dtdootile)"
        stroke="rgba(15,23,42,0.12)"
        strokeWidth="2"
      />
      <ellipse cx="60" cy="102" rx="30" ry="6" fill="#0F172A" opacity="0.12" />
      <circle cx="60" cy="58" r="30" fill="url(#dtdooo)" stroke="#FFFFFF" strokeWidth="2.5" />
      <circle cx="50" cy="44" r="6" fill="#FFFFFF" opacity="0.5" />
      <rect x="46" y="50" width="10" height="18" rx="5" transform="rotate(-8 51 59)" fill="#0F172A" />
      <rect x="64" y="50" width="10" height="18" rx="5" transform="rotate(8 69 59)" fill="#0F172A" />
    </svg>
  );
}

type BridgeProps = { fillColor: string; children: React.ReactNode; className?: string };

/** The horizontal saddle bridge: the tab header stitched into the section
 * edge with the scooped wings. */
export function SaddleTabBridge({ fillColor, children, className = "" }: BridgeProps) {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        className="pointer-events-none h-full w-[56px] -mr-[1px] shrink-0 select-none sm:w-[76px]"
        viewBox="0 0 76 60"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden="true"
      >
        <path d="M0 0 H76 V60 C36 60 40 0 0 0 Z" fill={fillColor} />
      </svg>
      <div
        style={{ backgroundColor: fillColor }}
        className="flex h-full items-center justify-center px-4 pt-1.5 pb-2 sm:px-6"
      >
        {children}
      </div>
      <svg
        className="pointer-events-none h-full w-[56px] -ml-[1px] shrink-0 select-none sm:w-[76px]"
        viewBox="0 0 76 60"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden="true"
      >
        <path d="M76 0 H0 V60 C40 60 36 0 76 0 Z" fill={fillColor} />
      </svg>
    </div>
  );
}

/** The vertical saddle bridge of the left rail — the snug fitted curve
 *  the owner pinned again: the sweep hugs the spine the whole way and
 *  flares to the body edge only in the last crisp moment (bem mais
 *  ajustadinha), never the wide quarter-pipe and never the long diagonal
 *  shoulder of the first fluent cut. */
export function VerticalSaddleBridge({ fillColor, children, className = "" }: BridgeProps) {
  return (
    <div className={`relative inline-flex flex-col items-center justify-center ${className}`}>
      <svg
        className="pointer-events-none -mb-[1px] h-[40px] w-full shrink-0 select-none"
        viewBox="0 0 56 76"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden="true"
      >
        <path d="M0 0 V76 H56 C10 58 4 30 0 0 Z" fill={fillColor} />
      </svg>
      <div
        style={{ backgroundColor: fillColor }}
        className="flex w-full flex-col items-center justify-center px-1.5 py-2"
      >
        {children}
      </div>
      <svg
        className="pointer-events-none -mt-[1px] h-[40px] w-full shrink-0 select-none"
        viewBox="0 0 56 76"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden="true"
      >
        <path d="M0 76 V0 H56 C10 18 4 46 0 76 Z" fill={fillColor} />
      </svg>
    </div>
  );
}
