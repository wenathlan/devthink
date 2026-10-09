/**
 * home page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

import { ArrowRight, CornerDownLeft } from "lucide-react";
/**
 * Home.tsx — the LANDING page of the getry Sol theme (campaign v3 · r3):
 * the Suno-grade gateway hero — one sky light, the prompt-giga endpoint
 * field (send a completion), the replica matrix ledger (the five provider
 * gateways as the copies the meta model spins), the 01–03 deploy steps and
 * the meta-quad footer. no tabular fabrication: every row reads the root
 * gateway registry (gateway.ts) and the thinking ladder (thinking.ts).
 */
import { type FormEvent, useEffect, useState } from "react";
import { Link } from "wouter";
import {
  findversion,
  GATEWAYROUTES,
  type GatewayVersion,
  listversions,
  liveversions,
  totalroutes,
} from "../../gateway";
import { observeReveals } from "../../reveal";
import { ROTATIONEVERY } from "../../sessions";
import { budgetof, DEFAULTTHINKINGLEVEL, formatbudget, THINKINGLEVELS } from "../../thinking";
import { BrandMark } from "../shell/BrandMark";
import { toast } from "../toast/Toast";

/** the honest answer of the send key: the surface stores nothing. */
const SENDTOAST = "answers on the self-hosted gateway over HTTPS — this surface stores nothing";

/** the parsed endpoint: the replica the prefix names and the route kind that follows. */
function parseendpoint(value: string): { version: GatewayVersion | null; route: string | null; tail: string } {
  const cleaned = value.trim().toLowerCase().replace(/\/+$/, "");
  const match = /^\/(v\d)(?:\/(.*))?$/.exec(cleaned);
  if (!match) return { version: null, route: null, tail: cleaned };
  const tail = match[2] ?? "";
  return {
    version: findversion(match[1]),
    route: (GATEWAYROUTES as readonly string[]).includes(tail) ? tail : null,
    tail,
  };
}

/** the status line under the field: what the typed endpoint resolves to. */
function statusline(value: string): string {
  const { version, route, tail } = parseendpoint(value);
  if (!version) return `unrouted · the replicas answer /v1 through /v${listversions().length}`;
  if (route) return `${version.v} · ${version.provider} · /${version.v}/${route} · ${version.badge}`;
  if (tail) return `${version.v} · ${version.provider} · unknown route — the replicas answer the seven kinds`;
  return `${version.v} · ${version.provider} · ${version.badge} · name a route`;
}

/** the deploy steps of the landing (the real gateway doctrine, 01–03). */
const STEPS: { step: string; title: string; phrase: string }[] = [
  {
    step: "01",
    title: "deploy the mirror",
    phrase:
      "the Next mirrors ship from the release assets — this Sol surface is one static deploy of the same gateway.",
  },
  {
    step: "02",
    title: "name a route",
    phrase: "35 OpenAI-compatible endpoints answer on the self-hosted lanes — the seven kinds ride every replica.",
  },
  {
    step: "03",
    title: "ride the mask",
    phrase:
      "the parser re-emits every chunk as devthink — reasoning deltas before content, keepalives holding the stream.",
  },
];

/**
 * the home page.
 *
 * @returns the home element.
 */
export function Home() {
  const [endpoint, setEndpoint] = useState("/v1/chat/completions");

  useEffect(() => {
    observeReveals();
  }, []);

  const parsed = parseendpoint(endpoint);
  const versions = listversions();

  /** the send key: the honest hand-off toast, never a fake fetch. */
  function sendcompletion(event: FormEvent) {
    event.preventDefault();
    const target = endpoint.trim().toLowerCase() || "/v1/chat/completions";
    toast(`${target} ${SENDTOAST}`, "info");
  }

  /** a replica chip: rewrites the version segment, keeps the named route. */
  function pickversion(v: string) {
    setEndpoint(`/${v}/${parsed.tail && parsed.route ? parsed.tail : "chat/completions"}`);
  }

  /** a route chip: rewrites the route kind on the resolved replica (v1 default). */
  function pickroute(route: string) {
    setEndpoint(`/${parsed.version?.v ?? "v1"}/${route}`);
  }

  return (
    <>
      <section className="hero grain halftone r3-hero">
        <p className="eyebrow reveal">getry · deployable inference gateway</p>
        <div className="r3-hero__grid">
          <div className="r3-hero__main">
            <h1 className="r3-headline reveal">many gateways, one mask</h1>
            <p className="r3-phrase reveal">
              getry spins five provider replicas behind the devthink meta-model — {totalroutes()} OpenAI-compatible
              routes, pure byte passthrough, nothing on your machine.
            </p>

            <form className="r3-prompt reveal" onSubmit={sendcompletion}>
              <div className="r3-prompt__field">
                <span className="r3-prompt__label" aria-hidden="true">
                  send a completion
                </span>
                <input
                  className="r3-prompt__input"
                  value={endpoint}
                  onChange={(event) => setEndpoint(event.target.value)}
                  spellCheck={false}
                  autoComplete="off"
                  aria-label="gateway endpoint"
                />
                <button type="submit" className="r3-prompt__key">
                  send
                  <CornerDownLeft size={13} aria-hidden="true" />
                </button>
              </div>
              <p className="r3-prompt__status" aria-live="polite">
                {statusline(endpoint)}
              </p>
              <div className="r3-prompt__chips">
                <fieldset className="r3-chipset">
                  <legend className="r3-chipset__legend">replica</legend>
                  {versions.map((version) => (
                    <button
                      key={version.v}
                      type="button"
                      className="r3-chip"
                      aria-pressed={parsed.version?.v === version.v ? "true" : "false"}
                      onClick={() => pickversion(version.v)}
                    >
                      /{version.v} {version.provider}
                    </button>
                  ))}
                </fieldset>
                <fieldset className="r3-chipset">
                  <legend className="r3-chipset__legend">route</legend>
                  {GATEWAYROUTES.map((route) => (
                    <button
                      key={route}
                      type="button"
                      className="r3-chip r3-chip--route"
                      aria-pressed={parsed.tail === route ? "true" : "false"}
                      onClick={() => pickroute(route)}
                    >
                      {route}
                    </button>
                  ))}
                </fieldset>
              </div>
            </form>

            <div className="importstrip reveal">
              <span className="badge">{liveversions().length} replicas live</span>
              <span className="badge info">{totalroutes()} routes</span>
              <span className="badge success">pure byte passthrough</span>
            </div>
          </div>
          <div className="r3-hero__side" aria-hidden="true">
            <span className="r3-heromark">
              <BrandMark size={128} />
            </span>
          </div>
        </div>
      </section>

      <section className="section" aria-label="replica matrix">
        <div className="section-head reveal">
          <h2>the replica matrix</h2>
          <p>
            One meta model, five copies of itself: every replica serves devthink over its provider family — the mask is
            the product, the lane is the detail.
          </p>
        </div>
        <table className="r3-matrix reveal">
          <thead>
            <tr>
              <th scope="col">replica</th>
              <th scope="col">serves</th>
              <th scope="col">lane</th>
              <th scope="col">routes</th>
              <th scope="col">status</th>
            </tr>
          </thead>
          <tbody>
            {versions.map((version) => {
              const featured = version.v === "v3";
              return (
                <tr
                  key={version.v}
                  data-paused={version.badge !== "live" ? "true" : undefined}
                  data-featured={featured ? "true" : undefined}
                >
                  <td className="r3-matrix__id">
                    <strong>{version.v}</strong>
                    <small>{version.provider}</small>
                  </td>
                  <td className="r3-matrix__serves">
                    <span className="r3-tag">devthink</span>
                    {featured ? <span className="r3-matrix__featnote">22 keys round robin</span> : null}
                  </td>
                  <td className="r3-matrix__lane">/{version.v}/chat/completions</td>
                  <td className="r3-matrix__count">{version.routes.length}</td>
                  <td className="r3-matrix__state">
                    <i
                      className="r3-livedot"
                      data-live={version.badge === "live" ? "true" : undefined}
                      aria-hidden="true"
                    />
                    {version.badge}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="r3-matrix__note reveal">
          The paused v2 babel lane falls back to v1 zai; v4 and v5 discover their free-tag models live — zero hardcoded
          names anywhere.
        </p>
      </section>

      <section className="section" aria-label="deploy steps">
        <div className="r3-steps">
          {STEPS.map((item) => (
            <article key={item.step} className="r3-step reveal">
              <span className="r3-step__index" aria-hidden="true">
                {item.step}
              </span>
              <h3 className="r3-step__title">{item.title}</h3>
              <p className="r3-step__phrase">{item.phrase}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="r3-quad">
        <div className="r3-quad__col">
          <p className="r3-quad__head">gateway</p>
          <p className="r3-quad__meta">
            {versions.length} replicas · {totalroutes()} routes · {liveversions().length} live
          </p>
        </div>
        <div className="r3-quad__col">
          <p className="r3-quad__head">thinking</p>
          <p className="r3-quad__meta">
            {THINKINGLEVELS.length} rungs · default {DEFAULTTHINKINGLEVEL} ·{" "}
            {formatbudget(budgetof(DEFAULTTHINKINGLEVEL))} token ceiling
          </p>
        </div>
        <div className="r3-quad__col">
          <p className="r3-quad__head">store</p>
          <p className="r3-quad__meta">
            rotation every {ROTATIONEVERY} turns · keys masked at render · zero client storage
          </p>
        </div>
        <nav className="r3-quad__col" aria-label="gateway domains">
          <p className="r3-quad__head">pages</p>
          <p className="r3-quad__meta r3-quad__links">
            <Link href="/versions">
              versions
              <ArrowRight size={12} aria-hidden="true" />
            </Link>
            <Link href="/thinking">
              thinking
              <ArrowRight size={12} aria-hidden="true" />
            </Link>
            <Link href="/sessions">
              sessions
              <ArrowRight size={12} aria-hidden="true" />
            </Link>
          </p>
        </nav>
      </footer>
    </>
  );
}

export default Home;
