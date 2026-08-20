import { AlertCircle, Home } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  const handleGoHome = () => {
    setLocation("/");
  };

  return <main className="notfound-page"><section className="notfound-card"><div className="notfound-card__icon"><AlertCircle size={44} /></div><h1>404</h1><h2>Page Not Found</h2><p>Sorry, the page you are looking for doesn&apos;t exist.<br />It may have been moved or deleted.</p><div className="notfound-card__actions"><button onClick={handleGoHome}><Home size={15} />Go Home</button></div></section></main>;
}
