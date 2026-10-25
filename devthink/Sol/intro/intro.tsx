/**
 * intro page anchor — layer 3 of the anchor architecture. The file carrying
 * the folder's own name is the path manager of the page: it imports the
 * loose components beside it, mounts the page and re-exports the public
 * component surface. Only the theme anchor (Sol/Sol.tsx) consumes this
 * file.
 *
 * The owner doctrine: TWO faces, ONE interface. The web targets (web,
 * extension, android) play the SaaS face — the approved landing this folder
 * rebuilds from zero (saas.tsx on the saaskit sections). The owned targets
 * (desktop, installer) play the system boot — the Windows sequence of
 * hello, loading logo, landscape clock and lock screen (boot.tsx). The
 * handover lands on the login face (/auth) for the web targets — the
 * presentation is the face, the login is the same face of the OS, and the
 * panel is the last page of the chain. The owned targets hand straight to
 * the desktop (/panel): the boot IS their intro. A returning visitor skips
 * the play entirely and walks the handover. The onboarding tour stays a
 * routable sub-page, out of the main chain.
 */
import { useCallback, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { type IntroTarget, resolveintrotarget } from "../../introtarget";
import { readonboardingstate, writeonboardingstage } from "../../onboardingstate";
import { Boot, Saas } from "../widgets";

export type { IntroTarget } from "../../introtarget.ts";

/**
 * Resolves the handover route of the intro: the login face for the web
 * targets, the desktop for the owned ones.
 *
 * @param target the resolved build target.
 * @returns the route of the next page in the entry chain.
 */
export function introhandover(target: IntroTarget): string {
  return target === "desktop" || target === "installer" ? "/panel" : "/auth";
}

/** The owned targets (desktop, installer) play the system boot; every web
 * target plays the SaaS face. */
function ownsboot(target: IntroTarget): boolean {
  return target === "desktop" || target === "installer";
}

/** The gate poses of the intro page: "reading" renders nothing while the
 * catalogued visitor state loads, "play" mounts the face of the target,
 * "enter" walks the handover. */
type introgate = "reading" | "play" | "enter";

/** The intro page: resolves the target, consults the catalogued onboarding
 * state and either plays the face or walks straight into the chain. */
export default function Intro() {
  const target = resolveintrotarget(import.meta.env.VITE_DT_TARGET as string | undefined);
  const [, navigate] = useLocation();
  const [gate, setGate] = useState<introgate>("reading");

  useEffect(() => {
    let alive = true;
    readonboardingstate().then((state) => {
      if (!alive) return;
      // a returning visitor never replays the face: the handover IS the
      // ladder — login on the web targets, desktop on the owned ones
      setGate(state.onboardingseen || state.introseen ? "enter" : "play");
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (gate === "enter") navigate(introhandover(target));
  }, [gate, navigate, target]);

  /** the face finished: the intro flag rises and the chain walks on */
  const done = useCallback(() => {
    writeonboardingstage("intro");
    navigate(introhandover(target));
  }, [navigate, target]);

  if (gate !== "play") return null;
  return ownsboot(target) ? <Boot onDone={done} /> : <Saas onDone={done} />;
}
