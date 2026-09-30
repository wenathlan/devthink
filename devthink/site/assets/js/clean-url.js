/* ==========================================================================
   DEVTHINK CLEAN-URL MODULE — barra de URL sempre limpa
   Fonte: regra do dono (nda): nenhuma hashtag de rota (#/settings), nenhum
   lixo de redirecionamento (utm_*, gclid, fbclid, index.html, ;;) visível.
   Zero dependência. Vendor junto do engine.css em <app>/site/assets/js/.
   API global: window.DTURL
   ========================================================================== */
(function () {
  "use strict";

  var HASH_ROUTE = /^#\/?/;            // #/settings, #settings
  var TRACKERS = [
    /^(utm_|gclid|fbclid|msclkid|dclid|mc_|ref_?src$)/i,
    /^igshid$/i, /^yclid$/i, /^twclid$/i, /^_tt/i, /^srsltid$/i
  ];
  var BASENAME = /(^|\/)index\.html?$/; // /docs/index.html -> /docs/

  function isTracker(key) { return TRACKERS.some(function (rx) { return rx.test(key); }); }

  /** Monta a forma limpa de uma URL deste site. */
  function clean(input) {
    var url;
    try {
      url = new URL(input, location.origin);
    } catch (e) { return input; }
    if (url.origin !== location.origin) return input; // só domínio próprio

    var out = url;

    // 1) rota em hash vira path real: /#/settings -> /settings
    if (HASH_ROUTE.test(out.hash)) {
      var path = out.hash.replace(HASH_ROUTE, "/");
      out = new URL(path + out.search, location.origin);
    } else if (out.hash) {
      out = new URL(out.pathname + out.search, location.origin); // âncoras internas de conteúdo mantidas fora
    }

    // 2) index.html e barras duplicadas somem
    out.pathname = out.pathname.replace(BASENAME, "/").replace(/\/{2,}/g, "/");

    // 3) trackers de campanha saem da URL
    var hadTrackers = false;
    Array.from(out.searchParams.keys()).forEach(function (k) {
      if (isTracker(k)) { out.searchParams.delete(k); hadTrackers = true; }
    });
    if (hadTrackers) out.search = out.search; // re-serializa

    return out.toString();
  }

  /** Normaliza a URL atual sem recarregar nem poluir o histórico. */
  function applyNow() {
    var cleaned = clean(location.href);
    if (cleaned !== location.href) {
      history.replaceState(history.state, "", cleaned);
      return true;
    }
    return false;
  }

  /** Intercepta cliques internos: navegação com pushState (sem hash, sem flash). */
  function bindLinks(root) {
    (root || document).addEventListener("click", function (ev) {
      if (ev.defaultPrevented || ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
      var a = ev.target.closest && ev.target.closest("a[href]");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      var href = a.getAttribute("href") || "";
      if (href.startsWith("mailto:") || href.startsWith("tel:")) return;
      var url = new URL(a.href, location.origin);
      if (url.origin !== location.origin) return; // domínio alheio: deixa o browser agir
      if (url.pathname === location.pathname && url.search === location.search) {
        if (url.hash) return; // âncora de conteúdo na mesma página
        ev.preventDefault();
        history.replaceState(history.state, "", clean(a.href));
        return;
      }
      // navegação interna: URL limpa garantida antes do push
      ev.preventDefault();
      history.pushState({ dt: Date.now() }, "", clean(a.href));
      location.reload(); // sites estáticos multi-página: reload garante título/foco/scroll corretos
    });
  }

  /** Sincroniza <link rel=canonical> e og:url com a URL limpa (SEO, compartilhamento). */
  function syncCanonical() {
    var l = document.querySelector('link[rel="canonical"]');
    if (l) l.setAttribute("href", location.origin + location.pathname);
    var og = document.querySelector('meta[property="og:url"]');
    if (og) og.setAttribute("content", location.origin + location.pathname);
  }

  var DTURL = { clean: clean, applyNow: applyNow, bindLinks: bindLinks, syncCanonical: syncCanonical };

  DTURL.applyNow();          // limpa o que veio de campanha/redirect antigo
  DTURL.syncCanonical();
  document.addEventListener("DOMContentLoaded", function () { bindLinks(document); });
  window.addEventListener("popstate", DTURL.applyNow);

  window.DTURL = DTURL;
})();
