/**
 * StudioAnsi.tsx — the ansi/ascii art canvas of the studio surface (section
 * 3 of the interface 17 spec): the devthink hex+star, the doo ai symbol and
 * the happy faces as living ascii art — the entities orbit, dissolve into
 * character ramps, trade palettes when the theme flips and pulse when a
 * message is born. a requestAnimationFrame loop on an offscreen canvas,
 * downsampled to a character grid with the ramp `.:;+=*o%@#` and dithered
 * with a per-cell hash. the host reads the theme through the engine-mode
 * prop (think palette when the engine works, auto palette at rest).
 */

import { useEffect, useRef, type FC } from "react";
import { DEVTHINK_HEX_PATH, DEVTHINK_STAR_PATH } from "./StudioBrand.tsx";

export const StudioAnsiCanvas: FC<{ engineMode: boolean; pulseTrigger: number }> = ({
  engineMode,
  pulseTrigger,
}) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pulseRef = useRef<() => void>(() => {});
  const modeRef = useRef<(m: 'auto' | 'think') => void>(() => {});

  useEffect(() => {
    modeRef.current(engineMode ? 'auto' : 'think');
    pulseRef.current();
  }, [engineMode, pulseTrigger]);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;
    const ctx0 = canvas.getContext('2d');
    const off = document.createElement('canvas');
    const octx0 = off.getContext('2d', { willReadFrequently: true });
    if (!ctx0 || !octx0) return;
    /* ts-strictness bridge: the nested drawers close over the non-null pair */
    const ctx: CanvasRenderingContext2D = ctx0;
    const octx: CanvasRenderingContext2D = octx0;

    const hexPath = typeof Path2D !== 'undefined' ? new Path2D(DEVTHINK_HEX_PATH) : null;
    const starPath = typeof Path2D !== 'undefined' ? new Path2D(DEVTHINK_STAR_PATH) : null;

    const SS = 2;
    const PALETTES = {
      auto: { a: [56, 189, 248], b: [139, 92, 246], tempo: 1.0, size: 1.0 },
      think: { a: [236, 72, 153], b: [99, 102, 241], tempo: 0.95, size: 1.08 }
    };
    const ACCENTS = ['#f472b6', '#38bdf8', '#a855f7', '#818cf8'];
    const RAMP = [
      ['.', '·'],
      [':', '.'],
      [';', ':'],
      ['+', ';'],
      ['=', '+'],
      ['*', '='],
      ['o', '*'],
      ['%', 'o'],
      ['S', '%'],
      ['X', 'S'],
      ['@', 'X'],
      ['#', '@']
    ];
    const FONT = '"Geist Mono", ui-monospace, "SF Mono", Menlo, Consolas, monospace';

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

    const clonePal = (p: typeof PALETTES.auto) => ({
      a: p.a.slice(),
      b: p.b.slice(),
      tempo: p.tempo,
      size: p.size
    });
    let pal = clonePal(PALETTES.auto),
      palFrom = clonePal(PALETTES.auto),
      palTo = clonePal(PALETTES.auto),
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
        anchorX: 0.13,
        anchorY: 0.34,
        x: 0,
        y: 0,
        R0: 135,
        R: 135,
        theta: 0,
        subTheta: 0,
        dissolve: 0.55,
        alpha: 0.8,
        mix: 0.2,
        cycleDur: 6.2,
        phaseOffset: 0.05
      },
      {
        kind: 'doo-ai',
        anchorX: 0.19,
        anchorY: 0.64,
        x: 0,
        y: 0,
        R0: 155,
        R: 155,
        theta: 0,
        subTheta: 0,
        dissolve: 0.45,
        alpha: 0.9,
        mix: 0.35,
        cycleDur: 6.8,
        phaseOffset: 0.42
      },
      {
        kind: 'devthink',
        anchorX: 0.82,
        anchorY: 0.56,
        x: 0,
        y: 0,
        R0: 215,
        R: 215,
        theta: 0,
        subTheta: 0,
        dissolve: 0.4,
        alpha: 0.95,
        mix: 0.72,
        cycleDur: 5.8,
        phaseOffset: 0.2
      },
      {
        kind: 'happy-wink',
        anchorX: 0.87,
        anchorY: 0.3,
        x: 0,
        y: 0,
        R0: 130,
        R: 130,
        theta: 0,
        subTheta: 0,
        dissolve: 0.5,
        alpha: 0.85,
        mix: 0.84,
        cycleDur: 6.4,
        phaseOffset: 0.68
      }
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
      const scaleBase = clamp(Math.min(W, H * 1.45), 480, 1440);
      entities.forEach((ent) => {
        if (ent.kind === 'devthink') {
          ent.R0 = clamp(scaleBase * 0.24, 155, 245);
        } else if (ent.kind === 'doo-ai') {
          ent.R0 = clamp(scaleBase * 0.17, 110, 175);
        } else {
          ent.R0 = clamp(scaleBase * 0.15, 98, 155);
        }
        ent.R = ent.R0 * pal.size;
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
            size: lerp(palFrom.size, palTo.size, t)
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

        if (ent.kind === 'devthink') {
          const sideSwap = cycleIdx % 2 === 0 ? 1 : -1;
          baseX = sideSwap > 0 ? W * 0.82 : W * 0.16;
          baseY = sideSwap > 0 ? H * 0.56 : H * 0.48;
        }

        const driftX = Math.sin(time * 0.55 + idx * 1.7) * (W * 0.024);
        const driftY = Math.cos(time * 0.68 + idx * 1.3) * (H * 0.028) - formation * 14;
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
      octx.arc(0, 0, r, -0.25 + d * 0.3, Math.PI * 1.85 - d * 0.3);
      octx.stroke();

      octx.save();
      octx.translate(
        -r * 0.28 - Math.sin(time * 1.7) * wobble * 0.5,
        -r * 0.02 + Math.cos(time * 1.5) * wobble * 0.4
      );
      octx.rotate(-0.14 - d * 0.12);
      octx.lineWidth = Math.max(8, r * 0.25);
      octx.strokeStyle = col(1 - m * 0.3, k * 1.05, 0.68 * k);
      octx.beginPath();
      octx.moveTo(0, -r * 0.18);
      octx.lineTo(0, r * 0.18);
      octx.stroke();
      octx.restore();

      octx.save();
      octx.translate(
        r * 0.28 + Math.cos(time * 1.8) * wobble * 0.5,
        -r * 0.02 - Math.sin(time * 1.6) * wobble * 0.4
      );
      octx.rotate(0.14 + d * 0.12);
      octx.lineWidth = Math.max(8, r * 0.25);
      octx.strokeStyle = col(1 - m * 0.3, k * 1.05, 0.68 * k);
      octx.beginPath();
      octx.moveTo(0, -r * 0.18);
      octx.lineTo(0, r * 0.18);
      octx.stroke();
      octx.restore();

      octx.lineWidth = Math.max(5, r * 0.13);
      octx.strokeStyle = col(m, k * 0.92, 0.48 * k);
      octx.beginPath();
      octx.arc(0, r * 0.12 + wobble * 0.3, r * 0.36, 0.22 * Math.PI, 0.78 * Math.PI);
      octx.stroke();

      octx.restore();
    }

    function drawHappyFace(ent: AnsiEntity, k: number, wink: boolean) {
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
      if (!hexPath || !starPath) return;
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
      const key = (tb * 12 + lv) * 3 + wb;
      let s = styles.get(key);
      if (s) return s;
      const t = tb / 5,
        L = (lv + 0.5) / 12,
        w = [0, 0.25, 0.5][wb];
      const base = [0, 1, 2].map((i) => lerp(pal.a[i], pal.b[i], t));
      const glyph = base.map((v) => clamp(Math.round(lerp(v * 0.65, 72, w * 0.45)), 0, 255));
      s = {
        tile: 'transparent',
        glyph: `rgba(${glyph[0]},${glyph[1]},${glyph[2]},${(0.32 + L * 0.64).toFixed(3)})`
      };
      styles.set(key, s);
      return s;
    }

    function render() {
      if (!W || !H || ow <= 0 || oh <= 0) return;
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
            if (normX > 0.28 && normX < 0.72 && normY < 0.72) continue;

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

    function loop(now: number) {
      raf = requestAnimationFrame(loop);
      if (!last) {
        last = now;
        return;
      }
      const dt = (now - last) / 1000;
      last = now;
      acc += Math.min(dt, 0.1);
      if (acc < 1 / 30) return;
      const n = Math.max(1, Math.min(6, Math.round(acc * 60))),
        h = acc / n;
      for (let i = 0; i < n; i++) step(h);
      acc = 0;
      render();
    }

    function resize() {
      if (!host || !canvas) return;
      const r = host.getBoundingClientRect();
      const nW = Math.max(1, Math.round(r.width)),
        nH = Math.max(1, Math.round(r.height));
      if (nW === W && nH === H) return;
      W = nW;
      H = nH;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      cw = W < 600 ? 8 : 9;
      ch = Math.round(cw * 1.4);
      fs = Math.round(ch * 0.76);
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

    modeRef.current = (m: 'auto' | 'think') => {
      const p = PALETTES[m] || PALETTES.auto;
      palFrom = clonePal(pal);
      palTo = p;
      palT = 0;
      palQ = -1;
    };

    const ob = new ResizeObserver(() => requestAnimationFrame(resize));
    ob.observe(host);
    resize();
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ob.disconnect();
    };
  }, []);

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className="hero-ansi-ocean pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};
