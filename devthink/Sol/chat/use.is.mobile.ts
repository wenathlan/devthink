/**
 * use.is.mobile.ts — one matchMedia subscription for the chat subapp: the
 * rail becomes a drawer and the session panel an overlay below 860px, and
 * the scrim/Escape behavior needs that fact in JS, not only in CSS.
 */
import { useEffect, useState } from "react";

const QUERY = "(max-width: 860px)";

/** useIsMobile — true while the viewport matches the drawer breakpoint. */
export function useIsMobile(): boolean {
  const [mobile, setMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia(QUERY).matches
  );

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const onChange = (e: MediaQueryListEvent) => setMobile(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return mobile;
}
