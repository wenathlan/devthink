import { describe, expect, it } from "vitest";
import {
  defaultmaskshapes,
  fieldshapekind,
  maskexport,
  maskfield,
  maskformstate,
  maskmarker,
  maskobservation,
  maskrecord,
  maskstoredvalues,
  masktypedvalues,
  maskvalue,
  maskingfield,
  shapesof,
} from "../security.js";
import type { maskrule, observation, runsettings, toolstep } from "../types.js";

const shapes = [...defaultmaskshapes];

function observationfixture(): observation {
  return {
    schemaversion: 3,
    url: "https://example.com/login",
    title: "Login",
    textpreview: "Login",
    textlength: 5,
    forms: [
      { label: "User", type: "text", name: "username" },
      { label: "Password", type: "password", name: "password", options: ["hunter2"] },
    ],
    interactive: [],
    capturedat: 1_000,
  };
}

describe("maskinputs field shapes", () => {
  it("recognizes the documented password, token, card and secret field shapes", () => {
    expect(defaultmaskshapes).toEqual(["password", "token", "card", "secret"]);
    expect(fieldshapekind("userpassword")).toBe("password");
    expect(fieldshapekind("passwd")).toBe("password");
    expect(fieldshapekind("pwdconfirm")).toBe("password");
    expect(fieldshapekind("apitoken")).toBe("token");
    expect(fieldshapekind("apikey")).toBe("token");
    expect(fieldshapekind("authorization")).toBe("token");
    expect(fieldshapekind("cardnumber")).toBe("card");
    expect(fieldshapekind("cvv")).toBe("card");
    expect(fieldshapekind("clientsecret")).toBe("secret");
    expect(fieldshapekind("username")).toBeUndefined();
    expect(maskingfield("password", [])).toBe(true);
    expect(maskingfield("accountnumber", ["accountnumber"])).toBe(true);
    expect(maskingfield("accountnumber", [])).toBe(false);
  });

  it("masks one value behind the redaction marker while an empty value stays empty", () => {
    expect(maskmarker).toBe("[redacted]");
    expect(maskvalue("hunter2")).toBe("[redacted]");
    expect(maskvalue("")).toBe("");
    expect(maskfield({ name: "password", value: "hunter2", shapes })).toBe("[redacted]");
    expect(maskfield({ name: "username", value: "ada", shapes })).toBe("ada");
  });

  it("joins the documented families with the user shapes and the per origin mask rules", () => {
    const settings: runsettings = { maskshapes: ["AccountNumber"] };
    const rules: maskrule[] = [
      { id: "r1", shapes: ["iban"], createdat: 1 },
      { id: "r2", origin: "https://other.example", shapes: ["routing"], createdat: 1 },
    ];
    const effective = shapesof({ settings, rules, origin: "https://example.com" });
    expect(effective).toContain("password");
    expect(effective).toContain("accountnumber");
    expect(effective).toContain("iban");
    expect(effective).not.toContain("routing");
    const scoped = shapesof({ settings, rules, origin: "https://other.example" });
    expect(scoped).toContain("routing");
    expect(shapesof({ rules: [] })).toEqual([...defaultmaskshapes]);
  });
});

describe("maskinputs across record paths", () => {
  it("masks typed values and option payloads of steps before they reach the log writer", () => {
    const secret: toolstep = {
      id: "s1",
      kind: "type",
      target: "input[name=password]",
      value: "hunter2",
      summary: "Type the password.",
      risk: "sensitive",
      options: JSON.stringify({ password: "hunter2", note: "plain" }),
    };
    const masked = masktypedvalues({ step: secret, shapes });
    expect(masked.value).toBe("[redacted]");
    expect(JSON.parse(masked.options ?? "{}")).toEqual({ password: "[redacted]", note: "plain" });
    const plain: toolstep = {
      id: "s2",
      kind: "type",
      target: "input[name=nickname]",
      value: "ada",
      summary: "Type the nickname.",
      risk: "interaction",
    };
    const kept = masktypedvalues({ step: plain, shapes });
    expect(kept.value).toBe("ada");
    const malformed: toolstep = { ...plain, options: "{not json" };
    expect(masktypedvalues({ step: malformed, shapes }).options).toBe("{not json");
  });

  it("masks form state while keeping the field shapes in observation payloads", () => {
    const fields = [
      { name: "username", value: "ada", type: "text" },
      { name: "password", value: "hunter2", type: "password" },
    ];
    const masked = maskformstate(fields, shapes);
    expect(masked[0]).toEqual({ name: "username", value: "ada", type: "text" });
    expect(masked[1]?.value).toBe("[redacted]");
    expect(masked[1]?.name).toBe("password");
    const shot = maskobservation(observationfixture(), shapes);
    expect(shot.forms[0]?.options).toBeUndefined();
    expect(shot.forms[1]?.options).toEqual(["[redacted]"]);
    expect(shot.forms[1]?.name).toBe("password");
    expect(shot.forms[1]?.label).toBe("Password");
  });

  it("masks stored values and deep record payloads", () => {
    const stored = maskstoredvalues({ sessiontoken: "tok", theme: "dark" }, shapes);
    expect(stored.sessiontoken).toBe("[redacted]");
    expect(stored.theme).toBe("dark");
    const record = maskrecord(
      { password: "hunter2", nested: { cardnumber: "4242", note: "plain" }, count: 3, flags: [1, 2] },
      shapes,
    );
    expect(record.password).toBe("[redacted]");
    expect((record.nested as Record<string, unknown>).cardnumber).toBe("[redacted]");
    expect((record.nested as Record<string, unknown>).note).toBe("plain");
    expect(record.count).toBe(3);
  });

  it("excludes masked values from every export of the run record", () => {
    const runrecord = {
      stepid: "s1",
      summary: "The fill ran.",
      details: { password: "hunter2", username: "ada", fields: [{ name: "card", value: "4242424242424242" }] },
    };
    const exported = maskexport(runrecord, shapes) as typeof runrecord;
    expect(exported.details.password).toBe("[redacted]");
    expect(exported.details.username).toBe("ada");
    expect(exported.details.fields[0]?.name).toBe("card");
    expect(exported.details.fields[0]?.value).toBe("[redacted]");
  });
});
