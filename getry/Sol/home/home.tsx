/**
 * home page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

import { ArrowRight, BrainCircuit, DoorOpen, Route, Users, Zap } from "lucide-react";
/**
 * Home.tsx — the home page of the getry Sol theme: the gateway hero
 * (the AI gateway that was born Next and lives in the house tree), the
 * identity strip and the cards linking the three gateway domains. no
 * tabular data lives here: the page is navigation and gateway copy only.
 */
import { useEffect } from "react";
import { Link } from "wouter";
import { liveversions, totalroutes } from "../../gateway";
import { observeReveals } from "../../reveal";
import { toast } from "../toast/Toast";

/** the three gateway domains of the app (navigation, not data). */
const domains: { href: string; label: string; about: string; icon: typeof DoorOpen }[] = [
  {
    href: "/versions",
    label: "versions",
    about: "The five provider gateways (v1 through v5) with their patterns, models and routes.",
    icon: Route,
  },
  {
    href: "/thinking",
    label: "thinking",
    about: "The 7-level reasoning ladder with the budgets every chat route accepts.",
    icon: BrainCircuit,
  },
  {
    href: "/sessions",
    label: "sessions",
    about: "The session store: rotation state, provider keys and the chat log of the gateway.",
    icon: Users,
  },
];

/**
 * the home page.
 *
 * @returns the home element.
 */
export function Home() {
  useEffect(() => {
    observeReveals();
  }, []);

  return (
    <>
      <section className="hero grain halftone">
        <p className="eyebrow reveal">getry · home</p>
        <h1 className="wordmark reveal">getry</h1>
        <p className="lede reveal">
          The gateway of the family: five provider gateways serve 35 OpenAI-compatible routes with pure byte
          passthrough, the 7-level thinking system, the session store and the key rotation. Born on Next, living as one
          static Sol surface — the Next mirrors ship from the release assets, not from this tree.
        </p>
        <div className="actions reveal">
          <Link href="/versions" className="btn">
            open the versions
            <ArrowRight size={16} />
          </Link>
          <button
            type="button"
            className="btn secondary"
            onClick={() =>
              toast("the routes answer on the self-hosted gateway over HTTPS — this surface stores nothing", "info")
            }
          >
            how the routes answer
          </button>
        </div>
        <div className="importstrip reveal">
          <span className="badge">
            <DoorOpen size={11} />
            v1 zai — passthrough
          </span>
          <span className="badge">
            <Zap size={11} />
            {liveversions().length} gateways live
          </span>
          <span className="badge info">{totalroutes()} routes</span>
          <span className="badge success">pure byte passthrough</span>
        </div>
      </section>

      <section className="section" aria-label="gateway domains">
        <div className="section-head reveal">
          <h2>the three gateway domains</h2>
          <p>
            One lead surface and two supporting entries, fed by the root gateway logics: typed accessors ask the
            self-hosted database over HTTPS and fall back to the in-memory catalog of the static build.
          </p>
        </div>
        <div className="domaincards">
          {domains.map((domain) => {
            const Icon = domain.icon;
            return (
              <Link key={domain.href} href={domain.href} className={`glass glass-hover card domaincard reveal`}>
                <span className="cardicon">
                  <Icon size={19} />
                </span>
                <h3>{domain.label}</h3>
                <p>{domain.about}</p>
                <span className="cardlink">
                  open {domain.label}
                  <ArrowRight size={13} />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="section" aria-label="shipping doctrine">
        <div className="glass card reveal">
          <h2>passthrough by doctrine</h2>
          <p>
            The gateway re-emits the upstream bytes untouched: the parser keeps the stream alive with keepalives, never
            splits a partial SSE frame and masks every model name to devthink. The heavy work runs on the self-hosted
            gateways over HTTPS; the only thing your machine does is load this interface.
          </p>
          <p className="mono" style={{ fontSize: "0.8rem", marginBottom: 0 }}>
            v1 zai · v2 babel · v3 nvidia · v4 opencode kilo · v5 openrouter — one DB layer, zero client storage
          </p>
        </div>
      </section>
    </>
  );
}

export default Home;
