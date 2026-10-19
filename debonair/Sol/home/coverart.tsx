// the debonair cover plate.
/**
 * coverart.tsx — the deterministic cover plate of a take: one integer hash
 * walked over the track name (the same walk the library sparkbar uses) picks
 * one of four brass plates — bars, rings, wave, grid — and the plate accent.
 * No randomness, no images, no fake data: the same name always draws the same
 * cover, on the landing grid and in the library rows alike. Presentation
 * only: the component renders a decorative svg (aria-hidden), the track name
 * always sits beside it as real text.
 *
 * The plate material (the vinyl pass): the deep floor is a two-stop charcoal
 * gradient with the record-groove hairlines turning around the plate center,
 * the brass glow lands from one corner, a top edge-light and a bottom
 * vignette close the plate, and the motif itself rides a brass gradient with
 * its mirrored ghost under the baseline — the album-cover quality the suno
 * grid asks, still zero image files.
 */
import { useId } from "react";

/** the brass family of the plates (the debonair identity, 90/10 signal) */
const PLATE_BRASS = "#d9962e";
const PLATE_EMBER = "#c47f1a";
const PLATE_GOLD = "#f0c976";
const PLATE_SOFT = "#e8ad55";
/** the charcoal floor the plates sit on (the theme surface) */
const PLATE_FLOOR_A = "#0e0c07";
const PLATE_FLOOR_B = "#1b160c";
/** the hairline frame of the plate */
const PLATE_EDGE = "rgb(217 150 46 / 0.28)";
/** the groove hairline of the vinyl pass (ink mixed over the floor) */
const PLATE_GROOVE = "rgb(240 201 118 / 0.07)";

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
  const safeId = uid.replace(/[^a-zA-Z0-9-]/g, "");
  const glowId = `dbn-cv${safeId}`;
  const motifId = `dbn-mt${safeId}`;
  const floorId = `dbn-fl${safeId}`;
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
        <radialGradient id={glowId} cx={gx} cy={gy} r="0.78">
          <stop offset="0" stopColor={accent} stopOpacity=".55" />
          <stop offset="0.55" stopColor={accent} stopOpacity=".18" />
          <stop offset="1" stopColor={accent} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={floorId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={PLATE_FLOOR_B} />
          <stop offset="1" stopColor={PLATE_FLOOR_A} />
        </linearGradient>
        <linearGradient id={motifId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={PLATE_GOLD} />
          <stop offset="1" stopColor={accent} />
        </linearGradient>
        <linearGradient id={`${motifId}-v`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="rgb(0 0 0 / 0)" />
          <stop offset="0.62" stopColor="rgb(0 0 0 / 0)" />
          <stop offset="1" stopColor="rgb(0 0 0 / 0.34)" />
        </linearGradient>
      </defs>

      {/* the floor: the two-stop charcoal the light lands on */}
      <rect width="96" height="96" fill={`url(#${floorId})`} />
      {/* the brass corner light */}
      <rect width="96" height="96" fill={`url(#${glowId})`} />
      {/* the vinyl pass: the record grooves turning around the plate center */}
      <g fill="none" stroke={PLATE_GROOVE}>
        <circle cx="48" cy="48" r="14" strokeWidth="0.6" />
        <circle cx="48" cy="48" r="22" strokeWidth="0.6" />
        <circle cx="48" cy="48" r="30" strokeWidth="0.6" />
        <circle cx="48" cy="48" r="38" strokeWidth="0.6" />
        <circle cx="48" cy="48" r="46" strokeWidth="0.6" />
      </g>

      {variant === 0 && (
        <g>
          {bars.map((bar) => (
            <g key={`cv-b${bar.left}`}>
              <rect
                x={bar.left}
                y={80 - bar.height}
                width="8"
                height={bar.height}
                rx="4"
                fill={`url(#${motifId})`}
                opacity={0.55 + (bar.left - 17) / 160}
              />
              {/* the mirrored ghost under the baseline — the studio floor reflection */}
              <rect
                x={bar.left}
                y={81}
                width="8"
                height={Math.max(bar.height * 0.22, 4)}
                rx="4"
                fill={accent}
                opacity="0.14"
              />
            </g>
          ))}
        </g>
      )}

      {variant === 1 && (
        <g fill="none" stroke={`url(#${motifId})`}>
          <circle cx="48" cy="48" r="12" strokeWidth="5" opacity=".85" />
          <circle cx="48" cy="48" r="25" strokeWidth="2.5" opacity=".45" />
          <circle cx="48" cy="48" r="37" strokeWidth="1.5" opacity=".26" />
          <circle cx="48" cy="48" r="43.5" strokeWidth="0.8" opacity=".16" />
          <circle cx="48" cy="48" r="3" fill={accent} stroke="none" opacity=".9" />
        </g>
      )}

      {variant === 2 && (
        <>
          <path
            d={wave}
            fill="none"
            stroke={`url(#${motifId})`}
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d={wave} fill="none" stroke={accent} strokeWidth="11" strokeLinecap="round" opacity=".16" />
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
              fill={dot.on ? accent : PLATE_GROOVE}
              opacity={dot.on ? 0.9 : 0.5}
            />
          ))}
        </g>
      )}

      {/* the vignette closes the plate to the floor */}
      <rect width="96" height="96" fill={`url(#${motifId}-v)`} />
      {/* the top edge-light the brass breathes on */}
      <rect x=".5" y=".5" width="95" height="95" rx="7" fill="none" stroke={PLATE_EDGE} />
      <rect x="1.5" y="1.5" width="93" height="93" rx="6" fill="none" stroke="rgb(240 201 118 / 0.1)" />
    </svg>
  );
}
