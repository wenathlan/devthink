/**
 * familyframe.tsx — the family surfaces of the window registry: the window
 * body and the fullscreen stage. The real apps ride their repository
 * subpaths (the power clip). The frames are same-origin (every theme deploys
 * under the same site) and carry the app title for the accessibility tree.
 * Loose components of the window registry.
 */
import { osAppLabels } from "../../catalog.ts";
import { familyurl } from "../../gateway.ts";

/** the display title of a family app: the catalog label row answers (the
 * reviewed seed serves offline), the slug stays the honest fallback when a
 * row has not landed yet — the window title never rides a hardcoded
 * literal, the label law holds on both family surfaces */
function familytitle(slug: string): string {
  return osAppLabels()[slug]?.name ?? slug;
}

/** FamilyFrame — one family app inside the window. the src asks the same
 * document the direct url answers and appends the opt-in clip flag
 * (?clip=1): the flag only tells the app it rides the power clip — a
 * sibling that reads it may compact its chrome to the window band, a
 * sibling that does not keeps answering exactly as before. the window-era
 * law: same design, the space clamps — the flag never changes the design,
 * only the window frame around it. */
export function FamilyFrame({ slug, title }: { slug: string; title?: string }) {
  return (
    <iframe
      src={`${familyurl(slug)}?clip=1`}
      title={title ?? familytitle(slug)}
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        border: "0",
        background: "#ffffff" }}
    />
  );
}

/** FamilyStage — the family app at the address bar: DevThink barra <app> is
 * the normal app, one hundred percent. No shell, no window, no chrome — the
 * app owns the whole viewport. The window only exists inside the OS (the
 * panel workspace power clip). */
export function FamilyStage({ slug }: { slug: string }) {
  return (
    <iframe
      src={familyurl(slug)}
      title={familytitle(slug)}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        border: "0",
        background: "#ffffff" }}
    />
  );
}
