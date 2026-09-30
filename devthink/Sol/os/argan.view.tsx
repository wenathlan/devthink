/**
 * argan.view.tsx — DNS/gateway (argan.devthink.pro) inside the os.
 * Pages: zones (zones + hung model + RRsets), dnssec (KSK/ZSK,
 * algorithms, pipeline-only, rollover), gateway (transports, DoH-first,
 * Corefile). Content absorbed from the static argan site.
 */
import { useState } from "react";
import { appMeta, PERSONAS } from "./apps";
import type { OSHandle } from "./os.types";
import { AppHeader } from "./app.header";
import { AuraChat } from "./aura.chat";
import { PageSection } from "./page.section";
import { StatusDot } from "./status.dot";

const ZONES: Array<{ zone: string; type: string; serial: string; status: "signed" | "unsigned" }> = [
  { zone: "devthink.pro", type: "master", serial: "2026011203", status: "signed" },
  { zone: "wenathlan.net", type: "master", serial: "2026011210", status: "signed" },
  { zone: "katexis.audio", type: "slave", serial: "2026011117", status: "signed" },
  { zone: "versawase.studio", type: "slave", serial: "2026011201", status: "unsigned" },
  { zone: "allan.internal", type: "master", serial: "2026011022", status: "unsigned" },
];

const PUB_STEPS = [
  { n: "01", title: "Validate", desc: "Format, collision and policy checks run before anything is written. A label that fails never reaches the zone." },
  { n: "02", title: "Write zone", desc: "The label joins devthink.pro as an RRset with the zone standard: TTL 3600, NS and SOA on 86400." },
  { n: "03", title: "Persist", desc: "Zone, RRset, keys and audit log land in the single database, with the previous version kept for rollback." },
  { n: "04", title: "Republish", desc: "The pipeline signs, bumps the serial and pushes the change — production zones are never hand-edited." },
  { n: "05", title: "Serve", desc: "NOTIFY fires, secondaries transfer, and a healthcheck confirms the answer from the big public resolvers." },
];

const ZONE_FILE = `; devthink.pro — zone snapshot (fake data, serial 2026011203)
$ORIGIN devthink.pro.
$TTL 3600

@                     IN SOA   ns1.devthink.pro. hostmaster.devthink.pro. (
                                2026011203 86400 7200 1209600 3600 )

@                     IN NS    ns1.devthink.pro.
@                     IN NS    ns2.devthink.pro.

@                     IN A     66.223.49.89
@                     IN AAAA  2001:db8::89
*                     IN A     66.223.49.89        ; hung model: every label to the same edge

@                     IN MX    10 mx1.devthink.pro.
@                     IN TXT   "v=spf1 include:_spf.devthink.pro -all"
default._domainkey    IN TXT   "v=DKIM1; k=ed25519; p=WnVkbGlnbmF0dXJl"   ; public key, truncated
_dmarc                IN TXT   "v=DMARC1; p=quarantine; rua=mailto:dmarc@devthink.pro"

@                     IN CAA   0 issue "letsencrypt.org"`;

const TRANSPORTS: Array<[string, string, string, string, "success" | "info" | "default" | "warning"]> = [
  ["Classic DNS (UDP + TCP)", "53", "RFC 1035 · 7766", "fastest, cleartext", "default"],
  ["DoT", "853", "RFC 7858 · 8310", "live", "success"],
  ["DoH", "443", "RFC 8484", "preferred", "success"],
  ["DoH JSON", "443", "/resolve?name=&type=", "panel · debug", "info"],
  ["DoQ", "853/UDP", "RFC 9250", "planned", "warning"],
  ["DoH3", "443/UDP", "RFC 9114", "planned", "warning"],
  ["DNSCrypt", "443", "X25519 + XChaCha20", "opt-in", "info"],
  ["ODoH", "443", "RFC 9230", "planned", "warning"],
];

const COREFILE = `# argan gateway — Corefile (fake, staging shape)

devthink.pro:53 {
    file /etc/argan/zones/db.devthink.pro
    dnssec
    log
    errors
}

.:53 {
    forward . tls://9.9.9.9 tls://8.8.8.8 {
        tls_servername dns.quad9.net
        health_check 5s
    }
    cache 300
    reload
}

https://.:443/dns-query {
    file /etc/argan/zones/db.devthink.pro devthink.pro
    dnssec
    cache 300
}`;

export function ArganApp({ os }: { os: OSHandle }) {
  const meta = appMeta("argan")!;
  const [chatOpen, setChatOpen] = useState(true);
  const page = meta.pages.some((p) => p.id === os.view.page) ? os.view.page : "zones";

  return (
    <>
      <AppHeader
        app={meta}
        active={page}
        chatOpen={chatOpen}
        onNavigate={(p) => os.openApp("argan", p)}
        onHome={os.goGateway}
        onToggleChat={() => setChatOpen((v) => !v)}
        theme={os.settings.theme}
        onToggleTheme={os.toggleTheme}
      />

      <main className="shell">
        <div className={`app-layout${chatOpen ? " with-chat" : ""}`}>
          <div>
            {page === "zones" ? <ZonesPage /> : page === "dnssec" ? <DnssecPage /> : <GatewayPage />}
          </div>
          {chatOpen ? (
            <div className="chat-panel">
              <AuraChat persona={PERSONAS.argan} storageKey="dt-chat-argan-v1" appLabel="argan" />
            </div>
          ) : null}
        </div>
      </main>
    </>
  );
}

/* ------------------------------- ZONES ------------------------------- */

function ZonesPage() {
  return (
    <>
      <PageSection
        eyebrow="zones · devthink.pro apex"
        title="Zones"
        description="Every name the OS serves lives in a zone argan is authoritative for: masters written by the pipeline, secondaries pulled by authenticated transfer, serials bumped on every republication."
        reveal
      />

      <section className="glass card reveal in" style={{ marginTop: 30 }} aria-labelledby="zt-h">
        <h2 id="zt-h" style={{ fontSize: "1.05rem" }}>Zones under management</h2>
        <p className="small" style={{ marginBottom: 12 }}>
          Snapshot of the staging cluster. Serials follow <code>YYYYMMDDNN</code> — date plus revision of the day.
        </p>
        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Zone</th>
                <th scope="col">Type</th>
                <th scope="col">Serial</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {ZONES.map((z) => (
                <tr key={z.zone}>
                  <td className="strong">{z.zone}</td>
                  <td>{z.type}</td>
                  <td className="mono">{z.serial}</td>
                  <td>
                    {z.status === "signed" ? (
                      <span className="badge success">signed</span>
                    ) : (
                      <span className="badge">unsigned</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section tight" aria-labelledby="pub-h">
        <div className="section-head">
          <p className="eyebrow reveal">pending publication · the hung model</p>
          <h2 id="pub-h" className="reveal">A typed label becomes a live URL</h2>
          <p className="reveal">
            In the panel, a label stays <em>pending</em> until the whole flow below completes. Subdomains hang from the
            bought apex with a wildcard record pointing to the same edge — the visitor resolves it with stock DNS, the
            vhost is picked by <code>Host</code> header.
          </p>
        </div>
        <div className="grid cols-3">
          {PUB_STEPS.map((s) => (
            <div key={s.n} className="glass card reveal in">
              <span className="badge">{s.n}</span>
              <h3 style={{ fontSize: "1.02rem", margin: "12px 0 6px" }}>{s.title}</h3>
              <p style={{ margin: 0 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section tight" aria-labelledby="rr-h">
        <div className="section-head">
          <p className="eyebrow reveal">record set</p>
          <h2 id="rr-h" className="reveal">What the apex serves today</h2>
        </div>
        <pre className="reveal in">
          <code>{ZONE_FILE}</code>
        </pre>
      </section>
    </>
  );
}

/* ------------------------------- DNSSEC ------------------------------ */

function DnssecPage() {
  return (
    <>
      <PageSection
        eyebrow="dnssec · pipeline-only"
        title="DNSSEC"
        description="Every published zone is signed on day one — real signatures, real validation, no opt-in. Signing is a pipeline stage: build, test and hash happen in CI, and the signed zone is what gets served."
        reveal
      />

      <section className="section tight" aria-labelledby="keys-h">
        <div className="section-head">
          <p className="eyebrow reveal">the two keys</p>
          <h2 id="keys-h" className="reveal">KSK signs keys, ZSK signs zones</h2>
        </div>
        <div className="grid cols-2">
          <div className="glass card reveal in">
            <div className="row between">
              <h3 style={{ margin: 0 }}>KSK</h3>
              <span className="badge warning">360-day rollover</span>
            </div>
            <p style={{ marginTop: 10 }}>
              The Key Signing Key signs only the DNSKEY RRset. Its DS hash is what the parent zone carries — the anchor
              of trust for everything below it.
            </p>
            <p style={{ marginBottom: 0 }}>
              <code>devthink.pro. IN DS 48213 15 2 9f3a…</code>
            </p>
          </div>
          <div className="glass card reveal in">
            <div className="row between">
              <h3 style={{ margin: 0 }}>ZSK</h3>
              <span className="badge warning">90-day rollover</span>
            </div>
            <p style={{ marginTop: 10 }}>
              The Zone Signing Key signs every RRset — A, MX, TXT, and the wildcard that carries the hung model.
              Short-use key, rotated quarterly, cheap to replace.
            </p>
            <p style={{ marginBottom: 0 }}>
              Long guard versus short use follows NIST SP 800-81r3.
            </p>
          </div>
        </div>
      </section>

      <section className="section tight" aria-labelledby="alg-h">
        <div className="section-head">
          <p className="eyebrow reveal">algorithms</p>
          <h2 id="alg-h" className="reveal">What new zones are signed with</h2>
        </div>
        <div className="glass card reveal in">
          <div className="row" style={{ marginBottom: 14 }}>
            <span className="badge success">ED25519 · alg 15</span>
            <span className="badge info">ECDSA P-256 · alg 13</span>
            <span className="badge">RSA/SHA-256 · alg 8</span>
            <span className="badge warning">NSEC3 · SHA-256 digest</span>
          </div>
          <p style={{ margin: 0 }}>
            ED25519 is the default for every new zone: small signatures, fast verification, 256 bits. ECDSA P-256
            covers validators that predate algorithm 15; RSA/SHA-256 survives only where a legacy parent demands it.
            Denial of existence uses NSEC3 with a fresh random salt on each republication, and the DS handed to the
            parent uses the SHA-256 digest (algorithm 2).
          </p>
        </div>
      </section>

      <section className="section tight" aria-labelledby="pipe-h">
        <div className="section-head">
          <p className="eyebrow reveal">rule ND-6002 · pipeline-only</p>
          <h2 id="pipe-h" className="reveal">Never hand-edit a production zone</h2>
          <p className="reveal">
            The zone file is versioned, signed and published by the pipeline with a fresh serial — the previous version
            stays available for instant rollback. Nobody types changes into a live zone.
          </p>
        </div>
        <pre className="reveal in">
          <code>{`$ argan sign --zone devthink.pro --ksk ksk-2026q1 --zsk zsk-2026q1
zone      devthink.pro          serial 2026011202 -> 2026011203
dnskey    KSK 257 3 15 (ED25519) + ZSK 256 3 15 (ED25519)
rrsets    412 signed, NSEC3 salt rotated
transfer  NOTIFY -> ns2.devthink.pro, AXFR complete
status    published`}</code>
        </pre>
      </section>

      <section className="section tight" aria-labelledby="rot-h">
        <div className="section-head">
          <p className="eyebrow reveal">rollover</p>
          <h2 id="rot-h" className="reveal">Key rotation, four moves</h2>
          <p className="reveal">
            ZSK every 90 days, KSK every 360 days. CDS/CDNSKEY automation hands the new DS to the parent without a
            registrar ticket.
          </p>
        </div>
        <div className="grid cols-2">
          {[
            ["1 · Pre-publish", "T−30d", "The successor key is generated and published next to the incumbent. Both validate; nothing changes for resolvers yet."],
            ["2 · Switch", "T0", "Signatures move to the successor. Signatures made by the incumbent keep validating until their TTL expires."],
            ["3 · Retire", "T+TTL", "The incumbent stops signing. On KSK rollover the parent DS is swapped automatically via CDS/CDNSKEY."],
            ["4 · Remove", "T+2 TTL", "The incumbent leaves the DNSKEY RRset and the database; the audit log records the retirement."],
          ].map(([title, tag, desc]) => (
            <div key={title} className="glass card reveal in">
              <div className="row between">
                <h3 style={{ fontSize: "1.02rem", margin: 0 }}>{title}</h3>
                <span className="badge mono">{tag}</span>
              </div>
              <p style={{ marginTop: 10, marginBottom: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="row" style={{ paddingBottom: 26 }}>
        <StatusDot label="pipeline-only" tone="success" pulse={false} />
      </div>
    </>
  );
}

/* ------------------------------ GATEWAY ------------------------------ */

function GatewayPage() {
  return (
    <>
      <PageSection
        eyebrow="gateway · transports"
        title="Gateway"
        description="One endpoint, every DNS transport. The gateway answers the same wire protocol over UDP, TCP, TLS, HTTPS and QUIC — and it is not a resolver replacement: it serves the zones argan is authoritative for and forwards the rest."
        reveal
      />

      <section className="glass card reveal in" style={{ marginTop: 30 }} aria-labelledby="tr-h">
        <h2 id="tr-h" style={{ fontSize: "1.05rem" }}>Transports</h2>
        <p className="small" style={{ marginBottom: 12 }}>
          Transport choice is a trade, not a dogma: classic is the fastest and the most visible; DoT hides the query but
          fights the port; DoH blends into web traffic; DoQ adds privacy with zero-RTT where UDP passes.
        </p>
        <div className="table-scroll">
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
              {TRANSPORTS.map(([name, port, spec, status, tone]) => (
                <tr key={name}>
                  <td className="strong">{name}</td>
                  <td className="mono">{port}</td>
                  <td className="mono tiny">{spec}</td>
                  <td>
                    <span className={`badge${tone === "default" ? "" : ` ${tone}`}`}>{status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section tight" aria-labelledby="doh-h">
        <div className="section-head">
          <p className="eyebrow reveal">rule ND-6005 · DoH-first</p>
          <h2 id="doh-h" className="reveal">Port 53 blocked? DoH first.</h2>
          <p className="reveal">
            Where port 53 is blocked or we hold no privilege, everything runs over DoH on plain HTTPS —
            indistinguishable from web traffic, crossing home, corporate and mobile firewalls. Valid public HTTPS comes
            from the edge with a tunnel; self-signed certificates stay in dev and on the LAN.
          </p>
        </div>
        <div className="grid cols-3">
          {[
            ["Probe", "A small UDP/53 probe runs on start and on interval. An answer means classic stays primary — it is still the fastest path."],
            ["Switch", "No answer: the client re-routes to DoH on 443 — wire format over GET ?dns= or POST, ID zeroed, application/dns-message back."],
            ["Serve", "Same TTL-cached answers on every transport. DoH JSON at /resolve stays reserved for the panel and debugging — never a critical path."],
          ].map(([title, desc]) => (
            <div key={title} className="glass card reveal in">
              <h3 style={{ fontSize: "1.02rem" }}>{title}</h3>
              <p style={{ margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section tight" aria-labelledby="core-h" style={{ paddingBottom: 32 }}>
        <div className="section-head">
          <p className="eyebrow reveal">corefile</p>
          <h2 id="core-h" className="reveal">Gateway core, staging shape</h2>
          <p className="reveal">
            The authoritative zone block, a privacy forwarder for the rest of the world, and the DoH listener that
            survives a firewalled 53.
          </p>
        </div>
        <pre className="reveal in">
          <code>{COREFILE}</code>
        </pre>
      </section>
    </>
  );
}
