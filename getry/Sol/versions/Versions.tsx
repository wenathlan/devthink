/**
 * Versions.tsx — the versions page of the getry Sol theme: the five
 * provider gateways with their patterns, models, lifecycle badges and
 * the seven routes each one answers, followed by the quick-start calls
 * and the canonical parser pattern of the streaming routes.
 */
import { useEffect, useState } from "react";
import { Activity, CirclePause, Terminal } from "lucide-react";
import { observeReveals } from "../../reveal";
import { toast } from "../toast/Toast";
import { PARSERSTEPS, listversions, type GatewayVersion } from "../../gateway";

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
 * renders one gateway version card with its route chips.
 *
 * @param version the gateway version row.
 * @returns the card element.
 */
function VersionCard({ version }: { version: GatewayVersion }) {
  return (
    <article className="glass card versioncard reveal">
      <div className="versionhead">
        <h3>{version.v.toUpperCase()}</h3>
        {version.badge === "live" ? (
          <span className="badge success">
            <Activity size={11} />
            live
          </span>
        ) : (
          <span className="badge warning">
            <CirclePause size={11} />
            paused
          </span>
        )}
      </div>
      <p className="versionfield">
        <strong>provider:</strong> {version.provider}
      </p>
      <p className="versionfield">
        <strong>pattern:</strong> {version.pattern}
      </p>
      <p className="versionfield">
        <strong>models:</strong> {version.models}
      </p>
      <p className="versionnote">{version.note}</p>
      <div>
        <p className="routecount">{version.routes.length} routes</p>
        <div className="routechips">
          {version.routes.map((route) => (
            <button
              key={route}
              type="button"
              className="routechip"
              onClick={() => toast(`/${version.v}/${route} answers on the self-hosted gateway, never on this surface`, "info")}
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
      <section className="pagehead">
        <p className="eyebrow">the gateway surface</p>
        <h1>five gateways, thirty-five routes</h1>
        <p>
          Each version owns one provider family and answers the same seven OpenAI-compatible routes. The v2 babel
          service is paused and falls back to v1 zai; v4 and v5 discover their models live through the free-tag filter.
        </p>
      </section>

      <section className="section" aria-label="gateway versions">
        <div className="versiongrid">
          {versions.map((version) => (
            <VersionCard key={version.v} version={version} />
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
