/**
 * dockmagnify.tsx — the GSAP magnification of the floating dock pad (the
 * winget the shell chrome wires): the pointer rides the pad, every icon
 * face answers the gaussian bump of dockmagnify.ts (scale = 1 + max ×
 * exp(−d²/2σ²), the falloff the interactions catalog pinned) through one
 * gsap.quickTo per face — no tween is ever created per frame — and the
 * leave plays the elastic.out return. The faces grow from their bottom
 * edge (transform-origin 50% 100%), so the pad reads as the magnifying
 * dock: the pointer icon lifts, the neighbors answer the tail. The whole
 * field dies on unmount (every tween killed, the inline transforms
 * cleared) and never arms under prefers-reduced-motion — the motion law.
 */
import { type RefObject, useEffect } from "react";
import { DOCK_MAGNIFY_MAX, DOCK_MAGNIFY_SPREAD, magnifyscale } from "../../dockmagnify.ts";
import { gsap } from "gsap";

/** the leave return: the elastic settle of the house (a soft 0.7s, one
 * gentle overshoot) — the field springs back to rest */
const RETURN_EASE = "elastic.out(1, 0.45)";
const RETURN_SECONDS = 0.7;

type DockMagnifyOptions = {
  /** the element that owns the tracked faces (the bar cluster) */
  surfaceRef: RefObject<HTMLElement | null>;
  /** the face selector inside the surface (the 38px icon faces) */
  faceSelector?: string;
  /** the magnification runs only on the floating pad without reduced
   * motion — false parks the hook entirely */
  enabled: boolean;
};

/**
 * useDockMagnification — the pointer tracking of the floating pad. One
 * quickTo setter per face answers the gaussian falloff on every pointer
 * move; the leave springs the whole field back on the elastic curve; the
 * face centers re-measure on resize. Cleanup is total: the listeners die,
 * every tween is killed and the inline transforms return to the stylesheet.
 */
export function useDockMagnification({ surfaceRef, faceSelector = ".dt-nav__app-face", enabled }: DockMagnifyOptions): void {
  useEffect(() => {
    const surface = surfaceRef.current;
    if (!enabled || !surface) return undefined;
    const faces = Array.from(surface.querySelectorAll<HTMLElement>(faceSelector));
    if (faces.length === 0) return undefined;

    const centers = faces.map((face) => {
      const rect = face.getBoundingClientRect();
      return {
        element: face,
        x: rect.left + rect.width / 2,
        scale: gsap.quickTo(face, "scale", { duration: 0.22, ease: "power3.out" }),
      };
    });
    const measure = () => {
      for (const face of centers) {
        const rect = face.element.getBoundingClientRect();
        face.x = rect.left + rect.width / 2;
      }
    };
    const onMove = (event: PointerEvent) => {
      for (const face of centers) {
        face.scale(magnifyscale(event.clientX - face.x, DOCK_MAGNIFY_MAX, DOCK_MAGNIFY_SPREAD));
      }
    };
    const onLeave = () => {
      gsap.to(faces, { scale: 1, duration: RETURN_SECONDS, ease: RETURN_EASE, overwrite: "auto" });
    };

    gsap.set(faces, { transformOrigin: "50% 100%" });
    surface.addEventListener("pointermove", onMove);
    surface.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", measure);
    return () => {
      surface.removeEventListener("pointermove", onMove);
      surface.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", measure);
      gsap.killTweensOf(faces);
      gsap.set(faces, { clearProps: "scale,transformOrigin" });
    };
  }, [enabled, faceSelector, surfaceRef]);
}
