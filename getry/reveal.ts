/**
 * reveal.ts — the scroll reveal of the Sol design engine.
 *
 * observes the `.reveal` elements inside the page and flips the `in`
 * class when they enter the viewport, so the css keyframe (riseIn) plays
 * once per element. pure DOM class toggling: no timers, no storage, no
 * network, and the prefers-reduced-motion media query in the css keeps
 * the animation off for the visitors who ask for stillness. every getry
 * page calls it once on mount (home, versions, thinking, sessions).
 */

/** the single observer reused by every page mount. */
let observer: IntersectionObserver | null = null;

/**
 * ensures the shared observer exists (the constructor stays behind a
 * feature check so ancient hosts simply skip the reveal pass).
 *
 * @returns the observer, or null when the host lacks the api.
 */
function ensureobserver(): IntersectionObserver | null {
  if (observer) return observer;
  if (typeof IntersectionObserver === "undefined") return null;
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          observer?.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.12 },
  );
  return observer;
}

/**
 * observes every `.reveal` element under the given root (defaults to the
 * whole document). call once after a page mounts.
 *
 * @param root the element to scan for reveal targets.
 */
export function observeReveals(root: ParentNode = document): void {
  const io = ensureobserver();
  const targets = root.querySelectorAll(".reveal");
  if (!io) {
    /* no observer support: show everything immediately, no animation. */
    targets.forEach((target) => {
      target.classList.add("in");
    });
    return;
  }
  targets.forEach((target) => {
    if (!target.classList.contains("in")) io.observe(target);
  });
}
