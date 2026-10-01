/**
 * NotFound.tsx — the 404 panel of the getry Sol theme: one card, one
 * way home.
 */
import { AlertCircle, Home } from "lucide-react";
import { useLocation } from "wouter";

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
      <section className="glass card" style={{ maxWidth: 460, margin: "8vh auto", textAlign: "center" }}>
        <div style={{ display: "grid", placeItems: "center", gap: 12 }}>
          <span className="badge error" style={{ gap: 8 }}>
            <AlertCircle size={13} />
            404
          </span>
          <h2 style={{ margin: 0 }}>Route Not Found</h2>
          <p>
            This route of the gateway does not exist.
            <br />
            It may have been moved or never served.
          </p>
          <div>
            <button type="button" className="btn" onClick={handleGoHome}>
              <Home size={15} />
              back to home
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
