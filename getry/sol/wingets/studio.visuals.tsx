import React, { useEffect, useRef, useState } from 'react';
import type { EffortChromaTier } from '../../studio.uiprefs';
import {
  DEVTHINK_HEX_PATH,
  DEVTHINK_STAR_PATH,
  DevThinkWordmark,
} from './studio.icons';

// ============================================================================
// 1. AUTHENTIC DEVTHINK ANSI/ASCII ART FIELD ENGINE
// ============================================================================

export const DevThinkAnsiCanvas: React.FC<{
  engineMode?: boolean;
  pulseTrigger?: number;
  darkMode?: boolean;
  allowCenter?: boolean;
  bottomAnchored?: boolean;
  effortTier?: EffortChromaTier;
  className?: string;
}> = ({
  engineMode = true,
  pulseTrigger = 0,
  darkMode = false,
  allowCenter = true,
  bottomAnchored = false,
  effortTier = 'neutral',
  className = 'pointer-events-none absolute inset-0 z-0 overflow-hidden',
}) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pulseRef = useRef<() => void>(() => {});
  const modeRef = useRef<(m: 'auto' | 'think', tier: EffortChromaTier) => void>(() => {});

  useEffect(() => {
    modeRef.current(engineMode ? 'auto' : 'think', effortTier);
    pulseRef.current();
  }, [engineMode, pulseTrigger, darkMode, effortTier]);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;
    const ctx = canvas.getContext('2d');
    const off = document.createElement('canvas');
    const octx = off.getContext('2d', { willReadFrequently: true });
    if (!ctx || !octx) return;

    const hexPath = typeof Path2D !== 'undefined' ? new Path2D(DEVTHINK_HEX_PATH) : null;
    const starPath = typeof Path2D !== 'undefined' ? new Path2D(DEVTHINK_STAR_PATH) : null;

    const SS = 2;
    const getTierSpec = (tier: EffortChromaTier, mode: 'auto' | 'think') => {
      const tempo = mode === 'think' ? 0.95 : 1.0;
      const size = mode === 'think' ? 1.05 : 1.0;
      if (tier === 'lime') {
        return {
          a: darkMode ? [190, 242, 100] : [101, 163, 13],
          b: darkMode ? [134, 239, 172] : [132, 204, 22],
          tempo,
          size,
          accents: darkMode
            ? ['#bef264', '#a3e635', '#86efac', '#ffffff']
            : ['#65a30d', '#84cc16', '#22c55e', '#4d7c0f'],
        };
      }
      if (tier === 'green') {
        return {
          a: darkMode ? [74, 222, 128] : [21, 128, 61],
          b: darkMode ? [163, 230, 53] : [34, 197, 94],
          tempo,
          size,
          accents: darkMode
            ? ['#4ade80', '#22c55e', '#bef264', '#ffffff']
            : ['#15803d', '#22c55e', '#16a34a', '#4ade80'],
        };
      }
      if (tier === 'azure') {
        return {
          a: darkMode ? [76, 194, 255] : [0, 103, 192],
          b: darkMode ? [163, 215, 230] : [76, 194, 255],
          tempo,
          size,
          accents: darkMode
            ? ['#4cc2ff', '#a3d7e6', '#767676', '#ffffff']
            : ['#0067c0', '#005a9e', '#4cc2ff', '#004578'],
        };
      }
      if (tier === 'chromatic') {
        return {
          a: darkMode ? [125, 211, 252] : [14, 165, 233],
          b: darkMode ? [244, 114, 182] : [76, 194, 255],
          tempo,
          size,
          accents: darkMode
            ? ['#7dd3fc', '#a3d7e6', '#f9a8d4', '#ffffff']
            : ['#0284c7', '#0067c0', '#db2777', '#38bdf8'],
        };
      }
      return {
        a: darkMode ? [232, 232, 236] : [48, 50, 54],
        b: darkMode ? [152, 154, 160] : [116, 118, 124],
        tempo,
        size,
        accents: darkMode
          ? ['#f4f4f5', '#d4d4d8', '#a1a1aa', '#e4e4e7']
          : ['#18181b', '#3f3f46', '#52525b', '#71717a'],
      };
    };

    const initialSpec = getTierSpec(effortTier, engineMode ? 'auto' : 'think');
    let ACCENTS = initialSpec.accents;
    const RAMP = [
      ['/', '\\'],
      ['-', '/'],
      ['~', '-'],
      ['+', '~'],
      ['=', '+'],
      ['*', '='],
      ['^', '*'],
      ['%', '^'],
      ['S', '%'],
      ['X', 'S'],
      ['@', 'X'],
      ['#', '@'],
    ];
    const FONT = '"DM Mono", ui-monospace, "SF Mono", Menlo, Consolas, monospace';

    let W = 0,
      H = 0,
      dpr = 1,
      cw = 9,
      ch = 13,
      cols = 0,
      rows = 0,
      ow = 0,
      oh = 0,
      fs = 10;
    let time = 0,
      last = 0,
      acc = 0,
      raf = 0;
    let boostUntil = 0,
      flickerUntil = 0;

    const clonePal = (p: { a: number[]; b: number[]; tempo: number; size: number }) => ({
      a: p.a.slice(),
      b: p.b.slice(),
      tempo: p.tempo,
      size: p.size,
    });
    let pal = clonePal(initialSpec),
      palFrom = clonePal(initialSpec),
      palTo = clonePal(initialSpec),
      palT = 1,
      palQ = 18;
    const styles = new Map<number, { tile: string; glyph: string }>();

    type AnsiEntityKind = 'devthink' | 'doo-ai' | 'happy-smile' | 'happy-wink';
    interface AnsiEntity {
      kind: AnsiEntityKind;
      anchorX: number;
      anchorY: number;
      x: number;
      y: number;
      R0: number;
      R: number;
      theta: number;
      subTheta: number;
      dissolve: number;
      alpha: number;
      mix: number;
      cycleDur: number;
      phaseOffset: number;
    }

    const entities: AnsiEntity[] = [
      {
        kind: 'happy-smile',
        anchorX: 0.14,
        anchorY: 0.30,
        x: 0,
        y: 0,
        R0: 130,
        R: 130,
        theta: 0,
        subTheta: 0,
        dissolve: 0.55,
        alpha: 0.85,
        mix: 0.2,
        cycleDur: 6.2,
        phaseOffset: 0.05,
      },
      {
        kind: 'doo-ai',
        anchorX: 0.19,
        anchorY: 0.68,
        x: 0,
        y: 0,
        R0: 150,
        R: 150,
        theta: 0,
        subTheta: 0,
        dissolve: 0.45,
        alpha: 0.9,
        mix: 0.35,
        cycleDur: 6.8,
        phaseOffset: 0.42,
      },
      {
        kind: 'devthink',
        anchorX: 0.82,
        anchorY: 0.52,
        x: 0,
        y: 0,
        R0: 210,
        R: 210,
        theta: 0,
        subTheta: 0,
        dissolve: 0.4,
        alpha: 0.95,
        mix: 0.72,
        cycleDur: 5.8,
        phaseOffset: 0.2,
      },
      {
        kind: 'happy-wink',
        anchorX: 0.85,
        anchorY: 0.26,
        x: 0,
        y: 0,
        R0: 125,
        R: 125,
        theta: 0,
        subTheta: 0,
        dissolve: 0.5,
        alpha: 0.85,
        mix: 0.84,
        cycleDur: 6.4,
        phaseOffset: 0.68,
      },
      {
        kind: 'doo-ai',
        anchorX: 0.5,
        anchorY: 0.25,
        x: 0,
        y: 0,
        R0: 140,
        R: 140,
        theta: 0,
        subTheta: 0,
        dissolve: 0.62,
        alpha: 0.78,
        mix: 0.52,
        cycleDur: 7.4,
        phaseOffset: 0.82,
      },
    ];

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);
    const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

    function hash(x: number, y: number, t: number) {
      let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(t, 1103515245);
      h = Math.imul(h ^ (h >>> 13), 1274126177);
      h ^= h >>> 16;
      return (h >>> 0) / 4294967296;
    }

    function initEntities() {
      const scaleBase = clamp(Math.min(W, H * 1.45), 420, 1440);
      entities.forEach((ent, idx) => {
        if (ent.kind === 'devthink') {
          ent.R0 = clamp(scaleBase * 0.24, 130, 230);
        } else if (ent.kind === 'doo-ai') {
          ent.R0 = clamp(scaleBase * 0.17, 94, 160);
        } else {
          ent.R0 = clamp(scaleBase * 0.15, 84, 140);
        }
        ent.R = ent.R0 * pal.size;
        if (bottomAnchored) {
          const bottomAnchors = [
            { x: 0.12, y: 0.62 },
            { x: 0.30, y: 0.72 },
            { x: 0.78, y: 0.64 },
            { x: 0.90, y: 0.58 },
            { x: 0.50, y: 0.74 },
          ];
          const pos = bottomAnchors[idx % bottomAnchors.length];
          ent.anchorX = pos.x;
          ent.anchorY = pos.y;
        }
        ent.x = W * ent.anchorX;
        ent.y = H * ent.anchorY;
      });
    }

    function step(dt: number) {
      time += dt;
      if (palT < 1) {
        palT = Math.min(1, palT + dt / 0.8);
        const q = Math.round(palT * 18);
        if (q !== palQ) {
          palQ = q;
          const t = ease(q / 18);
          pal = {
            a: palFrom.a.map((v, i) => lerp(v, palTo.a[i], t)),
            b: palFrom.b.map((v, i) => lerp(v, palTo.b[i], t)),
            tempo: lerp(palFrom.tempo, palTo.tempo, t),
            size: lerp(palFrom.size, palTo.size, t),
          };
          styles.clear();
        }
      }

      entities.forEach((ent, idx) => {
        const totalCycles = (time * pal.tempo) / ent.cycleDur + ent.phaseOffset;
        const cycleIdx = Math.floor(totalCycles);
        const phase = totalCycles - cycleIdx;

        const rawForm = Math.sin(phase * Math.PI);
        const formation = Math.pow(rawForm, 1.45);

        ent.dissolve = clamp(0.9 - formation * 0.64, 0.24, 0.9);
        ent.alpha = clamp(Math.pow(rawForm, 0.85) * 1.15, 0.05, 0.96);

        let baseX = W * ent.anchorX;
        let baseY = H * ent.anchorY;

        if (bottomAnchored) {
          if (ent.kind === 'devthink') {
            const sideSwap = cycleIdx % 2 === 0 ? 1 : -1;
            baseX = sideSwap > 0 ? W * 0.80 : W * 0.20;
            baseY = H * 0.66;
          } else if (idx === 4) {
            const u = Math.sin(time * 0.36 + idx);
            baseX = W * 0.5 + u * (W * 0.24);
            baseY = H * 0.74 + u * u * (H * 0.06);
          }
        } else if (ent.kind === 'devthink') {
          const sideSwap = cycleIdx % 2 === 0 ? 1 : -1;
          baseX = sideSwap > 0 ? W * 0.82 : W * 0.18;
          baseY = sideSwap > 0 ? H * 0.54 : H * 0.46;
        } else if (ent.anchorX === 0.5) {
          const u = Math.sin(time * 0.36 + idx);
          baseX = W * 0.5 + u * (W * 0.26);
          baseY = H * 0.28 + u * u * (H * 0.12);
        }

        const driftX = Math.sin(time * 0.55 + idx * 1.7) * (W * 0.022);
        const driftY = bottomAnchored
          ? Math.cos(time * 0.62 + idx * 1.3) * (H * 0.03)
          : Math.cos(time * 0.68 + idx * 1.3) * (H * 0.026) - formation * 14;
        ent.x = baseX + driftX;
        ent.y = baseY + driftY;

        ent.theta =
          Math.sin(time * 0.52 + idx) * 0.22 * (0.4 + ent.dissolve) +
          (1 - formation) * (idx % 2 === 0 ? -0.18 : 0.18);
        ent.subTheta = -ent.theta * 0.75 + Math.cos(time * 0.74 + idx) * 0.2;
        ent.R = ent.R0 * pal.size * (0.92 + ent.dissolve * 0.24);
        ent.mix = clamp(
          (ent.x / Math.max(1, W)) * 0.75 + 0.2 * Math.sin(time * 0.6 + idx),
          0.08,
          0.92
        );
      });
    }

    function col(m: number, k: number, w: number) {
      return `rgb(${Math.min(255, (1 - m) * k * 255) | 0},${
        Math.min(255, w * 255) | 0
      },${Math.min(255, m * k * 255) | 0})`;
    }

    function drawDooAiSymbol(ent: AnsiEntity, k: number) {
      if (!octx) return;
      const r = ent.R * 0.78;
      const d = ent.dissolve;
      const m = ent.mix;
      const wobble = d * r * 0.22;

      octx.save();
      octx.translate(ent.x, ent.y);
      octx.rotate(ent.theta);
      octx.lineCap = 'round';
      octx.lineJoin = 'round';

      octx.lineWidth = Math.max(6, r * (0.14 + d * 0.16));
      octx.strokeStyle = col(m, k * 0.82, 0.26 * k);
      octx.beginPath();
      octx.arc(0, 0, r * 0.88, -0.35 + d * 0.4, Math.PI * 1.65 - d * 0.3);
      octx.stroke();

      octx.lineWidth = Math.max(7, r * 0.18);
      octx.strokeStyle = col(1 - m * 0.3, k * 1.05, 0.64 * k);
      octx.beginPath();
      octx.arc(-r * 0.28, -r * 0.16, r * 0.14, 0, Math.PI * 2);
      octx.stroke();

      octx.beginPath();
      octx.arc(r * 0.28, -r * 0.16, r * 0.14, 0, Math.PI * 2);
      octx.stroke();

      octx.lineWidth = Math.max(5, r * 0.13);
      octx.strokeStyle = col(m, k * 0.92, 0.48 * k);
      octx.beginPath();
      octx.arc(0, r * 0.12 + wobble * 0.3, r * 0.36, 0.22 * Math.PI, 0.78 * Math.PI);
      octx.stroke();

      octx.restore();
    }

    function drawHappyFace(ent: AnsiEntity, k: number, wink: boolean) {
      if (!octx) return;
      const r = ent.R * 0.76;
      const d = ent.dissolve;
      const m = ent.mix;
      const drift = d * r * 0.26;

      octx.save();
      octx.translate(ent.x, ent.y);
      octx.rotate(ent.theta);
      octx.lineCap = 'round';
      octx.lineJoin = 'round';

      octx.lineWidth = Math.max(5, r * (0.11 + d * 0.14));
      octx.strokeStyle = col(m, k * 0.66, 0.22 * k);
      octx.beginPath();
      octx.arc(0, 0, r, 0.15 + d * 0.35, Math.PI * 1.75 - d * 0.25);
      octx.stroke();

      octx.lineWidth = Math.max(7, r * 0.18);
      octx.strokeStyle = col(1 - m * 0.35, k * 1.05, 0.64 * k);
      const lx = -r * 0.34 - Math.cos(time * 1.9) * drift * 0.45;
      const ly = -r * 0.18 - Math.sin(time * 1.7) * drift * 0.45;
      octx.beginPath();
      octx.arc(lx, ly + r * 0.08, r * 0.16, Math.PI * 1.15, Math.PI * 1.85);
      octx.stroke();

      const rx = r * 0.34 + Math.sin(time * 1.8) * drift * 0.45;
      const ry = -r * 0.18 + Math.cos(time * 1.6) * drift * 0.45;
      octx.beginPath();
      if (wink) {
        octx.moveTo(rx - r * 0.15, ry);
        octx.quadraticCurveTo(rx, ry - r * 0.16, rx + r * 0.15, ry + r * 0.02);
      } else {
        octx.arc(rx, ry + r * 0.08, r * 0.16, Math.PI * 1.15, Math.PI * 1.85);
      }
      octx.stroke();

      octx.lineWidth = Math.max(8, r * (0.17 + d * 0.08));
      octx.strokeStyle = col(1 - m * 0.25, k * 1.08, 0.66 * k);
      octx.beginPath();
      octx.arc(
        Math.sin(time * 1.3) * drift * 0.3,
        r * 0.04 + Math.cos(time * 1.5) * drift * 0.35,
        r * 0.48,
        0.16 * Math.PI,
        0.84 * Math.PI
      );
      octx.stroke();

      octx.restore();
    }

    function drawDevThinkLogo(ent: AnsiEntity, k: number) {
      if (!octx || !hexPath || !starPath) return;
      const dFactor = ent.dissolve;
      const m = ent.mix;
      const sFactor = (ent.R * 1.68) / 10000000;

      octx.save();
      octx.translate(ent.x, ent.y);
      octx.rotate(ent.theta);
      octx.scale(sFactor, sFactor);
      octx.translate(-5000000, -5000000);

      octx.lineJoin = 'round';
      octx.lineCap = 'round';
      octx.lineWidth = 240000 + dFactor * 740000;
      octx.strokeStyle = col(m, k * 0.65, 0.24 * k);
      octx.stroke(hexPath);

      octx.fillStyle = col(m, k * 0.92, 0.32 * k);
      octx.fill(hexPath);
      octx.restore();

      const starDrift = dFactor * 36;
      octx.save();
      octx.translate(
        ent.x + Math.cos(time * 1.4) * starDrift,
        ent.y + Math.sin(time * 1.15) * starDrift
      );
      octx.rotate(ent.subTheta);
      octx.scale(
        sFactor * (1.0 + 0.07 * dFactor * Math.sin(time * 1.6)),
        sFactor * (1.0 + 0.07 * dFactor * Math.cos(time * 1.6))
      );
      octx.translate(-5000000, -5000000);

      octx.lineJoin = 'round';
      octx.lineCap = 'round';
      octx.lineWidth = 180000 + dFactor * 580000;
      octx.strokeStyle = col(1 - m * 0.4, k * 0.72, 0.3 * k);
      octx.stroke(starPath);

      octx.fillStyle = col(1 - m * 0.4, k * 1.0, 0.56 * k);
      octx.fill(starPath);
      octx.restore();
    }

    function drawField() {
      if (!octx) return;
      octx.setTransform(1, 0, 0, 1, 0, 0);
      octx.globalCompositeOperation = 'source-over';
      octx.fillStyle = '#000';
      octx.fillRect(0, 0, ow, oh);
      octx.setTransform(SS / cw, 0, 0, SS / ch, 0, 0);
      octx.globalCompositeOperation = 'lighter';

      const boostT = time < boostUntil ? (boostUntil - time) / 1.4 : 0;

      for (const ent of entities) {
        if (ent.alpha <= 0.03) continue;
        const k = (0.96 + boostT * 0.35) * ent.alpha * (1.08 - ent.dissolve * 0.32);
        if (ent.kind === 'devthink') {
          drawDevThinkLogo(ent, k);
        } else if (ent.kind === 'doo-ai') {
          drawDooAiSymbol(ent, k);
        } else if (ent.kind === 'happy-smile') {
          drawHappyFace(ent, k, false);
        } else {
          drawHappyFace(ent, k, true);
        }
      }
    }

    function style(tb: number, lv: number, wb: number) {
      const key = (tb * 12 + lv) * 3 + wb + (darkMode ? 1000 : 0);
      let s = styles.get(key);
      if (s) return s;
      const t = tb / 5,
        L = (lv + 0.5) / 12,
        w = [0, 0.25, 0.5][wb];
      const base = [0, 1, 2].map((i) => lerp(pal.a[i], pal.b[i], t));
      const glyph = base.map((v) =>
        clamp(Math.round(lerp(v * (darkMode ? 0.95 : 0.78), darkMode ? 225 : 70, w * 0.42)), 0, 255)
      );
      s = {
        tile: 'transparent',
        glyph: `rgba(${glyph[0]},${glyph[1]},${glyph[2]},${(
          (darkMode ? 0.28 : 0.24) +
          L * (darkMode ? 0.52 : 0.48)
        ).toFixed(3)})`,
      };
      styles.set(key, s);
      return s;
    }

    function render() {
      if (!octx || !ctx || !W || !H || ow <= 0 || oh <= 0) return;
      try {
        drawField();
        const d = octx.getImageData(0, 0, ow, oh).data;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, W, H);
        ctx.font = `600 ${fs}px ${FONT}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const ty = ch / 2 + 0.5,
          tx = cw / 2;

        const tickRate = time < flickerUntil ? 12 : 5.4;
        const row = ow * 4;
        const globalPulseDiss = 0.46 + 0.18 * Math.sin(time * 1.25);

        for (let cy = 0; cy < rows; cy++) {
          const normY = (cy * ch) / H;
          for (let cx = 0; cx < cols; cx++) {
            const normX = (cx * cw) / W;
            if (!allowCenter && normX > 0.2 && normX < 0.8 && normY > 0.14 && normY < 0.86) continue;

            const n1 =
              Math.sin(cx * 0.19 + cy * 0.15 + time * 2.9) +
              0.65 * Math.cos(cy * 0.34 - time * 2.3) +
              0.35 * Math.sin((cx + cy) * 0.27 + time * 3.8);
            const n2 =
              Math.cos(cy * 0.18 - cx * 0.16 + time * 2.6) +
              0.65 * Math.sin(cx * 0.31 + time * 2.2) +
              0.35 * Math.cos((cx - cy) * 0.25 - time * 3.5);
            const maxShift = 2.8 + globalPulseDiss * 11.5;
            const sCx = clamp(Math.round(cx + n1 * maxShift * 0.68), 0, cols - 1);
            const sCy = clamp(Math.round(cy + n2 * maxShift * 0.68), 0, rows - 1);

            const i = (sCy * SS * ow + sCx * SS) * 4;
            const a = (d[i] + d[i + 4] + d[i + row] + d[i + row + 4]) / 1020;
            const w = (d[i + 1] + d[i + 5] + d[i + row + 1] + d[i + row + 5]) / 1020;
            const b = (d[i + 2] + d[i + 6] + d[i + row + 2] + d[i + row + 6]) / 1020;
            const L = Math.min(1, a + b + w * 0.5);
            if (L < 0.035) continue;

            const tick = Math.floor(time * tickRate + ((cx * 7 + cy * 13) & 15) / 16);
            const h = hash(cx, cy, tick);

            const dropoutThreshold =
              0.22 + globalPulseDiss * 0.36 + (L < 0.26 ? 0.18 - L * 0.55 : 0);
            if (h < dropoutThreshold) continue;

            const tb = Math.round((b / (a + b + 1e-4)) * 5);
            const lv = Math.min(11, (L * (1 - globalPulseDiss * 0.2) * 12) | 0);
            const wb = w < 0.12 ? 0 : w < 0.32 ? 1 : 2;
            const st = style(tb, lv, wb);

            const jitterAmp = 0.8 + globalPulseDiss * 2.0;
            const jx = Math.sin(time * 4.3 + cy * 0.7 + cx * 0.3) * jitterAmp;
            const jy = Math.cos(time * 3.9 + cx * 0.6 - cy * 0.4) * jitterAmp;
            const x = cx * cw + jx,
              y = cy * ch + jy;

            ctx.fillStyle =
              lv >= 4 && lv < 10 && h > 0.955 ? ACCENTS[((h * 1e4) | 0) & 3] : st.glyph;
            ctx.fillText(RAMP[lv][h < 0.55 ? 0 : 1], x + tx, y + ty);
          }
        }
      } catch {
        // Ignore transient resize frame errors
      }
    }

    let lastRenderAt = 0;
    let lastRenderCostMs = 0;

    function loop(now: number) {
      raf = requestAnimationFrame(loop);
      if (document.hidden) {
        last = now;
        return;
      }
      if (!last) {
        last = now;
        lastRenderAt = now;
        return;
      }
      const minInterval = Math.max(84, lastRenderCostMs * 2.5);
      if (now - lastRenderAt < minInterval) {
        return;
      }
      const dt = Math.min((now - last) / 1000, 0.14);
      last = now;
      lastRenderAt = now;
      const n = Math.max(1, Math.min(3, Math.round(dt * 24)));
      const h = dt / n;
      for (let i = 0; i < n; i++) step(h);
      acc = 0;
      const t0 = performance.now();
      render();
      lastRenderCostMs = performance.now() - t0;
    }

    function resize() {
      if (!host || !canvas || !octx) return;
      const r = host.getBoundingClientRect();
      const nW = Math.max(1, Math.round(r.width)),
        nH = Math.max(1, Math.round(r.height));
      if (nW === W && nH === H) return;
      W = nW;
      H = nH;
      dpr = Math.min(1.5, window.devicePixelRatio || 1);
      cw = W < 600 ? 9 : 10;
      ch = Math.round(cw * 1.4);
      fs = Math.round(ch * 0.78);
      cols = Math.ceil(W / cw);
      rows = Math.ceil(H / ch);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ow = cols * SS;
      oh = rows * SS;
      off.width = ow;
      off.height = oh;
      initEntities();
      render();
    }

    pulseRef.current = () => {
      if (!W) return;
      boostUntil = time + 1.4;
      flickerUntil = time + 0.9;
    };

    modeRef.current = (m: 'auto' | 'think', tier: EffortChromaTier) => {
      const nextSpec = getTierSpec(tier, m);
      ACCENTS = nextSpec.accents;
      palFrom = clonePal(pal);
      palTo = nextSpec;
      palT = 0;
      palQ = -1;
      styles.clear();
    };

    const ob = new ResizeObserver(() => requestAnimationFrame(resize));
    ob.observe(host);
    resize();
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ob.disconnect();
    };
  }, [darkMode, allowCenter, bottomAnchored]);

  return (
    <div ref={hostRef} aria-hidden="true" data-testid="ansi-canvas-field" className={className}>
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};

// ============================================================================
// 4. SUBTLE NORMAL 3D INTRO ANIMATION (Clean Sculpted Emblem + Chromatic Blur)
// ============================================================================

export const IntroAnimation: React.FC<{
  visible: boolean;
  darkMode: boolean;
  onComplete: () => void;
}> = ({ visible, darkMode, onComplete }) => {
  const [isHolding, setIsHolding] = useState(true);
  const [tilt, setTilt] = useState({ rx: 4, ry: -5 });

  useEffect(() => {
    if (!visible) {
      setIsHolding(true);
      return;
    }
    const holdTimer = setTimeout(() => {
      setIsHolding(false);
    }, 1550);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, 2100);

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(completeTimer);
    };
  }, [visible, onComplete]);

  if (!visible) return null;

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: click-through is a deliberate mouse-only convenience — the intro overlay is a timed cinematic the pointer advances and every keyboard user reaches the same completion through the timeout, so a keyboard handler here would be dead code
    <div
      role="dialog"
      aria-label="Introdução 3D DevThink"
      data-testid="intro-3d-overlay"
      onMouseMove={(e) => {
        const nx = (e.clientX / Math.max(1, window.innerWidth) - 0.5) * 2;
        const ny = (e.clientY / Math.max(1, window.innerHeight) - 0.5) * 2;
        setTilt({ rx: -ny * 7 + 2, ry: nx * 8 - 2 });
      }}
      onClick={() => {
        setIsHolding(false);
        setTimeout(onComplete, 420);
      }}
      className={`fixed inset-0 z-[100] flex items-center justify-center cursor-pointer select-none overflow-hidden ${
        darkMode ? 'bg-[#0b0c0c] text-[#eceeed]' : 'bg-[#ffffff] text-[#141614]'
      }`}
      style={{
        opacity: isHolding ? 1 : 0,
        transform: isHolding ? 'scale(1)' : 'scale(1.015)',
        filter: isHolding ? 'blur(0px)' : 'blur(4px)',
        transition:
          'opacity 0.52s cubic-bezier(0.22, 1, 0.36, 1), transform 0.55s cubic-bezier(0.22, 1, 0.36, 1), filter 0.52s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      {/* Subtle Dispersing ANSI/ASCII Background Wings */}
      <DevThinkAnsiCanvas
        engineMode={true}
        pulseTrigger={1}
        darkMode={darkMode}
        allowCenter={false}
        className="pointer-events-none absolute inset-0 z-0 opacity-50"
      />

      {/* Soft Optical Chromatic Dispersion Blur (Zero Green / Zero Blue) */}
      <div className="hero-gaussian-shader pointer-events-none absolute inset-x-0 top-1/4 -bottom-24 z-0 opacity-75" />

      {/* Normal, Subtle 3D Perspective Stage (No Boxy Block) */}
      <div
        className="relative z-10 flex flex-col items-center"
        style={{ perspective: '1200px' }}
      >
        <div className="dt-intro-3d-spring mb-6">
          <div
            className="dt-intro-3d-rig relative w-28 h-28 flex items-center justify-center"
            style={{
              transformStyle: 'preserve-3d',
              transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
            }}
          >
            {/* Subtle Back Extrusion Depth Slice (-8px Z) */}
            <svg
              viewBox="0 0 10000000 10000000"
              className={`absolute w-24 h-24 pointer-events-none overflow-visible ${
                darkMode ? 'text-white/14' : 'text-black/15'
              }`}
              style={{ transform: 'translateZ(-8px)' }}
              fillRule="evenodd"
              clipRule="evenodd"
              aria-hidden="true"
            >
              <path fill="currentColor" d={DEVTHINK_HEX_PATH} />
            </svg>

            {/* Mid Extrusion Metallic Edge Slice (-4px Z) */}
            <svg
              viewBox="0 0 10000000 10000000"
              className={`absolute w-24 h-24 pointer-events-none overflow-visible ${
                darkMode ? 'text-white/28' : 'text-black/30'
              }`}
              style={{ transform: 'translateZ(-4px)' }}
              fillRule="evenodd"
              clipRule="evenodd"
              aria-hidden="true"
            >
              <path fill="currentColor" d={DEVTHINK_HEX_PATH} />
            </svg>

            {/* Crisp Primary 3D DevThink Hexagon (0px Z) */}
            <svg
              viewBox="0 0 10000000 10000000"
              className={`relative w-24 h-24 pointer-events-none overflow-visible ${
                darkMode
                  ? 'text-[#f2f3f2] drop-shadow-[0_10px_24px_rgba(0,0,0,0.55)]'
                  : 'text-[#141614] drop-shadow-[0_12px_22px_rgba(0,0,0,0.14)]'
              }`}
              style={{ transform: 'translateZ(0px)' }}
              fillRule="evenodd"
              clipRule="evenodd"
              aria-hidden="true"
            >
              <path fill="currentColor" d={DEVTHINK_HEX_PATH} />
            </svg>

            {/* Subtle Elevated Inner Prism Star (+12px Z) */}
            <svg
              viewBox="0 0 10000000 10000000"
              className={`absolute w-24 h-24 pointer-events-none overflow-visible ${
                darkMode
                  ? 'text-white drop-shadow-[0_6px_16px_rgba(255,255,255,0.22)]'
                  : 'text-[#272a28] drop-shadow-[0_6px_14px_rgba(0,0,0,0.16)]'
              }`}
              style={{ transform: 'translateZ(12px)' }}
              fillRule="evenodd"
              clipRule="evenodd"
              aria-hidden="true"
            >
              <path fill="currentColor" d={DEVTHINK_STAR_PATH} />
            </svg>
          </div>
        </div>

        {/* Subtle Wordmark Reveal */}
        <div className="dt-intro-title flex items-center justify-center px-4">
          <DevThinkWordmark
            className={`h-5 w-auto ${darkMode ? 'text-[#eceeed]' : 'text-[#141614]'}`}
          />
        </div>

        {/* Subtle Squircle Shimmer Accent Bar (Zero Dots / Zero Pills) */}
        <div
          className={`mt-4 h-[3px] w-12 rounded-[2px] dt-shimmer-bar ${
            darkMode ? 'bg-white/40' : 'bg-black/25'
          }`}
          aria-hidden="true"
        />
      </div>
    </div>
  );
};
