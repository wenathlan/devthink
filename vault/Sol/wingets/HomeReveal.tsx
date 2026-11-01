/**
 * Reveal.tsx — the GSAP entrance of the product face: the console zone
 * rides one ScrollTrigger reveal — the section fades and rises when it
 * enters the viewport, the `[data-reveal]` children stagger behind it
 * (the doctrine stagger law — GSAP reserved for stagger, text and
 * scroll-scrub; the CSS entrances keep the rest). The module loads through
 * a dynamic import (the static bundle never carries gsap), the reduced
 * motion document skips the whole rig, and the cleanup reverts the
 * context — zero tween leaks on unmount. Without JavaScript (or before
 * the tween arms) the children stand visible: the animation animates
 * FROM the pose, never TO it.
 */

import { type ReactNode, useEffect, useRef } from "react";

/** the viewport line the reveal arms at (the doctrine 85% rule). */
const ARM_AT = "top 85%";

/** the stagger step of the children (seconds — the gsap clock). */
const STAGGER = 0.08;

/** the rise distance the pose animates from (pixels). */
const RISE = 18;

/**
 * The revealed zone: wraps the console surfaces with the gsap rig.
 *
 * @param props the children to reveal.
 * @returns the wrapper element.
 */
export function Reveal({ children }: { children: ReactNode }) {
  const holder = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = holder.current;
    if (!host) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;
    let revert: (() => void) | null = null;

    void (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      if (cancelled || !host) return;
      gsap.registerPlugin(ScrollTrigger);
      const context = gsap.context(() => {
        gsap.fromTo(
          host,
          { opacity: 0, y: RISE },
          {
            opacity: 1,
            y: 0,
            duration: 0.64,
            ease: "power3.out",
            scrollTrigger: { trigger: host, start: ARM_AT, once: true },
          },
        );
        const rows = host.querySelectorAll("[data-reveal]");
        if (rows.length > 0) {
          gsap.fromTo(
            rows,
            { opacity: 0, y: RISE },
            {
              opacity: 1,
              y: 0,
              duration: 0.5,
              ease: "power3.out",
              stagger: STAGGER,
              scrollTrigger: { trigger: host, start: ARM_AT, once: true },
            },
          );
        }
      }, host);
      revert = () => context.revert();
    })();

    return () => {
      cancelled = true;
      if (revert) revert();
    };
  }, []);

  return (
    <div className="vc-reveal" ref={holder}>
      {children}
    </div>
  );
}

export default Reveal;
