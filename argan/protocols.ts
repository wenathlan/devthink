// # protocols — the protocol mesh of the family gateway, housed at the argan root.
// Library-grade module shipped inside the published packages (npm, maven with the Spring
// Boot rider): it owns the registry rows and pure, generic helpers only — zero consumer
// data. The mesh lists every wire the gateway speaks, grouped by family keyword: the web
// edge (http versions, websockets, webtransport), the api dialects that ride it, the mail,
// dns, file, remote, messaging, stream, tunnel, overlay, data, ops, directory and legacy
// families. Every row names its governing spec and its security posture — encrypted
// (protocol-native or TLS cryptography), opportunistic (STARTTLS or TLS-on-demand) or
// cleartext — and the helper layer answers lookups, group filters and the tls-capable
// count the owner law pins above one hundred.

import type { BadgeTone } from "./argan";

/** The hierarchical family keyword every protocol row carries (the pane groups). */
export type ProtocolGroup =
  | "web"
  | "api"
  | "collab"
  | "mail"
  | "dns"
  | "file"
  | "remote"
  | "messaging"
  | "stream"
  | "tunnel"
  | "overlay"
  | "data"
  | "ops"
  | "directory"
  | "legacy";

/** The security posture of the wire (encrypted covers TLS and protocol-native crypto). */
export type ProtocolSecurity = "encrypted" | "opportunistic" | "cleartext";

/** One row of the gateway protocol mesh: the scheme, its port, spec, family and state. */
export interface ProtocolSpec {
  /** the scheme the gateway registers, lowercase ("https", "wss", "webtransport") */
  scheme: string;
  /** the display name of the protocol */
  name: string;
  /** the default port of the wire ("—" when the protocol negotiates its own) */
  port: string;
  /** the governing spec or reference of the protocol */
  spec: string;
  /** the hierarchical family the protocol belongs to */
  group: ProtocolGroup;
  /** the security posture of the wire */
  security: ProtocolSecurity;
  /** the state of the listener on the gateway ("live", "preferred", "planned", "opt-in", "legacy") */
  state: string;
}

/**
 * The mesh itself: 231 rows grouped by family keyword, alphabetical inside every group.
 * The web family leads — it is the https edge the whole api surface rides — and the dns
 * family carries the argan home transports the gateway already answers today.
 */
export const PROTOCOLS: readonly ProtocolSpec[] = [
  /** ## web — the https edge: document and transport protocols of the gateway. */
  { scheme: "coap", name: "CoAP", port: "5683/UDP", spec: "RFC 7252", group: "web", security: "cleartext", state: "opt-in" },
  { scheme: "coaps", name: "CoAP over DTLS", port: "5684/UDP", spec: "RFC 7252 · 6347", group: "web", security: "encrypted", state: "opt-in" },
  { scheme: "gemini", name: "Gemini", port: "1965", spec: "the gemini spec", group: "web", security: "encrypted", state: "opt-in" },
  { scheme: "graphql-ws", name: "GraphQL subscriptions over wss", port: "443", spec: "the graphql-transport-ws spec", group: "web", security: "encrypted", state: "live" },
  { scheme: "h2", name: "HTTP/2 over TLS", port: "443", spec: "RFC 9113", group: "web", security: "encrypted", state: "live" },
  { scheme: "h2c", name: "HTTP/2 cleartext upgrade", port: "80", spec: "RFC 9113", group: "web", security: "cleartext", state: "opt-in" },
  { scheme: "h3", name: "HTTP/3 over QUIC", port: "443/UDP", spec: "RFC 9114", group: "web", security: "encrypted", state: "live" },
  { scheme: "http", name: "HTTP/1.1", port: "80", spec: "RFC 9110 · 9112", group: "web", security: "cleartext", state: "live" },
  { scheme: "https", name: "HTTP/1.1 over TLS", port: "443", spec: "RFC 9110 · 8446", group: "web", security: "encrypted", state: "live" },
  { scheme: "longpoll", name: "HTTP long polling", port: "80/443", spec: "the keep-alive pattern", group: "web", security: "opportunistic", state: "live" },
  { scheme: "spdy", name: "SPDY/3.1", port: "443", spec: "the spdy draft", group: "web", security: "encrypted", state: "legacy" },
  { scheme: "sse", name: "Server-Sent Events", port: "443", spec: "text/event-stream · WHATWG", group: "web", security: "encrypted", state: "live" },
  { scheme: "webcodecs", name: "WebCodecs", port: "—", spec: "W3C WebCodecs", group: "web", security: "encrypted", state: "live" },
  { scheme: "webtransport", name: "WebTransport", port: "443/UDP", spec: "W3C WebTransport · RFC 9114", group: "web", security: "encrypted", state: "live" },
  { scheme: "webrtc", name: "WebRTC (DTLS-SRTP)", port: "ephemeral/UDP", spec: "W3C WebRTC 1.0 · RFC 8825", group: "web", security: "encrypted", state: "live" },
  { scheme: "ws", name: "WebSocket", port: "80", spec: "RFC 6455", group: "web", security: "cleartext", state: "live" },
  { scheme: "wss", name: "WebSocket Secure", port: "443", spec: "RFC 6455", group: "web", security: "encrypted", state: "live" },

  /** ## api — the rpc and api dialects riding the https edge. */
  { scheme: "acme", name: "ACME certificate orders", port: "443", spec: "RFC 8555", group: "api", security: "encrypted", state: "live" },
  { scheme: "activitypub", name: "ActivityPub", port: "443", spec: "W3C ActivityPub", group: "api", security: "encrypted", state: "live" },
  { scheme: "atproto", name: "AT Protocol", port: "443", spec: "the atproto spec", group: "api", security: "encrypted", state: "opt-in" },
  { scheme: "capnproto", name: "Cap'n Proto RPC", port: "—", spec: "the cap'n proto rpc spec", group: "api", security: "opportunistic", state: "opt-in" },
  { scheme: "certificate-transparency", name: "Certificate Transparency", port: "443", spec: "RFC 6962", group: "api", security: "opportunistic", state: "live" },
  { scheme: "grpc", name: "gRPC over HTTP/2", port: "50051", spec: "the grpc spec", group: "api", security: "opportunistic", state: "live" },
  { scheme: "grpcs", name: "gRPC over TLS", port: "443", spec: "the grpc spec · RFC 8446", group: "api", security: "encrypted", state: "live" },
  { scheme: "grpc-web", name: "gRPC-Web", port: "443", spec: "the grpc-web spec", group: "api", security: "encrypted", state: "live" },
  { scheme: "jsonrpc", name: "JSON-RPC 2.0", port: "80/443", spec: "the json-rpc 2.0 spec", group: "api", security: "opportunistic", state: "live" },
  { scheme: "matrix", name: "Matrix federation", port: "8448", spec: "the matrix spec", group: "api", security: "encrypted", state: "live" },
  { scheme: "micropub", name: "Micropub", port: "443", spec: "W3C Micropub", group: "api", security: "encrypted", state: "opt-in" },
  { scheme: "msgpack-rpc", name: "MessagePack-RPC", port: "—", spec: "the msgpack-rpc spec", group: "api", security: "opportunistic", state: "opt-in" },
  { scheme: "oembed", name: "oEmbed", port: "443", spec: "the oembed 1.0 spec", group: "api", security: "encrypted", state: "live" },
  { scheme: "ohttp", name: "Oblivious HTTP", port: "443", spec: "RFC 9458", group: "api", security: "encrypted", state: "opt-in" },
  { scheme: "ocsp", name: "OCSP", port: "80/443", spec: "RFC 6960", group: "api", security: "opportunistic", state: "live" },
  { scheme: "openid-connect", name: "OpenID Connect", port: "443", spec: "the oidc core 1.0", group: "api", security: "encrypted", state: "live" },
  { scheme: "pingback", name: "Pingback", port: "80/443", spec: "the pingback 1.0 spec", group: "api", security: "opportunistic", state: "legacy" },
  { scheme: "soap", name: "SOAP 1.2", port: "443", spec: "W3C SOAP 1.2", group: "api", security: "opportunistic", state: "live" },
  { scheme: "thrift", name: "Apache Thrift RPC", port: "9090", spec: "the thrift protocol", group: "api", security: "opportunistic", state: "live" },
  { scheme: "webfinger", name: "WebFinger", port: "443", spec: "RFC 7033", group: "api", security: "encrypted", state: "live" },
  { scheme: "webmention", name: "Webmention", port: "443", spec: "W3C Webmention", group: "api", security: "encrypted", state: "opt-in" },
  { scheme: "webpush", name: "Web Push", port: "443", spec: "RFC 8030 · 8291", group: "api", security: "encrypted", state: "live" },
  { scheme: "xmlrpc", name: "XML-RPC", port: "80/443", spec: "the xml-rpc spec", group: "api", security: "opportunistic", state: "live" },

  /** ## collab — the calendaring and pim dialects over http. */
  { scheme: "caldav", name: "CalDAV", port: "80/443", spec: "RFC 4791", group: "collab", security: "opportunistic", state: "live" },
  { scheme: "carddav", name: "CardDAV", port: "80/443", spec: "RFC 6352", group: "collab", security: "opportunistic", state: "live" },
  { scheme: "webdav", name: "WebDAV", port: "80/443", spec: "RFC 4918", group: "collab", security: "opportunistic", state: "live" },
  { scheme: "webdavs", name: "WebDAV over TLS", port: "443", spec: "RFC 4918 · 8446", group: "collab", security: "encrypted", state: "live" },

  /** ## mail — the store-and-forward family. */
  { scheme: "imap", name: "IMAP4rev2", port: "143", spec: "RFC 9051", group: "mail", security: "opportunistic", state: "live" },
  { scheme: "imaps", name: "IMAP over TLS", port: "993", spec: "RFC 8314", group: "mail", security: "encrypted", state: "live" },
  { scheme: "jmap", name: "JMAP", port: "443", spec: "RFC 8620 · 8621", group: "mail", security: "encrypted", state: "live" },
  { scheme: "lmtp", name: "LMTP", port: "—", spec: "RFC 2033", group: "mail", security: "opportunistic", state: "live" },
  { scheme: "pop3", name: "POP3", port: "110", spec: "RFC 1939", group: "mail", security: "opportunistic", state: "live" },
  { scheme: "pop3s", name: "POP3 over TLS", port: "995", spec: "RFC 8314", group: "mail", security: "encrypted", state: "live" },
  { scheme: "sieve", name: "ManageSieve", port: "4190", spec: "RFC 5804", group: "mail", security: "opportunistic", state: "opt-in" },
  { scheme: "smtp", name: "SMTP relay", port: "25", spec: "RFC 5321", group: "mail", security: "cleartext", state: "live" },
  { scheme: "smtps", name: "SMTP over implicit TLS", port: "465", spec: "RFC 8314", group: "mail", security: "encrypted", state: "live" },
  { scheme: "submission", name: "Mail submission (STARTTLS)", port: "587", spec: "RFC 6409", group: "mail", security: "opportunistic", state: "live" },

  /** ## dns — the name resolution family (the argan home). */
  { scheme: "axfr", name: "AXFR full zone transfer", port: "53", spec: "RFC 5936", group: "dns", security: "cleartext", state: "live" },
  { scheme: "dns", name: "Classic DNS (UDP + TCP)", port: "53", spec: "RFC 1035 · 7766", group: "dns", security: "cleartext", state: "live" },
  { scheme: "dnscrypt", name: "DNSCrypt v2", port: "443", spec: "the dnscrypt v2 spec", group: "dns", security: "encrypted", state: "opt-in" },
  { scheme: "dns-sd", name: "DNS-SD", port: "5353/UDP", spec: "RFC 6763", group: "dns", security: "cleartext", state: "live" },
  { scheme: "doh", name: "DNS over HTTPS", port: "443", spec: "RFC 8484", group: "dns", security: "encrypted", state: "preferred" },
  { scheme: "doh-json", name: "DoH JSON (/resolve)", port: "443", spec: "the json resolver draft", group: "dns", security: "encrypted", state: "panel · debug" },
  { scheme: "doq", name: "DNS over QUIC", port: "853/UDP", spec: "RFC 9250", group: "dns", security: "encrypted", state: "planned" },
  { scheme: "dot", name: "DNS over TLS", port: "853", spec: "RFC 7858 · 8310", group: "dns", security: "encrypted", state: "live" },
  { scheme: "ixfr", name: "IXFR incremental transfer", port: "53", spec: "RFC 1995", group: "dns", security: "cleartext", state: "live" },
  { scheme: "llmnr", name: "LLMNR", port: "5355/UDP", spec: "RFC 4795", group: "dns", security: "cleartext", state: "legacy" },
  { scheme: "mdns", name: "Multicast DNS", port: "5353/UDP", spec: "RFC 6762", group: "dns", security: "cleartext", state: "live" },
  { scheme: "odoh", name: "Oblivious DoH", port: "443", spec: "RFC 9230", group: "dns", security: "encrypted", state: "planned" },

  /** ## file — the transfer and filesystem family. */
  { scheme: "9p", name: "Plan 9 filesystem", port: "564", spec: "9P2000", group: "file", security: "cleartext", state: "opt-in" },
  { scheme: "afs", name: "AFS", port: "7000", spec: "the rx protocol", group: "file", security: "cleartext", state: "legacy" },
  { scheme: "cifs", name: "CIFS", port: "445", spec: "MS-CIFS", group: "file", security: "opportunistic", state: "legacy" },
  { scheme: "ftp", name: "FTP", port: "21", spec: "RFC 959", group: "file", security: "cleartext", state: "legacy" },
  { scheme: "ftp-data", name: "FTP data channel", port: "20", spec: "RFC 959", group: "file", security: "cleartext", state: "legacy" },
  { scheme: "ftps", name: "FTP over TLS", port: "990", spec: "RFC 4217", group: "file", security: "encrypted", state: "opt-in" },
  { scheme: "git", name: "Git native protocol", port: "9418", spec: "the git protocol v2", group: "file", security: "cleartext", state: "live" },
  { scheme: "git-http", name: "Git smart HTTP", port: "80/443", spec: "the git http-protocol", group: "file", security: "opportunistic", state: "live" },
  { scheme: "hg", name: "Mercurial wire", port: "8000", spec: "the mercurial wire protocol", group: "file", security: "cleartext", state: "legacy" },
  { scheme: "nfs", name: "NFSv4.2", port: "2049", spec: "RFC 7862", group: "file", security: "cleartext", state: "live" },
  { scheme: "rsync", name: "rsync delta transfer", port: "873", spec: "the rsync protocol", group: "file", security: "cleartext", state: "live" },
  { scheme: "scp", name: "SCP", port: "22", spec: "the scp dialect", group: "file", security: "encrypted", state: "legacy" },
  { scheme: "sftp", name: "SFTP", port: "22", spec: "the sftp v3 dialect", group: "file", security: "encrypted", state: "live" },
  { scheme: "smb", name: "SMB", port: "445", spec: "MS-SMB2", group: "file", security: "opportunistic", state: "live" },
  { scheme: "svn", name: "Subversion svn://", port: "3690", spec: "the ra_svn protocol", group: "file", security: "opportunistic", state: "legacy" },
  { scheme: "tftp", name: "TFTP", port: "69/UDP", spec: "RFC 1350", group: "file", security: "cleartext", state: "opt-in" },

  /** ## remote — the remote seat family. */
  { scheme: "mosh", name: "Mosh roaming shell", port: "60000/UDP", spec: "the mosh protocol", group: "remote", security: "encrypted", state: "live" },
  { scheme: "rdp", name: "RDP", port: "3389", spec: "MS-RDPBCGR", group: "remote", security: "encrypted", state: "live" },
  { scheme: "rlogin", name: "rlogin", port: "513", spec: "RFC 1282", group: "remote", security: "cleartext", state: "legacy" },
  { scheme: "rsh", name: "rsh", port: "514", spec: "the berkeley rsh", group: "remote", security: "cleartext", state: "legacy" },
  { scheme: "spice", name: "SPICE", port: "5900+", spec: "the spice protocol", group: "remote", security: "opportunistic", state: "opt-in" },
  { scheme: "ssh", name: "SSH", port: "22", spec: "RFC 4253", group: "remote", security: "encrypted", state: "live" },
  { scheme: "telnet", name: "Telnet", port: "23", spec: "RFC 854", group: "remote", security: "cleartext", state: "legacy" },
  { scheme: "vnc", name: "VNC (RFB)", port: "5900", spec: "the rfb protocol", group: "remote", security: "opportunistic", state: "live" },
  { scheme: "x11", name: "X11", port: "6000", spec: "the x11 protocol", group: "remote", security: "cleartext", state: "legacy" },

  /** ## messaging — the pubsub, im and signaling family. */
  { scheme: "amqp", name: "AMQP 1.0", port: "5672", spec: "OASIS AMQP 1.0", group: "messaging", security: "cleartext", state: "live" },
  { scheme: "amqps", name: "AMQP over TLS", port: "5671", spec: "OASIS AMQP 1.0", group: "messaging", security: "encrypted", state: "live" },
  { scheme: "h323", name: "H.323", port: "1720", spec: "ITU-T H.323", group: "messaging", security: "opportunistic", state: "legacy" },
  { scheme: "iax", name: "IAX2", port: "4569/UDP", spec: "the iax2 protocol", group: "messaging", security: "cleartext", state: "opt-in" },
  { scheme: "irc", name: "IRC", port: "6667", spec: "RFC 1459 · 2812", group: "messaging", security: "cleartext", state: "live" },
  { scheme: "ircs", name: "IRC over TLS", port: "6697", spec: "RFC 7194", group: "messaging", security: "encrypted", state: "live" },
  { scheme: "kafka", name: "Kafka log protocol", port: "9092", spec: "the kafka protocol", group: "messaging", security: "opportunistic", state: "live" },
  { scheme: "mgcp", name: "MGCP", port: "2427/UDP", spec: "RFC 3435", group: "messaging", security: "cleartext", state: "legacy" },
  { scheme: "mqtt", name: "MQTT 5", port: "1883", spec: "the mqtt 5.0 spec", group: "messaging", security: "cleartext", state: "live" },
  { scheme: "mqtt-sn", name: "MQTT-SN", port: "1884/UDP", spec: "the mqtt-sn 1.2 spec", group: "messaging", security: "cleartext", state: "opt-in" },
  { scheme: "mqtts", name: "MQTT over TLS", port: "8883", spec: "the mqtt 5.0 spec", group: "messaging", security: "encrypted", state: "live" },
  { scheme: "msrp", name: "MSRP", port: "—", spec: "RFC 4975", group: "messaging", security: "opportunistic", state: "opt-in" },
  { scheme: "msrps", name: "MSRP over TLS", port: "—", spec: "RFC 4975", group: "messaging", security: "encrypted", state: "opt-in" },
  { scheme: "nats", name: "NATS", port: "4222", spec: "the nats protocol", group: "messaging", security: "opportunistic", state: "live" },
  { scheme: "nanomsg", name: "nanomsg SP", port: "—", spec: "the nanomsg sp spec", group: "messaging", security: "opportunistic", state: "opt-in" },
  { scheme: "nostr", name: "Nostr relays", port: "443", spec: "NIP-01", group: "messaging", security: "encrypted", state: "opt-in" },
  { scheme: "openwire", name: "OpenWire", port: "61616", spec: "the openwire spec", group: "messaging", security: "opportunistic", state: "opt-in" },
  { scheme: "sccp", name: "SCCP (Skinny)", port: "2000", spec: "the sccp protocol", group: "messaging", security: "cleartext", state: "legacy" },
  { scheme: "sip", name: "SIP", port: "5060", spec: "RFC 3261", group: "messaging", security: "opportunistic", state: "live" },
  { scheme: "sips", name: "SIPS", port: "5061", spec: "RFC 3261", group: "messaging", security: "encrypted", state: "live" },
  { scheme: "smpp", name: "SMPP", port: "2775", spec: "the smpp 5.0 spec", group: "messaging", security: "cleartext", state: "live" },
  { scheme: "stomp", name: "STOMP 1.2", port: "61613", spec: "the stomp 1.2 spec", group: "messaging", security: "opportunistic", state: "opt-in" },
  { scheme: "xmpp", name: "XMPP", port: "5222", spec: "RFC 6120 · 6121", group: "messaging", security: "opportunistic", state: "live" },
  { scheme: "xmpps", name: "XMPP over TLS", port: "5223", spec: "RFC 6120", group: "messaging", security: "encrypted", state: "legacy" },
  { scheme: "zeromq", name: "ZeroMQ (ZMTP 3.0)", port: "—", spec: "the zmtp 3.0 spec", group: "messaging", security: "opportunistic", state: "live" },

  /** ## stream — the media delivery family. */
  { scheme: "dash", name: "MPEG-DASH segments", port: "80/443", spec: "the mpeg-dash spec", group: "stream", security: "opportunistic", state: "live" },
  { scheme: "hls", name: "HTTP Live Streaming", port: "80/443", spec: "RFC 8216", group: "stream", security: "opportunistic", state: "live" },
  { scheme: "mss", name: "Smooth Streaming", port: "80/443", spec: "MS-SSTR", group: "stream", security: "opportunistic", state: "legacy" },
  { scheme: "osc", name: "Open Sound Control", port: "—", spec: "the osc 1.0 spec", group: "stream", security: "cleartext", state: "opt-in" },
  { scheme: "rist", name: "RIST", port: "—", spec: "the rist profile", group: "stream", security: "opportunistic", state: "opt-in" },
  { scheme: "rtcp", name: "RTCP", port: "—", spec: "RFC 3550", group: "stream", security: "cleartext", state: "live" },
  { scheme: "rtmp", name: "RTMP", port: "1935", spec: "the rtmp spec", group: "stream", security: "cleartext", state: "live" },
  { scheme: "rtmpe", name: "RTMPE", port: "1935", spec: "the rtmpe variant", group: "stream", security: "encrypted", state: "legacy" },
  { scheme: "rtmfp", name: "RTMFP", port: "1935/UDP", spec: "the rtmfp spec", group: "stream", security: "encrypted", state: "legacy" },
  { scheme: "rtmps", name: "RTMPS", port: "443", spec: "the rtmps variant", group: "stream", security: "encrypted", state: "live" },
  { scheme: "rtp", name: "RTP (AVP profile)", port: "—", spec: "RFC 3550", group: "stream", security: "cleartext", state: "live" },
  { scheme: "rtsp", name: "RTSP 2.0", port: "554", spec: "RFC 7826", group: "stream", security: "opportunistic", state: "live" },
  { scheme: "rtsps", name: "RTSP over TLS", port: "322", spec: "RFC 8341", group: "stream", security: "encrypted", state: "live" },
  { scheme: "srt", name: "SRT", port: "—", spec: "the srt protocol", group: "stream", security: "encrypted", state: "live" },
  { scheme: "srtp", name: "SRTP", port: "—", spec: "RFC 3711", group: "stream", security: "encrypted", state: "live" },

  /** ## tunnel — the vpn and encapsulation family. */
  { scheme: "dccp", name: "DCCP", port: "—", spec: "RFC 4340", group: "tunnel", security: "cleartext", state: "legacy" },
  { scheme: "dtls", name: "DTLS 1.3", port: "—", spec: "RFC 9147", group: "tunnel", security: "encrypted", state: "live" },
  { scheme: "enet", name: "ENet", port: "—", spec: "the enet protocol", group: "tunnel", security: "cleartext", state: "opt-in" },
  { scheme: "esp", name: "IPsec ESP", port: "50", spec: "RFC 4303", group: "tunnel", security: "encrypted", state: "live" },
  { scheme: "geneve", name: "GENEVE", port: "6081/UDP", spec: "RFC 8926", group: "tunnel", security: "cleartext", state: "opt-in" },
  { scheme: "gre", name: "GRE", port: "47", spec: "RFC 2784", group: "tunnel", security: "cleartext", state: "legacy" },
  { scheme: "ike", name: "IKEv2", port: "500/4500", spec: "RFC 7296", group: "tunnel", security: "encrypted", state: "live" },
  { scheme: "ipsec", name: "IPsec tunnel", port: "50/4500", spec: "RFC 4301", group: "tunnel", security: "encrypted", state: "live" },
  { scheme: "kcp", name: "KCP", port: "—", spec: "the kcp protocol", group: "tunnel", security: "opportunistic", state: "opt-in" },
  { scheme: "l2tp", name: "L2TP", port: "1701/UDP", spec: "RFC 3931", group: "tunnel", security: "cleartext", state: "legacy" },
  { scheme: "masque", name: "MASQUE (CONNECT-UDP)", port: "443/UDP", spec: "RFC 9484", group: "tunnel", security: "encrypted", state: "planned" },
  { scheme: "mptcp", name: "Multipath TCP", port: "—", spec: "RFC 8684", group: "tunnel", security: "cleartext", state: "opt-in" },
  { scheme: "openvpn", name: "OpenVPN", port: "1194/UDP", spec: "the openvpn protocol", group: "tunnel", security: "encrypted", state: "live" },
  { scheme: "pptp", name: "PPTP", port: "1723", spec: "RFC 2637", group: "tunnel", security: "opportunistic", state: "legacy" },
  { scheme: "quic", name: "QUIC", port: "443/UDP", spec: "RFC 9000", group: "tunnel", security: "encrypted", state: "live" },
  { scheme: "raknet", name: "RakNet", port: "—", spec: "the raknet protocol", group: "tunnel", security: "cleartext", state: "opt-in" },
  { scheme: "sctp", name: "SCTP", port: "132", spec: "RFC 4960", group: "tunnel", security: "cleartext", state: "opt-in" },
  { scheme: "socks4", name: "SOCKS4", port: "1080", spec: "the socks4 protocol", group: "tunnel", security: "cleartext", state: "legacy" },
  { scheme: "socks5", name: "SOCKS5", port: "1080", spec: "RFC 1928", group: "tunnel", security: "opportunistic", state: "live" },
  { scheme: "socks5h", name: "SOCKS5 with remote DNS", port: "1080", spec: "RFC 1928", group: "tunnel", security: "opportunistic", state: "live" },
  { scheme: "tinc", name: "tinc mesh vpn", port: "655", spec: "the tinc protocol", group: "tunnel", security: "encrypted", state: "opt-in" },
  { scheme: "tls", name: "TLS 1.3 record layer", port: "—", spec: "RFC 8446", group: "tunnel", security: "encrypted", state: "live" },
  { scheme: "vxlan", name: "VXLAN", port: "4789/UDP", spec: "RFC 7348", group: "tunnel", security: "cleartext", state: "live" },
  { scheme: "wireguard", name: "WireGuard", port: "51820/UDP", spec: "the wireguard protocol", group: "tunnel", security: "encrypted", state: "live" },
  { scheme: "zerotier", name: "ZeroTier", port: "9993/UDP", spec: "the zerotier protocol", group: "tunnel", security: "encrypted", state: "opt-in" },

  /** ## overlay — the decentralized naming, storage and privacy family. */
  { scheme: "bittorrent", name: "BitTorrent", port: "6881", spec: "BEP 3 · BEP 10", group: "overlay", security: "opportunistic", state: "live" },
  { scheme: "cjdns", name: "Cjdns", port: "—", spec: "the cjdns protocol", group: "overlay", security: "encrypted", state: "opt-in" },
  { scheme: "dat", name: "Dat", port: "—", spec: "the dat protocol", group: "overlay", security: "encrypted", state: "legacy" },
  { scheme: "devp2p", name: "devp2p", port: "30303/UDP", spec: "the devp2p spec", group: "overlay", security: "encrypted", state: "opt-in" },
  { scheme: "dht", name: "Mainline DHT (KRPC)", port: "6881/UDP", spec: "BEP 5", group: "overlay", security: "cleartext", state: "live" },
  { scheme: "filecoin", name: "Filecoin", port: "—", spec: "the filecoin spec", group: "overlay", security: "encrypted", state: "opt-in" },
  { scheme: "hypercore", name: "Hypercore", port: "—", spec: "the hypercore protocol", group: "overlay", security: "encrypted", state: "opt-in" },
  { scheme: "i2p", name: "I2P", port: "—", spec: "the i2p protocol", group: "overlay", security: "encrypted", state: "opt-in" },
  { scheme: "ipfs", name: "IPFS", port: "4001", spec: "the ipfs spec", group: "overlay", security: "opportunistic", state: "opt-in" },
  { scheme: "ipns", name: "IPNS", port: "4001", spec: "the ipns spec", group: "overlay", security: "opportunistic", state: "opt-in" },
  { scheme: "libp2p", name: "libp2p", port: "4001", spec: "the libp2p spec", group: "overlay", security: "encrypted", state: "opt-in" },
  { scheme: "ssb", name: "Secure Scuttlebutt", port: "8008", spec: "the ssb protocol", group: "overlay", security: "encrypted", state: "opt-in" },
  { scheme: "tor", name: "Tor onion services v3", port: "—", spec: "the tor dirspec", group: "overlay", security: "encrypted", state: "opt-in" },
  { scheme: "yggdrasil", name: "Yggdrasil", port: "—", spec: "the yggdrasil protocol", group: "overlay", security: "encrypted", state: "opt-in" },

  /** ## data — the database wire family. */
  { scheme: "cassandra", name: "Cassandra native transport", port: "9042", spec: "the cql binary protocol", group: "data", security: "opportunistic", state: "live" },
  { scheme: "clickhouse", name: "ClickHouse native", port: "9000", spec: "the clickhouse wire", group: "data", security: "opportunistic", state: "opt-in" },
  { scheme: "memcached", name: "Memcached", port: "11211", spec: "the memcached protocol", group: "data", security: "cleartext", state: "live" },
  { scheme: "mongodb", name: "MongoDB (OP_MSG)", port: "27017", spec: "the mongodb wire", group: "data", security: "opportunistic", state: "live" },
  { scheme: "mysql", name: "MySQL client protocol", port: "3306", spec: "the mysql protocol", group: "data", security: "opportunistic", state: "live" },
  { scheme: "postgresql", name: "PostgreSQL v3 protocol", port: "5432", spec: "the pg v3 protocol", group: "data", security: "opportunistic", state: "live" },
  { scheme: "redis", name: "Redis RESP3", port: "6379", spec: "RESP3", group: "data", security: "opportunistic", state: "live" },

  /** ## ops — the observability and time family. */
  { scheme: "chargen", name: "Character Generator", port: "19", spec: "RFC 864", group: "ops", security: "cleartext", state: "legacy" },
  { scheme: "daytime", name: "Daytime", port: "13", spec: "RFC 867", group: "ops", security: "cleartext", state: "legacy" },
  { scheme: "discard", name: "Discard", port: "9", spec: "RFC 863", group: "ops", security: "cleartext", state: "legacy" },
  { scheme: "echo", name: "Echo", port: "7", spec: "RFC 862", group: "ops", security: "cleartext", state: "legacy" },
  { scheme: "ipfix", name: "IPFIX", port: "4739/UDP", spec: "RFC 7011", group: "ops", security: "cleartext", state: "live" },
  { scheme: "netflow", name: "NetFlow v9", port: "2055/UDP", spec: "the netflow spec", group: "ops", security: "cleartext", state: "live" },
  { scheme: "ntp", name: "NTPv4", port: "123/UDP", spec: "RFC 5905", group: "ops", security: "cleartext", state: "live" },
  { scheme: "openmetrics", name: "OpenMetrics scrape", port: "443", spec: "the openmetrics spec", group: "ops", security: "encrypted", state: "live" },
  { scheme: "ptp", name: "PTP", port: "319/UDP", spec: "IEEE 1588", group: "ops", security: "cleartext", state: "opt-in" },
  { scheme: "sflow", name: "sFlow v5", port: "6343/UDP", spec: "the sflow spec", group: "ops", security: "cleartext", state: "live" },
  { scheme: "snmp", name: "SNMPv3", port: "161/UDP", spec: "RFC 3411", group: "ops", security: "opportunistic", state: "live" },
  { scheme: "snmptrap", name: "SNMP traps", port: "162/UDP", spec: "RFC 3416", group: "ops", security: "cleartext", state: "live" },
  { scheme: "syslog", name: "Syslog", port: "514/UDP", spec: "RFC 5424", group: "ops", security: "cleartext", state: "live" },
  { scheme: "syslog-tls", name: "Syslog over TLS", port: "6514", spec: "RFC 5425", group: "ops", security: "encrypted", state: "live" },

  /** ## directory — the lookup and identity family. */
  { scheme: "dict", name: "DICT", port: "2628", spec: "RFC 2229", group: "directory", security: "cleartext", state: "legacy" },
  { scheme: "kerberos", name: "Kerberos V5", port: "88", spec: "RFC 4120", group: "directory", security: "encrypted", state: "live" },
  { scheme: "kpasswd", name: "Kerberos password change", port: "464", spec: "the kpasswd dialect", group: "directory", security: "opportunistic", state: "live" },
  { scheme: "ldap", name: "LDAPv3", port: "389", spec: "RFC 4511", group: "directory", security: "opportunistic", state: "live" },
  { scheme: "ldaps", name: "LDAP over TLS", port: "636", spec: "RFC 4513", group: "directory", security: "encrypted", state: "live" },
  { scheme: "radsec", name: "RADIUS over TLS", port: "2083", spec: "RFC 6614", group: "directory", security: "encrypted", state: "live" },
  { scheme: "radius", name: "RADIUS", port: "1812/UDP", spec: "RFC 2865", group: "directory", security: "cleartext", state: "live" },
  { scheme: "rdap", name: "RDAP", port: "443", spec: "RFC 9082 · 9083", group: "directory", security: "encrypted", state: "live" },
  { scheme: "tacacs", name: "TACACS", port: "49", spec: "RFC 8907", group: "directory", security: "cleartext", state: "legacy" },
  { scheme: "tacacs+", name: "TACACS+", port: "49", spec: "RFC 8907", group: "directory", security: "opportunistic", state: "live" },
  { scheme: "z39.50", name: "Z39.50", port: "210", spec: "ANSI/NISO Z39.50", group: "directory", security: "cleartext", state: "legacy" },

  /** ## legacy — the inherited wires the gateway still translates. */
  { scheme: "aprs", name: "APRS packet radio", port: "14580/UDP", spec: "the aprs spec", group: "legacy", security: "cleartext", state: "opt-in" },
  { scheme: "arp", name: "ARP", port: "—", spec: "RFC 826", group: "legacy", security: "cleartext", state: "live" },
  { scheme: "bfd", name: "BFD", port: "3784/UDP", spec: "RFC 5880", group: "legacy", security: "cleartext", state: "live" },
  { scheme: "bgp", name: "BGP-4", port: "179", spec: "RFC 4271", group: "legacy", security: "cleartext", state: "live" },
  { scheme: "binkp", name: "BinkP", port: "24554", spec: "the binkp protocol", group: "legacy", security: "opportunistic", state: "legacy" },
  { scheme: "dtn", name: "Bundle Protocol v7", port: "—", spec: "RFC 9171", group: "legacy", security: "opportunistic", state: "opt-in" },
  { scheme: "eigrp", name: "EIGRP", port: "—", spec: "RFC 7868", group: "legacy", security: "cleartext", state: "legacy" },
  { scheme: "finger", name: "Finger", port: "79", spec: "RFC 1288", group: "legacy", security: "cleartext", state: "legacy" },
  { scheme: "gopher", name: "Gopher", port: "70", spec: "RFC 1436", group: "legacy", security: "cleartext", state: "legacy" },
  { scheme: "gophers", name: "Gopher over TLS", port: "70", spec: "the gophers extension", group: "legacy", security: "encrypted", state: "legacy" },
  { scheme: "gtp", name: "GTP (the telco bearer)", port: "2152/UDP", spec: "3GPP TS 29.281", group: "legacy", security: "cleartext", state: "live" },
  { scheme: "icmp", name: "ICMP", port: "—", spec: "RFC 792", group: "legacy", security: "cleartext", state: "live" },
  { scheme: "icmpv6", name: "ICMPv6", port: "—", spec: "RFC 4443", group: "legacy", security: "cleartext", state: "live" },
  { scheme: "ident", name: "Ident", port: "113", spec: "RFC 1413", group: "legacy", security: "cleartext", state: "legacy" },
  { scheme: "igmp", name: "IGMP", port: "—", spec: "RFC 3376", group: "legacy", security: "cleartext", state: "live" },
  { scheme: "isis", name: "IS-IS", port: "—", spec: "ISO 10589 · RFC 1195", group: "legacy", security: "cleartext", state: "live" },
  { scheme: "modbus", name: "Modbus TCP", port: "502", spec: "the modbus spec", group: "legacy", security: "cleartext", state: "live" },
  { scheme: "ndmp", name: "NDMP", port: "10000", spec: "the ndmp protocol", group: "legacy", security: "cleartext", state: "legacy" },
  { scheme: "netbios", name: "NetBIOS", port: "137-139", spec: "RFC 1001 · 1002", group: "legacy", security: "cleartext", state: "legacy" },
  { scheme: "nntp", name: "NNTP", port: "119", spec: "RFC 3977", group: "legacy", security: "cleartext", state: "legacy" },
  { scheme: "nntps", name: "NNTP over TLS", port: "563", spec: "RFC 4642", group: "legacy", security: "encrypted", state: "legacy" },
  { scheme: "opc-ua", name: "OPC UA", port: "4840", spec: "IEC 62541", group: "legacy", security: "opportunistic", state: "opt-in" },
  { scheme: "ospf", name: "OSPF", port: "—", spec: "RFC 2328", group: "legacy", security: "cleartext", state: "live" },
  { scheme: "rip", name: "RIP2", port: "520/UDP", spec: "RFC 2453", group: "legacy", security: "cleartext", state: "legacy" },
  { scheme: "slp", name: "SLP", port: "427", spec: "RFC 2609", group: "legacy", security: "cleartext", state: "legacy" },
  { scheme: "ssdp", name: "SSDP", port: "1900/UDP", spec: "the upnp uda spec", group: "legacy", security: "cleartext", state: "live" },
  { scheme: "uucp", name: "UUCP", port: "540", spec: "the uucp protocol", group: "legacy", security: "cleartext", state: "legacy" },
  { scheme: "whois", name: "WHOIS", port: "43", spec: "RFC 3912", group: "legacy", security: "cleartext", state: "live" },
  { scheme: "wsdd", name: "WS-Discovery", port: "3702/UDP", spec: "the ws-discovery spec", group: "legacy", security: "cleartext", state: "live" },
];

/** The row count of the mesh (the number the pane and the tests announce). */
export const PROTOCOL_COUNT = PROTOCOLS.length;

/** Finds one protocol row by its scheme (case-insensitive, exact match). */
export function findProtocol(scheme: string): ProtocolSpec | undefined {
  const wanted = scheme.trim().toLowerCase();
  return PROTOCOLS.find((row) => row.scheme === wanted);
}

/** Lists every protocol of one family (the pane renders one group per family keyword). */
export function protocolsByGroup(group: ProtocolGroup): ProtocolSpec[] {
  return PROTOCOLS.filter((row) => row.group === group);
}

/** Lists the schemes the gateway registers (one entry per protocol row). */
export function protocolSchemes(): string[] {
  return PROTOCOLS.map((row) => row.scheme);
}

/**
 * Lists the tls-capable protocols of the mesh — every row whose wire runs encrypted or
 * upgrades to it (STARTTLS, TLS-on-demand). The owner law pins this count above one
 * hundred: the gateway speaks more than a hundred protocols over https-grade crypto.
 */
export function tlsCapableProtocols(): ProtocolSpec[] {
  return PROTOCOLS.filter((row) => row.security !== "cleartext");
}

/** Answers the badge tone of one protocol row (the pane chip derivation). */
export function protocolTone(spec: ProtocolSpec): BadgeTone {
  if (spec.security === "encrypted") return "success";
  if (spec.security === "opportunistic") return "info";
  return spec.state === "legacy" ? "default" : "warning";
}

/** Lists the family keywords the mesh carries (the pane section order). */
export function protocolGroups(): ProtocolGroup[] {
  const seen = new Set<ProtocolGroup>();
  for (const row of PROTOCOLS) seen.add(row.group);
  return [...seen];
}
