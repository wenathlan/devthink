/**
 * onboard.tsx — the onboarding tour — three short steps docked at the lower
 * left after the desktop opens for the first time. The steps point at the
 * icon grid, the taskbar dock and the start menu. The seen flag lives in
 * localStorage and every control is a real focusable button; progress is a
 * thin ladder bar, never dots. The dock is keyboard-first: Enter advances
 * (the buttons keep their native activation), Escape skips the tour.
 */
import { useCallback, useEffect, useRef, useState } from "react";

const ONBOARD_KEY = "devthink.onboard.seen";

const steps = [
  {
    title: "This is your local OS",
    body: "The apps live on the desktop as icons: click one to open it. Drag a window title bar, snap to a side, or throw a window at the top edge to maximize it.",
  },
  {
    title: "Start, dock and omnibox",
    body: 'The start button up top opens every app; the dock below keeps the session, history and the family apps one click away. The omnibox stays clean at "/".',
  },
  {
    title: "Commands everywhere",
    body: "Press ctrl+K or use the command button to reach any destination without leaving the keyboard.",
  },
];

function readSeen(): boolean {
  try {
    return window.localStorage.getItem(ONBOARD_KEY) === "1";
  } catch {
    return true;
  }
}

export function OnboardingTour() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const dockRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (readSeen()) return;
    const timer = window.setTimeout(() => setOpen(true), 650);
    return () => window.clearTimeout(timer);
  }, []);

  const finish = useCallback(() => {
    setOpen(false);
    try {
      window.localStorage.setItem(ONBOARD_KEY, "1");
    } catch {
      // storage may be unavailable; the tour simply shows again next visit
    }
  }, []);

  const next = useCallback(() => {
    setStep((current) => {
      if (current >= steps.length - 1) {
        finish();
        return current;
      }
      return current + 1;
    });
  }, [finish]);

  useEffect(() => {
    if (!open) return;
    dockRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") finish();
      // Enter advances from anywhere except the buttons, which activate
      // natively — this keeps one Enter from stepping forward twice
      if (event.key === "Enter" && !(event.target instanceof HTMLButtonElement)) {
        event.preventDefault();
        next();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, finish, next]);

  if (!open) return null;
  const current = steps[step];
  const last = step === steps.length - 1;

  return (
    <aside
      className="onboard-dock"
      ref={dockRef}
      aria-label="DevThink onboarding tour"
      role="dialog"
      aria-live="polite"
    >
      <p className="onboard-dock__step">
        step {step + 1} of {steps.length}
      </p>
      {/* the keyed body: every step change replays the single 320ms entrance
          (one orchestrated reveal per step, reduced-motion guarded in css) */}
      <div className="onboard-dock__body" key={step}>
        <h2>{current.title}</h2>
        <p>{current.body}</p>
      </div>
      <div className="onboard-dock__row">
        <span className="onboard-dock__ticks" aria-hidden="true">
          {steps.map((item, index) => (
            <i key={item.title} className={index === step ? "on" : ""} />
          ))}
        </span>
        <span style={{ display: "inline-flex", gap: 6 }}>
          <button type="button" className="onboard-dock__skip" onClick={finish}>
            skip
          </button>
          <button type="button" className="onboard-dock__next" onClick={last ? finish : next}>
            {last ? "start working" : "next"} <span aria-hidden="true">→</span>
          </button>
        </span>
      </div>
    </aside>
  );
}
