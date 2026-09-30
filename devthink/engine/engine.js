/* ==========================================================================
   DEVTHINK ENGINE.JS — runtime mínimo dos sites (zero dependência)
   Reveal on scroll, tema light/dark persistido, toast, ano do footer.
   ========================================================================== */
(function () {
  "use strict";

  // Reveal on scroll (riseIn)
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });

  // Tema: dark (sol) por padrão; light persistido
  try {
    var saved = localStorage.getItem("dt-theme");
    if (saved === "light") document.documentElement.setAttribute("data-theme", "light");
  } catch (e) { /* storage indisponível: segue dark */ }
  window.DTTheme = {
    toggle: function () {
      var el = document.documentElement;
      var light = el.getAttribute("data-theme") === "light";
      if (light) el.removeAttribute("data-theme"); else el.setAttribute("data-theme", "light");
      try { localStorage.setItem("dt-theme", light ? "dark" : "light"); } catch (e) {}
    },
    current: function () { return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark"; }
  };
  document.querySelectorAll("[data-action=toggle-theme]").forEach(function (btn) {
    btn.addEventListener("click", window.DTTheme.toggle);
  });

  // Toast (feedback de ações)
  window.DTToast = function (msg, kind) {
    var t = document.createElement("div");
    t.className = "glass";
    t.setAttribute("role", "status");
    t.style.cssText = "position:fixed;bottom:22px;left:50%;transform:translateX(-50%);padding:12px 20px;border-radius:14px;z-index:999;font-size:.9rem;font-weight:650;color:var(--sol-text);box-shadow:var(--sh-3)";
    if (kind === "success") t.style.borderColor = "color-mix(in srgb, var(--sol-success) 60%, transparent)";
    if (kind === "error") t.style.borderColor = "color-mix(in srgb, var(--sol-error) 60%, transparent)";
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { t.style.opacity = "0"; t.style.transition = "opacity .25s"; }, 2600);
    setTimeout(function () { t.remove(); }, 3000);
  };

  // Ano do footer
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
})();
