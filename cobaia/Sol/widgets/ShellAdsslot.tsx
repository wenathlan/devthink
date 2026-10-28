/**
 * adsslot.tsx — the honest ad container of the content pages. The component
 * renders a RESERVED box only: a fixed aspect-ratio container on a hairline
 * well, a visible mono label reading "advertisement", and an honest empty
 * state — a hairline box breathing on the opacity-only skeleton shimmer —
 * while no slot id is configured. The container never shifts the page
 * and never sits beside a call to action.
 *
 * THE SCRIPT RULE: no ad network script lives in this repository. The
 * AdSense (or equivalent) loader enters ONLY after the network approves the
 * site, injected through the deploy environment (an env-bound snippet
 * mounted inside the reserved box) — it is never committed here, and this
 * component makes zero network calls by design. While the slot id in
 * adsconfig.ts stays empty, the visitor sees the honest placeholder. No
 * automated traffic ever touches an ad surface.
 */
import type { CSSProperties } from "react";
import { ADS_EMPTY, ADS_LABEL, adsslotfor, adsslotlive } from "../../adsconfig.ts";
import { labelfill } from "../../labels";

type AdSlotProps = {
  /** the content page the slot belongs to (home, apps, blog) */
  page: string;
};

/** The reserved ad slot of one content page: honest container, zero scripts. */
export function AdSlot({ page }: AdSlotProps) {
  const slot = adsslotfor(page);
  if (!slot) return null;
  const live = adsslotlive(slot);
  return (
    <aside className="cb-ads" aria-label={ADS_LABEL} style={{ "--cb-ads-ratio": slot.ratio } as CSSProperties}>
      <span className="cb-adslabel">{ADS_LABEL}</span>
      <div className="cb-adsbox">
        {live ? (
          // the reserved container: the network script mounts here after
          // approval, injected by the deploy environment — never committed
          <span className="cb-adsnote">{labelfill("ads.slot.reserved", { format: slot.format })}</span>
        ) : (
          <span className="cb-empty cb-skel">{ADS_EMPTY}</span>
        )}
      </div>
    </aside>
  );
}

export default AdSlot;
