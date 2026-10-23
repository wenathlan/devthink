/**
 * entrygate.tsx — the entry gate of getry (the gateway of the family; the
 * flow law: intro → onboarding → the platform). The home anchor mounts it
 * on the "/" route:
 * the synchronous first verdict answers from the offline layer (the cache
 * mirror) so a returning visitor never flashes, and while the state is
 * still unknown the gate renders null — the stage never shows behind the
 * gate. An unseen intro replaces the route with /intro; an unseen
 * onboarding replaces it with /onboarding; only a visitor that finished the
 * flow ever sees the home. The gate only reads — marking the stages seen
 * belongs to the pages that show them (onboardingstate.ts is the one
 * writer).
 */
import { type ReactNode, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { loadOnboardingState, readOnboardingState, type VisitorOnboarding } from "../../onboardingstate.ts";

/** the gate lifecycle: resolving (render null) → through (the home shows). */
type GatePhase = "resolving" | "through";

/**
 * Reads the gate verdict from a seen-state snapshot (the flow order: intro
 * first, then onboarding, then the home).
 *
 * @param state the resolved flags.
 * @returns true when the visitor finished the flow.
 */
function flowthrough(state: VisitorOnboarding): boolean {
  return state.introseen && state.onboardingseen;
}

/**
 * The entry gate wrapping the platform home.
 *
 * @param children the home surface revealed when the flow is through.
 * @returns the gated element.
 */
export function EntryGate({ children }: { children: ReactNode }) {
  /* the embedded pass is the bare stage: inside the os window the first-run
   * flow belongs to the shell, so the frame lands straight home — the frame
   * of a mount never changes, the hooks stay unconditional for the lint */
  const embedded = typeof window !== "undefined" && window.self !== window.top;
  const [, navigate] = useLocation();
  const [phase, setPhase] = useState<GatePhase>(() => {
    if (embedded) return "through";
    const known = readOnboardingState();
    return known !== null && flowthrough(known) ? "through" : "resolving";
  });

  useEffect(() => {
    if (embedded) return;
    // the fast path: the cache already knows a missing stage — replace at once
    const known = readOnboardingState();
    if (known && !flowthrough(known)) {
      if (!known.introseen) navigate("/intro", { replace: true });
      else navigate("/onboarding", { replace: true });
      return;
    }
    let live = true;
    loadOnboardingState().then((state) => {
      if (!live) return;
      if (!state.introseen) navigate("/intro", { replace: true });
      else if (!state.onboardingseen) navigate("/onboarding", { replace: true });
      else setPhase("through");
    });
    return () => {
      live = false;
    };
  }, [embedded, navigate]);

  return phase === "through" ? children : null;
}

export default EntryGate;
