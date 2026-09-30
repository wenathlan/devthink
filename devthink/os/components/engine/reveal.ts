/* ==========================================================================
   reveal.ts — reveal on scroll (porta do engine.js): IntersectionObserver
   adiciona .in nos .reveal quando entram no viewport (threshold 0.12).
   Reduced-motion (OS ou toggle do app) revela tudo de imediato.
   ========================================================================== */

"use client";

import { useEffect } from "react";

function motionReduced(): boolean {
  if (typeof window === "undefined") return true;
  if (document.documentElement.dataset.motion === "reduced") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Observa todos os .reveal ainda não revelados dentro do documento. */
export function observeReveals(): () => void {
  if (typeof document === "undefined") return () => {};
  const els = Array.from(document.querySelectorAll<HTMLElement>(".reveal:not(.in)"));
  if (els.length === 0) return () => {};

  if (motionReduced() || typeof IntersectionObserver === "undefined") {
    els.forEach((el) => el.classList.add("in"));
    return () => {};
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  els.forEach((el) => io.observe(el));
  return () => io.disconnect();
}

/** Hook: roda a cada mudança de view/página (deps do chamador). */
export function useReveal(deps: unknown[]): void {
  useEffect(() => observeReveals(), deps); // eslint-disable-line react-hooks/exhaustive-deps
}
