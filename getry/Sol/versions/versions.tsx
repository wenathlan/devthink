/**
 * versions page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

import { Terminal } from "lucide-react";
/**
 * Versions.tsx — the versions page of the getry Sol theme: the gateway
 * registry drawn as one editorial ledger — five full-width rows, the
 * version tag as the giant display column, the state as a ladder dot
 * (sky = live, amber = paused), the routes as chips on the right —
 * followed by the quick-start calls and the canonical parser pattern.
 */
import { useEffect, useState } from "react";
import { type GatewayVersion, listversions, PARSERSTEPS } from "../../gateway";
import { observeReveals } from "../../reveal";
import { toast } from "../toast/Toast";

/** the quick-start calls the gateway answers out of the box. */
const QUICKSTART = `# v1 — zai passthrough no key required
curl -x post http://localhost:3000/v1/chat/completions \\
  -h "content-type: application/json" \\
  -d '{"messages":[{"role":"user","content":"hi"}],"stream":true}'

# v3 — nvidia nim free models
curl -x post http://localhost:3000/v3/chat/completions \\
  -h "content-type: application/json" \\
  -d '{"model":"devthink","messages":[{"role":"user","content":"hi"}]}'

# v4 — opencode kilo anonymous free tier
curl -x post http://localhost:3000/v4/chat/completions \\
  -h "content-type: application/json" \\
  -d '{"model":"devthink","messages":[{"role":"user","content":"hi"}]}'

# v5 — openrouter free models requires key
curl -x post http://localhost:3000/v5/chat/completions \\
  -h "content-type: application/json" \\
  -h "authorization: bearer $openrouter_api_key" \\
  -d '{"model":"devthink","messages":[{"role":"user","content":"hi"}]}'

# model discovery — v4 and v5 catalogs are dynamic (free-tag filter)
curl http://localhost:3000/v4/models
curl http://localhost:3000/v5/models`;

/**
 * renders one gateway row of the registry ledger.
 *
 * @param version the gateway version row.
 * @returns the row element.
 */
function Gaterow({ version }: { version: GatewayVersion }) {
  const paused = version.badge !== "live";
  return (
    <article className="gaterow reveal" data-paused={paused ? "true" : undefined}>
      <div className="gaterow__id">
        <h3 className="gaterow__v">{version.v}</h3>
        <span className="gaterow__state">
          <i aria-hidden="true" />
          {version.badge}
        </span>
      </div>
      <div className="gaterow__body">
        <p className="gaterow__provider">{version.provider}</p>
        <p className="gaterow__pattern">{version.pattern}</p>
        <p className="gaterow__models">{version.models}</p>
        <p className="gaterow__note">{version.note}</p>
      </div>
      <div className="gaterow__routes">
        <p className="gaterow__count">{version.routes.length} routes</p>
        <div className="gaterow__chips">
          {version.routes.map((route) => (
            <button
              key={route}
              type="button"
              className="routechip"
              onClick={() =>
                toast(`/${version.v}/${route} answers on the self-hosted gateway, never on this surface`, "info")
              }
            >
              /{version.v}/{route}
            </button>
          ))}
        </div>
      </div>
    </article>
  );
}

/**
 * the versions page.
 *
 * @returns the versions element.
 */
export default function Versions() {
  const [versions] = useState<GatewayVersion[]>(() => listversions());

  useEffect(() => {
    observeReveals();
  }, []);

  return (
    <>
      <section className="pagehead halftone">
        <p className="eyebrow">getry · versions</p>
        <h1>five gateways, thirty-five routes</h1>
        <p>
          Each version owns one provider family and answers the same seven OpenAI-compatible routes. The v2 babel
          service is paused and falls back to v1 zai; v4 and v5 discover their models live through the free-tag filter.
        </p>
      </section>

      <section className="section" aria-label="gateway registry">
        <div className="gatelog">
          {versions.map((version) => (
            <Gaterow key={version.v} version={version} />
          ))}
        </div>
      </section>

      <section className="section" aria-label="quick start">
        <div className="glass card reveal">
          <h2>
            <Terminal size={18} /> quick start
          </h2>
          <pre className="codeblock">{QUICKSTART}</pre>
        </div>
      </section>

      <section className="section" aria-label="canonical parser pattern">
        <div className="glass card reveal">
          <h2>canonical parser pattern</h2>
          <ol className="parserlist">
            {PARSERSTEPS.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
