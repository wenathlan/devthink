/** Design: the onboarding tour — three short steps docked at the lower left
 * after the workspace opens for the first time. The seen flag lives in
 * localStorage and every control is a real focusable button. */
import { useCallback, useEffect, useRef, useState } from "react";

const ONBOARD_KEY = "devthink.onboard.seen";

const steps = [
  {
    title: "This is your local OS",
    body: "Sessions, tabs and preferences live in this browser. Pair the local CLI to share them with the workbench.",
  },
  {
    title: "One rail, every destination",
    body: "The left rail walks through chat, gateway, providers, usage and the family applications.",
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

  useEffect(() => {
    if (!open) return;
    dockRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") finish();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, finish]);

  if (!open) return null;
  const current = steps[step];
  const last = step === steps.length - 1;

  return (
    <aside className="onboard-dock" ref={dockRef} aria-label="DevThink onboarding tour" role="dialog" aria-live="polite">
      <p className="onboard-dock__step">
        step {step + 1} of {steps.length}
      </p>
      <h2>{current.title}</h2>
      <p>{current.body}</p>
      <div className="onboard-dock__row">
        <span className="onboard-dock__dots" aria-hidden="true">
          {steps.map((item, index) => (
            <i key={item.title} className={index === step ? "on" : ""} />
          ))}
        </span>
        <span style={{ display: "inline-flex", gap: 6 }}>
          <button type="button" className="onboard-dock__skip" onClick={finish}>
            skip
          </button>
          <button type="button" className="onboard-dock__next" onClick={() => (last ? finish() : setStep(step + 1))}>
            {last ? "start working" : "next"} <span aria-hidden="true">→</span>
          </button>
        </span>
      </div>
    </aside>
  );
}
