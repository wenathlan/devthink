// # binddraw — the drawn bind of the gateway transport (root layer, node
// builtins alone). The gateway ports law (the owner's rules, law 39:
// "Gateway proxy ports: host/porta sorteados, never localhost literal",
// beside the anti localhost law the feature corpus records — "random host
// octets, port drawn from the cryptographic band 30000 to 59999") forbids
// the gateway from ever binding a literal host or port: when the env pin
// (PORT, HOST) stays silent, the host and the port are DRAWN — the port
// inside the documented cryptographic band 30000..59999 (the saddle
// orchestrator grammar, crypto.randomInt(30000) + 30000), the host inside
// the loopback band 127.x.y.z with three drawn octets (binding outside
// 127.x.y.z fails on Windows, so the draw stays inside the loopback band).
// The draw happens once per boot and stays locked for the session — the
// ADR-007 reading of the same law (hosts and ports are drawn once and
// locked per session, never localhost). No literal fallback survives: the
// retired `|| 3001` and `"0.0.0.0"` bind defaults never answer again.

import { randomInt } from "node:crypto";

/** the documented cryptographic band the gateway port draws from (the
 * anti localhost law: the port is drawn from the cryptographic band
 * 30000 to 59999; the saddle orchestrator names the same band with
 * crypto.randomInt(30000) + 30000). */
export const gatewayportband = Object.freeze({ first: 30000, last: 59999 });

/** the loopback band the gateway host draws from (the anti localhost law:
 * random host octets inside 127.x.y.z — the first octet is the loopback
 * band itself, the three octets after it draw). */
export const gatewayhostband = Object.freeze({ prefix: "127", first: 1, last: 254 });

/** the drawn gateway port — one draw inside the documented cryptographic
 * band 30000..59999. Pure draw: the same call answers a different port
 * every boot and the boot locks it for the session. */
export function drawgatewayport(): number {
  return randomInt(30000) + 30000;
}

/** the drawn gateway host — 127.a.b.c with three drawn octets (the anti
 * localhost law: random host octets; the octets draw between 1 and 254 so
 * the network id 127.0.0.0 and the broadcast edge never answer). */
export function drawgatewayhost(): string {
  return `${gatewayhostband.prefix}.${randomInt(gatewayhostband.first, gatewayhostband.last + 1)}.${randomInt(
    gatewayhostband.first,
    gatewayhostband.last + 1,
  )}.${randomInt(gatewayhostband.first, gatewayhostband.last + 1)}`;
}

/** one resolved gateway bind: the host, the port and the honest flags of
 * what drew (the boot logs ride them). */
export interface gatewaybind {
  /** the hostname the gateway binds — the env pin or the drawn loopback */
  hostname: string;
  /** the port the gateway binds — the env pin or the drawn band port */
  port: number;
  /** true when no PORT env pin rode and the port drew from the band */
  portdrawn: boolean;
  /** true when no HOST env pin rode and the host drew from the loopback band */
  hostdrawn: boolean;
}

/**
 * Resolves one boot's gateway bind: the env pin rides when it carries a
 * positive finite integer port (and a non-empty host), otherwise the host
 * and the port draw — never a literal fallback (the gateway ports law:
 * host/porta sorteados, never localhost literal). The same resolver the
 * transport main and the console serve seat share, so no boot path of the
 * gateway lane can answer the retired literals again.
 *
 * @param portenv the PORT env value (undefined when the env stays silent).
 * @param hostenv the HOST env value (undefined when the env stays silent).
 * @returns the bind the gateway boots on, with the draw flags.
 */
export function resolvegatewaybind(portenv: string | undefined, hostenv: string | undefined): gatewaybind {
  const portnumber = Number(portenv);
  const portpinned = portenv !== undefined && portenv.trim() !== "" && Number.isFinite(portnumber) && portnumber > 0;
  const hostpinned = typeof hostenv === "string" && hostenv.trim() !== "";
  return {
    hostname: hostpinned ? (hostenv as string).trim() : drawgatewayhost(),
    port: portpinned ? portnumber : drawgatewayport(),
    portdrawn: !portpinned,
    hostdrawn: !hostpinned,
  };
}
