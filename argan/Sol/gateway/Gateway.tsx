// # Gateway — sub-anchor of the gateway page: the transport table, the DoH-first rule
// and the staging corefile, every row served by the data layer.
import { useEffect, useState } from "react";
import { Shell, type NavLink } from "../shell/Shell";
import { listConfigBlocks, listDohFirstCards, listTransports } from "../../catalog.ts";
import type { ConfigBlock, DnsTransport, FeatureCard } from "../../argan.ts";

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
      <p className="eyebrow">gateway · transports</p>
      <h1 className="page-title">Gateway</h1>
      <p className="lede">
        One endpoint, every DNS transport. The gateway answers the same wire protocol over UDP, TCP, TLS, HTTPS and QUIC — and it is not a resolver replacement: it serves the zones argan is authoritative for and forwards the rest.
      </p>

      <section className="glass card mt-30" aria-labelledby="tr-h">
        <h2 id="tr-h" className="card-h">
          Transports
        </h2>
        <p className="p-sm">
          Transport choice is a trade, not a dogma: classic is the fastest and the most visible; DoT hides the query but fights the port; DoH blends into web traffic; DoQ adds privacy with zero-RTT where UDP passes.
        </p>
        <div className="scroll-x">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Transport</th>
                <th scope="col">Port</th>
                <th scope="col">Spec</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {transports.map((transport) => (
                <tr key={transport.name}>
                  <td>{transport.name}</td>
                  <td>{transport.port}</td>
                  <td>{transport.spec}</td>
                  <td>
                    <span className={`badge${transport.tone === "default" ? "" : ` ${transport.tone}`}`}>
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
          <p className="eyebrow reveal">rule ND-6005 · DoH-first</p>
          <h2 id="doh-h" className="reveal h2-xl">
            Port 53 blocked? DoH first.
          </h2>
          <p className="reveal">
            Where port 53 is blocked or we hold no privilege, everything runs over DoH on plain HTTPS — indistinguishable from web traffic, crossing home, corporate and mobile firewalls. Valid public HTTPS comes from the edge with a tunnel; self-signed certificates stay in dev and on the LAN.
          </p>
        </div>
        <div className="grid cols-3">
          {dohFirst.map((card) => (
            <div key={card.title} className="glass card reveal">
              <h3 className="h3-sm">{card.title}</h3>
              <p className="flush">{card.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="core-h">
        <div className="section-head">
          <p className="eyebrow reveal">corefile</p>
          <h2 id="core-h" className="reveal h2-xl">
            Gateway core, staging shape
          </h2>
          <p className="reveal">
            The authoritative zone block, a privacy forwarder for the rest of the world, and the DoH listener that survives a firewalled 53.
          </p>
        </div>
        <pre className="code-block reveal">
          <code>{corefile}</code>
        </pre>
      </section>
    </Shell>
  );
}
