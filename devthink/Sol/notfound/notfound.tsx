/**
 * notfound page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */
import { AlertCircle, Home } from "lucide-react";
import { useLocation } from "wouter";
import { ShellChrome } from "../shell/ShellChrome";

export default function NotFound() {
  const [, setLocation] = useLocation();

  const handleGoHome = () => {
    setLocation("/");
  };

  return (
    <>
      <ShellChrome />
      <main className="notfound-page">
        <section className="notfound-card">
          <div className="notfound-card__icon">
            <AlertCircle size={44} />
          </div>
          <h1>404</h1>
          <h2>Page Not Found</h2>
          <p>
            Sorry, the page you are looking for doesn&apos;t exist.
            <br />
            It may have been moved or deleted.
          </p>
          <div className="notfound-card__actions">
            <button type="button" onClick={handleGoHome}>
              <Home size={15} />
              Go Home
            </button>
          </div>
        </section>
      </main>
    </>
  );
}
