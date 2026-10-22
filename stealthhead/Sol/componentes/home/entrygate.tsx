// the entry gate of the stealthhead home.
/**
 * entrygate.tsx — the entry gate of the APPLICATION (the flow law: intro →
 * onboarding → the platform). The home anchor mounts it on the "/" route:
 * on mount it reads the visitor onboarding state through the one accessor
 * (onboardingstate.ts — database, cache, memory) and, while the read
 * resolves, renders null so the stage never flashes the home behind the
 * gate. An unseen intro navigates to /intro; an unseen onboarding to
 * /onboarding; both seen, the home renders normally and the gate steps out
 * of the way. The gate only reads — marking the stages seen belongs to the
 * pages that show them.
 */

import { type ReactNode, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { readOnboardingState } from "../../../onboardingstate.ts";

/** the gate lifecycle: resolving (render null) → through (the home shows). */
type GatePhase = "resolving" | "through";

/**
 * The entry gate wrapping the platform home.
 *
 * @param children the home surface revealed when the flow is through.
 * @returns the gated element.
 */
export function EntryGate({ children }: { children: ReactNode }) {
  const [, navigate] = useLocation();
  const [phase, setPhase] = useState<GatePhase>("resolving");

  useEffect(() => {
    let live = true;
    readOnboardingState().then((state) => {
      if (!live) return;
      if (!state.introseen) navigate("/intro", { replace: true });
      else if (!state.onboardingseen) navigate("/onboarding", { replace: true });
      else setPhase("through");
    });
    return () => {
      live = false;
    };
  }, [navigate]);

  return phase === "through" ? children : null;
}

export default EntryGate;
