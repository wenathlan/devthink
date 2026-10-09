/**
 * gateway page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

// # Gateway — the working console (campaign v3 · r3-argan): the transport table
// as a ruled ledger (ports in kbd, states as dots), the DoH-first rule as a
// numbered rail, and the staging corefile as a terminal — every row served by
// the data layer.
import { useEffect, useState } from "react";
import type { ConfigBlock, DnsTransport, FeatureCard } from "../../argan.ts";
import { listConfigBlocks, listDohFirstCards, listTransports } from "../../catalog.ts";
import { type NavLink, Shell } from "../shell/Shell";

const FOOTER_LINKS: readonly NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Zones", href: "/zones" },
  { label: "DNSSEC", href: "/dnssec" },
  { label: "Settings", href: "/settings" },
];

export default function Gateway() {
  const [transports, setTransports] = useState<readonly DnsTransport[]>([]);
  const [dohFirst, setDohFirst] = useState<readonly FeatureCard[]>([]);
  const [blocks, setBlocks] = useState<readonly ConfigBlock[]>([]);

  useEffect(() => {
    let live = true;
    listTransports().then((rows) => {
      if (live) setTransports(rows);
    });
    listDohFirstCards().then((rows) => {
      if (live) setDohFirst(rows);
    });
    listConfigBlocks().then((rows) => {
      if (live) setBlocks(rows);
    });
    return () => {
      live = false;
    };
  }, []);

  const corefile = blocks.find((block) => block.key === "corefile")?.content ?? "";

  return (
    <Shell name="argan" contained footerLinks={FOOTER_LINKS} domain="argan.devthink.pro">
      <header className="r3a-head">
        <p className="r3a-head__eyebrow">argan · gateway</p>
        <h1 className="r3a-head__title">One endpoint, every transport.</h1>
        <p className="r3a-head__lede">
          The gateway answers the same wire protocol over UDP, TCP, TLS, HTTPS and QUIC — it serves the zones argan is
          authoritative for and forwards the rest.
        </p>
      </header>

      {/* the asymmetric console: the transport ledger dominant, doh-first on the rail */}
      <div className="r3a-split">
        <section className="r3a-pane" aria-labelledby="tr-h">
          <div className="r3a-h">
            <span className="r3a-h__no" aria-hidden="true">
              01
            </span>
            <h2 id="tr-h" className="r3a-h__title">
              Transports
            </h2>
            <p className="r3a-h__aside">{transports.length} transports</p>
            <p className="r3a-h__note">
              Transport choice is a trade, not a dogma: classic is the fastest and the most visible; DoH blends into web
              traffic; DoQ adds privacy with zero-RTT where UDP passes.
            </p>
          </div>
          <div className="scroll-x">
            <table className="table r3a-table">
              <thead>
                <tr>
                  <th scope="col">transport</th>
                  <th scope="col">port</th>
                  <th scope="col">spec</th>
                  <th scope="col">status</th>
                </tr>
              </thead>
              <tbody>
                {transports.map((transport) => (
                  <tr key={transport.name}>
                    <td className="is-key">{transport.name}</td>
                    <td>
                      <code className="r3a-kbd">{transport.port}</code>
                    </td>
                    <td className="is-mono">{transport.spec}</td>
                    <td>
                      <span className="zstate">
                        <span className="zdot" data-state={transport.tone} aria-hidden="true" />
                        {transport.state}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="r3a-rail" aria-labelledby="doh-h">
          <div className="r3a-railblock">
            <p className="r3a-railblock__name">rule nd-6005 · doh-first</p>
            <h2 id="doh-h" className="r3a-h__title">
              Port 53 blocked? DoH first.
            </h2>
            <ol className="r3a-ledger r3a-ledger--flow">
              {dohFirst.map((card, index) => (
                <li key={card.title} className="r3a-row r3a-row--flow">
                  <span className="r3a-idx" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="r3a-flow__title">{card.title}</span>
                  <span className="r3a-flow__text">{card.detail}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="r3a-railblock">
            <p className="r3a-railblock__name">where 53 is blocked</p>
            <p className="r3a-railblock__text">
              Everything runs over DoH on plain HTTPS — indistinguishable from web traffic, crossing home, corporate and
              mobile firewalls. Valid public HTTPS comes from the edge with a tunnel; self-signed certificates stay in
              dev and on the LAN.
            </p>
          </div>
        </aside>
      </div>

      {/* the corefile as a terminal */}
      <section className="r3a-sec r3a-sec--ruled" aria-labelledby="core-h">
        <div className="r3a-h">
          <span className="r3a-h__no" aria-hidden="true">
            02
          </span>
          <h2 id="core-h" className="r3a-h__title">
            Gateway core, staging shape
          </h2>
          <p className="r3a-h__note">
            The authoritative zone block, a privacy forwarder for the rest of the world, and the DoH listener that
            survives a firewalled 53.
          </p>
        </div>
        <pre className="r3a-term">
          <code>{corefile}</code>
        </pre>
      </section>
    </Shell>
  );
}
