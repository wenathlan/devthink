/**
 * dnssec page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

// # Dnssec — sub-anchor of the dnssec page: the two key cards, the algorithm badges,
// the pipeline-only rule with the sign output, and the rollover timeline.
import { useEffect, useState } from "react";
import type { ConfigBlock, FeatureCard, RolloverStep, SignalBadge } from "../../argan.ts";
import { listConfigBlocks, listDnssecAlgorithms, listDnssecKeyCards, listRolloverSteps } from "../../catalog.ts";
import { type NavLink, Shell } from "../shell/Shell";

const FOOTER_LINKS: readonly NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Zones", href: "/zones" },
  { label: "Gateway", href: "/gateway" },
  { label: "Settings", href: "/settings" },
];

export default function Dnssec() {
  const [keyCards, setKeyCards] = useState<readonly FeatureCard[]>([]);
  const [algorithms, setAlgorithms] = useState<readonly SignalBadge[]>([]);
  const [signLogs, setSignLogs] = useState<readonly ConfigBlock[]>([]);
  const [rollover, setRollover] = useState<readonly RolloverStep[]>([]);

  useEffect(() => {
    let live = true;
    listDnssecKeyCards().then((rows) => {
      if (live) setKeyCards(rows);
    });
    listDnssecAlgorithms().then((rows) => {
      if (live) setAlgorithms(rows);
    });
    listConfigBlocks().then((rows) => {
      if (live) setSignLogs(rows);
    });
    listRolloverSteps().then((rows) => {
      if (live) setRollover(rows);
    });
    return () => {
      live = false;
    };
  }, []);

  const signOutput = signLogs.find((block) => block.key === "sign-output")?.content ?? "";

  return (
    <Shell name="argan" contained footerLinks={FOOTER_LINKS} domain="argan.devthink.pro">
      <p className="eyebrow">argan · dnssec</p>
      <h1 className="page-title">DNSSEC</h1>
      <p className="lede">
        Every published zone is signed on day one — real signatures, real validation, no opt-in. Signing is a pipeline
        stage: build, test and hash happen in CI, and the signed zone is what gets served.
      </p>

      <section className="section" aria-labelledby="keys-h">
        <div className="section-head">
          <p className="eyebrow">the two keys</p>
          <h2 id="keys-h" className="h2-xl">
            KSK signs keys, ZSK signs zones
          </h2>
        </div>
        {/* asymmetric pair: the KSK card dominates, the ZSK supports */}
        <div className="ns-keygrid">
          {keyCards.map((card) => (
            <div key={card.title} className="glass card">
              <div className="card-row">
                <h3 className="card-title">{card.title}</h3>
                {card.badge ? (
                  <span
                    className={`badge${card.badgeTone && card.badgeTone !== "default" ? ` ${card.badgeTone}` : ""}`}
                  >
                    {card.badge}
                  </span>
                ) : null}
              </div>
              <p className="card-text">{card.detail}</p>
              {card.detail2 ? <p className="card-text">{card.detail2}</p> : null}
            </div>
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="alg-h">
        <div className="section-head">
          <p className="eyebrow">algorithms</p>
          <h2 id="alg-h" className="h2-xl">
            What new zones are signed with
          </h2>
        </div>
        <div className="glass card">
          <div className="badge-row" style={{ marginTop: 0, marginBottom: 14 }}>
            {algorithms.map((algorithm) => (
              <span
                key={algorithm.label}
                className={`badge${algorithm.tone === "default" ? "" : ` ${algorithm.tone}`}`}
              >
                {algorithm.label}
              </span>
            ))}
          </div>
          <p className="flush">
            ED25519 is the default for every new zone: small signatures, fast verification, 256 bits. ECDSA P-256 covers
            validators that predate algorithm 15; RSA/SHA-256 survives only where a legacy parent demands it. Denial of
            existence uses NSEC3 with a fresh random salt on each republication, and the DS handed to the parent uses
            the SHA-256 digest (algorithm 2).
          </p>
        </div>
      </section>

      <section className="section" aria-labelledby="pipe-h">
        <div className="section-head">
          <p className="eyebrow">rule nd-6002 · pipeline-only</p>
          <h2 id="pipe-h" className="h2-xl">
            Never hand-edit a production zone
          </h2>
          <p>
            The zone file is versioned, signed and published by the pipeline with a fresh serial — the previous version
            stays available for instant rollback. Nobody types changes into a live zone.
          </p>
        </div>
        <pre className="code-block">
          <code>{signOutput}</code>
        </pre>
      </section>

      <section className="section" aria-labelledby="rot-h">
        <div className="section-head">
          <p className="eyebrow">rollover</p>
          <h2 id="rot-h" className="h2-xl">
            Key rotation, four moves
          </h2>
          <p>
            ZSK every 90 days, KSK every 360 days. CDS/CDNSKEY automation hands the new DS to the parent without a
            registrar ticket.
          </p>
        </div>
        {/* the editorial ladder: numbered rows with the rollover windows, not cards */}
        <ol className="ns-steps ns-steps-wide">
          {rollover.map((step, index) => (
            <li key={step.title} className="ns-step">
              <span className="ns-step__no" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="ns-step__body">
                <h3 className="ns-step__title">
                  {step.title}
                  <span className="ns-step__window">{step.window}</span>
                </h3>
                <p className="ns-step__text">{step.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </Shell>
  );
}
