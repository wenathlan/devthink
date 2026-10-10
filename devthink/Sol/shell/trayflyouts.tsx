/**
 * trayflyouts.tsx — the two tray flyouts of the Sol shell, in the exact
 * Windows 11 grammar: QuickSettings (360px acrylic panel under the tray with
 * a 2×2 tile grid — wifi, bluetooth, night light, theme — plus the volume and
 * brightness slider rows) and the Calendar (340px acrylic panel under the
 * clock, real Date math, sunday-first grid). Both are dialogs painted as
 * Tailwind composition on the design tokens (task 3-a) — the .acrylic-panel
 * Fluent surface (rgb(36 36 36 / 80%) + saturate(3) blur(20px) + grain, 8px
 * corners, the hairline ring and the flyout shadow) — that enter and exit on
 * the 200ms cubic-bezier(.79,.14,.15,.86) slide-and-fade driven by the
 * ShellChrome mount state (the `open` prop flips `data-hide`); under
 * `prefers-reduced-motion` the chrome mounts them already visible and drops
 * them instantly, so no transition ever plays.
 */

import type { LucideIcon } from "lucide-react";
import { Bluetooth, ChevronLeft, ChevronRight, Contrast, MoonStar, Sun, Volume2, Wifi } from "lucide-react";
import { useEffect, useState } from "react";

/** tracks the os reduced-motion preference */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

/** the session tray state behind the quick settings panel: the toggles stay
 * accent-lit while on, the sliders only shape the two screen overlays the
 * chrome renders (night light wash, brightness dim) — every bit reversible */
export type TraySettings = {
  wifi: boolean;
  bluetooth: boolean;
  night: boolean;
  theme: boolean;
  volume: number;
  brightness: number;
};

export const DEFAULT_TRAY_SETTINGS: TraySettings = {
  wifi: true,
  bluetooth: false,
  night: false,
  theme: true,
  volume: 70,
  brightness: 100,
};

type TileKey = "wifi" | "bluetooth" | "night" | "theme";

const TILES: Array<{ key: TileKey; label: string; icon: LucideIcon }> = [
  { key: "wifi", label: "wifi", icon: Wifi },
  { key: "bluetooth", label: "bluetooth", icon: Bluetooth },
  { key: "night", label: "night light", icon: MoonStar },
  { key: "theme", label: "theme", icon: Contrast },
];

type QuickSettingsProps = {
  /** visible state of the mount pattern (false renders the exit pose) */
  open: boolean;
  /** reduced motion: no transition styles at all */
  reduced: boolean;
  settings: TraySettings;
  onChange: (patch: Partial<TraySettings>) => void;
};

/** the quick settings flyout: tile grid + volume/brightness sliders */
export function QuickSettings({ open, settings, onChange }: QuickSettingsProps) {
  const toggleTile = (key: TileKey) => {
    const patch: Partial<TraySettings> = {};
    patch[key] = !settings[key];
    onChange(patch);
  };

  return (
    <section
      className="acrylic-panel fixed top-[calc(var(--shell-top)+12px)] right-3 z-(--z-menu) w-[360px] origin-top-right rounded-md p-4 text-ink transition-[opacity,transform] duration-200 ease-fluent data-[hide=true]:pointer-events-none data-[hide=true]:-translate-y-2 data-[hide=true]:opacity-0"
      id="dt-quick-settings"
      role="dialog"
      aria-label="Quick settings"
      data-hide={open ? undefined : "true"}
      data-flyout-keep="true"
    >
      <p className="mb-3 font-mono text-[9px] font-semibold tracking-[0.08em] lowercase text-ink-3">quick settings</p>
      <div className="grid grid-cols-2 gap-2">
        {TILES.map((tile) => {
          const on = settings[tile.key];
          return (
            <button
              key={tile.key}
              type="button"
              data-on={on ? "true" : undefined}
              aria-pressed={on}
              onClick={() => toggleTile(tile.key)}
              className="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-xs border border-white/9 bg-white/4 px-3 text-left font-sans text-xs font-medium text-ink transition-colors duration-150 ease-entry hover:bg-white/9 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-(--color-focus) data-[on=true]:border-white/25 data-[on=true]:bg-white/15 data-[on=true]:text-signal-strong active:scale-[0.97] active:duration-100 light:border-black/10 light:bg-black/3 light:hover:bg-black/8 light:data-[on=true]:bg-black/12 light:data-[on=true]:text-[#1a1a1a]"
            >
              <tile.icon size={16} strokeWidth={1.5} aria-hidden="true" />
              <span>{tile.label}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-3.5 grid gap-3">
        <label className="flex items-center gap-2.5 text-ink-2">
          <Volume2 size={14} strokeWidth={1.5} aria-hidden="true" />
          <input
            type="range"
            min={0}
            max={100}
            value={settings.volume}
            onChange={(event) => onChange({ volume: Number(event.target.value) })}
            aria-label="Volume"
            className="min-w-0 flex-1 accent-(--color-win) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus)"
          />
          <span className="min-w-[26px] text-right font-mono text-[11px] text-ink tabular-nums">{settings.volume}</span>
        </label>
        <label className="flex items-center gap-2.5 text-ink-2">
          <Sun size={14} strokeWidth={1.5} aria-hidden="true" />
          <input
            type="range"
            min={0}
            max={100}
            value={settings.brightness}
            onChange={(event) => onChange({ brightness: Number(event.target.value) })}
            aria-label="Brightness"
            className="min-w-0 flex-1 accent-(--color-win) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus)"
          />
          <span className="min-w-[26px] text-right font-mono text-[11px] text-ink tabular-nums">
            {settings.brightness}
          </span>
        </label>
      </div>
    </section>
  );
}

/** the sunday-first weekday row (S M T W T F S) */
const WEEKDAYS = [
  { key: "su", letter: "S" },
  { key: "mo", letter: "M" },
  { key: "tu", letter: "T" },
  { key: "we", letter: "W" },
  { key: "th", letter: "T" },
  { key: "fr", letter: "F" },
  { key: "sa", letter: "S" },
];

type CalendarFlyoutProps = {
  /** visible state of the mount pattern (false renders the exit pose) */
  open: boolean;
  /** reduced motion: no transition styles at all */
  reduced: boolean;
};

/** the calendar flyout: month head with prev/next, weekday row and the real
 * date grid of the viewed month — pure state, no storage */
export function CalendarFlyout({ open }: CalendarFlyoutProps) {
  const [view, setView] = useState(() => new Date());

  // reopening always lands back on the current month
  useEffect(() => {
    if (open) setView(new Date());
  }, [open]);

  const year = view.getFullYear();
  const month = view.getMonth();
  /** real date math: the leading blanks come from the weekday of the 1st
   * (sunday = 0 columns), the day count from the 0th of the next month */
  const leading = new Date(year, month, 1).getDay();
  const days = Array.from({ length: new Date(year, month + 1, 0).getDate() }, (_, index) => index + 1);
  const now = new Date();
  const shift = (delta: number) => setView(new Date(year, month + delta, 1));

  return (
    <section
      className="acrylic-panel fixed top-[calc(var(--shell-top)+12px)] right-3 z-(--z-menu) w-[340px] origin-top-right rounded-md p-4 text-ink transition-[opacity,transform] duration-200 ease-fluent data-[hide=true]:pointer-events-none data-[hide=true]:-translate-y-2 data-[hide=true]:opacity-0"
      id="dt-calendar"
      role="dialog"
      aria-label="Calendar"
      data-hide={open ? undefined : "true"}
      data-flyout-keep="true"
    >
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <strong className="font-display text-sm font-semibold tracking-[-0.01em]">
          {new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(view)}
        </strong>
        <span className="flex gap-0.5">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => shift(-1)}
            className="grid h-7 w-7 cursor-pointer place-items-center rounded-xs border-0 bg-transparent text-ink-2 transition-colors duration-150 hover:bg-white/9 hover:text-ink focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-(--color-focus) light:hover:bg-black/8"
          >
            <ChevronLeft size={15} strokeWidth={1.5} aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => shift(1)}
            className="grid h-7 w-7 cursor-pointer place-items-center rounded-xs border-0 bg-transparent text-ink-2 transition-colors duration-150 hover:bg-white/9 hover:text-ink focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-(--color-focus) light:hover:bg-black/8"
          >
            <ChevronRight size={15} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </span>
      </div>
      <div
        aria-hidden="true"
        className="mb-1.5 grid grid-cols-7 text-center font-mono text-[9px] font-semibold tracking-[0.08em] text-ink-3"
      >
        {WEEKDAYS.map((day) => (
          <span key={day.key}>{day.letter}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {leading > 0 && <span aria-hidden="true" style={{ gridColumn: `span ${leading}` }} />}
        {days.map((day) => {
          const today = day === now.getDate() && month === now.getMonth() && year === now.getFullYear();
          return (
            <button
              key={day}
              type="button"
              data-today={today ? "true" : undefined}
              aria-label={new Intl.DateTimeFormat(undefined, { dateStyle: "full" }).format(new Date(year, month, day))}
              aria-current={today ? "date" : undefined}
              className="grid h-8 w-8 cursor-pointer place-items-center justify-self-center rounded-full border-0 bg-transparent font-mono text-xs font-medium text-ink tabular-nums transition-colors duration-150 hover:bg-white/9 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-(--color-focus) data-[today=true]:bg-(--color-signal) data-[today=true]:text-(--color-signal-ink) light:hover:bg-black/8"
            >
              {day}
            </button>
          );
        })}
      </div>
    </section>
  );
}
