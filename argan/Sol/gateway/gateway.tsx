/**
 * gateway page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

// # Gateway — sub-anchor of the gateway page: the transport table, the DoH-first rule
// and the staging corefile, every row served by the data layer.
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
      <p className="eyebrow">argan · gateway</p>
      <h1 className="page-title">Gateway</h1>
      <p className="lede">
        One endpoint, every DNS transport. The gateway answers the same wire protocol over UDP, TCP, TLS, HTTPS and QUIC
        — and it is not a resolver replacement: it serves the zones argan is authoritative for and forwards the rest.
      </p>

      <section className="glass card mt-30" aria-labelledby="tr-h">
        <h2 id="tr-h" className="card-h">
          Transports
        </h2>
        <p className="p-sm">
          Transport choice is a trade, not a dogma: classic is the fastest and the most visible; DoT hides the query but
          fights the port; DoH blends into web traffic; DoQ adds privacy with zero-RTT where UDP passes.
        </p>
        <div className="scroll-x">
          <table className="table ztable">
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
                  <td>{transport.name}</td>
                  <td>{transport.port}</td>
                  <td>{transport.spec}</td>
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

      <section className="section" aria-labelledby="doh-h">
        <div className="section-head">
          <p className="eyebrow">rule nd-6005 · doh-first</p>
          <h2 id="doh-h" className="h2-xl">
            Port 53 blocked? DoH first.
          </h2>
          <p>
            Where port 53 is blocked or we hold no privilege, everything runs over DoH on plain HTTPS —
            indistinguishable from web traffic, crossing home, corporate and mobile firewalls. Valid public HTTPS comes
            from the edge with a tunnel; self-signed certificates stay in dev and on the LAN.
          </p>
        </div>
        {/* asymmetric trio: the probe dominates, switch and serve support */}
        <div className="ns-trio">
          {dohFirst.map((card) => (
            <div key={card.title} className="glass card">
              <h3 className="h3-sm">{card.title}</h3>
              <p className="flush">{card.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="core-h">
        <div className="section-head">
          <p className="eyebrow">corefile</p>
          <h2 id="core-h" className="h2-xl">
            Gateway core, staging shape
          </h2>
          <p>
            The authoritative zone block, a privacy forwarder for the rest of the world, and the DoH listener that
            survives a firewalled 53.
          </p>
        </div>
        <pre className="code-block">
          <code>{corefile}</code>
        </pre>
      </section>
    </Shell>
  );
}
