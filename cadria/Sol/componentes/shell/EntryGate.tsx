/**
 * EntryGate — the entry-flow gate of the reform law: the home route never
 * renders before the visitor's seen flags answer. The gate only READS the
 * flags (onboardingstate.ts stays the ONE writer), decides through the pure
 * entrytarget contract and hands the visit over with a replace navigation so
 * the back button never replays the gate. The render stays null while the
 * state is consulted — the first paint never flashes the home behind the
 * flow, and a visitor who already saw both stages mounts the home directly.
 */
import { type ReactNode, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { entrytarget, readOnboardingState, type VisitorOnboarding } from "../../../onboardingstate.ts";

export default function EntryGate({ children }: { children: ReactNode }) {
  const [, navigate] = useLocation();
  const [flags, setFlags] = useState<VisitorOnboarding | null>(null);

  useEffect(() => {
    let alive = true;
    void readOnboardingState().then((state) => {
      if (alive) setFlags(state);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!flags) return;
    const target = entrytarget(flags);
    if (target !== "/") navigate(target, { replace: true });
  }, [flags, navigate]);

  if (!flags) return null;
  if (entrytarget(flags) !== "/") return null;
  return <>{children}</>;
}
