/**
 * saaskit.tsx — the surface kit of the SaaS face: the studio tile marks,
 * the scooped card, and the saddle bridges (down and up) that stitch the
 * header, the rail and the section heads into the palco. Presentation
 * only — the scooped card carries its own live measurement so the clip
 * path follows the face, but no fetch, no copy: every shape here is the
 * approved look of the landing restored by PR8 P1.
 */

import { useEffect, useRef, useState } from "react";

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

/** The upward saddle bridge: the same scooped wings rising instead of
 *  falling — the bottom handoff of the workspace section into the studio
 *  flow bed (the reference curve of the fan deck exit). */
export function SaddleTabBridgeUp({ fillColor, children, className = "" }: BridgeProps) {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        className="pointer-events-none -mr-[1px] h-full w-[56px] shrink-0 select-none sm:w-[76px]"
        viewBox="0 0 76 60"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden="true"
      >
        <path d="M0 60 H76 V0 C36 0 40 60 0 60 Z" fill={fillColor} />
      </svg>
      <div style={{ backgroundColor: fillColor }} className="flex h-full items-center justify-center">
        {children}
      </div>
      <svg
        className="pointer-events-none -ml-[1px] h-full w-[56px] shrink-0 select-none sm:w-[76px]"
        viewBox="0 0 76 60"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden="true"
      >
        <path d="M76 60 H0 V0 C40 0 36 60 76 60 Z" fill={fillColor} />
      </svg>
    </div>
  );
}

/** builds the scooped clip path of one card face: the corner radius r, the
 *  scoop fillets rf and the scoop insets ri — the true transparent cutout
 *  of the era (a real clip, never a fake border patch). */
function buildscoopedclip(w: number, h: number, hastr: boolean, trwide: boolean, hasbr: boolean): string {
  if (w <= 0 || h <= 0) return "none";
  const r = 32;
  const rf = 20;
  const ri = 26;
  const trw = trwide ? 108 : 68;
  const trh = 60;
  const brw = 68;
  const brh = 64;
  const c = [`M ${r} 0`];
  if (hastr && w > trw + rf + r) {
    c.push(`L ${w - trw - rf} 0`);
    c.push(`A ${rf} ${rf} 0 0 1 ${w - trw} ${rf}`);
    c.push(`L ${w - trw} ${trh - ri}`);
    c.push(`A ${ri} ${ri} 0 0 0 ${w - trw + ri} ${trh}`);
    c.push(`L ${w - rf} ${trh}`);
    c.push(`A ${rf} ${rf} 0 0 1 ${w} ${trh + rf}`);
  } else {
    c.push(`L ${w - r} 0`);
    c.push(`A ${r} ${r} 0 0 1 ${w} ${r}`);
  }
  if (hasbr && w > brw + rf + r) {
    c.push(`L ${w} ${h - brh - rf}`);
    c.push(`A ${rf} ${rf} 0 0 1 ${w - rf} ${h - brh}`);
    c.push(`L ${w - brw + ri} ${h - brh}`);
    c.push(`A ${ri} ${ri} 0 0 0 ${w - brw} ${h - brh + ri}`);
    c.push(`L ${w - brw} ${h - rf}`);
    c.push(`A ${rf} ${rf} 0 0 1 ${w - brw - rf} ${h}`);
  } else {
    c.push(`L ${w} ${h - r}`);
    c.push(`A ${r} ${r} 0 0 1 ${w - r} ${h}`);
  }
  c.push(`L ${r} ${h}`);
  c.push(`A ${r} ${r} 0 0 1 0 ${h - r}`);
  c.push(`L 0 ${r}`);
  c.push(`A ${r} ${r} 0 0 1 ${r} 0`);
  c.push("Z");
  return `path('${c.join(" ")}')`;
}

type ScoopedCardProps = {
  children: React.ReactNode;
  topRightContent?: React.ReactNode;
  topRightWide?: boolean;
  bottomRightContent?: React.ReactNode;
  surfaceClassName?: string;
  className?: string;
};

/** The true scooped card of the reference landing: a real transparent
 *  cutout via clip path — the corner scoops measured live through a
 *  ResizeObserver so the path follows the card at every width, with the
 *  two dock notches carrying their own floating content. */
export function ScoopedCard({
  children,
  topRightContent,
  topRightWide = false,
  bottomRightContent,
  surfaceClassName = "bg-white",
  className = "",
}: ScoopedCardProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const up = () => {
      const rc = el.getBoundingClientRect();
      setSize({ w: Math.round(rc.width), h: Math.round(rc.height) });
    };
    up();
    const ob = new ResizeObserver(up);
    ob.observe(el);
    window.addEventListener("resize", up);
    return () => {
      ob.disconnect();
      window.removeEventListener("resize", up);
    };
  }, []);
  const clip = buildscoopedclip(size.w, size.h, Boolean(topRightContent), topRightWide, Boolean(bottomRightContent));
  return (
    <div ref={ref} className={`drop-shadow-[0_20px_40px_rgba(15,23,42,0.10)] relative ${className}`}>
      <div
        style={{ clipPath: size.w > 0 ? clip : undefined, WebkitClipPath: size.w > 0 ? clip : undefined }}
        className={`h-full w-full rounded-[32px] ${surfaceClassName}`}
      >
        {children}
      </div>
      {topRightContent ? (
        <div
          className={`absolute top-0 right-0 z-20 flex h-[52px] items-center justify-end gap-2 pr-1.5 pt-1 ${topRightWide ? "w-[100px]" : "w-[60px]"}`}
        >
          {topRightContent}
        </div>
      ) : null}
      {bottomRightContent ? (
        <div className="absolute right-0 bottom-0 z-20 flex h-[56px] w-[60px] items-end justify-end pr-1.5 pb-1">
          {bottomRightContent}
        </div>
      ) : null}
    </div>
  );
}
