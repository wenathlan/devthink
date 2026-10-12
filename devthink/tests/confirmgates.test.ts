import { describe, expect, it } from "vitest";
import {
  credspayload,
  deletepayload,
  gateforstep,
  gatekindfor,
  gateprompttext,
  gatestateof,
  nobatchresolution,
  opengate,
  paypayload,
  resolvegate,
} from "../gates.js";

const now = 1_800_000_000_000;

describe("confirmgates", () => {
  it("maps the sensitive classes to their gated families", () => {
    expect(gatekindfor(["payment"])).toBe("confirmpay");
    expect(gatekindfor(["delete"])).toBe("confirmdelete");
    expect(gatekindfor(["credential"])).toBe("confirmcreds");
    expect(gatekindfor(["publish"])).toBeUndefined();
    expect(gatekindfor([])).toBeUndefined();
  });

  it("shows the amount, payee origin and target element on confirmpay gates", () => {
    const payload = paypayload({ amount: "49.90", payeeorigin: "https://shop.example", target: "#pay" });
    expect(payload).toEqual({ amount: "49.90", payeeorigin: "https://shop.example", target: "#pay" });
    const minimal = paypayload({ payeeorigin: "https://shop.example" });
    expect(minimal).toEqual({ payeeorigin: "https://shop.example" });
    const gate = opengate({
      kind: "confirmpay",
      stepid: "step",
      runid: "run",
      origin: "https://shop.example",
      payload,
      now,
    });
    expect(gate.state).toBe("open");
    expect(gateprompttext(gate)).toMatch(/49\.90/);
    expect(gateprompttext(gate)).toMatch(/https:\/\/shop\.example/);
    expect(gateprompttext(gate)).toMatch(/distinct human action/);
  });

  it("shows the target, scope and irreversibility on confirmdelete gates", () => {
    const gate = opengate({
      kind: "confirmdelete",
      stepid: "step",
      runid: "run",
      origin: "https://shop.example",
      payload: deletepayload({
        target: "#orders",
        scope: "the order history",
        irreversibility: "The deletion destroys the order history the site cannot restore.",
      }),
      now,
    });
    expect(gateprompttext(gate)).toMatch(/#orders/);
    expect(gateprompttext(gate)).toMatch(/order history/);
    expect(gateprompttext(gate)).toMatch(/cannot restore/);
  });

  it("shows the credential label only on confirmcreds gates and never the value", () => {
    const payload = credspayload("Bank login");
    expect(payload).toEqual({ label: "Bank login" });
    expect(() => credspayload(" ")).toThrow(/label/);
    const gate = opengate({
      kind: "confirmcreds",
      stepid: "step",
      runid: "run",
      origin: "https://bank.example",
      payload,
      now,
    });
    expect(gateprompttext(gate)).toMatch(/Bank login/);
    expect(gateprompttext(gate)).toMatch(/value stays behind the vault/);
    expect(gateprompttext(gate)).not.toMatch(/hunter2/);
  });

  it("resolves exactly one open gate through one explicit human action and stays terminal", () => {
    const gate = opengate({
      kind: "confirmpay",
      stepid: "step",
      runid: "run",
      origin: "https://shop.example",
      payload: paypayload({ payeeorigin: "https://shop.example" }),
      now,
    });
    const resolved = resolvegate({
      gates: [gate],
      gateid: gate.gateid,
      decision: "resolved",
      actor: "user",
      now: now + 1200,
    });
    expect(resolved.resolution?.decision).toBe("resolved");
    expect(resolved.resolution?.actor).toBe("user");
    const updated = resolved.gates?.[0];
    expect(updated?.state).toBe("resolved");
    expect(updated?.resolvedat).toBe(now + 1200);
    const again = resolvegate({
      gates: resolved.gates ?? [],
      gateid: gate.gateid,
      decision: "refused",
      actor: "user",
      now: now + 1500,
    });
    expect(again.resolution).toBeUndefined();
    expect(again.gates?.[0]?.state).toBe("resolved");
  });

  it("refuses resolutions without an acting user and batch approvals", () => {
    const gate = opengate({
      kind: "confirmdelete",
      stepid: "step",
      runid: "run",
      origin: "https://shop.example",
      payload: deletepayload({ scope: "history", irreversibility: "gone" }),
      now,
    });
    expect(() => resolvegate({ gates: [gate], gateid: gate.gateid, decision: "resolved", actor: "", now })).toThrow(
      /acting user/,
    );
    expect(nobatchresolution(["one"]).allowed).toBe(true);
    expect(nobatchresolution(["one", "two"]).allowed).toBe(false);
    expect(nobatchresolution(["one", "two"]).reason).toMatch(/no batch approval/);
    expect(nobatchresolution([]).allowed).toBe(false);
  });

  it("reads the gate state of one step: none, open, resolved or refused", () => {
    expect(gatestateof([], "step").state).toBe("none");
    const gate = opengate({
      kind: "confirmpay",
      stepid: "step",
      runid: "run",
      origin: "https://shop.example",
      payload: paypayload({ payeeorigin: "https://shop.example" }),
      now,
    });
    expect(gatestateof([gate], "step").state).toBe("open");
    const resolved = resolvegate({ gates: [gate], gateid: gate.gateid, decision: "refused", actor: "user", now });
    expect(gatestateof(resolved.gates ?? [], "step").state).toBe("refused");
    expect(gatestateof(resolved.gates ?? [], "other").state).toBe("none");
  });

  it("builds the gate of one gated step from its reviewed shape", () => {
    const paystep = {
      id: "pay",
      kind: "fillcard" as const,
      target: "#card",
      options: JSON.stringify({ amount: "12.00", payeeorigin: "https://shop.example" }),
    };
    const paygate = gateforstep({
      step: paystep,
      classes: ["payment"],
      runid: "run",
      origin: "https://shop.example",
      now,
    });
    expect(paygate?.kind).toBe("confirmpay");
    expect(paygate?.payload.amount).toBe("12.00");
    expect(paygate?.payload.payeeorigin).toBe("https://shop.example");
    const deletestep = { id: "del", kind: "discardtab" as const, target: "#orders" };
    const deletegate = gateforstep({
      step: deletestep,
      classes: ["delete"],
      runid: "run",
      origin: "https://shop.example",
      now,
    });
    expect(deletegate?.kind).toBe("confirmdelete");
    expect(deletegate?.payload.scope).toBe("https://shop.example");
    const credstep = { id: "cred", kind: "consentpassword" as const, target: "#login" };
    const credgate = gateforstep({
      step: credstep,
      classes: ["credential"],
      runid: "run",
      origin: "https://bank.example",
      credentiallabel: "Bank login",
      now,
    });
    expect(credgate?.payload).toEqual({ label: "Bank login" });
    expect(
      gateforstep({ step: credstep, classes: ["credential"], runid: "run", origin: "https://bank.example", now }),
    ).toBeUndefined();
    expect(
      gateforstep({ step: paystep, classes: ["publish"], runid: "run", origin: "https://shop.example", now }),
    ).toBeUndefined();
  });
});
