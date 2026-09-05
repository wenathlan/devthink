import { describe, expect, it } from "vitest";
import { acceptrenderresult, nonceof, rendermessage, renderprovenance, sandboxrenderof, stripscripts } from "../environments.js";

const now = 1_000;

describe("sandbox frame", () => {
  it("strips scripts and event handlers from untrusted markup before render", () => {
    expect(stripscripts('<p>ok</p><script>alert(1)</script>')).toBe("<p>ok</p>");
    expect(stripscripts('<p onclick="alert(1)">ok</p>')).toBe("<p>ok</p>");
    expect(stripscripts("<p onclick='alert(1)'>ok</p>")).toBe("<p>ok</p>");
    expect(stripscripts('<div ONMOUSEOVER="x()">ok</div>')).toBe("<div>ok</div>");
    expect(stripscripts('<a href="javascript:alert(1)">link</a>')).toBe('<a href="alert(1)">link</a>');
    expect(stripscripts('<img src="x" onerror="alert(1)" alt="a">')).toBe('<img src="x" alt="a">');
    expect(stripscripts("<script src='https://evil.example/x.js'></script><b>bold</b>")).toBe("<b>bold</b>");
    expect(stripscripts("<script/>")).toBe("");
  });

  it("issues a per render nonce for every sandbox render message", () => {
    const one = nonceof("render:1:1000");
    const two = nonceof("render:2:1000");
    expect(one).toMatch(/^[a-z0-9]{16}$/);
    expect(two).toMatch(/^[a-z0-9]{16}$/);
    expect(one).not.toBe(two);
    expect(nonceof("render:1:1000")).toBe(one);
  });

  it("builds the sandbox render descriptor with its nonce, source origin and sanitized markup", () => {
    const render = sandboxrenderof({ id: "r1", markup: '<p>hello</p><script>alert(1)</script>', sourceorigin: "https://example.com", stepid: "s1", now });
    expect(render.nonce).toMatch(/^[a-z0-9]{16}$/);
    expect(render.markup).toBe("<p>hello</p>");
    expect(render.sourceorigin).toBe("https://example.com");
    expect(render.stepid).toBe("s1");
    expect(() => sandboxrenderof({ id: "r2", markup: " ", sourceorigin: "https://example.com", stepid: "s1", now })).toThrow(/markup/i);
    expect(() => sandboxrenderof({ id: "r3", markup: "<p/>", sourceorigin: " ", stepid: "s1", now })).toThrow(/source origin/i);
    expect(() => sandboxrenderof({ id: "r4", markup: "<p/>", sourceorigin: "https://example.com", stepid: " ", now })).toThrow(/step/i);
  });

  it("posts the render through the devthinksandbox channel and accepts the nonce checked answer", () => {
    const render = sandboxrenderof({ id: "r1", markup: "<p>hello</p>", sourceorigin: "https://example.com", stepid: "s1", now });
    const message = rendermessage(render);
    expect(message).toMatchObject({ channel: "devthinksandbox", type: "render", nonce: render.nonce, markup: "<p>hello</p>" });
    const accepted = acceptrenderresult({ renders: [render], message: { channel: "devthinksandbox", type: "renderresult", nonce: render.nonce, ok: true, text: "<p>hello</p> inert text", summary: "The frame answered." }, now: now + 10 });
    expect(accepted.accepted).toBe(true);
    expect(accepted.result?.text).toBe("hello inert text");
    expect(accepted.result?.nonce).toBe(render.nonce);
    expect(accepted.result?.summary).toBe("The frame answered.");
  });

  it("refuses stale, off channel, unknown nonce and replayed sandbox messages so a render result never reenters the dom outside the frame", () => {
    const render = sandboxrenderof({ id: "r1", markup: "<p>hello</p>", sourceorigin: "https://example.com", stepid: "s1", now });
    expect(acceptrenderresult({ renders: [render], message: { channel: "other", type: "renderresult", nonce: render.nonce }, now: now + 10 }).accepted).toBe(false);
    expect(acceptrenderresult({ renders: [render], message: { channel: "devthinksandbox", type: "other", nonce: render.nonce }, now: now + 10 }).accepted).toBe(false);
    expect(acceptrenderresult({ renders: [render], message: { channel: "devthinksandbox", type: "renderresult", nonce: "unknown000000000" }, now: now + 10 }).reason).toMatch(/no nonce of a known unanswered render/i);
    const early = acceptrenderresult({ renders: [render], message: { channel: "devthinksandbox", type: "renderresult", nonce: render.nonce, ok: true, text: "early", summary: "early" }, now: now - 10 });
    expect(early.accepted).toBe(false);
    const plain = acceptrenderresult({ renders: [render], message: { channel: "devthinksandbox", type: "renderresult", nonce: render.nonce, ok: true, text: "<b>bold</b>", summary: " " }, now: now + 10 });
    expect(plain.result?.text).toBe("bold");
    expect(plain.result?.summary).toMatch(/sandbox frame rendered/i);
    const replayed = acceptrenderresult({ renders: plain.renders, message: { channel: "devthinksandbox", type: "renderresult", nonce: render.nonce, ok: false, text: "", summary: "The render failed." }, now: now + 10 });
    expect(replayed.accepted).toBe(false);
    expect(replayed.reason).toMatch(/replayed or already answered/i);
    const second = sandboxrenderof({ id: "r2", markup: "<p>hello</p>", sourceorigin: "https://example.com", stepid: "s2", now: now + 1 });
    const failed = acceptrenderresult({ renders: [second], message: { channel: "devthinksandbox", type: "renderresult", nonce: second.nonce, ok: false, text: "", summary: "The render failed." }, now: now + 10 });
    expect(failed.result?.ok).toBe(false);
  });

  it("records the provenance of every sandbox render with its source origin and nonce", () => {
    const render = sandboxrenderof({ id: "r1", markup: "<p>hello</p>", sourceorigin: "https://example.com", stepid: "s1", now });
    expect(renderprovenance(render)).toEqual({ origin: "https://example.com", stepid: "s1", environment: "sandboxframe" });
  });
});
