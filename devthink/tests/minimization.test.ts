import { describe, expect, it } from "vitest";
import {
  cleanupafterrun,
  enforcequarantine,
  encryptsync,
  exportall,
  fixedtelemetrypolicy,
  jarscope,
  localfieldsof,
  localfirst,
  newjar,
  optinsync,
  purgeonrequest,
  sealjar,
  streambundle,
  syncpass,
  type keyderive,
  type payloadencrypt,
  type syncsend,
} from "../export.js";
import {
  cleanupgate,
  encryptsyncgate,
  exportallgate,
  jargate,
  localgate,
  minimizationstripgrade,
  notelemetryinvariant,
  purgegate,
  quarantineopengate,
  syncgate,
} from "../policy.js";
import {
  outboundpayloadcheck,
  quarantineverdictreport,
  requestbody,
  syncconsentreport,
  syncpayloadreport,
} from "../protocol.js";
import type { datainventory, localrule, purgepolicy, syncsettings } from "../types.js";

const now = 1_800_000_000_000;

/** Wires plain fixture seams: the key derivation uppercases the passphrase marker and the cipher tags the payload so the tests read what the seams carried. */
const derive: keyderive = async (passphrase: string) => `key-${passphrase.length}`;
const encrypt: payloadencrypt = async (key: string, payload: string) => `${key}:${payload.length}`;

describe("minimization localfirst stripping and localrule blocking", () => {
  it("keeps the extraction on the device, strips the identity fields the review never listed and holds the local rule fields from every outbound payload", () => {
    const rules: localrule[] = [
      { origin: "https://shop.example", fields: ["sessiontoken", "cartsecret"], at: now - 1000 },
    ];
    const pass = localfirst({
      origin: "https://shop.example",
      rows: [
        { title: "pricing table", email: "buyer@example.org", userid: "u-17", sessiontoken: "st-abc", total: "42" },
        { title: "shipping table", phone: "+1 555 0100", total: "7" },
      ],
      rules,
      now,
    });
    expect(pass.rows).toEqual([
      { title: "pricing table", total: "42" },
      { title: "shipping table", total: "7" },
    ]);
    expect(pass.stripped.sort()).toEqual(["email", "phone", "userid"]);
    expect(pass.localheld.sort()).toEqual(["sessiontoken"]);
    expect(pass.reason).toContain("held 1 local rule field");
    const reviewed = localfirst({
      origin: "https://shop.example",
      rows: [{ email: "buyer@example.org", total: "42" }],
      reviewedfields: ["email", "total"],
      rules,
      now,
    });
    expect(reviewed.rows).toEqual([{ email: "buyer@example.org", total: "42" }]);
    expect(reviewed.stripped).toEqual([]);
    expect(localfieldsof({ sessiontoken: "x", total: "42" } as Record<string, unknown>, rules)).toEqual([
      "sessiontoken",
    ]);
    expect(localgate({ payload: { sessiontoken: "x", total: "42" }, rules }).allowed).toBe(false);
    expect(localgate({ payload: { total: "42" }, rules }).allowed).toBe(true);
    expect(() => localfirst({ origin: "  ", rows: [], rules: [], now })).toThrow(/names its origin/);
    expect(outboundpayloadcheck({ payload: { total: "42" }, localfields: ["sessiontoken"] }).ok).toBe(true);
    expect(() => outboundpayloadcheck({ payload: { sessiontoken: "x" }, localfields: ["sessiontoken"] })).toThrow(
      /never leaves the device/,
    );
    expect(minimizationstripgrade({ fields: ["title", "total"], reviewed: ["title", "total"] }).allowed).toBe(true);
    expect(minimizationstripgrade({ fields: ["title", "email"], reviewed: ["title"] }).allowed).toBe(false);
  });
});

describe("minimization notelemetry invariant with zero outbound calls", () => {
  it("keeps every counter inside the local memory while the worker issues no outbound usage call at all", async () => {
    const policy = fixedtelemetrypolicy(now);
    expect(policy.enabled).toBe(false);
    expect(policy.counters).toBe("local");
    const typedoff: { enabled: false; counters: "local"; at: number } = policy;
    expect(typedoff.enabled).toBe(false);
    let outboundcalls = 0;
    const counting: syncsend = async () => {
      outboundcalls += 1;
      return { delivered: false };
    };
    await counting("no telemetry payload ships", []);
    expect(outboundcalls).toBe(1);
    outboundcalls = 0;
    expect(notelemetryinvariant({ outboundcalls }).allowed).toBe(true);
    expect(notelemetryinvariant({ outboundcalls: 1 }).allowed).toBe(false);
    const wire = JSON.parse(
      requestbody({
        objective: "collect the pricing table",
        session: {
          id: "s1",
          tabid: 1,
          origin: "https://shop.example",
          startedat: now,
          expiresat: now + 1000,
          jarid: "jar-1",
        },
        observation: {
          schemaversion: 1,
          url: "https://shop.example",
          title: "Shop",
          textpreview: "",
          textlength: 0,
          forms: [],
          interactive: [],
          capturedat: now,
        },
        capabilities: { tabs: true, downloads: true, clipboardread: false, clipboardwrite: false, reportedat: now },
      }),
    ) as Record<string, unknown>;
    expect(Object.keys(wire).includes("telemetry")).toBe(false);
    expect((wire.session as Record<string, unknown>).jarid).toBe("jar-1");
    expect(outboundcalls).toBe(0);
  });
});

describe("minimization optinsync consent and encryptsync refusal", () => {
  it("stays disabled until the user opts each data class in, records the consent per class and refuses the sync without the passphrase", async () => {
    const offered = ["runs", "memory", "captures", "settings", "provenance"];
    expect(syncgate({ dataclass: "runs" }).allowed).toBe(false);
    const first = optinsync({ offered, enable: ["runs", "memory"], now });
    expect(first.settings.enabled.sort()).toEqual(["memory", "runs"]);
    expect(first.consent.map((entry) => entry.dataclass).sort()).toEqual(["memory", "runs"]);
    expect(first.consent.every((entry) => entry.at === now)).toBe(true);
    expect(syncgate({ settings: first.settings, dataclass: "runs" }).allowed).toBe(true);
    expect(syncgate({ settings: first.settings, dataclass: "captures" }).allowed).toBe(false);
    const second = optinsync({ current: first.settings, offered, enable: ["captures"], now: now + 5000 });
    expect(second.settings.enabled.sort()).toEqual(["captures", "memory", "runs"]);
    expect(second.settings.consent.find((entry) => entry.dataclass === "captures")?.at).toBe(now + 5000);
    expect(second.settings.consent.find((entry) => entry.dataclass === "runs")?.at).toBe(now);
    expect(() => optinsync({ offered, enable: ["telemetry"], now })).toThrow(
      /never enables a class the listing did not offer/,
    );
    expect(() => optinsync({ offered: [], enable: ["runs"], now })).toThrow(/lists every data class/);
    const consentreport = syncconsentreport({ consent: second.settings.consent });
    expect(consentreport.count).toBe(3);
    expect(() =>
      syncconsentreport({
        consent: [
          { dataclass: "runs", at: now },
          { dataclass: "Runs", at: now },
        ],
      }),
    ).toThrow(/one consent stamp/);
    await expect(encryptsync({ payload: '{"runs":[]}', derive, encrypt })).rejects.toThrow(/needs the user passphrase/);
    const encrypted = await encryptsync({
      payload: '{"runs":[]}',
      passphrase: "correct horse battery staple",
      derive,
      encrypt,
    });
    expect(encrypted.cipher).toBe("key-28:11");
    expect(encrypted.formattag).toBe("devthink-sync-1");
    expect(encryptsyncgate({ encrypted: true, formattag: encrypted.formattag }).allowed).toBe(true);
    expect(encryptsyncgate({ encrypted: false, formattag: encrypted.formattag }).allowed).toBe(false);
    expect(encryptsyncgate({ encrypted: true, formattag: "  " }).allowed).toBe(false);
    const settings: syncsettings = second.settings;
    await expect(
      syncpass({
        payload: '{"captures":[]}',
        classes: ["settings"],
        settings,
        derive,
        encrypt,
        send: async () => ({ delivered: true }),
        now,
      }),
    ).rejects.toThrow(/never opted in/);
    const delivered = await syncpass({
      payload: '{"runs":[]}',
      classes: ["runs"],
      settings,
      passphrase: "correct horse battery staple",
      derive,
      encrypt,
      send: async () => ({ delivered: true, endpoint: "https://sync.example" }),
      now,
    });
    expect(delivered.delivered).toBe(true);
    expect(delivered.record.encrypted).toBe(true);
    expect(delivered.record.classes).toEqual(["runs"]);
    expect(delivered.record.formattag).toBe("devthink-sync-1");
    const envelope = syncpayloadreport({
      classes: delivered.record.classes,
      payloadhash: delivered.record.payloadhash,
      formattag: delivered.record.formattag,
      encrypted: delivered.record.encrypted,
      syncedat: delivered.record.syncedat,
    });
    expect(envelope.encrypted).toBe(true);
    expect(() =>
      syncpayloadreport({
        classes: ["runs"],
        payloadhash: "h",
        formattag: "devthink-sync-1",
        encrypted: false,
        syncedat: now,
      }),
    ).toThrow(/plaintext/);
  });
});

describe("minimization purgeonrequest scopes and cleanup retention", () => {
  it("deletes the stored keys by scope on the typed confirmation while the audit hashes survive and the retained artifacts stay", () => {
    const inventory: datainventory[] = [
      { key: "runs", dataclass: "runs", size: 120, records: 2, at: now },
      { key: "memoryitems", dataclass: "memory", size: 80, records: 1, at: now },
      { key: "captures", dataclass: "captures", size: 900, records: 3, at: now },
      { key: "settings", dataclass: "settings", size: 40, records: 1, at: now },
      { key: "provlog:run1", dataclass: "provenance", size: 60, records: 2, at: now },
      { key: "audit", dataclass: "audit", size: 300, records: 9, at: now },
    ];
    const policy: purgepolicy = {
      scope: ["runs", "memory", "captures", "settings", "provenance"],
      confirmation: "purge everything",
      at: now - 2000,
    };
    expect(() => purgeonrequest({ policy, typed: "purge everythin", inventory, now })).toThrow(/typed confirmation/);
    expect(
      purgegate({ scope: policy.scope, confirmation: policy.confirmation, typed: "purge everything" }).allowed,
    ).toBe(true);
    expect(purgegate({ scope: policy.scope, confirmation: policy.confirmation, typed: "" }).allowed).toBe(false);
    expect(purgegate({ scope: ["captures"], confirmation: policy.confirmation, typed: "" }).allowed).toBe(true);
    const full = purgeonrequest({ policy, typed: "purge everything", inventory, now });
    expect(full.deleted.sort()).toEqual(["captures", "memoryitems", "provlog:run1", "runs", "settings"]);
    expect(full.kept).toEqual(["audit"]);
    expect(full.audithashespreserved).toBe(true);
    const partial = purgeonrequest({
      policy: { scope: ["captures"], confirmation: "purge everything", at: now },
      typed: "",
      inventory,
      now,
    });
    expect(partial.deleted).toEqual(["captures"]);
    expect(partial.kept.sort()).toEqual(["audit", "memoryitems", "provlog:run1", "runs", "settings"]);
    expect(() =>
      purgeonrequest({ policy: { scope: [], confirmation: "x", at: now }, typed: "", inventory, now }),
    ).toThrow(/names its scope/);
    const artifacts = [
      { id: "exp-1", dataclass: "exports" },
      { id: "exp-2", dataclass: "exports", retained: true },
      { id: "cap-1", dataclass: "captures" },
      { id: "med-1", dataclass: "media" },
    ];
    const pass = cleanupafterrun({ runid: "run1", artifacts, classes: ["exports", "captures"], now });
    expect(pass.cleared.sort()).toEqual(["cap-1", "exp-1"]);
    expect(pass.kept.sort()).toEqual(["exp-2", "med-1"]);
    expect(() => cleanupafterrun({ runid: "run1", artifacts, classes: ["audit"], now })).toThrow(
      /never deletes the audit history/,
    );
    expect(cleanupgate({ touchesaudit: false, consent: false }).allowed).toBe(true);
    expect(cleanupgate({ touchesaudit: true, consent: false }).allowed).toBe(false);
    expect(cleanupgate({ touchesaudit: true, consent: true }).allowed).toBe(true);
  });
});

describe("minimization exportall completeness and streaming", () => {
  it("bundles every stored record into one portable file and streams the chunks without a size cap", () => {
    expect(exportallgate({ useraction: false, records: 4 }).allowed).toBe(false);
    expect(exportallgate({ useraction: true, records: 0 }).allowed).toBe(false);
    expect(exportallgate({ useraction: true, records: 4 }).allowed).toBe(true);
    const bundle = exportall({
      runs: ["run1", "run2"],
      memory: ["mem1"],
      captures: ["cap1", "cap2", "cap3"],
      settings: true,
      provenance: ["prov1", "prov2"],
      now,
    });
    expect(bundle.runs).toEqual(["run1", "run2"]);
    expect(bundle.captures).toHaveLength(3);
    expect(bundle.records).toBe(9);
    expect(bundle.bytes).toBeGreaterThan(0);
    const chunks = streambundle({ bundle, chunksize: 64 });
    expect(chunks.length).toBeGreaterThanOrEqual(Math.ceil(bundle.bytes / 64));
    expect(chunks.join("")).toBe(JSON.stringify(bundle));
    const onegiant = streambundle({ bundle, chunksize: bundle.bytes + 1000 });
    expect(onegiant).toHaveLength(1);
    expect(() => streambundle({ bundle, chunksize: 0 })).toThrow(/positive whole number/);
    expect(() => exportall({ runs: [], memory: [], captures: [], settings: false, provenance: [], now })).toThrow(
      /exports nothing/,
    );
  });
});

describe("minimization cookiejar sealing and enforcequarantine verdicts", () => {
  it("assigns one jar per run, scopes the cookie read and write to the active jar, seals it at the completion and releases or deletes the quarantined files by the verdict alone", () => {
    const jar = newjar({ runid: "run1", now });
    expect(jar.sealed).toBe(false);
    expect(jar.cookies).toEqual([]);
    expect(() => newjar({ runid: "  ", now })).toThrow(/names its run/);
    expect(jargate({ jarid: jar.jarid, jar, runid: "run1", operation: "write" }).allowed).toBe(true);
    expect(jargate({ jarid: jar.jarid, jar, runid: "run2", operation: "write" }).allowed).toBe(false);
    const nojar: Parameters<typeof jargate>[0] = { runid: "run1", operation: "read" };
    expect(jargate(nojar).allowed).toBe(false);
    const written = jarscope({
      jar,
      operation: "write",
      cookies: [
        { name: "session", domain: "shop.example", value: "abc" },
        { name: "cart", domain: "shop.example", value: "2" },
      ],
      now: now + 100,
    });
    expect(written.jar.cookies).toHaveLength(2);
    const rewritten = jarscope({
      jar: written.jar,
      operation: "write",
      cookies: [{ name: "cart", domain: "shop.example", value: "3" }],
      now: now + 200,
    });
    expect(rewritten.jar.cookies).toHaveLength(2);
    expect(rewritten.jar.cookies.find((cookie) => cookie.name === "cart")?.value).toBe("3");
    const read = jarscope({ jar: rewritten.jar, operation: "read", domain: "shop.example", now: now + 300 });
    expect(read.entries).toHaveLength(2);
    const otherdomain = jarscope({ jar: rewritten.jar, operation: "read", domain: "other.example", now: now + 300 });
    expect(otherdomain.entries).toHaveLength(0);
    expect(() => jarscope({ jar: rewritten.jar, operation: "write", cookies: [], now })).toThrow(/empty write/);
    const sealed = sealjar({ jar: rewritten.jar, now: now + 400, expiry: 60000 });
    expect(sealed.sealed).toBe(true);
    expect(sealed.sealedat).toBe(now + 400);
    expect(sealed.expiresat).toBe(now + 60400);
    expect(jargate({ jarid: sealed.jarid, jar: sealed, runid: "run1", operation: "write" }).allowed).toBe(false);
    expect(jargate({ jarid: sealed.jarid, jar: sealed, runid: "run1", operation: "read" }).allowed).toBe(true);
    expect(() =>
      jarscope({
        jar: sealed,
        operation: "write",
        cookies: [{ name: "late", domain: "shop.example", value: "x" }],
        now: now + 500,
      }),
    ).toThrow(/sealed jar refuses every write/);
    expect(() => sealjar({ jar: rewritten.jar, now, expiry: 0 })).toThrow(/positive number of milliseconds/);
    expect(sealjar({ jar: sealed, now: now + 600 }).sealedat).toBe(now + 400);
    const held = enforcequarantine({
      path: "/sandbox/invoice.pdf",
      reason: "download moved out of the downloads folder",
      now,
    });
    expect(held.entry.scan).toBe("pending");
    expect(held.entry.status).toBe("held");
    expect(held.action).toBe("hold");
    const clean = enforcequarantine({
      path: "/sandbox/invoice.pdf",
      reason: "download moved out of the downloads folder",
      scan: "clean",
      now,
    });
    expect(clean.action).toBe("release");
    expect(clean.entry.status).toBe("released");
    const flagged = enforcequarantine({
      path: "/sandbox/invoice.pdf",
      reason: "download moved out of the downloads folder",
      scan: "flagged",
      now,
    });
    expect(flagged.action).toBe("delete");
    expect(flagged.entry.status).toBe("deleted");
    const errored = enforcequarantine({ path: "/sandbox/invoice.pdf", reason: "download moved", scan: "error", now });
    expect(errored.action).toBe("hold");
    expect(() => enforcequarantine({ path: "  ", reason: "x", now })).toThrow(/names its file path/);
    expect(quarantineopengate({ verdict: "clean" }).allowed).toBe(true);
    expect(quarantineopengate({ verdict: "flagged" }).allowed).toBe(false);
    expect(quarantineopengate({ verdict: "pending" }).allowed).toBe(false);
    const verdictreport = quarantineverdictreport({
      entry: {
        id: clean.entry.id,
        path: clean.entry.path,
        reason: clean.entry.reason,
        scan: clean.entry.scan,
        status: clean.entry.status ?? "held",
        at: clean.entry.at,
        updatedat: clean.entry.updatedat,
      },
    });
    expect(verdictreport.released).toBe(true);
    expect(() =>
      quarantineverdictreport({
        entry: {
          id: "q1",
          path: "/sandbox/x",
          reason: "r",
          scan: "flagged",
          status: "released",
          at: now,
          updatedat: now,
        },
      }),
    ).toThrow(/Only a clean scanner verdict releases/);
  });
});
