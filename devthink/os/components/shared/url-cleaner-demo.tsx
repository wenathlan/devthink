"use client";

/* ==========================================================================
   UrlCleanerDemo — painel do módulo clean-url para o dono ver funcionando:
   cola uma URL suja → mostra a URL limpa animada + chips do que saiu
   (hash, index.html, barras duplas, trackers utm_, gclid, fbclid…), e
   limpa a barra real via history.replaceState. Em Settings do app devthink.
   ========================================================================== */

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Eraser, Radio, Wand2 } from "lucide-react";
import { cleanUrlDetailed, ensureCleanLocation, type CleanResult } from "../engine/clean-url";

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
    toast.success("URL limpa", {
      description:
        removedCount > 0
          ? `${removedCount} ${removedCount === 1 ? "token removido" : "tokens removidos"} — sem recarregar a página.`
          : "A URL já estava limpa.",
    });
  }

  function cleanBar() {
    const changed = ensureCleanLocation();
    setBarHref(window.location.pathname + window.location.search);
    toast[changed ? "success" : "info"](changed ? "Barra limpa agora" : "Barra já estava limpa", {
      description: changed ? "history.replaceState aplicado — sem hash, sem trackers." : window.location.pathname,
    });
  }

  const chips: Array<{ label: string; kind: "hash" | "tracker" | "index" | "slash" }> = [];
  if (result) {
    if (result.removed.hash) chips.push({ label: `hash ${result.removed.hash}`, kind: "hash" });
    result.removed.trackers.forEach((t) => chips.push({ label: `tracker ${t}`, kind: "tracker" }));
    if (result.removed.indexHtml) chips.push({ label: "index.html", kind: "index" });
    if (result.removed.doubleSlashes) chips.push({ label: "// duplicadas", kind: "slash" });
  }

  return (
    <section className="glass card" aria-labelledby="cleanurl-h">
      <h2 id="cleanurl-h" style={{ fontSize: "1.05rem", marginBottom: 4 }}>
        Clean URLs — módulo da barra limpa
      </h2>
      <p className="small" style={{ marginBottom: 14 }}>
        O OS roda o módulo <code>clean-url</code>: rotas em hash, <code>index.html</code>, barras duplicadas e trackers
        de campanha (<code>utm_*</code>, <code>gclid</code>, <code>fbclid</code>…) nunca aparecem na barra de endereço.
        A navegação interna é <code>setState</code> + <code>history.replaceState(&quot;/&quot;)</code>.
      </p>

      <div className="field">
        <label htmlFor="url-dirty-in">Cole uma URL suja (ou use o exemplo)</label>
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
          <Radio size={15} strokeWidth={1.8} /> Poluir URL de exemplo
        </button>
        <button type="button" className="btn small" onClick={clean} disabled={!dirty && !input.trim()}>
          <Wand2 size={15} strokeWidth={1.8} /> Assistir a limpeza
        </button>
        <button type="button" className="btn secondary small" onClick={cleanBar}>
          <Eraser size={15} strokeWidth={1.8} /> Limpar a barra atual
        </button>
      </div>

      {dirty ? (
        <p className={`url-out dirty url-flash`} aria-label="URL suja">
          {dirty}
        </p>
      ) : null}

      {result ? (
        <p className="url-out clean url-flash" style={{ marginTop: 10 }} aria-label="URL limpa">
          {result.url}
        </p>
      ) : null}

      <div className="diff-chips" aria-live="polite">
        {result ? (
          chips.length > 0 ? (
            chips.map((c, i) => (
              <span key={`${c.kind}-${i}`} className="badge error">
                − {c.label}
              </span>
            ))
          ) : (
            <span className="badge success">nada a remover</span>
          )
        ) : dirty ? (
          <span className="badge warning">aguardando limpeza…</span>
        ) : null}
      </div>

      <p className="tiny faint" style={{ marginTop: 14, marginBottom: 0 }}>
        Barra real agora: <code className="mono">{barHref ?? "/"}</code> — sempre <code>/</code>. Escutamos{" "}
        <code>hashchange</code> e <code>popstate</code> e limpamos na hora.
      </p>
    </section>
  );
}
