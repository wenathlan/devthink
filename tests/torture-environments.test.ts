import { describe, expect, it } from "vitest";
import { acceptrenderresult, nonceof, sandboxrenderof, stripscripts, rendermessage } from "../environments.js";

/**
 * Torture suite for the sandbox sanitizer of environments.ts.
 * Every payload here is an adversarial markup attack: reassembly, nesting,
 * case tricks, scheme smuggling, malformed bodies and pathological sizes.
 * The contract: no `<script` sequence and no `on...=` handler survives.
 */

const now = 1_000;

/** Asserts the sanitizer invariant over one payload: no script tag and no event handler remain. */
function inert(markup: string): void {
  const out = stripscripts(markup);
  expect(out.toLowerCase()).not.toContain("<script");
  expect(/\son[a-z]+\s*=/i.test(out)).toBe(false);
}

describe("torture: stripscripts reassembly and nesting attacks", () => {
  it("drops the split script tag payloads that reassemble after a naive replace", () => {
    inert("<scr<script>ipt>alert(1)</scr</script>ipt>");
    inert("<scri<script>pt>alert(2)</scri</script>pt>");
    inert("<scr\x00ipt>alert(3)</scr\x00ipt>");
    inert("<<script>alert(4)</script>");
    inert("<script<script>>alert(5)</script>");
    inert("<img src=x on<x>error=alert(6)>");
    inert("<a href=jav<x>ascript:alert(7)>x</a>");
  });

  it("drops script elements with their whole content through the first closing tag", () => {
    expect(stripscripts("<div>a</div><script>var x = '</div>';</script><div>b</div>")).toBe("<div>a</div><div>b</div>");
    expect(stripscripts("<script>deep(<script>nested()</script>)</script>ok")).toBe(")ok");
    expect(stripscripts("<script >alert(1)</script >tail")).toBe("tail");
    expect(stripscripts("<script src=x>fallback</script>kept")).toBe("kept");
    expect(stripscripts("<SCRIPT>alert(1)</SCRIPT>mixed")).toBe("mixed");
    expect(stripscripts("<script/>after")).toBe("after");
    expect(stripscripts("</script>orphan")).toBe("orphan");
    inert("<script>deep(<script>nested()</script>)</script>ok");
  });

  it("swallows the rest of the markup when a script element never closes", () => {
    expect(stripscripts("before<script>alert(1)")).toBe("before");
    expect(stripscripts("clean<script>forever")).toBe("clean");
  });

  it("drops a tag whose body carries another open angle so no reassembly survives", () => {
    inert("<a<b>c</a>");
    inert("<img<b>src=x>text");
    inert("<div<>x</div>");
    expect(stripscripts("<a<b>c</a>")).toBe("c</a>");
  });

  it("never emits an unterminated tag fragment", () => {
    expect(stripscripts("<p>ok</p")).toBe("<p>ok");
    expect(stripscripts("<img src=x")).toBe("");
    expect(stripscripts("text<script>unclosed")).toBe("text");
  });

  it("keeps well formed tags and their safe attributes exactly", () => {
    expect(stripscripts('<a href="https://example.com/page">link</a>')).toBe('<a href="https://example.com/page">link</a>');
    expect(stripscripts('<img src="/logo.png" alt="Logo" width="32" height="32">')).toBe('<img src="/logo.png" alt="Logo" width="32" height="32">');
    expect(stripscripts("<p>plain paragraph</p>")).toBe("<p>plain paragraph</p>");
    expect(stripscripts("<ul><li>one</li><li>two</li></ul>")).toBe("<ul><li>one</li><li>two</li></ul>");
  });
});

describe("torture: stripscripts event handler smuggling", () => {
  it("drops on handlers in every casing while whitespace split tokens stay inert", () => {
    expect(stripscripts('<div ONMOUSEOVER="x()">n</div>')).toBe("<div>n</div>");
    expect(stripscripts("<div OnClick='x()'>n</div>")).toBe("<div>n</div>");
    expect(stripscripts('<div onFocus="x()">n</div>')).toBe("<div>n</div>");
    expect(stripscripts("<div onCLICK='x()'>n</div>")).toBe("<div>n</div>");
    inert("<div On\tclick='x()'>n</div>");
    inert("<div on\nclick='x()'>n</div>");
    expect(stripscripts('<svg onload=alert(1)>x</svg>')).toBe("<svg>x</svg>");
    expect(stripscripts('<body onload="x()">n</body>')).toBe("<body>n</body>");
    inert("<iframe onload=alert(1) src=x>");
    inert("<object onerror=alert(1)>");
    inert('<details ontoggle=alert(1) open>x</details>');
    inert("<marquee onstart=alert(1)>x</marquee>");
    inert('<style onload="x()">p{}</style>');
    inert('<input onfocus=alert(1) autofocus>');
    inert('<form onsubmit=alert(1)><button>x</button></form>');
    inert("<video><source onerror=alert(1)></video>");
  });

  it("drops handlers hidden behind attribute value quoting tricks", () => {
    inert('<img src="x" onerror="alert(1)" alt="y">');
    inert("<img src='x' onerror='alert(1)'>");
    inert('<img src=x onerror=alert(1)>');
    inert('<a href="x" ONCLICK="a" onclick="b">t</a>');
    inert('<a href="x" \'onclick="b">t</a>');
  });

  it("keeps non handler attributes while everything that starts with on drops conservatively", () => {
    expect(stripscripts('<a data-once="kept">x</a>')).toBe('<a data-once="kept">x</a>');
    expect(stripscripts('<td colspan="2" headers="h">x</td>')).toBe('<td colspan="2" headers="h">x</td>');
    expect(stripscripts("<a onlyattr=plain>x</a>")).toBe("<a>x</a>");
    expect(stripscripts("<a one>x</a>")).toBe("<a>x</a>");
    expect(stripscripts('<a on="quoted">x</a>')).toBe('<a on="quoted">x</a>');
    inert('<a onlyattr=plain onclick=x()>x</a>');
  });
});

describe("torture: stripscripts scheme smuggling", () => {
  it("strips javascript, vbscript and data schemes from every attribute value", () => {
    expect(stripscripts('<a href="javascript:alert(1)">x</a>')).toBe('<a href="alert(1)">x</a>');
    expect(stripscripts("<a href=javascript:alert(2)>x</a>")).toBe('<a href="alert(2)">x</a>');
    expect(stripscripts('<a href="JAVASCRIPT:alert(3)">x</a>')).toBe('<a href="alert(3)">x</a>');
    expect(stripscripts("<a href='JaVaScRiPt:alert(4)'>x</a>")).toBe('<a href="alert(4)">x</a>');
    expect(stripscripts('<a href="vbscript:msgbox(1)">x</a>')).toBe('<a href="msgbox(1)">x</a>');
    inert('<iframe src="data:text/html,<script>alert(1)</script>">x</iframe>');
    expect(stripscripts('<a href="javajavascript:script:alert(5)">x</a>')).toBe('<a href="alert(5)">x</a>');
    inert('<a href=" javascript:alert(6)">x</a>');
    inert("<a href=\x00javascript:alert(7)>x</a>");
    inert('<a href="java\tscript:alert(8)">x</a>');
  });

  it("cleans scheme fragments repeated inside one value until none remain", () => {
    expect(stripscripts('<a href="data:data:image/png;base64,xx">x</a>')).toBe('<a href="image/png;base64,xx">x</a>');
    expect(stripscripts('<a href="vbscript:vbscript:run(1)">x</a>')).toBe('<a href="run(1)">x</a>');
  });
});

describe("torture: stripscripts pathological inputs", () => {
  it("stays linear and inert on a one megabyte payload of crafted tags", () => {
    const payload = "<scr<script>ipt>".repeat(40_000) + "tail";
    const started = performance.now();
    const out = stripscripts(payload);
    const elapsed = performance.now() - started;
    expect(out.toLowerCase()).not.toContain("<script");
    expect(elapsed).toBeLessThan(2_000);
  }, 10_000);

  it("handles markup with unicode, emoji, rtl text and control characters inertly", () => {
    inert("<p>こんにちは 🌍 שלום \x00\x01</p><script>alert(1)</script>");
    inert("<p>\u2028\u2029 line separators</p><script>alert(2)</script>");
    inert("<div>​零宽空格</div><svg onload=alert(3)>");
    const out = stripscripts("<p>안녕하세요</p>");
    expect(out).toBe("<p>안녕하세요</p>");
  });

  it("handles empty, whitespace and tag-only inputs without crashing", () => {
    expect(stripscripts("")).toBe("");
    expect(stripscripts("   ")).toBe("");
    expect(stripscripts("<")).toBe("");
    expect(stripscripts(">")).toBe(">");
    expect(stripscripts("<>")).toBe("<>");
    expect(stripscripts("<>>")).toBe("<>>");
    expect(stripscripts("<<<>>>")).toBe(">>");
    expect(stripscripts("plain text only")).toBe("plain text only");
  });

  it("passes comments and doctypes through because their bodies carry no open angle", () => {
    expect(stripscripts("<!-- a comment --><p>x</p>")).toBe("<!-- a comment --><p>x</p>");
    expect(stripscripts("<!DOCTYPE html><p>x</p>")).toBe("<!DOCTYPE html><p>x</p>");
  });

  it("treats deeply repeated angle noise inertly", () => {
    inert("<".repeat(5_000));
    inert(">".repeat(5_000));
    inert("<>".repeat(5_000));
    inert("<a".repeat(5_000));
  });
});

describe("torture: sandbox render descriptors and nonce discipline", () => {
  it("tolerates a blank render id while the meaningful fields stay validated", () => {
    expect(() => sandboxrenderof({ id: "", markup: "<p/>", sourceorigin: "https://example.com", stepid: "s1", now })).not.toThrow();
    expect(() => sandboxrenderof({ id: "r", markup: "", sourceorigin: "https://example.com", stepid: "s1", now })).toThrow();
    expect(() => sandboxrenderof({ id: "r", markup: "<p/>", sourceorigin: "", stepid: "s1", now })).toThrow();
    expect(() => sandboxrenderof({ id: "r", markup: "<p/>", sourceorigin: "https://example.com", stepid: "", now })).toThrow();
  });

  it("sanitizes the markup inside the render descriptor so the frame never sees a live script", () => {
    const render = sandboxrenderof({ id: "r1", markup: "<p>hello</p><script>alert(1)</script>", sourceorigin: "https://example.com", stepid: "s1", now });
    expect(render.markup).toBe("<p>hello</p>");
    const message = rendermessage(render);
    expect(message.markup.toLowerCase()).not.toContain("<script");
  });

  it("nonces differ for distinct seeds, repeat for the same seed and never leak the seed", () => {
    const one = nonceof("seed-a");
    expect(nonceof("seed-a")).toBe(one);
    expect(nonceof("seed-b")).not.toBe(one);
    expect(nonceof("")).toMatch(/^[a-z0-9]{16}$/);
    expect(nonceof("x".repeat(10_000))).toMatch(/^[a-z0-9]{16}$/);
    const unicode = nonceof("🔥".repeat(100));
    expect(unicode).toMatch(/^[a-z0-9]{16}$/);
    expect(one).not.toContain("seed");
  });

  it("rejects every replay, cross channel and malformed answer of the sandbox frame", () => {
    const render = sandboxrenderof({ id: "r1", markup: "<p>x</p>", sourceorigin: "https://example.com", stepid: "s1", now });
    const message = { channel: "devthinksandbox", type: "renderresult", nonce: render.nonce, ok: true, text: "ok", summary: "ok" } as const;
    const first = acceptrenderresult({ renders: [render], message, now: now + 1 });
    expect(first.accepted).toBe(true);
    expect(first.renders.find(entry => entry.nonce === render.nonce)?.answeredat).toBe(now + 1);
    const replay = acceptrenderresult({ renders: first.renders, message, now: now + 2 });
    expect(replay.accepted).toBe(false);
    expect(replay.reason).toMatch(/replayed or already answered/i);
    const unthreaded = acceptrenderresult({ renders: [render], message, now: now + 2 });
    expect(unthreaded.accepted).toBe(true);
    expect(acceptrenderresult({ renders: [], message, now: now + 1 }).accepted).toBe(false);
    expect(acceptrenderresult({ renders: [render], message: { ...message, nonce: "" }, now: now + 1 }).accepted).toBe(false);
    expect(acceptrenderresult({ renders: [render], message: { ...message, nonce: "deadbeefdeadbeef" }, now: now + 1 }).accepted).toBe(false);
    expect(acceptrenderresult({ renders: [render], message: { ...message, channel: "devthinkother" }, now: now + 1 }).accepted).toBe(false);
    expect(acceptrenderresult({ renders: [render], message: { ...message, type: "anything" }, now: now + 1 }).accepted).toBe(false);
    expect(acceptrenderresult({ renders: [render], message: { channel: "devthinksandbox", type: "renderresult", ok: true, text: "ok", summary: "ok" }, now: now + 1 }).accepted).toBe(false);
    const { nonce: _dropnonce, ...nononce } = message;
    expect(acceptrenderresult({ renders: [render], message: nononce, now: now + 1 }).accepted).toBe(false);
  });

  it("strips markup from the answer text so a result never reenters the dom", () => {
    const render = sandboxrenderof({ id: "r1", markup: "<p>x</p>", sourceorigin: "https://example.com", stepid: "s1", now });
    const answer = acceptrenderresult({ renders: [render], message: { channel: "devthinksandbox", type: "renderresult", nonce: render.nonce, ok: true, text: '<script>alert("evil")</script><b>bold</b> tail', summary: "s" }, now: now + 1 });
    expect(answer.accepted).toBe(true);
    expect(answer.result?.text).toBe('alert("evil")bold tail');
    expect(answer.result?.text.toLowerCase()).not.toContain("<script");
    expect(answer.result?.text.toLowerCase()).not.toContain("<b>");
  });
});
