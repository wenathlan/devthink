import { mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { attachnativehost, companionhandshakeframe, crashnativehost, detachnativehost, installnativehost, hostmanifestdestination, nativedefaultstate, nativediagnostics, nativeframecheck, nativeframeof, nativeheartbeatframe, nativecallrecordof, nativecorrelationid, nativecallevent, nativedegradationof, nativeerrorof, nativefailureof, nativehostcapabilities, nativehostidplaceholder, nativehostinstallerversion, nativehostmanifesttemplate, nativeportliveness, nativeprotocolcompatible, nativeratecheck, nativesecretexclusion, nativesurfacecatalog, nativesurfacegrant, nativesurfaceresult, nativetransportenabled, nativechoices, negotiatenativecapabilities, parsecompanionhandshake, reattachnativehost, recordnativecall, redactnativeframe, uninstallnativehost } from "../bridge.js";
import { wsbridgeadvertiseframe, wsbridgebindcheck, wsbridgeenvelopeof, wsbridgeextensionconnect, wsbridgeframeauth, wsbridgeframecounted, wsbridgeframeof, wsbridgeidlesweep, wsbridgereport, wsbridgesessionstart } from "../bridge.js";
import { nativeescapehatchgate, nativeheadlessgate, nativeheartbeatintervalvalid, nativeidlewindowvalid, nativeinstallconsentgate, nativekillswitchgate, nativeratecapvalid, nativesensitiveapprovalgate, nativetransportconsentgate } from "../policy.js";
import type { nativecallrecord, nativehoststate, runsettings } from "../types.js";

const now = 1_800_000_000_000;
const hashof = (text: string): string => `hash(${text})`;
const installed: nativehoststate = { installed: true, hostname: "com.example.devthink", extensionid: "extensionid0000000000000000000", installerversion: nativehostinstallerversion, companionversion: "1.1.85", companionprotocol: "1", port: "attached", wsbridgeport: 49152, installedat: now - 5000, attachedat: now - 1000, updatedat: now - 1000, lasterrors: [] };
const settings: runsettings = { nativeinstallconsent: true, nativetransportconsent: true, nativecallclassconsents: ["read", "interaction"], nativesurfaceconsents: ["notification"], nativeidlewindow: 30_000, nativeheartbeatinterval: 5000, nativecallratelimit: 3, nativecallratewindow: 60_000 };

/** Spawns the fake host fixture with its knobs and returns the process handle with its frame reader. */
async function fakehost(...args: string[]): Promise<{ process: ReturnType<typeof spawn>; send: (frame: unknown) => void; read: () => Promise<Record<string, unknown>>; close: () => Promise<void> }> {
  const child = spawn(process.execPath, [join(import.meta.dirname, "fakehost.mjs"), ...args], { stdio: ["pipe", "pipe", "inherit"] });
  const chunks: Buffer[] = [];
  child.stdout.on("data", chunk => chunks.push(chunk));
  const send = (frame: unknown): void => {
    const payload = Buffer.from(JSON.stringify(frame), "utf8");
    const head = Buffer.alloc(4);
    head.writeUInt32LE(payload.length, 0);
    child.stdin.write(Buffer.concat([head, payload]));
  };
  const read = async (): Promise<Record<string, unknown>> => {
    for (let index = 0; index < 100; index += 1) {
      const buffer = Buffer.concat(chunks);
      if (buffer.length >= 4) {
        const length = buffer.readUInt32LE(0);
        if (buffer.length >= 4 + length) {
          const payload = buffer.subarray(4, 4 + length);
          chunks.splice(0, chunks.length, buffer.subarray(4 + length));
          return JSON.parse(payload.toString("utf8")) as Record<string, unknown>;
        }
      }
      await new Promise(resolve => setTimeout(resolve, 20));
    }
    throw new Error("The fake host never answered.");
  };
  return { process: child, send, read, close: async () => { child.stdin.end(); await new Promise(resolve => child.on("close", resolve)); } };
}

describe("native host manifest template and installer", () => {
  it("builds the host manifest template with the generated extension id placeholder", () => {
    const template = nativehostmanifesttemplate({ hostname: "com.example.devthink", companionpath: "/home/user/devthink/dist/companion.js" });
    expect(template.manifest.name).toBe("com.example.devthink");
    expect(template.manifest.type).toBe("stdio");
    expect(template.manifest.allowed_origins).toEqual([`chrome-extension://${nativehostidplaceholder}/`]);
    expect(template.text).toContain(nativehostidplaceholder);
    const filled = nativehostmanifesttemplate({ hostname: "com.example.devthink", companionpath: "/home/user/devthink/dist/companion.js", extensionid: "extensionid0000000000000000000" });
    expect(filled.manifest.allowed_origins).toEqual(["chrome-extension://extensionid0000000000000000000/"]);
    expect(() => nativehostmanifesttemplate({ hostname: "not a host", companionpath: "/x" })).toThrow();
    expect(() => nativehostmanifesttemplate({ hostname: "com.example.devthink", companionpath: " " })).toThrow();
  });

  it("computes the manifest destination inside the user profile and refuses system wide without the flag", () => {
    expect(hostmanifestdestination({ hostname: "com.example.devthink", profiledir: "/home/user/profile" })).toEqual({ path: "/home/user/profile/NativeMessagingHosts/com.example.devthink.json", systemwide: false });
    const refused = hostmanifestdestination({ hostname: "com.example.devthink" });
    expect(refused.refused).toMatch(/explicit flag/);
    expect(hostmanifestdestination({ hostname: "com.example.devthink", systemwide: true, platform: "linux" })).toEqual({ path: "/etc/opt/chrome/native-messaging-hosts/com.example.devthink.json", systemwide: true });
    expect(hostmanifestdestination({ hostname: "com.example.devthink", systemwide: true, platform: "macos" }).path).toContain("/Library/Google/Chrome/NativeMessagingHosts");
  });

  it("writes and removes the host manifest in a temp profile behind the install consent", async () => {
    const profiledir = await mkdtemp(join(tmpdir(), "devthink-native-"));
    const written: Record<string, string> = {};
    const directories: string[] = [];
    let removed = "";
    const install = await installnativehost({ profiledir, hostname: "com.example.devthink", extensionid: "extensionid0000000000000000000", companionpath: "/home/user/devthink/dist/companion.js", consent: false, now, io: { writefile: async (path, text) => { written[path] = text; }, mkdir: async dir => { directories.push(dir); } } });
    expect(install.refused).toMatch(/install consent gate/i);
    expect(install.state).toEqual(nativedefaultstate());
    const success = await installnativehost({ profiledir, hostname: "com.example.devthink", extensionid: "extensionid0000000000000000000", companionpath: "/home/user/devthink/dist/companion.js", consent: true, now, io: { writefile: async (path, text) => { written[path] = text; }, mkdir: async dir => { directories.push(dir); } } });
    expect(success.refused).toBeUndefined();
    expect(success.state.installed).toBe(true);
    expect(success.state.installerversion).toBe(nativehostinstallerversion);
    expect(success.state.port).toBe("detached");
    const manifestpath = join(profiledir, "NativeMessagingHosts", "com.example.devthink.json");
    expect(written[manifestpath]).toContain("chrome-extension://extensionid0000000000000000000/");
    expect(written[manifestpath]).not.toContain(nativehostidplaceholder);
    const both = await installnativehost({ profiledir, hostname: "com.example.devthink", extensionid: "x", companionpath: "/x", consent: true, now, systemwide: true, io: { writefile: async () => {}, mkdir: async () => {} } });
    expect(both.refused).toMatch(/never both at once/);
    const uninstall = await uninstallnativehost({ profiledir, hostname: "com.example.devthink", now: now + 1000, io: { exists: async path => path === manifestpath, removefile: async path => { removed = path; } } });
    expect(uninstall.removed).toBe(true);
    expect(removed).toBe(manifestpath);
    expect(uninstall.state).toEqual(nativedefaultstate());
    await rm(profiledir, { recursive: true, force: true });
  });

  it("installs and removes a real host manifest through the io seams of a temp profile", async () => {
    const profiledir = await mkdtemp(join(tmpdir(), "devthink-native-real-"));
    const install = await installnativehost({ profiledir, hostname: "com.example.devthink", extensionid: "extensionid0000000000000000000", companionpath: "/home/user/devthink/dist/companion.js", consent: true, now, io: { writefile: async (path, text) => { await writeFile(path, text, "utf8"); }, mkdir: async dir => { await (await import("node:fs/promises")).mkdir(dir, { recursive: true }); } } });
    expect(install.refused).toBeUndefined();
    const manifestpath = install.manifestpath;
    expect((await stat(manifestpath)).isFile()).toBe(true);
    const stored = JSON.parse(await readFile(manifestpath, "utf8")) as { name: string; allowed_origins: string[] };
    expect(stored.name).toBe("com.example.devthink");
    expect(stored.allowed_origins).toEqual(["chrome-extension://extensionid0000000000000000000/"]);
    const uninstall = await uninstallnativehost({ profiledir, hostname: "com.example.devthink", now: now + 1, io: { exists: async path => { try { await stat(path); return true; } catch { return false; } }, removefile: async path => { await rm(path, { force: true }); } } });
    expect(uninstall.removed).toBe(true);
    await expect(stat(manifestpath)).rejects.toThrow();
    await rm(profiledir, { recursive: true, force: true });
  });
});

describe("native consent gates", () => {
  it("explains the install scope before any host registration", () => {
    const refused = nativeinstallconsentgate({ consent: false, profiledir: "/home/user/profile", hostname: "com.example.devthink" });
    expect(refused.allowed).toBe(false);
    expect(refused.reason).toMatch(/scope/i);
    expect(nativeinstallconsentgate({ consent: true, profiledir: " ", hostname: "com.example.devthink" }).allowed).toBe(false);
    expect(nativeinstallconsentgate({ consent: true, profiledir: "/home/user/profile", hostname: " " }).allowed).toBe(false);
    expect(nativeinstallconsentgate({ consent: true, profiledir: "/home/user/profile", hostname: "com.example.devthink" }).allowed).toBe(true);
  });

  it("blocks native calls per class before the approval and widens no read grant", () => {
    const denied = nativetransportconsentgate({ consent: false, installed: true, callclass: "read" });
    expect(denied.allowed).toBe(false);
    expect(denied.reason).toMatch(/deny by default|disabled/i);
    const uninstalled = nativetransportconsentgate({ consent: true, installed: false, callclass: "read", classconsents: ["read"] });
    expect(uninstalled.allowed).toBe(false);
    expect(uninstalled.reason).toMatch(/uninstalled/i);
    const nowide = nativetransportconsentgate({ consent: true, installed: true, callclass: "sensitive", classconsents: ["read"] });
    expect(nowide.allowed).toBe(false);
    expect(nowide.reason).toMatch(/never widens a read grant/);
    const granted = nativetransportconsentgate({ consent: true, installed: true, callclass: "interaction", classconsents: ["read", "interaction"] });
    expect(granted.allowed).toBe(true);
    const stopped = nativetransportconsentgate({ consent: true, installed: true, callclass: "read", classconsents: ["read"], killswitch: true });
    expect(stopped.allowed).toBe(false);
    expect(stopped.reason).toMatch(/kill switch/i);
  });

  it("routes the sensitive native calls through the human approval gate", () => {
    expect(nativesensitiveapprovalgate({ callclass: "read" }).allowed).toBe(true);
    expect(nativesensitiveapprovalgate({ callclass: "sensitive" }).allowed).toBe(false);
    expect(nativesensitiveapprovalgate({ callclass: "sensitive", approval: true }).allowed).toBe(true);
  });

  it("keeps the native transport disabled in headless mode without a configured host", () => {
    expect(nativeheadlessgate({ headless: true, hostconfigured: false }).allowed).toBe(false);
    expect(nativeheadlessgate({ headless: true, hostconfigured: true }).allowed).toBe(true);
    expect(nativeheadlessgate({ headless: false, hostconfigured: false }).allowed).toBe(true);
  });

  it("validates the user configured windows and caps with no code default", () => {
    expect(nativeidlewindowvalid(undefined).allowed).toBe(true);
    expect(nativeidlewindowvalid(0).allowed).toBe(false);
    expect(nativeidlewindowvalid(30_000).allowed).toBe(true);
    expect(nativeheartbeatintervalvalid(-1).allowed).toBe(false);
    expect(nativeheartbeatintervalvalid(5000).allowed).toBe(true);
    expect(nativeratecapvalid(0).allowed).toBe(false);
    expect(nativeratecapvalid(1.5).allowed).toBe(false);
    expect(nativeratecapvalid(3).allowed).toBe(true);
  });
});

describe("native host port lifecycle against a fake host process", () => {
  it("handshakes the fake host over the length prefixed wire and attaches the port", async () => {
    const host = await fakehost("--build", "fixture-1.1.85", "--protocol", "1", "--port", "49152");
    const correlationid = nativecorrelationid("ext", 1);
    host.send(companionhandshakeframe(correlationid));
    let answer = await host.read();
    while (answer.kind !== "handshake") answer = await host.read();
    const parsed = parsecompanionhandshake({ kind: answer.kind as "handshake", correlationid: String(answer.correlationid), ...(answer.body !== undefined ? { body: answer.body as Record<string, unknown> } : {}) }, now);
    expect(parsed.handshake).toMatchObject({ build: "fixture-1.1.85", protocol: "1", wsbridgeport: 49152 });
    const attached = attachnativehost(nativedefaultstate(), parsed.handshake!, now);
    expect(attached.port).toBe("attached");
    expect(attached.companionversion).toBe("fixture-1.1.85");
    expect(attached.wsbridgeport).toBe(49152);
    host.send(nativeheartbeatframe(correlationid, now));
    let heartbeat = await host.read();
    while (heartbeat.kind !== "heartbeat") heartbeat = await host.read();
    expect(heartbeat.kind).toBe("heartbeat");
    await host.close();
  });

  it("negotiates versions with the companion and reports the mismatch of another major version", () => {
    const agreed = negotiatenativecapabilities({ ours: nativehostcapabilities(), theirs: { protocol: "1.1.85", surfaces: ["osdialog", "notification"], heartbeat: true } });
    expect(agreed.ok).toBe(true);
    expect(agreed.protocol).toBe(1);
    expect(agreed.surfaces).toEqual(["osdialog", "notification"]);
    expect(agreed.heartbeat).toBe(true);
    const mismatch = negotiatenativecapabilities({ ours: nativehostcapabilities(), theirs: { protocol: 2, surfaces: ["notification"], heartbeat: true } });
    expect(mismatch.ok).toBe(false);
    expect(mismatch.reason).toMatch(/one major version/);
    expect(nativeprotocolcompatible("1.1.85", "1.0.0").ok).toBe(true);
    expect(nativeprotocolcompatible("1.1.85", "2.0.0").ok).toBe(false);
  });

  it("crashes, reattaches and degrades while the run stays alive", () => {
    const crashed = crashnativehost(installed, now + 1000);
    expect(crashed.port).toBe("crashed");
    expect(crashed.lasterrors?.[0]).toMatchObject({ family: "port", retry: "reconnect" });
    const reattached = reattachnativehost(crashed, { build: "1.1.85", protocol: "1", surfaces: ["osdialog", "notification"], wsbridgeport: 49153 }, now + 2000);
    expect(reattached.port).toBe("attached");
    expect(reattached.wsbridgeport).toBe(49153);
    expect(detachnativehost(reattached, now + 3000).port).toBe("detached");
    const absent = nativedegradationof({ state: nativedefaultstate() });
    expect(absent.degraded).toBe(true);
    expect(absent.reason).toMatch(/absent/i);
    const outdated = nativedegradationof({ state: installed, negotiated: { ok: false, reason: "The companion speaks the native bridge protocol major version 2." } });
    expect(outdated.degraded).toBe(true);
    expect(outdated.reason).toMatch(/major version 2/);
    expect(nativedegradationof({ state: installed }).degraded).toBe(false);
  });

  it("detects the host liveness from the heartbeat frames under the user configured interval", () => {
    expect(nativeportliveness({ now, interval: 5000 }).alive).toBe(false);
    expect(nativeportliveness({ now }).alive).toBe(true);
    expect(nativeportliveness({ lastheartbeatat: now - 1000, now, interval: 5000 }).alive).toBe(true);
    const silent = nativeportliveness({ lastheartbeatat: now - 6000, now, interval: 5000 });
    expect(silent.alive).toBe(false);
    expect(silent.reason).toMatch(/silent/);
    const frame = nativeheartbeatframe(nativecorrelationid("ext", 1), now);
    expect(frame.kind).toBe("heartbeat");
    expect(frame.body).toEqual({ at: now });
  });
});

describe("native frames, secrets and correlation", () => {
  it("validates every incoming frame through the origin and session checks", () => {
    const sessionid = "sess-1";
    expect(nativeframecheck(nativeframeof("event", nativecorrelationid("ext", 1), {}, sessionid), sessionid).allowed).toBe(true);
    expect(nativeframecheck({ kind: "event", correlationid: " " }, sessionid).allowed).toBe(false);
    expect(nativeframecheck(nativeframeof("event", "run-x-1", {}, "sess-2"), sessionid).allowed).toBe(false);
    expect(nativeframecheck(nativeframeof("event", "run-x-1"), " ").allowed).toBe(false);
  });

  it("stamps the correlation ids across one run", () => {
    expect(nativecorrelationid("ext", 1)).toBe("run-ext-1");
    expect(nativecorrelationid("ext", 2)).toBe("run-ext-2");
    expect(() => nativecorrelationid(" ", 1)).toThrow();
    expect(() => nativecorrelationid("ext", 0)).toThrow();
  });

  it("keeps key vault material out of the native frames and the logs", () => {
    const frame = nativeframeof("call", "run-ext-1", { apikey: "material", token: "material", surface: "osdialog" });
    const excluded = nativesecretexclusion(frame);
    expect(excluded.ok).toBe(false);
    expect(excluded.held).toEqual(["apikey", "token"]);
    const redacted = redactnativeframe(frame);
    expect(redacted.body).toEqual({ surface: "osdialog" });
    expect(nativesecretexclusion(nativeframeof("call", "run-ext-1", { surface: "notification", text: "done" })).ok).toBe(true);
  });

  it("maps native failures to structured errors with retry hints", () => {
    const error = nativeerrorof("handshake", "The companion never answered.", "reconnect", now);
    expect(nativefailureof(error)).toEqual({ retryhint: "retry", reason: "handshake failure: The companion never answered." });
    expect(nativefailureof(nativeerrorof("installer", "The profile directory refused.", "reinstall", now)).retryhint).toBe("wait");
    expect(nativefailureof(nativeerrorof("surface", "No consent grant.", "none", now)).retryhint).toBe("none");
  });
});

describe("native audit trail and rate caps", () => {
  it("records every native call with class and outcome", () => {
    const first = nativecallrecordof({ id: "n1", correlationid: "run-ext-1", surface: "notification", callclass: "interaction", outcome: "ok", now });
    const refused = nativecallrecordof({ id: "n2", correlationid: "run-ext-1", surface: "osdialog", callclass: "sensitive", outcome: "refused", reason: "The gates held.", now: now + 1 });
    const failed = nativecallrecordof({ id: "n3", correlationid: "run-ext-2", surface: "notification", callclass: "interaction", outcome: "error", reason: "The port stayed detached.", now: now + 2 });
    let records = recordnativecall([], first);
    records = recordnativecall(records, refused);
    records = recordnativecall(records, failed);
    expect(records.map(record => record.outcome)).toEqual(["error", "refused", "ok"]);
    expect(records[1]?.reason).toMatch(/gates held/);
    const replaced = recordnativecall(records, nativecallrecordof({ id: "n3", correlationid: "run-ext-2", surface: "notification", callclass: "interaction", outcome: "ok", now: now + 3 }));
    expect(replaced).toHaveLength(3);
    expect(replaced[0]?.outcome).toBe("ok");
    const event = nativecallevent(failed);
    expect(event.method).toBe("native/call");
    expect(event.params).toMatchObject({ surface: "notification", callclass: "interaction", outcome: "error", correlationid: "run-ext-2" });
    expect(JSON.stringify(event.params)).not.toContain("reason");
  });

  it("caps the native calls per session inside the user configured window", () => {
    const calls: nativecallrecord[] = [
      nativecallrecordof({ id: "n1", correlationid: "run-ext-1", surface: "notification", callclass: "interaction", outcome: "ok", now: now - 90_000 }),
      nativecallrecordof({ id: "n2", correlationid: "run-ext-1", surface: "notification", callclass: "interaction", outcome: "ok", now: now - 30_000 }),
      nativecallrecordof({ id: "n3", correlationid: "run-ext-1", surface: "notification", callclass: "interaction", outcome: "ok", now: now - 10_000 }),
      nativecallrecordof({ id: "n4", correlationid: "run-ext-1", surface: "notification", callclass: "interaction", outcome: "ok", now: now - 5000 })
    ];
    expect(nativeratecheck({ calls, now })).toEqual({ allowed: true, used: 4 });
    const capped = nativeratecheck({ calls, cap: 3, window: 60_000, now });
    expect(capped.allowed).toBe(false);
    expect(capped.used).toBe(3);
    expect(capped.reason).toMatch(/call cap/);
    const fresh = nativeratecheck({ calls, cap: 3, window: 60_000, now: now + 120_000 });
    expect(fresh.allowed).toBe(true);
    expect(fresh.used).toBe(0);
    expect(nativeratecheck({ calls, cap: 0, now }).allowed).toBe(false);
  });

  it("stops in flight native calls through the kill switch and the escape hatch", () => {
    expect(nativekillswitchgate({ engaged: true, operation: "native surface call" }).allowed).toBe(false);
    expect(nativekillswitchgate({ engaged: false, operation: "native surface call" }).allowed).toBe(true);
    const escape = nativeescapehatchgate({ pressed: true, inflight: 2 });
    expect(escape.allowed).toBe(false);
    expect(escape.reason).toMatch(/2 in flight calls halted/);
    expect(nativeescapehatchgate({ pressed: false, inflight: 2 }).allowed).toBe(true);
  });
});

describe("native surfaces and diagnostics", () => {
  it("enumerates the native surfaces through the capability negotiation", () => {
    const catalog = nativesurfacecatalog();
    expect(catalog.map(entry => entry.surface)).toEqual(["osdialog", "notification"]);
    expect(catalog.map(entry => entry.callclass)).toEqual(["sensitive", "interaction"]);
    const negotiation = negotiatenativecapabilities({ ours: nativehostcapabilities(), theirs: { protocol: 1, surfaces: ["notification"], heartbeat: false } });
    expect(negotiation.surfaces).toEqual(["notification"]);
    expect(negotiation.heartbeat).toBe(false);
  });

  it("refuses the surface execution without an active consent grant and shapes the structured results", () => {
    expect(nativesurfacegrant("osdialog", settings).allowed).toBe(false);
    expect(nativesurfacegrant("notification", settings).allowed).toBe(true);
    expect(nativesurfacegrant("unknown", settings).allowed).toBe(false);
    expect(nativesurfacegrant("notification", {}).allowed).toBe(false);
    const result = nativesurfaceresult({ surface: "notification", callclass: "read", details: { title: "done", apikey: "material" }, now });
    expect(result.callclass).toBe("interaction");
    expect(result.details).toEqual({ title: "done" });
  });

  it("reports the port state, the versions and the last errors through the diagnostics", () => {
    const report = nativediagnostics({ state: { ...installed, port: "crashed", lasterrors: [nativeerrorof("port", "The companion crashed.", "reconnect", now)] }, settings, sessions: [], now });
    expect(report.installed).toBe(true);
    expect(report.port).toBe("crashed");
    expect(report.companionversion).toBe("1.1.85");
    expect(report.installerversion).toBe(nativehostinstallerversion);
    expect(report.nativebridgeprotocol).toBe(1);
    expect(report.transportconsent).toBe(true);
    expect(report.classconsents).toEqual(["read", "interaction"]);
    expect(report.surfaceconsents).toEqual(["notification"]);
    expect(report.lasterrors).toHaveLength(1);
    const clean = nativediagnostics({ state: undefined, now });
    expect(clean.installed).toBe(false);
    expect(clean.degraded.degraded).toBe(true);
  });

  it("keeps the deny by default posture and reads the choices from the settings", () => {
    expect(nativetransportenabled(undefined, settings)).toBe(false);
    expect(nativetransportenabled(installed, {})).toBe(false);
    expect(nativetransportenabled(installed, settings)).toBe(true);
    expect(nativechoices(settings)).toMatchObject({ nativeinstallconsent: true, nativetransportconsent: true, nativecallratelimit: 3 });
    expect(nativechoices(undefined)).toEqual({});
  });
});

describe("wsbridge sessions", () => {
  it("refuses every bind outside localhost", () => {
    expect(wsbridgebindcheck({ bind: "127.0.0.1", port: 0 })).toMatchObject({ ok: true, bind: "127.0.0.1", port: 0 });
    expect(wsbridgebindcheck({ bind: "localhost" }).ok).toBe(true);
    expect(wsbridgebindcheck({ bind: "::1" }).ok).toBe(true);
    expect(wsbridgebindcheck({ bind: "" })).toMatchObject({ ok: true, bind: "127.0.0.1" });
    const remote = wsbridgebindcheck({ bind: "0.0.0.0" });
    expect(remote.ok).toBe(false);
    expect(remote.reason).toMatch(/other machines/);
    expect(wsbridgebindcheck({ bind: "192.168.1.10" }).ok).toBe(false);
    expect(wsbridgebindcheck({ bind: "127.0.0.1", port: 70000 }).ok).toBe(false);
  });

  it("authenticates the frames with the per session token and expires the idle sessions", () => {
    const session = wsbridgesessionstart({ port: 49152, now, token: "session-token", hashof });
    expect(session.tokenhash).toBe("hash(session-token)");
    expect(session.extensionconnected).toBe(false);
    expect(wsbridgeframeauth(session, "session-token", hashof).ok).toBe(true);
    const wrong = wsbridgeframeauth(session, "wrong", hashof);
    expect(wrong.ok).toBe(false);
    expect(wrong.reason).toMatch(/authentication/);
    expect(wsbridgeframeauth(session, "", hashof).ok).toBe(false);
    const idle = wsbridgesessionstart({ port: 49152, now, token: "session-token", hashof, idlewindow: 1000 });
    expect(idle.expiresat).toBe(now + 1000);
    expect(wsbridgeidlesweep(idle, now + 1500).expired).toBe(true);
    expect(wsbridgeidlesweep(idle, now + 500).expired).toBe(false);
    const withoutwindow = wsbridgesessionstart({ port: 49152, now, token: "session-token", hashof });
    expect(wsbridgeidlesweep(withoutwindow, now + 10_000_000).expired).toBe(false);
    const counted = wsbridgeframecounted(idle, "received", now + 900);
    expect(wsbridgeidlesweep(counted, now + 1800).expired).toBe(false);
    expect(wsbridgeidlesweep(counted, now + 2000).expired).toBe(true);
  });

  it("holds one extension connection at a time and reports the session without the token", () => {
    const session = wsbridgesessionstart({ port: 49152, now, token: "session-token", hashof, idlewindow: 5000 });
    const first = wsbridgeextensionconnect(session, now + 1);
    expect(first.session?.extensionconnected).toBe(true);
    expect(first.session?.connections).toBe(1);
    const second = wsbridgeextensionconnect(first.session!, now + 2);
    expect(second.refused).toMatch(/one extension connection at a time/);
    expect(second.session).toBeUndefined();
    const report = wsbridgereport(first.session!, now + 3);
    expect(report).toMatchObject({ port: 49152, extensionconnected: true, expired: false });
    expect(JSON.stringify(report)).not.toContain("session-token");
    expect(JSON.stringify(report)).not.toContain("tokenhash");
  });

  it("wraps the native frames into the servercontract envelopes and advertises the port and token over the native port", () => {
    const session = wsbridgesessionstart({ port: 49152, now, token: "session-token", hashof });
    const correlationid = nativecorrelationid("ext", 1);
    const frame = nativeframeof("event", correlationid, { surface: "notification" }, "sess-1");
    const envelope = wsbridgeenvelopeof({ opid: "op-ext-1", at: now, frame, sessionid: "sess-1", token: "session-token" });
    expect(envelope.op).toBe("eventpost");
    expect(envelope.version).toBe(1);
    expect(envelope.sessionid).toBe("sess-1");
    const unwrapped = wsbridgeframeof(envelope);
    expect(unwrapped.frame).toEqual(frame);
    expect(wsbridgeframeof({ op: "sessioncreate" }).reason).toMatch(/eventpost/);
    expect(wsbridgeframeof({ op: "eventpost", body: { stream: "other", payload: { frame } } }).reason).toMatch(/nativetransport/);
    expect(wsbridgeframeof({ op: "eventpost", body: { stream: "nativetransport", payload: {} } }).reason).toMatch(/frame key/);
    const advertisement = wsbridgeadvertiseframe(session, "session-token", correlationid);
    expect(advertisement.kind).toBe("advertisement");
    expect(advertisement.body).toMatchObject({ port: session.port, token: "session-token" });
    expect(() => wsbridgeadvertiseframe(session, " ", correlationid)).toThrow();
  });
});

describe("native bridge smoke against the fake host process", () => {
  it("runs the handshake, the surface call and the refusal path against the fake host", async () => {
    const host = await fakehost("--build", "fixture-1.1.85", "--protocol", "1", "--port", "0");
    const correlationid = nativecorrelationid("ext", 1);
    host.send(companionhandshakeframe(correlationid));
    const handshake = await host.read();
    expect(handshake.kind).toBe("handshake");
    host.send({ kind: "call", correlationid, body: { surface: "osdialog", classconsent: true, surfaceconsent: true } });
    const call = await host.read();
    expect(call.body).toMatchObject({ surface: "osdialog", delivered: true });
    host.send({ kind: "call", correlationid, body: { surface: "osdialog" } });
    const refusal = await host.read();
    expect(refusal.kind).toBe("error");
    expect((refusal.body as { message?: string }).message).toMatch(/consent grant/);
    await host.close();
  });

  it("refuses the outdated host handshake of another protocol major version", async () => {
    const host = await fakehost("--build", "fixture-2.0.0", "--protocol", "2");
    host.send(companionhandshakeframe(nativecorrelationid("ext", 1)));
    const answer = await host.read();
    const parsed = parsecompanionhandshake({ kind: answer.kind as "handshake", correlationid: String(answer.correlationid), ...(answer.body !== undefined ? { body: answer.body as Record<string, unknown> } : {}) }, now);
    const negotiation = negotiatenativecapabilities({ ours: nativehostcapabilities(), theirs: { protocol: parsed.handshake?.protocol ?? "2", surfaces: parsed.handshake?.surfaces ?? [], heartbeat: true } });
    expect(negotiation.ok).toBe(false);
    expect(negotiation.reason).toMatch(/one major version/);
    expect(nativedegradationof({ state: installed, negotiated: negotiation }).degraded).toBe(true);
    await host.close();
  });
});
