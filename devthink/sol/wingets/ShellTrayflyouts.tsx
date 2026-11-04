/**
 * trayflyouts.tsx — the two tray flyouts of the Sol shell, in the exact
 * Windows 11 grammar: QuickSettings (the 360px r8 acrylic panel under the
 * tray with the 2-column tile grid — wifi, bluetooth, cellular data, night
 * light, the REAL theme ladder tile and the REAL dock-mode tile — plus the
 * volume and brightness slider rows) and the Calendar (the 360px r8 acrylic
 * panel under the clock, real Date math, sunday-first grid, 44px day cells).
 * The theme tile flips the real system theme ladder (personalstore.ts — the
 * mirror persists and both roots paint) and the dock tile flips the real
 * navbar mode (desktopstate.ts — the account store saves and the
 * dt-navbar-mode event re-docks the bar live); both read the live system
 * state at open, so the switches answer the machine, never a local guess.
 * Both dialogs are painted as Tailwind composition on the design tokens
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

import type { FluentIcon as LucideIcon } from "@fluentui/react-icons";
import {
  BluetoothRegular as Bluetooth,
  ChevronLeftRegular as ChevronLeft,
  ChevronRightRegular as ChevronRight,
  ColorRegular as Contrast,
  PanelBottomRegular as Dock,
  DarkThemeRegular as MoonStar,
  Cellular5GRegular as Signal,
  WeatherSunnyRegular as Sun,
  Speaker1Regular as Volume2,
  Wifi1Regular as Wifi,
} from "@fluentui/react-icons";
import { useEffect, useState } from "react";
import { isNavbarMode, NAVBAR_MODE_EVENT, type NavbarMode, saveNavbarMode } from "../../desktopstate.ts";
import { osCalendarWeekdays, osText } from "../../oslabels.ts";
import { currentThemeLadder, flipThemeLadder } from "../../personalstore.ts";

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
 * chrome renders (night light wash, brightness dim) — every bit reversible.
 * The theme and the dock mode live OUT of this bag: they are REAL system
 * states (the theme ladder of personalstore.ts, the navbar mode of
 * desktopstate.ts) and their tiles are self-contained below. */
export type TraySettings = {
  wifi: boolean;
  bluetooth: boolean;
  night: boolean;
  /** the simulated cellular data of the OS tray (win11 quick settings) */
  data: boolean;
  volume: number;
  brightness: number;
};

export const DEFAULT_TRAY_SETTINGS: TraySettings = {
  wifi: true,
  bluetooth: false,
  night: false,
  data: true,
  volume: 70,
  brightness: 100,
};

type TileKey = "wifi" | "bluetooth" | "night" | "data";

const TILES: Array<{ key: TileKey; label: string; icon: LucideIcon }> = [
  { key: "wifi", label: osText("tray.tile.wifi"), icon: Wifi },
  { key: "bluetooth", label: osText("tray.tile.bluetooth"), icon: Bluetooth },
  { key: "data", label: osText("tray.tile.data"), icon: Signal },
  { key: "night", label: osText("tray.tile.night"), icon: MoonStar },
];

/** the shared tray flyout motion: the .dt-flyout hook carries the 250ms
 * cubic-bezier(.62,0,.32,1) tray curve (the stylesheet may own it; these are
 * the exact inline values), the hide slides back under the bottom bar in
 * 150ms */
const TRAY_FLYOUT_CLASS =
  "dt-flyout acrylic-panel fixed bottom-[calc(var(--shell-bottom)+12px)] right-3 z-[calc(var(--z-bar)-1)] w-[360px] rounded-md p-4 text-ink transition-[transform,opacity] duration-[250ms] ease-[cubic-bezier(0.62,0,0.32,1)] data-[hide=true]:pointer-events-none data-[hide=true]:translate-y-[110%] data-[hide=true]:opacity-0 data-[hide=true]:duration-150";

/** the focus rule of the tray controls: the 2px accent underline, no halo */
const TRAY_FOCUS_CLASS = "focus-visible:shadow-[inset_0_-2px_0_var(--color-win)] focus-visible:outline-none";

/** the shared tile face of the quick settings grid (the session tiles and
 * the two real system tiles wear the exact same wash/ladder/press) */
const TILE_BUTTON_CLASS = `flex min-h-11 cursor-pointer items-center gap-2.5 rounded-xs border border-white/9 bg-white/4 px-3 text-left font-sans text-xs font-medium text-ink transition-colors duration-150 ease-entry hover:bg-white/9 data-[on=true]:border-white/25 data-[on=true]:bg-white/15 data-[on=true]:text-signal-strong active:scale-[0.97] active:duration-100 light:border-black/10 light:bg-black/3 light:hover:bg-black/8 light:data-[on=true]:bg-black/12 light:data-[on=true]:text-[#1a1a1a] ${TRAY_FOCUS_CLASS}`;

/** the REAL theme tile: reads the live theme ladder at open and flips the
 * system (personalstore.ts flipThemeLadder — the mirror persists and both
 * roots paint) on the press. Self-contained like the dock tile: the state
 * it shows is the machine's, never a local guess. */
function ThemeTile() {
  const [dark, setDark] = useState(() => currentThemeLadder() === "dark");
  return (
    <button
      type="button"
      data-on={dark ? "true" : undefined}
      aria-pressed={dark}
      aria-label={osText("tray.tile.theme")}
      onClick={() => setDark(flipThemeLadder() === "dark")}
      className={TILE_BUTTON_CLASS}
    >
      <Contrast fontSize={16} aria-hidden="true" />
      <span>{osText("tray.tile.theme")}</span>
    </button>
  );
}

/** the REAL dock-mode tile: reads the live bar posture at open, flips the
 * navbar mode on the press (desktopstate.ts saveNavbarMode + the
 * dt-navbar-mode event the bar listens to — the pad re-docks live) and
 * follows the bar's own verdicts through the same event. */
function DockModeTile() {
  const [docked, setDocked] = useState(
    () => document.querySelector(".dt-nav")?.getAttribute("data-navmode") === "docked",
  );
  useEffect(() => {
    const onMode = (event: Event) => {
      const detail = (event as CustomEvent<NavbarMode>).detail;
      if (isNavbarMode(detail)) setDocked(detail === "docked");
    };
    window.addEventListener(NAVBAR_MODE_EVENT, onMode);
    return () => window.removeEventListener(NAVBAR_MODE_EVENT, onMode);
  }, []);
  const flip = () => {
    const next: NavbarMode = docked ? "floating" : "docked";
    saveNavbarMode(next);
    window.dispatchEvent(new CustomEvent<NavbarMode>(NAVBAR_MODE_EVENT, { detail: next }));
    setDocked(next === "docked");
  };
  return (
    <button
      type="button"
      data-on={docked ? "true" : undefined}
      aria-pressed={docked}
      aria-label={osText("tray.tile.docked")}
      onClick={flip}
      className={TILE_BUTTON_CLASS}
    >
      <Dock fontSize={16} aria-hidden="true" />
      <span>{osText("tray.tile.docked")}</span>
    </button>
  );
}

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
      <p className="mb-3 font-mono text-[9px] font-semibold tracking-[0.08em] lowercase text-ink-3">
        {osText("tray.quick.heading")}
      </p>
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
              className={TILE_BUTTON_CLASS}
            >
              <tile.icon fontSize={16} aria-hidden="true" />
              <span>{tile.label}</span>
            </button>
          );
        })}
        <ThemeTile />
        <DockModeTile />
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
  /** the dock is floating: the box accompanies the pad (the anchor law)
   * instead of resting on the screen corner */
  floating?: boolean;
  /** the measured horizontal anchor (px) of the dock clock — the center the
   * floating flyout rides, clamped to the viewport gutters */
  anchorX?: number | null;
};

/** the floating placement law: the 360px box keeps a 12px gutter of the
 * viewport on each side while it rides the dock anchor */
const CALENDAR_GUTTER = 12 + 180;

/** the calendar flyout: month head with prev/next, weekday row and the real
 * date grid of the viewed month — pure state, no storage. While the dock
 * floats, the box accompanies the pad: it opens over the measured clock
 * anchor (the calendar law of the floating dock), clamped to the viewport
 * gutters; docked, it keeps the screen-corner placement the tray owns. */
export function CalendarFlyout({ open, floating = false, anchorX = null }: CalendarFlyoutProps) {
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

  /** the anchor the box rides while floating: the clock center clamped so
   * the 360px box never leaves the viewport (the server render and the
   * anchorless rides answer null and keep the corner law) */
  const rides =
    floating && anchorX !== null && typeof window !== "undefined"
      ? Math.min(Math.max(anchorX, CALENDAR_GUTTER), Math.max(window.innerWidth - CALENDAR_GUTTER, CALENDAR_GUTTER))
      : null;

  return (
    <section
      className={TRAY_FLYOUT_CLASS}
      id="dt-calendar"
      role="dialog"
      aria-label={osText("shell.tray.calendar.aria")}
      data-hide={open ? undefined : "true"}
      data-flyout-keep="true"
      data-floating={rides !== null ? "true" : undefined}
      style={
        rides === null ? undefined : { right: "auto", left: `${Math.round(rides)}px`, transform: "translateX(-50%)" }
      }
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
