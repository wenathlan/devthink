/**
 * notfound page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

/**
 * NotFound.tsx — the 404 panel of the getry Sol theme: one card, one
 * way home.
 */
import { ErrorCircleRegular, HomeRegular } from "@fluentui/react-icons";
import { useLocation } from "wouter";
import { label } from "../../labels";

/**
 * the not found page.
 *
 * @returns the not found element.
 */
export default function NotFound() {
  const [, setLocation] = useLocation();

  const handleGoHome = () => {
    setLocation("/");
  };

  return (
    <main className="notfound-page">
      <section
        className="surface-card"
        style={{ maxWidth: 460, margin: "8vh auto", padding: 36, borderRadius: 24, textAlign: "center" }}
      >
        <div style={{ display: "grid", placeItems: "center", gap: 12 }}>
          <span className="badge error" style={{ gap: 8 }}>
            <ErrorCircleRegular fontSize={13} />
            404
          </span>
          <h2 className="font-bold-tier" style={{ margin: 0 }}>
            {label("notfound.title")}
          </h2>
          <p className="font-thin-tier">
            {label("notfound.lede1")}
            <br />
            {label("notfound.lede2")}
          </p>
          <div>
            <button
              type="button"
              className="btn-tactile-3d"
              style={{ minHeight: 44, padding: "0 24px", borderRadius: "calc(infinity * 1px)" }}
              onClick={handleGoHome}
            >
              <HomeRegular fontSize={15} />
              {label("notfound.backHome")}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
