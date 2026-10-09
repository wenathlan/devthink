/**
 * trayflyouts.tsx — the two tray flyouts of the Sol shell, in the exact
 * Windows 11 grammar: QuickSettings (360px acrylic panel under the tray with
 * a 2×2 tile grid — wifi, bluetooth, night light, theme — plus the volume and
 * brightness slider rows) and the Calendar (340px acrylic panel under the
 * clock, real Date math, sunday-first grid). Both are dialogs that enter and
 * exit on the 200ms cubic-bezier(.79,.14,.15,.86) slide-and-fade driven by
 * the ShellChrome mount state (the `open` prop flips `data-hide`); under
 * `prefers-reduced-motion` the chrome mounts them already visible and drops
 * them instantly, so no transition ever plays. The acrylic surface grammar is
 * inlined here as a fallback so the flyouts read correctly before the wave-2
 * css pass lands the class hooks (.tray-flyout, .tray-tile, .tray-slider,
 * .cal-flyout, .cal-head, .cal-day).
 */

import type { LucideIcon } from "lucide-react";
import { Bluetooth, ChevronLeft, ChevronRight, Contrast, MoonStar, Sun, Volume2, Wifi } from "lucide-react";
import { type CSSProperties, useEffect, useState } from "react";

/** the glass surface of every shell flyout (campaign v3 recipe: dark glass
 * blur(24px) saturate(160%), the hairline at white 8%, the inset top
 * highlight and the 12px panel radius; the class hooks in sol.css layer the
 * atmosphere on top) */
export const FLYOUT_ACRYLIC: CSSProperties = {
  background: "rgb(23 25 31 / 78%)",
  backdropFilter: "blur(24px) saturate(160%)",
  WebkitBackdropFilter: "blur(24px) saturate(160%)",
  border: "1px solid rgb(255 255 255 / 8%)",
  borderRadius: 12,
  boxShadow: "inset 0 1px 0 rgb(255 255 255 / 6%), 0 2px 8px rgb(0 0 0 / 30%), 0 16px 48px rgb(0 0 0 / 45%)",
  color: "#edf0f6",
};

/** the one windows enter/exit curve of every menu and flyout */
const FLYOUT_EASE = "cubic-bezier(.79,.14,.15,.86)";

/** the inline motion style of one flyout: the 200ms slide-and-fade toward
 * the visible state and the reversed one while hiding — skipped entirely
 * under reduced motion (the chrome then mounts/unmounts instantly). The
 * `menu` variant is the context-menu entrance: a 180ms scale .97→1 + fade
 * from the anchor corner instead of the vertical slide. */
export function flyoutMotion(open: boolean, reduced: boolean, variant: "slide" | "menu" = "slide"): CSSProperties {
  if (reduced) return open ? {} : { opacity: 0, pointerEvents: "none" };
  if (variant === "menu") {
    return {
      transition: `opacity 180ms ${FLYOUT_EASE}, transform 180ms ${FLYOUT_EASE}`,
      ...(open ? {} : { opacity: 0, transform: "scale(.97)", pointerEvents: "none" }),
    };
  }
  return {
    transition: `opacity 200ms ${FLYOUT_EASE}, transform 200ms ${FLYOUT_EASE}`,
    ...(open ? {} : { opacity: 0, transform: "translateY(-8px)", pointerEvents: "none" }),
  };
}

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
export function QuickSettings({ open, reduced, settings, onChange }: QuickSettingsProps) {
  const toggleTile = (key: TileKey) => {
    const patch: Partial<TraySettings> = {};
    patch[key] = !settings[key];
    onChange(patch);
  };

  return (
    <section
      className="tray-flyout"
      id="dt-quick-settings"
      role="dialog"
      aria-label="Quick settings"
      data-hide={open ? undefined : "true"}
      data-flyout-keep="true"
      style={{
        ...FLYOUT_ACRYLIC,
        position: "fixed",
        top: "calc(var(--shell-top, 48px) + 12px)",
        right: 12,
        zIndex: "var(--z-menu, 60)",
        width: 360,
        padding: 16,
        ...flyoutMotion(open, reduced),
      }}
    >
      <p
        className="tray-flyout__label"
        style={{
          margin: "0 0 12px",
          color: "#6b7383",
          font: "600 9px var(--dt-mono, monospace)",
          letterSpacing: ".08em",
        }}
      >
        quick settings
      </p>
      <div className="tray-flyout__tiles" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
        {TILES.map((tile) => {
          const on = settings[tile.key];
          return (
            <button
              key={tile.key}
              type="button"
              className="tray-tile"
              data-on={on ? "true" : undefined}
              aria-pressed={on}
              onClick={() => toggleTile(tile.key)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                minHeight: 44,
                padding: "0 12px",
                borderRadius: 8,
                cursor: "pointer",
                font: "500 12px var(--dt-sans, sans-serif)",
                textAlign: "left",
                transition:
                  "background 300ms cubic-bezier(.2,1.2,.4,1), color 300ms cubic-bezier(.2,1.2,.4,1), border-color 300ms cubic-bezier(.2,1.2,.4,1), transform 150ms ease",
              }}
            >
              <tile.icon size={16} strokeWidth={1.5} aria-hidden="true" />
              <span>{tile.label}</span>
            </button>
          );
        })}
      </div>
      <div className="tray-flyout__sliders" style={{ display: "grid", gap: 12, marginTop: 14 }}>
        <label className="tray-slider" style={{ display: "flex", alignItems: "center", gap: 10, color: "#9aa3b5" }}>
          <Volume2 size={14} strokeWidth={1.5} aria-hidden="true" />
          <input
            type="range"
            min={0}
            max={100}
            value={settings.volume}
            onChange={(event) => onChange({ volume: Number(event.target.value) })}
            aria-label="Volume"
            style={{ flex: 1, minWidth: 0, accentColor: "#ff5f00" }}
          />
          <span
            style={{
              minWidth: 26,
              color: "#edf0f6",
              font: "11px var(--dt-mono, monospace)",
              fontVariantNumeric: "tabular-nums",
              textAlign: "right",
            }}
          >
            {settings.volume}
          </span>
        </label>
        <label className="tray-slider" style={{ display: "flex", alignItems: "center", gap: 10, color: "#9aa3b5" }}>
          <Sun size={14} strokeWidth={1.5} aria-hidden="true" />
          <input
            type="range"
            min={0}
            max={100}
            value={settings.brightness}
            onChange={(event) => onChange({ brightness: Number(event.target.value) })}
            aria-label="Brightness"
            style={{ flex: 1, minWidth: 0, accentColor: "#ff5f00" }}
          />
          <span
            style={{
              minWidth: 26,
              color: "#edf0f6",
              font: "11px var(--dt-mono, monospace)",
              fontVariantNumeric: "tabular-nums",
              textAlign: "right",
            }}
          >
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

const CAL_NAV: CSSProperties = {
  display: "grid",
  placeItems: "center",
  width: 28,
  height: 28,
  borderRadius: 6,
  cursor: "pointer",
  transition: "background 200ms ease, color 200ms ease",
};

type CalendarFlyoutProps = {
  /** visible state of the mount pattern (false renders the exit pose) */
  open: boolean;
  /** reduced motion: no transition styles at all */
  reduced: boolean;
};

/** the calendar flyout: month head with prev/next, weekday row and the real
 * date grid of the viewed month — pure state, no storage */
export function CalendarFlyout({ open, reduced }: CalendarFlyoutProps) {
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
      className="cal-flyout"
      id="dt-calendar"
      role="dialog"
      aria-label="Calendar"
      data-hide={open ? undefined : "true"}
      data-flyout-keep="true"
      style={{
        ...FLYOUT_ACRYLIC,
        position: "fixed",
        top: "calc(var(--shell-top, 48px) + 12px)",
        right: 12,
        zIndex: "var(--z-menu, 60)",
        width: 340,
        padding: 16,
        ...flyoutMotion(open, reduced),
      }}
    >
      <div
        className="cal-head"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}
      >
        <strong style={{ font: "600 14px var(--font-display, var(--dt-sans, sans-serif))", letterSpacing: "-.01em" }}>
          {new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(view)}
        </strong>
        <span style={{ display: "flex", gap: 2 }}>
          <button type="button" aria-label="Previous month" onClick={() => shift(-1)} style={CAL_NAV}>
            <ChevronLeft size={15} strokeWidth={1.5} aria-hidden="true" />
          </button>
          <button type="button" aria-label="Next month" onClick={() => shift(1)} style={CAL_NAV}>
            <ChevronRight size={15} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </span>
      </div>
      <div
        className="cal-dow"
        aria-hidden="true"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          marginBottom: 6,
          color: "#6b7383",
          font: "600 9px var(--dt-mono, monospace)",
          letterSpacing: ".08em",
          textAlign: "center",
        }}
      >
        {WEEKDAYS.map((day) => (
          <span key={day.key}>{day.letter}</span>
        ))}
      </div>
      <div className="cal-grid" style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
        {leading > 0 && <span aria-hidden="true" style={{ gridColumn: `span ${leading}` }} />}
        {days.map((day) => {
          const today = day === now.getDate() && month === now.getMonth() && year === now.getFullYear();
          return (
            <button
              key={day}
              type="button"
              className="cal-day"
              data-today={today ? "true" : undefined}
              aria-label={new Intl.DateTimeFormat(undefined, { dateStyle: "full" }).format(new Date(year, month, day))}
              aria-current={today ? "date" : undefined}
              style={{
                display: "grid",
                placeItems: "center",
                width: 32,
                height: 32,
                justifySelf: "center",
                borderRadius: "50%",
                cursor: "pointer",
                font: "500 12px var(--dt-mono, monospace)",
                fontVariantNumeric: "tabular-nums",
                transition: "background 200ms ease, color 200ms ease, box-shadow 200ms ease",
              }}
            >
              {day}
            </button>
          );
        })}
      </div>
    </section>
  );
}
