/**
 * familyframe.tsx — the window body of a family application: the real app
 * riding its repository subpath inside the os window (the power clip). The
 * frame is same-origin (every theme deploys under the same site), fills the
 * window body and carries the app title for the accessibility tree. Loose
 * component of the window registry.
 */
import { familyurl } from "../../deploybase.ts";

/** FamilyFrame — one family app inside the window. */
export function FamilyFrame({ slug, title }: { slug: string; title: string }) {
  return (
    <iframe
      src={familyurl(slug)}
      title={title}
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        border: "0",
        background: "#ffffff",
      }}
    />
  );
}
