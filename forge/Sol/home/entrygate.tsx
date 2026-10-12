// the entry gate of the forge home.
/**
 * entrygate.tsx — the entry gate of the APPLICATION (the flow contract of the
 * reform): the home route consults this component before rendering anything.
 * On mount it reads the first-run state from onboardingstate (the DB-backed
 * accessor — the offline cache answers the fast path, the platform gateway
 * reconciles in the background); while the state is still unknown it renders
 * null (no flash of the window), when the intro is unseen it replaces the
 * route with /intro, when only the onboarding is unseen it replaces with
 * /onboarding, and only a visitor that finished the flow ever sees the home.
 * The gate never writes: marking the stages belongs to the intro and the
 * onboarding pages.
 */
import { type ReactNode, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { loadOnboardingState, type OnboardingSnapshot, readOnboardingState } from "../../onboardingstate";

/** the verdict of the gate: still resolving, or the route the visitor belongs to */
type GateVerdict = "resolving" | "intro" | "onboarding" | "home";

/**
 * Resolves the gate verdict from a seen-state snapshot (the flow order:
 * intro first, then onboarding, then the home).
 *
 * @param state the resolved snapshot.
 * @returns the verdict the gate acts on.
 */
function verdictOf(state: OnboardingSnapshot): GateVerdict {
  if (!state.introseen) return "intro";
  if (!state.onboardingseen) return "onboarding";
  return "home";
}

/**
 * The synchronous first verdict: the offline cache answers instantly so a
 * returning visitor never flashes; unknown state falls to the async resolve.
 *
 * @returns the initial verdict of the gate.
 */
function initialVerdict(): GateVerdict {
  const state = readOnboardingState();
  return state ? verdictOf(state) : "resolving";
}

/**
 * The entry gate wrapping the home: null while resolving, a replace-navigation
 * to the missing first-run stage, the home content once the flow is done.
 *
 * @param props the home children rendered behind the gate.
 * @returns the gated home element.
 */
export function EntryGate({ children }: { children: ReactNode }) {
  const [, navigate] = useLocation();
  const [verdict, setVerdict] = useState<GateVerdict>(initialVerdict);

  useEffect(() => {
    let live = true;
    loadOnboardingState().then((state) => {
      if (live) setVerdict((current) => (current === "home" ? current : verdictOf(state)));
    });
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    if (verdict === "intro") navigate("/intro", { replace: true });
    else if (verdict === "onboarding") navigate("/onboarding", { replace: true });
  }, [verdict, navigate]);

  if (verdict !== "home") return null;
  return <>{children}</>;
}

export default EntryGate;
