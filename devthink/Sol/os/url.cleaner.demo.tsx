/**
 * url.cleaner.demo.tsx — the panel of the clean-url module made visible:
 * paste a dirty url → shows the animated clean url + chips of what left
 * (hash, index.html, duplicated slashes, utm_/gclid/fbclid trackers…),
 * and cleans the real bar via history.replaceState. Lives in Settings of
 * the devthink view.
 */
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Eraser, Radio, Wand2 } from "lucide-react";
import { cleanUrlDetailed, ensureCleanLocation, type CleanResult } from "./clean.url";

const DIRTY_SAMPLE =
  "https://devthink.pro/settings?utm_source=newsletter&utm_campaign=launch&gclid=ABC123&fbclid=XY99&igshid=z9#/docs/index.html";

export function UrlCleanerDemo() {
  const [input, setInput] = useState("");
  const [dirty, setDirty] = useState<string | null>(null);
  const [result, setResult] = useState<CleanResult | null>(null);
  const [barHref, setBarHref] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") setBarHref(window.location.pathname + window.location.search);
  }, []);

  function poll() {
    const source = input.trim() || DIRTY_SAMPLE;
    setDirty(source);
    setResult(null);
    setInput(source);
  }

  function clean() {
    const source = dirty ?? input.trim();
    if (!source) return;
    const cleaned = cleanUrlDetailed(source);
    setDirty(source);
    setResult(cleaned);
    const removedCount =
      cleaned.removed.trackers.length + (cleaned.removed.hash ? 1 : 0) + (cleaned.removed.indexHtml ? 1 : 0);
    toast.success("URL cleaned", {
      description:
        removedCount > 0
          ? `${removedCount} ${removedCount === 1 ? "token removed" : "tokens removed"} — without reloading the page.`
          : "The URL was already clean.",
    });
  }

  function cleanBar() {
    const changed = ensureCleanLocation();
    setBarHref(window.location.pathname + window.location.search);
    toast[changed ? "success" : "info"](changed ? "Bar cleaned now" : "Bar was already clean", {
      description: changed ? "history.replaceState applied — no hash, no trackers." : window.location.pathname,
    });
  }

  const chips: Array<{ label: string; kind: "hash" | "tracker" | "index" | "slash" }> = [];
  if (result) {
    if (result.removed.hash) chips.push({ label: `hash ${result.removed.hash}`, kind: "hash" });
    result.removed.trackers.forEach((t) => {
      chips.push({ label: `tracker ${t}`, kind: "tracker" });
    });
    if (result.removed.indexHtml) chips.push({ label: "index.html", kind: "index" });
    if (result.removed.doubleSlashes) chips.push({ label: "duplicated //", kind: "slash" });
  }

  return (
    <section className="glass card" aria-labelledby="cleanurl-h">
      <h2 id="cleanurl-h" style={{ fontSize: "1.05rem", marginBottom: 4 }}>
        Clean URLs — the clean-bar module
      </h2>
      <p className="small" style={{ marginBottom: 14 }}>
        The OS runs the <code>clean-url</code> module: hash routes, <code>index.html</code>, duplicated slashes and
        campaign trackers (<code>utm_*</code>, <code>gclid</code>, <code>fbclid</code>…) never reach the address bar.
        Internal navigation is <code>setState</code> + <code>history.replaceState(&quot;/&quot;)</code>.
      </p>

      <div className="field">
        <label htmlFor="url-dirty-in">Paste a dirty URL (or use the sample)</label>
        <input
          id="url-dirty-in"
          className="input mono"
          value={input}
          placeholder={DIRTY_SAMPLE}
          spellCheck={false}
          autoComplete="off"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              poll();
            }
          }}
        />
      </div>

      <div className="row" style={{ marginBottom: 16 }}>
        <button type="button" className="btn secondary small" onClick={poll}>
          <Radio size={15} strokeWidth={1.8} /> Pollute the sample URL
        </button>
        <button type="button" className="btn small" onClick={clean} disabled={!dirty && !input.trim()}>
          <Wand2 size={15} strokeWidth={1.8} /> Watch the cleaning
        </button>
        <button type="button" className="btn secondary small" onClick={cleanBar}>
          <Eraser size={15} strokeWidth={1.8} /> Clean the current bar
        </button>
      </div>

      {dirty ? (
        <p className="url-out dirty url-flash">
          {dirty}
        </p>
      ) : null}

      {result ? (
        <p className="url-out clean url-flash" style={{ marginTop: 10 }}>
          {result.url}
        </p>
      ) : null}

      <div className="diff-chips" aria-live="polite">
        {result ? (
          chips.length > 0 ? (
            chips.map((c) => (
              <span key={`${c.kind}-${c.label}`} className="badge error">
                − {c.label}
              </span>
            ))
          ) : (
            <span className="badge success">nothing to remove</span>
          )
        ) : dirty ? (
          <span className="badge warning">waiting for the cleaning…</span>
        ) : null}
      </div>

      <p className="tiny faint" style={{ marginTop: 14, marginBottom: 0 }}>
        Real bar right now: <code className="mono">{barHref ?? "/"}</code> — always <code>/</code>. We listen to{" "}
        <code>hashchange</code> and <code>popstate</code> and clean it on the spot.
      </p>
    </section>
  );
}
