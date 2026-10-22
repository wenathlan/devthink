/**
 * dnssec page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

import { ShieldRegular } from "@fluentui/react-icons";
// # Dnssec — the working console (campaign v3 · r3-argan): the two keys as a
// ruled ledger (KSK featured, the DS line in mono), the algorithms on the rail
// with tone dots, the pipeline-only rule as a terminal, and the rollover ladder
// with its windows — every row served by the data layer.
import { useEffect, useState } from "react";
import type { ConfigBlock, FeatureCard, RolloverStep, SignalBadge } from "../../argan.ts";
import { listConfigBlocks, listDnssecAlgorithms, listDnssecKeyCards, listRolloverSteps } from "../../catalog.ts";
import EmptyState from "../componentes/shell/EmptyState.tsx";
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
  // the micro-windows loading face: one count per table in flight
  const [pending, setPending] = useState(4);

  useEffect(() => {
    let live = true;
    listDnssecKeyCards()
      .then((rows) => {
        if (live) setKeyCards(rows);
      })
      .catch(() => {})
      .finally(() => {
        if (live) setPending((count) => count - 1);
      });
    listDnssecAlgorithms()
      .then((rows) => {
        if (live) setAlgorithms(rows);
      })
      .catch(() => {})
      .finally(() => {
        if (live) setPending((count) => count - 1);
      });
    listConfigBlocks()
      .then((rows) => {
        if (live) setSignLogs(rows);
      })
      .catch(() => {})
      .finally(() => {
        if (live) setPending((count) => count - 1);
      });
    listRolloverSteps()
      .then((rows) => {
        if (live) setRollover(rows);
      })
      .catch(() => {})
      .finally(() => {
        if (live) setPending((count) => count - 1);
      });
    return () => {
      live = false;
    };
  }, []);

  const signOutput = signLogs.find((block) => block.key === "sign-output")?.content ?? "";

  return (
    <Shell name="argan" contained footerLinks={FOOTER_LINKS} domain="argan.devthink.pro">
      <header className="r3a-head">
        <p className="r3a-head__eyebrow">argan · dnssec</p>
        <h1 className="r3a-head__title">Signed on day one.</h1>
        <p className="r3a-head__lede">
          Real signatures, real validation, no opt-in — build, test and hash happen in CI, and the signed zone is what
          gets served.
        </p>
      </header>

      {/* the asymmetric console: the key ledger dominant, algorithms on the rail */}
      <div className="r3a-split">
        <section className="r3a-pane" aria-labelledby="keys-h">
          <div className="r3a-h">
            <span className="r3a-h__no" aria-hidden="true">
              01
            </span>
            <h2 id="keys-h" className="r3a-h__title">
              KSK signs keys, ZSK signs zones
            </h2>
          </div>
          <div className="r3a-ledger">
            {keyCards.length === 0 ? (
              <EmptyState
                icon={ShieldRegular}
                pending={pending > 0}
                note="the key ledger answered no rows — the signing pipeline has not published keys to this snapshot yet"
              />
            ) : (
              keyCards.map((card, index) => (
                <div key={card.title} className={`r3a-row r3a-row--key${index === 0 ? " is-featured" : ""}`}>
                  <div className="r3a-keyrow__main">
                    <h3 className="r3a-keyrow__name">{card.title}</h3>
                    {card.badge ? <span className="r3a-kbd">{card.badge}</span> : null}
                  </div>
                  <p className="r3a-keyrow__detail">{card.detail}</p>
                  {card.detail2 ? <code className="r3a-code">{card.detail2}</code> : null}
                </div>
              ))
            )}
          </div>
        </section>

        <aside className="r3a-rail" aria-label="signing algorithms">
          <div className="r3a-railblock">
            <p className="r3a-railblock__name">algorithms · new zones</p>
            <div className="r3a-ledger">
              {algorithms.map((algorithm) => (
                <div key={algorithm.label} className="r3a-row r3a-row--flow">
                  <span className="r3a-dot" data-state={algorithm.tone} aria-hidden="true" />
                  <span className="r3a-alg">{algorithm.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="r3a-railblock">
            <p className="r3a-railblock__name">denial &amp; digest</p>
            <p className="r3a-railblock__text">
              NSEC3 with a fresh random salt on each republication; the DS handed to the parent uses the SHA-256 digest
              (algorithm 2).
            </p>
          </div>
        </aside>
      </div>

      {/* the pipeline-only rule as a terminal */}
      <section className="r3a-sec r3a-sec--ruled" aria-labelledby="pipe-h">
        <div className="r3a-h">
          <span className="r3a-h__no" aria-hidden="true">
            02
          </span>
          <h2 id="pipe-h" className="r3a-h__title">
            Never hand-edit a production zone
          </h2>
          <p className="r3a-h__note">
            Rule nd-6002 · pipeline-only — the zone file is versioned, signed and published by the pipeline with a fresh
            serial; the previous version stays available for instant rollback. Nobody types changes into a live zone.
            The terminal below rides the staging snapshot — the output shape of one sign run, never a live capture.
          </p>
        </div>
        <pre className="r3a-term">
          <code>{signOutput || ";; the sign pipeline answered no output block for this snapshot"}</code>
        </pre>
      </section>

      {/* the rollover ladder with its windows */}
      <section className="r3a-sec r3a-sec--ruled" aria-labelledby="rot-h">
        <div className="r3a-h">
          <span className="r3a-h__no" aria-hidden="true">
            03
          </span>
          <h2 id="rot-h" className="r3a-h__title">
            Key rotation, four moves
          </h2>
          <p className="r3a-h__note">
            ZSK every 90 days, KSK every 360. CDS/CDNSKEY automation hands the new DS to the parent without a registrar
            ticket.
          </p>
        </div>
        <ol className="r3a-steps r3a-steps--wide">
          {rollover.map((step) => (
            <li key={step.title} className="r3a-step">
              <p className="r3a-step__no" aria-hidden="true">
                {step.window}
              </p>
              <h3 className="r3a-step__title">{step.title}</h3>
              <p className="r3a-step__text">{step.detail}</p>
            </li>
          ))}
        </ol>
      </section>
    </Shell>
  );
}
