// the debonair cover plate.
/**
 * coverart.tsx — the deterministic cover plate of a take: one integer hash
 * walked over the track name (the same walk the library sparkbar uses) picks
 * one of four brass plates — bars, rings, wave, grid — and the plate accent.
 * No randomness, no images, no fake data: the same name always draws the same
 * cover, on the landing rail and in the library rows alike. Presentation
 * only: the component renders a decorative svg (aria-hidden), the track name
 * always sits beside it as real text.
 */
import { useId } from "react";

/** the brass family of the plates (the debonair identity, 90/10 signal) */
const PLATE_BRASS = "#d9962e";
const PLATE_EMBER = "#c47f1a";
const PLATE_GOLD = "#f0c976";
const PLATE_SOFT = "#e8ad55";
/** the charcoal floor the plates sit on (the theme surface) */
const PLATE_FLOOR = "#14110a";
/** the hairline frame of the plate */
const PLATE_EDGE = "rgb(217 150 46 / 0.28)";

/**
 * Walks the name into a stable integer (the sparkbar walk).
 *
 * @param name the track name.
 * @returns the hash of the name.
 */
export function coverHash(name: string): number {
  let hash = 7;
  for (let index = 0; index < name.length; index += 1) {
    hash = (hash * 31 + name.charCodeAt(index)) % 100003;
  }
  return hash;
}

/**
 * CoverArt — the deterministic cover plate of a take.
 *
 * @param name the track name (the hash seed).
 * @returns the cover svg element.
 */
export function CoverArt({ name }: { name: string }) {
  const uid = useId();
  const hash = coverHash(name);
  const accents = [PLATE_BRASS, PLATE_EMBER, PLATE_GOLD, PLATE_SOFT];
  const accent = accents[Math.floor(hash / 4) % 4];
  const variant = hash % 4;
  const glowId = `dbn-cv${uid}`;
  // the warm light source of the plate sits on one of the four corners
  const corners: readonly [number, number][] = [
    [0.26, 0.22],
    [0.74, 0.22],
    [0.26, 0.78],
    [0.74, 0.78],
  ];
  const [gx, gy] = corners[Math.floor(hash / 16) % 4];

  // the five bars of the "bars" plate: heights walked from the hash
  const bars: { left: number; height: number }[] = [];
  if (variant === 0) {
    let seed = hash;
    for (let index = 0; index < 5; index += 1) {
      seed = (seed * 137 + 71) % 100003;
      bars.push({ left: 17 + index * 13.5, height: 16 + (seed % 48) });
    }
  }

  // the wave of the "wave" plate: nine points, one path
  let wave = "";
  if (variant === 2) {
    let seed = hash;
    for (let index = 0; index <= 8; index += 1) {
      seed = (seed * 137 + 71) % 100003;
      const y = 48 + ((seed % 44) - 22);
      wave += `${index === 0 ? "M" : "L"}${8 + index * 10} ${y} `;
    }
  }

  // the lit dots of the "grid" plate: one boolean per 4×4 cell
  const dots: { cx: number; cy: number; on: boolean }[] = [];
  if (variant === 3) {
    let seed = hash;
    for (let index = 0; index < 16; index += 1) {
      seed = (seed * 137 + 71) % 100003;
      dots.push({ cx: 20 + (index % 4) * 18.5, cy: 20 + Math.floor(index / 4) * 18.5, on: seed % 100 < 42 });
    }
  }

  return (
    <svg viewBox="0 0 96 96" aria-hidden="true" focusable="false" className="coverart">
      <defs>
        <radialGradient id={glowId} cx={gx} cy={gy} r="0.72">
          <stop offset="0" stopColor={accent} stopOpacity=".52" />
          <stop offset="1" stopColor={accent} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="96" height="96" fill={PLATE_FLOOR} />
      <rect width="96" height="96" fill={`url(#${glowId})`} />

      {variant === 0 && (
        <g>
          {bars.map((bar) => (
            <rect
              key={`cv-b${bar.left}`}
              x={bar.left}
              y={80 - bar.height}
              width="8"
              height={bar.height}
              rx="4"
              fill={accent}
              opacity={0.5 + (bar.left - 17) / 135}
            />
          ))}
        </g>
      )}

      {variant === 1 && (
        <g fill="none" stroke={accent}>
          <circle cx="48" cy="48" r="12" strokeWidth="5" opacity=".8" />
          <circle cx="48" cy="48" r="25" strokeWidth="2.5" opacity=".42" />
          <circle cx="48" cy="48" r="37" strokeWidth="1.5" opacity=".24" />
        </g>
      )}

      {variant === 2 && (
        <>
          <path d={wave} fill="none" stroke={accent} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <path d={wave} fill="none" stroke={accent} strokeWidth="11" strokeLinecap="round" opacity=".18" />
        </>
      )}

      {variant === 3 && (
        <g>
          {dots.map((dot) => (
            <circle
              key={`cv-d${dot.cx}-${dot.cy}`}
              cx={dot.cx}
              cy={dot.cy}
              r={dot.on ? 4 : 2}
              fill={accent}
              opacity={dot.on ? 0.85 : 0.22}
            />
          ))}
        </g>
      )}

      <rect x=".5" y=".5" width="95" height="95" rx="7" fill="none" stroke={PLATE_EDGE} />
    </svg>
  );
}
