/**
 * trayflyouts.tsx — the two tray flyouts of the Sol shell, in the exact
 * Windows 11 grammar: QuickSettings (the 360px r8 acrylic panel under the
 * tray with a 2×2 tile grid — wifi, bluetooth, night light, theme — plus the
 * volume and brightness slider rows) and the Calendar (the 360px r8 acrylic
 * panel under the clock, real Date math, sunday-first grid, 44px day cells).
 * Both are dialogs painted as Tailwind composition on the design tokens
 * (task 3-a) — the .acrylic-panel Fluent surface (rgb(36 36 36 / 80%) +
 * saturate(3) blur(20px) + grain, 8px corners, the hairline ring and the
 * flyout shadow) — and both carry the .dt-flyout hook: the tray entrance is
 * 250ms on cubic-bezier(.62,0,.32,1) and the exit mirrors the bottom-bar
 * recipe for the top bar (the panel slides back UP under the taskbar,
 * translateY(-110%), in 150ms — it sits one step under the bar z so the
 * acrylic swallows it). The ShellChrome mount state drives both phases (the
 * `open` prop flips `data-hide`); under `prefers-reduced-motion` the chrome
 * mounts them already visible and drops them instantly, so no transition
 * ever plays. Every control keeps the ≥44px touch target and the campaign
 * focus rule: a 2px accent underline (inset box-shadow), never a halo.
 */

import type {FluentIcon as LucideIcon} from "@fluentui/react-icons";
import { BluetoothRegular as Bluetooth, ChevronLeftRegular as ChevronLeft, ChevronRightRegular as ChevronRight, ColorRegular as Contrast, DarkThemeRegular as MoonStar, Cellular5GRegular as Signal, WeatherSunnyRegular as Sun, Speaker1Regular as Volume2, Wifi1Regular as Wifi } from "@fluentui/react-icons";
import { useEffect, useState } from "react";
import { osCalendarWeekdays, osText } from "../../../oslabels.ts";

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
  /** the simulated cellular data of the OS tray (win11 quick settings) */
  data: boolean;
  volume: number;
  brightness: number;
};

export const DEFAULT_TRAY_SETTINGS: TraySettings = {
  wifi: true,
  bluetooth: false,
  night: false,
  theme: true,
  data: true,
  volume: 70,
  brightness: 100 };

type TileKey = "wifi" | "bluetooth" | "night" | "theme" | "data";

const TILES: Array<{ key: TileKey; label: string; icon: LucideIcon }> = [
  { key: "wifi", label: osText("tray.tile.wifi"), icon: Wifi },
  { key: "bluetooth", label: osText("tray.tile.bluetooth"), icon: Bluetooth },
  { key: "data", label: osText("tray.tile.data"), icon: Signal },
  { key: "night", label: osText("tray.tile.night"), icon: MoonStar },
  { key: "theme", label: osText("tray.tile.theme"), icon: Contrast },
];

/** the shared tray flyout motion: the .dt-flyout hook carries the 250ms
 * cubic-bezier(.62,0,.32,1) tray curve (the stylesheet may own it; these are
 * the exact inline values), the hide slides back under the bottom bar in
 * 150ms */
const TRAY_FLYOUT_CLASS =
  "dt-flyout acrylic-panel fixed bottom-[calc(var(--shell-bottom)+12px)] right-3 z-[calc(var(--z-bar)-1)] w-[360px] rounded-md p-4 text-ink transition-[transform,opacity] duration-[250ms] ease-[cubic-bezier(0.62,0,0.32,1)] data-[hide=true]:pointer-events-none data-[hide=true]:translate-y-[110%] data-[hide=true]:opacity-0 data-[hide=true]:duration-150";

/** the focus rule of the tray controls: the 2px accent underline, no halo */
const TRAY_FOCUS_CLASS = "focus-visible:shadow-[inset_0_-2px_0_var(--color-win)] focus-visible:outline-none";

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
      className={TRAY_FLYOUT_CLASS}
      id="dt-quick-settings"
      role="dialog"
      aria-label={osText("shell.tray.quick.aria")}
      data-hide={open ? undefined : "true"}
      data-flyout-keep="true"
    >
      <p className="mb-3 font-mono text-[9px] font-semibold tracking-[0.08em] lowercase text-ink-3">{osText("tray.quick.heading")}</p>
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
              className={`flex min-h-11 cursor-pointer items-center gap-2.5 rounded-xs border border-white/9 bg-white/4 px-3 text-left font-sans text-xs font-medium text-ink transition-colors duration-150 ease-entry hover:bg-white/9 data-[on=true]:border-white/25 data-[on=true]:bg-white/15 data-[on=true]:text-signal-strong active:scale-[0.97] active:duration-100 light:border-black/10 light:bg-black/3 light:hover:bg-black/8 light:data-[on=true]:bg-black/12 light:data-[on=true]:text-[#1a1a1a] ${TRAY_FOCUS_CLASS}`}
            >
              <tile.icon fontSize={16} aria-hidden="true" />
              <span>{tile.label}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-3.5 grid gap-1">
        <label className="flex min-h-11 items-center gap-2.5 text-ink-2">
          <Volume2 fontSize={14} aria-hidden="true" />
          <input
            type="range"
            min={0}
            max={100}
            value={settings.volume}
            onChange={(event) => onChange({ volume: Number(event.target.value) })}
            aria-label={osText("tray.volume.aria")}
            className="min-w-0 flex-1 accent-(--color-win) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus)"
          />
          <span className="min-w-[26px] text-right font-mono text-[11px] text-ink tabular-nums">{settings.volume}</span>
        </label>
        <label className="flex min-h-11 items-center gap-2.5 text-ink-2">
          <Sun fontSize={14} aria-hidden="true" />
          <input
            type="range"
            min={0}
            max={100}
            value={settings.brightness}
            onChange={(event) => onChange({ brightness: Number(event.target.value) })}
            aria-label={osText("tray.brightness.aria")}
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

/** the sunday-first weekday row (S M T W T F S) — the label table serves the letters */
const WEEKDAYS = osCalendarWeekdays().map((letter, index) => ({ key: `wd-${index}`, letter }));

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
      className={TRAY_FLYOUT_CLASS}
      id="dt-calendar"
      role="dialog"
      aria-label={osText("shell.tray.calendar.aria")}
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
            aria-label={osText("tray.calendar.prev")}
            onClick={() => shift(-1)}
            className={`grid h-11 w-11 cursor-pointer place-items-center rounded-xs border-0 bg-transparent text-ink-2 transition-colors duration-150 hover:bg-white/9 hover:text-ink light:hover:bg-black/8 ${TRAY_FOCUS_CLASS}`}
          >
            <ChevronLeft fontSize={15} aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label={osText("tray.calendar.next")}
            onClick={() => shift(1)}
            className={`grid h-11 w-11 cursor-pointer place-items-center rounded-xs border-0 bg-transparent text-ink-2 transition-colors duration-150 hover:bg-white/9 hover:text-ink light:hover:bg-black/8 ${TRAY_FOCUS_CLASS}`}
          >
            <ChevronRight fontSize={15} aria-hidden="true" />
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
              className={`grid h-11 w-11 cursor-pointer place-items-center justify-self-center rounded-xs border-0 bg-transparent font-mono text-xs font-medium text-ink tabular-nums transition-colors duration-150 hover:bg-white/9 data-[today=true]:bg-(--color-signal) data-[today=true]:text-(--color-signal-ink) light:hover:bg-black/8 ${TRAY_FOCUS_CLASS}`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </section>
  );
}
