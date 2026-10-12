/**
 * intro page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. The intro runs at "/" on the first paint of every cold load and
 * hands the surface to the next page of the flow.
 */

/** Style: DevThink ONE intro — the owner doctrine: ONE interface serves every
 * build target; what changes per target is the TYPE OF INTRO and the
 * hand-over sequence. Every variant stages the same PISO AKASH (the motion
 * kit beside this anchor, akash.ts): the mark lands on the ONE spring
 * (stiffness 300, damping 15), the wordmark rises on backOut, the stage
 * leaves on the 0.8s slide-up — the web and android targets add the tile
 * zoom of their expansion on the sheet curve — and no target ever shows
 * loading dots. The build declares its target through
 * VITE_DT_TARGET (resolved by the root module introtarget.ts): every target
 * plays its one variant. The seen state of the flow is the CATALOGUED
 * visitor state (root module onboardingstate.ts — the only writer): when
 * the onboarding was already seen the intro never replays (straight to
 * /explore); when only the intro was seen the visitor goes straight to
 * /onboarding; otherwise the intro plays once and hands the surface to
 * /onboarding, raising the intro flag on the way out. The bell is opt-in
 * only (localStorage dt.intro.sound === "on"; default mute, autoplay-safe).
 * The gate renders nothing while the state is being read — nothing flashes. */
import { useCallback, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { readonboardingstate, writeonboardingstage } from "../../onboardingstate";
import { type IntroTarget, resolveintrotarget } from "../../introtarget";
import { AndroidIntro } from "./androidintro.tsx";
import { playIntroChime } from "./chime.ts";
import { InstallerIntro } from "./installerintro.tsx";
import { WebIntro } from "./webintro.tsx";

export * from "./androidintro.tsx";
export * from "./chime.ts";
export * from "./installerintro.tsx";
export * from "./webintro.tsx";

/**
 * The route the intro hands over to, per build target: the entry flow of the
 * doctrine is intro → the onboarding tour (/onboarding) → the landing SaaS
 * (/explore) → the authentication page-app (/auth) → the OS desktop
 * (/panel). The web target opens the tour first; the owned targets
 * (installer, android, extension) share the same chain — the tour is part of
 * the ONE interface. The target stays a parameter so a future per-target
 * sequence keeps its seam.
 *
 * @param target the resolved build target.
 * @returns the route of the next page in the entry flow.
 */
export function introHandover(target: IntroTarget): string {
  void target;
  return "/onboarding";
}

/** The gate poses of the intro page while (and after) it reads the catalogued
 * visitor state: "reading" renders nothing, "play" mounts the variant, the
 * seen poses redirect without any animation. */
type introgate = "reading" | "play" | "onboarding" | "explore";

/** The intro page: resolves the target, consults the catalogued onboarding
 * state (the DB-backed flag through onboardingstate.ts) and either plays the
 * one variant the build target declared or walks straight into the flow. */
export default function Intro() {
  const target = resolveintrotarget(import.meta.env.VITE_DT_TARGET as string | undefined);
  const [, navigate] = useLocation();
  const [gate, setGate] = useState<introgate>("reading");

  useEffect(() => {
    let alive = true;
    readonboardingstate().then((state) => {
      if (!alive) return;
      // the seen ladder: onboarding seen buries the intro forever; intro seen
      // goes straight to the tour; a fresh visitor watches it once
      if (state.onboardingseen) setGate("explore");
      else if (state.introseen) setGate("onboarding");
      else setGate("play");
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (gate === "explore") navigate("/explore");
    if (gate === "onboarding") navigate("/onboarding");
  }, [gate, navigate]);

  const done = useCallback(() => {
    playIntroChime();
    writeonboardingstage("intro");
    navigate(introHandover(target));
  }, [navigate, target]);

  if (gate !== "play") return null;
  if (target === "web") return <WebIntro onDone={done} />;
  if (target === "android") return <AndroidIntro onDone={done} />;
  return <InstallerIntro onDone={done} />;
}
